/**
 * 量块研合性的测量 —— 本层第一个“量块自己的精度”判据。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 怎么判“研住了”
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 两块量块贴住，靠的是表面那层极薄的吸附膜（水/油），拉开要 30–100 kPa 的
 * 拉应力。本层没有拉力计，所以判据是**定性的两步**：
 *
 *   ① 研合后，用比较仪读“单块”与“研合后的两块之差”：差值应等于两块标称值
 *      之和（±0.1 µm）。差出来的是间隙。
 *   ② 挂上去：把研合好的两块挂在支架上，靠自重不脱开 —— 30–100 g 的量块，
 *      就是几十到几百 Pa 的拉应力，够判“研没研住”。
 *
 * ⚠️ **本路线只产记录，不产块**（2024 年回归的更正）：
 *   以前这条 `measure/*` 的 `produces` 直接写 `plant/gauge-block/block` —— 测量
 *   动作“造出”量块，是拓扑上的循环。现在改为产 `mat/gauge-block-wringing-record`
 *   （一份记录），块仍由 `make/gauge-block-copy` 制造。研合性只**判**块，
 *   不**造**块；要修研合面，走 `make/gauge-block-copy` 的研磨/研合工序。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 已知缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① **膜厚本身测不了**：20–60 nm 是文献值与“比较仪读数差不出来（<0.1 µm）”
 *     推的，不是量的。要测它得用干涉仪测多次反射的相位，本层干涉仪是
 *     斐索型、测的是面形，不是膜厚。
 *  ② **表面粗糙度没有量具**：研合性直接取决于 Ra（要 ≤0.01 µm），本层只有
 *     比较仪与光切法，读不到 10 nm。
 *  ③ **吸附膜的成分不可控**：本层没有洁净度分级，膜里有尘就研不住，
 *     而尘的粒径没有计数器（`plant/particle-counter` 在，但只数 ≥0.3 µm）。
 */

import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const GAUGE_BLOCK_WRINGING_ROUTES: readonly Route[] = [
  {
    /** 研合性测量：比较仪读差值 + 悬挂不脱开 ⇒ 记录（不产块）。 */
    id: 'measure/gauge-block-wringing',
    name: '研合性测量',
    produces: [
      {
        item: 'mat/gauge-block-wringing-record',
        qty: q(1),
        gives: [
          { param: 'wringGap', kind: 'range', min: 20, max: 40 },
          { param: 'contactStress', kind: 'range', min: 30, max: 60 },
          { param: 'hangTime', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/gauge-block/block', qty: q(1) }] },
      { anyOf: [{ item: 'std/gauge-block-working', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '研合：两块对研（画小圈、轻推），贴住后不应有可见缝', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '比较仪读“单块”与“研合两块”的差值，差 ≤0.1 µm', performedBy: 'plant/comparator' },
      { note_zh: '悬挂：研合件挂支架上 10 s，自重不脱开；记 wringGap 20–40 nm、contactStress 30–60 kPa、hangTime 10 s', performedBy: 'plant/robot' },
    ],
  },
];

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [
  /**
   * **量块研合性记录（measure/gauge-block-wringing 的产物，不是块）。**
   *
   * 这条记录以前直接写在测量路线的 `produces` 里产块 —— 测量动作“造出”量块，
   * 拓扑上循环。现在独立成记录：测量只判研合性，块由 `make/gauge-block-copy` 造。
   *
   *   wringGap       20–40 nm（研合膜厚设计值）
   *   contactStress  30–60 kPa（拉开所需拉应力，文献 30–100）
   *   hangTime       10 s（自重不脱开）
   */
  {
    id: 'mat/gauge-block-wringing-record',
    name: '量块研合性记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'wringGap', kind: 'range', min: 0, max: 100, unit: 'nm', dir: 'atMost' },
      { param: 'contactStress', kind: 'range', min: 20, max: 100, unit: 'kPa' },
      { param: 'hangTime', kind: 'range', min: 5, max: 30, unit: 's' },
    ],
  },
];
export const DATA_ROUTES: readonly Route[] = [...GAUGE_BLOCK_WRINGING_ROUTES];
