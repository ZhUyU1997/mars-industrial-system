/**
 * 铑精炼 —— 把 PGM 精矿里的 Rh（占 PGM 的 2.5 %，12 kg/1000 kg 精矿）
 * 从"一次性输入"接回本地链。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 0. 为什么 Pt/Pd 链没有顺手回收 Rh
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `pgm.ts` 的 Pt/Pd 路线是 **HCl + Cl₂、80–100 °C** 的氯化浸出：
 *   Pt/Pd/Au 进液，Rh/Ir 留在渣里（`mat/tailings`）。这不是"忘了"，是
 *   **Rh 的化学不吃这套条件**：
 *
 *     · Rh 在精矿里多半与 Ir/Pt 形成难溶的金属间相/氧化物，氯化浸出
 *       只啃得动 Pt/Pd/Au 与贱金属，Rh 的溶解率 <5 %；
 *     · Rh 要**碱熔/硫酸氢钠熔融 600–800 °C**，把金属态 Rh 转成可溶的
 *       硫酸盐/亚硝酸盐配合物（RhO₄²⁻ / Rh(NO₂)₆³⁻），再水浸/酸浸；
 *     · 氯化浸出液里 HCl 32 % + Cl₂ 的氛围对 Rh 不是"更强"，而是"更钝化"：
 *       Rh 表面会生成致密氯化物膜，反而挡住溶解。
 *
 *   所以本文件走**碱熔优先**的六步，与 Pt/Pd 氯化浸出**并联**（同一
 *   `mat/pgm-concentrate` 条目，两条 OR 路线；模型不判资源竞争）。
 *   真实工厂会把 Pt/Pd 氯化渣送这里；本模型的 `mat/tailings` 是通用条目，
 *   标识不了"这是 PGM 渣"，所以直接吃精矿，并在注释里记下这处简化。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 1. 六步（设计值，Earth 工程值）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① 碱熔/硫酸氢钠熔融  精矿 1000 + 45 % NaOH 300 + 98 % H₂SO₄ 400
 *                         600–800 °C、2–4 h → 熔块 1400 + SO₂ 80 + CO₂ 20 + 水 200
 *   ② 水浸/酸浸         熔块 1400 + 32 % HCl 800 + Cl₂ 100 + 水 1000
 *                         80–100 °C、100–300 kPa → 氯化液 3000（Rh 3.8 g/L）+ 渣 300
 *   ③ 氯化              RhCl₆³⁻ 在 ② 的 Cl₂ 段形成；不另设反应器，同一浸出槽
 *   ④ 选择性沉淀        氯化液 3000 + NH₄Cl 100 → (NH₄)₃RhCl₆ 40 kg
 *                         20–60 °C、4–6 h；母液 3060 kg（声明不平衡）
 *   ⑤ 还原              (NH₄)₃RhCl₆ 40 + H₂ 5 → Rh 10 + NH₄Cl 17 + HCl 12 + 尾渣 1
 *                         700–900 °C、H₂、2–4 h
 *   ⑥ 成品              Rh 99.9–99.99 %、sponge；收率 10/12 = **83.3 %**
 *
 *   收率拆开：碱熔/浸出 95 %（12 → 11.4 kg）→ 沉淀 97.4 %（11.4 → 11.1 kg）
 *   → 还原 90 %（11.1 → 10 kg）= **83.3 %**，落在 70–90 % 窗口内。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 2. 每 kg Rh 的酸/碱消耗（设计值）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   按 1000 kg 精矿 / 12 kg Rh 折算：
 *
 *     98 % H₂SO₄   400 kg / 12 = **33.3 kg/kg Rh**（392 kg 纯酸 ⇒ 32.7）
 *     45 % NaOH    300 kg / 12 = **25.0 kg/kg Rh**（135 kg NaOH ⇒ 11.3）
 *     32 % HCl     800 kg / 12 = **66.7 kg/kg Rh**（256 kg HCl ⇒ 21.3）
 *     Cl₂          100 kg / 12 = **8.3 kg/kg Rh**
 *     NH₄Cl        100 kg / 12 = **8.3 kg/kg Rh**
 *     H₂           5 kg / 12  = **0.42 kg/kg Rh**
 *
 *   这些是**投料量**，不是净消耗：母液里的 NH₄Cl/HCl 可以循环，但本层没有
 *   回收路线，按一次性投料记（`unbalanced_zh` 里点明）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 3. 为什么不是 Na₃Rh(NO₂)₆
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   任务给了两条选择性沉淀：`(NH₄)₃RhCl₆` 或 `Na₃Rh(NO₂)₆`。本文件选
 *   **铵盐**：Na₃Rh(NO₂)₆ 要 **NaNO₂**（`mat/sodium-nitrite` 全表 0 条，
 *   见 `cmp-slurry.ts`），而 NH₄Cl 有本地路线（`make/soda-ash` 的副产）。
 *   代价是铵盐的溶解度对酸度敏感，沉淀窗口窄（pH 1–2、20–60 °C）；
 *   硝基配合物更稳，但本层没有亚硝酸钠，写它就是编。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 4. 与 Pt-Rh 网的关系
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `pgm-products.ts` 的 `mat/pt-rh-gauze` 两条路线 `uses` 不变（同一个
 *   `mat/rhodium` id）。Rh 现在有本地路线，Pt-Rh 网应回到严格闭包；
 *   Cs/Sb/PMT 仍在外（无矿、一次性输入，不属本文件）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 5. 已知缺口（R7：按量级记，不作终止条件）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **没有 Rh 的化验**：纯度 99.9–99.99 % 是工艺保证；本层没有 Rh 标液/
 *      火试金/ICP-MS 固体消解路线，`gives` 的窗口不是读数。
 *   ② **没有 Ir 的分离**：熔块里 Ir 5 kg/1000 kg 精矿，本路线不回收；
 *      Ir 进 `mat/tailings`。Ir 的下游本层也没有。
 *   ③ **没有母液循环**：沉淀母液 3060 kg 里的 NH₄Cl/HCl 不回收，按不平衡声明。
 *   ④ **没有熔盐腐蚀数据**：600–800 °C 的 NaOH/NaHSO₄ 熔体对坩埚的侵蚀
 *      只有定性估计（石墨/刚玉），没有失重曲线。
 *   ⑤ **真实厂吃氯化渣、本模型吃精矿**：`mat/tailings` 是通用条目，标识不了
 *      PGM 渣；两条 OR 路线不判资源竞争。这是模型的一处简化，不是工艺选择。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目：三个中间体 + 七个零件 + 一条线
// ═══════════════════════════════════════════════════════════════════════════

export const RHODIUM_ITEMS: readonly Item[] = [
  /**
   * 碱熔块。精矿 1000 + NaOH 300 + H₂SO₄ 400 在 600–800 °C 熔成的块，
   * 含 Rh 12 kg（0.86 %）与 Pt/Pd/Au/Ag、贱金属硫酸盐。
   *
   * 它不是"矿"，是**把 Rh 从难溶金属相转成可溶盐**的中间体；水浸/酸浸
   * 之后 Rh 进液，Pt/Pd/Au/Ag 留在渣里（回到 Pt/Pd 线）。
   */
  { id: 'mat/rh-fusion-cake', name: 'Alkali Fusion Cake', name_zh: '碱熔块', unit: 'kg', category: 'material' },

  /**
   * Rh 氯化液。**Rh 3.7–3.9 g/L，以 RhCl₆³⁻ 存在。**
   *
   * 3000 kg 液里 11.4 kg Rh（12 kg 的 95 %）；其余是 NaCl/Na₂SO₄/HCl 与
   * 少量 Pt/Pd。它在 20–60 °C 加 NH₄Cl 沉淀 (NH₄)₃RhCl₆。
   */
  {
    id: 'mat/rh-chloride-solution',
    name: 'Rh Chloride Solution', name_zh: 'Rh 氯化液',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'rh', kind: 'range', min: 1, max: 10, unit: 'g/L', dir: 'atLeast' }],
  },

  /**
   * 氯铑酸铵（(NH₄)₃RhCl₆）。**Rh 27.8 %（化学计量），purity 98–99.5 %。**
   *
   * 40 kg 盐含 11.1 kg Rh（11.4 kg 的 97.4 %）；700–900 °C H₂ 还原得海绵 Rh。
   */
  {
    id: 'mat/ammonium-rhodium-chloride',
    name: 'Ammonium Chlororhodate', name_zh: '氯铑酸铵',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 90, max: 100, unit: '%', dir: 'atLeast' }],
  },

  // ═══ 七个零件 ═══

  /** 碱熔炉。600–800 °C、石墨/刚玉坩埚、NaOH/NaHSO₄ 熔体。 */
  { id: 'plant/rh-refinery/fusion-furnace', name: 'Rhodium Refining Alkali Fusion Furnace', name_zh: '铑精炼碱熔炉', unit: '件', category: 'part' },

  /** 浸出槽。80–100 °C、32 % HCl + Cl₂、100–300 kPa、PTFE 衬里。 */
  { id: 'plant/rh-refinery/leach-tank', name: 'Rhodium Refining Leaching Tank', name_zh: '铑精炼浸出槽', unit: '件', category: 'part' },

  /** 氯化柱。Cl₂ 分布器 + 填料，RhCl₆³⁻ 在此形成；与浸出槽串联。 */
  { id: 'plant/rh-refinery/chlorination-column', name: 'Rhodium Refining Chlorination Column', name_zh: '铑精炼氯化柱', unit: '件', category: 'part' },

  /** 沉淀槽。20–60 °C、NH₄Cl 加料、慢搅 4–6 h；316L + PTFE。 */
  { id: 'plant/rh-refinery/precipitator', name: 'Rhodium Refining Precipitation Tank', name_zh: '铑精炼沉淀槽', unit: '件', category: 'part' },

  /** 还原炉。700–900 °C、H₂、石英管/刚玉坩埚；把铵盐还原成海绵 Rh。 */
  { id: 'plant/rh-refinery/reduction-furnace', name: 'Rhodium Refining Reduction Furnace', name_zh: '铑精炼还原炉', unit: '件', category: 'part' },

  /** 碱洗塔。NaOH 循环吸收 Cl₂/HCl/SO₂；PTFE 填料 + 316L 塔体。 */
  { id: 'plant/rh-refinery/scrubber', name: 'Rhodium Refining Alkali Wash Tower', name_zh: '铑精炼碱洗塔', unit: '件', category: 'part' },

  /** 机架与管路。型材焊接 + 法兰 + 耐酸垫。 */
  { id: 'plant/rh-refinery/frame', name: 'Rhodium Refining Frame and Piping', name_zh: '铑精炼机架与管路', unit: '件', category: 'part' },
];

