/**
 * 选冶四台 —— 把 ppm 挑成百分比。
 *
 * 断点缩到这里，剩下的全是"富集"：把散在土里的东西挑成能进炉子的料。
 * 四台的共同点不是工艺，是**浓度差**：
 *
 *   选矿厂     铬 140:1 · 镍 250:1 · 铜 8333:1 · 磷 30:1
 *   矿热炉     把精矿还原成铬铁、镍铁（1600–1700 °C，全厂最热）
 *   电解精炼槽 把泡铜与镍铁提纯到 99.9%（硫酸电解液、直流电）
 *   焙烧炉     把硫从硫酸盐里赶出来（900–1200 °C，沸腾焙烧）
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 四台设备，两处曾经缺来路
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   矿热炉的电极   石墨电极要石油焦与煤沥青。火星没有石油、没有煤，也没有
 *                  沥青。现在 `std/carbon-electrode-300` 已有路线，电极不再
 *                  是 `deferred`；炉子与电极都能造。
 *   选矿厂的药剂   浮选要起泡剂、捕收剂、调整剂，全是有机物。现在
 *                  `mat/flotation-reagent` 已有 `make/flotation-reagent` 路线
 *                  （黄药 + 丁醇，3:1）；浮选槽与药剂都不是断点，但丁醇起泡力
 *                  与黄药选择性比工业配方低一档。
 *
 * 这两处和磁选机缺的那块磁体是同一类：**设备不难，难的是让设备真正运转的
 * 那一小样东西**。三处都不是"还没写"，是知道卡在哪；前两处已补路线。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 没有质量
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 与 machine/tools.ts 同理：整机重量依赖型号，没有可核的基准就不写。
 * 路线按 `1 kg → 1 件` 写，证明拓扑，不证明量。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、选矿厂 —— 破碎、磨矿、浮选、脱水
// ═══════════════════════════════════════════════════════════════════════════

export const BENEFICIARY_PARTS: readonly Item[] = [
  /**
   * 破碎机。颚式：一块固定颚板、一块摆动颚板，把土块咬到 10 mm 以下。
   *
   * 颚板是这台机器唯一的消耗件，真正的材质是高锰钢（水韧处理后越砸越硬）。
   * 高锰钢要锰 12%，而锰的富集与锰铁链没建 —— 这里用 40Cr 代用，寿命打折。
   */
  { id: 'plant/ore-beneficiary/crusher', name: 'Ore Beneficiation Plant Crusher', name_zh: '选矿厂破碎机', unit: '件', category: 'part' },

  /**
   * 球磨机。筒体转，里面的钢球把矿砸细到 0.1 mm 以下。
   *
   *   磨矿这一步是全厂最费电的地方（它列在第一档），因为富集比是
   * 140:1 的时候，要磨的是那 140 吨土，不是那 1 吨精矿。
   */
  { id: 'plant/ore-beneficiary/mill', name: 'Ore Beneficiation Plant Ball Mill', name_zh: '选矿厂球磨机', unit: '件', category: 'part' },

  /**
   * 浮选槽。矿浆里加药、充气，有用矿物随泡沫上浮，脉石留下。
   *
   * ⚠️ **槽体造得出来，浮选开不了工**：整条工艺要有机物药剂，而火星的有机
   * 化学只有 PTFE 与 Bosch 碳。见 `mat/flotation-reagent`。
   */
  { id: 'plant/ore-beneficiary/flotation-cells', name: 'Ore Beneficiation Plant Flotation Cells', name_zh: '选矿厂浮选槽', unit: '件', category: 'part' },

  /** 浓缩机。大直径浅槽加耙架，让矿浆里的固体沉下去，把水挤出来。 */
  { id: 'plant/ore-beneficiary/thickener', name: 'Ore Beneficiation Plant Thickener', name_zh: '选矿厂浓缩机', unit: '件', category: 'part' },

  /**
   * 过滤机。把浓缩后的矿浆压成滤饼，水分降到 10% 以下才进得了炉子。
   *
   * 滤布是高分子织物，火星只有 PTFE 能做纤维 —— 贵，但那是唯一一条路。
   */
  { id: 'plant/ore-beneficiary/filter', name: 'Ore Beneficiation Plant Filter', name_zh: '选矿厂过滤机', unit: '件', category: 'part' },
];

