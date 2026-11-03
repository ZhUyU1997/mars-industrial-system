/**
 * 试剂 —— 单质硫、碱、氯、碘、溶剂与浮选药剂。
 *
 * 这一层只做一件事：**把浮选药剂从"一整层有机化学"缩到"一种 C5–C8 醇"。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 浮选药剂的三种成分，各有各的命
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   捕收剂（黄药）  醇 + 二硫化碳 + 碱 → 黄药。这条路现在通了：
 *                   乙醇从乙炔来（乙炔 → 乙醛 → 乙醇），
 *                   CS₂ 从甲烷加硫来，碱从氯碱来。
 *   起泡剂          要 C5–C8 的醇或酮（松醇油、MIBC）。本层没有 C5 直链醇，
 *                   用丁醇（C4）代：起泡力弱一档、用量要大。这是降级，不是断点；
 *                   缺口从“一整层有机化工”缩成“一种 C5 醇”。
 *   调整剂          石灰。已经有了（石膏分解的副产）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 单质硫：Claus 的替代路线
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 火星的硫全在硫酸盐里，出来是 SO₂。要单质硫，常规办法是 Claus 法
 * （SO₂ + 2H₂S → 3S + 2H₂O），但它要 H₂S —— 而 H₂S 又只能从硫来，绕回去了。
 *
 * 所以这里走直还原：SO₂ + 2H₂ → S + 2H₂O，300–400 °C 催化。
 * 热力学是通的，工业上不常用只是因为地球上硫便宜、不值得用氢换 ——
 * 而火星上恰恰反过来：**硫不缺，氢也不缺，缺的是一条不用有机物的路**。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 氯碱：电解槽的第二份工作
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 2NaCl + 2H₂O → 2NaOH + Cl₂ + H₂，60–90 °C。
 *
 * 它一台设备三样产品，而且三样都有人要：碱去做黄药、氯进 Deacon 环路、
 * 氢回电解水那条线的下游。执行设备就是电解槽 —— 它本来就有隔膜（分开
 * 氯与氢，不然一混合就是爆炸极限）与镀镍电极（耐碱）。
 *
 * 盐从卤水来：饱和食盐水 26%（这是物理常数，不是估的），
 * 1000 kg 卤水出 264 kg 盐 —— `mars/brine` 那个孤岛终于有人用了。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 碘：卤水里的碘离子，氯气氧化
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   2I⁻ + Cl₂ → I₂ + 2Cl⁻
 *
 * 智利硝石的碘是从硝石母液里取的；火星没有硝石，只有卤水（`mars/brine`）。
 * 做法同一类：酸化、通氯、析出碘、升华。碘在卤水里以 I⁻ 计，按 400 ppm
 * 设计 —— 这是**设计值，不是火星实测**：USGS 给智利 caliche 的典型含碘
 * 0.04%（400 ppm），Iofina 的油田卤水 50–2000 ppm；火星卤水的碘品位
 * 没有数据，见本题与 iodine-seed.ts 的缺口①。
 *
 * 亚硝酸钠 0 条目（`cmp-integration.ts:216` 也记着），所以氧化剂只有氯气；
 * 氯从 Deacon/氯碱来，硫酸从湿法/接触法来，两样都在本层。
 *
 * ⚠️ 本层没有 pH 计、也没有氧化还原电位计（`cmp-slurry.ts:369`、
 * `hot-phosphoric-bath.ts:209` 同一条）：酸化的终点与通氯的终点只能看
 * 试纸与颜色。这是操作缺口，不是物料缺口。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const REAGENT_ITEMS: readonly Item[] = [
  /**
   * 单质硫。SO₂ 加氢直还原，300–400 °C。
   *
   * 火星上硫极富裕但全在硫酸盐里，出来都是 SO₂；单质硫是二硫化碳的前体，
   * 而二硫化碳是黄药的另一半。
   */
  { id: 'mat/sulfur', name: 'Elemental Sulfur', name_zh: '单质硫', unit: 'kg', category: 'material' },

  /** 盐。卤水自然蒸发结晶，饱和食盐水 26%。氯碱的原料。 */
  { id: 'mat/salt', name: 'Salt', name_zh: '盐', unit: 'kg', category: 'material' },

  /** 氢氧化钠。氯碱的三分之一。做黄药的碱、调 pH、吸收酸性气体。 */
  { id: 'mat/naoh', name: 'Sodium Hydroxide', name_zh: '氢氧化钠', unit: 'kg', category: 'material',
    props: [{ param: 'concentration', kind: 'range', min: 20, max: 99, unit: '%' }] },

  /** 二硫化碳。甲烷加硫，600–700 °C。黄药的硫从这里来。 */
  { id: 'mat/cs2', name: 'Carbon Disulfide', name_zh: '二硫化碳', unit: 'kg', category: 'material' },

  /** 乙醛。乙炔水合，80–100 °C，汞盐催化。乙醇的前一步。 */
  { id: 'mat/acetaldehyde', name: 'Acetaldehyde', name_zh: '乙醛', unit: 'kg', category: 'material' },

  /** 乙醇。乙醛加氢，100–150 °C。**本层唯一的 C2 醇** —— 黄药的醇从这里来。 */
  { id: 'mat/ethanol', name: 'Ethanol', name_zh: '乙醇', unit: 'kg', category: 'material' },

  /**
   * 黄药（乙基黄原酸钠）。乙醇 + 二硫化碳 + 氢氧化钠，常温。
   *
   * 它是浮选的**捕收剂**：一端亲矿物表面、一端亲水，把有用矿物拽到气泡上。
   * 铜、镍、磷三次富集都靠它。
   */
  { id: 'mat/xanthate', name: 'Xanthate', name_zh: '黄药', unit: 'kg', category: 'material' },

  /**
   * 正丁醇。两分子乙醇缩合（Guerbet 反应），200–250 °C，碱催化。
   *
   * 它是**起泡剂**：让气泡稳定成泡沫层，把捕收剂拽上来的矿物托住。
   * 工业上主力是松醇油与 MIBC（C5–C8），丁醇起泡力弱一档、用量要大 ——
   * 但它是本层唯一能自己造的 C≥4 醇。这是"能用但不是最好"的那一类，
   * 和碳电极同理：不完美，但把断点解开了。
   */
  { id: 'mat/butanol', name: 'n-Butanol', name_zh: '正丁醇', unit: 'kg', category: 'material' },

  /**
   * 硫酸钠。碱加硫酸中和：2NaOH + H₂SO₄ → Na₂SO₄ + 2H₂O。
   *
   * 它自己用处只有一个：电解成过硫酸钠，也就是聚合引发剂。
   */
  { id: 'mat/sodium-sulfate', name: 'Sodium Sulfate', name_zh: '硫酸钠', unit: 'kg', category: 'material' },

  /**
   * 浮选药剂。捕收剂 + 起泡剂按 3 : 1 配。
   *
   * 它自己不是化合物，是**配好的药剂** —— 浮选槽加的是这个，不是黄药。
   * 配比 3 : 1 是常规用量：捕收剂每吨矿几十克，起泡剂更少。
   */
  { id: 'mat/flotation-reagent', name: 'Flotation Reagent', name_zh: '浮选药剂', unit: 'kg', category: 'consumable' },
];

