/**
 * 关节减速器 —— 机器人身上唯一一件"精度直接变成性能"的零件。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 先说清一件事：上一版把它判成"造不出"，那是错的
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 上一版的两句话是：柔轮是薄壁杯形件，齿面热处理后要精加工；本层有滚齿机，
 * 没有磨齿机 —— 所以造不出，留在种子里。
 *
 * 三处错，一处比一处大：
 *
 * ① **谐波的齿本来就不磨。** 同时啮合的齿有几十对（设计上三成的齿在受力），
 *    齿距误差被这一群齿摊掉，落到输出端的回差就小一档。所以商品谐波的柔轮
 *    齿面也只滚齿，靠氮化定表面硬度。**磨齿是行星减速器那条路的要求**，
 *    把它当成谐波的前提，是把两种减速器看成了同一种。
 * ② **内齿没有插齿机也能做。** 刚轮是内齿，滚齿机做不了内齿 —— 但指形模数
 *    铣刀 + 分度盘逐齿铣，是插齿机普及之前的标准做法，只是低两档（9 级）。
 * ③ **"柔性薄壁轴承"才是这一族真正的门槛** —— 而它可以绕开：波发生器
 *    用**双滚轮**，两个普通球轴承压在柔轮上。商品谐波不用它是因为承载与
 *    效率差一档，不是因为别的。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 降级降在哪
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   商品谐波     回差 1′ 级，效率 80%，柔轮齿面氮化，柔性薄壁轴承
 *   这一条       回差 5–10′，效率 65% 级，齿面调质，双滚轮
 *
 * 回差 5′ 落到 1 m 的臂长上是 1.5 mm 的末端定位误差（10′ 是 3 mm）。
 * **上料、砌砖、捣固、压端子都够**；精加工装配不够 —— 那种活要回到
 * 计量间里由人盯着干。
 *
 * 一句话：**它不是"造不出"，是"造得出但只有一档"。** 与铝、丁醇、碳电极、
 * 单一规格电机同型。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 润滑：本层没有油脂，只有干膜
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 谐波的齿面是**滑滚混合**接触，波发生器里两排钢球是纯滚动 —— 商品件灌锂基脂，
 * 一万小时换一次。本层没有脂：脂 = 基础油 + 稠化剂，基础油要么石油、要么硅油，
 * 两样都没有（`euv-source.ts:187` 把同一条缺口记在涡轮泵轴承上）。
 *
 * 所以走**粘结型 PTFE 干膜**：PTFE 粉 + 酚醛粘结剂，喷或刷 5–15 µm，180 °C 固化。
 * 这不是凑合 —— 真空与洁净室里的谐波本来就这么跑。代价是一档：
 *
 *   · 许用扭矩掉 30–40 %（干膜的 PV 极限比脂低）
 *   · 寿命从 10 000 h 掉到 1 000–2 000 h（**5–10 倍**）
 *   · 没有"补脂"这一说：膜磨完就是磨完
 *
 * 这一档与回差 5–10′ 是同一件事的两面：**能用，但不耐用。**
 * 寿命这条在本层量不出来 —— 没有摩擦磨损试验机，也没有运行小时（`Item.wear` 不存在）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 模型表示不出来的三件事
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ① **薄壁车削的手艺**：壁厚 0.5 mm 级的杯形件，车的时候让刀、装夹的时候变形。
 * ② **废品率**：第一年的柔轮大概一半报废，而模型里"做一件"就是一成。
 * ③ **疲劳寿命**：柔轮每秒弯两次，一亿次是一年的班。寿命靠材料与热处理，
 *    而 `Item.wear` 这个字段不存在。
 *
 * 所以下面四条路线说的是"这条路走得通"，不是"这一件好用"。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const REDUCER_PARTS: readonly Item[] = [
  /**
   * 柔轮。40Cr 薄壁杯形件，外齿，齿数比刚轮少两个。
   *
   * 它是整台减速器里唯一**会变形**的零件 —— 波发生器把它压成椭圆，转一圈，
   * 每个齿在啮合区进出一次。所以它的壁厚与热处理比齿形更要紧：
   * 壁厚了压不动，薄了撑不住扭矩，淬硬了会裂，软了会磨秃。
   *
   * 本层用 40Cr 而不是 40CrNiMoA：后者要镍钼，镍有（见 data/material/bearing.ts
   * 的 GCr15），钼没有。40Cr 淬透性差一档，薄壁件反而好——变形小。
   */
  { id: 'plant/robot/reducer/flexspline', name: 'Harmonic Reducer Flexspline', name_zh: '谐波减速器柔轮', unit: '件', category: 'part' },

  /**
   * 刚轮。45 钢内齿圈，齿数比柔轮多两个 —— 差这两个齿就是减速比。
   *
   * 它是减速器的固定端，也是整条扭矩路径的最后一站：柔轮的齿一个一个推它。
   * 内齿啮合比外齿难做，因为它不能用滚刀，只能用成形刀一齿一齿地啃。
   */
  { id: 'plant/robot/reducer/circular', name: 'Robot Circular Spline', name_zh: '机器人刚轮', unit: '件', category: 'part' },

  /**
   * 波发生器。**双滚轮式**：偏心轴 + 两个普通球轴承 + 摆杆。
   *
   * 商品的波发生器是椭圆凸轮套一枚**柔性薄壁轴承** —— 套圈壁厚 1 mm 级，
   * 要跟着凸轮弯一亿次而不裂。那是这一族里最难的一件，也是本层真造不出的
   * 那一件（薄壁套圈的沟道磨与材料疲劳都要专门的东西）。
   *
   * 双滚轮把这件事换成两个标准轴承：能转，但柔轮受力集中在一小片区域，
   * 承载与效率都低一档。**这是"能用但不是最好"的第六次**（碳电极、丁醇、
   * 45% 硅铁、单一规格电机、绕线转子转子在前）。
   */
  { id: 'plant/robot/reducer/wave', name: 'Harmonic Reducer Wave Generator', name_zh: '谐波减速器波发生器', unit: '件', category: 'part' },

  /**
   * 壳体与输出法兰。HT250 浇成，一端装刚轮、一端连臂体。
   *
   * 它是减速器里唯一不需要精度的零件 —— 但它决定柔轮的支撑刚度，
   * 而柔轮一软，回差就跟着涨。所以它厚、它有筋、它一次装夹镗完两处轴承位。
   */
  { id: 'plant/robot/reducer/housing', name: 'Robot Housing and Output Flange', name_zh: '机器人壳体与输出法兰', unit: '件', category: 'part' },
];

