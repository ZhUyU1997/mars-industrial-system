/**
 * 薄膜电容 —— 无源件里剩下的那一半，也是断供试验最后咬住的两件之一。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 电容分两种，一种能做，一种做不了
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   薄膜电容   两张铝箔夹两层塑料膜卷起来 —— **能做**（本文件）
 *   电解电容   腐蚀铝箔 + 电解液 + 密封 —— **做不了**（要腐蚀工艺与电解液配方）
 *
 * 这个区别很要紧，因为它们在电路里不可互换：
 *
 *   薄膜电容   耐压高、损耗低、能扛高频大电流 —— 谐振回路、滤波、吸收
 *   电解电容   单位体积容量大一个数量级 —— 直流母线的储能
 *
 * 所以本层能做的是**中频谐振回路那一种**（熔炼炉的电容组），做不了的是
 * 伺服驱动器直流母线那一种（机器人控制柜）。断供试验里那两条 1 与 3 的差别，
 * 根子在这里。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 结构：两张箔、两层膜，卷起来
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   铝箔   极板，越薄越好（省体积、少涡流）
 *   膜     介质，本层用 PTFE 膜 —— 工业上是聚丙烯，介电常数相近（2.1 vs 2.2），
 *          但 PTFE 更贵、更难做薄，所以同容量的体积要大一圈
 *   引线   铜片压在箔上，端面喷金后焊出
 *   浸渍   酚醛浸渍，把膜间的空气赶走（空气会电离，一电离就击穿）
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 一处模型表示不出来的东西：容量
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   C = ε₀·εr·A / d
 *
 * 面积 A 与膜厚 d 都不在模型里（模型没有长度），所以**这条路线产出的电容
 * 说不出是多少法拉**。它能说的是"这条路走得通、这样的结构成立"，
 * 说不了"够不够用"。这是全模型里最硬的一处表示缺陷 —— 比热处理的精度、
 * 比轴承的分组都硬，因为那些只是"差多少"，这里是"根本算不出"。
 *
 * 同理，卷绕的层数与张力决定容量的一致性，而那又是手上的活。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CAPACITOR_ITEMS: readonly Item[] = [
  /**
   * 薄膜电容，中频谐振用（与熔炼炉的电容组配套）。
   *
   * 与 `std/passive-component-general` 的关系是**子集与全集**：那一类里包含
   * 薄膜电容、电解电容、电阻、继电器、接插件；这一条只做其中能做的那个。
   * 所以它是一条新条目，不是给旧条目补路线 —— 旧条目里的电解电容仍在外购清单上。
   */
  { id: 'std/capacitor-film-general', name: 'Film Capacitor', name_zh: '薄膜电容', unit: '件', category: 'part',
    props: [{ param: 'capacitance', kind: 'range', min: 0.01, max: 100, unit: 'µF' }, { param: 'ratedVoltage', kind: 'range', min: 100, max: 1000, unit: 'V' }] },
];

export const CAPACITOR_ROUTES: readonly Route[] = [
  {
    /**
     * 薄膜电容：铝箔与膜分切 → 卷绕 → 喷金焊引线 → 浸渍封装。
     *
     *   铝箔与膜分切   铝箔轧到薄、膜切到宽        plant/rolling-mill
     *   卷绕           两张箔两层膜同轴卷紧、压成扁柱  plant/robot
     *   喷金与引线     端面喷金属、焊铜片            plant/robot
     *   浸渍与封装     酚醛真空浸渍、装壳、烘干      plant/robot
     *
     * 四道里三道是机器人手工 —— 卷绕张力、层间错位、端面喷金，都没有设备可依。
     * **这是"能造"和"造得好"之间最宽的一条缝**：结构上成立，一致性靠手。
     */
    id: 'make/capacitor-film',
    name: 'Film Capacitor Manufacturing', name_zh: '薄膜电容制造',
    produces: [{ item: 'std/capacitor-film-general', qty: q(1), gives: [{ param: 'capacitance', kind: 'range', min: 0.1, max: 10 }, { param: 'ratedVoltage', kind: 'range', min: 200, max: 630 }] }],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '铝箔与膜分切', performedBy: 'plant/rolling-mill' },
      { note_zh: '卷绕与压扁', performedBy: 'plant/robot' },
      { note_zh: '端面喷金、焊引线', performedBy: 'plant/robot' },
      { note_zh: '真空浸渍、装壳烘干', performedBy: 'plant/robot' },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CAPACITOR_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CAPACITOR_ROUTES];
