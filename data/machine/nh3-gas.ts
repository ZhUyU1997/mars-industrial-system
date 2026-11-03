/**
 * 氨的四项/六项气体杂质 —— 仪器与零件那一半（R13：仪器、零件、材料放 data/machine/）。
 *
 * ⚠️ **分工（R13）**：本文件放**仪器 / 零件 / 材料**与它们的 `make/*` 路线；
 * 2 条测量路线与 2 个记录条目在 `data/measure/nh3-gas.ts`（导出名
 * `NH3_GAS_MEASURE_ITEMS` / `NH3_GAS_MEASURE_ROUTES`），按 id 跨文件解析 ——
 * 同一次 data 装配，数据层只引 id，没有跨文件 import。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、这一份补的是 `data/machine/trace-analysis.ts` §八 缺口 ⑤
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 那里的原话：「NH₃ 的 6 项杂质只证 2 项：金属 0.01–10 ppb ✓、有机物 0.1–1 ppm ✓；
 * H₂O/CO₂/CO/N₂/H₂ 无路线（4 项，设计分配 5–17 ppm）」。两条现成的仪器为什么不能用：
 *
 *   冷镜 / 电解式露点仪（`plant/dew-point-meter`）：NH₃ 在 −33.3 °C 就凝了，而
 *     10 ppm 水的霜点是 −60 °C ⇒ 冷镜先被液氨淹掉，读不到水。
 *   氧化锆氧探针（`plant/oxygen-probe`）：700 °C 下 H₂ + ½O₂ ⇌ H₂O 的 Kp ≈ 10¹⁰；
 *     样品里只要有 1 ppm H₂，平衡 O₂ 就 <10⁻¹⁰ ppm ⇒ 读数恒为 0。而 H₂ 本身是待测项。
 *
 * 所以这一份造三样东西：
 *
 *   ① 氨阱（`plant/nh3-absorber`）：85 % 磷酸 + CuSO₄ 指示层，把 NH₃ 拿掉而放过
 *      O₂/CO/CO₂/N₂/H₂ —— 这是整条链的核心（没有它，99.999 % 的 NH₃ 会把柱子、TCD、
 *      氧池全部冲垮）。
 *   ② 电解式水分仪（`plant/nh3-moisture-analyzer`）：复用 `plant/dew-point-meter/
 *      electrolytic-cell` 的聚磷酸池（12–15 µA/ppm 与本法拉第账对得上），换一块
 *      **无铜**取样板（湿氨会把铜阀蚀成 [Cu(NH₃)₄]²⁺），加一路「同批干燥 NH₃」零气。
 *   ③ GC-TCD（`plant/gc-tcd`）：5A 分子筛柱 + 硅胶柱 + 四丝热导池，**氩/氢两种载气
 *      两次进样**（原因见 §二②）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、水分：电解池的法拉第账，与 NH₃ 的交叉项
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── ① 灵敏度：14.3 µA/ppm，与复用池的 12–15 µA/ppm 对得上 ────────────────
 *
 *   1 µg H₂O 电解要 2 × 96 485 / 18.015 = 10 712 C = 2.975 mAh
 *   100 mL/min 的样气里 1 ppm 水 = 4.82 µg/h ⇒ I = 4.82×10⁻³ mg/h × 2.975 mAh/mg
 *                                     = **14.3 µA**
 *   ⇒ 0.1 ppm = 1.43 µA、100 ppm = 1.43 mA、1000 ppm = 14.3 mA（池在 mA 级以上会
 *     把阳极膜抽干，所以量程上界记 100 ppm，再高要稀释）
 *   ⇒ 检出限：池空白 0.02–0.05 ppm（0.3–0.7 µA，皮安表 10⁻¹⁵ A 的分辨率不是瓶颈）；
 *     加上零气本底 0.05–0.1 ppm ⇒ **方法检出限 0.1 ppm**
 *   ⇒ 响应：池死体积 5–10 cm³ ⇒ 3–6 s 换气；膜内扩散 30–120 s ⇒ **60–180 s 到 90 %**
 *
 * ── ② NH₃ 的交叉项：不是「没有」，是「被氧化」────────────────────────────
 *
 *   10 ppm NH₃、100 mL/min = 45.6 µg/h = 2.68 µmol/h；2NH₃ → N₂ + 6H⁺ + 6e⁻
 *   ⇒ 全部氧化的话 I = 2.68×10⁻⁶ mol/h × 3 × 96 485 / 3600 = **215 µA**
 *   ⇒ 折成水当量 = 215 / 14.3 = **15 ppm（是 NH₃ 浓度的 1.5 倍）**
 *   实际在 50 V/段的聚磷酸膜上只氧化 **1–5 %** ⇒ 0.15–0.75 ppm 水当量。
 *   这 0.15–0.75 ppm 比 10 ppm 的判据小，但比 0.1 ppm 的判据大 —— **必须扣**：
 *
 *     零气 = 同批 NH₃ 过 4A 分子筛（**先用 NH₃ 预饱和 10 h**，水被强吸附、NH₃
 *     穿过去 95–99 %）⇒ 出口水 0.05–0.1 ppm，NH₃ 浓度与样品相同
 *     ⇒ 交叉项在样品与零气之间**同量级相消**，残余 0.02–0.05 ppm
 *     （依据：`make/ammonia-electronic` 的 4A + 铜屑就是这么干燥 NH₃ 的）
 *
 * ── ③ 代价：涂层寿命 ───────────────────────────────────────────────────────
 *
 *   膜里 0.1–0.5 g 聚磷酸 = 1–5 mmol H⁺；10 ppm 下 2.68 µmol/h ⇒ **30–150 h 耗尽**；
 *   1 ppm 下 300–1500 h。耗尽的表现是空白电流从 0.3 µA 爬到 2–5 µA（氨被氧化成
 *   亚硝酸/硝酸盐留在膜里）。重涂 = 拆池 + 250 °C 脱水 2 h，复用
 *   `make/dewpoint-electrolytic-cell` 的工序。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、O₂/N₂/CO/CO₂/H₂：GC-TCD，两种载气
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── ① 热导池的灵敏度 ───────────────────────────────────────────────────────
 *
 *   4 只 φ0.05 钨丝、100 °C、100 mA；对 N₂（氢载）约 10 mV·mL/µg，噪声 10 µV
 *   ⇒ 最小可检量 1 ng；5 mL 定量环里 1 ng = 0.2 ng/mL ⇒ 对 N₂ 是 **0.16 ppm**
 *   ⇒ 取 0.2–0.5 ppm 作交付下限；线性到 1000 ppm（TCD 的 ±2 % 到 10⁴ ppm）
 *
 * ── ② 为什么必须两种载气（λ 的单位是 W/(m·K)，25 °C）──────────────────────
 *
 *     H₂ 0.187 · He 0.156（本层没有）· N₂ 0.026 · O₂ 0.026 · CO 0.025
 *     · CO₂ 0.0167 · Ar 0.0177
 *
 *   **氩载气**：Δλ(H₂) = 0.169（好得离谱）；Δλ(N₂) = 0.008、Δλ(O₂) = 0.008、
 *   Δλ(CO) = 0.007、Δλ(CO₂) = 0.001 —— 比氢载气差 20–100 倍。
 *   **氢载气**：Δλ(N₂) = 0.161、Δλ(O₂) = 0.161、Δλ(CO) = 0.162、Δλ(CO₂) = 0.170
 *   —— 都好；但 H₂ 自己是载气，测不了。
 *
 *   ⇒ **两次进样**：Ar 载气测 H₂（0.1–5 ppm）；H₂ 载气测 O₂/N₂/CO/CO₂（0.2–10 ppm）。
 *   ⚠️ 这与「H₂ 在氩载气下灵敏度差」的直觉相反：**差的是 N₂/O₂/CO/CO₂ 在氩载气下**，
 *   H₂ 在氩里恰恰是最好测的一格。所以不能只挑一种载气。
 *
 * ── ③ 载气净化床：99.999 % 的 H₂ 里 N₂ 有 5–10 ppm ────────────────────────
 *
 *   氢载气若只到 99.999 %（`make/hydrogen-purified`），N₂ 本底 5–10 ppm —— 与样品
 *   同量级，N₂ 通道直接被压死。所以载气板里串三级：
 *
 *     4A 分子筛（H₂O/CO₂，<0.05 ppm）
 *     200 °C 铜屑（O₂ + 2Cu → 2CuO，<0.1 ppm；`mat/copper`）
 *     500 °C 镁屑（3Mg + N₂ → Mg₃N₂，<0.1 ppm；`mat/magnesium`）
 *       1 g Mg 吸 0.5 mmol N₂ = 14 mg；20 mL/min 的 10 ppm N₂ 是 15 µg/h ⇒ **900 h/g**
 *
 *   ⇒ 载气纯度 99.9999 %（N₂/O₂ 各 <0.1 ppm）。
 *
 * ── ④ 为什么不用氧化锆氧探针（见 §〇 的 Kp 账）─────────────────────────────
 *
 *   氧探针只有在**无氢**气流上才成立；而 H₂ 是待测的六项之一，去掉 H₂ 就没法同时
 *   测 H₂。所以 O₂ 走 GC，不走锆池 —— 这不是「池子不好」，是**样品里有氢**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、氨阱：这一条链的核心
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── ① 容量 ─────────────────────────────────────────────────────────────────
 *
 *   10 g 2–4 mm 玻璃珠上挂 1.5 g 85 % 磷酸（1.275 g H₃PO₄ = 13 mmol H⁺）
 *   ⇒ 13 mmol NH₃ = **221 mg**；10 ppm、100 mL/min = 45.6 µg/h ⇒ **4 800 h**
 *   CuSO₄（2 g）只做**穿透指示**（白 → 深蓝 [Cu(NH₃)₄]²⁺），不计容量。
 *
 * ── ② 为什么 O₂/CO 过得去、CO₂ 过得慢 ─────────────────────────────────────
 *
 *   酸膜里的水只有 0.225 g：
 *     O₂ 溶解度 1.3×10⁻³ mol/(L·atm) ⇒ 膜里存 3×10⁻¹² mol，对流 4.5×10⁻⁸ mol/min
 *       可忽略 ⇒ **回收 >99.5 %**
 *     CO 同量级 ⇒ **回收 >99.5 %**
 *     CO₂ 溶解度 0.02–0.03 mol/(L·atm)（10 % 磷酸盐析出）⇒ 膜里存 **4.5–6.7 µmol**
 *       ⇒ 10 ppm（44.6 nmol/min）下 **100–150 min** 才饱和；1 ppm 下 17–25 h
 *   ⇒ 不是「吸收 CO₂」，是「先把它溶满」：**预平衡 1–2 h 之后回收 95–98 %**。
 *   这是本文件最弱的一格（缺口 ③）。
 *
 * ── ③ 穿透与压降 ───────────────────────────────────────────────────────────
 *
 *   床层 100 mm、线速度 2–6 cm/s ⇒ 穿透 <0.05 ppm（出口 NH₃）；压降 0.8–1.5 kPa。
 *   CuSO₄ 层变蓝即换（变色点 ≈ 吸了 5–10 % 容量，留 90 % 余量）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、六项各自能测到哪（记录里的窗口，不是读数）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ┌────────┬──────────────┬──────────┬──────────────────────────────────────┐
 *   │ 项     │ 方法         │ 窗口     │ 谁限制的                             │
 *   ├────────┼──────────────┼──────────┼──────────────────────────────────────┤
 *   │ H₂O    │ 电解池+标零  │0.1–100 ppm│ 零气本底 0.05–0.1 ppm；0.1 ppm 以下证不了│
 *   │ O₂     │ GC-TCD/H₂载  │0.2–10 ppm│ 5 mL 环 + TCD 1 ng 最小可检量         │
 *   │ N₂     │ GC-TCD/H₂载  │0.2–10 ppm│ 同上；载气 N₂ <0.1 ppm（镁床）        │
 *   │ CO     │ GC-TCD/H₂载  │0.5–10 ppm│ TCD Δλ 0.162；**标气只能半定量**（缺口④）│
 *   │ CO₂    │ GC-TCD/H₂载  │1–10 ppm  │ 硅胶柱 + 阱的 CO₂ 预平衡（缺口③）     │
 *   │ H₂     │ GC-TCD/Ar载  │0.1–5 ppm │ Δλ 0.169；Ar 里 N₂ 本底不影响 H₂       │
 *   └────────┴──────────────┴──────────┴──────────────────────────────────────┘
 *
 *   六项检出限之和 ≈ 2.1 ppm < 10 ppm 的预算 ⇒ **判 99.999 % 时六项都够**
 *   （每项都在 1 ppm 附近时总和 6 ppm，留 4 ppm 余量）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、缺口（带数；R7：按量级记录，不作为终止条件）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① H₂O <0.1 ppm 证不了：零气 0.05–0.1 ppm；要 0.01 ppm 得有一条「无水的干氨」
 *     链（4A 床再串一级，或 20 K 冷阱 —— 本层没有）。
 *  ② 水通道的 NH₃ 交叉项：未扣时 0.15–0.75 ppm 水当量，扣后 0.02–0.05 ppm；
 *     涂层 10 ppm 下 30–150 h 要重涂（1 ppm 下 300–1500 h）。
 *  ③ CO₂ 1 ppm 要 5–6 h 预平衡（酸膜溶 4.5–6.7 µmol）；3–10 ppm 是 1–2 h。
 *     要快，得把 85 % 磷酸换成**无水**的 CuSO₄ 干床（缺一条「干床阱」条目）。
 *  ④ CO 标气：`mat/co` 的纯度只有 30–99 %（铁合金副产）⇒ 动态配气 1–100 ppm 的
 *     误差 1–70 % ⇒ **CO 只能半定量 ±30–50 %**；要 99.9 % 的 CO（甲酸脱水或深冷
 *     精馏），缺一条链。CO₂ 从 `mat/co2` 配，±5–10 %。
 *  ⑤ O₂/N₂ 从 `mat/oxygen`（90–99.5 %）与 `mat/nitrogen` 配 ⇒ ±5–10 %。
 *  ⑥ 氢载气下 H₂ 测不了（载气本底 100 %）；由 Ar 载气那一次覆盖，但**两次进样**
 *     要求样品量 ≥5 g、两次之间不能换批。
 *  ⑦ 无 H₂ 传感器（0 台）而柱箱 80–100 °C、H₂ 载气 20 mL/min、爆炸限 4–75 % ——
 *     与 `data/machine/trace-analysis.ts` §八 ⑧ 是同一处缺口。
 *  ⑧ 只证六项：CH₄、H₂S、总烃、金属、有机物不在这条链上（金属在 ICP-MS、有机物
 *     在 GC-MS，CH₄ 缺 FID/甲烷转化炉）⇒ 「99.999 %」的总账仍不完整。
 *  ⑨ 5A 分子筛靠 4A + CaCl₂ 交换自制（交换度 70–95 %）；交换度 <75 % 时 O₂/N₂
 *     分离度从 1.5 掉到 1.1 ⇒ 该批重做（`mat/zeolite-5a` 的 exchangeRate）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { NH3_GAS_HW_ITEMS, NH3_GAS_HW_ROUTES } from '../../data/machine/nh3-gas.ts';
 *   import { NH3_GAS_MEASURE_ITEMS, NH3_GAS_MEASURE_ROUTES } from '../../data/measure/nh3-gas.ts';
 *   items:  [...NH3_GAS_HW_ITEMS, ...NH3_GAS_MEASURE_ITEMS]
 *   routes: [...NH3_GAS_HW_ROUTES, ...NH3_GAS_MEASURE_ROUTES]
 *
 * ⚠️ 两个文件**都要注册**：只注册 machine 那一半，`measure/nh3-*` 会 `unknown_item`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、仪器与零件：氨阱 → 水分仪 → 5A → GC-TCD 六件 → 两台整机
// ═══════════════════════════════════════════════════════════════════════════

export const NH3_GAS_HW_ITEMS: readonly Item[] = [
  /**
   * **氨阱：85 % 磷酸珠床 + CuSO₄ 指示层。整条气体链的第一件，也是核心。**
   *
   *   nh3Capacity        220–280 mg（1.5 g 85 % 磷酸 = 13 mmol H⁺ ⇒ 221 mg NH₃）
   *   breakthrough       0.02–0.05 ppm（出口残余 NH₃；CuSO₄ 变蓝即换）
   *   o2Recovery         99.5–99.9 %（溶解度 1.3×10⁻³ mol/(L·atm)，膜里只存 3×10⁻¹² mol）
   *   coRecovery         99.5–99.8 %
   *   co2Recovery        95–98 %（**预平衡 1–2 h 之后**；膜里先溶 4.5–6.7 µmol）
   *   co2Equilibration   1–2 h
   *   pressureDrop       0.8–1.5 kPa（100 mm 床、2–6 cm/s 线速度）
   *
   * ⚠️ 它是**消耗件式的零件**：吸满 220 mg NH₃ 或 CuSO₄ 变蓝就换。10 ppm、
   * 100 mL/min 的工况下 4 800 h 一换；1 ppm 下 48 000 h。
   */
  {
    id: 'plant/nh3-absorber',
    name: 'Ammonia Trap', name_zh: '氨阱',
    unit: '件',
    category: 'part',
    props: [
      { param: 'nh3Capacity', kind: 'range', min: 200, max: 300, unit: 'mg' },
      { param: 'breakthrough', kind: 'range', min: 0.01, max: 0.05, unit: 'ppm', dir: 'atMost' },
      { param: 'o2Recovery', kind: 'range', min: 99.5, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'coRecovery', kind: 'range', min: 99.5, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'co2Recovery', kind: 'range', min: 95, max: 99, unit: '%', dir: 'atLeast' },
      { param: 'co2Equilibration', kind: 'range', min: 1, max: 3, unit: 'h', dir: 'atMost' },
      { param: 'pressureDrop', kind: 'range', min: 0.5, max: 2, unit: 'kPa' },
    ],
  },

  /**
   * **无铜取样板。** 316L 阀体 + PTFE 阀座 + 伴热 45–55 °C，死体积 4–6 cm³。
   *
   *   sampleFlow     80–150 mL/min
   *   heatTrace      45–55 °C（水汽在管壁上凝，读数就偏低）
   *   deadVolume     4–6 cm³（≤6 s 换气）
   *   leakRate       1e-4–5e-4 Pa·L/s
   *   nh3Resistance  316L+PTFE
   *
   * ⚠️ **不能用 `plant/dew-point-meter/sample-panel`**：那块板是铜针阀（`make/
   * dewpoint-sample-panel` 的注释写着「车铜针阀」）。湿氨与铜生成
   * [Cu(NH₃)₄]²⁺ ⇒ 阀座被蚀、铜离子随气流进电解池（池的膜被金属污染）。
   * 这块板是本文件唯一「因为氨而必须新做」的零件。
   */
  {
    id: 'plant/nh3-moisture-analyzer/sample-panel',
    name: 'Electrolytic Moisture Analyzer Copper-Free Sampling Panel', name_zh: '电解式水分仪无铜取样板',
    unit: '件',
    category: 'part',
    props: [
      { param: 'sampleFlow', kind: 'range', min: 50, max: 200, unit: 'mL/min' },
      { param: 'heatTrace', kind: 'range', min: 40, max: 60, unit: '°C' },
      { param: 'deadVolume', kind: 'range', min: 3, max: 10, unit: 'cm³', dir: 'atMost' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-3, unit: 'Pa·L/s', dir: 'atMost' },
      { param: 'nh3Resistance', kind: 'enum', values: ['316L+PTFE'] },
    ],
  },

  /**
   * **同批干燥 NH₃ 零气发生器：4A 分子筛床（先预饱和 NH₃）。**
   *
   *   outletWater  0.05–0.08 ppm（水被 4A 强吸附；NH₃ 在预饱和之后穿过去）
   *   nh3Pass      95–99 %（预饱和 10 h 后的穿透率）
   *   capacity     2 000–5 000 h（20 g 4A 吸 4 g 水；10 ppm/100 mL/min = 48 µg/h）
   *
   * 它只干一件事：把**同批** NH₃ 的水降到 0.05–0.1 ppm，让电解池的 NH₃ 交叉项
   * 在样品与零气之间相消（§一②）。**不是**「零水」，所以 0.1 ppm 以下证不了。
   */
  {
    id: 'plant/nh3-moisture-analyzer/dry-zero',
    name: 'Same-Batch Dry NH₃ Zero Gas Generator', name_zh: '同批干燥 NH₃ 零气发生器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'outletWater', kind: 'range', min: 0.05, max: 0.1, unit: 'ppm', dir: 'atMost' },
      { param: 'nh3Pass', kind: 'range', min: 95, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'capacity', kind: 'range', min: 1000, max: 5000, unit: 'h', dir: 'atLeast' },
    ],
  },

  /**
   * **电解式水分仪。复用 `plant/dew-point-meter/electrolytic-cell`，换板、加零气路。**
   *
   *   water          0.1–100 ppm（法拉第：1 ppm = 14.3 µA @100 mL/min）
   *   detectionLimit 0.1–0.2 ppm（池空白 0.02–0.05 + 零气 0.05–0.1）
   *   responseTime   60–180 s 到 90 %
   *   nh3Offset      0.02–0.05 ppm（同批干氨标零之后的残余）
   *   holds          20–45 °C（池恒温，防膜吸水/析出）
   */
  {
    id: 'plant/nh3-moisture-analyzer',
    name: 'Electrolytic Moisture Analyzer', name_zh: '电解式水分仪',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'temperature', min: 20, max: 45 }],
    props: [
      { param: 'measure/water', kind: 'range', min: 0.1, max: 100, unit: 'ppm' },
      { param: 'measure/detectionLimit', kind: 'range', min: 0.05, max: 0.5, unit: 'ppm', dir: 'atMost' },
      { param: 'measure/responseTime', kind: 'range', min: 30, max: 600, unit: 's', dir: 'atMost' },
      { param: 'measure/nh3Offset', kind: 'range', min: 0, max: 0.1, unit: 'ppm', dir: 'atMost' },
    ],
  },

  /**
   * **5A 分子筛（Ca 交换的 4A）。** GC-TCD 的 O₂/N₂/CO 柱靠它。
   *
   *   exchangeRate 75–90 %（Ca²⁺ 换掉 4A 里的 Na⁺；低于 75 % 分离度掉一半）
   *   poreSize     0.5 nm（4A 是 0.4 nm；0.5 才容得下 N₂ 的动力学直径 0.36 nm
   *                而把 O₂ 分开）
   *
   * 做法：4A + 10 % CaCl₂ 溶液 80 °C 交换 4 h × 2 次 → 洗到无 Cl⁻ → 110 °C 干燥
   * → 350 °C 活化 4 h。**这是本层第一次做 5A**（`make/zeolite` 只到 4A）。
   */
  {
    id: 'mat/zeolite-5a',
    name: '5A Molecular Sieve', name_zh: '5A 分子筛',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'exchangeRate', kind: 'range', min: 70, max: 95, unit: '%', dir: 'atLeast' },
      { param: 'poreSize', kind: 'range', min: 0.45, max: 0.55, unit: 'nm' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 二、GC-TCD 的六件
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * **六通进样阀 + 1/5 mL 定量环。**
   *
   *   loopVolume   3–5 mL（5 mL 时 TCD 的 1 ng 最小可检量 ⇒ 0.16 ppm）
   *   leakRate     1e-4–5e-4 Pa·L/s
   *   temperature  40–60 °C（伴热，防 NH₃ 盐在阀里析出）
   */
  {
    id: 'plant/gc-tcd/sample-valve',
    name: '6-Port Injection Valve', name_zh: '六通进样阀',
    unit: '件',
    category: 'part',
    props: [
      { param: 'loopVolume', kind: 'range', min: 1, max: 5, unit: 'mL' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-3, unit: 'Pa·L/s', dir: 'atMost' },
      { param: 'temperature', kind: 'range', min: 40, max: 80, unit: '°C' },
    ],
  },

  /**
   * **5A 分子筛柱：2 m × φ3 mm 不锈钢，60–80 目，350 °C 活化。**
   *
   *   length      2–2.5 m
   *   mesh        60–80
   *   activation  330–370 °C（水脱到 <0.05 % 才有分离度）
   *
   * 50 °C、20 mL/min 下：H₂ 2.0 min、O₂ 4.1 min、N₂ 5.6 min、CO 12.5 min（氢载）；
   * O₂/N₂ 分离度 ≥1.5（交换度 ≥75 % 时）。
   */
  {
    id: 'plant/gc-tcd/mol-sieve-column',
    name: '5A Molecular Sieve Column', name_zh: '5A 分子筛柱',
    unit: '件',
    category: 'part',
    props: [
      { param: 'length', kind: 'range', min: 1.5, max: 3, unit: 'm' },
      { param: 'mesh', kind: 'range', min: 60, max: 80, unit: '目' },
      { param: 'activation', kind: 'range', min: 300, max: 380, unit: '°C' },
    ],
  },

  /**
   * **硅胶柱：1 m × φ3 mm，60–80 目，200 °C 活化，专门出 CO₂。**
   *
   *   length      1–1.2 m
   *   mesh        60–80
   *   temperature 60–100 °C
   *
   * 80 °C、20 mL/min（氢载）下 CO₂ 6.8 min；CO₂ 在 5A 上不可逆吸附，所以必须
   * 单独一根柱（两柱并联、阀切换）。
   */
  {
    id: 'plant/gc-tcd/silica-column',
    name: 'GC-TCD Silica Gel Column', name_zh: 'GC-TCD 硅胶柱',
    unit: '件',
    category: 'part',
    props: [
      { param: 'length', kind: 'range', min: 0.8, max: 1.5, unit: 'm' },
      { param: 'mesh', kind: 'range', min: 60, max: 80, unit: '目' },
      { param: 'temperature', kind: 'range', min: 40, max: 120, unit: '°C' },
    ],
  },

  /**
   * **四丝热导池。** φ0.05 钨丝 ×4（惠斯通桥），池体 80–150 µL，100–140 °C。
   *
   *   filaments    4（一对测量、一对参比）
   *   sensitivity  10–20 mV·mL/µg（对 N₂，氢载）
   *   cellVolume   80–150 µL（大了峰变胖，小了丝被吹凉）
   *   temperature  100–140 °C（低于 100 水汽会凝在池里）
   *
   * ⚠️ 丝是**钨**不是钨铼：本层没有铼（`mat/rhenium` 0 条目）。钨在 140 °C、
   * 氢载下够用；寿命 2 000–5 000 h（每次通 O₂ 会氧化一点，O₂ 是待测项，认了）。
   */
  {
    id: 'plant/gc-tcd/tcd-cell',
    name: 'GC-TCD Four-Wire Thermal Conductivity Cell', name_zh: 'GC-TCD 四丝热导池',
    unit: '件',
    category: 'part',
    props: [
      { param: 'filaments', kind: 'range', min: 2, max: 4, unit: '只' },
      { param: 'sensitivity', kind: 'range', min: 5, max: 20, unit: 'mV·mL/µg', dir: 'atLeast' },
      { param: 'cellVolume', kind: 'range', min: 50, max: 200, unit: 'µL', dir: 'atMost' },
      { param: 'temperature', kind: 'range', min: 80, max: 150, unit: '°C' },
    ],
  },

  /**
   * **柱温箱：40–110 °C、±0.1–0.3 °C。**
   *
   *   temperature  40–110 °C
   *   stability    0.1–0.3 °C（保留时间的重复性靠它；GC-TCD 不要求程序升温）
   */
  {
    id: 'plant/gc-tcd/oven',
    name: 'GC-TCD Column Oven', name_zh: 'GC-TCD 柱温箱',
    unit: '件',
    category: 'part',
    composedOf: [
      { item: 'plant/gc-tcd/oven/shell', qty: q(1) },
      { item: 'plant/gc-tcd/oven/insulation', qty: q(1) },
      { item: 'plant/gc-tcd/oven/heater', qty: q(1) },
      { item: 'std/ramp-controller-general', qty: q(1) },
      { item: 'std/thermocouple-t-general', qty: q(1) },
      { item: 'std/contactor-general', qty: q(1) },
    ],
    props: [
      { param: 'temperature', kind: 'range', min: 40, max: 120, unit: '°C' },
      { param: 'stability', kind: 'range', min: 0.1, max: 0.5, unit: '°C', dir: 'atMost' },
    ],
  },

  { id: 'plant/gc-tcd/oven/shell', name: 'Oven Shell', name_zh: '炉壳', unit: '件', category: 'part' },
  { id: 'plant/gc-tcd/oven/insulation', name: 'Oven Insulation', name_zh: '炉体保温', unit: '件', category: 'part' },
  { id: 'plant/gc-tcd/oven/heater', name: 'Oven Heating Element', name_zh: '炉丝', unit: '件', category: 'part' },

  /**
   * **载气板：Ar/H₂ 两路切换 + 三级净化床（4A / 200 °C 铜屑 / 500 °C 镁屑）。**
   *
   *   carrier         Ar 或 H₂（两次进样）
   *   carrierPurity   99.9999 %（N₂、O₂ 各 <0.1 ppm）
   *   pressure        150–250 kPa（柱前压）
   *
   * ⚠️ 镁床在 500 °C 吸 N₂（3Mg + N₂ → Mg₃N₂），1 g 吸 14 mg N₂；20 mL/min 的
   * 10 ppm N₂ 是 15 µg/h ⇒ 900 h/g。没有它，99.999 % 的氢载气里 5–10 ppm 的 N₂
   * 会把 N₂ 通道压死（§二③）。
   */
  {
    id: 'plant/gc-tcd/carrier-panel',
    name: 'GC-TCD Carrier Gas Panel', name_zh: 'GC-TCD 载气板',
    unit: '件',
    category: 'part',
    props: [
      { param: 'carrier', kind: 'enum', values: ['Ar', 'H2'] },
      { param: 'carrierPurity', kind: 'range', min: 99.999, max: 99.99999, unit: '%', dir: 'atLeast' },
      { param: 'pressure', kind: 'range', min: 100, max: 300, unit: 'kPa' },
    ],
  },

  /**
   * **GC-TCD 整机。六项气体杂质的检测器。**
   *
   *   oxygen          0.2–5 ppm     （氢载、5A 柱、5 mL 环）
   *   nitrogen        0.2–5 ppm     （同上；载气 N₂ <0.1 ppm 靠镁床）
   *   carbonMonoxide  0.5–10 ppm    （氢载；标气半定量，见缺口④）
   *   carbonDioxide   1–10 ppm      （氢载、硅胶柱；阱预平衡 1–2 h）
   *   hydrogen        0.1–5 ppm     （**氩载**；Δλ 0.169，最好测的一格）
   *   speciesCount    5（O₂/N₂/CO/CO₂/H₂）
   *
   * 三个 `holds`：柱温 40–120 °C、柱前压 0.9–2 bar。
   */
  {
    id: 'plant/gc-tcd',
    name: 'GC-TCD System', name_zh: 'GC-TCD 整机',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 40, max: 120 },
      { param: 'pressure', min: 9e4, max: 2e5 },
    ],
    props: [
      { param: 'oxygen', kind: 'range', min: 0.1, max: 1000, unit: 'ppm' },
      { param: 'nitrogen', kind: 'range', min: 0.1, max: 1000, unit: 'ppm' },
      { param: 'carbonMonoxide', kind: 'range', min: 0.2, max: 1000, unit: 'ppm' },
      { param: 'carbonDioxide', kind: 'range', min: 0.5, max: 1000, unit: 'ppm' },
      { param: 'hydrogen', kind: 'range', min: 0.1, max: 1000, unit: 'ppm' },
      { param: 'speciesCount', kind: 'range', min: 3, max: 6, unit: '个' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线：氨阱 → 水分仪 → 5A → GC-TCD 六件 → 两台整机
// ═══════════════════════════════════════════════════════════════════════════

export const NH3_GAS_HW_ROUTES: readonly Route[] = [
  {
    /**
     * **氨阱：吹玻璃管 → 玻璃珠成球 → 浸 85 % 磷酸 → 装管与指示层。**
     *
     *   磷酸 1.5 g + 玻璃 20 g + 硫酸铜 2 g + PTFE 2 g → 阱 1 件
     *
     * 珠子 2–4 mm（太小压降大、太大膜面积不够）；膜厚 5–20 µm（沥干 10 min 自然成膜）；
     * 酸床 100 mm + 指示床 20 mm + PTFE 端塞。装完称重，记装酸量（决定容量）。
     */
    id: 'make/nh3-absorber',
    name: 'Ammonia Trap Manufacturing', name_zh: '氨阱制造',
    produces: [
      {
        item: 'plant/nh3-absorber',
        qty: q(1),
        gives: [
          { param: 'nh3Capacity', kind: 'range', min: 220, max: 280 },
          { param: 'breakthrough', kind: 'range', min: 0.02, max: 0.05 },
          { param: 'o2Recovery', kind: 'range', min: 99.5, max: 99.9 },
          { param: 'coRecovery', kind: 'range', min: 99.5, max: 99.8 },
          { param: 'co2Recovery', kind: 'range', min: 95, max: 98 },
          { param: 'co2Equilibration', kind: 'range', min: 1, max: 2 },
          { param: 'pressureDrop', kind: 'range', min: 0.8, max: 1.5 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/phosphoric-acid',
            qty: q(3, 2000),
            need: [{ param: 'concentration', kind: 'range', min: 80, max: 85 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/copper-sulfate', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 500) }] },
    ],
    needs: ['plant/metrology-room', 'plant/micro-balance'],
    steps: [
      { note_zh: '吹 φ10×150 mm 玻璃管、两端收成 φ6 球口（1900–2200 °C）', performedBy: 'plant/glass-lathe', under: [{ param: 'temperature', min: 1900, max: 2200 }] },
      { note_zh: '筛 2–4 mm 玻璃珠、火头成球（同一台玻璃车床）', performedBy: 'plant/glass-lathe', under: [{ param: 'temperature', min: 1900, max: 2200 }] },
      { note_zh: '珠子浸 85 % 磷酸 10 min、沥干 10 min 成膜（5–20 µm），称装酸量', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装管：酸珠床 100 mm + CuSO₄ 指示珠 20 mm + PTFE 端塞；通气测压降（0.8–1.5 kPa）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(8) },
    unbalanced_zh: '磷酸 0.0015 + 玻璃 0.02 + 硫酸铜 0.002 + PTFE 0.002 → 氨阱 1 件；余是玻璃管切头与筛下的碎珠。按件计',
  },

  {
    /**
     * **无铜取样板：车 316L 阀体与孔板 → 装 PTFE 阀座 → 打压 0.3 MPa 检漏。**
     *
     *   316L 0.5 + PTFE 0.02 + 矿棉 0.02 → 取样板 1 件
     *   80–150 mL/min、45–55 °C 伴热、死体积 4–6 cm³。
     */
    id: 'make/nh3-moisture-sample-panel',
    name: 'Electrolytic Moisture Analyzer Copper-Free Sampling Panel Manufacturing', name_zh: '电解式水分仪无铜取样板制造',
    produces: [
      {
        item: 'plant/nh3-moisture-analyzer/sample-panel',
        qty: q(1),
        gives: [
          { param: 'sampleFlow', kind: 'range', min: 80, max: 150 },
          { param: 'heatTrace', kind: 'range', min: 45, max: 55 },
          { param: 'deadVolume', kind: 'range', min: 4, max: 6 },
          { param: 'leakRate', kind: 'range', min: 1e-4, max: 5e-4 },
          { param: 'nh3Resistance', kind: 'enum', oneOf: ['316L+PTFE'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1, 50) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车 316L 阀体与 φ0.15/φ0.25 孔板两片（30° 锥面配研）', performedBy: 'lathe' },
      { note_zh: '装 PTFE 阀座、端塞与伴热带；打压 0.3 MPa 保压 30 min（氨会钻 PTFE 微孔，漏率要 ≤5e-4）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '流量标定：气泡计数法两档 80/150 mL/min', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(20) },
    unbalanced_zh: '316L 0.5 + PTFE 0.02 + 矿棉 0.02 → 取样板 1 件；余是车屑。按件计',
  },

  {
    /**
     * **零气发生器：装 4A 床 → 350 °C 活化 → 同批 NH₃ 预饱和 → 标出口水。**
     *
     *   4A 20 g + 316L 0.1 + 钢板 0.2 + 热电偶 1 → 零气发生器 1 件
     *   出口水 0.05–0.08 ppm、NH₃ 穿透 95–99 %、容量 2 000–5 000 h。
     *
     * ⚠️ 预饱和是关键：新 4A 会先把 NH₃ 吸干（出口 NH₃ = 0），那不是零气、是氮气。
     * 用同批 NH₃ 通 10 h 到出口 NH₃ 与进口一致，再开始用。
     */
    id: 'make/nh3-moisture-dry-zero',
    name: 'Same-Batch Dry NH₃ Zero Gas Generator Manufacturing', name_zh: '同批干燥 NH₃ 零气发生器制造',
    produces: [
      {
        item: 'plant/nh3-moisture-analyzer/dry-zero',
        qty: q(1),
        gives: [
          { param: 'outletWater', kind: 'range', min: 0.05, max: 0.08 },
          { param: 'nh3Pass', kind: 'range', min: 95, max: 99 },
          { param: 'capacity', kind: 'range', min: 2000, max: 5000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/zeolite-4a', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 5) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/micro-balance'],
    steps: [
      { note_zh: '装 4A 床（20 g、60–80 目）与进出口过滤', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '350 °C 活化 4 h（干氮吹扫 50 mL/min），冷后封口', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 330, max: 370 }] },
      { note_zh: '同批 NH₃ 预饱和 10 h（出口 NH₃ 与进口一致才算饱和）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '标出口水：与电解池联用，读 0.05–0.08 ppm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(30) },
    unbalanced_zh: '4A 0.02 + 316L 0.1 + 钢板 0.2 + 热电偶 1 → 零气发生器 1 件；按件计（4A 吸的水与氨不折质量）',
  },

  {
    /**
     * **水分仪装配：复用聚磷酸池 + 新取样板 + 零气路 + 皮安表。**
     *
     *   `plant/dew-point-meter/electrolytic-cell` 1（复用，12–15 µA/ppm）
     *   + 取样板 1 + 零气发生器 1 + 接触器 1 + 钢板 5 → 水分仪 1 台
     *
     * 四道工序：装池与板 → 接零气与伴热 → 空白测试（干氮 1 h，电流 ≤3 µA）→
     * 三点标定（0.1/1/10 ppm，用零气 + 加湿法配）。
     */
    id: 'make/nh3-moisture-analyzer',
    name: 'Moisture Analyzer Assembly', name_zh: '水分仪装配',
    produces: [
      {
        item: 'plant/nh3-moisture-analyzer',
        qty: q(1),
        gives: [
          { param: 'measure/water', kind: 'range', min: 0.1, max: 100 },
          { param: 'measure/detectionLimit', kind: 'range', min: 0.1, max: 0.2 },
          { param: 'measure/responseTime', kind: 'range', min: 60, max: 180 },
          { param: 'measure/nh3Offset', kind: 'range', min: 0.02, max: 0.05 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/dew-point-meter/electrolytic-cell', qty: q(1) }] },
      { anyOf: [{ item: 'plant/nh3-moisture-analyzer/sample-panel', qty: q(1) }] },
      { anyOf: [{ item: 'plant/nh3-moisture-analyzer/dry-zero', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(5) }] },
    ],
    needs: ['plant/picoammeter', 'plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '① 装池与取样板：池两端 PTFE 垫、板出口 6 mm 到池入口，死体积 ≤10 cm³', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 接零气发生器与伴热（板 45–55 °C、池 30–40 °C）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 空白：干氮 50 mL/min 吹 1 h，电流 ≤3 µA；再通同批 NH₃ 读 I₀（NH₃ 交叉项）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 三点标定：0.1/1/10 ppm（加湿法：注射泵把水打进干氮，用 `plant/micro-balance` 称量），斜率应在 12–15 µA/ppm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(40) },
    unbalanced_zh: '池 1 + 取样板 1 + 零气发生器 1 + 接触器 1 + 钢板 5 → 水分仪 1 台；按件计',
  },

  {
    /**
     * **5A 分子筛：4A + 10 % CaCl₂ 交换 → 洗 → 干燥 → 活化。**
     *
     *   4A 1 + 氯化钙 0.15 + 水 3 → 5A 0.9（收率 90 %）
     *
     * 80 °C 交换 4 h × 2 次（Ca²⁺ 换 Na⁺，交换度 75–90 %）；洗到无 Cl⁻（AgNO₃ 检）；
     * 110 °C 干燥 4 h、350 °C 活化 4 h。
     */
    id: 'make/zeolite-5a',
    name: '5A Molecular Sieve Production', name_zh: '5A 分子筛制备',
    produces: [
      {
        item: 'mat/zeolite-5a',
        qty: q(9, 10),
        gives: [
          { param: 'exchangeRate', kind: 'range', min: 75, max: 90 },
          { param: 'poreSize', kind: 'range', min: 0.5, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/zeolite-4a', qty: q(1) }] },
      { anyOf: [{ item: 'mat/calcium-chloride', qty: q(3, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(3) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '配 10 % CaCl₂、80 °C 交换 4 h，滤出再换新液一次（两次交换）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 70, max: 90 }] },
      { note_zh: '洗到无 Cl⁻（AgNO₃ 不浑），抽滤', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '110 °C 干燥 4 h、350 °C 活化 4 h（干氮吹）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 330, max: 370 }] },
      { note_zh: '取样测交换度（滴定 Na⁺）与 O₂/N₂ 分离度（1 m 柱、50 °C），<75 % 重做', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(48) },
    unbalanced_zh: '4A 1 + 氯化钙 0.15 + 水 3 → 5A 0.9；余 0.25 是交换废液与洗水（Na⁺ 与过量 Ca²⁺ 走水），3 kg 水不折进产品',
  },

  {
    /**
     * **六通进样阀：车阀体与阀芯 → 配研密封面 → 装 1/5 mL 定量环。**
     *
     *   316L 0.6 + PTFE 0.02 → 阀 1 件
     *   环 3–5 mL、漏率 1e-4–5e-4、伴热 40–60 °C。
     */
    id: 'make/gc-tcd-sample-valve',
    name: '6-Port Injection Valve Manufacturing', name_zh: '六通进样阀制造',
    produces: [
      {
        item: 'plant/gc-tcd/sample-valve',
        qty: q(1),
        gives: [
          { param: 'loopVolume', kind: 'range', min: 3, max: 5 },
          { param: 'leakRate', kind: 'range', min: 1e-4, max: 5e-4 },
          { param: 'temperature', kind: 'range', min: 40, max: 60 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(3, 5) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 50) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车阀体与阀芯（6 通、30° 配研锥面）', performedBy: 'lathe' },
      { note_zh: '配研密封面（红丹检查，接触带 ≥80 %）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装 3/5 mL 定量环与 PTFE 阀座；0.2 MPa 检漏', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(16) },
    unbalanced_zh: '316L 0.6 + PTFE 0.02 → 阀 1 件；余是车屑。按件计',
  },

  {
    /**
     * **5A 柱：填 5A → 350 °C 活化 4 h（干氮）→ 检漏。**
     *
     *   5A 0.05 + 316L 0.2 → 柱 1 根
     *   2–2.5 m、60–80 目、活化 330–370 °C。
     */
    id: 'make/gc-tcd-mol-sieve-column',
    name: '5A Molecular Sieve Column Manufacturing', name_zh: '5A 分子筛柱制造',
    produces: [
      {
        item: 'plant/gc-tcd/mol-sieve-column',
        qty: q(1),
        gives: [
          { param: 'length', kind: 'range', min: 2, max: 2.5 },
          { param: 'mesh', kind: 'range', min: 60, max: 80 },
          { param: 'activation', kind: 'range', min: 330, max: 370 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/zeolite-5a', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '填柱：边填边敲，充填密度 0.6–0.7 g/cm³；两端玻璃棉 + 卡套', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '350 °C 活化 4 h（干氮 20 mL/min 吹），冷后封口', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 330, max: 370 }] },
      { note_zh: '检漏与柱效：O₂/N₂ 分离度 ≥1.5（50 °C、20 mL/min）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(12) },
    unbalanced_zh: '5A 0.05 + 316L 0.2 → 柱 1 根；余是筛下细粉与切头。按件计',
  },

  {
    /**
     * **硅胶柱：酸洗硅胶 → 填柱 → 200 °C 活化。**
     *
     *   硅胶 0.03 + 316L 0.15 → 柱 1 根
     *   1–1.2 m、60–80 目、60–100 °C（CO₂ 6.8 min 出峰）。
     */
    id: 'make/gc-tcd-silica-column',
    name: 'GC-TCD Silica Gel Column Manufacturing', name_zh: 'GC-TCD 硅胶柱制造',
    produces: [
      {
        item: 'plant/gc-tcd/silica-column',
        qty: q(1),
        gives: [
          { param: 'length', kind: 'range', min: 1, max: 1.2 },
          { param: 'mesh', kind: 'range', min: 60, max: 80 },
          { param: 'temperature', kind: 'range', min: 60, max: 100 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silica', qty: q(3, 100) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(3, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '硅胶用 1 M 盐酸洗 2 h、水洗到中性、110 °C 干燥（金属离子会把 CO₂ 峰拖尾）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 60 }] },
      { note_zh: '填柱 1–1.2 m、60–80 目；两端玻璃棉', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '200 °C 活化 4 h（干氮），冷后测 CO₂ 保留时间 6.8 min', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 190, max: 210 }] },
    ],
    rate: { hours: q(10) },
    unbalanced_zh: '硅胶 0.03 + 316L 0.15 → 柱 1 根；余是筛下细粉与洗液。按件计',
  },

  {
    /**
     * **热导池：绕 4 只钨丝 → 装池体 → 配桥路 → 老化。**
     *
     *   钨粉 0.003 + 316L 0.25 + 氧化铝 2 + 金 0.002 → 池 1 件
     *   4 丝、10–20 mV·mL/µg、池体 80–150 µL、100–140 °C。
     */
    id: 'make/gc-tcd-tcd-cell',
    name: 'GC-TCD Four-Wire Thermal Conductivity Cell Manufacturing', name_zh: 'GC-TCD 四丝热导池制造',
    produces: [
      {
        item: 'plant/gc-tcd/tcd-cell',
        qty: q(1),
        gives: [
          { param: 'filaments', kind: 'range', min: 4, max: 4 },
          { param: 'sensitivity', kind: 'range', min: 10, max: 20 },
          { param: 'cellVolume', kind: 'range', min: 80, max: 150 },
          { param: 'temperature', kind: 'range', min: 100, max: 140 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(3, 1000) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 4) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 500) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '拉 φ0.05 钨丝、绕成 4 只 8 mm 螺旋（阻值配对 ±1 %）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '车池体（80–150 µL）与丝座，氧化铝绝缘', performedBy: 'lathe' },
      { note_zh: '装桥路（金引线），100 °C、100 mA 老化 24 h；失衡 <0.1 mV', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(30) },
    unbalanced_zh: '钨粉 0.003 + 316L 0.25 + 氧化铝 2 + 金 0.002 → 池 1 件；余是拉丝断头与车屑。按件计',
  },

  {
    /**
     * 柱温箱炉体：钢板箱体，8 kg 薄板剪折焊。
     */
    id: 'make/gc-tcd-oven-shell',
    name: 'Oven Shell Manufacturing', name_zh: '炉壳制造',
    produces: [{ item: 'plant/gc-tcd/oven/shell', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(8) }] }],
    needs: [],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(8) },
    unbalanced_zh: '钢板 8 → 炉体 1 件；按件计',
  },

  {
    /**
     * 柱温箱保温层：矿棉 1 kg，填在炉体与内胆之间。
     */
    id: 'make/gc-tcd-oven-insulation',
    name: 'Oven Insulation Manufacturing', name_zh: '炉体保温制造',
    produces: [{ item: 'plant/gc-tcd/oven/insulation', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/mineral-wool', qty: q(1) }] }],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(2) },
    unbalanced_zh: '矿棉 1 → 保温层 1 件；按件计',
  },

  {
    /**
     * 柱温箱加热器：铜线 0.3 kg 绕在炉体内壁。
     */
    id: 'make/gc-tcd-oven-heater',
    name: 'Oven Heating Element Manufacturing', name_zh: '炉丝制造',
    produces: [{ item: 'plant/gc-tcd/oven/heater', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/copper-wire', qty: q(3, 10) }] }],
    needs: [],
    performedBy: 'plant/winder',
    rate: { hours: q(4) },
    unbalanced_zh: '铜线 0.3 → 加热器 1 件；按件计',
  },

  {
    /**
     * **柱温箱：40–110 °C、±0.1–0.3 °C。**
     *
     * 总装：炉体 + 保温层 + 加热器 + 控温器 + 热电偶 + 接触器。
     * 子件路线见 make/gc-tcd-oven-shell / -insulation / -heater。
     */
    id: 'make/gc-tcd-oven',
    name: 'GC-TCD Column Oven Manufacturing', name_zh: 'GC-TCD 柱温箱制造',
    produces: [
      {
        item: 'plant/gc-tcd/oven',
        qty: q(1),
        gives: [
          { param: 'temperature', kind: 'range', min: 40, max: 110 },
          { param: 'stability', kind: 'range', min: 0.1, max: 0.3 },
        ],
      },
    ],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(16) },
    unbalanced_zh: '炉体/保温层/加热器 + 控温器/热电偶/接触器各 1 → 柱温箱 1 件；按件计',
  },

  {
    /**
     * **载气板：Ar/H₂ 切换阀 + 三级净化床（4A / 200 °C 铜屑 / 500 °C 镁屑）。**
     *
     *   316L 0.8 + 铜 0.1 + 镁 0.005 + 4A 0.02 + 电阻丝 0.02 + 热电偶 1 + 接触器 1 → 1 件
     *   carrier Ar/H₂、纯度 99.9999 %、柱前压 150–250 kPa。
     *
     * ⚠️ 镁床 500 °C 吸 N₂；铜床 200 °C 吸 O₂；4A 吸 H₂O/CO₂。三级串联后才到 99.9999 %。
     */
    id: 'make/gc-tcd-carrier-panel',
    name: 'GC-TCD Carrier Gas Panel Manufacturing', name_zh: 'GC-TCD 载气板制造',
    produces: [
      {
        item: 'plant/gc-tcd/carrier-panel',
        qty: q(1),
        gives: [
          { param: 'carrier', kind: 'enum', oneOf: ['Ar', 'H2'] },
          { param: 'carrierPurity', kind: 'range', min: 99.9999, max: 99.9999 },
          { param: 'pressure', kind: 'range', min: 150, max: 250 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(4, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/magnesium', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/zeolite-4a', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 50) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车阀体、三只净化床（φ20×100 mm）与切换阀（PTFE 座）', performedBy: 'lathe' },
      { note_zh: '装 4A 床、铜屑床（200 °C）、镁屑床（500 °C）与电阻丝加热/热电偶', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '500 °C 活化镁床 2 h（真空中除气，封前不得见空气）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 480, max: 520 }] },
      { note_zh: '检漏（0.5 MPa 保压 30 min）与出口纯度标定（N₂/O₂ 各 <0.1 ppm）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(36) },
    unbalanced_zh: '316L 0.8 + 铜 0.1 + 镁 0.005 + 4A 0.02 + 电阻丝 0.02 + 热电偶/接触器 → 载气板 1 件；按件计',
  },

  {
    /**
     * **GC-TCD 装配：六件 + 机架。**
     *
     *   阀 1 + 5A 柱 1 + 硅胶柱 1 + 池 1 + 炉 1 + 载气板 1 + 接触器 1 + 钢板 20 → 1 台
     *
     * 四道工序：装柱与阀 → 装池与桥路 → 装炉与控温 → 检漏与标定（1/10/100 ppm 动态配气）。
     */
    id: 'make/gc-tcd',
    name: 'GC-TCD Assembly', name_zh: 'GC-TCD 装配',
    produces: [
      {
        item: 'plant/gc-tcd',
        qty: q(1),
        gives: [
          { param: 'oxygen', kind: 'range', min: 0.2, max: 5 },
          { param: 'nitrogen', kind: 'range', min: 0.2, max: 5 },
          { param: 'carbonMonoxide', kind: 'range', min: 0.5, max: 10 },
          { param: 'carbonDioxide', kind: 'range', min: 1, max: 10 },
          { param: 'hydrogen', kind: 'range', min: 0.1, max: 5 },
          { param: 'speciesCount', kind: 'range', min: 5, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/gc-tcd/sample-valve', qty: q(1) }] },
      { anyOf: [{ item: 'plant/gc-tcd/mol-sieve-column', qty: q(1) }] },
      { anyOf: [{ item: 'plant/gc-tcd/silica-column', qty: q(1) }] },
      { anyOf: [{ item: 'plant/gc-tcd/tcd-cell', qty: q(1) }] },
      { anyOf: [{ item: 'plant/gc-tcd/oven', qty: q(1) }] },
      { anyOf: [{ item: 'plant/gc-tcd/carrier-panel', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(20) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '① 装阀与两柱（5A 进 O₂/N₂/CO/H₂；硅胶出 CO₂，阀切换）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 装池与桥路：池体 100–140 °C、参比池同温；失衡 <0.1 mV', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 装炉与控温：40–110 °C、±0.3 °C；柱前压 150–250 kPa', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 检漏（0.2 MPa 保压 30 min；本机不抽真空，压力表读数即可）与标定：动态配气 1/10/100 ppm（Ar/H₂ 两路 MFC 稀释）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(60) },
    unbalanced_zh: '六件 + 接触器 + 钢板 20 → GC-TCD 1 台；按件计',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...NH3_GAS_HW_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...NH3_GAS_HW_ROUTES];
