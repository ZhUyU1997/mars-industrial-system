/**
 * 光学比较仪 —— 量块的复制线路。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 先分清两件事：标定与复制
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   标定（绝对）  把"一米"定出来。要原子跃迁、要干涉仪、要光电计数 —— 要电子元件
 *   复制（相对）  把已有的尺寸传下去。只要**比较**，不要绝对长度
 *
 * 前面把这两件事混成了一件事，于是得出"量块要电子元件"的结论。**那是标定，
 * 不是复制。** 而实际上需要的只是复制：基准那 87 块已经带来了，剩下的问题
 * 是"能不能照着它做出更多块来"。
 *
 * 复制只要三样：**研磨**（把块磨到接近）、**比较**（读出差多少）、**再研磨**。
 * 而比较可以用纯光学完成 —— 这就是光学比较仪。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 杠杆加反射镜，两级放大
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 测头贴在量块上，位移先经一个**杠杆**放大几倍（刀口支承，硬钢对硬钢），
 * 再经**自准直光管**：光管里一块反射镜随杠杆转，转角把光点推到刻度尺上，
 * 又放大几十倍。两级叠起来 1,000–12,000 倍。
 *
 * 所以 0.1 µm 的位移，在目镜里是 0.1–1 mm 的刻度移动 —— **人眼直接读**。
 *
 * 没有光电元件，没有放大电路。光来自**日光**（毛玻璃漫射），连灯都不要：
 * 白天对着窗户就能用。夜里用一支碳弧灯（碳棒我们有），但那是可选的。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 刻度尺：这台设备里唯一需要"分度"的零件
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 刻度刻在玻璃上，线距 0.1 mm 量级 —— 那是**宏观尺寸**，用车床的丝杠
 * 带一刻线刀就能刻，或者用分度头。它不是光栅，不需要 1 µm 的线。
 *
 * 这是"精度可以逐级传递"的地方：基准量块（亚微米）→ 比较仪（读 0.1 µm）
 * → 工作量块（±0.5 µm）。**每一级都比上一级松，所以每一级都做得出来。**
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const COMPARATOR_PARTS: readonly Item[] = [
  /**
   * 底座与立柱。HT250 浇成，一次加工 —— 测头与工作台的相对位置要稳定，
   * 而钢的热膨胀在 1 °C 的温差下就有 10 µm/m，所以底座要厚、要大热容。
   */
  { id: 'plant/comparator/base', name: '量块比较仪底座与立柱', unit: '件', category: 'part' },

  /**
   * 升降工作台。承载量块并做粗调，微调靠斜楔。
   *
   * 台面要研过 —— 量块是"研合"在台面上的（靠分子力贴住），台面糙了就贴不住。
   */
  { id: 'plant/comparator/table', name: '量块比较仪升降工作台', unit: '件', category: 'part' },

  /**
   * 杠杆机构。刀口支承的硬钢杠杆，传动比 3–5 倍。
   *
   * 刀口是两根磨到刃的硬钢棱 —— 它靠**线接触**实现无间隙转动，
   * 比轴承的间隙小两个数量级。这是整台仪器最难的零件。
   */
  { id: 'plant/comparator/lever', name: '量块比较仪杠杆机构', unit: '件', category: 'part' },

  /**
   * 自准直光管。一块反射镜挂在杠杆上，光线经它反射回来成像。
   *
   * 镜面要平（λ/4 以内），而本层只能研磨到 λ 级 —— 够用，因为这里是
   * 比较不是干涉，波前误差只影响像的清晰度，不影响读数。
   */
  { id: 'plant/comparator/mirror', name: '量块比较仪自准直光管', unit: '件', category: 'part' },

  /**
   * 刻度尺与目镜。玻璃上刻线，线距 0.1 mm，配一个简单放大镜读数。
   *
   * 刻线用刻线刀在涂蜡的玻璃上划，再氢氟酸轻蚀 —— 用的是已有的玻璃与氢氟酸。
   */
  { id: 'plant/comparator/reticle', name: '量块比较仪刻度尺与目镜', unit: '件', category: 'part' },

  /**
   * 研磨平板。铸铁盘，**三块一套**，互相研磨到平面。
   *
   * 这是计量里最漂亮的一招：**要一块平的东西，不需要任何平的基准。**
   * 三块板两两对研（A 磨 B、B 磨 C、C 磨 A），反复换对 —— 凸的地方先被磨掉，
   * 最后三块同时变平。因为两块凸面互相磨，接触点总在凸处，越磨越平。
   *
   * 惠特沃斯 1830 年代的做法，到今天仍是平面的定义方式。
   * **平面度是本层第一个不需要外部基准就能自举的量。**
   */
  { id: 'plant/comparator/lapping-plate', name: '量块比较仪研磨平板', unit: '套', category: 'part' },
];

