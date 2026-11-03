/**
 * 第二套独立绝对电压方法 —— 可计算电容给 Ω、电流天平给 A，再 V = I·R。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、为什么还要第二套
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `voltage-anchor.ts` 的电压天平已经把 10 V 档做到 **31 ppm**（设计值），
 * 但它只有一条绝对链：同一台微天平、同一套砝码、同一座可逆摆。A/B 两只
 * 基准是同批同链，**共同偏差查不出** —— 31 ppm 说的是「链内重复性」，
 * 不是「绝对伏特真的准到 31 ppm」。这就是那份文件 §七② 记的缺口。
 *
 * 要查共同偏差，只有一条路：**用物理上不同的另一条链去量同一个 10 V**。
 * 这一份建的就是那条链：
 *
 *   C = ε₀(ln2/π)L   ← 可计算电容（长度直接给法拉）
 *   R = 1/(ωC)        ← 频率 + 电容给欧姆
 *   F = I²·dM/dx      ← 电流天平（力 + 互感梯度给安培）
 *   V = I·R           ← 两条合起来给伏特
 *
 * 它与电压天平不共用任何一条中间量：
 *
 *   电压天平   质量 + 长度 + ε₀ → V          （不经过电流、不经过电阻）
 *   本文件     长度 + 时间 + 质量 → C、R、I → V（经过电容、电阻、电流）
 *
 * 两条链唯一共用的东西是「长度」与「质量」的**初级标准**（量块、硅球），
 * 但传递路径不同：电压天平把长度用在极板面积/间隙上，本文件把长度用在
 * 圆柱电容的轴向长度与线圈几何上。共同偏差因此被拆开。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、链图
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   plant/calculable-capacitor（四圆柱 Thompson–Lampard 交叉电容）
 *     C = ε₀·(ln2/π)·L = 1.953 pF/m × 0.5 m = **0.9768 pF**
 *     L 用激光干涉测（20 nm → 0.04 ppm）；圆柱圆度/直线度设计 0.1 µm，
 *     本层研磨 0.2 µm、磨 1–3 µm —— **差 2–10 倍，C 取 20–50 ppm**
 *                                  │
 *                                  ▼
 *   plant/ratio-bridge（精密比率桥）
 *     100:1 比率把 0.9768 pF 传到 100 pF 标准 → C_std = **97.68 pF**
 *     比率误差 **50–100 ppm**（本层没有精密比率变压器，这一项是主项）
 *                                  │
 *                                  ▼
 *   R = 1/(ω·C_std)，f = 10 kHz（石英 10 ppm）
 *     R = 1/(2π×10⁴×97.68e-12) = **162.94 kΩ**
 *     再经 1.63:1 与 100:1 两级比率，标到 100 kΩ / 1 kΩ 标准电阻
 *                                  │
 *                                  ▼
 *   plant/current-balance（双线圈电流天平）
 *     F = I²·dM/dx；N=500、a=100 mm、x=120 mm → dM/dx = **0.1910 N/A²**
 *     I = 10 mA → F = 19.10 µN = **5.15 mg（火星 g）** → 微天平 0.05 µg 读
 *                                  │
 *                                  ▼
 *   V = I·R = 10 mA × 1 kΩ = **10.000 V**
 *     10 V 档绝对不确定度 **110 ppm**（设计值，方和根，见 §三）
 *                                  │
 *                                  ▼
 *   measure/voltage-absolute-capacitor → mat/voltage-absolute-capacitor-record
 *     绝对电压 0.5–10 V，不确定度 **90–160 ppm**
 *
 *   两法比对：
 *   measure/voltage-anchor-intercomparison
 *     用 voltage-anchor 的 50–90 ppm 记录与本文件的 90–160 ppm 记录比 10 V
 *     |Δ| ≤ **60 ppm** → 一致；60–200 ppm → 不矛盾但电容法误差偏大；
 *     > 200 ppm → 判错。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、误差预算（设计值，1σ，方和根）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   项                                      设计值        对 V 的贡献
 *   ─────────────────────────────────────────────────────────────
 *   可计算电容 C（长度 0.04 + 形状/端部 30 + 杂散 30） 42 ppm  42 ppm
 *   比率桥（C 的 100:1 传递 + 100 pF 臂杂散 50） 70 ppm    70 ppm
 *   频率（石英 100 kHz ÷10）                  10 ppm        10 ppm
 *   R 的传递（1.63:1 + 100:1 两级）            60 ppm        60 ppm
 *   电流天平（dM/dx 25 + 力 10）              25 ppm        25 ppm
 *   V 到 1/2/5/0.5 V 抽头                     30 ppm        30 ppm
 *   ─────────────────────────────────────────────────────────────
 *   方和根                                                  **110 ppm**
 *
 *   注：C 的 42 ppm = 形状/端部 30 + 0.03 fF 杂散 30（方和根 42）；
 *   0.1 fF 就是 100 ppm。这条要求比比率桥更硬，见 §六⑦。
 *
 *   交付窗口取 **90–160 ppm**（含装调、首批与温漂余量）。它比电压天平的
 *   31 ppm 差 3–5 倍，原因不在「哪条更聪明」，在**它多经过三个传递**：
 *   电容的 100:1 比率、R 的两级比率、电流天平的互感梯度。每多一级就多
 *   50–60 ppm；这是欧姆/安培路线的固有代价，不是实现得不好。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、两法比对判据
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   两个 10 V 读数之差 Δ = V_voltage-balance − V_capacitor。
 *
 *   · **一致（设计目标）**：|Δ| ≤ **60 ppm**。60 ppm 比两法合成的 1σ
 *     （≈130 ppm）小，达到它说明两条链没有共同的 60 ppm 以上偏差 ——
 *     这正是第二套要回答的问题。
 *   · **不矛盾**：60 < |Δ| ≤ **200 ppm**。两法各 50–90 / 100–150 ppm，
 *     差值 1σ = √(u₁²+u₂²) ≈ **130 ppm**；200 ppm 是 1.5σ，落在里面就不算错。
 *   · **判错**：|Δ| > **200 ppm**。要么某条链的传递算错，要么有一条的系统误差
 *     没进预算，必须查。
 *
 *   ⚠️ 60 ppm 是**工程目标**，不是统计判据。以 u₂=120 ppm 计，两法差值落到
 *   60 ppm 以内的概率本来就不高（约 0.35–0.45）；达到它说明电容法的实际误差
 *   比预算小，达不到也不自动说明谁错。记录里把 `criterion=60 ppm` 与
 *   `combinedUncertainty` 分开写，就是防止把工程目标读成统计结论。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、机械差距：照实写，不拿「本层没有」当结论
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   交叉电容的 C 只由**轴向长度**定，圆柱半径与间距在一阶上不进公式
 *   （C = ε₀ ln2/π L 与 r 无关）—— 这是 Thompson–Lampard 的全部价值。
 *   所以「直径量不准」不是主要矛盾；主要矛盾是：
 *
 *     ① 圆度/直线度：设计要 ≤0.1 µm；本层研磨（路线用）0.2–0.3 µm（2–3 倍），
 *        磨 1–3 µm 是更粗的备选（10–30 倍，不用）。形状误差破坏 90° 对称，
 *        一阶修正进 C；C 取 20–50 ppm，不是 5 ppm。
 *     ② 端部/保护段：有限长度 + 保护环隙的边缘场，0.5 m 上要算到 10 ppm；
 *        本层没有第二台可计算电容去交叉验证。
 *     ③ 长度：激光 20 nm / 0.5 m = 0.04 ppm；折射率在 0.5 m 上是 2.54 ppm（1.27 µm），用 refractometer 修正。
 *     ④ 温度：不锈钢 α=16 ppm/K，0.1 K = 1.6 ppm；用计量间 19–21 °C 实测修正。
 *
 *   所以条目上写的是**设计窗口 20–50 ppm**（不是 5 ppm），并把「电极
 *   圆度 ≤0.1 µm」写成设计目标、把「0.2–0.3 µm」写成实际交付 —— 两者
 *   都写出来，读的人才知道差在哪。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、剩余缺口（带数字）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **比率桥 50–100 ppm 是主项**：本层只有电力变压器（`std/transformer-general`
 *      1–1000 kVA），没有精密比率变压器；100:1 的漏磁/绕组分布电容把比率
 *      误差压在 50–100 ppm，再往下要多层屏蔽 + 补偿绕组，本文件不做。
 *   ② **C 的形状误差 20–50 ppm**：路线用研磨 0.2–0.3 µm（2–3 倍）；磨 1–3 µm
 *      是更粗的备选（10–30 倍，不用）。要 5 ppm 得 0.02 µm 级圆度，本层没有。
 *   ③ **电流天平的 dM/dx 25 ppm**：线圈半径 100 mm 量到 0.1 µm 是 1 ppm，
 *      但绕组的层间位置/线径分散给 20–30 ppm；要压下去得用单层密绕 + 光学
 *      测位，本文件只到 25 ppm。
 *   ④ **R 的两级传递 60 ppm**：1.63:1 与 100:1 各 30–60 ppm；Hamon
 *      自校能验证 100:1，不能把 1.63:1 也压到 10 ppm。
 *   ⑤ **没有量子标准**：本文件 110 ppm vs 约瑟夫森 10⁻⁸，差 10⁴ 倍；
 *      He、Nb/NbN、2DEG 仍是 0 条。
 *   ⑥ **两法共用的初级标准**：都用量块与硅球；如果量块/硅球本身有 20 ppm
 *      的共同偏差，两法比对查不出。要查它得第三套（进口标准或量子）。
 *   ⑦ **0.03 fF 的未保护杂散**：0.9768 pF 的 100 ppm 是 0.0001 pF（0.1 fF），
 *      30 ppm 就是 0.00003 pF（0.03 fF）。保护驱动能把电缆电容带走，但保护环
 *      跟随误差/接头污染到 0.001 pF 就是 1000 ppm。本文件只到「设计上要求
 *      0.03 fF」，没有 0.03 fF 标准去实测。
 *   ⑧ **湿度/泄漏**：0.9768 pF 电容在 10 kHz 下阻抗 16.3 MΩ，表面 1 pA 的泄漏
 *      在 10 V 上是 10 TΩ，不直接加载；但保护不周会引入 10–100 ppm 的
 *      并联电容，要求 RH <40 %。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 七、注册（本文件不改 tools/report/data.ts，由用户注册）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { VOLTAGE_ANCHOR2_ITEMS, VOLTAGE_ANCHOR2_ROUTES }
 *     from '../../data/machine/voltage-anchor-2.ts';
 *   items 数组加  ...VOLTAGE_ANCHOR2_ITEMS,
 *   routes 数组加 ...VOLTAGE_ANCHOR2_ROUTES,
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const VOLTAGE_ANCHOR2_ITEMS: readonly Item[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 一、可计算电容：五件零件
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * **交叉电容电极：4 根 φ80×600 mm 不锈钢圆柱，圆度/直线度设计 ≤0.1 µm。**
   *
   * Thompson–Lampard 的 4 根圆柱按正方形排布，对角两对之间的电容：
   *
   *   C = ε₀·(ln2/π)·L = 1.953 pF/m × L
   *
   * **注意 C 与圆柱半径无关** —— 这是它比平行板强的地方：不用量面积，
   * 只量轴向长度 L。半径只影响「边缘场离得多远」，不影响一阶值。
   *
   * 所以这根电极的验收不是「直径准不准」，是**圆度/直线度**：
   * 设计 ≤0.1 µm；本层研磨 0.2 µm、磨 1–3 µm，实际交 0.2–0.3 µm。
   * 差 2–3 倍，C 的 20–50 ppm 就是从这儿来的（见文件头 §五）。
   *
   * 材料用不锈钢（α=16 ppm/K）：0.5 m 上 0.1 K 是 0.8 ppm，实测修正。
   */
  {
    id: 'plant/calculable-capacitor/electrode',
    name: 'Calculable Capacitor Cross-Capacitor Electrode', name_zh: '可计算电容交叉电容电极',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 79.9, max: 80.1, unit: 'mm' },
      { param: 'length', kind: 'range', min: 590, max: 610, unit: 'mm' },
      { param: 'roundness', kind: 'range', min: 0, max: 0.3, unit: 'µm', dir: 'atMost' },
      { param: 'straightness', kind: 'range', min: 0, max: 0.3, unit: 'µm/500mm', dir: 'atMost' },
    ],
  },

  /**
   * **保护段：2 根 φ80/φ70×120 mm 不锈钢管，圆度 ≤0.3 µm。**
   *
   * 保护段与电极同电位，把有效长度的端点从「电极的物理端面」推到
   * 「保护段与测量段的环隙」—— 端部场因此被赶到保护段上，不进入测量段。
   * 0.5 m 上端部效应原本是 1e-3 量级（1000 ppm），加保护段后残差 10 ppm。
   *
   * 两根一组：一端一根；环隙 0.1 mm，用熔石英垫片定（与电压天平同法）。
   */
  {
    id: 'plant/calculable-capacitor/guard-tube',
    name: 'Calculable Capacitor Guard Section', name_zh: '可计算电容保护段',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 79.9, max: 80.1, unit: 'mm' },
      { param: 'length', kind: 'range', min: 115, max: 125, unit: 'mm' },
      { param: 'roundness', kind: 'range', min: 0, max: 0.3, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * **框架：150 kg HT250 底座 + 四组 V 形座 + 调整螺钉。**
   *
   * 四根电极的平行度靠 V 形座：两根固定、两根可调；V 形座面研过，
   * 电极放上去靠自重定位，不靠夹紧（夹紧会把 0.2 µm 的圆度夹成 1 µm）。
   * 底座 150 kg 把地面振动旁路；四组 V 形座在同一块底座上，热胀一起走。
   */
  {
    id: 'plant/calculable-capacitor/frame',
    name: 'Calculable Capacitor Frame', name_zh: '可计算电容框架',
    unit: '件',
    category: 'part',
    props: [
      { param: 'mass', kind: 'range', min: 140, max: 160, unit: 'kg' },
      { param: 'height', kind: 'range', min: 800, max: 1000, unit: 'mm' },
      { param: 'flatness', kind: 'range', min: 0, max: 0.05, unit: 'mm', dir: 'atMost' },
    ],
  },

  /**
   * **长度驱动：0–1 m 差动丝杠 + 研磨导轨 + 激光靶，分辨 0.1 µm。**
   *
   * 它移动一端的保护段，改变测量段的轴向长度 L。L 的绝对值不靠丝杠刻度，
   * 靠激光干涉仪直接量两个环隙之间的距离；丝杠只负责「走到差不多」。
   *
   * 导轨直线度 1 µm/m，走 0.5 m 的横向漂移 0.5 µm；对 C 的影响是
   * 二阶（C 与径向位置无关），所以只占 1–2 ppm。分辨率 0.1 µm 是为了
   * 找到环隙的同一位置，不是为了让 L 准到 0.1 µm。
   */
  {
    id: 'plant/calculable-capacitor/length-drive',
    name: 'Calculable Capacitor Length Drive', name_zh: '可计算电容长度驱动',
    unit: '件',
    category: 'part',
    props: [
      { param: 'range', kind: 'range', min: 0, max: 1, unit: 'm' },
      { param: 'resolution', kind: 'range', min: 0.05, max: 0.2, unit: 'µm', dir: 'atMost' },
      { param: 'straightness', kind: 'range', min: 0, max: 1, unit: 'µm/m', dir: 'atMost' },
    ],
  },

  /**
   * **屏蔽罩：铝 10 kg + 薄钢板 5 kg，60–80 dB。**
   *
   * 0.9768 pF 在 10 kHz 下是 16.3 MΩ；1 pF 的杂散是 100 % 的误差，
   * 0.001 pF 就已经是 1000 ppm。屏蔽 + 单点接地 + 保护环驱动把**未保护**
   * 杂散压到 0.00003 pF（0.03 fF）以下；电缆电容被保护驱动带走，不进测量。
   * 这是本文件最难的工艺点：0.1 fF 是 100 ppm，0.03 fF 才是 30 ppm。
   */
  {
    id: 'plant/calculable-capacitor/shield',
    name: 'Calculable Capacitor Shield Cover', name_zh: '可计算电容屏蔽罩',
    unit: '件',
    category: 'part',
    props: [
      { param: 'mass', kind: 'range', min: 10, max: 20, unit: 'kg' },
      { param: 'attenuation', kind: 'range', min: 60, max: 80, unit: 'dB', dir: 'atLeast' },
    ],
  },

  /**
   * **可计算电容：C = ε₀(ln2/π)L，L=0.5 m → 0.9768 pF，20–50 ppm。**
   *
   * 它不是「又一只标准电容」，是**法拉的绝对定义件**：C 只由长度 L 与
   * ε₀ 定，不需要任何已知电容去比。0.5 m 的 L 用激光干涉量到 20 nm
   * （0.04 ppm），C 的误差几乎全在圆柱形状与端部场上（20–50 ppm）。
   *
   * 量程 0.5–2 pF 对应 L 0.26–1.02 m；本机 L 0.3–0.7 m（0.59–1.37 pF），
   * 只做 0.5 m 的 0.977 pF 这一点。2 pF 端要 1.02 m 的 L，电极得加长到
   * 1.1 m，本文件不建 —— 缺口写在这里，不假装有。
   * 为什么不做更长的 L：L 越长，C 越大、长度项越小，但 1 m 的
   * 不锈钢圆柱要 1.5 t 的框架，且直线度更难；0.5 m 是折中。
   */
  {
    id: 'plant/calculable-capacitor',
    name: 'Calculable Capacitor', name_zh: '可计算电容',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'capacitance', kind: 'range', min: 0.5, max: 2, unit: 'pF' },
      { param: 'length', kind: 'range', min: 0.3, max: 0.7, unit: 'm' },
      { param: 'electrodeDiameter', kind: 'range', min: 60, max: 100, unit: 'mm' },
      { param: 'uncertainty', kind: 'range', min: 20, max: 50, unit: 'ppm', dir: 'atMost' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 二、比率桥：三件零件
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * **精密比率变压器：环形铁芯 + 100:1 绕组，比率误差 50–100 ppm。**
   *
   * 它把 0.9768 pF 的 C_calc 与 100 pF 标准放在桥的两臂：平衡时
   * C_std = 100 × C_calc × (1+ε)，ε 就是比率误差。
   *
   * 为什么是环形铁芯：环形没有气隙，漏磁小；100:1 的整数匝比本身是精确的，
   * 误差来自绕组分布电容与激磁电流 —— 50–100 ppm 是这两项的和。
   * 本层只有电力变压器（`std/transformer-general` 1–1000 kVA），
   * 没有精密比率变压器；这一台是新造的，不是拿电力变压器改。
   */
  {
    id: 'plant/ratio-bridge/transformer',
    name: 'Precision Ratio Bridge Precision Ratio Transformer', name_zh: '精密比率桥精密比率变压器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'ratio', kind: 'range', min: 100, max: 100, unit: ':1' },
      { param: 'ratioError', kind: 'range', min: 50, max: 100, unit: 'ppm', dir: 'atMost' },
      { param: 'frequency', kind: 'range', min: 1000, max: 20000, unit: 'Hz' },
      { param: 'power', kind: 'range', min: 0.1, max: 10, unit: 'VA' },
    ],
  },

  /**
   * **比率臂：10×100 Ω + 10×1 kΩ 的 Hamon 网络，30–60 ppm。**
   *
   * 变压器给 100:1 的粗比；Hamon 网络给 10:1 / 100:1 的细比，两者叠成
   * 1.63:1、100:1、1000:1 几档。10 只等值电阻串/并换接，比值误差是
   * 二阶量（Σeᵢ²/2），单只 0.005 % 进二阶只剩 1.25e-7 —— 这是
   * `std/divider-100to1-precision` 的同一条手艺，只是这里要做到 1.63:1。
   */
  {
    id: 'plant/ratio-bridge/arm',
    name: 'Precision Ratio Bridge Ratio Arm', name_zh: '精密比率桥比率臂',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resistance', kind: 'range', min: 10, max: 1000, unit: 'Ω' },
      { param: 'ratioError', kind: 'range', min: 30, max: 60, unit: 'ppm', dir: 'atMost' },
      { param: 'tempco', kind: 'range', min: 1, max: 5, unit: 'ppm/K', dir: 'atMost' },
    ],
  },

  /**
   * **比率桥屏蔽：铝 5 kg + 薄钢板 5 kg，60–80 dB。**
   *
   * 桥的平衡点是指零，不是读数；杂散电容直接进比率。屏蔽 + 保护驱动，
   * 把 100:1 臂的未保护杂散压到 0.005 pF 以下（0.005 pF/97.7 pF ≈ 50 ppm，
   * 与 60–80 ppm 的变压器比率误差方和根后 ≤100 ppm）；0.01 pF 是 100 ppm，
   * 单这一项就吃满预算，不够。1 pF 臂那一边要 0.03 fF（见可计算电容屏蔽）。
   */
  {
    id: 'plant/ratio-bridge/shield',
    name: 'Precision Ratio Bridge Shield Cover', name_zh: '精密比率桥屏蔽罩',
    unit: '件',
    category: 'part',
    props: [
      { param: 'mass', kind: 'range', min: 5, max: 10, unit: 'kg' },
      { param: 'attenuation', kind: 'range', min: 60, max: 80, unit: 'dB', dir: 'atLeast' },
    ],
  },

  /**
   * **精密比率桥：1.63:1–1000:1，比率误差 50–100 ppm，1–20 kHz。**
   *
   * 两个用途：
   *   ① C 的 100:1 传递：C_calc 0.9768 pF → C_std 97.68 pF；
   *   ② R 的 1.63:1 与 100:1 传递：162.94 kΩ → 100 kΩ → 1 kΩ。
   *
   * 比率误差 50–100 ppm 是主项；它同时进了 C 与 R 两条传递，所以
   * 在误差预算里按 70 ppm 记两次（C 一次、R 一次），不是同一个数只算一次。
   */
  {
    id: 'plant/ratio-bridge',
    name: 'Precision Ratio Bridge', name_zh: '精密比率桥',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'ratio', kind: 'range', min: 1, max: 1000, unit: ':1' },
      { param: 'ratioError', kind: 'range', min: 50, max: 100, unit: 'ppm', dir: 'atMost' },
      { param: 'measure/frequency', kind: 'range', min: 1000, max: 20000, unit: 'Hz' },
      { param: 'capacitanceRange', kind: 'range', min: 0.5, max: 100, unit: 'pF' },
      { param: 'measure/accuracy', kind: 'range', min: 0, max: 500, unit: 'ppm', dir: 'atMost' },
      { param: 'measure/tempCoefficient', kind: 'range', min: 0, max: 50, unit: 'ppm/K', dir: 'atMost' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 三、电流天平：五件零件
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * **电流天平的线圈：500 匝 φ0.2 mm 漆包线，φ200 mm，2 只，150–250 Ω。**
   *
   * 两只同轴线圈：一只固定、一只挂在微天平上。同向电流时互相排斥，
   * 力 F = I²·dM/dx。匝数 500 是为了在 10 mA 就有 7 mg 的力：
   *
   *   dM/dx = 3μ₀πN²a⁴x / [2(a²+x²)^(5/2)]
   *   N=500、a=100 mm、x=120 mm → **0.1910 N/A²**
   *   I=10 mA → F = **19.10 µN = 5.15 mg（火星 g）**
   *
   * 线圈要单层密绕：层间位置偏差 0.1 mm 就是 dM/dx 的 20–30 ppm。
   */
  {
    id: 'plant/current-balance/coil',
    name: 'Current Balance Coil', name_zh: '电流天平的线圈',
    unit: '件',
    category: 'part',
    props: [
      { param: 'turns', kind: 'range', min: 500, max: 500, unit: '匝' },
      { param: 'diameter', kind: 'range', min: 199.9, max: 200.1, unit: 'mm' },
      { param: 'resistance', kind: 'range', min: 150, max: 250, unit: 'Ω' },
    ],
  },

  /**
   * **线圈骨架：φ200×120 mm 氧化铝，热膨胀 ≤1 ppm/K。**
   *
   * 骨架的直径就是线圈的半径 a；a 进 dM/dx 的四次方量级（dM/dx ∝ a⁴），
   * 0.1 µm/100 mm = 1 ppm 的直径误差被放大到 ~4 ppm。用氧化铝（α=7 ppm/K）
   * 而不是铝（23 ppm/K）：0.1 K 的温差从 2.3 ppm 降到 0.7 ppm。
   *
   * 长度 120 mm：500 匝 φ0.2 mm 单层密绕要 100 mm 轴向，两端各留 10 mm。
   */
  {
    id: 'plant/current-balance/former',
    name: 'Current Balance Coil Former', name_zh: '电流天平线圈骨架',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 199.9, max: 200.1, unit: 'mm' },
      { param: 'length', kind: 'range', min: 110, max: 130, unit: 'mm' },
      { param: 'tempco', kind: 'range', min: 0.5, max: 1, unit: 'ppm/K', dir: 'atMost' },
    ],
  },

  /**
   * **电流天平框架：35–45 kg 铸铁梁 + 升降台 + 配重。**
   *
   * 下线圈固定、上线圈挂微天平；两线圈间距 x=120 mm 由升降台定，
   * 激光干涉量到 0.1 µm（x 进 dM/dx 的 3 次方量级）。框架 40 kg 把
   * 地面振动旁路；配重把 2 只线圈的 3 kg 静态负载从微天平上卸掉。
   */
  {
    id: 'plant/current-balance/frame',
    name: 'Current Balance Frame', name_zh: '电流天平框架',
    unit: '件',
    category: 'part',
    props: [
      { param: 'mass', kind: 'range', min: 35, max: 45, unit: 'kg' },
      { param: 'height', kind: 'range', min: 500, max: 700, unit: 'mm' },
      { param: 'straightness', kind: 'range', min: 0, max: 0.05, unit: 'mm', dir: 'atMost' },
    ],
  },

  /**
   * **电流天平屏蔽：铝 5 kg + 薄钢板 5 kg，40–60 dB。**
   *
   * 线圈在 10 mA 下的磁场很弱（~10⁻⁵ T），但 50 Hz 的地磁扰动/邻近电机
   * 会在两只线圈里感应出差模电流，直接变成力噪声。屏蔽 + 双绞引线 +
   * 正反向换向，把这一项压到 10 ppm 以下。
   */
  {
    id: 'plant/current-balance/shield',
    name: 'Current Balance Shield', name_zh: '电流天平屏蔽',
    unit: '件',
    category: 'part',
    props: [
      { param: 'mass', kind: 'range', min: 5, max: 15, unit: 'kg' },
      { param: 'attenuation', kind: 'range', min: 40, max: 60, unit: 'dB', dir: 'atLeast' },
    ],
  },

  /**
   * **电流源：40 只 1.2 V 电池单体串成 48 V + 10 kΩ 变阻器 + 换向开关，5–100 mA。**
   *
   * 电流的**绝对值不进公式** —— 电流天平自己量 I；电源只要在 10 min 内
   * 稳定到 20 ppm。48 V 电池 + 10 kΩ 变阻器给 5–100 mA（线圈 350 Ω，总电阻
 * 480 Ω–9.6 kΩ）；变阻器用
   * 电阻丝绕，温度系数 100 ppm/K，0.1 K 是 10 ppm。换向开关正反向各测一次，
   * 把接触热电势与地磁偏置扣掉。
   *
   * ⚠️ 不直接拿 `plant/robot/battery` 整包：那一包的路线有一条
   * `need voltage 1.1–1.3` 与单体的 `gives 1.2–1.2` 对不上（`propCovers`
   * 要求交付窗口盖住要求窗口），会把这台电流天平连带卡成「规格卡住」。
   * 这里直接串 40 只**单体**（`plant/robot/battery-cell`，规格可造），
   * 不经过那条有争议的整包路线 —— 这不是放宽判据，是换一条能成立的输入。
   */
  {
    id: 'plant/current-balance/supply',
    name: 'Current Balance Current Source', name_zh: '电流天平电流源',
    unit: '件',
    category: 'part',
    props: [
      { param: 'current', kind: 'range', min: 0, max: 120, unit: 'mA' },
      { param: 'stability', kind: 'range', min: 10, max: 30, unit: 'ppm/min', dir: 'atMost' },
      { param: 'voltage', kind: 'range', min: 0, max: 48, unit: 'V' },
    ],
  },

  /**
   * **电流天平：F = I²·dM/dx，dM/dx=0.1910 N/A²，5–100 mA，20–40 ppm。**
   *
   * 它是安培的绝对定义件：两只线圈的互感梯度 dM/dx 只由几何与 μ₀ 定，
   * 力由微天平读，I = √(F/(dM/dx))。10 mA 时 F=5.15 mg（火星），
   * 微天平 0.05 µg 的分辨是 9.7 ppm。
   *
   * ⚠️ 0.1910 N/A² 是**薄环近似**（把 500 匝当成一只半径 100 mm 的环）。
   * 骨架 120 mm 长的轴向分布会让实际 dM/dx 差 20–30 ppm；实际值按 500 匝
   * 的分布做数值积分，再用 10 mA 点的力反推校验。几何只用来定设计点。
   *
   * 为什么不用「电流通过标准电阻测电压」：那要标准电阻的绝对值，
   * 而标准电阻的绝对值正是本文件要做的事 —— 电流天平与可计算电容
   * 是两条独立的绝对量，不能互相借。
   */
  {
    id: 'plant/current-balance',
    name: 'Current Balance', name_zh: '电流天平',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'current', kind: 'range', min: 5, max: 100, unit: 'mA' },
      { param: 'force', kind: 'range', min: 0.1, max: 500, unit: 'mg' },
      { param: 'dMdx', kind: 'range', min: 0.15, max: 0.22, unit: 'N/A²' },
      { param: 'uncertainty', kind: 'range', min: 20, max: 40, unit: 'ppm', dir: 'atMost' },
    ],
  },

];

