/**
 * 程序升温控制器的零件与零件路线。
 *
 * 本文件只回答一件事：`std/ramp-controller-general` 由哪些零件组成，
 * 每个零件怎么造。设计依据、8 段程序盘、三层超温保护与 kg 账写在
 * `data/machine/unblock-ramp-controller.ts`。
 *
 * 材料用量按源路线的 kg 账与工序说明分配，未逐件称重；数量取自源路线的明确计数。
 * 归并项在名称与注释中列明组成，不能读作单一规格标准件。源路线只给总重、
 * 未给单件质量的，零件条目不写 `mass`，避免把分配值伪装成实测值。
 *
 * 条目是**机械式凸轮程序升温控制器**，不是 PROM + 计数器 + DAC 的电子版：
 *
 *   设定值   一只 8 段凸轮盘（12 µm/K，0–1000 K）
 *   感温     刚玉棒 + 石英参考支架 + 4:1 差动杠杆
 *   走时     2 kg 重锤 + 擒纵 40 s/齿 + 45/90 齿棘轮 + 8 齿星轮
 *   保护     停车爪、1000 锁扣、1084.6 易熔丝
 *
 * 零件按功能归并成 29 项：齿件成组、轴销成组、齿轮成组、陶瓷壳成组。
 * 归并项的数量写在名称与注释里，不把一组件说成一件。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const RAMP_PARTS: readonly Item[] = [
  { id: 'std/ramp-controller-general/base', name: 'Mechanical Cam-Programmed Temperature Controller Base', name_zh: '机械式凸轮程序升温控制器底座', unit: '件', category: 'part' },
  { id: 'std/ramp-controller-general/frame-set', name: 'Mechanical Cam-Programmed Temperature Controller Frame Set', name_zh: '机械式凸轮程序升温控制器机架组', unit: '套', category: 'part' },
  { id: 'std/ramp-controller-general/weight', name: 'Mechanical Cam-Programmed Temperature Controller Weight', name_zh: '机械式凸轮程序升温控制器重锤', unit: '件', category: 'part' },
  { id: 'std/ramp-controller-general/lever-seat', name: 'Mechanical Cam-Programmed Temperature Controller Lever Seat', name_zh: '机械式凸轮程序升温控制器杠杆座', unit: '件', category: 'part' },
  { id: 'std/ramp-controller-general/follower-guide', name: 'Mechanical Cam-Programmed Temperature Controller Follower Guide', name_zh: '机械式凸轮程序升温控制器从动件导轨', unit: '件', category: 'part' },
  { id: 'std/ramp-controller-general/pointer-seat', name: 'Mechanical Cam-Programmed Temperature Controller Pointer Seat', name_zh: '机械式凸轮程序升温控制器指针座', unit: '件', category: 'part' },
  { id: 'std/ramp-controller-general/toothed-wheel-set', name: 'Mechanical Cam-Programmed Temperature Controller Gear Set', name_zh: '机械式凸轮程序升温控制器齿轮组', unit: '套', category: 'part' },
  { id: 'std/ramp-controller-general/micrometer-screw', name: 'Mechanical Cam-Programmed Temperature Controller Micrometer Screw', name_zh: '机械式凸轮程序升温控制器千分螺丝', unit: '件', category: 'part' },
  { id: 'std/ramp-controller-general/differential-lever', name: 'Mechanical Cam-Programmed Temperature Controller Differential Lever', name_zh: '机械式凸轮程序升温控制器差动杠杆', unit: '件', category: 'part' },
  { id: 'std/ramp-controller-general/shaft-pin-set', name: 'Mechanical Cam-Programmed Temperature Controller Shaft and Pin', name_zh: '机械式凸轮程序升温控制器轴与销', unit: '套', category: 'part' },
  { id: 'std/ramp-controller-general/gear-set', name: 'Mechanical Cam-Programmed Temperature Controller Gear', name_zh: '机械式凸轮程序升温控制器齿轮', unit: '套', category: 'part' },
  { id: 'std/ramp-controller-general/escapement-set', name: 'Escapement Set', name_zh: '擒纵机构组', unit: '套', category: 'part' },
  { id: 'std/ramp-controller-general/spring-set', name: 'Mechanical Cam-Programmed Temperature Controller Leaf Spring', name_zh: '机械式凸轮程序升温控制器弹簧片', unit: '套', category: 'part' },
  { id: 'std/ramp-controller-general/pointer', name: 'Mechanical Cam-Programmed Temperature Controller Pointer', name_zh: '机械式凸轮程序升温控制器指针', unit: '件', category: 'part' },
  { id: 'std/ramp-controller-general/flag', name: 'Mechanical Cam-Programmed Temperature Controller Flag', name_zh: '机械式凸轮程序升温控制器旗标', unit: '件', category: 'part' },
  { id: 'std/ramp-controller-general/weight-rod-drum', name: 'Mechanical Cam-Programmed Temperature Controller Weight Suspension Rod and Drum', name_zh: '机械式凸轮程序升温控制器重锤吊杆与鼓轮', unit: '套', category: 'part' },
  { id: 'std/ramp-controller-general/cam-disc', name: 'Mechanical Cam-Programmed Temperature Controller Program Disc', name_zh: '机械式凸轮程序升温控制器程序盘', unit: '件', category: 'part' },
  { id: 'std/ramp-controller-general/cam-cover-key', name: 'Mechanical Cam-Programmed Temperature Controller Cam Disc Cover and Key', name_zh: '机械式凸轮程序升温控制器凸轮盘压盖与键', unit: '套', category: 'part' },
  { id: 'std/ramp-controller-general/ceramic-case-set', name: 'Mechanical Cam-Programmed Temperature Controller Ceramic Shell', name_zh: '机械式凸轮程序升温控制器陶瓷壳', unit: '套', category: 'part' },
  { id: 'std/ramp-controller-general/guide-ring', name: 'Mechanical Cam-Programmed Temperature Controller Rod Guide Ring', name_zh: '机械式凸轮程序升温控制器棒的导向环', unit: '件', category: 'part' },
  { id: 'std/ramp-controller-general/sensor-rod', name: 'Mechanical Cam-Programmed Temperature Controller Temperature Sensing Rod', name_zh: '机械式凸轮程序升温控制器感温棒', unit: '件', category: 'part' },
  { id: 'std/ramp-controller-general/contact-set', name: 'Mechanical Cam-Programmed Temperature Controller Contact', name_zh: '机械式凸轮程序升温控制器触点', unit: '套', category: 'part' },
  { id: 'std/ramp-controller-general/copper-strip-set', name: 'Mechanical Cam-Programmed Temperature Controller Guide Plate and Terminal Post', name_zh: '机械式凸轮程序升温控制器导片与接线柱', unit: '套', category: 'part' },
  { id: 'std/ramp-controller-general/knife-switch', name: 'Mechanical Cam-Programmed Temperature Controller Knife Switch', name_zh: '机械式凸轮程序升温控制器闸刀', unit: '件', category: 'part' },
  { id: 'std/ramp-controller-general/dial', name: 'Mechanical Cam-Programmed Temperature Controller Dial', name_zh: '机械式凸轮程序升温控制器刻度盘', unit: '件', category: 'part' },
  { id: 'std/ramp-controller-general/quartz-reference', name: 'Mechanical Cam-Programmed Temperature Controller Quartz Reference Bracket', name_zh: '机械式凸轮程序升温控制器石英参考支架', unit: '件', category: 'part' },
  { id: 'std/ramp-controller-general/observation-window', name: 'Mechanical Cam-Programmed Temperature Controller Viewing Window', name_zh: '机械式凸轮程序升温控制器观察窗', unit: '件', category: 'part' },
  { id: 'std/ramp-controller-general/case-hardware-set', name: 'Mechanical Cam-Programmed Temperature Controller Case Fastener Set', name_zh: '机械式凸轮程序升温控制器表壳紧固件组', unit: '套', category: 'part' },
  { id: 'std/ramp-controller-general/fuse-wire', name: 'Mechanical Cam-Programmed Temperature Controller Fusible Wire', name_zh: '机械式凸轮程序升温控制器易熔丝', unit: '件', category: 'part' },
];

const RAMP_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    id: 'make/ramp-base',
    name: 'Mechanical Cam-Programmed Temperature Controller Base Manufacturing', name_zh: '机械式凸轮程序升温控制器底座制造',
    produces: [{ item: 'std/ramp-controller-general/base', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(8, 5) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1380, max: 1450 }],
  },
  {
    /** 立柱 2 根 + 横梁 1 根 + 角撑 4 只。 */
    id: 'make/ramp-frame-set',
    name: 'Mechanical Cam-Programmed Temperature Controller Frame Set Manufacturing', name_zh: '机械式凸轮程序升温控制器机架组制造',
    produces: [{ item: 'std/ramp-controller-general/frame-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(1) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1380, max: 1450 }],
  },
  {
    /** 重锤：2 kg 设计质量，浇成 φ70×150，一次浇成不许缩孔。 */
    id: 'make/ramp-weight',
    name: 'Mechanical Cam-Programmed Temperature Controller Weight Manufacturing', name_zh: '机械式凸轮程序升温控制器重锤制造',
    produces: [{ item: 'std/ramp-controller-general/weight', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(5, 2) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1380, max: 1450 }],
  },
  {
    id: 'make/ramp-lever-seat',
    name: 'Mechanical Cam-Programmed Temperature Controller Lever Seat Manufacturing', name_zh: '机械式凸轮程序升温控制器杠杆座制造',
    produces: [{ item: 'std/ramp-controller-general/lever-seat', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(1, 2) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1380, max: 1450 }],
  },
  {
    id: 'make/ramp-follower-guide',
    name: 'Mechanical Cam-Programmed Temperature Controller Follower Guide Manufacturing', name_zh: '机械式凸轮程序升温控制器从动件导轨制造',
    produces: [{ item: 'std/ramp-controller-general/follower-guide', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(2, 5) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1380, max: 1450 }],
  },
  {
    id: 'make/ramp-pointer-seat',
    name: 'Mechanical Cam-Programmed Temperature Controller Pointer Seat Manufacturing', name_zh: '机械式凸轮程序升温控制器指针座制造',
    produces: [{ item: 'std/ramp-controller-general/pointer-seat', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(3, 10) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1380, max: 1450 }],
  },
  {
    /** 8 齿星轮 1 只 + 45 齿棘轮 1 只 + 90 齿棘轮 1 只，HT300 白口齿面。 */
    id: 'make/ramp-toothed-wheel-set',
    name: 'Mechanical Cam-Programmed Temperature Controller Gear Set Manufacturing', name_zh: '机械式凸轮程序升温控制器齿轮组制造',
    produces: [{ item: 'std/ramp-controller-general/toothed-wheel-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht300', qty: q(1, 2) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1380, max: 1450 }],
  },
  {
    /** 千分螺丝：M8×0.5，只用来对零，不走设定值。 */
    id: 'make/ramp-micrometer-screw',
    name: 'Mechanical Cam-Programmed Temperature Controller Micrometer Screw Manufacturing', name_zh: '机械式凸轮程序升温控制器千分螺丝制造',
    produces: [{ item: 'std/ramp-controller-general/micrometer-screw', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(7, 100) }] }],
    performedBy: 'lathe',
  },
  {
    /** 差动杠杆：80×10×5，两臂 40 与 40，刀口在中间。 */
    id: 'make/ramp-differential-lever',
    name: 'Mechanical Cam-Programmed Temperature Controller Differential Lever Manufacturing', name_zh: '机械式凸轮程序升温控制器差动杠杆制造',
    produces: [{ item: 'std/ramp-controller-general/differential-lever', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(7, 50) }] }],
    steps: [
      { note_zh: '车杠杆毛坯（两臂 40 与 40，刀口在中间）', performedBy: 'lathe' },
      { note_zh: '磨刀口两面 0.005，不许倒圆', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 轴与销 14 根，φ3–φ8，配合 H7/g6。 */
    id: 'make/ramp-shaft-pin-set',
    name: 'Mechanical Cam-Programmed Temperature Controller Shaft and Pin Manufacturing', name_zh: '机械式凸轮程序升温控制器轴与销制造',
    produces: [{ item: 'std/ramp-controller-general/shaft-pin-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(21, 50) }] }],
    performedBy: 'lathe',
  },
  {
    /** 齿轮 3 对：模数 0.5，20/40、20/45、20/30。 */
    id: 'make/ramp-gear-set',
    name: 'Mechanical Cam-Programmed Temperature Controller Gear Manufacturing', name_zh: '机械式凸轮程序升温控制器齿轮制造',
    produces: [{ item: 'std/ramp-controller-general/gear-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(18, 25) }] }],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 擒纵叉 1 只 + 停车爪 1 只 + 1000 锁扣 1 只。 */
    id: 'make/ramp-escapement-set',
    name: 'Escapement Set Manufacturing', name_zh: '擒纵机构组制造',
    produces: [{ item: 'std/ramp-controller-general/escapement-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(43, 100) }] }],
    steps: [
      { note_zh: '车擒纵叉与停车爪毛坯', performedBy: 'lathe' },
      { note_zh: '锻锁扣毛坯，淬火 + 300 回火', performedBy: 'plant/forge' },
      { note_zh: '磨咬合面与叉瓦', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 弹簧片 4 片：0.5×8×30，淬火 + 300 回火。 */
    id: 'make/ramp-spring-set',
    name: 'Mechanical Cam-Programmed Temperature Controller Leaf Spring Manufacturing', name_zh: '机械式凸轮程序升温控制器弹簧片制造',
    produces: [{ item: 'std/ramp-controller-general/spring-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(4, 25) }] }],
    performedBy: 'plant/forge',
  },
  {
    id: 'make/ramp-pointer',
    name: 'Mechanical Cam-Programmed Temperature Controller Pointer Manufacturing', name_zh: '机械式凸轮程序升温控制器指针制造',
    produces: [{ item: 'std/ramp-controller-general/pointer', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 20) }] }],
    performedBy: 'lathe',
  },
  {
    id: 'make/ramp-flag',
    name: 'Mechanical Cam-Programmed Temperature Controller Flag Manufacturing', name_zh: '机械式凸轮程序升温控制器旗标制造',
    produces: [{ item: 'std/ramp-controller-general/flag', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 20) }] }],
    performedBy: 'plant/forge',
  },
  {
    /** 重锤吊杆 + 鼓轮：φ30、绳槽深 2，2 kg 走 4 h 或 8 h。 */
    id: 'make/ramp-weight-rod-drum',
    name: 'Mechanical Cam-Programmed Temperature Controller Weight Suspension Rod and Drum Manufacturing', name_zh: '机械式凸轮程序升温控制器重锤吊杆与鼓轮制造',
    produces: [{ item: 'std/ramp-controller-general/weight-rod-drum', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(13, 50) }] }],
    performedBy: 'lathe',
  },
  {
    /**
     * 程序盘：φ200×8 铸铁，8 段各 45°、升程 0–7.2 mm。
     *
     * 盘缘轮廓误差 0.05 mm = 4 K 设定值误差；盘按工艺卡另铣，一只盘一个工艺。
     */
    id: 'make/ramp-cam-disc',
    name: 'Mechanical Cam-Programmed Temperature Controller Program Disc Manufacturing', name_zh: '机械式凸轮程序升温控制器程序盘制造',
    produces: [{ item: 'std/ramp-controller-general/cam-disc', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(181, 100) }] }],
    steps: [
      { note_zh: '立浇 φ200×8 盘坯，浇口开在盘缘、砂压铁压住', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1380, max: 1450 }] },
      { note_zh: '分度头铣 8 段轮廓（每段 45°、升程 0–7.2 mm）', performedBy: 'plant/milling-machine' },
      { note_zh: '磨凸轮工作面 0.01', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 凸轮盘压盖与键：45 钢。 */
    id: 'make/ramp-cam-cover-key',
    name: 'Mechanical Cam-Programmed Temperature Controller Cam Disc Cover and Key Manufacturing', name_zh: '机械式凸轮程序升温控制器凸轮盘压盖与键制造',
    produces: [{ item: 'std/ramp-controller-general/cam-cover-key', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(19, 50) }] }],
    performedBy: 'lathe',
  },
  {
    /** 陶瓷壳：瓷绝缘座、端子板、面板与三片围板、盘护罩、易熔丝套管。 */
    id: 'make/ramp-ceramic-case-set',
    name: 'Mechanical Cam-Programmed Temperature Controller Ceramic Shell Manufacturing', name_zh: '机械式凸轮程序升温控制器陶瓷壳制造',
    produces: [{ item: 'std/ramp-controller-general/ceramic-case-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/refractory', qty: q(453, 100) }] }],
    performedBy: 'plant/earth-kiln',
    under: [{ param: 'temperature', min: 1050, max: 1100 }],
  },
  {
    /** 棒的导向环 2 只：内孔按棒实测外径铰，差 0.05。 */
    id: 'make/ramp-guide-ring',
    name: 'Mechanical Cam-Programmed Temperature Controller Rod Guide Ring Manufacturing', name_zh: '机械式凸轮程序升温控制器棒的导向环制造',
    produces: [{ item: 'std/ramp-controller-general/guide-ring', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/refractory', qty: q(59, 100) }] }],
    performedBy: 'plant/earth-kiln',
    under: [{ param: 'temperature', min: 1050, max: 1100 }],
  },
  {
    /** 感温棒：φ8×400 的莫来石-刚玉棒，1450 烧结 2 h。 */
    id: 'make/ramp-sensor-rod',
    name: 'Mechanical Cam-Programmed Temperature Controller Temperature Sensing Rod Manufacturing', name_zh: '机械式凸轮程序升温控制器感温棒制造',
    produces: [{ item: 'std/ramp-controller-general/sensor-rod', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/refractory', qty: q(22, 25) }] }],
    performedBy: 'plant/brick-kiln',
    under: [{ param: 'temperature', min: 1450, max: 1500 }],
  },
  {
    /** 触点 4 对：主 2 对 + 超温 2 对，φ4 铜片，擦动。 */
    id: 'make/ramp-contact-set',
    name: 'Mechanical Cam-Programmed Temperature Controller Contact Manufacturing', name_zh: '机械式凸轮程序升温控制器触点制造',
    produces: [{ item: 'std/ramp-controller-general/contact-set', qty: q(4) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(4, 25) }] }],
    performedBy: 'plant/robot',
  },
  {
    /** 导片与接线柱 8 只。 */
    id: 'make/ramp-copper-strip-set',
    name: 'Mechanical Cam-Programmed Temperature Controller Guide Plate and Terminal Post Manufacturing', name_zh: '机械式凸轮程序升温控制器导片与接线柱制造',
    produces: [{ item: 'std/ramp-controller-general/copper-strip-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] }],
    performedBy: 'lathe',
  },
  {
    /** 闸刀：易熔丝落下时砸开的那一套，刀片与刀口。 */
    id: 'make/ramp-knife-switch',
    name: 'Mechanical Cam-Programmed Temperature Controller Knife Switch Manufacturing', name_zh: '机械式凸轮程序升温控制器闸刀制造',
    produces: [{ item: 'std/ramp-controller-general/knife-switch', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(31, 50) }] }],
    performedBy: 'lathe',
  },
  {
    /** 刻度盘：外圈 0–1000，1 mm 一格 = 12 K/格，分度头刻、量块复核。 */
    id: 'make/ramp-dial',
    name: 'Mechanical Cam-Programmed Temperature Controller Dial Manufacturing', name_zh: '机械式凸轮程序升温控制器刻度盘制造',
    produces: [{ item: 'std/ramp-controller-general/dial', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 10) }] }],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 石英参考支架：300×40×15 熔融石英板，把壳热 50 K 的假信号压到 5 K。 */
    id: 'make/ramp-quartz-reference',
    name: 'Mechanical Cam-Programmed Temperature Controller Quartz Reference Bracket Manufacturing', name_zh: '机械式凸轮程序升温控制器石英参考支架制造',
    produces: [{ item: 'std/ramp-controller-general/quartz-reference', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/silica', qty: q(8, 25) }] }],
    performedBy: 'plant/brick-kiln',
    under: [{ param: 'temperature', min: 1450, max: 1500 }],
  },
  {
    /** 观察窗 2 块：60×40×4，看指针与跳牌。 */
    id: 'make/ramp-observation-window',
    name: 'Mechanical Cam-Programmed Temperature Controller Viewing Window Manufacturing', name_zh: '机械式凸轮程序升温控制器观察窗制造',
    produces: [{ item: 'std/ramp-controller-general/observation-window', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/silica', qty: q(1, 10) }] }],
    performedBy: 'plant/brick-kiln',
    under: [{ param: 'temperature', min: 1450, max: 1500 }],
  },
  {
    /** 表壳紧固件组：螺栓、卡子、提手。 */
    id: 'make/ramp-case-hardware-set',
    name: 'Mechanical Cam-Programmed Temperature Controller Case Fastener Set Manufacturing', name_zh: '机械式凸轮程序升温控制器表壳紧固件组制造',
    produces: [{ item: 'std/ramp-controller-general/case-hardware-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(3, 5) }] }],
    steps: [
      { note_zh: '车螺栓与卡子', performedBy: 'lathe' },
      { note_zh: '锻提手', performedBy: 'plant/forge' },
    ],
  },
  {
    /** 易熔丝：φ2×0.5 m 铜丝，断点 1084.6，随件交付够用两次。 */
    id: 'make/ramp-fuse-wire',
    name: 'Mechanical Cam-Programmed Temperature Controller Fusible Wire Manufacturing', name_zh: '机械式凸轮程序升温控制器易熔丝制造',
    produces: [{ item: 'std/ramp-controller-general/fuse-wire', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(3, 250) }] }],
    performedBy: 'lathe',
  },
];

export const RAMP_PART_ROUTES: readonly Route[] = RAMP_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...RAMP_PARTS];
export const DATA_ROUTES: readonly Route[] = [...RAMP_PART_ROUTES];
