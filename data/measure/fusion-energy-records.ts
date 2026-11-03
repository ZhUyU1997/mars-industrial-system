/**
 * 聚变装置四个能量/热流窗口的记录：TF 储能、包层热流、偏滤器稳态/瞬态热流。
 *
 * 四条记录分别标 calculated / calculated / public-spec / public-spec，都不是实测。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FUSION_ENERGY_RECORD_ITEMS: readonly Item[] = [
  /**
   * TF 储能记录：40–42 GJ，basis=calculated。
   *
   * 取自 41 GJ 公开储能，不是本线圈实测。
   */
  {
    id: 'mat/fusion-tf-energy-record',
    name: 'TF 储能记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'storedEnergy', kind: 'range', min: 40, max: 42, unit: 'GJ' },
      { param: 'basis', kind: 'enum', values: ['calculated'] },
    ],
  },

  /**
   * 包层热流记录：0.35–0.45 MW/m²，basis=calculated。
   *
   * 在 0.3–0.5 设计窗内取中，不是实测。
   */
  {
    id: 'mat/fusion-blanket-heat-record',
    name: '包层热流记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'heatFlux', kind: 'range', min: 0.35, max: 0.45, unit: 'MW/m²' },
      { param: 'basis', kind: 'enum', values: ['calculated'] },
    ],
  },

  /**
   * 偏滤器稳态热流记录：10–11.5 MW/m²，basis=public-spec。
   *
   * 取自 ITER 公开的稳态 10 MW/m²，不是本盒实测。
   */
  {
    id: 'mat/fusion-divertor-steady-record',
    name: '偏滤器稳态热流记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'steadyHeatFlux', kind: 'range', min: 10, max: 11.5, unit: 'MW/m²' },
      { param: 'basis', kind: 'enum', values: ['public-spec'] },
    ],
  },

  /**
   * 偏滤器瞬态热流记录：20–24 MW/m²，basis=public-spec。
   *
   * 取自 ITER 公开的慢瞬态 20 MW/m²，不是实测。
   */
  {
    id: 'mat/fusion-divertor-transient-record',
    name: '偏滤器瞬态热流记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'transientHeatFlux', kind: 'range', min: 20, max: 24, unit: 'MW/m²' },
      { param: 'basis', kind: 'enum', values: ['public-spec'] },
    ],
  },
];

export const FUSION_ENERGY_RECORD_ROUTES: readonly Route[] = [
  {
    /**
     * TF 储能记录：线圈储能测试台读 30–45 GJ 档。
     *
     * calculated：41 GJ 公开储能，不是本线圈实测。
     */
    id: 'measure/fusion-tf-energy',
    name: 'TF 储能测量',
    produces: [
      {
        item: 'mat/fusion-tf-energy-record',
        qty: q(1),
        gives: [
          { param: 'storedEnergy', kind: 'range', min: 40, max: 42 },
          { param: 'basis', kind: 'enum', oneOf: ['calculated'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/tf-coil'],
    performedBy: 'plant/coil-energy-test-stand',
    rate: { hours: q(1) },
  },
  {
    /**
     * 包层热流记录：10 MW/m² 热流台读小热流档。
     *
     * calculated：0.3–0.5 设计窗内取中，不是实测。
     */
    id: 'measure/fusion-blanket-heat',
    name: '包层热流测量',
    produces: [
      {
        item: 'mat/fusion-blanket-heat-record',
        qty: q(1),
        gives: [
          { param: 'heatFlux', kind: 'range', min: 0.35, max: 0.45 },
          { param: 'basis', kind: 'enum', oneOf: ['calculated'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/blanket'],
    performedBy: 'plant/heat-flux-rig-10mw',
    rate: { hours: q(1) },
  },
  {
    /**
     * 偏滤器稳态热流记录：热流台读 10–12 MW/m² 档。
     *
     * public-spec：ITER 稳态 10 MW/m²，不是本盒实测。
     */
    id: 'measure/fusion-divertor-steady',
    name: '偏滤器稳态热流测量',
    produces: [
      {
        item: 'mat/fusion-divertor-steady-record',
        qty: q(1),
        gives: [
          { param: 'steadyHeatFlux', kind: 'range', min: 10, max: 11.5 },
          { param: 'basis', kind: 'enum', oneOf: ['public-spec'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/divertor'],
    performedBy: 'plant/heat-flux-rig-10mw',
    rate: { hours: q(1) },
  },
  {
    /**
     * 偏滤器瞬态热流记录：瞬态热流源读 0–30 MW/m² 档。
     *
     * public-spec：ITER 慢瞬态 20 MW/m²，不是实测。
     */
    id: 'measure/fusion-divertor-transient',
    name: '偏滤器瞬态热流测量',
    produces: [
      {
        item: 'mat/fusion-divertor-transient-record',
        qty: q(1),
        gives: [
          { param: 'transientHeatFlux', kind: 'range', min: 20, max: 24 },
          { param: 'basis', kind: 'enum', oneOf: ['public-spec'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/divertor'],
    performedBy: 'plant/transient-heat-source',
    rate: { hours: q(1) },
  },
];

export const DATA_ITEMS: readonly Item[] = [...FUSION_ENERGY_RECORD_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...FUSION_ENERGY_RECORD_ROUTES];
