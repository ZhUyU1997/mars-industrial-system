/**
 * 14:1 RF 合成器插入损耗实测：VNA S21，27 MHz，SOLT 校准。
 *
 * 独立量具：std/vna-3ghz（10 MHz–3 GHz、动态范围 100–130 dB）。
 * 窗口取资格带 0.3–0.8 dB，不是单次读数。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const RF_COMBINER_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/rf-combiner-measure-record',
    name: 'RF 合成器记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'insertionLoss', kind: 'range', min: 0.3, max: 0.8, unit: 'dB', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 10, max: 10, unit: '点' },
    ],
  },
];

export const RF_COMBINER_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **RF 合成器：VNA 27 MHz S21 读插入损耗。**
     */
    id: 'measure/rf-combiner-insertion-loss',
    name: 'RF 合成器测量',
    produces: [
      {
        item: 'mat/rf-combiner-measure-record',
        qty: q(1),
        gives: [
          { param: 'insertionLoss', kind: 'range', min: 0.3, max: 0.8 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/rf-combiner', qty: q(1) }] }],
    needs: [
      {
        item: 'std/vna-3ghz',
        qty: q(1),
        need: [{ param: 'frequency', kind: 'range', min: 27000000, max: 27000000 }],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(4) },
    steps: [
      { note_zh: 'VNA SOLT 校准到 27 MHz；合成器 14 路接 50 Ω 负载', performedBy: 'std/vna-3ghz', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '读 S21 10 点，插入损耗 0.3–0.8 dB；写资格带，不写单次读数', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: 'RF 合成器 1 台（进、出不消耗）+ VNA（不占用）→ 插入损耗记录 1 份；记录是数据不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...RF_COMBINER_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...RF_COMBINER_MEASURE_ROUTES];
