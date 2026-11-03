/**
 * 电机 —— 全厂每台设备都要，而它是数据里第一个**标准件**。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么叫 std/ 而不是 plant/
 * ═══════════════════════════════════════════════════════════════════════
 *
 * `composedOf` 的零件 id 有两种形态，对应两种消歧方式：
 *
 *   <machine>/<name>    专用件，规格由机器决定
 *                       `mill/spindle` 是 φ80 铣床主轴，`lathe/spindle` 是 φ50
 *                       车床主轴 —— 同名不同物，所以归属必须写进名字
 *   std/<type>-<spec>   标准件，规格写在名字里
 *                       `std/motor-7.5kw-4p` 装在哪台机器上都是这一只
 *
 * 之前这条规则是"一律要机器前缀"，于是电机装不进任何一台机器 —— 复制成
 * 二十份违反单一事实来源，写成 `needs` 又语义不对（`needs` 是"在场的前提"，
 * 电机是**装进去的**）。现在标准件走规格号，两难解开。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么只有一个规格
 * ═══════════════════════════════════════════════════════════════════════
 *
 * **7.5 kW、4 极、B3 卧式。全厂只造这一种。**
 *
 * 这不是算出来的，是**选定的**：功率不匹配靠变频器调速与减速比凑。真实的
 * 工程做法就是这样 —— 少品种、大批量，备件只有一种。选它是因为它不依赖
 * 模型里没有的量（功率、扭矩、载荷），而不是因为它对每台机器都合适。
 *
 * 代价写在明处：大设备要几台并联（本层按一台记），小设备则大马拉小车。
 * **又一次"能用但不是最好"** —— 碳电极、丁醇、45% 硅铁、单一规格电机。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 三件以前没碰到的事
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ① **第一阶段没有铝。** 异步电机最常见的是鼠笼转子 —— 转子槽里铸铝。那时
 *    风化层 9% 的 Al₂O₃ 一条路线都没建，所以做的是**绕线转子**：
 *    铜线绕在转子上，经滑环引出。贵、要维护滑环，但不需要铝。
 *    这是"没有铝"第一次真正挡住一个零件。**铝链补上之后加了第二条路线
 *    （make/motor-rotor-squirrel）** —— 现在两种转子并存，不是二选一。
 * ② **定子冲片要冲模。** 硅钢片是一片片冲出来的，冲模是硬质合金 ——
 *    而钨在风化层里不到 1 ppm，硬质合金只能从地球带（种子里的刀片那一类）。
 *    所以本层的定子用铣削代冲：慢、贵、精度差，但不要冲模。
 * ③ **第一台绕线机没有电机。** 电机的绕组要用绕线机绕，而绕线机自己要电机 ——
 *    第一台只能由机器人手工绕。绕线是最难自动化的工序之一，
 *    这里是它第一次咬人。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const MOTOR_MATERIALS: readonly Item[] = [
  /**
   * 漆包线。铜线外面一层绝缘漆，绕组的本体。
   *
   * 绝缘漆用酚醛树脂（老式 B 级绝缘的标准做法）：现在的电机用聚酯或
   * 聚酰亚胺，而那些要 C3 以上的单体，本层没有。
   *
   * `thermalClass` = **130 °C（B 级）**，就是这个选择的上界：同一段注释说
   * "现在的电机用聚酯或聚酰亚胺"，聚酯能到 F 级（155）、聚酰亚胺到 H 级（180），
   * 酚醛只到 B。所以伺服电机那一条写 `need ≥155` 时会**判 kept**——
   * 不是写错，是这条线的真实上界。
   */
  {
    id: 'mat/enamel-wire',
    name: 'Enamelled Wire', name_zh: '漆包线',
    unit: 'kg',
    category: 'material',
    // 两条路线交两档：酚醛 B 级 130（make/enamel-wire）、THEIC 聚酯 F 级 155
    // （make/enamel-wire-f）。条目声明的是**整块料能到的范围**，不是任一条路线的交付。
    props: [{ param: 'thermalClass', kind: 'range', min: 130, max: 180, unit: '°C', dir: 'atLeast' }],
  },
];

