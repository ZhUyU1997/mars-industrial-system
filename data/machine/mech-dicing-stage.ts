/**
 * 划片机 X-Y 工作台的零件与零件路线。
 *
 * 本文件只回答一件事：`plant/dicing-saw/stage` 由哪些零件组成，
 * 每个零件怎么造。
 *
 * 组成件：
 *
 *   工作台面 1 只（45 钢，导轨面 Ra ≤0.4 µm、直线度 ≤5 µm/100 mm）
 *   丝杠 2 根（45 钢，X/Y 各一）
 *   消隙螺母 2 只（45 钢）
 *   P0 轴承 4 套
 *
 * 原路线把 45 钢 10 kg、轴承 4 套、千分尺 1 把都写在 `uses` 里。千分尺是
 * 装配时量定位的**工具**，不是工作台零件，已移到 `needs`；45 钢按台面 6、
 * 丝杠 2、螺母 2 分配。分配值是设计值，不是逐件称重。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DICING_STAGE_PARTS: readonly Item[] = [
  { id: 'plant/dicing-saw/stage/table', name: '划片机工作台面', unit: '件', category: 'part' },
  { id: 'plant/dicing-saw/stage/lead-screw', name: '划片机丝杠', unit: '件', category: 'part' },
  { id: 'plant/dicing-saw/stage/anti-backlash-nut', name: '划片机消隙螺母', unit: '件', category: 'part' },
];

const DICING_STAGE_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 工作台面：45 钢 6 kg，铣/磨导轨面。 */
    id: 'make/dicing-stage-table',
    name: '划片机工作台面制造',
    produces: [{ item: 'plant/dicing-saw/stage/table', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(6) }] }],
    steps: [
      { note_zh: '铣台面与导轨安装面', performedBy: 'plant/milling-machine' },
      { note_zh: '磨导轨面 Ra ≤0.4 µm、直线度 ≤5 µm/100 mm', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 丝杠 2 根：45 钢 2 kg，X/Y 各一根。 */
    id: 'make/dicing-stage-lead-screw',
    name: '划片机丝杠制造',
    produces: [{ item: 'plant/dicing-saw/stage/lead-screw', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(2) }] }],
    steps: [
      { note_zh: '车丝杠 2 根', performedBy: 'lathe' },
      { note_zh: '磨螺纹中径', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 消隙螺母 2 只：45 钢 2 kg，与丝杠配作。 */
    id: 'make/dicing-stage-anti-backlash-nut',
    name: '划片机消隙螺母制造',
    produces: [{ item: 'plant/dicing-saw/stage/anti-backlash-nut', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(2) }] }],
    steps: [
      { note_zh: '车两半螺母', performedBy: 'lathe' },
      { note_zh: '与丝杠配作，回差按定位要求', performedBy: 'plant/grinder' },
    ],
  },
];

export const DICING_STAGE_PART_ROUTES: readonly Route[] = DICING_STAGE_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...DICING_STAGE_PARTS];
export const DATA_ROUTES: readonly Route[] = [...DICING_STAGE_PART_ROUTES];
