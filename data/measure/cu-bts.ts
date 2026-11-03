/**
 * Cu 离位 BTS 记录条目（从 data/machine/cmos.ts 迁入，R13）。
 */

import type { Item, Route } from '../../src/index.ts';

export const DATA_ITEMS: readonly Item[] = [
  /**
   * Cu 离位 BTS 记录。**由 `measure/cu-bts-leakage` 产出。**
   *
   *   leakageBefore/After 1e-12–1e-6 A
   *   flatbandShift       -5–5 V
   *   stressTemperature   150–200 °C
   *   stressField         0.5–2 MV/cm（设计 1 MV/cm）
   */
  {
    id: 'mat/cu-bts-record',
    name: 'Cu Off-Line BTS Record', name_zh: 'Cu 离位 BTS 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'leakageBefore', kind: 'range', min: 1e-12, max: 1e-6, unit: 'A' },
      { param: 'leakageAfter', kind: 'range', min: 1e-12, max: 1e-6, unit: 'A' },
      { param: 'flatbandShift', kind: 'range', min: -5, max: 5, unit: 'V' },
      { param: 'stressTemperature', kind: 'range', min: 150, max: 200, unit: '°C' },
      { param: 'stressField', kind: 'range', min: 0.5, max: 2, unit: 'MV/cm' },
    ],
  },
];

export const DATA_ROUTES: readonly Route[] = [];
