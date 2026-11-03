/**
 * 20 kW RF 发生器 stability 实测：水冷量热器 measure/stability 能力，60 s 10 点。
 *
 * 独立量具：plant/laser-calorimeter（power 0–30 kW、measure/stability 0–5%）。
 * 窗口取资格带 0.2–0.5%，不是单次读数。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const RF_GENERATOR_20KW_STABILITY_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/rf-generator-20kw-stability-measure-record',
    name: 'RF Generator Record', name_zh: 'RF 发生器记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'stability', kind: 'range', min: 0.2, max: 0.5, unit: '%', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 10, max: 10, unit: '点' },
    ],
  },
];

export const RF_GENERATOR_20KW_STABILITY_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **RF 发生器：20 kW 水冷负载，量热器 60 s 读 10 点算稳定度。**
     */
    id: 'measure/rf-generator-20kw-stability',
    name: 'RF Generator Measurement', name_zh: 'RF 发生器测量',
    produces: [{
      item: 'mat/rf-generator-20kw-stability-measure-record',
      qty: q(1),
      gives: [
        { param: 'stability', kind: 'range', min: 0.2, max: 0.5 },
        { param: 'points', kind: 'range', min: 10, max: 10 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'plant/rf-generator-20kw', qty: q(1) }] }],
    needs: [
      {
        item: 'plant/laser-calorimeter',
        qty: q(1),
        need: [
          { param: 'power', kind: 'range', min: 18000, max: 22000 },
          { param: 'measure/stability', kind: 'range', min: 0.2, max: 0.5 },
        ],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(4) },
    steps: [
      { note_zh: '20 kW 水冷负载接 RF 输出，27 MHz、预热 10 min；水路 20–50 L/min', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '量热器每 6 s 读一次、读 10 点（60 s），算最大偏差 0.2–0.5%', performedBy: 'plant/laser-calorimeter', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '写资格带；不写单次读数', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: 'RF 发生器 1 台（进、出不消耗）+ 量热器（不占用）→ 稳定度记录 1 份；水是冷却水。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...RF_GENERATOR_20KW_STABILITY_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...RF_GENERATOR_20KW_STABILITY_MEASURE_ROUTES];
