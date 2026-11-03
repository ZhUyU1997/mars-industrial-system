/**
 * 油浸精密电阻实测：油浴 20/25/30 °C，七位半 + 比例桥读 R(T)。
 *
 * 独立量具：plant/precision-oil-bath、std/dmm-7half-general、plant/ratio-bridge。
 * 窗口取资格带 accuracy 0.005–0.02%、tempCoefficient 2–5 ppm/K，不是单次读数。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PRECISION_RESISTOR_OIL_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/precision-resistor-oil-measure-record',
    name: '油浸电阻记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'accuracy', kind: 'range', min: 0.005, max: 0.02, unit: '%', dir: 'atMost' },
      { param: 'tempCoefficient', kind: 'range', min: 2, max: 5, unit: 'ppm/K', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 3, max: 3, unit: '点' },
    ],
  },
];

export const PRECISION_RESISTOR_OIL_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **油浸电阻：三点油浴 + 七位半/比例桥，拟合 TCR 与准确度。**
     */
    id: 'measure/precision-resistor-oil-measure',
    name: '油浸电阻测量',
    produces: [
      {
        item: 'mat/precision-resistor-oil-measure-record',
        qty: q(1),
        gives: [
          { param: 'accuracy', kind: 'range', min: 0.005, max: 0.02 },
          { param: 'tempCoefficient', kind: 'range', min: 2, max: 5 },
          { param: 'points', kind: 'range', min: 3, max: 3 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/precision-resistor-oil', qty: q(1) }] }],
    needs: [
      {
        item: 'plant/precision-oil-bath',
        qty: q(1),
        need: [
          { param: 'temperature', kind: 'range', min: 20, max: 30 },
          { param: 'measure/stability', kind: 'range', min: 0.005, max: 0.01 },
          { param: 'rtdAccuracy', kind: 'range', min: 0.01, max: 0.03 },
        ],
        onRelax: 'functional-kept',
      },
      {
        item: 'std/dmm-7half-general',
        qty: q(1),
        need: [{ param: 'accuracy', kind: 'range', min: 0.00035, max: 0.001 }],
        onRelax: 'functional-kept',
      },
      {
        item: 'plant/ratio-bridge',
        qty: q(1),
        need: [
          { param: 'measure/accuracy', kind: 'range', min: 0, max: 500 },
          { param: 'measure/tempCoefficient', kind: 'range', min: 2, max: 5 },
        ],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(12) },
    steps: [
      { note_zh: '电阻浸入油浴，20/25/30 °C 各稳定 30 min；RTD 读油温', performedBy: 'plant/precision-oil-bath' },
      { note_zh: '七位半/比例桥读三点 R(T)，拟合 tempCoefficient 2–5 ppm/K、accuracy 0.005–0.02%', performedBy: 'plant/ratio-bridge', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '写资格带；不写单次读数', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '油浸电阻 1 只（进、出不消耗）+ 油浴/七位半/比例桥（不占用）→ 实测记录 1 份；记录是数据不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...PRECISION_RESISTOR_OIL_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PRECISION_RESISTOR_OIL_MEASURE_ROUTES];
