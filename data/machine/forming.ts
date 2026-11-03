/**
 * 成型与绕线 —— 轧机、绕线机、滚齿机。
 *
 * 这三台不算"母机"，也不算"工艺设备"：它们不改变材料的成分，只改变形状，
 * 而且各自只解决一件很窄的事。
 *
 *   轧机     把钢坯压成板、型材、线材 —— 冷轧薄板的唯一来源
 *   绕线机   把导线一层层绕进铁芯 —— 电机、变压器、感应线圈都要它
 *   滚齿机   切出齿形 —— 减速机、进给箱、主轴箱里全是齿轮
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 滚齿机的分度：又一道自指，但它有出口
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 滚齿是展成法：滚刀与工件按固定传动比同步旋转，齿就一个一个"长"出来。
 * 那个传动比靠**分度蜗轮副**保证，而蜗轮的齿只能滚出来 —— 于是滚齿机
 * 也要自己造自己。
 *
 * 出口是分度盘：盘上一圈精确等分的孔，插销定位、一个齿一个齿地分。
 * 孔位在铣镗床上用分度头镗出来，而分度头是铣镗床的附件，不需要滚齿。
 * 所以第一台滚齿机的精度比后面几台低一档，但没有断。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 两处材料缺口，都落在"刀具"上
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   轧辊   冷轧工作辊要 9Cr2Mo 这类合金锻钢，本链只有 40Cr —— 代用，
 *          淬硬层薄、寿命打折。
 *   滚刀   要高速钢或硬质合金，而两者都要钨，风化层里不到 1 ppm。
 *          用 40Cr 渗碳淬火代用，切几个齿轮就钝，得反复磨。
 *
 * 两处都不影响"造得出来"，只影响"能用多久"。按 1 kg → 1 件写，记在这里。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、轧机
// ═══════════════════════════════════════════════════════════════════════════

export const ROLLING_MILL_PARTS: readonly Item[] = [
  /**
   * 牌坊。两片铸钢／铸铁立柱加横梁，轧制力全从这里过。
   *
   * 冷轧的轧制力是几百吨级，牌坊的刚度直接决定板厚公差 —— 它是一座
   * 不会动的"门"，而门框的弹性就是产品的弹性。
   */
  { id: 'plant/rolling-mill/stand', name: 'Rolling Mill Housing', name_zh: '轧机牌坊', unit: '件', category: 'part' },

  /**
   * 轧辊。两根一对，钢坯从中间过，厚度由辊缝决定。
   *
   * 辊面要磨到镜面：冷轧板的表面就是轧辊表面的复制品。
   * ⚠️ 真轧辊是 9Cr2Mo 锻钢，本链只有 40Cr，代用后淬硬层浅、寿命短。
   */
  { id: 'plant/rolling-mill/rolls', name: 'Rolling Mill Rolls', name_zh: '轧机轧辊', unit: '件', category: 'part' },

  /** 压下装置。丝杠加蜗轮副，一点一点把辊缝压小 —— 压下量的分辨率就是板厚分辨率。 */
  { id: 'plant/rolling-mill/screwdown', name: 'Rolling Mill Screwdown', name_zh: '轧机压下装置', unit: '件', category: 'part' },

  /** 齿轮机座。把电机的扭矩分给上下两根轧辊，齿轮由滚齿机切。 */
  { id: 'plant/rolling-mill/drive', name: 'Rolling Mill Gear Housing', name_zh: '轧机齿轮机座', unit: '件', category: 'part' },

  /** 卷取机。把轧出来的薄板卷成卷，卷不齐后面就开不了平。 */
  { id: 'plant/rolling-mill/recoiler', name: 'Rolling Mill Coiler', name_zh: '轧机卷取机', unit: '件', category: 'part' },
];

