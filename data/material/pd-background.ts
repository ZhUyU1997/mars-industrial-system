/**
 * 源背景实测 —— 均压环 + 0→100 kV 空载 PD 记录。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么先测源，不测试品
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `source-100k` 是 34 级倍压，纹波 3%、22 µA；它自己可能就是最大的局放源。
 * 不先测空载背景，后面“试品 5 pC”没有意义 —— 听到的可能是源的电晕。
 *
 * 本文件给两件：
 *
 *   corona-ring           φ400 × φ50 铝均压环，把 100 kV 端子的表面场压到 <10 kV/mm
 *   pd-background-record  空载 0→100 kV 的 q/率记录（数据件，不是材料）
 *
 * 测试程序：
 *
 *   0 → 20 → 40 → 60 → 80 → 100 kV，每级 5 min
 *   每级记：峰值保持的 q、率表的 Hz、环境温度/湿度
 *
 * 判据与处置（q_bg = 100 kV 下空载背景）：
 *
 *   q_bg < 1 pC     源可用；直接进试品 PD 试验
 *   1–5 pC          先老练/清箱/换均压球，重复 3 次；稳定后可做，
 *                   但要在报告里扣背景，不能写“源 PD-free”
 *   5–10 pC         源不适合签字；换 PD-free 源或外委实验室
 *   >10 pC          停止；先修源，不要测试品
 *
 * ⚠️ 记录件是**一次实测的结果**，不是能力；没有实测前，
 *    R8 #11 的“源背景”仍是未知，不能写“已解决”。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PD_BACKGROUND_ITEMS: readonly Item[] = [
  /**
   * 均压环。φ400 主环、φ50 管，铝；100 kV 下表面场 <10 kV/mm。
   */
  {
    id: 'plant/hv-test-bench/corona-ring', name: 'High-Voltage Test Bench Corona Ring', name_zh: '高压测试台均压环',
    unit: '件',
    category: 'part',
    props: [
      { param: 'majorDiameter', kind: 'range', min: 200, max: 800, unit: 'mm' },
      { param: 'tubeDiameter', kind: 'range', min: 20, max: 100, unit: 'mm' },
      { param: 'surfaceField', kind: 'range', min: 0, max: 20, unit: 'kV/mm', dir: 'atMost' },
    ],
  },

];

export const PD_BACKGROUND_ROUTES: readonly Route[] = [
  {
    /**
     * **均压环：铝管弯环 + 抛光 + 支架。**
     *
     *   铝 2 → 均压环 1
     */
    id: 'make/corona-ring', name: 'High-Voltage Test Bench Corona Ring Manufacturing', name_zh: '高压测试台均压环制造',
    produces: [
      {
        item: 'plant/hv-test-bench/corona-ring',
        qty: q(1),
        gives: [
          { param: 'majorDiameter', kind: 'range', min: 400, max: 400 },
          { param: 'tubeDiameter', kind: 'range', min: 50, max: 50 },
          { param: 'surfaceField', kind: 'range', min: 5, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/aluminium', qty: q(2) }] }],
    needs: [],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(8) },
    unbalanced_zh:
      '铝 2 kg → 均压环 1；余是弯管/焊接/抛光废料。φ400 × φ50 在 100 kV 下表面场约 5–10 kV/mm（空气击穿 ~30 kV/mm，SF₆ 更高）',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PD_BACKGROUND_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PD_BACKGROUND_ROUTES];
