import type { LinkKind } from './theme.ts';
import { CATEGORIES, EDGES } from './theme.ts';
import type { ViewerLink, ViewerModel, ViewerNode } from './model.ts';
import {
  endpointId,
  loadModel,
  neighborsWithin,
} from './model.ts';
import { layoutPositions } from './layout.ts';
import type { LayoutLink, LayoutNode } from './layout.ts';
import { itemDetailsHtml, overviewHtml, routeDetailsHtml } from './details.ts';
import type { RenderCtx } from './render.ts';
import { escapeHtml as esc } from './render.ts';
import { Scene3D } from './scene3d.ts';

const CATEGORY_ORDER = ['material', 'part', 'machine', 'consumable', 'carrier', 'interface'] as const;
const ROUTE_ORDER = ['route', 'measure'] as const;
const EDGE_ORDER: LinkKind[] = ['uses', 'produces', 'needs', 'performs', 'compose'];

interface AppState {
  model: ViewerModel;
  graph: Scene3D;
  render: RenderCtx;
  threshold: number;
  currentNodes: ViewerNode[];
  currentLinks: ViewerLink[];
  currentIds: Set<string>;
  focusDepth: number;
  hiddenCats: Set<string>;
  hiddenEdges: Set<LinkKind>;
  focusId: string | null;
  tick: number;
  settled: boolean;
  userMoved: boolean;
  fitted: boolean;
}

interface ViewerDebug {
  ready: boolean;
  counts: { nodes: number; links: number };
  tick: () => number;
  settled: () => boolean;
  stats: () => { visibleNodes: number; visibleLinks: number; focus: number | null };
  render: () => { nodes: number; links: number; calls: number; triangles: number; frame: number };
  zoom: () => number;
  level: (threshold: number) => void;
  ego: (id: string, depth: number) => boolean;
  select: (id: string) => boolean;
  focus: (id: string, depth?: number) => boolean;
  clear: () => void;
  fit: () => void;
}

declare global {
  interface Window {
    __viewer?: ViewerDebug;
  }
}

let state: AppState;

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (node === null) throw new Error(`missing #${id}`);
  return node as T;
}

const dom = {
  stage: el<HTMLElement>('stage'),
  graph: el<HTMLElement>('graph'),
  metaSummary: el<HTMLElement>('meta-summary'),
  validation: el<HTMLElement>('validation'),
  validationText: el<HTMLElement>('validation-text'),
  search: el<HTMLInputElement>('search'),
  searchBox: el<HTMLElement>('search-box'),
  searchResults: el<HTMLElement>('search-results'),
  categoryFilters: el<HTMLElement>('category-filters'),
  edgeFilters: el<HTMLElement>('edge-filters'),
  levelSwitch: el<HTMLElement>('level-switch'),
  levelNote: el<HTMLElement>('level-note'),
  levelCount: el<HTMLElement>('level-count'),
  visibleCount: el<HTMLElement>('visible-count'),
  focusState: el<HTMLElement>('focus-state'),
  focusBtn: el<HTMLButtonElement>('focus-btn'),
  focusClear: el<HTMLButtonElement>('focus-clear'),
  filters: el<HTMLElement>('filters'),
  filtersToggle: el<HTMLButtonElement>('filters-toggle'),
  hint: el<HTMLElement>('hint'),
  statusbar: el<HTMLElement>('statusbar'),
  statusText: el<HTMLElement>('status-text'),
  loading: el<HTMLElement>('loading'),
  loadingSub: el<HTMLElement>('loading-sub'),
  loadingBar: el<HTMLElement>('loading-bar'),
  loadingStep: el<HTMLElement>('loading-step'),
  details: el<HTMLElement>('details'),
  detailsBody: el<HTMLElement>('details-body'),
  detailsKicker: el<HTMLElement>('details-kicker'),
  detailsClose: el<HTMLButtonElement>('details-close'),
};

function frame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setLoading(pct: number, step: string): void {
  dom.loadingBar.style.width = `${pct}%`;
  dom.loadingStep.textContent = step;
}

function countVisible(): { visibleNodes: number; visibleLinks: number } {
  const nodes = state.currentNodes.filter(nodeVisible);
  const links = state.currentLinks.filter(linkVisible);
  return { visibleNodes: nodes.length, visibleLinks: links.length };
}

