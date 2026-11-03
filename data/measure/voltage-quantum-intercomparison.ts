/**
 * 电压天平与约瑟夫森阵列的互检 —— 电学的第二条比对。
 *
 * 地球做法：约瑟夫森阵列是 SI 伏特的直接复现（1e-9），电压天平是力学法与
 * 计算电容给的绝对伏特（50–90 ppm）。两者比一次，差的应该是天平那一侧的
 * 系统误差；这条互检就是给天平定标、给约瑟夫森做旁证。
 *
 * 它不替代任何一方：约瑟夫森仍是基准，天平仍是独立方法（不同物理路径）。
 *
 * 本文件只放 `measure/*` 与记录条目（R13）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const VOLTAGE_QUANTUM_ITEMS: readonly Item[] = [
  /**
   * 电压天平 vs 约瑟夫森互检记录。一份对应一次 10 V 比对。
   *
   *   difference   0–90 ppm    两只 10 V 的差（天平的偏差）
   *   uDiff        3–10 ppm    差值的合成不确定度（分压比 + 热电势 + 指零仪）
   *   points       3           正反向各 3 次
   *   verdict      consistent / inconsistent
   */
  {
    id: 'mat/voltage-quantum-intercomparison-record',
    name: '电压天平 vs 约瑟夫森互检记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'difference', kind: 'range', min: 0, max: 200, unit: 'ppm', dir: 'atMost' },
      { param: 'uDiff', kind: 'range', min: 1, max: 30, unit: 'ppm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 3, max: 3, unit: '次' },
      { param: 'verdict', kind: 'enum', values: ['consistent', 'inconsistent'] },
    ],
  },
];

export const VOLTAGE_QUANTUM_ROUTES: readonly Route[] = [
  {
    /**
     * **10 V 互检：天平对约瑟夫森，正反向各 3 次。**
     *
     *   ① 约瑟夫森阵列落在 10 V 台阶（70 000 结、72–78 GHz）；
     *   ② 天平侧 10 V 经 10:1 分压后与阵列比，指零仪读零；
     *   ③ 正反向各 3 次，消热电势；差 ≤ 2·uDiff 判 consistent。
     */
    id: 'measure/voltage-quantum-intercomparison',
    name: '电压天平 vs 约瑟夫森互检测量',
    rate: { hours: q(8) },
    produces: [
      {
        item: 'mat/voltage-quantum-intercomparison-record',
        qty: q(1),
        gives: [
          { param: 'difference', kind: 'range', min: 0, max: 90 },
          { param: 'uDiff', kind: 'range', min: 3, max: 10 },
          { param: 'points', kind: 'range', min: 3, max: 3 },
          { param: 'verdict', kind: 'enum', oneOf: ['consistent', 'inconsistent'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/voltage-absolute-record', qty: q(1) }] },
      { anyOf: [{ item: 'mat/josephson-record', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '约瑟夫森阵列落在 10 V 台阶（70 000 结、72–78 GHz、4.0–4.3 K）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '天平侧 10 V 经 10:1 分压后与阵列比，指零仪读零；正反向各 3 次消热电势',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '算差值与合成不确定度；|Δ| ≤ 2·uDiff 判 consistent，否则 inconsistent',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '两份电压记录（不消耗）→ 互检记录 1 份；记录是数据不是物料',
  },
];

export const DATA_ITEMS: readonly Item[] = [...VOLTAGE_QUANTUM_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...VOLTAGE_QUANTUM_ROUTES];
