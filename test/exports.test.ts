/**
 * 数据文件的导出约定护栏。
 *
 * 唯一约定：`data/{machine,material,measure}/*.ts` 每个文件必须在末尾导出
 *   export const DATA_ITEMS: readonly Item[];
 *   export const DATA_ROUTES: readonly Route[];
 * 加载器（tools/lib/index.ts）只读这两个名字，缺一个就抛错。
 *
 * 这条测试比上一版严三处：
 *   ① 每个文件都必须有这两个数组导出；
 *   ② **不能是空对**（DATA_ITEMS.length + DATA_ROUTES.length > 0）——
 *      上一版出过“静默写成空数组、条目凭空消失、闸门全绿”的事故；
 *   ③ 装载后的总量不得低于回滚前基线（items ≥ 1998、routes ≥ 2227）——
 *      即便某个文件“合法地”少了几条，这条也会红。
 *
 * `data/floor/mars.ts` 与 `data/floor/seed.ts` 是特殊文件（MARS 提供 ambient，
 * seed 是种子唯一定义且受保护），不在本约定的扫描范围内。
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { model } from '../tools/lib/index.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIRS = ['machine', 'material', 'measure'] as const;

const dataFiles = (): string[] =>
  DIRS.flatMap((dir) =>
    readdirSync(join(ROOT, 'data', dir))
      .filter((f) => f.endsWith('.ts'))
      .map((f) => `data/${dir}/${f}`),
  ).sort();

describe('数据文件的导出约定', () => {
  it('每个文件都导出非空的 DATA_ITEMS / DATA_ROUTES，且装载总量不低于基线', async () => {
    const files = dataFiles();
    assert.ok(files.length > 400, `扫到的数据文件太少（${files.length}）—— 路径不对？`);

    const problems: string[] = [];
    for (const rel of files) {
      const mod = (await import(pathToFileURL(join(ROOT, rel)).href)) as {
        DATA_ITEMS?: unknown[];
        DATA_ROUTES?: unknown[];
      };
      if (!Array.isArray(mod.DATA_ITEMS)) problems.push(`${rel}: 缺少 DATA_ITEMS`);
      if (!Array.isArray(mod.DATA_ROUTES)) problems.push(`${rel}: 缺少 DATA_ROUTES`);
      if (Array.isArray(mod.DATA_ITEMS) && Array.isArray(mod.DATA_ROUTES) && mod.DATA_ITEMS.length + mod.DATA_ROUTES.length === 0) {
        problems.push(`${rel}: 导出是空对（DATA_ITEMS 与 DATA_ROUTES 都是 []）—— 条目会凭空消失`);
      }
      for (const [name, list] of [
        ['DATA_ITEMS', mod.DATA_ITEMS],
        ['DATA_ROUTES', mod.DATA_ROUTES],
      ] as const) {
        if (!Array.isArray(list)) continue;
        if (list.some((x) => x === null || typeof x !== 'object' || typeof (x as { id?: unknown }).id !== 'string')) {
          problems.push(`${rel}: ${name} 里有元素缺 id`);
        }
      }
    }
    assert.deepEqual(
      problems,
      [],
      `以下文件没按约定导出（照 tools/lib/index.ts（约定的唯一定义处） 的写法补）：\n${problems.join('\n')}`,
    );

    assert.ok(model.data.items.length >= 1998, `items 只有 ${model.data.items.length}，低于基线 1998 —— 有东西被静默丢了`);
    assert.ok(model.data.routes.length >= 2227, `routes 只有 ${model.data.routes.length}，低于基线 2227 —— 有东西被静默丢了`);
  });
});
