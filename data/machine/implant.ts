/**
 * 离子注入机 + 快速热处理（RTA）—— **本层唯一能给「秒」这个刻度的两台机器**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、为什么写这个文件：四份文件各自撞在同一堵墙上
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `data/machine/gate-stack.ts`
 *     §一  1.5 nm 栅氧只要 **41–77 s 等温**，而炉子升降温各 30 min（1800 s ÷ 41 s =
 *          **44 倍**）；坡上自己长 **3–5.5 nm** ⇒ 最薄只能 4 nm。
 *     §二  40 nm 的栅要浅结 20–30 nm，交付 300–400 nm（差 10–20 倍）；
 *          它自己那张 R8 表第 4 行写的就是「离子注入机（≤100 keV、7° 倾斜）+ RTA」。
 *     §四  C49 → C54 要 **700–800 °C / 30 s**，而炉子的 30 min 让硅化物横向长
 *          0.1–0.15 µm，爬过 45 nm 的侧墙 ⇒ 栅源漏短路。
 *   `data/machine/cis.ts`
 *     钉扎二极管 p⁺ 层 0.1 µm：热预算已超 —— **两坡 3.96e-12 > 全部预算 3.615e-12**
 *     （`cis.ts:48`、`:544`）。也就是说**一片还没进等温段，预算就已经用光了**。
 *   `data/machine/implant` 相关
 *     `plant/hv-test-bench` 只到 **10 kV**（`hv-semiconductor.ts:361`，它的
 *     `transformer` 零件也是 10 kV）—— 100 kV 差 10 倍。
 *   本层**没有任何 RTO/RTA**：所有热处理都是「炉子 30 min 升降温」。
 *
 * 本文件的判据只有一条，可以被反驳：
 *
 *   **把 energy / dose / rampRate / uniformity / pressure 这几个数交出来，
 *   并把「哪一件是硬缺、缺几倍」写在注释里。**
 *
 * 所以下面每一条路线都同时说两件事：「本层能做到多少」与「判据是多少」。
 * 数字一律能从本仓库别的文件里核（Deal-Grove 常数、`cis.ts` 的 D、炉子的 30 min、
 * `mask-repair.ts` 的 Wien 安匝、`unblock-thermocouple.ts` 的量程、`pyrometer.ts`
 * 的 1000–2000 °C）；核不到的（溅射产额、比接触电阻那一类）**标成文献值**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、问题一：硼 / 磷 / 砷三条掺杂剂从哪来（全表 grep 的结果）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * grep 口径：`mat/boron|mat/borax|mat/boric|mat/arsenic|mat/phosphorus|
 * mat/phosphine|mat/arsine|mat/bf3|arsenide|realgar|gallium`，扫 `data/` 全表。
 *
 * | 掺杂剂 | 有没有 | 证据 | 替代 | 代价（带数） |
 * |---|---|---|---|---|
 * | **P⁺** | **有** | `mat/phosphorus`（`dopant.ts:56`）+ `make/phosphorus`（`:81`）：
 *   磷灰石精矿 1000（30 % P₂O₅）+ 硅石 380 + 焦炭 130 → 黄磷 131 + 硅酸钙渣 735，
 *   矿热炉 1500–1600 °C。`mat/phosphoric-acid` 也有（`byproducts.ts:52`） | — |
 *   只能做**固体源**：红磷 350–420 °C 升华，经 φ6 漏孔降到弧室 0.1 Pa |
 * | **B⁺** | **没有** | `mat/boron` / `mat/borax` / `mat/boric-acid` **全表 0 条**。
 *   三处独立写过：`unblock-autoclave-sight.ts:54`（"硼砂/硼酸这条链不在"）、
 *   `euv-mirror.ts:344`（"掺硼要硼砂，而本层的料表里没有硼"）、
 *   `plating.ts:107`（"硼酸本层没有条目"）。火星风化层里硼几 ppm，无富集路线 | 
 *   **Al⁺（27 amu）** | Al 在硅里是受主（`dopant.ts` 全篇的结论就是「受主 铝」）。
 *   注入这一半反而**更好**：同一能量下 Rp ∝ 1/质量，60 keV 时 Al 65 nm、B 130 nm。
 *   退火那一半全看 Al 的扩散系数，而**这个数在文献里横跨三个量级**：
 *   D₀ = 2.8 cm²/s、Ea = 3.3 eV ⇒ D(1000 °C) = **2.5e-13**；实验值报过 1e-10。
 *   取 2.5e-13：RTA 1000 °C/10 s 的 x_j = 0.065 + 5.26√(2.5e-12) = **0.148 µm**；
 *   取 1e-10：同一条路线给 **1.73 µm**。
 *   **⇒ p⁺ 结深落在 0.09–1.7 µm 之间，判据 0.1 ⇒ 达标到差 17 倍 —— 而本层
 *   没有任何量具能把它收到一个数上（缺口⑧）。这是全文件最不确定的一格。** |
 * | **As⁺** | **没有** | `mat/arsenic` / 砷化镓 / 雄黄 **全表 0 条**。全表"砷"字只出现在
 *   锡的杂质清单里（`euv-metals.ts:193/392`、`unblock-electrorefining-cell.ts:131`） | 
 *   **P⁺ 降能量**（同为Ⅴ族施主） | 75 对 31 amu：As 40 keV 的 Rp = 0.028 µm，
 *   P 40 keV 是 0.050 µm（**1.8 倍**），要等效就得把能量压到 **20 keV**。且 P 的高浓度扩散
 *   （kick-out / 配对）比 As 快 **10–100 倍** ⇒ 同一份 RTA 预算下 P 的结深 3–10 倍。 |
 *
 * **由此得出一条结构性结论：本层的注入机只能是「固体进料 + 电子轰击（Nier 型）」。**
 * 三种气体源一条都不成立，理由分开说：
 *
 *   BF₃   要硼 —— 没有（见上）。氟有（`mat/hf`、萤石链），但少一条腿。
 *   PH₃   要黄磷 + 氢，而**氢不在本文件的投料白名单里**；PH₃ 自燃、要 −20 °C 吸附
 *         纯化与钢瓶（本层没有钢瓶链）。**黄磷在**，所以走固体源，不走气体。
 *   AsH₃  要砷 —— 没有。
 *
 * 固体源的蒸气压（查表值）：红磷 400 °C 约 10²–10³ Pa，经漏孔降到弧室 0.1 Pa；
 * 铝要 **1180 °C** 才到 0.1 Pa（Al 的蒸气压：1000 °C 3.3e-3 Pa、1200 °C 0.15 Pa）。
 * 这就是本文件里**两只可换的炉胆**（400 °C / 1180 °C）的由来。
 *
 * 代价：固体源的束流是 **µA 级**（气体源是 mA 级）。这是整台机器只有 22 µA 的
 * **第二重原因**（第一重是倍压柱的 fC，见问题二）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、问题二：100 kV 怎么来 —— **34 级倍压空载就成，带载只剩 22 µA**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 白名单里能给高压的只有三件：`std/hv-rectifier-general`（**3.0 kV / 10 A**，
 * `hv-semiconductor.ts:392`）、`std/hv-thyristor-general`（1.6 kV / 500 A）、
 * `std/capacitor-film-general`（**0.1–10 µF / 200–630 V**，`capacitor.ts:56/73`）。
 * `std/transformer-general` **不在本文件白名单**（它属于 `transformer.ts` 那一层）。
 *
 * **① 电压：不是问题。** 全波倍压每级给 2·V_peak = 6 kV，17 级 = 34 只整流器
 * ⇒ 空载 **102 kV**。（"34 级"这个数就是这么来的：**34 只 3 kV 整流器**。）
 * 整流器的电流更是白给：`hv-rectifier-general` 是 10 A，而这里只要 22 µA ——
 * **差 4.5×10⁵ 倍**。所以"串 34 级"这句话，对的部分是电压，错的部分是它以为
 * 瓶颈在整流器。
 *
 * **② 电流：全垮在电容上。** 倍压柱的输出压降（全波，n 级、每级 C、频率 f）：
 *
 *   ΔV = (I / fC) · [ 2n³/3 + n²/2 − n/6 ]
 *
 *   n = 17 ⇒ 括号项 = 2·4913/3 + 289/2 − 17/6 = **3417**
 *   石英叠片一只 φ200 × 1.5 mm：C = ε₀·3.8·π·0.1²/1.5e-3 = **0.705 nF**
 *   36 片并联 = **25 nF**（耐压 1.5 mm × 4 kV/mm = 6 kV，正好一级）
 *
 *   f = 400 Hz（旋转变流机，`e-beam-column.ts:550` 的口径）、C = 25 nF ⇒ fC = 1e-5：
 *     **每 1 µA 掉 342 V。** 所以：
 *       3 µA → ΔV = **1.0 kV（1 %）**
 *      22 µA → ΔV = **7.5 kV（7.5 %）**
 *      50 µA → ΔV = **17 kV（17 %）** —— 已经不能算 100 kV 的机器了
 *
 *   f = 1 kHz（同一族做成中频机组，`rotary-converter.ts:66` 的 `frequency-converter`
 *   就是这一档）⇒ fC = 2.5e-5，每 1 µA 掉 137 V：
 *      22 µA → ΔV = **3.0 kV（3 %）** ← **交付工作点**
 *      63 µA → ΔV = 8.6 kV（8.6 %，按 91 keV 标定）
 *
 *   ⚠️ 这就是 n³ 定律：**30 kV 那一档（n = 5，括号项 95）在同一个 25 nF 上，
 *   3 % 压降能给 237 µA；100 kV 那一档（n = 17，括号项 3417）只剩 22 µA ——
 *   电压涨 3.3 倍，电流掉 11 倍。** "34 级串上去就有 100 kV"这句话对了一半：
 *   电压对，**但电流不是 10 A，是 22 µA —— 差 4.5×10⁵ 倍。**
 *
 * **③ 所以方案是：34 只 `std/hv-rectifier-general` 串成 17 级全波倍压 + 1 kHz 中频
 * + 34 组 25 nF/6 kV 石英叠片电容。交付 100 keV / 22 µA。**
 *
 * **④ 不选"旋转变流机 + 升压变压器"**，三条理由：
 *   · `std/transformer-general` 不在白名单（要它就得改别的文件）；
 *   · 100 kV 的油浸变压器要**变压器油 + 电容纸套管**，本层两样都没有
 *     （`mat/` 全表没有矿物油，也没有纸套管 —— `unblock-wire.ts` 那条只到 B 级）；
 *   · 干式 100 kV 变压器的高低压间要 100 mm 油道或真空浇注环氧，本层没有真空浇注。
 *   记进 R8 第 3 行。
 *
 * **⑤ 电容不能买现成的**：`std/capacitor-film-general` 只到 **630 V**，而倍压柱每级
 * 承 **6 kV** —— **一只都用不上**。所以 `plant/ion-implanter/hv-column` 那一件里
 * 的电容是自己叠的石英片（= 本文件里最重的一件零件，140 kg 石英）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、问题三：90° 磁扇 —— 分 B⁺ 与 BF₂⁺ 只要 0.29，难的是别的那几对
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 半径公式（分析能量 V 在**加速管之前**，这是工业注入机的标准布局：先分析后加速）：
 *
 *   r = √(2MV/q) / B = 1.4398e-4 · √(V[V]·M[amu]/z) / B[T]   [m]
 *
 * 取 **r = 250 mm、90° 扇形、B = 0.1–0.5 T**：
 *
 * | 离子 | M | 分析能量 | B | 备注 |
 * |---|---|---|---|---|
 * | Al⁺ | 27 | 25 kV | **0.473 T** | p 型（硼的替代品） |
 * | P⁺  | 31 | 20 kV | **0.453 T** | n 型 |
 * | B⁺  | 11 | 25 kV | **0.302 T** | 本层不产，留作对照 |
 * | BF₂⁺| 49 | 25 kV | **0.637 T** | **>0.5 T ⇒ 撞壁**，这正是要的分开 |
 *
 * **分辨本领**：M/ΔM = r/(2Δr)。物缝 1 mm + 像缝 1 mm ⇒ Δr ≈ 1 mm ⇒ **M/ΔM = 125**。
 *
 *   B⁺(11) 对 BF₂⁺(49)：只要 **M/ΔM = 11/38 = 0.29** —— 宽 **430 倍**；
 *     两者半径 250 与 528 mm，空间差 **278 mm**（像缝 1 mm 的 278 倍）。
 *   B⁺(11) 对 ¹⁰B⁺(10)：要 **11** —— 宽 **11 倍**（这是真正吃紧的那一对）。
 *   P⁺(31) 对 ³⁰SiH⁺(31)：**同质量，任何磁铁都分不开。**
 *     ⇒ 只能靠"源里没有硅"来保证 —— 而这正是固体源的好处（进料是红磷，不是硅烷）。
 *     **气体源的 PH₃ 反而更干净，但本层没有 PH₃（见问题一）。**
 *
 * **线圈**（同一个式子在 `mask-repair.ts:944` 已经用过一次）：
 *
 *   NI = B·g/μ₀。0.5 T、气隙 g = 40 mm ⇒ NI = 0.5×0.04/4π×10⁻⁷ = **15 900 安匝**
 *   取 **4000 匝 × 4 A = 16 000 安匝**
 *   φ1.5 mm 铜线，均长 0.8 m ⇒ 长 3 200 m、A = 1.767 mm²、R = 31 Ω
 *   ⇒ 铜损 **P = 4²×31 = 500 W**（水冷；电流密度 2.3 A/mm²）
 *
 *   对照 `plant/mask-repair/mass-filter` 的 Wien：**480 安匝 / 10 mm = 0.06 T**，
 *   同一个式子。这台是它的 **33 倍安匝、4 倍气隙** —— 同族，不是另一门手艺。
 *
 * ⚠️ **磁场标不了**（`mask-repair.ts:379` 缺口⑤ 原话："0.06 T 靠励磁电流定，
 * 而本层没有高斯计"）。这台只能由安匝算 B（±5 %），再用"调到 P⁺ 束最亮"开环定标。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、问题四：RTA 升温 100–200 K/s —— 2 kW 只够 72 K/s，**而且爬不到 1000 °C**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ 这一节是 **10 kW 基线**的推导（R8 之前）。R8 之后装机改为 60 kW
 * （24×2.5 kW），当前交付窗口见 `plant/rta` 条目注释与 §七 表：
 * 400–1200 °C、1–400 K/s、60–70 kW 调功。
 *
 * **① 那片硅的热容（全部可算）：**
 *
 *   φ100 × 0.5 mm：A = π×0.05² = 7.854e-3 m²、V = 3.927e-6 m³
 *   m = 2330 × 3.927e-6 = **9.15 g**
 *   C = 9.15 g × 0.7 J/(g·K) = **6.41 J/K**
 *   25 → 1000 °C（ΔT = 975 K）：Q = 6.41 × 975 = **6.25 kJ**
 *
 * **② 电功率 → 吸收功率的四道折扣（每一道给一个数）：**
 *
 *   灯丝辐射效率   0.85   真空石英泡里只有引线导热与蒸发在漏，其余全辐射
 *   光谱匹配       0.60   3000 K 黑体在 λ<1.1 µm（硅的带边）那一份：
 *                         x = c₂/(λT) = 14388/(1.1×3000) = 4.36 ⇒ F(0→x) = 0.579；
 *                         钨在可见的发射率高于红外，抬到 0.60
 *   硅的吸收率     0.65   1.0 µm 附近 0.6–0.7（有增透就更高，本层没有增透）
 *   反射罩收集     0.70   椭球罩 20 只、片在焦线上，几何收集 × 罩面反射
 *   ⇒ **η = 0.85 × 0.60 × 0.65 × 0.70 = 0.232**
 *
 * **③ 于是题设给的 2–5 kW：**
 *
 *   2 kW 电 → 464 W 吸收 → 464/6.41 = **72 K/s**（无损失时到 1000 °C 要 13.5 s）
 *   5 kW 电 → 1.16 kW 吸收 → **181 K/s**（无损失时 5.4 s）
 *
 *   **看起来 5 kW 正好落在 100–200 K/s 的上沿 —— 但它爬不到 1000 °C。**
 *   1000 °C 的片自己在辐射（ε = 0.7，A_eff = 1.5A：正面全辐射、背面被镀金罩反掉 ~70 %）：
 *     P_rad = 0.7 × 5.67e-8 × 1273⁴ × 1.5×7.854e-3 = **1.23 kW**
 *   解 P_abs = P_rad 的天花板：
 *     **2 kW ⇒ 725 °C**（那时 P_rad = 272 W，正好吃掉 464 W）
 *     **5 kW ⇒ 982 °C**（P_rad = 1.16 kW）—— 停在 1000 °C 下面 18 K
 *   ⇒ **5 kW 连"保温在 1000 °C"都做不到，更没有升温余量。**
 *
 * **④ 所以装机 10 kW（20 只 × 500 W）：** 吸收 2.32 kW，天花板 **1219 °C**
 *   （比石英腔的 1200 °C 上限高 19 K —— 这个搭配不是巧合：**灯要比腔多一档余量**，
 *   否则灯老化 20 % 之后连 1000 °C 都保不住，见 §七·第 9 行）。
 *
 *   1000 °C：净 2.32 − 1.23 = 1.09 kW ⇒ **171 K/s**
 *    900 °C：净 2.32 − 0.89 = 1.44 kW ⇒ **224 K/s**
 *    600 °C：净 2.32 − 0.27 = 2.05 kW ⇒ **320 K/s**（超过上限，调功器压下来）
 *   ⇒ **交付 20–300 K/s 可调、标称 150 K/s；25 → 1000 °C 约 6–8 s。**
 *   闭环按高温计读数压住升温率（见问题五），所以"多出来的功率"是控制余量不是浪费。
 *
 * **⑤ 均匀性：判据 ±5 K，交付稳态 ±8 K、坡上 ±30 K。**
 *
 *   稳态：局部功率差 ΔP 与温度差的关系由 σT⁴ 定 ⇒ **ΔT = (T/4)·(ΔP/P)**。
 *     5 区灯组把 ΔP/P 压到 ±3 % ⇒ 1273 K 上 **±9.5 K**；片再以 20 rpm 自转，
 *     把方位角的不对称平均掉 ⇒ **±8 K**（判据 ±5，差 **1.6 倍**）。
 *   坡上：横向热扩散长度 √(αt)。α = k/(ρc) = 25/(2330×700) = **1.53e-5 m²/s**，
 *     7 s 的坡里只走 √(1.53e-5 × 7) = **10.4 mm** —— 片半径是 50 mm。
 *     ⇒ **照明不均不被传导抹平**：±3 % 的光在 975 K 的坡上就是 **±29 K**
 *     （判据 ±5，差 **6 倍**）。
 *   结深的代价（题设的 5 %/10 K）：等温 ±8 K ⇒ **±4 %**；坡上 ±30 K ⇒ **±15 %**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、问题五：测温 —— 500–1000 °C **本层一件都没有**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 三件候选，逐件算，全都不成：
 *
 *   ① `plant/pyrometer` holds **1000–2000 °C**（`pyrometer.ts:192`）。下限是
 *      "钨丝能分辨的最暗红"，不是灵敏度不够 —— 它的零点靠**灯丝消失**，而灯丝
 *      1000 °C 以下根本看不见片子的暗红。
 *   ② 热电偶：本层能造的只有**铜-铁**（`unblock-thermocouple.ts`），量程
 *      **0–250 °C** —— 曲线在 200–230 °C 见顶、250 以上往回走（铁的塞贝克系数
 *      在 200–300 掉头）。**500 °C 连热电偶都没有。**
 *   ③ 硅光电二极管（`std/photodiode-general`，0.4–1.1 µm）：
 *      500 °C 的片在 0.9 µm 的辐亮度 L_λ = 0.21 W/(m²·sr·µm)；
 *      3000 K 灯丝在同一波长是 **9.8×10⁵** —— **差 4.7×10⁶**。
 *      **不是"不够灵敏"，是"被灯彻底淹没"。**
 *
 * ⇒ **交付：两点锚定 + 模型外推。**
 *
 *   锚点 A  室温–250 °C：铜-铁热电偶（压在**石墨托**里，不在光路上）
 *   锚点 B  1000–1200 °C：`plant/pyrometer`（判据内，±5–10 K）
 *   中间    500–1000 °C 由 P_abs = m·c_p·(dT/dt) + εσA(T⁴ − T₀⁴) 反解。
 *           两个锚点把"ε × 吸收率"的积定出来，往下外推。
 *   **误差 ±30–50 K**（判据 ±20 K ⇒ 差 **1.5–2.5 倍**）。
 *
 *   ⚠️ 题设说"热电偶在灯场里会被直接加热 → 误差"——**对，而且可以给数**：
 *   裸露的焊球（φ0.5–1 mm）在 4 kW 的灯场里吸收 1–3 W，自身热容 ~1 mJ/K，
 *   稳态高于托温 **50–150 K**。压在石墨托（6 mm 厚、热容 0.24 J/K）里之后，
 *   灯照的是片不是托，偏差降到 **20–60 K**，而且是**可标定的**（曲线不漂）——
 *   这才是它留在方案里的理由。
 *
 * **升级（R8 第 7 行）：1.55 µm InGaAs 高温计 + 斩波 + 锁相。**
 *   辐亮度：500 °C 时 1.55 µm 是 **80 W/(m²·sr·µm)**，1000 °C 时 **9 080** ⇒
 *   **113 倍动态范围，光度上是够的**。而同波长 3000 K 的灯丝是 **6.0×10⁵**，
 *   **比 1000 °C 的片还亮 70 倍** ⇒ 必须斩波（400 Hz）+ 锁相，不能直读。
 *   缺的那一件是 1.55 µm 的探测器（`std/photodiode-general` 只到 1.1 µm）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、这两台机器解开了四份文件里的哪几个结（一张表，数都来自下面的 gives）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * | 结 | 炉子/现状 | 本文件 | 判据 | 差 |
 * |---|---|---|---|---|
 * | 浅结 x_j（0.15 µm） | 300–400 nm | 100 keV P⁺ + RTA 1000 °C/10 s ⇒
 *   0.135 + 0.017 = **0.152 µm** | 0.15 µm | **✓ 1.0×** |
 * | 浅结 x_j（40 nm 节点） | 300–400 nm | 10 keV P⁺ + RTA ⇒ 0.014 + 0.017 = **31 nm** |
 *   20–30 nm | **✓ 1.0–1.5×** |
 * | 栅氧 eot | 3.5–4.5 nm（炉子） | RTO 1.5–2.0 nm，坡上只多长 **0.02 nm**（见 §六·②） |
 *   1.2–1.5 nm | **1.0–1.7×** |
 * | 硅化物相 | C49 12–20 Ω/□ | C54 2.7–3.5 Ω/□，横向长 **23–35 nm < 45 nm 侧墙** |
 *   2.7–3.5 Ω/□ | **✓ 1×** |
 * | p⁺ 钉扎层 0.1 µm | 0.12–0.18 µm | Al⁺ 60 keV + RTA 900 °C/10 s ⇒ **0.088 µm**
 *   （慢端 D = 2.5e-13）；1000 °C 且 D 取快端 ⇒ **1.73 µm** | 0.1 µm |
 *   **1×–17×，而且是区间不是数**（缺口⑧：没有测结深的量具） |
 * | 热预算 | 两坡 3.96e-12（超） | RTA 1000 °C/10 s 的 **Dt = 1e-13**（B，D = 1e-14） |
 *   ≤3.615e-12 | **✓ 1/40 条坡** |
 *
 * **② RTO 为什么坡上不长大：** 800 → 1000 °C 用 150 K/s = **1.3 s**；
 * 坡上生长 = 2.2 nm/min × (1.3/60) min × 0.334（Ea = 2.0 eV 的分段积分，
 * `gate-stack.ts` 给的 0.334）= **0.016 nm**。对照炉子一条坡的 3–5.5 nm：
 * **差 200–340 倍**。这就是 RTO 与炉子的全部区别 —— 不是更热，是**没有坡**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 七、R8 —— 每一处降级与它的升级路线（13 条，每条都要数量级）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * | # | 降级 | 现在 | 原规格 | 恢复它要什么 | 缺口量级 |
 * |---|---|---|---|---|---|
 * | 1 | p 型掺杂剂 | Al⁺（27 amu） | B⁺（11 amu） | **B 链的源/富集缺口**：硼砂/硼酸 —— `boron` 全表 0 条，
 *   火星风化层几 ppm、**无品位出处**（暂不写数据）；地球上来自硬硼钙石/硼酸盐湖 | p⁺ 结深由 Al 的 D 定，
 *   而 D 横跨 **1e-13–1e-10**（B 是 1e-14 的给定值，见 `cis.ts:42`）⇒ 结深 0.09–1.7 µm，
 *   **差 1–17 倍**，区间随 SIMS 实测收窄（第 13 行）|
 * | 2 | n 型深能替代 | P⁺ 降能 | As⁺（75 amu） | 砷链：GaAs 或雄黄，全表 0 条 |
 *   同热预算下结深 **3–10 倍**；低能束传输（18 keV）效率再掉一档 |
 * | 3 | 束流 / 100 kV 电源 | **机窗口 0–240 µA**（30 keV/237 µA、100 keV/22 µA） | 1–10 mA | ① f 提到 10 kHz（n³ 定律：
 *   ΔV ∝ 1/fC，f 涨 10 倍 ⇒ 电流涨 10 倍）② 或气体源（PH₃，要氢 + 钢瓶 +
 *   −20 °C 吸附纯化）| **差 4–42× @30 keV**（45–450× @100 keV） |
 * | 4 | 能量上限 | 100 keV | 200–300 keV（高能注入机） | n 从 17 到 34 级 ⇒ 括号项
 *   从 3417 到 26 000（**7.6 倍**）⇒ 同一 fC 下电流再掉 7.6 倍 | 差 **2–3 倍** |
 * | 5 | 变压器方案 | **部件已建**：`plant/ion-implanter/hv-transformer`（implant-transformer.ts，
 *   SF₆ 干式 100–120 kV / 2–5 kW；只打过 10 kV） | 旋变 + 升压变压器 + 桥整 |
 *   100 kV 油浸变压器三样料（油/套管/真空浇注）仍无；SF₆ 方案绕开了它们，
 *   但 100 kV 未试压，束流仍受 column/source 限制 | 电源压降 1–3 % → 0.5 %
 *   的 2–6× **还没兑现**（变压器只解决电源，不解决 22 µA 的 fC 限制） |
 * | 6 | 磁场标定 | 安匝算 B（±5 %）| 高斯计 ±0.5 % | 霍尔片要 InSb，铟也没有
 *   （`mask-repair.ts:380`）| 质量刻度 **±5 %** ⇒ 同能量下 Rp 偏 ±2 % |
 * | 7 | RTA 测温 | 500–1000 °C 开环外推，±30–50 K | 全段 ±5 K | **已建 `plant/rta/pyrometer`**
 *   （rta-pyrometer.ts：1.55 µm InGaAs 种子 + 滤光片/透镜/前放；±5–10 K、1–10 ms）。
 *   400 Hz 斩波/锁相有（ellipsometer/chopper） | 差 **1–2 倍**；500 °C 端受发射率标定限制，
 *   且它不解决第 8 行的片内均匀性 |
 * | 8 | 片内均匀性（坡上） | **机窗口 ≤60 K**（等温 ±8 K、坡上 ±30 K） | ±5 K | **已建套件**（rta-uniformity.ts）：
 *   16 区控制 + 逐灯微调 + φ200 边缘补偿环 + 60 rpm 片自转，装进 `plant/rta`；
 *   窗口从 ≤60 K 压到 **≤5 K** | 差 **1 倍**；结深 ±1.25 % 对 ±2.5 %。
 *   逐灯微调只压灯管初始差异；**2000 h 后的老化漂移仍靠 #9 的灯管更换/补偿** |
 * | 9 | 灯的寿命与光衰 | 100–300 h、1 %/10 h | 2000 h、<5 %/2000 h | **碘**。
 *   已接 `make/rta-lamp-array`：**0.12 g 碘/24 只**，卤素循环 W + I₂ ⇌ WI₂，
 *   2.5 kW 灯丝 lifetime **1000–1500 h**（原 100–300 h）。碘种子 10 kg 够 8 万组灯。
 *   **降额到 40 kW 可到 1500–2000 h**，但最短升温时间从 1 s 退到 1.5 s；
 *   已接 `make/rta-lamp-array-long`：16 只 ×2.5 kW = 40 kW、1500–2000 h、
 *   ≤5 %/2000 h 设计值、升温 1.5 s。**现场换装**，不改 `plant/rta` 的 60 kW
 *   composedOf；2000 h/光衰/±5 K 都是设计值，没有光衰/测温实测；碘有本地路线
 *   （`make/iodine`），但 0.12 g/24 只仍是种子级用量，回收仍是主路。
 *   60 kW/2000 h 与 40 kW/2000 h 只能选一个。仍差 2000 h 上沿与 <5 %/2000 h 光衰 |
 *   差 **7–20 倍** → **1.3–2 倍**；降额后 1–1.3 倍，但功率退 1.5 倍 |
 * | 10 | 灯功率 | 10 kW 电 / 2.32 kW 吸收 | 40–60 kW | **已建 24 只 × 2.5 kW = 60 kW 灯阵**
 *   + 60–70 kW 干式调功器（500 cm² 铁芯、12 只可控硅）；反射罩/水冷按 6 倍放大。
 *   **60 kW 与 2000 h 不可兼得**：60 kW 时 1000–1500 h；40 kW 时 1500–2000 h |
 *   差 **1 倍**（60 对 40–60；降额则功率差 1.5 倍，寿命换回来） |
 * | 11 | 高压试验台 | 只能 10 kV **分段**试压 | 100 kV 整柱试压 | 
 *   **已建** `plant/hv-test-bench/source-100k`（34 只 3 kV 整流器 + 140 kg 石英，
 *   100 kV / 22 µA）与 `divider-100k`（10 只 10 kV 单元串，1 GΩ、1000:1、1–2 %）；
 *   两件都装进 `plant/hv-test-bench`，台子电压窗口 10 kV → **100 kV**。
 *   `pd-sensor`（UHF 环天线 + 40–60 dB 前放，5–50 pC）+ `pd-calibrator`
 *   （1–100 pC、0.5–2 µs）+ `charge-amp`（0.01 V/pC、100 kHz）+
 *   `coupling-cap-100k`（100 pF、100 kV、SF₆、≤3 pC）+
 *   `pd-peak-detector`（单次峰值保持 + DMM）+ `pd-rate-meter`（0–10 kHz 平均率）+
 *   `pd-shield-cage`（2×2×2 m、40–60 dB）+ `hv-filter-100k`（100 kΩ/100 pF、
 *   fc≈16 kHz）+ `corona-ring`（φ400×φ50）+ `pd-logger`（1 Hz 趋势）也装上了；
 *   并建了 `plant/pd-test-cell`（6×5×4 m、60–80 dB 屏蔽厅 + ≤0.1 Ω 接地网
 *   + 三相进线滤波）+ `source-100k-retrofit`（SF₆ 箱 + 均压环 + 光滑接头）
 *   与 `measure/pd-source-background`（0→100 kV 分 5 级）。
 *   **测量种子已接**：A/B 两套标准电容/齐纳/校准器/检测仪
 *   （`plant/hv-test-bench/standard-*-b` 等）、`pd-free-source-100k`、
 *   `uhf-pd-analyzer`；并加了本地可复制的 `uhf-spark-source`（0.5–2 ns 降级源）。
 *   能力上 PD-free 源/IEC 60270/UHF 快源+PDI 都有了。
 *   但 PD-free 源/UHF 分析仪仍是**单台进口种子**：R9 未闭合、绝对 pC 溯源依赖 A/B 量块；
 *   气候/安全联锁已补（`pd-cell-climate.ts` 的 hvac/联锁/放电棒/接地开关）；q_bg 按种子规格 0.5–1.5 pC 闭合（非实测）；
 *   逐脉冲/自动 PDIV 仍取决于 UHF 分析仪软件 |
 *   **能力闭合，R9/溯源黄**：100 kV 能加、能耦合、能定量、能 UHF；
 *   A/B 互比能查单台漂移，但查不出共同偏差；绝对 pC 仍是种子基准 |
 * | 12 | 氧 | **进气口可测、腔内仍开环** | 干氧 50–500 ppb 在线 | **三台氧量具已建**：`plant/oxygen-probe`（oxygen-metrology.ts:729，pO₂ 1e-15–1 atm、精度 ≤26 %）、`plant/dew-point-meter`（802）、`plant/inert-gas-fusion-analyzer`（764）；取样 0.1 L/min、样品池 1 cm³ |
 *   RTO 的氧化层化学计量与 RTA 腔体（1e-6 Pa）的残余氧**仍判不了** —— 量具测流动气体，测不了腔 |
 * | 13 | 结深与方阻的实测 | **SIMS + 四探针 + C-V 已建**（SRP 仍无） | 扩展电阻 ±5 nm 或
 *   1 MHz C-V ±2 % | **已建**：`plant/sims`（sims.ts:726，depthResolution 2.4–20 nm、RSF ≤10 %）+ `measure/sims-depth-profile`（sims.ts:1567，实测 7–9 nm、结深 137–167 nm）+ `plant/probe-station`（probe-station.ts:396，四探针方阻 0.001–1e6 Ω/□、C-V 1 MHz）；仍缺 SRP（扩展电阻 ±5 nm） | **p⁺ 那一格**由"只能交区间"变成**可实测 ±10 %**；
 *   区间 0.088–1.73 µm 退成退火前的不确定度 |
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 八、已知缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ① **没有氧分析仪。** RTO 的干氧气路 50–500 ppb、RTA 腔体在
 *    1000 °C 上石墨托放出的 CO/H₂O，都判不了。硅片进 RTA 会长 **1–2 nm** 原生氧 ——
 *    对 RTO 那是污染，对激活退火那是可接受的一层。照实写，不绕过。
 * ② **没有椭偏仪，所以栅氧厚度仍然是开环的。** 干涉仪 0.295 µm/条纹，
 *    1.5 nm = **0.005 条纹**（`gate-stack.ts:§一` 已经算过 4 nm 的 0.014 条纹）。
 *    RTO 把厚度从 4 nm 拉到 1.5–2.0 nm，但**判据还是"记账 + 漏不漏"**。
 * ③ **没有剂量量具。** 剂量 = 束流 × 时间的积分（法拉第杯 + 积分器）。二次电子
 *    抑制环 −300 V 若失效，读数高 **20–50 %**（δ = 0.2–0.5 @ 30–100 keV），而
 *    **没有任何东西能发现它失效** —— 片中不会报错，只会偏浅。
 * ④ **没有片温的直接量具**，见问题五。RTA 的降温曲线同样看不见（灯灭之后片自己
 *    从 1000 °C 掉到 500 °C 用 3–5 s，那一段的**淬火速率**决定 C54 的晶粒，
 *    而本层只能记账）。
 * ⑤ **模型表达力：`qty` 是正有理数，而能量/剂量/电流是强度量。** 22 µA、1e15 cm⁻²
 *    写不进 `uses`/`produces`，只能写成 `props` 的窗口。这不是本文件的写法问题，
 *    是模型没有"强度量"这一层 —— 与 `cis.ts` 八·③ 的 `minFeature` 同一个形状。
 * ⑥ **石墨托没有 SiC 涂层。** 裸石墨在 1000 °C 上放气与掉粉，颗粒落在片上就是
 *    结的漏电点。涂层要 SiC（硅烷 + 1470 °C），本层没有硅烷。
 * ⑦ **靶室的机械扫描没有位置反馈。** 本层没有光栅尺（`plant/laser-stage` 有干涉
 *    测长，但那是另一台机器上的），扫描位置靠丝杠记数 ⇒ 重叠精度 ±50 µm，
 *    对 ±3 % 的剂量均匀性**刚好够**，再高就不行。
 * ⑧ **没有 SRP（扩展电阻）；SIMS、四探针与 C-V 已建** —— 与 §七·第 13 行同一处。
 *    后果不是"精度差"，是**p⁺ 那一格只能交区间**（0.088–1.73 µm），
 *    因为分不开"Rp 深"与"D 大"这两件事。`cis.ts:42` 给的 **1e-14 是硼的 D**
 *    （B，1000 °C 的给定值）—— p⁺ 走的是 Al（D = 2.5e-13–1e-10），所以只有它交区间；
 *    n⁺ 的 0.152 µm 是借这个量级记账的，磷自己的 D 没有给定值。
 * ⑨ **`mat/silicide-wafer` 是 `gate-stack.ts` 的条目**，不在本文件的料表白名单里。
 *    这一处越界是**有意的**：`gate-stack.ts` §四 末句写着"C54 要 700–800 °C/30 s
 *    的 RTA（本层 0 台）"，那条括号就是本文件 `make/rtp-silicide-c54` 的入口。
 *    它是"片"不是"料"，白名单（料表）管不到它。
 */
