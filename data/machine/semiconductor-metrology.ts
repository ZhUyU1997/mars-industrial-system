/**
 * 半导体三台量具 —— 膜应力仪、0.05 µm 紫外颗粒计数器、FTIR。
 *
 * 这一份只回答三件事：
 *
 *   ① 薄膜应力怎么量：**激光扫描 + Stoney 公式**，用既有的
 *      `plant/stabilized-laser`（488 nm、相干 ≥1 m）和 `plant/laser-stage`
 *      （200 mm 行程、50 nm 定位）做光源与扫描台，本文件补的是**测量头、卡盘、
 *      PSD、读数与曲率标准**。2. 0.05 µm 颗粒怎么数：**193 nm + NA 0.9 +
 *      浅结探测器 + 光子计数**；3. SiN 的 Si/N 与 H 怎么读：**FTIR 的 Si–N
 *      （≈840 cm⁻¹）与 N–H（≈3330 cm⁻¹）吸收峰**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、膜应力仪：Stoney 公式与三档扫描
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   σ = E_s h_s² / [6(1−ν_s) h_f R]
 *
 *   Si(100) 的 E/(1−ν) = 180 GPa；h_s = 525 µm（φ100 片）；h_f = 1 µm：
 *
 *       σ = 180×10⁹ × (525×10⁻⁶)² / (6 × 1×10⁻⁶ × R) = 8.2688×10⁶ / R  (Pa)
 *
 *       R = 8.27 m   → 1 MPa
 *       R = 27.6 mm  → 300 MPa
 *       R = 8.27 mm  → 1 000 MPa
 *
 *   曲率不是直接量 R，是量**弧高** s = L²/(8R)（L 为扫描长度）：
 *
 *       1 MPa，L = 100 mm → s = 151 µm
 *       300 MPa，L = 10 mm → s = 454 µm
 *       1 000 MPa，L = 5 mm → s = 378 µm
 *
 *   所以三档扫描长度 100 / 10 / 5 mm 把 1–1000 MPa 全罩住；PSD 的 ±2 mm
 *   行程对三档都够。高度分辨 0.1 µm 时，1 MPa 档的信噪余量约 100 倍，
 *   瓶颈是**片厚与膜厚的公差**（h_s² 与 h_f 各带 ±3 % ⇒ σ 带 ±6 %），
 *   不是位移计。交付写 ±2 % 重复性、±5 % 准确度（设计值）。
 *
 *   本机不含激光与扫描台：它们是既有设备，装不进 `uses`（量具不是零件，
 *   与 `plant/laser-stage` 同一条）。本机是**测量头 + 卡盘 + 基座 + 读数 +
 *   曲率标准**；用时把激光引到头上、把片子放在 `plant/laser-stage` 上。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、0.05 µm 颗粒计数器：任务书给的 266 nm 是**更长**的波长
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   本层已有的 `plant/particle-counter` 是 **193 nm**（ArF），不是可见光。
 *   266 nm 比 193 nm 长 1.38 倍，Rayleigh 截面 ∝ λ⁻⁴，会**还回去 3.6 倍**：
 *
 *       (266/193)⁴ = 3.60
 *
 *   所以 266 nm 不是"更短波长"，它是更长的。本机仍用 193 nm，把 0.05 µm
 *   相对 0.1 µm 的 **64 倍**（d⁶）缺口从四笔还掉：
 *
 *       NA 0.5 → 0.9     Ω/4π = (1−cos64.2°)/2 = 0.282（旧 0.067）  ×4.2
 *       R  0.05 → 0.12 A/W（浅结 10 nm，不是 0.4 µm 的深结）          ×2.4
 *       功率 2.4 → 40 W（同一台 `plant/arf-laser` 的上限）             ×16.7
 *       ─────────────────────────────────────────────────────────────
 *       合计 4.2 × 2.4 × 16.7 = 168 倍；168/64 = **2.6 倍**信号余量
 *
 *   0.1 µm 档的旧机在 7 s/段给 SNR 10.3；新机 2.6 倍信号、同样 7 s 就是
 *   SNR 26.8，取 1 s/段仍有 SNR 10.1。线宽从 0.1 收到 0.05 mm，段数
 *   3925 → 7850，1 s/段 = 2.2 h/遍；洗前洗后两遍 + 装片/差分 ≈ 5 h/片。
 *   这就是交付的 `areaRate 15 cm²/h`。
 *
 *   探测器为什么能到 0.12 A/W：硅在 193 nm 的吸收深度只有 7 nm
 *   （α = 4πk/λ，k = 2.2），深结管的载流子到不了结。本机把 P 注入到
 *   5 keV（`plant/ion-implanter`）再 950 °C/30 s 退火（`plant/rta`），
 *   结深 10–20 nm，吸收层整个落在结内。暗电流靠 195 K 冷指压到 0.1 fA
 *   （旧机 2.3 fA 的 1/20；面积也从 12×12 mm 缩到 1×1 mm）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、FTIR：400–4000 cm⁻¹、4 cm⁻¹、H 下限 0.5–1 at%
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   分辨率与镜行程：Δν = 1/(2Δx) ⇒ Δx = 1/(2×4 cm⁻¹) = 0.125 cm = **1.25 mm**。
 *   波数范围：KCl 分束器覆盖 500–4000 cm⁻¹（0.4–20 µm），400–500 cm⁻¹
 *   那一档用 **PTFE 薄膜分束器**（10–25 µm，远红外）切换；两台分束器装在同一
 *   个转盘上，不另立机器。KCl 潮解，样品舱与干涉仪舱用 `mat/zeolite-4a`
 *   干燥 + `mat/nitrogen` 正压。
 *
 *   探测器：**DTGS 在本层做不出来** —— 氘（重水电解）与甘氨酸（氨 + 氯乙酸）
 *   两条链都没有，而"没有"不是结论。本文件用 `mat/barium-titanate` 的
 *   **BaTiO₃ 热释电探测器**：D* 5×10⁷–2×10⁸ cm·Hz^½/W，比 DTGS 低 5–10 倍。
 *   H 下限因此写 **0.5–1 at%**（1 at% 在 256 次累加，0.5 at% 要 1024 次），
 *   不写成 DTGS 的 0.1 at%。升级路线：氘 + 甘氨酸 → DTGS，D* 提高 5–10 倍，
 *   0.5 at% 可降到 128 次累加。这是 R8 的降级，不是"本层没有 FTIR"。
 *
 *   标定：KCl 标准具（0.5 mm、n = 1.49）的通道条纹间距
 *   1/(2nd) = 1/(2×1.49×0.05) = **6.7 cm⁻¹**，4 cm⁻¹ 分辨率下可分辨，
 *   用来定波数轴；H 含量用 `mat/si3n4-lpcvd`（H 0–2 at%）与
 *   `mat/silicon-nitride`（H 0.5–2 at%）两片做两点标定。两片的 H 都不是
 *   独立标准：前者是设计窗口，后者按 `mat/sin-h-record` 收窄 —— 本机唯一没有计量溯源的量。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、膜应力仪
// ═══════════════════════════════════════════════════════════════════════════

const FILM_STRESS_METER_ALL_ITEMS: readonly Item[] = [
  /**
   * 扫描头。**488 nm 激光的聚焦头 + 45° 分束片 + PSD 座。**
   *
   * 光路：`plant/stabilized-laser` 的 488 nm 束从侧口进 → 45° 分束片 →
   * φ0.05 mm 聚焦到片面 → 反射回分束片 → PSD。片子的曲率让反射光偏转
   * 2θ，PSD 上光点移动 d = 2θf（f = 50 mm）：
   *
   *   1 MPa，L = 100 mm：θ = L/(2R) = 100/(2×8270) = 6.05 mrad
   *                     d = 2×6.05e-3×50 = 0.605 mm
   *   1 000 MPa，L = 5 mm：θ = 5/(2×8.27) = 0.302 rad（17.3°）
   *                     d = 2×0.302×50 = 30 mm —— 超出 PSD
   *
   * 所以高应力档不是"同一个头量到底"：5 mm 档把 f 换成 10 mm，d = 6.0 mm；
   * PSD 有效面积 4×4 mm，仍差 1.5 倍。**这是本机最诚实的一处**：1 000 MPa
   * 只用 5 mm 档的**局部斜率**（取中间 ±1 mm 的线性段，θ 最大 0.121 rad，
   * d = 1.21 mm，进 PSD）；整段弧高 378 µm 由 `plant/laser-stage` 的
   * 位置读数补。交付窗口写 1–1000 MPa，但 1000 MPa 端是**分段拟合**，
   * 不是单点直读。
   */
  {
    id: 'plant/film-stress-meter/scan-head',
    name: 'Film Stress Meter Scan Head', name_zh: '膜应力仪扫描头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'spotSize', kind: 'range', min: 0.02, max: 0.1, unit: 'mm', dir: 'atMost' },
      { param: 'workingDistance', kind: 'range', min: 20, max: 100, unit: 'mm', dir: 'atLeast' },
      { param: 'scanLength', kind: 'range', min: 5, max: 200, unit: 'mm', dir: 'atLeast' },
      { param: 'wavelength', kind: 'range', min: 400, max: 600, unit: 'nm' },
      { param: 'focusError', kind: 'range', min: 0.01, max: 0.1, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * 卡盘。**三点支承 + 微调倾斜，不夹、不吸。**
   *
   * 为什么不是真空吸盘：吸力会把片子压平，而应力仪量的就是"片子本来弯多少"。
   * 三点支承只接触背面三个 φ2 的点，重力下垂按 w = ρgL⁴/(32Eh²) 估：
   * 525 µm、100 mm、ρ = 2.33、E = 130 GPa 时中心下垂 **0.8 µm** —— 比 1 MPa
   * 对应的 151 µm 小 190 倍，可以忽略；但它是系统项，标定时用一块**平晶**
   * （R = ∞）把这个 0.8 µm 的弓形扣掉。
   *
   * 倾斜范围 ±2°：片子背面与台面不平行时，PSD 的零点会偏；±2° 是三点支承
   * 能调回来的最大斜度。平面度 1 µm 是"三个点共面"的要求，不是台面整体。
   */
  {
    id: 'plant/film-stress-meter/chuck',
    name: 'Film Stress Meter Chuck', name_zh: '膜应力仪卡盘',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 100, max: 200, unit: 'mm', dir: 'atLeast' },
      { param: 'flatness', kind: 'range', min: 0.5, max: 2, unit: 'µm', dir: 'atMost' },
      { param: 'tiltRange', kind: 'range', min: 1, max: 5, unit: '°', dir: 'atLeast' },
      { param: 'repeatability', kind: 'range', min: 0.1, max: 1, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * 位置敏感探测器。**两只 `std/photodiode-general` 背靠背 + 狭缝掩模 +
   * 10 MΩ 跨阻。**
   *
   * 不用四象限管：四象限的和/差只能给"光点在哪个象限"，要给连续位移得用
   * 两只管子被同一光点对称照亮，取 (I₁−I₂)/(I₁+I₂)。狭缝把光点切成
   * 0.2×4 mm 的线，线性段 ±2 mm。分辨 0.1 µm 对应 1 MPa 档的 0.605 mm
   * 光点位移的 1/6000 —— 电学上够（10 MΩ、1 kHz 带宽的噪声 3 fA，
   * 光电流 0.4 µA），瓶颈是机械热漂。
   */
  {
    id: 'plant/film-stress-meter/psd',
    name: 'Film Stress Meter Position-Sensitive Detector', name_zh: '膜应力仪位置敏感探测器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 0.05, max: 1, unit: 'µm', dir: 'atMost' },
      { param: 'bandwidth', kind: 'range', min: 10, max: 100, unit: 'kHz', dir: 'atLeast' },
      { param: 'linearity', kind: 'range', min: 0.1, max: 2, unit: '%', dir: 'atMost' },
      { param: 'activeArea', kind: 'range', min: 1, max: 10, unit: 'mm' },
    ],
  },

  /**
   * 基座。**HT250 铸铁 120 kg + 矿棉 + 三点橡胶/弹簧隔振。**
   *
   * 隔振不是"越软越好"：测量头与片子必须一起动，否则地面振动直接进 PSD。
   * 基座的一阶共振取 10 Hz（|f/f₀| = 5 时隔振率 1/(1−25) ≈ 4 %），
   * 而扫描一段 1 s 的积分把 10 Hz 以上的振动平均掉；剩下的 1–10 Hz 靠
   * 120 kg 的惯性压。地面振动 1 µm @ 1–10 Hz，压 20 dB 后 0.1 µm，
   * 对应 1 MPa 档 151 µm 弧高的 1/1500 —— 这是 ±2 % 重复性的来源。
   */
  {
    id: 'plant/film-stress-meter/base',
    name: 'Film Stress Meter Base', name_zh: '膜应力仪基座',
    unit: '件',
    category: 'part',
    props: [
      { param: 'flatness', kind: 'range', min: 1, max: 10, unit: 'µm', dir: 'atMost' },
      { param: 'isolation', kind: 'range', min: 5, max: 50, unit: 'Hz', dir: 'atLeast' },
      { param: 'load', kind: 'range', min: 50, max: 500, unit: 'kg', dir: 'atLeast' },
    ],
  },

  /**
   * 读数与扫描控制。**20 位 ADC + 4 通道 + 二次曲线拟合。**
   *
   * 一段扫描取 256 点，二次拟合 s(x) = a + bx + cx²，曲率 R = 1/(2c)
   * （小角近似）。20 位 ADC 在 ±2 mm 上是 4 nm 分辨，比 PSD 的 0.1 µm
   * 细 25 倍 —— 读数不是瓶颈。4 通道分别接 PSD 的和、差、参考管、
   * 扫描台位置；参考管做激光功率归一化（±10 %/h 的漂移）。
   */
  {
    id: 'plant/film-stress-meter/readout',
    name: 'Film Stress Meter Readout and Scan Control', name_zh: '膜应力仪读数与扫描控制',
    unit: '件',
    category: 'part',
    props: [
      { param: 'channels', kind: 'range', min: 2, max: 8, unit: '路', dir: 'atLeast' },
      { param: 'adcBits', kind: 'range', min: 16, max: 24, unit: '位', dir: 'atLeast' },
      { param: 'sampleRate', kind: 'range', min: 1, max: 100, unit: 'kHz', dir: 'atLeast' },
      { param: 'scanTime', kind: 'range', min: 1, max: 60, unit: 'min', dir: 'atMost' },
    ],
  },

  /**
   * 曲率标准。**四块 φ100 硅片，背面磨成 R = 8.27 m / 0.827 m /
   * 27.6 mm / 8.27 mm 的球冠。**
   *
   * 为什么不拿"已知应力的膜片"当标准：膜的应力本身没有独立溯源，
   * 用膜标应力是循环。曲率是几何量，可以用**弦长 + 矢高**量出来：
   *
   *   R ≥ 0.8 m：`plant/interferometer` 数等厚条纹，φ100 上 151 µm 弧高
   *              对应 0.295 µm/条纹 ⇒ 512 条，读出 ±2 条 ⇒ R 的 ±0.4 %
   *   R < 0.8 m：`plant/comparator` 量弦长 2a 与矢高 s，R = a²/(2s) + s/2
   *              27.6 mm 的球冠取 a = 10 mm、s = 1.83 mm，量 s 到 ±1 µm
   *              ⇒ R 的 ±0.1 %
   *
   * 四块覆盖 1–1000 MPa 的四端与中点；交付不确定度 2 %（含硅片厚度
   * 525 ± 15 µm 的 3 %，它进 h_s²，是最大的一项）。
   */
  {
    id: 'plant/film-stress-meter/curvature-standard',
    name: 'Film Stress Meter Curvature Standard', name_zh: '膜应力仪曲率标准',
    unit: '件',
    category: 'part',
    props: [
      { param: 'radius', kind: 'range', min: 0.008, max: 10000, unit: 'm' },
      { param: 'uncertainty', kind: 'range', min: 0.5, max: 5, unit: '%', dir: 'atMost' },
      { param: 'diameter', kind: 'range', min: 100, max: 200, unit: 'mm', dir: 'atLeast' },
    ],
  },

  /**
   * 膜应力仪。**1–1000 MPa，1 MPa 档用 100 mm 扫描，1000 MPa 档用 5 mm。**
   *
   * 它是一台**测量头系统**：不含激光（`plant/stabilized-laser`）与扫描台
   * （`plant/laser-stage`），那两件是既有设备。本机的产出路线只装自己的
   * 六件零件；用时把 488 nm 束引到扫描头、把片子放到扫描台上。
   *
   * 三个数：
   *   stress          1–1000 MPa（设计窗口；300 MPa 是任务的目标档，
   *                   在 10 mm 扫描、454 µm 弧高上，SNR 余量 30 倍）
   *   repeatability   ±2 %（120 kg 基座 + 参考管归一化）
   *   measureTime     30 min/片（三档各扫 3 条直径 + 拟合 + 换档）
   *
   * 它补的是 `mat/si3n4-lpcvd` 的 `stress 0.5–1.5 GPa` 与
   * `mat/silicon-nitride` 的应力估算：那两条以前都写着"没有应力仪"。
   * 注意 1.5 GPa 仍在 1000 MPa 窗口外，那一段要 5 mm 档外推或换
   * 更薄的片 —— 本机不把 1.5 GPa 写成已覆盖。
   */
  {
    id: 'plant/film-stress-meter',
    name: 'Film Stress Meter', name_zh: '膜应力仪',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'stress', kind: 'range', min: 1, max: 1000, unit: 'MPa' },
      { param: 'stressResolution', kind: 'range', min: 0.1, max: 5, unit: 'MPa', dir: 'atMost' },
      { param: 'waferDiameter', kind: 'range', min: 100, max: 200, unit: 'mm', dir: 'atLeast' },
      { param: 'curvatureRadius', kind: 'range', min: 0.008, max: 10000, unit: 'm' },
      { param: 'measure/repeatability', kind: 'range', min: 0.5, max: 5, unit: '%', dir: 'atMost' },
      { param: 'measure/scanLength', kind: 'range', min: 5, max: 200, unit: 'mm', dir: 'atLeast' },
      { param: 'measureTime', kind: 'range', min: 5, max: 60, unit: 'min', dir: 'atMost' },
    ],
  },
];

