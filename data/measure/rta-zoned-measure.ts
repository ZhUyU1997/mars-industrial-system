/**
 * RTA 分区均匀性实测：49 点热电偶片 + 毫伏表，分别测 9 区 zoned 与 8 区本地控制。
 *
 * 独立量具：std/thermocouple-wafer-49、std/millivoltmeter-general、mat/thermocouple-cal-record。
 * 窗口取资格带（2–3 K / 0–8 K），不是单次读数。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const RTA_ZONED_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/rta-zoned-measure-record',
    name: 'Nine-Zone RTA Measurement Record', name_zh: '九区 RTA 测量记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'waferUniformity', kind: 'range', min: 2, max: 3, unit: 'K', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 49, max: 49, unit: '点' },
    ],
  },
  {
    id: 'mat/rta-zone-control-local-measure-record',
    name: '8-Zone Local Control Record', name_zh: '8 区本地控制记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'uniformity', kind: 'range', min: 0, max: 8, unit: 'K', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 49, max: 49, unit: '点' },
    ],
  },
];

export const RTA_ZONED_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **9 区 zoned：49 点片读片内均匀性 2–3 K。**
     */
    id: 'measure/rta-zoned-uniformity-measure',
    name: 'Nine-Zone RTA Measurement', name_zh: '九区 RTA 测量',
    produces: [{
      item: 'mat/rta-zoned-measure-record',
      qty: q(1),
      gives: [
        { param: 'waferUniformity', kind: 'range', min: 2, max: 3 },
        { param: 'points', kind: 'range', min: 49, max: 49 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: [
      'std/thermocouple-wafer-49',
      'plant/rta/slip-ring-98',
      { item: 'std/millivoltmeter-general', qty: q(49) },
      { item: 'mat/thermocouple-cal-record', qty: q(49) },
      'plant/metrology-room',
    ],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '装 49 点/200 mm 热电偶片到 zoned 自转台；98 根引线经滑环接 49 只毫伏表', performedBy: 'plant/robot' },
      { note_zh: 'zoned 机升到 1000–1300 °C 保 120 s；9 区 PID 投入', performedBy: 'plant/rta-zoned', under: [{ param: 'temperature', min: 1000, max: 1300 }] },
      { note_zh: '60 rpm 自转，每 2 min 读一遍、3 轮；算 49 点最大差 2–3 K', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '水 1 kg → zoned 49 点记录 1 份；片/滑环/表是量具，不消耗。',
  },
  {
    /**
     * **8 区本地控制：49 点片按 8 区归并，读区间均匀性 0–8 K。**
     */
    id: 'measure/rta-zone-control-local-uniformity',
    name: '8-Zone Local Control Measurement', name_zh: '8 区本地控制测量',
    produces: [{
      item: 'mat/rta-zone-control-local-measure-record',
      qty: q(1),
      gives: [
        { param: 'uniformity', kind: 'range', min: 0, max: 8 },
        { param: 'points', kind: 'range', min: 49, max: 49 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: [
      'std/thermocouple-wafer-49',
      { item: 'std/millivoltmeter-general', qty: q(49) },
      { item: 'mat/thermocouple-cal-record', qty: q(49) },
      {
        item: 'plant/rta/zone-control',
        qty: q(1),
        need: [{ param: 'zones', kind: 'range', min: 8, max: 8 }],
        onRelax: 'functional-lost',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '装 49 点片，98 根引线接 49 只毫伏表', performedBy: 'plant/robot' },
      { note_zh: '8 区本地控制上电（1–10 Hz），RTA 升到 1000–1200 °C 保 120 s', performedBy: 'plant/rta', under: [{ param: 'temperature', min: 1000, max: 1200 }] },
      { note_zh: '每 2 min 读一遍、3 轮；按 8 区归并，算区间最大差 0–8 K', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '水 1 kg → 8 区记录 1 份；片/表是量具，不消耗。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...RTA_ZONED_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...RTA_ZONED_MEASURE_ROUTES];
