/**
 * 局放试验室接地开关的零件与零件路线。
 *
 * 本文件只回答一件事：`plant/pd-test-cell/ground-switch` 由哪些零件组成，
 * 每个零件怎么造。
 *
 * 组成件：
 *
 *   铜闸刀 1（30×6×400 mm，0.64 kg）
 *   铜排 1（0.8 m，1.8 kg）
 *   接地编织带 1（0.45 kg）
 *   银触点与端子组 1（铜 1.5 + 银 0.05）
 *   45 钢铰链 1（1.4 kg）
 *   酚醛操作杆 1（0.7 kg）
 *   钢底座与框架 1（4.5 kg）
 *   不锈钢紧固件组 1（2 kg）
 *   氧化铝瓷绝缘子 4（每只 25 kV，串联 100 kV）
 *
 * 原路线只写“铜 6 + 45 钢 2 + 酚醛 1 + 银 0.05 + 不锈钢 2 + 钢板 5”，
 * 没有说明闸刀、铜排、编织带、触点、铰链、操作杆、底座是八个可拆件。
 * 材料按上述件分配；剩余为车屑与边角，不另立条目。分配值是设计值，
 * 不是逐件称重。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const GROUND_SWITCH_PARTS: readonly Item[] = [
  { id: 'plant/pd-test-cell/ground-switch/blade', name: 'PD 铜闸刀', unit: '件', category: 'part' },
  { id: 'plant/pd-test-cell/ground-switch/busbar', name: 'PD 铜排', unit: '件', category: 'part' },
  { id: 'plant/pd-test-cell/ground-switch/braid', name: 'PD 接地编织带', unit: '件', category: 'part' },
  { id: 'plant/pd-test-cell/ground-switch/contact-set', name: 'PD 银触点与端子组', unit: '套', category: 'part' },
  { id: 'plant/pd-test-cell/ground-switch/hinge', name: '45 钢铰链', unit: '件', category: 'part' },
  { id: 'plant/pd-test-cell/ground-switch/operating-rod', name: 'PD 酚醛操作杆', unit: '件', category: 'part' },
  { id: 'plant/pd-test-cell/ground-switch/base-frame', name: 'PD 钢底座与框架', unit: '件', category: 'part' },
  { id: 'plant/pd-test-cell/ground-switch/fastener-set', name: 'PD 不锈钢紧固件组', unit: '套', category: 'part' },
];

const GROUND_SWITCH_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 铜闸刀：30×6×400 mm，0.64 kg，铣刀口与银触点槽。 */
    id: 'make/ground-switch-blade',
    name: 'PD 铜闸刀制造',
    produces: [{ item: 'plant/pd-test-cell/ground-switch/blade', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(16, 25) }] }],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 铜排：0.8 m，1.8 kg，连接闸刀与接地端子。 */
    id: 'make/ground-switch-busbar',
    name: 'PD 铜排制造',
    produces: [{ item: 'plant/pd-test-cell/ground-switch/busbar', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(9, 5) }] }],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 接地编织带：0.45 kg，2 m，软连接。 */
    id: 'make/ground-switch-braid',
    name: 'PD 接地编织带制造',
    produces: [{ item: 'plant/pd-test-cell/ground-switch/braid', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(9, 20) }] }],
    performedBy: 'plant/robot',
  },
  {
    /** 银触点与端子组：铜 1.5 kg + 银 0.05 kg，两对触点。 */
    id: 'make/ground-switch-contact-set',
    name: 'PD 银触点与端子组制造',
    produces: [{ item: 'plant/pd-test-cell/ground-switch/contact-set', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(3, 2) }] },
      { anyOf: [{ item: 'mat/silver', qty: q(1, 20) }] },
    ],
    steps: [
      { note_zh: '车端子与触头座', performedBy: 'lathe' },
      { note_zh: '银触点钎焊到铜触头', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 45 钢铰链：1.4 kg，销 φ12，与操作杆配钻销孔。 */
    id: 'make/ground-switch-hinge',
    name: '45 钢铰链制造',
    produces: [{ item: 'plant/pd-test-cell/ground-switch/hinge', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(7, 5) }] }],
    steps: [
      { note_zh: '车铰链销 φ12 与耳板', performedBy: 'lathe' },
      { note_zh: '与操作杆配钻销孔', performedBy: 'plant/milling-machine' },
    ],
  },
  {
    /** 酚醛操作杆：0.7 kg，φ25/φ15×0.8 m，带手柄与绝缘隔板。 */
    id: 'make/ground-switch-operating-rod',
    name: 'PD 酚醛操作杆制造',
    produces: [{ item: 'plant/pd-test-cell/ground-switch/operating-rod', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/phenolic-resin', qty: q(7, 10) }] }],
    performedBy: 'lathe',
  },
  {
    /** 钢底座与框架：4.5 kg，铣联锁缺口，与门框联锁板配作。 */
    id: 'make/ground-switch-base-frame',
    name: 'PD 钢底座与框架制造',
    produces: [{ item: 'plant/pd-test-cell/ground-switch/base-frame', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(9, 2) }] }],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 不锈钢紧固件组：2 kg，螺栓、弹簧垫、接地端子。 */
    id: 'make/ground-switch-fastener-set',
    name: 'PD 不锈钢紧固件组制造',
    produces: [{ item: 'plant/pd-test-cell/ground-switch/fastener-set', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(2) }] }],
    performedBy: 'lathe',
  },
];

export const GROUND_SWITCH_PART_ROUTES: readonly Route[] = GROUND_SWITCH_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...GROUND_SWITCH_PARTS];
export const DATA_ROUTES: readonly Route[] = [...GROUND_SWITCH_PART_ROUTES];
