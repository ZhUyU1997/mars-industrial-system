/**
 * 法拉第杯的零件与零件路线。
 *
 * 本文件只回答一件事：`plant/e-beam-column/faraday-cup` 由哪些零件组成，
 * 每个零件怎么造。
 *
 * 组成件：
 *
 *   石墨杯 1 只（碳，内锥 45°、口 φ8、深 15）
 *   铜抑制环 1 只（铜，−100 V，把二次电子赶回杯内）
 *   熔石英绝缘垫 1 片（厚 3 mm、两端平行 0.01）
 *   齐纳基准 2 只（串联成 −100 V 偏压）
 *
 * 原路线把碳、铜、石英、齐纳都写在 `uses` 里；前三种是三个可拆零件的材料，
 * 齐纳是标准件。这里把零件拆出来，整机路线只留装配与漏电测量。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FARADAY_CUP_PARTS: readonly Item[] = [
  { id: 'plant/e-beam-column/faraday-cup/graphite-cup', name: 'Electron Beam Column Graphite Cup', name_zh: '电子束柱石墨杯', unit: '件', category: 'part' },
  { id: 'plant/e-beam-column/faraday-cup/copper-ring', name: 'Electron Beam Column Copper Suppression Ring', name_zh: '电子束柱铜抑制环', unit: '件', category: 'part' },
  { id: 'plant/e-beam-column/faraday-cup/quartz-insulator', name: 'Electron Beam Column Quartz Insulator Pad', name_zh: '电子束柱石英绝缘垫', unit: '件', category: 'part' },
];

const FARADAY_CUP_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 石墨杯：碳 0.2 kg，车 45° 内锥，口 φ8、深 15。 */
    id: 'make/faraday-graphite-cup',
    name: 'Electron Beam Column Graphite Cup Manufacturing', name_zh: '电子束柱石墨杯制造',
    produces: [{ item: 'plant/e-beam-column/faraday-cup/graphite-cup', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/carbon', qty: q(1, 5) }] }],
    performedBy: 'lathe',
  },
  {
    /** 铜抑制环：铜 1 kg，车环与引线孔。 */
    id: 'make/faraday-copper-ring',
    name: 'Electron Beam Column Copper Suppression Ring Manufacturing', name_zh: '电子束柱铜抑制环制造',
    produces: [{ item: 'plant/e-beam-column/faraday-cup/copper-ring', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(1) }] }],
    performedBy: 'lathe',
  },
  {
    /** 石英绝缘垫：高纯石英 0.1 kg，磨到厚 3 mm、两端平行 0.01。 */
    id: 'make/faraday-quartz-insulator',
    name: 'Electron Beam Column Quartz Insulator Pad Manufacturing', name_zh: '电子束柱石英绝缘垫制造',
    produces: [{ item: 'plant/e-beam-column/faraday-cup/quartz-insulator', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 10) }] }],
    performedBy: 'plant/grinder',
  },
];

export const FARADAY_CUP_PART_ROUTES: readonly Route[] = FARADAY_CUP_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...FARADAY_CUP_PARTS];
export const DATA_ROUTES: readonly Route[] = [...FARADAY_CUP_PART_ROUTES];
