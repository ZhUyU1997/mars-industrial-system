/**
 * EUV 660 mm 位移台 positionError/readout 实测：X 射线干涉仪做独立位移/读数标准。
 *
 * 独立量具：plant/xray-interferometer（0.1 nm = 0.319 个 Si(111) 条纹，八帧 0.01 nm；
 * 已在 AFM 的 10 µm 步进与 0.1 nm 定值中使用）。
 * 窗口取资格带 0.5–1 nm，不是单次读数。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const EUV_STAGE_660_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/euv-stage-660-measure-record',
    name: 'EUV 660 mm Stage Record', name_zh: 'EUV 660 mm 台记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'positionError', kind: 'range', min: 0.5, max: 1, unit: 'nm' },
      { param: 'readout', kind: 'range', min: 0.5, max: 1, unit: 'nm' },
      { param: 'points', kind: 'range', min: 10, max: 10, unit: '点' },
    ],
  },
];

export const EUV_STAGE_660_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **EUV 660 mm 台：X 射线干涉仪读 10 nm 步进/回零，算 positionError/readout。**
     */
    id: 'measure/euv-stage-660-position',
    name: 'EUV 660 mm Stage Measurement', name_zh: 'EUV 660 mm 台测量',
    produces: [{
      item: 'mat/euv-stage-660-measure-record',
      qty: q(1),
      gives: [
        { param: 'positionError', kind: 'range', min: 0.5, max: 1 },
        { param: 'readout', kind: 'range', min: 0.5, max: 1 },
        { param: 'points', kind: 'range', min: 10, max: 10 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: [
      {
        item: 'plant/xray-interferometer',
        qty: q(1),
        need: [
          // 用 xray 已有的 0.01 nm 分辨率；positionError/readout 是台架输出，
          // 不写成 xray 仪器的能力。
          { param: 'resolution', kind: 'range', min: 0, max: 0.01, dir: 'atMost' },
        ],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(8) },
    steps: [
      { note_zh: 'EUV 台装镜架，X 射线干涉仪光路对准；20 ± 0.1 °C', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '台走 10 nm 步进/回零，干涉仪读 10 点位移；算 positionError/readout 0.5–1 nm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '干涉仪读 10 点；写资格带 0.5–1 nm，不写单次读数', performedBy: 'plant/xray-interferometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: 'EUV 台 1 台（进、出不消耗）+ 干涉仪（不占用）→ 位移记录 1 份；水 1 kg 是冷却。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...EUV_STAGE_660_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...EUV_STAGE_660_MEASURE_ROUTES];
