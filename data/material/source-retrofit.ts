/**
 * 100 kV 源 PD  retrofit —— 不换倍压，先把“源自己放电”压下去。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么先 retrofit，不直接造 PD-free 源
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `source-100k` 是 34 级倍压，纹波 3%、22 µA；它的局放可能来自：
 *
 *   · 倍压节点/焊点的尖角；
 *   · 高压引线与箱壁的距离；
 *   · 空气/低气压下的沿面；
 *   · 滤波/测量线把高频引出去。
 *
 * 真造一台 PD-free 源要：低局放变压器 + 真空浇注/油浸 + 均压 +
 * 局放测试，周期长。先做 retrofit：
 *
 *   SF₆ 箱体 + 均压环 + 光滑高压接头 + 独立接地/滤波
 *
 * 它能把“电晕/沿面”压下去，但**不保证** <1 pC；最终仍要实测背景。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const SOURCE_RETROFIT_ITEMS: readonly Item[] = [
  /**
   * 100 kV 源 PD retrofit 套件。SF₆ 箱 + 均压环 + 光滑接头。
   *
   *   voltage   100 kV
   *   pdLevel   ≤3 pC（设计值，未实测）
   */
  {
    id: 'plant/hv-test-bench/source-100k-retrofit',
    name: '100 kV 源 PD retrofit 套件',
    unit: '套',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 0, max: 200000, unit: 'V', dir: 'atLeast' },
      { param: 'pdLevel', kind: 'range', min: 0, max: 10, unit: 'pC', dir: 'atMost' },
    ],
  },
];

export const SOURCE_RETROFIT_ROUTES: readonly Route[] = [
  {
    /**
     * **retrofit：SF₆ 箱 + 均压环 + 光滑接头 + 独立地。**
     *
     *   铝 5 + 铜 2 + PTFE 1 + 不锈钢 1 + SF₆ 5 → retrofit 1
     */
    id: 'make/source-100k-retrofit',
    name: '100 kV 源 PD retrofit 套件制造',
    produces: [
      {
        item: 'plant/hv-test-bench/source-100k-retrofit',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 100000, max: 100000 },
          { param: 'pdLevel', kind: 'range', min: 1, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sf6', qty: q(5) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh:
          '把倍压/引线装进 SF₆ 箱：所有高压节点加 φ20–50 均压球，焊点打磨 R5 以上；引线与箱壁距离 ≥100 mm；箱内抽真空后充 SF₆ 0.2 MPa',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '高压接头改光滑香蕉插/均压帽；测量/滤波线加穿心电容/屏蔽；源独立接地，不与屏蔽笼/台架成环',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      '铝 5 + 铜 2 + PTFE 1 + 不锈钢 1 + SF₆ 5 = 14 kg → retrofit 1；余是箱体/均压球/接头废料。≤3 pC 是设计值；未实测前不能写“源已 PD-free”',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...SOURCE_RETROFIT_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...SOURCE_RETROFIT_ROUTES];
