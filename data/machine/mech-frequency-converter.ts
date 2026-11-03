/**
 * 中频发电机的零件与零件路线。
 *
 * 本文件只回答一件事：`std/frequency-converter-general` 由哪些零件组成，
 * 每个零件怎么造。
 *
 * 组成件：
 *
 *   机座 1 只（HT200 铸铁，含磁极）
 *   定子 1 只（硅钢叠片 + 绕组）
 *   凸极转子 1 只（硅钢，无绕组、无换向器、无电刷）
 *   P0 轴承 2 套
 *
 * 原路线只写“硅钢 1 + 漆包线 1 + 铜 1 + 铸铁 1 + 轴承 2”。这里把机座、
 * 定子、转子拆出来；铜 1 kg 留在整机路线作端子与引线。硅钢按定子 0.6、
 * 转子 0.4 分配；漆包线 1 kg 全部给定子（转子无绕组）。分配值是设计值，
 * 不是逐件称重。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FREQUENCY_CONVERTER_PARTS: readonly Item[] = [
  { id: 'std/frequency-converter-general/frame', name: 'Medium-Frequency Generator Set Frame', name_zh: '中频发电机组机座', unit: '件', category: 'part' },
  { id: 'std/frequency-converter-general/stator', name: 'Medium-Frequency Generator Set Stator', name_zh: '中频发电机组定子', unit: '件', category: 'part' },
  { id: 'std/frequency-converter-general/rotor', name: 'Medium-Frequency Generator Set Salient-Pole Rotor', name_zh: '中频发电机组凸极转子', unit: '件', category: 'part' },
];

const FREQUENCY_CONVERTER_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 机座：HT200 铸铁，含磁极，极面磨平。 */
    id: 'make/frequency-converter-frame',
    name: 'Medium-Frequency Generator Set Frame Manufacturing', name_zh: '中频发电机组机座制造',
    produces: [{ item: 'std/frequency-converter-general/frame', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(1) }] }],
    steps: [
      { note_zh: '浇机座与磁极', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1350, max: 1450 }] },
      { note_zh: '磨极面', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 定子：硅钢叠片 0.6 kg + 漆包线 1 kg，嵌绕组。 */
    id: 'make/frequency-converter-stator',
    name: 'Medium-Frequency Generator Set Stator Manufacturing', name_zh: '中频发电机组定子制造',
    produces: [{ item: 'std/frequency-converter-general/stator', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-steel-3si', qty: q(3, 5) }] },
      { anyOf: [{ item: 'mat/enamel-wire', qty: q(1) }] },
    ],
    performedBy: 'plant/winder',
  },
  {
    /** 凸极转子：硅钢 0.4 kg，铣槽、压轴、动平衡；无绕组。 */
    id: 'make/frequency-converter-rotor',
    name: 'Medium-Frequency Generator Set Salient-Pole Rotor Manufacturing', name_zh: '中频发电机组凸极转子制造',
    produces: [{ item: 'std/frequency-converter-general/rotor', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/silicon-steel-3si', qty: q(2, 5) }] }],
    steps: [
      { note_zh: '铣凸极槽并压轴', performedBy: 'plant/milling-machine' },
      { note_zh: '动平衡', performedBy: 'plant/robot' },
    ],
  },
];

export const FREQUENCY_CONVERTER_PART_ROUTES: readonly Route[] = FREQUENCY_CONVERTER_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...FREQUENCY_CONVERTER_PARTS];
export const DATA_ROUTES: readonly Route[] = [...FREQUENCY_CONVERTER_PART_ROUTES];
