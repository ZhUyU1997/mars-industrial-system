/**
 * STI 测量路线与记录 —— 按 R13 从 machine/sti.ts 迁出。
 *
 * 只放 Item + Route。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const STI_MEASURE_ITEMS: readonly Item[] = [
  /**
   * STI 破坏性截面记录。**5 点，不是全片图；一片只能测一次。**
   *
   *   voidFraction 0–20 %
   *   seamWidth    0–50 nm
   *   dishing      0–100 nm
   *   points       5
   */
  {
    id: 'mat/sti-cross-section-record',
    name: 'STI Destructive Cross-Section Record', name_zh: 'STI 破坏性截面记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'voidFraction', kind: 'range', min: 5, max: 5, unit: '%' },
      { param: 'seamWidth', kind: 'range', min: 10, max: 20, unit: 'nm' },
      { param: 'dishing', kind: 'range', min: 0, max: 100, unit: 'nm' },
      { param: 'points', kind: 'range', min: 5, max: 5, unit: '个' },
    ],
  },

];

export const STI_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **STI 片 → FIB 切 5 个槽 → TEM 量 void/seam/dishing。**
     *
     *   `mat/sti-wafer` 1 → `mat/sti-cross-section-record` 1 份
     *
     * ⚠️ 破坏性：**一片只能测一次**；5 点不是全片图；FIB 切样会引入 Ga 污染。
     * 测出来之前，void/seam/dishing 都只是设计窗口，不是实测值。
     * rate 4 h；performedBy `plant/fib-tem`。
     */
    id: 'measure/sti-fill-cross-section',
    name: 'STI Destructive Cross-Section Measurement', name_zh: 'STI 破坏性截面测量',
    produces: [
      {
        item: 'mat/sti-cross-section-record',
        qty: q(1),
        gives: [
          { param: 'voidFraction', kind: 'range', min: 5, max: 5 },
          { param: 'seamWidth', kind: 'range', min: 10, max: 20 },
          { param: 'dishing', kind: 'range', min: 0, max: 100 },
          { param: 'points', kind: 'range', min: 5, max: 5 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/sti-wafer', qty: q(1) }] }],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① FIB 切样：切 5 个槽，每个槽做一次截面；离子束 1–100 pA、30 kV。**破坏性**，切完这片不能再做电测/其它截面；Ga 注入会留在切面附近',
        performedBy: 'plant/fib-tem',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh:
          '② TEM 量：void 面积比 0–20 %、seam 宽度 0–50 nm、dishing 0–100 nm；5 点统计，不是全片图。AR 3.75 的中心 seam 是重点',
        performedBy: 'plant/fib-tem',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh:
          '③ 记录：voidFraction、seamWidth、dishing、points=5。测出来才算；之前 `make/sti-fill-*` 的 0–5 %/5–20 nm 是设计窗口',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'STI 片 1 → 截面记录 1 份。FIB 切掉 5 个槽，片子破坏、不能退回；记录是数据，不是物料。产物按份计，没有质量账；Ga 污染留在切面，不进 kg 账',
  },

];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...STI_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...STI_MEASURE_ROUTES];
