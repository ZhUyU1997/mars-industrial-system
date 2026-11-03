/**
 * 20 kW 板条激光实测：水冷量热器读输出功率。
 *
 * 独立量具：plant/laser-calorimeter；窗口取资格带 18–22 kW，不是单次读数。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const SLAB_LASER_20KW_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/slab-laser-20kw-measure-record',
    name: '20 kW 板条激光记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 18000, max: 22000, unit: 'W' },
      { param: 'points', kind: 'range', min: 10, max: 10, unit: '点' },
    ],
  },
];

export const SLAB_LASER_20KW_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **20 kW 板条激光：量热器读 10 点输出功率。**
     */
    id: 'measure/slab-laser-20kw-power',
    name: '20 kW 板条激光测量',
    produces: [
      {
        item: 'mat/slab-laser-20kw-measure-record',
        qty: q(1),
        gives: [
          { param: 'power', kind: 'range', min: 18000, max: 22000 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/euv-source/laser', qty: q(1) }] }],
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
      { note_zh: '水冷量热器接 20 kW 输出，预热 10 min；水路 20–50 L/min', performedBy: 'plant/laser-calorimeter', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '读 10 点输出功率 18–22 kW；写资格带，不写单次读数', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '板条激光 1 台（进、出不消耗）+ 量热器（不占用）→ 功率记录 1 份；水是冷却水。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...SLAB_LASER_20KW_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...SLAB_LASER_20KW_MEASURE_ROUTES];
