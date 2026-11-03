/**
 * 材料环设备的零件 —— 从风化层与大气到铁与碳。
 *
 * 断点缩到这里只剩四台：磁选机、直接还原炉、气体分离装置、Bosch 反应器。
 * 它们是两道入口：
 *
 *   风化层 →（磁选）→ 铁精矿 →（氢还原）→ 海绵铁
 *   大气   →（分离）→ CO₂    →（Bosch）→ 碳
 *
 * 铁与碳到齐，`make/iron` 与五条铸铁／钢路线才有料。也就是说，这个文件
 * 决定的是"火星能不能自己产铁"，而不是"能不能造机器" —— 后者上一轮已经
 * 全通了。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 四台设备，各自撞到一样火星没有的东西
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   磁选机     **磁。** 这是最不显眼的一处硬骨头 —— 但后来判错了两次，现在说清：
 *
 *              **强场**（磁选要 1 T 级）只有电磁铁：绕线圈、通直流。永磁做不了 ——
 *              铁氧体要锶或钡（风化层里只有痕量），铝镍钴要钴（没有条目）。
 *              电磁铁的代价是铜：线圈 60 kg，而铜的富集比 8333:1，**一只线圈
 *              背后是两千吨土**（见 make/copper-concentrate）。
 *
 *              **弱场**（仪表磁路要 0.2 T）用磁铁矿烧结充磁就够，
 *              std/permanent-magnet-general）。
 *
 *              所以这一件不再是 deferred：两条磁路各管一处，谁也不替代谁。
 *   还原炉     耐热与密封。850 °C 还要通氢气，密封件不能用橡胶。
 *              解法是水冷铸铁阀 + 石墨盘根，不靠耐热合金 —— 耐热合金
 *              要铬镍钴，那是另一条链。
 *   气体分离   不是压比问题，是体积问题。0.6 kPa 进气，同样的质量要搬
 *              160 倍的体积，所以压缩机第一级叶轮大得离谱。材料不难，
 *              难的是叶轮的形状与动平衡。
 *   Bosch      取碳。CO₂ + 2H₂ → C + 2H₂O 的碳是**固体**，积在催化剂上。
 *              怎么把碳连续取出来而不漏气，是这台设备真正的机械难题。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 一处更大的缺口：电机
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 这四台设备都要电机，而**电机不是任何一台设备的零件** —— 上一轮那五台
 * 也一样。整个 data/ 里没有 `mat/motor`，没有硅钢片、漆包线、绝缘漆、
 * 换向器。它被"机器人数量由前提给定、电力由种子聚变装置供给"这两句顺手带走了，
 * 但电机不是机器人，也不是能源：它是一台要造的设备。
 *
 * 这件事记在这里，不假装它不存在。补它要一条电气链（硅钢片、漆包线、
 * 绝缘、轴承），那是独立的一层，不能靠"反正有机器人"糊过去。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 同样没有质量
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 与 plant.ts 同理：整机重量依赖型号，没有可靠基准就不写。路线按
 * `1 kg → 1 件`，证明拓扑（谁要谁、谁造谁），不证明量。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、磁选机 —— 风化层到精矿的唯一一道
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 磁选机的五个零件。
 *
 * 机器条目 `plant/magnetic-separator` 在本文件末尾，
 * `composedOf` 由这张清单生成。
 *
 * 干式筒式磁选：矿粉从料斗落到旋转的不锈钢滚筒上，滚筒内壁的永磁体把
 * 磁铁矿吸住，转过去离开磁场才落下；脉石不吸，直接抛出去。整台机器只有
 * 滚筒转，没有一件需要高速或高精度 —— 除了磁体本身。
 */