export const COMPARATOR_ROUTES: readonly Route[] = [
  {
    /** 底座。HT250 浇 → 时效 → 铣平面 → 磨导轨面。 */
    id: 'make/comparator-base',
    name: '量块比较仪底座与立柱制造',
    produces: [{ item: 'plant/comparator/base', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] }],
    needs: ['lathe', 'plant/milling-machine', 'plant/grinder'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 工作台。45 钢车 → 淬 → 研磨台面（用刚玉磨料对研）。 */
    id: 'make/comparator-table',
    name: '量块比较仪升降工作台制造',
    produces: [{ item: 'plant/comparator/table', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(1) }] },
    ],
    needs: ['plant/grinder'],
    performedBy: 'lathe',
  },
  {
    /** 杠杆。GCr15 淬火后磨刀口，两条刃要平行到微米级。 */
    id: 'make/comparator-lever',
    name: '量块比较仪杠杆机构制造',
    produces: [{ item: 'plant/comparator/lever', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/bearing-steel', qty: q(1) }] }],
    needs: ['lathe', 'plant/forge'],
    performedBy: 'plant/grinder',
  },
  {
    /** 反射镜。玻璃研磨 → 抛光（用刚玉微粉）→ 不镀膜，靠 4% 反射。 */
    id: 'make/comparator-mirror',
    name: '量块比较仪自准直光管制造',
    produces: [{ item: 'plant/comparator/mirror', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(1) }] },
    ],
    needs: ['plant/grinder'],
    performedBy: 'lathe',
  },
  {
    /** 刻度尺。玻璃涂蜡 → 刻线（车床丝杠带刀）→ 氢氟酸轻蚀 → 去蜡。 */
    id: 'make/comparator-reticle',
    name: '量块比较仪刻度尺与目镜制造',
    produces: [{ item: 'plant/comparator/reticle', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'lathe',
  },
  {
    /**
     * 研磨平板：**三块一套，先各自磨平，再两两对研**。
     *
     *   3 kg 铸铁 + 1 kg 刚玉微粉 → 3 块平板（一套）
     *
     * A 磨 B、B 磨 C、C 磨 A，换着对磨几轮。两块的接触点总落在凸处，
     * 所以凸的被磨掉、凹的磨不到 —— 三块互为基准，最后同时变平。
     *
     * 关键在于**三块**：两块对磨会一块凸一块凹（互相吻合），永远平不了；
     * 第三块让这个错误暴露出来。
     *
     * 研磨剂用刚玉微粉（W 系列，本层从熔融氧化铝筛分来）。
     */
    id: 'make/lapping-plate',
    name: '量块比较仪研磨平板制造',
    produces: [{ item: 'plant/comparator/lapping-plate', qty: q(3) }],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(3) }] },
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/grinder',
  },
];

/**
 * 光学比较仪。读数 0.1 µm，全程不碰电。
 *
 * 它是量块的**复制工具**：把基准块当尺子，一块一块比出来。
 * 也是本层第一次做到"亚微米读数" —— 前面所有精度都止步在千分尺的量级。
 */
export const COMPARATOR: Item = {
  id: 'plant/comparator',
  name: '量块比较仪',
  unit: '台',
  category: 'machine',
  composedOf: [...COMPARATOR_PARTS.map((p) => ({ item: p.id, qty: q(1) }))],
};

// ═══════════════════════════════════════════════════════════════════════════
// 工作量块：靠基准块比出来的
// ═══════════════════════════════════════════════════════════════════════════

