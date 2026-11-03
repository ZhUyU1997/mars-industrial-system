/**
 * 零件：定义，以及按定义写出来的一台车床。
 *
 * ═══════════════════════════════════════════════════════════════════
 * 一、判据四条
 * ═══════════════════════════════════════════════════════════════════
 *
 * **零件 = 机器身上一个能被拆下来的单元。** 四条判据，四条都可判定：
 *
 *   有归属    路径以所属机器的 id 开头 —— lathe/base 是 lathe 的床身
 *   按件计    unit: '件'，带单件质量 mass
 *   有来历    一条路线：材料 → 零件（加工），或 零件 → 零件（子装配）
 *   不执行工序  不填 performedBy、不填 held 条件 —— 那是机器的事
 *
 * 四条划开三种最容易混的界：
 *
 *   材料 vs 零件    按 kg 还是按件。铁水进不了 composedOf，主轴进得了
 *   零件 vs 消耗件  拆得下来是零件，拆不下来是消耗件
 *   零件 vs 机器    执行工序的是机器。主轴不执行工序，所以它是零件
 *
 * ═══════════════════════════════════════════════════════════════════
 * 二、为什么拿这台车床来定义
 * ═══════════════════════════════════════════════════════════════════
 *
 * 因为它是种子里的母机（data/floor/seed.ts）。**定义必须落在一个真实的东西上**，
 * 否则四条判据只是四句空话 —— 上一版把定义写成了一段散文，谁也没法用它
 * 判任何一件东西是不是零件。
 *
 * ═══════════════════════════════════════════════════════════════════
 * 三、这九个零件还没有制造路线
 * ═══════════════════════════════════════════════════════════════════
 *
 * 不是忘了写。第一台车床是从地球运来的，它的零件不在这里被制造；
 * 要造的是**第二台**，而那需要铸、锻、热处理、磨四类设备，
 * 种子里只有一台车床 —— 那一步正是下一层要推的东西。
 *
 * 所以这九个条目现在没有路线，校验会把它们列进 `unproduced`。
 * 那张名单就是待办：每写出一条路线，就少一项。
 *
 * ═══════════════════════════════════════════════════════════════════
 * 四、质量
 * ═══════════════════════════════════════════════════════════════════
 *
 * 单件质量按整机约 2.2 t（400 mm 级普通／精密车床）的典型重量分布估。
 * 厂商不给零件级重量，所以这是**估**，不是实测 —— 有图纸之后再替换。
 * 九个零件合计 1377 kg，与整机之差是卡盘、电机、轴承、附件与底座。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';
import { FURNACE_PARTS } from './process.ts';
import { MILL_PARTS, SHEET_PARTS } from './tools.ts';

/**
 * 车床的九个零件。
 *
 * 机器条目 `lathe` 在 data/floor/seed.ts 里，它的 `composedOf` **直接由这张清单生成** ——
 * 清单和组成不会各说各话，加一个零件就自动进组成。
 */
