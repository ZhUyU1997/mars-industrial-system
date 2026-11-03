/**
 * 查询索引 —— 从 `buildReach()` 的事实建一次反查表，供卡片、归因与列表共用。
 *
 * 只做选择与索引：状态、窗口、keep 全部取自 reach，不另算判据。
 */
import { propCovers, resolveItemRef } from '../../src/core/describe.ts';
import { model } from '../lib/index.ts';
import { buildReach, scanDesign } from '../lib/reach.ts';
import type {
  BlockedRoute,
  DeliveredWindow,
  DegradedItem,
  KeptSite,
  Reach,
  SeedReport,
} from '../lib/reach.ts';
import type { Description, Item, PropDecl, PropReq, Qty, Route } from '../../src/core/describe.ts';

export type OnRelax = 'functional-kept' | 'functional-lost';
export type ItemState =
  | 'given'
  | 'clean'
  | 'degraded'
  | 'upgraded'
  | 'unavailable'
  | 'interface';
export type RouteState = 'clean' | 'degraded' | 'blocked';
export type SourceState = RouteState | 'given';

/** 一条交付窗口的来历。 */
export interface DeliveredView {
  readonly source: string;
  readonly state: SourceState;
  readonly give: PropReq;
  readonly design: boolean;
}

/** 候选窗口：带“是否覆盖本行需求”的判定，避免外层再用另一套比较。 */
export interface CandidateView extends DeliveredView {
  readonly covers: boolean;
}

/** 一处需求：谁要、要什么窗口。 */
export interface DemandSite {
  readonly where: string;
  readonly need: readonly PropReq[];
  readonly onRelax?: OnRelax;
}

/** 一处装配关系。 */
export interface PartOfSite {
  readonly host: string;
  readonly qty: Qty;
  readonly need: readonly PropReq[];
  readonly onRelax?: OnRelax;
}

/** 一处运行时消耗。 */
export interface ConsumedSite {
  readonly host: string;
  readonly qty: Qty;
  readonly per: Qty;
}

export type GapReason = 'none' | 'design-only' | 'non-covering';

/** 一个需求窗口：谁要、现有谁供、差在哪。 */
export interface NeedRow {
  readonly param: string;
  readonly need: PropReq;
  readonly sites: readonly { readonly where: string; readonly onRelax?: OnRelax }[];
  /** 严格交付里覆盖本窗口的那些。 */
  readonly supplied: readonly DeliveredView[];
  /** 只有 design 窗口覆盖；不算满足，只作解释。 */
  readonly designOnly: readonly DeliveredView[];
  /** 同参数但不覆盖的窗口，含阻断路线给的。 */
  readonly candidates: readonly CandidateView[];
  /** 没有覆盖时的缺口分类；有 supplied 时为 undefined。 */
  readonly reason?: GapReason;
}

export interface WindowRow {
  readonly item: string;
  readonly give: PropReq;
  readonly source: string;
  readonly state: SourceState;
  readonly design: boolean;
}

export interface GapRow extends NeedRow {
  readonly item: string;
}

/** 给定条目的 props 是现场已有的窗口。set 声明只表示可选组分，不保证在场。 */
function givenWindow(p: PropDecl): PropReq | undefined {
  if (p.kind === 'range') {
    return { param: p.param, kind: 'range', min: p.min, max: p.max, dir: p.dir };
  }
  if (p.kind === 'enum') {
    return { param: p.param, kind: 'enum', oneOf: p.values };
  }
  return undefined;
}

/** 窗口的稳定键：只关心规格，不关心来源。 */
export function windowKey(w: PropReq): string {
  if (w.kind === 'range') {
    return `r|${w.param}|${w.min ?? ''}|${w.max ?? ''}|${w.dir ?? 'within'}`;
  }
  if (w.kind === 'enum') {
    return `e|${w.param}|${[...w.oneOf].sort().join(',')}`;
  }
  return `s|${w.param}|${[...(w.atLeast ?? [])].sort().join(',')}`;
}

const viewKey = (v: DeliveredView): string => `${v.source}|${v.design ? 'd' : 'n'}|${windowKey(v.give)}`;

