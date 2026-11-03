/**
 * TMAH 显影剂源链 —— 甲醇 + 氨 → 三甲胺 → 四甲基氯化铵 → 四甲基氢氧化铵。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么这条链值得单独立
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * CAR 的显影一直用水（`car-pattern.ts`）：水能显影，但溶胀 5–15 %、细线易倒、
 * 没有表面活性剂。工业 CAR 的显影是 **2.38 wt% TMAH**（四甲基氢氧化铵）。
 * 本层没有 TMAH，也没有离子交换膜；但**甲醇、氨、HCl、KOH 都有路线**，
 * 所以 TMAH 可以从 C1 化学一路做上来，不需要膜电解：
 *
 *   CH₃OH + NH₃ → (CH₃)₃N + H₂O        （Al₂O₃，300–400 °C）
 *   (CH₃)₃N + CH₃Cl → (CH₃)₄N⁺Cl⁻      （50–80 °C，季铵化）
 *   (CH₃)₄N⁺Cl⁻ + KOH → (CH₃)₄N⁺OH⁻ + KCl （20–40 °C，甲醇/水；KCl 沉淀）
 *
 * 第三条是**复分解**，不是电解：KCl 在甲醇里溶解度低，过滤就分开。
 * 这绕开了“本层没有阳离子交换膜”的死结。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 质量账（每 1 kg 产品）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   三甲胺 1 kg：甲醇 1.626 + 氨 0.288 → TMA 1.000 + 水 0.914
 *   四甲基氯化铵 1 kg：TMA 0.539 + 氯甲烷 0.461 → TMACl 1.000
 *   TMAH 25 % 溶液 1 kg：TMACl 0.3005 + KOH 0.1539 + 水 0.750
 *                        → TMAH 0.250 + KCl 0.2044（差 0.0001 是四舍五入）
 *
 * 三条都逐项配平；TMAH 那条按 1 kg 口径有 0.1 g 四舍五入，本路线按 1 000 kg
 * 批次记、三个量已 ×1000，折算后账平（不再有差额可声明）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const TMAH_ITEMS: readonly Item[] = [
  /**
   * 三甲胺（(CH₃)₃N，M 59.11）。bp 2.9 °C，常温是气体。
   *
   * 两个规格：purity 98–99.5 %、waterContent ≤0.5 %。
   * 它是季铵化的原料；易燃、有鱼腥味，本层按钢瓶液化气记账。
   */
  {
    id: 'mat/trimethylamine',
    name: '三甲胺',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'waterContent', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 四甲基氯化铵（(CH₃)₄NCl，M 109.60）。白色晶体，易潮解。
   *
   * 两个规格：purity 98–99.5 %、waterContent ≤0.5 %。
   */
  {
    id: 'mat/tetramethylammonium-chloride',
    name: '四甲基氯化铵',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'waterContent', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 四甲基氢氧化铵 25 % 水溶液（TMAH，M 91.15）。强碱，pKa ≈ 13.5。
   *
   * 两个规格：
   *   concentration 24–26 wt%（显影时稀释到 2.38 wt%）
   *   purity        99–99.9 %（TMAH 基准；杂质是 KCl、甲醇与三甲胺）
   */
  {
    id: 'mat/tmah',
    name: '四甲基氢氧化铵 25 % 水溶液',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'concentration', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
    ],
  },
];