export const LATHE_PARTS: readonly Item[] = [
    /**
     * 床身。整台机器的基准件，主轴箱、尾座、溜板都装在它的导轨面上。
     *
     * HT300 灰铸铁浇成，必须经过时效（自然或人工）把内应力放掉，
     * 否则加工完会慢慢变形。导轨面是磨出来的 —— 床身的精度不在铸，
     * 在磨。
     *
     * 780 kg（估，约占整机 35%）。
     */
    {
      id: 'lathe/base',
      name: 'Precision Lathe Bed', name_zh: '精密车床床身',
      unit: '件',
      mass: q(780),
      category: 'part',
      // 导轨面平面度（每 300 mm 口径）。床身是整台车床的基准件：它不平，
      // 上面装的主轴箱、尾座、溜板全跟着歪。见 measure/lathe-bed-flatness。
      // 直线度/行程是资格带，不是单次读数；见 measure/lathe-bed-straightness。
      props: [
        { param: 'flatness', kind: 'range', min: 0, max: 20, unit: 'µm', dir: 'atMost' },
        { param: 'straightness', kind: 'range', min: 0.5, max: 2, unit: 'µm/m', dir: 'atMost' },
        { param: 'travel', kind: 'range', min: 1000, max: 2000, unit: 'mm', dir: 'atLeast' },
      ],
    },

    /**
     * 主轴箱。装着主轴、变速齿轮与离合器的箱体。
     *
     * HT300 铸件，主轴孔与各轴孔要镗，镗完与床身**配刮** ——
     * 刮削是手工作业，机器人可以做，但它决定了主轴轴线与导轨的平行度。
     *
     * 210 kg（估）。
     */
    {
      id: 'lathe/headstock',
      name: 'Precision Lathe Headstock', name_zh: '精密车床主轴箱',
      unit: '件',
      mass: q(210),
      category: 'part',
      // 验收上限：安装面平面度（与床身配刮后，每 300 mm 口径）≤20 µm；
      // 主轴孔圆度 ≤10 µm（镗完再配刮，孔的圆度决定主轴轴承外圈贴合）。
      // 见 measure/lathe-headstock；窗口数字是过程能力，不是读数。
      props: [
        { param: 'flatness', kind: 'range', min: 0, max: 0.02, unit: 'mm', dir: 'atMost' },
        { param: 'roundness', kind: 'range', min: 0, max: 0.01, unit: 'mm', dir: 'atMost' },
      ],
    },

    /**
     * 主轴。工件夹在这里转，它的回转精度就是整台车床的精度上限。
     *
     * 40Cr 锻件：粗车 → 调质 → 精车 → 表面淬火 → 磨。磨完装一对
     * P4 级角接触球轴承，预紧后径向跳动要压到微米级。
     *
     * 42 kg（估）。
     */
    {
      id: 'lathe/spindle',
      name: 'Precision Lathe Spindle', name_zh: '精密车床主轴',
      unit: '件',
      mass: q(42),
      category: 'part',
      // 主轴回转精度：径向跳动（靠近端面 50 mm 处）。这是整台车床的精度上限，
      // 也是本层第一个被写成可判形式的“母机精度参数” —— 见
      // measure/lathe-spindle-runout 那条测量路线。
      props: [{ param: 'runout', kind: 'range', min: 0, max: 50, unit: 'µm', dir: 'atMost' }],
    },

    /**
     * 尾座。顶尖顶住工件另一端，与主轴同心。
     *
     * HT250 铸件，底面与床身导轨配刮。它的轴线与主轴轴线的同轴度
     * 靠刮削保证，不靠加工精度 —— 这是车床装配里最见功夫的一处。
     *
     * 85 kg（估）。
     */
    {
      id: 'lathe/tailstock',
      name: 'Precision Lathe Tailstock', name_zh: '精密车床尾座',
      unit: '件',
      mass: q(85),
      category: 'part',
      // 尾座与主轴的同轴度（在 300 mm 处）。车床装配里最见功夫的一处：
      // 靠刮削保证，不靠加工精度。见 measure/lathe-tailstock-coaxiality。
      props: [{ param: 'coaxiality', kind: 'range', min: 0, max: 100, unit: 'µm', dir: 'atMost' }],
    },

    /**
     * 溜板。带着刀架沿导轨纵向移动的滑座。
     *
     * HT250 铸件，底面贴塑或淬硬后与导轨配磨。它和床身导轨构成
     * 一对摩擦副 —— 导轨磨在床身上，磨损却主要发生在溜板上。
     *
     * 110 kg（估）。
     */
    {
      id: 'lathe/carriage',
      name: 'Precision Lathe Carriage', name_zh: '精密车床溜板',
      unit: '件',
      mass: q(110),
      category: 'part',
      // 验收上限：与床身导轨配磨/贴塑后的底面平面度 ≤20 µm（每 300 mm 口径）。
      // 溜板是磨损件，这一项决定它走起来会不会“点头”。见 measure/lathe-carriage。
      props: [{ param: 'flatness', kind: 'range', min: 0, max: 0.02, unit: 'mm', dir: 'atMost' }],
    },

    /**
     * 刀架。夹持刀具，能横向进给。
     *
     * 45 钢锻件，铣出刀槽，淬火提高耐磨性。它是受力最直接的一件，
     * 刚性不够就会让刀，工件表面留下波纹。
     *
     * 38 kg（估）。
     */
    {
      id: 'lathe/tool-post',
      name: 'Precision Lathe Tool Post', name_zh: '精密车床刀架',
      unit: '件',
      mass: q(38),
      category: 'part',
      // 验收上限：刀架底面（与溜板配合的面）平面度 ≤10 µm。
      // 底面一翘，刀尖就随夹紧力低头，工件表面留波纹。见 measure/lathe-tool-post。
      props: [{ param: 'flatness', kind: 'range', min: 0, max: 0.01, unit: 'mm', dir: 'atMost' }],
    },

    /**
     * 丝杠。把主轴的旋转按固定比例变成溜板的直线移动，用来车螺纹。
     *
     * 45 钢：车螺纹 → 淬硬 → 磨。导程误差直接变成螺距误差，
     * 所以它是车床上除主轴之外精度要求最高的零件。
     *
     * 22 kg（估）。
     */
    {
    id: 'lathe/lead-screw',
    name: 'Precision Lathe Lead Screw', name_zh: '精密车床丝杠',
    unit: '件',
    mass: q(22),
    category: 'part',
    // 丝杠导程误差（每 300 mm 累积）。车螺纹的螺距精度全在它身上。
    props: [{ param: 'pitchError', kind: 'range', min: 0, max: 100, unit: 'µm', dir: 'atMost' }],
  },

    /**
     * 进给箱。装着变速齿轮，把主轴转速按几十种比例传给丝杠与光杠。
     *
     * HT200 铸件，各轴孔镗削。里面的齿轮要滚齿 —— 而滚齿机不在种子里，
     * 这是下一步要撞的墙之一。
     *
     * 65 kg（估）。
     */
    {
      id: 'lathe/feed-gearbox',
      name: 'Precision Lathe Feed Box', name_zh: '精密车床进给箱',
      unit: '件',
      mass: q(65),
      category: 'part',
      // 验收上限：相邻轴孔中心距误差 ≤50 µm（镗孔时一次装夹保证）。
      // 本层没有坐标测量机，只能测中心距，测不了二维坐标 —— 见 measure/lathe-feed-gearbox。
      props: [{ param: 'borePosition', kind: 'range', min: 0, max: 0.05, unit: 'mm', dir: 'atMost' }],
    },

    /**
     * 防护罩。挡切屑与切削液，不承力、不决定精度。
     *
     * 冷轧薄板折弯后焊接。它证明一件事：**不是所有零件都要高精度**，
     * 判据是"能不能被拆下来单独更换"，不是"有多难做"。
     *
     * 25 kg（估）。
     */
    {
      id: 'lathe/guard',
      name: 'Precision Lathe Guard', name_zh: '精密车床防护罩',
      unit: '件',
      mass: q(25),
      category: 'part',
      // 验收上限：薄板厚度 1.2–2.0 mm（冷轧板来料 1.5 mm，折弯减薄与焊缝余高都在带内）。
      // 它不承力、不决定精度 —— 有窗口只是为了让“拆下来能换”可判。见 measure/lathe-guard。
      props: [{ param: 'thickness', kind: 'range', min: 1.2, max: 2.0, unit: 'mm' }],
    },
  ];

