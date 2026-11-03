/**
 * 320 mm 熔石英平面参考 + Fizeau measure。
 *
 * 毛坯 320×320×50 mm 熔石英；用 plant/euv-fab/polish-station 的
 * aperture ≥340 / figure ≤130 nm 能力抛光；plant/interferometer 定值。
 * 320 mm 抛光/定值是“最接近/假设”，不是拿 300 mm/球面冒充。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const LARGE_FLAT_320_ITEMS: readonly Item[] = [
  {
    id: 'mat/fused-silica-blank-320',
    name: 'φ320 Fused Quartz Blank', name_zh: 'φ320 熔石英毛坯',
    unit: '件',
    category: 'material',
    props: [
      { param: 'size', kind: 'range', min: 320, max: 320, unit: 'mm' },
      { param: 'thickness', kind: 'range', min: 50, max: 50, unit: 'mm' },
      { param: 'type', kind: 'enum', values: ['fused-silica'] },
    ],
  },
  {
    id: 'std/large-flat-320',
    name: 'φ320 Large Flat Standard', name_zh: 'φ320 大平面标准件',
    unit: '件',
    category: 'part',
    props: [
      { param: 'aperture', kind: 'range', min: 0, max: 320, unit: 'mm', dir: 'atLeast' },
      { param: 'figure', kind: 'range', min: 0, max: 130, unit: 'nm rms', dir: 'atMost' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 20, unit: 'nm', dir: 'atMost' },
    ],
  },
  {
    id: 'mat/null-lens-320-fizeau-record',
    name: 'φ320 Null Lens Fizeau Record', name_zh: 'φ320 零位镜 Fizeau 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'figure', kind: 'range', min: 0, max: 130, unit: 'nm', dir: 'atMost' },
      { param: 'aperture', kind: 'range', min: 320, max: 320, unit: 'mm' },
      { param: 'points', kind: 'range', min: 10, max: 10, unit: '点' },
    ],
  },
];

export const LARGE_FLAT_320_ROUTES: readonly Route[] = [
  {
    id: 'make/fused-silica-blank-320',
    name: 'φ320 Fused Quartz Blank Production', name_zh: 'φ320 熔石英毛坯制备',
    produces: [{
      item: 'mat/fused-silica-blank-320',
      qty: q(1),
      gives: [
        { param: 'size', kind: 'range', min: 320, max: 320 },
        { param: 'thickness', kind: 'range', min: 50, max: 50 },
        { param: 'type', kind: 'enum', oneOf: ['fused-silica'] },
      ],
    }],
    uses: [{
      anyOf: [{
        item: 'mat/glass',
        qty: q(12),
        need: [{ param: 'type', kind: 'enum', oneOf: ['fused-silica'] }],
        onRelax: 'functional-lost',
      }],
    }],
    needs: [],
    steps: [
      { note_zh: '熔石英玻璃块 12 kg 切 320×320×50 mm；wire-saw 下料', performedBy: 'plant/wire-saw' },
      { note_zh: '粗磨六面，倒角；留 0.2 mm 抛光余量', performedBy: 'plant/grinder' },
    ],
    unbalanced_zh: '熔石英 12 kg → 320×320×50 毛坯 1 件；余是切割/研磨损耗。',
  },
  {
    id: 'make/large-flat-320',
    name: 'φ320 Large Flat Standard Manufacturing', name_zh: 'φ320 大平面标准件制造',
    produces: [{
      item: 'std/large-flat-320',
      qty: q(1),
      gives: [
        { param: 'aperture', kind: 'range', min: 0, max: 320 },
        { param: 'figure', kind: 'range', min: 0, max: 130 },
        { param: 'uncertainty', kind: 'range', min: 0, max: 20 },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'mat/fused-silica-blank-320', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-fab/polish-station', qty: q(1) }] },
      { anyOf: [{ item: 'mat/cerium-oxide', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: [
      {
        item: 'plant/interferometer',
        qty: q(1),
        need: [{ param: 'measure/figure', kind: 'range', min: 0, max: 130 }],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(120) },
    steps: [
      { note_zh: '320 mm 毛坯上 polish-station（≥340 盘）粗抛/精抛；CeO₂ 浆料', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '三盘互研/星形抛光到 figure ≤130 nm rms；全口径 320', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: 'plant/interferometer 全口径定值 10 点，U ≤20 nm；写 320 mm 抛光/定值假设', performedBy: 'plant/interferometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '毛坯 1 + CeO₂ 0.05 kg + 水 10 kg → 320 mm 参考平晶 1 件；余是抛光损耗。',
  },
  {
    id: 'measure/null-lens-320-fizeau',
    name: 'φ320 Null Lens Fizeau Measurement', name_zh: 'φ320 零位镜 Fizeau 测量',
    produces: [{
      item: 'mat/null-lens-320-fizeau-record',
      qty: q(1),
      gives: [
        { param: 'figure', kind: 'range', min: 0, max: 130 },
        { param: 'aperture', kind: 'range', min: 320, max: 320 },
        { param: 'points', kind: 'range', min: 10, max: 10 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'plant/null-test/null-lens', qty: q(1) }] }],
    needs: [
      {
        item: 'std/large-flat-320',
        qty: q(1),
        need: [
          { param: 'figure', kind: 'range', min: 0, max: 130 },
          { param: 'aperture', kind: 'range', min: 320, max: 320 },
        ],
        onRelax: 'functional-kept',
      },
      {
        item: 'plant/interferometer',
        qty: q(1),
        need: [{ param: 'measure/figure', kind: 'range', min: 0, max: 130 }],
        onRelax: 'functional-kept',
      },
      {
        item: 'plant/null-test',
        qty: q(1),
        need: [{ param: 'aperture', kind: 'range', min: 320, max: 320 }],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(12) },
    steps: [
      { note_zh: 'null lens 装 null-test 320 mm 镜架，三点支撑', performedBy: 'plant/null-test' },
      { note_zh: 'Fizeau：320 mm 参考平晶 + plant/interferometer，13.5 nm 读 10 点', performedBy: 'plant/interferometer' },
      { note_zh: '算 figure 0–130 nm；写 320 mm 抛光/定值假设，不是 300 mm 冒充', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: 'null lens 1 件（进、出不消耗）+ 320 参考/干涉仪（不占用）→ 面形记录 1 份。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...LARGE_FLAT_320_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...LARGE_FLAT_320_ROUTES];