const dedupeViews = <T extends DeliveredView>(list: readonly T[]): T[] => {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const view of list) {
    const key = viewKey(view);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(view);
  }
  return out;
};

export class ReachIndex {
  readonly reach: Reach;
  readonly data: Description;
  readonly itemById: ReadonlyMap<string, Item>;
  readonly routeById: ReadonlyMap<string, Route>;
  readonly concreteItems: readonly Item[];
  readonly given: ReadonlySet<string>;
  readonly available: ReadonlySet<string>;
  readonly clean: ReadonlySet<string>;
  readonly unavailable: ReadonlySet<string>;
  readonly usableRoutes: ReadonlySet<string>;
  readonly cleanRoutes: ReadonlySet<string>;
  readonly blockedById: ReadonlyMap<string, BlockedRoute>;
  readonly degradedById: ReadonlyMap<string, DegradedItem>;
  readonly upgraded: ReadonlySet<string>;
  readonly seedById: ReadonlyMap<string, SeedReport>;
  readonly design: ReturnType<typeof scanDesign>;

  readonly demand: ReadonlyMap<string, readonly DemandSite[]>;
  readonly partOf: ReadonlyMap<string, readonly PartOfSite[]>;
  readonly prerequisites: ReadonlyMap<string, readonly string[]>;
  readonly executors: ReadonlyMap<string, readonly string[]>;
  readonly consumedBy: ReadonlyMap<string, readonly ConsumedSite[]>;
  readonly implementedBy: ReadonlyMap<string, readonly string[]>;

  private readonly candidateCache = new Map<string, readonly DeliveredView[]>();
  private readonly needRowCache = new Map<string, readonly NeedRow[]>();

  constructor(reach: Reach) {
    this.reach = reach;
    this.data = model.data;
    this.itemById = new Map(this.data.items.map((item) => [item.id, item] as const));
    this.routeById = new Map(this.data.routes.map((route) => [route.id, route] as const));
    this.concreteItems = this.data.items.filter((item) => item.interface !== true);
    this.given = reach.facts.given;
    this.available = reach.facts.available;
    this.clean = reach.facts.clean;
    this.unavailable = new Set(reach.result.reachable.unavailable.map((item) => item.id));
    this.usableRoutes = new Set(reach.result.routes.usable);
    this.cleanRoutes = new Set(reach.result.routes.clean);
    this.blockedById = new Map(reach.result.routes.blocked.map((route) => [route.id, route] as const));
    this.degradedById = new Map(reach.result.degraded.map((item) => [item.id, item] as const));
    this.upgraded = new Set(reach.result.upgradedItems);
    this.seedById = new Map(reach.result.seeds.map((seed) => [seed.id, seed] as const));
    this.design = scanDesign(this.data);

    const demand = new Map<string, DemandSite[]>();
    const addDemand = (item: string, site: DemandSite): void => {
      const list = demand.get(item) ?? [];
      list.push(site);
      demand.set(item, list);
    };

    const partOf = new Map<string, PartOfSite[]>();
    const prerequisites = new Map<string, string[]>();
    const executors = new Map<string, string[]>();
    const consumedBy = new Map<string, ConsumedSite[]>();
    const implementedBy = new Map<string, string[]>();

    for (const route of this.data.routes) {
      route.uses.forEach((clause, index) => {
        for (const option of clause.anyOf) {
          addDemand(option.item, {
            where: `${route.id} uses[${index}]`,
            need: option.need ?? [],
            onRelax: option.onRelax,
          });
        }
      });
      route.needs.forEach((need, index) => {
        if (typeof need === 'string') {
          const list = prerequisites.get(need) ?? [];
          if (!list.includes(route.id)) list.push(route.id);
          prerequisites.set(need, list);
          addDemand(need, { where: `${route.id} needs[${index}]`, need: [] });
          return;
        }
        const list = prerequisites.get(need.item) ?? [];
        if (!list.includes(route.id)) list.push(route.id);
        prerequisites.set(need.item, list);
        addDemand(need.item, {
          where: `${route.id} needs[${index}]`,
          need: need.need ?? [],
          onRelax: need.onRelax,
        });
      });
      const marks = [route.performedBy, ...(route.steps ?? []).map((step) => step.performedBy)].filter(
        (id): id is string => id !== undefined,
      );
      for (const id of marks) {
        const list = executors.get(id) ?? [];
        if (!list.includes(route.id)) list.push(route.id);
        executors.set(id, list);
      }
    }

    for (const host of this.data.items) {
      for (const component of host.composedOf ?? []) {
        let componentId = component.item;
        try {
          componentId = resolveItemRef(component.item, component.select, this.itemById);
        } catch {
          // 解析不了就按原 id 记，validate 会另报；查询不吞掉这条关系。
        }
        const part: PartOfSite = {
          host: host.id,
          qty: component.qty,
          need: component.need ?? [],
          onRelax: component.onRelax,
        };
        const parts = partOf.get(componentId) ?? [];
        parts.push(part);
        partOf.set(componentId, parts);
        if (part.need.length > 0) {
          addDemand(componentId, {
            where: `${host.id} 装配`,
            need: part.need,
            onRelax: part.onRelax,
          });
        }
      }
      for (const consumption of host.consumption ?? []) {
        const list = consumedBy.get(consumption.item) ?? [];
        list.push({ host: host.id, qty: consumption.qty, per: consumption.per });
        consumedBy.set(consumption.item, list);
      }
      if (host.extends !== undefined) {
        const list = implementedBy.get(host.extends) ?? [];
        list.push(host.id);
        implementedBy.set(host.extends, list);
      }
    }

    this.demand = demand;
    this.partOf = partOf;
    this.prerequisites = prerequisites;
    this.executors = executors;
    this.consumedBy = consumedBy;
    this.implementedBy = implementedBy;
  }

