/**
 * 可达判据 —— 全仓唯一的一份。
 *
 * 从种子 / 火星地板 / R10 一次性输入出发，逐条路线检查全部字段，跑到不动点。
 * 本文件只计算与导出事实：不打印、不读 argv、不碰文件系统。闸门在 `tools/audit.ts`，
 * 查询在 `tools/query.ts`；两边都从这里取同一份快照。
 */

import { covers, needItems, propCovers, resolveItemRef } from '../../src/core/describe.ts';
import { model, ONE_TIME } from './index.ts';
import type {
  Condition,
  Description,
  Item,
  PropDecl,
  PropReq,
  Route,
} from '../../src/core/describe.ts';

type Window = PropReq;

export const FAILURE_CODES = [
  'NO_OUTPUT',
  'MISSING_INPUT',
  'UNMET_OPTION_NEED',
  'MISSING_NEED',
  'MISSING_PERFORMER',
  'MISSING_STEP_PERFORMER',
  'MISSING_HOLDER',
  'DESIGN_CONDITION',
  'MISSING_COMPONENT',
  'UNMET_COMPONENT_NEED',
  'UNKNOWN_COMPONENT_PROP',
  'BAD_COMPONENT_NEED',
  'MISSING_EQUIPMENT',
  'UNMET_EQUIPMENT_NEED',
  'BAD_EQUIPMENT_REQUIRE',
  'DEFERRED_PRODUCT',
] as const;

export type FailureCode = (typeof FAILURE_CODES)[number];

export interface Failure {
  readonly code: FailureCode;
  readonly detail: string;
}

export interface BlockedRoute {
  readonly id: string;
  readonly products: readonly string[];
  readonly failures: readonly Failure[];
  /** frontier = 产物还不可达；alternative = 产物可由别的路线得到；outside = 两端都不在闭包内。 */
  readonly kind: 'frontier' | 'alternative' | 'outside';
}

export interface SeedReport {
  readonly id: string;
  readonly replicable: boolean;
  readonly producers: readonly {
    readonly id: string;
    readonly usable: boolean;
    /** 这条路线是干净可用（没有靠 kept 放宽）还是降级可用。 */
    readonly clean: boolean;
    /** 可用路线交付的窗口是否覆盖种子自己的 props（同规格复制）。 */
    readonly specOk: boolean;
    /** 种子 composedOf 的每个零件是否有非 design 的可用窗口。 */
    readonly componentsOk: boolean;
    readonly failures: readonly Failure[];
  }[];
}

/** 一处被接受的降级：哪个挂点、要什么、当时只有什么。 */
export interface KeptSite {
  readonly where: 'uses' | 'composedOf' | 'needs';
  readonly item: string;
  readonly param: string;
  readonly need: string;
  readonly available: readonly string[];
}

/** 只在降级下造出来的条目；后来升级干净的会从清单里移除。 */
export interface DegradedItem {
  readonly id: string;
  readonly category: string;
  /** 让它第一次可用的路线。 */
  readonly route: string;
  /** 第一次可用的轮次（0 = 给定）。 */
  readonly firstRound: number;
  readonly sites: readonly KeptSite[];
}

/** 明标 deferred 的条目；其产出路线被阻断，不得视为可制造。 */
export interface DeferredItem {
  readonly id: string;
  readonly category: string;
}

/** 一项联产产物：哪条路线产出它、哪个条目没有去处。 */
export interface CoproductTerm {
  readonly route: string;
  readonly item: string;
}

/**
 * 联产报告 —— **只报告，不进 passed**。
 *
 * 判据是结构性的：一条路线 `produces` 多项时，主产物之外的任一项在整库没有
 * 任何引用，就算“无去处”。引用范围见 `analyzeCoproducts`；路线自己的 `produces` 不算。
 */
export interface CoproductReport {
  /** 多产物路线数（`measure/*` 不计）。 */
  readonly routes: number;
  /** 这些路线上的联产项（不含 `produces[0]` 主产物），按 route + item 去重后的数量。 */
  readonly terms: number;
  readonly unclaimed: readonly CoproductTerm[];
}

interface RouteEval {
  readonly failures: readonly Failure[];
  readonly kept: readonly KeptSite[];
}

/** 一处严格交付窗口：谁给的、当时是什么状态。 */
export interface DeliveredWindow {
  readonly window: Window;
  /** `given`（种子 / 火星地板 / R10 输入）或产出它的路线 id。 */
  readonly source: string;
  readonly state: 'given' | 'clean' | 'degraded';
  readonly design: boolean;
}

/**
 * 查询所需的事实快照。`windows` 只含**严格可用**的交付窗口；`designWindows`
 * 单独存放，只用于解释“为什么不算满足”，不参与判定。
 */
export interface ReachFacts {
  readonly given: ReadonlySet<string>;
  readonly available: ReadonlySet<string>;
  readonly clean: ReadonlySet<string>;
  readonly windows: ReadonlyMap<string, readonly DeliveredWindow[]>;
  readonly designWindows: ReadonlyMap<string, readonly DeliveredWindow[]>;
  /** 路线可用时的 kept 站点；后来升级干净的路线也会保留（为空即删除）。 */
  readonly keptByRoute: ReadonlyMap<string, readonly KeptSite[]>;
  /** 条目第一次可用的路线；给定条目没有。 */
  readonly firstRoute: ReadonlyMap<string, string>;
  /** 条目第一次由干净路线可用的路线；没有干净路线时缺省。 */
  readonly cleanRoute: ReadonlyMap<string, string>;
  readonly firstRound: ReadonlyMap<string, number>;
  readonly cleanRound: ReadonlyMap<string, number>;
}

/** 一处不合规的 `record` 出处；记录不是读数时，引用它的窗口不算交付。 */
export interface RecordProblem {
  /** `record` 指向的条目 id。 */
  readonly record: string;
  /** 引用位置：路线 / 条目 / ambient。 */
  readonly where: string;
  readonly reason:
    | 'missing-item'
    | 'not-measure'
    | 'unreachable-record'
    | 'window-not-covered'
    | 'design-and-record';
  readonly detail: string;
}

/** 一次扩散的完整结果：闸门用 `result`，查询用 `facts`。 */
export interface Reach {
  readonly result: AuditResult;
  readonly facts: ReachFacts;
}

