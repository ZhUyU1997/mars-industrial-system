/**
 * 透射电镜（TEM）—— 把「看截面只到 SEM 的 5–10 nm」补到 **0.2–0.5 nm 点分辨**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、为什么现在必须有 TEM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `plant/fib-tem/lamella` 已经有 30–150 nm 的薄片产出路线，但没有一台
 * 透射电镜消费它 —— 截面只能靠 SEM（5–10 nm）。本文件补的是一台
 * 100–200 kV、LaB₆ 阴极、Cs 1–2 mm 的 TEM：
 *
 *   点分辨  0.2–0.5 nm     球差 + 色差 + 衍射三项合成
 *   晶格    0.14–0.3 nm    周期结构可以好于点分辨（相位衬度）
 *   放大    50k–1M
 *   电压    100–200 kV
 *   真空    1e-5–1e-7 Pa
 *
 * 这台机器是 **composedOf 装配体**（10 件零件，各有 make 路线），
 * 没有整机产出路线 —— 与 `plant/cd-sem`、`plant/afm`、`plant/interferometer`
 * 同一个形状。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、LaB₆ 的功函数与亮度
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   LaB₆：φ = 2.4–2.7 eV，100–200 kV 下亮度 **1×10⁵–1×10⁶ A/(cm²·sr)**，
 *   寿命 500–2000 h；W 灯丝 φ = 4.5 eV、亮度 1×10⁴–1×10⁵、寿命 50–100 h。
 *   同一温度下 Richardson 电流 ∝ exp(−φ/kT)，φ 低 1.8–2.1 eV 就是
 *   **10–100 倍**的亮度；LaB₆ 的代价是 1 500–1 800 °C 的工作温度与
 *   对残余氧极敏感（10⁻⁴ Pa 级的水/氧就让它蒸发）。
 *
 *   能量展宽：LaB₆ 的 ΔE = 1–2 eV（W 是 2–3 eV），它直接进色差：
 *
 *       d_c = C_c · (ΔE/E) · α
 *
 *   200 kV、C_c = 1.5 mm、ΔE = 1.5 eV、α = 10 mrad：
 *       d_c = 1.5e-3 × 7.5e-6 × 0.01 = **0.113 nm**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、球差对点分辨的限制
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   200 kV 的电子波长 **λ = 2.51 pm**（相对论修正后的值；非相对论的
 *   1.226/√200 nm = 86.7 pm 是错的，差 35 倍）。
 *
 *       d_s ≈ 0.66 · C_s^(1/4) · λ^(3/4)
 *
 *   C_s = 1 mm：0.66 × 0.1778 × 1.99e-9 = **0.234 nm**
 *   C_s = 2 mm：0.66 × 0.2115 × 1.99e-9 = **0.278 nm**
 *
 *   衍射极限 d = 0.61λ/α：α = 10 mrad 时 **0.153 nm**，不是瓶颈。
 *   色差（上式）在 ΔE = 1.5 eV 时 0.113 nm，与球差合成
 *   √(0.278² + 0.113²) = 0.30 nm；ΔE = 2 eV、α = 15 mrad 时
 *   色差 0.225 nm，合成 0.36 nm。所以点分辨写 **0.2–0.5 nm**：
 *   0.2 nm 是 C_s = 1 mm、ΔE = 1 eV 的最好端；0.5 nm 是
 *   C_s = 2 mm、ΔE = 2 eV、α = 15 mrad 的坏端。
 *
 *   晶格 0.14–0.3 nm：周期结构的相位衬度可以好于点分辨，
 *   但 0.14 nm 要求 C_s ≤1 mm、ΔE ≤1.5 eV、样品 ≤50 nm；
 *   这是设计窗口，不是每台都达得到。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、测量路线
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `measure/tem-imaging` → `mat/tem-image-record`：点/晶格分辨、样品厚度
 *   `measure/tem-edx`     → `mat/tem-edx-record`：5–40 nm 元素空间分辨、
 *                            0.1–1 wt% 检出
 *
 *   两条都 `uses plant/fib-tem/lamella` —— 这是本层第一次有量具消费那片薄片。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、十件零件
// ═══════════════════════════════════════════════════════════════════════════

export const TEM_PARTS: readonly Item[] = [
  /**
   * 电子枪。**LaB₆ 单晶阴极 + Wehnelt + 阳极。**
   *
   * LaB₆ 的 φ = 2.4–2.7 eV，比 W 的 4.5 eV 低 1.8–2.1 eV；同一温度下
   * Richardson 电流高 10–100 倍。亮度 1×10⁵–1×10⁶ A/(cm²·sr)，
   * 寿命 500–2000 h（W 50–100 h）。代价：1 500–1 800 °C 工作，
   * 10⁻⁴ Pa 级水/氧就蒸发；阴极必须可更换。
   *
   * 能量展宽 1–2 eV 直接进色差（见文件头）。
   */
  {
    id: 'plant/tem/gun',
    name: '透射电镜电子枪',
    unit: '件',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 100, max: 200, unit: 'kV' },
      { param: 'brightness', kind: 'range', min: 1e5, max: 1e6, unit: 'A/(cm²·sr)', dir: 'atLeast' },
      { param: 'lifetime', kind: 'range', min: 500, max: 2000, unit: 'h', dir: 'atLeast' },
      { param: 'energySpread', kind: 'range', min: 1, max: 2, unit: 'eV', dir: 'atMost' },
      { param: 'workFunction', kind: 'range', min: 2.4, max: 2.7, unit: 'eV' },
    ],
  },

  /**
   * 加速管。**φ20×300 的氧化铝/石英管 + 分级电极 + 高压引线。**
   *
   * 100–200 kV 沿 300 mm 分 10–20 级，每级 10–20 kV；管内真空
   * 1e-5–1e-7 Pa，沿面爬电距离 ≥20 mm/10 kV。稳定度 1e-6、
   * 纹波 <1 ppm 由高压电源保证，加速管只负责耐压与分压。
   */
  {
    id: 'plant/tem/accelerator',
    name: '透射电镜加速管',
    unit: '件',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 100, max: 200, unit: 'kV' },
      { param: 'stability', kind: 'range', min: 1e-6, max: 1e-6, unit: '1' },
      { param: 'ripple', kind: 'range', min: 0.1, max: 1, unit: 'ppm', dir: 'atMost' },
      { param: 'length', kind: 'range', min: 200, max: 400, unit: 'mm' },
    ],
  },

  /**
   * 高压电源。**100–200 kV、稳定度 1e-6、纹波 <1 ppm。**
   *
   * 变压器 + 10 只 `std/hv-rectifier-general` 倍压 + 20 只薄膜电容滤波；
   * 稳定度 1e-6 靠 **齐纳基准 + 分压反馈**（不是"买一台好电源"）：
   * 200 kV 上 1e-6 是 0.2 V，纹波 1 ppm 是 0.2 V 峰峰。
   * 绝缘：变压器油 + 氧化铝套管；输出经 100 MΩ 水阻限流。
   */
  {
    id: 'plant/tem/hv-supply',
    name: '透射电镜高压电源',
    unit: '件',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 100, max: 200, unit: 'kV' },
      { param: 'stability', kind: 'range', min: 1e-6, max: 1e-6, unit: '1' },
      { param: 'ripple', kind: 'range', min: 0.1, max: 1, unit: 'ppm', dir: 'atMost' },
      { param: 'power', kind: 'range', min: 100, max: 500, unit: 'W' },
    ],
  },

  /**
   * 镜筒。**不锈钢真空壳 + 3–5 级光阑 + 观察窗 + 漏率 ≤1e-8 Pa·L/s。**
   *
   * 10⁻⁵–10⁻⁷ Pa 不是靠一台泵：涡轮分子泵 + 离子泵 + 升华泵，
   * 烘烤 120 °C、24 h 后漏率 ≤1e-8 Pa·L/s。镜筒内的光阑要能
   * 在真空外更换（10⁻⁷ Pa 下开一次舱要 24 h 恢复）。
   */
  {
    id: 'plant/tem/column',
    name: '透射电镜镜筒',
    unit: '件',
    category: 'part',
    props: [
      { param: 'pressure', kind: 'range', min: 1e-7, max: 1e-5, unit: 'Pa', dir: 'atMost' },
      { param: 'apertures', kind: 'range', min: 3, max: 5, unit: '级' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-8, unit: 'Pa·L/s', dir: 'atMost' },
      { param: 'height', kind: 'range', min: 800, max: 1200, unit: 'mm' },
    ],
  },

  /**
   * 物镜。**极靴间隙 5–10 mm、C_s 1–2 mm、C_c 1–2 mm。**
   *
   * C_s 由极靴几何定：C_s ≈ 0.5–1 × 间隙（弱激磁），1–2 mm 对应
   * 5–10 mm 间隙。极靴材料是纯铁（`mat/iron`，2N），加工后
   * 退火去应力；线圈 5 kg 铜线、水冷。C_s 与 C_c 不能同时小：
   * 间隙小则 C_s 小、但样品空间也小（双倾台放不下）。
   */
  {
    id: 'plant/tem/objective-lens',
    name: '透射电镜物镜',
    unit: '件',
    category: 'part',
    props: [
      { param: 'cs', kind: 'range', min: 1, max: 2, unit: 'mm' },
      { param: 'cc', kind: 'range', min: 1, max: 2, unit: 'mm' },
      { param: 'poleGap', kind: 'range', min: 5, max: 10, unit: 'mm' },
      { param: 'bore', kind: 'range', min: 2, max: 5, unit: 'mm' },
    ],
  },

  /**
   * 中间镜 + 投影镜组。**2–3 级、放大 50k–1M、畸变 1–5 %。**
   *
   * 放大倍率不是物镜给的，是中间镜/投影镜的比值；50k–1M 靠
   * 2–3 级切换。畸变 1–5 % 是磁透镜的固有项，定量测量要用
   * 已知周期的标准片校正。
   */
  {
    id: 'plant/tem/lens-stack',
    name: '中间镜 + 投影镜组',
    unit: '件',
    category: 'part',
    props: [
      { param: 'magnification', kind: 'range', min: 50_000, max: 1_000_000, unit: '倍' },
      { param: 'lensCount', kind: 'range', min: 2, max: 3, unit: '级' },
      { param: 'distortion', kind: 'range', min: 1, max: 5, unit: '%', dir: 'atMost' },
      { param: 'alignment', kind: 'range', min: 0.1, max: 1, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * 样品台。**双倾 ±30–40°、漂移 <0.5 nm/min、行程 1–2 mm。**
   *
   * 双倾不是"两个轴各转 30°"：两个轴正交，样品在物镜极靴间隙里
   * 同时转，空间只有 5–10 mm。漂移 <0.5 nm/min 靠
   * 交叉滚子轴承 + 热对称结构；室温 19–21 °C 由计量间保证。
   */
  {
    id: 'plant/tem/stage',
    name: '透射电镜样品台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'tiltX', kind: 'range', min: 30, max: 40, unit: '°' },
      { param: 'tiltY', kind: 'range', min: 30, max: 40, unit: '°' },
      { param: 'drift', kind: 'range', min: 0.1, max: 0.5, unit: 'nm/min', dir: 'atMost' },
      { param: 'travel', kind: 'range', min: 1, max: 2, unit: 'mm' },
    ],
  },

  /**
   * 成像探测器。**P43 荧光屏 + 光纤耦合 CCD/CMOS，2048²、像元 10–15 µm。**
   *
   * 荧光屏把 100–200 kV 电子转成 550 nm 绿光；光纤面板 1:1 耦合到
   * CCD。2048² × 12 µm = 24.6 mm 靶面；QE 0.2–0.6、读出 1–10 fps、
   * 12–16 位。屏幕可以翻起让电子直接打到胶片/直接探测器（本层不做）。
   */
  {
    id: 'plant/tem/detector',
    name: '透射电镜成像探测器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'pixels', kind: 'range', min: 2048, max: 2048, unit: 'px' },
      { param: 'pixelSize', kind: 'range', min: 10, max: 15, unit: 'µm' },
      { param: 'quantumEfficiency', kind: 'range', min: 0.2, max: 0.6, unit: '1', dir: 'atLeast' },
      { param: 'readout', kind: 'range', min: 1, max: 10, unit: 'fps', dir: 'atLeast' },
      { param: 'dynamicRange', kind: 'range', min: 12, max: 16, unit: 'bit', dir: 'atLeast' },
    ],
  },

  /**
   * EDX 探测器。**硅漂移探测器（SDD）+ 薄窗，能量分辨 120–150 eV。**
   *
   * 元素空间分辨 5–40 nm 不是探针斑（0.2–0.5 nm），而是**薄片里的
   * 电子散射**：20–100 nm 厚、200 kV 下电子在样品里扩展 5–40 nm。
   * 检出 0.1–1 wt% 由 SDD 的立体角（0.1–0.5 sr）与死时间定。
   */
  {
    id: 'plant/tem/edx-detector',
    name: 'EDX 探测器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'spatialResolution', kind: 'range', min: 5, max: 40, unit: 'nm', dir: 'atMost' },
      { param: 'detectionLimit', kind: 'range', min: 0.1, max: 1, unit: 'wt%', dir: 'atMost' },
      { param: 'energyResolution', kind: 'range', min: 120, max: 150, unit: 'eV', dir: 'atMost' },
      { param: 'solidAngle', kind: 'range', min: 0.1, max: 0.5, unit: 'sr', dir: 'atLeast' },
    ],
  },

  /**
   * 隔振/电磁屏蔽基座。**振动 <0.1 µm/s、磁场 <0.1 nT、屏蔽 80–120 dB。**
   *
   * 铸铁 100 kg + 矿棉 + 涡流阻尼：一阶共振 5–10 Hz；铜网/坡莫合金
   * 屏蔽 80–120 dB。TEM 的 0.2 nm 在 1 M 放大下是 0.2 mm，
   * 地面 1 µm/s 的振动就够把它糊掉 —— 所以隔振是分辨率的一部分。
   */
  {
    id: 'plant/tem/isolation',
    name: '隔振/电磁屏蔽基座',
    unit: '件',
    category: 'part',
    props: [
      { param: 'vibration', kind: 'range', min: 0, max: 0.1, unit: 'µm/s', dir: 'atMost' },
      { param: 'magnetic', kind: 'range', min: 0, max: 0.1, unit: 'nT', dir: 'atMost' },
      { param: 'isolation', kind: 'range', min: 1, max: 10, unit: 'Hz', dir: 'atLeast' },
      { param: 'shielding', kind: 'range', min: 80, max: 120, unit: 'dB', dir: 'atLeast' },
    ],
  },
];

