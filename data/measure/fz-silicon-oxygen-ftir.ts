/**
 * FZ 硅间隙氧实测（最接近/假设）：FTIR 1107 cm⁻¹ 吸收，5 点。
 *
 * 物理上 FTIR 可测硅中间隙氧；但本层**没有氧标样**，绝对定标未做实。
 * 窗口 2e15–8e15 cm⁻³（≈0.04–0.16 ppm）是“最接近/假设”，不是单次读数。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FZ_SILICON_OXYGEN_FTIR_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/fz-silicon-oxygen-ftir-measure-record',
    name: 'FZ 硅氧含量 FTIR 测量记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'oxygen', kind: 'range', min: 2000000000000000, max: 8000000000000000, unit: 'cm⁻³' },
      { param: 'oxygenPpm', kind: 'range', min: 0.04, max: 0.16, unit: 'ppm' },
      { param: 'points', kind: 'range', min: 5, max: 5, unit: '点' },
    ],
  },
];

export const FZ_SILICON_OXYGEN_FTIR_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **FZ 硅：FTIR 1107 cm⁻¹ 读间隙氧；无氧标样，窗口按最接近/假设。**
     */
    id: 'measure/fz-silicon-oxygen-ftir',
    name: 'FZ 硅氧含量 FTIR 测量',
    produces: [{
      item: 'mat/fz-silicon-oxygen-ftir-measure-record',
      qty: q(1),
      gives: [
        { param: 'oxygen', kind: 'range', min: 2000000000000000, max: 8000000000000000 },
        { param: 'oxygenPpm', kind: 'range', min: 0.04, max: 0.16 },
        { param: 'points', kind: 'range', min: 5, max: 5 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'std/fz-silicon', qty: q(1) }] }],
    needs: [
      {
        item: 'plant/ftir',
        qty: q(1),
        need: [
          { param: 'measure/oxygenPpm', kind: 'range', min: 0.01, max: 10 },
          { param: 'measure/wavenumberMin', kind: 'range', min: 400, max: 450 },
          { param: 'measure/resolution', kind: 'range', min: 4, max: 5 },
        ],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(4) },
    steps: [
      { note_zh: 'FZ 硅双面抛光 2 mm 片，FTIR 1107 cm⁻¹、4 cm⁻¹ 分辨，空片参考', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '5 点读 1107 cm⁻¹ 吸收；按 2e15–8e15 cm⁻³ 换 0.04–0.16 ppm', performedBy: 'plant/ftir', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '无氧标样，绝对定标未做实；写“最接近/假设”窗口，不写单次读数', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: 'FZ 硅 1 件（进、出不消耗）+ FTIR（不占用）→ 氧记录 1 份；记录是数据不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...FZ_SILICON_OXYGEN_FTIR_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...FZ_SILICON_OXYGEN_FTIR_MEASURE_ROUTES];
