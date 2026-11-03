/**
 * X 射线衍射仪分辨率实测：FZ-Si 标准晶体 + 角度标准 + 摇摆曲线半高宽。
 *
 * 独立标准：std/fz-silicon（无位错单晶）+ std/angle-standard（0.5–2″）。
 * 窗口取资格带 0.001–0.002°；不是单次读数。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const XRAY_DIFFRACTOMETER_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/xray-diffractometer-measure-record',
    name: 'X 射线衍射仪分辨率记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 0.001, max: 0.002, unit: '°', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 10, max: 10, unit: '点' },
    ],
  },
];

export const XRAY_DIFFRACTOMETER_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **X 射线衍射仪分辨率：FZ-Si 标准晶体摇摆曲线 + 角度标准。**
     */
    id: 'measure/xray-diffractometer-resolution',
    name: 'X 射线衍射仪分辨率测量',
    produces: [
      {
        item: 'mat/xray-diffractometer-measure-record',
        qty: q(1),
        gives: [
          { param: 'resolution', kind: 'range', min: 0.001, max: 0.002 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/fz-silicon', qty: q(1) }] },
    ],
    needs: ['std/angle-standard', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '装 FZ-Si 标准晶体，Cu Kα 0.154 nm 光路对准', performedBy: 'plant/xray-diffractometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '用 24 面角度标准校 θ/2θ 零点，0.5–2″ 角度基准', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '摇摆曲线 10 点，半高宽判 0.001–0.002°；写资格带，不写单次读数', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '衍射仪 1 台（进、出不消耗）+ FZ-Si 标准 1 块（不消耗）→ 分辨率记录 1 份；记录是数据不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...XRAY_DIFFRACTOMETER_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...XRAY_DIFFRACTOMETER_MEASURE_ROUTES];
