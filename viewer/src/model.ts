import type { LinkKind } from './theme.ts';
import { itemColor, routeColor } from './theme.ts';

export interface PropLite {
  p: string;
  k: 'range' | 'enum' | 'set';
  min?: number;
  max?: number;
  u?: string;
  d?: string;
  v?: string[];
  oneOf?: string[];
  atLeast?: string[];
  design?: 1;
}

export interface CondLite {
  p: string;
  min: number;
  max: number;
  design?: 1;
}

export interface ComponentRaw {
  i: string;
  q: number;
  sel?: string;
}

export interface ItemRaw {
  id: string;
  /** 中文展示名。旧 graph.json 没有这个字段时退回 id 尾段。 */
  name?: string;
  cat: string;
  unit?: string;
  mass?: number;
  iface?: 1;
  ext?: string;
  seed?: 1;
  mars?: 1;
  mono?: 1;
  deferred?: 1;
  props?: PropLite[];
  holds?: CondLite[];
  comp?: ComponentRaw[];
  consumption?: { i: string; q: number; per: number }[];
}

export interface TermRaw {
  i: string;
  q: number;
  g?: PropLite[];
}

export interface OptionRaw {
  i: string;
  q: number;
  need?: PropLite[];
}

export interface RouteRaw {
  id: string;
  /** 中文展示名。旧 graph.json 没有这个字段时退回 id 尾段。 */
  name?: string;
  kind: 'make' | 'measure';
  p: TermRaw[];
  u: { anyOf: OptionRaw[] }[];
  n: OptionRaw[];
  pb: string[];
  steps: { b?: string; n?: string; u?: CondLite[] }[];
  under: CondLite[];
  rate?: number;
  unbal?: string;
}

export interface Meta {
  generatedAt: string;
  source: string;
  counts: {
    items: number;
    routes: number;
    categories: Record<string, number>;
    edges: Record<LinkKind, number>;
  };
  validation: { errors: number; notes: number; errorSample: string[] };
  seeds: string[];
}

export interface GraphFile {
  meta: Meta;
  items: ItemRaw[];
  routes: RouteRaw[];
  /** generate.ts 预计算的坐标；没有就退回初始球面位置。 */
  positions?: Record<string, [number, number, number]>;
}

export interface ViewerNode {
  id: string;
  kind: 'item' | 'route';
  label: string;
  cat: string;
  color: string;
  r: number;
  degree: number;
  item?: ItemRaw;
  route?: RouteRaw;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  fx?: number;
  fy?: number;
  fz?: number;
}

export interface ViewerLink {
  id: string;
  kind: LinkKind;
  route?: string;
  source: string | ViewerNode;
  target: string | ViewerNode;
}

export interface ViewerModel {
  file: GraphFile;
  items: ItemRaw[];
  routes: RouteRaw[];
  nodes: ViewerNode[];
  links: ViewerLink[];
  nodeById: Map<string, ViewerNode>;
  itemById: Map<string, ItemRaw>;
  routeById: Map<string, RouteRaw>;
  neighbors: Map<string, Set<string>>;
  /** 全库预计算位置：切回“全部 / 层级”时用来还原，不把聚焦时的局部坐标带回去。 */
  homePositions: Map<string, [number, number, number]>;
  producersByItem: Map<string, string[]>;
  consumersByItem: Map<string, string[]>;
  needersByItem: Map<string, string[]>;
  performersByItem: Map<string, string[]>;
  parentsByComponent: Map<string, string[]>;
  routeKindCount: { make: number; measure: number };
}

export function endpointId(end: string | ViewerNode): string {
  return typeof end === 'string' ? end : end.id;
}

export function labelOf(id: string): string {
  const slash = id.lastIndexOf('/');
  return slash >= 0 ? id.slice(slash + 1) : id;
}

function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pushIndex(map: Map<string, string[]>, key: string, value: string): void {
  const arr = map.get(key);
  if (arr === undefined) map.set(key, [value]);
  else if (!arr.includes(value)) arr.push(value);
}

