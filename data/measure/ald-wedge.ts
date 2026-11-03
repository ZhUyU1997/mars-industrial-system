/**
 * 商用假设：ALD 真空移动快门 + 1–10 nm 连续楔形台阶。
 *
 * shutter 用 plant/euv-stepper/stage + std/control-board-general 装配，
 * stroke 0–150 mm、position 0.1 mm、与 ALD 周期同步；是“商用假设/最接近”，
 * 不是已有 ALD 原装件。
 * wedge 在 100 mm 内做 1→10 nm 连续厚度，X 射线/AFM 沿线 10 点定值，
 * U ≤0.06 nm。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ALD_WEDGE_ITEMS: readonly Item[] = [
  {
    id: 'std/uhv-linear-stage',
    name: 'Ultra-High Vacuum Linear Stage', name_zh: '超高真空直线台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'pressure', kind: 'range', min: 0, max: 1e-7, unit: 'Torr', dir: 'atMost' },
      { param: 'stroke', kind: 'range', min: 0, max: 150, unit: 'mm', dir: 'atLeast' },
      { param: 'positioning', kind: 'range', min: 0, max: 0.1, unit: 'mm', dir: 'atMost' },
      { param: 'encoderSync', kind: 'enum', values: ['ALD-encoder'] },
    ],
  },
  {
    id: 'std/vacuum-feedthrough',
    name: 'Vacuum Feedthrough', name_zh: '真空馈通',
    unit: '件',
    category: 'part',
    props: [
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-7, unit: 'Torr·L/s', dir: 'atMost' },
      { param: 'stroke', kind: 'range', min: 0, max: 150, unit: 'mm', dir: 'atLeast' },
      { param: 'motion', kind: 'enum', values: ['linear'] },
    ],
  },
  {
    id: 'std/ald-moving-shutter/stage',
    name: 'Moving Shutter Stage', name_zh: '挡板移动台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'stroke', kind: 'range', min: 0, max: 150, unit: 'mm', dir: 'atLeast' },
      { param: 'positioning', kind: 'range', min: 0, max: 0.1, unit: 'mm', dir: 'atMost' },
    ],
  },
  {
    id: 'std/ald-moving-shutter',
    name: 'ALD Moving Shutter', name_zh: 'ALD 移动挡板',
    unit: '套',
    category: 'machine',
    props: [
      { param: 'stroke', kind: 'range', min: 0, max: 150, unit: 'mm', dir: 'atLeast' },
      { param: 'positioning', kind: 'range', min: 0, max: 0.1, unit: 'mm', dir: 'atMost' },
      { param: 'cycleSync', kind: 'enum', values: ['ALD-cycle'] },
    ],
    composedOf: [
      { item: 'std/uhv-linear-stage', qty: q(1) },
      { item: 'std/vacuum-feedthrough', qty: q(1) },
      { item: 'std/control-board-general', qty: q(1) },
    ],
  },
  {
    id: 'std/step-standard-wedge-1-10nm',
    name: '1–10 nm Wedge Step Height Standard', name_zh: '1–10 nm 楔形台阶标准件',
    unit: '件',
    category: 'part',
    props: [
      { param: 'wedgeLength', kind: 'range', min: 100, max: 100, unit: 'mm' },
      { param: 'stepHeight', kind: 'range', min: 1, max: 10, unit: 'nm' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 0.06, unit: 'nm', dir: 'atMost' },
      { param: 'basis', kind: 'enum', values: ['commercial-assumed'] },
    ],
  },
];

export const ALD_WEDGE_ROUTES: readonly Route[] = [
  {
    id: 'make/uhv-linear-stage',
    name: 'Ultra-High Vacuum Linear Stage Manufacturing', name_zh: '超高真空直线台制造',
    produces: [{
      item: 'std/uhv-linear-stage',
      qty: q(1),
      gives: [
        { param: 'pressure', kind: 'range', min: 0, max: 1e-7 },
        { param: 'stroke', kind: 'range', min: 0, max: 150 },
        { param: 'positioning', kind: 'range', min: 0, max: 0.1 },
        { param: 'encoderSync', kind: 'enum', oneOf: ['ALD-encoder'] },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'std/bearing-crossed-roller-p5', qty: q(2) }] },
      { anyOf: [{ item: 'std/rotary-encoder', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(40) },
    steps: [
      { note_zh: '交叉滚子导轨 + 不锈钢基座装 0–150 mm 行程，真空脂/干膜润滑', performedBy: 'plant/robot' },
      { note_zh: '装 rotary-encoder，定位 0.1 mm；与 ALD 周期编码同步', performedBy: 'plant/robot' },
      { note_zh: '标 1e-7 Torr 真空兼容；商用假设/最接近', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '轴承 2 + 编码器 1 + 不锈钢 5 kg + 铝 2 kg → UHV 线性台 1 件。',
  },
  {
    id: 'make/vacuum-feedthrough',
    name: 'Vacuum Feedthrough Manufacturing', name_zh: '真空馈通制造',
    produces: [{
      item: 'std/vacuum-feedthrough',
      qty: q(1),
      gives: [
        { param: 'leakRate', kind: 'range', min: 0, max: 1e-7 },
        { param: 'stroke', kind: 'range', min: 0, max: 150 },
        { param: 'motion', kind: 'enum', oneOf: ['linear'] },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(30) },
    steps: [
      { note_zh: '不锈钢法兰 + 氧化铝绝缘 + 铜导体，装波纹管/线性馈送', performedBy: 'plant/robot' },
      { note_zh: '氦检漏 ≤1e-7 Torr·L/s；行程 0–150 mm', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '不锈钢 2 + 氧化铝 1 + 铜 1 → 真空运动馈送 1 件。',
  },
  {
    id: 'make/ald-moving-shutter-stage',
    name: 'Moving Shutter Stage Manufacturing', name_zh: '挡板移动台制造',
    produces: [{
      item: 'std/ald-moving-shutter/stage',
      qty: q(1),
      gives: [
        { param: 'stroke', kind: 'range', min: 0, max: 150 },
        { param: 'positioning', kind: 'range', min: 0, max: 0.1 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'plant/euv-stepper/stage', qty: q(1) }] }],
    needs: [],
    steps: [{ note_zh: '把 euv-stepper/stage 改行程 0–150 mm、定位 0.1 mm，装真空馈通', performedBy: 'plant/robot' }],
    unbalanced_zh: 'euv-stepper 台 1 → ALD 快门台 1。',
  },
  {
    id: 'make/ald-moving-shutter',
    name: 'ALD Moving Shutter Manufacturing', name_zh: 'ALD 移动挡板制造',
    produces: [{
      item: 'std/ald-moving-shutter',
      qty: q(1),
      gives: [
        { param: 'stroke', kind: 'range', min: 0, max: 150 },
        { param: 'positioning', kind: 'range', min: 0, max: 0.1 },
        { param: 'cycleSync', kind: 'enum', oneOf: ['ALD-cycle'] },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'std/uhv-linear-stage', qty: q(1) }] },
      { anyOf: [{ item: 'std/vacuum-feedthrough', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: 'stage + 控制板装真空法兰/馈通，行程 0–150 mm', performedBy: 'plant/robot' },
      { note_zh: '与 ALD 周期同步：每周期移动 1 mm，位置 0.1 mm；标定 0–100 mm', performedBy: 'plant/robot' },
      { note_zh: '标“商用假设/最接近”，不是 ALD 原装件', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: 'stage 1 + 控制板 1 + 铝 1 kg → ALD 移动快门 1 套。',
  },
  {
    id: 'make/step-standard-wedge-1-10nm',
    name: '1–10 nm Wedge Step Height Standard Manufacturing', name_zh: '1–10 nm 楔形台阶标准件制造',
    produces: [{
      item: 'std/step-standard-wedge-1-10nm',
      qty: q(1),
      gives: [
        { param: 'wedgeLength', kind: 'range', min: 100, max: 100 },
        { param: 'stepHeight', kind: 'range', min: 1, max: 10 },
        { param: 'uncertainty', kind: 'range', min: 0, max: 0.06 },
        { param: 'basis', kind: 'enum', oneOf: ['commercial-assumed'] },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hafnium-chloride', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(160) },
    steps: [
      { note_zh: 'ALD 装 std/ald-moving-shutter；100 周期内快门 0→100 mm 线性移动', performedBy: 'std/ald-moving-shutter' },
      { note_zh: 'HfO₂ ALD 10–100 周期，形成 1→10 nm 连续楔；GPC 0.09–0.1 nm', performedBy: 'plant/ald-reactor', under: [{ param: 'temperature', min: 200, max: 250 }, { param: 'pressure', min: 20, max: 60 }] },
      { note_zh: 'X 射线/AFM 沿线 10 点定值，U ≤0.06 nm；标商用假设/最接近', performedBy: 'plant/xray-interferometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '硅片 1 + HfCl₄ 1 g + 水 2 kg + 氮 0.1 kg → 1–10 nm 连续楔 1 件。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...ALD_WEDGE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...ALD_WEDGE_ROUTES];
