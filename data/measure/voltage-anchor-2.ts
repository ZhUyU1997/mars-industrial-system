/**
 * 可计算电容绝对电压与两法比对（从 data/machine/voltage-anchor-2.ts 迁入，R13）。
 *
 * 两份记录 + 两条测量路线；锚是长度/时间/质量。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DATA_ITEMS: readonly Item[] = [
  /**
   * **可计算电容法的绝对电压记录：0.5–10 V，90–160 ppm。**
   *
   * 它是 `measure/voltage-absolute-capacitor` 的产出。记录里写：
   *   ① 10 V 档绝对修正值；
   *   ② C_calc、C_std、R、I 四个中间量与各自的不确定度；
   *   ③ 1/2/5/0.5 V 抽头相对 10 V 的比值；
   *   ④ `anchor = length-time-mass`、`method = calculable-capacitor`。
   *
   * ⚠️ 90–160 ppm 比电压天平的 31 ppm 差 3–5 倍，原因写在文件头 §三：
   * 多经过 C 的 100:1、R 的两级、电流天平三个传递，每一项 25–60 ppm。
   * 它是**独立**的，不是更准的；它的价值在比对，不在单点准确度。
   */
  {
    id: 'mat/voltage-absolute-capacitor-record',
    name: 'Calculable Capacitor Absolute Voltage Record', name_zh: '可计算电容法的绝对电压记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 0.5, max: 10, unit: 'V' },
      { param: 'uncertainty', kind: 'range', min: 90, max: 160, unit: 'ppm', dir: 'atMost' },
      { param: 'anchor', kind: 'enum', values: ['length-time-mass'] },
      { param: 'method', kind: 'enum', values: ['calculable-capacitor'] },
    ],
  },

  /**
   * **两法比对记录：Δ = V_电压天平 − V_可计算电容，判据 60 ppm。**
   *
   * 字段：
   *   difference            |Δ|，0–300 ppm
   *   combinedUncertainty   √(u₁²+u₂²)，50–200 ppm
   *   criterion             60 ppm（工程一致判据）
   *   verdict               consistent / indeterminate / inconsistent
   *
   * 判据写死 60 ppm，但记录里同时写 combinedUncertainty：
   *   60 ppm 以内 → 一致；
   *   60–200 ppm → 不矛盾（1.5σ 内），但电容法的实际误差偏大；
   *   >200 ppm → 判错。
   * 只写 verdict 不写 combinedUncertainty，会把「工程目标」伪装成「统计结论」。
   */
  {
    id: 'mat/voltage-anchor-intercomparison-record',
    name: 'Two-Method Comparison Record', name_zh: '两法比对记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'difference', kind: 'range', min: 0, max: 300, unit: 'ppm' },
      { param: 'combinedUncertainty', kind: 'range', min: 50, max: 200, unit: 'ppm' },
      { param: 'criterion', kind: 'range', min: 60, max: 60, unit: 'ppm' },
      { param: 'verdict', kind: 'enum', values: ['consistent', 'indeterminate', 'inconsistent'] },
    ],
  },
];

