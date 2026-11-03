/**
 * 20 kW RF 发生器实测：输出功率（水冷量热器）、效率（DC 输入 vs RF 输出）。
 * 独立量具：plant/laser-calorimeter + std/dmm-7half-general。
 *
 * stability 0.2–0.5% 没有独立量具支撑：`plant/scope-1ghz` 只有 8 bit
 * 垂直分辨（1 LSB≈0.39%），且没有幅度 accuracy/stability 声明，测不了
 * 0.2% 级；因此 stability 仍留给 qual/gate-rf-generator-20kw，不在本记录里冒充。
 * 窗口取 20 kW 机实际交付窗：18–22 kW、0.70–0.85。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const RF_GENERATOR_20KW_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/rf-generator-20kw-measure-record',
    name: '20 kW RF Generator Record', name_zh: '20 kW RF 发生器记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 18000, max: 22000, unit: 'W' },
      { param: 'efficiency', kind: 'range', min: 0.7, max: 0.85, unit: '1' },
      { param: 'points', kind: 'range', min: 5, max: 5, unit: '点' },
    ],
  },
];

export const RF_GENERATOR_20KW_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **20 kW RF 发生器：水冷量热器读输出，DMM 读 DC 输入算效率。**
     */
    id: 'measure/rf-generator-20kw',
    name: '20 kW RF Generator Measurement', name_zh: '20 kW RF 发生器测量',
    produces: [
      {
        item: 'mat/rf-generator-20kw-measure-record',
        qty: q(1),
        gives: [
          { param: 'power', kind: 'range', min: 18000, max: 22000 },
          { param: 'efficiency', kind: 'range', min: 0.7, max: 0.85 },
          { param: 'points', kind: 'range', min: 5, max: 5 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/rf-generator-20kw', qty: q(1) }] }],
    needs: [
      {
        item: 'plant/laser-calorimeter',
        qty: q(1),
        need: [{ param: 'power', kind: 'range', min: 18000, max: 22000 }],
        onRelax: 'functional-kept',
      },
      {
        item: 'std/dmm-7half-general',
        qty: q(1),
        need: [{ param: 'accuracy', kind: 'range', min: 0.00035, max: 0.001 }],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
      'plant/efficiency-standard',
    ],
    rate: { hours: q(6) },
    steps: [
      { note_zh: '接 20 kW 水冷负载/量热器，27 MHz、预热 10 min；水路流量 20–50 L/min', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '量热器读输出 18–22 kW，5 点；DMM 读 DC 母线 V/I，算效率 0.70–0.85', performedBy: 'plant/laser-calorimeter', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '重复 5 点功率读数，写记录；stability 不进本条（无独立量具支撑）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: 'RF 发生器 1 台（进、出不消耗）+ 量热器/DMM（不占用）→ 实测记录 1 份；水是负载冷却水。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...RF_GENERATOR_20KW_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...RF_GENERATOR_20KW_MEASURE_ROUTES];
