/**
 * 归因与证明树 —— 只读 ReachIndex。
 *
 * `why` 沿“缺失输入”往下走，用严格交付窗口重算规格证据；失败码只作叶子标题，
 * 不解析 detail 字符串，也不另立判据。
 */
import { needItems, resolveItemRef } from '../../src/core/describe.ts';
import { model } from '../lib/index.ts';
import type { PropReq, Route } from '../../src/core/describe.ts';
import type { FailureCode, KeptSite } from '../lib/reach.ts';
import { fmtReq, stateLabel } from './cards.ts';
import { windowKey } from './index.ts';
import type { ItemState, ReachIndex, RouteState } from './index.ts';

export type WhyReason =
  | 'no-route'
  | 'spec-unmet'
  | 'design-only'
  | 'design-condition'
  | 'missing-holder'
  | 'deferred'
  | 'bad-data'
  | 'cycle'
  | 'depth-limit'
  | 'interface';

export interface WhyNode {
  readonly kind: 'item' | 'route' | 'reason';
  readonly id: string;
  readonly state?: ItemState | RouteState;
  readonly reason?: WhyReason;
  readonly code?: FailureCode;
  readonly detail?: string;
  readonly need?: PropReq;
  readonly details?: readonly string[];
  readonly children?: readonly WhyNode[];
  readonly note?: string;
}

export interface WhyOptions {
  /** 递归深度；Infinity = 不限。 */
  readonly depth: number;
  /** 每级最多展开多少个子节点；Infinity = 不限。 */
  readonly maxChildren: number;
}

export interface PathVia {
  readonly route: string;
  readonly state: RouteState;
  readonly round?: number;
  readonly kept: readonly KeptSite[];
}

export interface PathNode {
  readonly item: string;
  readonly state: ItemState;
  readonly via?: PathVia;
  readonly children?: readonly PathNode[];
  readonly note?: 'given' | 'unavailable' | 'interface' | 'no-route' | 'cycle' | 'depth-limit' | 'children-limit';
}

const REASON_LABEL: Record<WhyReason, string> = {
  'no-route': '没有产出路线',
  'spec-unmet': '规格不满足',
  'design-only': '只有 design 窗口（不算）',
  'design-condition': 'design 条件（不算）',
  'missing-holder': '没有条件承担者',
  deferred: '条目待定义（deferred）',
  'bad-data': '数据写法问题',
  cycle: '循环依赖',
  'depth-limit': '达到深度上限',
  interface: '抽象接口',
};

const ITEM_REASON = new Set(['DEFERRED_PRODUCT', 'NO_OUTPUT', 'UNKNOWN_COMPONENT_PROP', 'BAD_COMPONENT_NEED', 'BAD_EQUIPMENT_REQUIRE']);

const failureReason = (code: FailureCode): WhyReason => {
  if (code === 'DESIGN_CONDITION') return 'design-condition';
  if (code === 'MISSING_HOLDER') return 'missing-holder';
  if (code === 'DEFERRED_PRODUCT') return 'deferred';
  if (ITEM_REASON.has(code)) return 'bad-data';
  return 'bad-data';
};

interface SpecGap {
  readonly where: string;
  readonly item: string;
  readonly need: PropReq;
}