/**
 * 铑精炼线（`plant/rh-refinery`）。**20–900 °C、100–500 kPa、O₂ 0–50 ppm。**
 *
 * 这条线把六步放在一起：碱熔炉（600–800）、浸出槽（80–100）、氯化柱
 * （60–100）、沉淀槽（20–60）、还原炉（700–900）。`holds` 是各工位的
 * **并集**，不是单台炉子的窗口；每个工位在自己的步骤里另有窄窗口。
 */
export const RHODIUM_REFINERY: Item = {
  id: 'plant/rh-refinery',
  name: 'Rhodium Refining Plant', name_zh: '铑精炼装置',
  unit: '套',
  category: 'machine',
  holds: [
    { param: 'temperature', min: 20, max: 900 },
    { param: 'pressure', min: 100, max: 500 },
    { param: 'oxygen_ppm', min: 0, max: 50 },
  ],
  composedOf: [
    ...RHODIUM_ITEMS.filter((i) => i.category === 'part').map((p) => ({ item: p.id, qty: q(1) })),
    { item: 'std/motor-7.5kw-4p', qty: q(1) },
    { item: 'std/contactor-general', qty: q(1) },
    { item: 'std/process-controller-general', qty: q(1) },
  ],
};

/** 中间体 + 零件 + 整线；`mat/rhodium` 本身在 `pgm-products.ts` 已声明，不重复。 */
export const RHODIUM_ALL_ITEMS: readonly Item[] = [...RHODIUM_ITEMS, RHODIUM_REFINERY];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线：四步工艺 + 七个零件
// ═══════════════════════════════════════════════════════════════════════════

