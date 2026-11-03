/**
 * 图索引 —— 全仓唯一的一份。
 *
 * 这里只放四件事：
 *   ① `buildGraph`：条目 / 路线 / 产出者 / 消费者四个索引
 *   ② `closure`：从给定集合出发的正向闭包（唯一一份，可带规格判据）
 *   ③ `reachableFromSeeds`：② 的类型级快捷方式
 *   ④ `pathSets`：从目标（可多个根）出发的贪心证明树
 */
import { SEED_IDS } from '../../data/floor/seed.ts';
import { propCovers, needItems, resolveItemRef } from '../../src/core/describe.ts';
import type { Description, Item, Option, PropReq, Route } from '../../src/core/describe.ts';

/** `buildGraph` 的产物。`producers` / `consumers` 的值都是路线 id。 */
export interface Graph {
  readonly items: readonly Item[];
  readonly routes: readonly Route[];
  /** itemId → 产出它的 routeId（按 data.routes 的顺序，允许重复）。 */
  readonly producers: Map<string, string[]>;
  /** itemId → 在 `uses` 里消耗它的 routeId（同一路线只记一次）。 */
  readonly consumers: Map<string, string[]>;
}

/** 建图：产出者与消费者两个反查表。 */
export function buildGraph(data: Pick<Description, 'items' | 'routes'>): Graph {
  const producers = new Map<string, string[]>();
  for (const r of data.routes) {
    for (const t of r.produces) {
      const arr = producers.get(t.item) ?? [];
      arr.push(r.id);
      producers.set(t.item, arr);
    }
  }

  const consumers = new Map<string, string[]>();
  for (const r of data.routes) {
    for (const cl of r.uses) {
      for (const o of cl.anyOf) {
        const arr = consumers.get(o.item) ?? [];
        if (!arr.includes(r.id)) arr.push(r.id);
        consumers.set(o.item, arr);
      }
    }
  }

  return { items: data.items, routes: data.routes, producers, consumers };
}

/** 默认给定：火星料 + 种子。 */
function defaultGiven(graph: Graph): Set<string> {
  return new Set<string>([
    ...graph.items.filter((i) => i.id.startsWith('mars/')).map((i) => i.id),
    ...SEED_IDS,
  ]);
}

/**
 * 规格判据：某条目能不能满足一条 need。
 *
 *   ① 产出它的某条路线，交的窗口盖得住这条 need；
 *   ② 或者它本来就在"给定"里（买的 / 种子）—— 那它的 `props` 声明就是采购窗口。
 *
 * 明确 `design: true` 的 give **不算满足**：它是没读数的设计值，不是交付证据。
 * `bare`（无 record / design）是 Provenance 引入前的历史数据，按原口径放行，不追补。
 * 两条缺一不可：只看 ① 会把"外购件的采购规格应了"判成没人应；
 * 只看 ② 会看不见本地路线改规格。
 */
export function specCovers(
  graph: Graph,
  given: ReadonlySet<string>,
): (item: string, need: PropReq) => boolean {
  const byId = new Map(graph.items.map((i) => [i.id, i] as const));
  const routeById = new Map(graph.routes.map((r) => [r.id, r] as const));
  return (item, need) => {
    const gives = (graph.producers.get(item) ?? [])
      .map((rid) => routeById.get(rid))
      .flatMap((r) => r?.produces.filter((t) => t.item === item) ?? [])
      .flatMap((t) => (t.gives ?? []).filter((g) => g.design !== true));
    if (gives.some((g) => propCovers(g, need))) return true;
    return (
      given.has(item) &&
      (byId.get(item)?.props ?? []).some(
        (p) => p.kind === 'range' && p.param === need.param && propCovers(p, need),
      )
    );
  };
}

/**
 * 闭包 —— 全仓唯一一份。
 *
 * 从 `seeds` 出发，反复问同一个问题：这件东西现在造得出来吗？
 *   有 composedOf → 零件齐了就造得出
 *   有产出路线   → 那条路线的每个输入子句都至少有一个可选（且够用）的条目
 *
 * 开关：
 *   equipment   执行者 / 前提 / 工序执行者要不要也在闭包里（口径 A / B）
 *   spec        要不要看规格（need 要有人应）。**默认看** —— 不看是简化口径，
 *               必须显式说 `spec: false`，免得拿类型级结果当规格级结果
 *   allowDegraded  规格没用满时，路线是否仍然可用（降级放行）
 *
 * 判据是单调的，所以迭代顺序不影响最小不动点；这里跑到不动点为止。
 */
export interface ClosureOptions {
  readonly graph: Graph;
  /** 起点。要含火星料的调用方自己带上，本函数不额外加。 */
  readonly seeds: readonly string[];
  readonly equipment: boolean;
  /** 缺省 true。false = 不看 need（类型级）。 */
  readonly spec?: boolean;
  readonly allowDegraded?: boolean;
}

