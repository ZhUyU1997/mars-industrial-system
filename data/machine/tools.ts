/**
 * 母机环的机床 —— 磨床、铣镗床、钣金工位。
 *
 * 车床是种子（data/floor/seed.ts），它的零件在 data/machine/lathe.ts。
 * 这里放另外三台：零件、路线，以及每台撞到的那件事。
 *
 * ═══════════════════════════════════════════════════════════════════
 * 三台机床，三件不同的事
 * ═══════════════════════════════════════════════════════════════════
 *
 *   磨床      精度。砂轮主轴要磨到微米级，而能磨它的只有磨床 —— 所以第一套
 *             磨床在种子里，这里写的是第二套。环没有被打开，是被从外面接管。
 *   铣镗床    平面。车床的一切运动都是回转，出不了床身与工作台要的平面。
 *             第一台铣镗床靠"车床刀架装铣头 + 溜板进给"长出来：够造机器，
 *             不够造准。
 *   钣金工位  薄板。折弯、剪切、焊 —— 防护罩这类件的全部工序。机身用铸铁
 *             而不是焊接钢板：焊接要冷轧板，冷轧板要轧机，而轧机还没建。
 *
 * ═══════════════════════════════════════════════════════════════════
 * ⚠️ 模型看不见的那一类自指
 * ═══════════════════════════════════════════════════════════════════
 *
 * `self_reference` 只查"一条路线生产它自己执行的那台设备"。而这里的环是
 * 两个条目绕一圈：砂轮主轴 ← 磨床 ← 砂轮主轴。环要绕两步才看得见，模型
 * 不报。它现在合法，因为第一套磨床在种子清单上 —— **合法的是那个事实，
 * 不是这条路线**。
 *
 * ═══════════════════════════════════════════════════════════════════
 * 没有质量
 * ═══════════════════════════════════════════════════════════════════
 *
 * 整机重量依赖型号，没有可核的基准就不写。零件因此没有 mass，路线按
 * `1 kg → 1 件` 写：证明拓扑（谁要谁、谁造谁），不证明量。等零件重量
 * 有了来源，这些路线要一起重写。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

/**
 * 外圆磨床的五个零件。
 *
 * 机器条目 `plant/grinder` 在 data/machine/lathe.ts 里（它和熔炼炉、铣镗床、钣金工位
 * 一起挂在车床的设备清单上），`composedOf` 由这张清单生成。
 */
