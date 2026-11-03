/**
 * 机械式过程控制器的零件与零件路线。
 *
 * 本文件只回答一件事：`std/process-controller-general` 由哪些零件组成，
 * 每个零件怎么造。设计依据、时间比例、摆动与炉衬寿命、kg 账写在
 * `data/machine/unblock-process-controller.ts`。
 *
 * 材料用量按源路线的 kg 账与工序说明分配，未逐件称重；数量取自源路线的明确计数。
 * 归并项在名称与注释中列明组成，不能读作单一规格标准件。源路线只给总重、
 * 未给单件质量的，零件条目不写 `mass`，避免把分配值伪装成实测值。
 *
 * 条目是**机械式过程控制器**，不是计算机 + 数字表 + 模拟开关的电子版：
 *
 *   感温     高铝棒 φ10×600 对熔融石英棒 φ12×300，差动 1.98 mm / 1600 K
 *   设定     M10×0.5 千分螺丝 + 8 段程序盘（30 min/格）
 *   比较     5:1 刀口杠杆 + 铜触点 + 到温跳牌
 *   时间比例 1 kg 重锤 + 擒纵 40 s/转 + 8 齿星轮 + 可移遮板
 *   记录     φ120 烟熏玻璃盘
 *   机身     六块 8 mm 陶板 + 铸铁箍；本层没有薄钢板
 *
 * 零件按功能归并成 30 项；归并项的数量写在名称与注释里。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PROC_CTRL_PARTS: readonly Item[] = [
  { id: 'std/process-controller-general/base', name: 'Mechanical Process Controller Base', name_zh: '机械式过程控制器底座', unit: '件', category: 'part' },
  { id: 'std/process-controller-general/weight', name: 'Mechanical Process Controller Weight', name_zh: '机械式过程控制器重锤', unit: '件', category: 'part' },
  { id: 'std/process-controller-general/cam-disc', name: 'Mechanical Process Controller Program Disc', name_zh: '机械式过程控制器程序盘', unit: '件', category: 'part' },
  { id: 'std/process-controller-general/angle-brace', name: 'Mechanical Process Controller Corner Brace', name_zh: '机械式过程控制器角撑', unit: '件', category: 'part' },
  { id: 'std/process-controller-general/lever-seat', name: 'Mechanical Process Controller Lever Seat', name_zh: '机械式过程控制器杠杆座', unit: '件', category: 'part' },
  { id: 'std/process-controller-general/dial-bracket', name: 'Mechanical Process Controller Dial Bracket', name_zh: '机械式过程控制器表盘支架', unit: '件', category: 'part' },
  { id: 'std/process-controller-general/follower-guide', name: 'Mechanical Process Controller Follower Guide', name_zh: '机械式过程控制器从动件导轨', unit: '件', category: 'part' },
  { id: 'std/process-controller-general/toothed-wheel-set', name: 'Mechanical Process Controller Gear Set', name_zh: '机械式过程控制器齿轮组', unit: '套', category: 'part' },
  { id: 'std/process-controller-general/micrometer-screw', name: 'Mechanical Process Controller Micrometer Screw', name_zh: '机械式过程控制器千分螺丝', unit: '件', category: 'part' },
  { id: 'std/process-controller-general/lever-set', name: 'Mechanical Process Controller Knife-Edge Lever', name_zh: '机械式过程控制器刀口杠杆', unit: '套', category: 'part' },
  { id: 'std/process-controller-general/spring-set', name: 'Mechanical Process Controller Tension Spring', name_zh: '机械式过程控制器拉簧', unit: '套', category: 'part' },
  { id: 'std/process-controller-general/gear-set', name: 'Mechanical Process Controller Gear', name_zh: '机械式过程控制器齿轮', unit: '套', category: 'part' },
  { id: 'std/process-controller-general/escapement-fork', name: 'Mechanical Process Controller Pallet Fork', name_zh: '机械式过程控制器擒纵叉', unit: '件', category: 'part' },
  { id: 'std/process-controller-general/shaft-pin-set', name: 'Mechanical Process Controller Shaft and Pin', name_zh: '机械式过程控制器轴与销', unit: '套', category: 'part' },
  { id: 'std/process-controller-general/dial-pointer', name: 'Mechanical Process Controller Scale Knife Edge and Pointer', name_zh: '机械式过程控制器刻度刀口与指针', unit: '套', category: 'part' },
  { id: 'std/process-controller-general/clamp-key-set', name: 'Mechanical Process Controller Clip and Key', name_zh: '机械式过程控制器卡子与键', unit: '套', category: 'part' },
  { id: 'std/process-controller-general/weight-rod-drum', name: 'Mechanical Process Controller Weight Suspension Rod and Drum', name_zh: '机械式过程控制器重锤吊杆与鼓轮', unit: '套', category: 'part' },
  { id: 'std/process-controller-general/cam-roller', name: 'Mechanical Process Controller Cam Roller', name_zh: '机械式过程控制器凸轮滚子', unit: '件', category: 'part' },
  { id: 'std/process-controller-general/contact-set', name: 'Mechanical Process Controller Contact', name_zh: '机械式过程控制器触点', unit: '套', category: 'part' },
  { id: 'std/process-controller-general/busbar-set', name: 'Mechanical Process Controller Busbar', name_zh: '机械式过程控制器导电排', unit: '套', category: 'part' },
  { id: 'std/process-controller-general/terminal-set', name: 'Mechanical Process Controller Terminal Post', name_zh: '机械式过程控制器接线柱', unit: '套', category: 'part' },
  { id: 'std/process-controller-general/copper-bushing-set', name: 'Mechanical Process Controller Copper Bushing', name_zh: '机械式过程控制器铜轴套', unit: '套', category: 'part' },
  { id: 'std/process-controller-general/ceramic-case-set', name: 'Mechanical Process Controller Ceramic Shell', name_zh: '机械式过程控制器陶壳', unit: '套', category: 'part' },
  { id: 'std/process-controller-general/guide-set', name: 'Mechanical Process Controller Guide Set', name_zh: '机械式过程控制器导向件组', unit: '套', category: 'part' },
  { id: 'std/process-controller-general/sensor-rod', name: 'Mechanical Process Controller Temperature Sensing Rod', name_zh: '机械式过程控制器感温棒', unit: '件', category: 'part' },
  { id: 'std/process-controller-general/quartz-reference-rod', name: 'Mechanical Process Controller Quartz Reference Rod', name_zh: '机械式过程控制器石英参考棒', unit: '件', category: 'part' },
  { id: 'std/process-controller-general/recording-disk', name: 'Mechanical Process Controller Recording Disc', name_zh: '机械式过程控制器记录盘', unit: '件', category: 'part' },
  { id: 'std/process-controller-general/observation-window', name: 'Mechanical Process Controller Viewing Window', name_zh: '机械式过程控制器观察窗', unit: '件', category: 'part' },
  { id: 'std/process-controller-general/arc-chute', name: 'Mechanical Process Controller Arc Chute', name_zh: '机械式过程控制器灭弧栅', unit: '件', category: 'part' },
  { id: 'std/process-controller-general/case-hardware-set', name: 'Mechanical Process Controller Case Fastener Set', name_zh: '机械式过程控制器表壳紧固件组', unit: '套', category: 'part' },
];

const PROC_CTRL_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 底座：180×140×20 铸铁，灌矿渣浆配重。 */
    id: 'make/process-controller-base',
    name: 'Mechanical Process Controller Base Manufacturing', name_zh: '机械式过程控制器底座制造',
    produces: [{ item: 'std/process-controller-general/base', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(9, 2) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1380, max: 1450 }],
  },
  {
    /** 重锤：1.0 kg 设计质量，浇成 φ60×120。 */
    id: 'make/process-controller-weight',
    name: 'Mechanical Process Controller Weight Manufacturing', name_zh: '机械式过程控制器重锤制造',
    produces: [{ item: 'std/process-controller-general/weight', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(5, 4) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1380, max: 1450 }],
  },
  {
    /**
     * 程序盘：φ200×8 铸铁盘坯，8 段轮廓，每段 45°、起伏 0–3 mm。
     *
     * 盘坯立浇，浇口开在盘缘；轮廓铣掉三分之二，出成只有 0.30。
     */
    id: 'make/process-controller-cam-disc',
    name: 'Mechanical Process Controller Program Disc Manufacturing', name_zh: '机械式过程控制器程序盘制造',
    produces: [{ item: 'std/process-controller-general/cam-disc', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(181, 100) }] }],
    steps: [
      { note_zh: '立浇 φ200×8 盘坯（浇口在盘缘、砂压铁压住）', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1380, max: 1450 }] },
      { note_zh: '铣 8 段轮廓（每段 45°、起伏 0–3 mm）', performedBy: 'plant/milling-machine' },
      { note_zh: '磨凸轮工作面 0.01', performedBy: 'plant/grinder' },
    ],
  },
  {
    id: 'make/process-controller-angle-brace',
    name: 'Mechanical Process Controller Corner Brace Manufacturing', name_zh: '机械式过程控制器角撑制造',
    produces: [{ item: 'std/process-controller-general/angle-brace', qty: q(4) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(1, 5) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1380, max: 1450 }],
  },
  {
    id: 'make/process-controller-lever-seat',
    name: 'Mechanical Process Controller Lever Seat Manufacturing', name_zh: '机械式过程控制器杠杆座制造',
    produces: [{ item: 'std/process-controller-general/lever-seat', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(2, 5) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1380, max: 1450 }],
  },
  {
    id: 'make/process-controller-dial-bracket',
    name: 'Mechanical Process Controller Dial Bracket Manufacturing', name_zh: '机械式过程控制器表盘支架制造',
    produces: [{ item: 'std/process-controller-general/dial-bracket', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(11, 25) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1380, max: 1450 }],
  },
  {
    id: 'make/process-controller-follower-guide',
    name: 'Mechanical Process Controller Follower Guide Manufacturing', name_zh: '机械式过程控制器从动件导轨制造',
    produces: [{ item: 'std/process-controller-general/follower-guide', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(11, 20) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1380, max: 1450 }],
  },
  {
    /** 8 齿星轮 + 擒纵轮 15 齿 + 45 齿棘轮，HT300 白口齿面。 */
    id: 'make/process-controller-toothed-wheel-set',
    name: 'Mechanical Process Controller Gear Set Manufacturing', name_zh: '机械式过程控制器齿轮组制造',
    produces: [{ item: 'std/process-controller-general/toothed-wheel-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht300', qty: q(16, 25) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1380, max: 1450 }],
  },
  {
    /** 千分螺丝：M10×0.5、长 120、螺纹段 40；2.0 K/格。 */
    id: 'make/process-controller-micrometer-screw',
    name: 'Mechanical Process Controller Micrometer Screw Manufacturing', name_zh: '机械式过程控制器千分螺丝制造',
    produces: [{ item: 'std/process-controller-general/micrometer-screw', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(3, 25) }] }],
    performedBy: 'lathe',
  },
  {
    /** 刀口杠杆 2 根：80×12×6，5:1，刀口 0.005。 */
    id: 'make/process-controller-lever-set',
    name: 'Mechanical Process Controller Knife-Edge Lever Manufacturing', name_zh: '机械式过程控制器刀口杠杆制造',
    produces: [{ item: 'std/process-controller-general/lever-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(3, 10) }] }],
    steps: [
      { note_zh: '车两根杠杆毛坯（80×12×6，5:1）', performedBy: 'lathe' },
      { note_zh: '磨刀口两面 0.005，不许倒圆', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 拉簧 4 只：φ0.2 钢丝冷绕。 */
    id: 'make/process-controller-spring-set',
    name: 'Mechanical Process Controller Tension Spring Manufacturing', name_zh: '机械式过程控制器拉簧制造',
    produces: [{ item: 'std/process-controller-general/spring-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(4, 25) }] }],
    performedBy: 'plant/winder',
  },
  {
    /** 齿轮 3 对：模数 0.5，20/40、20/60、20/45。 */
    id: 'make/process-controller-gear-set',
    name: 'Mechanical Process Controller Gear Manufacturing', name_zh: '机械式过程控制器齿轮制造',
    produces: [{ item: 'std/process-controller-general/gear-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(18, 25) }] }],
    performedBy: 'plant/milling-machine',
  },
  {
    id: 'make/process-controller-escapement-fork',
    name: 'Mechanical Process Controller Pallet Fork Manufacturing', name_zh: '机械式过程控制器擒纵叉制造',
    produces: [{ item: 'std/process-controller-general/escapement-fork', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(2, 25) }] }],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 轴与销 12 根，φ4–φ8，H7/g6。 */
    id: 'make/process-controller-shaft-pin-set',
    name: 'Mechanical Process Controller Shaft and Pin Manufacturing', name_zh: '机械式过程控制器轴与销制造',
    produces: [{ item: 'std/process-controller-general/shaft-pin-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(7, 20) }] }],
    performedBy: 'lathe',
  },
  {
    /** 刻度刀口与指针：两圈刻线，外圈 0–1600、内圈 0–600。 */
    id: 'make/process-controller-dial-pointer',
    name: 'Mechanical Process Controller Scale Knife Edge and Pointer Manufacturing', name_zh: '机械式过程控制器刻度刀口与指针制造',
    produces: [{ item: 'std/process-controller-general/dial-pointer', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 5) }] }],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 卡子与键：45 钢，固定陶壳、凸轮盘与表盘。 */
    id: 'make/process-controller-clamp-key-set',
    name: 'Mechanical Process Controller Clip and Key Manufacturing', name_zh: '机械式过程控制器卡子与键制造',
    produces: [{ item: 'std/process-controller-general/clamp-key-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(2, 5) }] }],
    performedBy: 'plant/forge',
  },
  {
    /** 重锤吊杆与鼓轮：1 kg 走 4 h。 */
    id: 'make/process-controller-weight-rod-drum',
    name: 'Mechanical Process Controller Weight Suspension Rod and Drum Manufacturing', name_zh: '机械式过程控制器重锤吊杆与鼓轮制造',
    produces: [{ item: 'std/process-controller-general/weight-rod-drum', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 5) }] }],
    performedBy: 'lathe',
  },
  {
    id: 'make/process-controller-cam-roller',
    name: 'Mechanical Process Controller Cam Roller Manufacturing', name_zh: '机械式过程控制器凸轮滚子制造',
    produces: [{ item: 'std/process-controller-general/cam-roller', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(7, 100) }] }],
    performedBy: 'lathe',
  },
  {
    /** 触点 4 对：2 A 一对 + 20 A 一对，各带备用；铜对铜、擦动。 */
    id: 'make/process-controller-contact-set',
    name: 'Mechanical Process Controller Contact Manufacturing', name_zh: '机械式过程控制器触点制造',
    produces: [{ item: 'std/process-controller-general/contact-set', qty: q(4) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(3, 25) }] }],
    performedBy: 'plant/robot',
  },
  {
    /** 导电排 2 条：20 A 那一路的铜排。 */
    id: 'make/process-controller-busbar-set',
    name: 'Mechanical Process Controller Busbar Manufacturing', name_zh: '机械式过程控制器导电排制造',
    produces: [{ item: 'std/process-controller-general/busbar-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] }],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 接线柱 8 只：φ8×20，车成。 */
    id: 'make/process-controller-terminal-set',
    name: 'Mechanical Process Controller Terminal Post Manufacturing', name_zh: '机械式过程控制器接线柱制造',
    produces: [{ item: 'std/process-controller-general/terminal-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(13, 100) }] }],
    performedBy: 'lathe',
  },
  {
    /** 铜轴套 2 只（凸轮盘轴瓦）+ 表盘轴套 1 只。 */
    id: 'make/process-controller-copper-bushing-set',
    name: 'Mechanical Process Controller Copper Bushing Manufacturing', name_zh: '机械式过程控制器铜轴套制造',
    produces: [{ item: 'std/process-controller-general/copper-bushing-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(7, 25) }] }],
    performedBy: 'lathe',
  },
  {
    /**
     * 陶壳：六块 300×250×150 壁 8 的板 + 一块门 + 刻度盘与面板 +
     * 触点座 2 只 + 端子板 1 只。
     *
     * 300 mm 的陶板在 1100 上烧会翘，六块里能用的不到四块，出成 0.6。
     */
    id: 'make/process-controller-ceramic-case-set',
    name: 'Mechanical Process Controller Ceramic Shell Manufacturing', name_zh: '机械式过程控制器陶壳制造',
    produces: [{ item: 'std/process-controller-general/ceramic-case-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/refractory', qty: q(581, 50) }] }],
    performedBy: 'plant/earth-kiln',
    under: [{ param: 'temperature', min: 1050, max: 1100 }],
  },
  {
    /** 导向环 2 只 + 瓷套管 4 只：按棒实测外径铰，差 0.05。 */
    id: 'make/process-controller-guide-set',
    name: 'Mechanical Process Controller Guide Set Manufacturing', name_zh: '机械式过程控制器导向件组制造',
    produces: [{ item: 'std/process-controller-general/guide-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/refractory', qty: q(103, 100) }] }],
    performedBy: 'plant/earth-kiln',
    under: [{ param: 'temperature', min: 1050, max: 1100 }],
  },
  {
    /** 感温棒：φ10×600 莫来石-刚玉棒，1450 烧结 2 h。 */
    id: 'make/process-controller-sensor-rod',
    name: 'Mechanical Process Controller Temperature Sensing Rod Manufacturing', name_zh: '机械式过程控制器感温棒制造',
    produces: [{ item: 'std/process-controller-general/sensor-rod', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/refractory', qty: q(23, 100) }] }],
    performedBy: 'plant/brick-kiln',
    under: [{ param: 'temperature', min: 1450, max: 1500 }],
  },
  {
    /** 石英参考棒：φ12×300 熔融石英，浇成，不拉。 */
    id: 'make/process-controller-quartz-reference-rod',
    name: 'Mechanical Process Controller Quartz Reference Rod Manufacturing', name_zh: '机械式过程控制器石英参考棒制造',
    produces: [{ item: 'std/process-controller-general/quartz-reference-rod', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/silica', qty: q(3, 20) }] }],
    performedBy: 'plant/brick-kiln',
    under: [{ param: 'temperature', min: 1450, max: 1500 }],
  },
  {
    /** 记录盘：φ120×3 玻璃，随程序盘转，烟熏后指针划线。 */
    id: 'make/process-controller-recording-disk',
    name: 'Mechanical Process Controller Recording Disc Manufacturing', name_zh: '机械式过程控制器记录盘制造',
    produces: [{ item: 'std/process-controller-general/recording-disk', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/silica', qty: q(3, 20) }] }],
    performedBy: 'plant/brick-kiln',
    under: [{ param: 'temperature', min: 1450, max: 1500 }],
  },
  {
    /** 观察窗 2 块：40×40×4。 */
    id: 'make/process-controller-observation-window',
    name: 'Mechanical Process Controller Viewing Window Manufacturing', name_zh: '机械式过程控制器观察窗制造',
    produces: [{ item: 'std/process-controller-general/observation-window', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/silica', qty: q(1, 20) }] }],
    performedBy: 'plant/brick-kiln',
    under: [{ param: 'temperature', min: 1450, max: 1500 }],
  },
  {
    /** 灭弧栅 4 片：20×15×3 无定形碳，装在 20 A 触点上方。 */
    id: 'make/process-controller-arc-chute',
    name: 'Mechanical Process Controller Arc Chute Manufacturing', name_zh: '机械式过程控制器灭弧栅制造',
    produces: [{ item: 'std/process-controller-general/arc-chute', qty: q(4) }],
    uses: [{ anyOf: [{ item: 'mat/carbon', qty: q(1, 10) }] }],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 表壳紧固件组：铸铁箍、螺栓、铰链。 */
    id: 'make/process-controller-case-hardware-set',
    name: 'Mechanical Process Controller Case Fastener Set Manufacturing', name_zh: '机械式过程控制器表壳紧固件组制造',
    produces: [{ item: 'std/process-controller-general/case-hardware-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(3, 10) }] }],
    steps: [
      { note_zh: '车螺栓与铰链销', performedBy: 'lathe' },
      { note_zh: '锻铸铁箍卡子', performedBy: 'plant/forge' },
    ],
  },
];

export const PROC_CTRL_PART_ROUTES: readonly Route[] = PROC_CTRL_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PROC_CTRL_PARTS];
export const DATA_ROUTES: readonly Route[] = [...PROC_CTRL_PART_ROUTES];
