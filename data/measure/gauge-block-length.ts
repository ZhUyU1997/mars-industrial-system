/**
 * 量块长度互检 —— 一组量块内部的长度一致性，以及干涉仪对同一组的独立复核。
 *
 * 地球的做法：量块按 ISO 3650 分等（00/0/1/2），等由**长度偏差 + 测量不确定度**
 * 定义，级由制造公差定义；新量块用比较仪对标准量块测，标准量块再用干涉仪定值。
 * 本层把它拆成一条互检路线：同组量块两两比较（比较仪），再抽一只上干涉仪复核。
 *
 * 它只判"这一组在测量分辨内一致"，不判绝对长度 —— 绝对长度由米定义（稳频激光）
 * 沿干涉仪下来，互检不是原级。
 *
 * 本文件只放 `measure/*` 与记录条目（R13）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const GAUGE_BLOCK_LENGTH_ITEMS: readonly Item[] = [
  /**
   * 量块长度互检记录。一份对应一组量块的一次互检。
   *
   *   lengthDiff    0–0.2 µm    同组两只量块的长度差（比较仪读数）
   *   uDiff         0.02–0.05 µm 差值的合成不确定度（比较仪 + 温度 + 研合）
   *   blocks        2           参与互检的量块数
   *   method        comparator  比较仪；抽检那只再走 interferometer
   *   verdict       consistent / inconsistent
   */
  {
    id: 'mat/gauge-block-length-intercomparison-record',
    name: 'Gauge Block Length Intercomparison Record', name_zh: '量块长度互检记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'lengthDiff', kind: 'range', min: 0, max: 1, unit: 'µm', dir: 'atMost' },
      { param: 'uDiff', kind: 'range', min: 0.01, max: 0.1, unit: 'µm', dir: 'atMost' },
      { param: 'blocks', kind: 'range', min: 2, max: 2, unit: '块' },
      { param: 'method', kind: 'enum', values: ['comparator', 'interferometer'] },
      { param: 'verdict', kind: 'enum', values: ['consistent', 'inconsistent'] },
    ],
  },
];

export const GAUGE_BLOCK_LENGTH_ROUTES: readonly Route[] = [
  {
    /**
     * **量块长度互检：同组两块上比较仪，抽一只上干涉仪。**
     *
     *   ① 研合：两块分别研在钢平板上，等温 2 h（20 ± 0.5 °C）；
     *   ② 比较仪：两块交替测 5 点，读长度差；温度修正按 11.5×10⁻⁶/K；
     *   ③ 干涉仪：抽一只，与稳频激光比相位，读绝对长度；
     *   ④ 判 |ΔL| ≤ 2·uDiff；记录差、不确定度、块数、方法与结论。
     */
    id: 'measure/gauge-block-length-intercomparison',
    name: 'Gauge Block Length Intercomparison Measurement', name_zh: '量块长度互检测量',
    rate: { hours: q(6) },
    produces: [
      {
        item: 'mat/gauge-block-length-intercomparison-record',
        qty: q(1),
        gives: [
          { param: 'lengthDiff', kind: 'range', min: 0, max: 0.2 },
          { param: 'uDiff', kind: 'range', min: 0.02, max: 0.05 },
          { param: 'blocks', kind: 'range', min: 2, max: 2 },
          { param: 'method', kind: 'enum', oneOf: ['comparator'] },
          { param: 'verdict', kind: 'enum', oneOf: ['consistent', 'inconsistent'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/gauge-block-working', qty: q(2) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '研合与等温：两块分别研在钢平板上，计量间 20 ± 0.5 °C 等温 2 h',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '比较仪：两块交替测 5 点，读长度差；按 11.5×10⁻⁶/K 做温度修正',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '干涉仪抽检：一只量块与稳频激光比相位，读绝对长度',
        performedBy: 'plant/interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '判 |ΔL| ≤ 2·uDiff；写差值、不确定度、块数、方法与结论',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '量块 2 块（不消耗，测完归还）→ 记录 1 份；记录是数据不是物料',
  },
];

export const DATA_ITEMS: readonly Item[] = [...GAUGE_BLOCK_LENGTH_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...GAUGE_BLOCK_LENGTH_ROUTES];
