/**
 * 把 data/ 下的条目与路线压成一张图，供 viewer 前端读取。
 *
 * 只做投影，不做判断：字段名、数量、引用关系都照抄 data/。
 * 唯一的加工是把 Qty 折算成数字，并把路线里的多选项摊平一层。
 *
 *   node scripts/generate.ts [--out public/graph.json]
 */
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { data } from '../../tools/lib/data.ts';
import { SEED_IDS } from '../../data/floor/seed.ts';
import { validate } from '../../src/index.ts';
import type { Condition, Item, Qty, Route } from '../../src/index.ts';
import type { PropDecl, PropReq } from '../../src/core/describe.ts';
import { buildModel } from '../src/model.ts';
import type { GraphFile } from '../src/model.ts';
import { layoutPositions } from '../src/layout.ts';
import type { LayoutLink, LayoutNode } from '../src/layout.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const VIEWER_ROOT = resolve(HERE, '..');

const args = process.argv.slice(2);
const outIndex = args.indexOf('--out');
const OUT = outIndex >= 0 && args[outIndex + 1]
  ? resolve(process.cwd(), args[outIndex + 1]!)
  : resolve(VIEWER_ROOT, 'public/graph.json');

const num = (q: Qty): number => q.num / q.den;

type PropLite =
  | { p: string; k: 'range'; min: number; max: number; u: string; d?: string }
  | { p: string; k: 'enum'; v: string[] }
  | { p: string; k: 'set'; v: string[] };

function propDecl(p: PropDecl): PropLite {
  if (p.kind === 'range') {
    return { p: p.param, k: 'range', min: p.min, max: p.max, u: p.unit, ...(p.dir ? { d: p.dir } : {}) };
  }
  return { p: p.param, k: p.kind, v: [...p.values] };
}

type ReqLite =
  | { p: string; k: 'range'; min?: number; max?: number; d?: string; design?: 1 }
  | { p: string; k: 'enum'; oneOf: string[]; design?: 1 }
  | { p: string; k: 'set'; atLeast?: string[]; design?: 1 };

function propReq(r: PropReq): ReqLite {
  const design = r.design === true ? (1 as const) : undefined;
  if (r.kind === 'range') {
    return {
      p: r.param,
      k: 'range',
      ...(r.min === undefined ? {} : { min: r.min }),
      ...(r.max === undefined ? {} : { max: r.max }),
      ...(r.dir ? { d: r.dir } : {}),
      ...(design ? { design } : {}),
    };
  }
  if (r.kind === 'enum') {
    return { p: r.param, k: 'enum', oneOf: [...r.oneOf], ...(design ? { design } : {}) };
  }
  return {
    p: r.param,
    k: 'set',
    ...(r.atLeast ? { atLeast: [...r.atLeast] } : {}),
    ...(design ? { design } : {}),
  };
}

type CondOut = { p: string; min: number; max: number; design?: 1 };

function condOut(c: Condition): CondOut {
  return {
    p: c.param,
    min: c.min,
    max: c.max,
    ...(c.design ? { design: 1 as const } : {}),
  };
}

interface ItemOut {
  id: string;
  name: string;
  name_zh: string;
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
  holds?: CondOut[];
  comp?: { i: string; q: number; sel?: string }[];
  consumption?: { i: string; q: number; per: number }[];
}

interface RouteOut {
  id: string;
  name: string;
  name_zh: string;
  kind: 'make' | 'measure';
  p: { i: string; q: number; g?: ReqLite[] }[];
  u: { anyOf: { i: string; q: number; need?: ReqLite[] }[] }[];
  n: { i: string; q: number; need?: ReqLite[] }[];
  pb: string[];
  steps: { b?: string; n?: string; u?: CondOut[] }[];
  under: CondOut[];
  rate?: number;
  unbal?: string;
}

const seeds = new Set(SEED_IDS);

const items: ItemOut[] = data.items.map((it: Item) => {
  const out: ItemOut = {
    id: it.id,
    name: it.name,
    name_zh: it.name_zh,
    cat: it.category ?? 'material',
    ...(it.unit ? { unit: it.unit } : {}),
    ...(it.mass ? { mass: num(it.mass) } : {}),
    ...(it.interface ? { iface: 1 as const } : {}),
    ...(it.extends ? { ext: it.extends } : {}),
    ...(seeds.has(it.id) ? { seed: 1 as const } : {}),
    ...(it.id.startsWith('mars/') ? { mars: 1 as const } : {}),
    ...(it.monolithic ? { mono: 1 as const } : {}),
    ...(it.deferred ? { deferred: 1 as const } : {}),
    ...(it.props?.length ? { props: it.props.map(propDecl) } : {}),
    ...(it.holds?.length ? { holds: it.holds.map(condOut) } : {}),
    ...(it.composedOf?.length
      ? {
          comp: it.composedOf.map((c) => ({
            i: c.item,
            q: num(c.qty),
            ...(c.select ? { sel: c.select } : {}),
          })),
        }
      : {}),
    ...(it.consumption?.length
      ? {
          consumption: it.consumption.map((c) => ({ i: c.item, q: num(c.qty), per: num(c.per) })),
        }
      : {}),
  };
  return out;
});

