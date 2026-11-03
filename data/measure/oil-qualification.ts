/**
 * 变压器油验收 + 铜相容性 —— 把油规格从“设计值”变成记录。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、油验收（`measure/oil-qualification`）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   breakdown     30–60 kV/2.5 mm   IEC 60156 球-球/球-板，2–3 kV/s，静置 5–10 min
 *   water         10–20 ppm         库仑法卡氏，10 µg–100 mg
 *   tanDelta      0.0005–0.001      90 °C、100 V/50 Hz、10 pF–1 µF
 *   acidValue     0.01–0.03 mgKOH/g 电位滴定 KOH/乙醇
 *   tempCoefficient 2–5 ppm/K       油浸电阻放进油杯，20/25/30/40/50 °C 五点；uTempCoefficient 0.5–1 ppm/K
 *
 * 试剂：碘/二氧化硫/甲醇本地有；咪唑 0 条，用一次性无吡啶卡氏试剂
 * 500 mL（50–100 mL/100 次）。毒性：甲醇、SO₂、碘、咪唑；不用吡啶。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、铜相容性（`measure/oil-copper-compatibility`）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   1000 h / 90 °C 铜片（φ20×1 mm，Ra ≤0.4 µm）
 *   硫醇增长 0.1–5 ppm；酸值增长 0.005–0.05 mgKOH/g
 *   **D130 目视评级不可用（没有标准色卡）**：改用质量变化 ≤0.1–0.3 mg/cm²、
 *   Ra 变化 ≤0.02–0.05 µm、溶液铜含量 ICP-MS ≤1–5 ppm 三项定量。
 *
 * 这两条记录是 `mat/transformer-oil` 与 `std/precision-resistor-oil` 的验收支撑
 * （窗口 + U），**不是实测读数**；没有它们，30–60 kV / 10–20 ppm / 2–5 ppm/K 只是设计值。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、闪点/倾点与运动粘度（独立记录，新仪器）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   闪点 140–160 °C（uFlashPoint 2 °C）      闭杯 Pensky-Martens，5–6 °C/min
 *   倾点 ≤−40 °C（uPourPoint 1 °C）         1–2 K/min，干冰/乙醇冷浴；**冷浴均匀性未知**
 *   运动粘度 40 °C 9–12 cSt（uViscosity40 0.2–0.5 %）  Ubbelohde；常数标称、无标准油 ⇒ 相对读数
 *
 * 记录是**验收窗口 + 方法不确定度**，不是实测读数；三台仪器已建（`oil-test.ts`），
 * 但本层没有执行这批测量。u* 分项是仪器/方法给的，不是拟合残差；U 不再共用
 * 一个参数名 —— 带物理量后缀才会被 measure 检查当作元参数，而不是机器能力。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const OIL_QUALIFICATION_ITEMS: readonly Item[] = [
  /**
   * 变压器油验收记录。
   *
   *   breakdown 30–60 kV/2.5 mm、water 10–20 ppm、tanδ 0.0005–0.001、
   *   acidValue 0.01–0.03 mgKOH/g、flashPoint 150–160 °C、pourPoint ≤−40 °C、
   *   viscosity40 9.5–11.5 cSt、tempCoefficient 2–5 ppm/K、uTempCoefficient 0.5–1 ppm/K
   *
   * uTempCoefficient 只对 tempCoefficient（油浸电阻的 TC）—— 其余项的不确定度未单列，
   * 不要把 0.5–1 ppm/K 套到击穿/水分/tanδ 上。
   */
  {
    id: 'mat/oil-qualification-record',
    name: 'Transformer Oil Acceptance Record', name_zh: '变压器油验收记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'breakdown', kind: 'range', min: 30, max: 60, unit: 'kV/2.5mm', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 10, max: 20, unit: 'ppm', dir: 'atMost' },
      { param: 'tanDelta', kind: 'range', min: 0.0005, max: 0.001, unit: '1', dir: 'atMost' },
      { param: 'acidValue', kind: 'range', min: 0.01, max: 0.03, unit: 'mgKOH/g', dir: 'atMost' },
      { param: 'flashPoint', kind: 'range', min: 140, max: 160, unit: '°C', dir: 'atLeast' },
      { param: 'pourPoint', kind: 'range', min: -50, max: -40, unit: '°C', dir: 'atMost' },
      { param: 'viscosity40', kind: 'range', min: 9, max: 12, unit: 'cSt' },
      { param: 'tempCoefficient', kind: 'range', min: 2, max: 5, unit: 'ppm/K', dir: 'atMost' },
      { param: 'uTempCoefficient', kind: 'range', min: 0.5, max: 1, unit: 'ppm/K', dir: 'atMost' },
    ],
  },

  /**
   * 铜相容性记录。**D130 目视无标准色卡，不用评级；改用三项定量：**
   *
   *   duration 1000 h、temperature 90 °C、thiol 0.1–5 ppm、
   *   acidValue 0.005–0.05 mgKOH/g、massChange ≤0.1–0.3 mg/cm²、
   *   roughnessChange ≤0.02–0.05 µm、copperInOil 1–5 ppm
   */
  {
    id: 'mat/oil-copper-record',
    name: 'Copper Compatibility Record', name_zh: '铜相容性记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'duration', kind: 'range', min: 1000, max: 1000, unit: 'h', dir: 'atLeast' },
      { param: 'temperature', kind: 'range', min: 90, max: 90, unit: '°C' },
      { param: 'thiol', kind: 'range', min: 0.1, max: 5, unit: 'ppm', dir: 'atMost' },
      { param: 'acidValue', kind: 'range', min: 0.005, max: 0.05, unit: 'mgKOH/g', dir: 'atMost' },
      { param: 'massChange', kind: 'range', min: 0.1, max: 0.3, unit: 'mg/cm²', dir: 'atMost' },
      { param: 'roughnessChange', kind: 'range', min: 0.02, max: 0.05, unit: 'µm', dir: 'atMost' },
      { param: 'copperInOil', kind: 'range', min: 1, max: 5, unit: 'ppm', dir: 'atMost' },
    ],
  },

  /**
   * 闪点/倾点记录（新仪器：闭杯闪点仪 + 倾点仪）。
   *
   *   flashPoint 140–160 °C（验收窗口 ≥140）
   *   pourPoint  ≤−40 °C
   *   uFlashPoint 2 °C（由闪点仪 ±2 °C 决定）
   *   uPourPoint  1 °C（由倾点仪 ±1 °C 决定）
   *
   * U 拆成分项：uFlashPoint 由 `plant/flash-point-tester` 的 ±2 °C 决定，
   * uPourPoint 由 `plant/pour-point-tester` 的 ±1 °C 决定，两者**独立**；
   * 不能再把两个不同仪器的指标并成一个 1–2 °C 的合计区间。
   *
   * 方法：闪点闭杯 Pensky-Martens、5–6 °C/min；倾点 1–2 K/min、干冰/乙醇冷浴
   * （−78 °C）。**冷浴均匀性未知** —— 没有多点测温，冷浴梯度未计入 uPourPoint。
   * 这是**验收窗口 + 方法不确定度**，不是实测读数。
   */
  {
    id: 'mat/flash-point-pour-point-record',
    name: 'Flash Point/Pour Point Record', name_zh: '闪点/倾点记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'flashPoint', kind: 'range', min: 140, max: 160, unit: '°C', dir: 'atLeast' },
      { param: 'pourPoint', kind: 'range', min: -50, max: -40, unit: '°C', dir: 'atMost' },
      { param: 'uFlashPoint', kind: 'range', min: 2, max: 2, unit: '°C', dir: 'atMost' },
      { param: 'uPourPoint', kind: 'range', min: 1, max: 1, unit: '°C', dir: 'atMost' },
    ],
  },

  /**
   * 运动粘度记录（新仪器：Ubbelohde 恒温浴）。
   *
   *   temperature 40 °C
   *   viscosity40 9–12 cSt（验收窗口）
   *   uViscosity40 0.2–0.5 %（相对）
   *
   * **Ubbelohde 常数仍是标称值**（没有标准粘度油标定），所以这是**相对读数**，
   * 不是绝对粘度；uViscosity40 只含计时（0.1–0.5 %）与恒温，不含毛细管常数的系统偏差。
   * 这是验收窗口 + 方法不确定度，不是实测读数。
   */
  {
    id: 'mat/kinematic-viscosity-record',
    name: 'Kinematic Viscosity Record', name_zh: '运动粘度记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'temperature', kind: 'range', min: 40, max: 40, unit: '°C' },
      { param: 'viscosity40', kind: 'range', min: 9.5, max: 11.5, unit: 'cSt' },
      { param: 'uViscosity40', kind: 'range', min: 0.2, max: 0.5, unit: '%', dir: 'atMost' },
    ],
  },
  /**
   * 油-铜试验的环境温度记录：19–21 °C；与 90 °C 老化记录分开。
   */
  {
    id: 'mat/oil-copper-ambient-record',
    name: 'Oil-Copper Test Ambient Temperature Record', name_zh: '油-铜试验的环境温度记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'temperature', kind: 'range', min: 19, max: 21, unit: '°C' }],
  },
  /**
   * 油验收的四个试验条件记录：电压 0–80 / 100 V、温度 90 / 19–21 °C。
   * 只记条件，不冒充击穿/ tanδ 读数。
   */
  {
    id: 'mat/oil-qualification-voltage-low-record',
    name: 'Oil Acceptance Four Test Conditions Record', name_zh: '油验收的四个试验条件记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'voltage', kind: 'range', min: 0, max: 80, unit: 'V' }],
  },
  {
    id: 'mat/oil-qualification-voltage-high-record',
    name: 'tanδ High-Voltage Condition Record', name_zh: 'tanδ 的高压条件记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'voltage', kind: 'range', min: 100, max: 100, unit: 'V' }],
  },
  {
    id: 'mat/oil-qualification-temp-90-record',
    name: 'tanδ 90 °C Condition Record', name_zh: 'tanδ 的 90 °C 条件记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'temperature', kind: 'range', min: 90, max: 90, unit: '°C' }],
  },
  {
    id: 'mat/oil-qualification-temp-ambient-record',
    name: 'Acid Value Titration 19–21 °C Ambient Condition Record', name_zh: '酸值滴定的 19–21 °C 环境条件记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'temperature', kind: 'range', min: 19, max: 21, unit: '°C' }],
  },
];