export interface AuditResult {
  readonly passed: boolean;
  /** 命令行声明的轮次；只改输出描述，不参与判定。 */
  readonly round?: 'correction' | 'supplement';
  /** 未验证的交付窗口数（design give）。 */
  readonly designGives: number;
  /** 未验证的 design 条件数（路线条件、需求、holds、ambient）。 */
  readonly designConditions: number;
  /** `record` 出处问题；非空即不放行。 */
  readonly recordProblems: readonly RecordProblem[];
  readonly start: {
    readonly seeds: readonly string[];
    readonly floor: readonly string[];
    /** R10 已批准的一次性输入；只含输入本身，不含下游。 */
    readonly oneTime: readonly string[];
  };
  readonly model: {
    readonly items: number;
    readonly routes: number;
    readonly errors: number;
    readonly notes: number;
  };
  /** 全库测量链：测量路线声称的量，执行机器有没有对应能力/量程。 */
  readonly measure: {
    readonly noCap: number;
    readonly capShort: number;
    readonly condShort: number;
    readonly total: number;
  };
  /** 只在降级路线下可用、且到现在仍没有干净路线的条目。 */
  readonly degraded: readonly DegradedItem[];
  /** 明标 deferred 的条目；其产出路线被阻断，不得视为可制造。 */
  readonly deferred: readonly DeferredItem[];
  /** 先降级造出来、后来升级干净的条目。 */
  readonly upgradedItems: readonly string[];
  /** 先降级造出来、后来升级干净的条目数。 */
  readonly upgraded: number;
  /** 联产：多产物路线里没有去处的联产项。只报告，不影响 passed。 */
  readonly coproducts: CoproductReport;
  readonly rounds: number;
  readonly reachable: {
    readonly items: number;
    readonly total: number;
    readonly machines: number;
    readonly machinesTotal: number;
    readonly unavailable: readonly {
      readonly id: string;
      readonly category: string;
      readonly producers: readonly string[];
    }[];
  };
  readonly routes: {
    readonly total: number;
    readonly usable: readonly string[];
    /** usable 里没有靠 kept 放宽的那部分。 */
    readonly clean: readonly string[];
    readonly blocked: readonly BlockedRoute[];
  };
  readonly seeds: readonly SeedReport[];
  readonly warnings: readonly string[];
}

const data = model.data;
const concreteItems = data.items.filter((it) => it.interface !== true);
const itemById = new Map(data.items.map((it) => [it.id, it] as const));
const routeById = new Map(data.routes.map((r) => [r.id, r] as const));

const itemOf = (id: string): Item | undefined => itemById.get(id);
const isMachine = (id: string): boolean => itemOf(id)?.category === 'machine';
const declOf = (itemId: string, param: string): PropDecl | undefined =>
  (itemOf(itemId)?.props ?? []).find((p) => p.param === param);

const failureKey = (f: Failure): string => `${f.code}\u0000${f.detail}`;

const addFailure = (list: Failure[], code: FailureCode, detail: string): void => {
  const f: Failure = { code, detail };
  const key = failureKey(f);
  if (!list.some((x) => failureKey(x) === key)) list.push(f);
};

const sortFailures = (list: readonly Failure[]): Failure[] =>
  [...list].sort((a, b) => a.code.localeCompare(b.code) || a.detail.localeCompare(b.detail));

/** 窗口的可读写法；只给人看，不参与比较。 */
const fmtReq = (w: PropReq): string => {
  if (w.kind === 'range') {
    const lo = w.min === undefined ? '−∞' : String(w.min);
    const hi = w.max === undefined ? '+∞' : String(w.max);
    return `${w.param} ${lo}–${hi}`;
  }
  if (w.kind === 'enum') return `${w.param} ∈{${w.oneOf.join('/')}}`;
  return `${w.param} ⊇{${(w.atLeast ?? []).join('/')}}`;
};

/** 这两个字段 core 的 validate 不查形状；严格审计自己查。 */
const badWindow = (w: PropReq): string | undefined => {
  if (w.kind === 'range') {
    const min = w.min ?? Number.NEGATIVE_INFINITY;
    const max = w.max ?? Number.POSITIVE_INFINITY;
    if (min > max) return `${w.param} 窗口不成立`;
  } else if (w.kind === 'enum' && w.oneOf.length === 0) {
    return `${w.param} 的 oneOf 为空`;
  }
  return undefined;
};

/** 一个窗口的稳定键：只关心规格，不关心 record/design。 */
const windowKey = (w: Window): string => {
  if (w.kind === 'range') {
    return `r|${w.param}|${w.min ?? ''}|${w.max ?? ''}|${w.dir ?? 'within'}`;
  }
  if (w.kind === 'enum') {
    return `e|${w.param}|${[...w.oneOf].sort().join(',')}`;
  }
  return `s|${w.param}|${[...(w.atLeast ?? [])].sort().join(',')}`;
};

/** 给定条目的 props 是“现场已有的窗口”。set 声明只表示可选组分，不保证某一组分在场。 */
const givenWindowOf = (p: PropDecl): Window | undefined => {
  if (p.kind === 'range') {
    return { param: p.param, kind: 'range', min: p.min, max: p.max, dir: p.dir };
  }
  if (p.kind === 'enum') {
    return { param: p.param, kind: 'enum', oneOf: p.values };
  }
  return undefined;
};

