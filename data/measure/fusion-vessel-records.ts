/**
 * 真空室与屏蔽的三个窗口记录：扇区漏率、扇区质量、屏蔽壁厚。
 *
 * 三条记录分别标 assumed / calculated / assumed，都不是实测。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FUSION_VESSEL_RECORD_ITEMS: readonly Item[] = [
  /**
   * 真空室扇区漏率记录：2e-10–8e-10 Pa·m³/s，basis=assumed。
   *
   * 检漏仪未标定，1e-9 是设计口径。
   */
  {
    id: 'mat/fusion-vessel-leak-record',
    name: '真空室扇区漏率记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'leakRate', kind: 'range', min: 2e-10, max: 8e-10, unit: 'Pa·m³/s' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },

  /**
   * 真空室扇区质量记录：520–580 t，basis=calculated。
   *
   * 按 5,200 t / 9 扇区算，不是称重。
   */
  {
    id: 'mat/fusion-vessel-mass-record',
    name: '真空室扇区质量记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'sectorMass', kind: 'range', min: 520, max: 580, unit: 't' },
      { param: 'basis', kind: 'enum', values: ['calculated'] },
    ],
  },

  /**
   * 屏蔽壁厚记录：1.8–2.2 m，basis=assumed。
   *
   * 超声测厚未标定，1–3 m 标准块未建。
   */
  {
    id: 'mat/fusion-shield-thickness-record',
    name: '屏蔽壁厚记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'thickness', kind: 'range', min: 1.8, max: 2.2, unit: 'm' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },
];

export const FUSION_VESSEL_RECORD_ROUTES: readonly Route[] = [
  {
    /**
     * 扇区漏率记录：氦检漏仪读 1e-12–1e-8 档。
     *
     * assumed：检漏仪未标定，1e-9 是设计。
     */
    id: 'measure/fusion-vessel-leak',
    name: '真空室扇区漏率测量',
    produces: [
      {
        item: 'mat/fusion-vessel-leak-record',
        qty: q(1),
        gives: [
          { param: 'leakRate', kind: 'range', min: 2e-10, max: 8e-10 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/vacuum-vessel'],
    performedBy: 'plant/he-leak-detector',
    rate: { hours: q(1) },
  },
  {
    /**
     * 扇区质量记录：500 t 级称重台。
     *
     * calculated：5,200 t / 9 扇区，不是称重。
     */
    id: 'measure/fusion-vessel-mass',
    name: '真空室扇区质量测量',
    produces: [
      {
        item: 'mat/fusion-vessel-mass-record',
        qty: q(1),
        gives: [
          { param: 'sectorMass', kind: 'range', min: 520, max: 580 },
          { param: 'basis', kind: 'enum', oneOf: ['calculated'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/vacuum-vessel'],
    performedBy: 'plant/weighbridge-500t',
    rate: { hours: q(1) },
  },
  {
    /**
     * 屏蔽壁厚记录：混凝土超声测厚仪读 0.5–3 m 档。
     *
     * assumed：超声测厚未标定，1–3 m 标准块未建。
     */
    id: 'measure/fusion-shield-thickness',
    name: '屏蔽壁厚测量',
    produces: [
      {
        item: 'mat/fusion-shield-thickness-record',
        qty: q(1),
        gives: [
          { param: 'thickness', kind: 'range', min: 1.8, max: 2.2 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/shield'],
    performedBy: 'plant/concrete-thickness-gauge',
    rate: { hours: q(1) },
  },
];

export const DATA_ITEMS: readonly Item[] = [...FUSION_VESSEL_RECORD_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...FUSION_VESSEL_RECORD_ROUTES];
