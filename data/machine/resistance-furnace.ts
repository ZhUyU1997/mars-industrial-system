/**
 * 电阻炉 —— 本层第一台**专用于热处理**的炉子。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它解决的是一个一直在借的问题
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 在此之前，全表的热处理都在借温度窗口：
 *
 *   淬火 830–860 / 回火 550–600   借还原炉（650–900，本来是通氢还原铁矿的）
 *   球化退火 780–800              借窑（1200–1750，本来是烧耐火料的）
 *   氮化 520–560                  **无处可借** —— 窑太热、还原炉太热、Bosch 太冷
 *
 * 借壳不算错，但它有一个后果：**工序的温度与炉子的用途绑在一起**。想在 550 °C
 * 保温四小时，得先有一台正在还原铁矿的炉子空出来 —— 这不是工艺，是排产。
 *
 * 电阻炉把这件事解开：镍铬丝（`mat/resistance-wire`）自己就是发热体，
 * 通电就热，断电就停，温度只由调压与保温决定。**加热第一次变成开关。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 100–1100 °C 这一档，覆盖了本层全部热处理
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   球化退火 780–800 · 淬火 830–860 · 回火 150–600 · 时效 120–180 · 氮化 520–560
 *
 * 上限 1100 是镍铬丝定的（1200 °C 长期使用会晶粒长大、丝变脆）；再高要碳化硅棒，
 * 那是另一种加热元件，本层没有建。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 氮化靠那只密封罐
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 氮化不是"加热到 550"就行：要**氨气氛**在工件表面分解出活性氮。所以这台炉子
 * 比普通箱式炉多一件 `retort`：不锈钢密封罐、氨入口、排气口。
 *
 *   通氨 → 550 保温 → 排气烧掉残氨      （氨有，哈伯法）
 *
 * 这一件让减速器柔轮（data/machine/reducer.ts）的表面强化不再退到调质 ——
 * 那条降级是"没有 500–560 的炉子"逼出来的，现在那个理由没了。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 控温：低温段有仪表，高温段只有测温锥与火色
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 本层读不了任意温度的热电偶 —— 铜-康铜（T 型）只到 350 °C，830 °C 的淬火它读不了。
 * 所以这台炉子有**两套量法，各管各的温区**：
 *
 *   低温段 0–350      T 型热电偶 + 动圈检流计（磁铁矿磁体）。回火、时效、浸漆用它。
 *                    约 ±5 °C —— 第一次有"能读、能连续读、能装进控制回路"的温度。
 *   高温段 600–1100   测温锥（塞格锥，一次一支）+ 火色（600 暗红 / 900 橙 / 1100 黄白）
 *
 * 上一版这里写的是"本层读不了热电偶" —— 那句话在磁体做出来之后失效了：
 * 检流计要的磁体，从磁铁矿压制烧结充磁就有（`std/permanent-magnet-general`）。
 *
 * 功率调节靠自耦调压（抽头换接），不靠闭环 —— 保温精度只有几十度，
 * 淬火与氮化够用，等温淬火不够。**这句话要留着：它不是一台精密炉。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 数字
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 不写质量：炉膛尺寸与功率都没定，整机重量算不出来。路线按 `1 kg → 1 件`，
 * 只证明拓扑。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const RESISTANCE_FURNACE_PARTS: readonly Item[] = [
  /** 炉壳。薄钢板卷焊成箱，开炉门、接线孔与排气口；外壳温度靠衬层压下来。 */
  { id: 'plant/resistance-furnace/shell', name: 'Resistance Furnace Shell', name_zh: '电阻炉炉壳', unit: '件', category: 'part' },

  /**
   * 耐火衬。高铝砖砌内层，矿棉填外层，中间夹一层铝箔反射。
   *
   * 它是这台炉子效率的全部：衬不好，热量从炉壁跑掉，等于在给车间加热。
   * 砌筑与熔炼炉的炉衬同一手艺（机器人捣实/砌筑），但不需要烧结 ——
   * 电阻炉的衬不受熔渣侵蚀，只要耐温与保温。
   */
  { id: 'plant/resistance-furnace/lining', name: 'Resistance Furnace Refractory Lining', name_zh: '电阻炉耐火衬', unit: '件', category: 'part' },

  /**
   * 加热元件。镍铬丝绕在陶瓷管上，分三组挂在炉膛两侧与炉底。
   *
   * 分组是为了**调功率**：一组、两组、三组串并联，配上抽头就是几档功率。
   * 它是炉子里唯一会烧断的零件，也是唯一可以现场换的 —— 拔出来换一根。
   */
  { id: 'plant/resistance-furnace/heating', name: 'Resistance Furnace Heating Element', name_zh: '电阻炉加热元件', unit: '件', category: 'part' },

  /**
   * 密封罐（氮化用）。不锈钢筒 + 法兰盖 + 氨入口 + 排气口。
   *
   * 平时不装；要氮化时放进炉膛，工件封在罐里通氨。**它是这台炉子从
   * "能加热"变成"能做表面强化"的那一件** —— 氮化、渗碳、光亮退火都靠它。
   */
  { id: 'plant/resistance-furnace/retort', name: 'Resistance Furnace Retort', name_zh: '电阻炉密封罐', unit: '件', category: 'part' },

  /** 炉门与料筐。炉门带配重与压紧手轮；料筐用耐热钢盘条焊成，工件装筐进出。 */
  { id: 'plant/resistance-furnace/door', name: 'Resistance Furnace Door and Charge Basket', name_zh: '电阻炉炉门与料筐', unit: '件', category: 'part' },
];