export const SEPARATOR_PARTS: readonly Item[] = [
  /**
   * 磁选滚筒。非磁性不锈钢薄壁筒，内部装永磁体组。
   *
   * 材质必须是**非磁性**的：用普通钢，矿粉会粘在筒上，整台机器就成了
   * 一块吸铁石。这是这个零件唯一的讲究，也是它贵的原因。
   */
  { id: 'plant/magnetic-separator/drum', name: '磁选机磁选滚筒', unit: '件', category: 'part' },

  /**
   * 电磁线圈与铁芯。**不是永磁体 —— 是绕出来的电磁铁。**
   *
   * 永磁体三条路都不通：铁氧体要锶或钡（风化层里只有痕量，矿物表里也没有
   * 天青石这一行），铝镍钴要钴（没有条目）。但磁选机并不挑磁的来源：
   * 大中型滚筒磁选机本来就有电磁式的，绕一只线圈、通直流电就行。
   *
   * 代价是铜。一只 10–20 t/h 滚筒的线圈约 60 kg 铜（估），而铜的富集比是
   * 8333:1 —— 1 kg 铜要 34.7 吨风化层，**一只线圈背后是两千吨土**。
   * 这也是为什么这台机器只造一台：先让铁链转起来，第二台再议。
   *
   * 上一版把这一件标成 `deferred`，判"三条路都缺一条化学链"。那是把
   * "永磁"当成了唯一解 —— 加一条线圈，环就通了。
   */
  { id: 'plant/magnetic-separator/magnet', name: '磁选机电磁线圈与铁芯', unit: '件', category: 'part' },

  /**
   * 励磁电源。可调直流（旋转变流机）+ 串电阻调流 + 合闸开关。
   *
   * 磁选机的磁场是"通电才有"的：合闸通、断料停 —— 这一点与永磁相反，
   * 也是它的好处：**不带料时不耗电，也不会吸住工具。**
   */
  { id: 'plant/magnetic-separator/excitation', name: '磁选机励磁电源', unit: '件', category: 'part' },

  /** 机架。HT250 浇成，承滚筒、料斗与传动。不导磁也不受力，是最普通的一件。 */
  { id: 'plant/magnetic-separator/frame', name: '磁选机机架', unit: '件', category: 'part' },

  /** 传动。皮带轮 + 轴 + 轴承座。只把滚筒带起来，没有调速要求。 */
  { id: 'plant/magnetic-separator/drive', name: '磁选机传动', unit: '件', category: 'part' },

  /** 料斗与给料槽。冷轧板折弯焊成，靠重力下料，不承力。 */
  { id: 'plant/magnetic-separator/hopper', name: '磁选机料斗与给料槽', unit: '件', category: 'part' },
];

/**
 * 磁选机零件的制造路线。
 *
 * 四条落在现成的设备上，第五条（磁体）没有路线 —— 那一条就是断点。
 */
