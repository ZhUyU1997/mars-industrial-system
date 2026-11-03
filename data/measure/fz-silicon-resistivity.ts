/**
 * FZ 硅电阻率实测：探针台四探针方块电阻 + 千分尺厚度，ρ = Rs × t。
 *
 * 独立量具：plant/probe-station（sheetResistance）、std/micrometer-0-25。
 * 只覆盖 resistivity 10–50 Ω·cm；oxygen 没有标样，仍留在 qual 记录，不声称已测。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FZ_SILICON_RESISTIVITY_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/fz-silicon-resistivity-measure-record',
    name: 'FZ Silicon Resistivity Measurement Record', name_zh: 'FZ 硅电阻率测量记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'resistivity', kind: 'range', min: 10, max: 50, unit: 'Ω·cm' },
      { param: 'points', kind: 'range', min: 10, max: 10, unit: '点' },
    ],
  },
];

export const FZ_SILICON_RESISTIVITY_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **FZ 硅：四探针方块电阻 + 厚度，算 10–50 Ω·cm。**
     */
    id: 'measure/fz-silicon-resistivity',
    name: 'FZ Silicon Resistivity Measurement', name_zh: 'FZ 硅电阻率测量',
    produces: [{
      item: 'mat/fz-silicon-resistivity-measure-record',
      qty: q(1),
      gives: [
        { param: 'resistivity', kind: 'range', min: 10, max: 50 },
        { param: 'points', kind: 'range', min: 10, max: 10 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'std/fz-silicon', qty: q(1) }] }],
    needs: [
      {
        item: 'plant/probe-station',
        qty: q(1),
        need: [{ param: 'sheetResistance', kind: 'range', min: 100, max: 2000 }],
        onRelax: 'functional-kept',
      },
      {
        item: 'std/micrometer-0-25',
        qty: q(1),
        need: [{ param: 'range', kind: 'range', min: 0, max: 25 }],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(4) },
    steps: [
      { note_zh: '千分尺在 5 点测厚度（0.5–2 mm 量级），记 t', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '探针台四探针读 10 点方块电阻 Rs（100–2000 Ω/□）', performedBy: 'plant/probe-station', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: 'ρ = Rs × t，判 10–50 Ω·cm；写资格带，不写单次读数', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: 'FZ 硅 1 件（进、出不消耗）+ 探针台/千分尺（不占用）→ 电阻率记录 1 份；记录是数据不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...FZ_SILICON_RESISTIVITY_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...FZ_SILICON_RESISTIVITY_MEASURE_ROUTES];
