/**
 * 电镀铜的第三种添加剂（整平剂）—— 甲胺 → 季铵盐 → 三组分 bath。
 *
 * 目标链：
 *
 *   mat/methanol + mat/ammonia --Al₂O₃, 350–450 °C, 100–500 kPa--> 混合甲胺
 *   → 精馏切 MMA / DMA / TMA
 *   → mat/methylamine + mat/methyl-chloride --60–100 °C, 0.5–1.5 MPa-->
 *     mat/leveler-jgb（季铵盐）
 *   → mat/superfill-bath + mat/peg + mat/leveler-jgb
 *     → mat/superfill-bath-3（additiveCount=3）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 反应器：这次不是卡在 1–3 MPa
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **甲胺化走 `plant/acid-plant`**（holds 20–500 °C / 100–500 kPa，
 *      chemical.ts:270–278）。350–450 °C / 100–500 kPa 落在窗口内；现有
 *      `make/trimethylamine`（tmah.ts:97）就是 300–400 °C / 100–300 kPa
 *      在同一台设备上做甲醇 + NH₃。低压转化率低，未反应甲醇/氨循环，
 *      不是“1–3 MPa 才能反应”。
 *
 *   ② **精馏走 `plant/distillation-tower`**（holds 40–80 °C / 300–1000 kPa，
 *      poly-plant.ts:116–123）。MMA / DMA / TMA 的常压沸点是 −6.3 / 7.4 /
 *      2.9 °C；加压到 0.3–1 MPa 后塔釜 40–80 °C 能切。但三者沸点太近，
 *      相对挥发度接近 1，**没有塔板数/回流比数据**；purity 95–99 % 是设计值，
 *      不是实测。DMA/TMA 副产照实记。
 *
 *   ③ **季铵化走 `plant/mid-pressure-autoclave`**（20–300 °C / 100–3000 kPa，
 *      pressure-and-uniformity.ts:447–450）。60–100 °C / 0.5–1.5 MPa 本来
 *      就在窗口内；卡的是转化率/游离胺没有滴定数据。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 边界
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   · 甲胺化低压：转化率按 20–40 % 记账，未反应甲醇/氨循环；混合胺
 *     MMA/DMA/TMA 都出，不假装选择性。
 *   · 精馏：没有塔板数/回流比/共沸数据；MMA 95–99 % 是设计窗口；DMA/TMA
 *     作为副产，不保证各自纯度。
 *   · 季铵化：转化率/游离胺未测；`mat/leveler-jgb` 的 purity 90–99 %、
 *     freeAmine 0.1–5 % 都是设计窗口。
 *   · 三组分 bath：additiveCount=3、浓度 100–300 ppm、Cl⁻ 40–80 ppm；
 *     void ≤1 % 引用 `make/plating-superfill-peg` 的 AR ≤2 窗口，是设计值，
 *     未测；e-beam 只能看见 6–9 % 以上的空洞，0–1 % 看不见。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const LEVELER_ITEMS: readonly Item[] = [
  /**
   * 混合甲胺（MMA/DMA/TMA + 少量水）。**甲胺化的粗产物，不是纯 MMA。**
   *
   *   mmaFraction 30–60 %（设计窗口；没有分离数据）
   *   waterContent 0–1 %
   */
  {
    id: 'mat/methylamine-crude',
    name: '混合甲胺',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'mmaFraction', kind: 'range', min: 30, max: 60, unit: '%' },
      { param: 'waterContent', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 一甲胺（MMA，bp −6.3 °C）。**精馏后的主产物。**
   *
   *   purity 95–99 %（设计窗口；塔板数据缺）
   *   waterContent 0–0.5 %
   */
  {
    id: 'mat/methylamine',
    name: '一甲胺',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 95, max: 99, unit: '%', dir: 'atLeast' },
      { param: 'waterContent', kind: 'range', min: 0, max: 0.5, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 二甲胺（DMA，bp 7.4 °C）。**副产，不保证纯度。**
   */
  {
    id: 'mat/dimethylamine',
    name: '二甲胺',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 95, max: 99.5, unit: '%', dir: 'atLeast' },
      { param: 'waterContent', kind: 'range', min: 0, max: 0.5, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 季铵盐整平剂 JGB。**甲胺 + 氯甲烷的烷基化产物。**
   *
   *   purity 90–99 %（设计；转化率/游离胺未测）
   *   freeAmine 0.1–5 %（设计；没有滴定数据）
   */
  {
    id: 'mat/leveler-jgb',
    name: '季铵盐整平剂 JGB',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 90, max: 99, unit: '%', dir: 'atLeast' },
      { param: 'freeAmine', kind: 'range', min: 0.1, max: 5, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 三组分超填充镀液（Cl⁻ + 硫脲 + JGB）。
   *
   *   additiveCount 3 种
   *   concentration 100–300 ppm（JGB 的整平剂窗口）
   *   chloride 40–80 ppm（工业窗口）
   */
  {
    id: 'mat/superfill-bath-3',
    name: '三组分超填充镀液',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'additiveCount', kind: 'range', min: 3, max: 3, unit: '种' },
      { param: 'concentration', kind: 'range', min: 100, max: 300, unit: 'ppm' },
      { param: 'chloride', kind: 'range', min: 40, max: 80, unit: 'ppm' },
    ],
  },
];

export const LEVELER_ROUTES: readonly Route[] = [
  {
    /**
     * **甲胺化：甲醇 + NH₃ → MMA/DMA/TMA 混合物（Al₂O₃，350–450 °C / 100–500 kPa）。**
     *
     *   甲醇 1626 + 氨 288 = 1914 → 混合甲胺 1000 + 水 914
     *
     * 照抄 `make/trimethylamine` 的投料口径（tmah.ts:97）：
     * 3 CH₃OH + NH₃ → (CH₃)₃N + 3 H₂O；混合胺按 1000 kg 净产记账。
     * 低压（0.1–0.5 MPa）转化率按 20–40 % 记，未反应甲醇/氨循环；
     * 循环量与分离损失不进 uses。MMA/DMA/TMA 都出，不假装选择性。
     */
    id: 'make/methylamine',
    name: '甲胺化制备',
    produces: [
      {
        item: 'mat/methylamine-crude',
        qty: q(1000),
        gives: [
          { param: 'mmaFraction', kind: 'range', min: 30, max: 60 },
          { param: 'waterContent', kind: 'range', min: 0, max: 1 },
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
          '① 汽化与预热：甲醇 + 氨按 3:1（过量氨）预热到 350–450 °C；acid-plant 的壳式床能到 500 °C',
        performedBy: 'plant/acid-plant',
        under: [{ param: 'temperature', min: 350, max: 450 }],
      },
      {
        note_zh:
          '② 甲胺化：Al₂O₃ 固定床 350–450 °C / 100–500 kPa。低压转化率只有 20–40 %，未反应甲醇/氨循环；MMA/DMA/TMA 混合出，不假装选择性',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 350, max: 450 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '③ 冷凝：混合甲胺 + 水冷凝；水走 914 kg 副产。甲胺有鱼腥味、易燃，冷凝器按 −20 °C 盐水记（本层用 dry-ice 代）',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 20, max: 50 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
    ],
    unbalanced_zh:
      '甲醇 1626 + 氨 288 = 1914 → 混合甲胺 1000 + 水 914 = 1914。低压转化率 20–40 %，未反应甲醇/氨循环；循环量与分离损失不进 uses。MMA/DMA/TMA 比例见 crude 的 mmaFraction 30–60 %，不是纯 MMA',
  },

  {
    /**
     * **精馏切 MMA / DMA / TMA。**
     *
     *   混合甲胺 1000 → MMA 400 + DMA 300 + TMA 300
     *
     * 沸点：MMA −6.3 °C、TMA 2.9 °C、DMA 7.4 °C（常压）。
     * `plant/distillation-tower` 40–80 °C / 300–1000 kPa：加压后塔釜在这段，
     * 理论上能切；但三者沸点太近、相对挥发度接近 1，**没有塔板数/回流比数据**。
     * purity 95–99 % 是设计窗口，不是实测；DMA/TMA 是副产，不保证各自纯度。
     */
    id: 'make/methylamine-separation',
    name: '精馏切 MMA / DMA / TMA 制备',
    produces: [
      {
        item: 'mat/methylamine',
        qty: q(400),
        gives: [
          { param: 'purity', kind: 'range', min: 95, max: 99 },
          { param: 'waterContent', kind: 'range', min: 0, max: 0.5 },
        ],
      },
      {
        item: 'mat/dimethylamine',
        qty: q(300),
        gives: [
          { param: 'purity', kind: 'range', min: 95, max: 99.5 },
          { param: 'waterContent', kind: 'range', min: 0, max: 0.5 },
        ],
      },
      {
        item: 'mat/trimethylamine',
        qty: q(300),
        gives: [
          { param: 'purity', kind: 'range', min: 98, max: 99.5 },
          { param: 'waterContent', kind: 'range', min: 0.1, max: 0.5 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/methylamine-crude', qty: q(1000) }] }],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    performedBy: 'plant/distillation-tower',
    under: [
      { param: 'temperature', min: 40, max: 80 },
      { param: 'pressure', min: 300, max: 1000 },
    ],
    rate: { hours: q(8) },
    unbalanced_zh:
      '混合甲胺 1000 → MMA 400 + DMA 300 + TMA 300 = 1000。塔釜 40–80 °C / 300–1000 kPa；回流/塔板/共沸没有数据，purity 95–99 % 是设计值。DMA/TMA 是副产，不保证各自纯度；分离损失按 0 记账（实际 2–5 % 未计）',
  },

  {
    /**
     * **季铵化：MMA + 氯甲烷 → JGB 季铵盐（60–100 °C / 0.5–1.5 MPa）。**
     *
     *   MMA 500 + 氯甲烷 500 → JGB 1000
     *
     * `plant/mid-pressure-autoclave` 20–300 °C / 100–3000 kPa，这一档本来就在
     * 窗口内。转化率/游离胺没有滴定数据；purity 90–99 %、freeAmine 0.1–5 %
     * 都是设计窗口。氯甲烷过量 5–10 % 压游离胺，未反应的进尾气/回收（未计）。
     */
    id: 'make/leveler-jgb',
    name: '季铵化制备',
    produces: [
      {
        item: 'mat/leveler-jgb',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 90, max: 99 },
          { param: 'freeAmine', kind: 'range', min: 0.1, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/methylamine', qty: q(500) }] },
      { anyOf: [{ item: 'mat/methyl-chloride', qty: q(500) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    performedBy: 'plant/mid-pressure-autoclave',
    under: [
      { param: 'temperature', min: 60, max: 100 },
      { param: 'pressure', min: 500, max: 1500 },
    ],
    rate: { hours: q(6) },
    unbalanced_zh:
      'MMA 500 + 氯甲烷 500 = 1000 → JGB 1000。季铵化放热；氯甲烷过量 5–10 % 压游离胺，未反应气未计。转化率/游离胺未测；purity 90–99 %、freeAmine 0.1–5 % 是设计窗口',
  },

  {
    /**
     * **三组分 bath：superfill-bath + PEG + JGB。**
     *
     *   现有 bath 998 + PEG 1 + JGB 1 → 三组分 bath 1000
     *
     * additiveCount=3（Cl⁻ + 硫脲 + JGB）；浓度 100–300 ppm、Cl⁻ 40–80 ppm
     * 照工业窗口。混合是物理过程，没有反应；2 h 是配液/循环/过滤。
     */
    id: 'make/superfill-bath-3',
    name: '三组分 bath 制备',
    produces: [
      {
        item: 'mat/superfill-bath-3',
        qty: q(1000),
        gives: [
          { param: 'additiveCount', kind: 'range', min: 3, max: 3 },
          { param: 'concentration', kind: 'range', min: 100, max: 300 },
          { param: 'chloride', kind: 'range', min: 40, max: 80 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/superfill-bath', qty: q(998) }] },
      { anyOf: [{ item: 'mat/peg', qty: q(1) }] },
      { anyOf: [{ item: 'mat/leveler-jgb', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    performedBy: 'plant/wet-bench',
    under: [{ param: 'temperature', min: 20, max: 40 }],
    rate: { hours: q(2) },
    unbalanced_zh:
      '现有 bath 998 + PEG 1 + JGB 1 = 1000 → 三组分 bath 1000。物理混合，无反应；过滤/循环 2 h。additiveCount=3、浓度 100–300 ppm、Cl⁻ 40–80 ppm 是配液窗口，不是实测',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...LEVELER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...LEVELER_ROUTES];
