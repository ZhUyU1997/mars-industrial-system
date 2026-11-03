/**
 * 划片机主轴的零件与零件路线。
 *
 * 本文件只回答一件事：`plant/dicing-saw/spindle` 由哪些零件组成，每个零件怎么造。
 *
 * 原条目注释写“空气轴承主轴”，而 `make/dicing-spindle` 的实际路线是**成对 P5
 * 滚动轴承预紧**，没有空气轴承供气、节流孔或气浮面。这里按实际路线列 BOM，
 * 并把条目注释改成“精密主轴”；不沿用与路线不符的“空气轴承”。
 *
 * 组成件：
 *
 *   轴 1 根（45 钢，φ40 h5，轴承位 Ra ≤0.4 µm）
 *   成对 P5 主轴轴承 2 套
 *   7.5 kW 电机 1 台
 *
 * 轴是单件加工件，不是装配体；它的材料用量与车/磨工序写在子路线里。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DICING_SPINDLE_PARTS: readonly Item[] = [
  { id: 'plant/dicing-saw/spindle/shaft', name: '划片机主轴轴', unit: '件', category: 'part' },
];

const DICING_SPINDLE_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 主轴轴：45 钢 φ40 h5，轴承位磨到 Ra ≤0.4 µm。 */
    id: 'make/dicing-spindle-shaft',
    name: '划片机主轴轴制造',
    produces: [{ item: 'plant/dicing-saw/spindle/shaft', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(5) }] }],
    steps: [
      { note_zh: '车轴：φ40 h5，两端轴承位留磨量', performedBy: 'lathe' },
      { note_zh: '磨轴承位：Ra ≤0.4 µm，同轴度按成对轴承预紧要求', performedBy: 'plant/grinder' },
    ],
  },
];

export const DICING_SPINDLE_PART_ROUTES: readonly Route[] = DICING_SPINDLE_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...DICING_SPINDLE_PARTS];
export const DATA_ROUTES: readonly Route[] = [...DICING_SPINDLE_PART_ROUTES];
