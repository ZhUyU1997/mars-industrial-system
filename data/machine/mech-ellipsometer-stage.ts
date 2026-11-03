/**
 * 椭偏仪样品台的零件与零件路线。
 *
 * 本文件只回答一件事：`plant/ellipsometer/sample-stage` 由哪些零件组成，
 * 每个零件怎么造。
 *
 * 组成件：
 *
 *   承片台 1 只（铝，φ200 盘面，平面度 10 µm）
 *   丝杠 2 根（45 钢，2 mm/转，X/Y 各一）
 *   消隙螺母 2 只（45 钢，回差 ≤2 µm）
 *   校准尺 2 把（std/calibrated-scale-100，100 nm 刻线）
 *   自整角机 2 台（驱动 X/Y，不作位置读数）
 *
 * 铝 12 kg 全部给承片台；45 钢 4 kg 按丝杠 2 kg、螺母 2 kg 分配。
 * 铜线 0.3 kg 与 6 kg 水留在整机路线，作接线与清洗，不冒充零件。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ELLIPSOMETER_STAGE_PARTS: readonly Item[] = [
  { id: 'plant/ellipsometer/sample-stage/table', name: '椭偏仪承片台', unit: '件', category: 'part' },
  { id: 'plant/ellipsometer/sample-stage/lead-screw', name: '椭偏仪丝杠', unit: '件', category: 'part' },
  { id: 'plant/ellipsometer/sample-stage/anti-backlash-nut', name: '椭偏仪消隙螺母', unit: '件', category: 'part' },
];

const ELLIPSOMETER_STAGE_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 承片台：铝 12 kg，铣台面与 φ200 承片盘，盘面平面度 10 µm。 */
    id: 'make/ellipsometer-stage-table',
    name: '椭偏仪承片台制造',
    produces: [{ item: 'plant/ellipsometer/sample-stage/table', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/aluminium', qty: q(12) }] }],
    steps: [
      { note_zh: '铣台面与 φ200 承片盘', performedBy: 'plant/milling-machine' },
      { note_zh: '磨盘面到平面度 10 µm', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 丝杠 2 根：45 钢，2 mm/转，X/Y 各一根。 */
    id: 'make/ellipsometer-stage-lead-screw',
    name: '椭偏仪丝杠制造',
    produces: [{ item: 'plant/ellipsometer/sample-stage/lead-screw', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(2) }] }],
    steps: [
      { note_zh: '车 2 mm/转丝杠 2 根', performedBy: 'lathe' },
      { note_zh: '磨螺纹中径', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 消隙螺母 2 只：45 钢，两半配作，回差 ≤2 µm。 */
    id: 'make/ellipsometer-stage-anti-backlash-nut',
    name: '椭偏仪消隙螺母制造',
    produces: [{ item: 'plant/ellipsometer/sample-stage/anti-backlash-nut', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(2) }] }],
    steps: [
      { note_zh: '车两半螺母', performedBy: 'lathe' },
      { note_zh: '与丝杠配作，回差 ≤2 µm', performedBy: 'plant/grinder' },
    ],
  },
];

export const ELLIPSOMETER_STAGE_PART_ROUTES: readonly Route[] = ELLIPSOMETER_STAGE_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ELLIPSOMETER_STAGE_PARTS];
export const DATA_ROUTES: readonly Route[] = [...ELLIPSOMETER_STAGE_PART_ROUTES];
