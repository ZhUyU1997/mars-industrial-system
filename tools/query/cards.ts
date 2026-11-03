/**
 * 查询卡片与排版 —— 只读 ReachIndex，不另算判据。
 *
 * 所有面向命令行的函数返回字符串；`tools/query.ts` 负责写 stdout / 文件。
 */
import { formatQty } from '../../src/core/describe.ts';
import { model } from '../lib/index.ts';
import type { Component, Condition, PropDecl, PropReq } from '../../src/core/describe.ts';
import type { KeptSite } from '../lib/reach.ts';
import type {
  ConsumedSite,
  DeliveredView,
  DemandSite,
  GapReason,
  GapRow,
  ItemState,
  NeedRow,
  ReachIndex,
  RouteState,
  SourceState,
  WindowRow,
} from './index.ts';

type OnRelax = 'functional-kept' | 'functional-lost';
type BlockedRoute = import('../lib/reach.ts').BlockedRoute;

// ── 报告形状 ────────────────────────────────────────────────────────────────

export interface FailureView {
  readonly code: string;
  readonly detail: string;
}

export interface ProducerView {
  readonly id: string;
  readonly state: RouteState;
  readonly kind?: BlockedRoute['kind'];
  readonly failures: readonly FailureView[];
  readonly gives: readonly PropReq[];
}

export interface PartOfView {
  readonly host: string;
  readonly qty: string;
  readonly need: readonly PropReq[];
  readonly onRelax?: OnRelax;
}

export interface ItemReport {
  readonly id: string;
  readonly category: string;
  readonly unit?: string;
  readonly interface: boolean;
  readonly extends?: string;
  readonly state: ItemState;
  readonly seed: boolean;
  readonly seedReplicable?: boolean;
  readonly props: readonly PropDecl[];
  readonly holds: readonly Condition[];
  readonly composedOf: readonly Component[];
  readonly partOf: readonly PartOfView[];
  readonly producers: readonly ProducerView[];
  readonly consumers: readonly DemandSite[];
  readonly prerequisites: readonly string[];
  readonly executors: readonly string[];
  readonly consumedBy: readonly ConsumedSite[];
  readonly implementedBy: readonly string[];
  readonly delivered: readonly DeliveredView[];
  readonly designDelivered: readonly DeliveredView[];
  readonly firstRoute?: string;
  readonly firstRound?: number;
  readonly cleanRound?: number;
  readonly degraded?: {
    readonly route: string;
    readonly firstRound: number;
    readonly sites: readonly KeptSite[];
  };
}

export interface RouteReport {
  readonly id: string;
  readonly state: RouteState;
  readonly kind?: BlockedRoute['kind'];
  readonly failures: readonly FailureView[];
  readonly kept: readonly KeptSite[];
  readonly products: readonly {
    readonly item: string;
    readonly qty: string;
    readonly gives: readonly PropReq[];
  }[];
  readonly uses: readonly {
    readonly index: number;
    readonly options: readonly {
      readonly item: string;
      readonly qty: string;
      readonly need: readonly PropReq[];
      readonly onRelax?: OnRelax;
    }[];
  }[];
  readonly needs: readonly {
    readonly item: string;
    readonly qty?: string;
    readonly need?: readonly PropReq[];
    readonly onRelax?: OnRelax;
  }[];
  readonly performedBy?: string;
  readonly rate?: string;
  readonly firstRound?: number;
  readonly under: readonly Condition[];
  readonly steps: readonly {
    readonly note?: string;
    readonly performedBy?: string;
    readonly under: readonly Condition[];
  }[];
}

export interface NeedsReport {
  readonly id: string;
  readonly category: string;
  readonly state: ItemState;
  readonly props: readonly PropDecl[];
  readonly rows: readonly NeedRow[];
}

// ── 报告构造 ────────────────────────────────────────────────────────────────

