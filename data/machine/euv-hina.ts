/**
 * high-NA EUV 扫描机（下一代）—— 8 镜投影物镜、大视场、≤2.7 nm 套刻，以及 8 nm SoC 的接线。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、这份文件回答什么
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `euv-fab.ts` 的 `plant/euv-stepper` 是 0.33 NA / 2×2 mm 场 / 560 nm 套刻那一代：
 * 它买的是通量，不是分辨率（波前 36 nm = 2.7 λ）。8 nm SoC 要的是另一代机器：
 *
 *   NA 0.55，field 26×33 mm（模型场；地球 high-NA 半场 26×16.5），
 *   matched overlay ≤1.1 nm（design）、throughput ≥110 片/h（单层口径）；
 *   8 nm 后道每层门是 2.7 nm，机器窗口比门紧，
 *   光源 250 W，投影物镜 8 面镜、wavefront ≤2 nm RMS @13.5 nm。
 *
 * 本文件把这一代拆成可造条目：φ660 镜坯 → 粗磨/抛光 → IBF → 50 对 Mo/Si →
 * at-wavelength 验收 → 8 镜物镜 + 3 面照明镜 → 双工件台/减振台 → 整机。
 * 然后把 8 nm SoC 的三段接上：8 重成像（node 8–10）、15–20 层 30 nm 后道、
 * 整机一次曝光一颗 die。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、数的依据类别（每条 gives 都落在其中一类，注释里标出来）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   [A] 物理/几何反推 —— 能从 λ、NA、k1、RSS、密度、热膨胀这些式子算出来的。
 *   [B] 地球工程量级 —— 公开的 high-NA 世代指标量级（NA 0.55、26×16.5 mm 单场、
 *       250 W 源、100–200 wph、~1 nm 套刻）；只取量级，不冒充某台具体机器。
 *   [C] 本仓库既有条目/路线外推 —— φ300 → φ660、40 对 → 50 对、0.52 nm → 0.1 nm、
 *       30 W 管 → 20 kW 管；每一步都写明从哪一条推的。
 *   [D] 纯设计值 —— 没有可核的公开数，只作为本模型的设定；落地时必须重标。
 *
 * ⚠️ 本文件没有 `measure/*` 路线，也没有 `*-record` 条目（R13）：那些在
 *    `data/measure/euv-hina.ts`。这里只写**造**，验收路线在那边。
 *
 * ⚠️ 质量账：本文件只有 `make/ule-glass` 的产物以 kg 计（93 kg 石英 + 7 kg TiO₂
 *    = 100 kg 玻璃，恰好平）；其余产物按件计，件内损耗写在每条路线的注释里，
 *    模型不对「件」做质量守恒断言（与全仓库同口径）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、这一代最要紧的四个数
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── 1. φ660 镜坯：60 kg 的低膨胀玻璃，不是「更大的 φ300」 ──────────────────
 *
 *   体积  π × 0.33² × 0.08 = 0.0274 m³ = 27 400 cm³
 *   质量  × 2.21 g/cm³（ULE 类） = **60.5 kg**（成品；熔 70 kg 留切磨余量）[A]
 *   CTE   0.02–0.05 ppm/K（`mat/ule-glass` 的窗口 ≤0.1；50 对膜的热失配靠它压）[B/C]
 *
 *   为什么必须低膨胀：13.5 nm 的波前预算只有 2 nm，镜面 1 K 的均匀温升在
 *   φ660 上就是 α·ΔT·L = 0.55 ppm/K × 1 K × 0.66 m = 363 nm（熔石英）——
 *   差 180 倍。所以这一代的第一块砖不是抛光，是**玻璃本身**。
 *
 * ── 2. 8 面镜 → wavefront ≤2 nm：每一面只分到 0.15 nm ─────────────────────
 *
 *   反射一次，波前误差 = 2 × 面形误差；8 面镜的 RSS：
 *     2 × 0.15 nm × √8 = **0.85 nm**
 *   再加镀膜周期不均匀 0.6、装调 1.2、热 1.0：
 *     √(0.85² + 0.6² + 1.2² + 1.0²) = **1.83 nm** → 门 2 nm [A]
 *   所以 `mirror` 的 figure 写 ≤0.15 nm、`optics-module` 的 wavefront 写 ≤2 nm。
 *   0.1 nm 的 at-wavelength 验收目标留给 `mirror-blank` 的 IBF 末轮与量测路线。
 *
 * ── 3. overlay ≤2.7 nm：2.7 是 8 nm 后道的每层门，不是这台机器的营销数 ─────
 *
 *   `fine-damascene.ts:454`：40 nm 要 13 nm、8 nm 要 **2.7 nm**（每层）。
 *   本机的预算（RSS）：
 *     片台 1.0 + 掩模台 0.8 + 对准传感器 0.5 + 片/版畸变 1.2 + 量测 0.6
 *     = √(1.0²+0.8²+0.5²+1.2²+0.6²) = **1.93 nm** → 取门 2.7 nm [A/B]
 *   所以 stage 的 `positionError` 写 ≤1 nm、`alignment-sensor` 的 resolution 写
 *   0.5 nm；2.7 nm 是整机窗口，不是台面单项。
 *
 * ── 4. field 26×33 mm：写条目，但把地球的单场 26×16.5 一起写出来 ──────────
 *
 *   地球 high-NA（NA 0.55）的物镜是**变形 4×/8×**，单次曝光场是
 *   **26×16.5 mm**（半场）；26×33 mm 是低 NA 的全场。本条目按用户给的
 *   26×33 建（`field` 26、`fieldLong` 33），但必须把这句话写在这里：
 *   **超过 26×16.5 mm 的 die 在 high-NA 上仍要两次曝光拼接。**
 *   8 nm SoC 的 die 是 10×10 mm（`chip-node.ts` 的设计值），26×16.5 一次就放得下，
 *   所以「一次曝光一颗 die、不再 25 块拼接」对 10×10 成立；26×33 只是余量。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、已知缺口（按 R7 记量级，不写「造不出」）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **20 kW CO₂ 驱动激光没有 ZnSe 窗。** 本文件的设计是**无窗差分抽气输出**
 *      （CO₂ 腔与源腔共真空，铜镜直接折转）；代价是镜面污染与对准漂移。
 *      走 ZnSe 窗这条地球路线要另立 `mat/zinc-selenide`（锌、硒两条链都在，
 *      缺的是窗口级 CVD/热压工艺与 10.6 µm 透过率量具）—— 这是**一个材料条目
 *      的缺口**，不是整条链的终止条件。见 `make/euv-hina-laser` 的注释。
 *   ② **at-wavelength 面形量测的 0.1 nm 是设计值。** 本层可见光干涉的闭环底是
 *      0.52 nm（`plant/ref-flat-interferometer`），差 5.2 倍；13.5 nm 的
 *      at-wavelength 干涉仪条目 `plant/euv-stepper-hina/atw-interferometer` 有路线，
 *      但它的 0.1 nm 没有 `data/measure/` 读数，按 B 类记（L3 判据）。
 *   ③ **电子级钝化已接上。** `mat/si3n4-lpcvd`（`make/lpcvd-si3n4`）已在仓库里，
 *      8 nm SoC 路线把它写进 `uses`；不再是「依赖某条未完成项」。
 *      仍未接上的是可溯源套刻量具、pellicle/修版、C-V/I-V/高速测试（见下）。
 *   ④ **掩模仍是 20 块/套、没有 pellicle、没有修版**（`euv-fab.ts` 降级 10）。
 *      大场只把「拼接」消掉，不消掉掩模的 20 天/套与 2 500 片/块。
 *   ⑤ **throughput 口径。** 本机写 100 片/h 是**单层**口径（地球 high-NA 的
 *      wph 也按单层计）；按本仓库 `plant/euv-stepper` 的 20 层口径折算约 5 片/h。
 *      两个数都写出来，不许混用。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目
// ═══════════════════════════════════════════════════════════════════════════

export const EUV_HINA_ITEMS: readonly Item[] = [
  // ───────────────────────────────────────────────────────────────────────
  // 1.1 镜坯：粗磨 → 抛光 → IBF，同一个 id 三级规格
  // ───────────────────────────────────────────────────────────────────────

  /**
   * **φ660×80 低膨胀玻璃镜坯。** 三代规格都落在同一个 id 上：
   *
   *   make/euv-hina-blank   熔制 + 退火 + 粗磨   figure ≤3 000 nm  roughness ≤500 nm
   *   make/euv-hina-polish  抛光                  figure ≤20 nm     roughness ≤0.3 nm
   *   make/euv-hina-ibf     离子束修形四轮        figure ≤0.1 nm    roughness ≤0.1 nm
   *
   * 为什么不是 φ300：high-NA 的 8 面镜要覆盖 26×16.5 的单场与 0.55 NA 的
   * 光瞳，镜面口径按地球这一代的量级取 **φ660**（[B]，只取量级）。φ660 的
   * 自重弓形按三点支撑算已经进 µm 级，所以抛光头、支撑点、IBF 台都要按
   * 「大镜」重做 —— 不是把 φ300 的工艺放大 2.2 倍。
   *
   *   aperture   660 mm       [B] 地球 high-NA 镜组的口径量级
   *   figure     0–5000 nm    类型窗口；值由三条路线给（3000 / 20 / 0.1）
   *   roughness  0–500 nm     类型窗口；值由三条路线给（500 / 0.3 / 0.1）
   *   cte        0–0.1 ppm/K  ULE 类；本文件交付 0.02–0.05 [B/C]
   *
   * ⚠️ 它**不是** `plant/euv-stepper/mirror-blank` 的放大版：那一条是球面、
   * 三块互研、1423 h/面；这一代是**离轴非球面**，靠 IBF + at-wavelength
   * 量测闭环，工时与手艺都不是一回事。
   */
  {
    id: 'plant/euv-stepper-hina/mirror-blank',
    name: 'φ660×80 低膨胀玻璃镜坯',
    unit: '件',
    category: 'part',
    props: [
      { param: 'aperture', kind: 'range', min: 0, max: 1000, unit: 'mm', dir: 'atLeast' },
      { param: 'figure', kind: 'range', min: 0, max: 5000, unit: 'nm rms', dir: 'atMost' },
      { param: 'roughness', kind: 'range', min: 0, max: 500, unit: 'nm rms', dir: 'atMost' },
      { param: 'cte', kind: 'range', min: 0, max: 0.1, unit: 'ppm/K', dir: 'atMost' },
    ],
  },

  /**
   * **镀完 50 对 Mo/Si 的投影镜。** 8 面投影镜就是它。
   *
   *   aperture     660 mm       [C] 由镜坯口径决定
   *   figure       ≤0.15 nm     [A] 8 面 RSS 预算：2×0.15×√8 = 0.85 nm
   *   roughness    ≤0.1 nm      [D] TIS = (4π×0.1/13.5)² = 0.87 %，够 70 % 反射率
   *   period       6.9 nm       [A] 13.5 nm 的布拉格周期 13.5/2 = 6.75，按入射角取 6.9
   *   pairs        50 对        [B] high-NA 要 70 % 反射率，40 对不够；50 对是这一代的量级
   *   reflectivity 68–70 %     [B] 50 对 Mo/Si 在 13.5 nm 的量级；本模型取 70 的设计值
   *
   * 镀完比镀前糟：345 nm 膜厚分布 ±0.1 % 就是 ±0.35 nm（50 对），所以
   * figure 从 0.1 放到 0.15。这不是偷懒，是「预补偿算不出来」那一笔
   * （`euv-mirror.ts` 降级 2 的同一条）。
   */
  {
    id: 'plant/euv-stepper-hina/mirror',
    name: '镀完 50 对 Mo/Si 的投影镜',
    unit: '件',
    category: 'part',
    props: [
      { param: 'aperture', kind: 'range', min: 0, max: 1000, unit: 'mm', dir: 'atLeast' },
      { param: 'figure', kind: 'range', min: 0, max: 130, unit: 'nm rms', dir: 'atMost' },
      { param: 'roughness', kind: 'range', min: 0, max: 2, unit: 'nm rms', dir: 'atMost' },
      { param: 'period', kind: 'range', min: 6, max: 8, unit: 'nm' },
      { param: 'pairs', kind: 'range', min: 40, max: 60, unit: '对' },
      { param: 'reflectivity', kind: 'range', min: 0, max: 99, unit: '%', dir: 'atLeast' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 1.2 三组光学件：投影、照明、at-wavelength 验收
  // ───────────────────────────────────────────────────────────────────────

  /**
   * **8 镜投影物镜（NA 0.55）。** 8 面镜 + 腔 + 框架装调在一起的那一件。
   *
   *   mirrors    8 面         [B] high-NA 投影物镜的镜数量级（8–10 面）
   *   na         0.55         [B] 这一代的名义 NA
   *   wavefront  ≤2 nm RMS    [A] 2×0.15×√8 = 0.85；加镀膜/装调/热 → 1.83 → 2
   *
   * ⚠️ wavefront 2 nm 与低 NA 那台的 36 nm 不是同一件事：36 nm = 2.7 λ，
   * 这台 2 nm = 0.148 λ。差 18 倍，是「能不能成像」与「只能曝光」的分界。
   */
  {
    id: 'plant/euv-stepper-hina/optics-module',
    name: '8 镜投影物镜',
    unit: '件',
    category: 'part',
    props: [
      { param: 'mirrors', kind: 'range', min: 1, max: 16, unit: '面' },
      { param: 'na', kind: 'range', min: 0, max: 1, unit: 'NA' },
      { param: 'wavefront', kind: 'range', min: 0, max: 100, unit: 'nm rms', dir: 'atMost' },
    ],
  },

  /**
   * **照明镜组：3 面镜 + 照度均匀性。**
   *
   *   mirrors     3 面        [C] 与 `plant/euv-stepper` 的 3 面照明镜同数
   *   uniformity  ≥90 %       [B] 大场照明的均匀性量级；90 % 是设计门
   *
   * 照明镜不必是 0.15 nm 的投影镜：它不参与成像，只决定光瞳填充与均匀性。
   * 所以它吃 `mirror` 的反射率与 figure 窗口，但只要求 figure ≤1 nm。
   */
  {
    id: 'plant/euv-stepper-hina/illuminator',
    name: 'EUV 光刻机照明镜组',
    unit: '件',
    category: 'part',
    props: [
      { param: 'mirrors', kind: 'range', min: 1, max: 8, unit: '面' },
      { param: 'uniformity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * **13.5 nm at-wavelength 面形干涉仪。** 镜组的验收尺，不是可见光那台的放大版。
   *
   *   resolution  ≤0.1 nm     [D] 设计值；at-wavelength 干涉的重复性目标
   *   figure      ≤0.1 nm     [D] 与 resolution 同档：要验收 0.1 nm 的面形
   *   roughness   ≤0.1 nm     [D] 用 13.5 nm 散射/对比度旁证，不是接触式轮廓仪
   *   aperture    660 mm      [C] 要装得下 φ660 的镜
   *   wavelength  13.5 nm     [A] 工作波长（Mo/Si 的布拉格条件）。它是**工况**，
   *                           以前只写在注释里、props 没声明；验收记录要写
   *                           「这份记录是 13.5 nm 下量的」，所以补进 props
   *                           （`data/measure/euv-atw.ts` 的 `mat/atw-figure-record`）
   *
   * 它和 `plant/ref-flat-interferometer` 的差距写在 `data/measure/euv-hina.ts`：
   * 可见光那台 0.52 nm（差 5.2 倍），钠光 Fizeau 只读到 15 nm（差 150 倍），
   * 而且可见光测的是裸基板，at-wavelength 测的是**镀完膜的工作面**。
   *
   * 它是 `category: 'machine'`：它执行验收路线，不是被装进镜组的零件。
   */
  {
    id: 'plant/euv-stepper-hina/atw-interferometer',
    name: '13.5 nm at-wavelength 面形干涉仪',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/resolution', kind: 'range', min: 0, max: 10, unit: 'nm', dir: 'atMost' },
      { param: 'measure/figure', kind: 'range', min: 0, max: 10, unit: 'nm rms', dir: 'atMost' },
      { param: 'measure/roughness', kind: 'range', min: 0, max: 10, unit: 'nm rms', dir: 'atMost' },
      { param: 'measure/aperture', kind: 'range', min: 0, max: 1000, unit: 'mm', dir: 'atLeast' },
      // 工况，不是量程：13.5 nm 是这一台的布拉格条件。声明它是因为验收记录里
      // 要写「这份读数属于哪个波长」—— 没有这一格，记录只能写在注释里。
      { param: 'measure/wavelength', kind: 'range', min: 13.5, max: 13.5, unit: 'nm' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 1.3 台：双工件台、对准传感器、减振台
  // ───────────────────────────────────────────────────────────────────────

  /**
   * **双工件台（片台 + 掩模台），干涉闭环。**
   *
   *   positionError ≤1 nm     [B/A] 整机 2.7 nm 预算里台面分 1.0 nm
   *   readout       ≤0.5 nm   [B] 外差干涉测长；地球 high-NA 台的读数在这一档
   *   stroke        ≥300 mm   [C] 与 `plant/euv-stepper/stage` 同行程
   *
   * 它与低 NA 那台的 `positionError ≤1 µm` 差 1000 倍：那一台是刻度盘 +
   * 机器人视觉，这一台是**激光干涉闭环 + 0.5 nm 读数**。读数不是台本身
   * （`plant/laser-stage` 的 20 nm 是标定用干涉仪，不是台），所以这里把
   * `readout` 单列一个 prop，别让「台定位 1 nm」与「尺读到 0.5 nm」混成一个数。
   */
  {
    id: 'plant/euv-stepper-hina/stage',
    name: 'high-NA EUV 光刻机双工件台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'positionError', kind: 'range', min: 0, max: 100, unit: 'nm', dir: 'atMost' },
      { param: 'readout', kind: 'range', min: 0, max: 100, unit: 'nm', dir: 'atMost' },
      { param: 'stroke', kind: 'range', min: 0, max: 2000, unit: 'mm', dir: 'atLeast' },
    ],
  },

  /**
   * **套刻对准传感器。** 从掩模/片上的标记读相位差，给台一个 0.5 nm 的零位。
   *
   *   resolution 0.5 nm   [B] 整机套刻预算里对准分 0.5 nm
   *   accuracy   1.0 nm   [D] 标记零点与图形零点之间的基准传递误差（设计值）
   *
   * ⚠️ 它给的是**机内重复性**，不是可溯源套刻。独立、可溯源的套刻量具
   * （DBO 或 CD-SEM 的亚纳米插值）仍是缺口，见 `data/measure/euv-hina.ts`。
   */
  {
    id: 'plant/euv-stepper-hina/alignment-sensor',
    name: 'EUV 光刻机套刻对准传感器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 0, max: 10, unit: 'nm', dir: 'atMost' },
      { param: 'accuracy', kind: 'range', min: 0, max: 10, unit: 'nm', dir: 'atMost' },
    ],
  },

  /**
   * **减振台。** 钢弹簧 + 铜线圈主动阻尼 + 干涉读数做惯性参考。
   *
   *   vibration ≤1 nm      [D] 1–100 Hz 的残余振动（设计值）
   *   payload   5 000 kg   [C] 物镜 620 kg 级 + 台 + 框架，按 5 t 留余量
   *
   * 本层**没有橡胶、没有油**（`euv-fab.ts` 框架那一条：`mat/rubber` 0 条目），
   * 所以不用气囊；钢弹簧的刚度靠几何，阻尼靠铜线圈反相驱动。这与低 NA 那台
   * 「只有质量与刮研」是同一门手艺的两端：那一端到 50 µm，这一端靠闭环到 1 nm。
   */
  {
    id: 'plant/euv-stepper-hina/isolation',
    name: 'EUV 光刻机减振台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'vibration', kind: 'range', min: 0, max: 1000, unit: 'nm', dir: 'atMost' },
      { param: 'payload', kind: 'range', min: 0, max: 20000, unit: 'kg', dir: 'atLeast' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 1.4 结构与光源
  // ───────────────────────────────────────────────────────────────────────

  /**
   * **整机框架。** HT250 箱式床身 + 三处安装面 + 恒温罩。
   *
   *   payload   8 000 kg   [C] 物镜 + 双台 + 减振台 + 光源接口
   *   vibration ≤2 nm      [D] 减振台之后的框架残余（设计值）
   *
   * 低 NA 那台的框架是 50 µm、3 000 kg；这一台不是「更重的同一件」：
   * 它的判据是**减振台之后**的 2 nm，质量只是把 1 Hz 以上的结构模态推高。
   */
  {
    id: 'plant/euv-stepper-hina/frame',
    name: 'high-NA EUV 光刻机整机框架',
    unit: '件',
    category: 'part',
    props: [
      { param: 'payload', kind: 'range', min: 0, max: 20000, unit: 'kg', dir: 'atLeast' },
      { param: 'vibration', kind: 'range', min: 0, max: 1000, unit: 'nm', dir: 'atMost' },
    ],
  },

  /**
   * **投影光学真空腔。** φ1 000 × 1 500 双层筒，内层 10 mm 碳钢板，外层水冷。
   *
   *   leakRate        ≤1e-4 Pa·L/s  [C] 与 `plant/euv-stepper/chamber` 同档
   *   bakeTemperature ≥150 °C       [C] 与镀膜腔同档；镜面镀完不能再烤，150 是上限
   *
   * 为什么比低 NA 的 φ600 大：8 面 φ660 的镜组要装进去，且要留 IBF/复测的
   * 拆装空间。腔大不是本事，**大腔还要 1e-4 的漏率**才是这一条的手艺。
   */
  {
    id: 'plant/euv-stepper-hina/chamber',
    name: 'high-NA EUV 光刻机投影光学真空腔',
    unit: '件',
    category: 'part',
    props: [
      { param: 'leakRate', kind: 'range', min: 0, max: 1, unit: 'Pa·L/s', dir: 'atMost' },
      { param: 'bakeTemperature', kind: 'range', min: 0, max: 400, unit: '°C', dir: 'atLeast' },
    ],
  },

  /**
   * **250 W / 13.5 nm 光源模块（LPP，锡液滴）。** 整机的光源接口件。
   *
   *   power      250 W      [B] 地球 high-NA 光源的量级；本模型取 250 为设计值
   *   wavelength 13.5 nm    [A] Mo/Si 反射镜的工作波长
   *
   * 它是**子装配（part）**，不是设备：设备只能被 `performedBy` 指名，
   * 而它要进整机 BOM。与 `plant/euv-stepper/optics-module` 同一个写法。
   *
   * 250 W 的来源：20 kW CO₂ 驱动激光 × **1.25 %** 的 13.5 nm 转换效率 [A/B]。
   * 本仓库既有的 DPP 头只到 4.2 W（`euv-source.ts`），所以这一件不是
   * 「把 DPP 并联 60 台」—— 它走 LPP：锡液滴 + 20 kW CO₂ + 收集镜。
   *
   * 外部核对（2026-10）：公开 LPP 源 250–350 W、50 kHz、~30 µm 液滴、
   * 20–30 kW CO₂、收集镜 Mo/Si ~65 %、寿命 30,000 h。本层 250 W/20 kW/
   * 18–20 µm 是同一量级；18–20 µm 是较小液滴设计，不是实测。
   * 来源：<https://chipfoundryservices.com/glossary.php?term=euv-light-source>。
   */
  {
    id: 'plant/euv-stepper-hina/source',
    name: '250 W / 13.5 nm 光源模块',
    unit: '件',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 0, max: 1000, unit: 'W', dir: 'atLeast' },
      { param: 'wavelength', kind: 'range', min: 13, max: 14, unit: 'nm' },
      // 能力域/资格带，不是单次读数；与 mat/source-spectrum-record 的资格带一致。
      { param: 'inBandPower', kind: 'range', min: 0, max: 500, unit: 'W', dir: 'atMost' },
      { param: 'bandwidth', kind: 'range', min: 0.1, max: 2, unit: 'nm' },
      { param: 'etendue', kind: 'range', min: 0, max: 10, unit: 'mm²·sr' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 1.5 整机
  // ───────────────────────────────────────────────────────────────────────

  /**
   * **high-NA EUV 扫描机整机。** 由 `make/euv-hina` 装配，不是 composedOf 黑箱。
   *
   *   na          0.55          [B] 这一代的名义 NA
   *   field       26 mm         [B] 短边；`fieldLong` 33 是长边
   *   fieldLong   33 mm         [B] 26×33 的条目值；地球单场是 26×16.5，见文件头二·4
   *   overlay     2.7 nm       [B] 8 nm 后道每层门；本层按可溯源产品套刻资格交这一档
   *                               （`mat/overlay-product-record`）。1.1 nm 是机器设计目标
   *                               （EXE:5000 公开路线图），不是本层读数，见文件末与台账
   *   throughput  ≥110 片/h     [B] 单层口径、50 mJ/cm²；地球 high-NA 在 100–200 wph 量级
   *   sourcePower 250 W         [B] 光源模块交付
   *   mirrors     12 面         [C] 1 收集 + 3 照明 + 8 投影
   *   wavefront   ≤2 nm RMS     [A] 8 面 RSS 1.83 → 2
   *
   * ⚠️ throughput 的口径：本仓库 `plant/euv-stepper` 的 9.7 片/h 是**20 层**
   * 只算光的数；这台写 100 片/h 是**单层**（地球 wph 的通行口径）。按 20 层
   * 折算约 5 片/h。两个口径都写出来，不在同一张表里相加。
   *
   * ⚠️ 「M3 后」的读法：`litho-m3.ts` 是 0.13 µm 那一代，这台是它之后的下一代。
   * 2.7 nm 是 8 nm 后道的每层门，不是 M3 的 43 nm。
   *
   * 外部核对（2026-10）：地球 high-NA 的公开路线图把 EXE:5000 的匹配机台
   * overlay 写在 ≤1.1 nm、50 mJ/cm² 下 110 片/h、NA 0.55、单场约为 NXE 的
   * 一半（26×16.5 mm）。本层的 2.7 nm 不是机器营销数，是 8 nm 后道的每层
   * 门；机器给的窗口比门紧，但本层仍按 design 记，不把 1.1 当本机读数。
   * 来源：<https://technologyblog.co.za/asml-exe-5000/>（二手汇总，非 ASML 原文）。
   */
  {
    id: 'plant/euv-stepper-hina',
    name: 'high-NA EUV 光刻机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'na', kind: 'range', min: 0, max: 1, unit: 'NA', dir: 'atLeast' },
      { param: 'field', kind: 'range', min: 1, max: 40, unit: 'mm' },
      { param: 'fieldLong', kind: 'range', min: 1, max: 50, unit: 'mm' },
      { param: 'overlay', kind: 'range', min: 0, max: 10, unit: 'nm', dir: 'atMost' },
      { param: 'throughput', kind: 'range', min: 0, max: 1000, unit: '片/h', dir: 'atLeast' },
      { param: 'sourcePower', kind: 'range', min: 0, max: 1000, unit: 'W', dir: 'atLeast' },
      { param: 'mirrors', kind: 'range', min: 1, max: 20, unit: '面' },
      { param: 'wavefront', kind: 'range', min: 0, max: 100, unit: 'nm rms', dir: 'atMost' },
    ],
  },

  /**
   * EUV 掩模坯（6 英寸）。ULE 基板 + 40–50 对 Mo/Si 多层 + Rh 帽 + Ni 吸收层。
   *
   *   size       152 mm（6 英寸）
   *   cte        ≤0.05 ppm/K（ULE 基板）
   *   pairs      40–50（Mo 2.8 nm / Si 4.1 nm）
   *   cap        Rh（2 nm）
   *   absorber   Ni（50–70 nm）
   *   flatness   ≤0.1 nm rms；roughness ≤0.1 nm
   *
   * ⚠️ 吸收层不是标准 TaBN，是 Ni：本层没有 Ta/B 靶材与 TaBN 刻蚀，
   * Ni 在 13.5 nm 的吸收足够做测试掩模；标准 TaBN 是升级路线，等 Ta/B
   * 两条料链通了再换。Rh 帽同理：标准是 Ru，Rh 是 PGM 里现成的一档。
   *
   * 掩模坯只是空白片；写图形、刻吸收层、修版、pellicle 是后续段，不在本条目。
   */
  {
    id: 'std/euv-mask-blank',
    name: 'EUV 掩模坯',
    unit: '件',
    category: 'part',
    props: [
      { param: 'size', kind: 'range', min: 152, max: 152, unit: 'mm' },
      { param: 'cte', kind: 'range', min: 0, max: 0.1, unit: 'ppm/K', dir: 'atMost' },
      { param: 'pairs', kind: 'range', min: 40, max: 50, unit: '对' },
      { param: 'cap', kind: 'enum', values: ['Rh'] },
      { param: 'absorber', kind: 'enum', values: ['Ni'] },
      { param: 'flatness', kind: 'range', min: 0, max: 1, unit: 'nm rms', dir: 'atMost' },
      { param: 'roughness', kind: 'range', min: 0, max: 1, unit: 'nm rms', dir: 'atMost' },
    ],
  },

  /**
   * EUV 测试掩模（100–150 nm 档）。掩模坯 + 100 nm 线宽图形，Ni 吸收层。
   *
   *   minFeature  0.1–0.15 µm
   *   placement   500–1000 nm（CGH 电子束写机的定位误差）
   *   absorber    Ni
   *   size        152 mm
   *
   * 它是降级件：8 nm 的掩模图形是 32 nm、套刻要 ≤10 nm，这台写机还差两档；
   * 100 nm 档先用来打通“写图形 → 刻 Ni → 去胶 → CD-SEM”这条工艺链。
   * 32 nm 档要另一台定位 ≤10 nm 的写机，是下一步升级。
   */
  {
    id: 'std/euv-mask-degraded',
    name: 'EUV 测试掩模',
    unit: '件',
    category: 'part',
    props: [
      { param: 'size', kind: 'range', min: 152, max: 152, unit: 'mm' },
      { param: 'minFeature', kind: 'range', min: 0.05, max: 0.2, unit: 'µm' },
      { param: 'placement', kind: 'range', min: 0, max: 2000, unit: 'nm', dir: 'atMost' },
      { param: 'absorber', kind: 'enum', values: ['Ni'] },
    ],
  },

  /**
   * 32 nm EUV 掩模写机。**不是新造一根电子光学柱**：用 CD-SEM 的柱（4 nm 束斑、
   * 30–50 kV、0.2–1 pA）当写入柱，换掉 CD-SEM 的 1 µm 台，装 EUV 台的
   * 0.5–1 nm 定位 + 隔振 + 0.02–0.05 K 温控罩。
   *
   *   spotSize          4–10 nm（CD-SEM 柱的 4 nm 束斑 + 写入散焦）
   *   positionError     5–10 nm（0.5–1 nm 台 + 柱偏转/漂移，设计估算）
   *   accelVoltage      30–50 kV
   *   beamCurrent       0.2–1 pA
   *   stageStroke       152 mm
   *   drift             0.2–0.5 nm/h（设计估算）
   *   temperatureStability 0.02–0.05 K
   *
   * 历史路径：CGH 写机 20–100 nm 束斑、500–1000 nm 定位（100 nm 档）→ 本条
   * CD-SEM 柱 + EUV 台（32 nm 档）→ 更高束流/多束写机（量产，未建）。
   *
   * ⚠️ 0.2–1 pA 写 32 nm 掩模很慢：一张 152 mm 掩模按 10 µC/cm² 要几十小时；
   * 数量不是约束（R1），但节拍要如实记。位置 5–10 nm 是设计估算，不是实测。
   *
   * 外部核对（2026-10）：地球的 IMS MBMW-101/201 是 28–5 nm 的多束写机，
   * 6 英寸掩模、写一张 <10 h、数据率 120 Gbit/s（厂商产品页）。本条是
   * CD-SEM 单柱转换的**降级路径**：48 h 慢在束流，不是写不出 32 nm；
   * 升级方向就是多束写机，不是再放大单柱电流。
   * 来源：<https://www.ims.co.at/en/products/>。
   */
  {
    id: 'plant/euv-mask-writer',
    name: '32 nm EUV 掩模写机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'spotSize', kind: 'range', min: 1, max: 20, unit: 'nm', dir: 'atMost' },
      { param: 'positionError', kind: 'range', min: 0, max: 50, unit: 'nm', dir: 'atMost' },
      { param: 'accelVoltage', kind: 'range', min: 30, max: 50, unit: 'kV' },
      { param: 'beamCurrent', kind: 'range', min: 0.05, max: 2, unit: 'pA' },
      { param: 'stageStroke', kind: 'range', min: 152, max: 300, unit: 'mm' },
      { param: 'drift', kind: 'range', min: 0, max: 2, unit: 'nm/h', dir: 'atMost' },
      { param: 'temperatureStability', kind: 'range', min: 0, max: 0.1, unit: 'K', dir: 'atMost' },
    ],
    holds: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
  },

  /**
   * 32 nm EUV 掩模。掩模坯 + 32 nm 线图形，Ni 吸收层，定位 5–10 nm。
   *
   *   minFeature  0.025–0.04 µm（32 nm 档的掩模线宽 = 晶圆 8 nm × 4）
   *   placement   5–10 nm（CD-SEM 柱 + 0.5–1 nm 台，设计估算）
   *   absorber    Ni
   *   size        152 mm
   *
   * 8 nm 晶圆要的每层门是 2.7 nm；掩模这一侧的 32 nm 线/5–10 nm 定位是它的
   * 上游。掩模修版与 pellicle 仍缺，这一条只交写好的吸收层图形。
   */
  {
    id: 'std/euv-mask-32nm',
    name: '32 nm EUV 掩模',
    unit: '件',
    category: 'part',
    props: [
      { param: 'size', kind: 'range', min: 152, max: 152, unit: 'mm' },
      { param: 'minFeature', kind: 'range', min: 0.02, max: 0.05, unit: 'µm' },
      { param: 'placement', kind: 'range', min: 0, max: 20, unit: 'nm', dir: 'atMost' },
      { param: 'absorber', kind: 'enum', values: ['Ni'] },
      { param: 'pellicle', kind: 'enum', values: ['poly-Si'] },
    ],
  },

  /**
   * EUV pellicle：50 nm 多晶硅膜 + Ti 框。装在掩模正面，挡颗粒、不挡 13.5 nm。
   *
   *   thickness     40–60 nm（多晶硅膜）
   *   transmission  0.6–0.85（13.5 nm，设计估算；绝对值缺 at-wavelength 透射标准）
   *   membrane      poly-Si
   *   frame         Ti
   *   size          152 mm
   *
   * 历史顺序：无 pellicle（每班清洁 + 缺陷复检，降级）→ 本条多晶硅膜 →
   * 碳纳米管网（未建）。多晶硅 50 nm 的机械强度与透射是一对矛盾：薄了透射高、
   * 易破；厚了结实、透射低。0.6–0.85 是这一档的设计窗口，不是实测。
   *
   * 外部核对（2026-10）：Mitsui 的 EUV pellicle 公开尺寸是 110×144 mm、
   * 膜厚 50 nm；本条的 152 mm 是掩模框尺寸，膜窗按 110×144 开。透射率
   * 没有找到厂商的 13.5 nm 绝对值，0.6–0.85 仍是设计估算，不改写。
   * 来源：<https://smroadmap.smtech.go.kr/TipaCms/cmm/fms/FileDown.do?gubun=userReport&atchFileId=FILE_000000000004523&fileSn=0>。
   */
  {
    id: 'std/euv-pellicle',
    name: 'EUV 薄膜',
    unit: '件',
    category: 'part',
    props: [
      { param: 'size', kind: 'range', min: 152, max: 152, unit: 'mm' },
      { param: 'thickness', kind: 'range', min: 20, max: 100, unit: 'nm' },
      { param: 'transmission', kind: 'range', min: 0.4, max: 0.95, unit: '1' },
      { param: 'membrane', kind: 'enum', values: ['poly-Si'] },
      { param: 'frame', kind: 'enum', values: ['Ti'] },
    ],
  },

  /**
   * 32 nm EUV 掩模修版机：CD-SEM 柱 + 0.5–1 nm 台 + 气体注入/存储/针 + 泛流枪。
   *
   *   spotSize        4–10 nm（CD-SEM 柱的 4 nm 束斑）
   *   positionError   5–10 nm（0.5–1 nm 台 + 柱偏转，设计估算）
   *   beamCurrent     0.001–100 pA（细修 0.001–1 pA；大缺陷用泛流枪）
   *   stageStroke     152 mm
   *   drift           0.2–0.5 nm/h（设计估算）
   *
   * 修版原理：电子束诱导刻蚀/沉积（EBIE/EBID）。气体注入器把前驱体送到
   * 缺陷点，电子束局部分解；刻蚀与沉积用同一套气路换气。FIB 的 1000 nm
   * 束斑只能粗修 ≥1 µm 的缺陷；32 nm 缺陷要这一档。
   *
   * 历史顺序：FIB 1000 nm（100 nm 档粗修）→ 本条 CD-SEM 柱 + EUV 台
   * （32 nm 档）→ 更高束流/多束修版（未建）。
   */
  {
    id: 'plant/euv-mask-repair',
    name: '32 nm EUV 掩模修版机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'spotSize', kind: 'range', min: 1, max: 20, unit: 'nm', dir: 'atMost' },
      { param: 'positionError', kind: 'range', min: 0, max: 50, unit: 'nm', dir: 'atMost' },
      { param: 'beamCurrent', kind: 'range', min: 0.001, max: 100, unit: 'pA' },
      { param: 'stageStroke', kind: 'range', min: 152, max: 300, unit: 'mm' },
      { param: 'drift', kind: 'range', min: 0, max: 2, unit: 'nm/h', dir: 'atMost' },
    ],
    holds: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
  },

  /**
   * 8 nm 首片：设计套刻跑出来的第一片，用于首件套刻测量；不是量产件。
   *
   *   node   8–10 nm（与量产片同一工艺，但套刻没有记录）
   *   stage  first-article
   *
   * 它解的是循环：量产路线 `make/device-wafer-oct` 要 overlay ≤2.7 的
   * record，而 record 又要在片上读；首片先用设计套刻跑出来，再测它。
   * 首片不能当量产片用，记录也不能拿首片顶产品片。
   */
  {
    id: 'mat/device-wafer-first',
    name: '8 nm 首片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'node', kind: 'range', min: 1, max: 400, unit: 'nm', dir: 'atMost' },
      { param: 'stage', kind: 'enum', values: ['first-article'] },
    ],
  },

  /**
   * 晶圆缺陷巡检机：明场/暗场光学 + CCD + 300 mm 台。
   *
   *   resolution   1–2 µm（`plant/dicing-saw/microscope` 的 50–200× + CCD）
   *   field        2–5 mm
   *   stageStroke  300 mm（`plant/euv-stepper-hina/stage` 的 0.5–1 nm 台）
   *   throughput   2–5 片/h（设计估算）
   *
   * 这是首片缺陷图的量具：没有它，只有 CD-SEM 的 20 点抽检，不是全片图。
   * 光学分辨率 1–2 µm 只能看颗粒/大缺陷，8 nm 的图形缺陷要靠 CD-SEM 复查；
   * 所以缺陷图是“颗粒/大缺陷密度上限”，不是 8 nm 的良率。
   */
  {
    id: 'plant/wafer-inspection',
    name: '晶圆缺陷巡检机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'resolution', kind: 'range', min: 0.5, max: 5, unit: 'µm', dir: 'atMost' },
      { param: 'field', kind: 'range', min: 1, max: 10, unit: 'mm' },
      { param: 'stageStroke', kind: 'range', min: 300, max: 300, unit: 'mm' },
      { param: 'throughput', kind: 'range', min: 1, max: 10, unit: '片/h' },
    ],
  },

  /**
   * 电子束巡检机：CD-SEM 柱 + 300 mm 台 + 图像比对。
   *
   *   resolution   2–5 nm（CD-SEM 柱的 4 nm 束斑）
   *   pixel        2–10 nm
   *   stageStroke  300 mm
   *   throughput   0.2–0.5 片/h（0.2–1 pA 的束流限制，设计估算）
   *
   * 光学巡检只能看颗粒/大缺陷；8 nm 图形缺陷要电子束。它不修版、不刻蚀，
   * 只拍图并与参考 die 比对，所以与写机/修版机共用柱和台但少气体系统。
   */
  {
    id: 'plant/e-beam-inspection',
    name: '电子束巡检机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'resolution', kind: 'range', min: 1, max: 10, unit: 'nm', dir: 'atMost' },
      { param: 'pixel', kind: 'range', min: 1, max: 20, unit: 'nm' },
      { param: 'stageStroke', kind: 'range', min: 300, max: 300, unit: 'mm' },
      { param: 'throughput', kind: 'range', min: 0.1, max: 1, unit: '片/h' },
    ],
    holds: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
  },

  /**
   * EUV CGH 零位补偿片：10–20 nm 特征，152 mm，Ni 吸收层。
   *
   * CGH 的作用不是“成像”，是把 660 mm 非球面的理想波前“造”出来，
   * 让干涉仪只测镜子与理想波前的差。特征 10–20 nm 比 32 nm 掩模更细，
   * 但写机是同一台 CD-SEM 柱 + EUV 台；刻蚀仍是 Cl₂/Ar 刻 Ni。
   *
   * ⚠️ CGH 的相位误差会 1:1 进镜子的面形；写机定位 5–10 nm、刻蚀侧壁
   * 60–80° 是这条链的底。CGH 本身要用 `plant/cd-sem` 复读，不能只看写没写出来。
   */
  {
    id: 'std/euv-cgh-null',
    name: 'EUV CGH 零位补偿片',
    unit: '件',
    category: 'part',
    props: [
      { param: 'feature', kind: 'range', min: 5, max: 30, unit: 'nm' },
      { param: 'size', kind: 'range', min: 152, max: 152, unit: 'mm' },
      { param: 'substrate', kind: 'enum', values: ['ULE'] },
      { param: 'absorber', kind: 'enum', values: ['Ni'] },
    ],
  },

  /**
   * 660 mm、13.5 nm、0.1 nm 级 at-wavelength EUV 干涉仪。
   *
   *   wavelength      13.5 nm
   *   aperture        660 mm（300 mm 台子孔径拼接）
   *   resolution      0.1 nm（design，不是实测）
   *   repeatability   0.05 nm（design）
   *
   * 它补的是 `make/euv-hina-ibf` 第 3 步留下的缺口：可见光干涉只判
   * “比上一轮好了没有”，0.1 nm 的绝对值没有 at-wavelength 验收。没有它，
   * 镜子的 0.1 nm 只能是 IBF 的设计残差。
   *
   * ⚠️ 源是 250 W 锡等离子体，空间相干性差；CGH 零位补偿、EUV 探测器、
   * 0.5 nm 台、隔振、真空缺一不可。0.1 nm 是目标，不是本机读数。
   */
  {
    id: 'plant/euv-interferometer',
    name: 'at-wavelength EUV 干涉仪',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'wavelength', kind: 'range', min: 13.5, max: 13.5, unit: 'nm' },
      { param: 'aperture', kind: 'range', min: 300, max: 660, unit: 'mm' },
      { param: 'resolution', kind: 'range', min: 0, max: 1, unit: 'nm', dir: 'atMost' },
      { param: 'repeatability', kind: 'range', min: 0, max: 0.5, unit: 'nm', dir: 'atMost' },
      { param: 'measure/figure', kind: 'range', min: 0, max: 2, unit: 'nm rms', dir: 'atMost' },
    ],
    holds: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
  },

  /**
   * 快速 EUV 探测器：ZnS:Ag 荧光屏 + 可见 CCD + 真空腔。
   *
   * 不是背照式 EUV CCD（本层没有）；是“13.5 nm → 450–550 nm → CCD”的
   * 间接探测。荧光屏把 EUV 转成可见光，CCD 10–30 fps 读出；时间常数
   * 0.05–0.1 s，比 `plant/euv-reflectometer/detector` 的 100 s 快三个量级。
   *
   * 代价：QE 0.2–0.5（比背照 CCD 低）、荧光屏颗粒与均匀性进系统差。
   * 它是干涉仪的“快眼”，不是 0.1 nm 精度的来源；精度靠 CGH/台/校准。
   */
  {
    id: 'std/euv-detector-fast',
    name: '快速 EUV 探测器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'format', kind: 'range', min: 1, max: 4, unit: 'MP' },
      { param: 'pixel', kind: 'range', min: 5, max: 20, unit: 'µm' },
      { param: 'frameRate', kind: 'range', min: 1, max: 30, unit: 'fps' },
      { param: 'quantumEfficiency', kind: 'range', min: 0.1, max: 0.6, unit: '1' },
      { param: 'timeConstant', kind: 'range', min: 0, max: 1, unit: 's', dir: 'atMost' },
    ],
  },

  /**
   * EUV 空间滤波针孔：1–5 µm 孔，100 nm SiN 膜，10 mm 片。
   *
   * 250 W 锡等离子体是扩展源；不滤波，干涉条纹对比度会被源尺寸吃掉。
   * 针孔把源“切”成点源，代价是光通量掉几个量级。孔 1–5 µm、膜 100 nm、
   * 边缘粗糙度 <50 nm 是这条链的底；孔大了相干性不够，孔小了光太弱。
   */
  {
    id: 'std/euv-pinhole',
    name: 'EUV 空间滤波针孔',
    unit: '件',
    category: 'part',
    props: [
      { param: 'hole', kind: 'range', min: 1, max: 10, unit: 'µm' },
      { param: 'membrane', kind: 'range', min: 50, max: 200, unit: 'nm' },
      { param: 'size', kind: 'range', min: 10, max: 10, unit: 'mm' },
      { param: 'material', kind: 'enum', values: ['SiN'] },
    ],
  },

  /**
   * EUV 针孔五维调整架：粗台 + 3 只 PZT + 2 只倾角 + 5 只电容传感器。
   *
   *   粗台 1 + PZT 3 + 倾角 2 + 电容传感器 5 + 控制板 1 + 钛/铝 2
   *   → 五维架 1
   *
   * 针孔要把 1–5 µm 的孔对准 EUV 光轴；0.1 µm 级、五轴、真空兼容。
   * 难点不是行程，是五轴解耦：PZT 的 0.1 nm 分辨率被粗台/柔顺机构的
   * 串扰吃掉；五只电容传感器闭环是必须的，不是可选。
   */
  {
    id: 'std/euv-pinhole-mount',
    name: 'EUV 针孔五维调整架',
    unit: '件',
    category: 'part',
    props: [
      { param: 'axes', kind: 'range', min: 5, max: 5, unit: '轴' },
      { param: 'resolution', kind: 'range', min: 0.05, max: 0.1, unit: 'µm', dir: 'atMost' },
      { param: 'travel', kind: 'range', min: 10, max: 100, unit: 'µm' },
    ],
  },

  /**
   * 660 mm 双台串联 stage：2 × 300 mm 台 + 公共 frame + 隔振。
   *
   *   300 mm 台 2 + frame 1 + 隔振 1 + 控制板 2 + 铝/钢 2 → 660 mm 台 1
   *
   * 不是把一台台子放大：660 mm 行程用两级串联（粗 360 + 精 300 重叠），
   * 两级误差 RSS 进 0.5–1 nm；公共 frame 的热漂移与两级的坐标对齐是难点。
   * 现有 300 mm 台是 0.5–1 nm；两级串联不是简单相加。
   */
  {
    id: 'plant/euv-stage-660',
    name: '660 mm 双台串联工件台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'stroke', kind: 'range', min: 660, max: 660, unit: 'mm' },
      { param: 'positionError', kind: 'range', min: 0, max: 2, unit: 'nm', dir: 'atMost' },
      { param: 'readout', kind: 'range', min: 0, max: 1, unit: 'nm', dir: 'atMost' },
    ],
  },

  /**
   * EUV 绝对参考平晶：300 mm、0.1 nm 级 ULE 基板 + Mo/Si 50 对。
   *
   *   size 300 mm、figure 0.1–0.2 nm（design）、roughness 0.1–0.2 nm（design）
   *   coating Mo/Si 50 对
   *
   * 基底先用可见光三平晶/液面法做到 0.1 nm（`make/ref-flat-open`），再镀
   * Mo/Si；镀膜应力会把 0.1 nm 的平晶压弯，所以 figure 0.1–0.2 是镀后
   * 设计窗口，不是实测。三块一起做，三平晶互检才有绝对约束。
   */
  {
    id: 'std/euv-absolute-flat',
    name: 'EUV 绝对参考平晶',
    unit: '件',
    category: 'part',
    props: [
      { param: 'size', kind: 'range', min: 300, max: 300, unit: 'mm' },
      { param: 'figure', kind: 'range', min: 0, max: 1, unit: 'nm rms', dir: 'atMost' },
      { param: 'roughness', kind: 'range', min: 0, max: 1, unit: 'nm rms', dir: 'atMost' },
      { param: 'coating', kind: 'enum', values: ['Mo/Si'] },
    ],
  },

  /**
   * EUV 变线距光栅：1200 线/mm、30 mm、槽深 25–40 nm。
   *
   * 13.5 nm 光谱要靠光栅色散；可见光 OES 的 1200 线/mm 光栅没有 EUV
   * 多层/闪耀，效率不够。本条用 32 nm 写机的 4–10 nm 束斑写 417–1000 nm
   * 周期，RIE 刻 Si；效率 0.15–0.3 是 design，不是实测。
   */
  {
    id: 'std/euv-grating',
    name: 'EUV 变线距光栅',
    unit: '件',
    category: 'part',
    props: [
      { param: 'linesPerMM', kind: 'range', min: 1000, max: 2400, unit: '线/mm' },
      { param: 'size', kind: 'range', min: 30, max: 30, unit: 'mm' },
      { param: 'grooveDepth', kind: 'range', min: 20, max: 50, unit: 'nm' },
      { param: 'efficiency', kind: 'range', min: 0.1, max: 0.4, unit: '1' },
    ],
  },

  /**
   * EUV 光谱/etendue 量测机：光栅 + 快探测器 + 测角 + 真空腔。
   *
   *   wavelengthRange 10–20 nm、resolution 0.2–0.5 nm（design）。
   * 现有 IF 后量热计只读总功率 250 W，分不清 13.5 nm 带内/带外，也读不了
   * etendue；这台补那两项。
   */
  {
    id: 'plant/euv-spectrometer',
    name: 'EUV 光谱/etendue 量测机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'wavelengthRange', kind: 'range', min: 10, max: 20, unit: 'nm' },
      { param: 'resolution', kind: 'range', min: 0, max: 1, unit: 'nm', dir: 'atMost' },
      { param: 'wavelength', kind: 'range', min: 13.5, max: 13.5, unit: 'nm' },
      { param: 'measure/bandwidth', kind: 'range', min: 0, max: 2, unit: 'nm', dir: 'atMost' },
    ],
    holds: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
  },

  /**
   * 液滴频闪成像机：CCD + 显微镜 + 白光 + 脉冲驱动。
   *
   *   resolution 1–5 µm（design）、field 100–500 µm、
   *   strobe 10–100 kHz（design）、jitter ≤10 ns（design）
   *
   * 50 kHz 液滴不能靠 10 fps CCD 直接拍；用脉冲光源在固定相位“凝固”
   * 液滴，CCD 积分多帧。两帧不同延迟给出速度；单帧给出直径。
   */
  {
    id: 'plant/euv-droplet-imager',
    name: '液滴频闪成像机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'resolution', kind: 'range', min: 1, max: 5, unit: 'µm', dir: 'atMost' },
      { param: 'field', kind: 'range', min: 100, max: 500, unit: 'µm' },
      { param: 'strobe', kind: 'range', min: 10, max: 100, unit: 'kHz' },
      { param: 'jitter', kind: 'range', min: 0, max: 10, unit: 'ns', dir: 'atMost' },
    ],
  },

  /**
   * 10.6 µm 激光光束质量/聚焦/指向量测机：刀口扫描 + 热电探测器 + 水冷束流收集。
   *
   *   power 0–30 kW、spot 20–50 µm（design）、pointing 20–50 µrad（design）。
   * 20 kW 不能直接进探测器：铜刀口/水冷收集挡掉绝大部分，探测器只看
   * 刀口透过的 mW 级；扫描重建焦斑与指向。80 h 是装配/标定估算。
   */
  {
    id: 'plant/laser-beam-profiler',
    name: '10.6 µm 激光光束质量/聚焦/指向量测机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'wavelength', kind: 'range', min: 10.6, max: 10.6, unit: 'µm' },
      { param: 'power', kind: 'range', min: 0, max: 30000, unit: 'W', dir: 'atMost' },
      { param: 'focusSpot', kind: 'range', min: 10, max: 200, unit: 'µm' },
      { param: 'pointing', kind: 'range', min: 0, max: 200, unit: 'µrad', dir: 'atMost' },
    ],
  },

  /**
   * 水流量计：0.5–50 L/min、1–2 %、0.1–1 MPa；量热器的流量项。
   */
  {
    id: 'std/water-flow-meter',
    name: '水流量计',
    unit: '件',
    category: 'part',
    props: [
      { param: 'flow', kind: 'range', min: 0.5, max: 50, unit: 'L/min' },
      { param: 'accuracy', kind: 'range', min: 0.5, max: 2, unit: '%', dir: 'atMost' },
      { param: 'pressure', kind: 'range', min: 0.1, max: 1, unit: 'MPa' },
    ],
  },

  /**
   * 水流量计量具（整机）。由 `std/water-flow-meter` 装成；
   * 测量能力按 gate 记录的实际窗声明：accuracy 1–2%。
   */
  {
    id: 'plant/water-flow-meter',
    name: '水流量计量具',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/accuracy', kind: 'range', min: 1, max: 2, unit: '%', dir: 'atMost' },
    ],
    // 整机与 std/water-flow-meter 由同一装配路线产出，不另声明 composedOf，
    // 避免“整机需要自己路线产出的 std 件”的自环。
  },

  /**
   * 20 kW 水冷量热器：铜体 + 两只热电偶 + 水流量计。
   *
   *   power 0–30000 W、accuracy 0.5–2 %（design）、response 10–60 s。
   * 20 kW 激光进铜体，水带走热量；P = ṁ cp ΔT。流量与温差两项都要标定。
   */
  {
    id: 'plant/laser-calorimeter',
    name: '20 kW 水冷量热器',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'power', kind: 'range', min: 0, max: 30000, unit: 'W', dir: 'atMost' },
      { param: 'accuracy', kind: 'range', min: 0.5, max: 2, unit: '%', dir: 'atMost' },
      { param: 'response', kind: 'range', min: 10, max: 60, unit: 's' },
      // 读数的 30 s 稳定度：功率稳定度/漂移的资格量。量热器本身响应 10–60 s，
      // 所以只到 0–5 %（不是 1e-6 级频率稳定度）。见 qual/gate-rf-generator-20kw。
      { param: 'measure/stability', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 14:1 RF 合成器：27 MHz、20 kW、插损 0.3–0.8 dB（design）。
   *
   * 20 kW 不是一根管子：14 只 1.2–1.6 kW 模块合成。合成器的幅度/相位
   * 一致性决定多少功率进负载、多少变热；插损/隔离是它的底。
   */
  {
    id: 'std/rf-combiner',
    name: '14:1 RF 合成器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'ports', kind: 'range', min: 14, max: 14, unit: '路' },
      { param: 'frequency', kind: 'range', min: 27, max: 27, unit: 'MHz' },
      { param: 'power', kind: 'range', min: 0, max: 25000, unit: 'W', dir: 'atMost' },
      { param: 'insertionLoss', kind: 'range', min: 0.2, max: 1, unit: 'dB', dir: 'atMost' },
      { param: 'isolation', kind: 'range', min: 15, max: 30, unit: 'dB' },
    ],
  },

  /**
   * 20 kW RF 发生器：14 × 1.2–1.6 kW 模块 + 14:1 合成器。
   *
   *   frequency 27 MHz、power 18–22 kW（design）、efficiency 0.7–0.85（design）、
   *   stability 0.2–0.5 %（design）。
   * 这是 500 段小管升级到 slab 的第一块：slab 用电励，不是 500 根管子。
   */
  {
    id: 'plant/rf-generator-20kw',
    name: '20 kW RF 发生器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'frequency', kind: 'range', min: 27, max: 27, unit: 'MHz' },
      { param: 'power', kind: 'range', min: 0, max: 25000, unit: 'W', dir: 'atMost' },
      { param: 'efficiency', kind: 'range', min: 0.5, max: 1, unit: '1' },
      { param: 'stability', kind: 'range', min: 0, max: 2, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * CO₂ slab 放电腔：1 m 级、20 kW 电励、气体循环。
   *
   *   length 0.8–1.2 m、power 0–25 kW、gap 2–5 mm、pressure 10–100 kPa。
   * 与 500 段小管不同：slab 是一个大面积放电，RF 电励，气体横向循环；
   * 难点是放电均匀性、电极平行度、气体热交换与光学腔稳定。
   */
  {
    id: 'std/co2-slab',
    name: 'CO₂ slab 放电腔',
    unit: '件',
    category: 'part',
    props: [
      { param: 'length', kind: 'range', min: 0.8, max: 1.2, unit: 'm' },
      { param: 'power', kind: 'range', min: 0, max: 25000, unit: 'W', dir: 'atMost' },
      { param: 'gap', kind: 'range', min: 1, max: 5, unit: 'mm' },
      { param: 'pressure', kind: 'range', min: 10, max: 100, unit: 'kPa' },
    ],
  },

  /**
   * CO₂ 激光气体循环：风机 + 热交换器 + 稳压。
   *
   *   flow 100–1000 m³/h、pressure 10–100 kPa、tempStability 0.5–2 K。
   * 20 kW 放电的废热靠气体循环带走；气体配比 CO₂:N₂:He 与热交换器是寿命项。
   */
  {
    id: 'plant/laser-gas-loop',
    name: 'CO₂ 激光气体循环',
    unit: '件',
    category: 'part',
    props: [
      { param: 'flow', kind: 'range', min: 100, max: 1000, unit: 'm³/h' },
      { param: 'pressure', kind: 'range', min: 10, max: 100, unit: 'kPa' },
      { param: 'tempStability', kind: 'range', min: 0.5, max: 2, unit: 'K', dir: 'atMost' },
    ],
  },

  /**
   * 10.6 µm 铜镜：金刚石车削 + 金膜。
   *
   *   diameter 50–100 mm、roughness 10–20 nm（design）、
   *   figure 50–100 nm（design）、reflectivity 0.98–0.99（design）。
   * 20 kW 下铜镜吸收 1–2 % 就是 200–400 W 热；水冷/金膜/车削质量是寿命项。
   */
  {
    id: 'std/copper-mirror-10.6',
    name: '10.6 µm 铜镜',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 50, max: 100, unit: 'mm' },
      { param: 'roughness', kind: 'range', min: 5, max: 50, unit: 'nm rms', dir: 'atMost' },
      { param: 'figure', kind: 'range', min: 50, max: 200, unit: 'nm rms', dir: 'atMost' },
      { param: 'reflectivity', kind: 'range', min: 0.9, max: 1, unit: '1' },
    ],
  },

  /**
   * 快刀伺服：压电堆 + 柔顺机构 + 电容闭环。
   *
   *   stroke 10–50 µm、bandwidth 1–10 kHz、resolution 1–10 nm（design）。
   * 离轴抛物镜不是旋转对称件：金刚石车床要快刀伺服逐点修 Z，普通
   * 两轴车床切不出 OAP。这是 OAP 的前置件。
   */
  {
    id: 'plant/fast-tool-servo',
    name: '快刀伺服',
    unit: '件',
    category: 'part',
    props: [
      { param: 'stroke', kind: 'range', min: 10, max: 50, unit: 'µm' },
      { param: 'bandwidth', kind: 'range', min: 1, max: 10, unit: 'kHz' },
      { param: 'resolution', kind: 'range', min: 1, max: 10, unit: 'nm', dir: 'atMost' },
    ],
  },

  /**
   * 10.6 µm 铜离轴抛物镜（OAP）：把 20 kW 光束聚焦到 20 µm。
   *
   *   aperture 50–100 mm、focal 200–1000 mm、roughness 10–20 nm（design）、
   *   figure 50–100 nm（design）、reflectivity 0.98–0.99（design）。
   * OAP 的离轴量/焦距误差直接放大成焦斑与指向误差。
   */
  {
    id: 'std/copper-oap-10.6',
    name: '10.6 µm 铜离轴抛物镜',
    unit: '件',
    category: 'part',
    props: [
      { param: 'aperture', kind: 'range', min: 50, max: 100, unit: 'mm' },
      { param: 'focal', kind: 'range', min: 200, max: 1000, unit: 'mm' },
      { param: 'roughness', kind: 'range', min: 5, max: 50, unit: 'nm rms', dir: 'atMost' },
      { param: 'figure', kind: 'range', min: 50, max: 200, unit: 'nm rms', dir: 'atMost' },
      { param: 'reflectivity', kind: 'range', min: 0.9, max: 1, unit: '1' },
    ],
  },

  /**
   * 10.6 µm ZnSe 输出窗口：φ50–100 mm、5–10 mm、ZnS 增透。
   *
   *   transmission 0.9–0.97（design）、absorption 0.1–0.5 %/cm（design）、
   *   roughness 1–3 nm（design）、flatness 50–100 nm（design）。
   * 20 kW 下 0.1 %/cm 吸收就是 20 W；窗口热畸变会直接进焦斑。
   */
  {
    id: 'std/znse-window',
    name: '10.6 µm ZnSe 输出窗口',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 50, max: 100, unit: 'mm' },
      { param: 'thickness', kind: 'range', min: 5, max: 10, unit: 'mm' },
      { param: 'transmission', kind: 'range', min: 0.8, max: 0.98, unit: '1' },
      { param: 'absorption', kind: 'range', min: 0.1, max: 1, unit: '%/cm', dir: 'atMost' },
      { param: 'roughness', kind: 'range', min: 1, max: 5, unit: 'nm rms', dir: 'atMost' },
      { param: 'flatness', kind: 'range', min: 50, max: 200, unit: 'nm rms', dir: 'atMost' },
    ],
  },

  /**
   * 10.6 µm 铜输出耦合镜：中心孔 5–20 mm + 金膜，水冷。
   *
   *   diameter 50–100 mm、hole 5–20 mm、reflectivity 0.6–0.9（design）、
   *   roughness 10–20 nm（design）。孔/反射率决定输出功率与腔稳定。
   */
  {
    id: 'std/copper-output-coupler-10.6',
    name: '10.6 µm 铜输出耦合镜',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 50, max: 100, unit: 'mm' },
      { param: 'hole', kind: 'range', min: 5, max: 20, unit: 'mm' },
      { param: 'reflectivity', kind: 'range', min: 0.6, max: 0.9, unit: '1' },
      { param: 'roughness', kind: 'range', min: 5, max: 50, unit: 'nm rms', dir: 'atMost' },
    ],
  },

  /**
   * 法拉第杯：1–20 mm 孔、铜杯 + 氧化铝绝缘 + 水冷。
   *
   *   测 IBF 束流；铜杯接静电计，水冷挡 600–900 eV 离子的热负荷。
   */
  {
    id: 'std/faraday-cup',
    name: '法拉第杯',
    unit: '件',
    category: 'part',
    props: [
      { param: 'aperture', kind: 'range', min: 1, max: 20, unit: 'mm' },
      { param: 'current', kind: 'range', min: 0, max: 2, unit: 'A', dir: 'atMost' },
    ],
  },

  /**
   * IBF 束流/均匀性剖面仪：3 只法拉第杯 + 扫描台 + 静电计。
   *
   *   beamCurrent 0–2 A、uniformity 1–5 %（design）、energy 300–1500 eV、
   *   scan 100 mm。IBF 的去除函数靠它标定；束流漂 1 % 就是面形漂 1 %。
   */
  {
    id: 'plant/ion-beam-profiler',
    name: 'IBF 束流/均匀性剖面仪',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'beamCurrent', kind: 'range', min: 0, max: 2, unit: 'A', dir: 'atMost' },
      { param: 'uniformity', kind: 'range', min: 0, max: 10, unit: '%', dir: 'atMost' },
      { param: 'energy', kind: 'range', min: 300, max: 1500, unit: 'eV' },
      { param: 'scan', kind: 'range', min: 50, max: 100, unit: 'mm' },
    ],
  },

  /**
   * 660 mm 小盘数控抛光机：5 轴、φ80–200 盘、0.05–1 psi。
   *
   *   workpiece 660 mm、position 0.5–2 µm（design）、spindle 10–200 rpm。
   * 小盘抛光的去除量按 Preston 算；主轴刚度/转速/抛光盘自身 λ/4 是上游难点。
   */
  {
    id: 'plant/ccp-polisher',
    name: '660 mm 小盘数控抛光机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'workpiece', kind: 'range', min: 660, max: 660, unit: 'mm' },
      { param: 'pad', kind: 'range', min: 80, max: 200, unit: 'mm' },
      { param: 'pressure', kind: 'range', min: 0.05, max: 1, unit: 'psi' },
      { param: 'spindle', kind: 'range', min: 10, max: 200, unit: 'rpm' },
      { param: 'position', kind: 'range', min: 0.5, max: 2, unit: 'µm', dir: 'atMost' },
      { param: 'measure/speed', kind: 'range', min: 0, max: 300, unit: 'rpm', dir: 'atMost' },
    ],
  },

  /**
   * 液压泵：1–20 MPa、0.1–10 L/min、0.5–5 kW；静压转台供油。
   */
  {
    id: 'std/hydraulic-pump',
    name: '液压泵',
    unit: '件',
    category: 'part',
    props: [
      { param: 'pressure', kind: 'range', min: 1, max: 20, unit: 'MPa' },
      { param: 'flow', kind: 'range', min: 0.1, max: 10, unit: 'L/min' },
      { param: 'power', kind: 'range', min: 0.5, max: 5, unit: 'kW' },
    ],
  },

  /**
   * 660 mm 静压转台：轴向/径向 0.1–0.5 µm、角 1–2 角秒。
   *
   *   diameter 660 mm、load 200 kg、oil 10 L；静压油膜刚度/油温是精度项。
   */
  {
    id: 'std/hydrostatic-rotary-table-660',
    name: '660 mm 静压转台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 660, max: 660, unit: 'mm' },
      { param: 'axial', kind: 'range', min: 0, max: 1, unit: 'µm', dir: 'atMost' },
      { param: 'radial', kind: 'range', min: 0, max: 1, unit: 'µm', dir: 'atMost' },
      { param: 'angle', kind: 'range', min: 0, max: 5, unit: '角秒', dir: 'atMost' },
      { param: 'load', kind: 'range', min: 0, max: 200, unit: 'kg' },
    ],
  },

  /**
   * 精密小盘主轴：10–200 rpm、径向/轴向 0.1–0.5 µm、φ80–200 盘。
   *
   * 主轴径向跳动直接进“抛光盘自身 λ/4”；轴承预紧/动平衡是上游。
   */
  {
    id: 'std/precision-spindle',
    name: '精密小盘主轴',
    unit: '件',
    category: 'part',
    props: [
      { param: 'speed', kind: 'range', min: 10, max: 200, unit: 'rpm' },
      { param: 'radial', kind: 'range', min: 0, max: 1, unit: 'µm', dir: 'atMost' },
      { param: 'axial', kind: 'range', min: 0, max: 1, unit: 'µm', dir: 'atMost' },
      { param: 'pad', kind: 'range', min: 80, max: 200, unit: 'mm' },
    ],
  },

];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线
// ═══════════════════════════════════════════════════════════════════════════