function subsetAt(model: ViewerModel, threshold: number): {
  nodes: ViewerNode[];
  links: ViewerLink[];
  ids: Set<string>;
} {
  if (threshold <= 0) {
    return { nodes: model.nodes, links: model.links, ids: new Set(model.nodes.map((node) => node.id)) };
  }
  const ids = new Set(model.nodes.filter((node) => node.degree >= threshold).map((node) => node.id));
  return {
    nodes: model.nodes.filter((node) => ids.has(node.id)),
    links: model.links.filter(
      (link) => ids.has(endpointId(link.source)) && ids.has(endpointId(link.target)),
    ),
    ids,
  };
}

function levelName(threshold: number): string {
  if (threshold === 0) return '全部';
  if (threshold >= 15) return '主干';
  if (threshold >= 8) return '精简';
  return '标准';
}

function nodeVisible(node: ViewerNode): boolean {
  if (!state.currentIds.has(node.id)) return false;
  if (state.hiddenCats.has(node.cat)) return false;
  return true;
}

function byIdVisible(id: string): boolean {
  const node = state.model.nodeById.get(id);
  return node !== undefined && nodeVisible(node);
}

function linkVisible(link: ViewerLink): boolean {
  if (state.hiddenEdges.has(link.kind)) return false;
  return byIdVisible(endpointId(link.source)) && byIdVisible(endpointId(link.target));
}

function redraw(): void {
  state.graph.applyRenderState();
}

function updateStatus(): void {
  if (state === undefined) return;
  const { visibleNodes, visibleLinks } = countVisible();
  const total = state.model.nodes.length;
  const links = state.model.links.length;
  const level =
    state.focusId !== null
      ? `聚焦 ${focusLabel()} · ${state.focusDepth} 跳`
      : state.threshold === 0
        ? '全部'
        : `${levelName(state.threshold)} ≥ ${state.threshold}`;
  dom.statusbar.classList.toggle('is-settled', state.settled);
  dom.statusText.textContent = state.settled
    ? `${level} · 已稳定 · 显示 ${visibleNodes.toLocaleString('zh-CN')} / ${total.toLocaleString('zh-CN')} 节点 · ${visibleLinks.toLocaleString('zh-CN')} / ${links.toLocaleString('zh-CN')} 连线`
    : `${level} · 布局中 · ${state.tick} 次迭代 · 显示 ${visibleNodes.toLocaleString('zh-CN')} 节点 / ${visibleLinks.toLocaleString('zh-CN')} 连线`;
  dom.visibleCount.textContent = `${visibleNodes} / ${total}`;
  dom.levelNote.textContent =
    state.focusId !== null
      ? `子图 ${state.focusDepth} 跳 · ${state.currentNodes.length.toLocaleString('zh-CN')} 节点 / ${state.currentLinks.length.toLocaleString('zh-CN')} 连线`
      : state.threshold === 0
        ? `全部 ${total.toLocaleString('zh-CN')} 个节点 · ${links.toLocaleString('zh-CN')} 条连线`
        : `连接度 ≥ ${state.threshold} · ${state.currentNodes.length.toLocaleString('zh-CN')} 节点 / ${state.currentLinks.length.toLocaleString('zh-CN')} 连线`;
  dom.levelCount.textContent = state.focusId !== null ? '聚焦' : level;
}

function swapGraph(
  nodes: ViewerNode[],
  links: ViewerLink[],
  ids: Set<string>,
): void {
  state.currentNodes = nodes;
  state.currentLinks = links;
  state.currentIds = ids;
  state.tick = 0;
  state.settled = true;
  state.graph.setData(nodes, links);
  updateStatus();
  redraw();
}

function restoreHome(nodes: readonly ViewerNode[]): void {
  for (const node of nodes) {
    const position = state.model.homePositions.get(node.id);
    if (position === undefined) continue;
    node.x = position[0];
    node.y = position[1];
    node.z = position[2];
    node.vx = 0;
    node.vy = 0;
    node.vz = 0;
  }
}

