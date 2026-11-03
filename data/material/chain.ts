/**
 * 材料链 —— 从风化层与水到铸铁、钢、薄板。
 *
 * 遍历的第三层。上一层停在六种材料和四台设备，这一层把材料那一半接下去：
 *
 *   mars/regolith   →（磁选）→  精矿  →（氢还原 973 K）→ 海绵铁 ─┐
 *   mars/water-ice  →（升华）→  水    →（电解）→ 氢 ────────────┤
 *                                                              ↓
 *                                    海绵铁 + 石灰 →（熔炼除渣）→ 铁 ─┐
 *                                                                   ↓
 *                                            铸铁 / 45 钢 / 40Cr / 冷轧薄板
 *
 * ═══════════════════════════════════════════════════════════════════
 * 每一条路线都从化学计量算出来，不是估的
 * ═══════════════════════════════════════════════════════════════════
 *
 *   风化层总铁 14%（区间 1.3–1.5 之半），精矿 65% Fe
 *     1000 × 0.65 / 0.14 = 4643 kg 风化层
 *
 *   Fe₂O₃ + 3H₂ → 2Fe + 3H₂O，按 1000 kg 精矿（65% Fe）算
 *     铁     650                          精矿里的铁全部留下
 *     结合氧 650 × 48 / 112 = 279         Fe₂O₃ 里 112 kg 铁带 48 kg 氧
 *     脉石   1000 − 650 − 279 = 71
 *     氢     650 × (3×2.016) / (2×55.85) = 35
 *     水汽   279 + 35 = 314
 *     海绵铁 650 + 71 = 721
 *
 *   海绵铁熔炼除渣：721 海绵铁 + 48 石灰 → 650 铁 + 119 炉渣
 *     那 71 kg 脉石必须先掉出去，否则它跟着配料一路进钢里 ——
 *     而铸铁与钢的配方只写"铁 + 碳"，掺进去的渣谁也看不出来。
 *
 *   2H₂O → 2H₂ + O₂，1000 kg 氢
 *     水     1000 × 18.015 / 2.016 = 8936
 *     氧     1000 × 15.999 / 2.016 = 7936
 *
 *   铸铁与钢的差别只在含碳量与合金元素，按牌号的名义成分算：
 *     HT300  C 3.2%   铁 968 + 碳 32
 *     HT250  C 3.0%   铁 970 + 碳 30
 *     HT200  C 3.4%   铁 966 + 碳 34
 *     45 钢   C 0.45%  铁 995.5 + 碳 4.5
 *     40Cr   C 0.40% + Cr 0.9%   铁 982 + 碳 4 + 铬铁 14
 *     冷轧板  C 0.08%  铁 999.2 + 碳 0.8
 *
 * ═══════════════════════════════════════════════════════════════════
 * 缺口：三条，各自写在下面对应路线的注释里
 * ═══════════════════════════════════════════════════════════════════
 *
 *   造渣熔剂   铜吹炼要硅石（FeO 的酸性熔剂），"硅石"这条还没建 ——
 *              铜那一层按"不进熔剂"算平衡，炉渣因此只计 FeO 与脉石。
 *              铁熔炼用的是石灰，已经有了（石膏热分解的副产）。
 *   炼钢吹氧   这里走的是"铁 + 碳"，没有脱碳，也就没有转炉吹氧。
 *              氧的销路目前只有铜吹炼与制酸两条。
 *   氯与氢链   PTFE 的真实路线要 CHCl₃／HCFC-22，氯来自高氯酸盐、氢来自水。
 *              现在只按元素算净投入，中间体整段未展开。
 */

