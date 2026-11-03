/**
 * 多晶硅设备 —— 精馏塔与还原钟罩。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 两台设备，各解一个"纯度"问题
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   精馏塔     把三氯氢硅里的硼、磷分掉 —— 物理提纯，靠塔板数
 *   还原钟罩   把三氯氢硅还原成硅，而**不让杂质进来** —— 化学沉积，靠气氛干净
 *
 * 前者是本层造得出的：塔体是钢板卷焊、塔盘是冲孔板、再沸器是列管换热器
 * （与制酸那条链的吸收塔同一种工艺）。
 *
 * 后者是本层造得最勉强的一台：水冷不锈钢钟罩 + 高纯硅芯 + 电极 + 尾气回收。
 * 它的难点不是形状，是**不漏**：一点点空气漏进去，氧就把硅氧化成二氧化硅，
 * 那炉料就废了。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 一处本层做不到的事：硅芯
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 还原炉里要先挂一根**硅芯**（φ5–8 mm 的高纯硅棒），电流通过它把它烧到 1100 °C，
 * 硅才往上长。第一根硅芯从哪来？工业上是拉出来的 —— 那要单晶炉。
 *
 * 本层的办法（写在这里，不建路线）：把多晶硅棒破碎、用高温烧结成一根细棒，
 * 电阻大但能导电，预热后就能用。**它是一次性的引子** —— 与"第一台绕线机
 * 由机器人手工绕"同型：环的入口是手艺，不是设备。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const POLY_PLANT_PARTS: readonly Item[] = [
  /** 精馏塔体与塔盘。不锈钢塔节 + 冲孔塔盘，法兰连接；塔内件可抽出清洗。 */
  { id: 'plant/distillation-tower/shell', name: 'Rectification Column Body and Trays', name_zh: '精馏塔体与塔盘', unit: '件', category: 'part' },

  /**
   * 再沸器与冷凝器。列管换热器：壳程走蒸汽或冷却水，管程走三氯氢硅。
   *
   * 三氯氢硅遇水剧烈水解，所以两台的密封要求都很高 —— 管板与法兰全部 PTFE 垫。
   */
  { id: 'plant/distillation-tower/heat-exchanger', name: 'Rectification Column Reboiler and Condenser', name_zh: '精馏塔再沸器与冷凝器', unit: '件', category: 'part' },

  /** 还原钟罩。水冷不锈钢双层筒，顶部开观察孔与出气口，底部与底盘密封。 */
  { id: 'plant/siemens-reactor/bell', name: 'Siemens Reactor Reduction Bell Jar', name_zh: '西门子反应器还原钟罩', unit: '件', category: 'part' },

  /**
   * 底盘与电极。不锈钢底盘 + 石墨电极 + 绝缘瓷套 + 进出气管。
   *
   * 电极要穿过底盘而**不漏气**：靠瓷套与 PTFE 垫压紧 —— 与电解槽的密封同一套做法。
   */
  { id: 'plant/siemens-reactor/base', name: 'Siemens Reactor Base Plate and Electrodes', name_zh: '西门子反应器底盘与电极', unit: '件', category: 'part' },
];

export const POLY_PLANT_ROUTES: readonly Route[] = [
  {
    /** 塔体与塔盘。不锈钢板卷焊成节 → 冲孔塔盘 → 法兰配作 → 内件试装。 */
    id: 'make/distillation-shell',
    name: 'Rectification Column Body and Trays Manufacturing', name_zh: '精馏塔体与塔盘制造',
    produces: [{ item: 'plant/distillation-tower/shell', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 再沸器与冷凝器。列管束胀接进管板 → 壳体焊 → 试压 → PTFE 垫装配。 */
    id: 'make/distillation-heat-exchanger',
    name: 'Rectification Column Reboiler and Condenser Manufacturing', name_zh: '精馏塔再沸器与冷凝器制造',
    produces: [{ item: 'plant/distillation-tower/heat-exchanger', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 还原钟罩。不锈钢双层筒卷焊 → 水冷夹套 → 观察孔 → 与底盘配作密封面。 */
    id: 'make/siemens-bell',
    name: 'Siemens Reactor Reduction Bell Jar Manufacturing', name_zh: '西门子反应器还原钟罩制造',
    produces: [{ item: 'plant/siemens-reactor/bell', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 底盘与电极。不锈钢盘车配 → 石墨电极（碳电极那一套）→ 瓷套绝缘 → 试压检漏。 */
    id: 'make/siemens-base',
    name: 'Siemens Reactor Base Plate and Electrodes Manufacturing', name_zh: '西门子反应器底盘与电极制造',
    produces: [{ item: 'plant/siemens-reactor/base', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1) }] },
      // ⚠️ **2 与 6 对不上**：钟罩那条路线装的是三对 U 形硅芯 = 6 个电极孔
      // （见 unblock-siemens-base.ts 的孔数推导），而这里写 q(2)。
      // 两个数都没改 —— 改 q(6) 会让这条路线立刻更卡（std 件本来就不可达），
      // 而真正要修的是"到底几对硅芯"这个设计参数，那是另一件事。把矛盾记在这里。
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/milling-machine',
  },
];

/**
 * 精馏塔。40–80 °C 的塔釜温度，塔顶 32 °C 出料 —— **但那是在 300 kPa 以上**。
 *
 * ⚠️ 火星环境 0.6 kPa 下 SiHCl₃ 的沸点降到约 −65 °C，塔顶凝不出来。
 * 所以这台塔必须是压力容器：`holds` 里那一段压力不是选择，是它成立的前提。
 * 塔顶温度仍由回流比定，所以温度只写塔釜那一段。
 */
export const DISTILLATION_TOWER: Item = {
  id: 'plant/distillation-tower',
  name: 'Rectification Column', name_zh: '精馏塔',
  unit: '台',
  category: 'machine',
  holds: [
    { param: 'temperature', min: 40, max: 80 },
    { param: 'pressure', min: 300, max: 1000 },
  ],
  composedOf: [
    { item: 'plant/distillation-tower/shell', qty: q(1) },
    { item: 'plant/distillation-tower/heat-exchanger', qty: q(1) },
    { item: 'std/motor-7.5kw-4p', qty: q(1) },
    { item: 'std/contactor-general', qty: q(1) },
  ],
};

/**
 * 还原钟罩。1050–1150 °C 的硅芯温度。
 *
 * 它不装热电偶（T 型读不了这个温区）：硅芯的温度靠**看颜色**（900 橙、1100 黄白）
 * 与**看功率**（硅芯电阻随温度降，恒流升压到设定值就是到温）。
 */
export const SIEMENS_REACTOR: Item = {
  id: 'plant/siemens-reactor',
  name: 'Siemens Reactor', name_zh: '西门子反应器',
  unit: '台',
  category: 'machine',
  holds: [{ param: 'temperature', min: 1050, max: 1150 }],
  composedOf: [
    { item: 'plant/siemens-reactor/bell', qty: q(1) },
    { item: 'plant/siemens-reactor/base', qty: q(1) },
    { item: 'std/contactor-general', qty: q(1) },
  ],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...POLY_PLANT_PARTS, DISTILLATION_TOWER, SIEMENS_REACTOR];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/distillation-tower',
    name: 'Rectification Column Assembly', name_zh: '精馏塔装配',
    produces: [{
      item: 'plant/distillation-tower',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/siemens-reactor',
    name: 'Siemens Reactor Assembly', name_zh: '西门子反应器装配',
    produces: [{
      item: 'plant/siemens-reactor',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...POLY_PLANT_ROUTES, ...ASSEMBLY_ROUTES];
