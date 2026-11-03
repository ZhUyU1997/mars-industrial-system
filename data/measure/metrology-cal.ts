/**
 * 三条「量具本身的标定/能力」测量路线 —— 压头针尖、参数分析仪电流底噪、
 * 轮廓仪垂直分辨。R13：measure/* 与记录只放 data/measure。
 *
 * ⚠️ 2026-10-20 接线：AFM 的两条测量路线在 `data/measure/afm.ts`
 * （`measure/tip-radius-afm` 5–8 %、`measure/step-height-afm` 0.5–50 nm），
 * 仪器与 1/10 nm 标准件在 `data/machine/afm.ts`。本文件的三条**全部保留**：
 * SEM 顶视 15–25 % 是历史路线与粗交叉检查，1 TΩ 支路仍是升级项，
 * 1/10 nm 档改用独立标准件（见第三节）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、压头针尖半径 0.02–0.1 µm：SEM 顶视 + 反卷积
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `plant/cd-sem` 的束斑 2–4 nm、边缘判定 1–3 nm；针尖 20–100 nm 在
 *   2 nm/像素下是 10–50 像素宽。球-锥模型的顶视轮廓被高斯束斑卷积：
 *
 *       w(x) = 2√(r² − x²) ⊗ G(σ = 1–2 nm)
 *
 *   拟合 r 的随机项 ≈ σ/√N ≈ 0.2–0.5 nm（N = 20–50 个边缘点）；
 *   系统项是**边缘阈值**（50 % 电平）与锥角：1 nm 的阈值偏在 20 nm 上
 *   就是 5 %，在 100 nm 上是 1 %。交付 15–25 % 主要是**顶视只有投影**：
 *   SEM 只有顶视，锥角与尖端球化模型只能假设 —— 这是 R8 的降级，
 *   不是 SEM 的分辨率不够。
 *
 *   ✅ **2026-10-20 起 AFM 路线是新主路径**：`plant/afm` 已在
 *   `data/machine/afm.ts`，`measure/tip-radius-afm`（`data/measure/afm.ts`）
 *   用反向成像 + 减 AFM 针尖半径给 **5–8 %**。本条 SEM 顶视
 *   **15–25 % 仍保留**（历史路线 + 粗交叉检查），不删。
 *   针尖样品是 `plant/nanoindenter/head`（tipRadius 0.02–0.5 µm 的条目）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、参数分析仪 1 fA 底噪：10 s 平均，不是瞬时
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `plant/cmos-test/parameter-analyzer` 的 `currentMin` 1 fA 是**最低量程**；
 *   本记录量的是**短路电流噪声**：
 *
 *       1 fA = 10 s 平均（0.1 Hz 等效噪声带宽）
 *       瞬时底噪 = 10–20 fA（0.1–10 Hz 积分）
 *
 *   1 TΩ 高阻**没有条目**（`std/resistor-network-general` 最大 1 MΩ；
 *   `cmos-analyzer.ts:121` 已判"1 TΩ 不存在"）。所以主基准是**电容法**：
 *   10 pF 标准气容 + 斜坡电压 I = C·dV/dt；1 fA 对应 0.1 mV/s，
 *   10 pA 对应 1 V/s —— 两个点跨 4 个数量级，正好互证。
 *   1 TΩ 支路是升级项，不是本条的现状。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、轮廓仪垂直分辨 0.05–0.2 nm：0.1/1/10 nm 台阶 + X 射线比对
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `plant/stylus-profilometer` 的 Z 轴 0.05–0.1 nm、触针 R 1.8–2.2 µm：
 *   垂直分辨够 0.1 nm，但触针的**横向**卷积把 0.1 nm 台阶抹成 1–2 µm 的
 *   斜坡 —— 所以这条只标定**垂直**，不标横向。
 *
 *   台阶标准：
 *     0.1 nm   `std/step-standard-0.1nm`（ALD 一个 HfO₂ 周期，X 射线定值）
 *     1/10 nm  **已有独立标准件** `std/step-standard-1nm-10nm`
 *              （`data/machine/afm.ts`：ALD 10/100 周期、两次 lift-off，
 *              AFM 与 X 射线互证，1.0±0.05 / 10±0.2 nm）。
 *              本条已切到新标准（`needs` 里有它）；0.1 nm 档仍用
 *              `std/step-standard-0.1nm`。旧写法「0.1 nm 多周期叠加」保留为
 *              历史降级，不再是本条的现状。
 *
 *   与 `plant/xray-interferometer` 比对：0.1 nm = 0.319 个 (111) 条纹，
 *   相位 11° ⇒ 0.008 nm；轮廓仪读数与 X 射线值之差就是垂直标定误差。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const METROLOGY_CAL_ITEMS: readonly Item[] = [
  /**
   * 压头针尖半径记录。**一份记录对应一支针。**
   *
   *   tipRadius   0.02–0.1 µm   20–100 nm；目标档是 50 nm
   *   uncertainty 15–25 %       SEM 顶视历史记录；AFM 记录见
   *                             `mat/tip-radius-afm-record`（5–8 %）
   *   edgeResolution 1–3 nm     SEM 有效边缘分辨（束斑 2–4 nm，边缘判定 1–3 nm）
   *   method      sem-topview-deconv
   *
   * ⚠️ 15–25 % 不是随机误差，是**模型系统项**：尖端球化半径与锥角的
   *    假设。20 nm 上 1 nm 的边缘偏就是 5 %，100 nm 上才 1 %；交付取
   *    15–25 % 是因为 20–50 nm 档的锥角未知。AFM 路线（5–8 %）已在新文件，
   *    这一条**保留**为历史路线与粗交叉检查，不删。
   */
  {
    id: 'mat/tip-radius-record',
    name: '压头针尖半径记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'tipRadius', kind: 'range', min: 0.02, max: 0.1, unit: 'µm' },
      { param: 'uncertainty', kind: 'range', min: 15, max: 25, unit: '%' },
      { param: 'edgeResolution', kind: 'range', min: 1, max: 3, unit: 'nm' },
      { param: 'method', kind: 'enum', values: ['sem-topview-deconv'] },
    ],
  },

  /**
   * 参数分析仪电流底噪记录。**一份记录对应一台表。**
   *
   *   currentFloor   1–100 fA     短路电流噪声；1 fA 是 10 s 平均
   *   noiseBandwidth 0.1–10 Hz    积分带宽；瞬时底噪 10–20 fA
   *   method         cap-10pf-10s 10 pF 电容法 + 10 s 平均
   *
   * ⚠️ 1 TΩ 高阻不存在（std 最大 1 MΩ），高阻支路是升级项；
   *    本条只用 10 pF 气容与 1 V/s 斜坡互证，不给"1 TΩ 已标"。
   */
  {
    id: 'mat/pa-current-floor-record',
    name: '参数分析仪电流底噪记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'currentFloor', kind: 'range', min: 1, max: 100, unit: 'fA' },
      { param: 'noiseBandwidth', kind: 'range', min: 0.1, max: 10, unit: 'Hz' },
      { param: 'method', kind: 'enum', values: ['cap-10pf-10s', 'cap-10pf-instant'] },
    ],
  },

  /**
   * 轮廓仪垂直标定记录。**一份记录对应一台轮廓仪。**
   *
   *   stepHeight          0.1–10 nm  0.1 / 1 / 10 nm 三档
   *   verticalResolution  0.05–0.2 nm  机器 0.05–0.1，记录留到 0.2
   *   repeatabilityRange  0.02–0.05 nm 同一点 10 次
   *   uncertainty         0.02–0.05 nm 与 X 射线干涉仪之差
   *   method              stylus+xray
   *
   * ⚠️ 1/10 nm 两档已有独立标准件 `std/step-standard-1nm-10nm`
   *    （AFM + X 射线，1.0±0.05 / 10±0.2 nm，`data/machine/afm.ts`）；
   *    本条记录仍按旧的多周期叠加路线产出，切到新标准见
   *    `measure/profiler-vertical-cal` 的 `needs`。
   */
  {
    id: 'mat/profiler-vertical-cal-record',
    name: '轮廓仪垂直标定记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'stepHeight', kind: 'range', min: 0.1, max: 10, unit: 'nm' },
      { param: 'verticalResolution', kind: 'range', min: 0.05, max: 0.1, unit: 'nm' },
      { param: 'repeatabilityRange', kind: 'range', min: 0.02, max: 0.05, unit: 'nm', dir: 'atMost' },
      { param: 'uncertainty', kind: 'range', min: 0.02, max: 0.05, unit: 'nm', dir: 'atMost' },
      { param: 'method', kind: 'enum', values: ['stylus+xray'] },
    ],
  },
];