/** 所有路线都按同一张表判；没有“先试这条、不行再换”的捷径。 */
const evaluateRoute = (
  route: Route,
  available: ReadonlySet<string>,
  windows: ReadonlyMap<string, readonly DeliveredWindow[]>,
  designWindows: ReadonlyMap<string, readonly DeliveredWindow[]>,
): RouteEval => {
  const failures: Failure[] = [];
  const kept: KeptSite[] = [];

  const designCovers = (item: string, need: PropReq): boolean =>
    (designWindows.get(item) ?? []).some((give) => propCovers(give.window, need));
  const availableWindows = (item: string, param: string): readonly string[] =>
    (windows.get(item) ?? [])
      .filter((entry) => entry.window.param === param)
      .slice(0, 4)
      .map((entry) => fmtReq(entry.window));
  const unmetLabel = (item: string, unmet: readonly PropReq[]): string => {
    const suffix = unmet.some((need) => designCovers(item, need))
      ? '（仅有 design 窗口，不算满足）'
      : '';
    return `${unmet.map((need) => need.param).join(', ')}${suffix}`;
  };

  if (route.produces.length === 0) {
    addFailure(failures, 'NO_OUTPUT', 'produces 为空 —— 路线没有产物');
  }

  for (const term of route.produces) {
    const item = itemOf(term.item);
    if (item?.deferred === true) {
      addFailure(
        failures,
        'DEFERRED_PRODUCT',
        `${term.item} 标为 deferred，不能由路线产出`,
      );
    }
  }

  // 前提与执行者：存在即可，但必须是**已可达**的存在。
  for (const need of needItems(route.needs)) {
    if (!available.has(need)) {
      addFailure(failures, 'MISSING_NEED', `needs 缺 ${need}`);
    }
  }
  if (route.performedBy !== undefined && !available.has(route.performedBy)) {
    addFailure(failures, 'MISSING_PERFORMER', `performedBy 缺 ${route.performedBy}`);
  }
  for (const [i, step] of (route.steps ?? []).entries()) {
    if (step.performedBy !== undefined && !available.has(step.performedBy)) {
      addFailure(
        failures,
        'MISSING_STEP_PERFORMER',
        `steps[${i}] 执行者缺 ${step.performedBy}`,
      );
    }
  }

  // uses：每个子句至少有一个选项在场，且该选项的 need 全部被已可达窗口盖住。
  for (const [ci, clause] of route.uses.entries()) {
    const availableOptions = clause.anyOf.filter((o) => available.has(o.item));
    if (availableOptions.length === 0) {
      addFailure(
        failures,
        'MISSING_INPUT',
        `uses[${ci}] 无可用选项：${clause.anyOf.map((o) => o.item).join(' / ')}`,
      );
      continue;
    }

    let best: { readonly item: string; readonly unmet: readonly PropReq[] } | undefined;
    let keptBest: { readonly item: string; readonly unmet: readonly PropReq[] } | undefined;
    let usable = false;
    for (const opt of availableOptions) {
      const unmet = (opt.need ?? []).filter((need) => {
        const list = windows.get(opt.item) ?? [];
        return !list.some((entry) => propCovers(entry.window, need));
      });
      if (unmet.length === 0) {
        usable = true;
        break;
      }
      if (best === undefined || unmet.length < best.unmet.length) {
        best = { item: opt.item, unmet };
      }
      if (
        opt.onRelax === 'functional-kept' &&
        (keptBest === undefined || unmet.length < keptBest.unmet.length)
      ) {
        keptBest = { item: opt.item, unmet };
      }
    }
    if (!usable) {
      if (keptBest !== undefined) {
        for (const need of keptBest.unmet) {
          kept.push({
            where: 'uses',
            item: keptBest.item,
            param: need.param,
            need: fmtReq(need),
            available: availableWindows(keptBest.item, need.param),
          });
        }
      } else if (best !== undefined) {
        addFailure(
          failures,
          'UNMET_OPTION_NEED',
          `uses[${ci}] ← ${best.item} 缺 ${unmetLabel(best.item, best.unmet)}`,
        );
      }
    }
  }

  // 前提的规格窗口：performedBy 只指名，needs 的 Option 才能挂窗口。
  for (const [ni, need] of route.needs.entries()) {
    if (typeof need === 'string') continue;
    const wantedReqs = need.need ?? [];
    if (wantedReqs.length === 0) continue;
    const target = itemOf(need.item);
    if (target === undefined) {
      addFailure(failures, 'BAD_EQUIPMENT_REQUIRE', `needs[${ni}] 未知条目 ${need.item}`);
      continue;
    }
    if (need.onRelax !== 'functional-kept' && need.onRelax !== 'functional-lost') {
      addFailure(failures, 'BAD_EQUIPMENT_REQUIRE', `needs[${ni}] ${need.item} 缺 onRelax`);
    }
    for (const wanted of wantedReqs) {
      const decl = declOf(need.item, wanted.param);
      if (decl === undefined) {
        addFailure(
          failures,
          'BAD_EQUIPMENT_REQUIRE',
          `needs[${ni}] ${need.item} 未声明属性 ${wanted.param}`,
        );
        continue;
      }
      if (decl.kind !== wanted.kind) {
        addFailure(
          failures,
          'BAD_EQUIPMENT_REQUIRE',
          `needs[${ni}] ${need.item} 的 ${wanted.param} 声明为 ${decl.kind}，要求写成 ${wanted.kind}`,
        );
        continue;
      }
      const bad = badWindow(wanted);
      if (bad !== undefined) {
        addFailure(failures, 'BAD_EQUIPMENT_REQUIRE', `needs[${ni}] ${need.item} 的 ${bad}`);
      }
    }
    if (!available.has(need.item)) {
      addFailure(failures, 'MISSING_EQUIPMENT', `needs[${ni}] 缺设备 ${need.item}`);
      continue;
    }
    const unmet = wantedReqs.filter((wanted) => {
      const list = windows.get(need.item) ?? [];
      return !list.some((entry) => propCovers(entry.window, wanted));
    });
    if (unmet.length > 0) {
      if (need.onRelax === 'functional-kept') {
        for (const wanted of unmet) {
          kept.push({
            where: 'needs',
            item: need.item,
            param: wanted.param,
            need: fmtReq(wanted),
            available: availableWindows(need.item, wanted.param),
          });
        }
      } else {
        addFailure(
          failures,
          'UNMET_EQUIPMENT_NEED',
          `needs[${ni}] ← ${need.item} 缺 ${unmetLabel(need.item, unmet)}`,
        );
      }
    }
  }

  // 装配：composedOf 是定义，也是这一条路线的零件输入。
  for (const term of route.produces) {
    const item = itemOf(term.item);
    if (item === undefined) continue; // 由 validate 报 unknown_item
    for (const comp of item.composedOf ?? []) {
      let componentId: string;
      try {
        componentId = resolveItemRef(comp.item, comp.select, itemById);
      } catch (e) {
        addFailure(
          failures,
          'MISSING_COMPONENT',
          `${term.item} 缺零件 ${comp.item}: ${e instanceof Error ? e.message : String(e)}`,
        );
        continue;
      }
      if (!available.has(componentId)) {
        addFailure(
          failures,
          'MISSING_COMPONENT',
          `${term.item} 缺零件 ${componentId}`,
        );
        continue;
      }
      for (const wanted of comp.need ?? []) {
        const decl = declOf(componentId, wanted.param);
        if (decl === undefined) {
          addFailure(
            failures,
            'UNKNOWN_COMPONENT_PROP',
            `${componentId} 未声明属性 ${wanted.param}`,
          );
          continue;
        }
        if (decl.kind !== wanted.kind) {
          addFailure(
            failures,
            'UNKNOWN_COMPONENT_PROP',
            `${componentId} 的 ${wanted.param} 声明为 ${decl.kind}，要求写成 ${wanted.kind}`,
          );
          continue;
        }
        const bad = badWindow(wanted);
        if (bad !== undefined) {
          addFailure(
            failures,
            'BAD_COMPONENT_NEED',
            `${term.item} ← ${componentId} 的 ${bad}`,
          );
          continue;
        }
        const list = windows.get(componentId) ?? [];
        if (!list.some((entry) => propCovers(entry.window, wanted))) {
          if (comp.onRelax === 'functional-kept') {
            kept.push({
              where: 'composedOf',
              item: componentId,
              param: wanted.param,
              need: fmtReq(wanted),
              available: availableWindows(componentId, wanted.param),
            });
          } else {
            addFailure(
              failures,
              'UNMET_COMPONENT_NEED',
              `${term.item} ← ${componentId} 缺 ${unmetLabel(componentId, [wanted])}`,
            );
          }
        }
      }
    }
  }

  /**
   * 条件：环境可满足，或候选设备（本段执行者 + 路线 needs）里有一台已可达的设备 holds 住。
   * 候选范围与 core 的 checkConditions 一致；不做事后全局搜索。
   */
  const checkConditions = (
    conditions: readonly Condition[],
    performer: string | undefined,
    label: string,
  ): void => {
    for (const condition of conditions) {
      const overlaps = (a: Condition): boolean =>
        a.param === condition.param &&
        a.max >= condition.min &&
        a.min <= condition.max;

      if (condition.design === true) {
        addFailure(
          failures,
          'DESIGN_CONDITION',
          `${label} ${condition.param} [${condition.min}, ${condition.max}] 明确标了 design，不算满足`,
        );
        continue;
      }

      const byAmbient = (data.ambient ?? []).some(
        (a) => a.design !== true && overlaps(a),
      );
      if (byAmbient) continue;

      const candidates = [performer, ...needItems(route.needs)]
        .filter((x): x is string => x !== undefined)
        .map((id) => itemOf(id))
        .filter(
          (x): x is Item =>
            x !== undefined && x.category === 'machine' && available.has(x.id),
        );
      const holder = candidates.find((m) =>
        (m.holds ?? []).some((h) => h.design !== true && covers(h, condition)),
      );
      if (holder === undefined) {
        const designHolder = candidates.some((m) =>
          (m.holds ?? []).some((h) => h.design === true && covers(h, condition)),
        );
        const designAmbient = (data.ambient ?? []).some(
          (a) => a.design === true && overlaps(a),
        );
        const why = designHolder
          ? '只有 design 承担者，不算满足'
          : designAmbient
            ? 'ambient 是 design，不算满足'
            : '没有可用承担者';
        addFailure(
          failures,
          'MISSING_HOLDER',
          `${label} ${condition.param} [${condition.min}, ${condition.max}] ${why}`,
        );
      }
    }
  };

  checkConditions(route.under ?? [], route.performedBy, 'under');
  for (const [si, step] of (route.steps ?? []).entries()) {
    checkConditions(step.under ?? [], step.performedBy, `steps[${si}].under`);
  }

  return { failures: sortFailures(failures), kept };
};

