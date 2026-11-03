/**
 * 热工与取水 —— 高温窑、升华井。
 *
 * 两台的共同点是"只加不拆"：它们不改变化学成分，只把东西加热到某个温度，
 * 或者反过来把热量拿走。
 *
 *   高温窑   1200–1750 °C，比熔炼炉温和但更长。耐火砖、石灰、陶瓷都从它出。
 *   升华井   273–550 K，加热含冰层让水升华、再在冷面上凝华 —— 火星取水
 *            的标准做法，也是水链的第一道。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么两者都用氢氧燃烧，而不是电热
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 电热元件要镍铬丝或硅碳棒：前者要镍铬合金，后者要碳化硅（要石英砂与
 * 2000 °C 的炉子）。氢氧燃烧只要铜管、不锈钢和耐火砖 —— 三样都是现成的，
 * 而且氧是电解水的副产，本来就过剩。
 *
 * 代价是燃烧产物是水蒸气，会把水带进窑里。对耐火砖与石灰无所谓；对
 * 还原炉就不行 —— 所以那台用蓄热式加热而不是直烧。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 零、矿棉 —— 炉渣的下游
// ═══════════════════════════════════════════════════════════════════════════

export const THERMAL_ITEMS: readonly Item[] = [
  /**
   * 测温锥（塞格锥）。**1886 年的办法，不用电、不用铂、不用光学。**
   *
   * 一小支三角锥，立在炉膛里。温度到了它的软化点，它自己弯倒 ——
   * **看它倒不倒，就知道到没到那个温度。**
   *
   * 成分就是硅石、氧化铝加助熔的碱与碱土，靠调配比把软化点一支一支错开
   * （1450、1460、1470……）。**它不是温度计，是"温度是否达到"的判据**，
   * 而这正好是烧结需要的：不需要知道 1453.7 度，只需要知道到了 1450 没有。
   *
   * 精度 ±5 °C，比当年的高温计还好。代价是**一次一换** ——
   * 每一炉都要摆几支新的。
   *
   * 它在本层还有一个身份：**第一个真正被消耗的消耗件**。
   * 刀片、磨料那些都是按"每小时耗多少"算的（没有时长，写不出来），
   * 而测温锥是**按炉耗**的 —— 一炉几支，`uses` 正好是按批次记的。
   */
  { id: 'mat/pyrometric-cone', name: 'Pyrometric Cone', name_zh: '测温锥', unit: 'kg', category: 'consumable',
    // 锥号（010、012…）本质就是"到多少度软倒"。
    props: [{ param: 'softenTemp', kind: 'range', min: 600, max: 2000, unit: '°C' }] },

  /**
   * 矿棉（渣棉）。炉渣重熔后甩成纤维，是保温层。
   *
   * 它的意义在账上：`mat/slag` 在材料账里是死产 —— 全表没有一件东西用它。
   * 而炉渣的成分（SiO₂、Al₂O₃、CaO、MgO）恰恰就是硅酸盐纤维的成分，
   * 所以**保温棉是炉渣最自然的下游**：不用分选、不用提纯，熔了甩丝就行。
   *
   * 纤维之间锁住空气，导热系数只有耐火砖的十分之一 —— 耐火砖挡火，
   * 矿棉挡热，两层一起才有"炉壳摸上去不烫"。
   */
  { id: 'mat/mineral-wool', name: 'Mineral Wool', name_zh: '矿棉', unit: 'kg', category: 'material' },
];

// ═══════════════════════════════════════════════════════════════════════════
// 一、高温窑
// ═══════════════════════════════════════════════════════════════════════════