/** 路线上所有“已可达但不覆盖”的规格窗口；只用于解释，不参与判定。 */
function specGapsOfRoute(index: ReachIndex, route: Route): SpecGap[] {
  const gaps: SpecGap[] = [];
  const seen = new Set<string>();
  const add = (where: string, item: string, need: PropReq): void => {
    const key = `${where}|${item}|${windowKey(need)}`;
    if (seen.has(key)) return;
    seen.add(key);
    gaps.push({ where, item, need });
  };

  route.uses.forEach((clause, ci) => {
    for (const option of clause.anyOf) {
      if (!index.available.has(option.item)) continue;
      for (const need of option.need ?? []) {
        if (!index.covers(option.item, need)) add(`uses[${ci}]`, option.item, need);
      }
    }
  });
  route.needs.forEach((need, ni) => {
    if (typeof need === 'string' || !index.available.has(need.item)) return;
    for (const window of need.need ?? []) {
      if (!index.covers(need.item, window)) add(`needs[${ni}]`, need.item, window);
    }
  });
  for (const term of route.produces) {
    for (const component of index.itemById.get(term.item)?.composedOf ?? []) {
      let componentId = component.item;
      try {
        componentId = resolveItemRef(component.item, component.select, index.itemById);
      } catch {
        // 保留原 id；validate 会另报写法问题。
      }
      if (!index.available.has(componentId)) continue;
      for (const need of component.need ?? []) {
        if (!index.covers(componentId, need)) add(`${term.item} 装配`, componentId, need);
      }
    }
  }
  return gaps;
}

/** 路线阻断的直接缺失项：不可达的输入 / 前提 / 执行者 / 零件。 */
function missingItemsOfRoute(index: ReachIndex, route: Route): string[] {
  const out = new Set<string>();
  for (const clause of route.uses) {
    if (clause.anyOf.some((option) => index.available.has(option.item))) continue;
    for (const option of clause.anyOf) out.add(option.item);
  }
  for (const need of needItems(route.needs)) {
    if (!index.available.has(need)) out.add(need);
  }
  for (const id of [
    route.performedBy,
    ...(route.steps ?? []).map((step) => step.performedBy),
  ]) {
    if (id !== undefined && !index.available.has(id)) out.add(id);
  }
  for (const term of route.produces) {
    for (const component of index.itemById.get(term.item)?.composedOf ?? []) {
      let componentId = component.item;
      try {
        componentId = resolveItemRef(component.item, component.select, index.itemById);
      } catch {
        // 保留原 id。
      }
      if (!index.available.has(componentId)) out.add(componentId);
    }
  }
  return [...out].sort();
}

/** 把一组窗口写成 `source 窗口`，供 why 的规格叶子展示。 */

/** 把同一窗口的多个来源压成一条：`窗口（×n）`。 */
function summarize(views: readonly { readonly give: PropReq }[], suffix = ''): string {
  const groups = new Map<string, number>();
  for (const view of views) {
    const key = fmtReq(view.give);
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }
  const entries = [...groups.entries()];
  const shown = entries.slice(0, 5).map(([key, count]) => (count > 1 ? `${key}（×${count}）` : key));
  const tail = entries.length > 5 ? ` … 另有 ${entries.length - 5} 种` : '';
  return `${shown.join(' · ')}${suffix}${tail}`;
}

function specNode(index: ReachIndex, gap: SpecGap): WhyNode {
  const designOnly = index.designCovers(gap.item, gap.need);
  const all = index.candidatesOf(gap.item).filter((view) => view.give.param === gap.need.param);
  const strict = all.filter((view) => !view.design && view.state !== 'blocked');
  const design = all.filter((view) => view.design);
  const candidates = all.filter((view) => !view.design && view.state === 'blocked');

  const details: string[] = [`要 ${fmtReq(gap.need)}`];
  details.push(`现有 ${strict.length > 0 ? summarize(strict) : '无严格交付窗口'}`);
  if (design.length > 0) details.push(`设计 ${summarize(design)}（不算）`);
  if (candidates.length > 0) details.push(`候选 ${summarize(candidates)}（阻断，不算）`);

  return {
    kind: 'reason',
    id: `${gap.item}|${gap.need.param}`,
    reason: designOnly ? 'design-only' : 'spec-unmet',
    need: gap.need,
    details,
    note: gap.where,
  };
}

function failureNode(failure: { code: FailureCode; detail: string }): WhyNode {
  return {
    kind: 'reason',
    id: failure.code,
    reason: failureReason(failure.code),
    code: failure.code,
    detail: failure.detail,
  };
}