export const TMAH_ROUTES: readonly Route[] = [
  {
    /**
     * **三甲胺：3 甲醇 + 氨 → TMA + 3 水（Al₂O₃，300–400 °C）。**
     *
     *   甲醇 1 626 + 氨 288 → TMA 1 000 + 水 914
     *   进 1 914 = 出 1 914 ✓
     *
     * 甲胺化是**连串反应**：一甲胺、二甲胺、三甲胺同时出，热力学上三甲胺是
     * 主产物（约 40–60 %），未反应的甲胺循环。本文件按三甲胺净产记账，
     * 循环与分离损失写在 `unbalanced_zh` 里，不假装 100 % 选择性。
     */
    id: 'make/trimethylamine',
    name: '三甲胺制备',
    produces: [
      {
        item: 'mat/trimethylamine',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 98, max: 99.5 },
          { param: 'waterContent', kind: 'range', min: 0.1, max: 0.5 },
        ],
      },
      {
        item: 'mat/water',
        qty: q(914),
        gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/methanol', qty: q(1626) }] },
      { anyOf: [{ item: 'mat/ammonia', qty: q(288) }] },
    ],
    needs: ['mat/alumina'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '① 汽化与预热：甲醇 + 氨按 3:1（过量氨）预热到 300–400 °C；酸厂的壳式床能到 500 °C',
        performedBy: 'plant/acid-plant',
        under: [{ param: 'temperature', min: 300, max: 400 }],
      },
      {
        note_zh:
          '② 甲胺化：Al₂O₃ 固定床 300–400 °C / 100–300 kPa；一甲胺/二甲胺/三甲胺混合出，三甲胺 40–60 %，其余循环（本文件按净产记账）',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 300, max: 400 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '③ 冷凝与精馏：三甲胺 bp 2.9 °C，用 −20 °C 盐水冷凝；甲胺/二甲胺回①。本层没有 −20 °C 冷阱的条目，这一段借 `mat/dry-ice`（−78.5 °C）做冷凝介质',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 20, max: 50 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
    ],
    unbalanced_zh:
      '甲醇 1626 + 氨 288 = 1914 → TMA 1000 + 水 914 = 1914（按三甲胺净产记账）。实际甲胺化是三甲胺 40–60 % 的混合物，一甲胺/二甲胺循环；循环量与分离损失不进 uses',
  },

  {
    /**
     * **四甲基氯化铵：TMA + 氯甲烷 → TMACl（50–80 °C）。**
     *
     *   TMA 539 + 氯甲烷 461 → TMACl 1 000
     *   进 1 000 = 出 1 000 ✓
     *
     * 季铵化是放热反应；氯甲烷过量 5–10 % 压住 TMA 残留。产物在水/甲醇里，
     * 浓缩结晶、过滤、真空干燥（本层没有真空干燥器，用 80–100 °C 常压烘）。
     */
    id: 'make/tetramethylammonium-chloride',
    name: '四甲基氯化铵制备',
    produces: [
      {
        item: 'mat/tetramethylammonium-chloride',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 98, max: 99.5 },
          { param: 'waterContent', kind: 'range', min: 0.1, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/trimethylamine', qty: q(539) }] },
      { anyOf: [{ item: 'mat/methyl-chloride', qty: q(461) }] },
    ],
    needs: [],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh:
          '① 季铵化：TMA + 氯甲烷 1:1.05，50–80 °C / 100–300 kPa，甲醇/水溶液；放热，夹套冷却',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 50, max: 80 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '② 浓缩结晶：蒸掉大部分甲醇/水，冷却到 20–30 °C 结晶；过滤，母液回①',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 30 }],
      },
      {
        note_zh:
          '③ 干燥：100–110 °C 常压烘到水 ≤0.5 %（电阻炉下限 100 °C）；本层没有真空干燥器，潮解是这条路线的主要损失',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 110 }],
      },
    ],
  },

  {
    /**
     * **TMAH 25 %：TMACl + KOH → TMAH + KCl（20–40 °C，甲醇/水）。**
     *
     *   TMACl 300.5 + KOH 153.9 + 水 750 → TMAH 25 % 溶液 1000（TMAH 250 + 水 750）+ KCl 204.4
     *   进 1 204.4 = 出 1 204.4 —— 逐项配平
     *
     * 表头是 1 kg 产品口径（TMACl 0.3005 + KOH 0.1539 + 水 0.750）；本路线是
     * 1 000 kg 批次，三个量必须 ×1000 —— 原数据把 1 kg 口径的数写成 1/1000，
     * 导致出 1000 > 进 750.45。现在按批次折算，账平。
     *
     * KCl 在甲醇里溶解度低，沉淀后过滤；滤液调水到 25 %。
     * **不用电解、不用离子交换膜** —— 这是本链绕开“没有阳离子膜”的办法。
     */
    id: 'make/tmah',
    name: '四甲基氢氧化铵 25 % 水溶液制备',
    produces: [
      {
        item: 'mat/tmah',
        qty: q(1000),
        gives: [
          { param: 'concentration', kind: 'range', min: 24, max: 26 },
          { param: 'purity', kind: 'range', min: 99, max: 99.9 },
        ],
      },
      {
        item: 'mat/potassium-chloride',
        // 1 kg 产品口径 0.2044 × 1000 kg 批次 = 204.4
        qty: q(2044, 10),
        gives: [{ param: 'purity', kind: 'range', min: 90, max: 99.5 }],
      },
    ],
    uses: [
      // 1 kg 产品口径 0.3005 × 1000 kg 批次 = 300.5
      { anyOf: [{ item: 'mat/tetramethylammonium-chloride', qty: q(3005, 10) }] },
      // 1 kg 产品口径 0.1539 × 1000 kg 批次 = 153.9
      { anyOf: [{ item: 'mat/koh', qty: q(1539, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(750) }] },
    ],
    needs: [],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① 复分解：TMACl + KOH 在甲醇/水里 20–40 °C 搅拌 1 h；KOH 略过量 2 % 把 TMACl 推到底',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '② 过滤 KCl：KCl 在甲醇里溶解度低，冷却到 20–30 °C 析出（湿法槽下限 20 °C）；过滤，滤饼用少量甲醇洗，洗液回①',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 30 }],
      },
      {
        note_zh:
          '③ 调浓度：滤液加水到 TMAH 25 wt%（用密度/折光估，本层没有在线滴定）；25 % 是显影稀释的母液浓度',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 40 }],
      },
    ],
    unbalanced_zh:
      'TMACl 300.5 + KOH 153.9 + 水 750 = 1204.4 → TMAH 25 % 溶液 1000（TMAH 250 + 水 750）+ KCl 204.4 = 1204.4，平；KOH 实际过量 2 %，过量部分留在母液里，不进 uses。三个量原按 1 kg 口径写成 1/1000，已按 1000 kg 批次折算',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...TMAH_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...TMAH_ROUTES];
