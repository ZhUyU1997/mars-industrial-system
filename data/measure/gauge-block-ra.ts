/**
 * 量块表面粗糙度的测量 —— 本层只能测到 0.1 µm，量块要 0.01 µm。这一条记录的是**测不到**。
 *
 * 为什么要单写一条“测不到”的路线：粗糙度是研合性的物理原因（Ra ≤0.01 µm 才有
 * 那层几十纳米的吸附膜），而本层两样东西都不够：
 *
 *   · **干涉仪测的是面形，不是粗糙度**：钠光 Φ300 平晶给的是“这 300 mm 有多平”，
 *     横向分辨率受限于平晶口径与条纹判读，读不出 10 nm 级的微观起伏；
 *   · **光切法只到 0.1 µm**：显微镜 + 斜照明看磨痕的三角截面，读数精度受
 *     显微镜分辨率（≈0.3 µm）限制，比要判的数大一个量级。
 *
 * 所以这条路线产出的是**记录**：`mat/gauge-block-ra-record`，交 `raResolved` =
 * 0.1–0.4 µm —— 意思是“本层能分辨到这一档”，不是“量块的 Ra 是这一档”。
 *
 * 缺口：要测 0.01 µm 的 Ra，得有触针式轮廓仪（金刚石针尖 2 µm、0.1 nm 垂直
 * 分辨率）或原子力显微镜，两样本层都没有，也没有能造它们的链。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const GAUGE_BLOCK_RA_ITEMS: readonly Item[] = [
  {
    id: 'mat/gauge-block-ra-record',
    name: 'Light-Section Wear Scar Triangular Cross-Section Record', name_zh: '光切法读磨痕三角截面记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'raResolved', kind: 'range', min: 0, max: 10, unit: 'µm', dir: 'atMost' }],
  },
];

export const GAUGE_BLOCK_RA_ROUTES: readonly Route[] = [
  {
    /** 光切法读磨痕三角截面。判据是“能分辨到哪一档”，不是“Ra 是多少”。 */
    id: 'measure/gauge-block-ra',
    name: 'Light-Section Wear Scar Triangular Cross-Section Measurement', name_zh: '光切法读磨痕三角截面测量',
    produces: [
      {
        item: 'mat/gauge-block-ra-record',
        qty: q(1),
        gives: [{ param: 'raResolved', kind: 'range', min: 0.1, max: 0.4 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/gauge-block/block', qty: q(1) }] }],
    needs: [],
    steps: [
      { note_zh: '试样台架在显微镜下，斜照明（入射角约 45°），找一段磨痕', performedBy: 'plant/cd-sem' },
      { note_zh: '读磨痕三角截面的高/宽比，按光切法换算 Ra —— 分辨率约 0.1–0.4 µm', performedBy: 'plant/robot' },
      { note_zh: '记录“能分辨到哪一档”，并注明判不到 0.01 µm', performedBy: 'plant/robot' },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...GAUGE_BLOCK_RA_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...GAUGE_BLOCK_RA_ROUTES];
