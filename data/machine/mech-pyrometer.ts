/**
 * 隐灭式光学高温计的零件与零件路线。
 *
 * 本文件只回答一件事：`std/photoelectric-pyrometer-general` 由哪些零件组成，
 * 每个零件怎么造。整机原理、光学链、标定与降级写在
 * `data/machine/unblock-pyrometer.ts`，这里不重复。
 *
 * 材料用量按源路线的 kg 账与工序说明分配，未逐件称重；数量取自源路线的明确计数。
 * 归并项在名称与注释中列明组成，不能读作单一规格标准件。源路线只给总重、
 * 未给单件质量的，零件条目不写 `mass`，避免把分配值伪装成实测值。
 *
 * 条目名沿用 `std/photoelectric-pyrometer-general`，但本层实际路线**不含光电二极管**：
 * 它是一只隐灭式光学高温计，靠人眼判断灯丝与炉膛等亮，靠铜镜聚光、碳丝作标准源、
 * 动铁式电流表记读数。名称与原理的这一处不一致写在条目注释里，不靠改 id 掩盖。
 *
 * 零件数量取自设计说明：
 *
 *   镜筒 1、表壳 1、底座 1、铜镜 1、镜框 1、灯室 1、滤光片 1、动铁表 1
 *   刻度盘 1、照门眼罩 1、定距套 1、视场光阑 1、灯丝座 2、调节螺钉 6
 *   黑体腔管 1、灯室蜘蛛架 1、滤光片压圈 1
 *
 * 灯室、动铁表是**封在一起的功能组件**：灯室是玻璃管 + 两片窗 + 两根碳电极 +
 * 碳带灯丝，动铁表是线圈 + 软铁芯 + 极靴 + 游丝 + 指针。它们不再向下拆，
 * 因为拆开后各自的零件不能独立互换；这与 `std/quartz-resonator-general`
 * 把石英片、电极、帽壳封成一件是同一处理。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PYROMETER_PARTS: readonly Item[] = [
  { id: 'std/photoelectric-pyrometer-general/tube', name: '隐灭式光学高温计镜筒', unit: '件', category: 'part' },
  { id: 'std/photoelectric-pyrometer-general/case', name: '隐灭式光学高温计表壳', unit: '件', category: 'part' },
  { id: 'std/photoelectric-pyrometer-general/base', name: '隐灭式光学高温计底座', unit: '件', category: 'part' },
  { id: 'std/photoelectric-pyrometer-general/mirror', name: '隐灭式光学高温计铜镜坯', unit: '件', category: 'part' },
  { id: 'std/photoelectric-pyrometer-general/mirror-frame', name: '隐灭式光学高温计镜框', unit: '件', category: 'part' },
  { id: 'std/photoelectric-pyrometer-general/lamp-house', name: '隐灭式光学高温计灯室', unit: '件', category: 'part' },
  { id: 'std/photoelectric-pyrometer-general/filter', name: '隐灭式光学高温计铜红玻璃滤光片', unit: '件', category: 'part' },
  { id: 'std/photoelectric-pyrometer-general/ammeter', name: '隐灭式光学高温计动铁式电流表', unit: '件', category: 'part' },
  { id: 'std/photoelectric-pyrometer-general/scale', name: '隐灭式光学高温计刻度盘', unit: '件', category: 'part' },
  { id: 'std/photoelectric-pyrometer-general/sight', name: '隐灭式光学高温计照门与眼罩', unit: '件', category: 'part' },
  { id: 'std/photoelectric-pyrometer-general/spacer', name: '隐灭式光学高温计定距套', unit: '件', category: 'part' },
  { id: 'std/photoelectric-pyrometer-general/field-stop', name: '隐灭式光学高温计视场光阑', unit: '件', category: 'part' },
  { id: 'std/photoelectric-pyrometer-general/lamp-socket', name: '隐灭式光学高温计灯丝座', unit: '件', category: 'part' },
  { id: 'std/photoelectric-pyrometer-general/adjusting-screw', name: '隐灭式光学高温计调节螺钉', unit: '件', category: 'part' },
  { id: 'std/photoelectric-pyrometer-general/blackbody-cavity', name: '隐灭式光学高温计石墨黑体腔管', unit: '件', category: 'part' },
  { id: 'std/photoelectric-pyrometer-general/spider', name: '隐灭式光学高温计灯室蜘蛛架', unit: '件', category: 'part' },
  { id: 'std/photoelectric-pyrometer-general/filter-retainer', name: '隐灭式光学高温计滤光片压圈', unit: '件', category: 'part' },
];

const PYROMETER_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 镜筒：φ45×4×430 灰铸铁，立浇、干砂芯，两端留 8 mm 加工余量。 */
    id: 'make/pyrometer-tube',
    name: '隐灭式光学高温计镜筒制造',
    produces: [{ item: 'std/photoelectric-pyrometer-general/tube', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(12, 5) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1350, max: 1450 }],
  },
  {
    id: 'make/pyrometer-case',
    name: '隐灭式光学高温计表壳制造',
    produces: [{ item: 'std/photoelectric-pyrometer-general/case', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(4, 5) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1350, max: 1450 }],
  },
  {
    id: 'make/pyrometer-base',
    name: '隐灭式光学高温计底座制造',
    produces: [{ item: 'std/photoelectric-pyrometer-general/base', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(3, 5) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1350, max: 1450 }],
  },
  {
    /** 铜镜坯：φ30×12 铜饼，石墨模铸出 R360 球面初形。 */
    id: 'make/pyrometer-mirror',
    name: '隐灭式光学高温计铜镜坯制造',
    produces: [{ item: 'std/photoelectric-pyrometer-general/mirror', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(2, 25) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1200, max: 1250 }],
  },
  {
    /** 镜框：45 钢，止口与筒同轴 0.05。 */
    id: 'make/pyrometer-mirror-frame',
    name: '隐灭式光学高温计镜框制造',
    produces: [{ item: 'std/photoelectric-pyrometer-general/mirror-frame', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(11, 50) }] }],
    performedBy: 'lathe',
  },
  {
    /**
     * 灯室：φ12×30 玻璃管 + 两片 0.5 mm 窗 + 两根 φ3 碳电极 + 碳带灯丝，
     * 在 0.6 kPa 现场封，耐火泥 + 玻璃珠堵。
     *
     * 玻璃管与窗片用硅石、石灰、铜现配；碳电极与灯丝用 Bosch 碳。
     */
    id: 'make/pyrometer-lamp-house',
    name: '隐灭式光学高温计灯室制造',
    produces: [{ item: 'std/photoelectric-pyrometer-general/lamp-house', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/silica', qty: q(3, 100) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(33, 500) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1, 20) }] },
    ],
    steps: [
      { note_zh: '熔玻璃、拉 φ12×0.5 管、浇窗片', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1450, max: 1600 }] },
      { note_zh: '装碳电极与碳带灯丝，贴窗片', performedBy: 'plant/robot' },
      { note_zh: '耐火泥封口，0.6 kPa 下静置 24 h 检漏', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 铜红玻璃滤光片：φ25×0.6，650 nm 透 45%，550 nm 漏 25%。 */
    id: 'make/pyrometer-optical-filter',
    name: '隐灭式光学高温计铜红玻璃滤光片制造',
    produces: [{ item: 'std/photoelectric-pyrometer-general/filter', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/silica', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 1000) }] },
    ],
    performedBy: 'plant/earth-kiln',
    under: [{ param: 'temperature', min: 550, max: 650 }],
  },
  {
    /**
     * 动铁式电流表：0–2 A，200 匝线圈、软铁芯与极靴、45 钢游丝、指针与刻度。
     *
     * 不用永磁：线圈通电自己产生磁场，软铁片被吸进线圈。刻度天生不均匀，
     * 所以盘上刻电流，温度靠标定牌。
     */
    id: 'make/pyrometer-optical-ammeter',
    name: '隐灭式光学高温计动铁式电流表制造',
    produces: [{ item: 'std/photoelectric-pyrometer-general/ammeter', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper-wire', qty: q(9, 100) }] },
      { anyOf: [{ item: 'mat/glass-covered-wire', qty: q(13, 100) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(4, 25) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1, 50) }] },
    ],
    steps: [
      { note_zh: '绕 200 匝线圈（玻包线 φ1.0、展开 12 m）', performedBy: 'plant/winder' },
      { note_zh: '装软铁芯、极靴、游丝与指针', performedBy: 'plant/robot' },
      { note_zh: '刻电流盘（100 条线，每格 0.02 A）', performedBy: 'plant/milling-machine' },
    ],
  },
  {
    /** 刻度盘：100 mm 弧、100 条线，每格 0.02 A，刻深 0.3。 */
    id: 'make/pyrometer-scale',
    name: '隐灭式光学高温计刻度盘制造',
    produces: [{ item: 'std/photoelectric-pyrometer-general/scale', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 20) }] }],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 照门与眼罩：保证 300 mm 眼距。 */
    id: 'make/pyrometer-sight',
    name: '隐灭式光学高温计照门与眼罩制造',
    produces: [{ item: 'std/photoelectric-pyrometer-general/sight', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(7, 50) }] }],
    performedBy: 'lathe',
  },
  {
    /** 定距套：灯丝到镜面 180.00 的唯一保证，长度用量块组当场比。 */
    id: 'make/pyrometer-spacer',
    name: '隐灭式光学高温计定距套制造',
    produces: [{ item: 'std/photoelectric-pyrometer-general/spacer', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 10) }] }],
    performedBy: 'lathe',
  },
  {
    /** 视场光阑：φ8 孔，开在像面上，挡掉炉墙暗边。 */
    id: 'make/pyrometer-field-stop',
    name: '隐灭式光学高温计视场光阑制造',
    produces: [{ item: 'std/photoelectric-pyrometer-general/field-stop', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 20) }] }],
    performedBy: 'lathe',
  },
  {
    /** 灯丝座 2 只：夹碳带两端，绝缘垫用耐火料。 */
    id: 'make/pyrometer-lamp-socket',
    name: '隐灭式光学高温计灯丝座制造',
    produces: [{ item: 'std/photoelectric-pyrometer-general/lamp-socket', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(3, 50) }] }],
    performedBy: 'lathe',
  },
  {
    /** 调节螺钉 6 只：镜框、光阑、照门各两只。 */
    id: 'make/pyrometer-adjusting-screw',
    name: '隐灭式光学高温计调节螺钉制造',
    produces: [{ item: 'std/photoelectric-pyrometer-general/adjusting-screw', qty: q(6) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(3, 50) }] }],
    performedBy: 'lathe',
  },
  {
    /**
     * 石墨黑体腔管：φ20×100、壁 3、端面 φ3 孔。
     *
     * 它随仪器走，标定时装铜或铁碳共晶；腔的有效发射率 0.99。
     */
    id: 'make/pyrometer-blackbody-cavity',
    name: '隐灭式光学高温计石墨黑体腔管制造',
    produces: [{ item: 'std/photoelectric-pyrometer-general/blackbody-cavity', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/carbon', qty: q(3, 100) }] }],
    performedBy: 'lathe',
  },
  {
    /** 灯室蜘蛛架：3 根 1.5×8 辐条，落在 φ8 视场光阑之外。 */
    id: 'make/pyrometer-spider',
    name: '隐灭式光学高温计灯室蜘蛛架制造',
    produces: [{ item: 'std/photoelectric-pyrometer-general/spider', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 50) }] }],
    steps: [
      { note_zh: '车三根辐条', performedBy: 'lathe' },
      { note_zh: '装配成蜘蛛架（辐条避开 φ8 光阑）', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 滤光片压圈：45 钢，压住 φ25 滤光片。 */
    id: 'make/pyrometer-filter-retainer',
    name: '隐灭式光学高温计滤光片压圈制造',
    produces: [{ item: 'std/photoelectric-pyrometer-general/filter-retainer', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 20) }] }],
    performedBy: 'lathe',
  },
];

export const PYROMETER_PART_ROUTES: readonly Route[] = PYROMETER_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PYROMETER_PARTS];
export const DATA_ROUTES: readonly Route[] = [...PYROMETER_PART_ROUTES];