  itemState(id: string): ItemState {
    const item = this.itemById.get(id);
    if (item?.interface === true) return 'interface';
    if (this.given.has(id)) return 'given';
    if (this.unavailable.has(id)) return 'unavailable';
    if (this.degradedById.has(id)) return 'degraded';
    if (this.upgraded.has(id)) return 'upgraded';
    return 'clean';
  }

  routeState(id: string): RouteState {
    if (this.cleanRoutes.has(id)) return 'clean';
    if (this.usableRoutes.has(id)) return 'degraded';
    return 'blocked';
  }

  windowsOf(id: string): readonly DeliveredWindow[] {
    return this.reach.facts.windows.get(id) ?? [];
  }

  designWindowsOf(id: string): readonly DeliveredWindow[] {
    return this.reach.facts.designWindows.get(id) ?? [];
  }

  viewsOf(id: string): DeliveredView[] {
    return [
      ...this.windowsOf(id).map((entry) => ({
        source: entry.source,
        state: entry.state,
        give: entry.window,
        design: entry.design,
      })),
      ...this.designWindowsOf(id).map((entry) => ({
        source: entry.source,
        state: entry.state,
        give: entry.window,
        design: entry.design,
      })),
    ];
  }

  covers(id: string, need: PropReq): boolean {
    return this.windowsOf(id).some((entry) => propCovers(entry.window, need));
  }

  designCovers(id: string, need: PropReq): boolean {
    return this.designWindowsOf(id).some((entry) => propCovers(entry.window, need));
  }

  keptOf(route: string): readonly KeptSite[] {
    return this.reach.facts.keptByRoute.get(route) ?? [];
  }

  /** 所有候选窗口：给定 props + 全部产出路线的 gives，带路线状态。 */
  candidatesOf(id: string): readonly DeliveredView[] {
    const cached = this.candidateCache.get(id);
    if (cached !== undefined) return cached;

    const out: DeliveredView[] = [];
    if (this.given.has(id)) {
      for (const prop of this.itemById.get(id)?.props ?? []) {
        const give = givenWindow(prop);
        if (give !== undefined) out.push({ source: 'given', state: 'given', give, design: false });
      }
    }
    for (const rid of model.graph.producers.get(id) ?? []) {
      const route = this.routeById.get(rid);
      if (route === undefined) continue;
      const state = this.routeState(rid);
      for (const term of route.produces) {
        if (term.item !== id) continue;
        for (const give of term.gives ?? []) {
          out.push({ source: rid, state, give, design: give.design === true });
        }
      }
    }
    const deduped = dedupeViews(out);
    this.candidateCache.set(id, deduped);
    return deduped;
  }

