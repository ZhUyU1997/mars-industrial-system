/**
 * 同轴火花隙 UHF 源 —— 本地可复制的降级 <1 ns 源。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 它不是校准源，是相对激励源
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 雪崩管/SRD/水银继电器本层都没有；能本地造的是**同轴火花隙**：
 *
 *   100 pF 充电电容（cal-capacitor）
 *   + 0.2–0.5 mm 铜/钨电极
 *   + SF₆ 1–3 bar
 *   + 1000:1 电容分压
 *   → 0.5–2 ns、10–100 pC、10–100 Hz
 *
 * 它解决“本地能造一个快沿源”，不解决：
 *
 *   · <1 ns 是否真达到（没有快示波器/VNA 验证）；
 *   · 抖动 0.5–2 ns；
 *   · 电极烧蚀/EMI；
 *   · PDI/PRPD。
 *
 * 所以数据层记“源本地可造（R9 可闭合）”，不记“UHF 计量闭合”。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const UHF_SPARK_ITEMS: readonly Item[] = [
  /**
   * 同轴火花隙源。0.5–2 ns、10–100 pC、10–100 Hz、抖动 0.5–2 ns。
   */
  {
    id: 'plant/hv-test-bench/uhf-spark-source',
    name: '高压测试台同轴火花隙源',
    unit: '件',
    category: 'part',
    props: [
      { param: 'riseTime', kind: 'range', min: 0.5, max: 2, unit: 'ns' },
      { param: 'charge', kind: 'range', min: 10, max: 100, unit: 'pC' },
      { param: 'jitter', kind: 'range', min: 0.5, max: 2, unit: 'ns' },
      { param: 'repetition', kind: 'range', min: 10, max: 100, unit: 'Hz' },
    ],
  },
];

export const UHF_SPARK_ROUTES: readonly Route[] = [
  {
    /**
     * **同轴火花隙：铜/钨电极 + 氧化铝绝缘 + SF₆ + 1000:1 分压。**
     *
     *   铜 0.5 + 钨 0.01 + 氧化铝 0.2 + PTFE 0.1 + SF₆ 0.5 + 电容 1
     *   → 火花隙源 1
     */
    id: 'make/uhf-spark-source',
    name: '高压测试台同轴火花隙源制造',
    produces: [
      {
        item: 'plant/hv-test-bench/uhf-spark-source',
        qty: q(1),
        gives: [
          { param: 'riseTime', kind: 'range', min: 0.5, max: 2 },
          { param: 'charge', kind: 'range', min: 10, max: 100 },
          { param: 'jitter', kind: 'range', min: 0.5, max: 2 },
          { param: 'repetition', kind: 'range', min: 10, max: 100 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/sf6', qty: q(1, 2) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/cal-capacitor', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh:
          '车 50 Ω 同轴腔；铜/钨电极间隙 0.2–0.5 mm，边缘 R0.2 以上；氧化铝/PTFE 绝缘；充 SF₆ 1–3 bar',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '100 pF 充电电容 + 1000:1 电容分压到 10–100 pC；电极接高压、外壳接地；重复率 10–100 Hz，电极寿命 10^5–10^7 次',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      '铜 0.5 + 钨 0.01 + 氧化铝 0.2 + PTFE 0.1 + SF₆ 0.5 + 电容 1 → 火花隙源 1；余是车削/电极烧蚀/密封废料。0.5–2 ns 是设计值，**没有快示波器/VNA 验证**；抖动/EMI/寿命都是估',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...UHF_SPARK_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...UHF_SPARK_ROUTES];