export const MOTOR_PARTS: readonly Item[] = [
  /**
   * 定子。硅钢片叠压成铁芯，内圆开槽，槽里嵌绕组。
   *
   * 片与片之间要绝缘（否则涡流把铁芯烧热），叠完用扣片或焊接固定。
   * ⚠️ 冲片本应冲压，本层用铣削代 —— 冲模是硬质合金，从地球带。
   */
  { id: 'std/motor-7.5kw-4p/stator', name: '7.5 kW Four-Pole Motor Stator', name_zh: '7.5 kW 四极电机定子', unit: '件', category: 'part' },

  /**
   * 转子。硅钢叠片 + 绕组（+ 滑环，绕线式才有）。
   *
   * 两条路线产出同一个零件：**绕线式**（铜绕组 + 滑环，贵、要维护）与
   * **鼠笼式**（转子槽里铸铝，简单、免维护）。鼠笼要铝，而铝链是后来才补上的
   * —— 所以绕线式不是妥协的终点，它是"铝还没有的时候"唯一能走的那条。
   */
  { id: 'std/motor-7.5kw-4p/rotor', name: '7.5 kW Four-Pole Motor Rotor', name_zh: '7.5 kW 四极电机转子', unit: '件', category: 'part' },

  /** 绕组。漆包线按匝数绕进定子与转子的槽里，端部绑扎、浸漆。 */
  { id: 'std/motor-7.5kw-4p/windings', name: '7.5 kW Four-Pole Motor Windings', name_zh: '7.5 kW 四极电机绕组', unit: '件', category: 'part' },

  /** 轴。45 钢，两头装轴承，一头出轴伸 —— 与车床主轴同一类零件，只是不要求那么高的精度。 */
  { id: 'std/motor-7.5kw-4p/shaft', name: '7.5 kW Four-Pole Motor Shaft', name_zh: '7.5 kW 四极电机轴', unit: '件', category: 'part' },

  /** 机座。HT200 浇成，带散热筋；它同时是定子的外套与安装基准。 */
  { id: 'std/motor-7.5kw-4p/frame', name: '7.5 kW Four-Pole Motor Frame', name_zh: '7.5 kW 四极电机机座', unit: '件', category: 'part' },
];

