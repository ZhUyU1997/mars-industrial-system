/**
 * UHF PD 响应记录与测量路线（从 data/machine/scope-1ghz.ts 迁入，R13）。
 *
 * 快阶跃源 → 0.3 m 探头 → 1 GHz 示波器；systemRiseTime 0.3–0.5 ns，
 * 被校分析仪 fastRise 0.5–1 ns（量具只到这一档）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DATA_ITEMS: readonly Item[] = [
  /**
   * UHF 响应记录。**systemRiseTime 0.3–0.5 ns、fastRise 0.5–1 ns、bandwidth 1–1.2 GHz、
   * timeResolution 0.2–0.5 ns、jitter 1–10 ps、sampleRate 5–10 GS/s。**
   */
  {
    id: 'mat/uhf-pd-response-record',
    name: 'UHF Response Record', name_zh: 'UHF 响应记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'systemRiseTime', kind: 'range', min: 0.1, max: 1, unit: 'ns', dir: 'atMost' },
      // 被校分析仪自身的 fastRise：量具只到 0.5–1 ns（原设计 0.3–0.5 是测试系统上升时间，
      // 不是分析仪 fastRise；两者分开记）。
      { param: 'fastRise', kind: 'range', min: 0.5, max: 1, unit: 'ns' },
      { param: 'bandwidth', kind: 'range', min: 0.5, max: 2, unit: 'GHz', dir: 'atLeast' },
      { param: 'timeResolution', kind: 'range', min: 0.1, max: 1, unit: 'ns', dir: 'atMost' },
      { param: 'jitter', kind: 'range', min: 0.5, max: 50, unit: 'ps', dir: 'atMost' },
      { param: 'sampleRate', kind: 'range', min: 1, max: 20, unit: 'GS/s', dir: 'atLeast' },
    ],
  },
];

export const DATA_ROUTES: readonly Route[] = [
  /**
   * UHF 响应测量：快阶跃源 → 0.3 m 探头 → 1 GHz 示波器。
   *
   *   阶跃源/探头/示波器（工具）→ 记录 1
   *
   * systemRiseTime 0.3–0.5 ns（测试系统）、fastRise 0.5–1 ns（被校分析仪）、
   * bandwidth 1–1.2 GHz、timeResolution 0.2–0.5 ns、jitter 1–10 ps、sampleRate 5–10 GS/s。
   */
  {
    id: 'measure/uhf-pd-response',
    name: 'UHF Response Measurement', name_zh: 'UHF 响应测量',
    produces: [
      {
        item: 'mat/uhf-pd-response-record',
        qty: q(1),
        gives: [
          { param: 'systemRiseTime', kind: 'range', min: 0.3, max: 0.5 },
          { param: 'fastRise', kind: 'range', min: 0.5, max: 1 },
          { param: 'bandwidth', kind: 'range', min: 1, max: 1.2 },
          { param: 'timeResolution', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'jitter', kind: 'range', min: 1, max: 10 },
          { param: 'sampleRate', kind: 'range', min: 5, max: 10 },
        ],
      },
    ],
    uses: [],
    needs: [
      {
        item: 'plant/hv-test-bench/uhf-pd-analyzer',
        qty: q(1),
        need: [
          { param: 'measure/bandwidth', kind: 'range', min: 1000, max: 1200 },
          { param: 'fastRise', kind: 'range', min: 0.5, max: 1 },
        ],
        onRelax: 'functional-kept',
      },
      'plant/scope-1ghz/step-source',
      'plant/uhf-probe',
      'plant/metrology-room',
    ],
    steps: [
      { note_zh: '接快阶跃源 → 0.3 m 探头 → 示波器 50 Ω；源重复 1–100 kHz，幅度 1–5 V', performedBy: 'plant/scope-1ghz', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '测 10–90 % 上升时间：测试系统 0.3–0.5 ns；被校分析仪 fastRise 只到 0.5–1 ns（注释写明，不冒充 0.3–0.5）', performedBy: 'plant/scope-1ghz', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '测时间分辨：0.5 ns 窗口 2.5–5 点；抖动 1–10 ps；8 bit 量化在 0.35 ns 边沿上折 1.4–3.5 ps', performedBy: 'plant/scope-1ghz', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '写记录；同时注明 0.5–2 ns 火花源只能测 PD 包络，不能当 350 ps 上升时间的源', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(4) },
    unbalanced_zh:
      'UHF PD 分析仪 1 台（进、出，不消耗）+ 阶跃源/探头/示波器（进、出，不占用）→ 记录 1；无材料消耗。0.3–0.5 ns、1–1.2 GHz、0.2–0.5 ns、1–10 ps、5–10 GS/s 是设计/校准窗口；0.3 m 探头 @1 GHz 损耗 0.24–0.45 dB',
  },
];
