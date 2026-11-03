/**
 * FZ 硅片电阻率的四探针测量 —— 把 `std/fz-silicon` 的 `resistivity` 从设计值
 * 收到一条读数上。
 *
 * 地球做法：四探针（1 mm 间距、1–10 mA）沿半径打 5 点，ρ = 2πs·V/I 再乘厚度
 * 修正因子；不确定度主要来自探针间距、厚度与温度（硅的电阻率温度系数约
 * 0.7 %/K，所以要 20 ± 1 °C）。
 *
 * 它只测电阻率与径向均匀性，不测氧含量与位错——那两项要 FTIR 与腐蚀坑，
 * 本层没有。
 *
 * 本文件只放 `measure/*` 与记录条目（R13）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FZ_RESISTIVITY_ITEMS: readonly Item[] = [
  /**
   * FZ 硅片电阻率记录。一份对应一片（5 点）。
   *
   *   resistivity   1–100 Ω·cm   四探针读数，厚度修正后
   *   uniformity    2–10 %       径向 5 点的最大偏差
   *   uncertainty   3–5 %        探针间距 + 厚度 + 温度合成
   *   points        5            沿半径的点数
   *   method        four-point
   */
  {
    id: 'mat/fz-resistivity-record',
    name: 'FZ Wafer Resistivity Record', name_zh: 'FZ 硅片电阻率记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'resistivity', kind: 'range', min: 0.5, max: 200, unit: 'Ω·cm' },
      { param: 'uniformity', kind: 'range', min: 0, max: 20, unit: '%', dir: 'atMost' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 10, unit: '%', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 5, max: 5, unit: '点' },
      { param: 'method', kind: 'enum', values: ['four-point'] },
    ],
  },
];

export const FZ_RESISTIVITY_ROUTES: readonly Route[] = [
  {
    /**
     * **四探针测 FZ 片电阻率：压针 → 5 点 → 厚度修正 → 记录。**
     *
     *   ① 清洁、20 ± 1 °C 等温 30 min（硅的 ρ 温度系数约 0.7 %/K）；
     *   ② 探针 1 mm 间距、1–10 mA，读 V/I；
     *   ③ 沿半径 5 点重复，算 ρ = 2πs·V/I × 厚度修正；
     *   ④ 写电阻率、径向偏差、合成不确定度与点数。
     */
    id: 'measure/fz-resistivity',
    name: 'FZ Wafer Resistivity Measurement', name_zh: 'FZ 硅片电阻率测量',
    rate: { hours: q(2) },
    produces: [
      {
        item: 'mat/fz-resistivity-record',
        qty: q(1),
        gives: [
          { param: 'resistivity', kind: 'range', min: 1, max: 100 },
          { param: 'uniformity', kind: 'range', min: 2, max: 10 },
          { param: 'uncertainty', kind: 'range', min: 3, max: 5 },
          { param: 'points', kind: 'range', min: 5, max: 5 },
          { param: 'method', kind: 'enum', oneOf: ['four-point'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/fz-silicon', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '清洁并等温：20 ± 1 °C 放 30 min（ρ 的温度系数约 0.7 %/K）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '四探针压针：1 mm 间距、1–10 mA，读 V/I；同一片换极性再读一次',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '沿半径 5 点重复，算 ρ = 2πs·V/I 与厚度修正因子',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '写电阻率、径向偏差、合成不确定度（探针间距 + 厚度 + 温度）与点数',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: 'FZ 片 1 片（测完归还）→ 记录 1 份；记录是数据不是物料',
  },
];

export const DATA_ITEMS: readonly Item[] = [...FZ_RESISTIVITY_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...FZ_RESISTIVITY_ROUTES];