/** 路线的“需要的东西”，只用于判断它是不是闭包前沿；不用它判可行性。 */
const requiredItemsOf = (route: Route): readonly string[] => {
  const out = new Set<string>();
  for (const clause of route.uses) for (const opt of clause.anyOf) out.add(opt.item);
  for (const need of needItems(route.needs)) out.add(need);
  if (route.performedBy !== undefined) out.add(route.performedBy);
  for (const step of route.steps ?? []) {
    if (step.performedBy !== undefined) out.add(step.performedBy);
  }
  for (const term of route.produces) {
    for (const comp of itemOf(term.item)?.composedOf ?? []) out.add(comp.item);
  }
  return [...out];
};

const propagate = (invalidGiveWhere: ReadonlySet<string> = new Set<string>()): {
  readonly rounds: number;
  readonly given: Set<string>;
  readonly available: Set<string>;
  readonly clean: Set<string>;
  readonly windows: Map<string, DeliveredWindow[]>;
  readonly designWindows: Map<string, DeliveredWindow[]>;
  readonly usable: Set<string>;
  readonly cleanRoutes: Set<string>;
  readonly degraded: Map<string, { route: string; sites: readonly KeptSite[]; firstRound: number }>;
  readonly firstRoute: Map<string, string>;
  readonly cleanRoute: Map<string, string>;
  readonly keptByRoute: Map<string, readonly KeptSite[]>;
  readonly firstRound: Map<string, number>;
  readonly cleanRound: Map<string, number>;
} => {
  const given = new Set<string>([...model.seedIds, ...model.marsIds, ...ONE_TIME]);

  const available = new Set<string>(given);
  const clean = new Set<string>(given);
  /** 只放**能算满足**的窗口：design 的 give 不进来。 */
  const windows = new Map<string, DeliveredWindow[]>();
  /** 明确 design 的 give，只用于解释“为什么不满足”。 */
  const designWindows = new Map<string, DeliveredWindow[]>();

  /** 记一个窗口；同一窗口保留状态更好的来源（clean 胜过 degraded）。 */
  const remember = (
    map: Map<string, DeliveredWindow[]>,
    item: string,
    entry: DeliveredWindow,
  ): boolean => {
    const key = windowKey(entry.window);
    const list = map.get(item) ?? [];
    const index = list.findIndex((x) => windowKey(x.window) === key);
    if (index < 0) {
      list.push(entry);
      map.set(item, list);
      return true;
    }
    const existing = list[index]!;
    if (existing.state !== 'clean' && entry.state === 'clean') {
      list[index] = { ...existing, source: entry.source, state: entry.state };
    }
    return false;
  };

  const addWindow = (
    item: string,
    window: Window,
    source: string,
    state: DeliveredWindow['state'],
  ): boolean => {
    const entry: DeliveredWindow = {
      window,
      source,
      state,
      design: window.design === true,
    };
    if (window.design === true) {
      remember(designWindows, item, entry);
      return false;
    }
    return remember(windows, item, entry);
  };

  for (const id of given) {
    for (const prop of itemOf(id)?.props ?? []) {
      const window = givenWindowOf(prop);
      if (window !== undefined) addWindow(id, window, 'given', 'given');
    }
  }

  const usable = new Set<string>();
  const cleanRoutes = new Set<string>();
  const degraded = new Map<string, { route: string; sites: readonly KeptSite[]; firstRound: number }>();
  const firstRoute = new Map<string, string>();
  const cleanRoute = new Map<string, string>();
  const keptByRoute = new Map<string, readonly KeptSite[]>();
  const firstRound = new Map<string, number>();
  const cleanRound = new Map<string, number>();
  for (const id of given) {
    firstRound.set(id, 0);
    cleanRound.set(id, 0);
  }

  /** 一条路线可用了：登记产物、窗口，以及它是干净还是降级。 */
  const applyProducts = (
    route: Route,
    kept: readonly KeptSite[],
    round: number,
    invalidGives: ReadonlySet<string>,
  ): boolean => {
    let changed = false;
    const isClean = kept.length === 0;
    if (kept.length > 0) keptByRoute.set(route.id, kept);
    else keptByRoute.delete(route.id);
    if (isClean && !cleanRoutes.has(route.id)) {
      cleanRoutes.add(route.id);
      changed = true;
    }
    for (const [ti, term] of route.produces.entries()) {
      if (!available.has(term.item)) {
        available.add(term.item);
        firstRoute.set(term.item, route.id);
        changed = true;
      }
      if (!firstRound.has(term.item)) {
        firstRound.set(term.item, round);
        changed = true;
      }
      if (isClean) {
        if (!clean.has(term.item)) {
          clean.add(term.item);
          cleanRoute.set(term.item, route.id);
          changed = true;
        }
        if (!cleanRound.has(term.item)) {
          cleanRound.set(term.item, round);
          changed = true;
        }
        if (degraded.has(term.item)) {
          degraded.delete(term.item);
          changed = true;
        }
      } else if (!clean.has(term.item)) {
        const existing = degraded.get(term.item);
        if (existing === undefined) {
          degraded.set(term.item, {
            route: route.id,
            sites: kept,
            firstRound: firstRound.get(term.item) ?? round,
          });
          changed = true;
        } else if (existing.route === route.id && existing.sites !== kept) {
          // 同一路线后来补上了部分窗口：降级站点要跟着当前判定走，不能停在首轮。
          degraded.set(term.item, { ...existing, sites: kept });
        }
      }
      for (const [gi, give] of (term.gives ?? []).entries()) {
        const where = `${route.id}.produces[${ti}].gives[${gi}]`;
        if (invalidGives.has(where)) continue; // 记录不合规：窗口不算交付
        if (addWindow(term.item, give, route.id, isClean ? 'clean' : 'degraded')) changed = true;
      }
    }
    return changed;
  };

  let changed = true;
  let rounds = 0;
  while (changed) {
    changed = false;
    rounds += 1;
    for (const route of data.routes) {
      if (cleanRoutes.has(route.id)) continue; // 干净路线不会退化
      const { failures, kept } = evaluateRoute(route, available, windows, designWindows);
      if (failures.length > 0) continue;
      if (!usable.has(route.id)) {
        usable.add(route.id);
        changed = true;
      }
      if (applyProducts(route, kept, rounds, invalidGiveWhere)) changed = true;
    }
    if (rounds > data.routes.length + 10) {
      throw new Error(`扩散 ${rounds} 轮仍未收敛 —— 路线表可能有环或判定不单调`);
    }
  }

  return {
    rounds,
    given,
    available,
    clean,
    windows,
    designWindows,
    usable,
    cleanRoutes,
    degraded,
    firstRoute,
    cleanRoute,
    keptByRoute,
    firstRound,
    cleanRound,
  };
};

