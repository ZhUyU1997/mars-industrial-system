/**
 * 真空 —— 蒸铝要在低压下做，而本层一直没写"泵"。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么需要真空
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 真空蒸镀：把铝加热到 1200 °C 让它蒸发，铝原子直线飞出去、落在片子上。
 *
 *   气体分子的平均自由程   1 atm 下 70 nm   —— 铝原子出门就被撞回来
 *                          1 Pa 下 ~7 cm    —— 够穿过 20 cm 的钟罩
 *                          10⁻³ Pa 下 ~70 m —— 干净、致密
 *
 * 所以"能蒸镀"的门槛是 **1 Pa 左右**，"蒸得好"要 10⁻³ Pa。
 * 而本层以前只写了"蒸铝"三个字，从来没写泵 —— **那一步其实没有设备。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 两台泵：一台用水，一台不用油
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   水环泵   叶轮在水环里转，靠水封与偏心容积变化抽气 —— **不要油**，极限 ~3 kPa
 *   罗茨泵   两个 8 字形转子对转，把气从低压侧"推"到高压侧 —— **不要油**，压缩比 10–30
 *
 * 两级串联：3 kPa × 1/30 ≈ 100 Pa；再加一级罗茨可到 1–10 Pa。
 * **够粗蒸铝，不够做致密薄膜。**
 *
 * 为什么不用油封机械泵：要真空油，而真空油是精制矿物油 —— 本层没有石油。
 * 硅油可以做（硅 + 甲基氯 → 二甲基二氯硅烷 → 水解），但那是一条完整的新链。
 *
 * 所以这一层的高真空到 1 Pa 为止。**10⁻³ Pa 那一档是缺口，写在注释里，不假装有。**
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const VACUUM_PARTS: readonly Item[] = [
  /** 水环泵体。偏心泵壳 + 叶轮 + 水环补水口 —— 靠水封，不要油。 */
  { id: 'plant/evaporator/pump/water-ring', name: 'Evaporator Water-Ring Pump Body', name_zh: '蒸发器水环泵体', unit: '件', category: 'part' },

  /** 罗茨转子对。8 字形转子两只、同步齿轮一对、间隙 0.1 mm（不接触、不磨损）。 */
  { id: 'plant/evaporator/pump/roots', name: 'Evaporator Roots Rotor Pair', name_zh: '蒸发器罗茨转子对', unit: '件', category: 'part',
    composedOf: [
      { item: 'plant/evaporator/pump/roots/rotor', qty: q(2) },
      { item: 'plant/evaporator/pump/roots/shaft', qty: q(2) },
      { item: 'plant/evaporator/pump/roots/timing-gear', qty: q(2) },
      { item: 'std/bearing-general-p0', qty: q(2) },
    ] },

  /** 真空计。热偶计（1–100 Pa）与皮拉尼计（0.1–100 Pa）各一只。 */
  { id: 'plant/evaporator/pump/gauge', name: 'Evaporator Vacuum Gauge', name_zh: '蒸发器真空计', unit: '件', category: 'part' },

  /** 蒸镀钟罩。石英或玻璃钟罩 + 上下法兰 + 电极 + 观察窗 + 挡板。 */
  { id: 'plant/evaporator/bell', name: 'Evaporator Deposition Bell Jar', name_zh: '蒸发器蒸镀钟罩', unit: '件', category: 'part' },

  /** 蒸发舟与电极。钨丝篮（装铝丝）或钼舟，通大电流加热。 */
  { id: 'plant/evaporator/boat', name: 'Evaporator Boat and Electrode', name_zh: '蒸发器蒸发舟与电极', unit: '件', category: 'part' },
];