function applyThreshold(threshold: number, options: { keepView?: boolean } = {}): void {
  const subset = subsetAt(state.model, threshold);
  state.threshold = threshold;
  state.render.selectedId = null;
  state.render.selectedSet = null;
  state.render.labels = new Set();
  state.focusId = null;
  dom.focusState.textContent = '未聚焦。单击节点查看，或按“聚焦”。';
  updateFocusButtons();
  renderOverview();
  for (const button of dom.levelSwitch.querySelectorAll<HTMLButtonElement>('[data-level]')) {
    button.classList.toggle('active', Number(button.dataset.level) === threshold);
  }

  if (state.graph !== undefined) {
    state.userMoved = false;
    restoreHome(subset.nodes);
    swapGraph(subset.nodes, subset.links, subset.ids);
    if (!options.keepView) {
      window.setTimeout(() => {
        if (!state.userMoved) fitGraph(400);
      }, 300);
    }
  }
  updateStatus();
  redraw();
}

function ensureVisible(id: string): void {
  if (state.currentIds.has(id)) return;
  applyThreshold(0);
}

function egoSubset(id: string, depth: number): {
  nodes: ViewerNode[];
  links: ViewerLink[];
  ids: Set<string>;
} {
  const ids = neighborsWithin(state.model, id, depth);
  ids.add(id);
  return {
    nodes: state.model.nodes.filter((node) => ids.has(node.id)),
    links: state.model.links.filter(
      (link) => ids.has(endpointId(link.source)) && ids.has(endpointId(link.target)),
    ),
    ids,
  };
}

function applyMeta(model: ViewerModel): void {
  const { meta } = model.file;
  dom.metaSummary.textContent = `${meta.counts.items.toLocaleString('zh-CN')} 条目 · ${meta.counts.routes.toLocaleString('zh-CN')} 路线 · ${model.links.length.toLocaleString('zh-CN')} 关系`;
  dom.loadingSub.textContent = `${meta.counts.items.toLocaleString('zh-CN')} 条目 · ${meta.counts.routes.toLocaleString('zh-CN')} 路线 · ${model.links.length.toLocaleString('zh-CN')} 连线`;
  const bad = meta.validation.errors > 0;
  dom.validation.classList.toggle('is-bad', bad);
  dom.validationText.textContent = `${meta.validation.errors} 错误 · ${meta.validation.notes} 提示`;
  dom.validation.title = bad
    ? meta.validation.errorSample.join('\n')
    : `data/** 校验通过 · ${meta.validation.notes} 条提示`;
}

function checkboxRow(attrs: string, color: string, label: string, count: number, checked = true): string {
  return `<label class="check">
    <input type="checkbox" ${attrs} ${checked ? 'checked' : ''} />
    <span class="swatch" style="--c:${color}"></span>
    <span class="name">${esc(label)}</span>
    <span class="count">${count.toLocaleString('zh-CN')}</span>
  </label>`;
}

function buildFilters(model: ViewerModel): void {
  const counts = new Map<string, number>();
  for (const node of model.nodes) counts.set(node.cat, (counts.get(node.cat) ?? 0) + 1);

  const catRows: string[] = [];
  for (const cat of CATEGORY_ORDER) {
    const n = counts.get(cat) ?? 0;
    if (n === 0) continue;
    const meta = CATEGORIES[cat]!;
    catRows.push(checkboxRow(`data-filter-cat="${cat}"`, meta.color, meta.label, n));
  }
  for (const kind of ROUTE_ORDER) {
    const n = counts.get(kind) ?? 0;
    if (n === 0) continue;
    const meta = CATEGORIES[kind]!;
    catRows.push(checkboxRow(`data-filter-cat="${kind}"`, meta.color, meta.label, n));
  }
  dom.categoryFilters.innerHTML = catRows.join('');

  const edgeCounts = new Map<LinkKind, number>();
  for (const link of model.links) edgeCounts.set(link.kind, (edgeCounts.get(link.kind) ?? 0) + 1);

  dom.edgeFilters.innerHTML = EDGE_ORDER.map((kind) => {
    const meta = EDGES[kind];
    return checkboxRow(
      `data-filter-edge="${kind}"`,
      meta.color,
      meta.label,
      edgeCounts.get(kind) ?? 0,
      !state.hiddenEdges.has(kind),
    );
  }).join('');
}