export const DATA_ROUTES: readonly Route[] = [
  {
    /**
     * **可计算电容法测 10 V：C → R → I → V，八道工序。**
     *
     * ① **测 L/C**：激光干涉量 0.5 m 的轴向长度，C=ε₀ln2/πL=0.9768 pF；
     *    形状/端部 30 ppm。
     * ② **C 的 100:1 传递**：比率桥把 0.9768 pF 传到 97.68 pF 标准；
     *    比率误差 60–80 ppm。
     * ③ **R=1/(ωC_std)**：f=10 kHz（石英 10 ppm），R=162.94 kΩ；
     *    再经 1.63:1 与 100:1 两级标到 100 kΩ / 1 kΩ。
     * ④ **100 kΩ → 1 kΩ**：Hamon 100:1，自校 30 ppm。
     * ⑤ **电流天平测 I**：10 mA 时 F=5.15 mg（火星），dM/dx=0.1910 N/A²；
     *    I=√(F/dM/dx)，25 ppm。
     * ⑥ **V=I·R**：10 mA × 1 kΩ = 10 V；与基准 10 V 标称比，差即修正值。
     * ⑦ **传到 1/2/5/0.5 V**：基准内部分压 30 ppm；0.5 V 再串 10:1。
     * ⑧ **写记录**：C、C_std、R、I 四个中间量 + 不确定度 + anchor。
     *
     * 误差预算（设计值）：C 42 + 比率 70 + 频率 10 + R 传递 60 +
     * 电流天平 25 + 抽头 30 → 方和根 **110 ppm**；交付窗口 **90–160 ppm**。
     *
     * ⚠️ 三个条件：
     *   ① 0.5 V 档依赖 10:1 自校到 0.003 %（30 ppm）；只到 0.01 % 则 105 ppm。
     *   ② RH <40 %；0.9768 pF 在 10 kHz 下 16.3 MΩ，**0.0001 pF 的杂散是 100 ppm；
     *      0.00003 pF（0.03 fF）才是 30 ppm**；0.1 pF 是 10 %，必须靠保护驱动/屏蔽，
     *      不是靠「擦干净」。
     *   ③ 基准在 25.00 °C（mk-oven），电容/电流部分在 19–21 °C；两边温差用
     *      1 µV 热电势修正（10 V 上 0.1 ppm）。
     */
    id: 'measure/voltage-absolute-capacitor',
    name: 'Absolute Voltage Measurement by Calculable Capacitor Method', name_zh: '可计算电容法的绝对电压测量',
    rate: { hours: q(240) },
    produces: [
      {
        item: 'mat/voltage-absolute-capacitor-record',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 0.5, max: 10 },
          { param: 'uncertainty', kind: 'range', min: 100, max: 150 },
          { param: 'anchor', kind: 'enum', oneOf: ['length-time-mass'] },
          { param: 'method', kind: 'enum', oneOf: ['calculable-capacitor'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/hv-test-bench/standard-capacitor-100pf', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/standard-resistor-local', qty: q(2) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/standard-voltage-reference', qty: q(1) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/mk-oven',
      'plant/calculable-capacitor',
      'plant/voltage-balance',
      'plant/micro-balance',
      'plant/stabilized-laser',
      'plant/refractometer',
      'std/quartz-resonator-general',
      'std/counter-chip-general',
      'std/mass-standard-10g-si',
      'std/mass-weight-set-mg',
      'std/divider-10to1-precision',
      'std/divider-100to1-precision',
      'plant/probe-station/null-detector',
      'std/dvm-general',
      'plant/gauge-block',
      'std/gauge-block-reference',
    ],
    steps: [
      {
        note_zh:
          '测 L/C：激光干涉量两环隙距离 L=0.500000 m（20 nm）；C=ε₀ln2/πL=0.9768 pF，折射率修正 (n−1)L=1.27 µm（2.54 ppm）',
        performedBy: 'plant/laser-stage',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          'C 的 100:1 传递：比率桥把 0.9768 pF 对 100 pF 标准，10 kHz 指零；C_std=97.68 pF，比率误差 60–80 ppm',
        performedBy: 'plant/ratio-bridge',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          'R=1/(ωC_std)：f=10 kHz（石英 10 ppm），R=162.94 kΩ；经 1.63:1 与 100:1 两级，标到 100 kΩ 标准电阻',
        performedBy: 'plant/ratio-bridge',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '100 kΩ → 1 kΩ：Hamon 100:1 串/并自校（判据 0.003 % = 30 ppm）；1 kΩ 标准电阻定值',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '电流天平测 I：10 mA 通两线圈，F=19.10 µN=5.15 mg（火星）；微天平回零读力，I=√(F/dM/dx)，正反向各 3 次',
        performedBy: 'plant/current-balance',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          'V=I·R：10 mA × 1 kΩ = 10.000 V；与基准 10 V 标称比，差即绝对修正值（设计 110 ppm）；基准在 25.00 °C',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 24.99, max: 25.01 }],
      },
      {
        note_zh:
          '传到 1/2/5/0.5 V：基准内部分压 30 ppm；0.5 V 用 10:1 再分一次（30 ppm）；每档正反向各 3 次',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 24.99, max: 25.01 }],
      },
      {
        note_zh:
          '写记录：C=0.9768 pF、C_std=97.68 pF、R=162.94 kΩ、I=10 mA、V=10 V；不确定度 100–150 ppm、anchor=length-time-mass、method=calculable-capacitor；注明 0.5 V 依赖分压自校与 RH<40 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '无 kg 投入（电、纸、清洗剂不登条目）→ 记录 1 份；产物按份计，不进 kg 守恒。设计值 110 ppm（C 42 + 比率 70 + 频率 10 + R 传递 60 + 电流天平 25 + 抽头 30，方和根 109）；交付窗口 100–150 ppm，窗口上限 160 ppm。剩余缺口：0.5 V 依赖 10:1 自校 30 ppm；没有量子标准；两法共用初级量块/硅球',
  },

  {
    /**
     * **两法比对：电压天平 31 ppm vs 可计算电容 110 ppm。**
     *
     * 用两份记录：`mat/voltage-absolute-record`（电压天平，50–90 ppm）与
     * `mat/voltage-absolute-capacitor-record`（电容法，100–150 ppm）。
     *
     * 判据：
     *   |Δ| ≤ **60 ppm**              → consistent（工程一致）
     *   60 < |Δ| ≤ **200 ppm**        → indeterminate（不矛盾，1.5σ 内；电容法误差偏大）
     *   |Δ| > **200 ppm**             → inconsistent（判错）
     *
     * 为什么 60 ppm 是工程目标而不是统计判据：两法各 50–90 / 100–150 ppm，
     * 差值 1σ = √(u₁²+u₂²) ≈ **130 ppm**；60 ppm 比 1σ 还小。达到它是好消息，
     * 达不到不等于谁错。记录里 `combinedUncertainty` 与 `criterion` 分开写，
     * 就是这个意思。
     *
     * ⚠️ 两法共用初级长度（量块/激光）与质量（硅球）；如果初级标准本身有
     * 20 ppm 的共同偏差，比对查不出 —— 这是第二套也解决不了的第三层缺口。
     */
    id: 'measure/voltage-anchor-intercomparison',
    name: 'Two-Method Comparison', name_zh: '两法比对',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'mat/voltage-anchor-intercomparison-record',
        qty: q(1),
        gives: [
          { param: 'difference', kind: 'range', min: 0, max: 200 },
          { param: 'combinedUncertainty', kind: 'range', min: 90, max: 180 },
          { param: 'criterion', kind: 'range', min: 60, max: 60 },
          { param: 'verdict', kind: 'enum', oneOf: ['consistent', 'indeterminate', 'inconsistent'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/voltage-absolute-record', qty: q(1) }] },
      { anyOf: [{ item: 'mat/voltage-absolute-capacitor-record', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'std/dvm-general', 'plant/probe-station/null-detector'],
    steps: [
      {
        note_zh:
          '读两法 10 V 值：电压天平记录与电容法记录各取 10 V 档修正值；用同一台 DVM/指零读，避免读数链引入第二个偏差',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '算 Δ 与 u_c：Δ=V₁−V₂；u_c=√(u₁²+u₂²)（50–90 与 100–150 → 约 110–175 ppm）；按 60/200 ppm 两档判',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '写比对记录：difference、combinedUncertainty、criterion=60 ppm、verdict；|Δ|≤60 写 consistent，60–200 写 indeterminate（不矛盾、电容法误差偏大），>200 写 inconsistent',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '两份记录（数据）→ 比对记录 1；无材料消耗。difference 0–200 ppm、combinedUncertainty 90–180 ppm、criterion 固定 60 ppm；verdict 按 60/200 两档',
  },
];
