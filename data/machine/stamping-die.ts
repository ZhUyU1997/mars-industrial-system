/**
 * 冲模 —— 压力机的另一半。没有冲模，压机只是一台"能重复压"的铁疙瘩。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 冲模的难点不是形状，是**间隙**
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   凸模（冲头）与凹模之间的单边间隙 = 板厚的 5–8%
 *
 *   0.5 mm 的硅钢片 → 间隙 0.025–0.04 mm
 *
 * 间隙太小吃掉模具、太大出毛刺。而这个 0.03 mm 是**配出来的，不是磨出来的** ——
 * 工业上叫"配研"：把凸模压进凹模，涂红丹（氧化铁粉 + 油），看接触斑点，刮一点、再配一次。
 *
 * **这是本层第二件"以手艺换精度"的零件**（第一件是拉丝模）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 材料：本层只能用 40Cr
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   工业模具钢   Cr12MoV（高碳高铬 + 钼）—— 耐磨、淬透性好、变形小
 *   本层         40Cr 淬火 HRC 50–52 —— 钼没有、铬也只在铁合金里
 *
 * 代价很具体：**40Cr 的耐磨性只有 Cr12MoV 的三分之一左右**，
 * 所以这副模具冲几万次就要修一次（工业上是几十万次）。
 *
 * ⚠️ 另一处：没有电火花与线切割。凹模的槽与孔全靠**铣 + 磨 + 手工锉**。
 * 一个定子冲模有 36 个槽，每个槽要锉到 0.02 mm —— 这是几周的活。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const STAMPING_DIE_ITEMS: readonly Item[] = [
  /**
   * 冲模（凸模 + 凹模 + 卸料板）。间隙 0.03 mm，手配。
   *
   * 它是**工具**：一副模具冲几万件（本层水平），磨钝了要重磨刃口。
   * 所以进 `needs`，不进 `uses`。
   */
  { id: 'std/stamping-die-general', name: '冲模', unit: '套', category: 'part' },
];

export const STAMPING_DIE_ROUTES: readonly Route[] = [
  {
    /**
     * 冲模：凸模与凹模分别铣出 → 淬火 → 磨平面 → **配研间隙**。
     *
     *   40Cr 1 + 碳化硅（研磨）1 → 冲模 1 套
     *
     * 配研是手工活：红丹涂在凸模上压进凹模，接触斑点高出来的地方刮掉一薄层，
     * 再压、再看。三十六个槽要一个一个配。
     */
    id: 'make/stamping-die',
    name: '冲模制造',
    produces: [{ item: 'std/stamping-die-general', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] },
      { anyOf: [{ item: 'mat/silicon-carbide', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/metrology-room'],
    steps: [
      { note_zh: '凸模与凹模的轮廓铣削（留 0.1 余量）', performedBy: 'plant/milling-machine' },
      { note_zh: '淬火回火（HRC 50–52）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 840, max: 860 }] },
      { note_zh: '平面磨与外形磨', performedBy: 'plant/grinder' },
      { note_zh: '**配研间隙 0.03 mm**（红丹看斑点，刮一点配一次）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '试冲与刃口修整', performedBy: 'plant/press' },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...STAMPING_DIE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...STAMPING_DIE_ROUTES];
