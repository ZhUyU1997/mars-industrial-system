/**
 * 条目/路线“定义快照”工具 —— codemod 与批量改数据的永久护栏。
 *
 *   node tools/id-snapshot.ts --write   # 写 test/id-snapshot.json（基线）
 *   node tools/id-snapshot.ts --check   # 比对：缺失 / 多余 / 内容变化 / 计数变化
 *
 * 定义用**稳定序列化**（对象键排序、数组保序）算 sha1；只比内容，不比顺序。
 * `--check` 四类全 0 才 exit 0；任一不为 0 → 列出前 20 条并 exit 1。
 *
 * 为什么单独做工具而不是只写测试：codemod 跑完可以先 `--check` 再提交，
 * 测试（test/snapshot.test.ts）再拦一道 —— 不依赖人记得比快照。
 */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Description } from '../src/index.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SNAPSHOT_PATH = join(ROOT, 'test/id-snapshot.json');

/** 稳定序列化：对象键排序，数组保序。 */
export const stable = (v: unknown): string => {
  const walk = (x: unknown): unknown => {
    if (Array.isArray(x)) return x.map(walk);
    if (x !== null && typeof x === 'object') {
      const o = x as Record<string, unknown>;
      return Object.keys(o)
        .sort()
        .map((k) => [k, walk(o[k])]);
    }
    return x;
  };
  return JSON.stringify(walk(v));
};

export const sha1 = (s: string): string => createHash('sha1').update(s, 'utf8').digest('hex');

export interface Snapshot {
  readonly items: Record<string, string>;
  readonly routes: Record<string, string>;
  readonly counts: { readonly items: number; readonly routes: number };
}

export const snapshotOf = (data: Description): Snapshot => {
  const items: Record<string, string> = {};
  const routes: Record<string, string> = {};
  for (const it of data.items) items[it.id] = sha1(stable(it));
  for (const r of data.routes) routes[r.id] = sha1(stable(r));
  return { items, routes, counts: { items: data.items.length, routes: data.routes.length } };
};

export interface Diff {
  readonly missing: string[];
  readonly extra: string[];
  readonly changed: string[];
  readonly countChanged: string[];
}

export const compare = (expected: Snapshot, actual: Snapshot): Diff => {
  const missing: string[] = [];
  const extra: string[] = [];
  const changed: string[] = [];
  for (const kind of ['items', 'routes'] as const) {
    const e = expected[kind];
    const a = actual[kind];
    for (const id of Object.keys(e)) {
      if (!(id in a)) missing.push(`${kind}:${id}`);
      else if (e[id] !== a[id]) changed.push(`${kind}:${id}`);
    }
    for (const id of Object.keys(a)) if (!(id in e)) extra.push(`${kind}:${id}`);
  }
  const countChanged: string[] = [];
  if (expected.counts.items !== actual.counts.items) {
    countChanged.push(`items ${expected.counts.items} → ${actual.counts.items}`);
  }
  if (expected.counts.routes !== actual.counts.routes) {
    countChanged.push(`routes ${expected.counts.routes} → ${actual.counts.routes}`);
  }
  return { missing, extra, changed, countChanged };
};

export const isClean = (d: Diff): boolean =>
  d.missing.length === 0 && d.extra.length === 0 && d.changed.length === 0 && d.countChanged.length === 0;

const show = (label: string, list: readonly string[]): void => {
  if (list.length === 0) return;
  console.log(`  ${label} ${list.length}:`);
  for (const x of list.slice(0, 20)) console.log(`    - ${x}`);
  if (list.length > 20) console.log(`    … 还有 ${list.length - 20} 条`);
};

const loadData = async (): Promise<Description> => {
  const mod = (await import(pathToFileURL(join(ROOT, 'tools/lib/index.ts')).href)) as {
    model: { readonly data: Description };
  };
  return mod.model.data;
};

const main = async (): Promise<void> => {
  const args = process.argv.slice(2);
  const data = await loadData();
  const actual = snapshotOf(data);

  if (args.includes('--write')) {
    writeFileSync(SNAPSHOT_PATH, JSON.stringify(actual, null, 2) + '\n', 'utf8');
    console.log(
      `写入 ${SNAPSHOT_PATH}｜items ${actual.counts.items} · routes ${actual.counts.routes}｜` +
        `sha1 ${Object.keys(actual.items).length + Object.keys(actual.routes).length} 条`,
    );
    return;
  }

  if (args.includes('--check')) {
    let expected: Snapshot;
    try {
      expected = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) as Snapshot;
    } catch {
      console.error(`读不到快照 ${SNAPSHOT_PATH}；先跑 --write`);
      process.exit(1);
    }
    const diff = compare(expected, actual);
    console.log(
      `缺失 ${diff.missing.length} / 多余 ${diff.extra.length} / 内容变化 ${diff.changed.length} / 计数变化 ${diff.countChanged.length}`,
    );
    if (isClean(diff)) {
      console.log('0/0/0/0 ✅');
      return;
    }
    show('缺失', diff.missing);
    show('多余', diff.extra);
    show('内容变化', diff.changed);
    show('计数变化', diff.countChanged);
    process.exit(1);
  }

  console.error('用法：node tools/id-snapshot.ts --write | --check');
  process.exit(2);
};

const invoked = process.argv[1]?.replace(/\\/g, '/') ?? '';
if (invoked.endsWith('tools/id-snapshot.ts') || invoked.endsWith('tools/id-snapshot.js')) {
  await main();
}
