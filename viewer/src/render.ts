import type { LinkKind } from './theme.ts';
import { EDGES } from './theme.ts';
import type { ViewerLink, ViewerNode } from './model.ts';
import { catLabel, n as fmtN, t, unitLabel } from './i18n.ts';

export interface RenderCtx {
  selectedId: string | null;
  hoverId: string | null;
  selectedSet: Set<string> | null;
  matches: Set<string>;
  labels: Set<string>;
}

const rgbaCache = new Map<string, string>();

export function alpha(hex: string, a: number): string {
  const key = `${hex}|${a}`;
  const cached = rgbaCache.get(key);
  if (cached !== undefined) return cached;
  const value = hex.replace('#', '');
  const n = Number.parseInt(
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value,
    16,
  );
  const out = `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  rgbaCache.set(key, out);
  return out;
}

function nodeAlpha(node: ViewerNode, ctx: RenderCtx): number {
  if (ctx.selectedSet !== null && !ctx.selectedSet.has(node.id)) return 0.34;
  return 1;
}

function shouldLabel(node: ViewerNode, ctx: RenderCtx, scale: number): boolean {
  if (node.id === ctx.selectedId || node.id === ctx.hoverId) return true;
  if (ctx.selectedSet !== null && !ctx.selectedSet.has(node.id)) return false;
  if (ctx.labels.has(node.id)) return true;
  if (node.kind === 'item' && node.item?.mars && (node.degree < 60 || scale > 1.2)) {
    return scale > 0.5;
  }
  if (scale < 1.1) return false;
  if (scale < 1.8) return node.degree >= 150;
  if (scale < 2.6) return node.degree >= 40;
  if (scale < 3.6) return node.degree >= 10;
  return true;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawNode(
  node: ViewerNode,
  ctx: CanvasRenderingContext2D,
  scale: number,
  rctx: RenderCtx,
): void {
  const x = node.x ?? 0;
  const y = node.y ?? 0;
  const a = nodeAlpha(node, rctx);
  const dim = a < 1;
  const r = Math.max(node.r, 1.45 / scale);
  const color = node.color;

  ctx.save();
  ctx.globalAlpha = a;

  if (node.kind === 'item') {
    if (node.item?.iface) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6 / scale;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      if (r * scale > 4) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = alpha('#050810', 0.55);
        ctx.lineWidth = 0.7 / scale;
        ctx.stroke();
      }
    }
  } else {
    const rr = r * 1.25;
    ctx.beginPath();
    ctx.moveTo(x, y - rr);
    ctx.lineTo(x + rr, y);
    ctx.lineTo(x, y + rr);
    ctx.lineTo(x - rr, y);
    ctx.closePath();
    ctx.fillStyle = alpha(color, node.route?.kind === 'measure' ? 0.8 : 0.46);
    ctx.fill();
  }

  if (node.item?.seed) {
    ctx.beginPath();
    ctx.arc(x, y, r + 2.4 / scale, 0, Math.PI * 2);
    ctx.strokeStyle = alpha('#fbbf24', dim ? 0.3 : 0.9);
    ctx.lineWidth = 1.5 / scale;
    ctx.stroke();
  } else if (node.item?.mars) {
    ctx.beginPath();
    ctx.arc(x, y, r + 2.2 / scale, 0, Math.PI * 2);
    ctx.strokeStyle = alpha('#34d399', dim ? 0.25 : 0.7);
    ctx.lineWidth = 1.2 / scale;
    ctx.stroke();
  }

  if (rctx.matches.has(node.id)) {
    ctx.beginPath();
    ctx.arc(x, y, r + 4 / scale, 0, Math.PI * 2);
    ctx.strokeStyle = alpha('#facc15', 0.8);
    ctx.lineWidth = 1.2 / scale;
    ctx.setLineDash([2 / scale, 2 / scale]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (node.id === rctx.selectedId) {
    ctx.beginPath();
    ctx.arc(x, y, r + 4.5 / scale, 0, Math.PI * 2);
    ctx.strokeStyle = alpha('#67e8f9', 0.95);
    ctx.lineWidth = 2 / scale;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, r + 8 / scale, 0, Math.PI * 2);
    ctx.strokeStyle = alpha('#67e8f9', 0.18);
    ctx.lineWidth = 4 / scale;
    ctx.stroke();
  } else if (node.id === rctx.hoverId) {
    ctx.beginPath();
    ctx.arc(x, y, r + 3.5 / scale, 0, Math.PI * 2);
    ctx.strokeStyle = alpha('#e2e8f0', 0.75);
    ctx.lineWidth = 1.2 / scale;
    ctx.stroke();
  }

  ctx.restore();
}

interface LabelBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * 标签单独走在最上层，并按优先级做屏幕空间避让：
 * 选中的一定画，其次是悬停、聚焦时挑出的重点节点、最后才是按度数放宽的标签。
 */
export function drawLabels(
  ctx: CanvasRenderingContext2D,
  scale: number,
  rctx: RenderCtx,
  nodes: readonly ViewerNode[],
): void {
  const boxes: LabelBox[] = [];
  const rank = (node: ViewerNode): number =>
    node.id === rctx.selectedId ? 4 : node.id === rctx.hoverId ? 3 : rctx.labels.has(node.id) ? 2 : 1;

  const candidates = nodes
    .filter((node) => node.x !== undefined && node.y !== undefined && shouldLabel(node, rctx, scale))
    .sort((a, b) => rank(b) - rank(a) || b.degree - a.degree);

  ctx.save();
  ctx.textBaseline = 'middle';
  const fontSize = 10 / scale;
  ctx.font = `${fontSize}px "JetBrains Mono", "Cascadia Code", ui-monospace, monospace`;

  const limit = Math.min(candidates.length, 320);
  for (let i = 0; i < limit; i++) {
    const node = candidates[i]!;
    const selected = node.id === rctx.selectedId;
    const label = node.label.length > 30 ? `${node.label.slice(0, 29)}…` : node.label;
    const padX = 2.8 / scale;
    const width = ctx.measureText(label).width + padX * 2;
    const height = fontSize * 1.55;
    const r = Math.max(node.r, 1.45 / scale);
    const x = (node.x ?? 0) + r + 4 / scale;
    const y = (node.y ?? 0) - height / 2;

    const box: LabelBox = {
      x1: x * scale - 1.5,
      y1: y * scale - 1.5,
      x2: (x + width) * scale + 1.5,
      y2: (y + height) * scale + 1.5,
    };
    const collides = boxes.some(
      (other) => !(box.x2 < other.x1 || box.x1 > other.x2 || box.y2 < other.y1 || box.y1 > other.y2),
    );
    if (collides && !selected && node.id !== rctx.hoverId) continue;
    boxes.push(box);

    roundRect(ctx, x, y, width, height, 2 / scale);
    ctx.fillStyle = selected ? alpha('#0b2a33', 0.96) : alpha('#070b14', 0.78);
    ctx.fill();
    if (selected) {
      ctx.strokeStyle = alpha('#67e8f9', 0.6);
      ctx.lineWidth = 0.8 / scale;
      ctx.stroke();
    }
    ctx.fillStyle = selected ? '#cffafe' : alpha('#d7e4f5', 0.94);
    ctx.fillText(label, x + padX, (node.y ?? 0) + 0.5 / scale);
  }
  ctx.restore();
}

export function paintPointer(
  node: ViewerNode,
  color: string,
  ctx: CanvasRenderingContext2D,
  scale: number,
): void {
  const x = node.x ?? 0;
  const y = node.y ?? 0;
  const r = Math.max(node.r, 1.6 / scale) + 2.2 / scale;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

const BASE_ALPHA: Record<LinkKind, number> = {
  uses: 0.19,
  produces: 0.25,
  needs: 0.08,
  performs: 0.13,
  compose: 0.12,
};

/**
 * 全库两万多条连线，如果按 force-graph 默认的逐条 stroke 画，
 * 每条都要改一次 strokeStyle / lineWidth，主线程会一直卡在 30–80ms 一帧。
 *
 * 这里把同一类型、同一高亮层级的线合并成一条 Path2D，一次性描边；
 * 平时只有 5–10 次 stroke，选中时才多出高亮层。
 */
export function drawLinks(
  ctx: CanvasRenderingContext2D,
  scale: number,
  links: readonly ViewerLink[],
  nodeById: ReadonlyMap<string, ViewerNode>,
  visible: (link: ViewerLink) => boolean,
  rctx: RenderCtx,
): void {
  const paths = new Map<string, Path2D>();
  const tiers = new Map<string, { kind: LinkKind; tier: number }>();

  for (const link of links) {
    if (!visible(link)) continue;
    const source = typeof link.source === 'string' ? nodeById.get(link.source) : link.source;
    const target = typeof link.target === 'string' ? nodeById.get(link.target) : link.target;
    if (source === undefined || target === undefined) continue;

    let tier = 0;
    const selected = rctx.selectedId;
    const hovered = rctx.hoverId;
    if (selected !== null) {
      tier = source.id === selected || target.id === selected ? 2 : 1;
    } else if (hovered !== null) {
      tier = source.id === hovered || target.id === hovered ? 2 : 0;
    }

    const key = `${link.kind}|${tier}`;
    let path = paths.get(key);
    if (path === undefined) {
      path = new Path2D();
      paths.set(key, path);
      tiers.set(key, { kind: link.kind, tier });
    }
    path.moveTo(source.x ?? 0, source.y ?? 0);
    path.lineTo(target.x ?? 0, target.y ?? 0);
  }

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const [key, path] of paths) {
    const { kind, tier } = tiers.get(key)!;
    const meta = EDGES[kind];
    const base = BASE_ALPHA[kind];
    const a = tier === 1 ? base * 0.09 : tier === 2 ? Math.min(0.85, base * 2.8) : base;
    ctx.strokeStyle = alpha(meta.color, a);
    ctx.lineWidth =
      (tier === 2 ? 1.5 : kind === 'produces' ? 0.7 : 0.55) / Math.max(0.4, scale);
    ctx.setLineDash(tier === 1 ? [] : meta.dash !== undefined ? meta.dash.map((v) => (v * 2) / scale) : []);
    ctx.stroke(path);
  }
  ctx.restore();
}


export function nodeTooltip(node: ViewerNode): string {
  const kind =
    node.kind === 'route'
      ? t(node.route?.kind === 'measure' ? 'details.route.measure' : 'details.route.make')
      : catLabel(node.cat);
  const rows = [t('tooltip.degree', { n: fmtN(node.degree) })];
  if (node.kind === 'item' && node.item) {
    if (node.item.unit) rows.push(t('tooltip.unit', { unit: unitLabel(node.item.unit) }));
    if (node.item.mass !== undefined) rows.push(t('tooltip.mass', { mass: fmtN(node.item.mass) }));
    if (node.item.seed) rows.push(t('tooltip.seed'));
    if (node.item.mars) rows.push(t('tooltip.mars'));
  }
  if (node.kind === 'route' && node.route) {
    rows.push(t('tooltip.route', { inputs: fmtN(node.route.u.length), outputs: fmtN(node.route.p.length) }));
  }
  return `<div class="tip"><div class="tip-head"><span class="tip-dot" style="background:${node.color}"></span><span class="tip-id">${escapeHtml(node.id)}</span></div><div class="tip-kind">${escapeHtml(kind)}</div><div class="tip-meta">${rows.map(escapeHtml).join(' · ')}</div></div>`;
}

export function escapeHtml(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}