/**
 * **TEM 整机。** 十件零件装配，**没有整机产出路线**（composedOf）。
 *
 * 交付窗口（与文件头的算式一一对应）：
 *
 *   pointResolution   0.2–0.5 nm   C_s 1–2 mm、ΔE 1–2 eV、α 10–15 mrad
 *   latticeResolution 0.14–0.3 nm  相位衬度，样品 ≤50 nm 才好端
 *   magnification     50k–1M
 *   voltage           100–200 kV
 *   pressure          1e-5–1e-7 Pa（holds）
 *   drift             0.1–0.5 nm/min
 *   tilt              30–40° 双倾
 *   brightness        1e5–1e6 A/(cm²·sr)（LaB₆）
 *   energySpread      1–2 eV
 *   cs / cc           1–2 mm
 *   spatialResolution 5–40 nm（EDX，电子在薄片里的扩展）
 *   detectionLimit    0.1–1 wt%（EDX）
 *   energyResolution  120–150 eV（EDX）
 *   detectorPixels    2048²、像元 10–15 µm
 *   sampleThickness   20–100 nm
 */
export const TEM: Item = {
  id: 'plant/tem',
  name: '透射电镜',
  unit: '台',
  category: 'machine',
  holds: [{ param: 'pressure', min: 1e-7, max: 1e-5 }],
  props: [
    { param: 'measure/pointResolution', kind: 'range', min: 0.2, max: 0.5, unit: 'nm', dir: 'atMost' },
    { param: 'measure/latticeResolution', kind: 'range', min: 0.14, max: 0.3, unit: 'nm', dir: 'atMost' },
    { param: 'measure/magnification', kind: 'range', min: 50_000, max: 1_000_000, unit: '倍' },
    { param: 'measure/voltage', kind: 'range', min: 100, max: 200, unit: 'kV' },
    { param: 'measure/drift', kind: 'range', min: 0.1, max: 0.5, unit: 'nm/min', dir: 'atMost' },
    { param: 'tilt', kind: 'range', min: 30, max: 40, unit: '°' },
    { param: 'brightness', kind: 'range', min: 1e5, max: 1e6, unit: 'A/(cm²·sr)', dir: 'atLeast' },
    { param: 'energySpread', kind: 'range', min: 1, max: 2, unit: 'eV', dir: 'atMost' },
    { param: 'cs', kind: 'range', min: 1, max: 2, unit: 'mm' },
    { param: 'cc', kind: 'range', min: 1, max: 2, unit: 'mm' },
    { param: 'measure/spatialResolution', kind: 'range', min: 5, max: 40, unit: 'nm', dir: 'atMost' },
    { param: 'measure/detectionLimit', kind: 'range', min: 0.1, max: 1, unit: 'wt%', dir: 'atMost' },
    { param: 'measure/energyResolution', kind: 'range', min: 120, max: 150, unit: 'eV', dir: 'atMost' },
    { param: 'detectorPixels', kind: 'range', min: 2048, max: 2048, unit: 'px' },
    { param: 'pixelSize', kind: 'range', min: 10, max: 15, unit: 'µm' },
    { param: 'sampleThickness', kind: 'range', min: 20, max: 100, unit: 'nm' },
  ],
  composedOf: [
    { item: 'plant/tem/gun', qty: q(1) },
    { item: 'plant/tem/accelerator', qty: q(1) },
    { item: 'plant/tem/hv-supply', qty: q(1) },
    { item: 'plant/tem/column', qty: q(1) },
    { item: 'plant/tem/objective-lens', qty: q(1) },
    { item: 'plant/tem/lens-stack', qty: q(1) },
    { item: 'plant/tem/stage', qty: q(1) },
    { item: 'plant/tem/detector', qty: q(1) },
    { item: 'plant/tem/edx-detector', qty: q(1) },
    { item: 'plant/tem/isolation', qty: q(1) },
  ],
};

