/**
 * 机械计数器 —— 绕线机那个"数圈数"的东西。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么它比控制板先做
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 断供试验剩下三件设备都挂在功率器件上，其中两件是绕线机与它的控制单元。
 * 而绕线机要的三件事里，只有一件真正需要"算"：
 *
 *   数圈数   转一圈加一 —— **机械计数器就能做**（字轮 + 棘轮 + 拨杆）
 *   正反转   两只接触器互锁 —— 接触器已经有了
 *   到位停   行程开关（限位）—— 一对触点
 *
 * 所以绕线机的控制不需要半导体。代价是**不能预置**：机械计数器只能数到多少
 * 是多少，不能"设 1000 圈自动停" —— 那要人盯着字轮、到数了按停。
 * 本层的人工（机器人）本来就盯着，这一条不算贵。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 五个零件
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   字轮   十片薄板，边上印数字（刻字或打字），轴上串成一排，逢十进一
 *   棘轮   一圈斜齿，拨杆每拨一次转一齿 —— 进位靠它
 *   拨杆   连在主轴上的偏心销，主轴转一圈拨一次
 *   轴     串字轮与棘轮，两端进框架
 *   框架   酚醛压件，定字轮窗口与轴孔
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 一处降级：冲压变成铣削
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 字轮与棘轮本该是**冲压件**（一副模具，一分钟几百件），而本层没有薄板冲压模具 ——
 * 只有铣床、车床，以及一台压酚醛框架的 100 吨曲柄压力机（`plant/press`）。
 * 所以字轮与棘轮一件一件铣出来：能做，但贵、慢、一致性差。
 * 与"定子冲片用铣削代冲"（data/machine/motor.ts）是同一处让步。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const COUNTER_ITEMS: readonly Item[] = [
  /**
   * 机械计数器，四位字轮，带手动清零。
   *
   * 它同时是"计数器"与"圈数表"：绕线机的圈数、卷取机的长度、轧机的道次，
   * 都靠它数。**它是本层唯一能"记住一个数"的东西** —— 而记住一个数，
   * 是自动化与非自动化之间那条线。
   */
  { id: 'std/counter-mechanical-general', name: '机械计数器', unit: '件', category: 'part',
    composedOf: [
      { item: 'std/counter-mechanical-general/wheel', qty: q(10) },
      { item: 'std/counter-mechanical-general/ratchet', qty: q(1) },
      { item: 'std/counter-mechanical-general/pawl', qty: q(1) },
      { item: 'std/counter-mechanical-general/shaft', qty: q(1) },
      { item: 'std/counter-mechanical-general/frame', qty: q(1) },
    ] },

  { id: 'std/counter-mechanical-general/wheel', name: '字轮', unit: '件', category: 'part' },
  { id: 'std/counter-mechanical-general/ratchet', name: '棘轮', unit: '件', category: 'part' },
  { id: 'std/counter-mechanical-general/pawl', name: '拨杆', unit: '件', category: 'part' },
  { id: 'std/counter-mechanical-general/shaft', name: '轴', unit: '件', category: 'part' },
  { id: 'std/counter-mechanical-general/frame', name: '框架', unit: '件', category: 'part' },
];

export const COUNTER_ROUTES: readonly Route[] = [
  {
    /**
     * 字轮：1 kg 薄板铣成十片，边上打数字。
     */
    id: 'make/counter-wheel',
    name: '字轮制造',
    produces: [{ item: 'std/counter-mechanical-general/wheel', qty: q(10) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] }],
    needs: [],
    performedBy: 'plant/milling-machine',
  },
  {
    /**
     * 棘轮：45 钢 0.2 kg，斜齿铣出来。
     */
    id: 'make/counter-ratchet',
    name: '棘轮制造',
    produces: [{ item: 'std/counter-mechanical-general/ratchet', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 5) }] }],
    needs: [],
    performedBy: 'plant/milling-machine',
  },
  {
    /**
     * 拨杆：45 钢 0.1 kg，车成偏心销。
     */
    id: 'make/counter-pawl',
    name: '拨杆制造',
    produces: [{ item: 'std/counter-mechanical-general/pawl', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 10) }] }],
    needs: [],
    performedBy: 'lathe',
  },
  {
    /**
     * 轴：45 钢 0.7 kg，串字轮与棘轮。
     */
    id: 'make/counter-shaft',
    name: '轴制造',
    produces: [{ item: 'std/counter-mechanical-general/shaft', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(7, 10) }] }],
    needs: [],
    performedBy: 'lathe',
  },
  {
    /**
     * 框架：酚醛树脂 1 kg 压成，定字轮窗口与轴孔。
     */
    id: 'make/counter-frame',
    name: '框架制造',
    produces: [{ item: 'std/counter-mechanical-general/frame', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] }],
    needs: [],
    performedBy: 'plant/press',
  },
  {
    /**
     * 机械计数器总装：十片字轮 + 棘轮 + 拨杆 + 轴 + 框架。
     *
     * 装配与整定：串轴、装进位爪、试拨到 9999 归零。
     */
    id: 'make/counter',
    name: '机械计数器总装',
    produces: [{ item: 'std/counter-mechanical-general', qty: q(1) }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...COUNTER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...COUNTER_ROUTES];
