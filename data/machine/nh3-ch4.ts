/**
 * 氨的 CH₄ / 总烃 / H₂S —— 仪器与零件那一半（R13：仪器、零件、材料放 data/machine/）。
 *
 * ⚠️ **分工（R13）**：本文件放**仪器 / 零件 / 材料**与它们的 `make/*` 路线；测量路线
 * 与记录在 `data/measure/nh3-ch4.ts`（导出名 `NH3_CH4_MEASURE_ITEMS` /
 * `NH3_CH4_MEASURE_ROUTES`），按 id 跨文件解析 —— 同一次 data 装配，没有跨文件 import。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、这一份补的是 `data/machine/nh3-gas.ts` §五 缺口 ⑧
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 那里的原话：「只证六项：CH₄、H₂S、总烃不在这条链上」。这一份造三台检测器：
 *
 *   ① FID（氢焰离子化）  —— CH₄ 0.1–10 ppm、总烃 0.1–10 ppm
 *   ② 甲烷转化炉（Ni）   —— CO/CO₂ + 3H₂/4H₂ → CH₄，把 CO/CO₂ 交给 FID（0.1–10 ppm）
 *   ③ FPD（394 nm）      —— H₂S 0.1–5 ppm（**SiPM** 光子计数，见 §二②）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、FID 的灵敏度账
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── ① 从碳质量到电流 ───────────────────────────────────────────────────────
 *
 *   FID 的响应 ≈ 10 mC/g C（0.01 C/g）；1 pg C/s ⇒ **1×10⁻¹⁴ A**
 *   电表前端复用 `plant/cmos-test/parameter-analyzer/femto-front-end`
 *   （电流 1e-16–1e-6 A、分辨 1e-18–1e-12 A、噪声 ≤1e-12 A）⇒ 噪声不是瓶颈
 *   ⇒ 最小可检量 **1–10 pg C/s**（S/N = 3）
 *
 *   1 ppm CH₄、20 mL/min 载气：
 *     2×10⁻⁵ mL/min = 8.93×10⁻¹⁰ mol/min = 1.07×10⁻⁸ g C/min = **0.179 ng C/s**
 *     ⇒ 1.79×10⁻¹² A（比噪声高 2 个量级）
 *   ⇒ 纯仪器的检出限 0.01–0.05 ppm；**方法检出限 0.1 ppm**（柱流失 + 氨尾 + 零点气）
 *
 * ── ② 火焰与气量 ───────────────────────────────────────────────────────────
 *
 *   H₂ 30–40 mL/min + 助燃气 300–400 mL/min（H₂:空气 ≈ 1:10，火焰 2–3 mm）
 *   载气 N₂ 20–30 mL/min（柱 effluent 与 H₂ 在喷嘴下混合）
 *   喷嘴 φ0.3–0.5 mm（石英；陶瓷也行，石英能看得见火焰）
 *   极化 100–300 V（复用 `hv-source-200v-precision`，实际 150–200 V）
 *
 * ⚠️ **本层没有 `mat/air` 条目**：助燃气用 `mat/oxygen`（90–99.5 %）+ `mat/nitrogen`
 * 按 21:79 配（两路质量流量计，比例 ±2 %）。直接烧纯 O₂ 的响应高 10–20 %，但火焰
 * 温度高 300–400 K、背景大 3–5 倍，且喷嘴寿命掉一半 —— 所以配空气。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、FPD 与「光电倍增管」：本层做不出 PMT，换 SiPM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── ① FPD 的原理 ───────────────────────────────────────────────────────────
 *
 *   H₂S 在富氢火焰里生成 S₂*，在 **394 nm** 附近有 10–15 nm 宽的发射带；
 *   滤光片选 394 nm、SiPM 计数 → H₂S 的检出限 0.1–1 ppm（本机交 0.1–0.3）。
 *   线性 2×10⁴–5×10⁴（S₂* 的自吸收把线性压得比 FID 低两个量级）。
 *
 * ── ② 为什么不是真空 PMT（grep 结论 + 数）─────────────────────────────────
 *
 *   `std/photomultiplier-general` **全表 0 命中**（本轮 grep：只有
 *   `plant/sims/electron-multiplier` 是电子倍增器，没有光阴极，394 nm 的光子打不出电子）。
 *   真空 PMT 的光阴极只有三类：Cs-Sb / 双碱（K-Cs-Sb）/ GaAs(Cs,O) —— **全要铯**；
 *   而本层的 `mat/cesium`、`mat/antimony` 是**两项一次性输入**（`data/material/cs-sb.ts`）：
 *
 *     Cs：本层无矿（风化层 0.1–0.5 ppm，1 g Cs 要 2–20 t 土），条目写
 *         99.5–99.99 %、熔封安瓿；不可复制，只能从地球运
 *     Sb：本层无辉锑矿（grep `stibnite` 0 条），条目写 99.9–99.99 % 锭/块；
 *         同样不可复制，只能从地球运
 *
 *   ⇒ **不是"缺两条料链"，是"缺一次性输入 2 项"**；料有了，但 PMT 本身仍缺
 *   光阴极蒸镀/激活、打拿极、真空封管与 10 kV 分压 —— 本层写不出「造 PMT」的
 *   完整路线（写了就是编）。
 *   替代件是**硅光电倍增器（SiPM）**：1 mm² 的盖格雪崩二极管阵列，增益 **10⁵–10⁶**
 *   （与 PMT 同量级）、394 nm 的光子探测效率 **25–35 %**、不需要铯、**用本层已有的
 *   硅工艺线**（`make/photodiode` 的氧化/扩散/光刻/蒸铝/划片 + 深沟槽隔离）。
 *   代价是暗计数 0.2–0.8 Mcps（PMT 是 0.1–1 kcps）—— H₂S 的地板由它定（§五 ⑥）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、甲烷转化炉
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   CO + 3H₂ → CH₄ + H₂O；CO₂ + 4H₂ → CH₄ + 2H₂O；Ni/Al₂O₃、350–400 °C
 *   ⇒ FID 对 CH₄ 的响应是 CO 的 100 倍以上，所以转化之后 CO/CO₂ 能到 0.1–10 ppm
 *   （GC-TCD 只能 0.5–10 ppm 半定量，见 `data/measure/nh3-gas.ts` 的缺口④）。
 *
 *   Ni 5–20 %、γ-Al₂O₃ 载体 100–300 m²/g、1–3 mm 颗粒；0.01 kg/台
 *   毒化：1 ppm H₂S、20 mL/min 下 0.1 g Ni（1.7 mmol）约 **1 900 h** 饱和，
 *   实际按 500 h 换（H₂S 是待测项，不能先脱硫，只能换）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、复用与流程
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ┌──────────────────────────────┬──────────────┬───────────────────────────┐
 *   │ 复用件                        │ 原来给谁      │ 这一份                    │
 *   ├──────────────────────────────┼──────────────┼───────────────────────────┤
 *   │ cmos-test/parameter-analyzer/ │ 参数分析仪    │ FID 与 FPD 的电表前端      │
 *   │   femto-front-end            │              │ （1e-18–1e-12 A 分辨）     │
 *   │ cmos-test/parameter-analyzer/│ 参数分析仪    │ 24 bit 采样               │
 *   │   adc-24bit                  │              │                           │
 *   │ cmos-test/parameter-analyzer/│ 参数分析仪    │ FID 极化与 SiPM 偏压       │
 *   │   hv-source-200v-precision   │              │ （−200…200 V、0.1 %）      │
 *   │ plant/gc-tcd                 │ 氨的六项气体  │ 进样阀 + 硅胶柱 + 柱温箱    │
 *   │ plant/gc-tcd/oven            │ GC-TCD       │ 柱温箱（FID 分离段复用）    │
 *   │ plant/gc-tcd/silica-column   │ GC-TCD       │ CH₄/总烃的分离柱            │
 *   │ plant/nh3-absorber           │ 氨的六项气体  │ 进样前脱氨（H₂S 回收 >95 %）│
 *   └──────────────────────────────┴──────────────┴───────────────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、缺口（带数；R7：按量级记录，不作为终止条件）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① **没有真空 PMT**：缺 Cs/Sb 两项一次性输入（本层无矿、不可复制，见
 *     `data/material/cs-sb.ts`）⇒ 用 SiPM 顶，增益同级（1e6）、H₂S 0.1–0.3 ppm
 *     达标；要 PMT 的 0.01 ppm 档，得先有那两项输入 + 光阴极/打拿极/封管三条工艺。
 *  ② H₂S 只测**总硫（以 H₂S 计）**：FPD 不分柱（PTFE 柱缺条目）⇒ H₂S 与 CH₃SH/
 *     COS/CS₂ 分不开。要分：一条 PTFE 填充柱（0.5 m，60–80 目）。
 *  ③ 氨基体靠 `plant/nh3-absorber`：H₂S 回收 >95 %（85 % 磷酸里 H₂S 溶解度
 *     1×10⁻³ mol/(L·atm)，膜里只存 5×10⁻¹⁰ mol）、CH₄ >99 %；但 CO₂ 在阱里要
 *     **1–2 h 预平衡**（同 `data/machine/nh3-gas.ts` 缺口③），转化炉通道也吃这一笔。
 *  ④ 助燃气没有 `mat/air`：O₂+N₂ 配 21:79，比例 ±2 % ⇒ 响应因子 ±2 %；纯 O₂ 会
 *     ±15 %（且喷嘴寿命减半）。
 *  ⑤ Ni 催化剂毒化：1 ppm H₂S 下 1 900 h 饱和，按 500 h 换；换一次 0.01 kg。
 *  ⑥ SiPM 暗计数 0.2–0.8 Mcps 是 H₂S 的地板：0.1 ppm 时 S/N 3–5；要 0.05 ppm
 *     需 −20 °C 制冷（Peltier 缺 Bi₂Te₃）或真空 PMT。
 *  ⑦ FID 的总烃按 CH₄ 折算：重烃（C2–C6）的响应因子差 10–20 % ⇒ 总烃 ±20 %。
 *  ⑧ 无 H₂ 传感器（H₂ 火焰 30–40 mL/min + H₂ 载气/燃料），与
 *     `data/machine/trace-analysis.ts` §八 ⑧ 同一处缺口。
 *  ⑨ 只证 CH₄ / 总烃 / H₂S（+CO/CO₂）；COS、CS₂、CH₃SH 不在这一条上。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { NH3_CH4_HW_ITEMS, NH3_CH4_HW_ROUTES } from '../../data/machine/nh3-ch4.ts';
 *   import { NH3_CH4_MEASURE_ITEMS, NH3_CH4_MEASURE_ROUTES } from '../../data/measure/nh3-ch4.ts';
 *   items:  [...NH3_CH4_HW_ITEMS, ...NH3_CH4_MEASURE_ITEMS]
 *   routes: [...NH3_CH4_HW_ROUTES, ...NH3_CH4_MEASURE_ROUTES]
 *
 * ⚠️ 两个文件都要注册；只注册 machine 那一半，`measure/nh3-*` 会 `unknown_item`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const NH3_CH4_HW_ITEMS: readonly Item[] = [
  /**
   * **FID 喷嘴。** 石英毛细管 φ0.3–0.5 × 15–25 mm，顶端磨平。
   *
   *   orifice   0.35–0.45 mm（大了火焰吹脱、小了易堵）
   *   length    15–25 mm（进检测器腔 5 mm）
   *   material  quartz（可选 ceramic，本机用石英：能看见火焰颜色）
   */
  {
    id: 'plant/fid/nozzle',
    name: 'FID Nozzle', name_zh: 'FID 喷嘴',
    unit: '件',
    category: 'part',
    props: [
      { param: 'orifice', kind: 'range', min: 0.3, max: 0.5, unit: 'mm' },
      { param: 'length', kind: 'range', min: 10, max: 30, unit: 'mm' },
      { param: 'material', kind: 'enum', values: ['quartz', 'ceramic'] },
    ],
  },

  /**
   * **FID 电极对：极化极（喷嘴座）+ 收集极（圆筒）。**
   *
   *   gap          3–4 mm（喷嘴顶到收集极下沿）
   *   polarization 150–200 V（复用 `hv-source-200v-precision`，±0.1 %）
   *   insulation   1×10¹²–10¹³ Ω（氧化铝座；低了极化电压被漏掉、收集效率掉一半）
   *
   * 收集极是 φ10 × 15 mm 的 316L 圆筒，内壁镀金（`mat/gold` 0.001 kg）—— 金的
   * 功函数高、不会催化样品分解；316L 本体做屏蔽。
   */
  {
    id: 'plant/fid/electrodes',
    name: 'FID Electrode Pair', name_zh: 'FID 电极对',
    unit: '件',
    category: 'part',
    props: [
      { param: 'gap', kind: 'range', min: 2, max: 5, unit: 'mm' },
      { param: 'polarization', kind: 'range', min: 100, max: 300, unit: 'V' },
      { param: 'insulation', kind: 'range', min: 1e11, max: 1e14, unit: 'Ω', dir: 'atLeast' },
    ],
  },

  /**
   * **FID 气路板：H₂ 0–50 sccm、空气 0–500 sccm、载气 0–50 sccm 三路。**
   *
   *   h2Range       0–50 sccm（工作点 35）
   *   airRange      0–500 sccm（工作点 350；`plant/mfc` 只到 200 sccm，所以这一路要单独做）
   *   carrierRange  0–50 sccm（20–30）
   *   ratioAccuracy ±1–2 %（H₂:空气 = 1:10，比例错 5 % 响应就漂 3 %）
   */
  {
    id: 'plant/fid/flow-panel',
    name: 'FID Gas Panel', name_zh: 'FID 气路板',
    unit: '件',
    category: 'part',
    props: [
      { param: 'h2Range', kind: 'range', min: 0, max: 100, unit: 'sccm', dir: 'atLeast' },
      { param: 'airRange', kind: 'range', min: 0, max: 500, unit: 'sccm', dir: 'atLeast' },
      { param: 'carrierRange', kind: 'range', min: 0, max: 100, unit: 'sccm', dir: 'atLeast' },
      { param: 'ratioAccuracy', kind: 'range', min: 1, max: 3, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * **FPD 燃烧器：富氢火焰 + 200–250 °C 加热块。**
   *
   *   temperature 180–240 °C（低于 150 水汽凝、高于 260 密封圈老化）
   *   h2Flow      90–140 mL/min（富氢：H₂:空气 ≈ 1:1.2）
   *   airFlow     120–180 mL/min
   *
   * 与 FID 的火焰不同：FPD 要**富氢**才生成 S₂*（H₂ 过量 3–5 倍），所以气量比
   * 单独一套（不能与 FID 共用气路板）。
   */
  {
    id: 'plant/fpd/burner',
    name: 'FPD Burner', name_zh: 'FPD 燃烧器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'temperature', kind: 'range', min: 150, max: 260, unit: '°C' },
      { param: 'h2Flow', kind: 'range', min: 80, max: 150, unit: 'mL/min' },
      { param: 'airFlow', kind: 'range', min: 100, max: 200, unit: 'mL/min' },
    ],
  },

  /**
   * **394 nm 干涉滤光片：21 层 λ/4 的 TiO₂/SiO₂ 膜堆，带宽 10–15 nm。**
   *
   *   wavelength   392–396 nm（S₂* 的 0 支带头；±2 nm 内）
   *   bandwidth    10–15 nm（窄了透过率低、宽了烃的连续背景进来）
   *   transmission 40–60 %（21 层理论 65 %，实际按 50 % 记）
   *
   * 做法：石英基片 + `plant/euv-coater` 蒸镀（TiO₂ 用 Ti + O₂ 反应蒸发，SiO₂ 用
   * 石英舟），层厚用 `plant/film-monitor` 的晶振监控（±2 nm）。
   */
  {
    id: 'plant/fpd/filter',
    name: '394 nm Interference Filter', name_zh: '394 nm 干涉滤光片',
    unit: '件',
    category: 'part',
    props: [
      { param: 'wavelength', kind: 'range', min: 385, max: 405, unit: 'nm' },
      { param: 'bandwidth', kind: 'range', min: 8, max: 20, unit: 'nm' },
      { param: 'transmission', kind: 'range', min: 30, max: 70, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * **硅光电倍增器（SiPM）：1 mm²、增益 10⁵–10⁶、394 nm 的 PDE 25–35 %。**
   *
   *   gain       5×10⁵–1×10⁶
   *   pde        25–35 %（@394 nm；硅在 400 nm 的量子效率 ~80 %，乘填充因子 30–45 %）
   *   wavelength 390–410 nm（峰值；380–420 都能用）
   *   darkCount  0.2–0.8 Mcps（1 mm²、20 °C；这是 H₂S 的地板）
   *   crosstalk  8–15 %（相邻微元的串扰，出厂标定后扣）
   *
   * **它替的是真空 PMT**（§二②：Cs/Sb 是两项一次性输入，本层无矿、不可复制）。工艺与
   * `make/photodiode` 同一条线：高阻硅片 → 氧化 → p⁺/n⁺ 扩散 → 深沟槽隔离
   * （`plant/drie-etcher`）→ 淬灭电阻 → 蒸铝 → 划片封装。增益来自盖格模式偏压
   * （30–40 V，由 `hv-source-200v-precision` 给）。
   */
  {
    id: 'std/sipm-1mm-general',
    name: 'Silicon Photomultiplier', name_zh: '硅光电倍增器',
    unit: '只',
    category: 'part',
    props: [
      { param: 'gain', kind: 'range', min: 1e5, max: 1e6, unit: '倍', dir: 'atLeast' },
      { param: 'pde', kind: 'range', min: 20, max: 40, unit: '%', dir: 'atLeast' },
      { param: 'wavelength', kind: 'range', min: 380, max: 420, unit: 'nm' },
      { param: 'darkCount', kind: 'range', min: 1e5, max: 1e6, unit: '计数/s', dir: 'atMost' },
      { param: 'crosstalk', kind: 'range', min: 5, max: 20, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * **甲烷转化炉管：φ3 × 150 mm 316L，装 0.5–2 mL 催化剂。**
   *
   *   volume   1–1.5 mL（0.01 kg 催化剂 + 石英棉）
   *   leakRate 1e-4–5e-4 Pa·L/s
   */
  {
    id: 'plant/methanizer/tube',
    name: 'Methane Reformer Tube', name_zh: '甲烷转化炉管',
    unit: '件',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 0.5, max: 2, unit: 'mL' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-3, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /**
   * **转化炉加热器：40–80 W 卡式加热 + K 型热电偶 + 控温 360–400 °C。**
   *
   *   power       40–80 W（0.01 kg 催化剂 + 0.1 kg 不锈钢升到 380 °C 要 25–40 W）
   *   temperature 360–400 °C
   *   stability   ±1–2 °C（转化率对温度 2 %/10 K）
   */
  {
    id: 'plant/methanizer/heater',
    name: 'Methane Reformer Heater', name_zh: '甲烷转化炉加热器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 20, max: 100, unit: 'W' },
      { param: 'temperature', kind: 'range', min: 350, max: 420, unit: '°C' },
      { param: 'stability', kind: 'range', min: 1, max: 3, unit: '°C', dir: 'atMost' },
    ],
  },

  /**
   * **镍催化剂：5–20 % Ni / γ-Al₂O₃，1–3 mm 颗粒。**
   *
   *   niLoading    10–15 %（浸渍法，硝酸镍）
   *   supportArea  150–250 m²/g（γ-Al₂O₃）
   *   pelletSize   1.5–2.5 mm（小了压降大、大了内扩散限制）
   *   life         800–1 500 h（1 ppm H₂S 下 1 900 h 饱和，按 500 h 保守换）
   */
  {
    id: 'mat/nickel-catalyst',
    name: 'Nickel Catalyst', name_zh: '镍催化剂',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'niLoading', kind: 'range', min: 5, max: 20, unit: '%' },
      { param: 'supportArea', kind: 'range', min: 100, max: 300, unit: 'm²/g', dir: 'atLeast' },
      { param: 'pelletSize', kind: 'range', min: 1, max: 3, unit: 'mm' },
      { param: 'life', kind: 'range', min: 500, max: 2000, unit: 'h', dir: 'atLeast' },
    ],
  },

  /**
   * **FID 整机。**
   *
   *   methane            0.1–10 ppm（5 mL 环、20 mL/min 载气、S/N 3）
   *   totalHydrocarbons  0.1–10 ppm（按 CH₄ 折算，重烃 ±20 %）
   *   detectionLimit     0.05–0.2 ppm（纯仪器；方法 0.1）
   *   linearRange        5×10⁵–10⁶（CH₄ 的动态范围）
   *   minimumDetectable  1–5 pg C/s
   *   h2Flow 30–40 · airFlow 300–400 mL/min · polarization 150–200 V
   *
   * `holds` 250–380 °C：检测器体加热到 300–350 °C，防柱 effluent 在喷嘴前冷凝。
   */
  {
    id: 'plant/fid',
    name: 'FID System', name_zh: 'FID 整机',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'temperature', min: 250, max: 380 }],
    props: [
      { param: 'measure/methane', kind: 'range', min: 0.05, max: 1000, unit: 'ppm' },
      { param: 'measure/totalHydrocarbons', kind: 'range', min: 0.05, max: 1000, unit: 'ppm' },
      { param: 'measure/detectionLimit', kind: 'range', min: 0.03, max: 1, unit: 'ppm', dir: 'atMost' },
      { param: 'linearRange', kind: 'range', min: 1e5, max: 1e6, unit: '倍', dir: 'atLeast' },
      { param: 'minimumDetectable', kind: 'range', min: 1, max: 10, unit: 'pg C/s', dir: 'atMost' },
      { param: 'h2Flow', kind: 'range', min: 25, max: 45, unit: 'mL/min' },
      { param: 'airFlow', kind: 'range', min: 280, max: 420, unit: 'mL/min' },
      { param: 'polarization', kind: 'range', min: 100, max: 300, unit: 'V' },
    ],
  },

  /**
   * **甲烷转化炉整机（Ni 催化）。holds 350–400 °C。**
   *
   *   conversion     90–97 %（CO/CO₂ → CH₄，380 °C、H₂ 过量 10 倍）
   *   catalystLife   800–1 500 h
   *   carbonMonoxide 0.1–50 ppm（转化后由 FID 读；窗口按 FID 的 0.1–10 放大一档）
   *   carbonDioxide  0.1–50 ppm
   */
  {
    id: 'plant/methanizer',
    name: 'Methane Reformer System', name_zh: '甲烷转化炉整机',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'temperature', min: 350, max: 400 }],
    props: [
      { param: 'conversion', kind: 'range', min: 85, max: 99, unit: '%', dir: 'atLeast' },
      { param: 'catalystLife', kind: 'range', min: 500, max: 2000, unit: 'h', dir: 'atLeast' },
      { param: 'measure/carbonMonoxide', kind: 'range', min: 0.05, max: 50, unit: 'ppm' },
      { param: 'measure/carbonDioxide', kind: 'range', min: 0.05, max: 50, unit: 'ppm' },
    ],
  },

  /**
   * **PTFE 分种柱：0.5 m × 4 mm、60–80 目 PTFE 担体 + 8 % PEG-20M 固定相。**
   *
   *   为什么不用硅胶柱：H₂S 是酸性的，硅胶的 Si–OH 会把它拖成 2–3 倍的宽峰
   *   （`plant/gc-tcd/silica-column` 只用来分 CH₄/C2+）；PTFE 担体惰性，H₂S 不拖尾。
   *
   *   length       0.5 m（60 °C、N₂ 20 mL/min 下 t₀ = 0.15 min）
   *   mesh         60–80 目
   *   phaseLoading 7–9 %（PEG-20M；高了 H₂S 出不来，低了 CS₂ 与 CH₃SH 分不开）
   *   bleed        0.2–0.5 ng S/s（60–80 °C 的柱流失，低于 FPD 的 20–50 pg S/s 地板 10×）
   */
  {
    id: 'plant/fpd/ptfe-column',
    name: 'PTFE Fractionation Column', name_zh: 'PTFE 分种柱',
    unit: '件',
    category: 'part',
    props: [
      { param: 'length', kind: 'range', min: 0.4, max: 0.6, unit: 'm' },
      { param: 'mesh', kind: 'range', min: 60, max: 80, unit: '目' },
      { param: 'phaseLoading', kind: 'range', min: 5, max: 10, unit: '%' },
      { param: 'bleed', kind: 'range', min: 0, max: 1, unit: 'ng S/s', dir: 'atMost' },
    ],
  },

  /**
   * **FPD 整机（394 nm）。holds 150–260 °C。两条路线并存：**
   *
   *   `make/fpd`     394 nm + SiPM   H₂S 0.1–5 ppm、检出限 0.1–0.3 ppm、20–50 pg S/s
   *   `make/fpd-pmt` 394 nm + PMT    H₂S 0.01–5 ppm、检出限 0.01–0.05 ppm、1–4 pg S/s
   *
   * 属性窗口取两条路线的并集：hydrogenSulfide 0.01–100、detectionLimit 0.01–1、
   * minimumDetectable 1–100 pg S/s。旧 SiPM 路线仍只交 0.1–0.3 / 20–50；
   * PMT 路线见 `data/machine/pmt.ts`。
   *
   *   hydrogenSulfide  0.01–5 ppm（PMT）/ 0.1–5 ppm（SiPM）；PTFE 柱 0.8 min
   *   methylMercaptan  0.1–5 ppm（CH₃SH，2.4 min）
   *   carbonylSulfide  0.1–5 ppm（COS，1.5 min）
   *   carbonDisulfide  0.1–5 ppm（CS₂，3.8 min）
   *   wavelength       392–396 nm · linearRange 2×10⁴–5×10⁴
   */
  {
    id: 'plant/fpd',
    name: 'FPD System', name_zh: 'FPD 整机',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'temperature', min: 150, max: 260 }],
    props: [
      { param: 'measure/hydrogenSulfide', kind: 'range', min: 0.01, max: 100, unit: 'ppm' },
      { param: 'measure/methylMercaptan', kind: 'range', min: 0.05, max: 100, unit: 'ppm' },
      { param: 'measure/carbonylSulfide', kind: 'range', min: 0.05, max: 100, unit: 'ppm' },
      { param: 'measure/carbonDisulfide', kind: 'range', min: 0.05, max: 100, unit: 'ppm' },
      { param: 'measure/detectionLimit', kind: 'range', min: 0.01, max: 1, unit: 'ppm', dir: 'atMost' },
      { param: 'measure/wavelength', kind: 'range', min: 385, max: 405, unit: 'nm' },
      { param: 'linearRange', kind: 'range', min: 1e4, max: 1e5, unit: '倍', dir: 'atLeast' },
      { param: 'minimumDetectable', kind: 'range', min: 1, max: 100, unit: 'pg S/s', dir: 'atMost' },
    ],
  },
];

