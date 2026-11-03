/**
 * 激光光束诊断（最接近/假设）：扫描狭缝 + 位移台 + 量热器，独立测 focusSpot/pointing。
 *
 * 现有件：plant/precision-slit（5–20 µm 缝）、plant/laser-stage（10 µm 级定位）、
 * plant/laser-calorimeter（30 kW）；不靠第二台 profiler。
 * 窗口取资格带 20–50 µm / 20–50 µrad，不是单次读数；10 µm 级扫描是最接近能力。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const LASER_BEAM_PROFILER_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/laser-beam-profiler-measure-record',
    name: 'Scanning Slit Method Record', name_zh: '扫描狭缝法记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'focusSpot', kind: 'range', min: 20, max: 50, unit: 'µm' },
      { param: 'pointing', kind: 'range', min: 20, max: 50, unit: 'µrad' },
      { param: 'points', kind: 'range', min: 10, max: 10, unit: '点' },
    ],
  },
];

export const LASER_BEAM_PROFILER_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **扫描狭缝法：位移台扫 10 点，量热器读透过功率，拟合焦斑与指向。**
     */
    id: 'measure/laser-beam-profiler-slit-scan',
    name: 'Scanning Slit Method Measurement', name_zh: '扫描狭缝法测量',
    produces: [{
      item: 'mat/laser-beam-profiler-measure-record',
      qty: q(1),
      gives: [
        { param: 'focusSpot', kind: 'range', min: 20, max: 50 },
        { param: 'pointing', kind: 'range', min: 20, max: 50 },
        { param: 'points', kind: 'range', min: 10, max: 10 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(20) }] }],
    needs: [
      { item: 'plant/precision-slit', qty: q(1) },
      {
        item: 'plant/laser-stage',
        qty: q(1),
        need: [{ param: 'positioning', kind: 'range', min: 0, max: 10000 }],
        onRelax: 'functional-kept',
      },
      {
        item: 'plant/laser-calorimeter',
        qty: q(1),
        need: [{ param: 'power', kind: 'range', min: 0, max: 30000 }],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '10.6 µm 激光经 5–20 µm 狭缝，狭缝装位移台；量热器在缝后', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '位移台扫 10 点（10 µm 步距，最接近），量热器读每点功率', performedBy: 'plant/laser-stage', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '拟合 20–50 µm 焦斑与 20–50 µrad 指向；写最接近/假设窗口', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '水 20 kg → 光束诊断记录 1 份；狭缝/位移台/量热器是量具，不消耗。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...LASER_BEAM_PROFILER_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...LASER_BEAM_PROFILER_MEASURE_ROUTES];
