/**
 * 定点炉绝对温度标定 —— Zn / Al / Cu 三点。
 *
 * 419.5 / 660.3 / 1084.6 °C 三个熔/凝平台，4N 金属、氧化铝坩埚、熔炼炉。
 * 热电偶在三个平台上读电动势，三点拟合给 419–1085 °C 的绝对不确定度
 * 1–2 °C；1300 °C 只外推，不写成读数。
 *
 * 这是 `measure/furnace-uniformity` 与 `measure/rta-uniformity` 的
 * 绝对温度前提：没有这条 record，均匀性只能读“点与点的差”，读不了
 * “绝对温度准不准”。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FIXED_POINT_CAL_ITEMS: readonly Item[] = [
  /**
   * 固定点互检记录：两只容器各熔/凝两次，比平台温度与滞后。
   * 只判「两只容器在测量分辨内一致」，绝对温度由 ITS-90 赋值。
   */
  {
    id: 'mat/fixed-point-intercomparison-record',
    name: '固定点互检记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'freezePointDiff', kind: 'range', min: 0, max: 0.5, unit: 'K', dir: 'atMost' },
      { param: 'hysteresis', kind: 'range', min: 0, max: 0.2, unit: 'K', dir: 'atMost' },
      { param: 'uDiff', kind: 'range', min: 0.05, max: 0.2, unit: 'K', dir: 'atMost' },
      { param: 'cells', kind: 'range', min: 2, max: 2, unit: '只' },
      { param: 'verdict', kind: 'enum', values: ['consistent', 'inconsistent'] },
    ],
  },  {
    id: 'std/fixed-point-cell-set',
    name: '固定点容器套件',
    unit: '套',
    category: 'part',
    props: [
      { param: 'points', kind: 'range', min: 3, max: 3, unit: '点' },
      { param: 'temperature', kind: 'range', min: 419, max: 1085, unit: '°C' },
      { param: 'purity', kind: 'range', min: 99.99, max: 99.99, unit: '%' },
    ],
  },
  {
    id: 'mat/thermocouple-cal-record',
    name: '标定记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'uncertainty', kind: 'range', min: 1, max: 2, unit: '°C', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 3, max: 3, unit: '点' },
      { param: 'temperature', kind: 'range', min: 419, max: 1085, unit: '°C' },
    ],
  },
];

export const FIXED_POINT_CAL_ROUTES: readonly Route[] = [
  {
    /**
     * **固定点互检：两只容器各熔/凝两次，比平台温度。**
     *
     * 这是 NMI 的常规动作：KC 之前先自检。只判两只容器在测量分辨内一致，
     * 不判绝对温度（绝对温度是 ITS-90 赋值）。
     */
    id: 'measure/fixed-point-intercomparison',
    name: '固定点互检测量',
    rate: { hours: q(24) },
    produces: [{
      item: 'mat/fixed-point-intercomparison-record',
      qty: q(1),
      gives: [
        { param: 'freezePointDiff', kind: 'range', min: 0, max: 0.3 },
        { param: 'hysteresis', kind: 'range', min: 0, max: 0.1 },
        { param: 'uDiff', kind: 'range', min: 0.05, max: 0.2 },
        { param: 'cells', kind: 'range', min: 2, max: 2 },
        { param: 'verdict', kind: 'enum', oneOf: ['consistent', 'inconsistent'] },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'std/fixed-point-cell-set', qty: q(1) }] },
      { anyOf: [{ item: 'mat/thermocouple-cal-record', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '第一只容器熔/凝各一次，读平台温度（同一支已标定热电偶）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 400, max: 1100 }] },
      { note_zh: '第二只容器同法；两只交替各两次，消漂移', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 400, max: 1100 }] },
      { note_zh: '算平台温度差与滞后；|ΔT| ≤ 2·uDiff 判 consistent，否则 inconsistent', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '两只容器 + 两份热电偶标定记录 → 记录 1 份；容器与偶不消耗',
  },  {
    /**
     * 三点池：Zn 419.5 / Al 660.3 / Cu 1084.6 °C；4N 金属，固定点不确定度 1–2 °C。
     * 池子用氧化铝坩埚，熔炼炉熔/凝；一套池对应一支热电偶的标定。
     */
    id: 'make/fixed-point-cell-set',
    name: '固定点容器套件制造',
    produces: [
      {
        item: 'std/fixed-point-cell-set',
        qty: q(1),
        gives: [
          { param: 'points', kind: 'range', min: 3, max: 3 },
          { param: 'temperature', kind: 'range', min: 419, max: 1085 },
          { param: 'purity', kind: 'range', min: 99.99, max: 99.99 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/zinc', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/resistance-furnace',
    rate: { hours: q(24) },
    unbalanced_zh: '锌 1 + 铝 1 + 铜 1 + 氧化铝 0.5 → 三点池 1 套；余是坩埚/密封/损耗',
  },
  {
    /**
     * 标定：三点池在熔炼炉里熔/凝，读热电偶在三个平台上的电动势；三点拟合，
     * 给出 419–1085 °C 的绝对不确定度 1–2 °C。1300 °C 是外推，不外推成读数。
     *
     * Cu 平台 1084.6 °C 要求热偶本身量程 ≥1085 °C。T 型（铜-康铜，400 °C
     * 上限，PTFE 套管）到不了 Al/Cu 平台；改用 `std/thermocouple-nicr-nial-general`
     * （NiCr-NiAl，非标准 K，1300–1372、氧化铝管）。K 的正极是 80/20 高碳
     * 镍铬，分度逐支不同，所以这条路线只标定"这一支"，不按标准 K 分度表
     * 外推；三个平台上的读数就是这支偶的标定。
     */
    id: 'measure/thermocouple-cal',
    name: '标定',
    produces: [
      {
        item: 'mat/thermocouple-cal-record',
        qty: q(1),
        gives: [
          { param: 'uncertainty', kind: 'range', min: 1, max: 2 },
          { param: 'points', kind: 'range', min: 3, max: 3 },
          { param: 'temperature', kind: 'range', min: 419, max: 1085 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/fixed-point-cell-set', qty: q(1) }] },
      {
        anyOf: [
          {
            item: 'std/thermocouple-nicr-nial-general',
            qty: q(1),
            need: [{ param: 'rangeMax', kind: 'range', min: 1085, dir: 'atLeast' }],
            onRelax: 'functional-lost',
          },
        ],
      },
    ],
    needs: ['plant/metrology-room', 'plant/temperature-standard'],
    steps: [
      { note_zh: 'Zn 池 419.5 °C：熔/凝平台，读热电偶电动势', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 400, max: 440 }] },
      { note_zh: 'Al 池 660.3 °C：熔/凝平台，读电动势', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 640, max: 680 }] },
      { note_zh: 'Cu 池 1084.6 °C：熔/凝平台，读电动势', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 1060, max: 1100 }] },
      { note_zh: '三点拟合，给 419–1085 °C 的偏差与不确定度；1300 °C 只外推、不写成读数', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '三点池 1 套 + 热电偶 1 → 记录 1；池与热电偶校准后继续用，不消耗',
  },
];

export const DATA_ITEMS: readonly Item[] = [...FIXED_POINT_CAL_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...FIXED_POINT_CAL_ROUTES];
