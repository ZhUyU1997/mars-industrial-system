/**
 * 氮与碱，以及玻璃 —— 空气里最不起眼的那 2.6%。
 *
 * 四样东西一条线：
 *
 *   空气 ─→ 氮 ─+H₂→ 氨 ─+CO₂+盐→ 纯碱 ─┐
 *                                         ├→ 玻璃
 *   尾矿 ─→ 硅石 ────────────────────────┤
 *   石膏 ─→ 石灰 ────────────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 氮是空气里最贵的那一样
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 火星大气按体积算 95% 是 CO₂、2.6% 是 N₂。看到"2.6%"会觉得氮很少，
 * 但真正的账在**体积**上：要 1000 kg 氮，得从 57 吨大气里抽出来，
 * 而同样 1000 kg CO₂ 只要 1 吨。
 *
 * 也就是说：**按质量抽，氮比碳贵 57 倍。** 而氨是全程都要氮的 ——
 * 一吨氨里 82% 是氮。所以氨的价格基本上就是"抽氮"的价格。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 氨为什么值一整套高压
 * ═══════════════════════════════════════════════════════════════════════
 *
 * N₂ + 3H₂ → 2NH₃，450 °C、15–30 MPa、铁催化。这是全表第一个"压力比温度
 * 更要紧"的反应：450 °C 的钢到处都是，30 MPa 的钢要厚壁锻件。
 *
 * 而氨在这套体系里的用处，全在它的三样下游：
 *
 *   纯碱   索尔维法要氨（NaCl + NH₃ + CO₂ + H₂O → NaHCO₃ + NH₄Cl）
 *   玻璃   钠钙玻璃要纯碱（SiO₂ + Na₂CO₃ + CaO → 玻璃）
 *   硝酸   氨氧化（Ostwald），本链未建 —— 硝化、蚀刻、化肥都等它
 *
 * 所以氨不是"化肥原料"，是**碱与玻璃的钥匙**。没有它，火星连一块窗玻璃
 * 都造不出来 —— 前面十几轮里所有"玻璃器皿"的空缺，根子在这里。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 玻璃：一块窗玻璃背后的三条链
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 钠钙玻璃 72% SiO₂ + 13% Na₂O + 11% CaO + 4% 其他。三种料来自三条不相干的链：
 *
 *   SiO₂   尾矿富集（45% → 90%）
 *   Na₂O   纯碱（← 氨 ← 氮 + 氢）
 *   CaO    石灰（石膏热分解的副产）
 *
 * 它是本表里"跨链合成"最明显的一件：三条链少一条，玻璃就出不来。
 * 而它同时是本层唯一能造出**透明容器**的东西 —— 之前所有器皿都是不锈钢的。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ALKALI_ITEMS: readonly Item[] = [
  /**
   * 氮。从分离 CO₂ 之后的氮氩混合气里提出来。
   *
   * 按质量抽，它比碳贵 57 倍（大气里只占 2.6% 体积）—— 这是全表最反直觉的
   * 一条"贵"，因为它看起来到处都是。
   */
  { id: 'mat/nitrogen', name: '氮', unit: 'kg', category: 'material' },

  /** 氨。哈伯法。整套体系的碱与玻璃都等它。 */
  { id: 'mat/ammonia', name: '氨', unit: 'kg', category: 'material',
    props: [{ param: 'concentration', kind: 'range', min: 15, max: 99.5, unit: '%' }] },

  /** 纯碱（Na₂CO₃）。索尔维法，要氨。玻璃的助熔剂、水玻璃的原料。 */
  { id: 'mat/soda-ash', name: '纯碱', unit: 'kg', category: 'material' },

  /** 玻璃。钠钙玻璃，1400–1500 °C 熔成。本层唯一的透明材料。 */
  { id: 'mat/glass', name: '玻璃', unit: 'kg', category: 'material',
    // 钠钙 / 硼硅 / 熔石英的热冲击差 16 倍（σ 65 vs 4 MPa）—— 这个属性不写，就会拿它做视镜。
    props: [{ param: 'type', kind: 'enum', values: ['soda-lime', 'borosilicate', 'fused-silica'] }, { param: 'alpha', kind: 'range', min: 0.4, max: 9, unit: '1e-6/K' }] },

  /**
   * 氩气。空气里 0.93%，靠低温精馏与氮一起出来（氮 -196 / 氩 -186 / 氧 -183）。
   *
   * 它在这层只有一个用处：**保护硅熔体**。直拉单晶时炉内要通氩 —— 氮不行，
   * 1420 °C 下氮会跟硅反应生成氮化硅，把坩埚和晶体一起毁掉。
   */
  { id: 'mat/argon', name: '氩气', unit: 'kg', category: 'material' },
];

