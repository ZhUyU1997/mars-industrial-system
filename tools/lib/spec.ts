/**
 * 规格级：每条 need 有没有交付覆盖，从种子出发的可达性，以及测量链的能力。
 *
 * 只给 `tools/audit.ts` 的测量链判据用，不是独立工具。测量链那段判据原在 core 里，
 * 因为它要认识具体的参数名（哪是量程、哪是记录字段），不该住在模型层。
 */
import { covers, needItems, resolveItemRef } from '../../src/index.ts';
import { closure, pathSets, specCovers } from './graph.ts';
import type { Graph } from './graph.ts';
import type { Item, Option, Route } from '../../src/index.ts';
import type { PropReq } from '../../src/core/describe.ts';

// 规格级：每条 need 有没有交付覆盖
//
// 只回答一个问题：从 6 条火星料 + 7 条种子出发，robot 的链上每一处 `need`
// 有没有某条路线的 `gives`（或给定条目自己的 `props`）盖得住。
// 判据在 graph.ts：closure() 给可达集，specCovers() 给规格判据。
// ─────────────────────────────────────────────────────────────────────────────


export interface SpecResult {
  /** 证明树上的条目 id（排序后）。 */
  readonly pathItems: readonly string[];
  /**
   * DFS 实际选中的路线 id（排序后）。
   *
   * `--tasks` 的供货口径按它算；不能用“产出树内条目的所有路线”代替 ——
   * 备选路线与只因联产才碰到树内条目的路线都会被算进去，其投入就变成假缺口。
   */
  readonly pathRoutes: readonly string[];
  readonly sites: number;
  readonly covered: number;
  readonly kept: number;
  readonly lost: number;
  readonly robotStrict: boolean;
  readonly robotRelaxed: boolean;
  /** 类型闭包的可达统计（口径 A：设备也算在内）。 */
  readonly reachableItems: number;
  readonly totalItems: number;
  readonly reachableMachines: number;
  readonly totalMachines: number;
  /** 长不出来的设备 + 第一堵点。 */
  readonly blocked: readonly { readonly id: string; readonly blockedBy: string }[];
  /** 电机单独看：它装在每台设备里，category 却是 part。 */
  readonly motor: { readonly id: string; readonly missing: readonly string[] };
  /** 证明树上“没有路线也没有零件清单”的条目 —— 原 report 的断点。 */
  readonly breaks: readonly string[];
  /** 测量链：机器能力的三个缺口计数。 */
  readonly measure: {
    readonly noCap: number;
    readonly capShort: number;
    readonly condShort: number;
  };
}

type RangeProp = Extract<NonNullable<Item['props']>[number], { readonly kind: 'range' }>;

/** 一个 range 窗口的可读写法（不带单位）。 */
const fmtRange = (w: { readonly min?: number; readonly max?: number }): string => {
  const lo = w.min === undefined ? '−∞' : String(w.min);
  const hi = w.max === undefined ? '+∞' : String(w.max);
  return w.min === w.max ? lo : `${lo}–${hi}`;
};

/**
 * 测量链：测量路线声称量出的量，执行机器有没有那个量程。
 *
 *   noCap     机器的 props 里压根没有这个参数
 *   capShort  有同名参数，但窗口包不住
 *   condShort 路线的 under，同路线机器既不 holds 也包不住
 *
 * 只对 `measure/*` 跑：只有测量路线会"声称量出某个物理量"，别的路线没这句话。
 */