export const VACUUM_ROUTES: readonly Route[] = [
  {
    /** 水环泵：泵壳铸造 + 叶轮 + 轴封 + 补水接管。 */
    id: 'make/water-ring-pump',
    name: 'Evaporator Water-Ring Pump Body Manufacturing', name_zh: '蒸发器水环泵体制造',
    produces: [{ item: 'plant/evaporator/pump/water-ring', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht200', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'std/bearing-general-p0', qty: q(2) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 罗茨转子对：8 字形型线铣削 + 同步齿轮（滚齿）+ 动平衡。 */
    id: 'make/roots-rotor',
    name: 'Evaporator Roots Rotor Pair Manufacturing', name_zh: '蒸发器罗茨转子对制造',
    produces: [{ item: 'plant/evaporator/pump/roots', qty: q(1) }],
    // 转子、轴、同步齿轮、轴承在条目 composedOf 上；这里只写总装。
    uses: [],
    needs: ['plant/grinder'],
    steps: [
      { note_zh: '装转子与轴：配对间隙 0.1 mm', performedBy: 'plant/robot' },
      { note_zh: '装同步齿轮：1:1 同步，齿侧间隙按转子间隙配', performedBy: 'plant/robot' },
      { note_zh: '装轴承与动平衡', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 真空计：热偶计（热电偶 + 加热丝）与皮拉尼计（惠斯通电桥 + 热丝）。 */
    id: 'make/vacuum-gauge',
    name: 'Evaporator Vacuum Gauge Manufacturing', name_zh: '蒸发器真空计制造',
    produces: [{ item: 'plant/evaporator/pump/gauge', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1) }] },
      { anyOf: [{ item: 'std/galvanometer-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 钟罩：石英管/玻璃罩成形 + 法兰 + 电极封接（玻璃-金属封接，那套）。 */
    id: 'make/evaporator-bell',
    name: 'Evaporator Deposition Bell Jar Manufacturing', name_zh: '蒸发器蒸镀钟罩制造',
    produces: [{ item: 'plant/evaporator/bell', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 蒸发舟：钨丝绕成篮，或钼片压成舟 —— 通电到 1200 °C 把铝蒸出去。 */
    id: 'make/evaporator-boat',
    name: 'Evaporator Boat and Electrode Manufacturing', name_zh: '蒸发器蒸发舟与电极制造',
    produces: [{ item: 'plant/evaporator/boat', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: ['plant/high-temp-furnace'],
    performedBy: 'plant/robot',
  },
];

/**
 * 真空机组。水环泵 + 两级罗茨，极限 1–10 Pa。
 *
 * ⚠️ 它记成**零件**而不是设备：本层只有蒸镀机要真空，所以它作为蒸镀机的一部分，
 * 不单独占一台机器。等以后有第二处要真空（CVD、离子注入），再拆出来。
 *
 * 它把环境从 0.6 kPa（火星大气）拉到 1 Pa —— 600 倍。这是本层第一次"把压力往低处
 * 维持"，而之前所有 hold 压力的设备（湿法槽、扩散炉、电解槽）都是往高处。
 */
export const VACUUM_PUMP: Item = {
  id: 'plant/evaporator/pump',
  name: 'Evaporator Pump', name_zh: '蒸发器泵',
  unit: '套',
  category: 'part',
  composedOf: [
    { item: 'plant/evaporator/pump/water-ring', qty: q(1) },
    { item: 'plant/evaporator/pump/roots', qty: q(2) },
    { item: 'plant/evaporator/pump/gauge', qty: q(1) },
    { item: 'std/motor-7.5kw-4p', qty: q(2) },
    { item: 'std/contactor-general', qty: q(1) },
  ],
};

export const EVAPORATOR: Item = {
  id: 'plant/evaporator',
  name: 'Evaporator', name_zh: '蒸发器',
  unit: '台',
  category: 'machine',
  holds: [{ param: 'pressure', min: 0.001, max: 10 }],
  // 与 holds 同一档：给 `measure/evaporator-base-pressure` 的校准边一个可判窗口。
  props: [{ param: 'pressure', kind: 'range', min: 0.001, max: 10, unit: 'Pa' }],
  composedOf: [
    { item: 'plant/evaporator/bell', qty: q(1) },
    { item: 'plant/evaporator/boat', qty: q(1) },
    { item: 'plant/evaporator/pump', qty: q(1) },
  ],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...VACUUM_PARTS, EVAPORATOR, VACUUM_PUMP];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/evaporator',
    name: 'Evaporator Assembly', name_zh: '蒸发器装配',
    produces: [{
      item: 'plant/evaporator',
      qty: q(1),
      gives: [{ param: 'pressure', kind: 'range', min: 0.001, max: 10, record: 'mat/evaporator-base-pressure-record' }],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/evaporator-pump',
    name: 'Evaporator Pump Assembly', name_zh: '蒸发器泵装配',
    produces: [{
      item: 'plant/evaporator/pump',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...VACUUM_ROUTES, ...ASSEMBLY_ROUTES];