/**
 * 联产：一条路线产出多项时，主产物之外的任一项在整库没有任何引用，就算“无去处”。
 *
 * 引用范围：uses 选项、composedOf 零件、needs、performedBy / steps[].performedBy、
 * Item.consumption，外加种子 / 火星地板 / R10 一次性输入。
 * 路线自己的 produces 不算 —— 否则每条路线都能证明自己有用。
 * 去处只按“有没有引用”算，不追究引用方是否可达 —— 那是可达性判据的事。
 *
 * 只看联产：`produces[0]` 是批次主产物，它没有去处是“无主条目”，不在本报告里。
 * `measure/*` 不参与：它的产物是测量对象与记录，记录按设计只产不用（R13）。
 *
 * **只报告**：不进 passed，也不改退出码。联产不是错误；R2 的四项完整性是另一层判据。
 */
const analyzeCoproducts = (): CoproductReport => {
  const referenced = new Set<string>();

  for (const route of data.routes) {
    for (const clause of route.uses) {
      for (const option of clause.anyOf) referenced.add(option.item);
    }
    for (const need of needItems(route.needs)) referenced.add(need);
    if (route.performedBy !== undefined) referenced.add(route.performedBy);
    for (const step of route.steps ?? []) {
      if (step.performedBy !== undefined) referenced.add(step.performedBy);
    }
  }
  for (const item of data.items) {
    for (const component of item.composedOf ?? []) referenced.add(component.item);
    for (const consumption of item.consumption ?? []) referenced.add(consumption.item);
  }
  for (const id of model.seedIds) referenced.add(id);
  for (const id of model.marsIds) referenced.add(id);
  for (const id of ONE_TIME) referenced.add(id);

  let routes = 0;
  let terms = 0;
  const unclaimed: CoproductTerm[] = [];
  for (const route of data.routes) {
    if (route.produces.length <= 1) continue;
    if (route.id.startsWith('measure/')) continue; // 记录是终端证据，不按联产算
    routes += 1;
    const main = route.produces[0]?.item;
    const seen = new Set<string>();
    for (const [index, term] of route.produces.entries()) {
      if (index === 0 || term.item === main || seen.has(term.item)) continue;
      seen.add(term.item);
      terms += 1;
      if (!referenced.has(term.item)) unclaimed.push({ route: route.id, item: term.item });
    }
  }
  return { routes, terms, unclaimed };
};