export const GAUGE_BLOCK_ITEMS: readonly Item[] = [
  /**
   * K 级量块单块。一套 87 块的常规配置：1.005 起、逐级到 100 mm，
   * 靠不同组合研合出任意尺寸。
   *
   * **它是 `plant/gauge-block` 那一套的零件，不在种子清单上** —— 因为它有路线
   * （make/gauge-block-copy）。种子放的是那一套：套没有路线，块有。
   * 与车床同型：车床在种子里，九个零件都不在。
   *
   * id 挂在那一套下面（`plant/gauge-block/block`），而不是写成 `std/gauge-block-k`：
   * 规格**由那一套决定**（专用件形式 `<machine>/<name>`）。
   * 写成 `std/` 会被 `std_single_use` 提示成"只被一台机器用到" —— 而它确实
   * 只被那一套用到，那条提示在这里是误报的另一种写法。
   */
  {
    id: 'plant/gauge-block/block',
    name: 'K 级量块单块',
    unit: '件',
    category: 'part',
    // 研合性：块与块贴住之后拉开的间隙。量块的用处全在这一层膜上 ——
    // 研不住就是两块铁，研住了才是一套基准。见 measure/gauge-block-wringing。
    props: [{ param: 'wringGap', kind: 'range', min: 0, max: 100, unit: 'nm', dir: 'atMost' }],
  },


  /**
   * 工作量块。**1 级，±1 µm** —— 与它的母块同级。
   *
   * 上一版这里写的是"0 级，±0.2 µm"，那是错的：**复制品不可能比母块好。**
   *
  *   母块 1 级 ±1.0 µm  +  复制误差 0.015 µm  =  ±1.015 µm  → 还是 1 级
   *
   * 复制几乎不损失精度（0.015 对 1000 nm 是 1.5%），但也**不提升**。
   * 所以级别是母块的级别，母块的级别是光源的级别 —— 想提级要换谱线，
   * 不是换复制方法。
   *
   * ⚠️ 这个 id **不携带级别**：对着 1 级母块复制就是 1 级，对着 K 级母块复制
   * 就接近 K 级。想让 K 级存下去，产出的是 `plant/gauge-block/block`
   * （见 make/gauge-block-copy），不是这个 id —— 那个是回去当基准的，
   * 这个是发给车间的。
   *
   * 分档按精度等级，和轴承的 P0/P5 一样：`std/gauge-block-working`。
   *
   * 窗口按本文件自己的算术写：母块 1 级 ±1.0 µm + 复制误差 0.015 µm = **±1.015 µm**；
   * 对着 K 级种子套复制时是 **±0.101 µm**（`make/gauge-block-working-k` 注释里给的
   * 合成值 √(0.1²+0.015²)）。`deviation` 就是"与证书值最多差多少"，两条路线各交各的档。
   */
  {
    id: 'std/gauge-block-working',
    name: '工作量块',
    unit: '件',
    category: 'part',
    props: [{ param: 'deviation', kind: 'range', min: 0, max: 5, unit: 'µm', dir: 'atMost' }],
  },
];

/**
 * 量块的四条路线，按"母块是谁"和"出去干什么"分：
 *
 *   路线                          母块             产出                 用途
 *   make/gauge-block-reference    无（钠 D 线）     std/…-reference      1 级基准
 *   make/gauge-block-working      1 级基准          std/…-working        车间
 *   make/gauge-block-working-k    K 级种子套        std/…-working        车间
 *   make/gauge-block-copy         K 级种子套        plant/…/block        同级基准，补套
 *
 * 前三条造"往下用"的块，最后一条造"回去当基准"的块 —— **它让那 87 块不只出不进。**
 * 缺了它，种子自给那张表会指着 `plant/gauge-block/block` 说"没有路线"，
 * 而那正是"可复制"这三个字没落实的地方。
 */