export function itemReport(index: ReachIndex, id: string): ItemReport | undefined {
  const item = index.itemById.get(id);
  if (item === undefined) return undefined;
  const degraded = index.degradedById.get(id);
  const seed = index.seedById.get(id);
  const producers: ProducerView[] = (model.graph.producers.get(id) ?? []).map((rid) => {
    const route = index.routeById.get(rid);
    const blocked = index.blockedById.get(rid);
    const terms = route?.produces.filter((term) => term.item === id) ?? [];
    return {
      id: rid,
      state: index.routeState(rid),
      kind: blocked?.kind,
      failures: blocked?.failures ?? [],
      gives: terms.flatMap((term) => term.gives ?? []),
    };
  });
  const partOf: PartOfView[] = (index.partOf.get(id) ?? []).map((part) => ({
    host: part.host,
    qty: formatQty(part.qty),
    need: part.need,
    onRelax: part.onRelax,
  }));
  const allViews = index.viewsOf(id);
  return {
    id,
    category: item.category ?? (item.interface === true ? '接口' : 'material'),
    unit: item.unit,
    interface: item.interface === true,
    extends: item.extends,
    state: index.itemState(id),
    seed: model.seedIds.has(id),
    seedReplicable: seed?.replicable,
    props: item.props ?? [],
    holds: item.holds ?? [],
    composedOf: item.composedOf ?? [],
    partOf,
    producers,
    consumers: index.demand.get(id) ?? [],
    prerequisites: index.prerequisites.get(id) ?? [],
    executors: index.executors.get(id) ?? [],
    consumedBy: index.consumedBy.get(id) ?? [],
    implementedBy: index.implementedBy.get(id) ?? [],
    delivered: allViews.filter((view) => !view.design),
    designDelivered: allViews.filter((view) => view.design),
    firstRoute: index.reach.facts.firstRoute.get(id),
    firstRound: index.reach.facts.firstRound.get(id),
    cleanRound: index.reach.facts.cleanRound.get(id),
    degraded:
      degraded === undefined
        ? undefined
        : { route: degraded.route, firstRound: degraded.firstRound, sites: degraded.sites },
  };
}

export function routeReport(index: ReachIndex, id: string): RouteReport | undefined {
  const route = index.routeById.get(id);
  if (route === undefined) return undefined;
  const blocked = index.blockedById.get(id);
  return {
    id,
    state: index.routeState(id),
    kind: blocked?.kind,
    failures: blocked?.failures ?? [],
    kept: index.keptOf(id),
    products: route.produces.map((term) => ({
      item: term.item,
      qty: formatQty(term.qty),
      gives: term.gives ?? [],
    })),
    uses: route.uses.map((clause, i) => ({
      index: i,
      options: clause.anyOf.map((option) => ({
        item: option.item,
        qty: formatQty(option.qty),
        need: option.need ?? [],
        onRelax: option.onRelax,
      })),
    })),
    needs: route.needs.map((need) =>
      typeof need === 'string'
        ? { item: need }
        : {
            item: need.item,
            qty: formatQty(need.qty),
            need: need.need ?? [],
            onRelax: need.onRelax,
          },
    ),
    performedBy: route.performedBy,
    rate: route.rate === undefined ? undefined : formatQty(route.rate.hours),
    firstRound: index.reach.facts.firstRound.get(id),
    under: route.under ?? [],
    steps: (route.steps ?? []).map((step) => ({
      note: step.note_zh,
      performedBy: step.performedBy,
      under: step.under ?? [],
    })),
  };
}

export function needsReport(index: ReachIndex, id: string): NeedsReport | undefined {
  const item = index.itemById.get(id);
  if (item === undefined) return undefined;
  return {
    id,
    category: item.category ?? (item.interface === true ? '接口' : 'material'),
    state: index.itemState(id),
    props: item.props ?? [],
    rows: index.needRows(id),
  };
}

// ── 排版小件 ────────────────────────────────────────────────────────────────

const fmtBounds = (min: number | undefined, max: number | undefined): string => {
  const lo = min === undefined ? '−∞' : String(min);
  const hi = max === undefined ? '+∞' : String(max);
  return `${lo}–${hi}`;
};

/** 参数 + 窗口，如 `figure ≤ 1`。 */
export const fmtReq = (w: PropReq): string => {
  if (w.kind === 'range') {
    const dir = w.dir ?? 'within';
    if (dir === 'atLeast') return `${w.param} ≥ ${w.min ?? '−∞'}`;
    if (dir === 'atMost') return `${w.param} ≤ ${w.max ?? '+∞'}`;
    return `${w.param} ${fmtBounds(w.min, w.max)}`;
  }
  if (w.kind === 'enum') return `${w.param} ∈{${w.oneOf.join('/')}}`;
  return `${w.param} ⊇{${(w.atLeast ?? []).join('/')}}`;
};

