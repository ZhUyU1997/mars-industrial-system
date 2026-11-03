/**
 * 聚变装置最后 8 个窗口记录：PF 电流、CS 峰值场、恒温器体积、冷屏温度/发射率、
 * 低温厂冷量/氦库存、控制可用率。
 *
 * basis 分别为 assumed / public-spec / calculated / assumed / assumed /
 * public-spec / calculated / assumed，都不是实测。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FUSION_FINAL_ITEMS: readonly Item[] = [
  /**
   * PF 电流记录：42–50 kA，basis=assumed。
   */
  {
    id: 'mat/fusion-pf-current-record',
    name: 'PF 电流记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'current', kind: 'range', min: 42, max: 50, unit: 'kA' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },

  /**
   * CS 峰值场记录：12.5–13 T，basis=public-spec。
   */
  {
    id: 'mat/fusion-cs-field-record',
    name: 'CS 峰值场记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'peakField', kind: 'range', min: 12.5, max: 13, unit: 'T' },
      { param: 'basis', kind: 'enum', values: ['public-spec'] },
    ],
  },

  /**
   * 恒温器体积记录：15,000–16,000 m³，basis=calculated。
   */
  {
    id: 'mat/fusion-cryostat-volume-record',
    name: '恒温器体积记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 15000, max: 16000, unit: 'm³' },
      { param: 'basis', kind: 'enum', values: ['calculated'] },
    ],
  },

  /**
   * 冷屏温度记录：85–95 K，basis=assumed。
   */
  {
    id: 'mat/fusion-thermal-temp-record',
    name: '冷屏温度记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'temperature', kind: 'range', min: 85, max: 95, unit: 'K' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },

  /**
   * 冷屏发射率记录：0.06–0.09，basis=assumed。
   */
  {
    id: 'mat/fusion-thermal-emissivity-record',
    name: '冷屏发射率记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'emissivity', kind: 'range', min: 0.06, max: 0.09, unit: '1' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },

  /**
   * 低温厂冷量记录：72–75 kW，basis=public-spec。
   */
  {
    id: 'mat/fusion-cryoplant-cooling-record',
    name: '低温厂冷量记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'coolingPower', kind: 'range', min: 72, max: 75, unit: 'kW' },
      { param: 'basis', kind: 'enum', values: ['public-spec'] },
    ],
  },

  /**
   * 低温厂氦库存记录：22–28 t，basis=calculated。
   */
  {
    id: 'mat/fusion-cryoplant-helium-record',
    name: '低温厂氦库存记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'heliumInventory', kind: 'range', min: 22, max: 28, unit: 't' },
      { param: 'basis', kind: 'enum', values: ['calculated'] },
    ],
  },

  /**
   * 控制可用率记录：0.92–0.95，basis=assumed。
   */
  {
    id: 'mat/fusion-control-availability-record',
    name: '控制可用率记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'availability', kind: 'range', min: 0.92, max: 0.95, unit: '1' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
];