export const KILN_PARTS: readonly Item[] = [
  /** 窑壳。薄板与型钢焊成，外壁有保温，承窑衬与窑车的重量。 */
  { id: 'plant/kiln/shell', name: 'Kiln Shell', name_zh: '窑炉窑壳', unit: '件', category: 'part' },

  /** 窑衬。耐火砖砌在壳内，直接对着 1700 °C 的火。它是窑的寿命本身。 */
  { id: 'plant/kiln/lining', name: 'Kiln Lining', name_zh: '窑炉窑衬', unit: '件', category: 'part' },

  /** 燃烧器。氢氧在耐火喷口里混合燃烧，火焰温度 2800 °C，靠过量空气压到 1700。 */
  { id: 'plant/kiln/burner', name: 'Kiln Burner', name_zh: '窑炉燃烧器', unit: '件', category: 'part' },

  /** 窑车。耐火台面驮着工件走，钢车架在窑外受热少 —— 推车的轨道贯穿全窑。 */
  { id: 'plant/kiln/trolley', name: 'Kiln Trolley', name_zh: '窑炉窑车', unit: '件', category: 'part' },

  /** 换热器。用烟气余热预热助燃空气，省一半氢。 */
  { id: 'plant/kiln/recuperator', name: 'Kiln Heat Exchanger', name_zh: '窑炉换热器', unit: '件', category: 'part' },
];