/** 只要窗口那半句；needs 视图里参数已经单独起行。 */
const fmtWindow = (w: PropReq): string => {
  const full = fmtReq(w);
  const cut = full.indexOf(' ');
  return cut < 0 ? full : full.slice(cut + 1);
};

const fmtDecl = (p: PropDecl): string => {
  if (p.kind === 'range') {
    const dir = p.dir ?? 'within';
    const unit = p.unit === '' ? '' : ` ${p.unit}`;
    if (dir === 'atLeast') return `${p.param} ≥ ${p.min}${unit}`;
    if (dir === 'atMost') return `${p.param} ≤ ${p.max}${unit}`;
    return `${p.param} ${p.min}–${p.max}${unit}`;
  }
  if (p.kind === 'enum') return `${p.param} ∈{${p.values.join('/')}}`;
  return `${p.param} ⊇{${p.values.join('/')}}`;
};

const fmtCondition = (c: Condition): string =>
  `${c.param} ${c.min}–${c.max}${c.design === true ? '（design）' : ''}`;

const withRelax = (onRelax: OnRelax | undefined): string =>
  onRelax === undefined ? '' : `  [${onRelax}]`;

const STATE_MARK: Record<RouteState, string> = { clean: '✓', degraded: '△', blocked: '✗' };

const KIND_LABEL: Record<BlockedRoute['kind'], string> = {
  frontier: '前沿',
  alternative: '备选',
  outside: '闭包外',
};

const ROUTE_STATE_LABEL: Record<RouteState, string> = {
  clean: '干净可用',
  degraded: '降级可用（靠 kept 放宽）',
  blocked: '阻断',
};

const ITEM_STATE_LABEL: Record<ItemState, string> = {
  given: '给定（种子 / 火星地板 / 一次性输入）',
  clean: '可达（干净路线）',
  degraded: '只能降级制造',
  upgraded: '先降级、后升级',
  unavailable: '不可达',
  interface: '抽象接口（不参与可达统计）',
};

const ITEM_STATE_MARK: Record<ItemState, string> = {
  given: '★',
  clean: '✓',
  degraded: '△',
  upgraded: '↑',
  unavailable: '✗',
  interface: '·',
};

const SOURCE_STATE_LABEL: Record<SourceState, string> = {
  given: '给定',
  clean: '干净',
  degraded: '降级',
  blocked: '阻断',
};

const REASON_LABEL: Record<GapReason, string> = {
  none: '没有可用交付窗口',
  'design-only': '只有 design 窗口（不算）',
  'non-covering': '现有窗口不覆盖',
};

export const stateLabel = (state: ItemState | RouteState): string =>
  state === 'clean' || state === 'degraded' || state === 'blocked'
    ? ROUTE_STATE_LABEL[state]
    : ITEM_STATE_LABEL[state];

const LIMIT = 40;
const SITE_LIMIT = 12;
const DELIVERED_LIMIT = 6;

const take = <T>(
  list: readonly T[],
  all: boolean,
  limit = LIMIT,
): { shown: readonly T[]; rest: number } => ({
  shown: all ? list : list.slice(0, limit),
  rest: Math.max(0, list.length - (all ? list.length : limit)),
});

const restLine = (rest: number, indent = '  '): string | undefined =>
  rest > 0 ? `${indent}… 另有 ${rest} 条（--all 展开，--json 全量）` : undefined;

const header = (label: string, total: number, shown: number): string =>
  `${label}（${total}${shown < total ? `，列前 ${shown}` : ''}）`;

const viewsText = (views: readonly DeliveredView[], all: boolean, indent: string): string[] => {
  const { shown, rest } = take(views, all, DELIVERED_LIMIT);
  const lines = shown.map(
    (view) =>
      `${indent}${STATE_MARK[view.state as RouteState] ?? '★'} ${view.source}  ${fmtReq(view.give)}` +
      `${view.design ? '（design，不算）' : ''}`,
  );
  const tail = restLine(rest, indent);
  if (tail !== undefined) lines.push(tail);
  return lines;
};

