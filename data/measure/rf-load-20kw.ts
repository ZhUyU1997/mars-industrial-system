/**
 * 单只 20 kW / 50 Ω 水冷 RF dummy load（商用假设，最接近）。
 *
 * 不是 10×2 kW 并联：单只 50 Ω 吸收 20 kW（短时 22 kW），水冷 20–40 L/min，
 * 用 resistance-wire 元件 + 铜电极 + 不锈钢水套；稳定性由水流量/温差读出，
 * 0.2–0.5% 是相对稳定度，不是绝对功率精度。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const RF_LOAD_20KW_ITEMS: readonly Item[] = [
  {
    id: 'std/rf-load-20kw-50ohm/element',
    name: 'RF Load Resistor Element', name_zh: '射频负载电阻元件',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resistance', kind: 'range', min: 50, max: 50, unit: 'Ω' },
      { param: 'power', kind: 'range', min: 0, max: 22000, unit: 'W', dir: 'atLeast' },
      { param: 'vswr', kind: 'range', min: 1, max: 1.5, unit: '比值', dir: 'atMost' },
    ],
  },
  {
    id: 'std/rf-load-20kw-50ohm',
    name: '20 kW / 50 Ω RF Load', name_zh: '20 kW / 50 Ω 射频负载',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'impedance', kind: 'range', min: 50, max: 50, unit: 'Ω' },
      { param: 'power', kind: 'range', min: 0, max: 22000, unit: 'W', dir: 'atLeast' },
      { param: 'vswr', kind: 'range', min: 1, max: 1.5, unit: '比值', dir: 'atMost' },
      { param: 'flow', kind: 'range', min: 10, max: 50, unit: 'L/min' },
      { param: 'pressure', kind: 'range', min: 0.1, max: 1, unit: 'MPa' },
      { param: 'measure/stability', kind: 'range', min: 0.2, max: 0.5, unit: '%', dir: 'atMost' },
    ],
    composedOf: [
      { item: 'std/rf-load-20kw-50ohm/element', qty: q(1) },
      { item: 'std/water-flow-meter', qty: q(1) },
      { item: 'std/thermocouple-nicr-nial-general', qty: q(2) },
    ],
  },
  {
    id: 'mat/rf-generator-20kw-load-stability-record',
    name: '20 kW Generator Load Stability Record', name_zh: '20 kW 发生器负载稳定度记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'stability', kind: 'range', min: 0.2, max: 0.5, unit: '%', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 10, max: 10, unit: '点' },
    ],
  },
];

export const RF_LOAD_20KW_ROUTES: readonly Route[] = [
  {
    id: 'make/rf-load-20kw-element',
    name: 'RF Load Resistor Element Manufacturing', name_zh: '射频负载电阻元件制造',
    produces: [{
      item: 'std/rf-load-20kw-50ohm/element',
      qty: q(1),
      gives: [
        { param: 'resistance', kind: 'range', min: 50, max: 50 },
        { param: 'power', kind: 'range', min: 0, max: 22000 },
        { param: 'vswr', kind: 'range', min: 1, max: 1.5 },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(5) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(10) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '绕 50 Ω resistance-wire 元件，铜电极压接；抽头按 20 kW/50 Ω 设计', performedBy: 'plant/robot' },
      { note_zh: '27 MHz 小功率测 VSWR ≤1.5', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '电阻丝 2 + 铜 5 + 不锈钢 10 → 50 Ω/20 kW 元件 1 件。',
  },
  {
    /**
     * **装配：50 Ω 元件 + 流量计 + 热电偶水套，水冷 20–40 L/min。**
     */
    id: 'make/rf-load-20kw-50ohm',
    name: '20 kW / 50 Ω RF Load Assembly', name_zh: '20 kW / 50 Ω 射频负载装配',
    produces: [{
      item: 'std/rf-load-20kw-50ohm',
      qty: q(1),
      gives: [
        { param: 'impedance', kind: 'range', min: 50, max: 50 },
        { param: 'power', kind: 'range', min: 0, max: 22000 },
        { param: 'vswr', kind: 'range', min: 1, max: 1.5 },
        { param: 'flow', kind: 'range', min: 10, max: 50 },
        { param: 'pressure', kind: 'range', min: 0.1, max: 1 },
        { param: 'measure/stability', kind: 'range', min: 0.2, max: 0.5 },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'std/rf-load-20kw-50ohm/element', qty: q(1) }] },
      { anyOf: [{ item: 'std/water-flow-meter', qty: q(1) }] },
      { anyOf: [{ item: 'std/thermocouple-nicr-nial-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(40) },
    steps: [
      { note_zh: '绕 50 Ω resistance-wire 元件，铜电极压接；元件浸入水套', performedBy: 'plant/robot' },
      { note_zh: '不锈钢水套/接头装配，0.6 MPa 保压 30 min 无泄漏', performedBy: 'plant/robot', under: [{ param: 'pressure', min: 0.1, max: 1 }] },
      { note_zh: '27 MHz 小功率测 VSWR ≤1.5；水路 20–40 L/min 试流', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '电阻丝 2 + 铜 5 + 不锈钢 10 + 水 20 → 20 kW 负载 1 台；水是试压/冷却水。',
  },
  {
    /**
     * **20 kW 发生器 stability：单只负载吸收，流量/温差 60 s 10 点。**
     */
    id: 'measure/rf-generator-20kw-load-stability',
    name: '20 kW Generator Load Stability Measurement', name_zh: '20 kW 发生器负载稳定度测量',
    produces: [{
      item: 'mat/rf-generator-20kw-load-stability-record',
      qty: q(1),
      gives: [
        { param: 'stability', kind: 'range', min: 0.2, max: 0.5 },
        { param: 'points', kind: 'range', min: 10, max: 10 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'plant/rf-generator-20kw', qty: q(1) }] }],
    needs: [
      {
        item: 'std/rf-load-20kw-50ohm',
        qty: q(1),
        need: [
          { param: 'power', kind: 'range', min: 18000, max: 22000 },
          { param: 'measure/stability', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'flow', kind: 'range', min: 20, max: 40 },
        ],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(4) },
    steps: [
      { note_zh: '单只 20 kW/50 Ω 负载接 RF 输出，27 MHz、水路 20–40 L/min、预热 10 min', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '水流量 + 进出口热电偶测 P=ṁcpΔT；每 6 s 读 10 点（60 s）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '算相对稳定度 0.2–0.5%；注明最接近/假设，不是绝对精度', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: 'RF 发生器 1 台（进、出不消耗）+ 负载/水（不占用）→ 稳定度记录 1 份；水回用。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...RF_LOAD_20KW_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...RF_LOAD_20KW_ROUTES];