export const RESISTANCE_FURNACE_ROUTES: readonly Route[] = [
  {
    /** 炉壳。薄板剪折 → 焊接 → 开孔 → 与炉门框配作。 */
    id: 'make/resistance-shell',
    name: 'Resistance Furnace Shell Manufacturing', name_zh: '电阻炉炉壳制造',
    produces: [{ item: 'plant/resistance-furnace/shell', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] }],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 耐火衬。高铝砖砌内层，矿棉填外层 —— 砌是装配，执行者是机器人。 */
    id: 'make/resistance-lining',
    name: 'Resistance Furnace Refractory Lining Manufacturing', name_zh: '电阻炉耐火衬制造',
    produces: [{ item: 'plant/resistance-furnace/lining', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 加热元件。镍铬丝在陶瓷管上绕成螺旋，两端引棒焊出。
     *
     * 螺旋间距要均匀 —— 间距不匀就是局部过热，那一截先烧断。这一条是**手上功夫**，
     * 模型只能写"绕"：没有设备，执行者是机器人。
     */
    id: 'make/resistance-heating',
    name: 'Resistance Furnace Heating Element Manufacturing', name_zh: '电阻炉加热元件制造',
    produces: [{ item: 'plant/resistance-furnace/heating', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
    ],
    needs: ['plant/kiln'],
    performedBy: 'plant/robot',
  },
  {
    /** 密封罐。不锈钢筒卷焊 → 法兰盖车配 → 氨入口与排气管焊 → 试压。 */
    id: 'make/resistance-retort',
    name: 'Resistance Furnace Retort Manufacturing', name_zh: '电阻炉密封罐制造',
    produces: [{ item: 'plant/resistance-furnace/retort', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 炉门与料筐。炉门钢板焊 + 配重；料筐用 40Cr 盘条焊成，耐热靠氧化皮。 */
    id: 'make/resistance-door',
    name: 'Resistance Furnace Door and Charge Basket Manufacturing', name_zh: '电阻炉炉门与料筐制造',
    produces: [{ item: 'plant/resistance-furnace/door', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/forge'],
    performedBy: 'plant/sheet-shop',
  },
];

/**
 * 电阻炉。100–1100 °C，五件加一只电机（调压与炉门升降用）。
 *
 * `holds` 的区间是它的**能力**，不是它的精度：保温精度只有几十度 ——
 * 淬火、回火、氮化够用，等温淬火不够。那一句写在文件头，不进模型（模型没有精度字段）。
 */
export const RESISTANCE_FURNACE: Item = {
  id: 'plant/resistance-furnace',
  name: 'Resistance Furnace', name_zh: '电阻炉',
  unit: '台',
  category: 'machine',
  holds: [{ param: 'temperature', min: 100, max: 1100 }],
  composedOf: [
    ...RESISTANCE_FURNACE_PARTS.map((p) => ({ item: p.id, qty: q(1) })),
    { item: 'std/motor-7.5kw-4p', qty: q(1) },
    // 通断靠接触器。这台炉子没有调节器（控温只有测温锥与火色），
    // 所以"到温断电"就是它唯一的控制手段 —— 而通断不需要半导体。
    { item: 'std/contactor-general', qty: q(1) },
    // 低温段有仪表：铜-康铜热电偶 + 动圈检流计，覆盖 0–350 °C。
    // 回火（150–600）、时效（120–180）用它；830 °C 以上它读不了（T 型上限 350），
    // 那一段仍靠测温锥与火色 —— 一台炉子两套量法，各管各的温区。
    { item: 'std/thermocouple-t-general', qty: q(1) },
    // 读数用毫伏表（检流计 + 两级晶体管放大），不是裸检流计 —— 后者分到 25 °C，
    // 前者分到 1 °C 级。而放大用的晶体管，正是这台炉子的温度养出来的。
    { item: 'std/millivoltmeter-general', qty: q(1) },
    // 温控器（模拟 PID）：把"到温断电"换成"按偏差补"。
    // 炉子第一次有闭环 —— 温度不再上下冲，而是贴着设定值慢慢靠。
    { item: 'std/temp-controller-general', qty: q(1) },
    // 程序升温：热处理工艺成为可复制的曲线。
    // 先装机械式（凸轮盘），电子式等芯片链起来后再做父设计变体。
    {
      item: 'iface/ramp-controller',
      qty: q(1),
      select: 'std/ramp-controller-general',
    },
    // 数字过程控制器：读一个数、算一下、动一下、记下来。
    // 它接替模拟温控器管复杂流程，也把那 32 个点的历史留下来。
    { item: 'std/process-controller-general', qty: q(1) },
  ],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...RESISTANCE_FURNACE_PARTS, RESISTANCE_FURNACE];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/resistance-furnace',
    name: 'Resistance Furnace Assembly', name_zh: '电阻炉装配',
    produces: [{
      item: 'plant/resistance-furnace',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...RESISTANCE_FURNACE_ROUTES, ...ASSEMBLY_ROUTES];
