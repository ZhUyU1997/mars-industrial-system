/**
 * OES 870 nm 一级衍射效率的测量路线 —— θ/2θ 测角仪 + 反射率标准。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 60–85 % 是目标，不是现有光栅的读数
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 任务书要「一级衍射效率 60–85 % @870 nm」。数据里 `plant/refractometer/
 * oes-grating` 的两个等级是：
 *
 *   非闪耀 48 nm 浅槽        1.5–3 %（估算）
 *   斜离子束弱闪耀 3–4° 面   8–15 %（设计值）
 *
 * 60–85 % 是 **32° 深槽闪耀光栅**的目标；`oes-grating.ts` 第十一节写明本层
 * 做不到（图案转移 50 nm、刀尖 250–313 nm、32° 面，差 10.4×）。所以本路线：
 *
 *   · 把现有光栅的 1.5–15 % 从「估算/设计值」变成**实测值**——这是本路线
 *     能证明的；
 *   · 60–85 % 作记录里的 `blazedTarget` **参考列** + `shortfall` 4–57×，
 *     不作 `efficiency` 的读数。R15/R16：没有 32° 深槽，就没有 60–85 %
 *     的读数；把目标写成读数就是拿设计冒充实测。
 *
 * 记录里 `efficiency` 是 1.5–15 % 的窗口（两个等级并集；一份记录对应一片
 * 光栅，实际落在 1.5–3 % 或 8–15 % 其中之一）。`shortfall` = 60–85 % 的
 * 目标 ÷ 实测：1.5 % 档 40–57×、15 % 档 4–5.7×。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 测量原理与数
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 反射光栅方程：sin α + sin β = m λ / d，d = 833.333 nm（1200 线/mm）。
 * 870 nm、m = 1、α = 22.00° ⇒ sin β = 870/833.333 − sin 22.00° = 0.6694
 * ⇒ β = 42.02°。0 级在 β = α = 22.00°（镜面反射）。
 *
 * 效率 η₁ = P₁ / P_inc：
 *   P_inc  移走光栅，同一探测器在直通位置读；或用参考镜（反射率由
 *          `std/reflectance-standard` 校准：Si 菲涅耳 31.9 % / PTFE 99 %）；
 *   P₁     2θ = 42.02° 处读；锁相 200 Hz、TC 1 s；
 *   η₁     = P₁/P_inc × (参考镜 R 的修正)。
 *
 * 数：
 *   源        `plant/oes-line-source` 870 nm、0.5–20 mW、线宽 ≤0.1 nm；
 *              比 20 nm 滤光片单色 200 倍（`metrology.ts` 的 A 类第①条已解）
 *   角度      0.01° 步；一级峰宽约 0.1–0.3°（角色散 0.0925°/nm × 线宽/光栅
 *              通带）；0.05° 的角误差在峰上约 2–3 %
 *   偏振      `plant/ellipsometer/polarizer` 18 dB 片堆；s/p 各测一次
 *   0 级      β = 22.00° 的镜面反射（铝膜 R 0.85–0.88 × 占空比）；
 *              记录 40–70 %
 *   2 级      m = 2：sin β = 2 × 1.044 − 0.3746 = 1.713 > 1 ⇒ **倏逝**，
 *              870 nm 上不存在二级；记录 <0.1 %（噪声上限）
 *
 * 不确定度预算（相对，k = 2）：
 *   源功率稳定        0.1–0.5 %
 *   探测器线性        0.5–1 %
 *   角度（峰位/读数） 2–3 %
 *   反射率标准        0.3–1 %
 *   杂散光/暗电流     1–2 %
 *   RSS               **2–5 %**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 曾经没有测角仪
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 2026-10-20 之前，`metrology.ts` 把这一格记为 A 类：没有 0–90° 的 θ/2θ
 * 测角仪、没有 870 nm 窄线源、没有绝对入射功率/反射率参考。三条都已经补：
 *   · 870 nm 窄线源  `plant/oes-line-source`（`lcr-lf.ts`）
 *   · 0–90° 测角仪   `plant/goniometer-theta2theta`（`goniometer.ts`）
 *   · 反射率标准     `std/reflectance-standard`（PTFE / Si 菲涅耳）
 * 旧推导保留在 `metrology.ts` 与 `oes-grating.ts` 的注释里，作为历史，不删。
 *
 * ═══ R13 ═══
 * 本文件只有记录条目 `mat/grating-efficiency-record` 与测量路线
 * `measure/grating-efficiency`；仪器与零件在 `data/machine/goniometer.ts`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const GRATING_EFFICIENCY_ITEMS: readonly Item[] = [
  /**
   * **OES 光栅 870 nm 一级衍射效率记录。是数据，不是物料。**
   *
   * 一份记录 = 一片光栅的一次 θ/2θ 扫描：
   *
   *   efficiency          1.5–15 %      一级衍射效率的**实测值**（非闪耀
   *                       1.5–3 %、弱闪耀 8–15 %；一片光栅落在其中一档）
   *   uncertainty         2–5 %         相对不确定度（k = 2；RSS 见文件头）
   *   polarizationRatio   1.1–2.5       s/p 效率比（片堆偏振器 18 dB）
   *   zerothOrder         40–70 %       0 级镜面反射（β = 22.00°）
   *   secondOrder         0–0.1 %       2 级泄漏上限；870 nm 上 m=2 倏逝，
   *                       这一格是**噪声上限**，不是测到的峰
   *   blazedTarget        60–85 %       **参考列，不是读数**：32° 深槽闪耀
   *                       光栅的目标（`oes-grating.ts` 第十一节，A 类 10.4×）
   *   shortfall           4–57 ×       blazedTarget ÷ efficiency：现有浅槽
   *                       离目标差 4–57 倍
   *
   * ⚠️ **不把 60–85 % 写成 efficiency。** 现有光栅的物理效率是 1.5–15 %；
   *   60–85 % 要 520 nm 深槽 + 32° 面，本层做不到。记录把目标单列一列，
   *   读数与目标的差距用 shortfall 给数，这正是这一格从「无量化」变成
   *   「已量化」的地方。
   */
  {
    id: 'mat/grating-efficiency-record',
    name: 'OES 光栅 870 nm 一级衍射效率记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'efficiency', kind: 'range', min: 0, max: 100, unit: '%' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 20, unit: '%', dir: 'atMost' },
      { param: 'polarizationRatio', kind: 'range', min: 0.5, max: 5, unit: '1' },
      { param: 'zerothOrder', kind: 'range', min: 0, max: 100, unit: '%' },
      { param: 'secondOrder', kind: 'range', min: 0, max: 10, unit: '%', dir: 'atMost' },
      { param: 'blazedTarget', kind: 'range', min: 0, max: 100, unit: '%' },
      { param: 'shortfall', kind: 'range', min: 1, max: 100, unit: '×' },
    ],
  },
];

