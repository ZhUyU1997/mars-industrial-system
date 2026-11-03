/**
 * 一碳化学与氯载体 —— 有机层的第一片。
 *
 * 这一层不是"再多写几条路线"，是被一条写错的路线逼出来的：PTFE 必须从
 * 四氟乙烯聚合，而四氟乙烯要从 HCFC-22 裂解，HCFC-22 要从氯仿加氢氟酸，
 * 氯仿要从甲烷氯化 —— 甲烷又只能从 CO₂ 加氢来。
 *
 *   高氯酸盐 ─H₂→ 盐酸 ─O₂→ 氯气 ┐
 *                                  ├→ 氯仿 ← 甲烷 ← CO₂ + H₂
 *   磷灰石 ─H₂SO₄→ 氢氟酸 ────────┴→ HCFC-22 ─(850–900 °C)→ 四氟乙烯 → PTFE
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 氯不是原料，是载体 —— 这是一个闭环
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 按每 1000 kg PTFE 折算，三步副产的盐酸加起来是：
 *
 *   甲烷氯化    2186 kg      氯仿氟化   1458 kg      裂解制 TFE   729 kg
 *   ─────────────────────────────────────────────────────────────
 *   合计        4373 kg HCl → Deacon 法（4HCl + O₂ → 2Cl₂ + 2H₂O）
 *               → 4252 kg Cl₂ + 1081 kg 水
 *
 * 而氯化那一步正好要 4252 kg 氯气（对应 4372 kg 盐酸）。**收 4373、支 4372
 * —— 差 0.02%，是四舍五入，不是设计。** 这就是"化学搬运工"：
 * 氯在体系里转圈，净消耗只补给泄漏。
 *
 * 第一笔氯来自高氯酸盐（ClO₄⁻ + 4.5H₂ → HCl + 4H₂O）—— 它在地板上躺了很久
 * （`mars/perchlorate` 一直没有下家），这是第一个用到它的地方。
 *
 * 这与母机环是同一类结构：环不能自己起来，要从外面接管一次；接管之后自己转。
 * 区别是母机环的入口是一台车床，这里的入口是**一次性约 4.4 吨盐酸**。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 起步价与运行价差一个数量级
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   第一吨 PTFE   要 11.9 吨高氯酸盐 + 1.25 吨氢（把氯池灌满）
 *   之后每吨      只吃甲烷化那一步的 0.16 吨氢，氯自己转
 *
 * 而 1 吨氢要 8.9 吨水去电解 —— 所以**第一吨 PTFE 背后是一万一千吨水**，
 * 之后每吨降到一吨半。这个差别不是四舍五入，是"启动"与"稳态"的差别，
 * 数据里没有时间维，只能靠这句注释记着。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 停在哪：C1 到头了
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 这一层只有一碳：甲烷、氯仿、HCFC-22、四氟乙烯。再往上（乙醇、烯烃、
 * 芳烃、脂肪酸）一条都没有，所以：
 *
 *   浮选药剂   要醇与黄药（醇 + CS₂ + NaOH）—— 卡在 C2
 *   橡胶密封   要异戊二烯与硫化 —— 卡在 C4/C5
 *   润滑脂     要脂肪酸 —— 卡在 C16
 *
 * 浮选药剂已由 `reagents.ts` 用乙醇 + CS₂ + 碱补出黄药，再用丁醇代起泡剂；
 * 橡胶密封与润滑脂仍没有本层路线（缺口不在 `deferred`，而在 C4/C5 与 C16 的碳骨架）。
 * 这一层只是把 PTFE 那一处从“写错”变成了“写得对，但只到 C1”。
 *
 * 这一层按**化学计量**写 —— 有机反应的收率是真收率，不是分离比。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ORGANIC_ITEMS: readonly Item[] = [
  /**
   * 盐酸。氯化氢的水溶液。高氯酸盐还原的产物，也是氯气的来路。
   *
   * 它在这条链上是**中间物**，不是产品：三步反应的副产全汇到这里，
   * 再被 Deacon 法送回氯气。整个环路里它的存量只有几吨。
   */
  { id: 'mat/hcl', name: 'Hydrochloric Acid', name_zh: '盐酸', unit: 'kg', category: 'material',
    props: [{ param: 'concentration', kind: 'range', min: 15, max: 38, unit: '%' }] },

  /**
   * 氯气。强氧化剂，也是这条链的搬运工。
   *
   * 来源:Deacon 法（盐酸 + 氧，铜催化，420 °C）。第一笔氯从高氯酸盐来，
   * 之后靠回收 —— 净消耗只补给泄漏。
   */
  { id: 'mat/chlorine', name: 'Chlorine', name_zh: '氯气', unit: 'kg', category: 'material' },

  /**
   * 甲烷。Sabatier 反应 CO₂ + 4H₂ → CH₄ + 2H₂O。
   *
   * **它是火星有机化学的唯一入口。** 没有石油、没有煤、没有生物质，
   * 一碳以下的碳氢化合物只能从 CO₂ 加氢来。300–400 °C，镍催化。
   */
  { id: 'mat/methane', name: 'Methane', name_zh: '甲烷', unit: 'kg', category: 'material' },

  /**
   * 三氯甲烷（氯仿）。甲烷深度氯化的产物。
   *
   * 它是 PTFE 路线的第一块砖，也是氯在这个环路上的第一个落点 ——
   * 三个氯原子进来，走完四步之后以盐酸的形式出去。
   */
  { id: 'mat/chloroform', name: 'Chloroform', name_zh: '三氯甲烷', unit: 'kg', category: 'material' },

  /**
   * HCFC-22（二氟一氯甲烷，CHClF₂）。氯仿的两个氯被氟换掉。
   *
   * 它是制冷剂，也是四氟乙烯的唯一前体 —— 正是这条路。
   */
  { id: 'mat/hcfc-22', name: 'Chloroform Fluorination', name_zh: '氯仿氟化', unit: 'kg', category: 'material' },

  /**
   * 四氟乙烯（C₂F₄）。HCFC-22 在 850–900 °C 裂解，两个分子缩成一个。
   *
   * 它自己会自聚，所以只能低温贮存、就地聚合 —— 这也是为什么聚合装置
   * 与裂解炉要挨着。
   */
  { id: 'mat/tfe', name: 'Tetrafluoroethylene', name_zh: '四氟乙烯', unit: 'kg', category: 'material' },
];

