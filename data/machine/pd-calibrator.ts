/**
 * PD 校准链 —— 标准 1 µs 脉冲源 + 电荷放大器；不是 UHF <1 ns 快源。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 它补哪一格
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `pd-sensor.ts` 只有 UHF 天线 + 音频包络，5–50 pC 是估的；要定量，
 * 先得有一台**已知电荷**的校准脉冲源和一台**电荷放大器**。
 *
 * 本文件给 `plant/hv-test-bench` 三件：
 *
 *   cal-capacitor   100 pF 空气电容（Q = C·V，1–100 pC 的基准）
 *   pd-calibrator   可控硅开关 + 100 pF + 0–1 V 基准 ⇒ 1–100 pC、0.5–2 µs
 *   charge-amp      100 pF 反馈 + 1 MHz 运放 ⇒ 0.01 V/pC、100 kHz
 *
 * 这三件只覆盖 **IEC 60270 的 1 µs 标准脉冲**；UHF 段要的 <1 ns 快源
 * （雪崩管/水银继电器/阶跃恢复二极管）本层没有，仍记缺口③。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么是可控硅，不是机械继电器
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 机械继电器 1–5 ms，太慢；雪崩管要 200 V 高压与 <1 ns 沿，本层没有。
 * `std/hv-thyristor-general` 是 3 kV/10 A 的晶闸管，门极一触发就导通，
 * 上升沿 0.5–2 µs —— 正好是 IEC 标准脉冲那一档，不是 UHF 那一档。
 *
 * 代价：晶闸管一旦导通要等电流过零才关断，所以脉冲重复率 ≤1 kHz；
 * 校准不需要快重复，够用。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PD_CALIBRATOR_ITEMS: readonly Item[] = [
  /**
   * 100 pF 空气电容。两块 φ50 铝板、间距 0.7 mm、PTFE 垫圈。
   *
   *   C = ε₀ A/d = 8.85e−12 × 1.96e−3 / 0.7e−3 = 24.8 pF（单对）
   *   三对并联 ⇒ 74 pF；取 50–200 pF 窗口
   *
   * 它是校准的**电荷基准**：Q = C·V，C 用 LCR 表标到 ±1 %。
   */
  {
    id: 'plant/hv-test-bench/cal-capacitor',
    name: '100 pF Air Capacitor', name_zh: '100 pF 空气电容',
    unit: '件',
    category: 'part',
    props: [
      { param: 'capacitance', kind: 'range', min: 50, max: 200, unit: 'pF' },
      { param: 'voltage', kind: 'range', min: 0, max: 2000, unit: 'V', dir: 'atLeast' },
    ],
  },

  /**
   * 标准校准脉冲源。1–100 pC、0.5–2 µs、±10 %。
   *
   *   0–1 V 基准 + 100 pF ⇒ Q = 0–100 pC
   *   晶闸管开关 ⇒ 上升沿 0.5–2 µs
   *   输出 BNC 经 50 Ω 注入试品
   */
  {
    id: 'plant/hv-test-bench/pd-calibrator',
    name: 'High-Voltage Test Bench Standard Calibration Pulse Source', name_zh: '高压测试台标准校准脉冲源',
    unit: '件',
    category: 'part',
    props: [
      { param: 'charge', kind: 'range', min: 1, max: 100, unit: 'pC' },
      { param: 'riseTime', kind: 'range', min: 0.5, max: 2, unit: 'µs' },
      { param: 'accuracy', kind: 'range', min: 1, max: 20, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 电荷放大器。100 pF 反馈 + 1 MHz 运放，0.01 V/pC、100 kHz。
   *
   *   V_out = Q/C_f = 100 pC / 100 pF = 1 V（满量程）
   *   1 MHz 运放对 1 µs 脉冲够用；对 <1 ns 的 UHF 脉冲不够（缺口③）
   */
  {
    id: 'plant/hv-test-bench/charge-amp',
    name: 'High-Voltage Test Bench Charge Amplifier', name_zh: '高压测试台电荷放大器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'gain', kind: 'range', min: 0.001, max: 1, unit: 'V/pC' },
      { param: 'bandwidth', kind: 'range', min: 10, max: 1000, unit: 'kHz' },
      { param: 'noise', kind: 'range', min: 0, max: 10, unit: 'pC', dir: 'atMost' },
    ],
  },
];

export const PD_CALIBRATOR_ROUTES: readonly Route[] = [
  {
    /**
     * **空气电容：三对 φ50 铝板 + PTFE 垫圈。**
     *
     *   铝 0.1 + PTFE 0.02 + 铜 0.02 → 电容 1
     */
    id: 'make/cal-capacitor',
    name: '100 pF Air Capacitor Manufacturing', name_zh: '100 pF 空气电容制造',
    produces: [
      {
        item: 'plant/hv-test-bench/cal-capacitor',
        qty: q(1),
        gives: [
          { param: 'capacitance', kind: 'range', min: 50, max: 200 },
          { param: 'voltage', kind: 'range', min: 1000, max: 2000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 50) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(4) },
    unbalanced_zh:
      '铝 0.1 + PTFE 0.02 + 铜 0.02 → 电容 1；余是板边/垫圈/引线废料。三对并联 74 pF，窗口 50–200 pF，用 LCR 表标到 ±1 %',
  },
  {
    /**
     * **校准脉冲源：0–1 V 基准 + 100 pF + 晶闸管开关。**
     *
     *   电容 1 + 晶闸管 1 + 基准 1 + 电阻丝 0.01 + 铝 0.2 + 铜 0.05 → 校准源 1
     */
    id: 'make/pd-calibrator',
    name: 'High-Voltage Test Bench Standard Calibration Pulse Source Manufacturing', name_zh: '高压测试台标准校准脉冲源制造',
    produces: [
      {
        item: 'plant/hv-test-bench/pd-calibrator',
        qty: q(1),
        gives: [
          { param: 'charge', kind: 'range', min: 1, max: 100 },
          { param: 'riseTime', kind: 'range', min: 0.5, max: 2 },
          { param: 'accuracy', kind: 'range', min: 5, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/hv-test-bench/cal-capacitor', qty: q(1) }] },
      { anyOf: [{ item: 'std/hv-thyristor-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 20) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(8) },
    unbalanced_zh:
      '电容 1 + 晶闸管 1 + 基准 1 + 电阻丝 0.01 + 铝 0.2 + 铜 0.05 → 校准源 1；余是屏蔽盒/接头/触发板废料。电荷 = C×V，1–100 pC；上升沿 0.5–2 µs，精度 ±5–10 %',
  },
  {
    /**
     * **电荷放大器：100 pF 反馈 + 1 MHz 运放。**
     *
     *   电容 2 + 运放 2 + 电阻丝 0.01 + 铝 0.2 + 铜 0.05 → 电荷放大器 1
     */
    id: 'make/charge-amp',
    name: 'High-Voltage Test Bench Charge Amplifier Manufacturing', name_zh: '高压测试台电荷放大器制造',
    produces: [
      {
        item: 'plant/hv-test-bench/charge-amp',
        qty: q(1),
        gives: [
          { param: 'gain', kind: 'range', min: 0.01, max: 1 },
          { param: 'bandwidth', kind: 'range', min: 100, max: 1000 },
          { param: 'noise', kind: 'range', min: 1, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/hv-test-bench/cal-capacitor', qty: q(2) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 20) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(8) },
    unbalanced_zh:
      '电容 2 + 运放 2 + 电阻丝 0.01 + 铝 0.2 + 铜 0.05 → 电荷放大器 1；余是屏蔽盒/接头/复位开关废料。100 pF 反馈 ⇒ 0.01 V/pC；1 MHz 运放 ⇒ 100 kHz 带宽，只够 1 µs 脉冲',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PD_CALIBRATOR_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PD_CALIBRATOR_ROUTES];
