/**
 * 惰气熔融炉上下电极与坩埚托的零件与零件路线。
 *
 * 本文件只回答一件事：`plant/inert-gas-fusion-analyzer/electrode` 由哪些零件组成，
 * 每个零件怎么造。
 *
 * 组成件：
 *
 *   石墨电极 1 根（从 `std/carbon-electrode-300` 车出，0.48 kg）
 *   铜水冷座 1 只（铜 1.2 kg，内腔通水）
 *   45 钢压紧环 1 只（0.3 kg）
 *
 * 原路线只写“石墨电极 0.48 + 铜 1.2 + 45 钢 0.3 + 水 0.5 → 电极组 1 套”。
 * 石墨电极是从标准碳电极车出来的，属于不可逆加工，所以子路线用 uses 记录
 * 标准电极输入；铜座与压紧环是单件加工。水 0.5 kg 留在整机路线作打压试验。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FUSION_ELECTRODE_PARTS: readonly Item[] = [
  { id: 'plant/inert-gas-fusion-analyzer/electrode/graphite', name: '惰气熔融-红外氧分析仪石墨电极', unit: '件', category: 'part' },
  { id: 'plant/inert-gas-fusion-analyzer/electrode/copper-seat', name: '惰气熔融-红外氧分析仪铜水冷座', unit: '件', category: 'part' },
  { id: 'plant/inert-gas-fusion-analyzer/electrode/clamp-ring', name: '45 钢压紧环', unit: '件', category: 'part' },
];

const FUSION_ELECTRODE_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 石墨电极：从 300 mm 标准碳电极车出 φ40×120，两端 30° 锥面。 */
    id: 'make/fusion-graphite-electrode',
    name: '惰气熔融-红外氧分析仪石墨电极制造',
    produces: [{ item: 'plant/inert-gas-fusion-analyzer/electrode/graphite', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'std/carbon-electrode-300', qty: q(1, 150) }] }],
    performedBy: 'lathe',
  },
  {
    /** 铜水冷座：铜 1.2 kg，车内腔与密封面。 */
    id: 'make/fusion-copper-seat',
    name: '惰气熔融-红外氧分析仪铜水冷座制造',
    produces: [{ item: 'plant/inert-gas-fusion-analyzer/electrode/copper-seat', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(6, 5) }] }],
    performedBy: 'lathe',
  },
  {
    /** 45 钢压紧环：0.3 kg，车成，压住石墨电极。 */
    id: 'make/fusion-clamp-ring',
    name: '45 钢压紧环制造',
    produces: [{ item: 'plant/inert-gas-fusion-analyzer/electrode/clamp-ring', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(3, 10) }] }],
    performedBy: 'lathe',
  },
];

export const FUSION_ELECTRODE_PART_ROUTES: readonly Route[] = FUSION_ELECTRODE_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...FUSION_ELECTRODE_PARTS];
export const DATA_ROUTES: readonly Route[] = [...FUSION_ELECTRODE_PART_ROUTES];