function whyItem(
  index: ReachIndex,
  id: string,
  depth: number,
  opts: WhyOptions,
  path: Set<string>,
): WhyNode {
  const state = index.itemState(id);
  const node: WhyNode = { kind: 'item', id, state };

  if (state === 'interface') return { ...node, reason: 'interface' };
  if (state === 'given') return { ...node, note: '给定（种子 / 火星地板 / 一次性输入）' };
  if (depth <= 0) return { ...node, reason: 'depth-limit', note: '用 --depth 或 --all 展开' };

  if (state === 'degraded') {
    const degraded = index.degradedById.get(id);
    const details =
      degraded === undefined
        ? []
        : [
            `第 ${degraded.firstRound} 轮由 ${degraded.route} 造出`,
            ...degraded.sites.map(
              (site) =>
                `[${site.where}] ${site.item} · ${site.param}：要 ${site.need}，只有 ${site.available.join(' / ') || '无'}`,
            ),
          ];
    return { ...node, details };
  }

  if (state === 'clean' || state === 'upgraded') {
    const route = index.reach.facts.cleanRoute.get(id) ?? index.reach.facts.firstRoute.get(id);
    const details: string[] = [];
    if (route !== undefined) details.push(`产出 ${route}`);
    if (state === 'upgraded') details.push('先降级、后升级；证明链用 path');
    return { ...node, details };
  }

  // unavailable
  const item = index.itemById.get(id);
  if (item?.deferred === true) return { ...node, reason: 'deferred' };
  const producers = modelProducers(index, id);
  if (producers.length === 0) return { ...node, reason: 'no-route' };
  if (path.has(id)) return { ...node, reason: 'cycle', note: '该条目在需求链上重复出现' };
  path.add(id);
  const limited = Number.isFinite(opts.maxChildren)
    ? producers.slice(0, opts.maxChildren)
    : producers;
  const children = limited.map((rid) => whyRoute(index, rid, depth - 1, opts, path));
  path.delete(id);
  return {
    ...node,
    children,
    note:
      producers.length > limited.length ? `另有 ${producers.length - limited.length} 条产出路线` : undefined,
  };
}

function modelProducers(index: ReachIndex, id: string): string[] {
  return model.graph.producers.get(id) ?? [];
}

function whyRoute(
  index: ReachIndex,
  rid: string,
  depth: number,
  opts: WhyOptions,
  path: Set<string>,
): WhyNode {
  const route = index.routeById.get(rid);
  if (route === undefined) {
    return { kind: 'route', id: rid, reason: 'bad-data', note: '路线不存在' };
  }
  const state = index.routeState(rid);
  const blocked = index.blockedById.get(rid);
  const node: WhyNode = { kind: 'route', id: rid, state };

  if (state !== 'blocked') {
    const kept = index.keptOf(rid);
    const details =
      kept.length > 0
        ? kept.map(
            (site) =>
              `[${site.where}] ${site.item} · ${site.param}：要 ${site.need}，只有 ${site.available.join(' / ') || '无'}`,
          )
        : [];
    return { ...node, details, note: state === 'degraded' ? '靠 kept 放宽' : undefined };
  }

  if (depth <= 0) return { ...node, reason: 'depth-limit', note: '用 --depth 或 --all 展开' };

  const failures = blocked?.failures ?? [];
  const missing = missingItemsOfRoute(index, route);
  const gaps = specGapsOfRoute(index, route);
  const details = failures.map((failure) => `[${failure.code}] ${failure.detail}`);

  const children: WhyNode[] = [];
  for (const item of missing) {
    children.push(whyItem(index, item, depth - 1, opts, path));
  }
  for (const gap of gaps) children.push(specNode(index, gap));

  const nonItem = failures.filter((failure) => {
    if (failure.code === 'DESIGN_CONDITION') return true;
    if (failure.code === 'MISSING_HOLDER') return true;
    if (failure.code === 'DEFERRED_PRODUCT') return true;
    if (ITEM_REASON.has(failure.code)) return true;
    return missing.length === 0 && gaps.length === 0;
  });
  for (const failure of nonItem) children.push(failureNode(failure));

  const limited = Number.isFinite(opts.maxChildren)
    ? children.slice(0, opts.maxChildren)
    : children;
  return {
    ...node,
    details,
    children: limited,
    note:
      limited.length < children.length ? `另有 ${children.length - limited.length} 条线索` : undefined,
  };
}

