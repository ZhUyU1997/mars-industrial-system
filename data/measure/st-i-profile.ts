/**
 * STI 槽剖面记录 —— CD-SEM 看顶宽/槽底，X-SEM 看侧壁/深度/残渣。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么两件都用
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   · CD-SEM：0.3 nm 重复性、tilt ±60°，能读 100–200 nm 的顶宽与“槽底闭没闭”；
 *     但它是**俯视**，分不开 86° 与 89°，也看不见残渣。
 *   · FIB + TEM：切 5 个槽，直接量侧壁角、深度、残渣；**破坏性**，一片只能测一次。
 *
 * 所以 `measure/st-i-profile` 的 `gives` 是两件合起来的记录，不是一台仪器的
 * 能力。`plant/cd-sem` 与 `plant/fib-tem` 都在 `data/machine/cd-sem.ts`。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 判据与不确定度
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   sidewallAngle   85–89°  X-SEM 读；±1°（样品倾斜/铂保护层）
 *   etchDepth       250–300 nm  X-SEM 读；±3 nm
 *   residue         0–1 nm  X-SEM 暗场；1 nm 是 TEM 样品分辨率的下限，
 *                   所以只能判“≤1 nm”，分不开 0 与 0.8 nm
 *   cdBias          ±2 nm  CD-SEM 顶宽 − 版宽；CD-SEM 重复性 0.3 nm，
 *                   但 CAR 侧壁退角让“顶宽”依赖阈值 ⇒ ±2 nm 是设计窗口
 *   depthUniformity ±3 %  5 点 X-SEM，不是 49 点全片图；5 点只能看“有没有
 *                   系统性倾斜”，不能给全片 σ
 *   points          5（一片只能切一次）
 *
 * ⚠️ 破坏性：测完这片不能再进 `make/car-sti-trench` 或电测。记录是数据，
 * 不是物料；FIB 的 Ga 污染留在切面，不进 kg 账。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ST_I_PROFILE_ITEMS: readonly Item[] = [
  /**
   * STI 槽剖面记录：一条记录带侧壁角、深度、残渣、CD 偏差、深度均匀性。
   *
   *   sidewallAngle   85–89°
   *   etchDepth       250–300 nm
   *   residue         0–1 nm
   *   cdBias          −2..2 nm
   *   depthUniformity 1.5–3 %
   *   points          5
   */
  {
    id: 'mat/st-i-profile-record',
    name: 'STI Trench Profile Record', name_zh: 'STI 槽剖面记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'sidewallAngle', kind: 'range', min: 0, max: 90, unit: '°', dir: 'atLeast' },
      { param: 'etchDepth', kind: 'range', min: 250, max: 300, unit: 'nm' },
      { param: 'residue', kind: 'range', min: 0, max: 10, unit: 'nm', dir: 'atMost' },
      { param: 'cdBias', kind: 'range', min: -10, max: 10, unit: 'nm' },
      { param: 'depthUniformity', kind: 'range', min: 0, max: 10, unit: '%', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 5, max: 5, unit: '个' },
    ],
  },
];

export const ST_I_PROFILE_ROUTES: readonly Route[] = [
  {
    /**
     * **STI 槽片 → CD-SEM 顶宽 → FIB 切 5 点 → X-SEM 量侧壁/深度/残渣。**
     *
     *   `mat/car-stripped-wafer` 1 → 记录 1 份
     *
     * 破坏性：FIB 切 5 个槽，测完这片不能再用；5 点不是全片图。
     */
    id: 'measure/st-i-profile',
    name: 'STI Trench Profile Measurement', name_zh: 'STI 槽剖面测量',
    produces: [
      {
        item: 'mat/st-i-profile-record',
        qty: q(1),
        gives: [
          { param: 'sidewallAngle', kind: 'range', min: 85, max: 89 },
          { param: 'etchDepth', kind: 'range', min: 250, max: 300 },
          { param: 'residue', kind: 'range', min: 0, max: 1 },
          { param: 'cdBias', kind: 'range', min: -2, max: 2 },
          { param: 'depthUniformity', kind: 'range', min: 1.5, max: 3 },
          { param: 'points', kind: 'range', min: 5, max: 5 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/car-stripped-wafer',
            qty: q(1),
            need: [
              { param: 'lineWidth', kind: 'range', min: 100, max: 200 },
              { param: 'etchDepth', kind: 'range', min: 250, max: 300 },
              { param: 'sidewallAngle', kind: 'range', min: 85, dir: 'atLeast' },
              { param: 'residue', kind: 'range', max: 2, dir: 'atMost' },
            ],
            onRelax: 'functional-lost',
          },
        ],
      },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① CD-SEM 顶宽/槽底：100–200 nm 线、0.3 nm 重复性、tilt ±60°；只判“槽底还开”，角度留给 X-SEM',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh:
          '② FIB 切 5 个槽：30 kV、1–100 pA，每个槽做一次截面；Ga 注入留在切面，破坏性',
        performedBy: 'plant/fib-tem',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh:
          '③ X-SEM 量：侧壁 85–89°、深度 250–300 nm、残渣 0–1 nm、5 点深度均匀性 1.5–3 %；1 nm 是 TEM 样品分辨下限，只能判“≤1 nm”',
        performedBy: 'plant/fib-tem',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh:
          '④ 写记录：sidewallAngle、etchDepth、residue、cdBias、depthUniformity、points=5；测出来才算，之前 `make/car-sti-trench-hbr` 的窗口是设计值',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'STI 槽片 1 → 记录 1 份。FIB 切 5 个槽，片子破坏、不能退回；记录是数据，不是物料。产物按份计，没有质量账；Ga 污染留在切面，不进 kg 账',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ST_I_PROFILE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...ST_I_PROFILE_ROUTES];