export const GRATING_EFFICIENCY_ROUTES: readonly Route[] = [
  {
    /**
     * **870 nm 一级效率：装样品 → 自准直对零 → θ/2θ 扫 0/1 级 → 偏振 → 2 级上限。**
     *
     *   测角仪 1 套（`performedBy`）
     *   + 870 nm 窄线源 1 台（needs）
     *   + 锁相 1 台（needs，200 Hz 斩波）
     *   + 反射率标准 1 件（needs，Si 菲涅耳或 PTFE）
     *   + 光栅样品 1 片（uses，测完归还）
     *   → `mat/grating-efficiency-record` 1 份
     *
     * 为什么 `needs` 里既有源又有锁相：测角仪只提供角度与探测器；源、锁相、
     * 标准都是**在场但不被消耗**的参考件。样品在 `uses` 里是"占用一片"，
     * 记录是数据，不是把光栅吃掉。
     */
    id: 'measure/grating-efficiency',
    name: 'OES 光栅 870 nm 一级衍射效率测量',
    rate: { hours: q(8) },
    produces: [
      {
        item: 'mat/grating-efficiency-record',
        qty: q(1),
        gives: [
          { param: 'efficiency', kind: 'range', min: 1.5, max: 15 },
          { param: 'uncertainty', kind: 'range', min: 2, max: 5 },
          { param: 'polarizationRatio', kind: 'range', min: 1.1, max: 2.5 },
          { param: 'zerothOrder', kind: 'range', min: 40, max: 70 },
          { param: 'secondOrder', kind: 'range', min: 0, max: 0.1 },
          { param: 'blazedTarget', kind: 'range', min: 60, max: 85 },
          { param: 'shortfall', kind: 'range', min: 4, max: 57 },
        ],
      },
    ],
    uses: [
      // 被测光栅：一片，测完拆下归还（记录里写编号）
      { anyOf: [{ item: 'plant/refractometer/oes-grating', qty: q(1) }] },
    ],
    needs: [
      'plant/oes-line-source',
      'plant/lockin-lf',
      'std/reflectance-standard',
      'plant/metrology-room',
      'plant/efficiency-standard',
    ],
    steps: [
      {
        note_zh:
          '① 装样品/对零：光栅装在 θ 台，自准直光管对准光栅表面（θ = 0）；拆下光栅、光源准直组件对直通（α = 22.00°）；装回光栅，2θ 臂找 0 级（β = 22.00°）与一级（β = 42.02°）。源用 `plant/oes-line-source` 870 nm，斩波 200 Hz、锁相 TC 1 s。',
        performedBy: 'plant/goniometer-theta2theta',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 入射功率 P_inc：移走光栅，同一探测器在直通位置读（Si 0.4 A/W + 热电堆绝对功率双读）；或用参考镜，参考镜的 R 由 `std/reflectance-standard` 校准（Si 菲涅耳 31.9 % / PTFE 97–99 %）；两种方法差 <2 % 才继续。',
        performedBy: 'plant/goniometer-theta2theta',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 扫 0/1 级：2θ 从 20.00° 到 50.00°、步 0.01°，记 P(β)；0 级峰在 22.00°、一级峰在 42.02°。η₁ = P₁/P_inc × 参考修正；0 级记 zerothOrder。一级峰宽 0.1–0.3°，峰位重复 3 次取中值。',
        performedBy: 'plant/goniometer-theta2theta',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '④ 偏振：片堆偏振器转 0°/90°（s/p），各重扫一级峰；polarizationRatio = η_s/η_p。浅槽相位光栅的 s/p 差 1.1–2.5 倍（设计值）；偏振器消光 18 dB，残差 <1 %。',
        performedBy: 'plant/goniometer-theta2theta',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑤ 二级泄漏：m = 2 的 sin β = 2×1.044 − 0.3746 = 1.713 > 1 ⇒ 870 nm 上倏逝，**不存在二级**；2θ 扫 0–90° 找峰，只记噪声上限 <0.1 %。这一格是上限，不是峰。',
        performedBy: 'plant/goniometer-theta2theta',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑥ 不确定度与记录：源稳定 0.1–0.5 %、探测器线性 0.5–1 %、角度 2–3 %、标准 0.3–1 %、杂散 1–2 %，RSS 2–5 %；写 efficiency / uncertainty / polarizationRatio / zerothOrder / secondOrder。**blazedTarget 60–85 % 是参考列，efficiency 是读数；shortfall = 60–85 ÷ efficiency = 4–57×**。记录上写明：60–85 % 要 32° 深槽，本片是 1.5–15 % 的浅槽。',
        performedBy: 'plant/goniometer-theta2theta',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '不吃料：光栅 1 片（测完归还，记录编号）、源/锁相/标准都只被占用；产物是记录 1 份，**记录是数据不是物料**，没有 kg 账。8 h 里测角仪不能做别的测量，这个停机就是 rate 的 8 h。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...GRATING_EFFICIENCY_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...GRATING_EFFICIENCY_ROUTES];
