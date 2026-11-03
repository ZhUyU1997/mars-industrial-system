/**
 * 9 区灯阵相对精度实测：9 只光电高温计 + 黑体，读区间相对偏差。
 *
 * 独立量具：std/photoelectric-pyrometer-general ×9 + blackbody-cavity。
 * 窗口取资格带 1–1.5 K，不是单次读数。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const RTA_ZONE_LAMP_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/rta-zone-lamp-measure-record',
    name: '9 区灯阵记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'relativeAccuracy', kind: 'range', min: 1, max: 1.5, unit: 'K', dir: 'atMost' },
      { param: 'pyrometers', kind: 'range', min: 9, max: 9, unit: '只' },
      { param: 'points', kind: 'range', min: 3, max: 3, unit: '点' },
    ],
  },
];

export const RTA_ZONE_LAMP_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **9 区灯阵：9 只高温计对黑体标定后读区间相对偏差。**
     */
    id: 'measure/rta-zone-lamp-measure',
    name: '9 区灯阵测量',
    produces: [{
      item: 'mat/rta-zone-lamp-measure-record',
      qty: q(1),
      gives: [
        { param: 'relativeAccuracy', kind: 'range', min: 1, max: 1.5 },
        { param: 'pyrometers', kind: 'range', min: 9, max: 9 },
        { param: 'points', kind: 'range', min: 3, max: 3 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'plant/rta/zone-lamp', qty: q(1) }] }],
    needs: [
      { item: 'std/photoelectric-pyrometer-general', qty: q(9) },
      'std/photoelectric-pyrometer-general/blackbody-cavity',
      'plant/metrology-room',
    ],
    rate: { hours: q(6) },
    steps: [
      { note_zh: '9 只高温计对黑体 800–1200 °C 标定，记录各只偏差', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '9 只高温计对准 9 区灯阵，60–80% 功率，读 3 点', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '算区间相对偏差 1–1.5 K；写资格带，不写单次读数', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '灯阵 1 件（进、出不消耗）+ 9 只高温计/黑体（不占用）→ 相对精度记录 1 份；记录是数据不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...RTA_ZONE_LAMP_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...RTA_ZONE_LAMP_MEASURE_ROUTES];