export const SEPARATOR_ROUTES: readonly Route[] = [
  {
    /**
     * 电磁线圈与铁芯。铜线绕在铸铁芯上，层间垫绝缘。
     *
     *   60 铜 + 240 铸铁 → 1 只磁体（约 300 kg，估）
     *
     * 一只线圈 60 kg 铜 ≈ **两千吨风化层**（铜 8333:1，1 kg 铜 34.7 吨土）。
     * 这是整套体系里最贵的一个零件 —— 比磨床主轴还贵，只是它贵在土方量上，
     * 不贵在精度上。
     *
     * 绕线用绕线机（它终于有了第二份工作：绕电机 + 绕磁体），
     * 铁芯在铣镗床上铣出极面。
     */
    id: 'make/separator-magnet',
    name: '磁选机电磁线圈与铁芯制造',
    produces: [{ item: 'plant/magnetic-separator/magnet', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(60) }] },
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(240) }] },
    ],
    needs: ['lathe', 'plant/milling-machine'],
    performedBy: 'plant/winder',
  },
  {
    /**
     * 励磁电源。**磁选机的直流从哪来** —— 旋转变流机。
     *
     * 它把线圈接到一个可调直流源上：合闸时通、断料时停，磁场强度靠串电阻调。
     * 这一件以前没人写，因为"电磁铁"三个字看起来已经够清楚了；
     * 而实际上**没有直流就没有磁**，磁选机停工的那一处从来不是线圈，是电源。
     */
    id: 'make/separator-excitation',
    name: '磁选机励磁电源制造',
    produces: [{ item: 'plant/magnetic-separator/excitation', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/rectifier-rotary-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 滚筒。不锈钢板卷圆 → 纵缝焊 → 车端面 → 磨外圆（矿粉要走得顺）。 */
    id: 'make/separator-drum',
    name: '磁选机磁选滚筒制造',
    produces: [{ item: 'plant/magnetic-separator/drum', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] }],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 机架。HT250 浇 → 结合面铣 → 轴承座孔镗。 */
    id: 'make/separator-frame',
    name: '磁选机机架制造',
    produces: [{ item: 'plant/magnetic-separator/frame', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] }],
    needs: ['lathe', 'plant/milling-machine'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 传动。45 钢车轴颈 → 淬 → 磨；皮带轮车 V 槽。 */
    id: 'make/separator-drive',
    name: '磁选机传动制造',
    produces: [{ item: 'plant/magnetic-separator/drive', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1) }] }],
    needs: ['plant/grinder'],
    performedBy: 'lathe',
  },
  {
    /** 料斗。冷轧板剪切 → 折弯 → 焊。没有精度要求，是工位最轻松的活。 */
    id: 'make/separator-hopper',
    name: '磁选机料斗与给料槽制造',
    produces: [{ item: 'plant/magnetic-separator/hopper', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] }],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、直接还原炉 —— 把氧从铁里拿走
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 直接还原炉的五个零件。
 *
 * 机器条目 `plant/reduction-furnace` 在本文件末尾。
 *
 * 竖炉：精矿从顶上加进去，氢气从下部通上来，逆流换热。出来的不是铁水，
 * 是 900 °C 的海绵铁 —— 所以整台机器的难点不在温度，在**在 850 °C 下
 * 还要不漏气地进出料**。氢气漏进车间不是味道问题，是爆炸问题。
 */
export const REDUCTION_PARTS: readonly Item[] = [
  /** 炉壳。钢板卷筒焊成，承炉衬、承料柱，不直接接触高温。 */
  { id: 'plant/reduction-furnace/shell', name: '还原炉炉壳', unit: '件', category: 'part' },

  /**
   * 炉衬。耐火打结料捣实，第一次升温时自己烧结成型。
   *
   * 它同时是**简体**与**保温层**：竖炉的炉衬要挡住 850 °C 的氢气，
   * 还要让外壳摸上去不烫手。
   */
  { id: 'plant/reduction-furnace/lining', name: '还原炉炉衬', unit: '件', category: 'part' },

  /**
   * 蓄热式气体加热器。耐火格子砖 + 燃烧室 + 换向阀。
   *
   * 为什么不用电热元件：镍铬丝要镍铬合金，那是另一条冶炼链。这里用
   * 最古典的办法 —— 燃烧氢氧把格子砖烧热，再让氢气从热砖里穿过。
   * 除了耐火砖与钢管，什么特殊材料都不要。
   */
  { id: 'plant/reduction-furnace/heater', name: '还原炉蓄热式气体加热器', unit: '件', category: 'part' },

  /**
   * 布料器。把精矿均匀撒进炉口，同时不漏气。
   *
   * 800 °C 下的转动密封，橡胶与 PTFE 都撑不住。用不锈钢钟罩 + 石墨盘根：
   * 石墨在高温下是干的润滑剂，而且不需要有机原料。
   */
  { id: 'plant/reduction-furnace/feeder', name: '还原炉布料器', unit: '件', category: 'part' },

  /**
   * 排料阀。水冷铸铁阀体 + 45 钢阀板。
   *
   * 水冷不是为了降温，是为了让**铸铁**能用在 800 °C：不水冷就一定要
   * 耐热合金，而耐热合金要铬镍钴。这是同一件事的两种代价，选了便宜的那种。
   */
  { id: 'plant/reduction-furnace/discharge', name: '还原炉排料阀', unit: '件', category: 'part' },
];

