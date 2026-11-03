/**
 * 电子级 Si₃N₄ 的四件量具/校准硬件 —— Vbd 源、Na RSF 标样、耐腐蚀 NH₃ MFC。
 * 洁净室的 ISO 等级加在 `plant/clean-room` 的 `props` 上（data/machine/clean.ts）。
 *
 * 这四件都按“地球有，模型里就必须有路线”处理：
 *
 *   `plant/hv-source-500v`    ±500 V、1 nA–1 mA、1 V 步进；0.3–1 µm 膜上
 *                             5 MV/cm 要 150–500 V，这台源正好覆盖。
 *   `mat/sims-na-rsf-standard` 旋涂已知浓度 NaCl 溶液 + 900–1000 °C 扩散；
 *                             dose 1e11–1e13 cm⁻²，不确定度 15–30 %。
 *                             不用注入机：Na 会污染 Al/P 注入机。
 *   `plant/mfc-nh3`           316L + PTFE 润湿件的 NH₃ 质量流量控制器；
 *                             用现有 MFC 的六个零件 + PTFE 衬里重装。
 *
 * ⚠️ 测量路线在 data/measure/si3n4-metrology.ts；本文件只放硬件与它们的
 * 产出路线（R13：机器/材料文件不定义测量路线）。
 *
 * ⚠️ `plant/hv-source-500v` 与 `plant/mfc-nh3` 是**整机路线**：它们没有
 * `composedOf`，零件写在路线的 `uses` 里。`machine_without_parts` 因此能过
 * （路线确实吃零件），`mixed_production` 也不会触发（没有 composedOf）。
 * 这与 `plant/lpcvd-furnace` 的 composedOf 写法不同，是因为这两件本轮
 * 要求“条目 + 路线”，而 LPCVD 炉沿用了 120 台机器的装配写法。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、±500 V / 1 nA–1 mA 扫描源
// ═══════════════════════════════════════════════════════════════════════════

export const SI3N4_METROLOGY_ITEMS: readonly Item[] = [
  /**
   * 高压小电流扫描源。**±500 V、1 nA–1 mA、1 V 步进。**
   *
   * 组成：变压器 → 桥式整流 → 可控硅调压 → 电阻分压 → 数字电压表 →
   * 屏蔽机箱。电流用 1 kΩ–1 GΩ 的分档取样电阻 + 运放，覆盖 1 nA–1 mA。
   *
   * 判据：0.3–1 µm 的 Si₃N₄ 上 5 MV/cm 要 **150–500 V**；源的上限 500 V
   * 正好够 1 µm，0.3 µm 上能到 16.7 MV/cm。1 V 步进在 0.3 µm 上 = 0.033 MV/cm，
   * 足够找击穿拐点。
   */
  {
    id: 'plant/hv-source-500v',
    name: '高压小电流扫描源',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'voltage', kind: 'range', min: -500, max: 500, unit: 'V' },
      { param: 'current', kind: 'range', min: 1e-9, max: 1e-3, unit: 'A' },
      { param: 'step', kind: 'range', min: 1, max: 1, unit: 'V' },
      { param: 'accuracy', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /** 升压变压器。铁芯 + 双绕组，500 V 次级；与 `std/transformer-general` 同一副手艺。 */
  { id: 'plant/hv-source-500v/transformer', name: '高压小电流扫描源升压变压器', unit: '件', category: 'part' },

  /** 桥式整流。4 只高压二极管 + 铝散热片。 */
  { id: 'plant/hv-source-500v/rectifier', name: '高压小电流扫描源桥式整流', unit: '件', category: 'part' },

  /** 可控硅调压 + 运放误差放大 + 稳压管基准。 */
  { id: 'plant/hv-source-500v/regulator', name: '高压小电流扫描源可控硅调压', unit: '件', category: 'part' },

  /** 1 GΩ:10 MΩ 分压器。薄膜电阻网络 + 氧化铝基板。 */
  { id: 'plant/hv-source-500v/divider', name: '1 GΩ:10 MΩ 分压器', unit: '件', category: 'part' },

  /** 数字电压表头。4½ 位，0–500 V。 */
  { id: 'plant/hv-source-500v/meter', name: '高压小电流扫描源数字电压表头', unit: '件', category: 'part' },

  /** 屏蔽机箱。1 mm 钢板 + PTFE 绝缘子 + 接地铜排。 */
  { id: 'plant/hv-source-500v/enclosure', name: '高压小电流扫描源屏蔽机箱', unit: '件', category: 'part' },

  // ═════════════════════════════════════════════════════════════════════════
  // 二、Na RSF 标样
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * SIMS 的 Na RSF 标样。**φ100 硅片 + 已知 Na 剂量 1e11–1e13 cm⁻²。**
   *
   * 做法：NaCl 溶液旋涂 → 900–1000 °C 扩散 → 清洗掉表面 Na，只留扩散进
   * 硅里的剂量。剂量 = 溶液 Na 质量 / 片面积；用 1:100–1:10000 的稀释系列
   * 覆盖 1e11–1e13。
   *
   * ⚠️ 不确定度 **15–30 %**：移液/体积 ±2 %、浓度 ±3 %、旋涂均匀性 ±5 %、
   * 扩散 retention ±10–20 %。不用离子注入：Na 会污染 Al/P 注入机。
   */
  {
    id: 'mat/sims-na-rsf-standard',
    name: 'SIMS 的 Na RSF 标样',
    unit: '片',
    category: 'part',
    props: [
      { param: 'dose', kind: 'range', min: 1e11, max: 1e13, unit: 'cm⁻²' },
      { param: 'uniformity', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 30, unit: '%', dir: 'atMost' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 三、耐腐蚀 NH₃ MFC
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * 耐腐蚀 NH₃ 质量流量控制器。**0–200 sccm、3–5 %、316L + PTFE 润湿件。**
   *
   * 用现有 `plant/mfc` 的六个零件（层流元件、毛细管、差压膜片、镍电阻对、
   * 挡板阀、控制板）重装：阀座与密封换 PTFE，壳体 316L，量程按 NH₃ 的
   * 粘度/密度重标。标定见 `measure/nh3-flow-calibration`（体积法/压力降法）。
   */
  {
    id: 'plant/mfc-nh3',
    name: '耐腐蚀 NH₃ 质量流量控制器',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'flowRange', kind: 'range', min: 0, max: 200, unit: 'sccm' },
      { param: 'accuracy', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
      { param: 'gas', kind: 'enum', values: ['NH3', 'N2', 'Ar'] },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 四、硬件产出路线
// ═══════════════════════════════════════════════════════════════════════════

export const SI3N4_METROLOGY_ROUTES: readonly Route[] = [
  {
    /**
     * **整机装配：六件 + 接触器 → ±500 V 源 1 台。**
     *
     * 老化 24 h、三点校准（−500/0/+500 V）用 `plant/comparator` 的 1 µm 位移？
     * 不 —— 电压校准用分压器 + `std/dvm-general` 的 4½ 位；比较仪只用于
     * 分压器膜片/绝缘子装夹。最终准确度 0.5–1 %。
     */
    id: 'make/hv-source-500v',
    name: '高压小电流扫描源装配',
    produces: [
      {
        item: 'plant/hv-source-500v',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: -500, max: 500 },
          { param: 'current', kind: 'range', min: 1e-9, max: 1e-3 },
          { param: 'step', kind: 'range', min: 1, max: 1 },
          { param: 'accuracy', kind: 'range', min: 0.5, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/hv-source-500v/transformer', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-source-500v/rectifier', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-source-500v/regulator', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-source-500v/divider', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-source-500v/meter', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-source-500v/enclosure', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/comparator', 'plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh:
          '① 装变压器、整流、调压、分压、表头与机箱；高压走线 ≥8 mm 爬电距离，机箱单点接地',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '② 老化 24 h + 三点校准：−500/0/+500 V，用 1 GΩ:10 MΩ 分压器与 4½ 位表；电流档 1 nA/1 µA/1 mA 三点用 1 GΩ/1 MΩ/1 kΩ 取样电阻校',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '六件 + 接触器 1 → 源 1 台；零件按件计，不折 kg。高压源没有质量条目；老化与校准的工时记在本路线，不摊到零件',
  },
  {
    /** 升压变压器：绕线 → 浸漆烘干 → 装铁芯。 */
    id: 'make/hv-source-transformer',
    name: '高压小电流扫描源升压变压器制造',
    produces: [{ item: 'plant/hv-source-500v/transformer', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/transformer-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(10) }] },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(16) },
    steps: [
      { note_zh: '① 绕初级/次级，层间绝缘；匝比按 220 V → 500 V', performedBy: 'plant/winder' },
      { note_zh: '② 浸漆、100–150 °C 烘干 4 h', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 100, max: 150 }] },
      { note_zh: '③ 装铁芯、紧固、测匝比与绝缘', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '变压器标准件 1 + 铜线 1 + 铁 10 kg → 升压变压器 1 件；按件计，余是漆与切屑',
  },
  {
    /** 桥式整流：4 只高压二极管 + 铝散热片。 */
    id: 'make/hv-source-rectifier',
    name: '高压小电流扫描源桥式整流制造',
    produces: [{ item: 'plant/hv-source-500v/rectifier', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/hv-rectifier-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
    ],
    needs: ['plant/clean-room'],
    performedBy: 'plant/robot',
    rate: { hours: q(4) },
    unbalanced_zh: '高压整流标准件 1 + 铝 1 kg → 整流件 1 件；按件计，余是散热片切边',
  },
  {
    /** 可控硅调压：可控硅 + 运放 + 稳压管 + 铝板。 */
    id: 'make/hv-source-regulator',
    name: '高压小电流扫描源可控硅调压制造',
    produces: [{ item: 'plant/hv-source-500v/regulator', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/hv-thyristor-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '① 装可控硅、运放、基准与散热片；相位对齐', performedBy: 'plant/robot' },
      { note_zh: '② 调零、限流、老化 8 h', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '可控硅 1 + 运放 1 + 基准 1 + 铜线 0.1 + 铝 0.5 kg → 调压件 1 件；按件计',
  },
  {
    /** 1 GΩ:10 MΩ 分压器：薄膜电阻网络 + 氧化铝基板 + 铜线。 */
    id: 'make/hv-source-divider',
    name: '1 GΩ:10 MΩ 分压器制造',
    produces: [{ item: 'plant/hv-source-500v/divider', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/resistor-network-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
    ],
    needs: ['plant/comparator', 'plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      { note_zh: '① 装分压电阻网络与屏蔽；1 GΩ:10 MΩ 比 100:1', performedBy: 'plant/robot' },
      {
        note_zh: '② 标定：用 4½ 位表与分压比反算，−500/0/+500 V 三点线性 ≤0.2 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '电阻网络 1 + 氧化铝 0.1 + 铜线 0.1 kg → 分压器 1 件；按件计',
  },
  {
    /** 数字电压表头：DVM 标准件 + 运放 + 铜线。 */
    id: 'make/hv-source-meter',
    name: '高压小电流扫描源数字电压表头制造',
    produces: [{ item: 'plant/hv-source-500v/meter', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
    ],
    needs: ['plant/clean-room'],
    performedBy: 'plant/robot',
    rate: { hours: q(4) },
    unbalanced_zh: 'DVM 标准件 1 + 运放 1 + 铜线 0.1 kg → 表头 1 件；按件计',
  },
  {
    /** 屏蔽机箱：1 mm 钢板折弯/焊 + PTFE 绝缘子 + 接地铜排。 */
    id: 'make/hv-source-enclosure',
    name: '高压小电流扫描源屏蔽机箱制造',
    produces: [{ item: 'plant/hv-source-500v/enclosure', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '① 折弯、焊箱体与面板开孔；高压端子孔倒圆', performedBy: 'plant/sheet-shop' },
      { note_zh: '② 装 PTFE 绝缘子、接地铜排与门联锁', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '钢板 2 + PTFE 0.1 + 铜 0.1 kg → 机箱 1 件；按件计，余是切边',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4.2 Na RSF 标样：旋涂 + 扩散
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **Na RSF 标样：NaCl 溶液旋涂 → 900–1000 °C 扩散 → 清洗。**
     *
     *   φ100 硅片 1 + NaCl 1 g + 水 5 kg → 标样 1 片（dose 1e11–1e13 cm⁻²）
     *
     * 1 g NaCl / 5 kg 水 = 78.6 ppm Na 母液；稀释 1:100–1:10000 得到
     * 7.9 ppb–0.79 ppm Na；旋涂 100 µL 再扩散，覆盖 1e11–1e13。
     *
     * ⚠️ 不确定度 15–30 %：体积 ±2 %、浓度 ±3 %、旋涂 ±5 %、扩散 retention
     * ±10–20 %。**不用注入机**：Na 会污染 Al/P 注入机。
     */
    id: 'make/sims-na-rsf-standard',
    name: 'SIMS 的 Na RSF 标样制造',
    produces: [
      {
        item: 'mat/sims-na-rsf-standard',
        qty: q(1),
        gives: [
          { param: 'dose', kind: 'range', min: 1e11, max: 1e13, record: 'mat/sims-na-rsf-record' },
          { param: 'uniformity', kind: 'range', min: 3, max: 5 },
          { param: 'uncertainty', kind: 'range', min: 15, max: 30 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/salt', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '① 配液/旋涂：NaCl 1 g + 水 5 kg 母液，稀释 1:100–1:10000；取 100 µL 旋涂 φ100 片，100 °C 烘 5 min',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '② 扩散：900–1000 °C、30 min、N₂ 保护；Na 扩散进硅，表面留一层硅酸钠。扩散温度落在 plant/diffusion-furnace 的 900–1200 窗口内',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 900, max: 1000 }],
      },
      {
        note_zh:
          '③ 清洗：10 % HF 30 s 去表面硅酸钠，超纯水冲洗、甩干；只留扩散进硅的 Na。剂量 = 母液 Na 质量 / 78.54 cm²，不确定度 15–30 %',
        performedBy: 'plant/wet-bench',
      },
    ],
    unbalanced_zh:
      '硅片 1 + NaCl 1 g + 水 5 kg → 标样 1 片。Na 剂量 0.3–30 ng（1e11–1e13 cm⁻² × 78.54 cm² × 23 / 6.022e23）；NaCl 与水的其余部分是配液/冲洗废液。产出按片计，不折 kg',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4.3 耐腐蚀 NH₃ MFC：现有 MFC 零件 + PTFE 衬里重装
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **NH₃ MFC：`plant/mfc` 的六个零件 + PTFE 衬里/阀座 + 316L 壳。**
     *
     *   element + capillary + dp-cell + rtd-pair + valve + board
     *     + PTFE 1 + 316L 1 + 铜线 0.1 → NH₃ MFC 1 台
     *
     * 量程 0–200 sccm；NH₃ 的粘度是 N₂ 的 0.6 倍、密度 0.6 倍，同一压差下
     * 流量约 1.7 倍 —— 所以必须按 NH₃ 重标。标定见
     * `measure/nh3-flow-calibration`（体积法/压力降法）。
     */
    id: 'make/mfc-nh3',
    name: '耐腐蚀 NH₃ 质量流量控制器制造',
    produces: [
      {
        item: 'plant/mfc-nh3',
        qty: q(1),
        gives: [
          { param: 'flowRange', kind: 'range', min: 0, max: 200, record: 'mat/nh3-flow-cal-record' },
          { param: 'accuracy', kind: 'range', min: 3, max: 5, record: 'mat/nh3-flow-cal-record' },
          { param: 'gas', kind: 'enum', oneOf: ['NH3'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/mfc/element', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mfc/capillary', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mfc/dp-cell', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mfc/rtd-pair', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mfc/valve', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mfc/board', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room', 'plant/mfc'],
    rate: { hours: q(12) },
    steps: [
      {
        note_zh:
          '① 把挡板阀阀座、密封圈换 PTFE，壳体换 316L；层流元件/毛细管/差压膜片/镍电阻对/控制板沿用 plant/mfc 的六件',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '② 标定：先用 plant/mfc 的 N₂ 做传递（±3 %），再用 measure/nh3-flow-calibration 的体积法/压力降法按 NH₃ 重标；19–21 °C',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'MFC 六件 + PTFE 1 + 316L 1 + 铜线 0.1 kg → NH₃ MFC 1 台；按台计，余是衬里/密封切边。无质量条目',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...SI3N4_METROLOGY_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...SI3N4_METROLOGY_ROUTES];
