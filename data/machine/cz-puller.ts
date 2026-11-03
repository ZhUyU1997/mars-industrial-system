/**
 * 直拉单晶炉 —— 第 5 门的那台机器。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它做的事：把多晶硅熔成一锅，再慢慢提一根出来
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   熔料   石墨加热器把多晶硅熔在石英坩埚里（1420 °C）
 *   引晶   籽晶接触液面，微微熔接，然后边转边往上提
 *   缩颈   先拉细一段（φ3–5 mm），把位错"长"出去
 *   等径   调拉速与温度，保持直径；同时坩埚上升、晶体旋转
 *   收尾   逐渐加快拉速收成锥，停热、冷却、取棒
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它要的三件"慢而稳"，本层怎么给
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   提拉   蜗轮减速 + 丝杠：每转 0.1 mm，电机一分钟一转 = 0.1 mm/min
 *   旋转   两套独立转速：坩埚慢转（5–10 rpm）、晶体反向转（10–20 rpm）——
 *          反向转是为了把温度场的四个"热对称面"抹匀，半导体级要靠它
 *   温度   石墨加热器的功率靠抽头与调压 —— 没有闭环，靠人看火色拧
 *
 * **"慢"在这个模型里表示不出来**（没有时间维），但机构本身表示得出来：
 * 蜗轮与丝杠是现成的零件，两个转速独立的传动是两根轴。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 一处降级：直径靠人看
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 工业炉用称重或激光测径做闭环。本层没有能装进回路的测径手段（光学高温计
 * 只是看颜色），所以直径靠"看火色 + 看光圈"手调 —— **拉出来的棒是锥形波动的**，
 * 滚磨外圆要磨掉很多。这也是收得率 85% 的主要来源。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CZ_PULLER_PARTS: readonly Item[] = [
  /** 炉体。双层水冷不锈钢腔，上法兰装提拉头，下法兰装坩埚升降，侧开观察窗。 */
  { id: 'plant/cz-puller/chamber', name: 'Czochralski Single-Crystal Furnace Body', name_zh: '直拉单晶炉炉体', unit: '件', category: 'part' },

  /**
   * 坩埚托与升降旋转机构。石墨托（承石英坩埚）+ 丝杠升降 + 独立旋转轴。
   *
   * 石墨托要托住 400 kg 级的一锅熔体，还要在 1450 °C 不软化 —— 只有石墨。
   */
  { id: 'plant/cz-puller/crucible-drive', name: 'Crucible Support and Lift-Rotation Mechanism', name_zh: '坩埚托与升降旋转机构', unit: '件', category: 'part' },

  /**
   * 提拉头。籽晶夹头 + 称重的弹性梁 + 丝杠 + 蜗轮减速 + 反向旋转轴。
   *
   * 它是这台机器最精的一件：拉速要稳到 ±5%，而整根棒要十几小时。
   * 蜗轮减速与丝杠都在本层的现成工艺里（滚齿、磨丝杠）。
   */
  { id: 'plant/cz-puller/pull-head', name: 'Czochralski Single-Crystal Furnace Pull Head', name_zh: '直拉单晶炉提拉头', unit: '件', category: 'part' },

  /**
   * 石墨加热器与保温。圆筒开槽的石墨发热体（电流穿过筒壁），外面包碳毡。
   *
   * 它要几百千瓦，靠石墨电极引入 —— 与矿热炉同一套电极（`std/carbon-electrode-300`）。
   */
  { id: 'plant/cz-puller/heater', name: 'Czochralski Single-Crystal Furnace Graphite Heater and Insulation', name_zh: '直拉单晶炉石墨加热器与保温', unit: '件', category: 'part' },

  /**
   * 光电测径头。**闭环的那只眼睛。**
   *
   * 早先写的是"直径靠人看火色手调，棒是锥形波动的" —— 那句话现在可以撤了。
   *
   * 原理：熔体与晶体交界处有一圈**亮的弯月面环**，环的直径就是晶体的直径。
   * 用透镜把这圈环成像在狭缝上，再用**振镜扫描**（那只镜式检流计）
   * 让像划过光电池，两次"亮-暗"之间的时间就是环的宽度 —— 也就是直径。
   *
   * 为什么不用摄像头：没有荧光粉、没有感光胶片、也没有阵列器件。
   * 单点光电池 + 机械扫描是这一层唯一能做出的"成像"。
   */
  { id: 'plant/cz-puller/diameter-sensor', name: 'Czochralski Single-Crystal Furnace Optical Diameter Measuring Head', name_zh: '直拉单晶炉光电测径头', unit: '件', category: 'part' },
];

