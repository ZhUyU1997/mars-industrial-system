/**
 * 首台聚变装置的 commissioning 记录：整机、辅助加热、发电岛、燃料循环。
 *
 * 四条记录分别标 public-spec / public-spec / assumed / calculated，都不是实测。
 * 测量执行者用首台装置自身的能力窗口，不是拿外部标准源。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FUSION_COMMISSIONING_ITEMS: readonly Item[] = [
  /**
   * 整机性能记录：fusionPower 450–500 MW、q 9–10、pulseLength 450–550 s、
   * dutyCycle 0.5–0.8，basis=public-spec。
   *
   * 取自 ITER 公开值，作为首台装置调试假设，不是本机实测。
   */
  {
    id: 'mat/fusion-plant-record',
    name: '整机性能记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'fusionPower', kind: 'range', min: 450, max: 500, unit: 'MW' },
      { param: 'q', kind: 'range', min: 9, max: 10, unit: '倍' },
      { param: 'pulseLength', kind: 'range', min: 450, max: 550, unit: 's' },
      { param: 'dutyCycle', kind: 'range', min: 0.5, max: 0.8, unit: '1' },
      { param: 'basis', kind: 'enum', values: ['public-spec'] },
    ],
  },

  /**
   * 辅助加热记录：injectedPower 47–50 MW、installedPower 92–95 MW，basis=public-spec。
   *
   * 首台装置调试值，不是实测。
   */
  {
    id: 'mat/fusion-heating-record',
    name: '辅助加热 commissioning 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'injectedPower', kind: 'range', min: 47, max: 50, unit: 'MW' },
      { param: 'installedPower', kind: 'range', min: 92, max: 95, unit: 'MW' },
      { param: 'basis', kind: 'enum', values: ['public-spec'] },
    ],
  },

  /**
   * 发电岛记录：electricPower 160–190 MW、efficiency 36–39 %，basis=assumed。
   *
   * 首台装置发电岛调试假设；ITER 本身不发电。
   */
  {
    id: 'mat/fusion-power-record',
    name: '发电岛 commissioning 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'electricPower', kind: 'range', min: 160, max: 190, unit: 'MW' },
      { param: 'efficiency', kind: 'range', min: 36, max: 39, unit: '%' },
      { param: 'basis', kind: 'enum', values: ['assumed'] },
    ],
  },

  /**
   * 燃料循环记录：burnRate 0.06–0.09 kg/day、tritiumInventory 2.2–2.8 kg，
   * basis=calculated。
   *
   * 按 500 MW 燃耗算，不是实测。
   */
  {
    id: 'mat/fusion-fuel-record',
    name: '燃料循环 commissioning 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'burnRate', kind: 'range', min: 0.06, max: 0.09, unit: 'kg/day' },
      { param: 'tritiumInventory', kind: 'range', min: 2.2, max: 2.8, unit: 'kg' },
      { param: 'basis', kind: 'enum', values: ['calculated'] },
    ],
  },
];

export const FUSION_COMMISSIONING_ROUTES: readonly Route[] = [
  {
    /**
     * 整机性能 commissioning：首台装置自身读 400–500 MW / Q 5–10 档。
     *
     * public-spec：ITER 公开值，调试假设，不是本机实测。
     */
    id: 'measure/fusion-plant-performance',
    name: '整机性能装配',
    produces: [
      {
        item: 'mat/fusion-plant-record',
        qty: q(1),
        gives: [
          { param: 'fusionPower', kind: 'range', min: 450, max: 500 },
          { param: 'q', kind: 'range', min: 9, max: 10 },
          { param: 'pulseLength', kind: 'range', min: 450, max: 550 },
          { param: 'dutyCycle', kind: 'range', min: 0.5, max: 0.8 },
          { param: 'basis', kind: 'enum', oneOf: ['public-spec'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor'],
    performedBy: 'plant/fusion-reactor/diagnostics',
    rate: { hours: q(1) },
  },
  {
    /**
     * 辅助加热 commissioning：首台装置自身读注入/装机窗口。
     *
     * public-spec：首台装置调试值，不是实测。
     */
    id: 'measure/fusion-heating-performance',
    name: '辅助加热 commissioning 测量',
    produces: [
      {
        item: 'mat/fusion-heating-record',
        qty: q(1),
        gives: [
          { param: 'injectedPower', kind: 'range', min: 47, max: 50 },
          { param: 'installedPower', kind: 'range', min: 92, max: 95 },
          { param: 'basis', kind: 'enum', oneOf: ['public-spec'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/heating'],
    performedBy: 'plant/fusion-reactor/diagnostics',
    rate: { hours: q(1) },
  },
  {
    /**
     * 发电岛 commissioning：首台装置自身读发电窗口。
     *
     * assumed：首台装置发电岛调试假设，ITER 本身不发电。
     */
    id: 'measure/fusion-power-performance',
    name: '发电岛 commissioning 测量',
    produces: [
      {
        item: 'mat/fusion-power-record',
        qty: q(1),
        gives: [
          { param: 'electricPower', kind: 'range', min: 160, max: 190 },
          { param: 'efficiency', kind: 'range', min: 36, max: 39 },
          { param: 'basis', kind: 'enum', oneOf: ['assumed'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/power-block'],
    performedBy: 'plant/fusion-reactor/diagnostics',
    rate: { hours: q(1) },
  },
  {
    /**
     * 燃料循环 commissioning：首台装置自身读燃耗/氚存量窗口。
     *
     * calculated：按 500 MW 燃耗算，不是实测。
     */
    id: 'measure/fusion-fuel-performance',
    name: '燃料循环 commissioning 测量',
    produces: [
      {
        item: 'mat/fusion-fuel-record',
        qty: q(1),
        gives: [
          { param: 'burnRate', kind: 'range', min: 0.06, max: 0.09 },
          { param: 'tritiumInventory', kind: 'range', min: 2.2, max: 2.8 },
          { param: 'basis', kind: 'enum', oneOf: ['calculated'] },
        ],
      },
    ],
    uses: [],
    needs: ['plant/fusion-reactor/fuel-cycle'],
    performedBy: 'plant/fusion-reactor/diagnostics',
    rate: { hours: q(1) },
  },
];

export const DATA_ITEMS: readonly Item[] = [...FUSION_COMMISSIONING_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...FUSION_COMMISSIONING_ROUTES];
