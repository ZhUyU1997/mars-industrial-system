/**
 * SIMS（二次离子质谱）—— 本层第一个「纵向成分剖面」量具。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、这一份要解的开环：三个文件、四处「没人能测」
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ┌────────────────────┬──────────────────────────────────────┬──────────────────────────────┐
 * │ 文件               │ 现在那句话                           │ 本文件给什么                  │
 * ├────────────────────┼──────────────────────────────────────┼──────────────────────────────┤
 * │ implant.ts:1608    │ p⁺ 结深「只交区间 0.088–1.73 µm」     │ 剖面积分 + 坑深定标 ⇒         │
 * │                    │ （SRP / C-V / SIMS 全无，缺口⑧）      │ **一个数，±10 %**（§五）      │
 * │ gate-stack.ts:351  │ 结深 300–400 nm 对判据 20–30 nm，     │ 那 10–20 倍是**真的**，        │
 * │                    │ 「只能靠反向漏电间接判」              │ 只是第一次量得出来（§五末）   │
 * │ material/hafnium   │ `zrInHf` 800 ppm 是**分离链算的**，   │ Hf/Zr 比：比值 ±3 %、       │
 * │                    │ 薄膜里到底多少，没有人测过            │ 绝对值 ±30 %；氧空位**仍然   │
 * │                    │                                       │ 测不了**（§一 Q1）            │
 * │ ald.ts:481         │ 台阶覆盖 88–95 % 是**算的**           │ 成分剖面能测，**覆盖比仍测不  │
 * │                    │                                       │ 了**（那是形貌，不是成分）    │
 * └────────────────────┴──────────────────────────────────────┴──────────────────────────────┘
 *
 * ⚠️ 第四行必须直说：SIMS 测的是**深度方向的成分**，不是**深度方向的形状**。
 * 台阶覆盖要的是「侧壁上的膜厚 / 顶部的膜厚」，那是几何，SIMS 给不了 ——
 * 它给的是「侧壁那个点的成分随深度的变化」，而束斑 20 µm 打不到 10 nm 的侧壁上。
 * 所以本文件**不**声称解掉了 `ald.ts` 的保形性（那仍然等 0.25 nm 的 TEM），
 * 它解掉的是「膜里有什么、有多少、在哪个深度」。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、五个问题（每个都有数）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── Q1：Cs⁺ 还是 O₂⁺？—— **O₂⁺。不是"铯稀有"，是"铯只能一次性输入、没有本地分离链"** ──
 *
 * grep 结论（当时实测）：`id: 'mat/cesium'` **全表 0 命中**。现在它是一次性输入
 * （`data/material/cs-sb.ts`，无本地路线、不可复制），仍没有把铯分出来的那条链。
 * 当时全文只有一处提到铯，
 * 是 `particle-counter.ts:142` 的一句「Cs₃Sb 要**铯**与**锑**，当时 `mat/` 里两样都没有」。
 *
 * 火星有没有铯？**有，0.1–0.5 ppm**（风化层 K₂O 0.3–0.6 %（Pathfinder/Spirit）⇒ K 0.5–1 %，
 * 陨石里 Cs/K ≈ 2–5×10⁻⁵ ⇒ Cs 0.1–0.5 ppm）。所以 1 g 铯要 **2–10 t 土**（100 % 收率）
 * 到 **4–20 t 土**（50 % 收率）。这个数**比铪便宜**（`hafnium.ts` 1 kg HfO₂ 要 514 t 土，
 * 1 g Cs 只要它的 1/50），所以「火星没有铯」这句话是错的，不能拿它当理由。
 *
 * **真正的理由是化学**：铯在风化层里跟钾一起，分离要
 *   ① 霞石/锂云母浮选（要阳离子捕收剂 —— C8–C12 胺，本层有机碳只到 C1/C2，
 *      `hafnium.ts` §五 的 MIBK 断在同一条链上）；
 *   ② CsCl 分级结晶或 **SbCl₃ / I₂ 沉淀**（`mat/antimony` 现为一次性输入、无本地
 *      路线；`mat/iodine` 已有 `make/iodine`）；
 *   ③ 金属铯要钙热还原（`mat/calcium` 0 条目）或电解熔融 CsCl（要 700 °C 的氯盐槽）。
 * 三条都断。**所以 Cs⁺ 不是"这一层做不出源"，是"本地做不出料 —— 只能一次性输入"** —— 源本身反而最容易：
 * 表面电离的门槛是 Saha-Langmuir 的 (φ − I)/kT，钨的 φ = 4.55 eV、Cs 的 I = 3.89 eV
 * ⇒ 差 **0.66 eV**，而 1100 K 的 kT = 0.095 eV ⇒ 比值 7 ⇒ 电离度 **99.9 %**。
 * **一根本不用放电、二不用磁场：一根 1100 K 的钨带加一滴铯就是一个 100 % 电离的 Cs⁺ 源。**
 *
 * 结论：**O₂⁺（电子轰击，Nier 型），料是 `mat/oxygen`**（空气分离器在，氧是大宗气）。
 *
 * 代价（必须写清）：
 *   · O₂⁺ 给的是**正离子** M⁺ ⇒ 电正性元素（Si、Al、P、Hf、Zr、Ti、Fe…）全部测得了，
 *     而**本层要测的全在这一列**（P 与 Al 是两个掺杂剂，Hf/Zr 是栅介质）。
 *   · Cs⁺ 给的是**负离子** M⁻ ⇒ 电负性元素（O、F、Cl、H、C、S）才测得全，
 *     其中**氧空位/化学计量（HfO₁.₈ 对 HfO₂）只有 O⁻ 一条路**。
 *     ⇒ 这一格是本文件**唯一真正的功能缺口**（降级 D1），不是精度问题。
 *   · 还有一笔隐性的：O₂⁺ 一次束**自己往样品里注氧**（3 keV 的 O₂⁺ 在硅里建 3–5 nm 的
 *     SiO₂ 稳态层），所以**样品里的氧剖面永远被一次束的氧盖住** —— 这一条与上面那条
 *     是同一个物理的两种说法，D1 一并写。
 *
 * ── Q2：³⁰SiH⁺ 与 ³¹P⁺ —— **任何质谱都分不开，本文件也不假装分得开** ──────────
 *
 * 同位素质量（IUPAC 2021）：³¹P = **30.9737620** u；³⁰Si = 29.9737701 u；
 * H = 1.00782503 u ⇒ **³⁰SiH⁺ = 30.9815951 u**。两者只差
 *
 *     Δm = 30.9815951 − 30.9737620 = **0.00783 u = 7.83 mu**
 *     要分开：R = m/Δm = 30.97/0.00783 = **3954**（FWHM = Δm，10 % 谷）
 *                                   **6590**（FWHM = 0.6Δm，基线分开）
 *
 * **题目给的「HR-SIMS 到 3000」不够** —— 3000 的峰宽在 m = 31 上是
 * 31/3000 = 0.0103 u = **10.3 mu，比 7.83 还宽 32 %**，两峰仍是 25–30 % 的谷。
 * 这一句要正面写出来：**要 4000，不是 3000；要基线分开是 6600。**
 *
 * 四极杆给的是 R = 100 ⇒ 峰宽 **0.31 u = 310 mu，是那条缝的 40 倍**。
 * 所以本机**分不开这两个峰**，一个 u 都不假装分。那 P 怎么定量？—— 靠**丰度**，三条数：
 *
 *   ① **本层的 P 比干扰高 3 个量级。** 1e15 cm⁻² 的剂量摊在 0.15 µm 上是
 *      **6.7×10¹⁹ cm⁻³ = 1330 ppm**（对硅 5.0×10²²）。而 O₂⁺ 打硅的稳态表面上
 *      SiH⁺/Si⁺ = 1e-5（干的）～1e-4（带水的），³⁰Si⁺ = 0.0337 Si⁺ ⇒
 *      **³⁰SiH⁺ = 3.4×10⁻⁷ Si⁺**；P⁺ 的相对离子产额取 0.3 ⇒ 干扰折成浓度
 *      **1.1 ppm**。1330/1.1 = **1200 倍** —— 干扰是 P 信号的 0.08 %。
 *      ⇒ **结深那一格（1e18–1e20 cm⁻³ = 20–2000 ppm）完全不受这条影响。**
 *   ② **低浓度靠氢化物校正**：²⁸SiH⁺ 在 m/z 28.992，与 ²⁸Si⁺（27.977）差 1.015 u
 *      = 3.5 个峰宽，**R = 100 分得开** ⇒ ³⁰SiH⁺ = ²⁸SiH⁺ × (³⁰Si/²⁸Si = 0.0337)。
 *      校正后底噪 **0.3 ppm**，但 1 ppm 处的减法不确定度 **±40 %**（两个 3e-7 相减）。
 *   ③ **要到 0.01 ppm 以下，只有 R ≥ 4000 的磁扇**（本层 0 台，D2），
 *      或者「没有硅的样品」（本层不存在 —— 硅是基体）。
 *
 * **这就是与 `implant.ts` 的 P⁺ 降能同一个死结的正面回答**：那一处是"能量降下来、
 * 束流传输掉一档"，这一处是"质量差 7.8 mu、分辨差 40 倍" —— 两个都不是
 * 「机器再好一点」能解的，都是**判据本身要换个写法**：那边把"低能注入"换成
 * "低能注入 + 高温短时退火"，这边把"测 P"换成"测 P 减去 ²⁸SiH⁺ 的影子"。
 * 换写法之后**结论不变、置信度变了**：结深仍然是 0.152 µm（±10 %），
 * 而 1e17 cm⁻³ 以下的 P 尾巴只能报「≤ 1 ppm 当量」。
 *
 * ── Q3：3–10 nm 的深度分辨要什么？—— **坑底平坦度 0.3–1 %、能量 500 eV、门 30 µm** ──
 *
 * 深度分辨是四笔账之和（不是束斑）：
 *
 *   Δz = **原子混合**（≈ 2×一次离子在基体里的射程）+ **坑底不平**（平坦度 × 坑深）
 *        + **门内不匀**（门/光栅比 × 平坦度）+ **一次束的入射角散布**
 *
 *   3 keV 的 O₂⁺（1.5 keV/O）：Rp(O→Si) ≈ 3.5 nm ⇒ 混合项 **7 nm**
 *   500 eV 的 O₂⁺（250 eV/O）：Rp ≈ 1.2 nm ⇒ 混合项 **2.4 nm**  ← 低能压的就是这一项
 *
 *   平坦度：200 µm 光栅 + 30 µm 门（门 = 光栅的 15 %），数字光栅 512×512
 *   （步距 0.39 µm），束斑 60 µm 高斯、束流 ±2 % ⇒ **坑底 0.3–1 %**
 *   （0.5 % 的 200 nm 坑 = **1 nm**；0.5 % 的 20 nm 浅坑 = 0.1 nm，可以不计）
 *
 *   ⇒ **Δz(3 keV) ≈ 7 nm + 1 %·z**；**Δz(500 eV) ≈ 2.4 nm + 0.5 %·z**
 *      z = 100 nm：**8 nm / 3 nm**；z = 300 nm：10 / 4 nm；z = 1000 nm：17 / 7.5 nm
 *      ⇒ 「3–10 nm」在 **z ≤ 300 nm** 上成立；1.73 µm 的 p⁺ 结是 **24 nm**
 *      —— 对 ±5 % 的结深判据（86 nm）仍然够，所以这不是失败，是**适用范围**。
 *
 * **`plant/ion-beam-figuring` 的 Ar⁺ 束能不能干这个？不能，三条、每条带数：**
 *
 *   ① **气压差 5 个量级。** 它 holds **0.05–0.5 Pa**（`euv-mirror.ts:497`），
 *      而四极杆的上限是 1e-3 Pa、样品室 1e-6 Pa。0.1 Pa 下 Ar 的 λ = **80 mm**，
 *      柱长 200 mm 就是 2.5 个自由程 ⇒ **92 % 的离子至少被散射一次**
 *      （它自己写的是"散射一半、FWHM 从 12 mm 糊到 25 mm"，`euv-mirror.ts:488`）。
 *   ② **它是宽束，不是扫描束。** Kaufman 源的去除函数 **FWHM 12 mm → 25 mm**，
 *      没有光栅、没有消像散、没有 20 µm 的束斑；它的扫描靠**三轴台搬工件**（1 µm 定位）。
 *      拿它扫 200 µm 的坑，等于用拖把画眉毛。
 *   ③ **Ar⁺ 没有化学增强。** Si⁺ 的产额在 Ar⁺ 下比 O₂⁺ 下低 **10–30 倍**
 *      （O₂⁺ 建的 SiO₂ 表面把 Si⁺ 的离化率抬上去），而 RSF 的**可重复性**正是靠
 *      "每次都建同一个稳态氧化层" —— Ar⁺ 不给这一层。
 *
 * **它唯一能被借的地方**：剖面**做完之后**把坑底抛平（500 eV、±30°、自转，0.5–2 h），
 * 让下一次的坑底平坦度从 1 % 收到 0.5 %。这一条写进 `make/sims-sample-chamber` 的注释，
 * 不进任何路线的 `needs` —— 因为**它进不了 1e-6 Pa 的腔**，只能事后在它自己的腔里做。
 *
 * ── Q4：M/ΔM 100 的传输率，与信号/检出限 ────────────────────────────────────
 *
 * 四极杆的两笔传输（分开算，因为可加不可乘错）：
 *
 *   **光学传输**（样品 → 四极杆入口）：二次离子被 100 % 的提取场拉走（−150 V 提取极），
 *     进 f/8 的传输透镜 ⇒ **30 %**（其余打在光阑与四极杆的入口板上）
 *   **四极杆传输**（R = 100）：理想双曲面杆 **3–10 %**，本机圆杆（r_杆/r0 = 9/8 = 1.125，
 *     最优 1.13 ✓）取 **5 %**；R 降到 20 时可以换到 20–30 %，R 抬到 500 掉到 1 %
 *   ⇒ **净传输 1.5 %**（1.5 % = 0.30 × 0.05）
 *
 * 周期数（这是 R 的全部来源）：N = f·L/v，m/z 30 在 10 eV 轴向能量上
 * v = √(2×10 eV/31 u) = **8020 m/s** ⇒ N = 2.26 MHz × 0.2 m / 8020 = **56.4 个射频周期**。
 * 理想 R ≈ N²/20 = **159**，交付按 **100** 记（杆的偏心 10 µm、射频场的不圆度、
 * 10 eV 束的 ±0.5 eV 能量散布，三笔吃掉 37 %）。
 * ⚠️ **R 随质量变好**（N ∝ √m）：m/z 300 上 N = 178、R ≈ 1590 —— 所以四极杆从来不是
 * "全质量段刚好 100"，而是"**低质量端卡在 100，高质量端富余一个量级**"。
 *
 * 信号账（3 keV 工作点，53 nA、Y = 2、200 µm 光栅）：
 *
 *   溅射掉的原子   3.3×10⁻⁸ cm/s × 4×10⁻⁴ cm² × 5×10²² = **6.6×10¹¹ 原子/s**
 *   Si⁺（离化率 1e-2）× 1.5 %  ⇒ **9.9×10⁷ 计数/s** = **16 pA**（→ 法拉第杯）
 *   P at 1330 ppm（相对产额 0.3）⇒ **4.0×10⁴ 计数/s**（→ 电子倍增器）
 *   ³⁰SiH⁺ 本底 = 9.9e7 × 3.4e-7 = **34 计数/s**（倍增器的暗计数 0.5 只占 1.5 %）
 *   检出限 = 3√(34+0.5) = 17.6 计数/s（1 s）⇒ **0.6 ppm**（= 1.2e17 cm⁻³）
 *
 *   500 eV 档（1.0 nA、Y = 0.4）：Si⁺ 3.8e5/s、P(1330 ppm) 1.5e2/s、³⁰SiH⁺ 0.13/s
 *   ⇒ 这时**限制的不是氢化物，是泊松**：0.13+0.5 = 0.63 计数/s 的 3σ = 2.4 计数
 *   ⇒ 检出限 **10 ppm**（1 s）；换 100 s 率表 ⇒ 2 ppm
 *   **深度分辨从 7 nm 换到 2.4 nm 的代价是检出限差 17 倍** —— 这就是为什么要三档。
 *
 * **答：M/ΔM 100 配 1.5 % 净传输；ppm 级检出限要一次束 ≥ 30 nA**（5 nA 时
 * 检出限掉到 6 ppm，1 nA 时 32 ppm）。这就是"为什么本机要 53 nA 而不是 5 nA"。
 *
 * ── Q5：RSF 能不能自建？—— **能，±8 %；这是"定量"，不是"半定量"** ────────────
 *
 * RSF 的定标式（面密度形式）：∫ I_m(z) dz = dose_m / SF_m ⇒ SF 只吃两个数：
 * **剂量** 与 **深度标尺**。
 *
 *   ① **剂量 ±5 %**（`plant/ion-implanter` 自带法拉第杯）。理由不是"相信它"，是**真空**：
 *      60 keV 的 Al⁺ 在 N₂ 里的电荷交换截面 σ ≈ 1e-15 cm²，本层注入机 1e-5–1e-4 Pa
 *      ⇒ n = 2.5×10¹⁰ cm⁻³ ⇒ λ = 1/(nσ) = **400 m**，束线 2 m ⇒ **中性化 0.5 %**。
 *      （工业机 1e-3 Pa ⇒ λ 40 m ⇒ 中性化 5 % —— `implant.ts` 给 ±25 % 的窗口
 *      是**记账保守**，不是测出来的误差。）
 *   ② **深度标尺 ±3–5 %**：坑深两条路 —— `plant/interferometer`（0.295 µm/条纹，
 *      读 1/50 条纹 = 6 nm）判 200–1000 nm 的坑到 **±3 %**；`plant/fib-tem`（4 nm 束斑
 *      剖面）判 20–100 nm 的浅坑到 **±5 nm**。
 *   ③ **片内均匀性 ±3 %**（注入机 2–4 %）
 *   ⇒ RSF = **±8 %**（√(5²+5²+3²) = 7.7）。**这就是定量。**
 *
 *   ④ **比值更好**：Hf/Zr 用同一个基体、同一次束流、同一天做 ⇒ 剂量与传输率全约掉，
 *      **比值 ±3 %**。`hafnium.ts` 的 `zrInHf ≤ 800 ppm` 是**分离链算的**，
 *      本机第一次让它变成**量的**。
 *   ⑤ **没有标准的元素只能借 RSF**：Hf、Zr、Ti 没有自建标准（注入机要 HfCl₄ 做料，
 *      而 `mat/hafnium-chloride` 不在本轮的料表里）⇒ **±30–50 %**，D10。
 *      替代方案（本层做得到）：**ALD 的 HfO₂ 膜**，厚度由椭偏仪 0.01 nm 定、
 *      密度取 9.68 g/cm³ ±3 % ⇒ 面密度 2.6×10¹⁶ cm⁻² **±5 %** —— 但那只在
 *      HfO₂ 基体里成立（基体效应，D12）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、白名单（本文件自己划的，违者 tsc 过、审查不过）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   投料  **17 种，全在**：mat/silicon-wafer · mat/oxygen · mat/argon · mat/nitrogen ·
 *         mat/water · mat/quartz-pure · mat/glass · mat/aluminium · mat/copper ·
 *         mat/copper-wire · mat/gold · mat/steel-45 · mat/sheet-steel ·
 *         mat/tungsten-powder · mat/molybdenum-powder · mat/phenolic-resin · mat/hf
 *         ＋**一处引用别人的工件**（不是本文件产的）：`measure/sims-depth-profile`
 *         吃 `mat/rtp-annealed-wafer`（`implant.ts` 的退火片，`category: 'part'`）——
 *         那一格正是"把区间量成一个数"的对象。
 *         （白名单里还有 mat/cesium（**一次性输入**，Q1；无本地路线）、mat/iron、iron-ht200/250/300、
 *          mat/refractory、mat/lime、mat/silica、mat/slag、mat/tailings、mars/regolith、
 *          mat/mineral-wool、mat/tin、mat/silver、mat/carbon —— **一条都没用上**：
 *          本文件不炼金属、不配酸，只装配与量测；`mat/hf` 的那 0.02 kg 是钝化液）
 *         ⚠️ **mat/tin、mat/silver 不用**：锡与银都是"测得出"的元素，进束线会变成空白。
 *   std/  **9 种**：std/quartz-resonator-general · std/counter-chip-general ·
 *         std/opamp-chip-general · std/zener-reference-general · std/hv-rectifier-general ·
 *         std/hv-thyristor-general · std/galvanometer-general · std/calibrated-scale-100 ·
 *         std/wire-die-general
 *         （**不用 `std/cpu-32bit-general`**：质量扫描是锯齿波 + 10 圈电位器，
 *          锁峰是模拟的峰值保持 —— 与 `cd-sem.ts` §七 同一个选择）
 *   设备  **20 台，全在 102 台里**：lathe · plant/press · plant/forge · plant/grinder ·
 *         plant/winder · plant/sheet-shop · plant/wet-bench · plant/robot ·
 *         plant/resistance-furnace · plant/diffusion-furnace · plant/ion-implanter ·
 *         plant/rta · plant/metrology-room · plant/euv-vacuum · plant/mfc ·
 *         plant/rf-13m56 · plant/comparator · plant/interferometer ·
 *         plant/probe-station · plant/ellipsometer
 *         （16 台在 `performedBy`/`steps` 里；`needs` 里另有 5 台是条件与标准
 *          —— comparator、euv-vacuum、mfc、metrology-room，加 interferometer
 *          （它两边都有：柱与四极杆的等距靠它，量测的坑深也靠它））
 *
 *   ⚠️ **本文件新建的 `plant/sims` 不进 `performedBy`，也不进任何零件路线的
 *   `needs`** —— 与 `ellipsometer.ts:1353`（"95 台白名单不含第 96 台"）和
 *   `cd-sem.ts:379` 是同一个处理。它只出现在**量测路线**的 `needs` 里
 *   （`measure/sims-depth-profile`），属于"前提是设备"那一类，
 *   执行者填 `plant/robot`。**零件路线里一次都不许出现 `plant/sims`** —— 那是本轮
 *   被点名 20 多次的错（自己装自己）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、氧分压落在两个圈上（本文件是"有氧"的那一台）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 已建的三件氧量具（`oxygen-metrology.ts`）测的是**流动气体**里 1e-15–0.21 atm 的氧，
 * 它们的取样流量是 0.1 L/min、样品池 1 cm³ —— **测不了 1e-6 Pa 的腔**。SIMS 的氧分压
 * 分成两个圈，两个圈都有数：
 *
 *   圈一 源内 O₂：**1e-2–1 Pa**，由 `plant/mfc` 直接给（0–200 sccm、±1 %FS = ±2 sccm）
 *        —— 一次束的氧分压是本机**最确定的一个数**（±2 %），因为它就是流量。
 *   圈二 腔内残余：**1e-6 Pa 总压**、其中 O₂ 1–10 % ⇒ p(O₂) = 1e-7 Pa。
 *        这个数**测得了**（这一点与 `cd-sem.ts` 的 D7 不同）：把腔**回填**到 1e5 Pa，
 *        取 1 L 气样送 `plant/oxygen-probe`（它的下界 1e-15 atm）——
 *        稀释比 1e5/1e-7 = **1e12** ⇒ 探针读到 **1e-12 atm**，比下界高 3 个量级 ✓
 *        代价：一次取样 1 L（腔容积 100 L 的 1 %）+ 探针 10 min ⇒ **逐批可做，不可在线**。
 *   圈三 样品里的氧：**测不了**（O₂⁺ 一次束自己注氧，O⁻ 的背景就是一次束的 1e-2）
 *        ⇒ 氧空位/化学计量这一格进降级表 D6，兜底是 #23 的老路（Cs⁺ 或 ¹⁸O 示踪，
 *        两样本层都没有）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、降级与升级（R8：十二处，一一对应）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ┌──┬─────────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
 * │  │ 降级                            │ 代价（带数）              │ 升级（R8）                       │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D1│ 没有 Cs⁺ 源（`mat/cesium`   │ O⁻/F⁻/Cl⁻/H⁻/C⁻ 全测不了 │ 风化层提 Cs：0.1–0.5 ppm ⇒ 4–20 t│
 * │  │ 是一次性输入、无本地路线）  │ ⇒ **氧空位、HfO₁.₈、F 沾污**│ 土/g，再要霞石浮选（C8–C12 胺）  │
 * │  │ ⇒ 只有正离子通道            │ 三格是"看不见"，不是"差"  │ + SbCl₃/I₂ 沉淀（Sb 一次性、I 有）│
 * │  │                             │                           │ + 钙热还原（Ca 0 条）：缺 Cs 源与 Ca│
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D2│ 四极杆 R = 100，³⁰SiH⁺/³¹P⁺ 差   │ P 的检出限被氢化物压在    │ 磁扇 + 静电分析器 R = 4000–6600  │
 * │  │ 7.83 mu，要 R = 3954            │ **1.1 ppm**（题目给的 3000│ （200 mm 半径、50 µm 缝、5 kV/   │
 * │  │                                 │ 也不够，要 4000）         │ 1e-5 稳定度）：缺一整台双聚焦机  │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D3│ 500 eV 上亮度只给 1 nA（20 µm）  │ 溅射率 **0.005 nm/s** ⇒   │ 双等离子/液态金属源（B_r 高 100 │
 * │  │ 因为 B_r = 20 A/(m²·sr·V)       │ 20 nm 的剖面要 4000 s     │ 倍）+ 8 级差分抽气的低能柱       │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D4│ 深度分辨 = 混合项 + 0.5–1 %·z   │ 1 µm 处 **17 nm**（判据    │ 样品旋转（旋涂台）+ 200 eV +     │
 * │  │                                 │ 3–10 nm 只到 z ≤ 300 nm） │ 光栅缩到 100 µm：混合项降 1.5 nm│
 * │  │                                 │                           │ 缺口是"旋转台 + 更低的能量"       │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D5│ `ion-beam-figuring` 进不了腔     │ 0.05–0.5 Pa 对 1e-6 Pa、  │ 差分抽气的 Kaufman 源（8 级、     │
 * │  │ （0.05–0.5 Pa、FWHM 12 mm）     │ λ = 80 mm 对 200 mm 柱长；│ 0.1 Pa → 1e-5 Pa）+ 静电光栅：   │
 * │  │ 只能事后抛平坑底                │ 且它是宽束，没有 20 µm 束斑│ 缺一台差分泵组 + 一套扫描板      │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D6│ 氧空位/化学计量测不了（#23 圈三）│ HfO₂ 的 O/Hf 只能是"工艺  │ Cs⁺ + O⁻（= D1），或 ¹⁸O₂ 示踪   │
 * │  │                                 │ 窗口"，不是数；±0.2 个    │ （`mat/oxygen-18` 0 条目：要一套 │
 * │  │                                 │ 化学计量单位              │ ¹⁸O 的富集塔，同位素分离 1.004）│
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D7│ 没有电离规（全层 0 台）          │ 腔内 1e-6 Pa 靠压升法反推 │ 皮拉尼到 0.1 Pa、电离规要 1e-7 Pa│
 * │  │                                 │ **±30 %**（1 h 关阀看压升）│ 的钨丝 + 1 pA 微电流放大：两件都缺│
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D8│ 氢的覆盖度没有标准，³⁰SiH⁺ 的    │ 1 ppm 处的 P 读数 **±40 %**│ 进样前 200 °C/12 h 烘烤 + 液氮   │
 * │  │ 校正本身带 ±40 %                │ （两个 3e-7 相减）        │ 冷阱（−196 °C，`xenon-loop` 有   │
 * │  │                                 │                           │ −196 °C 那一段，但要接进腔）     │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D9│ 绝缘膜（HfO₂/SiO₂）充电，用     │ 峰位漂 **0.3–1 u/10 min** │ 低能（<20 eV）电子枪 + 磁场约束  │
 * │  │ 500 eV 电子泛射中和             │ ⇒ 质量轴要每 5 min 重锁   │ 的泛射：缺一套 20 eV 的枪与磁铁  │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D10│Hf/Zr/Ti 没有自建标准，只能借    │ 绝对值 **±30–50 %**；      │ HfCl₄ 注入（`mat/hafnium-chloride`│
 * │  │ 同族元素的 RSF                 │ 比值仍 ±3 %               │ 有，但不在本轮料表）+ 一条 Zr 的 │
 * │  │                                 │                           │ 注入标准：缺口是一张料表         │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D11│质量轴的温漂：r0 的热膨胀        │ 1 K ⇒ **1 %**（R = 100 上 │ 恒温 19–21 °C（metrology-room    │
 * │  │ 11×10⁻⁶/K                      │ 是 0.01 u）+ 电子漂移     │ 已有 ✓）+ 用 ²⁸Si⁺ 做锁峰：      │
 * │  │                                 │ ⇒ 每片重锁一次            │ 缺一台锁峰用的参考气/参考峰      │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D12│基体效应：Si⁺ 的 RSF 随一次束    │ 0.5 → 3 keV 之间 **2 倍** │ 固定能量（±2 %）+ 每批一条标准片 │
 * │  │ 能量变（稳态氧化层的厚度变）    │ ⇒ 不固定能量就测不准      │ ⇒ 已写进路线（`rate` 与 `under`）│
 * └──┴─────────────────────────────────┴───────────────────────────┴──────────────────────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、已知缺口（都是"现在没有"，不是"暂未实现"）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **没有负离子通道**（D1）：D1 那一格不是精度，是**一个量具类别**。
 *   ② **没有 R > 200 的质量分析器**（D2）：P、SiH、C₂H₃ 这一族同量异位素，
 *      本层永远只能"用丰度差去猜"，不能"分开看"。
 *   ③ **没有电离规**（D7）：1e-6 Pa 是算的。这一条与 `e-beam-column` 缺口④、
 *      `mask-repair` 缺口⑤ 是同一处，本文件没有解掉它。
 *   ④ **台阶覆盖仍然判不了**：SIMS 测成分不测形貌。`ald.ts:481` 那一格要的是
 *      **侧壁/顶部膜厚比**，那是 0.25 nm 的 TEM（`cd-sem.ts` D8/D9），不是本机。
 *   ⑤ **没有 ¹⁸O、没有 Ca；Sb 是一次性输入、I 已有路线**：D1 与 D6 的升级路线仍卡在
 *      这四张料表上（Cs 源、¹⁸O、Ca；Sb 不可复制）。
 *   ⑥ **Hf/Zr 的绝对 RSF 没有标准**（D10）：比值 ±3 % 但绝对值 ±30–50 %。
 *   ⑦ **本机不在 `performedBy` 里**（§二）：`measure/sims-depth-profile` 的执行者写
 *      `plant/robot`，本机在 `needs`。这不是偷懒，是 102 台白名单的边界；
 *      接线时若要把它升成第 103 台，只需把那一行的 `performedBy` 换掉。
 *   ⑧ **`rate` 不含排队**：量测一条剖面 0.5–3 h 是机时，不是周转。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、接线：主 agent 要改的那几行（本文件不动别人的文件）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① `tools/report.ts` 加 import 与展开：
 *      `import { SIMS_ITEMS, SIMS_ROUTES } from '../data/machine/sims.ts';`
 *      然后 `items: [...SIMS_ITEMS]`、`routes: [...SIMS_ROUTES]`。
 *   ② `implant.ts:1608` 那一格：「p⁺ 结深 0.088–1.73 µm」改成
 *      「**0.152 µm ±10 %（SIMS 实测，`measure/sims-depth-profile`）**；
 *       区间 0.088–1.73 µm 变成**退火前的不确定度**，不再是成品值」。
 *      1615 行那句「把 D 收到一个数上要更准的温度计」可以保留 —— 它仍然是
 *      **为什么**这个区间存在，只是现在有了一个直接读数。
 *   ③ `implant.ts:325/:354` 缺口⑧ 改成过去时并指向本文件（#16）。
 *   ④ `gate-stack.ts:915` 那一行：「结深测不了」改成「**SIMS 可测到 ±10 %**，
 *      300–400 nm 那 10–20 倍是**量的**，不是算的」。
 *   ⑤ `material/hafnium.ts:218` 的 `zrInHf ≤ 800 ppm`：加一句
 *      「薄膜里的比值由 `plant/sims` 量，比值 ±3 %、绝对值 ±30 %」。
 *   ⑥ `ald.ts:481` **不要改**（见 §五④）。
 *   ⑦ 设备表加第 103 台（若要）—— 但那时 `performedBy` 那一行可以换回本机。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、十个零件
//
// 顺序就是离子走的路：源 → 柱（滤质 + 光栅）→ 样品（进样、腔、台、泛射）→
// 四极杆（杆 + 射频）→ 探测（法拉第杯 / 倍增器）→ 计数 → 标准片。
// ═══════════════════════════════════════════════════════════════════════════

export const SIMS_PARTS: readonly Item[] = [
  /**
   * **一次离子源。Nier 型电子轰击源，发 O₂⁺。**
   *
   * 它是 `implant.ts` 的 `plant/ion-implanter/source` 的**同一个原理、两个数量级**
   * 的那一台：那边要 µA（注入靠剂量），这边要 nA（溅射靠时间）。所以腔体小、
   * 放电弱、孔径小，但**灯丝与放电室的形状完全一样** —— 不重写第二套手艺。
   *
   *   O₂ 进 0.02–0.5 sccm（`plant/mfc`，±1 %FS）
   *   电子 100 eV / 1–5 mA，电离截面 σ(O₂ → O₂⁺) ≈ 1.5×10⁻¹⁶ cm²
   *   ⇒ 电离效率 ~1e-3，引出 0.25–5 kV，束流 **5–90 nA**
   *
   * 四个数：
   *   beamCurrent   ≥5 nA（亮度极限给的，见下）
   *   brightness    **20 A/(m²·sr·V)** —— 解析式的全部输入：
   *                 I = B_r·V·(π²/4)·α²·d²，α = 10 mrad
   *                 ⇒ 3 keV/φ60 µm 给 **53 nA**、500 eV/φ20 µm 给 **1.0 nA**
   *                 （这两个数就是全机的两个工作点，§一 Q3/Q4）
   *   energy        250–5000 eV（低能档 500 eV 是压窄混合项的唯一手段）
   *   gasFlow       0.02–0.5 sccm（0.05 sccm 跑 4 h 只要 17 mg 氧）
   *
   * ⚠️ 灯丝是**耗材**：φ0.15 的钨丝在 1e-2 Pa 的氧里 200 h 烧掉 40 % 截面
   * （氧把钨变成 WO₃ 挥发）。所以灯丝**一次做 6 根**（2 支源各一根装机，4 根备用），
   * 与 `make/eb-cathode` 的"一炉 6 根"同一个批量 —— 但这里**不进 `consumption`**：
   * 模型里的 `consumption` 要 `category: 'consumable'` 的条目，而灯丝是零件（可换）。
   */
  {
    id: 'plant/sims/primary-source',
    name: '二次离子质谱仪一次离子源',
    unit: '件',
    category: 'part',
    props: [
      { param: 'beamCurrent', kind: 'range', min: 5, max: 90, unit: 'nA', dir: 'atLeast' },
      { param: 'brightness', kind: 'range', min: 15, max: 30, unit: 'A/(m²·sr·V)', dir: 'atLeast' },
      { param: 'energy', kind: 'range', min: 250, max: 5000, unit: 'eV', dir: 'atLeast' },
      { param: 'gasFlow', kind: 'range', min: 0.02, max: 0.5, unit: 'sccm' },
    ],
  },

  /**
   * **一次柱：双静电透镜 + Wien 滤质器 + 八极光栅/消像散。**
   *
   * Wien 滤质器是**这一层已有的东西**：`plant/mask-repair/mass-filter` 就是它
   * （`mask-repair.ts` 里 Au⁺/Si⁺ 的分选靠同一组正交的 E×B）。本机要它做的
   * 事情简单得多 —— **只分 O⁺(16) 与 O₂⁺(32)**，R = 2 就够，所以 E/B 的稳定度
   * 只要 1 %（而 FIB 那边要 15 % 的传输率、1e-3 的稳定度）。
   *
   * 三个数，每一个都对着一个物理：
   *   beamDiameter  **5–100 µm**：色差项 d_c = C_c·α·ΔE/E。3 keV、ΔE = 2 eV
   *                 （Wien 把源的 15 eV 散开切到 ±1 eV）、C_c = 50 mm、α = 10 mrad
   *                 ⇒ d_c = 0.33 µm —— 20 µm 的束斑是**亮度**给的，不是像差给的
   *   rasterSize    **50–300 µm**：数字光栅 512×512，步距 = 光栅/512
   *                 （200 µm ⇒ 0.39 µm）；门取光栅的 15 %
   *   transmission  **30 %**：提取 100 %（−150 V 拉）+ 光阑与像差的损失
   *
   * ⚠️ **束线里一滴铝都不许有**：Al 是本层两个掺杂剂之一（`implant.ts` 的 p⁺ 是 Al⁺），
   * 一次束打在铝电极上会把它溅到样品上，**整台机器的 Al 空白就从 0.05 ppm 变成 100 ppm**。
   * 所以光阑是钼（`mat/molybdenum-powder`）、电极是 45 钢、绝缘子是石英 —— 没有铝。
   * 这一条与 `cd-sem.ts` 的"光阑用钼不用铜"是同一类决定：**量具的材料表由被测元素定**。
   *
   * ⚠️ 还有一条更阴的：**45 钢是铁磁的**。剩磁 1 mT 在 200 mm 上把 5 eV 的二次离子
   * 吹走 **11 mm**（y = ½(qvB/m)t²，v(31 u, 5 eV) = 5.6 km/s，t = 36 µs）。
   * 所以柱与四极杆的**壳体、杆、座全部要非磁**（μ_r ≤ 1.01）：杆用钼、座用石英、
   * 法兰用 45 钢但**退火去磁并加一层 1 mm 的软铁屏蔽**（`e-beam-column` 同一个做法）。
   */
  {
    id: 'plant/sims/primary-column',
    name: '二次离子质谱仪一次柱',
    unit: '件',
    category: 'part',
    props: [
      { param: 'beamDiameter', kind: 'range', min: 5, max: 100, unit: 'µm', dir: 'atMost' },
      { param: 'rasterSize', kind: 'range', min: 50, max: 300, unit: 'µm' },
      { param: 'transmission', kind: 'range', min: 20, max: 40, unit: '%', dir: 'atLeast' },
      { param: 'energy', kind: 'range', min: 250, max: 5000, unit: 'eV', dir: 'atLeast' },
    ],
    composedOf: [
      { item: 'plant/sims/primary-column/lens-tube', qty: q(2) },
      { item: 'plant/sims/primary-column/aperture', qty: q(1) },
      { item: 'plant/sims/primary-column/wien-electrode', qty: q(2) },
      { item: 'plant/sims/primary-column/wien-yoke', qty: q(1) },
      { item: 'plant/sims/primary-column/wien-coil', qty: q(1) },
      { item: 'plant/sims/primary-column/scan-electrode', qty: q(8) },
      { item: 'plant/sims/primary-column/quartz-insulator', qty: q(1) },
    ],
  },

  /**
   * **样品室：1e-6 Pa 的腔 + 三轴台 + 泛射电子枪 + 观察窗。**
   *
   * 它是全机**最难的一件**，但难点不在真空，在**三件互相打架的尺寸**：
   *
   *   要 1e-6 Pa        ⇒ 抽气面要大（φ300 的腔、两道涡轮）
   *   要 200 µm 光栅     ⇒ 台要能走 100 mm、定位 1 µm（`calibrated-scale-100`）
   *   要 ±1° 的入射角    ⇒ 台的 Z 要能调、法线要能校（离子束的入射角偏 1°，
   *                       溅射率变 cos1° = 0.9998 可忽略，但**坑底的斜坡**会变成
   *                       1 % 的深度不匀 —— 与平坦度同一笔账）
   *
   * 泛射枪（500 eV 电子、10 µA）是**绝缘样品专用**：HfO₂ 与 SiO₂ 上的正电荷会把
   * 5 eV 的二次离子全部拉回去（信号掉 90 % 以上），所以测氧化物**必须**中和。
   * 代价写在 D9：500 eV 的电子本身会在样品上留下 0.3–1 u 的峰位漂。
   */
  {
    id: 'plant/sims/sample-chamber',
    name: '二次离子质谱仪样品室',
    unit: '件',
    category: 'part',
    props: [
      { param: 'basePressure', kind: 'range', min: 1e-8, max: 1e-6, unit: 'Pa', dir: 'atMost' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-6, unit: 'Pa·L/s', dir: 'atMost' },
      { param: 'stageRange', kind: 'range', min: 50, max: 150, unit: 'mm' },
      { param: 'positionError', kind: 'range', min: 0, max: 1, unit: 'µm', dir: 'atMost' },
      { param: 'floodCurrent', kind: 'range', min: 1, max: 20, unit: 'µA', dir: 'atLeast' },
    ],
  },

  /**
   * **四极杆：四根 φ9.0 × 200 mm 的钼杆，场半径 r0 = 4.0 mm，石英座。**
   *
   * 这是全机的中心，也是全文件三个数最要紧的一处：
   *
   *   **L = 200 mm、r0 = 4.0 mm、f = 2.26 MHz、V = 1771 V(0-p) @ m/z 300**
   *
   * 三条式子把它们钉在一起（推导在 §一 Q4）：
   *
   *   N = f·L/v(m)，v = √(2E_z/m) ⇒ **N ∝ √m**，m/z 30 上 N = 56.4
   *   R ≈ N²/20 ⇒ 理想 159、交付 100（杆偏心 10 µm + 场不圆 + ±0.5 eV 能量散）
   *   V = 0.706·m·r0²·ω²/(4e) ⇒ **5.90 V/u** ⇒ m/z 300 = 1771 V(0-p)，
   *        杆间 3.54 kV pp；直流 U = (a/q)·V/2 = 0.336·V/2 ⇒ 297 V @300
   *
   * ⚠️ **为什么 f 是 2.26 MHz 而不是 `plant/rf-13m56` 的 13.56**：
   * V ∝ (r0·f)²，13.56 MHz 上要保持 1771 V 就得把 r0 压到 **0.59 mm**
   * （杆 φ1.3 mm、位置公差 ±5 µm）——机械上做不出来。反过来，13.56 的
   * **÷6 = 2.26 MHz** 正好落在 4 mm 的杆上，而 ÷6 只要一只 `std/counter-chip-general`
   * 的三分频级联 —— **本层唯一的频率源就是那台 13.56 MHz，所以 f 只能是它的分数频**。
   * （÷8 = 1.695 MHz 也试过：V(300) 降到 996 V 好看，但 N(30) = 42.3 ⇒ R = 89，
   * 差 11 % 不到 100。这一句是这台机器"参数是咬合的、不是挑的"的证据。）
   *
   * ⚠️ **圆杆不是双曲面**：r_杆/r0 = 1.125（理论最优 1.13），所以边际场有
   * 六极矩与八极矩，R 再掉 10–15 % —— 这一笔已经算进 100 里了。
   */
  {
    id: 'plant/sims/quadrupole',
    name: '二次离子质谱仪四极杆',
    unit: '组',
    category: 'part',
    props: [
      { param: 'rodLength', kind: 'range', min: 190, max: 210, unit: 'mm' },
      { param: 'fieldRadius', kind: 'range', min: 3.9, max: 4.1, unit: 'mm' },
      { param: 'massRange', kind: 'range', min: 1, max: 300, unit: 'u' },
      { param: 'resolution', kind: 'range', min: 100, max: 400, unit: 'M/ΔM', dir: 'atLeast' },
      { param: 'transmission', kind: 'range', min: 3, max: 10, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * **射频驱动：2.26 MHz、3.5 kV pp 的正弦 + 0–300 V 的直流，两者的比要 1e-4。**
   *
   * 这一件是全机的"标尺"，它的稳定度直接就是质量的稳定度：
   *
   *   Δm/m = ΔV/V ⊕ ΔU/U ⊕ 2Δr0/r0 ⊕ 2Δf/f
   *   峰宽是 1 %（R = 100 在 m = 31 上是 0.31 u），而峰的**位置**要稳到峰宽的 1/100
   *   ⇒ Δm/m ≤ **1e-4** ⇒ **V 与 U 的比要稳到 1e-4**
   *   ⇒ U 从 `std/zener-reference-general`（±5 ppm）分压，V 从同一只稳压管
   *     经 `std/hv-rectifier-general` 升到 1.8 kV —— **同一个基准，比值才稳**
   *
   * 频率那一路单独说：2.26 MHz 不是自激的，是 **13.56 MHz ÷ 6**，
   * 由 `std/quartz-resonator-general` 的晶振（±20 ppm）与 `std/counter-chip-general`
   * 的三分频级联给。±20 ppm 的频率误差 = Δm/m 4e-5（m = 31 上是 0.001 u），可以忽略。
   *
   * 四个数：
   *   frequency   2.26 MHz（13.56/6）   rfAmplitude  ≥1800 V(0-p)
   *   dcAmplitude ≥300 V                stability   ≤0.01 %（V 与 U 的比）
   */
  {
    id: 'plant/sims/rf-driver',
    name: '二次离子质谱仪射频驱动',
    unit: '台',
    category: 'part',
    props: [
      { param: 'frequency', kind: 'range', min: 2.2, max: 2.32, unit: 'MHz' },
      { param: 'rfAmplitude', kind: 'range', min: 1800, max: 2200, unit: 'V(0-p)', dir: 'atLeast' },
      { param: 'dcAmplitude', kind: 'range', min: 300, max: 400, unit: 'V', dir: 'atLeast' },
      { param: 'stability', kind: 'range', min: 0, max: 0.01, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * **法拉第杯：大信号的那一半（≥1e5 计数/s 全走它）。**
   *
   * 一个杯加一只抑制极（−100 V，把二次电子赶回去），**没有增益** ——
   * 它的好处正是"没有增益"：增益是漂的，而 RSF 的绝对值不能漂。
   *
   *   基体 Si⁺ 在 3 keV 工作点上是 **16 pA**（9.9e7 计数/s）
   *   ⇒ 用 `std/galvanometer-general`（1e-11 A 的分辨）直接读
   *   ⇒ 噪声 0.1 pA ⇒ 对 16 pA 是 **0.6 %**（1 s）—— 与计数统计同量级
   *
   * 两个数：`noise ≤0.1 pA`、`maxCurrent ≥100 nA`（基体在 5 keV、90 nA 时会到 30 pA，
   * 留 3000 倍余量给"没调好"的那一天）。
   *
   * ⚠️ 杯的位置在**四极杆之后**：进杯的已经是选过质量的离子。杯与倍增器之间是
   * 一块可切的板（`plant/robot` 换），**同一时刻只有一个探测器在光路上** ——
   * 这不是省事，是"1e7 计数/s 的基体打到倍增器上会在 3 s 内把它打疲劳"。
   */
  {
    id: 'plant/sims/faraday-cup',
    name: '二次离子质谱仪法拉第杯',
    unit: '只',
    category: 'part',
    props: [
      { param: 'noise', kind: 'range', min: 0, max: 0.1, unit: 'pA', dir: 'atMost' },
      { param: 'maxCurrent', kind: 'range', min: 100, max: 500, unit: 'nA', dir: 'atLeast' },
      { param: 'efficiency', kind: 'range', min: 95, max: 100, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * **电子倍增器：小信号的那一半，16 级铝打拿极。**
   *
   * 打拿极（dynode）为什么是**铝**：本层没有 BeCu（铍、铜合金：Be 0 条目），
   * 没有铅玻璃（连续打拿极的通道板要铅），也没有 CsI（Cs 是一次性输入，
   * CsI 路线未建；Q1 那条链）。
   * 剩下的只有铝 —— 而铝**恰好够**：空气里长的 Al₂O₃ 的二次电子产额
   * δ = 2–3（150–300 eV 的入射电子），15 级的 2.5¹⁵ = 9.3e5，加上第一级
   * 被打拿极的离子轰击产额 δ_ion ≈ 4 ⇒ **总增益 3.7×10⁶**。
   *
   *   第一级 5 kV（离子 → 电子）、其后每级 200 V、末级收集
   *   3.7e6 个电子 = **590 fC** 的脉冲；10 ns 的脉宽上是 59 µA
   *   ⇒ 50 Ω 上 **3 mV** ⇒ 对 1.5 mV 的鉴别阈值是 2 倍裕度、对 0.5 mV 的噪声是 6 倍
   *
   * 三个数：
   *   gain       1e6–1e7（16 级 × δ2.5 + 第一级的离子产额）
   *   darkCount  **≤0.5 计数/s**（铝的氧化层放气与场致发射；热噪声在这个增益下
   *              可以忽略，暗计数就是这把尺的底）
   *   life       2000 h（打拿极被 1e7 计数/s 的基体打过 100 h 后 δ 掉 30 % ——
   *              所以基体永远走法拉第杯，见上）
   *
   * ⚠️ 它是**全机唯一的铝件**，而它在下游 400 mm、离子只往一个方向走 ⇒
   * 铝回不到样品上。这一条要写在这里，否则"束线里没有铝"那句话会被这段打脸。
   */
  {
    id: 'plant/sims/electron-multiplier',
    name: '二次离子质谱仪电子倍增器',
    unit: '只',
    category: 'part',
    props: [
      { param: 'gain', kind: 'range', min: 1e6, max: 1e7, unit: '倍', dir: 'atLeast' },
      { param: 'darkCount', kind: 'range', min: 0, max: 0.5, unit: '计数/s', dir: 'atMost' },
      { param: 'life', kind: 'range', min: 2000, max: 5000, unit: 'h', dir: 'atLeast' },
    ],
  },

  /**
   * **计数链：鉴别器 + 100 MHz 计数器 + 模拟率表。**
   *
   * 它要做三件事，三件都是"没有 CPU"的做法（同 `cd-sem.ts` §七）：
   *
   *   ① 鉴别：5 mV 的脉冲对 0.5 mV 的噪声 ⇒ 阈值 1.5 mV，`std/opamp-chip-general`
   *      的一级比较器；死时间 **10 ns**（100 MHz 的上限 ⇒ 1e7 计数/s 时损失 10 %，
   *      这一笔在 RSF 里是**一个固定系数**，不是误差）
   *   ② 计数：`std/counter-chip-general` 的 4 级 16 位级联
   *   ③ 率表：10 Hz–100 kHz 的 RC 平均（1 s、10 s、100 s 三档）
   *      —— **深剖面的 100 s 档是"低浓度、慢扫"唯一可用的档**
   *
   * 三个数：countRate ≥100 MHz、deadTime ≤10 ns、threshold 0.5–5 mV。
   */
  {
    id: 'plant/sims/pulse-counter',
    name: '二次离子质谱仪计数链',
    unit: '台',
    category: 'part',
    props: [
      { param: 'countRate', kind: 'range', min: 100, max: 200, unit: 'MHz', dir: 'atLeast' },
      { param: 'deadTime', kind: 'range', min: 0, max: 10, unit: 'ns', dir: 'atMost' },
      { param: 'threshold', kind: 'range', min: 0.5, max: 5, unit: 'mV' },
    ],
  },

  /**
   * **进样室：φ100 的片从 1e5 Pa 进 1e-6 Pa，不破主腔的真空。**
   *
   * 它是"每片 25 min"这个数的来源，也是本机吞吐量的上限：
   *
   *   腔 5 L、泵 60 L/s ⇒ 抽到 1e-4 Pa 要 t = (5/60)·ln(1e5/1e-4) = 0.083×20.7 = **1.7 s**
   *   但**放气**（片上的水与胶）在 1e-3 Pa 以下变成限速：
   *   1e-4 Pa 的放气面 100 cm²、放气率 1e-7 Pa·L/(s·cm²) ⇒ 平衡压强 **1e-5 Pa**
   *   ⇒ 烘 60 °C/20 min 后 15 min 到 1e-5 Pa，合计 **25 min/片**
   *
   * 三个数：cycleTime ≤30 min、leakRate ≤1e-7 Pa·L/s、waferSize ≥100 mm。
   */
  {
    id: 'plant/sims/load-lock',
    name: '二次离子质谱仪进样室',
    unit: '套',
    category: 'part',
    props: [
      { param: 'cycleTime', kind: 'range', min: 10, max: 30, unit: 'min', dir: 'atMost' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-7, unit: 'Pa·L/s', dir: 'atMost' },
      { param: 'waferSize', kind: 'range', min: 100, max: 150, unit: 'mm', dir: 'atLeast' },
    ],
  },

  /**
   * **RSF 标准片：Al⁺ 60 keV 注入的两片硅（5e14 与 5e15 cm⁻²）。**
   *
   * 它是这台机器从"半定量"变成"定量"的**全部来源**（§一 Q5）。三个数决定它：
   *
   *   dose       5e14 / 5e15 cm⁻²（两个点，覆盖 1e19–1e20 cm⁻³ 那一段）
   *   energy     60 keV ⇒ Rp = 65 nm（Al 在 Si 里，比 B 的 130 nm 浅一半 ——
   *              `implant.ts:1598` 同一个数），所以峰在 65 nm、尾巴到 200 nm
   *   screenOxide 10 nm 的热氧化层：**挡不住 60 keV 的 Al**（Rp 65 nm 在它后面），
   *              但把表面从"溅射过的硅"变成"化学氧化层"，RSF 的可重复性靠它
   *
   * ⚠️ **为什么是 Al 而不是 P、B、As**：P 是单同位素（³¹P 100 %），它的干扰
   * ³⁰SiH⁺ 在 Q2 里已经算过是 1.1 ppm；而 **B 与 As 本层根本没有**
   * （`implant.ts` 的 p⁺ 用 Al 顶 B、n⁺ 用 P）。所以能自建的 RSF 只有
   * **Al 与 P** 两条 —— 而 Al 恰好就是那个"结深量不出来"的掺杂剂，**一件事两用**。
   */
  {
    id: 'plant/sims/rsf-standard',
    name: 'RSF 标准片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'dose', kind: 'range', min: 1e14, max: 1e16, unit: 'cm⁻²' },
      { param: 'energy', kind: 'range', min: 55, max: 65, unit: 'keV' },
      { param: 'screenOxide', kind: 'range', min: 8, max: 12, unit: 'nm' },
      { param: 'uniformity', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
      { param: 'rsfAccuracy', kind: 'range', min: 0, max: 10, unit: '%', dir: 'atMost' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、工件（不是零件：没有装进任何机器，是**被量过**的片）
// ═══════════════════════════════════════════════════════════════════════════

export const SIMS_SAMPLES: readonly Item[] = [
  /**
   * **带剖面的片（"带证书的片"）。**
   *
   * 与 `oxygen-metrology.ts` 的 `mat/nitrogen-characterized` 同一个形状：
   * 量测路线的产物不是"信息"，是**一片被判过的片** —— 因为模型里没有"读数"
   * 这个类别，只有物件。所以这一片的 `props` 就是那张证书的字段。
   *
   * 四个字段，每个都对着一个开环：
   *   junctionDepth   **0.088–1.73 µm 的区间收成一个数**（`implant.ts:1608`）
   *   doseMeasured    由 ∫I dz/SF 给的剂量（与注入机记的 1.5–2.5e15 独立）
   *   hfZrRatio       薄膜里的 Hf/Zr（`hafnium.ts` 的 `zrInHf` 的**实测版**）
   *   depthResolution 这一次剖面自己能达到的 Δz（**读数必须自带误差**）
   */
  {
    id: 'mat/sims-profiled-wafer',
    name: '剖面样品片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'junctionDepth', kind: 'range', min: 0, max: 2000, unit: 'nm', dir: 'atMost' },
      { param: 'doseMeasured', kind: 'range', min: 1e12, max: 1e16, unit: 'cm⁻²' },
      { param: 'hfZrRatio', kind: 'range', min: 0, max: 10000, unit: 'ppm' },
      { param: 'depthResolution', kind: 'range', min: 1, max: 50, unit: 'nm' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 三、整机（composedOf，没有产出路线）
// ═══════════════════════════════════════════════════════════════════════════

/**
 * **SIMS。一台"把纵向成分量到 3 nm 深度分辨、ppm 检出限"的量具。**
 *
 * 十个零件（`composedOf`），**没有产出路线** —— 与 `plant/cd-sem`、
 * `plant/ellipsometer`、`plant/fib-tem` 同一个形状：**有 composedOf 就不许有
 * 产出路线**（`mixed_production`），因为"空间组合"与"不可逆加工"是两件事。
 *
 * 所以下面这些读数**是设计的结论，不是某条路线交付的实测值**（算式全在文件头）。
 *
 * 三档工作点（这是本机的全部本事，别的都是它的推论）：
 *
 *   ┌──────────┬────────┬────────┬────────┬────────┬────────┬──────────┐
 *   │ 档       │ 能量   │ 束流   │ 光栅   │ 溅射率 │ Δz     │ 检出限   │
 *   ├──────────┼────────┼────────┼────────┼────────┼────────┼──────────┤
 *   │ 快       │ 3 keV  │ 53 nA  │ 200 µm │0.33 nm/s│ 8 nm  │ 0.6 ppm  │
 *   │ 深       │ 3 keV  │ 90 nA  │ 300 µm │0.45 nm/s│ 10 nm  │ 1.5 ppm  │
 *   │ 浅（高分辨）│500 eV │ 1.0 nA │ 100 µm │0.005nm/s│ 2.4 nm │ 10 ppm   │
 *   └──────────┴────────┴────────┴────────┴────────┴────────┴──────────┘
 *   （检出限一律按 1 s 计；浅档换 100 s 率表是 2 ppm）
 *
 * ⚠️ **它不进 `performedBy`**（102 台的白名单不含第 103 台，§二），也**不进任何
 * 零件路线的 `needs`** —— 包括造它自己零件的那十条（本轮被点名 20 多次的错）。
 * 它只在 `measure/sims-depth-profile` 的 `needs` 里出现一次。
 */
export const SIMS: Item = {
  id: 'plant/sims',
  name: '二次离子质谱仪',
  unit: '台',
  category: 'machine',
  holds: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
  props: [
    { param: 'massRange', kind: 'range', min: 1, max: 300, unit: 'u' },
    { param: 'resolution', kind: 'range', min: 100, max: 400, unit: 'M/ΔM', dir: 'atLeast' },
    { param: 'transmission', kind: 'range', min: 1, max: 10, unit: '%', dir: 'atLeast' },
    { param: 'primaryCurrent', kind: 'range', min: 1, max: 90, unit: 'nA', dir: 'atLeast' },
    { param: 'primaryEnergy', kind: 'range', min: 250, max: 5000, unit: 'eV' },
    { param: 'beamDiameter', kind: 'range', min: 5, max: 100, unit: 'µm', dir: 'atMost' },
    { param: 'rasterSize', kind: 'range', min: 50, max: 300, unit: 'µm' },
    { param: 'sputterRate', kind: 'range', min: 0.005, max: 1, unit: 'nm/s' },
    { param: 'depthResolution', kind: 'range', min: 2.4, max: 20, unit: 'nm', dir: 'atMost' },
    { param: 'craterFlatness', kind: 'range', min: 0.3, max: 1, unit: '%', dir: 'atMost' },
    { param: 'detectionLimit', kind: 'range', min: 0.3, max: 10, unit: 'ppm', dir: 'atMost' },
    { param: 'rsfAccuracy', kind: 'range', min: 0, max: 10, unit: '%', dir: 'atMost' },
  ],
  composedOf: [
    { item: 'plant/sims/primary-source', qty: q(2) },
    { item: 'plant/sims/primary-column', qty: q(1) },
    { item: 'plant/sims/sample-chamber', qty: q(1) },
    { item: 'plant/sims/quadrupole', qty: q(1) },
    { item: 'plant/sims/rf-driver', qty: q(1) },
    { item: 'plant/sims/faraday-cup', qty: q(1) },
    { item: 'plant/sims/electron-multiplier', qty: q(2) },
    { item: 'plant/sims/pulse-counter', qty: q(1) },
    { item: 'plant/sims/load-lock', qty: q(1) },
    { item: 'plant/sims/rsf-standard', qty: q(2) },
    // 真空、温度、气路都不是零件，是**别的机器**：`plant/euv-vacuum`（1e-8–1 Pa）、
    // `plant/metrology-room`（19–21 °C）、`plant/mfc`（0–200 sccm）在零件路线里
    // 当 `needs` 出现。它们比本机先坏、也装不进本机 —— 与 `cd-sem.ts` 同一个处理。
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// 四、路线：十件零件 + 两片标准 + 一条量测
//
// 每一段的执行者都在 102 台里；每一条产出路线都逐项写 `gives`
// （`prop_missing_gives` 会逐项核）。
// ═══════════════════════════════════════════════════════════════════════════

export const SIMS_ROUTES: readonly Route[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 4.1 一次源
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **一次源：车放电室 → 绕灯丝 → 装石英绝缘子与引出极 → 通气标流量 → 量束流。**
     *
     *   石英 1.5 + 45 钢 6 + 钨粉 0.2 + 铜 0.5 + 铜线 0.15 + 酚醛 0.3 + 水 6
     *     → 一次源 2 支（另带 6 根备用灯丝）
     *
     * 五步里**只有一步是本文件新的**：引出极的孔径与位置。它的三个数互相咬：
     *
     *   孔径 φ0.5 mm、引出间隙 3 mm、引出 250 eV–5 kV
     *   ⇒ 束流 5–90 nA（亮度 20 A/(m²·sr·V) 下由后级光阑裁）
     *   ⇒ 若孔径 φ1.0：束流翻 4 倍，但源的 **1e-2 Pa 气**漏进柱的量翻 4 倍 ⇒
     *     柱里的本底从 1e-6 涨到 4e-6 Pa ⇒ 二次离子的散射本底涨 4 倍
     *     **这就是 φ0.5 的来源：不是束流不够，是气太多。**
     */
    id: 'make/sims-primary-source',
    name: '二次离子质谱仪一次离子源制造',
    rate: { hours: q(34) },
    produces: [
      {
        item: 'plant/sims/primary-source',
        qty: q(2),
        gives: [
          { param: 'beamCurrent', kind: 'range', min: 20, max: 60 },
          { param: 'brightness', kind: 'range', min: 18, max: 26 },
          { param: 'energy', kind: 'range', min: 250, max: 5000 },
          { param: 'gasFlow', kind: 'range', min: 0.05, max: 0.2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(3, 2) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(6) }] },
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(3, 20) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(3, 10) }] },
      { anyOf: [{ item: 'std/hv-rectifier-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(1) }] },
      // HF 是**钝化用的**，0.02 kg：不钝化的不锈钢放气率高 10 倍，
      // 而 1e-6 Pa 只给它 3 倍余量（§一 Q3 与 4.3 的抽气账）。
      { anyOf: [{ item: 'mat/hf', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(6) }] },
    ],
    needs: ['plant/metrology-room', 'plant/euv-vacuum', 'plant/mfc'],
    steps: [
      {
        note_zh: '车放电室（φ40×60、陶瓷衬里座）、引出极 φ0.5 与 3 mm 间隙、五道 CF 法兰',
        performedBy: 'lathe',
      },
      {
        note_zh: '绕 φ0.15 的钨丝 8 圈（V 形，长 25 mm）并氢中 1800 再结晶 —— 与 make/eb-cathode 同一道火',
        performedBy: 'plant/winder',
      },
      {
        note_zh: '装石英绝缘子（φ30×40）与引出极；酸洗钝化（HF 0.5 %）去焊渣与氧化皮',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh: '通气标流量：0.02–0.5 sccm 用 plant/mfc 的 0–200 sccm 档，±1 %FS ⇒ ±2 sccm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '抽到 1e-5 Pa、点火、量束流与束斑：3 keV 下 φ60 µm 判 ≥20 nA、500 eV 下 φ20 µm 判 ≥1 nA（亮度极限）',
        performedBy: 'plant/robot',
        under: [
          { param: 'temperature', min: 19, max: 21 },
          { param: 'pressure', min: 1e-6, max: 1e-5 },
        ],
      },
    ],
    unbalanced_zh:
      '石英 1.5 + 45 钢 6 + 钨粉 0.2 + 铜 0.5 + 铜线 0.15 + 酚醛 0.3 → 一次源 2 支（约 8 kg/支）；HF 0.02 与 6 kg 水走掉（钝化与清洗液）。电子件按件计，不折质量',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4.2 一次柱
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **柱：车透镜筒与光阑座 → 轧/研钼光阑 → 装 Wien 与八极 → 打压升法检漏。**
     *
     *   45 钢 5 + 钼粉 0.1 + 铜 0.6 + 石英 0.8 + 铜线 0.3 + 水 8 → 柱 1 套
     *
     * **Wien 滤质器只分 O⁺ 与 O₂⁺**，所以它的两个数比 `mask-repair` 的松 10 倍：
     *
     *   v(O₂⁺, 3 keV) = √(2×3000×1.602e-19/32u) = **1.35×10⁵ m/s**
     *   正交场里的径向力 q(E − vB) = 0 ⇒ **B = E/v**：取 B = **0.2 T**（电磁铁，
     *   铜线绕组 + 45 钢扼铁）⇒ E = vB = **2.7×10⁴ V/m = 27 V/mm**
     *   O⁺ 的速度是 O₂⁺ 的 √2 倍 ⇒ 它要 38 V/mm 才过 ⇒ **E 扫 ±20 % 只过 O₂⁺** ✓
     *
     * ⚠️ 磁场为什么用**电磁铁**而不是永磁体：E/B 的比要稳到 1 %，而永磁体的
     * 剩磁温度系数 **0.1 %/K** ⇒ 1 K 就把质量轴推 0.1 %（0.03 u）。电磁铁的绕组
     * 与极板共用一只 `std/zener-reference-general` 的基准 —— **同一个基准，比值才稳**。
     *
     * 八极扫描板的灵敏度（这一条反直觉，必须算）：θ = E·L/(2E_z)，L = 60 mm、
     *   E_z = 3 keV ⇒ 扫 ±100 µm（300 mm 落点上 0.67 mrad）只要 **±0.8 V**（12 mm 极距）。
     *   **所以扫描电源要的是"稳"不是"功率"** —— 而地磁场 0.05 mT 把 **5 eV 的二次离子**
     *   在 200 mm 上吹 **0.56 mm**（是四极杆 r0 = 4 mm 的 14 %）⇒ **磁屏蔽不是可选项**
     *   （两层 1 mm 软铁 + 退火去磁，与 `e-beam-column` 同一个做法）。这一条与四极杆
     *   用钼不用 45 钢是同一个理由的两面。
     */
    id: 'make/sims-primary-column',
    name: '二次离子质谱仪一次柱制造',
    rate: { hours: q(42) },
    produces: [
      {
        item: 'plant/sims/primary-column',
        qty: q(1),
        gives: [
          { param: 'beamDiameter', kind: 'range', max: 60 },
          { param: 'rasterSize', kind: 'range', min: 100, max: 200 },
          { param: 'transmission', kind: 'range', min: 25, max: 35 },
          { param: 'energy', kind: 'range', min: 250, max: 3000 },
        ],
      },
    ],
    // 透镜筒、光阑、Wien、扫描板、绝缘子在条目 composedOf 上；
    // 铜线是接线，水是研磨/清洗，钨针是研孔工具。
    uses: [
      { anyOf: [{ item: 'mat/copper-wire', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(8) }] },
    ],
    needs: ['plant/metrology-room', 'plant/euv-vacuum', 'plant/comparator', 'std/wire-die-general'],
    steps: [
      {
        note_zh: '装两节透镜筒、光阑座、Wien 极板/磁轭、八极扫描板与石英绝缘子；全程非磁区装配',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '检漏与对中：压升法反推 1e-6 Pa（±30 %）；比较仪量同心 0.02、量 3 keV 下 φ60 µm 的束斑',
        performedBy: 'plant/robot',
        under: [
          { param: 'temperature', min: 19, max: 21 },
          { param: 'pressure', min: 1e-6, max: 1e-5 },
        ],
      },
    ],
    unbalanced_zh:
      '45 钢 5 + 钼粉 0.1 + 铜 0.6 + 石英 0.8 + 铜线 0.3 → 柱 1 套（约 12 kg）；8 kg 水走掉（研磨与清洗）。电子件按件计',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4.3 样品室
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **样品室：卷筒焊法兰 → 装台与泛射枪 → 装观察窗与法兰 → 抽到 1e-6 Pa。**
     *
     *   钢板 60 + 45 钢 12 + 铜 3 + 石英 0.6 + 水 40 → 样品室 1 套
     *
     * 与 `make/cd-sem-column` 是同一条手艺（8 mm 钢板折弯 + 焊 + 车 CF 法兰 +
     * 铜垫密封），但**这一个的难点是"三件互相打架的尺寸"**（§一 Q3）：
     *
     *   抽气面：φ300×250 的腔 = **0.38 m²**（筒 0.24 + 两端 0.14），钝化过的
     *     放气率 1e-8 Pa·L/(s·cm²) ⇒ 气载 3.8×10⁻⁵ Pa·L/s；两道 60 L/s 的涡轮
     *     ⇒ **3.2×10⁻⁷ Pa** —— 对 1e-6 Pa 只有 **3 倍余量**。
     *     ⚠️ 这一条就是"腔必须烘"的全部理由：没烘过的不锈钢放气率 1e-6
     *     ⇒ 3.8×10⁻³ Pa·L/s ⇒ **3×10⁻⁵ Pa，差 30 倍**。所以腔体空载时
     *     150 °C/24 h 烘，而**进样室只敢 60 °C**（样品是光刻胶，见 §四 D8）
     *   台：100 mm 行程、1 µm 定位（`std/calibrated-scale-100` 的 φ100 刻度 + 20 分游标）
     *   法线：样品面与一次束的夹角 **≤1°**（偏 1° ⇒ 坑底斜坡 1.7 %，与平坦度同一笔账）
     *
     * ⚠️ 泛射枪是**绝缘样品专用**（500 eV、10 µA），而它自己要一个**独立的**
     * 电位参考：样品在 −150 V 的提取电位上，泛射电子要从 0 V 打到 −150 V 上
     * ⇒ 枪的阴极在 −650 V。这一条决定了高压引线要三组（提取、泛射、抑制）。
     */
    id: 'make/sims-sample-chamber',
    name: '二次离子质谱仪样品室制造',
    rate: { hours: q(70) },
    produces: [
      {
        item: 'plant/sims/sample-chamber',
        qty: q(1),
        gives: [
          { param: 'basePressure', kind: 'range', min: 1e-7, max: 1e-6 },
          { param: 'leakRate', kind: 'range', max: 1e-6 },
          { param: 'stageRange', kind: 'range', min: 100, max: 100 },
          { param: 'positionError', kind: 'range', max: 1 },
          { param: 'floodCurrent', kind: 'range', min: 5, max: 15 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(60) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(12) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(3) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(3, 5) }] },
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(1, 50) }] },
      { anyOf: [{ item: 'std/calibrated-scale-100', qty: q(1) }] },
      { anyOf: [{ item: 'std/hv-rectifier-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(40) }] },
    ],
    needs: ['plant/metrology-room', 'plant/euv-vacuum'],
    steps: [
      {
        note_zh: '卷筒焊纵缝与六个接管、车六道 CF 法兰与铜垫密封槽（同心 0.05）',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh: '酸洗钝化（HF 0.5 %）：不钝化的筒壁放气率差 10 倍 ⇒ 1e-6 Pa 到不了',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '装三轴台（100 mm、1 µm、刻度 std/calibrated-scale-100）与法线校准（夹角 ≤1°，比较仪读）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '装泛射枪（500 eV、10 µA，阴极 −650 V）与观察窗；压升法检漏 1e-6 Pa·L/s（±30 %，D7）',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
    ],
    unbalanced_zh:
      '钢板 60 + 45 钢 12 + 铜 3 + 石英 0.6 → 样品室 1 套（约 78 kg）；HF 0.02 与 40 kg 水走掉（钝化液）。电子件按件计',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4.4 四极杆
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **四极杆：车四根钼杆（φ9.0、直线度 5 µm）→ 研磨与抛光 → 装石英座 → 量场半径。**
     *
     *   钼粉 0.45 + 石英 0.4 + 铜 0.3 + 45 钢 1.8 + 金 0.002 + 水 6 → 四极杆 1 组
     *
     * 四根杆的**位置公差是整台机器最紧的一个数**，而且可以直接算：
     *
     *   场不圆度 δr/r0 = ε ⇒ 质量的相对误差 Δm/m ≈ 2ε
     *   要在 R = 100 上不掉（Δm/m ≤ 1 %）⇒ **ε ≤ 0.5 % = 20 µm**
     *   再紧一档（ε ≤ 0.25 % = 10 µm，交付按这个）：R 可以走到 160
     *
     * 杆的直线度同理：**5 µm/200 mm = 25 µrad**，等效于场半径恒定的 0.13 % —— 够。
     *
     * 材料为什么是钼（三个理由，每个都是别的材料不行）：
     *   ① 45 钢是铁磁的：1 mT 的剩磁把 5 eV 的离子在 200 mm 上吹 11 mm（§一 Q3 末）
     *   ② 铜的溅射产额是钼的 4 倍，而且铜的二次离子产额随氧化变 ⇒ 空白不稳
     *   ③ 钼粉这条线已经在了（`euv-metals.ts`），钼杆从它热压 + 旋锻 + 拉拔，
     *      与 `make/cd-sem-aperture` 的钼片是同一炉料
     */
    id: 'make/sims-quadrupole',
    name: '二次离子质谱仪四极杆制造',
    rate: { hours: q(56) },
    produces: [
      {
        item: 'plant/sims/quadrupole',
        qty: q(1),
        gives: [
          { param: 'rodLength', kind: 'range', min: 200, max: 200 },
          { param: 'fieldRadius', kind: 'range', min: 3.96, max: 4.04 },
          { param: 'massRange', kind: 'range', min: 1, max: 300 },
          { param: 'resolution', kind: 'range', min: 120, max: 160 },
          { param: 'transmission', kind: 'range', min: 4, max: 6 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/molybdenum-powder', qty: q(9, 20) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(2, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(9, 5) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 500) }] },
      { anyOf: [{ item: 'std/wire-die-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(6) }] },
    ],
    needs: ['plant/metrology-room', 'plant/comparator', 'plant/interferometer'],
    steps: [
      {
        note_zh: '热压 + 旋锻 + 拉拔 φ9.0 的钼杆四根（长度 200，端面垂直度 10 µm）',
        performedBy: 'plant/forge',
      },
      {
        note_zh: '车与研磨：直线度 5 µm/200、圆度 2 µm、表面 0.1 µm（抛光是让场的边缘不抬）',
        performedBy: 'plant/grinder',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '装石英座（四杆的孔位在同一个座上车出来 —— 分开装就凑不出 10 µm）；金箔做射频接触',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '量场半径与平行度：比较仪量 4.00±0.02、干涉仪量四杆的等距（判 ≤10 µm = 0.25 %）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '钼粉 0.45 + 石英 0.4 + 铜 0.3 + 45 钢 1.8 + 金 0.002 → 四极杆 1 组（约 3 kg）；6 kg 水与磨削的钼粉（约 0.15 kg）走掉',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4.5 射频驱动
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **射频驱动：绕谐振线圈 → 搭 2.26 MHz 振荡（13.56/6）→ 装 U/V 同基准分压 → 校稳定度。**
     *
     *   铜线 1.2 + 45 钢 2 + 酚醛 0.4 + 金 0.002 + 水 4 → 驱动 1 台
     *   + 高压整流 1、晶闸管 2、稳压管 2、晶振 1、计数片 2、运放 2
     *
     * 三个数，一层咬一层：
     *
     *   ① **频率 2.26 MHz = 13.56 MHz ÷ 6**。÷6 = 两级三分频（`std/counter-chip-general`
     *      的 ÷3 级联两次），输入是 `plant/rf-13m56` 的晶振。这是本层唯一能拿到
     *      2 MHz 级的频率源 —— 自激 LC 振荡器的漂是 1e-3，而质量轴要 1e-4。
     *   ② **V 与 U 同基准**：U 从 `std/zener-reference-general`（±5 ppm）分压，
     *      V 从同一只管子经 `std/hv-rectifier-general` 升到 1800 V。
     *      "同一个基准"是这句的全部：两个独立电源的漂不相干，比值稳不到 1e-4。
     *   ③ **稳定度 ≤0.01 %**（V/U 的比）—— 它对应 Δm/m 的 1e-4 与 0.003 u。
     *
     * ⚠️ 线圈的 Q：L = 40 µH、C = 124 pF ⇒ f = 1/(2π√(LC)) = **2.26 MHz** ✓
     * Q = ωL/R = 568 Ω / 7 Ω = **80** ⇒ 3.5 kV pp 在槽里只耗
     * V_rms²/(QωL) = 1252²/45.4 kΩ = **35 W**。
     * **所以功率不是问题（`plant/rf-13m56` 的 500 W 绰绰有余），频率才是** ——
     * 它给的是 13.56 MHz，而那张杆上要的是 2.26 MHz。这一台因此是**自己的功放**，
     * rf-13m56 只借晶振与频率计数（它在这里是"频率的标准"，不是"功率的源"）。
     */
    id: 'make/sims-rf-driver',
    name: '二次离子质谱仪射频驱动制造',
    rate: { hours: q(38) },
    produces: [
      {
        item: 'plant/sims/rf-driver',
        qty: q(1),
        gives: [
          { param: 'frequency', kind: 'range', min: 2.25, max: 2.27 },
          { param: 'rfAmplitude', kind: 'range', min: 1900, max: 2100 },
          { param: 'dcAmplitude', kind: 'range', min: 320, max: 360 },
          { param: 'stability', kind: 'range', max: 0.008 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper-wire', qty: q(6, 5) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(2) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(2, 5) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 500) }] },
      { anyOf: [{ item: 'std/quartz-resonator-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/hv-rectifier-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/hv-thyristor-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(4) }] },
    ],
    // ⚠️ `plant/rf-13m56` **只在最后一道工序里当执行者**，不写进 `needs` ——
    // 两处同义就是 `redundant_need`（第三条）。它在这里的作用是
    // "用它的频率计数去判本机的 2.26 MHz"，是一道工序，不是一个在场的前提。
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '绕 40 µH 的谐振线圈（φ60、24 匝 φ1.5 铜管，Q = 80）与 124 pF 的瓷片组',
        performedBy: 'plant/winder',
      },
      {
        note_zh: '搭 2.26 MHz 振荡：13.56 MHz 晶振 ÷3 ÷3，锁相到 LC 的强迫振荡',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '装 U/V 同基准分压（稳压管 ±5 ppm → 高压整流 1.8 kV）与保护（晶闸管 2 只）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '校频率与稳定度：用 plant/rf-13m56 的频率计数判 2.260±0.001 MHz；V/U 比 8 h 漂 ≤0.008 %',
        performedBy: 'plant/rf-13m56',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '铜线 1.2 + 45 钢 2 + 酚醛 0.4 + 金 0.002 → 驱动 1 台（约 4 kg）；4 kg 水走掉。电子件按件计，不折质量',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4.6 法拉第杯
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **法拉第杯：车杯体（深径比 5:1）→ 装抑制极 → 金化内壁 → 量漏电流。**
     *
     *   45 钢 0.6 + 铜 0.4 + 石英 0.1 + 金 0.001 + 水 1 → 法拉第杯 1 只
     *
     * 杯的两个数都是几何：
     *
     *   深径比 5:1（φ10×50）⇒ 从杯底直射出去只有 **0.25 % 的立体角**（半角 5.7°）
     *     ⇒ 几何收集 **99.7 %**，−100 V 的抑制极把它补到 **99.9 %**
     *   漏电流：石英绝缘子的体电阻 1e18 Ω·cm × 0.5 mm / 1 cm² ⇒ **5e16 Ω**
     *     ⇒ 在 100 V 上漏 **2e-15 A = 0.002 pA** —— 比噪声底 0.1 pA 小 50 倍 ✓
     *
     * ⚠️ 噪声底 0.1 pA 不是杯的，是**前放的**：1 GΩ 的跨阻 + 0.1 pA/√Hz 的
     * 运放电流噪声 ⇒ 1 s 平均 0.1 pA。这一条与 `cd-sem.ts` §一 那段"把跨阻做大"
     * 是同一笔账，只是这里的信号大 4 个量级，所以 1 GΩ 就够（那边要 1e9 + 小片）。
     */
    id: 'make/sims-faraday-cup',
    name: '二次离子质谱仪法拉第杯制造',
    rate: { hours: q(16) },
    produces: [
      {
        item: 'plant/sims/faraday-cup',
        qty: q(1),
        gives: [
          { param: 'noise', kind: 'range', max: 0.1 },
          { param: 'maxCurrent', kind: 'range', min: 200, max: 200 },
          { param: 'efficiency', kind: 'range', min: 96, max: 99 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(3, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2, 5) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'std/galvanometer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/euv-vacuum'],
    steps: [
      {
        note_zh: '车杯体 φ10×50（深径比 5:1）、车抑制极与石英绝缘子座、车出口法兰',
        performedBy: 'lathe',
      },
      {
        note_zh: '内壁金化（0.5 µm，防吸附与二次发射）：镀槽 + 水洗',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh: '装并量：1 GΩ 跨阻下噪声 ≤0.1 pA、100 V 上漏 ≤0.05 pA、收集效率 ≥96 %（比对法）',
        performedBy: 'plant/robot',
        under: [
          { param: 'temperature', min: 19, max: 21 },
          { param: 'pressure', min: 1e-6, max: 1e-5 },
        ],
      },
    ],
    unbalanced_zh:
      '45 钢 0.6 + 铜 0.4 + 石英 0.1 + 金 0.001 → 法拉第杯 1 只（约 1.1 kg）；1 kg 水走零',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4.7 电子倍增器
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **倍增器：冲 16 片铝打拿极 → 空气氧化长 Al₂O₃ → 叠成 16 级 → 量增益与暗计数。**
     *
     *   铝 0.15 + 玻璃 0.05 + 45 钢 0.3 + 铜 0.05 + 石英 0.05 + 水 1 → 倍增器 1 只
     *
     * 打拿极的算术只有一行：
     *
     *   δ(Al₂O₃, 200 eV) = 2–3（取 2.5）；第一级被 5 keV 的离子打，δ_ion = 3–5（取 4）
     *   ⇒ G = 4 × 2.5¹⁵ = **3.7×10⁶**（16 片里第一级是离子→电子，其余 15 级是电子→电子）
     *   ⇒ 单个离子的脉冲 = 3.7e6 × 1.6e-19 = **590 fC**；10 ns 上是 59 µA
     *   ⇒ 50 Ω 上 **3 mV** —— 对 1.5 mV 的阈值 2 倍裕度、对 0.5 mV 的噪声 6 倍
     *
     * ⚠️ 为什么不是连续打拿极（通道板）：通道板要**铅玻璃**（Pb 0 条目）且要
     * 1e6 的增益需要 1 kV/mm 的场；铝的分立打拿极只要 16 片冲片 + 一次空气氧化，
     * **本层两条路都能走，但只有这条能走通**（与 `oxygen-metrology.ts` D2 的
     * "银代铂"是同一个判断方式：不是选最好的，是选做得到的）。
     *
     * ⚠️ 阳极氧化的膜厚是 δ 的全部：**5–10 nm** 最好（太薄导电、太厚电子出不来）。
     * 本层用 3 % 的酒石酸铵？—— **没有**。用**空气氧化 450 °C/1 h**（Al₂O₃ 4–6 nm），
     * δ 比阳极氧化的低 20 %，这一笔算进 3.7e6 里了（否则是 4.7e6）。
     */
    id: 'make/sims-electron-multiplier',
    name: '二次离子质谱仪电子倍增器制造',
    rate: { hours: q(26) },
    produces: [
      {
        item: 'plant/sims/electron-multiplier',
        qty: q(2),
        gives: [
          { param: 'gain', kind: 'range', min: 3e6, max: 6e6 },
          { param: 'darkCount', kind: 'range', max: 0.5 },
          { param: 'life', kind: 'range', min: 2200, max: 2200 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(3, 20) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 20) }] },
      { anyOf: [{ item: 'std/hv-rectifier-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/euv-vacuum'],
    steps: [
      {
        note_zh: '冲 16 片 12×12 的打拿极（0.3 mm 铝片，每片中央 φ3 的束孔）并去毛刺',
        performedBy: 'plant/press',
      },
      {
        note_zh: '空气氧化 450 °C/1 h 长 4–6 nm 的 Al₂O₃（δ 比阳极氧化的低 20 % —— 已算进增益）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 430, max: 470 }],
      },
      {
        note_zh: '叠 16 级（级距 8 mm、级间 200 V）、装分压链与前放、石英绝缘',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '量：增益 3–6e6（单离子脉冲的高度分布）、暗计数 ≤0.5/s（1 h 计）、1e7 计数/s 打 100 h 后增益掉 ≤30 %',
        performedBy: 'plant/robot',
        under: [
          { param: 'temperature', min: 19, max: 21 },
          { param: 'pressure', min: 1e-6, max: 1e-5 },
        ],
      },
    ],
    unbalanced_zh:
      '铝 0.15 + 玻璃 0.05 + 45 钢 0.3 + 铜 0.05 + 石英 0.05 → 倍增器 2 只（约 0.3 kg/只）；1 kg 水走掉。电子件按件计',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4.8 计数链
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **计数链：焊鉴别器 → 搭 100 MHz 计数 → 三档率表 → 校死时间。**
     *
     *   45 钢 0.5 + 铜线 0.1 + 酚醛 0.2 + 水 1 → 计数台 1 台
     *   + 计数片 4、运放 3、稳压管 1
     *
     * 死时间 10 ns 的那一笔要算清，因为它是 RSF 里唯一的系统系数：
     *
     *   非扩展死时间（non-paralyzable）：n = m/(1 + m·τ)
     *   m = 1e7 计数/s、τ = 10 ns ⇒ n = 1e7/1.1 = **9.09e6** ⇒ 损失 **9.1 %**
     *   ⇒ 修正因子 1.1 是**固定的**（它只跟 τ 有关，与计数率线性无关到 1 %），
     *     所以 RSF 里把它当一个常数折进去 —— **这一条是"能定量"的前提**
     *
     * 三档率表（1 s / 10 s / 100 s）不是"平均得久一点"，是三个不同的用处：
     *   1 s   —— 快扫（找峰位）
     *   10 s  —— 剖面的常规点（0.6 ppm 的检出限就是按 1 s 说的，10 s 会好到 0.2 ppm）
     *   100 s —— 低浓度的尾巴（1e17 cm⁻³ 以下），**一晚上只够 30 个点**
     */
    id: 'make/sims-pulse-counter',
    name: '二次离子质谱仪计数链制造',
    rate: { hours: q(22) },
    produces: [
      {
        item: 'plant/sims/pulse-counter',
        qty: q(1),
        gives: [
          { param: 'countRate', kind: 'range', min: 120, max: 120 },
          { param: 'deadTime', kind: 'range', max: 10 },
          { param: 'threshold', kind: 'range', min: 1, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 5) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(3) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '焊鉴别器（1.5 mV 阈值、10 ns 死时间）与成形级（5 mV/50 Ω）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '搭 4 级 16 位计数（13.56 MHz 的时基 ÷6 后做 100 ms 闸门）与三档 RC 率表',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '校死时间：双脉冲法量 τ = 10±1 ns（1e7 计数/s 上损失 9.1 %，作为固定系数折进 RSF）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '45 钢 0.5 + 铜线 0.1 + 酚醛 0.2 → 计数台 1 台（约 1 kg）；1 kg 水走掉。电子件按件计',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4.9 进样室
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **进样室：卷 5 L 的小腔 → 装磁力传送杆与烘烤套 → 检漏 → 量循环时间。**
     *
     *   钢板 8 + 45 钢 6 + 铜 1 + 石英 0.2 + 水 6 → 进样室 1 套
     *
     * 25 min/片的账（§一 零件注释里算过）：
     *
     *   抽气 1.7 s（5 L、60 L/s、1e5 → 1e-4 Pa）——**不是瓶颈**
     *   放气是瓶颈：空气暴露过的片与腔壁 100 cm² 放 1e-5 Pa·L/(s·cm²)
     *     ⇒ 1e-3 Pa·L/s ÷ 60 L/s = **1.7e-5 Pa**；烘 60 °C/20 min 把水赶掉一半
     *     ⇒ 1e-5 Pa ✓（这一句就是"为什么要 25 min"的全部）
     *   ⇒ **烘烤 20 min + 抽气 3 min + 传递 2 min = 25 min**
     *
     * ⚠️ 烘烤套的温度上限是 60 °C 而不是 200 °C：**样品是光刻胶片**（`cd-sem.ts`
     * §三 那张表说得很清楚，一半的样品是胶）。200 °C 会把胶烤成碳 —— 那个碳
     * 在 SIMS 里就是 C⁻ 与 C₂H₃⁺ 的假峰，比氢化物干扰更糟。
     */
    id: 'make/sims-load-lock',
    name: '二次离子质谱仪进样室制造',
    rate: { hours: q(30) },
    produces: [
      {
        item: 'plant/sims/load-lock',
        qty: q(1),
        gives: [
          { param: 'cycleTime', kind: 'range', min: 24, max: 26 },
          { param: 'leakRate', kind: 'range', max: 8e-8 },
          { param: 'waferSize', kind: 'range', min: 100, max: 150 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(8) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(6) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(6) }] },
    ],
    needs: ['plant/metrology-room', 'plant/euv-vacuum'],
    steps: [
      {
        note_zh: '卷焊 5 L 的进样腔（φ150×280）与两道闸板阀座、车 CF 法兰',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh: '装磁力传送杆（线性 300 mm、1 µm）与 60 °C 的烘烤套（上限由光刻胶定，不是真空定）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '压升法检漏 1e-7 Pa·L/s（±30 %）；量一片的循环 24–26 min',
        performedBy: 'plant/robot',
        under: [
          { param: 'temperature', min: 19, max: 21 },
          { param: 'pressure', min: 1e-4, max: 1e-3 },
        ],
      },
    ],
    unbalanced_zh:
      '钢板 8 + 45 钢 6 + 铜 1 + 石英 0.2 → 进样室 1 套（约 14 kg）；6 kg 水走掉（酸洗与试漏）',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4.10 RSF 标准片（两片：5e14 与 5e15）
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **RSF 标准片：干氧 10 nm → Al⁺ 60 keV 两个剂量 → RTA 激活 → 四探针 + 椭偏过证。**
     *
     *   硅片 2 + 铝 0.0004 + 氧 0.004 + 氮 0.004 + 氩 0.008 + 水 2 → 标准片 2 片
     *
     * 这是本机**唯一一条"从半定量变成定量"的路线**（§一 Q5）。四个数：
     *
     *   ① **剂量** 5e14 与 5e15 cm⁻²。注入机给的是电荷积分，而中性化只有 0.5 %
     *      （1e-4 Pa、λ = 400 m）⇒ **±5 %**。
     *   ② **深度标尺**：Al 60 keV 的 Rp = **65 nm**（`implant.ts:1598` 同一个数）。
     *      RTA 900 °C/10 s 只加 0.017 µm ⇒ 峰在 65 nm、尾巴到 200 nm，
     *      所以"积分限到 200 nm"这句话可以写死。
     *   ③ **屏氧 10 nm**：干氧 1000 °C、4.5 nm/min ⇒ **2.2 min**。
     *      它挡不住 60 keV 的 Al（Rp 65 nm 在它后面），但把表面变成化学氧化层。
     *   ④ **过证**：四探针量方阻（5e15 半激活、100 nm 层、µ = 60 cm²/Vs ⇒
     *      R_s = 1/(q·µ·N_s) = **30–60 Ω/□**）、椭偏量屏氧 10±0.5 nm。
     *      **两条都不独立**（都吃同一个剂量），所以它们只能证明"这一片没做错"，
     *      不能证明"剂量是 5e15" —— **剂量那个数只能信注入机的法拉第杯**，
     *      这一句必须写在这里，否则 ±8 % 就是假的。
     */
    id: 'make/sims-rsf-standard',
    name: 'RSF 标准片制造',
    rate: { hours: q(3) },
    produces: [
      {
        item: 'plant/sims/rsf-standard',
        qty: q(2),
        gives: [
          { param: 'dose', kind: 'range', min: 4.8e14, max: 5.2e15 },
          { param: 'energy', kind: 'range', min: 58, max: 62 },
          { param: 'screenOxide', kind: 'range', min: 9.5, max: 10.5 },
          { param: 'uniformity', kind: 'range', max: 4 },
          { param: 'rsfAccuracy', kind: 'range', max: 8 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2500) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 250) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 250) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 125) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room', 'plant/euv-vacuum'],
    steps: [
      {
        note_zh: '干氧 10 nm：1000 °C、4.5 nm/min ⇒ 2.2 min（与 make/ellipsometer-standard-wafer 同一炉口径）',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 950, max: 1050 }],
      },
      {
        note_zh:
          'Al⁺ 60 keV、一片 5e14、一片 5e15，7° 倾斜（沟道尾压到 1.2 Rp = 78 nm）；均匀性判 ≤4 %',
        performedBy: 'plant/ion-implanter',
        under: [
          { param: 'energy', min: 58, max: 62 },
          { param: 'pressure', min: 1e-5, max: 1e-4 },
        ],
      },
      {
        note_zh: 'RTA 900 °C/10 s 激活（Dt = 1.9e-14，结深只加 0.017 µm）',
        performedBy: 'plant/rta',
        under: [{ param: 'temperature', min: 880, max: 920 }],
      },
      {
        note_zh:
          '过证 1：四探针量方阻（5e15 半激活档判 30–60 Ω/□）—— 与剂量吃同一个数，只证明"做对了"',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '过证 2：椭偏量屏氧 10±0.5 nm（判据 ±5 %）与膜的 n（1.462）',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '硅片 2 片 + 铝 0.0004 + 氧 0.004 + 氮 0.004 + 氩 0.008 → 标准片 2 片；铝里只有 4 µg 成了束（其余打在光阑与法拉第杯上），氧与氮是配气，水是清洗。产物按片计，不做质量守恒',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4.11 量测：一条纵向成分剖面
  // ─────────────────────────────────────────────────────────────────────────
];

// ═══════════════════════════════════════════════════════════════════════════
// 五、出口
// ═══════════════════════════════════════════════════════════════════════════

export const SIMS_ITEMS: readonly Item[] = [...SIMS_PARTS, ...SIMS_SAMPLES, SIMS];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...SIMS_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/sims',
    name: '二次离子质谱仪装配',
    produces: [{
      item: 'plant/sims',
      qty: q(1),
      gives: [
      { param: 'massRange', kind: 'range', min: 1, max: 300 },
      { param: 'resolution', kind: 'range', min: 100, max: 400, dir: 'atLeast' },
      { param: 'transmission', kind: 'range', min: 1, max: 10, dir: 'atLeast' },
      { param: 'primaryCurrent', kind: 'range', min: 1, max: 90, dir: 'atLeast' },
      { param: 'primaryEnergy', kind: 'range', min: 250, max: 5000 },
      { param: 'beamDiameter', kind: 'range', min: 5, max: 100, dir: 'atMost' },
      { param: 'rasterSize', kind: 'range', min: 50, max: 300 },
      { param: 'sputterRate', kind: 'range', min: 0.005, max: 1 },
      { param: 'depthResolution', kind: 'range', min: 2.4, max: 20, dir: 'atMost' },
      { param: 'craterFlatness', kind: 'range', min: 0.3, max: 1, dir: 'atMost' },
      { param: 'detectionLimit', kind: 'range', min: 0.3, max: 10, dir: 'atMost' },
      { param: 'rsfAccuracy', kind: 'range', min: 0, max: 10, dir: 'atMost', record: 'mat/sims-na-rsf-record' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...SIMS_ROUTES, ...ASSEMBLY_ROUTES];
