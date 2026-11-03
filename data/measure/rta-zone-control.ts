/**
 * 16 区 RTA 分区均匀性实测：49 点热电偶片 + 滑环 + 毫伏表，跑 plant/rta-zoned。
 *
 * 独立量具：std/thermocouple-wafer-49、std/millivoltmeter-general、mat/thermocouple-cal-record；
 * 窗口取 plant/rta-zoned 实际能力 0–3 K，不是单次读数。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const RTA_ZONE_CONTROL_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/rta-zone-control-measure-record',
    name: '16 区 RTA记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'uniformity', kind: 'range', min: 0, max: 3, unit: 'K' },
      { param: 'points', kind: 'range', min: 49, max: 49, unit: '点' },
    ],
  },
];

export const RTA_ZONE_CONTROL_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **16 区 RTA：49 点热电偶片读分区均匀性。**
     */
    id: 'measure/rta-zone-control-uniformity',
    name: '16 区 RTA 测量',
    produces: [
      {
        item: 'mat/rta-zone-control-measure-record',
        qty: q(1),
        gives: [
          { param: 'uniformity', kind: 'range', min: 0, max: 3 },
          { param: 'points', kind: 'range', min: 49, max: 49 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/thermocouple-wafer-49', qty: q(1) }] }],
    needs: [
      'std/millivoltmeter-general',
      'mat/thermocouple-cal-record',
      'plant/metrology-room',
    ],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '装 49 点/200 mm 热电偶片，滑环引线接毫伏表', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: 'plant/rta-zoned 升到 1000–1200 °C 保 120 s；49 点逐点读 3 轮', performedBy: 'plant/rta-zoned', under: [{ param: 'temperature', min: 1000, max: 1200 }] },
      { note_zh: '算 49 点最大差 0–3 K；写资格带，不写单次读数', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '热电偶片 1 件（不消耗）+ RTA/毫伏表（不占用）→ 均匀性记录 1 份；记录是数据不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...RTA_ZONE_CONTROL_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...RTA_ZONE_CONTROL_MEASURE_ROUTES];
