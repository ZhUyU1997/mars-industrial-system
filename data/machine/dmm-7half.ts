/**
 * 7½ 位 DMM —— 把 6½ 位的 35–100 ppm 推到 3.5–10 ppm，三处同时换。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、7½ 位是多少
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 7½ 位 = **20 000 000 个数**（20 000 000 个 LSB 覆盖 10 V 档）：
 *
 *   10 V / 20 000 000 = **0.5 µV** = 0.05 ppm
 *
 * 6½ 位是 2 000 000 个数、5 µV；7½ 位比它多 10 倍分辨、10 倍准确度。
 * 3.5–10 ppm = 0.00035–0.001 %，不是 6½ 位的 0.0035–0.01 %。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、三处同时换，少一处就回到 6½
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① 分压：20 ppm → **0.1–0.3 ppm**
 *      `plant/hamon-divider-7half`：10×100 Ω 串联 / 10 只并联，1:100 自校。
 *      比值误差 0.1–0.3 ppm，tempco 0.1–0.5 ppm/K；进 ±0.01 K 油浴后
 *      温度项 0.001–0.005 ppm，可忽略。
 *
 *   ② ADC INL：1–10 ppm → **0.2–0.5 ppm**
 *      `plant/adc-28bit-inl`：24 位 ΣΔ + 多斜率/斩波 + 分段校准；
 *      28 位分辨、INL 0.2–0.5 ppm、噪声 0.1–0.3 ppm、1–100 S/s。
 *      28 位 LSB（±1 V）= 7.45 nV；噪声 100–300 nV 对应 ENOB 21.5–23.5。
 *
 *   ③ 基准年漂：2–20 ppm/a → **0.5–1 ppm/a**
 *      `std/zener-reference-7half`：现有精密齐纳 + 二级温控 ±0.005 K
 *      + 1000 h 老化筛选；tempco 0.5–2 ppm/K，年漂 0.5–1 ppm/a。
 *
 * 三处 RSS（把 Hamon 自校残差 0.1–0.3 ppm 也算进去）：
 *
 *   √(0.6² + 0.5² + 1.0² + 0.3²) = √1.70 = **1.30 ppm**
 *   取 0.6/0.5/1.0/0.1 ⇒ √1.62 = **1.27 ppm**
 *
 * 再加线性/噪声（2–9 ppm 的增益/线性残差 + 0.1–0.3 ppm 噪声）：
 *
 *   √(1.3² + 3² + 0.3²) = **3.3 ppm**（低端）
 *   高端取 1.3² + 9² + 0.3² ⇒ **9.1 ppm**，窗口 **3.5–10 ppm**
 *
 * 所以 3.5 ppm 不是单点：它是三处都挑到最好 + 线性残差 ≤3 ppm 时的下限；
 * 10 ppm 是量产窗口的上限。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、油浴：顺手补 L/R 桥臂的缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `plant/precision-oil-bath`：20–30 °C、±0.01 K、三只 Pt RTD、15–30 L。
 * 它复用 `plant/mk-oven/bath`、`heater`、`controller`、`bridge` 与
 * `plant/mfc/rtd-pair`；油是一次性装填 10–20 L（本层没有油条目，按外购
 * 耗材计，不进闭包）。Hamon 分压和 7½ 的标定都泡在这只浴里。
 *
 * 旧 6½ 路线保留：`make/dmm-6half` 仍产 `std/dmm-6half-general`；
 * 7½ 只多一条 `make/dmm-7half`，不改 6½。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DMM_7HALF_ITEMS: readonly Item[] = [
  /**
   * 精密恒温油浴。**20–30 °C、±0.01 K、15–30 L、三只 Pt RTD。**
   *
   * 复用 mk-oven 的 bath/heater/controller/bridge；三只 Pt RTD 取自
   * `plant/mfc/rtd-pair`（2 对 = 4 只，3 只用、1 只备）。
   */
  {
    id: 'plant/precision-oil-bath',
    name: 'Precision Temperature-Controlled Oil Bath', name_zh: '精密恒温油浴',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'temperature', min: 20, max: 30 }],
    props: [
      { param: 'temperature', kind: 'range', min: 20, max: 30, unit: '°C' },
      { param: 'measure/stability', kind: 'range', min: 0.005, max: 0.02, unit: 'K', dir: 'atMost' },
      { param: 'uniformity', kind: 'range', min: 0.005, max: 0.02, unit: 'K', dir: 'atMost' },
      { param: 'volume', kind: 'range', min: 10, max: 30, unit: 'L' },
      { param: 'rtdCount', kind: 'range', min: 3, max: 3, unit: '只' },
      { param: 'rtdAccuracy', kind: 'range', min: 0.01, max: 0.05, unit: 'K', dir: 'atMost' },
    ],
  },

  /**
   * Hamon 传递标准。**10×100 Ω 串联 / 10 只并联，1:100 自校 0.1–0.3 ppm。**
   *
   *   ratio 100:1、ratioError 0.1–0.3 ppm、tempco 0.1–0.5 ppm/K
   *   10 只等值电阻、自校残差 0.1–0.3 ppm
   */
  {
    id: 'plant/hamon-divider-7half',
    name: 'Hamon Transfer Standard', name_zh: 'Hamon 传递标准',
    unit: '件',
    category: 'part',
    props: [
      { param: 'ratio', kind: 'range', min: 100, max: 100, unit: '1' },
      { param: 'ratioError', kind: 'range', min: 0.1, max: 0.3, unit: 'ppm', dir: 'atMost' },
      { param: 'tempco', kind: 'range', min: 0.1, max: 0.5, unit: 'ppm/K', dir: 'atMost' },
      { param: 'resistance', kind: 'range', min: 10, max: 1000, unit: 'Ω' },
      { param: 'selfCal', kind: 'range', min: 0.1, max: 0.3, unit: 'ppm', dir: 'atMost' },
      { param: 'resistors', kind: 'range', min: 10, max: 10, unit: '只' },
      { param: 'power', kind: 'range', min: 0.01, max: 0.1, unit: 'W' },
    ],
  },

  /**
   * 28 位 ADC。**INL 0.2–0.5 ppm、噪声 0.1–0.3 ppm、1–100 S/s。**
   *
   * 24 位 ΣΔ + 多斜率/斩波 + 分段校准；28 位 LSB（±1 V）= 7.45 nV，
   * 噪声 100–300 nV 对应 ENOB 21.5–23.5。
   */
  {
    id: 'plant/adc-28bit-inl',
    name: '28-Bit ADC', name_zh: '28 位 ADC',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 28, max: 28, unit: 'bit' },
      { param: 'inl', kind: 'range', min: 0.2, max: 0.5, unit: 'ppm', dir: 'atMost' },
      { param: 'noise', kind: 'range', min: 0.1, max: 0.3, unit: 'ppm', dir: 'atMost' },
      { param: 'sampleRate', kind: 'range', min: 1, max: 100, unit: 'S/s' },
      { param: 'inputRange', kind: 'range', min: 0.5, max: 1, unit: 'V' },
      { param: 'enob', kind: 'range', min: 21.5, max: 23.5, unit: 'bit' },
    ],
  },

  /**
   * 7½ 基准。**齐纳 + 二级温控 ±0.005 K + 1000 h 老化。**
   *
   *   voltage 6.6–7.1 V、tempco 0.5–2 ppm/K、drift 0.5–1 ppm/a
   *   ovenStability 0.005–0.01 K、aging 1000 h
   */
  {
    id: 'std/zener-reference-7half',
    name: '7½-Digit Voltage Reference', name_zh: '7½ 位电压基准',
    unit: '件',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 6.5, max: 7.5, unit: 'V' },
      { param: 'tempco', kind: 'range', min: 0.5, max: 2, unit: 'ppm/K', dir: 'atMost' },
      { param: 'drift', kind: 'range', min: 0.5, max: 1, unit: 'ppm/a', dir: 'atMost' },
      { param: 'ovenStability', kind: 'range', min: 0.005, max: 0.01, unit: 'K', dir: 'atMost' },
      { param: 'agingHours', kind: 'range', min: 1000, max: 1000, unit: 'h', dir: 'atLeast' },
    ],
  },

  /**
   * 7½ 输入前端。**>10 GΩ、10–100 pA、CMRR 120–140 dB、1000–1500 V 保护。**
   *
   * 低漏输入复用 `plant/cmos-test/parameter-analyzer/low-leak-input`；
   * 6½ 前端只到 CMRR 120，7½ 要 120–140，所以另建一件，不硬拔 6½。
   */
  {
    id: 'plant/dmm-7half/input-front-end',
    name: '7½-Digit Input Front End', name_zh: '7½ 输入前端',
    unit: '件',
    category: 'part',
    props: [
      { param: 'inputImpedance', kind: 'range', min: 1e10, max: 1e13, unit: 'Ω', dir: 'atLeast' },
      { param: 'biasCurrent', kind: 'range', min: 1e-13, max: 1e-9, unit: 'A', dir: 'atMost' },
      { param: 'cmrr', kind: 'range', min: 120, max: 140, unit: 'dB', dir: 'atLeast' },
      { param: 'protection', kind: 'range', min: 1000, max: 1500, unit: 'V' },
      { param: 'ranges', kind: 'range', min: 5, max: 8, unit: '档' },
    ],
  },

  /**
   * 7½ 位 DMM。**7½ 位（20 000 000 个数）、0.1 µV–1000 V、
   * accuracy 3.5–10 ppm、resolution 0.5 µV @10 V、>10 GΩ、CMRR 120–140 dB。**
   */
  {
    id: 'std/dmm-7half-general',
    name: '7½-Digit Digital Multimeter', name_zh: '7½ 位数字万用表',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'digits', kind: 'range', min: 7.5, max: 7.5, unit: '位' },
      { param: 'voltage', kind: 'range', min: 1e-7, max: 1000, unit: 'V' },
      { param: 'accuracy', kind: 'range', min: 0.00035, max: 0.001, unit: '%', dir: 'atMost' },
      { param: 'resolution10V', kind: 'range', min: 0.1, max: 1, unit: 'µV', dir: 'atMost' },
      { param: 'inputImpedance', kind: 'range', min: 1e10, max: 1e13, unit: 'Ω', dir: 'atLeast' },
      { param: 'biasCurrent', kind: 'range', min: 1e-13, max: 1e-9, unit: 'A', dir: 'atMost' },
      { param: 'cmrr', kind: 'range', min: 120, max: 140, unit: 'dB', dir: 'atLeast' },
      { param: 'counts', kind: 'range', min: 2e7, max: 2e7, unit: '个' },
      { param: 'protection', kind: 'range', min: 1000, max: 1500, unit: 'V' },
      // 板级热电势的窗口：0.1–1 µV 分辨 + 换向平均；0.1–3 µV 覆盖 ≤2 µV 的残余
      { param: 'thermalEmf', kind: 'range', min: 0.1, max: 3, unit: 'µV' },
    ],
  },
];

