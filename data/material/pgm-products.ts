/**
 * 铂族丝材与箔材 —— 把 `mat/platinum` / `mat/palladium` 的海绵料变成
 * 丝、箔、Pt-Rh 网。**这是"料已通、器件未通"的第一件。**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 0. 为什么是这一条链（grep 结论）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `mat/platinum`、`mat/palladium` 已有本地路线（`data/material/pgm.ts`：
 *   阳极泥 → 铂族精矿 → 氯化浸出 → 海绵 Pt/Pd 99.9–99.99 %）。
 *   但全表**没有** `mat/platinum-wire`、`mat/platinum-foil`、`mat/palladium-wire`、
 *   `mat/palladium-foil`、`mat/pt-rh-gauze` —— 所以下游的 Pt RTD、多孔铂电极、
 *   钯膜、Pt-Rh 氨氧化网全部停在"没有丝/箔"上。
 *
 *   本文件只做**成形**：拉丝、轧箔、编织、Pt-Rh 合金熔炼。它不重做海绵料，
 *   也不重做下游器件（器件路线在 `data/machine/pgm-devices.ts`）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 1. 丝材：从 φ8 棒到 φ0.025–1 mm（设计值，Earth 工程值）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   起始棒 φ8 mm（海绵 Pt 熔铸），减面率 **15 %/道次**（任务给的 10–20 % 取中值），
 *   道次数 n = ln((8/d)²) / ln(1/0.85)：
 *
 *     d = 1.0 mm    n = 26 道，中间退火 6 次（每 4 道一次）
 *     d = 0.1 mm    n = 54 道，中间退火 13 次
 *     d = 0.05 mm   n = 63 道，中间退火 16 次
 *     d = 0.025 mm  n = 71 道，中间退火 18 次
 *
 *   Pt 的冷加工极限约 60–80 % 总减面率；按 15 %/道、4 道一退，总减面率
 *   1 − 0.85⁴ = 47.8 %，留 12–32 % 余量。退火 700–900 °C、氢/真空 1 h。
 *   Pd 更软，取 **20 %/道次**：
 *
 *     d = 0.1 mm    n = 40 道，中间退火 10 次（Pd 600–800 °C）
 *     d = 0.05 mm   n = 49 道，中间退火 12 次
 *
 *   参考：任务给的"10–20 %/道次"；本文件对 Pt 取 15 %、Pd 取 20 %，两者都在窗口内。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 2. 金刚石模损耗（设计值，Earth 工程值）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   金刚石模寿命 **0.5–2 万米/只**，取 1 万米/只（中值）。丝长按质量算：
 *
 *     d = 1.0 mm    16.85 g/m   ⇒ 1 kg = 59 m      ⇒ 0.006 只/kg
 *     d = 0.1 mm    0.1685 g/m  ⇒ 1 kg = 5 935 m   ⇒ 0.59 只/kg
 *     d = 0.05 mm   0.0421 g/m  ⇒ 1 kg = 23 750 m  ⇒ 2.4 只/kg
 *     d = 0.025 mm  0.01053 g/m ⇒ 1 kg = 95 000 m  ⇒ 9.5 只/kg
 *
 *   一只模按 0.05 g 金刚石计，所以每 kg 丝耗 `mat/diamond`：
 *     1.0 mm 3×10⁻⁷ kg、0.1 mm 3×10⁻⁵ kg、0.05 mm 1.2×10⁻⁴ kg、0.025 mm 4.75×10⁻⁴ kg。
 *   模孔 0.02–2 mm，模套用 `mat/tungsten-carbide` 20 kg/台（见拉丝机零件）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 3. 箔材：从 2 mm 板到 0.01–0.5 mm（设计值）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   轧机 φ100–200、辊缝 0.01–1 mm，减面率 15 %/道次（箔材按厚度比）：
 *
 *     t = 0.5 mm    n = 9 道，退火 2 次
 *     t = 0.05 mm   n = 23 道，退火 5 次
 *     t = 0.01 mm   n = 33 道，退火 7 次
 *
 *   中间退火 Pt 700–900 °C、Pd 600–800 °C，氢/真空；终轧后用金刚石微粉
 *   （`mat/diamond-powder`）抛到 Ra ≤0.2 µm。厚差 ±5 % 靠辊缝 + 终轧
 *   测厚（本层只有千分尺，没有在线测厚仪；±5 % 是工艺保证，不是闭环）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 4. Pt-Rh 合金与 80 目网（设计值，Earth 工程值）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   Pt-10Rh / Pt-5Rh 在 **感应炉 1800–1900 °C** 熔炼：Pt 熔点 1768 °C，
 *   Rh 熔点 1964 °C；10 % Rh 的液相线约 1850 °C，取 1800–1900 有 50–100 K
 *   过热度。石墨坩埚、氩保护、电磁搅拌 10–20 min；铸成 φ8 棒。
 *   **均匀性 ±0.2 %** 是设计值：本层没有 Rh 的化验（火试金/ICP-MS 标液 0 条），
 *   只能靠"同一炉、同一根棒"与密度/电阻间接判；没有 EDS/电子探针。
 *
 *   丝径 0.06–0.1 mm（网用 0.08 mm 基准），80 目编织：
 *   0.08 mm 丝、80 目 ⇒ 网孔 0.3175 − 0.08 = 0.2375 mm（80 目 = 0.3175 mm 节距）。
 *   拉丝从 φ8 到 φ0.08：n = ln((8/0.08)²)/ln(1/0.85) = 57 道，退火 14 次。
 *
 *   ⚠️ **Rh 曾按一次性输入记**：此前 `mat/rhodium` 没有产出路线；
 *   PGM 精矿里 Rh 占 PGM 的 2.5 %（1000 kg 精矿含 12 kg Rh），当时氯化浸出
 *   把 Rh 留在浸出渣（`mat/tailings`）。现在 `data/material/rhodium.ts` 已建
 *   六步碱熔湿法，Rh 回到本地链；Pt-Rh 网也回到严格闭包。历史说明保留，
 *   是因为"当时确实没有路线"，不是"现在也没有"。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 5. 已知缺口（R7：按量级记，不作终止条件）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **Rh 路线有产出**：`rhodium.ts` 的六步碱熔湿法吃精矿，
 *      12 kg Rh/1000 kg 精矿 → 10 kg Rh（83.3 %）。仍缺的是：Pt/Pd 氯化渣
 *      里的 Rh 没有单独回收（Rh 路线吃精矿，与 Pt/Pd 并联），以及 Ir 分离。
 *   ② **没有拉伸试验机**：丝的抗拉 150–300 MPa、延伸 ≥20 % 是工艺保证，
 *      不是实测；本层只有千分尺与四线电阻。
 *   ③ **没有在线测厚**：箔的 ±5 % 厚差靠终轧后千分尺抽检，不是闭环。
 *   ④ **没有 Rh 均匀性量具**：±0.2 % 是配料与熔炼保证，不是 EDS/电子探针读数。
 *   ⑤ **没有单晶金刚石模坯**：本层只有 `mat/diamond`（50–1000 µm 多晶磨料）
 *      与 PCD 坯片；模孔用 PCD 激光/超声加工，寿命按 0.5–2 万米/只的下限取。
 *   ⑥ **Pt 黑镀层仍未建**：多孔铂电极走"海绵 Pt 球磨 + 烧结"，不是
 *      氯铂酸镀铂黑；后者要 `mat/chloroplatinic-acid`，本层没有。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、材料条目
//
// 六个：Pt 丝/箔、Pd 丝/箔、Pt-Rh 网、Rh（本地可造）。
// ═══════════════════════════════════════════════════════════════════════════

export const PGM_PRODUCT_ITEMS: readonly Item[] = [
  /**
   * 铂丝。**φ0.025–1 mm；99.9–99.99 %；抗拉 150–300 MPa；延伸 ≥20 %。**
   *
   * 三个规格段各一条路线（粗 0.8–1.0、通用 0.05–0.12、细 0.025–0.05），
   * 因为道次与退火次数差一个数量级：φ1 是 26 道/6 退，φ0.025 是 71 道/18 退。
   * 把三段塞进一条路线会让"每 kg 多少道次"失去意义。
   */
  {
    id: 'mat/platinum-wire',
    name: 'Platinum Wire', name_zh: '铂丝',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'diameter', kind: 'range', min: 0.025, max: 1, unit: 'mm' },
      { param: 'purity', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
      { param: 'tensile', kind: 'range', min: 150, max: 300, unit: 'MPa' },
      { param: 'elongation', kind: 'range', min: 20, max: 40, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * 铂箔。**0.01–0.5 mm；厚差 ±5 %；Ra ≤0.2 µm；99.9–99.99 %。**
   *
   * 厚差与 Ra 是终轧 + 金刚石微粉抛光的工艺保证；本层没有在线测厚仪，
   * 只有千分尺抽检（缺口③）。
   */
  {
    id: 'mat/platinum-foil',
    name: 'Platinum Foil', name_zh: '铂箔',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'thickness', kind: 'range', min: 0.01, max: 0.5, unit: 'mm' },
      { param: 'thicknessTolerance', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
      { param: 'ra', kind: 'range', min: 0, max: 0.2, unit: 'µm', dir: 'atMost' },
      { param: 'purity', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * 钯丝。**φ0.05–1 mm；99.9–99.99 %。**
   *
   * Pd 比 Pt 软，减面率取 20 %/道次；φ0.1 是 40 道/10 退。
   */
  {
    id: 'mat/palladium-wire',
    name: 'Palladium Wire', name_zh: '钯丝',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'diameter', kind: 'range', min: 0.05, max: 1, unit: 'mm' },
      { param: 'purity', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * 钯箔。**0.02–0.5 mm；厚差 ±5 %；99.9–99.99 %。**
   *
   * 钯膜要 5–25 µm（0.005–0.025 mm）的自支撑箔；本文件最薄只到 0.02 mm
   * （20 µm），所以 5–19 µm 那一段仍缺（见 `make/pd-membrane` 的注释）。
   */
  {
    id: 'mat/palladium-foil',
    name: 'Palladium Foil', name_zh: '钯箔',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'thickness', kind: 'range', min: 0.02, max: 0.5, unit: 'mm' },
      { param: 'thicknessTolerance', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
      { param: 'purity', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * Pt-Rh 氨氧化网。**Pt-10Rh / Pt-5Rh；丝 φ0.06–0.1 mm；80 目。**
   *
   * 用于氨氧化制硝酸的催化网（奥斯特瓦尔德法）。Pt-10Rh 是标准配方，
   * Pt-5Rh 是低铑版；当时没有 Rh 精炼、Rh 曾是一次性输入（见 §4、缺口①）；
   * 现在 Rh 本地可造（`rhodium.ts`），网回到严格闭包。
   */
  {
    id: 'mat/pt-rh-gauze',
    name: 'Pt-Rh Ammonia Oxidation Gauze', name_zh: 'Pt-Rh 氨氧化网',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'alloy', kind: 'enum', values: ['Pt-10Rh', 'Pt-5Rh'] },
      { param: 'wireDiameter', kind: 'range', min: 0.06, max: 0.1, unit: 'mm' },
      { param: 'mesh', kind: 'range', min: 80, max: 80, unit: '目' },
      { param: 'rh', kind: 'range', min: 4.5, max: 10.5, unit: '%' },
    ],
  },

  /**
   * 铑（海绵/粉）。**99.9–99.99 %；本地可造。**
   *
   * 历史：此前按一次性输入记 —— 当时 `mat/rhodium` 没有产出路线；
   * PGM 精矿里 Rh 占 PGM 的 2.5 %（12 kg/1000 kg 精矿），氯化浸出把它留在
   * `mat/tailings`。现在 `data/material/rhodium.ts` 的六步湿法把它接回本地链：
   * 碱熔/硫酸氢钠熔融 → 水浸/酸浸 → 氯化 → 选择性沉淀 → 还原。
   * `mat/pt-rh-gauze` 的 `uses` 不变（同一个 id），不需要改路线。
   *
   * 用量：1 kg Pt-10Rh 网耗 Rh 0.105 kg；1 kg Pt-5Rh 网耗 0.0525 kg。
   */
  {
    id: 'mat/rhodium',
    name: 'Rhodium', name_zh: '铑',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
      { param: 'form', kind: 'enum', values: ['sponge', 'powder'] },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、设备：拉丝机 + 轧机 + 退火炉 + 感应炉 + 织网机 + 机架
//
// 一条线，不是一台炉：所以 unit 是"套"。`holds` 写的是**各工位的并集**
// （20–1900 °C、氧 0–50 ppm），不是单台炉子的窗口；每个工位在自己的
// 路线步骤里另有窄窗口（退火 700–900、熔炼 1800–1900）。
// ═══════════════════════════════════════════════════════════════════════════

export const PGM_WIRE_MILL_PARTS: readonly Item[] = [
  /** 拉丝机。金刚石模 0.02–2 mm，减面率 10–20 %/道次，收线 5–200 m/min。 */
  { id: 'plant/pgm-wire-mill/drawing-machine', name: 'PGM Wire Drawing Machine', name_zh: 'PGM 拉丝机', unit: '件', category: 'part' },

  /** 轧机。φ100–200 mm 辊、辊缝 0.01–1 mm、四辊/二辊，箔厚 0.01–0.5 mm。 */
  { id: 'plant/pgm-wire-mill/rolling-mill', name: 'PGM Rolling Mill', name_zh: 'PGM 轧机', unit: '件', category: 'part' },

  /** 退火炉。600–900 °C、真空/氢、±5 K；Pt 700–900、Pd 600–800。 */
  { id: 'plant/pgm-wire-mill/annealing-furnace', name: 'PGM Annealing Furnace', name_zh: 'PGM 退火炉', unit: '件', category: 'part' },

  /** 感应炉。1800–1900 °C、石墨坩埚、氩保护、电磁搅拌；Pt-Rh 合金熔炼。 */
  { id: 'plant/pgm-wire-mill/induction-furnace', name: 'PGM Induction Furnace', name_zh: 'PGM 感应炉', unit: '件', category: 'part' },

  /** 织网机。80 目、丝径 0.06–0.1 mm、幅宽 100–300 mm。 */
  { id: 'plant/pgm-wire-mill/loom', name: 'PGM Wire Loom', name_zh: 'PGM 织网机', unit: '件', category: 'part' },

  /** 机架与管路。型材焊接 + 法兰 + 气氛/冷却管路。 */
  { id: 'plant/pgm-wire-mill/frame', name: 'PGM Wire Rolling Mill Frame and Piping', name_zh: 'PGM 线材轧机机架与管路', unit: '件', category: 'part' },
];

/**
 * 铂族丝材/箔材线（`plant/pgm-wire-mill`）。**20–1900 °C、氧 0–50 ppm。**
 *
 * 六个工位：拉丝、轧箔、退火、感应熔炼、织网、机架。`holds` 的 1900 °C
 * 来自感应炉；700–900 的退火与 1800–1900 的熔炼在同一条线上，但**不是同一台炉**。
 * 这句话必须写在条目上，否则 1900 会被读成"整条线都能到 1900"。
 */
export const PGM_WIRE_MILL: Item = {
  id: 'plant/pgm-wire-mill',
  name: 'PGM Wire Rolling Mill', name_zh: 'PGM 线材轧机',
  unit: '套',
  category: 'machine',
  holds: [
    { param: 'temperature', min: 20, max: 1900 },
    { param: 'oxygen_ppm', min: 0, max: 50 },
  ],
  // 温度窗口与 holds 同一档：作为被校机器给 `measure/manganin-furnace-temperature`
  // 的 need 一个可判窗口（校准边），不是另一次测量。
  props: [{ param: 'temperature', kind: 'range', min: 20, max: 1900, unit: '°C' }],
  composedOf: [
    ...PGM_WIRE_MILL_PARTS.map((p) => ({ item: p.id, qty: q(1) })),
    { item: 'std/motor-7.5kw-4p', qty: q(1) },
    { item: 'std/contactor-general', qty: q(1) },
    { item: 'std/process-controller-general', qty: q(1) },
    { item: 'std/photoelectric-pyrometer-general', qty: q(1) },
  ],
};

/** 材料 + 零件 + 整线，父任务一行 spread 即可注册。 */
export const PGM_PRODUCT_ALL_ITEMS: readonly Item[] = [
  ...PGM_PRODUCT_ITEMS,
  ...PGM_WIRE_MILL_PARTS,
  PGM_WIRE_MILL,
];

// ═══════════════════════════════════════════════════════════════════════════
// 三、路线
// ═══════════════════════════════════════════════════════════════════════════

export const PGM_PRODUCT_ROUTES: readonly Route[] = [
  // ═══ Pt 丝：三段 ═══

  /**
   * 粗 Pt 丝：φ8 棒 → φ0.8–1.0 mm。
   *
   *   26 道次、15 %/道次；每 4 道中间退火一次 ⇒ 6 次退火（700–900 °C）。
   *   1 kg 丝耗金刚石模 0.006 只（1 万米/只；φ1 的 1 kg 只有 59 m）。
   *
   *   进 Pt 1.05 + 金刚石 3×10⁻⁷ + 氢 0.02 = 1.0700003
   *   出 丝 1.0 + 尾料 0.05 = 1.05；差 0.0200003 是氢与模具磨损。
   */
  {
    id: 'make/platinum-wire-coarse',
    name: 'Coarse Pt Wire Production', name_zh: '粗 Pt 丝制备',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'mat/platinum-wire',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 0.8, max: 1.0 },
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99, record: 'mat/pt-assay-corrected-record' },
          { param: 'tensile', kind: 'range', min: 150, max: 250 },
          { param: 'elongation', kind: 'range', min: 20, max: 30 },
        ],
      },
      { item: 'mat/tailings', qty: q(1, 20) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/platinum', qty: q(21, 20) }] },
      { anyOf: [{ item: 'mat/diamond', qty: q(3, 10000000) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 50) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '熔铸 φ8 棒：1800–1850 °C、石墨坩埚、氧 ≤50 ppm；铸棒车去缩孔（Pt 熔点 1768）',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 1800, max: 1850 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '拉丝 26 道次、15 %/道次（φ8→φ1.0）；每 4 道中间退火一次，共 6 次',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 700, max: 900 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '中间退火 700–900 °C、氢/真空 1 h；退火后酸洗/水洗（本层没有在线测径，直径靠千分尺抽检）',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 700, max: 900 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '成品检验：φ0.8–1.0 mm、抗拉 150–250 MPa、延伸 20–30 %（抗拉是设计值，没有拉伸试验机）',
        performedBy: 'plant/metrology-room',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'Pt 1.05 + 金刚石 3×10⁻⁷ + 氢 0.02 → 丝 1.0 + 尾料 0.05；差 0.0200003 是氢与模具磨损（金刚石不进入产品）',
  },

  /**
   * 通用 Pt 丝：φ8 棒 → φ0.05–0.12 mm（0.1 mm 基准）。
   *
   *   54 道次、15 %/道次；13 次中间退火。1 kg φ0.1 丝长 5 935 m，
   *   耗金刚石模 0.59 只 ⇒ 3×10⁻⁵ kg 金刚石。
   */
  {
    id: 'make/platinum-wire',
    name: 'General-Purpose Pt Wire Production', name_zh: '通用 Pt 丝制备',
    rate: { hours: q(48) },
    produces: [
      {
        item: 'mat/platinum-wire',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 0.05, max: 0.12 },
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99, record: 'mat/pt-assay-corrected-record' },
          { param: 'tensile', kind: 'range', min: 150, max: 250 },
          { param: 'elongation', kind: 'range', min: 20, max: 30 },
        ],
      },
      { item: 'mat/tailings', qty: q(1, 20) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/platinum', qty: q(21, 20) }] },
      { anyOf: [{ item: 'mat/diamond', qty: q(3, 100000) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 50) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '熔铸 φ8 棒（1800–1850 °C、氧 ≤50 ppm）；车去缩孔与表皮',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 1800, max: 1850 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '拉丝 54 道次、15 %/道次（φ8→φ0.1）；每 4 道中间退火一次，共 13 次；金刚石模 0.59 只/kg',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 700, max: 900 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '中间退火 700–900 °C、氢/真空 1 h；φ0.1 mm 的 1 kg 丝长 5 935 m',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 700, max: 900 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '成品：φ0.05–0.12 mm、抗拉 150–250 MPa、延伸 20–30 %；千分尺抽检 + 四线电阻',
        performedBy: 'plant/metrology-room',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'Pt 1.05 + 金刚石 3×10⁻⁵ + 氢 0.02 → 丝 1.0 + 尾料 0.05；差 0.02003 是氢与模具磨损',
  },

  /**
   * 细 Pt 丝：φ8 棒 → φ0.025–0.05 mm（0.025 mm 基准，RTD 用）。
   *
   *   71 道次、15 %/道次；18 次中间退火。1 kg φ0.025 丝长 95 000 m，
   *   耗金刚石模 9.5 只 ⇒ 4.75×10⁻⁴ kg 金刚石。
   */
  {
    id: 'make/platinum-wire-fine',
    name: 'Fine Pt Wire Production', name_zh: '细 Pt 丝制备',
    rate: { hours: q(72) },
    produces: [
      {
        item: 'mat/platinum-wire',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 0.025, max: 0.05 },
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99, record: 'mat/pt-assay-corrected-record' },
          { param: 'tensile', kind: 'range', min: 200, max: 300 },
          { param: 'elongation', kind: 'range', min: 20, max: 25 },
        ],
      },
      { item: 'mat/tailings', qty: q(1, 20) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/platinum', qty: q(21, 20) }] },
      { anyOf: [{ item: 'mat/diamond', qty: q(19, 40000) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 50) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '熔铸 φ8 棒（1800–1850 °C、氧 ≤50 ppm）；细丝对夹杂敏感，熔炼后要车净表皮',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 1800, max: 1850 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '拉丝 71 道次、15 %/道次（φ8→φ0.025）；每 4 道中间退火一次，共 18 次；金刚石模 9.5 只/kg',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 700, max: 900 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '中间退火 700–900 °C、氢/真空 1 h；φ0.025 mm 的 1 kg 丝长 95 000 m',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 700, max: 900 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '成品：φ0.025–0.05 mm、抗拉 200–300 MPa、延伸 20–25 %；用于 `make/pt-rtd-pair`',
        performedBy: 'plant/metrology-room',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'Pt 1.05 + 金刚石 4.75×10⁻⁴ + 氢 0.02 → 丝 1.0 + 尾料 0.05；差 0.020475 是氢与模具磨损',
  },

  /**
   * Pt 箔：2 mm 板 → 0.01–0.5 mm（0.05 mm 基准）。
   *
   *   23 道次、15 %/道次；5 次中间退火；终轧后用 `mat/diamond-powder` 抛到 Ra ≤0.2 µm。
   *   1 kg 0.05 mm 箔面积 = 1 / (0.05e-3 × 21.45e3) = 0.932 m²。
   */
  {
    id: 'make/platinum-foil',
    name: 'Pt Foil Production', name_zh: 'Pt 箔制备',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'mat/platinum-foil',
        qty: q(1),
        gives: [
          { param: 'thickness', kind: 'range', min: 0.01, max: 0.5 },
          { param: 'thicknessTolerance', kind: 'range', min: 2, max: 5 },
          { param: 'ra', kind: 'range', min: 0.05, max: 0.2 },
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99, record: 'mat/pt-assay-corrected-record' },
        ],
      },
      { item: 'mat/tailings', qty: q(1, 20) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/platinum', qty: q(21, 20) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 50) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '熔铸 2 mm 板坯（1800–1850 °C、氧 ≤50 ppm）；铣面去氧化皮',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 1800, max: 1850 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '轧制 23 道次、15 %/道次（2→0.05 mm）；每 5 道中间退火一次，共 5 次',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 700, max: 900 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '中间退火 700–900 °C、氢/真空 1 h；终轧后金刚石微粉抛光到 Ra ≤0.2 µm',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 700, max: 900 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '成品：0.01–0.5 mm、厚差 ±5 %、Ra ≤0.2 µm；千分尺抽检（没有在线测厚仪）',
        performedBy: 'plant/metrology-room',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'Pt 1.05 + 氢 0.02 → 箔 1.0 + 尾料 0.05；差 0.02 是氢与轧制/抛光损耗',
  },

  /**
   * Pd 丝：φ8 棒 → φ0.05–1 mm（0.1 mm 基准）。
   *
   *   Pd 更软，减面率 20 %/道次：φ0.1 是 40 道、10 次退火（600–800 °C）。
   *   1 kg φ0.1 Pd 丝长 = 1 / (7.854e-3 mm² × 0.01202 g/mm³) = 10 600 m；
   *   金刚石模 1.06 只/kg ⇒ 5.3×10⁻⁵ kg。
   */
  {
    id: 'make/palladium-wire',
    name: 'Pd Wire Production', name_zh: 'Pd 丝制备',
    rate: { hours: q(32) },
    produces: [
      {
        item: 'mat/palladium-wire',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 0.05, max: 0.15 },
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99 },
        ],
      },
      { item: 'mat/tailings', qty: q(1, 20) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/palladium', qty: q(21, 20) }] },
      { anyOf: [{ item: 'mat/diamond', qty: q(53, 1000000) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 50) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '熔铸 φ8 棒（1600–1650 °C、氧 ≤50 ppm；Pd 熔点 1555 °C）；车去缩孔',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 1600, max: 1650 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '拉丝 40 道次、20 %/道次（φ8→φ0.1）；每 4 道中间退火一次，共 10 次；金刚石模 1.06 只/kg',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 600, max: 800 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '中间退火 600–800 °C、氢/真空 1 h；Pd 在 300 °C 以上吸氢变脆，退火后要真空冷却',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 600, max: 800 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '成品：φ0.05–0.15 mm、纯度 99.9–99.99 %；千分尺抽检 + 四线电阻',
        performedBy: 'plant/metrology-room',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'Pd 1.05 + 金刚石 5.3×10⁻⁵ + 氢 0.02 → 丝 1.0 + 尾料 0.05；差 0.020053 是氢与模具磨损',
  },

  /**
   * Pd 箔：2 mm 板 → 0.02–0.5 mm（0.05 mm 基准）。
   *
   *   17 道次、20 %/道次；4 次中间退火。0.02 mm 是 20 µm —— 钯膜要 5–25 µm，
   *   所以 20 µm 落在上限，5–19 µm 仍缺（缺口④/`make/pd-membrane` 注释）。
   */
  {
    id: 'make/palladium-foil',
    name: 'Pd Foil Production', name_zh: 'Pd 箔制备',
    rate: { hours: q(20) },
    produces: [
      {
        item: 'mat/palladium-foil',
        qty: q(1),
        gives: [
          { param: 'thickness', kind: 'range', min: 0.02, max: 0.5 },
          { param: 'thicknessTolerance', kind: 'range', min: 2, max: 5 },
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99 },
        ],
      },
      { item: 'mat/tailings', qty: q(1, 20) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/palladium', qty: q(21, 20) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 50) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '熔铸 2 mm 板坯（1600–1650 °C、氧 ≤50 ppm）；铣面',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 1600, max: 1650 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '轧制 17 道次、20 %/道次（2→0.05 mm）；每 5 道中间退火一次，共 4 次',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 600, max: 800 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '中间退火 600–800 °C、氢/真空 1 h；终轧后抛光到 Ra ≤0.2 µm',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 600, max: 800 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '成品：0.02–0.5 mm、厚差 ±5 %；千分尺抽检（没有在线测厚仪）',
        performedBy: 'plant/metrology-room',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'Pd 1.05 + 氢 0.02 → 箔 1.0 + 尾料 0.05；差 0.02 是氢与轧制/抛光损耗',
  },

  // ═══ Pt-Rh 氨氧化网：两个合金 ═══

  /**
   * Pt-10Rh 网：Pt 0.945 + Rh 0.105 → 1 kg 80 目网。
   *
   *   感应炉 1800–1900 °C、石墨坩埚、氩保护、电磁搅拌 10–20 min；
   *   铸 φ8 棒 → 57 道次/14 次退火 → 0.08 mm 丝 → 80 目织网。
   *   1 kg 0.08 mm 丝长 9 709 m；金刚石模 0.97 只/kg ⇒ 4.85×10⁻⁵ kg。
   *
   *   Rh 曾是一次性输入；`rhodium.ts` 有本地路线。
   *   均匀性 ±0.2 % 是配料/熔炼保证，没有 Rh 化验（缺口①/④）。
   */
  {
    id: 'make/pt-rh-gauze-10',
    name: 'Pt-10Rh Gauze Production', name_zh: 'Pt-10Rh 网制备',
    rate: { hours: q(80) },
    produces: [
      {
        item: 'mat/pt-rh-gauze',
        qty: q(1),
        gives: [
          { param: 'alloy', kind: 'enum', oneOf: ['Pt-10Rh'] },
          { param: 'wireDiameter', kind: 'range', min: 0.06, max: 0.1 },
          { param: 'mesh', kind: 'range', min: 80, max: 80 },
          { param: 'rh', kind: 'range', min: 9.5, max: 10.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/platinum', qty: q(189, 200) }] },
      { anyOf: [{ item: 'mat/rhodium', qty: q(21, 200) }] },
      { anyOf: [{ item: 'mat/diamond', qty: q(97, 2000000) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 50) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '感应熔炼 Pt-10Rh：1800–1900 °C、石墨坩埚、氩保护、电磁搅拌 10–20 min；铸 φ8 棒，均匀性 ±0.2 %（设计值）',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 1800, max: 1900 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '拉丝 57 道次、15 %/道次（φ8→φ0.08）；每 4 道退火一次，共 14 次；金刚石模 0.97 只/kg',
        performedBy: 'plant/pgm-wire-mill',
      },
      {
        note_zh: '中间退火 800–900 °C、氢/真空 1 h（Pt-Rh 比纯 Pt 高 50–100 K，避免 Rh 偏析）',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 800, max: 900 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '80 目织网：0.08 mm 丝、节距 0.3175 mm、网孔 0.2375 mm；幅宽 100–300 mm，经纬密度逐片抽检',
        performedBy: 'plant/pgm-wire-mill',
      },
      {
        note_zh: '成品：Pt-10Rh、丝 0.06–0.1 mm、80 目、Rh 9.5–10.5 %；氨氧化用（本层硝酸仍走电弧，网是备用/升级）',
        performedBy: 'plant/metrology-room',
      },
    ],
    unbalanced_zh:
      'Pt 0.945 + Rh 0.105 + 金刚石 4.85×10⁻⁵ + 氢 0.02 → 网 1.0；余 0.0700485 是氢、模具磨损与织网边角（未单列尾料条目，免得把 Rh 拖进遍历）',
  },

  /**
   * Pt-5Rh 网：Pt 0.9975 + Rh 0.0525 → 1 kg 80 目网。
   *
   *   同一条熔炼/拉丝/织网，Rh 减半；拉丝 57 道/14 退，丝 0.08 mm。
   */
  {
    id: 'make/pt-rh-gauze-5',
    name: 'Pt-5Rh Gauze Production', name_zh: 'Pt-5Rh 网制备',
    rate: { hours: q(80) },
    produces: [
      {
        item: 'mat/pt-rh-gauze',
        qty: q(1),
        gives: [
          { param: 'alloy', kind: 'enum', oneOf: ['Pt-5Rh'] },
          { param: 'wireDiameter', kind: 'range', min: 0.06, max: 0.1 },
          { param: 'mesh', kind: 'range', min: 80, max: 80 },
          { param: 'rh', kind: 'range', min: 4.5, max: 5.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/platinum', qty: q(399, 400) }] },
      { anyOf: [{ item: 'mat/rhodium', qty: q(21, 400) }] },
      { anyOf: [{ item: 'mat/diamond', qty: q(97, 2000000) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 50) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '感应熔炼 Pt-5Rh：1800–1900 °C、石墨坩埚、氩保护、电磁搅拌 10–20 min；铸 φ8 棒，均匀性 ±0.2 %（设计值）',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 1800, max: 1900 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '拉丝 57 道次、15 %/道次（φ8→φ0.08）；每 4 道退火一次，共 14 次；金刚石模 0.97 只/kg',
        performedBy: 'plant/pgm-wire-mill',
      },
      {
        note_zh: '中间退火 800–900 °C、氢/真空 1 h；Pt-5Rh 的再结晶温度略低于 10Rh，仍取同窗口',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 800, max: 900 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '80 目织网：0.08 mm 丝、节距 0.3175 mm、网孔 0.2375 mm；幅宽 100–300 mm',
        performedBy: 'plant/pgm-wire-mill',
      },
      {
        note_zh: '成品：Pt-5Rh、丝 0.06–0.1 mm、80 目、Rh 4.5–5.5 %；低铑版，寿命低于 10Rh',
        performedBy: 'plant/metrology-room',
      },
    ],
    unbalanced_zh:
      'Pt 0.9975 + Rh 0.0525 + 金刚石 4.85×10⁻⁵ + 氢 0.02 → 网 1.0；余 0.0700485 是氢、模具磨损与织网边角（未单列尾料条目，免得把 Rh 拖进遍历）',
  },

  // ═══ 六个零件：全部只用已有料与已有设备 ═══

  /**
   * 拉丝机：HT300 床身 600 + 45 钢 300 + 硬质合金 20 + 铜 20 → 1 件。
   *
   * 金刚石模是**耗材**，不装在机架上（每 kg 丝按 §2 摊），所以零件里只有
   * 模座（硬质合金 20 kg）与收线/排线机构。
   */
  {
    id: 'make/pgm-wire-mill-drawing',
    name: 'PGM Wire Drawing Machine Manufacturing', name_zh: 'PGM 拉丝机制造',
    rate: { hours: q(32) },
    produces: [{ item: 'plant/pgm-wire-mill/drawing-machine', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht300', qty: q(600) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(300) }] },
      { anyOf: [{ item: 'mat/tungsten-carbide', qty: q(20) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(20) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '浇铸/加工 HT300 床身与收线筒座；床身导轨面磨平', performedBy: 'plant/sheet-shop' },
      { note_zh: '车 45 钢收线筒、排线丝杠与模座孔；硬质合金模座压配', performedBy: 'lathe' },
      { note_zh: '装电机/减速器/排线器，空载 2 h；收线 5–200 m/min', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: 'HT300 600 + 45 钢 300 + 硬质合金 20 + 铜 20 → 拉丝机 1 件；按件计，余是铸件冒口与切屑',
  },

  /**
   * 轧机：HT300 机架 1200 + 45 钢辊 400 + 铜 30 → 1 件。
   *
   * φ100–200 mm 辊、辊缝 0.01–1 mm；四辊/二辊。辊面磨到 Ra ≤0.1 µm
   * （箔的 Ra 一半来自辊面）。
   */
  {
    id: 'make/pgm-wire-mill-rolling',
    name: 'PGM Rolling Mill Manufacturing', name_zh: 'PGM 轧机制造',
    rate: { hours: q(40) },
    produces: [{ item: 'plant/pgm-wire-mill/rolling-mill', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht300', qty: q(1200) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(400) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(30) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '浇铸/加工 HT300 机架与牌坊；压下螺母配作', performedBy: 'plant/sheet-shop' },
      { note_zh: '车/磨 45 钢工作辊 φ100–200，辊面 Ra ≤0.1 µm；装轴承座', performedBy: 'lathe' },
      { note_zh: '装压下/传动/润滑，空载 4 h；辊缝 0.01–1 mm 全行程对零', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: 'HT300 1200 + 45 钢 400 + 铜 30 → 轧机 1 件；按件计，余是铸件冒口与切屑',
  },

  /**
   * 退火炉：316L 200 + 耐火料 150 + 电阻丝 20 + 石英 20 → 1 件。
   *
   * 600–900 °C、真空/氢、±5 K；Pt 700–900、Pd 600–800。石英管做炉膛，
   * 316L 做外壳与水冷法兰；电阻丝绕在氧化铝骨架上。
   */
  {
    id: 'make/pgm-wire-mill-annealing',
    name: 'PGM Annealing Furnace Manufacturing', name_zh: 'PGM 退火炉制造',
    rate: { hours: q(32) },
    produces: [{ item: 'plant/pgm-wire-mill/annealing-furnace', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(200) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(150) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(20) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(20) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '卷焊 316L 外壳与水冷法兰；砌高铝耐火料 150 kg', performedBy: 'plant/sheet-shop' },
      { note_zh: '绕电阻丝 20 kg 在氧化铝骨架上；装石英炉管与密封法兰', performedBy: 'lathe' },
      { note_zh: '装真空泵/氢管路/测温；空炉 900 °C 保温 4 h，±5 K', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '316L 200 + 耐火料 150 + 电阻丝 20 + 石英 20 → 退火炉 1 件；按件计，余是边角',
  },

  /**
   * 感应炉：铜线圈 200 + 耐火料 200 + 碳 50 + 45 钢 100 → 1 件。
   *
   * 1800–1900 °C、石墨坩埚、氩保护、电磁搅拌；Pt-Rh 熔炼用。
   * 铜线圈通水冷；石墨坩埚是耗材（本层没有单列坩埚条目，按 `mat/carbon` 摊）。
   */
  {
    id: 'make/pgm-wire-mill-induction',
    name: 'PGM Induction Furnace Manufacturing', name_zh: 'PGM 感应炉制造',
    rate: { hours: q(48) },
    produces: [{ item: 'plant/pgm-wire-mill/induction-furnace', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(200) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(200) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(50) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(100) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '卷制水冷铜感应圈 200 kg；绕 8–12 匝，匝间绝缘', performedBy: 'plant/sheet-shop' },
      { note_zh: '砌刚玉/高铝坩埚座 200 kg；石墨坩埚 50 kg 预烘', performedBy: 'plant/robot' },
      { note_zh: '装 45 钢炉架、倾炉机构、氩气与冷却水；1800–1900 °C 空炉 2 h', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '铜 200 + 耐火料 200 + 碳 50 + 45 钢 100 → 感应炉 1 件；按件计，余是边角',
  },

  /**
   * 织网机：45 钢 200 + HT200 100 + 铜 10 → 1 件。
   *
   * 80 目、丝径 0.06–0.1 mm、幅宽 100–300 mm；经纬送丝 + 打纬 + 卷网。
   */
  {
    id: 'make/pgm-wire-mill-loom',
    name: 'PGM Wire Loom Manufacturing', name_zh: 'PGM 织网机制造',
    rate: { hours: q(24) },
    produces: [{ item: 'plant/pgm-wire-mill/loom', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(200) }] },
      { anyOf: [{ item: 'mat/iron-ht200', qty: q(100) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(10) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '焊/铸机架与卷网轴；幅宽 100–300 mm 可调', performedBy: 'plant/sheet-shop' },
      { note_zh: '车送丝轮/打纬刀/导丝孔；孔距按 80 目 0.3175 mm 配', performedBy: 'lathe' },
      { note_zh: '装送经/送纬/打纬/卷取，空载 1 h；0.06–0.1 mm 丝不弯折', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '45 钢 200 + HT200 100 + 铜 10 → 织网机 1 件；按件计，余是边角',
  },

  /** 机架与管路：钢板 300 → 1 件；把六个工位连成一条线。 */
  {
    id: 'make/pgm-wire-mill-frame',
    name: 'PGM Wire Rolling Mill Frame and Piping Manufacturing', name_zh: 'PGM 线材轧机机架与管路制造',
    rate: { hours: q(16) },
    produces: [{ item: 'plant/pgm-wire-mill/frame', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(300) }] }],
    needs: [],
    performedBy: 'plant/sheet-shop',
    unbalanced_zh: '钢板 300 → 机架 1 件；按件计，余是边角与焊材',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 四、接线（主 agent 注册；本文件不动 tools/report/data.ts）
//
//   import { PGM_PRODUCT_ALL_ITEMS, PGM_PRODUCT_ROUTES } from '../../data/material/pgm-products.ts';
//   items:  [...PGM_PRODUCT_ALL_ITEMS]
//   routes: [...PGM_PRODUCT_ROUTES]
//
// 器件路线在 `data/machine/pgm-devices.ts`，要一起注册。
// ═══════════════════════════════════════════════════════════════════════════

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PGM_PRODUCT_ALL_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/pgm-wire-mill',
    name: 'PGM Wire Rolling Mill Assembly', name_zh: 'PGM 线材轧机装配',
    produces: [{
      item: 'plant/pgm-wire-mill',
      qty: q(1),
      gives: [{ param: 'temperature', kind: 'range', min: 20, max: 1900 }],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...PGM_PRODUCT_ROUTES, ...ASSEMBLY_ROUTES];
