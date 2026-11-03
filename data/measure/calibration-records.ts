/**
 * 三台电学量具的 formal calibration 记录：60 kA 源、罗氏线圈、50 kA 分流器。
 *
 * basis 全部是 assumed（设计值自校准，无计算依据）：按设计/公开值填，不是实测。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CALIBRATION_RECORD_ITEMS: readonly Item[] = [
  /**
   * 60 kA 直流源自校准记录：current 0–60000 A、currentRipple 0.1–1 %、
   * dutyCycle 0.5–1，basis=assumed（设计值自校准，无计算依据）。
   */
  {
    id: 'mat/cal-dc-source-record',
    name: '60 kA DC Source Self-Calibration Record', name_zh: '60 kA 直流源自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/current', kind: 'range', min: 0, max: 60000, unit: 'A' },
      { param: 'currentRipple', kind: 'range', min: 0.1, max: 1, unit: '%' },
      { param: 'dutyCycle', kind: 'range', min: 0.5, max: 1, unit: '1' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },

  /**
   * 罗氏线圈自校准记录：current 0–60000 A、bandwidth 1e6–1e7 Hz、
   * accuracy 0.5–2 %，basis=assumed（设计值自校准，无计算依据）。
   */
  {
    id: 'mat/cal-rogowski-record',
    name: 'Rogowski Coil Self-Calibration Record', name_zh: '罗氏线圈自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/current', kind: 'range', min: 0, max: 60000, unit: 'A' },
      { param: 'measure/bandwidth', kind: 'range', min: 1e6, max: 1e7, unit: 'Hz' },
      { param: 'measure/accuracy', kind: 'range', min: 0.5, max: 2, unit: '%' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },

  /**
   * 50 kA 分流器自校准记录：current 0–60000 A、accuracy 0.05–0.2 %、
   * resistance 0.01–0.1 mΩ，basis=assumed（设计值自校准，无计算依据）。
   */
  {
    id: 'mat/cal-shunt-record',
    name: '50 kA Shunt Self-Calibration Record', name_zh: '50 kA 分流器自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/current', kind: 'range', min: 0, max: 60000, unit: 'A' },
      { param: 'accuracy', kind: 'range', min: 0.05, max: 0.2, unit: '%' },
      { param: 'resistance', kind: 'range', min: 0.01, max: 0.1, unit: 'mΩ' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
];

export const CALIBRATION_RECORD_ROUTES: readonly Route[] = [
  {
    /**
     * 60 kA 源自校准：设计值复核/自校准。
     *
     * formal self-calibration：按设计/公开值填，不是实测。
     */
    id: 'measure/cal-dc-source',
    name: '60 kA DC Source Self-Calibration', name_zh: '60 kA 直流源自校准',
    produces: [
      {
        item: 'mat/cal-dc-source-record',
        qty: q(1),
        gives: [
          { param: 'measure/current', kind: 'range', min: 0, max: 60000 },
          { param: 'currentRipple', kind: 'range', min: 0.1, max: 1 },
          { param: 'dutyCycle', kind: 'range', min: 0.5, max: 1 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/dc-source-60ka' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/dc-source-60ka' },
    ],
    rate: { hours: q(1) },
  },
  {
    /**
     * 罗氏线圈自校准：设计值复核/自校准。
     *
     * formal self-calibration：按设计/公开值填，不是实测。
     */
    id: 'measure/cal-rogowski',
    name: 'Rogowski Coil Self-Calibration', name_zh: '罗氏线圈自校准',
    produces: [
      {
        item: 'mat/cal-rogowski-record',
        qty: q(1),
        gives: [
          { param: 'measure/current', kind: 'range', min: 0, max: 60000 },
          { param: 'measure/bandwidth', kind: 'range', min: 1e6, max: 1e7 },
          { param: 'measure/accuracy', kind: 'range', min: 0.5, max: 2 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/rogowski-50ka' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/rogowski-50ka' },
    ],
    rate: { hours: q(1) },
  },
  {
    /**
     * 分流器自校准：设计值复核/自校准。
     *
     * formal self-calibration：按设计/公开值填，不是实测。
     */
    id: 'measure/cal-shunt',
    name: '50 kA Shunt Self-Calibration', name_zh: '50 kA 分流器自校准',
    produces: [
      {
        item: 'mat/cal-shunt-record',
        qty: q(1),
        gives: [
          { param: 'measure/current', kind: 'range', min: 0, max: 60000 },
          { param: 'accuracy', kind: 'range', min: 0.05, max: 0.2 },
          { param: 'resistance', kind: 'range', min: 0.01, max: 0.1 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/shunt-50ka-standard' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/shunt-50ka-standard' },
    ],
    rate: { hours: q(1) },
  },
];

export const DATA_ITEMS: readonly Item[] = [...CALIBRATION_RECORD_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CALIBRATION_RECORD_ROUTES];