import type { Description, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const MATERIALS: Description = {
  items: [
    // ═══ 中间物料 ═══

    /**
     * 干冰。CO₂ 压缩到 1–1.5 MPa 再膨胀，温度掉到 −78.5 °C，雪状固体压成块。
     *
     * **本层唯一的低温源。** 量块的冷处理要在 −80 °C 保温，为的是把残余奥氏体
     * 转成马氏体 —— 不转，那些奥氏体会在几个月里慢慢变，量块的尺寸就自己走，
     * 量块就白磨了。
     *
     * 工业上用液氮（−196）或干冰（−78.5）。液氮要空气分离塔精馏，本层没有；
     * 干冰只要 CO₂ 与一台压缩机 —— 而 CO₂ 是本层最便宜的东西。
     *
     * 所以低温在这套体系里不缺：**缺的只是保温的容器**（干冰升腾得快，
     * 要用敞口保温箱，边用边补）。
     */
    { id: 'mat/dry-ice', name: '干冰', unit: 'kg', category: 'material' },

    /** 水。冰升华冷凝而来，一切湿法化学与电解的入口。 */
    { id: 'mat/water', name: '水', unit: 'kg', category: 'material',
    props: [{ param: 'conductivity', kind: 'range', min: 0.05, max: 1000, unit: 'µS/cm' }] },

    /** 氢。电解水得来，是火星上唯一能大规模拿到的还原剂 —— 没有氢，氧化物还原不了。 */
    { id: 'mat/hydrogen', name: '氢', unit: 'kg', category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 99, max: 99.999, unit: '%', dir: 'atLeast' }] },

    /** 氧。电解水的副产，量很大（每吨氢出 7.9 吨氧）。炼钢、生保、推进剂都要。 */
    { id: 'mat/oxygen', name: '氧', unit: 'kg', category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 90, max: 99.5, unit: '%' }] },

    /** 铁精矿。风化层磁选富集，65% Fe。冶金入口 —— 钛铁矿与磁铁矿都能被磁选带走。 */
    { id: 'mat/iron-concentrate', name: '铁精矿', unit: 'kg', category: 'material' },

    /**
     * 海绵铁。氢直接还原的产物，多孔、含氧低，电炉炼钢的洁净原料。
     *
     * 900 °C 的固相还原拿不到纯净金属：铁被还原出来了，脉石还在里面。
     * 1000 kg 精矿里有 71 kg 脉石，所以海绵铁只有 90% 是铁 ——
     * 那 71 kg 必须在熔炼时造渣除掉，不能带着进钢。
     */
    { id: 'mat/sponge-iron', name: '海绵铁', unit: 'kg', category: 'material' },

    /**
     * 铁。海绵铁熔炼、除渣之后的金属铁，含碳 < 0.1%。
     *
     * **铸铁与钢的配料从它起算，不从海绵铁起算。** 海绵铁里那 9% 的脉石
     * 在这里变成炉渣；之后加多少碳，就是什么牌号 —— 铁与碳分开计，
     * 成分才核得出来。混在一起算时，配方里写的"铁 968"其实是带渣的海绵铁。
     */
    { id: 'mat/iron', name: '铁', unit: 'kg', category: 'material' },

    /**
     * 尾矿。磁选剩下的硅酸盐与辉石，占进料的四分之三还不止。
     *
     * 不是废物：它是硅、铝、镁、钙的来源，玻璃、陶瓷、耐火材料、水泥都从这里走。
     * 但在这条链上它暂时没有下游 —— 遍历会把它报出来。
     */
    { id: 'mat/tailings', name: '尾矿', unit: 'kg', category: 'material' },

    /**
     * 水蒸气。氢还原铁时，氢把铁从氧里夺过来，自己变成水。
     *
     * ⚠️ **回收路线还没写**：水蒸气 → 水 → 电解 → 氢这一环目前是断的，
     * 所以还原段是净耗氢，不是闭环。碳那一条（Bosch）反而是闭的 ——
     * 它产出的就是液态水，直接回电解槽。
     */
    { id: 'mat/water-vapor', name: '水蒸气', unit: 'kg', category: 'material' },

    /**
     * 碳。铸铁与钢的合金元素，也是还原剂。
     *
     * 火星没有煤，碳只能从大气里那 95% 的二氧化碳来：
     * CO₂ + 2H₂ → C + 2H₂O（Bosch 反应）。氢从电解水来，反应又还回水 —— 这个环是闭的。
     */
    { id: 'mat/carbon', name: '碳', unit: 'kg', category: 'material',
    props: [{ param: 'ash', kind: 'range', min: 0.5, max: 20, unit: '%' }] },

    /** 二氧化碳。从大气里分离出来的纯 CO₂，碳的唯一来源。 */
    { id: 'mat/co2', name: '二氧化碳', unit: 'kg', category: 'material' },

    /** 氮氩混合气。分离 CO₂ 剩下的部分。焊接保护、气氛退火、惰性覆盖都要它。 */
    { id: 'mat/inert-gas', name: '氮氩混合气', unit: 'kg', category: 'material' },

    /**
     * 铬铁。40Cr 里那 0.9% 的铬由它带入。
     *
     * 铬是合金钢那一侧真正的瓶颈：风化层 Cr₂O₃ 只有 0.3%，而进矿热炉要 42% 的
     * 铬铁矿精矿 —— 富集比 **140 : 1**。一吨铬铁要挖三百多吨土。
     */
    { id: 'mat/ferrochrome', name: '铬铁', unit: 'kg', category: 'material' },

    /** 铬铁矿精矿。Cr₂O₃ 42%，从风化层里重选富集一百四十倍得来。 */
    { id: 'mat/chromite-concentrate', name: '铬铁矿精矿', unit: 'kg', category: 'material' },

    /** 一氧化碳。矿热炉与还原炉的尾气，可燃 —— 可以回炉当燃料。 */
    { id: 'mat/co', name: '一氧化碳', unit: 'kg', category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 30, max: 99, unit: '%', dir: 'atLeast' }] },

    /** 炉渣。矿热炉里没被还原的脉石，水淬后能当骨料或矿棉原料。 */
    { id: 'mat/slag', name: '炉渣', unit: 'kg', category: 'material' },

    /**
     * 石灰。CaO，石膏热分解的副产（326 kg/1000 kg）。
     *
     * 用途只有一个：造渣的碱性熔剂。酸性脉石（SiO₂）靠它变成流动的渣，
     * 渣不流动，脉石就分不出去。它自己不能当"渣"记 —— 那会把熔剂和废物
     * 混成一个条目，于是"造渣到底加了什么"就再也查不出来了。
     */
    { id: 'mat/lime', name: '石灰', unit: 'kg', category: 'material' },

    /**
     * 耐火材料。高铝砖、莫来石、打结料 —— 从尾矿里的 Al₂O₃ 与 SiO₂ 来。
     *
     * 它是"装得住高温"的前提：没有它，熔炼炉只是一个铁壳子。
     */
    { id: 'mat/refractory', name: '耐火材料', unit: 'kg', category: 'material',
    // 窑 1500 的火配 1300 的砖，曾在两处同时出现而没人发现。
    props: [
      { param: 'grade', kind: 'enum', values: ['clay', 'high-alumina', 'silica', 'corundum'] },
      { param: 'serviceTemp', kind: 'range', min: 1000, max: 1800, unit: '°C', dir: 'atLeast' },
      { param: 'loadSoften', kind: 'range', min: 1200, max: 1700, unit: '°C', dir: 'atLeast' },
    ] },

    /**
     * 铜。感应线圈、电缆、母线、电极。
     *
     * 火星风化层里铜约 30 ppm —— 0.003%。选到 25% 的铜精矿要富集八千倍，
     * 也就是说：**一吨铜要挖三万多吨土**。数字写在下面那条路线上，
     * 它能造，但代价让"本地造铜"这件事基本不成立。
     */
    { id: 'mat/copper', name: '铜', unit: 'kg', category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 97, max: 99.99, unit: '%' }] },

    /** 铜精矿。25% Cu，从风化层里浮选富集而来。 */
    { id: 'mat/copper-concentrate', name: '铜精矿', unit: 'kg', category: 'material' },

    /** 粗铜。98% Cu 的泡铜，火法熔炼加吹炼得来。 */
    { id: 'mat/blister-copper', name: '粗铜', unit: 'kg', category: 'material' },

    /** 阳极泥。电解精炼的沉渣，金银铂族都在里面 —— 铜冶炼的副产品来源。 */
    { id: 'mat/anode-sludge', name: '阳极泥', unit: 'kg', category: 'material' },

    /**
     * 二氧化硫。硫酸盐焙烧与铜吹炼的含硫气体 —— 火星上所有的硫都从这里变酸。
     *
     * 两个来源：石膏热分解出 372 kg/1000 kg，铜精矿吹炼出 504 kg/1000 kg。
     * 它自己只有一个下游：接触法制酸。
     */
    { id: 'mat/so2', name: '二氧化硫', unit: 'kg', category: 'material' },

    /**
     * 硫酸。电解精炼的电解液、磷肥与氢氟酸的原料。火星硫极富裕，
     * 但硫全在硫酸盐里，要先焙烧成 SO₂ 才拿得到酸。
     */
    { id: 'mat/sulfuric-acid', name: '硫酸', unit: 'kg', category: 'material',
    // 98 % 与 30–50 % 是两种酸，同一个 id。值只在路线上，条目只声明"有浓度"。
    props: [{ param: 'concentration', kind: 'range', min: 0, max: 100, unit: '%' }] },

    /**
     * 镍。电解槽电极的镀层、不锈钢的合金元素、高温合金的骨架。
     *
     * 风化层里镍约 400 ppm，富集到 10% 要 250 : 1 —— 比铜可行，仍是硬骨头。
     */
    { id: 'mat/nickel', name: '镍', unit: 'kg', category: 'material' },

    /** 镍精矿。10% Ni，从风化层浮选富集二百五十倍。 */
    { id: 'mat/nickel-concentrate', name: '镍精矿', unit: 'kg', category: 'material' },

    /** 镍铁。25% Ni 的铁镍合金，矿热炉还原出来，再电解精炼。 */
    { id: 'mat/ferronickel', name: '镍铁', unit: 'kg', category: 'material' },

    /**
     * 聚四氟乙烯。电解槽隔膜、管道衬里、密封、绝缘。
     *
     * 要氟。火星没有发现萤石，土壤氟只有几十 ppm —— 但**氟在磷灰石里**：
     * Ca₅(PO₄)₃F 含氟 3.8%，磷酸盐那一行写着它。这是唯一的路。
     *
     * `frictionCoefficient` 是它最常被问的那个数：对钢干摩擦 0.04–0.10
     * （全表最低的一档固体）。机器人线缆拖链的衬套、减速器干膜的粘结剂
     * 都按这个数用 —— 见 `make/robot-harness` 那处 `need ≤0.12`。
     */
    {
      id: 'mat/ptfe',
      name: '聚四氟乙烯',
      unit: 'kg',
      category: 'material',
      props: [{ param: 'frictionCoefficient', kind: 'range', min: 0.04, max: 0.10, unit: '无量纲', dir: 'atMost' }],
    },

    /** 磷灰石精矿。P₂O₅ 30%，氟随它一起富集 —— 氟的唯一工业来源。 */
    { id: 'mat/apatite-concentrate', name: '磷灰石精矿', unit: 'kg', category: 'material' },

    /** 氢氟酸。磷灰石加硫酸蒸出来，氟化学的总入口。 */
    { id: 'mat/hf', name: '氢氟酸', unit: 'kg', category: 'material',
    props: [{ param: 'concentration', kind: 'range', min: 30, max: 70, unit: '%' }] },

    // 电子元件不在这里 —— 半导体链已定死永久外购，它是种子，
    // 见 data/material/electronics.ts 的四类。全厂每台设备都要电源与控制，
    // 而这一项在火星上永远不造。

    // ═══ 合金 ═══

    /**
     * 不锈钢，18/8。铬 18%、镍 8%、铁 74%。
     *
     * 两个"唯一"让它不可替代：**唯一非磁性**（磁选滚筒的套筒用它，用普通钢
     * 会让滚筒自己变成吸铁石），**唯一够耐蚀**（分离罐、Bosch 壳体、稀酸
     * 容器用它，碳钢几个月就烂穿）。
     *
     * 代价是它是两种稀缺金属的合金：铬 140:1、镍 250:1 的富集比叠在一起，
     * 一吨不锈钢背后是三百多吨土。所以它在本层不是大宗材料，是"必须用它"
     * 的那几个零件才用。浓酸仍要 PTFE 衬里 —— 不锈钢到不了那一步。
     */
    { id: 'mat/stainless-steel', name: '不锈钢', unit: 'kg', category: 'material',
    // 304 与 316L 的钼差 3 倍；以前模型分不开，只能一笔带过。
    props: [{ param: 'grade', kind: 'enum', values: ['304', '316L', '430'] }, { param: 'ni', kind: 'range', min: 0, max: 15, unit: '%' }] },
  ],

  routes: [
    // ═══ 从行星地板开始 ═══

    {
      /** 冰 → 水。300–500 K 升华，再在冷阱上凝。这一步最简单，也最先要通。 */
      id: 'make/water',
      name: '冰制备',
      produces: [{ item: 'mat/water', qty: q(1000), gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }] }],
      uses: [{ anyOf: [{ item: 'mars/water-ice', qty: q(1000) }] }],
      needs: [],
      performedBy: 'plant/sublimator',
      under: [{ param: 'temperature', min: 300, max: 500 }],
    },
    {
      /** 2H₂O → 2H₂ + O₂。1000 kg 氢要 8936 kg 水，同时出 7936 kg 氧。 */
      id: 'make/hydrogen',
      name: '氢制备',
      produces: [
        { item: 'mat/hydrogen', qty: q(1000), gives: [{ param: 'purity', kind: 'range', min: 99, max: 99.5, dir: 'atLeast' }] },
        { item: 'mat/oxygen', qty: q(7936), gives: [{ param: 'purity', kind: 'range', min: 90, max: 99, dir: 'atLeast' }] },
      ],
      uses: [{ anyOf: [{ item: 'mat/water', qty: q(8936) }] }],
      needs: [],
      performedBy: 'plant/electrolyzer',
      // 水电解要在液相处做，而 610 Pa 下水在 0.01 °C 就沸腾 —— 电解槽必须是压力容器。
      under: [{ param: 'pressure', min: 50, max: 500 }],
    },
    {
      /**
       * 氢纯化。**这一条是被属性系统逼出来的第四条路线。**
       *
       * 给氢声明 purity 之后，两处要求当场报 `prop_unfilled`：
       *
       *   make/ammonia      要 99.5 % 以上 —— 哈伯法怕氧，氧是催化剂毒
       *   make/polysilicon  要 99.999 %   —— 西门子法，半导体级
       *
       * 而模型里**八条产氢路线全都只给 99–99.5 %**（都是电解）。
       * 也就是说：合成氨与多晶硅这两条链，一直在吃纯度不够的氢，
       * 而没有任何地方说过"氢要怎么提纯"。这和"稀酸无处可来"是同一类洞。
       *
       * 手法照抄扩散炉气路那一套（unblock-gas-purifier.ts）：铜屑床除氧 →
       * 石灰干燥 → 分子筛 → 冷阱。区别只在规模：这里是每小时几十公斤的氢。
       *
       * 1000 kg 99.5 % 的氢 → 1000 kg 99.99 % 以上；杂质（0.5 % 的氧与水）
       * 被铜床与石灰吃掉，增重记在 unbalanced 里。
       */
      id: 'make/hydrogen-purified',
      name: '氢纯化',
      produces: [
        {
          item: 'mat/hydrogen',
          qty: q(1000),
          gives: [{ param: 'purity', kind: 'range', min: 99.999, dir: 'atLeast' }],
        },
      ],
      uses: [
        {
          anyOf: [
            {
              item: 'mat/hydrogen',
              qty: q(1005),
              need: [{ param: 'purity', kind: 'range', min: 99, max: 99.5, dir: 'atLeast' }],
              onRelax: 'functional-kept',
            },
          ],
        },
        { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
        { anyOf: [{ item: 'mat/lime', qty: q(6) }] },
      ],
      needs: [],
      performedBy: 'plant/resistance-furnace',
      under: [{ param: 'temperature', min: 200, max: 350 }],
      unbalanced_zh: '1005 kg 99.5 % 氢 → 1000 kg 99.99 % 以上；余 5 kg 是氧与水，被铜床与石灰吃掉',
    },
    {
      /** 风化层磁选。1000 kg 精矿要 4643 kg 风化层 —— 富集比 4.6 : 1，其余是尾矿。 */
      id: 'make/iron-concentrate',
      name: '风化层磁选制备',
      produces: [
        { item: 'mat/iron-concentrate', qty: q(1000) },
        { item: 'mat/tailings', qty: q(3643) },
      ],
      uses: [{ anyOf: [{ item: 'mars/regolith', qty: q(4643) }] }],
      needs: [],
      performedBy: 'plant/magnetic-separator',
    },
    {
      /**
       * 冷凝：水蒸气 → 水。1000 → 1000，只是把热拿走。
       *
       * 这一步存在的唯一理由是**把氢的环闭上**。FeO + H₂ ⇌ Fe + H₂O 是可逆的：
       * 700 °C 平衡 H₂O/H₂ ≈ 0.35，单程最多转化 26–31%，所以氢必须除水后循环。
       * 不回收水蒸气，还原段就是净耗氢 —— 而"产物是水，可循环"并不可行。
       *
       * 执行设备用升华井：它本来就带冷阱（那把水从气里凝出来的东西）。
       * 不填 `under`：冷凝靠冷面，不是靠把某个温度维持住。
       */
      id: 'make/condensate',
      name: '冷凝制备',
      produces: [{ item: 'mat/water', qty: q(1000), gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }] }],
      uses: [{ anyOf: [{ item: 'mat/water-vapor', qty: q(1000) }] }],
      needs: [],
      performedBy: 'plant/sublimator',
    },
    {
      /**
       * Fe₂O₃ + 3H₂ → 2Fe + 3H₂O，973 K。
       *
       * 按 1000 kg 精矿（65% Fe）算，见文件头的算式：
       *   进 1000 精矿 + 35 氢 = 1035
       *   出 721 海绵铁 + 314 水汽 = 1035
       *
       * 水汽 314 是按"279 kg 结合氧 + 35 kg 氢"算出来的，不是拿总量减出来的。
       * 减出来的数会把任何一处笔误都吸进"水汽"里，质量账照样平 —— 上一版
       * 就是这么写的 465，比化学计量多了 20 kg，而校验一声没响。
       */
      id: 'make/sponge-iron',
      name: '海绵铁制备',
      produces: [
        { item: 'mat/sponge-iron', qty: q(721) },
        { item: 'mat/water-vapor', qty: q(314) },
      ],
      uses: [
        { anyOf: [{ item: 'mat/iron-concentrate', qty: q(1000) }] },
        { anyOf: [{ item: 'mat/hydrogen', qty: q(35) }] },
      ],
      needs: [],
      performedBy: 'plant/reduction-furnace',
      under: [{ param: 'temperature', min: 700, max: 850 }],
    },
    {
      /**
       * 海绵铁熔炼除渣。721 海绵铁 + 48 石灰 → 650 铁 + 119 炉渣。
       *
       * 这一步只做一件事：把脉石从铁里分出去。还原炉出的是固相海绵铁，
       * 脉石和铁还混在一起；熔成铁水，脉石上浮成渣，铁才是铁。
       *
       * 石灰量是算的：脉石 71 kg 里 SiO₂ 占 45%（风化层那一行的 44–46%）＝ 32 kg，
       * 取渣碱度 CaO/SiO₂ = 1.5（钢渣常用值），于是 CaO = 48 kg。
       * 进 721 + 48 = 769，出 650 + 119 = 769。
       *
       * 没有这一步，那 71 kg 脉石会跟着配料一路进到床身里。按牌号配料时
       * 谁也看不出来 —— 配方上写的是"铁 968 + 碳 32"，而那 968 里有 9% 是渣。
       *
       * 1550–1650 °C：铁的熔点是 1538 °C，低于它的炉子化不开铁。
       */
      id: 'make/iron',
      name: '海绵铁熔炼除渣制备',
      // 化铁要炉温均匀：不均匀就出白口、出气孔。要求写在设备上（A2 精度继承）。
      produces: [
        { item: 'mat/iron', qty: q(650) },
        { item: 'mat/slag', qty: q(119) },
      ],
      uses: [
        { anyOf: [{ item: 'mat/sponge-iron', qty: q(721) }] },
        { anyOf: [{ item: 'mat/lime', qty: q(48) }] },
      ],
      // ⚠️ 原来写的是 needs: ['plant/radiator'] —— 那会形成"制铁要散热器、散热器要铁"
      // 的死环。改法不是放宽判据，是把需求写准：
      //
      //   小批量（一炉几百公斤）  热靠地面导热与炉衬蓄热带走 —— 埋管的土坑就是散热器
      //   连续生产（几吨每小时）  才必须上风冷散热器
      //
      // 这个模型就是"小批量起步"，所以先不写散热器；等产量上来那道关，散热器早造出来了。
      needs: [{ item: 'plant/melting-furnace', qty: q(1), need: [{ param: 'uniformity', kind: 'range', max: 10, dir: 'atMost' }], onRelax: 'functional-kept' }],
      performedBy: 'plant/melting-furnace',
      under: [{ param: 'temperature', min: 1550, max: 1650 }],
    },

    // ═══ 碳：从大气到固体碳 ═══

    {
      /**
       * 大气分离。1037 kg 大气出 1000 kg CO₂ + 37 kg 氮氩。
       *
       * 96.4% 是**质量分数**：CO₂ 占 95.1% 体积，乘上 44.01 的分子量之后
       * 才占到 96.4% 的质量。1000 / 0.964 = 1037，余下 37 kg 是 N₂ + Ar + O₂ + CO。
       * 按体积分数直接当质量分数取，会得到 1019 / 19 这一对数 —— 那是把
       * 两个刻度混在一起。
       */
      id: 'make/co2',
      name: '大气分离',
      produces: [
        { item: 'mat/co2', qty: q(1000) },
        { item: 'mat/inert-gas', qty: q(37) },
      ],
      uses: [{ anyOf: [{ item: 'mars/atmosphere', qty: q(1037) }] }],
      needs: [],
      performedBy: 'plant/air-separator',
    },
    {
      /**
       * CO₂ + 2H₂ → C + 2H₂O，600 °C。1000 kg 碳要 CO₂ 3664 + 氢 336，出 3000 kg 水。
       *
       * 水回收去电解，氢就闭了环 —— 这条路上真正被消耗掉的只有大气里的碳。
       */
      id: 'make/carbon',
      name: '碳制备',
      produces: [
        { item: 'mat/carbon', qty: q(1000), gives: [{ param: 'ash', kind: 'range', min: 2, max: 15 }] },
        { item: 'mat/water', qty: q(3000), gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }] },
      ],
      uses: [
        { anyOf: [{ item: 'mat/co2', qty: q(3664) }] },
        { anyOf: [{ item: 'mat/hydrogen', qty: q(336) }] },
      ],
      needs: [],
      performedBy: 'plant/bosch-reactor',
      under: [{ param: 'temperature', min: 500, max: 700 }],
    },
    {
      /**
       * 变换反应：CO + H₂O → CO₂ + H₂，350–450 °C，Fe₃O₄/Cr₂O₃ 催化。
       *
       *   1000 一氧化碳 + 643 水 → 1571 二氧化碳 + 72 氢
       *
       * **它把两处废气变成了氢。** 铬铁（700 kg/1000 kg 铬铁）与硅铁
       * （898 kg/1000 kg 硅铁）的碳热还原都放一氧化碳，而在这条路线之前
       * 那些 CO 是废气。
       *
       * 工业上叫"变换"，本来是为了调合成气比例；在这里它更直白 ——
       * **氢是这套体系里最贵的东西**（每公斤要 8.9 kg 水去电解），
       * 而任何含 CO 的尾气都还能再榨出一点氢。
       *
       * 放热（ΔH = −41 kJ/mol），那点热最后也要从辐射板走。
       */
      id: 'make/water-gas-shift',
      name: '变换反应制备',
      produces: [
        { item: 'mat/co2', qty: q(1571) },
        { item: 'mat/hydrogen', qty: q(72), gives: [{ param: 'purity', kind: 'range', min: 99, max: 99.5, dir: 'atLeast' }] },
      ],
      uses: [
        { anyOf: [{ item: 'mat/co', qty: q(1000) }] },
        { anyOf: [{ item: 'mat/water', qty: q(643) }] },
      ],
      needs: [],
      performedBy: 'plant/bosch-reactor',
      under: [{ param: 'temperature', min: 350, max: 450 }],
    },

    {
      /**
       * 干冰：CO₂ 压到 10 MPa 再膨胀到常压，节流后一部分凝成雪，压块。
       *
       *   1000 CO₂ → 1000 干冰
       *
       * 质量不变（只是相变），但**它会在几小时内升华掉** —— 所以不是库存品，
       * 是用的时候现做。这也是为什么它只能当"工序的输入"，不能当"备件"。
       *
       * 压力 10–15 MPa：与高压釜的区间（10–35）正好搭上。温度不写 ——
       * 干冰是在常温下做的，冷是膨胀产生的，不是外面给的。
       */
      id: 'make/dry-ice',
      name: '干冰制备',
      produces: [{ item: 'mat/dry-ice', qty: q(1000) }],
      uses: [{ anyOf: [{ item: 'mat/co2', qty: q(1000) }] }],
      needs: [],
      performedBy: 'plant/autoclave',
      under: [{ param: 'pressure', min: 10000, max: 15000 }],
    },
    // ═══ 耐火材料：装得住高温的东西 ═══

    {
      /**
       * 尾矿烧耐火砖。尾矿里 Al₂O₃ 约 9%、SiO₂ 约 45%，正是高铝砖与莫来石的料。
       *
       * 富集比是算出来的，不是估的：尾矿 Al₂O₃ 9%，高铝砖要 45%，就是
       * 0.45 / 0.09 = 5 : 1 —— 5000 kg 尾矿里那 450 kg 铝质料，做成 1000 kg 砖。
       * 余下 4000 kg 是选矿尾砂与烧失。
       */
      id: 'make/refractory',
      name: '尾矿烧耐火砖制备',
      produces: [
        { item: 'mat/refractory', qty: q(1000), gives: [
          { param: 'grade', kind: 'enum', oneOf: ['high-alumina'] },
          { param: 'serviceTemp', kind: 'range', min: 1500, dir: 'atLeast' },
          { param: 'loadSoften', kind: 'range', min: 1450, dir: 'atLeast' },
        ] },
        { item: 'mat/tailings', qty: q(4000) },
      ],
      uses: [{ anyOf: [{ item: 'mat/tailings', qty: q(5000) }] }],
      needs: ['plant/radiator'],
      performedBy: 'plant/kiln',
      under: [{ param: 'temperature', min: 1300, max: 1600 }],
      unbalanced_zh:
        '尾矿 Al₂O₃ 9% 富集到 45%，比 5 : 1：5000 kg 尾矿取 1000 kg 铝质料 + 尾砂 4000（已单列 mat/tailings）',
    },

    {
      /**
       * 高硅砖。**这一条是被属性系统逼出来的第二条路线。**
       *
       * 给 `mat/refractory` 声明 grade 之后才看清一件事：
       * 高硅砖在本层**只作为"某台炉子的内衬零件"存在**（`make/htf-lining-brick`，
       * 见 unblock-htf-lining.ts），从来没有作为**材料**存在。
       * 于是所有"要一层耐 1500 度的砖"的地方都够不到 —— `make/kiln-lining`
       * 当场报 `prop_unfilled`：窑的火到了 1500，砖只到 1350–1500。
       *
       * 工艺上它早就成立（同一份文件里写过：硅石 97% + 石灰 2% + 水，
       * 钢模捣打，窑里 1400 烧成，荷重软化 1500–1600）。缺的只是"把它做成材料"。
       *
       * 配比照那一份：硅石 1000 + 石灰 21 + 水 60 → 高硅砖 1000（烧失与残渣 81）。
       */
      id: 'make/silica-brick',
      name: '高硅砖制备',
      produces: [
        { item: 'mat/refractory', qty: q(1000), gives: [
          { param: 'grade', kind: 'enum', oneOf: ['silica'] },
          { param: 'serviceTemp', kind: 'range', min: 1650, dir: 'atLeast' },
          { param: 'loadSoften', kind: 'range', min: 1600, dir: 'atLeast' },
        ] },
      ],
      uses: [
        { anyOf: [{ item: 'mat/silica', qty: q(1000) }] },
        { anyOf: [{ item: 'mat/lime', qty: q(21) }] },
        { anyOf: [{ item: 'mat/water', qty: q(60) }] },
      ],
      needs: ['plant/press'],
      performedBy: 'plant/brick-kiln',
      under: [{ param: 'temperature', min: 1380, max: 1450 }],
      unbalanced_zh: '硅石 1000 + 石灰 21 + 水 60 → 砖 1000；余 81 是烧失与残渣',
    },

    {
      /**
       * 刚玉质耐火料（corundum 档）：96 % 氧化铝 + 0.5 % MgO。
       *
       * 这一条补的是 `data/material/chip-passives.ts` 问二点名的缺口：`mat/refractory`
       * 声明了 clay / high-alumina / silica / corundum 四档，而现有三条路线只交付前
       * 三档。`make/alumina-substrate` 的 `need: grade ∈ {corundum}` 因此一直
       * 报 `prop_unfilled`。45 % 的高铝砖料烧到底也只是莫来石 + 玻璃相，最多
       * 88–92 %，到不了 96 %（chip-passives.ts 第 56–65 行）。
       *
       * 配料按 1000 kg 成品算：
       *   995 氧化铝（`make/alumina` 给 95–99 %，aluminium.ts:83）+ 5 氧化镁 = 1000
       *   5 / 1000 = 0.5 % MgO —— chip-passives.ts 问二给的助烧剂比例（抑制晶粒长大）。
       *   995 × 95–99 % = 945–985 kg Al₂O₃，即成品 94.5–98.5 %；96 % 落在这个窗口里，
       *   所以没有另加富集或除杂的步骤 —— 牌号靠 `mat/alumina` 的来料窗口保证。
       *
       * 烧成 1500–1600：`plant/high-temp-furnace` hold 1100–1600，本条压在上限；
       * 同一温区在 ceramic.ts 的刚玉瓷（1500–1600）与 make/alumina-substrate
       * （1500–1600）里各写了一次。
       *
       * ⚠️ 耐温窗口只写到 1600：这是本条与 make/alumina-substrate 的烧成上限，
       * 也是 `plant/high-temp-furnace` 的上限；0.2 MPa 荷重软化点没有实测数据，
       * 只声明“不低于 1600”（高温炉的刚玉质炉衬就在 1600 工作面上用）。
       * 不写 1800 —— 那是 high-temp-furnace.ts 炉衬注释里的耐火度，
       * 不是这档 96 % 料的服务温度，不能拿来当窗口。
       */
      id: 'make/corundum-refractory',
      name: '刚玉质耐火料制备',
      produces: [
        { item: 'mat/refractory', qty: q(1000), gives: [
          { param: 'grade', kind: 'enum', oneOf: ['corundum'] },
          { param: 'serviceTemp', kind: 'range', min: 1600, dir: 'atLeast' },
          { param: 'loadSoften', kind: 'range', min: 1600, dir: 'atLeast' },
        ] },
      ],
      uses: [
        { anyOf: [{ item: 'mat/alumina', qty: q(995) }] },
        { anyOf: [{ item: 'mat/magnesia', qty: q(5) }] },
      ],
      needs: [],
      performedBy: 'plant/high-temp-furnace',
      under: [{ param: 'temperature', min: 1500, max: 1600 }],
    },

    // ═══ 铁 → 铸铁与钢 ═══

    {
      /** HT300 灰铸铁。C 3.2%：铁 968 + 碳 32。片状石墨吸振，床身的传统材料。 */
      id: 'make/iron-ht300',
      name: 'HT300 灰铸铁制备',
      produces: [{ item: 'mat/iron-ht300', qty: q(1000) }],
      uses: [
        { anyOf: [{ item: 'mat/iron', qty: q(968) }] },
        { anyOf: [{ item: 'mat/carbon', qty: q(32) }] },
      ],
      needs: [],
      performedBy: 'plant/melting-furnace',
      under: [{ param: 'temperature', min: 1350, max: 1450 }],
    },
    {
      /** HT250 灰铸铁。C 3.0%：铁 970 + 碳 30。尾座与溜板。 */
      id: 'make/iron-ht250',
      name: 'HT250 灰铸铁制备',
      produces: [{ item: 'mat/iron-ht250', qty: q(1000) }],
      uses: [
        { anyOf: [{ item: 'mat/iron', qty: q(970) }] },
        { anyOf: [{ item: 'mat/carbon', qty: q(30) }] },
      ],
      needs: [],
      performedBy: 'plant/melting-furnace',
      under: [{ param: 'temperature', min: 1350, max: 1450 }],
    },
    {
      /** HT200 灰铸铁。C 3.4%：铁 966 + 碳 34。进给箱箱体。 */
      id: 'make/iron-ht200',
      name: 'HT200 灰铸铁制备',
      produces: [{ item: 'mat/iron-ht200', qty: q(1000) }],
      uses: [
        { anyOf: [{ item: 'mat/iron', qty: q(966) }] },
        { anyOf: [{ item: 'mat/carbon', qty: q(34) }] },
      ],
      needs: [],
      performedBy: 'plant/melting-furnace',
      under: [{ param: 'temperature', min: 1350, max: 1450 }],
    },
    {
      /** 45 号钢。C 0.45%：铁 995.5 + 碳 4.5。刀架、丝杠这类要淬硬又要韧的件。 */
      id: 'make/steel-45',
      name: '45 号优质碳素结构钢制备',
      produces: [{ item: 'mat/steel-45', qty: q(1000), gives: [{ param: 'hardness', kind: 'range', min: 150, max: 300 }, { param: 'temper', kind: 'enum', oneOf: ['as-rolled', 'normalized', 'quenched', 'tempered'] }] }],
      uses: [
        { anyOf: [{ item: 'mat/iron', qty: q(1991, 2) }] },
        { anyOf: [{ item: 'mat/carbon', qty: q(9, 2) }] },
      ],
      // 与 make/iron 同一个理由：小批量靠地面导热，连续生产才要风冷散热器。
      needs: [],
      performedBy: 'plant/melting-furnace',
      under: [{ param: 'temperature', min: 1550, max: 1650 }],
    },
    {
      /** 40Cr。C 0.40% + Cr 0.9%：铁 982 + 碳 4 + 铬铁 14（铬铁含铬 65%）。 */
      id: 'make/steel-40cr',
      name: '40Cr 合金结构钢制备',
      produces: [{ item: 'mat/steel-40cr', qty: q(1000), gives: [{ param: 'hardness', kind: 'range', min: 180, max: 350 }, { param: 'temper', kind: 'enum', oneOf: ['as-rolled', 'normalized', 'quenched', 'tempered'] }] }],
      uses: [
        { anyOf: [{ item: 'mat/iron', qty: q(982) }] },
        { anyOf: [{ item: 'mat/carbon', qty: q(4) }] },
        { anyOf: [{ item: 'mat/ferrochrome', qty: q(14) }] },
      ],
      // 与 make/iron 同一个理由：小批量靠地面导热，连续生产才要风冷散热器。
      needs: [],
      performedBy: 'plant/melting-furnace',
      under: [{ param: 'temperature', min: 1550, max: 1650 }],
    },
    {
      /** 冷轧薄板。C 0.08%：铁 999.2 + 碳 0.8。热轧后冷轧到 1–2 mm。 */
      id: 'make/sheet-steel',
      name: '冷轧薄板制备',
      produces: [{ item: 'mat/sheet-steel', qty: q(1000) }],
      uses: [
        { anyOf: [{ item: 'mat/iron', qty: q(4996, 5) }] },
        { anyOf: [{ item: 'mat/carbon', qty: q(4, 5) }] },
      ],
      needs: ['plant/radiator'],
      performedBy: 'plant/rolling-mill',
    },
    {
      /**
       * 不锈钢。18/8 按名义成分配料：
       *   铁 643 + 碳 1 + 铬铁 276 + 镍 80 = 1000
       * 铬铁含铬 65%，276 kg 带进 179 kg 铬（17.9%）与 97 kg 铁；于是
       * 总铁 643 + 97 = 740（74%），镍 80（8%），碳 1（0.1%）。
       *
       * ⚠️ 这是"成分对、工艺简"的版本。真正的 304 要吹氧脱碳（AOD）与
       * 真空脱气，本链没有这两步 —— 靠的是 make/ferrochrome 那个模型：
       * 碳全部进 CO，所以算出来的铬铁含碳为零。实际高碳铬铁含碳约 7%，
       * 用它配料会把 19 kg 碳带进钢里，那就必须吹氧。缺口记在这里。
       */
      id: 'make/stainless-steel',
      name: '不锈钢制备',
      produces: [{ item: 'mat/stainless-steel', qty: q(1000), gives: [{ param: 'grade', kind: 'enum', oneOf: ['304', '316L', '430'] }, { param: 'ni', kind: 'range', min: 0, max: 15 }] }],
      uses: [
        { anyOf: [{ item: 'mat/iron', qty: q(643) }] },
        { anyOf: [{ item: 'mat/carbon', qty: q(1) }] },
        { anyOf: [{ item: 'mat/ferrochrome', qty: q(276) }] },
        { anyOf: [{ item: 'mat/nickel', qty: q(80) }] },
      ],
      needs: [],
      performedBy: 'plant/melting-furnace',
      under: [{ param: 'temperature', min: 1550, max: 1650 }],
    },
  ],
};

/** 仅用于类型约束，防止常量被误当成可变数组。 */
export const MATERIAL_ROUTES: readonly Route[] = MATERIALS.routes;

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...MATERIALS.items];
export const DATA_ROUTES: readonly Route[] = [...MATERIAL_ROUTES];
