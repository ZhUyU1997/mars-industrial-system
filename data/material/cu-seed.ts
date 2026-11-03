/**
 * 铜籽晶层（5–30 nm 连续）—— 把 `fine-damascene.ts` 第 ⑤ 格的"不通过"救回来。
 *
 * 上一轮那一格改正了 1 000 倍的换算错误之后是**不通过**：
 *
 *   5 nm TiN 的方阻 R□ = ρ/t = 200–400 Ω/□ ⇒ 终端效应 ΔV = j·R□·a²/4 = **25–50 V**
 *   （铜的过电位只有 150–200 mV）⇒ **直接在 TiN 上电镀不成立**；
 *   10 nm 连续铜的 R□ = 1.75 Ω/□ ⇒ ΔV = 0.22 V，还是过电位的 1.1–1.5 倍，**还是太大**；
 *   要 30 nm 连续铜才降到 0.07 V —— 而 30 nm 连续铜正是"蒸发台阶覆盖 8–12 %"给不出的。
 *   ⇒ 真解只有一条：**在 TiN 上先长一层连续的铜籽晶**。
 *
 * 本文件交付这一层：**CuCl 歧化 CVD**（Cu + Cl₂ 闭环再生 CuCl），沟底 7–20 nm 连续，
 * 覆盖 50–70 %（沟底）／65–85 %（侧壁），ρ 2.5–4 µΩ·cm，Cl 0.2–0.5 at%。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、三问（每一问都带数）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── 问一：选哪条，覆盖多少 %（AR 2 的侧壁与沟底分开给）────────────────────────
 *
 * **选 CuCl 歧化 CVD。AR 2（100 nm × 200 nm）：侧壁 65–85 %、沟底 50–70 %；
 * 场厚 30 nm ⇒ 侧壁 19.5–25.5、沟底 15–21 nm。连续下限是场厚 15 nm（沟底 7.5 nm）。**
 *
 * ① 化学反应是**歧化**，不是还原：2 CuCl(g) → Cu(s) + CuCl₂(g)。
 *    ΔH ≈ −190 kJ/mol、ΔS ≈ −225 J/(mol·K)（两个气相分子变一个气相加一个固相）
 *    ⇒ 交叉温度 T = ΔH/ΔS ≈ **845 K ≈ 570 °C**：
 *      570 °C 以上正反应退回去 ⇒ 那一侧做**氯化**（Cu + CuCl₂ → 2 CuCl）
 *      570 °C 以下正反应成立   ⇒ 那一侧做**沉积**（2 CuCl → Cu + CuCl₂）
 *    于是这是一条**热驱动、氯闭路**的回路：氯没有净消耗，铜是唯一的原料。
 *    （题面给的"400–500 °C"是沉积侧的温度；本文件取 350–380 °C，理由在下面④。）
 *
 * ② **覆盖怎么算**（这一格不能拍脑袋，所以给模型）：
 *    沟底/场的通量比 ≈ 1/(1 + AR·s/2)，s 是**有效粘附系数**。
 *    CuCl 的歧化是可逆的：一部分 CuCl 在壁上重新蒸发回气相 ⇒ s 不是 1，而是 **0.3–0.6**
 *    （吸附的 CuCl 在铜表面有很高的表面迁移率，这也是它比 PVD 保形的物理原因）。
 *      AR 2：沟底 1/(1+s) = **50–70 %**；侧壁中段受的入射角更大 ⇒ **65–85 %**。
 *    对照：PVD 是 s ≈ 1 的直线视线，AR 2 的沟底只有 **8–12 %**（几何决定，改不了）。
 *
 * ③ **连续性是两个门夹出来的**（这一格决定"5 nm 还是 30 nm"）：
 *    渗流阈值 **5–8 nm**（`damascene.ts:99`，蒸发的 2.4–3.6 nm 就栽在这里）
 *    去湿（dewetting）：350–380 °C 上 10 nm 以下的铜在 TiN 上 **5–15 min 内成岛**
 *    ⇒ 连续下限 = **场厚 15 nm / 沟底 7.5 nm**。
 *    ⇒ **5–7 nm 那一端做不到**（到 5 nm 时场厚只有 7–10 nm，两个门都过不去），
 *      **8–20 nm 做到了**。这是与题面"5–30 nm"的第一处差，R8 ①。
 *
 * ④ **为什么是 350–380 °C，而不是歧化最舒服的 450–500 °C**：
 *    衬底是 SiCOH（k 2.6–2.9），它的甲基在 **400–425 °C** 开始分解（`lowk-barrier.ts`）。
 *    歧化的平衡在低温更有利，但表面反应速率随 T 指数下降 ⇒ 350–380 °C 上
 *    沉积速率 **1–5 nm/min**（450 °C 上是 10–30 nm/min）⇒ 场厚 15–30 nm 要 **3–30 min**。
 *    这一笔是"拿速率换甲基"，写在 R8 ⑥。
 *
 * ⑤ 顺带一条**好处**：氯在铜表面形成 Cu–Cl 表面相，把表面能压低 ⇒ **抑制去湿**。
 *    这是 CuCl CVD 相对 PVD-Cu 的一个真实优势（PVD 的铜在 350 °C 上就开始聚球）。
 *    代价是氯会留在膜里（0.5–2 at%），必须后处理（第③段 H₂）。
 *
 * ── 问二：5 nm 与 30 nm 的电阻率 —— "30 nm 连续铜 ⇒ 0.07 V"成立吗 ──────────────
 *
 * **不成立。5 nm 是体铜的 5–10 倍（不是 3–5 倍），30 nm 是 1.4–2.3 倍 ⇒
 * 30 nm 的场厚给沟底 15–21 nm、R□ 1.2–2.7 Ω/□、ΔV = 0.15–0.34 V（过电位的 0.9–2.3 倍）。
 * 把它压到 0.07 V 以下的不是加厚，是降电流：起镀 50 A/m² ⇒ 0.038–0.084 V ✓。**
 *
 * ① 铜的电子平均自由程 **λ = 39 nm**（300 K）—— 这就是"尺寸效应"的全部来处：
 *    膜比 λ 薄时，电子在上下表面多撞一次；晶界再撞一次（Mayadas–Shatzkes）。
 *      Fuchs–Sondheimer（p = 0.5）：ρ/ρ0 = 1 + 0.19·λ/d
 *      Mayadas–Shatzkes（R = 0.4、晶粒 ≈ 膜厚）：再乘 1.3–2.5（d 越小乘得越多）
 *
 *      d = 5 nm   ⇒ ρ = **10–18 µΩ·cm**（5–10× 体铜 1.75）  R□ = 20–36 Ω/□
 *      d = 10 nm  ⇒ ρ = 5–8 µΩ·cm（3–4.5×）                  R□ = 5–8 Ω/□
 *      d = 30 nm  ⇒ ρ = **2.5–4 µΩ·cm**（1.4–2.3×）          R□ = 0.8–1.3 Ω/□
 *
 *    ⚠️ 上一轮那句"30 nm ⇒ 0.07 V"用的是**体铜**的 1.75 µΩ·cm：它给 R□ = 0.58 Ω/□。
 *    真实的 30 nm 是 0.8–1.3 Ω/□；而**场厚 30 nm 的籽晶在沟底只有 15–21 nm**
 *    ⇒ 那一段的 ρ 是 2.5–4、R□ 是 **1.2–2.7 Ω/□** ⇒ ΔV = 0.15–0.34 V。
 *    所以"加厚到 30 nm 场厚"不够。
 *
 * ② **够的是降电流，不是加厚**：ΔV = j·R□·a²/4，j 从 200 A/m²（20 mA/cm²）降到
 *    **50 A/m²**（0.5 A/dm²）⇒ ΔV = **0.038–0.084 V**，是过电位（150–200 mV）的
 *    **0.25–0.5 倍** ✓。这正是工业的"strike-then-ramp"：
 *    50 A/m² 镀到沟内 20–30 nm（R□ 掉到 0.8–1.3），再把电流拉回 200 A/m² 填沟。
 *    ⇒ **籽晶的价值不是"把 ΔV 归零"，是把"镀不进去"变成"用低电流先镀一层"。**
 *
 * ③ 本文件两条路线的沟内电阻率差一个量级，这是选型的第二个理由：
 *      CuCl CVD：沟内 7–20 nm，ρ 2.5–4 µΩ·cm（Cl 0.2–0.5 at% 已经把 ρ 抬了 10–20 %）
 *      PVD 加厚：沟内 5–12 nm，ρ **8–18 µΩ·cm** ⇒ R□ 7–36 Ω/□ ⇒ 就算 50 A/m² 也是 0.22–1.1 V
 *    ⇒ **PVD 加厚能给出"连续"，但给不出"够低的方阻"** —— 这是本文件最重要的一条判定。
 *
 * ── 问三：与 `plant/ald-reactor` / `plant/evaporator` 的接口在哪个文件里落地 ─────
 *
 * **两台机器的接口都落在本文件，`fine-damascene.ts` 一行不改也能编译；要接进六格是三行。**
 *
 * ① `plant/ald-reactor`（150–400 °C / 10–100 Pa）在 `make/cu-seed-cvd` 的第④⑤段
 *    （沉积 + H₂ 后处理，`performedBy`）落地。**不改 `ald.ts` 一行**：
 *    它的腔、源池、热壁衬套、阀块就是一台低压 CVD 机，缺的只是"通 CuCl 蒸气的路"，
 *    而那一路是**管线**不是机器（模型里没有管线条目，正如 `fine-damascene.ts` 的
 *    TiCl₄ 鼓泡也只是一句注释）。
 * ② `plant/evaporator`（0.001–10 Pa）在 `make/cu-seed-pvd` 的第①段落地。
 *    它是**降级 OR**：能连续（场厚 60–100 nm 给沟底 5–12 nm），但方阻不够（问二③）。
 * ③ **CuCl 的蒸气压力正好落在 ald-reactor 的窗口里**：
 *    按 ΔHvap ≈ 120 kJ/mol 估，CuCl 在 550–600 °C 上的蒸气压 **9–24 Pa**
 *    （bp 1 490 °C 是唯一的锚点，所以标"估"）⇒ 10–100 Pa 的腔压不需要载气稀释，
 *    **CuCl 直接就是工作气体**。这是选这台腔、而不是另造一台的物理理由。
 * ④ 若主 agent 要把籽晶接进六格，改的是 `fine-damascene.ts` 三处（本文件不碰）：
 *    ① `make/fine-damascene-layer` 的 `uses`（现 **490–500** 行，`mat/copper` 1 g 那一块）
 *       之后加 `{ anyOf: [{ item: 'mat/cu-seed-wafer', qty: q(1) }] }`；
 *    ② 第 **621** 行第⑥段"没有 Cu 籽晶…10 nm strike 层"改成"籽晶取自 `make/cu-seed-cvd`
 *       （沟底 15–21 nm），起镀 50 A/m² 到 20 nm 后再拉到 200 A/m²"；
 *    ③ R8 第 **267** 行那一行同步。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、三条候选逐条判定（一条走通、两条明确不通）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── ① CuCl 歧化 CVD：**走通**（本文件的 `make/cu-seed-cvd`）───────────────────
 *
 *   材料全在：`mat/copper`（97–99.99 %）+ `mat/chlorine` + `mat/hydrogen`（后处理）
 *   + 石英管与石墨（氯的腐蚀，与 `lowk-barrier.ts` 的 CH₃Cl 那一段同一处）。
 *   覆盖 50–70 %／65–85 %，连续下限场厚 15 nm。R8 的十条里**八条在这个条上**
 *   （另两条是 ②③ 的"不通"）。
 *
 * ── ② ALD Cu：**不通**（不是"难"，是三件前驱体一件也没有）────────────────────
 *
 *   | 前驱体 | 配体 | 本层 | 差在哪 |
 *   |---|---|---|---|
 *   | Cu(dmap)₂ | 1-二甲氨基-2-丙醇（C5） | **0** | 环氧丙烷（C3）+ 二甲胺；环氧丙烷要丙烯 |
 *   | Cu(hfac)₂ | 六氟乙酰丙酮 | **0** | 乙酰丙酮 + 6F；乙酰丙酮要**丙酮**（C3） |
 *   | Cu(acac)₂ | 乙酰丙酮（C5 二酮） | **0** | 同上 |
 *
 *   **三条全断在同一个碳数上：C3。** 本层的有机入口只到 C2
 *   （甲烷 C1 · 甲醇 C1 · 甲醛 C1 · 乙醛/乙醇/乙烯 C2），而 C3 要一条新链：
 *
 *      甲醇 →（MTO，ZSM-5，400–500 °C）→ 乙烯 + 丙烯 → 丙烯 →（水合）异丙醇 →（脱氢）丙酮
 *
 *    最硬的一处是 **ZSM-5 分子筛**：它要**四丙基氢氧化铵**做模板剂
 *    （四丙基 = C12 季铵，往上又是丙烯），而本层只有 `mat/zeolite-4a`（4A 是 LTA 骨架，
 *    不是 MFI，孔口 0.4 nm 对甲醇制烯烃的选择性不够，硬换的后果是**只出二甲醚**）。
 *    ⇒ 缺口：**4 件中间物（ZSM-5 · 丙烯 · 异丙醇 · 丙酮）+ 2 件（乙酰丙酮 · hfac）= 8 步**。
 *    这不是"本层做不到"，是"要再建两条链"—— 所以本条**不写成路线**（R8 ②）。
 *    ⚠️ 题面说"大概率断"：确认**断**。而且断点不在氟（`mat/fluorine` 有、能加成到乙酰丙酮），
 *    在碳链。
 *
 * ── ③ 无电镀铜（electroless）：**不通**（这里比 damascene 那次更细地数了一遍）────
 *
 *   | 件 | 本层 | 说明 |
 *   |---|---|---|
 *   | 铜源 CuCl₂ | **有**（`mat/copper` + `mat/chlorine`） | 不需要硫酸铜 |
 *   | 还原剂 甲醛 | **有**（`mat/formaldehyde`，`organic.ts:266`） | HCHO + 2OH⁻ → HCOO⁻ + H₂O + 2e⁻ |
 *   | 络合剂（EDTA／酒石酸钾钠／柠檬酸） | **0/3** | EDTA 要乙二胺 + 一氯乙酸；酒石酸钾钠要顺丁烯二酸酐（C4 酸酐）；柠檬酸要发酵 |
 *   | 活化催化剂（Pd/Sn 胶体） | **0/1** | 当时 `mat/palladium` 0 命中；现在 `pgm.ts` 有海绵 Pd，但 Pd/Sn 胶体活化液路线仍未建 |
 *   | pH 调节（NaOH 到 12.5） | **有**（`mat/naoh`，`reagents.ts:59`）但不在本文件白名单 | 碱本身不是断点 |
 *   | 稳定剂（2,2′-联吡啶／氰化钠） | **0/2** | 没有它，槽液 1–2 h 自分解 |
 *
 *   ⇒ 络合剂 **0/3**、催化剂 **0/1**（Pd 有海绵料，胶体路线未建），再加稳定剂 **0/2** = **6 件里 5 件没有**。
 *   `damascene.ts:111–114` 已经判过同一格（"络合剂 0/3、催化剂 0/1"），
 *   本文件复核：**仍然是 0/3 + 0/1**，而且多出"稳定剂 0/2"这一条。
 *   缺的最狠的一件是**钯活化**（Pd/Sn 胶体）：Pd 海绵料现在有了（`pgm.ts`），
 *   但胶体/活化液路线未建；没有活化，甲醛在 TiN 上 25 °C 不肯氧化
 *   （TiN 对 HCHO 的氧化没有催化活性），只能靠 Cu 自催化 —— 而"先有铜"正是要解决的事。
 *   ⇒ 同样是"不通"，不写路线（R8 ③）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、与低 k 的兼容性，以及测氧在这一格为什么**不是**缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ① **热预算两段叠加**（沉积 350–380 °C + H₂ 后处理 300–350 °C）：
 *      沉积 5–30 min ⇒ 甲基掉 5–10 %，k +0.05–0.1
 *      H₂ 后处理 20–30 min ⇒ 再掉 3–5 %，k +0.03–0.05
 *      合计：k 从 **2.65–2.95 → 2.75–3.05**（`mat/cu-seed-wafer` 不再声明 k —— 
 *      它是金属层，k 是衬底的属性，见"已知缺口①"）
 * ② **氯的去处**：膜里 0.5–2 at% ⇒ H₂ 350 °C 还原成 HCl 抽走 ⇒ 0.2–0.5 at%。
 *    再往下要 **H₂ 等离子体**（`plant/rf-13m56` + ald-reactor 的 rf 电极，都有），
 *    但少了"氯的在线分析"⇒ 判据只能是方阻与膜色（#23 那一族）。
 * ③ **氧与水这一格比低 k 那份强**：`data/machine/oxygen-metrology.ts` 已经造出两件量具
 *    （`plant/oxygen-probe` 1e-15–1 atm 的 pO₂、`plant/dew-point-meter` 0.05–23000 ppm 的 H₂O），
 *    **CuCl 腔的氧与水都能在线测** ⇒ 测氧在本文件里**只在氯那一格还站着**，
 *    不在氧与水那一格。这是本文件与 `lowk-barrier.ts` 的一处实质区别（那一份还在猜氧）。
 *    为什么这里必须测：Cu₂O 在 350 °C 上比 CuCl 更稳定（每摩尔配体的生成自由能差 30–50 kJ/mol）
 *    ⇒ 氧会抢在氯前面与铜成键，而 Cu₂O 的 ρ 是铜的 **1e6 倍**。
 *    判据由**通量比**定，不是由热力学定：铜的沉积通量 3–5 nm/min ≈ 4e14 原子/cm²/s，
 *    而 1e-6 atm 的氧只给 7e9 分子/cm²/s（Z = p/√(2πmkT)，350 °C）⇒ 只能氧化 1e-5 的铜；
 *    可是**晶界上 1 % 的单层 Cu₂O 就把方阻抬 10–30 %** ⇒ 所以判据取 1e-6 atm（0.1 Pa），
 *    它有 100 倍余量。10 % 的 Cu₂O 要 pO₂ ≈ 1e-3 atm —— 那已经是"漏大气"了。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、本文件的结构：2 条目 / 3 路线 / **0 台机器** / **0 件 std**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   条目 2   mat/cuprous-chloride（料，kg）· mat/cu-seed-wafer（片，part）
 *   路线 3   make/cuprous-chloride   2Cu + Cl₂ → 2CuCl（520–600 °C，氯的载体）
 *            make/cu-seed-cvd        CuCl 歧化沉积 + H₂ 后处理（主路线）
 *            make/cu-seed-pvd        蒸发加厚 60–100 nm 场厚（**降级 OR**，方阻不够）
 *
 * **0 台机器**：执行设备全部是既有的 106 台 —— `plant/resistance-furnace`（100–1100 °C，
 * 氯化源 520–600 °C）· `plant/ald-reactor`（150–400 °C / 10–100 Pa，沉积与 H₂ 后处理）·
 * `plant/evaporator`（0.001–10 Pa，PVD 那条）· `plant/ellipsometer` · `plant/probe-station` ·
 * `plant/oxygen-probe` · `plant/dew-point-meter` · `plant/mfc` · `plant/clean-room` ·
 * `plant/metrology-room` · `plant/water-polisher`。
 * 所以"机器必须有 `composedOf`、不许被路线产出"这条在本文件里没有落点（与上一份同）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、投料白名单（沿用 `lowk-barrier.ts` 那一份，违者 tsc 过、审查不过）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   mat/copper · mat/chlorine · mat/hydrogen · mat/water · mat/nitrogen · mat/argon
 *   ＋ 链内中间物：mat/cuprous-chloride · mat/cu-seed-wafer
 *   ＋ 上游中间物：mat/lowk-barrier-wafer（`lowk-barrier.ts` 的 3 nm TiN 低 k 片；
 *     按 `damascene.ts:227` 的先例，白名单管"从外面拿进来的料"，不拦链内中间物）
 *   std/：**0 件**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、R8 —— 每一处降级，与它的升级路线
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * | # | 降级（现在） | 原规格 | 升级路线 | 缺口量级 |
 * |---|---|---|---|---|
 * | ① | 连续下限 **场厚 15 nm / 沟底 7.5 nm**（5–7 nm 端做不到） | 5 nm 连续 | ALD Cu（②**不通**）或 Ru/Ta 润湿层（0 条）或把 AR 降到 1.5（版图） | 5 nm 端差 2–3 倍；渗流 5–8 nm 与去湿是两道门 |
 * | ② | ALD Cu **1/3 前驱体**（只有 Cu(hfac)₂ 有了） | Cu(dmap)₂ + H₂ 等离子体，160–260 °C，覆盖 95–100 % | **已建：`mat/cu-hfac2`（c3-chain.ts:670）+ `make/cu-hfac2`（c3-chain.ts:1859）**，purity 95–99.5 %、水 0.1–0.5 %；上游 `make/hfac` 也已建（c3-chain.ts:1794）。**但 ALD Cu 的 `make/cu-ald-hfac` 全表 0 条**（所以 mat/cu-hfac2 在报告里"没人吃"），Cu(dmap)₂ 与 Cu(acac)₂ 仍 0/2；覆盖差 1.4 倍、温度差 100–200 K | 整条链还差 2 件前驱体 + 1 条 ALD 路线 |
 * | ③ | 无电镀 **0/3 络合剂 + 0/1 催化剂 + 0/2 稳定剂** | EDTA/酒石酸盐/柠檬酸 + Pd 活化 | 四件里最硬的是**钯**（当时贵金属分离 0 条；现在 `pgm.ts` 有海绵 Pd，但 Pd/Sn 胶体与 PdCl₂ 路线仍未建）；其次是 EDTA（乙二胺 = 二氯乙烷 + 2NH₃，2 步） | 6 件里 5 件没有 ⇒ 不在"降级"里，是"换了东西"（#24） |
 * | ④ | 沟底覆盖 **50–70 %**（侧壁 65–85 %） | 90–100 %（ALD） | 场厚 30 nm（已做：沟底 15–21 nm）或降 AR（版图 1.5：沟底 70–85 %） | 覆盖差 1.4–2 倍；场厚补 2 倍 |
 * | ⑤ | 氯残留 **0.2–0.5 at%**（H₂ 后处理后） | <0.05 at%（电子级铜膜） | H₂ 350 °C × 30 min（**本文件已写**）；再降要 H₂ 等离子体（rf 与电极都有） | 差 4–10 倍；后果是 ρ 抬 10–20 % 与后道腐蚀 |
 * | ⑥ | 沉积速率 **1–5 nm/min**（350–380 °C，为保甲基） | 10–30 nm/min（450–500 °C，但甲基 400 °C 就掉） | 更低温度要 ALD（②不通）；或接受 30 nm 要 30 min | 速率差 3–10 倍；这一条是"拿速率换甲基" |
 * | ⑦ | 沟内 15–21 nm 的 ρ **2.5–4 µΩ·cm**（1.4–2.3× 体铜） | 1.75 µΩ·cm | 晶粒长大退火 350–400 °C × 30 min（**有去湿风险**）；或厚度到 60 nm（R□ 0.4） | 方阻差 1.4–2.3 倍；靠降电流（50 A/m²）补 |
 * | ⑧ | 200 A/m² 上 ΔV **0.15–0.34 V**（过电位的 0.9–2.3 倍） | <0.07 V | **起镀 50 A/m²**（本文件第⑦段与 `fine-damascene.ts` 的接线注释）：ΔV 0.038–0.084 V ✓ | 靠电流补，代价是填充时间 ×4（76 s → 300 s） |
 * | ⑨ | 去湿：10 nm 以下在 350–380 °C 成岛（测不出形貌，只能看方阻随时间涨） | 5 nm 稳定 | Cu–Cl 表面相（**已用**：这正是 CuCl CVD 的好处）；再要稳要 Ru 润湿层（0 条） | 10 nm 端差 2 倍；判据是方阻（没有原位形貌手段） |
 * | ⑩ | 氯的**在线分析**测不出（#23 在本文件只剩这一格） | 0.05 at% 的 Cl | 没有 Cl 的选择电极与离子色谱 ⇒ 只能"方阻 + 膜色 + 批次破坏分析" | 差 10 倍以上；与低 k 那份的"氧测不出"不同，这里氧与水**能测** |
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 七、已知缺口（"现在没有"，不是"暂未实现"）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① **`mat/cu-seed-wafer` 不声明 kValue**：它是金属层，k 是衬底（SiCOH）的属性。
 *     籽晶对 k 的影响只能写在注释里（+0.05–0.15，见第三节①），不另立属性 ——
 *     否则同一个"k"会在两个条目上各说一遍。
 *  ② **沟底厚度是算的，不是量的**：`plant/ellipsometer` 读的是场上的厚度（1–1000 nm，
 *     ±0.019 nm），沟底 7–21 nm 要**剖切**（`plant/fib-tem`，破坏性）。
 *     所以 `seedThickness` 的窗口是"场厚 × 覆盖"，抽检只能看见"方阻变了多少"。
 *  ③ **没有原位膜厚**：QCM（`plant/film-monitor`）在 CuCl 的腐蚀性气氛里会被氯化，
 *     本文件不把它接进来 —— 与 PECVD 那一份不同，这里它是**用不了**，不是"没接"。
 *  ④ **CuCl 的蒸气压只有锚点**：bp 1 490 °C 是唯一可靠的数，其余按 ΔHvap 120 kJ/mol 估；
 *     550–600 °C 上 9–24 Pa 是**估的**，不是查表值。
 *  ⑤ **铜在 TiN 上的成核延迟 20–60 s 没有量具**：只能按"方阻开始掉"判起点。
 *  ⑥ **本文件不改任何别的文件**：`fine-damascene.ts` 的三处接线（问三④）只在这里点名。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目（2 件：1 料 + 1 片）
// ═══════════════════════════════════════════════════════════════════════════

export const CUSEED_ITEMS: readonly Item[] = [
  /**
   * 氯化亚铜（CuCl）。白色立方晶体，mp **430 °C**、bp 1 490 °C，遇水水解成 Cu₂O + HCl。
   *
   * **它是氯的载体，不是氯的消耗品**：CuCl 在衬底上歧化放出一半的氯（变成 CuCl₂），
   * CuCl₂ 回到 570 °C 以上的氯化段又被铜还原成 CuCl ⇒ 氯在闭环里转，铜是唯一的净原料。
   * 所以这个条目存在的意义是**把回路写下来**：没有它，`make/cu-seed-cvd` 就得直接吃
   * 铜与氯气，而那样"氯去哪了"这句话就没地方说了。
   *
   * 两个规格：
   *   purity        96–99 %（杂质主要是 CuCl₂ 与 Cu₂O；CuCl₂ 不是坏东西，它会回流）
   *   waterContent  0.05–0.2 %（水解会生成 Cu₂O，那一份氯就白跑了，而且 Cu₂O 会进膜）
   */
  {
    id: 'mat/cuprous-chloride',
    name: 'Cuprous Chloride', name_zh: '氯化亚铜',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'waterContent', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 长了铜籽晶的片（φ100，3 nm TiN 上的一层铜）。
   *
   * 六个规格，每一个都对着六格里那一格：
   *   fieldThickness    场上的厚度（15–30 nm CVD／60–100 nm PVD）—— **CMP 要磨掉的就是它**
   *   seedThickness     **沟底**的厚度（= 场厚 × 沟底覆盖）—— 决定连续性与方阻，这才是"籽晶厚度"
   *   sidewallCoverage  侧壁中段的厚度 ÷ 场厚（AR 2）
   *   bottomCoverage    沟底的厚度 ÷ 场厚（AR 2）
   *   resistivity       **沟内那 7–20 nm 的铜**的电阻率（不是场上的）——
   *                     5 nm 是体铜的 5–10 倍、20 nm 是 1.5–2 倍（问二）
   *   chlorineContent   氯残留（at%）—— CuCl CVD 的代价，H₂ 后处理后 0.2–0.5
   *
   * ⚠️ `resistivity` 的口径是本文件最容易读错的一处：PVD 那条的**场上**是 60–100 nm
   * （ρ 2–3 µΩ·cm，接近体铜），但**沟内**只有 5–12 nm（ρ 8–18）——
   * 电镀看到的是**沟内**那一层。两个数不能混。
   */
  {
    id: 'mat/cu-seed-wafer',
    name: 'Wafer with Copper Seed Layer', name_zh: '长了铜籽晶的片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'fieldThickness', kind: 'range', min: 0, max: 500, unit: 'nm' },
      { param: 'seedThickness', kind: 'range', min: 0, max: 200, unit: 'nm' },
      { param: 'sidewallCoverage', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'bottomCoverage', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'resistivity', kind: 'range', min: 0.1, max: 1000, unit: 'µΩ·cm', dir: 'atMost' },
      { param: 'chlorineContent', kind: 'range', min: 0, max: 10, unit: 'at%', dir: 'atMost' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线（3 条：氯载体、主路线、降级 OR）
// ═══════════════════════════════════════════════════════════════════════════

export const CUSEED_ROUTES: readonly Route[] = [
  {
    /**
     * **氯载体：2 Cu + Cl₂ → 2 CuCl（520–600 °C，过量铜）。**
     *
     *   铜 642 + 氯 358 → 氯化亚铜 1000        进 1000 = 出 1000 ✓
     *   （2×63.55 + 70.91 = 197.99 = 2×98.99）
     *
     * ── 为什么是 520–600 °C ────────────────────────────────────────────────
     *
     *   铜与氯在 300–400 °C 上先生成 **CuCl₂**（放热、很快）；而 CuCl₂ + Cu → 2 CuCl
     *   要 520 °C 以上才快（这一步正是氯化段与沉积段的**温度交叉点**：570 °C 两侧
     *   平衡反向，见文件头问一①）。所以反应器里是**过量铜屑**，出来的是一价铜。
     *
     *   温度低 100 K 的后果不是慢，是**出来的是 CuCl₂**：它到 350 °C 的沉积腔里
     *   会先把铜**蚀掉**（Cu + CuCl₂ → 2 CuCl）—— 净沉积速率变负，膜反而薄。
     *
     * ── 腐蚀 ───────────────────────────────────────────────────────────────
     *
     *   Cl₂ + HCl + 湿气的混合物在 600 °C 上对碳钢 1–10 mm/年（`lowk-barrier.ts` 问二①
     *   的同一个口径）⇒ **石英管 + 石墨托**；钢壳只承压、不接触介质。
     *   本文件的投料里没有石英与石墨，因为它们是**设备**（管与托），不是消耗的料。
     *
     * ⚠️ 批次按 1000 kg 记配比；实际一条籽晶线每批只用 0.1 g（25 片的铜只有 53 mg），
     *    其余是回路里的**存量**（50 g 装料循环），存量不消耗、不进 `uses`。
     */
    id: 'make/cuprous-chloride',
    name: 'Chlorine Carrier Production', name_zh: '氯载体制备',
    produces: [
      {
        item: 'mat/cuprous-chloride',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 96, max: 99 },
          { param: 'waterContent', kind: 'range', min: 0.05, max: 0.2 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/copper',
            qty: q(642),
            // 杂质（Fe/Al/Ca）在氯化段会变成氯化物进回路，最后沉积进膜 ⇒ 要 99 % 以上
            need: [{ param: 'purity', kind: 'range', min: 99, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/chlorine', qty: q(358) }] },
    ],
    needs: [],
    performedBy: 'plant/resistance-furnace',
    under: [{ param: 'temperature', min: 520, max: 600 }],
    rate: { hours: q(8) },
  },

  {
    /**
     * **铜籽晶：CuCl 歧化 CVD（350–380 °C，10–100 Pa）+ H₂ 后处理。**
     *
     *   低 k 阻挡片 25 + 氯化亚铜 0.1 g + 氢 0.2 g + 氮 5 g + 氩 5 g + 水 2 kg
     *   → 铜籽晶片 25（场厚 15–30 nm、沟底 7–21 nm、覆盖 50–70 %、ρ 2.5–4）
     *
     * ── 七道工序，每道一台设备 ───────────────────────────────────────────────
     *
     *   ① 水：`plant/dew-point-meter` 读气源与腔体的露点 —— 要 **<−60 °C（10 ppm）**。
     *      CuCl 水解成 Cu₂O 是不可逆的，1 % 的水就能吃掉百分之几的铜。
     *   ② 氧：`plant/oxygen-probe` 读 pO₂ —— 要 **<1e-6 atm**。
     *      这是测氧在本文件里**不再是缺口**的那一格（文件头第三节③）：
     *      1e-6 atm 的氧只够氧化 1e-5 的铜，但晶界上 1 % 的单层 Cu₂O 就抬 10–30 % 的方阻
     *      ⇒ 取 1e-6 atm 是保守值（通量比见文件头）。**能测就得测。**
     *   ③ 氯化源：`plant/resistance-furnace` 520–600 °C（`make/cuprous-chloride` 的同一台），
     *      CuCl 蒸气压 9–24 Pa（按 ΔHvap 120 kJ/mol 估）—— 正好是腔压，不需要载气。
     *   ④ 沉积：`plant/ald-reactor` 350–380 °C / 10–100 Pa，1–5 nm/min ⇒ 15–30 nm 要 3–30 min。
     *      380 °C 的上限是 SiCOH 的甲基线（400–425 °C 开始掉），不是化学的线。
     *   ⑤ H₂ 后处理：300–350 °C / 10–50 Pa / 20–30 min ⇒ Cl 0.5–2 → **0.2–0.5 at%**，
     *      同时把残余 CuCl 还原成 Cu（CuCl + ½H₂ → Cu + HCl）。
     *   ⑥ 量厚：`plant/ellipsometer`（场上 15–30 nm，±0.019 nm）；沟底只能剖切（缺口②）。
     *   ⑦ 量方阻：`plant/probe-station` —— 场厚 30 nm 的 R□ = 0.8–1.3 Ω/□、
     *      沟底 15–21 nm 的 R□ = 1.2–2.7 Ω/□（问二①）。**这是唯一能判"连续没有"的电学判据**
     *      （连续性与方阻一一对应：不连续的膜方阻高 1–2 个量级）。
     *
     * ── 连续性的两个门（问一③）────────────────────────────────────────────
     *
     *   渗流 5–8 nm + 去湿（350–380 °C 上 10 nm 以下成岛）⇒ **连续下限场厚 15 nm / 沟底 7.5 nm**。
     *   所以这条路线交的是 **7–21 nm**，不是 5–30 nm —— 5–7 nm 那一端做不到（R8 ①）。
     *
     * ── 与下游的接法（问三④）──────────────────────────────────────────────
     *
     *   籽晶之后照 `fine-damascene.ts` 的第⑥⑦段：**50 A/m² 起镀到沟内 20–30 nm
     *   （ΔV 0.038–0.084 V），再拉到 200 A/m² 填沟**。不加这一步，30 nm 的籽晶
     *   在 200 A/m² 上仍有 0.15–0.34 V 的终端效应（过电位的 0.9–2.3 倍）。
     */
    id: 'make/cu-seed-cvd',
    name: 'Wafer with Copper Seed Layer Manufacturing', name_zh: '长了铜籽晶的片制造',
    produces: [
      {
        item: 'mat/cu-seed-wafer',
        qty: q(25),
        gives: [
          { param: 'fieldThickness', kind: 'range', min: 15, max: 30 },
          // 沟底 = 场厚 × 50–70 %：15×0.5 = 7.5，30×0.7 = 21
          { param: 'seedThickness', kind: 'range', min: 7, max: 21 },
          { param: 'sidewallCoverage', kind: 'range', min: 65, max: 85 },
          { param: 'bottomCoverage', kind: 'range', min: 50, max: 70 },
          { param: 'resistivity', kind: 'range', min: 2.5, max: 4 },
          { param: 'chlorineContent', kind: 'range', min: 0.2, max: 0.5 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/lowk-barrier-wafer',
            qty: q(25),
            // 籽晶要长在**薄**阻挡上：5 nm 的 TiN 会把 100 nm 的沟吃到 90.5–91.2 nm，
            // 3 nm 只吃到 94.4–94.7（`lowk-barrier.ts` 问五④）。放宽之后功能还在，只是沟更窄。
            need: [{ param: 'barrierThickness', kind: 'range', max: 3.5, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      // CuCl 0.1 g：25 片的铜只有 53 mg（78.5 cm² × 25 × 30 nm × 8.96 g/cm³ = 53 mg），
      // 折 CuCl 82 mg；净耗就是这 82 mg（其余循环），再加管壁与尾气损失 ⇒ 0.1 g。
      // 回路里的 50 g 装料是**存量**，不消耗。
      { anyOf: [{ item: 'mat/cuprous-chloride', qty: q(1, 10000) }] },
      // 氢 0.2 g：H₂ 30 sccm × 30 min = 0.9 L(STP) = 0.08 g；取 0.2 g 给升降温的置换与管壁
      {
        anyOf: [
          {
            item: 'mat/hydrogen',
            qty: q(1, 5000),
            // 氢里的氧是轻则氧化、重则爆炸的那一格（第二个实例）；
            // 本层的氧气表能测（文件头第三节③），但纯度仍是 99–99.999 的窗口
            need: [{ param: 'purity', kind: 'range', min: 99.99, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      // 氮 5 g：破空与吹扫 200 sccm × 30 min = 6 L ⇒ 7 g 的 70 %
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 200) }] },
      // 氩 5 g：起炉稀释与检漏
      { anyOf: [{ item: 'mat/argon', qty: q(1, 200) }] },
      // 水 2 kg：腔体与法兰的冷却（不是工艺水）
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: [
      // 三路气的计量（H₂／N₂／Ar）；CuCl 那一路是源温控的，不用 MFC
      'plant/mfc',
      'plant/clean-room',
      'plant/metrology-room',
      'plant/water-polisher',
    ],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① 水：读气源与腔体的露点 —— **<−60 °C（10 ppm）**。CuCl 水解成 Cu₂O 不可逆，1 % 的水就吃掉百分之几的铜；这一格本层**能测**（`plant/dew-point-meter` 0.05–23000 ppm）',
        performedBy: 'plant/dew-point-meter',
      },
      {
        note_zh:
          '② 氧：读 pO₂ —— **<1e-6 atm**（`plant/oxygen-probe` 1e-15–1 atm）。判据由通量比定：铜的沉积通量 4e14 原子/cm²/s，1e-6 atm 的氧只有 7e9 分子/cm²/s ⇒ 只能氧化 1e-5；但晶界上 1 % 的单层 Cu₂O 就抬 10–30 % 的方阻，所以取 1e-6 atm 是保守值。**与低 k 那份不同，这里不是猜的**',
        performedBy: 'plant/oxygen-probe',
      },
      {
        note_zh:
          '③ 氯化源：过量铜屑 + 氯 520–600 °C ⇒ CuCl 蒸气 **9–24 Pa**（按 ΔHvap 120 kJ/mol 估）；温度低 100 K 出来的是 CuCl₂，它到冷区先把铜蚀掉（Cu + CuCl₂ → 2CuCl）⇒ 净沉积速率变负',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 520, max: 600 }],
      },
      {
        note_zh:
          '④ 沉积（歧化）：2CuCl(g) → Cu + CuCl₂(g)，350–380 °C、10–100 Pa、1–5 nm/min ⇒ 15–30 nm 要 3–30 min。**380 °C 的上限是 SiCOH 的甲基线**（400–425 °C 开始掉），不是化学的线；氯在铜表面形成 Cu–Cl 相，压低表面能、**抑制去湿**（这是它比 PVD 强的地方）',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 350, max: 380 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '⑤ H₂ 后处理：300–350 °C、10–50 Pa、20–30 min ⇒ Cl 0.5–2 → **0.2–0.5 at%**，残余 CuCl 还原成 Cu（CuCl + ½H₂ → Cu + HCl）。温度不能过 380（去湿 + 甲基）⇒ 更低的 Cl 残留要靠等离子体（rf-13m56 + ald-reactor 的电极都在），但氯没有在线分析（R8 ⑩）',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 300, max: 350 },
          { param: 'pressure', min: 10, max: 50 },
        ],
      },
      {
        note_zh:
          '⑥ 量厚：椭偏读**场上**的 15–30 nm（±0.019 nm）；沟底 7–21 nm 只能剖切（`plant/fib-tem`，破坏性）⇒ `seedThickness` 的窗口是"场厚 × 覆盖"算出来的（缺口②）',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑦ 量方阻：四探针 —— 场厚 30 nm 是 **0.8–1.3 Ω/□**、沟底 15–21 nm 是 **1.2–2.7 Ω/□**。这一格是"连续没有"的唯一电学判据（不连续的膜方阻高 1–2 个量级）；随后起镀 50 A/m² 到沟内 20–30 nm（ΔV 0.038–0.084 V），再拉到 200 A/m²',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **降级 OR：蒸发加厚到 60–100 nm 场厚（`plant/evaporator`）。**
     *
     *   低 k 阻挡片 25 + 铜 1 g + 水 2 kg → 铜籽晶片 25（场厚 60–100 nm、沟底 5–12 nm）
     *
     * ── 它解决了什么、没解决什么 ────────────────────────────────────────────
     *
     *   解决**连续性**：AR 2 的沟底覆盖是 8–12 %（几何决定，改不了），
     *   场厚 60–100 nm 给沟底 **5–12 nm** ⇒ 过了渗流阈值 ✓；
     *   而沟口只被吃掉 2×(3.6–10) = 7–20 nm（100 nm 的嘴还剩 80–93 nm，不会夹断）。
     *   没解决**方阻**：5–12 nm 的铜 ρ 是 **8–18 µΩ·cm**（问二①的 Fuchs–Sondheimer
     *   + 晶界），R□ = 7–36 Ω/□ ⇒ 就算 50 A/m² 起镀，ΔV = 0.22–1.1 V，还是过电位的 1.5–7 倍。
     *   ⇒ **连续 ≠ 够用。** 这一条是本文件的第二个结论，也是"为什么必须写 CVD"的那句。
     *
     * ── 它还有一笔隐藏成本 ─────────────────────────────────────────────────
     *
     *   场厚 60–100 nm 全要 CMP 磨掉，而 CMP 的去除量本来只有 500–600 nm
     *   （`fine-damascene.ts` 第⑦段）⇒ 多磨 10–20 %，dishing 也跟着涨 1–2 nm。
     *   而 CVD 那条的场厚只有 15–30 nm，这一笔是 1/3–1/4。
     *
     * ⚠️ 铜 1 g：25 片 × 78.5 cm² × 100 nm × 8.96 = 0.176 g；蒸发是全面沉积，
     *    腔壁与挡板吃掉 3–5 倍 ⇒ 0.7–0.9 g，取 1 g。
     */
    id: 'make/cu-seed-pvd',
    name: 'Wafer with Copper Seed Layer Manufacturing', name_zh: '长了铜籽晶的片制造',
    produces: [
      {
        item: 'mat/cu-seed-wafer',
        qty: q(25),
        gives: [
          { param: 'fieldThickness', kind: 'range', min: 60, max: 100 },
          // 沟底 = 场厚 × 8–12 %：60×0.08 = 4.8，100×0.12 = 12
          { param: 'seedThickness', kind: 'range', min: 5, max: 12 },
          { param: 'sidewallCoverage', kind: 'range', min: 6, max: 10 },
          { param: 'bottomCoverage', kind: 'range', min: 8, max: 12 },
          { param: 'resistivity', kind: 'range', min: 8, max: 18 },
          { param: 'chlorineContent', kind: 'range', min: 0, max: 0.1 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/lowk-barrier-wafer',
            qty: q(25),
            need: [{ param: 'barrierThickness', kind: 'range', max: 3.5, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/copper',
            qty: q(1, 1000),
            need: [{ param: 'purity', kind: 'range', min: 99.9, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/water-polisher'],
    rate: { hours: q(2) },
    steps: [
      {
        note_zh:
          '① 蒸发：铜在钨舟里 1 200–1 400 °C 蒸发，0.001–0.01 Pa、0.5–2 nm/s ⇒ 60–100 nm 要 50–200 s。**直线视线**：AR 2 的沟底只有 8–12 %、侧壁 6–10 %（这是几何，不是参数）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh:
          '② 量厚：椭偏读场上 60–100 nm（±0.019 nm）；沟底 5–12 nm 是"×8–12 %"算的',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 量方阻：沟内 5–12 nm ⇒ **7–36 Ω/□**（ρ 8–18 µΩ·cm）。这一格就是这条路线判死的理由：连续但方阻高 1 个量级 ⇒ 50 A/m² 起镀也是 0.22–1.1 V（过电位的 1.5–7 倍）',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CUSEED_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CUSEED_ROUTES];
