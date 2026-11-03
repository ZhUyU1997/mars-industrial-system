/**
 * φ150 非球面检测记录与测量路线。
 *
 * 记录按份计，不按 kg；它是 `measure/asphere-150` 的产出，证明零位检验能读到
 * 158 nm 这一档，而不是只写“已检验”。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DATA_ITEMS: readonly Item[] = [
  /**
   * **φ150 非球面检测记录：PV ≤158 nm（λ/4 @633）、NA 0.86。**
   *
   * 记录按份计，不按 kg；它是 `measure/asphere-150` 的产出，证明零位检验能读到
   * 158 nm 这一档，而不是只写“已检验”。
   *
   * ⚠️ Ra ≤1 nm 只写进路线注与目标，**不写进这份记录**：本层没有 1 nm 档的
   * 白光干涉/AFM，现有表面读数下限是干涉仪 1/20 条纹 = **15 nm** —— 差 15×。
   * 把 1 nm 写成记录属性会变成一条没有量具支撑的假读数。
   */
  {
    id: 'mat/asphere-150-record',
    name: 'φ150 Asphere Inspection Record', name_zh: 'φ150 非球面检测记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'figure', kind: 'range', min: 0, max: 158, unit: 'nm', dir: 'atMost' },
      { param: 'aperture', kind: 'range', min: 0, max: 400, unit: 'mm', dir: 'atLeast' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 10, unit: '%', dir: 'atMost' }, // 主项：CGH + 干涉仪标准（u 5–10 nm / 158 nm ≈ 3–6 %）
    ],
  },
];

export const DATA_ROUTES: readonly Route[] = [
  /**
   * **φ150 非球面检测记录（1 份）。**
   *
   * 用 φ160 CGH 做零位：PV ≤158 nm（λ/4 @633）、NA 0.86、口径 150。8 h。
   * 记录按份计，水 0.1 kg 只作清洗/耦合，不进 kg 账。
   *
   * Ra ≤1 nm 是**抛光目标**，不是这份记录：本层没有 1 nm 档粗糙度仪，现有读数
   * 下限 15 nm（1/20 条纹），差 15×；这条缺口写在文件头的剩余缺口里。
   */
  {
    id: 'measure/asphere-150',
    name: 'φ150 Asphere Inspection Measurement', name_zh: 'φ150 非球面检测测量',
    rate: { hours: q(8) },
    produces: [
      {
        item: 'mat/asphere-150-record',
        qty: q(1),
        gives: [
          { param: 'figure', kind: 'range', min: 158, max: 158 },
          { param: 'aperture', kind: 'range', min: 150, max: 150 },
          { param: 'uncertainty', kind: 'range', min: 3, max: 6 },
        ],
      },
    ],
    uses: [
      // 被校件：φ150 非球面本体（不是只测“已检验”）。它与水同列，水是清洗/耦合。
      { anyOf: [{ item: 'plant/null-test/asphere-150', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 10) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/interferometer',
      'plant/ref-flat-interferometer',
      'plant/null-test/cgh-160',
    ],
    performedBy: 'plant/null-test',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    unbalanced_zh:
      '水 0.1 kg → 记录 1 份（按份计，不参与 kg 账）；水全走（清洗/耦合液），差额进废液。',
  },
];
