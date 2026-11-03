/**
 * report 的数据装配层 —— 只做装载，不做任何猜测。
 *
 * 约定（唯一）：`data/{machine,material,measure}/*.ts` 每个文件在末尾导出
 *   export const DATA_ITEMS: readonly Item[];
 *   export const DATA_ROUTES: readonly Route[];
 * 加载器只读这两个名字。缺一个、或不是数组 —— **直接抛错并报出文件名**，
 * 不分类、不去重、不两遍扫描、不静默跳过。
 *
 * 重复声明由校验器报 `duplicate_id`：红了就回数据文件删重复声明
 * （例如同一个对象在 ITEMS 与 PARTS 里各写一遍），不许在加载器里消化。
 *
 * `data/floor/mars.ts` 与 `data/floor/seed.ts` 是特殊的：前者提供 ambient，
 * 后者是种子唯一定义（且受保护不改），这里直接取它们的 items/routes，
 * 不走 DATA_* 约定 —— 所以 `test/exports.test.ts` 只扫上面三个目录。
 */

import type { Description } from '../../src/index.ts';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { MARS } from '../../data/floor/mars.ts';
import { SEED, SEED_IDS } from '../../data/floor/seed.ts';

type Item = Description['items'][number];
type Route = Description['routes'][number];

const DATA_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../data');
const DIRS = ['machine', 'material', 'measure'] as const;

const items: Item[] = [...MARS.items, ...SEED.items];
const routes: Route[] = [...MARS.routes, ...SEED.routes];

for (const dir of DIRS) {
  const dirPath = join(DATA_ROOT, dir);
  const files = readdirSync(dirPath)
    .filter((f) => f.endsWith('.ts'))
    .sort();

  for (const file of files) {
    const full = join(dirPath, file);
    let mod: Record<string, unknown>;
    try {
      mod = (await import(pathToFileURL(full).href)) as Record<string, unknown>;
    } catch (e) {
      throw new Error(`${dir}/${file}: 导入失败 —— ${(e as Error).message}`);
    }

    const dataItems = mod.DATA_ITEMS;
    const dataRoutes = mod.DATA_ROUTES;
    if (!Array.isArray(dataItems)) {
      throw new Error(
        `${dir}/${file}: 缺少 \`export const DATA_ITEMS: readonly Item[]\`（写法见 tools/normalize-exports.mjs）`,
      );
    }
    if (!Array.isArray(dataRoutes)) {
      throw new Error(
        `${dir}/${file}: 缺少 \`export const DATA_ROUTES: readonly Route[]\`（写法见 tools/normalize-exports.mjs）`,
      );
    }

    items.push(...(dataItems as Item[]));
    routes.push(...(dataRoutes as Route[]));
  }
}

export const data: Description = { ambient: MARS.ambient, items, routes };

// 种子的唯一定义在 data/floor/seed.ts：SEED_IDS。
// 起点与“不报断点”必须是同一份，否则会出现“不从它出发、也不报它断点”的隐形条目。
export const seedIds: ReadonlySet<string> = new Set(SEED_IDS);
export const seedFrontier: readonly string[] = [...SEED_IDS];