export const REDUCER_ROUTES: readonly Route[] = [
  {
    /**
     * 柔轮。车成薄壁杯 → 滚外齿 → **氮化** → 磨内孔与端面。
     *
     * **不磨齿。** 这是整段分析的关键，也是上一版判错的地方：谐波靠多齿
     * 均载，齿距误差摊到几十对齿上就只剩一小部分 —— 所以商品件的齿面
     * 只滚齿、靠表面硬化定寿命，不磨。滚齿给 7 级，均载之后输出端够用。
     *
     * 表面硬化是**氮化**（520–560 °C，变形小，薄壁件才扛得住）。
     * 上一版这里写的是"本层没有这个温度的炉子，退到调质" —— 那个缺口现在补上了：
     * `plant/resistance-furnace` 带一只密封罐，通氨就能氮化（氨有，哈伯法）。
     * **一次降级撤销**：齿面硬度回到该有的水平，寿命不再少一档。
     *
     * 薄壁那一关不在这里：壁厚 0.5 mm 让刀、装夹变形，全靠手上的功夫
     * （第二年的活），模型写不出来，也不该假装写得出。
     */
    id: 'make/reducer-flexspline',
    name: 'Harmonic Reducer Flexspline Manufacturing', name_zh: '谐波减速器柔轮制造',
    produces: [{ item: 'plant/robot/reducer/flexspline', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] },
      // 氮化要氨：密封罐里通氨，550 °C 分解出活性氮。
      { anyOf: [{ item: 'mat/ammonia', qty: q(1) }] },
      // 干膜润滑（见文件头"润滑"一节）：齿面 PTFE 5–15 µm + 酚醛粘结，氮化之后涂。
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 2000) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '车薄壁杯', performedBy: 'lathe' },
      { note_zh: '滚外齿', performedBy: 'plant/gear-hobbing' },
      // 氮化的条件只属于这一步 —— 滚齿和磨都不在 550 °C 下进行。
      { note_zh: '氮化（密封罐通氨，520–560）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 520, max: 560 }] },
      { note_zh: '磨内孔与端面', performedBy: 'plant/grinder' },
    ],
  },
  {
    /**
     * 刚轮。车齿圈坯 → 铣内齿 → 淬火回火 → 磨定位面。
     *
     * **内齿是这一件唯一的难处。** 滚刀不能切内齿（它必须从外面啃进来），
     * 而本层没有插齿机。出口是插齿机普及之前的老办法：**指形模数铣刀 +
     * 分度盘**，一齿一齿地铣，分度用滚齿机那套插销分度盘（data/machine/forming.ts）。
     *
     * 代价写在明处：铣出来的内齿大约 9 级（插齿能到 7–8 级），而**回差主要
     * 从这里来**。谐波的均载能吃掉一部分齿距误差，吃不掉齿厚误差。
     */
    id: 'make/reducer-circular',
    name: 'Robot Circular Spline Manufacturing', name_zh: '机器人刚轮制造',
    produces: [{ item: 'plant/robot/reducer/circular', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1) }] }],
    needs: [],
    steps: [
      { note_zh: '车齿圈坯', performedBy: 'lathe' },
      { note_zh: '铣内齿（指形模数铣刀 + 分度盘）', performedBy: 'plant/milling-machine' },
      { note_zh: '淬火回火', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 830, max: 860 }] },
      { note_zh: '磨定位面', performedBy: 'plant/grinder' },
    ],
  },
  {
    /**
     * 波发生器。偏心轴车 → 淬 → 磨两处轴颈 → 压两个标准球轴承 → 装摆杆。
     *
     * 两个轴承用 `std/bearing-general-p0`：**不需要柔性薄壁轴承**，这是这条
     * 路线存在的全部理由。偏心量决定柔轮的变形量，也就决定同时啮合几对齿 ——
     * 偏心大了卡死，小了带不动，公差带比轴承位紧一档，靠磨保证。
     */
    id: 'make/reducer-wave',
    name: 'Harmonic Reducer Wave Generator Manufacturing', name_zh: '谐波减速器波发生器制造',
    produces: [{ item: 'plant/robot/reducer/wave', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'std/bearing-general-p0', qty: q(2) }] },
      // 钢球与滚道的干膜（见文件头"润滑"一节）：轴承压装前涂，固化后装配。
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 2000) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '车偏心轴', performedBy: 'lathe' },
      { note_zh: '淬火回火', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 830, max: 860 }] },
      { note_zh: '磨两处轴颈', performedBy: 'plant/grinder' },
      { note_zh: '压轴承、装摆杆', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 壳体与输出法兰。HT250 浇 → 一次装夹镗两处轴承位 → 钻安装孔。 */
    id: 'make/reducer-housing',
    name: 'Robot Housing and Output Flange Manufacturing', name_zh: '机器人壳体与输出法兰制造',
    produces: [{ item: 'plant/robot/reducer/housing', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] }],
    needs: [],
    steps: [
      { note_zh: '浇铸', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1300, max: 1500 }] },
      { note_zh: '一次装夹镗两处轴承位', performedBy: 'lathe' },
      { note_zh: '钻安装孔', performedBy: 'plant/milling-machine' },
    ],
  },
];