function analyzeMeasure(graph: Graph): SpecResult['measure'] {
  const byId = new Map(graph.items.map((i) => [i.id, i] as const));

  // 能力词表 = 量具用 measure/ 前缀声明过的参数。数据决定"什么是量程"。
  const capable = new Set<string>();
  for (const it of graph.items) {
    if (it.category !== 'machine') continue;
    for (const p of it.props ?? []) {
      if (p.param.startsWith('measure/')) capable.add(p.param.slice('measure/'.length));
    }
  }

  let noCap = 0;
  let capShort = 0;
  let condShort = 0;

  for (const r of graph.routes) {
    if (!r.id.startsWith('measure/')) continue;
    const execIds = [...new Set([r.performedBy, ...(r.steps ?? []).map((s) => s.performedBy)])].filter(
      (x): x is string => x !== undefined,
    );
    const executors = execIds
      .map((id) => byId.get(id))
      .filter((x): x is Item => x !== undefined && x.category === 'machine');
    // 能力提供者：执行机器 + needs 里的仪器（并集，任一声明并包住即算覆盖）。
    const providers = [...new Set([...execIds, ...needItems(r.needs)])]
      .map((id) => byId.get(id))
      .filter((x): x is Item => x !== undefined && x.category === 'machine');
    const machines = [...new Set([...executors.map((m) => m.id), ...needItems(r.needs)])]
      .map((id) => byId.get(id))
      .filter((x): x is Item => x !== undefined && x.category === 'machine');

    for (const t of r.produces) {
      for (const g of t.gives ?? []) {
        if (g.kind !== 'range') continue;
        // 只有量具声明过"能量"的参数才判；其余是记录簿记，不是量程。
        if (!capable.has(g.param)) continue;
        if (g.min === undefined && g.max === undefined) continue;

        const candidates: RangeProp[] = [];
        let sameParamNonRange = false;
        // 仪器上的量程参数带 measure/ 前缀；gives 里是裸名，比较时两者等价。
        const wanted = [g.param, `measure/${g.param}`];
        for (const m of providers) {
          for (const p of m.props ?? []) {
            if (!wanted.includes(p.param)) continue;
            if (p.kind !== 'range') {
              sameParamNonRange = true;
              continue;
            }
            candidates.push(p);
          }
        }

        if (candidates.length === 0) {
          if (sameParamNonRange || executors.length === 0) continue;
          noCap += 1;
          continue;
        }

        const oneSided = (g.min === undefined) !== (g.max === undefined);
        let covered = false;
        let allSkipDir = true;
        for (const c of candidates) {
          const verdict =
            c.dir === undefined && oneSided
              ? 'skip_dir'
              : c.dir === 'atMost'
                ? (c.max ?? Infinity) >= (g.max ?? Infinity)
                  ? 'covered'
                  : 'short'
                : c.dir === 'atLeast'
                  ? (c.min ?? -Infinity) <= (g.min ?? -Infinity)
                    ? 'covered'
                    : 'short'
                  : (c.min ?? -Infinity) <= (g.min ?? -Infinity) &&
                      (c.max ?? Infinity) >= (g.max ?? Infinity)
                    ? 'covered'
                    : 'short';
          if (verdict === 'covered') {
            covered = true;
            break;
          }
          if (verdict !== 'skip_dir') allSkipDir = false;
        }
        if (!covered && !allSkipDir) capShort += 1;
      }
    }

    for (const c of [...(r.under ?? []), ...(r.steps ?? []).flatMap((s) => s.under ?? [])]) {
      const byHolds = machines.some((m) => (m.holds ?? []).some((h) => covers(h, c)));
      const byProps = machines.some((m) =>
        (m.props ?? []).some(
          (p) =>
            p.kind === 'range' &&
            p.param === c.param &&
            (p.min ?? -Infinity) <= c.min &&
            (p.max ?? Infinity) >= c.max,
        ),
      );
      if (!byHolds && !byProps) condShort += 1;
    }
  }

  return { noCap, capShort, condShort };
}

