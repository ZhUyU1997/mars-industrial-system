/**
 * 1 GHz 示波器 + 1 GHz 探头 —— 把 UHF 局放链的时间分辨从 2 ns 推到 <0.5 ns。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、旧账：2 ns 是从哪来的
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 旧链只有 500 MHz 带宽、1 m 长探头/电缆：
 *
 *   t_r = 0.35 / B = 0.35 / 0.5 GHz = **0.70 ns**（示波器本身）
 *   1 m 电缆 @1 GHz 约 1–2 dB，边沿再慢 0.2–0.4 ns
 *   源/触发抖动 0.5–2 ns
 *   ⇒ 系统 2 ns 级
 *
 * 本文件建 1 GHz 示波器 + ≤0.3 m 探头：
 *
 *   B = 1 GHz ⇒ t_r = 0.35 / 1 GHz = **350 ps**
 *   探头/电缆 0.3 m @1 GHz 损耗 **0.8–1.5 dB/m × 0.3 m = 0.24–0.45 dB**，
 *   回波损耗 >15 dB
 *   系统 RSS：sqrt(0.30² + 0.10² + 0.10²) = **0.33 ns**（≤0.5 ns）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、采样与抖动：5–10 GS/s 是等效采样
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ADC 是 2–4 GS/s、8 bit；时基复用 `plant/uhf-digitizer/timebase`
 * （2–4 GHz、抖动 0.3–0.8 ps、步进 1–5 ps）。两片 ADC 交错 + 步进延迟：
 *
 *   实时 2–4 GS/s（250–500 ps/点）
 *   等效 5–10 GS/s（100–200 ps/点，步进 1–5 ps 再细分）
 *   0.5 ns 窗口有 2.5–5 个等效点；0.2–0.5 ns 的时间分辨靠步进，不靠实时率
 *
 * 抖动预算：
 *
 *   时基抖动 0.3–0.8 ps
 *   触发/源抖动 1–10 ps
 *   8 bit 量化在 350 ps 边沿上的时间误差：0.4 % × 350 ps = 1.4 ps
 *   ⇒ 系统 **1–10 ps rms**；10 ps 对 350 ps 是 2.9 %，对 1 GHz 周期是 0.36°
 *
 * 所以 <0.5 ns 的时间分辨不是采样率硬撑出来的：5 GS/s 的 200 ps 已经够
 * 2.5 点/0.5 ns；真正决定 0.2–0.5 ns 的是**步进延迟与抖动**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、复用与新建
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 复用：
 *   `std/uhf-lna-general`              前端放大（300–1500 MHz、35–42 dB、NF 0.8–1.3 dB）
 *   `plant/uhf-digitizer/comparator`   8 bit flash 的比较器（3–5 GS/s，255 只/片）
 *   `plant/uhf-digitizer/timebase`     2–4 GHz、0.3–0.8 ps 抖动、1–5 ps 步进
 *
 * 新建：
 *   `plant/scope-1ghz/frontend`        1 GHz 输入、50 Ω、1–10× 衰减
 *   `plant/scope-1ghz/sample-hold`     孔径 50–100 ps、带宽 1.5–2 GHz
 *   `plant/scope-1ghz/adc`             8 bit、2–4 GS/s、ENOB 6.5–7.5
 *   `plant/scope-1ghz`                 整机：1 GHz、5–10 GS/s 等效、≤350 ps
 *   `plant/uhf-probe`                  ≤0.3 m、50 Ω、回波损耗 >15 dB
 *   `plant/scope-1ghz/step-source`     50–150 ps 阶跃源（测系统上升时间用）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、测量记录
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `measure/uhf-pd-response` → `mat/uhf-pd-response-record`：
 * systemRiseTime **0.3–0.5 ns**、bandwidth 1–1.2 GHz、timeResolution 0.2–0.5 ns、
 * jitter 1–10 ps、sampleRate 5–10 GS/s。
 *
 * ⚠️ grep 全表没有 `measure/uhf-pd-response`（0 条），本文件按任务新建；
 * 若别的 agent 也建了同 id，合并时只保留一个，并把 gives 统一到 0.3–0.5 ns。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const SCOPE_1GHZ_ITEMS: readonly Item[] = [
  /**
   * 1 GHz 数字示波器。**1 GHz、5–10 GS/s 等效、8 bit、≤350 ps、抖动 1–10 ps。**
   *
   *   bandwidth       1–1.2 GHz
   *   sampleRate      5–10 GS/s（等效；实时 2–4 GS/s × 2 片交错）
   *   resolution      8 bit
   *   riseTime        0.25–0.30 ns（单机）
   *   systemRiseTime  0.3–0.5 ns（含探头/阶跃源）
   *   timeResolution  0.2–0.5 ns
   *   jitter          1–10 ps rms
   *   channels        2
   *   inputImpedance  50 Ω
   *   inputRange      1–10 Vpp
   */
  {
    id: 'plant/scope-1ghz',
    name: '1 GHz Digital Oscilloscope', name_zh: '1 GHz 数字示波器',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/bandwidth', kind: 'range', min: 0.8, max: 1.2, unit: 'GHz' },
      { param: 'measure/sampleRate', kind: 'range', min: 5, max: 10, unit: 'GS/s', dir: 'atLeast' },
      { param: 'measure/resolution', kind: 'range', min: 8, max: 8, unit: 'bit' },
      { param: 'riseTime', kind: 'range', min: 0.25, max: 0.35, unit: 'ns', dir: 'atMost' },
      { param: 'measure/systemRiseTime', kind: 'range', min: 0.3, max: 0.5, unit: 'ns', dir: 'atMost' },
      { param: 'measure/timeResolution', kind: 'range', min: 0.2, max: 0.5, unit: 'ns', dir: 'atMost' },
      { param: 'measure/jitter', kind: 'range', min: 1, max: 10, unit: 'ps', dir: 'atMost' },
      { param: 'channels', kind: 'range', min: 1, max: 2, unit: '路' },
      { param: 'inputImpedance', kind: 'range', min: 45, max: 55, unit: 'Ω' },
      { param: 'inputRange', kind: 'range', min: 1, max: 10, unit: 'Vpp' },
    ],
  },

  /**
   * 1 GHz 前端：复用 `std/uhf-lna-general` + 1–10× 衰减 + 50 Ω 终端。
   *
   *   bandwidth 1–1.5 GHz、gain 20–40 dB、S21 20–40 dB、
   *   NF 1–1.5 dB、input 50 Ω、maxInput 5 Vpp；S21 用 `std/vna-3ghz` 测
   */
  {
    id: 'plant/scope-1ghz/frontend',
    name: '1 GHz Front End', name_zh: '1 GHz 前端',
    unit: '件',
    category: 'part',
    props: [
      { param: 'bandwidth', kind: 'range', min: 0.8, max: 1.5, unit: 'GHz' },
      { param: 'gain', kind: 'range', min: 20, max: 40, unit: 'dB' },
      { param: 's21', kind: 'range', min: 20, max: 40, unit: 'dB' },
      { param: 'noiseFigure', kind: 'range', min: 1, max: 2, unit: 'dB', dir: 'atMost' },
      { param: 'inputImpedance', kind: 'range', min: 45, max: 55, unit: 'Ω' },
      { param: 'maxInput', kind: 'range', min: 1, max: 10, unit: 'Vpp' },
      { param: 'attenuation', kind: 'range', min: 1, max: 10, unit: '×' },
    ],
  },

  /**
   * 高速采样保持。**孔径 50–100 ps、带宽 1.5–2 GHz、保持压降 0.2–0.5 mV/µs。**
   *
   * 四只肖特基桥 + 2 pF 保持电容；50–100 ps 孔径把 350 ps 边沿采到 3–7 点。
   */
  {
    id: 'plant/scope-1ghz/sample-hold',
    name: '1 GHz Digital Oscilloscope High-Speed Sample-and-Hold', name_zh: '1 GHz 数字示波器高速采样保持',
    unit: '件',
    category: 'part',
    props: [
      { param: 'aperture', kind: 'range', min: 0.05, max: 0.15, unit: 'ns', dir: 'atMost' },
      { param: 'bandwidth', kind: 'range', min: 1.5, max: 2, unit: 'GHz', dir: 'atLeast' },
      { param: 'droop', kind: 'range', min: 0.1, max: 1, unit: 'mV/µs', dir: 'atMost' },
      { param: 'pedestal', kind: 'range', min: 1, max: 10, unit: 'mV', dir: 'atMost' },
      { param: 'inputRange', kind: 'range', min: 0.5, max: 1, unit: 'V' },
    ],
  },

  /**
   * 8 bit flash ADC。**2–4 GS/s、ENOB 6.5–7.5、255 只比较器 + 电阻梯 + 编码。**
   *
   * 复用 `plant/uhf-digitizer/comparator`（3–5 GS/s）做 255 只比较器；
   * 两片交错到 5–8 GS/s，再由时基步进补到 5–10 GS/s 等效。
   */
  {
    id: 'plant/scope-1ghz/adc',
    name: '1 GHz Oscilloscope ADC', name_zh: '1 GHz 示波器 ADC',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 8, max: 8, unit: 'bit' },
      { param: 'sampleRate', kind: 'range', min: 2, max: 4, unit: 'GS/s' },
      { param: 'enob', kind: 'range', min: 6.5, max: 7.5, unit: 'bit' },
      { param: 'inputRange', kind: 'range', min: 0.5, max: 1, unit: 'V' },
      { param: 'bandwidth', kind: 'range', min: 1.5, max: 2, unit: 'GHz' },
      { param: 'comparators', kind: 'range', min: 255, max: 255, unit: '只' },
    ],
  },

  /**
   * 1 GHz 探头/同轴。**≤0.3 m、50 Ω、回波损耗 >15 dB、电缆损耗 0.8–1.2 dB/m @1 GHz。**
   *
   * 0.3 m 的损耗 = 0.24–0.36 dB；探头尖端电容 0.5–1.5 pF。
   * 回波/损耗用 `std/vna-3ghz` 测（10 MHz–3 GHz，S11 0.05–0.2 dB）。
   */
  {
    id: 'plant/uhf-probe',
    name: '1 GHz Probe/Coaxial', name_zh: '1 GHz 探头/同轴',
    unit: '件',
    category: 'part',
    props: [
      { param: 'length', kind: 'range', min: 0.1, max: 0.3, unit: 'm', dir: 'atMost' },
      { param: 'impedance', kind: 'range', min: 45, max: 55, unit: 'Ω' },
      { param: 'returnLoss', kind: 'range', min: 15, max: 30, unit: 'dB', dir: 'atLeast' },
      { param: 'bandwidth', kind: 'range', min: 1, max: 1.5, unit: 'GHz', dir: 'atLeast' },
      { param: 'capacitance', kind: 'range', min: 0.5, max: 2, unit: 'pF', dir: 'atMost' },
      { param: 'cableLoss', kind: 'range', min: 0.5, max: 2, unit: 'dB/m', dir: 'atMost' },
    ],
  },

  /**
   * 快阶跃源。**50–150 ps、1–10 V、1–100 kHz、抖动 1–10 ps。**
   *
   * 用 SiGe HBT 的雪崩模式（Vceo 3.5–5 V 上过压 10–20 %）产生 <150 ps 沿；
   * 用来测 scope+probe 的系统上升时间，不依赖 0.5–2 ns 的火花源。
   */
  {
    id: 'plant/scope-1ghz/step-source',
    name: '1 GHz Digital Oscilloscope Fast Step Source', name_zh: '1 GHz 数字示波器快阶跃源',
    unit: '件',
    category: 'part',
    props: [
      { param: 'riseTime', kind: 'range', min: 0.05, max: 0.15, unit: 'ns', dir: 'atMost' },
      { param: 'amplitude', kind: 'range', min: 1, max: 10, unit: 'V' },
      { param: 'repetition', kind: 'range', min: 1, max: 100, unit: 'kHz' },
      { param: 'jitter', kind: 'range', min: 1, max: 10, unit: 'ps', dir: 'atMost' },
    ],
  },

];

