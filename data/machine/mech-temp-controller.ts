/**
 * 机械式温控器的零件与零件路线。
 *
 * 本文件只回答一件事：`std/temp-controller-general` 由哪些零件组成，每个零件怎么造。
 * 整机的设计依据、量程、死区、标定与降级写在 `data/material/analog.ts` 与
 * `data/machine/unblock-temp-controller.ts`，这里不重复。
 *
 * 材料用量按源路线的 kg 账与工序说明分配，未逐件称重；数量取自源路线的明确计数。
 * 归并项在名称与注释中列明组成，不能读作单一规格标准件。源路线只给总重、
 * 未给单件质量的，零件条目不写 `mass`，避免把分配值伪装成实测值。
 *
 * 零件数量与材料用量取自 `unblock-temp-controller.ts` 的 kg 账与工序说明：
 *
 *   底座 1、表壳下框 1、角撑 4、杠杆座 1、指针座 1
 *   刀口杠杆 1、千分螺丝 1、轴销组 1（6 根）、双金属元件 1、弹簧片 2
 *   指针 1、刻尺 1、刻度盘 1、微动开关 1、瓷绝缘座 1、导向环 1
 *   端子板 1、低温头瓷套管 2、感温棒 1、陶面板 1、围板 3
 *   石英参考支架 1、观察窗 1、表壳紧固件组 1
 *
 * 轴销组、双金属元件、紧固件组是**按功能归并的组件**，不是同规格标准件：
 * 轴销 6 根的直径不同，双金属片由铜片与钢片夹成，紧固件组含 M6 螺栓螺母 20 套、
 * 卡子与提手。归并只减少条目数量，不改变数量与材料。
 *
 * 零件路线只写该零件的主料与成形工序；整机路线仍保留全部装配、接线与标定工序。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const TEMP_CTRL_PARTS: readonly Item[] = [
  { id: 'std/temp-controller-general/base', name: '双金属式温控器底座', unit: '件', category: 'part' },
  { id: 'std/temp-controller-general/case-frame', name: '双金属式温控器表壳框架', unit: '件', category: 'part' },
  { id: 'std/temp-controller-general/angle-brace', name: '双金属式温控器角撑', unit: '件', category: 'part' },
  { id: 'std/temp-controller-general/lever-seat', name: '双金属式温控器杠杆座', unit: '件', category: 'part' },
  { id: 'std/temp-controller-general/pointer-seat', name: '双金属式温控器指针座', unit: '件', category: 'part' },
  { id: 'std/temp-controller-general/knife-lever', name: '双金属式温控器刀口杠杆', unit: '件', category: 'part' },
  { id: 'std/temp-controller-general/micrometer-screw', name: '双金属式温控器千分螺丝', unit: '件', category: 'part' },
  { id: 'std/temp-controller-general/shaft-pin-set', name: '双金属式温控器轴销组', unit: '套', category: 'part' },
  { id: 'std/temp-controller-general/bimetal-element', name: '双金属式温控器双金属元件', unit: '件', category: 'part' },
  { id: 'std/temp-controller-general/spring-plate', name: '双金属式温控器弹簧片', unit: '件', category: 'part' },
  { id: 'std/temp-controller-general/pointer', name: '双金属式温控器指针', unit: '件', category: 'part' },
  { id: 'std/temp-controller-general/scale-strip', name: '双金属式温控器刻尺', unit: '件', category: 'part' },
  { id: 'std/temp-controller-general/dial', name: '双金属式温控器白釉陶刻度盘', unit: '件', category: 'part' },
  { id: 'std/temp-controller-general/ceramic-insulator', name: '双金属式温控器陶瓷绝缘子', unit: '件', category: 'part' },
  { id: 'std/temp-controller-general/rod-guide-ring', name: '双金属式温控器导杆环', unit: '件', category: 'part' },
  { id: 'std/temp-controller-general/low-temp-sleeve', name: '双金属式温控器低温套管', unit: '件', category: 'part' },
  { id: 'std/temp-controller-general/sensor-rod', name: '双金属式温控器感温棒', unit: '件', category: 'part' },
  { id: 'std/temp-controller-general/ceramic-panel', name: '双金属式温控器陶瓷面板', unit: '件', category: 'part' },
  { id: 'std/temp-controller-general/side-panel', name: '双金属式温控器侧板', unit: '件', category: 'part' },
  { id: 'std/temp-controller-general/quartz-reference', name: '双金属式温控器石英参考支架', unit: '件', category: 'part' },
  { id: 'std/temp-controller-general/observation-window', name: '双金属式温控器观察窗', unit: '件', category: 'part' },
  { id: 'std/temp-controller-general/case-hardware-set', name: '双金属式温控器表壳紧固件组', unit: '套', category: 'part' },
  { id: 'std/temp-controller-general/dial-bushing', name: '双金属式温控器表盘轴套', unit: '件', category: 'part' },

  /**
   * 快跳微动开关。触点间隙 0.3 mm、死区 0.05 mm，铜触点 2 A 干接点。
   *
   * 它是温控器唯一把“位移”变成“通断”的零件，也是整台表里唯一按次数磨损的电气件。
   */
  { id: 'std/microswitch-general', name: '快跳微动开关', unit: '件', category: 'part' },

  /** 四位端子板：瓷板承 220 V 爬电，铜柱接外部导线。 */
  { id: 'std/terminal-board-4p-general', name: '四位端子板', unit: '件', category: 'part' },
];