function renderOverview(): void {
  dom.detailsKicker.textContent = 'OVERVIEW';
  dom.detailsClose.hidden = true;
  dom.detailsBody.innerHTML = overviewHtml(state.model);
  dom.detailsBody.scrollTop = 0;
}

function renderDetails(id: string): void {
  const node = state.model.nodeById.get(id);
  if (node === undefined) {
    renderOverview();
    return;
  }
  dom.detailsKicker.textContent = node.kind === 'route' ? 'ROUTE' : 'ITEM';
  dom.detailsBody.innerHTML =
    node.kind === 'route' ? routeDetailsHtml(state.model, id) : itemDetailsHtml(state.model, id);
  dom.detailsBody.scrollTop = 0;
  dom.detailsClose.hidden = false;
}

function selectNode(id: string, center: boolean): void {
  const node = state.model.nodeById.get(id);
  if (node === undefined) return;
  ensureVisible(id);

  state.render.selectedId = id;
  state.render.selectedSet = neighborsWithin(state.model, id, 1);
  renderDetails(id);
  updateFocusButtons();

  if (center) {
    state.graph.focusNode(id, 500);
  }
  redraw();
}

function clearSelection(): void {
  if (state.render.selectedId === null) return;
  state.render.selectedId = null;
  state.render.selectedSet = null;
  renderOverview();
  updateFocusButtons();
  redraw();
}

function updateFocusButtons(): void {
  const hasSelection = state.render.selectedId !== null;
  dom.focusBtn.disabled = !hasSelection;
  dom.focusClear.disabled = state.focusId === null;
}

function focusLabel(): string {
  if (state.focusId === null) return '';
  const node = state.model.nodeById.get(state.focusId);
  return node?.label ?? state.focusId;
}

function setFocus(id: string, depth: number): void {
  const node = state.model.nodeById.get(id);
  if (node === undefined) return;

  const subset = egoSubset(id, depth);
  state.focusId = id;
  state.focusDepth = depth;
  state.threshold = -1;
  state.render.selectedId = null;
  state.render.selectedSet = null;
  state.render.labels = new Set(
    subset.nodes
      .filter((n) => n.kind === 'item')
      .sort((a, b) => b.degree - a.degree)
      .slice(0, 20)
      .map((n) => n.id),
  );
  const root = state.model.nodeById.get(id);
  if (root !== undefined) state.render.labels.add(id);
  state.userMoved = false;

  for (const button of dom.levelSwitch.querySelectorAll<HTMLButtonElement>('[data-level]')) {
    button.classList.remove('active');
  }
  dom.focusState.innerHTML = `聚焦 <b>${esc(node.label)}</b><br /><span>${depth} 跳 · ${subset.nodes.length} 个节点</span>`;
  dom.focusClear.disabled = false;

  // 聚焦只切换子图，沿用预计算 3D 坐标；不在浏览器里重跑力模拟。
  swapGraph(subset.nodes, subset.links, subset.ids);
  selectNode(id, false);
  state.render.selectedSet = null;
  updateStatus();
  redraw();

  window.setTimeout(() => {
    if (!state.userMoved) fitGraph(300);
  }, 80);
}

function clearFocus(): void {
  if (state.focusId === null) return;
  state.focusId = null;
  dom.focusState.textContent = '未聚焦。单击节点查看，或按“聚焦”。';
  applyThreshold(0);
}

function applyVisibility(): void {
  state.graph.refresh();
  updateStatus();
}

function fitGraph(duration = 480): void {
  const filtersWidth = dom.filters.classList.contains('is-collapsed')
    ? 0
    : dom.filters.offsetWidth;
  state.graph.fit(duration, filtersWidth / 2);
  state.fitted = true;
}

function initGraph(): Scene3D {
  const graph = new Scene3D({
    container: dom.graph,
    renderState: state.render,
    nodeVisible,
    linkVisible,
    onNodeClick: (id) => selectNode(id, true),
    onBackgroundClick: () => clearSelection(),
  });
  graph.setData(state.currentNodes, state.currentLinks);
  graph.fit(0, dom.filters.offsetWidth / 2);
  state.settled = true;
  updateStatus();

  dom.graph.addEventListener('pointerdown', () => {
    state.userMoved = true;
  });
  dom.graph.addEventListener(
    'wheel',
    () => {
      state.userMoved = true;
    },
    { passive: true },
  );

  return graph;
}