const routes: RouteOut[] = data.routes.map((r: Route) => {
  const performers = new Set<string>();
  if (r.performedBy) performers.add(r.performedBy);
  for (const s of r.steps ?? []) if (s.performedBy) performers.add(s.performedBy);

  return {
    id: r.id,
    name: r.name,
    name_zh: r.name_zh,
    kind: r.id.startsWith('measure/') ? 'measure' : 'make',
    p: r.produces.map((t) => ({
      i: t.item,
      q: num(t.qty),
      ...(t.gives?.length ? { g: t.gives.map(propReq) } : {}),
    })),
    u: r.uses.map((cl) => ({
      anyOf: cl.anyOf.map((o) => ({
        i: o.item,
        q: num(o.qty),
        ...(o.need?.length ? { need: o.need.map(propReq) } : {}),
      })),
    })),
    n: (r.needs ?? []).map((n) =>
      typeof n === 'string'
        ? { i: n, q: 1 }
        : { i: n.item, q: num(n.qty), ...(n.need?.length ? { need: n.need.map(propReq) } : {}) },
    ),
    pb: [...performers],
    steps: (r.steps ?? []).map((s) => ({
      ...(s.performedBy ? { b: s.performedBy } : {}),
      ...(s.note_zh ? { n: s.note_zh } : {}),
      ...(s.under?.length ? { u: s.under.map(condOut) } : {}),
    })),
    under: (r.under ?? []).map(condOut),
    ...(r.rate ? { rate: num(r.rate.hours) } : {}),
    ...(r.unbalanced_zh ? { unbal: r.unbalanced_zh } : {}),
  };
});

const categories: Record<string, number> = {};
for (const it of items) categories[it.cat] = (categories[it.cat] ?? 0) + 1;

const validation = validate(data);

const edges = {
  produces: routes.reduce((n, r) => n + r.p.length, 0),
  uses: routes.reduce((n, r) => n + r.u.reduce((m, cl) => m + cl.anyOf.length, 0), 0),
  needs: routes.reduce((n, r) => n + r.n.length, 0),
  performs: routes.reduce((n, r) => n + r.pb.length, 0),
  compose: items.reduce((n, i) => n + (i.comp?.length ?? 0), 0),
};

const payload = {
  meta: {
    generatedAt: new Date().toISOString(),
    source: 'data/**',
    counts: {
      items: items.length,
      routes: routes.length,
      categories,
      edges,
    },
    validation: {
      errors: validation.errors.length,
      notes: validation.notes.length,
      errorSample: validation.errors.slice(0, 20).map((e) => `${e.code} ${e.where}: ${e.detail}`),
    },
    seeds: [...SEED_IDS],
  },
  items,
  routes,
};

// 布局在这里算一次，浏览器打开时直接拿坐标，不再为 5,183 个节点启动模拟。
let positions: Record<string, [number, number, number]> | undefined;
try {
  const layoutStart = performance.now();
  const layoutGraph = buildModel(payload as GraphFile);
  layoutPositions(
    layoutGraph.nodes as unknown as LayoutNode[],
    layoutGraph.links as unknown as LayoutLink[],
    { ticks: 80, reset: true },
  );
  positions = {};
  for (const node of layoutGraph.nodes) {
    positions[node.id] = [
      Math.round((node.x ?? 0) * 10) / 10,
      Math.round((node.y ?? 0) * 10) / 10,
      Math.round((node.z ?? 0) * 10) / 10,
    ];
  }
  console.log(`[viewer] 预计算布局 ${Math.round(performance.now() - layoutStart)} ms`);
} catch (error) {
  console.warn('[viewer] 布局预计算失败，页面将退回未布局的位置:', (error as Error).message);
}

const output = positions === undefined ? payload : { ...payload, positions };

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(output), 'utf8');

const bytes = statSync(OUT).size;
const mb = (bytes / 1024 / 1024).toFixed(2);
console.log(
  `[viewer] graph.json: ${items.length} 条目 + ${routes.length} 路线 = ${items.length + routes.length} 节点 · ` +
    `${Object.values(edges).reduce((a, b) => a + b, 0)} 连线 · ${mb} MB`,
);
console.log(`[viewer] 写入 ${OUT}`);
