/**
 * 批量 formal calibration 记录 B：9 台量具的自校准记录。
 *
 * basis 全部是 assumed（设计值自校准，无计算依据）：按设计/公开值填，不是实测。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CALIBRATION_B_ITEMS: readonly Item[] = [
  /**
   * commissioning 诊断自校准：10 个 measure/* 窗口，basis=assumed（设计值自校准，无计算依据）。
   */
  {
    id: 'mat/cal-diagnostics-record',
    name: 'Fusion Diagnostics Self-Calibration Record', name_zh: '聚变诊断自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/fusionPower', kind: 'range', min: 400, max: 500, unit: 'MW' },
      { param: 'measure/q', kind: 'range', min: 5, max: 10, unit: '倍' },
      { param: 'measure/pulseLength', kind: 'range', min: 400, max: 600, unit: 's' },
      { param: 'measure/dutyCycle', kind: 'range', min: 0.1, max: 1, unit: '1' },
      { param: 'measure/injectedPower', kind: 'range', min: 45, max: 50, unit: 'MW' },
      { param: 'measure/installedPower', kind: 'range', min: 90, max: 95, unit: 'MW' },
      { param: 'measure/electricPower', kind: 'range', min: 150, max: 200, unit: 'MW' },
      { param: 'measure/efficiency', kind: 'range', min: 35, max: 40, unit: '%' },
      { param: 'measure/burnRate', kind: 'range', min: 0.05, max: 0.1, unit: 'kg/day' },
      { param: 'measure/tritiumInventory', kind: 'range', min: 2, max: 3, unit: 'kg' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },

  /**
   * 12 T 标准场磁体自校准：field、homogeneity、bore，basis=assumed（设计值自校准，无计算依据）。
   */
  {
    id: 'mat/cal-standard-field-magnet-record',
    name: '12 T Standard-Field Magnet Self-Calibration Record', name_zh: '12 T 标准场磁体自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/field', kind: 'range', min: 10, max: 13, unit: 'T' },
      { param: 'homogeneity', kind: 'range', min: 50, max: 500, unit: 'ppm' },
      { param: 'bore', kind: 'range', min: 50, max: 100, unit: 'mm' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },

  /**
   * 45 GJ dump 负载自校准：storedEnergy、current、voltage，basis=assumed（设计值自校准，无计算依据）。
   */
  {
    id: 'mat/cal-dump-load-record',
    name: '45 GJ Dump Load Self-Calibration Record', name_zh: '45 GJ 泄放负载自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/storedEnergy', kind: 'range', min: 30, max: 45, unit: 'GJ' },
      { param: 'measure/current', kind: 'range', min: 0, max: 70000, unit: 'A' },
      { param: 'measure/voltage', kind: 'range', min: 0, max: 10000, unit: 'V' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },

  /**
   * 高场 NMR 探头自校准：field、peakField、resolution、frequency，basis=assumed（设计值自校准，无计算依据）。
   */
  {
    id: 'mat/cal-high-field-nmr-record',
    name: 'High-Field NMR Probe Self-Calibration Record', name_zh: '高场 NMR 探头自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/field', kind: 'range', min: 10, max: 13, unit: 'T' },
      { param: 'measure/peakField', kind: 'range', min: 10, max: 13, unit: 'T' },
      { param: 'measure/resolution', kind: 'range', min: 1, max: 10, unit: 'ppm' },
      { param: 'measure/frequency', kind: 'range', min: 400, max: 600, unit: 'MHz' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },

  /**
   * 线圈储能测试台自校准：storedEnergy、current、voltage，basis=assumed（设计值自校准，无计算依据）。
   */
  {
    id: 'mat/cal-coil-energy-stand-record',
    name: 'Coil Energy Storage Test Stand Self-Calibration Record', name_zh: '线圈储能测试台自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/storedEnergy', kind: 'range', min: 30, max: 45, unit: 'GJ' },
      { param: 'measure/current', kind: 'range', min: 0, max: 70000, unit: 'A' },
      { param: 'measure/voltage', kind: 'range', min: 0, max: 10000, unit: 'V' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },

  /**
   * 低场 NMR 探头自校准：field、peakField、resolution、frequency，basis=assumed（设计值自校准，无计算依据）。
   */
  {
    id: 'mat/cal-low-field-nmr-record',
    name: 'Low-Field NMR Probe Self-Calibration Record', name_zh: '低场 NMR 探头自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/field', kind: 'range', min: 0, max: 6, unit: 'T' },
      { param: 'measure/peakField', kind: 'range', min: 0, max: 6, unit: 'T' },
      { param: 'resolution', kind: 'range', min: 1, max: 10, unit: 'ppm' },
      { param: 'measure/frequency', kind: 'range', min: 10, max: 300, unit: 'MHz' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },

  /**
   * 磁通计自校准：flux、accuracy、voltage，basis=assumed（设计值自校准，无计算依据）。
   */
  {
    id: 'mat/cal-fluxmeter-record',
    name: 'Fluxmeter Self-Calibration Record', name_zh: '磁通计自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/flux', kind: 'range', min: 0, max: 300, unit: 'Wb' },
      { param: 'accuracy', kind: 'range', min: 0.5, max: 2, unit: '%' },
      { param: 'measure/voltage', kind: 'range', min: 0, max: 10, unit: 'V' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },

  /**
   * 场图标准自校准：field、homogeneity、positioning，basis=assumed（设计值自校准，无计算依据）。
   */
  {
    id: 'mat/cal-field-mapping-record',
    name: 'Field Map Standard Self-Calibration Record', name_zh: '场图标准自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/field', kind: 'range', min: 10, max: 13, unit: 'T' },
      { param: 'homogeneity', kind: 'range', min: 50, max: 500, unit: 'ppm' },
      { param: 'positioning', kind: 'range', min: 0.1, max: 1, unit: 'mm' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },

  /**
   * 45 GJ 量热标准自校准：energy、temperatureRise、uncertainty，basis=assumed（设计值自校准，无计算依据）。
   */
  {
    id: 'mat/cal-calorimeter-record',
    name: '45 GJ Calorimetric Standard Self-Calibration Record', name_zh: '45 GJ 量热标准自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/energy', kind: 'range', min: 30, max: 45, unit: 'GJ' },
      { param: 'temperatureRise', kind: 'range', min: 5, max: 50, unit: 'K' },
      { param: 'uncertainty', kind: 'range', min: 1, max: 5, unit: '%' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
];

