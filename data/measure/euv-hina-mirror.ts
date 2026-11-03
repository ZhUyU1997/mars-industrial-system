/**
 * 660 mm EUV 多层镜实测：13.5 nm 反射率（反射率计）+ 多层周期（XRR）。
 *
 * 独立量具：plant/euv-reflectometer、plant/xray-diffractometer。
 * 窗口取交付窗 6.85–6.95 nm / 68–70%，不是单次读数。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const EUV_HINA_MIRROR_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/euv-hina-mirror-measure-record',
    name: 'EUV 光刻机镜面测量记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'period', kind: 'range', min: 6.85, max: 6.95, unit: 'nm' },
      { param: 'reflectivity', kind: 'range', min: 68, max: 70, unit: '%' },
      { param: 'points', kind: 'range', min: 10, max: 10, unit: '点' },
    ],
  },
];

export const EUV_HINA_MIRROR_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **660 mm 镜：反射率计读 13.5 nm 反射率，X 射线衍射仪读多层周期。**
     */
    id: 'measure/euv-hina-mirror-measure',
    name: 'EUV 光刻机镜面测量',
    produces: [
      {
        item: 'mat/euv-hina-mirror-measure-record',
        qty: q(1),
        gives: [
          { param: 'period', kind: 'range', min: 6.85, max: 6.95 },
          { param: 'reflectivity', kind: 'range', min: 68, max: 70 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/euv-stepper-hina/mirror', qty: q(1) }] }],
    needs: [
      {
        item: 'plant/euv-reflectometer',
        qty: q(1),
        need: [
          { param: 'reflectivity', kind: 'range', min: 68, max: 70 },
          { param: 'reflectivityAccuracy', kind: 'range', min: 0, max: 0.3 },
        ],
        onRelax: 'functional-kept',
      },
      {
        item: 'plant/xray-diffractometer',
        qty: q(1),
        need: [{ param: 'resolution', kind: 'range', min: 0.001, max: 0.002 }],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(12) },
    steps: [
      { note_zh: '反射率计：13.5 nm、5–15° 扫描，读 10 点反射率 68–70%', performedBy: 'plant/euv-reflectometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: 'X 射线衍射仪：Cu Kα 读多层 Bragg 峰，算周期 6.85–6.95 nm，10 点', performedBy: 'plant/xray-diffractometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '写资格带 6.85–6.95 nm/68–70%；不写单次读数', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '660 mm 镜 1 件（进、出不消耗）+ 反射率计/衍射仪（不占用）→ 实测记录 1 份；记录是数据不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...EUV_HINA_MIRROR_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...EUV_HINA_MIRROR_MEASURE_ROUTES];