/* ── 搜索 ─────────────────────────────────────────────────────────────── */

let searchRows: { id: string; label: string; kind: string; color: string; degree: number; haystack: string }[] = [];
let searchActive = -1;
let currentMatches: string[] = [];

function buildSearchIndex(model: ViewerModel): void {
  searchRows = model.nodes.map((node) => ({
    id: node.id,
    label: node.label,
    kind: node.kind === 'route' ? (node.route?.kind === 'measure' ? '测量' : '路线') : (CATEGORIES[node.cat]?.label ?? node.cat),
    color: node.color,
    degree: node.degree,
    haystack: `${node.id} ${node.label}`.toLowerCase(),
  }));
}

function searchResultHtml(row: (typeof searchRows)[number]): string {
  return `<button class="search-row" data-nav="${esc(row.id)}">
    <span class="search-dot" style="background:${row.color}"></span>
    <span class="search-main"><b>${esc(row.label)}</b><small>${esc(row.id)}</small></span>
    <span class="search-kind">${esc(row.kind)}</span>
  </button>`;
}

function setMatches(query: string): void {
  if (query.length < 2) {
    currentMatches = [];
  } else {
    const q = query.toLowerCase();
    const matches: string[] = [];
    for (const row of searchRows) {
      if (row.haystack.includes(q) && matches.length < 160) matches.push(row.id);
    }
    currentMatches = matches;
  }
  state.render.matches = new Set(currentMatches);
  redraw();
}

function hideSearch(): void {
  dom.searchResults.hidden = true;
  dom.searchResults.innerHTML = '';
  searchActive = -1;
}

function chooseSearch(id: string): void {
  hideSearch();
  dom.search.value = '';
  setMatches('');
  selectNode(id, true);
}

function runSearch(raw: string): void {
  const query = raw.trim().toLowerCase();
  if (query.length === 0) {
    hideSearch();
    setMatches('');
    return;
  }

  const matches: typeof searchRows = [];
  for (const row of searchRows) {
    const idx = row.haystack.indexOf(query);
    if (idx < 0) continue;
    const score = (idx === 0 ? 0 : row.haystack.endsWith(`/${query}`) ? 1 : 2) * 100000 - row.degree;
    matches.push({ ...row, degree: score });
  }
  matches.sort((a, b) => a.degree - b.degree);
  const top = matches.slice(0, 12);
  searchActive = top.length > 0 ? 0 : -1;

  if (top.length === 0) {
    dom.searchResults.innerHTML = `<p class="search-empty">没有匹配的 id</p>`;
  } else {
    dom.searchResults.innerHTML = top.map(searchResultHtml).join('');
  }
  dom.searchResults.hidden = false;
  setMatches(query);
}

function highlightSearch(index: number): void {
  const rows = [...dom.searchResults.querySelectorAll<HTMLElement>('.search-row')];
  rows.forEach((row, i) => row.classList.toggle('active', i === index));
  if (rows[index] !== undefined) rows[index]!.scrollIntoView({ block: 'nearest' });
}

/* ── 控件 ─────────────────────────────────────────────────────────────── */

