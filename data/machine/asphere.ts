/**
 * φ150 非球面检测标准镜（f/0.58、NA 0.86、边缘 69°）的产出路线。
 *
 * `large-asphere.ts` 在 2026-10-20 把 `plant/null-test/asphere-150` 判成"三档能力不足"：
 *
 *   ① 材料：要 n ≥ 1.70 的玻璃（LaSF / 镧火石，或 SF 系列）或 φ175×120 毛坯；
 *      本层只有 n = 1.46 / 1.44，最大毛坯 φ340×60（厚 60 < 111 / 120）。
 *   ② 抛光：69° 边缘，平盘是线接触；本层手抛 λ/4 只到 32.7° 的边缘。
 *   ③ 检验：Hindle 遮挡 48–100 %；要 NA 0.86 的参考球或 φ160 会聚束 CGH；
 *      本层最大透射球 f/5.5、CGH 只有 φ100。
 *
 * 本文件把这三环各补成**有产出路线**的链，而不是把旧判词改写成一句否定：
 *
 *   ① `mat/lasf-glass`：La₂O₃ 30 + B₂O₃ 15 + SiO₂ 25（配料）+ 坩埚蚀薄 SiO₂ 4
 *      + BaO 11.65 + ZrO₂ 3 = 88.65 kg 氧化物 → 84 kg 玻璃；n_d 1.70–1.85（设计 1.78）、
 *      均匀性 ±5e-6、应力 ≤5 nm/cm。
 *      La₂O₃ 从稀土精矿来（尾矿 500 kg → 精矿 1 kg → La₂O₃ 1 kg + CeO₂ 2 kg）；
 *      CeO₂ 是本层以前 0 条目的抛光粉，正好做最终抛光的 Ra ≤1 nm。
 *      毛坯 φ175×120 = 11.5 kg：14 kg 玻璃 → 700–800 °C 压型 → 620–680 °C 退火 →
 *      切 → 粗磨；应力 ≤5 nm/cm。
 *   ② 抛光：`std/bowl-lap-200`（φ200、碗口 70°、R 按工件车修）贴 69° 边缘；
 *      `plant/cnc-polisher-5axis`（5 轴，5–200 mm 工具，15 mm 小磨头）修非球面；
 *      目标 PV ≤158 nm（λ/4 @633 nm）、Ra ≤1 nm。
 *   ③ 检验：`plant/null-test/cgh-160`（φ160、线宽 1–5 µm、刻蚀 158 nm、
 *      位置误差 ≤0.5 µm）是主路线；`plant/null-test/ref-sphere-na086`
 *      （R87、φ150、NA 0.86）是全口径备选；`plant/null-test/hindle-150`
 *      （R60、φ110、遮挡 48 %）是只验 52 % 口径的降级档。
 *
 * ⚠️ 本文件所有工艺窗口与指标都是**设计值（Earth 工程值）**，不是本层实测；
 *    实测记录在 `data/measure/`，本文件不写"闭合"。
 *
 * ⚠️ 时态：`large-asphere.ts` 第 507–560 行那段否定判词是**当时**的结论，
 *    本文件补的是它缺的三环；那段注释仍留在原文件里，读到时以本文件的路線为准
 *    （补上了就写过去时并指出路线）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ASPHERE_ITEMS: readonly Item[] = [
  /**
   * **稀土精矿（REO 15–18 %）。** 铁尾矿里 REO 约 300 ppm；浮选 500:1 →
   * 1 kg 精矿带 0.15 kg REO。500 kg 尾矿 + 0.05 kg 浮选药剂 + 100 kg 水 → 1 kg。
   *
   * 这不是"火星有稀土矿"的假设：`mars.ts` 写的是风化层 REE 约百 ppm；
   * 铁尾矿把磷灰石/独居石类副矿物一起富集，300 ppm 是**设计值**（Earth 工程值）。
   */
  {
    id: 'mat/ree-concentrate',
    name: '稀土精矿',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'reo', kind: 'range', min: 10, max: 30, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * **La₂O₃ 99.5 %（镧火石的主配料）。**
   *
   * 26.7 kg 精矿（15 % REO = 4.0 kg REO）→ La 25 % = 1 kg La₂O₃ + Ce 50 % = 2 kg CeO₂；
   * 其余 25 %（Nd/Pr/Sm）1.0 kg 留在母液，未立条目。
   * 工艺：500–600 °C 焙烧（把 Ce³⁺ 氧化成不溶的 CeO₂）→ 60–90 °C HCl 浸出 →
   * 70–90 °C NaOH 沉淀 La(OH)₃ → 900–1000 °C 灼烧 → 粉碎分级。
   */
  {
    id: 'mat/lanthanum-oxide',
    name: '氧化镧',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99, max: 99.9, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * **CeO₂ 95–99 %、0.5–3 µm 稀土抛光粉。**
   *
   * 本层以前没有铈（`cmp-integration.ts` 的缺口：氧化铈浆 0 命中），最终抛光只能
   * 用石英粉；CeO₂ 的抛光速率是石英粉的 3–5 倍，Ra 能到 1 nm 档。它是 La 分离的
   * 联产，不是另开一条矿。
   */
  {
    id: 'mat/cerium-oxide',
    name: '氧化铈',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 90, max: 99.5, unit: '%', dir: 'atLeast' },
      { param: 'particleSize', kind: 'range', min: 0.1, max: 5, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * **光学级 BaCO₃ 99.5 %。**
   *
   * 本层技术级 BaCO₃ 只到 92–96 %（`make/barium-carbonate` 的 gives）；光学玻璃
   * 要 99.5 %，否则 Fe/Sr 把吸收与气泡带进来。1.2 kg 技术级 → 1 kg 光学级：
   * 90–100 °C 溶解 → 过滤 → 20–30 °C 重结晶 → 200–300 °C 干燥 → 粉碎。
   */
  {
    id: 'mat/barium-carbonate-optical',
    name: '光学级 BaCO₃',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99, max: 99.9, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * **镧火石玻璃（LaSF）n_d 1.70–1.85，设计 1.78。**
   *
   * 氧化物配料（kg，按 84 kg 玻璃出料；8 只 3 L 坩埚，每只 10.5 kg 玻璃）：
   *   La₂O₃ 30（33.8 wt%）+ B₂O₃ 15（16.9）+ SiO₂ 29（32.7，含坩埚蚀薄 4）
   *   + BaO 11.65（13.1，由 15 kg BaCO₃ 分解）+ ZrO₂ 3（3.4）
   *   = 88.65 kg 氧化物 → 84 kg 玻璃（4.65 kg 挥发/skull）。
   *
   * 指标：n_d 1.70–1.85（设计值 1.78）、均匀性 ±5e-6（窗口 −5…+5 ×10⁻⁶）、
   * 退火应力 ≤5 nm/cm、内透 ≥95 %/cm @633 nm。
   *
   * 坩埚：**熔石英**，不是铂。当时铂 0 条目；现在有海绵 Pt（`pgm.ts`），但
   * **铂坩埚**的成形未建，Al₂O₃ 瓷坩埚会溶 Al
   * 进玻璃；熔石英的 SiO₂ 本来就是配料，每只每批蚀薄 0.5 kg，8 只共 4 kg。
   */
  {
    id: 'mat/lasf-glass',
    name: '镧火石玻璃',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'nd', kind: 'range', min: 1.7, max: 1.85, unit: 'n_d' },
      { param: 'homogeneity', kind: 'range', min: -5, max: 5, unit: '10⁻⁶' },
      { param: 'stress', kind: 'range', min: 0, max: 5, unit: 'nm/cm', dir: 'atMost' },
      { param: 'transmission', kind: 'range', min: 95, max: 100, unit: '%/cm', dir: 'atLeast' },
    ],
  },

  /**
   * **φ160×160 熔石英坩埚，3 L。**
   *
   * 7 kg 石英砂 → 4 kg 坩埚（壁 8 mm，底 12 mm）；1,900–2,000 °C 弧炉熔融 →
   * 吹/模成 → 1,050–1,100 °C 退火 → 磨口。每只可用 10–15 批；玻璃路线按每批
   * 0.5 kg 石英蚀薄计。
   */
  {
    id: 'std/crucible-quartz-3l',
    name: 'φ160×160 熔石英坩埚',
    unit: '件',
    category: 'part',
    props: [
      { param: 'capacity', kind: 'range', min: 1, max: 5, unit: 'L' },
      { param: 'serviceTemp', kind: 'range', min: 1400, max: 1700, unit: '°C', dir: 'atLeast' },
      { param: 'purity', kind: 'range', min: 99, max: 99.9, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * **φ200 碗形/球面抛光模：碗口 70°、R 60–200 可车修。**
   *
   * 平盘在 69° 边缘上是线接触（接触弧长 → 0，去料峰值恰在边缘），所以本层的
   * 手抛只到 32.7°。碗形盘的 70° 碗口能贴住 69° 的边缘；同一只盘车成 R130.5
   * （非球面）、R87（参考球）、R60（Hindle 球）三种曲率。
   *
   * 口径 200 > 工件 150，边缘角 70 > 69；铸铁 HT250，碗壁 15 mm。
   */
  {
    id: 'std/bowl-lap-200',
    name: 'φ200 碗形/球面抛光模',
    unit: '件',
    category: 'part',
    props: [
      { param: 'aperture', kind: 'range', min: 0, max: 400, unit: 'mm', dir: 'atLeast' },
      { param: 'edgeAngle', kind: 'range', min: 30, max: 90, unit: '°', dir: 'atLeast' },
      { param: 'radius', kind: 'range', min: 0, max: 1000, unit: 'mm' },
      { param: 'surfaceFigure', kind: 'range', min: 0, max: 5000, unit: 'nm', dir: 'atMost' },
    ],
  },

  /**
   * **φ15 小磨头（5–20 mm 档）：铝柄 + 酚醛抛光层 + CeO₂。**
   *
   * 小磨头的去除函数直径 15 mm，配 5 轴机走螺旋/光栅；它修的是碗形盘够不到的
   * 中高频（2–25 mm 波段），最后 158 nm 的 PV 由它和离子束各收一遍。
   */
  {
    id: 'std/small-tool-15',
    name: 'φ15 小磨头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 5, max: 20, unit: 'mm' },
      { param: 'tipRadius', kind: 'range', min: 5, max: 50, unit: 'mm' },
    ],
  },

  /**
   * **玻璃压型机：600–900 °C、3–6 MPa、台面 300 mm。**
   *
   * 本层的 `plant/hot-press` 只到 220 °C（软钎焊），压不了 700–800 °C 的 LaSF
   * 毛坯；这一台是新增能力。台面 300 > φ175，压力 1,000 kN 对 φ175 的 3–6 MPa
   * （72–144 kN）有 7–14 倍余量。
   */
  {
    id: 'plant/glass-press',
    name: '玻璃压型机',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 600, max: 900 },
      { param: 'pressure', min: 3000, max: 6000 },
    ],
    props: [
      { param: 'platenSize', kind: 'range', min: 200, max: 400, unit: 'mm', dir: 'atLeast' },
      { param: 'force', kind: 'range', min: 500, max: 2000, unit: 'kN', dir: 'atLeast' },
    ],
  },

  /**
   * **五轴小磨头数控抛光机：5–200 mm 工具、5 轴、位置误差 ≤1 µm。**
   *
   * 一台机器带两种工具：φ200 碗形盘（粗抛/贴 69° 边）与 φ15 小磨头（修非球面）。
   * 抛光在 19–21 °C 恒温间做，温度由 `plant/metrology-room` 提供；本机**不写**
   * 温度 holds，否则"造它的时候也要 19–21 °C"会触发条件自举（`condition_cycle`）。
   */
  {
    id: 'plant/cnc-polisher-5axis',
    name: '五轴小磨头数控抛光机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'toolDiameter', kind: 'range', min: 5, max: 200, unit: 'mm' },
      { param: 'axisCount', kind: 'range', min: 3, max: 5, unit: '轴', dir: 'atLeast' },
      { param: 'positionError', kind: 'range', min: 0, max: 1, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * **φ175×120 镧火石毛坯，11.5 kg。**
   *
   * 14 kg 玻璃 → 压型（φ175×120，700–800 °C、3–6 MPa）→ 退火（620–680 °C，
   * 8 h 保温 + 24 h 缓冷）→ 线切/滚圆 → 粗磨 → 11.5 kg。
   *
   * 为什么 120 厚：n = 1.46 的双凸设计中心厚 111 mm、弧矢 51.5；n = 1.78 的
   * 双凸设计中心厚只有 55.4 mm。120 mm 同时盖住两种设计，也给夹持与粗磨留量。
   * 应力 ≤5 nm/cm（偏振光看条纹，1/4 波长片）。
   */
  {
    id: 'plant/null-test/blank-lasf-175x120',
    name: 'φ175×120 镧火石毛坯',
    unit: '件',
    category: 'part',
    props: [
      { param: 'aperture', kind: 'range', min: 0, max: 400, unit: 'mm', dir: 'atLeast' },
      { param: 'thickness', kind: 'range', min: 100, max: 150, unit: 'mm' },
      { param: 'nd', kind: 'range', min: 1.7, max: 1.85, unit: 'n_d' },
      { param: 'homogeneity', kind: 'range', min: -5, max: 5, unit: '10⁻⁶' },
      { param: 'stress', kind: 'range', min: 0, max: 5, unit: 'nm/cm', dir: 'atMost' },
    ],
  },

  /**
   * **φ160×10 熔石英 CGH 基板，透射波前 ≤5 nm。**
   *
   * 1.5 kg 石英砂 → 0.6 kg 基板；1,900–2,000 °C 熔 → 1,050–1,100 °C 退火 →
   * 线切 10 mm → 粗磨 → 小磨头抛光 → 离子束 5 nm。
   *
   * 工时：φ100 那块 550 h，按面积 ×(160/100)² = 2.56 → 1,408 → **1,400 h**。
   */
  {
    id: 'plant/null-test/cgh-blank-160',
    name: 'φ160×10 熔石英 CGH 基板',
    unit: '件',
    category: 'part',
    props: [
      { param: 'aperture', kind: 'range', min: 0, max: 400, unit: 'mm', dir: 'atLeast' },
      { param: 'thickness', kind: 'range', min: 6, max: 14, unit: 'mm' },
      { param: 'figure', kind: 'range', min: 0, max: 5, unit: 'nm', dir: 'atMost' },
    ],
  },

  /**
   * **φ160 会聚束 CGH（计算全息片）。**
   *
   *   aperture      160 mm（盖住 φ150 的瞳 + 5 mm 边）
   *   lineWidth     1–5 µm（φ160 上 32k–160k 条线；e-beam 100 nm 束斑写得出）
   *   etchDepth     158 nm = 633/4，λ/4 相位台阶（设计值；相位由线位置与台阶共同定）
   *   positionError 0.5–1 µm（0.5 是设计门；激光干涉闭环台 `plant/cgh-e-beam-writer`
   *                 的交货窗 0.5–1 µm，见 `data/machine/cgh-e-beam.ts`）
   *   wavefront     ≤50 nm（图样误差 + 基板 5 nm + 装调）
   *
   * 它把平面波变成 f/0.58 的非球面波前；放在会聚束的 φ160 处，Hindle 球就不用了。
   */
  {
    id: 'plant/null-test/cgh-160',
    name: 'φ160 会聚束 CGH',
    unit: '件',
    category: 'part',
    props: [
      { param: 'aperture', kind: 'range', min: 0, max: 400, unit: 'mm', dir: 'atLeast' },
      { param: 'lineWidth', kind: 'range', min: 0.5, max: 10, unit: 'µm', dir: 'atMost' },
      { param: 'etchDepth', kind: 'range', min: 100, max: 250, unit: 'nm' },
      { param: 'positionError', kind: 'range', min: 0, max: 1000, unit: 'nm', dir: 'atMost' },
      { param: 'wavefront', kind: 'range', min: 0, max: 50, unit: 'nm', dir: 'atMost' },
    ],
  },

  /**
   * **NA 0.86 参考球：R87、φ150、边缘 59.4°、矢高 43.0 mm、figure ≤50 nm。**
   *
   * 它放在非球面的焦点后面，把会聚束原路返回；NA = sin(asin(75/87)) = 0.862。
   * 虽然是球面，边缘 59.4° 仍然超过平盘手抛的 32.7°，所以用同一只碗形盘
   * （R87）+ φ15 小磨头；猫眼位在 λ/1000 平晶上标定，回波 = 2×球误差，
   * 标定后 10 nm（与 Hindle 球同一条读法）。
   */
  {
    id: 'plant/null-test/ref-sphere-na086',
    name: 'NA 0.86 参考球',
    unit: '件',
    category: 'part',
    props: [
      { param: 'aperture', kind: 'range', min: 0, max: 400, unit: 'mm', dir: 'atLeast' },
      { param: 'na', kind: 'range', min: 0.1, max: 1, unit: 'NA' },
      { param: 'radius', kind: 'range', min: 10, max: 1000, unit: 'mm' },
      { param: 'figure', kind: 'range', min: 0, max: 500, unit: 'nm', dir: 'atMost' },
    ],
  },

  /**
   * **Hindle 补偿球：R60、φ110、遮挡 48 %、figure 130 nm（λ/4）。**
   *
   * D_h = 1.724 × R_h = 103.4 → φ110；遮挡 = (103.4/150)² = 47.6 → 48 %。
   * 只剩 52 % 口径能验，边缘靠旋转对称外推；它是**降级档**，主路线是 φ160 CGH。
   * R60 是 48 % 那一档里最大的低遮挡半径（R70 → 65 %，R87 → 100 %）。
   */
  {
    id: 'plant/null-test/hindle-150',
    name: 'Hindle 补偿球',
    unit: '件',
    category: 'part',
    props: [
      { param: 'aperture', kind: 'range', min: 0, max: 400, unit: 'mm', dir: 'atLeast' },
      { param: 'radius', kind: 'range', min: 10, max: 500, unit: 'mm' },
      { param: 'figure', kind: 'range', min: 0, max: 500, unit: 'nm', dir: 'atMost' },
      { param: 'obscuration', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atMost' },
    ],
  },

];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线：稀土 → La₂O₃/CeO₂ → LaSF 玻璃 → 毛坯 → 非球面 → 检验
// ═══════════════════════════════════════════════════════════════════════════

const ASPHERE_ROUTE_LIST: Route[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 2.1 稀土精矿：尾矿 500 kg → 1 kg（15 % REO）
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **稀土精矿：500 kg 铁尾矿 → 1 kg 15 % REO 精矿。**
     *
     * 尾矿 REO 300 ppm（设计值，Earth 工程值）→ 500 kg 含 0.15 kg REO →
     * 浮选富集 500:1 到 15 %。浮选药剂 0.05 kg（捕收剂 + 起泡剂，`make/flotation-reagent`）。
     *
     * 48 h：500 kg 矿浆在 100–200 kPa 下粗选 + 扫选 + 精选三遍。
     */
    id: 'make/ree-concentrate',
    name: '稀土精矿制备',
    rate: { hours: q(48) },
    produces: [
      {
        item: 'mat/ree-concentrate',
        qty: q(1),
        gives: [{ param: 'reo', kind: 'range', min: 15, max: 18 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/tailings', qty: q(500) }] },
      { anyOf: [{ item: 'mat/flotation-reagent', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(100) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/ore-beneficiary',
    under: [{ param: 'pressure', min: 100, max: 200 }],
    unbalanced_zh:
      '尾矿 500 + 浮选药剂 0.05 + 水 100 = 600.05 → 精矿 1 kg（15 % REO = 0.15 kg）；余 599.05 = 返回尾矿 499（500 − 1 kg 精矿）+ 水 100（全走）+ 药剂 0.05（吸附在尾矿上）；校核 500 + 0.05 + 100 − 1 = 599.05 ✓。尾矿的 REO 300 ppm 是设计值（Earth 工程值），不是本层实测。',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.2 La₂O₃ + CeO₂：26.7 kg 精矿 → 1 kg La₂O₃ + 2 kg CeO₂
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **La₂O₃ 1 kg + CeO₂ 2 kg（联产）。**
     *
     * 26.7 kg 精矿 × 15 % REO = 4.0 kg REO；La 25 % → 1 kg La₂O₃，Ce 50 % → 2 kg CeO₂。
     *
     *   500–600 °C 焙烧   把 Ce³⁺ 氧化成 CeO₂（不溶于 HCl），La 仍可溶
     *   60–90 °C HCl 浸出  La/Pr/Nd 进液，CeO₂ 进渣
     *   70–90 °C NaOH 沉淀 La(OH)₃，过滤
     *   900–1000 °C 灼烧   La₂O₃；CeO₂ 渣洗涤、干燥、气流磨到 0.5–3 µm
     *
     * 120 h（含焙烧 24 h、浸出 24 h、沉淀/过滤 24 h、灼烧 24 h、粉碎/分级 24 h）。
     */
    id: 'make/lanthanum-oxide',
    name: '氧化镧制备',
    rate: { hours: q(120) },
    produces: [
      {
        item: 'mat/lanthanum-oxide',
        qty: q(1),
        gives: [{ param: 'purity', kind: 'range', min: 99.5, max: 99.9 }],
      },
      {
        item: 'mat/cerium-oxide',
        qty: q(2),
        gives: [
          { param: 'purity', kind: 'range', min: 95, max: 99 },
          { param: 'particleSize', kind: 'range', min: 0.5, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ree-concentrate', qty: q(267, 10) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(10) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(50) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh:
          '焙烧 500–600 °C、4 h：Ce³⁺ → Ce⁴⁺（CeO₂ 不溶于 HCl），La 保持可溶；料层 20 mm，翻料两次',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 500, max: 600 }],
      },
      {
        note_zh:
          'HCl 浸出 60–90 °C、2 h、100–200 kPa：26.7 kg 精矿用 10 kg 30–33 % 盐酸；La 浸出率 95 %，Ce 留在渣里',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 60, max: 90 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
      {
        note_zh:
          '过滤 + NaOH 沉淀 La(OH)₃：70–90 °C、pH 8–9；La 与 Nd/Pr 共沉淀，CeO₂ 渣另洗',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 70, max: 90 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
      {
        note_zh:
          '灼烧 900–1000 °C、4 h：La(OH)₃ → La₂O₃；CeO₂ 渣同炉干燥，气流磨到 0.5–3 µm 抛光粉',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 900, max: 1000 }],
      },
      {
        note_zh: '粉碎/分级：CeO₂ 气流磨 0.5–3 µm；La₂O₃ 过 200 目，避免粗颗粒在玻璃里留未熔点',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '检验：La₂O₃ 纯度 99.5 %（EDTA 滴定 / 光谱半定量），CeO₂ 粒度 0.5–3 µm（沉降法）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '精矿 26.7 + HCl 10 + NaOH 2 + 水 50 = 88.7 → La₂O₃ 1 + CeO₂ 2 = 3；余 85.7 = 其他 REE（Nd/Pr/Sm）1.0 + 脉石 22.7（26.7 − 4.0 REO）+ HCl 10（中和成 NaCl）+ NaOH 2 + 水 50；校核 3 + 85.7 = 88.7 ✓。其他 REE 留在母液，未立条目；这是设计值（Earth 工程值），不是实测。',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.3 光学级 BaCO₃：技术级 1.2 kg → 光学级 1 kg
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **BaCO₃ 重结晶：技术级 92–96 % → 光学级 99.5 %。**
     *
     * 1.2 kg 技术级 + 2 kg 水 → 1 kg 光学级；0.2 kg 杂质进母液，2 kg 水全走。
     * 24 h：90–100 °C 溶解 → 过滤 → 20–30 °C 重结晶 → 200–300 °C 干燥 → 粉碎。
     */
    id: 'make/barium-carbonate-optical',
    name: 'BaCO₃ 重结晶',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'mat/barium-carbonate-optical',
        qty: q(1),
        gives: [{ param: 'purity', kind: 'range', min: 99.5, max: 99.9 }],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/barium-carbonate',
            qty: q(6, 5),
            need: [{ param: 'purity', kind: 'range', min: 92, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh:
          '溶解 90–100 °C：1.2 kg 技术级 BaCO₃ 溶于 2 kg 水（浓度 37 %），趁热过滤掉 Fe/Sr 残渣',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 90, max: 100 }],
      },
      {
        note_zh: '过滤：趁热抽滤，滤液清亮；滤渣 0.2 kg 是 Fe/Sr 与不溶物',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '重结晶 20–30 °C、12 h：降温结晶，晶体 0.2–0.5 mm；母液返回下一批',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 30 }],
      },
      {
        note_zh: '干燥 200–300 °C、4 h：去结晶水与游离水；含水 <0.1 % 才不会在玻璃里爆沸',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 200, max: 300 }],
      },
      {
        note_zh: '粉碎过 100 目；检验纯度 99.5 %（EDTA 滴定）',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '称量/留样：每批 1 kg，水分与纯度双签',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'BaCO₃（技术级）1.2 + 水 2 = 3.2 → 光学级 1 kg；余 2.2 = 杂质 0.2（Fe/Sr/不溶物，进母液）+ 水 2（全走）；校核 3.2 = 1 + 2.2 ✓。',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.4 LaSF 玻璃：88.65 kg 氧化物 → 84 kg 玻璃（8 只 3 L 坩埚）
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **LaSF 玻璃 84 kg：1,300–1,450 °C 熔制 / 1,350–1,400 °C 均化 / 620–680 °C 退火。**
     *
     * 配料（氧化物计，8 只 3 L 坩埚，每只 10.5 kg 玻璃）：
     *   La₂O₃ 30 + B₂O₃ 15 + SiO₂ 25（石英砂）+ BaO 11.65（15 kg BaCO₃）
     *   + ZrO₂ 3 = 84.65 kg；再加坩埚蚀薄 4 kg SiO₂ → 88.65 kg → 84 kg 玻璃；
     *   4.65 kg 挥发/skull。
     * 另加：氩 0.5 kg（鼓泡均化）、碳模 0.5 kg。
     *
     * 216 h：8 炉 × 24 h（配料/熔制/均化/浇注）+ 退火 24 h。
     *
     * 为什么 1,300–1,450 °C：La₂O₃-B₂O₃-SiO₂ 的液相线约 1,250 °C，1,450 °C 过热带
     * 150–200 K，黏度 3–5 Pa·s，气泡能浮起来；再高 B₂O₃ 挥发加快（每 100 K 约 ×2）。
     * 为什么用熔石英坩埚：当时铂 0 条目；现在有海绵 Pt（`pgm.ts`），但铂坩埚
     * 未建；Al₂O₃ 瓷坩埚在 1,400 °C 会被 La₂O₃ 侵蚀，
     * 把 Al 带进玻璃（0.1–0.3 %），折射率均匀性掉到 ±2e-5；熔石英的 SiO₂ 是配料本身，
     * 8 只各蚀薄 0.5 kg/批，共 4 kg，只动 SiO₂ 的 14 %。
     */
    id: 'make/lasf-glass',
    name: 'LaSF 玻璃制备',
    rate: { hours: q(216) },
    produces: [
      {
        item: 'mat/lasf-glass',
        qty: q(84),
        gives: [
          { param: 'nd', kind: 'range', min: 1.7, max: 1.85 },
          { param: 'homogeneity', kind: 'range', min: -5, max: 5 },
          { param: 'stress', kind: 'range', min: 0, max: 5 },
          { param: 'transmission', kind: 'range', min: 95, max: 100 },
        ],
      },
      { item: 'mat/co2', qty: q(67, 20) },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/lanthanum-oxide',
            qty: q(30),
            need: [{ param: 'purity', kind: 'range', min: 99.5, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/boron-oxide',
            qty: q(15),
            need: [{ param: 'purity', kind: 'range', min: 99, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/quartz-pure',
            qty: q(25),
            need: [{ param: 'sio2', kind: 'range', min: 99, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/barium-carbonate-optical',
            qty: q(15),
            need: [{ param: 'purity', kind: 'range', min: 99.5, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/zirconia',
            qty: q(3),
            need: [{ param: 'purity', kind: 'range', min: 99, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(4) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 2) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/refractometer',
      'plant/interferometer',
      'std/crucible-quartz-3l',
      'plant/glass-press',
    ],
    steps: [
      {
        note_zh:
          '配料/混合 19–21 °C：La₂O₃ 30 + B₂O₃ 15 + 石英砂 25 + BaCO₃ 15 + ZrO₂ 3；球磨 2 h 过 100 目；配合料经 glass-press 700 °C 预压成 φ50 块，减少坩埚架桥',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '熔制 1,300–1,450 °C、8 炉 × 24 h：8 只 3 L 坩埚各装 10.5 kg 配合料（共 84 kg 玻璃）；1,300 °C 化料，1,450 °C 澄清，每炉独立控温',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 1300, max: 1450 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh:
          '均化 1,350–1,400 °C、12 h：氩 0.5 kg 鼓泡（φ2 mm 喷嘴，2 L/min）+ 每 2 h 翻转坩埚；均匀性 ±5e-6 的目标',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 1350, max: 1400 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh:
          '浇注 800–900 °C：每炉 10.5 kg 倒入预热 700 °C 的碳模，共 8 块；模壁涂 0.1 mm 炭黑，脱模不粘',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 800, max: 900 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh:
          '退火 620–680 °C、8 h 保温 + 24 h 缓冷到 50 °C：应力 ≤5 nm/cm；退火点附近每 10 K 的黏度变化决定冷却速率',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 620, max: 680 }],
      },
      {
        note_zh:
          '检验：n_d 1.78（V 棱镜折射仪，19–21 °C）、均匀性 ±5e-6（干涉仪看条纹）、应力 ≤5 nm/cm（偏振光 + 1/4 波片）、内透 ≥95 %/cm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'La₂O₃ 30 + B₂O₃ 15 + 石英砂 25 + BaCO₃ 15 + ZrO₂ 3 + 坩埚蚀薄 4 + 氩 0.5 + 碳模 0.5 = 93.0 → 玻璃 84 + CO₂ 3.35（15 kg BaCO₃ × 44.01/197.34）；余 5.65 = 氧化物挥发/skull 4.65（88.65 kg 氧化物 − 84 kg 玻璃）+ 氩 0.5 + 碳模 0.5；校核 84 + 3.35 + 5.65 = 93.0 ✓。玻璃组成（wt%，按 88.65 kg 氧化物）La₂O₃ 33.8 / B₂O₃ 16.9 / SiO₂ 32.7 / BaO 13.1 / ZrO₂ 3.4。以上均为设计值（Earth 工程值）。',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.5 石英坩埚：7 kg 石英砂 → 4 kg 坩埚
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **φ160×160 熔石英坩埚 3 L：7 kg 石英砂 → 4 kg 坩埚。**
     *
     * 1,900–2,000 °C 弧炉熔融 → 吹/模成（壁 8 mm）→ 1,050–1,100 °C 退火 →
     * 磨口 → 检验。12 h。每只 10–15 批，玻璃路线按 0.5 kg/批蚀薄。
     */
    id: 'make/crucible-quartz-3l',
    name: 'φ160×160 熔石英坩埚制造',
    rate: { hours: q(12) },
    produces: [
      {
        item: 'std/crucible-quartz-3l',
        qty: q(1),
        gives: [
          { param: 'capacity', kind: 'range', min: 3, max: 3 },
          { param: 'serviceTemp', kind: 'range', min: 1600, max: 1600 },
          { param: 'purity', kind: 'range', min: 99.5, max: 99.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(7) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 50) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh:
          '弧炉熔融 1,900–2,000 °C：7 kg 石英砂在石墨模里熔成 φ180×180 的锭；石英软化点 1,713，只有弧炉到得了',
        performedBy: 'plant/arc-furnace',
        under: [{ param: 'temperature', min: 1900, max: 2000 }],
      },
      {
        note_zh:
          '吹/模成 19–21 °C：石墨内模 + 压缩空气吹成 3 L 碗形，壁 8 mm、底 12 mm；φ160 口',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '退火 1,050–1,100 °C、2 h + 12 h 缓冷：熔石英的退火点 1,140，1,050 以下才不析晶',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 1050, max: 1100 }],
      },
      {
        note_zh: '磨口/磨底：口部平度 0.1 mm，底厚 12±0.5；HF 5 % 洗 30 s 去表面析晶层',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '检验：容量 3 L（灌水法）、耐温 1,600 °C（设计值）、纯度 99.5 %；查气泡与析晶',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '石英砂 7 + 尾矿 2 + 水 5 + HF 0.02 = 14.02 → 坩埚 1 件（4 kg）；余 10.02 = 玻璃屑 3（7 kg 砂 → 4 kg 坩埚）+ 尾矿 2 + 水 5 + HF 0.02；校核 4 + 10.02 = 14.02 ✓。',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.6 碗形盘：8 kg 铸铁 → φ200/70° 碗形模
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **φ200 碗形盘：8 kg HT250 → 7 kg 成品。**
     *
     * 1,350–1,450 °C 浇成 φ210×60 的碗坯 → 车 R 与 70° 碗口 → 磨 → 检验。
     * 24 h。R 60–200 按工件车修：非球面 R130.5、参考球 R87、Hindle R60。
     */
    id: 'make/bowl-lap-200',
    name: 'φ200 碗形/球面抛光模制造',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'std/bowl-lap-200',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 200, max: 200 },
          { param: 'edgeAngle', kind: 'range', min: 70, max: 70 },
          { param: 'radius', kind: 'range', min: 60, max: 200 },
          { param: 'surfaceFigure', kind: 'range', min: 2000, max: 2000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(8) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '浇注 1,350–1,450 °C：φ210×60 碗坯，铸铁 HT250，壁 15 mm',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1350, max: 1450 }],
      },
      {
        note_zh:
          '车削：车 R130.5 / R87 / R60 三种曲率之一，碗口 70°；同轴度 0.02，碗口对回转轴跳动 0.01',
        performedBy: 'lathe',
      },
      {
        note_zh: '磨削：W40 尾矿粉对研，碗面 PV ≤2 µm；碗口 70°±0.1°',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '检验：口径 200、边缘角 70°（投影仪）、R 用球径仪反算（弦长 180）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'HT250 8 + 尾矿 2 + 水 5 = 15 → 碗形盘 1 件（7 kg）；余 8 = 浇冒口/切屑 1 + 尾矿 2 + 水 5；校核 7 + 8 = 15 ✓。',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.7 小磨头：0.35 kg 料 → φ15 磨头
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **φ15 小磨头：0.35 kg 料 → 0.2 kg 成品。**
     *
     * 铝柄（0.2 kg）+ 酚醛抛光层（0.1 kg）+ CeO₂（0.05 kg）；8 h。
     */
    id: 'make/small-tool-15',
    name: 'φ15 小磨头制造',
    rate: { hours: q(8) },
    produces: [
      {
        item: 'std/small-tool-15',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 15, max: 15 },
          { param: 'tipRadius', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/cerium-oxide', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '车铝柄：φ15×40，端面 R10 球窝，同轴 0.01',
        performedBy: 'lathe',
      },
      {
        note_zh: '浇注抛光层 19–21 °C：酚醛 0.1 kg + CeO₂ 0.05 kg 混匀，灌入球窝，固化 4 h',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '磨出头形：R10 球头，直径 15±0.1；抛光层厚度 3 mm',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '检验：直径 15、R10、同轴 0.01；按压 10 N 不变形',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '铝 0.2 + 酚醛 0.1 + CeO₂ 0.05 = 0.35 → 磨头 1 件（0.2 kg）；余 0.15 = 铝屑 0.05 + 酚醛固化收缩 0.05 + CeO₂ 0.05；校核 0.2 + 0.15 = 0.35 ✓。',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.8 玻璃压型机：180 kg 铁 + 40 kg 钢 + 25 kg 耐火 → 1 台
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **玻璃压型机：600–900 °C、3–6 MPa、台面 300 mm。**
     *
     * 铁 180 + 钢 40 + 耐火 25 + 铜线 3 + 铝 5 + 尾矿 5 + 水 20 = 278 kg →
     * 1 台（约 230 kg）；余 48 = 切屑/浇冒口 28 + 水 20。
     * 160 h：浇架 60 h + 加工 60 h + 装 24 h + 试 16 h。
     */
    id: 'make/glass-press',
    name: '玻璃压型机制造',
    rate: { hours: q(160) },
    produces: [
      {
        item: 'plant/glass-press',
        qty: q(1),
        gives: [
          { param: 'platenSize', kind: 'range', min: 300, max: 300 },
          { param: 'force', kind: 'range', min: 1000, max: 1000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(1) }] },
      // SMT 主路保持通用板；OR 备路：手工焊（0603/0805、≥0.5 mm，良率 95–99%，30 h = SMT 6×）
      {
        anyOf: [
          { item: 'std/control-board-general', qty: q(1) },
          { item: 'std/control-board-simple-manual-general', qty: q(1) },
        ],
      },
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(180) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(40) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(25) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(3) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(5) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    needs: ['plant/metrology-room', 'plant/interferometer', 'plant/cnc-polisher-5axis'],
    steps: [
      {
        note_zh: '浇机架 1,350–1,450 °C：HT250 180 kg，立柱 + 上横梁 + 底座；壁 30 mm，筋板防颤',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1350, max: 1450 }],
      },
      {
        note_zh: '磨立柱/横梁结合面：平面度 0.05/300，平行度 0.1；导轨面 Ra 0.8',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '车油缸/压杆：φ120 缸筒，配合 H8/f7；行程 300 mm',
        performedBy: 'lathe',
      },
      {
        note_zh: '装配 19–21 °C：立柱 + 横梁 + 油缸 + 加热板 + 控制板；台面 300×300，加热功率 30 kW',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '试压：3–6 MPa 保压 30 min，台面 700 °C 均温 ±10 K；台面先用 cnc-polisher 抛到 0.005/300，再压 φ175 玻璃板试片',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '铁 180 + 钢 40 + 耐火 25 + 铜线 3 + 铝 5 + 尾矿 5 + 水 20 = 278 → 压机 1 台（约 230 kg）；余 48 = 浇冒口/切屑/磨屑 28 + 水 20；校核 230 + 48 = 278 ✓。',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.9 五轴小磨头数控抛光机：300 kg 铁 + 40 kg 钢 → 1 台
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **五轴小磨头数控抛光机：5–200 mm 工具、5 轴、位置误差 ≤1 µm。**
     *
     * 铁 300 + 钢 40 + 铜线 4 + 铝 10 + 尾矿 10 + 水 30 = 394 kg → 1 台（约 330 kg）；
     * 余 64 = 切屑/浇冒口 34 + 水 30。240 h。
     */
    id: 'make/cnc-polisher-5axis',
    name: '五轴小磨头数控抛光机制造',
    rate: { hours: q(240) },
    produces: [
      {
        item: 'plant/cnc-polisher-5axis',
        qty: q(1),
        gives: [
          { param: 'toolDiameter', kind: 'range', min: 5, max: 200 },
          { param: 'axisCount', kind: 'range', min: 5, max: 5 },
          { param: 'positionError', kind: 'range', min: 1, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(3) }] },
      { anyOf: [{ item: 'std/bearing-spindle-p5', qty: q(2) }] },
      { anyOf: [{ item: 'std/bearing-crossed-roller-p5', qty: q(2) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/process-controller-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(300) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(40) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(4) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(10) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(30) }] },
    ],
    needs: ['plant/metrology-room', 'plant/interferometer', 'plant/laser-stage'],
    steps: [
      {
        note_zh: '浇底座/立柱 1,350–1,450 °C：HT250 300 kg，底座 800×600×200，立柱 300×300×700',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1350, max: 1450 }],
      },
      {
        note_zh: '磨导轨面：直线度 0.01/500，平面度 0.005/300；刮研 12 点/25×25',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '车/铣轴系：B 轴摆头 + C 轴转台，φ120 主轴，跳动 ≤1 µm',
        performedBy: 'lathe',
      },
      {
        note_zh: '装配 19–21 °C：3 台 7.5 kW 电机 + 4 套 P5 轴承 + 控制板 + 过程控制器；5 轴（X/Y/Z/B/C）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '标定：激光干涉仪测 5 轴位置误差 ≤1 µm，重复性 ≤0.5 µm；带 φ200 碗形盘与 φ15 小磨头各跑一遍',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '铁 300 + 钢 40 + 铜线 4 + 铝 10 + 尾矿 10 + 水 30 = 394 → 抛光机 1 台（约 330 kg）；余 64 = 切屑/浇冒口 34 + 水 30；校核 330 + 64 = 394 ✓。',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.10 毛坯 φ175×120：14 kg 玻璃 → 11.5 kg
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **φ175×120 镧火石毛坯：14 kg 玻璃 → 11.5 kg。**
     *
     * 压型 700–800 °C、3–6 MPa（`plant/glass-press`）→ 退火 620–680 °C →
     * 线切/滚圆（φ175）→ 粗磨（厚 120±0.2、平行 0.05）→ 检验（应力 ≤5 nm/cm）。
     * 96 h。
     *
     * kg 账：14 kg 玻璃 → 11.5 kg 毛坯（82 % 实收）；2.5 kg 是切缝、外圆与两面余量。
     * 11.5 kg = π×8.75²×12 cm³ × 4.0 g/cm³ = 11.55 kg（设计密度 4.0）。
     */
    id: 'make/blank-lasf-175x120',
    name: 'φ175×120 镧火石毛坯制造',
    rate: { hours: q(96) },
    produces: [
      {
        item: 'plant/null-test/blank-lasf-175x120',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 175, max: 175 },
          { param: 'thickness', kind: 'range', min: 120, max: 120 },
          { param: 'nd', kind: 'range', min: 1.77, max: 1.79 },
          { param: 'homogeneity', kind: 'range', min: -5, max: 5 },
          { param: 'stress', kind: 'range', min: 0, max: 5 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/lasf-glass',
            qty: q(14),
            need: [
              { param: 'nd', kind: 'range', min: 1.77, max: 1.79 },
              { param: 'homogeneity', kind: 'range', max: 5, dir: 'atMost' },
              { param: 'stress', kind: 'range', max: 5, dir: 'atMost' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/cerium-oxide', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 50) }] },
    ],
    needs: ['plant/metrology-room', 'plant/interferometer'],
    steps: [
      {
        note_zh:
          '压型 700–800 °C、3–6 MPa：14 kg 玻璃块在 φ180 石墨模里压成 φ175×125 的饼；保压 10 min，模温 700 °C',
        performedBy: 'plant/glass-press',
        under: [
          { param: 'temperature', min: 700, max: 800 },
          { param: 'pressure', min: 3000, max: 6000 },
        ],
      },
      {
        note_zh:
          '退火 620–680 °C、8 h + 24 h 缓冷：应力 ≤5 nm/cm；LaSF 的退火点约 640 °C，冷速 10 K/h 到 500 °C 以下',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 620, max: 680 }],
      },
      {
        note_zh: '线锯切/滚圆：φ180 → φ175，厚 125 → 120（切缝 0.6 + 两面各 2 mm 研磨余量）',
        performedBy: 'plant/wire-saw',
      },
      {
        note_zh: '粗磨：厚 120±0.2、平行度 0.05、外圆 φ175±0.1；两面 Ra 0.4，去 2 mm 余量',
        performedBy: 'plant/grinder',
      },
      {
        note_zh:
          '检验 19–21 °C：应力 ≤5 nm/cm（偏振光 + 1/4 波片，读 1/4 条纹 = 3 nm/cm）、厚度/平行度（千分表 + 量块）、n_d 抽检',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '玻璃 14 + CeO₂ 0.2 + 尾矿 5 + 水 10 + HF 0.02 = 29.22 → 毛坯 1 件 11.5 kg；余 17.72 = 玻璃屑 2.5（切缝/外圆/两面）+ CeO₂ 0.2 + 尾矿 5 + 水 10 + HF 0.02；校核 11.5 + 17.72 = 29.22 ✓。',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.11 CGH 基板 φ160×10：1.5 kg 石英 → 0.6 kg
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **φ160×10 熔石英 CGH 基板：1.5 kg 石英 → 0.6 kg。**
     *
     * 1,900–2,000 °C 熔 → 1,050–1,100 °C 退火 → 线切 10 mm → 粗磨 →
     * 五轴小磨头抛光（19–21 °C）→ 离子束 5 nm → 检验。1,400 h。
     * 1,400 h = φ100 那块 550 h × (160/100)² = 1,408 取整；面积是 2.56 倍。
     */
    id: 'make/cgh-blank-160',
    name: 'φ160×10 熔石英 CGH 基板制造',
    rate: { hours: q(1400) },
    produces: [
      {
        item: 'plant/null-test/cgh-blank-160',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 160, max: 160 },
          { param: 'thickness', kind: 'range', min: 10, max: 10 },
          { param: 'figure', kind: 'range', min: 5, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(3, 2) }] },
      { anyOf: [{ item: 'mat/cerium-oxide', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(8) }] },
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 20) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/interferometer',
      'plant/ref-flat-interferometer',
      'std/small-tool-15',
    ],
    steps: [
      {
        note_zh:
          '熔制 1,900–2,000 °C：1.5 kg 石英砂在弧炉里熔成 φ180×20 的板，浇在石墨模里（石英软化点 1,713）',
        performedBy: 'plant/arc-furnace',
        under: [{ param: 'temperature', min: 1900, max: 2000 }],
      },
      {
        note_zh:
          '退火 1,050–1,100 °C、2 h + 12 h 缓冷：残余应力 <1 MPa；φ160 的径向梯度比 φ100 大，冷速取 8 K/h',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 1050, max: 1100 }],
      },
      {
        note_zh: '线切 20 → 11.5（切缝 0.6 + 两面各 0.45 研磨余量），再磨到 10.2',
        performedBy: 'plant/wire-saw',
      },
      {
        note_zh: '粗磨：厚 10.2、平行 0.02、Ra 0.2；外圆 φ160±0.1',
        performedBy: 'plant/grinder',
      },
      {
        note_zh:
          '小磨头抛光 19–21 °C：φ15 小磨头 + CeO₂ 浆，走螺旋，PV 从 3 µm 到 50 nm；恒温 1 K 的漂移在 100 h 里推 20 nm',
        performedBy: 'plant/cnc-polisher-5axis',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '离子束 0.05–0.5 Pa：12–25 mm 束斑、两遍，50 → 5 nm；每遍剩 20 %，2 000 → 400 → 80 → 16 → 3 nm（保守取 5 nm）',
        performedBy: 'plant/ion-beam-figuring',
        under: [{ param: 'pressure', min: 0.05, max: 0.5 }],
      },
      {
        note_zh:
          '检验 19–21 °C：λ/1000 平晶 + 八帧移相（0.47 nm），透射波前 ≤5 nm；口径 160、厚 10',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '石英砂 1.5 + CeO₂ 0.2 + 尾矿 8 + 水 20 + HF 0.05 = 29.75 → 基板 1 件 0.6 kg；余 29.15 = 玻璃屑 0.9（1.5 → 0.6）+ CeO₂ 0.2 + 尾矿 8 + 水 20 + HF 0.05；校核 0.6 + 29.15 = 29.75 ✓。',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.12 φ160 CGH：e-beam 写 → 显影 → 石英 RIE 158 nm
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **φ160 会聚束 CGH：e-beam 直写 → 显影 → 石英 RIE 158 nm。**
     *
     * 线宽 1–5 µm：φ160 上 32k–160k 条线；e-beam 100 nm 束斑、**0.5–1 µm 位置误差**
     * （激光干涉闭环台 `plant/cgh-e-beam-writer`，见 `data/machine/cgh-e-beam.ts`）。
     * 刻蚀 158 nm = 633/4，λ/4 相位台阶（设计值；按空气程计）。
     * 48 h：甩胶 1 h + 蒸 KCl 0.1 h + 写 30 h + 显影 2 h + RIE 3 h + 去胶 2 h
     * + 检验 10 h（0.1 h 并入涂胶步，总时长不变）。
     *
     * 为什么不是铬版：本层没有纯铬（`mat/chromium` 0 命中），铬铁带碳 0.61 %，
     * 蒸 100 nm 也做不出低缺陷的振幅版；石英相位版的相位由线位置与台阶定，
     * 不需要铬。铬版作为降级项留在缺口表里，不影响这条链。
     */
    id: 'make/null-test-cgh-160',
    name: 'φ160 会聚束 CGH 制造',
    rate: { hours: q(48) },
    produces: [
      {
        item: 'plant/null-test/cgh-160',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 160, max: 160 },
          { param: 'lineWidth', kind: 'range', min: 1, max: 5 },
          { param: 'etchDepth', kind: 'range', min: 158, max: 158 },
          { param: 'positionError', kind: 'range', min: 500, max: 1000 },
          { param: 'wavefront', kind: 'range', min: 50, max: 50 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/null-test/cgh-blank-160',
            qty: q(1),
            need: [
              { param: 'aperture', kind: 'range', min: 160, dir: 'atLeast' },
              { param: 'thickness', kind: 'range', min: 10, max: 10 },
              { param: 'figure', kind: 'range', max: 5, dir: 'atMost' },
            ],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/potassium-chloride', qty: q(1, 500000) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/cf4', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room', 'plant/interferometer', 'plant/ref-flat-interferometer', 'plant/comparator', { item: 'plant/cgh-e-beam-writer', qty: q(1), need: [{ param: 'positionError', kind: 'range', max: 1000, dir: 'atMost' }, { param: 'spotSize', kind: 'range', max: 100, dir: 'atMost' }], onRelax: 'functional-kept' }],
    steps: [
      {
        note_zh:
          '甩胶 19–21 °C：重铬酸盐-酚醛负胶，3 000 rpm、0.5 µm 厚；胶要过滤 0.2 µm，颗粒是 CGH 的头号缺陷',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '电荷泄放层：蒸 20–50 nm KCl（片阻 1e6–1e9 Ω/sq），把石英表面电位放到 <1 V；写完全片浸水 30 s 溶掉（不碰胶、不碰石英）',
        performedBy: 'plant/cgh-e-beam-writer',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh:
          'e-beam 直写 1e-5–1e-3 Pa、19–21 °C：100 nm 束斑、20 keV、0.5–1 µm 位置误差（激光干涉闭环台）；φ160 写 30 h（32k–160k 条线）',
        performedBy: 'plant/cgh-e-beam-writer',
        under: [
          { param: 'pressure', min: 0.00001, max: 0.001 },
          { param: 'temperature', min: 19, max: 21 },
        ],
      },
      {
        note_zh: '显影 20–40 °C：碱水显影 60 s，去离子水冲 30 s；线宽 1–5 µm，侧壁 80°',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 40 }],
      },
      {
        note_zh:
          '石英 RIE 0.1–10 Pa、15–80 °C：CF₄/Ar 刻 158 nm（λ/4 @633 nm 的相位台阶；设计值），各向异性 85°，侧壁 1 µm 线不塌',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'pressure', min: 0.1, max: 10 },
          { param: 'temperature', min: 15, max: 80 },
        ],
      },
      {
        note_zh: '去胶 20–60 °C：O₂ 等离子 + 碱水，胶残留 <10 nm；不能用 HF，会把 158 nm 台阶咬圆',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 60 }],
      },
      {
        note_zh:
          '检验 19–21 °C：线宽 1–5 µm（comparator，1 µm 分划）、位置误差 ≤0.5 µm（写场拼接 + 台标定）、台阶 158±10 nm（台阶仪）、波前 ≤50 nm（λ/1000 平晶）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '基板 1 件（0.6 kg）+ 胶 0.002 + HF 0.001 + CF₄ 0.002 + Ar 0.002 + 水 2 = 2.607 kg → CGH 1 件（0.6 kg）；余 2.007 = 水 2（显影/冲洗废液）+ 胶/酸/气 0.007（挥发/废液）；校核 0.6 + 2.007 = 2.607 ✓。',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.13 NA 0.86 参考球：5 kg 石英 → R87 球面镜
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **NA 0.86 参考球：R87、φ150、figure ≤50 nm。**
     *
     * 5 kg 石英砂 → 1.5 kg 镜坯；弧炉熔 → 退火 → 车 R87（矢高 43.0）→
     * 碗形盘 R87 粗抛 → φ15 小磨头 + 离子束到 50 nm → 猫眼标定 10 nm。
     * 220 h。
     *
     * NA = sin(asin(75/87)) = 0.862；边缘法线 59.4°，平盘贴不出，所以用同一套
     * 碗形盘/小磨头 —— 它不是非球面，但陡边抛光是同一条工艺。
     */
    id: 'make/ref-sphere-na086',
    name: 'NA 0.86 参考球制造',
    rate: { hours: q(220) },
    produces: [
      {
        item: 'plant/null-test/ref-sphere-na086',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 150, max: 150 },
          { param: 'na', kind: 'range', min: 0.86, max: 0.86 },
          { param: 'radius', kind: 'range', min: 87, max: 87 },
          { param: 'figure', kind: 'range', min: 50, max: 50 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(5) }] },
      { anyOf: [{ item: 'mat/cerium-oxide', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(12) }] },
      { anyOf: [{ item: 'mat/water', qty: q(15) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(3, 100) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/interferometer',
      'plant/ref-flat-interferometer',
      'std/bowl-lap-200',
      'std/small-tool-15',
    ],
    steps: [
      {
        note_zh: '熔制 1,900–2,000 °C：φ170×70 石英饼，浇石墨模',
        performedBy: 'plant/arc-furnace',
        under: [{ param: 'temperature', min: 1900, max: 2000 }],
      },
      {
        note_zh: '退火 1,050–1,100 °C、2 h + 12 h 缓冷',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 1050, max: 1100 }],
      },
      {
        note_zh: '车 R87：弦长 150、矢高 43.0；边缘留 8 mm 厚，背面平；同轴 0.02',
        performedBy: 'lathe',
      },
      {
        note_zh:
          '碗形盘粗抛 19–21 °C：φ200 碗形盘车成 R87，70° 碗口贴 59.4° 边缘；CeO₂ 浆，PV 从 3 µm 到 150 nm',
        performedBy: 'plant/cnc-polisher-5axis',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '小磨头 + 离子束：φ15 小磨头修中频，离子束 0.05–0.5 Pa 两遍到 50 nm；每遍剩 20 %',
        performedBy: 'plant/ion-beam-figuring',
        under: [{ param: 'pressure', min: 0.05, max: 0.5 }],
      },
      {
        note_zh:
          '猫眼标定 19–21 °C：焦点打在 λ/1000 平晶上，回波 = 2×球误差；读 0.52 nm，标定后 10 nm（λ/50 @633）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '石英砂 5 + CeO₂ 0.3 + 尾矿 12 + 水 15 + HF 0.03 = 32.33 → 参考球 1 件 1.5 kg；余 30.83 = 玻璃屑 3.5 + CeO₂ 0.3 + 尾矿 12 + 水 15 + HF 0.03；校核 1.5 + 30.83 = 32.33 ✓。',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.14 Hindle 球：3 kg 石英 → R60/φ110、遮挡 48 %
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **Hindle 补偿球：R60、φ110、遮挡 48 %、figure 130 nm。**
     *
     * D_h = 1.724 × 60 = 103.4 → φ110；遮挡 = (103.4/150)² = 47.6 → 48 %。
     * 3 kg 石英砂 → 1 kg 镜坯；180 h。它只验 52 % 口径，是降级档；
     * R70 遮挡 65 %、R87 遮挡 100 %，所以 48 % 是这条设计能拿到的最低遮挡。
     */
    id: 'make/hindle-150',
    name: 'Hindle 补偿球制造',
    rate: { hours: q(180) },
    produces: [
      {
        item: 'plant/null-test/hindle-150',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 110, max: 110 },
          { param: 'radius', kind: 'range', min: 60, max: 60 },
          { param: 'figure', kind: 'range', min: 130, max: 130 },
          { param: 'obscuration', kind: 'range', min: 48, max: 48 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(3) }] },
      { anyOf: [{ item: 'mat/cerium-oxide', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(12) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 50) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/interferometer',
      'plant/ref-flat-interferometer',
      'std/bowl-lap-200',
      'std/small-tool-15',
    ],
    steps: [
      {
        note_zh: '熔制 1,900–2,000 °C：φ120×50 石英饼',
        performedBy: 'plant/arc-furnace',
        under: [{ param: 'temperature', min: 1900, max: 2000 }],
      },
      {
        note_zh: '退火 1,050–1,100 °C、2 h + 12 h 缓冷',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 1050, max: 1100 }],
      },
      {
        note_zh: '车 R60：弦长 110、矢高 36.0；边缘留 8 mm 厚，背面平',
        performedBy: 'lathe',
      },
      {
        note_zh:
          '碗形盘粗抛 19–21 °C：φ200 碗形盘车成 R60，70° 碗口贴边缘；CeO₂ 浆到 300 nm',
        performedBy: 'plant/cnc-polisher-5axis',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '小磨头/手抛到 λ/4 = 130 nm：铸铁盘 + CeO₂；f/0.5 的深球比平板难，130 nm 是设计上限',
        performedBy: 'plant/cnc-polisher-5axis',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '猫眼标定 19–21 °C：焦点落 λ/1000 平晶，回波 = 2×球误差；标定后 10 nm（λ/50 @633）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '石英砂 3 + CeO₂ 0.2 + 尾矿 10 + 水 12 + HF 0.02 = 25.22 → Hindle 球 1 件 1 kg；余 24.22 = 玻璃屑 2 + CeO₂ 0.2 + 尾矿 10 + 水 12 + HF 0.02；校核 1 + 24.22 = 25.22 ✓。',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.15 非球面 φ150：三条检验路线（CGH / 参考球 / Hindle）
  // ─────────────────────────────────────────────────────────────────────────
];

/**
 * 三条路线共用的 kg 账（差别只在最后一道检验）。
 *
 * 毛坯 11.5 kg + CeO₂ 1.5 + 尾矿 10 + 水 20 + HF 0.05 = 43.05 kg
 * → 非球面 1 件 2.24 kg；余 40.81 = 玻璃屑 9.26（11.5 → 2.24）+ CeO₂ 1.5
 * + 尾矿 10 + 水 20 + HF 0.05。
 *
 * 2.24 kg = 双凸 R130.5、φ150、中心厚 55.4、边厚 8，体积约 546 cm³ × 4.1 g/cm³。
 */
const ASPHERE_MASS_ZH =
  '毛坯 11.5 + CeO₂ 1.5 + 尾矿 10 + 水 20 + HF 0.05 = 43.05 → 非球面 1 件 2.24 kg；余 40.81 = 玻璃屑 9.26（11.5 − 2.24）+ CeO₂ 1.5 + 尾矿 10 + 水 20 + HF 0.05；校核 2.24 + 40.81 = 43.05 ✓。';

/**
 * 三条非球面路线的公共骨架：粗磨 → 碗形盘 → 小磨头 → 离子束 → 检验 → 清洗。
 *
 * `tool` 是最后一道检验用的工具（φ160 CGH / NA 0.86 参考球 / Hindle 球）；
 * `toolNote` 写这一档的读数与降级。检验那一步的执行者是 `plant/null-test`，
 * 所以它只出现在 `steps` 里，不重复进 `needs`（`redundant_need`）。
 */
function asphereRoute(id: string, hours: number, tool: string, toolNote: string): Route {
  const toolLabel = id.includes('cgh') ? 'CGH' : id.includes('refsphere') ? '参考球' : 'Hindle';
  return {
    id,
    name: `非球面 φ150 ${toolLabel} 检验路线`,
    rate: { hours: q(hours) },
    produces: [
      {
        item: 'plant/null-test/asphere-150',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 150, max: 150, record: 'mat/asphere-150-record' },
          { param: 'na', kind: 'range', min: 0.86, max: 0.86 },
          { param: 'figure', kind: 'range', min: 158, max: 158, record: 'mat/asphere-150-record' },
          { param: 'asphericity', kind: 'range', min: 0.53, max: 0.53 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/null-test/blank-lasf-175x120',
            qty: q(1),
            need: [
              { param: 'aperture', kind: 'range', min: 175, dir: 'atLeast' },
              { param: 'thickness', kind: 'range', min: 120, dir: 'atLeast' },
              { param: 'nd', kind: 'range', min: 1.77, max: 1.79 },
              { param: 'homogeneity', kind: 'range', max: 5, dir: 'atMost' },
              { param: 'stress', kind: 'range', max: 5, dir: 'atMost' },
            ],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/cerium-oxide', qty: q(3, 2) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 20) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/interferometer',
      'plant/ref-flat-interferometer',
      'std/bowl-lap-200',
      'std/small-tool-15',
      tool,
    ],
    steps: [
      {
        note_zh:
          '粗磨：双凸 R130.5（n_d 1.78；n = 1.46 的老设计 R80.4、中心厚 111，毛坯 120 两者都盖得住）；中心厚 55.4、边厚 8、外圆 φ150；边缘法线 asin(75/130.5) = 35.1°',
        performedBy: 'plant/grinder',
      },
      {
        note_zh:
          '碗形盘抛光 19–21 °C：φ200、碗口 70° 的铸铁盘车成 R130.5，贴住边缘；平盘在 69° 边缘是线接触（老设计 n=1.46 的 R80.4），本层手抛只到 32.7°，所以必须用碗形盘；PV 从 3 µm 到 1 µm',
        performedBy: 'plant/cnc-polisher-5axis',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '小磨头数控抛光 19–21 °C：φ15 磨头（5–20 mm 档）走螺旋，5 轴联动修 2–25 mm 中频；目标 PV ≤158 nm（λ/4 @633 nm）、Ra ≤1 nm（CeO₂ 浆）',
        performedBy: 'plant/cnc-polisher-5axis',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '离子束收口 0.05–0.5 Pa：12–25 mm 束斑两遍，每遍剩 20 %；只去最后 1 µm，158 nm 的 PV 不再动中频',
        performedBy: 'plant/ion-beam-figuring',
        under: [{ param: 'pressure', min: 0.05, max: 0.5 }],
      },
      {
        note_zh: `零位检验 19–21 °C：${toolNote}`,
        performedBy: 'plant/null-test',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '清洗 20–40 °C：HF 5 % 30 s + 超纯水冲 + 异丙醇脱水 + 烘干；不让水痕留在 158 nm 的面上',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 40 }],
      },
    ],
    unbalanced_zh: ASPHERE_MASS_ZH,
  };
}

ASPHERE_ROUTE_LIST.push(
  asphereRoute(
    'make/asphere-150-cgh',
    300,
    'plant/null-test/cgh-160',
    'φ160 会聚束 CGH：线宽 1–5 µm、刻蚀 158 nm（λ/4 @633）、位置误差 ≤0.5 µm；平面波进、f/0.58 非球面波出，全口径 150 mm；读 PV 158 nm、Ra 1 nm',
  ),
  asphereRoute(
    'make/asphere-150-refsphere',
    320,
    'plant/null-test/ref-sphere-na086',
    'NA 0.86 参考球 R87/φ150：会聚束原路返回，全口径；球面 50 nm 猫眼标定后 10 nm（λ/50 @633）；边缘 59.4° 用同一只碗形盘/小磨头抛',
  ),
  asphereRoute(
    'make/asphere-150-hindle',
    280,
    'plant/null-test/hindle-150',
    'Hindle 球 R60/φ110：遮挡 48 % = (103.4/150)²，只验 52 % 口径；figure 130 nm 猫眼标定后 10 nm；边缘靠旋转对称外推 —— 功能保留，检验置信度降级',
  ),
);


export const ASPHERE_ROUTES: readonly Route[] = ASPHERE_ROUTE_LIST;

/**
 * 剩余缺口（带数字；不是"不可行"结论，是这张表的差额）。
 *
 *   ① **Ra 1 nm 的量具**：0 条目。现有表面读数下限是干涉仪 1/20 条纹 = **15 nm**
 *      （`make/null-test-hindle` 的同一档），到 1 nm 差 **15×**。所以 Ra 只写抛光
 *      目标，不写进 `mat/asphere-150-record`。
 *   ② **纯铬**：`mat/chromium` 全表 0 命中；铬铁带碳 **0.61 %**，CGH 振幅版要
 *      **0.05 %**，差 **12×**。本文件走石英相位版（相位由线位置与 158 nm 台阶定），
 *      功能不缺；铬版只作为降级项。
 *   ③ **铂坩埚**：当时 0 条目；现在 Pt 有海绵料，但坩埚成形未建。Al₂O₃ 瓷坩埚会带 **0.1–0.3 %** Al 进玻璃，均匀性从
 *      ±5e-6 掉到 **±2e-5**（差 **4×**）；所以用熔石英坩埚（SiO₂ 是配料本身）。
 *   ④ **稀土分离收率**：26.7 kg 精矿 → 1 kg La₂O₃ 按 **100 %** 设计（上限）；
 *      90 % 时要 **29.7 kg** 精矿。
 *   ⑤ **浮选回收率**：500 kg 尾矿 → 1 kg 精矿按 **100 %** 设计；80 % 时要
 *      **625 kg** 尾矿。
 *   ⑥ **Hindle 最低遮挡 48 %**（R60/φ110）；R70 是 65 %、R87 是 100 %。主路线仍是
 *      φ160 CGH，Hindle 只作 52 % 口径的降级档。
 *   ⑦ **CGH 位置误差 0.5 µm** 依赖 e-beam 台：旧台 prop 上限 **10 µm**，差 **20×**。
 *      2026-10-20 补：`plant/cgh-e-beam-writer`（激光干涉闭环台，0.5–1 µm）已建，
 *      `needs` 里对它的规格窗口改指它（`functional-kept`，spec-frontier 判**覆盖**）；
 *      旧台 10 µm 与 20× 的账保留为历史。1 µm 端与拼接缝相位见
 *      `data/machine/cgh-e-beam.ts` 第五、六节。
 */

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ASPHERE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...ASPHERE_ROUTES];