/**
 * 直接还原炉零件的制造路线。
 *
 * 炉衬那一条的执行设备是机器人：捣实是它干的，烧结是烘炉时自己完成的。
 * 上一版把熔炼炉的炉衬写成"由熔炼炉自己造" —— 那等于说造第一台炉子需要
 * 先有一台炉子。这里按真实工序分开：**砌筑不是机械加工，是装配**。
 */
export const REDUCTION_ROUTES: readonly Route[] = [
  {
    /** 炉壳。钢板卷筒 → 焊 → 法兰加工 → 与炉衬一起烘炉。 */
    id: 'make/reduction-shell',
    name: '还原炉炉壳制造',
    produces: [{ item: 'plant/reduction-furnace/shell', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] }],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 炉衬。耐火打结料捣实，烘炉时自烧结 —— 捣实是机器人干的。 */
    id: 'make/reduction-lining',
    name: '还原炉炉衬制造',
    produces: [{ item: 'plant/reduction-furnace/lining', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/refractory', qty: q(1) }] }],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 加热器。燃烧室与格子砖体焊接 → 砌砖 → 换向阀配作。 */
    id: 'make/reduction-heater',
    name: '还原炉蓄热式气体加热器制造',
    produces: [{ item: 'plant/reduction-furnace/heater', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 布料器。不锈钢钟罩车成 → 石墨盘根填料 → 与炉口配作。 */
    id: 'make/reduction-feeder',
    name: '还原炉布料器制造',
    produces: [{ item: 'plant/reduction-furnace/feeder', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] }],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 排料阀。HT250 阀体浇成后镗孔，45 钢阀板车磨；水套要试压。 */
    id: 'make/reduction-discharge',
    name: '还原炉排料阀制造',
    produces: [{ item: 'plant/reduction-furnace/discharge', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 三、气体分离装置 —— 从 6 mbar 里把 CO₂ 拎出来
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 气体分离装置的五个零件。
 *
 * 机器条目 `plant/air-separator` 在本文件末尾。
 *
 * 火星大气 0.6 kPa，要用的气体得压到 100 kPa 量级，压比 160:1。
 * 分选用的是**分级冷凝**：压缩 → 冷却 → CO₂ 先凝成液，氮氩还是气。
 * 冷量靠焦耳-汤姆逊效应自己产生，不要外部制冷剂 —— 因此不需要氨、
 * 不需要氟利昂，只要压缩机、换热器和一只节流阀。
 */
export const AIR_SEPARATOR_PARTS: readonly Item[] = [
  /**
   * 压缩机。低压大流量，第一级叶轮直径是这台设备里最大的一件。
   *
   * 入口压力只有 0.6 kPa，同样的质量流量要搬 160 倍的体积 —— 所以
   * 第一级不是"压缩机"，更像一台大风扇。它的叶轮形状与动平衡是
   * 这台设备唯一需要磨的地方。
   */
  { id: 'plant/air-separator/compressor', name: '空分压缩机', unit: '件', category: 'part' },

  /** 换热器。铜管束 + 钢壳，把压缩热带走，也是冷凝 CO₂ 的地方。 */
  { id: 'plant/air-separator/heat-exchanger', name: '空分换热器', unit: '件', category: 'part' },

  /** 分离罐。冷凝下来的 CO₂ 液体在这里与氮氩分开，底部排液。 */
  { id: 'plant/air-separator/separator-vessel', name: '空分分离罐', unit: '件', category: 'part' },

  /** 节流阀。高压气体经它降压降温 —— 冷量就是在这里自己产生的。 */
  { id: 'plant/air-separator/throttle-valve', name: '空分节流阀', unit: '件', category: 'part' },

  /** 机架与管路。钢型材焊接，配法兰与阀门。 */
  { id: 'plant/air-separator/frame', name: '空分机架与管路', unit: '件', category: 'part' },
];

/** 气体分离装置零件的制造路线。 */
export const AIR_SEPARATOR_ROUTES: readonly Route[] = [
  {
    /**
     * 压缩机。叶轮 45 钢锻 → 车 → 铣叶片 → 动平衡（磨校重）。
     *
     * 动平衡要靠磨削去重，这是"磨"在这个文件里的第三次出场 —— 一台
     * 转得快的机器，绕不开它。
     */
    id: 'make/airsep-compressor',
    name: '空分压缩机制造',
    produces: [{ item: 'plant/air-separator/compressor', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1) }] }],
    needs: ['plant/milling-machine', 'plant/grinder'],
    performedBy: 'lathe',
  },
  {
    /** 换热器。铜管胀接进钢壳，壳侧走冷却水；要试压。 */
    id: 'make/airsep-heat-exchanger',
    name: '空分换热器制造',
    produces: [{ item: 'plant/air-separator/heat-exchanger', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 分离罐。不锈钢板卷焊 → 封头 → 法兰 → 试压。 */
    id: 'make/airsep-vessel',
    name: '空分分离罐制造',
    produces: [{ item: 'plant/air-separator/separator-vessel', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] }],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 节流阀。不锈钢阀体 → 阀芯配作 → 研磨密封面。 */
    id: 'make/airsep-throttle',
    name: '空分节流阀制造',
    produces: [{ item: 'plant/air-separator/throttle-valve', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] }],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 机架与管路。型材与薄板焊接，法兰车成。 */
    id: 'make/airsep-frame',
    name: '空分机架与管路制造',
    produces: [{ item: 'plant/air-separator/frame', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] }],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 四、Bosch 反应器 —— 把碳从 CO₂ 里拆出来
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Bosch 反应器的五个零件。
 *
 * 机器条目 `plant/bosch-reactor` 在本文件末尾。
 *
 * CO₂ + 2H₂ → C + 2H₂O，500–700 °C，镍催化。氢把氧夺走，碳留在催化剂上。
 * 化学反应很干净，机械问题很难：**固体碳会一点点把催化剂埋掉**。所以
 * 这台设备的寿命不由壳体决定，由卸碳机构决定。
 */
export const BOSCH_PARTS: readonly Item[] = [
  /** 壳体。不锈钢，承压 100 kPa 量级、承 700 °C。 */
  { id: 'plant/bosch-reactor/shell', name: 'Bosch 壳体', unit: '件', category: 'part' },

  /**
   * 催化剂。镍载在氧化铝载体上，浸渍后焙烧。
   *
   * 镍从电解镍来（250:1 的富集），载体用高铝耐火料磨粉 —— 两样都是
   * 现成的材料，所以这条链是通的。它是这个文件里唯一一条"催化剂"路线。
   */
  { id: 'plant/bosch-reactor/catalyst', name: 'Bosch 催化剂', unit: '件', category: 'part' },

  /** 除水器。把生成的水蒸气冷凝下来，同时不让氢跟着跑掉。 */
  { id: 'plant/bosch-reactor/condenser', name: 'Bosch 除水器', unit: '件', category: 'part' },

  /**
   * 卸碳机构。螺旋输送 + 闸阀，把积在催化剂上的碳连续刮出去。
   *
   * 它要在 700 °C、氢气气氛下动，所以螺旋用 45 钢、轴端水冷。碳本身
   * 是干粉，不需要润滑 —— 这一处比布料器好办。
   */
  { id: 'plant/bosch-reactor/carbon-removal', name: 'Bosch 卸碳机构', unit: '件', category: 'part' },

  /** 加热夹套。耐火砖砌在壳体外，靠电热或氢氧燃烧维持 500–700 °C。 */
  { id: 'plant/bosch-reactor/heater', name: 'Bosch 加热夹套', unit: '件', category: 'part' },
];

/** Bosch 反应器零件的制造路线。 */
export const BOSCH_ROUTES: readonly Route[] = [
  {
    /** 壳体。不锈钢板卷焊 → 法兰 → 试压。 */
    id: 'make/bosch-shell',
    name: 'Bosch 壳体制造',
    produces: [{ item: 'plant/bosch-reactor/shell', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] }],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 催化剂。氧化铝载体浸硝酸镍 → 干燥 → 焙烧 → 还原。焙烧要窑。 */
    id: 'make/bosch-catalyst',
    name: 'Bosch 催化剂制造',
    produces: [{ item: 'plant/bosch-reactor/catalyst', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/nickel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
    ],
    needs: ['plant/kiln'],
  },
  {
    /** 除水器。铜管束 + 不锈钢壳，颠倒过来当冷凝器用。 */
    id: 'make/bosch-condenser',
    name: 'Bosch 除水器制造',
    produces: [{ item: 'plant/bosch-reactor/condenser', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 卸碳机构。45 钢螺旋车成 → 铣螺旋面 → 轴端配水冷套。 */
    id: 'make/bosch-carbon-removal',
    name: 'Bosch 卸碳机构制造',
    produces: [{ item: 'plant/bosch-reactor/carbon-removal', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1) }] }],
    needs: ['plant/milling-machine', 'plant/grinder'],
    performedBy: 'lathe',
  },
  {
    /** 加热夹套。耐火砖砌体 + 薄板外壳，与壳体一起装配。 */
    id: 'make/bosch-heater',
    name: 'Bosch 加热夹套制造',
    produces: [{ item: 'plant/bosch-reactor/heater', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 设备条目 —— `composedOf` 一律由零件清单生成，不手抄
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 磁选机。把磁铁矿与钛铁矿从硅酸盐里分出来 —— 风化层到精矿的唯一一道。
 *
 * 其中**磁体标着未定义**：永磁铁氧体要锶或钡、铝镍钴要钴、电磁铁要铜，
 * 三条路在本层各缺一截。所以这台机器造得出，开不了工。
 */
export const MAGNETIC_SEPARATOR: Item = {
  id: 'plant/magnetic-separator',
  name: '磁选机',
  unit: '台',
  category: 'machine',
  composedOf: [...SEPARATOR_PARTS.map((p) => ({ item: p.id, qty: q(1) })), { item: 'std/motor-7.5kw-4p', qty: q(1) }],
};

/**
 * 直接还原炉。973 K 下用氢把铁从氧化物里拽出来，得到海绵铁而不是铁水。
 *
 * 难点不在温度，在 850 °C 下还要不漏气地进出料 —— 氢气漏出来是爆炸问题。
 */
export const REDUCTION_FURNACE: Item = {
  id: 'plant/reduction-furnace',
  name: '还原炉',
  unit: '台',
  category: 'machine',
  holds: [{ param: 'temperature', min: 650, max: 900 }],
  composedOf: [...REDUCTION_PARTS.map((p) => ({ item: p.id, qty: q(1) })), { item: 'std/motor-7.5kw-4p', qty: q(1) }],
};

/**
 * 气体分离装置。把 CO₂ 从 0.6 kPa 的大气里抽出来并提纯。
 *
 * 火星大气 95% 是 CO₂，按质量算 96.4% —— 分离本身不难，难在**压缩**：
 * 每公斤进气都要从 0.6 kPa 压到 100 kPa 量级，同样的质量要搬 160 倍的体积。
 * 分选用分级冷凝，冷量靠焦耳-汤姆逊效应自己产生，不要外部制冷剂。
 */
export const AIR_SEPARATOR: Item = {
  id: 'plant/air-separator',
  name: '空分装置',
  unit: '套',
  category: 'machine',
  composedOf: [...AIR_SEPARATOR_PARTS.map((p) => ({ item: p.id, qty: q(1) })), { item: 'std/motor-7.5kw-4p', qty: q(1) }],
};

/**
 * Bosch 反应器。镍床固定床承压壳 —— 全厂唯一一台通用催化反应器。
 *
 * 它现在干的活（温度窗口写在每条路线里，这里只列化学反应）：
 *
 *   制碳        CO₂ + 2H₂ → C + 2H₂O        500–700 °C
 *   变换        CO + H₂O → CO₂ + H₂         350–450 °C
 *   甲烷化      CO₂ + 4H₂ → CH₄ + 2H₂O      300–400 °C
 *   甲烷氯化    CH₄ + 3Cl₂ → CHCl₃ + 3HCl   350–450 °C
 *   甲醇合成    CO₂ + 3H₂ → CH₃OH + H₂O     250–300 °C
 *   甲醛氧化    CH₃OH + ½O₂ → HCHO + H₂O    600–700 °C
 *   乙炔环化    3C₂H₂ → C₆H₆               400–500 °C
 *   苯氯化      C₆H₆ + Cl₂ → C₆H₅Cl + HCl   300–400 °C
 *   硫还原      SO₂ + 2H₂ → S + 2H₂O        300–400 °C
 *   二硫化碳    CH₄ + 4S → CS₂ + 2H₂S       600–700 °C
 *   乙醛加氢    CH₃CHO + H₂ → C₂H₅OH        150–200 °C
 *   丁醇缩合    2C₂H₅OH → C₄H₉OH + H₂O     200–250 °C
 *   镁砂煅烧    Mg(OH)₂ → MgO + H₂O         600–750 °C
 *   砂轮固化    刚玉 + 树脂 → 砂轮           180–200 °C
 *
 * **不写"干了多少种活"。** 这个数以前写在注释里（"十种"、"十一种"），
 * 每加一条路线就错一分，而没人会回头数。数交给工具：
 * `node tools/report.ts` 的「执行设备负载」一节，那是每个提交都会跑的东西。
 *
 * 这些活挂在一台设备上，共同点只有三个：要压力、要催化、要几百度。
 *
 * **这不是设计得漂亮，是没有第二台可以分担。** 专用反应器一台都没有 ——
 * 加氢、水解、氯化、裂解、合成、煅烧全挤在同一个壳里，理由只有一个：
 * 写一台专用设备的零件与路线就是再写 80 行，而它能干的活与这台重合。
 * 这是缺口，不是优点；等某一项的量上来了，就该分家。
 *
 * 所以它的 `holds` 从 150 一直开到 750 —— 不是因为它能在任何温度下工作，
 * 是因为不同用途各占一段，而模型里一台设备只能有一个区间。
 *
 * 产物是固体碳与水：碳留下，水回收去电解，氢循环使用。这是火星上唯一
 * 不依赖生物、也不依赖石油的制碳路线。化学很干净，机械难题是把固体碳
 * 连续取出来而不漏气 —— 寿命由卸碳机构决定，不由壳体决定。
 */
export const BOSCH_REACTOR: Item = {
  id: 'plant/bosch-reactor',
  name: 'Bosch 反应器',
  unit: '台',
  category: 'machine',
  holds: [{ param: 'temperature', min: 150, max: 750 }],
  composedOf: [...BOSCH_PARTS.map((p) => ({ item: p.id, qty: q(1) })), { item: 'std/motor-7.5kw-4p', qty: q(1) }],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...SEPARATOR_PARTS, ...AIR_SEPARATOR_PARTS, ...BOSCH_PARTS, ...REDUCTION_PARTS, AIR_SEPARATOR, BOSCH_REACTOR, MAGNETIC_SEPARATOR, REDUCTION_FURNACE];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/air-separator',
    name: '空分装置装配',
    produces: [{
      item: 'plant/air-separator',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/bosch-reactor',
    name: 'Bosch 反应器装配',
    produces: [{
      item: 'plant/bosch-reactor',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/magnetic-separator',
    name: '磁选机装配',
    produces: [{
      item: 'plant/magnetic-separator',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/reduction-furnace',
    name: '还原炉装配',
    produces: [{
      item: 'plant/reduction-furnace',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...SEPARATOR_ROUTES, ...AIR_SEPARATOR_ROUTES, ...BOSCH_ROUTES, ...REDUCTION_ROUTES, ...ASSEMBLY_ROUTES];