// ── 条目卡片 ────────────────────────────────────────────────────────────────

export function formatItem(r: ItemReport, all = false): string {
  const lines: string[] = [];
  const unit = r.unit === undefined ? '' : `  · 单位 ${r.unit}`;
  lines.push(`${r.id}  [${r.category}]${unit}${r.interface ? '  · 抽象接口' : ''}`);
  lines.push(`状态：${ITEM_STATE_LABEL[r.state]}`);
  if (r.extends !== undefined) lines.push(`extends：${r.extends}`);
  if (r.seed) {
    lines.push(`种子：是（R9 复制：${r.seedReplicable === true ? '✓' : '✗'}）`);
  }
  if (r.props.length > 0) lines.push(`props：${r.props.map(fmtDecl).join(' · ')}`);
  if (r.holds.length > 0) lines.push(`holds：${r.holds.map(fmtCondition).join(' · ')}`);
  if (r.firstRoute !== undefined) {
    const round = r.firstRound === undefined ? '' : ` · 第 ${r.firstRound} 轮`;
    lines.push(`首次可用：${r.firstRoute}${round}`);
  }

  if (r.degraded !== undefined) {
    lines.push(`降级：第 ${r.degraded.firstRound} 轮由 ${r.degraded.route} 造出`);
    for (const site of r.degraded.sites) {
      lines.push(
        `  [${site.where}] ${site.item} · ${site.param}：要 ${site.need}，只有 ${site.available.join(' / ') || '无'}`,
      );
    }
  }

  if (r.implementedBy.length > 0) {
    const { shown, rest } = take(r.implementedBy, all);
    lines.push(`${header('被实现为', r.implementedBy.length, shown.length)}：${shown.join(', ')}`);
    const tail = restLine(rest);
    if (tail !== undefined) lines.push(tail);
  }

  if (r.composedOf.length > 0) {
    lines.push(`装配（${r.composedOf.length} 项）：`);
    for (const component of r.composedOf) {
      const need =
        (component.need ?? []).length > 0
          ? `  需要 ${(component.need ?? []).map(fmtReq).join(' · ')}`
          : '';
      lines.push(
        `  ${component.item} ×${formatQty(component.qty)}${need}${withRelax(component.onRelax)}`,
      );
    }
  }
  if (r.partOf.length > 0) {
    lines.push(`被装进（${r.partOf.length} 处）：`);
    for (const part of r.partOf) {
      const need = part.need.length > 0 ? `  需要 ${part.need.map(fmtReq).join(' · ')}` : '';
      lines.push(`  ${part.host} ×${part.qty}${need}${withRelax(part.onRelax)}`);
    }
  }

  if (r.producers.length === 0) {
    lines.push(r.state === 'given' ? '产出：无（给定条目）' : '产出：无路线');
  } else {
    lines.push(`产出（${r.producers.length} 条）：`);
    for (const producer of r.producers) {
      const kind = producer.kind === undefined ? '' : `（${KIND_LABEL[producer.kind]}）`;
      const codes = [...new Set(producer.failures.map((failure) => failure.code))]
        .map((code) => `[${code}]`)
        .join(' ');
      lines.push(`  ${STATE_MARK[producer.state]} ${producer.id}${kind}${codes === '' ? '' : `  ${codes}`}`);
    }
  }

  if (r.delivered.length > 0) {
    lines.push(`交付窗口（严格 ${r.delivered.length}）：`);
    lines.push(...viewsText(r.delivered, all, '  '));
  }
  if (r.designDelivered.length > 0) {
    lines.push(`设计窗口（${r.designDelivered.length}，不算交付）：`);
    lines.push(...viewsText(r.designDelivered, all, '  '));
  }

  if (r.consumers.length === 0) {
    lines.push('消费：无');
  } else {
    const { shown, rest } = take(r.consumers, all);
    lines.push(`${header('消费', r.consumers.length, shown.length)}：`);
    for (const consumer of shown) {
      const need =
        consumer.need.length > 0 ? `  需要 ${consumer.need.map(fmtReq).join(' · ')}` : '';
      lines.push(`  ${consumer.where}${need}${withRelax(consumer.onRelax)}`);
    }
    const tail = restLine(rest);
    if (tail !== undefined) lines.push(tail);
  }

  if (r.consumedBy.length > 0) {
    const { shown, rest } = take(r.consumedBy, all);
    lines.push(`${header('运行时消耗', r.consumedBy.length, shown.length)}：`);
    for (const used of shown) {
      lines.push(`  ${used.host} ×${formatQty(used.qty)} / ${formatQty(used.per)} h`);
    }
    const tail = restLine(rest);
    if (tail !== undefined) lines.push(tail);
  }

  if (r.prerequisites.length > 0) {
    const { shown, rest } = take(r.prerequisites, all);
    lines.push(`${header('作为前提', r.prerequisites.length, shown.length)}：${shown.join(', ')}`);
    const tail = restLine(rest);
    if (tail !== undefined) lines.push(tail);
  }
  if (r.executors.length > 0) {
    const { shown, rest } = take(r.executors, all);
    lines.push(`${header('作为执行者', r.executors.length, shown.length)}：${shown.join(', ')}`);
    const tail = restLine(rest);
    if (tail !== undefined) lines.push(tail);
  }
  return lines.join('\n');
}

