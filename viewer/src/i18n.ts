import type { ViewerNode } from './model.ts';
import { CATEGORIES, EDGES } from './theme.ts';
import type { LinkKind } from './theme.ts';

export type Lang = 'en' | 'zh';

const STORAGE_KEY = 'mars-viewer-lang';

const MESSAGES = {
  'page.title': { en: 'Mars Industrial System · Data Network', zh: '火星工业体系 · 数据网络' },
  'common.loading': { en: 'Loading', zh: '读取中' },
  'common.validating': { en: 'Validating', zh: '校验中' },
  'brand.title': { en: 'Mars Industrial System', zh: '火星工业体系' },
  'brand.sub': { en: 'Data network', zh: '数据网络' },
  'search.placeholder': { en: 'Search English / Chinese name or id', zh: '搜索英文名 / 中文名 / id' },
  'search.label': { en: 'Search item or route by English name, Chinese name, or id', zh: '搜索条目或路线的英文名、中文名或 id' },
  'search.empty': { en: 'No matching name or id', zh: '没有匹配的名称或 id' },
  'search.kind.measure': { en: 'Measurement', zh: '测量' },
  'search.kind.route': { en: 'Manufacturing', zh: '制造' },
  'validation.title': { en: 'Model validation', zh: '模型校验' },
  'validation.summary': { en: '{errors} errors · {notes} notes', zh: '{errors} 错误 · {notes} 提示' },
  'validation.okTitle': { en: 'data/** validation passed · {notes} notes', zh: 'data/** 校验通过 · {notes} 条提示' },
  'filters.title': { en: 'Filters', zh: '过滤' },
  'filters.collapse': { en: 'Collapse filters', zh: '收起过滤面板' },
  'filters.expand': { en: 'Expand filters', zh: '展开过滤面板' },
  'filters.nodes': { en: 'Nodes', zh: '节点' },
  'filters.edges': { en: 'Links', zh: '连线' },
  'filters.needsNote': { en: 'Prerequisites are hidden by default; enable them here.', zh: '前提默认关闭，可在此开启。' },
  'filters.detail': { en: 'Detail', zh: '细节' },
  'filters.detailAria': { en: 'Detail level', zh: '细节层级' },
  'filters.trunk': { en: 'Trunk', zh: '主干' },
  'filters.slim': { en: 'Slim', zh: '精简' },
  'filters.standard': { en: 'Standard', zh: '标准' },
  'filters.all': { en: 'All', zh: '全部' },
  'filters.focus': { en: 'Focus', zh: '聚焦' },
  'filters.focusHint': { en: 'Not focused. Click a node to inspect, or press Focus.', zh: '未聚焦。单击节点查看，或按“聚焦”。' },
  'filters.range': { en: 'Depth', zh: '范围' },
  'filters.depthAria': { en: 'Focus depth', zh: '聚焦跳数' },
  'filters.hops1': { en: '1 hop', zh: '1 跳' },
  'filters.hops2': { en: '2 hops', zh: '2 跳' },
  'filters.hops3': { en: '3 hops', zh: '3 跳' },
  'filters.focusSelected': { en: 'Focus selected', zh: '聚焦选中节点' },
  'filters.clear': { en: 'Clear', zh: '清除' },
  'filters.layout': { en: 'Layout', zh: '布局' },
  'filters.reheat': { en: 'Reset layout', zh: '恢复布局' },
  'filters.fit': { en: 'Fit view', zh: '适应窗口' },
  'stage.aria': { en: 'Data network graph', zh: '数据网络图' },
  'stage.hint': { en: 'Drag to rotate · Scroll to zoom · Right-drag to pan · Click a node for details', zh: '拖拽旋转 · 滚轮缩放 · 右键平移 · 单击节点查看详情' },
  'zoom.in': { en: 'Zoom in', zh: '放大' },
  'zoom.out': { en: 'Zoom out', zh: '缩小' },
  'zoom.fit': { en: 'Fit view', zh: '适应窗口' },
  'status.loading': { en: 'Loading data', zh: '正在装载数据' },
  'status.all': { en: 'All', zh: '全部' },
  'status.trunk': { en: 'Trunk', zh: '主干' },
  'status.slim': { en: 'Slim', zh: '精简' },
  'status.standard': { en: 'Standard', zh: '标准' },
  'status.focus': { en: 'Focus {label} · {depth} hops', zh: '聚焦 {label} · {depth} 跳' },
  'status.settled': { en: '{level} · Settled · {visible} / {total} nodes · {links} / {allLinks} links', zh: '{level} · 已稳定 · 显示 {visible} / {total} 节点 · {links} / {allLinks} 连线' },
  'status.layout': { en: '{level} · Laying out · {tick} iterations · {visible} nodes / {links} links', zh: '{level} · 布局中 · {tick} 次迭代 · 显示 {visible} 节点 / {links} 连线' },
  'status.levelNoteFocus': { en: 'Subgraph {depth} hops · {nodes} nodes / {links} links', zh: '子图 {depth} 跳 · {nodes} 节点 / {links} 连线' },
  'status.levelNoteAll': { en: 'All {nodes} nodes · {links} links', zh: '全部 {nodes} 个节点 · {links} 条连线' },
  'status.levelNoteThreshold': { en: 'Degree ≥ {threshold} · {nodes} nodes / {links} links', zh: '连接度 ≥ {threshold} · {nodes} 节点 / {links} 连线' },
  'status.levelCountFocus': { en: 'Focus', zh: '聚焦' },
  'meta.summary': { en: '{items} items · {routes} routes · {links} relations', zh: '{items} 条目 · {routes} 路线 · {links} 关系' },
  'meta.loadingCounts': { en: '{items} items · {routes} routes · {links} links', zh: '{items} 条目 · {routes} 路线 · {links} 连线' },
  'focus.state': { en: 'Focused <b>{label}</b><br /><span>{depth} hops · {nodes} nodes</span>', zh: '聚焦 <b>{label}</b><br /><span>{depth} 跳 · {nodes} 个节点</span>' },
  'loading.title': { en: 'Building network', zh: '正在构建网络' },
  'loading.sub': { en: 'Reading items and routes under data/', zh: '正在读取 data/ 下的条目与路线' },
  'loading.step': { en: 'Loading graph.json', zh: '装载 graph.json' },
  'loading.reading': { en: 'Reading graph.json', zh: '读取 graph.json' },
  'loading.layout': { en: 'First layout (old graph.json has no positions)', zh: '首次布局（旧 graph.json 没有坐标）' },
  'loading.index': { en: 'Building index · {n} nodes', zh: '建立索引 · {n} 个节点' },
  'loading.scene': { en: 'Assembling 3D scene', zh: '装配 3D 场景' },
  'loading.draw': { en: 'Drawing canvas', zh: '绘制画布' },
  'loading.ready': { en: 'Ready', zh: '就绪' },
  'details.overview': { en: 'OVERVIEW', zh: '总览' },
  'details.item': { en: 'ITEM', zh: '条目' },
  'details.route': { en: 'ROUTE', zh: '路线' },
  'details.close': { en: 'Close details', zh: '关闭详情' },
  'details.placeholder': { en: 'Loading…', zh: '装载中…' },
  'details.unit': { en: 'Unit', zh: '计量单位' },
  'details.mass': { en: 'Unit mass', zh: '单件质量' },
  'details.degree': { en: 'Degree', zh: '连接度' },
  'details.interface': { en: 'Implements interface', zh: '实现接口' },
  'details.specs': { en: 'Specification declarations', zh: '规格声明' },
  'details.noProps': { en: 'No declared properties', zh: '未声明属性' },
  'details.propsCount': { en: '{n} properties', zh: '{n} 项' },
  'details.holds': { en: 'Maintained conditions', zh: '维持条件' },
  'details.noHolds': { en: 'No maintained conditions', zh: '不维持条件' },
  'details.composition': { en: 'Composition', zh: '组成' },
  'details.noComponents': { en: 'No composition list', zh: '无组成清单' },
  'details.compositionCount': { en: '{n} parts', zh: '{n} 件' },
  'details.producers': { en: 'Produced by', zh: '产出它的路线' },
  'details.noProducers': { en: 'No production route (external input or pending)', zh: '没有产出路线（外部输入或待补）' },
  'details.producersCount': { en: '{n} routes', zh: '{n} 条' },
  'details.consumers': { en: 'Consumed by', zh: '消耗它的路线' },
  'details.consumersCount': { en: '{n} routes', zh: '{n} 条' },
  'details.needers': { en: 'Required by', zh: '把它当前提的路线' },
  'details.needersCount': { en: '{n} routes', zh: '{n} 条' },
  'details.performers': { en: 'Performed by', zh: '由它执行的路线' },
  'details.performersCount': { en: '{n} routes', zh: '{n} 条' },
  'details.parents': { en: 'Installed in', zh: '装进哪些条目' },
  'details.parentsCount': { en: '{n} items', zh: '{n} 件' },
  'details.focusGraph': { en: 'Focus in graph', zh: '在图中聚焦' },
  'details.seedNote': { en: 'Seed item: the first unit comes from Earth; local routes are required from the second unit (R9).', zh: '种子条目：第一件从地球运来，从第二件起必须有本地路线（R9）。' },
  'details.marsNote': { en: 'Mars floor: available on site, no route required.', zh: '火星地板：不需要路线，现场即可取。' },
  'details.seed': { en: 'Seed', zh: '种子' },
  'details.mars': { en: 'Mars floor', zh: '火星地板' },
  'details.abstract': { en: 'Abstract interface', zh: '抽象接口' },
  'details.monolithic': { en: 'Monolithic', zh: '单体' },
  'details.deferred': { en: 'Undefined', zh: '未定义' },
  'details.notFoundItem': { en: 'Item {id} not found', zh: '未找到条目 {id}' },
  'details.notFoundRoute': { en: 'Route {id} not found', zh: '未找到路线 {id}' },
  'details.more': { en: '{n} more · use search or focus', zh: '另有 {n} 项 · 用搜索或聚焦查看' },
  'details.none': { en: 'None', zh: '无' },
  'details.route.measure': { en: 'Measurement route', zh: '测量路线' },
  'details.route.make': { en: 'Manufacturing route', zh: '制造路线' },
  'details.route.batchHours': { en: 'Batch hours', zh: '批量工时' },
  'details.route.notDeclared': { en: 'Not declared', zh: '未声明' },
  'details.route.batch': { en: '{n} h / batch', zh: '{n} h / 批' },
  'details.route.inputClauses': { en: 'Input clauses', zh: '投料子句' },
  'details.route.outputs': { en: 'Outputs', zh: '产物' },
  'details.route.prerequisites': { en: 'Prerequisites', zh: '前提' },
  'details.route.equipment': { en: 'Equipment', zh: '执行设备' },
  'details.route.steps': { en: 'Process steps', zh: '工序段' },
  'details.route.outputsCount': { en: '{n} items', zh: '{n} 项' },
  'details.route.inputs': { en: 'Inputs', zh: '投料' },
  'details.route.inputsCount': { en: '{n} clauses', zh: '{n} 子句' },
  'details.route.prereqCount': { en: '{n} items', zh: '{n} 项' },
  'details.route.equipmentCount': { en: '{n} machines', zh: '{n} 台' },
  'details.route.stepsCount': { en: '{n} stages', zh: '{n} 段' },
  'details.route.conditions': { en: 'Conditions', zh: '条件' },
  'details.route.conditionsCount': { en: '{n} conditions', zh: '{n} 项' },
  'details.route.noOutputs': { en: 'No outputs', zh: '无产物' },
  'details.route.noInputs': { en: 'No inputs', zh: '无投料' },
  'details.route.noPrereq': { en: 'No prerequisites', zh: '无前提' },
  'details.route.noEquipment': { en: 'No equipment specified', zh: '未指定执行设备' },
  'details.route.noSteps': { en: 'No process chain', zh: '未写工序链' },
  'details.route.noConditions': { en: 'No route-level conditions', zh: '无路线级条件' },
  'details.route.clause': { en: 'Clause {n}', zh: '子句 {n}' },
  'details.route.anyOf': { en: 'Any one', zh: '任选其一' },
  'details.route.deliverySpecs': { en: 'Delivery specs {n}', zh: '交付规格 {n} 项' },
  'details.route.requiredSpecs': { en: 'Required specs {n}', zh: '要求规格 {n} 项' },
  'details.route.massNote': { en: 'Mass balance note', zh: '质量账说明' },
  'details.route.outputsBadge': { en: '{n} outputs', zh: '{n} 产物' },
  'details.route.inputsBadge': { en: '{n} inputs', zh: '{n} 投料' },
  'details.noPerformer': { en: 'No performer', zh: '未写执行者' },
  'details.stepConditions': { en: '{n} conditions', zh: '{n} 项条件' },
  'details.prop.design': { en: 'design', zh: '设计' },
  'details.prop.atLeast': { en: 'higher is better', zh: '越大越好' },
  'details.prop.atMost': { en: 'lower is better', zh: '越小越好' },
  'details.prop.window': { en: 'window', zh: '窗口' },
  'overview.intro': { en: 'Lay out every item and route in <code>data/</code> as one network: circles are items, diamonds are routes; links are inputs, outputs, prerequisites, performers, and composition. Click any node to inspect its source and specifications.', zh: '把 <code>data/</code> 的全部条目与路线摊成一张网：圆点是物件，菱形是路线；连线是投料、产出、前提、执行与组成。点任意节点查看原文与规格。' },
  'overview.items': { en: 'Items', zh: '条目' },
  'overview.routes': { en: 'Routes', zh: '路线' },
  'overview.links': { en: 'Links', zh: '连线' },
  'overview.errors': { en: 'Validation errors', zh: '校验错误' },
  'overview.categories': { en: 'Category distribution', zh: '类别分布' },
  'overview.categoriesCount': { en: '{n} items', zh: '{n} 条目' },
  'overview.seeds': { en: 'Seeds · first unit from Earth', zh: '种子 · 第一件从地球来' },
  'overview.seedsCount': { en: '{n} items', zh: '{n} 件' },
  'overview.hubs': { en: 'Most connected', zh: '连接度最高' },
  'overview.hubsCount': { en: 'Click to jump', zh: '点击跳转' },
  'overview.reading': { en: 'How to read', zh: '读法' },
  'overview.readingText': { en: 'Wheel to zoom, drag to rotate, right-drag to pan; click a node for details. The left panel filters by category and link type, and can isolate the 1–3 hop neighborhood of a node. Orange is input, teal is output, purple is performer, blue is composition; "Prerequisite" is hidden by default. After selecting a node, press "Focus selected" to keep only its neighborhood and re-layout, so you can read a local network upstream and downstream.', zh: '滚轮缩放、拖拽旋转、右键平移；单击节点在右侧看详情。左侧可以按类别与连线类型过滤，也可以把某个节点的一至三跳邻域单独摊开。橙色是投料、青色是产出、紫色是执行、蓝色是组成；「前提」默认关闭。选中节点后按「聚焦选中节点」，只留下它的邻域重排，用来顺着上下游读一张局部网。' },
  'overview.generated': { en: 'Data generated {date} · {n} validation notes', zh: '数据生成于 {date} · {n} 条校验提示' },
  'overview.degree': { en: 'Degree {n}', zh: '连接 {n}' },
  'tooltip.degree': { en: 'Degree {n}', zh: '连接度 {n}' },
  'tooltip.unit': { en: 'Counted as {unit}', zh: '单位 {unit}' },
  'tooltip.mass': { en: 'Mass {mass} kg', zh: '质量 {mass} kg' },
  'tooltip.seed': { en: 'Seed · first unit from Earth', zh: '种子 · 第一台从地球来' },
  'tooltip.mars': { en: 'Mars floor · available on site', zh: '火星地板 · 现场可取' },
  'tooltip.route': { en: 'Inputs {inputs} · outputs {outputs}', zh: '投料 {inputs} 项 · 产物 {outputs} 项' },
  'fatal.status': { en: 'Load failed', zh: '装载失败' },
  'fatal.title': { en: 'Data could not be loaded', zh: '数据未能装载' },
  'fatal.hint': { en: 'Run <code>pnpm data</code> in <code>viewer/</code> to generate <code>public/graph.json</code>, then refresh this page.', zh: '在 <code>viewer/</code> 下运行 <code>pnpm data</code> 生成 <code>public/graph.json</code>，再刷新本页。' },
  'error.graph': { en: 'Failed to read {url} (HTTP {status}). Run pnpm data first.', zh: '{url} 读取失败（HTTP {status}）。先运行 pnpm data 生成。' },
  'language.label': { en: 'Language', zh: '语言' },
  'language.en': { en: 'EN', zh: 'EN' },
  'language.zh': { en: '中文', zh: '中文' },
} as const;

