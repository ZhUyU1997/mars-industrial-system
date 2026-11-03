/**
 * 补偿式数字毫伏表的零件与零件路线。
 *
 * 本文件只回答一件事：`std/dvm-general` 由哪些零件组成，每个零件怎么造。
 * 设计依据、补偿法、四位显示与 2.5 位准确度写在 `data/machine/unblock-dvm.ts`。
 *
 * 材料用量按源路线的 kg 账与工序说明分配，未逐件称重；数量取自源路线的明确计数。
 * 归并项在名称与注释中列明组成，不能读作单一规格标准件。源路线只给总重、
 * 未给单件质量的，零件条目不写 `mass`，避免把分配值伪装成实测值。
 *
 * 条目名是“数字电压表”，本层实际路线是**补偿式数字毫伏表**：用铁皮滑线的
 * 长度比平衡被测电压，用千分螺丝与四个字轮把长度读成四位数字。量程只到 16 mV，
 * 不是通用数字电压表；这一处量程限制写在条目注释里。
 *
 * 零件数量：
 *
 *   底座 1、面板框 1、字轮罩 1、检流计罩 1、刻度盘 1
 *   千分螺丝 1、鼓轮 1、字轮 4、变速齿轮 3、四齿星轮 1
 *   铁皮滑线 1、等温铜带 1、陶瓷绝缘柱 6、字轮轴套 4
 *   星形检流计 1、换向开关 1、接线柱 4、热电堆 1、干燥剂袋 1
 *
 * 星形检流计与热电堆是封在一起的功能组件：前者是两支反向磁针 + 600 匝线圈 +
 * 悬丝 + 钢镜，后者是 16 对铜-铁偶 + 32 只陶瓷珠。拆开后不能独立互换，
 * 所以 BOM 停在组件层，不再向下拆。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DVM_PARTS: readonly Item[] = [
  { id: 'std/dvm-general/base', name: 'Compensated Digital Millivoltmeter Base', name_zh: '补偿式数字毫伏表底座', unit: '件', category: 'part' },
  { id: 'std/dvm-general/panel-frame', name: 'Compensated Digital Millivoltmeter Panel Frame', name_zh: '补偿式数字毫伏表面板框', unit: '件', category: 'part' },
  { id: 'std/dvm-general/wheel-cover', name: 'Compensated Digital Millivoltmeter Dial Wheel Cover', name_zh: '补偿式数字毫伏表表轮罩', unit: '件', category: 'part' },
  { id: 'std/dvm-general/galvanometer-cover', name: 'Compensated Digital Millivoltmeter Galvanometer Cover', name_zh: '补偿式数字毫伏表检流计罩', unit: '件', category: 'part' },
  { id: 'std/dvm-general/scale', name: 'Compensated Digital Millivoltmeter Dial', name_zh: '补偿式数字毫伏表刻度盘', unit: '件', category: 'part' },
  { id: 'std/dvm-general/micrometer-screw', name: 'Compensated Digital Millivoltmeter Micrometer Screw', name_zh: '补偿式数字毫伏表千分螺丝', unit: '件', category: 'part' },
  { id: 'std/dvm-general/drum', name: 'Compensated Digital Millivoltmeter Drum', name_zh: '补偿式数字毫伏表鼓轮', unit: '件', category: 'part' },
  { id: 'std/dvm-general/digit-wheel', name: 'Compensated Digital Millivoltmeter Digit Wheel', name_zh: '补偿式数字毫伏表字轮', unit: '件', category: 'part' },
  { id: 'std/dvm-general/gear', name: 'Compensated Digital Millivoltmeter Speed-Change Gear', name_zh: '补偿式数字毫伏表变速齿轮', unit: '件', category: 'part' },
  { id: 'std/dvm-general/star-wheel', name: 'Compensated Digital Millivoltmeter Four-Tooth Star Wheel', name_zh: '补偿式数字毫伏表四齿星轮', unit: '件', category: 'part' },
  { id: 'std/dvm-general/slide-wire', name: 'Compensated Digital Millivoltmeter Sheet-Metal Slide Wire', name_zh: '补偿式数字毫伏表铁皮滑线', unit: '件', category: 'part' },
  { id: 'std/dvm-general/equalizing-bar', name: 'Compensated Digital Millivoltmeter Isothermal Copper Strip', name_zh: '补偿式数字毫伏表等温铜带', unit: '件', category: 'part' },
  { id: 'std/dvm-general/ceramic-insulator', name: 'Compensated Digital Millivoltmeter Ceramic Insulator Post', name_zh: '补偿式数字毫伏表陶瓷绝缘柱', unit: '件', category: 'part' },
  { id: 'std/dvm-general/wheel-bushing', name: 'Compensated Digital Millivoltmeter Digit Wheel Bushing', name_zh: '补偿式数字毫伏表字轮轴套', unit: '件', category: 'part' },
  { id: 'std/dvm-general/astatic-galvanometer', name: 'Compensated Digital Millivoltmeter Star-Shaped Galvanometer', name_zh: '补偿式数字毫伏表星形检流计', unit: '件', category: 'part' },
  { id: 'std/dvm-general/changeover-switch', name: 'Compensated Digital Millivoltmeter Changeover Switch', name_zh: '补偿式数字毫伏表换向开关', unit: '件', category: 'part' },
  { id: 'std/dvm-general/terminal', name: 'Compensated Digital Millivoltmeter Terminal', name_zh: '补偿式数字毫伏表接线柱', unit: '件', category: 'part' },
  { id: 'std/dvm-general/thermopile', name: 'Compensated Digital Millivoltmeter Thermopile', name_zh: '补偿式数字毫伏表热电堆', unit: '件', category: 'part' },
  { id: 'std/dvm-general/drying-agent', name: 'Compensated Digital Millivoltmeter Desiccant Bag', name_zh: '补偿式数字毫伏表干燥剂袋', unit: '件', category: 'part' },
];

const DVM_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 底座：φ260×20 厚铸铁，整台表的热锚。 */
    id: 'make/dvm-base',
    name: 'Compensated Digital Millivoltmeter Base Manufacturing', name_zh: '补偿式数字毫伏表底座制造',
    produces: [{ item: 'std/dvm-general/base', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(7, 5) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1350, max: 1450 }],
  },
  {
    /** 面板框：280×200 铸铁。 */
    id: 'make/dvm-panel-frame',
    name: 'Compensated Digital Millivoltmeter Panel Frame Manufacturing', name_zh: '补偿式数字毫伏表面板框制造',
    produces: [{ item: 'std/dvm-general/panel-frame', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(7, 20) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1350, max: 1450 }],
  },
  {
    id: 'make/dvm-wheel-cover',
    name: 'Compensated Digital Millivoltmeter Dial Wheel Cover Manufacturing', name_zh: '补偿式数字毫伏表表轮罩制造',
    produces: [{ item: 'std/dvm-general/wheel-cover', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(1, 5) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1350, max: 1450 }],
  },
  {
    id: 'make/dvm-galvanometer-cover',
    name: 'Compensated Digital Millivoltmeter Galvanometer Cover Manufacturing', name_zh: '补偿式数字毫伏表检流计罩制造',
    produces: [{ item: 'std/dvm-general/galvanometer-cover', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(1, 10) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1350, max: 1450 }],
  },
  {
    /** 刻度盘：100 mm 弧、100 条线，与滑线长度比对应。 */
    id: 'make/dvm-scale',
    name: 'Compensated Digital Millivoltmeter Dial Manufacturing', name_zh: '补偿式数字毫伏表刻度盘制造',
    produces: [{ item: 'std/dvm-general/scale', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 20) }] }],
    performedBy: 'plant/milling-machine',
  },
  {
    /**
     * 千分螺丝：M10×0.5、长 260，两头顶尖孔。
     *
     * 螺距是全表换算的根；没有螺纹磨床，靠同一次车两根、挑互配的那一根。
     */
    id: 'make/dvm-micrometer-screw',
    name: 'Compensated Digital Millivoltmeter Micrometer Screw Manufacturing', name_zh: '补偿式数字毫伏表千分螺丝制造',
    produces: [{ item: 'std/dvm-general/micrometer-screw', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(3, 25) }] }],
    performedBy: 'lathe',
  },
  {
    /** 鼓轮：φ40、200 格，0.0025 mm/格。 */
    id: 'make/dvm-drum',
    name: 'Compensated Digital Millivoltmeter Drum Manufacturing', name_zh: '补偿式数字毫伏表鼓轮制造',
    produces: [{ item: 'std/dvm-general/drum', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 50) }] }],
    performedBy: 'lathe',
  },
  {
    /** 字轮：4 只，每只 10 面，面上刻 0–9。 */
    id: 'make/dvm-digit-wheel',
    name: 'Compensated Digital Millivoltmeter Digit Wheel Manufacturing', name_zh: '补偿式数字毫伏表字轮制造',
    produces: [{ item: 'std/dvm-general/digit-wheel', qty: q(4) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(3, 25) }] }],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 变速齿轮 3 只：模数 0.5，15:4 那一组，同一把刀同一次装夹铣完。 */
    id: 'make/dvm-gear',
    name: 'Compensated Digital Millivoltmeter Speed-Change Gear Manufacturing', name_zh: '补偿式数字毫伏表变速齿轮制造',
    produces: [{ item: 'std/dvm-general/gear', qty: q(3) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(2, 25) }] }],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 四齿星轮：字轮进位用。 */
    id: 'make/dvm-star-wheel',
    name: 'Compensated Digital Millivoltmeter Four-Tooth Star Wheel Manufacturing', name_zh: '补偿式数字毫伏表四齿星轮制造',
    produces: [{ item: 'std/dvm-general/star-wheel', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 100) }] }],
    performedBy: 'plant/milling-machine',
  },
  {
    /**
     * 铁皮滑线：0.01×1×2000 的锻铁带，张紧 1 N，有效段 190 mm。
     *
     * 0.20 kg 铁从 6 mm 三火锻到 0.01 mm；氧化皮与剪边吃掉九成。
     */
    id: 'make/dvm-slide-wire',
    name: 'Compensated Digital Millivoltmeter Sheet-Metal Slide Wire Manufacturing', name_zh: '补偿式数字毫伏表铁皮滑线制造',
    produces: [{ item: 'std/dvm-general/slide-wire', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron', qty: q(1, 5) }] }],
    steps: [
      { note_zh: '锻铁皮 0.01×1×2000（三火，每火退火并磨掉氧化皮）', performedBy: 'plant/forge' },
      { note_zh: '磨两面 Ra 0.4', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 等温铜带：6 mm 厚，垫在滑线下，把两端与中段的温差压到 0.1 K。 */
    id: 'make/dvm-equalizing-bar',
    name: 'Compensated Digital Millivoltmeter Isothermal Copper Strip Manufacturing', name_zh: '补偿式数字毫伏表等温铜带制造',
    produces: [{ item: 'std/dvm-general/equalizing-bar', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(1, 20) }] }],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 陶瓷绝缘柱 6 只：φ10×40，900–1000 烧，端子与开关座。 */
    id: 'make/dvm-ceramic-insulator',
    name: 'Compensated Digital Millivoltmeter Ceramic Insulator Post Manufacturing', name_zh: '补偿式数字毫伏表陶瓷绝缘柱制造',
    produces: [{ item: 'std/dvm-general/ceramic-insulator', qty: q(6) }],
    uses: [{ anyOf: [{ item: 'mat/refractory', qty: q(2, 5) }] }],
    performedBy: 'plant/earth-kiln',
    under: [{ param: 'temperature', min: 900, max: 1000 }],
  },
  {
    /** 字轮轴套 4 只：陶瓷，900–1000 烧。 */
    id: 'make/dvm-wheel-bushing',
    name: 'Compensated Digital Millivoltmeter Digit Wheel Bushing Manufacturing', name_zh: '补偿式数字毫伏表字轮轴套制造',
    produces: [{ item: 'std/dvm-general/wheel-bushing', qty: q(4) }],
    uses: [{ anyOf: [{ item: 'mat/refractory', qty: q(1, 20) }] }],
    performedBy: 'plant/earth-kiln',
    under: [{ param: 'temperature', min: 900, max: 1000 }],
  },
  {
    /**
     * 星形检流计：两支 0.3×20 淬火钢针反向装在同一根悬丝上，
     * 上针带 φ8 钢镜与碳旗，下针做配重；600 匝线圈固定。
     *
     * 星形把地磁 20 A/m 抵消到 0.2 A/m，灵敏度因此高 100 倍。
     */
    id: 'make/dvm-astatic-galvanometer',
    name: 'Compensated Digital Millivoltmeter Star-Shaped Galvanometer Manufacturing', name_zh: '补偿式数字毫伏表星形检流计制造',
    produces: [{ item: 'std/dvm-general/astatic-galvanometer', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 4) }] },
      { anyOf: [{ item: 'mat/glass-covered-wire', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1, 50) }] },
    ],
    steps: [
      { note_zh: '淬火磁针 2 支（0.3×20，830–870 水淬、不回火）', performedBy: 'plant/earth-kiln', under: [{ param: 'temperature', min: 830, max: 870 }] },
      { note_zh: '绕 600 匝线圈（φ1.0、内径 φ30、长 30）', performedBy: 'plant/winder' },
      { note_zh: '装双针、悬丝、钢镜与碳旗，磁化并调残余场到 1%', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 换向开关：双刀双掷铜刀 4 片 + 陶瓷座；正反向各测一次抵消热电势。 */
    id: 'make/dvm-changeover-switch',
    name: 'Compensated Digital Millivoltmeter Changeover Switch Manufacturing', name_zh: '补偿式数字毫伏表换向开关制造',
    produces: [{ item: 'std/dvm-general/changeover-switch', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1, 25) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1, 50) }] },
    ],
    steps: [
      { note_zh: '烧陶瓷开关座 900–1000', performedBy: 'plant/earth-kiln', under: [{ param: 'temperature', min: 900, max: 1000 }] },
      { note_zh: '装 4 片铜刀与接线', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 接线柱 4 只：被测一对、基准一对。 */
    id: 'make/dvm-terminal',
    name: 'Compensated Digital Millivoltmeter Terminal Manufacturing', name_zh: '补偿式数字毫伏表接线柱制造',
    produces: [{ item: 'std/dvm-general/terminal', qty: q(4) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(1, 25) }] }],
    performedBy: 'lathe',
  },
  {
    /**
     * 热电堆：16 对铜-铁偶串联，冷端冰点、热端沸水，15.8 mV ±0.2%。
     *
     * 每对 0.986 mV；腿短粗 0.05 Ω/对，32 只陶瓷珠串绝缘。
     */
    id: 'make/dvm-thermopile',
    name: 'Compensated Digital Millivoltmeter Thermopile Manufacturing', name_zh: '补偿式数字毫伏表热电堆制造',
    produces: [{ item: 'std/dvm-general/thermopile', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1, 50) }] },
    ],
    steps: [
      { note_zh: '剪 16 条铜腿与 16 条铁腿，短粗 0.05 Ω/对', performedBy: 'plant/robot' },
      { note_zh: '32 只陶瓷珠串绝缘，焊 16 个热端', performedBy: 'plant/robot' },
      { note_zh: '冷端装冰点瓶铜夹，热端装沸水浴铜管', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 干燥剂袋：石英砂烘到 300，装铜网袋，守 10¹² Ω 绝缘。 */
    id: 'make/dvm-drying-agent',
    name: 'Compensated Digital Millivoltmeter Desiccant Bag Manufacturing', name_zh: '补偿式数字毫伏表干燥剂袋制造',
    produces: [{ item: 'std/dvm-general/drying-agent', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 50) }] }],
    performedBy: 'plant/wet-bench',
    under: [{ param: 'temperature', min: 20, max: 40 }],
  },
];

export const DVM_PART_ROUTES: readonly Route[] = DVM_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...DVM_PARTS];
export const DATA_ROUTES: readonly Route[] = [...DVM_PART_ROUTES];