export function buildWhy(
  index: ReachIndex,
  id: string,
  opts: WhyOptions,
): WhyNode | undefined {
  if (index.itemById.has(id)) return whyItem(index, id, opts.depth, opts, new Set());
  if (index.routeById.has(id)) return whyRoute(index, id, opts.depth, opts, new Set());
  return undefined;
}

const TREE_BRANCH = '├─ ';
const TREE_LAST = '└─ ';
const TREE_PIPE = '│  ';
const TREE_BLANK = '   ';

function whyLabel(node: WhyNode): string {
  if (node.kind === 'reason') {
    const code = node.code === undefined ? '' : ` [${node.code}]`;
    const detail = node.detail === undefined ? '' : `  ${node.detail}`;
    const note = node.note === undefined ? '' : `  ← ${node.note}`;
    return `${REASON_LABEL[node.reason ?? 'bad-data']}${code}${detail}${note}`;
  }
  const state = node.state === undefined ? '' : `  ${stateLabel(node.state)}`;
  const reason = node.reason === undefined ? '' : `  ${REASON_LABEL[node.reason]}`;
  const note = node.note === undefined ? '' : `  ← ${node.note}`;
  return node.kind === 'item'
    ? `${node.id}${state}${reason}${note}`
    : `→ ${node.id}${state}${reason}${note}`;
}

function whyDetails(node: WhyNode): string[] {
  return [...(node.details ?? [])];
}

export function formatWhy(node: WhyNode): string {
  const lines: string[] = [whyLabel(node)];
  for (const detail of whyDetails(node)) lines.push(`· ${detail}`);

  const walk = (children: readonly WhyNode[], prefix: string): void => {
    children.forEach((child, index) => {
      const last = index === children.length - 1;
      const branch = last ? TREE_LAST : TREE_BRANCH;
      lines.push(`${prefix}${branch}${whyLabel(child)}`);
      const childPrefix = `${prefix}${last ? TREE_BLANK : TREE_PIPE}`;
      for (const detail of whyDetails(child)) lines.push(`${childPrefix}· ${detail}`);
      if (child.children !== undefined && child.children.length > 0) {
        walk(child.children, childPrefix);
      }
    });
  };
  if (node.children !== undefined && node.children.length > 0) walk(node.children, '');
  return lines.join('\n');
}

// ── 证明树 ──────────────────────────────────────────────────────────────────

/** 一条路线为“造出某个产物”实际需要的输入。 */
function routeInputs(index: ReachIndex, route: Route): string[] {
  const out = new Set<string>();
  for (const clause of route.uses) {
    const available = clause.anyOf.filter((option) => index.available.has(option.item));
    const covered = available.filter((option) =>
      (option.need ?? []).every((need) => index.covers(option.item, need)),
    );
    const pick = covered[0] ?? available[0] ?? clause.anyOf[0];
    if (pick !== undefined) out.add(pick.item);
  }
  for (const need of needItems(route.needs)) out.add(need);
  for (const id of [
    route.performedBy,
    ...(route.steps ?? []).map((step) => step.performedBy),
  ]) {
    if (id !== undefined) out.add(id);
  }
  for (const term of route.produces) {
    for (const component of index.itemById.get(term.item)?.composedOf ?? []) {
      try {
        out.add(resolveItemRef(component.item, component.select, index.itemById));
      } catch {
        out.add(component.item);
      }
    }
  }
  return [...out].sort();
}

