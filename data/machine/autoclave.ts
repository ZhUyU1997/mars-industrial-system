/**
 * 高压釜 —— 全厂第一台"压力比温度更要紧"的设备。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么现在才写它
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 前面十一轮里，凡是"要压力"的反应都塞进了 Bosch 反应器 —— 一台镍床承压壳，
 * 同时干着制碳、甲烷化、氯化、甲醇、甲醛、乙炔环化、苯氯化、氯苯水解、
 * 硫还原、乙醛加氢。那不是在用一台通用设备，是在**把缺口折叠起来藏住**。
 *
 * 三处一直借壳：
 *
 *   苯酚水解   30 MPa、350 °C（Dow 法）
 *   哈伯法     15–30 MPa、450 °C（合成氨）
 *   拜耳法     5–30 MPa、250 °C（如果哪天从酸法改回去）
 *
 * 三处的压力都比温度更苛刻：**300 °C 的钢到处都是，30 MPa 的钢要厚壁锻件。**
 * 所以这一台的门槛不在炉子，在壳体与密封。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 第一次用"压力"这个条件
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 模型的 `Condition` 是参数无关的：`{ param, min, max }`，参数名只是字符串。
 * 前面几十条路线全用 `temperature`，这一次第一次写 `pressure`：
 *
 *   holds: [{ param: 'temperature', min: 150, max: 550 },
 *           { param: 'pressure', min: 10000, max: 35000 }]
 *
 * 一条路线可以同时要两个条件，两个都得由同一台设备覆盖。这是模型第一次
 * 真的被"多条件"用上 —— 之前它是有能力、没数据（没有数据支撑的机制不算数
 * 那种"纸面能力"）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 一处全表都缺的东西：锻件
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 30 MPa 的筒体不能用钢板卷 —— 要用**厚壁锻件**掏出来。而全表没有任何
 * 一台锻造设备：40Cr 主轴、轧辊、颚板、刀架都写着"锻件"，可"谁来锻"
 * 一次都没写。水压机/锻锤不在八大类器具里，数据里也没有。
 *
 * 所以这一台的壳体路线只能写"由 40Cr 锻件加工"，而那个"锻"字背后是
 * 一个空的环节 —— 记在这里，不假装它存在。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const AUTOCLAVE_PARTS: readonly Item[] = [
  /**
   * 筒体与封头。厚壁 40Cr 锻件掏空，两端法兰加厚。
   *
   * 30 MPa 下 DN800 的筒体壁厚约 60–80 mm（估）。这么厚的钢不能卷，
   * 只能锻 —— 而锻造设备本表没有（见文件头）。
   */
  { id: 'plant/autoclave/shell', name: '高压釜筒体与封头', unit: '件', category: 'part' },

  /**
   * 密封。金属缠绕垫：不锈钢带 + 石墨填料，靠螺栓预紧压紧。
   *
   * PTFE 垫在 350 °C 会软化流走，所以高温高压只能用金属垫 ——
   * 这是"PTFE 万能"这条经验第一次失效。
   */
  { id: 'plant/autoclave/seal', name: '高压釜密封', unit: '件', category: 'part' },

  /** 搅拌。轴穿过封头，用磁力耦合或机械密封 —— 转轴穿过压力边界，是第二个漏点。 */
  { id: 'plant/autoclave/agitator', name: '高压釜搅拌', unit: '件', category: 'part' },

  /** 夹套与内盘管。350 °C 的加热介质在夹套里走，与 30 MPa 的釜内隔一层钢。 */
  { id: 'plant/autoclave/heater', name: '高压釜夹套与内盘管', unit: '件', category: 'part' },

  /** 高压阀与安全阀。安全阀是最后一道：超压时它先开，不靠人。 */
  { id: 'plant/autoclave/valves', name: '高压釜高压阀与安全阀', unit: '件', category: 'part' },

  /**
   * 观察窗。厚玻璃圆片夹在金属法兰里，两面用 PTFE 垫 —— 是全表**唯一**
   * 一件用玻璃的东西。
   *
   * 高压容器的窗口要三层：玻璃承压、金属圈承螺栓、垫片密封。
   * 玻璃不能直接对螺栓 —— 应力集中会把它压碎。
   */
  { id: 'plant/autoclave/sight-glass', name: '高压釜观察窗', unit: '件', category: 'part' },
];