export const REAGENT_ROUTES: readonly Route[] = [
  {
    /**
     * 硫还原：SO₂ + 2H₂ → S + 2H₂O，300–400 °C 催化。
     *
     *   1998 二氧化硫 + 126 氢 → 1000 硫 + 1124 水
     *
     * 地球上不这么干（硫便宜，不值用氢换）；火星上反过来 —— 硫不缺，
     * 缺的是一条不用有机物的路。
     */
    id: 'make/sulfur',
    name: 'Sulfur Reduction', name_zh: '硫还原',
    produces: [
      { item: 'mat/sulfur', qty: q(1000) },
      { item: 'mat/water', qty: q(1124), gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/so2', qty: q(1998) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(126) }] },
    ],
    needs: [],
    performedBy: 'plant/bosch-reactor',
    under: [{ param: 'temperature', min: 300, max: 400 }],
  },
  {
    /**
     * 卤水晒盐：1000 卤水 → 264 盐 + 736 水。
     *
     * 饱和食盐水 26%（物理常数）。不填 `performedBy`：这一条靠火星的低压
     * 与昼夜温差自然蒸发，不需要设备 —— 只需要一块平整的滩。
     *
     * ⚠️ 前提是"卤水是饱和的"。数据里只说"溶解态、已浓缩"，没有品位；
     * 26% 是上限，实际低了就要多晒几遍，账是线性的。
     */
    id: 'make/salt',
    name: 'Brine Solar Salt Production', name_zh: '卤水晒盐制备',
    produces: [
      { item: 'mat/salt', qty: q(264) },
      { item: 'mat/water', qty: q(736), gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }] },
    ],
    uses: [{ anyOf: [{ item: 'mars/brine', qty: q(1000) }] }],
    needs: [],
  },
  {
    /**
     * 氯碱：2NaCl + 2H₂O → 2NaOH + Cl₂ + H₂，60–90 °C。
     *
     *   1000 盐 + 308 水 → 684 碱 + 607 氯气 + 17 氢
     *
     * 一台设备三样产品，三样都有人要。执行设备是电解槽 —— 它本来就有
     * 隔膜（分开氯与氢）与镀镍电极（耐碱），换电解液就换产品。
     */
    id: 'make/naoh',
    name: 'Chlor-Alkali Production', name_zh: '氯碱制备',
    produces: [
      { item: 'mat/naoh', qty: q(684), gives: [{ param: 'concentration', kind: 'range', min: 40, max: 50 }] },
      { item: 'mat/chlorine', qty: q(607) },
      { item: 'mat/hydrogen', qty: q(17), gives: [{ param: 'purity', kind: 'range', min: 99, max: 99.5, dir: 'atLeast' }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/salt', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(308) }] },
    ],
    needs: [],
    performedBy: 'plant/electrolyzer',
    under: [
      { param: 'temperature', min: 60, max: 90 },
      // 盐水电解在液相处 —— 0.6 kPa 下水在 0.01 °C 就开。
      { param: 'pressure', min: 50, max: 500 },
    ],
  },
  {
    /**
     * 碘：卤水里的碘离子用氯气氧化，析出后升华精制。
     *
     *   2I⁻ + Cl₂ → I₂ + 2Cl⁻
     *
     * 入  卤水 2778（按 400 ppm I 设计，含碘 1.111 kg）
     *     氯 0.30（化学计量 0.279 + 7% 过量）
     *     硫酸 5（98%，把 pH 压到 2–3）
     *     洗涤水 10
     * 出  碘 1.000 + 提碘卤水与洗涤水 2792.30
     *
     * 90% 收率是设计值：氧化、过滤、升华各丢一点，没有中试数据。
     * 过量的氯会被卤水里的还原性杂质吃掉；终点看淡黄色，没有 ORP 计。
     *
     * 三步：酸化/氯氧化在湿法槽（20–40 °C、100–300 kPa —— 槽必须密闭，
     * 否则 0.6 kPa 下水自己开）；过滤洗涤是机器人端 PTFE 滤布；升华用
     * 升华井（273–550 K 的加热 + 冷阱，本来就是水链那一套，工质换成碘）。
     *
     * ⚠️ 只处理 I⁻。若卤水以 IO₃⁻ 为主（智利 caliche 那种），要先还原成
     * I⁻ 再氧化；本层没有亚硫酸盐/二氧化硫还原那一步的路线，见缺口②。
     */
    id: 'make/iodine',
    name: 'Iodine Production', name_zh: '碘制备',
    produces: [
      {
        item: 'mat/iodine',
        qty: q(1),
        gives: [
          { param: 'purity', kind: 'range', min: 99.5, max: 99.9, record: 'mat/iodine-purity-record' },
          { param: 'waterContent', kind: 'range', min: 0, max: 0.1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mars/brine', qty: q(2778) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(3, 10) }] },
      {
        anyOf: [
          {
            item: 'mat/sulfuric-acid',
            qty: q(5),
            need: [{ param: 'concentration', kind: 'range', min: 96, max: 98 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '酸化与氯氧化：硫酸调 pH 2–3，通氯气至淡黄色终点，搅拌 30–60 min',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      { note_zh: '过滤洗涤：PTFE 滤布抽滤，少量水洗掉母液', performedBy: 'plant/robot' },
      {
        // 温度不带单位。sublimator 的 holds（273–550）与 make/water 的
        // 300–500 都按 K 写；这里沿用同一套刻度：300–400 K = 27–127 °C。
        note_zh: '升华精制：300–400 K 升华，冷阱凝华（0.6 kPa 下相当于 27–127 °C）',
        performedBy: 'plant/sublimator',
        under: [{ param: 'temperature', min: 300, max: 400 }],
      },
    ],
    unbalanced_zh: '卤水 2778（400 ppm I，含碘 1.111）+ 氯 0.30 + 硫酸 5 + 洗涤水 10 → 碘 1.000；余 2792.30 是提碘后的卤水与洗涤水（含未回收碘 0.111，按 90% 收率），本链未建条目；氯化学计量 0.279，余 0.021 是过量与杂质消耗；硫酸 5 是设计值（卤水碱度无数据）',
  },
  {
    /**
     * 二硫化碳：CH₄ + 4S → CS₂ + 2H₂S，600–700 °C。
     *
     *   211 甲烷 + 1684 硫 → 1000 二硫化碳（并出 895 硫化氢）
     *
     * 硫化氢没有条目 —— 它可以回炉制硫（Claus），但那条线本层没建，
     * 所以按不平衡声明。这是这一层唯一一处"产物没人接"。
     */
    id: 'make/cs2',
    name: 'Carbon Disulfide Production', name_zh: '二硫化碳制备',
    produces: [
      { item: 'mat/cs2', qty: q(1000) },
      { item: 'mat/h2s', qty: q(895), gives: [{ param: 'purity', kind: 'range', min: 85 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/methane', qty: q(211) }] },
      { anyOf: [{ item: 'mat/sulfur', qty: q(1684) }] },
    ],
    needs: [],
    performedBy: 'plant/bosch-reactor',
    under: [{ param: 'temperature', min: 600, max: 700 }],
    unbalanced_zh: '211 甲烷 + 1684 硫 → 1000 二硫化碳；余 895 是硫化氢，本链未建条目',
  },
  {
    /**
     * 乙炔水合：C₂H₂ + H₂O → CH₃CHO，80–100 °C，汞盐催化。
     *
     *   591 乙炔 + 409 水 → 1000 乙醛
     *
     * 汞催化剂有毒，工业上早换成铜或非汞体系 —— 本层不指定催化剂，
     * 也没有汞的条目，所以只能写"催化"。
     */
    id: 'make/acetaldehyde',
    name: 'Acetylene Hydration Production', name_zh: '乙炔水合制备',
    produces: [{ item: 'mat/acetaldehyde', qty: q(1000) }],
    uses: [
      { anyOf: [{ item: 'mat/acetylene', qty: q(591) }] },
      { anyOf: [{ item: 'mat/water', qty: q(409) }] },
    ],
    needs: [],
    performedBy: 'plant/acid-plant',
    under: [{ param: 'temperature', min: 80, max: 100 }],
  },
  {
    /**
     * 乙醛加氢：CH₃CHO + H₂ → C₂H₅OH，150–200 °C，铜或镍催化。
     *
     *   956 乙醛 + 44 氢 → 1000 乙醇
     *
     * 这一步把 C2 的醛变成 C2 的醇 —— 黄药要的是醇，不是醛。
     */
    id: 'make/ethanol',
    name: 'Acetaldehyde Hydrogenation Production', name_zh: '乙醛加氢制备',
    produces: [{ item: 'mat/ethanol', qty: q(1000) }],
    uses: [
      { anyOf: [{ item: 'mat/acetaldehyde', qty: q(956) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(44) }] },
    ],
    needs: [],
    performedBy: 'plant/bosch-reactor',
    under: [{ param: 'temperature', min: 150, max: 200 }],
  },
  {
    /**
     * 黄药合成：C₂H₅OH + CS₂ + NaOH → C₂H₅OCS₂Na + H₂O。
     *
     *   320 乙醇 + 528 二硫化碳 + 277 碱 → 1000 黄药 + 125 水
     *
     * 常温反应，不需要温度条件 —— 这是本层第一条没有 `under` 的有机路线，
     * 也是应该的：不是所有反应都需要加热。
     */
    id: 'make/xanthate',
    name: 'Xanthate Synthesis', name_zh: '黄药合成',
    produces: [
      { item: 'mat/xanthate', qty: q(1000) },
      { item: 'mat/water', qty: q(125), gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ethanol', qty: q(320) }] },
      { anyOf: [{ item: 'mat/cs2', qty: q(528) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(277) }] },
    ],
    needs: [],
    performedBy: 'plant/polymer-plant',
  },
  {
    /**
     * 浮选药剂配制：黄药 1000 + 丁醇 334 → 药剂 1334。
     *
     * 3 : 1 是常规配比（捕收剂几十克每吨矿，起泡剂更少）。混合不要机器 —— 配液是机器人干的。
     *
     * 起泡剂用丁醇而不是 MIBC：丁醇是本层唯一能自己造的 C≥4 醇，
     * 起泡力弱一档、用量要大。**这是把断点解开，不是把问题解决** ——
     * 想要 MIBC，得先有 C4 的酮，那要丙烯，本层没有。
     */
    id: 'make/flotation-reagent',
    name: 'Flotation Reagent Manufacturing', name_zh: '浮选药剂制造',
    produces: [{ item: 'mat/flotation-reagent', qty: q(1364) }],
    uses: [
      { anyOf: [{ item: 'mat/xanthate', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/butanol', qty: q(334) }] },
      // 硫酸铜是活化剂（闪锌矿浮选前要活化），30 kg 配 1 t 药剂。
      // 这是 mat/copper-sulfate 的第一个去处 —— 之前它是死产。
      { anyOf: [{ item: 'mat/copper-sulfate', qty: q(30), need: [{ param: 'purity', kind: 'range', min: 90, dir: 'atLeast' }], onRelax: 'functional-kept' }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 丁醇缩合（Guerbet）：2C₂H₅OH → C₄H₉OH + H₂O，200–250 °C，碱催化。
     *
     *   1244 乙醇 → 1000 丁醇 + 244 水
     *
     * 一步把 C2 变成 C4 —— 这是本层唯一一条能长碳链的反应。
     * 再往上（C5–C8）要醛缩合，那要 C3/C4 的醛，而它们又要丙烯或丁烯，
     * 所以这条链到 C4 就断了。
     */
    id: 'make/butanol',
    name: 'Butanol Production by Condensation', name_zh: '丁醇缩合制备',
    produces: [
      { item: 'mat/butanol', qty: q(1000) },
      { item: 'mat/water', qty: q(244), gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }] },
    ],
    uses: [{ anyOf: [{ item: 'mat/ethanol', qty: q(1244) }] }],
    needs: [],
    performedBy: 'plant/bosch-reactor',
    under: [{ param: 'temperature', min: 200, max: 250 }],
  },
  {
    /**
     * 中和制硫酸钠：2NaOH + H₂SO₄ → Na₂SO₄ + 2H₂O。
     *
     *   563 碱 + 691 硫酸 → 1000 硫酸钠 + 254 水
     *
     * 强放热，也是最没有悬念的一步 —— 它存在的唯一理由是过硫酸盐要它。
     */
    id: 'make/sodium-sulfate',
    name: 'Sodium Sulfate Production by Neutralization', name_zh: '中和制硫酸钠',
    produces: [
      { item: 'mat/sodium-sulfate', qty: q(1000) },
      { item: 'mat/water', qty: q(254), gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/naoh', qty: q(563) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(691) }] },
    ],
    needs: [],
    performedBy: 'plant/acid-plant',
    under: [{ param: 'temperature', min: 60, max: 100 }],
  },
  {
    /**
     * 电解硫酸钠制过硫酸钠：
     *   阳极  2SO₄²⁻ → S₂O₈²⁻ + 2e⁻
     *   阴极  2H₂O + 2e⁻ → H₂ + 2OH⁻
     *   总式  2Na₂SO₄ + 2H₂O → Na₂S₂O₈ + H₂ + 2NaOH
     *
     *   1193 硫酸钠 + 151 水 → 1000 过硫酸钠 + 8 氢 + 336 碱
     *
     * ⚠️ 这一步要 **10–30 °C**：过硫酸盐在热溶液里会自己水解掉。
     * 而氯碱那一步要 60–90 °C —— **同一台电解槽干不了两样。**
     * 数据里一台设备只能有一个 `holds`，所以 electrolyzer 写成 10–90，
     * 那是模型的简化，不是它真能在 60 °C 做过硫酸盐。
     */
    id: 'make/initiator',
    name: 'Polymerization Initiator Manufacturing', name_zh: '聚合引发剂制造',
    produces: [
      { item: 'mat/polymerization-initiator', qty: q(1000) },
      { item: 'mat/hydrogen', qty: q(8), gives: [{ param: 'purity', kind: 'range', min: 99, max: 99.5, dir: 'atLeast' }] },
      { item: 'mat/naoh', qty: q(336), gives: [{ param: 'concentration', kind: 'range', min: 40, max: 50 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sodium-sulfate', qty: q(1193) }] },
      { anyOf: [{ item: 'mat/water', qty: q(151) }] },
    ],
    needs: [],
    performedBy: 'plant/electrolyzer',
    under: [{ param: 'temperature', min: 10, max: 30 }],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...REAGENT_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...REAGENT_ROUTES];