export const RHODIUM_ROUTES: readonly Route[] = [
  /**
   * ① 碱熔/硫酸氢钠熔融：精矿 1000 + 45 % NaOH 300 + 98 % H₂SO₄ 400
   *    → 熔块 1400 + SO₂ 80 + CO₂ 20 + 水 200。
   *
   *    600–800 °C、2–4 h。NaOH 与 H₂SO₄ 现场生成 NaHSO₄/Na₂SO₄；
   *    熔体把 Rh 金属相转成可溶的 RhO₄²⁻/硫酸盐。S 40 kg → SO₂ 80，
   *    碳 5 kg → CO₂ 20，酸/碱带入的水 200 蒸发/冷凝。
   *
   *    每 kg Rh：98 % H₂SO₄ 33.3 kg、45 % NaOH 25.0 kg（见文件头 §2）。
   */
  {
    id: 'make/rh-fusion-cake',
    name: 'Alkali Fusion Cake Production', name_zh: '碱熔块制备',
    rate: { hours: q(24) },
    produces: [
      { item: 'mat/rh-fusion-cake', qty: q(1400) },
      { item: 'mat/so2', qty: q(80) },
      { item: 'mat/co2', qty: q(20) },
      {
        item: 'mat/water',
        qty: q(200),
        gives: [{ param: 'conductivity', kind: 'range', min: 500, max: 1000 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/pgm-concentrate', qty: q(1000) }] },
      {
        anyOf: [
          {
            item: 'mat/naoh',
            qty: q(300),
            need: [{ param: 'concentration', kind: 'range', min: 40, max: 50 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/sulfuric-acid',
            qty: q(400),
            need: [{ param: 'concentration', kind: 'range', min: 96, max: 98 }],
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: [],
    steps: [
      { note_zh: '配料/球磨：精矿 1000 + 45 % NaOH 300 + 98 % H₂SO₄ 400，混到 200 目以下', performedBy: 'plant/robot' },
      {
        note_zh: '碱熔 600–800 °C、2–4 h：NaHSO₄/Na₂SO₄ 熔体把 Rh 金属相转成可溶硫酸盐/铑酸盐；石墨/刚玉坩埚',
        performedBy: 'plant/rh-refinery',
        under: [{ param: 'temperature', min: 600, max: 800 }],
      },
      { note_zh: '出炉水淬/破碎到 ≤2 mm；熔块 1400 kg（Rh 12 kg）', performedBy: 'plant/robot' },
    ],
  },

  /**
   * ②③ 水浸/酸浸 + 氯化：熔块 1400 + 32 % HCl 800 + Cl₂ 100 + 水 1000
   *    → 氯化液 3000（Rh 3.8 g/L）+ 渣 300。
   *
   *    80–100 °C、100–300 kPa。Cl₂ 把 Rh(III) 稳定在 RhCl₆³⁻；Pt/Pd/Au/Ag
   *    留在渣里（回到 Pt/Pd 线，本文件不处理）。Rh 浸出率 95 %（12 → 11.4 kg）。
   *
   *    每 kg Rh：32 % HCl 66.7 kg、Cl₂ 8.3 kg。
   */
  {
    id: 'make/rh-chloride-solution',
    name: 'Rh Chloride Solution Production', name_zh: 'Rh 氯化液制备',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'mat/rh-chloride-solution',
        qty: q(3000),
        gives: [{ param: 'rh', kind: 'range', min: 3.7, max: 3.9 }],
      },
      { item: 'mat/tailings', qty: q(300) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/rh-fusion-cake', qty: q(1400) }] },
      {
        anyOf: [
          {
            item: 'mat/hcl',
            qty: q(800),
            need: [{ param: 'concentration', kind: 'range', min: 30, max: 33 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/chlorine', qty: q(100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1000) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '酸浸 80–100 °C、100–300 kPa、2 h：Rh 进液，Pt/Pd/Au/Ag 与 Ir 留渣',
        performedBy: 'plant/rh-refinery',
        under: [
          { param: 'temperature', min: 80, max: 100 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh: '氯化 60–100 °C：通 Cl₂ 100 kg，Rh(III) → RhCl₆³⁻；游离 HCl 保持 2–4 mol/L',
        performedBy: 'plant/rh-refinery',
        under: [
          { param: 'temperature', min: 60, max: 100 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      { note_zh: '压滤：氯化液 3000 kg（Rh 3.8 g/L）+ 渣 300 kg（Rh 0.6 kg，未回收）', performedBy: 'plant/robot' },
    ],
  },

  /**
   * ④ 选择性沉淀：氯化液 3000 + NH₄Cl 100 → (NH₄)₃RhCl₆ 40 kg。
   *
   *    20–60 °C、4–6 h。Rh 11.4 kg 的 97.4 % 进盐（11.1 kg）；母液 3060 kg
   *    含 0.3 kg Rh 与过量 NH₄Cl/HCl，按不平衡声明。
   *
   *    每 kg Rh：NH₄Cl 8.3 kg。
   */
  {
    id: 'make/ammonium-rhodium-chloride',
    name: 'Ammonium Chlororhodate Production', name_zh: '氯铑酸铵制备',
    rate: { hours: q(16) },
    produces: [
      {
        item: 'mat/ammonium-rhodium-chloride',
        qty: q(40),
        gives: [{ param: 'purity', kind: 'range', min: 98, max: 99.5 }],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/rh-chloride-solution',
            qty: q(3000),
            need: [{ param: 'rh', kind: 'range', min: 3.7, max: 3.9, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/ammonium-chloride',
            qty: q(100),
            need: [{ param: 'purity', kind: 'range', min: 95, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: [],
    steps: [
      {
        note_zh: '加 NH₄Cl 100 kg、20–60 °C、慢搅 4–6 h：RhCl₆³⁻ + 3 NH₄⁺ → (NH₄)₃RhCl₆↓；pH 1–2',
        performedBy: 'plant/rh-refinery',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      { note_zh: '压滤/洗涤：盐 40 kg（Rh 11.1 kg）；母液 3060 kg 含 0.3 kg Rh，未回收', performedBy: 'plant/robot' },
      { note_zh: '80–100 °C 干燥到水 ≤1 %；盐纯度 98–99.5 %（设计值，没有 Rh 化验）', performedBy: 'plant/rh-refinery', under: [{ param: 'temperature', min: 80, max: 100 }] },
    ],
    unbalanced_zh:
      '氯化液 3000 + NH₄Cl 100 → 盐 40；余 3060 是母液（含 Rh 0.3 kg、过量 NH₄Cl/HCl 与 NaCl/Na₂SO₄），本链未建回收',
  },

  /**
   * ⑤⑥ 还原：盐 40 + H₂ 5 → Rh 10 + NH₄Cl 17 + HCl 12 + 尾渣 1。
   *
   *    700–900 °C、H₂、2–4 h。Rh 11.1 kg 的 90 % = 10 kg；收率 10/12 = 83.3 %。
   *    NH₄Cl 与 HCl 回流程（两条都有条目），所以这一步的质量账能核；
   *    余 5 kg 是过量 H₂ 与尾渣。
   */
  {
    id: 'make/rhodium',
    name: 'Rhodium Production', name_zh: '铑制备',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'mat/rhodium',
        qty: q(10),
        gives: [
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99 },
          { param: 'form', kind: 'enum', oneOf: ['sponge'] },
        ],
      },
      {
        item: 'mat/ammonium-chloride',
        qty: q(17),
        gives: [{ param: 'purity', kind: 'range', min: 95, max: 98 }],
      },
      {
        item: 'mat/hcl',
        qty: q(12),
        gives: [{ param: 'concentration', kind: 'range', min: 30, max: 33 }],
      },
      { item: 'mat/tailings', qty: q(1) },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/ammonium-rhodium-chloride',
            qty: q(40),
            need: [{ param: 'purity', kind: 'range', min: 98, max: 99.5 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/hydrogen',
            qty: q(5),
            need: [{ param: 'purity', kind: 'range', min: 99, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: [],
    steps: [
      {
        note_zh: 'H₂ 还原 700–900 °C、2–4 h：2 (NH₄)₃RhCl₆ + 3 H₂ → 2 Rh + 6 NH₄Cl + 6 HCl；石英管/刚玉坩埚',
        performedBy: 'plant/rh-refinery',
        under: [
          { param: 'temperature', min: 700, max: 900 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      { note_zh: '冷却/钝化：H₂ 切到 Ar，降到 60 °C 以下再开炉（热海绵 Rh 遇空气会氧化）', performedBy: 'plant/robot' },
      { note_zh: '成品：Rh 10 kg、99.9–99.99 %、sponge；收率 83.3 %（12 kg 进料）；没有 Rh 标液/火试金', performedBy: 'plant/metrology-room' },
    ],
    unbalanced_zh:
      '盐 40 + H₂ 5 → Rh 10 + NH₄Cl 17 + HCl 12 + 尾渣 1；余 5 是过量 H₂ 与尾渣（H₂ 不进入产品）',
  },

  // ═══ 七个零件路线 ═══

  /** 碱熔炉：耐火料 300 + 45 钢 300 + 碳 100 + 电阻丝 30 → 1 件。 */
  {
    id: 'make/rh-fusion-furnace',
    name: 'Rhodium Refining Alkali Fusion Furnace Manufacturing', name_zh: '铑精炼碱熔炉制造',
    rate: { hours: q(32) },
    produces: [{ item: 'plant/rh-refinery/fusion-furnace', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/refractory', qty: q(300) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(300) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(100) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(30) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '焊 45 钢炉壳；砌刚玉/高铝耐火料 300 kg + 石墨坩埚 100 kg', performedBy: 'plant/sheet-shop' },
      { note_zh: '绕电阻丝 30 kg、装炉盖与排气；600–800 °C 空炉 4 h', performedBy: 'lathe' },
      { note_zh: '装倾炉/坩埚夹持；熔体不接触钢壳', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '耐火料 300 + 45 钢 300 + 碳 100 + 电阻丝 30 → 碱熔炉 1 件；按件计',
  },

  /** 浸出槽：316L 500 + PTFE 40 + 45 钢 50 → 1 件。 */
  {
    id: 'make/rh-leach-tank',
    name: 'Rhodium Refining Leaching Tank Manufacturing', name_zh: '铑精炼浸出槽制造',
    rate: { hours: q(24) },
    produces: [{ item: 'plant/rh-refinery/leach-tank', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(500) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(40) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(50) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '卷焊 316L 槽体 + 夹套；开 Cl₂ 入口与测温口', performedBy: 'plant/sheet-shop' },
      { note_zh: '车法兰/搅拌轴孔；衬 PTFE 40 kg', performedBy: 'lathe' },
      { note_zh: '装搅拌/分布器；0.5 MPa 水压 30 min', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '316L 500 + PTFE 40 + 45 钢 50 → 浸出槽 1 件；按件计',
  },

  /** 氯化柱：316L 200 + PTFE 60 + 玻璃 20 → 1 件。 */
  {
    id: 'make/rh-chlorination-column',
    name: 'Rhodium Refining Chlorination Column Manufacturing', name_zh: '铑精炼氯化柱制造',
    rate: { hours: q(20) },
    produces: [{ item: 'plant/rh-refinery/chlorination-column', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(200) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(60) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(20) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '卷焊柱体 + 气体分布器；玻璃视镜 20 kg', performedBy: 'plant/sheet-shop' },
      { note_zh: '装 PTFE 填料 60 kg、液体分布器；0.3 MPa 气密', performedBy: 'lathe' },
      { note_zh: '接 Cl₂ 管路与尾气到碱洗塔', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '316L 200 + PTFE 60 + 玻璃 20 → 氯化柱 1 件；按件计',
  },

  /** 沉淀槽：316L 400 + PTFE 30 + 45 钢 30 → 1 件。 */
  {
    id: 'make/rh-precipitator',
    name: 'Rhodium Refining Precipitation Tank Manufacturing', name_zh: '铑精炼沉淀槽制造',
    rate: { hours: q(20) },
    produces: [{ item: 'plant/rh-refinery/precipitator', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(400) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(30) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(30) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '卷焊槽体 + NH₄Cl 加料漏斗；内壁抛光', performedBy: 'plant/sheet-shop' },
      { note_zh: '车搅拌轴/桨，配减速机；衬 PTFE 30 kg', performedBy: 'lathe' },
      { note_zh: '装慢速搅拌 10–30 rpm；0.3 MPa 气密', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '316L 400 + PTFE 30 + 45 钢 30 → 沉淀槽 1 件；按件计',
  },

  /** 还原炉：316L 150 + 耐火料 100 + 电阻丝 15 + 石英 15 → 1 件。 */
  {
    id: 'make/rh-reduction-furnace',
    name: 'Rhodium Refining Reduction Furnace Manufacturing', name_zh: '铑精炼还原炉制造',
    rate: { hours: q(24) },
    produces: [{ item: 'plant/rh-refinery/reduction-furnace', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(150) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(100) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(15) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(15) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '焊 316L 外壳 + 水冷法兰；砌耐火料 100 kg', performedBy: 'plant/sheet-shop' },
      { note_zh: '装石英炉管 15 kg、电阻丝 15 kg、H₂ 入口与尾气', performedBy: 'lathe' },
      { note_zh: '空炉 900 °C、H₂ 气氛 4 h；露点 ≤−40 °C', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '316L 150 + 耐火料 100 + 电阻丝 15 + 石英 15 → 还原炉 1 件；按件计',
  },

  /** 碱洗塔：316L 150 + PTFE 40 + 玻璃纤维 10 → 1 件。 */
  {
    id: 'make/rh-scrubber',
    name: 'Rhodium Refining Alkali Wash Tower Manufacturing', name_zh: '铑精炼碱洗塔制造',
    rate: { hours: q(16) },
    produces: [{ item: 'plant/rh-refinery/scrubber', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(150) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(40) }] },
      { anyOf: [{ item: 'mat/glass-fiber', qty: q(10) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '卷焊塔体 + 循环槽；开进气/喷淋/除雾器座', performedBy: 'plant/sheet-shop' },
      { note_zh: '装 PTFE 填料 40 kg、玻璃纤维除雾器 10 kg', performedBy: 'lathe' },
      { note_zh: '装循环泵与 NaOH 加药；0.3 MPa 气密', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '316L 150 + PTFE 40 + 玻璃纤维 10 → 碱洗塔 1 件；按件计',
  },

  /** 机架：钢板 200 → 1 件。 */
  {
    id: 'make/rh-frame',
    name: 'Rhodium Refining Frame and Piping Manufacturing', name_zh: '铑精炼机架与管路制造',
    rate: { hours: q(12) },
    produces: [{ item: 'plant/rh-refinery/frame', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(200) }] }],
    needs: [],
    performedBy: 'plant/sheet-shop',
    unbalanced_zh: '钢板 200 → 机架 1 件；按件计',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 接线（主 agent 注册；本文件不动 tools/report/data.ts）
//
//   import { RHODIUM_ALL_ITEMS, RHODIUM_ROUTES } from '../../data/material/rhodium.ts';
//   items:  [...RHODIUM_ALL_ITEMS]
//   routes: [...RHODIUM_ROUTES]
//
// `mat/rhodium` 仍声明在 `data/material/pgm-products.ts`（同一个 id），
// 本文件只加产出路线与中间体/设备；不要重复声明 mat/rhodium。
// ═══════════════════════════════════════════════════════════════════════════

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...RHODIUM_ALL_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/rh-refinery',
    name: 'Rhodium Refining Plant Assembly', name_zh: '铑精炼装置装配',
    produces: [{
      item: 'plant/rh-refinery',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...RHODIUM_ROUTES, ...ASSEMBLY_ROUTES];
