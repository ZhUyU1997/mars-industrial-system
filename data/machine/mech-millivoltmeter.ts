/**
 * 可动磁体式毫伏表的零件与零件路线。
 *
 * 本文件只回答一件事：`std/millivoltmeter-general` 由哪些零件组成，每个零件怎么造。
 * 设计依据、灵敏度算式、标定链与降级写在 `data/machine/unblock-millivoltmeter.ts`。
 *
 * 材料用量按源路线的 kg 账与工序说明分配，未逐件称重；数量取自源路线的明确计数。
 * 归并项在名称与注释中列明组成，不能读作单一规格标准件。源路线只给总重、
 * 未给单件质量的，零件条目不写 `mass`，避免把分配值伪装成实测值。
 *
 * 条目注释原写“动圈式”，而本层实际路线是**可动磁体式**：固定线圈、磁体动、
 * 双线悬丝代替游丝。这里按实际路线列 BOM，并在条目注释中改正名称；
 * `std/millivoltmeter-general` 这个 id 是承重的，不因名称与原理不符而改。
 *
 * 零件数量：
 *
 *   表壳 1、底座 1、刻度盘 1、磁体 2、磁体箍 1、固定线圈 1、线圈骨架 1
 *   磁屏蔽筒 1、悬丝 2、碳旗指针 1、配重 1、接线柱 2、调零螺钉 1、防尘毡 1
 *
 * 磁体 2 块并成一只可动件（30×20×6 两块，磁矩 1.09 A·m²），所以 BOM 写 2 块，
 * 不是把两只磁体当两个可动件。悬丝 2 根也是成对使用，不互为备件。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const MVM_PARTS: readonly Item[] = [
  { id: 'std/millivoltmeter-general/case', name: '可动磁体式毫伏表表壳', unit: '件', category: 'part' },
  { id: 'std/millivoltmeter-general/base', name: '可动磁体式毫伏表底座', unit: '件', category: 'part' },
  { id: 'std/millivoltmeter-general/scale', name: '可动磁体式毫伏表刻度盘', unit: '件', category: 'part' },
  { id: 'std/millivoltmeter-general/magnet', name: '可动磁体式毫伏表钙铁氧体磁体', unit: '件', category: 'part' },
  { id: 'std/millivoltmeter-general/magnet-clamp', name: '可动磁体式毫伏表磁体箍', unit: '件', category: 'part' },
  { id: 'std/millivoltmeter-general/fixed-coil', name: '可动磁体式毫伏表固定线圈', unit: '件', category: 'part' },
  { id: 'std/millivoltmeter-general/coil-skeleton', name: '可动磁体式毫伏表线圈骨架', unit: '件', category: 'part' },
  { id: 'std/millivoltmeter-general/magnetic-shield', name: '可动磁体式毫伏表磁屏蔽筒', unit: '件', category: 'part' },
  { id: 'std/millivoltmeter-general/suspension', name: '可动磁体式毫伏表悬丝', unit: '件', category: 'part' },
  { id: 'std/millivoltmeter-general/pointer', name: '可动磁体式毫伏表碳旗指针', unit: '件', category: 'part' },
  { id: 'std/millivoltmeter-general/counterweight', name: '可动磁体式毫伏表配重', unit: '件', category: 'part' },
  { id: 'std/millivoltmeter-general/terminal', name: '可动磁体式毫伏表接线柱', unit: '件', category: 'part' },
  { id: 'std/millivoltmeter-general/zero-adjust-screw', name: '可动磁体式毫伏表调零螺钉', unit: '件', category: 'part' },
  { id: 'std/millivoltmeter-general/dust-felt', name: '可动磁体式毫伏表防尘毡', unit: '件', category: 'part' },
];

const MVM_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 表壳：φ120×60、壁 6，前后两开口；铸铁浇成。 */
    id: 'make/millivoltmeter-case',
    name: '可动磁体式毫伏表表壳制造',
    produces: [{ item: 'std/millivoltmeter-general/case', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(6, 5) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1350, max: 1450 }],
  },
  {
    /** 底座：130×90×12，铸铁。 */
    id: 'make/millivoltmeter-base',
    name: '可动磁体式毫伏表底座制造',
    produces: [{ item: 'std/millivoltmeter-general/base', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(1, 5) }] }],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1350, max: 1450 }],
  },
  {
    /** 刻度盘：φ95×3 铸铁，100 条线沿 60° 弧径向刻，线距按 sin 修正。 */
    id: 'make/millivoltmeter-scale',
    name: '可动磁体式毫伏表刻度盘制造',
    produces: [{ item: 'std/millivoltmeter-general/scale', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht200', qty: q(1, 5) }] }],
    steps: [
      { note_zh: '浇铸铁盘并车端面', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1350, max: 1450 }] },
      { note_zh: '铣 100 条线，线距按 sin 修正', performedBy: 'plant/milling-machine' },
    ],
  },
  {
    /**
     * 钙铁氧体磁体：CaO·6Fe₂O₃，30×20×6，两块。
     *
     * 铁在 800–900 氧化成 Fe₂O₃，加石灰与高岭土，球磨、预烧、压型、
     * 1300–1350 烧结、磨面、充磁。Br 0.38 T，Hc 150 kA/m。
     */
    id: 'make/millivoltmeter-magnet',
    name: '可动磁体式毫伏表钙铁氧体磁体制造',
    produces: [{ item: 'std/millivoltmeter-general/magnet', qty: q(2) }],
    uses: [
      { anyOf: [{ item: 'mat/iron', qty: q(33, 1000) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(3, 1000) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(3, 2) }] },
    ],
    steps: [
      { note_zh: '铁屑氧化成 Fe₂O₃（800–900，增重 43%）', performedBy: 'plant/earth-kiln', under: [{ param: 'temperature', min: 800, max: 900 }] },
      { note_zh: '配石灰与高岭土，湿磨 12 h 到 1 µm', performedBy: 'plant/ore-beneficiary' },
      { note_zh: '预烧 900–1000，再磨', performedBy: 'plant/earth-kiln', under: [{ param: 'temperature', min: 900, max: 1000 }] },
      { note_zh: '压型 2 MPa，1300–1350 烧结 1 h', performedBy: 'plant/brick-kiln', under: [{ param: 'temperature', min: 1300, max: 1350 }] },
      { note_zh: '磨 30×20×6，两面平行 0.05', performedBy: 'plant/grinder' },
      { note_zh: '充磁：500 匝、20 A、0.5 s，反向一次', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 磁体箍：45 钢，3 g，箍住两块磁体。 */
    id: 'make/millivoltmeter-magnet-clamp',
    name: '可动磁体式毫伏表磁体箍制造',
    produces: [{ item: 'std/millivoltmeter-general/magnet-clamp', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(3, 1000) }] }],
    performedBy: 'lathe',
  },
  {
    /** 固定线圈：200 匝 φ1.0 铜线，展开 19 m，0.42 Ω。 */
    id: 'make/millivoltmeter-fixed-coil',
    name: '可动磁体式毫伏表固定线圈制造',
    produces: [{ item: 'std/millivoltmeter-general/fixed-coil', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper-wire', qty: q(13, 100) }] },
      { anyOf: [{ item: 'mat/glass-covered-wire', qty: q(1, 100) }] },
    ],
    performedBy: 'plant/winder',
  },
  {
    /** 线圈骨架：45 钢开口杯 φ35×25，开 4 条缝切断涡流。 */
    id: 'make/millivoltmeter-coil-skeleton',
    name: '可动磁体式毫伏表线圈骨架制造',
    produces: [{ item: 'std/millivoltmeter-general/coil-skeleton', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(3, 50) }] }],
    performedBy: 'lathe',
  },
  {
    /** 磁屏蔽筒：φ100×0.8×50 软铁筒，屏蔽系数约 5。 */
    id: 'make/millivoltmeter-magnetic-shield',
    name: '可动磁体式毫伏表磁屏蔽筒制造',
    produces: [{ item: 'std/millivoltmeter-general/magnetic-shield', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron', qty: q(1, 4) }] }],
    performedBy: 'plant/sheet-shop',
  },
  {
    /**
     * 悬丝：两根 50 mm 玻璃纱，跨距 3 mm。
     *
     * 纱从玻包线上剥，只受拉；回零刚度 k = W·d²/(4L)，不靠纱的扭转。
     */
    id: 'make/millivoltmeter-suspension',
    name: '可动磁体式毫伏表悬丝制造',
    produces: [{ item: 'std/millivoltmeter-general/suspension', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/glass-covered-wire', qty: q(1, 1000) }] }],
    performedBy: 'plant/robot',
  },
  {
    /** 碳旗指针：3×8×0.3 碳片 + 玻璃纱杆。 */
    id: 'make/millivoltmeter-pointer',
    name: '可动磁体式毫伏表碳旗指针制造',
    produces: [{ item: 'std/millivoltmeter-general/pointer', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/carbon', qty: q(3, 1000) }] },
      { anyOf: [{ item: 'mat/glass-covered-wire', qty: q(1, 1000) }] },
    ],
    performedBy: 'plant/robot',
  },
  {
    /** 配重：5 g 铜屑压铆，把可动件拉到竖直中轴。 */
    id: 'make/millivoltmeter-counterweight',
    name: '可动磁体式毫伏表配重制造',
    produces: [{ item: 'std/millivoltmeter-general/counterweight', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(1, 200) }] }],
    performedBy: 'lathe',
  },
  {
    /** 接线柱 2 只：铜车成，接被测电压。 */
    id: 'make/millivoltmeter-terminal',
    name: '可动磁体式毫伏表接线柱制造',
    produces: [{ item: 'std/millivoltmeter-general/terminal', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(9, 200) }] }],
    performedBy: 'lathe',
  },
  {
    /** 调零螺钉：45 钢，带偏心轮，吃掉磁体对铁壳的固定偏转。 */
    id: 'make/millivoltmeter-zero-adjust-screw',
    name: '可动磁体式毫伏表调零螺钉制造',
    produces: [{ item: 'std/millivoltmeter-general/zero-adjust-screw', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 100) }] }],
    performedBy: 'lathe',
  },
  {
    /** 防尘毡：矿棉，垫在线圈骨架两端与呼吸孔。 */
    id: 'make/millivoltmeter-dust-felt',
    name: '可动磁体式毫伏表防尘毡制造',
    produces: [{ item: 'std/millivoltmeter-general/dust-felt', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/mineral-wool', qty: q(1, 200) }] }],
    performedBy: 'plant/robot',
  },
];

export const MVM_PART_ROUTES: readonly Route[] = MVM_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...MVM_PARTS];
export const DATA_ROUTES: readonly Route[] = [...MVM_PART_ROUTES];