/** design 的唯一定义：哪些路线带未验证窗口，以及它们的计数。 */
export interface DesignFacts {
  /** 含 design 交付、路线条件或需求条件的路线（排序后）。 */
  readonly routes: readonly string[];
  /** 路线 `under` / `steps[].under` 里的 design 条件数。 */
  readonly routeConditions: number;
  /** `uses[].anyOf[].need` / `needs[].need` 里的 design 条件数。 */
  readonly requirements: number;
  /** design 交付窗口数。 */
  readonly gives: number;
  /** 路线条件 + 需求条件 + `composedOf[].need` + `holds` + `ambient`。 */
  readonly allConditions: number;
}

/**
 * 扫描 design 标记。views、query 与闸门共用这一份，不再各算一遍。
 *
 * design 出现在四处：交付窗口（gives）、路线条件（under / steps[].under）、
 * 需求条件（uses / needs / composedOf 的 need）、承担者条件（holds / ambient）。
 * 全部进入闸门；放在 `need` 上的 design 不再静默无效。
 */
export function scanDesign(input: Description = data): DesignFacts {
  const routes = new Set<string>();
  let routeConditions = 0;
  let requirements = 0;
  let gives = 0;

  /** 产出这些条目的路线要算进 design 路线：装配要求挂在条目上，不挂在路线上。 */
  const itemsWithDesignComponentNeed = new Set<string>();
  for (const item of input.items) {
    for (const component of item.composedOf ?? []) {
      for (const need of component.need ?? []) {
        if (need.design === true) {
          itemsWithDesignComponentNeed.add(item.id);
        }
      }
    }
  }

  for (const route of input.routes) {
    let has = false;
    for (const condition of route.under ?? []) {
      if (condition.design === true) {
        routeConditions += 1;
        has = true;
      }
    }
    for (const step of route.steps ?? []) {
      for (const condition of step.under ?? []) {
        if (condition.design === true) {
          routeConditions += 1;
          has = true;
        }
      }
    }
    for (const clause of route.uses) {
      for (const option of clause.anyOf) {
        for (const need of option.need ?? []) {
          if (need.design === true) {
            requirements += 1;
            has = true;
          }
        }
      }
    }
    for (const need of route.needs) {
      if (typeof need === 'string') continue;
      for (const required of need.need ?? []) {
        if (required.design === true) {
          requirements += 1;
          has = true;
        }
      }
    }
    for (const term of route.produces) {
      if (itemsWithDesignComponentNeed.has(term.item)) has = true;
      for (const give of term.gives ?? []) {
        if (give.design === true) {
          gives += 1;
          has = true;
        }
      }
    }
    if (has) routes.add(route.id);
  }

  let extraConditions = 0;
  for (const item of input.items) {
    for (const condition of item.holds ?? []) {
      if (condition.design === true) extraConditions += 1;
    }
    for (const component of item.composedOf ?? []) {
      for (const need of component.need ?? []) {
        if (need.design === true) extraConditions += 1;
      }
    }
  }
  for (const condition of input.ambient ?? []) {
    if (condition.design === true) extraConditions += 1;
  }

  return {
    routes: [...routes].sort(),
    routeConditions,
    requirements,
    gives,
    allConditions: routeConditions + requirements + extraConditions,
  };
}