export const BENEFICIARY_ROUTES: readonly Route[] = [
  {
    /** 破碎机。HT250 机架浇成，40Cr 颚板锻后淬硬、堆焊耐磨层。 */
    id: 'make/beneficiary-crusher',
    name: 'Ore Beneficiation Plant Crusher Manufacturing', name_zh: '选矿厂破碎机制造',
    produces: [{ item: 'plant/ore-beneficiary/crusher', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/milling-machine', 'plant/grinder', 'plant/forge'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 球磨机。薄板卷筒焊成；40Cr 衬板与钢球锻后淬硬 —— 钢球是消耗件。 */
    id: 'make/beneficiary-mill',
    name: 'Ore Beneficiation Plant Ball Mill Manufacturing', name_zh: '选矿厂球磨机制造',
    produces: [{ item: 'plant/ore-beneficiary/mill', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 浮选槽。薄板焊槽体，40Cr 叶轮，不锈钢刮板 —— 槽能造，药剂不能。 */
    id: 'make/beneficiary-flotation',
    name: 'Ore Beneficiation Plant Flotation Cells Manufacturing', name_zh: '选矿厂浮选槽制造',
    produces: [{ item: 'plant/ore-beneficiary/flotation-cells', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 浓缩机。薄板大直径浅槽 + 45 钢耙架与中心传动。 */
    id: 'make/beneficiary-thickener',
    name: 'Ore Beneficiation Plant Thickener Manufacturing', name_zh: '选矿厂浓缩机制造',
    produces: [{ item: 'plant/ore-beneficiary/thickener', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 过滤机。不锈钢机架与滤板，PTFE 滤布。 */
    id: 'make/beneficiary-filter',
    name: 'Ore Beneficiation Plant Filter Manufacturing', name_zh: '选矿厂过滤机制造',
    produces: [{ item: 'plant/ore-beneficiary/filter', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、矿热炉 —— 全厂最热的一台
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 碳电极 φ300 —— **不是石墨电极**：石墨化要 3000 °C，本层只有 1200–1300 的焙烧。
 *
 * **它是从"矿热炉的零件"升上来的标准件。**
 *
 * 碳粉加酚醛树脂压成棒，1200–1300 °C 焙烧。见下面 make/arc-electrode。
 *
 * 为什么升成 std/：矿热炉与自衬电弧炉用**同一只电极**。以前它叫
 * plant/submerged-arc-furnace/electrode，第二台炉子要用只能复制一份 ——
 * 而"φ300 的电极装在哪台炉子上都是 φ300"，正是标准件的判据
 * （专用件与标准件的分界）。
 *
 * 它是这套体系里消耗量最大的零件之一：一台矿热炉同时挂三根，烧掉就接。
 */
export const ARC_ELECTRODE: Item = {
  id: 'std/carbon-electrode-300',
  name: 'φ300 Carbon Electrode', name_zh: 'φ300 碳电极',
  unit: '件',
  category: 'part',
};

export const SUBMERGED_ARC_PARTS: readonly Item[] = [
  /** 炉壳。钢板卷成圆筒再焊，外壁水冷 —— 1600 °C 下铜墙铁壁也得靠水带走热量。 */
  { id: 'plant/submerged-arc-furnace/shell', name: 'Submerged Arc Furnace Shell', name_zh: '矿热炉炉壳', unit: '件', category: 'part' },

  /** 炉衬。耐火砖砌在壳内。矿热炉的衬比熔炼炉厚一倍：它是连续 24 小时运行的。 */
  { id: 'plant/submerged-arc-furnace/lining', name: 'Submerged Arc Furnace Lining', name_zh: '矿热炉炉衬', unit: '件', category: 'part' },

  /**
   * 电极的**说明**在文件上方 `ARC_ELECTRODE` 那里 —— 它已经是标准件
   * `std/carbon-electrode-300`，不再属于这台炉子。
   *
   * 一段历史记在这里：这一件曾经是这个零件清单里唯一标 `deferred` 的条目，
   * 卡在粘结剂（要苯酚）。解开之后又发现它不该有归属 —— 两台炉子共用同一只
   *   φ300 电极，于是升成标准件。
   *
   * **先是"造不出"，后来是"不属于谁"，两件事都记在同一件东西上。**
   */

  /** 出铁口与开堵眼机。1600 °C 的渣铁从这一孔出来，钻开再堵上，每炉一次。 */
  { id: 'plant/submerged-arc-furnace/tapping', name: 'Submerged Arc Furnace Taphole and Taphole Opener', name_zh: '矿热炉出铁口与开堵眼机', unit: '件', category: 'part' },

  /** 电极升降与压放机构。电极烧掉一点就往里送一点，深度决定炉温。 */
  { id: 'plant/submerged-arc-furnace/hoist', name: 'Electrode Hoist and Clamping Mechanism', name_zh: '电极升降与压放机构', unit: '件', category: 'part' },
];

export const SUBMERGED_ARC_ROUTES: readonly Route[] = [
  {
    /**
     * 电极。碳粉 870 + 树脂 261 混捏 → 挤压成棒 → 1200–1300 °C 焙烧。
     *
     * 这一条是零件路线里唯一按**真质量**写的：别的零件不知道多重，用
     * `1 kg → 1 件` 占位；电极的粘结剂配比本身就是关键，所以按一根约一吨的
     * 电极给数。
     *
     * 树脂碳化收率约 50%：261 kg 树脂在焙烧后剩 130 kg 碳，把 870 kg 碳粉
     * 焊成一根 1000 kg 的电极。粘结剂在成品里占 13%，与工业预焙阳极
     * （沥青 15–20%）同一量级；挥发分 131 kg（氢、甲烷、焦油）没有条目。
     *
     * 电阻是石墨的 3–4 倍，所以同样功率下电流要小、电压要高，炉子做得更粗 ——
     * 这是"能造但不好用"的那一类，不是不能用。
     */
    id: 'make/arc-electrode',
    name: 'φ300 Carbon Electrode Manufacturing', name_zh: 'φ300 碳电极制造',
    produces: [{ item: 'std/carbon-electrode-300', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/carbon', qty: q(870) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(261) }] },
    ],
    needs: ['plant/milling-machine'],
    performedBy: 'plant/kiln',
    under: [{ param: 'temperature', min: 1200, max: 1300 }],
  },
  {
    /** 炉壳。薄板卷筒焊成，外部焊水套 —— 焊完要试压。 */
    id: 'make/arc-shell',
    name: 'Submerged Arc Furnace Shell Manufacturing', name_zh: '矿热炉炉壳制造',
    produces: [{ item: 'plant/submerged-arc-furnace/shell', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] }],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 炉衬。耐火砖砌筑 —— 砌不是机械加工，是装配，执行者是机器人。 */
    id: 'make/arc-lining',
    name: 'Submerged Arc Furnace Lining Manufacturing', name_zh: '矿热炉炉衬制造',
    produces: [{ item: 'plant/submerged-arc-furnace/lining', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/refractory', qty: q(1) }] }],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 出铁口。HT250 水冷壳体 + 45 钢钻杆，与炉壳配作。 */
    id: 'make/arc-tapping',
    name: 'Submerged Arc Furnace Taphole and Taphole Opener Manufacturing', name_zh: '矿热炉出铁口与开堵眼机制造',
    produces: [{ item: 'plant/submerged-arc-furnace/tapping', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/milling-machine'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 升降机构。45 钢丝杠与夹持器，车螺纹后淬硬磨。 */
    id: 'make/arc-hoist',
    name: 'Electrode Hoist and Clamping Mechanism Manufacturing', name_zh: '电极升降与压放机构制造',
    produces: [{ item: 'plant/submerged-arc-furnace/hoist', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1) }] }],
    needs: ['plant/milling-machine', 'plant/grinder'],
    performedBy: 'lathe',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 三、电解精炼槽 —— 把泡铜搬到阴极上
// ═══════════════════════════════════════════════════════════════════════════

export const ELECTROREFINING_PARTS: readonly Item[] = [
  /**
   * 槽体。钢槽衬 PTFE —— 电解液是 15% 硫酸，碳钢几天就烂穿。
   *
   * 铅衬里是地球上的老办法，火星没有铅链；PTFE 衬里是唯一现成的选择。
   */
  { id: 'plant/electrorefining/cell', name: 'Electrorefining Cell Tank', name_zh: '电解精炼槽槽体', unit: '件', category: 'part' },

  /** 阳极板。泡铜铸成板，通电后它溶解，铜离子游向阴极。 */
  { id: 'plant/electrorefining/anode', name: 'Electrorefining Cell Anode Plate', name_zh: '电解精炼槽阳极板', unit: '件', category: 'part' },

  /** 阴极板。不锈钢始极片，纯铜在上面一层层长出来。 */
  { id: 'plant/electrorefining/cathode', name: 'Electrorefining Cell Cathode Plate', name_zh: '电解精炼槽阴极板', unit: '件', category: 'part' },

  /**
   * 母线。铜排，几千安培的电流靠它进出。铸铜排比轧制铜排导电率低一点，
   * 但轧制要轧机 —— 先用铸的。
   */
  { id: 'plant/electrorefining/busbar', name: 'Electrorefining Cell Busbar', name_zh: '电解精炼槽母线', unit: '件', category: 'part' },

  /** 电解液循环。泵、管路、加热器：硫酸铜电解液要维持在 60 °C 左右。 */
  { id: 'plant/electrorefining/circulation', name: 'Electrorefining Cell Electrolyte Circulation', name_zh: '电解精炼槽电解液循环', unit: '件', category: 'part' },
];

export const ELECTROREFINING_ROUTES: readonly Route[] = [
  {
    /** 槽体。钢槽焊成 → 内壁衬 PTFE 板 → 翻边密封。 */
    id: 'make/refining-cell',
    name: 'Electrorefining Cell Tank Manufacturing', name_zh: '电解精炼槽槽体制造',
    produces: [{ item: 'plant/electrorefining/cell', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 阳极板。泡铜重熔浇成板，挂耳一起铸出。 */
    id: 'make/refining-anode',
    name: 'Electrorefining Cell Anode Plate Manufacturing', name_zh: '电解精炼槽阳极板制造',
    produces: [{ item: 'plant/electrorefining/anode', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/blister-copper', qty: q(1) }] }],
    needs: [],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 阴极板。不锈钢板剪切 → 折边 → 焊吊耳。 */
    id: 'make/refining-cathode',
    name: 'Electrorefining Cell Cathode Plate Manufacturing', name_zh: '电解精炼槽阴极板制造',
    produces: [{ item: 'plant/electrorefining/cathode', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] }],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
  {
    /**
     * 母线。**用铝不用铜。**
     *
     * 母线要的是导电截面，不是导电率 —— 铝的电阻率是铜的 1.6 倍，
     * 多用 60% 的截面就抵平了。而价钱差三个数量级：
     *
     *   铜  34,722 kg 风化层 / kg（8333:1）
     *   铝      33 kg 风化层 / kg（9% 品位，酸法）
     *
     * 同一条母线的土方量差 **1052 倍**。现代电解厂的母线早就是铝的；
     * 本层最初写成铜，是因为那时候还没有铝（见 data/material/aluminium.ts）。
     *
     * ⚠️ 熔炼炉下限 1200 °C，而铝 660 就化 —— 炉温高了一倍，烧损与吸氢都大。
     * 能用，但不是化铝该用的炉子。
     */
    id: 'make/refining-busbar',
    name: 'Electrorefining Cell Busbar Manufacturing', name_zh: '电解精炼槽母线制造',
    produces: [{ item: 'plant/electrorefining/busbar', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/aluminium', qty: q(1) }] }],
    needs: ['plant/milling-machine'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1200, max: 1300 }],
  },
  {
    /** 循环系统。45 钢泵体车磨，PTFE 密封，不锈钢管路。 */
    id: 'make/refining-circulation',
    name: 'Electrorefining Cell Electrolyte Circulation Manufacturing', name_zh: '电解精炼槽电解液循环制造',
    produces: [{ item: 'plant/electrorefining/circulation', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/milling-machine',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 四、焙烧炉 —— 把硫从硫酸盐里赶出来
// ═══════════════════════════════════════════════════════════════════════════

export const ROASTER_PARTS: readonly Item[] = [
  /** 炉壳。钢板卷焊，外壁有保温。 */
  { id: 'plant/roaster/shell', name: 'Roaster Shell', name_zh: '焙烧炉炉壳', unit: '件', category: 'part' },

  /** 炉衬。耐火浇注料，随壳体形状浇成。 */
  { id: 'plant/roaster/lining', name: 'Roaster Lining', name_zh: '焙烧炉炉衬', unit: '件', category: 'part' },

  /**
   * 布风板。气体从下面吹进床层，把固体吹成"沸腾"状态 —— 沸腾焙烧的全部秘密。
   *
   * 上千个小孔要均匀，孔大了漏料、孔小了阻力大。它工作在 900 °C，
   * 金属撑不住，只能用耐火浇注料整体浇出来。
   */
  { id: 'plant/roaster/distributor', name: 'Roaster Air Distribution Plate', name_zh: '焙烧炉布风板', unit: '件', category: 'part' },

  /** 旋风分离器。把 SO₂ 气体和夹带的固体分开，固体回床、气体去制酸。 */
  { id: 'plant/roaster/cyclone', name: 'Roaster Cyclone Separator', name_zh: '焙烧炉旋风分离器', unit: '件', category: 'part' },

  /** 鼓风机。整个床层的压力都靠它，叶轮要 45 钢车铣后做动平衡。 */
  { id: 'plant/roaster/blower', name: 'Roaster Blower', name_zh: '焙烧炉鼓风机', unit: '件', category: 'part' },
];

export const ROASTER_ROUTES: readonly Route[] = [
  {
    /** 炉壳。薄板卷筒焊成，开人孔与风口。 */
    id: 'make/roaster-shell',
    name: 'Roaster Shell Manufacturing', name_zh: '焙烧炉炉壳制造',
    produces: [{ item: 'plant/roaster/shell', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] }],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 炉衬。耐火浇注料浇在壳体内，随烘炉固化 —— 浇注与振捣是机器人干的。 */
    id: 'make/roaster-lining',
    name: 'Roaster Lining Manufacturing', name_zh: '焙烧炉炉衬制造',
    produces: [{ item: 'plant/roaster/lining', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/refractory', qty: q(1) }] }],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 布风板。耐火浇注料整体浇成，孔用芯棒留出 —— 要一次浇成，不能拼接。 */
    id: 'make/roaster-distributor',
    name: 'Roaster Air Distribution Plate Manufacturing', name_zh: '焙烧炉布风板制造',
    produces: [{ item: 'plant/roaster/distributor', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/refractory', qty: q(1) }] }],
    needs: ['plant/kiln'],
    performedBy: 'plant/robot',
  },
  {
    /** 旋风分离器。薄板卷制焊接 + 耐磨衬里，内壁要光滑。 */
    id: 'make/roaster-cyclone',
    name: 'Roaster Cyclone Separator Manufacturing', name_zh: '焙烧炉旋风分离器制造',
    produces: [{ item: 'plant/roaster/cyclone', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] }],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 鼓风机。45 钢叶轮车铣后做动平衡，机壳薄板焊，轴用两只球轴承。 */
    id: 'make/roaster-blower',
    name: 'Roaster Blower Manufacturing', name_zh: '焙烧炉鼓风机制造',
    produces: [{ item: 'plant/roaster/blower', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'std/bearing-general-p0', qty: q(2) }] },
    ],
    needs: ['lathe', 'plant/milling-machine', 'plant/grinder'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 设备条目 —— `composedOf` 一律由零件清单生成，不手抄
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 选矿厂。
 *
 * **不是一台机器，是一条线**：破碎机、球磨机、浮选槽、浓缩机、过滤机 ——
 * 所以 `unit` 是套而不是台，而"一套"里的五件各自都能独立更换。
 */
export const BENEFICIARY: Item = {
  id: 'plant/ore-beneficiary',
  name: 'Ore Beneficiation Plant', name_zh: '选矿厂',
  unit: '套',
  category: 'machine',
  holds: [
    // 浮选槽要在加压下跑 —— 火星 0.6 kPa 下气泡一离开液面就膨胀，泡沫层撑不住。
    { param: 'pressure', min: 100, max: 300 },
  ],
  // 与 holds 同一档：给 `measure/ore-bench-cabin-pressure` 的校准边一个可判窗口。
  props: [{ param: 'pressure', kind: 'range', min: 100, max: 300, unit: 'kPa' }],
  composedOf: [...BENEFICIARY_PARTS.map((p) => ({ item: p.id, qty: q(1) })), { item: 'std/motor-7.5kw-4p', qty: q(1) }],
  // 浮选药剂：估 0.5 kg/h（工业 50–200 g/t 矿，本层处理量小、循环量大，取高值）。
  // 这是 mat/flotation-reagent 在某台设备上的**第一个真实消耗点** ——
  // 在此之前它只被三条选矿路线当原料吃，没有"每小时用多少"这个数。
  consumption: [{ item: 'mat/flotation-reagent', qty: q(1), per: q(2) }],
};

/**
 * 矿热炉。埋弧电炉，三根电极插进炉料，靠料自己的电阻发热。
 *
 * 全厂温度最高（1600–1700 °C）、电极消耗最大的设备 —— 而电极正是它造不出
 * 的那一件，见 `std/carbon-electrode-300`。
 */
export const SUBMERGED_ARC: Item = {
  id: 'plant/submerged-arc-furnace',
  name: 'Submerged Arc Furnace', name_zh: '矿热炉',
  unit: '台',
  category: 'machine',
  holds: [{ param: 'temperature', min: 1500, max: 1800 }],
  composedOf: [
    ...SUBMERGED_ARC_PARTS.map((p) => ({ item: p.id, qty: q(1) })),
    { item: 'std/carbon-electrode-300', qty: q(3) },
    { item: 'std/motor-7.5kw-4p', qty: q(1) },
  ],
};

/**
 * 电解精炼槽。泡铜做阳极、纯铜做阴极，通直流电把铜搬到阴极上，纯度到 99.9%。
 *
 * 一台设备、一种工艺，两种金属：铜的提纯与镍的提纯都用它
 * （data/material/ores.ts 的两条路线）。
 */
export const ELECTROREFINING: Item = {
  id: 'plant/electrorefining',
  name: 'Electrorefining Cell', name_zh: '电解精炼槽',
  unit: '套',
  category: 'machine',
  holds: [{ param: 'temperature', min: 50, max: 70 }],
  composedOf: [...ELECTROREFINING_PARTS.map((p) => ({ item: p.id, qty: q(1) })), { item: 'std/motor-7.5kw-4p', qty: q(1) }],
};

/**
 * 焙烧炉。流化床，把 SO₂ 从硫酸盐里赶出来，也兼作高温裂解管。
 *
 * 两个温度档：硫酸盐分解 1250–1400 °C（纯热分解）、HCFC-22 裂解 850–900 °C。
 *
 * 火星的硫全在硫酸盐里（石膏、硫酸镁、黄钾铁矾），没有单质硫可烧 ——
 * 硫酸只能从这一步起。
 */
export const ROASTER: Item = {
  id: 'plant/roaster',
  name: 'Roaster', name_zh: '焙烧炉',
  unit: '台',
  category: 'machine',
  holds: [{ param: 'temperature', min: 850, max: 1400 }],
  composedOf: [...ROASTER_PARTS.map((p) => ({ item: p.id, qty: q(1) })), { item: 'std/motor-7.5kw-4p', qty: q(1) }],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...BENEFICIARY_PARTS, ...ELECTROREFINING_PARTS, ...ROASTER_PARTS, ...SUBMERGED_ARC_PARTS, ARC_ELECTRODE, BENEFICIARY, ELECTROREFINING, ROASTER, SUBMERGED_ARC];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/ore-beneficiary',
    name: 'Ore Beneficiation Plant Assembly', name_zh: '选矿厂装配',
    produces: [{
      item: 'plant/ore-beneficiary',
      qty: q(1),
      gives: [{ param: 'pressure', kind: 'range', min: 100, max: 300, record: 'mat/ore-bench-pressure-record' }],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/electrorefining',
    name: 'Electrorefining Cell Assembly', name_zh: '电解精炼槽装配',
    produces: [{
      item: 'plant/electrorefining',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/roaster',
    name: 'Roaster Assembly', name_zh: '焙烧炉装配',
    produces: [{
      item: 'plant/roaster',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/submerged-arc-furnace',
    name: 'Submerged Arc Furnace Assembly', name_zh: '矿热炉装配',
    produces: [{
      item: 'plant/submerged-arc-furnace',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...BENEFICIARY_ROUTES, ...ELECTROREFINING_ROUTES, ...ROASTER_ROUTES, ...SUBMERGED_ARC_ROUTES, ...ASSEMBLY_ROUTES];