export const ALKALI_ROUTES: readonly Route[] = [
  {
    /**
     * 提氮与提氩：氮氩混合气 2050 → 氮 1000 + 氩 1050。
     *
     * 混合气里氮与氩按体积 2.6 : 1.9，按质量 49 : 51，所以一半是氩。
     *
     * **氩以前是放空的**（注释写着"留作保护气，本链未建条目"）。现在建了：
     * 直拉单晶要用氩。于是这一步从"产氮、扔氩"变成"两样都产" ——
     * 这本来就是低温精馏的样子。
     *
     * ⚠️ 2050 kg 混合气要 5.7 万公斤大气才够 —— 抽气量的账全在这里。
     */
    id: 'make/nitrogen',
    name: '提氮与提氩制备',
    produces: [
      { item: 'mat/nitrogen', qty: q(1000) },
      { item: 'mat/argon', qty: q(1050) },
    ],
    uses: [{ anyOf: [{ item: 'mat/inert-gas', qty: q(2050) }] }],
    needs: [],
    performedBy: 'plant/air-separator',
  },
  {
    /**
     * 哈伯法：N₂ + 3H₂ → 2NH₃，450 °C、15–30 MPa，铁催化。
     *
     *   822 氮 + 178 氢 → 1000 氨
     *
     * 单程转化率只有 15–25%，未反应的氣要循环 —— 而循环气里氩会越积越多，
     * 所以还得有一股放空。数据里没有"循环"这个维度，只能记在注释里。
     */
    id: 'make/ammonia',
    name: '哈伯法制备',
    produces: [{ item: 'mat/ammonia', qty: q(1000), gives: [{ param: 'concentration', kind: 'range', min: 25, max: 30 }] }],
    uses: [
      { anyOf: [{ item: 'mat/nitrogen', qty: q(822) }] },
      {
        anyOf: [
          {
            item: 'mat/hydrogen',
            qty: q(178),
            need: [{ param: 'purity', kind: 'range', min: 99.5, max: 100, dir: 'atLeast' }],
            onRelax: 'functional-lost',
          },
        ],
      },
    ],
    needs: [],
    performedBy: 'plant/autoclave',
    under: [
      { param: 'temperature', min: 400, max: 500 },
      { param: 'pressure', min: 15000, max: 30000 },
    ],
  },
  {
    /**
     * 索尔维法：2NaCl + 2NH₃ + CO₂ + H₂O → Na₂CO₃ + 2NH₄Cl。
     *
     *   1103 盐 + 321 氨 + 415 二氧化碳 + 170 水 → 1000 纯碱（并出 1009 氯化铵）
     *
     * 实际是两步：先碳酸化析出小苏打，再煅烧成纯碱。氨在过程里循环
     * （用石灰回收），所以它是载体不是原料 —— 但本链把它按投料记，
     * 因为回收那一步（蒸氨）没建。
     *
     * 氯化铵是氮肥，火星上用不上（没有农业），所以没有条目 —— 它随母液走。
     */
    id: 'make/soda-ash',
    name: '索尔维法制备',
    produces: [
      { item: 'mat/soda-ash', qty: q(1000) },
      // 副产 1009 kg 氯化铵 —— 以前只写在 unbalanced_zh 里，现在进物料流：
      // make/ammonia-recovery 把它变回氨，纯碱链从此自己闭合。
      { item: 'mat/ammonium-chloride', qty: q(1009), gives: [{ param: 'purity', kind: 'range', min: 95 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/salt', qty: q(1103) }] },
      { anyOf: [{ item: 'mat/ammonia', qty: q(321) }] },
      { anyOf: [{ item: 'mat/co2', qty: q(415) }] },
      { anyOf: [{ item: 'mat/water', qty: q(170) }] },
    ],
    needs: [],
    performedBy: 'plant/acid-plant',
    under: [
      { param: 'temperature', min: 30, max: 45 },
      // 索尔维法全程在溶液里：盐水、氨化、碳酸化、结晶。
      { param: 'pressure', min: 100, max: 500 },
    ],
    unbalanced_zh: '盐 1103 + 氨 321 + 二氧化碳 415 + 水 170 → 1000 纯碱；余 1009 是氯化铵，本链未登条目',
  },
  {
    /**
     * 玻璃：SiO₂ 761 + 纯碱 220 + 石灰 110 → 1000 玻璃，1400–1500 °C。
     *
     * 纯碱分解出 Na₂O（128）与 CO₂（91），所以出炉时冒气泡 —— 玻璃的
     * "澄清"就是让这些气泡跑干净。
     *
     * 三条链各出一半料：硅石来自尾矿、纯碱来自氨与盐、石灰来自石膏。
     * **玻璃是本表第一件"三条不相干的链缺一条就出不来"的东西。**
     */
    id: 'make/glass',
    name: '玻璃制备',
    produces: [
      { item: 'mat/glass', qty: q(1000), gives: [{ param: 'type', kind: 'enum', oneOf: ['soda-lime', 'borosilicate', 'fused-silica'] }, { param: 'alpha', kind: 'range', min: 0.4, max: 9 }] },
      { item: 'mat/co2', qty: q(91) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silica', qty: q(761) }] },
      { anyOf: [{ item: 'mat/soda-ash', qty: q(220) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(110) }] },
    ],
    needs: ['plant/radiator'],
    performedBy: 'plant/kiln',
    under: [{ param: 'temperature', min: 1400, max: 1500 }],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ALKALI_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...ALKALI_ROUTES];