export type MessageKey = keyof typeof MESSAGES;

function detectLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  const param = new URLSearchParams(window.location.search).get('lang');
  if (param === 'en' || param === 'zh') return param;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'zh') return stored;
  } catch {
    // localStorage may be unavailable in private sessions.
  }
  return 'en';
}

let current: Lang = detectLang();

export function getLang(): Lang {
  return current;
}

export function setLang(next: Lang): void {
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Persisting is optional.
  }
  document.documentElement.lang = next === 'en' ? 'en' : 'zh-CN';
  const url = new URL(window.location.href);
  url.searchParams.set('lang', next);
  window.history.replaceState(null, '', url);
}

export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  let text: string = MESSAGES[key][current];
  if (vars !== undefined) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

export function n(value: number): string {
  return value.toLocaleString(current === 'en' ? 'en-US' : 'zh-CN');
}

const UNIT_EN: Record<string, string> = {
  件: 'piece',
  份: 'copy',
  台: 'machine',
  片: 'piece',
  套: 'set',
  只: 'piece',
  座: 'unit',
  间: 'room',
  瓶: 'bottle',
  块: 'block',
  把: 'piece',
  张: 'sheet',
  组: 'set',
  支: 'piece',
  条: 'strip',
  颗: 'piece',
};

export function unitLabel(unit: string): string {
  return current === 'en' ? (UNIT_EN[unit] ?? unit) : unit;
}

