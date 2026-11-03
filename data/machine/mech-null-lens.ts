/**
 * φ320 零位补偿器的三个光学/镜座模块。
 *
 * `plant/null-test/null-lens` 由一片非球面、两片球面与一个镜座装成。
 * 这三件在原数据里是 `plant/null-test/asphere-320`、`sphere-320`、`cell-320`，
 * 不是 `null-lens/` 前缀，不能直接进 `composedOf`；这里各做一个同规格的
 * 装配模块，用 `uses` 记录原件输入，并把规格原样带出来。
 *
 * 这不是重复条目：模块是“按补偿器要求挑选/配对后的一件”，原件仍是通用件。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const NULL_LENS_PARTS: readonly Item[] = [
  {
    id: 'plant/null-test/null-lens/asphere',
    name: 'Aspheric Null Lens', name_zh: '非球面零位镜',
    unit: '件',
    category: 'part',
    props: [
      { param: 'aperture', kind: 'range', min: 0, max: 500, unit: 'mm', dir: 'atLeast' },
      { param: 'figure', kind: 'range', min: 0, max: 500, unit: 'nm', dir: 'atMost' },
      { param: 'asphericity', kind: 'range', min: 0, max: 10, unit: 'mm', dir: 'atMost' },
    ],
  },
  {
    id: 'plant/null-test/null-lens/sphere-pair',
    name: 'Spherical Null Lens Pair', name_zh: '球面零位镜对',
    unit: '套',
    category: 'part',
    props: [
      { param: 'aperture', kind: 'range', min: 0, max: 500, unit: 'mm', dir: 'atLeast' },
      { param: 'radius', kind: 'range', min: 0, max: 5000, unit: 'mm' },
      { param: 'figure', kind: 'range', min: 0, max: 500, unit: 'nm', dir: 'atMost' },
    ],
  },
  {
    id: 'plant/null-test/null-lens/cell',
    name: 'Null Lens Mount', name_zh: '零位镜镜座',
    unit: '件',
    category: 'part',
    props: [
      { param: 'aperture', kind: 'range', min: 0, max: 500, unit: 'mm', dir: 'atLeast' },
      { param: 'repeatability', kind: 'range', min: 0, max: 100, unit: 'µm', dir: 'atMost' },
    ],
  },
];

const NULL_LENS_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    id: 'make/null-lens-asphere',
    name: 'Aspheric Null Lens Manufacturing', name_zh: '非球面零位镜制造',
    produces: [{
      item: 'plant/null-test/null-lens/asphere',
      qty: q(1),
      gives: [
        { param: 'aperture', kind: 'range', min: 320, max: 320 },
        { param: 'figure', kind: 'range', max: 100 },
        { param: 'asphericity', kind: 'range', max: 0.3 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'plant/null-test/asphere-320', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
  },
  {
    id: 'make/null-lens-sphere-pair',
    name: 'Spherical Null Lens Pair Manufacturing', name_zh: '球面零位镜对制造',
    produces: [{
      item: 'plant/null-test/null-lens/sphere-pair',
      qty: q(1),
      gives: [
        { param: 'aperture', kind: 'range', min: 320, max: 320 },
        { param: 'radius', kind: 'range', min: 647, max: 647 },
        { param: 'figure', kind: 'range', max: 200 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'plant/null-test/sphere-320', qty: q(2) }] }],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
  },
  {
    id: 'make/null-lens-cell',
    name: 'Null Lens Mount Manufacturing', name_zh: '零位镜镜座制造',
    produces: [{
      item: 'plant/null-test/null-lens/cell',
      qty: q(1),
      gives: [
        { param: 'aperture', kind: 'range', min: 320, max: 320 },
        { param: 'repeatability', kind: 'range', max: 2 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'plant/null-test/cell-320', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
  },
];

export const NULL_LENS_PART_ROUTES: readonly Route[] = NULL_LENS_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...NULL_LENS_PARTS];
export const DATA_ROUTES: readonly Route[] = [...NULL_LENS_PART_ROUTES];