export const CZ_PULLER_ROUTES: readonly Route[] = [
  {
    /**
     * 光电测径头：透镜 + 狭缝 + 振镜 + 光电池 + 前置放大。
     *
     *   透镜（玻璃研磨）+ 振镜 1 + 光电池 1 + 运放 1 + 表壳
     *
     * 装法很讲究：镜头要能看见弯月面，而炉膛里 1450 °C —— 所以它透过**石英观察窗**
     * 看，窗口本身也在发红，要靠一片滤光片把炉膛的辐射挡掉，只留弯月面的亮环。
     */
    id: 'make/cz-diameter-sensor',
    name: 'Czochralski Single-Crystal Furnace Optical Diameter Measuring Head Manufacturing', name_zh: '直拉单晶炉光电测径头制造',
    produces: [{ item: 'plant/cz-puller/diameter-sensor', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'std/mirror-galvanometer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/photodiode-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '透镜研磨与滤光片（挡住炉膛辐射）', performedBy: 'plant/robot' },
      { note_zh: '振镜与狭缝装配（扫描幅度 30 mm）', performedBy: 'plant/robot' },
      { note_zh: '光电池与前置放大（把扫描信号变成直径电压）', performedBy: 'plant/robot' },
      { note_zh: '标定（用已知直径的样板对刻度）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },
  {
    /** 炉体。双层筒卷焊 → 水冷夹套 → 上下法兰配作 → 观察窗。 */
    id: 'make/cz-chamber',
    name: 'Czochralski Single-Crystal Furnace Body Manufacturing', name_zh: '直拉单晶炉炉体制造',
    produces: [{ item: 'plant/cz-puller/chamber', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 坩埚托与升降旋转。石墨托车成 → 丝杠磨 → 两套轴承座 → 与炉体配作。 */
    id: 'make/cz-crucible-drive',
    name: 'Crucible Support and Lift-Rotation Mechanism Manufacturing', name_zh: '坩埚托与升降旋转机构制造',
    produces: [{ item: 'plant/cz-puller/crucible-drive', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/carbon', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'std/bearing-general-p0', qty: q(2) }] },
    ],
    needs: ['plant/grinder'],
    performedBy: 'lathe',
  },
  {
    /** 提拉头。蜗轮副滚齿 → 丝杠磨 → 夹头与弹性梁配作 → 反向旋转轴装配。 */
    id: 'make/cz-pull-head',
    name: 'Czochralski Single-Crystal Furnace Pull Head Manufacturing', name_zh: '直拉单晶炉提拉头制造',
    produces: [{ item: 'plant/cz-puller/pull-head', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'std/bearing-spindle-p5', qty: q(2) }] },
    ],
    needs: ['plant/grinder'],
    steps: [
      { note_zh: '蜗轮副滚齿与丝杠车磨', performedBy: 'plant/gear-hobbing' },
      { note_zh: '夹头与弹性梁', performedBy: 'lathe' },
      { note_zh: '装配与空载试转（测 0.1 mm/min 的均匀性）', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 石墨加热器。石墨筒开槽 → 电极接口 → 碳毡保温层 → 与炉体绝缘装配。 */
    id: 'make/cz-heater',
    name: 'Czochralski Single-Crystal Furnace Graphite Heater and Insulation Manufacturing', name_zh: '直拉单晶炉石墨加热器与保温制造',
    produces: [{ item: 'plant/cz-puller/heater', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/carbon', qty: q(1) }] },
      { anyOf: [{ item: 'std/carbon-electrode-300', qty: q(2) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(2) }] },
    ],
    needs: [],
    performedBy: 'plant/milling-machine',
  },
];

/**
 * 直拉单晶炉。1410–1480 °C，硅的熔点上下。
 *
 * `holds` 覆盖熔化与生长两个温区：熔料 1420–1480，等径 1410–1450。
 * 不装热电偶（T 型读不了），控温靠火色与功率档 —— 见文件头。
 */
export const CZ_PULLER: Item = {
  id: 'plant/cz-puller',
  name: 'Czochralski Single-Crystal Furnace', name_zh: '直拉单晶炉',
  unit: '台',
  category: 'machine',
  holds: [{ param: 'temperature', min: 1410, max: 1480 }],
  // 石英坩埚：一根晶棒拉 50–80 h，坩埚一次一换 → 取 60 h。
  // 这是 mat/quartz-crucible 的第一个真实消耗点（此前它只被一条路线当原料吃）。
  consumption: [{ item: 'mat/quartz-crucible', qty: q(1), per: q(60) }],
  composedOf: [
    ...CZ_PULLER_PARTS.map((p) => ({ item: p.id, qty: q(1) })),
    { item: 'std/motor-7.5kw-4p', qty: q(2) },
    { item: 'std/contactor-general', qty: q(2) },
    // 直径闭环：测径头 + 温控器 —— 拉速与温度连起来。
// ⚠️ **但人得一直盯着**（由测径那条改正）：本层没有探测器（光电池要半导体、
// 热电堆要 20–40 对 0.02 mm 异种丝 + 显微焊、µV 表要永磁铁），所以判读只能是人眼 + 千分螺丝。
// 链的带宽 3.5 h、人的反应 0.3–0.5 s —— 差 3×10⁴ 倍，所以瓶颈从来不是"快"，是"看得见"。
// 一句账：判读 20–40 s/次 × 每 15 min = 268 次/根、6700 次/年。
    { item: 'std/temp-controller-general', qty: q(1) },
  ],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CZ_PULLER_PARTS, CZ_PULLER];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/cz-puller',
    name: 'Czochralski Single-Crystal Furnace Assembly', name_zh: '直拉单晶炉装配',
    produces: [{
      item: 'plant/cz-puller',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...CZ_PULLER_ROUTES, ...ASSEMBLY_ROUTES];
