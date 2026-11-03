/**
 * 13.5 nm at-wavelength 反射率测量 —— EUV 多层膜唯一能验收自己的手段。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 这一件为什么特别难：环咬自己
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 13.5 nm 的反射率只能在 13.5 nm 下测 —— 别的波长量的是别的镜子。
 * 而 13.5 nm 的光源（`plant/euv-source`）**本身就是这面镜子要造的东西**：
 * 收集镜（`plant/euv-source/collector`）是一片 φ300 的 Mo/Si，照明与投影
 * （`data/machine/euv-mirror.ts`）也全是它。没有镜子就没有光，没有光就测不了镜子。
 *
 * **但这个环是开的，不是死的。** 三件事把它撬开：
 *
 *   ① 相对测量不需要绝对标准。工业界在同步辐射上做的双镜互测法，
 *      只需要**线性**与**同一个探测器**，不需要任何已知反射率的镜子。
 *   ② 本层其实没有"已知反射率的镜子"可借：`std/euv-mirror-300` 的
 *      `reflectivity 55–70 %` 是**设计值**，不是测值 —— `euv-mirror.ts` 第 163 行
 *      自己写着"`gives: reflectivity 55–70` 是设计值，不是测值"。所以只有互测一条路。
 *   ③ 真正的堵点不在镜子，在**光的电学**：DPP 头造得出来（`make/euv-dpp-head`），
 *      而它的 1 kV / 10 kA 脉冲电源没有（`euv-source.ts` 缺口 ③）；
 *      LPP 那条有 30 W 的 CO₂ 激光（`make/euv-co2-laser` 交付 30 W），
 *      却卡在 10.6 µm 窗口（缺口 ②）与电源上。**本仪器等的不是它自己。**
 *
 * ⚠️ 一句话本文件要反复说：**这台仪器造得出来，用它量的那一束光造不出来。**
 * 所以下面四个问题全部按"如果光有"来算，而每一条的降级点都指回光源。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 问题一：13.5 nm 的探测器要什么
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 92 eV 的光子在物质里做的事与可见光不同：它电离、它打出二次电子、
 * 它在每一条路径上都被吸收（穿透深度只有几 nm）。所以"探测器"这个词要重选一遍。
 *
 * 三个候选，逐个算：
 *
 * ① 光电二极管（`std/photodiode-general` 存在，但它是**可见光**的）
 *
 *    理论上限很好看：92 eV ÷ 3.66 eV（Si 的电子-空穴对产生能）= **25 e⁻/光子**，
 *    也就是 25 × 1.602e-19 ÷ 1.47e-17 J = **0.27 A/W**（与可见光的 0.3–0.5 A/W 同量级）。
 *    但这条链是 **`make/photodiode` 的片子**，不是 EUV 二极管：
 *
 *      13.5 nm 在 Si 里的穿透深度 5 nm（`euv-mirror.ts`：Mo 3.4 / Si 5 nm），
 *      而 `make/photodiode` 的结在 0.5–1 µm 深（POCl₃ 扩散 1000–1100 °C，
 *      没有时间控制 —— 结深本身就没定数）。
 *
 *    载流子要在 n⁺ 表层里**扩散** 0.5–1 µm 才到结，而重掺杂层的扩散长度
 *    L ≈ 0.1 µm：e^(−5) = 0.7 %；放宽到 L = 0.3 µm 也只有 e^(−1.7) = 18 %。
 *    加上表面复合（13.5 nm 的能量全落在最外面 5 nm，正好是表面态最密的一层），
 *    收集率只剩 **0.2–1 e⁻/光子（0.002–0.01 A/W）—— 比理论值小 25–100 倍**。
 *
 *    ⚠️ 致命的不在这个数小，在**它由表面决定**：碳污染长一层，表面复合速度变一次，
 *    量子产额就漂一次 —— 而碳污染正是本层压不住的那件事（问题三）。
 *    **一个由被测对象的污染决定灵敏度的探测器，不能当量具。**
 *
 *    所以本文件把它留在仪器里干它擅长的活：**可见光对准**（DPP 的辉光）
 *    与 **589 nm 散射**（见问题三之后那一段），不用它量 13.5 nm。
 *
 * ② 荧光屏 + 光电倍增（EUV 打 ZnS:Ag / 水杨酸钠 → 可见光 → 光电管）
 *
 *    这是工业界与天文界最常用的一条（水杨酸钠在 50–100 eV 的荧光效率 40–60 %）。
 *    但本层**做不出来，不是做得差**：ZnS 要锌，水杨酸钠要水杨酸（苯酚羧化），
 *    而 `uses` 白名单里没有锌、没有硫、没有水杨酸 —— 三样都得另起一条化工链。
 *    所以这一条在本文件里不存在，不是被比较掉的。
 *
 * ③ 金黑吸收腔 + 铜-铁热电堆（测热，绝对能量）—— **选它**
 *
 *    金在 13.5 nm 上是"最不坏"的金属（n ≈ 0.94，反射 2 %），
 *    而在**低气压氩里蒸出来的金**不是镜面，是一团绒状的"金黑"：
 *    颗粒 10–50 nm、孔隙率 90 %，光进去被反复吸收 —— 从 200 nm 到 50 µm
 *    吸收率 99 %。**它是本层唯一不需要窗口、不需要单色器的 13.5 nm 吸收体。**
 *
 *    代价两条，都写进数里：
 *      金黑要 100–300 Pa 的氩才长得松。本层的蒸镀台（`plant/evaporator`）
 *      只到 **1–10 Pa**（罗茨机组，`euv-mirror.ts` 问题二同一笔账）→ 结构更致密
 *      → 吸收率从 99 % 掉到 **95 %**，而且对入射角更敏感。
 *      金黑在 **60–70 °C 以上就烧结**（绒状结构塌成镜面，吸收率掉到 60 %）——
 *      所以它**不能跟着腔体烘 150 °C**。这条把烘烤拆成了两次，见问题三。
 *
 *    数：25 对铜-铁（Fe–Cu 的 Seebeck 13 µV/K 一对，`data/machine/unblock-thermocouple.ts`
 *    那支热电偶同一门手艺）→ 0.33 mV/K；冷端接 20 °C 水冷环，热导 G = 1 mW/K
 *      → **S = 0.33 V/W**；热容 C = 1 mJ/K → **τ = 1 s**
 *      → 1 mW 时温升 1 K、输出 0.33 mV（上限 15 mW / 15 K，再高热电堆就烧了）
 *    噪声：25 对 × 20 Ω = 500 Ω，Johnson √(4kTR) = √(4×1.38e-23×300×500) = 2.9 nV/√Hz
 *      ÷ 0.33 V/W = 8.8e-9 W/√Hz；1/f（斩波频率以下）与读数放大器再乘 3
 *      → **NEP ≈ 3×10⁻⁸ W/√Hz**
 *      在 1 mW 上 S/N = 3.3×10⁴（1 Hz 带宽）；在 0.1 mW 上 = 3.3×10³
 *    线性度：Seebeck 系数的温度系数 0.1 %/K × 温升 3 K = **0.3 %**（问题四要 1.6 %）
 *
 *    它不区分波长 —— 这既是它唯一能用的原因（**没有 13.5 nm 的滤光片**），
 *    也是它最大的麻烦（带外光一起进去，见问题二）。对付办法只有两个：
 *    角扫描减本底（多层膜的角选择性）与**同一个探测器测全部构型**（比值消掉它）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 问题二：角度精度 —— 峰有多宽，要几档，刻度圈够不够
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 布拉格条件（θ 从法线量）：λ = 2d·cos θ。
 *
 *   d = 6.9 nm、λ = 13.5 nm → cos θ = 0.978 → **θ = 11.9°**（近正入射）
 *   设计点写 6°：d = 13.5/(2·cos 6°) = **6.79 nm** —— 与 `make/euv-mirror-300`
 *   给的 6.8–7.0 nm 对得上，所以本仪器按 6° 装、峰在 11.9°。
 *
 * 角带宽：Δλ/λ = 1/N。取 `euv-mirror.ts` 问题三的数 Δλ/λ = 2.5 %（40 对）；
 * 真正相干的其实只有 25 对左右（Mo 与 Si 都在吸收）→ 4 %。下面按 2.5 % 算，
 * 是**偏保守**的一侧（峰算窄了，档数只会更多）。
 *
 *   Δθ = (Δλ/λ) / tan θ
 *     θ = 6°   → 0.025 / 0.105 = 0.24 rad = **13.6°**
 *     θ = 11.9° → 0.025 / 0.211 = 0.12 rad = **6.8°**
 *
 * ⚠️ **题设说"角带宽 0.5–1°"，这一档在本镜子上不成立。** 反推：
 * 0.5° 要 tan θ = 0.025/0.0087 = 2.9 → θ = 71°（掠角 19°），
 * 而掠角 19° 的布拉格周期是 d = 13.5/(2·cos 71°) = 21 nm —— 那是**另一块多层膜**
 * （掠入射镜），不是这块 6.9 nm 的近正入射镜。所以：
 *
 *   本镜子（近正入射）  峰宽 7–14°   → 0.5° 一档，全扫 0–30° = **61 档**；
 *                       峰两侧加密到 0.05°（±2° 内 81 档）→ 约 **140 档**
 *   掠入射镜（另一块膜） 峰宽 0.5–1°   → **10–20 档**（每档 0.05°）
 *
 * 刻度圈够不够（这是题设真正要的那个答案）：
 *
 *   折射计的分度盘（`plant/refractometer/circle`）读到 1″，整机合成 **±0.9′ = 0.015°**
 *   （`unblock-refractometer-circle.ts` 第 118 行：RSS 0.15²+0.43²+0.55²+0.22²+0.5²）。
 *
 *   对 0.5° 一档：0.015° 是它的 **1/33**；对 0.05° 一档：**1/3.3** —— 都够。
 *
 *   但真正要卡的不是峰宽，是**峰位**：峰位定周期。
 *
 *     dθ/dd = 1/(d·tan θ) = 1/(6.9 × 0.211) = 0.688 rad/nm
 *     → 周期差 0.1 nm，峰移 0.069 rad = **3.9°**（近正入射 —— 极灵）
 *     → 刻度圈 0.015° = 2.6e-4 rad → 分得开 **Δd = 3.8×10⁻⁴ nm**
 *
 *   也就是说这块刻度圈比 euv-mirror 的 ±0.1 nm 要求细 **250 倍**。
 *   在掠入射（tan 71° = 2.9）下同一个圈分得开 0.007 nm，仍细 14 倍。
 *   **够，而且不是勉强够。**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 问题三：真空与污染 —— 碳每小时吃掉多少反射率，烘多久
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 样品与探测器都在 1e-5 Pa 里（`plant/euv-vacuum` holds 1e-8–1 Pa）。
 *
 * 碳氢 1e-8 Pa 的撞击率（`euv-source.ts` 问题 1 同一笔账）：
 *
 *   Z = p/√(2πmkT)，M = 100 u → 1.5e14 m⁻²s⁻¹ = 1.5e10 cm⁻²s⁻¹
 *   单分子层 1e15 cm⁻² → **6.7×10⁴ s = 18.6 h 长满一层**
 *
 * 一层是多少纳米、吃掉多少反射率：
 *
 *   1e15 cm⁻² × 12 u ÷ 2.2 g/cm³ = **0.09 nm**（一层碳只有 0.9 埃）
 *   碳在 92 eV 的吸收长度 200 nm（f₂ ≈ 0.6 → μ = 5.1e6 m⁻¹）
 *     一次通过 0.09/200 = 4.5e-4，光在镜子上走**两次** → 9.0e-4
 *   → **每层 −0.09 %，即 −0.005 %/h（纯热沉积）**
 *
 * 但热沉积不是全部 —— **光束自己在裂解碳氢**：92 eV 的光在镜面上打出二次电子
 * （产额 0.3 e⁻/光子），二次电子把吸附的碳氢按 σ ≈ 1e-16 cm² 裂解成碳，
 * 于是被照亮的那一小块比暗处长 20–200 倍。工业上"EUV 镜子几小时掉一层碳"
 * 就是这个机制，本层没有氢自由基洗（`euv-source.ts` 说氢气只有 1 sccm）。
 *
 *   光束处：**−0.1 % 到 −1 %/h**（取 −0.1 %/h 做预算）
 *
 * 烘烤多久：本层首次开机到 1e-5 Pa 是 30 h（粗抽 0.2 + 升温 3 + **150 °C 烘 24 h**
 * + 降温 3）。烘烤把碳氢从 1e-8 压到 1e-10（两个量级 —— 水的脱附活化能低，
 * 能压三个量级；碳氢重，只能压两个）→ 18.6 h 拉成 **78 天**，−0.005 %/h 变
 * **−0.00005 %/h**，光束处 −0.1 %/h 变 −0.001 %/h。
 *
 * **所以烘烤是必需项，不是优化项：** 不烘，一次 3 h 的测量里碳就吃掉 0.3–3 %，
 * 与问题四要的 0.5 % 同量级到 6 倍，而且它是**系统漂移**（平均不掉）；
 * 烘了，剩 0.003–0.03 %，落到预算里可以不管。
 *
 * ⚠️ 烘烤要拆成两次，因为金黑 60–70 °C 就烧结：
 *   第一次 150 °C × 24 h（腔体、测角台、光阑、样品台在，**探测器不在**）
 *   第二次 60 °C × 12 h（装上探测器后轻烘，只走它自己的放气）
 * 这也正好是**波纹管馈通**（没有真空脂）存在的理由：真空中不能抹油，
 * 而刻度圈在**大气侧**，所以它不在烘烤里、也不放气。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 问题四：互测的数学 —— 两组数怎么解出绝对值，线性度要多少
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 四个构型，**同一个探测器、同一个光阑、同一个 2θ 臂**：
 *
 *   I₀   样品平移出束（不是拆掉 —— 平移 50 mm），探测器臂转到 0°   直射
 *   I₁   M₁ 单独在 6°                                             R₁
 *   I₂   M₂ 单独在 6°                                             R₂
 *   I₁₂  M₁、M₂ 串联（一次入射、两次反射）                          R₁R₂
 *
 * 令 A = I₁/I₀、B = I₂/I₀、C = I₁₂/I₀、D = I₁/I₂，则
 *
 *   C = R₁R₂， D = R₁/R₂
 *   **R₁ = √(C·D)， R₂ = √(C/D)**
 *   δR/R = ½·√((δC/C)² + (δD/D)²)      ← 两组数各出一半，谁也不占便宜
 *
 * 这就是"不需要绝对标准"的全部内容：**探测器的绝对响应、金黑的吸收率、
 * 立体角、光阑的孔径、衰减片 —— 在 C 与 D 里都是同一个因子，一起消掉。**
 * 唯一不能被消掉的是**非线性**，因为四个构型的信号本来就不一样大：
 *
 *   I₀ : I₁ : I₁₂ = 1 : R : R²  =  1 : 0.6 : 0.36（R = 60 %）
 *   探测器 S(P) = P(1 − ε·P/P_max)，ε = 5 %：
 *     C_meas/C = (1 − εR²)/(1 − ε) ≈ 1 + ε(1 − R²) = 1 + 0.05 × 0.64 = +3.2 %
 *     D_meas/D = 1（A 与 B 在同一个信号高度上，**非线性自己消掉**）
 *     → δR/R = ½ × 3.2 % = **1.6 %**
 *
 * 所以 5 % 的非线性会把 R = 60 % 解成 60.0 % × (1 ± 1.6 %) = **59.0–61.0**。
 * 要求反过来写：要 δR ≤ 0.5 %，就要
 *
 *   ε ≤ 2 × 0.005 / (1 − R²) = 0.01/0.64 = **1.6 %**
 *
 * 本层的热电堆在温升 3 K 上只有 **0.3 %**（Seebeck 的 0.1 %/K），所以线性度不是
 * 瓶颈 —— 瓶颈是**读数**（3 位半 DVM 的 1 µV，在 0.33 mV 上是 0.3 %/次，
 * 十次平均 0.1 %）与**本底漂移**（300 K 壁的 3.6 mW 本底，0.02 K 漂移就是 1 µW，
 * 在 1 mW 信号上是 0.1 %/30 s —— 所以四个构型必须**交替**测，不能一口气测完再换）。
 *
 * 误差预算（R = 60 %）：
 *   线性度 0.3 %（→ δR = 0.32 × ε）        → 0.10 %
 *   读数 0.3 %/次 × 10 次平均                → 0.10 %
 *   本底漂移 0.1 %/30 s（交替测量后）        → 0.10 %
 *   装夹与面元重复性（0.1 mm、峰值 0.02°）   → 0.20 %
 *   ────────────────────────────────
 *   √(0.10² + 0.10² + 0.10² + 0.20²) = **0.26 %** → R = 60.0 % ± 0.16 个百分点
 *
 * （角度那一项在**峰顶**是 0 —— dR/dθ = 0 正是峰顶的意思；它只在掠入射的
 *  陡沿上才值 2 %/°，所以本仪器把峰顶角度写死，靠刻度圈而不是靠重复性。）
 *
 * 这就是本层的验收精度：**±0.3 %**，比 `std/euv-mirror-300` 那个窗口的半宽
 * （7.5 个百分点，即 ±12.5 %）细 **50 倍**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 第二条路：粗糙度计量标准 → TIS → 反射率上限（它不测 R，只测 R 的天花板）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 散射把反射率吃掉的部分是 TIS（总积分散射）：
 *
 *   TIS = (4πσ/λ)²     σ = 0.3 nm、λ = 13.5 nm → (0.279)² = **7.8 %**
 *                      σ = 0.5 nm（基底的抛光面）      → **21.7 %**
 *   R ≤ R_ideal × (1 − TIS) = 70 × 0.922 = **64.5 %**
 *
 * 工业上 σ 用 AFM 或白光干涉仪量到 0.01 nm。**本层两样都没有**：
 * 干涉仪读 15 nm（`plant/interferometer`，1/20 条纹）、比较仪 0.1 µm ——
 * 对 0.3 nm 差了 50–300 倍，连门槛都够不着。
 *
 * 退一步用可见光散射：TIS ∝ 1/λ²，所以
 *
 *   钠光 589 nm 上量 TIS，乘 (589/13.5)² = **1903** 就是 13.5 nm 的 TIS
 *   σ = 0.3 nm → TIS(589) = (4π × 0.3 / 589)² = **4.1×10⁻⁵ = −44 dB**
 *
 * 这条路**通，但只通到 ±50 %**，卡在照明而不是卡在探测器：
 *
 *   本层的照明是钠焰，不是激光（稳频单色仪 / He-Ne 本层没有，见
 *   `euv-mirror.ts` 问题四缺件②）。φ0.2 的孔 + 一块透镜，样品上约 **1 µW**。
 *   散射 = 4.1e-5 × 1 µW = **41 pW**；光电二极管 0.3 A/W → **12 pA**。
 *   而那只管子的暗电流 ~1 nA，又没有锁相放大器 —— 12 pA 是暗电流的 1.2 %，
 *   在漂移里晃。**所以 TIS(589) 只能到 ±50 %。**
 *
 * ±50 % 的 σ 过一遍平方关系就是 TIS(13.5) 的 −45 %/+125 %：
 *
 *   σ = 0.3 ± 0.15 nm → TIS(13.5) = 1.95 % … 17.6 % → **R ≤ 57.7 … 68.6 %**
 *
 * 也就是说这一条给的不是一个数，是一个**区间**：R 的天花板在 58–69 % 之间。
 * 它的价值在：互测如果给出 60.0 %，这个区间说"物理上说得通"；互测如果给出 68 %，
 * 那一定哪里错了。**它不能替代互测，但没有它，互测的数没有人能反驳。**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 降级点（按严重程度）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  1. **没有光。** 这是第一条、也是唯一真正堵住的一条：DPP 头造得出来，
 *     1 kV / 10 kA 的脉冲电源没有；LPP 那条的 30 W CO₂ 激光按工业 1.25 %
 *     的转换效率折算，在 IF 处只有约 0.1 W（要 ≥ 0.1 mW 就能测，够），
 *     可它卡在 10.6 µm 窗口与电源上。**仪器造完只是把问题指回光源。**
 *  2. **金黑的吸收率 95 % 而不是 99 %。** 蒸镀只到 1–10 Pa 的氩，
 *     颗粒长得密。这不是致命的（比值里消得掉），致命的是它**不能烘 150 °C**——
 *     于是腔体的 150 °C 烘烤与探测器不能同批做，多了一次 60 °C 的轻烘，
 *     放气也就多一遍。
 *  3. **没有 13.5 nm 的滤光片，也没有单色器。** 带外光（DPP 的可见/紫外/EUV 连续谱）
 *     一起进探测器，靠角扫描减本底与"同一探测器"消因子来压。**这条在只测一个角度
 *     时就不成立** —— 所以本仪器的产物是**一条曲线**，不是一个数。
 *  4. **金黑 + 热电堆的时间常数 1 s，不能斩波。** 只能用光闸做慢速通断 + 交替测量
 *     （30 s 开 / 30 s 关 × 10 轮 = 10 min 一个构型，四个构型交替 = 40 min 一个角度点），
 *     靠这 120 轮把 1/f 与漂移压到 0.1 %。代价是**一个角度点 40 min**，12 点 8 h。
 *  5. **只能测中心一个点。** 样品台只有 50 mm 的平移（为了把样品移出束测 I₀），
 *     没有 X/Y 扫描台 —— 所以 φ300 镜子的**面内均匀性测不了**。
 *     镀膜的 ±1 % 分布（`make/euv-mirror-300` 降级点第 2 条）仍只能靠工艺保证。
 *  6. **角度只到 0–30°。** 掠入射（71°）要另一套臂与另一块膜；
 *     这块仪器按 6° 近正入射设计，掠角那一档在本层没有对应的镜子。
 *  7. **粗糙度只能到 ±50 %。** AFM 没有、干涉仪 15 nm（差 50 倍）、
 *     可见光散射的照明只有钠焰的 1 µW（散射 41 pW → 12 pA 对 1 nA 暗电流），
 *     所以 TIS 那条给的是区间（σ = 0.3 ± 0.15 nm → R ≤ 58–69 %），
 *     而**σ 的锚点在工艺里**（磨料粒径 / 10），不在测量里。
 *  8. **碳氢分压测不了**（同一处缺口：本层没有质谱、
 *     没有残余气体分析）。1e-8 Pa 这个数是按抽气时间与泵电流反推的，
 *     碳层厚度只能事后从"反射率掉了多少"看回来 —— **那是环咬自己的另一面**：
 *     用反射率的变化去校准污染，又用污染去解释反射率的变化。
 *  9. **衰减片与孔径的绝对值不知道，也不需要知道。** 光阑 φ0.2 mm 的孔径误差
 *     ±5 %、金黑对入射角的敏感 2 %/° —— 这些在 R₁R₂ 与 R₁/R₂ 里都消掉，
 *     代价是**这条仪器永远给不出"绝对辐照功率"**，只能给比值。它是一台
 *     反射率计，不是一台辐射计。
 * 10. **互测要求两块镜子的几何完全一致**：同一个 6°、同一个 2θ 臂、同一个光阑。
 *     两台镜子的厚度差 0.05 mm、装夹面的平面度 0.01 mm 都会让第二块镜子
 *     的入射点偏 0.1 mm —— 而斑只有 φ0.2 mm。所以两镜必须**同一炉镀、同一批装夹**，
 *     否则测出来的 R₁R₂ 与 R₁/R₂ 不是同一对镜子。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、零件（八件）
//
// 一台测角反射计的八个零件，每一个都对应上面四个问题里的一处数：
//
//   chamber            问题三：1e-5 Pa + 150 °C 烘烤
//   feedthrough        问题二/三：真空中不能抹油，刻度圈在大气侧
//   goniometer         问题二：0.015° 的刻度圈
//   sample-stage       问题四：把样品平移出束测 I₀，重复性 0.1 mm
//   aperture           问题四：光束的定义者（φ0.2 mm）
//   shutter            问题四：慢速通断，1 s 的热时间常数斩不了波
//   detector           问题一：金黑 + 25 对铜-铁热电堆
//   roughness-standard 第二条路：TIS 的工艺基准
// ═══════════════════════════════════════════════════════════════════════════

export const EUV_REFL_ITEMS: readonly Item[] = [
  /**
   * 真空腔。φ600 × 900、8 mm 碳钢板四瓣折弯焊成筒（与 `make/euv-source-vessel`
   * 同一门手艺、同一条账：2.26 m² × 0.008 × 7 850 = 142 kg），两端 CF 法兰用
   * **无氧铜垫**密封（PTFE 260 °C 就软，要烘 150 °C 的只能铜垫），φ100 熔石英观察窗，
   * 外壁水冷夹套 + 烘烤加热带。
   *
   * 为什么是 φ600：里面要装**两块** φ300 × 20 的镜子（互测的串联构型）+
   * 60 mm 的 2θ 臂。φ600 是两块 300 mm 镜子能并排摆下的最小筒径。
   *
   * 为什么 8 mm 钢板而不是更薄：烘到 150 °C 再降到 20 °C，0.9 m 长的筒
   * 按 α = 12e-6/K 缩 0.9 × 12e-6 × 130 = **1.4 mm** —— 薄壁会失稳（鼓包），
   * 而鼓包会让光阑与 2θ 臂的相对位置动 0.1 mm 以上。这一条比强度更硬。
   */
  {
    id: 'plant/euv-reflectometer/chamber',
    name: 'Vacuum Chamber', name_zh: '真空腔',
    unit: '件',
    category: 'part',
    props: [
      { param: 'leakRate', kind: 'range', min: 0, max: 1, unit: 'Pa·L/s', dir: 'atMost' },
      { param: 'bakeTemperature', kind: 'range', min: 0, max: 400, unit: '°C', dir: 'atLeast' },
    ],
  },

  /**
   * 波纹管旋转馈通。θ 与 2θ 两根轴各一只：0.1 mm 钢板液压成 20 折的波纹管，
   * 里面穿一根 45 钢轴，**±15° 的摆动全靠波纹管自己弯**。
   *
   * 为什么不是 O 形圈转轴：真空中不能抹油脂（本层没有真空脂，也没有 MoS₂），
   * 钢对钢干摩擦在 1e-5 Pa 里会**冷焊**，转两次就咬死。波纹管是唯一不要润滑的
   * 转动密封 —— 代价是行程只有 ±15°，而且每弯一次都是一次疲劳。
   *
   * 20 折 × 0.1 mm **低碳钢板**（波纹管该用 304/316，而 `mat/stainless-steel`
   * 不在本文件的投料白名单里 —— 冷轧低碳钢的疲劳寿命只有不锈钢的 1/3）：
   * 约 10⁴–10⁵ 次全行程。一次测量 12 个角度点 × 4 个构型 ≈ 100 次
   * → **100–1000 次测量后换一只**。它不在 `composedOf` 的磨损里单列，
   * 因为它的寿命取决于扫描方案，不是一个定死的数。
   *
   * 它同时解决了问题三的那条：**刻度圈装在大气侧**，既不烘、也不放气。
   *
   * 行程按 **±15°（窗口 0–30°）** 记，不是 0–90°：90° 那一档要用 O 形圈转轴，
   * 而本层没有真空脂，钢对钢干摩擦在 1e-5 Pa 里会冷焊。
   * 漏率 **≤1e-6 Pa·L/s**（=1e-9 Pa·m³/s，氦检漏档）：腔要 1e-5 Pa，
   * 1 Pa·L/s 的焊口抽不住；1 Pa·L/s = 10 mbar·L/s 是粗密封的量级。
   */
  {
    id: 'plant/euv-reflectometer/feedthrough',
    name: 'Bellows Rotary Feedthrough', name_zh: '波纹管旋转馈通',
    unit: '件',
    category: 'part',
    props: [
      { param: 'angleRange', kind: 'range', min: 0, max: 30, unit: '°', dir: 'atLeast' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-6, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /**
   * 测角台。θ 轴 90:1 蜗轮蜗杆 + 2θ 臂，两根轴都从波纹管馈通引到大气侧，
   * 刻度圈（玻璃 φ200、刻 0–90°、0.015° 一格）装在大气侧。
   *
   * 三处手艺都是现成的：
   *   蜗轮    滚齿机滚 90:1（`plant/gear-hobbing`）
   *   刻度圈  玻璃涂蜡 → 车床丝杠带分度头刻线 → **填石墨粉**（不轻蚀 ——
   *           轻蚀要氢氟酸，而酸不在本文件的白名单里；石墨填线反而对比度更高）
   *   检验    对着 `plant/refractometer` 的分度盘读（本层唯一的角度基准，
   *           1″ 读数的同一门手艺）
   *
   * 三处误差合成（与 `unblock-refractometer-circle.ts` 同一张表）：
   *   刻度圈 0.015° ⊗ 蜗杆空回 0.01° ⊗ 热漂 0.005° → **0.02°**
   * 而问题二要求 0.05° 一档 —— 够 2.5 倍。
   */
  {
    id: 'plant/euv-reflectometer/goniometer',
    name: 'Goniometer Stage', name_zh: '测角台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'angleError', kind: 'range', min: 0, max: 0.02, unit: '°', dir: 'atMost' },
      { param: 'resolution', kind: 'range', min: 0, max: 0.015, unit: '°', dir: 'atMost' },
    ],
  },

  /**
   * 样品台。φ320 三点支承（三个 φ10 淬硬球，磨到同一高度 ±1 µm）+ 俯仰微调
   * + **50 mm 的平移**（把样品移出光束去测 I₀）。
   *
   * 平移这一件是它存在的理由：测 I₀ 不能把样品**拆下来** —— 拆了就得重装，
   * 重装的重复性直接进 R₁R₂ 的分母。平移出束则样品一直在同一组支承上，
   * 回来时只要撞同一只限位块。**0.1 mm 的重复性 = 光斑只挪半个斑。**
   *
   * ⚠️ 它没有 X/Y 扫描台（降级点第 5 条）：φ300 镜子的面内均匀性测不了，
   * 只能测光斑落的那一点。
   */
  {
    id: 'plant/euv-reflectometer/sample-stage',
    name: 'Sample Stage', name_zh: '样品台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'positionError', kind: 'range', min: 0, max: 0.1, unit: 'mm', dir: 'atMost' },
      { param: 'tiltRange', kind: 'range', min: 0, max: 90, unit: '°', dir: 'atLeast' },
    ],
  },

  /**
   * 入射光阑。0.1 mm 厚的无氧铜片上钻 φ0.2 mm 的孔，后面一串 φ2/φ5 的挡光板
   * 与一只碳光阱（挡零级与镜面反射之外的杂光）。
   *
   * φ0.2 mm 是**本层机械加工的下限**（`euv-source.ts` 问题三：钻/磨的最小孔
   * 就是 φ0.2）—— 所以孔径误差按 ±5 % 记，而**这 ±5 % 在比值里消掉**（降级点第 9）。
   *
   * 厚度 0.1 mm 也是数：孔壁厚 h 在入射角 θ 上切掉的立体角 ≈ h·tanθ/d。
   * 0.1 mm × tan 6° = 10 µm，对 φ200 µm 的孔是 5 % —— 而 1 mm 厚就是 50 %。
   * 这就是为什么它是**一片薄铜**，不是一块厚板。
   */
  {
    id: 'plant/euv-reflectometer/aperture',
    name: 'Entrance Aperture', name_zh: '入射光阑',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 0.01, max: 5, unit: 'mm' },
      { param: 'thickness', kind: 'range', min: 0, max: 1, unit: 'mm', dir: 'atMost' },
    ],
  },

  /**
   * 光闸。φ60 铜板 + 一根从波纹管引出的推杆，5 s 内开合，挡住入射光。
   *
   * 为什么不是斩波器：探测器的热时间常数 1 s（问题一），斩波频率必须 ≤ 1/(2π·1) ≈
   * 0.16 Hz 才跟得上，而 0.16 Hz 的机械斩波（周期 6 s）已经不比"手开手关"快多少。
   * 所以本层不做斩波器，做**光闸 + 交替测量**（降级点第 4 条）：
   * 一个构型开 30 s、关 30 s × 10 轮，取差值；四个构型交替着来。
   *
   * 铜板 0.5 mm：13.5 nm 在铜里的穿透深度 20 nm，0.5 mm 是它的 2.5 万倍，
   * 挡得住；而它对可见光也是不透的（铜对 500 nm 的吸收长度 30 nm），
   * 所以关的时候探测器的本底只剩 300 K 壁的辐射（3.6 mW）。
   */
  {
    id: 'plant/euv-reflectometer/shutter',
    name: 'Optical Shutter', name_zh: '光闸',
    unit: '件',
    category: 'part',
    props: [
      { param: 'responseTime', kind: 'range', min: 0, max: 100, unit: 's', dir: 'atMost' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /**
   * 探测器。金黑吸收腔（3 × 3 mm）+ 25 对铜-铁热电堆 + 20 °C 水冷环。
   *
   * 四个数就是问题一的答案，一条一条都能算：
   *
   *   absorptance   95 %   金黑在 1–10 Pa 氩里蒸出来（工业 100–300 Pa 是 99 %）
   *   responsivity  0.33 V/W   25 对 × 13 µV/K = 0.33 mV/K，÷ G = 1 mW/K
   *   nep           3e-8 W/√Hz   Johnson 2.9 nV/√Hz ÷ 0.33 V/W × 3（1/f 与放大器）
   *   timeConstant  1 s     C/G = 1 mJ/K ÷ 1 mW/K
   *
   * 吸收腔做成**锥形**而不是平板：锥形把入射光困在里面反射 3–5 次，
   * 每次 95 % → 总体 99.999 %；平板只有 95 %，而 5 % 的反射会打到腔壁上再回来。
   * 金黑只蒸在锥的内壁上（0.1 g 的金就够 4 只锥）。
   *
   * ⚠️ 不能烘 150 °C（金黑 60–70 °C 烧结成镜面，吸收率掉到 60 %）——
   * 这是降级点第 2 条，也是烘烤要拆两次的原因。
   */
  {
    id: 'plant/euv-reflectometer/detector',
    name: 'Detector', name_zh: '探测器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'absorptance', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'responsivity', kind: 'range', min: 0, max: 100, unit: 'V/W', dir: 'atLeast' },
      { param: 'nep', kind: 'range', min: 0, max: 1e-4, unit: 'W/√Hz', dir: 'atMost' },
      { param: 'timeConstant', kind: 'range', min: 0, max: 100, unit: 's', dir: 'atMost' },
    ],
  },

  /**
   * 粗糙度计量标准。四片 φ20 × 5 的熔石英试片，用分级磨料磨出**四档**粗糙度
   * （5 / 3 / 1 / 0.5 µm 的尾矿粉 —— 按"磨料粒径的 1/10"给 σ，是工艺标准，
   * 不是量出来的），每一档的 TIS 与反射率上限由 `measure/euv-mirror-tis` 那条
   * 路线的算式给出。
   *
   * 它是本层的**计量标准**里最诚实的一件：一个标准必须"已知"，
   * 而本层没有任何一台能读 0.3 nm 的仪器（AFM 没有、干涉仪 15 nm、
   * 可见光散射只到 ±50 % —— 见问题三之后那一段）。所以这个"标准"的已知性
   * **来自工艺，不来自测量**：磨料粒径是分级的、可称的、可复现的，
   * 而 σ = 粒径/10 是一条工艺关系，不是一条物理判据。
   *
   * 三个属性一起给，因为它们是一条链：
   *   roughness 0.3 nm → tis (4πσ/λ)² = 7.8 % → reflectivityCeiling 70 × 0.922 = 64.5 %
   * 换一档（σ = 0.5）就是 21.7 % 与 54.8 % —— 四片试片正好把这条曲线钉住四段。
   */
  {
    id: 'plant/euv-reflectometer/roughness-standard',
    name: 'Roughness Metrology Standard', name_zh: '粗糙度计量标准',
    unit: '套',
    category: 'part',
    props: [
      { param: 'roughness', kind: 'range', min: 0, max: 5, unit: 'nm', dir: 'atMost' },
      { param: 'tis', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atMost' },
      { param: 'reflectivityCeiling', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atMost' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 二、仪器本体
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * 13.5 nm 测角反射率计。**没有产出路线** —— 与 `plant/euv-source`、
   * `plant/euv-vacuum` 同一个处理：零件一件件造得出来（八条路线在下面），
   * 而**整机没有装配路线**。第一次整装只能运来，本层保证的是"拆得开"与
   * "坏哪一件、补哪一件"；而**它量的那束光不存在**（降级点第 1 条）。
   *
   * 它 `holds` 20–150 °C：腔体的加热带能维持烘烤温度，而 150 °C 的上限
   * **就是金黑烧结的那条线**（探测器装进去之后只能到 60 °C，那一段写在
   * `measure/euv-mirror-mutual` 的第二步里）。真空不由它 hold —— 由
   * `plant/euv-vacuum` 那套机组，它只提供腔体。
   *
   * 三个属性是整机的验收指标，不是零件的：
   *   angleError          0.02°   刻度圈 0.015° ⊗ 空回 ⊗ 热漂
   *   reflectivityAccuracy 0.3 %  问题四的误差预算合成（0.26 %，取 0.3）
   *   bakeTemperature     150 °C  烘烤与除气的上限（金黑之前）
   */
  {
    id: 'plant/euv-reflectometer',
    name: '13.5 nm Goniometric Reflectometer', name_zh: '13.5 nm 测角反射率计',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 20, max: 150 },
      // EUV 反射率必须在真空里测：13.5 nm 在空气里被吸收，样品腔抽到 1e-6–1e-3 Pa。
      { param: 'pressure', min: 1e-6, max: 1e-3 },
    ],
    props: [
      { param: 'angleError', kind: 'range', min: 0, max: 0.05, unit: '°', dir: 'atMost' },
      { param: 'reflectivity', kind: 'range', min: 0, max: 100, unit: '%' },
      { param: 'reflectivityAccuracy', kind: 'range', min: 0, max: 0.3, unit: '%', dir: 'atMost' },
      { param: 'bakeTemperature', kind: 'range', min: 100, max: 150, unit: '°C', dir: 'atLeast' },
    ],
    composedOf: [
      { item: 'plant/euv-reflectometer/chamber', qty: q(1) },
      { item: 'plant/euv-reflectometer/feedthrough', qty: q(2) },
      { item: 'plant/euv-reflectometer/goniometer', qty: q(1) },
      { item: 'plant/euv-reflectometer/sample-stage', qty: q(1) },
      { item: 'plant/euv-reflectometer/aperture', qty: q(1) },
      {
        item: 'plant/euv-reflectometer/shutter',
        qty: q(1),
        // 推杆每开合一次，波纹管弯一次：10⁵ 次的量级，一次测量 10 轮 × 4 构型 × 12 点 = 480 次。
        wear: { amount: q(1), per: q(20000) },
      },
      { item: 'plant/euv-reflectometer/detector', qty: q(2) },
      { item: 'plant/euv-reflectometer/roughness-standard', qty: q(1) },
      // 可见光探测器：对准时看 DPP 的辉光，TIS 那条看 589 nm 的旁瓣。
      // 为什么非要它：金黑热电堆在 589 nm 上 41 pW 只有 13 nV，而它自己的 NEP
      // 是 3e-8 W —— 差 1000 倍，什么都看不见；而光电二极管 0.3 A/W 给 12 pA，
      // 在 1 nA 的暗电流上还留得住一个数。**同一台仪器里两个探测器，各看各的波长。**
      { item: 'std/photodiode-general', qty: q(1) },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 三、零件路线（八条）+ 两条测量路线
// ═══════════════════════════════════════════════════════════════════════════

export const EUV_REFL_ROUTES: readonly Route[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 3.1 真空腔
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 真空腔。四瓣折弯 → 卷圆 → 焊筒体与水冷夹套 → 车 CF 法兰与铜垫槽
     * → 装石英窗 → 水压试验 + 涂酒精查漏。
     *
     *   钢板 160 kg（2.26 m² × 8 mm × 7 850 = 142，加法兰接管 18）
     *   铜 4 kg（两端铜垫 + 水冷套铜管）  石英 1 kg（φ100 观察窗）
     *   水 30 kg（试压与冷却，不进成品）
     *
     * 漏率 1e-4 Pa·L/s 是焊缝能达到的量级 —— 而它不是本腔的下限：
     * 泵（`plant/euv-vacuum`）决定 1e-5 Pa，漏率在这个压力下只贡献 5e-7 Pa。
     * 所以这道工序真正的判据是**烘烤后的压升**，不是保压法。
     */
    id: 'make/euv-reflectometer-chamber',
    name: 'Vacuum Chamber Manufacturing', name_zh: '真空腔制造',
    produces: [
      {
        item: 'plant/euv-reflectometer/chamber',
        qty: q(1),
        gives: [
          { param: 'leakRate', kind: 'range', min: 0, max: 1e-4 },
          { param: 'bakeTemperature', kind: 'range', min: 150, max: 300 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(160) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(4) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(30) }] },
    ],
    needs: [],
    rate: { hours: q(60) },
    unbalanced_zh:
      '钢板 160 + 铜 4 + 石英 1 + 水 30 → 腔体 1 件；余是边角料、焊材与试压水（产出按件计，质量账只记在这一行）',
    steps: [
      { note_zh: '四瓣折弯、卷圆、焊筒体与 4 条纵缝（没有卷板机，见 euv-source 缺口 ④）', performedBy: 'plant/sheet-shop' },
      { note_zh: '焊水冷夹套与烘烤加热带的卡箍座', performedBy: 'plant/sheet-shop' },
      { note_zh: '车两端 CF 法兰与铜垫密封槽（平面度 0.02、Ra 0.8）', performedBy: 'lathe' },
      { note_zh: '装 φ100 石英窗与接管，水压 0.2 MPa 保 30 min，涂酒精查气泡', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * 波纹管旋转馈通。0.1 mm 钢板液压成形（内压 8 MPa，20 折）
     * → 焊两端法兰 → 车轴与限位块 → 装、检漏到 1e-7 Pa·L/s。
     *
     *   钢板 0.5 kg（波纹管坯 φ60 × 100，展开 0.03 m² × 0.1 mm）
     *   45 钢 3 kg（轴与法兰，实际留下 1.2）  铜 0.1 kg（铜垫）  水 3 kg（成形液）
     *
     * 液压成形的模具是一对半圆模，`plant/press` 100 t 够（8 MPa 内压 × 波纹管
     * 内投影面积 2.8e-3 m² = 22 kN 的胀形力，模具只受这个的 1/5）。
     *
     * 检漏 1e-7 比腔体的 1e-4 严三个量级 —— 因为波纹管是**会动的焊缝**，
     * 弯 10⁵ 次之后针孔最先出现在波峰内侧。
     */
    id: 'make/euv-reflectometer-feedthrough',
    name: 'Bellows Rotary Feedthrough Manufacturing', name_zh: '波纹管旋转馈通制造',
    produces: [
      {
        item: 'plant/euv-reflectometer/feedthrough',
        qty: q(1),
        gives: [
          { param: 'angleRange', kind: 'range', min: 15, max: 30 },
          { param: 'leakRate', kind: 'range', min: 0, max: 1e-7 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(3) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(3) }] },
    ],
    needs: [],
    rate: { hours: q(24) },
    unbalanced_zh:
      '钢板 0.5 + 45 钢 3 + 铜 0.1 + 水 3 → 馈通 1 件；45 钢车掉 1.8 kg 是轴与法兰的余量',
    steps: [
      { note_zh: '液压成形波纹管：8 MPa 内压，20 折，波高 4 mm（模具一对半圆模）', performedBy: 'plant/press' },
      { note_zh: '焊两端法兰与内套管（连续焊，波峰不许有焊缝）', performedBy: 'plant/sheet-shop' },
      { note_zh: '车轴、限位块与 ±15° 的机械止挡', performedBy: 'lathe' },
      { note_zh: '装铜垫、检漏到 1e-7 Pa·L/s（保压法，涂酒精看气泡判粗漏）', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * 测角台。浇 HT250 基座 → 车蜗杆与两根轴 → 滚 90:1 蜗轮 → 磨基座面与轴颈
     * → 刻刻度圈、对零。
     *
     *   铸铁 25 kg（基座，壁厚 12，去应力时效）  45 钢 8 kg（蜗杆、蜗轮、轴）
     *   玻璃 0.3 kg（φ200 × 4 刻度圈）  铜 0.5 kg（压圈与轴套）  水 5 kg（磨削液）
     *
     * 刻度圈不用氢氟酸轻蚀（酸不在白名单里）：**刻线后填石墨粉**，再擦去表面浮粉。
     * 石墨在刻槽里留得住，对比度比轻蚀高，代价是怕擦 —— 所以刻度圈装在大气侧、
     * 外面加一片玻璃罩。
     *
     * 对零与检验对着 `plant/refractometer` 的分度盘读：本层唯一的角度基准是那台
     * 折射计的 1″ 分度盘（`unblock-refractometer-circle.ts`），除此之外没有
     * 角度标准（量块给的是长度，正弦尺要 250 mm 的基座 —— 那反而是另一条路）。
     */
    id: 'make/euv-reflectometer-goniometer',
    name: 'Goniometer Stage Manufacturing', name_zh: '测角台制造',
    produces: [
      {
        item: 'plant/euv-reflectometer/goniometer',
        qty: q(1),
        gives: [
          { param: 'angleError', kind: 'range', min: 0, max: 0.02 },
          { param: 'resolution', kind: 'range', min: 0, max: 0.015 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(25) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(8) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/refractometer', 'plant/comparator', 'plant/metrology-room'],
    rate: { hours: q(80) },
    unbalanced_zh:
      '铸铁 25 + 45 钢 8 + 玻璃 0.3 + 铜 0.5 + 碳 0.02 + 水 5 → 测角台 1 件；余是浇冒口、车屑与磨削液',
    steps: [
      { note_zh: '浇 HT250 基座（壁厚 12，浇后自然时效 30 天去应力）', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1300, max: 1400 }] },
      { note_zh: '车蜗杆（模数 1.5、单头）与两根轴（φ30，轴颈 Ra 0.4）', performedBy: 'lathe' },
      { note_zh: '滚 90:1 蜗轮（齿面留 0.1 磨量）', performedBy: 'plant/gear-hobbing' },
      { note_zh: '磨基座结合面（0.01/300）与两根轴颈（圆度 1 µm）', performedBy: 'plant/grinder' },
      { note_zh: '刻刻度圈：玻璃涂蜡、车床分度刻 0.015° 线、填石墨粉、擦浮粉', performedBy: 'lathe' },
      { note_zh: '对零与检验：对着折射计的分度盘读 12 个位置，空回取正反两程之差', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * 样品台。浇 HT250 台体 → 铣三点支承面与 T 形槽 → 磨三个淬硬球到等高
     * → 装、测平移重复性。
     *
     *   铸铁 18 kg  45 钢 4 kg（三个 φ10 球 + 限位块 + 推杆）  铜 0.5 kg（滑板）
     *   水 3 kg（磨削液）
     *
     * 三个球是**等高 ±1 µm**（磨床一次装夹磨三个球窝）：三点支承的重复性
     * 全靠这一条，而不是靠限位块 —— 限位块管"回到原位"，球管"回到同一个姿态"。
     *
     * 平移 50 mm 用一条燕尾槽（铣出来，刮研配合），重复性 0.1 mm 靠一只
     * 弹簧压紧的限位块，不靠丝杠 —— 因为要的不是"走到哪"，是"每次都回同一处"。
     */
    id: 'make/euv-reflectometer-sample-stage',
    name: 'Sample Stage Manufacturing', name_zh: '样品台制造',
    produces: [
      {
        item: 'plant/euv-reflectometer/sample-stage',
        qty: q(1),
        gives: [
          { param: 'positionError', kind: 'range', min: 0, max: 0.1 },
          { param: 'tiltRange', kind: 'range', min: 8, max: 15 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(18) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(4) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(3) }] },
    ],
    needs: ['plant/comparator', 'plant/metrology-room'],
    rate: { hours: q(40) },
    unbalanced_zh:
      '铸铁 18 + 45 钢 4 + 铜 0.5 + 水 3 → 样品台 1 件；余是浇冒口、铣屑与磨削液',
    steps: [
      { note_zh: '浇 HT250 台体（时效 20 天）', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1300, max: 1400 }] },
      { note_zh: '铣三个球窝、T 形槽与燕尾槽（燕尾留 0.05 刮研量）', performedBy: 'plant/milling-machine' },
      { note_zh: '一次装夹磨三个球到等高 ±1 µm；刮研燕尾到 0.01 塞尺不进', performedBy: 'plant/grinder' },
      { note_zh: '装推杆与限位块，来回 50 次量重复性（比较仪 + 量块对零）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * 入射光阑。0.1 mm 无氧铜片钻 φ0.2 mm 孔 → 车挡光板 → 卷碳光阱 → 装架。
     *
     *   铜 0.1 kg   碳 0.05 kg（光阱的碳黑锥）   45 钢 0.2 kg（支架）
     *
     * φ0.2 mm 的孔是**钻出来再铰**的：0.18 的钻头打穿，0.2 的铰刀过一遍，
     * 孔径靠铰刀保证（±5 %）。钻头 0.18 mm 一根只钻 3–5 个孔就断，
     * 所以这一条路线的产出是**一只**光阑，废品率高到 50 %（记在 unbalanced 里）。
     *
     * 挡光板的作用不是挡光，是**挡掉孔壁的散射**：0.1 mm 厚的孔壁在 6° 上
     * 切掉 5 % 的立体角（问题二之后那段数），而它切掉的那部分光是斜着出去的，
     * 会打到 2θ 臂上。所以孔的出口做成 60° 的倒角（0.3 mm 深），
     * 让孔壁的散射往腔壁上打。
     */
    id: 'make/euv-reflectometer-aperture',
    name: 'Entrance Aperture Manufacturing', name_zh: '入射光阑制造',
    produces: [
      {
        item: 'plant/euv-reflectometer/aperture',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 0.18, max: 0.22 },
          { param: 'thickness', kind: 'range', min: 0, max: 0.1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 5) }] },
    ],
    needs: ['plant/comparator', 'plant/gauge-block', 'plant/metrology-room'],
    rate: { hours: q(16) },
    unbalanced_zh:
      '铜 0.1 + 碳 0.05 + 45 钢 0.2 → 光阑 1 件；余是 50 % 的钻孔废品与车屑',
    steps: [
      { note_zh: '钻 φ0.18 打穿（0.1 mm 铜片，每 3–5 孔断一根钻头），铰到 φ0.2 ± 0.01', performedBy: 'lathe' },
      { note_zh: '孔的出口车 60° 倒角 0.3 mm 深（让孔壁散射往腔壁上打）', performedBy: 'lathe' },
      { note_zh: '卷碳光阱：铜片上铺碳黑，卷成锥，尖端开 φ3 的孔', performedBy: 'plant/sheet-shop' },
      { note_zh: '装架与测孔径：塞规过/不过 + 比较仪量圆度；孔径只记 ±5 %，不追求绝对值', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * 光闸。0.5 mm 铜板剪成 φ60 圆片 → 焊到波纹管推杆上 → 装、测 5 s 开合
     * → 检漏 1e-7。
     *
     *   铜 0.2 kg   钢板 0.3 kg（波纹管段）   45 钢 0.2 kg（推杆与导向）
     *
     * 铜板 0.5 mm 挡得住 13.5 nm（穿透深度 20 nm 的 2.5 万倍），也挡得住可见光
     * （吸收长度 30 nm）—— 所以关闸时探测器只剩 300 K 壁的 3.6 mW 本底。
     * 这一条很重要：**本底的大小不重要，本底"关得住"才重要**（问题四的漂移项）。
     */
    id: 'make/euv-reflectometer-shutter',
    name: 'Optical Shutter Manufacturing', name_zh: '光闸制造',
    produces: [
      {
        item: 'plant/euv-reflectometer/shutter',
        qty: q(1),
        gives: [
          { param: 'responseTime', kind: 'range', min: 0, max: 5 },
          { param: 'leakRate', kind: 'range', min: 0, max: 1e-7 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: [],
    rate: { hours: q(12) },
    unbalanced_zh: '铜 0.2 + 钢板 0.3 + 45 钢 0.2 + 水 1 → 光闸 1 件；水是检漏与清洗用，不进成品',
    steps: [
      { note_zh: '剪 φ60 铜片、校平（0.05 mm），边缘去毛刺', performedBy: 'plant/sheet-shop' },
      { note_zh: '焊波纹管推杆与铜片（铜-钢异种焊，用铜垫过渡）', performedBy: 'plant/sheet-shop' },
      { note_zh: '车推杆与导向套（间隙 0.03，靠波纹管定心）', performedBy: 'lathe' },
      { note_zh: '装、测 5 s 开合 20 次无卡滞，检漏 1e-7 Pa·L/s', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * 探测器。金黑锥（1–10 Pa 氩里蒸金）→ 25 对铜-铁点焊成热电堆
     * → 装水冷环与绝缘座 → **电替代标定**。
     *
     *   金 1 g（金黑只蒸 0.1 g，其余是蒸镀的损耗 — 按 1 g 记，precious.ts 里
     *   金本来就是按 kg 计的电气材料）  铁 0.02 kg（25 条铁腿 0.1 mm 丝）
     *   铜线 0.02 kg（25 条铜腿 0.15 mm）  铜 2 kg（冷环与腔体）
     *   玻璃 0.1 kg（绝缘座）  耐火料 0.1 kg（绝缘子）  氩 0.05 kg（1–10 Pa 的蒸镀气）
     *
     * 为什么是"电替代"而不是"光替代"：本层没有任何已知功率的 13.5 nm 源 —— 
     * 那正是这台仪器要解决的问题。但**瓦特是可以绝对复现的**：在吸收体上贴一根
     * 已知电阻的细铜线，通一个已知电流，P = I²R。DVM 读电流在 1 kΩ 上的压降，
     * 就是 1e-5 的相对精度。**所以本层唯一能绝对标定的东西是"焦耳"，
     * 而"反射率"要靠比值 —— 这正好是互测法的前提。**
     *
     * 25 对点焊：0.1 mm 的铁丝与 0.15 mm 的铜线在氩弧下点焊（`plant/robot` 的
     * 焊枪），一对 10 s，25 对 4 min，但装夹与检验 6 h —— 时间花在"热电偶对"
     * 而不是"焊"。
     */
    id: 'make/euv-reflectometer-detector',
    name: 'Detector Manufacturing', name_zh: '探测器制造',
    produces: [
      {
        item: 'plant/euv-reflectometer/detector',
        qty: q(1),
        gives: [
          { param: 'absorptance', kind: 'range', min: 95, max: 99 },
          { param: 'responsivity', kind: 'range', min: 0.33, max: 0.6 },
          { param: 'nep', kind: 'range', min: 0, max: 3e-8 },
          { param: 'timeConstant', kind: 'range', min: 0, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/gold', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(40) },
    unbalanced_zh:
      '金 0.001 + 铁 0.02 + 铜线 0.02 + 铜 2 + 玻璃 0.1 + 耐火料 0.1 + 氩 0.05 + 水 5 → 探测器 1 件；金黑那 0.1 g 里 90 % 打在挡板上（蒸镀的几何损耗），铜与水是冷环与冷却',
    steps: [
      {
        note_zh: '蒸金黑：1–10 Pa 氩里蒸 0.1 g 金到锥内壁（工业 100–300 Pa，本层只到 10 Pa → 95 % 而非 99 %）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 1, max: 10 }],
      },
      { note_zh: '点焊 25 对铜-铁（铁 0.1 mm 丝、铜 0.15 mm 丝，氩弧，一对 10 s）', performedBy: 'plant/robot' },
      { note_zh: '装冷环（20 °C 水）、玻璃绝缘座与耐火绝缘子，25 对串联', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '测热导 G 与时间常数（通阶跃电流看上升曲线：τ = 1 s、G = 1 mW/K）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '电替代标定：1 kΩ 已知电阻通已知电流，P = I²R 对读数 → S = 0.33 V/W（唯一能绝对标定的一步）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * 粗糙度计量标准。四片 φ20 × 5 熔石英，用 5 / 3 / 1 / 0.5 µm 的水选尾矿粉
     * 分级研磨 → 手抛到镜面 → 589 nm 散射测量 → 算 TIS(13.5) 与 R 上限。
     *
     *   石英 0.4 kg（4 片 × 0.1）  尾矿 3 kg（四级磨料）  水 5 kg  碳 0.05 kg（光阱）
     *
     * **这条路线的 gives 是工艺保证，不是测出来的**（降级点第 7 条）：
     *   σ = 磨料粒径 / 10（5 µm 粉出 0.5 nm、0.5 µm 粉出 0.05 nm —— 而后者
     *   本层的手抛到不了，实际是 0.2–0.3 nm 的底）。
     * 589 nm 散射那一步只用来**分级**（四片谁比谁糙、谁比谁光），
     * 不用来定绝对值：TIS(589) = 4.1e-5（−44 dB），散射功率 41 pW，
     * 落到光电二极管上是 12 pA，而它的暗电流 ~1 nA —— **±50 %，只够分级**。
     *
     * 所以"计量标准"这个身份在本层是弱的：它能证明"这一片比那一片糙"，
     * 只能间接支撑"这一片是 0.3 nm"。文件头那条降级点就是为这句话写的。
     */
    id: 'make/euv-reflectometer-roughness-standard',
    name: 'Roughness Metrology Standard Manufacturing', name_zh: '粗糙度计量标准制造',
    produces: [
      {
        item: 'plant/euv-reflectometer/roughness-standard',
        qty: q(1),
        gives: [
          { param: 'roughness', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'tis', kind: 'range', min: 2, max: 21.7 },
          { param: 'reflectivityCeiling', kind: 'range', min: 54.8, max: 68.6 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(2, 5) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(3) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 20) }] },
    ],
    needs: ['plant/interferometer', 'plant/metrology-room'],
    rate: { hours: q(30) },
    unbalanced_zh:
      '石英 0.4 + 尾矿 3 + 水 5 + 碳 0.05 → 试片一套 4 片；余是磨料与磨削量（4 片 × φ20 × 5 只有 0.42 kg）',
    steps: [
      { note_zh: '切四片 φ20 × 5（同一块熔石英上取，同一批的 CTE 与抛光性）', performedBy: 'plant/grinder' },
      { note_zh: '分级研磨：5 / 3 / 1 / 0.5 µm 尾矿粉各一片，铸铁盘，末级往复 2 h', performedBy: 'plant/grinder' },
      { note_zh: '手抛到镜面（0.5 µm 粉 + 水，恒温间 19–21 °C）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '589 nm 散射分级：钠光准直、碳光阱挡镜面反射、光电二极管量旁瓣（±50 %，只够判"谁比谁糙"）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '算 TIS(13.5) = TIS(589) × 1903 与 R ≤ 70 × (1 − TIS)；σ 按磨料粒径/10 记，不按测量值', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3.2 双镜互测 —— 本层唯一能给出绝对反射率的一条
  // ─────────────────────────────────────────────────────────────────────────


  // ─────────────────────────────────────────────────────────────────────────
  // 3.3 第二条路：粗糙度 → TIS → 反射率上限
  // ─────────────────────────────────────────────────────────────────────────

];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...EUV_REFL_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/euv-reflectometer',
    name: '13.5 nm Goniometric Reflectometer Assembly', name_zh: '13.5 nm 测角反射率计装配',
    produces: [{
      item: 'plant/euv-reflectometer',
      qty: q(1),
      gives: [
      { param: 'angleError', kind: 'range', min: 0, max: 0.05, dir: 'atMost', record: 'mat/euv-reflectometer-cal-record' },
      { param: 'reflectivity', kind: 'range', min: 0, max: 100, record: 'mat/euv-reflectometer-cal-record' },
      { param: 'reflectivityAccuracy', kind: 'range', min: 0, max: 0.3, dir: 'atMost', record: 'mat/euv-reflectometer-cal-record' },
      { param: 'bakeTemperature', kind: 'range', min: 100, max: 150, dir: 'atLeast' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...EUV_REFL_ROUTES, ...ASSEMBLY_ROUTES];