export function formatItemRow(r: ItemReport): string {
  const mark = ITEM_STATE_MARK[r.state];
  let detail = '';
  if (r.state === 'unavailable') {
    const blocked = r.producers.find((producer) => producer.state === 'blocked');
    detail =
      blocked === undefined
        ? '无产出路线'
        : `${blocked.id}${blocked.failures[0] === undefined ? '' : ` [${blocked.failures[0].code}]`}`;
  } else if (r.state === 'degraded' && r.degraded !== undefined) {
    detail = `← ${r.degraded.route}`;
  } else if (r.state === 'interface') {
    detail = '抽象接口';
  } else if (r.seed) {
    detail = `R9 ${r.seedReplicable === true ? '✓' : '✗'}`;
  } else if (r.firstRoute !== undefined) {
    detail = `← ${r.firstRoute}`;
  }
  return `${r.id}  [${r.category}]  ${mark} ${ITEM_STATE_LABEL[r.state]}${detail === '' ? '' : `  ${detail}`}`;
}

// ── 路线卡片 ────────────────────────────────────────────────────────────────

export function formatRoute(r: RouteReport, all = false): string {
  const lines: string[] = [];
  lines.push(`${r.id}  →  ${r.products.map((product) => `${product.item} ×${product.qty}`).join(' + ')}`);
  lines.push(
    `状态：${ROUTE_STATE_LABEL[r.state]}${r.kind === undefined ? '' : `（${KIND_LABEL[r.kind]}）`}` +
      (r.firstRound === undefined ? '' : ` · 第 ${r.firstRound} 轮可用`),
  );

  if (r.failures.length > 0) {
    lines.push('失败：');
    for (const failure of r.failures) lines.push(`  [${failure.code}] ${failure.detail}`);
  }
  if (r.kept.length > 0) {
    lines.push('降级站点：');
    for (const site of r.kept) {
      lines.push(
        `  [${site.where}] ${site.item} · ${site.param}：要 ${site.need}，只有 ${site.available.join(' / ') || '无'}`,
      );
    }
  } else if (r.state === 'degraded') {
    lines.push('降级站点：未记录');
  }

  if (r.performedBy !== undefined) lines.push(`执行：${r.performedBy}`);
  if (r.rate !== undefined) lines.push(`批次：${r.rate} h`);
  if (r.under.length > 0) lines.push(`条件：${r.under.map(fmtCondition).join(' · ')}`);
  if (r.steps.length > 0) {
    lines.push(`工序（${r.steps.length}）：`);
    r.steps.forEach((step, i) => {
      const by = step.performedBy === undefined ? '' : ` · ${step.performedBy}`;
      const under =
        step.under.length > 0 ? `  条件：${step.under.map(fmtCondition).join(' · ')}` : '';
      lines.push(`  ${i + 1}. ${step.note ?? '工序'}${by}${under}`);
    });
  }

  lines.push(`输入（${r.uses.length} 子句）：`);
  for (const clause of r.uses) {
    const many = clause.options.length > 1 ? ' 任一' : '';
    lines.push(`  uses[${clause.index}]${many}：`);
    for (const option of clause.options) {
      const need =
        option.need.length > 0 ? `  需要 ${option.need.map(fmtReq).join(' · ')}` : '';
      lines.push(`    ${option.item} ×${option.qty}${need}${withRelax(option.onRelax)}`);
    }
  }

  if (r.needs.length > 0) {
    const labels = r.needs.map((need) =>
      need.qty === undefined ? need.item : `${need.item} ×${need.qty}`,
    );
    const { shown, rest } = take(labels, all);
    lines.push(`${header('前提', r.needs.length, shown.length)}：${shown.join(', ')}`);
    const tail = restLine(rest);
    if (tail !== undefined) lines.push(tail);
  }

  const delivered = new Map<string, string[]>();
  for (const product of r.products) {
    for (const give of product.gives) {
      const window = `${fmtReq(give)}${give.design === true ? '（design，不算）' : ''}`;
      const list = delivered.get(product.item) ?? [];
      if (!list.includes(window)) list.push(window);
      delivered.set(product.item, list);
    }
  }
  if (delivered.size > 0) {
    lines.push('交付：');
    for (const [item, windows] of delivered) lines.push(`  ${item}：${windows.join(' · ')}`);
  }
  return lines.join('\n');
}