export function catLabel(cat: string): string {
  const meta = CATEGORIES[cat];
  if (meta === undefined) return cat;
  return current === 'en' ? meta.label : meta.labelZh;
}

export function edgeLabel(kind: LinkKind): string {
  const meta = EDGES[kind];
  return current === 'en' ? meta.label : meta.labelZh;
}

export function nodeLabel(node: ViewerNode): string {
  return current === 'en' ? node.label : node.labelZh;
}

export function nodeKindLabel(node: ViewerNode): string {
  if (node.kind === 'route') {
    return t(node.route?.kind === 'measure' ? 'search.kind.measure' : 'search.kind.route');
  }
  return catLabel(node.cat);
}

export function applyStaticI18n(): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-i18n]')) {
    const key = el.dataset.i18n as MessageKey | undefined;
    if (key !== undefined && key in MESSAGES) el.textContent = t(key);
  }
  for (const el of document.querySelectorAll<HTMLElement>('[data-i18n-title]')) {
    const key = el.dataset.i18nTitle as MessageKey | undefined;
    if (key !== undefined && key in MESSAGES) el.title = t(key);
  }
  for (const el of document.querySelectorAll<HTMLElement>('[data-i18n-aria]')) {
    const key = el.dataset.i18nAria as MessageKey | undefined;
    if (key !== undefined && key in MESSAGES) el.setAttribute('aria-label', t(key));
  }
  for (const el of document.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]')) {
    const key = el.dataset.i18nPlaceholder as MessageKey | undefined;
    if (key !== undefined && key in MESSAGES) el.placeholder = t(key);
  }
  document.documentElement.lang = current === 'en' ? 'en' : 'zh-CN';
}
