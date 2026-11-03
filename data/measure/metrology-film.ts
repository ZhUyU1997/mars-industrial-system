/**
 * 薄膜量具的两条测量路线 —— 膜应力与 SiN 氢含量（R13：measure/* 与记录只放这里）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、膜应力：激光扫曲率 + Stoney
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   σ = E_s h_s² / [6(1−ν_s) h_f R]
 *
 *   Si(100) 的 E/(1−ν) = 180 GPa；h_s = 525 µm（φ100 片）；h_f 由椭偏先测：
 *
 *       σ = 180×10⁹ × (525×10⁻⁶)² / (6 × h_f × R)
 *         = 8.2688×10⁶ / (h_f[µm] × R[m])   (Pa)
 *
 *   1 µm 膜：R = 8.27 m → 1 MPa、R = 27.6 mm → 300 MPa、R = 8.27 mm → 1 GPa。
 *   高应力段 R < 1 m，用 5 mm 扫描；低应力段 R 1–1000 m，用 100 mm 扫描。
 *   记录条目的 `stress 0–2000` 是容器（上限留给更薄的片/更厚的膜），
 *   本条仪器实际交 **1–1000 MPa**；两条窗口是“容器”与“方法”的关系，
 *   不是所有 0–2000 MPa 都能用 R 1–1000 m 这一档量。
 *
 *   曲率不是直接量 R，是量弧高 s = L²/(8R)，再二次拟合；100 mm 档的
 *   1 MPa 对应 s = 151 µm，5 mm 档的 1 GPa 对应 s = 378 µm。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、SiN 氢含量：FTIR 的 Si–H / N–H 峰面积
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   Si–H 伸缩 ≈2160 cm⁻¹、N–H 伸缩 ≈3350 cm⁻¹、Si–N TO ≈840 cm⁻¹。
 *   4 cm⁻¹ 分辨率下三个峰都能分开；H 含量由 N–H（与 Si–H）峰面积对
 *   膜厚归一化后，用两片已知 H 的 SiN（`mat/si3n4-lpcvd` 0–2 at%、
 *   `mat/silicon-nitride` 0.5–2 at%，按 `mat/sin-h-record`）两点标定。
 *
 *   **DTGS 缺失**：氘（重水电解）与甘氨酸（氨 + 氯乙酸）两条链本层都没有，
 *   本层 FTIR 用 BaTiO₃ 热释电探测器，D* 5×10⁷–2×10⁸ cm·Hz^½/W，比 DTGS
 *   低 5–10 倍。所以 H 下限是 **0.5–1 at%**（1 at% 约 256 次累加、0.5 at%
 *   约 1024 次），不是 DTGS 的 0.1 at%。这是 R8 的降级，升级路线写在
 *   `data/machine/semiconductor-metrology.ts` 的文件头。
 *
 * ⚠️ 记录条目的 `props` 是实测窗口；路线的 `gives` 是这条方法能覆盖的窗口。
 *    没有测之前，窗口不是读数 —— 与 data/measure 其他文件同一条口径。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const METROLOGY_FILM_ITEMS: readonly Item[] = [
  /**
   * 膜应力记录。**一份记录对应一片。**
   *
   *   stress          0–2000 MPa   记录容器的上限；本条仪器实际交 1–1000
   *   curvatureRadius 1–1000 m     低应力档的曲率窗口（1 µm 膜上 0.008–8.27 MPa）
   *   scanLength      10–100 mm    100 / 10 mm 两档；5 mm 档的高应力段另记
   *   repeatability   1–5 %        同一片扫 5 次的标准差
   *
   * ⚠️ stress 与 curvatureRadius 是两个**独立容器**，不是笛卡尔积：
   *    1 GPa 在 1 µm/525 µm 上对应 R = 8.27 mm，落在 1–1000 m 之外；
   *    那一段要 5 mm 档的另一条记录，本条不把 R < 1 m 写成已覆盖。
   */
  {
    id: 'mat/film-stress-record',
    name: '膜应力记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'stress', kind: 'range', min: 1, max: 1000, unit: 'MPa' },
      { param: 'curvatureRadius', kind: 'range', min: 1, max: 1000, unit: 'm' },
      { param: 'scanLength', kind: 'range', min: 10, max: 100, unit: 'mm' },
      { param: 'repeatability', kind: 'range', min: 1, max: 5, unit: '%' },
    ],
  },

  /**
   * SiN 氢含量记录。**一份记录对应一片。**
   *
   *   hydrogenContent    0.5–2 at%     BaTiO₃ 热释电的实测窗口（DTGS 可到 0.1）
   *   wavenumberMin      400 cm⁻¹      下限；KCl 分束器 + PTFE 远红外档
   *   wavenumberMax      4000 cm⁻¹     上限
   *   resolution         4 cm⁻¹        1.25 mm 镜行程
   *   repeatabilityRange 3–8 %        同片重装 3 次、每次 256/1024 次累加
   *
   * 波数范围用 `wavenumberMin` / `wavenumberMax` 两格表达（与
   * `plant/ftir` 的 props 同名），合起来就是 400–4000 cm⁻¹。
   */
  {
    id: 'mat/sin-h-record',
    name: 'SiN 氢含量记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'hydrogenContent', kind: 'range', min: 0.5, max: 2, unit: 'at%' },
      { param: 'wavenumberMin', kind: 'range', min: 400, max: 400, unit: 'cm⁻¹', dir: 'atMost' },
      { param: 'wavenumberMax', kind: 'range', min: 4000, max: 4000, unit: 'cm⁻¹', dir: 'atLeast' },
      { param: 'resolution', kind: 'range', min: 4, max: 4, unit: 'cm⁻¹' },
      { param: 'repeatabilityRange', kind: 'range', min: 3, max: 8, unit: '%', dir: 'atMost' },
    ],
  },
];