export const GRINDER_PARTS: readonly Item[] = [
  /**
   * 砂轮。刚玉磨粒用酚醛树脂粘成，180–200 °C 固化。
   *
   * **磨床没有砂轮就是一堆铁。** 它是这台设备上唯一消耗的材料，也是
   * 全表第一个"由磨料做成的零件" —— 在此之前 seed/cons/abrasive 只是个
   * 没有下家的种子。
   *
   * 树脂结合剂（B 级）耐温低、转速不能太高；陶瓷结合剂（V 级）好，但要
   * 1250 °C 烧成且要长石与粘土，本层没有长石。所以是树脂砂轮 ——
   * 第六次降级使用。
   */
  {
    id: 'plant/grinder/wheel',
    name: 'Grinder Grinding Wheel', name_zh: '磨床砂轮',
    unit: '件',
    category: 'part',
    // 验收上限：修整去重后的残余不平衡量 ≤50 g·mm（G6.3 档按 5–20 kg 轮重收紧）。
    // 压制成型不修整的毛坯是 100–800 g·mm（见 measure/grinding-wheel-balance），
    // 所以这一条盯的是「修整后」而不是「压制后」。见 measure/grinder-wheel。
    props: [{ param: 'unbalance', kind: 'range', min: 0, max: 50, unit: 'g·mm', dir: 'atMost' }],
  },
  /**
   * 床身。整台的基准，砂轮架与工件头架都装在它上面。
   *
   * HT300 浇成，导轨面磨 —— 磨床的床身比车床更怕振动，壁厚与筋都更密。
   */
  {
    id: 'plant/grinder/bed',
    name: 'Grinder Bed', name_zh: '磨床床身',
    unit: '件',
    category: 'part',
    // 工作台导轨面平面度（每 300 mm 口径）。磨床比车床更依赖这一项：
    // 工作台走得直不直，直接决定磨出来的面直不直。见 measure/grinder-bed-flatness。
    props: [{ param: 'flatness', kind: 'range', min: 0, max: 20, unit: 'µm', dir: 'atMost' }],
  },

  /**
   * 砂轮架。装着砂轮主轴，能横向进给。
   *
   * 它是整台磨床刚性最要紧的一处：砂轮一转就是几千转，架子的任何变形
   * 都会直接印在工件上。
   */
  {
    id: 'plant/grinder/wheel-head',
    name: 'Grinder Wheel Head', name_zh: '磨床砂轮架',
    unit: '件',
    category: 'part',
    // 砂轮架进给分辨率：刻度盘每格对应多少位移。磨削的最后一刀就靠这一格。
    props: [{ param: 'feedResolution', kind: 'range', min: 0, max: 50, unit: 'µm', dir: 'atMost' }],
  },

  /**
   * 砂轮主轴。**这一件是磨削环的入口 —— 也就是种子里为什么必须有一台磨床。**
   *
   * 40Cr 锻件，淬硬后要磨到微米级 —— 而磨它的那台磨床，本身就需要一条
   * 同样精度的主轴。环里没有出口，出口只能在环外：第一套磨床从地球来。
   * 有了它，这一件就是母机磨出来的普通零件；没有它，它就是整个体系的墙。
   */
  {
    id: 'plant/grinder/spindle',
    name: 'Grinder Wheel Spindle', name_zh: '磨床砂轮主轴',
    unit: '件',
    category: 'part',
    // 砂轮主轴径向跳动。磨削把跳动直接复印到工件上，所以这个数比车床那个更紧。
    props: [{ param: 'runout', kind: 'range', min: 0, max: 20, unit: 'µm', dir: 'atMost' }],
  },

  /**
   * 工件头架。夹着工件转，与砂轮主轴的同轴度靠配刮与对中。
   *
   * 验收上限：与床身配刮后的底面平面度 ≤20 µm（每 300 mm 口径）。
   */
  {
    id: 'plant/grinder/work-head',
    name: 'Grinder Work Headstock', name_zh: '磨床工件头架',
    unit: '件',
    category: 'part',
    props: [{ param: 'flatness', kind: 'range', min: 0, max: 0.02, unit: 'mm', dir: 'atMost' }],
  },

  /**
   * 进给丝杠。横向进给的位移基准，车螺纹后磨。
   *
   * 验收上限：导程误差 ≤20 µm / 300 mm（累积）。
   */
  {
    id: 'plant/grinder/feed-screw',
    name: 'Grinder Feed Lead Screw', name_zh: '磨床进给丝杠',
    unit: '件',
    category: 'part',
    props: [{ param: 'pitchError', kind: 'range', min: 0, max: 20, unit: 'µm', dir: 'atMost' }],
  },
];

/**
 * 磨床零件的制造路线。
 *
 * 五条里有四条落在已经出现的设备上，只有砂轮主轴落在磨床自己身上 ——
 * 那一条就是整条母机环的入口：第一套磨床从地球来，它磨出第二套的主轴。
 * 写成数据之后一眼能看见：环还在，但它的第一脚踩在种子清单上。
 */