export const TEM_ITEMS: readonly Item[] = [...TEM_PARTS, TEM];

// ═══════════════════════════════════════════════════════════════════════════
// 二、十条零件路线
// ═══════════════════════════════════════════════════════════════════════════

export const TEM_ROUTES: readonly Route[] = [
  {
    /**
     * **LaB₆ 阴极：La₂O₃ + 硼砂 + 碳 → 电弧炉 1 900–2 000 °C → 浸出 → 烧结 → 磨尖。**
     *
     *   La₂O₃ 20 g + 硼砂 20 g + 碳 5 g + 钨粉 2 g + 钼粉 1 g + 钢 50 g
     *   → 电子枪 1 件
     *
     * 反应：La₂O₃ + 3B₂O₃ + 15C → 2LaB₆ + 15CO（总量按 B 过量 10 %）。
     * 1 900–2 000 °C 只有电弧炉到得了；产物磨到 φ1×10、尖端 R 0.5–1 µm。
     */
    id: 'make/tem-gun',
    name: '透射电镜电子枪制造',
    produces: [
      {
        item: 'plant/tem/gun',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 100, max: 200 },
          { param: 'brightness', kind: 'range', min: 5e5, max: 1e6 },
          { param: 'lifetime', kind: 'range', min: 1000, max: 2000 },
          { param: 'energySpread', kind: 'range', min: 1.2, max: 2 },
          { param: 'workFunction', kind: 'range', min: 2.5, max: 2.7 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/lanthanum-oxide', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/borax', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/molybdenum-powder', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    rate: { hours: q(40) },
    steps: [
      {
        note_zh:
          '① 混料：La₂O₃ 20 g + 硼砂 20 g + 碳 5 g，球磨 2 h；B 过量 10 % 补蒸发',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '② 电弧炉 1 900–2 000 °C、2 h：La₂O₃ + 3B₂O₃ + 15C → 2LaB₆ + 15CO',
        performedBy: 'plant/arc-furnace',
        under: [{ param: 'temperature', min: 1900, max: 2000 }],
      },
      { note_zh: '③ 破碎、盐酸浸出 30 min 去渣、水洗到 pH 6–7、烘干', performedBy: 'plant/robot' },
      {
        note_zh: '④ 1 900–2 000 °C 烧结 1 h 成 φ10 棒；线切割 φ1×10，磨尖端 R 0.5–1 µm',
        performedBy: 'plant/arc-furnace',
        under: [{ param: 'temperature', min: 1900, max: 2000 }],
      },
      {
        note_zh: '⑤ 装钨 Wehnelt/钼阳极，测亮度 5×10⁵–1×10⁶ A/(cm²·sr) 与寿命 1 000–2 000 h',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** **加速管：氧化铝/石英管 + 10–20 级分压电极 + 高压引线。** */
    id: 'make/tem-accelerator',
    name: '透射电镜加速管制造',
    produces: [
      {
        item: 'plant/tem/accelerator',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 100, max: 200 },
          { param: 'stability', kind: 'range', min: 1e-6, max: 1e-6 },
          { param: 'ripple', kind: 'range', min: 0.2, max: 1 },
          { param: 'length', kind: 'range', min: 300, max: 300 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/alumina', qty: q(2) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    rate: { hours: q(30) },
    steps: [
      { note_zh: '① 磨 φ20/φ14×300 氧化铝管，端面平行 0.02 mm；沿面爬电 ≥20 mm/10 kV', performedBy: 'plant/grinder' },
      { note_zh: '② 装 10–20 级铜分压环与高压引线，每级 10–20 kV', performedBy: 'plant/robot' },
      {
        note_zh: '③ 真空检漏 + 200 kV 耐压 10 min（局放 ≤5 pC）；稳定度 1e-6、纹波 <1 ppm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** **高压电源：变压器 + 10 只整流管倍压 + 20 只薄膜电容 + 油绝缘。** */
    id: 'make/tem-hv-supply',
    name: '透射电镜高压电源制造',
    produces: [
      {
        item: 'plant/tem/hv-supply',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 100, max: 200 },
          { param: 'stability', kind: 'range', min: 1e-6, max: 1e-6 },
          { param: 'ripple', kind: 'range', min: 0.2, max: 1 },
          { param: 'power', kind: 'range', min: 200, max: 500 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/hv-rectifier-general', qty: q(10) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(20) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(2) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(5) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(3) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(60) },
    steps: [
      { note_zh: '① 绕高压变压器（φ0.5 mm 铜线、分段绕、层间绝缘），油浸', performedBy: 'plant/winder' },
      { note_zh: '② 10 只整流管串成倍压柱，20 只薄膜电容滤波；100 MΩ 水阻限流', performedBy: 'plant/robot' },
      { note_zh: '③ 200 kV 老化 8 h；稳定度 1e-6（0.2 V@200 kV）、纹波 <1 ppm', performedBy: 'plant/hv-test-bench' },
    ],
  },

  {
    /** **镜筒：不锈钢真空壳 + 3–5 级光阑 + 观察窗 + 漏率 ≤1e-8 Pa·L/s。** */
    id: 'make/tem-column',
    name: '透射电镜镜筒制造',
    produces: [
      {
        item: 'plant/tem/column',
        qty: q(1),
        gives: [
          { param: 'pressure', kind: 'range', min: 1e-7, max: 1e-6 },
          { param: 'apertures', kind: 'range', min: 3, max: 5 },
          { param: 'leakRate', kind: 'range', min: 0, max: 5e-9 },
          { param: 'height', kind: 'range', min: 900, max: 1100 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    rate: { hours: q(80) },
    steps: [
      { note_zh: '① 卷焊 φ120×1 000 不锈钢筒，法兰面平行 0.05 mm', performedBy: 'plant/sheet-shop' },
      { note_zh: '② 车 3–5 级光阑座与观察窗，装铜密封圈（不用橡胶）', performedBy: 'lathe' },
      { note_zh: '③ 装涡轮/离子泵接口、烘烤 120 °C×24 h', performedBy: 'plant/robot' },
      {
        note_zh: '④ 抽到 1e-7–1e-6 Pa，漏率 ≤5e-9 Pa·L/s（压升法，24 h）',
        performedBy: 'plant/euv-vacuum',
        under: [{ param: 'pressure', min: 1e-7, max: 1e-5 }],
      },
    ],
  },

  {
    /** **物镜：纯铁极靴 → 车/磨 → 退火 → 绕线圈 → 测 C_s/C_c。** */
    id: 'make/tem-objective-lens',
    name: '透射电镜物镜制造',
    produces: [
      {
        item: 'plant/tem/objective-lens',
        qty: q(1),
        gives: [
          { param: 'cs', kind: 'range', min: 1.2, max: 2 },
          { param: 'cc', kind: 'range', min: 1.2, max: 2 },
          { param: 'poleGap', kind: 'range', min: 6, max: 10 },
          { param: 'bore', kind: 'range', min: 3, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron', qty: q(20) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(5) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(3) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(50) },
    steps: [
      { note_zh: '① 车纯铁极靴（2N 铁），间隙 6–10 mm、孔 3–5 mm', performedBy: 'lathe' },
      { note_zh: '② 磨极靴端面，平行 0.01 mm；1 050 °C 退火 4 h 去应力', performedBy: 'plant/grinder' },
      { note_zh: '③ 绕 5 kg 铜线线圈、装水冷，测 C_s 1.2–2 mm / C_c 1.2–2 mm', performedBy: 'plant/winder' },
      {
        note_zh: '④ 装极靴与线圈，用已知周期标准片测 C_s/C_c；同轴度 0.05 mm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** **中间镜/投影镜组：2–3 级磁透镜 + 50k–1M 放大 + 畸变校正。** */
    id: 'make/tem-lens-stack',
    name: '中间镜 + 投影镜组制造',
    produces: [
      {
        item: 'plant/tem/lens-stack',
        qty: q(1),
        gives: [
          { param: 'magnification', kind: 'range', min: 100_000, max: 1_000_000 },
          { param: 'lensCount', kind: 'range', min: 2, max: 3 },
          { param: 'distortion', kind: 'range', min: 2, max: 5 },
          { param: 'alignment', kind: 'range', min: 0.2, max: 0.8 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron', qty: q(10) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(3) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(3) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(40) },
    steps: [
      { note_zh: '① 车 2–3 级透镜壳与极靴，同轴度 0.02 mm', performedBy: 'lathe' },
      { note_zh: '② 绕线圈、装水冷；各级磁场用霍尔片测到 ±1 %', performedBy: 'plant/winder' },
      {
        note_zh: '③ 装中间镜/投影镜，用已知周期标准片校 50k–1M 放大与畸变 2–5 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** **双倾样品台：交叉滚子轴承 + 双轴蜗轮 + 热对称结构。** */
    id: 'make/tem-stage',
    name: '透射电镜样品台制造',
    produces: [
      {
        item: 'plant/tem/stage',
        qty: q(1),
        gives: [
          { param: 'tiltX', kind: 'range', min: 35, max: 40 },
          { param: 'tiltY', kind: 'range', min: 35, max: 40 },
          { param: 'drift', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'travel', kind: 'range', min: 1, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(5) }] },
      { anyOf: [{ item: 'std/bearing-crossed-roller-p5', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(50) },
    steps: [
      { note_zh: '① 铣台体、装交叉滚子轴承，两轴正交 0.02 mm', performedBy: 'plant/milling-machine' },
      { note_zh: '② 磨样品面与轴承座，平面度 0.01 mm', performedBy: 'plant/grinder' },
      { note_zh: '③ 装双轴蜗轮/蜗杆，手轮刻度 0.1°', performedBy: 'lathe' },
      {
        note_zh: '④ 测双倾 ±35–40°、漂移 0.2–0.5 nm/min（电容测微计，10 min）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** **成像探测器：P43 荧光屏 + 光纤面板 + 2048² CCD。** */
    id: 'make/tem-detector',
    name: '透射电镜成像探测器制造',
    produces: [
      {
        item: 'plant/tem/detector',
        qty: q(1),
        gives: [
          { param: 'pixels', kind: 'range', min: 2048, max: 2048 },
          { param: 'pixelSize', kind: 'range', min: 10, max: 15 },
          { param: 'quantumEfficiency', kind: 'range', min: 0.3, max: 0.6 },
          { param: 'readout', kind: 'range', min: 2, max: 10 },
          { param: 'dynamicRange', kind: 'range', min: 14, max: 16 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/zns-ag-phosphor', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    rate: { hours: q(40) },
    steps: [
      {
        note_zh: '① 沉降 P43 荧光屏 8 µm 到光纤面板，铝化 40 nm（挡光、导电荷）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.1 }],
      },
      { note_zh: '② 光纤面板 1:1 耦合 2048² CCD（像元 10–15 µm），装半导体制冷', performedBy: 'plant/robot' },
      {
        note_zh: '③ 测 QE 0.3–0.6、读出 2–10 fps、动态范围 14–16 bit；暗电流 ≤1 e-/px/s',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** **EDX：硅漂移探测器 + 薄窗 + 场效应管前放。** */
    id: 'make/tem-edx-detector',
    name: 'EDX 探测器制造',
    produces: [
      {
        item: 'plant/tem/edx-detector',
        qty: q(1),
        gives: [
          { param: 'spatialResolution', kind: 'range', min: 10, max: 40 },
          { param: 'detectionLimit', kind: 'range', min: 0.2, max: 1 },
          { param: 'energyResolution', kind: 'range', min: 130, max: 150 },
          { param: 'solidAngle', kind: 'range', min: 0.2, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    rate: { hours: q(30) },
    steps: [
      {
        note_zh: '① 硅片 P 注入 10 keV、1e13 cm⁻² 做 SDD 结',
        performedBy: 'plant/ion-implanter',
        under: [{ param: 'energy', min: 5, max: 15 }],
      },
      {
        note_zh: '② 950 °C/30 min 退火（电阻炉，不用 RTA：RTA 在本层被 pyrometer 卡住），蒸铝电极与薄窗（Be 不做，用 8 µm 铝化聚酰亚胺）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 900, max: 1000 }],
      },
      {
        note_zh: '③ 装场效应管前放与 0.2–0.5 sr 准直器；能量分辨 130–150 eV（Mn Kα）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /** **隔振/屏蔽基座：100 kg 铸铁 + 矿棉 + 铜涡流阻尼 + 坡莫合金屏蔽。** */
    id: 'make/tem-isolation',
    name: '隔振/电磁屏蔽基座制造',
    produces: [
      {
        item: 'plant/tem/isolation',
        qty: q(1),
        gives: [
          { param: 'vibration', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'magnetic', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'isolation', kind: 'range', min: 5, max: 10 },
          { param: 'shielding', kind: 'range', min: 100, max: 120 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(100) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(5) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(80) },
    steps: [
      {
        note_zh: '① 浇 800×600×150 HT250 基座（100 kg，1 300–1 450 °C），时效 7 天',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1300, max: 1450 }],
      },
      { note_zh: '② 铣/磨安装面；装矿棉、铜涡流阻尼与三点弹簧', performedBy: 'plant/milling-machine' },
      {
        note_zh: '③ 装铜网/坡莫合金屏蔽；测振动 0.05–0.1 µm/s、磁场 0.05–0.1 nT',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...TEM_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/tem',
    name: '透射电镜装配',
    produces: [{
      item: 'plant/tem',
      qty: q(1),
      gives: [
      { param: 'measure/pointResolution', kind: 'range', min: 0.2, max: 0.5, dir: 'atMost', record: 'mat/tem-image-record' },
      { param: 'measure/latticeResolution', kind: 'range', min: 0.14, max: 0.3, dir: 'atMost', record: 'mat/tem-image-record' },
      { param: 'measure/magnification', kind: 'range', min: 50000, max: 1000000, record: 'mat/tem-image-record' },
      { param: 'measure/voltage', kind: 'range', min: 100, max: 200, record: 'mat/tem-image-record' },
      { param: 'measure/drift', kind: 'range', min: 0.1, max: 0.5, dir: 'atMost', record: 'mat/tem-image-record' },
      { param: 'tilt', kind: 'range', min: 30, max: 40 },
      { param: 'brightness', kind: 'range', min: 100000, max: 1000000, dir: 'atLeast' },
      { param: 'energySpread', kind: 'range', min: 1, max: 2, dir: 'atMost' },
      { param: 'cs', kind: 'range', min: 1, max: 2 },
      { param: 'cc', kind: 'range', min: 1, max: 2 },
      { param: 'measure/spatialResolution', kind: 'range', min: 5, max: 40, dir: 'atMost', record: 'mat/tem-edx-record' },
      { param: 'measure/detectionLimit', kind: 'range', min: 0.1, max: 1, dir: 'atMost', record: 'mat/tem-edx-record' },
      { param: 'measure/energyResolution', kind: 'range', min: 120, max: 150, dir: 'atMost', record: 'mat/tem-edx-record' },
      { param: 'detectorPixels', kind: 'range', min: 2048, max: 2048 },
      { param: 'pixelSize', kind: 'range', min: 10, max: 15 },
      { param: 'sampleThickness', kind: 'range', min: 20, max: 100, record: 'mat/tem-image-record' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...TEM_ROUTES, ...ASSEMBLY_ROUTES];