export const DMM_7HALF_ROUTES: readonly Route[] = [
  /**
   * 油浴：mk-oven 的 bath/heater/controller/bridge + 2 对 Pt RTD + 保温。
   *
   *   bath 1 + heater 1 + controller 1 + bridge 1 + RTD 对 2 + 不锈钢 2
   *   + 铜 1 + 矿棉 1 + PTFE 0.5 + 接触器 1 → 油浴 1 台
   */
  {
    id: 'make/precision-oil-bath',
    name: 'Precision Temperature-Controlled Oil Bath Manufacturing', name_zh: '精密恒温油浴制造',
    produces: [
      {
        item: 'plant/precision-oil-bath',
        qty: q(1),
        gives: [
          { param: 'temperature', kind: 'range', min: 20, max: 30 },
          { param: 'measure/stability', kind: 'range', min: 0.005, max: 0.01 },
          { param: 'uniformity', kind: 'range', min: 0.005, max: 0.01 },
          { param: 'volume', kind: 'range', min: 15, max: 30 },
          { param: 'rtdCount', kind: 'range', min: 3, max: 3 },
          { param: 'rtdAccuracy', kind: 'range', min: 0.01, max: 0.03 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/mk-oven/bath', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mk-oven/heater', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mk-oven/controller', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mk-oven/bridge', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mfc/rtd-pair', qty: q(2) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 2) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(40) },
    unbalanced_zh:
      'bath 1 + heater 1 + controller 1 + bridge 1 + RTD 对 2 + 不锈钢 2 + 铜 1 + 矿棉 1 + PTFE 0.5 + 接触器 1 → 油浴 1 台；按件计。油是一次性装填 10–20 L，本层没有油条目，按外购耗材计，不进闭包。±0.01 K 是设计值，用三只 Pt RTD 互查',
  },

  /**
   * Hamon 分压：10 只 100 Ω 电阻 + 串并联换接 + 油浴自校。
   *
   *   电阻丝 0.02 + 氧化铝 0.2 + 铜 0.1 + 金 0.001 + PTFE 0.05 → 分压 1
   */
  {
    id: 'make/hamon-divider-7half',
    name: 'Hamon Transfer Standard Manufacturing', name_zh: 'Hamon 传递标准制造',
    produces: [
      {
        item: 'plant/hamon-divider-7half',
        qty: q(1),
        gives: [
          { param: 'ratio', kind: 'range', min: 100, max: 100 },
          { param: 'ratioError', kind: 'range', min: 0.1, max: 0.3 },
          { param: 'tempco', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'resistance', kind: 'range', min: 10, max: 1000 },
          { param: 'selfCal', kind: 'range', min: 0.1, max: 0.3 },
          { param: 'resistors', kind: 'range', min: 10, max: 10 },
          { param: 'power', kind: 'range', min: 0.01, max: 0.1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 20) }] },
    ],
    needs: ['plant/precision-oil-bath', 'plant/metrology-room'],
    steps: [
      { note_zh: '绕 10 只 100 Ω 电阻：同一卷电阻丝、同一骨架，逐只调到彼此相等 0.1–0.3 ppm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装串/并联换接：串联 1 kΩ、并联 10 Ω，1:100 自校；引线四端，接点热电势 ≤0.1 µV', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '进油浴：25.00 ±0.01 °C，三只 Pt RTD 互查；泡 2 h 后读比值', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 25, max: 25.01 }] },
      { note_zh: '自校 1:100：串两次 10:1 与并联 100:1 比，残差 0.1–0.3 ppm；超了重调', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(120) },
    unbalanced_zh:
      '电阻丝 0.02 + 氧化铝 0.2 + 铜 0.1 + 金 0.001 + PTFE 0.05 → Hamon 分压 1；余是绕线/骨架/引线废料。0.1–0.3 ppm 是自校残差，不是绝对精度；绝对比值仍靠油浴里的 100:1 传递',
  },

  /**
   * 28 位 ADC：24 位 ΣΔ + 多斜率/斩波 + 分段校准。
   *
   *   24 位 ADC 1 + 运放 4 + 电阻 20 + 电容 4 + 控制板 1 + PCB 2
   *   + 铜线 0.5 + 铝 1 → 28 位 ADC 1
   */
  {
    id: 'make/adc-28bit-inl',
    name: '28-Bit ADC Manufacturing', name_zh: '28 位 ADC 制造',
    produces: [
      {
        item: 'plant/adc-28bit-inl',
        qty: q(1),
        gives: [
          { param: 'resolution', kind: 'range', min: 28, max: 28 },
          { param: 'inl', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'noise', kind: 'range', min: 0.1, max: 0.3 },
          { param: 'sampleRate', kind: 'range', min: 1, max: 100 },
          { param: 'inputRange', kind: 'range', min: 0.5, max: 1 },
          { param: 'enob', kind: 'range', min: 21.5, max: 23.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/cmos-test/parameter-analyzer/adc-24bit', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/chip-resistor-general', qty: q(20) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '在 24 位 ΣΔ 后加多斜率残差与斩波：把 1/f 与失调推到 0.1–0.3 ppm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '分段校准：0–1 V 分 16 段，每段 256 点，拟合 INL 0.2–0.5 ppm；存校准表', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '噪声测试：短路输入 1000 点，σ 0.1–0.3 ppm；采样 1–100 S/s', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(120) },
    unbalanced_zh:
      '24 位 ADC 1 + 运放 4 + 电阻 20 + 电容 4 + 控制板 1 + PCB 2 + 铜线 0.5 + 铝 1 → 28 位 ADC 1；按件计。28 位 LSB（±1 V）= 7.45 nV；噪声 100–300 nV 对应 ENOB 21.5–23.5，所以 28 位是分辨、不是有效位',
  },

  /**
   * 7½ 基准：现有精密齐纳 + 二级温控 + 1000 h 老化。
   *
   *   精密齐纳 1 + 内层铜块 1 + 热敏 1 + 电桥 1 + 控制器 1
   *   + 铜 0.5 + PTFE 0.05 + 铝 0.2 → 7½ 基准 1
   */
  {
    id: 'make/zener-reference-7half',
    name: '7½-Digit Voltage Reference Manufacturing', name_zh: '7½ 位电压基准制造',
    produces: [
      {
        item: 'std/zener-reference-7half',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 6.6, max: 7.1 },
          { param: 'tempco', kind: 'range', min: 0.5, max: 2 },
          { param: 'drift', kind: 'range', min: 0.5, max: 1 },
          { param: 'ovenStability', kind: 'range', min: 0.005, max: 0.01 },
          { param: 'agingHours', kind: 'range', min: 1000, max: 1000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/zener-reference-precision', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mk-oven/inner', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mk-oven/thermistor', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mk-oven/bridge', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mk-oven/controller', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
    ],
    needs: ['plant/mk-oven', 'plant/metrology-room'],
    steps: [
      { note_zh: '把精密齐纳压在铜块上，装二级温控：热敏 + 电桥 + 控制器，25.00 ±0.005 K', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '老化 1000 h：45.00 °C、1 mA；前 100 h 每 10 h 记，后 900 h 每 100 h 记', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 44.99, max: 45.01 }] },
      { note_zh: '筛选：1000 h 后漂 ≤1 ppm/a 的收；tempco 0.5–2 ppm/K；写电压/漂移/ovenStability', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(1100) },
    unbalanced_zh:
      '精密齐纳 1 + 内层铜块 1 + 热敏 1 + 电桥 1 + 控制器 1 + 铜 0.5 + PTFE 0.05 + 铝 0.2 → 7½ 基准 1；按件计。1000 h 老化是工时，不是材料；0.5–1 ppm/a 是筛选后设计值',
  },

  /**
   * 7½ 输入前端：低漏管 + 四运放 + 精密电阻 + 保护环。
   *
   *   低漏管 1 + 运放 4 + 电阻 20 + PTFE 0.02 + 铜 0.01 + 金 0.001
   *   + 铝 0.5 → 前端 1
   */
  {
    id: 'make/dmm-7half-input-front-end',
    name: '7½-Digit Input Front End Manufacturing', name_zh: '7½ 输入前端制造',
    produces: [
      {
        item: 'plant/dmm-7half/input-front-end',
        qty: q(1),
        gives: [
          { param: 'inputImpedance', kind: 'range', min: 2e10, max: 1e11 },
          { param: 'biasCurrent', kind: 'range', min: 1e-11, max: 1e-10 },
          { param: 'cmrr', kind: 'range', min: 120, max: 140 },
          { param: 'protection', kind: 'range', min: 1000, max: 1500 },
          { param: 'ranges', kind: 'range', min: 6, max: 6 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/cmos-test/parameter-analyzer/low-leak-input', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/chip-resistor-general', qty: q(20) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(32) },
    unbalanced_zh:
      '低漏管 1 + 运放 4 + 电阻 20 + PTFE 0.02 + 铜 0.01 + 金 0.001 + 铝 0.5 → 前端 1；余是屏蔽盒/保护环。CMRR 120–140 dB 比 6½ 的 100–120 高 20 dB，靠保护环与共模反馈',
  },

  /**
   * 7½ 整机：前端 + 28 位 ADC + Hamon 分压 + 7½ 基准 + 计算机。
   *
   *   前端 1 + ADC 1 + Hamon 1 + 基准 1 + 控制板 1 + 计算机 1 + DVM 1
   *   + PCB 1 + 铝 1 + 铜线 0.5 + PTFE 0.05 → DMM 1 台
   */
  {
    id: 'make/dmm-7half',
    name: '7½-Digit Digital Multimeter Manufacturing', name_zh: '7½ 位数字万用表制造',
    produces: [
      {
        item: 'std/dmm-7half-general',
        qty: q(1),
        gives: [
          { param: 'digits', kind: 'range', min: 7.5, max: 7.5 },
          { param: 'voltage', kind: 'range', min: 1e-7, max: 1000, record: 'mat/dmm-7half-cal-record' },
          { param: 'accuracy', kind: 'range', min: 0.00035, max: 0.001, record: 'mat/dmm-7half-cal-record' },
          { param: 'resolution10V', kind: 'range', min: 0.5, max: 0.5 },
          { param: 'inputImpedance', kind: 'range', min: 2e10, max: 1e11 },
          { param: 'biasCurrent', kind: 'range', min: 1e-11, max: 1e-10 },
          { param: 'cmrr', kind: 'range', min: 120, max: 140 },
          { param: 'counts', kind: 'range', min: 2e7, max: 2e7 },
          { param: 'protection', kind: 'range', min: 1000, max: 1500 },
          { param: 'thermalEmf', kind: 'range', min: 0.1, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/dmm-7half/input-front-end', qty: q(1) }] },
      { anyOf: [{ item: 'plant/adc-28bit-inl', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hamon-divider-7half', qty: q(1) }] },
      { anyOf: [{ item: 'std/zener-reference-7half', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/computer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 20) }] },
    ],
    needs: ['plant/precision-oil-bath', 'plant/metrology-room'],
    steps: [
      { note_zh: '装输入前端与 28 位 ADC：保护环、50 mm 屏蔽、分段校准表进固件', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装 Hamon 分压与 7½ 基准：两者都进油浴 25.00 ±0.01 °C；基准 6.85 V → 分压 0.685 V', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 25, max: 25.01 }] },
      { note_zh: '标定：0–1 V 16 段、10 点/段；INL 0.2–0.5 ppm；再做 10 V/100 V/1000 V 档传递', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '检验：输入 20–100 GΩ、偏置 10–100 pA、CMRR 120–140 dB、1000 V 保护；写 3.5–10 ppm 证书', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(160) },
    unbalanced_zh:
      '前端 1 + ADC 1 + Hamon 1 + 基准 1 + 控制板 1 + 计算机 1 + DVM 1 + PCB 1 + 铝 1 + 铜线 0.5 + PTFE 0.05 → DMM 1 台；按件计。7½ 位、0.5 µV@10 V、3.5–10 ppm 是设计/校准窗口；三处 RSS 1.3 ppm + 线性/噪声到 3.5–10 ppm',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...DMM_7HALF_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...DMM_7HALF_ROUTES];