export function analyzeSpec(graph: Graph, seeds: readonly string[]): SpecResult {
  const mars = graph.items.filter((i) => i.id.startsWith('mars/')).map((i) => i.id);
  const given = new Set<string>([...mars, ...seeds]);
  const typeAvail = closure({
    graph: graph,
    seeds: [...given],
    equipment: true,
    spec: false,
  });
  const covers = specCovers(graph, given);
  const tree = pathSets(graph, ['plant/robot', ...seeds], given);

  let covered = 0;
  let kept = 0;
  let lost = 0;

  /**
   * 一格需求点。三处挂点（路线的 uses、装配清单、设备要求）共用：
   * 覆盖记 covered，没覆盖的每条缺口按这一格的 onRelax 记 kept 或 lost。
   * 判据落在**子句**上：anyOf 是任选其一，有一个选项满足全部 need 就算过。
   */
  const count = (
    needs: readonly PropReq[],
    item: string,
    onRelax: 'functional-kept' | 'functional-lost' | undefined,
  ): void => {
    const uncovered = needs.filter((n) => !covers(item, n));
    if (uncovered.length === 0) {
      covered += 1;
      return;
    }
    if (onRelax === 'functional-lost') lost += uncovered.length;
    else kept += uncovered.length;
  };

  /** 路线在类型闭包里可用吗（不看 need）。 */
  const typeReachable = (r: Route): boolean =>
    r.uses.every((cl) => cl.anyOf.some((o) => typeAvail.has(o.item))) &&
    [r.performedBy, ...needItems(r.needs ?? []), ...(r.steps ?? []).map((x) => x.performedBy)].every(
      (x) => x === undefined || typeAvail.has(x),
    );

  // ① 路线的 uses：一格取"未满足数最少"的那个选项。
  for (const r of graph.routes) {
    if (!typeReachable(r)) continue;
    for (const cl of r.uses) {
      let best: { option: Option; unmet: number } | undefined;
      for (const o of cl.anyOf) {
        if (!typeAvail.has(o.item)) continue;
        const needs = o.need ?? [];
        if (needs.length === 0) continue;
        const unmet = needs.filter((n) => !covers(o.item, n)).length;
        if (best === undefined || unmet < best.unmet) best = { option: o, unmet };
        if (best.unmet === 0) break;
      }
      if (best === undefined) continue; // 这一格没有带 need 的可用选项：不是规格问题
      count(best.option.need ?? [], best.option.item, best.option.onRelax);
    }
  }

  // ② 装配清单：装配件不写产出路线，要求挂在"把哪个零件装上去"那一行上。
  const specById = new Map(graph.items.map((i) => [i.id, i] as const));
  for (const it of graph.items) {
    for (const comp of it.composedOf ?? []) {
      const needs = comp.need ?? [];
      if (needs.length === 0) continue;
      let componentId: string;
      try {
        componentId = resolveItemRef(comp.item, comp.select, specById);
      } catch {
        continue;
      }
      if (!typeAvail.has(componentId)) continue;
      count(needs, componentId, comp.onRelax);
    }
  }

  // ③ 前提的规格窗口：performedBy 只指名，needs 的 Option 才能挂窗口。
  for (const r of graph.routes) {
    for (const n of r.needs) {
      if (typeof n === 'string') continue;
      const needs = n.need ?? [];
      if (needs.length === 0 || !typeAvail.has(n.item)) continue;
      count(needs, n.item, n.onRelax);
    }
  }

  // ── 可达与断点（原 report 的两节） ────────────────────────────────────────
  const specRouteById = new Map(graph.routes.map((r) => [r.id, r] as const));
  const producedBy = (id: string): Route[] =>
    (graph.producers.get(id) ?? []).map((rid) => specRouteById.get(rid)!);

  const machineItems = graph.items.filter(
    (it) => it.category === 'machine' || it.id === 'lathe',
  );

  /** 一台设备卡在哪一件上 —— 只报第一处，读得动。 */
  const firstBlock = (id: string): string => {
    for (const c of specById.get(id)?.composedOf ?? []) {
      let componentId: string;
      try {
        componentId = resolveItemRef(c.item, c.select, specById);
      } catch {
        continue;
      }
      if (!typeAvail.has(componentId)) return componentId;
    }
    const usedOk = (r: Route): boolean =>
      r.uses.every((cl) => cl.anyOf.some((o) => typeAvail.has(o.item))) &&
      (r.performedBy === undefined || typeAvail.has(r.performedBy)) &&
      needItems(r.needs).every((n) => typeAvail.has(n)) &&
      (r.steps ?? []).every((s) => s.performedBy === undefined || typeAvail.has(s.performedBy));
    for (const r of producedBy(id).filter((x) => !usedOk(x))) {
      const miss = [
        ...r.uses.flatMap((cl) => cl.anyOf.map((o) => o.item)),
        r.performedBy,
        ...(r.steps ?? []).map((s) => s.performedBy),
        ...needItems(r.needs),
      ].filter((x): x is string => x !== undefined && !typeAvail.has(x));
      if (miss.length > 0) return `${miss[0]}（${r.id}）`;
    }
    return '—';
  };

  const blocked = machineItems
    .filter((m) => !typeAvail.has(m.id))
    .map((m) => ({ id: m.id, blockedBy: firstBlock(m.id) }));

  // 断点：树上的条目，既没有产出路线、也没有零件清单，而且不是种子/火星料。
  const breaks: string[] = [];
  for (const id of tree.items) {
    if (given.has(id)) continue;
    const it = specById.get(id);
    if (it === undefined) continue;
    if ((it.composedOf ?? []).length > 0) continue;
    if ((graph.producers.get(id) ?? []).length > 0) continue;
    breaks.push(id);
  }

  const motorId = 'std/motor-7.5kw-4p';

  return {
    pathItems: [...tree.items].sort(),
    pathRoutes: [...tree.routes].sort(),
    sites: covered + kept + lost,
    covered,
    kept,
    lost,
    robotStrict: closure({ graph: graph, seeds: [...given], equipment: true }).has(
      'plant/robot',
    ),
    robotRelaxed: closure({
      graph: graph,
      seeds: [...given],
      equipment: true,
      allowDegraded: true,
    }).has('plant/robot'),
    reachableItems: typeAvail.size,
    totalItems: graph.items.length,
    reachableMachines: machineItems.filter((m) => typeAvail.has(m.id)).length,
    totalMachines: machineItems.length,
    blocked,
    motor: {
      id: motorId,
      missing: (specById.get(motorId)?.composedOf ?? [])
        .filter((c) => !typeAvail.has(c.item))
        .map((c) => c.item),
    },
    breaks: breaks.sort(),
    measure: analyzeMeasure(graph),
  };
}
