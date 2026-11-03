/**
 * 永久磁体 —— 从磁铁矿来，不靠稀土。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 这一件堵着两处
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ① `plant/magnetic-separator` 的永磁体曾经是 `deferred`（data/material/entry.ts 开头
 *    写着"磁选机在磁这一处停住"）；本文件给出磁铁矿基路线后，它不再是断点。
 * ② 动圈检流计要永磁体 —— 而检流计是**把电变成可读数字**的唯一一条不用半导体的路。
 *
 * 本层没有钕铁硼（稀土没有分离链），没有钡锶铁氧体（钡没有），
 * 但有**磁铁矿**：风化层里就有，磁选机选出来的铁精矿就是它。磁铁矿（Fe₃O₄）
 * 本身就是永磁材料 —— 天然磁石（lodestone）就是被地磁场充过磁的磁铁矿。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 做法：压制 → 烧结 → 充磁
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   选纯   铁精矿磨细，去掉脉石
 *   压制   加粘结剂压成块（磁体的形状就是磁路要的形状）
 *   烧结   1200–1300 °C，晶粒长大、致密化 —— 电阻炉够
 *   充磁   放进直流线圈里，通一次大电流
 *
 * 最后那一步要**直流**，而本层刚好有：`std/rectifier-rotary-general`
 * （旋转变流机）。于是出现一个闭环：转出来的直流 → 充磁 → 磁体 →
 * 检流计 → 读出热电偶的毫伏 → 知道温度 → 控温。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 弱：0.2 T 对 1.3 T
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   钕铁硼     剩磁 ~1.3 T
 *   铁氧体     ~0.4 T
 *   磁铁矿     ~0.2 T（估，量级）
 *
 * 所以它只够做**仪表磁路**与弱磁场的东西：检流计、继电器磁路、磁性夹具。
 * 磁选机要的那一档强场它做不到 —— 那一件仍要等铁氧体或稀土，
 * 这一步只把"磁"从"完全没有"变成"有弱的"。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const MAGNET_ITEMS: readonly Item[] = [
  /**
   * 永久磁体，磁铁矿基，弱档。
   *
   * 形状随磁路走（马蹄形、条形、环形），所以规格只写"一档" ——
   * 与电机只造 7.5 kW 一种同理：备件统一比逐台匹配更要紧。
   */
  { id: 'std/permanent-magnet-general', name: 'Permanent Magnet', name_zh: '永久磁体', unit: '件', category: 'part',
    props: [{ param: 'grade', kind: 'enum', values: ['ferrite', 'alnico', 'ndfeb'] }, { param: 'coercivity', kind: 'range', min: 100, max: 1000, unit: 'kA/m' }] },
];

export const MAGNET_ROUTES: readonly Route[] = [
  {
    /**
     * 永久磁体：铁精矿磨细 → 压制成形 → 烧结 → 充磁。
     *
     *   磨细与压制   球磨到微米级，加粘结剂压成块        plant/robot
     *   烧结         1200–1300 °C，致密化               plant/kiln
     *   充磁         装进直流线圈，通一次大电流          plant/robot
     *
     * 充磁那一步要直流 —— 用旋转变流机（`std/rectifier-rotary-general`）供电。
     * 这是本层第一次"电生磁"，也是第一次不靠外来磁体。
     */
    id: 'make/permanent-magnet',
    name: 'Permanent Magnet Manufacturing', name_zh: '永久磁体制造',
    produces: [{ item: 'std/permanent-magnet-general', qty: q(1), gives: [{ param: 'grade', kind: 'enum', oneOf: ['ferrite'] }, { param: 'coercivity', kind: 'range', min: 100, max: 250, dir: 'atLeast' }] }],
    uses: [
      { anyOf: [{ item: 'mat/iron-concentrate', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
    ],
    needs: ['std/rectifier-rotary-general'],
    performedBy: 'plant/robot',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...MAGNET_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...MAGNET_ROUTES];
