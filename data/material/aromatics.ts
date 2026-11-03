/**
 * C2 与芳烃 —— 从乙炔到苯酚，再到碳素粘结剂。
 *
 * 这一层补的是矿热炉电极曾经缺的粘结剂；`std/carbon-electrode-300` 已有路线，
 * 电极不再是 `deferred`。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 电极缺的不是温度，是粘结剂
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 上一轮把电极标成未定义，理由是"石墨电极要石油焦与煤沥青"。那句话只对一半：
 *
 *   石墨电极   要 3000 °C 石墨化 —— 本层没有那样的炉子，这条确实走不通
 *   碳电极     只要 1100–1300 °C 焙烧 —— 高温窑够用 ✓
 *
 * 矿热炉并不挑石墨：预焙阳极（铝电解用的那种）就是碳电极，电阻大些、
 * 允许的电流密度低些，炉子做粗一点就行。所以真正缺的只有一样：
 *
 *   **粘结剂。** 把 Bosch 出的碳粉粘成一根棒，靠的是沥青或树脂。
 *   煤沥青要煤或石油，火星两样都没有；水玻璃能粘，但硅会进钢里。
 *   剩下的只有酚醛树脂 —— 而它要苯酚。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 于是这条链必须走到 C6
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   甲烷 ─(1500–1800 °C)→ 乙炔 ─(3 聚)→ 苯
 *   苯 ─+Cl₂→ 氯苯 ─+石灰水解→ 苯酚 ─+甲醛→ 酚醛树脂
 *
 * 四步里每一步都是老工艺：乙炔是烃类高温裂解的老祖宗（电弧炉造乙炔，
 * 二十世纪中叶的化工厂标配）；乙炔常压环化成苯是芳烃唯一的非油路线；
 * 氯苯加石灰水解制苯酚就是最早的 Dow 法（后来才换成苯磺酸钠熔融）。
 *
 * ⚠️ 苯酚水解要 300–400 °C、几十个大气压，而**本层没有高压釜** ——
 * 借 Bosch 反应器的承压壳（它本来就跑在几 MPa 的氢气里）。这是一处
 * 真实的器具缺口，不是数据偷懒：成套的高压单元操作列在 D 类里
 * 有，数据里还没有。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 副产氯化钙
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 氯苯水解每吨苯酚出 590 kg 氯化钙。它是有用的东西（镁水泥的原料之一，
 * 而火星没有石灰石，镁水泥是主要建材路线），但本链没有
 * 建条目，所以按不平衡声明 —— 记账，不假装它不存在。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const AROMATIC_ITEMS: readonly Item[] = [
  /**
   * 乙炔（C₂H₂）。甲烷在 1500 °C 以上裂解，停留几毫秒就急冷。
   *
   * **它是火星上唯一的 C2 入口。** 没有乙醇、没有乙烯、没有石油，
   * 二碳以上的有机骨架只能从乙炔起 —— 它是"第二个碳"的出生证明。
   */
  { id: 'mat/acetylene', name: 'Acetylene', name_zh: '乙炔', unit: 'kg', category: 'material' },

  /**
   * 苯（C₆H₆）。三个乙炔分子环化而成，放热，要控温。
   *
   * **它是唯一的芳烃入口。** 没有油，苯只能从
   * 乙炔环化来 —— 这是全表最短的一条芳烃路线，也是唯一的一条。
   */
  { id: 'mat/benzene', name: 'Benzene', name_zh: '苯', unit: 'kg', category: 'material' },

  /** 氯苯（C₆H₅Cl）。苯上一个氢被氯换掉。苯酚的中间体，也是氯的第三个落点。 */
  { id: 'mat/chlorobenzene', name: 'Chlorobenzene', name_zh: '氯苯', unit: 'kg', category: 'material' },

  /**
   * 苯酚（C₆H₅OH）。氯苯加石灰水解，300–400 °C、高压。
   *
   * 它是酚醛树脂的一半，也是这条链走到这里的全部理由 —— 苯酚在火星上
   * 不是"化工原料"，是**粘结剂的原料**。
   */
  { id: 'mat/phenol', name: 'Phenol', name_zh: '苯酚', unit: 'kg', category: 'material' },

  /**
   * 酚醛树脂。苯酚与甲醛缩聚，90–100 °C，酸或碱催化。
   *
   * 它是碳素粘结剂：混进碳粉里压成电极，焙烧时树脂碳化，把碳粉焊成一体。
   * 碳化收率约 50%，所以 20% 的树脂在成品里只剩 10% 的碳。
   */
  { id: 'mat/phenolic-resin', name: 'Phenolic Resin', name_zh: '酚醛树脂', unit: 'kg', category: 'material' },
];

