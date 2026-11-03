/**
 * 酸淬灭剂 —— 三乙胺（TEA）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么 CAR 需要它
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PAG 曝光后放出的三氟甲磺酸不会只停在曝光区：它在 80–120 °C 的 PEB 里
 * 扩散 6–11 nm，把暗区的缩醛也拆掉。没有淬灭剂时，CAR 的对比度只有 5–8，
 * 边粗糙度就是酸扩散的长度；加 0.3–0.5 wt% 三乙胺，酸在暗区被中和，
 * 对比度才能回到 >10 那一档。
 *
 * 工业上常用三乙胺、三辛胺或叔胺聚合物。本层选三乙胺，理由只有一条：
 * **乙醇与氨都有路线，Al₂O₃ 也有**。反应是经典的乙醇氨化：
 *
 *   3 C₂H₅OH + NH₃ → (C₂H₅)₃N + 3 H₂O      300–400 °C、Al₂O₃ 催化
 *
 * 三乙胺 bp 89 °C，水 100 °C —— 精馏段能切开；未反应的乙醇/氨回床。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 质量账（每 1 kg 三乙胺）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   3×46.07 + 17.03 = 138.21 + 17.03 = 155.24
 *   101.19 + 3×18.02 = 101.19 + 54.05 = 155.24 ✓
 *
 *   ⇒ 乙醇 1 366 g、氨 168 g → 三乙胺 1 000 g + 水 534 g
 *
 * 这是 100 % 收率的化学计量；工业上乙醇过量 2–3 倍、氨过量 3–5 倍，
 * 未反应物循环。本文件按净耗记账，过量部分写进注释，不进 `uses`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const QUENCHER_ITEMS: readonly Item[] = [
  /**
   * 三乙胺（C₆H₁₅N，M 101.19）。无色液体，bp 89 °C，有氨味。
   *
   * 它是 CAR 的**酸淬灭剂**：0.3–0.5 wt% 就够把酸在暗区的扩散压住。
   * 两个规格：
   *   purity        98–99.5 %（杂质是乙醇、二乙胺与乙醛缩合物）
   *   waterContent  0.1–0.5 %（水会跟 PAG 的酸一起把缩醛提前拆掉）
   */
  {
    id: 'mat/triethylamine',
    name: '三乙胺',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'waterContent', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
    ],
  },
];

export const QUENCHER_ROUTES: readonly Route[] = [
  {
    /**
     * **三乙胺：3 乙醇 + 氨 → TEA + 3 水（Al₂O₃，300–400 °C）。**
     *
     *   乙醇 1 366 + 氨 168 → 三乙胺 1 000 + 水 534
     *   进 1 534 = 出 1 534 ✓
     *
     * 三段：① 汽化与预热 300–400 °C；② Al₂O₃ 固定床氨化；③ 冷凝 + 精馏
     * （TEA bp 89 °C / 水 100 °C，塔顶取 TEA）。未反应乙醇/氨回①。
     *
     * ⚠️ 过量：工业乙醇 2–3 倍、氨 3–5 倍；本文件按净耗记账（100 % 收率），
     * 过量与循环不进 `uses`。这是本文件唯一一处“按净式记账”的地方。
     */
    id: 'make/triethylamine',
    name: '三乙胺制备',
    produces: [
      {
        item: 'mat/triethylamine',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 98, max: 99.5 },
          { param: 'waterContent', kind: 'range', min: 0.1, max: 0.5 },
        ],
      },
      {
        item: 'mat/water',
        qty: q(534),
        gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ethanol', qty: q(1366) }] },
      { anyOf: [{ item: 'mat/ammonia', qty: q(168) }] },
    ],
    // Al₂O₃ 是催化剂，不按批消耗；放在 needs 里（与氨合成的铁催化剂同一口径）。
    needs: ['mat/alumina'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '① 汽化与预热：乙醇与氨按 3:1（过量氨）混合，预热到 300–400 °C；酸厂的壳式床能到 500 °C，窗口够',
        performedBy: 'plant/acid-plant',
        under: [{ param: 'temperature', min: 300, max: 400 }],
      },
      {
        note_zh:
          '② 氨化：Al₂O₃ 固定床，300–400 °C / 100–300 kPa；乙醇转化率按 90–95 % 记，未反应物冷凝后回①（本文件按净耗记账，循环不进 uses）',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 300, max: 400 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '③ 冷凝与精馏：TEA bp 89 °C、水 100 °C、乙醇 78 °C；塔顶取 88–90 °C 的 TEA 馏分，塔釜水与未反应醇回①。本层塔的 40–80 °C / 300–1000 kPa 窗口罩不住 89 °C，所以这一段是**常压釜式精馏**，不是那座塔（缺口②）',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 80, max: 100 },
          { param: 'pressure', min: 100, max: 150 },
        ],
      },
    ],
    unbalanced_zh:
      '乙醇 1366 + 氨 168 = 1534 → 三乙胺 1000 + 水 534 = 1534（100 % 收率、净耗记账）。工业乙醇过量 2–3 倍、氨 3–5 倍，未反应物循环；循环量不进 uses。塔顶 89 °C 的 TEA 与 100 °C 的水只能常压釜式切，本层没有 1–5 kPa 的减压塔',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...QUENCHER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...QUENCHER_ROUTES];
