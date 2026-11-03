/**
 * FZ 区熔炉 RF 功率实测：水冷量热器读 18–22 kW。
 *
 * 独立量具：plant/laser-calorimeter（水冷量热器）。
 * rfPower 只由量热器测；2–5 MHz 的 RF 电流不串入 DMM，也不用虚构的分流器/CT。
 * 只覆盖 gate 记录里的 rfPower；转速/温度/真空不是这条 gate 的判据。
 * 窗口取资格带 18–22 kW，不是单次读数。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FZ_PULLER_RF_POWER_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/float-zone-puller-rf-power-measure-record',
    name: 'FZ 区熔炉记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'rfPower', kind: 'range', min: 18000, max: 22000, unit: 'W', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 10, max: 10, unit: '点' },
    ],
  },
];

export const FZ_PULLER_RF_POWER_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **FZ 区熔炉：水冷量热器读 RF 输出 18–22 kW。**
     */
    id: 'measure/float-zone-puller-rf-power',
    name: 'FZ 区熔炉测量',
    produces: [{
      item: 'mat/float-zone-puller-rf-power-measure-record',
      qty: q(1),
      gives: [
        { param: 'rfPower', kind: 'range', min: 18000, max: 22000 },
        { param: 'points', kind: 'range', min: 10, max: 10 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(20) }] }],
    needs: [
      {
        item: 'plant/laser-calorimeter',
        qty: q(1),
        need: [{ param: 'power', kind: 'range', min: 18000, max: 22000 }],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(6) },
    steps: [
      { note_zh: 'FZ 炉 RF 输出接水冷量热器，2–5 MHz、预热 10 min；水路 20–50 L/min', performedBy: 'plant/float-zone-puller' },
      { note_zh: '量热器读 10 点 RF 功率 18–22 kW；rfPower 只由量热器支撑，DMM 不参与 RF 电流', performedBy: 'plant/laser-calorimeter', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '写资格带 18–22 kW；不写单次读数', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '水 20 kg → RF 功率记录 1 份；水回用，记录是数据不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...FZ_PULLER_RF_POWER_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...FZ_PULLER_RF_POWER_MEASURE_ROUTES];