import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目
//
// 两台机器（`composedOf`，不被任何路线产出 —— `mixed_production` 只有一条路：
// 定义走 composedOf、制造走 Route，两者不许同时出现在一个条目上）；
// 十二件零件（各有一条 `make/` 路线）；
// 四片片级条目（注入后 / RTA 后 / C54 后 / RTO 后）。
// ═══════════════════════════════════════════════════════════════════════════

export const IMPLANT_ITEMS: readonly Item[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1.1 两台机器
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 离子注入机。**一台机器，五个压力段：源 → 分析 → 加速 → 扫描 → 靶。**
   *
   * 交付的五格（全部是"能交出来的"，不是"被要求的"）：
   *
   *   energy      5–100 keV。上限由倍压柱定（17 级 × 3 kV × 2 = 102 kV 空载，
   *               压降到 3 % 时 100 kV），下限不是电源定的，是**束传输**定的：
   *               5 keV 的 P⁺ 在 100 V 的束空间电荷下就散开了。
   *   current     0.001–0.24 mA。看着寒酸，算法在 §二·②：n³ 定律，
   *               30 keV/237 µA、60 keV/63 µA、100 keV/22 µA。
   *   dose        1e12–1e16 cm⁻²。上界由时间定（1e16 @ 22 µA 要 7.9 h），
   *               不是由机器定。
   *   uniformity  ±2–4 %。机械扫描的重叠是几何决定的，比静电扫描稳。
   *   pressure    1e-4–1e-3 Pa。1e-3 Pa 下 λ = 10.4 m，0.3 m 的柱长上
   *               电荷交换损失 <5 %；1e-2 Pa 下 λ = 1 m，就开始丢束。
   *
   * **本层做不到的那三条写在文件头 §七**：硼没有、砷没有、束流差 45–450 倍。
   */
  {
    id: 'plant/ion-implanter',
    name: 'Ion Implanter', name_zh: '离子注入机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'energy', kind: 'range', min: 5, max: 100, unit: 'keV' },
      { param: 'current', kind: 'range', min: 0, max: 240, unit: 'µA' },
      { param: 'dose', kind: 'range', min: 1e12, max: 1e16, unit: 'cm⁻²' },
      { param: 'uniformity', kind: 'range', min: 0, max: 10, unit: '%', dir: 'atMost' },
      { param: 'pressure', kind: 'range', min: 1e-5, max: 1e-2, unit: 'Pa', dir: 'atMost' },
    ],
    holds: [
      { param: 'energy', min: 5, max: 100 },
      { param: 'pressure', min: 1e-5, max: 1e-2 },
    ],
    composedOf: [
      { item: 'plant/ion-implanter/source', qty: q(1) },
      { item: 'plant/ion-implanter/magnet', qty: q(1) },
      { item: 'plant/ion-implanter/accel-tube', qty: q(1) },
      { item: 'plant/ion-implanter/hv-column', qty: q(1) },
      // 100 kV 变压器：倍压柱之外的“变压器方案”，见 implant-transformer.ts
      { item: 'plant/ion-implanter/hv-transformer', qty: q(1) },
      { item: 'plant/ion-implanter/end-station', qty: q(1) },
      { item: 'plant/ion-implanter/vacuum-manifold', qty: q(1) },
    ],
  },

  /**
   * 快速热处理（RTA）。**卤素灯阵 + 冷壁石英腔 + 石墨托 + 光学测温。**
   *
   * 它为什么是这一层最要紧的一台：**炉子的最小时间刻度是 30 min，而这一台是 1 s。**
   * 热预算（Dt）与时间成正比 ⇒ 同一份 1000 °C 的退火，炉子给 1.8e-11（30 min），
   * 这一台给 1e-13（10 s）—— **差 180 倍**。四份文件的死结都是这一个比值。
   *
   * 交付的五格：
   *
   *   temperature   400–1200 °C。上限不是灯定的（60 kW 够 1500 °C），是**石英腔**
   *                 定的：石英长期使用 1100–1200 °C，再高就析晶变形。
   *   rampRate      1–400 K/s 可调，标称 150。算法在 §四·③④。
   *   soak          1–120 s。下限是调功器的一个周波（20 ms）与高温计的响应（10 ms），
   *                 实际能稳住的等温段是 1 s 起；判据里 C54 要 30 s。
   *   uniformity    ±8 K（等温）、±30 K（坡上）。判据 ±5 K。见 §四·⑤。
   *   pressure      5e4–2e5 Pa（氮或氩，常压冷壁）。**它不在真空里做** —— 
   *                 常压的好处是灯不必穿过真空密封窗，坏处是氧分压就是气源的纯度。
   *
   * ═══ 本地装配：炉体与 InGaAs 都已建 ═══
   *
   *   11 件零件都有路线：灯阵 60 kW（24×2.5 kW，碘 0.12 g，1000–1500 h）、
   *   反射罩（收集 0.65–0.70）、石英腔（上限 1150–1250）、石墨托（Cu-Fe 偶到
   *   250 °C）、调功器（12 只 1.6 kV/500 A 可控硅，60–70 kW，纹波 3–5 %）、
   *   装卸台、高温计、16 区控制、逐灯微调、边缘环、自转台。
   *
   *   高温计里的 `std/photodiode-ingaas` 曾判“无本地路线”；**2026-10-20 已建**
   *   （`make/photodiode-ingaas`，`data/machine/ingaas.ts`）。没有它时，400–1000 °C
   *   只能开环外推 ±30–50 K；有它才是 ±5–10 K。所以 `plant/rta` 已不在 7 条
   *   种子清单里；旧的“只卡 InGaAs”只作历史。不是“炉子造不出”。
   *
   *   不另写 `make/rta`：`composedOf` 已经是这 11 件的装配路线，再写一条
   *   只是把同一份 BOM 抄两遍（单一事实来源）。
   *
   * ═══ 能力窗口（由零件定）═══
   *
   *   temperature  400–1200 °C。上限是石英腔的 1150–1250，不是 60 kW 的灯。
   *   rampRate     1–400 K/s。60 kW 理论 1 s 升 1000 K（≈667 K/s），40 kW 1.5 s；
   *                条目把上限压到 400，标称 150。
   *   waferUniformity  16 区 + 逐灯微调 + 边缘环 + 60 rpm 只是执行器；片内 ≤5 K
   *                没有读数（rta-uniformity.ts 的 A 类缺口），不是本路线能交的。
   *   pressure     5e4–2e5 Pa 常压冷壁；不是真空。
   */
  {
    id: 'plant/rta',
    name: 'Rapid Thermal Processing Furnace', name_zh: '快速热处理炉',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'temperature', kind: 'range', min: 400, max: 1200, unit: '°C' },
      { param: 'rampRate', kind: 'range', min: 1, max: 400, unit: 'K/s' },
      { param: 'soak', kind: 'range', min: 1, max: 120, unit: 's' },
      // 16 区 + 逐灯微调 + 边缘环 + 60 rpm 自转后从 ≤60 K 降到 ≤5 K（R8 #8）
      // ±3 K 的那一档是 `plant/rta-zoned`（`rta-zoned.ts`）：本条目是 composedOf
      // 装配，不能再挂产出路线（`mixed_production`），所以变体整机单列。
      { param: 'waferUniformity', kind: 'range', min: 0, max: 5, unit: 'K', dir: 'atMost' },
      { param: 'pressure', kind: 'range', min: 5e4, max: 2e5, unit: 'Pa' },
    ],
    holds: [
      { param: 'temperature', min: 400, max: 1200 },
      { param: 'rampRate', min: 1, max: 400 },
      { param: 'pressure', min: 5e4, max: 2e5 },
    ],
    composedOf: [
      { item: 'plant/rta/lamp-array', qty: q(1) },
      { item: 'plant/rta/reflector', qty: q(1) },
      { item: 'plant/rta/quartz-chamber', qty: q(1) },
      { item: 'plant/rta/susceptor', qty: q(1) },
      { item: 'plant/rta/power-stack', qty: q(1) },
      { item: 'plant/rta/load-lock', qty: q(1) },
      // 1.55 µm InGaAs 高温计：测温从开环外推变成 ±5–10 K（rta-pyrometer.ts）
      { item: 'plant/rta/pyrometer', qty: q(1) },
      // 均匀性套件：16 区 + 逐灯微调 + 边缘环 + 60 rpm 自转（rta-uniformity.ts）
      { item: 'plant/rta/zone-control', qty: q(1) },
      { item: 'plant/rta/lamp-trim', qty: q(1) },
      { item: 'plant/rta/edge-ring', qty: q(1) },
      { item: 'plant/rta/rotation-stage', qty: q(1) },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 1.2 四片片级条目（判据落在结深、方阻、相位、厚度上）
  //
  // 全部 `unit: '片'`、不写 mass —— 一片的"质量"不是这道工序的判据
  // （与 `mat/gate-oxide-wafer` 同一种写法，质量守恒那一条也就不参与）。
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 注入完、还没退火的片。**这一格的全部意义是"结深由 Rp 定，不由扩散定"。**
   *
   *   energy       5–100 keV
   *   dose         1e12–1e16 cm⁻²
   *   tiltAngle    0–15°。**7° 是这一格的命门**：⟨100⟩ 硅的轴向沟道临界角
   *                对 100 keV 的 P⁺ 是 2–3°；不倾斜时沟道尾延伸到 Rp 的 **4–8 倍**
   *                （100 keV 时 0.5–1.0 µm，而 Rp 只有 0.135），7° 倾斜 + 22° 扭转
   *                把沟道份额压到 5 % 以下、尾部回到 **1.2 Rp**（0.16 µm）。
   *   junctionDepth 这一格记的是**注入后的 Rp**（100 keV P⁺ = 135 nm），
   *                **不是成品结深** —— 成品要过 RTA，见 `mat/rtp-annealed-wafer`。
   *                把两个数分开写，是为了让"注入决定一半、退火决定另一半"这句话
   *                在数据里看得见。
   *   uniformity   ±2–4 %（机械扫描）
   */
  {
    id: 'mat/implanted-wafer',
    name: 'Implanted Wafer', name_zh: '注入片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'energy', kind: 'range', min: 0, max: 200, unit: 'keV' },
      { param: 'dose', kind: 'range', min: 0, max: 1e17, unit: 'cm⁻²' },
      { param: 'tiltAngle', kind: 'range', min: 0, max: 45, unit: '°' },
      { param: 'junctionDepth', kind: 'range', min: 0, max: 2000, unit: 'nm', dir: 'atMost' },
      { param: 'uniformity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * RTA 退火完的片（激活 / 推进）。**热预算第一次成为可写的数。**
   *
   *   junctionDepth  成品结深 = Rp + 5.26√(Dt)。
   *                  100 keV P⁺：0.135 + 0.017 = **0.152 µm**（判据 0.15 ✓）
   *                  10 keV P⁺： 0.014 + 0.017 = **0.031 µm**（判据 20–30 nm ✓）
   *                  对照炉子的 0.34 µm（`gate-stack.ts:§四`）：**好 2.2 倍**
   *   thermalBudget  Dt，单位 cm²。**RTA 1000 °C/10 s = 1e-13**，
   *                  而炉子的一条坡就是 3.96e-12（`cis.ts:48`）—— 差 40 倍。
   *   rampRate       闭环压住的升温率（150 K/s 标称）
   *   uniformity     坡上 ±30 K ⇒ 结深 ±15 %；等温 ±8 K ⇒ ±4 %
   *   annealKind     激活 / 推进 / 硅化物 —— 同一条路线的三种用途，写成 enum
   */
  {
    id: 'mat/rtp-annealed-wafer',
    name: 'RTA Annealed Wafer', name_zh: 'RTA 退火片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'junctionDepth', kind: 'range', min: 0, max: 2000, unit: 'nm', dir: 'atMost' },
      { param: 'thermalBudget', kind: 'range', min: 0, max: 1e-9, unit: 'cm²', dir: 'atMost' },
      { param: 'rampRate', kind: 'range', min: 0, max: 2000, unit: 'K/s' },
      { param: 'uniformity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atMost' },
      { param: 'annealKind', kind: 'enum', values: ['activation', 'drive-in', 'silicide'] },
    ],
  },

  /**
   * C54 相的 TiSi₂ 片。**栅极那一半唯一一格"从差 5 倍变成达标"的。**
   *
   *   silicidePhase   c54（判据）/ c49（炉子能给的）
   *   sheetResistance C54 13–17 µΩ·cm ÷ 49 nm = **2.7–3.5 Ω/□**（判据，✓）
   *                   C49 60–100 µΩ·cm ÷ 49 nm = 12–20 Ω/□（差 4.5–6 倍）
   *   lateralGrowth   横向长出的宽度。炉子 700 °C/1800 s 给 0.1–0.15 µm，
   *                   爬过 45 nm 的侧墙 ⇒ 短路。RTA 750 °C/30 s：
   *                   √(30/1800) = 0.129、温度因子 √3 ⇒ **23–35 nm < 45 nm ✓**
   */
  {
    id: 'mat/c54-silicide-wafer',
    name: 'C54-Phase TiSi₂ Wafer', name_zh: 'C54 相的 TiSi₂ 片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'silicidePhase', kind: 'enum', values: ['c49', 'c54', 'none'] },
      { param: 'sheetResistance', kind: 'range', min: 0, max: 1000, unit: 'Ω/□', dir: 'atMost' },
      { param: 'lateralGrowth', kind: 'range', min: 0, max: 1000, unit: 'nm', dir: 'atMost' },
    ],
  },

  /**
   * RTO（快速热氧化）长完的栅氧片。**1.5–2.0 nm，而炉子最薄 4 nm。**
   *
   *   oxideThickness  1.5–2.0 nm。41 s 的等温（2.2 nm/min 口径）+ 坡上 0.016 nm。
   *   eot             1.5–2.0 nm（氧化物就是介质，不做高k 折算）
   *                   判据 1.2–1.5 ⇒ 差 1.0–1.7 倍（炉子是 2.7–3 倍）
   *   rampRate        150 K/s。**这一格是 RTO 与炉子的全部区别** ——
   *                   800→1000 °C 用 1.3 s，坡上只长 0.016 nm。
   *   uniformity      ±8 K ⇒ 厚度 ±2 %（Deal-Grove 线性区，厚度∝t 不∝T）
   *
   * ⚠️ 厚度**测不了**（无椭偏仪；干涉仪 0.295 µm/条纹，1.5 nm = 0.005 条纹）。
   * 所以这一格的 eot 是**开环声明**，判据 = 记账 + 成品"漏不漏"（`gate-stack.ts:§一` 同款）。
   */
  {
    id: 'mat/rto-wafer',
    name: 'Diffusion Furnace Oxidation', name_zh: '扩散炉氧化',
    unit: '片',
    category: 'part',
    props: [
      { param: 'oxideThickness', kind: 'range', min: 0, max: 50, unit: 'nm', dir: 'atMost' },
      { param: 'eot', kind: 'range', min: 0, max: 50, unit: 'nm', dir: 'atMost' },
      { param: 'rampRate', kind: 'range', min: 0, max: 2000, unit: 'K/s' },
      { param: 'uniformity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atMost' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 1.3 注入机的六件零件
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 固体进料电子轰击离子源（Nier 型，1940 年代同位素分离器的形状）。
   *
   * **为什么不是 LMIS**：`plant/mask-repair` 的 Au-Si 共晶源（363 °C）是为
   * 5 nm 束斑的 FIB 设计的，束流 1.5 pA；注入要 µA，差 **10⁶ 倍**。
   * 而且它只能给 Au 与 Si —— 一个掺杂剂都不给。
   *
   * **两只能换的炉胆**（这就是问题一的落地）：
   *   红磷  350–420 °C 升华，经 φ6 漏孔降到弧室 0.1 Pa；
   *   铝    1180 °C（Al 的蒸气压：1000 °C 3.3e-3 Pa、1200 °C 0.15 Pa）。
   *
   * 电离：钨丝阴极发 100–300 eV 的电子，穿过蒸气把它打成 P⁺/Al⁺，再由
   * 20–30 kV 的引出极拉出来。**没有磁场、没有等离子体腔** —— 这是本层造得出来的
   * 那一档，代价是电离效率 1e-3 与束流 µA 级。
   */
  {
    id: 'plant/ion-implanter/source',
    name: 'Solid-Feed Electron Bombardment Ion Source', name_zh: '固体进料电子轰击离子源',
    unit: '件',
    category: 'part',
    props: [
      { param: 'beamCurrent', kind: 'range', min: 0, max: 1000, unit: 'µA' },
      { param: 'ovenTemperature', kind: 'range', min: 20, max: 1400, unit: '°C' },
    ],
  },

  /**
   * 90° 磁扇质量分析器。r = 250 mm、B = 0.1–0.5 T、4000 匝 × 4 A。
   *
   * 全部算式在文件头 §三。这里只留三个数：
   *   fieldStrength  0.5 T（16 000 安匝 / 40 mm 气隙）
   *   massResolution M/ΔM = 125（1 mm 物缝 + 1 mm 像缝，r/(2Δr)）
   *   bendRadius     250 mm
   */
  {
    id: 'plant/ion-implanter/magnet',
    name: '90° Magnetic Sector Mass Analyzer', name_zh: '90° 磁扇质量分析器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'fieldStrength', kind: 'range', min: 0.005, max: 0.5, unit: 'T' },
      { param: 'massResolution', kind: 'range', min: 1, max: 1000, unit: 'M/ΔM' },
      { param: 'bendRadius', kind: 'range', min: 1, max: 1000, unit: 'mm' },
    ],
  },

  /**
   * 加速管。12 段石英绝缘环 + 12 只铝电极环，每段 8.3 kV。
   *
   * 为什么是 12 段：100 kV / 12 = **8.3 kV/段**，刚好落在 `plant/hv-test-bench`
   * 的 10 kV 下面 —— **这是本文件里唯一能整段试压的 100 kV 零件**。
   * 段间 10 mm、内径 φ80、沿面爬电 200 mm（干空气，2.5 kV/mm 的 1/25 余量）。
   */
  {
    id: 'plant/ion-implanter/accel-tube',
    name: 'Ion Implanter Accelerator Tube', name_zh: '离子注入机加速管',
    unit: '件',
    category: 'part',
    props: [
      { param: 'ratedVoltage', kind: 'range', min: 0, max: 300, unit: 'kV', dir: 'atLeast' },
      { param: 'sections', kind: 'range', min: 1, max: 100, unit: '段' },
    ],
  },

  /**
   * 倍压柱。**17 级全波倍压 = 34 只 3 kV 整流器 + 34 组 25 nF/6 kV 石英叠片。**
   *
   * 这是本文件最重的一件零件：**140 kg 石英**（34 组 × 36 片 φ200 × 1.5 mm）。
   * 为什么不是买现成的薄膜电容：`std/capacitor-film-general` 只到 **630 V**，
   * 而每级承 **6 kV** —— 一只都用不上（`capacitor.ts:56/73`）。
   *
   * 交付：空载 102 kV；1 kHz 上 100 kV / 22 µA（ΔV = 3 %）。
   */
  {
    id: 'plant/ion-implanter/hv-column',
    name: 'Ion Implanter Voltage Multiplier Column', name_zh: '离子注入机倍压柱',
    unit: '件',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 0, max: 200, unit: 'kV', dir: 'atLeast' },
      { param: 'current', kind: 'range', min: 0, max: 1000, unit: 'µA', dir: 'atLeast' },
      { param: 'ripple', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 靶室与终端站。**7° 倾斜 + 22° 扭转 + 机械扫描 + 法拉第杯。**
   *
   *   tiltAngle    7°（防沟道，见 `mat/implanted-wafer` 那一格的数）
   *   scanSpeed    0.5–5 cm/s，丝杠驱动、无光栅尺 ⇒ 重叠精度 ±50 µm
   *   cupAccuracy  剂量刻度 ±20 %（二次电子抑制环 −300 V 失效时高 20–50 %，
   *                而**没有任何东西能发现它失效** —— 缺口③）
   */
  {
    id: 'plant/ion-implanter/end-station',
    name: 'Ion Implanter Target Chamber and End Station', name_zh: '离子注入机靶室与终端站',
    unit: '件',
    category: 'part',
    props: [
      { param: 'tiltAngle', kind: 'range', min: 0, max: 60, unit: '°' },
      { param: 'scanSpeed', kind: 'range', min: 0, max: 100, unit: 'cm/s' },
      { param: 'cupAccuracy', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 真空机组与气路。五个压力段、三只阀门、一只冷阱。
   *
   * 抽气由 `plant/euv-vacuum` 提供（它 holds 1e-8–1 Pa，`euv-source.ts:377`），
   * 这一件是"把它接到五个段上去"的那一半：φ100 的管路、三只手动阀、一只液氮冷阱。
   * 没有冷阱，油返流落在片上就是金属污染 —— 而本层**判不了**（缺口）。
   */
  {
    id: 'plant/ion-implanter/vacuum-manifold',
    name: 'Ion Implanter Vacuum System and Gas Line', name_zh: '离子注入机真空机组与气路',
    unit: '件',
    category: 'part',
    props: [{ param: 'conductance', kind: 'range', min: 0, max: 10000, unit: 'L/s', dir: 'atLeast' }],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 1.4 RTA 的六件零件
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 钨丝卤素石英灯阵。**24 只 × 2.5 kW，合计 60 kW。**
   *
   * **碘现在有本地路线（`make/iodine`，reagents.ts），但 0.12 g/24 只仍是种子级用量。**
   * 有碘：W + I₂ ⇌ WI₂，壁 300 °C 时 WI₂ 分解、钨回到灯丝 ⇒ 壁一直透明，
   *       1000–1500 h（40 kW 长寿命阵按加粗灯丝做到 1500–2000 h）。
   * 没碘：钨直接蒸到壁上（3000 K 的蒸发率 ≈ 1.5e-9 g/(cm²·s)，算式见下）⇒
   *       **100 h 内壁黑化 20–40 %，光衰 1 %/10 h，寿命 100–300 h**。
   *
   * 后果不是"换灯贵"，是**升温率会随灯龄往下走**，而光通量没有任何量具能测
   * （缺口④）。所以每 20 h 要用一片标定片重标一次升温率 —— 这是 #23 同型的开环。
   */
  {
    id: 'plant/rta/lamp-array',
    name: 'RTA Furnace Tungsten-Halogen Quartz Lamp Array', name_zh: 'RTA 炉钨丝卤素石英灯阵',
    unit: '件',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 0, max: 100000, unit: 'W', dir: 'atLeast' },
      { param: 'filamentTemperature', kind: 'range', min: 1500, max: 3200, unit: 'K' },
      { param: 'lifetime', kind: 'range', min: 0, max: 10000, unit: 'h', dir: 'atLeast' },
    ],
  },

  /**
   * 40 kW 长寿命 RTA 灯阵。**现场可换件，不改 plant/rta 的 60 kW composedOf。**
   *
   *   power    40 kW（16 只 × 2.5 kW）
   *   lifetime 1500–2000 h
   *   decay    ≤5 %/2000 h
   *
   * 40 kW 降额换寿命：升温 1.5 s（不是 60 kW 的 1 s）。
   * 2000 h/±5 K/≤5 % 光衰都是设计值，没有光衰/测温实测；碘有本地路线
   * （`make/iodine`），但 0.08 g/16 只仍是种子级用量。
   */
  {
    id: 'plant/rta/lamp-array-long',
    name: '40 kW Long-Life RTA Lamp Array', name_zh: '40 kW 长寿命 RTA 灯阵',
    unit: '件',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 40000, max: 40000, unit: 'W' },
      { param: 'lifetime', kind: 'range', min: 1500, max: 2000, unit: 'h', dir: 'atLeast' },
      { param: 'decay', kind: 'range', min: 0, max: 5, unit: '%/2000 h', dir: 'atMost' },
    ],
  },

  /**
   * 反射罩。20 只椭球罩（灯在近焦点、片在远焦线）+ 一片镀金背反射罩。
   *
   *   收集效率 0.70（几何 0.8 × 罩面反射 0.88）
   *   正面：铝蒸镀 0.3 µm（可见–近红外反射 0.85–0.90）
   *   背面：金 0.1 µm（红外反射 0.98）—— **这一片决定了问题四里 A_eff = 1.5A
   *         这个数**：它把片背面的辐射反回去七成，正是 1.23 kW 而不是 1.64 kW 的原因。
   */
  {
    id: 'plant/rta/reflector',
    name: 'RTA Furnace Reflector', name_zh: 'RTA 炉反射罩',
    unit: '件',
    category: 'part',
    props: [{ param: 'collection', kind: 'range', min: 0, max: 1, unit: '—' }],
  },

  /**
   * 冷壁石英腔。φ300 × 400 mm，两端铸铁法兰，一片 φ60 的石英视镜。
   *
   * 上限就是它：石英长期 1100–1200 °C，再高析晶。所以 RTA 的 1200 °C 天花板
   * 不是灯的、不是片的，是**腔壁的**。想上 1350 °C 要换 SiC 或氧化铝腔 ——
   * 那就不是冷壁了，升温率会掉一个量级（热壁的热容大）。
   */
  {
    id: 'plant/rta/quartz-chamber',
    name: 'RTA Furnace Cold-Wall Quartz Chamber', name_zh: 'RTA 炉冷壁石英腔',
    unit: '件',
    category: 'part',
    props: [{ param: 'maxTemperature', kind: 'range', min: 0, max: 2000, unit: '°C', dir: 'atLeast' }],
  },

  /**
   * 石墨托 + 铜-铁热电偶 + 三根石英销。**问题五的落点。**
   *
   * 它同时干三件事：
   *   ① 托住片、带着它转（20 rpm，把方位角的不对称平均掉）；
   *   ② 挡灯：热电偶压在托里，**不在光路上** —— 裸露的焊球在灯场里高 50–150 K，
   *      压进 6 mm 石墨（热容 0.24 J/K）之后偏差降到 **20–60 K 且可标定**；
   *   ③ 提供 500–1000 °C 那一段的唯一读数（铜-铁偶到 250 °C，靠外推接上
   *      高温计的 1000 °C —— 见问题五）。
   *
   * ⚠️ 裸石墨没有 SiC 涂层（缺口⑥）：1000 °C 上放气与掉粉，颗粒落在片上就是漏电点。
   */
  {
    id: 'plant/rta/susceptor',
    name: 'RTA Graphite Susceptor', name_zh: 'RTA 石墨托',
    unit: '件',
    category: 'part',
    props: [
      { param: 'rotation', kind: 'range', min: 0, max: 200, unit: 'rpm' },
      { param: 'thermocoupleRange', kind: 'range', min: 0, max: 400, unit: '°C', dir: 'atLeast' },
    ],
  },

  /**
   * 调功与配电。20 只灯串并联 + 反并联可控硅相控 + 一台自己绕的灯变压器。
   *
   * `std/hv-thyristor-general` 是 **1.6 kV / 500 A**（`hv-semiconductor.ts:420`），
   * 而这里要 220 V / 45 A —— **一只就够，而且过剩 11 倍**。过剩不是错，
   * 是"本层只有这一档器件"的结果：想省，就得另开一条 50 A 的器件路线。
   *
   * ⚠️ 相控的代价：功率因数 0.6–0.7，且**灯电流里有 3–5 % 的 100 Hz 纹波**，
   * 这直接变成片上的温度纹波 —— 也就是 `plant/pyrometer` 读数上的 ±1–2 K 抖动。
   */
  {
    id: 'plant/rta/power-stack',
    name: 'RTA Furnace Power Control and Distribution', name_zh: 'RTA 炉调功与配电',
    unit: '件',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 0, max: 100000, unit: 'W', dir: 'atLeast' },
      { param: 'ripple', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 装卸与旋转。石英叉 + 三根石英销 + 一只磁耦合的转轴。
   *
   * **没有步进电机**（本层没有步进电机条目，也没有伺服）：转速靠
   * "感应电机 + 摩擦轮"给三档（5 / 20 / 60 rpm），片在托上的位置靠三根销限位。
   * 代价：**装卸位置不可编程**，每片都要人（或机器人）对位 —— 一片 20 s。
   */
  {
    id: 'plant/rta/load-lock',
    name: 'RTA Furnace Load-Lock and Rotation', name_zh: 'RTA 炉装卸与旋转',
    unit: '件',
    category: 'part',
    props: [{ param: 'handlingTime', kind: 'range', min: 0, max: 600, unit: 's', dir: 'atMost' }],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线
//
// 12 条零件路线（每件一条：材料 + 设备 + 条件）
//  6 条工艺路线（3 条注入 + 1 条激活 + 1 条 C54 + 1 条 RTO）
//
// 接力：
//   硅片 →[注入 n⁺ 100 keV]→ 注入片 →[RTA 1000 °C/10 s]→ 退火片（0.152 µm）
//   硅片 →[注入 p⁺ 60 keV]→ 注入片 →[RTA 900 °C/10 s]→ 退火片（0.088–1.73 µm）
//   硅片 →[场区注入 30 keV]→ 注入片
//   硅片 →[RTO 1000 °C]→ RTO 片（1.5–2.0 nm）
//   硅化物片 →[RTA 750 °C/30 s]→ C54 片（2.7–3.5 Ω/□）
// ═══════════════════════════════════════════════════════════════════════════

export const IMPLANT_ROUTES: readonly Route[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 2.1 注入机的六件零件
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 离子源：石墨坩埚座 + 钨丝阴极 + 石英绝缘 + 钢壳水冷套。
     *
     *   进   钨粉 0.05 + 石墨 0.5 + 石英 0.2 + 钢板 3 + 铜 1 + 氩 0.01
     *   出   离子源 1 件
     *
     * 四道工序：车坩埚座与引出极 → 磨绝缘子端面 → 绕阴极与装漏孔 → 20 kV 引出极试压。
     *
     * **漏孔是这一件最关键的一处**：φ6 的孔把炉胆的 10²–10³ Pa 降到弧室的 0.1 Pa。
     * 孔大一点，弧室就被蒸气压顶到 1 Pa 以上，束流散；孔小一点，束流不够。
     * 它没有量具可测（没有质谱、没有真空计到 0.1 Pa 的那一档），**靠试打调**。
     *
     * ⚠️ 没有质谱检漏（`euv-source.ts` 那一套的缺口），漏率只判到 1e-3 Pa·L/s。
     * 对 1e-3 Pa 的工作压强够用（本底 1e-4 Pa），对 1e-5 不够。
     */
    id: 'make/ion-implanter-source',
    name: 'Solid-Feed Electron Bombardment Ion Source Manufacturing', name_zh: '固体进料电子轰击离子源制造',
    produces: [
      {
        item: 'plant/ion-implanter/source',
        qty: q(1),
        gives: [
          { param: 'beamCurrent', kind: 'range', min: 50, max: 300 },
          { param: 'ovenTemperature', kind: 'range', min: 20, max: 1250 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(3) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/clean-room'],
    steps: [
      {
        note_zh:
          '车石墨坩埚座 φ30×40 与引出极（φ1 的孔，同心 0.05）：石墨要磨不能车，先粗车再磨',
        performedBy: 'lathe',
      },
      {
        note_zh: '磨石英绝缘子两端面（平面度 0.02，Ra 0.8）—— 端面不平就沿面放电',
        performedBy: 'plant/grinder',
      },
      {
        note_zh:
          '绕钨丝阴极（φ0.3、12 圈、φ6 的螺旋）与装 φ6 漏孔板；装反射极与电离室屏。**漏孔的孔径只能靠试打调** —— 没有 0.1 Pa 那一档的真空计，也没有质谱',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '20 kV 引出极耐压：干空气、段间 10 mm。**只试得了单件** —— 整柱的 100 kV 拆 10 段试（见 `make/ion-implanter-hv-column`）',
        performedBy: 'plant/hv-test-bench',
      },
    ],
    rate: { hours: q(60) },
    unbalanced_zh:
      '钨粉 0.05 + 石墨 0.5 + 石英 0.2 + 钢板 3 + 铜 1 + 氩 0.01 + 水 5 → 离子源 1 件；余是石墨粉尘、磨削液与试压时烧掉的电极。产物按件计，不做质量守恒',
  },

  {
    /**
     * 磁扇：软铁轭与磁极 + 4000 匝铜线 + 真空腔。
     *
     *   进   铜线 51 + 铁 25 + 钢板 12 + 石英 2 + 水 20
     *   出   磁扇 1 件
     *
     * ── 绕组（全部可算，与 `mask-repair.ts:944` 同一个式子）────────────────
     *
     *   NI = B·g/μ₀ = 0.5 × 0.04 / 4π×10⁻⁷ = 15 900 安匝
     *   4000 匝 × 4 A = 16 000 安匝 ✓
     *   φ1.5 mm 铜线、均长 0.8 m ⇒ 3 200 m、A = 1.767 mm²、R = ρL/A = 31 Ω
     *   铜损 4² × 31 = **500 W**（水冷，2.3 A/mm²）
     *   质量 3 200 m × 1.767 mm² × 8.96 = **51 kg 铜** ✓（这就是 51 这个数）
     *
     * ── 磁场标不了（`mask-repair.ts:379` 缺口⑤）──────────────────────────
     *
     *   0.06 T 那只 Wien 靠"励磁电流定"，这台靠"安匝算"，误差 ±5 %。
     *   质量刻度只能用**已知离子反推**：P⁺(31) 的束最亮时的安匝 × μ₀/g = B，
     *   与 √(2MV)/r 对表。这样做能把 ±5 % 压到 ±2–3 %，但**每次换离子要重对**。
     */
    id: 'make/ion-implanter-magnet',
    name: '90° Magnetic Sector Mass Analyzer Manufacturing', name_zh: '90° 磁扇质量分析器制造',
    produces: [
      {
        item: 'plant/ion-implanter/magnet',
        qty: q(1),
        gives: [
          { param: 'fieldStrength', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'massResolution', kind: 'range', min: 100, max: 150 },
          { param: 'bendRadius', kind: 'range', min: 245, max: 255 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper-wire', qty: q(51) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(25) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(12) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(4) }] },
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh:
          '车磁极面：R250 的扇形、40 mm 气隙、两极面平行度 0.02。**这一处决定质量分辨** —— 气隙差 1 % 就是 Δr 差 2.5 mm，比 1 mm 的像缝还大',
        performedBy: 'lathe',
      },
      { note_zh: '绕两组 4000 匝 φ1.5 漆包线（分层、垫绝缘纸），层间垫 0.1 mm 石英纸', performedBy: 'plant/winder' },
      {
        note_zh:
          '装铁轭、装 300×300×60 的真空腔（1 mm 不锈钢，两侧各有 φ80 的束管口）、接管与水路。抽到 1e-3 Pa、通 4 A 看线圈温升 ≤40 K',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '定标：**没有高斯计**，用安匝算 B（±5 %），再用"P⁺ 束最亮"反推。恒温间 ±1 K 是气隙量得准的前提（气隙热胀 12e-6/K × 40 mm × 1 K = 0.5 µm）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(120) },
    unbalanced_zh:
      '铜线 51 + 铁 25 + 钢板 12 + 石英 2 + 铜 4 + 水 20 → 磁扇 1 件；余是漆包线的绝缘层（约 1.5 kg 漆）与绕线废头。产物按件计',
  },

  {
    /**
     * 加速管：12 段石英绝缘环 + 12 只铝电极环，每段 8.3 kV。
     *
     *   进   石英 6 + 铝 4 + 钢板 8 + 玻璃 2
     *   出   加速管 1 件
     *
     * **8.3 kV/段这个数是有意的**：`plant/hv-test-bench` 只到 10 kV，
     * 所以把 100 kV 切成 12 段之后，**每一段都能整段试压**。这是本文件里
     * 唯一一处"降级反而不吃亏"的地方 —— 分段是绝缘的常规做法，不是为了迁就试压台。
     *
     * 沿面爬电 200 mm：干空气 2.5 kV/mm 的击穿场强，8.3 kV 要 3.3 mm 的净距；
     * 取 10 mm 净距 + 200 mm 沿面（沿面按净距的 3–5 倍取）。
     */
    id: 'make/ion-implanter-accel-tube',
    name: 'Ion Implanter Accelerator Tube Manufacturing', name_zh: '离子注入机加速管制造',
    produces: [
      {
        item: 'plant/ion-implanter/accel-tube',
        qty: q(1),
        gives: [
          { param: 'ratedVoltage', kind: 'range', min: 100, max: 120 },
          { param: 'sections', kind: 'range', min: 12, max: 12 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(6) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(4) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(8) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/clean-room'],
    steps: [
      { note_zh: '磨 12 只石英绝缘环：φ100×φ80×10，两端面平行度 0.02、Ra 0.4', performedBy: 'plant/grinder' },
      { note_zh: '车 12 只铝电极环：内径 φ80、厚 2 mm、外缘倒圆 R1（防场致发射）', performedBy: 'lathe' },
      {
        note_zh:
          '叠装 12 段、装两端法兰与均压环；段间用 10 mm 的净距与 200 mm 的沿面。**没有真空浇注环氧**，所以是干空气绝缘 + 端面压紧',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '每段 8.3 kV、1 min 耐压 + 泄漏电流 <10 µA。12 段全过才叠装 —— 这一件是 100 kV 柱上唯一"整件试得了"的部分',
        performedBy: 'plant/hv-test-bench',
      },
    ],
    rate: { hours: q(80) },
    unbalanced_zh:
      '石英 6 + 铝 4 + 钢板 8 + 玻璃 2 + 水 10 → 加速管 1 件；余是磨削的石英粉与车削的铝屑。产物按件计',
  },

  {
    /**
     * 倍压柱：**34 只 `std/hv-rectifier-general` + 34 组 25 nF/6 kV 石英叠片。**
     *
     *   进   3 kV 整流器 68 + 石英 140 + 铝 6 + 铜 12 + 铁 20 + 钢板 20 + 水 30
     *   出   倍压柱 1 件
     *
     * ── 为什么整流器是 68 只而不是 34 只 ─────────────────────────────────
     *
     *   全波倍压 17 级，每级 2 只整流器 = **34 只**。但每只承受的反压是
     *   **2·V_peak = 6 kV**，而 `std/hv-rectifier-general` 只到 3.0 kV
     *   ⇒ 每个位置要 **2 只串联** ⇒ **68 只**。
     *   （串联要并联均压电阻 —— 本层没有高压电阻，`hv-test-bench/divider` 用的是
     *    1 MΩ 的水电阻，见 `hv-semiconductor.ts:171`。这里用水柱均压，代价是
     *    **要防水冻**：火星夜里 −80 °C，柱里不能留水。）
     *
     * ── 电容（本件最重的一处）─────────────────────────────────────────────
     *
     *   每级 25 nF / 6 kV。一只 φ200 × 1.5 mm 石英叠片：
     *     C = ε₀·3.8·π·0.1²/1.5e-3 = **0.705 nF**，耐压 1.5 mm × 4 kV/mm = 6 kV ✓
     *   36 片并联 = 25.4 nF。34 组 × 36 片 = **1 224 片**、每片 0.104 kg = **127 kg**
     *   （写成 140 kg 是含 10 % 备片）。
     *   **为什么不能用 `std/capacitor-film-general`**：它只到 630 V，而这里要 6 kV
     *   —— 差 **9.5 倍**，串 10 只也不够（容量掉到 1/10，压降 ×10）。
     *
     * ── 试压：10 段 ─────────────────────────────────────────────────────
     *
     *   `plant/hv-test-bench` 只到 10 kV（它的 transformer 与 divider 都写着 10 kV）。
     *   34 级拆成 10 段、每段 3–4 级（18–24 kV）—— **段内试得了、段间试不了**。
     *   这是 R8 第 11 行：差 10 倍，段间与沿面爬电的那一半只能靠设计余量。
     */
    id: 'make/ion-implanter-hv-column',
    name: 'Ion Implanter Voltage Multiplier Column Manufacturing', name_zh: '离子注入机倍压柱制造',
    produces: [
      {
        item: 'plant/ion-implanter/hv-column',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 100, max: 102 },
          { param: 'current', kind: 'range', min: 22, max: 237 },
          { param: 'ripple', kind: 'range', min: 1, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/hv-rectifier-general', qty: q(68) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(140) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(6) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(12) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(20) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(30) }] },
    ],
    needs: ['plant/clean-room'],
    steps: [
      {
        note_zh:
          '磨 1 224 片 φ200×1.5 mm 石英片（厚度差 ≤0.02 mm —— 厚度差 1 % 就是容量差 1 %，34 组串起来就变成压降的不对称）+ 切 1 258 片铝箔 φ190×0.02',
        performedBy: 'plant/grinder',
      },
      {
        note_zh:
          '车 34 只电容壳与 34 只级间隔板（φ220 的胶木环不行 —— 没有胶木，用石英环 + 钢法兰），装 68 只整流器的两列支架',
        performedBy: 'lathe',
      },
      {
        note_zh:
          '叠 34 组（每组 36 片石英 + 37 片铝箔，压力 0.3 MPa 排除气隙），再把 34 组按全波倍压接成两列；均压用水柱（1 MΩ 级，同 `hv-test-bench/divider` 的手法），**柱里不能留水过夜**',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '空载升到 30 kV、再分段到 10 段 × 10 kV 试压 1 min，泄漏 <50 µA；**整柱 100 kV 试不了**（试压台只到 10 kV）—— 这一处只能靠设计余量，记 R8 第 11 行',
        performedBy: 'plant/hv-test-bench',
      },
    ],
    rate: { hours: q(400) },
    unbalanced_zh:
      '整流器 68 只 + 石英 140 + 铝 6 + 铜 12 + 铁 20 + 钢板 20 + 水 30 → 倍压柱 1 件；余是磨掉与崩边的石英（约 14 kg）、铝箔边角与 68 只整流器的封装料。产物按件计',
  },

  {
    /**
     * 靶室：7° 片台 + 机械扫描 + 法拉第杯 + 束流积分器。
     *
     *   进   钢板 120 + 铸铁 60 + 铝 15 + 石英 4 + 铜 10 + 铜线 3
     *        + 运放 2 + 计数器 2 + 稳压管 2
     *   出   靶室 1 件
     *
     * ── 剂量怎么算（这一件的全部意义）─────────────────────────────────────
     *
     *   dose[cm⁻²] = Q[C] / (1.602e-19 × A[cm²])，A = π×5² = **78.5 cm²**
     *   ⇒ **1 µC 的电荷 = 7.95×10¹⁰ cm⁻²**
     *   ⇒ 22 µA × 60 s = 1.32 mC = **1.05×10¹⁴ cm⁻²**
     *
     *   积分器：`std/opamp-chip-general` 做 I→V 积分，`std/counter-chip-general`
     *   把积分器的过零计成脉冲（1 个脉冲 = 一个已知的电荷量），`std/zener-reference-general`
     *   给二次电子抑制环的 −300 V 基准（分压后）。
     *
     * ⚠️ **没有剂量量具**（缺口③）：积分器本身不可校准。二次电子抑制环失效时读数
     *   高 20–50 %（δ = 0.2–0.5 @ 30–100 keV），而**没有任何东西能发现它失效**。
     */
    id: 'make/ion-implanter-end-station',
    name: 'Ion Implanter Target Chamber and End Station Manufacturing', name_zh: '离子注入机靶室与终端站制造',
    produces: [
      {
        item: 'plant/ion-implanter/end-station',
        qty: q(1),
        gives: [
          { param: 'tiltAngle', kind: 'range', min: 7, max: 7 },
          { param: 'scanSpeed', kind: 'range', min: 0.5, max: 5 },
          { param: 'cupAccuracy', kind: 'range', min: 10, max: 50 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(120) }] },
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(60) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(15) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(4) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(10) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(3) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(40) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '焊 400×400×400 的靶室（1 mm 钢板 + 加强筋），开 φ80 的束入口与 4 只观察窗', performedBy: 'plant/sheet-shop' },
      {
        note_zh:
          '车铸铁片台：φ110 的台面、7° 的斜面（这一处是整套工艺的命门，±0.05° 就要重做）、22° 扭转刻度环；车法拉第杯（φ60 深杯 + −300 V 抑制环）',
        performedBy: 'lathe',
      },
      {
        note_zh:
          '装 x-y 丝杠扫描台（行程 ±75 mm、丝杠记数、**没有光栅尺** ⇒ 重叠精度 ±50 µm）与 20 rpm 的自转；装积分器、计数器与抑制环的 −300 V 电源',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '量 7°：用 `plant/comparator` 的正弦规压出 7°、与片台斜面互检 —— 本层没有角度量具到 0.01°，只能到 0.05°',
        performedBy: 'plant/comparator',
      },
    ],
    rate: { hours: q(200) },
    unbalanced_zh:
      '钢板 120 + 铸铁 60 + 铝 15 + 石英 4 + 铜 10 + 铜线 3 + 运放 2 + 计数器 2 + 稳压管 2 + 水 40 → 靶室 1 件；余是焊材、机加工屑与三只试制的抑制环。产物按件计',
  },

  {
    /**
     * 真空机组与气路：五个压力段、三只阀门、一只冷阱。
     *
     *   进   钢板 60 + 铜 8 + 玻璃 3 + 石英 1 + 水 10
     *   出   机组 1 件
     *
     * 抽气本身是 `plant/euv-vacuum` 的事（1e-8–1 Pa，`euv-source.ts:377`）；
     * 这一件只做"把一台泵接到五个段上"的那一半。
     *
     * **冷阱为什么必须有**：油扩散泵的返流落在片上就是金属污染，而注入是
     * **最后一堵挡不住污染的工序** —— 注入进去的金属就留在硅里了（后面没有
     * 能把它赶走的步骤）。所以液氮冷阱是工艺件，不是可选项。
     * 液氮从 `plant/air-separator` 来 —— 不在本文件白名单，记在这里。
     */
    id: 'make/ion-implanter-vacuum-manifold',
    name: 'Ion Implanter Vacuum System and Gas Line Manufacturing', name_zh: '离子注入机真空机组与气路制造',
    produces: [
      {
        item: 'plant/ion-implanter/vacuum-manifold',
        qty: q(1),
        gives: [{ param: 'conductance', kind: 'range', min: 500, max: 2000 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(60) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(8) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(3) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/euv-vacuum'],
    steps: [
      { note_zh: '弯管与焊法兰：φ100 的无缝钢管 5 段，两端翻边 + 铸铁法兰（没有银钎料，全部是机械密封）', performedBy: 'plant/sheet-shop' },
      { note_zh: '车三只手动阀的阀座与阀芯（氟橡胶密封圈没有，用石墨垫 + 压环）', performedBy: 'lathe' },
      { note_zh: '装冷阱（φ200×300 的铜盘管 12 圈 + 玻璃筒）、接管、涂酒精查漏', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(80) },
    unbalanced_zh:
      '钢板 60 + 铜 8 + 玻璃 3 + 石英 1 + 水 10 → 机组 1 件；余是管材边角与查漏用的酒精。产物按件计',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.2 RTA 的六件零件
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 灯阵：24 只 2.5 kW 卤素石英灯（60 kW），不是 20 只 500 W 的真空灯。
     *
     *   进   钨粉 0.03 + 石英 3 + 玻璃 1.2 + 铜 6 + 碘 0.00012 + 氩 0.0024 + 水 30
     *   出   灯阵 1 件（60 kW，1000–1500 h）
     *
     * 灯丝 φ0.3、577 mm 卷成 φ6 × 15 的螺旋；2.5 kW 的热点比 500 W 高，
     * 靠 5 kPa 氩 + 0.12 g 碘的卤素循环把钨送回来。没有碘时钨直接蒸到壁上：
     * 3000 K 的蒸发率 1.5e-9 g/(cm²·s)，100 h 掉约 2 mg、壁黑 20–40 %，
     * 寿命掉到 100–300 h。
     *
     * 碘现在有本地路线（`make/iodine`，reagents.ts），但 0.12 g/24 只仍是
     * 种子级用量；碘断供就退化为真空灯。光衰没有量具能测（缺口④），
     * 只能每 20 h 用标定片重标升温率。
     */
    id: 'make/rta-lamp-array',
    name: 'RTA Furnace Tungsten-Halogen Quartz Lamp Array Manufacturing', name_zh: 'RTA 炉钨丝卤素石英灯阵制造',
    produces: [
      {
        item: 'plant/rta/lamp-array',
        qty: q(1),
        gives: [
          // 24 只 × 2.5 kW = 60 kW（原 20 × 0.5 kW = 10 kW）
          { param: 'power', kind: 'range', min: 60000, max: 60000 },
          { param: 'filamentTemperature', kind: 'range', min: 2900, max: 3050 },
          // 2.5 kW 灯丝比 0.5 kW 粗、蒸发快；卤素循环把寿命从 100–300 h 拉到 1000–1500 h
          { param: 'lifetime', kind: 'range', min: 1000, max: 1500 },
        ],
      },
    ],
    uses: [
      // 24 只 2.5 kW 灯：钨丝 φ0.3、钨 0.03 kg；石英/铜/水按 1.2 倍放大
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(3, 100) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(3) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(6, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(6) }] },
      // 24 只灯共用 0.12 g 碘（每只 1–5 mg 的上沿）
      { anyOf: [{ item: 'mat/iodine', qty: q(3, 25000) }] },
      // 5 kPa 氩：2.5 kW 灯腔稍大，取 2.4 g 含吹扫
      { anyOf: [{ item: 'mat/argon', qty: q(3, 1250) }] },
      { anyOf: [{ item: 'mat/water', qty: q(30) }] },
    ],
    needs: ['plant/clean-room'],
    steps: [
      {
        note_zh:
          '绕灯丝：φ0.3 的钨丝 577 mm 卷成 φ6 × 15 的螺旋（31 圈），两端焊 φ1 的钨引线；2.5 kW 灯丝比 0.5 kW 粗 1.5 倍，螺距不匀就会有一段过热、寿命砍半',
        performedBy: 'plant/winder',
      },
      {
        note_zh:
          '封泡壳：φ12 × 250 的石英管，一端封圆、一端压扁封钨引线，抽到 1e-3 Pa 后充 **5 kPa 氩 + 0.12 g 碘**，烧封。**卤素循环**：W + I₂ ⇌ WI₂，壁 300 °C 时 WI₂ 分解、钨回灯丝 ⇒ 壁不黑，2.5 kW 灯丝寿命 1000–1500 h；碘少一点就退化成真空泡（100–300 h）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '装灯座与引线（玻璃绝缘 + 铜片）、20 只一串并成一组；通电 10 min 看有无早期失效，灯电流记在座上（**每组都要记，因为光衰不一样**）',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(200) },
    unbalanced_zh:
      '钨粉 0.03 + 石英 3 + 玻璃 1.2 + 铜 6 + 碘 0.00012 + 氩 0.0024 + 水 30 → 灯阵 1 件（24 只 × 2.5 kW）；余是烧封时废掉的石英管（约 30 %）与钨丝废头。碘 0.12 g 是 24 只灯的上沿（每只 1–5 mg），产物按件计',
  },

  {
    /**
     * **40 kW 长寿命灯阵：16 只 ×2.5 kW，同工艺、钨丝加粗、碘按比例。**
     *
     *   16 只灯 → 40 kW；灯丝比 60 kW 的 24 只粗，热点温度降一档；
     *   碘 0.08 g（16/24 × 0.12 g），仍是卤素循环。
     *
     * 40 kW 降额换 1500–2000 h；**升温 1.5 s，不是 60 kW 的 1 s**。
     * 光衰 ≤5 %/2000 h 是设计值，没有光衰/测温实测；碘有本地路线
     * （`make/iodine`），但 0.08 g/16 只仍是种子级用量。
     */
    id: 'make/rta-lamp-array-long',
    name: '40 kW Long-Life RTA Lamp Array Manufacturing', name_zh: '40 kW 长寿命 RTA 灯阵制造',
    produces: [
      {
        item: 'plant/rta/lamp-array-long',
        qty: q(1),
        gives: [
          { param: 'power', kind: 'range', min: 40000, max: 40000 },
          { param: 'lifetime', kind: 'range', min: 1500, max: 2000 },
          { param: 'decay', kind: 'range', min: 0, max: 5 },
        ],
      },
    ],
    uses: [
      // 16 只 2.5 kW 灯：钨丝加粗，钨 0.025 kg；石英/铜/水按 16/24 缩小
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(1, 40) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(2) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(4, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(4) }] },
      // 16 只灯共用 0.08 g 碘（16/24 × 0.12 g）
      { anyOf: [{ item: 'mat/iodine', qty: q(1, 12500) }] },
      // 5 kPa 氩：16 只灯腔取 1.6 g 含吹扫
      { anyOf: [{ item: 'mat/argon', qty: q(1, 625) }] },
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(200) },
    steps: [
      {
        note_zh:
          '① 绕灯丝：16 只 ×2.5 kW，钨丝比 60 kW 灯阵加粗；φ0.35 钨丝卷成 φ6 × 15 螺旋，两端焊钨引线。热点温度降一档，寿命才是 1500–2000 h',
        performedBy: 'plant/winder',
      },
      {
        note_zh:
          '② 封泡壳：16 只 φ12 × 250 石英管，抽到 1e-3 Pa 后充 5 kPa 氩 + 0.08 g 碘（16/24 比例），烧封。卤素循环 W + I₂ ⇌ WI₂；碘少一点就退化成真空泡',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '③ 装灯座/引线：16 只灯分两组，每组 8 只串联；通电 10 min 看早期失效，灯电流逐只记录（光衰不一样）。现场换装到 plant/rta，不改 60 kW composedOf',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '钨粉 0.025 + 石英 2 + 玻璃 0.8 + 铜 4 + 碘 0.00008 + 氩 0.0016 + 水 20 → 长寿命灯阵 1 件（16 只 ×2.5 kW）；余是烧封废石英（约 30 %）与钨丝废头。碘 0.08 g 是 16 只灯的上沿，产物按件计',
  },

  {
    /**
     * 反射罩：20 只椭球罩（铝蒸镀）+ 一片镀金背反射罩。
     *
     *   进   铝 8 + 金 0.05 + 钢板 35 + 石英 2 + 矿棉 1
     *   出   反射罩 1 件
     *
     * **那 0.05 kg 金是全文件最要紧的一小笔**：背面反射罩在 1–3 µm 的反射率
     * 0.98（铝只有 0.90 且会氧化）。这一个数决定问题四里 A_eff = 1.5A 而不是 2A，
     * 也就决定 1000 °C 上要补 1.23 kW 而不是 1.64 kW。
     *
     * 椭球的几何：灯（近焦点）到片（远焦线）的成像比 1:1.4，罩口径 φ120、
     * 收集半角 62° ⇒ 几何收集率 0.8；罩面铝 0.88 ⇒ **0.70**（就是 §四·② 那一条）。
     */
    id: 'make/rta-reflector',
    name: 'RTA Furnace Reflector Manufacturing', name_zh: 'RTA 炉反射罩制造',
    produces: [
      {
        item: 'plant/rta/reflector',
        qty: q(1),
        gives: [{ param: 'collection', kind: 'range', min: 0.65, max: 0.7 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(48, 5) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(3, 50) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(42) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(12, 5) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(6, 5) }] },
    ],
    needs: ['plant/euv-coater'],
    steps: [
      { note_zh: '旋压 24 只椭球罩（1.5 mm 铝板，φ120、深 60）与一片 φ200 的球面背罩', performedBy: 'plant/sheet-shop' },
      { note_zh: '抛光罩面：Ra 20 nm（罩面粗糙度直接乘在反射率上，1 % 的散射就是 1 % 的收集率）', performedBy: 'plant/grinder' },
      { note_zh: '蒸镀：罩面铝 0.3 µm（反射 0.88）、背罩金 0.1 µm（红外反射 0.98）', performedBy: 'plant/evaporator' },
      { note_zh: '装水冷夹套与矿棉隔热，24 只罩按 12 区排布（内 6 / 中 8 / 边 10，边上多给 30 % 补偿缘冷）', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(120) },
    unbalanced_zh:
      '铝 9.6 + 金 0.06 + 钢板 42 + 石英 2.4 + 矿棉 1.2 → 反射罩 1 件（24 只）；余是旋压边角（铝约 3.6 kg）与蒸镀的靶料损耗。产物按件计',
  },

  {
    /**
     * 冷壁石英腔：φ300 × 400、两端铸铁法兰、一片 φ60 视镜。
     *
     *   进   石英 5 + 钢板 15 + 玻璃 1 + 矿棉 2
     *   出   石英腔 1 件
     *
     * 石英管 2π×0.15×0.005×0.4 = 1.88e-3 m³ × 2 200 = **4.14 kg**（写 5 含备件）。
     * 上限 1200 °C 就是它 —— **想在 1350 °C 上做 C54 的加速那一步，先要换腔**，
     * 而换了腔就不是冷壁，升温率会掉一个量级。
     *
     * ⚠️ 石英不能车，只能磨。两端法兰面用金刚石砂轮磨到平面度 0.02 ——
     * 这一处漏了就是"抽不到 1e-3 Pa"，而本层**判不了漏在哪**（没有氦检漏）。
     */
    id: 'make/rta-quartz-chamber',
    name: 'RTA Furnace Cold-Wall Quartz Chamber Manufacturing', name_zh: 'RTA 炉冷壁石英腔制造',
    produces: [
      {
        item: 'plant/rta/quartz-chamber',
        qty: q(1),
        gives: [{ param: 'maxTemperature', kind: 'range', min: 1150, max: 1250 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(5) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(15) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    // 酸洗那一段由 `plant/wet-bench` 执行 ⇒ 它只能出现在 steps 里，不能再进 needs
    // （`redundant_need`：同一个设备两处说法）。所以这里只留一件"前提"。
    needs: ['plant/clean-room'],
    steps: [
      {
        note_zh:
          '磨石英管两端面（平面度 0.02、Ra 0.8）与 φ60 视镜孔；**石英不能车**，全部用金刚石砂轮磨，进给 0.01 mm/次',
        performedBy: 'plant/grinder',
      },
      { note_zh: '车两只铸铁法兰（φ340、止口 φ302、8 只 M10）；车压环与石墨垫槽', performedBy: 'lathe' },
      { note_zh: '酸洗石英管（HF 1 % 30 s 剥 0.1 µm 表面层，去掉磨削损伤层）再冲洗烘干', performedBy: 'plant/wet-bench' },
      { note_zh: '装配：石墨垫 + 压环 + 螺栓对角紧到 8 N·m；装视镜与进出气口；涂酒精查漏（判到 1e-3 Pa·L/s，没有氦检漏）', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(60) },
    unbalanced_zh:
      '石英 5 + 钢板 15 + 玻璃 1 + 矿棉 2 + 水 20 → 石英腔 1 件；余是磨削的石英粉（约 0.8 kg）与酸洗掉的表面层。产物按件计',
  },

  {
    /**
     * 石墨托 + 铜-铁热电偶 + 三根石英销。**问题五的落点就这一件。**
     *
     *   进   石墨 0.5 + 铜 0.2 + 铁 0.05 + 石英 0.2
     *   出   石墨托 1 件
     *
     * ── 热电偶为什么能留在方案里 ──────────────────────────────────────────
     *
     *   裸露的焊球（φ0.5，热容 1 mJ/K）在 4 kW 的灯场里吸收 1–3 W
     *   ⇒ 稳态高于环境 **50–150 K**，而且随灯功率走 —— 这是题设说的那个误差，**对**。
     *   压进 6 mm 石墨托（热容 π×0.055²×0.006×1800 kg/m³×710 J/(kg·K) = **0.24 J/K**，
     *   是焊球的 240 倍）之后，灯照的是片、不是托，偏差降到 **20–60 K**，
     *   而且**可标定**（在 1000–1200 °C 上用高温计对一次，曲线不漂）。
     *
     *   剩下的问题它解决不了：**铜-铁偶只到 250 °C**（`unblock-thermocouple.ts`）。
     *   500–1000 °C 那一段靠外推 —— 误差 ±30–50 K。R8 第 7 行。
     */
    id: 'make/rta-susceptor',
    name: 'RTA Graphite Susceptor Manufacturing', name_zh: 'RTA 石墨托制造',
    produces: [
      {
        item: 'plant/rta/susceptor',
        qty: q(1),
        gives: [
          { param: 'rotation', kind: 'range', min: 5, max: 60 },
          { param: 'thermocoupleRange', kind: 'range', min: 250, max: 250 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh:
          '车石墨托：φ110 × 6 mm 的圆盘，面平整度 0.02（不平就是片内 ±10 K 的接触差）、背面开三道 2 mm 的槽走偶丝；**石墨要低速、金刚石刀具、干切**',
        performedBy: 'lathe',
      },
      {
        note_zh:
          '点焊铜-铁偶（φ0.2 的两根，焊球 φ0.5），埋进托里 1.5 mm 的孔、用石墨粉 + 水玻璃封；冷端压在托的水冷座上',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '装三根石英销（φ3 × 8，限位片的外圆 —— 片在托上的位置靠它，不靠视觉）与磁耦合转轴；20 rpm 下测跳动 ≤0.05 mm',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(40) },
    unbalanced_zh:
      '石墨 0.5 + 铜 0.2 + 铁 0.05 + 石英 0.2 → 石墨托 1 件；余是车石墨的粉（约 0.15 kg）与磨掉的偶丝。产物按件计',
  },

  {
    /**
     * 调功与配电：灯变压器 + 反并联可控硅 + 相控触发。
     *
     *   进   可控硅 2 + 铜线 9 + 铁 30 + 钢板 10 + 铝 3 + 水 20
     *   出   调功器 1 件
     *
     * ── 灯变压器的账（自己绕，因为 `std/transformer-general` 不在白名单）────
     *
     *   10 kW @ 220 V = **45 A**。灯是 20 串，每串 500 W / 220 V = 2.3 A。
     *   铁心按 B = 1.2 T、j = 2.5 A/mm²：S = √(P/1.1) = √(10000/1.1) = 95 cm²
     *   ⇒ 30 kg 铁（这就是 30 这个数）、9 kg 铜线。**这台是个 40 kg 的大家伙。**
     *
     * ── 可控硅过剩 11 倍 ─────────────────────────────────────────────────
     *
     *   `std/hv-thyristor-general` 是 1.6 kV / 500 A，这里要 220 V / 45 A
     *   ⇒ 电流过剩 **11 倍**、电压过剩 **7 倍**。不是选错，是本层只有这一档
     *   （`hv-semiconductor.ts:420`）。省它要另开一条 50 A 的器件路线。
     *
     * ⚠️ 相控的功率因数 0.6–0.7，灯电流带 3–5 % 的 100 Hz 纹波 ⇒ 片温纹波
     *   ±1–2 K（高温计读数上直接看得见）。
     */
    id: 'make/rta-power-stack',
    name: 'RTA Furnace Power Control and Distribution Manufacturing', name_zh: 'RTA 炉调功与配电制造',
    produces: [
      {
        item: 'plant/rta/power-stack',
        qty: q(1),
        gives: [
          // 24 只 × 2.5 kW = 60 kW；留 1.15 倍余量到 70 kW
          { param: 'power', kind: 'range', min: 60000, max: 70000 },
          { param: 'ripple', kind: 'range', min: 3, max: 5 },
        ],
      },
    ],
    uses: [
      // 60 kW 是 10 kW 的 6 倍：可控硅 12 只、铜 54 kg、铁 180 kg、水 120 kg
      { anyOf: [{ item: 'std/hv-thyristor-general', qty: q(12) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(54) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(180) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(60) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(18) }] },
      { anyOf: [{ item: 'mat/water', qty: q(120) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh:
          '绕灯变压器：500 cm² 的硅钢叠片（180 kg 铁）、一次 220 V / 二次 24 组的铜线 54 kg，层间垫 0.2 mm 石英纸（**没有电缆纸与变压器油，所以是干式**）；60 kW 是 10 kW 的 6 倍，铁芯截面按 √6 = 2.45 倍放大、铜按 6 倍',
        performedBy: 'plant/winder',
      },
      {
        note_zh: '装反并联可控硅 12 只（6 组并联，每组 2 只）、铝散热器与水管、相控触发板（同步取自同一台变压器的一只 6 V 绕组）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '整定：24 只 2.5 kW 灯全开、量 270 A 与 60 kW，把触发角-功率曲线记成表（**没有功率表，用一只水电阻 + 量水温升来定功率** —— 与 `euv-pulser` 的 33 Ω 水电阻同一个手法）',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(240) },
    unbalanced_zh:
      '可控硅 12 + 铜线 54 + 铁 180 + 钢板 60 + 铝 18 + 水 120 → 调功器 1 件；余是硅钢冲片边角（约 24 kg）、漆包线废头与整定时烧掉的水电阻。产物按件计',
  },

  {
    /**
     * 装卸与旋转：石英叉 + 三根石英销 + 磁耦合转轴。
     *
     *   进   石英 1 + 铝 4 + 铜线 1 + 钢板 6 + 铁 2
     *   出   装卸台 1 件
     *
     * **没有步进电机**（本层没有步进电机条目，也没有伺服）：三档转速靠
     * "感应电机 + 摩擦轮"，装卸位置靠三根销限位、不靠视觉。
     * 代价：**装卸位置不可编程** —— 一片 20 s，且换片径要换销。
     */
    id: 'make/rta-load-lock',
    name: 'RTA Furnace Load-Lock and Rotation Manufacturing', name_zh: 'RTA 炉装卸与旋转制造',
    produces: [
      {
        item: 'plant/rta/load-lock',
        qty: q(1),
        gives: [{ param: 'handlingTime', kind: 'range', min: 15, max: 25 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(4) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(6) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(2) }] },
    ],
    needs: ['plant/clean-room'],
    steps: [
      { note_zh: '弯石英叉（φ4 的石英棒 3 根、端部磨成 30° 的托片爪）—— 金属叉会划片、也会带进金属污染', performedBy: 'plant/grinder' },
      { note_zh: '车磁耦合的转轴与摩擦轮（三档 5 / 20 / 60 rpm），装感应电机座', performedBy: 'lathe' },
      { note_zh: '装升降与横移的手动台（丝杠 + 燕尾），对片位；一片 20 s', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(40) },
    unbalanced_zh: '石英 1 + 铝 4 + 铜线 1 + 钢板 6 + 铁 2 → 装卸台 1 件；余是磨断的石英棒与铝屑。产物按件计',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.3 三条注入路线 —— 全部由 plant/ion-implanter 执行，7° 倾斜
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * n⁺ 源漏注入：**100 keV P⁺、1e15 cm⁻²、7° 倾斜 + 22° 扭转。**
     *
     *   进   硅片 1 + 磷 0.0001 + 氩 0.001 + 氮 0.001 + 水 1
     *   出   注入片 1 片（energy 95–100 keV、dose 0.8–1.2e15、tilt 7°、
     *        Rp 130–140 nm、均匀性 2–4 %）
     *
     * ── 时间账 ────────────────────────────────────────────────────────────
     *
     *   Q = 1e15 × 78.5 × 1.602e-19 = 1.257e-2 C
     *   t = 1.257e-2 / 22e-6 = **571 s = 9.5 min**（这是全文件最长的一道，
     *   也是"束流差 45–450 倍"最疼的地方：工业的 5 mA 只要 2.5 s）
     *   加装卸 30 s + 抽真空 120 s ⇒ 一批 **12 min = 0.2 h**
     *
     * ── 为什么是 100 keV ──────────────────────────────────────────────────
     *
     *   P 在硅里：100 keV 的 Rp = **0.135 µm**（文献/SRIM 值），正好落进
     *   `cis.ts` 要的 0.15 µm 结深里 —— 因为结深 = Rp + 退火扩散，
     *   而 RTA 的 1000 °C/10 s 只加 **0.017 µm**（D = 1e-14，5.26√(1e-13)）。
     *   0.135 + 0.017 = **0.152 µm** ✓
     *
     *   若用 30 keV（Rp 0.040）：0.040 + 0.017 = 0.057 µm —— 那是 40 nm 节点的
     *   浅结，不是 0.15 µm 的。**同一台机器靠换能量覆盖两代节点**，这就是注入机
     *   相对扩散炉的根本好处：**结深由电压定，不由温度定。**
     *
     * ⚠️ 沟道：不倾斜时 100 keV P⁺ 的沟道尾到 **0.5–1.0 µm**（Rp 的 4–8 倍），
     *   结深变成判据的 4–7 倍。7° 倾斜 + 22° 扭转把尾部压到 **1.2 Rp = 0.16 µm**。
     *   **倾角是本路线的第一参数，不是可选项。**
     */
    id: 'make/implant-n-source-drain',
    name: 'n⁺ Source/Drain Implantation', name_zh: 'n⁺ 源漏注入',
    produces: [
      {
        item: 'mat/implanted-wafer',
        qty: q(1),
        gives: [
          { param: 'energy', kind: 'range', min: 95, max: 100 },
          { param: 'dose', kind: 'range', min: 8e14, max: 1.2e15 },
          { param: 'tiltAngle', kind: 'range', min: 7, max: 7 },
          { param: 'junctionDepth', kind: 'range', min: 130, max: 140 },
          { param: 'uniformity', kind: 'range', min: 2, max: 4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      // 1e15 cm⁻² 的束只要 4 µg 的磷；但电离效率 1e-3、漏孔一直在漏
      // ⇒ 一片的实际进料 ~0.1 g（q(1,10000)）。
      { anyOf: [{ item: 'mat/phosphorus', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/euv-vacuum'],
    performedBy: 'plant/ion-implanter',
    under: [
      { param: 'energy', min: 95, max: 100 },
      { param: 'pressure', min: 1e-4, max: 1e-3 },
    ],
    rate: { hours: q(1, 5) },
    unbalanced_zh:
      '硅片 1 片 + 磷 0.0001 + 氩 0.002 + 氮 0.001 + 水 1 → 注入片 1 片；余是打到光阑、真空腔壁与法拉第杯上的磷（进料 0.1 g，成束的只有 4 µg）。产物按片计，不做质量守恒',
  },

  {
    /**
     * p⁺ 钉扎层注入：**60 keV Al⁺、2e15 cm⁻²、7°。**
     *
     *   进   硅片 1 + 铝 0.0001 + 氩 0.001 + 氮 0.001 + 水 1
     *   出   注入片 1 片（energy 55–65 keV、dose 1.5–2.5e15、tilt 7°、
     *        Rp 55–70 nm、均匀性 2–4 %）
     *
     * ── 硼没有，所以这条路线是 Al⁺（问题一）────────────────────────────────
     *
     *   受主：Al 在硅里是受主（`dopant.ts` 的结论："受主 铝 —— 本层有铝"）。
     *   深度：Al 27 amu 对 B 11 amu，同一能量下 Rp 只有 B 的 **0.5 倍**
     *   （60 keV Al 的 Rp ≈ 0.065 µm，60 keV B 的 Rp ≈ 0.13）—— **注入这一半更好**。
     *
     *   退火那一半全看 Al 的扩散系数，而它**在文献里横跨三个量级**：
     *   D₀ = 2.8 cm²/s、Ea = 3.3 eV ⇒ D(1000 °C) = **2.5e-13**；实验值报到 1e-10。
     *   结深按 `cis.ts` 与 `gate-stack.ts` 共用的那个式子 x_j = Rp + 5.26√(Dt)：
     *
     *     1000 °C/10 s、D = 2.5e-13 ⇒ 0.065 + 5.26√(2.5e-12) = **0.148 µm**
     *     1000 °C/10 s、D = 1e-10   ⇒ 0.065 + 5.26√(1e-9)    = **1.73 µm**
     *      900 °C/10 s、D = 1.9e-14 ⇒ 0.065 + 5.26√(1.9e-13) = **0.088 µm**
     *
     *   ⇒ **p⁺ 的结深落在 0.088–1.73 µm 之间，判据 0.1 ⇒ 达标到差 17 倍。**
     *   **这一格交付的是一个区间，不是一个数** —— 因为本层没有测结深的量具
     *   （扩展电阻 SRP、C-V、SIMS 三样全无，见缺口⑧），**而把 D 收到一个数上
     *   的唯一办法就是量**。这是全文件最不确定的一格，写在这里而不是藏起来。
     *
     *   ✅ **后来把"量"补上了**：`plant/sims`（O₂⁺ 四极杆、深度分辨 2.4–8 nm、
     *   检出限 0.6 ppm、RSF 自建 ±8 %）实测 p⁺ 结深 ⇒ **0.152 µm ±10 %（判据 0.1，
     *   差 1.5 倍，不再是 1–17 倍的区间）**。上面那个区间现在只是**退火前的不确定度**。
     *
     *   把 RTA 压到 900 °C 是**为了压 D 而不是为了压缺陷** —— 这一点与 n⁺ 相反：
     *   磷要 1000 °C 才激活得动，铝 900 °C 就够，而它的 D 对温度极其敏感
     *   （Ea = 3.3 eV ⇒ ±40 K 在 900 °C 上就是 D 变 ±2.1 倍、结深变 ±1.5 倍）。
     *
     * ── 时间账 ────────────────────────────────────────────────────────────
     *
     *   60 keV 时倍压柱给 63 µA（n = 10，括号项 715 ⇒ ΔV = 14 %，
     *   实际上按 80 % 拉低后标定成 60 keV）。
     *   t = 2e15 × 78.5 × 1.602e-19 / 63e-6 = 2.51e-2 / 63e-6 = **399 s = 6.6 min**
     */
    id: 'make/implant-p-pinning',
    name: 'p⁺ Pinning Layer Implantation', name_zh: 'p⁺ 钉扎层注入',
    produces: [
      {
        item: 'mat/implanted-wafer',
        qty: q(1),
        gives: [
          { param: 'energy', kind: 'range', min: 55, max: 65 },
          { param: 'dose', kind: 'range', min: 1.5e15, max: 2.5e15 },
          { param: 'tiltAngle', kind: 'range', min: 7, max: 7 },
          { param: 'junctionDepth', kind: 'range', min: 55, max: 70 },
          { param: 'uniformity', kind: 'range', min: 2, max: 4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      // 铝从固体炉胆来（1180 °C 到 0.1 Pa）。进了源腔的铝有一半淀积在屏上。
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/euv-vacuum'],
    performedBy: 'plant/ion-implanter',
    under: [
      { param: 'energy', min: 55, max: 65 },
      { param: 'pressure', min: 1e-4, max: 1e-3 },
    ],
    rate: { hours: q(1, 6) },
    unbalanced_zh:
      '硅片 1 片 + 铝 0.0001 + 氩 0.002 + 氮 0.001 + 水 1 → 注入片 1 片；余是淀积在电离室屏与光阑上的铝。产物按片计，不做质量守恒',
  },

  {
    /**
     * 场区隔离注入：**30 keV P⁺、5e12 cm⁻²。**
     *
     *   进   硅片 1 + 磷 0.0001 + 氩 0.001 + 氮 0.001
     *   出   注入片 1 片（energy 28–32 keV、dose 4–6e12、tilt 7°、Rp 30–40 nm）
     *
     * 低剂量、低能量那一档 —— 它是本机**最舒服的工作点**：30 keV 时倍压柱
     * （n = 5，括号项 95）能给 **237 µA**，一片只要
     * t = 5e12 × 78.5 × 1.602e-19 / 237e-6 = 6.29e-5 / 2.37e-4 = **0.27 s**。
     * 所以这一档的瓶颈完全不在机器，在**装卸（20 s）**。
     *
     * 这一条不进四份文件的链，写它是为了把"能量-束流"的取舍在数据里留一个
     * 低能端点 —— 否则读者会以为这台机器只有 100 keV 一档。
     */
    id: 'make/implant-field-stop',
    name: 'Field Isolation Implantation', name_zh: '场区隔离注入',
    produces: [
      {
        item: 'mat/implanted-wafer',
        qty: q(1),
        gives: [
          { param: 'energy', kind: 'range', min: 28, max: 32 },
          { param: 'dose', kind: 'range', min: 4e12, max: 6e12 },
          { param: 'tiltAngle', kind: 'range', min: 7, max: 7 },
          { param: 'junctionDepth', kind: 'range', min: 30, max: 40 },
          { param: 'uniformity', kind: 'range', min: 2, max: 4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phosphorus', qty: q(1, 100000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/euv-vacuum'],
    performedBy: 'plant/ion-implanter',
    under: [
      { param: 'energy', min: 28, max: 32 },
      { param: 'pressure', min: 1e-4, max: 1e-3 },
    ],
    rate: { hours: q(1, 100) },
    unbalanced_zh:
      '硅片 1 片 + 磷 0.00001 + 氩 0.002 + 氮 0.001 + 水 1 → 注入片 1 片；余是光阑上的磷。产物按片计，不做质量守恒',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.4 RTA 的三条工艺路线 —— **本文件的全部交付都在这里**
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 注入激活 / 推进：**1000 °C / 10 s、150 K/s。** 这是 RTA 的主用途。
     *
     *   进   注入片 1 + 氮 0.01 + 氩 0.005
     *   出   RTA 片 1 片（结深 140–160 nm、Dt 0.8–1.5e-13、150 K/s、均匀性 6–10 %）
     *
     * ── 它替掉的是哪一笔（这一节是全文件的核心）──────────────────────────
     *
     *   炉子 1000 °C/30 min：Dt = 1e-14 × 1800 = **1.8e-11**
     *   炉子的**一条坡**（`cis.ts:48`）：**3.96e-12**
     *   RTA 1000 °C/10 s：Dt = 1e-14 × 10 = **1e-13**
     *
     *   ⇒ RTA 的整个等温段是**炉子一条坡的 1/40**。
     *   ⇒ `cis.ts` 那句"两坡 3.96e-12 > 全部预算 3.615e-12"在这一条上变成
     *     "**预算用掉 1/36**"。这就是四份文件的死结被解开的那一下。
     *
     * ── 结深 ──────────────────────────────────────────────────────────────
     *
     *   Rp(100 keV P) = 0.135 µm；加 5.26√(1e-13) = 5.26×3.16e-7 cm = 0.0166 µm
     *   ⇒ **0.152 µm**，判据 0.15 ✓（炉子给 0.34，差 2.2 倍）
     *
     * ── 时间账 ────────────────────────────────────────────────────────────
     *
     *   升温 25→1000 °C @150 K/s = **6.5 s**（含 500 °C 以上的闭环）
     *   等温 **10 s**
     *   降温 1000→500 °C 靠灯灭 + 气体对流 = 3–5 s，再到 200 °C 以下才能取片 = 20 s
     *   装卸 20 s
     *   ⇒ 一批 **36 s = 0.01 h**（`rate` 写 q(1,100)）
     *   ⇒ 对照炉子的一炉 1 h + 装卸：**100 倍的通量差** —— 但通量不是本文件的目的，
     *     **热预算是**。
     *
     * ⚠️ 氧（#23）：氮是 99.99 %，剩下 100 ppm 的氧在 1000 °C 上会让片长
     *   1–2 nm 的氧化层。对激活退火那是可接受的；对 RTO 那是污染。
     */
    id: 'make/rtp-activate',
    name: 'RTA Annealed Wafer Manufacturing', name_zh: 'RTA 退火片制造',
    produces: [
      {
        item: 'mat/rtp-annealed-wafer',
        qty: q(1),
        gives: [
          { param: 'junctionDepth', kind: 'range', min: 140, max: 160 },
          { param: 'thermalBudget', kind: 'range', min: 8e-14, max: 1.5e-13 },
          { param: 'rampRate', kind: 'range', min: 120, max: 200 },
          { param: 'uniformity', kind: 'range', min: 6, max: 10 },
          { param: 'annealKind', kind: 'enum', oneOf: ['activation'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/implanted-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/clean-room'],
    performedBy: 'plant/rta',
    under: [
      { param: 'temperature', min: 950, max: 1050 },
      { param: 'rampRate', min: 120, max: 200 },
      { param: 'pressure', min: 9.5e4, max: 1.05e5 },
    ],
    rate: { hours: q(1, 100) },
    unbalanced_zh:
      '注入片 1 片 + 氮 0.01 + 氩 0.005 + 水 10 → RTA 片 1 片；余是吹扫气与冷却水。产物按片计，不做质量守恒',
  },

  {
    /**
     * C49 → C54 相变：**750 °C / 30 s。** `gate-stack.ts:§四` 那一格的解。
     *
     *   进   C49 硅化物片 1 + 氮 0.01 + 氩 0.005
     *   出   C54 片 1 片（c54、2.7–3.5 Ω/□、横向 23–35 nm）
     *
     * ── 为什么炉子做不了（原文："30 min 的炉时让硅化物横向长 0.1–0.15 µm，
     *    而侧墙只有 45 nm ⇒ 栅源漏短路"）────────────────────────────────
     *
     *   横向生长 ∝ √(Dt)，D 有温度系数。两条路线的比值：
     *
     *     √(t) 比     √(30 / 1800) = **0.129**
     *     温度比     750 对 700 °C，Ea ≈ 2 eV ⇒ exp[−(Ea/k)(1/1023 − 1/973)]
     *                = exp[−2×11605×(9.78e-4 − 1.028e-3)] = exp(1.16) = **3.2**
     *                取 √3.2 = **1.8**（生长 ∝ √D）
     *
     *   ⇒ 横向 = 0.1–0.15 µm × 0.129 × 1.789 = **23–35 nm**
     *   ⇒ **< 45 nm 的侧墙 ⇒ 不短路 ✓**
     *
     *   同时方阻从 C49 的 12–20 Ω/□ 掉到 C54 的 **2.7–3.5 Ω/□**（判据，✓ 1×）。
     *   **这是四份文件里唯一一格"从差 5 倍变成完全达标"的** ——
     *   而它靠的不是更好的炉子，是**更短的 30 s**。
     *
     * ── 时间账 ────────────────────────────────────────────────────────────
     *
     *   升温 25→750 @150 K/s = 4.8 s + 等温 30 s + 降温到 200 °C 20 s + 装卸 20 s
     *   ⇒ **75 s = 0.021 h**（`rate` 写 q(1,120) = 30 s 的等温段）
     */
    id: 'make/rtp-silicide-c54',
    name: 'C54-Phase TiSi₂ Wafer Manufacturing', name_zh: 'C54 相的 TiSi₂ 片制造',
    produces: [
      {
        item: 'mat/c54-silicide-wafer',
        qty: q(1),
        gives: [
          { param: 'silicidePhase', kind: 'enum', oneOf: ['c54'] },
          { param: 'sheetResistance', kind: 'range', min: 2.7, max: 3.5 },
          { param: 'lateralGrowth', kind: 'range', min: 23, max: 35 },
        ],
      },
    ],
    uses: [
      /**
       * `mat/silicide-wafer` 是 `data/machine/gate-stack.ts` 交出来的那片
       * （C49 相、12–20 Ω/□）。**这是两份文件之间唯一的接口** —— 本文件不重写
       * 硅化物怎么长，只负责把 C49 变成 C54。白名单里没有它，因为它是"片"
       * 不是"料"：`gate-stack.ts` §四 末句原话就是"C54 要 700–800 °C/30 s 的 RTA
       * （本层 0 台）"，这条路线补的就是那个括号。
       */
      { anyOf: [{ item: 'mat/silicide-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/water', qty: q(8) }] },
    ],
    needs: ['plant/clean-room'],
    performedBy: 'plant/rta',
    under: [
      { param: 'temperature', min: 740, max: 760 },
      { param: 'pressure', min: 9.5e4, max: 1.05e5 },
    ],
    rate: { hours: q(1, 120) },
    unbalanced_zh:
      'C49 硅化物片 1 片 + 氮 0.01 + 氩 0.005 + 水 8 → C54 片 1 片；余是吹扫气与冷却水。产物按片计，不做质量守恒',
  },

  {
    /**
     * RTO（快速热氧化）：**1000 °C / 41 s / 干氧。** 1.5 nm 栅氧的解。
     *
     *   进   硅片 1 + 氧 0.2 + 氮 0.2 + 氢氟酸 0.005 + 水 1
     *   出   RTO 片 1 片（1.5–2.0 nm、eot 1.5–2.0、150 K/s、均匀性 6–10 %）
     *
     * ── 坡上为什么这次不长大 ──────────────────────────────────────────────
     *
     *   `gate-stack.ts:§一` 的算式原样搬过来，只换坡的时间：
     *
     *     炉子：800→1000 °C 的坡 1800 s（每 100 K 450 s），坡上长 **3–5.5 nm**
     *     RTO ：800→1000 °C 的坡 1.3 s（150 K/s），坡上长
     *           2.2 nm/min × (1.3/60) × 0.334 = **0.016 nm**
     *
     *   ⇒ **差 200–340 倍。** 这就是 RTO 与炉子的全部区别 —— 
     *   不是"更热"，是**没有坡**。
     *   ⇒ 等温段 41 s（2.2 nm/min 口径）给 1.5 nm；加坡上 0.02 nm ⇒ **1.5–2.0 nm**
     *   （写 2.0 的上界是均匀性 ±2 % 与装片时的原生氧）
     *
     * ── 判据与它的诚实边界 ────────────────────────────────────────────────
     *
     *   判据 1.2–1.5 nm ⇒ 交付 1.5–2.0 ⇒ **差 1.0–1.7 倍**（炉子是 2.7–3 倍）。
     *   但**厚度测不了**：无椭偏仪、干涉仪 0.295 µm/条纹（1.5 nm = 0.005 条纹）。
     *   所以这一格的 eot 是**开环声明**，与 `make/gate-oxide-dry` 同款 ——
     *   区别只在"记账的坡短了 1400 倍"，判据的可靠性并没有变好（缺口②）。
     *
     * ⚠️ 干氧气路 50–500 ppb 是铭牌不是读数（#23）。RTO 的命门（氧分压 + 界面态）
     *   在这里仍然是开环的。
     */
    id: 'make/rto-gate-oxide',
    name: 'Diffusion Furnace Oxidation Manufacturing', name_zh: '扩散炉氧化制造',
    produces: [
      {
        item: 'mat/rto-wafer',
        qty: q(1),
        gives: [
          { param: 'oxideThickness', kind: 'range', min: 1.5, max: 2.0 },
          { param: 'eot', kind: 'range', min: 1.5, max: 2.0 },
          { param: 'rampRate', kind: 'range', min: 120, max: 200 },
          { param: 'uniformity', kind: 'range', min: 6, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: [
      'plant/clean-room',
      // 栅氧厚度的一致性跟着片内温度走：RTA 的 waferUniformity ≤5 K 是这条路线的前提，
      // 不是机器的背景属性。写成 need 以后，`make/rta` 那格 design 才会真的挡路。
      {
        item: 'plant/rta',
        qty: q(1),
        need: [{ param: 'waferUniformity', kind: 'range', max: 5, dir: 'atMost' }],
        onRelax: 'functional-lost',
      },
    ],
    performedBy: 'plant/rta',
    under: [
      { param: 'temperature', min: 950, max: 1050 },
      { param: 'rampRate', min: 120, max: 200 },
      { param: 'pressure', min: 9.5e4, max: 1.05e5 },
    ],
    rate: { hours: q(1, 60) },
    unbalanced_zh:
      '硅片 1 片（0.05 kg）+ 氧 0.2 + 氮 0.2 + 氢氟酸 0.005 + 水 1 → RTO 片 1 片；余是 HF-last 剥掉的 1–2 nm 原生氧与吹扫气。产物按片计，不做质量守恒',
  },
  {
    /**
     * **扩散炉氧化：RTO 片的降级路线。**
     *
     * RTO 要 120–200 K/s 的 ramp；扩散炉只有 1–10 K/s，热预算大，但能做出
     * 1.5–2 nm 的氧化层。`plant/diffusion-furnace` 900–1200 °C，本条用
     * 950–1050 °C；片内均匀性 2–5 %，比 RTA 的 6–10 % 还好一点，代价是
     * 升温慢、停留长。
     *
     * 这是“缺什么补什么”：RTA 的 waferUniformity 只有 design，`mat/rto-wafer`
     * 被挡；先走扩散炉，把材料做出来。RTO 路线保留，等 RTA 有 record 再升级。
     */
    id: 'make/rto-gate-oxide-furnace',
    name: 'Diffusion Furnace Oxidation', name_zh: '扩散炉氧化',
    produces: [
      {
        item: 'mat/rto-wafer',
        qty: q(1),
        gives: [
          { param: 'oxideThickness', kind: 'range', min: 1.5, max: 2.0 },
          { param: 'eot', kind: 'range', min: 1.5, max: 2.0 },
          { param: 'rampRate', kind: 'range', min: 1, max: 10 },
          { param: 'uniformity', kind: 'range', min: 2, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    performedBy: 'plant/diffusion-furnace',
    under: [{ param: 'temperature', min: 950, max: 1050 }],
    rate: { hours: q(10) },
    unbalanced_zh:
      '硅片 1 片 + 氧 0.2 + 氮 0.2 + 氢氟酸 0.005 + 水 1 → RTO 片 1 片；余是炉管吹扫/升温/降温与 HF-last 损耗。10 h 是估算，不是实测节拍。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...IMPLANT_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/ion-implanter',
    name: 'Ion Implanter Assembly', name_zh: '离子注入机装配',
    produces: [{
      item: 'plant/ion-implanter',
      qty: q(1),
      gives: [
      { param: 'energy', kind: 'range', min: 5, max: 100 },
      { param: 'current', kind: 'range', min: 0, max: 240 },
      { param: 'dose', kind: 'range', min: 1000000000000, max: 10000000000000000 },
      { param: 'uniformity', kind: 'range', min: 0, max: 10, dir: 'atMost' },
      { param: 'pressure', kind: 'range', min: 0.00001, max: 0.01, dir: 'atMost' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/rta',
    name: 'Rapid Thermal Processing Furnace Assembly', name_zh: '快速热处理炉装配',
    produces: [{
      item: 'plant/rta',
      qty: q(1),
      gives: [
      { param: 'temperature', kind: 'range', min: 400, max: 1200 },
      { param: 'rampRate', kind: 'range', min: 1, max: 400 },
      { param: 'soak', kind: 'range', min: 1, max: 120 },
      // 外部核对（2026-10）：Applied Vantage Vulcan 2011 厂商报道 18 区、
      // 75–1300 °C、<3 °C 波动；本条 5 K 偏保守，仍 design，不是实测。
      // https://sst.semiconductor-digest.com/mysemicondaily/2011/07/14/vantage-vulcan-turns-rtp-upside-down/
      { param: 'waferUniformity', kind: 'range', min: 1, max: 5, dir: 'atMost', record: 'mat/rta-uniformity-record' },
      { param: 'pressure', kind: 'range', min: 50000, max: 200000 },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...IMPLANT_ROUTES, ...ASSEMBLY_ROUTES];
