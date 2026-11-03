/**
 * 数据统计 —— 只看 data/ 里写了什么，不看它对不对（那是 `pnpm check` 的事）。
 *
 *   pnpm stats          人类可读
 *   pnpm stats --json   机器可读（同一批数字）
 *
 * 与 `tools/lib/index.ts` 的装载层关系：**故意不复用它**。那边按 DATA_ITEMS / DATA_ROUTES
 * 的约定装载，是"哪些文件进模型"的唯一真相；这个脚本的用途是**发现它漏了什么** ——
 * 所以动态扫 data/ 下所有 .ts，把像 Item / Route 数组的导出全收进来（按 id 去重）。
 *
 * 于是两边的差集本身也是信息：扫出 N / M，而装载器里是 N' / M' —— 差值就是还没接线的。
 *
 * 图索引统一取自 `tools/lib`；本脚本只保留字段级统计。
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import type { Item, Route } from '../src/core/describe.ts';
import { Model } from './lib/index.ts';
import type { Graph } from './lib/index.ts';

const ROOT = process.cwd();
const DATA = join(ROOT, 'data');

type AnyRec = Record<string, unknown>;

/**
 * 行数口径 —— **一处定义**，README 里的规模数字抄这里。
 *
 * 四列：总行 / 代码行 / 注释行 / 空行。`总行 = 代码 + 注释 + 空`（恒等式，自检用）。
 *
 * **代码行**才算"写了多少"：空行与注释行都不算。
 * 注释行包括 `//`、`/* … *\/` 的行内部分、以及块注释内的每一行；
 * 一行里既有代码又有尾注释 → 算代码行。
 *
 * 已知近似：正则看得懂 `//` 与 `/*`，看不懂字符串里的 `//`（如 URL）。
 * 本项目的数据里没有 URL，遇到时只影响一行归类，不影响恒等式。
 */
type LineStat = { 文件: number; 总行: number; 代码行: number; 注释行: number; 空行: number };

/** 按行分类：0 = 空行，1 = 代码，2 = 纯注释。跨行块注释用状态机。 */
function classifyLines(text: string): { code: number; comment: number; blank: number } {
  let inBlock = false;
  let code = 0;
  let comment = 0;
  let blank = 0;
  for (const raw of text.split('\n')) {
    const l = raw.trim();
    if (inBlock) {
      comment++;
      if (l.includes('*/')) inBlock = false;
      continue;
    }
    if (l === '') {
      blank++;
      continue;
    }
    if (l.startsWith('//')) {
      comment++;
      continue;
    }
    if (l.startsWith('/*')) {
      comment++;
      if (!l.includes('*/')) inBlock = true;
      continue;
    }
    code++;
    // 代码行里起了一个没闭合的块注释，后面的行都算注释
    const at = raw.indexOf('/*');
    if (at >= 0 && !raw.slice(at).includes('*/')) inBlock = true;
  }
  return { code, comment, blank };
}

async function walkFiles(dir: string, exts: string[]): Promise<string[]> {
  const acc: string[] = [];
  // 用 readdir 的字符串模式 + stat 判目录：withFileTypes 的 Dirent<NonSharedBuffer>
  // 在 @types/node 22 里与 e.name: string 的假设冲突（TS2322/TS2367）。
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return acc;
  }
  for (const name of names) {
    if (name === 'node_modules' || name === '.git') continue;
    const p = join(dir, name);
    let isDir = false;
    try {
      isDir = (await stat(p)).isDirectory();
    } catch {
      continue;
    }
    if (isDir) acc.push(...(await walkFiles(p, exts)));
    else if (exts.some((x) => name.endsWith(x))) acc.push(p);
  }
  return acc;
}

/** 把若干组行数相加 —— 合计只算一次，避免两段一模一样的 reduce。 */
function sumLineStats(groups: Iterable<LineStat>): LineStat {
  const total: LineStat = { 文件: 0, 总行: 0, 代码行: 0, 注释行: 0, 空行: 0 };
  for (const v of groups) {
    total.文件 += v.文件;
    total.总行 += v.总行;
    total.代码行 += v.代码行;
    total.注释行 += v.注释行;
    total.空行 += v.空行;
  }
  return total;
}

