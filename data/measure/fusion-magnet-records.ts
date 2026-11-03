/**
 * 三个磁体窗口的记录：TF 峰值场、PF 峰值场、CS 磁通。
 *
 * 三条记录分别标 public-spec / assumed / assumed，都不是本线圈实测：
 * TF 写 ITER 公开的 11.8 T 档，PF 与 CS 是设计假设。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FUSION_MAGNET_RECORD_ITEMS: readonly Item[] = [
  /**
   * TF 峰值场记录：11.8–12.2 T，basis=public-spec。
   *
   * 取自 ITER 公开值 11.8 T，不是本线圈的实测。
   */
  {
    id: 'mat/fusion-tf-field-record',
    name: 'TF 峰值场记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'peakField', kind: 'range', min: 11.8, max: 12.2, unit: 'T' },
      { param: 'basis', kind: 'enum', values: ['public-spec'] },
    ],
  },

  /**
   * PF 峰值场记录：5.5–6 T，basis=assumed。
   *
   * 低场探头未标定，窗口是设计假设。
   */
  {
    id: 'mat/fusion-pf-field-record',
    name: 'PF 峰值场记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'peakField', kind: 'range', min: 5.5, max: 6, unit: 'T' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },

  /**
   * CS 磁通记录：230–250 Wb，basis=assumed。
   *
   * 磁通计未标定，窗口是设计假设。
   */
  {
    id: 'mat/fusion-cs-flux-record',
    name: 'CS 磁通记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'flux', kind: 'range', min: 230, max: 250, unit: 'Wb' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
];

export const FUSION_MAGNET_RECORD_ROUTES: readonly Route[] = [
  {
    /**
     * TF 峰值场记录：高场 NMR 探头读峰值场。
     *
     * public-spec：ITER 11.8 T 公开值，不是本线圈实测。
     */
    id: 'measure/fusion-tf-field',
    name: 'TF 峰值场测量',
    produces: [
      {
        item: 'mat/fusion-tf-field-record',
        qty: q(1),
        gives: [
          { param: 'peakField', kind: 'range', min: 11.8, max: 12.2 },
          { param: 'basis', kind: 'enum', oneOf: ['public-spec'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/tf-coil'],
    performedBy: 'plant/high-field-nmr-probe',
    rate: { hours: q(1) },
  },
  {
    /**
     * PF 峰值场记录：低场 NMR 探头读 5–6 T。
     *
     * assumed：低场探头未标定，不是实测。
     */
    id: 'measure/fusion-pf-field',
    name: 'PF 峰值场测量',
    produces: [
      {
        item: 'mat/fusion-pf-field-record',
        qty: q(1),
        gives: [
          { param: 'peakField', kind: 'range', min: 5.5, max: 6 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/pf-coil'],
    performedBy: 'plant/low-field-nmr-probe',
    rate: { hours: q(1) },
  },
  {
    /**
     * CS 磁通记录：磁通计读 220–260 Wb 档。
     *
     * assumed：磁通计未标定，不是实测。
     */
    id: 'measure/fusion-cs-flux',
    name: 'CS 磁通测量',
    produces: [
      {
        item: 'mat/fusion-cs-flux-record',
        qty: q(1),
        gives: [
          { param: 'flux', kind: 'range', min: 230, max: 250 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/central-solenoid'],
    performedBy: 'plant/fluxmeter-300wb',
    rate: { hours: q(1) },
  },
];

export const DATA_ITEMS: readonly Item[] = [...FUSION_MAGNET_RECORD_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...FUSION_MAGNET_RECORD_ROUTES];
