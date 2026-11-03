/**
 * 罗茨转子对的零件与零件路线。
 *
 * 本文件只回答一件事：`plant/evaporator/pump/roots` 由哪些零件组成，每个零件怎么造。
 *
 * 组成件：
 *
 *   8 字形转子 2 只（HT250，型线铣削，间隙 0.1 mm）
 *   转子轴 2 根（40Cr）
 *   同步齿轮 2 只（40Cr，滚齿）
 *   滚动轴承 2 套（P0）
 *
 * 原路线把轴承、铸铁、40Cr 全写在 `uses` 里，没有说明转子对本身由哪些件装成。
 * 这里把可拆的转子、轴、同步齿轮、轴承拆出来；材料用量按原路线的 1 kg HT250
 * 与 1 kg 40Cr 分配，分配值是设计值，不是逐件称重。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ROOTS_PARTS: readonly Item[] = [
  { id: 'plant/evaporator/pump/roots/rotor', name: 'Roots Rotor', name_zh: '罗茨转子', unit: '件', category: 'part' },
  { id: 'plant/evaporator/pump/roots/shaft', name: 'Roots Rotor Shaft', name_zh: '罗茨转子轴', unit: '件', category: 'part' },
  { id: 'plant/evaporator/pump/roots/timing-gear', name: 'Roots Timing Gear', name_zh: '罗茨同步齿轮', unit: '件', category: 'part' },
];

const ROOTS_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 8 字形转子 2 只：HT250 铸坯，型线铣削，配对间隙 0.1 mm。 */
    id: 'make/roots-rotor-profile',
    name: 'Roots Rotor Manufacturing', name_zh: '罗茨转子制造',
    produces: [{ item: 'plant/evaporator/pump/roots/rotor', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] }],
    steps: [
      { note_zh: '铸 8 字形转子毛坯 2 只', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1380, max: 1450 }] },
      { note_zh: '铣型线，配对间隙 0.1 mm', performedBy: 'plant/milling-machine' },
      { note_zh: '动平衡', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 转子轴 2 根：40Cr，车轴承位与齿轮位。 */
    id: 'make/roots-shaft',
    name: 'Roots Rotor Shaft Manufacturing', name_zh: '罗茨转子轴制造',
    produces: [{ item: 'plant/evaporator/pump/roots/shaft', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/steel-40cr', qty: q(1, 2) }] }],
    steps: [
      { note_zh: '车轴：轴承位与齿轮位留磨量', performedBy: 'lathe' },
      { note_zh: '磨轴承位', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 同步齿轮 2 只：40Cr，滚齿，齿数按 1:1 同步。 */
    id: 'make/roots-timing-gear',
    name: 'Roots Timing Gear Manufacturing', name_zh: '罗茨同步齿轮制造',
    produces: [{ item: 'plant/evaporator/pump/roots/timing-gear', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/steel-40cr', qty: q(1, 2) }] }],
    performedBy: 'plant/gear-hobbing',
  },
];

export const ROOTS_PART_ROUTES: readonly Route[] = ROOTS_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ROOTS_PARTS];
export const DATA_ROUTES: readonly Route[] = [...ROOTS_PART_ROUTES];