async function lineStats(): Promise<{ 分组: Record<string, LineStat>; 合计: LineStat; 最大的文件: [string, number][] }> {
  const codeGroups: Record<string, string[]> = {
    'src/': ['src'],
    'data/': ['data'],
    'tools/': ['tools'],
    'test/': ['test'],
  };
  const out: Record<string, LineStat> = {};
  const big: [string, number][] = [];

  for (const [label, dirs] of Object.entries(codeGroups)) {
    const acc: LineStat = { 文件: 0, 总行: 0, 代码行: 0, 注释行: 0, 空行: 0 };
    for (const d of dirs) {
      for (const p of await walkFiles(join(ROOT, d), ['.ts', '.mjs', '.js'])) {
        const text = await readFile(p, 'utf8');
        const c = classifyLines(text);
        acc.文件++;
        acc.总行 += text.split('\n').length;
        acc.代码行 += c.code;
        acc.注释行 += c.comment;
        acc.空行 += c.blank;
        big.push([relative(ROOT, p), c.code]);
      }
    }
    out[label] = acc;
  }

  // 文档：README.md + docs/**.md（已跳 node_modules）；非空行全算"代码行"，空行单记。
  const docs: LineStat = { 文件: 0, 总行: 0, 代码行: 0, 注释行: 0, 空行: 0 };
  for (const p of await walkFiles(ROOT, ['.md'])) {
    const text = await readFile(p, 'utf8');
    const lines = text.split('\n');
    docs.文件++;
    docs.总行 += lines.length;
    docs.代码行 += lines.filter((l) => l.trim() !== '').length;
    docs.空行 += lines.filter((l) => l.trim() === '').length;
    big.push([relative(ROOT, p), lines.filter((l) => l.trim() !== '').length]);
  }
  out['md'] = docs;

  // 恒等式自检：总行 = 代码 + 注释 + 空。不成立说明分类器漏了行（例如 CRLF 或未闭合块注释）。
  for (const [k, v] of Object.entries(out)) {
    if (v.总行 !== v.代码行 + v.注释行 + v.空行) {
      out[k] = { ...v, 注释行: v.总行 - v.代码行 - v.空行 };
    }
  }
  const 合计 = sumLineStats(Object.values(out));

  big.sort((a, b) => b[1] - a[1]);
  return { 分组: out, 合计, 最大的文件: big.slice(0, 10) };
}

/** 递归列出 data/ 下所有 .ts（跳过 .d.ts 与测试）。 */
async function listTs(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await listTs(p)));
    else if (e.name.endsWith('.ts') && !e.name.endsWith('.d.ts')) out.push(p);
  }
  return out;
}

/** 一个对象像不像 Item：有 id 与 category。 */
function isItem(x: unknown): x is AnyRec {
  return typeof x === 'object' && x !== null && typeof (x as AnyRec).id === 'string' && typeof (x as AnyRec).category === 'string';
}

/** 一个对象像不像 Route：有 id 与 produces 数组。 */
function isRoute(x: unknown): x is AnyRec {
  if (typeof x !== 'object' || x === null) return false;
  const r = x as AnyRec;
  return typeof r.id === 'string' && (Array.isArray(r.produces) || Array.isArray(r.uses));
}

/**
 * 把一个导出里的条目与路线都挖出来。
 *
 * 两种形状都要认：裸数组（`export const FOO_ITEMS = [...]`）与
 * 包装对象（`export const MARS = { ambient, items, routes }`）。
 * 只认裸数组会漏掉 `MARS.items` 这类 —— 而它们正是最底层的料。
 */
function collect(v: unknown, out: { items: AnyRec[]; routes: AnyRec[]; arrays: number }, depth = 0): void {
  if (depth > 2 || v === null || typeof v !== 'object') return;
  // 单独导出的整机（`export const CDSEM: Item = {...}`）也要收 —— 只认数组会漏掉它们
  if (isItem(v)) { out.items.push(v); return; }
  if (isRoute(v)) { out.routes.push(v); return; }
  if (Array.isArray(v)) {
    out.arrays++;
    for (const el of v) {
      if (isItem(el)) out.items.push(el);
      else if (isRoute(el)) out.routes.push(el);
    }
    return;
  }
  for (const inner of Object.values(v as AnyRec)) collect(inner, out, depth + 1);
}