export const AROMATIC_ROUTES: readonly Route[] = [
  {
    /**
     * 甲烷裂解制乙炔：2CH₄ → C₂H₂ + 3H₂，1500–1800 °C。
     *
     *   1232 甲烷 → 1000 乙炔 + 232 氢
     *
     * 强吸热（+377 kJ/mol），所以要电弧或等离子体级别的热源。矿热炉
     * 正好是全区唯一能持续跑在 1500 °C 以上的设备 —— 它熔铬铁，也裂解甲烷。
     * 停留时间必须在毫秒级：慢一点乙炔自己就分解成碳和氢了。
     */
    id: 'make/acetylene',
    name: 'Acetylene from Methane Cracking', name_zh: '甲烷裂解制乙炔',
    produces: [
      { item: 'mat/acetylene', qty: q(1000) },
      { item: 'mat/hydrogen', qty: q(232), gives: [{ param: 'purity', kind: 'range', min: 99, max: 99.5, dir: 'atLeast' }] },
    ],
    uses: [{ anyOf: [{ item: 'mat/methane', qty: q(1232) }] }],
    needs: [],
    performedBy: 'plant/submerged-arc-furnace',
    under: [{ param: 'temperature', min: 1500, max: 1700 }],
  },
  {
    /**
     * 乙炔环化成苯：3C₂H₂ → C₆H₆，400–500 °C，催化。
     *
     *   1000 乙炔 → 1000 苯（不多不少：3 × 26.04 = 78.12 = 78.11）
     *
     * 质量一比一，热却是强放热 —— 反应器要能把热带走，否则结焦。
     */
    id: 'make/benzene',
    name: 'Acetylene Cyclization to Benzene Production', name_zh: '乙炔环化成苯制备',
    produces: [{ item: 'mat/benzene', qty: q(1000) }],
    uses: [{ anyOf: [{ item: 'mat/acetylene', qty: q(1000) }] }],
    needs: [],
    performedBy: 'plant/bosch-reactor',
    under: [{ param: 'temperature', min: 400, max: 500 }],
  },
  {
    /**
     * 苯氯化：C₆H₆ + Cl₂ → C₆H₅Cl + HCl，300–400 °C（热氯化）。
     *
     *   694 苯 + 630 氯气 → 1000 氯苯 + 324 盐酸
     *
     * 氯在这里是第三个落点，出口仍然是盐酸 —— 回到 Deacon 法那条环路里。
     */
    id: 'make/chlorobenzene',
    name: 'Chlorobenzene Production', name_zh: '苯氯化制备',
    produces: [
      { item: 'mat/chlorobenzene', qty: q(1000) },
      { item: 'mat/hcl', qty: q(324), gives: [{ param: 'concentration', kind: 'range', min: 30, max: 33 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/benzene', qty: q(694) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(630) }] },
    ],
    needs: [],
    performedBy: 'plant/bosch-reactor',
    under: [{ param: 'temperature', min: 300, max: 400 }],
  },
  {
    /**
     * 氯苯水解（Dow 法）：2C₆H₅Cl + CaO + H₂O → 2C₆H₅OH + CaCl₂，300–400 °C。
     *
     *   1196 氯苯 + 298 石灰 + 96 水 → 1000 苯酚（并出 590 氯化钙）
     *
     * 石灰从石膏分解来（make/so2 的副产），水从冷凝来 —— 两样都是现成的。
     * 氯以氯化钙的形式出去，不再回收：这一处是氯环的**唯一净损失**。
     */
    id: 'make/phenol',
    name: 'Chlorobenzene Hydrolysis', name_zh: '氯苯水解',
    produces: [
      { item: 'mat/phenol', qty: q(1000) },
      // 副产 590 kg 氯化钙 —— 以前只写在 unbalanced_zh 里。它是唯一的钙盐出口，
      // 而钙盐在本层有真用途（气路干燥、混凝土早强）。
      { item: 'mat/calcium-chloride', qty: q(590), gives: [{ param: 'purity', kind: 'range', min: 70 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/chlorobenzene', qty: q(1196) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(298) }] },
      { anyOf: [{ item: 'mat/water', qty: q(96) }] },
    ],
    needs: [],
    performedBy: 'plant/autoclave',
    under: [
      { param: 'temperature', min: 300, max: 400 },
      { param: 'pressure', min: 25000, max: 30000 },
    ],
    unbalanced_zh: '1196 氯苯 + 298 石灰 + 96 水 → 1000 苯酚；余 590 是氯化钙，本链未建条目',
  },
  {
    /**
     * 酚醛缩聚：n C₆H₅OH + n CH₂O → [-C₆H₄-CH₂-]ₙ + n H₂O，90–100 °C，酸催化。
     *
     *   887 苯酚 + 283 甲醛 → 1000 树脂 + 170 水
     *
     * 分子量到几千就够用了：粘结剂不需要高分子量，需要的是**碳化后还剩多少碳**。
     */
    id: 'make/phenolic-resin',
    name: 'Phenolic Polycondensation Production', name_zh: '酚醛缩聚制备',
    produces: [
      { item: 'mat/phenolic-resin', qty: q(1000) },
      { item: 'mat/water', qty: q(170), gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/phenol', qty: q(887) }] },
      { anyOf: [{ item: 'mat/formaldehyde', qty: q(283) }] },
    ],
    needs: [],
    performedBy: 'plant/polymer-plant',
    under: [{ param: 'temperature', min: 90, max: 100 }],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...AROMATIC_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...AROMATIC_ROUTES];
