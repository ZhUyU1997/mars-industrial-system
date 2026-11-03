/**
 * OES 870 nm 波长的实测记录（用 Ar 空心阴极灯的两条 Ar I 线内插）。
 *
 * ⚠️ **分工（R13）**：本文件只放 **1 条测量路线 + 1 个记录条目**；灯在
 * `data/machine/standards.ts`（`std/hollow-cathode-ar`），谱仪用 `plant/refractometer`
 * 的 OES 通道。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、为什么不用 Ne、为什么 Ar 行
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `mat/neon` **0 条目**：Ne 只能从空气分馏的稀有气体侧线拿（空气 18 ppm），本层没有那条线。
 *   `mat/argon` 有（空气分离即得），且 Ar I 的两条强线把 870 夹住：
 *     866.79 nm（下）与 912.30 nm（上），跨度 **45.51 nm**。
 *   两条线的波长是原子常数（0.001 nm 级），所以标准件的定值误差只剩：
 *     ① 谱仪读峰（0.005–0.01 nm）
 *     ② 内插几何（45.51 nm 跨度的线性度，0.01–0.02 nm）
 *   合计 **0.01–0.02 nm** —— 正是 870 处要的 ≤0.02 nm。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、内插账
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   λ(870) = λ866.79 + (870 − 866.79)/(912.30 − 866.79) × (λ912.30 − λ866.79)
 *   权重 = 3.21/45.51 = 0.0705；两端的读数误差按 (1−w) 与 w 传播：
 *     σ² = (0.9295·0.005–0.01)² + (0.0705·0.005–0.01)² + 线性度 0.01–0.02
 *   ⇒ 合成 **0.01–0.02 nm**；870 处的内插把 45.51 nm 的跨度压到 3.21 nm，
 *     比“只用 589 nm 钠双线 + 基块几何（0.1–0.2 nm）”好 **5–10×**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① Ar I 866.79 与 912.30 都离 870 有 3.21/42.3 nm：**870 处没有谱线**，
 *     给的是“内插标准”，不是 870 nm 的原子线；若 870 源本身偏 0.05 nm，内插仍能说清。
 *  ② 谱仪分辨率 2–10 nm（`plant/monochromator`）不够，用 OES 通道（0.034 nm/µm、1 µm 估读）
 *     + 峰质心 10 点拟合才到 0.005–0.01 nm。
 *  ③ 灯的 866.79 线强度只有 912.30 的 1/3–1/2（Ar I 跃迁概率差），弱线读数要 30–60 s 积分。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { OES_HCL_ITEMS, OES_HCL_ROUTES } from '../../data/measure/oes-hcl.ts';
 *   items: [...OES_HCL_ITEMS] · routes: [...OES_HCL_ROUTES]
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const OES_HCL_ITEMS: readonly Item[] = [
  /**
   * **OES 波长记录（Ar HCL 内插）。**
   *
   *   wavelengthA   866.7–866.9 nm（Ar I 866.79）
   *   wavelengthB   912.2–912.4 nm（Ar I 912.30）
   *   interpolated  869.9–870.1 nm（内插到 870）
   *   uncertainty   0.01–0.02 nm
   *   linewidth     0.05–0.1 nm（FWHM）
   */
  {
    id: 'mat/oes-wavelength-hcl-record',
    name: 'OES 波长记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'wavelengthA', kind: 'range', min: 860, max: 875, unit: 'nm' },
      { param: 'wavelengthB', kind: 'range', min: 905, max: 920, unit: 'nm' },
      { param: 'interpolated', kind: 'range', min: 865, max: 875, unit: 'nm' },
      { param: 'uncertainty', kind: 'range', min: 0.005, max: 0.05, unit: 'nm', dir: 'atMost' },
      { param: 'linewidth', kind: 'range', min: 0.02, max: 0.2, unit: 'nm' },
    ],
  },
];

export const OES_HCL_ROUTES: readonly Route[] = [
  {
    /**
     * **Ar HCL 定值：起辉预热 → 双线读数 → 内插到 870 → 线宽与稳定性。**
     *
     *   Ar 灯 1 只 → 记录 1 份
     */
    id: 'measure/oes-wavelength-hcl',
    name: 'OES 波长测量',
    produces: [
      {
        item: 'mat/oes-wavelength-hcl-record',
        qty: q(1),
        gives: [
          { param: 'wavelengthA', kind: 'range', min: 866.7, max: 866.9 },
          { param: 'wavelengthB', kind: 'range', min: 912.2, max: 912.4 },
          { param: 'interpolated', kind: 'range', min: 869.9, max: 870.1 },
          { param: 'uncertainty', kind: 'range', min: 0.01, max: 0.02 },
          { param: 'linewidth', kind: 'range', min: 0.05, max: 0.1 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/hollow-cathode-ar', qty: q(1, 250) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '① 起辉与预热：200–400 V 起辉、5–20 mA，预热 30 min 到光强稳定（<2 %）',
        performedBy: 'plant/hv-source-500v',
      },
      {
        note_zh: '② 谱仪双线读数：OES 通道 800–1000 nm，866.79 与 912.30 各扫 10 点、质心拟合；弱线积分 30–60 s',
        performedBy: 'plant/refractometer',
      },
      {
        note_zh: '③ 内插：λ870 = λ866.79 + (870−866.79)/(912.30−866.79) × (λ912.30−λ866.79)；权重 0.0705，误差按两端传播',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '④ 线宽与稳定性：FWHM 0.05–0.1 nm；30 min 峰位漂 <0.005 nm；589 nm 钠双线作旁证（只校正弦杆，不搬色散）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '⑤ 记录与判读：wavelengthA/B、interpolated 869.9–870.1、U 0.01–0.02 nm；两条线峰位差与 45.51 nm 理论差 >0.05 nm 重扫',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(4) },
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...OES_HCL_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...OES_HCL_ROUTES];