function bump(m: Map<string, number>, k: string, n = 1): void {
  m.set(k, (m.get(k) ?? 0) + n);
}

function histo(nums: number[]): { n: number; min: number; max: number; mean: number; p50: number } {
  const s = [...nums].sort((a, b) => a - b);
  if (s.length === 0) return { n: 0, min: 0, max: 0, mean: 0, p50: 0 };
  const sum = s.reduce((a, b) => a + b, 0);
  return {
    n: s.length,
    min: s[0]!,
    max: s[s.length - 1]!,
    mean: sum / s.length,
    p50: s[Math.floor(s.length / 2)]!,
  };
}

function clauseItems(clause: unknown): { item: string; qty?: unknown; need?: unknown[] }[] {
  if (typeof clause !== 'object' || clause === null) return [];
  const anyOf = (clause as AnyRec).anyOf;
  if (!Array.isArray(anyOf)) return [];
  return anyOf.filter((o): o is AnyRec => typeof o === 'object' && o !== null && typeof (o as AnyRec).item === 'string') as
    { item: string; qty?: unknown; need?: unknown[] }[];
}

async function main(argv: readonly string[]): Promise<void> {
  const asJson = argv.includes('--json');
  const files = await listTs(DATA);

  const items = new Map<string, AnyRec>();
  const routes = new Map<string, AnyRec>();
  const dupItems: string[] = [];
  const dupRoutes: string[] = [];
  const badFiles: { file: string; error: string }[] = [];
  let arrays = 0;

  for (const f of files) {
    let mod: Record<string, unknown>;
    try {
      mod = (await import(pathToFileURL(f).href)) as Record<string, unknown>;
    } catch (err) {
      badFiles.push({ file: relative(ROOT, f), error: String(err).slice(0, 160) });
      continue;
    }
    for (const [name, v] of Object.entries(mod)) {
      if (typeof v !== 'object' || v === null) continue;
      const found = { items: [] as AnyRec[], routes: [] as AnyRec[], arrays: 0 };
      collect(v, found);
      arrays += found.arrays;
      for (const el of found.items) {
        const id = el.id as string;
        if (items.has(id)) dupItems.push(`${id} (${relative(ROOT, f)}:${name})`);
        else items.set(id, el);
      }
      for (const el of found.routes) {
        const id = el.id as string;
        if (routes.has(id)) dupRoutes.push(`${id} (${relative(ROOT, f)}:${name})`);
        else routes.set(id, el);
      }
    }
  }

  // data/ 里的路线都带 produces / uses；这里只做类型收窄，交给 graph 建索引。
  const graph: Graph = Model.graphOf({
    items: [...items.values()] as unknown as Item[],
    routes: [...routes.values()] as unknown as Route[],
  });
  // 重复 id 分两类：同文件内（多半是 PARTS ⊂ ITEMS 的展开）与跨文件（这才可能是真问题）
  const dupByFile = new Map<string, number>();
  for (const d of dupItems) bump(dupByFile, d.replace(/^.*\((.*):[^:]+\)$/, '$1'));

  // ── 分布 ────────────────────────────────────────────────
  const byCategory = new Map<string, number>();
  const byUnit = new Map<string, number>();
  let machines = 0, parts = 0, consumed = 0;
  for (const it of graph.items) {
    bump(byCategory, String(it.category ?? '?'));
    bump(byUnit, String(it.unit ?? '?'));
    if (it.category === 'machine') machines++;
    else if (it.category === 'part') parts++;
    else if (it.category === 'consumable') consumed++;
  }

  const catKeys = [...byCategory.keys()].sort();
  const catCount = Object.fromEntries(catKeys.map((k) => [k, byCategory.get(k)!]));

  // ── 路线形态 ────────────────────────────────────────────
  let withSteps = 0;
  let withPerformer = 0;
  let withNeither = 0;
  let withRate = 0;
  let withUnbalanced = 0;
  let withUnder = 0;
  let withNeeds = 0;
  const usesCounts: number[] = [];
  const producesCounts: number[] = [];

  for (const r of graph.routes) {
    const steps = Array.isArray(r.steps) ? r.steps : [];
    if (steps.length > 0) withSteps++;
    if (typeof r.performedBy === 'string') withPerformer++;
    if (steps.length === 0 && typeof r.performedBy !== 'string') withNeither++;
    if (typeof r.rate === 'object' && r.rate !== null) withRate++;
    if (typeof r.unbalanced_zh === 'string') withUnbalanced++;
    if (Array.isArray(r.under) && r.under.length > 0) withUnder++;
    if (Array.isArray(r.needs) && r.needs.length > 0) withNeeds++;
    if (Array.isArray(r.uses)) usesCounts.push(r.uses.length);
    if (Array.isArray(r.produces)) producesCounts.push(r.produces.length);
  }

  // ── 属性系统 ────────────────────────────────────────────
  let propDecls = 0;
  const propNames = new Map<string, number>();
  let itemsWithProps = 0;
  for (const it of graph.items) {
    const props = Array.isArray(it.props) ? it.props : [];
    if (props.length === 0) continue;
    itemsWithProps++;
    for (const p of props as AnyRec[]) {
      propDecls++;
      bump(propNames, String(p.param ?? '?'));
    }
  }
  let needTerms = 0, givesTerms = 0;
  // 引用密度按出现次数计，不能换成 graph.consumers（后者按 item+route 去重，会少记重复项）。
  const refCount = new Map<string, number>();
  for (const r of graph.routes) {
    for (const c of (r.uses as unknown[]) ?? []) {
      for (const o of clauseItems(c)) {
        bump(refCount, o.item);
        if (Array.isArray(o.need) && o.need.length > 0) needTerms++;
      }
    }
    for (const p of (r.produces as unknown[]) ?? []) {
      if (typeof p === 'object' && p !== null && Array.isArray((p as AnyRec).gives)) givesTerms++;
    }
    for (const n of (r.needs as unknown[]) ?? []) if (typeof n === 'string') bump(refCount, n);
    for (const s of (r.steps as unknown[]) ?? []) {
      if (typeof s === 'object' && s !== null && typeof (s as AnyRec).performedBy === 'string') bump(refCount, (s as AnyRec).performedBy as string);
    }
    if (typeof r.performedBy === 'string') bump(refCount, r.performedBy);
  }

  // ── 孤儿：既没有路线、也没有零件清单、也没被引用 ───────
  const produced = new Set(graph.producers.keys());
  const declaredParts = new Set<string>();
  for (const it of graph.items) {
    for (const c of (it.composedOf as unknown[]) ?? []) {
      if (typeof c === 'object' && c !== null && typeof (c as AnyRec).item === 'string') declaredParts.add((c as AnyRec).item as string);
    }
  }
  const orphans = graph.items
    .map((i) => String(i.id))
    .filter((id) => {
      const it = items.get(id)!;
      if (it.category === 'machine' && Array.isArray(it.composedOf)) return false;
      return !produced.has(id) && !declaredParts.has(id) && !refCount.has(id);
    });

  const sizes = await lineStats();

  const report = {
    规模: sizes,
    文件: { data文件: files.length, 导出数组: arrays, 读不了的文件: badFiles },
    条目: {
      总数: graph.items.length,
      按类别: catCount,
      按单位: Object.fromEntries([...byUnit.entries()].sort((a, b) => b[1] - a[1])),
      机器: machines,
      零件: parts,
      消耗件: consumed,
      重复id: dupItems,
      重复按文件: Object.fromEntries([...dupByFile.entries()].sort((a, b) => b[1] - a[1])),
    },
    路线: {
      总数: graph.routes.length,
      重复id: dupRoutes,
      用steps: withSteps,
      用performedBy: withPerformer,
      两者都没写: withNeither,
      有rate: withRate,
      有unbalanced_zh: withUnbalanced,
      有under: withUnder,
      有needs: withNeeds,
      uses项数: histo(usesCounts),
      produces项数: histo(producesCounts),
    },
    属性: {
      声明了props的条目: itemsWithProps,
      属性声明总数: propDecls,
      属性名: Object.fromEntries([...propNames.entries()].sort((a, b) => b[1] - a[1])),
      带need的投料项: needTerms,
      带gives的产物项: givesTerms,
    },
    引用: {
      被引用最多的: [...refCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15),
      孤儿条目数: orphans.length,
      孤儿: orphans.slice(0, 40),
    },
  };

  if (asJson) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    return;
  }

  const line = (s = ''): boolean => process.stdout.write(s + '\n');
  const rule = (): boolean => line('─'.repeat(64));

  rule();
  line(`数据统计 · ${files.length} 个文件 · ${arrays} 个导出数组`);
  rule();

  line('【规模】文件 · 总行 · 代码行 · 注释行 · 空行（总行 = 代码+注释+空）');
  const rows: [string, LineStat][] = [...Object.entries(sizes.分组), ['合计', sizes.合计]];
  for (const [k, v] of rows) {
    line(
      `  ${k.padEnd(7)} ${String(v.文件).padStart(4)} · ${String(v.总行).padStart(7)} · ` +
        `${String(v.代码行).padStart(7)} · ${String(v.注释行).padStart(7)} · ${String(v.空行).padStart(6)}`,
    );
    if (k === 'test/') line('  ' + '─'.repeat(48));
  }
  line();
  line('【条目】');
  line(`  总数 ${graph.items.length} —— 机器 ${machines} · 零件 ${parts} · 消耗件 ${consumed}`);
  line('  按类别 ' + catKeys.map((k) => `${k} ${byCategory.get(k)}`).join(' · '));
  line('  按单位 ' + [...byUnit.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k} ${v}`).join(' · '));
  if (dupItems.length > 0)
    line(
      `  ↺ 同名导出 ${dupItems.length} 个（同一 id 在多个导出里出现，已去重）` +
        '：' +
        [...dupByFile.entries()].map(([k, v]) => `${k} ${v}`).join(' · '),
    );
  line();

  line('【路线】');
  line(`  总数 ${graph.routes.length}`);
  line(`  形态：steps ${withSteps} · performedBy ${withPerformer} · 都没写 ${withNeither}`);
  line(`  带 rate ${withRate} · 带 unbalanced_zh ${withUnbalanced} · 带 under ${withUnder} · 带 needs ${withNeeds}`);
  const u = report.路线.uses项数;
  line(`  uses 项数：中位 ${u.p50} · 均 ${u.mean.toFixed(2)} · 最大 ${u.max}`);
  if (dupRoutes.length > 0) line(`  ⚠️ 重复 id ${dupRoutes.length} 个：${dupRoutes.slice(0, 5).join(', ')}`);
  line();

  line('【属性系统】');
  line(`  声明了 props 的条目 ${itemsWithProps} 个 · 属性声明 ${propDecls} 条 · 带 need 的投料 ${needTerms} · 带 gives 的产物 ${givesTerms}`);
  line(
    '  属性名 top：' +
      [...propNames.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([k, v]) => `${k} ${v}`)
        .join(' · '),
  );
  line();

  line('【引用密度】');
  for (const [id, n] of report.引用.被引用最多的) line(`  ${String(n).padStart(4)}  ${id}`);
  line();

  line('【孤儿】既无路线、也不在任何零件清单、也没被引用');
  line(`  ${orphans.length} 个` + (orphans.length > 0 ? '：' + orphans.slice(0, 20).join(' · ') : ''));
  if (badFiles.length > 0) {
    line();
    line('【读不了的文件】');
    for (const b of badFiles) line(`  ${b.file}: ${b.error}`);
  }
  rule();
}

// 被 import 时不执行。
const isMain =
  process.argv[1] !== undefined &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isMain) await main(process.argv.slice(2));
