/**
 * 温度标准：0–1100 °C 参考温度源，覆盖 ambient 与热偶校准段。
 *
 * 用恒温槽、铜块、T 型热偶与运放读数搭参考；冰点/沸点未在火星复现，
 * 量程是设计，不是实测。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const TEMPERATURE_STANDARD_ITEMS: readonly Item[] = [
  /**
   * 温度标准：measure/temperature 0–1100 °C、分辨率 0.1–1 °C。
   *
   * 0–1100 覆盖 ambient（19–30）与热偶校准段（419–1085）；
   * 冰点/沸点未复现，是设计量程。
   */
  {
    id: 'plant/temperature-standard',
    name: '温度标准',
    unit: '台',
    category: 'machine',
    // 单件标准：恒温槽、热偶、读数按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/temperature', kind: 'range', min: 0, max: 1100, unit: '°C' },
      { param: 'resolution', kind: 'range', min: 0.1, max: 1, unit: '°C', dir: 'atMost' },
    ],
  },
];

export const TEMPERATURE_STANDARD_ROUTES: readonly Route[] = [
  {
    /**
     * 温度标准：铜 5 kg + 水 10 kg + T 型热偶 10 支 + 运放 10 件
     * → 恒温槽/冰点/沸点接口 → 热偶/读数 → 室温/热水两点标定 → 一台。
     *
     * 0–1100 °C 是设计；冰点/沸点未在火星复现，不是实测。
     */
    id: 'make/temperature-standard',
    name: '温度标准制造',
    produces: [
      {
        item: 'plant/temperature-standard',
        qty: q(1),
        gives: [
          { param: 'measure/temperature', kind: 'range', min: 0, max: 1100, record: 'mat/cal-temperature-standard-record' },
          { param: 'resolution', kind: 'range', min: 0.1, max: 1, record: 'mat/cal-temperature-standard-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(10) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(10) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '恒温槽、冰点/沸点接口', performedBy: 'plant/sheet-shop' },
      { note_zh: '热偶与读数', performedBy: 'plant/robot' },
      { note_zh: '用室温/热水两点标定', performedBy: 'plant/robot' },
    ],
  },
];

export const DATA_ITEMS: readonly Item[] = [...TEMPERATURE_STANDARD_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...TEMPERATURE_STANDARD_ROUTES];
