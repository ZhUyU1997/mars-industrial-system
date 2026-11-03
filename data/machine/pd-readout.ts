/**
 * PD 单次峰值读出 —— 把电荷放大器的 0.01 V/pC 变成 DMM 能读的保持电压。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 它补哪一格
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `pd-calibrator.ts` 有 1–100 pC 源和 0.01 V/pC 电荷放大器；
 * `hv-coupling.ts` 有 100 kV 耦合电容。但电荷放大器的输出是 1 µs 脉冲，
 * 本层没有示波器/峰值保持，DMM 读不到。
 *
 * 本文件给 `plant/hv-test-bench` 一件：
 *
 *   pd-peak-detector：精密峰值保持 + 复位 + DMM 缓冲
 *
 * 它只做**单次**：注入一个校准脉冲 → 保持 → DMM 读 → 复位。
 * 连续 PD 的计数/记录仍没有（R8 #11 的下一段）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么用点接触晶体管当二极管
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本层没有 `std/diode-general`。点接触锗晶体管的发射结是一个**低电容、
 * 快恢复**的肖特基点接触，1 µs 脉冲够用；把基极/集电极短接当二极管。
 *
 * 峰值保持用**运放反馈环里的二极管**：二极管压降被环路吃掉，
 * 输出直接是电容电压，不用校 0.3 V 死区。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PD_READOUT_ITEMS: readonly Item[] = [
  /**
   * 单次峰值保持头。1–200 pC、0.01–2 V、保持压降 <1 %/s。
   *
   *   chargeRange  1–200 pC
   *   inputRange   0.01–2 V
   *   resolution   1 pC
   *   holdDrop     ≤1 %/s
   */
  {
    id: 'plant/hv-test-bench/pd-peak-detector',
    name: '高压测试台单次峰值保持头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'chargeRange', kind: 'range', min: 1, max: 200, unit: 'pC' },
      { param: 'inputRange', kind: 'range', min: 0.01, max: 2, unit: 'V' },
      { param: 'resolution', kind: 'range', min: 1, max: 10, unit: 'pC', dir: 'atMost' },
      { param: 'holdDrop', kind: 'range', min: 0, max: 1, unit: '%/s', dir: 'atMost' },
    ],
  },
];

export const PD_READOUT_ROUTES: readonly Route[] = [
  {
    /**
     * **峰值保持：2 片运放 + 点接触管当二极管 + 25 nF 保持电容 + 复位管。**
     *
     *   运放 2 + 点接触管 1 + 薄膜电容 2 + 平面管 1 + 电阻丝 0.05
     *   + 铝 0.2 + 铜线 0.05 → 峰值保持头 1
     */
    id: 'make/pd-peak-detector',
    name: '高压测试台单次峰值保持头制造',
    produces: [
      {
        item: 'plant/hv-test-bench/pd-peak-detector',
        qty: q(1),
        gives: [
          { param: 'chargeRange', kind: 'range', min: 1, max: 200 },
          { param: 'inputRange', kind: 'range', min: 0.01, max: 2 },
          { param: 'resolution', kind: 'range', min: 1, max: 5 },
          { param: 'holdDrop', kind: 'range', min: 0.1, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      // 点接触锗管的发射结当快恢复二极管；基极/集电极短接
      { anyOf: [{ item: 'std/point-contact-transistor-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(2) }] },
      // 复位：平面管并在保持电容两端，机器人给一个 1 ms 的基极脉冲
      { anyOf: [{ item: 'std/planar-transistor-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(8) },
    unbalanced_zh:
      '运放 2 + 点接触管 1 + 电容 2 + 平面管 1 + 电阻丝 0.05 + 铝 0.2 + 铜线 0.05 → 峰值保持头 1；余是屏蔽盒/接线/管座废料。保持电容 25 nF、DMM 10 MΩ ⇒ 时间常数 0.25 s，DMM 读得及；压降 ≤1 %/s',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PD_READOUT_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PD_READOUT_ROUTES];
