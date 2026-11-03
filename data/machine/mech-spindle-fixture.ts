/**
 * 主轴误差分析仪定心/翻转夹具的零件与零件路线。
 *
 * 本文件只回答一件事：`plant/spindle-error-analyzer/fixture` 由哪些零件组成，
 * 每个零件怎么造。
 *
 * 组成件：
 *
 *   夹具本体 1 只（45 钢，车定心锥面与四个定位销孔）
 *   定位销 4 只（轴承钢，0/90/180/270°）
 *   P5 轴承 2 套
 *
 * 原路线只写“45 钢 2 + 轴承钢 0.5 + P5 轴承 2 + 铜线 0.01”，没有说明本体与
 * 四个销是两个可拆件。45 钢 2 kg 给本体，轴承钢 0.5 kg 给 4 只销；铜线
 * 0.01 kg 留在整机路线作锁线。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const SPINDLE_FIXTURE_PARTS: readonly Item[] = [
  { id: 'plant/spindle-error-analyzer/fixture/body', name: '主轴周期误差分析仪夹具本体', unit: '件', category: 'part' },
  { id: 'plant/spindle-error-analyzer/fixture/locating-pin', name: '主轴周期误差分析仪定位销', unit: '件', category: 'part' },
];

const SPINDLE_FIXTURE_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 夹具本体：45 钢 2 kg，车定心锥面，一次装夹钻四个销孔。 */
    id: 'make/spindle-fixture-body',
    name: '主轴周期误差分析仪夹具本体制造',
    produces: [{ item: 'plant/spindle-error-analyzer/fixture/body', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(2) }] }],
    steps: [
      { note_zh: '车定心锥面', performedBy: 'lathe' },
      { note_zh: '一次装夹钻 0/90/180/270° 四个销孔，锥面与销孔同轴 ≤2 µm', performedBy: 'plant/milling-machine' },
    ],
  },
  {
    /** 定位销 4 只：轴承钢 0.5 kg，磨到与销孔配作。 */
    id: 'make/spindle-fixture-pin',
    name: '主轴周期误差分析仪定位销制造',
    produces: [{ item: 'plant/spindle-error-analyzer/fixture/locating-pin', qty: q(4) }],
    uses: [{ anyOf: [{ item: 'mat/bearing-steel', qty: q(1, 2) }] }],
    steps: [
      { note_zh: '车 4 只销，留磨量', performedBy: 'lathe' },
      { note_zh: '磨到与销孔配作', performedBy: 'plant/grinder' },
    ],
  },
];

export const SPINDLE_FIXTURE_PART_ROUTES: readonly Route[] = SPINDLE_FIXTURE_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...SPINDLE_FIXTURE_PARTS];
export const DATA_ROUTES: readonly Route[] = [...SPINDLE_FIXTURE_PART_ROUTES];
