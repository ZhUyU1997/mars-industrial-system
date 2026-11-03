/**
 * 轮廓仪行程驱动的零件与零件路线。
 *
 * 本文件只回答一件事：`plant/stylus-profilometer/traverse` 由哪些零件组成，
 * 每个零件怎么造。
 *
 * 组成件：
 *
 *   机座 1 只（HT250，3 kg）
 *   蜗杆 1 根（45 钢，m=1、1:48）
 *   蜗轮 1 只（轴承钢，48 齿）
 *   T2 丝杠 1 根（45 钢，导程 2 mm）
 *   消隙螺母 1 只（45 钢，空回 ≤2 µm）
 *   7.5 kW 电机 1 台
 *   P0 轴承 2 套
 *
 * 原路线只写“电机 1 + 45 钢 2 + 轴承钢 0.5 + P0 轴承 2 + 铸铁 3”。
 * 45 钢 2 kg 按蜗杆 0.6、丝杠 0.9、螺母 0.5 分配；铜线 0.1 kg 留在整机路线
 * 作接线。分配值是设计值，不是逐件称重。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const STYLUS_TRAVERSE_PARTS: readonly Item[] = [
  { id: 'plant/stylus-profilometer/traverse/frame', name: '触针式轮廓仪机座', unit: '件', category: 'part' },
  { id: 'plant/stylus-profilometer/traverse/worm', name: '触针式轮廓仪蜗杆', unit: '件', category: 'part' },
  { id: 'plant/stylus-profilometer/traverse/worm-wheel', name: '触针式轮廓仪蜗轮', unit: '件', category: 'part' },
  { id: 'plant/stylus-profilometer/traverse/lead-screw', name: 'T2 丝杠', unit: '件', category: 'part' },
  { id: 'plant/stylus-profilometer/traverse/anti-backlash-nut', name: '触针式轮廓仪消隙螺母', unit: '件', category: 'part' },
];

const STYLUS_TRAVERSE_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 机座：HT250 3 kg，浇成后加工导轨与轴承座。 */
    id: 'make/stylus-traverse-frame',
    name: '触针式轮廓仪机座制造',
    produces: [{ item: 'plant/stylus-profilometer/traverse/frame', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(3) }] }],
    steps: [
      { note_zh: '浇机座并时效', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1350, max: 1450 }] },
      { note_zh: '铣导轨面与轴承座', performedBy: 'plant/milling-machine' },
    ],
  },
  {
    /** 蜗杆：45 钢 0.6 kg，m=1、1:48，齿面留 0.1 mm 磨量。 */
    id: 'make/stylus-traverse-worm',
    name: '触针式轮廓仪蜗杆制造',
    produces: [{ item: 'plant/stylus-profilometer/traverse/worm', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(3, 5) }] }],
    steps: [
      { note_zh: '车蜗杆 m=1、1:48', performedBy: 'lathe' },
      { note_zh: '磨齿面', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 蜗轮：轴承钢 0.5 kg，48 齿，与蜗杆对研。 */
    id: 'make/stylus-traverse-worm-wheel',
    name: '触针式轮廓仪蜗轮制造',
    produces: [{ item: 'plant/stylus-profilometer/traverse/worm-wheel', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/bearing-steel', qty: q(1, 2) }] }],
    steps: [
      { note_zh: '滚 48 齿蜗轮，齿面留 0.1 mm 磨量', performedBy: 'plant/gear-hobbing' },
      { note_zh: '与蜗杆对研', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** T2 丝杠：45 钢 0.9 kg，导程 2 mm，中径 ±5 µm/300 mm。 */
    id: 'make/stylus-traverse-lead-screw',
    name: 'T2 丝杠制造',
    produces: [{ item: 'plant/stylus-profilometer/traverse/lead-screw', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(9, 10) }] }],
    steps: [
      { note_zh: '车 T2 丝杠，导程 2 mm', performedBy: 'lathe' },
      { note_zh: '磨中径 ±5 µm/300 mm', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 消隙螺母：45 钢 0.5 kg，与丝杠配作，空回 ≤2 µm。 */
    id: 'make/stylus-traverse-anti-backlash-nut',
    name: '触针式轮廓仪消隙螺母制造',
    produces: [{ item: 'plant/stylus-profilometer/traverse/anti-backlash-nut', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 2) }] }],
    steps: [
      { note_zh: '车两半螺母', performedBy: 'lathe' },
      { note_zh: '与丝杠配作，空回 ≤2 µm', performedBy: 'plant/grinder' },
    ],
  },
];

export const STYLUS_TRAVERSE_PART_ROUTES: readonly Route[] = STYLUS_TRAVERSE_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...STYLUS_TRAVERSE_PARTS];
export const DATA_ROUTES: readonly Route[] = [...STYLUS_TRAVERSE_PART_ROUTES];