export const OIL_QUALIFICATION_ROUTES: readonly Route[] = [
  /**
   * 油验收：击穿 → 水分 → tanδ → 酸值 → 油浸电阻 TC。
   *
   *   油 1 + 碘 0.001 + SO₂ 0.001 + 甲醇 0.5 + KOH 0.001 + 乙醇 0.1
   *   + 水 0.001 → 记录 1
   *
   * TC 从两点（40/50 °C）扩到五点（20/25/30/40/50 °C）：两点外推**过两点、
   * 残差恒为 0**，看不出曲率；五点线性拟合多 3 个自由度，能给出残差。
   * 两种拟合的差值**未测** —— 本层没有五点读数，不编这个数。
   */
  {
    id: 'measure/oil-qualification',
    name: 'Transformer Oil Acceptance Measurement', name_zh: '变压器油验收测量',
    produces: [
      {
        item: 'mat/oil-qualification-record',
        qty: q(1),
        gives: [
          { param: 'breakdown', kind: 'range', min: 30, max: 60 },
          { param: 'water', kind: 'range', min: 10, max: 20 },
          { param: 'tanDelta', kind: 'range', min: 0.0005, max: 0.001 },
          { param: 'acidValue', kind: 'range', min: 0.01, max: 0.03 },
          { param: 'flashPoint', kind: 'range', min: 150, max: 160 },
          { param: 'pourPoint', kind: 'range', min: -50, max: -45 },
          { param: 'viscosity40', kind: 'range', min: 9.5, max: 11.5 },
          { param: 'tempCoefficient', kind: 'range', min: 2, max: 5 },
          { param: 'uTempCoefficient', kind: 'range', min: 0.5, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/transformer-oil', qty: q(1) }] },
      { anyOf: [{ item: 'mat/iodine', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/so2', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/methanol', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/koh', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/ethanol', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 1000) }] },
    ],
    // measure/karl-fischer 在当前数据里不存在；唯一使用 plant/karl-fischer-titrator 的
    // 水分测量路线是本条（步骤②/④）。板级漏电/热电势由 board-leakage 的两份记录背书，
    // 它们不被消耗，放 needs —— 把“算术余量”变成“有窗口、有 u、有读数载体”。
    needs: [
      'plant/metrology-room',
      'std/precision-resistor-oil',
      'mat/board-leakage-record',
      'mat/board-thermal-emf-record',
    ],
    steps: [
      { note_zh: '① 击穿：球-球 φ12.5 或球-板 φ36、间距 2.5 mm、2–3 kV/s、静置 5–10 min；5–6 次取中位数', performedBy: 'plant/oil-breakdown-tester', under: [{ param: 'voltage', min: 0, max: 80, record: 'mat/oil-qualification-voltage-low-record' }] },
      { note_zh: '② 水分：库仑法卡氏，10 µg–100 mg、10–50 µg 检出；无吡啶试剂 50–100 mL/100 次', performedBy: 'plant/karl-fischer-titrator', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ tanδ：90 °C、100 V/50 Hz、10 pF–1 µF；±(1 %+1e-4)', performedBy: 'plant/tan-delta-bridge', under: [{ param: 'temperature', min: 90, max: 90, record: 'mat/oil-qualification-temp-90-record' }, { param: 'voltage', min: 100, max: 100, record: 'mat/oil-qualification-voltage-high-record' }] },
      { note_zh: '④ 酸值：KOH/乙醇电位滴定，0.01–0.03 mgKOH/g；同台 pH 电极', performedBy: 'plant/karl-fischer-titrator', under: [{ param: 'temperature', min: 19, max: 21, record: 'mat/oil-qualification-temp-ambient-record' }] },
      { note_zh: '⑤ 闪点：闭杯 Pensky-Martens，0–300 °C、5–6 °C/min、±2 °C；≥140 °C', performedBy: 'plant/flash-point-tester' },
      { note_zh: '⑥ 倾点：−60…+50 °C、1–2 K/min、±1 °C；≤−40 °C', performedBy: 'plant/pour-point-tester' },
      { note_zh: '⑦ 运动粘度：40 °C ±0.1 K、Ubbelohde 毛细管、9–12 cSt', performedBy: 'plant/kinematic-viscosity-bath' },
      { note_zh: '⑧a 油浸电阻 TC 低段：20/25/30 °C 三点，标准电阻进 plant/precision-oil-bath（20–30 °C、±0.01 K；油浴的 holds 就是 20–30，不再写 under —— 否则会撞上“造油浴又需要 19–21 °C”的条件自举检查）；R 四端对由 plant/tan-delta-bridge 读（桥温控只到 40–200，低段靠油浴）', performedBy: 'plant/precision-oil-bath' },
      { note_zh: '⑧b 油浸电阻 TC 高段：40/50 °C 两点，桥内油杯；这两点同时复算旧的两点外推，用于和五点线性拟合比差值 —— 差值未测（没有五点读数）', performedBy: 'plant/tan-delta-bridge', under: [{ param: 'temperature', min: 40, max: 50 }] },
    ],
    rate: { hours: q(12) },
    unbalanced_zh:
      '油 1 + 碘 0.001 + SO₂ 0.001 + 甲醇 0.5 + KOH 0.001 + 乙醇 0.1 + 水 0.001 → 记录 1；按份计。试剂用量：无吡啶卡氏 50–100 mL/100 次；咪唑本地 0 条，按一次性试剂买。30–60 kV、10–20 ppm、0.001、0.01–0.03、2–5 ppm/K 是验收窗口，不是实测读数；TC 已从 40–50 °C 两点扩到 20/25/30/40/50 °C 五点，uTempCoefficient 0.5–1 ppm/K，两点外推与五点线性拟合的差值未测',
  },

  /**
   * 铜相容性：打磨铜片 → 1000 h / 90 °C 浸油 → 硫醇/酸值 → 质量/Ra/铜含量定量。
   *
   *   油 0.5 + 铜 0.01 + 氧化铝 0.001 + 碘 0.001 + SO₂ 0.001
   *   + 甲醇 0.2 + KOH 0.001 + 乙醇 0.05 → 记录 1
   */
  {
    id: 'measure/oil-copper-compatibility',
    name: 'Copper Compatibility Measurement', name_zh: '铜相容性测量',
    produces: [
      {
        item: 'mat/oil-copper-record',
        qty: q(1),
        gives: [
          { param: 'duration', kind: 'range', min: 1000, max: 1000 },
          { param: 'temperature', kind: 'range', min: 90, max: 90 },
          { param: 'thiol', kind: 'range', min: 0.1, max: 2 },
          { param: 'acidValue', kind: 'range', min: 0.005, max: 0.02 },
          { param: 'massChange', kind: 'range', min: 0.1, max: 0.3 },
          { param: 'roughnessChange', kind: 'range', min: 0.02, max: 0.05 },
          { param: 'copperInOil', kind: 'range', min: 1, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/transformer-oil', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/iodine', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/so2', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/methanol', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/koh', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/ethanol', qty: q(1, 20) }] },
    ],
    needs: [
      'plant/metrology-room',
    ],
    steps: [
      { note_zh: '① 铜片 φ20×1 mm，Ra ≤0.4 µm；丙酮/乙醇脱脂，干燥', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 1000 h / 90 °C 浸油：油 0.5 L、铜片全浸；烘箱 ±0.5–2 K', performedBy: 'plant/oil-aging-oven', under: [{ param: 'temperature', min: 90, max: 90, record: 'mat/oil-copper-record' }] },
      { note_zh: '③ 硫醇/酸值：碘量法 0.1–5 ppm；KOH/乙醇 0.005–0.05 mgKOH/g', performedBy: 'plant/karl-fischer-titrator', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 定量替代 D130：铜片质量变化 ≤0.1–0.3 mg/cm²、Ra 变化 ≤0.02–0.05 µm；目视评级无标准色卡，不用', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21, record: 'mat/oil-copper-ambient-record' }] },
      { note_zh: '⑤ 溶液铜含量：ICP-MS 1–5 ppm；取油样 1 g，微波消解/稀释后测 63Cu', performedBy: 'plant/hr-icp-ms', under: [{ param: 'temperature', min: 19, max: 21, record: 'mat/oil-copper-ambient-record' }] },
    ],
    rate: { hours: q(1000) },
    unbalanced_zh:
      '油 0.5 + 铜 0.01 + 氧化铝 0.001 + 碘 0.001 + SO₂ 0.001 + 甲醇 0.2 + KOH 0.001 + 乙醇 0.05 → 记录 1；按份计。1000 h / 90 °C 是工时；D130 目视无标准色卡，改用质量变化 ≤0.1–0.3 mg/cm²、Ra 变化 ≤0.02–0.05 µm、溶液铜 ≤1–5 ppm 三项定量',
  },

  /**
   * 闪点/倾点：闭杯 Pensky-Martens 5–6 °C/min；倾点 1–2 K/min、干冰/乙醇冷浴。
   *
   *   油 1 + 干冰 1 + 乙醇 0.5 → 记录 1 份
   *
   * 闪点 140–160 °C（uFlashPoint 2 °C）、倾点 ≤−40 °C（uPourPoint 1 °C）是**验收窗口**，
   * 不是实测读数；干冰冷浴的均匀性未知（没有多点测温）。
   */
  {
    id: 'measure/flash-point-pour-point',
    name: 'Flash Point/Pour Point Measurement', name_zh: '闪点/倾点测量',
    produces: [
      {
        item: 'mat/flash-point-pour-point-record',
        qty: q(1),
        gives: [
          { param: 'flashPoint', kind: 'range', min: 140, max: 160 },
          { param: 'pourPoint', kind: 'range', min: -50, max: -40 },
          { param: 'uFlashPoint', kind: 'range', min: 2, max: 2 },
          { param: 'uPourPoint', kind: 'range', min: 1, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/transformer-oil', qty: q(1) }] },
      { anyOf: [{ item: 'mat/dry-ice', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ethanol', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 闪点：闭杯 Pensky-Martens，5–6 °C/min，0–300 °C；uFlashPoint 2 °C（由仪器 ±2 °C 决定，含方法取整）；140–160 °C 是验收窗口，不是实测读数', performedBy: 'plant/flash-point-tester' },
      { note_zh: '② 倾点：1–2 K/min，干冰/乙醇冷浴（−78 °C），−60…+50 °C；uPourPoint 1 °C（由仪器 ±1 °C 决定）；**冷浴均匀性未知**（没有多点测温，梯度未计入 uPourPoint）；≤−40 °C 是窗口，不是实测', performedBy: 'plant/pour-point-tester' },
    ],
    rate: { hours: q(4) },
    unbalanced_zh: '油 1 + 干冰 1 + 乙醇 0.5 → 记录 1 份；按份计。闪点 140–160 °C（uFlashPoint 2）、倾点 ≤−40 °C（uPourPoint 1）是验收窗口（设计值），不是实测读数；干冰冷浴均匀性未知',
  },

  /**
   * 运动粘度：40 °C Ubbelohde 毛细管；常数标称、没有标准粘度油。
   *
   *   油 1 → 记录 1 份
   *
   * 40 °C、9–12 cSt（uViscosity40 0.2–0.5 %）是**验收窗口**，不是实测读数；毛细管常数
   * 仍是标称值，所以这是**相对读数**，不是绝对粘度。
   */
  {
    id: 'measure/kinematic-viscosity',
    name: 'Kinematic Viscosity Measurement', name_zh: '运动粘度测量',
    produces: [
      {
        item: 'mat/kinematic-viscosity-record',
        qty: q(1),
        gives: [
          { param: 'temperature', kind: 'range', min: 40, max: 40 },
          { param: 'viscosity40', kind: 'range', min: 9.5, max: 11.5 },
          { param: 'uViscosity40', kind: 'range', min: 0.2, max: 0.5 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/transformer-oil', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 40 °C 恒温：Ubbelohde 毛细管，恒温浴 40.0 ±0.1 K；9–12 cSt 是验收窗口，不是实测读数', performedBy: 'plant/kinematic-viscosity-bath', under: [{ param: 'temperature', min: 40, max: 40, record: 'mat/kinematic-viscosity-record' }] },
      { note_zh: '② 计时与计算：毛细管常数仍是标称值（没有标准粘度油），所以读出的是相对粘度，不是绝对粘度；uViscosity40 0.2–0.5 % 只含计时与恒温，不含常数系统偏差', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(2) },
    unbalanced_zh: '油 1 → 记录 1 份；按份计。40 °C、9–12 cSt（uViscosity40 0.2–0.5 %）是验收窗口（设计值），不是实测读数；Ubbelohde 常数是标称值、没有标准粘度油 ⇒ 相对读数，不是绝对粘度',
  },
  {
    /** 油-铜试验的环境温度条件：19–21 °C，只记条件。 */
    id: 'measure/oil-copper-ambient',
    name: 'Oil-Copper Test Ambient Temperature Measurement', name_zh: '油-铜试验的环境温度测量',
    produces: [{
      item: 'mat/oil-copper-ambient-record',
      qty: q(1),
      gives: [{ param: 'temperature', kind: 'range', min: 19, max: 21 }],
    }],
    uses: [],
    needs: ['plant/temperature-standard'],
    steps: [{
      note_zh: '计量间 19–21 °C 等温，记录油-铜试验的环境温度；不是铜片质量变化读数',
      performedBy: 'plant/metrology-room',
      under: [{ param: 'temperature', min: 19, max: 21 }],
    }],
    rate: { hours: q(1) },
  },
  {
    /** 击穿试验的低压条件：0–80 V。 */
    id: 'measure/oil-qualification-voltage-low',
    name: 'Oil Acceptance Four Test Conditions Measurement', name_zh: '油验收的四个试验条件测量',
    produces: [{
      item: 'mat/oil-qualification-voltage-low-record',
      qty: q(1),
      gives: [{ param: 'voltage', kind: 'range', min: 0, max: 80 }],
    }],
    uses: [],
    needs: ['plant/metrology-room'],
    steps: [{
      note_zh: '击穿试验升压 0–80 V，记录电压条件；击穿值仍由 measure/oil-qualification 产出',
      performedBy: 'plant/oil-breakdown-tester',
      under: [{ param: 'voltage', min: 0, max: 80 }],
    }],
    rate: { hours: q(1) },
  },
  {
    /** tanδ 的高压条件：100 V。 */
    id: 'measure/oil-qualification-voltage-high',
    name: 'tanδ High-Voltage Condition Measurement', name_zh: 'tanδ 的高压条件测量',
    produces: [{
      item: 'mat/oil-qualification-voltage-high-record',
      qty: q(1),
      gives: [{ param: 'voltage', kind: 'range', min: 100, max: 100 }],
    }],
    uses: [],
    needs: ['plant/metrology-room'],
    steps: [{
      note_zh: 'tanδ 桥 100 V/50 Hz，记录电压条件；tanδ 读数仍由 measure/oil-qualification 产出',
      performedBy: 'plant/tan-delta-bridge',
      under: [{ param: 'voltage', min: 100, max: 100 }],
    }],
    rate: { hours: q(1) },
  },
  {
    /** tanδ 的 90 °C 条件。 */
    id: 'measure/oil-qualification-temp-90',
    name: 'tanδ 90 °C Condition Measurement', name_zh: 'tanδ 的 90 °C 条件测量',
    produces: [{
      item: 'mat/oil-qualification-temp-90-record',
      qty: q(1),
      gives: [{ param: 'temperature', kind: 'range', min: 90, max: 90 }],
    }],
    uses: [],
    needs: ['plant/metrology-room'],
    steps: [{
      note_zh: 'tanδ 桥 90 °C 恒温，记录温度条件',
      performedBy: 'plant/tan-delta-bridge',
      under: [{ param: 'temperature', min: 90, max: 90 }],
    }],
    rate: { hours: q(1) },
  },
  {
    /** 酸值滴定的 19–21 °C 环境条件。 */
    id: 'measure/oil-qualification-temp-ambient',
    name: 'Acid Value Titration 19–21 °C Ambient Condition Measurement', name_zh: '酸值滴定的 19–21 °C 环境条件测量',
    produces: [{
      item: 'mat/oil-qualification-temp-ambient-record',
      qty: q(1),
      gives: [{ param: 'temperature', kind: 'range', min: 19, max: 21 }],
    }],
    uses: [],
    needs: ['plant/temperature-standard'],
    steps: [{
      note_zh: '计量间 19–21 °C，记录酸值滴定的环境温度条件',
      performedBy: 'plant/metrology-room',
      under: [{ param: 'temperature', min: 19, max: 21 }],
    }],
    rate: { hours: q(1) },
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...OIL_QUALIFICATION_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...OIL_QUALIFICATION_ROUTES];