export function formatRouteRow(r: RouteReport): string {
  const codes = [...new Set(r.failures.map((failure) => failure.code))]
    .map((code) => `[${code}]`)
    .join(' ');
  const kind = r.kind === undefined ? '' : `  ${KIND_LABEL[r.kind]}`;
  return (
    `${r.id}  → ${r.products.map((product) => product.item).join(' + ')}  ` +
    `${STATE_MARK[r.state]} ${ROUTE_STATE_LABEL[r.state]}${kind}${codes === '' ? '' : `  ${codes}`}`
  );
}

// ── 需求信封 ────────────────────────────────────────────────────────────────

export function formatNeeds(r: NeedsReport, all = false): string {
  const params = new Set(r.rows.map((row) => row.param)).size;
  const sites = r.rows.reduce((n, row) => n + row.sites.length, 0);
  const uncovered = r.rows.filter((row) => row.reason !== undefined).length;
  const lines: string[] = [];
  lines.push(
    `${r.id}  [${r.category}]  窗口 ${r.rows.length} 条 · 需求点 ${sites} 处 · ` +
      `参数 ${params} · 未覆盖 ${uncovered}`,
  );
  lines.push(`状态：${ITEM_STATE_LABEL[r.state]}`);
  if (r.props.length > 0) lines.push(`props（声明域）：${r.props.map(fmtDecl).join(' · ')}`);
  if (r.rows.length === 0) {
    lines.push('\n没有任何 need 指向这个条目。');
    return lines.join('\n');
  }

  let param = '';
  for (const row of r.rows) {
    if (row.param !== param) {
      param = row.param;
      lines.push('');
      lines.push(param);
    }
    lines.push(`  ${fmtWindow(row.need)}${row.need.design === true ? '（design 需求）' : ''}`);
    const sitesShown = take(row.sites, all, SITE_LIMIT);
    for (const site of sitesShown.shown) {
      lines.push(`    要 ← ${site.where}${withRelax(site.onRelax)}`);
    }
    const siteTail = restLine(sitesShown.rest, '    ');
    if (siteTail !== undefined) lines.push(siteTail);

    if (row.supplied.length > 0) {
      lines.push('    供（严格覆盖）：');
      for (const view of row.supplied.slice(0, all ? row.supplied.length : DELIVERED_LIMIT)) {
        lines.push(
          `      ${STATE_MARK[view.state as RouteState] ?? '★'} ${view.source}  ${fmtReq(view.give)}`,
        );
      }
      const rest = Math.max(0, row.supplied.length - (all ? row.supplied.length : DELIVERED_LIMIT));
      const tail = restLine(rest, '      ');
      if (tail !== undefined) lines.push(tail);
    }
    if (row.designOnly.length > 0) {
      lines.push('    设计（不算）：');
      for (const view of row.designOnly.slice(0, all ? row.designOnly.length : DELIVERED_LIMIT)) {
        lines.push(`      ${view.source}  ${fmtReq(view.give)}`);
      }
    }
    const covering = row.candidates.filter((view) => view.covers);
    const missing = row.candidates.filter((view) => !view.covers);
    if (covering.length > 0) {
      lines.push('    现有（覆盖但不可用）：');
      for (const view of covering.slice(0, all ? covering.length : DELIVERED_LIMIT)) {
        const mark = view.state === 'blocked' ? '✗' : STATE_MARK[view.state as RouteState] ?? '·';
        lines.push(
          `      ${mark} ${view.source}  ${fmtReq(view.give)}` +
            `${view.design ? '（design）' : ''}${view.state === 'blocked' ? '（阻断，不算）' : ''}`,
        );
      }
    }
    if (missing.length > 0) {
      lines.push('    现有（不覆盖）：');
      for (const view of missing.slice(0, all ? missing.length : DELIVERED_LIMIT)) {
        const mark = view.state === 'blocked' ? '✗' : STATE_MARK[view.state as RouteState] ?? '·';
        lines.push(
          `      ${mark} ${view.source}  ${fmtReq(view.give)}` +
            `${view.design ? '（design）' : ''}${view.state === 'blocked' ? '（阻断，不算）' : ''}`,
        );
      }
    }
    if (row.reason !== undefined) lines.push(`    缺 ← ${REASON_LABEL[row.reason]}`);
  }
  return lines.join('\n');
}