/**
 * 第二台车床要的材料与设备。
 *
 * 遍历到这一层才出现的节点：它们不是种子，也不是行星给的 —— 是"要造它们
 * 才有的东西"。床身要浇铸，要有熔炼炉；平面与槽，要有铣镗床；防护罩，
 * 要有钣金工位。
 *
 * **磨床不在这张清单上** —— 它在种子里（data/floor/seed.ts）。车床能造磨床的
 * 零件，造不出磨床的精度，所以第一套磨床只能运来。这里的路线照样写
 * `needs: ['plant/grinder']`：那个 id 指的是"有一台磨床"，第一台是运来的，
 * 第二台是自己造的。
 */
export const LATHE_SUPPLIES: readonly Item[] = [
  // ═══ 材料 ═══

  /** HT300 灰铸铁。床身与主轴箱 —— 含碳量高、片状石墨吸振，机床底座的传统材料。 */
  { id: 'mat/iron-ht300', name: 'HT300 Gray Cast Iron', name_zh: 'HT300 灰铸铁', unit: 'kg', category: 'material' },
  /** HT250 灰铸铁。尾座与溜板，强度要求低一档。 */
  { id: 'mat/iron-ht250', name: 'HT250 Gray Cast Iron', name_zh: 'HT250 灰铸铁', unit: 'kg', category: 'material' },
  /** HT200 灰铸铁。进给箱箱体，主要承箱，不承切削力。 */
  { id: 'mat/iron-ht200', name: 'HT200 Gray Cast Iron', name_zh: 'HT200 灰铸铁', unit: 'kg', category: 'material' },
  /** 40Cr 合金结构钢。主轴用，调质后综合力学性能好，可表面淬火。 */
  { id: 'mat/steel-40cr', name: '40Cr Alloy Structural Steel', name_zh: '40Cr 合金结构钢', unit: 'kg', category: 'material',
    props: [{ param: 'hardness', kind: 'range', min: 180, max: 350, unit: 'HB' }, { param: 'temper', kind: 'enum', values: ['as-rolled', 'normalized', 'quenched', 'tempered'] }] },
  /** 45 号优质碳素结构钢。刀架、丝杠这类要淬硬又要韧的件。 */
  { id: 'mat/steel-45', name: '45 High-Quality Carbon Structural Steel', name_zh: '45 号优质碳素结构钢', unit: 'kg', category: 'material',
    props: [{ param: 'hardness', kind: 'range', min: 150, max: 300, unit: 'HB' }, { param: 'temper', kind: 'enum', values: ['as-rolled', 'normalized', 'quenched', 'tempered'] }] },
  /** 冷轧薄钢板。防护罩、护板。 */
  { id: 'mat/sheet-steel', name: 'Cold-Rolled Steel Sheet', name_zh: '冷轧薄钢板', unit: 'kg', category: 'material' },

  // ═══ 设备 —— 第二台车床要造它们，而种子里没有 ═══
  // （熔炼炉不在这里了：它是种子 —— 第一台必须运来，见 data/floor/seed.ts）

  /**
   * 铣镗床。铣平面与刀槽、镗箱体孔 —— 车床出不了平面，它出。
   *
   * 车床带铣头也能凑，但刚性与精度都不够。那句话同时是它存在的理由：
   * 第一台铣镗床只能从车床加铣头长出来，见 data/machine/tools.ts。
   *
   * 六个零件在 data/machine/tools.ts 里，`composedOf` 由那张清单生成。
   */
  {
    id: 'plant/milling-machine',
    name: 'Milling and Boring Machine', name_zh: '铣镗床',
    unit: '台',
    category: 'machine',
    composedOf: [...MILL_PARTS.map((p) => ({ item: p.id, qty: q(1) })), { item: 'std/motor-7.5kw-4p', qty: q(1) }],
  },

  /**
   * 钣金与焊接工位。折弯、剪切、手工焊 —— 防护罩这类件的全部工序。
   *
   * 机身用铸铁而不是焊接钢板：焊接要冷轧板，冷轧板要轧机，而轧机还没建。
   * 切断这个循环的理由写在 data/machine/tools.ts 的 SHEET_PARTS 里。
   *
   * 五个零件在 data/machine/tools.ts 里，`composedOf` 由那张清单生成。
   */
  {
    id: 'plant/sheet-shop',
    name: 'Sheet Metal and Welding Workstation', name_zh: '钣金与焊接工位',
    unit: '套',
    category: 'machine',
    composedOf: [...SHEET_PARTS.map((p) => ({ item: p.id, qty: q(1) })), { item: 'std/motor-7.5kw-4p', qty: q(1) }],
  },
];

