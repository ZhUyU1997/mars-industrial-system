/**
 * 压机传动组的零件与零件路线。
 *
 * 本文件只回答一件事：`plant/press/drive` 由哪些零件组成，每个零件怎么造。
 *
 * 组成件：
 *
 *   飞轮 1 只（HT200 铸铁盘，车削 + 配重）
 *   曲轴 1 根（40Cr，偏心 30 mm，车磨）
 *   连杆 1 只（40Cr，锻后车铣）
 *   制动带 1 条（40Cr）
 *   滚动轴承 2 套（P0）
 *
 * 原路线只写“HT200 1 + 40Cr 1 + 轴承 2”，没有说明传动组由哪些可拆件装成。
 * 40Cr 的 1 kg 按曲轴 0.6、连杆 0.2、制动带 0.2 分配 —— 这是设计分配值，
 * 不是逐件称重，已在本行写明。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PRESS_DRIVE_PARTS: readonly Item[] = [
  { id: 'plant/press/drive/flywheel', name: '飞轮', unit: '件', category: 'part' },
  { id: 'plant/press/drive/crankshaft', name: '曲轴', unit: '件', category: 'part' },
  { id: 'plant/press/drive/connecting-rod', name: '连杆', unit: '件', category: 'part' },
  { id: 'plant/press/drive/brake-band', name: '制动带', unit: '件', category: 'part' },
];

const PRESS_DRIVE_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 飞轮：HT200 铸铁盘，车削 + 动平衡。 */
    id: 'make/press-flywheel',
    name: '飞轮制造',
    produces: [{ item: 'plant/press/drive/flywheel', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(1) }] }],
    steps: [
      { note_zh: '浇铸铁盘并车削', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1380, max: 1450 }] },
      { note_zh: '动平衡', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 曲轴：40Cr，偏心 30 mm，车削后磨轴颈。 */
    id: 'make/press-crankshaft',
    name: '曲轴制造',
    produces: [{ item: 'plant/press/drive/crankshaft', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-40cr', qty: q(3, 5) }] }],
    steps: [
      { note_zh: '车曲轴，偏心 30 mm', performedBy: 'lathe' },
      { note_zh: '磨轴颈', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 连杆：40Cr 锻坯，车铣两端孔。 */
    id: 'make/press-connecting-rod',
    name: '连杆制造',
    produces: [{ item: 'plant/press/drive/connecting-rod', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-40cr', qty: q(1, 5) }] }],
    steps: [
      { note_zh: '锻连杆毛坯', performedBy: 'plant/forge' },
      { note_zh: '车铣两端孔', performedBy: 'lathe' },
    ],
  },
  {
    /** 制动带：40Cr 带料，按飞轮外圆配作。 */
    id: 'make/press-brake-band',
    name: '制动带制造',
    produces: [{ item: 'plant/press/drive/brake-band', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-40cr', qty: q(1, 5) }] }],
    performedBy: 'plant/forge',
  },
];

export const PRESS_DRIVE_PART_ROUTES: readonly Route[] = PRESS_DRIVE_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PRESS_DRIVE_PARTS];
export const DATA_ROUTES: readonly Route[] = [...PRESS_DRIVE_PART_ROUTES];
