/**
 * 量子电压标准 —— 补缺口总表第 ⑭ 项：4 K 约瑟夫森电压标准。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、缺口：20 K 有，4 K 没有；差的是 10⁴ 倍，不是一句话
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `data/machine/voltage-anchor.ts` 把绝对电压钉到 **27–31 ppm**（10 V 档 31 ppm，
 *   0.5 V 档 68 ppm），靠的是电压天平：F = ε₀A_effV²/(2d²)，质量、长度、g 三个锚。
 *   `data/machine/voltage-anchor-2.ts` 另建可计算电容法到 90–160 ppm。
 *
 *   两条都是“约瑟夫森之前那一代”的做法。约瑟夫森结把电压钉在 **2e/h** 上：
 *
 *     V_n = n · f / K_J,      K_J = 2e/h = 483 597.8484 GHz/V（2019 SI 定义值）
 *
 *   1 V 的量子化台阶不是“更准一点的电压表”，是**定义**。它比 31 ppm 好 3 000 倍，
 *   因为它不再经过质量、长度、g、ε₀ 的传递链 —— 只经过频率。
 *
 *   本层原来三件都没有：
 *
 *     ① 4 K 冷源      只有 `plant/gm-cryocooler` 的 20 K；4 K 要再加一级 JT
 *     ② Nb/AlOₓ/Nb 结  0 条目；Nb 本身也 0 条目（grep `mat/niob` / `NbN` 全空）
 *     ③ 70–100 GHz 源  0 条目；本层最高 RF 是 13.56 MHz（`plant/rf-13m56`）
 *
 *   这一份把三件都建出来，并给出测量路线与记录。**不写“闭合”**：记录条目要
 *   真跑一条 `measure/josephson-array` 才是 L3；这里给的是设计窗口与路线。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、4 K：20 K 预冷 + JT 阀 + 逆流换热器（不是又一台 GM）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── ① 为什么 4 K 不能再靠 GM 的二级 ──────────────────────────────────────
 *
 *   GM 的二级是 **1.5–4 W @20 K**，靠排出器做气源；把它直接做到 4 K 要
 *   三级以上，而且 4 K 的排出器间隙、蓄冷器材料都换一代（铅球在 4 K 的比热
 *   掉到 10⁻³ J/cm³K 量级），不是本层能复制的东西。
 *
 *   4 K 的常规做法是 **JT 级**：20 K 的 GM 二级先把高压氦冷到 20 K，
 *   再经逆流换热器冷到 5–8 K，最后经 JT 阀节流到 0.1 MPa、4.2 K。
 *   JT 阀没有运动部件，4 K 那一段只有阀座、换热器与冷板 —— 这是本层能造的。
 *
 * ── ② 氦流量：按 4.2 K 的等温节流焓差算 ─────────────────────────────────
 *
 *   4.2 K 下，1.2–1.6 MPa 的氦与 0.1 MPa 的饱和液氦之间的等温焓差
 *   （含潜热与压缩功的净效应）取 **3–10 J/g**；换热器有效度 0.93–0.97。
 *
 *     Q = ṁ · Δh · ε
 *     0.1 W = ṁ · 3 J/g · 0.95   ⇒ ṁ ≈ 0.035 g/s
 *     0.5 W = ṁ · 10 J/g · 0.95  ⇒ ṁ ≈ 0.053 g/s
 *
 *   工程窗口取 **0.05–0.15 g/s**：上沿给 0.5 W 与换热器退化留余量，下沿
 *   保证 0.1 W 时仍有 2 倍。压比 = 1.2–1.6 MPa / 0.08–0.12 MPa = **12–18**。
 *
 * ── ③ 预冷需求：吃 GM 二级的 0.8–2.5 W ─────────────────────────────────
 *
 *   JT 级的 20 K 热负载不是 4 K 冷量本身，而是“高压氦从 20 K 冷到 5–8 K、
 *   回气又只能从 4.2 K 暖到 20 K”这个不平衡。按 0.05–0.15 g/s、氦 cp ≈ 5.2 J/gK、
 *   换热器端差 5–10 K 算：
 *
 *     Q_20K ≈ ṁ · cp · ΔT = 0.05–0.15 × 5.2 × (5–10) = **1.3–7.8 W**
 *
 *   上式是“没有回热”的上界。实际逆流换热器把回气的冷量还给高压侧，20 K 级
 *   只补差额，工程值 **0.8–2.5 W**。GM 二级 1.5–4 W 扣掉它，还剩 **0.5–1.5 W**
 *   给辐射屏与引线。这就是“与 `plant/gm-cryocooler` 衔接”的全部内容：
 *   **不是并联一台新冷源，是把 JT 级挂在它的二级冷台上。**
 *
 * ── ④ 效率：整机 0.2–0.5 % 卡诺 ────────────────────────────────────────
 *
 *   卡诺 COP（300 K → 4.2 K）= 4.2/(300−4.2) = **0.01417**。
 *
 *     0.1 W / (4.4 kW) = 2.3×10⁻⁵ → 0.16 % 卡诺
 *     0.5 W / (7.0 kW) = 7.1×10⁻⁵ → 0.50 % 卡诺
 *
 *   取 **0.2–0.5 % 卡诺**（整机，含 GM 4–6 kW + JT 压缩机 0.4–1.0 kW）。
 *   GM 预冷级本身是 0.8–1.5 % 卡诺（`cryo.ts` §二②）；4 K 级把它拉低，
 *   原因是 4 K 的卡诺 COP 只有 20 K 的 1/18.7（0.01417 / 0.2658）。
 *   这不是“效率差”，是温度每降一档，卡诺分母就翻一倍多。
 *
 * ── ⑤ 氦：R10 一次性装填，`mat/helium` 已建条目 ──────────────────────
 *
 *   GM 的 0.8–1.5 kg 是闭式循环的工作气体；JT 回路另需 **0.1–0.3 kg**，
 *   同样按 R10 的“必须从地球传递的非设备条目”一次性装填，量写在
 *   `make/jt-cooler` 的 `uses`；窗口仍记在 `heliumCharge` 上。条目存在、没有
 *   本地路线，缺料由 ONE_TIME 记录，不再藏在 props 里（与 `cryo.ts` §二① 同）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、Nb/NbN 结：先把 Nb 这条料补出来，再谈结
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── ① Nb 从哪来：风化层 20 ppm → 精矿 30 % Nb₂O₅ ──────────────────────
 *
 *   Nb 在地壳 20 ppm；火星风化层没有实测，按同一量级取 **20 ppm**（这是
 *   本文件唯一的“借地球值”，写在注释里，不写成实测）。铌铁矿/烧绿石型
 *   重矿物用重选 + 磁选富集到 **30 % Nb₂O₅**（Nb 20.96 %）：
 *
 *     1000 kg 精矿含 209.6 kg Nb；209.6 / 20×10⁻⁶ = **10 480 000 kg 风化层**
 *
 *   取 **10 500 000 kg**，尾砂 10 499 000 kg。富集比 10 500 : 1，是钨的
 *   1/49、钒的 1/53 —— 按 R1，数量不是约束；按 R7，这是一个可查的量级。
 *
 * ── ② 氧化物与粉：HF 溶解 → 氨沉淀 → 煅烧；KF 熔盐 → 钠热还原 ─────────
 *
 *   精矿 1000 kg（300 kg Nb₂O₅）+ HF 230 kg + 氨 170 kg + 水 3000 kg
 *   → **Nb₂O₅ 280 kg**（93 % 回收）。
 *
 *   Nb₂O₅ 1000 kg + HF 753 kg + Na 865 kg + KF 50 kg（循环补加）
 *   → **Nb 粉 660 kg**（95 % 收率；理论 699 kg）+ NaF 1580 kg + 水 339 kg。
 *
 *   反应（总式）：
 *
 *     Nb₂O₅ + 10 HF → 2 NbF₅ + 5 H₂O
 *     2 NbF₅ + 4 KF → 2 K₂NbF₇
 *     2 K₂NbF₇ + 10 Na → 2 Nb + 10 NaF + 4 KF
 *     ─────────────────────────────────────────────
 *     Nb₂O₅ + 10 HF + 10 Na → 2 Nb + 10 NaF + 5 H₂O
 *
 *   NaF 用硫酸回收 HF（2 NaF + H₂SO₄ → Na₂SO₄ + 2 HF），HF 循环；本文件
 *   不建 NaF 条目，账写在 `unbalanced_zh` 里。这是**钠热还原**，不是铝热：
 *   铝热给的是铌铁，做靶还要再熔一次；钠热直接给粉，正好给粉末冶金靶。
 *
 * ── ③ 靶：粉末冶金 1600–1800 °C 无压烧结，90–95 % 密度 ────────────────
 *
 *   φ150 × 6 mm 的 Nb 靶重约 **0.91 kg**（8.57 g/cm³ × 106 cm³）。用 2 kg 粉
 *   烧结 + 车磨到 1 kg，余 1 kg 是孔隙、车屑与磨削。**没有 HIP**：
 *   1500 °C / 150 MPa 的热等静压不在本层，所以密度只到 90–95 %，
 *   溅射时会掉颗粒、膜厚均匀性差 1–3 % —— 这是明写的降级，不是“已达到”。
 *
 *   Al 靶用 99.9 % 铝在电阻炉里熔铸（700–800 °C），再车到 φ150 × 6 mm；
 *   99.99 % 要区域熔炼，本层没有，所以 AlOₓ 的势垒缺陷密度比地球高
 *   一个量级（见 §五④）。
 *
 * ── ④ 结：Nb/AlOₓ/Nb，Jc 10–1000 A/cm²，Δ/e 1.4–1.5 mV ───────────────
 *
 *   三层膜在同一次真空循环里做完（原位氧化），这是结能均匀的**唯一**前提：
 *
 *     Nb 150 nm → Al 5–8 nm → O₂ 1–10 Pa 氧化 10–60 min → Nb 150 nm
 *
 *   Al 氧化成 AlOₓ 1–2 nm，剩下的 Al 4–6 nm 是 proximity 层。结面积
 *   1–100 µm²，Jc 10–1000 A/cm² ⇒ **Ic = Jc·A = 0.1 µA–1 mA**。
 *
 *   能隙：Nb 的 **Δ/e = 1.4–1.5 mV**，2Δ/e = **2.8–3.0 mV**。
 *   Ambegaokar–Baratoff：Ic·Rn ≈ (π/2)·(2Δ/e)·tanh(Δ/2kT) ≈ **3.5–4.5 mV**
 *   @4.2 K ⇒ **Rn = 3.5–4.5 mV / Ic = 35–2 200 Ω**（Ic 2–125 µA 的工作段）。
 *
 *   ⚠️ **一个必须当场纠正的数**：任务里写“每个结 ~1.4 mV，1 V 要 ~700 结”。
 *   1.4 mV 不是 75 GHz 的台阶电压，是 **Nb 的 Δ/e**；75 GHz 的单台阶是
 *
 *     V₁ = f / K_J = 75 / 483 597.8484 = **0.1551 mV**
 *
 *   1.4 mV 是 **9 个台阶**（9 × 0.1551 = 1.396 mV），1 V / 1.396 mV = **716 结**
 *   —— 这就是“~700 结”的来处。但约瑟夫森阵列工作在 **n = 1**（最多 n = 2），
 *   不取 n = 9：台阶越高，功率窗口越窄、平坦度越差，1×10⁻⁸ 的判据下不划算。
 *
 *   按 n = 1：
 *
 *     70 GHz：V₁ = 0.14475 mV，1 V 要 6 908 结，10 V 要 69 080 结
 *     100 GHz：V₁ = 0.20678 mV，1 V 要 4 836 结，10 V 要 48 360 结
 *
 *   ⇒ **1–10 V 要 4 836–69 080 结**；加分段冗余与首台余量，取
 *   **10 000–100 000 结**。任务给的结数范围是对的，1.4 mV / 700 结是
 *   n = 9 的算法 —— 两个数各自自洽，混在一起就错了 10 倍。
 *
 * ── ⑤ Ic 均匀性：1–5 %，靠三件事 ───────────────────────────────────────
 *
 *   ① Al 膜厚 5–8 nm 的片内均匀性 ≤3 %（自转 + 修形挡板）；
 *   ② AlOₓ 的氧分压 1–10 Pa、时间 10–60 min，片内 ±10 %；
 *   ③ 结面积由光刻 + 阳极氧化定，线宽 1 µm 对 2–5 µm 的结是 20–50 %？
 *
 *   —— 第③条是**首台的真实短板**：本层接触曝光机 1 µm、湿法/RIE 侧蚀
 *   0.3–0.8 µm，2 µm 以下的结面积误差会到 10–20 %，Ic 均匀性只能到
 *   **3–5 %**，不是 1 %。取窗口 **1–5 %**：1–3 % 是设计值，3–5 % 是首批
 *   交付值。要 1 % 得换 stepper（`plant/litho-m220` 那一档，见 `litho-m2.ts`）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、70–100 GHz：25 GHz Gunn ×3，不是直接做 75 GHz 的 Gunn
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   直接做 75 GHz 的 Gunn 二极管：有源层 0.5–1 µm、热流密度 10⁵ W/cm²，
 *   本层的 MOCVD 能长，但**没有 75 GHz 的腔体测量**（网络分析仪 0 条），
 *   调不出来。所以走**倍频链**：
 *
 *     25 GHz Gunn（GaAs n⁺nn⁺，50–200 mW）
 *       → 肖特基变容管三倍频（转换损耗 9–11 dB）
 *       → 75 GHz，1–10 mW
 *       → WR-10（75–110 GHz）或 WR-12（60–90 GHz）
 *
 *   20–30 GHz 基频 ×3 = 60–90 GHz；23.3–25 GHz ×4 = 93.3–100 GHz。
 *   两条合起来覆盖 **70–100 GHz**；首台交付 **72–78 GHz**（25 GHz ×3）。
 *
 *   频率稳定度分两档：
 *
 *     自由振荡（腔体 + 偏流）  1×10⁻⁵–1×10⁻⁶，石英时基 10 ppm 量级
 *     锁到氢脉泽 10 MHz        **设计** 1×10⁻¹²（1 s）；**实测** 1×10⁻⁹
 *                              （`atomic-clock.ts` §五⑤：没有相位噪声分析仪，
 *                              1×10⁻¹² 测不出来，只能测到 1×10⁻⁸–10⁻⁹）
 *
 *   约瑟夫森电压的不确定度直接吃频率：δV/V = δf/f。要 1×10⁻⁸，
 *   频率稳定度 ≤1×10⁻⁸；氢脉泽的**实测** 1×10⁻⁹ 只有 **10 倍**余量，
 *   **设计** 1×10⁻¹² 才有 10⁴ 倍。1×10⁻⁹ 那一档电压要相位噪声分析仪
 *   （0 条）；石英的 10⁻⁵ 差 1 000 倍，不能用。
 *
 *   功率：Gunn 80–150 mW，三倍频 9–11 dB 损耗后 8–19 mW，波导与法兰
 *   1–3 dB 后 **1–10 mW**。相位噪声 −95…−80 dBc/Hz @100 kHz；
 *   谐波抑制 25–35 dB。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、测量路线：把 27–31 ppm 换成 1×10⁻⁸
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `measure/josephson-array` 做五件事：
 *
 *     ① 70 000 结阵列装到 4.2 K 冷板上（`plant/jt-cooler`）；
 *     ② 75 GHz 源锁到氢脉泽，频率用计数器读；
 *     ③ 调微波功率，让阵列落在 **n = 1** 的 Shapiro 台阶上，台阶电压
 *        V₁ = f/K_J；70 000 结在 70 GHz 给 10.13 V、在 100 GHz 给 14.47 V，
 *        覆盖 1–10 V；
 *     ④ 用指零仪 + 10:1/100:1 分压与 `plant/hv-test-bench/standard-voltage-reference`
 *        逐档比对（1/2/5/10 V），正反向各 3 次；
 *     ⑤ 写 `mat/josephson-record`：电压、不确定度、结数、频率、4.2 K、
 *        anchor = josephson、method = shapiro-step。
 *
 *   误差预算（设计值，1σ）：
 *
 *     频率（氢脉泽 + 分配）        **实测** 1×10⁻⁹ / 设计 1×10⁻¹² → 对 V 同量级
 *     台阶数 n（整数）             0                   精确
 *     热电势（正反向抵消后）        1–10 nV / 1–10 V    1×10⁻⁹–1×10⁻⁹
 *     指零仪 + 分压比              1×10⁻⁹–1×10⁻⁸      主导项
 *     微波泄漏 / 非绝热效应         1×10⁻¹⁰–1×10⁻⁹
 *     ─────────────────────────────────────────────
 *     方和根                       **1×10⁻⁹–1×10⁻⁸**
 *
 *   阵列本身的量子准确度是 **1×10⁻¹⁰** 量级；交付记录 1×10⁻⁹–1×10⁻⁸
 *   是**比对链 + 频率实测**的账，不是结的账。1×10⁻⁸ 档靠实测 1×10⁻⁹
 *   的频率有 10 倍余量；1×10⁻⁹ 档要相位噪声分析仪，首台先交 1×10⁻⁸。
 *   把 31 ppm（3.1×10⁻⁵）换到 1×10⁻⁸，好 **2 700–3 100 倍**；这一步不是
 *   “改基准”，是**换锚**：
 *
 *     旧锚：长度 + 质量 + 时间 + ε₀（电压天平，31 ppm）
 *     新锚：频率 + 2e/h（约瑟夫森，1×10⁻⁸）
 *
 *   温度、质量、长度从“绝对锚”退成“修正项”。这就是 1990 年以后地球上
 *   发生的事，也是本层第一次有资格写“量子电压”。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、剩余缺口（带数字；R7：按量级记录，不作为终止条件）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **Nb 的 20 ppm 是借地球值。** 火星风化层没有 Nb 实测；若实际 5 ppm，
 *      土方量从 1.05×10⁷ kg 涨到 4.2×10⁷ kg（4 倍）。这是**知识缺口**，
 *      不是路线缺口；补它要一台 ICP-MS 与一套 Nb 标准（`trace-analysis.ts`
 *      的多元素标准里没有 Nb）。
 *   ② **Nb 靶密度 90–95 %，没有 HIP。** 要 99 % 得 1 500 °C / 150 MPa 热等静压；
 *      本层 `plant/hot-press` 只到 220 °C / 6 MPa —— 温度差 7 倍、压力差 25 倍。
 *      后果：溅射颗粒 10–100 个/片、膜厚均匀性 1–3 %，Ic 均匀性因此卡在 3–5 %。
 *   ③ **Al 99.9 %，没有 99.99 %。** 区域熔炼 0 条；AlOₓ 的势垒缺陷密度
 *      比地球高一个量级，1×10⁻⁸ 的漏电与 1/f 噪声会吃掉一部分台阶平坦度。
 *      要补：区域熔炼 + 洁净间 class 100（本层 clean-room 是 class 1000–10000）。
 *   ④ **光刻 1 µm，结面积 2 µm 以下做不准。** 1–2 µm² 的结面积误差 10–20 %，
 *      Ic 均匀性只能到 3–5 %；要 1 % 得 stepper（`plant/litho-m220`，
 *      0.25–0.5 µm）或电子束光刻（`plant/e-beam-column`，本层只到 100 nm 束斑）。
 *   ⑤ **没有 75 GHz 的网络分析仪。** 倍频器的转换损耗、波导驻波靠功率计与
 *      检波器外推，不是 S 参数实测；首台要留 2–3 dB 余量。
 *   ⑥ **氢脉泽的 1×10⁻¹² 是设计值，实测只有 1×10⁻⁸–10⁻⁹**（`atomic-clock.ts`
 *      §五⑤：没有相位噪声分析仪）。1×10⁻⁸ 的电压判据靠实测 1×10⁻⁹ 有
 *      10 倍余量；1×10⁻⁹ 那一档要相位噪声分析仪，本层 0 条。
 *   ⑦ **4 K 的冷量只有 0.1–0.5 W。** 70 000 结的阵列 + 引线 + 微波损耗
 *      约 0.05–0.2 W，够；但再加一个 10 V/100 mA 的偏置或第二套阵列就不够，
 *      要第二台 JT 或更大的 GM。这是**并联复制**的事，不是单台指标。
 *   ⑧ **没有量子霍尔。** 电阻的量子标准要 2DEG + 10 T + 0.3 K；本文件只补
 *      电压。电压与电阻两条量子锚都齐了，才谈“电学单位全量子化”。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、注册（本文件不改 tools/report/data.ts，由主 agent 注册）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { QUANTUM_VOLTAGE_ITEMS, QUANTUM_VOLTAGE_ROUTES }
 *     from '../../data/machine/quantum-voltage.ts';
 *   items  数组加 ...QUANTUM_VOLTAGE_ITEMS,
 *   routes 数组加 ...QUANTUM_VOLTAGE_ROUTES,
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const QUANTUM_VOLTAGE_ITEMS: readonly Item[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // A. Nb 链：精矿 → 氧化物 → 粉（结与靶的料）
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * **铌精矿：30 % Nb₂O₅（Nb 20.96 %），重选 + 磁选富集。**
   *
   * 风化层 Nb 20 ppm（借地球值，火星未实测）；1000 kg 精矿含 209.6 kg Nb，
   * 要 10 500 000 kg 风化层。尾砂 10 499 000 kg。
   *
   * 为什么是 30 % 而不是 60 %：铌铁矿精矿工业上能到 50–60 % Nb₂O₅，但
   * 那要磁选 + 摇床 + 浮选三段；本层只写重选 + 磁选，取 30 % 的中间档。
   * 富集比翻倍只改土方量，不改路线。
   */
  { id: 'mat/niobium-concentrate', name: '铌精矿', unit: 'kg', category: 'material' },

  /**
   * **五氧化二铌 Nb₂O₅：HF 溶解 → 氨沉淀 → 500–600 °C 煅烧。**
   *
   * 它是 Nb 粉与 Nb 靶的中间体。1000 kg 精矿（300 kg Nb₂O₅）→ 280 kg，
   * 93 % 回收；余是脉石、氟铌酸铵母液与洗水。
   */
  { id: 'mat/niobium-oxide', name: '五氧化二铌 Nb₂O₅', unit: 'kg', category: 'material' },

  /**
   * **铌粉：K₂NbF₇ 钠热还原，750–850 °C、氩保护。**
   *
   * 1000 kg Nb₂O₅ → 660 kg Nb 粉（95 % 收率；理论 699 kg）。
   * 粉的粒度 1–10 µm，直接给粉末冶金靶；不是铌铁，不需要二次熔炼。
   */
  { id: 'mat/niobium-powder', name: '铌粉', unit: 'kg', category: 'material' },

  /**
   * **阳极氧化电解液：5 % 五硼酸铵 + 乙二醇。**
   *
   * Nb 的阳极氧化标准电解液：NH₄B₅O₈·4H₂O 50 g/L 溶于乙二醇，
   * 20–40 °C、20–50 V，生成 50–100 nm 的 Nb₂O₅。它只用于结的侧壁绝缘
   * 与结面积修整，不参与 AlOₓ 势垒（势垒是干氧氧化）。
   */
  { id: 'mat/anodizing-electrolyte', name: '阳极氧化电解液', unit: 'kg', category: 'material' },

  // ═══════════════════════════════════════════════════════════════════════════
  // B. 4 K JT 级：四件 + 整机
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * **JT 压缩机头：0.4–1.0 kW、1.2–1.6 MPa、0.05–0.15 g/s 氦。**
   *
   * 不是 GM 那台 4–6 kW 的压缩机：JT 回路的流量只有它的 1/50，用大机
   * 会把 99 % 的功变成热。小排量、油润滑、带油气分离；氦侧漏率 ≤1×10⁻⁶ Pa·L/s。
   * 电机用 `std/motor-7.5kw-4p` 降频（额定 7.5 kW，实际轴功率 0.4–1.0 kW）。
   */
  {
    id: 'plant/jt-cooler/compressor',
    name: 'JT 压缩机头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 0.3, max: 1.2, unit: 'kW' },
      { param: 'pressure', kind: 'range', min: 1.0, max: 1.8, unit: 'MPa' },
      { param: 'flow', kind: 'range', min: 0.03, max: 0.25, unit: 'g/s' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-6, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /**
   * **JT 节流阀：针阀 + 蓝宝石阀座？不，本层没有蓝宝石 —— 316L 针 + PTFE 填料。**
   *
   * 4 K 那一段只有阀座与针，没有运动部件；阀杆从室温伸到 4 K，靠
   * 薄壁不锈钢管导热，漏热 20–50 mW。行程 0–3 mm，分辨 10 µm；
   * 流量 0.05–0.15 g/s，压差 1.2–1.6 MPa。
   *
   * PTFE 填料在**室温端**，不进入 4 K 区；4 K 端的密封是金属对金属
   * （针阀锥面），所以没有低温弹性体问题。
   */
  {
    id: 'plant/jt-cooler/jt-valve',
    name: 'JT 节流阀',
    unit: '件',
    category: 'part',
    props: [
      { param: 'pressure', kind: 'range', min: 0, max: 2, unit: 'MPa' },
      { param: 'flow', kind: 'range', min: 0.03, max: 0.25, unit: 'g/s' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-7, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /**
   * **逆流换热器：紫铜管套管 + 绕成螺旋，0.05–0.2 m²、0.5–2 W/K。**
   *
   * 高压氦走内管、低压回气走套管环隙，逆流。有效度 0.93–0.97 是
   * “能把 20 K 的高压气冷到 5–8 K”的全部；低于 0.93 时 JT 阀前温度
   * 每高 1 K，4 K 冷量掉 10–15 %。
   *
   * 为什么用铜不用不锈钢：铜的导热 400 W/mK，不锈钢 16；换热器要的是
   * 管壁导热，不是耐压 —— 1.6 MPa 的薄壁铜管（φ6 × 0.5）足够。
   */
  {
    id: 'plant/jt-cooler/hx',
    name: '4 K JT 制冷级逆流换热器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'effectiveness', kind: 'range', min: 0.9, max: 0.98, unit: '1' },
      { param: 'area', kind: 'range', min: 0.03, max: 0.3, unit: 'm²' },
      { param: 'conductance', kind: 'range', min: 0.3, max: 3, unit: 'W/K', dir: 'atLeast' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-7, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /**
   * **真空罩与辐射屏：316L 筒 3–10 L + 铝箔 10 层 + 玻璃纤维间隔。**
   *
   * 4 K 冷板对 300 K 的辐射负荷：σT⁴ = 459 W/m²；0.05 m² 的冷板
   * 不遮的话是 23 W —— 比 0.5 W 的冷量大 46 倍。10 层铝箔 + 玻璃纤维
   * 把有效发射率压到 0.01–0.02，辐射负荷 **0.2–0.5 W**，正好是 JT 级
   * 冷量的同一量级。
   */
  {
    id: 'plant/jt-cooler/vacuum-jacket',
    name: '4 K JT 制冷级真空罩与辐射屏',
    unit: '件',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 1, max: 20, unit: 'L' },
      { param: 'pressure', kind: 'range', min: 1e-6, max: 1e-2, unit: 'Pa' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-6, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /**
   * **4 K JT 制冷级：0.1–0.5 W @4.2 K，挂 `plant/gm-cryocooler` 二级。**
   *
   *   coolingPower  0.1–0.5 W @4.2 K
   *   heliumFlow    0.05–0.15 g/s
   *   pressureRatio 12–18（1.2–1.6 MPa / 0.08–0.12 MPa）
   *   precoolLoad   0.8–2.5 W @20 K（GM 二级 1.5–4 W，余 0.5–1.5 W）
   *   efficiency    0.2–0.5 % 卡诺（整机，300 K 排热）
   *   inputPower    4.4–7.0 kW（GM 4–6 + JT 0.4–1.0）
   *   cooldownTime  1–3 h（20 K 之后）
   *   stability     5–20 mK
   *   heliumCharge  0.1–0.3 kg（R10 一次性装填）
   *
   * `holds` 只写 3.8–4.5 K；20 K 由 `needs` 里的 GM 提供，不重复写。
   */
  {
    id: 'plant/jt-cooler',
    name: '4 K JT 制冷级',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'temperature', min: 3.8, max: 4.5 }],
    props: [
      { param: 'coolingPower', kind: 'range', min: 0.05, max: 0.6, unit: 'W', dir: 'atLeast' },
      { param: 'temperature', kind: 'range', min: 3.5, max: 5.0, unit: 'K' },
      { param: 'heliumFlow', kind: 'range', min: 0.03, max: 0.2, unit: 'g/s' },
      { param: 'pressureRatio', kind: 'range', min: 8, max: 22, unit: '1' },
      { param: 'precoolLoad', kind: 'range', min: 0.5, max: 3.0, unit: 'W', dir: 'atMost' },
      { param: 'efficiency', kind: 'range', min: 0.1, max: 1.0, unit: '%卡诺', dir: 'atLeast' },
      { param: 'inputPower', kind: 'range', min: 4.0, max: 8.0, unit: 'kW', dir: 'atMost' },
      { param: 'cooldownTime', kind: 'range', min: 1, max: 4, unit: 'h', dir: 'atMost' },
      { param: 'stability', kind: 'range', min: 0.002, max: 0.05, unit: 'K', dir: 'atMost' },
      { param: 'heliumCharge', kind: 'range', min: 0.05, max: 0.4, unit: 'kg' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // C. Nb/AlOₓ/Nb 溅射台：五件 + 整机
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * **溅射腔：φ600 × 800 不锈钢 + 负载锁，基压 1×10⁻⁵–10⁻⁴ Pa。**
   *
   * 为什么不用 EUV 镀膜机 `plant/euv-coater`：那台只有两只靶（Mo/Si）、
   * 基片台 ≤200 °C、没有负载锁。Nb 结要 Nb/Al 双靶 + 原位氧化 +
   * 300 °C 退火，而且 **Nb 会污染 Mo/Si 多层膜** —— 共用一台就是拿
   * EUV 镜的反射率换结的纯度。所以另建一台，不借。
   *
   * 负载锁是“原位氧化”的前提：Al 层氧化 10–60 min 时不能破真空，
   * 否则 Al 表面先吸 1–2 nm 的水/碳，AlOₓ 的势垒就变成漏电通道。
   */
  {
    id: 'plant/sputter-system/chamber',
    name: '溅射腔',
    unit: '件',
    category: 'part',
    props: [
      { param: 'basePressure', kind: 'range', min: 1e-6, max: 1e-3, unit: 'Pa', dir: 'atMost' },
      { param: 'volume', kind: 'range', min: 50, max: 500, unit: 'L' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-7, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /**
   * **磁控靶座 ×3（Nb / Al / 备用）+ 挡板，0.05–0.1 T、0.5–2 W/cm²。**
   *
   * 三只靶座：Nb 靶、Al 靶、第三只留给 NbN（反应溅射）或后续的 Al 合金。
   * 电磁铁而不是永磁体：本层没有稀土磁体（`magnet.ts` 缺口），
   * 铜线绕铁极给 0.05–0.1 T，正好把溅射电压从 2 000 V 压到 500 V。
   *
   * 挡板与靶座一体：换靶时连挡板一起换，避免 Nb 与 Al 交叉污染。
   */
  {
    id: 'plant/sputter-system/magnetron',
    name: '磁控靶座 ×3',
    unit: '件',
    category: 'part',
    props: [
      { param: 'targets', kind: 'range', min: 1, max: 4, unit: '只' },
      { param: 'magneticField', kind: 'range', min: 0.01, max: 0.2, unit: 'T', dir: 'atLeast' },
      { param: 'targetPower', kind: 'range', min: 0.2, max: 3, unit: 'W/cm²' },
    ],
  },

  /**
   * **基片加热台：石墨发热体 + 氧化铝绝缘，20–700 °C、±5 °C。**
   *
   * 石墨发热体从 `std/carbon-electrode-300` 上锯/车下来 —— 本层没有
   * 石墨件成形，只有碳电极（`litho-m3.ts` 同一句话）。700 °C 是
   * AlOₓ 退火与 NbN 反应溅射的下限；再高要 SiC 涂层（本层没有，
   * 裸石墨在 700 °C 上掉粉，颗粒落到片上就是漏电点）。
   */
  {
    id: 'plant/sputter-system/heater',
    name: '基片加热台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'temperature', kind: 'range', min: 20, max: 800, unit: '°C' },
      { param: 'uniformity', kind: 'range', min: 0, max: 10, unit: '%', dir: 'atMost' },
      { param: 'power', kind: 'range', min: 0.2, max: 3, unit: 'kW' },
    ],
  },

  /**
   * **Nb 靶：φ150 × 6 mm，99.9 %、90–95 % 密度，粉末冶金烧结。**
   *
   * 2 kg Nb 粉 → 1 kg 靶（0.91 kg 净 + 余量）。没有 HIP，密度 90–95 %；
   * 孔隙是溅射颗粒的来源，也是膜厚均匀性 1–3 % 的来源。
   * 纯度 99.9 %：钠热还原的 Ta 含量 <0.1 %，Ta 不形成自己的隧道结，
   * 但会抬高 Nb 的剩余电阻率 —— 对 4 K 的 coherence length 是好事，
   * 对 Ic 均匀性是坏事（±5 %）。
   */
  {
    id: 'plant/sputter-system/target-nb',
    name: 'Nb 靶',
    unit: '件',
    category: 'part',
    props: [
      { param: 'purity', kind: 'range', min: 99, max: 99.999, unit: '%', dir: 'atLeast' },
      { param: 'density', kind: 'range', min: 80, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'diameter', kind: 'range', min: 140, max: 160, unit: 'mm' },
      { param: 'thickness', kind: 'range', min: 5, max: 8, unit: 'mm' },
    ],
  },

  /**
   * **Al 靶：φ150 × 6 mm，99.9–99.99 %，熔铸 + 车削。**
   *
   * Al 层只有 5–8 nm，靶的纯度直接决定 AlOₓ 的缺陷密度。本层电解铝
   * 到 99.9 %（3N），99.99 % 要区域熔炼（0 条）—— 所以势垒的漏电
   * 比地球高一个量级。靶的晶粒要 ≤100 µm，否则溅射膜有取向差。
   */
  {
    id: 'plant/sputter-system/target-al',
    name: 'Al 靶',
    unit: '件',
    category: 'part',
    props: [
      { param: 'purity', kind: 'range', min: 99, max: 99.999, unit: '%', dir: 'atLeast' },
      { param: 'density', kind: 'range', min: 90, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'diameter', kind: 'range', min: 140, max: 160, unit: 'mm' },
      { param: 'thickness', kind: 'range', min: 5, max: 8, unit: 'mm' },
    ],
  },

  /**
   * **Nb/Al 双靶磁控溅射台：基压 1×10⁻⁵–10⁻⁴ Pa、基片 20–700 °C、三靶。**
   *
   * 它做四件事：Nb 底电极、Al 势垒层、原位 AlOₓ 氧化、Nb 顶电极；
   * 同一台机器、同一次真空循环，是结均匀性的唯一前提。
   *
   * `holds` 同时写压力与温度：压力覆盖溅射（0.3–1 Pa）与氧化（1–10 Pa）；
   * 温度覆盖室温沉积到 700 °C 退火/NbN。
   */
  {
    id: 'plant/sputter-system',
    name: 'Nb/Al 双靶磁控溅射台',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'pressure', min: 1e-5, max: 10 },
      { param: 'temperature', min: 20, max: 700 },
    ],
    props: [
      { param: 'basePressure', kind: 'range', min: 1e-6, max: 1e-3, unit: 'Pa', dir: 'atMost' },
      { param: 'substrateTemp', kind: 'range', min: 20, max: 800, unit: '°C' },
      { param: 'targets', kind: 'range', min: 1, max: 4, unit: '只' },
      { param: 'uniformity', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
      { param: 'targetPower', kind: 'range', min: 0.2, max: 3, unit: 'W/cm²' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // D. 约瑟夫森结与记录
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * **Nb/AlOₓ/Nb 隧道结：Jc 10–1000 A/cm²、Δ/e 1.4–1.5 mV、面积 1–100 µm²。**
   *
   *   Ic = Jc·A = 0.1 µA–1 mA
   *   Rn = (3.5–4.5 mV)/Ic = 4–3 000 Ω（工作段 35–2 200 Ω）
   *   Ic 均匀性 1–5 %（设计 1–3 %，首批 3–5 %）
   *
   * 2Δ/e = 2.8–3.0 mV 是**能隙电压**，不是 75 GHz 的台阶电压；台阶是
   * V₁ = f/K_J = 0.145–0.207 mV。这两个数在本文件里必须分开写，否则
   * 结数会算错 10 倍（见文件头 §二④）。
   */
  {
    id: 'std/josephson-junction-general',
    name: 'Nb/AlOₓ/Nb 隧道结',
    unit: '件',
    category: 'part',
    props: [
      { param: 'jc', kind: 'range', min: 10, max: 1000, unit: 'A/cm²' },
      { param: 'gap', kind: 'range', min: 1.4, max: 1.5, unit: 'mV' },
      { param: 'area', kind: 'range', min: 1, max: 100, unit: 'µm²' },
      { param: 'ic', kind: 'range', min: 0.1, max: 1000, unit: 'µA' },
      { param: 'rn', kind: 'range', min: 4, max: 3000, unit: 'Ω' },
      { param: 'uniformity', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
      { param: 'barrier', kind: 'enum', values: ['AlOx'] },
    ],
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // E. 70–100 GHz 源：三件 + 整机
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * **25 GHz Gunn 振荡器：GaAs n⁺nn⁺ + 波导腔，80–150 mW。**
   *
   * 为什么是 25 GHz 而不是 75 GHz：75 GHz 的有源层 0.5–1 µm、热流密度
   * 10⁵ W/cm²，本层没有 75 GHz 的网络分析仪，调不出来；25 GHz 的腔体
   * 可以用同轴/波导过渡 + 检波器调，再经三倍频到 75 GHz。
   *
   * 外延：n⁺ 缓冲 1 µm（Si 1×10¹⁸）、n 有源 3–5 µm（1×10¹⁵–10¹⁶）、
   * n⁺ 帽 0.5 µm；MOCVD 650–700 °C、8–12 kPa，衬底是 2 英寸 GaAs。
   * 欧姆接触 AuGe/Ni/Au 10/5/100 nm，400–450 °C/30 s 合金。
   */
  {
    id: 'plant/mmwave-source/gunn-oscillator',
    name: '25 GHz Gunn 振荡器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'frequency', kind: 'range', min: 18, max: 32, unit: 'GHz' },
      { param: 'power', kind: 'range', min: 30, max: 250, unit: 'mW' },
      { param: 'bias', kind: 'range', min: 5, max: 25, unit: 'V' },
      { param: 'thresholdCurrent', kind: 'range', min: 0.3, max: 3, unit: 'A' },
      { param: 'efficiency', kind: 'range', min: 1, max: 6, unit: '%' },
    ],
  },

  /**
   * **肖特基变容管三倍频器：25 GHz → 75 GHz，转换损耗 9–11 dB。**
   *
   * 两只 `std/schottky-diode-general` 背靠背装在波导腔里：一只做变容、
   * 一只做 idler（50 GHz）回收。输入 80–150 mW，输出 1–10 mW。
   *
   * 为什么是三倍频不是四倍频：25 × 3 = 75 GHz 落在 WR-10 的中心；
   * 四倍频要 100 GHz 的 idler，波导与二极管寄生都更紧，首台不取。
   */
  {
    id: 'plant/mmwave-source/varactor-tripler',
    name: '肖特基变容管三倍频器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'inputFrequency', kind: 'range', min: 15, max: 35, unit: 'GHz' },
      { param: 'outputFrequency', kind: 'range', min: 45, max: 120, unit: 'GHz' },
      { param: 'conversionLoss', kind: 'range', min: 6, max: 15, unit: 'dB', dir: 'atMost' },
      { param: 'outputPower', kind: 'range', min: 0.05, max: 20, unit: 'mW' },
      { param: 'varactorCount', kind: 'range', min: 1, max: 6, unit: '只' },
    ],
  },

  /**
   * **波导段：WR-10（75–110 GHz）/ WR-12（60–90 GHz），50–300 mm。**
   *
   * 铜制、法兰对研、银焊？本层没有银焊，用锡焊 + 导电胶；插入损耗
   * 0.1–1 dB。WR-10 的截面 2.54 × 1.27 mm，机械公差 ±0.02 mm ——
   * 本层铣床能到 ±0.05 mm，所以首台损耗取 0.5–1 dB，不是 0.1 dB。
   */
  {
    id: 'plant/mmwave-source/waveguide',
    name: '毫米波源波导段',
    unit: '件',
    category: 'part',
    props: [
      { param: 'band', kind: 'enum', values: ['WR-10', 'WR-12'] },
      { param: 'frequency', kind: 'range', min: 50, max: 120, unit: 'GHz' },
      { param: 'insertionLoss', kind: 'range', min: 0, max: 2, unit: 'dB', dir: 'atMost' },
      { param: 'length', kind: 'range', min: 20, max: 500, unit: 'mm' },
    ],
  },

  /**
   * **70–100 GHz 微波源：25 GHz Gunn ×3，1–10 mW，锁氢脉泽。**
   *
   *   frequency      70–100 GHz（首台 72–78 GHz）
   *   power          1–10 mW
   *   stability      1×10⁻¹²–1×10⁻⁹（设计 1×10⁻¹²；实测受氢脉泽 1×10⁻⁹ 限制）
   *   phaseNoise     −95…−80 dBc/Hz @100 kHz
   *   harmonic       −35…−25 dBc
   *   waveguide      WR-10（WR-12 备选）
   *
   * 自由振荡的稳定度只有 1×10⁻⁵–1×10⁻⁶；锁到 `plant/hydrogen-maser`
   * 的 10 MHz 后**设计** 1×10⁻¹²，**实测** 1×10⁻⁹（没有相位噪声分析仪，
   * 见 `atomic-clock.ts` §五⑤）。约瑟夫森电压的 δV/V = δf/f，
   * 1×10⁻⁸ 档靠实测 1×10⁻⁹ 有 10 倍余量；1×10⁻⁹ 档要相位噪声分析仪。
   */
  {
    id: 'plant/mmwave-source',
    name: '70–100 GHz 毫米波源',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'frequency', kind: 'range', min: 60, max: 110, unit: 'GHz' },
      { param: 'power', kind: 'range', min: 0.05, max: 20, unit: 'mW' },
      { param: 'stability', kind: 'range', min: 1e-14, max: 1e-5, unit: '1', dir: 'atMost' },
      { param: 'phaseNoise', kind: 'range', min: -120, max: -60, unit: 'dBc/Hz', dir: 'atMost' },
      { param: 'harmonicSuppression', kind: 'range', min: 15, max: 50, unit: 'dB', dir: 'atLeast' },
      { param: 'waveguide', kind: 'enum', values: ['WR-10', 'WR-12'] },
    ],
  },
];

export const QUANTUM_VOLTAGE_ROUTES: readonly Route[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // A. Nb 链
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * **铌精矿：风化层 10 500 000 kg → 精矿 1000 kg（30 % Nb₂O₅）。**
     *
     * 按 Nb 20 ppm、精矿含 Nb 20.96 % 算：1000 kg 精矿含 209.6 kg Nb，
     * 要 10 480 000 kg 风化层；取 10 500 000 kg 含 0.2 % 余量。
     * 富集比 10 500 : 1，是钨的 1/49。
     *
     * 重选 + 磁选：铌铁矿型重矿物比重 5.2–6.0，磁选把磁铁矿先拉走，
     * 重选把石英/长石留在尾砂。余 10 499 000 kg 是尾砂。
     */
    id: 'make/niobium-concentrate',
    name: '铌精矿制备',
    produces: [{ item: 'mat/niobium-concentrate', qty: q(1000) }],
    uses: [{ anyOf: [{ item: 'mars/regolith', qty: q(10500000) }] }],
    needs: ['plant/magnetic-separator'],
    performedBy: 'plant/ore-beneficiary',
    rate: { hours: q(24) },
    unbalanced_zh:
      '10 500 000 风化层（Nb 20 ppm、精矿 30 % Nb₂O₅ = 20.96 % Nb）→ 1000 精矿；余 10 499 000 是重选/磁选尾砂。20 ppm 是借地球值，火星未实测（见文件头 §五①）',
  },

  {
    /**
     * **Nb₂O₅：精矿 1000 + HF 230 + 氨 170 + 水 3000 → 280 kg。**
     *
     * 四步：
     *   ① HF 溶解 60–80 °C、100–200 kPa：Nb₂O₅ + 10 HF → 2 NbF₅ + 5 H₂O；
     *   ② 过滤/洗涤：脉石不溶，NbF₅ 进液相；
     *   ③ 氨沉淀 20–40 °C、pH 8–9：Nb(OH)₅；
     *   ④ 煅烧 500–600 °C：2 Nb(OH)₅ → Nb₂O₅ + 5 H₂O。
     *
     * 1000 kg 精矿含 300 kg Nb₂O₅，93 % 回收 → 280 kg。HF 230 kg 是
     * 10 HF/Nb₂O₅ 的 0.8 倍（其余靠母液循环）；氨 170 kg 是沉淀当量。
     */
    id: 'make/niobium-oxide',
    name: '五氧化二铌 Nb₂O₅制备',
    produces: [{ item: 'mat/niobium-oxide', qty: q(280) }],
    uses: [
      { anyOf: [{ item: 'mat/niobium-concentrate', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(230) }] },
      { anyOf: [{ item: 'mat/ammonia', qty: q(170) }] },
      { anyOf: [{ item: 'mat/water', qty: q(3000) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '① HF 溶解：60–80 °C、100–200 kPa，Nb₂O₅ + 10 HF → 2 NbF₅ + 5 H₂O；脉石不溶',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 60, max: 80 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
      {
        note_zh: '② 过滤/洗涤：NbF₅ 液相进滤液，脉石与未反应精矿进渣；洗水 3 倍',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
      {
        note_zh: '③ 氨沉淀：20–40 °C、pH 8–9，Nb(OH)₅ 析出；母液送 HF 回收',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
      {
        note_zh: '④ 煅烧：500–600 °C，2 Nb(OH)₅ → Nb₂O₅ + 5 H₂O；出炉 280 kg',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 500, max: 600 }],
      },
    ],
    rate: { hours: q(72) },
    unbalanced_zh:
      '1000 精矿（300 Nb₂O₅）+ 230 HF + 170 氨 + 3000 水 → 280 Nb₂O₅；93 % 回收。余 4120 是脉石、氟铌酸铵母液、洗水与挥发（水与 HF 可循环，本文件不建母液条目）',
  },

  {
    /**
     * **Nb 粉：Nb₂O₅ 1000 + HF 753 + Na 865 + KF 50 + Ar 50 + 水 2000 → 660 kg。**
     *
     * 总反应：Nb₂O₅ + 10 HF + 10 Na → 2 Nb + 10 NaF + 5 H₂O。
     * 理论 Nb 699 kg，95 % 收率 → 660 kg；NaF 1580 kg 是副产，
     * 用硫酸回收 HF 后循环（2 NaF + H₂SO₄ → Na₂SO₄ + 2 HF）。
     *
     * 五步：
     *   ① HF 溶解 80–100 °C；
     *   ② 加 KF 生成 K₂NbF₇，20–40 °C 结晶；
     *   ③ 钠热还原 750–850 °C、氩保护；
     *   ④ 水浸/酸洗去 NaF/KF；
     *   ⑤ 100–150 °C 干燥。
     *
     * Ar 50 kg 是保护气，绝大多数抽走；KF 50 kg 是循环补加，不消耗。
     */
    id: 'make/niobium-powder',
    name: 'Nb 粉制备',
    produces: [{ item: 'mat/niobium-powder', qty: q(660) }],
    uses: [
      { anyOf: [{ item: 'mat/niobium-oxide', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(753) }] },
      { anyOf: [{ item: 'mat/sodium', qty: q(865) }] },
      { anyOf: [{ item: 'mat/potassium-fluoride', qty: q(50) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2000) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '① HF 溶解：80–100 °C、100–200 kPa，Nb₂O₅ → NbF₅',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 80, max: 100 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
      {
        note_zh: '② 加 KF 成盐：2 NbF₅ + 4 KF → 2 K₂NbF₇；20–40 °C 结晶、离心',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
      {
        note_zh: '③ 钠热还原：2 K₂NbF₇ + 10 Na → 2 Nb + 10 NaF + 4 KF，750–850 °C、Ar 保护',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 750, max: 850 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '④ 水浸/酸洗：NaF、KF 溶走，Nb 粉沉降；洗到 Cl⁻/F⁻ ≤10 ppm',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
      {
        note_zh: '⑤ 干燥：100–150 °C、真空/氩，含水 ≤0.05 %；过 200 目筛',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 150 }],
      },
    ],
    rate: { hours: q(120) },
    unbalanced_zh:
      '1000 Nb₂O₅ + 753 HF + 865 Na + 50 KF + 50 Ar + 2000 水 → 660 Nb 粉 + 1580 NaF + 339 H₂O + 50 KF（循环）+ 2000 洗水（循环）；95 % 收率（理论 699）。NaF 用硫酸回收 HF，本文件不建 NaF 条目；余 89 是 HF/Ar 尾气与未反应物',
  },

  {
    /**
     * **阳极氧化电解液：硼酸 50 + 氨 30 + 乙二醇 920 + 水 20 → 1000 kg。**
     *
     * 5 % 五硼酸铵 + 乙二醇：H₃BO₃ + NH₃ → NH₄B₅O₈（简化），
     * 20–60 °C 搅拌溶解。乙二醇 920 kg 是溶剂，水 20 kg 助溶；
     * 用 316L/PTFE 槽，不能用铝（铝会自身阳极氧化）。
     */
    id: 'make/anodizing-electrolyte',
    name: '阳极氧化电解液制备',
    produces: [{ item: 'mat/anodizing-electrolyte', qty: q(1000) }],
    uses: [
      { anyOf: [{ item: 'mat/boric-acid', qty: q(50) }] },
      { anyOf: [{ item: 'mat/ammonia', qty: q(30) }] },
      { anyOf: [{ item: 'mat/ethylene-glycol', qty: q(920) }] },
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    performedBy: 'plant/wet-bench',
    under: [
      { param: 'temperature', min: 20, max: 60 },
      { param: 'pressure', min: 100, max: 200 },
    ],
    needs: [],
    rate: { hours: q(4) },
    unbalanced_zh:
      '硼酸 50 + 氨 30 + 乙二醇 920 + 水 20 → 电解液 1000；五硼酸铵 5 %，其余是溶剂。产物按 kg 计，账平（50+30+920+20=1020，出 1000；20 kg 是溶解损失与过滤残渣）',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // B. 4 K JT 级
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * **JT 压缩机头：车涡旋/气缸 → 装阀片 → 2 MPa 打压 → 流量测试。**
     *
     *   316L 8 + 45 钢 5 + 铜线 2 + PTFE 0.1 → 压缩机头 1 件
     *
     * 0.4–1.0 kW、1.2–1.6 MPa、0.05–0.15 g/s。油润滑，油气分离器
     * 把油雾压到 ≤1 ppm；氦侧漏率 ≤1×10⁻⁶ Pa·L/s。
     */
    id: 'make/jt-cooler-compressor',
    name: 'JT 压缩机头制造',
    produces: [
      {
        item: 'plant/jt-cooler/compressor',
        qty: q(1),
        gives: [
          { param: 'power', kind: 'range', min: 0.4, max: 1.0 },
          { param: 'pressure', kind: 'range', min: 1.2, max: 1.6 },
          { param: 'flow', kind: 'range', min: 0.05, max: 0.15 },
          { param: 'leakRate', kind: 'range', min: 1e-7, max: 5e-7 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(8) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车涡旋盘/气缸与曲轴（间隙 20 µm）', performedBy: 'lathe' },
      { note_zh: '磨配合面（20 µm 间隙是排量的命门）', performedBy: 'plant/grinder' },
      { note_zh: '装阀片、油气分离器与 PTFE 密封', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '打压 2 MPa 保压 1 h；测流量 0.05–0.15 g/s', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(40) },
    unbalanced_zh:
      '316L 8 + 45 钢 5 + 铜线 2 + PTFE 0.1 → 压缩机头 1 件；余是切屑与密封余量（按件计，不做 kg 守恒）',
  },

  {
    /**
     * **JT 节流阀：车针阀锥面 → 研阀座 → 装填料 → 氦检漏。**
     *
     *   316L 1 + 铜 0.2 + PTFE 0.05 → 阀 1 件
     *
     * 行程 0–3 mm，分辨 10 µm；压差 1.6 MPa；漏率 ≤5×10⁻⁸ Pa·L/s。
     * 阀杆薄壁 0.5 mm，导热漏 20–50 mW。
     */
    id: 'make/jt-cooler-valve',
    name: 'JT 节流阀制造',
    produces: [
      {
        item: 'plant/jt-cooler/jt-valve',
        qty: q(1),
        gives: [
          { param: 'pressure', kind: 'range', min: 0, max: 1.8 },
          { param: 'flow', kind: 'range', min: 0.05, max: 0.15 },
          { param: 'leakRate', kind: 'range', min: 1e-8, max: 5e-8 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车针阀锥面（15°）与阀座，研磨配对', performedBy: 'lathe' },
      { note_zh: '装 PTFE 填料与压盖（室温端），阀杆薄壁 0.5 mm', performedBy: 'plant/robot' },
      { note_zh: '氦检漏 ≤5×10⁻⁸ Pa·L/s；流量 0.05–0.15 g/s @1.6 MPa', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(16) },
    unbalanced_zh: '316L 1 + 铜 0.2 + PTFE 0.05 → 阀 1 件；余是车屑与研磨余量（按件计）',
  },

  {
    /**
     * **逆流换热器：弯铜管 → 套管内穿 → 绕螺旋 → 锡焊 → 氦检漏。**
     *
     *   铜 2 + 316L 1 + 锡银铜焊料 0.05 → 换热器 1 件
     *
     * φ6 × 0.5 内管、φ12 × 0.5 外套管，绕 12 圈、长 1.5–2.5 m；
     * 有效度 0.95、0.5–2 W/K、漏率 ≤5×10⁻⁸ Pa·L/s。
     */
    id: 'make/jt-cooler-hx',
    name: '4 K JT 制冷级逆流换热器制造',
    produces: [
      {
        item: 'plant/jt-cooler/hx',
        qty: q(1),
        gives: [
          { param: 'effectiveness', kind: 'range', min: 0.94, max: 0.96 },
          { param: 'area', kind: 'range', min: 0.08, max: 0.18 },
          { param: 'conductance', kind: 'range', min: 0.8, max: 1.8 },
          { param: 'leakRate', kind: 'range', min: 1e-8, max: 5e-8 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/solder-sac305', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '弯 φ6 × 0.5 铜管、套 φ12 外套管，绕 12 圈', performedBy: 'plant/winder' },
      { note_zh: '锡焊两端接头与法兰（真空侧不用银焊，本层没有）', performedBy: 'plant/robot' },
      { note_zh: '氦检漏 ≤5×10⁻⁸ Pa·L/s；测有效度 0.94–0.96（20 K 进气、4 K 出气）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '铜 2 + 316L 1 + 焊料 0.05 → 换热器 1 件；余是弯管废段与焊料飞溅（按件计）',
  },

  {
    /**
     * **真空罩：卷筒 → 焊法兰 → 包 10 层铝箔/玻纤 → 抽气检漏。**
     *
     *   316L 5 + 铝 2 + 玻璃纤维 0.5 → 真空罩 1 件
     *
     * 3–10 L，漏率 ≤5×10⁻⁸ Pa·L/s；10 层铝箔把辐射负荷从 23 W
     * 压到 0.2–0.5 W。
     */
    id: 'make/jt-cooler-vacuum-jacket',
    name: '4 K JT 制冷级真空罩与辐射屏制造',
    produces: [
      {
        item: 'plant/jt-cooler/vacuum-jacket',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 4, max: 8 },
          { param: 'pressure', kind: 'range', min: 1e-5, max: 1e-3 },
          { param: 'leakRate', kind: 'range', min: 1e-8, max: 5e-8 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/glass-fiber', qty: q(1, 2) }] },
    ],
    needs: ['plant/euv-vacuum', 'plant/metrology-room'],
    steps: [
      { note_zh: '卷 316L 筒、焊上下法兰与抽气口（CF100）', performedBy: 'plant/sheet-shop' },
      { note_zh: '包 10 层铝箔 + 玻纤间隔，冷板与罩之间留 5 mm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '接 euv-vacuum 抽到 1×10⁻⁵–10⁻³ Pa；关阀 1 h 压升 ≤5×10⁻⁸ Pa·L/s', performedBy: 'plant/robot', under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '316L 5 + 铝 2 + 玻纤 0.5 → 真空罩 1 件；余是卷板边料与铝箔剪裁（按件计）',
  },

  {
    /**
     * **4 K JT 级总装：压缩机 + 阀 + 换热器 + 真空罩，挂 GM 二级。**
     *
     *   压缩机 1 + 阀 1 + 换热器 1 + 真空罩 1 + 316L 5 + 铜 2 + 电机 1 → 1 台
     *
     * 装配后先做 20 K 预冷测试（GM 二级），再开 JT 到 4.2 K 自测冷量。
     * 自测那一步由本机执行、**不写 under 4 K** —— 否则会触发条件自举
     * （造它要它自己提供的 4 K）；4 K 的实际读数在 `measure/josephson-array`
     * 的 4.2 K 运行条件里。
     */
    id: 'make/jt-cooler',
    name: '4 K JT 级总装',
    produces: [
      {
        item: 'plant/jt-cooler',
        qty: q(1),
        gives: [
          { param: 'coolingPower', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'temperature', kind: 'range', min: 3.9, max: 4.4 },
          { param: 'heliumFlow', kind: 'range', min: 0.05, max: 0.15 },
          { param: 'pressureRatio', kind: 'range', min: 12, max: 18 },
          { param: 'precoolLoad', kind: 'range', min: 0.8, max: 2.5 },
          { param: 'efficiency', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'inputPower', kind: 'range', min: 4.4, max: 7.0 },
          { param: 'cooldownTime', kind: 'range', min: 1, max: 3 },
          { param: 'stability', kind: 'range', min: 0.005, max: 0.02 },
          { param: 'heliumCharge', kind: 'range', min: 0.1, max: 0.3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/jt-cooler/compressor', qty: q(1) }] },
      { anyOf: [{ item: 'plant/jt-cooler/jt-valve', qty: q(1) }] },
      { anyOf: [{ item: 'plant/jt-cooler/hx', qty: q(1) }] },
      { anyOf: [{ item: 'plant/jt-cooler/vacuum-jacket', qty: q(1) }] },
      { anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      // 氦：R10 一次性装填；窗口 0.1–0.3 kg，这里按 0.1 kg 下限记。
      { anyOf: [{ item: 'mat/helium', qty: q(1, 10) }] },
    ],
    needs: ['plant/euv-vacuum', 'plant/metrology-room'],
    steps: [
      {
        note_zh: '① 把真空罩与 4 K 冷板装到 GM 二级冷台上（In 垫/铟箔压接，热阻 ≤0.5 K/W）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '② 装换热器、JT 阀、压缩机与薄壁阀杆；接 euv-vacuum 抽到 1×10⁻⁵–10⁻³ Pa，关阀 1 h 压升 ≤5×10⁻⁸ Pa·L/s',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh: '③ 充氦 0.1–0.3 kg 到 1.6 MPa，静置 24 h 查压降 ≤0.5 %（R10 一次性装填，mat/helium 已建条目）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '④ GM 预冷到 20 K：二级 1.5–4 W @20 K，JT 级吃 0.8–2.5 W，余 0.5–1.5 W 给辐射屏',
        performedBy: 'plant/gm-cryocooler',
        under: [{ param: 'temperature', min: 18, max: 25 }],
      },
      {
        note_zh: '⑤ 自测：开 JT 阀，1–3 h 到 4.2 K；量冷量 0.1–0.5 W、流量 0.05–0.15 g/s、压比 12–18、稳定度 5–20 mK。本步不写 under 4 K（条件自举）',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(80) },
    unbalanced_zh:
      '压缩机 1 + 阀 1 + 换热器 1 + 真空罩 1 + 电机 1 + 316L 5 + 铜 2 → JT 级 1 台；产物按台计，不进 kg 守恒。氦 0.1–0.3 kg 在 props 上（R10 一次性装填）',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // C. 溅射台
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * **溅射腔：卷板 → 焊筒体/法兰 → 负载锁 → 烘烤 → 检漏。**
     *
     *   316L 200 + 钢板 50 + 铜 20 → 腔体 1 件
     *
     * φ600 × 800，基压 1×10⁻⁵–10⁻⁴ Pa，漏率 ≤5×10⁻⁸ Pa·L/s。
     * 负载锁是原位氧化的前提。
     */
    id: 'make/sputter-chamber',
    name: '溅射腔制造',
    produces: [
      {
        item: 'plant/sputter-system/chamber',
        qty: q(1),
        gives: [
          { param: 'basePressure', kind: 'range', min: 1e-5, max: 1e-4 },
          { param: 'volume', kind: 'range', min: 120, max: 250 },
          { param: 'leakRate', kind: 'range', min: 1e-8, max: 5e-8 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(200) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(50) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(20) }] },
    ],
    needs: ['plant/euv-vacuum', 'plant/metrology-room'],
    steps: [
      { note_zh: '卷 316L 筒体（φ600 × 800 × 6 mm）、焊上下法兰与水冷夹套', performedBy: 'plant/sheet-shop', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '焊负载锁（φ200 闸阀）与观察窗；法兰面车/研到 0.1 mm 平面度', performedBy: 'lathe' },
      { note_zh: '烘烤 150–200 °C、24 h 除气；接 euv-vacuum 抽到 1×10⁻⁵–10⁻⁴ Pa，压升 ≤5×10⁻⁸ Pa·L/s', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 150, max: 200 }] },
    ],
    rate: { hours: q(120) },
    unbalanced_zh: '316L 200 + 钢板 50 + 铜 20 → 腔体 1 件；余是卷板边料、焊缝与法兰车屑（按件计）',
  },

  {
    /**
     * **磁控靶座 ×3：车铜背板 → 绕电磁铁 → 装屏蔽/挡板 → 测场。**
     *
     *   铜 10 + 铁 10 + 铜线 3 + PTFE 0.2 → 靶座 1 件
     *
     * 0.05–0.1 T、0.5–2 W/cm²；三只靶座（Nb/Al/备用），挡板随靶换。
     */
    id: 'make/sputter-magnetron',
    name: '磁控靶座 ×3 制造',
    produces: [
      {
        item: 'plant/sputter-system/magnetron',
        qty: q(1),
        gives: [
          { param: 'targets', kind: 'range', min: 3, max: 3 },
          { param: 'magneticField', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'targetPower', kind: 'range', min: 0.5, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(10) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(10) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(3) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车三只 φ150 铜背板（水冷槽 3 mm）与铁极', performedBy: 'lathe' },
      { note_zh: '绕电磁铁线圈（0.05–0.1 T）、装屏蔽罩与挡板', performedBy: 'plant/winder' },
      { note_zh: '测表面场 0.05–0.1 T、靶面功率密度 0.5–2 W/cm²', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(40) },
    unbalanced_zh: '铜 10 + 铁 10 + 铜线 3 + PTFE 0.2 → 靶座 1 件；余是车屑与线圈余量（按件计）',
  },

  {
    /**
     * **基片加热台：锯石墨发热体 → 车 → 氧化铝绝缘 → 装热电偶 → 700 °C 试。**
     *
     *   φ300 碳电极 1 + 氧化铝 2 + 铜线 1 + 316L 5 → 加热台 1 件
     *
     * 20–700 °C、±5 °C、0.5–2 kW。石墨从碳电极上锯，本层没有石墨件成形。
     */
    id: 'make/sputter-heater',
    name: '基片加热台制造',
    produces: [
      {
        item: 'plant/sputter-system/heater',
        qty: q(1),
        gives: [
          { param: 'temperature', kind: 'range', min: 20, max: 700 },
          { param: 'uniformity', kind: 'range', min: 1, max: 5 },
          { param: 'power', kind: 'range', min: 0.5, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/carbon-electrode-300', qty: q(1) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '从 φ300 碳电极锯 φ120 × 8 mm 石墨发热盘，车出引线槽', performedBy: 'lathe' },
      { note_zh: '装氧化铝绝缘环与铜电极；压铜-康铜热电偶', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '空烧到 700 °C，测片内 ±5 °C 与功率 0.5–2 kW', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 600, max: 700 }] },
    ],
    rate: { hours: q(40) },
    unbalanced_zh: '碳电极 1 + 氧化铝 2 + 铜线 1 + 316L 5 → 加热台 1 件；余是石墨车屑与绝缘余量（按件计）',
  },

  {
    /**
     * **Nb 靶：装模 → 冷压 → 1600–1800 °C 无压烧结 → 车磨 → 测密度。**
     *
     *   Nb 粉 2 + 碳 0.1 + Ar 0.05 → 靶 1 件（0.91 kg 净）
     *
     * 90–95 % 密度、99.9 % 纯度。没有 HIP，孔隙是溅射颗粒的来源。
     */
    id: 'make/sputter-target-nb',
    name: 'Nb 靶制造',
    produces: [
      {
        item: 'plant/sputter-system/target-nb',
        qty: q(1),
        gives: [
          { param: 'purity', kind: 'range', min: 99.9, max: 99.95 },
          { param: 'density', kind: 'range', min: 90, max: 95 },
          { param: 'diameter', kind: 'range', min: 150, max: 150.2 },
          { param: 'thickness', kind: 'range', min: 6, max: 6.2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/niobium-powder', qty: q(2) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '装石墨模（碳电极掏的），Nb 粉 2 kg 冷压 100–200 MPa', performedBy: 'plant/press' },
      { note_zh: '无压烧结 1600–1800 °C、Ar 保护、保温 2–4 h；密度 90–95 %', performedBy: 'plant/atmosphere-furnace', under: [{ param: 'temperature', min: 1600, max: 1800 }, { param: 'oxygen_ppm', min: 0, max: 50 }] },
      { note_zh: '车/磨到 φ150 × 6 mm，端面平面度 0.05 mm；测密度与纯度', performedBy: 'plant/grinder' },
    ],
    rate: { hours: q(60) },
    unbalanced_zh: 'Nb 粉 2 + 碳 0.1 + Ar 0.05 → Nb 靶 1 件（0.91 kg）；余 1.09 kg 是孔隙、车屑与磨削（Nb 可回收，本文件不建回收路线）',
  },

  {
    /**
     * **Al 靶：熔铸 700–800 °C → 车 φ150 × 6 → 测纯度。**
     *
     *   铝 2 + 氧化铝 0.5 → 靶 1 件（0.5 kg 净）
     *
     * 99.9–99.99 %；氧化铝坩埚不参与反应，按件计。
     */
    id: 'make/sputter-target-al',
    name: 'Al 靶制造',
    produces: [
      {
        item: 'plant/sputter-system/target-al',
        qty: q(1),
        gives: [
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99 },
          { param: 'density', kind: 'range', min: 99, max: 100 },
          { param: 'diameter', kind: 'range', min: 150, max: 150.2 },
          { param: 'thickness', kind: 'range', min: 6, max: 6.2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '氧化铝坩埚熔铝 700–800 °C，除渣、浇成 φ160 锭', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 700, max: 800 }] },
      { note_zh: '车到 φ150 × 6 mm，端面平面度 0.05 mm；测纯度', performedBy: 'lathe' },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '铝 2 + 氧化铝 0.5 → Al 靶 1 件（0.5 kg）；余 1.5 kg 是浇口、车屑与氧化皮（铝可回收，本文件不建回收路线）',
  },

  {
    /**
     * **溅射台总装：腔体 + 靶座 + 加热台 + 双靶 + 反应气路 + 泵。**
     *
     *   腔体 1 + 靶座 1 + 加热台 1 + Nb 靶 1 + Al 靶 1 + 反应气路 1 +
     *   电机 1 + 316L 10 + 铜 5 → 1 台
     *
     * 装配后抽气、烘烤、靶预溅射、试镀 100 nm Nb 与 5 nm Al；
     * 基压、均匀性、靶面功率在 `gives` 里。
     */
    id: 'make/sputter-system',
    name: '溅射台总装',
    produces: [
      {
        item: 'plant/sputter-system',
        qty: q(1),
        gives: [
          { param: 'basePressure', kind: 'range', min: 1e-5, max: 1e-4 },
          { param: 'substrateTemp', kind: 'range', min: 20, max: 700 },
          { param: 'targets', kind: 'range', min: 3, max: 3 },
          { param: 'uniformity', kind: 'range', min: 1, max: 3 },
          { param: 'targetPower', kind: 'range', min: 0.5, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/sputter-system/chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sputter-system/magnetron', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sputter-system/heater', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sputter-system/target-nb', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sputter-system/target-al', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-coater/reactive-manifold', qty: q(1) }] },
      { anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(5) }] },
    ],
    needs: ['plant/euv-vacuum', 'plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '① 装腔体、负载锁、三只靶座（Nb/Al/备用）、加热台与反应气路（O₂/N₂/Ar）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 抽气 + 烘烤 150–200 °C、24 h；基压 1×10⁻⁵–10⁻⁴ Pa，压升 ≤5×10⁻⁸ Pa·L/s', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 150, max: 200 }] },
      { note_zh: '③ 靶预溅射：Nb 10 min、Al 5 min（挡板关），清靶面氧化层', performedBy: 'plant/robot' },
      { note_zh: '④ 试镀：Si 片 100 nm Nb + 5 nm Al + 原位氧化 + 100 nm Nb；QCM 读厚度，均匀性 1–3 %', performedBy: 'plant/film-monitor', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(120) },
    unbalanced_zh:
      '腔体 1 + 靶座 1 + 加热台 1 + Nb 靶 1 + Al 靶 1 + 气路 1 + 电机 1 + 316L 10 + 铜 5 → 溅射台 1 台；产物按台计，不进 kg 守恒。靶按 5 000–10 000 片磨损更换（未建模）',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // D. Nb/AlOₓ/Nb 结
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * **Nb/AlOₓ/Nb 结：热氧化 SiO₂ → Nb/Al/氧化/Nb → 光刻 → 阳极氧化 → 退火 → 4.2 K 测试。**
     *
     *   硅片 1 + 氧 0.02 + 氩 0.05 + 胶 0.01 + 电解液 2 + HF 0.01 +
     *   水 2 + 丙酮 0.05 → 20 000 结（一片 100 mm 片）
     *
     * 关键数：
     *   Nb 150 nm、Al 5–8 nm、AlOₓ 1–2 nm、顶 Nb 150 nm；
     *   结面积 4–25 µm²、Jc 50–500 A/cm²、Ic 2–125 µA、Rn 35–2 200 Ω；
     *   Δ/e 1.42–1.48 mV、2Δ/e 2.84–2.96 mV；
     *   Ic 均匀性 1–3 %（首批 3–5 %）。
     *
     * 阳极氧化：20–50 V 在 5 % 五硼酸铵/乙二醇里，Nb₂O₅ 50–100 nm，
     * 定结面积并绝缘侧壁；这一步不碰 AlOₓ 势垒（势垒是干氧）。
     *
     * 退火 250–300 °C、1–2 h：AlOₓ 致密化、Ic 均匀性从 5 % 收到 3 %。
     * 4.2 K 测试用 `plant/jt-cooler`；这一步的 under 4 K 不会条件自举，
     * 因为 `make/jt-cooler` 没有 under 4 K。
     */
    id: 'make/josephson-junction-general',
    name: 'Nb/AlOₓ/Nb 隧道结制造',
    produces: [
      {
        item: 'std/josephson-junction-general',
        qty: q(20000),
        gives: [
          { param: 'jc', kind: 'range', min: 50, max: 500 },
          { param: 'gap', kind: 'range', min: 1.42, max: 1.48 },
          { param: 'area', kind: 'range', min: 4, max: 25 },
          { param: 'ic', kind: 'range', min: 2, max: 125 },
          { param: 'rn', kind: 'range', min: 35, max: 2200 },
          { param: 'uniformity', kind: 'range', min: 1, max: 3 },
          { param: 'barrier', kind: 'enum', oneOf: ['AlOx'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/anodizing-electrolyte', qty: q(2) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
      { anyOf: [{ item: 'mat/acetone', qty: q(1, 20) }] },
    ],
    needs: [
      'plant/clean-room',
      'plant/metrology-room',
      'plant/mask-aligner',
      'plant/film-monitor',
      'plant/probe-station',
      'plant/jt-cooler',
      'std/dvm-general',
    ],
    steps: [
      {
        note_zh: '① 清洗 + 热氧化 300 nm SiO₂：1000–1100 °C、干氧；片内厚度 ±3 %',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 1000, max: 1100 }],
      },
      {
        note_zh: '② Nb 底电极 150 nm：0.3–0.8 Pa Ar、0.5–2 W/cm²、基片 20–90 °C；QCM 读厚度',
        performedBy: 'plant/sputter-system',
        under: [{ param: 'pressure', min: 0.3, max: 0.8 }],
      },
      {
        note_zh: '③ Al 势垒层 5–8 nm：同腔、不破真空；厚度决定 Jc（±1 nm 就是 2–3 倍 Jc）',
        performedBy: 'plant/sputter-system',
        under: [{ param: 'pressure', min: 0.3, max: 0.8 }],
      },
      {
        note_zh: '④ 原位氧化：O₂ 1–10 Pa、10–60 min、20–30 °C，AlOₓ 1–2 nm；不破真空是均匀性的前提',
        performedBy: 'plant/sputter-system',
        under: [{ param: 'pressure', min: 1, max: 10 }],
      },
      {
        note_zh: '⑤ Nb 顶电极 150 nm：同腔、同靶，0.3–0.8 Pa；三明治完成',
        performedBy: 'plant/sputter-system',
        under: [{ param: 'pressure', min: 0.3, max: 0.8 }],
      },
      {
        note_zh: '⑥ 结区光刻 + RIE 刻 Nb/AlOₓ/Nb 台面：结面积 4–25 µm²，侧壁 70–85°',
        performedBy: 'plant/rie-etcher',
        under: [{ param: 'pressure', min: 1, max: 10 }],
      },
      {
        note_zh: '⑦ 阳极氧化：5 % 五硼酸铵/乙二醇、20–50 V、20–40 °C，Nb₂O₅ 50–100 nm；定结面积 + 侧壁绝缘',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
      {
        note_zh: '⑧ SiO₂ 隔离 300 nm：反应溅射（Si 靶 + O₂），100–150 °C；过孔光刻 + RIE',
        performedBy: 'plant/euv-coater',
        under: [
          { param: 'pressure', min: 0.3, max: 1 },
          { param: 'temperature', min: 100, max: 150 },
        ],
      },
      {
        note_zh: '⑨ Nb 布线 300 nm：溅射 + 剥离（丙酮）；线宽 2–5 µm，方块电阻 ≤2 Ω/□',
        performedBy: 'plant/sputter-system',
        under: [{ param: 'pressure', min: 0.3, max: 0.8 }],
      },
      {
        note_zh: '⑩ 退火 250–300 °C、1–2 h：AlOₓ 致密化，Ic 均匀性 5 % → 3 %',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 250, max: 300 }],
      },
      {
        note_zh: '⑪ 4.2 K 直流测试：量 Jc、Ic、Rn、Δ/e；正反向各 3 次，取 20 000 结的中位数与 1σ',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 4.0, max: 4.3 }],
      },
    ],
    rate: { hours: q(240) },
    unbalanced_zh:
      '硅片 1 + 氧 0.02 + 氩 0.05 + 胶 0.01 + 电解液 2 + HF 0.01 + 水 2 + 丙酮 0.05 → 20 000 结；产物按件计，不做 kg 守恒。膜层总重 <1 mg，差额是溅射靶损耗、RIE 尾气与清洗液（按片计）',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // E. 70–100 GHz 源
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * **25 GHz Gunn 振荡器：MOCVD 外延 → 欧姆接触 → 台面刻蚀 → 装腔 → 测功率。**
     *
     *   GaAs 衬底 1 + TMGa 0.01 + AsH₃ 0.01 + Au/Ge/Ni 各 0.001 +
     *   磷酸 0.01 + 双氧水 0.01 + 水 1 + 铜 5 + 焊料 0.01 → 振荡器 1 件
     *
     * 外延：n⁺ 1 µm / n 3–5 µm / n⁺ 0.5 µm，MOCVD 650–700 °C、8–12 kPa。
     * 欧姆接触：AuGe/Ni/Au 10/5/100 nm，400–450 °C/30 s。
     * 台面：H₃PO₄:H₂O₂:H₂O = 1:1:10，20–40 °C，刻到 n⁺ 缓冲。
     * 装腔：25 GHz 波导腔 + 偏流，80–150 mW。
     */
    id: 'make/gunn-oscillator',
    name: '25 GHz Gunn 振荡器制造',
    produces: [
      {
        item: 'plant/mmwave-source/gunn-oscillator',
        qty: q(1),
        gives: [
          { param: 'frequency', kind: 'range', min: 24, max: 26 },
          { param: 'power', kind: 'range', min: 80, max: 150 },
          { param: 'bias', kind: 'range', min: 10, max: 16 },
          { param: 'thresholdCurrent', kind: 'range', min: 0.8, max: 1.5 },
          { param: 'efficiency', kind: 'range', min: 3, max: 4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/gaas-substrate-2in', qty: q(1) }] },
      { anyOf: [{ item: 'mat/trimethyl-gallium', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/arsine', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/germanium', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/phosphoric-acid', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/hydrogen-peroxide', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(5) }] },
      { anyOf: [{ item: 'mat/solder-sac305', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room', 'plant/probe-station'],
    steps: [
      {
        note_zh: '① MOCVD 外延：n⁺ 缓冲 1 µm（Si 1e18）、n 有源 3–5 µm（1e15–1e16）、n⁺ 帽 0.5 µm；650–700 °C、8–12 kPa',
        performedBy: 'plant/mocvd-reactor',
        under: [
          { param: 'temperature', min: 650, max: 700 },
          { param: 'pressure', min: 8, max: 12 },
        ],
      },
      {
        note_zh: '② 欧姆接触：AuGe/Ni/Au 10/5/100 nm 蒸发（1×10⁻³–10⁻² Pa），剥离成图形',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 1e-3, max: 1e-2 }],
      },
      {
        note_zh: '③ 合金：400–450 °C/30 s，RTA；比接触电阻 ≤1×10⁻⁶ Ω·cm²',
        performedBy: 'plant/rta',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
      {
        note_zh: '④ 台面刻蚀：H₃PO₄:H₂O₂:H₂O = 1:1:10，20–40 °C，刻到 n⁺ 缓冲；台面 20–50 µm',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
      {
        note_zh: '⑤ 划片、装铜热沉、键合引线；装 25 GHz 波导腔与偏流',
        performedBy: 'plant/wire-saw',
      },
      {
        note_zh: '⑥ 测功率：偏流 0.8–1.5 A、10–16 V，25 GHz 输出 80–150 mW；效率 3–4 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(120) },
    unbalanced_zh:
      'GaAs 衬底 1 + TMGa 0.01 + AsH₃ 0.01 + Au/Ge/Ni 各 0.001 + 磷酸/双氧水各 0.01 + 水 1 + 铜 5 + 焊料 0.01 → 振荡器 1 件；外延层 <0.1 mg，差额是源利用率 20–30 %、划片废品与腔体加工（按件计）',
  },

  {
    /**
     * **三倍频器：车波导腔 → 装两只肖特基管 → 调 idler → 测转换损耗。**
     *
     *   肖特基管 2 + 铜 2 + 焊料 0.05 + 金 0.001 → 三倍频器 1 件
     *
     * 25 GHz 输入、50 GHz idler、75 GHz 输出；转换损耗 9–11 dB；
     * 输入 80–150 mW → 输出 1–10 mW。
     */
    id: 'make/varactor-tripler',
    name: '肖特基变容管三倍频器制造',
    produces: [
      {
        item: 'plant/mmwave-source/varactor-tripler',
        qty: q(1),
        gives: [
          { param: 'inputFrequency', kind: 'range', min: 24, max: 26 },
          { param: 'outputFrequency', kind: 'range', min: 72, max: 78 },
          { param: 'conversionLoss', kind: 'range', min: 9, max: 11 },
          { param: 'outputPower', kind: 'range', min: 1, max: 10 },
          { param: 'varactorCount', kind: 'range', min: 2, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/schottky-diode-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/solder-sac305', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 1000) }] },
    ],
    needs: ['plant/metrology-room', 'plant/mmwave-source/gunn-oscillator', 'plant/uhf-digitizer'],
    steps: [
      { note_zh: '车 WR-10 波导腔与两只二极管座（公差 ±0.02 mm）', performedBy: 'lathe' },
      { note_zh: '装两只肖特基管（一只变容、一只 idler），金丝压焊', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '用 25 GHz Gunn 注入 80–150 mW，调 idler 与偏压；测 75 GHz 输出 1–10 mW、损耗 9–11 dB', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(40) },
    unbalanced_zh: '肖特基管 2 + 铜 2 + 焊料 0.05 + 金 0.001 → 三倍频器 1 件；余是波导腔车屑与压焊废品（按件计）',
  },

  {
    /**
     * **波导段：铣 WR-10 上下半腔 → 对研法兰 → 锡焊 → 测插损。**
     *
     *   铜 2 + 焊料 0.05 → 波导 1 件
     *
     * WR-10 截面 2.54 × 1.27 mm，长 50–300 mm；插损 0.5–1 dB
     * （本层铣床 ±0.05 mm，不是 ±0.02 mm）。
     */
    id: 'make/mmwave-waveguide',
    name: '毫米波源波导段制造',
    produces: [
      {
        item: 'plant/mmwave-source/waveguide',
        qty: q(1),
        gives: [
          { param: 'band', kind: 'enum', oneOf: ['WR-10'] },
          { param: 'frequency', kind: 'range', min: 70, max: 100 },
          { param: 'insertionLoss', kind: 'range', min: 0.5, max: 1 },
          { param: 'length', kind: 'range', min: 50, max: 300 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/solder-sac305', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '铣上下半腔（2.54 × 1.27 mm，±0.05 mm）与法兰', performedBy: 'plant/milling-machine' },
      { note_zh: '对研法兰面、锡焊合腔；测插损 0.5–1 dB @75 GHz', performedBy: 'lathe' },
    ],
    rate: { hours: q(16) },
    unbalanced_zh: '铜 2 + 焊料 0.05 → 波导 1 件；余是铣屑与焊料（按件计）',
  },

  {
    /**
     * **70–100 GHz 源总装：Gunn + 三倍频 + 波导 + PLL，锁氢脉泽。**
     *
     *   Gunn 1 + 三倍频 1 + 波导 1 + 控制板 1 + 石英谐振器 1 +
     *   铜 2 + 焊料 0.05 → 1 台
     *
     * 首台 72–78 GHz（25 GHz ×3），1–10 mW；锁到氢脉泽 10 MHz 后
     * 设计稳定度 1×10⁻¹²（1 s），实测受氢脉泽 1×10⁻⁹ 限制。
     * 相位噪声 −95…−80 dBc/Hz @100 kHz。
     *
     * PLL 用 `std/control-board-general` + `std/quartz-resonator-general`
     * + 分频/鉴相；25 GHz 的 1/256 预分频要 `std/counter-chip-general`
     * （本层 2–5 GHz 计数器，再经谐波混频下变频）。
     */
    id: 'make/mmwave-source',
    name: '70–100 GHz 源总装',
    produces: [
      {
        item: 'plant/mmwave-source',
        qty: q(1),
        gives: [
          { param: 'frequency', kind: 'range', min: 72, max: 78 },
          { param: 'power', kind: 'range', min: 1, max: 10 },
          { param: 'stability', kind: 'range', min: 1e-12, max: 1e-9 },
          { param: 'phaseNoise', kind: 'range', min: -95, max: -80 },
          { param: 'harmonicSuppression', kind: 'range', min: 25, max: 35 },
          { param: 'waveguide', kind: 'enum', oneOf: ['WR-10'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/mmwave-source/gunn-oscillator', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mmwave-source/varactor-tripler', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mmwave-source/waveguide', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/quartz-resonator-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/solder-sac305', qty: q(1, 20) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/hydrogen-maser',
      'std/counter-chip-general',
      'std/dvm-general',
      'plant/uhf-digitizer',
    ],
    steps: [
      { note_zh: '① 装 Gunn 振荡器、三倍频器、WR-10 波导与 PLL 板；波导法兰对中 ≤0.02 mm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 偏流 0.8–1.5 A 起振，调腔到 25 GHz；频谱上看基频与谐波', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 调三倍频偏压与 idler，测 75 GHz 输出 1–10 mW；转换损耗 9–11 dB', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 锁相：氢脉泽 10 MHz → PLL，**设计** 1 s 稳定度 1×10⁻¹³–1×10⁻¹¹；**实测**受氢脉泽 1×10⁻⁹ 限制；相位噪声 −95…−80 dBc/Hz @100 kHz', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '⑤ 封盖、标频点与功率；WR-12 备选法兰另配', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(80) },
    unbalanced_zh:
      'Gunn 1 + 三倍频 1 + 波导 1 + 控制板 1 + 石英谐振器 1 + 铜 2 + 焊料 0.05 → 源 1 台；产物按台计，不进 kg 守恒。首台 72–78 GHz；70–100 GHz 靠换基频/×4 支路，不是一台连续调谐。稳定度设计 1×10⁻¹²、实测 1×10⁻⁹',
  },

];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...QUANTUM_VOLTAGE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...QUANTUM_VOLTAGE_ROUTES];
