/**
 * 半导体参数分析仪（4 SMU、±200 V、1 fA–1 A、1 µV）—— 产出路线，以及它缺的三样中间件。
 *
 * 条目本身在 `data/material/cmos-test-assets.ts`。那里写着这台仪器原来
 * **没有路线**，三笔墙：
 *
 *   ① 1 fA 是墙。本地低电流读出下限 **1 pA**（`measure/barrier-leakage`），
 *      差 **1 000 倍**；本地最好的锁相噪声约 32 fA（`particle-counter.ts`），
 *      差 32 倍；本地半导体运放的输入偏置是 **nA 级**（`analog.ts:46`），
 *      差 10⁶ 倍。低漏 JFET 全表 0 条，静电计管要 Sr 阴极 / 10 µm 栅 /
 *      老练 / 50 fA 测试四样全否（`pd-charge-amp.ts:141-197`）。
 *   ② 24 位 ADC 没有。本地 4 位 DVM（`clock.ts:73`）是 1e-4（约 13 位），
 *      差 **1 000 倍**；5 位分压 + 零位表给到 1e-5（约 17 位），仍差 100 倍。
 *   ③ ±200 V 精密源没有。本地偏压源 ±10 V（`probe-station.ts:552`），差 20 倍；
 *      `plant/hv-source-500v` 有 ±500 V / 1 V 步进（`si3n4-metrology-hardware.ts:44`），
 *      粗档够，mV 级精密档没有。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 本文件做什么：三笔墙各拆成一条路线，再把四件装成整机
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   低漏输入（筛选 MOS）→ 1 fA 前端（电荷积分 + 保护环 + PTFE + 屏蔽）
 *   5 位分压 + 零位表 + 双积分/多斜率 → 24 位 ADC（20–22 ENOB）
 *   hv-source-500v 的六件 + 100:1 精密分压 + 5 位设定 + 零位比较 → ±200 V 精密源
 *   4×(前端 + ADC + 精密源 + 电流源 + 功率级) + 控制器 → 参数分析仪
 *
 * 交付窗口（设计值，Earth 工程值）：
 *
 * | 中间件 | 分辨率 | 噪声 / 准确度 | 备注 |
 * |---|---|---|---|
 * | 低漏输入 | 栅漏 ≤1e-16 A | 噪声电流 1–10 aA | 200 只筛 4 只（2 %） |
 * | 1 fA 前端 | 0.01–1 fA | 输入偏置 ≤0.1 fA，噪声 1–10 aA | 1 fA 只在电压 ≤1 V |
 * | 24 位 ADC | 238 nV/LSB | 0.1–0.6 µV，ENOB 20–22 | 线性 1–10 ppm，绝对仍 0.1 % |
 * | ±200 V 源 | 0.1–1 mV | 绝对 0.05–0.1 %，纹波 0.1–0.5 mV | 比值/线性 0.01–0.02 % |
 * | 参数分析仪 | 4 SMU / ±200 V / 1 fA–1 A / 1 µV | —— | 1 µV 是**测量**分辨 |
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三条边界（不藏）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **1 fA 用的是筛选 MOS，不是 JFET / 静电计管。**
 *      JFET 那条路仍然没有：外延炉 0 台（`flow-and-rf.ts:90-93`），没有 JFET
 *      版图 / 器件设计，没有栅漏电指标，也没有低漏封装。这里不造管，**选管**：
 *      100 nm 栅氧的 `std/mos-transistor-general` 在 ≤10 V 下只有 1 MV/cm，
 *      远低于 FN 隧穿的 6–8 MV/cm，氧化层漏电 <1e-18 A —— 真正的漏电在
 *      封装与表面（10¹²–10¹⁴ Ω），所以筛的是**封装与表面**，不是氧化层。
 *      代价写在条目里：MOS 的 1/f 噪声比 JFET 高 5–10 倍、栅电容 2–5 pF、
 *      栅极怕 ESD。它是"能签字"的降级路线，不是 JFET。
 *
 *   ② **24 位是分辨率，不是准确度。**
 *      24 位 = 4 V / 2²⁴ = **238 nV/LSB**；单次噪声 0.3–0.6 µV（1.3–2.5 LSB）
 *      ⇒ ENOB 20–22；20 点自校准 + 256 次平均后 INL 1–10 ppm（17–20 位线性）。
 *      绝对增益仍卡在齐纳的 **±0.1 %**（`cmp-integration.ts` 的口径）——
 *      本层没有标准电压基准，那是 R9 豁免项（`plant/hv-test-bench/standard-voltage-reference`）。
 *      所以"24 位 vs 4 位 = 1 000 倍"说的是**分辨**，不是"准确 1 000 倍"。
 *
 *   ③ **±200 V 的 1 mV 是设定分辨，不是准确度。**
 *      粗档 1 V 步进、0.5–1 %；精密档靠 100:1 分压 + 5 位设定 + 零位比较，
 *      设定分辨 0.1–1 mV，比值/线性 0.01–0.02 %；绝对准确度仍是齐纳的
 *      0.05–0.1 %（200 V 上 **100–200 mV**）。分辨率 ≠ 准确度，这一条与
 *      ADC 的 ② 是同一笔账：本层最细的刻度是**时间**（石英 1e-5），
 *      最粗的绝对值是**电压基准**（齐纳 0.1 %）。
 *
 * ⚠️ 全部是**设计值**。没有 `data/measure/` 记录，
 *    不算"闭合"；本文件只回答"路线怎么写才成立"。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、三样中间件 + 它们共同的低漏输入管
// ═══════════════════════════════════════════════════════════════════════════

export const CMOS_ANALYZER_ITEMS: readonly Item[] = [
  /**
   * 低漏输入器件。**栅漏 ≤1e-16 A、输入电容 2–5 pF、输入电阻 1e16–1e17 Ω。**
   *
   * ── 它是什么、不是什么 ────────────────────────────────────────────────
   *
   * 本层没有 JFET，也没有静电计管。所以这一件**不是新造的器件**，
   * 是从 `std/mos-transistor-general` 的 200 只里**筛出来的 4 只**，
   * 再装进低漏管座（PTFE 绝缘子 + 镀金触点 + 铜屏蔽）。
   *
   * 为什么 MOS 的栅漏可以做到 1e-16 A：
   *   · 栅氧 100 nm，≤10 V 下场强 1 MV/cm，FN 隧穿要 6–8 MV/cm
   *     ⇒ 氧化层本征漏电 <1e-18 A；
   *   · 剩下的漏电是**封装与表面**：酚醛 10¹² Ω、玻璃 10¹² Ω，
   *     在 1 V 上就是 1 pA；PTFE 体积电阻 10¹⁸ Ω·cm、表面 10¹⁷ Ω/□，
   *     加保护环后把表面漏电从输入节点引走 ⇒ 1 V 上 ≤0.1 fA。
   *
   * 筛选判据（写在 `make/low-leak-input` 的工序里，这里是口径）：
   *   ① Vt 漂移 ≤20 mV / 100 h；
   *   ② 栅电容 ≤5 pF（超过就不是"低漏小电容"那一档）；
   *   ③ 125 °C / 100 h / 栅 10 V 偏置老化后，栅漏 ≤1e-16 A；
   *   ④ 1/f 噪声 ≤10 aA @ 1 Hz（短路输入、10 s 积分）。
   *
   * ⚠️ 与 JFET 的差（设计值）：1/f 噪声高 5–10 倍、栅电容 2–5 pF 对 JFET 的
   *    1–2 pF、栅极怕 ESD。这三点不进 `props`（模型没有"噪声谱形状"这一维），
   *    写在注释里；`deviceType` 只允许 `screened-mos`，不允许写成 `jfet`。
   */
  {
    id: 'plant/cmos-test/parameter-analyzer/low-leak-input',
    name: 'Parameter Analyzer Low-Leakage Input Device', name_zh: '参数分析仪低漏输入器件',
    unit: '件',
    category: 'part',
    props: [
      { param: 'gateLeakage', kind: 'range', min: 1e-18, max: 1e-12, unit: 'A', dir: 'atMost' },
      { param: 'inputCapacitance', kind: 'range', min: 1e-13, max: 1e-10, unit: 'F', dir: 'atMost' },
      { param: 'inputResistance', kind: 'range', min: 1e12, max: 1e18, unit: 'Ω', dir: 'atLeast' },
      { param: 'noiseCurrent', kind: 'range', min: 1e-18, max: 1e-12, unit: 'A/√Hz', dir: 'atMost' },
      { param: 'deviceType', kind: 'enum', values: ['screened-mos', 'jfet', 'electrometer-tube'] },
      { param: 'burnInHours', kind: 'range', min: 0, max: 1000, unit: 'h', dir: 'atLeast' },
    ],
  },

  /**
   * 1 fA 低电流前端。**1 fA–1 µA，分辨 0.01–1 fA，输入偏置 ≤0.1 fA。**
   *
   * ── 为什么是电荷积分，不是跨阻 ──────────────────────────────────────────
   *
   * 跨阻要 100 GΩ–1 TΩ 的反馈电阻，而本层 `std/resistor-network-general`
   * 最大 1 MΩ（`chip-passives.ts:381`）——**1 TΩ 不存在**。所以走另一条路：
   *
   *   I = C·dV/dt，C = 10 pF（`plant/probe-station/cap-standard` 的气容标准，
   *   ±0.15 %，几何可算），积分 10 s：
   *
   *     1 fA × 10 s / 10 pF = **1 mV**
   *
   *   24 位 ADC 的 LSB 是 238 nV ⇒ 1 fA 是 **4 200 个 LSB**；
   *   ADC 噪声 0.1–0.6 µV ⇒ 0.1–0.6 aA 的电荷噪声（10 pF × 0.1–0.6 µV / 10 s）。
   *   所以 1 fA 的信噪比是 **1 000–10 000 倍**，限制它的是**系统漏电**，
   *   不是噪声。
   *
   * 积分电容分档：10 pF（1 fA–10 pA）、100 pF（10 pA–100 pA）、1 nF（0.1–1 µA），
   * 与 `plant/probe-station/cap-standard` 的三件标准一一对应（10 pF / 100 pF / 1 nF）。
   *
   * ── 保护环、PTFE、屏蔽 ────────────────────────────────────────────────
   *
   *   保护环   由一只 unity-gain 缓冲（`std/opamp-chip-general`）驱动到与输入
   *            同电位：环与输入之间电压 ≈0，表面漏电被环引走，不进输入节点。
   *            **缓冲自己的 nA 偏置流进环，不进信号** —— 这是保护环的全部意义。
   *   PTFE     管座、支柱、同轴绝缘子；体积电阻 10¹⁸ Ω·cm、表面 10¹⁷ Ω/□，
   *            1 V 上 ≤0.1 fA。玻璃与酚醛只有 10¹² Ω，不能用在这里。
   *   屏蔽     1 mm 钢板 + 铜内衬，单点接地；60–80 dB（`make/probe-shield-box`
   *            的实测口径）。1 fA 上主要是位移电流与摩擦电，刚性三轴 + 固定
   *            走线比"再加一层铁皮"更有效。
   *
   * ── 三条边界 ──────────────────────────────────────────────────────────
   *
   *   ① **1 fA 只在 |V| ≤ 1 V 成立。** 输入绝缘 1e17 Ω，200 V 上漏电
   *      200 V / 1e17 Ω = **2 fA**；所以 200 V 档的下限是 10 fA–1 pA，
   *      不是 1 fA。这与"1 fA 是仪器的墙"不矛盾：墙在低偏压那一端。
   *   ② 10 s 积分 ⇒ 带宽 0.1 Hz；要 10 Hz（积分 0.1 s）就只剩 0.01–0.06 fA
   *      的分辨（1 fA 的信噪比从 1 000–10 000 掉到 16–100）。
   *      分辨率与速度是同一笔账（每一条电荷积分路线都是）。
   *   ③ 输入管的 1/f 噪声比 JFET 高 5–10 倍（设计值），这是选 MOS 的代价；
   *      要更好的 1/f 只有 JFET，而 JFET 没有路线（见文件头 ①）。
   */
  {
    id: 'plant/cmos-test/parameter-analyzer/femto-front-end',
    name: '1 fA Low-Current Front End', name_zh: '1 fA 低电流前端',
    unit: '件',
    category: 'part',
    props: [
      { param: 'currentRange', kind: 'range', min: 1e-16, max: 1e-6, unit: 'A' },
      { param: 'resolution', kind: 'range', min: 1e-18, max: 1e-12, unit: 'A', dir: 'atMost' },
      { param: 'inputBias', kind: 'range', min: 1e-18, max: 1e-12, unit: 'A', dir: 'atMost' },
      { param: 'bandwidth', kind: 'range', min: 0.01, max: 1e5, unit: 'Hz' },
      { param: 'noise', kind: 'range', min: 1e-18, max: 1e-12, unit: 'A', dir: 'atMost' },
      { param: 'inputResistance', kind: 'range', min: 1e12, max: 1e18, unit: 'Ω', dir: 'atLeast' },
    ],
  },

  /**
   * 24 位 ADC。**±2 V、238 nV/LSB、ENOB 20–22、INL 1–10 ppm。**
   *
   * ── 从 4 位到 24 位：差 1 000 倍，拆成两段 ──────────────────────────────
   *
   * 本地 4 位 DVM 是 1e-4（13.3 位），5 位分压 + 零位表是 1e-5（16.6 位）。
   * 24 位要 1e-7.2 —— 比 4 位 DVM 精细 **1 000 倍**，比 5 位分压精细 100 倍。
   * 所以不是"换一只表"，是把**时间**当刻度（`probe-station.ts:253` 那句
   * "电阻做不精，时间可以"）：
   *
   *   ① 双积分：R_in = 40 kΩ、C_int = 1 µF、T1 = 20 ms（一个 50 Hz 周期）。
   *      ±2 V ⇒ ±50 µA ⇒ 50 V/s，20 ms 走 1 V；用 2 V 基准反积分，
   *      100 kHz 石英计数 **2 000 个数** ⇒ 1 mV/LSB（11 位）。
   *      双积分是**比值法**：时钟、R、C 的误差在分子分母上抵消，
   *      准确度只看基准与零位。
   *   ② 多斜率残差：反积分停在零位附近，残差 ≤0.5 mV（半 LSB）。
   *      放大 ×100 ⇒ 50 mV，再用第二斜率积 20 ms、2 000 个数
   *      ⇒ **25 µV/LSB（第二级输入） = 250 nV/LSB（折算到 ADC 输入）**。
   *      两级合起来 4 V / 250 nV ≈ 2²⁴ ⇒ **24 位分辨**。
   *   ③ 第三级斜率**不加位**：它的 LSB 会到 6.25 nV，低于零位表的
   *      1 µV 分辨与 0.1–0.6 µV 噪声；它只用来做零点/线性自校准。
   *      写"三级 33 位"是纸面数字，不是这台机器。
   *
   * ── 5 位分压 + 零位比较 ───────────────────────────────────────────────
   *
   *   `plant/probe-station/null-detector` 给：齐纳 6.2 V → 同一根铜丝的
   *   5 位十进制分压（62 µV/步，比率 0.05 %）+ 动圈检流计 10 µV/格、
   *   1/10 格 = 1 µV。它在这里干两件事：
   *     · 给第二斜率的 50 mV 基准（分压比 1e-5 分辨）；
   *     · 当零位比较器（1 µV 分辨，是第二级 LSB 25 µV 的 1/25，够）。
   *
   * ── 噪声与有效位数 ──────────────────────────────────────────────────
   *
   *   40 kΩ 热噪声 25.7 nV/√Hz + 运放 e_n 20 nV/√Hz + i_n 0.5 pA/√Hz × 40 kΩ
   *   = 20 nV/√Hz ⇒ 合计 37 nV/√Hz；等效噪声带宽 1/(2T1) = 25 Hz
   *   ⇒ **185 nV rms**。加 1/f 与漂移，单次 **0.3–0.6 µV**；
   *   256 次平均 ⇒ **0.1–0.2 µV**（√256 = 16，但 1/f 地板挡住）。
   *
   *     0.6 µV 对 2 V 峰值正弦：SNR = 20log₁₀(1.414/0.6e-6) = 127.4 dB
   *     ⇒ ENOB = (127.4 − 1.76)/6.02 = **20.9 位**
   *     0.3 µV ⇒ **21.9 位**；取 **20–22 位**。
   *
   *   INL 1–10 ppm（17–20 位线性）：20 点自校准（用 5 位分压 + 零位表）
   *   + 256 次平均；不平均时 10–50 ppm。**最后 4–7 位是分辨与噪声，不是准确度。**
   *
   * ⚠️ 绝对增益 0.1 %（齐纳），与 4 位 DVM 同源；24 位是"能分辨 238 nV"，
   *    不是"能准确到 238 nV"。本层没有标准电压基准（R9 豁免项）。
   */
  {
    id: 'plant/cmos-test/parameter-analyzer/adc-24bit',
    name: '24-Bit ADC', name_zh: '24 位 ADC',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resolutionBits', kind: 'range', min: 16, max: 24, unit: 'bit' },
      { param: 'enob', kind: 'range', min: 16, max: 24, unit: 'bit' },
      { param: 'noise', kind: 'range', min: 0.01, max: 10, unit: 'µV', dir: 'atMost' },
      { param: 'inl', kind: 'range', min: 0.1, max: 100, unit: 'ppm', dir: 'atMost' },
      { param: 'sampleRate', kind: 'range', min: 0.1, max: 1000, unit: 'S/s' },
      { param: 'inputRange', kind: 'range', min: -2, max: 2, unit: 'V' },
    ],
  },

  /**
   * ±200 V 精密源。**±200 V、0.1–1 mV 设定分辨、0.05–0.1 % 绝对、0.01–0.02 % 比值。**
   *
   * ── 粗档与精密档 ──────────────────────────────────────────────────────
   *
   * 粗档用 `plant/hv-source-500v` 的六件（变压器 / 整流 / 可控硅调压 /
   * 100:1 分压 / 4½ 位表 / 机箱）——它们各有路线（`si3n4-metrology-hardware.ts`），
   * 这里只是把输出限到 ±200 V、1 V 步进。粗档的 0.5–1 % 绝对准确度不够，
   * 所以精密档不是"把粗档调细"，是**在粗档外面再套一个环**：
   *
   *   粗档（1 V 步进）→ 串联微调级（±1 V 浮地）→ 输出
   *                              ↑
   *   5 位设定（齐纳 6.2 V）→ 误差积分 ← 100:1 精密分压（10 MΩ:100 kΩ）
   *
   * ── 三个数 ────────────────────────────────────────────────────────────
   *
   *   ① **1 mV 从哪来**：100:1 分压把 200 V 变成 2 V；5 位分压的 62 µV/步
   *      乘 100 = 6.2 mV；零位表 1 µV 内插 ⇒ **0.1–1 mV**。这是"分压反馈"
   *      那一句话的全部内容：分辨率不是源给的，是**分压比 × 零位分辨**给的。
   *   ② **为什么用 10 MΩ 而不是 1 GΩ**：1 GΩ 的约翰逊噪声在 25 Hz 上是
   *      20 µV（√(4kTRB)），乘 100 = 2 mV —— 比 1 mV 分辨还大。10 MΩ 是
   *      2 µV × 100 = 200 µV，落在 1 mV 之下。粗档自己的 1 GΩ 分压只当
   *      粗监视，不进精密环。
   *   ③ **粗档误差 ±2 V 怎么被 ±1 V 微调吃掉**：先断开环，用精密分压 +
   *      零位表把粗档预调到目标 ±0.1 V（粗档的 1 V 步进保证做得到），
   *      再闭合微调环。微调级只需覆盖 ±1 V，而不是 ±2 V。
   *
   * ── 边界 ──────────────────────────────────────────────────────────────
   *
   *   · **绝对 0.05–0.1 %**（200 V 上 100–200 mV）：设定值锚在齐纳 6.2 V
   *     的 ±0.1 % 上，本层没有更好的电压标准。比值/线性 0.01–0.02 % 是
   *     分压比的自校准结果，**不是**绝对准确度。
   *   · 纹波 0.1–0.5 mV：粗档 100 Hz 纹波 10–50 mV，环在 100 Hz 的增益
   *     约 900（DC 1e4、UGBW 10 kHz）⇒ 11–55 µV；加微调级噪声取 0.1–0.5 mV。
   *   · 负载 1 nA–1 mA；微调级只承担差值，压降 ≤1 V、电流 ≤1 mA。
   */
  {
    id: 'plant/cmos-test/parameter-analyzer/hv-source-200v-precision',
    name: '±200 V Precision Source', name_zh: '±200 V 精密源',
    unit: '件',
    category: 'part',
    props: [
      { param: 'voltageRange', kind: 'range', min: -200, max: 200, unit: 'V' },
      { param: 'step', kind: 'range', min: 1e-5, max: 1, unit: 'V' },
      { param: 'accuracy', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
      { param: 'ripple', kind: 'range', min: 0, max: 100, unit: 'mV', dir: 'atMost' },
      { param: 'current', kind: 'range', min: 1e-9, max: 1e-3, unit: 'A' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、产出路线
//
// 四条零件线 + 一条整机线。每一条都从**已有**材料/零件的 id 出发；
// 新条目（low-leak-input / femto-front-end / adc-24bit / hv-source）各有路线。
// 整机路线是装配：`uses` 里全是零件，`machine_without_parts` 因此能过。
// ═══════════════════════════════════════════════════════════════════════════

export const CMOS_ANALYZER_ROUTES: readonly Route[] = [
  {
    /**
     * **低漏输入管：200 只 MOS → 初筛 → 低漏管座 → 125 °C/100 h 老化 →
     * 电荷保持法筛栅漏 → 4 只。**
     *
     *   进   MOS 200 只 + 金属壳 4 + PTFE 0.02 + 金 0.002 + 铜 0.05
     *        + 酚醛 0.05 + 钢板 0.5 + 氮 0.2 kg
     *   出   低漏输入 4 只（栅漏 ≤1e-16 A、C_in 2–5 pF、1/f ≤10 aA）
     *
     * ── 筛选判据（可签字的那四条）──────────────────────────────────────
     *
     *   ① **Vt 漂移**：125 °C / 100 h / 栅 10 V 偏置，前后 Vt 差 ≤20 mV；
     *   ② **栅电容**：≤5 pF（超过就换一只；C_in 直接进 1 fA 档的噪声）；
     *   ③ **栅漏**：电荷保持法。栅极充到 10 V、断开，10 pF 标准电容上的
     *      电压用 `plant/probe-station` 的 µV 计（1 µV）读 1000 s：
     *
     *        I = C·dV/dt = 10 pF × (10 µV / 1 s) = **1e-16 A**
     *
     *      判据 dV/dt ≤10 µV/s；1000 s 内漂 ≤10 mV。**这就是"50 fA 测试"
     *      缺失的替代路径**：不用 50 fA 源，用一只已知电容 + 一只 µV 计。
     *   ④ **1/f 噪声**：短路输入、10 s 积分，100 次读数 σ ≤10 aA。
     *
     * ── 为什么是 2 % 成品率 ───────────────────────────────────────────────
     *
     *   100 nm 栅氧的本征漏电 <1e-18 A，筛掉的是**封装/表面**：
     *   Vt 漂 >20 mV 的约 30 %、C_in >5 pF 的约 20 %、栅漏 >1e-16 A 的
     *   约 45 %、噪声超标的约 5 % ⇒ 通过率 ~2 %，200 只取 4 只。
     *   这个 2 % 是设计值：没有实测分布，按"每道筛掉一半"记账。
     *
     * ── 边界 ──────────────────────────────────────────────────────────────
     *
     *   · 不是 JFET：1/f 高 5–10 倍、C_in 2–5 pF、怕 ESD（见条目注释）。
     *   · 老练炉是 `plant/resistance-furnace`（100–1100 °C，holds 覆盖 125 °C），
     *     不是 `plant/diffusion-furnace`（900–1200 °C，太热）。
     *   · 196 只报废：不是"余料"，是筛选成本，写在 `unbalanced_zh` 里。
     */
    id: 'make/low-leak-input',
    name: 'Parameter Analyzer Low-Leakage Input Device Manufacturing', name_zh: '参数分析仪低漏输入器件制造',
    produces: [
      {
        item: 'plant/cmos-test/parameter-analyzer/low-leak-input',
        qty: q(4),
        gives: [
          { param: 'gateLeakage', kind: 'range', min: 1e-18, max: 1e-16 },
          { param: 'inputCapacitance', kind: 'range', min: 2e-12, max: 5e-12 },
          { param: 'inputResistance', kind: 'range', min: 1e16, max: 1e17 },
          { param: 'noiseCurrent', kind: 'range', min: 1e-18, max: 1e-17 },
          { param: 'deviceType', kind: 'enum', oneOf: ['screened-mos'] },
          { param: 'burnInHours', kind: 'range', min: 100, max: 200 },
        ],
      },
    ],
    uses: [
      // 200 只里筛 4 只（2 %）；这是整条路线最贵的一项
      { anyOf: [{ item: 'std/mos-transistor-general', qty: q(200) }] },
      // 低漏管座：金属壳 + PTFE 绝缘子 + 镀金触点
      { anyOf: [{ item: 'std/metal-can-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 20) }] },
      // 测试屏蔽盒（0.5 mm 钢板，单点接地）
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 2) }] },
      // 老化与测试的干燥氮气
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 5) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(140) },
    steps: [
      {
        note_zh:
          '① 初筛 200 只：Vt、跨导、栅电容；剔除 Vt 偏离标称 >20 mV 与 C_in >5 pF 的（约 40 %）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 装低漏管座：PTFE 绝缘子 + 镀金触点 + 铜屏蔽罩；管座绝缘 ≥1e16 Ω（1 V 上 ≤0.1 fA）。金触点是为了 µV 级接触没有氧化层',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 老化 125 °C / 100 h / 栅 10 V 偏置：激活可动离子、暴露氧化层缺陷；出炉后在 19–21 °C 静置 24 h 再测',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 120, max: 130 }],
      },
      {
        note_zh:
          '④ 栅漏筛选（电荷保持法）：栅极充到 10 V、断开，10 pF 标准电容上的电压用 probe-station 的 µV 计读 1000 s；dV/dt ≤10 µV/s ⇔ I = C·dV/dt ≤1e-16 A。这是"没有 50 fA 源"的替代路径',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑤ 复测 1/f 噪声（短路输入、10 s 积分、100 次 σ ≤10 aA）与 100 h 后 Vt 漂移；200 只取 4 只，其余报废',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'MOS 200 只 + 金属壳 4 + PTFE 0.02 + 金 0.002 + 铜 0.05 + 酚醛 0.05 + 钢板 0.5 + 氮 0.2 kg → 低漏输入 4 只；196 只报废（2 % 成品率），余是管壳与测试夹具的边角料。产物按件计，不折 kg',
  },

  {
    /**
     * **1 fA 前端：4 只筛选管 + 4 只 10 pF 气容 + 保护环 + PTFE + 屏蔽 → 4 件。**
     *
     *   进   低漏输入 4 + 10 pF 气容 4 + 运放 8 + 计数器 4 + 石英 1 + 齐纳 1
     *        + 氧化铝基板 4 + PTFE 0.2 + 钢板 2 + 铜 0.2 + 铜线 0.05
     *        + 金 0.002 + 酚醛 0.2 kg
     *   出   前端 4 件（1 fA–1 µA、偏置 ≤0.1 fA、噪声 1–10 aA）
     *
     * ── 四件怎么分工 ──────────────────────────────────────────────────────
     *
     *   ① 保护环基板：96 % 氧化铝（0.5 mm）+ 铜环 + PTFE 支柱。铜环由一只
     *      unity-gain 运放驱动到输入电位；环与输入之间没有电压差 ⇒ 表面漏电
     *      被环引走。运放自己的 nA 偏置流进环，**不进信号**。
     *   ② 积分电容：10 pF 空气电容标准（几何可算，±0.15 %）。三相
     *      10 pF / 100 pF / 1 nF 覆盖 1 fA–1 µA；复位开关是镀金铜簧片 +
     *      PTFE 推杆（本层没有低漏继电器条目，这是它唯一的做法）。
     *   ③ 缓冲与复位：JFET 源极跟随之后接运放（偏置 nA 被前级隔离），
     *      复位比较用齐纳 6.2 V 定阈值。
     *   ④ 屏蔽：1 mm 钢板 + 铜内衬，单点接地，与 µV 计同一点。
     *
     * ── 判据 ──────────────────────────────────────────────────────────────
     *
     *   偏置    电荷保持 1000 s，dV/dt ≤10 µV/s ⇔ ≤1e-16 A（管座+前端整机）
     *   噪声    短路输入、10 s 积分、100 次 σ ≤10 aA
     *   带宽    0.1–10 Hz（积分 1–10 s）
     *   串扰    4 通道相邻：一通道 1 nA 阶跃，邻道 ≤0.1 fA（保护环 + 屏蔽）
     *
     * ⚠️ 1 fA 只在 |V| ≤ 1 V 成立：200 V 上 1e17 Ω 的绝缘漏 2 fA。
     *    200 V 档的下限写 10 fA–1 pA，不写 1 fA。
     */
    id: 'make/femto-front-end',
    name: '1 fA Low-Current Front End Manufacturing', name_zh: '1 fA 低电流前端制造',
    produces: [
      {
        item: 'plant/cmos-test/parameter-analyzer/femto-front-end',
        qty: q(4),
        gives: [
          { param: 'currentRange', kind: 'range', min: 1e-15, max: 1e-6 },
          { param: 'resolution', kind: 'range', min: 1e-17, max: 1e-15 },
          { param: 'inputBias', kind: 'range', min: 1e-18, max: 1e-16 },
          { param: 'bandwidth', kind: 'range', min: 0.1, max: 10 },
          { param: 'noise', kind: 'range', min: 1e-18, max: 1e-17 },
          { param: 'inputResistance', kind: 'range', min: 1e16, max: 1e17 },
        ],
      },
    ],
    uses: [
      // 4 只筛选管（一条前端一只）
      { anyOf: [{ item: 'plant/cmos-test/parameter-analyzer/low-leak-input', qty: q(4) }] },
      // 4 只 10 pF 气容标准：积分电容，几何可算 ±0.15 %
      { anyOf: [{ item: 'plant/probe-station/cap-standard', qty: q(4) }] },
      // 每通道 2 只：保护环缓冲 + 复位比较/输出缓冲
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(8) }] },
      // 每通道 1 只：积分时间与复位时序
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(4) }] },
      // 4 通道共用：100 kHz 时基 + 6.2 V 复位阈值
      { anyOf: [{ item: 'std/quartz-resonator-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      // 保护环基板（96 % 氧化铝）
      { anyOf: [{ item: 'std/alumina-substrate-general', qty: q(4) }] },
      // 绝缘、屏蔽、接地、镀金触点
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 5) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(48) },
    steps: [
      {
        note_zh:
          '① 加工保护环基板：96 % 氧化铝 0.5 mm 上印铜环（宽 1 mm，环与输入间距 0.5 mm），装 PTFE 支柱；环的引线单独引出',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 装管与积分电容：4 只筛选管装进低漏管座，10 pF 气容标准的动片接输入、定片接虚地；输入走线架空、不碰基板',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 装复位开关（镀金铜簧片 + PTFE 推杆，断开电阻 ≥1e16 Ω）与保护环缓冲；缓冲输出接环，环与输入同电位',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '④ 装屏蔽：1 mm 钢板盒 + 铜内衬，单点接地；三轴输入座的外屏接机壳、内屏接保护环、芯接输入',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh:
          '⑤ 测试：电荷保持 1000 s 判偏置 ≤1e-16 A；短路输入 10 s 积分、100 次 σ ≤10 aA；邻道 1 nA 阶跃串扰 ≤0.1 fA',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '低漏输入 4 + 气容标准 4 + 运放 8 + 计数器 4 + 石英 1 + 齐纳 1 + 氧化铝基板 4 + PTFE 0.2 + 钢板 2 + 铜 0.2 + 铜线 0.05 + 金 0.002 + 酚醛 0.2 → 前端 4 件；余是基板切边、屏蔽折边与绕线边角。产物按件计',
  },

  {
    /**
     * **24 位 ADC：双积分 + 一级多斜率 + 5 位分压 + 零位比较 → 1 件。**
     *
     *   进   µV 计 1 + 4 位 DVM 1 + 运放 4 + 薄膜电容 3 + 计数器 6
     *        + 石英 1 + 齐纳 1 + 排阻 2 + 电阻丝 0.02 + 铜线 0.05
     *        + 钢板 2 + 酚醛 0.2 + 玻璃 0.1 + 端子 1
     *   出   ADC 1 件（±2 V、238 nV/LSB、ENOB 20–22、INL 1–10 ppm）
     *
     * ── 三段刻度，两个有效 ────────────────────────────────────────────────
     *
     *   第一段  ±2 V、T1 = 20 ms、100 kHz 计数 2 000 ⇒ 1 mV/LSB（11 位）
     *   第二段  残差 ≤0.5 mV ×100 = 50 mV，再 2 000 计数
     *           ⇒ 25 µV/LSB（第二级输入）= **250 nV/LSB（ADC 输入）**
     *   第三段  只做零点/线性自校准：LSB 会到 6.25 nV，低于零位表的 1 µV
     *           与 0.1–0.6 µV 噪声，**不加有效位**
     *
     *   两级合起来 4 V / 250 nV ≈ 2²⁴ ⇒ 24 位分辨。
     *   双积分是比值法：时钟 1e-5、R 与 C 的误差都在分子分母上抵消，
     *   准确度只看 2 V 基准与零位。**这是本层能做的原因**：电阻做不精，时间可以。
     *
     * ── 标定 ──────────────────────────────────────────────────────────────
     *
     *   ① 20 点线性：0 / ±0.25 / ±0.5 / ±1 / ±1.5 / ±2 V 等，用 5 位分压
     *      （62 µV/步）+ 零位表（1 µV）作参考；残差增益 ×100 与 50 mV 基准
     *      互校，把进位失配折到 INL 1–10 ppm。
     *   ② 噪声：短路输入 1 000 次，σ 0.3–0.6 µV；256 次平均 0.1–0.2 µV。
     *   ③ 与 4 位 DVM 比对：4 位是 1e-4，只作粗读与"没有跑飞"的旁证。
     *
     * ⚠️ 绝对增益 0.1 %（齐纳），不是 238 nV；24 位是分辨率。
     *    256 次平均 = 25.6 s（10 SPS），所以 24 位档是"慢速"档。
     */
    id: 'make/adc-24bit',
    name: '24-Bit ADC Manufacturing', name_zh: '24 位 ADC 制造',
    produces: [
      {
        item: 'plant/cmos-test/parameter-analyzer/adc-24bit',
        qty: q(1),
        gives: [
          { param: 'resolutionBits', kind: 'range', min: 24, max: 24 },
          { param: 'enob', kind: 'range', min: 20, max: 22 },
          { param: 'noise', kind: 'range', min: 0.1, max: 0.6 },
          { param: 'inl', kind: 'range', min: 1, max: 10 },
          { param: 'sampleRate', kind: 'range', min: 10, max: 20 },
          { param: 'inputRange', kind: 'range', min: -2, max: 2 },
        ],
      },
    ],
    uses: [
      // 5 位分压 + 零位比较：给 50 mV 第二斜率基准，并当 1 µV 零位检测
      { anyOf: [{ item: 'plant/probe-station/null-detector', qty: q(1) }] },
      // 4 位 DVM：粗读与"没有跑飞"的旁证
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      // 积分器 + ×100 残差 + 缓冲 + 零位前置
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      // 1 µF 积分 + 0.1 µF 残差 + 基准滤波
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(3) }] },
      // 6 片 4 位串成 24 位计数链
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(6) }] },
      { anyOf: [{ item: 'std/quartz-resonator-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      // 40 kΩ 输入与 ×100 增益网络（排阻的比值 0.2 %，标定后 1e-5）
      { anyOf: [{ item: 'std/resistor-network-general', qty: q(2) }] },
      // 输入电阻的微调与连线
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
      // 机箱与面板
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 10) }] },
      { anyOf: [{ item: 'std/terminal-block-8p-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh:
          '① 装积分器：40 kΩ 薄膜输入 + 1 µF 薄膜积分电容；T1 = 20 ms（一个 50 Hz 周期），±2 V 满度 ⇒ 1 V 斜坡',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 装 ×100 残差级与第二斜率：50 mV 满度、20 ms、2 000 计数 ⇒ 250 nV/LSB（折算到输入）；第三级只接零位与自校准，不进读数',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 装 24 位计数链：6 片 4 位串接，100 kHz 石英作时基；计数与复位由同一条链给出（双积分要的就是"同一只钟"）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '④ 装 5 位分压与零位比较：µV 计的 62 µV/步给出 50 mV 第二斜率基准的粗档，1 µV 零位表读回零；4 位 DVM 只作粗读',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑤ 20 点线性标定：0 / ±0.25 / ±0.5 / ±1 / ±1.5 / ±2 V，用 5 位分压 + 零位表作参考；残差增益与 50 mV 基准互校，INL 折到 1–10 ppm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑥ 噪声与过采样：短路输入 1 000 次，σ 0.3–0.6 µV；256 次平均 0.1–0.2 µV、25.6 s 一次（24 位档是慢速档）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'µV 计 1 + 4 位 DVM 1 + 运放 4 + 薄膜电容 3 + 计数器 6 + 石英 1 + 齐纳 1 + 排阻 2 + 电阻丝 0.02 + 铜线 0.05 + 钢板 2 + 酚醛 0.2 + 玻璃 0.1 + 端子 1 → ADC 1 件；余是面板开孔与绕线边角。产物按件计',
  },

  {
    /**
     * **±200 V 精密源：hv-source-500v 六件 + 100:1 精密分压 + 微调环 → 1 件。**
     *
     *   进   升压变压器 1 + 整流 1 + 调压 1 + 粗分压 1 + 4½ 位表 1 + 机箱 1
     *        + µV 计 1 + 齐纳 1 + 运放 2 + 排阻 4 + 平面管 2 + 电阻丝 0.05
     *        + 铜线 0.1 + 钢板 1 + PTFE 0.1 + 酚醛 0.2 + 接触器 1
     *   出   精密源 1 件（±200 V、0.1–1 mV、0.05–0.1 % 绝对、0.01–0.02 % 比值）
     *
     * ── 环怎么闭 ──────────────────────────────────────────────────────────
     *
     *   粗档（1 V 步进）→ 串联微调级（±1 V 浮地，平面管，1 mA）
     *                              ↑
     *   5 位设定（齐纳 6.2 V，62 µV/步）→ 误差积分 ← 100:1 分压（10 MΩ:100 kΩ）
     *
     *   ① 分压比：10 MΩ : 100 kΩ = 100:1，200 V 上给 2 V；
     *      用 5 位分压 + µV 计标到 **0.01–0.02 %**（比值，不是绝对值）。
     *   ② 设定分辨：62 µV × 100 = **6.2 mV**（5 位抽头）；µV 计的 1 µV
     *      内插到 **0.1 mV**。所以"mV 级"来自"分压比 × 零位分辨"。
     *   ③ 微调范围 ±1 V：先用精密分压 + µV 计把粗档预调到目标 ±0.1 V，
     *      再闭环；粗档 1 V 步进保证预调做得到（0.5–1 % 绝对误差被预调吃掉）。
     *   ④ 噪声：10 MΩ 的约翰逊噪声 √(4kTRB) = 2 µV（25 Hz），×100 = 200 µV；
     *      **不能用粗档的 1 GΩ 分压**（20 µV × 100 = 2 mV，比 1 mV 还大）。
     *
     * ── 判据 ──────────────────────────────────────────────────────────────
     *
     *   设定分辨  0.1–1 mV（10 点，每点用 µV 计读回）
     *   比值/线性 0.01–0.02 %（10 点对 5 位分压）
     *   绝对      0.05–0.1 %（锚在齐纳 6.2 V；200 V 上 100–200 mV）
     *   纹波      0.1–0.5 mV（100 Hz，µV 计 + 高通）
     *   耐压      1.5 kV / 1 min 不漏不爬电（`plant/hv-test-bench`）
     *
     * ⚠️ 这不是"±500 V 源的精密版"：输出限 ±200 V，绝对准确度仍是齐纳的
     *    0.1 %；0.01–0.02 % 是比值，不是绝对值。分辨率 ≠ 准确度。
     */
    id: 'make/hv-source-200v-precision',
    name: '±200 V Precision Source Manufacturing', name_zh: '±200 V 精密源制造',
    produces: [
      {
        item: 'plant/cmos-test/parameter-analyzer/hv-source-200v-precision',
        qty: q(1),
        gives: [
          { param: 'voltageRange', kind: 'range', min: -200, max: 200 },
          { param: 'step', kind: 'range', min: 1e-4, max: 1e-3 },
          { param: 'accuracy', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'ripple', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'current', kind: 'range', min: 1e-9, max: 1e-3 },
        ],
      },
    ],
    uses: [
      // 粗档六件：它们各自的路线在 si3n4-metrology-hardware.ts
      { anyOf: [{ item: 'plant/hv-source-500v/transformer', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-source-500v/rectifier', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-source-500v/regulator', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-source-500v/divider', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-source-500v/meter', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-source-500v/enclosure', qty: q(1) }] },
      // 5 位设定 + 1 µV 零位
      { anyOf: [{ item: 'plant/probe-station/null-detector', qty: q(1) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      // 误差积分 + 微调驱动
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      // 100:1 精密分压：10 MΩ : 100 kΩ（排阻 4 只一组，4 件够 10 只 1 MΩ + 2 只 50 kΩ）
      { anyOf: [{ item: 'std/resistor-network-general', qty: q(4) }] },
      // 微调级的串联调整管（浮地，1 mA）
      { anyOf: [{ item: 'std/planar-transistor-general', qty: q(2) }] },
      // 分压微调、连线、内屏蔽、高压绝缘、面板
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 5) }] },
      // 总电源开关
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/comparator', 'plant/clean-room'],
    rate: { hours: q(32) },
    steps: [
      {
        note_zh:
          '① 装粗档六件，输出限到 ±200 V（变压器次级抽头与调压限幅），保留 1 V 步进；高压走线 ≥8 mm 爬电距离',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '② 装 100:1 精密分压：10 MΩ（10 只 1 MΩ 串）: 100 kΩ（2 只 50 kΩ），装在内屏蔽盒里、PTFE 支柱；抽头走三轴',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 装误差积分与浮地微调级：运放积分器 + 平面管串联调整（±1 V、1 mA），微调级供电用变压器的一组隔离绕组',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '④ 装 5 位设定与零位比较：齐纳 6.2 V → 5 位分压（62 µV/步）→ 与精密分压抽头（0–2 V）比零；µV 计读回',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑤ 粗档预调：断开微调环，用精密分压 + µV 计把粗档调到目标 ±0.1 V；再闭合微调环，10 点（0/±1/±10/±50/±100/±200 V）读设定分辨 0.1–1 mV',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑥ 比值/线性标定：10 点对 5 位分压，比值 0.01–0.02 %；绝对准确度按齐纳 0.1 % 记（200 V 上 100–200 mV），不写成 0.01 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑦ 耐压 1.5 kV / 1 min 不漏不爬电；纹波用 µV 计 + 高通在 100 Hz 读，0.1–0.5 mV',
        performedBy: 'plant/hv-test-bench',
      },
    ],
    unbalanced_zh:
      '粗档六件 + µV 计 1 + 齐纳 1 + 运放 2 + 排阻 4 + 平面管 2 + 电阻丝 0.05 + 铜线 0.1 + 钢板 1 + PTFE 0.1 + 酚醛 0.2 + 接触器 1 → 精密源 1 件；余是屏蔽盒折边与高压线头。产物按件计',
  },

  {
    /**
     * **整机：4×(前端 + ADC + 精密源 + 电流源 + 功率级) + 控制器 + 屏蔽箱。**
     *
     *   进   前端 4 + ADC 4 + 精密源 4 + 电流源 4 + 功率级 4
     *        + 屏蔽箱 1 + 计算机 1 + 变压器 1 + 接触器 1 + 端子 2
     *        + 钢板 4 + 铜 0.3 + 铜线 0.2 + 玻璃 0.3 + 酚醛 0.5
     *        + PTFE 0.2 + 金 0.002 kg
     *   出   参数分析仪 1 台
     *
     * ── 四个 SMU 各是什么 ─────────────────────────────────────────────────
     *
     *   测量  1 fA–1 µA：前端（电荷积分，10 pF/100 pF/1 nF 三档）
     *         1 µA–1 A：电流源（1 µA–100 mA）+ 功率级（1 A）
     *   电压  ±200 V：精密源（1 mV 设定）
     *         1 µV 测量：24 位 ADC（238 nV/LSB）
     *   源    1 fA–1 µA 用积分电容的恒压斜坡：I = C·dV/dt，10 pF × 1 mV/s = 1 fA；
     *         这条路径不需要 1 TΩ 电阻，与前端同一套电容。
     *
     * ── 1 A 怎么来 ────────────────────────────────────────────────────────
     *
     *   `std/power-device-general` 是 5–1000 A 的功率管，`plant/probe-station/current-source`
     *   是 1 µA–100 mA 的恒流源。后者驱动前者的基极，hFE ≥10 ⇒ 1 A。
     *   这不是"再买一台大电流源"，是**用小电流源推功率级**——本层没有
     *   1 A 的精密恒流源，这是唯一的写法。
     *
     * ── 校准与验收 ────────────────────────────────────────────────────────
     *
     *   ① 四点电流：0 / 1 fA（10 s 积分、|V| ≤ 1 V）/ 1 pA / 1 nA，
     *      用前端自己的电荷积分与 24 位 ADC 读回；1 fA 点的误差主要来自
     *      输入偏置 0.1 fA（10 %），零点用"短路积分"扣掉。
     *   ② 电压：±200 V 用精密源自己的 100:1 分压 + µV 计；1 µV 用 µV 计
     *      在 0 V 附近读 24 位 ADC 的 LSB（238 nV，4 个 LSB = 1 µV）。
     *   ③ 1 A 档：1 A / 1 min，读功率级压降与温升；不写成"精密"。
     *   ④ 老化 100 h；验收记录写清三条边界：1 fA 只在 |V| ≤ 1 V、
     *      200 V 档下限 10 fA–1 pA、绝对准确度 0.1 %。
     *
     * ⚠️ 绝对准确度仍卡在齐纳 0.1 %，与 4 位 DVM 同源；24 位/1 fA/1 mV
     *    都是**分辨**。证书/校准仍缺：到货只做开箱通电与自检，没有 CNAS。
     */
    id: 'make/cmos-parameter-analyzer',
    name: 'Parameter Analyzer Assembly', name_zh: '参数分析仪装配',
    produces: [
      {
        item: 'plant/cmos-test/parameter-analyzer',
        qty: q(1),
        gives: [
          { param: 'smuCount', kind: 'range', min: 4, max: 4 },
          { param: 'voltageRange', kind: 'range', min: -200, max: 200 },
          { param: 'currentMin', kind: 'range', min: 1e-15, max: 1e-15 },
          { param: 'currentMax', kind: 'range', min: 1, max: 1 },
          { param: 'voltageResolution', kind: 'range', min: 1e-6, max: 1e-6 },
          { param: 'measure/leakage', kind: 'range', min: 1e-12, max: 1 },
        ],
      },
    ],
    uses: [
      // 4 个 SMU：前端 + ADC + 精密源 + 电流源 + 功率级
      { anyOf: [{ item: 'plant/cmos-test/parameter-analyzer/femto-front-end', qty: q(4) }] },
      { anyOf: [{ item: 'plant/cmos-test/parameter-analyzer/adc-24bit', qty: q(4) }] },
      { anyOf: [{ item: 'plant/cmos-test/parameter-analyzer/hv-source-200v-precision', qty: q(4) }] },
      { anyOf: [{ item: 'plant/probe-station/current-source', qty: q(4) }] },
      { anyOf: [{ item: 'std/power-device-general', qty: q(4) }] },
      // 机箱：400 × 400 屏蔽箱（60–80 dB）+ 控制器
      { anyOf: [{ item: 'plant/probe-station/shield-box', qty: q(1) }] },
      { anyOf: [{ item: 'std/computer-general', qty: q(1) }] },
      // 总电源与输出端子
      { anyOf: [{ item: 'std/transformer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/terminal-block-8p-general', qty: q(2) }] },
      // 内部分隔、母线、面板、绝缘
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(4) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 3) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 3) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 500) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    rate: { hours: q(80) },
    steps: [
      {
        note_zh:
          '① 装 4 个 SMU 机笼：前端 + ADC + 精密源 + 电流源 + 功率级各一套，四套之间用钢板隔开；每套的保护环独立走线',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 接线：三轴输入座（外屏机壳、内屏保护环、芯输入），4 个 SMU 单点共地；1 A 回路与 1 fA 前端分开走，避免地电流串进前端',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 装控制器与显示：计算机读 24 位计数链、切 4 通道、存 I-V/C-V 曲线；键盘与机械计数显示',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '④ 老化 100 h（19–21 °C，4 个 SMU 轮流 1 µA 输出）；出炉后静置 24 h',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑤ 四点电流校准：0 / 1 fA（10 s 积分、|V| ≤ 1 V）/ 1 pA / 1 nA；1 fA 点用短路积分扣零，误差按输入偏置 0.1 fA（10 %）记',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑥ 电压校准：±200 V 用精密源的 100:1 分压 + µV 计；1 µV 用 µV 计在 0 V 附近读 24 位 ADC（238 nV/LSB，4 LSB = 1 µV）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑦ 1 A 档：电流源推功率级，1 A / 1 min，读压降与温升；这一档只写"1 A 可用"，不写精密',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑧ 验收：4 SMU、1 fA–1 A、±200 V、1 µV（测量）；记录三条边界 —— 1 fA 只在 |V| ≤ 1 V、200 V 档下限 10 fA–1 pA、绝对准确度 0.1 %（齐纳）。证书/校准仍缺，这是自校不是 CNAS',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '前端 4 + ADC 4 + 精密源 4 + 电流源 4 + 功率级 4 + 屏蔽箱 1 + 计算机 1 + 变压器 1 + 接触器 1 + 端子 2 + 钢板 4 + 铜 0.3 + 铜线 0.2 + 玻璃 0.3 + 酚醛 0.5 + PTFE 0.2 + 金 0.002 → 参数分析仪 1 台；余是钣金边角与线头。产物按台计，不折 kg',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CMOS_ANALYZER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CMOS_ANALYZER_ROUTES];