export const AUTOCLAVE_ROUTES: readonly Route[] = [
  {
    /** 筒体。40Cr 锻件 → 粗车 → 探伤 → 精镗内孔 → 车法兰密封面。 */
    id: 'make/autoclave-shell',
    name: '高压釜筒体与封头制造',
    produces: [{ item: 'plant/autoclave/shell', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] }],
    needs: ['plant/milling-machine', 'plant/grinder', 'plant/forge'],
    performedBy: 'lathe',
  },
  {
    /** 金属缠绕垫。不锈钢带压成 V 形，夹石墨填料，绕成环。 */
    id: 'make/autoclave-seal',
    name: '高压釜密封制造',
    produces: [{ item: 'plant/autoclave/seal', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 搅拌。40Cr 轴车磨 + 桨叶铣 + 磁力耦合器装配。 */
    id: 'make/autoclave-agitator',
    name: '高压釜搅拌制造',
    produces: [{ item: 'plant/autoclave/agitator', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] }],
    needs: ['plant/milling-machine', 'plant/grinder'],
    performedBy: 'lathe',
  },
  {
    /** 加热夹套。不锈钢板卷焊 + 盘管弯制，与筒体焊接后试压。 */
    id: 'make/autoclave-heater',
    name: '高压釜夹套与内盘管制造',
    produces: [{ item: 'plant/autoclave/heater', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] }],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /**
     * 观察窗。厚玻璃 + 不锈钢压环 + PTFE 垫，三件夹成一件。
     *
     * 玻璃从 make/glass 来（硅石 + 纯碱 + 石灰，三条链凑齐才出得来），
     * 而它在这里的用途很朴素：**看进去**。高压釜里反应到什么程度、
     * 有没有分层、液位在哪，都要眼睛。
     */
    id: 'make/autoclave-sight-glass',
    name: '高压釜观察窗制造',
    produces: [{ item: 'plant/autoclave/sight-glass', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 高压阀。不锈钢阀体锻件车成，阀芯与阀座对研磨；安全阀要单独标定。 */
    id: 'make/autoclave-valves',
    name: '高压釜高压阀与安全阀制造',
    produces: [{ item: 'plant/autoclave/valves', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/grinder', 'plant/forge'],
    performedBy: 'plant/milling-machine',
  },
];

/**
 * 高压釜。带搅拌与夹套的厚壁压力容器，10–35 MPa、150–550 °C。
 *
 * 它补上的是三处一直借 Bosch 壳的反应（苯酚水解、哈伯法、以及以后可能的
 * 拜耳法）。**苯酚水解与哈伯法从 Bosch 的壳里搬了出来** —— 这才是它该有的样子：
 * 哪一类反应多起来，就该有自己的一台设备。
 */
export const AUTOCLAVE: Item = {
  id: 'plant/autoclave',
  name: '高压釜',
  unit: '台',
  category: 'machine',
  holds: [
    { param: 'temperature', min: 150, max: 550 },
    { param: 'pressure', min: 10000, max: 35000 },
  ],
  composedOf: [...AUTOCLAVE_PARTS.map((p) => ({ item: p.id, qty: q(1) })), { item: 'std/motor-7.5kw-4p', qty: q(1) }],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...AUTOCLAVE_PARTS, AUTOCLAVE];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/autoclave',
    name: '高压釜装配',
    produces: [{
      item: 'plant/autoclave',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...AUTOCLAVE_ROUTES, ...ASSEMBLY_ROUTES];
