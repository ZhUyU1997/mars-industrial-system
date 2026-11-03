/**
 * 线锯 —— 第 6 门：把一根单晶棒切成片。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么不能用车床切断
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 硅片要 0.7 mm 厚、φ100 的圆片，切缝损失越小越好（一片硅棒切出多少片，
 * 全看切缝）。车刀一切就崩边 —— 硅是脆的，切削力一集中就裂。
 *
 * 工业上有两条路：**内圆锯**（金刚石镀在环刃内缘）与**线锯**（钢丝带着磨料走）。
 * 前者要金刚石，本层没有；后者只要钢丝与碳化硅浆料 —— **所以走线锯。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 游离磨料线锯怎么切
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   一根钢丝在几个导轮之间来回绕，形成一排平行的"切割线"（一次切几十片）
 *   浆料（碳化硅 + 油或水）浇在线上，钢丝带着磨料碾进硅里
 *   线走的是往复运动，两头收放 —— 线本身不锋利，**锋利的是磨料**
 *
 * 所以它切的不是"刀刃"，是"磨"：切缝 0.2 mm 级，表面有一层损伤层（几微米），
 * 后面的研磨与抛光就是把这层磨掉。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 一处降级：钢丝是消耗品
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 工业线锯用镀铜钢丝（φ0.12），切几十刀就换。本层的钢丝靠拉丝，细到 0.12 要
 * 很好的模具 —— 拉丝模现在自己磨，但细到 0.12 mm 仍然吃力。
 * 所以这里按"能切"写，不按"切得省"写：线粗一点、切缝宽一点、出片少一点。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const WIRE_SAW_PARTS: readonly Item[] = [
  /** 机架与导轮。铸铁机架 + 四个导轮（导轮槽距决定片厚）+ 张力机构。 */
  { id: 'plant/wire-saw/frame', name: 'Wire Saw Frame and Guide Wheels', name_zh: '线锯机架与导轮', unit: '件', category: 'part' },

  /** 丝与浆料系统。钢丝卷 + 收放轮 + 浆料槽 + 搅拌泵（浆料沉底就不切了）。 */
  { id: 'plant/wire-saw/slurry', name: 'Wire Saw Wire and Slurry System', name_zh: '线锯丝与浆料系统', unit: '件', category: 'part' },
];

export const WIRE_SAW_ROUTES: readonly Route[] = [
  {
    /** 机架与导轮。铸铁机架 → 导轮车槽（槽距 0.7 mm）→ 张力机构 → 装配。 */
    id: 'make/wire-saw-frame',
    name: 'Wire Saw Frame and Guide Wheels Manufacturing', name_zh: '线锯机架与导轮制造',
    produces: [{ item: 'plant/wire-saw/frame', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht200', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'std/bearing-general-p0', qty: q(4) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '机架铸造与加工', performedBy: 'plant/milling-machine' },
      { note_zh: '导轮车槽（槽距 0.7 mm）', performedBy: 'lathe' },
      { note_zh: '装配与张力调整', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 丝与浆料系统。钢丝（拉丝）→ 收放轮 → 浆料槽与泵 → 管路。 */
    id: 'make/wire-saw-slurry',
    name: 'Wire Saw Wire and Slurry System Manufacturing', name_zh: '线锯丝与浆料系统制造',
    produces: [{ item: 'plant/wire-saw/slurry', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/silicon-carbide', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['plant/rolling-mill'],
    performedBy: 'plant/robot',
  },
];

/**
 * 线锯。没有温度条件 —— 它是冷加工。
 *
 * 一次能挂一根棒、切几十片，片厚由导轮槽距定：换导轮就换片厚。
 */
export const WIRE_SAW: Item = {
  id: 'plant/wire-saw',
  name: 'Wire Saw', name_zh: '线锯',
  unit: '台',
  category: 'machine',
  composedOf: [
    ...WIRE_SAW_PARTS.map((p) => ({ item: p.id, qty: q(1) })),
    { item: 'std/motor-7.5kw-4p', qty: q(1) },
    { item: 'std/contactor-general', qty: q(1) },
  ],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...WIRE_SAW_PARTS, WIRE_SAW];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/wire-saw',
    name: 'Wire Saw Assembly', name_zh: '线锯装配',
    produces: [{
      item: 'plant/wire-saw',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...WIRE_SAW_ROUTES, ...ASSEMBLY_ROUTES];
