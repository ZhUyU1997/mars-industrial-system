/**
 * 辐射散热器 —— 6 mbar 大气下，热只有一条路可走。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么这是全表最硬的一条约束
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 地球上的余热靠三种方式走：传导、对流、辐射。火星大气 0.6 kPa，
 * 比地球稀薄 160 倍 —— 对流的换热系数低两个数量级，等于没有。
 * 剩下只有辐射：
 *
 *   P = ε σ A (T⁴ − T_环境⁴)
 *
 * 350 K（77 °C）的板子，环境 200 K，按黑体算 **850 W/m²**。
 *
 * 于是每一瓦余热都要换成一块板子：
 *
 *   1 kW      → 1.2 m²
 *   1 MW      → 1,180 m²     （约 34 × 34 米）
 *   10 MW     → 11,800 m²    （约 109 × 109 米，两个足球场）
 *
 * "10 MWe 的余热需要数万平方米辐射面积" —— 按 850 W/m² 算是 1.2 万，
 * 量级对、数偏大。**这条约束比缺电更致命**：电可以多发，板子只能铺开，
 * 而铺开意味着质量、管路、泵功、以及被沙尘覆盖的维护。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它决定的是功率密度的上限，不是总功率
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 一座厂的总功率可以很大，但**单位体积的功率**被散热面积卡死：
 *
 *   · 想把铝电解槽做得更密？不行，槽子越密，散热面越少
 *   · 想把反应器做得更小？不行，热流密度上去了，温度就失控
 *
 * 所以这张表里真正该问的不是"一共多少电"，是**"每平方米板子摊几瓦"**。
 * 地球上的化工厂靠冷却塔把这个数做到几万瓦每平方米，火星上只有 850。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 三条算得出来的热账
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 只有三处有可靠的单耗，其余不编：
 *
 *   铝电解      13–15 kWh/kg 铝（取 14）→ 每吨 14 MWh
 *               摊到一天是 583 kW → **686 m² 板子 / 吨铝 / 天**
 *   铬铁矿热炉  3,000–4,000 kWh/t 铬铁（取 4,000）
 *               摊到一天是 167 kW → **196 m² / 吨铬铁 / 天**
 *   Bosch 制碳  ΔH = −90 kJ/mol C → 7.5 MJ/kg → 2,080 kWh/t
 *               摊到一天是 87 kW → **102 m² / 吨碳 / 天**
 *
 * 一比就看出问题：**同样一吨产品，铝要的板子是铬铁的 3.5 倍、碳的 6.7 倍。**
 * 而铝恰恰是土方量最便宜的那个（21 吨土/吨）—— 它便宜在矿上，贵在板上。
 *
 * 这三条之外（硅铁、玻璃、炼铁、炼钢），单耗的来源不够硬，所以不写数。
 * 宁可空着，也不编一个"大约"。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 工质用氨
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 水在 -60 °C 的夜里会冻裂管子，所以闭式回路的工质必须不冻：
 *
 *   氨      凝固 -78 °C，汽化 -33 °C，换热好，且本层已经能造（哈伯法）
 *   氟利昂  要氟氯烃，本层只到 HCFC-22，作为工质太贵
 *   乙二醇  要环氧乙烷，C2 链上还没有
 *
 * 氨同时是制冷剂与散热工质 —— 这是它在这套体系里的第二个身份
 * （第一个是纯碱与玻璃的原料）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 一处模型装不下的东西
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 热不是"物料"，也不是"条件"。模型的两种表达都套不上：
 *
 *   uses / produces   热不能被称重，也不能被消耗成另一种东西
 *   holds / under     散热不是"把某个温度维持住"，是"必须有一个汇"
 *
 * 所以这一层只能做到：把散热器建成一台设备，挂在高温度路线的 `needs` 上，
 * 说一句"这条路线必须有散热器在场"。**面积算不算得出来，模型不管。**
 *
 * 这是数据层能走的最远一步；再往里走就要动模型（给 Route 加一个热流字段），
 * 那是 core 改动，得先问。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const RADIATOR_PARTS: readonly Item[] = [
  /**
   * 辐射板。铝挤压成带内流道的型材，两面涂高发射率涂层。
   *
   * 用铝不用钢：铝的导热是钢的四倍，而辐射板要的是"把热从管壁铺到整个面"。
   * 这也是铝链补上之后最直接的一次兑现 —— 一万平方米的板子，用钢会重三倍。
   */
  { id: 'plant/radiator/panel', name: 'Radiator Radiating Panel', name_zh: '散热器辐射板', unit: '件', category: 'part' },

  /**
   * 循环泵。氨回路，几 bar，流量按每平方米几十克每秒算。
   *
   * 泵功本身也是热 —— 一万平方米的回路，泵的功耗在百千瓦量级，
   * 而那部分最后也要从板子上走掉。
   */
  { id: 'plant/radiator/pump', name: 'Radiator Circulation Pump', name_zh: '散热器循环泵', unit: '件', category: 'part' },

  /** 集管与分配器。把工质均匀分到几千块并联的板子上，压降要一致。 */
  { id: 'plant/radiator/header', name: 'Radiator Header and Manifold', name_zh: '散热器集管与分配器', unit: '件', category: 'part' },

  /** 管路与阀。不锈钢管，氨专用阀门（铜在氨里会腐蚀，所以不能用铜阀）。 */
  { id: 'plant/radiator/piping', name: 'Radiator Piping and Valves', name_zh: '散热器管路与阀', unit: '件', category: 'part' },

  /** 支架与基础。一万平方米的板子要撑在风里，抗风载比承重更难。 */
  { id: 'plant/radiator/support', name: 'Radiator Support and Foundation', name_zh: '散热器支架与基础', unit: '件', category: 'part' },
];

