/**
 * 油浸精密电阻的 accuracy / TCR 测量 —— 四端对 + 油槽 + 比值桥。
 *
 * 这条路线只写**测量程序与能力域**，不写 0.005 % 的读数：
 *
 *   被测    `std/precision-resistor-oil`（1 Ω–100 kΩ、四端对）
 *   参考    `std/precision-resistor-manganin`（0.01–0.05 %，100–500 ppm）
 *   油槽    `plant/precision-oil-bath`（20–30 °C、0.005–0.01 K 稳定）
 *   比值桥  `plant/ratio-bridge`（ratioError ≤100 ppm）
 *
 * 账：
 *   · 参考电阻 100–500 ppm，比值桥 100 ppm ⇒ 比较的合成不确定度约
 *     150–500 ppm（RSS）；要把被测件判到 0.005 %（50 ppm），参考与桥
 *     都不够，差 3–10 倍。
 *   · 油槽只有 20–30 °C（10 K 跨度）；TCR 2–5 ppm/K 要在 20–50 °C 上
 *     拟合，本层只能测 10 K 段，斜率外推的误差与 TCR 本身同量级。
 *
 * 所以本条记录的能力域是 accuracy 0–200 ppm、TCR 0–10 ppm/K；`make/
 * precision-resistor-oil` 的 0.005–0.02 % 与 2–5 ppm/K 仍是 design。
 * 升级要两台东西：更高准确度的标准电阻（或量子霍尔）与更宽的恒温槽。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PRECISION_RESISTOR_ITEMS: readonly Item[] = [
  /**
   * 油浸精密电阻的 accuracy / TCR 记录。能力域：accuracy 0–500 ppm、
   * TCR 0–50 ppm/K、温度 20–30 °C、points 1–3；不是 0.005 % 的读数。
   */
  {
    id: 'mat/precision-resistor-oil-record',
    name: 'Oil-Immersed Precision Resistor Accuracy/TCR Record', name_zh: '油浸精密电阻的 accuracy / TCR 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'accuracy', kind: 'range', min: 0, max: 500, unit: 'ppm', dir: 'atMost' },
      { param: 'tempCoefficient', kind: 'range', min: 0, max: 50, unit: 'ppm/K', dir: 'atMost' },
      { param: 'temperature', kind: 'range', min: 20, max: 30, unit: '°C' },
      { param: 'points', kind: 'range', min: 1, max: 3, unit: '点' },
    ],
  },
];

export const PRECISION_RESISTOR_ROUTES: readonly Route[] = [
  {
    /**
     * 四端对比较：20 / 25 / 30 °C 三点，比值桥读 R/Rs，三点拟合 TCR。
     *
     * 输出能力域 `accuracy 0–200 ppm`、`tempCoefficient 0–10 ppm/K`、
     * `temperature 20–30 °C`、`points 3`。参考电阻 100–500 ppm 与比值桥
     * 100 ppm 是本条的底；油槽 10 K 跨度只够测 10 K 段的斜率。
     */
    id: 'measure/precision-resistor-oil-accuracy',
    name: 'Oil-Immersed Precision Resistor Accuracy/TCR Measurement', name_zh: '油浸精密电阻的 accuracy / TCR 测量',
    produces: [
      {
        item: 'mat/precision-resistor-oil-record',
        qty: q(1),
        gives: [
          { param: 'accuracy', kind: 'range', min: 0, max: 200 },
          { param: 'tempCoefficient', kind: 'range', min: 0, max: 10 },
          { param: 'temperature', kind: 'range', min: 20, max: 30 },
          { param: 'points', kind: 'range', min: 3, max: 3 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: [
      'std/precision-resistor-oil',
      'std/precision-resistor-manganin',
      'plant/metrology-room',
    ],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: '四端对接待测与标准电阻：电流端/电位端分开，引线等长；接触电阻 <1 mΩ',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '油槽 20 / 25 / 30 °C，每点稳定 30 min；槽内 0.005–0.01 K、均匀性 0.02 K',
        performedBy: 'plant/precision-oil-bath',
      },
      {
        note_zh: '比值桥读 R/Rs：1 kHz、四端对；三点线性拟合 TCR；桥 ratioError ≤100 ppm 进账',
        performedBy: 'plant/ratio-bridge',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '写能力域 accuracy 0–200 ppm、TCR 0–10 ppm/K；0.005 % 与 2–5 ppm/K 仍是 design',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '水 1 kg → 记录 1 份；待测电阻、标准电阻、油槽与比值桥都是量具，不消耗。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...PRECISION_RESISTOR_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PRECISION_RESISTOR_ROUTES];