export const METROLOGY_FILM_ROUTES: readonly Route[] = [
  {
    /**
     * **膜应力：椭偏测厚 → 激光扫三条直径 → 二次拟合 R → Stoney。**
     *
     *   片 1 + 裸片 1（R = ∞ 参考）→ 应力记录 1 份
     *
     * 三档扫描：100 mm（1–10 MPa）、10 mm（10–300 MPa）、5 mm（300–1000 MPa）。
     * 每档三条直径（0°/45°/90°），每条 256 点；二次拟合 s(x) 得 c，R = 1/(2c)。
     * 重复性：同一片重装 5 次，取 stress 的标准差（1–5 %）。
     *
     * `plant/ellipsometer` 先测 h_f 与 n；h_s 用 525 ± 15 µm 的来料值
     * （硅片厚度没有在线量具，这是本记录最大的系统项，进 h_s² 是 6 %）。
     *
     * ⚠️ `mat/si3n4-lpcvd` 的 0.5–1.5 GPa 里，本机只覆盖 **0.5–1.0 GPa**：
     *    1.0–1.5 GPa 对应 R = 8.27–5.51 mm，而本机四块曲率标准最低是
     *    8.27 mm（1 GPa）。那一段要更小 R 的标准件 + 2.5 mm 档，是 R8 的
     *    降级，不写成已覆盖 —— 与 `plant/film-stress-meter` 的注释同一条。
     */
    id: 'measure/film-stress',
    name: '膜应力测量',
    produces: [
      {
        item: 'mat/film-stress-record',
        qty: q(1),
        gives: [
          // 仪器实际窗口 1–1000 MPa；记录条目的 0–2000 是容器，不是本条都能交
          { param: 'stress', kind: 'range', min: 1, max: 1000 },
          { param: 'curvatureRadius', kind: 'range', min: 1, max: 1000 },
          { param: 'scanLength', kind: 'range', min: 10, max: 100 },
          { param: 'repeatability', kind: 'range', min: 1, max: 5 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/si3n4-lpcvd',
            qty: q(1),
            // 0.3–1 µm 的 LPCVD Si₃N₄：stress 0.5–1.5 GPa 拉伸是设计窗口，
            // 本条第一次把它变成记录；膜太薄/太厚只影响 h_f，不影响方法
            need: [{ param: 'thickness', kind: 'range', min: 0.3, max: 1 }],
            onRelax: 'functional-kept',
          },
          {
            item: 'mat/silicon-nitride',
            qty: q(1),
            // 80–120 nm 反应溅射硬掩模；need 用 nm，与条目 props 同刻度
            need: [{ param: 'thickness', kind: 'range', min: 80, max: 120 }],
            onRelax: 'functional-kept',
          },
          {
            item: 'mat/gate-electrode-wafer',
            qty: q(1),
            // 多晶硅栅：只测 poly-si 那一档；铝栅是另一种膜，放宽算 kept
            need: [{ param: 'gateMaterial', kind: 'enum', oneOf: ['poly-si'] }],
            onRelax: 'functional-kept',
          },
        ],
      },
      // R = ∞ 参考：裸片当平晶用，扣掉卡盘与片子自重的 0.8 µm 弓形
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
    ],
    needs: ['plant/stabilized-laser', 'plant/laser-stage', 'plant/metrology-room'],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh:
          '① 椭偏测厚：488 nm、70°/75°，读 h_f 与 n；h_s 取来料 525 ± 15 µm（没有在线片厚量具，系统项 6 %）',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 扫曲率：`plant/film-stress-meter` + `plant/laser-stage` + 488 nm 稳频激光，100/10/5 mm 三档、每档三条直径（0°/45°/90°）、256 点/条；裸片先做 R = ∞ 零点',
        performedBy: 'plant/film-stress-meter',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 二次拟合 s(x) = a + bx + cx² 得 R = 1/(2c)，代 Stoney σ = 8.2688e6/(h_f[µm]·R[m]) Pa；同片重装 5 次记重复性 1–5 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **SiN 氢含量：椭偏测厚 → FTIR 透射谱 → 峰面积两点标定。**
     *
     *   片 1 → 氢含量记录 1 份
     *
     * 扫 400–4000 cm⁻¹、4 cm⁻¹、256 次（1 at%）或 1024 次（0.5 at%）。
     * Si–H 2160 与 N–H 3350 的峰面积对膜厚归一化；用 `mat/si3n4-lpcvd`
     * （H 0–2 at%）与 `mat/silicon-nitride`（H 0.5–2 at%）两片标定。
     * 两片的 H 都不是独立标准：前者是设计窗口，后者按 `mat/sin-h-record` 收窄；这是本条唯一没有计量溯源的量。
     *
     * H 下限 0.5–1 at% 是 BaTiO₃ 热释电探测器的极限（DTGS 缺失），不是
     * FTIR 原理的极限；0.5 at% 要 1024 次累加（约 4 h）。
     */
    id: 'measure/sin-h-content',
    name: 'SiN 氢含量测量',
    produces: [
      {
        item: 'mat/sin-h-record',
        qty: q(1),
        gives: [
          { param: 'hydrogenContent', kind: 'range', min: 0.5, max: 2 },
          { param: 'wavenumberMin', kind: 'range', min: 400, max: 400 },
          { param: 'wavenumberMax', kind: 'range', min: 4000, max: 4000 },
          { param: 'resolution', kind: 'range', min: 4, max: 4 },
          { param: 'repeatabilityRange', kind: 'range', min: 3, max: 8 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          { item: 'mat/si3n4-lpcvd', qty: q(1) },
          { item: 'mat/silicon-nitride', qty: q(1) },
        ],
      },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① 椭偏测厚：488 nm、70°/75°，读 0.08–1 µm 的膜厚与 n；H 含量按膜厚归一化，不能用设计厚度',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② FTIR 透射：400–4000 cm⁻¹、4 cm⁻¹、KCl 分束器 + BaTiO₃ 热释电（DTGS 缺失）；1 at% 档 256 次、0.5 at% 档 1024 次，干燥氮气吹扫到 5 %RH',
        performedBy: 'plant/ftir',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 峰面积：Si–H 2160 cm⁻¹、N–H 3350 cm⁻¹、Si–N 840 cm⁻¹ 三点基线；N–H/Si–N 面积比乘膜厚，用两片 SiN 标定到 at%；同片重装 3 次记重复性 3–8 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...METROLOGY_FILM_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...METROLOGY_FILM_ROUTES];
