/**
 * 砂轮主轴径向跳动的测量 —— 比车床那条更严一档。
 *
 * 磨削是把砂轮的跳动直接复印到工件上（每转一圈刻一遍），所以这个数判的是
 * “磨出来的面有多光”，不是“机床能不能转”。P4 轴承预紧后设计值 1–4 µm，
 * 实测窗口 1–3 µm。
 *
 * 测法与车床那条同一套（比较仪 + 量块，盘车 8 点），差别两处：
 *   ① 主轴不带砂轮测（砂轮本身的不平衡是另一件事，本层没有动平衡机）；
 *   ② 转速要跑到工作转速的 1/3 再停 —— 轴承的预紧在低速与工作转速下不一样。
 *
 * 已知缺口：
 *   · **砂轮不平衡量判不了**：没有动平衡机，只能空转听声音；
 *   · **热变形判不了**：磨削热让主轴伸长，本层没有位移传感器，只有比较仪，
 *     而比较仪不能装在运转中的主轴上。
 */

import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const GRINDER_SPINDLE_MEASURE_ROUTES: readonly Route[] = [
  {
    /** 主轴径向跳动测量：比较仪 + 量块，盘车 8 点 × 3 圈。 */
    id: 'measure/grinder-spindle-runout',
    name: '主轴径向跳动测量',
    produces: [
      {
        item: 'plant/grinder/spindle',
        qty: q(1),
        gives: [{ param: 'runout', kind: 'range', min: 1, max: 3 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/grinder/spindle', qty: q(1) }] },
      { anyOf: [{ item: 'std/gauge-block-working', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '装 P4 轴承、预紧，空转到工作转速 1/3 再停（预紧状态定下来）', performedBy: 'plant/grinder' },
      { note_zh: '架杠杆式比较仪（0.1 µm），量块对零，盘车 8 点 × 3 圈', performedBy: 'plant/comparator' },
      { note_zh: '读数极差的一半 = 径向跳动', performedBy: 'plant/robot' },
    ],
  },
];

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...GRINDER_SPINDLE_MEASURE_ROUTES];