/** 参数名可带量具前缀 `measure/`；记录条目未必带，比较时视为同名。 */
const sameParam = (a: string, b: string): boolean =>
  a === b || a.replace(/^measure\//, '') === b.replace(/^measure\//, '');

/** 把条目的属性声明写成窗口；记录校验用它和引用窗口比较。 */
const propReqFromDecl = (decl: PropDecl, param = decl.param): PropReq => {
  if (decl.kind === 'range') {
    return { param, kind: 'range', min: decl.min, max: decl.max, dir: decl.dir };
  }
  if (decl.kind === 'enum') {
    return { param, kind: 'enum', oneOf: decl.values };
  }
  return { param, kind: 'set', atLeast: decl.values };
};

type RecordRef =
  | {
      readonly kind: 'prop';
      readonly record: string;
      readonly where: string;
      readonly window: PropReq;
    }
  | {
      readonly kind: 'condition';
      readonly record: string;
      readonly where: string;
      readonly window: Condition;
    };

/** `where` 是否指向一条路线的交付窗口。 */
const isGiveWhere = (where: string): boolean =>
  where.includes('.produces[') && where.includes('.gives[');

/** 收集全部 `record` 指针；记录校验覆盖 give、need、under、holds、composedOf、ambient。 */
const collectRecordRefs = (input: Description): RecordRef[] => {
  const refs: RecordRef[] = [];
  const addProp = (where: string, window: PropReq): void => {
    if (window.record !== undefined) {
      refs.push({ record: window.record, where, window, kind: 'prop' });
    }
  };
  const addCondition = (where: string, window: Condition): void => {
    if (window.record !== undefined) {
      refs.push({ record: window.record, where, window, kind: 'condition' });
    }
  };

  for (const route of input.routes) {
    for (const [ui, clause] of route.uses.entries()) {
      for (const [oi, option] of clause.anyOf.entries()) {
        for (const [ni, need] of (option.need ?? []).entries()) {
          addProp(`${route.id}.uses[${ui}].anyOf[${oi}].need[${ni}]`, need);
        }
      }
    }
    for (const [ni, need] of route.needs.entries()) {
      if (typeof need === 'string') continue;
      for (const [ri, required] of (need.need ?? []).entries()) {
        addProp(`${route.id}.needs[${ni}].need[${ri}]`, required);
      }
    }
    for (const [ci, condition] of (route.under ?? []).entries()) {
      addCondition(`${route.id}.under[${ci}]`, condition);
    }
    for (const [si, step] of (route.steps ?? []).entries()) {
      for (const [ci, condition] of (step.under ?? []).entries()) {
        addCondition(`${route.id}.steps[${si}].under[${ci}]`, condition);
      }
    }
    for (const [ti, term] of route.produces.entries()) {
      for (const [gi, give] of (term.gives ?? []).entries()) {
        addProp(`${route.id}.produces[${ti}].gives[${gi}]`, give);
      }
    }
  }

  for (const item of input.items) {
    for (const [hi, condition] of (item.holds ?? []).entries()) {
      addCondition(`${item.id}.holds[${hi}]`, condition);
    }
    for (const [ci, component] of (item.composedOf ?? []).entries()) {
      for (const [ni, need] of (component.need ?? []).entries()) {
        addProp(`${item.id}.composedOf[${ci}].need[${ni}]`, need);
      }
    }
  }

  for (const [ai, condition] of (input.ambient ?? []).entries()) {
    addCondition(`ambient[${ai}]`, condition);
  }

  return refs;
};

/**
 * 校验 `record` 出处。四条同时成立才算读数：
 *   ① 记录条目存在；
 *   ② 由 `measure/*` 路线产出（`qual/*` 资格带不算读数）；
 *   ③ 记录条目当前可达；
 *   ④ 记录窗口落在被引用的窗口内（不得比设计窗口更宽）。
 *
 * 审计不替数据补记录；本函数把不合规的引用报出来。不合规的 give 还会从严格窗口
 * 剔除，避免它继续满足下游 need。
 */
export function scanRecordProblems(
  input: Description = data,
  available: ReadonlySet<string> = new Set(input.items.map((item) => item.id)),
): readonly RecordProblem[] {
  const itemById = new Map(input.items.map((item) => [item.id, item] as const));
  const producers = new Map<string, string[]>();
  for (const route of input.routes) {
    for (const term of route.produces) {
      const list = producers.get(term.item) ?? [];
      list.push(route.id);
      producers.set(term.item, list);
    }
  }

  const problems: RecordProblem[] = [];
  const add = (
    record: string,
    where: string,
    reason: RecordProblem['reason'],
    detail: string,
  ): void => {
    problems.push({ record, where, reason, detail });
  };

  for (const ref of collectRecordRefs(input)) {
    const item = itemById.get(ref.record);
    if (item === undefined) {
      add(ref.record, ref.where, 'missing-item', `记录条目 ${ref.record} 不存在`);
      continue;
    }

    const recordProducers = producers.get(ref.record) ?? [];
    if (!recordProducers.some((id) => id.startsWith('measure/'))) {
      add(
        ref.record,
        ref.where,
        'not-measure',
        recordProducers.length === 0
          ? `${ref.record} 没有任何产出路线`
          : `${ref.record} 的产出路线不是 measure/*：${recordProducers.join(', ')}`,
      );
    }
    if (!available.has(ref.record)) {
      add(ref.record, ref.where, 'unreachable-record', `${ref.record} 当前不可达`);
    }
    if (ref.window.design === true) {
      add(
        ref.record,
        ref.where,
        'design-and-record',
        `${ref.record} 同时标了 design 与 record；design 优先，记录不算满足`,
      );
      continue;
    }

    if (ref.kind === 'condition') {
      const decl = (item.props ?? []).find(
        (prop) => sameParam(prop.param, ref.window.param) && prop.kind === 'range',
      );
      if (decl === undefined || decl.kind !== 'range') {
        add(
          ref.record,
          ref.where,
          'window-not-covered',
          `${ref.record} 没有 ${ref.window.param} 的 range 声明`,
        );
      } else if ((decl.min ?? -Infinity) < ref.window.min || (decl.max ?? Infinity) > ref.window.max) {
        add(
          ref.record,
          ref.where,
          'window-not-covered',
          `${ref.record} 的 ${decl.min}–${decl.max} 超出 ${ref.window.min}–${ref.window.max}`,
        );
      }
      continue;
    }

    const decl = (item.props ?? []).find(
      (prop) => sameParam(prop.param, ref.window.param) && prop.kind === ref.window.kind,
    );
    if (decl === undefined) {
      add(
        ref.record,
        ref.where,
        'window-not-covered',
        `${ref.record} 没有 ${ref.window.param} 的同类型声明`,
      );
      continue;
    }
    const recordWindow = propReqFromDecl(decl, ref.window.param);
    if (!propCovers(ref.window, recordWindow)) {
      add(
        ref.record,
        ref.where,
        'window-not-covered',
        `${ref.record} 的 ${fmtReq(recordWindow)} 未落在 ${fmtReq(ref.window)} 内`,
      );
    }
  }

  return problems.sort(
    (a, b) =>
      a.record.localeCompare(b.record) ||
      a.where.localeCompare(b.where) ||
      a.reason.localeCompare(b.reason),
  );
}

const computeReach = (): Reach => {
  const validation = model.validation();
  if (validation.errors.length > 0) {
    const lines = validation.errors.map((e) => `[${e.code}] ${e.where}: ${e.detail}`);
    throw new Error(`模型有 ${validation.errors.length} 条校验错误，严格审计不启动：\n${lines.join('\n')}`);
  }

  const analysis = model.analysis();
  const measure = {
    noCap: analysis.measure.noCap,
    capShort: analysis.measure.capShort,
    condShort: analysis.measure.condShort,
    total: analysis.measure.noCap + analysis.measure.capShort + analysis.measure.condShort,
  };

  /**
   * 记录不合规的交付窗口不算交付。先把与可达性无关的坏记录剔掉，再做扩散；
   * 扩散后仍不可达的记录，其窗口同样不算交付，重新扩散到不动点。
   */
  const allItemIds = new Set(data.items.map((item) => item.id));
  let invalidGiveWhere = new Set(
    scanRecordProblems(data, allItemIds)
      .filter((problem) => problem.reason !== 'unreachable-record' && isGiveWhere(problem.where))
      .map((problem) => problem.where),
  );
  let propagation = propagate(invalidGiveWhere);
  for (;;) {
    const additions = scanRecordProblems(data, propagation.available)
      .filter(
        (problem) =>
          problem.reason === 'unreachable-record' &&
          isGiveWhere(problem.where) &&
          !invalidGiveWhere.has(problem.where),
      )
      .map((problem) => problem.where);
    if (additions.length === 0) break;
    invalidGiveWhere = new Set([...invalidGiveWhere, ...additions]);
    propagation = propagate(invalidGiveWhere);
  }
  const {
    rounds,
    given,
    available,
    clean,
    windows,
    designWindows,
    usable,
    cleanRoutes,
    degraded,
    firstRoute,
    cleanRoute,
    keptByRoute,
    firstRound,
    cleanRound,
  } = propagation;
  const availableList = [...available].sort();
  const unavailable = concreteItems
    .filter((it) => !available.has(it.id))
    .map((it) => ({
      id: it.id,
      category: it.category ?? 'material',
      producers: (model.graph.producers.get(it.id) ?? []).slice().sort(),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const blocked: BlockedRoute[] = [];
  for (const route of data.routes) {
    if (usable.has(route.id)) continue;
    const failures = evaluateRoute(route, available, windows, designWindows).failures;
    const products = route.produces.map((t) => t.item);
    const required = requiredItemsOf(route);
    const productReachable = products.some((p) => available.has(p));
    const inputReachable = required.some((r) => available.has(r)) || required.length === 0;
    const kind: BlockedRoute['kind'] = productReachable
      ? 'alternative'
      : inputReachable
        ? 'frontier'
        : 'outside';
    blocked.push({ id: route.id, products, failures, kind });
  }
  blocked.sort((a, b) => a.id.localeCompare(b.id));

  const seedReports: SeedReport[] = [...model.seedIds].map((id) => {
    const producerIds = model.graph.producers.get(id) ?? [];
    const seedProps = itemOf(id)?.props ?? [];
    const specOkOf = (rid: string): boolean => {
      if (seedProps.length === 0) return true;
      const term = routeById.get(rid)?.produces.find((t) => t.item === id);
      if (term === undefined) return false;
      return seedProps.every((prop) => {
        const window = givenWindowOf(prop);
        if (window === undefined) return false;
        return (term.gives ?? []).some(
          (give) => give.design !== true && propCovers(give, window),
        );
      });
    };
    const componentsOk = (itemOf(id)?.composedOf ?? []).every(
      (c) => windows.has(c.item) && !designWindows.has(c.item),
    );
    const producers = producerIds.map((rid) => {
      if (usable.has(rid)) {
        return {
          id: rid,
          usable: true,
          clean: cleanRoutes.has(rid),
          specOk: specOkOf(rid),
          componentsOk,
          failures: [],
        };
      }
      const { failures } = evaluateRoute(routeById.get(rid)!, available, windows, designWindows);
      return { id: rid, usable: false, clean: false, specOk: false, componentsOk, failures };
    });
    return {
      id,
      replicable: producers.some(
        (p) => p.usable && p.clean && p.specOk && p.componentsOk,
      ),
      producers,
    };
  });

  const warnings: string[] = [];
  const noteCount = (code: string): number =>
    validation.notes.filter((note) => note.code === code).length;
  const widened = noteCount('prop_widened');
  const unfilled = noteCount('prop_unfilled');
  const notFunctional = noteCount('prop_not_functional');
  if (widened + unfilled + notFunctional > 0) {
    warnings.push(
      `规格提示：prop_widened ${widened}（宽窗放行）、prop_unfilled ${unfilled}、prop_not_functional ${notFunctional}`,
    );
  }

  const design = scanDesign(data);
  const designGives = design.gives;
  const designConditions = design.allConditions;
  const recordProblems = scanRecordProblems(data, available);
  if (designGives + designConditions > 0) {
    warnings.push(
      `未验证窗口：design 交付 ${designGives} 个、design 条件 ${designConditions} 处 —— ` +
        `design 窗口与条件都不算交付，全部进入闸门`,
    );
  }

  const machineIds = data.items.filter((it) => it.category === 'machine').map((it) => it.id);
  const machinesAvailable = machineIds.filter((id) => available.has(id));

  const degradedList: readonly DegradedItem[] = [...degraded.entries()]
    .map(([id, record]) => ({
      id,
      category: itemOf(id)?.category ?? 'material',
      route: record.route,
      firstRound: record.firstRound,
      sites: record.sites,
    }))
    .sort((a, b) => a.category.localeCompare(b.category) || a.id.localeCompare(b.id));

  const upgradedItems: string[] = [];
  for (const [id, first] of firstRound) {
    const cleanAt = cleanRound.get(id);
    if (cleanAt !== undefined && cleanAt > first) upgradedItems.push(id);
  }
  upgradedItems.sort();
  const upgraded = upgradedItems.length;

  const deferredItems: readonly DeferredItem[] = concreteItems
    .filter((it) => it.deferred === true)
    .map((it) => ({ id: it.id, category: it.category ?? 'material' }))
    .sort((a, b) => a.category.localeCompare(b.category) || a.id.localeCompare(b.id));

  const passed =
    unavailable.length === 0 &&
    degradedList.length === 0 &&
    seedReports.every((s) => s.replicable) &&
    measure.total === 0 &&
    designGives === 0 &&
    designConditions === 0 &&
    recordProblems.length === 0;

  const result: AuditResult = {
    passed,
    start: {
      seeds: [...model.seedIds],
      floor: [...model.marsIds].sort(),
      oneTime: [...ONE_TIME].sort(),
    },
    model: {
      items: concreteItems.length,
      routes: data.routes.length,
      errors: validation.errors.length,
      notes: validation.notes.length,
    },
    measure,
    degraded: degradedList,
    deferred: deferredItems,
    upgradedItems,
    upgraded,
    coproducts: analyzeCoproducts(),
    rounds,
    designGives,
    designConditions,
    recordProblems,
    reachable: {
      items: availableList.length,
      total: concreteItems.length,
      machines: machinesAvailable.length,
      machinesTotal: machineIds.length,
      unavailable,
    },
    routes: {
      total: data.routes.length,
      usable: [...usable].sort(),
      clean: [...cleanRoutes].sort(),
      blocked,
    },
    seeds: seedReports,
    warnings: warnings.sort(),
  };

  return {
    result,
    facts: {
      given,
      available,
      clean,
      windows,
      designWindows,
      keptByRoute,
      firstRoute,
      cleanRoute,
      firstRound,
      cleanRound,
    },
  };
};

let cachedReach: Reach | undefined;

/** 进程内只扩散一次；数据在进程内不变。 */
export const buildReach = (): Reach => {
  cachedReach ??= computeReach();
  return cachedReach;
};

/** 闸门口径的结果。 */
export const buildResult = (): AuditResult => buildReach().result;
