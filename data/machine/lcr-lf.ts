/**
 * 缺口总表上最便宜的两项 —— LCR 低频档与 OES 870 nm 窄线源。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么两个仪器挤在一个文件里
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 任务只给两个新文件名额：`data/machine/lcr-lf.ts`（本文件）与
 * `data/measure/oes-cal.ts`。R13 两个方向都守：
 *   · 本文件只有 `Item` + `Route`，**没有** `measure/*` 路线、**没有** `*-record` 条目；
 *   · OES 的测量路线与记录全部在 `data/measure/oes-cal.ts`。
 * 所以机器文件里放两条仪器链：A. LCR 低频档；B. OES 870 nm 窄线源（含 GaAs/AlGaAs
 * 外延与芯片的整条制造链）。导出仍是两组：`LCR_LF_ITEMS` / `LCR_LF_ROUTES`。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 数字口径
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * **全部是设计值（Earth 工程值）**，没有一条是实测。`gives` 是设计窗口；
 * 实测记录只在 `data/measure/oes-cal.ts`（OES 那一半）与将来的 `measure/lcr-lf`
 * （本文件这一半还没有测量路线，按 B 类记）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * A. LCR 低频档 10 Hz–1 kHz（缺口总表 10²×）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 现有 `make/cmos-test-lcr-meter` 交 1 kHz–1 MHz、1 pF–1 nF、0.3–3 %，
 * 差的是 1 kHz 以下这 100 倍。**不能给那台 C-V 桥加一级分频**：
 *
 *   桥的比率臂是 1:1 空气芯变压器 + 检流计零位，只平衡电容。变压器要
 *   ωL ≫ 桥臂阻抗（1 kΩ 量级）才有电压传递；10 Hz 时 ωL = 62.8·L，
 *   要 L > 16 H —— 空气芯 1 mH 在 10 Hz 只有 0.063 Ω，等于把桥臂短路。
 *   低频铁氧体（MnZn，µi 1000–5000）本层做不了（`chip-passives.ts` §八）。
 *   所以 10 Hz–1 kHz 是**另一台表**：正弦激励 + I/V 变换 + 锁相检测（I-V 法），
 *   不是给旧桥改频。
 *
 * 四个盒子，一条链：
 *
 *   `plant/lcr-oscillator-lf`  10 Hz–1 kHz 正交正弦源（状态变量，RC 0.05–0.1 %）
 *       ↓ 激励
 *   `plant/lcr-meter-lf`       4 端屏蔽夹具 + 量程电阻/分压 + 1 µF 标准（表头）
 *       ↓ 电流
 *   `plant/lockin-lf`          1 Hz–1 kHz 双相锁相，低噪声电压前端，TC 0.1–30 s
 *       ↓ 参考
 *   `plant/lcr-divider-lf`     100 kHz 石英 ÷10/÷100/÷1000/÷10⁴ = 10/100/1 k/10 kHz
 *
 * ⚠️ 任务书写的是“现有 1 MHz 主振 ÷1000”。数据里没有可分的 1 MHz 主振：
 *    1 MHz 是 `plant/rf-13m56` 换槽路给的 **±5 %**（`probe-station.ts:325`），
 *    ÷1000 只能得到 ±5 %，不是 0.05 %。可分的源是 100 kHz 石英（10⁻⁵，
 *    `std/quartz-resonator-general`，`make/quartz-resonator` 交 32–1000 kHz）。
 *    所以分频链按 100 kHz 石英写；这样 10/100/1 k/10 kHz 四个锚点的相对误差
 *    是 1e-5 量级，比振荡器的 0.05 % 高 3 个量级，够当标尺。
 *
 * 交付（设计值）：频率 10 Hz–1 kHz、电容 1 pF–1 µF、tanδ 1e-3–1、
 * 准确度 0.5–2 %（1 pF 端 2 %、10 pF–100 nF 0.5–1 %、0.1–1 µF 1–2 %）。
 *
 * 数（§A1–A4 的账）：
 *   1 pF @ 10 Hz = 1/(2π·10·1e-12) = **15.9 GΩ**；1 V 激励 = **63 pA**。
 *     表头的 I/V 级用 1 GΩ 反馈：63 pA → 63 mV；缓冲器偏置 1 pA 在 1 GΩ 上
 *     是 1 mV（1.6 %），正反两次激励相减后 <0.016 %。
 *   1 µF @ 10 Hz = **15.9 kΩ**；0.1 V 激励 = 6.3 mA，100 Ω 反馈上 0.63 V。
 *   1 µF @ 1 kHz = **159 Ω**；0.01 V 激励 = 63 µA，1 kΩ 反馈上 63 mV。
 *   tanδ 1e-3 = 90° − φ 的 **0.0573°**；锁相相位分辨 0.01°、通道失配 0.02°
 *     ⇒ 1e-3 端余量 2–3 倍，再往下不保。
 * ═══════════════════════════════════════════════════════════════════════════
 * B. OES 870 nm 窄线源（缺口总表“无量化，一台源”）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 缺口：`measure/oes-wavelength` 只校 589 nm 的钠 D 双线；870 nm 靠光栅方程外推。
 * 要证明 870 nm，需要一条 870 nm 的**已知窄线**。本层没有 He-Ne（缺氦）、
 * 没有 870 nm 的原子线、`plant/ir-endpoint` 的 870±10 nm 是 20 nm 带宽的灯，
 * 不是线。⇒ 按 R6 造：**GaAs/AlGaAs 双异质结 870 nm 激光二极管 + 光栅外腔**。
 *
 * 为什么是外腔而不是 DFB：DFB 要在有源层上刻 248 nm 周期的二级光栅，
 * 全息曝光要 79.6° 的掠入射（488 nm）或 22.9°（193 nm ArF），本层没有
 * 全息曝光台；而 `plant/refractometer/oes-grating` 已经在，1200 线/mm、
 * 870 nm 一级效率 5–15 %（弱闪耀设计值；22° 入射取低端），正好做 Littman–Metcalf 外腔：
 *
 *   增益芯片（一端 HR ≥97 %、一端 AR ≤1 %）→ 准直 f = 15 mm（φ20 平凸）
 *     → 光栅固定 α = 22.00°、β = 42.02°（sin22 + sin42.02 = 1.044 = 870/833.333）
 *     → 调谐镜把一级衍射原路送回，双程选模
 *
 *   束宽 10.8 mm ⇒ N = 10.8 mm × 1200 线/mm = 12960，双程 **25920**
 *   ⇒ 光栅通带 λ/N = 870/25920 = **0.0336 nm** < 0.1 nm ✓
 *   调谐：100 mm 正弦杆 + 1 µm 读数的测微头，δβ = 2 × 10 µrad
 *   ⇒ δλ = d·cosβ·2δβ = 833.333 × 0.743 × 2×10⁻⁵ = **0.0124 nm/µm**
 *   绝对波长：λ = d(sinα + sinβ)
 *     d 的刻划误差 ±0.05 nm ⇒ 0.052 nm；α 装调 ±0.01° ⇒ 0.135 nm；
 *     β 由正弦杆读 ±0.1 mrad ⇒ 0.062 nm；RSS = **0.157 nm** ⇒ 标 ±0.2 nm ✓
 *
 * ⚠️ 线宽 ≤0.1 nm 是**设计值**：0.0336 nm 是光栅通带，实际还受芯片残余
 *    FP 模（AR 后 <1 %）与电流噪声影响。`data/measure/oes-cal.ts` 的谱仪
 *    分辨率只有 0.2–0.5 nm，只能给“≤0.15 nm”的**上限**，证不到 0.1 以下 ——
 *    要证 0.1 以下得再加一台扫描 F-P（本文件不假装有）。
 *
 * GaAs/AlGaAs 链（全部本层已有或本文件补）：
 *   Ga/As  `mat/gallium` `mat/arsenic`（`ingaas.ts` 已有路线）
 *   TMAl   `mat/trimethyl-aluminium` ← AlCl₃ + CH₃Cl + Mg（同 TMGa 的格氏路）
 *   GaAs 单晶  VGF：密封石英安瓿，1250–1260 °C，0.5–1 °C/h 降温（`plant/high-temp-furnace`）
 *   衬底   2 英寸、350–500 µm、EPD ≤1e5（线锯/磨/CMP，全在）
 *   外延   MOCVD 680–700 °C、6–14 kPa（`plant/mocvd-reactor`，窗口上沿）
 *   芯片   100 µm 条宽、750 µm 腔长、HR/AR 介质膜（`plant/evaporator`）
 *
 * ⚠️ 三处降级照实写：
 *   ① MOCVD 的窗口是 500–700 °C，AlGaAs 在 700 °C 是下限（工业 700–800），
 *      碳沾污高、阈值电流比工业高 20–50 %；
 *   ② 没有两区 HB 炉：VGF 的梯度靠炉口自然梯度（10–20 °C/cm），EPD 只能到
 *      1e5–1e6（商用 VGF 1e4）；本文件按 1e5 写设计值，是**乐观端**；
 *   ③ 没有 TEC（Bi₂Te₃ 两条金属链都没有）：温控是铜块 + 镍铬丝加热 +
 *      T 型热电偶 + PID，±0.5 K；870 nm 的调谐系数 0.06–0.08 nm/K，
 *      ±0.5 K 给 ±0.04 nm，够。**不是恒温 0.01 K 的商用外腔**。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// A. LCR 低频档 —— 条目
// ═══════════════════════════════════════════════════════════════════════════

const LCR_ITEMS: readonly Item[] = [
  /**
   * **10 Hz–1 kHz 正交正弦振荡器（状态变量型）。**
   *
   * 为什么正交：锁相要 0°/90° 两路参考。文氏桥只给一路正弦，还要另做
   * 90° 移相网络（RC 移相在 10 Hz–1 kHz 三个 decade 里的相位误差 ±1–3°，
   * 直接把 tanδ 1e-3 吃掉）；状态变量拓扑的两个积分器输出天然差 90°，
   * 相位误差是两只电容的匹配（0.1 % ⇒ 0.06°）。
   *
   * 频率：f = 1/(2πRC)，两档 —— 10–100 Hz（C = 1 µF）、100–1000 Hz（C = 0.1 µF），
   * R = 1.59–15.9 kΩ 十进位。0.05 % 的准确度不是靠 RC 绝对值（0.1 % 电阻 +
   * 0.1 % 薄膜电容 = 0.2 %），是靠**组装时与 `plant/lcr-divider-lf` 的
   * 10/100/1000 Hz 锚点比对后修 R**：把两路相加看拍频，Δf/f < 0.05 %
   * （10 Hz 档 <5 mHz、1 kHz 档 <0.5 Hz）才收 —— 100 s 里数包络过零。
   *
   * 失真 0.05–0.2 %：状态变量的幅度稳定环（热敏电阻/二极管整流）在
   * 1 Vrms 输出时把增益压到 0.1 % 量级；再低要靠 AGC，本层不做。
   *
   * ⚠️ **它不维持温度**（`holds` 空）：19–21 °C 由 `plant/metrology-room`
   * 给，否则“造它要 19–21、它又提供 19–21”会形成 `condition_cycle`。
   */
  {
    id: 'plant/lcr-oscillator-lf',
    name: '10 Hz–1 kHz 正交正弦振荡器',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'frequencyMin', kind: 'range', min: 10, max: 10, unit: 'Hz' },
      { param: 'frequencyMax', kind: 'range', min: 1000, max: 1000, unit: 'Hz' },
      { param: 'frequencyAccuracy', kind: 'range', min: 0.05, max: 0.1, unit: '%', dir: 'atMost' },
      { param: 'distortion', kind: 'range', min: 0.05, max: 0.2, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 正交振荡器板。两片运放（一片双运放做两个积分器 + 一片做比较/稳幅）、
   * 六只 0.1 % 薄膜电容（两个十进位 × 两只配对的积分电容 + 两只稳幅）、
   * 十二只 0.1 % 金属膜电阻。
   *
   * 布局：两块积分器对称、地平面整片、输出串 50 Ω；10 Hz 档的 1 µF 电容
   * 是聚丙烯薄膜（介质吸收 <0.01 %），不是电解。
   */
  { id: 'plant/lcr-oscillator-lf/board', name: '正交振荡器板', unit: '件', category: 'part' },

  /**
   * **10 Hz–1 kHz 分频链。100 kHz 石英 ÷10/÷100/÷1000/÷10⁴。**
   *
   * 输出 10 kHz / 1 kHz / 100 Hz / 10 Hz 四个方波锚点，相对误差 = 石英的
   * 10⁻⁵ + 分频的 0 误差（十进制计数器每级反馈复位，占空比误差不累积到频率）。
   *
   * 为什么不是“1 MHz ÷1000”：1 MHz 在本层是 `plant/rf-13m56` 换槽路的
   * ±5 %，分频不改善准确度；100 kHz 石英才是 10⁻⁵ 的源。
   *
   * 它同时给锁相当参考（10 Hz–1 kHz 方波），给振荡器当比对锚点，
   * 给表头当频率读数 —— 一台三用。
   */
  {
    id: 'plant/lcr-divider-lf',
    name: '10 Hz–1 kHz 分频链',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'inputFrequency', kind: 'range', min: 100, max: 100, unit: 'kHz' },
      { param: 'outputMin', kind: 'range', min: 10, max: 10, unit: 'Hz' },
      { param: 'outputMax', kind: 'range', min: 10000, max: 10000, unit: 'Hz' },
      { param: 'accuracy', kind: 'range', min: 0.001, max: 0.01, unit: '%', dir: 'atMost' },
    ],
  },

  /** 分频板。4 片 4 位计数片串成 4 个十进制级（反馈复位）+ 2 片逻辑片做门控。 */
  { id: 'plant/lcr-divider-lf/board', name: '分频板', unit: '件', category: 'part' },

  /**
   * **1 Hz–1 kHz 双相锁相放大器。**
   *
   * 前端是低噪声差分电压放大：输入 1 mV–3 V、阻抗 1 MΩ、增益 1/10/100。
   * 真正的低电流前端不在锁相里，在表头的 I/V 级（1 GΩ 反馈 + 筛选 MOS 缓冲）——
   * 锁相只处理已经变成电压的信号，这样 1 pF 的 63 pA 与 1 µF 的 63 µA 都落在
   * 同一组输入窗口里。
   *
   * 解调：参考由 `plant/lcr-divider-lf` 的方波给，0°/90° 是数字分频出来的
   * 精确正交（不是 RC 移相），开关乘法器 + 两级 RC 低通，TC 0.1/1/10/30 s 四档。
   * 读数：20 位双积分 ADC（10 Hz 采样，25 MHz 时钟，2²⁰ 计数 ≈ 1e6，
   * 24 Hz 转换一次）；相位 = atan2(Q, I)，分辨 0.01°。
   *
   * 噪声：前端 20 nV/√Hz，TC 30 s 的 ENBW = 1/(4×30) = 0.0083 Hz ⇒ 1.8 nV；
   * 对 63 mV 的信号是 3e-8，实际由 1/f 与增益漂移定（0.1 % 量级）。
   */
  {
    id: 'plant/lockin-lf',
    name: '1 Hz–1 kHz 双相锁相放大器',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'frequencyMin', kind: 'range', min: 1, max: 1, unit: 'Hz' },
      { param: 'frequencyMax', kind: 'range', min: 1000, max: 1000, unit: 'Hz' },
      { param: 'timeConstantMin', kind: 'range', min: 0.1, max: 0.1, unit: 's' },
      { param: 'timeConstantMax', kind: 'range', min: 30, max: 30, unit: 's' },
      { param: 'phaseResolution', kind: 'range', min: 0.01, max: 0.05, unit: '°', dir: 'atMost' },
    ],
  },

  /**
   * 锁相前端。低噪声差分电压放大（增益 1/10/100）+ 抗混叠 + 屏蔽。
   *
   * 1 MΩ 输入、偏置 <1 nA —— 它读的是表头 I/V 级送来的 0.1–3 V，
   * 源阻抗 ≤1 kΩ，所以不需要 pA 偏置；pA 那一关在
   * `plant/lcr-meter-lf/range-network` 的筛选 MOS 缓冲上。
   */
  { id: 'plant/lockin-lf/front-end', name: '锁相前端', unit: '件', category: 'part' },

  /**
   * 锁相解调板。两路开关乘法器（0°/90°）+ RC 低通 + 20 位双积分 ADC +
   * 25 MHz 石英 + 32 位 CPU + 齐纳基准。
   *
   * 20 位 ADC 的来历：`make/cmos-parameter-analyzer` 的双积分 + 多斜率
   * （ENOB 20–22），这里只取 20 位、采样 10 Hz。25 MHz 石英由
   * `std/quartz-resonator-general` 的 25 MHz 档（`make/quartz-resonator-25mhz`）。
   */
  { id: 'plant/lockin-lf/demodulator', name: '锁相解调板', unit: '件', category: 'part' },

  /**
   * **10 Hz–1 kHz 的 LCR 表头：4 端屏蔽夹具 + 量程网络 + 1 µF 标准。**
   *
   * 它不是一台完整的表，是一只**机头**：正弦源、锁相、分频链是三台独立的
   * 机箱（上面三条），接线后才是完整的表。这样写是因为本层模型里设备不能
   * 被“装进”另一台设备（`machine_consumed`）—— 机头用 `needs` 指名它们。
   *
   * 窗口（设计值）：
   *   频率      10 Hz–1 kHz（连续，振荡器给；锚点由分频链校）
   *   电容      1 pF–1 µF（I/V 反馈 100 Ω–1 GΩ，10:1/100:1 分压）
   *   tanδ      1e-3–1
   *   准确度    1 pF 端 2 %、10 pF–100 nF 0.5–1 %、0.1–1 µF 1–2 %
   *
   * 1 pF 端为什么是 2 %：夹具杂散 0.1–0.5 pF，开路/短路补偿扣到 0.03–0.05 pF；
   * 1 pF 上 0.05 pF 就是 5 %（原始灵敏度），补偿只能扣掉系统部分，留 2 %。
   * 保护环档（`make/lcr-meter-lf-guarded`，`lcr-guard.ts`）把残散压到
   * 0.005–0.01 pF：1 pF 端 0.8–1.2 %、10 pF–100 nF 0.3–0.6 %。两档并存：
   * 旧夹具 0.03–0.05 pF / 2 %，保护环 0.005–0.01 pF / 1 % 级。
   */
  {
    id: 'plant/lcr-meter-lf',
    name: '10 Hz–1 kHz LCR 表',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'frequencyMin', kind: 'range', min: 10, max: 10, unit: 'Hz' },
      { param: 'frequencyMax', kind: 'range', min: 1000, max: 1000, unit: 'Hz' },
      { param: 'measure/frequency', kind: 'range', min: 10, max: 1000, unit: 'Hz' },
      { param: 'measure/capacitance', kind: 'range', min: 1, max: 1e6, unit: 'pF' },
      { param: 'measure/tanDelta', kind: 'range', min: 1e-3, max: 1, unit: '1' },
      // 旧夹具 2 %、保护环 1 %：同一个 id 两个等级，窗口 0.3–2
      { param: 'measure/accuracy', kind: 'range', min: 0.3, max: 2, unit: '%', dir: 'atMost' },
      // 夹具残散：旧 0.03–0.05 pF、保护环 0.005–0.01 pF；1 pF 端误差的主项
      { param: 'strayCapacitance', kind: 'range', min: 0, max: 0.1, unit: 'pF', dir: 'atMost' },
      { param: 'measure/inductance', kind: 'range', min: 1, max: 1e5, unit: 'µH' },
      { param: 'measure/resistance', kind: 'range', min: 1e-3, max: 1e7, unit: 'Ω' },
      { param: 'qFactor', kind: 'range', min: 0.1, max: 100, unit: '1' },
      { param: 'resistanceAccuracy', kind: 'range', min: 0.05, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /** 4 端屏蔽夹具。铜电极 + 保护环 + PTFE 绝缘 + 铝壳；开路残差 ≤0.05 pF。 */
  { id: 'plant/lcr-meter-lf/fixture', name: 'LCR 表四端屏蔽夹具', unit: '件', category: 'part' },

  /**
   * 量程网络。**I/V 级 + 量程电阻 + 分压 + 表头接线。**
   *
   *   I/V 级   筛选 MOS 缓冲（偏置 1 pA）+ 100 Ω–1 GΩ 反馈电阻
   *   量程     1-2-5 八档，100 Ω 到 1 GΩ；10:1/100:1 分压把 1 V 激励降到
   *            0.1 V / 0.01 V，给 1 µF 档
   *   输出     0.1–3 V 给锁相
   *
   * 1 pF @ 10 Hz 的 63 pA 在 1 GΩ 上变 63 mV；1 µF @ 1 kHz 的 63 µA 在 1 kΩ
   * 上也是 63 mV —— 同一台锁相能读。电荷积分那种做法要可切换的 10 pF–10 µF
   * 反馈，1 µF/10 Hz 的 6.3 mA 根本积不下；I/V 电阻分档才是对的拓扑。
   */
  { id: 'plant/lcr-meter-lf/range-network', name: '低频 LCR 表量程网络', unit: '件', category: 'part' },

  /**
   * 1 µF 标准电容。**不是买 0.1 % 的成品**：从 4 只 1 µF 薄膜电容里挑，
   * 100 °C 老化 100 h 后复测，用 100 pF 标准 + 100:1/100:1 两级传递
   * （100 pF × 100 × 100 = 1 µF），挑到 0.1 % 才编号。
   *
   * 100 pF 标准是 `plant/hv-test-bench/standard-capacitor-local`
   * （98–102 pF、0.1–0.5 %）；1 nF 由 100 pF × 10 传递，1 pF 由 100 pF ÷100
   * 传递后扣杂散 —— 所以三档的准确度不同，`accuracy` 写的是整机窗口。
   */
  {
    id: 'plant/lcr-meter-lf/standard-1uf',
    name: '1 µF 标准电容',
    unit: '件',
    category: 'part',
    props: [
      { param: 'capacitance', kind: 'range', min: 0.99, max: 1.01, unit: 'µF' },
      { param: 'tolerance', kind: 'range', min: 0.05, max: 0.2, unit: '%', dir: 'atMost' },
      { param: 'dissipation', kind: 'range', min: 0, max: 1e-3, unit: '1', dir: 'atMost' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// A. LCR 低频档 —— 路线
// ═══════════════════════════════════════════════════════════════════════════

const LCR_ROUTES: readonly Route[] = [
  {
    /**
     * 正交振荡器板：贴片 → 焊接 → 上电测三档。
     *
     *   PCB     `mat/pcb-2layer` 0.02 kg（100 × 80 mm）
     *   运放    2 片 `std/opamp-chip-general`（双运放 ×2 + 比较器/稳幅）
     *   电容    6 只 `std/capacitor-film-general`（0.1 % 聚丙烯，十进位）
     *   电阻    12 只 `std/chip-resistor-general`（0.1 % 金属膜）
     *
     * 测：三档输出频率、失真、正交相位。失真没有谐波分析仪：用 1 kHz 档的
     * 带通（`std/capacitor-film-general` + 电阻）滤掉基波，毫伏表读二次谐波，
     * 只记 0.05–0.2 % 的量级，不报具体谱。
     */
    id: 'make/lcr-oscillator-board',
    name: '正交振荡器板制造',
    produces: [{ item: 'plant/lcr-oscillator-lf/board', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(6) }] },
      { anyOf: [{ item: 'std/chip-resistor-general', qty: q(12) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1, 50) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '贴片与焊接：先装运放与电阻，再装薄膜电容（0.1 % 的电容最后焊，少受一次热循环）', performedBy: 'plant/robot' },
      { note_zh: '上电测三档：10/100/1000 Hz 输出、幅度 1 Vrms、正交相位差 90°±0.1°（用 100 kHz 时基数过零）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(12) },
    unbalanced_zh: '运放 2 + 薄膜电容 6 + 电阻 12 + 双面板 0.02 kg → 板 1 件；产物按件计，余是调试废品与焊锡',
  },

  {
    /**
     * **正交振荡器整机：装板 → 装屏蔽盒 → 与分频链比对修 R。**
     *
     * 比对是这条路线唯一的“精度工序”：
     *   把振荡器输出与 `plant/lcr-divider-lf` 的 10/100/1000 Hz 方波相加，
     *   拍频包络 = |f_osc − f_ref|；Δf/f < 0.05 %（10 Hz 档 <5 mHz、
     *   1 kHz 档 <0.5 Hz）才收，否则换 R 抽头。100 s 里数包络过零，5 mHz
     *   在 100 s 里正好 0.5 个周期，读得出；再短就分不清。
     *   没有示波器：包络用锁相的 I 通道读（TC 1 s），或直接用 `std/dvm-general`
     *   的交流档看拍频幅度 —— 两种都行，路线写前者。
     */
    id: 'make/lcr-oscillator-lf',
    name: '10 Hz–1 kHz 正交正弦振荡器制造',
    produces: [
      {
        item: 'plant/lcr-oscillator-lf',
        qty: q(1),
        gives: [
          { param: 'frequencyMin', kind: 'range', min: 10, max: 10 },
          { param: 'frequencyMax', kind: 'range', min: 1000, max: 1000 },
          { param: 'frequencyAccuracy', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'distortion', kind: 'range', min: 0.05, max: 0.2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/lcr-oscillator-lf/board', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room', 'plant/lcr-divider-lf'],
    steps: [
      { note_zh: '装板进 1 mm 钢板屏蔽盒：PTFE 垫柱、铜编织带单点接地、输出 BNC 穿心电容', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '比对修 R：10/100/1000 Hz 三个锚点，拍频包络 Δf/f <0.05 %（10 Hz 档 <5 mHz、1 kHz 档 <0.5 Hz）；100 s 里数包络过零，三点都过才装面板', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '老化 100 h 后复测三档；漂 >0.02 % 的退回换电容', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(16) },
    unbalanced_zh: '板 1 + 钢板 1 + 铜 0.1 + PTFE 0.01 → 振荡器 1 台；kg 项是机箱/屏蔽/绝缘，产物按台计',
  },

  {
    /**
     * 分频板：4 个十进制级 + 门控。
     *
     *   计数片 4 片 `std/counter-chip-general`（4 位二进制，反馈复位成 ÷10）
     *   逻辑片 2 片 `std/logic-chip-general`（复位门 + 输出缓冲）
     *   石英   1 只 `std/quartz-resonator-general`（100 kHz，X 切 28 µm）
     *   电阻   8 只（反馈与上拉）
     *
     * 100 kHz ÷10 = 10 kHz、÷100 = 1 kHz、÷1000 = 100 Hz、÷10⁴ = 10 Hz。
     */
    id: 'make/lcr-divider-board',
    name: '分频板制造',
    produces: [{ item: 'plant/lcr-divider-lf/board', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/logic-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/quartz-resonator-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/chip-resistor-general', qty: q(8) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1, 50) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '装石英与振荡级：100 kHz 起振（X 切 28 µm，负载电容 20–30 pF）', performedBy: 'plant/robot' },
      { note_zh: '串 4 级十进制：每级 4 位计数 + 反馈复位到 10；逐级量 10 k/1 k/100/10 Hz，占空比不重要、周期要对', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '量短期稳定度：与另一只 100 kHz 石英比对 1000 s，差 <1e-5 才收', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(16) },
    unbalanced_zh: '计数片 4 + 逻辑片 2 + 石英 1 + 电阻 8 + 双面板 0.02 kg → 板 1 件；产物按件计',
  },

  {
    /**
     * **分频链整机。** 装板 + 屏蔽 + 四路输出缓冲，交 10/100/1 k/10 kHz。
     *
     * 准确度 0.001–0.01 %：石英 1e-5（10 ppm）是主项；分频本身不引入
     * 频率误差，只引入相位抖动（<1 µs，对 10 Hz 是 1e-5）。
     */
    id: 'make/lcr-divider-lf',
    name: '10 Hz–1 kHz 分频链制造',
    produces: [
      {
        item: 'plant/lcr-divider-lf',
        qty: q(1),
        gives: [
          { param: 'inputFrequency', kind: 'range', min: 100, max: 100 },
          { param: 'outputMin', kind: 'range', min: 10, max: 10 },
          { param: 'outputMax', kind: 'range', min: 10000, max: 10000 },
          { param: 'accuracy', kind: 'range', min: 0.001, max: 0.01 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/lcr-divider-lf/board', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '装板、装四路 BNC 输出与指示灯；石英不另做恒温，就在 19–21 °C 计量间里（10 ppm 已含 0–40 °C 的温度项）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '验收：四路输出周期各量 100 个，10 k/1 k/100/10 Hz 与 100 kHz/10^n 差 <1e-5', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(8) },
    unbalanced_zh: '板 1 + 钢板 1 + 铜 0.1 + PTFE 0.01 → 分频链 1 台；产物按台计',
  },

  {
    /**
     * 锁相前端：低噪声差分电压放大 + 抗混叠 + 屏蔽。
     *
     *   运放    2 片（一级差分 + 一级增益/缓冲）
     *   电容    2 只薄膜（抗混叠/补偿）
     *   绝缘    PTFE 端子、屏蔽盒接机壳
     *   板      双面板 0.01 kg
     *
     * 输入 1 MΩ、偏置 <1 nA；它读的是表头 I/V 级送来的 0.1–3 V，
     * 源阻抗 ≤1 kΩ，所以 pA 筛选不在这里做（在表头的 I/V 缓冲上）。
     */
    id: 'make/lockin-front-end',
    name: '锁相前端制造',
    produces: [{ item: 'plant/lockin-lf/front-end', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '装差分输入与增益级：1 MΩ 输入、增益 1/10/100、PTFE 端子、屏蔽盒单点接机壳', performedBy: 'plant/robot' },
      { note_zh: '量偏置与输入阻抗：输入端接 1 MΩ，偏置 <1 nA（1 mV 以内）；输入阻抗 1 MΩ ±1 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '量线性：1 mV–3 V、1/10/100 三档各三点，偏差 <0.5 %；两路匹配 <0.01 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(10) },
    unbalanced_zh: '运放 2 + 薄膜电容 2 + PTFE 0.01 + 铜 0.01 + 双面板 0.01 → 前端 1 件；产物按件计',
  },

  {
    /**
     * 锁相解调板：两路开关乘法器 + RC 低通 + 20 位 ADC + 25 MHz 时基 + CPU。
     *
     *   运放    2 片（乘法器/低通）
     *   计数片  3 片（ADC 计数 + 时基分频）
     *   CPU     1 片 `std/cpu-32bit-general`（atan2、显示、量程）
     *   石英    1 只 25 MHz（`make/quartz-resonator-25mhz` 交付 24.5–25.5 MHz）
     *   齐纳    1 只精密基准
     *
     * 20 位 ADC：双积分，25 MHz/2²⁰ ≈ 24 Hz 转换 —— 10 Hz 采样刚好。
     * TC 0.1–30 s 是数字平均（ADC 读数进 CPU 后做一阶 IIR），不是模拟 RC；
     * 模拟 RC 只做抗混叠（10 ms）。
     */
    id: 'make/lockin-demodulator',
    name: '锁相解调板制造',
    produces: [{ item: 'plant/lockin-lf/demodulator', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(3) }] },
      { anyOf: [{ item: 'std/cpu-32bit-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/quartz-resonator-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/zener-reference-precision', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1, 50) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '装 0°/90° 开关乘法器与抗混叠 RC（10 ms）；两路增益匹配到 0.01 %', performedBy: 'plant/robot' },
      { note_zh: '装 20 位双积分 ADC：25 MHz ÷ 2²⁰，满量程 3 V，线性 1e-5；零位与增益用齐纳校', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装 CPU 与 TC：0.1/1/10/30 s 四档 IIR；atan2 查表 16 位，相位分辨 0.01°', performedBy: 'plant/robot' },
      { note_zh: '量相位噪声：同一参考自分频（0°），I/Q 串扰 <0.01°、100 s 漂 <0.02°', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '运放 2 + 计数片 3 + CPU 1 + 石英 1 + 齐纳 1 + 双面板 0.02 → 板 1 件；产物按件计',
  },

  {
    /**
     * **锁相整机。** 前端 + 解调板 + 屏蔽盒 + 参考输入。
     *
     * 相位准确度 0.01–0.05°：分辨 0.01°，通道失配 0.02°，温漂 0.01°/K；
     * 10 Hz–1 kHz 内参考相位由分频链数字给出，不随频率变。
     */
    id: 'make/lockin-lf',
    name: '1 Hz–1 kHz 双相锁相放大器制造',
    produces: [
      {
        item: 'plant/lockin-lf',
        qty: q(1),
        gives: [
          { param: 'frequencyMin', kind: 'range', min: 1, max: 1 },
          { param: 'frequencyMax', kind: 'range', min: 1000, max: 1000 },
          { param: 'timeConstantMin', kind: 'range', min: 0.1, max: 0.1 },
          { param: 'timeConstantMax', kind: 'range', min: 30, max: 30 },
          { param: 'phaseResolution', kind: 'range', min: 0.01, max: 0.05 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/lockin-lf/front-end', qty: q(1) }] },
      { anyOf: [{ item: 'plant/lockin-lf/demodulator', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room', 'plant/lcr-divider-lf'],
    steps: [
      { note_zh: '装前端与解调板进屏蔽盒：模拟地与数字地单点连、参考输入变压器隔离', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '相位校准：参考 10/100/1000 Hz，0° 与 90° 两路各量 5 次，失配 <0.05° 才收', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '量噪声与 TC：输入 1 mV 正弦（源阻抗 1 kΩ），TC 30 s 时噪声 <0.1 %；四档 TC 与理论 1/(4TC) 比 <20 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(16) },
    unbalanced_zh: '前端 1 + 解调板 1 + 钢板 1 + 铜 0.1 + PTFE 0.01 → 锁相 1 台；产物按台计',
  },

  {
    /** 4 端屏蔽夹具：铜电极 + 保护环 + PTFE + 铝壳。车与铣，不镀。 */
    id: 'make/lcr-fixture',
    name: 'LCR 表四端屏蔽夹具制造',
    produces: [{ item: 'plant/lcr-meter-lf/fixture', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车铜电极 φ20 与保护环 φ24（间隙 1 mm）、铣铝壳与 PTFE 座', performedBy: 'lathe' },
      { note_zh: '装夹具：4 端接线（激励高/低、检测高/低），保护环单点接地；开路残差量到 ≤0.05 pF', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(8) },
    unbalanced_zh: '铜 1 + PTFE 0.05 + 氧化铝 0.05 + 铝 0.2 → 夹具 1 件；产物按件计',
  },

  {
    /**
     * 量程网络：I/V 级 + 100 Ω–1 GΩ 电阻 + 10:1/100:1 分压 + 4 只继电器。
     *
     * I/V 级是**筛选 MOS 缓冲 + 1 GΩ 反馈**（偏置 1 pA，同
     * `make/cmos-parameter-analyzer` 的筛选 MOS）：1 pF @ 10 Hz 的 63 pA
     * 在 1 GΩ 上变 63 mV；大电流档换 100 Ω，1 µF @ 1 kHz 的 63 µA 变 6.3 mV，
     * 再靠锁相的 100 倍增益。
     *
     * 电阻全用 0.1 % 金属膜，按 1-2-5 序列取 8 档；分压器用
     * `std/divider-10to1-precision` 与 `std/divider-100to1-precision`
     * （电压基准那套，0.01 % 级）把 1 V 激励降到 0.1 V / 0.01 V，给 1 µF 档。
     */
    id: 'make/lcr-range-network',
    name: '低频 LCR 表量程网络制造',
    produces: [{ item: 'plant/lcr-meter-lf/range-network', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/mos-transistor-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/chip-resistor-general', qty: q(24) }] },
      { anyOf: [{ item: 'std/divider-10to1-precision', qty: q(1) }] },
      { anyOf: [{ item: 'std/divider-100to1-precision', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '装 I/V 级：筛选 MOS 缓冲 + 1 GΩ 反馈 + PTFE 绝缘 + 保护环；偏置逐个测，>2 pA 的退回', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装 1-2-5 八档电阻与两只精密分压；继电器换档，触点镀金', performedBy: 'plant/robot' },
      { note_zh: '量每档阻值：与 100 pF 标准在 1 kHz 上的容抗比，0.1 % 才编号；1 GΩ 档与 10 MΩ 档的比值 100:1 单独核', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(16) },
    unbalanced_zh: '运放 2 + 筛选 MOS 2 + 电阻 24 + 分压 2 + 继电器 4 + PTFE 0.01 + 双面板 0.05 → 网络 1 件；产物按件计',
  },

  {
    /**
     * 1 µF 标准：挑 4 只 → 100 °C 老化 100 h → 用 100 pF 标准两级传递 → 挑 0.1 %。
     *
     * 传递链：100 pF 标准（0.1–0.5 %）→ ×10 到 1 nF（10:1 分压）→ ×10 到 10 nF
     * → ×100 到 1 µF（100:1 分压）。1 µF 上看 100 pF 的 0.5 % 被两级分压的
     * 0.01 % 稀释，主项是 1 µF 自身的介质吸收与老化 —— 老化 100 h 后 24 h 内
     * 复测，漂 <0.02 % 才收。
     */
    id: 'make/lcr-standard-1uf',
    name: '1 µF 标准电容制造',
    produces: [
      {
        item: 'plant/lcr-meter-lf/standard-1uf',
        qty: q(1),
        gives: [
          { param: 'capacitance', kind: 'range', min: 0.995, max: 1.005 },
          { param: 'tolerance', kind: 'range', min: 0.05, max: 0.15 },
          { param: 'dissipation', kind: 'range', min: 2e-4, max: 8e-4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room', 'plant/hv-test-bench/standard-capacitor-local'],
    steps: [
      { note_zh: '装 4 只 1 µF 薄膜电容进铝壳 + PTFE 座，编 4 个号', performedBy: 'plant/robot' },
      { note_zh: '老化：100 °C、100 h（`plant/resistance-furnace` 的下限），随炉冷到 20 °C', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 100, max: 105 }] },
      { note_zh: '两级传递：100 pF ×10 ×10 ×100 到 1 µF；四只里挑 0.1 % 的一只，损耗 <1e-3', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(120) },
    unbalanced_zh: '薄膜电容 4 → 标准 1 件（挑 1，余 3 只降级）；PTFE 0.05 + 铝 0.01；产物按件计',
  },

  {
    /**
     * **LCR 表头整机：夹具 + 量程网络 + 1 µF 标准，接上三台机箱。**
     *
     * 它只交“机头”的窗口；完整窗口要 `plant/lcr-oscillator-lf`、
     * `plant/lockin-lf`、`plant/lcr-divider-lf` 三台在场（`needs`）。
     *
     * 标定三步：
     *   ① 开路/短路：扣夹具残差（开路 0.05 pF、短路 20 nH）；
     *   ② 100 pF 点：接 `plant/hv-test-bench/standard-capacitor-local`，
     *      1 kHz 下量 3 次，差 <0.1 % 才写刻度；
     *   ③ 传递：100 pF → 1 nF → 10 nF → 1 µF（10:1/100:1），1 pF 由 ÷100 反推。
     * 频率点：10 Hz、100 Hz、1 kHz 各一次；10 Hz 上 1 pF 的 15.9 GΩ 用
     * 63 pA 量，正反激励各 30 s（TC 30 s）。
     *
     * ⚠️ 这条路线用 4 端屏蔽夹具（`plant/lcr-meter-lf/fixture`），残散
     * 0.03–0.05 pF，1 pF 端只到 2 %。1 % 级的那一档是第二条路线
     * `make/lcr-meter-lf-guarded`（`lcr-guard.ts`）：保护环夹具，残散
     * 0.005–0.01 pF。给 `plant/lcr-meter-lf` 加 `strayCapacitance` prop 后，
     * 按 `prop_missing_gives` 这条旧路线必须补一行 gives；窗口其余不动。
     */
    id: 'make/lcr-meter-lf',
    name: '10 Hz–1 kHz LCR 表制造',
    produces: [
      {
        item: 'plant/lcr-meter-lf',
        qty: q(1),
        gives: [
          { param: 'frequencyMin', kind: 'range', min: 10, max: 10 },
          { param: 'frequencyMax', kind: 'range', min: 1000, max: 1000 },
          { param: 'measure/frequency', kind: 'range', min: 10, max: 1000 },
          { param: 'measure/capacitance', kind: 'range', min: 1, max: 1e6 },
          { param: 'measure/tanDelta', kind: 'range', min: 1e-3, max: 1 },
          { param: 'measure/accuracy', kind: 'range', min: 0.5, max: 2 },
          // 旧夹具的残散：这是 1 pF 端 2 % 的主项；保护环档见 make/lcr-meter-lf-guarded
          { param: 'strayCapacitance', kind: 'range', min: 0.03, max: 0.05 },
          { param: 'measure/inductance', kind: 'range', min: 1, max: 1e5 },
          { param: 'measure/resistance', kind: 'range', min: 1e-3, max: 1e7 },
          { param: 'qFactor', kind: 'range', min: 0.1, max: 100 },
          { param: 'resistanceAccuracy', kind: 'range', min: 0.1, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/lcr-meter-lf/fixture', qty: q(1) }] },
      { anyOf: [{ item: 'plant/lcr-meter-lf/range-network', qty: q(1) }] },
      { anyOf: [{ item: 'plant/lcr-meter-lf/standard-1uf', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/lcr-oscillator-lf',
      'plant/lockin-lf',
      'plant/lcr-divider-lf',
      'plant/hv-test-bench/standard-capacitor-local',
    ],
    steps: [
      { note_zh: '装机头：夹具、量程网络、1 µF 标准装进同一机箱；三台机箱用同轴电缆接（激励/检测/参考）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '开路/短路补偿：开路 0.05 pF、短路 20 nH；扣到残差 <0.02 pF', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '100 pF 点：`standard-capacitor-local` 在 10/100/1000 Hz 各量 3 次，差 <0.1 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '传递 1 nF/10 nF/1 µF：10:1 与 100:1 两级；1 µF 与 1 µF 标准比，差 <0.2 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '1 pF 端：÷100 反推后扣 0.05 pF 杂散，记 2 %；tanδ 用 1 µF 标准（<1e-3）验相位，1e-3 处 2–3 倍余量', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: 'L/R 扩展：装 `std/inductor-standard` 与 `plant/lcr-resistance-arm`；L 用 1 µH–100 mH 五点（0.5–2 %），R 用 1 mΩ–10 MΩ 七档（0.05–0.5 %），Q 0.1–100', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '夹具 1 + 量程网络 1 + 1 µF 标准 1 + 钢板 1 + 铜 0.1 → 表头 1 台；产物按台计。三台机箱不在 uses 里（设备只进 needs/performedBy），它们的机时记在各自路线',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// B. OES 870 nm 窄线源 —— 条目（含 GaAs/AlGaAs 链）
// ═══════════════════════════════════════════════════════════════════════════

const OES_SOURCE_ITEMS: readonly Item[] = [
  /**
   * 三甲基铝（TMAl，(CH₃)₃Al，4N5 级）。MOCVD 的铝源。
   *
   * 与 TMGa/TMIn 同一条格氏路（`ingaas.ts`）：AlCl₃ + 3 CH₃Cl + 3 Mg →
   * TMAl + 3 MgCl₂，乙醚中 20–60 °C，再低温精馏。TMAl 的蒸气压比 TMGa 高
   * （20 °C 约 10 Torr vs 65 Torr? TMAl 20 °C 约 10–12 Torr，TMGa 约 65 Torr），
   * 鼓泡器温度 20–40 °C；本层按 25 °C、常压载气写。
   *
   * ⚠️ TMAl 在空气里自燃、遇水剧烈水解 —— 与 AsH₃ 同一条毒气/自燃管理；
   * 不另立安全条目，按 `mat/arsine` 的同一套尾气洗涤与手套箱写。
   */
  {
    id: 'mat/trimethyl-aluminium',
    name: '三甲基铝',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 0, max: 0.001, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * GaAs 单晶锭（VGF，垂直梯度凝固）。2 英寸级、n 型 Si 掺杂 1e17–1e18。
   *
   * 本层没有两区 HB 炉，也没有 40 atm 的 GaAs LEC 炉（`plant/inp-crystal-grower`
   * 上限 1150 °C，GaAs 熔点 1238 °C，够不着）。走**密封石英安瓿 + 高温炉
   * 整体缓慢降温**：安瓿里 Ga + As（As 过量 1–2 % 缓冲蒸气压），
   * 1250–1260 °C 均质 2 h，再以 0.5–1 °C/h 降到 1000 °C —— 熔点是 1238 °C，
   * 等温面随炉温下移，晶体从冷端长起。炉口自然梯度 10–20 °C/cm。
   *
   * ⚠️ 降级：商用 VGF 的 EPD 1e4，这里只有 1e5–1e6（设计值取 1e5，乐观端）；
   *    径向温度对称性差，直径 45–55 mm 波动、TTV 靠后续磨抛补。
   */
  {
    id: 'mat/gaas-single-crystal',
    name: 'GaAs 单晶锭',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99.99, max: 99.999, unit: '%', dir: 'atLeast' },
      { param: 'epd', kind: 'range', min: 0, max: 1e6, unit: 'cm⁻²', dir: 'atMost' },
      { param: 'diameter', kind: 'range', min: 45, max: 55, unit: 'mm' },
      { param: 'carrierConcentration', kind: 'range', min: 1e17, max: 2e18, unit: 'cm⁻³' },
    ],
  },

  /**
   * 2 英寸 GaAs 衬底。350–500 µm，(100) 偏 (110) 2°，n⁺ Si 掺杂。
   *
   * 与 InP 衬底同一条线（`make/inp-substrate`）：线锯 → 研磨 → CMP →
   * 清洗/检验。1 kg 锭切 130 片：一片 2 英寸 × 400 µm 重
   * π×(25.4 mm)²×0.4 mm×5.32 g/cm³ = 4.31 g；切缝 0.2 mm 与磨抛损失后
   * 1 kg 交 130 片（与 InP 的 130 片同口径，GaAs 密度更大、片更薄，抵掉）。
   */
  {
    id: 'std/gaas-substrate-2in',
    name: '2 英寸 GaAs 衬底',
    unit: '片',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 50.8, max: 50.8, unit: 'mm' },
      { param: 'thickness', kind: 'range', min: 350, max: 500, unit: 'µm' },
      { param: 'epd', kind: 'range', min: 0, max: 1e5, unit: 'cm⁻²', dir: 'atMost' },
      { param: 'ttv', kind: 'range', min: 0, max: 10, unit: 'µm', dir: 'atMost' },
      { param: 'orientation', kind: 'enum', values: ['(100) 2°→(110)'] },
      { param: 'carrierConcentration', kind: 'range', min: 1e17, max: 1e18, unit: 'cm⁻³' },
    ],
  },

  /**
   * GaAs/AlGaAs 870 nm 双异质结外延片。
   *
   * 结构（从衬底往上）：
   *   n-GaAs 缓冲     0.5 µm   SiH₄ 掺杂 1e18
   *   n-Al₀.₃Ga₀.₇As  1.2 µm   SiH₄ 5e17（包层，Eg 1.80 eV）
   *   GaAs 有源层     0.15 µm  不掺杂（Eg 1.42 eV ⇒ 870 nm）
   *   p-Al₀.₃Ga₀.₇As  1.2 µm  TMGa 碳掺杂 5e17–1e18（低 V/III）
   *   p-GaAs 帽层     0.2 µm   碳掺杂 1e19
   *   总厚 3.25 µm，PL 峰 868–872 nm。
   *
   * p 型为什么用碳不用 Zn：Zn 扩散要 500–600 °C、30–60 min 穿 1.2 µm AlGaAs，
   * 扩散前沿不可控；MOCVD 里把 V/III 降到 5–10、650–700 °C，碳自然进
   * 1e18（AlGaAs 里碳是浅受主，Ea 0.03–0.05 eV）。代价是空穴迁移率低、
   * 串联电阻高 20–40 % —— 对 300 mA 的芯片是 0.1–0.2 V，可接受。
   */
  {
    id: 'std/gaas-epi-870-general',
    name: 'GaAs/AlGaAs 870 nm 双异质结外延片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'plPeak', kind: 'range', min: 860, max: 880, unit: 'nm' },
      { param: 'thickness', kind: 'range', min: 3, max: 4, unit: 'µm' },
      { param: 'uniformity', kind: 'range', min: 0, max: 3, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * **870 nm GaAs/AlGaAs 双异质结激光芯片。**
   *
   * 100 µm 条宽 × 750 µm 腔长 × 100 µm 厚，p 面朝上装在铜 C-mount 上。
   *   波长        865–875 nm（有源层 GaAs 带边，25 °C）
   *   阈值        100–250 mA（Jth 130–330 A/cm²，设计值）
   *   斜率效率    0.5–0.9 W/A
   *   输出        150–400 mW（1 A，未镀膜端面）
   *   端面        HR ≥97 %（4 对 SiO₂/TiO₂）、AR ≤1 %（3 层 TiO₂/SiO₂/TiO₂）
   *
   * AR 面朝外腔光栅；HR 面是后镜。自由运行时是多纵模（腔模间距
   * λ²/(2nL) = 870²/(2×3.6×750000) = 0.14 nm），进外腔后由光栅选模。
   */
  {
    id: 'plant/oes-line-source/laser-chip',
    name: '870 nm 双异质结激光芯片',
    unit: '件',
    category: 'part',
    props: [
      { param: 'wavelength', kind: 'range', min: 865, max: 875, unit: 'nm' },
      { param: 'thresholdCurrent', kind: 'range', min: 50, max: 300, unit: 'mA', dir: 'atMost' },
      { param: 'slopeEfficiency', kind: 'range', min: 0.4, max: 1, unit: 'W/A' },
      { param: 'outputPower', kind: 'range', min: 100, max: 500, unit: 'mW' },
    ],
  },

  /**
   * 准直/输出镜组。两片熔石英平凸透镜：
   *   准直镜   φ20、f = 15 mm、NA 0.5 —— 把 40°（快轴）收到 10.8 mm 束宽
   *   输出镜   φ10、f = 80 mm —— 把光栅零级聚焦到谱仪缝上（80 mm 处 ~100 µm）
   * 装在同一根铝镜筒里，准直镜可轴向调 0–3 mm。
   */
  { id: 'plant/oes-line-source/collimator', name: 'OES 870 准直/输出镜组', unit: '件', category: 'part' },

  /**
   * 光栅台 + 调谐镜。Littman–Metcalf 的两个角：
   *   光栅   固定 α = 22.00°（光栅座与光轴 22° 基块，磨到 0.01°）
   *   调谐镜 φ20 平面镜（λ/10、铝膜 60 nm）装在 100 mm 正弦杆转台上，
   *          测微头 0–25 mm 读 1 µm；镜面把一级衍射原路送回
   *
   * 调谐率：δλ = d·cosβ·2δθ = 833.333×0.743×2×10⁻⁵ = 0.0124 nm/µm；
   * 20 mm 行程覆盖 860–880 nm 有余。
   */
  { id: 'plant/oes-line-source/grating-stage', name: '光栅台', unit: '件', category: 'part' },

  /**
   * 温控座。铜块 30×30×10 mm + 镍丝加热（10 Ω）+ T 型热电偶 + PID。
   *
   * 没有 TEC（Bi₂Te₃ 两条金属链都没有），只能加热不能制冷：底座温度
   * 设在 25–30 °C（高于机箱 3–5 K），靠自然对流散热。±0.5 K。
   * 870 nm 的调谐系数 0.06–0.08 nm/K ⇒ ±0.03–0.04 nm，够。
   */
  { id: 'plant/oes-line-source/thermal-mount', name: 'OES 870 温控座', unit: '件', category: 'part' },

  /** 机箱。300×150×100 mm 铝箱，内壁贴 PTFE 绝缘，前端 φ10 出光窗、后端电气接口。 */
  { id: 'plant/oes-line-source/housing', name: 'OES 870 机箱', unit: '件', category: 'part' },

  /**
   * **OES 870 nm 窄线源（Littman–Metcalf 外腔二极管激光器）。**
   *
   * 交付（设计值）：
   *   波长        860–880 nm 可调；绝对准确度 0.05–0.2 nm（λ = d(sinα+sinβ)）
   *   线宽        ≤0.1 nm（光栅双程通带 0.0336 nm，余量 3 倍）
   *   输出功率    0.5–20 mW（光栅零级，经输出镜）
   *   功率稳定度  0.1–0.5 %/h（恒流 0.1 % + 温控 ±0.5 K）
   *
   * 它给 `measure/oes-wavelength-cal` 当已知线：870 nm 这一点第一次有
   * **绝对波长可算**（光栅节距 + 两个角），不再从 589 nm 外推 281 nm。
   */
  {
    id: 'plant/oes-line-source',
    name: 'OES 870 nm 窄线源',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'wavelength', kind: 'range', min: 860, max: 880, unit: 'nm' },
      { param: 'linewidth', kind: 'range', min: 0, max: 0.1, unit: 'nm', dir: 'atMost' },
      { param: 'outputPower', kind: 'range', min: 0.5, max: 20, unit: 'mW' },
      { param: 'wavelengthAccuracy', kind: 'range', min: 0, max: 0.2, unit: 'nm', dir: 'atMost' },
      { param: 'measure/stability', kind: 'range', min: 0.1, max: 0.5, unit: 'nm' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// B. OES 870 nm 窄线源 —— 路线
// ═══════════════════════════════════════════════════════════════════════════

const OES_SOURCE_ROUTES: readonly Route[] = [
  {
    /**
     * **三甲基铝：AlCl₃ + 3 CH₃Cl + 3 Mg → TMAl + 3 MgCl₂。**
     *
     *   三氯化铝 1849.8 + 甲基氯 2101.2 + 镁 1011.5
     *     → 三甲基铝 1000 + 氯化镁 3962.5
     *
     * 原子量：AlCl₃ 133.341、CH₃Cl 50.488、Mg 24.305、TMAl 72.087、
     * MgCl₂ 95.211；1000 kg TMAl 的配比 1000/72.087 = 13.87 kmol。
     * 与 `make/trimethyl-gallium` 同一条格氏/精馏路，只是把 GaCl₃ 换 AlCl₃。
     */
    id: 'make/trimethyl-aluminium',
    name: '三甲基铝制备',
    produces: [
      {
        item: 'mat/trimethyl-aluminium',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99 },
          { param: 'water', kind: 'range', min: 0, max: 0.001 },
        ],
      },
      {
        item: 'mat/magnesium-chloride',
        qty: q(7925, 2),
        gives: [
          { param: 'purity', kind: 'range', min: 95, max: 98 },
          { param: 'water', kind: 'range', min: 0.5, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium-chloride', qty: q(18498, 10) }] },
      { anyOf: [{ item: 'mat/methyl-chloride', qty: q(10506, 5) }] },
      { anyOf: [{ item: 'mat/magnesium', qty: q(10115, 10) }] },
    ],
    needs: ['mat/diethyl-ether', 'plant/clean-room'],
    steps: [
      {
        note_zh: '格氏/烷基化：20–60 °C、100–300 kPa，乙醚中 Mg + CH₃Cl → CH₃MgCl，再与 AlCl₃ 反应；TMAl 在乙醚里成配合物',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      { note_zh: '过滤 MgCl₂、减压回收乙醚（TMAl 配合物不解离，要加 NaCl 解络）', performedBy: 'plant/robot' },
      {
        note_zh: '低温精馏：40–80 °C、300–800 kPa；TMAl bp 127 °C，切乙醚/低沸物；4N5 是设计值',
        performedBy: 'plant/distillation-tower',
        under: [
          { param: 'temperature', min: 40, max: 80 },
          { param: 'pressure', min: 300, max: 800 },
        ],
      },
      { note_zh: '灌装：不锈钢鼓泡器、氩保护、-20 °C 冷阱；每瓶 0.5–1 kg', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: 'AlCl₃ 1849.8 + CH₃Cl 2101.2 + Mg 1011.5 = 4962.5 kg → TMAl 1000 + MgCl₂ 3962.5 = 4962.5 kg；乙醚循环不按批计',
  },

  {
    /**
     * **GaAs 单晶（VGF）：Ga + As → GaAs 锭。**
     *
     *   镓 0.482 + 砷 0.523 + 硅 0.0001 → 单晶 1 kg
     *
     * 化学计量：Ga 69.723 / GaAs 144.645 = 48.20 %；As 51.80 %。
     * 砷多装 1 %（0.523 而不是 0.518）缓冲安瓿里的砷蒸气压
     * （1238 °C 离解压约 1 atm）。
     *
     * 步骤：
     *   ① 封管  φ30×300 石英管，装料后氩置换，`plant/arc-furnace` 局部
     *          1900–2200 °C 封口（石英软化 1665 °C）；安瓿内 1 atm 氩 + As 蒸气。
     *   ② 凝固   `plant/high-temp-furnace` 1250–1260 °C 均质 2 h；0.5–1 °C/h
     *          降到 1000 °C（260–520 h；熔点 1238 °C 的等温面从冷端向热端走），
     *          再 20 °C/h 到室温。**这是这条路线最贵的地方：一周到三周。**
     *   ③ 取锭  破管、HF/HNO₃ 腐蚀 5–10 µm 去石英沾污与表面损伤；检直径/EPD。
     *
     * 硅掺杂：Si 在 GaAs 里是两性掺杂，n 型区（As 富）给 1e17–1e18；
     * 本层没有 Te/Se 的金属链，Si 是唯一可用的 n 型掺杂剂。
     */
    id: 'make/gaas-single-crystal',
    name: 'GaAs 单晶制备',
    produces: [
      {
        item: 'mat/gaas-single-crystal',
        qty: q(1),
        gives: [
          { param: 'purity', kind: 'range', min: 99.99, max: 99.999 },
          { param: 'epd', kind: 'range', min: 0, max: 1e5 },
          { param: 'diameter', kind: 'range', min: 48, max: 52 },
          { param: 'carrierConcentration', kind: 'range', min: 2e17, max: 1e18 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/gallium', qty: q(241, 500) }] },
      { anyOf: [{ item: 'mat/arsenic', qty: q(523, 1000) }] },
      { anyOf: [{ item: 'mat/polysilicon', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1, 100) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      {
        note_zh: '装料封管：Ga 0.482 + As 0.523 + Si 0.0001 装进 φ30×300 石英管（As 过量 1 %），氩置换后局部 1900–2200 °C 封口',
        performedBy: 'plant/arc-furnace',
        under: [{ param: 'temperature', min: 1900, max: 2200 }],
      },
      {
        note_zh: 'VGF 凝固：1250–1260 °C 均质 2 h，0.5–1 °C/h 降到 1000 °C（260–520 h），再 20 °C/h 到室温；炉口自然梯度 10–20 °C/cm，等温面自冷端推进',
        performedBy: 'plant/high-temp-furnace',
        under: [{ param: 'temperature', min: 1240, max: 1260 }],
      },
      { note_zh: '破管取锭：HF/HNO₃ 腐蚀 5–10 µm 去石英沾污；量直径 48–52 mm、EPD（EPD 无腐蚀坑计数手段，按设计值 1e5 记）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(360) },
    unbalanced_zh: 'Ga 0.482 + As 0.523 + Si 0.0001 = 1.0051 kg → 单晶 1 kg；As 过量 1 % 在开管时随尾气走，石英管 0.2 kg 被 HF 蚀掉不回收',
  },

  {
    /**
     * **GaAs 衬底：1 kg 锭 → 130 片 2 英寸片 + 切磨抛废料。**
     *
     * 与 `make/inp-substrate` 同一套设备与算法：
     *   线锯切片（导轮槽距 0.4 mm、切缝 0.2 mm）
     *   研磨去 40–60 µm 锯伤、倒角
     *   CMP 胶体硅浆料 Ra ≤1 nm
     *   清洗/量厚度/TTV
     */
    id: 'make/gaas-substrate-2in',
    name: '2 英寸 GaAs 衬底制造',
    produces: [
      {
        item: 'std/gaas-substrate-2in',
        qty: q(130),
        gives: [
          { param: 'diameter', kind: 'range', min: 50.8, max: 50.8 },
          { param: 'thickness', kind: 'range', min: 380, max: 480 },
          { param: 'epd', kind: 'range', min: 0, max: 6e4 },
          { param: 'ttv', kind: 'range', min: 0, max: 8 },
          { param: 'orientation', kind: 'enum', oneOf: ['(100) 2°→(110)'] },
          { param: 'carrierConcentration', kind: 'range', min: 2e17, max: 8e17 },
        ],
      },
      { item: 'mat/tailings', qty: q(107, 250) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/gaas-single-crystal', qty: q(1) }] },
      { anyOf: [{ item: 'mat/silicon-carbide', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/colloidal-silica', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(5) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '线锯切片：导轮槽距 0.40 mm、切缝 0.20 mm，1 kg 锭挂 150 刀；切缝损失约 0.29 kg', performedBy: 'plant/wire-saw' },
      { note_zh: '研磨：去 40–60 µm 锯伤层，TTV 收到 ≤8 µm；边倒角', performedBy: 'plant/grinder' },
      { note_zh: 'CMP：胶体硅浆料（pH 10–11）抛 10–20 µm，Ra ≤1 nm；双面抛光', performedBy: 'plant/cmp-polisher' },
      { note_zh: '清洗/检验：超纯水冲洗、甩干；量厚度、TTV、EPD（EPD 按设计值）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(40) },
    unbalanced_zh: '单晶 1 kg + 碳化硅 0.2 + 胶体硅 0.02 + 水 5 → 130 片（每片 4.3 g，共 0.56 kg）+ 尾料 0.43 kg；片按件计，质量账不做断言',
  },

  {
    /**
     * **GaAs/AlGaAs 外延：MOCVD 680–700 °C、6–14 kPa，3 片/炉。**
     *
     *   衬底 3 片 + TMGa 0.3 g + TMAl 0.1 g + AsH₃ 0.2 g + SiH₄ 0.01 g
     *     + H₂ 1 kg + N₂ 0.5 kg → 外延片 3 片
     *
     * 外延层 3.25 µm × 20.27 cm² × 3 片 × 4.5 g/cm³ = **89 mg**（不是 8.9 mg：
     * 这是 3 片的总量）；其中 Ga 约 36 mg、Al 约 10 mg、As 约 44 mg。MOCVD 的
     * 源利用率 20–30 %，所以 TMGa 0.3 g（Ga 52 %）、TMAl 0.1 g（Al 37.5 %）、
     * AsH₃ 0.2 g（As 96 %）是**供给量**，大部分进尾气洗涤。
     *
     * ⚠️ 生长温度 680–700 °C 是 MOCVD 窗口的上沿（InGaAs 那锅饭是 500–700）。
     *    AlGaAs 的工业窗口 700–800 °C，本层只能到 700：碳沾污高、阈值高
     *    20–50 %；p 型碳掺杂反而因此更容易（低 V/III + 低温度）。
     */
    id: 'make/gaas-algaas-epi-wafer',
    name: 'GaAs/AlGaAs 外延',
    produces: [
      {
        item: 'std/gaas-epi-870-general',
        qty: q(3),
        gives: [
          { param: 'plPeak', kind: 'range', min: 868, max: 872 },
          { param: 'thickness', kind: 'range', min: 3.2, max: 3.6 },
          { param: 'uniformity', kind: 'range', min: 1.5, max: 2.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/gaas-substrate-2in', qty: q(3) }] },
      { anyOf: [{ item: 'mat/trimethyl-gallium', qty: q(3, 10000) }] },
      { anyOf: [{ item: 'mat/trimethyl-aluminium', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/arsine', qty: q(1, 5000) }] },
      { anyOf: [{ item: 'mat/silane', qty: q(1, 100000) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 2) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '装片/烘烤：3 片 2 英寸片进 load-lock，H₂ 烘 680 °C、10 min 去表面氧化（本腔上限 700 °C，不能按工业的 750 °C 烘）', performedBy: 'plant/robot' },
      {
        note_zh: '长 n-GaAs 缓冲 0.5 µm：SiH₄ 1e18、680 °C、10 kPa；生长速率 1 µm/h ⇒ 0.5 h',
        performedBy: 'plant/mocvd-reactor',
        under: [
          { param: 'temperature', min: 680, max: 700 },
          { param: 'pressure', min: 8, max: 12 },
        ],
      },
      {
        note_zh: '长 n-Al₀.₃Ga₀.₇As 包层 1.2 µm：TMGa + TMAl + AsH₃、SiH₄ 5e17；Al 流量按 x = 0.3 配（TMAl/(TMGa+TMAl) ≈ 0.35）',
        performedBy: 'plant/mocvd-reactor',
        under: [
          { param: 'temperature', min: 680, max: 700 },
          { param: 'pressure', min: 8, max: 12 },
        ],
      },
      {
        note_zh: '长 GaAs 有源层 0.15 µm：不掺杂、700 °C；V/III 30–50，界面停 10 s 再切气',
        performedBy: 'plant/mocvd-reactor',
        under: [
          { param: 'temperature', min: 690, max: 700 },
          { param: 'pressure', min: 8, max: 12 },
        ],
      },
      {
        note_zh: '长 p-Al₀.₃Ga₀.₇As 包层 1.2 µm：低 V/III 5–10，碳掺 5e17–1e18；再长 p-GaAs 帽 0.2 µm（碳 1e19）',
        performedBy: 'plant/mocvd-reactor',
        under: [
          { param: 'temperature', min: 680, max: 700 },
          { param: 'pressure', min: 8, max: 12 },
        ],
      },
      { note_zh: '降温/出片：700→300 °C 用 15 min，AsH₃ 保护到 400 °C 以下；量 PL 峰（868–872 nm）与厚度', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(8) },
    unbalanced_zh: '衬底 3 片（12.9 g）+ TMGa 0.3 g + TMAl 0.1 g + AsH₃ 0.2 g + SiH₄ 0.01 g + H₂ 1 kg + N₂ 0.5 kg → 外延片 3 片（外延层 89 mg）；源利用率 20–30 %，其余进尾气洗涤。片按件计',
  },

  {
    /**
     * **870 nm 激光芯片：1 片外延片 → 200 只。**
     *
     * 工艺（与 `make/photodiode-ingaas` 同一条 III-V 线，只是做发光而不是收光）：
     *   ① 蒸发 SiO₂ 200 nm 硬掩模（p 面，室温衬底）
     *   ② 条宽光刻：100 µm 条，接触曝光（`plant/mask-aligner`）
     *   ③ HF 开窗，去窗口里的 SiO₂
     *   ④ p 面 Ti/Au（蒸发，60/200 nm）
     *   ⑤ 合金 380–420 °C、30 s（`plant/resistance-furnace`）
     *   ⑥ 减薄到 100 µm（`plant/grinder`）
     *   ⑦ n 面 AuGe/Ni/Au（蒸发）
     *   ⑧ 合金 380–420 °C、30 s
     *   ⑨ 解理 750 µm 腔长（`plant/dicing-saw` 划槽 + 解理）
     *   ⑩ 端面镀膜：HR 4 对 SiO₂/TiO₂（R ≥97 %）、AR 3 层 TiO₂/SiO₂/TiO₂（R ≤1 %）
     *   ⑪ 装 C-mount：In 焊料、铜块
     *   ⑫ 测 L-I：阈值、斜率、1 A 输出
     *
     * 为什么不用 PECVD 的 SiO₂：本层 PECVD 的气路是 SiH₄/NH₃/N₂（`ingaas.ts`），
     * 没有 N₂O，长不了 SiO₂；SiNx 又不能被 HF 开窗（要 CF₄/O₂ 刻蚀）。所以
     * 硬掩模走**蒸发 SiO₂ + HF 开窗**：膜疏松，当绝缘/掩模够用，不当介质层。
     *
     * 成品率：2 英寸片 20.27 cm² ÷ (0.1×0.075 cm) = 2700 个腔面位；
     * 解理/镀膜/焊装废一半，再按条宽与腔长留边，交 200 只（7–8 %）。
     */
    id: 'make/oes-laser-chip',
    name: '870 nm 双异质结激光芯片制造',
    produces: [
      {
        item: 'plant/oes-line-source/laser-chip',
        qty: q(200),
        gives: [
          { param: 'wavelength', kind: 'range', min: 868, max: 872 },
          { param: 'thresholdCurrent', kind: 'range', min: 100, max: 250 },
          { param: 'slopeEfficiency', kind: 'range', min: 0.5, max: 0.9 },
          { param: 'outputPower', kind: 'range', min: 150, max: 400 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/gaas-epi-870-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/titanium', qty: q(1, 100000) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 100000) }] },
      { anyOf: [{ item: 'mat/germanium-metal', qty: q(1, 100000) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 100000) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(1, 100000) }] },
      { anyOf: [{ item: 'mat/titanium-dioxide', qty: q(1, 100000) }] },
      { anyOf: [{ item: 'mat/indium', qty: q(1, 100000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(27, 500) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '① 蒸发 SiO₂ 200 nm 硬掩模（p 面，衬底不加热）：膜疏松，当绝缘/掩模够用，不当介质层', performedBy: 'plant/evaporator', under: [{ param: 'pressure', min: 0.001, max: 0.01 }] },
      { note_zh: '② 条宽光刻：100 µm 条、2 mm 间距，接触曝光；显影后线条 ±2 µm', performedBy: 'plant/mask-aligner' },
      { note_zh: '③ HF 开窗 30 s，去 SiO₂；水冲、甩干', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 40 }, { param: 'pressure', min: 100, max: 200 }] },
      { note_zh: '④ p 面 Ti/Au 60/200 nm，蒸发速率 0.2–0.5 nm/s', performedBy: 'plant/evaporator', under: [{ param: 'pressure', min: 0.001, max: 0.01 }] },
      { note_zh: '⑤ 合金 380–420 °C、30 s，N₂ 保护；接触电阻 <1e-4 Ω·cm²', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 380, max: 420 }] },
      { note_zh: '⑥ 减薄到 100 µm（背面磨），TTV ≤5 µm', performedBy: 'plant/grinder' },
      { note_zh: '⑦ n 面 AuGe/Ni/Au 100/20/200 nm', performedBy: 'plant/evaporator', under: [{ param: 'pressure', min: 0.001, max: 0.01 }] },
      { note_zh: '⑧ 合金 380–420 °C、30 s；比接触电阻 <5e-5 Ω·cm²', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 380, max: 420 }] },
      { note_zh: '⑨ 划槽/解理：750 µm 腔长，解理面 (110)；每片出 200–300 条', performedBy: 'plant/dicing-saw' },
      { note_zh: '⑩ 端面镀膜：HR 4 对 SiO₂/TiO₂（R ≥97 %）、AR 3 层 TiO₂/SiO₂/TiO₂（R ≤1 %）；膜厚由 `plant/film-monitor` 监控', performedBy: 'plant/evaporator', under: [{ param: 'pressure', min: 0.001, max: 0.01 }] },
      { note_zh: '⑪ 装 C-mount：In 焊料 2 µm、铜块 3×5×2 mm；焊后热阻 3–5 K/W', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '⑫ 测 L-I：阈值 100–250 mA、斜率 0.5–0.9 W/A、1 A 输出 150–400 mW；挑 200 只', performedBy: 'plant/probe-station', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(80) },
    unbalanced_zh: '外延片 1 片 + 光刻胶/氢氟酸各 0.01 + Ti/Au/Ge/Ni 各 10 mg + SiO₂/TiO₂ 各 10 mg + In 10 mg + Cu 0.054 kg → 芯片 200 只；片按件计，膜层每片 <0.05 mg，差额是蒸发损耗（源到片的几何收集 1–5 %）与解理/焊装废品',
  },

  {
    /**
     * 准直/输出镜组：两片熔石英平凸透镜 + 铝镜筒。
     *
     *   准直镜 φ20、f = 15 mm：R = f(n−1) = 15×0.453 = 6.8 mm（n = 1.453 @870）
     *   输出镜 φ10、f = 80 mm：R = 36.2 mm
     * 研磨用 `plant/grinder` 的碗形盘、抛光用 `plant/cnc-polisher-5axis`
     * 的 φ15 小磨头，面形 λ/4 @633 nm（准直镜）与 λ/2（输出镜）；不镀膜
     * （熔石英 870 nm 透过 92 %/面，两片 4 面 0.92⁴ = 72 % —— 输出功率
     * 0.5–20 mW 的窗口已经含这项）。
     */
    id: 'make/oes-collimator',
    name: 'OES 870 准直/输出镜组制造',
    produces: [{ item: 'plant/oes-line-source/collimator', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '粗磨两片平凸：φ20/f15 与 φ10/f80，碗形盘 800 号碳化硅', performedBy: 'plant/grinder' },
      { note_zh: '抛光：φ15 小磨头、氧化铈，面形 λ/4 与 λ/2；中心厚 4 mm 与 2.5 mm', performedBy: 'plant/cnc-polisher-5axis', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装镜筒：铝筒 φ24、准直镜可轴向调 0–3 mm、输出镜固定；两镜同轴 ≤0.05 mm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(16) },
    unbalanced_zh: '石英 0.05 + 铝 0.1 + 不锈钢 0.01 → 镜组 1 件；产物按件计，余是磨削与抛光废料',
  },

  {
    /**
     * 光栅台 + 调谐镜：22° 基块 + 100 mm 正弦杆 + φ20 平面镜。
     *
     *   基块   45 钢，22.00° ±0.01°，磨到 0.02 mm 平面度（角度靠 100 mm 跨距）
     *   转台   蜗轮副 1:180，手轮 + 锁紧；正弦杆 100 mm，测微头 0–25 mm
     *   镜面   φ20×5 熔石英，λ/10，铝膜 60 nm（R(870) 0.85–0.88）
     *
     * 调谐率 0.0124 nm/µm（见文件头 B 节）。
     */
    id: 'make/oes-grating-stage',
    name: '光栅台制造',
    produces: [{ item: 'plant/oes-line-source/grating-stage', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 10) }] },
      { anyOf: [{ item: 'std/micrometer-0-25', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '铣 22° 基块与转台座；车蜗轮副 1:180、手轮；装 100 mm 正弦杆与测微头座', performedBy: 'lathe' },
      { note_zh: '磨 22.00° 面：正弦规对 0.01°，0.02 mm 平面度', performedBy: 'plant/grinder', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '磨/抛 φ20 平面镜：λ/10，蒸铝 60 nm（R(870) 0.85–0.88）', performedBy: 'plant/cnc-polisher-5axis', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装调：镜面与转轴同轴 ≤0.02 mm；正弦杆 100 mm 跨距、测微头零位对 870.0 nm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '45 钢 1 + 石英 0.1 + 测微头 1 + 铝 0.1 + 铜 0.01 → 台 1 件；产物按件计',
  },

  {
    /**
     * 温控座：铜块 + 镍丝加热 + T 型热电偶 + PID。
     *
     *   铜块 30×30×10 mm，表面镀镍 5 µm（防氧化）
     *   加热 0.1 mm 镍丝绕 60 匝，10 Ω、5 W（30 V/0.17 A）
     *   测温 T 型热电偶，冷端在机箱内（19–21 °C）
     *   PID  `std/temp-controller-general`，±0.5 K（1 h）
     */
    id: 'make/oes-thermal-mount',
    name: 'OES 870 温控座制造',
    produces: [{ item: 'plant/oes-line-source/thermal-mount', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/temp-controller-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '铣铜块 30×30×10、镀镍 5 µm；绕镍丝 60 匝（10 Ω）', performedBy: 'plant/milling-machine' },
      { note_zh: '装热电偶与 PID：25–30 °C 设定，1 h 漂 <0.5 K；超调 <1 K', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(8) },
    unbalanced_zh: '铜 0.5 + 镍 0.001 + 热电偶 1 + PID 1 + PTFE 0.01 → 座 1 件；产物按件计',
  },

  {
    /** 机箱：300×150×100 mm 铝箱、PTFE 内衬、φ10 出光窗、后端电气接口。 */
    id: 'make/oes-housing',
    name: 'OES 870 机箱制造',
    produces: [{ item: 'plant/oes-line-source/housing', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 10) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '折焊铝箱、开窗、装 PTFE 内衬与出光窗（φ10 窗口片，8° 楔角防回光）', performedBy: 'plant/sheet-shop' },
      { note_zh: '装后端接口（电源/热电偶/电流）、检漏光：暗室里 1 mW 下无漏光', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(8) },
    unbalanced_zh: '铝 1 + 薄钢板 0.5 + PTFE 0.02 + 玻璃 0.1 → 机箱 1 件；产物按件计',
  },

  {
    /**
     * **OES 870 nm 窄线源整机：装芯片 → 准直 → 光栅台对准 → 温控 → 波长标定。**
     *
     * 装调顺序（每一步都能在 19–21 °C 计量间里做）：
     *   ① 芯片装温控座：In 焊到铜块，p 面朝上；热阻 3–5 K/W
     *   ② 准直：准直镜距芯片 15 mm，调到发散角 <2 mrad（刀口法，两个方向）
     *   ③ 光栅台：α = 22.00°；调谐镜在一级衍射方向 β = 42.02°；
     *      看反馈：阈值从 250 mA 降到 180–220 mA、功率出现跳变，两个都是
     *      外腔锁上的标志（本层没有谱仪，不当场测谱）
     *   ④ 温控 25 °C，老炼 24 h，复测阈值/斜率
     *   ⑤ 波长标定：λ = d(sinα + sinβ)，d = 833.333 nm、α = 22.00°；
     *      调谐镜测微头零位对 870.00 nm；逐点量 860–880 nm 的测微头读数，
     *      与几何计算比，差 <0.2 nm 才收
     *
     * ⚠️ 绝对波长的三处来源：光栅节距（刻划机）±0.05 nm、α 装调 ±0.135 nm、
     *    β 读数 ±0.062 nm；RSS 0.157 nm。**不是溯源到波长标准**，是
     *    几何计算 + 光栅节距；与 589 nm 的钠双线标定无关（钠只校谱仪）。
     */
    id: 'make/oes-line-source',
    name: 'OES 870 nm 窄线源制造',
    produces: [
      {
        item: 'plant/oes-line-source',
        qty: q(1),
        gives: [
          { param: 'wavelength', kind: 'range', min: 860, max: 880, record: 'mat/oes-cal-record' },
          { param: 'linewidth', kind: 'range', min: 0.03, max: 0.1 },
          { param: 'outputPower', kind: 'range', min: 0.5, max: 20 },
          { param: 'wavelengthAccuracy', kind: 'range', min: 0.05, max: 0.2 },
          { param: 'measure/stability', kind: 'range', min: 0.1, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/oes-line-source/laser-chip', qty: q(1) }] },
      { anyOf: [{ item: 'plant/oes-line-source/collimator', qty: q(1) }] },
      { anyOf: [{ item: 'plant/oes-line-source/grating-stage', qty: q(1) }] },
      { anyOf: [{ item: 'plant/oes-line-source/thermal-mount', qty: q(1) }] },
      { anyOf: [{ item: 'plant/oes-line-source/housing', qty: q(1) }] },
      { anyOf: [{ item: 'plant/refractometer/oes-grating', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 芯片装温控座：In 焊 2 µm、铜块 3×5×2 mm；焊后测热阻 3–5 K/W', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 准直：准直镜距芯片 15 mm，两个方向的发散角 <2 mrad（刀口法）；束宽 10.8 × 2.7 mm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 光栅台对准：α = 22.00°，调谐镜对 β = 42.02°；外腔锁上时阈值从 250 降到 180–220 mA、功率出现跳变', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 温控 25 °C、老炼 24 h：阈值/斜率复测，漂 >10 % 的换芯片', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '⑤ 波长标定：λ = d(sinα + sinβ)，d = 833.333 nm；测微头零位对 870.00 nm，860–880 nm 逐点与几何计算比 <0.2 nm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '⑥ 封箱：装输出镜（f = 80 mm），量 870 nm 输出 0.5–20 mW；写设计窗口与三处降级（700 °C 外延、1e5 EPD、±0.5 K 温控）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(40) },
    unbalanced_zh: '芯片 1 + 镜组 1 + 光栅台 1 + 温控座 1 + 机箱 1 + 光栅 1 + 铜 0.1 + 铝 0.2 → 源 1 台；产物按台计，余是装调废品与镀膜边角',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 导出：两组数组，注册到 report 只要两行 import + 两行展开
// ═══════════════════════════════════════════════════════════════════════════

export const LCR_LF_ITEMS: readonly Item[] = [...LCR_ITEMS, ...OES_SOURCE_ITEMS];
export const LCR_LF_ROUTES: readonly Route[] = [...LCR_ROUTES, ...OES_SOURCE_ROUTES];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...LCR_LF_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...LCR_LF_ROUTES];