const FILM_STRESS_METER_ALL_ROUTES: readonly Route[] = [
  {
    /** 扫描头：车镜筒 → 磨/抛窗口 → 装分束片与 PSD → 用平晶对光。 */
    id: 'make/film-stress-scan-head',
    name: 'Film Stress Meter Scan Head Manufacturing', name_zh: '膜应力仪扫描头制造',
    produces: [
      {
        item: 'plant/film-stress-meter/scan-head',
        qty: q(1),
        gives: [
          { param: 'spotSize', kind: 'range', min: 0.04, max: 0.06 },
          { param: 'workingDistance', kind: 'range', min: 45, max: 55 },
          { param: 'scanLength', kind: 'range', min: 5, max: 200 },
          { param: 'wavelength', kind: 'range', min: 488, max: 488 },
          { param: 'focusError', kind: 'range', min: 0.02, max: 0.08 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/interferometer', 'plant/metrology-room', 'plant/gauge-block'],
    rate: { hours: q(60) },
    steps: [
      { note_zh: '车镜筒、分束片座与 PSD 座（φ50，同轴度 0.02）', performedBy: 'lathe' },
      { note_zh: '磨/抛 φ20 窗口与 f = 50 聚焦镜：0.3 µm 尾矿粉手抛到 λ/4', performedBy: 'plant/grinder' },
      {
        note_zh: '装 45° 分束片与 PSD（两只管子夹 0.2 mm 狭缝），调零到差动输出 <1 mV',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '对光：拿 `plant/interferometer` 的平晶当 R = ∞ 的参考，调焦到 0.05 mm 光斑（刀口法量到 ±0.01）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** 卡盘：浇 HT250 板 → 铣三点的窝 → 磨平面 → 装倾斜螺钉。 */
    id: 'make/film-stress-chuck',
    name: 'Film Stress Meter Chuck Manufacturing', name_zh: '膜应力仪卡盘制造',
    produces: [
      {
        item: 'plant/film-stress-meter/chuck',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 150, max: 150 },
          { param: 'flatness', kind: 'range', min: 0.8, max: 1.2 },
          { param: 'tiltRange', kind: 'range', min: 2, max: 2 },
          { param: 'repeatability', kind: 'range', min: 0.3, max: 0.8 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(15) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(3) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(3) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(40) },
    steps: [
      {
        note_zh: '浇 φ160×30 的 HT250 板（15 kg，1 350–1 450 °C），浇后自然时效 72 h',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1300, max: 1450 }],
      },
      { note_zh: '铣三个 φ2 支承窝（120° 分布，窝深 0.5）与倾斜螺钉座', performedBy: 'plant/milling-machine' },
      { note_zh: '磨台面到平面度 1 µm（三块对研平板那一套，0.3 µm 尾矿粉）', performedBy: 'plant/grinder' },
      {
        note_zh: '装三只倾斜螺钉，用比较仪量三点等高（±0.5 µm）与重复性（拆装 5 次）',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** PSD：划两只裸管 → 夹狭缝 → 装 10 MΩ 跨阻 → 标线性。 */
    id: 'make/film-stress-psd',
    name: 'Film Stress Meter Position-Sensitive Detector Manufacturing', name_zh: '膜应力仪位置敏感探测器制造',
    produces: [
      {
        item: 'plant/film-stress-meter/psd',
        qty: q(1),
        gives: [
          { param: 'resolution', kind: 'range', min: 0.1, max: 0.2 },
          { param: 'bandwidth', kind: 'range', min: 50, max: 50 },
          { param: 'linearity', kind: 'range', min: 0.5, max: 1 },
          { param: 'activeArea', kind: 'range', min: 4, max: 4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/photodiode-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '两只 12×12 裸管贴在铝座上，中间夹 0.2 mm 狭缝（缝口研平行）', performedBy: 'lathe' },
      { note_zh: '装 10 MΩ 跨阻与齐纳基准，差动放大到 ±10 V', performedBy: 'plant/robot' },
      {
        note_zh: '标线性：比较仪推镜子走 ±2 mm，每 0.1 mm 记一点；线性度 0.5 %，分辨 0.1 µm',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** 基座：浇 120 kg 铸铁 → 铣/磨 → 垫矿棉 → 装三点隔振。 */
    id: 'make/film-stress-base',
    name: 'Film Stress Meter Base Manufacturing', name_zh: '膜应力仪基座制造',
    produces: [
      {
        item: 'plant/film-stress-meter/base',
        qty: q(1),
        gives: [
          { param: 'flatness', kind: 'range', min: 3, max: 6 },
          { param: 'isolation', kind: 'range', min: 10, max: 10 },
          { param: 'load', kind: 'range', min: 200, max: 200 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(120) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(2) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(80) },
    steps: [
      {
        note_zh: '浇 600×400×120 的 HT250 基座（120 kg，1 300–1 450 °C），浇后时效 7 天',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1300, max: 1450 }],
      },
      { note_zh: '铣安装面与三个地脚窝，磨台面到 5 µm', performedBy: 'plant/milling-machine' },
      { note_zh: '磨地脚面（与台面平行 10 µm）', performedBy: 'plant/grinder' },
      {
        note_zh: '垫 50 mm 矿棉、装三点弹簧隔振，量一阶共振 10 Hz（敲击 + 检流计看衰减）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** 读数：装 20 位 ADC 与四通道 → 烧二次拟合程序 → 标零点。 */
    id: 'make/film-stress-readout',
    name: 'Film Stress Meter Readout and Scan Control Manufacturing', name_zh: '膜应力仪读数与扫描控制制造',
    produces: [
      {
        item: 'plant/film-stress-meter/readout',
        qty: q(1),
        gives: [
          { param: 'channels', kind: 'range', min: 4, max: 4 },
          { param: 'adcBits', kind: 'range', min: 20, max: 20 },
          { param: 'sampleRate', kind: 'range', min: 20, max: 20 },
          { param: 'scanTime', kind: 'range', min: 20, max: 40 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/computer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(16) },
    steps: [
      { note_zh: '装 20 位 ADC、四通道采样保持与 ±10 V 输入保护', performedBy: 'plant/robot' },
      {
        note_zh: '烧二次拟合与 Stoney 换算程序（8192 点 FFT 不需要；只要 256 点最小二乘）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '标零点与增益：短接输入记 100 点，接 1 mV 基准记 100 点；零点漂 <1 µV',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** 曲率标准：四片硅片背面磨球冠 → 干涉仪/比较仪量 R → 编号。 */
    id: 'make/film-stress-curvature-standard',
    name: 'Film Stress Meter Curvature Standard Manufacturing', name_zh: '膜应力仪曲率标准制造',
    produces: [
      {
        item: 'plant/film-stress-meter/curvature-standard',
        qty: q(4),
        gives: [
          { param: 'radius', kind: 'range', min: 0.008, max: 8270 },
          { param: 'uncertainty', kind: 'range', min: 1, max: 3 },
          { param: 'diameter', kind: 'range', min: 100, max: 100 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(4) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/interferometer', 'plant/metrology-room', 'plant/gauge-block'],
    rate: { hours: q(40) },
    steps: [
      {
        note_zh: '四片各磨球冠：R = 8.27 m / 0.827 m / 27.6 mm / 8.27 mm（成形砂轮，弦长 100 mm 的弧高 0.15 mm–1.8 mm）',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: 'R ≥ 0.8 m 用 `plant/interferometer` 数等厚条纹（0.295 µm/条）；R < 0.8 m 用比较仪量弦长与矢高（±1 µm）',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '编号、写曲率与不确定度（1–3 %，含硅片厚度 525 ± 15 µm 的 3 %）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * 整机：装基座/卡盘 → 装扫描头/PSD → 对零 → 四块标准标定 → 验收。
     *
     * 激光与扫描台是**既有设备**：`plant/stabilized-laser` 在 `needs` 里，
     * `plant/laser-stage` 是"把片子移过光斑"的那一步的执行者。本机自己不
     * 造光源与台，所以 `uses` 里没有它们 —— 与 `plant/laser-stage` 的
     * "尺是量具，不是零件"同一条。
     */
    id: 'make/film-stress-meter',
    name: 'Film Stress Meter Assembly', name_zh: '膜应力仪装配',
    produces: [
      {
        item: 'plant/film-stress-meter',
        qty: q(1),
        gives: [
          { param: 'stress', kind: 'range', min: 1, max: 1000, record: 'mat/film-stress-record' },
          { param: 'stressResolution', kind: 'range', min: 0.2, max: 1 },
          { param: 'waferDiameter', kind: 'range', min: 100, max: 150 },
          { param: 'curvatureRadius', kind: 'range', min: 0.008, max: 8270 },
          { param: 'measure/repeatability', kind: 'range', min: 1, max: 3 },
          { param: 'measure/scanLength', kind: 'range', min: 5, max: 200 },
          { param: 'measureTime', kind: 'range', min: 20, max: 40 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/film-stress-meter/scan-head', qty: q(1) }] },
      { anyOf: [{ item: 'plant/film-stress-meter/chuck', qty: q(1) }] },
      { anyOf: [{ item: 'plant/film-stress-meter/psd', qty: q(1) }] },
      { anyOf: [{ item: 'plant/film-stress-meter/base', qty: q(1) }] },
      { anyOf: [{ item: 'plant/film-stress-meter/readout', qty: q(1) }] },
      { anyOf: [{ item: 'plant/film-stress-meter/curvature-standard', qty: q(4) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(3) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(3) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/stabilized-laser', 'plant/interferometer', 'plant/metrology-room', 'plant/clean-room'],
    rate: { hours: q(120) },
    steps: [
      {
        note_zh: '装基座与卡盘：三点支承，卡盘平面度 1 µm；用平晶当 R = ∞ 扣掉片子自重弓形',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装扫描头与 PSD：488 nm 从 `plant/stabilized-laser` 引入，45° 分束，PSD 零点在 ±0.1 mm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '对零与扫直径：`plant/laser-stage` 走 100 / 10 / 5 mm 三档，每档 3 条直径，256 点/条',
        performedBy: 'plant/laser-stage',
      },
      {
        note_zh: '四块曲率标准标定：R = 8.27 / 0.827 / 0.0276 / 0.00827 m，拟合 Stoney 系数；重复性 ≤2 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '验收：1–1000 MPa 的模拟片（四块标准 + 两片真实 SiN），误差 ≤5 %；1.5 GPa 不写已覆盖',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '六种零件 + 四块曲率标准按件计，铝/钢/铜/水按 kg 计 → 1 台；产物按台计，kg 项只是机箱与清洗水，不构成质量账。激光与扫描台是既有设备，不在本机 BOM 里。',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、0.05 µm 紫外颗粒计数器
// ═══════════════════════════════════════════════════════════════════════════

const PARTICLE_COUNTER_UV_ALL_ITEMS: readonly Item[] = [
  /**
   * 193 nm 线照明头。**40 W、0.05 × 20 mm 线、全反射铝镜。**
   *
   * 与旧机 `plant/particle-counter/illuminator` 的差别只有三处：
   * 线宽 0.1 → 0.05 mm、功率 2.4 → 40 W、镜面热负载从 120 W/cm² 提到
   * 4 000 W/cm²。4 000 W/cm² 在 400 Hz、20 ns 上是 0.2 J/cm²/脉冲，
   * 低于 193 nm 对 CMP 面的 0.3 J/cm² 损伤阈（旧机文件头问一）。
   * **再往上不是激光不够亮，是片子会烧掉。**
   */
  {
    id: 'plant/particle-counter-uv/illuminator',
    name: 'UV Particle Counter Line Illuminator Head', name_zh: '紫外颗粒计数器线照明头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'lineWidth', kind: 'range', min: 0.03, max: 0.07, unit: 'mm', dir: 'atMost' },
      { param: 'lineLength', kind: 'range', min: 15, max: 25, unit: 'mm' },
      { param: 'irradiance', kind: 'range', min: 2000, max: 6000, unit: 'W/cm²', dir: 'atLeast' },
      { param: 'wavelength', kind: 'range', min: 190, max: 200, unit: 'nm' },
      { param: 'power', kind: 'range', min: 20, max: 40, unit: 'W', dir: 'atLeast' },
    ],
  },

  /**
   * 高 NA 收集槽。**椭球槽，NA 0.9，Ω/4π = 0.282。**
   *
   * 旧机 NA 0.5（Ω/4π = 0.067）看一条 20 mm 的线；本机把槽口从 26 mm
   * 收到 26 mm、深度从 17 mm 加到 38 mm，半角从 30° 开到 64.2°：
   *
   *   Ω/4π = (1−cos64.2°)/2 = (1−0.4359)/2 = **0.282**
   *
   * 这是 0.05 µm 那 64 倍缺口里最大的一笔（4.2 倍）。代价是槽面更难抛：
   * 深 38 mm、口 26 mm 的直纹面，0.3 µm 尾矿粉要推 4 h（旧机 90 min）。
   * 镀铝 0.12 µm，反射 88 %；铝的氧化仍是寿命问题，200 h 重镀。
   */
  {
    id: 'plant/particle-counter-uv/collection',
    name: 'High-NA Collection Trough', name_zh: '高 NA 收集槽',
    unit: '件',
    category: 'part',
    props: [
      { param: 'na', kind: 'range', min: 0.85, max: 0.95, unit: '1', dir: 'atLeast' },
      { param: 'collect', kind: 'range', min: 20, max: 30, unit: '%·4π', dir: 'atLeast' },
      { param: 'reflectance', kind: 'range', min: 80, max: 92, unit: '%', dir: 'atLeast' },
      { param: 'workingDistance', kind: 'range', min: 5, max: 20, unit: 'mm', dir: 'atLeast' },
    ],
  },

  /**
   * 浅结 VUV 探测头。**P 注入 5 keV + 950 °C/30 s + 1×1 mm + 10 GΩ 跨阻。**
   *
   * 硅在 193 nm 的吸收深度 7 nm，旧机的深结（0.4 µm）只有 0.05 A/W；
   * 本机把结做到 10–20 nm，吸收层落在结内，R = 0.12 A/W（2.4 倍）。
   * 面积从 12×12 mm 缩到 1×1 mm，暗电流按面积缩 144 倍；195 K 下
   * 0.1 fA（旧机 2.3 fA 的 1/23）。10 GΩ 跨阻把 0.84 pA 信号放到 8.4 mV，
   * 热噪声 √(4kT/R) = 1.3×10⁻¹⁵ A/√Hz，比信号散粒噪声低一个量级。
   */
  {
    id: 'plant/particle-counter-uv/detector',
    name: 'Shallow-Junction VUV Detector Head', name_zh: '浅结 VUV 探测头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'darkCurrent', kind: 'range', min: 0, max: 0.5, unit: 'fA', dir: 'atMost' },
      { param: 'responsivity', kind: 'range', min: 0.08, max: 0.15, unit: 'A/W', dir: 'atLeast' },
      { param: 'activeArea', kind: 'range', min: 0.25, max: 2, unit: 'mm²' },
      { param: 'bandwidth', kind: 'range', min: 1, max: 100, unit: 'kHz', dir: 'atLeast' },
    ],
  },

  /**
   * 片子台。**0.05 mm 步距，行程 150 mm，重复性 0.02 mm。**
   *
   * 与旧机的 0.1 mm 台同一套手艺（三点支承 + 手动丝杠 + 限位块），只是
   * 丝杠从 1 mm/转换成 0.5 mm/转、限位块从 0.1 换成 0.05。位置误差仍
   * 0.05 mm —— 它是 0.05 µm 颗粒的 1000 倍，只能报"每 20 mm 段几颗"，
   * 报不出"这一颗在哪"。要报位置得光栅尺或激光干涉仪，本机不装。
   */
  {
    id: 'plant/particle-counter-uv/stage',
    name: 'Wafer Stage', name_zh: '片子台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'travel', kind: 'range', min: 100, max: 200, unit: 'mm', dir: 'atLeast' },
      { param: 'step', kind: 'range', min: 0.03, max: 0.07, unit: 'mm', dir: 'atMost' },
      { param: 'positionError', kind: 'range', min: 0.01, max: 0.1, unit: 'mm', dir: 'atMost' },
      { param: 'repeatability', kind: 'range', min: 0.005, max: 0.05, unit: 'mm', dir: 'atMost' },
    ],
  },

  /**
   * 光子计数读数。**1 s/段、双通道（信号 + 参考）、5σ 阈值。**
   *
   * 旧机用 400 Hz 锁相、τ = 3.5 s；本机信号大 2.6 倍、噪声低一半（10 GΩ
   * + 1 mm²），1 s 积分就到 SNR 10。计数按 5σ，虚警率 3×10⁻⁷/段 ×
   * 7850 段 = 0.002 颗/片。参考管做激光功率归一化，±10 %/h 的漂移消掉。
   */
  {
    id: 'plant/particle-counter-uv/readout',
    name: 'Photon Counting Readout', name_zh: '光子计数读数',
    unit: '件',
    category: 'part',
    props: [
      { param: 'channels', kind: 'range', min: 2, max: 8, unit: '路', dir: 'atLeast' },
      { param: 'bandwidth', kind: 'range', min: 1, max: 100, unit: 'kHz', dir: 'atLeast' },
      { param: 'dynamicRange', kind: 'range', min: 80, max: 120, unit: 'dB', dir: 'atLeast' },
      { param: 'timeConstant', kind: 'range', min: 0.1, max: 10, unit: 's' },
    ],
  },

  /**
   * 0.05 µm 校准片。**稀释硅溶胶旋涂到硅片上，标称 1 颗/cm²。**
   *
   * `mat/colloidal-silica` 的粒径 10–200 nm，取 50 nm 那一档；稀释到
   * 1:10⁶（质量比）后旋涂，100 mm 片上约 1 颗/cm²。密度是**按稀释比算的**，
   * 不是数出来的 —— 本层没有能独立数 0.05 µm 的第二种量具，所以这片
   * 只能当"有信号/无信号"的判据，不能当计数标准。它的用处是**验阈值**：
   * 同一片扫 10 次，读数必须落在 0.8–1.2 颗/cm²，否则阈值或雾扣除错了。
   */
  {
    id: 'plant/particle-counter-uv/calibration-wafer',
    name: '0.05 µm Calibration Wafer', name_zh: '0.05 µm 校准片',
    unit: '件',
    category: 'part',
    props: [
      { param: 'particleDiameter', kind: 'range', min: 0.04, max: 0.06, unit: 'µm' },
      { param: 'density', kind: 'range', min: 0.1, max: 10, unit: '个/cm²' },
      { param: 'uniformity', kind: 'range', min: 5, max: 15, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 0.05 µm 紫外颗粒计数器。**193 nm、NA 0.9、1 s/段、5 h/片。**
   *
   * 它比旧机 `plant/particle-counter` 细一档（0.05 vs 0.09–0.10），
   * 代价是慢 8 倍（5 h vs 18 h？旧机 18 h 是两遍 7 s/段；本机两遍 1 s/段
   * 但段数翻倍 → 2×7850 s = 4.4 h，加装片/差分 = 5 h）。**不是同一台机器
   * 的升级，是另一档量具**：旧机在 0.1 µm 上 18 h/片，本机在 0.05 µm 上
   * 5 h/片；两台并存，按指标选。
   *
   * holds 写冷指与干箱的局部条件（与旧机同一条写法）：温度 −85…−70 °C
   * 是探测器冷指，压力 1–3 kPa 是暗箱正压。整机所在仍是 19–21 °C 的
   * 计量间，不写进 holds。
   */
  {
    id: 'plant/particle-counter-uv',
    name: '0.5 µm UV Particle Counter', name_zh: '0.5 µm 紫外颗粒计数器',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: -85, max: -70 },
      { param: 'pressure', min: 1, max: 3 },
    ],
    props: [
      { param: 'minParticle', kind: 'range', min: 0.05, max: 0.1, unit: 'µm', dir: 'atMost' },
      { param: 'maxParticle', kind: 'range', min: 1, max: 10, unit: 'µm', dir: 'atLeast' },
      { param: 'areaRate', kind: 'range', min: 10, max: 50, unit: 'cm²/h', dir: 'atLeast' },
      { param: 'density', kind: 'range', min: 0, max: 0.01, unit: '个/cm²', dir: 'atMost' },
      { param: 'wavelength', kind: 'range', min: 193, max: 193, unit: 'nm' },
      { param: 'na', kind: 'range', min: 0.85, max: 0.95, unit: '1', dir: 'atLeast' },
      { param: 'scanTime', kind: 'range', min: 2, max: 8, unit: 'h', dir: 'atMost' },
      { param: 'positionError', kind: 'range', min: 0.01, max: 0.1, unit: 'mm', dir: 'atMost' },
    ],
  },
];

const PARTICLE_COUNTER_UV_ALL_ROUTES: readonly Route[] = [
  {
    /** 照明头：车镜座 → 磨柱面 → 抛 → 镀铝 → 装挡光板/碳阱 → 打痕验线宽。 */
    id: 'make/particle-uv-illuminator',
    name: 'UV Particle Counter Line Illuminator Head Manufacturing', name_zh: '紫外颗粒计数器线照明头制造',
    produces: [
      {
        item: 'plant/particle-counter-uv/illuminator',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 0.04, max: 0.06 },
          { param: 'lineLength', kind: 'range', min: 19, max: 21 },
          { param: 'irradiance', kind: 'range', min: 3500, max: 4500 },
          { param: 'wavelength', kind: 'range', min: 193, max: 193 },
          { param: 'power', kind: 'range', min: 35, max: 40 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(8) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(2) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(6) }] },
    ],
    needs: ['plant/arf-laser', 'plant/gauge-block', 'plant/metrology-room'],
    rate: { hours: q(50) },
    steps: [
      { note_zh: '车镜座、光阑板与碳阱壳（φ80 镜座，柱面支承面塞尺 5 µm 不进）', performedBy: 'lathe' },
      { note_zh: '磨柱面：成形砂轮修 R100，走一刀；只求形状，不求面形', performedBy: 'plant/grinder' },
      { note_zh: '手抛到 λ：0.3 µm 尾矿粉，机器人推 40 min', performedBy: 'plant/robot' },
      {
        note_zh: '蒸铝 0.12 µm（0.001–0.1 Pa），镀完立刻装、立刻用',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.1 }],
      },
      {
        note_zh: '装挡光板与碳阱，碳片放焦面打 100 个脉冲（40 W、400 Hz、0.2 J/cm²/脉冲），打痕量 0.05 ±0.01 mm',
        performedBy: 'plant/robot',
      },
    ],
  },

  {
    /** 收集槽：铣槽 → 精车直纹面 → 抛 → 镀铝 → 沿线验均匀性。 */
    id: 'make/particle-uv-collection',
    name: 'High-NA Collection Trough Manufacturing', name_zh: '高 NA 收集槽制造',
    produces: [
      {
        item: 'plant/particle-counter-uv/collection',
        qty: q(1),
        gives: [
          { param: 'na', kind: 'range', min: 0.88, max: 0.92 },
          { param: 'collect', kind: 'range', min: 27, max: 29 },
          { param: 'reflectance', kind: 'range', min: 85, max: 90 },
          { param: 'workingDistance', kind: 'range', min: 8, max: 12 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(12) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(4) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(70) },
    steps: [
      { note_zh: '从 12 kg 铝块粗开槽（先钻排孔、再铣到留 0.5 余量，槽深 38、壁厚 6）', performedBy: 'plant/milling-machine' },
      { note_zh: '精车椭球槽：直纹面由成形刀扫出，槽口宽 26 ±0.05，半角 64.2°', performedBy: 'lathe' },
      { note_zh: '手抛槽面到 λ：0.3 µm 尾矿粉，机器人推 4 h（面积是旧机的 2 倍、深 2.2 倍）', performedBy: 'plant/robot' },
      {
        note_zh: '蒸铝 0.12 µm，与照明头同一炉（省一次抽真空）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.1 }],
      },
      {
        note_zh: '装磨毛铝板当各向同性散射点，沿线 22 mm 读数起伏 ≤10 %（判据是槽口在不在线上）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** 探测头：注入 → 退火 → 蒸铝 → 划片 → 装管座 → 测暗电流/响应度。 */
    id: 'make/particle-uv-detector',
    name: 'Shallow-Junction VUV Detector Head Manufacturing', name_zh: '浅结 VUV 探测头制造',
    produces: [
      {
        item: 'plant/particle-counter-uv/detector',
        qty: q(1),
        gives: [
          { param: 'darkCurrent', kind: 'range', min: 0.05, max: 0.2 },
          { param: 'responsivity', kind: 'range', min: 0.10, max: 0.14 },
          { param: 'activeArea', kind: 'range', min: 0.5, max: 1 },
          { param: 'bandwidth', kind: 'range', min: 30, max: 50 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(2) }] },
      { anyOf: [{ item: 'mat/phosphorus', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    rate: { hours: q(40) },
    steps: [
      {
        note_zh: 'P 注入 5 keV、1×10¹⁵ cm⁻²（束流 1 µA，扫 1×1 cm² 约 10 s）',
        performedBy: 'plant/ion-implanter',
        under: [{ param: 'energy', min: 5, max: 10 }],
      },
      {
        note_zh: '950 °C / 30 s 退火激活（RTA，升降温 100 K/s），结深 10–20 nm',
        performedBy: 'plant/rta',
        under: [{ param: 'temperature', min: 900, max: 1000 }],
      },
      {
        note_zh: '蒸铝 100 nm 做欧姆接触与光窗（0.001–0.1 Pa；铝在 193 nm 反射 92 %，不吸收）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.1 }],
      },
      { note_zh: '划 1×1 mm 管芯、装铝管座、10 GΩ 跨阻（引线 <20 mm）', performedBy: 'plant/wire-saw' },
      {
        note_zh: '测暗电流（遮光、10 V 反偏、195 K 等 2 h）与 193 nm 响应度（±30 %，没有标准探测器）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** 片子台：铣滑座 → 磨导轨 → 刮研 → 装 0.5 mm/转丝杠与限位块。 */
    id: 'make/particle-uv-stage',
    name: 'Wafer Stage Manufacturing', name_zh: '片子台制造',
    produces: [
      {
        item: 'plant/particle-counter-uv/stage',
        qty: q(1),
        gives: [
          { param: 'travel', kind: 'range', min: 150, max: 150 },
          { param: 'step', kind: 'range', min: 0.05, max: 0.05 },
          { param: 'positionError', kind: 'range', min: 0.04, max: 0.06 },
          { param: 'repeatability', kind: 'range', min: 0.015, max: 0.025 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(5) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(50) },
    steps: [
      { note_zh: '铣滑座与导轨面（600×300×120，HT250 换成 45 钢，省一次铸造）', performedBy: 'plant/milling-machine' },
      { note_zh: '磨导轨面到直线度 5 µm/300，刮研 8 点/25 mm²', performedBy: 'plant/grinder' },
      { note_zh: '装 0.5 mm/转丝杠、消隙螺母与 0.05 mm 限位块', performedBy: 'plant/robot' },
      {
        note_zh: '标步距与重复性：比较仪量 20 步，累计 1.00 ±0.02 mm；回零 10 次，重复性 0.02 mm',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** 读数：装双通道跨阻 → 20 位 ADC → 5σ 计数与参考归一化。 */
    id: 'make/particle-uv-readout',
    name: 'Photon Counting Readout Manufacturing', name_zh: '光子计数读数制造',
    produces: [
      {
        item: 'plant/particle-counter-uv/readout',
        qty: q(1),
        gives: [
          { param: 'channels', kind: 'range', min: 4, max: 4 },
          { param: 'bandwidth', kind: 'range', min: 50, max: 50 },
          { param: 'dynamicRange', kind: 'range', min: 100, max: 100 },
          { param: 'timeConstant', kind: 'range', min: 1, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/computer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(16) },
    steps: [
      { note_zh: '装双通道 10 GΩ 跨阻、20 位 ADC 与参考除法器', performedBy: 'plant/robot' },
      { note_zh: '烧 5σ 计数与 20 mm 段密度程序（7850 段，1 s/段）', performedBy: 'plant/robot' },
      {
        note_zh: '校零与线性：短接输入 100 点、1 pA 基准 100 点；零点漂 <0.5 fA',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** 校准片：稀释硅溶胶 → 旋涂 → 干燥 → 标称密度。 */
    id: 'make/particle-uv-calibration-wafer',
    name: '0.05 µm Calibration Wafer Manufacturing', name_zh: '0.05 µm 校准片制造',
    produces: [
      {
        item: 'plant/particle-counter-uv/calibration-wafer',
        qty: q(1),
        gives: [
          { param: 'particleDiameter', kind: 'range', min: 0.05, max: 0.05 },
          { param: 'density', kind: 'range', min: 0.8, max: 1.2 },
          { param: 'uniformity', kind: 'range', min: 8, max: 12 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/colloidal-silica', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh: '硅溶胶（50 nm、5 wt%）稀释到 1:10⁶（质量比），超声 10 min 防团聚',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      { note_zh: '旋涂 2 000 r/min、30 s 到 φ100 片，氮气吹干', performedBy: 'plant/robot' },
      {
        note_zh: '标称密度 1 颗/cm²（按稀释比算）；均匀性用 5 点光学计数旁证，±10 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * 整机：装照明/收集 → 装探测头与冷指 → 装台/暗箱/读数 → 用校准片验阈值。
     *
     * 冷指与暗箱直接借用旧机 `plant/particle-counter/cold-finger` 与
     * `plant/particle-counter/dark-box` 的零件路线：它们的 195 K 与 1–3 kPa
     * 正好是本机要的，不重复造。
     */
    id: 'make/particle-counter-uv',
    name: '0.5 µm UV Particle Counter Assembly', name_zh: '0.5 µm 紫外颗粒计数器装配',
    produces: [
      {
        item: 'plant/particle-counter-uv',
        qty: q(1),
        gives: [
          { param: 'minParticle', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'maxParticle', kind: 'range', min: 1, max: 1 },
          { param: 'areaRate', kind: 'range', min: 15, max: 20 },
          { param: 'density', kind: 'range', min: 0, max: 0.01 },
          { param: 'wavelength', kind: 'range', min: 193, max: 193 },
          { param: 'na', kind: 'range', min: 0.88, max: 0.92 },
          { param: 'scanTime', kind: 'range', min: 4, max: 6 },
          { param: 'positionError', kind: 'range', min: 0.04, max: 0.06 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/particle-counter-uv/illuminator', qty: q(1) }] },
      { anyOf: [{ item: 'plant/particle-counter-uv/collection', qty: q(1) }] },
      { anyOf: [{ item: 'plant/particle-counter-uv/detector', qty: q(1) }] },
      { anyOf: [{ item: 'plant/particle-counter-uv/stage', qty: q(1) }] },
      { anyOf: [{ item: 'plant/particle-counter-uv/readout', qty: q(1) }] },
      { anyOf: [{ item: 'plant/particle-counter-uv/calibration-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'plant/particle-counter/cold-finger', qty: q(1) }] },
      { anyOf: [{ item: 'plant/particle-counter/dark-box', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(5) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(3) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(4) }] },
    ],
    needs: ['plant/arf-laser', 'plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(120) },
    steps: [
      {
        note_zh: '装照明头与收集槽：线 0.05×20 mm、收集 NA 0.9；两件的光轴同轴到 0.02 mm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装探测头与冷指：1×1 mm 管贴在 195 K 铜指上，暗电流 ≤0.2 fA；氮气正压干箱',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '装台、暗箱与读数：0.05 mm 步距、7850 段、1 s/段、5σ 阈值；光闸闭时读数 ≤2× 暗电流',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '用 0.05 µm 校准片验阈值：扫 10 次，读数 0.8–1.2 颗/cm²；偏差 >20 % 重调雾扣除',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '验收：0.05 / 0.1 µm 两档标准片，重复性 10 %；报"≥0.05 µm 的颗粒数/cm²"，位置只到 0.05 mm 段',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '五件新零件 + 旧机冷指/暗箱各 1 件 + 铝/钢/铜/水 → 1 台；产物按台计，kg 项只是机箱与清洗水。旧机的冷指与暗箱是**借用零件**，不是把旧机拆了。',
  },

  {
    /**
     * 0.05 µm 暗场计数：洗前扫一遍、洗后扫一遍，两张图相减。5 h/片。
     *
     * 与旧机 `make/wafer-inspect-193` 同一套差分逻辑：雾是静态的，颗粒
     * 洗得掉；两遍相减把雾的缓变部分拿掉。本机把 0.1 µm 换成 0.05 µm，
     * 段数 3925 → 7850，每段 1 s。判据仍是 SNR 10（0.05 µm 给 0.84 pA，
     * 噪声 3.2×10⁻¹⁴ A 的旧锁相；本机 10 GΩ + 1 mm² 的噪声更低）。
     */
    id: 'make/wafer-inspect-uv',
    name: 'Inspected Wafer Manufacturing', name_zh: '检验后晶圆制造',
    produces: [
      {
        item: 'mat/wafer-inspected',
        qty: q(1),
        gives: [
          { param: 'minParticle', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'density', kind: 'range', min: 0, max: 0.01 },
          { param: 'coverage', kind: 'range', min: 100, max: 100 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/wafer-level',
            qty: q(1),
            need: [{ param: 'dishing', kind: 'range', max: 200, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
          { item: 'mat/silicon-wafer', qty: q(1) },
        ],
      },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/clean-room', 'plant/arf-laser'],
    rate: { hours: q(5) },
    steps: [
      {
        note_zh: '装片、关暗箱、氮气吹扫到 1.5 kPa、冷指降到 195 K 等 1 h',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '洗前扫：7850 段 × 1 s（线 0.05×20 mm、4 000 W/cm²、每段 400 个脉冲），5σ 计数',
        performedBy: 'plant/particle-counter-uv',
        under: [
          { param: 'temperature', min: -80, max: -76 },
          { param: 'pressure', min: 1, max: 2 },
        ],
      },
      { note_zh: '洗片：去离子水冲 60 s + 甩干 + 氮气吹（与旧机同一手）', performedBy: 'plant/robot' },
      {
        note_zh: '洗后扫：同上；台回同一限位块（重复性 0.02 mm）',
        performedBy: 'plant/particle-counter-uv',
        under: [
          { param: 'temperature', min: -80, max: -76 },
          { param: 'pressure', min: 1, max: 2 },
        ],
      },
      {
        note_zh: '差分与计数：两图逐点相减，>5σ 记一颗；按 20 mm 段记密度，报"≥0.05 µm 的颗粒数/cm²"',
        performedBy: 'plant/robot',
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 三、FTIR
// ═══════════════════════════════════════════════════════════════════════════

const FTIR_ALL_ITEMS: readonly Item[] = [
  /**
   * 红外光源。**φ6×40 的 SiC 棒（globar），1 000 °C，60 W。**
   *
   * SiC 在 1 000 °C 的普朗克峰值 2.4 µm，400–4000 cm⁻¹（2.5–25 µm）的
   * 辐射都够；`mat/silicon-carbide` 本层有矿热炉路线（1 600–1 800 °C），
   * 不用另造材料。两端铜电极、氧化铝绝缘、钢壳水冷。寿命按 1 000 h
   * （SiC 在 1 000 °C 空气中每月电阻涨 10–20 %，1 000 h 后要换）。
   */
  {
    id: 'plant/ftir/source',
    name: 'FTIR Infrared Source', name_zh: '傅里叶变换红外光谱仪红外光源',
    unit: '件',
    category: 'part',
    props: [
      { param: 'temperature', kind: 'range', min: 800, max: 1100, unit: '°C' },
      { param: 'power', kind: 'range', min: 30, max: 100, unit: 'W' },
      { param: 'emissivity', kind: 'range', min: 0.7, max: 0.95, unit: '1', dir: 'atLeast' },
      { param: 'lifetime', kind: 'range', min: 500, max: 2000, unit: 'h', dir: 'atLeast' },
    ],
  },

  /**
   * 干涉仪。**KCl 分束器（500–4000 cm⁻¹）+ PTFE 薄膜分束器（400–500 cm⁻¹）
   * + 1.25 mm 镜行程。**
   *
   * KCl 从 `mat/potassium-chloride` 来（本层有 95–97 % 的路线），熔融后
   * 切片、抛到 λ/4 @10 µm。KCl 潮解，装在充氮的密封舱里，舱内放
   * `mat/zeolite-4a` 干燥剂。400–500 cm⁻¹ 用 10–25 µm 的 PTFE 薄膜
   * （`mat/ptfe` 压成膜），装在同一个转盘上；切换时不用开舱。
   *
   * 两个分束器都不镀膜：KCl 靠 4 % 反射、PTFE 靠薄膜干涉；代价是调制
   * 效率只有 0.4（工业镀膜分束器 0.7–0.8），但 4 cm⁻¹ 分辨率下 SNR 仍够
   * （见整机注释）。
   */
  {
    id: 'plant/ftir/interferometer',
    name: 'FTIR Interferometer', name_zh: '傅里叶变换红外光谱仪干涉仪',
    unit: '件',
    category: 'part',
    props: [
      { param: 'wavenumberMin', kind: 'range', min: 400, max: 500, unit: 'cm⁻¹', dir: 'atMost' },
      { param: 'wavenumberMax', kind: 'range', min: 4000, max: 4000, unit: 'cm⁻¹', dir: 'atLeast' },
      { param: 'resolution', kind: 'range', min: 2, max: 8, unit: 'cm⁻¹', dir: 'atMost' },
      { param: 'aperture', kind: 'range', min: 20, max: 50, unit: 'mm', dir: 'atLeast' },
      { param: 'scanLength', kind: 'range', min: 1, max: 3, unit: 'mm', dir: 'atLeast' },
      { param: 'modulationEfficiency', kind: 'range', min: 0.2, max: 0.6, unit: '1', dir: 'atLeast' },
    ],
  },

  /**
   * 热释电探测头。**1×1×0.05 mm BaTiO₃ + 银电极 + 前置放大。**
   *
   * 为什么不是 DTGS：DTGS 要氘（重水电解）与甘氨酸（氨 + 氯乙酸），
   * 两条链本层都没有；BaTiO₃ 有 `mat/barium-titanate` 的固相反应路线
   * （BaCO₃ + TiO₂，1 050–1 100 °C），是唯一现在能落地的热释电材料。
   * D* 5×10⁷–2×10⁸ cm·Hz^½/W，比 DTGS 低 5–10 倍；H 下限因此写
   * 0.5–1 at%，不是 0.1 at%。这是 R8 的降级，升级路线写在文件头。
   *
   * 1×1 mm、50 µm 厚的片，热容 C = ρcAt = 5 700×500×1e-2×5e-3 ≈ 0.14 J/K？
   * （ρ = 5.7 g/cm³、c = 0.5 J/(g·K)、A = 0.01 cm²、t = 0.005 cm ⇒
   * C = 5.7×0.5×0.01×0.005 = 1.4×10⁻⁴ J/K）；10 Hz 下热时间常数
   * τ = C/G ≈ 1 ms ≪ 1/10 Hz，跟得上斩波/扫描。
   */
  {
    id: 'plant/ftir/detector',
    name: 'FTIR Pyroelectric Detector Head', name_zh: '傅里叶变换红外光谱仪热释电探测头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'detectivity', kind: 'range', min: 5e7, max: 2e8, unit: 'cm·Hz^½/W', dir: 'atLeast' },
      { param: 'responsivity', kind: 'range', min: 1e3, max: 1e4, unit: 'V/W', dir: 'atLeast' },
      { param: 'area', kind: 'range', min: 0.25, max: 4, unit: 'mm²' },
      { param: 'bandwidth', kind: 'range', min: 1, max: 100, unit: 'Hz', dir: 'atLeast' },
      { param: 'nep', kind: 'range', min: 1e-10, max: 1e-8, unit: 'W/√Hz', dir: 'atMost' },
    ],
  },

  /**
   * 样品舱。**φ25 光窗、100 mm 光程、干燥氮气正压、KCl 窗。**
   *
   * 为什么必须干燥：KCl 窗 10 min 就起雾，而水汽在 1 600 与 3 700 cm⁻¹
   * 有强吸收，会盖掉 N–H（3 330 cm⁻¹）。舱内湿度 ≤5 %RH（zeolite-4a
   * 干燥 + 0.5 L/min 氮气正压），KCl 窗外侧再加一片可拆的 PTFE 保护膜。
   */
  {
    id: 'plant/ftir/sample-compartment',
    name: 'FTIR Sample Compartment', name_zh: '傅里叶变换红外光谱仪样品舱',
    unit: '件',
    category: 'part',
    props: [
      { param: 'beamDiameter', kind: 'range', min: 1, max: 10, unit: 'mm', dir: 'atLeast' },
      { param: 'pathLength', kind: 'range', min: 50, max: 200, unit: 'mm', dir: 'atLeast' },
      { param: 'humidity', kind: 'range', min: 0, max: 10, unit: '%RH', dir: 'atMost' },
      { param: 'purgeFlow', kind: 'range', min: 0.1, max: 1, unit: 'L/min', dir: 'atLeast' },
    ],
  },

  /**
   * 读数与 FFT。**20 位 ADC、20 kHz 采样、8192 点 FFT、15 min/谱。**
   *
   * 4 cm⁻¹ 分辨率要 1.25 mm 镜行程，双边采样 2×1.25 mm / (λ/2) 在
   * He-Ne 参考下是 7 900 个点；8192 点 FFT 正好。没有 He-Ne 就用
   * 白光的中心burst 定零光程差，采样由丝杠的 1 µm 编码盘触发（10 位），
   * 位置误差 1 µm 对应波数误差 0.04 cm⁻¹，远小于 4 cm⁻¹。
   */
  {
    id: 'plant/ftir/readout',
    name: 'FTIR Readout and FFT', name_zh: '傅里叶变换红外光谱仪读数与 FFT',
    unit: '件',
    category: 'part',
    props: [
      { param: 'adcBits', kind: 'range', min: 16, max: 24, unit: '位', dir: 'atLeast' },
      { param: 'sampleRate', kind: 'range', min: 1, max: 100, unit: 'kHz', dir: 'atLeast' },
      { param: 'fftPoints', kind: 'range', min: 1024, max: 16384, unit: '点', dir: 'atLeast' },
      { param: 'scanTime', kind: 'range', min: 1, max: 60, unit: 'min', dir: 'atMost' },
    ],
  },

  /**
   * 波数标准具。**0.5 mm 厚的 KCl 平行片，通道条纹 6.7 cm⁻¹。**
   *
   * 条纹间距 Δν = 1/(2nd)；KCl 的 n = 1.49、d = 0.05 cm：
   * 1/(2×1.49×0.05) = **6.71 cm⁻¹**。4 cm⁻¹ 分辨率下每条都能分开，
   * 数 10 条就是 67.1 cm⁻¹，波数轴斜率标到 ±0.1 %。厚度用比较仪量到
   * ±1 µm，对应 Δν 的 ±0.013 cm⁻¹。
   */
  {
    id: 'plant/ftir/wavenumber-standard',
    name: 'FTIR Wavenumber Etalon', name_zh: '傅里叶变换红外光谱仪波数标准具',
    unit: '件',
    category: 'part',
    props: [
      { param: 'thickness', kind: 'range', min: 0.4, max: 0.6, unit: 'mm' },
      { param: 'fringeSpacing', kind: 'range', min: 5, max: 10, unit: 'cm⁻¹' },
      { param: 'uncertainty', kind: 'range', min: 0.1, max: 2, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * FTIR。**400–4000 cm⁻¹、4 cm⁻¹、H 0.5–1 at%、15 min/谱。**
   *
   * 它补的是 `mat/si3n4-lpcvd` 与 `mat/silicon-nitride` 的
   * "N/Si 与 H 没有量具"：Si–N 的 TO 吸收在 ≈840 cm⁻¹，N–H 伸缩在
   * ≈3330 cm⁻¹，Si–H 在 ≈2 200 cm⁻¹。三个峰的面积比给出 H 含量与
   * Si/N 的旁证（Si/N 的主判据仍是 RBS/XPS，本机只给"富硅/富氮"的方向）。
   *
   * 0.5 at% 的 H 在 1 µm 膜、1 mm² 光斑上是 8×10⁻⁶ 吸光度；20 位 ADC、
   * 256 次累加、4 cm⁻¹ 的信噪比约 30，1024 次到 60 —— 所以 0.5 at%
   * 要 1024 次（约 4 h），1 at% 要 256 次（1 h）。这是 **BaTiO₃ 探测器**
   * 的极限，不是 FTIR 原理的极限；DTGS 升级后同时间可到 0.5 at%。
   */
  {
    id: 'plant/ftir',
    name: 'FTIR Spectrometer', name_zh: '傅里叶变换红外光谱仪',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/wavenumberMin', kind: 'range', min: 400, max: 500, unit: 'cm⁻¹', dir: 'atMost' },
      { param: 'measure/wavenumberMax', kind: 'range', min: 4000, max: 4000, unit: 'cm⁻¹', dir: 'atLeast' },
      { param: 'measure/resolution', kind: 'range', min: 2, max: 8, unit: 'cm⁻¹', dir: 'atMost' },
      { param: 'hydrogenLimit', kind: 'range', min: 0.5, max: 1, unit: 'at%', dir: 'atMost' },
      // H 含量的可报窗口：0.5 at% 要 1024 次累加，2 at% 是 N–H 峰不饱和的上限。
      // 与 `hydrogenLimit` 分开：后者是“最低能测到多少”，这个是“能报出的含量区间”。
      { param: 'measure/hydrogenContent', kind: 'range', min: 0.5, max: 2, unit: 'at%' },
      { param: 'scanTime', kind: 'range', min: 5, max: 30, unit: 'min', dir: 'atMost' },
      { param: 'snr', kind: 'range', min: 500, max: 5000, unit: '1', dir: 'atLeast' },
      { param: 'beamDiameter', kind: 'range', min: 1, max: 10, unit: 'mm', dir: 'atLeast' },
      { param: 'sampleThickness', kind: 'range', min: 0.01, max: 10, unit: 'mm', dir: 'atLeast' },
      // 1107 cm⁻¹ 间隙氧吸收：物理上可测，但本层没有氧标样；窗口按
      // 2e15–8e15 cm⁻³（≈0.04–0.16 ppm）给“最接近/假设”，不是已标定实测。
      { param: 'measure/oxygenPpm', kind: 'range', min: 0.01, max: 10, unit: 'ppm' },
    ],
  },
];

const FTIR_ALL_ROUTES: readonly Route[] = [
  {
    /** 光源：切 SiC 棒 → 装氧化铝绝缘与铜电极 → 1 000 °C 老化 → 测发射。 */
    id: 'make/ftir-source',
    name: 'FTIR Infrared Source Manufacturing', name_zh: '傅里叶变换红外光谱仪红外光源制造',
    produces: [
      {
        item: 'plant/ftir/source',
        qty: q(1),
        gives: [
          { param: 'temperature', kind: 'range', min: 950, max: 1050 },
          { param: 'power', kind: 'range', min: 50, max: 70 },
          { param: 'emissivity', kind: 'range', min: 0.80, max: 0.90 },
          { param: 'lifetime', kind: 'range', min: 800, max: 1200 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-carbide', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '切 φ6×40 的 SiC 棒，两端磨平（接触电阻 <0.1 Ω）', performedBy: 'plant/grinder' },
      { note_zh: '装氧化铝绝缘套与铜电极，钢壳水冷（进水 20 °C、流量 1 L/min）', performedBy: 'lathe' },
      {
        note_zh: '1 000 °C 老化 10 h（电阻稳定到 ±2 %），测 400–4000 cm⁻¹ 的发射谱',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 950, max: 1050 }],
      },
      {
        note_zh: '标发射率：与热电偶温度比，0.85 ±0.05；寿命按 1 000 h 记',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** 干涉仪：切/抛 KCl → 装 Michelson → 装 PTFE 远红外分束器 → 对光 → 测调制。 */
    id: 'make/ftir-interferometer',
    name: 'FTIR Interferometer Manufacturing', name_zh: '傅里叶变换红外光谱仪干涉仪制造',
    produces: [
      {
        item: 'plant/ftir/interferometer',
        qty: q(1),
        gives: [
          { param: 'wavenumberMin', kind: 'range', min: 400, max: 450 },
          { param: 'wavenumberMax', kind: 'range', min: 4000, max: 4000 },
          { param: 'resolution', kind: 'range', min: 3, max: 5 },
          { param: 'aperture', kind: 'range', min: 25, max: 30 },
          { param: 'scanLength', kind: 'range', min: 1.25, max: 1.25 },
          { param: 'modulationEfficiency', kind: 'range', min: 0.35, max: 0.45 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/potassium-chloride', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/zeolite-4a', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/interferometer', 'plant/metrology-room', 'plant/clean-room'],
    rate: { hours: q(80) },
    steps: [
      {
        note_zh: '切 0.5 mm KCl 片、抛到 λ/4 @10 µm（两面平行 0.02 mm；在干燥氮气里操作，10 min 内进舱）',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '装 Michelson：KCl 分束器 45°、两块 Al 镜（R = 0.92）、移动镜 1.25 mm 行程',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装 PTFE 薄膜分束器（10–25 µm）到转盘，400–500 cm⁻¹ 档切换；舱内放 0.2 kg zeolite-4a、充 0.05 kg N₂',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '对光：用 `plant/interferometer` 的平晶/钠灯看等厚条纹，两臂平行到 0.02 mrad；白光中心burst 调零',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '测调制效率与分辨率：1.25 mm 行程、4 cm⁻¹；KCl 标准具的 6.7 cm⁻¹ 条纹要能分开',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** 探测器：切/磨 BaTiO₃ → 蒸银电极 → 极化 → 装前置放大 → 测 D* 与 NEP。 */
    id: 'make/ftir-detector',
    name: 'FTIR Pyroelectric Detector Head Manufacturing', name_zh: '傅里叶变换红外光谱仪热释电探测头制造',
    produces: [
      {
        item: 'plant/ftir/detector',
        qty: q(1),
        gives: [
          { param: 'detectivity', kind: 'range', min: 8e7, max: 1.2e8 },
          { param: 'responsivity', kind: 'range', min: 2e3, max: 4e3 },
          { param: 'area', kind: 'range', min: 1, max: 1 },
          { param: 'bandwidth', kind: 'range', min: 10, max: 10 },
          { param: 'nep', kind: 'range', min: 2e-9, max: 4e-9 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/barium-titanate', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/silver', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 20) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    rate: { hours: q(40) },
    steps: [
      { note_zh: '切 1×1×0.1 mm 的 BaTiO₃ 片，磨到 50 µm 厚（两面平行 5 µm）', performedBy: 'plant/grinder' },
      {
        note_zh: '两面蒸银电极 100 nm（0.001–0.1 Pa），电极边缘留 0.1 mm 绝缘环',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.1 }],
      },
      {
        note_zh: '极化：2 kV/mm、100 °C、30 min，随炉冷到室温（剩余极化 8 µC/cm²）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 120 }],
      },
      { note_zh: '装 10⁹ V/A 前置放大与铝屏蔽盒，引线 <10 mm', performedBy: 'plant/robot' },
      {
        note_zh: '测 D* 与 NEP：500 K 黑体 + 斩波 10 Hz，D* 1×10⁸、NEP 3×10⁻⁹ W/√Hz（±30 %）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** 样品舱：折焊铝箱 → 装 KCl 窗 → 装干燥剂与氮气正压 → 湿度检。 */
    id: 'make/ftir-sample-compartment',
    name: 'FTIR Sample Compartment Manufacturing', name_zh: '傅里叶变换红外光谱仪样品舱制造',
    produces: [
      {
        item: 'plant/ftir/sample-compartment',
        qty: q(1),
        gives: [
          { param: 'beamDiameter', kind: 'range', min: 5, max: 5 },
          { param: 'pathLength', kind: 'range', min: 100, max: 100 },
          { param: 'humidity', kind: 'range', min: 3, max: 7 },
          { param: 'purgeFlow', kind: 'range', min: 0.4, max: 0.6 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/potassium-chloride', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/zeolite-4a', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    rate: { hours: q(30) },
    steps: [
      { note_zh: '折焊 200×150×120 的铝箱，开 φ25 光窗与 φ6 氮气口', performedBy: 'plant/sheet-shop' },
      { note_zh: '装两片 KCl 窗（φ25×3）与可拆 PTFE 保护膜，O 形圈用 PTFE 绳', performedBy: 'lathe' },
      {
        note_zh: '装 0.5 kg zeolite-4a 干燥剂与 0.5 L/min 氮气正压；湿度计读到 5 %RH（本层只有干湿球，±3 %）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** 读数：装 20 位 ADC → 装 8192 点 FFT → 丝杠编码盘触发 → 校零。 */
    id: 'make/ftir-readout',
    name: 'FTIR Readout and FFT Manufacturing', name_zh: '傅里叶变换红外光谱仪读数与 FFT 制造',
    produces: [
      {
        item: 'plant/ftir/readout',
        qty: q(1),
        gives: [
          { param: 'adcBits', kind: 'range', min: 20, max: 20 },
          { param: 'sampleRate', kind: 'range', min: 20, max: 20 },
          { param: 'fftPoints', kind: 'range', min: 8192, max: 8192 },
          { param: 'scanTime', kind: 'range', min: 10, max: 20 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/prom-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/computer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '装 20 位 ADC、20 kHz 采样与 10 位丝杠编码盘触发（1 µm/计数）', performedBy: 'plant/robot' },
      { note_zh: '烧 8192 点 FFT、相位校正与基线扣除程序到 PROM', performedBy: 'plant/robot' },
      {
        note_zh: '校零与线性：短接输入 100 点、1 mV 基准 100 点；噪声 <2 LSB',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** 波数标准：切/抛 0.5 mm KCl → 量厚 → 算条纹间距 → 编号。 */
    id: 'make/ftir-wavenumber-standard',
    name: 'FTIR Wavenumber Etalon Manufacturing', name_zh: '傅里叶变换红外光谱仪波数标准具制造',
    produces: [
      {
        item: 'plant/ftir/wavenumber-standard',
        qty: q(1),
        gives: [
          { param: 'thickness', kind: 'range', min: 0.5, max: 0.5 },
          { param: 'fringeSpacing', kind: 'range', min: 6.7, max: 6.7 },
          { param: 'uncertainty', kind: 'range', min: 0.5, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/potassium-chloride', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(12) },
    steps: [
      { note_zh: '切 0.5 mm KCl 片，两面抛到平行 0.01 mm（λ/4 @10 µm）', performedBy: 'plant/grinder' },
      {
        note_zh: '比较仪量厚 0.500 ±0.001 mm；n = 1.49 ⇒ 条纹 6.71 cm⁻¹',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      { note_zh: '编号、写厚度与条纹间距（不确定度 0.5 %）', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * 整机：装光源/干涉仪 → 装样品舱/探测器 → 装读数 → 波数标定 →
     * 用两片 SiN 标 H 窗口 → 验收。
     */
    id: 'make/ftir',
    name: 'FTIR Spectrometer Assembly', name_zh: '傅里叶变换红外光谱仪装配',
    produces: [
      {
        item: 'plant/ftir',
        qty: q(1),
        gives: [
          { param: 'measure/wavenumberMin', kind: 'range', min: 400, max: 450 },
          { param: 'measure/wavenumberMax', kind: 'range', min: 4000, max: 4000 },
          { param: 'measure/resolution', kind: 'range', min: 4, max: 5 },
          { param: 'hydrogenLimit', kind: 'range', min: 0.8, max: 1 },
          { param: 'measure/hydrogenContent', kind: 'range', min: 0.5, max: 2 },
          { param: 'scanTime', kind: 'range', min: 10, max: 20 },
          { param: 'snr', kind: 'range', min: 800, max: 1200 },
          { param: 'beamDiameter', kind: 'range', min: 5, max: 5 },
          { param: 'sampleThickness', kind: 'range', min: 0.01, max: 5 },
          { param: 'measure/oxygenPpm', kind: 'range', min: 0.01, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/ftir/source', qty: q(1) }] },
      { anyOf: [{ item: 'plant/ftir/interferometer', qty: q(1) }] },
      { anyOf: [{ item: 'plant/ftir/detector', qty: q(1) }] },
      { anyOf: [{ item: 'plant/ftir/sample-compartment', qty: q(1) }] },
      { anyOf: [{ item: 'plant/ftir/readout', qty: q(1) }] },
      { anyOf: [{ item: 'plant/ftir/wavenumber-standard', qty: q(1) }] },
      // 两片 H 标定片：0–2 at% 与 0.5–2 at% 各一片（都不是独立标准：前者设计窗口，后者按记录收窄）
      { anyOf: [{ item: 'mat/si3n4-lpcvd', qty: q(1) }] },
      { anyOf: [{ item: 'mat/silicon-nitride', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(3) }] },
    ],
    needs: ['plant/interferometer', 'plant/metrology-room', 'plant/clean-room'],
    rate: { hours: q(160) },
    steps: [
      {
        note_zh: '装光源与干涉仪：SiC 棒成像到 25 mm 孔径，KCl 分束器两臂等长到 0.1 mm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装样品舱与探测器：干燥氮气正压 5 %RH，BaTiO₃ 探测器在 f/4 焦点上',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装读数：20 位 ADC、8192 点 FFT、1.25 mm 行程；4 cm⁻¹ 下 KCl 标准具的 6.7 cm⁻¹ 条纹可分辨',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '波数标定：KCl 标准具数 10 条 = 67.1 cm⁻¹；再用 1 600 cm⁻¹ 的水汽与 2 350 cm⁻¹ 的 CO₂ 旁证',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: 'H 标定：`mat/si3n4-lpcvd`（H 0–2 at%）与 `mat/silicon-nitride`（H 0.5–2 at%）两片，N–H 3 330 cm⁻¹ 峰面积两点定标；0.5 at% 要 1 024 次累加（约 4 h）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '验收：400–4000 cm⁻¹、4 cm⁻¹、H 1 at%（256 次）/0.5 at%（1024 次）；Si/N 只给富硅/富氮方向，绝对值仍要 RBS/XPS',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '六件零件 + 两片 H 标定片 + 铝/钢/铜/水 → 1 台；产物按台计，kg 项只是机箱与清洗水。两片 SiN 是标定消耗片，不是本机零件。',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 四、导出：三台各自的数组 + 共享标准件，**四组互不重叠**
//
// 为什么这样切：`SEMIMET_*` 曾经是三个数组的并集，注册时若同时 spread
// 并集与三个子数组，每个 id 都会出现两次（43 条 duplicate_id —— 21 个
// 条目 + 22 条路线）。现在把三件**共享标准件**从子数组里分出来，
// 四组刚好是一个划分：全部 spread 一遍 = 21 个条目、22 条路线，没有重复。
//
// ⚠️ `SEMIMET_*` 不是全集，是“三台共用的标准件”。要注册的是**四组一起**：
//      FILM_STRESS_METER_ITEMS / ROUTES
//      PARTICLE_COUNTER_UV_ITEMS / ROUTES
//      FTIR_ITEMS / ROUTES
//      SEMIMET_ITEMS / ROUTES
// ═══════════════════════════════════════════════════════════════════════════

const CALIBRATION_ITEM_IDS: ReadonlySet<string> = new Set([
  'plant/film-stress-meter/curvature-standard',
  'plant/particle-counter-uv/calibration-wafer',
  'plant/ftir/wavenumber-standard',
]);

const CALIBRATION_ROUTE_IDS: ReadonlySet<string> = new Set([
  'make/film-stress-curvature-standard',
  'make/particle-uv-calibration-wafer',
  'make/ftir-wavenumber-standard',
]);

export const FILM_STRESS_METER_ITEMS: readonly Item[] = FILM_STRESS_METER_ALL_ITEMS.filter(
  (i) => !CALIBRATION_ITEM_IDS.has(i.id),
);

export const PARTICLE_COUNTER_UV_ITEMS: readonly Item[] = PARTICLE_COUNTER_UV_ALL_ITEMS.filter(
  (i) => !CALIBRATION_ITEM_IDS.has(i.id),
);

export const FTIR_ITEMS: readonly Item[] = FTIR_ALL_ITEMS.filter(
  (i) => !CALIBRATION_ITEM_IDS.has(i.id),
);

export const SEMIMET_ITEMS: readonly Item[] = [
  ...FILM_STRESS_METER_ALL_ITEMS,
  ...PARTICLE_COUNTER_UV_ALL_ITEMS,
  ...FTIR_ALL_ITEMS,
].filter((i) => CALIBRATION_ITEM_IDS.has(i.id));

export const FILM_STRESS_METER_ROUTES: readonly Route[] = FILM_STRESS_METER_ALL_ROUTES.filter(
  (r) => !CALIBRATION_ROUTE_IDS.has(r.id),
);

export const PARTICLE_COUNTER_UV_ROUTES: readonly Route[] = PARTICLE_COUNTER_UV_ALL_ROUTES.filter(
  (r) => !CALIBRATION_ROUTE_IDS.has(r.id),
);

export const FTIR_ROUTES: readonly Route[] = FTIR_ALL_ROUTES.filter(
  (r) => !CALIBRATION_ROUTE_IDS.has(r.id),
);

export const SEMIMET_ROUTES: readonly Route[] = [
  ...FILM_STRESS_METER_ALL_ROUTES,
  ...PARTICLE_COUNTER_UV_ALL_ROUTES,
  ...FTIR_ALL_ROUTES,
].filter((r) => CALIBRATION_ROUTE_IDS.has(r.id));

/**
 * 全集别名。
 *
 * 注册端有两条互斥的路：
 *   ① spread 上面四组（FILM / UV / FTIR / SEMIMET）—— 四组是一个划分；
 *   ② 只 spread 下面这一对 `ALL_SEMIMET_*` —— 它是四组之并，21 条 / 22 条。
 * **两条只能选一条**；同时 spread 会回到 43 条 duplicate_id。
 */
export const ALL_SEMIMET_ITEMS: readonly Item[] = [
  ...FILM_STRESS_METER_ITEMS,
  ...PARTICLE_COUNTER_UV_ITEMS,
  ...FTIR_ITEMS,
  ...SEMIMET_ITEMS,
];

export const ALL_SEMIMET_ROUTES: readonly Route[] = [
  ...FILM_STRESS_METER_ROUTES,
  ...PARTICLE_COUNTER_UV_ROUTES,
  ...FTIR_ROUTES,
  ...SEMIMET_ROUTES,
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ALL_SEMIMET_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...ALL_SEMIMET_ROUTES];
