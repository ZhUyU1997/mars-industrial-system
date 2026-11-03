/**
 * 椭球拼接五轴台的零件与零件路线。
 *
 * 本文件只回答一件事：`plant/ellipsoid-stitch/stage` 由哪些零件组成，
 * 每个零件怎么造。
 *
 * 组成件：
 *
 *   床身 1（HT250 150 kg，一次浇成 + 自然时效）
 *   X/Y 导轨 2 根（45 钢 6 kg）
 *   X/Y 滑板 2 件（45 钢 4 kg）
 *   X/Y 丝杠 2 根（45 钢 3 kg）
 *   消隙螺母 2 只（45 钢 2 kg）
 *   转轴 2 根（45 钢 3 kg，俯仰/方位各一）
 *   蜗轮 2 只（45 钢 2 kg）
 *   压电倾摆 1（石英堆，`plant/phase-shifter/stack`）
 *   角度读出 1（100 mm 校准尺 1 + 计数芯片 2 + 玻璃刻度 0.1 kg）
 *
 * 原路线只写“铸铁 150 + 45 钢 20 + 铜线 0.5 + 玻璃 0.1 + 校准尺 1
 * + 计数芯片 2”。45 钢 20 kg 按导轨 6、滑板 4、丝杠 3、螺母 2、转轴 3、
 * 蜗轮 2 分配；铜线留在整机路线作接线。分配值是设计值，不是逐件称重。
 *
 * ⚠️ 每轴 2 根导轨 / 2 件滑板 / 2 根丝杠 / 2 只螺母、两根转轴 / 两只蜗轮，
 * 是按 X/Y 两轴与俯仰/方位两轴的结构假设；源注释只给“x/y 导轨台”和“两个转轴座”。
 *
 * ⚠️ 压电倾摆借 `plant/phase-shifter/stack` 当“石英堆”：源注释只写“石英堆，
 * λ/8 一档”，没有给具体型号；这是设计假设，不是源数据。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ELLIPSOID_STAGE_PARTS: readonly Item[] = [
  { id: 'plant/ellipsoid-stitch/stage/bed', name: 'Ellipsoid Stitching Stage Bed', name_zh: '椭球拼接台床身', unit: '件', category: 'part' },
  { id: 'plant/ellipsoid-stitch/stage/guide-rail', name: 'X/Y Guideway', name_zh: 'X/Y 导轨', unit: '件', category: 'part' },
  { id: 'plant/ellipsoid-stitch/stage/slide', name: 'X/Y Slide', name_zh: 'X/Y 滑板', unit: '件', category: 'part' },
  { id: 'plant/ellipsoid-stitch/stage/lead-screw', name: 'X/Y Lead Screw', name_zh: 'X/Y 丝杠', unit: '件', category: 'part' },
  { id: 'plant/ellipsoid-stitch/stage/anti-backlash-nut', name: 'Ellipsoid Stitching Stage Anti-Backlash Nut', name_zh: '椭球拼接台消隙螺母', unit: '件', category: 'part' },
  { id: 'plant/ellipsoid-stitch/stage/rotary-shaft', name: 'Ellipsoid Stitching Stage Rotary Shaft', name_zh: '椭球拼接台转轴', unit: '件', category: 'part' },
  { id: 'plant/ellipsoid-stitch/stage/worm-wheel', name: 'Ellipsoid Stitching Stage Worm Wheel', name_zh: '椭球拼接台蜗轮', unit: '件', category: 'part' },
  { id: 'plant/ellipsoid-stitch/stage/piezo-tilt', name: 'Ellipsoid Stitching Stage Piezo Tilt', name_zh: '椭球拼接台压电倾摆', unit: '件', category: 'part' },
  { id: 'plant/ellipsoid-stitch/stage/readout', name: 'Ellipsoid Stitching Stage Angle Readout', name_zh: '椭球拼接台角度读出', unit: '件', category: 'part' },
];

const ELLIPSOID_STAGE_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 床身：HT250 150 kg，一次浇成，自然时效 8 周。 */
    id: 'make/ellipsoid-stage-bed',
    name: 'Ellipsoid Stitching Stage Bed Manufacturing', name_zh: '椭球拼接台床身制造',
    produces: [{ item: 'plant/ellipsoid-stitch/stage/bed', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(150) }] }],
    steps: [
      { note_zh: '一次浇成床身', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1350, max: 1450 }] },
      { note_zh: '自然时效 8 周，铣安装面', performedBy: 'plant/milling-machine' },
    ],
  },
  {
    /** X/Y 导轨 2 根：45 钢 6 kg，刮研（25 mm² 20 点）。 */
    id: 'make/ellipsoid-stage-guide-rail',
    name: 'X/Y Guideway Manufacturing', name_zh: 'X/Y 导轨制造',
    produces: [{ item: 'plant/ellipsoid-stitch/stage/guide-rail', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(6) }] }],
    steps: [
      { note_zh: '铣两根导轨', performedBy: 'plant/milling-machine' },
      { note_zh: '三块互研刮研，每 25 mm² 20 点', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** X/Y 滑板 2 件：45 钢 4 kg，与导轨配刮。 */
    id: 'make/ellipsoid-stage-slide',
    name: 'X/Y Slide Manufacturing', name_zh: 'X/Y 滑板制造',
    produces: [{ item: 'plant/ellipsoid-stitch/stage/slide', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(4) }] }],
    steps: [
      { note_zh: '铣两件滑板', performedBy: 'plant/milling-machine' },
      { note_zh: '与导轨配刮', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** X/Y 丝杠 2 根：45 钢 3 kg，导程按 350 mm 行程。 */
    id: 'make/ellipsoid-stage-lead-screw',
    name: 'X/Y Lead Screw Manufacturing', name_zh: 'X/Y 丝杠制造',
    produces: [{ item: 'plant/ellipsoid-stitch/stage/lead-screw', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(3) }] }],
    steps: [
      { note_zh: '车两根丝杠', performedBy: 'lathe' },
      { note_zh: '磨螺纹中径', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 消隙螺母 2 只：45 钢 2 kg，与丝杠配作。 */
    id: 'make/ellipsoid-stage-anti-backlash-nut',
    name: 'Ellipsoid Stitching Stage Anti-Backlash Nut Manufacturing', name_zh: '椭球拼接台消隙螺母制造',
    produces: [{ item: 'plant/ellipsoid-stitch/stage/anti-backlash-nut', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(2) }] }],
    steps: [
      { note_zh: '车两半螺母', performedBy: 'lathe' },
      { note_zh: '与丝杠配作', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 转轴 2 根：45 钢 3 kg，俯仰/方位各一。 */
    id: 'make/ellipsoid-stage-rotary-shaft',
    name: 'Ellipsoid Stitching Stage Rotary Shaft Manufacturing', name_zh: '椭球拼接台转轴制造',
    produces: [{ item: 'plant/ellipsoid-stitch/stage/rotary-shaft', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(3) }] }],
    steps: [
      { note_zh: '车两根转轴', performedBy: 'lathe' },
      { note_zh: '磨轴颈', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 蜗轮 2 只：45 钢 2 kg，俯仰/方位各一，空回 ≤2 µrad。 */
    id: 'make/ellipsoid-stage-worm-wheel',
    name: 'Ellipsoid Stitching Stage Worm Wheel Manufacturing', name_zh: '椭球拼接台蜗轮制造',
    produces: [{ item: 'plant/ellipsoid-stitch/stage/worm-wheel', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(2) }] }],
    steps: [
      { note_zh: '滚两只蜗轮', performedBy: 'plant/gear-hobbing' },
      { note_zh: '磨齿面，空回 ≤2 µrad', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 压电倾摆：石英堆 1 只，λ/8 一档。 */
    id: 'make/ellipsoid-stage-piezo-tilt',
    name: 'Ellipsoid Stitching Stage Piezo Tilt Manufacturing', name_zh: '椭球拼接台压电倾摆制造',
    produces: [{ item: 'plant/ellipsoid-stitch/stage/piezo-tilt', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'plant/phase-shifter/stack', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '装石英堆与预压座', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '量 λ/8 位移档', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },
  {
    /** 角度读出：100 mm 校准尺 1 + 计数芯片 2 + 玻璃刻度 0.1 kg。 */
    id: 'make/ellipsoid-stage-readout',
    name: 'Ellipsoid Stitching Stage Angle Readout Manufacturing', name_zh: '椭球拼接台角度读出制造',
    produces: [{ item: 'plant/ellipsoid-stitch/stage/readout', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/calibrated-scale-100', qty: q(1) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
  },
];

export const ELLIPSOID_STAGE_PART_ROUTES: readonly Route[] = ELLIPSOID_STAGE_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ELLIPSOID_STAGE_PARTS];
export const DATA_ROUTES: readonly Route[] = [...ELLIPSOID_STAGE_PART_ROUTES];
