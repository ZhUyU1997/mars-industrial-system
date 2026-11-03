/**
 * 铝 —— 风化层里占 9%，而全表一件铝制品都没有。
 *
 * 这一层补三样东西和一台设备：
 *
 *   氧化铝   从风化层里"酸法"提出来（不是拜耳法，见下）
 *   冰晶石   电解的熔剂，Na₃AlF₆，自造（火星没有天然冰晶石）
 *   铝       霍尔-埃鲁法，960 °C 熔盐电解
 *   铝电解槽 一台专门的设备 —— 它不是"电解槽"能兼任的
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么不用拜耳法
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 地球的拜耳法靠一件事：铝土矿里的铝是**三水铝石**（Al(OH)₃），
 * 常温高压碱浸就能溶出来。而火星风化层里的铝锁在**斜长石**里
 * （(Ca,Na)(Al,Si)₄O₈）—— 硅氧骨架把铝裹得死死的，碱浸不动。
 *
 * 破解的办法是把骨架先打碎。两条路：
 *
 *   碱烧结法   Na₂CO₃ + CaCO₃ + 高岭土 → 1200–1300 °C 烧结 → 碱浸
 *              要纯碱（索尔维法，要先有氨）与石灰石（火星没有）
 *   酸浸法     高岭土 → 700–800 °C 焙烧（脱水、活化）→ 硫酸浸出 →
 *              结晶硫酸铝 → 900–1000 °C 煅烧 → Al₂O₃ + SO₃（回收制酸）
 *
 * **酸法用的是本层已经有的东西**：硫酸、高温窑、风化层。而 SO₃ 在煅烧时
 * 放出来，回到制酸那一段 —— **硫酸在环里转，只补损耗**。这和氯是同一种结构。
 *
 * 代价是能耗：酸法的能耗是拜耳法的两三倍，而且风化层里 Al₂O₃ 只有 9%
 * （铝土矿 40–60%），所以要搬的土是地球上的五倍。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 冰晶石为什么必须自造
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 霍尔-埃鲁法把 Al₂O₃ 溶在 960 °C 的熔融冰晶石里电解 —— 冰晶石不是催化剂，
 * 是**溶剂**：Al₂O₃ 熔点 2072 °C，溶进冰晶石之后只要 960 °C。
 *
 * 火星没有天然冰晶石（地球上也只有格陵兰一处），但三样原料都有：
 * 氟从磷灰石来（HF）、钠从氯碱来（NaOH）、铝从氧化铝来。合起来就是：
 *
 *   Al₂O₃ + 12HF + 6NaOH → 2Na₃AlF₆ + 9H₂O
 *
 * 这也是"冰晶石自产是铝链的隐藏前提"。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ALUMINIUM_ITEMS: readonly Item[] = [
  /**
   * 氧化铝（Al₂O₃）。酸法从风化层提出来，纯度要求比冶金级硅低得多，
   * 但比水泥用的大得多：电解槽里的杂质会进铝。
   */
  { id: 'mat/alumina', name: '氧化铝', unit: 'kg', category: 'material',
    props: [{ param: 'al2o3', kind: 'range', min: 90, max: 99.5, unit: '%' }] },

  /**
   * 冰晶石（Na₃AlF₆）。熔盐电解的溶剂，理论上不消耗，实际每吨铝补 10–20 kg。
   *
   * 它是"铝链的隐藏前提"：没有它，Al₂O₃ 要在 2072 °C 才熔化，而那个温度
   * 没有容器撑得住。
   */
  { id: 'mat/cryolite', name: '冰晶石', unit: 'kg', category: 'material' },

  /** 铝。霍尔-埃鲁法，960 °C，碳阳极、冰晶石熔体。导电、轻、不生锈。 */
  { id: 'mat/aluminium', name: '铝', unit: 'kg', category: 'material' },
];

