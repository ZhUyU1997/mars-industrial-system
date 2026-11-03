/**
 * 锉刀 —— 用来打破"造车床要靠车床"的那件工具。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它为什么在这里
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 种子清单上有五条，其中"车床""磨床"的形状是**造它需要它**。这条判据是真的，
 * 但它遮住了一件事：
 *
 *   **第一台车床不是车床造的，是手工锉出来、刮出来的。**
 *
 * 锉刀能把一块淬火钢锉成导轨、能把主轴颈锉到 0.05 mm、能让两个面靠红丹配起来。
 * 它不需要母机、不需要导轨、不占精度 —— **它是"精度链"的最底下一级**。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 锉刀怎么做
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   材料   高碳钢（T10 一类），淬火到 HRC 62–65 —— 比被锉的东西硬
 *          本层没有 T10 条目，**用轴承钢代**（1% C 的高碳铬钢，淬到 HRC 62 没问题）
 *   剁纹   **用一把錾子手工剁**：斜着一下一下剁出齿纹，每 1 mm 二十来条
 *          剁纹的角度决定锉刀是"粗锉"还是"细锉"
 *   校直   淬火后弯了要校 —— 这一条是锉刀厂的核心手艺
 *
 * ⚠️ 本层做的是**单纹锉**（一条条平行齿），不是交叉纹（双纹锉）。
 * 单纹锉削得慢但表面光，适合配研；双纹锉吃料快，适合粗加工。
 *
 * ⚠️ 另一处：剁纹靠机器人按样板剁，一致性不如手工老师傅 —— 但**至少有齿**。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FILE_ITEMS: readonly Item[] = [
  /**
   * 锉刀。高碳钢、淬火、剁纹，单纹。
   *
   * 它是**工具**：一把锉刀锉几公斤铁就钝，要换。所以进 needs 不进 uses。
   */
  { id: 'std/file-general', name: 'Hand File', name_zh: '锉刀', unit: '件', category: 'part' },
];

export const FILE_ROUTES: readonly Route[] = [
  {
    /**
     * 锉刀：锻坯 → 退火 → 锉削成形 → 剁纹 → 淬火 → 校直。
     *
     *   高碳钢 1 + 錾子（工具） → 锉刀 20 把
     *
     * 剁纹是全程最要紧的一步：齿纹太浅锉不动，太深会崩齿。
     * 而**剁纹用的錾子也是手工剁出来的** —— 这一层的手艺是从最下面开始的。
     */
    id: 'make/file',
    name: 'Hand File Manufacturing', name_zh: '锉刀制造',
    produces: [{ item: 'std/file-general', qty: q(20) }],
    uses: [
      // 本层没有专门的碳素工具钢条目：轴承钢是现成的 1% C 高碳钢，代用。
      { anyOf: [{ item: 'mat/bearing-steel', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      // 加热与锻打是两件事：电阻炉到 1100，锻炉只管打（它没有温区 —— 热从别处来）
      { note_zh: '加热到 1050–1100（锻造温度）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 1050, max: 1100 }] },
      { note_zh: '锻打成形（扁坯、三角坯、圆坯）', performedBy: 'plant/forge' },
      { note_zh: '退火软化（760–800，好锉）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 760, max: 800 }] },
      { note_zh: '锉削成形（板锉、三角锉、圆锉各有坯）', performedBy: 'plant/grinder' },
      { note_zh: '**剁纹**（錾子斜剁，每毫米二十条）', performedBy: 'plant/robot' },
      { note_zh: '淬火（HRC 62–65）与校直', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 780, max: 800 }] },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...FILE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...FILE_ROUTES];