function pathNode(
  index: ReachIndex,
  id: string,
  depth: number,
  opts: WhyOptions,
  visited: Set<string>,
): PathNode {
  const state = index.itemState(id);
  if (state === 'interface') return { item: id, state, note: 'interface' };
  if (state === 'given') return { item: id, state, note: 'given' };
  if (state === 'unavailable') return { item: id, state, note: 'unavailable' };
  if (depth <= 0) return { item: id, state, note: 'depth-limit' };
  if (visited.has(id)) return { item: id, state, note: 'cycle' };

  const cleanRoute = index.reach.facts.cleanRoute.get(id);
  const routeId = cleanRoute ?? index.reach.facts.firstRoute.get(id);
  if (routeId === undefined) return { item: id, state, note: 'no-route' };
  const route = index.routeById.get(routeId);
  if (route === undefined) return { item: id, state, note: 'no-route' };
  const round =
    cleanRoute === undefined
      ? index.reach.facts.firstRound.get(id)
      : index.reach.facts.cleanRound.get(id);
  const via: PathVia = {
    route: routeId,
    state: index.routeState(routeId),
    round,
    kept: index.keptOf(routeId),
  };

  visited.add(id);
  const children = routeInputs(index, route).map((input) =>
    pathNode(index, input, depth - 1, opts, visited),
  );
  visited.delete(id);
  const limited = Number.isFinite(opts.maxChildren)
    ? children.slice(0, opts.maxChildren)
    : children;
  return {
    item: id,
    state,
    via,
    children: limited,
    note: limited.length < children.length ? 'children-limit' : undefined,
  };
}

export function buildPath(
  index: ReachIndex,
  id: string,
  opts: WhyOptions,
): PathNode | undefined {
  if (!index.itemById.has(id)) return undefined;
  return pathNode(index, id, opts.depth, opts, new Set());
}

function pathLabel(node: PathNode): string {
  const via = node.via;
  if (via === undefined) return `${node.item}  ${stateLabel(node.state)}`;
  const round = via.round === undefined ? '' : ` · 第 ${via.round} 轮`;
  return `${node.item}  ${stateLabel(node.state)}  ← ${via.route}（${stateLabel(via.state)}${round}）`;
}

function pathNotes(node: PathNode): string[] {
  const notes: string[] = [];
  if (node.note === 'given') notes.push('给定');
  if (node.note === 'unavailable') notes.push('不可达；用 why 看原因');
  if (node.note === 'interface') notes.push('抽象接口');
  if (node.note === 'no-route') notes.push('没有可用产出路线');
  if (node.note === 'cycle') notes.push('循环依赖');
  if (node.note === 'depth-limit') notes.push('达到深度上限（--depth / --all）');
  if (node.note === 'children-limit') notes.push('子节点已截断（--all 展开）');
  if (node.via !== undefined) {
    for (const site of node.via.kept) {
      notes.push(
        `[kept:${site.where}] ${site.item} · ${site.param}：要 ${site.need}，只有 ${site.available.join(' / ') || '无'}`,
      );
    }
  }
  return notes;
}

export function formatPath(node: PathNode): string {
  const lines: string[] = [pathLabel(node)];
  for (const note of pathNotes(node)) lines.push(`· ${note}`);

  const walk = (children: readonly PathNode[], prefix: string): void => {
    children.forEach((child, index) => {
      const last = index === children.length - 1;
      const branch = last ? TREE_LAST : TREE_BRANCH;
      lines.push(`${prefix}${branch}${pathLabel(child)}`);
      const childPrefix = `${prefix}${last ? TREE_BLANK : TREE_PIPE}`;
      for (const note of pathNotes(child)) lines.push(`${childPrefix}· ${note}`);
      if (child.children !== undefined && child.children.length > 0) {
        walk(child.children, childPrefix);
      }
    });
  };
  if (node.children !== undefined && node.children.length > 0) walk(node.children, '');
  return lines.join('\n');
}