export const RADIATOR_ROUTES: readonly Route[] = [
  {
    /**
     * 辐射板。**铸铁板，不是铝挤压型材。**
     *
     * 铝那条路要轧机与铣床，而这两台又卡在"第一批设备"上 —— 于是"制铝要散热、
     * 散热要铝"成了一个环。**断这个环的办法是回到铸铁**：
     *
     *   铸铁散热器是 19 世纪的东西：砂型铸出带筋的板，不用轧、不用铣，
     *   只要熔炼炉 + 造型。**重 2–3 倍，导热差一截，但它不需要轧机。**
     *
     * 代价写在这：同样散热量的板子重得多，支架与基础要加，风载更难。
     * 换来的是整个制铝链能开动 —— 因为**散热器是电解铝槽的唯一冷源**。
     */
    id: 'make/radiator-panel',
    name: 'Radiator Radiating Panel Manufacturing', name_zh: '散热器辐射板制造',
    produces: [{ item: 'plant/radiator/panel', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] }],
    needs: [],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1250, max: 1400 }],
  },
  {
    /** 循环泵。45 钢泵体车磨 + PTFE 密封（氨里不能用铜）。泵轴两只球轴承，一万平方米的回路全靠它转。 */
    id: 'make/radiator-pump',
    name: 'Radiator Circulation Pump Manufacturing', name_zh: '散热器循环泵制造',
    produces: [{ item: 'plant/radiator/pump', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
      { anyOf: [{ item: 'std/bearing-general-p0', qty: q(2) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 集管。不锈钢管焊成，支管口等距开孔。 */
    id: 'make/radiator-header',
    name: 'Radiator Header and Manifold Manufacturing', name_zh: '散热器集管与分配器制造',
    produces: [{ item: 'plant/radiator/header', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] }],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 管路与阀。不锈钢管 + 不锈钢阀体（铜阀遇氨会烂）。 */
    id: 'make/radiator-piping',
    name: 'Radiator Piping and Valves Manufacturing', name_zh: '散热器管路与阀制造',
    produces: [{ item: 'plant/radiator/piping', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] }],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 支架。薄板与型钢焊成，按风载设计 —— 火星的风压只有地球的 1%。 */
    id: 'make/radiator-support',
    name: 'Radiator Support and Foundation Manufacturing', name_zh: '散热器支架与基础制造',
    produces: [{ item: 'plant/radiator/support', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] }],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
];

/**
 * 辐射散热器 —— **集中的一种做法**。另一种长在零件上。
 *
 * 现在数据里有两种热汇，而且真实设计只会选一种：
 *
 *   集中的      本台，一万平方米的板子铺在一处，氨回路统一循环。
 *               挂在高温度路线的 `needs` 上，意思是"没有它就不许开炉"。
 *   分布的      零件自带的冷却套：熔炼炉的感应圈水冷、电解槽的冷却盘管、
 *               铝槽壳的水套。**热走到哪，冷却套就长在哪个零件上。**
 *
 * 为什么写出两种？因为它们是两个真实的设计选择，而模型只能表达"有/没有"，
 * 表达不了"哪一个更好"。写两种，至少让"要选"这件事显形。
 *
 * 分布式的那个做法还顺带解决了一个模型难题：冷却套是一个零件
 * （`plant/melting-furnace/coil-cooling`），于是它的**数量**可以写在
 * `composedOf` 的 `qty` 里 —— 用模型已有的字段，不必给 `Route` 加热流字段。
 *
 * 但两种都追不了"面积"。一万平方米的板子，仍然是这个体系里唯一以
 * "面积"而不是"质量"论的东西，而模型只记件数不记面积。
 */
export const RADIATOR: Item = {
  id: 'plant/radiator',
  name: 'Radiator', name_zh: '散热器',
  unit: '套',
  category: 'machine',
  composedOf: [...RADIATOR_PARTS.map((p) => ({ item: p.id, qty: q(1) })), { item: 'std/motor-7.5kw-4p', qty: q(1) }],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...RADIATOR_PARTS, RADIATOR];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/radiator',
    name: 'Radiator Assembly', name_zh: '散热器装配',
    produces: [{
      item: 'plant/radiator',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...RADIATOR_ROUTES, ...ASSEMBLY_ROUTES];