  /** 一个条目的需求窗口，按参数 + 窗口分组。 */
  needRows(id: string): readonly NeedRow[] {
    const cached = this.needRowCache.get(id);
    if (cached !== undefined) return cached;

    const groups = new Map<
      string,
      { need: PropReq; sites: { where: string; onRelax?: OnRelax }[] }
    >();
    for (const site of this.demand.get(id) ?? []) {
      for (const need of site.need) {
        const key = `${need.param}|${windowKey(need)}|${need.design === true ? 'd' : ''}`;
        const group = groups.get(key) ?? { need, sites: [] };
        group.sites.push({ where: site.where, onRelax: site.onRelax });
        groups.set(key, group);
      }
    }

    const windows = this.viewsOf(id);
    const candidates = this.candidatesOf(id);
    const rows: NeedRow[] = [...groups.values()].map((group) => {
      const supplied = dedupeViews(
        windows.filter((view) => !view.design && propCovers(view.give, group.need)),
      );
      const designOnly = dedupeViews(
        windows.filter(
          (view) => view.design && propCovers(view.give, group.need),
        ),
      );
      const taken = new Set([...supplied, ...designOnly].map(viewKey));
      const sameParam = candidates
        .filter((view) => view.give.param === group.need.param && !taken.has(viewKey(view)))
        .map((view) => ({ ...view, covers: propCovers(view.give, group.need) }));
      // 已经严格供上时，其他覆盖窗口只是重复来源，不再列进“不可用”。
      const shownCandidates = supplied.length > 0 ? sameParam.filter((view) => !view.covers) : sameParam;
      const reason: GapReason | undefined =
        supplied.length > 0
          ? undefined
          : designOnly.length > 0
            ? 'design-only'
            : sameParam.some((view) => !view.design && view.state !== 'blocked')
              ? 'non-covering'
              : 'none';
      return {
        param: group.need.param,
        need: group.need,
        sites: group.sites.sort((a, b) => a.where.localeCompare(b.where)),
        supplied,
        designOnly: dedupeViews(designOnly),
        candidates: dedupeViews(shownCandidates),
        reason,
      };
    });

    rows.sort(
      (a, b) => a.param.localeCompare(b.param) || windowKey(a.need).localeCompare(windowKey(b.need)),
    );
    this.needRowCache.set(id, rows);
    return rows;
  }

  /** 全库缺口：没有严格交付覆盖的需求窗口。 */
  gapRows(ids: readonly string[]): GapRow[] {
    const rows: GapRow[] = [];
    for (const id of ids) {
      for (const row of this.needRows(id)) {
        if (row.supplied.length > 0) continue;
        rows.push({ item: id, ...row });
      }
    }
    rows.sort(
      (a, b) =>
        a.item.localeCompare(b.item) ||
        a.param.localeCompare(b.param) ||
        windowKey(a.need).localeCompare(windowKey(b.need)),
    );
    return rows;
  }

  /** 已交付窗口，严格与 design 分列；同一窗口的不同来源都保留。 */
  windowRows(ids: readonly string[]): WindowRow[] {
    const rows: WindowRow[] = [];
    for (const id of ids) {
      const seen = new Set<string>();
      for (const view of this.candidatesOf(id)) {
        // 阻断路线的严格窗口不算交付；design 窗口本来就只是声明，照列并标状态。
        if (view.state === 'blocked' && !view.design) continue;
        const key = `${view.source}|${view.design ? 'd' : 'n'}|${windowKey(view.give)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push({
          item: id,
          give: view.give,
          source: view.source,
          state: view.state,
          design: view.design,
        });
      }
    }
    rows.sort(
      (a, b) =>
        a.item.localeCompare(b.item) ||
        a.give.param.localeCompare(b.give.param) ||
        windowKey(a.give).localeCompare(windowKey(b.give)) ||
        a.source.localeCompare(b.source),
    );
    return rows;
  }
}

let cachedIndex: ReachIndex | undefined;

/** 进程内只建一次反向索引。 */
export function reachIndex(reach?: Reach): ReachIndex {
  if (reach !== undefined) return new ReachIndex(reach);
  cachedIndex ??= new ReachIndex(buildReach());
  return cachedIndex;
}
