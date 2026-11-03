/**
 * null-lens at-wavelength 面形（最接近/假设）：atw 干涉仪 + null-test 装夹。
 *
 * 现有件：plant/euv-stepper-hina/atw-interferometer（aperture 0–1000 mm、
 * resolution 10 nm、13.5 nm）；plant/null-test 作装夹/参考。
 * 窗口取资格带 0–130 nm，不是单次读数；10 nm 分辨是最接近接口。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const NULL_LENS_ATW_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/null-lens-atw-measure-record',
    name: 'Null Lens At-Wavelength Surface Figure Record', name_zh: '零位镜 at-wavelength 面形记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'figure', kind: 'range', min: 0, max: 130, unit: 'nm', dir: 'atMost' },
      { param: 'aperture', kind: 'range', min: 320, max: 320, unit: 'mm' },
      { param: 'points', kind: 'range', min: 10, max: 10, unit: '点' },
    ],
  },
];

export const NULL_LENS_ATW_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **320 mm null lens：null-test 装夹，atw 干涉仪 13.5 nm 读 10 点面形。**
     */
    id: 'measure/null-lens-atw-figure',
    name: 'Null Lens At-Wavelength Surface Figure Measurement', name_zh: '零位镜 at-wavelength 面形测量',
    produces: [{
      item: 'mat/null-lens-atw-measure-record',
      qty: q(1),
      gives: [
        { param: 'figure', kind: 'range', min: 0, max: 130 },
        { param: 'aperture', kind: 'range', min: 320, max: 320 },
        { param: 'points', kind: 'range', min: 10, max: 10 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'plant/null-test/null-lens', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(12) },
    steps: [
      { note_zh: 'null-test 装 320 mm null lens，三点支撑与使用姿态一致；抽 1e-5 Pa', performedBy: 'plant/null-test' },
      { note_zh: 'atw 干涉仪建立 13.5 nm 接口：参考镜对零、CGH/补偿器装夹，读 10 点', performedBy: 'plant/euv-stepper-hina/atw-interferometer' },
      { note_zh: '算 figure 0–130 nm；10 nm 分辨是最接近接口，写资格带不是单次读数', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: 'null lens 1 件（进、出不消耗）+ null-test/atw（不占用）→ 面形记录 1 份；记录是数据不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...NULL_LENS_ATW_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...NULL_LENS_ATW_MEASURE_ROUTES];