function wireControls(): void {
  dom.categoryFilters.addEventListener('change', (event) => {
    const input = event.target as HTMLInputElement;
    const cat = input.dataset.filterCat;
    if (cat === undefined) return;
    if (input.checked) state.hiddenCats.delete(cat);
    else state.hiddenCats.add(cat);
    applyVisibility();
  });

  dom.edgeFilters.addEventListener('change', (event) => {
    const input = event.target as HTMLInputElement;
    const kind = input.dataset.filterEdge as LinkKind | undefined;
    if (kind === undefined) return;
    if (input.checked) state.hiddenEdges.delete(kind);
    else state.hiddenEdges.add(kind);
    applyVisibility();
  });

  dom.levelSwitch.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-level]');
    if (button === null || button.dataset.level === undefined) return;
    const next = Number(button.dataset.level);
    if (next === state.threshold) return;
    applyThreshold(next);
  });

  dom.search.addEventListener('input', () => runSearch(dom.search.value));
  dom.search.addEventListener('focus', () => {
    if (dom.search.value.trim() !== '') runSearch(dom.search.value);
  });
  dom.search.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      hideSearch();
      dom.search.blur();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const count = dom.searchResults.querySelectorAll('.search-row').length;
      if (count === 0) return;
      searchActive = (searchActive + (event.key === 'ArrowDown' ? 1 : -1) + count) % count;
      highlightSearch(searchActive);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const first = dom.searchResults.querySelector<HTMLElement>('.search-row.active') ?? dom.searchResults.querySelector<HTMLElement>('.search-row');
      const id = first?.dataset.nav;
      if (id !== undefined) chooseSearch(id);
    }
  });
  dom.search.addEventListener('blur', () => {
    window.setTimeout(() => {
      if (!dom.searchResults.contains(document.activeElement)) hideSearch();
    }, 120);
  });

  dom.searchResults.addEventListener('mousedown', (event) => event.preventDefault());
  dom.searchResults.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-nav]');
    if (target?.dataset.nav !== undefined) chooseSearch(target.dataset.nav);
  });

  dom.detailsBody.addEventListener('click', (event) => {
    const focusTarget = (event.target as HTMLElement).closest<HTMLElement>('[data-focus]');
    if (focusTarget?.dataset.focus !== undefined) {
      setFocus(focusTarget.dataset.focus, state.focusDepth);
      selectNode(focusTarget.dataset.focus, true);
      return;
    }
    const nav = (event.target as HTMLElement).closest<HTMLElement>('[data-nav]');
    if (nav?.dataset.nav !== undefined) selectNode(nav.dataset.nav, true);
  });

  dom.detailsClose.addEventListener('click', () => clearSelection());

  dom.focusBtn.addEventListener('click', () => {
    if (state.render.selectedId !== null) {
      setFocus(state.render.selectedId, state.focusDepth);
      selectNode(state.render.selectedId, true);
    }
  });
  dom.focusClear.addEventListener('click', () => clearFocus());

  const depthSwitch = document.getElementById('depth-switch');
  depthSwitch?.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-depth]');
    if (button === null || button.dataset.depth === undefined) return;
    state.focusDepth = Number(button.dataset.depth);
    for (const b of depthSwitch.querySelectorAll<HTMLButtonElement>('[data-depth]')) {
      b.classList.toggle('active', b === button);
    }
    if (state.focusId !== null) setFocus(state.focusId, state.focusDepth);
  });

  el<HTMLButtonElement>('reheat').addEventListener('click', () => {
    state.userMoved = false;
    restoreHome(state.currentNodes);
    swapGraph(state.currentNodes, state.currentLinks, state.currentIds);
    fitGraph(240);
  });
  el<HTMLButtonElement>('fit').addEventListener('click', () => {
    state.userMoved = false;
    fitGraph(480);
  });
  el<HTMLButtonElement>('zoom-fit').addEventListener('click', () => {
    state.userMoved = false;
    fitGraph(480);
  });
  el<HTMLButtonElement>('zoom-in').addEventListener('click', () => {
    state.graph.zoomBy(1.45);
  });
  el<HTMLButtonElement>('zoom-out').addEventListener('click', () => {
    state.graph.zoomBy(1 / 1.45);
  });

  dom.filtersToggle.addEventListener('click', () => {
    dom.filters.classList.toggle('is-collapsed');
    const collapsed = dom.filters.classList.contains('is-collapsed');
    dom.filtersToggle.title = collapsed ? '展开过滤面板' : '收起过滤面板';
  });

  document.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement;
    const typing = target.matches('input, textarea, select') || target.isContentEditable;
    if (event.key === '/' && !typing) {
      event.preventDefault();
      dom.search.focus();
      dom.search.select();
      return;
    }
    if (event.key === 'Escape') {
      if (!dom.searchResults.hidden) hideSearch();
      else if (state.render.selectedId !== null) clearSelection();
      else if (state.focusId !== null) clearFocus();
    }
  });

  window.addEventListener('resize', () => {
    if (state.graph !== undefined) {
      const width = dom.graph.clientWidth;
      const height = dom.graph.clientHeight;
      if (width > 0 && height > 0) state.graph.setSize(width, height);
    }
  });
}