export function formatNeedsRow(r: NeedsReport): string {
  const uncovered = r.rows.filter((row) => row.reason !== undefined).length;
  const mark = ITEM_STATE_MARK[r.state];
  return (
    `${r.id}  [${r.category}]  ${mark} ${ITEM_STATE_LABEL[r.state]}  ` +
    `窗口 ${r.rows.length} · 未覆盖 ${uncovered}`
  );
}

// ── 窗口 / 缺口行 ──────────────────────────────────────────────────────────

export function formatWindowRow(row: WindowRow): string {
  return (
    `${row.item}  ${fmtReq(row.give)}  ← ${row.source}（${SOURCE_STATE_LABEL[row.state]}）` +
    `${row.design ? '  [design，不算]' : ''}`
  );
}

export function formatGapRow(row: GapRow, all = false): string {
  const lines: string[] = [];
  const relax = row.sites.find((site) => site.onRelax !== undefined)?.onRelax;
  lines.push(
    `${row.item}  ${fmtReq(row.need)}  需求 ${row.sites.length} 处${withRelax(relax)}`,
  );
  const sites = take(row.sites, all, SITE_LIMIT);
  for (const site of sites.shown) lines.push(`  要 ← ${site.where}${withRelax(site.onRelax)}`);
  const siteTail = restLine(sites.rest, '  ');
  if (siteTail !== undefined) lines.push(siteTail);

  if (row.designOnly.length > 0) {
    lines.push('  设计 ← 仅 design 覆盖，不算满足：');
    for (const view of row.designOnly) lines.push(`    ${view.source}  ${fmtReq(view.give)}`);
  }
  const covering = row.candidates.filter((view) => view.covers);
  const missing = row.candidates.filter((view) => !view.covers);
  if (covering.length > 0) {
    lines.push('  现有 ← 覆盖但不可用：');
    for (const view of covering.slice(0, all ? covering.length : DELIVERED_LIMIT)) {
      const mark = view.state === 'blocked' ? '✗' : view.design ? '·' : '✓';
      lines.push(
        `    ${mark} ${view.source}  ${fmtReq(view.give)}` +
          `${view.design ? '（design）' : ''}${view.state === 'blocked' ? '（阻断，不算）' : ''}`,
      );
    }
  }
  if (missing.length > 0) {
    lines.push('  现有 ← 同参数但不覆盖：');
    for (const view of missing.slice(0, all ? missing.length : DELIVERED_LIMIT)) {
      const mark = view.state === 'blocked' ? '✗' : view.design ? '·' : '✓';
      lines.push(
        `    ${mark} ${view.source}  ${fmtReq(view.give)}` +
          `${view.design ? '（design）' : ''}${view.state === 'blocked' ? '（阻断，不算）' : ''}`,
      );
    }
  }
  if (row.reason !== undefined) lines.push(`  结论 ← ${REASON_LABEL[row.reason]}`);
  return lines.join('\n');
}

// ── 供 why / path 共用的小件 ────────────────────────────────────────────────
