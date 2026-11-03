/**
 * 高压半导体器件 —— 1.6 kV 晶闸管与 3 kV 整流二极管，本层第一次让"千伏级的开关"存在。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 这一件堵住谁
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   `data/machine/euv-pulser.ts` 降级④：RC 充电的理论下限就是"源给 10 J、容只拿 5 J"，
 *   另一半一定烧在限流电阻上 —— 5 J × 1 kHz = **5 kW** 水电阻，正好蒸
 *   5 000 × 3 600 / 2 260 000 = **7.96 kg/h** 水。那份文件自己写着：
 *   "本层没有耐压 1 kV 的晶闸管（`pattern.ts` 的晶闸管只声明 ratedCurrent），
 *   所以这 5 kW 与 8 kg/h 是**'没有高压半导体'的直接价钱**"（降级④，第 231 行）。
 *
 *   本文件把那一件造出来：`std/hv-thyristor-general`（1.6 kV / 500 A）。
 *   换成谐振充电（10 mH 扼流圈 + 这只晶闸管）之后：
 *
 *     母线         1.05 kV → **500 V**（谐振把电容充到 2 V_s，要 1 kV 就得 500 V 母线）
 *     每脉冲取能   RC 是 C V² = 10 J；谐振是 2 C V_s² = **5 J**（V_s = ½V，正好一半）
 *     5 J × 1 kHz = **5 kW 归零**；水电阻没了，**8 kg/h 水归零**
 *     周期         死定在 π√(LC) = π√(10 mH × 10 µF) = **0.99 ms** ✓ 正好 1 kHz
 *     峰值电流     V_s√(C/L) = 500 × √(1e−5/1e−2) = **15.8 A**（原 30 A）
 *     开关应力     正反向各 500 V → 1.6 kV 器件的 31 %，余量 3 倍
 *     关断         电流在 LC 半波末尾**自己过零**，不需要可关断器件（见问题四）
 *
 *   `data/machine/litho-m3.ts` 的 ArF 脉冲电源（24 kV / 12 nF / 100 ns）缺的是把它点着的
 *   那只开关；那一路靠 1:20 脉冲变压器把电压升上去，本文件给的是**初级那一侧**的开关。
 *   10 kA / 1e11 A/s 仍然不是晶闸管的活（`euv-pulser.ts` 问题 3 判过，差 1000 倍），
 *   这一条本文件不改，也不该改。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 问题一：3 kV 耐压靠什么 —— 靠"片子本身"，不靠扩散
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 硅的击穿电压与掺杂只有一条式子（突变结，Sze 的口径）：
 *
 *     V_B = 5.34e13 × N_D^(−3/4)        [V, cm⁻³]
 *
 * 要给 V_B = 3000 V，反解得：
 *
 *     N_D = (5.34e13 / 3000)^(4/3) = **4.66e13 cm⁻³**
 *     ρ   = 1/(q μ_n N_D) = 1/(1.602e−19 × 1350 × 4.66e13) = **99 Ω·cm**
 *     W   = √(2 ε_s V_B /(q N_D)) = √(2 × 1.036e−12 × 3000 / 7.465e−6) = **289 µm**
 *     E_max = q N_D W / ε_s = 1.602e−19 × 4.66e13 × 0.0289 / 1.036e−12 = 2.08e5 V/cm
 *           （同掺杂的临界场 2.2e5 —— 自洽，式子与临界场没有打架）
 *
 * **所以 3 kV 的"本征层"是 289 µm 的高阻 n⁻。** 题目里那个 100–200 µm 落在另一档：
 * 1.6 kV 反推 N_D = 1.07e14、ρ = 43 Ω·cm、W = 139 µm —— **100–200 µm 是 1–1.8 kV 的厚度**。
 *
 * 本层两个器件用**同一种片**（模型只有一个 `mat/silicon-wafer`，没有电阻率这个属性），
 * 取 ρ = 120 Ω·cm（N_D = 3.8e13，V_B = 3.48 kV）。为什么不是 99 Ω·cm：斜面要拿掉 14 %，
 * 所以体击穿必须按 1.16 倍设计；这个"多出来的 20 %"是本文件与教科书唯一一处刻意的偏离。
 *
 *     二极管   360 µm 高阻层 → 穿通 3.81 kV、雪崩 3.48 kV → 斜面后**交付 3.0 kV**
 *     晶闸管   267 µm 高阻层 → 穿通 2.09 kV        → 斜面后**交付 1.78 kV**（额定 1.6）
 *
 * ── 深结：本层做不出来，而且不需要 ───────────────────────────────────
 *
 * 扩散的结深只随 √(Dt) 走（高斯驱入，C_s/C_B = 10³）：
 *
 *     x_j = 2√(D t · ln(C_s/C_B)) = 5.26 √(D t),   D = 1e−13 cm²/s @ 1200 °C
 *
 *     x_j = 1 µm   →  3.6e3 s =  **1.0 h**   ← 工业上的"一小时一微米"
 *     x_j = 3 µm   →  3.3e4 s =  **9 h**
 *     x_j = 8 µm   →  2.3e5 s =  **64 h**
 *     x_j = 20 µm  →  1.45e6 s = **17 天**
 *     x_j = 100 µm →  3.6e7 s = **419 天（1.15 年）**
 *
 * 最乐观的算法（源无限、x = 2√(Dt)）也要 **2.5e8 s = 7.9 年**。
 * **"100 µm 的结要扩散几小时"这句话是错的 —— 是几年。** 所以：
 *
 *   ① 289–360 µm 的本征层**不可能扩散出来**，它只能是**起始片的厚度**；
 *   ② 本层的扩散炉只负责 1–3 µm 的**发射区**；
 *   ③ 深结这条路一断，"高压"就落在**片的电阻率 + 片厚 + 斜面造型**这三件事上，
 *      与扩散炉的精度几乎无关 —— 这是本文件与教科书工艺最大的分歧。
 *
 * 本文件把炉次定在 **1100 °C**（比 1200 好控，且不碰炉子的上限）：
 * D(1100) = 1e−13 × exp(−40617 × (1/1373 − 1/1473)) = **1.34e−14 cm²/s**（E_a = 3.5 eV）。
 *
 *     二极管 n⁺  1100 °C × 40 h → x_j = 5.26√(1.34e−14 × 1.44e5) = **2.3 µm**
 *     晶闸管 n⁺  1100 °C ×  5 h → x_j = 5.26√(1.34e−14 × 1.8e4)  = **0.82 µm**
 *
 * ── 表面：没有斜面，3 kV 只剩 1 kV ───────────────────────────────────
 *
 * 平面结的边缘曲率 + 表面电荷把击穿压到体值的 **30–50 %**。本层用**正斜角 15°**：
 * 磨掉一圈使结线沿斜面张开，表面场强降到体场的 1/2 以下，拿回 **85–86 %**。
 * 斜面宽度 = W_额定/tan 15°：
 *
 *     二极管 W(3.0 kV) = √(2 ε_s V/(qN)) = **320 µm** → 斜面 **1.2 mm**
 *     晶闸管 W(1.6 kV) = **233 µm**                    → 斜面 **0.87 mm**
 *
 * 这一圈是纯机械活（`plant/grinder`），而它是 3 kV 能不能成立的关键一步。
 * 钝化用酚醛（本层唯一的可固化有机膜）：它挡潮但**不挡离子**，见降级⑤。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 问题二：PNPN 四层怎么排 —— 两次高温、两张版、两个相反的工序顺序
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 四层是 p⁺(阳极) / n⁻(长基区) / p(短基区) / n⁺(阴极)。本层的排法：
 *
 *     层       怎么来                                 深度      温度时长
 *     p⁺ 阳极   背面蒸铝 → 合金                         2 µm      650 °C 0.5 h
 *     n⁻       **起始片**（120 Ω·cm，薄化到 300 µm）      267 µm    ——
 *     p 短基区  正面蒸铝 → 合金 → **被磷扩散推深**        31 µm     650 → 1100 °C 5 h
 *     n⁺ 阴极   风化层釉浆里的 P₂O₅ 被硅还原 → 扩散       0.82 µm   1100 °C 5 h
 *
 * ── 顺序：两个器件恰好相反，理由都在铝身上 ───────────────────────────
 *
 * 铝是**快扩散体**：D_Al(1200) ≈ 1e−9 cm²/s（比磷大四个量级），1200 °C 走 8 h 就是
 * 2√(Dt) = 2√(1e−9 × 2.88e4) = **107 µm** —— 直接把基区穿掉。于是：
 *
 *   二极管    **先磷后铝**。铝只做阳极，不许再进炉 → 650 °C 合金到底，2 µm 不动。
 *   晶闸管    **先铝后磷**。故意让 1100 °C 的 5 h 磷扩散把铝推深：
 *             2√(1.34e−10 × 1.8e4) = **31 µm** —— 这就是 p 短基区。
 *             磷自己在最表面留下 0.82 µm 的 n⁺，**正好骑在基区上**。
 *
 * 所以那道磷扩散是**一箭双雕**：既是阴极、又是基区的成形工序。
 * 反过来说：**p 基区的深度不是独立的设计参数**，它是"磷扩散的温度时间"的副产 ——
 * 想把基区做深，就得把磷扩散做长，而代价是 α₁ 掉、触发电流涨。
 *
 * 图形只要两张版（不是教科书的四张）：p 基区是**整面**的，不用版；
 * 图形只用来分开两个电极 —— ① n⁺ 阴极窗、② 电极窗。最小特征是 0.5 mm 的电极间距，
 * 5 µm 的能力用掉不到 1 %。**二极管一张版都不要**（两面都是整面结）。
 *
 * ── 结深公差 ±10 %：够。**真正的分散不在结深，在浓度与寿命** ──────────
 *
 * x_j ∝ √(D t)，D 的温敏 E_a/(k T²) = 3.5/(8.617e−5 × 1373²) = **2.15 %/K**。
 *
 *     ±10 % 结深 ⇒ ±20 % Dt ⇒ **温度 ±9 °C**（或时间 ±20 %，两者可以互换）
 *     ±5  % 结深 ⇒ ±10 % Dt ⇒ **温度 ±4.7 °C**   ← GTO 的门槛，本层做不到（问题四）
 *
 * 把 ±10 % 代进去算，两头都很小：
 *
 *     耐压   p 基区 31 → 34 µm，基区少 3 µm → 穿通 2.09 → 2.04 kV（**−2 %**）
 *     触发   α₂ = 1/cosh(W_n/L_p) 只动 1 %，而 α₁+α₂−1 = 0.13 动 1.5 %
 *
 * **±10 % 是本层最不需要担心的那一个公差。** 真正让同一批的触发电流散三个数量级的是
 * 另外两个数，而它们都测不了（降级②⑦⑧）：
 *
 *     寿命   τ 5–20 µs ⇒ L_p 79–158 µm ⇒ α₂ = 0.059–0.267（2.09 kV 的基区不变）
 *            ⇒ α₁+α₂ = 1.01–1.22 ⇒ **(α₁+α₂−1) = 0.01–0.22** ⇒ 门极触发电流差 **20 倍**
 *     浓度   风化层釉浆的表面浓度 5e18–1e19（±3 倍）⇒ 接触电阻与 α₁ 一起散
 *
 * 所以分选表必须按**触发电流**分档（2/5/20 A 三档），不是按耐压分档；
 * 而"结深配得准不准"这件事，反而可以最后再管。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 问题三：500 A 怎么引出 —— 压接，因为键合丝差 1000 倍
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   电流密度   硅的持续值 100–200 A/cm²（双面水冷、压接）
 *   结面积     500 / 150 = **3.3 cm²** → 有源区 φ21 mm
 *   管芯       φ25 mm（4.9 cm²）—— 多出来的 1.4 cm² 是 0.87 mm 斜角与门极环
 *   一片 φ100  **15 位** φ25 管芯（每只 4.9 cm²，含划片道），取 **6 只**
 *   对照       平面管 20 只/片 → **一只 500 A 晶闸管 = 3.3 只平面管的硅**
 *
 * ── 键合丝为什么不行：算一遍就死 ─────────────────────────────────────
 *
 * `mat/bonding-wire` 是 φ25 µm 的铝丝，工业载流 0.4–0.5 A。500 A 要 **1000 根**，
 * 而 1000 根丝要均匀分流 —— 那是把"均流"交给 1000 个焊点的电阻分散（±20 %），
 * 做不到。而且每根丝都顶在满载上，一根先断就雪崩。
 * **所以：必须压接（pressure contact），本文件一处键合丝都不用。**
 *
 *   压力       10 MPa × 4.9 cm² = **4.9 kN（500 kgf）**，四只 M10 碟簧 + 螺栓预紧
 *   过渡片     **2 mm 钼片**（α_Mo 4.8e−6/K，硅 2.6e−6，铜 17e−6 —— 钼是唯一夹得住的）
 *   接触电阻   Mo–Si 压力接触 1e−4 Ω·cm² ×2 / 3.3 cm² ≈ **6e−5 Ω** → 500 A 上 **30 mV**
 *   铜排       500 A 按 2 A/mm² 自然对流 = 250 mm²（40 × 6）；水冷 5 A/mm² → 100 mm²
 *   功耗       V_T 1.3 V × 500 A = **650 W**，双面 325 W / 3.46 cm² = **94 W/cm²**
 *   结温升     R_th ≈ 0.059 K/W（硅 300 µm + 钼 2 mm + 铜 10 mm，两面并联）→ **38 K**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 问题四：能不能做 GTO —— 四条里两条通，缺的恰好是"关断"
 * ═══════════════════════════════════════════════════════════════════════
 *
 * GTO 比晶闸管多要四样：
 *
 *   ① 阴极短路点 10–50 µm 图形        ✓ 本层有（M1 的 1 µm 版，用力 5 %）
 *   ② 少子寿命可控（τ 1–5 µs）        ✓ `mat/gold` 可做金扩散（900 °C，D_Au ~1e−6）
 *   ③ **阳极短路（透明发射极）**       ✗ 见下
 *   ④ **−100 A 的门极关断驱动**        ✗ 见下
 *
 * ③ 短路点的**周期必须与扩散长度同量级**：L = √(D τ) = √(12.5 × 1e−5) = **112 µm**。
 *    周期 100 µm 的背面图形要**双面对位 ±15 µm**，而本层的版架只有单面、
 *    背面靠**目视片边**（±200 µm）—— **差 13 倍**。周期做大到 400 µm 就不用对位了，
 *    但那样点间距 4L，缓变开通时阳极侧等离子体来不及被抽走，短路失效。
 * ④ 关断增益 5–10 ⇒ 要抽出 500/5 = **100 A**、di/dt ~1000 A/µs 的门极脉冲。
 *    本层能给的最大门极驱动是 1 µF / 20 V 电容放电 + 1:20 脉冲变压器（2 mJ），**差 100 倍**。
 *
 * **结论（不可降级）：GTO 做不出来** —— 不是"精度差一档"，是"关断这件事不会发生"。
 *
 * 但这条路**不需要** GTO：
 *   · 谐振充电的开关工作在 LC 半波末尾，**电流自己过零**，晶闸管靠反偏恢复关断
 *     （1950 年代的逆变器全是这么干的）→ 5 kW 与 8 kg/h 照样省掉；
 *   · 真正要"任意时刻切断"的场合（斩波、PFN）本层用**强制换流**（换流电容 + 辅助晶闸管）
 *     顶上 —— 功能还在，代价是体积与 5–10 % 效率，属 `functional-kept`。
 *
 * **能做的是逆导晶闸管（RCT）**：把反并联二极管做在同一片上（`std/rc-thyristor-general`）。
 * 它要的只是**毫米级分区**（0.7 / 0.3 分），背面用一块**钢模手刷**、目视对位 ±200 µm 就够 ——
 * 与 GTO 的 100 µm 周期差 4 倍，**正好落在"能不能"的两侧**。
 * RCT 给的是反向通路（续流、逆变、斩波），不是可关断性，这两件事不许混。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 这一层绕不过去的两个"料"问题
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ── ① 施主：本层没有 POCl₃，也没有磷灰石精矿 ─────────────────────────
 *
 * `data/material/planar.ts` 与 `data/material/pattern.ts` 用 `mat/pocl3` 做磷扩散，
 * 而 POCl₃ ← 黄磷 ← `mat/apatite-concentrate` ← 浮选药剂。浮选药剂已有
 * `make/flotation-reagent`（黄药 + 丁醇），所以那条链不再是“没有药剂”的断点；
 * 本文件仍选风化层固体磷源，理由转到药剂选择性与 POCl₃ 的酸雾/尾气处理。
 *
 * 替代是：**风化层本身当固体磷源**。风化层含 P₂O₅ 1 %（`make/apatite-concentrate`
 * 的 30 : 1 富集比就建立在这个数上，ores.ts 第 232 行），它又是 44–56 % SiO₂ + CaO 的天然釉。
 * 掺碳粉调浆涂片，1100–1200 °C 下：
 *
 *     2 P₂O₅ + 5 Si → 4 P + 5 SiO₂      ΔG ≈ −3460 kJ/2 mol（硅把磷还原出来）
 *
 * 这就是 **PSG（磷硅酸盐玻璃）源的本层版** —— 工业磷扩散靠的也正是"玻璃里的 P₂O₅
 * 被硅还原、P 再扩进去"，不是靠 P 蒸气。差别在**磷的活度**：工业 PSG 含 P 4–8 %，
 * 风化层只有 0.44 %，**低 10–20 倍** → 表面浓度 1e20 → **5e18–1e19**，
 * 方块电阻 15 → **68–190 Ω/sq**。后果见降级②。
 *
 * ── ② 寿命：源脏 → τ 10 µs，而 3 kV 器件要 20 µs 以上 ───────────────
 *
 * 风化层里 FeO 17–20 %、TiO₂ 0.8–1.3 %、Cr 0.3 %，它们跟着磷一起进硅（Fe 在 1200 °C
 * 的固溶度 ~1e14 cm⁻³，扩散极快，一小时走穿 700 µm）。铁是深能级复合中心
 * （σ ≈ 1e−14 cm²、v_th 1e7 cm/s）：τ = 1/(σ v N) —— N = 1e13 时 **1 µs**。
 *
 * 救回来的是**磷扩散自己的吸杂**（P gettering：Fe 在 n⁺ 里成对/析出，基区被抽走 1–2 个
 * 数量级）。所以取 **τ = 5–15 µs，中值 10 µs**（工业高纯片 20–50）。这个数往下推：
 *
 *     L_p = √(D_p τ) = √(12.5 × 1e−5) = **112 µm**；2L = 224 µm
 *     晶闸管 n 基区 267 µm ≈ 2.4 L → α₂ = 1/cosh(267/112) = **0.184**（工业 0.7）
 *     二极管 360 µm 基区有 136 µm 没被等离子体淹没 → **V_F 5.4 V**（工业 1.8 V）
 *
 * 一句话：**本层的高压器件是"压降大的高压器件"**。3 kV 上 5.4 V 是 0.18 %，
 * 在整流位置无所谓；在开关位置（1.3 V × 500 A）就变成 650 W，靠双面水冷兜住。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 选型结论（一句话）
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   二极管   **p⁺-n⁻-n⁺ 整面结，一张版都不要**：φ25 管芯、380 µm 片、1.2 mm 斜面、3 kV/10 A
 *   晶闸管   **两版 + 两次高温**（先 650 铝、后 1100 磷 5 h）：φ25 管芯、300 µm 片、1.6 kV/500 A
 *   逆导     **同一套工序 + 双面刷釉 + 一块背面钢模**（±200 µm）：1.6 kV/500 A 带反并联二极管
 *   封装     **压接**（4.9 kN、钼片 2 mm、碟簧），不焊丝、不封帽
 *   测试     `plant/hv-test-bench`：3 kV 试验变压器 + 水电阻分压器 + 压接水冷夹具
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 已知缺口与降级点（十条，卡在哪一步都写出来）
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   ① **没有施主源，用风化层顶**：P₂O₅ 1 % 对 PSG 的 4–8 %，n⁺ 表面浓度 5e18–1e19
 *      （工业 1e20），方块电阻 68–190 Ω/sq，接触电阻高 3–5 倍。全片靠整面金属压接
 *      避开横向电流（这是"接触全覆盖"救回来的一点）。
 *   ② **τ 10 µs 对 20–50 µs**：V_F 5.4 V（3 kV 二极管，工业 1.8）、α₂ 0.184（工业 0.7）、
 *      门极触发电流 2–5 A（工业 0.1–0.2 A，差 20–50 倍）。
 *   ③ **p 基区的深度不是设计出来的**：它是"磷扩散 1100 °C × 5 h 把铝推深"的副产。
 *      想改基区就得改磷的炉次，而磷的深浅决定阴极——两个参数焊死在一起。
 *   ④ **斜面靠手**：15° 靠磨头角度 + 目视，±2°；斜面宽度 1.2 mm 的分散让耐压散 ±10 %，
 *      所以每一只都要打耐压（不能抽检）。**没有局放仪**，'打穿了'与'快打穿了'分不开。
 *   ⑤ **酚醛钝化不挡离子**：潮气与 Na⁺ 沿斜面爬，反向漏电随湿度涨 5–10 倍；
 *      没有氮化硅、没有硅橡胶、没有聚酰亚胺（`mat/` 里一样都没有）。
 *   ⑥ **测不了氧**：扩散炉气路里 100 ppm 的氧就长 2 nm 氧化层
 *      （#23 的判据就是 100 ppm），它把 P 的活度分掉一块 → 表面浓度掉 3–10 倍、
 *      结深浅 20–30 %（估）。本层只能靠"充气前抽到 1 Pa + 气瓶按 99.9 % 买"，不测不改（#23 第 1 条）。
 *   ⑦ **测不了电阻率**：没有四探针，120 Ω·cm 只能靠"300 V 漏电挑片"间接判，分散 ±20 %
 *      → 耐压分散 ±15 %。所以**同一批按耐压分档卖**，不是按型号。这一步吃掉一半的管芯。
 *   ⑧ **测不了寿命**：τ 没有仪器（要脉冲光 + 示波器），只能从触发电流与通态压降反推。
 *      上面那个 10 µs 是算的，不是量的（与 `litho-m3.ts` 的 21 nH 同性质）。
 *   ⑨ **Mo 片在氩里烧**（1850–1950 °C）：没有氢，氧 50 ppm 下表面留一层 MoO₂，
 *      压接前要磨掉；Mo 的氧含量也没有仪器测，只能看"磨出来亮不亮"。
 *   ⑩ **雪崩二极管不做**：整片均匀击穿要电阻率 ±5 %、斜面 ±0.5°，本层两样都测不了；
 *      浪涌保护继续用球隙 + 水电阻（`euv-pulser.ts` 已有球隙那一条）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const HV_SEMI_ITEMS: readonly Item[] = [
  // ───────────────────────────────────────────────────────────────────────
  // 测试台的三件零件（只装在 `plant/hv-test-bench` 上，不单独流通）
  // ───────────────────────────────────────────────────────────────────────

  /**
   * 高压试验变压器。3 kV / 20 mA（60 VA），干式、酚醛浇注。
   *
   * 为什么要它：**3 kV 的直流只能自己整流出来**。本层的 `std/transformer-general` 交付
   * 5–500 kVA 的工频铁芯，绕 3 000 匝副边就是 3 kV —— 与 `litho-m2.ts` 氙灯启动器
   * 那台 3.8 kV 是同一手（叠铁芯 + 细漆包线 + 浸漆）。
   *
   * 没有油：本层一滴变压器油都没有（`euv-pulser.ts` 第 95 行、`unblock-cleanroom-shell.ts`
   * 第 89 行都记过）。所以用酚醛浇注 + 玻璃布，**局放比油浸差一个数量级**，
   * 只能把 3 kV 的绕组按 9 kV 的绝缘做，再降额 30 % 用。
   */
  {
    id: 'plant/hv-test-bench/transformer',
    name: '高压测试台高压试验变压器',
    unit: '件',
    category: 'part',
    props: [{ param: 'voltage', kind: 'range', min: 0, max: 10000, unit: 'V', dir: 'atLeast' }],
  },

  /**
   * 水电阻分压器。φ6 × 300 mm 玻璃管、蒸馏水（ρ ≈ 100 Ω·m）、两只铜电极 → **1 MΩ**。
   *
   *   R = ρ L/A = 100 × 0.3 / 2.83e−5 = **1.06 MΩ**（A = π/4 × 6² = 28.3 mm² = 2.83e−5 m²）
   *   3 kV 下 2.8 mA、8.5 W；分压比 1 000 : 1，配 3 V 量程的表头正好读 3 kV
   *
   * 为什么是水：3 kV 的 1 MΩ 要一串耐压电阻，而本层没有高压电阻
   * （`euv-pulser.ts` 第 660 行同一句：`mat/resistance-wire` 不在许可表里）。
   * 水是唯一能同时给"1 MΩ""3 kV""可调"三样的东西 —— 与那台脉冲电源的 33 Ω 水电阻同源。
   *
   * 代价：**温度系数**。水温涨 10 K，ρ 掉 20 % → 分压比漂 20 %。所以读数前先量水温，
   * 或者"打完立刻校"。这是整台测试台里最软的一个数。
   */
  {
    id: 'plant/hv-test-bench/divider',
    name: '高压测试台水电阻分压器',
    unit: '件',
    category: 'part',
    props: [{ param: 'voltage', kind: 'range', min: 0, max: 10000, unit: 'V', dir: 'atLeast' }],
  },

  /**
   * 压接夹具：两块水冷铜块 + 一只铸铁绝缘座 + 四只 M10 碟形弹簧 + 一只球隙座。
   *
   *   夹紧力   四只碟簧 × 2.5 kN 预紧 = **10 kN**（管芯上 10 MPa，晶闸管只要 4.9 kN）
   *   水冷     铜块 60 × 60 × 20、内钻 φ8 蛇形孔，两路并联 → 带走 **1 kW**（ΔT 8 K）
   *   绝缘     玻璃布 + 酚醛，耐 10 kV/mm
   *   球隙     一对 φ25 铜球、间隙 2–10 mm 可调 —— 1 µs 的脉冲耐压没有分压器跟得上
   *            （1 MΩ 水电阻的时间常数就是 1 µs），只能用球隙看"打不打穿"
   *
   * 为什么夹具必须有水冷：650 W 的晶闸管在自然对流下结温升 200 K 以上，**一测就漂**。
   * 力与冷却是同一件事的两面 —— 接触电阻随压力走，温度随接触电阻走。
   */
  {
    id: 'plant/hv-test-bench/fixture',
    name: '高压测试台压接夹具',
    unit: '件',
    category: 'part',
    props: [{ param: 'clampForce', kind: 'range', min: 0, max: 50000, unit: 'N', dir: 'atLeast' }],
  },

  /**
   * **100 kV 独立源。** 17 级全波倍压：34 只 3 kV 整流器 + 34 组 25 nF/6 kV
   * 石英叠片（140 kg 石英），SF₆ 绝缘。
   *
   * 它与注入机的 `plant/ion-implanter/hv-column` 是同一套设计；做成独立源
   * 是为了**不拿被测机器给自己当源**（R8 #11 的那条死结）。
   *
   *   voltage  100 kV（空载 102 kV，22 µA 时 100 kV）
   *   current  22 µA
   *   ripple   3 %
   */
  {
    id: 'plant/hv-test-bench/source-100k',
    name: '100 kV 独立源',
    unit: '件',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 0, max: 200000, unit: 'V', dir: 'atLeast' },
      { param: 'current', kind: 'range', min: 0, max: 1000, unit: 'µA', dir: 'atLeast' },
      { param: 'ripple', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * **100 kV 分压器。** 10 只 10 kV 电阻单元串成 1 GΩ，分压比 1000:1。
   *
   * 水电阻在 100 kV 上不能用：1 GΩ 的水柱要 300 m，且温漂 20 %。
   * 这里用 `mat/resistance-wire` 绕在氧化铝骨架上，SF₆ 里绝缘。
   */
  {
    id: 'plant/hv-test-bench/divider-100k',
    name: '100 kV 分压器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 0, max: 200000, unit: 'V', dir: 'atLeast' },
      { param: 'ratio', kind: 'range', min: 100, max: 10000, unit: ':1' },
      { param: 'accuracy', kind: 'range', min: 0, max: 10, unit: '%', dir: 'atMost' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 测试台（设备）
  // ───────────────────────────────────────────────────────────────────────

  /*
   * ⚠️ `plant/hv-test-bench` 的条目已移到 `data/floor/seed.ts` —— 它进了 `D`（搁置支撑集）。
   * 零件仍全部在本文件（transformer / divider / fixture / source-100k / pd-* / 测量标准）。
   * 移走的理由与代价写在 seed.ts 那一条的注释里；这里不再保留第二份定义（同 id 只能声明一次）。
   */

  // ───────────────────────────────────────────────────────────────────────
  // 器件
  // ───────────────────────────────────────────────────────────────────────

  /**
   * 高压整流二极管（PIN，3 kV / 10 A）。
   *
   *   结构    p⁺(铝合金 2 µm) / n⁻(片 360 µm) / n⁺(风化层磷 2.3 µm)
   *   耐压    穿通 3.81 kV、雪崩 3.48 kV，15° 斜面后 **3.0 kV**
   *   通态    5.4 V @ 10 A（54 W）—— 工业 1.8 V，差 3 倍，全在寿命上（降级②）
   *   管芯    φ25 mm（有源 φ22 mm = 3.8 cm²，斜面 1.2 mm/边）
   *   封装    压接：钼片 2 mm + 碟簧 4.9 kN + 玻璃环，**一根键合丝都没有**
   *
   * 它是本层第一只**不需要光刻的功率器件**：两面都是整面结，电极用钢模板挡着蒸镀
   * （0.1 mm 级），与 `make/photodiode` 同一路数。版只在晶闸管上用。
   */
  {
    id: 'std/hv-rectifier-general',
    name: '高压整流二极管',
    unit: '件',
    category: 'part',
    props: [
      { param: 'ratedVoltage', kind: 'range', min: 0, max: 10000, unit: 'V', dir: 'atLeast' },
      { param: 'ratedCurrent', kind: 'range', min: 0, max: 1000, unit: 'A', dir: 'atLeast' },
      { param: 'forwardDrop', kind: 'range', min: 0, max: 20, unit: 'V', dir: 'atMost' },
    ],
  },

  /**
   * 高压晶闸管（1.6 kV / 500 A）。PNPN 四层、门极在 p 基区的外环上。
   *
   *   结构    p⁺(背 2 µm) / n⁻(267 µm) / p(31 µm) / n⁺(0.82 µm)
   *   耐压    穿通 2.09 kV → 斜面后 1.78 kV → 额定 **1.6 kV**
   *   通态    1.3 V @ 500 A（650 W，双面 94 W/cm²，结温升 38 K）
   *   触发    2–5 A（工业 0.1–0.2 A）—— α₂ 只有 0.184 的直接后果
   *   dv/dt   200–500 V/µs（算的：C_j = εA/W = 134 pF、p 基区横向 10–25 Ω、触发 0.7 V）
   *   关断    **只能自然换流**（电流过零），不能门极关断 → 见 GTO 那一节
   *
   * 它就是 `euv-pulser.ts` 降级④要的那一件：1 kV 谐振充电的开关。
   *
   * ⚠️ 本层做不出**指状门极**（要 10–50 µm 的指宽与指间距）：本器件是"外环门极 + 整片阴极"。
   * 等离子体从外环铺到中心要 10 mm / (0.05–0.1 mm/µs) = **100–200 µs**，于是 di/dt 上限
   * 只有 ~500 A/ms。谐振充电的 di/dt 是 30 A/1 ms = **0.03 A/µs**，差四个数量级 ——
   * **指状门极在这个用法里根本不需要**（逆变里要，那才轮到 GTO 那一节）。
   */
  {
    id: 'std/hv-thyristor-general',
    name: '高压晶闸管',
    unit: '件',
    category: 'part',
    props: [
      { param: 'ratedVoltage', kind: 'range', min: 0, max: 6000, unit: 'V', dir: 'atLeast' },
      { param: 'ratedCurrent', kind: 'range', min: 0, max: 2000, unit: 'A', dir: 'atLeast' },
      { param: 'dvdt', kind: 'range', min: 0, max: 10000, unit: 'V/µs', dir: 'atLeast' },
    ],
  },

  /**
   * 逆导晶闸管（RCT，1.6 kV / 500 A，带反并联二极管）。
   *
   * 与晶闸管的差别只有三处：
   *   ① 顶版上的 n⁺ 阴极窗**只开 70 %**（二极管区留 p 基区裸着）
   *   ② 磷釉**双面刷**（底面的 n⁺ 就是二极管阴极）
   *   ③ 背面 p⁺ 铝**只合金 70 %**（钢模手刷）—— 剩下 30 % 的 n⁺ 露着，接阳极端子
   *
   * 于是二极管的正极 = 顶部的 p 基区（与阴极同电位），负极 = 底面的 n⁺（与阳极同电位）
   * —— **反并联通路长在同一片硅上**，不占额外的管芯、不占额外的压接点。
   *
   * 它对位只要 ±200 µm（分区是毫米级、目视片边），而 GTO 的阳极短路点要 ±15 µm。
   * **这两条正好落在"能不能"的两侧** —— 所以 RCT 能做，GTO 不能。
   */
  {
    id: 'std/rc-thyristor-general',
    name: '逆导晶闸管',
    unit: '件',
    category: 'part',
    props: [
      { param: 'ratedVoltage', kind: 'range', min: 0, max: 6000, unit: 'V', dir: 'atLeast' },
      { param: 'ratedCurrent', kind: 'range', min: 0, max: 2000, unit: 'A', dir: 'atLeast' },
      { param: 'diodeShare', kind: 'range', min: 0, max: 100, unit: '%' },
    ],
  },
];

export const HV_SEMI_ROUTES: readonly Route[] = [
  // ───────────────────────────────────────────────────────────────────────
  // 测试台的零件（三条路线，都是"把已有的手艺拼起来"）
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * 试验变压器：冲剪叠片 → 绕两组绕组 → 真空浸酚醛 → 装配与空载试验。
     *
     *   铁芯 20 kg（0.5 mm 硅钢片叠到 40 × 60 的截面）
     *   副边 3 000 匝 φ0.1 mm 漆包线 → 3 kV；原边 500 匝 φ0.5 → 500 V，变比 6.0
     *   绝缘 副边分 10 层绕、层间垫玻璃布 + 两次浸酚醛（干式，没有油）
     *
     * 60 VA 的变压器用 5 kVA 的铁芯（本层只有这一档）—— 与 `euv-pulser.ts` 触发单元
     * 那台 1:20 脉冲变压器同一个"用大件干小事"，在这里连损耗都算不上。
     */
    id: 'make/hv-test-transformer',
    name: '高压测试台高压试验变压器制造',
    produces: [
      {
        item: 'plant/hv-test-bench/transformer',
        qty: q(1),
        gives: [{ param: 'voltage', kind: 'range', min: 3000, dir: 'atLeast' }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper-wire', qty: q(6) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(20) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(4) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '冲剪 E 形叠片、叠装、夹紧（0.5 mm 硅钢片 40 × 60 截面）', performedBy: 'plant/sheet-shop' },
      { note_zh: '绕原边 500 匝 φ0.5；副边分 10 层绕 3 000 匝 φ0.1，层间垫玻璃布', performedBy: 'plant/winder' },
      {
        note_zh: '真空浸酚醛、固化（150–180）—— 干式绝缘，局放比油浸差一个数量级，按 30 % 降额',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 150, max: 180 }],
      },
      {
        note_zh: '装配、装高压套管；通 500 V 看变比（3 000/500 = 6.0 ±2 %）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(16) },
    unbalanced_zh: '铜线 6 + 钢板 20 + 酚醛 4 + 玻璃 2 + 铜 1 → 试验变压器 1 件；余是冲片边角与浸漆损耗',
  },

  {
    /**
     * 水电阻分压器：玻璃管封底 → 装电极 → 灌蒸馏水 → 标分压比。
     *
     *   R = ρ L/A = 100 Ω·m × 0.3 m / 2.83e−5 m² = **1.06 MΩ**
     *   分压比 1 000 : 1（下臂 1 kΩ 用铜线绕，`euv-pulser.ts` 同一手）
     *
     * 标定只能"对着一个已知的电压"，而本层最高的已知电压就是试验变压器自己的变比。
     * 所以这是**相对**标定：分压比的不确定度 = 变比（±2 %）+ 水温（±20 %）。
     */
    id: 'make/hv-test-divider',
    name: '高压测试台水电阻分压器制造',
    produces: [
      {
        item: 'plant/hv-test-bench/divider',
        qty: q(1),
        gives: [{ param: 'voltage', kind: 'range', min: 4000, dir: 'atLeast' }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '玻璃管 φ6 × 300 封底、翻边（灯工活：车床夹持 + 火头）', performedBy: 'lathe' },
      {
        note_zh: '装两只铜电极与上下端盖、灌三次蒸馏水（每次换水到 ρ 稳定）',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 40 }],
      },
      {
        note_zh: '标分压比：加 300 V 读下臂（1 kΩ）压降，反解 R 到 1.06 MΩ ±10 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(8) },
    unbalanced_zh: '玻璃 1 + 水 0.05 + 铜 0.2 + 钢板 1 → 分压器 1 件；水不进成品（工质）',
  },

  {
    /**
     * 压接夹具：车铜块与球隙 → 铣蛇形水路 → 浇铸铁底座 → 装碟簧。
     *
     *   四只 M10 碟形弹簧（45 钢、淬回火 45–50 HRC），每只 2.5 kN → 合计 **10 kN**
     *   预紧靠扭矩扳手（40 N·m ≈ 2.5 kN，K = 0.2 的螺栓公式），**±20 %** ——
     *   这是压力接触在本层的真实精度：曲柄压力机没有下死点调节（`press.ts` 第 38 行），
     *   所以力只能由碟簧的压缩量定，不由机器的行程定。
     *
     * 力的核对不用测力计（没有）：用铸铁砝码 100 kg × 5 吊在杠杆上，量碟簧压缩量对照。
     */
    id: 'make/hv-test-fixture',
    name: '高压测试台压接夹具制造',
    produces: [
      {
        item: 'plant/hv-test-bench/fixture',
        qty: q(1),
        gives: [{ param: 'clampForce', kind: 'range', min: 10000, dir: 'atLeast' }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(4) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(3) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(8) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车两块水冷铜块 60 × 60 × 20、车 φ25 铜球一对（球隙座）', performedBy: 'lathe' },
      { note_zh: '铣 φ8 蛇形水路与 O 形槽（两路并联，带走 1 kW）', performedBy: 'plant/milling-machine' },
      {
        note_zh: '浇铸铁底座与铜块托架（HT250，1350–1450）',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1350, max: 1450 }],
      },
      { note_zh: '装玻璃布绝缘座、矿棉包外壁（防凝露），装四只碟簧与球隙座', performedBy: 'plant/robot' },
      {
        note_zh: '力的核对：铸铁砝码 100 kg × 5 吊杠杆压碟簧，量压缩量对照（±20 %）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(12) },
    unbalanced_zh: '铜 4 + 45 钢 3 + 玻璃 1 + 矿棉 0.5 + 铸铁 8 → 夹具 1 件；余是车屑与钻孔屑',
  },

  // ───────────────────────────────────────────────────────────────────────
  // 二极管：一张版都不要
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * 3 kV / 10 A PIN 整流二极管。
     *
     * 骨架只有两条高温：**一面扩散磷（1100，40 h，给 n⁺）、一面合金铝（650，给 p⁺）**。
     * 中间那 360 µm 的高阻 n⁻ 从来没人动过 —— 它就是起始片薄化之后剩下的厚度。
     * 顺序是**先磷后铝**（铝只做阳极，不许再进炉，见问题二）。
     *
     *   ① 挑片      整片夹进水电阻回路加 300 V，漏电 <10 µA 的留下（只剩一半）
     *   ② 减薄      700 → 380 µm（磨 300，再抛 20 去损伤层）
     *   ③ 磷釉      风化层 + 碳粉 + 水调浆，刷正面、晾干（膜厚 ~50 µm）
     *   ④ 扩散      1100、40 h、氮气 → n⁺ 2.3 µm
     *   ⑤ 洗釉      HF 溶掉磷硅酸盐玻璃（比氧化硅快 10 倍，几十秒）
     *   ⑥ 背面蒸铝 → 合金 650、30 min → p⁺ 2 µm
     *   ⑦ 正面蒸铝   钢模板挡出边缘 1.5 mm（**二极管唯一需要"图形"的地方**）
     *   ⑧ 磨斜面     15°，磨掉 1.2 mm 宽的环
     *   ⑨ 钝化       涂酚醛、150–180 固化（斜面是裸硅，全靠这一层）
     *   ⑩ 压接       钼片 2 mm 两面 + 玻璃绝缘环 + 碟簧 4.9 kN + 焊锡引线
     *   ⑪ 分选       3 kV 反压 + 10 A 正压 + 1 kA/10 ms 浪涌，按耐压分档
     *
     * 为什么不做"场限环"：那要多一张版与一次氧化，而斜面已经把 86 % 拿回来了 ——
     * **机械的斜面比工艺的环便宜**，这是本层与 2000 年以后工业做法最不一样的地方。
     */
    id: 'make/hv-rectifier',
    name: '高压整流二极管制造',
    produces: [
      {
        item: 'std/hv-rectifier-general',
        qty: q(6),
        gives: [
          { param: 'ratedVoltage', kind: 'range', min: 3000, dir: 'atLeast' },
          { param: 'ratedCurrent', kind: 'range', min: 10, dir: 'atLeast' },
          { param: 'forwardDrop', kind: 'range', max: 5.5, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      // 磷源：风化层 1 kg（P₂O₅ 1 % → 4.4 g P，够扩 2.3 µm 的 n⁺）+ 碳粉（还原剂）+ 水调浆
      { anyOf: [{ item: 'mars/regolith', qty: q(1) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      // 洗釉与洗片
      { anyOf: [{ item: 'mat/hf', qty: q(1, 5) }] },
      // 扩散气氛
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1) }] },
      // 压接：2 片 φ25 × 2 mm 钼片（各 10 g，含烧结损耗按 0.2 kg 投）、玻璃绝缘环、
      // 45 钢碟簧与法兰、铜编织带引出、焊锡
      { anyOf: [{ item: 'mat/molybdenum-powder', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(1, 10) }] },
      // 斜面钝化
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1) }] },
    ],
    needs: ['plant/hv-test-bench', 'plant/metrology-room'],
    steps: [
      {
        note_zh: '挑片：整片压进水电阻回路加 300 V，漏电 <10 µA 的留下（没有四探针，只能这么挑；吃掉一半）',
        performedBy: 'plant/robot',
      },
      { note_zh: '减薄 700 → 380 µm（背面磨 300 µm）', performedBy: 'plant/grinder' },
      {
        note_zh: '抛 20 µm 去磨削损伤层（损伤层是复合中心，留着寿命再掉一半）',
        performedBy: 'plant/cmp-polisher',
        under: [{ param: 'pressure', min: 15, max: 25 }],
      },
      { note_zh: '双面清洗（HF 30 s + 水冲，去自然氧化层）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 40 }] },
      { note_zh: '调磷釉：风化层 1 + 碳粉 0.2 + 水，球磨成浆，刷正面、晾干（膜厚 ~50 µm）', performedBy: 'plant/robot' },
      {
        note_zh: '磷扩散 1100、40 h、氮气 → n⁺ 2.3 µm（风化层的 P₂O₅ 被硅还原，PSG 源的本层版）',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 1080, max: 1100 }],
      },
      { note_zh: 'HF 洗掉磷硅酸盐玻璃层（几十秒），水冲、甩干', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 40 }] },
      { note_zh: '背面蒸铝 1 µm（真空 1e−2 Pa，钨丝篮）', performedBy: 'plant/evaporator', under: [{ param: 'pressure', min: 0.001, max: 0.01 }] },
      {
        note_zh: '铝合金 650、30 min → p⁺ 2 µm（**铝必须在磷之后**：铝在 1200 走 8 h 就是 107 µm，会穿通）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 600, max: 700 }],
      },
      { note_zh: '正面蒸铝 1 µm，钢模板挡出边缘 1.5 mm（0.1 mm 级，与光电二极管同一手）', performedBy: 'plant/evaporator', under: [{ param: 'pressure', min: 0.001, max: 0.01 }] },
      { note_zh: '磨 15° 正斜面、宽 1.2 mm（W(3 kV) = 320 µm ÷ tan15°）；磨完镜检无崩边', performedBy: 'plant/grinder' },
      {
        note_zh: '涂酚醛钝化斜面、150–180 固化（裸硅全靠这一层挡潮；它不挡离子，降级⑤）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 150, max: 180 }],
      },
      {
        note_zh: '压制并烧结两片钼片（1850–1950、氩、氧 <50 ppm），磨到 2.00 ±0.02 mm',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 1850, max: 1950 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      { note_zh: '同轴压接：Mo/Si/Mo 三明治 + 玻璃绝缘环 + 碟簧，10 MPa（4.9 kN）', performedBy: 'plant/press' },
      { note_zh: '焊锡引出铜编织带，扭矩对角紧到 40 N·m', performedBy: 'plant/robot' },
      {
        note_zh: '分选：3 kV 反压 1 min（漏电 <100 µA）、10 A 正压（V_F ≤5.5 V）、1 kA/10 ms 浪涌；按耐压分 3.0/2.7/2.4 kV 三档',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(96) },
    unbalanced_zh:
      '硅片 1 片（12.8 g → 减薄后 6.9 g，15 位 φ25 管芯 → 6 只）：硅 0.43 g/只（共 2.6 g）+ 钼片 0.12（烧结与磨削损耗按 0.2 kg 投）+ 铜 2 + 玻璃 1 + 45 钢 1 + 锡 0.1；余是磨掉的 320 µm 硅 5.9 g 与 9 只废管芯 4.1 g（斜角崩边、浆料不均、打穿）',
  },

  // ───────────────────────────────────────────────────────────────────────
  // 晶闸管：两版、两次高温，顺序与二极管相反
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * 1.6 kV / 500 A 晶闸管。
     *
     * 四层靠"铝先、磷后"排出来（问题二）：650 °C 的铝先进去 2 µm，
     * 1100 °C 的磷再把它推到 31 µm，同时自己在最表面留下 0.82 µm 的 n⁺。
     *
     *   ① 挑片、减薄 700 → 300 µm
     *   ② 正面蒸铝 1 µm → 合金 650、30 min → p⁺ 2 µm（整面，不用版）
     *   ③ 干氧 0.3 µm、1100、3 h —— 长磷的掩蔽层，同时把铝推到 ~25 µm
     *   ④ 版 1（n⁺ 阴极窗）：涂胶、曝光、显影、HF 开窗（最小特征 0.8 mm）
     *   ⑤ 刷磷釉 → 1100、5 h、氮气 → n⁺ 0.82 µm，铝到 31 µm（p 短基区）
     *   ⑥ HF 洗釉与氧化层
     *   ⑦ 版 2（电极窗）→ 蒸铝 → 反刻出阴极环与门极环（间距 0.5 mm）
     *   ⑧ 背面蒸铝 → 650 合金 → p⁺ 阳极 2 µm
     *   ⑨ 磨 0.87 mm 斜面、酚醛钝化
     *   ⑩ 钼片 + 压接 4.9 kN + 双面水冷
     *   ⑪ 分选：1.6 kV 阻断、500 A 通态压降、触发电流、dv/dt
     *
     * 石英舟按工具记（`mat/quartz-pure` 那条链的产物，1100 °C 磷气氛下会析晶、
     * 几百炉换一只），按"慢消耗"折一点进 uses，不单立条目 —— 与 `unblock-pyrometer.ts`
     * 第十二节"工装不进 uses"的口径相反，这里如实记，因为它真的会被磷吃掉。
     */
    id: 'make/hv-thyristor',
    name: '高压晶闸管制造',
    produces: [
      {
        item: 'std/hv-thyristor-general',
        qty: q(6),
        gives: [
          { param: 'ratedVoltage', kind: 'range', min: 1600, dir: 'atLeast' },
          { param: 'ratedCurrent', kind: 'range', min: 500, dir: 'atLeast' },
          { param: 'dvdt', kind: 'range', min: 200, dir: 'atLeast' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mars/regolith', qty: q(1) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(8) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(3) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 3) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(2) }] },
      // 2 片 φ25 × 2 mm 钼片 ×6 只 = 0.12 kg，含烧结损耗按 0.25 kg 投
      { anyOf: [{ item: 'mat/molybdenum-powder', qty: q(1, 4) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(8) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(2) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(2) }] },
      // 石英舟：慢消耗的工装（见上）
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1) }] },
    ],
    needs: ['std/photomask-general', 'plant/hv-test-bench', 'plant/metrology-room'],
    steps: [
      {
        note_zh: '挑片（300 V 漏电 <10 µA，吃一半）、减薄 700 → 300 µm（267 基区 + 31 基区 + 两次合金）',
        performedBy: 'plant/grinder',
      },
      { note_zh: '抛光去损伤层（cmp，压力 15–25）', performedBy: 'plant/cmp-polisher', under: [{ param: 'pressure', min: 15, max: 25 }] },
      { note_zh: '清洗（HF + 水）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 40 }] },
      { note_zh: '正面蒸铝 1 µm', performedBy: 'plant/evaporator', under: [{ param: 'pressure', min: 0.001, max: 0.01 }] },
      {
        note_zh: '铝合金 650、30 min → p⁺ 2 µm（整面，不用版）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 600, max: 700 }],
      },
      {
        note_zh: '干氧 0.3 µm、1100、3 h：① 长磷的掩蔽层 ② 把铝推到 ~25 µm',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 1080, max: 1100 }],
      },
      {
        note_zh: '版 1：n⁺ 阴极窗涂胶、曝光、显影、HF 开窗（最小特征 0.8 mm，5 µm 能力用掉不到 1 %）',
        performedBy: 'plant/mask-aligner',
      },
      { note_zh: '刷磷釉（风化层 + 碳 + 水；氧化层挡住不需要的地方）', performedBy: 'plant/robot' },
      {
        note_zh: '磷扩散 1100、5 h、氮气 → n⁺ 0.82 µm；同一次把铝推到 31 µm，p 短基区就是这么来的',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 1080, max: 1100 }],
      },
      { note_zh: 'HF 洗掉磷硅酸盐玻璃与氧化层', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 40 }] },
      { note_zh: '版 2：电极窗（阴极环 φ21 + 门极环 φ23–24，间距 0.5 mm），曝光、显影', performedBy: 'plant/mask-aligner' },
      { note_zh: '蒸铝 2 µm、反刻：阴极与门极两条电极分开（间距靠版）', performedBy: 'plant/evaporator', under: [{ param: 'pressure', min: 0.001, max: 0.01 }] },
      {
        note_zh: '背面蒸铝 1 µm → 合金 650、30 min → p⁺ 阳极 2 µm（背面用钢模板挡边）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 600, max: 700 }],
      },
      { note_zh: '磨 15° 斜面、宽 0.87 mm（W(1.6 kV) = 233 µm ÷ tan15°）；这一步决定 1.78 kV 能不能守住 1.6 kV', performedBy: 'plant/grinder' },
      {
        note_zh: '酚醛钝化、150–180 固化（斜面与门极沟都要盖住，否则爬电）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 150, max: 180 }],
      },
      {
        note_zh: '烧结两片钼片（1850–1950、氩、氧 <50 ppm）+ 磨平面，装玻璃绝缘环与铜法兰',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 1850, max: 1950 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      { note_zh: '压接 4.9 kN（10 MPa × 4.9 cm²），碟簧四只、扭矩 40 N·m 对角', performedBy: 'plant/press' },
      {
        note_zh: '分选：1.6 kV 阻断（漏电 <10 mA）、500 A 通态压降（≤1.5 V）、触发电流（2–5 A）、dv/dt（>200 V/µs）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '通 500 A、双面通水 1.2 m³/h，看 30 min 后结温（用热敏漆变色判 —— 没有热电偶能贴到结上）',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(120) },
    unbalanced_zh:
      '硅片 1 片（12.8 g → 减薄后 5.5 g，15 位 φ25 管芯 → 6 只）：硅 0.34 g/只（共 2.1 g）+ 钼片 0.12（损耗按 0.25 kg 投）+ 铜 8 + 玻璃 0.3 + 45 钢 0.3 + 石英 0.1 + 锡 0.2；余是磨掉的 400 µm 硅 7.3 g 与 9 只废管芯 3.3 g（对位偏差、斜面崩边、触发不合格）',
  },

  // ───────────────────────────────────────────────────────────────────────
  // 逆导晶闸管：同一套工序 + 双面刷釉 + 一块背面钢模
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * 1.6 kV / 500 A 逆导晶闸管（RCT）。
     *
     * 与晶闸管的差别只有三处，都写在步骤里：
     *   ① 版 1 的 n⁺ 阴极窗**只开 70 % 面积** —— 剩下 30 % 的 p 基区裸着，
     *      它就是反并联二极管的**正极**（顶面金属把 p 基区与阴极连在一起）
     *   ② 磷釉**双面刷** —— 底面的 n⁺ 就是二极管的**负极**
     *   ③ 背面 p⁺ 铝**只合金 70 %**（钢模手刷，目视片边 ±200 µm），
     *      剩下 30 % 的 n⁺ 露着，与阳极端子同一块金属
     *
     * 于是同一片硅上：晶闸管走 p⁺/n⁻/p/n⁺，二极管走 p(顶)/n⁻/n⁺(底) —— **反向就通**。
     *
     * 为什么这条能成而 GTO 不能成：**这里的分区是毫米级**（0.7 / 0.3 分，界面在管芯正中），
     * 目视对位 ±200 µm 只让面积比偏 5 %，不影响功能；GTO 的阳极短路点周期必须 ~L = 112 µm，
     * 对位要 ±15 µm，差 13 倍。**"能不能"就卡在这 13 倍上。**
     *
     * 它给的是反向通路（续流、逆变、斩波），不是"可关断" —— 关断仍然靠自然换流或强制换流。
     * 这一点不写清楚，下一个人会把它当成 GTO。
     */
    id: 'make/rc-thyristor',
    name: '逆导晶闸管制造',
    produces: [
      {
        item: 'std/rc-thyristor-general',
        qty: q(6),
        gives: [
          { param: 'ratedVoltage', kind: 'range', min: 1600, dir: 'atLeast' },
          { param: 'ratedCurrent', kind: 'range', min: 500, dir: 'atLeast' },
          { param: 'diodeShare', kind: 'range', min: 25, max: 35 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mars/regolith', qty: q(2) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 4) }] },
      { anyOf: [{ item: 'mat/water', qty: q(8) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(3) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 3) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(2) }] },
      { anyOf: [{ item: 'mat/molybdenum-powder', qty: q(1, 4) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(8) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(2) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(2) }] },
      // 背面钢模（0.5 mm 开窗钢板，重复用几十次）
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1) }] },
    ],
    needs: ['std/photomask-general', 'plant/hv-test-bench', 'plant/metrology-room'],
    steps: [
      { note_zh: '挑片、减薄 700 → 300 µm（与晶闸管同一条）', performedBy: 'plant/grinder' },
      { note_zh: '抛光去损伤层（cmp，压力 15–25）', performedBy: 'plant/cmp-polisher', under: [{ param: 'pressure', min: 15, max: 25 }] },
      { note_zh: '清洗（HF + 水）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 40 }] },
      {
        note_zh: '正面整面蒸铝 + 铝合金 650、30 min → p⁺ 2 µm',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 600, max: 700 }],
      },
      {
        note_zh: '干氧 0.3 µm、1100、3 h（掩蔽层 + 把铝推到 ~25 µm）',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 1080, max: 1100 }],
      },
      {
        note_zh: '版 1（**新画的一张**）：n⁺ 阴极窗只开 70 %，二极管区整片留 p 基区 —— 这是晶闸管与 RCT 的器件差别',
        performedBy: 'plant/mask-aligner',
      },
      { note_zh: '**双面**刷磷釉（底面的 n⁺ 就是二极管阴极）', performedBy: 'plant/robot' },
      {
        note_zh: '磷扩散 1100、5 h、氮气 → 两面 n⁺ 各 0.82 µm；铝到 31 µm',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 1080, max: 1100 }],
      },
      { note_zh: 'HF 洗掉两面的磷硅酸盐玻璃与氧化层', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 40 }] },
      {
        note_zh: '版 2 电极窗：阴极金属同时盖住 n⁺ 阴极环与二极管区的 p 基区（同电位），门极环单独引出',
        performedBy: 'plant/mask-aligner',
      },
      { note_zh: '蒸铝 2 µm、反刻', performedBy: 'plant/evaporator', under: [{ param: 'pressure', min: 0.001, max: 0.01 }] },
      {
        note_zh: '背面**钢模手刷铝浆**：只刷 70 %（晶闸管区），目视片边对位 ±200 µm → 650、30 min 合金成 p⁺；没刷的 30 % 保住 n⁺',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 600, max: 700 }],
      },
      { note_zh: '磨 15° 斜面 0.87 mm（与晶闸管同一条）', performedBy: 'plant/grinder' },
      {
        note_zh: '酚醛钝化、150–180 固化',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 150, max: 180 }],
      },
      {
        note_zh: '烧结钼片（1850–1950、氩、氧 <50 ppm）',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 1850, max: 1950 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      { note_zh: '压接与装壳（碟簧 4.9 kN、玻璃环、铜法兰）', performedBy: 'plant/press' },
      {
        note_zh: '分选：正向 1.6 kV 阻断、反向 1.6 kV 漏电、500 A 通态 1.5 V、反向 500 A 通态 1.6 V（二极管那一半）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(120) },
    unbalanced_zh:
      '硅片 1 片（15 位 → 6 只）：比晶闸管多 1 kg 风化层（双面刷）与一块 0.5 kg 钢模（重复用，不进成品）；余同晶闸管那条',
  },
  {
    /**
     * **100 kV 独立源：34 只 3 kV 整流器 + 34 组 25 nF/6 kV 石英叠片。**
     *
     *   整流器 34 + 石英 140 + 铝 5 + 铜 5 + PTFE 1 + SF₆ 2 → 源 1
     *
     * 与注入机的 hv-column 同一套设计；独立成件，是为了不拿被测机器给自己当源。
     * 140 kg 石英是 34 组 × 36 片 φ200 × 1.5 mm 的叠片 —— 这是本件最重的一笔。
     */
    id: 'make/hv-test-source-100k',
    name: '100 kV 独立源制造',
    produces: [
      {
        item: 'plant/hv-test-bench/source-100k',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 100000, max: 102000 },
          { param: 'current', kind: 'range', min: 22, max: 22 },
          { param: 'ripple', kind: 'range', min: 3, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/hv-rectifier-general', qty: q(34) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(140) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(5) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sf6', qty: q(2) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(80) },
    unbalanced_zh:
      '整流器 34 + 石英 140 + 铝 5 + 铜 5 + PTFE 1 + SF₆ 2 → 源 1；余是石英叠片切边（约 10 %）与铜排废料。34 级拆成 17 级全波，空载 102 kV、22 µA 时 100 kV',
  },
  {
    /**
     * **100 kV 分压器：10 只 10 kV 电阻单元串成 1 GΩ，1000:1。**
     *
     *   电阻丝 1 + 氧化铝 5 + PTFE 2 + 铜 1 + SF₆ 1 → 分压器 1
     *
     * 水电阻在 100 kV 上不能用：1 GΩ 水柱要 300 m、温漂 20 %；
     * 这里用电阻丝绕氧化铝骨架，SF₆ 里绝缘，精度 1–2 %。
     */
    id: 'make/hv-test-divider-100k',
    name: '100 kV 分压器制造',
    produces: [
      {
        item: 'plant/hv-test-bench/divider-100k',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 100000, max: 120000 },
          { param: 'ratio', kind: 'range', min: 1000, max: 1000 },
          { param: 'accuracy', kind: 'range', min: 1, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(5) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sf6', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(20) },
    unbalanced_zh:
      '电阻丝 1 + 氧化铝 5 + PTFE 2 + 铜 1 + SF₆ 1 → 分压器 1；余是骨架/电极废料。10 只 10 kV 单元串成 1 GΩ，分压比 1000:1，精度 1–2 %',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...HV_SEMI_ITEMS];
/**
 * 种子设备的装配路线 —— 第一台是运来的，第二台起由这条路线造。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件在条目的 `composedOf` 上。
 */
export const SEED_ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/hv-test-bench',
    name: '高压器件测试台装配',
    produces: [{
      item: 'plant/hv-test-bench',
      qty: q(1),
      gives: [
      { param: 'voltage', kind: 'range', min: 0, max: 100000, dir: 'atLeast' },
      { param: 'current', kind: 'range', min: 0, max: 2000, dir: 'atLeast' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...HV_SEMI_ROUTES, ...SEED_ASSEMBLY_ROUTES];
