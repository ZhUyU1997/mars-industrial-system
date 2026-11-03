/**
 * 自整角机的零件与零件路线。
 *
 * 本文件只回答一件事：`std/selsyn-general` 由哪些零件组成，每个零件怎么造。
 *
 * 组成件：
 *
 *   定子 1 只（硅钢叠片 + 三相整步绕组，120° 分布）
 *   转子 1 只（凸极单相绕组 + 两只铜滑环）
 *   电刷与刷握 1 套（碳刷 + 铜引线）
 *   P0 轴承 2 套
 *
 * 原路线只写“硅钢 1 + 漆包线 1 + 铜 1 + 碳 1 + 轴承 2”，没有说明定子、转子、
 * 电刷是三个可拆件。材料按功能分配：硅钢与漆包线 0.6/0.4 给定子/转子，
 * 铜 0.6 给转子滑环、0.4 给电刷与引线，碳 1 给电刷。分配值是设计值，
 * 不是逐件称重。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const SELSYN_PARTS: readonly Item[] = [
  { id: 'std/selsyn-general/stator', name: 'Selsyn Stator', name_zh: '自整角机定子', unit: '件', category: 'part' },
  { id: 'std/selsyn-general/rotor', name: 'Selsyn Rotor', name_zh: '自整角机转子', unit: '件', category: 'part' },
  { id: 'std/selsyn-general/brush-block', name: 'Selsyn Brush and Brush Holder', name_zh: '自整角机电刷与刷握', unit: '件', category: 'part' },
];

const SELSYN_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 定子：硅钢叠片，三相整步绕组按 120° 分布。 */
    id: 'make/selsyn-stator',
    name: 'Selsyn Stator Manufacturing', name_zh: '自整角机定子制造',
    produces: [{ item: 'std/selsyn-general/stator', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-steel-3si', qty: q(3, 5) }] },
      { anyOf: [{ item: 'mat/enamel-wire', qty: q(3, 5) }] },
    ],
    performedBy: 'plant/winder',
  },
  {
    /** 转子：凸极单相绕组，轴上压两只铜滑环。 */
    id: 'make/selsyn-rotor',
    name: 'Selsyn Rotor Manufacturing', name_zh: '自整角机转子制造',
    produces: [{ item: 'std/selsyn-general/rotor', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-steel-3si', qty: q(2, 5) }] },
      { anyOf: [{ item: 'mat/enamel-wire', qty: q(2, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(3, 5) }] },
    ],
    steps: [
      { note_zh: '叠片与凸极转子，绕单相绕组', performedBy: 'plant/winder' },
      { note_zh: '车两只铜滑环并压轴', performedBy: 'lathe' },
    ],
  },
  {
    /** 电刷与刷握：碳刷压在滑环上，铜引线引出转子电流。 */
    id: 'make/selsyn-brush-block',
    name: 'Selsyn Brush and Brush Holder Manufacturing', name_zh: '自整角机电刷与刷握制造',
    produces: [{ item: 'std/selsyn-general/brush-block', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/carbon', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2, 5) }] },
    ],
    performedBy: 'plant/robot',
  },
];

export const SELSYN_PART_ROUTES: readonly Route[] = SELSYN_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...SELSYN_PARTS];
export const DATA_ROUTES: readonly Route[] = [...SELSYN_PART_ROUTES];
