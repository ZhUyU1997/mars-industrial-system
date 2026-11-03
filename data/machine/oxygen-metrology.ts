/**
 * 氧与水的三件量具 —— 对"没有测氧手段"的正面回答。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、这份文件在回答什么
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 原来的判断是「本层**没有测氧的手段**」，处理办法是"照实写降级、
 * 不自造、不列种子"。那句话在二十多处出现过，每一次都贵：
 *
 * | 文件 | 那句降级 | 代价（带数） |
 * |---|---|---|
 * | `rie.ts` | 刻蚀腔的水汽只能算 12–120 ppm | 水汽是刻蚀的**产物**，判它才知道腔干不干净 |
 * | `ald.ts` | HfO₂ 的氧分压与界面态判不了 | 氧分压决定界面层厚度，界面态 1e13 对判据 1e11 差 100 倍 |
 * | `hafnium.ts:519` | Hf 金属的氧 **500–3000 ppm 是估的** | 判据（核级/靶材）≤1000 ppm，只能说"在同一个量级" |
 * | `mlcc.ts` | 还原气氛烧结（Ni 电极）差 6.7 个数量级 | 氧分压 10⁻¹⁰ 与 10⁻¹⁷ atm 是两种瓷 |
 * | `implant.ts` / `rta.ts` | 残余氧判不了 | 退火的氧沾污不可见，失败不出声 |
 * | `tungsten` / `hafnium` 烧结 · `TiN` 反应溅射 | 良品率 40–60 % 全因氧 | 一张判据表都没有 |
 * | `pcb.ts` | 层间氧化只能看颜色 | 颜色是月变化的函数，不是判据 |
 * | `gate-stack.ts` | 栅氧的氧分压**开环** | 1.5 nm 栅氧的氧化动力学没有分母 |
 * | 燃气/氢氧混合 | 泄漏测不了 | 现判据是"观火孔火焰颜色" |
 *
 * 这份文件造三件量具，**各解掉 #23 的一块**，并把"还剩哪一块"写在 §一问 5（那一段是
 * 本文件的结论：**四块没解**，缺口量级逐条给了）。
 *
 * ┌──┬──────────────────────┬──────────────────────┬────────────────────────────┐
 * │  │ 量具                 │ 解 #23 的哪一块      │ 物理载体                   │
 * ├──┼──────────────────────┼──────────────────────┼────────────────────────────┤
 * │① │ `plant/oxygen-probe` │ **气体中的氧分压**   │ ZrO₂ 固体电解质能斯特电池  │
 * │  │                      │ 10⁻⁶–10⁻¹⁵ atm       │ 700 °C、CaO 稳定、银电极   │
 * ├──┼──────────────────────┼──────────────────────┼────────────────────────────┤
 * │② │ `plant/inert-gas-    │ **金属里的氧含量**   │ 石墨坩埚自身导电 3000 °C   │
 * │  │ fusion-analyzer`     │ 5–5000 ppm           │ 惰气熔融 → CO → 红外       │
 * ├──┼──────────────────────┼──────────────────────┼────────────────────────────┤
 * │③ │ `plant/dew-point-    │ **气体中的水分**     │ P₂O₅ 电解（绝对法）        │
 * │  │ meter`               │ 0.05–1000 ppm        │ + 冷镜（湿端 −20…+20 °C）  │
 * └──┴──────────────────────┴──────────────────────┴────────────────────────────┘
 *
 * **三件都不是新原理**：① 是 1960 年代的汽车氧传感器，② 是 LECO 的惰气熔融炉，
 * ③ 是 1950 年代的 P₂O₅ 电解湿度计。它们缺的从来不是物理，是**本层有没有那几样料**。
 * 所以 §一问 1 的第一件事是 grep。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、五个问题（每个都带数，能被打回的那种）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── 问 1：钇有没有？铂有没有？ ──────────────────────────────────────────────
 *
 * | grep | 命中 | 结论 |
 * |---|---|---|
 * | `mat/yttrium` | **0** | 没有钇 ⇒ **YSZ 做不出来** |
 * | `mat/yttria` | **0** | 没有 Y₂O₃ ⇒ 同上（一条路的两端都没有） |
 * | `mat/platinum` | 当时 **0**（现在有海绵 Pt 与丝/箔） | 多孔 Pt 电极已建（`make/oxygen-probe-electrode-pt`）；Pt 黑镀层仍未建，本文件仍用银（现用路线） |
 * | `mat/zirconia` | **3**（`hafnium.ts:505` 条目、`:1296` `:1356` 两条路线用它） | **有**：purity 97–99.9 %、hfInZr ≤30000 ppm，陶瓷级够 |
 * | `mat/calcium-oxide` | **0** | 没有这个 id —— **但 `mat/lime` 就是 CaO**（`chain.ts:169`，石膏热分解的副产，326 kg/1000 kg） |
 *
 * ⇒ **两条替代，都成立**：
 *   稳定剂   Y₂O₃ → **CaO**（15 mol%，CaSZ）。代价：电导率 0.005–0.01 S/cm 对
 *            8YSZ 的 0.03（700 °C）⇒ **低 3–5 倍**（与题面一致），电池内阻 8.3 Ω 对 1.7 Ω
 *   电极     铂 → **银**。代价：本层的银只到 **95 %**（`make/silver`，`precious.ts:99`
 *            的 gives 是 `min: 95`），5 % 铜在 700 °C 的氧化还原循环里当"氧泵"，
 *            读数偏 1–5 %；且银在 700 °C 有 6×10⁻⁹ atm 的蒸气压，电场下 Ag⁺ 迁移
 *            （ZrO₂ 里迁移数 ~10⁻³）⇒ 电极寿命 500–2000 h（§三·D2）
 *
 * ── 问 2：能斯特电压有多小？毫伏表够不够？ ──────────────────────────────────
 *
 *   E = (RT/4F)·ln(p_ref/p_sample)，**700 °C = 973.15 K 上一个数量级**：
 *
 *     RT/4F = 8.3145 × 973.15 / (4 × 96485.3) = **20.965 mV**（每个 ln 单位）
 *     ×ln10 = **48.27 mV / 数量级**（题面的 48 mV 对；800 °C 上是 53.23 mV）
 *
 *   参比取干空气 **0.2095 atm**，于是整条量程的电压：
 *
 *     10⁻⁶ atm  ⇒ 20.965 × ln(0.2095/1e-6)  = **257 mV**
 *     10⁻¹⁵ atm ⇒ 20.965 × ln(0.2095/1e-15) = **691 mV**
 *     10⁻¹⁸ atm ⇒ 20.965 × ln(0.2095/1e-18) = **836 mV**（外推，§三·D1）
 *
 *   **`std/millivoltmeter-general` 不够，差两处（都要说清）**：
 *
 *     ① 量程：0–30 mV 满度 / 100 格 = **300 µV/格**。48.27 mV 是 30 mV 的 **1.61 倍**
 *        —— **一个数量级就超满度**，0.26–0.84 V 那一段它一格也读不到。
 *     ② 分辨：300 µV/格 = 48.27 mV 的 **0.62 %** ⇒ 一个数量级只能读到 6.2×10⁻³ 个，
 *        要判"差一个数量级"（0.1 个数量级档）勉强，要判 **0.01 个数量级**（比值 1.023）就不够。
 *
 *   **读数方案 = 指零法（电位差计），与 `probe-station.ts` §三·问 2 同一个族**：
 *
 *     齐纳 6.2 V（±0.1 %、TC ≤50 ppm/K、盒内恒温 ±0.5 K）
 *       → 同一根铜丝绕的 5 位十进制分压器（比率靠"同丝同温"，不靠绝对值，`mat/copper-wire`）
 *       → **62 µV/步**（6.2 V / 10⁵），刻度盘 1/10 内插 = **6 µV**
 *     被测 E 与分压器反向串联 → `std/galvanometer-general` 0.01 µA/格 串 1 kΩ
 *       → **10 µV/格**，1/10 格 = **1 µV**
 *
 *     ⇒ 48.27 mV 的一个数量级读到 **6 µV / 48.27 mV = 1.2×10⁻⁴ 个数量级**
 *        （比值分辨 1.00029）。**毫伏表那 300 µV 的格子，被分压器 + 零位换掉了 50 倍。**
 *
 *   ⚠️ **真正卡住分辨的不是 µV，是温度**，这一点必须先说：
 *
 *     dE/dT = E/T（同温下 E ∝ T）⇒ 在 0.257 V 处 **0.264 mV/K**
 *     ±1 K ⇒ **0.0055 个数量级**；±10 K ⇒ 0.055 个数量级 —— 比电压读数差 45 倍
 *
 *   而本层**没有 700 °C 的温度计**（T 型只到 350 °C，`resistance-furnace.ts:45`；
 *   光电高温计 800 °C 起）。所以温度靠**电池自身的斜率标**：
 *
 *     两个已知参考气    干空气 0.2095 atm 与 `mat/oxygen`（purity 90–99.5 %，取 0.995）
 *     E = 20.965 × ln(0.2095/0.995) = **−32.66 mV**（真值是负的，取绝对值 32.66 mV）
 *     比值的合成不确定度 0.6 %（空气 ±0.5 %、氧 ±0.5 %）⇒ **T = 973 ± 6 K**
 *     ⇒ 折到 0.257 V 处 **0.037 个数量级** ✓
 *
 *   结论：**能斯特电压 48 mV 不小，小的是"每 K 0.26 mV"那一条**。这台仪器的精度上限
 *   由温度定（0.04 个数量级），不由电压定（1.2×10⁻⁴ 个数量级）。
 *
 * ── 问 3：惰气熔融要什么？石墨坩埚自身导电能不能到 3000 °C？ ────────────────
 *
 *   **本层没有一台设备 hold 得到 2500–3000 °C**：`high-temp-furnace` 1100–1600、
 *   `kiln` 1200–1750、`esr-furnace` 1750–1850、`atmosphere-furnace` 600–2000。
 *   所以"脉冲炉"不能是"一台更热的炉子"，只能换加热方式：
 *
 *   **能 —— 石墨坩埚自己就是发热体**（工业脉冲炉就是这么做的：坩埚架在上下电极之间，
 *   通电，坩埚即炉膛）。三个数：
 *
 *     电阻    坩埚 φ12 外 × φ9 内 × 15 高，壁厚 1.5：A = π(6²−4.5²) = 49.5 mm²
 *             R = ρL/A = 12×10⁻⁶ × 0.015 / 49.5×10⁻⁶ = **3.6 mΩ**（石墨 ρ = 10–15 µΩ·m）
 *     功率    3000 °C 的辐射（ε 0.9、外表面 5.65×10⁻⁴ m²）
 *             σT⁴ = 5.67×10⁻⁸ × 3273⁴ = 6.5×10⁶ W/m² ⇒ **3.3 kW**
 *     电流    I = √(P/R) = √(3300/0.0036) = **960 A**，V = IR = **3.5 V**
 *
 *   ⇒ **1000 A / 3.5 V / 3.5 kW**，与工业脉冲炉（4–6 kW、1000 A）同档。
 *   本层能出 1 kA 的地方只有三处：铝电解槽母线（4.2 V/300 kA）、电渣炉（20 kA）、
 *   `plant/hv-test-bench`（3 kV/2 kA）—— 本文件从**第三处**取（余量 2 倍），记 §三·D5。
 *   石墨的升华点 3650 °C，3000 °C 有 650 K 余量；外面包 100 mm 石墨毡（`mat/carbon`，
 *   它既是保温层也是还原气氛的来源），再外面才是水冷壳。
 *
 *   **CO 的红外吸收带在 4.67 µm ⇒ 检测器与窗都要重新算：**
 *
 *     检测器  `std/photodiode-general` 是**硅**（截止 1.1 µm）—— **差 4.2 倍波长，
 *             4.67 µm 上一个光子也收不到**。InGaAs 到 1.7 µm（够不着）、PbSe 到 4.5 µm、
 *             MCT、热释电 —— 本层一件都没有。**唯一能做的是热电堆**：
 *             铜-铁偶（Seebeck 12–14 µV/K）× 20 对 = **240–280 µV/K**，
 *             碳黑吸收片 + 斩波 + `std/galvanometer-general` 的动圈（20 ms）当低通。
 *     窗      熔石英 1 mm 在 4.67 µm 透过 **<1 %**（Si–O 4.5 µm 起强吸收）、玻璃 2.5 µm
 *             截止、蓝宝石/氟化物（CaF₂、BaF₂、ZnSe）本层**全没有**
 *             ⇒ **4.67 µm 只有"无窗"这一条**（开放式光路 + 局部吹氩）。
 *             所以这条路走 **2.3 µm 的 Δv=2 泛频 + 石英窗**，灵敏度低 ~100 倍，
 *             用 1 m 光程 + 0.5 g 样品补回来（§四 与 `measure/hafnium-oxygen` 的算式）
 *             ⇒ 记 §三·D3。
 *
 * ── 问 4：P₂O₅ 电解法 —— 10 ppm、100 mL/min 是多少 µA？分辨到多少 ppm？ ────────
 *
 *   **法拉第定律**：H₂O → H₂ + ½O₂ 走 **2F**，M = 18.015
 *     1 µg H₂O 的电量 = 2 × 96485.3 / 18.015 = **10.71 mC/µg**（题面的 10.7 对）
 *
 *   **100 mL/min、10 ppm**（20 °C、1 atm，摩尔体积 24.05 L/mol）：
 *
 *     摩尔流 = 0.100 / 24.05 = 4.158×10⁻³ mol/min = 6.93×10⁻⁵ mol/s
 *     水     = 10×10⁻⁶ × 6.93×10⁻⁵ = 6.93×10⁻¹⁰ mol/s
 *     电流   = 2F × 6.93×10⁻¹⁰ = 192971 × 6.93×10⁻¹⁰ = **1.34×10⁻⁴ A = 134 µA**
 *     ⇒ 灵敏度 **13.4 µA / ppm**（换个算法核对：1 ppm = 1.25 ng/s，×10.71 mC/µg = 13.4 µA ✓）
 *
 *   **分辨**：动圈 0.01 µA/格、判 1/10 格 = 1 nA ⇒ 1 nA / 13.4 µA/ppm = **75 ppt**（理想）。
 *   但真正的下限是**本底**：管壁出气 + 载气自带的水给 **1–3 µA** ⇒ **0.07–0.22 ppm**
 *   ⇒ **分辨 0.1 ppm（判 0.05 ppm 时信噪比 1）**，与工业 P₂O₅ 表同档。
 *
 *   ⚠️ **5 段串联不会把灵敏度乘 5** —— 串联是**同一电流**流过 5 段，所以量到的电流
 *   仍只对应一份水。5 段串联的理由是**电场**：每段膜上要有 ≥50 V 才能把吸进去的水
 *   及时电解掉（电压不够，膜被水淹、电流饱和、读数非线性），于是总电压 5 × 50 =
 *   **250 V** 是"5 段 × 每段需要的场"的结果，不是灵敏度的来源。这一点题面要说清。
 *
 *   量程上限 **1000 ppm**：1000 ppm 要 13.4 mA 的电解电流，而膜的电导给不到
 *   （吸收是被动的，电解受离子电导限制）⇒ 电流饱和、读数非线性。
 *
 * ── 问 5：三件各解 #23 的哪一块？哪一块**没解**？ ────────────────────────────
 *
 *   **解掉的三块**：① 气体中的氧分压（1 ppm–1 ppt，10⁻⁶–10⁻¹⁵ atm）
 *                ② 金属里的氧含量（5–5000 ppm，判 500–3000 ppm 那档 ±3 %）
 *                ③ 气体中的水分（0.05–1000 ppm 电解；−20…+20 °C 冷镜）
 *
 *   **没解的四块（带缺口量级）**：
 *     ④ **固体粉末/薄膜的化学计量比** —— 惰气熔融测的是**总氧**（氧化物里的氧也会被
 *        碳还原），所以 HfO₂ 的氧空位、ALD 的界面层**判不了**。要 XRD 晶格常数或 TGA，
 *        本层 0 台 ⇒ `ald.ts` 的界面态那一半仍然开环，差一台衍射仪
 *     ⑤ **熔体里的氧势**（钢水、铝液、玻璃） —— 电池原理能用，但要**消耗式高温探头**
 *        （1600 °C 一次一支），本层陶瓷管在 1600 °C 以上与熔体反应 ⇒ 差一个消耗件条目
 *     ⑥ **含氟/易聚单体里的氧**（#23 第三条：TFE） —— TFE 会在 700 °C 的电池上聚合成膜，
 *        传感器直接失效；要 −40 °C 的低温原电池式氧传感器，而原电池要铅（本层 0）⇒ 差一条
 *     ⑦ **液体水里的溶解氧**（ppm 级） —— 要气液分离的高分子膜，而高分子膜本层断
 *        （#23 里电容式湿度传感器就是同一条断法）⇒ 差一条膜链
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、白名单（本文件自划的，违者 tsc 过、审查不过）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   投料  mat/zirconia · mat/lime · mat/silica · mat/quartz-pure · mat/glass ·
 *         mat/alumina · mat/refractory · mat/aluminium · mat/copper · mat/copper-wire ·
 *         mat/silver · mat/gold · mat/iron · mat/steel-45 · mat/sheet-steel · mat/carbon ·
 *         mat/tailings · mat/water · mat/mineral-wool · mat/argon · mat/nitrogen ·
 *         mat/oxygen · mat/phosphoric-acid
 *         ⚠️ **一处例外，必须点名**：`measure/hafnium-oxygen` 的 `uses` 里有 `mat/hafnium`。
 *         它是这台仪器**唯一有判据可交付的分析对象**（全表只有 `mat/hafnium` 声明了
 *         `oxygen` 属性，`hafnium.ts:526`），而它不在本轮给的投料白名单里 —— 那一行是
 *         grep 漏的（白名单里有 `mat/zirconia`、`mat/zirconium-chloride` 却没有 `mat/hafnium`）。
 *         若坚持白名单，**删掉那一条 `uses` 即可**：代价是这台仪器变成 `idle_machine`，
 *         "500–3000 ppm 是估的"那一句仍然没人接。
 *   std/  std/galvanometer-general · std/millivoltmeter-general · std/zener-reference-general ·
 *         std/opamp-chip-general · std/counter-chip-general · std/photodiode-general ·
 *         std/capacitor-film-general · std/carbon-electrode-300 · std/calibrated-scale-100
 *         （`std/quartz-resonator-general` 不在本文件里 —— 这里没有要计时的振荡器，
 *          时基用的是 50 Hz 动圈的机械时间常数）
 *   设备  97 台里用到 12 台：`lathe` · `plant/milling-machine` · `plant/grinder` ·
 *         `plant/press` · `plant/sheet-shop` · `plant/robot` · `plant/resistance-furnace` ·
 *         `plant/high-temp-furnace` · `plant/kiln` · `plant/ore-beneficiary` ·
 *         `plant/metrology-room` · `plant/hv-test-bench`
 *         （`plant/xenon-loop` 用在 `needs` 里 —— 它是冷镜 −80 °C 的冷源，`xenon-loop.ts:349`
 *          的 holds 里有 −80…−70）
 *
 *   ⚠️ **本文件新建的三台不进别人的 `performedBy`**，也不出现在**自己零件路线**的
 *   `needs` / `performedBy` 里（`ellipsometer.ts` 那台曾经这么做，本轮把它算作错）。
 *   它们只在**量测路线**里当执行者：`measure/nitrogen-oxygen`、`measure/oxygen-purity`、
 *   `measure/nitrogen-moisture`、`measure/hafnium-oxygen` —— 四条路线产出的是
 *   **被验过的料**，不是自己的零件，所以不会自指。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、降级与升级（R8：每一处降级必须同时给出升级路线）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ┌──┬────────────────────────────────┬──────────────────────┬──────────────────────────────────┐
 * │  │ 降级                           │ 代价（带数）         │ 升级（R8）                       │
 * ├──┼────────────────────────────────┼──────────────────────┼──────────────────────────────────┤
 * │D1│ CaO 稳定（CaSZ）代 Y₂O₃（YSZ） │ 电导 0.005–0.01 对   │ `mat/yttria` 0 命中：要一条稀土  │
 * │  │ 因为钇与钇氧化物都 0 命中      │ 0.03 S/cm ⇒ 低 3–5×  │ 分离链（独居石/磷钇矿 → 钇）——   │
 * │  │                                │ 内阻 8.3 Ω 对 1.7 Ω  │ 本层 0 条；风化层 Y ~30 ppm，  │
 * │  │                                │ 响应慢 3–10×；电解域 │ 富集 3×10⁴ 才到 99 % ⇒ 差 4 个  │
 * │  │                                │ 下界 10⁻¹⁵（YSZ −¹⁶）│ 数量级的富集比，不是差一台设备   │
 * ├──┼────────────────────────────────┼──────────────────────┼──────────────────────────────────┤
 * │D2│ 银电极代铂，且银只到 95 %      │ Cu 5 % 在 700 °C 当  │ 多孔 Pt 电极已建：           │
 * │  │                                │ 氧泵 ⇒ 读数偏 1–5 %；│ `make/oxygen-probe-electrode-pt`│
 * │  │                                │ 寿命 500–2000 h      │ （海绵球磨烧结）；Pt 黑镀层   │
 * │  │                                │                      │ 未建，银电极仍是现用路线       │
 * ├──┼────────────────────────────────┼──────────────────────┼──────────────────────────────────┤
 * │D3│ 4.67 µm 没有窗与探测器         │ 走 2.3 µm 泛频，灵敏 │ CaF₂ 窗：氟在磷灰石里（`mat/hf`  │
 * │  │ ⇒ 2.3 µm 泛频 + 铜-铁热电堆    │ 度低 ~100× ⇒ DL 从  │ 是氟化学的入口），CaF₂ 能合成，   │
 * │  │                                │ 0.01 变 5 ppm；热电 │ 缺**氟化物单晶生长**（要真空中   │
 * │  │                                │ 堆 NEP 1e-8 W/√Hz    │ 的坩埚与气氛）—— 差一台炉子      │
 * ├──┼────────────────────────────────┼──────────────────────┼──────────────────────────────────┤
 * │D4│ 坩埚从石墨电极车（`std/carbon- │ 单只 2.9 g，一支 72 │ 高纯石墨（ash ≤0.02 %）：要 3000 │
 * │  │ electrode-300`）而不是 `mat/    │ kg 电极出 1.5 万只  │ °C 石墨化 + 卤素净化，本层只有   │
 * │  │ carbon` —— 后者灰 0.5–20 %     │ ⇒ 坩埚是**单次**件  │ 电极那一档石墨化，没有净化段     │
 * │  │                                │ （0.96 kg/批）       │                                  │
 * ├──┼────────────────────────────────┼──────────────────────┼──────────────────────────────────┤
 * │D5│ 1 kA / 3.5 V 从 `hv-test-bench`│ 它不是给电阻负载做  │ 一台 3.5 V/1 kA 的电解级整流器   │
 * │  │ 借（10 kV/2 kA 的低压档）      │ 的，纹波与调节都粗   │ （铝电解槽的母线就是同一档）；   │
 * │  │                                │ ⇒ 温度 ±30 K ⇒ 空白 │ 缺口是变压器 + 饱和电抗器，本层  │
 * │  │                                │ 波动 ±10 %           │ 有 `plant/transformer` 的零件清单 │
 * ├──┼────────────────────────────────┼──────────────────────┼──────────────────────────────────┤
 * │D6│ 磷酸只有 20–30 %（湿法，       │ 工业用 85 % 正磷酸  │ 真空浓缩到 85 %：`plant/wet-bench`│
 * │  │ `ores.ts:335` 的 gives）       │ ⇒ 涂膜后先要烤掉    │ 20–120 °C + 减压，缺一台真空泵与 │
 * │  │                                │ 70 % 的水：膜里残  │ 一个耐磷酸的冷凝器（差 2 件）     │
 * │  │                                │ 水 ⇒ 空白 0.5–1 ppm │                                  │
 * ├──┼────────────────────────────────┼──────────────────────┼──────────────────────────────────┤
 * │D7│ 250 V 偏压从 `hv-test-bench` 借 │ 3 kV 分压出的 250 V │ 167 只锌锰干电池串联（`mat/zinc` │
 * │  │                                │ 纹波 1 % ⇒ 电解电  │ 有）：纯直流、纹波 0、内阻 5 kΩ  │
 * │  │                                │ 流噪声 1 % = 0.01   │ —— 代价是每年换一次电池（250 V 的│
 * │  │                                │ ppm 的全量           │ 电池组是"消耗品"，不是零件）     │
 * ├──┼────────────────────────────────┼──────────────────────┼──────────────────────────────────┤
 * │D8│ 冷镜的镜温靠铜-铁偶 + 指零法   │ ±1.0 K ⇒ 湿端       │ 铂电阻（Pt100，±0.1 K）：当时   │
 * │  │                                │ ±6 % RH；且冷源是  │ 铂 0 命中；现在有海绵 Pt，但     │
 * │  │                                │ "恒温"不是"可调"    │ Pt100/薄膜铂电阻未建；退一步可用水│
 * ├──┼────────────────────────────────┼──────────────────────┼──────────────────────────────────┤
 * │D9│ 700 °C 没有温度计 ⇒ 电池自身   │ ±6 K ⇒ 0.037 个数量 │ `std/photoelectric-pyrometer-     │
 * │  │ 斜率标定（两个参考气）         │ 级（够，但它是整套 │ general`（本层有，800–1600 °C）   │
 * │  │                                │ 仪器的精度上限）     │ ⇒ 把工作点挪到 **800 °C** 就能用  │
 * │  │                                │                      │ 它做第二路读数（48.3→53.2 mV 也  │
 * │  │                                │                      │ 更大）；代价是加热功率 +40 %     │
 * ├──┼────────────────────────────────┼──────────────────────┼──────────────────────────────────┤
 * │D10│氢里 <1 ppm 的氧与 TFE 里的氧  │ 稀释 1000× 后才测   │ 低温原电池式氧传感器（−40 °C，   │
 * │  │测不了（稀释可以，原位不行）    │ 得出 ⇒ 4 % 的爆炸  │ 铅-氧体系）：本层**没有铅**（#23 │
 * │  │                                │ 下限判得出，300 ppm │ 里"原电池要铅"那一句仍然有效）    │
 * │  │                                │ 的纯化判不出         │ ⇒ 差一条铅的冶金链               │
 * └──┴────────────────────────────────┴──────────────────────┴──────────────────────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、接线：主 agent 要把这几处各改一行（本文件不动别人的文件）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① `hafnium.ts:519`  把"Hf 的氧 500–3000 ppm 是**估的**"换成
 *      "`measure/hafnium-oxygen` 实测，判据 ≤1000 ppm 可判（±3 %）"；
 *      `mat/hafnium` 的 `oxygen` 窗口从 0–5000 收成 0–3000。
 *   ② `rie.ts`        刻蚀腔的水汽：腔体抽空后取样 → `plant/dew-point-meter` ⇒ 12–120 ppm 变成实测；
 *      并把"水汽是产物"那一句改成判据（露点 ≤ −60 °C = 10 ppm）。
 *   ③ `gate-stack.ts` / `ald.ts`  氢氧混合的氧分压：`plant/oxygen-probe` 挂在进气口，
 *      把开环的氧分压变成 10⁻⁶–10⁻¹⁵ atm 的实测（栅氧那一段的动力学就有了分母）。
 *   ④ `mlcc.ts`       还原气氛烧结：把"差 6.7 个数量级"改成"Ni 电极的窗口 10⁻¹²–10⁻¹⁷ atm
 *      可测，判据落在 10⁻¹⁴"。
 *   ⑤ `implant.ts` / `rta.ts` / `pcb.ts` 的残余氧那三处，改法同 ③：
 *      仪器进 `needs`，判据从"颜色/时间记账"改成 ppm。
 *   ⑥ 燃气/氢氧混合的泄漏：`plant/oxygen-probe` + 稀释取样（1:1000）判 4 % 的爆炸下限
 *      —— **这一条今天就能接**，它是 #23 里最贵的那一处（安全）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、本文件不动的东西
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   · 不新建 yttria / platinum / calcium-oxide 条目 —— 缺就是缺，替代写在 §三（R8）
 *   · 不改那条旧判断 —— 它写的是"当时没有"，这一份就是它的**升级路线**，
 *     按 #16 的时态判据，将来 #23 应该改成过去时并指向本文件（那是用户的话，不是我的）
 *   · 不把这三台接进 `tools/report.ts` 的 import 表（接线归主 agent）
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目（18 项：3 台整机 + 15 件零件）
// ═══════════════════════════════════════════════════════════════════════════

export const OXY_ITEMS: readonly Item[] = [
  /**
   * 已判定过的一批氮气。
   *
   * 为什么不是直接给 `mat/nitrogen` 打属性：`mat/nitrogen` 是**大宗气**，
   * 它的条目上没有 `concentration`/`oxygen`/`moisture` 三个属性 —— 也不该有：
   * 往那儿加属性会让全层每一家氮气产出路线都得补 `gives`（十几处），
   * 而真正需要这三个数的是**这一批被判过的气**。
   *
   * 所以量测路线的产物是"带证书的一批"：输入是气，输出是**判过的气**。
   */
  {
    id: 'mat/nitrogen-characterized',
    name: 'Characterized Nitrogen Batch', name_zh: '已判定过的一批氮气',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'concentration', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'oxygen', kind: 'range', min: 1e-12, max: 1, unit: 'atm', dir: 'atMost' },
      { param: 'moisture', kind: 'range', min: 0.01, max: 30000, unit: 'ppm', dir: 'atMost' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 1.1 氧化锆氧电池的零件（5 件）
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * **固体电解质管（CaO 稳定 ZrO₂，一头闭口）。**
   *
   * 它是这台仪器的全部物理：**只有氧离子能穿过它**，于是两侧氧分压之差变成一个电压。
   *
   *   15 mol% CaO 的质量分数 = 15×56.08 / (85×123.22 + 15×56.08) = **7.43 %**
   *   ⇒ 每 1 kg 烧结体：ZrO₂ 926 g + CaO 74 g（投料按 0.93 + 0.075，多 0.5 % 给球磨损失）
   *
   * 三个数：
   *   conductivity  0.005–0.01 S/cm（700 °C）—— 8YSZ 是 0.03，**这就是 D1 那 3–5 倍**
   *   wall          1 mm（再薄，机加工与装配的成品率撑不住；再厚，内阻 8.3 Ω 变 20 Ω）
   *   length        120 mm 闭口，φ10 外 / φ8 内
   *
   * ⚠️ **为什么不掺 Y₂O₃**：`mat/yttrium`、`mat/yttria` 全表 0 命中（§一问 1）。
   * CaO 稳到 15 mol% 时，ZrO₂ 是立方相、氧空位浓度 7.5 %（YSZ 8 mol% 也是 7.5 %）——
   * **空位数一样，差的是迁移率**（Ca²⁺ 比 Y³⁺ 大，把氧空位"卡"得紧一点）。
   */
  {
    id: 'plant/oxygen-probe/electrolyte',
    name: 'Zirconia Oxygen Cell Solid Electrolyte Tube', name_zh: '氧化锆氧电池固体电解质管',
    unit: '件',
    category: 'part',
    props: [
      { param: 'conductivity', kind: 'range', min: 0.005, max: 0.01, unit: 'S/cm' },
      { param: 'wallThickness', kind: 'range', min: 0.5, max: 2, unit: 'mm' },
      { param: 'length', kind: 'range', min: 60, max: 200, unit: 'mm' },
      { param: 'caoContent', kind: 'range', min: 13, max: 17, unit: 'mol%' },
    ],
  },

  /**
   * **多孔银电极（内外两层 + 引线）。**
   *
   * 电极不是"一块金属片"：它要**多孔**（三相界面：气相 O₂ / 金属电子 / 电解质离子），
   * 又要**不催化**（不把 O₂ 变成别的）。铂是标配件；多孔 Pt 电极已建
   * （`make/oxygen-probe-electrode-pt`，海绵球磨 + 900–1000 °C 烧结），
   * 但 **Pt 黑镀层仍未建**；本文件仍用银作为现用路线，Pt 电极是升级项。
   *
   *   面积 2 cm²、厚 20 µm、孔隙率 40 % ⇒ 每面 25 mg 银，两面 50 mg + 引线 0.2 g
   *   烧结 700 °C / 0.5 h（银熔点 961.8 °C，700 °C 只烧结不熔化 —— 多孔才留得住）
   *
   * 三个数：
   *   porosity    30–50 %（低于 30 % 三相界面不够，高于 50 % 附着力掉）
   *   area        2–8 cm²（面积决定内阻与响应：R ∝ 1/A）
   *   thickness   10–30 µm
   *
   * ⚠️ 银只到 **95 %**（`make/silver` 的 gives），5 % 铜在 700 °C 氧化还原循环里
   * 反复 Cu ↔ Cu₂O ⇒ **当氧泵**：电池在还原气氛里读数偏低 1–5 %（D2）。
   */
  {
    id: 'plant/oxygen-probe/electrode',
    name: 'Zirconia Oxygen Cell Porous Silver Electrode', name_zh: '氧化锆氧电池多孔银电极',
    unit: '件',
    category: 'part',
    props: [
      { param: 'porosity', kind: 'range', min: 30, max: 50, unit: '%' },
      { param: 'area', kind: 'range', min: 2, max: 8, unit: 'cm²' },
      { param: 'thickness', kind: 'range', min: 10, max: 30, unit: 'µm' },
    ],
  },

  /**
   * **电池座。** 45 钢法兰 + 石英取样管 + 石墨密封环 + 矿棉保温。
   *
   * 它解决的是"两侧气氛不许串"：参比侧是空气（0.21 atm），样品侧可能低到 10⁻¹⁵ atm
   * —— 漏进 1 % 的空气，样品侧的读数就是 2×10⁻³ atm，**整整 12 个数量级的谎**。
   *
   * 三个数：
   *   leakRate    ≤10⁻⁶ Pa·m³/s（没有氦质谱，所以判据是"保压 30 min 压降 ≤1 %"）
   *   cellVolume  0.8–1.5 cm³（决定响应：1 cm³ 在 0.1 L/min 上是 0.6 s 的换气时间）
   *   sealTemp    100–250 °C（石墨环在更高温上会与石英反应，所以密封段要**离开热区**）
   */
  {
    id: 'plant/oxygen-probe/cell-body',
    name: 'Zirconia Oxygen Cell Body', name_zh: '氧化锆氧电池座',
    unit: '件',
    category: 'part',
    props: [
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-6, unit: 'Pa·m³/s', dir: 'atMost' },
      { param: 'cellVolume', kind: 'range', min: 0.8, max: 1.5, unit: 'cm³' },
      { param: 'sealTemp', kind: 'range', min: 100, max: 250, unit: '°C' },
    ],
  },

  /**
   * **取样与参比气路。** 石英管、铜卡套、针阀、一段伴热保温。
   *
   * 它决定"量的是哪一股气"。三条：
   *   · 取样管必须**石英**（玻璃会吸附水与氧，20 °C 上一段 1 m 的玻璃管就是一堵水墙）
   *   · 参比侧也要经过**同一根**石英管进电池内侧，否则两支管的温度不一样，
   *     热扩散会造出一个假电压
   *   · 旁路 10–20 倍：让取样点一直有新鲜气，切换时的死体积只有 5 cm³
   *
   * 三个数：deadVolume ≤5 cm³ · sampleFlow 50–200 mL/min · bypassRatio 10–20
   */
  {
    id: 'plant/oxygen-probe/sample-line',
    name: 'Zirconia Oxygen Cell Sample and Reference Gas Line', name_zh: '氧化锆氧电池取样与参比气路',
    unit: '件',
    category: 'part',
    props: [
      { param: 'deadVolume', kind: 'range', min: 0, max: 5, unit: 'cm³', dir: 'atMost' },
      { param: 'sampleFlow', kind: 'range', min: 50, max: 200, unit: 'mL/min' },
      { param: 'bypassRatio', kind: 'range', min: 10, max: 20, unit: '倍' },
    ],
  },

  /**
   * **指零读数头。** 齐纳 6.2 V + 5 位同丝铜线分压器 + 动圈检流计 + 计数片。
   *
   * 这台仪器的"看见 µV"全在这一件里（§一问 2）。它其实是 `probe-station.ts` 那只
   * µV 计的同一条手艺，只是**量程换成 0–6.2 V**（能斯特电压到 0.84 V，留 7 倍余量）。
   *
   * 三个数：
   *   emfRange     0–6.2 V（分压器全长；0.84 V 的满量程占 13 %）
   *   resolution   6 µV（刻度 62 µV/步，1/10 内插）+ 1 µV（零位）
   *   drift        ≤30 µV/h（齐纳恒温 ±0.5 K 给 0.0025 %，接点热电势 10–40 µV/K × 0.1 K）
   */
  {
    id: 'plant/oxygen-probe/readout',
    name: 'Zirconia Oxygen Cell Null Readout Head', name_zh: '氧化锆氧电池指零读数头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'emfRange', kind: 'range', min: 6.2, max: 6.2, unit: 'V' },
      { param: 'resolution', kind: 'range', min: 0, max: 6, unit: 'µV', dir: 'atMost' },
      { param: 'drift', kind: 'range', min: 0, max: 30, unit: 'µV/h', dir: 'atMost' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 1.2 惰气熔融分析仪的零件（5 件）
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * **石墨坩埚（自身发热体）。** φ12 外 / φ9 内 / 15 高，壁 1.5。
   *
   * 它是"本层没有 3000 °C 的炉子"这句话的解法：**坩埚就是炉膛，也是电阻**。
   *
   *   R = ρL/A = 12×10⁻⁶ × 0.015 / 49.5×10⁻⁶ = **3.6 mΩ**
   *   3000 °C 的辐射 3.3 kW ⇒ I = √(P/R) = **960 A**，V = **3.5 V**（§一问 3）
   *
   * ⚠️ **材料只能用 `std/carbon-electrode-300` 车，不能用 `mat/carbon`**，这是本文件
   * 最要紧的一句话：
   *
   *   `mat/carbon`（煤基）灰 0.5–20 %，灰是 **SiO₂ / Al₂O₃ / Fe₂O₃** —— 一进 3000 °C 的
   *   碳坩埚就被碳还原，**灰里的氧全部变成 CO 进检测器**。3 g 坩埚 × 0.5 % 灰 × 45 % 氧
   *   = **6.8 mg 氧**，对 0.5 g 样品是 **1.35 wt% = 13 500 ppm 的空白** —— 比要测的
   *   500–3000 ppm 高一个量级，**这条路直接死**。
   *   石墨电极是 3000 °C 石墨化的，灰在石墨化时已经变成碳化物/氮化物（不再放氧），
   *   残留的只是表面吸附氧 ⇒ 空白回到 **1–5 ppm**。
   *
   * 三个数：ash ≤0.5 %（电极那一档）· maxTemp 3200 °C（升华点 3650，留 450 K）·
   *         singleUse 每只 2.9 g、单次使用（石墨在 3000 °C 会与熔体反应并渗碳）
   */
  {
    id: 'plant/inert-gas-fusion-analyzer/crucible',
    name: 'Inert Gas Fusion-Infrared Oxygen Analyzer Graphite Crucible', name_zh: '惰气熔融-红外氧分析仪石墨坩埚',
    unit: '件',
    category: 'part',
    props: [
      { param: 'ash', kind: 'range', min: 0, max: 0.5, unit: '%', dir: 'atMost' },
      { param: 'maxTemp', kind: 'range', min: 2900, max: 3300, unit: '°C', dir: 'atLeast' },
      { param: 'innerDiameter', kind: 'range', min: 8.8, max: 15, unit: 'mm' },
      { param: 'pieceMass', kind: 'range', min: 1, max: 5, unit: 'g' },
    ],
  },

  /**
   * **上下电极与坩埚托。** 石墨电极柱 + 水冷铜座 + 压紧环。
   *
   * 三个数：
   *   current        800–1200 A（坩埚 960 A + 余量）
   *   contactRes     ≤0.5 mΩ —— 接触电阻 1 mΩ 就要多 1 kW，而总功率只有 3.3 kW
   *   coolingWater   2 L/min（铜座把电极的导热热流带走；断水 60 s 电极就烧穿）
   */
  {
    id: 'plant/inert-gas-fusion-analyzer/electrode',
    name: 'Inert Gas Fusion-Infrared Oxygen Analyzer Upper/Lower Electrode and Crucible Support', name_zh: '惰气熔融-红外氧分析仪上下电极与坩埚托',
    unit: '件',
    category: 'part',
    props: [
      { param: 'current', kind: 'range', min: 800, max: 1200, unit: 'A' },
      { param: 'contactResistance', kind: 'range', min: 0, max: 0.5, unit: 'mΩ', dir: 'atMost' },
      { param: 'coolingWater', kind: 'range', min: 2, max: 6, unit: 'L/min' },
    ],
    composedOf: [
      { item: 'plant/inert-gas-fusion-analyzer/electrode/graphite', qty: q(1) },
      { item: 'plant/inert-gas-fusion-analyzer/electrode/copper-seat', qty: q(1) },
      { item: 'plant/inert-gas-fusion-analyzer/electrode/clamp-ring', qty: q(1) },
    ],
  },

  /**
   * **炉膛与气路。** 水冷壳 + 刚玉衬 + 100 mm 石墨毡 + 石英出口管。
   *
   * 石墨毡既是保温层，**也是还原气氛的来源**：3000 °C 上它会把漏进来的氧先吃掉，
   * 于是样品仓的氧分压被压在 10⁻¹⁵ atm 以下 —— 这是"惰气熔融"这个名字里的"惰"字
   * 在本层的实现方式（**不是靠"惰气纯度"，是靠热石墨**）。
   *
   * 三个数：
   *   leakRate     ≤10⁻⁸ Pa·m³/s（比氧电池那只严 100 倍：空白就靠它）
   *   purgeTime    ≤60 s（换气 5 次，300 mL × 5 / 2 L/min = 45 s）
   *   carrierFlow  0.5–2 L/min（氩；`mat/argon` 本层有）
   */
  {
    id: 'plant/inert-gas-fusion-analyzer/chamber',
    name: 'Inert Gas Fusion-Infrared Oxygen Analyzer Furnace Chamber and Gas Path', name_zh: '惰气熔融-红外氧分析仪炉膛与气路',
    unit: '件',
    category: 'part',
    props: [
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-8, unit: 'Pa·m³/s', dir: 'atMost' },
      { param: 'purgeTime', kind: 'range', min: 0, max: 60, unit: 's', dir: 'atMost' },
      { param: 'carrierFlow', kind: 'range', min: 0.5, max: 2, unit: 'L/min' },
    ],
  },

  /**
   * **红外检测器（2.3 µm 热电堆 + 1 m 气室）。**
   *
   * **4.67 µm 走不通**（§一问 3）：本层没有能透过 4.67 µm 的窗（熔石英 1 mm 透过 <1 %、
   * 玻璃 2.5 µm 截止、CaF₂/BaF₂/蓝宝石 0），也没有能看见 4.67 µm 的探测器
   * （硅光电管到 1.1 µm）。所以折到 **CO 的 Δv=2 泛频 2.3 µm**：
   *
   *   石英在 2.3 µm 透过 92 % ✓   热电堆的宽谱响应覆盖 2.3 µm ✓
   *   代价：2.3 µm 的线强比 4.67 µm 低 ~100 倍 ⇒ 要 1 m 光程（两面金镜折返 5 次）
   *
   * 三个数：
   *   responsivity  240–280 µV/K（铜-铁 12–14 µV/K × 20 对）
   *   pathLength    600–1000 mm
   *   cellVolume    ≤100 mL（气室小 ⇒ 浓度高；但也别小到脉冲拖不住）
   */
  {
    id: 'plant/inert-gas-fusion-analyzer/ir-detector',
    name: 'Inert Gas Fusion-Infrared Oxygen Analyzer Infrared Detector', name_zh: '惰气熔融-红外氧分析仪红外检测器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'responsivity', kind: 'range', min: 240, max: 280, unit: 'µV/K' },
      { param: 'pathLength', kind: 'range', min: 600, max: 1000, unit: 'mm' },
      { param: 'cellVolume', kind: 'range', min: 50, max: 100, unit: 'mL' },
      { param: 'windowCutoff', kind: 'range', min: 2.5, max: 3.5, unit: 'µm' },
    ],
  },

  /**
   * **读数与斩波同步。** 动圈检流计 + 斩波参考光电管 + 相敏检波（动圈当乘法器）。
   *
   * 与 `flow-and-rf.ts:2071` 的 `ir-endpoint/preamp` 同一条手艺：**50 Hz 的动圈当乘法器**。
   * 这里多一件"参考通道"：斩波盘上开一个小孔，`std/photodiode-general` 看着它，
   * 于是"什么时候该读正、什么时候读负"由硬件给，不由人算。
   *
   * 三个数：timeConstant 1–30 s · drift ≤2 %/h · frequency 40–60 Hz
   */
  {
    id: 'plant/inert-gas-fusion-analyzer/readout',
    name: 'Inert Gas Fusion-Infrared Oxygen Analyzer Readout and Chopper Synchronization', name_zh: '惰气熔融-红外氧分析仪读数与斩波同步',
    unit: '件',
    category: 'part',
    props: [
      { param: 'timeConstant', kind: 'range', min: 1, max: 30, unit: 's' },
      { param: 'drift', kind: 'range', min: 0, max: 2, unit: '%/h', dir: 'atMost' },
      { param: 'frequency', kind: 'range', min: 5, max: 60, unit: 'Hz' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 1.3 露点仪的零件（5 件）
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * **P₂O₅ 电解池（5 段串联，每段 50 V）。**
   *
   * 两根 φ0.1 mm 的**金丝**并绕在石英管内壁上（间距 1 mm），涂 20–30 % 磷酸，
   * 通电跑合：H₃PO₄ → HPO₃ → … → **P₂O₅ 膜**（脱水靠电解本身完成，不需要另烤）。
   *
   *   金丝 10 m（5 段 × 2 根 × 1 m）：A = π(0.05)² = 7.85×10⁻³ mm²，体积 78.5 mm³
   *   × 19.3 g/cm³ = **1.5 g** ⇒ 投料按 2 g（含引线与损耗）
   *
   * 为什么是金：Pt 丝/箔已建（`mat/platinum-wire` / `mat/platinum-foil`），
   * 但本文件仍用金丝：P₂O₅ 膜是强酸 + 50 V 阳极，银会溶、铜会溶、铁会溶，
   * 金是现用的不溶材料；换铂丝要重做引线/密封，本文件还没换线
   * （`precious.ts:36` 的"金是电接触的最后手段"这一句在这里第三次兑现）。
   *
   * 三个数：segments 5 · voltagePerSegment 50 V · sensitivity 13.4 µA/ppm（§一问 4）
   */
  {
    id: 'plant/dew-point-meter/electrolytic-cell',
    name: 'P₂O₅ Electrolytic Cell', name_zh: 'P₂O₅ 电解池',
    unit: '件',
    category: 'part',
    props: [
      { param: 'segments', kind: 'range', min: 5, max: 5, unit: '段' },
      { param: 'voltagePerSegment', kind: 'range', min: 50, max: 50, unit: 'V' },
      { param: 'sensitivity', kind: 'range', min: 12, max: 15, unit: 'µA/ppm' },
      { param: 'cellLength', kind: 'range', min: 300, max: 600, unit: 'mm' },
    ],
  },

  /**
   * **冷镜头（湿端的第二只头）。** 抛光银镜 + 铜冷指 + 漆包铜线加热绕组 + 光电判露 +
   * 铜-铁热电偶。
   *
   * 它管 **−20…+20 °C 露点**（1000–23 000 ppm）—— P₂O₅ 池在那一段饱和了（§一问 4），
   * 而这一段恰好是"火星舱内空气、压缩机出口、焊接保护气"的那一段。
   *
   * 冷源 `plant/xenon-loop` 的 −80…−70 °C 档（`xenon-loop.ts:349`），镜面靠 20 Ω 的
   * 漆包铜线绕组**电加热平衡**到设定点（湿端只需 0–10 W）。判露用 `std/photodiode-general`：
   * 镜面结露/结霜时散射光变了，反射光降 10–30 %，这比人眼看"发雾"稳 10 倍。
   *
   * 三个数：
   *   mirrorTemp   −80…+20 °C（理论到 −80；湿端只用 −20…+20）
   *   tempAccuracy ±1.0 K —— 铜-铁偶 14 µV/K，指零法 1 µV ⇒ 0.07 K 的读数分辨，
   *                但**冷端冰点瓶与偶丝不均匀性**给 ±1.0 K（D8）
   *   heatBalance  0–10 W
   */
  {
    id: 'plant/dew-point-meter/mirror-head',
    name: 'Dew-Point Meter Chilled Mirror Head', name_zh: '露点仪冷镜头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'mirrorTemp', kind: 'range', min: -80, max: 20, unit: '°C' },
      { param: 'tempAccuracy', kind: 'range', min: 0, max: 1, unit: 'K', dir: 'atMost' },
      { param: 'heatBalance', kind: 'range', min: 0, max: 10, unit: 'W' },
      { param: 'mirrorArea', kind: 'range', min: 1, max: 3, unit: 'cm²' },
    ],
  },

  /**
   * **取样板。** 石英/玻璃管、铜针阀、孔板流量计、40–60 °C 伴热、矿棉保温。
   *
   * **水是唯一"会粘在管壁上"的物种**：20 °C 的 1 m 钢管在 1 ppm 的干气上会
   * 吸掉 90 % 的水（表面吸附 + 死体积换气），读数是"管子的历史"，不是"气体的现在"。
   * 所以：石英管 + 伴热 40–60 °C + 旁路 10–20 倍 + 死体积 ≤5 cm³。
   *
   * 三个数：sampleFlow 50–200 mL/min · bypassRatio 10–20 · heatTrace 40–60 °C
   */
  {
    id: 'plant/dew-point-meter/sample-panel',
    name: 'Dew-Point Meter Sample Panel', name_zh: '露点仪取样板',
    unit: '件',
    category: 'part',
    props: [
      { param: 'sampleFlow', kind: 'range', min: 50, max: 200, unit: 'mL/min' },
      { param: 'bypassRatio', kind: 'range', min: 10, max: 20, unit: '倍' },
      { param: 'heatTrace', kind: 'range', min: 40, max: 60, unit: '°C' },
      { param: 'deadVolume', kind: 'range', min: 0, max: 5, unit: 'cm³', dir: 'atMost' },
    ],
  },

  /**
   * **保护柱。** 石英棉过滤（5 µm）+ 一小段 P₂O₅ 前置床。
   *
   * 两件事：① 挡住颗粒（一颗 5 µm 的氧化皮落在电解池上，那一段就短路）；
   * ② **防返扩散**：停机时环境的水会顺着取样管往回爬，把池子泡了 —— 前置床是那道闸。
   *
   * ⚠️ 前置床本身是个**空白源**：它的水会慢慢放出来，给 0.05 ppm 的本底（§一问 4 的
   * 1–3 µA 里有一半是它）。三个数：capacity 0.5–2 g H₂O · filterPore 5 µm · blank ≤0.05 ppm
   */
  {
    id: 'plant/dew-point-meter/guard-column',
    name: 'Dew-Point Meter Guard Column', name_zh: '露点仪保护柱',
    unit: '件',
    category: 'part',
    props: [
      { param: 'capacity', kind: 'range', min: 0.5, max: 2, unit: 'g' },
      { param: 'filterPore', kind: 'range', min: 1, max: 10, unit: 'µm' },
      { param: 'blank', kind: 'range', min: 0, max: 0.05, unit: 'ppm', dir: 'atMost' },
    ],
  },

  /**
   * **读数头。** 6 档微安计（0.01 µA–10 mA）+ 250 V 偏压的限流与保护 + 计数片显示。
   *
   *   13.4 µA/ppm ⇒ 1000 ppm 时 13.4 mA、0.05 ppm 时 0.67 nA —— **7 个数量级的电流**
   *   六档：10 mA / 1 mA / 100 µA / 10 µA / 1 µA / 0.1 µA（每档 10 倍，量程重叠 1.5 倍）
   *
   * 三个数：currentRange 0.01 µA–10 mA（6 档）· resolution 1 nA · biasVoltage 200–300 V
   */
  {
    id: 'plant/dew-point-meter/readout',
    name: 'Dew-Point Meter Readout Head', name_zh: '露点仪读数头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'currentRange', kind: 'range', min: 0.01, max: 10000, unit: 'µA' },
      { param: 'resolution', kind: 'range', min: 0, max: 0.001, unit: 'µA', dir: 'atMost' },
      { param: 'biasVoltage', kind: 'range', min: 200, max: 300, unit: 'V' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 1.4 三台整机（composedOf，**没有产出路线**）
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * **氧化锆氧电池 —— 本层第一只"能读氧分压"的东西。**
   *
   * 五个读数（算式全在 §一问 2）：
   *
   *   pO2Range       10⁻¹⁵–1 atm     下限是 CaSZ 的电解域边界（D1），不是电极的极限
   *   detectionLimit ≤10⁻⁹ ppm       = 1 ppt（10⁻¹⁵ atm）；10⁻¹⁵ 以下外推，记 D1
   *   accuracy       ≤26 %           ±0.1 个数量级；分项：温度 0.037 + 非能斯特 0.05–0.11
   *   responseTime   ≤30 s           电极的氧交换 1–10 s + 换气 0.6 s + 动圈 20 ms
   *   emfPerDecade   44–52 mV        48.27 mV @700 °C、53.23 @800 °C（这就是温度计）
   *
   * ⚠️ **它不 hold 温度**：700 °C 由 `plant/resistance-furnace`（100–1100）给，
   * 本机只是"插在炉子里的探头"。这一点与 `plant/pyrometer`（自己不带热源）同形。
   */
  {
    id: 'plant/oxygen-probe',
    name: 'Zirconia Oxygen Cell', name_zh: '氧化锆氧电池',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'pO2Range', kind: 'range', min: 1e-15, max: 1, unit: 'atm' },
      { param: 'detectionLimit', kind: 'range', min: 0, max: 1e-9, unit: 'ppm', dir: 'atMost' },
      { param: 'accuracy', kind: 'range', min: 0, max: 26, unit: '%', dir: 'atMost' },
      { param: 'responseTime', kind: 'range', min: 0, max: 30, unit: 's', dir: 'atMost' },
      { param: 'emfPerDecade', kind: 'range', min: 44, max: 52, unit: 'mV' },
    ],
    composedOf: [
      { item: 'plant/oxygen-probe/electrolyte', qty: q(1) },
      { item: 'plant/oxygen-probe/electrode', qty: q(2) },
      { item: 'plant/oxygen-probe/cell-body', qty: q(1) },
      { item: 'plant/oxygen-probe/sample-line', qty: q(1) },
      { item: 'plant/oxygen-probe/readout', qty: q(1) },
    ],
  },

  /**
   * **惰气熔融-红外氧分析仪 —— 本层第一只能读"金属里有多少氧"的东西。**
   *
   * 它 hold 的是 **2400–3000 °C**，而本层没有任何别的东西 hold 过 2000 以上
   * （`esr-furnace` 1750–1850 是最高的）。这不违反"设备也是被造出来的"：
   * 3000 °C 不是一台炉子给的，是**坩埚自己通电**给的（§一问 3）。
   *
   * 五个读数：
   *
   *   range          5–5000 ppm     判 `mat/hafnium` 的 500–3000 那档正落在中间
   *   detectionLimit ≤5 ppm         仪器极限 1 ppm，实际被空白与系统漏气抬到 5
   *   accuracy       ≤3 %          1000 ppm 以上；500 ppm 处 ±20 %（空白占了 10 %）
   *   cycleTime      ≤120 s         吹扫 45 + 熔融 40 + 积分 30
   *   sampleMass     0.1–1 g        0.5 g 是标准；1 g 时 DL 好一倍
   */
  {
    id: 'plant/inert-gas-fusion-analyzer',
    name: 'Inert Gas Fusion-Infrared Oxygen Analyzer', name_zh: '惰气熔融-红外氧分析仪',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/range', kind: 'range', min: 5, max: 5000, unit: 'ppm' },
      { param: 'measure/detectionLimit', kind: 'range', min: 0, max: 5, unit: 'ppm', dir: 'atMost' },
      { param: 'measure/accuracy', kind: 'range', min: 0, max: 3, unit: '%', dir: 'atMost' },
      { param: 'cycleTime', kind: 'range', min: 0, max: 120, unit: 's', dir: 'atMost' },
      { param: 'sampleMass', kind: 'range', min: 0.1, max: 1, unit: 'g' },
    ],
    holds: [{ param: 'temperature', min: 2400, max: 3000 }],
    composedOf: [
      { item: 'plant/inert-gas-fusion-analyzer/crucible', qty: q(2) },
      { item: 'plant/inert-gas-fusion-analyzer/electrode', qty: q(1) },
      { item: 'plant/inert-gas-fusion-analyzer/chamber', qty: q(1) },
      { item: 'plant/inert-gas-fusion-analyzer/ir-detector', qty: q(1) },
      { item: 'plant/inert-gas-fusion-analyzer/readout', qty: q(1) },
    ],
  },

  /**
   * **露点仪 —— 本层第一只能读"气体里有多少水"的东西。**
   *
   * 两只头、两种物理，覆盖 **−95…+20 °C 露点**：
   *
   *   P₂O₅ 电解池  0.05–1000 ppm（−95…−20 °C）**绝对法**：电流按法拉第定律直接折成水，
   *                不需要标气、不需要温度计 —— 这是它比冷镜好的地方
   *   冷镜头      −20…+20 °C（1000–23 000 ppm）相对法：镜温 ±1.0 K ⇒ ±6 % RH
   *
   * 五个读数：
   *
   *   dewPoint       −95…−20 °C    电解池那一段（分辨 0.05 ppm ⇒ 0.5 °C 露点 @−60）
   *   range          0.05–23000 ppm
   *   detectionLimit ≤0.05 ppm     本底 1–3 µA 定的（§一问 4）
   *   accuracy       ≤10 %         干端 ±5 %（本底 + 流量）；湿端 ±6 % RH
   *   responseTime   ≤300 s        干端 60–120 s（膜的水平衡）；湿端 60–300 s（镜面热平衡）
   */
  {
    id: 'plant/dew-point-meter',
    name: 'Dew-Point Meter', name_zh: '露点仪',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'dewPoint', kind: 'range', min: -95, max: 20, unit: '°C' },
      { param: 'range', kind: 'range', min: 0.05, max: 23000, unit: 'ppm' },
      { param: 'detectionLimit', kind: 'range', min: 0, max: 0.05, unit: 'ppm', dir: 'atMost' },
      { param: 'accuracy', kind: 'range', min: 0, max: 10, unit: '%', dir: 'atMost' },
      { param: 'responseTime', kind: 'range', min: 0, max: 300, unit: 's', dir: 'atMost' },
      { param: 'measure/water', kind: 'range', min: 0, max: 23000, unit: 'ppm' },
    ],
    composedOf: [
      { item: 'plant/dew-point-meter/electrolytic-cell', qty: q(1) },
      { item: 'plant/dew-point-meter/mirror-head', qty: q(1) },
      { item: 'plant/dew-point-meter/sample-panel', qty: q(1) },
      { item: 'plant/dew-point-meter/guard-column', qty: q(1) },
      { item: 'plant/dew-point-meter/readout', qty: q(1) },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线（19 条：15 条零件 + 4 条量测）
//    ⚠️ 三台整机**没有产出路线** —— 有 `composedOf` 就不许有（`mixed_production`）
// ═══════════════════════════════════════════════════════════════════════════

export const OXY_ROUTES: readonly Route[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 2.1 氧电池的零件
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **电解质管：混料 → 干压 → 1550 °C 烧结 → 磨端面 → 检漏。**
     *
     *   氧化锆 0.93 + 石灰 0.075 + 水 0.3 + 尾矿（磨料）0.02 → 管 1 支
     *
     * 一批的账：一支 φ10×120 的管 = 3.55 cm³ × 5.6 g/cm³ = **19.9 g 烧结体**；
     * 0.195 kg 的料出 **10 支坯**，良品 1 支（CaSZ 的闭口管成型成品率按 10 % 记 ——
     * 干压的闭口端是薄弱处，与 `ellipsometer.ts` 的"8 只振子挑 4 只"同一记账法）。
     * 那 9 支坯不是废物，是备件，不单列条目（它们是同一批的同一件）。
     *
     * 三个判据：
     *   ① CaO 15 mol%：ZrO₂ 85 mol% —— 少于此是四方相（热循环会裂），多于此有游离 CaO
     *   ② 烧结 1550 °C / 4 h：CaSZ 要 1500–1600 才致密（`high-temp-furnace` 1100–1600 ✓）
     *   ③ 检漏：一头闭口、内壁涂皂液，外壁加压 0.1 MPa，30 min 无泡
     */
    id: 'make/oxygen-probe-electrolyte',
    name: 'Zirconia Oxygen Cell Solid Electrolyte Tube Manufacturing', name_zh: '氧化锆氧电池固体电解质管制造',
    rate: { hours: q(72) },
    produces: [
      {
        item: 'plant/oxygen-probe/electrolyte',
        qty: q(1),
        gives: [
          { param: 'conductivity', kind: 'range', min: 0.005, max: 0.01 },
          { param: 'wallThickness', kind: 'range', min: 0.8, max: 1.2 },
          { param: 'length', kind: 'range', min: 115, max: 125 },
          { param: 'caoContent', kind: 'range', min: 14, max: 16 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/zirconia', qty: q(93, 100) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(15, 200) }] },
      { anyOf: [{ item: 'mat/water', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1, 50) }] },
    ],
    needs: ['plant/metrology-room', 'plant/ore-beneficiary'],
    steps: [
      {
        note_zh:
          '混料与球磨 12 h（借矿选厂的球磨机：CaSZ 要 1 µm 以下的粉才在 1550 致密；磨到 3 µm 就要 1650，超炉子上限）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '干压成型：φ10 的闭口管，轴向 200 MPa（等静压没有，干压的闭口端留 0.3 mm 加工余量）',
        performedBy: 'plant/press',
      },
      {
        note_zh: '烧结 1550 °C / 4 h，升温 100 K/h（快升温会把闭口端拉裂）：CaO 在 1400 开始与 ZrO₂ 反应',
        performedBy: 'plant/high-temp-furnace',
        under: [{ param: 'temperature', min: 1500, max: 1600 }],
      },
      {
        note_zh: '磨两端面与内孔 φ8（金刚石砂轮，磨削量 0.3 mm）：端面不平，石墨环就封不住',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '检漏与尺寸：外壁 0.1 MPa 加压 30 min 无泡、内孔 φ8 ±0.05、壁厚 1.0 ±0.1（千分尺 + 比较仪）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '氧化锆 0.93 + 石灰 0.075 = 1.005 kg → 10 支坯（199 g 烧结体，良品 1 支 19.9 g）；差 ~0.8 kg = 球磨罐的磨介与粉料损失 + 干压的废坯（9 支 × 19.9 g = 179 g，回炉重磨）+ 磨削粉与不合格品的切屑；本件的质量账按"一批 10 支"闭合，不按 1 支',
  },

  {
    /**
     * **多孔银电极：锉粉 → 调浆 → 刷涂 → 700 °C 烧结 → 引线。**
     *
     *   银 1 g + 水 50 g + 尾矿（磨料）1 g → 电极 2 件（每件 0.4 g）
     *
     * 银必须是**粉**：块状银在 700 °C 只会烧结成致密壳（孔隙率 <5 %），三相界面就没了。
     * 粉靠锉刀 + 球磨（8 h 到 5 µm 以下），浆靠水（不加有机物：烧掉时会留碳，
     * 而碳在 700 °C 会把氧分压按到 10⁻¹⁸ atm —— 那是**电极中毒**，不是工艺）。
     *
     * 三个判据：
     *   ① 孔隙率 30–50 %：本层没有天平，所以用**厚度 + 方阻**反推
     *      （多孔银的方阻 2–5 mΩ/□ 对应 40 % 孔隙率）
     *   ② 附着力：熔蜡粘再揭，银层不许掉（没有 3M 胶带）
     *   ③ 方阻 ≤5 mΩ/□（交付窗口，工艺保证）
     */
    id: 'make/oxygen-probe-electrode',
    name: 'Zirconia Oxygen Cell Porous Silver Electrode Manufacturing', name_zh: '氧化锆氧电池多孔银电极制造',
    rate: { hours: q(16) },
    produces: [
      {
        item: 'plant/oxygen-probe/electrode',
        qty: q(2),
        gives: [
          { param: 'porosity', kind: 'range', min: 35, max: 45 },
          { param: 'area', kind: 'range', min: 2, max: 2 },
          { param: 'thickness', kind: 'range', min: 15, max: 25 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silver', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1, 1000) }] },
    ],
    needs: ['plant/metrology-room', 'plant/ore-beneficiary'],
    steps: [
      {
        note_zh: '锉粉 + 球磨 8 h 到 5 µm 以下（银软，锉刀一天出 20 g；磨到 5 µm 是为了烧结活性，不是细度本身）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '刷涂内外两面（笔涂，湿膜 60 µm 烧后 20 µm），水里加一滴磷酸做分散剂 —— 烧完不留灰',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '烧结 700 °C / 0.5 h，升温 300 K/h：银熔点 961.8 °C，700 °C 只烧结颗粒颈部（表面扩散），孔留得住；800 °C 就开始闭孔',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 650, max: 750 }],
      },
      {
        note_zh: '压接金引线（`mat/gold` 丝 φ0.1）：银-金在 700 °C 会互扩散，所以引线只压接不焊，接头留在冷端',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '银 0.001 + 水 0.05 + 尾矿 0.001 → 电极 2 件（共 0.8 g）；差 = 银粉的锉屑与刷涂损失（0.2 g）、水与磨料全走掉。⚠️ 银 95 % 里那 5 % 铜在这里已经开始害人：铜在 700 °C 烧结时会先氧化成 Cu₂O（体积涨 1.7 倍），把孔堵掉 3–5 %',
  },

  {
    /**
     * **电池座：车法兰 → 磨密封面 → 装石英管与石墨环 → 检漏。**
     *
     *   45 钢 0.6 + 石英 0.04 + 石墨 0.02 + 铜 0.05 + 矿棉 0.05 + 水 0.5 → 电池座 1 件
     *
     * 三个判据：
     *   ① 密封面平面度 1 µm / φ30（石墨环是软的，它自己会贴合 —— 但钢座不平，压紧力就偏，
     *      偏的那一侧在 700 °C 上先漏）
     *   ② 密封段温度 ≤250 °C：石墨环靠**离开热区**活着（热区 700 °C，中间用 120 mm 的石英管隔开）
     *   ③ 漏率 ≤10⁻⁶ Pa·m³/s：没有氦质谱，用**保压法**：内腔 0.1 MPa，30 min 压降 ≤1 %
     */
    id: 'make/oxygen-probe-cell-body',
    name: 'Zirconia Oxygen Cell Body Manufacturing', name_zh: '氧化锆氧电池座制造',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'plant/oxygen-probe/cell-body',
        qty: q(1),
        gives: [
          { param: 'leakRate', kind: 'range', min: 0, max: 1e-6 },
          { param: 'cellVolume', kind: 'range', min: 1, max: 1.4 },
          { param: 'sealTemp', kind: 'range', min: 150, max: 220 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(3, 5) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 25) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '车法兰与内腔（φ30 密封面、φ10 通气孔、M42×1.5 压紧螺纹），一刀成活不留接刀痕',
        performedBy: 'lathe',
      },
      {
        note_zh: '磨密封面：平面度 1 µm / φ30（研磨平板 + 尾矿砂），与石墨环配研，接触带连续',
        performedBy: 'plant/grinder',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '装石英管与石墨环、矿棉保温；保压检漏 0.1 MPa / 30 min 压降 ≤1 %（没有氦质谱，只能这么判）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '45 钢 0.6 + 石英 0.04 + 石墨 0.02 + 铜 0.05 + 矿棉 0.05 → 1 件（约 0.55 kg）；差 0.2 kg = 车屑与磨削量；水 0.5 全走掉（磨削冷却与清洗）',
  },

  {
    /**
     * **取样与参比气路：车针阀 → 弯石英管 → 装流量孔板 → 打压。**
     *
     *   石英 0.05 + 铜 0.15 + 45 钢 0.1 + 矿棉 0.03 + 水 0.2 → 气路 1 套
     *
     * 三个判据（全部与"水/氧会粘在壁上"有关）：
     *   ① 死体积 ≤5 cm³：取样点到电池的距离 × 内径，φ4×0.3 m = 3.8 cm³ ✓
     *   ② 伴热 40–60 °C：不伴热，20 °C 的管壁在 1 ppm 的干气上吸掉 90 % 的水（D6 同一句）
     *   ③ 两路**等长等温**：参比与样品两支管差 10 mm 就是 0.3 K 的温差 ⇒ 热扩散电压
     *      0.3 K × 0.05 mV/K ≈ 15 µV ≈ 0.0003 个数量级（可忽略，但**不相等就有**，所以等长）
     */
    id: 'make/oxygen-probe-sample-line',
    name: 'Zirconia Oxygen Cell Sample and Reference Gas Line Manufacturing', name_zh: '氧化锆氧电池取样与参比气路制造',
    rate: { hours: q(20) },
    produces: [
      {
        item: 'plant/oxygen-probe/sample-line',
        qty: q(1),
        gives: [
          { param: 'deadVolume', kind: 'range', min: 3, max: 5 },
          { param: 'sampleFlow', kind: 'range', min: 80, max: 150 },
          { param: 'bypassRatio', kind: 'range', min: 12, max: 18 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(3, 20) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(3, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '车铜针阀与卡套（阀芯 30° 锥面配研，关到"手紧不漏"）、车 φ0.3 的流量孔板两片',
        performedBy: 'lathe',
      },
      {
        note_zh: '弯石英管（氢氧焰，弯后 800 °C 退火去应力：不退火的弯头在第一次升温时裂）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装配、缠伴热带（漆包铜线 0.5 m）、打压 0.2 MPa 保压 30 min；两支管量等长（±10 mm）',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '石英 0.05 + 铜 0.15 + 45 钢 0.1 + 矿棉 0.03 → 1 套（约 0.3 kg）；差 = 车屑 0.03 与石英切头；水 0.2 走掉',
  },

  {
    /**
     * **指零读数头：绕 5 位分压器 → 装齐纳恒温盒 → 装检流计 → 标定。**
     *
     *   铜线 0.12 + 铜 0.1 + 45 钢 0.2 + 玻璃 0.01 + 齐纳 1 + 检流计 1 + 计数片 2 +
     *   运放 1 + 电容 2 + 水 0.1 → 读数头 1 件
     *
     * **它的精度不来自器件，来自"同一个电阻体"**：5 位十进制分压器的 10 个抽头
     * 全绕在同一根铜丝上（同丝同温 ⇒ 比率 1:10 由**圈数**定，不由电阻值定）。
     * 这是 `probe-station.ts` §三·问 2 的原话，本件照抄。
     *
     * 三个判据：
     *   ① 分压比 1:10 的五个十进位，误差 ≤0.01 %（量块 + 比较仪量绕线节距 0.5 mm/圈）
     *   ② 零位分辨 1 µV（检流计 1/10 格，串 1 kΩ）
     *   ③ 漂 ≤30 µV/h：齐纳进 45 °C 恒温盒（自热恒温，`clock.ts:110` 同一招）
     */
    id: 'make/oxygen-probe-readout',
    name: 'Zirconia Oxygen Cell Null Readout Head Manufacturing', name_zh: '氧化锆氧电池指零读数头制造',
    rate: { hours: q(40) },
    produces: [
      {
        item: 'plant/oxygen-probe/readout',
        qty: q(1),
        gives: [
          { param: 'emfRange', kind: 'range', min: 6.2, max: 6.2 },
          { param: 'resolution', kind: 'range', min: 0, max: 6 },
          { param: 'drift', kind: 'range', min: 0, max: 30 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper-wire', qty: q(3, 25) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 100) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/galvanometer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room', 'plant/gauge-block'],
    steps: [
      {
        note_zh:
          '绕 5 位十进制分压器：同一根 φ0.2 铜线，10 个抽头，节距 0.5 mm（量块拼 100 mm 核 200 圈）；同一根丝、同一个骨架，比率靠圈数',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装齐纳恒温盒（45 °C 自热，±0.5 K）与限流；齐纳 6.2 V 的 TC ≤50 ppm/K 是这一件的基准',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '装检流计与刻度盘（0.01 µA/格 串 1 kΩ = 10 µV/格，1/10 格 = 1 µV）、玻璃窗与指针',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '标定：① 零位（短接，指针必须回零）② 刻度 62 µV/步 用齐纳 6.2 V 的 1/10⁵ 分压核 ③ 零漂 1 h ≤30 µV',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '铜线 0.12 + 铜 0.1 + 45 钢 0.2 + 玻璃 0.01 + 五片/两只标准件 → 1 件（约 0.6 kg）；差 = 绕线断头与面板边角；水 0.1 走掉',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.2 惰气熔融分析仪的零件
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **石墨坩埚：从石墨电极切板 → 套料钻 → 车锥面 → 焙烧。**
     *
     *   石墨电极 1/75 支（0.96 kg）+ 尾矿（磨料）0.01 + 水 0.1 + 氩 0.01 → 坩埚 200 只
     *
     * 一支 φ300×600 的电极（72 kg，`std/carbon-electrode-300`）能出
     * **15 000 只**（每只 2.9 g，含切板 15 mm 的锯口、套料钻的钻粉、车锥面的余量，
     * 出品率 60 %）⇒ 一批 200 只耗 **1/75 支**。
     *
     * ⚠️ **为什么不用 `mat/carbon`**：见 §一问 3 与 D4 —— 煤基碳的灰在 3000 °C 被碳还原，
     * 6.8 mg 氧变成 13 500 ppm 的空白。石墨电极的灰已经在石墨化时变成碳化物，不再放氧。
     *
     * 三个判据：
     *   ① 内孔 φ9 ±0.1、壁 1.5 ±0.1（壁厚就是电阻：1.5 → 3.6 mΩ，1.0 就只有 2.4 mΩ，
     *      电流要涨 1.4 倍）
     *   ② 锥面 30° 配电极（锥面接触电阻 ≤0.5 mΩ）
     *   ③ 焙烧 1200 °C / 2 h 通氩：赶掉吸附的水与油（**不预熔**：预熔要用本机自己，
     *      而本机不许出现在自己零件路线的 needs 里 —— 预熔在 `measure/hafnium-oxygen`
     *      的工序里做，每次分析前空烧 30 s）
     */
    id: 'make/fusion-crucible',
    name: 'Inert Gas Fusion-Infrared Oxygen Analyzer Graphite Crucible Manufacturing', name_zh: '惰气熔融-红外氧分析仪石墨坩埚制造',
    rate: { hours: q(48) },
    produces: [
      {
        item: 'plant/inert-gas-fusion-analyzer/crucible',
        qty: q(200),
        gives: [
          { param: 'ash', kind: 'range', min: 0, max: 0.5 },
          { param: 'maxTemp', kind: 'range', min: 3000, max: 3200 },
          { param: 'innerDiameter', kind: 'range', min: 8.8, max: 9.2 },
          { param: 'pieceMass', kind: 'range', min: 2.5, max: 3.2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/carbon-electrode-300', qty: q(1, 75) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh:
          '线锯切板 15 mm 厚（用 `plant/wire-saw` 那一套：金刚石线 + 水基浆；石墨切板不许干切，粉会进肺也进轴承）',
        performedBy: 'plant/wire-saw',
      },
      {
        note_zh: '套料钻 φ12 取芯、车外圆与 30° 锥面（石墨车削要吸尘；锥面与外圆的同轴度 0.05）',
        performedBy: 'lathe',
      },
      {
        note_zh:
          '焙烧 1200 °C / 2 h 通氩：赶吸附水与油（1200 是 `plant/kiln` 的下限；不预熔 —— 预熔归量测路线里的空烧）',
        performedBy: 'plant/kiln',
        under: [{ param: 'temperature', min: 1200, max: 1300 }],
      },
      {
        note_zh: '尺寸分类：内孔 φ9 ±0.1、壁 1.5 ±0.1、单只 2.9 g；按电阻分三档（同一档的坩埚才能共用一个升温程序）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '石墨电极 0.96 kg + 尾矿 0.01 + 氩 0.01 → 坩埚 200 只（0.58 kg）；差 0.38 kg = 锯口 15 mm×φ300 的切缝（0.2 kg）+ 套料钻粉 + 车削（0.18 kg，回收当电刷料，不单列条目）；水 0.1 走掉',
  },

  {
    /**
     * **上下电极与坩埚托：车石墨电极柱 → 车铜水冷座 → 打压。**
     *
     *   石墨 0.48（同样从电极车）+ 铜 1.2 + 45 钢 0.3 + 水 0.5 → 电极组 1 套
     *
     * 三个判据：
     *   ① 接触电阻 ≤0.5 mΩ：1 mΩ 就要多 1 kW（总功率只有 3.3 kW）；判据用**压降法**：
     *      1000 A 下电极两端 0.5 V 以内
     *   ② 水冷 2 L/min：铜座把电极的导热热流带走
     *   ③ 锥面 30° 配坩埚：锥面接触是"自对中"，平面对接要靠压紧力，而 3000 °C 上压紧力会松
     */
    id: 'make/fusion-electrode',
    name: 'Inert Gas Fusion-Infrared Oxygen Analyzer Upper/Lower Electrode and Crucible Support Manufacturing', name_zh: '惰气熔融-红外氧分析仪上下电极与坩埚托制造',
    rate: { hours: q(40) },
    produces: [
      {
        item: 'plant/inert-gas-fusion-analyzer/electrode',
        qty: q(1),
        gives: [
          { param: 'current', kind: 'range', min: 900, max: 1200 },
          { param: 'contactResistance', kind: 'range', min: 0, max: 0.5 },
          { param: 'coolingWater', kind: 'range', min: 2, max: 5 },
        ],
      },
    ],
    // 石墨电极、铜水冷座、压紧环在条目 composedOf 上；水 0.5 kg 是打压试验。
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1, 2) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '装石墨电极、铜水冷座与压紧环，锥面与坩埚配研（接触带连续 0.5 mm）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '打压：水冷 0.4 MPa 保压 10 min，1000 A 下量电极两端压降 ≤0.5 V（≤0.5 mΩ）',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '石墨 0.48 + 铜 1.2 + 45 钢 0.3 → 电极组 1 套（约 1.8 kg）；差 = 石墨车削 0.1 + 铜屑 0.08；水 0.5 走掉',
  },

  {
    /**
     * **炉膛与气路：卷焊水冷壳 → 砌刚玉衬 → 装石墨毡 → 装石英出口管 → 检漏。**
     *
     *   薄板 1.5 + 石墨毡 0.4 + 氧化铝 0.5 + 铜 0.4 + 石英 0.1 + 矿棉 0.2 + 水 1.5 → 炉膛 1 套
     *
     * 石墨毡是"惰"字的实现（§一条目注释）：漏进来的氧先被 3000 °C 的碳吃掉，
     * 于是样品仓的氧分压被压在 10⁻¹⁵ atm 以下。**它不是保温材料，是吸气剂。**
     *
     * 三个判据：
     *   ① 漏率 ≤10⁻⁸ Pa·m³/s（比氧电池那只严 100 倍）：空白的 1–5 ppm 全靠它
     *   ② 换气 ≤60 s（300 mL × 5 / 2 L/min）
     *   ③ 刚玉衬与石墨毡之间留 2 mm 缝（石墨毡在 3000 °C 上热膨胀 0.3 %，顶死刚玉就裂）
     */
    id: 'make/fusion-chamber',
    name: 'Inert Gas Fusion-Infrared Oxygen Analyzer Furnace Chamber and Gas Path Manufacturing', name_zh: '惰气熔融-红外氧分析仪炉膛与气路制造',
    rate: { hours: q(60) },
    produces: [
      {
        item: 'plant/inert-gas-fusion-analyzer/chamber',
        qty: q(1),
        gives: [
          { param: 'leakRate', kind: 'range', min: 0, max: 1e-8 },
          { param: 'purgeTime', kind: 'range', min: 45, max: 60 },
          { param: 'carrierFlow', kind: 'range', min: 0.5, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(3, 2) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(2, 5) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2, 5) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(3, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '薄板剪折、卷焊水冷夹套（0.4 MPa 保压 10 min），开观察孔与电极孔（同轴度 0.2）',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh: '砌刚玉衬 8 mm（磷酸铝结合，200 °C 烘干；不许用水泥 —— 水泥里的碳酸钙在 3000 °C 放 CO₂）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '装石墨毡 100 mm（与刚玉衬留 2 mm 缝）+ 石英出口管 + 铜管路；保压 0.1 MPa / 30 min 压降 ≤0.5 %',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '换气时间实测：300 mL × 5 = 1.5 L，2 L/min ⇒ 45 s；漏率用压升法（关阀 1 h 压升 ≤0.5 Pa）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '薄板 1.5 + 石墨毡 0.4 + 氧化铝 0.5 + 铜 0.4 + 石英 0.1 + 矿棉 0.2 → 炉膛 1 套（约 2.6 kg）；差 = 剪边 0.1、砌衬废料 0.08、石墨毡切割 0.05；水 1.5 走掉（砌衬、打压、清洗）',
  },

  {
    /**
     * **红外检测器：焊 20 对铜-铁偶 → 碳黑吸收片 → 磨石英窗 → 金镜与 1 m 气室。**
     *
     *   铜 0.02 + 铁 0.01 + 碳 0.005 + 石英 0.02 + 金 0.001 + 玻璃 0.02 + 水 0.2 → 检测器 1 件
     *
     * **热电堆是本层唯一能看 2.3 µm 的眼睛**（§一问 3）：硅光电管到 1.1 µm，
     * InGaAs 到 1.7 µm，PbSe/MCT 一件都没有。铜-铁偶的 Seebeck 是 12–14 µV/K
     * （铁正、铜负），20 对串起来 240–280 µV/K；冷端靠铝块均温（0.1 K 的冷端漂
     * 就是 25 µV 的假信号 —— 所以冷端必须**比热端大 100 倍的金属块**）。
     *
     * 三个判据：
     *   ① 每一对的偶丝 φ0.05、长 3 mm（细到热容小、短到不被气室的对流扰动）
     *   ② 石英窗两面研平行到 2 µm、面形 λ/2（窗成了透镜，光就不落在同一个吸收片上）
     *   ③ 1 m 光程用两面金镜折返 5 次（金不氧化 —— `precious.ts:38` 的"金是最后手段"第四次兑现）
     */
    id: 'make/fusion-ir-detector',
    name: 'Inert Gas Fusion-Infrared Oxygen Analyzer Infrared Detector Manufacturing', name_zh: '惰气熔融-红外氧分析仪红外检测器制造',
    rate: { hours: q(80) },
    produces: [
      {
        item: 'plant/inert-gas-fusion-analyzer/ir-detector',
        qty: q(1),
        gives: [
          { param: 'responsivity', kind: 'range', min: 240, max: 280 },
          { param: 'pathLength', kind: 'range', min: 800, max: 1000 },
          { param: 'cellVolume', kind: 'range', min: 80, max: 100 },
          { param: 'windowCutoff', kind: 'range', min: 2.8, max: 3.2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 50) }] },
      { anyOf: [{ item: 'std/photodiode-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh:
          '焊 20 对铜-铁偶（φ0.05、长 3 mm，串成 240–280 µV/K）；冷端压在铝块上（冷端漂 0.1 K 就是 25 µV 的假信号）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '碳黑吸收片（灯焰熏烟 + 石墨粉压片，吸收率 ≥0.95）；它的热容决定了响应时间 30 ms',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '磨石英窗两面平行 2 µm、面形 λ/2（窗成了透镜，光斑就跑出吸收片）；镀金镜两面（真空蒸镀）',
        performedBy: 'plant/grinder',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装气室 1 m（金镜折返 5 次）、斩波盘（20 叶，5 r/s = 50 Hz）、参考光电管',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '铜 0.02 + 铁 0.01 + 碳 0.005 + 石英 0.02 + 金 0.001 + 玻璃 0.02 → 检测器 1 件（约 0.7 kg，含铝冷端块与支架）；差 = 偶丝断头、磨削量与镀膜损耗；水 0.2 走掉',
  },

  {
    /**
     * **读数与斩波同步：装动圈检流计 → 装参考通道 → 刻度 → 标定。**
     *
     *   检流计 1 + 毫伏表 1 + 运放 2 + 计数片 2 + 齐纳 1 + 铜线 0.08 + 45 钢 0.3 +
     *   玻璃 0.02 + 水 0.2 → 读数 1 件
     *
     * **标定是本件最要紧的一步，而本层没有标钢**（certified reference material，0 条）：
     *
     *   ZrO₂ 的理论氧含量 16.00/123.22 = **26.16 %**、Al₂O₃ 是 48.00/101.96 = **47.06 %**
     *   —— 这是两条**只由化学计量决定**的高量程点（本层有 `mat/zirconia`、`mat/alumina`，
     *   且它们的化学计量比在条目里就是纯度）。500–3000 ppm 落在 26.16 % 的 1/100 处，
     *   线性外推的偏差按 **±2 %** 记（热电堆的线性由斩波与相敏检波保证）。
     *
     * 三个判据：
     *   ① ZrO₂ / Al₂O₃ 两点定斜率，偏差 ≤2 %
     *   ② 空白：空坩埚走一遍完整周期，读数 ≤5 ppm
     *   ③ 时间常数 1–30 s，与脉冲释放的 30 s 匹配（太快噪声大，太慢拖不住峰）
     */
    id: 'make/fusion-readout',
    name: 'Inert Gas Fusion-Infrared Oxygen Analyzer Readout and Chopper Synchronization Manufacturing', name_zh: '惰气熔融-红外氧分析仪读数与斩波同步制造',
    rate: { hours: q(40) },
    produces: [
      {
        item: 'plant/inert-gas-fusion-analyzer/readout',
        qty: q(1),
        gives: [
          { param: 'timeConstant', kind: 'range', min: 5, max: 30 },
          { param: 'drift', kind: 'range', min: 0, max: 2 },
          { param: 'frequency', kind: 'range', min: 40, max: 60 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/galvanometer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/millivoltmeter-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(2, 25) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '装斩波同步与相敏检波：动圈当乘法器（20 ms 时间常数 ⇒ 8 Hz 以上平均成一条线，`flow-and-rf.ts:2071` 同一招）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '刻度 6 档（0.1 mV–10 V）；面板上把"ppm O = f(mV)"的曲线画成直线刻度（斜率只与样品质量有关）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '标定：ZrO₂（26.16 % O）与 Al₂O₃（47.06 % O）两点定斜率（各 3 次，取中位数，偏差 ≤2 %）；再做空坩埚空白 ≤5 ppm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '十六片/只标准件 + 铜线 0.08 + 45 钢 0.3 + 玻璃 0.02 → 读数 1 件（约 0.9 kg）；差 = 面板边角与线头；水 0.2 走掉',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.3 露点仪的零件
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **P₂O₅ 电解池：绕双螺旋金丝 → 涂磷酸 → 250 °C 脱水 → 通电跑合成 P₂O₅ 膜。**
     *
     *   金 2 g + 石英 0.05 + 磷酸 0.02 + 水 0.3 + 尾矿 0.005 → 电解池 1 件
     *
     * **跑合（run-in）是这条路线的灵魂**：涂上去的是 20–30 % 的稀磷酸（本层只有湿法酸，
     * `ores.ts:335` 的 gives 是 20–30 % —— D6），要靠 250 °C 脱水 + 电解把膜里的水
     * 抽干到 P₂O₅。**不跑合，第一次读数就是膜里那 70 % 的水**（几千 ppm 的假峰）。
     *
     * 三个判据：
     *   ① 两根金丝间距 1 mm（近了短路，远了电场不够 —— 每段 ≥50 V 就是为这个间距定的）
     *   ② 250 °C 脱水 2 h + 50 V 跑合 4 h（电流从 mA 掉到 µA 级就是干了）
     *   ③ 空白 ≤0.05 ppm（跑合后的残余电流折算）
     */
    id: 'make/dewpoint-electrolytic-cell',
    name: 'P₂O₅ Electrolytic Cell Manufacturing', name_zh: 'P₂O₅ 电解池制造',
    rate: { hours: q(60) },
    produces: [
      {
        item: 'plant/dew-point-meter/electrolytic-cell',
        qty: q(1),
        gives: [
          { param: 'segments', kind: 'range', min: 5, max: 5 },
          { param: 'voltagePerSegment', kind: 'range', min: 50, max: 50 },
          { param: 'sensitivity', kind: 'range', min: 13, max: 14 },
          { param: 'cellLength', kind: 'range', min: 450, max: 550 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/gold', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 20) }] },
      {
        anyOf: [
          {
            item: 'mat/phosphoric-acid',
            qty: q(1, 50),
            need: [{ param: 'concentration', kind: 'range', min: 20, max: 30 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/water', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1, 200) }] },
    ],
    needs: ['plant/metrology-room', 'plant/hv-test-bench'],
    steps: [
      {
        note_zh:
          '绕双螺旋金丝（φ0.1，间距 1 mm，5 段各 100 mm）：金丝不氧化，是本层唯一能在 50 V 强酸阳极上活下来的金属',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '涂 20–30 % 磷酸（薄到看得见丝，厚了脱水要一整天）；涂完 250 °C / 2 h 脱水成聚磷酸',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 240, max: 260 }],
      },
      {
        note_zh:
          '通电跑合：50 V/段（5 段 250 V 从 `plant/hv-test-bench` 的偏压档取），跑 4 h；电流从 mA 掉到 µA 就是膜里没水了 —— **这一步做不好，后面所有读数都偏高**',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '装进石英管、封两端；量绝缘（丝间 ≥10 MΩ @250 V）与空白（干氩吹 1 h，电流 ≤3 µA）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '金 0.002 + 石英 0.05 + 磷酸 0.02 + 尾矿 0.005 → 电解池 1 件（约 0.2 kg）；差 = 金丝断头与绕线废段、石英切头；水 0.3 全走掉（脱水与清洗 —— 那 0.014 kg 的水正是"要烤掉 70 %"的那一笔）',
  },

  {
    /**
     * **冷镜头：抛光银镜 → 车铜冷指 → 绕加热丝 → 焊热电偶 → 装光路 → 两点标定。**
     *
     *   银 0.03 + 铜 0.3 + 铜线 0.02 + 铁 0.005 + 玻璃 0.01 + 光电管 1 + 矿棉 0.02 + 水 0.3
     *   → 冷镜头 1 件
     *
     * 标定只有两个点，而两点都不需要另造设备：
     *   **0 °C**  冰水（`mat/water` 的冰，湿台里做）—— 冰点瓶就是冷端的 0 °C
     *   **−78.5 °C** 干冰在 0.6 kPa 上是 −127 °C（`sublimator-coldtrap.ts:177` 的实测口径），
     *              所以 −78.5 用 `plant/xenon-loop` 的 −80…−70 档（`xenon-loop.ts:349`）
     *
     * 三个判据：
     *   ① 镜面 Ra ≤0.01 µm、λ/4（露珠的判据是**镜面反射率掉 10–30 %**，镜面粗糙就判不出）
     *   ② 判露通道的零点：干燥时反射最强，结露 10 s 内掉 10 % 以上（光电管 + 一级运放）
     *   ③ 镜温 ±1.0 K（铜-铁偶 14 µV/K，指零法 1 µV ⇒ 0.07 K 的读数分辨，但冷端与
     *      偶丝不均匀性给 ±1.0 K —— D8）
     */
    id: 'make/dewpoint-mirror-head',
    name: 'Dew-Point Meter Chilled Mirror Head Manufacturing', name_zh: '露点仪冷镜头制造',
    rate: { hours: q(50) },
    produces: [
      {
        item: 'plant/dew-point-meter/mirror-head',
        qty: q(1),
        gives: [
          { param: 'mirrorTemp', kind: 'range', min: -80, max: 20 },
          { param: 'tempAccuracy', kind: 'range', min: 0, max: 1 },
          { param: 'heatBalance', kind: 'range', min: 0, max: 10 },
          { param: 'mirrorArea', kind: 'range', min: 1, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silver', qty: q(3, 100) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1, 50) }] },
      { anyOf: [{ item: 'std/photodiode-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(3, 10) }] },
    ],
    needs: ['plant/metrology-room', 'plant/xenon-loop'],
    steps: [
      {
        note_zh: '抛光银镜面到 Ra ≤0.01 µm、面形 λ/4（银软，抛完不许再摸；露珠的判据全靠镜面反射）',
        performedBy: 'plant/grinder',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '车铜冷指与镜座（贴合面研配，间隙 ≤5 µm —— 间隙里的一点空气热阻就让镜温滞后 30 s）',
        performedBy: 'lathe',
      },
      {
        note_zh: '绕 20 Ω 漆包铜线加热绕组（湿端 0–10 W 平衡冷源）；焊铜-铁偶在镜背（冷端进冰点瓶）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '装光电判露（`std/photodiode-general` + 小灯，45° 入射 45° 接收 —— 结露时散射把反射压低 10–30 %）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '两点标定：冰点瓶 0 °C 与 `plant/xenon-loop` 的 −78 °C 档；判据是两点读数差落在 78 ± 1 K 内（冷端与偶丝的不均匀性在这一步露出来）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: -80, max: -70 }],
      },
    ],
    unbalanced_zh:
      '银 0.03 + 铜 0.3 + 铜线 0.02 + 铁 0.005 + 玻璃 0.01 + 矿棉 0.02 → 冷镜头 1 件（约 0.5 kg）；差 = 抛光粉与车屑；水 0.3 走掉（抛光与冰点瓶）',
  },

  {
    /**
     * **取样板：车针阀与孔板 → 弯管与退火 → 装伴热 → 打压。**
     *
     *   石英 0.06 + 玻璃 0.05 + 铜 0.4 + 45 钢 0.2 + 矿棉 0.05 + 水 0.4 → 取样板 1 套
     *
     * **水是唯一会"粘在壁上"的物种**（§一条目注释）：伴热 40–60 °C + 石英管 + 旁路 10–20×
     * + 死体积 ≤5 cm³，四条缺一条，1 ppm 的气体读出来就是"管子昨天的历史"。
     *
     * 三个判据：
     *   ① 死体积 ≤5 cm³（取样点到池子）
     *   ② 伴热 40–60 °C（高了 P₂O₅ 膜会干裂，低了水吸在壁上）
     *   ③ 孔板流量计用**体积法**标（没有天平，`unblock-polymer-metering.ts` 的
     *      "倒 20.00 kg 水划一道线"那一招）：量的是单位时间的气泡数，不是质量
     */
    id: 'make/dewpoint-sample-panel',
    name: 'Dew-Point Meter Sample Panel Manufacturing', name_zh: '露点仪取样板制造',
    rate: { hours: q(30) },
    produces: [
      {
        item: 'plant/dew-point-meter/sample-panel',
        qty: q(1),
        gives: [
          { param: 'sampleFlow', kind: 'range', min: 80, max: 120 },
          { param: 'bypassRatio', kind: 'range', min: 12, max: 18 },
          { param: 'heatTrace', kind: 'range', min: 45, max: 55 },
          { param: 'deadVolume', kind: 'range', min: 3, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(3, 50) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2, 5) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '车铜针阀（30° 锥面配研）与 φ0.15/φ0.25 的孔板两片（两档流量并联成 50–200 mL/min）',
        performedBy: 'lathe',
      },
      {
        note_zh: '弯石英管与退火 800 °C（应力不释放，第一次通热伴热就裂）；玻璃流量计的锥管吹制',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '缠伴热带（0.5 m 漆包铜线 + 矿棉）与装针阀、孔板；打压 0.2 MPa 保压 30 min',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '流量标定：气泡计数法（1 L 量筒倒扣，量 100 mL 的泡数与时间），两档 80/120 mL/min',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '石英 0.06 + 玻璃 0.05 + 铜 0.4 + 45 钢 0.2 + 矿棉 0.05 → 取样板 1 套（约 0.7 kg）；差 = 车屑与吹制废品 0.1；水 0.4 走掉',
  },

  {
    /**
     * **保护柱：填石英棉与 P₂O₅ 前置床 → 封管 → 标空白。**
     *
     *   石英 0.03 + 磷酸 0.01 + 玻璃 0.02 + 水 0.2 → 保护柱 1 支
     *
     * 一支 0.5–2 g 吸水容量的前置床，同时干两件事：挡 5 µm 以上的颗粒、
     * 挡停机时从取样管爬回来的水。**它自己就是本底**（0.05 ppm）——这一点必须承认，
     * 否则"分辨 0.05 ppm"就成了没有分母的宣传。
     */
    id: 'make/dewpoint-guard-column',
    name: 'Dew-Point Meter Guard Column Manufacturing', name_zh: '露点仪保护柱制造',
    rate: { hours: q(12) },
    produces: [
      {
        item: 'plant/dew-point-meter/guard-column',
        qty: q(1),
        gives: [
          { param: 'capacity', kind: 'range', min: 1, max: 1.5 },
          { param: 'filterPore', kind: 'range', min: 4, max: 6 },
          { param: 'blank', kind: 'range', min: 0, max: 0.05 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 30) }] },
      { anyOf: [{ item: 'mat/phosphoric-acid', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '石英棉 5 µm 填床 + 涂磷酸 250 °C 脱水（与电解池同一条脱水工艺，量小）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 240, max: 260 }],
      },
      {
        note_zh: '封管（两端磨口 + 蜡封）；标空白：干氩 100 mL/min 吹 1 h，电解池电流增量 ≤0.7 µA（= 0.05 ppm）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '石英 0.03 + 磷酸 0.01 + 玻璃 0.02 → 保护柱 1 支（约 0.1 kg）；差 = 石英棉切头与封口蜡；水 0.2 里那 20 % 的脱水走掉',
  },

  {
    /**
     * **露点读数头：6 档微安计 → 250 V 限流保护 → 刻度 → 两点标定。**
     *
     *   检流计 1 + 齐纳 1 + 运放 2 + 计数片 2 + 电容 2 + 铜线 0.06 + 45 钢 0.2 +
     *   玻璃 0.02 + 水 0.2 → 读数 1 件
     *
     * **标定不需要标气**，这是 P₂O₅ 法比冷镜便宜的地方：电流按法拉第定律直接折成 ppm
     * （13.4 µA/ppm 由流量与刻度面积定），所以标定只是**电阻刻度**：
     * 用齐纳 6.2 V 串 1 MΩ/100 kΩ/10 kΩ 造出 6.2/62/620 µA 三个电流点（±0.5 %）。
     *
     * 三个判据：
     *   ① 6 档，每档 10 倍，重叠 1.5 倍（13.4 µA/ppm ⇒ 0.05–1000 ppm 要覆盖 0.67 nA–13.4 mA）
     *   ② 1 % 的电解电流纹波（250 V 来自 `hv-test-bench`）已经占 0.01 ppm 的全量 ⇒ 记 D7
     *   ③ 限流 2 mA/档（跑合时会过流，没有限流就烧金丝）
     */
    id: 'make/dewpoint-readout',
    name: 'Dew-Point Meter Readout Head Manufacturing', name_zh: '露点仪读数头制造',
    rate: { hours: q(36) },
    produces: [
      {
        item: 'plant/dew-point-meter/readout',
        qty: q(1),
        gives: [
          { param: 'currentRange', kind: 'range', min: 0.01, max: 10000 },
          { param: 'resolution', kind: 'range', min: 0, max: 0.001 },
          { param: 'biasVoltage', kind: 'range', min: 240, max: 260 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/galvanometer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(3, 50) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '装 6 档分流（10 mA…0.1 µA：铜线绕的分流器 + 齐纳分压）与限流 2 mA/档',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '装 250 V 偏压的引入与保护（限流电阻 100 kΩ、放电电阻、绝缘支柱 —— 250 V 上的一点漏电就是 0.1 ppm）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '刻度：齐纳 6.2 V 串 1 MΩ / 100 kΩ / 10 kΩ 造 6.2 / 62 / 620 µA 三点（±0.5 %）；面板直接刻 ppm（13.4 µA/ppm）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '十片/只标准件 + 铜线 0.06 + 45 钢 0.2 + 玻璃 0.02 → 读数 1 件（约 0.8 kg）；差 = 面板边角与线头；水 0.2 走掉',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.4 四条量测路线 —— 三台机器**只在这里当执行者**
  //
  // 形状照 `subnm-readout.ts` 的 `measure/subnm-readout`：
  //   **它不改变被测物，它把一个"未知"变成"已知"** ⇒ `gives` 与 `uses` 是同一个物件，
  //   只是出去的那个带了**被验过的窗口**。
  // ─────────────────────────────────────────────────────────────────────────

];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...OXY_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/oxygen-probe',
    name: 'Zirconia Oxygen Cell Assembly', name_zh: '氧化锆氧电池装配',
    produces: [{
      item: 'plant/oxygen-probe',
      qty: q(1),
      gives: [
      { param: 'pO2Range', kind: 'range', min: 1e-15, max: 1 },
      { param: 'detectionLimit', kind: 'range', min: 0, max: 1e-9, dir: 'atMost' },
      { param: 'accuracy', kind: 'range', min: 0, max: 26, dir: 'atMost' },
      { param: 'responseTime', kind: 'range', min: 0, max: 30, dir: 'atMost' },
      { param: 'emfPerDecade', kind: 'range', min: 44, max: 52 },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/inert-gas-fusion-analyzer',
    name: 'Inert Gas Fusion-Infrared Oxygen Analyzer Assembly', name_zh: '惰气熔融-红外氧分析仪装配',
    produces: [{
      item: 'plant/inert-gas-fusion-analyzer',
      qty: q(1),
      gives: [
      { param: 'measure/range', kind: 'range', min: 5, max: 5000 },
      { param: 'measure/detectionLimit', kind: 'range', min: 0, max: 5, dir: 'atMost' },
      { param: 'measure/accuracy', kind: 'range', min: 0, max: 3, dir: 'atMost' },
      { param: 'cycleTime', kind: 'range', min: 0, max: 120, dir: 'atMost' },
      { param: 'sampleMass', kind: 'range', min: 0.1, max: 1 },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/dew-point-meter',
    name: 'Dew-Point Meter Assembly', name_zh: '露点仪装配',
    produces: [{
      item: 'plant/dew-point-meter',
      qty: q(1),
      gives: [
      { param: 'dewPoint', kind: 'range', min: -95, max: 20 },
      { param: 'range', kind: 'range', min: 0.05, max: 23000 },
      { param: 'detectionLimit', kind: 'range', min: 0, max: 0.05, dir: 'atMost' },
      { param: 'accuracy', kind: 'range', min: 0, max: 10, dir: 'atMost' },
      { param: 'responseTime', kind: 'range', min: 0, max: 300, dir: 'atMost' },
      { param: 'measure/water', kind: 'range', min: 0, max: 23000 },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...OXY_ROUTES, ...ASSEMBLY_ROUTES];