export function closure(options: ClosureOptions): Set<string> {
  const { graph, seeds, equipment, spec = true, allowDegraded = false } = options;
  const covers = spec ? specCovers(graph, new Set(seeds)) : undefined;

  const ok = new Set<string>();
  for (const id of seeds) ok.add(id);

  const byId = new Map(graph.items.map((i) => [i.id, i] as const));

  const routeById = new Map(graph.routes.map((r) => [r.id, r] as const));
  const routesProducing = (id: string): Route[] =>
    (graph.producers.get(id) ?? []).map((rid) => routeById.get(rid)!);

  const equipmentOk = (r: Route): boolean =>
    !equipment ||
    [r.performedBy, ...needItems(r.needs ?? []), ...(r.steps ?? []).map((s) => s.performedBy)].every(
      (e) => e === undefined || ok.has(e),
    );

  /** 一条子句可不可用；只有降级选项命中时也算可用，但整条路线要标 degraded。 */
  const clauseOk = (clause: { readonly anyOf: readonly Option[] }): { usable: boolean; degraded: boolean } => {
    let degraded = false;
    for (const opt of clause.anyOf) {
      if (!ok.has(opt.item)) continue;
      const needs = opt.need ?? [];
      if (covers === undefined || needs.length === 0) return { usable: true, degraded };
      const hit = needs.filter((n) => covers(opt.item, n)).length;
      if (hit === needs.length) return { usable: true, degraded };
      if (allowDegraded && opt.onRelax !== 'functional-lost') degraded = true;
    }
    return { usable: degraded, degraded };
  };

  const routeOk = (r: Route): boolean => {
    if (!equipmentOk(r)) return false;
    let degraded = false;
    for (const clause of r.uses) {
      const v = clauseOk(clause);
      if (!v.usable) return false;
      if (v.degraded) degraded = true;
    }
    return !(degraded && !allowDegraded);
  };

  for (let pass = 0; pass < 1024; pass++) {
    let changed = false;
    for (const it of graph.items) {
      if (ok.has(it.id)) continue;
      const parts = (it.composedOf ?? []).map((c) => {
        try {
          return resolveItemRef(c.item, c.select, byId);
        } catch {
          return c.item;
        }
      });
      const byAssembly = parts.length > 0 && parts.every((id) => ok.has(id));
      const byRoute = routesProducing(it.id).some(routeOk);
      if (byAssembly || byRoute) {
        ok.add(it.id);
        changed = true;
      }
    }
    if (!changed) return ok;
  }
  throw new Error('闭包 1024 轮还没收敛 —— 数据里大概有环');
}

/**
 * 类型级正向闭包 —— 返回从 `seedIds`（初始给定集合）可达的全部条目。
 *
 * 与 `closure({ spec: false })` 同一件事的快捷方式：不看 `need` / `gives`，
 * 执行者、前提、工序执行者都要在闭包里。
 *
 * ⚠️ 本函数只把参数当作初始给定，不额外加入火星料；要含火星料的调用方自己带上。
 */
export function reachableFromSeeds(graph: Graph, seedIds: Iterable<string>): Set<string> {
  return closure({ graph, seeds: [...seedIds], equipment: true });
}

/** `pathSets` 的产物：证明树上的条目与路线。 */
export interface PathSets {
  readonly items: Set<string>;
  readonly routes: Set<string>;
}

/**
 * 贪心证明树 —— 从目标（一个根，或一组根）往回拆。
 *
 *   · 装配件先走 `composedOf`，到达 `given` 即停
 *   · 路线件按 `rank = uses.length * 2 + Σ anyOf.length` 取第一条可行路线
 *   · 同一 `visited` 集合跨根共享
 *
 * `give` 缺省为火星料 + 种子。
 */
export function pathSets(
  graph: Graph,
  targetId: string | readonly string[],
  given: ReadonlySet<string> = defaultGiven(graph),
): PathSets {
  const roots = typeof targetId === 'string' ? [targetId] : targetId;
  const byId = new Map<string, Item>(graph.items.map((i) => [i.id, i] as const));
  const routeById = new Map(graph.routes.map((r) => [r.id, r] as const));
  const routesProducing = (id: string): Route[] =>
    (graph.producers.get(id) ?? []).map((rid) => routeById.get(rid)!);

  const typeAvail = reachableFromSeeds(graph, given);
  const routes = new Set<string>();
  const items = new Set<string>();
  const visited = new Set<string>();

  const walk = (id: string): void => {
    if (visited.has(id)) return;
    visited.add(id);
    items.add(id);
    const it = byId.get(id);
    const parts = it?.composedOf ?? [];
    if (parts.length > 0) {
      for (const c of parts) {
        try {
          walk(resolveItemRef(c.item, c.select, byId));
        } catch {
          walk(c.item);
        }
      }
      return;
    }
    if (given.has(id)) return;
    const opts = routesProducing(id).filter(
      (r) =>
        r.uses.every((cl) => cl.anyOf.some((o) => typeAvail.has(o.item))) &&
        [r.performedBy, ...needItems(r.needs ?? []), ...(r.steps ?? []).map((s) => s.performedBy)].every(
          (e) => e === undefined || typeAvail.has(e),
        ),
    );
    const rank = (r: Route): number =>
      r.uses.length * 2 + r.uses.reduce((n, cl) => n + cl.anyOf.length, 0);
    opts.sort((a, b) => rank(a) - rank(b) || a.id.localeCompare(b.id));
    const pick = opts[0];
    if (pick === undefined) return;
    routes.add(pick.id);
    for (const cl of pick.uses) {
      const o = cl.anyOf.find((x) => typeAvail.has(x.item)) ?? cl.anyOf[0];
      if (o !== undefined) walk(o.item);
    }
    for (const e of [pick.performedBy, ...needItems(pick.needs ?? []), ...(pick.steps ?? []).map((s) => s.performedBy)]) {
      if (e !== undefined) walk(e);
    }
  };

  for (const id of roots) walk(id);
  return { items, routes };
}