export const ALUMINIUM_ROUTES: readonly Route[] = [
  {
    /**
     * 酸法提铝：风化层 → 焙烧活化 → 硫酸浸出 → 结晶 → 煅烧。
     *
     *   11111 风化层 → 1000 氧化铝（9% 品位，理论下限）
     *
     * 硫酸在环里转（煅烧放出 SO₃ 回去制酸），只补损耗，所以不计进料；
     * 余下 10111 kg 是浸出渣（硅酸盐骨架），回到尾矿那一类，本链未建条目。
     *
     * ⚠️ 这是**理论下限**：实际浸出率 80–90%，所以真实要挖 1.2–1.4 万吨。
     * 数字按 100% 给，是为了让"9% 品位"这件事一眼看得见。
     */
    id: 'make/alumina',
    name: '酸法提铝制备',
    produces: [
      { item: 'mat/alumina', qty: q(1000), gives: [{ param: 'al2o3', kind: 'range', min: 95, max: 99, dir: 'atLeast' }] },
      { item: 'mat/tailings', qty: q(10111) },
    ],
    uses: [{ anyOf: [{ item: 'mat/tailings', qty: q(11111) }] }],
    needs: ['plant/kiln'],
    performedBy: 'plant/acid-plant',
    under: [
      { param: 'temperature', min: 60, max: 200 },
      // 酸液在 0.6 kPa 下会自己沸腾（水 0.01 °C 就开），浸出必须是加压容器。
      { param: 'pressure', min: 100, max: 500 },
    ],
    unbalanced_zh:
      '11111 风化层 → 1000 氧化铝 + 浸出渣 10111（已单列 mat/tailings，硅酸盐骨架）；硫酸环内再生不计',
  },
  {
    /**
     * 冰晶石：Al₂O₃ + 12HF + 6NaOH → 2Na₃AlF₆ + 9H₂O，60–100 °C。
     *
     *   243 氧化铝 + 572 氢氟酸 + 571 碱 → 1000 冰晶石 + 386 水
     *
     * 火星没有天然冰晶石，但氟、钠、铝三样都有 —— 这是"从三条不相干的链上
     * 各取一段，拼出一件新东西"的第一次。地球上也只有一个矿坑有它。
     */
    id: 'make/cryolite',
    name: '冰晶石制备',
    produces: [
      { item: 'mat/cryolite', qty: q(1000) },
      { item: 'mat/water', qty: q(386), gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/alumina', qty: q(243) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(572) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(571) }] },
    ],
    needs: [],
    performedBy: 'plant/acid-plant',
    under: [{ param: 'temperature', min: 60, max: 100 }],
  },
  {
    /**
     * 霍尔-埃鲁法：2Al₂O₃ + 3C → 4Al + 3CO₂，960 °C，熔融冰晶石。
     *
     *   1890 氧化铝 + 334 碳 + 10 冰晶石 → 1000 铝 + 1223 二氧化碳 + 11 废电解质
     *
     * 碳阳极是消耗品 —— 它被电解出来的氧烧掉，这正是这个工艺的代价：
     * **每吨铝要 334 kg 碳阳极**，而碳从 Bosch 来（CO₂ + H₂）。
     * 换句话说：炼铝要拿氢换碳，再拿碳换铝。
     *
     * 冰晶石按 1% 补损计：补 10 kg，清槽带出的废电解质 11 kg 单列为
     * `mat/spent-bath`（冰晶石 60–80 %、AlF₃ 10–25 %），破碎筛分后回槽。
     */
    id: 'make/aluminium',
    name: '霍尔-埃鲁法制备',
    produces: [
      { item: 'mat/aluminium', qty: q(1000) },
      { item: 'mat/co2', qty: q(1223) },
      {
        item: 'mat/spent-bath',
        qty: q(11),
        gives: [
          { param: 'cryolite', kind: 'range', min: 60, max: 80 },
          { param: 'alf3', kind: 'range', min: 10, max: 25 },
          { param: 'form', kind: 'enum', oneOf: ['solid'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/alumina', qty: q(1890) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(334) }] },
      { anyOf: [{ item: 'mat/cryolite', qty: q(10) }] },
    ],
    needs: ['plant/radiator'],
    performedBy: 'plant/aluminium-cell',
    under: [{ param: 'temperature', min: 940, max: 980 }],
    unbalanced_zh: '氧化铝 1890 + 碳 334 + 冰晶石 10 → 1000 铝 + 1223 二氧化碳 + 11 废电解质 = 2234，平；废电解质已单列，可回电解槽（冰晶石 60–80 %、AlF₃ 10–25 % 为设计值/Earth 工程值）',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 铝电解槽 —— 一台专门的设备
// ═══════════════════════════════════════════════════════════════════════════

export const ALUMINIUM_CELL_PARTS: readonly Item[] = [
  /**
   * 槽壳。钢壳 + 保温层 + 耐火层 + 底部碳块。
   *
   * 它要同时承住 960 °C 的熔盐、几百千安的电流、以及铝液的重量，
   * 而外壳摸上去不能烫手 —— 四层材料各管一件事。
   */
  { id: 'plant/aluminium-cell/shell', name: '铝电解槽槽壳', unit: '件', category: 'part' },

  /**
   * 阴极碳块。槽底铺一排碳块，钢棒从底下穿出接母线。
   *
   * 材料与矿热炉电极同源（碳粉 + 酚醛树脂），但形状不同：电极是圆棒，
   * 阴极是长方形块，要开槽嵌钢棒。
   */
  { id: 'plant/aluminium-cell/cathode', name: '铝电解槽阴极碳块', unit: '件', category: 'part' },

  /**
   * 阳极碳块。20–30 块一组，挂在母线上，慢慢烧掉，烧完换新的。
   *
   * **它才是这个工艺的燃料**：每吨铝 334 kg 阳极被电解出来的氧烧掉。
   */
  { id: 'plant/aluminium-cell/anode', name: '铝电解槽阳极碳块', unit: '件', category: 'part' },

  /**
   * 母线。几千安的直流电从阳极进、阴极出。
   *
   * 用铝不用铜：铜贵 8333:1，而铝现在自己就能造 —— 这是铝链补上之后
   * 立刻能兑现的第一个好处。
   */
  { id: 'plant/aluminium-cell/busbar', name: '铝电解槽母线', unit: '件', category: 'part' },

  /**
   * 槽壳冷却。**铝电解是全表最热的一处**：每吨铝 13–15 MWh 的余热，
   * 而槽子的窗口只有 940–980 °C 那么窄。
   *
   * 铝板焊成的水套贴在槽壳外侧，工质用**氨**不是水 —— 槽边夜里到零下，
   * 水会冻裂。氨是它在这套体系里的第二个身份（第一个是纯碱与玻璃的原料）。
   */
  { id: 'plant/aluminium-cell/shell-cooling', name: '铝电解槽槽壳冷却', unit: '件', category: 'part' },

  /** 集气罩。罩住阳极气体（CO₂ 为主、少量氟化物），抽走净化。 */
  { id: 'plant/aluminium-cell/hood', name: '铝电解槽集气罩', unit: '件', category: 'part' },
];

export const ALUMINIUM_CELL_ROUTES: readonly Route[] = [
  {
    /** 槽壳。钢壳卷焊 → 铺保温与耐火 → 砌阴极块。 */
    id: 'make/cell-shell',
    name: '铝电解槽槽壳制造',
    produces: [{ item: 'plant/aluminium-cell/shell', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 阴极碳块。碳粉 + 树脂混捏 → 模压成块 → 1100–1300 °C 焙烧 → 开槽嵌钢棒。 */
    id: 'make/cell-cathode',
    name: '铝电解槽阴极碳块制造',
    produces: [{ item: 'plant/aluminium-cell/cathode', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/carbon', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
    ],
    needs: ['plant/milling-machine'],
    performedBy: 'plant/kiln',
    under: [{ param: 'temperature', min: 1200, max: 1300 }],
  },
  {
    /** 阳极碳块。同源工艺，多一道钢爪浇铸。 */
    id: 'make/cell-anode',
    name: '铝电解槽阳极碳块制造',
    produces: [{ item: 'plant/aluminium-cell/anode', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/carbon', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
    ],
    needs: ['plant/melting-furnace'],
    performedBy: 'plant/kiln',
    under: [{ param: 'temperature', min: 1200, max: 1300 }],
  },
  {
    /**
     * 母线。铝重熔浇成排 —— 不用铜，铝现在自己就能造。
     *
     * ⚠️ 熔炼炉的下限是 1200 °C，而铝 660 °C 就化 —— 炉温高了一倍，
     * 烧损与吸氢都大。能用，但不是化铝该用的炉子（铝液炉是 700–800 °C）。
     */
    id: 'make/cell-busbar',
    name: '铝电解槽母线制造',
    produces: [{ item: 'plant/aluminium-cell/busbar', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/aluminium', qty: q(1) }] }],
    needs: ['plant/milling-machine'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1200, max: 1300 }],
  },
  {
    /** 槽壳水套。铝板卷焊，氨工质，配集管与回液管。 */
    id: 'make/cell-cooling',
    name: '铝电解槽槽壳冷却制造',
    produces: [{ item: 'plant/aluminium-cell/shell-cooling', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ammonia', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 集气罩。薄板折弯焊成，接排烟管。 */
    id: 'make/cell-hood',
    name: '铝电解槽集气罩制造',
    produces: [{ item: 'plant/aluminium-cell/hood', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] }],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
];

/**
 * 铝电解槽。960 °C 的熔盐电解，不是电解槽能兼任的。
 *
 * 电解槽（水溶液，10–90 °C）与它差着 900 °C 和一整套熔盐化学：
 * 熔体腐蚀、阳极消耗、氟化物挥发、磁场搅拌。**这是全表第一台真正专用的
 * 电解设备** —— 之前所有"电解"都挤在那一台槽里（水电解 + 氯碱 + 过硫酸盐），
 * 而它们至少都是水溶液。
 */
export const ALUMINIUM_CELL: Item = {
  id: 'plant/aluminium-cell',
  name: '铝电解槽',
  unit: '台',
  category: 'machine',
  holds: [{ param: 'temperature', min: 940, max: 980 }],
  composedOf: [...ALUMINIUM_CELL_PARTS.map((p) => ({ item: p.id, qty: q(1) })), { item: 'std/motor-7.5kw-4p', qty: q(1) }],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ALUMINIUM_CELL_PARTS, ...ALUMINIUM_ITEMS, ALUMINIUM_CELL];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/aluminium-cell',
    name: '铝电解槽装配',
    produces: [{
      item: 'plant/aluminium-cell',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...ALUMINIUM_CELL_ROUTES, ...ALUMINIUM_ROUTES, ...ASSEMBLY_ROUTES];