const TEMP_CTRL_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    id: 'make/temp-controller-base',
    name: '双金属式温控器底座制造',
    produces: [{ item: 'std/temp-controller-general/base', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(191, 80) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1380, max: 1450 }],
  },
  {
    id: 'make/temp-controller-case-frame',
    name: '双金属式温控器表壳框架制造',
    produces: [{ item: 'std/temp-controller-general/case-frame', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(29, 80) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1380, max: 1450 }],
  },
  {
    id: 'make/temp-controller-angle-brace',
    name: '双金属式温控器角撑制造',
    produces: [{ item: 'std/temp-controller-general/angle-brace', qty: q(4) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(1, 4) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1380, max: 1450 }],
  },
  {
    id: 'make/temp-controller-lever-seat',
    name: '双金属式温控器杠杆座制造',
    produces: [{ item: 'std/temp-controller-general/lever-seat', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(1, 2) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1380, max: 1450 }],
  },
  {
    id: 'make/temp-controller-pointer-seat',
    name: '双金属式温控器指针座制造',
    produces: [{ item: 'std/temp-controller-general/pointer-seat', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(3, 10) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1380, max: 1450 }],
  },
  {
    /**
     * 刀口杠杆：60×10×5 的 45 钢，两臂 40 与 10（4:1）。
     *
     * 刀口两面 0.005 mm、不许倒圆；圆了支点变成圆柱，4:1 随载荷变。
     */
    id: 'make/temp-controller-knife-lever',
    name: '双金属式温控器刀口杠杆制造',
    produces: [{ item: 'std/temp-controller-general/knife-lever', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(11, 100) }] }],
    steps: [
      { note_zh: '车杠杆毛坯（两臂 40 与 10，4:1）', performedBy: 'lathe' },
      { note_zh: '磨刀口两面 0.005，不许倒圆', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 千分螺丝：M8×0.5、长 90、螺纹段 30；单点挑扣，5 µm/格。 */
    id: 'make/temp-controller-micrometer-screw',
    name: '双金属式温控器千分螺丝制造',
    produces: [{ item: 'std/temp-controller-general/micrometer-screw', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(7, 100) }] }],
    performedBy: 'lathe',
  },
  {
    /** 轴销组：6 根 φ3–φ6，H7/g6；按杠杆、指针、开关座分别配作。 */
    id: 'make/temp-controller-shaft-pin-set',
    name: '双金属式温控器轴销组制造',
    produces: [{ item: 'std/temp-controller-general/shaft-pin-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(17, 100) }] }],
    performedBy: 'lathe',
  },
  {
    /**
     * 双金属元件：铜片 200×8×0.5 与 45 钢片同尺寸，三只 M3 螺钉夹住。
     *
     * 本层没有轧机，复合带退成两片夹持；夹紧力会松，读数会漂。
     */
    id: 'make/temp-controller-bimetal-element',
    name: '双金属式温控器双金属元件制造',
    produces: [{ item: 'std/temp-controller-general/bimetal-element', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(13, 1000) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 100) }] },
    ],
    performedBy: 'plant/robot',
  },
  {
    /** 弹簧片 2 片：45 钢 0.5×8×30，淬火 + 300 回火。 */
    id: 'make/temp-controller-spring-plate',
    name: '双金属式温控器弹簧片制造',
    produces: [{ item: 'std/temp-controller-general/spring-plate', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(7, 100) }] }],
    performedBy: 'plant/forge',
  },
  {
    id: 'make/temp-controller-pointer',
    name: '双金属式温控器指针制造',
    produces: [{ item: 'std/temp-controller-general/pointer', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(3, 50) }] }],
    performedBy: 'lathe',
  },
  {
    /** 刻尺：100 mm 弧、1 mm 一格；分度头刻，量块复核累积 ≤0.05 mm。 */
    id: 'make/temp-controller-scale-strip',
    name: '双金属式温控器刻尺制造',
    produces: [{ item: 'std/temp-controller-general/scale-strip', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 10) }] }],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 白釉陶刻度盘：外圈 0–900（3 K/格）、内圈 0–300（5 K/格）。 */
    id: 'make/temp-controller-dial',
    name: '双金属式温控器白釉陶刻度盘制造',
    produces: [{ item: 'std/temp-controller-general/dial', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/refractory', qty: q(2, 7) }] }],
    performedBy: 'plant/earth-kiln',
    under: [{ param: 'temperature', min: 1050, max: 1100 }],
  },
  {
    id: 'make/temp-controller-ceramic-insulator',
    name: '双金属式温控器陶瓷绝缘子制造',
    produces: [{ item: 'std/temp-controller-general/ceramic-insulator', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/refractory', qty: q(6, 7) }] }],
    performedBy: 'plant/earth-kiln',
    under: [{ param: 'temperature', min: 1050, max: 1100 }],
  },
  {
    id: 'make/temp-controller-rod-guide-ring',
    name: '双金属式温控器导杆环制造',
    produces: [{ item: 'std/temp-controller-general/rod-guide-ring', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/refractory', qty: q(1, 2) }] }],
    performedBy: 'plant/earth-kiln',
    under: [{ param: 'temperature', min: 1050, max: 1100 }],
  },
  {
    id: 'make/temp-controller-low-temp-sleeve',
    name: '双金属式温控器低温套管制造',
    produces: [{ item: 'std/temp-controller-general/low-temp-sleeve', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/refractory', qty: q(5, 14) }] }],
    performedBy: 'plant/earth-kiln',
    under: [{ param: 'temperature', min: 1050, max: 1100 }],
  },
  {
    /**
     * 感温棒：φ8×400 的莫来石-刚玉棒，1450 烧结 2 h。
     *
     * 它与导向环同一配方；40 K 的温差就有 0.02 mm 过盈，环会把棒箍裂。
     */
    id: 'make/temp-controller-sensor-rod',
    name: '双金属式温控器感温棒制造',
    produces: [{ item: 'std/temp-controller-general/sensor-rod', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/refractory', qty: q(15, 14) }] }],
    performedBy: 'plant/brick-kiln',
    under: [{ param: 'temperature', min: 1450, max: 1500 }],
  },
  {
    id: 'make/temp-controller-ceramic-panel',
    name: '双金属式温控器陶瓷面板制造',
    produces: [{ item: 'std/temp-controller-general/ceramic-panel', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/refractory', qty: q(4, 7) }] }],
    performedBy: 'plant/earth-kiln',
    under: [{ param: 'temperature', min: 1050, max: 1100 }],
  },
  {
    id: 'make/temp-controller-side-panel',
    name: '双金属式温控器侧板制造',
    produces: [{ item: 'std/temp-controller-general/side-panel', qty: q(3) }],
    uses: [{ anyOf: [{ item: 'mat/refractory', qty: q(3, 7) }] }],
    performedBy: 'plant/earth-kiln',
    under: [{ param: 'temperature', min: 1050, max: 1100 }],
  },
  {
    /**
     * 石英参考支架：300×40×15 的熔融石英板。
     *
     * 它把壳热 50 K 的假信号从 0.17 mm（105 K）压到 0.008 mm（5 K）。
     */
    id: 'make/temp-controller-quartz-reference',
    name: '双金属式温控器石英参考支架制造',
    produces: [{ item: 'std/temp-controller-general/quartz-reference', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/silica', qty: q(8, 25) }] }],
    performedBy: 'plant/brick-kiln',
    under: [{ param: 'temperature', min: 1450, max: 1500 }],
  },
  {
    id: 'make/temp-controller-observation-window',
    name: '双金属式温控器观察窗制造',
    produces: [{ item: 'std/temp-controller-general/observation-window', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/silica', qty: q(13, 100) }] }],
    performedBy: 'plant/brick-kiln',
    under: [{ param: 'temperature', min: 1450, max: 1500 }],
  },
  {
    /**
     * 表壳紧固件组：M6×20 螺栓螺母 20 套、卡子、提手。
     *
     * 螺栓单点车螺纹，卡子与提手锻出；本层没有搓丝机。
     */
    id: 'make/temp-controller-case-hardware-set',
    name: '双金属式温控器表壳紧固件组制造',
    produces: [{ item: 'std/temp-controller-general/case-hardware-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(24, 25) }] }],
    steps: [
      { note_zh: '车 M6×20 螺栓螺母 20 套（单点挑扣）', performedBy: 'lathe' },
      { note_zh: '锻卡子与提手', performedBy: 'plant/forge' },
    ],
  },
  {
    id: 'make/temp-controller-dial-bushing',
    name: '双金属式温控器表盘轴套制造',
    produces: [{ item: 'std/temp-controller-general/dial-bushing', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(3, 50) }] }],
    performedBy: 'lathe',
  },
  {
    /**
     * 微动开关：铜触点 2 对、铜簧片、钢弹簧、瓷座。
     *
     * 触点间隙 0.3 mm、死区 0.05 mm；动作/复位之差就是整台表的温度死区。
     */
    id: 'make/microswitch',
    name: '快跳微动开关制造',
    produces: [{ item: 'std/microswitch-general', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(9, 50) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1, 20) }] },
    ],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 四位端子板：瓷板 + 4 只铜接线柱，220 V 上爬电距离 8 mm。
     */
    id: 'make/terminal-board-4p',
    name: '四位端子板制造',
    produces: [{ item: 'std/terminal-board-4p-general', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/refractory', qty: q(3, 7) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(7, 25) }] },
    ],
    steps: [
      { note_zh: '烧瓷板 1050–1100', performedBy: 'plant/earth-kiln', under: [{ param: 'temperature', min: 1050, max: 1100 }] },
      { note_zh: '装 4 只铜接线柱', performedBy: 'plant/robot' },
    ],
  },
];

export const TEMP_CTRL_PART_ROUTES: readonly Route[] = TEMP_CTRL_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...TEMP_CTRL_PARTS];
export const DATA_ROUTES: readonly Route[] = [...TEMP_CTRL_PART_ROUTES];