/* ── 启动 ─────────────────────────────────────────────────────────────── */

function showFatal(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  dom.loading.classList.add('hidden');
  dom.statusbar.classList.add('is-error');
  dom.statusText.textContent = '装载失败';
  dom.detailsKicker.textContent = 'ERROR';
  dom.detailsBody.innerHTML = `<div class="fatal"><h2>数据未能装载</h2><p>${esc(message)}</p><p class="hint-block">在 <code>viewer/</code> 下运行 <code>pnpm data</code> 生成 <code>public/graph.json</code>，再刷新本页。</p></div>`;
  dom.detailsClose.hidden = true;
}

async function boot(): Promise<void> {
  try {
    setLoading(8, '读取 graph.json');
    await frame();
    const model = await loadModel();
    // 旧 graph.json 没有预计算坐标时，先在本地补一次布局，避免页面只有一团平面散点。
    if (model.file.positions === undefined) {
      setLoading(50, '首次布局（旧 graph.json 没有坐标）');
      await frame();
      layoutPositions(
        model.nodes as unknown as LayoutNode[],
        model.links as unknown as LayoutLink[],
        { ticks: 80, reset: true },
      );
      for (const node of model.nodes) {
        model.homePositions.set(node.id, [node.x ?? 0, node.y ?? 0, node.z ?? 0]);
      }
    }
    setLoading(52, `建立索引 · ${model.nodes.length.toLocaleString('zh-CN')} 个节点`);
    await frame();

    state = {
      model,
      graph: undefined as unknown as Scene3D,
      render: {
        selectedId: null,
        hoverId: null,
        selectedSet: null,
        matches: new Set(),
        labels: new Set(),
      },
      threshold: 0,
      currentNodes: [],
      currentLinks: [],
      currentIds: new Set(),
      focusDepth: 2,
      hiddenCats: new Set(),
      hiddenEdges: new Set<LinkKind>(['needs']),
      focusId: null,
      tick: 0,
      settled: false,
      userMoved: false,
      fitted: false,
    };
    const initial = subsetAt(model, state.threshold);
    state.currentNodes = initial.nodes;
    state.currentLinks = initial.links;
    state.currentIds = initial.ids;

    applyMeta(model);
    buildFilters(model);
    buildSearchIndex(model);
    renderOverview();
    setLoading(62, '装配 3D 场景');
    await frame();

    state.graph = initGraph();
    wireControls();

    setLoading(76, '绘制画布');
    await sleep(60);
    updateStatus();
    setTimeout(() => {
      dom.loading.classList.add('hidden');
      setLoading(100, '就绪');
    }, 250);
    setTimeout(() => {
      if (!state.userMoved) fitGraph(600);
    }, 800);

    window.__viewer = {
      ready: true,
      counts: { nodes: model.nodes.length, links: model.links.length },
      tick: () => state.tick,
      settled: () => state.settled,
      stats: () => {
        const { visibleNodes, visibleLinks } = countVisible();
        return {
          visibleNodes,
          visibleLinks,
          focus: state.focusId !== null ? state.currentNodes.length : null,
        };
      },
      render: () => state.graph.getStats(),
      zoom: () => state.graph.getZoom(),
      level: (threshold) => {
        applyThreshold(Number.isFinite(threshold) ? Math.max(0, threshold) : 0, { keepView: true });
      },
      ego: (id, depth) => {
        if (!state.model.nodeById.has(id)) return false;
        setFocus(id, depth);
        return true;
      },
      select: (id) => {
        if (!model.nodeById.has(id)) return false;
        selectNode(id, true);
        return true;
      },
      focus: (id, depth = 2) => {
        if (!model.nodeById.has(id)) return false;
        setFocus(id, depth);
        return true;
      },
      clear: () => {
        clearFocus();
        clearSelection();
      },
      fit: () => fitGraph(0),
    };
  } catch (error) {
    showFatal(error);
    console.error(error);
  }
}

void boot();