export function buildModel(file: GraphFile): ViewerModel {
  const itemById = new Map(file.items.map((it) => [it.id, it]));
  const routeById = new Map(file.routes.map((r) => [r.id, r]));

  const nodes: ViewerNode[] = [];
  const nodeById = new Map<string, ViewerNode>();

  file.items.forEach((it, index) => {
    const angle = index * 2.399963229728653;
    const jitter = (hash32(it.id) % 1000) / 1000;
    const radius = 18 * Math.sqrt(index) * (0.82 + jitter * 0.36);
    const cat = it.iface ? 'interface' : it.cat;
    const node: ViewerNode = {
      id: it.id,
      kind: 'item',
      label: it.name || labelOf(it.id),
      cat,
      color: itemColor(it.cat, Boolean(it.iface)),
      r: 3,
      degree: 0,
      item: it,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * 0.78,
      z: Math.sin(angle * 0.63) * radius * 0.55,
    };
    nodes.push(node);
    nodeById.set(node.id, node);
  });

  file.routes.forEach((r, index) => {
    const anchor = r.p[0] ? nodeById.get(r.p[0].i) : undefined;
    const jitterA = ((hash32(r.id) % 1000) / 1000 - 0.5) * 46;
    const jitterB = ((hash32(r.id + '#') % 1000) / 1000 - 0.5) * 46;
    const jitterC = ((hash32(r.id + '##') % 1000) / 1000 - 0.5) * 46;
    const node: ViewerNode = {
      id: r.id,
      kind: 'route',
      label: r.name || (r.id.startsWith('measure/') ? r.id.slice(8) : labelOf(r.id)),
      cat: r.kind === 'measure' ? 'measure' : 'route',
      color: routeColor(r.kind),
      r: 2,
      degree: 0,
      route: r,
      x: (anchor?.x ?? Math.cos(index) * 300) + jitterA,
      y: (anchor?.y ?? Math.sin(index) * 300) + jitterB,
      z: (anchor?.z ?? Math.sin(index * 1.7) * 300) + jitterC,
    };
    nodes.push(node);
    nodeById.set(node.id, node);
  });

  const links: ViewerLink[] = [];
  const neighbors = new Map<string, Set<string>>();
  const producersByItem = new Map<string, string[]>();
  const consumersByItem = new Map<string, string[]>();
  const needersByItem = new Map<string, string[]>();
  const performersByItem = new Map<string, string[]>();
  const parentsByComponent = new Map<string, string[]>();

  const connect = (source: string, target: string, kind: LinkKind, route?: string): void => {
    if (!nodeById.has(source) || !nodeById.has(target)) return;
    const id = `${kind}|${source}|${target}|${route ?? ''}`;
    links.push({ id, kind, ...(route ? { route } : {}), source, target });

    let set = neighbors.get(source);
    if (set === undefined) neighbors.set(source, (set = new Set()));
    set.add(target);
    let back = neighbors.get(target);
    if (back === undefined) neighbors.set(target, (back = new Set()));
    back.add(source);
  };

  for (const r of file.routes) {
    const used = new Set<string>();
    for (const clause of r.u) {
      for (const option of clause.anyOf) {
        if (used.has(option.i)) continue;
        used.add(option.i);
        connect(r.id, option.i, 'uses', r.id);
        pushIndex(consumersByItem, option.i, r.id);
      }
    }

    const produced = new Set<string>();
    for (const term of r.p) {
      if (produced.has(term.i)) continue;
      produced.add(term.i);
      connect(r.id, term.i, 'produces', r.id);
      pushIndex(producersByItem, term.i, r.id);
    }

    const needed = new Set<string>();
    for (const need of r.n) {
      if (needed.has(need.i)) continue;
      needed.add(need.i);
      connect(r.id, need.i, 'needs', r.id);
      pushIndex(needersByItem, need.i, r.id);
    }

    for (const performer of r.pb) {
      connect(r.id, performer, 'performs', r.id);
      pushIndex(performersByItem, performer, r.id);
    }
  }

  for (const it of file.items) {
    for (const part of it.comp ?? []) {
      const target = part.sel ?? part.i;
      connect(it.id, target, 'compose');
      pushIndex(parentsByComponent, target, it.id);
    }
  }

  for (const [id, set] of neighbors) {
    const node = nodeById.get(id);
    if (node === undefined) continue;
    node.degree = set.size;
    if (node.kind === 'item') {
      node.r = 2.3 + Math.min(6.5, Math.sqrt(set.size) * 0.8);
    } else {
      const r = node.route!;
      node.r = 1.1 + Math.min(1.7, Math.sqrt(r.u.length + r.p.length) * 0.22);
    }
  }

  const routeKindCount = { make: 0, measure: 0 };
  for (const r of file.routes) routeKindCount[r.kind] += 1;

  // 有预计算坐标就用它；没有时保留上面的螺旋初值（旧 graph.json 兼容）。
  const homePositions = new Map<string, [number, number, number]>();
  for (const node of nodes) {
    const position = file.positions?.[node.id];
    if (
      position !== undefined &&
      Number.isFinite(position[0]) &&
      Number.isFinite(position[1])
    ) {
      node.x = position[0];
      node.y = position[1];
      node.z = Number.isFinite(position[2]) ? position[2] : 0;
    }
    homePositions.set(node.id, [node.x ?? 0, node.y ?? 0, node.z ?? 0]);
  }

  return {
    file,
    items: file.items,
    routes: file.routes,
    nodes,
    links,
    nodeById,
    itemById,
    routeById,
    neighbors,
    homePositions,
    producersByItem,
    consumersByItem,
    needersByItem,
    performersByItem,
    parentsByComponent,
    routeKindCount,
  };
}

export async function loadModel(): Promise<ViewerModel> {
  const url = `${import.meta.env.BASE_URL}graph.json`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`${url} 读取失败（HTTP ${res.status}）。先运行 pnpm data 生成。`);
  }
  const file = (await res.json()) as GraphFile;
  return buildModel(file);
}

export function neighborsWithin(
  model: ViewerModel,
  rootId: string,
  depth: number,
): Set<string> {
  const seen = new Set<string>([rootId]);
  let frontier = [rootId];
  for (let d = 0; d < depth; d++) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const other of model.neighbors.get(id) ?? []) {
        if (seen.has(other)) continue;
        seen.add(other);
        next.push(other);
      }
    }
    frontier = next;
    if (frontier.length === 0) break;
  }
  return seen;
}

export function formatQty(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (n === 0) return '0';
  if (Math.abs(n) >= 10000) return n.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
  if (Math.abs(n) >= 100) return n.toLocaleString('zh-CN', { maximumFractionDigits: 1 });
  if (Math.abs(n) >= 1) return Number(n.toFixed(2)).toString();
  if (Math.abs(n) >= 0.001) return Number(n.toFixed(4)).toString();
  return n.toExponential(2);
}

export function formatRange(min: number | undefined, max: number | undefined, unit?: string): string {
  const lo = min === undefined ? '−∞' : formatQty(min);
  const hi = max === undefined ? '+∞' : formatQty(max);
  const body = min === max ? lo : `${lo} – ${hi}`;
  return unit ? `${body} ${unit}` : body;
}
