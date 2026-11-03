/**
 * EUV 干涉仪 repeatability 实测：300 mm 绝对平晶做稳定参考，10 次重复读数。
 *
 * 这不是 resolution 标定，也不碰 make/euv-interferometer 的 resolution 指针。
 * 参考件：std/euv-absolute-flat（300 mm、figure ≤1 nm、Mo/Si）。
 * 窗口取资格带 0.05–0.1 nm，不是单次读数。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const EUV_INTERFEROMETER_REPEATABILITY_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/euv-interferometer-repeatability-measure-record',
    name: 'EUV Interferometer Repeatability Measurement Record', name_zh: 'EUV 干涉仪重复性测量记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'repeatability', kind: 'range', min: 0.05, max: 0.1, unit: 'nm' },
      { param: 'points', kind: 'range', min: 10, max: 10, unit: '点' },
    ],
  },
];

export const EUV_INTERFEROMETER_REPEATABILITY_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **EUV 干涉仪：300 mm 绝对平晶重复 10 次，算 repeatability。**
     */
    id: 'measure/euv-interferometer-repeatability',
    name: 'EUV Interferometer Repeatability Measurement', name_zh: 'EUV 干涉仪重复性测量',
    produces: [{
      item: 'mat/euv-interferometer-repeatability-measure-record',
      qty: q(1),
      gives: [
        { param: 'repeatability', kind: 'range', min: 0.05, max: 0.1 },
        { param: 'points', kind: 'range', min: 10, max: 10 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'std/euv-absolute-flat', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      { note_zh: '300 mm 绝对平晶装 660 mm 镜架，13.5 nm 腔抽到 1e-5 Pa', performedBy: 'plant/robot' },
      { note_zh: '干涉仪对同一平晶重复读 10 次，每次重新对零', performedBy: 'plant/euv-interferometer' },
      { note_zh: '算 10 次读数的最大偏差 0.05–0.1 nm；写资格带，不是单次读数', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '绝对平晶 1 件（不消耗）+ 干涉仪（不占用）→ repeatability 记录 1 份；记录是数据不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...EUV_INTERFEROMETER_REPEATABILITY_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...EUV_INTERFEROMETER_REPEATABILITY_MEASURE_ROUTES];