export const GAUGE_BLOCK_ROUTES: readonly Route[] = [
  {
    /**
     * 工作量块的复制：磨 → 比 → 再磨。
     *
     *   1 kg 轴承钢 → 1 块工作量块
     *
     * 工序：淬火回火（830–860 °C）→ 粗磨 → **时效**（放几个月让内应力释放，
     * 否则尺寸会自己走）→ 精磨 → 研磨 → 用比较仪对着基准块读到差多少 →
     * 再研磨。往复直到与母块的差落在 ±0.015 µm 以内 —— 这个差值靠干涉仪读，\n     * 但**成品级别仍随母块**（母块 1 级，复制品就是 1 级）。
     *
     * **基准块在 `needs` 里，不在 `uses` 里** —— 它是"在场的前提"，不被消耗。
     * 这是 `needs` 第一次用来指一件非设备：量块不是机器，但它必须存在，
     * 而且不许被吃掉。语义正合适。
     *
     * ⚠️ **这个"不被消耗"是个简化，别当真。** 研合与测量都在磨基准块，
     * K 级块用几年就要重新检定。而模型没有 `wear` 字段，所以"一个基准套
     * 能带出几套工作量块"这个数算不出来 —— 而它正是复制率的上限。
     *
     * **拓扑是星形，不是链式。** 每一块新块都直接对着 87 块原器比，
     * 不能拿上一代新块当基准（那样误差会逐代累积：±0.2 → ±0.4 → ±0.8）。
     * 这条拓扑在数据里只体现为一件事：`needs` 里写的是 `plant/gauge-block`，
     * 不是 `std/gauge-block-working`。**写错这一个 id，第二条复制线就废了。**
     *
     * 一处本层表示不出来，一处刚刚表示出来了：
     *
     *   ① **时效**要放几个月让内应力释放，否则尺寸会自己走 —— 没有时间维度。
     *      其余热处理现在都有地方了：球化退火 780–800、淬火 830–860、回火 150–160
     *      全归 `plant/resistance-furnace`（100–1100 °C）；冷处理 −78.5 用干冰。
     *   ② **恒温**：亚微米比较要在 20 ± 1 °C 里做（100 mm 的钢，1 °C 温差
     *      就走 1.2 µm，正好是这里要判定的那个量）。这一条**已经能写了** ——
     *      条件由 `plant/metrology-room` 承担，它在 `needs` 里，不执行工序，
     *      只维持温度。`no_machine` 的候选清单本来就把 `needs` 算进去，
     *      所以"由磨床执行、在恒温间里进行"这句话是说得出来的。
     */
    id: 'make/gauge-block-working',
    name: '工作量块的复制',
    produces: [
      {
        item: 'std/gauge-block-working',
        qty: q(1),
        // 母块 1 级 ±1.0 µm + 复制误差 0.015 µm（本文件注释的同一算术）。
        gives: [{ param: 'deviation', kind: 'range', max: 1.015, dir: 'atMost' }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/bearing-steel', qty: q(1) }] },
      // 冷处理把残余奥氏体逼成马氏体 —— 不做，块会在几个月里自己变形，白磨。
      // 干冰几小时就升华光，所以它是"工序的输入"，不是库存品。
      { anyOf: [{ item: 'mat/dry-ice', qty: q(1) }] },
    ],
    needs: [
      'plant/comparator/lapping-plate',
      'plant/comparator',
      'plant/interferometer',
      'lathe',
      'plant/forge',
      'std/gauge-block-reference',
      'plant/metrology-room',
      'plant/radiator',
    ],
    performedBy: 'plant/grinder',
    under: [{ param: 'temperature', min: 19, max: 21 }],
  },
  {
    /**
     * 工作量块 —— **第二条路线：对着运来的 K 级比。**
     *
     *   1 kg 轴承钢 + 1 kg 干冰 → 1 块（精度上限随 K 级，±0.1 µm）
     *
     * 同一个产出、两条路线，差别只在**对着谁比**：
     *
     *   make/gauge-block-working    对着自造的 1 级比  → 可续，但只到 1 级
     *   本路线                       对着运来的 K 级比  → 上限 K 级，受数量限制
     *
     * 这不是重复，是**两种情形**：K 级那 87 块还在、还没磨旧时，拿它当母块能得到
     * 接近 K 级（±0.101 µm）的块；等它磨旧了，就只能退回 1 级那条。
     * **不会比母块更好** —— 复制只传递，不提升。
     *
     * **一套 K 级能带出多少套，取决于磨损 —— 而磨损模型里没有。** 所以这里
     * 只能写"两条都能走"，写不出"能走多少次"。
     */
    id: 'make/gauge-block-working-k',
    name: '工作量块制造',
    produces: [
      {
        item: 'std/gauge-block-working',
        qty: q(1),
        // 对着 K 级母块：√(0.1² + 0.015²) = 0.101 µm（本条注释里给的数）。
        gives: [{ param: 'deviation', kind: 'range', max: 0.101, dir: 'atMost' }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/bearing-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/dry-ice', qty: q(1) }] },
    ],
    needs: [
      'plant/comparator/lapping-plate',
      'plant/comparator',
      'plant/interferometer',
      'lathe',
      'plant/forge',
      'plant/gauge-block',
      'plant/metrology-room',
      'plant/radiator',
    ],
    performedBy: 'plant/grinder',
    under: [{ param: 'temperature', min: 19, max: 21 }],
  },
  {
    /**
     * **同级复制：对着母块造一块和它同级的块。**
     *
     * 这一条补的是一个真洞：那 87 块会磨旧、会磕伤、会丢，而在此之前没有一条
     * 路线能补回一块**同级的**。② 与 ③ 产出的都是工作量块（发给车间），
     * 母块自己坏了没处换 —— "可复制"三个字一直缺着最后一步。
     *
     * 为什么复制品还能是 K 级：**误差合成，不是相加。**
     *
     *   母块不确定度 ±0.1 µm，复制对母块的偏离 0.015 µm
     *   √(0.1² + 0.015²) = 0.101 µm   → 还是 K 级
     *
     * 0.015 相对 0.1 只有 15%，平方之后 1% —— 所以"级随母块"不是保守，
     * 是算术。对着 1 级母块复制就只能得 1 级（0.015 对 1 µm 是 1.5%，同理）。
     *
     * 与 ③ `make/gauge-block-working-k` 的差别**不在工艺，在终检与去处**：
     *
     *   本路线   终检要绝对干涉确认，读数进证书   → 回套里当基准
     *   ③        终检只比较，不做绝对确认         → 发车间当量具
     *
     * ⚠️ 严格计量上这叫**传递**，不叫检定：本层没有更高一级的标准，所以
     * "确认"只能是"与母块一致 + 沿用它证书上的值"。把这句话写出来，
     * 比装成独立检定诚实。
     *
     * 拓扑仍是星形：对着 87 块原器比，不拿上一代复制块当母块 ——
     * 那一层差 0.1 µm 会在两代之内翻倍。
     *
     * **装配关系退化是量块套规的本质**：plant/gauge-block 的 composedOf 只有
     * 1 项 × 87 块（同一块型的 87 个尺寸），没有"机架/导轨/主轴"那种装配树。
     * 整机复制 = 87 块逐块制造 + 研合入套，所以它看起来"不像一台机器"是对的；
     * 风险不在零件种类少，而在**每一块都得单独研磨/研合/检定**（本路线 5 道工序）。
     */
    id: 'make/gauge-block-copy',
    name: '同级复制',
    // 复制块对着母套比 —— **精度只能传递，不能提升**（A2 的唯一真闭环）。
    // 母套的 deviation ≤1.015 µm 由种子条目 `plant/gauge-block` 的 props 保证；
    // 它是给定件，不是设备，所以不另写 `needs` 的规格窗口。
    produces: [
      {
        item: 'plant/gauge-block/block',
        qty: q(1),
        // 对着母块复制，研合面同一次研磨出来：wringGap 20-60 nm 设计值。
        gives: [{ param: 'wringGap', kind: 'range', min: 20, max: 60, record: 'mat/gauge-block-wringing-record' }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/bearing-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/dry-ice', qty: q(1) }] },
    ],
    needs: [
      'plant/comparator/lapping-plate',
      'lathe',
      'plant/forge',
      'plant/gauge-block',
      'plant/metrology-room',
      'plant/radiator',
    ],
    steps: [
      { note_zh: '① 粗磨：轴承钢块料磨六面，留 0.3–0.5 mm 余量（plant/grinder，冷却液充分）', performedBy: 'plant/grinder' },
      { note_zh: '② 研磨：研合面在研磨盘上对研到 Ra ≤0.01 µm、平行度 ≤0.3 µm（plant/grinder 低速 + plant/comparator/lapping-plate；**不用五轴抛光机**——它自己卡在激光台上，会把量块链一起拖死）', performedBy: 'plant/grinder' },
      { note_zh: '③ 时效：19–21 °C 放 24 h 消磨削应力，尺寸稳定到 ≤0.05 µm/24 h', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 检定：与 87 块母套逐块比对（比较仪 0.1 µm），研合面用干涉仪确认；>0.1 µm 的退回重研', performedBy: 'plant/comparator' },
      { note_zh: '⑤ 打标与入套：编号、记研合间隙设计值 20–60 nm；星形拓扑——只对母套比，不拿上一代复制块当母块', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(24) },
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 基准量块：从波长造出来，不从地球带
// ═══════════════════════════════════════════════════════════════════════════

export const REFERENCE_ITEMS: readonly Item[] = [
  /**
   * 基准量块，1 级（±1 µm）。**本地造的，锚在钠 D 线的波长上。**
   *
   * 上一版把量块留在种子清单里，理由是"长度是定义，本地给不出绝对基准"。
   * **那句话是错的。** 干涉法给的是
   *
   *   L = (m + ε) × λ/2
   *
   * 只要**知道 λ 是多少米**，长度就有了。而那个数在书本里 ——
   * 钠 D 线 588.995 / 589.592 nm。**知识不占运载质量。**
   *
   * 实物基准从来不是逻辑必需：1892 年米歇尔逊拿米原器去量镉红线的波长，
   * 1960 年反过来用氪-86 的波长定义米，1983 年起米由光速定义 ——
   * **今天"米"背后没有任何实物。**
   *
   * 降一档的地方在精度：钠焰的谱线宽约 1e-5（多普勒 + 自吸），
   * 折算到 100 mm 是 1 µm —— 所以是 1 级，不是运来那套 K 级（±0.1 µm）。
   * 要 K 级得用单同位素放电灯，那是另一个台阶。
   *
   * 本层需求是千分尺 ±2 µm，1 级够用。
   */
  { id: 'std/gauge-block-reference', name: '基准量块', unit: '件', category: 'part' },
];

export const REFERENCE_ROUTES: readonly Route[] = [
  {
    /**
     * 基准量块：轴承钢 → 淬火冷处理 → 磨 → 研 → **绝对干涉测长**。
     *
     *   1 kg 轴承钢 + 1 kg 干冰 → 1 块基准（1 级 ±1 µm）
     *
     * 前面所有工序与工作量块相同（见 make/gauge-block-working），
     * **只有最后一步不同**：
     *
     *   工作量块   **相对**：对着已有基准比，读差值（0.015 µm）
     *   基准块     **绝对**：对着钠 D 线的波长数量级次（1e-5 相对精度）
     *
     * 绝对测量要数整数级次：100 mm 的量块，m ≈ 339,559 条。不必一条条数 ——
     * 用**符合法**：换几个长度找到两组条纹重合的位置，从重合间距反推 m。
     * 这是米歇尔逊 1892 年做的同一件事，只是他用的是镉线。
     *
     * 所以这条路线**把量块从"定义"变回了"产品"**：它的值来自一条物理谱线，
     * 而谱线的波长是知识，不是运来的东西。
     *
     * ⚠️ **但它需要折射计，这一步初版漏掉了。**
     *
     * 干涉公式里的 λ 是"光**在所在介质里**的波长"。空气中 n−1 ≈ 2.9e-4，
     * 不修正的话，100 mm 差 **29 µm** —— 公差的 29 倍。
     *
     * 相对测量不受影响（两路光在同一种空气里，n 一起消掉），所以工作量块
     * 那条线不需要它。**只有造基准块需要。** 这就是 `needs` 里有
     * `plant/refractometer` 的原因。
     */
    id: 'make/gauge-block-reference',
    name: '基准量块制造',
    produces: [{ item: 'std/gauge-block-reference', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/bearing-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/dry-ice', qty: q(1) }] },
    ],
    needs: [
      'plant/comparator/lapping-plate',
      'plant/interferometer',
      'plant/refractometer',
      'plant/metrology-room',
      'lathe',
      'plant/forge',
    ],
    performedBy: 'plant/grinder',
    under: [{ param: 'temperature', min: 19, max: 21 }],
  },
];
// ═══════════════════════════════════════════════════════════════════════════
// 千分尺：车间里的那一把
// ═══════════════════════════════════════════════════════════════════════════

export const MICROMETER_ITEMS: readonly Item[] = [
  /**
   * 外径千分尺，0–25 mm，分度 0.01 mm。
   *
   * **量块不直接量零件。** 量块留在计量间里当基准，车间手里的是千分尺 ——
   * 而千分尺是拿量块校出来的。这是标准的传递链：
   *
   *   基准量块 K 级（±0.1 µm）→ 工作量块（±0.5 µm）→ 千分尺（±2 µm）→ 零件
   *
   * 规格写 0–25 是因为千分尺按量程分档（0–25、25–50……），
   * 与轴承按精度分档（P0/P5）是同一个道理。
   */
  { id: 'std/micrometer-0-25', name: '外径千分尺', unit: '把', category: 'part',
    props: [{ param: 'range', kind: 'range', min: 0, max: 25, unit: 'mm' }, { param: 'resolution', kind: 'range', min: 0.001, max: 0.01, unit: 'mm' }] },
];

export const MICROMETER_ROUTES: readonly Route[] = [
  {
    /**
     * 千分尺：丝杆 + 刻度套筒 + 测砧 + 棘轮，装配后用工作量块校对。
     *
     * **丝杆是 0.5 mm 螺距**，套筒上一圈 50 格 → 每格 0.01 mm。
     * 所以这把尺子的精度全靠两件事：
     *
     *   ① 螺纹的累积误差（车床丝杠的精度直接变成千分尺的精度）
     *   ② 测砧面的平面度与平行度（三条对研的平板 + 刚玉微粉研出来）
     *
     * 棘轮（恒力装置）保证每次测量的压紧力一样 —— 差 1 N，读数差 1 µm。
     *
     * ⚠️ 校对要在恒温间里做：1 °C 让 25 mm 的钢走 0.29 µm，而它的分度是 10 µm，
     * 所以常温校对也凑合 —— **但量块与千分尺都要先"晾"到室温**，
     * 这一步是手感的活，模型写不出来。
     */
    id: 'make/micrometer',
    name: '外径千分尺制造',
    produces: [{ item: 'std/micrometer-0-25', qty: q(1), gives: [{ param: 'range', kind: 'range', min: 0, max: 25 }, { param: 'resolution', kind: 'range', min: 0.01, max: 0.01 }] }],
    uses: [
      { anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] },
      { anyOf: [{ item: 'mat/bearing-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: [
      'plant/grinder',
      'plant/comparator/lapping-plate',
      'std/gauge-block-working',
      'plant/metrology-room',
    ],
    performedBy: 'lathe',
    under: [{ param: 'temperature', min: 19, max: 21 }],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...COMPARATOR_PARTS, ...GAUGE_BLOCK_ITEMS, ...MICROMETER_ITEMS, ...REFERENCE_ITEMS, COMPARATOR];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/comparator',
    name: '量块比较仪装配',
    produces: [{
      item: 'plant/comparator',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

/**
 * 种子设备的装配路线 —— 第一台是运来的，第二台起由这条路线造。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件在条目的 `composedOf` 上。
 */
export const SEED_ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/gauge-block',
    name: '量块装配',
    produces: [{
      item: 'plant/gauge-block',
      qty: q(1),
      gives: [
      { param: 'deviation', kind: 'range', min: 0, max: 1.015, dir: 'atMost' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...COMPARATOR_ROUTES, ...GAUGE_BLOCK_ROUTES, ...MICROMETER_ROUTES, ...REFERENCE_ROUTES, ...ASSEMBLY_ROUTES, ...SEED_ASSEMBLY_ROUTES];