export const FUSION_FINAL_ROUTES: readonly Route[] = [
  {
    /**
     * PF 电流记录：罗氏线圈读 0–60 kA 档。
     *
     * assumed：罗氏线圈未标定，不是实测。
     */
    id: 'measure/fusion-pf-current',
    name: 'PF 电流测量',
    produces: [
      {
        item: 'mat/fusion-pf-current-record',
        qty: q(1),
        gives: [
          { param: 'current', kind: 'range', min: 42, max: 50 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/pf-coil'],
    performedBy: 'plant/rogowski-50ka',
    rate: { hours: q(1) },
  },
  {
    /**
     * CS 峰值场记录：高场 NMR 探头读 10–13 T 档。
     *
     * public-spec：ITER 13 T 公开值，不是本模块实测。
     */
    id: 'measure/fusion-cs-field',
    name: 'CS 峰值场测量',
    produces: [
      {
        item: 'mat/fusion-cs-field-record',
        qty: q(1),
        gives: [
          { param: 'peakField', kind: 'range', min: 12.5, max: 13 },
          { param: 'basis', kind: 'enum', oneOf: ['public-spec'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/central-solenoid'],
    performedBy: 'plant/high-field-nmr-probe',
    rate: { hours: q(1) },
  },
  {
    /**
     * 恒温器体积记录：激光跟踪仪读 0–20,000 m³ 档。
     *
     * calculated：16,000 m³ 公开体积，不是实测。
     */
    id: 'measure/fusion-cryostat-volume',
    name: '恒温器体积测量',
    produces: [
      {
        item: 'mat/fusion-cryostat-volume-record',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 15000, max: 16000 },
          { param: 'basis', kind: 'enum', oneOf: ['calculated'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/cryostat'],
    performedBy: 'plant/laser-tracker-30m',
    rate: { hours: q(1) },
  },
  {
    /**
     * 冷屏温度记录：80–100 K 恒温台读 85–95 K。
     *
     * assumed：恒温台未标定，不是实测。
     */
    id: 'measure/fusion-thermal-temp',
    name: '冷屏温度测量',
    produces: [
      {
        item: 'mat/fusion-thermal-temp-record',
        qty: q(1),
        gives: [
          { param: 'temperature', kind: 'range', min: 85, max: 95 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/thermal-shield'],
    performedBy: 'plant/thermostat-80-100k',
    rate: { hours: q(1) },
  },
  {
    /**
     * 冷屏发射率记录：80 K 发射率计读 0.01–0.2 档。
     *
     * assumed：80 K 黑体标准未建，不是实测。
     */
    id: 'measure/fusion-thermal-emissivity',
    name: '冷屏发射率测量',
    produces: [
      {
        item: 'mat/fusion-thermal-emissivity-record',
        qty: q(1),
        gives: [
          { param: 'emissivity', kind: 'range', min: 0.06, max: 0.09 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/thermal-shield'],
    performedBy: 'plant/emissometer-80k',
    rate: { hours: q(1) },
  },
  {
    /**
     * 低温厂冷量记录：75 kW 冷量负载读 0–80 kW 档。
     *
     * public-spec：ITER 4.5 K / 75 kW 公开值，不是本厂实测。
     */
    id: 'measure/fusion-cryoplant-cooling',
    name: '低温厂冷量测量',
    produces: [
      {
        item: 'mat/fusion-cryoplant-cooling-record',
        qty: q(1),
        gives: [
          { param: 'coolingPower', kind: 'range', min: 72, max: 75 },
          { param: 'basis', kind: 'enum', oneOf: ['public-spec'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/cryoplant'],
    performedBy: 'plant/cryo-load-75kw',
    rate: { hours: q(1) },
  },
  {
    /**
     * 低温厂氦库存记录：25 t 氦库存计量台读 0–30 t 档。
     *
     * calculated：25 t 公开库存，不是实测。
     */
    id: 'measure/fusion-cryoplant-helium',
    name: '低温厂氦库存测量',
    produces: [
      {
        item: 'mat/fusion-cryoplant-helium-record',
        qty: q(1),
        gives: [
          { param: 'heliumInventory', kind: 'range', min: 22, max: 28 },
          { param: 'basis', kind: 'enum', oneOf: ['calculated'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/cryoplant'],
    performedBy: 'plant/he-inventory-meter',
    rate: { hours: q(1) },
  },
  {
    /**
     * 控制可用率记录：可用率试验台读 0.8–0.99 档。
     *
     * assumed：没有 10^6 次长期运行台，不是实测。
     */
    id: 'measure/fusion-control-availability',
    name: '控制可用率测量',
    produces: [
      {
        item: 'mat/fusion-control-availability-record',
        qty: q(1),
        gives: [
          { param: 'availability', kind: 'range', min: 0.92, max: 0.95 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/control'],
    performedBy: 'plant/control-availability-bench',
    rate: { hours: q(1) },
  },
];

export const DATA_ITEMS: readonly Item[] = [...FUSION_FINAL_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...FUSION_FINAL_ROUTES];
