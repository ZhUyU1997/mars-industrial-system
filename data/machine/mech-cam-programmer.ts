/**
 * 凸轮程序器的零件与零件路线。
 *
 * 本文件只回答一件事：`std/cam-programmer-general` 由哪些零件组成，
 * 每个零件怎么造。
 *
 * 组成件：
 *
 *   凸轮轴 1 根（45 钢，0.3 kg）
 *   可调凸轮 8 只（45 钢，0.5 kg）
 *   行程开关组 1 套（钨铜触点 + 弹簧片 + 酚醛壳体；钨 1、酚醛 1、铜 1）
 *   蜗轮蜗杆减速箱 1 只（45 钢，0.2 kg）
 *   7.5 kW 电机 1 台
 *
 * 原路线只写“45 钢 1 + 钨 1 + 酚醛 1 + 铜 1 + 电机 1”。这里把凸轮轴、
 * 8 只凸轮、行程开关组、减速箱拆出来；材料按上述件分配，剩余为车屑。
 * 分配值是设计值，不是逐件称重。
 *
 * ⚠️ **8 只是设计假设**：源条目只说“一串可调凸轮”，没有给只数；选 8 是为了
 * 覆盖 8 个动作点，后续设计确认前不能把 8 当成源数据。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CAM_PROGRAMMER_PARTS: readonly Item[] = [
  { id: 'std/cam-programmer-general/camshaft', name: '凸轮程序器凸轮轴', unit: '件', category: 'part' },
  { id: 'std/cam-programmer-general/cam', name: '凸轮程序器可调凸轮', unit: '件', category: 'part' },
  { id: 'std/cam-programmer-general/switch-block', name: '凸轮程序器行程开关组', unit: '套', category: 'part' },
  { id: 'std/cam-programmer-general/gearbox', name: '凸轮程序器蜗轮蜗杆减速箱', unit: '件', category: 'part' },
];

const CAM_PROGRAMMER_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 凸轮轴：45 钢 0.3 kg，车成，按 8 只凸轮的相位开键槽。 */
    id: 'make/cam-programmer-shaft',
    name: '凸轮程序器凸轮轴制造',
    produces: [{ item: 'std/cam-programmer-general/camshaft', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(3, 10) }] }],
    performedBy: 'lathe',
  },
  {
    /** 可调凸轮 8 只：45 钢 0.5 kg，车盘铣凸块。 */
    id: 'make/cam-programmer-cam',
    name: '凸轮程序器可调凸轮制造',
    produces: [{ item: 'std/cam-programmer-general/cam', qty: q(8) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 2) }] }],
    steps: [
      { note_zh: '车 8 只凸轮盘', performedBy: 'lathe' },
      { note_zh: '铣可调凸块', performedBy: 'plant/milling-machine' },
    ],
  },
  {
    /** 行程开关组：钨铜触点、弹簧片、酚醛壳体；钨 1、酚醛 1、铜 1。 */
    id: 'make/cam-programmer-switch-block',
    name: '凸轮程序器行程开关组制造',
    produces: [{ item: 'std/cam-programmer-general/switch-block', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    steps: [
      { note_zh: '压制酚醛壳体与触点座', performedBy: 'plant/press' },
      { note_zh: '装钨铜触点与弹簧片', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 蜗轮蜗杆减速箱：45 钢 0.2 kg，速比按“每步几秒”。 */
    id: 'make/cam-programmer-gearbox',
    name: '凸轮程序器蜗轮蜗杆减速箱制造',
    produces: [{ item: 'std/cam-programmer-general/gearbox', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 5) }] }],
    performedBy: 'plant/gear-hobbing',
  },
];

export const CAM_PROGRAMMER_PART_ROUTES: readonly Route[] = CAM_PROGRAMMER_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CAM_PROGRAMMER_PARTS];
export const DATA_ROUTES: readonly Route[] = [...CAM_PROGRAMMER_PART_ROUTES];
