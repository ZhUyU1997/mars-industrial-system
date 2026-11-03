/**
 * 精密小盘主轴径向/轴向跳动实测：杠杆比较仪 + 量块，盘车 8 点 × 3 圈。
 *
 * 独立量具是 plant/comparator + std/gauge-block-working，不是主轴自测；
 * 窗口取资格带 0.1–0.5 µm，注明“资格带，不是单次读数”。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PRECISION_SPINDLE_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/precision-spindle-runout-record',
    name: 'Precision Spindle Runout Record', name_zh: '精密主轴跳动记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'radial', kind: 'range', min: 0.1, max: 0.5, unit: 'µm', dir: 'atMost' },
      { param: 'axial', kind: 'range', min: 0.1, max: 0.5, unit: 'µm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 24, max: 24, unit: '点' },
    ],
  },
];

export const PRECISION_SPINDLE_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **精密主轴跳动：比较仪 + 量块，盘车 8 点 × 3 圈。**
     */
    id: 'measure/precision-spindle-runout',
    name: 'Precision Spindle Runout Measurement', name_zh: '精密主轴跳动测量',
    produces: [
      {
        item: 'mat/precision-spindle-runout-record',
        qty: q(1),
        gives: [
          { param: 'radial', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'axial', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'points', kind: 'range', min: 24, max: 24 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/precision-spindle', qty: q(1) }] }],
    needs: ['std/gauge-block-working', 'plant/metrology-room'],
    steps: [
      { note_zh: '装 P4 轴承、预紧；空转 30 min 到热平衡', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '杠杆比较仪 0.1 µm + 量块，盘车 8 点 × 3 圈读径向/轴向', performedBy: 'plant/comparator', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '写资格带 0.1–0.5 µm；不写单次读数', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(4) },
    unbalanced_zh: '主轴 1 件（进、出不消耗）+ 比较仪/量块（不占用）→ 跳动记录 1 份；记录是数据不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...PRECISION_SPINDLE_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PRECISION_SPINDLE_MEASURE_ROUTES];