export const CALIBRATION_B_ROUTES: readonly Route[] = [
  {
    /**
     * diagnostics 自校准：设计值复核/自校准。
     *
     * formal self-calibration：按设计/公开值填，不是实测。
     */
    id: 'measure/cal-diagnostics',
    name: 'Fusion Diagnostics Self-Calibration', name_zh: '聚变诊断自校准',
    produces: [
      {
        item: 'mat/cal-diagnostics-record',
        qty: q(1),
        gives: [
          { param: 'measure/fusionPower', kind: 'range', min: 400, max: 500 },
          { param: 'measure/q', kind: 'range', min: 5, max: 10 },
          { param: 'measure/pulseLength', kind: 'range', min: 400, max: 600 },
          { param: 'measure/dutyCycle', kind: 'range', min: 0.1, max: 1 },
          { param: 'measure/injectedPower', kind: 'range', min: 45, max: 50 },
          { param: 'measure/installedPower', kind: 'range', min: 90, max: 95 },
          { param: 'measure/electricPower', kind: 'range', min: 150, max: 200 },
          { param: 'measure/efficiency', kind: 'range', min: 35, max: 40 },
          { param: 'measure/burnRate', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'measure/tritiumInventory', kind: 'range', min: 2, max: 3 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/fusion-reactor/diagnostics' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/fusion-reactor/diagnostics' },
    ],
    rate: { hours: q(1) },
  },
  {
    /**
     * 标准场磁体自校准：设计值复核/自校准。
     *
     * formal self-calibration：按设计/公开值填，不是实测。
     */
    id: 'measure/cal-standard-field-magnet',
    name: '12 T Standard-Field Magnet Self-Calibration', name_zh: '12 T 标准场磁体自校准',
    produces: [
      {
        item: 'mat/cal-standard-field-magnet-record',
        qty: q(1),
        gives: [
          { param: 'measure/field', kind: 'range', min: 10, max: 13 },
          { param: 'homogeneity', kind: 'range', min: 50, max: 500 },
          { param: 'bore', kind: 'range', min: 50, max: 100 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/standard-field-magnet-12t' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/standard-field-magnet-12t' },
    ],
    rate: { hours: q(1) },
  },
  {
    /**
     * dump 负载自校准：设计值复核/自校准。
     *
     * formal self-calibration：按设计/公开值填，不是实测。
     */
    id: 'measure/cal-dump-load',
    name: '45 GJ Dump Load Self-Calibration', name_zh: '45 GJ 泄放负载自校准',
    produces: [
      {
        item: 'mat/cal-dump-load-record',
        qty: q(1),
        gives: [
          { param: 'measure/storedEnergy', kind: 'range', min: 30, max: 45 },
          { param: 'measure/current', kind: 'range', min: 0, max: 70000 },
          { param: 'measure/voltage', kind: 'range', min: 0, max: 10000 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/dump-load-45gj' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/dump-load-45gj' },
    ],
    rate: { hours: q(1) },
  },
  {
    /**
     * 高场 NMR 探头自校准：设计值复核/自校准。
     *
     * formal self-calibration：按设计/公开值填，不是实测。
     */
    id: 'measure/cal-high-field-nmr',
    name: 'High-Field NMR Probe Self-Calibration', name_zh: '高场 NMR 探头自校准',
    produces: [
      {
        item: 'mat/cal-high-field-nmr-record',
        qty: q(1),
        gives: [
          { param: 'measure/field', kind: 'range', min: 10, max: 13 },
          { param: 'measure/peakField', kind: 'range', min: 10, max: 13 },
          { param: 'measure/resolution', kind: 'range', min: 1, max: 10 },
          { param: 'measure/frequency', kind: 'range', min: 400, max: 600 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/high-field-nmr-probe' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/high-field-nmr-probe' },
    ],
    rate: { hours: q(1) },
  },
  {
    /**
     * 线圈储能台自校准：设计值复核/自校准。
     *
     * formal self-calibration：按设计/公开值填，不是实测。
     */
    id: 'measure/cal-coil-energy-stand',
    name: 'Coil Energy Storage Test Stand Self-Calibration', name_zh: '线圈储能测试台自校准',
    produces: [
      {
        item: 'mat/cal-coil-energy-stand-record',
        qty: q(1),
        gives: [
          { param: 'measure/storedEnergy', kind: 'range', min: 30, max: 45 },
          { param: 'measure/current', kind: 'range', min: 0, max: 70000 },
          { param: 'measure/voltage', kind: 'range', min: 0, max: 10000 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/coil-energy-test-stand' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/coil-energy-test-stand' },
    ],
    rate: { hours: q(1) },
  },
  {
    /**
     * 低场 NMR 探头自校准：设计值复核/自校准。
     *
     * formal self-calibration：按设计/公开值填，不是实测。
     */
    id: 'measure/cal-low-field-nmr',
    name: 'Low-Field NMR Probe Self-Calibration', name_zh: '低场 NMR 探头自校准',
    produces: [
      {
        item: 'mat/cal-low-field-nmr-record',
        qty: q(1),
        gives: [
          { param: 'measure/field', kind: 'range', min: 0, max: 6 },
          { param: 'measure/peakField', kind: 'range', min: 0, max: 6 },
          { param: 'resolution', kind: 'range', min: 1, max: 10 },
          { param: 'measure/frequency', kind: 'range', min: 10, max: 300 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/low-field-nmr-probe' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/low-field-nmr-probe' },
    ],
    rate: { hours: q(1) },
  },
  {
    /**
     * 磁通计自校准：设计值复核/自校准。
     *
     * formal self-calibration：按设计/公开值填，不是实测。
     */
    id: 'measure/cal-fluxmeter',
    name: 'Fluxmeter Self-Calibration', name_zh: '磁通计自校准',
    produces: [
      {
        item: 'mat/cal-fluxmeter-record',
        qty: q(1),
        gives: [
          { param: 'measure/flux', kind: 'range', min: 0, max: 300 },
          { param: 'accuracy', kind: 'range', min: 0.5, max: 2 },
          { param: 'measure/voltage', kind: 'range', min: 0, max: 10 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/fluxmeter-300wb' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/fluxmeter-300wb' },
    ],
    rate: { hours: q(1) },
  },
  {
    /**
     * 场图标准自校准：设计值复核/自校准。
     *
     * formal self-calibration：按设计/公开值填，不是实测。
     */
    id: 'measure/cal-field-mapping',
    name: 'Field Map Standard Self-Calibration', name_zh: '场图标准自校准',
    produces: [
      {
        item: 'mat/cal-field-mapping-record',
        qty: q(1),
        gives: [
          { param: 'measure/field', kind: 'range', min: 10, max: 13 },
          { param: 'homogeneity', kind: 'range', min: 50, max: 500 },
          { param: 'positioning', kind: 'range', min: 0.1, max: 1 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/field-mapping-standard-12t' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/field-mapping-standard-12t' },
    ],
    rate: { hours: q(1) },
  },
  {
    /**
     * 量热标准自校准：设计值复核/自校准。
     *
     * formal self-calibration：按设计/公开值填，不是实测。
     */
    id: 'measure/cal-calorimeter',
    name: '45 GJ Calorimetric Standard Self-Calibration', name_zh: '45 GJ 量热标准自校准',
    produces: [
      {
        item: 'mat/cal-calorimeter-record',
        qty: q(1),
        gives: [
          { param: 'measure/energy', kind: 'range', min: 30, max: 45 },
          { param: 'temperatureRise', kind: 'range', min: 5, max: 50 },
          { param: 'uncertainty', kind: 'range', min: 1, max: 5 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/calorimeter-45gj' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/calorimeter-45gj' },
    ],
    rate: { hours: q(1) },
  },
];

export const DATA_ITEMS: readonly Item[] = [...CALIBRATION_B_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CALIBRATION_B_ROUTES];