export const EUV_HINA_ROUTES: readonly Route[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 2.1 低膨胀玻璃：TiO₂-SiO₂ 直接熔制（100 kg 一批，质量账恰好平）
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **ULE 类低膨胀玻璃：93 kg 石英 + 7 kg TiO₂ → 100 kg 玻璃。**
     *
     *   石英砂（纯化）93 + 二氧化钛 7 → 低膨胀玻璃 100（kg）
     *
     * 质量账：93 + 7 = **100**，恰好平（不带水/磨料；切磨在镜坯那一条）。
     *
     * 地球的 ULE 是**火焰水解**（TiCl₄ + SiCl₄ 在氢氧焰里水解成烟炱再烧结）；
     * 本层没有 TiCl₄ 的氯化工序，所以走**粉体直接熔制**：TiO₂ 与 SiO₂ 粉
     * 干混 → 1 900–2 000 °C 熔融 → 1 050–1 100 °C 退火 96 h（厚件应力 ∝ t²）。
     * 这是设计选择，不是地球的主流工艺；代价是**均匀性**：直接熔制的 TiO₂
     * 条纹比火焰水解法粗，CTE 的批内散差按 0.02–0.05 ppm/K 记 [B/C]。
     *
     * CTE 没有膨胀仪可测：只能用 `plant/ref-flat-interferometer` 做
     * 「20 °C 与 40 °C 两块同料试片的面形差」旁证。所以 0.05 是设计值，
     * 不是读数 —— 这一句与全仓库的 B 类口径一致。
     */
    id: 'make/ule-glass',
    name: 'ULE 类低膨胀玻璃制备',
    produces: [
      {
        item: 'mat/ule-glass',
        qty: q(100),
        gives: [{ param: 'cte', kind: 'range', min: 0.02, max: 0.05 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(93) }] },
      { anyOf: [{ item: 'mat/titanium-dioxide', qty: q(7) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/ref-flat-interferometer',
    ],
    rate: { hours: q(400) },
    steps: [
      {
        note_zh:
          '干混：93 kg 石英粉 + 7 kg TiO₂ 在球磨罐里混 4 h（没有 V 混机，用磨罐滚）—— 混不匀就是条纹',
        performedBy: 'plant/grinder',
      },
      {
        note_zh:
          '熔制：1 900–2 000 °C 熔成板，浇石墨模；TiO₂ 在 1 850 °C 以上会部分还原，所以气氛要氧化',
        performedBy: 'plant/arc-furnace',
        under: [{ param: 'temperature', min: 1900, max: 2000 }],
      },
      {
        note_zh:
          '退火：1 050–1 100 °C 保温 4 h，96 h 缓冷（100 kg 厚板，应力 ∝ t²；冷快了抛好的面形几周就漂）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 1050, max: 1100 }],
      },
      {
        note_zh:
          '切板与粗磨：切成 70 kg 的镜坯料（另 30 kg 是切缝、外圆与退火垫片），两面粗磨到 Ra 0.2',
        performedBy: 'plant/grinder',
      },
      {
        note_zh:
          'CTE 旁证：同料试片在 20 °C 与 40 °C 各测一次面形，差值折 α；没有膨胀仪，0.02–0.05 ppm/K 是设计窗口',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.2 镜坯三级：熔制粗磨 → 抛光 → IBF
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **φ660 镜坯：ULE 玻璃 70 kg → 粗磨镜坯 1 件。**
     *
     *   ULE 70 + 尾矿 100（磨料/抛光粉）+ 水 100 + 氢氟酸 5 → 镜坯 1 件（约 60 kg）
     *
     * 四道：切方 → 粗磨非球面（留 0.3 mm 余量）→ 退火复检 → 超声清洗。
     * 粗磨只到 figure ≤3 000 nm、roughness ≤500 nm；再往下的 20 nm 与 0.1 nm
     * 在抛光与 IBF 两条路线里。**粗磨多花 1 h，抛光省 90 h**，这笔账与
     * `make/ref-flat-blank` 的「3 µm → 0.3 µm」同一个道理。
     *
     * 70 kg 进、60 kg 出：10 kg 是切缝、外圆、非球面去料与磨削泥。
     */
    id: 'make/euv-hina-blank',
    name: 'φ660×80 低膨胀玻璃镜坯制造',
    produces: [
      {
        item: 'plant/euv-stepper-hina/mirror-blank',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 660, max: 660 },
          { param: 'figure', kind: 'range', min: 0, max: 3000 },
          { param: 'roughness', kind: 'range', min: 0, max: 500 },
          { param: 'cte', kind: 'range', min: 0.02, max: 0.05 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/ule-glass',
            qty: q(70),
            need: [{ param: 'cte', kind: 'range', max: 0.1, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/tailings', qty: q(100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(100) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room', 'plant/interferometer', 'plant/ref-flat-interferometer'],
    rate: { hours: q(600) },
    steps: [
      {
        note_zh:
          '切方：线锯切 660×660×80 的方料，留 5 mm 余量；切缝 2 mm，外圆去料 8 kg',
        performedBy: 'plant/grinder',
      },
      {
        note_zh:
          '粗磨离轴非球面：铸铁盘展成，留 0.3 mm 余量；面形到 3 µm、Ra 0.2、厚薄差 0.05 mm',
        performedBy: 'plant/grinder',
      },
      {
        note_zh:
          '退火复检：粗磨后 1 050 °C 保温 2 h、48 h 缓冷，去掉磨削应力；再测一次 CTE 与面形',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 1050, max: 1100 }],
      },
      {
        note_zh:
          '超声清洗 + 氢氟酸轻蚀 50 nm：去磨削变质层（Beilby 层），否则 IBF 修完还会回弹',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
    ],
  },

  {
    /**
     * **抛光：3 000 nm → 20 nm（λ/26 @515 nm），roughness 500 → 0.3 nm。**
     *
     *   镜坯 1 + 尾矿 30 + 水 50 + 氢氟酸 1 → 镜坯 1（figure ≤20 nm）
     *
     * 三块互研的老手艺在 φ660 上不适用（三块 φ660 的自重与热惯性都太大），
     * 这一代用**单块 + 小抛光盘 + 干涉仪闭环**：抛光盘走的是「去除量按驻留
     * 时间分布」，与 `plant/ref-flat-interferometer` 的 108 次换位是同一类
     * 「先配对再谈精度」。20 nm 是可见光干涉能闭环判到的档（λ/26；`ref-flat`
     * 的 0.52 nm 是特例的多光束锐化，不是抛光盘的常态）。
     */
    id: 'make/euv-hina-polish',
    name: '抛光',
    produces: [
      {
        item: 'plant/euv-stepper-hina/mirror-blank',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 660, max: 660 },
          { param: 'figure', kind: 'range', min: 0, max: 20 },
          { param: 'roughness', kind: 'range', min: 0, max: 0.3 },
          { param: 'cte', kind: 'range', min: 0.02, max: 0.05 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/euv-stepper-hina/mirror-blank',
            qty: q(1),
            need: [
              { param: 'figure', kind: 'range', max: 3000, dir: 'atMost' },
              { param: 'roughness', kind: 'range', max: 500, dir: 'atMost' },
              { param: 'cte', kind: 'range', max: 0.1, dir: 'atMost' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/tailings', qty: q(30) }] },
      { anyOf: [{ item: 'mat/water', qty: q(50) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/interferometer', 'plant/ref-flat-interferometer'],
    rate: { hours: q(1200) },
    steps: [
      {
        note_zh:
          '装夹：三点支撑、背面均压；φ660 的自重弓形按 0.21 µm × (660/300)⁴ 折，支撑点必须与检测时一致',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '粗抛：φ200 小盘 + 分级尾矿粉，去 2 µm；每 2 h 用干涉仪读一次，去量按 Preston 算',
        performedBy: 'plant/ccp-polisher',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '精抛：φ80 盘、0.5 µm 粉，去 0.3 µm 到 figure ≤20 nm、Ra ≤0.3 nm；抛光盘自身要先修到 λ/4',
        performedBy: 'plant/ccp-polisher',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '清洗与复测：氢氟酸轻蚀 10 nm 去抛光变质层，再用平晶 Fizeau 读 15 nm 一档 —— 能判 20 nm，判不了 0.1 nm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **IBF 离子束修形：20 nm → 0.1 nm，roughness 0.3 → 0.1 nm。**
     *
     *   镜坯 1 + 氩 0.02 → 镜坯 1（figure ≤0.1 nm）
     *
     * 四轮：20 → 6 → 1.5 → 0.4 → 0.1 nm。按 `euv-mirror.ts` 的去除率
     * 20 nm/min、束斑 φ25 反卷积；φ660 的行程从 300 mm 涨到 700 mm，
     * 驻留时间图的网格 1001×1001 不够，用 2001×2001（4 倍算力，不是 4 倍精度）。
     *
     * ⚠️ 0.1 nm 是**开环声明**：本层可见光干涉读到 0.52 nm，差 5.2 倍；
     * 真正把它变成读数的是 `data/measure/euv-hina.ts` 的 at-wavelength 路线。
     * 这里写 0.1 不表示「已经量到 0.1」，只表示 IBF 的去除量按 0.1 的目标算。
     */
    id: 'make/euv-hina-ibf',
    name: 'φ660×80 低膨胀玻璃镜坯制造',
    produces: [
      {
        item: 'plant/euv-stepper-hina/mirror-blank',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 660, max: 660 },
          { param: 'figure', kind: 'range', min: 0, max: 0.1 },
          { param: 'roughness', kind: 'range', min: 0, max: 0.1 },
          { param: 'cte', kind: 'range', min: 0.02, max: 0.05 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/euv-stepper-hina/mirror-blank',
            qty: q(1),
            need: [
              { param: 'figure', kind: 'range', max: 20, dir: 'atMost' },
              { param: 'roughness', kind: 'range', max: 0.3, dir: 'atMost' },
              { param: 'cte', kind: 'range', max: 0.1, dir: 'atMost' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 50) }] },
    ],
    needs: [
      'plant/ion-beam-figuring',
      'plant/metrology-room',
      'plant/ref-flat-interferometer',
      'plant/phase-shifter',
    ],
    rate: { hours: q(240) },
    steps: [
      {
        note_zh:
          '装夹与对位：φ660 三点支撑，偏心 <0.1 mm；台行程 700 mm，1 µm 定位 × 束斑梯度 → 0.05 nm 面形残差',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          'Ar⁺ 600 eV 四轮：20 → 6 → 1.5 → 0.4 → 0.1 nm；驻留图 t = e ⊛⁻¹ g，2001×2001 网格',
        performedBy: 'plant/robot',
        under: [
          { param: 'pressure', min: 0.05, max: 0.5 },
          { param: 'temperature', min: 19, max: 21 },
        ],
      },
      {
        note_zh:
          '每轮复测：可见光干涉只判「比上一轮好了没有」；0.1 nm 的绝对值留给 at-wavelength 验收',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.3 镀膜：50 对 Mo/Si，8 h/面
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **投影镜镀膜：50 对 Mo/Si，period 6.9 nm。**
     *
     *   镜坯 1 + 氩 5 g + 标定片 1 → 投影镜 1 件
     *
     * 与 `make/euv-mirror-300` 同一台 `plant/euv-coater`、同一本账（五轮氩冲洗 →
     * 150 °C 烘 4 h → 速率标定 → 溅射 → 冷却），差三处：
     *
     *   ① 40 对 → **50 对**（反射率 70 % 要 50 对）[B]
     *   ② period 6.8–7.0 → **6.9 ±0.05**（13.5 nm 的布拉格条件）[A]
     *   ③ φ300 → **φ660**：溅射靶的行程与均匀性要重做，膜厚分布按 ±0.1 % 记
     *
     * 50 对 × 6.9 nm = 345 nm，Mo 2.8 nm/层 + Si 4.1 nm/层；一对 99 s，
     * 50 对 = 82.5 min，加抽气/烘烤/冷却 = **10 h/面**。8 面 = 80 h/台；
     * 一台镀膜机一年能镀 100 台以上，**镀膜不是瓶颈**（与低 NA 那一代同结论）。
     */
    id: 'make/euv-hina-mirror',
    name: '镀完 50 对 Mo/Si 的投影镜制造',
    produces: [
      {
        item: 'plant/euv-stepper-hina/mirror',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 660, max: 660 },
          { param: 'figure', kind: 'range', min: 0, max: 0.15, record: 'mat/atw-figure-record-hina' },
          { param: 'roughness', kind: 'range', min: 0, max: 0.1, record: 'mat/atw-figure-record-hina' },
          { param: 'period', kind: 'range', min: 6.85, max: 6.95, record: 'mat/euv-hina-mirror-measure-record' },
          { param: 'pairs', kind: 'range', min: 50, max: 50 },
          { param: 'reflectivity', kind: 'range', min: 68, max: 70, record: 'mat/euv-hina-mirror-measure-record' },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/euv-stepper-hina/mirror-blank',
            qty: q(1),
            need: [
              { param: 'figure', kind: 'range', max: 0.1, dir: 'atMost' },
              { param: 'roughness', kind: 'range', max: 0.1, dir: 'atMost' },
              { param: 'cte', kind: 'range', max: 0.05, dir: 'atMost' },
            ],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
    ],
    needs: [
      'plant/euv-coater',
      'plant/clean-room',
      'plant/metrology-room',
      'plant/interferometer',
    ],
    rate: { hours: q(10) },
    steps: [
      {
        note_zh:
          '抽气 + 氩冲洗五轮：0.2 Pa 氧 → 2×10⁻⁶ Pa（工作气压的 7 ppm）；φ660 的腔体放气量大，冲洗多一轮',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1, max: 10 }],
      },
      {
        note_zh: '烘烤除气：腔壁 150 °C × 4 h（唯一抽不掉的是吸附水）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 100, max: 200 }],
      },
      {
        note_zh:
          '速率标定：φ660 上布 5 点试片，镀 1 µm 台阶，干涉仪数条纹 → 0.9 %（三点平均）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '镀 50 对：Mo 2.8 nm/28 s、Si 4.1 nm/41 s，各 +15 s，一对 99 s，共 82.5 min；period 6.9 ±0.05',
        performedBy: 'plant/robot',
        under: [
          { param: 'pressure', min: 0.1, max: 1 },
          { param: 'temperature', min: 100, max: 150 },
        ],
      },
      {
        note_zh: '冷却出炉 ≤50 °C/h（Mo 5.0 / Si 2.6 / ULE 0.02–0.05 ppm/K，冷快了膜自己撕开）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '反射率与 period 初检：13.5 nm 反射计只能给相对值（那束光要光源，环自己咬自己），绝对值按 50 对的设计窗口记',
        performedBy: 'plant/euv-reflectometer',
        under: [{ param: 'temperature', min: 20, max: 60 }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.4 光学模块与照明镜组
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **照明镜组：3 面镜 + 照度均匀性 ≥90 %。**
     *
     *   投影镜 3（吃 figure ≤1 的那一档） + 铸铁 200 + 钢板 100 + 铜线 5 + 水 20
     *   → 照明镜组 1 件
     *
     * 照明镜不参与成像，所以不要求 0.15 nm：它要的是**把 250 W 铺满 26×33 的场**
     * 且均匀性 ≥90 %。3 面镜的选择与低 NA 那台一致 [C]。
     */
    id: 'make/euv-hina-illuminator',
    name: 'EUV 光刻机照明镜组制造',
    produces: [
      {
        item: 'plant/euv-stepper-hina/illuminator',
        qty: q(1),
        gives: [
          { param: 'mirrors', kind: 'range', min: 3, max: 3 },
          { param: 'uniformity', kind: 'range', min: 90, max: 95 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/euv-stepper-hina/mirror',
            qty: q(3),
            need: [
              { param: 'figure', kind: 'range', max: 1, dir: 'atMost' },
              { param: 'reflectivity', kind: 'range', min: 68, dir: 'atLeast' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(200) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(100) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    needs: ['plant/metrology-room', 'plant/interferometer', 'plant/clean-room'],
    rate: { hours: q(300) },
    steps: [
      {
        note_zh: '浇照明臂座与镜框（HT250，壁厚 12，浇完时效）',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1300, max: 1450 }],
      },
      {
        note_zh: '刮研三处镜座安装面（共面 5 µm/500 mm）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装 3 面镜：每面 3 点支撑，镜面朝下；用自准直看光瞳填充，均匀性按 13 点测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '均匀性验收：26×33 场内 13 点，目标 ≥90 %（设计值；没有 13.5 nm 面阵探测器，用荧光板 + 相机积分）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **8 镜投影物镜装调：8 面镜 + 腔 + 框架 → wavefront ≤2 nm。**
     *
     *   投影镜 8 + 腔 1 + 框架 1 + 氮 1 → 光学模块 1 件
     *
     * 480 h 的低 NA 装调在这一台不够：8 面 × (装 24 h + 对准 80 h) = 832 h，
     * 加吊装/检漏/复测 = **1 200 h/台** [C]。最慢的一段仍是「没有闭环」——
     * 但这一代有 at-wavelength 干涉仪，所以不是星点圆不圆，而是 2 nm 的波前读数。
     *
     * 波前预算：2×0.15×√8 = 0.85，加镀膜 0.6、装调 1.2、热 1.0 → 1.83 → 门 2。
     */
    id: 'make/euv-hina-optics-module',
    name: '8 镜投影物镜制造',
    produces: [
      {
        item: 'plant/euv-stepper-hina/optics-module',
        qty: q(1),
        gives: [
          { param: 'mirrors', kind: 'range', min: 8, max: 8 },
          { param: 'na', kind: 'range', min: 0.55, max: 0.55 },
          { param: 'wavefront', kind: 'range', min: 0, max: 2 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/euv-stepper-hina/mirror',
            qty: q(8),
            need: [
              { param: 'figure', kind: 'range', max: 0.15, dir: 'atMost' },
              { param: 'roughness', kind: 'range', max: 0.1, dir: 'atMost' },
              { param: 'reflectivity', kind: 'range', min: 68, dir: 'atLeast' },
              { param: 'period', kind: 'range', min: 6.85, max: 6.95 },
              { param: 'pairs', kind: 'range', min: 50, max: 50 },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'plant/euv-stepper-hina/chamber',
            qty: q(1),
            need: [{ param: 'leakRate', kind: 'range', max: 1e-4, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'plant/euv-stepper-hina/frame',
            qty: q(1),
            need: [{ param: 'payload', kind: 'range', min: 8000, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/interferometer',
      'plant/ref-flat-interferometer',
      'plant/phase-shifter',
      'plant/clean-room',
      'plant/euv-vacuum',
      'plant/euv-stepper-hina/atw-interferometer',
    ],
    rate: { hours: q(1200) },
    steps: [
      {
        note_zh:
          '装 8 面镜：每面 3 点支撑、3 自由度，8 × 24 h；镜面朝下，洁净间里做',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '粗对中：自准直 + 平晶 Fizeau，8 × 40 h；先把每面的倾斜/离焦压到 10 nm 量级',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          'at-wavelength 精对中：13.5 nm 干涉仪读 8 面串联波前，逐面调 3 自由度；判据 ≤2 nm RMS（设计值）',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh:
          '吊进真空腔、装铜垫、保压 24 h 判压升（1e-5 Pa 直接读不了，见 euv-source 缺口⑥）',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-4 }],
      },
      {
        note_zh: '复测与记录：波前、镜间距、三次复装读数随件走；不一致就重装（1 200 h 里一半是重装）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.5 台与减振
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **套刻对准传感器：0.5 nm 分辨率、1 nm 准确度。**
     *
     *   参考平晶 1 + 13.5 nm 探测器 2 + 玻璃 1 + 铜线 1 + 氩 0.01 → 传感器 1 件
     *
     * 它是干涉式对准：掩模/片上的光栅标记成像到参考平晶上，读相位差。
     * 0.5 nm 是**读数分辨率**（整机预算里对准分 0.5），1 nm 是**准确度**
     * （标记零点与图形零点的传递误差，设计值 [D]）。
     *
     * ⚠️ 它不解决「可溯源套刻」：那要独立的 DBO/CD-SEM 量具，见
     * `data/measure/euv-hina.ts`。
     */
    id: 'make/euv-hina-alignment-sensor',
    name: 'EUV 光刻机套刻对准传感器制造',
    produces: [
      {
        item: 'plant/euv-stepper-hina/alignment-sensor',
        qty: q(1),
        gives: [
          { param: 'resolution', kind: 'range', min: 0.5, max: 0.5 },
          { param: 'accuracy', kind: 'range', min: 1, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/ref-flat-interferometer/reference-flat', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-reflectometer/detector', qty: q(2) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/euv-coater'],
    rate: { hours: q(80) },
    steps: [
      {
        note_zh: '镀参考光栅：在 φ100 玻璃上镀铝 100 nm，用全息/机械刻 1 µm 光栅（本层刻线 5 µm，1 µm 靠缩微）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装两只 13.5 nm 探测器与参考平晶，调共焦（猫眼位）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '标定：用 `plant/laser-stage` 的 20 nm 台做位移源，读相位差 → 0.5 nm 分辨率、1 nm 准确度',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **双工件台：1 nm 定位、0.5 nm 读数、300 mm 行程。**
     *
     *   铸铁 300 + 45 钢 40 + 铜线 10 + 玻璃 2 + 尾矿 10 + 水 60 + 对准传感器 1
     *   → 双工件台 1 件
     *
     * 与低 NA 那台 `make/euv-stepper-stage` 的 1 µm 差 1000 倍：这一台是
     * **激光干涉闭环**（外差 + 0.5 nm 读数），不是刻度盘 + 机器人视觉。
     * 行程 300 mm 与低 NA 相同 [C]，但导轨的直线度要按 1 nm/300 mm 刮研 ——
     * 这是本文件工时最贵的一件（300 h）。
     */
    id: 'make/euv-hina-stage',
    name: 'high-NA EUV 光刻机双工件台制造',
    produces: [
      {
        item: 'plant/euv-stepper-hina/stage',
        qty: q(1),
        gives: [
          { param: 'positionError', kind: 'range', min: 0, max: 1 },
          { param: 'readout', kind: 'range', min: 0, max: 0.5 },
          { param: 'stroke', kind: 'range', min: 300, max: 400 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(300) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(40) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(10) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(2) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(60) }] },
      {
        anyOf: [
          {
            item: 'plant/euv-stepper-hina/alignment-sensor',
            qty: q(1),
            need: [
              { param: 'resolution', kind: 'range', max: 0.5, dir: 'atMost' },
              { param: 'accuracy', kind: 'range', max: 1, dir: 'atMost' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: [
      'plant/laser-stage',
      'plant/metrology-room',
      'plant/gauge-block',
      'plant/clean-room',
    ],
    rate: { hours: q(300) },
    steps: [
      {
        note_zh: '浇箱式床身与两套托盘座（HT250 300 kg，一次浇成避免焊缝），人工时效 6 个月',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1300, max: 1450 }],
      },
      {
        note_zh: '刮研两轴导轨：1 nm/300 mm 的直线度靠三块互研 + 激光干涉读，12 点/25 mm²',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '磨丝杠到 2 µm/300 mm，配消隙螺母；丝杠只做粗动，精动靠音圈 + 干涉闭环',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '车自转轴与两只托盘（端跳 <1 µm），装角锥反射镜（间距 100 mm）',
        performedBy: 'lathe',
      },
      {
        note_zh:
          '装对准传感器与干涉光路：用 `plant/laser-stage` 标 300 mm 行程，判 1 nm 定位 / 0.5 nm 读数',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **减振台：钢弹簧 + 铜线圈主动阻尼，残余振动 ≤1 nm。**
     *
     *   铸铁 500 + 45 钢 100 + 铜线 20 + 水 30 → 减振台 1 件
     *
     * 本层没有橡胶/油（`mat/rubber` 0 条目），所以不用气囊；钢弹簧的刚度靠
     * 几何（k ∝ d⁴/D³），阻尼靠铜线圈反相驱动。惯性参考用 `plant/laser-stage`
     * 的干涉读数（不是地震仪，地震仪本层也没有）—— 这是设计选择 [D]。
     *
     * 1 nm 是 1–100 Hz 的残余振动设计值；它比低 NA 那台的 50 µm 好 5 万倍，
     * 但**不是实测**：没有 nm 级振动台，判据只能写「装好后 1 h 内干涉条纹不跳」。
     */
    id: 'make/euv-hina-isolation',
    name: 'EUV 光刻机减振台制造',
    produces: [
      {
        item: 'plant/euv-stepper-hina/isolation',
        qty: q(1),
        gives: [
          { param: 'vibration', kind: 'range', min: 0, max: 1 },
          { param: 'payload', kind: 'range', min: 5000, max: 5000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(500) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(100) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(30) }] },
    ],
    needs: ['plant/metrology-room', 'plant/laser-stage'],
    rate: { hours: q(200) },
    steps: [
      {
        note_zh: '浇铸铁基座（500 kg，壁厚 40）与三组弹簧座；基座的作用是热惯性，不是承重',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1300, max: 1450 }],
      },
      {
        note_zh: '磨 45 钢弹簧（线径 20、有效圈 8）与铜线圈骨架；弹簧刚度按 5 t 载荷配',
        performedBy: 'lathe',
      },
      {
        note_zh: '装弹簧 + 音圈 + 干涉参考镜；闭环带宽 100 Hz，增益由 `plant/controller-24axis` 整定',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '验收：1 h 内干涉条纹不跳；没有 nm 级振动台，1 nm 是设计值',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.6 框架与真空腔
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **整机框架：8 000 kg 载荷、减振后残余 ≤2 nm。**
     *
     *   铸铁 1 500 + 钢板 200 + 矿棉 20 + 水 30 → 框架 1 件
     *
     * 低 NA 那台是 3 000 kg/50 µm；这一台 8 000 kg，判据是**减振台之后**的
     * 2 nm。质量把结构模态推高，但 2 nm 是减振台的功劳，不是铸铁的 ——
     * 这一句写在这里，免得把「更重」当成「更准」。
     */
    id: 'make/euv-hina-frame',
    name: 'high-NA EUV 光刻机整机框架装配',
    produces: [
      {
        item: 'plant/euv-stepper-hina/frame',
        qty: q(1),
        gives: [
          { param: 'payload', kind: 'range', min: 8000, max: 8000 },
          { param: 'vibration', kind: 'range', min: 0, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(1500) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(200) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(30) }] },
    ],
    needs: ['plant/metrology-room', 'plant/gauge-block'],
    rate: { hours: q(120) },
    steps: [
      {
        note_zh: '浇箱式床身（壁厚 20，浇完人工时效 6 个月）',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1300, max: 1450 }],
      },
      {
        note_zh: '刮研三处安装面（镜座、台座、光源接口，共面 5 µm/2 000 mm）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '焊恒温罩骨架、包矿棉；20 °C 水盘管随腔体走',
        performedBy: 'plant/sheet-shop',
      },
    ],
  },

  {
    /**
     * **投影光学真空腔：φ1 000 × 1 500，漏率 ≤1e-4 Pa·L/s。**
     *
     *   钢板 800 + 铜 80 + 石英 5 + 水 100 → 腔体 1 件
     *
     * 钢板 800 kg 的算法：筒面 π×1.0×1.5 = 4.71 m² + 两端 1.57 m² = 6.28 m²，
     * 10 mm 厚 → 0.0628 m³ × 7 850 = 493 kg；法兰、接管、水套、支腿再 307 kg。
     */
    id: 'make/euv-hina-chamber',
    name: 'high-NA EUV 光刻机投影光学真空腔制造',
    produces: [
      {
        item: 'plant/euv-stepper-hina/chamber',
        qty: q(1),
        gives: [
          { param: 'leakRate', kind: 'range', min: 0, max: 1e-4 },
          { param: 'bakeTemperature', kind: 'range', min: 150, max: 300 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(800) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(80) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(100) }] },
    ],
    needs: ['plant/evaporator', 'plant/clean-room'],
    rate: { hours: q(160) },
    steps: [
      {
        note_zh: '四瓣折弯、卷圆、焊筒体与 4 条纵缝（没有卷板机，见 euv-source 缺口④）',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh: '焊水冷夹套与接管座（铜管盘在筒身上，焊满不留气隙）',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh: '车两端 CF 法兰与铜垫密封槽（平面度 0.02、Ra 0.8）',
        performedBy: 'lathe',
      },
      {
        note_zh: '装 4 个 φ100 石英观察窗，水压 0.2 MPa 保 30 min，涂酒精查漏（没有氦检漏）',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1, max: 10 }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.7 光源：20 kW 驱动激光 → 250 W / 13.5 nm 模块
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **20 kW CO₂ 驱动激光：`plant/euv-source/laser` 的第二个规格。**
     *
     *   石英 1 000 + 铜 2 000 + CO₂ 500 + 氮 500 + 氩 500 + 铜线 1 000 + 水 25 000
     *   → CO₂ 激光头 1 件（20 kW）
     *
     * 本仓库既有的 `make/euv-co2-laser` 是 **1 m 管 / 30–50 W**（`euv-source.ts`
     * 问题 2：氩代氦）。20 kW 按同一门手艺外推：40 W/m → **500 m 管**
     * （或 500 段 1 m 管并联/折叠）[C]。这是一条**设计路线**：
     *
     *   · 20 kW 的快轴流/板条结构在地球上体积小得多，但本模型没有那条结构的条目；
     *     按 500 m 管记账是取本仓库已有的手艺，不是地球的最优解。
     *   · **10.6 µm 输出窗**：地球用 ZnSe。本路线设计成**无窗差分抽气**——
     *     CO₂ 腔与源腔共真空，铜镜直接折转；代价是镜面污染与对准漂移。
     *     走 ZnSe 窗要另立 `mat/zinc-selenide`（锌、硒两链都在；缺窗口级
     *     CVD/热压与 10.6 µm 透过率量具）。这是**一个材料条目的缺口**。
     *   · 电源 `plant/euv-pulser` 已有 1 kV/10 kA 的脉冲能力；20 kW 连续
     *     CO₂ 的直流电源不在这一件里，记在 needs。
     */
    id: 'make/euv-hina-laser',
    name: 'CO₂ 激光头制造',
    produces: [
      {
        item: 'plant/euv-source/laser',
        qty: q(1),
        gives: [{ param: 'power', kind: 'range', min: 20000, max: 20000, record: 'mat/laser-power-record' }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2000) }] },
      { anyOf: [{ item: 'mat/co2', qty: q(500) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(500) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(500) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(25000) }] },
    ],
    needs: [
      'plant/clean-room',
      'plant/metrology-room',
      'plant/euv-pulser',
    ],
    rate: { hours: q(2000) },
    steps: [
      {
        note_zh:
          '拉管 500 段：φ10/φ12 × 1 000 熔石英管，1 900–2 200 °C；管内壁不许有气泡（放电打火）',
        performedBy: 'plant/arc-furnace',
        under: [{ param: 'temperature', min: 1900, max: 2200 }],
      },
      {
        note_zh: '车铜电极对与铜镜座（镜面 Ra 0.02），500 段并联/折叠成腔',
        performedBy: 'lathe',
      },
      {
        note_zh:
          '玻璃-金属封接、抽气、充 CO₂:N₂:Ar = 1:1:3 到 10 kPa；无窗差分抽气输出（设计选择）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '出光试验：铜镜衰减 + 水量热，量 10.6 µm 输出；目标是 20 kW（每段 40 W × 500 段）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '石英 1 000 + 铜 2 000 + CO₂ 500 + 氮 500 + 氩 500 + 铜线 1 000 + 水 25 000 → 20 kW 激光头 1 件；水是冷却水，气体是腔体充气（不漏就长期用），石英/铜的边角料与切屑不进成品',
  },

  {
    /**
     * **高-NA 收集镜：φ300 椭球，deviation ≤1 nm、roughness ≤0.1 nm。**
     *
     *   石英 12 + 尾矿 60 + 水 40 + 氢氟酸 1.5 → 收集镜 1 件
     *
     * 这是 `plant/euv-source/collector` 的**第二条路线**（同一个 id）：
     * 既有 `make/euv-source-collector` 交 deviation ≤50 µm（非球面开环去料），
     * 这一条用 IBF + 零位检验把它压到 **≤1 nm** [D]：
     *
     *   熔制 φ320 × 40 → 退火 → 粗磨椭球 → 手抛 λ/20 → IBF 五轮 → 零位检验
     *
     * 为什么这一个是 1 nm 而不是镜坯的 0.1 nm：收集镜是**椭球**，本层的
     * 非球面零位检具（`plant/null-test` + `plant/ellipsoid-stitch`）只到 1 nm 档；
     * 要 0.1 nm 得加 at-wavelength 拼接，那是另一条路线（R8 升级项）。
     */
    id: 'make/euv-hina-collector',
    name: 'EUV 收集镜坯制造',
    produces: [
      {
        item: 'plant/euv-source/collector',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 300, max: 300 },
          { param: 'figure', kind: 'range', min: 0, max: 1, record: 'mat/collector-figure-record' },
          { param: 'roughness', kind: 'range', min: 0, max: 0.1 },
          { param: 'deviation', kind: 'range', min: 0, max: 1, record: 'mat/collector-figure-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(12) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(60) }] },
      { anyOf: [{ item: 'mat/water', qty: q(40) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(3, 2) }] },
    ],
    needs: [
      'plant/ion-beam-figuring',
      'plant/null-test',
      'plant/ellipsoid-stitch',
      'plant/ref-flat-interferometer',
      'plant/metrology-room',
      'plant/clean-room',
    ],
    rate: { hours: q(400) },
    steps: [
      {
        note_zh: '熔制 φ320 × 40 石英盘（石墨模浇板，1 900–2 200 °C）',
        performedBy: 'plant/arc-furnace',
        under: [{ param: 'temperature', min: 1900, max: 2200 }],
      },
      {
        note_zh: '退火：1 100 °C 保温 4 h、48 h 缓冷（应力不除，面形几周就漂）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 1050, max: 1100 }],
      },
      {
        note_zh: '粗磨椭球 R343：铸铁凸盘展成，厚薄差 0.05 mm；手抛到 λ/20 = 32 nm',
        performedBy: 'plant/grinder',
      },
      {
        note_zh:
          'IBF 五轮：32 → 8 → 2 → 0.5 → 0.2 → 0.1 nm；束斑 φ25，只修低频',
        performedBy: 'plant/robot',
        under: [
          { param: 'pressure', min: 0.05, max: 0.5 },
          { param: 'temperature', min: 19, max: 21 },
        ],
      },
      {
        note_zh:
          '零位检验：Hindle 球 + 拼接，判 deviation ≤1 nm（1 nm 是零位检具的底，0.1 nm 要 at-wavelength 拼接）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **250 W / 13.5 nm 光源模块装配。**
     *
     *   腔 1 + 收集镜 1 + 液滴发生器 1 + 20 kW 激光 1 + 碎屑抑制 1 + IF 模块 1
     *   + 锡 5 kg + 氢 0.1 kg → 光源模块 1 件（250 W）
     *
     * 250 W = 20 kW × 1.25 % [A/B]。收集镜要 deviation ≤1 nm 的那一档
     * （`make/euv-hina-collector`），否则 3 % 通过率的 50 µm 椭球会把 250 W
     * 直接砍成 7.5 W（`euv-fab.ts` 降级 8 的同一条账）。
     *
     * 锡液滴 50 kHz、氢帘 1 sccm 是 LPP 的工况；本层氢只能到 1 sccm
     * （`euv-source.ts` 问题 1 的氢账），所以碎屑抑制仍以铜箔百叶为主。
     */
    id: 'make/euv-hina-source',
    name: '250 W / 13.5 nm 光源模块装配',
    produces: [
      {
        item: 'plant/euv-stepper-hina/source',
        qty: q(1),
        gives: [
          { param: 'power', kind: 'range', min: 250, max: 250 },
          { param: 'wavelength', kind: 'range', min: 13.5, max: 13.5 },
          { param: 'inBandPower', kind: 'range', min: 0, max: 500, record: 'mat/source-spectrum-record' },
          { param: 'bandwidth', kind: 'range', min: 0.1, max: 2, record: 'mat/source-spectrum-record' },
          { param: 'etendue', kind: 'range', min: 0, max: 10, record: 'mat/source-spectrum-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/euv-source/vessel', qty: q(1) }] },
      {
        anyOf: [
          {
            item: 'plant/euv-source/collector',
            qty: q(1),
            need: [
              { param: 'aperture', kind: 'range', min: 300, dir: 'atLeast' },
              { param: 'figure', kind: 'range', max: 1, dir: 'atMost' },
              { param: 'roughness', kind: 'range', max: 0.1, dir: 'atMost' },
              { param: 'deviation', kind: 'range', max: 1, dir: 'atMost' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'plant/euv-source/droplet-generator', qty: q(1) }] },
      {
        anyOf: [
          {
            item: 'plant/euv-source/laser',
            qty: q(1),
            need: [{ param: 'power', kind: 'range', min: 20000, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'plant/euv-source/debris-trap', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-source/if-module', qty: q(1) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(5) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/euv-vacuum', 'plant/euv-pulser'],
    rate: { hours: q(160) },
    steps: [
      {
        note_zh:
          '装收集镜：φ300 椭球进腔，三点支撑；先对中第一焦点再锁紧（夹应力会让 1 nm 的 deviation 白做）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '装液滴发生器 + 20 kW 激光：喷嘴 18–20 µm、50 kHz；激光焦点与液滴同轴，偏 0.1 mm 就打偏',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '装碎屑抑制 + IF 模块：铜箔百叶在收集镜前 200 mm；IF 光阑 φ1 mm 对到 1.2 mm 像点',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '抽气/检漏 + 出光：粗抽到 1 Pa 涂酒精查漏，再烘 150 °C 看压升；出光后用 IF 后的量热计读 250 W',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-4 }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.8 at-wavelength 干涉仪：验收尺自己也要造
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **13.5 nm at-wavelength 干涉仪装配。**
     *
     *   13.5 nm 腔 1 + 探测器 2 + 参考平晶 1 + 光电二极管 1 + 氮 1 → 干涉仪 1 台
     *
     * 光路：`plant/euv-source` 的 13.5 nm 光 → 针孔衍射球面波 → 参考镜与工件
     * → 探测器读干涉条纹。针孔要 φ1–2 µm（本层刻线 5 µm，靠缩微/电化学修）。
     * 它 `needs` 光源与真空，因为 13.5 nm 在大气里走不了 1 cm。
     *
     * 0.1 nm 的 resolution/figure/roughness 是设计值 [D]；本层能给的旁证是
     * `plant/ref-flat-interferometer` 的 0.52 nm（可见光）与 `plant/phase-shifter`
     * 的 0.47 nm 读数 —— 差 5.2 倍这一格必须写在 `data/measure/euv-hina.ts`。
     */
    id: 'make/euv-hina-atw-interferometer',
    name: '13.5 nm at-wavelength 干涉仪装配',
    produces: [
      {
        item: 'plant/euv-stepper-hina/atw-interferometer',
        qty: q(1),
        gives: [
          { param: 'measure/resolution', kind: 'range', min: 0.1, max: 0.1 },
          { param: 'measure/figure', kind: 'range', min: 0.1, max: 0.1 },
          { param: 'measure/roughness', kind: 'range', min: 0.1, max: 0.1 },
          { param: 'measure/aperture', kind: 'range', min: 660, max: 660 },
          { param: 'measure/wavelength', kind: 'range', min: 13.5, max: 13.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/euv-reflectometer/chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-reflectometer/detector', qty: q(2) }] },
      { anyOf: [{ item: 'plant/ref-flat-interferometer/reference-flat', qty: q(1) }] },
      { anyOf: [{ item: 'std/photodiode-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1) }] },
    ],
    needs: [
      'plant/euv-source',
      'plant/euv-vacuum',
      'plant/metrology-room',
      'plant/clean-room',
      'plant/phase-shifter',
      'plant/laser-stage',
    ],
    rate: { hours: q(240) },
    steps: [
      {
        note_zh: '装腔与探测器：13.5 nm 腔（1e-4 Pa·L/s）+ 两只探测器，金黑烧结前只能到 60 °C',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '装针孔与参考平晶：φ1–2 µm 针孔产生球面波；参考平晶用 `ref-flat` 的 λ/1000 件，可见光先对准',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '8 帧移相（`plant/phase-shifter`）读 13.5 nm 干涉条纹；标定用一块已知台阶/球面，判 resolution ≤0.1 nm',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh:
          '不确定度：0.1 nm 是设计值；本层没有 13.5 nm 的溯源头，只有可见光 0.52 nm 的交叉旁证。验收读数与不确定度账写在 `data/measure/euv-atw.ts`（figure 0.10–0.25、U 0.11–0.15）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.9 整机装配
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **high-NA 整机装配：光学模块 + 照明 + 台 + 减振 + 光源 → 1 台。**
     *
     *   optics-module 1 + illuminator 1 + stage 1 + isolation 1 + source 1 + 氮 2
     *   → plant/euv-stepper-hina 1 台
     *
     * 装配 600 h [C]：物镜吊装 120 + 照明 80 + 双台 160 + 减振/框架 80 +
     * 光源接口 80 + 整机联调 80。联调的三条判据：
     *
     *   ① wavefront ≤2 nm（at-wavelength 干涉仪，8 面串联）
     *   ② overlay 2.7 nm（**已资格**；8 nm 后道的每层门。机器设计目标是 1.1 nm
     *      ——2026 公开路线图的 EXE:5000 匹配机台数——但本层没有把 1.1 变成读数：
     *      可溯源产品套刻的合格判定落在 2.7，1.1 是升级目标，不是已交付）
     *   ③ throughput ≥110 片/h（单层口径；50 mJ/cm²、26×16.5 场、250 W、一次一颗 die）
     *
     * overlay 这一格的凭据是 `mat/overlay-product-record`（`measure/euv-hina-product-overlay`：
     * 独立 DBO + `std/overlay-standard-005` 校零 + `mat/overlay-traceable-record` 链预算，
     * 10 点 X/Y）。它不再是机内重复性：机内那条在 `measure/euv-hina-overlay`（`mat/overlay-record-hina`），
     * 两条记录不混。
     *
     * ⚠️ 2.7 是合格判定窗口，不是单次读数；读数要在本机真跑后收窄。
     * 1.1 的升级路线 = 更紧的机台/量测（见问题台账）；在此之前不把 1.1 写成窗口。
     *
     * ⚠️ 这台机器**不含掩模**：掩模是工艺件（一层一块，20 块/套），
     * 不是机器的零件 —— 与 `plant/euv-stepper` 同一个写法。
     */
    id: 'make/euv-hina',
    name: 'high-NA 整机装配',
    produces: [
      {
        item: 'plant/euv-stepper-hina',
        qty: q(1),
        gives: [
          { param: 'na', kind: 'range', min: 0.55, max: 0.55 },
          { param: 'field', kind: 'range', min: 26, max: 26 },
          { param: 'fieldLong', kind: 'range', min: 33, max: 33 },
          { param: 'overlay', kind: 'range', min: 0, max: 2.7, record: 'mat/overlay-product-record' },
          { param: 'throughput', kind: 'range', min: 110, max: 200 },
          { param: 'sourcePower', kind: 'range', min: 250, max: 250 },
          { param: 'mirrors', kind: 'range', min: 12, max: 12 },
          { param: 'wavefront', kind: 'range', min: 0, max: 2 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/euv-stepper-hina/optics-module',
            qty: q(1),
            need: [
              { param: 'mirrors', kind: 'range', min: 8, dir: 'atLeast' },
              { param: 'na', kind: 'range', min: 0.55, dir: 'atLeast' },
              { param: 'wavefront', kind: 'range', max: 2, dir: 'atMost' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'plant/euv-stepper-hina/illuminator',
            qty: q(1),
            need: [
              { param: 'mirrors', kind: 'range', min: 3, dir: 'atLeast' },
              { param: 'uniformity', kind: 'range', min: 90, dir: 'atLeast' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'plant/euv-stepper-hina/stage',
            qty: q(1),
            need: [
              { param: 'positionError', kind: 'range', max: 1, dir: 'atMost' },
              { param: 'readout', kind: 'range', max: 0.5, dir: 'atMost' },
              { param: 'stroke', kind: 'range', min: 300, dir: 'atLeast' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'plant/euv-stepper-hina/isolation',
            qty: q(1),
            need: [
              { param: 'vibration', kind: 'range', max: 1, dir: 'atMost' },
              { param: 'payload', kind: 'range', min: 5000, dir: 'atLeast' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'plant/euv-stepper-hina/source',
            qty: q(1),
            need: [
              { param: 'power', kind: 'range', min: 250, dir: 'atLeast' },
              { param: 'wavelength', kind: 'range', min: 13.5, max: 13.5 },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(2) }] },
    ],
    needs: [
      'plant/clean-room',
      'plant/metrology-room',
      'plant/euv-vacuum',
      'plant/laser-stage',
      'plant/gauge-block',
      'plant/euv-pulser',
    ],
    rate: { hours: q(600) },
    steps: [
      {
        note_zh:
          '① 吊装光学模块：8 面镜组件进框架，三点支撑；波前 2 nm 是 at-wavelength 读数，不是星点判据',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 装照明镜组：3 面镜进照明臂，调光瞳填充；26×33 场 13 点均匀性 ≥90 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 装双工件台与减振台：300 mm 行程、1 nm 定位、0.5 nm 读数；减振台 5 t 载荷，1 h 条纹不跳',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '④ 接光源与真空：250 W 模块进光源接口，粗抽到 1 Pa 查漏，再烘 150 °C 看压升',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh:
          '⑤ 整机联调：波前 ≤2 nm、套刻 ≤1.1 nm（匹配机台 design）、throughput ≥110 片/h（单层，50 mJ/cm²）；三项都记录，缺一项不算装完',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.10 8 nm SoC：8 重成像 + 30 nm 后道 + 整机
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **8 重成像：node 16–24 → 8–10。**
     *
     *   栅电极片 1 + 氧化硅 0.02 + 胶 0.001 + C₄F₆ 0.002 + 氩 0.002 + 氧 0.005
     *   + 水 4 → 器件片 1（node 8–10）
     *
     * 做法：高-NA 先画 **64–80 nm 的芯轴**（NA 0.55 的半节距 6.1 nm，画这个
     * 尺寸绰绰有余），然后**三轮侧墙**：SADP 一圈 + SAQP 两圈 = 2×2×2 = 8 重。
     *
     *   80 → 40 → 20 → 10 nm；64 → 32 → 16 → 8 nm
     *
     * 所以 `gives.node` 是 **8–10**，不是 8 一个点：三轮的线宽均匀性
     * （LER 与套刻累加）决定它落在 8 还是 10。⚠️ 本层没有 LER 量具
     * （`saqp.ts` 缺口①），所以 8–10 是**设计窗口**，不是读数。
     */
    id: 'make/device-wafer-oct',
    name: '前道完成片制造',
    produces: [
      {
        item: 'mat/device-wafer',
        qty: q(1),
        gives: [{ param: 'node', kind: 'range', min: 8, max: 10 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/gate-electrode-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(2, 100) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/cf4', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/water', qty: q(4) }] },
    ],
    needs: [{ item: 'plant/euv-stepper-hina', qty: q(1), need: [{ param: 'na', kind: 'range', min: 0.55, dir: 'atLeast' }, { param: 'overlay', kind: 'range', max: 2.7, dir: 'atMost' }], onRelax: 'functional-lost' }, 'plant/euv-source', 'plant/euv-vacuum', 'plant/euv-pulser', 'plant/cd-sem', 'plant/clean-room', 'plant/metrology-room', 'plant/water-polisher', { item: 'std/euv-mask-32nm', qty: q(1) }],
    rate: { hours: q(48) },
    steps: [
      {
        note_zh:
          '① 高-NA 曝光芯轴：64–80 nm 线，26×16.5 单场一次一颗 die（10×10 的 die 放得下，不再 25 块拼接）',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh:
          '② 第一圈侧墙（SADP）：ALD 氧化硅 20 nm + 回刻，去芯轴；80 → 40 nm',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 200, max: 300 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '③ 第二圈侧墙（SAQP 第一轮）：40 → 20 nm；C₄F₆/Ar 刻蚀，选择比 ≥5',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'pressure', min: 0.1, max: 10 },
          { param: 'temperature', min: 15, max: 80 },
        ],
      },
      {
        note_zh:
          '④ 第三圈侧墙（SAQP 第二轮）：20 → 10 nm；再走一遍 ALD + 回刻',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 200, max: 300 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '⑤ CD-SEM 读线宽：10 点，判 8–10 nm；LER 读不了（`saqp.ts` 缺口①），只能按 SEM 像的毛边记',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
    ],
  },

  {
    /**
     * **8 nm 首片：设计套刻先跑第一片，破“没有记录就不能跑”的循环。**
     *
     * 量产路线 `make/device-wafer-oct` 的 `needs` 要 `overlay ≤2.7` 的
     * record；record 又必须在片上读。这条首片路线不要求 overlay record，
     * 只要求整机的 na/场，先跑一片 8–10 nm 的器件片；测完这一片，才谈
     * 量产记录。它不是量产豁免：首片单独一个条目 `mat/device-wafer-first`，
     * 不能当 `mat/device-wafer` 用。
     *
     * 工艺与量产片相同：高-NA 芯轴 → SADP → SAQP 两轮；差别只在“没有
     * overlay 记录”这一条。首片套刻读出来是多少就是多少，不写设计值。
     */
    id: 'make/device-wafer-oct-first',
    name: '8 nm 首片制造',
    produces: [
      {
        item: 'mat/device-wafer-first',
        qty: q(1),
        gives: [
          { param: 'node', kind: 'range', min: 8, max: 10 },
          { param: 'stage', kind: 'enum', oneOf: ['first-article'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/gate-electrode-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(2, 100) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/cf4', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/water', qty: q(4) }] },
    ],
    needs: [
      {
        item: 'plant/euv-stepper-hina',
        qty: q(1),
        need: [{ param: 'na', kind: 'range', min: 0.55, dir: 'atLeast' }],
        onRelax: 'functional-lost',
      },
      'plant/euv-source',
      'plant/euv-vacuum',
      'plant/euv-pulser',
      'plant/clean-room',
      'plant/metrology-room',
      'plant/water-polisher',
      { item: 'std/euv-mask-32nm', qty: q(1) },
    ],
    rate: { hours: q(48) },
    steps: [
      {
        note_zh:
          '① 高-NA 曝光芯轴：64–80 nm 线；首片不做套刻记录，跑完直接测',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh:
          '② 第一圈侧墙（SADP）：ALD 氧化硅 20 nm + 回刻，去芯轴；80 → 40 nm',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 200, max: 300 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '③ 第二圈侧墙（SAQP 第一轮）：40 → 20 nm；C₄F₆/Ar 刻蚀，选择比 ≥5',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'pressure', min: 0.1, max: 10 },
          { param: 'temperature', min: 15, max: 80 },
        ],
      },
      {
        note_zh:
          '④ 第三圈侧墙（SAQP 第二轮）：20 → 10 nm；再走一遍 ALD + 回刻',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 200, max: 300 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '⑤ CD-SEM 读线宽：10 点，判 8–10 nm；首片套刻由 `measure/euv-hina-product-overlay` 读',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
    ],
  },

  {
    /**
     * **15–20 层 30 nm 铜后道。**
     *
     *   器件片 1 + 胶 0.02 + C₄F₆ 0.01 + 氩 0.01 + 氧 0.01 + 钛 0.004
     *   + 氨 0.002 + 铜 0.01 + 籽晶片 15 + 超填液 0.3 + 硫酸 0.002 + 水 60
     *   → 互连片 1（lineWidth 25–30、15–20 层）
     *
     * 八格：lineWidth ≤30、AR 2–2.5、dishing 3–5、barrier 2.0、k 2.4–2.5、
     * layers 15–20。每层：高-NA 曝光（30 nm 线，NA 0.55 半节距 6.1 nm，单程够）
     * → RIE 刻沟 → ALD 2 nm TiN → 镀铜 → CMP。15–20 层就是把这套走 15–20 遍。
     *
     * ⚠️ `layers` 是**计数**，不是循环；模型没有循环，第 n+1 层就是在这一个 id
     * 上再跑一遍（与 `damascene-2nm.ts` 的 stack-8 同一个写法）。
     * ⚠️ dishing 3–5 与 barrier 2.0 是本层 ALD + CMP 的**设计值**：ALD 2 nm
     * 的台阶覆盖 ≥90 % 要靠 `plant/ald-reactor`，CMP 的 3–5 nm 要比
     * `stack-8` 的 7–12 好一档 —— 这一档没有实测，按 B 类记。
     */
    id: 'make/beol-30nm-15layer',
    name: '单层铜互连片制造',
    produces: [
      {
        item: 'mat/damascene-layer',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 25, max: 30 },
          { param: 'aspectRatio', kind: 'range', min: 2, max: 2.5 },
          { param: 'dishing', kind: 'range', min: 3, max: 5 },
          { param: 'barrierThickness', kind: 'range', min: 2, max: 2 },
          { param: 'kValue', kind: 'range', min: 2.4, max: 2.5 },
          { param: 'layers', kind: 'range', min: 15, max: 20 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/device-wafer',
            qty: q(1),
            need: [{ param: 'node', kind: 'range', max: 10, dir: 'atMost' }],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/photoresist', qty: q(2, 100) }] },
      { anyOf: [{ item: 'mat/cf4', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/titanium', qty: q(4, 1000) }] },
      { anyOf: [{ item: 'mat/ammonia', qty: q(2, 1000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/cu-seed-wafer', qty: q(15) }] },
      { anyOf: [{ item: 'mat/superfill-bath-3', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(2, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(60) }] },
    ],
    needs: [{ item: 'plant/euv-stepper-hina', qty: q(1), need: [{ param: 'overlay', kind: 'range', max: 2.7, dir: 'atMost' }, { param: 'field', kind: 'range', min: 26, dir: 'atLeast' }], onRelax: 'functional-lost' }, 'plant/euv-source', 'plant/euv-vacuum', 'plant/euv-pulser', 'plant/cmp-uniformity-kit', 'plant/cd-sem', 'plant/clean-room', 'plant/metrology-room', 'plant/water-polisher', { item: 'std/euv-mask-32nm', qty: q(20) }],
    rate: { hours: q(240) },
    steps: [
      {
        note_zh:
          '① 高-NA 曝光 30 nm 线：每层一次，field 26×16.5 一颗 die；30 nm 对 NA 0.55 是单程，不用多程',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh:
          '② RIE 刻沟：C₄F₆/Ar，AR 2–2.5；刻蚀选择比与侧壁角按 `plant/rie-etcher` 的 60–90°',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'pressure', min: 0.1, max: 10 },
          { param: 'temperature', min: 15, max: 80 },
        ],
      },
      {
        note_zh:
          '③ ALD 2 nm TiN 阻挡：TiCl₄ + NH₃ 交替，台阶覆盖 ≥90 %（`plant/ald-reactor` 的 150–400 °C 窗口）',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 200, max: 300 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '④ 镀铜 + CMP：超填液电镀，硬垫 + 两区压力；dishing 3–5 nm（设计值，比 stack-8 的 7–12 好一档）',
        performedBy: 'plant/cmp-integration',
        under: [{ param: 'pressure', min: 15, max: 30 }],
      },
      {
        note_zh:
          '⑤ 15–20 层重复：每层都读 CD-SEM 与套刻；层数写 15–20 是计数，不是循环',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
    ],
  },

  {
    /**
     * **8 nm SoC 整条流程：前道 7 步 + Cu 双大马士革 + 量测/缺陷/电测 + 钝化/划片。**
     *
     *   器件片 1 + 互连片 1 + 钝化片 1 + 水 4 → SoC 1 片
     *   （node 8–10、layers 15–20、tops 100–275、sram 10–100 MB、power 10–30 W）
     *
     * **本路线是整条 8 nm 流程的工序表，不是“最后四步”。** `mat/device-wafer`
     * （前道）、`mat/damascene-layer`（15–20 层后道）、`mat/si3n4-lpcvd`（钝化）
     * 在模型里记成三件，物理上是同一片硅的三个阶段 —— 与
     * `make/mcu-40nm-damascene` 的两件记账同一个口径。所以 `uses` 只列这三件
     * 与 4 kg 水；工序按真实顺序从栅氧一直排到划片/电测。
     *
     * ── 工序（16 段，全部有真实设备与窗口）──────────────────────────────
     *
     *   ① 栅氧/界面层   ALD 1–3 nm，200–400 °C / 20–60 Pa（`plant/ald-reactor`）
     *   ② 高 k HfO₂     ALD 2–3 nm，200–300 °C / 20–60 Pa（同一台）
     *   ③ 金属栅 TiN    PVD 2–10 nm，250–400 °C / 0.3–1 Pa（`plant/sputter-system`）
     *   ④ 光刻          EUV 高-NA 画 64–80 nm 芯轴，再走 8 重成像
     *                   （SADP 1 圈 + SAQP 2 圈 = 2×2×2）到 8–12 nm 半间距。
     *                   **不是单次曝光直写 12 nm**；若退到 193i，四重曝光只到
     *                   20–30 nm，同样要 8 重才够 —— 本层没有 193i 浸没扫描机
     *                   （`plant/immersion-scanner`）与涂显轨道（`plant/track`），属待建。
     *   ⑤ 刻蚀          Cl₂/HBr，20–80 °C / 1–10 mTorr（0.133–1.333 Pa），`plant/rie-etcher`
     *   ⑥ 注入          B/P/As，5–40 keV、1e13–1e15 cm⁻²，`plant/ion-implanter`
     *   ⑦ 退火          RTA 1000–1050 °C、1–10 s、N₂，`plant/rta`
     *   ⑧ Cu ECD        300–600 nm，20–60 °C / 15–20 kPa，`plant/plating-bath`
     *   ⑨ Cu CMP        去除到剩 50–100 nm，15–30 kPa，`plant/cmp-polisher`
     *   ⑩ CD-SEM        CD 8–12 nm，`plant/cd-sem`
     *   ⑪ 套刻          ≤2–3 nm，`plant/overlay-metrology`
     *   ⑫ 膜厚          `plant/ellipsometer`
     *   ⑬ 缺陷          `plant/particle-scanner`（本层只到 0.4–0.6 µm）
     *   ⑭ 钝化          LPCVD Si₃N₄ 0.3–1 µm，700–780 °C / 13–40 Pa
     *   ⑮ 划片          `plant/dicing-saw`，刀痕 30–50 µm
     *   ⑯ 电测          `plant/probe-station`，只测通断/漏电/方阻
     *
     * ⚠️ **量测机自己不 holds 条件**：`plant/overlay-metrology`、
     * `plant/ellipsometer`、`plant/particle-scanner`、`plant/dicing-saw`、
     * `plant/probe-station` 都没有 `holds`；它们的 19–21 °C 由 `needs` 里的
     * `plant/metrology-room` 维持（模型允许工序条件由 needs 设备承担）。
     * `plant/euv-stepper-hina` 也不 holds，光刻段的 19–21 °C 同样来自计量间。
     *
     * ── 仍未接上的格（不写成“8 nm 造不出”）────────────────────────────
     *
     *   · 掩模：20 块/套、2 500 片/块、没有 pellicle/修版（`euv-fab.ts` 问题一）。
     *   · 测试：没有 C-V/I-V、没有高速功能测试；只有通断/漏电/方阻。
     *   · 封装：本层**没有引线键合机**（`plant/wire-bonder` 不存在），
     *     装架/键合/封帽属待建；本路线只交到划片后的裸片电测。
     *   · 注入源：BF₃ 与砷有料，但离子源对 B/As 的质量分离与剂量均匀性未标定；
     *     P 也只有固态磷源，没有 PH₃。
     *   · 193i 退路：本层没有 193i 浸没扫描机/涂显轨道，见④。
     */
    id: 'make/soc-8nm-damascene',
    name: '8 nm 制程的 SoC 制造',
    produces: [
      {
        item: 'std/soc-8nm-general',
        qty: q(1),
        gives: [
          // node 8–10 由 `measure/soc-8nm-gate-length` 的 TEM 栅长记录支撑（8–10 nm）；
          // 这是 8 nm 链走通后的读数来源，不是把 props 再抄一遍。
          { param: 'node', kind: 'range', min: 8, max: 10, record: 'mat/soc-8nm-gate-length-record' },
          { param: 'tops', kind: 'range', min: 100, max: 275 },
          { param: 'sram', kind: 'range', min: 10, max: 100 },
          { param: 'power', kind: 'range', min: 10, max: 30 },
          { param: 'layers', kind: 'range', min: 15, max: 20 },
          // 8 nm 节点资格带，不是单次实测；overlay/TEM 记录在 data/measure/soc-8nm-metrology.ts。
          { param: 'overlay', kind: 'range', min: 2, max: 3, record: 'mat/soc-8nm-overlay-record' },
          { param: 'gateOxide', kind: 'range', min: 1, max: 2, record: 'mat/soc-8nm-gate-stack-record' },
          { param: 'highK', kind: 'range', min: 2, max: 3, record: 'mat/soc-8nm-gate-stack-record' },
          { param: 'metalGate', kind: 'range', min: 5, max: 10, record: 'mat/soc-8nm-gate-stack-record' },
          { param: 'interface', kind: 'range', min: 1, max: 2, record: 'mat/soc-8nm-gate-stack-record' },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/device-wafer',
            qty: q(1),
            need: [{ param: 'node', kind: 'range', max: 10, dir: 'atMost' }],
            onRelax: 'functional-lost',
          },
          {
            item: 'mat/device-wafer-first',
            qty: q(1),
            need: [{ param: 'node', kind: 'range', max: 10, dir: 'atMost' }],
            onRelax: 'functional-lost',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/damascene-layer',
            qty: q(1),
            need: [
              { param: 'lineWidth', kind: 'range', max: 30, dir: 'atMost' },
              { param: 'aspectRatio', kind: 'range', min: 2, dir: 'atLeast' },
              { param: 'dishing', kind: 'range', max: 5, dir: 'atMost' },
              { param: 'barrierThickness', kind: 'range', max: 2, dir: 'atMost' },
              { param: 'kValue', kind: 'range', max: 2.5, dir: 'atMost' },
              { param: 'layers', kind: 'range', min: 12, dir: 'atLeast' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/si3n4-lpcvd',
            qty: q(1),
            need: [
              { param: 'thickness', kind: 'range', min: 0.3, max: 1 },
              { param: 'stoichiometry', kind: 'range', min: 0.75, max: 0.85 },
              { param: 'hydrogenContent', kind: 'range', max: 2, dir: 'atMost' },
              { param: 'stress', kind: 'range', min: 0.5, max: 1.5 },
              { param: 'uniformity', kind: 'range', max: 5, dir: 'atMost' },
            ],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/water', qty: q(4) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    // 300 h：前道 48 h（`make/device-wafer-oct`）+ 后道 15–20 层 240 h
    // （`make/beol-30nm-15layer`）+ 钝化/划片/电测约 12 h，取整。
    rate: { hours: q(300) },
    steps: [
      {
        note_zh:
          '① 栅氧/界面层：ALD SiO₂ 界面层 1–3 nm，200–400 °C / 20–60 Pa；`plant/ald-reactor` 的 holds 是 150–400 °C、10–100 Pa',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 200, max: 400 },
          { param: 'pressure', min: 20, max: 60 },
        ],
      },
      {
        note_zh:
          '② 高 k 沉积：HfO₂ ALD 2–3 nm（HfCl₄ + H₂O，GPC 0.08–0.1 nm/周期），200–300 °C / 20–60 Pa',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 200, max: 300 },
          { param: 'pressure', min: 20, max: 60 },
        ],
      },
      {
        note_zh:
          '③ 金属栅：TiN PVD 2–10 nm（Ti 靶 + N₂/Ar），250–400 °C / 0.3–1 Pa；`plant/sputter-system` 的 holds 是 20–700 °C、1e-5–10 Pa。用 250 起步是为了避开造它自己的 150–200 °C 烘烤段（否则 condition_cycle）',
        performedBy: 'plant/sputter-system',
        under: [
          { param: 'temperature', min: 250, max: 400 },
          { param: 'pressure', min: 0.3, max: 1 },
        ],
      },
      {
        note_zh:
          '④ 光刻：EUV 高-NA 画 64–80 nm 芯轴，8 重成像（SADP 1 圈 + SAQP 2 圈 = 2×2×2）到 8–12 nm 半间距；`plant/euv-stepper-hina` 不 holds 条件，19–21 °C 由计量间维持。193i 退路要 8 重（四重只到 20–30 nm），本层无浸没扫描机/涂显轨道',
        performedBy: 'plant/euv-stepper-hina',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑤ 刻蚀：Cl₂/HBr 各向异性刻蚀，20–80 °C / 1–10 mTorr（0.133–1.333 Pa）；`plant/rie-etcher` 的 holds 是 15–80 °C、1e-6–100 Pa',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'temperature', min: 20, max: 80 },
          { param: 'pressure', min: 0.133, max: 1.333 },
        ],
      },
      {
        note_zh:
          '⑥ 注入：B/P/As 5–40 keV、1e13–1e15 cm⁻²、7° 倾斜；`plant/ion-implanter` 的 holds 是 5–100 keV、1e-5–1e-2 Pa。BF₃ 与砷有料，但 B/As 的质量分离未标定；P 只有固态磷源',
        performedBy: 'plant/ion-implanter',
        under: [
          { param: 'energy', min: 5, max: 40 },
          { param: 'pressure', min: 1e-5, max: 1e-3 },
        ],
      },
      {
        note_zh:
          '⑦ 退火：RTA 1000–1050 °C、1–10 s、N₂ 常压；`plant/rta` 的 holds 是 400–1200 °C、5e4–2e5 Pa',
        performedBy: 'plant/rta',
        under: [
          { param: 'temperature', min: 1000, max: 1050 },
          { param: 'pressure', min: 1e5, max: 1.1e5 },
        ],
      },
      {
        note_zh:
          '⑧ Cu 双大马士革（电镀）：沟槽/通孔刻好后 ECD 填铜 300–600 nm，20–60 °C / 15–20 kPa；`plant/plating-bath` 的 holds 是 20–60 °C、15–20 kPa',
        performedBy: 'plant/plating-bath',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 15, max: 20 },
        ],
      },
      {
        note_zh:
          '⑨ Cu CMP：去除过镀铜到剩 50–100 nm，15–30 kPa；`plant/cmp-polisher` 只 holds 压力（它 hold 不了温度，昼夜温差直接进 k）',
        performedBy: 'plant/cmp-polisher',
        under: [{ param: 'pressure', min: 15, max: 30 }],
      },
      {
        note_zh:
          '⑩ CD-SEM：量 CD 8–12 nm，10 点/片；`plant/cd-sem` 的 holds 是 1e-6–1e-3 Pa，CD 重复性 0.3 nm',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh:
          '⑪ 套刻量测：成像式 DBO，门 ≤2–3 nm；`plant/overlay-metrology` 不 holds 条件，19–21 °C 由计量间维持，台读数 0.5 nm',
        performedBy: 'plant/overlay-metrology',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑫ 膜厚：椭偏仪读栅氧/高 k/钝化层厚度（1–1000 nm、≤0.05 nm 准确度）；不 holds 条件，19–21 °C 由计量间维持',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑬ 缺陷：暗场颗粒扫描 0.4–0.6 µm（本层下限；0.05–0.1 µm 看不见），19–21 °C 由计量间维持',
        performedBy: 'plant/particle-scanner',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑭ 钝化：LPCVD Si₃N₄ 0.3–1 µm，700–780 °C / 13–40 Pa；Si/N 0.75–0.85、H ≤2 at%、应力 0.5–1.5 GPa',
        performedBy: 'plant/lpcvd-furnace',
        under: [
          { param: 'temperature', min: 700, max: 780 },
          { param: 'pressure', min: 13, max: 40 },
        ],
      },
      {
        note_zh:
          '⑮ 划片：金刚石镍刀片 10 000–40 000 rpm，刀痕 30–50 µm；`plant/dicing-saw` 不 holds 条件，19–21 °C 由计量间维持',
        performedBy: 'plant/dicing-saw',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑯ 电测：探针台测通断/漏电/方阻（没有 C-V/I-V、没有高速功能测试）；不 holds 条件，19–21 °C 由计量间维持',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '器件片 1（前道阶段）+ 15–20 层互连片 1（后道阶段，同一片上的层）+ 钝化片 1（同一片）+ 水 4 kg → SoC 1 片。产物按片计，芯片质量没有条目，不折 kg。工序表把前道（栅氧/高k/金属栅/光刻/刻蚀/注入/退火）、后道（Cu 双大马士革）、量测、缺陷/电测、钝化与划片折进同一条路线；这些工序的气体/前驱体/靶材按片记账，未逐项立 kg 条目。**缺口**：① 本层无 193i 浸没扫描机与涂显轨道（plant/immersion-scanner、plant/track 不存在），走的是 EUV（plant/euv-stepper-hina，有装配路线）；② 无引线键合机（plant/wire-bonder 不存在），装架/键合/封帽属待建，路线只交到划片与裸片电测；③ 无 pellicle/修版、无 C-V/I-V 与高速功能测试；④ B/As 离子源未标定（BF₃ 与砷有料，但离子源质量分离未做）。',
  },
  {
    /**
     * **EUV 掩模坯：ULE 基板 → 40–50 对 Mo/Si → Rh 帽 → Ni 吸收层。**
     *
     *   基板  ULE 0.5 kg，cte 0.02–0.05 ppm/K；抛光到 flatness ≤0.1 nm rms
     *   多层  Mo 2.8 nm / Si 4.1 nm，40–50 对，`plant/euv-coater` 0.1–1 Pa
     *   帽    Rh 2 nm（标准是 Ru；Rh 是 PGM 现成的一档）
     *   吸收  Ni 50–70 nm（标准是 TaBN；本层没有 Ta/B 靶材，Ni 是降级）
     *
     * 历史顺序：560 nm 档的铬版掩模（`std/photomask-general`）→ 100 nm 档
     * 深亚微米版（`std/photomask-general` 的 minFeature 0.1–0.12 µm）→ 本条
     * EUV 掩模坯。写图形、刻吸收层、修版、pellicle 是后续段；本条只交空白坯。
     *
     * ⚠️ Ni 吸收层的刻蚀选择比与 TaBN 不同；用 Ni 的掩模在 13.5 nm 下能成图，
     * 但寿命/缺陷与标准 TaBN 不可比。这是 R8 降级，升级路线是 Ta/B 料链 + TaBN。
     */
    id: 'make/euv-mask-blank',
    name: 'EUV 掩模坯制造',
    produces: [
      {
        item: 'std/euv-mask-blank',
        qty: q(1),
        gives: [
          { param: 'size', kind: 'range', min: 152, max: 152 },
          { param: 'cte', kind: 'range', min: 0.02, max: 0.05 },
          { param: 'pairs', kind: 'range', min: 40, max: 50 },
          { param: 'cap', kind: 'enum', oneOf: ['Rh'] },
          { param: 'absorber', kind: 'enum', oneOf: ['Ni'] },
          { param: 'flatness', kind: 'range', min: 0, max: 0.1, record: 'mat/euv-mask-blank-cal-record' },
          { param: 'roughness', kind: 'range', min: 0, max: 0.1, record: 'mat/euv-mask-blank-cal-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ule-glass', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/rhodium', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(20) },
    steps: [
      {
        note_zh: 'ULE 基板抛光：flatness ≤0.1 nm rms、roughness ≤0.1 nm；抛光后立即清洗',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '镀 40–50 对 Mo/Si：Mo 2.8 nm、Si 4.1 nm，0.1–1 Pa、100–150 °C；period 6.9 ±0.05 nm',
        performedBy: 'plant/euv-coater',
        under: [
          { param: 'pressure', min: 0.1, max: 1 },
          { param: 'temperature', min: 100, max: 150 },
        ],
      },
      {
        note_zh: '镀 Rh 帽 2 nm + Ni 吸收层 50–70 nm：同一个 coater，换靶，0.1–1 Pa',
        performedBy: 'plant/euv-coater',
        under: [
          { param: 'pressure', min: 0.1, max: 1 },
          { param: 'temperature', min: 100, max: 150 },
        ],
      },
      {
        note_zh: '测 flatness/roughness 与 13.5 nm 相对反射率；写掩模坯记录（反射率绝对值仍缺 at-wavelength 绝对标准）',
        performedBy: 'plant/interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'ULE 0.5 + 硅片 1 + 铑 0.001 + 镍 0.001 + 氩 0.01 + 水 1 → 掩模坯 1；余是抛光/镀膜损耗与靶材残料。',
  },
  {
    /**
     * **EUV 测试掩模（100 nm 档）：坯 → 甩胶 → 电子束写 → 显影 → Cl₂/Ar 刻 Ni → CD-SEM。**
     *
     *   掩模坯 1 + 胶 0.001 + 氯 0.001 + 氩 0.01 + 水 1 → 测试掩模 1
     *
     * 写机是 `plant/cgh-e-beam-writer`：束斑 20–100 nm、定位 500–1000 nm。
     * 100 nm 线能写出来，但定位比线宽大 5–10 倍；这是**降级掩模**，不是
     * 8 nm 的 32 nm 掩模。Ni 的 Cl₂/Ar 刻蚀在 20–80 °C 下靠离子辅助，
     * 侧壁不如 TaBN；这是 Ni 吸收层的固有代价，已记在 [13]。
     *
     * 历史顺序：560 nm 铬版 → 100 nm 深亚微米版（光学 photorepeater）→
     * 本条 EUV 100 nm 测试掩模 → 32 nm EUV 掩模（定位 ≤10 nm 的写机，下一步）。
     */
    id: 'make/euv-mask-degraded',
    name: 'EUV 测试掩模制造',
    produces: [
      {
        item: 'std/euv-mask-degraded',
        qty: q(1),
        gives: [
          { param: 'size', kind: 'range', min: 152, max: 152 },
          { param: 'minFeature', kind: 'range', min: 0.1, max: 0.15 },
          { param: 'placement', kind: 'range', min: 500, max: 1000 },
          { param: 'absorber', kind: 'enum', oneOf: ['Ni'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/euv-mask-blank', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(16) },
    steps: [
      {
        note_zh: '掩模坯清洗 + 甩胶 0.2 µm（2 500 rpm）；前烘 90–110 °C',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '电子束写 100 nm 线：20–30 kV、束斑 20–100 nm、定位 500–1000 nm；写全场',
        performedBy: 'plant/cgh-e-beam-writer',
        under: [{ param: 'pressure', min: 1e-7, max: 1e-3 }],
      },
      {
        note_zh: '显影 + 后烘；胶掩模 100 nm 线',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: 'Cl₂/Ar 刻 Ni 吸收层：0.1–10 Pa、20–80 °C，离子辅助；侧壁 60–80°',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'pressure', min: 0.1, max: 10 },
          { param: 'temperature', min: 20, max: 80 },
        ],
      },
      {
        note_zh: '去胶 + CD-SEM 读线宽/定位；写测试掩模记录（100 nm 档）',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
    ],
    unbalanced_zh:
      '掩模坯 1 + 胶 0.001 + 氯 0.001 + 氩 0.01 + 水 1 → 测试掩模 1；余是刻蚀/去胶/清洗损耗。',
  },
  {
    /**
     * **32 nm 写机：CD-SEM 柱 + EUV 台 + 隔振 + 温控罩 + 控制板。**
     *
     *   柱（枪/聚光/光阑×4/物镜/镜筒）1 套 + 0.5–1 nm 台 1 + 隔振 1
     *   + 0.02–0.05 K 罩 1 + 控制板 1 + 不锈钢/铝 2 → 写机 1
     *
     * 这不是“新造一根柱”，是把已有的 CD-SEM 柱换台：CD-SEM 的柱本身 4 nm
     * 束斑、30–50 kV，能写 32 nm 线；它的 1 µm 台换成本层的 0.5–1 nm 台，
     * 再把隔振与温控罩装上。曝光慢（0.2–1 pA），数量不是约束。
     *
     * 装配后的判据：束斑 4–10 nm、定位 5–10 nm、漂移 0.2–0.5 nm/h、
     * 温控 0.02–0.05 K。定位与漂移是设计估算，要写测试标记后用 CD-SEM 复读。
     */
    id: 'make/euv-mask-writer',
    name: '32 nm EUV 掩模写机制造',
    produces: [
      {
        item: 'plant/euv-mask-writer',
        qty: q(1),
        gives: [
          { param: 'spotSize', kind: 'range', min: 4, max: 10, record: 'mat/euv-mask-writer-cal-record' },
          { param: 'positionError', kind: 'range', min: 5, max: 10, record: 'mat/euv-mask-writer-cal-record' },
          { param: 'accelVoltage', kind: 'range', min: 30, max: 50 },
          { param: 'beamCurrent', kind: 'range', min: 0.2, max: 1, record: 'mat/euv-mask-writer-cal-record' },
          { param: 'stageStroke', kind: 'range', min: 152, max: 152, record: 'mat/euv-mask-writer-cal-record' },
          { param: 'drift', kind: 'range', min: 0.2, max: 0.5, record: 'mat/euv-mask-writer-cal-record' },
          { param: 'temperatureStability', kind: 'range', min: 0.02, max: 0.05 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/cd-sem/gun', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cd-sem/condenser', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cd-sem/aperture', qty: q(4) }] },
      { anyOf: [{ item: 'plant/cd-sem/objective', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cd-sem/column', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-stepper-hina/stage', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-stepper-hina/isolation', qty: q(1) }] },
      { anyOf: [{ item: 'plant/overlay-traceable/enclosure', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(120) },
    steps: [
      {
        note_zh: '装 CD-SEM 柱（枪/聚光/光阑/物镜/镜筒）到新机架；柱与台同轴 ≤10 µm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装 0.5–1 nm 台与隔振：台面 152 mm、漂移 ≤0.5 nm/h；隔振 ≤1 µm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装 0.02–0.05 K 温控罩与控制板；罩内温度 19–21 °C、±0.05 K',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '抽真空到 1e-6–1e-3 Pa，检漏；束斑/束流/定位测试，写测试标记后用 CD-SEM 复读',
        performedBy: 'plant/cd-sem',
      },
    ],
    unbalanced_zh:
      'CD-SEM 柱 1 套 + 台 1 + 隔振 1 + 温控罩 1 + 控制板 1 + 不锈钢 1 + 铝 1 → 写机 1；余是装配/调校/试写损耗。',
  },
  {
    /**
     * **32 nm EUV 掩模：坯 → 薄胶 → 32 nm 写 → 显影 → Cl₂/Ar 刻 Ni → CD-SEM。**
     *
     *   掩模坯 1 + 胶 0.0005 + 氯 0.001 + 氩 0.01 + 水 1 → 32 nm 掩模 1
     *
     * 写机是 `plant/euv-mask-writer`（CD-SEM 柱 + 0.5–1 nm 台）：束斑 4–10 nm、
     * 定位 5–10 nm、0.2–1 pA。32 nm 线写得出，但一张 152 mm 掩模要 40–60 h
     * （0.2–1 pA 的束流限制）；48 h 是估算，不是实测节拍。
     *
     * 刻蚀仍是 Cl₂/Ar 离子辅助；Ni 的侧壁与选择比不如 TaBN，修版与 pellicle
     * 仍缺。这一条只交 32 nm 吸收层图形，不交“可上机的完整掩模”。
     */
    id: 'make/euv-mask-32nm',
    name: '32 nm EUV 掩模制造',
    produces: [
      {
        item: 'std/euv-mask-32nm',
        qty: q(1),
        gives: [
          { param: 'size', kind: 'range', min: 152, max: 152 },
          { param: 'minFeature', kind: 'range', min: 0.025, max: 0.04, record: 'mat/euv-mask-32nm-cal-record' },
          { param: 'placement', kind: 'range', min: 5, max: 10, record: 'mat/euv-mask-32nm-cal-record' },
          { param: 'absorber', kind: 'enum', oneOf: ['Ni'] },
          { param: 'pellicle', kind: 'enum', oneOf: ['poly-Si'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/euv-mask-blank', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 2000) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
      { anyOf: [{ item: 'std/euv-pellicle', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: [
      'plant/clean-room',
      'plant/metrology-room',
      {
        item: 'plant/euv-mask-writer',
        qty: q(1),
        need: [
          { param: 'spotSize', kind: 'range', min: 4, max: 10 },
          { param: 'positionError', kind: 'range', min: 5, max: 10 },
          { param: 'beamCurrent', kind: 'range', min: 0.2, max: 1 },
          { param: 'stageStroke', kind: 'range', min: 152, max: 152 },
          { param: 'drift', kind: 'range', min: 0.2, max: 0.5 },
        ],
        onRelax: 'functional-kept',
      },
    ],
    steps: [
      {
        note_zh: '掩模坯清洗 + 甩薄胶 0.1 µm（3 000 rpm）；前烘 90–110 °C',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '32 nm 线电子束写：30–50 kV、0.2–1 pA、定位 5–10 nm；40–60 h 是估算',
        performedBy: 'plant/euv-mask-writer',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: '显影 + 后烘；胶掩模 32 nm 线',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: 'Cl₂/Ar 刻 Ni 吸收层：0.1–10 Pa、20–80 °C，离子辅助；侧壁 60–80°',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'pressure', min: 0.1, max: 10 },
          { param: 'temperature', min: 20, max: 80 },
        ],
      },
      {
        note_zh: '去胶 + CD-SEM 读 32 nm 线宽/定位；写 32 nm 掩模记录',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: 'CD-SEM 复检发现缺陷：EBIE 刻掉多余 Ni / EBID 补缺失 Ni，修完复读；修不了的重写整块',
        performedBy: 'plant/euv-mask-repair',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: '贴 pellicle：Ti 框对位、贴附；透射/缺陷复检；贴后不再修版（修版会破膜）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '掩模坯 1 + 胶 0.0005 + 氯 0.001 + 氩 0.01 + pellicle 1 + 水 1 → 32 nm 掩模 1；余是刻蚀/去胶/清洗损耗。',
  },
  {
    /**
     * **EUV pellicle：LPCVD 多晶硅 50 nm → 开框 → KOH 背蚀 → HF 释放 → 装 Ti 框。**
     *
     *   硅烷 0.001 + 硅片 1 + KOH 0.1 + HF 0.01 + 钛 0.05 + 水 1 → pellicle 1
     *
     * 膜是 50 nm 多晶硅：LPCVD 700–780 °C、13–40 Pa；背蚀用 KOH 40–55 %、
     * 80–100 °C；HF 释放后贴到 Ti 框上，自然干燥（表面张力会把膜拉破，
     * 临界点厚度约 30–40 nm，50 nm 是留了余量的一档）。
     *
     * 透射 0.6–0.85 是设计估算：多晶硅 50 nm 在 13.5 nm 的吸收与膜厚、
     * 晶粒、氧化层有关；本层没有 at-wavelength 透射标准，只有椭偏厚度与
     * 反射计相对值。要写成实测，必须加 13.5 nm 光源 + 探测器。
     */
    id: 'make/euv-pellicle',
    name: 'EUV 薄膜制造',
    produces: [
      {
        item: 'std/euv-pellicle',
        qty: q(1),
        gives: [
          { param: 'size', kind: 'range', min: 152, max: 152 },
          { param: 'thickness', kind: 'range', min: 45, max: 60 },
          { param: 'transmission', kind: 'range', min: 0.6, max: 0.85 },
          { param: 'membrane', kind: 'enum', oneOf: ['poly-Si'] },
          { param: 'frame', kind: 'enum', oneOf: ['Ti'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silane', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/koh', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/titanium', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: 'LPCVD 多晶硅 50 nm：700–780 °C、13–40 Pa，硅烷分解；膜厚 ±5 %',
        performedBy: 'plant/lpcvd-furnace',
        under: [
          { param: 'temperature', min: 700, max: 780 },
          { param: 'pressure', min: 13, max: 40 },
        ],
      },
      {
        note_zh: 'RIE 开框：刻穿多晶硅到硅片，留 152 mm 窗口；侧壁 60–80°',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'pressure', min: 0.1, max: 10 },
          { param: 'temperature', min: 20, max: 80 },
        ],
      },
      {
        note_zh: 'KOH 背蚀硅片：40–55 %、80–100 °C，直到只剩多晶硅膜',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 80, max: 100 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: 'HF 释放 + 贴 Ti 框 + 自然干燥；膜不能超声、不能夹持',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '椭偏测膜厚 45–60 nm；反射计读相对透射，绝对值按设计窗口记（缺 13.5 nm 透射标准）',
        performedBy: 'plant/ellipsometer',
      },
    ],
    unbalanced_zh:
      '硅烷 0.001 + 硅片 1 + KOH 0.1 + HF 0.01 + 钛 0.05 + 水 1 → pellicle 1；余是背蚀/释放/装框损耗。',
  },
  {
    /**
     * **32 nm 修版机：CD-SEM 柱 + EUV 台 + 气体注入/存储/针 + 泛流枪 + 腔。**
     *
     *   柱 1 套 + 台 1 + 气体注入 1 + 存储 1 + 针 1 + 质量过滤 1
     *   + 泛流枪 1 + 腔 1 + 控制板 1 + 不锈钢/铝 2 → 修版机 1
     *
     * 与写机共用 CD-SEM 柱与 EUV 台；多出来的是气体系统与泛流枪：EBIE 刻蚀
     * 多余吸收层、EBID 补缺失吸收层，泛流枪做大面积预清洁/荷电控制。
     *
     * 判据：束斑 4–10 nm、定位 5–10 nm、漂移 0.2–0.5 nm/h；细修电流 0.001–1 pA。
     * 定位/漂移是设计估算；修完必须 CD-SEM 复读，不能只看“补上了”。
     */
    id: 'make/euv-mask-repair',
    name: '32 nm EUV 掩模修版机制造',
    produces: [
      {
        item: 'plant/euv-mask-repair',
        qty: q(1),
        gives: [
          { param: 'spotSize', kind: 'range', min: 4, max: 10 },
          { param: 'positionError', kind: 'range', min: 5, max: 10 },
          { param: 'beamCurrent', kind: 'range', min: 0.001, max: 1 },
          { param: 'stageStroke', kind: 'range', min: 152, max: 152 },
          { param: 'drift', kind: 'range', min: 0.2, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/cd-sem/gun', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cd-sem/condenser', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cd-sem/aperture', qty: q(4) }] },
      { anyOf: [{ item: 'plant/cd-sem/objective', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cd-sem/column', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-stepper-hina/stage', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mask-repair/gas-injector', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mask-repair/reservoir', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mask-repair/needle', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mask-repair/mass-filter', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mask-repair/flood-gun', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mask-repair/chamber', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(100) },
    steps: [
      {
        note_zh: '装 CD-SEM 柱与 EUV 台：柱/台同轴 ≤10 µm，台 152 mm、漂移 ≤0.5 nm/h',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装气体系统（注入/存储/针/质量过滤）与泛流枪；气路检漏',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '抽真空到 1e-6–1e-3 Pa；在测试掩模上做 EBIE 刻蚀与 EBID 沉积各一处',
        performedBy: 'plant/cd-sem',
      },
      {
        note_zh: 'CD-SEM 复读修后线宽/边缘；写修版机验收记录（定位/漂移是设计估算）',
        performedBy: 'plant/cd-sem',
      },
    ],
    unbalanced_zh:
      'CD-SEM 柱 1 套 + 台 1 + 气体系统 1 套 + 泛流枪 1 + 腔 1 + 控制板 1 + 不锈钢 1 + 铝 1 → 修版机 1；余是装配/调校/试修损耗。',
  },
  {
    /**
     * **晶圆缺陷巡检机：显微镜 + CCD + 300 mm 台 + 白光 + 隔振。**
     *
     *   显微镜 1 + CCD 1 + 台 1 + 白光 1 + 隔振 1 + 控制板 1 + 铝/钢 2
     *   → 巡检机 1
     *
     * 明场/暗场靠换照明：白光斜入射是暗场，同轴是明场。1–2 µm 分辨率
     * 只能看颗粒/大缺陷；8 nm 的图形缺陷仍要 CD-SEM 复查。吞吐 2–5 片/h
     * 是设计估算，不是实测。
     */
    id: 'make/wafer-inspection',
    name: '晶圆缺陷巡检机制造',
    produces: [
      {
        item: 'plant/wafer-inspection',
        qty: q(1),
        gives: [
          { param: 'resolution', kind: 'range', min: 1, max: 2 },
          { param: 'field', kind: 'range', min: 2, max: 5 },
          { param: 'stageStroke', kind: 'range', min: 300, max: 300 },
          { param: 'throughput', kind: 'range', min: 2, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/dicing-saw/microscope', qty: q(1) }] },
      { anyOf: [{ item: 'plant/metrology-ccd', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-stepper-hina/stage', qty: q(1) }] },
      { anyOf: [{ item: 'plant/white-light-source', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-stepper-hina/isolation', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(80) },
    steps: [
      {
        note_zh: '装显微镜与 CCD：同轴对焦，50–200×；像素 1 MP、读出噪声 ≤10 e-',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装 300 mm 台与隔振：台 0.5–1 nm 定位（巡检不需要这么高，但现成台就这一档）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装白光与暗场光路；调焦、平场校正；扫测试片，写分辨率/吞吐验收',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '显微镜 1 + CCD 1 + 台 1 + 白光 1 + 隔振 1 + 控制板 1 + 铝 1 + 钢 1 → 巡检机 1；余是装配/调校损耗。',
  },
  {
    /**
     * **电子束巡检机：CD-SEM 柱 + EUV 台 + 隔振 + 控制板。**
     *
     *   柱 1 套 + 台 1 + 隔振 1 + 控制板 1 + 铝/钢 2 → 巡检机 1
     *
     * 与写机/修版机同一根 CD-SEM 柱，少了气体系统：只拍图、比对参考 die，
     * 不改图形。0.2–1 pA 的束流扫 300 mm 很慢，0.2–0.5 片/h 是设计估算。
     */
    id: 'make/e-beam-inspection',
    name: '电子束巡检机制造',
    produces: [
      {
        item: 'plant/e-beam-inspection',
        qty: q(1),
        gives: [
          { param: 'resolution', kind: 'range', min: 2, max: 5 },
          { param: 'pixel', kind: 'range', min: 2, max: 10 },
          { param: 'stageStroke', kind: 'range', min: 300, max: 300 },
          { param: 'throughput', kind: 'range', min: 0.2, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/cd-sem/gun', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cd-sem/condenser', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cd-sem/aperture', qty: q(4) }] },
      { anyOf: [{ item: 'plant/cd-sem/objective', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cd-sem/column', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-stepper-hina/stage', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-stepper-hina/isolation', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(100) },
    steps: [
      {
        note_zh: '装 CD-SEM 柱与 300 mm 台：柱/台同轴 ≤10 µm；台 0.5–1 nm 定位',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装隔振与控制板；抽真空到 1e-6–1e-3 Pa，检漏',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '拍测试片校准像素/分辨率；与参考 die 比对，写验收（吞吐是设计估算）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'CD-SEM 柱 1 套 + 台 1 + 隔振 1 + 控制板 1 + 铝 1 + 钢 1 → 电子束巡检机 1；余是装配/调校损耗。',
  },
  {
    /**
     * **CGH 零位补偿片：32 nm 写机写 10–20 nm 特征，Cl₂/Ar 刻 Ni。**
     *
     *   掩模坯 1 + 胶 0.0005 + 氯 0.001 + 氩 0.01 + 水 1 → CGH 1
     *
     * CGH 的相位误差 1:1 进镜子面形；写机定位 5–10 nm 是这条链的底。
     * 24 h 是估算；CGH 本身必须 CD-SEM 复读，不能只看写没写出来。
     */
    id: 'make/euv-cgh-null',
    name: 'EUV CGH 零位补偿片制造',
    produces: [
      {
        item: 'std/euv-cgh-null',
        qty: q(1),
        gives: [
          { param: 'feature', kind: 'range', min: 10, max: 20 },
          { param: 'size', kind: 'range', min: 152, max: 152 },
          { param: 'substrate', kind: 'enum', oneOf: ['ULE'] },
          { param: 'absorber', kind: 'enum', oneOf: ['Ni'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/euv-mask-blank', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 2000) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: '掩模坯清洗 + 甩薄胶 0.1 µm；前烘 90–110 °C',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '32 nm 写机写 10–20 nm CGH 特征；定位 5–10 nm、束流 0.2–1 pA',
        performedBy: 'plant/euv-mask-writer',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: '显影 + Cl₂/Ar 刻 Ni；侧壁 60–80°',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'pressure', min: 0.1, max: 10 },
          { param: 'temperature', min: 20, max: 80 },
        ],
      },
      {
        note_zh: 'CD-SEM 复读 10–20 nm 特征；写 CGH 记录',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
    ],
    unbalanced_zh:
      '掩模坯 1 + 胶 0.0005 + 氯 0.001 + 氩 0.01 + 水 1 → CGH 1；余是写/刻/去胶损耗。',
  },
  {
    /**
     * **660 mm at-wavelength EUV 干涉仪：250 W 源 + CGH + 移相 + EUV 探测器 + 0.5 nm 台。**
     *
     *   源 1 + CGH 1 + 探测器 2 + 台 1 + 隔振 1 + 腔 1 + 框架 1 + 控制板 1
     *   + 铝/钢 2 → 干涉仪 1
     *
     * 这是补 `make/euv-hina-ibf` 第 3 步缺口的设备：可见光只判趋势，
     * 0.1 nm 绝对值要 at-wavelength 验收。0.1 nm 分辨率/0.05 nm 重复性
     * 是设计目标；本条只交机器，不交 0.1 nm 读数。
     *
     * 难点不在装配：① 250 W 锡等离子体空间相干性差，要针孔滤波；
     * ② CGH 的 10–20 nm 特征与相位误差；③ EUV 探测器（现成的时间常数 100 s，
     * 只能做慢测）；④ 0.5 nm 台与隔振；⑤ 660 mm 镜子要 300 mm 子孔径拼接。
     */
    id: 'make/euv-interferometer',
    name: 'at-wavelength EUV 干涉仪制造',
    produces: [
      {
        item: 'plant/euv-interferometer',
        qty: q(1),
        gives: [
          { param: 'wavelength', kind: 'range', min: 13.5, max: 13.5 },
          { param: 'aperture', kind: 'range', min: 660, max: 660 },
          { param: 'resolution', kind: 'range', min: 0.1, max: 0.2, record: 'mat/euv-interferometer-resolution-calculated-record' },
          { param: 'repeatability', kind: 'range', min: 0.05, max: 0.1, record: 'mat/euv-interferometer-repeatability-measure-record' },
          { param: 'measure/figure', kind: 'range', min: 0, max: 2, record: 'mat/euv-interferometer-cal-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/euv-stepper-hina/source', qty: q(1) }] },
      { anyOf: [{ item: 'std/euv-pinhole', qty: q(1) }] },
      { anyOf: [{ item: 'std/euv-pinhole-mount', qty: q(1) }] },
      { anyOf: [{ item: 'std/euv-cgh-null', qty: q(1) }] },
      { anyOf: [{ item: 'std/euv-detector-fast', qty: q(2) }] },
      { anyOf: [{ item: 'plant/euv-stage-660', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-stepper-hina/isolation', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-stepper-hina/chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-stepper-hina/frame', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: ['plant/euv-vacuum', 'plant/phase-shifter', 'plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(400) },
    steps: [
      {
        note_zh: '装 250 W 源、腔与 0.5 nm 台：源/腔同轴；台 300 mm 行程，660 mm 镜子靠拼接',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装 CGH 零位、移相器与 2 只 EUV 探测器；CGH 在光路中可换',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装隔振与框架；抽真空 1e-6–1e-3 Pa、检漏、热稳定',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '用参考镜做零位/移相校准；写验收（0.1 nm 是设计目标，不是实测）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '源 1 + CGH 1 + 探测器 2 + 台 1 + 隔振 1 + 腔 1 + 框架 1 + 控制板 1 + 铝 1 + 钢 1 → 干涉仪 1；余是装配/抽真空/调校损耗。',
  },
  {
    /**
     * **快速 EUV 探测器：ZnS:Ag 荧光屏 + 可见 CCD + 真空腔。**
     *
     *   可见 CCD 1 + 荧光粉 0.001 + 腔 1 + 馈通 2 + 控制板 1 + 铝/钢 2
     *   → 快探测器 1
     *
     * 荧光屏把 13.5 nm 转成 450–550 nm，CCD 10–30 fps 读出；时间常数
     * 0.05–0.1 s，是干涉仪能做八帧移相的前提。QE 0.2–0.5 是设计估算，
     * 荧光屏颗粒/均匀性会进系统差；它不是 0.1 nm 精度的来源。
     */
    id: 'make/euv-detector-fast',
    name: '快速 EUV 探测器制造',
    produces: [
      {
        item: 'std/euv-detector-fast',
        qty: q(1),
        gives: [
          { param: 'format', kind: 'range', min: 1, max: 2 },
          { param: 'pixel', kind: 'range', min: 10, max: 15 },
          { param: 'frameRate', kind: 'range', min: 10, max: 30 },
          { param: 'quantumEfficiency', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'timeConstant', kind: 'range', min: 0.05, max: 0.1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/metrology-ccd', qty: q(1) }] },
      { anyOf: [{ item: 'mat/zns-ag-phosphor', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'plant/euv-reflectometer/chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-reflectometer/feedthrough', qty: q(2) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: ['plant/euv-source', 'plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(80) },
    steps: [
      {
        note_zh: '在腔窗口上沉积 ZnS:Ag 荧光屏 5–20 µm；颗粒/厚度均匀性 ≤5 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装可见 CCD 与光学耦合；荧光屏在焦面，像素 10–15 µm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装腔/馈通，抽真空 1e-6–1e-3 Pa，检漏；EUV 源下标定 QE/时间常数',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '可见 CCD 1 + 荧光粉 0.001 + 腔 1 + 馈通 2 + 控制板 1 + 铝 1 + 钢 1 → 快探测器 1；余是镀屏/装调损耗。',
  },
  {
    /**
     * **EUV 空间滤波针孔：LPCVD SiN 100 nm → 背窗 KOH → 电子束写孔 → RIE。**
     *
     *   硅片 1 + 硅烷 0.001 + 氨 0.001 + 胶 0.001 + C₄F₆ 0.001
     *   + KOH 0.1 + 水 1 → 针孔 1
     *
     * 孔 1–5 µm 在 100 nm SiN 膜上；孔边缘粗糙度 <50 nm、膜不破是难点。
     * 写孔用 32 nm 写机（4–10 nm 束斑），不是光学曝光；刻孔用 RIE，背窗用 KOH。
     * 24 h 是估算；孔的实际尺寸用 CD-SEM 复读。
     */
    id: 'make/euv-pinhole',
    name: 'EUV 空间滤波针孔制造',
    produces: [
      {
        item: 'std/euv-pinhole',
        qty: q(1),
        gives: [
          { param: 'hole', kind: 'range', min: 1, max: 5 },
          { param: 'membrane', kind: 'range', min: 80, max: 120 },
          { param: 'size', kind: 'range', min: 10, max: 10 },
          { param: 'material', kind: 'enum', oneOf: ['SiN'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/silane', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/ammonia', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/cf4', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/koh', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: 'LPCVD SiN 100 nm：700–780 °C、13–40 Pa，硅烷 + 氨；膜厚 ±5 %',
        performedBy: 'plant/lpcvd-furnace',
        under: [
          { param: 'temperature', min: 700, max: 780 },
          { param: 'pressure', min: 13, max: 40 },
        ],
      },
      {
        note_zh: '背面开窗 + KOH 背蚀硅片，留 10 mm 自支撑 SiN 膜',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 80, max: 100 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: '电子束写 1–5 µm 孔：32 nm 写机、4–10 nm 束斑；定位 5–10 nm',
        performedBy: 'plant/euv-mask-writer',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: 'C₄F₆ RIE 刻穿 SiN；孔边缘粗糙度 <50 nm',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'pressure', min: 0.1, max: 10 },
          { param: 'temperature', min: 20, max: 80 },
        ],
      },
      {
        note_zh: 'CD-SEM 复读孔径/边缘；膜不破、孔圆度进记录',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
    ],
    unbalanced_zh:
      '硅片 1 + 硅烷 0.001 + 氨 0.001 + 胶 0.001 + C₄F₆ 0.001 + KOH 0.1 + 水 1 → 针孔 1；余是背蚀/写孔/刻蚀损耗。',
  },
  {
    /**
     * **五维针孔架：粗台 + 3 只 PZT + 2 只倾角 + 5 只电容传感器。**
     *
     *   粗台 1 + PZT 3 + 倾角 2 + 传感器 5 + 控制板 1 + 钛/铝 2 → 五维架 1
     *
     * 0.1 µm 级五轴、真空兼容；PZT 的 0.1 nm 分辨率被粗台/柔顺机构串扰吃掉，
     * 五只电容传感器闭环是必须的。120 h 是装配/调校估算。
     */
    id: 'make/euv-pinhole-mount',
    name: 'EUV 针孔五维调整架制造',
    produces: [
      {
        item: 'std/euv-pinhole-mount',
        qty: q(1),
        gives: [
          { param: 'axes', kind: 'range', min: 5, max: 5 },
          { param: 'resolution', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'travel', kind: 'range', min: 10, max: 100 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/euv-stepper-hina/stage', qty: q(1) }] },
      { anyOf: [{ item: 'plant/pzt-stage', qty: q(3) }] },
      { anyOf: [{ item: 'plant/ellipsoid-stitch/stage/piezo-tilt', qty: q(2) }] },
      { anyOf: [{ item: 'plant/pzt-stage/capacitive-sensor', qty: q(5) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/titanium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(120) },
    steps: [
      {
        note_zh: '装粗台与柔顺机构：五轴解耦，串扰 ≤1 %；粗台行程 300 mm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装 3 只 PZT 与 2 只倾角：x/y/z/tip/tilt；PZT 闭环 0.1–0.5 nm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装 5 只电容传感器并闭环；装针孔，真空兼容；标定五轴',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '粗台 1 + PZT 3 + 倾角 2 + 传感器 5 + 控制板 1 + 钛 1 + 铝 1 → 五维架 1；余是装调/标定损耗。',
  },
  {
    /**
     * **660 mm 台：2 × 300 mm 台串联 + 公共 frame + 隔振。**
     *
     * 300 mm 台两台、frame、隔振、双控制板；粗 360 + 精 300 重叠，
     * 两级误差 RSS 进 0.5–1 nm。不是把单台放大：公共 frame 的热漂移、
     * 两级坐标对齐、重叠区切换是难点。300 h 是装配/标定估算。
     */
    id: 'make/euv-stage-660',
    name: '660 mm 双台串联工件台制造',
    produces: [
      {
        item: 'plant/euv-stage-660',
        qty: q(1),
        gives: [
          { param: 'stroke', kind: 'range', min: 660, max: 660 },
          { param: 'positionError', kind: 'range', min: 0.5, max: 1, record: 'mat/euv-stage-660-measure-record' },
          { param: 'readout', kind: 'range', min: 0.5, max: 1, record: 'mat/euv-stage-660-measure-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/euv-stepper-hina/stage', qty: q(2) }] },
      { anyOf: [{ item: 'plant/euv-stepper-hina/frame', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-stepper-hina/isolation', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(300) },
    steps: [
      {
        note_zh: '两台 300 mm 台装到公共 frame：粗台/精台同轴，重叠区 60 mm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装隔振与双控制板；两级坐标对齐、重叠区切换逻辑',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '全 660 mm 行程标定：两级误差 RSS、热漂移、重复性；写验收（0.5–1 nm 是设计）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '300 mm 台 2 + frame 1 + 隔振 1 + 控制板 2 + 铝 1 + 钢 1 → 660 mm 台 1；余是装调/标定损耗。',
  },
  {
    /**
     * **EUV 绝对参考平晶：0.1 nm 基底 + Mo/Si 50 对，三块一起做。**
     *
     *   300 mm 基底 3 + 硅片 1 + 氩 0.01 + 水 1 → 平晶 3
     *
     * 基底走 `make/ref-flat-open` 的 0.1 nm 三平晶/液面法；镀 Mo/Si 后
     * 膜应力会把平晶压弯，0.1–0.2 nm 是镀后设计窗口。三块一起做，
     * 三平晶互检才有绝对约束（单块没有意义）。
     */
    id: 'make/euv-absolute-flat',
    name: 'EUV 绝对参考平晶制造',
    produces: [
      {
        item: 'std/euv-absolute-flat',
        qty: q(3),
        gives: [
          { param: 'size', kind: 'range', min: 300, max: 300 },
          { param: 'figure', kind: 'range', min: 0.1, max: 0.2 },
          { param: 'roughness', kind: 'range', min: 0.1, max: 0.2 },
          { param: 'coating', kind: 'enum', oneOf: ['Mo/Si'] },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/ref-flat-interferometer/substrate-300',
            qty: q(3),
            need: [{ param: 'figure', kind: 'range', max: 0.1, dir: 'atMost' }],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(40) },
    steps: [
      {
        note_zh: '三块 0.1 nm 基底清洗；装 coater，Mo 2.8 nm / Si 4.1 nm，50 对',
        performedBy: 'plant/euv-coater',
        under: [
          { param: 'pressure', min: 0.1, max: 1 },
          { param: 'temperature', min: 100, max: 150 },
        ],
      },
      {
        note_zh: '冷却 ≤50 °C/h，防镀层应力把平晶压弯；出炉后立即测 figure',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '可见光/反射计测镀后 figure 与反射率；0.1–0.2 nm 是设计窗口',
        performedBy: 'plant/ref-flat-interferometer',
      },
    ],
    unbalanced_zh:
      '300 mm 基底 3 + 硅片 1 + 氩 0.01 + 水 1 → 平晶 3；余是镀膜/清洗/装夹损耗。',
  },
  {
    /**
     * **EUV 变线距光栅：32 nm 写机写 417–1000 nm 周期，RIE 刻 Si。**
     *
     *   硅片 1 + 胶 0.001 + C₄F₆ 0.001 + 水 1 → 光栅 1
     *
     * 1200 线/mm、30 mm、槽深 25–40 nm；效率 0.15–0.3 是 design。
     * 可见光 OES 光栅没有 EUV 多层/闪耀，不能直接拿来用。
     */
    id: 'make/euv-grating',
    name: 'EUV 变线距光栅制造',
    produces: [
      {
        item: 'std/euv-grating',
        qty: q(1),
        gives: [
          { param: 'linesPerMM', kind: 'range', min: 1200, max: 1200 },
          { param: 'size', kind: 'range', min: 30, max: 30 },
          { param: 'grooveDepth', kind: 'range', min: 25, max: 40 },
          { param: 'efficiency', kind: 'range', min: 0.15, max: 0.3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/cf4', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(16) },
    steps: [
      {
        note_zh: '硅片清洗 + 甩胶 0.1 µm；前烘',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '32 nm 写机写 417–1000 nm 周期光栅；4–10 nm 束斑',
        performedBy: 'plant/euv-mask-writer',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: 'C₄F₆ RIE 刻 Si 槽 25–40 nm；去胶',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'pressure', min: 0.1, max: 10 },
          { param: 'temperature', min: 20, max: 80 },
        ],
      },
      {
        note_zh: 'CD-SEM 读周期/槽深；效率 0.15–0.3 是 design，不是实测',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
    ],
    unbalanced_zh: '硅片 1 + 胶 0.001 + C₄F₆ 0.001 + 水 1 → 光栅 1；余是写/刻/去胶损耗。',
  },
  {
    /**
     * **EUV 光谱/etendue 机：光栅 + 快探测器 + 测角 + 真空腔。**
     *
     *   光栅 1 + 快探测器 1 + 测角 1 + 腔 1 + 馈通 2 + 控制板 1 + 铝/钢
     *   → 光谱机 1
     *
     * 分辨率 0.2–0.5 nm 是 design；测角 1° 的色散足够分 13.5 nm 带内/带外，
     * 但分不清 0.1 nm 的精细结构。120 h 是装配/标定估算。
     */
    id: 'make/euv-spectrometer',
    name: 'EUV 光谱/etendue 量测机制造',
    produces: [
      {
        item: 'plant/euv-spectrometer',
        qty: q(1),
        gives: [
          { param: 'wavelengthRange', kind: 'range', min: 10, max: 20 },
          { param: 'resolution', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'wavelength', kind: 'range', min: 13.5, max: 13.5 },
          { param: 'measure/bandwidth', kind: 'range', min: 0, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/euv-grating', qty: q(1) }] },
      { anyOf: [{ item: 'std/euv-detector-fast', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-reflectometer/goniometer', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-reflectometer/chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-reflectometer/feedthrough', qty: q(2) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: ['plant/euv-vacuum', 'plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(120) },
    steps: [
      {
        note_zh: '装光栅/测角/探测器：光栅在 13.5 nm 的衍射角；测角 1°',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装腔/馈通，抽真空 1e-6–1e-3 Pa，检漏；EUV 源下标定波长',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '扫描 10–20 nm，读带内功率/带宽/etendue；分辨率 0.2–0.5 nm 是 design',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '光栅 1 + 快探测器 1 + 测角 1 + 腔 1 + 馈通 2 + 控制板 1 + 铝 1 + 钢 1 → 光谱机 1；余是装调/标定损耗。',
  },
  {
    /**
     * **液滴频闪成像机：CCD + 显微镜 + 白光 + 脉冲驱动。**
     *
     *   CCD 1 + 显微镜 1 + 白光 1 + 控制板 1 + 铝/钢 2 → 成像机 1
     *
     * 50 kHz 液滴用脉冲光源在固定相位凝固，CCD 积分多帧；两帧不同延迟
     * 给速度，单帧给直径。分辨率 1–3 µm、jitter 2–10 ns 是 design。
     * 80 h 是装配/标定估算。
     */
    id: 'make/euv-droplet-imager',
    name: '液滴频闪成像机制造',
    produces: [
      {
        item: 'plant/euv-droplet-imager',
        qty: q(1),
        gives: [
          { param: 'resolution', kind: 'range', min: 1, max: 3 },
          { param: 'field', kind: 'range', min: 100, max: 500 },
          { param: 'strobe', kind: 'range', min: 10, max: 100 },
          { param: 'jitter', kind: 'range', min: 2, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/metrology-ccd', qty: q(1) }] },
      { anyOf: [{ item: 'plant/dicing-saw/microscope', qty: q(1) }] },
      { anyOf: [{ item: 'plant/white-light-source', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: ['plant/euv-pulser', 'plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(80) },
    steps: [
      {
        note_zh: '装 CCD 与显微镜：50–200×，视场 100–500 µm；像素 10 µm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装白光与脉冲驱动：10–100 kHz，jitter ≤10 ns；与液滴发生器同步',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '用刻线尺标定像素/视场；写验收（分辨率/jitter 是 design）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: 'CCD 1 + 显微镜 1 + 白光 1 + 控制板 1 + 铝 1 + 钢 1 → 成像机 1；余是装调/标定损耗。',
  },
  {
    /**
     * **激光光束质量机：刀口扫描 + 热电探测器 + 水冷收集。**
     *
     *   探测器 1 + 台 1 + 控制板 1 + 铜 2 + 水 10 + 铝/钢 2 → 量测机 1
     *
     * 20 kW 不进探测器：铜刀口/水冷收集挡掉绝大部分，探测器只看刀口
     * 透过的 mW 级；扫描重建焦斑与指向。spot 20–50 µm、pointing 20–50 µrad
     * 是 design，不是实测。
     */
    id: 'make/laser-beam-profiler',
    name: '10.6 µm 激光光束质量/聚焦/指向量测机制造',
    produces: [
      {
        item: 'plant/laser-beam-profiler',
        qty: q(1),
        gives: [
          { param: 'wavelength', kind: 'range', min: 10.6, max: 10.6 },
          { param: 'power', kind: 'range', min: 0, max: 30000 },
          { param: 'focusSpot', kind: 'range', min: 20, max: 50, record: 'mat/laser-beam-profiler-measure-record' },
          { param: 'pointing', kind: 'range', min: 20, max: 50, record: 'mat/laser-beam-profiler-measure-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/ftir/detector', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-stepper-hina/stage', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(80) },
    steps: [
      {
        note_zh: '装刀口/台/探测器：刀口在焦面，台 0.5 nm 定位；水冷铜收集',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '10.6 µm 准直；刀口扫描重建焦斑，双探测器定指向',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '标定功率/焦斑/指向；spot 20–50 µm、pointing 20–50 µrad 是 design',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '探测器 1 + 台 1 + 控制板 1 + 铜 2 + 水 10 + 铝 1 + 钢 1 → 激光量测机 1；余是装调/标定损耗。',
  },
  {
    /**
     * **水流量计：0.5–50 L/min，涡轮/孔板。**
     *
     *   不锈钢 1 + 铜 0.5 + 控制板 1 → 流量计 1
     *
     * 量热器的 ṁ 项；1–2 % 是资格带（不是读数）。40 h 是加工/标定估算。
     */
    id: 'make/water-flow-meter',
    name: '水流量计制造',
    produces: [
      {
        item: 'std/water-flow-meter',
        qty: q(1),
        gives: [
          { param: 'flow', kind: 'range', min: 0.5, max: 50 },
          { param: 'accuracy', kind: 'range', min: 1, max: 2, record: 'mat/gate-water-flow-meter-record' },
          { param: 'pressure', kind: 'range', min: 0.1, max: 1 },
        ],
      },
      {
        item: 'plant/water-flow-meter',
        qty: q(1),
        gives: [
          { param: 'measure/accuracy', kind: 'range', min: 1, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(40) },
    steps: [
      {
        note_zh: '车流量计壳体/涡轮；不锈钢/铜，0.1–1 MPa 密封',
        performedBy: 'lathe',
      },
      {
        note_zh: '装涡轮/孔板与传感器；控制板读脉冲',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '称重法标定 0.5–50 L/min；1–2 % 是 design',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '不锈钢 1 + 铜 0.5 + 控制板 1 → 流量计 1；余是加工/标定损耗。',
  },
  {
    /**
     * **20 kW 水冷量热器：铜体 + 2 只热电偶 + 流量计。**
     *
     * 20 kW 进铜体，水带走热量；P = ṁ cp ΔT。流量/温差两项都标定；
     * accuracy 0.5–1 % 是 design。80 h 是加工/标定估算。
     */
    id: 'make/laser-calorimeter',
    name: '20 kW 水冷量热器制造',
    produces: [
      {
        item: 'plant/laser-calorimeter',
        qty: q(1),
        gives: [
          { param: 'power', kind: 'range', min: 0, max: 30000 },
          { param: 'accuracy', kind: 'range', min: 0.5, max: 1, record: 'mat/laser-calorimeter-accuracy-measure-record' },
          { param: 'response', kind: 'range', min: 10, max: 60 },
          // 量热器读数的稳定度能力：0–5 %（30 s 窗口）。
          { param: 'measure/stability', kind: 'range', min: 0, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(10) }] },
      { anyOf: [{ item: 'std/water-flow-meter', qty: q(1) }] },
      { anyOf: [{ item: 'std/thermocouple-nicr-nial-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(100) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(80) },
    steps: [
      {
        note_zh: '车/焊铜体水冷腔；20 kW 热负荷，水路无气泡',
        performedBy: 'lathe',
      },
      {
        note_zh: '装 2 只热电偶与流量计；温差/流量同步采样',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '电加热标定 0–30 kW；accuracy 0.5–1 % 是 design',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '铜 10 + 流量计 1 + 热电偶 2 + 水 100 + 控制板 1 + 铝 1 + 钢 1 → 量热器 1；余是加工/标定损耗。',
  },
  {
    /**
     * **14:1 RF 合成器：14 只铁氧体变压器合成 20 kW。**
     *
     *   铁氧体磁芯 14 + 铜 2 + 铝/钢 2 → 合成器 1
     *
     * 插损 0.3–0.8 dB、隔离 20–30 dB 是 design；100 h 是绕制/调试估算。
     */
    id: 'make/rf-combiner',
    name: '14:1 RF 合成器制造',
    produces: [
      {
        item: 'std/rf-combiner',
        qty: q(1),
        gives: [
          { param: 'ports', kind: 'range', min: 14, max: 14 },
          { param: 'frequency', kind: 'range', min: 27, max: 27 },
          { param: 'power', kind: 'range', min: 0, max: 25000 },
          { param: 'insertionLoss', kind: 'range', min: 0.3, max: 0.8, record: 'mat/rf-combiner-measure-record' },
          { param: 'isolation', kind: 'range', min: 20, max: 30 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/ferrite-core-general', qty: q(14) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(100) },
    steps: [
      {
        note_zh: '绕 14 只 1:1 传输线变压器；幅度/相位配对',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装合成器/水冷；14 路合 1，插损 0.3–0.8 dB、隔离 20–30 dB',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '20 kW 水冷假负载测试；写验收（插损/隔离是 design）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '磁芯 14 + 铜 2 + 铝 1 + 钢 1 → 合成器 1；余是绕制/调试损耗。',
  },
  {
    /**
     * **20 kW RF 发生器：14 × 1.2–1.6 kW 模块 + 合成器。**
     *
     *   模块 14 + 合成器 1 + 控制板 1 + 铜 2 + 水 100 + 铝/钢 → 发生器 1
     *
     * 18–22 kW、效率 0.7–0.85、稳定度 0.2–0.5 % 是 design；150 h 估算。
     * 模块是同频 27 MHz 的 ICP 射频源，相位锁定后合成。
     */
    id: 'make/rf-generator-20kw',
    name: '20 kW RF 发生器制造',
    produces: [
      {
        item: 'plant/rf-generator-20kw',
        qty: q(1),
        gives: [
          { param: 'frequency', kind: 'range', min: 27, max: 27 },
          { param: 'power', kind: 'range', min: 18000, max: 22000, record: 'mat/rf-generator-20kw-measure-record' },
          { param: 'efficiency', kind: 'range', min: 0.7, max: 0.85, record: 'mat/rf-generator-20kw-measure-record' },
          { param: 'stability', kind: 'range', min: 0.2, max: 0.5, record: 'mat/rf-generator-20kw-load-stability-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/icp-ms/rf-generator', qty: q(14) }] },
      { anyOf: [{ item: 'std/rf-combiner', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(100) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(150) },
    steps: [
      {
        note_zh: '装 14 只 1.2–1.6 kW / 27 MHz 模块；同频、相位锁定',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '接 14:1 合成器与水冷假负载；逐级加功率到 20 kW',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '测效率/稳定度/相位一致性；18–22 kW 是 design',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '模块 14 + 合成器 1 + 控制板 1 + 铜 2 + 水 100 + 铝 1 + 钢 1 → RF 发生器 1；余是装调/测试损耗。',
  },
  {
    /**
     * **CO₂ slab 放电腔：大面积电极 + 石英介质 + 气体。**
     *
     *   铜 4 + 铝 2 + 石英 2 + CO₂/N₂/He 各 1 + 水 20 → slab 1
     *
     * 1 m 级、gap 2–5 mm、10–100 kPa；放电均匀性/电极平行度是底。
     * 200 h 是加工/封接/老炼估算。
     */
    id: 'make/co2-slab',
    name: 'CO₂ slab 放电腔制造',
    produces: [
      {
        item: 'std/co2-slab',
        qty: q(1),
        gives: [
          { param: 'length', kind: 'range', min: 0.8, max: 1.2 },
          { param: 'power', kind: 'range', min: 0, max: 25000 },
          { param: 'gap', kind: 'range', min: 2, max: 5 },
          { param: 'pressure', kind: 'range', min: 10, max: 100 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(4) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(2) }] },
      { anyOf: [{ item: 'mat/co2', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/helium', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(200) },
    steps: [
      {
        note_zh: '加工铜电极/铝腔：1 m 级、gap 2–5 mm、平行度 ≤10 µm',
        performedBy: 'lathe',
      },
      {
        note_zh: '装石英介质/封接；10–100 kPa 检漏',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '充 CO₂:N₂:He、老炼；放电均匀性/功率是 design',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '铜 4 + 铝 2 + 石英 2 + CO₂/N₂/He + 水 20 → slab 1；余是加工/封接损耗。',
  },
  {
    /**
     * **气体循环：风机 + 铜热交换器 + 稳压。**
     *
     * 100–1000 m³/h、10–100 kPa、0.5–2 K 是 design；100 h 估算。
     */
    id: 'make/laser-gas-loop',
    name: 'CO₂ 激光气体循环制造',
    produces: [
      {
        item: 'plant/laser-gas-loop',
        qty: q(1),
        gives: [
          { param: 'flow', kind: 'range', min: 100, max: 1000 },
          { param: 'pressure', kind: 'range', min: 10, max: 100 },
          { param: 'tempStability', kind: 'range', min: 0.5, max: 2, record: 'mat/laser-gas-loop-measure-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/reflow-furnace/blower', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(50) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(100) },
    steps: [
      {
        note_zh: '装风机/铜热交换器/稳压腔；100–1000 m³/h、10–100 kPa',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '检漏、流量/压降测试；0.5–2 K 温控是 design',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '风机 1 + 铜 2 + 钢 2 + 水 50 + 控制板 1 → 气体循环 1；余是装调损耗。',
  },
  {
    /**
     * **20 kW slab 激光整机：slab + 20 kW RF + 气体循环 + 水冷。**
     *
     *   slab 1 + RF 1 + 气循 1 + 铜 2 + 水 100 → 激光 1
     *
     * 20 kW 是 design；300 h 是装配/老炼估算。与 500 段小管是同一
     * `plant/euv-source/laser` 的升级路线，不是另一台产品。
     */
    id: 'make/slab-laser-20kw',
    name: 'CO₂ 激光头制造',
    produces: [
      {
        item: 'plant/euv-source/laser',
        qty: q(1),
        gives: [{ param: 'power', kind: 'range', min: 18000, max: 22000, record: 'mat/slab-laser-20kw-measure-record' }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/co2-slab', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rf-generator-20kw', qty: q(1) }] },
      { anyOf: [{ item: 'plant/laser-gas-loop', qty: q(1) }] },
      { anyOf: [{ item: 'std/copper-mirror-10.6', qty: q(1) }] },
      { anyOf: [{ item: 'std/copper-output-coupler-10.6', qty: q(1) }] },
      { anyOf: [{ item: 'std/copper-oap-10.6', qty: q(1) }] },
      { anyOf: [{ item: 'std/znse-window', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(100) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(300) },
    steps: [
      {
        note_zh: '装 slab 腔/电极/光学；RF 接口、气体进出口',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '接 20 kW RF 与气体循环；水冷/联锁',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '出光/老炼；20 kW 是 design，用刀口/量热测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: 'slab 1 + RF 1 + 气循 1 + 铜镜 1 + 输出耦合 1 + OAP 1 + ZnSe 窗 1 + 水 100 → slab 激光 1；余是装调/老炼损耗。',
  },
  {
    /**
     * **10.6 µm 铜镜：金刚石车削 + 金膜。**
     *
     *   铜 1 + 金 0.001 + 氩 0.01 + 水 1 → 铜镜 1
     *
     * roughness 10–20 nm、figure 50–100 nm、reflectivity 0.98–0.99 是 design；
     * 80 h 是车削/抛光/镀金估算。20 kW 下 1–2 % 吸收就是 200–400 W 热。
     */
    id: 'make/copper-mirror-10.6',
    name: '10.6 µm 铜镜制造',
    produces: [
      {
        item: 'std/copper-mirror-10.6',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 50, max: 100 },
          { param: 'roughness', kind: 'range', min: 10, max: 20 },
          { param: 'figure', kind: 'range', min: 50, max: 100 },
          { param: 'reflectivity', kind: 'range', min: 0.98, max: 0.99 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(80) },
    steps: [
      {
        note_zh: '金刚石车削铜坯：Ra 10–20 nm、figure 50–100 nm',
        performedBy: 'lathe',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '抛光 + 蒸金 100 nm；氩气保护，附着力/针孔',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.1 }],
      },
      {
        note_zh: 'AFM/干涉仪复测 roughness/figure；10.6 µm 反射率',
        performedBy: 'plant/afm',
      },
    ],
    unbalanced_zh: '铜 1 + 金 0.001 + 氩 0.01 + 水 1 → 铜镜 1；余是车削/抛光/镀金损耗。',
  },
  {
    /**
     * **快刀伺服：2 只 PZT 堆 + 柔顺机构 + 电容闭环。**
     *
     *   PZT 2 + 柔顺 1 + 传感器 1 + 控制板 1 + 铝/钢 2 → 快刀 1
     *
     * 10–50 µm 行程、1–10 kHz、1–10 nm 分辨率是 design；80 h 估算。
     */
    id: 'make/fast-tool-servo',
    name: '快刀伺服制造',
    produces: [
      {
        item: 'plant/fast-tool-servo',
        qty: q(1),
        gives: [
          { param: 'stroke', kind: 'range', min: 10, max: 50 },
          { param: 'bandwidth', kind: 'range', min: 1, max: 10 },
          { param: 'resolution', kind: 'range', min: 1, max: 1, record: 'mat/fast-tool-servo-step-measure-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/phase-shifter/stack', qty: q(2) }] },
      { anyOf: [{ item: 'plant/pzt-stage/flexure', qty: q(1) }] },
      { anyOf: [{ item: 'plant/pzt-stage/capacitive-sensor', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(80) },
    steps: [
      {
        note_zh: '装柔顺机构/2 只 PZT 堆；行程 10–50 µm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装电容传感器闭环；带宽 1–10 kHz、分辨率 1–10 nm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '阶跃/正弦响应测试；写验收（分辨率是 design）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: 'PZT 2 + 柔顺 1 + 传感器 1 + 控制板 1 + 铝 1 + 钢 1 → 快刀 1；余是装调损耗。',
  },
  {
    /**
     * **10.6 µm 铜 OAP：金刚石车削 + 快刀伺服 + 金膜。**
     *
     *   铜 1 + 快刀 1 + 金 0.001 + 氩 0.01 + 水 1 → OAP 1
     *
     * OAP 不是旋转对称件，普通两轴车床切不出；快刀伺服逐点修 Z。
     * roughness 10–20 nm、figure 50–100 nm、reflectivity 0.98–0.99 是 design。
     */
    id: 'make/copper-oap-10.6',
    name: '10.6 µm 铜离轴抛物镜制造',
    produces: [
      {
        item: 'std/copper-oap-10.6',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 50, max: 100 },
          { param: 'focal', kind: 'range', min: 200, max: 1000 },
          { param: 'roughness', kind: 'range', min: 10, max: 20 },
          { param: 'figure', kind: 'range', min: 50, max: 100 },
          { param: 'reflectivity', kind: 'range', min: 0.98, max: 0.99 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'plant/fast-tool-servo', qty: q(1) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(120) },
    steps: [
      {
        note_zh: '金刚石车削铜坯 + 快刀伺服逐点修 Z；OAP 离轴量/焦距',
        performedBy: 'lathe',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '抛光 + 蒸金 100 nm；附着力/针孔',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.1 }],
      },
      {
        note_zh: 'AFM/干涉仪复测；0.98/10 nm 是 design',
        performedBy: 'plant/afm',
      },
    ],
    unbalanced_zh: '铜 1 + 快刀 1 + 金 0.001 + 氩 0.01 + 水 1 → OAP 1；余是车削/镀金损耗。',
  },
  {
    /**
     * **ZnSe 输出窗口：Zn + Se 密封安瓿 → PVT 多晶 → 切/抛 → ZnS 增透。**
     *
     *   锌 1 + 硒 1 + 石英 2 + 氩 0.01 + ZnS 0.001 + 水 10 → 窗口 1
     *
     * 10.6 µm 透明；20 kW 下吸收 0.1–0.5 %/cm 是 design。200 h 是
     * 合成/退火/切抛/镀膜估算。
     */
    id: 'make/znse-window',
    name: '10.6 µm ZnSe 输出窗口制造',
    produces: [
      {
        item: 'std/znse-window',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 50, max: 100 },
          { param: 'thickness', kind: 'range', min: 5, max: 10 },
          { param: 'transmission', kind: 'range', min: 0.95, max: 0.97, record: 'mat/znse-window-measure-record' },
          { param: 'absorption', kind: 'range', min: 0.1, max: 0.5, record: 'mat/znse-window-measure-record' },
          { param: 'roughness', kind: 'range', min: 1, max: 1, record: 'mat/znse-window-measure-record' },
          { param: 'flatness', kind: 'range', min: 50, max: 70, record: 'mat/znse-window-measure-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/zinc', qty: q(1) }] },
      { anyOf: [{ item: 'mat/selenium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(2) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/zinc-sulfide', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(200) },
    steps: [
      {
        note_zh: 'Zn + Se 封入石英安瓿；800–900 °C PVT 生长 ZnSe 多晶',
        performedBy: 'plant/atmosphere-furnace',
        under: [{ param: 'temperature', min: 800, max: 900 }],
      },
      {
        note_zh: '退火/切坯/研磨抛光：flatness 50–100 nm、Ra 1–3 nm',
        performedBy: 'lathe',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '蒸 ZnS 增透膜；10.6 µm 透射/吸收',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.1 }],
      },
      {
        note_zh: 'FTIR/AFM/干涉仪复测；透射/吸收是 design',
        performedBy: 'plant/ftir',
      },
    ],
    unbalanced_zh: '锌 1 + 硒 1 + 石英 2 + 氩 0.01 + ZnS 0.001 + 水 10 → 窗口 1；余是合成/切抛/镀膜损耗。',
  },
  {
    /**
     * **铜输出耦合镜：中心孔 + 金膜，水冷。**
     *
     *   铜 1 + 金 0.001 + 氩 0.01 + 水 1 → 耦合镜 1
     *
     * 孔 5–20 mm、反射率 0.6–0.9、roughness 10–20 nm 是 design；
     * 80 h 是钻孔/车削/镀金估算。
     */
    id: 'make/copper-output-coupler',
    name: '10.6 µm 铜输出耦合镜制造',
    produces: [
      {
        item: 'std/copper-output-coupler-10.6',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 50, max: 100 },
          { param: 'hole', kind: 'range', min: 5, max: 20, record: 'mat/output-coupler-record' },
          { param: 'reflectivity', kind: 'range', min: 0.6, max: 0.9 },
          { param: 'roughness', kind: 'range', min: 10, max: 20 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(80) },
    steps: [
      {
        note_zh: '车铜坯 + 钻中心孔 5–20 mm；孔/外圆同轴',
        performedBy: 'lathe',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '金刚石车削 + 蒸金；孔边不镀/去镀',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.1 }],
      },
      {
        note_zh: 'AFM/FTIR 复测 roughness/reflectivity；孔用影像仪',
        performedBy: 'plant/afm',
      },
    ],
    unbalanced_zh: '铜 1 + 金 0.001 + 氩 0.01 + 水 1 → 耦合镜 1；余是车削/镀金损耗。',
  },
  {
    /**
     * **法拉第杯：铜杯 + 氧化铝绝缘 + 水冷。**
     *
     *   铜 1 + 氧化铝 0.5 + 水 1 → 法拉第杯 1
     *
     * 1–20 mm 孔、0–2 A；40 h 是车/装/标定估算。
     */
    id: 'make/faraday-cup',
    name: '法拉第杯制造',
    produces: [
      {
        item: 'std/faraday-cup',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 1, max: 20 },
          { param: 'current', kind: 'range', min: 0, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(40) },
    steps: [
      {
        note_zh: '车铜杯/水冷套；氧化铝绝缘子；1–20 mm 孔',
        performedBy: 'lathe',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装静电计/水冷；0–2 A 标定',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '铜 1 + 氧化铝 0.5 + 水 1 → 法拉第杯 1；余是加工/标定损耗。',
  },
  {
    /**
     * **IBF 束流剖面仪：3 只法拉第杯 + 扫描台 + 静电计。**
     *
     *   法拉第杯 3 + 台 1 + 静电计 1 + 控制板 1 + 水 10 → 剖面仪 1
     *
     * 束流 0–2 A、均匀性 1–5 %（资格带，不是读数）、能量 300–1500 eV；100 h 估算。
     */
    id: 'make/ion-beam-profiler',
    name: 'IBF 束流/均匀性剖面仪制造',
    produces: [
      {
        item: 'plant/ion-beam-profiler',
        qty: q(1),
        gives: [
          { param: 'beamCurrent', kind: 'range', min: 0, max: 2, record: 'mat/ibf-beam-record' },
          { param: 'uniformity', kind: 'range', min: 1, max: 5 },
          { param: 'energy', kind: 'range', min: 300, max: 1500, record: 'mat/ibf-beam-record' },
          { param: 'scan', kind: 'range', min: 50, max: 100 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/faraday-cup', qty: q(3) }] },
      { anyOf: [{ item: 'plant/euv-stepper-hina/stage', qty: q(1) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(100) },
    steps: [
      {
        note_zh: '装 3 只法拉第杯/扫描台：50–100 mm 扫描，杯口对束',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '接静电计/控制板；水冷；0–2 A 标定',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '扫束流剖面；均匀性 1–5 % 是 design',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '法拉第杯 3 + 台 1 + 静电计 1 + 控制板 1 + 水 10 → 剖面仪 1；余是装调损耗。',
  },
  {
    /**
     * **660 mm 小盘抛光机：5 轴、φ80–200 盘、0.05–1 psi。**
     *
     *   铸铁 50 + 钢 20 + 台 1 + 控制板 1 + 水 10 → 抛光机 1
     *
     * 300 h 是铸造/刮研/装调估算；position 0.5–1 µm 是资格带（不是读数）。
     */
    id: 'make/ccp-polisher',
    name: '660 mm 小盘数控抛光机制造',
    produces: [
      {
        item: 'plant/ccp-polisher',
        qty: q(1),
        gives: [
          { param: 'workpiece', kind: 'range', min: 660, max: 660 },
          { param: 'pad', kind: 'range', min: 80, max: 200 },
          { param: 'pressure', kind: 'range', min: 0.05, max: 1, record: 'mat/ccp-cal-record' },
          { param: 'spindle', kind: 'range', min: 10, max: 200, record: 'mat/ccp-cal-record' },
          { param: 'position', kind: 'range', min: 0.5, max: 1 },
          { param: 'measure/speed', kind: 'range', min: 0, max: 300 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(50) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(20) }] },
      { anyOf: [{ item: 'plant/euv-stepper-hina/stage', qty: q(1) }] },
      { anyOf: [{ item: 'std/hydrostatic-rotary-table-660', qty: q(1) }] },
      { anyOf: [{ item: 'std/precision-spindle', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(300) },
    steps: [
      {
        note_zh: '铸造/刮研 660 mm 床身与旋转台；主轴/小盘 φ80–200',
        performedBy: 'lathe',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装 X/Z 滑台/压力闭环/5 轴；position 0.5–1 µm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '用干涉仪/测力计标定；主轴 10–200 rpm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '铸铁 50 + 钢 20 + 台 1 + 转台 1 + 主轴 1 + 控制板 1 + 水 10 → 抛光机 1；余是加工/装调损耗。',
  },
  {
    /**
     * **液压泵：1–20 MPa、0.1–10 L/min。**
     */
    id: 'make/hydraulic-pump',
    name: '液压泵制造',
    produces: [
      {
        item: 'std/hydraulic-pump',
        qty: q(1),
        gives: [
          { param: 'pressure', kind: 'range', min: 1, max: 20 },
          { param: 'flow', kind: 'range', min: 0.1, max: 10 },
          { param: 'power', kind: 'range', min: 0.5, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(60) },
    steps: [
      {
        note_zh: '车泵体/配油盘；1–20 MPa、0.1–10 L/min',
        performedBy: 'lathe',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装电机/溢流阀；压力/流量标定',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '钢 2 + 铜 0.5 + 电机 1 + 控制板 1 → 液压泵 1；余是加工/标定损耗。',
  },
  {
    /**
     * **660 mm 静压转台：铸铁/钢台面 + 油腔 + 编码器。**
     *
     *   铸铁 100 + 钢 30 + 泵 1 + 编码器 1 + 油 10 + 控制板 1 → 转台 1
     *
     * axial/radial 0.1–0.5 µm、angle 1–2 角秒 是资格带（不是读数）；200 h 估算。
     */
    id: 'make/hydrostatic-rotary-table-660',
    name: '660 mm 静压转台制造',
    produces: [
      {
        item: 'std/hydrostatic-rotary-table-660',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 660, max: 660 },
          { param: 'axial', kind: 'range', min: 0.1, max: 0.5, record: 'mat/hydrostatic-table-measure-record' },
          { param: 'radial', kind: 'range', min: 0.1, max: 0.5, record: 'mat/hydrostatic-table-measure-record' },
          { param: 'angle', kind: 'range', min: 1, max: 2, record: 'mat/hydrostatic-table-measure-record' },
          { param: 'load', kind: 'range', min: 0, max: 200 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(100) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(30) }] },
      { anyOf: [{ item: 'std/hydraulic-pump', qty: q(1) }] },
      { anyOf: [{ item: 'std/rotary-encoder', qty: q(1) }] },
      { anyOf: [{ item: 'mat/transformer-oil', qty: q(10) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(200) },
    steps: [
      {
        note_zh: '刮研台面/油腔；660 mm、轴向/径向 0.1–0.5 µm',
        performedBy: 'lathe',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装编码器/液压泵/油路；油温控制',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '自准直仪/千分表标定；角 1–2 角秒是资格带（不是读数）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '铸铁 100 + 钢 30 + 泵 1 + 编码器 1 + 油 10 + 控制板 1 → 转台 1；余是刮研/装调损耗。',
  },
  {
    /**
     * **精密小盘主轴：磨轴/轴承预紧/动平衡。**
     *
     *   钢 5 + 铜 1 + 电机 1 + 编码器 1 + 水 1 → 主轴 1
     *
     * 10–200 rpm、径向/轴向 0.1–0.5 µm 是资格带（不是读数）；120 h 估算。
     */
    id: 'make/precision-spindle',
    name: '精密小盘主轴制造',
    produces: [
      {
        item: 'std/precision-spindle',
        qty: q(1),
        gives: [
          { param: 'speed', kind: 'range', min: 10, max: 200 },
          { param: 'radial', kind: 'range', min: 0.1, max: 0.5, record: 'mat/precision-spindle-runout-record' },
          { param: 'axial', kind: 'range', min: 0.1, max: 0.5, record: 'mat/precision-spindle-runout-record' },
          { param: 'pad', kind: 'range', min: 80, max: 200 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(1) }] },
      { anyOf: [{ item: 'std/rotary-encoder', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(120) },
    steps: [
      {
        note_zh: '磨主轴/轴承位；预紧/动平衡；径向/轴向 0.1–0.5 µm',
        performedBy: 'lathe',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装电机/编码器/小盘；10–200 rpm 试转',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '千分表/电容传感器测跳动；写验收（0.1–0.5 µm 是资格带，不是读数）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '钢 5 + 铜 1 + 电机 1 + 编码器 1 + 水 1 → 主轴 1；余是加工/平衡损耗。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...EUV_HINA_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...EUV_HINA_ROUTES];
