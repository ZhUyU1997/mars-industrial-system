/**
 * 660 mm 静压转台实测：比较仪 + 量块读轴向/径向，自准直仪读角。
 *
 * 独立量具：plant/comparator、std/gauge-block-working、std/autocollimator-precision。
 * 窗口取资格带 0.1–0.5 µm / 1–2″，不是单次读数。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const HYDROSTATIC_TABLE_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/hydrostatic-table-measure-record',
    name: 'Hydrostatic Rotary Table Record', name_zh: '静压转台记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'axial', kind: 'range', min: 0.1, max: 0.5, unit: 'µm', dir: 'atMost' },
      { param: 'radial', kind: 'range', min: 0.1, max: 0.5, unit: 'µm', dir: 'atMost' },
      { param: 'angle', kind: 'range', min: 1, max: 2, unit: '角秒', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 10, max: 10, unit: '点' },
    ],
  },
];

export const HYDROSTATIC_TABLE_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **静压转台：比较仪/量块测轴向径向，自准直仪测角。**
     */
    id: 'measure/hydrostatic-table-measure',
    name: 'Hydrostatic Rotary Table Measurement', name_zh: '静压转台测量',
    produces: [
      {
        item: 'mat/hydrostatic-table-measure-record',
        qty: q(1),
        gives: [
          { param: 'axial', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'radial', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'angle', kind: 'range', min: 1, max: 2 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/hydrostatic-rotary-table-660', qty: q(1) }] }],
    needs: ['std/autocollimator-precision', 'std/gauge-block-working', 'plant/metrology-room', 'plant/angle-standard'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '转台 0/90/180/270 四位置，比较仪 + 量块读轴向/径向，各 10 点', performedBy: 'plant/comparator', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '自准直仪读四位置角度，1–2″ 资格带', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '写资格带 0.1–0.5 µm/1–2″；不写单次读数', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '转台 1 台（进、出不消耗）+ 比较仪/量块/自准直仪（不占用）→ 实测记录 1 份；记录是数据不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...HYDROSTATIC_TABLE_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...HYDROSTATIC_TABLE_MEASURE_ROUTES];
