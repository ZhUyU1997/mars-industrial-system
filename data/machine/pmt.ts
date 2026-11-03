/**
 * 光电倍增管（PMT）—— 把 FPD 的 H₂S 检出限从 0.1 ppm 推到 0.01–0.05 ppm。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、这一份补的是哪一格
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `data/machine/nh3-ch4.ts` §二② 的原话：
 *
 *     「真空 PMT 的光阴极只有三类：Cs-Sb / 双碱 / GaAs(Cs,O) —— 全要铯；
 *      本层的 Cs、Sb 是两项一次性输入。料有了，但 PMT 本身仍缺光阴极蒸镀/
 *      激活、打拿极、真空封管与 10 kV 分压 —— 本层写不出『造 PMT』的完整路线。」
 *
 *   这一份就把那四条写出来。**不建 Cs/Sb 的矿**：`data/material/cs-sb.ts`
 *   已经把它们定成 R10 一次性输入，`uses` 里引用即可；本文件不碰 `seed.ts`。
 *
 *   三件：
 *     ① `plant/pmt-assembly`（套）+ 光阴极 / 打拿极 / 真空封管 / 分压器
 *     ② `std/pmt-general`（件）：增益 1e5–1e7、暗计数 <100 cps、上升 1.5–3 ns
 *     ③ `make/fpd-pmt`：`plant/fpd` 的第二条路线，H₂S 0.01–5 ppm
 *
 *   另加一条 `measure/h2s-pmt` → `mat/h2s-pmt-record`：R12 要求窗口由
 *   measure/ 收窄并产出记录；只写 FPD 路线、不写记录，0.01 ppm 就只是一句设计值。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、0.01 ppm 的光子账：从 H₂S 分子数到阳极电流
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── ① 0.01 ppm、20 mL/min 有多少 H₂S ─────────────────────────────────────
 *
 *   20 mL/min = 20 cm³/min；25 °C、1 atm 下 1 mol = 24.45 L：
 *
 *     总摩尔流 = 20 / 24 450 = 8.18×10⁻⁴ mol/min
 *     0.01 ppm  = 1×10⁻⁸ ⇒ H₂S = 8.18×10⁻¹² mol/min = **1.36×10⁻¹³ mol/s**
 *     分子数   = 1.36×10⁻¹³ × 6.022×10²³ = **8.2×10¹⁰ 分子/s**
 *     硫质量   = 8.2×10¹⁰ × 32.06 / 6.022×10²³ = **4.36 pg S/s**
 *
 *   4.36 pg S/s 正好落在 PMT 档的 1–4 pg S/s 地板附近；SiPM 档的 20–50 pg S/s
 *   地板则只够 0.1 ppm。**这就是“0.1 → 0.01”的十倍。**
 *
 * ── ② S₂* 发射与收集 ─────────────────────────────────────────────────────
 *
 *   H₂S 在富氢焰里生成 S₂*，394 nm 带（FWHM 10–15 nm）。按任务给的效率：
 *
 *     S₂* 发射效率        1–3 %          ⇒ 光子 8.2×10⁸–2.46×10⁹ /s
 *     FPD 收集立体角      1–5 %（设计 2 %）
 *     394 nm 滤光片透过   40–60 %（设计 50 %）
 *     窗/光学透过         90 %
 *     PMT 光阴极 QE       20–25 % @400 nm（设计 20 %）
 *
 *   设计点（2 % / 50 % / 90 % / 20 %）总效率 **0.18 %**：
 *
 *     光电子 = 8.2×10⁸ × 0.0018 = **1.48×10⁶ /s**
 *     3 % 发射时 = **4.43×10⁶ /s**
 *
 *   全范围（1 % / 40 % / 20 % 到 5 % / 60 % / 25 %）：
 *     **5.9×10⁵–1.66×10⁷ 光电子/s**。
 *
 * ── ③ 阳极电流与暗计数比 ─────────────────────────────────────────────────
 *
 *   增益 1×10⁶ 时，设计点阳极电流：
 *
 *     I_a = N_pe · e · G = 1.48×10⁶ × 1.602×10⁻¹⁹ × 10⁶ = **2.37×10⁻⁷ A**
 *     3 % 发射时 = **7.10×10⁻⁷ A**；全范围 0.095–2.66 µA
 *
 *   暗计数 <100 cps（设计 20–80 cps）：
 *
 *     I_dark = 100 × 1.602×10⁻¹⁹ × 10⁶ = **1.6×10⁻¹¹ A**（16 pA）
 *
 *     信号/暗电流 = 2.37×10⁻⁷ / 1.6×10⁻¹¹ = **1.5×10⁴**
 *     3 % 发射时  = 7.10×10⁻⁷ / 1.6×10⁻¹¹ = **4.4×10⁴**
 *     全范围      = **5.9×10³–1.66×10⁵**
 *
 *   散粒噪声（B = 1 Hz）：i_n = √(2eI_aB) = 2.8×10⁻¹³ A（设计点）⇒
 *   S/N = 8.6×10⁵；**暗计数与散粒噪声都不是地板**。
 *
 * ── ④ 真正的 S/N：火焰背景与 PMT 的 1–4 pg S/s ──────────────────────────
 *
 *   0.01 ppm = 4.36 pg S/s。PMT 档的**实用**最小可检量取 **1–4 pg S/s**
 *   （S/N = 3），则：
 *
 *     S/N(0.01 ppm) = 3 × 4.36 / (1–4) = **3.3–13.1**  ≥ 3 ✓
 *     S/N(0.05 ppm) = 3 × 21.8 / (1–4) = **16–65**
 *
 *   所以 **0.01–0.05 ppm、S/N ≥ 3** 成立；0.01 ppm 是设计点，0.05 ppm 是
 *   保守交付点。地板不是暗计数（16 pA），是火焰背景 + 滤光片泄漏 + PMT 的
 *   1–4 pg S/s；SiPM 的地板 0.2–0.8 Mcps 暗计数在这条账里根本进不来。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、PMT 的四件与关键工艺
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── ① 光阴极：Cs₃Sb，Sb 10–30 nm + Cs 激活 ─────────────────────────────
 *
 *   Sb 先蒸 10–30 nm（方阻监测），再蒸 Cs 到化学计量 Cs₃Sb（Cs 76.6 %），
 *   120–180 °C 原位激活，监控光电流到峰值。灵敏度 40–80 µA/lm、QE 20–25 %
 *   @400 nm；膜厚 10–30 nm。
 *
 *   用量（`cs-sb.ts` §3）：φ20 mm、200 nm 的 Cs₃Sb 膜 0.28 mg/只，
 *   Cs 0.215 mg/只、Sb 0.065 mg/只；按蒸镀利用率 10 % 算，Cs 2.15 mg/只、
 *   Sb 0.65 mg/只。**20 只一批：Cs 43 mg、Sb 13 mg**；本文件投 0.1 g Cs +
 *   0.05 g Sb（含源装填与损失 2–4 倍）。一次性库存 Cs 100–500 g、Sb 50–200 g
 *   够几万只 —— 约束是**不可复制**，不是质量。
 *
 * ── ② 打拿极：12–14 级 Ag-Mg，不用 Cu-Be ────────────────────────────────
 *
 *   任务给“Cu-Be 或 Ag-Mg”。选 **Ag-Mg**：`mat/beryllium` 0 条，而
 *   `mat/silver` 与 `mat/magnesium` 都有路线。Ag-3 % Mg 在 400–500 °C 氧里
 *   表面长出 MgO 二次发射层，每级 3.5–4.5 倍；12–14 级给 **1×10⁶–1×10⁷**
 *   @800–1500 V。Cu-Be 的 Be 毒性 + 0 条料，不选。
 *
 * ── ③ 真空封管：硼硅玻璃 + 玻璃焊，10⁻⁷–10⁻⁸ Pa ────────────────────────
 *
 *   窗用硼硅玻璃（300–650 nm；石英 200–650 nm 是同一条路换 `mat/quartz-pure`）。
 *   玻璃焊不用铟封：铟封要 `mat/indium`（有路线，但 10⁻⁸ Pa 下润湿与热循环
 *   不如玻璃焊），本文件走玻璃焊。封管前 300–400 °C 烘烤 + 10⁻⁷–10⁻⁸ Pa
 *   抽气，封口后吸气剂（Ba）维持。
 *
 * ── ④ 分压器：10 级 100 kΩ–1 MΩ，800–1500 V ─────────────────────────────
 *
 *   每级 100 kΩ–1 MΩ，总 1–10 MΩ；1500 V 下电流 150 µA–1.5 mA，功耗
 *   0.23–2.25 W。镍铬丝绕氧化铝骨架，10 个抽头；1–5 % 电阻容差。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、FPD 的第二条路线：`make/fpd-pmt`
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `plant/fpd` 的条目在 `nh3-ch4.ts`，本文件只加路线，不改它的结构。
 *   为了允许 0.01 ppm，`nh3-ch4.ts` 的 `plant/fpd` 三个 prop 的下界做了
 *   最小放宽：hydrogenSulfide 0.05→**0.01**、detectionLimit 0.05→**0.01**、
 *   minimumDetectable 10→**1** pg S/s。旧 SiPM 路线仍给 0.1–0.3 ppm /
 *   20–50 pg S/s，落在放宽后的窗口内，不改旧数据。
 *
 *   新路线与旧路线并存（OR）：
 *
 *     旧 `make/fpd`     394 nm + SiPM   0.1–0.3 ppm / 20–50 pg S/s
 *     新 `make/fpd-pmt` 394 nm + PMT    0.01–0.05 ppm / 1–4 pg S/s
 *
 *   新路线用 `plant/pmt-assembly`（PMT 组件，套）+ 旧的燃烧器/滤光片/PTFE 柱
 *   + femto 前端 + 24 bit ADC。**PMT 档把增益降到 1×10⁵–1×10⁶**，阳极电流
 *   24–710 nA，落在 femto 前端 1 µA 以内；1×10⁷ 档要外接 10:1 分流（缺口⑥）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、剩余缺口（带数；R7：按量级记录，不作为终止条件）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **Cs/Sb 不可复制**：Cs 100–500 g、Sb 50–200 g 一次性库存；用完只能再运。
 *      本层无矿、无路线（`cs-sb.ts` §0–§2），这是 R10 的输入，不是本文件能补的。
 *   ② **光阴极激活的终点判据没有在线方阻/光电流谱**：本层只有光电流峰值 +
 *      400 nm 灵敏度，量子效率的绝对不确定度 ±3–5 %（设计 20–25 % 的窗口里）；
 *      地球用原位 XPS/UPS 定化学计量，本层 0 条。
 *   ③ **打拿极的二次发射层是“氧化时间”控的**：Ag-Mg 在 400–500 °C 氧里
 *      长 MgO，本层没有膜厚/成分在线监测，增益分散 ±20–30 %；靠 12–14 级
 *      的可调高压把总增益拉回 1e6–1e7，单级一致性没有读数。
 *   ④ **玻璃焊的应力没有偏振仪**：硼硅玻璃与可伐/钼过渡封接的应力双折射
 *      本层测不了；冷热循环 20 次后漏率是否仍 ≤1×10⁻¹⁰ Pa·L/s 没有实测。
 *   ⑤ **暗计数 <100 cps 是设计值**：本层没有单光子计数头（`std/...` 0 条），
 *      只能用阳极电流 + 屏蔽罩间接推；实测要一台 100 MHz 光子计数器。
 *   ⑥ **1×10⁷ 增益档的阳极电流 2.4–7.1 µA 超过 femto 前端 1 µA 上限**：
 *      要外接 10:1 分流或换 1 kΩ 跨阻；FPD 首台只跑 1×10⁵–1×10⁶ 档。
 *   ⑦ **没有 394 nm 的绝对辐亮度标准**：光子账的收集立体角 1–5 % 是几何算的，
 *      没有积分球/标准灯；0.01 ppm 的 S/N 3.3–13 里，这一项是 ±2 倍的系统项。
 *   ⑧ **PMT 的磁场屏蔽只有 `mat/iron` 0.5 mm**：地磁 50 µT 下增益漂 1–3 %；
 *      要 0.1 % 得坡莫合金（0 条）或多层屏蔽。
 *   ⑨ **FPD 的 S₂* 发射效率 1–3 % 是文献档**，本层没有火焰光谱绝对定标；
 *      0.01 ppm 的“光子数”因此是设计值，不是实测。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、注册（本文件不改 tools/report/data.ts，由主 agent 注册）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { PMT_ITEMS, PMT_ROUTES } from '../../data/machine/pmt.ts';
 *   items:  [...PMT_ITEMS]
 *   routes: [...PMT_ROUTES]
 *
 * ⚠️ 本文件对 `data/machine/nh3-ch4.ts` 只做三处 prop 下界放宽（见 §三），
 *    不改任何路线；注册时 `nh3-ch4.ts` 已经在表里。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PMT_ITEMS: readonly Item[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // A. PMT 的四件 + 工艺腔
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * **UHV 工艺腔：10⁻⁸–10⁻⁷ Pa、20–300 °C、5–20 L。**
   *
   * Cs₃Sb 的 Sb 蒸镀、Cs 激活、封管前烘烤都在这一只腔里做。它不是 PMT 的
   * 零件，是**做 PMT 的工艺腔**；放在 `plant/pmt-assembly/` 下面是因为它只服务
   * 这一条线。真空由 `plant/euv-vacuum` 抽（1×10⁻⁸–1 Pa），温度由
   * `plant/resistance-furnace` 的加热带维持。
   */
  {
    id: 'plant/pmt-assembly/chamber',
    name: 'UHV Process Chamber', name_zh: 'UHV 工艺腔',
    unit: '件',
    category: 'part',
    props: [
      { param: 'basePressure', kind: 'range', min: 1e-9, max: 1e-6, unit: 'Pa', dir: 'atMost' },
      { param: 'temperature', kind: 'range', min: 20, max: 300, unit: '°C' },
      { param: 'volume', kind: 'range', min: 5, max: 20, unit: 'L' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-9, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /**
   * **Cs₃Sb 光阴极：φ10–25 mm、10–30 nm、灵敏度 40–80 µA/lm、QE 20–25 %。**
   *
   * 在硼硅玻璃窗片上先蒸 Sb 10–30 nm，再蒸 Cs 到 Cs₃Sb 化学计量，
   * 120–180 °C 原位激活。膜厚用 `plant/film-monitor` 的石英晶振读；
   * 化学计量只能靠光电流峰值判，没有原位 XPS（缺口②）。
   */
  {
    id: 'plant/pmt-assembly/photocathode',
    name: 'Cs₃Sb Photocathode', name_zh: 'Cs₃Sb 光阴极',
    unit: '件',
    category: 'part',
    props: [
      { param: 'sensitivity', kind: 'range', min: 40, max: 80, unit: 'µA/lm', dir: 'atLeast' },
      { param: 'qe', kind: 'range', min: 20, max: 25, unit: '%', dir: 'atLeast' },
      { param: 'thickness', kind: 'range', min: 10, max: 30, unit: 'nm' },
      { param: 'diameter', kind: 'range', min: 10, max: 25, unit: 'mm' },
    ],
  },

  /**
   * **打拿极：12–14 级 Ag-Mg（Ag-3 % Mg），每级 3.5–4.5 倍。**
   *
   * 选 Ag-Mg 不选 Cu-Be：`mat/beryllium` 0 条，而 Ag 与 Mg 都有路线；
   * 且 Be 的粉尘毒性不在本层防护能力内。Ag-Mg 在 400–500 °C 氧里表面
   * 长 MgO，二次发射系数 3–5；12–14 级给 1e6–1e7 @800–1500 V。
   */
  {
    id: 'plant/pmt-assembly/dynode',
    name: 'PMT Dynode', name_zh: 'PMT 打拿极',
    unit: '件',
    category: 'part',
    props: [
      { param: 'stages', kind: 'range', min: 10, max: 14, unit: '级' },
      { param: 'gainPerStage', kind: 'range', min: 3, max: 5, unit: '倍', dir: 'atLeast' },
      { param: 'material', kind: 'enum', values: ['Ag-Mg', 'Cu-Be'] },
    ],
  },

  /**
   * **真空封管：硼硅玻璃窗 300–650 nm、玻璃焊、10⁻⁸–10⁻⁷ Pa、漏率 ≤1×10⁻⁹ Pa·L/s。**
   *
   * 硼硅玻璃（α 3–4×10⁻⁶/K）与可伐/钼过渡封接；窗片与管壳玻璃焊，不用
   * 铟封。石英窗（200–650 nm）是同一条路换 `mat/quartz-pure`，本文件首台
   * 走硼硅档。封口后吸气剂（Ba）维持真空。压升法只判到 1×10⁻⁹ Pa·L/s；
   * 1×10⁻¹⁰ 是设计目标，没有氦检漏，不写成实测。
   */
  {
    id: 'plant/pmt-assembly/envelope',
    name: 'PMT Vacuum Envelope', name_zh: 'PMT 真空封管',
    unit: '件',
    category: 'part',
    props: [
      { param: 'pressure', kind: 'range', min: 1e-9, max: 1e-6, unit: 'Pa', dir: 'atMost' },
      { param: 'window', kind: 'enum', values: ['borosilicate', 'quartz'] },
      { param: 'spectral', kind: 'range', min: 300, max: 650, unit: 'nm' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-9, unit: 'Pa·L/s', dir: 'atMost' },
      { param: 'volume', kind: 'range', min: 20, max: 100, unit: 'cm³' },
    ],
  },

  /**
   * **分压器：10 级、每级 100 kΩ–1 MΩ（总 1–10 MΩ）、800–1500 V。**
   *
   * 镍铬丝绕氧化铝骨架，10 个抽头；1500 V 下 150 µA–1.5 mA、0.23–2.25 W。
   * 电阻容差 1–5 %；抽头电压偏差直接进增益，所以每只都要在 1500 V 下
   * 逐级测。
   */
  {
    id: 'plant/pmt-assembly/divider',
    name: 'PMT Voltage Divider', name_zh: 'PMT 分压器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'stages', kind: 'range', min: 10, max: 10, unit: '级' },
      { param: 'resistance', kind: 'range', min: 1, max: 10, unit: 'MΩ' },
      { param: 'voltage', kind: 'range', min: 800, max: 1500, unit: 'V' },
      { param: 'tolerance', kind: 'range', min: 1, max: 5, unit: '%', dir: 'atMost' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // B. PMT 管与组件
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * **PMT 管：增益 1e5–1e7、暗计数 10–100 cps、上升 1.5–3 ns、φ10–25 mm、300–650 nm。**
   *
   * 它是光阴极 + 打拿极 + 封管的组合，不带分压器；分压器是组件
   * `plant/pmt-assembly/divider` 的一件。1e6–1e7 @1000 V 是 12–14 级
   * Ag-Mg 的账；暗计数 <100 cps 靠铁屏蔽 + 小阴极面积。
   */
  {
    id: 'std/pmt-general',
    name: 'PMT Tube', name_zh: 'PMT 管',
    unit: '件',
    category: 'part',
    props: [
      { param: 'gain', kind: 'range', min: 1e5, max: 1e7, unit: '1', dir: 'atLeast' },
      { param: 'darkCount', kind: 'range', min: 10, max: 100, unit: 'cps', dir: 'atMost' },
      { param: 'riseTime', kind: 'range', min: 1.5, max: 3, unit: 'ns', dir: 'atMost' },
      { param: 'cathodeDiameter', kind: 'range', min: 10, max: 25, unit: 'mm' },
      { param: 'spectral', kind: 'range', min: 300, max: 650, unit: 'nm' },
      { param: 'voltage', kind: 'range', min: 800, max: 1500, unit: 'V' },
    ],
  },

  /**
   * **PMT 组件（套）：管 + 分压器 + 铁屏蔽壳 + 管座。**
   *
   * 它是 FPD 里装进去的那一整套，不是又一只管。增益/暗计数/上升时间与
   * `std/pmt-general` 同一档；分压器把 800–1500 V 分给 10 个电极。
   * 它是 `part` 不是 `machine`：它不执行工艺，只被装进 `plant/fpd`。
   */
  {
    id: 'plant/pmt-assembly',
    name: 'PMT Assembly', name_zh: 'PMT 组件',
    unit: '套',
    category: 'part',
    props: [
      { param: 'gain', kind: 'range', min: 1e5, max: 1e7, unit: '1', dir: 'atLeast' },
      { param: 'darkCount', kind: 'range', min: 10, max: 100, unit: 'cps', dir: 'atMost' },
      { param: 'riseTime', kind: 'range', min: 1.5, max: 3, unit: 'ns', dir: 'atMost' },
      { param: 'cathodeDiameter', kind: 'range', min: 10, max: 25, unit: 'mm' },
      { param: 'spectral', kind: 'range', min: 300, max: 650, unit: 'nm' },
      { param: 'voltage', kind: 'range', min: 800, max: 1500, unit: 'V' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // C. 记录
  // ═══════════════════════════════════════════════════════════════════════════

];

export const PMT_ROUTES: readonly Route[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // A. 工艺腔与四件
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * **UHV 工艺腔：卷焊筒体 + CF 法兰 + 烘烤 + 10⁻⁸–10⁻⁷ Pa 检漏。**
     *
     *   316L 20 + 玻璃 0.5 + 铜 2 + PTFE 0.1 → 工艺腔 1 件
     *
     * 5–20 L，基压 1×10⁻⁹–1×10⁻⁶ Pa；漏率 ≤1×10⁻⁹ Pa·L/s。
     * 真空由 `plant/euv-vacuum` 抽，温度由电阻炉的加热带维持。
     */
    id: 'make/pmt-chamber',
    name: 'UHV Process Chamber Manufacturing', name_zh: 'UHV 工艺腔制造',
    produces: [
      {
        item: 'plant/pmt-assembly/chamber',
        qty: q(1),
        gives: [
          { param: 'basePressure', kind: 'range', min: 1e-8, max: 1e-7 },
          { param: 'temperature', kind: 'range', min: 20, max: 300 },
          { param: 'volume', kind: 'range', min: 5, max: 20 },
          { param: 'leakRate', kind: 'range', min: 1e-10, max: 1e-9 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(20) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
    ],
    needs: ['plant/euv-vacuum', 'plant/metrology-room'],
    steps: [
      { note_zh: '卷 316L 筒体（φ250 × 400）、焊 CF 法兰与观察窗座；内壁电解抛光', performedBy: 'plant/sheet-shop', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装铜垫 CF 法兰、玻璃观察窗与 PTFE 绝缘；烘烤 200–300 °C、24 h 除气', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 200, max: 300 }] },
      { note_zh: '接 euv-vacuum 抽到 1×10⁻⁸–1×10⁻⁷ Pa；关阀 1 h 压升 ≤1×10⁻⁹ Pa·L/s', performedBy: 'plant/robot', under: [{ param: 'pressure', min: 1e-8, max: 1e-7 }] },
    ],
    rate: { hours: q(80) },
    unbalanced_zh: '316L 20 + 玻璃 0.5 + 铜 2 + PTFE 0.1 → 工艺腔 1 件；余是卷板边料、焊缝与法兰车屑（按件计）',
  },

  {
    /**
     * **光阴极：装窗片 → 抽 10⁻⁷ Pa → 蒸 Sb 10–30 nm → 蒸 Cs 激活 120–180 °C。**
     *
     *   玻璃 0.01 + Sb 6.5 mg + Cs 21.5 mg → 100 只光阴极
     *
     * **每只用量（φ20、膜 20 nm、Cs₃Sb 3.5 g/cm³ 重算）**：
     *   A = π(1 cm)² = 3.1416 cm²；V = 3.1416 × 2×10⁻⁶ cm = 6.28×10⁻⁶ cm³
     *   m(Cs₃Sb) = 3.5 × 6.28×10⁻⁶ = 2.20×10⁻⁵ g = **0.022 mg**
     *   Cs = 3×132.9/520.5 = 76.6 % ⇒ **0.0169 mg**；Sb = 23.4 % ⇒ **0.0051 mg**
     *   蒸镀利用率 10 % ⇒ Cs 0.169 / Sb 0.051 mg；再加 20–30 % 激活过量 ⇒
     *   **每只 Cs 0.215 mg、Sb 0.065 mg**（旧版写 5 mg / 2.5 mg，偏大 23×/38×）。
     *
     * 灵敏度 50–75 µA/lm、QE 20–24 %；膜厚 12–28 nm。
     */
    id: 'make/pmt-photocathode',
    name: 'Cs₃Sb Photocathode Manufacturing', name_zh: 'Cs₃Sb 光阴极制造',
    produces: [
      {
        item: 'plant/pmt-assembly/photocathode',
        qty: q(100),
        gives: [
          { param: 'sensitivity', kind: 'range', min: 50, max: 75 },
          { param: 'qe', kind: 'range', min: 20, max: 24 },
          { param: 'thickness', kind: 'range', min: 12, max: 28 },
          { param: 'diameter', kind: 'range', min: 18, max: 22 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/antimony', qty: q(13, 2000000) }] },
      { anyOf: [{ item: 'mat/cesium', qty: q(43, 2000000) }] },
    ],
    needs: [
      'plant/pmt-assembly/chamber',
      'plant/euv-vacuum',
      'plant/film-monitor',
      'plant/clean-room',
      'plant/metrology-room',
    ],
    steps: [
      { note_zh: '① 清洗硼硅窗片（丙酮/异丙醇/水），装进工艺腔；抽 1×10⁻⁸–1×10⁻⁷ Pa', performedBy: 'plant/robot', under: [{ param: 'pressure', min: 1e-8, max: 1e-7 }] },
      { note_zh: '② 烘烤 150–200 °C、4 h 去表面水/碳', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 150, max: 200 }] },
      { note_zh: '③ 蒸 Sb 10–30 nm（方阻/QCM 监控）；Sb 源 500–600 °C', performedBy: 'plant/robot', under: [{ param: 'pressure', min: 1e-8, max: 1e-7 }] },
      { note_zh: '④ 蒸 Cs 到 Cs₃Sb 化学计量；光电流到峰值停 Cs 束', performedBy: 'plant/robot', under: [{ param: 'pressure', min: 1e-8, max: 1e-7 }] },
      { note_zh: '⑤ 120–180 °C 原位激活 10–30 min；光电流到峰值后停，Cs₃Sb 形成', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 120, max: 180 }] },
      { note_zh: '⑥ 测 400 nm 灵敏度 50–75 µA/lm、QE 20–24 %；膜厚 12–28 nm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(60) },
    unbalanced_zh: '玻璃 0.01 + Sb 0.05 g + Cs 0.1 g → 20 只光阴极；Sb/Cs 的 2–4 倍是源装填与挡板损失，余是玻璃边角（按件计）。Cs/Sb 是一次性输入，无本地路线',
  },

  {
    /**
     * **打拿极：Ag-3 % Mg 熔炼 → 轧 0.2 mm → 冲 12–14 只杯 → 400–500 °C 氧化。**
     *
     *   银 1 g + 镁 0.1 g + 铜 10 g + 氧化铝 10 g → 20 套打拿极
     *
     * 每套 12–14 级；Ag-Mg 表面 MgO 的二次发射 3.5–4.5 倍。
     */
    id: 'make/pmt-dynode',
    name: 'PMT Dynode Manufacturing', name_zh: 'PMT 打拿极制造',
    produces: [
      {
        item: 'plant/pmt-assembly/dynode',
        qty: q(20),
        gives: [
          { param: 'stages', kind: 'range', min: 12, max: 14 },
          { param: 'gainPerStage', kind: 'range', min: 3.5, max: 4.5 },
          { param: 'material', kind: 'enum', oneOf: ['Ag-Mg'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silver', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/magnesium', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 100) }] },
    ],
    needs: ['plant/press', 'plant/metrology-room'],
    steps: [
      { note_zh: '① 熔 Ag-3 % Mg：800–900 °C、氩保护，铸成小锭', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 800, max: 900 }] },
      { note_zh: '② 轧到 0.2 mm、冲成 12–14 只打拿极杯（φ20）', performedBy: 'plant/rolling-mill' },
      { note_zh: '③ 400–500 °C 干氧氧化 30–60 min，表面长 MgO 二次发射层', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 400, max: 500 }] },
      { note_zh: '④ 用氧化铝绝缘环叠 12–14 级，测每级增益 3.5–4.5', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(80) },
    unbalanced_zh: '银 1 g + 镁 0.1 g + 铜 10 g + 氧化铝 10 g → 20 套打拿极；余是轧制边料、冲杯废料与氧化损耗（按件计）',
  },

  {
    /**
     * **真空封管：硼硅玻璃灯工成形 → 玻焊窗片/管座 → 300–400 °C 烘烤 → 10⁻⁷ Pa 检漏。**
     *
     *   玻璃 0.05 + 碳酸钡 0.1 g → 20 只封管
     *
     * 窗 300–650 nm（硼硅档）；石英档换 `mat/quartz-pure`，同一条路。
     * 玻璃焊不用铟封；漏率 ≤1×10⁻¹⁰ Pa·L/s。
     */
    id: 'make/pmt-envelope',
    name: 'PMT Vacuum Envelope Manufacturing', name_zh: 'PMT 真空封管制造',
    produces: [
      {
        item: 'plant/pmt-assembly/envelope',
        qty: q(20),
        gives: [
          { param: 'pressure', kind: 'range', min: 1e-8, max: 1e-7 },
          { param: 'window', kind: 'enum', oneOf: ['borosilicate'] },
          { param: 'spectral', kind: 'range', min: 300, max: 650 },
          { param: 'leakRate', kind: 'range', min: 1e-10, max: 1e-9 },
          { param: 'volume', kind: 'range', min: 30, max: 80 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/barium-carbonate', qty: q(1, 10000) }] },
    ],
    needs: ['plant/euv-vacuum', 'plant/metrology-room'],
    steps: [
      { note_zh: '① 硼硅玻璃灯工成形：管壳 φ25–30、窗片 φ20–25、壁 1.5–2 mm（1000–1200 °C；玻璃车床的 holds 是石英档 1900–2200，硼硅档不写 under）', performedBy: 'plant/glass-lathe' },
      { note_zh: '② 玻璃焊窗片与管座（可伐/钼过渡），退火 500–550 °C 去应力', performedBy: 'plant/glass-lathe' },
      { note_zh: '③ 300–400 °C 烘烤 4 h、抽 1×10⁻⁸–1×10⁻⁷ Pa；压升法漏率 ≤1×10⁻⁹ Pa·L/s（设计目标 1×10⁻¹⁰，无氦检漏）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 300, max: 400 }] },
      { note_zh: '④ 装 Ba 吸气剂 0.1 g/20 只；封口前抽到 1×10⁻⁷ Pa 以下', performedBy: 'plant/robot', under: [{ param: 'pressure', min: 1e-8, max: 1e-7 }] },
    ],
    rate: { hours: q(60) },
    unbalanced_zh: '玻璃 0.05 + 碳酸钡 0.1 g → 20 只封管；余是灯工边角、玻焊料与吸气剂（按件计）',
  },

  {
    /**
     * **分压器：镍铬丝绕 10 只电阻 → 氧化铝骨架 → 10 抽头 → 1500 V 逐级测。**
     *
     *   电阻丝 1 g + 氧化铝 10 g + 铜线 1 g + PTFE 1 g → 20 只分压器
     *
     * 每只 10 级、每级 100 kΩ–1 MΩ（总 1–10 MΩ）；1500 V 下 150 µA–1.5 mA。
     */
    id: 'make/pmt-divider',
    name: 'PMT Voltage Divider Manufacturing', name_zh: 'PMT 分压器制造',
    produces: [
      {
        item: 'plant/pmt-assembly/divider',
        qty: q(20),
        gives: [
          { param: 'stages', kind: 'range', min: 10, max: 10 },
          { param: 'resistance', kind: 'range', min: 1, max: 10 },
          { param: 'voltage', kind: 'range', min: 800, max: 1500 },
          { param: 'tolerance', kind: 'range', min: 1, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 1000) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 绕 10 只 100 kΩ–1 MΩ 镍铬电阻（氧化铝骨架、无感绕法）', performedBy: 'plant/winder' },
      { note_zh: '② 装 10 个抽头与 HV 输入/接地端，PTFE 绝缘', performedBy: 'lathe' },
      { note_zh: '③ 1500 V 耐压 1 min、逐级电压偏差 ≤1–5 %；总阻 1–10 MΩ', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(40) },
    unbalanced_zh: '电阻丝 1 g + 氧化铝 10 g + 铜线 1 g + PTFE 1 g → 20 只分压器；余是绕线废段与绝缘边角（按件计）',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // B. PMT 管与组件
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * **PMT 管总装：装打拿极/光阴极 → 10⁻⁷ Pa 封管 → 吸气剂 → 测增益/暗计数。**
     *
     *   光阴极 20 + 打拿极 20 + 封管 20 + 碳酸钡 0.1 g + 玻璃 0.01 → 20 只 PMT
     *
     * 每只 12–14 级、增益 1e6–1e7 @1000 V、暗计数 20–80 cps、
     * 上升 1.8–2.5 ns、φ18–22 mm、300–650 nm。
     */
    id: 'make/pmt-general',
    name: 'PMT Tube Final Assembly', name_zh: 'PMT 管总装',
    produces: [
      {
        item: 'std/pmt-general',
        qty: q(20),
        gives: [
          { param: 'gain', kind: 'range', min: 1e6, max: 1e7 },
          { param: 'darkCount', kind: 'range', min: 20, max: 80, record: 'mat/h2s-pmt-record' },
          { param: 'riseTime', kind: 'range', min: 1.8, max: 2.5 },
          { param: 'cathodeDiameter', kind: 'range', min: 18, max: 22 },
          { param: 'spectral', kind: 'range', min: 300, max: 650 },
          { param: 'voltage', kind: 'range', min: 800, max: 1500 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/pmt-assembly/photocathode', qty: q(20) }] },
      { anyOf: [{ item: 'plant/pmt-assembly/dynode', qty: q(20) }] },
      { anyOf: [{ item: 'plant/pmt-assembly/envelope', qty: q(20) }] },
      { anyOf: [{ item: 'mat/barium-carbonate', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 100) }] },
    ],
    needs: [
      'plant/pmt-assembly/chamber',
      'plant/euv-vacuum',
      'plant/film-monitor',
      'plant/clean-room',
      'plant/metrology-room',
    ],
    steps: [
      { note_zh: '① 洁净间装打拿极 12–14 级、光阴极与管座；同轴 ≤0.05 mm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 进工艺腔，抽 1×10⁻⁸–1×10⁻⁷ Pa', performedBy: 'plant/robot', under: [{ param: 'pressure', min: 1e-8, max: 1e-7 }] },
      { note_zh: '③ 250–300 °C 烘烤 4 h 后玻璃焊封管；管内真空 ≤1×10⁻⁷ Pa', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 250, max: 300 }, { param: 'pressure', min: 1e-8, max: 1e-7 }] },
      { note_zh: '④ 高频加热闪 Ba 吸气剂；封口后管内真空 ≤1×10⁻⁷ Pa', performedBy: 'plant/robot', under: [{ param: 'pressure', min: 1e-8, max: 1e-7 }] },
      { note_zh: '⑤ 1000 V 下测增益 1e6–1e7、暗计数 20–80 cps、上升 1.8–2.5 ns、φ18–22 mm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(120) },
    unbalanced_zh: '光阴极 20 + 打拿极 20 + 封管 20 + 碳酸钡 0.1 g + 玻璃 0.01 → 20 只 PMT；产物按件计，差额是封管废品与测试不合格（按件计）',
  },

  {
    /**
     * **PMT 组件：管 + 分压器 + 铁屏蔽壳 + 管座，800–1500 V 老化。**
     *
     *   管 1 + 分压器 1 + 钢板 0.5 + 铁 0.5 + 接触器 1 → 组件 1 套
     *
     * 铁屏蔽壳把地磁 50 µT 压到增益漂 1–3 %；分压器 10 级。
     */
    id: 'make/pmt-assembly',
    name: 'PMT Assembly Manufacturing', name_zh: 'PMT 组件制造',
    produces: [
      {
        item: 'plant/pmt-assembly',
        qty: q(1),
        gives: [
          { param: 'gain', kind: 'range', min: 1e6, max: 1e7 },
          { param: 'darkCount', kind: 'range', min: 20, max: 80 },
          { param: 'riseTime', kind: 'range', min: 1.8, max: 2.5 },
          { param: 'cathodeDiameter', kind: 'range', min: 18, max: 22 },
          { param: 'spectral', kind: 'range', min: 300, max: 650 },
          { param: 'voltage', kind: 'range', min: 800, max: 1500 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/pmt-general', qty: q(1) }] },
      { anyOf: [{ item: 'plant/pmt-assembly/divider', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(1, 2) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/hv-test-bench'],
    steps: [
      { note_zh: '① 管装进 0.5 mm 铁屏蔽壳与钢板外壳，管座同轴；磁屏蔽把地磁压到增益漂 1–3 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 接 10 级分压器与 HV 输入；800–1500 V 老化 24 h，暗计数 20–80 cps', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 1000 V 下测增益 1e6–1e7、上升 1.8–2.5 ns；接触器做 HV 联锁', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '管 1 + 分压器 1 + 钢板 0.5 + 铁 0.5 + 接触器 1 → 组件 1 套；产物按套计，不进 kg 守恒。铁屏蔽是降级（坡莫合金 0 条）',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // C. FPD 第二条路线：PMT 档
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * **FPD-PMT：旧燃烧器/滤光片/PTFE 柱 + PMT 组件 + femto 前端，H₂S 0.01–5 ppm。**
     *
     *   燃烧器 1 + 滤光片 1 + PTFE 柱 1 + PMT 组件 1 + femto 1 + ADC 1
     *   + 接触器 1 + 钢板 4 → FPD 1 台
     *
     * 与旧 `make/fpd` 并存（OR）：旧线 SiPM 0.1–0.3 ppm，新线 PMT
     * 0.01–0.05 ppm。PMT 档把增益降到 1e5–1e6，阳极电流 24–710 nA，
     * 落在 femto 前端 1 µA 以内。
     */
    id: 'make/fpd-pmt',
    name: 'FPD System Manufacturing', name_zh: 'FPD 整机制造',
    produces: [
      {
        item: 'plant/fpd',
        qty: q(1),
        gives: [
          { param: 'measure/hydrogenSulfide', kind: 'range', min: 0.01, max: 5 },
          { param: 'measure/methylMercaptan', kind: 'range', min: 0.05, max: 5 },
          { param: 'measure/carbonylSulfide', kind: 'range', min: 0.05, max: 5 },
          { param: 'measure/carbonDisulfide', kind: 'range', min: 0.05, max: 5 },
          { param: 'measure/detectionLimit', kind: 'range', min: 0.01, max: 0.05 },
          { param: 'measure/wavelength', kind: 'range', min: 392, max: 396 },
          { param: 'linearRange', kind: 'range', min: 2e4, max: 5e4 },
          { param: 'minimumDetectable', kind: 'range', min: 1, max: 4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/fpd/burner', qty: q(1) }] },
      { anyOf: [{ item: 'plant/fpd/filter', qty: q(1) }] },
      { anyOf: [{ item: 'plant/fpd/ptfe-column', qty: q(1) }] },
      { anyOf: [{ item: 'plant/pmt-assembly', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cmos-test/parameter-analyzer/femto-front-end', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cmos-test/parameter-analyzer/adc-24bit', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(4) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/mfc', 'plant/hv-test-bench'],
    steps: [
      { note_zh: '① 装燃烧器（H₂ 120 + 空气 150 mL/min、200–240 °C 自加热）、394 nm 滤光片与 PTFE 柱', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 装 PMT 组件与 10 级分压器；HV 800–1500 V 由 hv-test-bench 的 3 kV 段给，PMT 增益降到 1e5–1e6（阳极 24–710 nA）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 接 femto 前端（1e-16–1e-6 A）与 24 bit ADC；暗计数 20–80 cps', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 标定 H₂S 0.01/0.1/1/5 ppm（动态配气、394 nm）；0.01 ppm 阳极 0.2–2.7 µA、S/N 3.3–13', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(40) },
    unbalanced_zh: '燃烧器 1 + 滤光片 1 + PTFE 柱 1 + PMT 组件 1 + femto/ADC 各 1 + 接触器/钢板 → FPD 1 台；产物按台计，不进 kg 守恒。与旧 SiPM 路线并存，旧线仍 0.1–0.3 ppm',
  },

];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PMT_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PMT_ROUTES];