export const KILN_ROUTES: readonly Route[] = [
  {
    /**
     * 测温锥：硅石 + 氧化铝 + 纯碱 + 石灰，1400 °C 烧成，磨成三角锥。
     *
     *   3 硅石 + 3 氧化铝 + 2 纯碱 + 2 石灰 → 10 测温锥（按 kg 计）
     *
     * 一个十公斤的批次出十公斤锥 —— 配比是"成分"，不是"配方"：
     * 助熔的碱越多，软化点越低。1450 那一支是硅石 30%、氧化铝 30%、
     * 纯碱 20%、石灰 20% 一类的配比（此处给的是量级，不是精确配方）。
     *
     * **本层没有高岭土**（那是测温锥的传统原料），所以用纯碱与石灰当助熔剂 ——
     * 它们比长石更猛，软化点更低，要多加硅石压回来。
     */
    id: 'make/pyrometric-cone',
    name: 'Pyrometric Cone Manufacturing', name_zh: '测温锥制造',
    produces: [{ item: 'mat/pyrometric-cone', qty: q(10), gives: [{ param: 'softenTemp', kind: 'range', min: 600, max: 2000 }] }],
    uses: [
      { anyOf: [{ item: 'mat/silica', qty: q(3) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(3) }] },
      { anyOf: [{ item: 'mat/soda-ash', qty: q(2) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(2) }] },
    ],
    needs: [],
    performedBy: 'plant/kiln',
    under: [{ param: 'temperature', min: 1380, max: 1420 }],
  },  {
    /**
     * 矿棉：炉渣 1400–1500 °C 重熔，离心甩丝，加粘结剂固化。
     *
     *   1111 炉渣 → 1000 矿棉（余 111 是渣球与损耗）
     *
     * 渣球（没甩成纤维的粗颗粒）可以回炉。这一条把 mat/slag 从死产里
     * 拿出来 —— 它是材料账里唯一一个"成分正好合适"的废料。
     */
    id: 'make/mineral-wool',
    name: 'Mineral Wool Production', name_zh: '矿棉制备',
    produces: [
      { item: 'mat/mineral-wool', qty: q(1000) },
      { item: 'mat/slag', qty: q(111) },
    ],
    uses: [{ anyOf: [{ item: 'mat/slag', qty: q(1111) }] }],
    needs: [],
    performedBy: 'plant/kiln',
    under: [{ param: 'temperature', min: 1400, max: 1500 }],
    unbalanced_zh: '1111 炉渣 → 1000 矿棉 + 渣球 111（已单列 mat/slag，可回炉）',
  },  {
    /**
     * 窑壳。薄板卷焊 + 型钢骨架，**壳与砖之间夹一层矿棉**，留出烧嘴孔与窑车轨道。
     *
     * 耐火砖挡火，矿棉挡热 —— 只有砖没有棉，窑壳会烫到几百摄氏度，
     * 人碰不得、热也全跑了。
     */
    id: 'make/kiln-shell',
    name: 'Kiln Shell Manufacturing', name_zh: '窑炉窑壳制造',
    produces: [{ item: 'plant/kiln/shell', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 窑衬。耐火砖砌筑 —— 砌是装配不是机械加工，执行者是机器人。 */
    id: 'make/kiln-lining',
    name: 'Kiln Lining Manufacturing', name_zh: '窑炉窑衬制造',
    produces: [{ item: 'plant/kiln/lining', qty: q(1) }],
    uses: [
      { anyOf: [
        { item: 'mat/refractory', qty: q(1), need: [
            { param: 'grade', kind: 'enum', oneOf: ['silica'] },
            { param: 'serviceTemp', kind: 'range', min: 1450, max: 1550, dir: 'atLeast' },
          ], onRelax: 'functional-kept' },
      ] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 燃烧器。铜喷嘴车成 + 不锈钢混合室，与水冷法兰配作。 */
    id: 'make/kiln-burner',
    name: 'Kiln Burner Manufacturing', name_zh: '窑炉燃烧器制造',
    produces: [{ item: 'plant/kiln/burner', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 窑车。45 钢车架焊成，耐火台面浇注，轮对车磨后装轴承。 */
    id: 'make/kiln-trolley',
    name: 'Kiln Trolley Manufacturing', name_zh: '窑炉窑车制造',
    produces: [{ item: 'plant/kiln/trolley', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 换热器。不锈钢管束 + 薄板壳，烟气走管内、空气走管外。 */
    id: 'make/kiln-recuperator',
    name: 'Kiln Heat Exchanger Manufacturing', name_zh: '窑炉换热器制造',
    produces: [{ item: 'plant/kiln/recuperator', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
];

/**
 * 高温窑。1200–1750 °C，比熔炼炉温和但更长。
 *
 * 三种料从它出来：耐火砖（烧成）、石灰（煅烧）、陶瓷（烧结）。
 * 它也是 Bosch 催化剂的焙烧设备 —— 一台窑串起三条不相干的链。
 */
export const KILN: Item = {
  id: 'plant/kiln',
  name: 'Kiln', name_zh: '窑炉',
  unit: '台',
  category: 'machine',
  holds: [{ param: 'temperature', min: 1200, max: 1750 }],
  composedOf: [
    ...KILN_PARTS.map((p) => ({ item: p.id, qty: q(1) })),
    { item: 'std/motor-7.5kw-4p', qty: q(1) },
    // 鼓风机的启停靠接触器：窑要的是"开/关"，不是调压。
    { item: 'std/contactor-general', qty: q(1) },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// 二、升华井
// ═══════════════════════════════════════════════════════════════════════════

export const SUBLIMATOR_PARTS: readonly Item[] = [
  /**
   * 热风发生器。烧氢产热风，把热风打进井里。
   *
   * 为什么不直接插电热棒：井里有冰有尘，电热丝会烧断；而且电热元件要
   * 镍铬，那是另一条链。燃烧器只要铜与不锈钢。
   */
  { id: 'plant/sublimator/hot-gas', name: 'Sublimator Hot Gas Generator', name_zh: '升华器热风发生器', unit: '件', category: 'part' },

  /** 保温罩。扣在井口上，薄板外壳包一层耐火纤维，别让热跑掉。 */
  { id: 'plant/sublimator/hood', name: 'Sublimator Insulation Hood', name_zh: '升华器保温罩', unit: '件', category: 'part' },

  /**
   * 冷阱。水蒸气在 200 K 左右的冷面上直接凝华成霜，再刮下来化开。
   *
   * 火星夜间的低温就够用 —— 白天靠辐射散热，夜里靠环境。所以这台设备
   * 最费的不是热量，是"什么时候开工"。
   */
  { id: 'plant/sublimator/cold-trap', name: 'Sublimator Cold Trap', name_zh: '升华器冷阱', unit: '件', category: 'part' },

  /**
   * 风机。把热风送进井里、把湿风抽到冷阱上 —— 一个闭式循环。
   *
   * 45 钢叶轮车铣后做动平衡；风温不高，密封用 PTFE 就够。
   */
  { id: 'plant/sublimator/blower', name: 'Sublimator Blower', name_zh: '升华器风机', unit: '件', category: 'part' },

  /** 管路与阀。不锈钢管焊成，阀门要能在结霜的环境里开关。 */
  { id: 'plant/sublimator/piping', name: 'Sublimator Piping and Valves', name_zh: '升华器管路与阀', unit: '件', category: 'part' },
];

export const SUBLIMATOR_ROUTES: readonly Route[] = [
  {
    /** 热风发生器。不锈钢燃烧室 + 铜喷嘴，焊接后试压。 */
    id: 'make/sublimator-hot-gas',
    name: 'Sublimator Hot Gas Generator Manufacturing', name_zh: '升华器热风发生器制造',
    produces: [{ item: 'plant/sublimator/hot-gas', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 保温罩。薄板折弯焊成，内衬矿棉 —— 罩子要挡热，不挡火（原来写耐火料是错的）。 */
    id: 'make/sublimator-hood',
    name: 'Sublimator Insulation Hood Manufacturing', name_zh: '升华器保温罩制造',
    produces: [{ item: 'plant/sublimator/hood', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 冷阱。不锈钢折板焊成，配刮霜刀与化霜盘管。 */
    id: 'make/sublimator-cold-trap',
    name: 'Sublimator Cold Trap Manufacturing', name_zh: '升华器冷阱制造',
    produces: [{ item: 'plant/sublimator/cold-trap', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] }],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 风机。45 钢叶轮车铣 + 动平衡，机壳薄板焊，轴用两只球轴承。 */
    id: 'make/sublimator-blower',
    name: 'Sublimator Blower Manufacturing', name_zh: '升华器风机制造',
    produces: [{ item: 'plant/sublimator/blower', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'std/bearing-general-p0', qty: q(2) }] },
    ],
    needs: ['lathe', 'plant/milling-machine', 'plant/grinder'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 管路与阀。不锈钢管焊 + 法兰车 + PTFE 密封。 */
    id: 'make/sublimator-piping',
    name: 'Sublimator Piping and Valves Manufacturing', name_zh: '升华器管路与阀制造',
    produces: [{ item: 'plant/sublimator/piping', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
];

/**
 * 升华井与冷阱。加热含冰层让水升华，再在冷面上凝成水。
 *
 * 它是水链的第一道，也是最省事的一道：不用挖冰、不用破碎，把热风打进
 * 含冰层，水自己会跑出来。代价是慢 —— 井的产水量由地层的渗透率决定，
 * 而那是选址问题，不是设备问题。
 */
export const SUBLIMATOR: Item = {
  id: 'plant/sublimator',
  name: 'Sublimator', name_zh: '升华器',
  unit: '套',
  category: 'machine',
  holds: [{ param: 'temperature', min: 273, max: 550 }],
  composedOf: [...SUBLIMATOR_PARTS.map((p) => ({ item: p.id, qty: q(1) })), { item: 'std/motor-7.5kw-4p', qty: q(1) }],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...KILN_PARTS, ...SUBLIMATOR_PARTS, ...THERMAL_ITEMS, KILN, SUBLIMATOR];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/kiln',
    name: 'Kiln Assembly', name_zh: '窑炉装配',
    produces: [{
      item: 'plant/kiln',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/sublimator',
    name: 'Sublimator Assembly', name_zh: '升华器装配',
    produces: [{
      item: 'plant/sublimator',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...KILN_ROUTES, ...SUBLIMATOR_ROUTES, ...ASSEMBLY_ROUTES];
