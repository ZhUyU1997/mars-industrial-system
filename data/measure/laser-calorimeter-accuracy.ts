/**
 * 激光量热器 accuracy 实测：电加热 0–30 kW 分段，七位半读 V/I 作标准源。
 *
 * 独立标准源：std/dmm-7half-general（accuracy 0.00035–0.001%）+ 电加热器。
 * 窗口取资格带 0.5–1%，不是单次读数。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const LASER_CALORIMETER_ACCURACY_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/laser-calorimeter-accuracy-measure-record',
    name: '量热器准确度测量记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'accuracy', kind: 'range', min: 0.5, max: 1, unit: '%', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 5, max: 5, unit: '点' },
    ],
  },
];

export const LASER_CALORIMETER_ACCURACY_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **量热器 accuracy：电加热标准源 vs 量热器读数，5 点线性残差。**
     */
    id: 'measure/laser-calorimeter-accuracy',
    name: '量热器准确度测量',
    produces: [{
      item: 'mat/laser-calorimeter-accuracy-measure-record',
      qty: q(1),
      gives: [
        { param: 'accuracy', kind: 'range', min: 0.5, max: 1 },
        { param: 'points', kind: 'range', min: 5, max: 5 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(20) }] }],
    needs: [
      {
        item: 'plant/laser-calorimeter',
        qty: q(1),
        need: [{ param: 'accuracy', kind: 'range', min: 0.5, max: 1 }],
        onRelax: 'functional-kept',
      },
      {
        item: 'std/dmm-7half-general',
        qty: q(1),
        need: [{ param: 'accuracy', kind: 'range', min: 0.00035, max: 0.001 }],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(6) },
    steps: [
      { note_zh: '电加热 0–30 kW 分 5 段，DMM 读 V/I 算标准功率；水路 20–50 L/min', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '每段等 30 s，量热器读功率；5 点线性拟合残差 = accuracy 0.5–1%', performedBy: 'plant/laser-calorimeter', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '写资格带；不写单次读数', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '水 20 kg → 量热器 accuracy 记录 1 份；水回用，记录是数据不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...LASER_CALORIMETER_ACCURACY_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...LASER_CALORIMETER_ACCURACY_MEASURE_ROUTES];
