/**
 * 机电控制件 —— 闭环与"位置"这两件事，不用半导体也做得到。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 这里要解的是最后两条 1
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 那次断供试验剩下：`plant/robot/controller`（要闭环 + 电解电容）与
 * `plant/robot/servo`（要编码器）。两件都指向"反馈"。
 *
 * 而反馈不是半导体的专利：
 *
 *   自整角机   两台同型电机用三根线连起来，接收机的转子**跟着**发送机转
 *              —— 角度不用算，直接传过去。它就是一个不要光栅的编码器
 *   凸轮程序器 一根轴上排一串凸轮，转到哪一步就压哪一对触点
 *              —— 它就是程序。1950 年代的自动线全这么干
 *
 * 两件都是**绕线、叠片、车削、装配** —— 本层已有的动作。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 精度：它决定"点位"还是"连续"
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   自整角机   0.1–0.5°（估）
 *   编码器     0.001° 级
 *
 * 差三个数量级。但自整角机装在**电机轴**上，后面还有 100:1 的减速器：
 *
 *   0.5° / 100 = 0.005° ≈ 87 µm（1 m 臂长）
 *
 * 而减速器本身的回差就有 5–10′（0.08–0.17°，1.5–3 mm）。**反馈误差比机械回差小
 * 一个数量级，所以它不构成新的瓶颈** —— 这一条是"能装上去"的关键。
 *
 * 代价在别处：凸轮程序器只能排**点位**（一步、一停、再下一步），
 * 连续轨迹（比如沿焊缝走）它做不了 —— 那要插补，插补要算，算要半导体。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ELECTROMECH_ITEMS: readonly Item[] = [
  /**
   * 自整角机。定子三相 + 转子单相 + 滑环电刷，本质是一台小型的绕线转子电机。
   *
   * 一对同型号：发送机与被控轴同轴，接收机的转子自己转到同样的角度。
   * 它输出的是**机械转角**，不是数字 —— 而机械转角正好是调速系统与凸轮程序器
   * 都读得懂的东西。
   *
   * 计量按件（不是台）：它装在电机轴上，是**元件**不是独立设备 —— 与编码器
   * 同一个位置、同一个单位。同一条 `uses` 子句里的两者必须可通约，
   * 所以这里若写"台"，它就没法和编码器互为替代（`unit_mismatch` 会拦）。
   */
  { id: 'std/selsyn-general', name: '自整角机', unit: '件', category: 'part',
    props: [{ param: 'accuracy', kind: 'range', min: 0.01, max: 1, unit: '°' }],
    composedOf: [
      { item: 'std/selsyn-general/stator', qty: q(1) },
      { item: 'std/selsyn-general/rotor', qty: q(1) },
      { item: 'std/selsyn-general/brush-block', qty: q(1) },
      { item: 'std/bearing-general-p0', qty: q(2) },
    ] },

  /**
   * 凸轮程序器。一根凸轮轴 + 一串可调凸轮 + 一组行程开关，慢速电机带着转。
   *
   * 它把"时序"变成了机械形状：转到 30° 开夹爪、90° 升臂、150° 转腕、
   * 210° 关夹爪 —— 每个动作一个凸轮，位置随便挪。
   *
   * **这是本层唯一会"记住顺序"的东西**（计数器记的是数，它记的是顺序）。
   */
  { id: 'std/cam-programmer-general', name: '凸轮程序器', unit: '台', category: 'part',
    composedOf: [
      { item: 'std/cam-programmer-general/camshaft', qty: q(1) },
      { item: 'std/cam-programmer-general/cam', qty: q(8) },
      { item: 'std/cam-programmer-general/switch-block', qty: q(1) },
      { item: 'std/cam-programmer-general/gearbox', qty: q(1) },
      { item: 'std/motor-7.5kw-4p', qty: q(1) },
    ] },
];

export const ELECTROMECH_ROUTES: readonly Route[] = [
  {
    /**
     * 自整角机：定子嵌三相绕组 → 转子与滑环 → 装配对零。
     *
     *   定子     硅钢叠片，三相整步绕组按 120° 分布    plant/winder
     *   转子     单相绕组绕在凸极上，轴上装两只滑环     lathe
     *   电刷     碳刷压在滑环上，引出转子电流           plant/robot
     *   对零     两台同型号接三根线，转发送机、看接收机  plant/robot
     */
    id: 'make/selsyn',
    name: '自整角机制造',
    produces: [{ item: 'std/selsyn-general', qty: q(1), gives: [{ param: 'accuracy', kind: 'range', min: 0.1, max: 0.5 }] }],
    // 定子、转子、电刷、轴承在条目 composedOf 上；这里只写总装与对零。
    uses: [],
    needs: [],
    steps: [
      { note_zh: '装定子、转子与两只 P0 轴承', performedBy: 'plant/robot' },
      { note_zh: '装电刷与刷握，接三相与转子引线', performedBy: 'plant/robot' },
      { note_zh: '总装与对零（转发送端、看接收端）', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 凸轮程序器：凸轮与轴 → 行程开关 → 减速与装配。
     *
     *   凸轮     45 钢圆盘车成，轮缘铣出可调凸块      lathe
     *   行程开关 钨铜触点 + 弹簧片 + 酚醛壳体         plant/robot
     *   减速     蜗轮蜗杆，把电机转速降到"每步几秒"   plant/gear-hobbing
     *   装配     凸轮按动作顺序排相位、锁紧           plant/robot
     *
     * 一处表示不出来：**相位**（第几个凸轮在第几度动作）是这台机器唯一的信息，
     * 而模型没有角度与时间，所以"程序"只能写在注释里。
     */
    id: 'make/cam-programmer',
    name: '凸轮程序器制造',
    produces: [{ item: 'std/cam-programmer-general', qty: q(1) }],
    // 凸轮轴、8 只凸轮、开关组、减速箱、电机在条目 composedOf 上。
    uses: [],
    needs: [],
    steps: [
      { note_zh: '装凸轮轴、8 只凸轮、减速箱与电机', performedBy: 'plant/robot' },
      { note_zh: '装行程开关组，按动作顺序排相位并锁紧', performedBy: 'plant/robot' },
      { note_zh: '手动盘车核对 8 个动作点', performedBy: 'plant/robot' },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ELECTROMECH_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...ELECTROMECH_ROUTES];
