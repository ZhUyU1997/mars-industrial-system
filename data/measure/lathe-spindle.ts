/**
 * 车床主轴径向跳动的测量 —— 本层第一个“母机精度参数”被写成可判的形式。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 怎么测
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   1. 主轴装上 P4 轴承、预紧，整台车床通电空转 30 min（热平衡）；
 *   2. 量块组当基准：在主轴端面 50 mm 处架一只比较仪（杠杆式，0.1 µm 分度）；
 *   3. 手动盘车，每 45° 记一点，8 点一圈；重复 3 圈；
 *   4. 读数极差的一半 = 径向跳动。
 *
 * 本层没有圆度仪，但有比较仪 + 量块：**比较仪只量"差"，量块提供那个"差"的
 * 绝对值** —— 这正是量块在种子清单里的用处。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 判据与缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   · 比较仪分度 0.1 µm、重复性 0.05 µm ⇒ 8 点极差的 A 类不确定度约 ±0.1 µm；
 *   · 主轴热漂 0.2–0.5 µm/10 min（前 30 min 内）⇒ 要等热平衡再测，否则读的是漂移；
 *   · **只能测径向，端面跳动要另一只表架**（本层只有一个磁性表座），所以这一条
 *     只交径向。
 *   · **测的是空载**：装上卡盘、夹上工件之后跳动会变，而本层没有"带载测"的夹具。
 */

import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const LATHE_SPINDLE_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * 主轴径向跳动测量。测量路线不改工艺，只把“这一件到底多少”变成可判的数。
     *
     * 产出仍是 `lathe/spindle`，窗口收窄到 **2–5 µm**（量出来的那一档）。
     */
    id: 'measure/lathe-spindle-runout',
    name: '主轴径向跳动测量',
    produces: [
      {
        item: 'lathe/spindle',
        qty: q(1),
        gives: [{ param: 'runout', kind: 'range', min: 2, max: 5 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'lathe/spindle', qty: q(1) }] },
      // 量块组提供基准，比较仪读差。
      { anyOf: [{ item: 'std/gauge-block-working', qty: q(1) }] },
    ],
    // 设备由 steps 表达；needs 只留场地，否则报 redundant_need。
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '空转 30 min 到热平衡（19–21 °C 计量间）', performedBy: 'lathe', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '端面 50 mm 处架杠杆式比较仪（0.1 µm 分度），量块组对零', performedBy: 'plant/comparator' },
      { note_zh: '手动盘车 8 点一圈 × 3 圈，记读数极差', performedBy: 'plant/robot' },
    ],
  },
];

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...LATHE_SPINDLE_MEASURE_ROUTES];