export const METROLOGY_CAL_ROUTES: readonly Route[] = [
  {
    /**
     * **针尖半径：SEM 顶视 → 束斑反卷积 → 球-锥拟合。**
     *
     *   针 1 支 → 半径记录 1 份
     *
     * 200 k×、2–4 nm 束斑、1–3 nm 边缘；20–100 nm 的针尖是 10–50 像素。
     * 取 20–50 个边缘点拟合圆/球-锥，反卷积掉 1.5 nm 的高斯束斑；
     * 20 nm 上 1 nm 阈值偏 = 5 %，50 nm 上 = 2 %；15–25 % 是锥角未知
     * 与尖端球化的系统项（**本条不用 AFM 独立值**；AFM 路线见
     * `measure/tip-radius-afm`）。
     *
     * ⚠️ **SEM 顶视 15–25 % 仍保留；AFM 路线 5–8 % 是新主路径**
     * （`measure/tip-radius-afm`，`data/measure/afm.ts`）。本条不删：
     * 它是历史路线，也是 AFM 的粗交叉检查（两条差 >3 倍 ⇒ 重装/重扫）。
     */
    id: 'measure/tip-radius',
    name: '压头针尖半径测量',
    produces: [
      {
        item: 'mat/tip-radius-record',
        qty: q(1),
        gives: [
          { param: 'tipRadius', kind: 'range', min: 0.02, max: 0.1 },
          { param: 'uncertainty', kind: 'range', min: 15, max: 25 },
          { param: 'edgeResolution', kind: 'range', min: 1, max: 3 },
          { param: 'method', kind: 'enum', oneOf: ['sem-topview-deconv'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/nanoindenter/head', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(2) },
    steps: [
      {
        note_zh:
          '① 装针、对中：针尖朝上贴在 SEM 样品座，200 k× 顶视；束斑 2–4 nm、边缘判定 1–3 nm，20–100 nm 的针尖是 10–50 像素',
        performedBy: 'plant/cd-sem',
        under: [
          { param: 'pressure', min: 1e-6, max: 1e-3 },
          { param: 'temperature', min: 19, max: 21 },
        ],
      },
      {
        note_zh:
          '② 取 20–50 个边缘点，拟合球-锥轮廓并反卷积 1.5 nm 高斯束斑；20 nm 上 1 nm 阈值偏 = 5 %，50 nm 上 2 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 不确定度：锥角按 `plant/nanoindenter/head` 的 65.27° 假设，尖端球化半径本条不取 AFM 独立值 ⇒ 15–25 %（系统项，不是随机项）；AFM 独立值见 measure/tip-radius-afm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **参数分析仪电流底噪：10 pF 电容法 + 屏蔽盒 + 10 s 平均。**
     *
     *   表 1 台 + 屏蔽盒 1 + 10 pF 标准 1 → 底噪记录 1 份
     *
     * 1 fA 是 **10 s 平均**（0.1 Hz 等效噪声带宽）；瞬时（0.1–10 Hz）
     * 是 10–20 fA。电容法：I = C·dV/dt，10 pF 下 0.1 mV/s = 1 fA、
     * 1 V/s = 10 pA；两点跨 4 个数量级，互证表的低端线性。
     *
     * 1 TΩ 高阻没有条目（std 最大 1 MΩ），所以不写"1 TΩ 已标"；
     * 1 TΩ 支路是升级项。
     */
    id: 'measure/pa-current-floor',
    name: '参数分析仪电流底噪测量',
    produces: [
      {
        item: 'mat/pa-current-floor-record',
        qty: q(1),
        gives: [
          { param: 'currentFloor', kind: 'range', min: 1, max: 100 },
          { param: 'noiseBandwidth', kind: 'range', min: 0.1, max: 10 },
          { param: 'method', kind: 'enum', oneOf: ['cap-10pf-10s'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/probe-station/shield-box', qty: q(1) }] },
      { anyOf: [{ item: 'plant/probe-station/cap-standard', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① 接 10 pF 气容与屏蔽盒（140 dB）、短路帽，表放 1 fA 档；0.1–10 Hz 积分，10 s 平均读 100 点',
        performedBy: 'plant/cmos-test/parameter-analyzer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 电容法互证：10 pF 上 0.1 mV/s = 1 fA、1 V/s = 10 pA；两点读数与表的电流档比，差 >20 % 重调零',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 记录：1 fA 是 10 s 平均；瞬时底噪 10–20 fA（0.1–10 Hz）。1 TΩ 支路没条目，不写已标',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **轮廓仪垂直标定：0.1/1/10 nm 台阶 → 与 X 射线干涉仪比。**
     *
     *   标准片 1 + X 射线标准 1 → 垂直标定记录 1 份
     *
     * 触针 R 1.8–2.2 µm，垂直 0.05–0.1 nm；只标垂直，不标横向。
     * 0.1 nm 标准是 ALD 一个 HfO₂ 周期；1/10 nm 用**独立标准件**
     * `std/step-standard-1nm-10nm`（1.0±0.05 / 10±0.2 nm，AFM + X 射线定值，
     * `data/machine/afm.ts`）。绝对标尺借 `plant/xray-interferometer` 的
     * 0.1 nm = 0.319 条纹。同一点 10 次给 repeatability 0.02–0.05 nm；
     * 与 X 射线之差给 uncertainty 0.02–0.05 nm。
     *
     * ⚠️ 旧写法「1/10 nm 用 0.1 nm 标准多周期叠加」已不再使用：
     * 1/10 nm 走 `std/step-standard-1nm-10nm` 的独立平台，0.1 nm 仍用
     * `std/step-standard-0.1nm`。旧写法保留为历史降级，不删。
     */
    id: 'measure/profiler-vertical-cal',
    name: '轮廓仪垂直标定',
    produces: [
      {
        item: 'mat/profiler-vertical-cal-record',
        qty: q(1),
        gives: [
          { param: 'stepHeight', kind: 'range', min: 0.1, max: 10 },
          { param: 'verticalResolution', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'repeatabilityRange', kind: 'range', min: 0.02, max: 0.05 },
          { param: 'uncertainty', kind: 'range', min: 0.02, max: 0.05 },
          { param: 'method', kind: 'enum', oneOf: ['stylus+xray'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/step-standard-0.1nm', qty: q(1) }] },
      { anyOf: [{ item: 'plant/xray-interferometer/step-standard', qty: q(1) }] },
    ],
    needs: ['plant/xray-interferometer', 'plant/metrology-room', 'std/step-standard-1nm-10nm'],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh:
          '① 0.1 nm 档：用 std/step-standard-0.1nm（ALD 一个 HfO₂ 周期）；触针 R 2 µm、测力 0.1 mN、λc 0.08 mm、评长 0.4 mm，3 条 × 5 点，只读垂直',
        performedBy: 'plant/stylus-profilometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 用 std/step-standard-1nm-10nm 的 1 nm 与 10 nm 平台各测 5 点（A/B 平台，C 平台作零点）；与 0.1 nm 档同一测力、同一 λc、同一评长',
        performedBy: 'plant/stylus-profilometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ X 射线比对：0.1 nm = 0.319 个 (111) 条纹、相位 11° ⇒ 0.008 nm；轮廓仪与 X 射线之差记 uncertainty 0.02–0.05 nm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '④ 重复性：同一点 10 次，repeatability 0.02–0.05 nm；1/10 nm 用新标准 std/step-standard-1nm-10nm，0.1 nm 仍用 std/step-standard-0.1nm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...METROLOGY_CAL_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...METROLOGY_CAL_ROUTES];
