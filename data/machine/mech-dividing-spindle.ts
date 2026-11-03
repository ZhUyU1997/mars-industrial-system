/**
 * 分度台主轴的零件与零件路线。
 *
 * 本文件只回答一件事：`plant/dividing-table/spindle` 由哪些零件组成，
 * 每个零件怎么造。
 *
 * 组成件：
 *
 *   主轴轴 1 根（轴承钢 + 45 钢，φ60 法兰 + φ25 轴颈）
 *   P5 主轴轴承 2 套
 *
 * 原路线把轴承钢、45 钢、P5 轴承、铜线都写在 `uses` 里；其中轴承钢与 45 钢
 * 是轴的材料，铜线是装轴承时用的锁线。轴是单件加工件，材料与车/磨工序
 * 放进子路线；整机路线只留装配、预紧与跳动测量。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DIVIDING_SPINDLE_PARTS: readonly Item[] = [
  { id: 'plant/dividing-table/spindle/shaft', name: '分度台主轴轴', unit: '件', category: 'part' },
];

const DIVIDING_SPINDLE_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 主轴轴：轴承钢 1 kg + 45 钢 1 kg，车 φ60 法兰与 φ25 轴颈，磨到 h4。 */
    id: 'make/dividing-spindle-shaft',
    name: '分度台主轴轴制造',
    produces: [{ item: 'plant/dividing-table/spindle/shaft', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/bearing-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车轴：φ60 法兰 + φ25 轴颈，一次装夹车两端中心孔', performedBy: 'lathe' },
      { note_zh: '磨轴颈到 φ25 h4、圆度 ≤0.2 µm（恒温间）', performedBy: 'plant/grinder', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },
];

export const DIVIDING_SPINDLE_PART_ROUTES: readonly Route[] = DIVIDING_SPINDLE_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...DIVIDING_SPINDLE_PARTS];
export const DATA_ROUTES: readonly Route[] = [...DIVIDING_SPINDLE_PART_ROUTES];