/**
 * 九个零件的制造路线 —— 遍历的第二层。
 *
 * 一条路线只写一台执行设备：模型里一个零件由**一条**路线产出，而真实工序
 * 是铸 → 车 → 热处理 → 磨一长串。所以这里分两条：
 *
 *   performedBy  给出这个零件**形状**的那台设备（浇、车、铣、折弯）
 *   needs        它还必须具备的**前提设备**（磨床出精度、车床出配合面）
 *
 * 这么分是因为模型把"执行工序"和"前提设备"分开记 —— 磨削不改变形状，
 * 它改变的是精度，而精度是前提，不是工序的产出物。
 *
 * 投入量等于零件质量：模型要求"零件质量 = 那条路线投入的 kg 之和"，
 * 所以加工余量、浇冒口这些损耗现在表达不了 —— 这是已知的缺口。
 */
export const LATHE_ROUTES: readonly Route[] = [
  {
    /** 床身。HT300 浇成毛坯 → 时效去内应力 → 车配合面 → 磨导轨面。 */
    id: 'make/lathe-base',
    name: 'Precision Lathe Bed Manufacturing', name_zh: '精密车床床身制造',
    produces: [
      {
        item: 'lathe/base',
        qty: q(1),
        // 复检记录为 1–4 µm；交付窗按记录收窄到 1–4，旧 3–8 设计值被复检取代。
        // 记录见 measure/lathe-bed-flatness；直线度/行程是资格带，不是单次读数。
        gives: [
          { param: 'flatness', kind: 'range', min: 1, max: 4, record: 'mat/lathe-bed-flatness-record' },
          { param: 'straightness', kind: 'range', min: 0.5, max: 2, record: 'mat/guideway-straightness-record' },
          { param: 'travel', kind: 'range', min: 1000, max: 2000, record: 'mat/guideway-straightness-record' },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/iron-ht300', qty: q(780) }] }],
    // 导轨要刮研：锉刀 + 研磨平板 + 红丹
    needs: ['lathe', 'plant/grinder', 'std/file-general'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 主轴箱。铸 → 镗孔 → 与床身配刮。配刮是手工作业，机器人做，但仍是刮出来的。 */
    id: 'make/lathe-headstock',
    name: 'Precision Lathe Headstock Manufacturing', name_zh: '精密车床主轴箱制造',
    produces: [{
      item: 'lathe/headstock',
      qty: q(1),
      // 镗 + 配刮的过程能力：安装面 8–20 µm、主轴孔圆度 3–10 µm（验收上限 20/10）。
      gives: [
        { param: 'flatness', kind: 'range', min: 0.008, max: 0.02 },
        { param: 'roundness', kind: 'range', min: 0.003, max: 0.01 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht300', qty: q(210) }] }],
    needs: ['lathe', 'plant/milling-machine', 'plant/grinder', 'std/file-general'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /**
     * 主轴。40Cr 锻件 → 粗车 → 调质 → 精车 → 表面淬火 → 磨。车出形状，磨出精度。
     *
     * **这一格是本层机加工链上第一处规格判据。** 主轴的回转精度就是整台车床的
     * 精度上限，而它由那对轴承的精度等级定：上面零件注释写的是 P4，所以这里
     * 写 `need precision = P4`。`make/bearing-spindle` 交的是 P0/P5/P4 三档，
     * 挑得出 P4，所以这一格覆盖 —— 判据真正盯住的是"下料时挑哪一档"，
     * 而不是"造不造得出"。
     *
     * 为什么不写跳动数字：ISO 492 的 P4 在 50 mm 内径上径向跳动 2.5 µm、
     * P5 是 4 µm，可这两个数在本层**没法验**（没有 0.1 µm 级的圆度仪），
     * 所以轴承条目只声明精度等级，不声明跳动量。等级能挑，跳动量验不了 ——
     * 写一个验不了的数，就是把缺口藏进数字里。
     */
    id: 'make/lathe-spindle',
    name: 'Precision Lathe Spindle Manufacturing', name_zh: '精密车床主轴制造',
    // 车出来的主轴，跳动**继承**车床自己的跳动 —— 这是 A2 精度继承的第一次落表：
    // 新主轴的回转误差不会比车它的那台小。要求写在设备上（`needs` 的 Option 窗口）。
    produces: [
      {
        item: 'lathe/spindle',
        qty: q(1),
        // 磨完装 P4 轴承，预紧后径向跳动 3–8 µm —— 这是设计值，实测见下面那条测量路线。
        gives: [{ param: 'runout', kind: 'range', min: 3, max: 8 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-40cr', qty: q(42) }] },
      {
        anyOf: [
          {
            item: 'std/bearing-spindle-p5',
            qty: q(2),
            need: [{ param: 'precision', kind: 'enum', oneOf: ['P4'] }],
            // 挑不到 P4 就用 P5：回转精度掉一档，车床还能车，只是车不出 IT6。
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: ['plant/grinder', 'plant/forge', 'std/micrometer-0-25', { item: 'lathe', qty: q(1), need: [{ param: 'spindleRunout', kind: 'range', max: 5, dir: 'atMost' }, { param: 'bedFlatness', kind: 'range', max: 4, dir: 'atMost' }], onRelax: 'functional-kept' }],
    performedBy: 'lathe',
  },
  {
    /** 尾座。铸 → 底面与导轨配刮。同轴度靠刮，不靠加工精度。 */
    id: 'make/lathe-tailstock',
    name: 'Precision Lathe Tailstock Manufacturing', name_zh: '精密车床尾座制造',
    produces: [
      {
        item: 'lathe/tailstock',
        qty: q(1),
        // 配刮之后 10-30 um/300 mm 设计值。
        gives: [{ param: 'coaxiality', kind: 'range', min: 10, max: 30 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(85) }] }],
    // 导轨要刮研：锉刀 + 研磨平板 + 红丹
    needs: ['lathe', 'plant/grinder', 'std/file-general'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 溜板。铸 → 底面贴塑或淬硬 → 与导轨配磨。 */
    id: 'make/lathe-carriage',
    name: 'Precision Lathe Carriage Manufacturing', name_zh: '精密车床溜板制造',
    produces: [{
      item: 'lathe/carriage',
      qty: q(1),
      // 配磨/贴塑后的过程能力 8–20 µm（验收上限 20）。
      gives: [{ param: 'flatness', kind: 'range', min: 0.008, max: 0.02 }],
    }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(110) }] }],
    // 导轨要刮研：锉刀 + 研磨平板 + 红丹
    needs: ['lathe', 'plant/grinder', 'std/file-general'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 刀架。45 钢锻件 → 铣刀槽 → 淬火。形状与刚性都来自铣。 */
    id: 'make/lathe-tool-post',
    name: 'Precision Lathe Tool Post Manufacturing', name_zh: '精密车床刀架制造',
    produces: [{
      item: 'lathe/tool-post',
      qty: q(1),
      // 底面铣 + 磨的过程能力 3–10 µm（验收上限 10）。
      gives: [{ param: 'flatness', kind: 'range', min: 0.003, max: 0.01 }],
    }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(38) }] }],
    needs: ['lathe', 'plant/forge'],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 丝杠。45 钢 → 车螺纹 → 淬硬 → 磨。导程误差直接变成螺距误差。 */
    id: 'make/lathe-lead-screw',
    name: 'Precision Lathe Lead Screw Manufacturing', name_zh: '精密车床丝杠制造',
    produces: [
      {
        item: 'lathe/lead-screw',
        qty: q(1),
        // 车+磨，导程误差 5-15 um/300 mm 设计值。
        gives: [{ param: 'pitchError', kind: 'range', min: 5, max: 15 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(22) }] }],
    needs: ['plant/grinder'],
    performedBy: 'lathe',
  },
  {
    /** 进给箱。HT200 铸 → 镗各轴孔。形状由铸定，孔由镗定。 */
    id: 'make/lathe-feed-gearbox',
    name: 'Precision Lathe Feed Box Manufacturing', name_zh: '精密车床进给箱制造',
    produces: [{
      item: 'lathe/feed-gearbox',
      qty: q(1),
      // 一次装夹镗孔的中心距过程能力 20–50 µm（验收上限 50）。
      gives: [{ param: 'borePosition', kind: 'range', min: 0.02, max: 0.05 }],
    }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(65) }] }],
    needs: ['plant/milling-machine'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 防护罩。薄板折弯后焊接。不承力，不决定精度 —— 唯一不磨的零件。 */
    id: 'make/lathe-guard',
    name: 'Precision Lathe Guard Manufacturing', name_zh: '精密车床防护罩制造',
    produces: [{
      item: 'lathe/guard',
      qty: q(1),
      // 1.5 mm 冷轧板折弯后的厚度带 1.4–1.6（验收上限 1.2–2.0）。
      gives: [{ param: 'thickness', kind: 'range', min: 1.4, max: 1.6 }],
    }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(25) }] }],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...LATHE_PARTS, ...LATHE_SUPPLIES];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/milling-machine',
    name: 'Milling and Boring Machine Assembly', name_zh: '铣镗床装配',
    produces: [{
      item: 'plant/milling-machine',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/sheet-shop',
    name: 'Sheet Metal and Welding Workstation Assembly', name_zh: '钣金与焊接工位装配',
    produces: [{
      item: 'plant/sheet-shop',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：车床。第一台是运来的，第二台起由这条路线造（母机：由车床装车床）。 */
    id: 'make/lathe',
    name: 'Precision Lathe Assembly', name_zh: '精密车床装配',
    produces: [{
      item: 'lathe',
      qty: q(1),
      gives: [
        { param: 'spindleRunout', kind: 'range', min: 2, max: 5, dir: 'atMost' },
        { param: 'bedFlatness', kind: 'range', min: 1, max: 4, dir: 'atMost' },
        { param: 'pitchError', kind: 'range', min: 3, max: 8, dir: 'atMost' },
        { param: 'coaxiality', kind: 'range', min: 5, max: 15, dir: 'atMost' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...LATHE_ROUTES, ...ASSEMBLY_ROUTES];
