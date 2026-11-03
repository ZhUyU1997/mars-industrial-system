/**
 * 最后一批 formal calibration D：11 台量具的 27 个窗口。
 *
 * basis 全部是 assumed（设计值自校准，无计算依据）：按设计/公开值填，不是实测。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CALIBRATION_D_ITEMS: readonly Item[] = [
  {
    id: 'mat/cal-emissometer-80k-record',
    name: '80 K 发射率计自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/emissivity', kind: 'range', min: 0.01, max: 0.2, unit: '1' },
      { param: 'temperature', kind: 'range', min: 80, max: 100, unit: 'K' },
      { param: 'uncertainty', kind: 'range', min: 0.01, max: 0.05, unit: '1' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-transient-heat-source-record',
    name: '瞬态热源自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/heatFlux', kind: 'range', min: 0, max: 30, unit: 'MW/m²' },
      { param: 'measure/transientHeatFlux', kind: 'range', min: 0, max: 30, unit: 'MW/m²' },
      { param: 'pulse', kind: 'range', min: 1, max: 10, unit: 'ms' },
      { param: 'energy', kind: 'range', min: 0, max: 100, unit: 'kJ' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-he-inventory-meter-record',
    name: '氦存量计自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/mass', kind: 'range', min: 0, max: 30000, unit: 'kg' },
      { param: 'measure/heliumInventory', kind: 'range', min: 0, max: 30000, unit: 'kg' },
      { param: 'pressure', kind: 'range', min: 0, max: 20, unit: 'MPa' },
      { param: 'temperature', kind: 'range', min: 250, max: 350, unit: 'K' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-angle-standard-record',
    name: '角度标准器自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/angle', kind: 'range', min: 0, max: 360, unit: '°' },
      { param: 'resolution', kind: 'range', min: 0.1, max: 1, unit: '″' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-thickness-standard-record',
    name: '厚度标准器自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/thickness', kind: 'range', min: 0, max: 300, unit: 'mm' },
      { param: 'resolution', kind: 'range', min: 0.0001, max: 0.1, unit: 'mm' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-leak-rate-standard-record',
    name: '漏率标准器自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/leakRate', kind: 'range', min: 0, max: 0.001, unit: 'Pa·L/s' },
      { param: 'accuracy', kind: 'range', min: 1, max: 5, unit: '%' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-power-standard-100w-record',
    name: '100 W 功率标准器自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/power', kind: 'range', min: 0, max: 100, unit: 'W' },
      { param: 'accuracy', kind: 'range', min: 0.2, max: 1, unit: '%' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-velocity-standard-record',
    name: '速度标准器自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/velocity', kind: 'range', min: 0, max: 300, unit: 'm/s' },
      { param: 'accuracy', kind: 'range', min: 1, max: 5, unit: '%' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-length-standard-300mm-record',
    name: '300 mm 长度标准器自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/length', kind: 'range', min: 0, max: 300, unit: 'mm' },
      { param: 'accuracy', kind: 'range', min: 0.01, max: 0.1, unit: 'mm' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-efficiency-standard-record',
    name: '效率标准器自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/efficiency', kind: 'range', min: 0, max: 100, unit: '%' },
      { param: 'resolution', kind: 'range', min: 0.1, max: 1, unit: '%' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-temperature-standard-record',
    name: '温度标准器自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/temperature', kind: 'range', min: 0, max: 1100, unit: '°C' },
      { param: 'resolution', kind: 'range', min: 0.1, max: 1, unit: '°C' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
];

export const CALIBRATION_D_ROUTES: readonly Route[] = [
  {
    id: 'measure/cal-emissometer-80k',
    name: '80 K 发射率计自校准',
    produces: [{
      item: 'mat/cal-emissometer-80k-record',
      qty: q(1),
      gives: [
        { param: 'measure/emissivity', kind: 'range', min: 0.01, max: 0.2 },
        { param: 'temperature', kind: 'range', min: 80, max: 100 },
        { param: 'uncertainty', kind: 'range', min: 0.01, max: 0.05 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/emissometer-80k' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/emissometer-80k' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-transient-heat-source',
    name: '瞬态热源自校准',
    produces: [{
      item: 'mat/cal-transient-heat-source-record',
      qty: q(1),
      gives: [
        { param: 'measure/heatFlux', kind: 'range', min: 0, max: 30 },
        { param: 'measure/transientHeatFlux', kind: 'range', min: 0, max: 30 },
        { param: 'pulse', kind: 'range', min: 1, max: 10 },
        { param: 'energy', kind: 'range', min: 0, max: 100 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/transient-heat-source' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/transient-heat-source' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-he-inventory-meter',
    name: '氦存量计自校准',
    produces: [{
      item: 'mat/cal-he-inventory-meter-record',
      qty: q(1),
      gives: [
        { param: 'measure/mass', kind: 'range', min: 0, max: 30000 },
        { param: 'measure/heliumInventory', kind: 'range', min: 0, max: 30000 },
        { param: 'pressure', kind: 'range', min: 0, max: 20 },
        { param: 'temperature', kind: 'range', min: 250, max: 350 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/he-inventory-meter' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/he-inventory-meter' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-angle-standard',
    name: '角度标准器自校准',
    produces: [{
      item: 'mat/cal-angle-standard-record',
      qty: q(1),
      gives: [
        { param: 'measure/angle', kind: 'range', min: 0, max: 360 },
        { param: 'resolution', kind: 'range', min: 0.1, max: 1 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/angle-standard' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/angle-standard' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-thickness-standard',
    name: '厚度标准器自校准',
    produces: [{
      item: 'mat/cal-thickness-standard-record',
      qty: q(1),
      gives: [
        { param: 'measure/thickness', kind: 'range', min: 0, max: 300 },
        { param: 'resolution', kind: 'range', min: 0.0001, max: 0.1 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/thickness-standard' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/thickness-standard' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-leak-rate-standard',
    name: '漏率标准器自校准',
    produces: [{
      item: 'mat/cal-leak-rate-standard-record',
      qty: q(1),
      gives: [
        { param: 'measure/leakRate', kind: 'range', min: 0, max: 0.001 },
        { param: 'accuracy', kind: 'range', min: 1, max: 5 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/leak-rate-standard' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/leak-rate-standard' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-power-standard-100w',
    name: '100 W 功率标准器自校准',
    produces: [{
      item: 'mat/cal-power-standard-100w-record',
      qty: q(1),
      gives: [
        { param: 'measure/power', kind: 'range', min: 0, max: 100 },
        { param: 'accuracy', kind: 'range', min: 0.2, max: 1 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/power-standard-100w' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/power-standard-100w' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-velocity-standard',
    name: '速度标准器自校准',
    produces: [{
      item: 'mat/cal-velocity-standard-record',
      qty: q(1),
      gives: [
        { param: 'measure/velocity', kind: 'range', min: 0, max: 300 },
        { param: 'accuracy', kind: 'range', min: 1, max: 5 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/velocity-standard' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/velocity-standard' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-length-standard-300mm',
    name: '300 mm 长度标准器自校准',
    produces: [{
      item: 'mat/cal-length-standard-300mm-record',
      qty: q(1),
      gives: [
        { param: 'measure/length', kind: 'range', min: 0, max: 300 },
        { param: 'accuracy', kind: 'range', min: 0.01, max: 0.1 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/length-standard-300mm' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/length-standard-300mm' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-efficiency-standard',
    name: '效率标准器自校准',
    produces: [{
      item: 'mat/cal-efficiency-standard-record',
      qty: q(1),
      gives: [
        { param: 'measure/efficiency', kind: 'range', min: 0, max: 100 },
        { param: 'resolution', kind: 'range', min: 0.1, max: 1 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/efficiency-standard' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/efficiency-standard' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-temperature-standard',
    name: '温度标准器自校准',
    produces: [{
      item: 'mat/cal-temperature-standard-record',
      qty: q(1),
      gives: [
        { param: 'measure/temperature', kind: 'range', min: 0, max: 1100 },
        { param: 'resolution', kind: 'range', min: 0.1, max: 1 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/temperature-standard' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/temperature-standard' },
    ],
    rate: { hours: q(1) },
  },
];

export const DATA_ITEMS: readonly Item[] = [...CALIBRATION_D_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CALIBRATION_D_ROUTES];