export const MOTOR_ROUTES: readonly Route[] = [
  {
    /**
     * 漆包线：铜杆 940 + 酚醛树脂 60 → 1000。
     *
     * 6% 是漆膜重量（一级漆包线漆膜约占 5–8%）。拉丝要拉丝模 —— 后来
     * 这一处自己能磨了（std/wire-die-general，硬质合金 + 分级碳化硅磨孔）。
     *
     * 绝缘漆用酚醛树脂：老式电机就是这么做的（现在换成聚酯/聚酰亚胺，
     * 而那些要 C3 以上的单体）。**降级使用的第四次**，够用到 B 级绝缘。
     */
    id: 'make/enamel-wire',
    name: 'Enamelled Wire Production', name_zh: '漆包线制备',
    produces: [
      {
        item: 'mat/enamel-wire',
        qty: q(1000),
        gives: [{ param: 'thermalClass', kind: 'range', min: 130, max: 130 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(940) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(60) }] },
    ],
    needs: ['std/wire-die-general'],
    steps: [
      { note_zh: '拉丝', performedBy: 'plant/rolling-mill' },
      { note_zh: '涂漆、烘干', performedBy: 'plant/kiln' },
    ],
  },
  {
    /**
     * 定子（冲压版）。**压机与冲模把"铣削代冲压"这一步换回来了。**
     *
     *   硅钢 0.6 kg + 冲模（工具）→ 定子 1 只，而铣削那条要 1 kg
     *
     * 差的那 0.4 kg 是**边角料**：铣削从整张板上掏出一个定子，冲压是裁出带料的形状、
     * 一片一片落料 —— 材料利用率 40% → 75%，这是冲压相对铣削最实在的好处。
     *
     * ⚠️ 但模具是 40Cr（没有 Cr12MoV），冲几万次就要修一次。所以这条来路适合
     * "要做很多台电机"，不适合"做一两台"—— 而模型看不出产量，这个问题只能写在注释里。
     */
    id: 'make/motor-stator-stamped',
    name: '7.5 kW Four-Pole Motor Stator Manufacturing', name_zh: '7.5 kW 四极电机定子制造',
    produces: [{ item: 'std/motor-7.5kw-4p/stator', qty: q(1) }],
    // 0.6 与铣削那条的 1.0 表示**利用率差**（40% → 75%）；绝对值都是占位量级。
    uses: [{ anyOf: [{ item: 'mat/silicon-steel-3si', qty: q(3, 5) }] }],
    needs: ['std/stamping-die-general'],
    steps: [
      { note_zh: '落料与冲槽（压机 + 冲模，一次成形）', performedBy: 'plant/press' },
      { note_zh: '叠压与铆紧', performedBy: 'plant/robot' },
      { note_zh: '车止口、压入机座', performedBy: 'lathe' },
      { note_zh: '磨端面', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 定子。硅钢片铣槽叠压 → 压入机座 → 槽绝缘。 */
    id: 'make/motor-stator',
    name: '7.5 kW Four-Pole Motor Stator Manufacturing', name_zh: '7.5 kW 四极电机定子制造',
    produces: [{ item: 'std/motor-7.5kw-4p/stator', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/silicon-steel-3si', qty: q(1) }] }],
    needs: [],
    steps: [
      { note_zh: '铣槽、叠压', performedBy: 'plant/milling-machine' },
      { note_zh: '车止口、压入机座', performedBy: 'lathe' },
      { note_zh: '磨端面', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 转子。硅钢叠片 + 铜绕组 + 滑环；动平衡要磨校重。 */
    id: 'make/motor-rotor',
    name: '7.5 kW Four-Pole Motor Rotor Manufacturing', name_zh: '7.5 kW 四极电机转子制造',
    produces: [{ item: 'std/motor-7.5kw-4p/rotor', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-steel-3si', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '叠片、铣槽、装滑环', performedBy: 'plant/milling-machine' },
      { note_zh: '嵌转子绕组', performedBy: 'plant/winder' },
      { note_zh: '动平衡（磨校重）', performedBy: 'plant/grinder' },
    ],
  },
  {
    /**
     * 绕组。漆包线绕进槽里、端部绑扎、整体浸漆烘干。
     *
     * **第一台只能由机器人手工绕** —— 绕线机自己也要电机，这个环的入口
     * 是人工（机器人）操作，不是设备。见文件头第三条。
     */
    id: 'make/motor-windings',
    name: '7.5 kW Four-Pole Motor Windings Manufacturing', name_zh: '7.5 kW 四极电机绕组制造',
    produces: [{ item: 'std/motor-7.5kw-4p/windings', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/enamel-wire', qty: q(1) }] }],
    needs: [],
    steps: [
      { note_zh: '绕线、端部绑扎', performedBy: 'plant/winder' },
      // 浸漆本该 120–150，而土窑下限 400 —— 同铁芯定子那处的降级。
      { note_zh: '浸漆、烘干（土窑下限 400，实际该 150）', performedBy: 'plant/earth-kiln', under: [{ param: 'temperature', min: 400, max: 450 }] },
    ],
  },
  {
    /** 轴。45 钢车 → 淬 → 磨轴颈与轴伸。 */
    id: 'make/motor-shaft',
    name: '7.5 kW Four-Pole Motor Shaft Manufacturing', name_zh: '7.5 kW 四极电机轴制造',
    produces: [{ item: 'std/motor-7.5kw-4p/shaft', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'std/bearing-general-p0', qty: q(2) }] }],
    needs: [],
    steps: [
      { note_zh: '车', performedBy: 'lathe' },
      // 830–860 落在土窑（400–1100）的温区里 —— 用种子设备，不用还没造出来的电阻炉。
      { note_zh: '淬火回火', performedBy: 'plant/earth-kiln', under: [{ param: 'temperature', min: 830, max: 860 }] },
      { note_zh: '磨轴颈与轴伸', performedBy: 'plant/grinder' },
    ],
  },
  {
    /**
     * 轴（轴瓦版）：**用铸铁轴瓦代替滚动轴承**。
     *
     *   45 钢 1 + 铸铁 1 → 轴 1
     *
     * 原路线每根轴配两只 P0 轴承，而轴承要轴承钢、要锻炉、要电阻炉 ——
     * 锻炉又要电机，于是「电机 ⇄ 轴承 ⇄ 锻炉」成了一个环。
     *
     * 断法很老：**滑动轴承**。铸铁轴瓦（HT250，内孔车到与轴颈配）+ 油槽 +
     * 滴油润滑，19 世纪的电机全是这么干的。
     *
     * 代价：摩擦损失大（机械效率掉 3–5 个百分点）、要人加油、轴瓦磨损后间隙变大
     * 要重浇或换瓦 —— **但它不依赖任何一条没通的路。**
     */
    id: 'make/motor-shaft-bushed',
    name: '7.5 kW Four-Pole Motor Shaft Manufacturing', name_zh: '7.5 kW 四极电机轴制造',
    produces: [{ item: 'std/motor-7.5kw-4p/shaft', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '车轴颈与轴伸（留磨量）', performedBy: 'lathe' },
      { note_zh: '磨轴颈', performedBy: 'plant/grinder' },
      { note_zh: '浇轴瓦、车內孔与油槽、与轴颈配刮', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 鼠笼转子 —— 铝补上之后的第二条来路。
     *
     * 转子槽里铸铝，两端浇成短路环。比绕线转子简单得多：没有滑环、不用维护、
     * 效率还高一点。**data/material/aluminium.ts 补上之后，这台电机才做回
     * 它本来的样子。**
     *
     * 两条路线产出同一个零件（模型允许 OR）：绕线转子（铜）与鼠笼转子（铝）。
     * 前者在铝链建起来之前是唯一解，后者是正解 —— 两条都留着，因为
     * "哪一条先能跑"取决于铝链什么时候通。
     */
    id: 'make/motor-rotor-squirrel',
    name: '7.5 kW Four-Pole Motor Rotor Manufacturing', name_zh: '7.5 kW 四极电机转子制造',
    produces: [{ item: 'std/motor-7.5kw-4p/rotor', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-steel-3si', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '叠片、铣槽', performedBy: 'plant/milling-machine' },
      { note_zh: '转子槽铸铝、浇短路环', performedBy: 'plant/melting-furnace' },
      { note_zh: '车外圆', performedBy: 'lathe' },
      { note_zh: '动平衡（磨校重）', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 机座。HT200 浇 → 车止口 → 镗轴承室；散热筋随铸。 */
    id: 'make/motor-frame',
    name: '7.5 kW Four-Pole Motor Frame Manufacturing', name_zh: '7.5 kW 四极电机机座制造',
    produces: [{ item: 'std/motor-7.5kw-4p/frame', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(1) }] }],
    needs: [],
    steps: [
      { note_zh: '浇铸（散热筋随铸）', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1300, max: 1500 }] },
      { note_zh: '车止口', performedBy: 'lathe' },
      // 轴承室在车床花盘上镗（与铣床头主轴孔同一个办法）—— 不写铣镗床。
      { note_zh: '镗轴承室', performedBy: 'lathe' },
    ],
  },
];

/**
 * 电机。全厂每台设备的动力源，也是数据里最难安置的一个条目。
 *
 * `composedOf` 里的五个零件都归它自己 —— 只有电机是"独立设备"时这条才成立。
 * 真实情况是它被装进别的机器里，而那件事模型说不出来（见文件头）。
 */
export const MOTOR: Item = {
  id: 'std/motor-7.5kw-4p',
  name: '7.5 kW Four-Pole Motor', name_zh: '7.5 kW 四极电机',
  unit: '台',
  category: 'part',
  composedOf: MOTOR_PARTS.map((p) => ({ item: p.id, qty: q(1) })),
  // 验收上限：三相绕组任一线电阻 0.1–1 Ω（20 °C 折算）、380 V/50 Hz 空载电流 2–10 A。
  // 两项都是「装配完成后才出现」的整机性能，零件表上量不到 —— 见 measure/motor-7.5kw-4p。
  props: [
    { param: 'windingResistance', kind: 'range', min: 0.1, max: 1, unit: 'Ω' },
    { param: 'noLoadCurrent', kind: 'range', min: 2, max: 10, unit: 'A' },
  ],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...MOTOR_PARTS, ...MOTOR_MATERIALS, MOTOR];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/motor-7.5kw-4p',
    name: '7.5 kW Four-Pole Motor Assembly', name_zh: '7.5 kW 四极电机装配',
    produces: [{
      item: 'std/motor-7.5kw-4p',
      qty: q(1),
      // 装配 + 浸漆 + 干燥后的过程能力：绕组 0.2–0.9 Ω、空载电流 3–9 A（验收上限 0.1–1 Ω / 2–10 A）。
      gives: [
        { param: 'windingResistance', kind: 'range', min: 0.2, max: 0.9 },
        { param: 'noLoadCurrent', kind: 'range', min: 3, max: 9 },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...MOTOR_ROUTES, ...ASSEMBLY_ROUTES];
