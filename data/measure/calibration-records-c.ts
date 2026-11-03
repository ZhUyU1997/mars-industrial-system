/**
 * 批量 formal calibration C：12 台量具的自校准记录。
 *
 * basis 全部是 assumed（设计值自校准，无计算依据）：按设计/公开值填，不是实测。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CALIBRATION_C_ITEMS: readonly Item[] = [
  {
    id: 'mat/cal-cycle-time-adapter-record',
    name: 'Cycle-Time Adapter Self-Calibration Record', name_zh: '周期时间适配器自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/cycleTime', kind: 'range', min: 0.001, max: 10, unit: 'ms' },
      { param: 'resolution', kind: 'range', min: 1e-7, max: 1e-5, unit: 's' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-pressure-adapter-record',
    name: 'Pressure Adapter Self-Calibration Record', name_zh: '压力适配器自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/pressure', kind: 'range', min: 1e-6, max: 1e-2, unit: 'Pa' },
      { param: 'measure/vacuum', kind: 'range', min: 1e-6, max: 1e-2, unit: 'Pa' },
      { param: 'accuracy', kind: 'range', min: 1, max: 5, unit: '%' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-boron-assay-adapter-record',
    name: 'Boron Content Analysis Adapter Self-Calibration Record', name_zh: '硼含量分析适配器自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/boronContent', kind: 'range', min: 0.01, max: 100000, unit: 'ppm' },
      { param: 'accuracy', kind: 'range', min: 1, max: 5, unit: '%' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-weighbridge-500t-record',
    name: '500 t Weighbridge Self-Calibration Record', name_zh: '500 t 地磅自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/mass', kind: 'range', min: 0, max: 600000, unit: 'kg' },
      { param: 'measure/sectorMass', kind: 'range', min: 0, max: 600000, unit: 'kg' },
      { param: 'resolution', kind: 'range', min: 1, max: 10, unit: 'kg' },
      { param: 'accuracy', kind: 'range', min: 0.1, max: 0.5, unit: '%' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-laser-tracker-30m-record',
    name: '30 m Laser Tracker Self-Calibration Record', name_zh: '30 m 激光跟踪仪自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/length', kind: 'range', min: 0, max: 30, unit: 'm' },
      { param: 'accuracy', kind: 'range', min: 0.05, max: 0.5, unit: 'mm' },
      { param: 'measure/angle', kind: 'range', min: 0, max: 360, unit: '°' },
      { param: 'measure/volume', kind: 'range', min: 0, max: 20000, unit: 'm³' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-cryo-load-75kw-record',
    name: '75 kW Cryogenic Load Self-Calibration Record', name_zh: '75 kW 低温负载自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/coolingPower', kind: 'range', min: 0, max: 80, unit: 'kW' },
      { param: 'temperature', kind: 'range', min: 3.8, max: 4.5, unit: 'K' },
      { param: 'measure/heatLeak', kind: 'range', min: 0, max: 100, unit: 'kW' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-he-leak-detector-record',
    name: 'Helium Leak Detector Self-Calibration Record', name_zh: '氦检漏仪自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/leakRate', kind: 'range', min: 1e-12, max: 1e-8, unit: 'Pa·m³/s' },
      { param: 'measure/pressure', kind: 'range', min: 1e-6, max: 1e-2, unit: 'Pa' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-thermostat-80-100k-record',
    name: '80–100 K Thermostat Self-Calibration Record', name_zh: '80–100 K 恒温器自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'temperature', kind: 'range', min: 80, max: 100, unit: 'K' },
      { param: 'measure/temperature', kind: 'range', min: 80, max: 100, unit: 'K' },
      { param: 'stability', kind: 'range', min: 0.1, max: 1, unit: 'K' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-heat-flux-rig-10mw-record',
    name: '10 MW Heat Flux Rig Self-Calibration Record', name_zh: '10 MW 热流试验台自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/heatFlux', kind: 'range', min: 0, max: 12, unit: 'MW/m²' },
      { param: 'measure/steadyHeatFlux', kind: 'range', min: 0, max: 12, unit: 'MW/m²' },
      { param: 'measure/power', kind: 'range', min: 0, max: 100, unit: 'kW' },
      { param: 'area', kind: 'range', min: 1, max: 10, unit: 'cm²' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-tritium-calorimeter-record',
    name: 'Tritium Calorimeter Self-Calibration Record', name_zh: '氚量热计自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/tritiumInventory', kind: 'range', min: 0, max: 5, unit: 'kg' },
      { param: 'measure/heat', kind: 'range', min: 0, max: 2000, unit: 'W' },
      { param: 'resolution', kind: 'range', min: 1, max: 10, unit: 'mW' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-control-availability-bench-record',
    name: 'Control Availability Test Bench Self-Calibration Record', name_zh: '控制可用性试验台自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/availability', kind: 'range', min: 0.8, max: 0.99, unit: '1' },
      { param: 'measure/cycles', kind: 'range', min: 1000, max: 1000000, unit: '次' },
      { param: 'measure/response', kind: 'range', min: 0.1, max: 10, unit: 'ms' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
  {
    id: 'mat/cal-concrete-thickness-gauge-record',
    name: 'Concrete Thickness Gauge Self-Calibration Record', name_zh: '混凝土测厚仪自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'measure/thickness', kind: 'range', min: 0.5, max: 3, unit: 'm' },
      { param: 'measure/velocity', kind: 'range', min: 2000, max: 5000, unit: 'm/s' },
      { param: 'accuracy', kind: 'range', min: 1, max: 5, unit: '%' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
];

export const CALIBRATION_C_ROUTES: readonly Route[] = [
  {
    id: 'measure/cal-cycle-time-adapter',
    name: 'Cycle-Time Adapter Self-Calibration', name_zh: '周期时间适配器自校准',
    produces: [{
      item: 'mat/cal-cycle-time-adapter-record',
      qty: q(1),
      gives: [
        { param: 'measure/cycleTime', kind: 'range', min: 0.001, max: 10 },
        { param: 'resolution', kind: 'range', min: 1e-7, max: 1e-5 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/cycle-time-adapter' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/cycle-time-adapter' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-pressure-adapter',
    name: 'Pressure Adapter Self-Calibration', name_zh: '压力适配器自校准',
    produces: [{
      item: 'mat/cal-pressure-adapter-record',
      qty: q(1),
      gives: [
        { param: 'measure/pressure', kind: 'range', min: 1e-6, max: 1e-2 },
        { param: 'measure/vacuum', kind: 'range', min: 1e-6, max: 1e-2 },
        { param: 'accuracy', kind: 'range', min: 1, max: 5 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/pressure-adapter' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/pressure-adapter' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-boron-assay-adapter',
    name: 'Boron Content Analysis Adapter Self-Calibration', name_zh: '硼含量分析适配器自校准',
    produces: [{
      item: 'mat/cal-boron-assay-adapter-record',
      qty: q(1),
      gives: [
        { param: 'measure/boronContent', kind: 'range', min: 0.01, max: 100000 },
        { param: 'accuracy', kind: 'range', min: 1, max: 5 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/boron-assay-adapter' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/boron-assay-adapter' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-weighbridge-500t',
    name: '500 t Weighbridge Self-Calibration', name_zh: '500 t 地磅自校准',
    produces: [{
      item: 'mat/cal-weighbridge-500t-record',
      qty: q(1),
      gives: [
        { param: 'measure/mass', kind: 'range', min: 0, max: 600000 },
        { param: 'measure/sectorMass', kind: 'range', min: 0, max: 600000 },
        { param: 'resolution', kind: 'range', min: 1, max: 10 },
        { param: 'accuracy', kind: 'range', min: 0.1, max: 0.5 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/weighbridge-500t' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/weighbridge-500t' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-laser-tracker-30m',
    name: '30 m Laser Tracker Self-Calibration', name_zh: '30 m 激光跟踪仪自校准',
    produces: [{
      item: 'mat/cal-laser-tracker-30m-record',
      qty: q(1),
      gives: [
        { param: 'measure/length', kind: 'range', min: 0, max: 30 },
        { param: 'accuracy', kind: 'range', min: 0.05, max: 0.5 },
        { param: 'measure/angle', kind: 'range', min: 0, max: 360 },
        { param: 'measure/volume', kind: 'range', min: 0, max: 20000 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/laser-tracker-30m' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/laser-tracker-30m' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-cryo-load-75kw',
    name: '75 kW Cryogenic Load Self-Calibration', name_zh: '75 kW 低温负载自校准',
    produces: [{
      item: 'mat/cal-cryo-load-75kw-record',
      qty: q(1),
      gives: [
        { param: 'measure/coolingPower', kind: 'range', min: 0, max: 80 },
        { param: 'temperature', kind: 'range', min: 3.8, max: 4.5 },
        { param: 'measure/heatLeak', kind: 'range', min: 0, max: 100 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/cryo-load-75kw' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/cryo-load-75kw' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-he-leak-detector',
    name: 'Helium Leak Detector Self-Calibration', name_zh: '氦检漏仪自校准',
    produces: [{
      item: 'mat/cal-he-leak-detector-record',
      qty: q(1),
      gives: [
        { param: 'measure/leakRate', kind: 'range', min: 1e-12, max: 1e-8 },
        { param: 'measure/pressure', kind: 'range', min: 1e-6, max: 1e-2 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/he-leak-detector' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/he-leak-detector' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-thermostat-80-100k',
    name: '80–100 K Thermostat Self-Calibration', name_zh: '80–100 K 恒温器自校准',
    produces: [{
      item: 'mat/cal-thermostat-80-100k-record',
      qty: q(1),
      gives: [
        { param: 'temperature', kind: 'range', min: 80, max: 100 },
        { param: 'measure/temperature', kind: 'range', min: 80, max: 100 },
        { param: 'stability', kind: 'range', min: 0.1, max: 1 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/thermostat-80-100k' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/thermostat-80-100k' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-heat-flux-rig-10mw',
    name: '10 MW Heat Flux Rig Self-Calibration', name_zh: '10 MW 热流试验台自校准',
    produces: [{
      item: 'mat/cal-heat-flux-rig-10mw-record',
      qty: q(1),
      gives: [
        { param: 'measure/heatFlux', kind: 'range', min: 0, max: 12 },
        { param: 'measure/steadyHeatFlux', kind: 'range', min: 0, max: 12 },
        { param: 'measure/power', kind: 'range', min: 0, max: 100 },
        { param: 'area', kind: 'range', min: 1, max: 10 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/heat-flux-rig-10mw' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/heat-flux-rig-10mw' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-tritium-calorimeter',
    name: 'Tritium Calorimeter Self-Calibration', name_zh: '氚量热计自校准',
    produces: [{
      item: 'mat/cal-tritium-calorimeter-record',
      qty: q(1),
      gives: [
        { param: 'measure/tritiumInventory', kind: 'range', min: 0, max: 5 },
        { param: 'measure/heat', kind: 'range', min: 0, max: 2000 },
        { param: 'resolution', kind: 'range', min: 1, max: 10 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/tritium-calorimeter' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/tritium-calorimeter' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-control-availability-bench',
    name: 'Control Availability Test Bench Self-Calibration', name_zh: '控制可用性试验台自校准',
    produces: [{
      item: 'mat/cal-control-availability-bench-record',
      qty: q(1),
      gives: [
        { param: 'measure/availability', kind: 'range', min: 0.8, max: 0.99 },
        { param: 'measure/cycles', kind: 'range', min: 1000, max: 1000000 },
        { param: 'measure/response', kind: 'range', min: 0.1, max: 10 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/control-availability-bench' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/control-availability-bench' },
    ],
    rate: { hours: q(1) },
  },
  {
    id: 'measure/cal-concrete-thickness-gauge',
    name: 'Concrete Thickness Gauge Self-Calibration', name_zh: '混凝土测厚仪自校准',
    produces: [{
      item: 'mat/cal-concrete-thickness-gauge-record',
      qty: q(1),
      gives: [
        { param: 'measure/thickness', kind: 'range', min: 0.5, max: 3 },
        { param: 'measure/velocity', kind: 'range', min: 2000, max: 5000 },
        { param: 'accuracy', kind: 'range', min: 1, max: 5 },
        { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
      ],
    }],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '设计值复核/自校准', performedBy: 'plant/concrete-thickness-gauge' },
      { note_zh: 'formal self-calibration：按设计/公开值填，不是实测', performedBy: 'plant/concrete-thickness-gauge' },
    ],
    rate: { hours: q(1) },
  },
];

export const DATA_ITEMS: readonly Item[] = [...CALIBRATION_C_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CALIBRATION_C_ROUTES];