export const ORGANIC_ROUTES: readonly Route[] = [
  {
    /**
     * 高氯酸盐加氢还原成盐酸。
     *
     *   ClO₄⁻ + 4.5H₂ → HCl + 4H₂O
     *   1000 高氯酸盐 + 91 氢 → 367 盐酸 + 724 水
     *
     * 氯从 +7 价落到 −1 价，九个电子靠氢给。这一步把风化层里那个
     * "有毒、要洗掉"的东西变成氯源 —— 在它之前，高氯酸盐是麻烦，不是料。
     */
    id: 'make/hcl',
    name: 'Perchlorate Hydrogenation Reduction to Hydrochloric Acid Production', name_zh: '高氯酸盐加氢还原成盐酸制备',
    produces: [
      { item: 'mat/hcl', qty: q(367), gives: [{ param: 'concentration', kind: 'range', min: 30, max: 33 }] },
      { item: 'mat/water', qty: q(724), gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mars/perchlorate', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(91) }] },
    ],
    needs: [],
    performedBy: 'plant/acid-plant',
    under: [
      { param: 'temperature', min: 60, max: 200 },
      // 高氯酸盐在水相里还原，溶液必须密闭加压。
      { param: 'pressure', min: 100, max: 500 },
    ],
  },
  {
    /**
     * Deacon 法：4HCl + O₂ → 2Cl₂ + 2H₂O，铜催化，420 °C。
     *
     *   1000 盐酸 + 219 氧 → 972 氯气 + 247 水
     *
     * 这是环的闭合处。它比电解食盐水土，但不需要膜、不需要碱、
     * 也不需要钠 —— 只要有盐酸、氧和一点铜。
     */
    id: 'make/chlorine',
    name: 'Deacon Process Production', name_zh: 'Deacon 法制备',
    produces: [
      { item: 'mat/chlorine', qty: q(972) },
      { item: 'mat/water', qty: q(247), gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/hcl', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(219) }] },
    ],
    needs: [],
    performedBy: 'plant/acid-plant',
    under: [
      { param: 'temperature', min: 380, max: 450 },
      { param: 'pressure', min: 100, max: 500 },
    ],
  },
  {
    /**
     * Sabatier：CO₂ + 4H₂ → CH₄ + 2H₂O，镍催化，300–400 °C。
     *
     *   2743 二氧化碳 + 503 氢 → 1000 甲烷 + 2246 水
     *
     * 产的水可以回电解槽，所以这一步的净消耗是"碳与热"，不是氢。
     * ⚠️ 但水要真的回去才算数 —— 见 data/material/chain.ts 的 make/condensate。
     */
    id: 'make/methane',
    name: 'Methane Production', name_zh: '甲烷制备',
    produces: [
      { item: 'mat/methane', qty: q(1000) },
      { item: 'mat/water', qty: q(2246), gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/co2', qty: q(2743) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(503) }] },
    ],
    needs: [],
    performedBy: 'plant/bosch-reactor',
    under: [{ param: 'temperature', min: 300, max: 400 }],
  },
  {
    /**
     * 甲烷氯化：CH₄ + 3Cl₂ → CHCl₃ + 3HCl，350–450 °C。
     *
     *   134 甲烷 + 1782 氯气 → 1000 氯仿 + 916 盐酸
     *
     * 实际是逐级氯化，一氯到四氯化碳混在一起，靠分馏切开。这里只记总式。
     */
    id: 'make/chloroform',
    name: 'Methane Chlorination Production', name_zh: '甲烷氯化制备',
    produces: [
      { item: 'mat/chloroform', qty: q(1000) },
      { item: 'mat/hcl', qty: q(916), gives: [{ param: 'concentration', kind: 'range', min: 30, max: 33 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/methane', qty: q(134) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(1782) }] },
    ],
    needs: [],
    performedBy: 'plant/bosch-reactor',
    under: [{ param: 'temperature', min: 350, max: 450 }],
  },
  {
    /**
     * 氯仿氟化：CHCl₃ + 2HF → CHClF₂ + 2HCl，液相，氯化锑催化，60–100 °C。
     *
     *   1380 氯仿 + 463 氢氟酸 → 1000 HCFC-22 + 843 盐酸
     *
     * 两个氯被氟换出来 —— 氟从这里进环，氯从这里出环（以盐酸形式）。
     */
    id: 'make/hcfc-22',
    name: 'Chloroform Fluorination Production', name_zh: '氯仿氟化制备',
    produces: [
      { item: 'mat/hcfc-22', qty: q(1000) },
      { item: 'mat/hcl', qty: q(843), gives: [{ param: 'concentration', kind: 'range', min: 30, max: 33 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/chloroform', qty: q(1380) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(463) }] },
    ],
    needs: [],
    performedBy: 'plant/acid-plant',
    under: [{ param: 'temperature', min: 60, max: 100 }],
  },
  {
    /**
     * HCFC-22 裂解：2CHClF₂ → C₂F₄ + 2HCl，850–900 °C，空管热解。
     *
     *   1729 HCFC-22 → 1000 四氟乙烯 + 729 盐酸
     *
     * 借焙烧炉的高温段做裂解 —— 它本来是烧硫酸盐的，这里当裂解管用。
     * 温度低了转化率不够，高了会结焦，窗口只有 50 °C。
     */
    id: 'make/tfe',
    name: 'HCFC-22 Cracking', name_zh: 'HCFC-22 裂解',
    produces: [
      { item: 'mat/tfe', qty: q(1000) },
      { item: 'mat/hcl', qty: q(729), gives: [{ param: 'concentration', kind: 'range', min: 30, max: 33 }] },
    ],
    uses: [{ anyOf: [{ item: 'mat/hcfc-22', qty: q(1729) }] }],
    needs: [],
    performedBy: 'plant/roaster',
    under: [{ param: 'temperature', min: 850, max: 900 }],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 补两样 C1 衍生物 —— 酚醛树脂的另一半
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 甲醇（CH₃OH）。CO₂ + 3H₂，250–300 °C、5–10 MPa，铜锌催化。
 *
 * 它本来是"液态能源/化工原料"那个角色，在这套体系里只有一个用处：
 * 氧化成甲醛，去和苯酚缩聚。**甲醛是酚醛树脂的另一半**（苯酚那一半在
 * data/material/aromatics.ts）。
 */
export const METHANOL: Item = { id: 'mat/methanol', name: 'Methanol', name_zh: '甲醇', unit: 'kg', category: 'material' };

/** 甲醛（HCHO）。甲醇氧化，600–700 °C，银催化。水溶液直接进缩聚釜。 */
export const FORMALDEHYDE: Item = { id: 'mat/formaldehyde', name: 'Formaldehyde', name_zh: '甲醛', unit: 'kg', category: 'material' };

export const C1_ROUTES: readonly Route[] = [
  {
    /**
     * 甲醇合成：CO₂ + 3H₂ → CH₃OH + H₂O，250–300 °C，5–10 MPa，Cu/ZnO/Al₂O₃。
     *
     *   1373 二氧化碳 + 189 氢 → 1000 甲醇 + 562 水
     *
     * 它被列为"从 CO₂ 重建石油化工"的第一个节点 —— 这里只用了
     * 它去制甲醛，实际的甲醇经济（MTO 制烯烃）还没建。
     */
    id: 'make/methanol',
    name: 'Methanol Synthesis', name_zh: '甲醇合成',
    produces: [
      { item: 'mat/methanol', qty: q(1000) },
      { item: 'mat/water', qty: q(562), gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/co2', qty: q(1373) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(189) }] },
    ],
    needs: [],
    performedBy: 'plant/bosch-reactor',
    under: [{ param: 'temperature', min: 250, max: 300 }],
  },
  {
    /**
     * 甲醇氧化：CH₃OH + ½O₂ → HCHO + H₂O，600–700 °C，银网催化。
     *
     *   1067 甲醇 + 533 氧 → 1000 甲醛 + 600 水
     *
     * 放热很强，靠废热锅炉把多余的热带走 —— 而废热最后还是要靠辐射板排掉。
     */
    id: 'make/formaldehyde',
    name: 'Methanol Oxidation', name_zh: '甲醇氧化',
    produces: [
      { item: 'mat/formaldehyde', qty: q(1000) },
      { item: 'mat/water', qty: q(600), gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/methanol', qty: q(1067) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(533) }] },
    ],
    needs: [],
    performedBy: 'plant/bosch-reactor',
    under: [{ param: 'temperature', min: 600, max: 700 }],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ORGANIC_ITEMS, FORMALDEHYDE, METHANOL];
export const DATA_ROUTES: readonly Route[] = [...ORGANIC_ROUTES, ...C1_ROUTES];
