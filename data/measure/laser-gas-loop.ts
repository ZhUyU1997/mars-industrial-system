/**
 * 激光气体循环温度稳定性实测：进出口 T 型热电偶 + 毫伏表，30 min 时程。
 *
 * 独立量具：std/thermocouple-t-general ×2、std/millivoltmeter-general ×2。
 * 窗口取资格带 0.5–2 K，不是单次读数；记录的是出口温度时程最大偏差。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const LASER_GAS_LOOP_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/laser-gas-loop-measure-record',
    name: 'Laser Gas Circulation Record', name_zh: '激光气体循环记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'tempStability', kind: 'range', min: 0.5, max: 2, unit: 'K', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 15, max: 15, unit: '点' },
    ],
  },
];

export const LASER_GAS_LOOP_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **激光气体循环：进出口 T 型偶，出口 30 min 温度时程最大偏差。**
     */
    id: 'measure/laser-gas-loop-stability',
    name: 'Laser Gas Circulation Measurement', name_zh: '激光气体循环测量',
    produces: [{
      item: 'mat/laser-gas-loop-measure-record',
      qty: q(1),
      gives: [
        { param: 'tempStability', kind: 'range', min: 0.5, max: 2 },
        { param: 'points', kind: 'range', min: 15, max: 15 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'plant/laser-gas-loop', qty: q(1) }] }],
    needs: [
      { item: 'std/thermocouple-t-general', qty: q(2) },
      { item: 'std/millivoltmeter-general', qty: q(2) },
      'plant/metrology-room',
    ],
    rate: { hours: q(4) },
    steps: [
      { note_zh: '进出口各插 1 支 T 型偶，冷端冰点瓶，接 2 只毫伏表', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '气体循环 500 m³/h 跑 10 min 到稳态；每 2 min 读进出口温度，读 15 点', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '算出口温度时程最大偏差 0.5–2 K；写资格带，不写单次读数', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '气体循环 1 件（进、出不消耗）+ 2 支 T 型偶/2 只毫伏表（不占用）→ 稳定性记录 1 份；记录是数据不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...LASER_GAS_LOOP_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...LASER_GAS_LOOP_MEASURE_ROUTES];