export const GRINDER_ROUTES: readonly Route[] = [
  {
    /** 砂轮。刚玉磨粒 + 树脂混料 → 压环 → 180–200 °C 固化 → 修整。 */
    id: 'make/grinder-wheel',
    name: 'Grinder Grinding Wheel Manufacturing', name_zh: '磨床砂轮制造',
    produces: [{
      item: 'plant/grinder/wheel',
      qty: q(1),
      // 混料→压环→固化→修整的过程能力 20–50 g·mm（验收上限 50）。
      gives: [{ param: 'unbalance', kind: 'range', min: 20, max: 50 }],
    }],
    uses: [
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/bosch-reactor',
    under: [{ param: 'temperature', min: 180, max: 200 }],
  },
  {
    /**
     * 碳化硅砂轮 —— 第二条来路，磨硬质合金用的那一种。
     *
     *   1 kg 碳化硅 + 1 kg 树脂 → 1 片
     *
     * 同一个零件，两条路线（模型允许 OR）：刚玉砂轮磨钢，碳化硅砂轮磨硬质合金。
     * 车间里两种都得有，因为**没有一种磨料能磨所有东西**。
     *
     * ⚠️ 实操上有三件小事，模型写不出来，写在这里：
     *
     *   ① **必须湿磨。** 硬质合金干磨会热裂 —— 磨削热集中在刃口几十微米内，
     *      温度瞬间上千，冷下来就是一道裂纹。冷却液用苏打水（纯碱本层有）。
     *   ② **砂轮要常修。** 碳化硅磨碳化钨时自己也钝，每磨几件就要用修整块
     *      重新开刃。修整块也是碳化硅 —— 自己修自己。
     *   ③ **进给小、多光磨。** 一次吃太深会崩刃，正确做法是切深 0.01–0.02 mm、
     *      最后空走两刀。
     */
    id: 'make/grinder-wheel-sic',
    name: 'Grinder Grinding Wheel Manufacturing', name_zh: '磨床砂轮制造',
    produces: [{
      item: 'plant/grinder/wheel',
      qty: q(1),
      // 与刚玉砂轮同一条修整工艺，过程能力同为 20–50 g·mm。
      gives: [{ param: 'unbalance', kind: 'range', min: 20, max: 50 }],
    }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-carbide', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/bosch-reactor',
    under: [{ param: 'temperature', min: 180, max: 200 }],
  },
  {
    /** 床身。HT300 浇成 → 时效 → 磨导轨。 */
    id: 'make/grinder-bed',
    name: 'Grinder Bed Manufacturing', name_zh: '磨床床身制造',
    produces: [
      {
        item: 'plant/grinder/bed',
        qty: q(1),
        // 磨完导轨面 2-6 um（每 300 mm），比车床紧一档。
        gives: [{ param: 'flatness', kind: 'range', min: 2, max: 6 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/iron-ht300', qty: q(1) }] }],
    needs: ['plant/grinder'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 砂轮架。HT300 浇成 → 磨配合面。 */
    id: 'make/grinder-wheel-head',
    name: 'Grinder Wheel Head Manufacturing', name_zh: '磨床砂轮架制造',
    produces: [
      {
        item: 'plant/grinder/wheel-head',
        qty: q(1),
        // 刻度盘 100 格 / 5 mm 导程 = 50 um/格；实际用差动丝杠取 1-5 um/格。
        gives: [{ param: 'feedResolution', kind: 'range', min: 1, max: 5 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/iron-ht300', qty: q(1) }] }],
    needs: ['plant/grinder'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /**
     * 砂轮主轴。40Cr 锻 → 淬 → 磨。
     *
     * `performedBy` 指的是磨床自己 —— 这就是那道环。它现在合法，因为第一套
     * 磨床在种子里（data/floor/seed.ts）：这台磨床磨的是**第二台**的主轴。
     *
     * ⚠️ **模型不会提示这一条，也不该把它当错误。** 自指检查比的是
     * "`produces` 里有没有 `performedBy` 那台设备"，这里产出的是零件，两者
     * 不相等。环要绕两步才看得见（主轴 ← 磨床 ← 主轴）。它合不合法，
     * 取决于"种子里有没有一台磨床"，而那件事在数据里，不在路线里。
     *
     * **轴承要 P4，与车床主轴同一档。** 磨削是把主轴的回转误差直接复印到
     * 工件上（每转一圈，砂轮就把自己的跳动刻一遍），所以这一对的精度
     * 不是"加工精度"问题，是"误差从哪来"问题 —— 上界只能是轴承的等级。
     * 挑不到 P4 就用 P5：磨削表面粗糙度掉一档（Ra 0.4 → 0.8 µm 级），
     * 磨床还能磨，只是磨不出量块那一路要的面。
     */
    id: 'make/grinder-spindle',
    name: 'Grinder Wheel Spindle Manufacturing', name_zh: '磨床砂轮主轴制造',
    // 磨出来的主轴，跳动继承磨床自己（A2 精度继承的第二例）。
    produces: [
      {
        item: 'plant/grinder/spindle',
        qty: q(1),
        // P4 轴承、预紧后 1–4 µm 设计值；实测见 measure/grinder-spindle-runout。
        gives: [{ param: 'runout', kind: 'range', min: 1, max: 4 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] },
      {
        anyOf: [
          {
            item: 'std/bearing-spindle-p5',
            qty: q(2),
            need: [{ param: 'precision', kind: 'enum', oneOf: ['P4'] }],
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: ['plant/forge', 'std/micrometer-0-25', { item: 'plant/grinder', qty: q(1), need: [{ param: 'spindleRunout', kind: 'range', max: 3, dir: 'atMost' }], onRelax: 'functional-kept' }],
    performedBy: 'plant/grinder',
  },
  {
    /** 工件头架。HT250 浇成 → 与床身配刮。 */
    id: 'make/grinder-work-head',
    name: 'Grinder Work Headstock Manufacturing', name_zh: '磨床工件头架制造',
    produces: [{
      item: 'plant/grinder/work-head',
      qty: q(1),
      // 浇 + 与床身配刮的过程能力 8–20 µm（验收上限 20）。
      gives: [{ param: 'flatness', kind: 'range', min: 0.008, max: 0.02 }],
    }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] }],
    needs: ['plant/grinder'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 进给丝杠。45 钢车螺纹 → 淬 → 磨。车床出形状，磨床出精度。 */
    id: 'make/grinder-feed-screw',
    name: 'Grinder Feed Lead Screw Manufacturing', name_zh: '磨床进给丝杠制造',
    produces: [{
      item: 'plant/grinder/feed-screw',
      qty: q(1),
      // 车 + 磨的过程能力 8–20 µm/300 mm（验收上限 20）。
      gives: [{ param: 'pitchError', kind: 'range', min: 8, max: 20 }],
    }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1) }] }],
    needs: ['plant/grinder'],
    performedBy: 'lathe',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 铣镗床与钣金工位 —— 遍历第一层露出来的另外两台
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 为什么是这两台：它们挡在第二台车床前面。
 *
 * 从种子往下走第一层就是车床的九个零件，而这九条路线要的设备只有四台：
 * 熔炼炉、磨床、铣镗床、钣金工位。前两台已经拆开，后两台原来是空的
 * —— 所以先写它们。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 车床出不了平面 —— 这是第二道环
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 车床上的一切运动都是回转：它能车圆柱、车端面、车螺纹，但机床的床身、
 * 立柱、工作台要的是**平面**，而平面不是车出来的。
 *
 * 出平面的只有三样：铣（多刃回转）、刨（单刃往复）、磨（磨粒）。种子里
 * 一台都没有。所以这两台机器自己身上的平面只能这样来：
 *
 *   粗加工   车床刀架上装铣头，靠溜板进给 —— 槽、键槽、小平面都能铣
 *   精加工   磨床的导轨磨 —— 平面精度的真正出处
 *
 * **"车床带铣头"就是这台机器能从一台车床长出来的原因。** seed 里
 * 铣镗床那条注释说"车床带铣头也能凑，但刚性与精度都不够"，说的正是
 * 这条路径的代价：它够把机器造出来，不够把机器造准。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 写完之后，瓶颈缩到一台：磨床
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 这两台写完之后，第二台车床的**设备一侧全部有了零件与路线**：九条零件
 * 路线指名的设备，没有一台还是断点。
 *
 * 九条里有六条挂着 `plant/grinder`（床身、主轴箱、主轴、尾座、溜板、
 * 丝杠）。这个环现在有了入口：第一套磨床在种子里，第二套由它磨出来 ——
 * 环没有被打开，是被从外面接管。
 *
 * 剩下的是设备，十五台，分两类：
 *
 *   材料环十三台   选矿厂、磁选机、还原炉、气体分离、Bosch 反应器、矿热炉、
 *                  高温窑、焙烧炉、电解精炼槽、聚合装置、酸吸收装置、
 *                  升华井、轧机
 *   工艺设备两台   绕线机（焊机与感应线圈）、滚齿机（进给箱与减速机的齿轮）
 *
 * **母机环到此为止，往下是这两类。** 九条车床零件路线的投料是三种铸铁、
 * 40Cr、45 钢、冷轧板六样，而六样材料的背后就是那十三台。
 *
 * 磨床的结在 本文件开头写着：砂轮主轴要磨床自己磨。这两台机床
 * 没有解开那个结，只是把结以外的东西补齐了 —— 让"还差什么"从一句空话
 * 变成一条具体的、能指认的路。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 十一个零件，同样没有质量
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 理由和磨床、熔炼炉、电解槽一样：整机重量依赖型号，没有可核的基准就不写。
 * 于是这十一条路线都按 `1 kg → 1 件` 写，证明拓扑（谁要谁、谁造谁），
 * 不证明量。
 */

/**
 * 铣镗床的六个零件。
 *
 * 机器条目 `plant/milling-machine` 在 data/machine/lathe.ts（第二台车床的设备清单里），
 * `composedOf` 由这张清单生成。
 *
 * 六件的分法按"哪一面归哪台设备做"：铸件四面归熔炼炉，平面归磨床，
 * 槽与孔归车床加铣头。
 */
export const MILL_PARTS: readonly Item[] = [
  /** 床身。HT300 浇成。承立柱与工作台，导轨面磨。 */
  { id: 'plant/milling-machine/bed', name: 'Milling and Boring Machine Bed', name_zh: '铣镗床床身', unit: '件', category: 'part' },

  /**
   * 立柱。HT300 浇成。铣头沿它的导轨升降。
   *
   * 立柱和床身的直角是这台机器的基准：不垂直，铣出来的面就是斜的。
   * 直角靠刮，不靠加工 —— 与车床尾座同轴度同理。
   */
  { id: 'plant/milling-machine/column', name: 'Milling and Boring Machine Column', name_zh: '铣镗床立柱', unit: '件', category: 'part' },

  /**
   * 工作台。HT250 浇成。
   *
   * 台面上的 T 型槽是这台机器能自举的关键：槽由"车床刀架装铣头 + 溜板
   * 纵向进给"铣出来 —— 车床上唯一能走直线的进给就是溜板，而铣槽正好
   * 只要一条直线。
   */
  { id: 'plant/milling-machine/table', name: 'Milling and Boring Machine Table', name_zh: '铣镗床工作台', unit: '件', category: 'part' },

  /**
   * 铣头。HT250 浇成，装主轴与变速齿轮。
   *
   * 主轴孔在**车床花盘上镗**：把铸件夹在花盘上，用镗刀杆进给。箱体镗孔
   * 本来该是镗床的活，但第一台镗床的孔只能由车床开出来。
   */
  { id: 'plant/milling-machine/spindle-head', name: 'Milling and Boring Machine Milling Head', name_zh: '铣镗床铣头', unit: '件', category: 'part' },

  /**
   * 主轴。40Cr 锻件 → 淬 → 磨。
   *
   * 与车床主轴的区别在端部：7:24 锥孔装刀柄，刀柄一插就自锁对中。
   * 锥孔要内圆磨 —— 种子那一套里**有**内圆磨（三台一套：外圆/内圆/导轨，见 seed.ts），
   * 但磨锥孔还要**锥形砂轮修整**与**工件头架扳角度**，那是另一道手艺。
   * 所以这一处退到"车后研配"（几份 unblock 都按这个写）。
   */
  { id: 'plant/milling-machine/spindle', name: 'Milling and Boring Machine Spindle', name_zh: '铣镗床主轴', unit: '件', category: 'part' },

  /** 进给丝杠。45 钢车螺纹 → 淬 → 磨。导程误差直接变成进给误差。 */
  { id: 'plant/milling-machine/feed-screw', name: 'Milling and Boring Machine Feed Lead Screw', name_zh: '铣镗床进给丝杠', unit: '件', category: 'part' },
];

/**
 * 铣镗床零件的制造路线。
 *
 * 四条铸件路线要三台设备：熔炼炉出形状，车床带铣头出槽与孔，磨床出平面。
 * **没有一条要求铣镗床自己** —— 这是它与磨床的根本区别。
 */
export const MILL_ROUTES: readonly Route[] = [
  {
    /** 床身。HT300 浇 → 时效 → 顶面与底面磨平。 */
    id: 'make/mill-bed',
    name: 'Milling and Boring Machine Bed Manufacturing', name_zh: '铣镗床床身制造',
    produces: [{ item: 'plant/milling-machine/bed', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht300', qty: q(1) }] }],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 立柱。HT300 浇 → 导轨面磨 → 与床身配刮出直角。 */
    id: 'make/mill-column',
    name: 'Milling and Boring Machine Column Manufacturing', name_zh: '铣镗床立柱制造',
    produces: [{ item: 'plant/milling-machine/column', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht300', qty: q(1) }] }],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 工作台。HT250 浇 → 台面磨 → T 型槽用铣头铣。 */
    id: 'make/mill-table',
    name: 'Milling and Boring Machine Table Manufacturing', name_zh: '铣镗床工作台制造',
    produces: [{ item: 'plant/milling-machine/table', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] }],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 铣头。HT250 浇 → 主轴孔在车床花盘上镗 → 结合面磨。 */
    id: 'make/mill-spindle-head',
    name: 'Milling and Boring Machine Milling Head Manufacturing', name_zh: '铣镗床铣头制造',
    produces: [{ item: 'plant/milling-machine/spindle-head', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] }],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 主轴。40Cr 锻 → 粗车 → 调质 → 精车 → 淬 → 磨外圆与锥孔。 */
    id: 'make/mill-spindle',
    name: 'Milling and Boring Machine Spindle Manufacturing', name_zh: '铣镗床主轴制造',
    produces: [{ item: 'plant/milling-machine/spindle', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] },
      { anyOf: [{ item: 'std/bearing-spindle-p5', qty: q(2) }] }],
    needs: ['plant/grinder', 'plant/forge', 'std/micrometer-0-25'],
    performedBy: 'lathe',
  },
  {
    /** 进给丝杠。45 钢车螺纹 → 淬 → 磨。车床出形状，磨床出精度。 */
    id: 'make/mill-feed-screw',
    name: 'Milling and Boring Machine Feed Lead Screw Manufacturing', name_zh: '铣镗床进给丝杠制造',
    produces: [{ item: 'plant/milling-machine/feed-screw', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1) }] }],
    needs: ['plant/grinder'],
    performedBy: 'lathe',
  },
];

/**
 * 钣金与焊接工位的五个零件。
 *
 * 机器条目 `plant/sheet-shop` 在 data/machine/lathe.ts，`composedOf` 由这张清单生成。
 *
 * 这是一个"工位"而不是一台机器：折弯机、剪板机、焊机要的东西不同，
 * 但都在同一处、都由同一批零件逻辑组成，所以按一套算。
 */
export const SHEET_PARTS: readonly Item[] = [
  /**
   * 机身。HT250 浇成。
   *
   * 现实的折弯机机身是钢板焊接的，这里偏偏用铸铁 —— 因为**焊接要冷轧板，
   * 冷轧板要轧机，而轧机还没建**。用铸铁就不需要轧机：熔炼炉能浇。
   * 这不是省事，是先把这个循环切断；等轧机建成，下一代机身自然换回焊接。
   */
  { id: 'plant/sheet-shop/frame', name: 'Sheet Metal and Welding Workstation Frame', name_zh: '钣金与焊接工位机身', unit: '件', category: 'part' },

  /**
   * 折弯滑块与上模。45 钢锻件，铣出 V 形槽，淬硬。
   *
   * 滑块与导轨的间隙靠配刮，不靠装配公差 —— 与溜板同理。
   */
  { id: 'plant/sheet-shop/ram', name: 'Sheet Metal and Welding Workstation Bending Ram and Upper Die', name_zh: '钣金与焊接工位折弯滑块与上模', unit: '件', category: 'part' },

  /**
   * 剪板刀片。40Cr 淬硬后磨刃。
   *
   * ⚠️ 真正的剪板刀片是 Cr12MoV 这类高铬工具钢，本链只有 40Cr 与 45 ——
   * 用 40Cr 代用，刀片寿命打折。刀片钢链未建，这是缺口。
   */
  { id: 'plant/sheet-shop/blade', name: 'Sheet Metal and Welding Workstation Shear Blade', name_zh: '钣金与焊接工位剪板刀片', unit: '件', category: 'part' },

  /**
   * 传动丝杠。45 钢车螺纹 → 淬 → 磨。
   *
   * 为什么不是液压：液压要油缸、泵、阀、密封件，而密封件要橡胶 ——
   * 橡胶链（硫化要硫，硫有了；成型与配方没有）也没建。丝杠传动只要
   * 车床与磨床两台现成的设备。
   */
  { id: 'plant/sheet-shop/drive', name: 'Sheet Metal and Welding Workstation Drive Lead Screw', name_zh: '钣金与焊接工位传动丝杠', unit: '件', category: 'part' },

  /**
   * 焊机。变压器、送丝机构、焊枪。
   *
   * 三样料：铁芯用**硅钢片**（`mat/silicon-steel-3si` 有路线）；线圈要铜；
   * 功率器件是外购件。变压器要绕线机绕 —— 所以这个工位挂在 `plant/winder` 上。
   *
   * ⚠️ 这条路线一度用冷轧薄板代铁芯，理由写的是"硅钢片没有条目" ——
   * 那是**那时**没有（硅钢是后来补的，见 data/material/silicon.ts）。现在有了，改回来。
   */
  { id: 'plant/sheet-shop/welder', name: 'Sheet Metal and Welding Workstation Welder', name_zh: '钣金与焊接工位焊机', unit: '件', category: 'part' },
];

/**
 * 钣金工位零件的制造路线。
 *
 * 五条里有四条要磨床，三条要铣镗床 —— 这个工位是母机环的下游，不是起点。
 *
 * 它对轧机的依赖只剩一处：焊机的铁芯要薄板。机身、滑块、刀片、丝杠
 * 都不需要薄板 —— 这是把"钣金工位要自己的产品才能造"那个循环切断的
 * 全部意义：切断不等于断干净，剩下的那一处要写明。
 */
export const SHEET_ROUTES: readonly Route[] = [
  {
    /** 机身。HT250 浇 → 结合面铣 → 导轨面磨。 */
    id: 'make/sheet-frame',
    name: 'Sheet Metal and Welding Workstation Frame Manufacturing', name_zh: '钣金与焊接工位机身制造',
    produces: [{ item: 'plant/sheet-shop/frame', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] }],
    needs: ['lathe', 'plant/milling-machine', 'plant/grinder'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 折弯滑块。45 钢锻 → 铣 V 槽 → 淬 → 磨配合面。 */
    id: 'make/sheet-ram',
    name: 'Sheet Metal and Welding Workstation Bending Ram and Upper Die Manufacturing', name_zh: '钣金与焊接工位折弯滑块与上模制造',
    produces: [{ item: 'plant/sheet-shop/ram', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1) }] }],
    needs: ['plant/grinder', 'plant/forge'],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 剪板刀片。40Cr 锻 → 铣出刃口 → 淬 → 磨刃。 */
    id: 'make/sheet-blade',
    name: 'Sheet Metal and Welding Workstation Shear Blade Manufacturing', name_zh: '钣金与焊接工位剪板刀片制造',
    produces: [{ item: 'plant/sheet-shop/blade', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] }],
    needs: ['plant/grinder', 'plant/forge'],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 传动丝杠。45 钢车螺纹 → 淬 → 磨。 */
    id: 'make/sheet-drive',
    name: 'Sheet Metal and Welding Workstation Drive Lead Screw Manufacturing', name_zh: '钣金与焊接工位传动丝杠制造',
    produces: [{ item: 'plant/sheet-shop/drive', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1) }] }],
    needs: ['plant/grinder'],
    performedBy: 'lathe',
  },
  {
    /**
     * 焊机（抽头变压器版）。**不要功率器件的第二条来路。**
     *
     * 弧焊靠电流，电流靠匝比：初级分三段引出抽头，换抽头就换档。
     *
     *   半导体焊机   电流连续可调，薄板能细调
     *   抽头焊机     三到五档，档与档之间跳
     *
     * 所以让给半导体的不是"能不能焊"，是"能不能细调"。本层要焊的是钢板、
     * 型钢与管道 —— 厚板够用，薄板会烧穿。
     */
    id: 'make/sheet-welder-tap',
    name: 'Sheet Metal and Welding Workstation Welder Manufacturing', name_zh: '钣金与焊接工位焊机制造',
    produces: [{ item: 'plant/sheet-shop/welder', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/transformer-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 焊机（半导体版）。铁芯用硅钢片，线圈用铜，功率器件从地球来 —— 装配不要机器，机器人装。
     *
     * 铁芯是叠片，涡流损耗全看硅钢的牌号：3% 硅把电阻率抬上去一个数量级，
     * 这就是焊机与普通变压器要硅钢的原因。薄片规格（0.5 mm）模型里没有，
     * 只有按 kg 的 `mat/silicon-steel-3si` —— 那是长度量纲的缺口，不是材料的缺口。
     */
    id: 'make/sheet-welder',
    name: 'Sheet Metal and Welding Workstation Welder Manufacturing', name_zh: '钣金与焊接工位焊机制造',
    produces: [{ item: 'plant/sheet-shop/welder', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-steel-3si', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      // 四类电子料里只要这一样：焊机没有传感器、没有控制板，只有一个通断的功率级。
      { anyOf: [{ item: 'std/power-device-general', qty: q(1) }] },
    ],
    needs: ['plant/winder'],
    performedBy: 'plant/robot',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...GRINDER_PARTS, ...MILL_PARTS, ...SHEET_PARTS];
/**
 * 种子设备的装配路线 —— 第一台是运来的，第二台起由这条路线造。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件在条目的 `composedOf` 上。
 */
export const SEED_ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/grinder',
    name: 'Grinder Assembly', name_zh: '磨床装配',
    produces: [{
      item: 'plant/grinder',
      qty: q(1),
      gives: [
      { param: 'spindleRunout', kind: 'range', min: 1, max: 3, dir: 'atMost' },
      { param: 'bedFlatness', kind: 'range', min: 1, max: 3, dir: 'atMost' },
      { param: 'feedResolution', kind: 'range', min: 0.5, max: 2, dir: 'atMost' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...GRINDER_ROUTES, ...MILL_ROUTES, ...SHEET_ROUTES, ...SEED_ASSEMBLY_ROUTES];
