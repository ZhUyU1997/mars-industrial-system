/**
 * 效率标准：0–100 % 电气效率比对件。
 *
 * 用万用表与锰铜精密电阻搭一个效率比对标准；量程是设计，不是读数。
 * 它只做电气效率，不代表光栅/射频/探测器的效率。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const EFFICIENCY_STANDARD_ITEMS: readonly Item[] = [
  /**
   * 效率标准：measure/efficiency 0–100 %、分辨率 0.1–1 %。
   */
  {
    id: 'plant/efficiency-standard',
    name: '效率标准',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/efficiency', kind: 'range', min: 0, max: 100, unit: '%' },
      { param: 'resolution', kind: 'range', min: 0.1, max: 1, unit: '%', dir: 'atMost' },
    ],
    // 组成件：万用表 1 台、锰铜精密电阻 1 件。
    composedOf: [
      { item: 'std/dvm-general', qty: q(1) },
      { item: 'std/precision-resistor-manganin', qty: q(1) },
    ],
  },
];

export const EFFICIENCY_STANDARD_ROUTES: readonly Route[] = [
  {
    /**
     * 效率标准装配：万用表 + 锰铜电阻 → 装配 → 一台。
     *
     * 0–100 % 与 0.1–1 % 是设计量程，不是读数。
     */
    id: 'make/efficiency-standard',
    name: '效率标准装配',
    produces: [
      {
        item: 'plant/efficiency-standard',
        qty: q(1),
        gives: [
          { param: 'measure/efficiency', kind: 'range', min: 0, max: 100, record: 'mat/cal-efficiency-standard-record' },
          { param: 'resolution', kind: 'range', min: 0.1, max: 1, record: 'mat/cal-efficiency-standard-record' },
        ],
      },
    ],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ITEMS: readonly Item[] = [...EFFICIENCY_STANDARD_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...EFFICIENCY_STANDARD_ROUTES];