export const VOLTAGE_ANCHOR2_ROUTES: readonly Route[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 一、可计算电容：五件零件 + 总装
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * **交叉电容电极：粗车 → 时效 → 精车 → 研磨 → 测圆度/直线度。**
     *
     *   不锈钢 110 kg → 电极 4 根（95.3 kg）
     *
     * 为什么验收的是圆度/直线度，不是直径：C = ε₀ ln2/π L 与半径一阶无关，
     * 形状误差破坏 90° 对称才进 C。设计 ≤0.1 µm，本层研磨 0.2 µm、
     * 磨 1–3 µm —— 实际交 0.2–0.3 µm，差 2–3 倍，C 的 20–50 ppm 在这。
     *
     * 72 h 时效：粗车后不锈钢有 0.02–0.05 mm 残余应力，放 72 h 再精车，
     * 否则 0.5 m 长的圆柱会慢慢弯，直线度从 0.2 µm 漂到 1 µm。
     */
    id: 'make/calculable-capacitor-electrode',
    name: 'Calculable Capacitor Cross-Capacitor Electrode Manufacturing', name_zh: '可计算电容交叉电容电极制造',
    rate: { hours: q(80) },
    produces: [
      {
        item: 'plant/calculable-capacitor/electrode',
        qty: q(4),
        gives: [
          { param: 'diameter', kind: 'range', min: 80.0, max: 80.0 },
          { param: 'length', kind: 'range', min: 600, max: 600 },
          { param: 'roundness', kind: 'range', min: 0.2, max: 0.3 },
          { param: 'straightness', kind: 'range', min: 0.2, max: 0.3 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(110) }] }],
    needs: ['plant/metrology-room', 'plant/comparator/lapping-plate'],
    steps: [
      { note_zh: '粗车 4 根 φ82×620 mm 不锈钢棒，留 1 mm 研磨量', performedBy: 'lathe' },
      {
        note_zh: '72 h 时效：粗车后放 19–21 °C，残余应力释放后再精车',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      { note_zh: '精车 φ80.000×600 mm，端面垂直度 0.05 mm', performedBy: 'lathe' },
      {
        note_zh: '研磨外圆：铸铁研具 + W1 金刚石，圆度/直线度 0.2–0.3 µm（设计 0.1，差 2–3 倍）',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '测圆度/直线度：比较仪在 5 个截面量，圆度 ≤0.3 µm、直线度 ≤0.3 µm/500 mm',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '不锈钢 110 kg → 电极 4 根（95.3 kg，单根 φ80×600 约 23.8 kg）；14.7 kg 是车屑、磨屑与下料余量（不锈钢可回炉）。产物按件计，不进 kg 守恒。圆度/直线度 0.2–0.3 µm 是实测口径（设计 0.1 µm，本层研磨只到 0.2 µm）',
  },

  {
    /**
     * **保护段：2 根 φ80/φ70×120 mm 不锈钢管，圆度 ≤0.3 µm。**
     *
     *   不锈钢 5 kg → 保护段 2 根（2.2 kg）
     *
     * 保护段与电极同电位，把有效长度的端点从「电极物理端面」推到
     * 「保护段/测量段的 0.1 mm 环隙」。没有它，0.5 m 上的端部场是
     * 1e-3 量级（1000 ppm）；有它，残差 10 ppm。
     */
    id: 'make/calculable-capacitor-guard-tube',
    name: 'Calculable Capacitor Guard Section Manufacturing', name_zh: '可计算电容保护段制造',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'plant/calculable-capacitor/guard-tube',
        qty: q(2),
        gives: [
          { param: 'diameter', kind: 'range', min: 80.0, max: 80.0 },
          { param: 'length', kind: 'range', min: 120, max: 120 },
          { param: 'roundness', kind: 'range', min: 0.2, max: 0.3 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(5) }] }],
    needs: ['plant/metrology-room', 'plant/comparator/lapping-plate'],
    steps: [
      { note_zh: '车 φ80/φ70×120 mm 不锈钢管，留 0.5 mm 研磨量', performedBy: 'lathe' },
      { note_zh: '研磨内/外圆到圆度 0.2–0.3 µm；端面与轴线垂直 0.05 mm', performedBy: 'plant/grinder' },
      {
        note_zh: '测内/外径与圆度：比较仪 3 个截面；与电极同轴度 ≤0.1 mm',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '不锈钢 5 kg → 保护段 2 根（2.2 kg，单根约 1.1 kg）；2.8 kg 是套料、车屑与磨屑（可回炉）。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **框架：浇铸 → 铣 V 形座 → 磨座面 → 测平面度。**
     *
     *   铸铁 160 kg → 框架 1 件（150 kg）
     *
     * 四根电极的平行度靠 V 形座：两根固定、两根可调；V 形座面研过，
     * 电极靠自重定位，不夹紧 —— 夹紧会把 0.2 µm 的圆度夹成 1 µm。
     * 150 kg 底座把地面振动旁路。
     */
    id: 'make/calculable-capacitor-frame',
    name: 'Calculable Capacitor Frame Manufacturing', name_zh: '可计算电容框架制造',
    rate: { hours: q(40) },
    produces: [
      {
        item: 'plant/calculable-capacitor/frame',
        qty: q(1),
        gives: [
          { param: 'mass', kind: 'range', min: 150, max: 150 },
          { param: 'height', kind: 'range', min: 900, max: 900 },
          { param: 'flatness', kind: 'range', min: 0.03, max: 0.05 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(160) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '浇铸 900×500×120 mm 底座与四组 V 形座（HT250），时效 24 h',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1300, max: 1500 }],
      },
      { note_zh: '铣 V 形座与调整螺钉孔；四组座中心距 150 mm，误差 ≤0.05 mm', performedBy: 'plant/milling-machine' },
      { note_zh: '磨/刮 V 形座面，平面度 0.03–0.05 mm；座面与底面平行 0.05 mm', performedBy: 'plant/grinder' },
      {
        note_zh: '测平面度与座距：比较仪 + 量块，四组座共面 0.05 mm',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '铸铁 160 kg → 框架 1 件（150 kg）；10 kg 是浇冒口、铣屑与刮研余量（可回炉）。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **长度驱动：车差动丝杠/导轨 → 淬火 → 磨/研 → 装配/测分辨。**
     *
     *   45 钢 20 + 轴承钢 2 = 22 kg → 长度驱动 1 件（20 kg）
     *
     * 0–1 m 行程，差动丝杠 0.5/0.45 mm 螺距，手柄 500 格 → 每格 0.1 µm。
     * 它只负责「走到环隙的同一位置」；L 的绝对值由激光干涉仪直接量。
     */
    id: 'make/calculable-capacitor-length-drive',
    name: 'Calculable Capacitor Length Drive Manufacturing', name_zh: '可计算电容长度驱动制造',
    rate: { hours: q(40) },
    produces: [
      {
        item: 'plant/calculable-capacitor/length-drive',
        qty: q(1),
        gives: [
          { param: 'range', kind: 'range', min: 0, max: 1 },
          { param: 'resolution', kind: 'range', min: 0.1, max: 0.15 },
          { param: 'straightness', kind: 'range', min: 0.8, max: 1.0 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(20) }] },
      { anyOf: [{ item: 'mat/bearing-steel', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room', 'plant/comparator/lapping-plate'],
    steps: [
      { note_zh: '车差动丝杠（0.5/0.45 mm 螺距）、导轨与手柄；留 0.2 mm 磨量', performedBy: 'lathe' },
      {
        note_zh: '淬火 830–860 °C、回火 160–180 °C，丝杠/导轨硬度 58–62 HRC',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 830, max: 860 }],
      },
      { note_zh: '磨丝杠螺纹与导轨面，研到 1 µm/m 直线度', performedBy: 'plant/grinder' },
      {
        note_zh: '装配与测分辨：手柄 500 格、每格 0.1 µm；走 1 m 看回差 ≤0.2 µm',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '45 钢 20 + 轴承钢 2 = 22 kg → 长度驱动 1 件（20 kg）；2 kg 是车屑、磨屑与热处理氧化皮。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **屏蔽罩：铝 10 kg + 薄钢板 5 kg，折弯/焊接 → 装接地 → 测衰减。**
     *
     *   铝 10 + 薄钢板 5 = 15 kg → 屏蔽罩 1 件（13 kg）
     *
     * 0.9768 pF 在 10 kHz 下是 16.3 MΩ；1 pF 的杂散是 100 %，0.001 pF 就是 1000 ppm。
     * 罩 + 单点接地 + 保护环驱动，把未保护杂散压到 0.00003 pF（0.03 fF）以下。
     */
    id: 'make/calculable-capacitor-shield',
    name: 'Calculable Capacitor Shield Cover Manufacturing', name_zh: '可计算电容屏蔽罩制造',
    rate: { hours: q(16) },
    produces: [
      {
        item: 'plant/calculable-capacitor/shield',
        qty: q(1),
        gives: [
          { param: 'mass', kind: 'range', min: 13, max: 13 },
          { param: 'attenuation', kind: 'range', min: 60, max: 70 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(10) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '铝板折弯、焊接成 1.2×0.8×0.8 m 罩；钢板做外磁屏蔽', performedBy: 'plant/sheet-shop' },
      { note_zh: '装单点接地柱与保护环驱动端子；罩门用铍铜簧片压接', performedBy: 'plant/robot' },
      {
        note_zh: '衰减测试：1 MHz 源 + 探头，罩内外差 ≥60 dB；接缝处漏点用铜箔补',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '铝 10 + 薄钢板 5 = 15 kg → 屏蔽罩 1 件（13 kg）；2 kg 是折边、焊渣与开孔余料。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **可计算电容总装：框架/电极 → 对中 → 装长度驱动 → 测 L/C → 屏蔽。**
     *
     *   电极 95.3 + 保护段 2.2 + 框架 150 + 长度驱动 20 + 屏蔽 13 = 280.5 kg
     *   → 可计算电容 1 台
     *
     * 五道工序：
     *   ① 四根电极坐上 V 形座，两根固定、两根可调；对角线误差 ≤0.05 mm。
     *   ② 对中：比较仪量四根电极的间距（两两 150 mm），平行度 0.1 mm/500 mm。
     *   ③ 装长度驱动与激光靶：靶面与电极轴线垂直 0.05°。
     *   ④ 测 L/C：激光干涉仪量两个环隙的距离 L=0.500000 m；C=ε₀ln2/πL。
     *   ⑤ 屏蔽/接地：罩内单点接地，保护段接驱动。
     *
     * ⚠️ C 的 42 ppm 是**设计值**：L 的 0.04 ppm 可忽略（折射率 2.54 ppm 另修），
     * 形状/端部 30 ppm 与 0.03 fF 杂散 30 ppm 方和根 42 ppm；本层没有第二台
     * 可计算电容去交叉验证。
     */
    id: 'make/calculable-capacitor',
    name: 'Calculable Capacitor Final Assembly', name_zh: '可计算电容总装',
    rate: { hours: q(120) },
    produces: [
      {
        item: 'plant/calculable-capacitor',
        qty: q(1),
        gives: [
          { param: 'capacitance', kind: 'range', min: 0.976, max: 0.978 },
          { param: 'length', kind: 'range', min: 0.5, max: 0.5 },
          { param: 'electrodeDiameter', kind: 'range', min: 80, max: 80 },
          { param: 'uncertainty', kind: 'range', min: 40, max: 45 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/calculable-capacitor/electrode', qty: q(4) }] },
      { anyOf: [{ item: 'plant/calculable-capacitor/guard-tube', qty: q(2) }] },
      { anyOf: [{ item: 'plant/calculable-capacitor/frame', qty: q(1) }] },
      { anyOf: [{ item: 'plant/calculable-capacitor/length-drive', qty: q(1) }] },
      { anyOf: [{ item: 'plant/calculable-capacitor/shield', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/stabilized-laser', 'plant/refractometer'],
    steps: [
      {
        note_zh: '装框架与四根电极：两根固定、两根可调；对角线误差 ≤0.05 mm，V 形座不夹紧',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '对中：比较仪量四根电极两两间距 150 mm，平行度 0.1 mm/500 mm；保护段与电极同轴 ≤0.1 mm',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装长度驱动与激光靶：靶面与电极轴线垂直 0.05°；移动保护段，环隙 0.1 mm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '测 L/C：激光干涉仪量两个环隙距离 L=0.500000 m（20 nm）；C=ε₀ln2/πL=0.9768 pF，折射率修正',
        performedBy: 'plant/laser-stage',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '屏蔽/接地：罩内单点接地，保护段接驱动；未保护杂散按 0.03 fF 设计，用 100 pF 标准做替代法粗测（本层没有 0.03 fF 标准直接量）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '电极 95.3 + 保护段 2.2 + 框架 150 + 长度驱动 20 + 屏蔽 13 = 280.5 kg → 可计算电容 1 台；产物按台计，不进 kg 守恒。L=0.500000 m、C=0.9768 pF、C 的 42 ppm（形状/端部 30 + 杂散 30 + 长度 0.04）是设计值',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 二、比率桥：三件零件 + 总装
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * **比率变压器：铁芯叠片 → 绕 100:1 绕组 → 浸漆 → 装配 → 比率测试。**
     *
     *   硅钢 20 + 漆包线 5 + 酚醛 2 + 铜 2 = 29 kg → 变压器 1 件（27 kg）
     *
     * 环形铁芯没有气隙，漏磁小；100:1 的整数匝比本身精确，误差来自
     * 绕组分布电容与激磁电流（50–100 ppm）。本层只有电力变压器
     * （`std/transformer-general` 1–1000 kVA），这一台是新造的精密件。
     */
    id: 'make/ratio-bridge-transformer',
    name: 'Precision Ratio Bridge Precision Ratio Transformer Manufacturing', name_zh: '精密比率桥精密比率变压器制造',
    rate: { hours: q(48) },
    produces: [
      {
        item: 'plant/ratio-bridge/transformer',
        qty: q(1),
        gives: [
          { param: 'ratio', kind: 'range', min: 100, max: 100 },
          { param: 'ratioError', kind: 'range', min: 60, max: 80 },
          { param: 'frequency', kind: 'range', min: 1000, max: 20000 },
          { param: 'power', kind: 'range', min: 1, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-steel-3si', qty: q(20) }] },
      { anyOf: [{ item: 'mat/enamel-wire', qty: q(5) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room', 'plant/probe-station/null-detector', 'std/quartz-resonator-general', 'std/counter-chip-general'],
    steps: [
      { note_zh: '铁芯：硅钢片卷成环形（φ200/φ120×40），端面磨平', performedBy: 'plant/milling-machine' },
      { note_zh: '绕 100:1 绕组：初级 1000 匝、次级 10 匝，分层绕、层间垫酚醛', performedBy: 'plant/winder' },
      {
        note_zh: '浸酚醛、150–180 °C 固化 2 h，固定绕组与铁芯',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 150, max: 180 }],
      },
      { note_zh: '装配：装铜屏蔽、接线柱与地端子；绕组对地绝缘 ≥1 GΩ', performedBy: 'plant/robot' },
      {
        note_zh: '比率测试：100:1 加 1 kHz/10 kHz，指零法读比率误差（判据 60–80 ppm）；10:1/1000:1 抽头同测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '硅钢 20 + 漆包线 5 + 酚醛 2 + 铜 2 = 29 kg → 变压器 1 件（27 kg）；2 kg 是铁芯边角、漆包线头与浸漆挂料。产物按件计，不进 kg 守恒。比率误差 60–80 ppm 是设计值（漏磁 + 分布电容）',
  },

  {
    /**
     * **比率臂：绕电阻丝 → 退火 → 调阻 → 装配，10×100 Ω + 10×1 kΩ。**
     *
     *   电阻丝 0.5 + 氧化铝 1 + 铜线 0.2 = 1.7 kg → 比率臂 1 件（1.5 kg）
     *
     * 10 只等值电阻串/并换接，比值误差是二阶量（Σeᵢ²/2），单只 0.005 %
     * 进二阶只剩 1.25e-7。这是 `std/divider-100to1-precision` 的同一条手艺，
     * 这里要做到 1.63:1 / 100:1 / 1000:1 三档。
     */
    id: 'make/ratio-bridge-arm',
    name: 'Precision Ratio Bridge Ratio Arm Manufacturing', name_zh: '精密比率桥比率臂制造',
    rate: { hours: q(32) },
    produces: [
      {
        item: 'plant/ratio-bridge/arm',
        qty: q(1),
        gives: [
          { param: 'resistance', kind: 'range', min: 100, max: 1000 },
          { param: 'ratioError', kind: 'range', min: 40, max: 60 },
          { param: 'tempco', kind: 'range', min: 2, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '在氧化铝骨架上绕 10×100 Ω + 10×1 kΩ，四端引出', performedBy: 'plant/winder' },
      {
        note_zh: '退火 300–400 °C 2 h，去绕制应力，稳定电阻值',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 300, max: 400 }],
      },
      { note_zh: '调阻：以第 1 只为基准逐只研/切到等值，判据 0.005 %（100 Ω 上 5 mΩ）', performedBy: 'plant/comparator', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装配：装 20 只换接柱与屏蔽盒；串/并换接一次 2 min', performedBy: 'plant/robot' },
    ],
    unbalanced_zh:
      '电阻丝 0.5 + 氧化铝 1 + 铜线 0.2 = 1.7 kg → 比率臂 1 件（1.5 kg）；0.2 kg 是绕线头、调阻切屑与骨架边角。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **比率桥屏蔽：铝 5 kg + 薄钢板 5 kg，60–80 dB。**
     *
     *   铝 5 + 薄钢板 5 = 10 kg → 屏蔽 1 件（9 kg）
     *
     * 桥的平衡点是指零；0.1 pF 的杂散在 97.7 pF 上是 1000 ppm，0.01 pF 是 100 ppm，
     * 0.005 pF 才是 50 ppm。屏蔽 + 保护驱动，把 100:1 臂压到 0.005 pF 以下
     * （1 pF 臂要 0.03 fF）。
     */
    id: 'make/ratio-bridge-shield',
    name: 'Precision Ratio Bridge Shield Cover Manufacturing', name_zh: '精密比率桥屏蔽罩制造',
    rate: { hours: q(12) },
    produces: [
      {
        item: 'plant/ratio-bridge/shield',
        qty: q(1),
        gives: [
          { param: 'mass', kind: 'range', min: 9, max: 9 },
          { param: 'attenuation', kind: 'range', min: 60, max: 70 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(5) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '折弯/焊接 500×400×300 mm 铝罩 + 钢板外磁屏蔽', performedBy: 'plant/sheet-shop' },
      { note_zh: '装单点接地与保护驱动端子；接缝压接', performedBy: 'plant/robot' },
      {
        note_zh: '衰减测试：1 MHz 源，罩内外差 ≥60 dB',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '铝 5 + 薄钢板 5 = 10 kg → 屏蔽 1 件（9 kg）；1 kg 是折边与开孔余料。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **比率桥总装：装变压器/比率臂/屏蔽 → 比率校准 → 线性 → 屏蔽测试。**
     *
     *   变压器 27 + 比率臂 1.5 + 屏蔽 9 = 37.5 kg → 比率桥 1 台
     *
     * 四道工序：
     *   ① 装变压器、比率臂、换接柱；初级/次级引线双绞。
     *   ② 100:1 比率校准：用 100 pF 标准与 1 pF 可计算电容的等效代替，
     *      指零法读比率误差，判据 60–80 ppm。
     *   ③ 线性：1.63:1 / 10:1 / 100:1 / 1000:1 四档，各档误差 ≤100 ppm。
     *   ④ 屏蔽/接地测试。
     *
     * ⚠️ 比率误差 60–80 ppm 是本文件的**主项**：它同时进 C 与 R 两条传递。
     */
    id: 'make/ratio-bridge',
    name: 'Ratio Bridge Final Assembly', name_zh: '比率桥总装',
    rate: { hours: q(80) },
    produces: [
      {
        item: 'plant/ratio-bridge',
        qty: q(1),
        gives: [
          { param: 'ratio', kind: 'range', min: 1.63, max: 1000 },
          { param: 'ratioError', kind: 'range', min: 60, max: 80 },
          { param: 'measure/frequency', kind: 'range', min: 1000, max: 20000 },
          { param: 'capacitanceRange', kind: 'range', min: 0.5, max: 100 },
          { param: 'measure/accuracy', kind: 'range', min: 0, max: 500 },
          { param: 'measure/tempCoefficient', kind: 'range', min: 0, max: 50 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/ratio-bridge/transformer', qty: q(1) }] },
      { anyOf: [{ item: 'plant/ratio-bridge/arm', qty: q(1) }] },
      { anyOf: [{ item: 'plant/ratio-bridge/shield', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/probe-station/null-detector', 'std/quartz-resonator-general', 'std/counter-chip-general', 'std/dvm-general'],
    steps: [
      {
        note_zh: '装变压器、比率臂与换接柱；初级/次级引线双绞，单点接地',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '100:1 比率校准：1 pF 代替电容对 100 pF 标准，1 kHz/10 kHz 指零，读比率误差（判据 60–80 ppm）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '线性：1.63:1 / 10:1 / 100:1 / 1000:1 四档各测 3 点，误差 ≤100 ppm；超差查绕组与换接柱',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '屏蔽/接地：罩内外差 ≥60 dB；保护驱动跟随后 100 pF 臂残余 ≤0.005 pF、1 pF 臂 ≤0.00003 pF（0.03 fF）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '变压器 27 + 比率臂 1.5 + 屏蔽 9 = 37.5 kg → 比率桥 1 台；产物按台计，不进 kg 守恒。比率误差 60–80 ppm 是设计值（漏磁 40 + 分布电容 30 + 换接 10）',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 三、电流天平：五件零件 + 总装
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * **电流天平线圈：绕 500 匝 → 浸漆 → 测电阻/直径，2 只。**
     *
     *   漆包线 0.5 kg → 线圈 2 只（0.18 kg）
     *
     * 500 匝 φ0.2 mm 漆包线绕 φ200 mm 骨架，单层密绕；每只约 314 m，
     * 电阻 180–220 Ω。dM/dx ∝ N²，500 匝把 10 mA 的力抬到 7 mg。
     * 层间位置偏差 0.1 mm 就是 dM/dx 的 20–30 ppm，所以必须单层。
     */
    id: 'make/current-balance-coil',
    name: 'Current Balance Coil Manufacturing', name_zh: '电流天平的线圈制造',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'plant/current-balance/coil',
        qty: q(2),
        gives: [
          { param: 'turns', kind: 'range', min: 500, max: 500 },
          { param: 'diameter', kind: 'range', min: 200, max: 200 },
          { param: 'resistance', kind: 'range', min: 180, max: 220 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/enamel-wire', qty: q(1, 2) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '单层密绕 500 匝 φ0.2 mm 漆包线于 φ200 mm 骨架，匝间 0.05 mm', performedBy: 'plant/winder' },
      {
        note_zh: '浸酚醛、100–120 °C 固化 2 h，固定匝位',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 120 }],
      },
      {
        note_zh: '测匝数/直径/电阻：匝数 500、外径 200.0 mm、电阻 180–220 Ω；两只配对差 ≤0.1 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '漆包线 0.5 kg → 线圈 2 只（0.18 kg）；0.32 kg 是线头、浸漆挂料与绕制废线。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **线圈骨架：车/磨 φ200×120 mm 氧化铝，2 只。**
     *
     *   氧化铝 4 kg → 骨架 2 只（2.9 kg）
     *
     * 骨架直径就是线圈半径 a；dM/dx ∝ a⁴，0.1 µm/100 mm = 1 ppm 的直径
     * 误差放大到 ~4 ppm。氧化铝 α=7 ppm/K，0.1 K 是 0.7 ppm；不用铝（23 ppm/K）。
     */
    id: 'make/current-balance-former',
    name: 'Current Balance Coil Former Manufacturing', name_zh: '电流天平线圈骨架制造',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'plant/current-balance/former',
        qty: q(2),
        gives: [
          { param: 'diameter', kind: 'range', min: 200, max: 200 },
          { param: 'length', kind: 'range', min: 120, max: 120 },
          { param: 'tempco', kind: 'range', min: 0.7, max: 1.0 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/alumina', qty: q(4) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车 φ200×120 mm 氧化铝骨架，留 0.3 mm 磨量', performedBy: 'lathe' },
      { note_zh: '磨外圆到 φ200.00 mm，圆度 0.5 µm；端面平行 0.02 mm', performedBy: 'plant/grinder' },
      {
        note_zh: '测直径/长度：比较仪 3 个截面，直径 200.0 mm、长度 120.0 mm',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '氧化铝 4 kg → 骨架 2 只（2.9 kg）；1.1 kg 是车屑、磨屑与烧结余量。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **电流天平框架：浇铸 → 铣 → 装配 → 测直线度。**
     *
     *   铸铁 30 + 45 钢 10 = 40 kg → 框架 1 件（38 kg）
     *
     * 下线圈固定、上线圈挂微天平；两线圈间距 x=120 mm 由升降台定，
     * 激光干涉量到 0.1 µm。40 kg 框架把地面振动旁路；配重卸掉 3 kg 静态负载。
     */
    id: 'make/current-balance-frame',
    name: 'Current Balance Frame Manufacturing', name_zh: '电流天平框架制造',
    rate: { hours: q(32) },
    produces: [
      {
        item: 'plant/current-balance/frame',
        qty: q(1),
        gives: [
          { param: 'mass', kind: 'range', min: 38, max: 38 },
          { param: 'height', kind: 'range', min: 600, max: 600 },
          { param: 'straightness', kind: 'range', min: 0.03, max: 0.05 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(30) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(10) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '浇铸 600×400×100 mm 底座与立柱（HT250），时效 24 h',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1300, max: 1500 }],
      },
      { note_zh: '铣底座、立柱与升降台导轨面；导轨直线度 0.03–0.05 mm', performedBy: 'plant/milling-machine' },
      { note_zh: '装升降台、配重与微天平接口；配重卸掉 3 kg 静态负载', performedBy: 'plant/robot' },
      {
        note_zh: '测直线度与垂直度：比较仪，导轨 0.05 mm/m、立柱 0.1 mm/m',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '铸铁 30 + 45 钢 10 = 40 kg → 框架 1 件（38 kg）；2 kg 是浇冒口、铣屑与配重余量。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **电流天平屏蔽：铝 5 kg + 薄钢板 5 kg，40–60 dB。**
     *
     *   铝 5 + 薄钢板 5 = 10 kg → 屏蔽 1 件（9 kg）
     *
     * 10 mA 下线圈磁场 ~10⁻⁵ T；50 Hz 地磁/邻近电机扰动会感应差模电流。
     * 屏蔽 + 双绞引线 + 正反向换向，把这一项压到 10 ppm 以下。
     */
    id: 'make/current-balance-shield',
    name: 'Current Balance Shield Manufacturing', name_zh: '电流天平屏蔽制造',
    rate: { hours: q(12) },
    produces: [
      {
        item: 'plant/current-balance/shield',
        qty: q(1),
        gives: [
          { param: 'mass', kind: 'range', min: 9, max: 9 },
          { param: 'attenuation', kind: 'range', min: 45, max: 55 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(5) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '折弯/焊接 600×500×400 mm 铝罩 + 钢板外磁屏蔽', performedBy: 'plant/sheet-shop' },
      { note_zh: '装单点接地与双绞引线穿孔；接缝压接', performedBy: 'plant/robot' },
      {
        note_zh: '衰减测试：50 Hz/1 kHz 磁场探头，罩内外差 ≥40 dB',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '铝 5 + 薄钢板 5 = 10 kg → 屏蔽 1 件（9 kg）；1 kg 是折边与开孔余料。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **电流源：48 V 电池 + 10 kΩ 变阻器 + 换向开关，5–100 mA。**
     *
     *   电池单体 40 只 + 电阻丝 1 + 铜线 0.2 → 电流源 1 件（1.2 kg + 单体）
     *
     * 电流的绝对值不进公式 —— 电流天平自己量 I；电源只要在 10 min 内
     * 稳定到 20 ppm。40 只 1.2 V 单体串成 48 V，配 10 kΩ 变阻器给 5–100 mA
     * （线圈 350 Ω，总电阻 480 Ω–9.6 kΩ）；换向开关正反向各测一次，
     * 扣接触热电势与地磁偏置。
     */
    id: 'make/current-balance-supply',
    name: 'Current Balance Current Source Manufacturing', name_zh: '电流天平电流源制造',
    rate: { hours: q(8) },
    produces: [
      {
        item: 'plant/current-balance/supply',
        qty: q(1),
        gives: [
          { param: 'current', kind: 'range', min: 0, max: 120 },
          { param: 'stability', kind: 'range', min: 15, max: 25 },
          { param: 'voltage', kind: 'range', min: 0, max: 48 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/robot/battery-cell', qty: q(40) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '绕 10 kΩ 变阻器（电阻丝 + 氧化铝管），装手柄与刻度', performedBy: 'plant/winder' },
      { note_zh: '装 40 只单体电池座（串联成 48 V）、双刀双掷换向开关、0.1 A 保险与接线柱', performedBy: 'plant/robot' },
      {
        note_zh: '测稳定性：5/10/50/100 mA 各点，10 min 漂移 ≤25 ppm；换向开关接触电阻 ≤10 mΩ',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '电池单体 40 只 + 电阻丝 1 + 铜线 0.2 = 1.2 kg（按件与 kg 混计）→ 电流源 1 件（1.2 kg + 单体）；余是绕线头与接线柱边角。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **电流天平总装：装线圈/框架 → 对中 → 标定力 → 通电测试 → 屏蔽。**
     *
     *   线圈 0.18 + 骨架 2.9 + 框架 38 + 屏蔽 9 + 电流源 1.2 = 51.3 kg
     *   → 电流天平 1 台
     *
     * 五道工序：
     *   ① 下线圈固定、上线圈挂微天平；两线圈同轴 ≤0.05 mm。
     *   ② 对中：激光干涉量两线圈间距 x=120.000 mm（0.1 µm），径向偏差 ≤0.05 mm。
     *   ③ 标定力：用 10 g 硅标准 + 砝码组标微天平，再用 1/10/100 mg 砝码
     *      在 0.1–500 mg 范围看线性（砝码 1 mg–1 g，0.1 mg 靠电磁补偿内插）。
     *   ④ 通电测试：5/10/50/100 mA 四点，正反向各 3 次；力与 I² 线性 ≤100 ppm。
     *   ⑤ 屏蔽/接地。
     *
     * ⚠️ dM/dx=0.1910 N/A² 是**设计值**（几何 + μ₀）；实际用 10 mA 点的
     * 力反推，再与几何值比，差 >30 ppm 查绕组的层间位置。
     */
    id: 'make/current-balance',
    name: 'Current Balance Final Assembly', name_zh: '电流天平总装',
    rate: { hours: q(96) },
    produces: [
      {
        item: 'plant/current-balance',
        qty: q(1),
        gives: [
          { param: 'current', kind: 'range', min: 5, max: 100 },
          { param: 'force', kind: 'range', min: 0.1, max: 500 },
          { param: 'dMdx', kind: 'range', min: 0.18, max: 0.20 },
          { param: 'uncertainty', kind: 'range', min: 25, max: 35 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/current-balance/coil', qty: q(2) }] },
      { anyOf: [{ item: 'plant/current-balance/former', qty: q(2) }] },
      { anyOf: [{ item: 'plant/current-balance/frame', qty: q(1) }] },
      { anyOf: [{ item: 'plant/current-balance/shield', qty: q(1) }] },
      { anyOf: [{ item: 'plant/current-balance/supply', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/stabilized-laser', 'std/dvm-general', 'std/mass-standard-10g-si', 'std/mass-weight-set-mg'],
    steps: [
      {
        note_zh: '装下线圈/上线圈/框架：两线圈同轴 ≤0.05 mm，上线圈挂微天平，配重卸静态负载',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '对中与间距：激光干涉量 x=120.000 mm（0.1 µm），径向偏差 ≤0.05 mm',
        performedBy: 'plant/laser-stage',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '标定力：10 g 硅标准 + 砝码组标微天平；1/10/100/500 mg 四点 + 0.1 mg 内插，线性 ≤2 µg',
        performedBy: 'plant/micro-balance',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '通电测试：5/10/50/100 mA 四点，正反向各 3 次；F 与 I² 线性 ≤100 ppm，回零 ≤0.3 µg',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '屏蔽/接地：罩内外 50 Hz 差 ≥40 dB；引线双绞，单点接地',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '线圈 0.18 + 骨架 2.9 + 框架 38 + 屏蔽 9 + 电流源 1.2 = 51.3 kg → 电流天平 1 台；产物按台计，不进 kg 守恒。N=500、a=100 mm、x=120 mm → dM/dx=0.1910 N/A²；10 mA 时 F=19.10 µN=5.15 mg（火星），微天平 0.05 µg 读是 9.7 ppm',
  },

];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...VOLTAGE_ANCHOR2_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...VOLTAGE_ANCHOR2_ROUTES];
