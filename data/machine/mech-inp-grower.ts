/**
 * InP 晶体炉提拉头与压力控制的零件与零件路线。
 *
 * 本文件只回答两件事：
 *
 *   `plant/inp-crystal-grower/pull-head` 由轴、P5 轴承与 7.5 kW 电机装配
 *   `plant/inp-crystal-grower/pressure-control` 由薄膜规、加料器、泄放阀与阀组装配
 *
 * 提拉头的 45 钢 20 kg 全部给轴；压力控制的不锈钢 5 kg 按加料器 2、泄放阀 2、
 * 阀组 1 分配。分配值是设计值，不是逐件称重。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const INP_GROWER_PARTS: readonly Item[] = [
  { id: 'plant/inp-crystal-grower/pull-head/shaft', name: '高压 LEC 单晶炉提拉头轴', unit: '件', category: 'part' },
  { id: 'plant/inp-crystal-grower/pressure-control/feeder', name: 'B₂O₃ 螺旋加料器', unit: '件', category: 'part' },
  { id: 'plant/inp-crystal-grower/pressure-control/relief-valve', name: '高压 LEC 单晶炉泄放阀 DN10', unit: '件', category: 'part' },
  { id: 'plant/inp-crystal-grower/pressure-control/manifold', name: '高压 LEC 单晶炉阀组', unit: '件', category: 'part' },
  { id: 'plant/inp-crystal-grower/pressure-control/manometer', name: '高压 LEC 单晶炉压力计模块', unit: '件', category: 'part' },
];

const INP_GROWER_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 提拉头轴：45 钢 20 kg，车籽晶夹与软轴，磨轴承位 φ40 h5。 */
    id: 'make/inp-pull-head-shaft',
    name: '高压 LEC 单晶炉提拉头轴制造',
    produces: [{ item: 'plant/inp-crystal-grower/pull-head/shaft', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(20) }] }],
    steps: [
      { note_zh: '车籽晶夹 φ10、软轴 1:50 减速与称重传感器座', performedBy: 'lathe' },
      { note_zh: '磨轴承位 φ40 h5、端跳 ≤0.01 mm', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** B₂O₃ 螺旋加料器：不锈钢 2 kg，1–10 g/min。 */
    id: 'make/inp-pressure-feeder',
    name: 'B₂O₃ 螺旋加料器制造',
    produces: [{ item: 'plant/inp-crystal-grower/pressure-control/feeder', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(2) }] }],
    steps: [
      { note_zh: '车螺旋与料斗', performedBy: 'lathe' },
      { note_zh: '装计量段，标 1–10 g/min', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 泄放阀 DN10：不锈钢 2 kg，1000–5100 kPa。 */
    id: 'make/inp-pressure-relief-valve',
    name: '高压 LEC 单晶炉泄放阀 DN10 制造',
    produces: [{ item: 'plant/inp-crystal-grower/pressure-control/relief-valve', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(2) }] }],
    steps: [
      { note_zh: '车阀体与阀芯', performedBy: 'lathe' },
      { note_zh: '研磨阀座，整定泄放压力', performedBy: 'plant/grinder' },
    ],
  },
  {
    /**
     * 压力计模块：把 `plant/lpcvd-furnace/manometer` 的电容薄膜规拆出来，
     * 加装 LEC 炉的接口与温漂补偿。表头是外购/别处生产的标准件，
     * 这里做的是接口与标定，所以用 uses 记录表头输入。
     */
    id: 'make/inp-pressure-manometer',
    name: '高压 LEC 单晶炉压力计模块制造',
    produces: [{ item: 'plant/inp-crystal-grower/pressure-control/manometer', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'plant/lpcvd-furnace/manometer', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '拆表头，换 LEC 炉接口与密封', performedBy: 'plant/robot' },
      { note_zh: '1000–5100 kPa 标定，±2 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },
  {
    /** 阀组：不锈钢 1 kg，连接加料器、薄膜规与泄放阀。 */
    id: 'make/inp-pressure-manifold',
    name: '高压 LEC 单晶炉阀组制造',
    produces: [{ item: 'plant/inp-crystal-grower/pressure-control/manifold', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] }],
    performedBy: 'plant/milling-machine',
  },
];

export const INP_GROWER_PART_ROUTES: readonly Route[] = INP_GROWER_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...INP_GROWER_PARTS];
export const DATA_ROUTES: readonly Route[] = [...INP_GROWER_PART_ROUTES];
