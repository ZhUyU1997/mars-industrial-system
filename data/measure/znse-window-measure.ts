/**
 * ZnSe 窗口实测：FTIR 10.6 µm 透射/吸收 + AFM 粗糙度 + 干涉仪面形。
 *
 * 独立量具：plant/ftir、plant/afm、plant/ref-flat-interferometer；
 * 窗口取资格带 0.95–0.97 / 0.1–0.5 %/cm / 1 nm / 50–70 nm，不是单次读数。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ZNSE_WINDOW_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/znse-window-measure-record',
    name: 'ZnSe 窗口透射率测量记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'transmission', kind: 'range', min: 0.95, max: 0.97, unit: '1' },
      { param: 'absorption', kind: 'range', min: 0.1, max: 0.5, unit: '%/cm', dir: 'atMost' },
      { param: 'roughness', kind: 'range', min: 1, max: 1, unit: 'nm rms', dir: 'atMost' },
      { param: 'flatness', kind: 'range', min: 50, max: 70, unit: 'nm rms', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 10, max: 10, unit: '点' },
    ],
  },
];

export const ZNSE_WINDOW_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **ZnSe 窗口：FTIR 透射/吸收 + AFM 粗糙度 + 干涉仪面形。**
     */
    id: 'measure/znse-window-measure',
    name: 'ZnSe 窗口透射率测量',
    produces: [
      {
        item: 'mat/znse-window-measure-record',
        qty: q(1),
        gives: [
          { param: 'transmission', kind: 'range', min: 0.95, max: 0.97 },
          { param: 'absorption', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'roughness', kind: 'range', min: 1, max: 1 },
          { param: 'flatness', kind: 'range', min: 50, max: 70 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/znse-window', qty: q(1) }] }],
    needs: [
      {
        item: 'plant/ftir',
        qty: q(1),
        need: [
          { param: 'measure/wavenumberMin', kind: 'range', min: 400, max: 450 },
          { param: 'measure/wavenumberMax', kind: 'range', min: 4000, max: 4000 },
        ],
        onRelax: 'functional-kept',
      },
      {
        item: 'plant/afm',
        qty: q(1),
        need: [{ param: 'measure/roughness', kind: 'range', min: 0, max: 1 }],
        onRelax: 'functional-kept',
      },
      {
        item: 'plant/interferometer',
        qty: q(1),
        need: [{ param: 'measure/figure', kind: 'range', min: 50, max: 70 }],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(24) },
    steps: [
      { note_zh: 'FTIR 10.6 µm（943 cm⁻¹）读透射/吸收，10 点', performedBy: 'plant/ftir', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: 'AFM 读粗糙度 10 点', performedBy: 'plant/afm', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '干涉仪读面形 10 点（λ/4 平晶，50–70 nm 资格带）', performedBy: 'plant/interferometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '写资格带 0.95–0.97/0.1–0.5 %/cm/1 nm/50–70 nm；不写单次读数', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: 'ZnSe 窗口 1 件（进、出不消耗）+ FTIR/AFM/干涉仪（不占用）→ 实测记录 1 份；记录是数据不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...ZNSE_WINDOW_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...ZNSE_WINDOW_MEASURE_ROUTES];
