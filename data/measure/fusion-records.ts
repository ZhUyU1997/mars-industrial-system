/**
 * 聚变装置三处窗口的记录：控制周期、恒温器真空、屏蔽硼含量。
 *
 * 三个记录都只到“设计值/计算值”，不是实测：量具已建，但夹具未标定或只是
 * 按配比计算。basis 分别写 assumed / assumed / calculated，不写 measured，
 * 也不写闭合。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FUSION_RECORD_ITEMS: readonly Item[] = [
  /**
   * 控制周期记录：cycleTime 0.6–0.9 ms，basis=assumed。
   *
   * 夹具已建（plant/cycle-time-adapter），但没有标定；窗口是设计值假设。
   */
  {
    id: 'mat/fusion-control-cycle-record',
    name: 'Control Period Record', name_zh: '控制周期记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'cycleTime', kind: 'range', min: 0.6, max: 0.9, unit: 'ms' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },

  /**
   * 恒温器真空记录：vacuum 2e-5–8e-5 Pa，basis=assumed。
   *
   * 压力转接未标定；没有标准真空计，窗口是设计值假设。
   */
  {
    id: 'mat/fusion-cryostat-vacuum-record',
    name: 'Thermostat Vacuum Record', name_zh: '恒温器真空记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'vacuum', kind: 'range', min: 2e-5, max: 8e-5, unit: 'Pa' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },

  /**
   * 屏蔽硼含量记录：boronContent 1.1–1.5 %，basis=calculated。
   *
   * 按 40 kg B₂O₃ / 1000 kg 配比算 1.24 % B，不是实测。
   */
  {
    id: 'mat/fusion-shield-boron-record',
    name: 'Shield Boron Content Record', name_zh: '屏蔽硼含量记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'boronContent', kind: 'range', min: 1.1, max: 1.5, unit: '%' },
      { param: 'basis', kind: 'enum', values: ['calculated'] },
    ],
  },
];

export const FUSION_RECORD_ROUTES: readonly Route[] = [
  {
    /**
     * 控制周期记录：装夹具 → 阶跃 → 读周期。
     *
     * assumed：量具已建但只做设计值假设，不是实测。
     */
    id: 'measure/fusion-control-cycle',
    name: 'Control Period Measurement', name_zh: '控制周期测量',
    produces: [
      {
        item: 'mat/fusion-control-cycle-record',
        qty: q(1),
        gives: [
          { param: 'cycleTime', kind: 'range', min: 0.6, max: 0.9 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/control'],
    rate: { hours: q(1) },
    steps: [
      { note_zh: '装夹具、给阶跃、读周期', performedBy: 'plant/cycle-time-adapter' },
      { note_zh: 'assumed：量具已建但只做设计值假设，不是实测', performedBy: 'plant/cycle-time-adapter' },
    ],
  },
  {
    /**
     * 恒温器真空记录：装压力转接 → 读真空 → 与设计窗口比对。
     *
     * assumed：压力转接未标定，不是实测。
     */
    id: 'measure/fusion-cryostat-vacuum',
    name: 'Thermostat Vacuum Measurement', name_zh: '恒温器真空测量',
    produces: [
      {
        item: 'mat/fusion-cryostat-vacuum-record',
        qty: q(1),
        gives: [
          { param: 'vacuum', kind: 'range', min: 2e-5, max: 8e-5 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/cryostat'],
    rate: { hours: q(1) },
    steps: [
      { note_zh: '装压力转接、读真空、与设计窗口比对', performedBy: 'plant/pressure-adapter' },
      { note_zh: 'assumed：压力转接未标定，不是实测', performedBy: 'plant/pressure-adapter' },
    ],
  },
  {
    /**
     * 屏蔽硼含量记录：消解 → 稀释 → 曲线。
     *
     * calculated：按 40 kg B₂O₃/1000 kg 配比算 1.24 % B，不是实测。
     */
    id: 'measure/fusion-shield-boron',
    name: 'Shield Boron Content Measurement', name_zh: '屏蔽硼含量测量',
    produces: [
      {
        item: 'mat/fusion-shield-boron-record',
        qty: q(1),
        gives: [
          { param: 'boronContent', kind: 'range', min: 1.1, max: 1.5 },
          { param: 'basis', kind: 'enum', oneOf: ['calculated'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/shield'],
    rate: { hours: q(1) },
    steps: [
      { note_zh: '消解、稀释、做曲线', performedBy: 'plant/boron-assay-adapter' },
      { note_zh: 'calculated：按 40 kg B₂O₃/1000 kg 配比算 1.24 % B，不是实测', performedBy: 'plant/boron-assay-adapter' },
    ],
  },
];

export const DATA_ITEMS: readonly Item[] = [...FUSION_RECORD_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...FUSION_RECORD_ROUTES];