/**
 * 关节减速器。四个零件，一个关节一台，六轴六台。
 *
 * 与 `std/motor-7.5kw-4p` 同一个形状：**一个零件，自己有零件清单，没有装配
 * 路线** —— 装配就是把它拧起来，不需要设备（机器人干），也就没有独立的一条
 * "造减速器"的工序。遍历会顺着 `composedOf` 继续往下走。
 *
 * 第五件是**外购件**：输出端的交叉滚子轴承。它同时承四个方向的载荷与倾覆
 * 力矩 —— 关节的刚性一半在减速器，一半在这枚轴承上。
 */
export const REDUCER: Item = {
  id: 'plant/robot/reducer',
  name: 'Robot Reducer', name_zh: '机器人减速器',
  unit: '件',
  category: 'part',
  // 回差。这一族减速器的判据是输出端空程：本层双滚轮波发生器 + 铆接柔轮，
  // 5–10′（条目注释另有说明）；10′ 是验收上限，读数由 `measure/robot-parts` 用
  // 分度台 + 自准直仪/千分表交，不是单次实测。
  props: [{ param: 'backlash', kind: 'range', min: 0, max: 10, unit: '′', dir: 'atMost' }],
  composedOf: [
    ...REDUCER_PARTS.map((p) => ({ item: p.id, qty: q(1) })),
    { item: 'std/bearing-crossed-roller-p5', qty: q(1) },
  ],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...REDUCER_PARTS, REDUCER];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/robot-reducer',
    name: 'Robot Reducer Assembly', name_zh: '机器人减速器装配',
    produces: [{
      item: 'plant/robot/reducer',
      qty: q(1),
      // 装配后空程验收上限 10′（过程能力 5–10′，见条目注释）；读数由 measure/robot-parts 收窄。
      gives: [{ param: 'backlash', kind: 'range', min: 0, max: 10 }],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...REDUCER_ROUTES, ...ASSEMBLY_ROUTES];