export const ROLLING_MILL_ROUTES: readonly Route[] = [
  {
    /** 牌坊。HT300 浇 → 结合面铣 → 窗口面磨。 */
    id: 'make/rolling-stand',
    name: 'Rolling Mill Housing Manufacturing', name_zh: '轧机牌坊制造',
    produces: [{ item: 'plant/rolling-mill/stand', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht300', qty: q(1) }] }],
    needs: ['lathe', 'plant/milling-machine', 'plant/grinder'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /**
     * 轧辊。40Cr 锻 → 粗车 → 调质 → 精车 → 表面淬火 → 磨辊面。
     *
     * 辊颈要轴承，而且要**滚子轴承**：轧制力以 MN 计，球轴承在这里早被压扁。
     * 工作辊用圆锥滚子（径向 + 轴向定位），支承辊用圆柱滚子（只扛径向，承载更大）。
     */
    id: 'make/rolling-rolls',
    name: 'Rolling Mill Rolls Manufacturing', name_zh: '轧机轧辊制造',
    produces: [{ item: 'plant/rolling-mill/rolls', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] },
      { anyOf: [{ item: 'std/bearing-taper-roller-p0', qty: q(2) }] },
      { anyOf: [{ item: 'std/bearing-cylinder-roller-p0', qty: q(2) }] },
    ],
    needs: ['plant/grinder', 'plant/forge', 'std/micrometer-0-25'],
    performedBy: 'lathe',
  },
  {
    /** 压下装置。45 钢丝杠车螺纹后淬硬磨，蜗轮由滚齿机切。 */
    id: 'make/rolling-screwdown',
    name: 'Rolling Mill Screwdown Manufacturing', name_zh: '轧机压下装置制造',
    produces: [{ item: 'plant/rolling-mill/screwdown', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1) }] }],
    needs: ['plant/milling-machine', 'plant/gear-hobbing', 'plant/grinder'],
    performedBy: 'lathe',
  },
  {
    /** 齿轮机座。40Cr 齿轮锻件 → 滚齿 → 淬 → 磨齿面。 */
    id: 'make/rolling-drive',
    name: 'Rolling Mill Gear Housing Manufacturing', name_zh: '轧机齿轮机座制造',
    produces: [{ item: 'plant/rolling-mill/drive', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] }],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/gear-hobbing',
  },
  {
    /** 卷取机。薄板卷筒焊成 + 45 钢涨缩轴。 */
    id: 'make/rolling-recoiler',
    name: 'Rolling Mill Coiler Manufacturing', name_zh: '轧机卷取机制造',
    produces: [{ item: 'plant/rolling-mill/recoiler', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
];

/**
 * 轧机。把钢坯轧成板、型材、线材 —— 冷轧薄板是它最后一道。
 *
 * 它是薄板的唯一来源，而薄板是钣金工位的料，也是防护罩的料。
 */
export const ROLLING_MILL: Item = {
  id: 'plant/rolling-mill',
  name: 'Rolling Mill', name_zh: '轧机',
  unit: '套',
  category: 'machine',
  composedOf: [...ROLLING_MILL_PARTS.map((p) => ({ item: p.id, qty: q(1) })), { item: 'std/motor-7.5kw-4p', qty: q(1) }],
};

// ═══════════════════════════════════════════════════════════════════════════
// 二、绕线机
// ═══════════════════════════════════════════════════════════════════════════

export const WINDER_PARTS: readonly Item[] = [
  /** 机架。HT250 浇成，承主轴与排线导轨。 */
  { id: 'plant/winder/frame', name: 'Winder Frame', name_zh: '绕线机机架', unit: '件', category: 'part' },

  /** 主轴与卡盘。夹住骨架转，转速比要宽 —— 绕粗线慢、绕细线快。 */
  { id: 'plant/winder/mandrel', name: 'Winder Spindle and Chuck', name_zh: '绕线机主轴与卡盘', unit: '件', category: 'part' },

  /**
   * 排线丝杠。主轴转一圈，排线走一个线径 —— 否则线会叠在一起。
   *
   * 传动比靠挂轮选，不同线径换不同的轮。它是绕线机唯一需要精度的零件。
   */
  { id: 'plant/winder/traverse', name: 'Winder Traverse Lead Screw', name_zh: '绕线机排线丝杠', unit: '件', category: 'part' },

  /**
   * 张力轮。绕线的灵魂：张力不匀，线就一半松一半紧，线圈会鼓包。
   *
   * 用摩擦盘加弹簧，靠摩擦阻力给张力 —— 比磁粉离合器土，但不需要磁粉。
   */
  { id: 'plant/winder/tension', name: 'Winder Tension Wheel', name_zh: '绕线机张力轮', unit: '件', category: 'part' },

  /** 计数与排线控制。圈数必须准；这一段是种子里的电子元件。 */
  { id: 'plant/winder/control', name: 'Winder Counting and Traverse Control', name_zh: '绕线机计数与排线控制', unit: '件', category: 'part' },
];

export const WINDER_ROUTES: readonly Route[] = [
  {
    /** 机架。HT250 浇 → 结合面铣。 */
    id: 'make/winder-frame',
    name: 'Winder Frame Manufacturing', name_zh: '绕线机机架制造',
    produces: [{ item: 'plant/winder/frame', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] }],
    // 结合面在车床花盘上装铣头做（与锻炉机身、铣床工作台同一个土办法）——
    // 不写铣镗床，否则会形成「绕线机要铣床、铣床要锻炉、锻炉要电机、电机要绕线机」的死环。
    needs: ['lathe'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /**
     * 主轴与卡盘。**45 钢**车 → 淬 → 磨锥面。
     *
     * 原写 40Cr，而铬要「铬铁矿 → 矿热炉 → 微碳铬铁」一整条链。绕线机的主轴不挑：
     * 45 钢淬到 HRC 45–50 足够带卡盘转 —— **淬透性差一档，但车得动、磨得圆。**
     * 这是绕开铬的第一处；以后凡 40Cr 的件都要问一句：非它不可吗。
     */
    id: 'make/winder-mandrel',
    name: 'Winder Spindle and Chuck Manufacturing', name_zh: '绕线机主轴与卡盘制造',
    produces: [{ item: 'plant/winder/mandrel', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1) }] }],
    needs: ['plant/grinder'],
    performedBy: 'lathe',
  },
  {
    /** 排线丝杠。45 钢车螺纹 → 淬 → 磨。 */
    id: 'make/winder-traverse',
    name: 'Winder Traverse Lead Screw Manufacturing', name_zh: '绕线机排线丝杠制造',
    produces: [{ item: 'plant/winder/traverse', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1) }] }],
    needs: ['plant/grinder'],
    performedBy: 'lathe',
  },
  {
    /** 张力轮。40Cr 摩擦盘车磨 + 弹簧压紧，张力靠手感调，靠摩擦稳。 */
    id: 'make/winder-tension',
    name: 'Winder Tension Wheel Manufacturing', name_zh: '绕线机张力轮制造',
    produces: [{ item: 'plant/winder/tension', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1) }] }],
    // 排线丝杠的螺旋槽与轴端：车螺纹 + 花盘装铣头 —— 不写铣镗床。
    needs: ['plant/grinder'],
    performedBy: 'lathe',
  },
  {
    /**
     * 控制单元（半导体版）。功率器件与计数器从地球来，装配不要机器，机器人装。
     *
     * 备选件：`std/control-board-discrete` 是第二供应（anyOf 第二备选），
     * DFS 选 `std/control-board-general`，它不进证明树属预期（PLAN 监控项，不删不塞）。
     */
    id: 'make/winder-control',
    name: 'Winder Counting and Traverse Control Manufacturing', name_zh: '绕线机计数与排线控制制造',
    produces: [{ item: 'plant/winder/control', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/power-device-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }, { item: 'std/control-board-discrete', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 控制单元（机电版）。**不要半导体的第二条来路。**
     *
     * 绕线机要三件事，只有一件需要"算"：
     *
     *   数圈数   机械计数器（字轮 + 棘轮 + 拨杆），`std/counter-mechanical-general`
     *   正反转   两只接触器互锁 —— 按错不会短路
     *   到位停   行程开关（一对触点）
     *
     * 代价是不能**预置**：机械计数器只能数到多少是多少，设不了"1000 圈自动停"。
     * 那要人盯着字轮、到数了按停 —— 而本层的"人"就是机器人，它本来在盯着。
     *
     * 这是断供试验里唯一"不要控制板也能做"的控制单元，所以它把绕线机从
     * 功率器件与控制板两处依赖里一起解出来。
     */
    id: 'make/winder-control-relay',
    name: 'Winder Counting and Traverse Control Manufacturing', name_zh: '绕线机计数与排线控制制造',
    produces: [{ item: 'plant/winder/control', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/counter-mechanical-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
];

/**
 * 绕线机。绕线圈、绕电机定子、绕变压器。
 *
 * 它是最难自动化的工序之一 —— 而电机在 data/ 里一次都没出现过
 * （见 data/material/entry.ts 的"电机"那一节）。这台机器是补那条链的第一步。
 *
 * ⚠️ **这台不带电机**：原来写 std/motor-7.5kw-4p，于是
 * 「绕线机要电机 → 电机绕组要绕线机」成了死环。19 世纪的绕线机是**手摇 + 飞轮**的：
 * 摇柄经一对齿轮带主轴，飞轮把转动拉平，丝杠挂轮照旧排线。
 *
 * 所以这一台是第一代：**一个人摇、一个人看圈数**（看的是控制单元那块板）。
 * 电机通了之后，把摇柄换成皮带轮即可 —— 结构不用改。
 */
export const WINDER: Item = {
  id: 'plant/winder',
  name: 'Winder', name_zh: '绕线机',
  unit: '台',
  category: 'machine',
  composedOf: WINDER_PARTS.map((p) => ({ item: p.id, qty: q(1) })),
};

// ═══════════════════════════════════════════════════════════════════════════
// 三、滚齿机
// ═══════════════════════════════════════════════════════════════════════════

export const GEAR_HOBBING_PARTS: readonly Item[] = [
  /** 床身。HT300 浇，导轨面磨 —— 与车床同类，但更怕振动。 */
  { id: 'plant/gear-hobbing/bed', name: 'Gear Hobbing Machine Bed', name_zh: '滚齿机床身', unit: '件', category: 'part' },

  /** 立柱与刀架。HT300 浇，滚刀装在上面，能轴向窜刀 —— 刀磨短了往里送。 */
  { id: 'plant/gear-hobbing/column', name: 'Gear Hobbing Machine Column and Tool Post', name_zh: '滚齿机立柱与刀架', unit: '件', category: 'part' },

  /** 滚刀主轴。40Cr 锻 → 淬 → 磨，与工件主轴按固定传动比同步。 */
  { id: 'plant/gear-hobbing/hob-spindle', name: 'Gear Hobbing Machine Hob Spindle', name_zh: '滚齿机滚刀主轴', unit: '件', category: 'part' },

  /**
   * 分度盘。一圈精确等分的孔，插销定位。
   *
   * **它是这台机器不自指的原因**：孔位在铣镗床上用分度头镗出来，而分度头
   * 是铣镗床的附件 —— 不需要滚齿。代价是分度是断续的，精度比蜗轮副低一档。
   */
  { id: 'plant/gear-hobbing/index-plate', name: 'Gear Hobbing Machine Index Plate', name_zh: '滚齿机分度盘', unit: '件', category: 'part' },

  /**
   * 滚刀。轴向开槽的蜗杆，槽就是切削刃。
   *
   * ⚠️ 真滚刀要高速钢或硬质合金，两者都要钨，而风化层里不到 1 ppm ——
   * 硬质合金只能从地球带。这里用 40Cr 渗碳淬火代用，切几个齿轮就钝。
   */
  { id: 'plant/gear-hobbing/hob', name: 'Gear Hobbing Machine Hob', name_zh: '滚齿机滚刀', unit: '件', category: 'part' },
];

export const GEAR_HOBBING_ROUTES: readonly Route[] = [
  {
    /** 床身。HT300 浇 → 时效 → 导轨面磨。 */
    id: 'make/gear-bed',
    name: 'Gear Hobbing Machine Bed Manufacturing', name_zh: '滚齿机床身制造',
    produces: [{ item: 'plant/gear-hobbing/bed', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht300', qty: q(1) }] }],
    needs: ['lathe', 'plant/milling-machine', 'plant/grinder'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 立柱与刀架。HT300 浇 → 导轨磨 → 与床身配刮出垂直。 */
    id: 'make/gear-column',
    name: 'Gear Hobbing Machine Column and Tool Post Manufacturing', name_zh: '滚齿机立柱与刀架制造',
    produces: [{ item: 'plant/gear-hobbing/column', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht300', qty: q(1) }] }],
    needs: ['lathe', 'plant/milling-machine', 'plant/grinder'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 滚刀主轴。40Cr 锻 → 淬 → 磨锥面与轴颈。 */
    id: 'make/gear-hob-spindle',
    name: 'Gear Hobbing Machine Hob Spindle Manufacturing', name_zh: '滚齿机滚刀主轴制造',
    produces: [{ item: 'plant/gear-hobbing/hob-spindle', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] }],
    needs: ['plant/grinder'],
    performedBy: 'lathe',
  },
  {
    /** 分度盘。45 钢淬硬，孔位用分度头在铣镗床上镗 —— 这是环的出口。 */
    id: 'make/gear-index-plate',
    name: 'Gear Hobbing Machine Index Plate Manufacturing', name_zh: '滚齿机分度盘制造',
    produces: [{ item: 'plant/gear-hobbing/index-plate', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1) }] }],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 滚刀。40Cr 车蜗杆 → 铣容屑槽 → 渗碳淬火 → 铲磨齿形。 */
    id: 'make/gear-hob',
    name: 'Gear Hobbing Machine Hob Manufacturing', name_zh: '滚齿机滚刀制造',
    produces: [{ item: 'plant/gear-hobbing/hob', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] }],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/milling-machine',
  },
];

/**
 * 滚齿机。齿轮的齿形从它出来 —— 减速机、进给箱、主轴箱里全是齿轮。
 *
 * 分度盘那一件是它造得出来的理由；滚刀那一件是它只能凑合的理由。
 */
export const GEAR_HOBBING: Item = {
  id: 'plant/gear-hobbing',
  name: 'Gear Hobbing Machine', name_zh: '滚齿机',
  unit: '台',
  category: 'machine',
  composedOf: [...GEAR_HOBBING_PARTS.map((p) => ({ item: p.id, qty: q(1) })), { item: 'std/motor-7.5kw-4p', qty: q(1) }],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...GEAR_HOBBING_PARTS, ...ROLLING_MILL_PARTS, ...WINDER_PARTS, GEAR_HOBBING, ROLLING_MILL, WINDER];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/gear-hobbing',
    name: 'Gear Hobbing Machine Assembly', name_zh: '滚齿机装配',
    produces: [{
      item: 'plant/gear-hobbing',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/rolling-mill',
    name: 'Rolling Mill Assembly', name_zh: '轧机装配',
    produces: [{
      item: 'plant/rolling-mill',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/winder',
    name: 'Winder Assembly', name_zh: '绕线机装配',
    produces: [{
      item: 'plant/winder',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...WINDER_ROUTES, ...GEAR_HOBBING_ROUTES, ...ROLLING_MILL_ROUTES, ...ASSEMBLY_ROUTES];