export const NH3_CH4_HW_ROUTES: readonly Route[] = [
  {
    /**
     * **喷嘴：石英管拉丝 → 磨平端面 → 检孔。**
     *
     *   石英 0.005 → 喷嘴 1 件（φ0.35–0.45、长 15–25 mm）。
     */
    id: 'make/fid-nozzle',
    name: 'FID Nozzle Manufacturing', name_zh: 'FID 喷嘴制造',
    produces: [
      {
        item: 'plant/fid/nozzle',
        qty: q(1),
        gives: [
          { param: 'orifice', kind: 'range', min: 0.35, max: 0.45 },
          { param: 'length', kind: 'range', min: 15, max: 25 },
          { param: 'material', kind: 'enum', oneOf: ['quartz'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 200) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '拉 φ0.4 石英毛细管（1900–2200 °C），切 20 mm', performedBy: 'plant/glass-lathe', under: [{ param: 'temperature', min: 1900, max: 2200 }] },
      { note_zh: '端面磨平（碳化硅粉 + 平板），孔口倒角 0.02 mm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '显微镜检孔径 0.35–0.45 与孔口圆度', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(6) },
    unbalanced_zh: '石英 0.005 → 喷嘴 1 件；余是拉丝废段与磨削量。按件计',
  },

  {
    /**
     * **电极对：车 316L 收集极与座 → 内壁镀金 → 装氧化铝绝缘。**
     *
     *   316L 0.05 + 金 0.001 + 氧化铝 2 → 电极对 1 套。
     */
    id: 'make/fid-electrodes',
    name: 'FID Electrode Pair Manufacturing', name_zh: 'FID 电极对制造',
    produces: [
      {
        item: 'plant/fid/electrodes',
        qty: q(1),
        gives: [
          { param: 'gap', kind: 'range', min: 3, max: 4 },
          { param: 'polarization', kind: 'range', min: 150, max: 200 },
          { param: 'insulation', kind: 'range', min: 1e12, max: 1e13 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车 φ10×15 收集极筒与喷嘴座（同轴 ≤0.05 mm）', performedBy: 'lathe' },
      { note_zh: '内壁镀金 0.5 µm（真空蒸镀）', performedBy: 'plant/evaporator' },
      { note_zh: '装氧化铝绝缘座，500 V 下测绝缘 ≥1e12 Ω', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(12) },
    unbalanced_zh: '316L 0.05 + 金 0.001 + 氧化铝 2 → 电极对 1 套；余是切屑。按件计',
  },

  {
    /**
     * **FID 气路板：三路流量计 + 混合腔 + 电磁阀。**
     *
     *   316L 0.6 + 铜 0.1 + PTFE 0.05 + 接触器 1 → 气路板 1 件。
     */
    id: 'make/fid-flow-panel',
    name: 'FID Gas Panel Manufacturing', name_zh: 'FID 气路板制造',
    produces: [
      {
        item: 'plant/fid/flow-panel',
        qty: q(1),
        gives: [
          { param: 'h2Range', kind: 'range', min: 0, max: 50 },
          { param: 'airRange', kind: 'range', min: 0, max: 500 },
          { param: 'carrierRange', kind: 'range', min: 0, max: 50 },
          { param: 'ratioAccuracy', kind: 'range', min: 1, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(3, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 20) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
    ],
    needs: ['plant/mfc', 'plant/metrology-room'],
    steps: [
      { note_zh: '车三路流量计座与混合腔（H₂ 0–50、空气 0–500、载气 0–50 sccm）', performedBy: 'lathe' },
      { note_zh: '装针阀与电磁阀；用 `plant/mfc` 的 0–200 sccm 档标小流量两路', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '标空气路（皂膜量管 0.5 L）与 H₂:空气 = 1:10 的比例精度 ±2 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(20) },
    unbalanced_zh: '316L 0.6 + 铜 0.1 + PTFE 0.05 + 接触器 1 → 气路板 1 件；按件计',
  },

  {
    /**
     * **FPD 燃烧器：车燃烧室 → 装毛细管喷嘴与加热块。**
     *
     *   316L 0.3 + 石英 0.01 + 热电偶 1 + 电阻丝 0.02 → 燃烧器 1 件。
     */
    id: 'make/fpd-burner',
    name: 'FPD Burner Manufacturing', name_zh: 'FPD 燃烧器制造',
    produces: [
      {
        item: 'plant/fpd/burner',
        qty: q(1),
        gives: [
          { param: 'temperature', kind: 'range', min: 180, max: 240 },
          { param: 'h2Flow', kind: 'range', min: 90, max: 140 },
          { param: 'airFlow', kind: 'range', min: 120, max: 180 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 100) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 50) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车燃烧室（φ25×40）与 H₂/空气双层进气环', performedBy: 'lathe' },
      { note_zh: '装石英毛细管喷嘴与加热块、热电偶', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '通气点火试验：H₂ 120 + 空气 150 mL/min 下火焰稳定、不脱火', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(16) },
    unbalanced_zh: '316L 0.3 + 石英 0.01 + 热电偶 1 + 电阻丝 0.02 → 燃烧器 1 件；按件计',
  },

  {
    /**
     * **394 nm 滤光片：清洗基片 → 镀 21 层 λ/4 → 测光谱。**
     *
     *   石英 0.002 + 钛 0.001 + 硅石 0.001 + 氧 0.01 → 滤光片 1 片。
     *
     * TiO₂/SiO₂ 的 λ/4 光学厚度：394/4/2.35 = 41.9 nm（TiO₂，n=2.35）、
     * 394/4/1.46 = 67.5 nm（SiO₂）；21 层（11 高 + 10 低）= 1.2 µm 总厚。
     */
    id: 'make/fpd-filter',
    name: '394 nm Interference Filter Manufacturing', name_zh: '394 nm 干涉滤光片制造',
    produces: [
      {
        item: 'plant/fpd/filter',
        qty: q(1),
        gives: [
          { param: 'wavelength', kind: 'range', min: 392, max: 396 },
          { param: 'bandwidth', kind: 'range', min: 10, max: 15 },
          { param: 'transmission', kind: 'range', min: 40, max: 60 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/titanium', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 100) }] },
    ],
    needs: ['plant/evaporator', 'plant/metrology-room'],
    steps: [
      { note_zh: '石英基片双面抛光、清洗（丙酮 + 异丙醇 + 水）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '镀 21 层 λ/4（TiO₂ 反应蒸发：Ti + O₂；SiO₂ 用石英舟），晶振监控 ±2 nm', performedBy: 'plant/euv-coater', under: [{ param: 'pressure', min: 0.1, max: 1 }] },
      { note_zh: '测透射谱：394±2 nm、FWHM 10–15 nm、峰值透过 40–60 %', performedBy: 'plant/film-monitor', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(30) },
    unbalanced_zh: '石英 0.002 + 钛 0.001 + 硅石 0.001 + 氧 0.01 → 滤光片 1 片；余是镀膜损耗。按件计',
  },

  {
    /**
     * **PTFE 分种柱：PTFE 担体涂 PEG-20M → 装 0.5 m 柱 → 老化 → 测保留时间。**
     *
     *   PTFE 0.02 + PEG 0.002 → 柱 1 根（0.5 m、60–80 目、8 % 固定相）
     *
     * 保留时间（60 °C、N₂ 20 mL/min、t₀ = 0.15 min）：H₂S 0.8、COS 1.5、
     * CH₃SH 2.4、CS₂ 3.8 min；相邻峰宽 0.20–0.36 min ⇒ 分离度 3.2 / 3.3 / 4.2。
     */
    id: 'make/fpd-ptfe-column',
    name: 'PTFE Fractionation Column Manufacturing', name_zh: 'PTFE 分种柱制造',
    produces: [
      {
        item: 'plant/fpd/ptfe-column',
        qty: q(1),
        gives: [
          { param: 'length', kind: 'range', min: 0.5, max: 0.55 },
          { param: 'mesh', kind: 'range', min: 60, max: 80 },
          { param: 'phaseLoading', kind: 'range', min: 7, max: 9 },
          { param: 'bleed', kind: 'range', min: 0.2, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/polyethylene-glycol', qty: q(1, 500) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 担体：PTFE 粉 60–80 目筛分；PEG-20M 溶于二氯甲烷（`mat/dichloromethane`）浸渍到 8 %，蒸干', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 装柱：0.5 m × 4 mm PTFE 管，玻璃棉塞，边装边敲实（不出现沟流）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 老化：60 °C、N₂ 20 mL/min 吹 2 h；柱流失 0.2–0.5 ng S/s', performedBy: 'plant/gc-tcd', under: [{ param: 'temperature', min: 60, max: 80 }] },
      { note_zh: '④ 保留时间标定：H₂S 0.8、COS 1.5、CH₃SH 2.4、CS₂ 3.8 min；分离度 3.2/3.3/4.2（≥1.5）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(8) },
    unbalanced_zh: 'PTFE 0.02 + PEG 0.002 → 柱 1 根；余是筛下的细粉与浸渍废液（按件计）',
  },

  {
    /**
     * **SiPM：高阻硅片 → 氧化 → p⁺/n⁺ 扩散 → 深沟槽 → 蒸铝 → 划片封装。**
     *
     *   硅片 1 + POCl₃ 1 + 氧 1 + 光刻胶 1 + 氢氟酸 1 + 硝酸 1 + 铝 1
     *   + 酚醛树脂 1 + 水 1 → SiPM 20 只
     *
     * 与 `make/photodiode` 同一条线的差别只有三处：① 高阻片（≥1 kΩ·cm）而不是
     * 普通片；② 加**深沟槽隔离**（`plant/drie-etcher`，4 µm 宽、20 µm 深）把 1 mm²
     * 切成 ~10⁴ 个 10 µm 微元；③ 每微元串一只多晶硅**淬灭电阻**（1 MΩ）。
     * 这三处就是「盖格模式增益」与「线性光电二极管」的全部差别。
     */
    id: 'make/sipm-1mm',
    name: 'Silicon Photomultiplier Manufacturing', name_zh: '硅光电倍增器制造',
    produces: [
      {
        item: 'std/sipm-1mm-general',
        qty: q(20),
        gives: [
          { param: 'gain', kind: 'range', min: 5e5, max: 1e6 },
          { param: 'pde', kind: 'range', min: 25, max: 35 },
          { param: 'wavelength', kind: 'range', min: 390, max: 410 },
          { param: 'darkCount', kind: 'range', min: 2e5, max: 8e5 },
          { param: 'crosstalk', kind: 'range', min: 8, max: 15 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pocl3', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['std/photomask-general', 'plant/metrology-room'],
    steps: [
      { note_zh: '清洗 + 干氧 1000–1100 °C（120 nm 场氧）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1000, max: 1100 }] },
      { note_zh: 'p⁺/n⁺ 扩散（POCl₃ 源，1000–1100 °C）与淬灭电阻多晶硅', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1000, max: 1100 }] },
      { note_zh: '接触孔光刻（5 µm）与深沟槽隔离（4 µm 宽 × 20 µm 深）', performedBy: 'plant/drie-etcher', under: [{ param: 'pressure', min: 0.5, max: 5 }] },
      { note_zh: '蒸铝 1 µm 与合金化 500–600 °C', performedBy: 'plant/evaporator', under: [{ param: 'pressure', min: 0.001, max: 0.01 }] },
      { note_zh: '划片、封装（酚醛 + 石英窗）、测增益/暗计数/PDE', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(120) },
    unbalanced_zh: '硅片 1 片 + 九种辅料 → SiPM 20 只；余是扩散不合格片与封装废品。按件计',
  },

  {
    /**
     * **转化炉管：φ3 × 150 mm 316L 车制 + 卡套。**
     */
    id: 'make/methanizer-tube',
    name: 'Methane Reformer Tube Manufacturing', name_zh: '甲烷转化炉管制造',
    produces: [
      {
        item: 'plant/methanizer/tube',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 1, max: 1.5 },
          { param: 'leakRate', kind: 'range', min: 1e-4, max: 5e-4 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 10) }] }],
    needs: ['plant/metrology-room'],
    performedBy: 'lathe',
    rate: { hours: q(4) },
    unbalanced_zh: '316L 0.1 → 转化炉管 1 件；余是切屑。按件计',
  },

  {
    /**
     * **转化炉加热器：卡式加热 + 热电偶 + 氧化铝绝缘。**
     */
    id: 'make/methanizer-heater',
    name: 'Methane Reformer Heater Manufacturing', name_zh: '甲烷转化炉加热器制造',
    produces: [
      {
        item: 'plant/methanizer/heater',
        qty: q(1),
        gives: [
          { param: 'power', kind: 'range', min: 40, max: 80 },
          { param: 'temperature', kind: 'range', min: 360, max: 400 },
          { param: 'stability', kind: 'range', min: 1, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 50) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(8) },
    unbalanced_zh: '电阻丝 0.02 + 氧化铝 2 + 热电偶 1 → 加热器 1 件；按件计',
  },

  {
    /**
     * **镍催化剂：γ-Al₂O₃ 浸硝酸镍 → 干燥 → 焙烧 → 还原。**
     *
     *   镍 0.02 + 氧化铝 0.18 + 水 0.5 + 氢 0.01 → 催化剂 0.2 kg
     *
     * 浸渍 60–80 °C、干燥 110–120 °C、焙烧 400–500 °C（NiO）、还原 350–400 °C（H₂）。
     */
    id: 'make/nickel-catalyst',
    name: 'Nickel Catalyst Production', name_zh: '镍催化剂制备',
    produces: [
      {
        item: 'mat/nickel-catalyst',
        qty: q(1, 5),
        gives: [
          { param: 'niLoading', kind: 'range', min: 10, max: 15 },
          { param: 'supportArea', kind: 'range', min: 150, max: 250 },
          { param: 'pelletSize', kind: 'range', min: 1.5, max: 2.5 },
          { param: 'life', kind: 'range', min: 800, max: 1500 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(9, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '硝酸镍溶液浸渍 γ-Al₂O₃（60–80 °C、2 h），沥干', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 60, max: 80 }] },
      { note_zh: '干燥 110–120 °C × 4 h', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 110, max: 120 }] },
      { note_zh: '焙烧 400–500 °C × 4 h（NiO）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 400, max: 500 }] },
      { note_zh: '氢还原 350–400 °C × 4 h（Ni⁰），氮气保护冷却后封存', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 350, max: 400 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '镍 0.02 + 氧化铝 0.18 + 水 0.5 + 氢 0.01 → 催化剂 0.2 kg；余 0.51 = 浸渍废液（硝酸镍）+ 洗水 + 还原耗氢',
  },

  {
    /**
     * **FID 整机装配：喷嘴 + 电极对 + 气路板 + 复用件（电表/ADC/高压）+ 机箱。**
     *
     *   `plant/cmos-test/parameter-analyzer/femto-front-end` 1（1e-18–1e-12 A）
     *   + `.../adc-24bit` 1 + `.../hv-source-200v-precision` 1（极化 150–200 V）
     *   + 喷嘴 1 + 电极对 1 + 气路板 1 + 接触器 1 + 钢板 5 → FID 1 台
     */
    id: 'make/fid',
    name: 'FID System Assembly', name_zh: 'FID 整机装配',
    produces: [
      {
        item: 'plant/fid',
        qty: q(1),
        gives: [
          { param: 'measure/methane', kind: 'range', min: 0.1, max: 1000 },
          { param: 'measure/totalHydrocarbons', kind: 'range', min: 0.1, max: 1000 },
          { param: 'measure/detectionLimit', kind: 'range', min: 0.05, max: 0.2 },
          { param: 'linearRange', kind: 'range', min: 5e5, max: 1e6 },
          { param: 'minimumDetectable', kind: 'range', min: 1, max: 5 },
          { param: 'h2Flow', kind: 'range', min: 30, max: 40 },
          { param: 'airFlow', kind: 'range', min: 300, max: 400 },
          { param: 'polarization', kind: 'range', min: 150, max: 200 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/fid/nozzle', qty: q(1) }] },
      { anyOf: [{ item: 'plant/fid/electrodes', qty: q(1) }] },
      { anyOf: [{ item: 'plant/fid/flow-panel', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cmos-test/parameter-analyzer/femto-front-end', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cmos-test/parameter-analyzer/adc-24bit', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cmos-test/parameter-analyzer/hv-source-200v-precision', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(5) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/mfc'],
    steps: [
      { note_zh: '① 装喷嘴与电极对：喷嘴顶到收集极下沿 3–4 mm，同轴 ≤0.1 mm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 接气路板：H₂ 35、空气 350、载气 25 mL/min，比例 1:10 ±2 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 接极化（150–200 V）、电表前端与 24 bit ADC；本底噪声 ≤1e-13 A', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 点火与标定：1/10/100 ppm CH₄（动态配气），响应因子与线性 1e6', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(40) },
    unbalanced_zh: '喷嘴 1 + 电极对 1 + 气路板 1 + 复用三件 + 接触器/钢板 → FID 1 台；按件计',
  },

  {
    /**
     * **转化炉装配：管 + 加热器 + 0.01 kg 催化剂 + 控温。**
     *
     *   ⚠️ 活化（350 °C × 2 h）写在注释里而**不写 `under`**：转化炉自己 holds
     *   350–400 °C，写了会撞 `condition_cycle`（与 `make/icp-ms` 同一条边界）。
     */
    id: 'make/methanizer',
    name: 'Methanizer Assembly', name_zh: '转化炉装配',
    produces: [
      {
        item: 'plant/methanizer',
        qty: q(1),
        gives: [
          { param: 'conversion', kind: 'range', min: 90, max: 97 },
          { param: 'catalystLife', kind: 'range', min: 800, max: 1500 },
          { param: 'measure/carbonMonoxide', kind: 'range', min: 0.1, max: 50 },
          { param: 'measure/carbonDioxide', kind: 'range', min: 0.1, max: 50 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/methanizer/tube', qty: q(1) }] },
      { anyOf: [{ item: 'plant/methanizer/heater', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nickel-catalyst', qty: q(1, 100) }] },
      { anyOf: [{ item: 'std/temp-controller-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(3) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 装管与加热器：0.01 kg 催化剂（两端石英棉）、卡式加热、热电偶', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 活化 350 °C × 2 h（氮气吹），冷后封口（这一步的条件由加热器自己的回路维持，未写 under —— 见上）', performedBy: 'plant/robot' },
      { note_zh: '③ 测转化率：100 ppm CO/CO₂ 标气、380 °C、H₂ 过量 10 倍，>90 % 判合格', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '管 1 + 加热器 1 + 催化剂 0.01 + 控温器/接触器/钢板 → 转化炉 1 台；按件计',
  },

  {
    /**
     * **FPD 整机装配：燃烧器 + 394 nm 滤光片 + SiPM + 复用件（电表/ADC/高压）。**
     */
    id: 'make/fpd',
    name: 'FPD System Assembly', name_zh: 'FPD 整机装配',
    produces: [
      {
        item: 'plant/fpd',
        qty: q(1),
        gives: [
          { param: 'measure/hydrogenSulfide', kind: 'range', min: 0.1, max: 100 },
          { param: 'measure/methylMercaptan', kind: 'range', min: 0.1, max: 100 },
          { param: 'measure/carbonylSulfide', kind: 'range', min: 0.1, max: 100 },
          { param: 'measure/carbonDisulfide', kind: 'range', min: 0.1, max: 100 },
          { param: 'measure/detectionLimit', kind: 'range', min: 0.1, max: 0.3 },
          { param: 'measure/wavelength', kind: 'range', min: 392, max: 396 },
          { param: 'linearRange', kind: 'range', min: 2e4, max: 5e4 },
          { param: 'minimumDetectable', kind: 'range', min: 20, max: 50 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/fpd/burner', qty: q(1) }] },
      { anyOf: [{ item: 'plant/fpd/filter', qty: q(1) }] },
      { anyOf: [{ item: 'plant/fpd/ptfe-column', qty: q(1) }] },
      { anyOf: [{ item: 'std/sipm-1mm-general', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cmos-test/parameter-analyzer/femto-front-end', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cmos-test/parameter-analyzer/adc-24bit', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(4) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '① 装燃烧器：H₂ 120 + 空气 150 mL/min、200–240 °C 加热；进样口接 `plant/fpd/ptfe-column`（0.5 m、60–80 目）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 装滤光片与 SiPM：滤光片正对火焰、SiPM 在焦后 5 mm；偏压 32–36 V', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 接电表前端（1e-18–1e-12 A）与 24 bit ADC；暗计数 0.2–0.8 Mcps', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 标定：H₂S/COS/CH₃SH/CS₂ 各 0.1/1/5 ppm（动态配气，PTFE 柱 60 °C、N₂ 20 mL/min）；保留时间 0.8/1.5/2.4/3.8 min，分离度 3.2/3.3/4.2', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(36) },
    unbalanced_zh: '燃烧器 1 + 滤光片 1 + SiPM 1 + 复用两件 + 接触器/钢板 → FPD 1 台；按件计',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...NH3_CH4_HW_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...NH3_CH4_HW_ROUTES];
