/**
 * PD 趋势记录 —— 1 Hz 读峰值/率表，存成 q(t)/rate(t)。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 它不是示波器
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本层没有 ADC/示波器，逐脉冲 q(t) 做不了。能做的是：
 *
 *   DMM 读峰值保持（q） + DMM 读率表（Hz）
 *   → 1 Hz 采样 → 存 10^4–10^5 点
 *
 * 这能看“PD 随电压/时间变多还是变少”，不能看单个脉冲波形。
 * 自动 PDIV/PDEV 仍要人工升压 + 看趋势拐点。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PD_LOGGER_ITEMS: readonly Item[] = [
  /**
   * 双通道趋势记录器。1 Hz、10^5 点、RS-232/存储卡。
   *
   *   sampleInterval  0.1–10 s
   *   channels        2（q、rate）
   *   storage         10^4–10^5 点
   */
  {
    id: 'plant/hv-test-bench/pd-logger',
    name: '高压测试台双通道趋势记录器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'sampleInterval', kind: 'range', min: 0.1, max: 10, unit: 's' },
      { param: 'channels', kind: 'range', min: 1, max: 4, unit: '路' },
      { param: 'storage', kind: 'range', min: 1000, max: 100000, unit: '点' },
    ],
  },
];

export const PD_LOGGER_ROUTES: readonly Route[] = [
  {
    /**
     * **趋势记录器：DMM + 定时器 + 控制板 + 存储。**
     *
     *   DMM 1 + 控制板 1 + 定时器 1 + 铝 0.5 + 铜线 0.05 → 记录器 1
     *
     * 备选件：控制板子句的 `std/control-board-simple-general` 是第二供应（anyOf 第二备选），
     * DFS 选 `std/control-board-general`，它不进证明树属预期（PLAN 监控项，不删不塞）。
     */
    id: 'make/pd-logger',
    name: '高压测试台双通道趋势记录器制造',
    produces: [
      {
        item: 'plant/hv-test-bench/pd-logger',
        qty: q(1),
        gives: [
          { param: 'sampleInterval', kind: 'range', min: 1, max: 1 },
          { param: 'channels', kind: 'range', min: 2, max: 2 },
          { param: 'storage', kind: 'range', min: 10000, max: 100000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      // C 组 OR：主路仍是通用板；2 通道、1 Hz、10^4–10^5 点，8–12 MHz 对 1 Hz 有 10^7 余量，
      // I/O 8–16（DMM/定时/存储）≤32 → 二层简版够用。
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }, { item: 'std/control-board-simple-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(8) },
    unbalanced_zh:
      'DMM 1 + 控制板 1 + 定时器 1 + 铝 0.5 + 铜线 0.05 → 记录器 1；余是外壳/接线/存储卡废料。1 Hz 采样、10^5 点；**不是逐脉冲**，是峰值/率表的趋势',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PD_LOGGER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PD_LOGGER_ROUTES];
