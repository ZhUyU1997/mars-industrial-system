/**
 * 100 kV 注入机变压器 —— 给 `plant/ion-implanter` 补上“变压器方案”那一件。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么是 SF₆ 干式，不是油浸
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本层没有变压器油（`mat/transformer-oil` 0 条），也没有油处理与局放仪；
 * 但 `mat/sf6` 有路线（`rie.ts:770`）。SF₆ 的击穿场强在 0.4 MPa 下约是空气的
 * 2.5–3 倍，100 kV 的相间/对地距离可以压到 30–50 mm —— 这是本层唯一能
 * 用现有料做出的 100 kV 绝缘。
 *
 * 代价：SF₆ 是温室气体，GWP 23500；本层没有回收/提纯路线，充气与检漏都是
 * 一次性的。这一条记在缺口③。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 交付与缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ratedVoltage   100–120 kV（设计值）
 *   ratedPower     2–5 kW
 *   testedVoltage  **10 kV** —— 本层只有 10 kV 试压台（`implant.ts:§八` 缺口⑪），
 *                  100 kV 没有打过；这是本文件最硬的一处“未验证”
 *
 * 17 级倍压柱（`plant/ion-implanter/hv-column`）已经能给 100 kV / 22 µA；
 * 变压器这条路的目的是把**束流**从 22 µA 往上抬，而不是抬能量。变压器本身
 * 只解决“电源”这一半，束流还受 source/磁分析器/加速管限制 —— 这一条
 * 写进 R8 的缺口②，不假装变压器一到束流就到 1 mA。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const IMPLANT_TRANSFORMER_ITEMS: readonly Item[] = [
  /**
   * 100 kV 级 SF₆ 干式变压器。**只完成到“能造出来、10 kV 打过”这一档。**
   *
   * 五个规格：
   *   ratedVoltage   100–120 kV（设计）
   *   ratedPower     2–5 kW（够 1 mA × 100 kV 的 100 W 的 20–50 倍余量）
   *   testedVoltage  10 kV（试压台上限）
   *   leakRate       ≤1e-3 Pa·L/s（SF₆ 年泄漏 <1 % 的粗算）
   *   mass           100 kg
   */
  {
    id: 'plant/ion-implanter/hv-transformer',
    name: '100 kV 级 SF₆ 干式变压器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'ratedVoltage', kind: 'range', min: 0, max: 200, unit: 'kV', dir: 'atLeast' },
      { param: 'ratedPower', kind: 'range', min: 0, max: 10, unit: 'kW', dir: 'atLeast' },
      { param: 'testedVoltage', kind: 'range', min: 0, max: 150, unit: 'kV' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1, unit: 'Pa·L/s', dir: 'atMost' },
      { param: 'mass', kind: 'range', min: 0, max: 500, unit: 'kg' },
    ],
  },
];

export const IMPLANT_TRANSFORMER_ROUTES: readonly Route[] = [
  {
    /**
     * **100 kV 变压器：绕线 → 叠铁芯 → 焊 SF₆ 箱 → 充气 → 10 kV 试压。**
     *
     * 进：铜线 20 + 硅钢片 50 + 不锈钢 25 + SF₆ 3 + 氧化铝 1 + PTFE 1 = 100 kg
     * 出：变压器 100 kg（逐项配平）
     *
     * ⚠️ 第⑤步只到 10 kV：本层没有 100 kV 局放/耐压台。变压器的 100 kV
     * 那一档是**设计值与绝缘距离算出来的**，不是打出来的（缺口①）。
     */
    id: 'make/implant-hv-transformer',
    name: '100 kV 级 SF₆ 干式变压器制造',
    produces: [
      {
        item: 'plant/ion-implanter/hv-transformer',
        qty: q(1),
        gives: [
          { param: 'ratedVoltage', kind: 'range', min: 100, max: 120 },
          { param: 'ratedPower', kind: 'range', min: 2, max: 5 },
          { param: 'testedVoltage', kind: 'range', min: 10, max: 10 },
          { param: 'leakRate', kind: 'range', min: 0, max: 0.001 },
          { param: 'mass', kind: 'range', min: 100, max: 100 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper-wire', qty: q(20) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(50) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(25) }] },
      { anyOf: [{ item: 'mat/sf6', qty: q(3) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    // 五道工序各自写执行者；needs 留空（设备只由工序表达）
    needs: [],
    rate: { hours: q(40) },
    steps: [
      {
        note_zh:
          '① 绕线：初级 220 V / 次级 100 kV，铜线 20 kg；层间用 0.05 mm 铝箔静电屏蔽 + SF₆ 气道（本层没有诺梅克斯纸，与 flow-and-rf.ts 的 2.4 kV 变压器同一招）',
        performedBy: 'plant/winder',
      },
      {
        note_zh:
          '② 叠铁芯：50 kg 硅钢片叠成日字型，夹件压紧；铁芯必须一点接地，否则 100 kV 侧会通过铁芯对地放电',
        performedBy: 'plant/press',
      },
      {
        note_zh:
          '③ 焊 SF₆ 箱：25 kg 不锈钢板卷圆、焊接、打磨焊缝；法兰面用 PTFE 垫圈，O 形圈槽要能扛 0.4 MPa',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh:
          '④ 充 SF₆：抽真空到 <100 Pa，再充 0.3–0.4 MPa 的 SF₆（3 kg）；用压力表与检漏液，没有在线露点/分解产物检测（缺口②）',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '⑤ 试压：10 kV / 1 min 耐压 + 绝缘电阻；**100 kV 没有台子**，只能按 30–50 mm 的 SF₆ 绝缘距离与 2.5–3 倍击穿裕度算（缺口①）',
        performedBy: 'plant/hv-test-bench',
      },
    ],
    unbalanced_zh:
      '铜线 20 + 硅钢 50 + 不锈钢 25 + SF₆ 3 + 氧化铝 1 + PTFE 1 = 100 kg → 变压器 100 kg（逐项配平）。SF₆ 充装 3 kg，没有回收/提纯；试压只到 10 kV，100 kV 是设计值不是实测值',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...IMPLANT_TRANSFORMER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...IMPLANT_TRANSFORMER_ROUTES];
