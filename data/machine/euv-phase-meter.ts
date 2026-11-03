/**
 * 商用假设：13.5 nm EUV 相位计。
 *
 * 用 euv-reflectometer 的 13.5 nm 光路 + 控制板/相位解调装配；
 * phase repeatability 0.02–0.05 nm、accuracy 0.05–0.1 nm。
 * 是“商用假设/最接近”，不是已有整机。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const EUV_PHASE_METER_ITEMS: readonly Item[] = [
  {
    id: 'plant/euv-phase-meter',
    name: 'EUV 相位计',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'wavelength', kind: 'range', min: 13.5, max: 13.5, unit: 'nm' },
      { param: 'phaseRepeatability', kind: 'range', min: 0.02, max: 0.05, unit: 'nm', dir: 'atMost' },
      { param: 'phaseAccuracy', kind: 'range', min: 0.05, max: 0.1, unit: 'nm', dir: 'atMost' },
    ],
    composedOf: [
      { item: 'plant/euv-reflectometer', qty: q(1) },
      { item: 'std/control-board-general', qty: q(1) },
    ],
  },
];

export const EUV_PHASE_METER_ROUTES: readonly Route[] = [
  {
    id: 'make/euv-phase-meter',
    name: 'EUV 相位计制造',
    produces: [{
      item: 'plant/euv-phase-meter',
      qty: q(1),
      gives: [
        { param: 'wavelength', kind: 'range', min: 13.5, max: 13.5 },
        { param: 'phaseRepeatability', kind: 'range', min: 0.02, max: 0.05 },
        { param: 'phaseAccuracy', kind: 'range', min: 0.05, max: 0.1 },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(40) },
    steps: [
      { note_zh: 'euv-reflectometer 13.5 nm 光路加相位解调/参考臂，控制板同步', performedBy: 'plant/robot' },
      { note_zh: '标定 repeatability 0.02–0.05 nm、accuracy 0.05–0.1 nm', performedBy: 'plant/robot' },
      { note_zh: '标“商用假设/最接近”，不是已有整机', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '反射计 1 + 控制板 1 + 铝/铜线 → EUV 相位计 1 台。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...EUV_PHASE_METER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...EUV_PHASE_METER_ROUTES];