export const SCOPE_1GHZ_ROUTES: readonly Route[] = [
  /**
   * 前端：LNA + 衰减 + 50 Ω 终端 + 屏蔽。
   *
   *   LNA 1 + 电阻 10 + PTFE 0.01 + 铜 0.1 + 铝 0.5 → 前端 1
   */
  {
    id: 'make/scope-frontend',
    name: '1 GHz Front End Manufacturing', name_zh: '1 GHz 前端制造',
    produces: [
      {
        item: 'plant/scope-1ghz/frontend',
        qty: q(1),
        gives: [
          { param: 'bandwidth', kind: 'range', min: 1, max: 1.5 },
          { param: 'gain', kind: 'range', min: 20, max: 40 },
          { param: 's21', kind: 'range', min: 20, max: 40 },
          { param: 'noiseFigure', kind: 'range', min: 1, max: 1.5 },
          { param: 'inputImpedance', kind: 'range', min: 45, max: 55 },
          { param: 'maxInput', kind: 'range', min: 1, max: 5 },
          { param: 'attenuation', kind: 'range', min: 1, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/uhf-lna-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/chip-resistor-general', qty: q(10) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room', 'std/vna-3ghz'],
    rate: { hours: q(16) },
    steps: [
      { note_zh: '装 LNA/衰减/50 Ω 终端与屏蔽；用 std/vna-3ghz 测 S21 20–40 dB、1–1.5 GHz、回波 >10 dB', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh:
      'LNA 1 + 电阻 10 + PTFE 0.01 + 铜 0.1 + 铝 0.5 → 前端 1；余是屏蔽盒边角。1–1.5 GHz、S21 20–40 dB、NF 1–1.5 dB 是设计值，用 std/vna-3ghz 测',
  },

  /**
   * 采样保持：四只肖特基桥 + 2 pF 保持电容 + 缓冲。
   *
   *   肖特基 4 + 电容 2 + 电阻 8 + PTFE 0.01 + 铝 0.2 + 铜 0.05 + PCB 1 → 采样保持 1
   */
  {
    id: 'make/scope-sample-hold',
    name: '1 GHz Digital Oscilloscope High-Speed Sample-and-Hold Manufacturing', name_zh: '1 GHz 数字示波器高速采样保持制造',
    produces: [
      {
        item: 'plant/scope-1ghz/sample-hold',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'bandwidth', kind: 'range', min: 1.5, max: 2 },
          { param: 'droop', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'pedestal', kind: 'range', min: 2, max: 5 },
          { param: 'inputRange', kind: 'range', min: 0.5, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/schottky-diode-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/chip-resistor-general', qty: q(8) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(24) },
    unbalanced_zh:
      '肖特基 4 + 电容 2 + 电阻 8 + PTFE 0.01 + 铝 0.2 + 铜 0.05 + PCB 1 → 采样保持 1；余是贴片废品。50–100 ps 孔径、1.5–2 GHz 是设计值',
  },

  /**
   * 8 bit flash ADC：255 只比较器 + 256 只电阻梯 + 编码。
   *
   *   比较器 255 + 电阻 256 + 计数 8 + 控制板 1 + PCB 4 + 铜线 1 + 铝 2 → ADC 1
   */
  {
    id: 'make/scope-adc',
    name: '1 GHz Oscilloscope ADC Manufacturing', name_zh: '1 GHz 示波器 ADC 制造',
    produces: [
      {
        item: 'plant/scope-1ghz/adc',
        qty: q(1),
        gives: [
          { param: 'resolution', kind: 'range', min: 8, max: 8 },
          { param: 'sampleRate', kind: 'range', min: 2, max: 4 },
          { param: 'enob', kind: 'range', min: 6.5, max: 7.5 },
          { param: 'inputRange', kind: 'range', min: 0.5, max: 1 },
          { param: 'bandwidth', kind: 'range', min: 1.5, max: 2 },
          { param: 'comparators', kind: 'range', min: 255, max: 255 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/uhf-digitizer/comparator', qty: q(255) }] },
      { anyOf: [{ item: 'std/chip-resistor-general', qty: q(256) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(8) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(4) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(120) },
    unbalanced_zh:
      '比较器 255 + 电阻 256 + 计数 8 + 控制板 1 + PCB 4 + 铜线 1 + 铝 2 → ADC 1；余是焊接/调试废品。255 只是 2⁸−1，不是估计；2–4 GS/s、ENOB 6.5–7.5 是设计值',
  },

  /**
   * 1 GHz 探头：0.3 m 半刚性同轴 + 尖端 + SMA。
   *
   *   铜 0.1 + PTFE 0.05 + 不锈钢 0.05 + 金 0.001 + 铝 0.2 → 探头 1
   */
  {
    id: 'make/uhf-probe',
    name: '1 GHz Probe/Coaxial Manufacturing', name_zh: '1 GHz 探头/同轴制造',
    produces: [
      {
        item: 'plant/uhf-probe',
        qty: q(1),
        gives: [
          { param: 'length', kind: 'range', min: 0.1, max: 0.3 },
          { param: 'impedance', kind: 'range', min: 45, max: 55 },
          { param: 'returnLoss', kind: 'range', min: 15, max: 20 },
          { param: 'bandwidth', kind: 'range', min: 1, max: 1.5 },
          { param: 'capacitance', kind: 'range', min: 0.5, max: 1.5 },
          { param: 'cableLoss', kind: 'range', min: 0.8, max: 1.2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room', 'std/vna-3ghz'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '装半刚性同轴/尖端/SMA；用 std/vna-3ghz 测回波 >15 dB、0.8–1.2 dB/m @1 GHz', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh:
      '铜 0.1 + PTFE 0.05 + 不锈钢 0.05 + 金 0.001 + 铝 0.2 → 探头 1；余是车削/装配废料。0.3 m、50 Ω、回波 >15 dB、0.8–1.2 dB/m @1 GHz 是设计值，用 std/vna-3ghz 测',
  },

  /**
   * 快阶跃源：SiGe HBT 雪崩 + 电容/电阻 + 屏蔽。
   *
   *   HBT 1 + 电容 2 + 电阻 4 + 铜 0.1 + PTFE 0.01 + 铝 0.2 → 阶跃源 1
   */
  {
    id: 'make/scope-step-source',
    name: '1 GHz Digital Oscilloscope Fast Step Source Manufacturing', name_zh: '1 GHz 数字示波器快阶跃源制造',
    produces: [
      {
        item: 'plant/scope-1ghz/step-source',
        qty: q(1),
        gives: [
          { param: 'riseTime', kind: 'range', min: 0.05, max: 0.15 },
          { param: 'amplitude', kind: 'range', min: 1, max: 10 },
          { param: 'repetition', kind: 'range', min: 1, max: 100 },
          { param: 'jitter', kind: 'range', min: 1, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/sige-hbt-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/chip-resistor-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(8) },
    unbalanced_zh:
      'HBT 1 + 电容 2 + 电阻 4 + 铜 0.1 + PTFE 0.01 + 铝 0.2 → 阶跃源 1；余是屏蔽盒边角。50–150 ps、1–10 V、1–100 kHz 是设计值',
  },

  /**
   * 整机：两路前端 + 两片 ADC + 采样保持 + 复用 timebase + 计算机。
   *
   *   前端 2 + 采样保持 2 + ADC 2 + timebase 1 + 控制板 1 + 计算机 1
   *   + DVM 1 + 钢板 2 + 铝 2 + 铜线 1 + PTFE 0.1 → 示波器 1 台
   */
  {
    id: 'make/scope-1ghz',
    name: '1 GHz Digital Oscilloscope Assembly', name_zh: '1 GHz 数字示波器装配',
    produces: [
      {
        item: 'plant/scope-1ghz',
        qty: q(1),
        gives: [
          { param: 'measure/bandwidth', kind: 'range', min: 1, max: 1.2 },
          { param: 'measure/sampleRate', kind: 'range', min: 5, max: 10 },
          { param: 'measure/resolution', kind: 'range', min: 8, max: 8 },
          { param: 'riseTime', kind: 'range', min: 0.25, max: 0.30 },
          { param: 'measure/systemRiseTime', kind: 'range', min: 0.3, max: 0.5 },
          { param: 'measure/timeResolution', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'measure/jitter', kind: 'range', min: 1, max: 10 },
          { param: 'channels', kind: 'range', min: 2, max: 2 },
          { param: 'inputImpedance', kind: 'range', min: 50, max: 50 },
          { param: 'inputRange', kind: 'range', min: 5, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/scope-1ghz/frontend', qty: q(2) }] },
      { anyOf: [{ item: 'plant/scope-1ghz/sample-hold', qty: q(2) }] },
      { anyOf: [{ item: 'plant/scope-1ghz/adc', qty: q(2) }] },
      { anyOf: [{ item: 'plant/uhf-digitizer/timebase', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/computer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room', 'std/vna-3ghz'],
    steps: [
      { note_zh: '装两路前端/采样保持/ADC：50 Ω 微带，两片 ADC 交错；通道间偏斜 ≤10 ps', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装 timebase（复用 uhf-digitizer/timebase）：2–4 GHz 时钟 + 1–5 ps 步进，抖动 ≤0.8 ps', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装计算机/控制：5–10 GS/s 等效采样、8 bit 存储、触发与延迟校准', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '用快阶跃源测系统上升时间：RSS sqrt(0.30² + 0.10² + 0.10²) = 0.33 ns；1 GHz 带宽、抖动 ≤10 ps', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '用 0.3 m 探头复核：std/vna-3ghz 测回波 >15 dB、电缆损耗 0.24–0.45 dB；写系统响应 0.3–0.5 ns', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(160) },
    unbalanced_zh:
      '前端 2 + 采样保持 2 + ADC 2 + timebase 1 + 控制板 1 + 计算机 1 + DVM 1 + 钢板 2 + 铝 2 + 铜线 1 + PTFE 0.1 → 示波器 1 台；余是钣金/线头。1 GHz、5–10 GS/s 等效、8 bit、0.25–0.30 ns 是设计值；timebase 复用 uhf-digitizer 的 2–4 GHz 档',
  },

];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...SCOPE_1GHZ_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...SCOPE_1GHZ_ROUTES];
