/**
 * PD 脉冲率表 —— 把“每秒多少次”变成 DMM 能读的直流电压。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 它补哪一格
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `pd-peak-detector` 只能单次读；100 kV 下要判断“放电在变多还是变少”，
 * 需要**重复率**。本层没有频率计/计数器显示，所以做一台**率表**：
 *
 *   电荷放大器 → 比较器（阈值 2–50 pC）→ 单稳态（1 µs）
 *   → RC 积分 → DMM
 *
 * 输出 V ∝ 脉冲率；DMM 读 0.1–2 V 对应 0–10 kHz。
 *
 * ⚠️ 它给的是**平均率**，不是逐脉冲 q(t)；峰值幅度仍靠峰值保持头。
 * 连续记录、PD-free 源、屏蔽间仍缺（R8 #11）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PD_RATE_ITEMS: readonly Item[] = [
  /**
   * PD 脉冲率表。阈值 2–50 pC、率 0–10 kHz、输出 0.1–2 V。
   *
   *   threshold  2–50 pC
   *   rate       0–10 kHz
   *   output     0.1–2 V
   *   accuracy   ±10–20 %
   */
  {
    id: 'plant/hv-test-bench/pd-rate-meter',
    name: 'PD Pulse Rate Meter', name_zh: 'PD 脉冲率表',
    unit: '件',
    category: 'part',
    props: [
      { param: 'threshold', kind: 'range', min: 1, max: 100, unit: 'pC' },
      { param: 'rate', kind: 'range', min: 0, max: 20000, unit: 'Hz' },
      { param: 'output', kind: 'range', min: 0, max: 5, unit: 'V' },
      { param: 'accuracy', kind: 'range', min: 5, max: 30, unit: '%', dir: 'atMost' },
    ],
  },
];

export const PD_RATE_ROUTES: readonly Route[] = [
  {
    /**
     * **率表：2 片运放 + 2 只电容 + 电阻丝 + 屏蔽盒。**
     *
     *   运放 2 + 薄膜电容 2 + 电阻丝 0.02 + 铝 0.2 + 铜线 0.05 → 率表 1
     */
    id: 'make/pd-rate-meter',
    name: 'PD Pulse Rate Meter Manufacturing', name_zh: 'PD 脉冲率表制造',
    produces: [
      {
        item: 'plant/hv-test-bench/pd-rate-meter',
        qty: q(1),
        gives: [
          { param: 'threshold', kind: 'range', min: 2, max: 50 },
          { param: 'rate', kind: 'range', min: 0, max: 10000 },
          { param: 'output', kind: 'range', min: 0.1, max: 2 },
          { param: 'accuracy', kind: 'range', min: 10, max: 20 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(8) },
    unbalanced_zh:
      '运放 2 + 薄膜电容 2 + 电阻丝 0.02 + 铝 0.2 + 铜线 0.05 → 率表 1；余是屏蔽盒/接线/电位器废料。阈值 2–50 pC，率 0–10 kHz，输出 0.1–2 V；±10–20 % 是单稳态/积分器的温漂',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PD_RATE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PD_RATE_ROUTES];
