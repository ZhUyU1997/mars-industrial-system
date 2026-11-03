/**
 * 低 k 介质（SiCOH）与 3 nm 阻挡层 —— 细线核算六格的**最后两格**。
 *
 * `fine-damascene.ts` 的六格判决里剩下这两格没答：
 *
 *   | 判据 | 本层现在 | 本文件交付 | 差几倍 |
 *   |---|---|---|---|
 *   | kValue ≤2.5 | 4.32–4.54（`make/fine-damascene-layer`） | **2.6–2.9**（PECVD SiCOH）／2.8–3.1（旋涂 MSQ）／2.2–2.5（多孔，干态） | 1.04–1.16× |
 *   | barrierThickness ≤3 | 5（ALD TiN，167 周期） | **3**（60–150 周期） | **1.0×** |
 *
 * `cmp-integration.ts` 已经用 FSG 做到 3.5–3.7（SiO₂ + 2F₂ 的路线），再往 2.5 走要的是
 * **SiCOH（掺甲基）或多孔**，而那一份的断点不是碳数、是**一条 Si–C 键的链**：
 * 甲烷在等离子体里只给 Si–C（碳化硅，k 6.5–10）与 a-C:H，给不了 Si–CH₃。
 * 所以这一份从**甲醇**起步，走 CH₃Cl → 甲基氯硅烷 → MTMS → PECVD，把甲基预先连在硅上。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、六个问题（每一问都带数）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── 问一：硅粉有没有？Rochow 要 99 % 的 75–300 µm 硅粉 ────────────────────────
 *
 * **有 —— 把 6N 多晶硅棒磨成粉，用的是选矿厂那套颚破 + 球磨；代价是能量，不是纯度。**
 *
 * ① 三件候选，只有一件能用：
 *      `mat/silicon-wafer`  单位是**片**、类别是 **part**（`wafer.ts:53`）——
 *                        拿它当原料会撞 `part_as_raw_material`；而且 φ100 × 0.7 mm
 *                        一片 12.8 g，1 kg 要 **78 片**（七八十片走完七道门的镜面片
 *                        拿去磨粉）⇒ 等于把链白走一遍。**不能用。**
 *      `mat/silicon-mg`     98 %，`make/silicon-mg`（硅石 + 碳、1900–2200 °C 电弧炉）。
 *                        工业 Rochow 用的就是这一档（98.5–99.5 %）。**能用，B/P 偏高。**
 *      `mat/polysilicon`    **6N**，`make/polysilicon`（西门子还原 1050–1150 °C，
 *                        SiHCl₃ 精馏过）。本文件用它：纯度比工业 Rochow 的料还高 1–2 个量级
 *                        （B/P 是 ppb 对 10–50 ppm），代价是 **50–100 kWh/kg 对冶金级硅的
 *                        12–14 kWh/kg ⇒ 原料贵 4–8 倍**（R8 ⑨）。
 *
 * ② 磨到 75–300 µm（= 50–200 目）的手段：`plant/ore-beneficiary` 的**颚破 + 球磨**
 *    （一套五件：破碎机、球磨机、浮选槽、浓缩机、过滤机；`refining.ts:428`）。
 *      硅棒碎块 5–20 mm → 球磨 2–4 h → 筛分 75–300 µm，收率 **92–96 %**
 *      （<45 µm 的细粉 15–25 % 回炉重熔，它烧结不成粉床）
 *    同一条链上已有先例：`make/trichlorosilane` 的硅粉就是 `needs: ['plant/grinder']`
 *    —— 但磨床是**磨削**（砂轮、微米级光洁度），不是**破碎**（冲击、毫米级粒度），
 *    两件事不能互换：磨床磨出来的是粉浆，不是 75 µm 的流化床料。
 *
 * ③ 污染：钢衬板带进铁 **0.05–0.3 %**，对 Rochow **无害**（铁是中性的，铜才是催化剂），
 *    但会稀释硅、并在后段进釜残。10 % HCl + 1 % HF 洗一遍降到 50–200 ppm。
 *    真正怕的是 B/P（p 型掺杂剂），6N 的料磨完 0.1–1 ppm，仍比冶金级硅好 1–2 个量级 ✓。
 *
 * ④ 铜催化剂：`mat/copper`（kg，97–99.99 %），**5–8 wt%** 与硅一起磨成 Cu₃Si 相。
 *    ⚠️ 本层**没有 Zn / Sn / P 助剂**（`mat/zinc` 有条目，锌白/锌锭那条链在 `zinc.ts`；
 *    Sn 在 `cmp-integration.ts` 的白名单里有 `mat/tin` 但不在本文件白名单）。助剂决定
 *    **MTS/DDS 的比例**：没有它们，直接法只会更偏 DDS（见问三）。
 *
 * ── 问二：CH₃Cl 的产率，与 HCl/水对设备的腐蚀 ────────────────────────────────
 *
 * **甲醇 + HCl，Al₂O₃ 催化，300–350 °C：单程转化 85–95 %、选择性 92–97 %，副产二甲醚 2.4 wt%。**
 *
 *       CH₃OH + HCl → CH₃Cl + H₂O                    （主）
 *       2 CH₃OH → (CH₃)₂O + H₂O                      （副，酸催化脱水）
 *
 *   每 1000 kg CH₃Cl（19.81 kmol）：甲醇 **668** + HCl **722** → CH₃Cl **1000**
 *   + 水 **366** + 二甲醚 **24**。进 1390 = 出 1390 ✓（甲醇按 5 mol% 走副反应反算：
 *   634.6/0.95 = 668；水的 366 = 356.8 主反应 + 9.4 副反应）。
 *
 * ① **腐蚀是这一段真正的设备问题**（量级估算，没有腐蚀试验）：
 *      干 HCl 300 °C 对碳钢      0.1–0.5 mm/年
 *      湿 HCl（冷凝液 60 °C）    1–10  mm/年   ← 两台设备里坏的是这一台
 *      石英（SiO₂）              <0.01 mm/年  ✓ 反应段用它
 *      石墨（浸渍酚醛/PTFE）      <0.1 mm/年   ✓ 冷凝段用它
 *    ⇒ 反应段：**石英管内衬**（`mat/quartz-pure`）+ 45 钢外壳承压（0.6 kPa 的外压，
 *    石英管不承压、只隔介质）；冷凝段：石墨降膜/列管。
 *    ⚠️ 本层的 `mat/carbon` 是**未浸渍**的碳（ash 0.5–20 %），做换热器会**渗** —— 这是 R8 ⑪，
 *    不是"用石墨"三个字能盖掉的。
 *
 * ② 冷凝的温度账（−30 °C 是必须的，不是选的）：
 *      CH₃Cl bp **−24 °C** ⇒ −30 °C 上凝成液；
 *      HCl bp **−85 °C** ⇒ 留在气相，**回流到反应段**（所以单程转化 85–95 % 而总收率 96–98 %）；
 *      水在 −30 °C 上冻成冰，冰面蒸气压 **38 Pa** ⇒ 气相水被压在 375 ppmv；
 *      液态 CH₃Cl 里溶解的水仍有 **200–500 ppm**（0.02–0.05 wt%）—— Rochow 要 <100 ppm，
 *      差 2–5 倍，靠过量 CH₃Cl 与铜粉表面容忍（R8 ⑩）。
 *    ⚠️ **−30 °C 没有任何一台设备 hold 得住**（本层的 `holds` 是"设备维持条件"，
 *    而最冷的设备 `plant/sublimator` 是 0–277 °C；干冰 −78.5 °C 与液氮 −196 °C 是**料**
 *    不是设备，`holds` 写不进去）⇒ 冷凝这一步不写 `under`（写了就 `no_machine`），
 *    记成缺口③。
 *
 * ── 问三：MTMS 的选择性 —— 66 / 70 / 57 °C 的三元物要多少块板 ─────────────────
 *
 * **MTS/DDS 差 3.9 °C ⇒ α = 1.13 ⇒ Fenske 最小 62 块理论板，R = 2R_min 要 95–130 块。
 * 而本层只有一台塔，它的窗口（40–80 °C **且** 300–1000 kPa）罩不住这一对。**
 *
 * ① **先把产率说清：题面的"CH₃SiCl₃ 占 60–80 %"不是直接法的分布，是再分配之后的收率。**
 *    工业直接法（mol% of Si）：**DDS 75–85 / MTS 5–15 / TMS 2–4 / SiCl₄ 1–5**。
 *    本文件按 80 : 15 : 5 记账。要让 MTS 成为主产物，靠的是**再分配**：
 *
 *         (CH₃)₂SiCl₂ + SiCl₄ → 2 CH₃SiCl₃        （AlCl₃，250–300 °C，K ≈ 1）
 *
 *    单程 50–65 %、回流后 90 %+ ⇒ 这是把 15 % 的选择性拉回 45–60 % 的那条路（`make/mts-redistribution`）。
 *
 * ② **板的数目**（Fenske，x_D = 0.99、x_B = 0.05；ΔHvap 30 kJ/mol、T 341 K）：
 *
 *      α = exp(ΔHvap·ΔT/(R·T²))，ln α = 30000 × ΔT /(8.314 × 341²) = ΔT × 0.0310
 *
 *      MTS 66.1 / DDS 70.0   ΔT 3.9 K ⇒ α = **1.13** ⇒ N_min = ln(99×19)/ln α = **62 板**
 *                            ⇒ 实际（R = 2R_min）**95–130 板**，HETP 0.3 m ⇒ **塔高 30–40 m**
 *      MTS 66.1 / SiCl₄ 57.6 ΔT 8.5 K ⇒ α = **1.30** ⇒ N_min = **28 板**
 *      TMS 57.3 / SiCl₄ 57.6 ΔT 0.3 K ⇒ α = **1.009** ⇒ N_min = **810 板** ⇒ **这一对分不开**
 *                            （所以 TMS 只能靠反应分布控制，不靠精馏）
 *
 * ③ **本层的塔为什么罩不住**（`poly-plant.ts:116`）：
 *      塔 holds  **40–80 °C 且 300–1000 kPa**（为 SiHCl₃ 的 bp 31.8 °C 定的）
 *      MTS 在 300 kPa 上 bp 要 **104 °C**（用 Clausius–Clapeyron 反算）⇒ 差 24 K
 *      MTS 在 80 °C 上要 **153 kPa** ⇒ 差 2.0 倍压力
 *    ⇒ 两个方向都够不着。**降级：用 `plant/mid-pressure-autoclave` 做釜式蒸馏**
 *    （100–120 °C / 250–300 kPa，两个条件都在它的窗口里），而釜式只有 **1–2 块理论板**
 *    ⇒ MTS 纯度只到 **75–90 %**（工业 99.5 %+，按杂质算差 20–100 倍）。R8 ③。
 *
 * ④ 于是 MTMS 也不纯：MTS 里剩下的 DDS 与 SiCl₄ 会变成
 *    **二甲基二甲氧基硅烷（DMDMS，8–18 %）** 与 **正硅酸甲酯（TMOS，1–4 %）**。
 *    DMDMS 是**双官能**的链端基：它把 T 树脂的网**截断** ⇒ 模量从 8–10 GPa 掉到 **2–4 GPa**
 *    （CMP 要 >5 GPa）⇒ 这一条记在 R8 ④，是本文件最要紧的**纯度—力学**耦合。
 *
 * ── 问四：SiCOH 的 k 到底能到多少？本层的等离子体能不能启辉与维持？ ─────────────
 *
 * **k = 2.6–2.9（干态）／2.7–3.0（湿态）。能启辉、能维持 —— 卡的不是等离子体，是气压低一个量级。**
 *
 * ① k 的数：MTMS + O₂ 的 PECVD 给 **k 2.6–2.9**（掺 10–20 % TEOS 当交联点，
 *    否则纯 T 树脂的膜太软）；湿态 2.7–3.0（Si–CH₃ 的疏水端把吸潮压到 <1 vol%）。
 *    2.5 以下要孔隙率 **26.7 %**（Clausius–Mossotti，(ε−1)/(ε+2) = (1−p)×0.4545），
 *    那是多孔那条（`make/sico-h-porous`），干态 2.2–2.5、**湿态 3.2–3.9**，见 R8 ①。
 *
 * ② **启辉：成立，而且比 RIE 那台更容易。** 帕邢判据看 pd：
 *      腔 `plant/ald-reactor`：**10–100 Pa**、极间距 30–50 mm ⇒ pd = **0.3–5 Pa·m**
 *      = 0.2–4 Torr·cm，正落在 Ar/有机蒸气的帕邢极小附近 ⇒ 击穿电压 **200–400 V**
 *      `plant/rf-13m56` 给 13.56 MHz / 500 W、V_rf 300–500 V ⇒ **够**
 *    对照：`plant/rie-etcher` 那台 134 kHz 的要在 **4–8 Pa** 上靠 1.5–4 kV 才起得来
 *    （`rie.ts` §一：低频的鞘层厚 16 倍、V_rf 高 40 倍，1.3 Pa 上根本起不来）——
 *    所以"本层没有等离子体"这句话是**过去时**：`plant/rf-13m56` 是把那个缺口补上的那台。
 *
 * ③ 维持：500 W 打在 φ300 的电极上 = **0.7 W/cm²**（工业 PECVD 0.1–1）⇒ n_e 1e15–1e16 m⁻³，
 *    稳定。**但工业 PECVD 的窗口是 130–1300 Pa，本腔只到 100 Pa** ⇒ 低 1.3–13 倍，
 *    代价是**沉积速率 20–60 nm/min**（工业 HDP 200–600 nm/min）与**均匀性 ±10–20 %**
 *    （工业 ±3 %）。这是 k 之外的真实降级，R8 ⑥。
 *
 * ④ **k 是能量出来的**（这是与 `cmp-integration.ts` 缺口⑩ 相反的一处更正）：
 *    `plant/probe-station` 有 C-V 台（1 kHz–1 MHz，电容 1 pF–1 nF，100 pF–1 nF 档 0.3 %；
 *    `probe-station.ts:287`："C-V 反算的是 EOT，不是 k；要从 EOT 得 k 还要知道物理厚度"），
 *    厚度由 `plant/ellipsometer` 给（±0.019 nm）。蒸 φ1 mm 的铝点当电极：
 *      C = ε₀·k·A/t = 8.854e-12 × 2.7 × 7.85e-7 / 500e-9 = **37.5 pF**（落在 10–100 pF 档）
 *      误差链：电容 0.6 % ⊕ 厚度 0.004 % ⊕ **面积 ±4 %**（φ1 mm 的掩模孔 ±10 µm）
 *      ⇒ **k 的实测精度 ±4 %**，而 2.6 与 2.9 差 11 % ⇒ **分得开** ✓
 *    所以本文件的 k 窗口不是"按工艺推的"，是**能验的**（R8 ⑧ 只留下"片内 49 点图"没做）。
 *
 * ── 问五：3 nm TiN 连续吗？3 nm 还挡得住铜吗？ ──────────────────────────────
 *
 * **连续（成核延迟 10–20 周期之后，1.5–2.5 nm 闭合，3 nm 有余量）；挡得住（Cu 要 >2 nm）。
 * 但 88–95 % 的台阶覆盖把 3 nm 变成"侧壁 2.6–2.9、沟底角 1.8–2.3" ⇒ 沟底那一格是临界的。**
 *
 * ① 周期数：GPC（TiN）**0.02–0.05 nm/周期**（`ald.ts:534`：TiN 0.02–0.05）。
 *      3 nm = **60 周期**（0.05）／100（0.03）／150（0.02），11.5 s/周期
 *      ⇒ **11.5 / 19.2 / 28.8 min**（单片；25 片批处理 22.5 s/周期 ⇒ 翻倍）
 *    对照 5 nm = 167 周期 ⇒ 3 nm 把 ALD 的热预算砍掉 **36–64 %**，这对下面的兼容性是好消息。
 *
 * ② 连续性：ALD 的岛状成核有 **10–20 周期**的延迟（0.2–1 nm），之后按岛合并闭合。
 *    TiN 在 SiO₂ 上的闭合厚度 **1.5–2.5 nm**（文献量级，本层没有原位电导法可测）。
 *    3 nm = 60 周期 ⇒ 扣掉 15 周期的延迟还有 2.25 nm ⇒ **连续** ✓（余量 1.2–2.0 倍）。
 *
 * ③ 阻挡有效性：Cu 穿 TiN 走**晶界**。3 nm 的柱状晶只有 3–5 层原子层厚，
 *    晶界不贯通 ⇒ 有效。判据是 **>2 nm**（<2 nm 会出针孔，Cu 直接贴低 k，
 *    D = 1e-13 cm²/s ⇒ 2 h 穿透，`ald.ts:1754` 那一笔）。3 nm 余量 **1.5 倍** ✓。
 *
 * ④ **但台阶覆盖会把它吃掉一半**：88–95 % 的覆盖 ⇒ 侧壁 **2.64–2.85 nm**（仍 >2 ✓）；
 *    沟底内角的覆盖只有 **60–75 %**（Knudsen 输运在 100 nm × 200 nm 的角上最差）
 *    ⇒ 沟底 **1.80–2.25 nm** —— **下界卡在 2 nm 上**。
 *    ⇒ 结论：**3 nm 对 100 nm 的沟成立（侧壁 2.6–2.9），沟底内角临界；
 *    对 65 nm 以下（AR 3–4、覆盖 50–70 % ⇒ 1.5–2.1 nm）不成立。**
 *    要保证沟底 ≥2 nm，场厚得 **3.3–3.5 nm**（= 3 nm 判据 + 10–15 % 的覆盖余量），
 *    或者把 ALD 的剂量窗口调宽（R8 ⑤）。
 *
 * ⑤ 顺带一笔：3 nm TiN 的方阻 R□ = ρ/t，ρ = 100–200 µΩ·cm ⇒ **333–667 Ω/□**
 *    （5 nm 是 200–400）。**`fine-damascene.ts:170` 记的"0.25–0.4 Ω/□"差 1e3** ——
 *    那是把 ρ 当成 1.5e-8 Ω·m（铜的量级）算的，而它同一句给的 ρ 是 100–200 µΩ·cm。
 *    本文件按 333–667 记，改不改那一处是主 agent 的账（本文件不改别的文件）。
 *
 * ── 问六：k 怎么从 2.6–2.9 压到 ≤2.5？MTMS + DMDMS 混配的三问 ─────────────────
 *
 * **不靠造孔剂（C6+ 那条 0 条），靠双甲基掺入：把一部分三官能的 T 单元换成双官能的 D 单元。
 * 掺量 D/(D+T) = 27–32 mol% ⇒ k 2.41–2.49；代价是模量从 6–9 GPa 掉到 2.5–3.5 GPa，
 * 而后者在 CMP 的 3 psi / 20 kPa 下**压不塌、但磨得动** —— 这一格是拿 erosion 换的。**
 *
 * ① **掺多少、用哪条混合律**：
 *    (a) **理想混合（Lorentz–Lorenz，按摩尔极化率相加）**：
 *          (α/M)_T = 0.2873 cm³/g（T 树脂 CH₃SiO₁.₅：k 2.90、ρ 1.35）
 *          (α/M)_D = 0.3798 cm³/g（PDMS (CH₃)₂SiO：k 2.75、ρ 0.97 —— 甲基单位质量的
 *                    极化率**更高**，所以 D 掺进来时"密度降"与"极化率升"在互相抵消）
 *          (k−1)/(k+2) = ρ·[w_D·0.3798 + (1−w_D)·0.2873]，1/ρ = w_D/0.97 + (1−w_D)/1.35
 *        ⇒ **D = 30 mol% 的理想混合只给 k 2.85**（ρ 1.22）—— 离 2.5 还差 14 %。
 *        **只算这一步会得出"掺 D 没用"的错误结论**，所以还有第二步。
 *    (b) **剩下的 0.4 来自自由体积**：D 单元是链端基，把网截断 ⇒ 膜排不密。
 *        把 (a) 的 k 2.85 当基体、再按 Clausius–Mossotti 加 p 的孔：
 *          (k−1)/(k+2) = (1−p)·0.3812
 *        ⇒ k 2.44 要 **p = 15 vol%**，密度落到 **1.04 g/cm³**（T 树脂 1.35）。
 *    ⇒ 把 p 与 D 绑成一条标定线（它们本来就是同一个机理，不是两个旋钮）：
 *           D/(D+T) 10 mol% ⇒ p ≈ 0 %  ⇒ k 2.87
 *           D/(D+T) 20 mol% ⇒ p ≈ 8 %  ⇒ k 2.63   ← 这两点就落在现在的 2.6–2.9 里
 *                                                  （MTMS 自带 8–18 wt% DMDMS）
 *           D/(D+T) 27 mol% ⇒ p ≈ 13 % ⇒ k 2.49
 *           D/(D+T) 32 mol% ⇒ p ≈ 16 % ⇒ k 2.41
 *    ⇒ **掺量：DMDMS : MTMS = 0.37–0.47 : 1（摩尔）= D 占混合气的 27–32 vol%**
 *      （= 25–29 wt%）。两个前驱体的 bp 是 102 与 106 °C，同温同载气 ⇒ 摩尔比 = 体积比。
 *    ⚠️ 掺 D 的那一件**不是** `mat/dimethyl-dichlorosilane`（那是二**氯**，DDS）：
 *      氯硅烷直接进 O₂ 等离子体会放 2 mol 的 HCl、把氯带进膜（1–3 at%），
 *      所以要它先醇解成二**甲氧基**（`make/dmdms`，与 `make/mtms` 同一套化学）。
 *
 * ② **代价是不是模量（问二）：压不塌，但磨得动。**
 *    模量：密度 1.04 对 1.35 ⇒ Gibson–Ashby 的 E ∝ ρ³–ρ⁴ 给 0.46–0.35，
 *    从 8 GPa 掉到 2.8–3.7；再算上 D 截断网络的连通性损失 ⇒ **2.5–3.5 GPa**
 *    （工业 k 2.5 的膜 E 3–5 GPa，同一档）。
 *
 *    3 psi / 20 kPa 能不能扛？分四笔算：
 *      **静压**：ε = σ/E = 20 kPa ÷ 3 GPa = **6.7e-6** ⇒ 500 nm 的膜压 **3.3 pm**。
 *        **压不塌。**（所以"压塌"这个问法本身要先拆开。）
 *      **实接触**：硬垫（玻璃布层压，E 8 GPa）在 3 psi 下实接触面积 1–3 %
 *        ⇒ 磨粒上的局部压强 **0.7–2 MPa**，仍远低于膜的屈服（H/3 ≈ 0.1 GPa）。
 *      **被磨**：抗犁削的是**硬度**，不是模量。聚合物网络的 H ≈ E/10 = **0.25–0.35 GPa**，
 *        而现在 6–9 GPa 的膜 H ≈ 0.8–1 GPa、SiO₂ 是 9 GPa
 *        ⇒ 比现在的膜低 **2.6–3.2 倍**、比 SiO₂ 低 **25–36 倍**；
 *        Preston 速率 K ∝ 1/H ⇒ 过抛段介质多磨 2.6–3.2 倍：
 *        现在按 5–10 nm 记 ⇒ **13–32 nm**。
 *      **压入深度**：300 nm 的胶体硅在 1 MPa 的局部压强下犁进 (P/H)·d
 *        = (1 MPa ÷ 0.3 GPa)×300 nm ≈ **1 nm** —— 与 3 nm 的 TiN 同量级
 *        ⇒ **磨料顶穿阻挡层的风险**（软膜 + 薄阻挡是同一个组合）。
 *    ⇒ **k 2.4–2.5 与 dishing 3–5 nm 不能同时成立**，而且方向很坏：
 *      介质下沉 13–32 nm 之后铜反而**凸出来**：量出来的 dishing 从 +7–12 nm 变成
 *      **−25 到 −1 nm**（铜高出介质 1–25 nm，账面"dishing 变小"是**假通过**），
 *      真正超标的是 **erosion 13–32 nm = 判据（线宽 5 % = 5 nm）的 2.6–6.4 倍**。
 *      写进 R8 ⑬，不当成"两格都过"。
 *
 * ③ **同一个条目还是新条目（问三）：同一个条目 —— 但要把 `modulus` 加进去。**
 *    **窗口是路线的，不是条目的**：`Item.props` 只声明类型区间（kValue 2–6），
 *    交付窗口在每条路线的 `gives` 里 ⇒ 第三条路线给 2.4–2.5 **不会**把前两条的
 *    2.6–2.9 / 2.8–3.1 挤掉（与 `mat/damascene-layer` 的三档 dishing 同一个写法）。
 *    **不新立 `mat/sico-h-2p5-wafer`** 的两个理由：
 *      ① 它是同一种材料的另一个规格，不是另一种材料 —— 真正换了功能的那一档
 *        （多孔、漏电差 100–10⁴ 倍）已经单列成 `mat/porous-sico-h-wafer`；
 *      ② 新条目会是一个**没有下游**的条目（多孔片已经是一个），而"软膜过不了 CMP"
 *        这句话恰恰应该落在**同一个条目**上 ⇒ 所以给 `mat/sico-h-wafer` 加了
 *        **`modulus`**（GPa），三条路线各给一个窗口：
 *            PECVD（MTMS+TEOS）**6–9** · 旋涂 MSQ **4–6** · 本条（MTMS+DMDMS）**2.5–3.5**
 *        这样"2.5 GPa 的膜"在数据里第一次有了名字。
 *    ⚠️ 但模型**表达不了**"CMP 必须拿 E ≥5 的那一条"：多条产出路线是 OR，
 *      `need` 只要有一条够就算满足（`validate` 的 `propCovers` 按路线逐个试）。
 *      所以 `modulus ≥5` 的门**没写进 need**，只写在 R8 ⑬ 与本条路线的注释里（缺口⑧）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、两者兼容性：甲基是疏水的，而等离子体、HCl、热预算三样都咬它
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Si–CH₃ 是 k 能到 2.6 的**唯一原因**，也是这一层最脆的一格：三个环节都在拆它。
 *
 * ① **刻蚀**（`rie.ts` 的 CF₄/Ar/O₂，不在本文件写）：O₂ 与离子轰击把甲基抽成 Si–OH。
 *    损伤深度 **20–50 nm**（低能等离子体 20–30、RIE 的 1.1–3.6 keV 到 50）：
 *      损伤层 k **3.2–3.6**（Si–OH 的 k 4–5 与空气隙混合）
 *      500 nm 的膜、50 nm 损伤的**有效 k**：k_eff = 500/(50/3.4 + 450/2.7) = **2.76**
 *      ⇒ 只涨 2 %。**所以 k 不是被刻蚀毁掉的 —— 被毁掉的是漏电与吸潮**：
 *      损伤层的漏电 ×10–100，且它亲水 ⇒ 后道显影/清洗的水直接进去。
 * ② **修复：DDS 蒸汽硅烷化**（`make/tin-3nm-ald` 的第①段）。这是本文件唯一"用副产物修主产物"的地方：
 *      (CH₃)₂SiCl₂ + 2 Si–OH → (Si–O)₂Si(CH₃)₂ + 2 HCl        （100–120 °C，气相）
 *    把单甲基换成双甲基，补回 **60–80 %** 的疏水端；k 回到 2.9–3.1。
 *    比 HMDS 差一档（HMDS 补三甲基、更彻底），而 **HMDS 做不了**：它要 NH₃，
 *    而 `mat/ammonia` 要哈伯法那一整套（氢不在本文件白名单）—— R8 ⑦。
 * ③ **ALD 的热预算**：350–380 °C × 11.5–29 min ⇒ 甲基掉 **8–15 %**，k +0.05–0.1。
 *    400 °C 是硬线（SiCOH 的甲基在 400–425 °C 开始分解）；TiCl₄ 的 HCl 副产在 400 °C 上
 *    还会把 Si–CH₃ 打成 Si–Cl ⇒ 一水解就是 Si–OH ⇒ k 回 3.0+。
 *    ⇒ **3 nm 的另一个好处**：60–150 周期对 167 周期 ⇒ 热预算少 36–64 %
 *    ⇒ 甲基损失从 15–25 % 掉到 8–15 %，k 只涨 0.05–0.1。**薄阻挡层对低 k 是加分项。**
 * ④ 所以顺序是：**沉积 → 刻蚀（rie.ts）→ 硅烷化 → 3 nm TiN → 起镀**，
 *    而模型里没有"刻完的片"这个条目（`rie.ts` 的 `mat/rie-trench-wafer` 是硅的沟，
 *    不是低 k 的沟）⇒ 本文件的 `make/tin-3nm-ald` 只能接在膜之后，**顺序写在注释里**（缺口②）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、本文件的结构：10 条目 / 12 路线 / **0 台机器** / **0 件 std**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   条目 10：
 *     料 7   mat/methyl-chloride · mat/dimethyl-ether · mat/methyl-trichlorosilane ·
 *            mat/dimethyl-dichlorosilane · mat/mtms · mat/teos · mat/dimethyl-dimethoxysilane
 *     片 3   mat/sico-h-wafer · mat/porous-sico-h-wafer · mat/lowk-barrier-wafer
 *
 *   路线 12（一条化学链 + 四条成膜 + 两条阻挡 + 一条醇解）：
 *     make/methyl-chloride          甲醇 + HCl → CH₃Cl（300–350 °C，石英内衬）
 *     make/methyl-trichlorosilane   硅粉 + CH₃Cl → 甲基氯硅烷（Rochow，300–350 °C，Cu）
 *     make/mts-redistribution       DDS + SiCl₄ → 2 MTS（把 15 % 的选择性拉回 45–60 %）
 *     make/mtms                     MTS + 3 CH₃OH → MTMS + 3 HCl
 *     make/teos                     SiCl₄ + 4 C₂H₅OH → TEOS + 4 HCl
 *     make/dmdms                    DDS + 2 CH₃OH → DMDMS + 2 HCl（掺 D 的那一件）
 *     make/sico-h-pecvd             MTMS + TEOS + O₂ → SiCOH（k 2.6–2.9，模量 6–9）
 *     make/sico-h-2p5               MTMS + DMDMS + O₂ → SiCOH（**k 2.4–2.5，模量 2.5–3.5**）
 *     make/sico-h-spinon            MTMS 溶胶旋涂 + 固化（k 2.8–3.1，降级 OR）
 *     make/sico-h-porous            MTMS + 酚醛造孔剂（k 2.2–2.5，**只作升级项**）
 *     make/tin-3nm-ald              硅烷化 + ALD TiN 3 nm（覆盖 88–95 %）
 *     make/tin-2nm-ald              硅烷化 + ALD TiN 2–2.5 nm（B 类，内角 55–70 %）
 *
 * **0 台机器是一个结论，不是省事**：白名单是既有的 106 台，本文件不新增一台
 * （所以"机器必须有 composedOf、且不许被路线产出"这条在本文件里**没有落点**）。
 * 执行设备全部是既有的：`plant/resistance-furnace`（100–1100 °C）·
 * `plant/mid-pressure-autoclave`（20–300 °C / 100–3000 kPa）· `plant/ore-beneficiary`（破碎）·
 * `plant/wet-bench`（20–120 °C / 100–500 kPa）· `plant/ald-reactor`（150–400 °C / 10–100 Pa）·
 * `plant/rf-13m56`（13.56 MHz / 500 W，只在 `needs`）· `plant/mfc` · `plant/evaporator` ·
 * `plant/ellipsometer` · `plant/probe-station` · `plant/film-monitor` · `plant/robot` ·
 * `plant/clean-room` · `plant/metrology-room`（19–21 °C）· `plant/water-polisher`。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、投料 / std / 设备 —— 本文件自己划的（违者 tsc 过、审查不过）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   投料  mat/methanol · mat/hcl · mat/water · mat/hf · mat/chlorine ·
 *         mat/silicon-wafer · mat/silicon-tetrachloride · mat/titanium · mat/oxygen ·
 *         mat/nitrogen · mat/argon · mat/aluminium · mat/ethanol · mat/phenolic-resin
 *         （**一处例外，点名写在这里**：`mat/polysilicon` 不在投料白名单里。
 *          它不是外部来料 —— `make/polysilicon` 是链内路线（西门子还原），
 *          按 `damascene.ts:227` 与 `pcb.ts:176` 的先例：白名单管"从外面拿进来的料"，
 *          不拦链内中间物。它与 `mat/superfill-bath`（`fine-damascene.ts`）同一个形状：
 *          越界一处、写明理由、给出路线。**没有它就没有 Rochow**，而
 *          `mat/silicon-wafer` 是片不是粉（问一①）。）
 *   链内中间物（本文件自产自用，不占投料）：mat/methyl-chloride · mat/dimethyl-ether ·
 *         mat/methyl-trichlorosilane · mat/dimethyl-dichlorosilane · mat/mtms · mat/teos ·
 *         mat/dimethyl-dimethoxysilane · mat/sico-h-wafer · mat/porous-sico-h-wafer ·
 *         mat/lowk-barrier-wafer
 *
 *   std/  **0 件**。本文件的量具都是设备（椭偏、探针台、石英晶振），没有一个标准件进场。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、R8 —— 每一处降级，与它的升级路线（在可降级/不可降级的界内）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * | # | 降级（现在） | 原规格 | 升级路线（写在哪） | 缺口量级 |
 * |---|---|---|---|---|
 * | ① | k 2.6–2.9（SiCOH，干态） | 2.5 | **已建：`make/sico-h-2p5`（lowk-barrier.ts:1169）**，`gives` kValue **2.4–2.5**（湿态 2.55–2.8）、modulus **2.5–3.5 GPa** —— **k 达标、E 不达标**（CMP 要 ≥5，见 ⑬）；或 `make/sico-h-porous`（lowk-barrier.ts:1377，k 2.2–2.5，代价见 ②） | 1.04–1.16 倍；两条升级各有一笔账 |
 * | ② | 多孔：k 2.2–2.5 但**漏电 1e-6–1e-4 A/cm²**（判据 1e-8）、湿态回到 3.2–3.9 | 干湿同值、漏电 1e-8 | **C6+ 可分解造孔剂**（α-松油烯/柠檬烯，本层 0 条）+ 超临界 CO₂ 干燥（0 台）—— 本层只有酚醛，而它在 N₂ 里 450 °C **只碳化不烧掉**（残碳 3–8 at%）⇒ 多孔的 2.2 里有一半是碳给的 | 漏电差 **100–10⁴ 倍**；湿态差 1.3–1.6 倍 |
 * | ③ | MTS 纯度 75–90 %：**釜式蒸馏只有 1–2 块理论板**（塔罩不住 40–80 °C 且 300–1000 kPa） | 99.5 %（要 95–130 块板、塔高 30–40 m） | 一座能 hold **100–120 °C / 250–300 kPa** 的塔（现有塔的窗口是 40–80 °C 且 300–1000 kPa，改塔的额定量不是加机器） | 按杂质算 **20–100 倍**；板数 62（最小）对 1–2 |
 * | ④ | 纯度连带：MTMS 里 DMDMS 8–18 wt% + TMOS 1–4 % ⇒ 已经掺进一份 D（模量从纯 T 的 8–10 掉到 **6–9**） | 8–10 GPa（纯 T 树脂） | 塔板（③）把 D 去掉，同时靠 TEOS 的四官能交联把网撑回去（这就是 `make/sico-h-pecvd` 的三元配方） | 模量差 1.2–1.5 倍；k 反而略低（碳多） |
 * | ⑤ | 3 nm 的沟底内角覆盖 **60–75 %** ⇒ 1.8–2.3 nm（卡在 2 nm） | 场厚 3 nm 处处 ≥2 nm | ① 剂量窗口：TiCl₄ 脉冲 0.2 s + 吹扫 5 s 的 AR 2 覆盖率 88→93 %；② 场厚提到 **3.3–3.5 nm**（仍是"等效 3 nm"）；③ 沟底圆角（版图/刻蚀） | 沟底差 **1.1–1.4 倍**；65 nm 以下不成立 |
 * | ⑥ | PECVD 气压 **10–100 Pa**（工业 130–1300）⇒ 速率 20–60 nm/min（工业 200–600）、均匀性 ±10–20 % | 200–600 nm/min、±3 % | HDP/ECR 源（微波 2.45 GHz + ECR 磁镜，本层 0 台；`plant/rf-13m56` 只有 500 W 单管） | 速率差 **3–30 倍**；均匀性差 3–7 倍 |
 * | ⑦ | 硅烷化只能到 **DDS（双甲基）**，且只能补回 60–80 % | HMDS（三甲基，补 95 %） | HMDS = 2 (CH₃)₃SiCl + 2 NH₃ → HMDS + 2 NH₄Cl：**要氨**，而 `mat/ammonia` 要哈伯法（氢不在白名单）⇒ 与 `rie.ts`/`ald.ts` 是同一个 H₂ 缺口 | 疏水端少 1/3；k 回 3.0 而不是 2.8 |
 * | ⑧ | k 只测**点**（φ1 mm，±4 %），没有片内 9 点图 | 49 点图（±1 %） | `plant/laser-stage`（20 nm 台）×`plant/probe-station` 的自动扫描（本层没有探针台的 X-Y 台联动协议） | 均匀性看不见；k 的**值**测得出，**分布**测不出 |
 * | ⑨ | 硅粉从 **6N 多晶硅**磨（50–100 kWh/kg） | 冶金级硅（12–14 kWh/kg，98 %） | `make/silicon-mg`（**已有路线**，电弧炉 1900–2200 °C）—— 但 B/P 是 10–50 ppm 对 ppb，会把 p 型掺杂带进膜（1e17 cm⁻³ 就漏电）⇒ 要先建一条硅的酸洗/区熔提纯 | 原料能耗差 **4–8 倍** |
 * | ⑩ | CH₃Cl 里残水 **200–500 ppm**（−30 °C 冷凝的天花板） | <100 ppm | **干冰冷阱**（`mat/dry-ice` **有路线**，−78.5 °C 够 −60 °C 的要求；但它是料不是设备，`holds` 写不进去、且不在本文件白名单）或分子筛 4A（`mat/zeolite-4a` **有**，但它的酸中心会催化 CH₃Cl 齐聚 —— 与甲醇制汽油同一个机理，不能用来干燥 CH₃Cl） | 差 2–5 倍；后果是 Si–O–Si 支化、MTS 里混 SiCl₄ |
 * | ⑪ | 反应段石英内衬、冷凝段**未浸渍石墨会渗** | 浸渍石墨（酚醛/PTFE 浸渍，闭孔） | 浸渍要真空-加压釜 + 酚醛（`plant/mid-pressure-autoclave` 罩得住 100–3000 kPa，酚醛有 `mat/phenolic-resin`）—— 本文件不写这条，因为它要先有石墨件的成型 | 渗漏量级不明（这是最诚实的一处缺口） |
 * | ⑫ | 铜催化剂**没有 Zn/Sn/P 助剂** ⇒ 直接法更偏 DDS（MTS 只 5–15 %） | 助剂 0.1–1 wt% 把 MTS 拉到 30–50 % | `make/mts-redistribution`（**本文件已写**）绕开选择性：DDS + SiCl₄ → 2 MTS | 选择性差 2–3 倍，已用再分配补到 45–60 % |
 * | ⑬ | **k 2.4–2.5 的账单全在模量上**（`make/sico-h-2p5`，lowk-barrier.ts:1169）：E 2.5–3.5 GPa（CMP 要 ≥5）⇒ 过抛段介质多磨 **13–32 nm**（判据 5 nm 的 2.6–6.4 倍） | dishing/erosion ≤5 nm 且 k ≤2.5（两格同过） | ① CMP 侧降压力（3 psi → 1–1.5 psi）+ 软垫 + 短过抛（要重算 dishing）；② 回到 2.6–2.9（E 6–9）；③ ALD 补一层 5 nm 的硬罩（0 条）。**本层做不到"两格同过"，只做到"两格选一格"** | erosion 差 **2.6–6.4 倍**；方向很坏：介质下沉后铜**凸出来**，dishing 量出来是 −8 到 +12 nm 的**假通过** |
 * | ⑭ | 15 % 自由体积吸潮：湿态 k **2.55–2.8**（干态 2.4–2.5） | 干湿差 ≤0.1 | 更厚的疏水端（HMDS 要 NH₃ —— 见 ⑦）或把自由体积做成闭孔（造孔剂，见 ②） | 湿态差 1.1–1.2 倍；比多孔那条好得多（它是 3.2–3.9） |
 * | ⑮ | 模量**测不出**（纳米压痕 0 台）⇒ 2.5–3.5 GPa 是按密度推的 | 直接读 E | **进口仪器，R9 未闭合（黄）**：`plant/nanoindenter`（`plant/nanoindenter/head` 进口头，0.1 µN–500 mN、0.1 nm–20 µm）+ `measure/nanoindent-lowk`（10 点、20–100 nm、Oliver–Pharr；E 5–20 GPa、H 0.5–3 GPa） | 能测，但**不可复制**：2 台头只是冗余，不是造第二台；压头/传感器/ADC 仍进口；压深 > 膜厚 10 % 只能剔点 |
 * | ⑯ | 2 nm TiN 内角 **55–70 %** ⇒ **1.1–1.4 nm**（55–75 % 上沿 1.5 nm），可能不连续；针孔/漏电无实测 | 2 nm 场厚（40/8 nm 后道最小格） | ① 周期加到 60–100（2–2.5 nm 上界）；② 场厚 2.5 nm；③ 内角圆角/更薄的低 k 栈 | 内角差 **1.1–1.5×**；2 nm 以下不成立 |
 * | ⑰ | **k≤2.5 且 E≥5 不能同时成立**（2p5：k 2.4–2.5、E 2.5–3.5；PECVD：E 6–9、k 2.6–2.9） | 40/8 nm 后道：CMP 要 E≥5、k≤2.5 | **B 类（基路线在、E 不够）+ A 类（没有 hard 路线）**：UV/EB 固化 0 台、HMDS 只疏水不提 E 且 `mat/hmds` 0 条、造孔剂 + scCO₂ 方向相反且 0 台、闭孔/5 nm ALD 硬罩不提 E | E 差 **1.4–2×**；不建 `make/sico-h-2p5-hard` |
 *
 * 2 nm TiN（并列 `make/tin-2nm-ald`，B 类）：
 *   · 2 nm 比 3 nm 少 1/3 循环：**40–100 周期**（3 nm 是 60–150），
 *     11.5 s/周期 ⇒ ALD 段 7.7–19.2 min（3 nm 是 11.5–28.8）。
 *   · 场厚 2–2.5 nm；沟底内角 55–70 % ⇒ **1.1–1.4 nm（2 nm 端）** 到
 *     **1.4–1.75 nm（2.5 nm 端）**；按 2 nm 端记 **1.1–1.5 nm**（55–75 % 上沿）。
 *     TiN 在 SiO₂ 上 1.5–2.5 nm 才闭合 ⇒ 2 nm 端在阈值下沿，**可能不连续**。
 *   · 针孔/漏电没有实测；没有原位电导法，e-beam 只看"有没有膜"。
 *   · **TiCl₄ 首脉冲咬 Ti 的风险仍在**：若下面有 Ti 2 nm，首脉冲可能消耗
 *     一部分 Ti；2 nm TiN 的周期更少，盖不住的风险比 3 nm 更大。
 *   · **不写"连续膜已验证"**；这是 B 类，不是闭合。
 *
 * 40/8 nm 后道的 E≥5 + k≤2.5（R8 ⑰，B/A 类，不硬加路线）：
 *   三条现有路线的窗口（不改数值）：
 *     make/sico-h-pecvd    k 2.6–2.9, E 6–9     ⇒ E 过、k 不过
 *     make/sico-h-2p5      k 2.4–2.5, E 2.5–3.5 ⇒ k 过、E 不过
 *     make/sico-h-spinon   k 2.8–3.1, E 4–6     ⇒ k 不过、E 只在 5 下沿
 *   四个候选：
 *     ① **UV/EB 固化：0 台。** `plant/e-beam-column` 是光刻/量测柱
 *        （1e-7–1e-3 Pa、field 100–1000 µm），不是大面积固化机；
 *        `plant/mask-aligner` 的碳弧紫外是曝光，不是可控固化。
 *     ② **HMDS：只疏水，不提 E。** 它把 Si–OH 封成 Si–(CH₃)₃，改善
 *        k_humid/漏电；本层 `mat/hmds` 0 条（三甲基氯硅烷也 0 条）。
 *        `mat/ammonia` 有，但 HMDS 不是"E≥5"的解。
 *     ③ **造孔剂 + 超临界 CO₂：方向相反。** 造孔降低 k 也降低 E；
 *        C6+ 可分解造孔剂 0 条；`plant/mid-pressure-autoclave` 上限 3 MPa
 *        < scCO₂ 7.38 MPa；`plant/autoclave` 能 hold 10–35 MPa/150–550 °C，
 *        但不是超临界干燥机、没有 CO₂ 循环/干燥路线。
 *     ④ **闭孔/ALD 硬罩：不提高 E。** 闭孔只改善吸潮/漏电；5 nm ALD
 *        硬罩对 400–600 nm 软膜的 E 贡献可忽略，厚硬罩又把 k 拉过 2.5
 *        （HfO₂ k≈20：5 nm 让 k_eff +0.02，50 nm +0.24）；本层没有低 k
 *        硬罩路线。
 *   ⇒ 要 E≥5 且 k≤2.5，至少要有 **UV/EB 固化机 + 可分解造孔剂 +
 *     超临界 CO₂ 干燥 + 低 k 硬罩** 中的一条新路线/新设备；本层 0 台/0 条。
 *     **不建 `make/sico-h-2p5-hard`。**
 *   · 漏电也没有窗口：`mat/sico-h-wafer` 没有 leakage prop，三条路线都没有
 *     漏电实测；即使 k/E 凑出一个组合，也给不出漏电窗口。
 *   ⚠️ 这是 B 类（`make/sico-h-2p5` 在、E 不够）+ A 类（没有 hard 路线），
 *     不是"再调一调参数"。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、已知缺口（"现在没有"，不是"暂未实现"）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① **k 的验证是点测**（R8 ⑧），且 C-V 要蒸点电极 —— 电极的 φ1 mm 掩模孔是手工做的
 *     （±10 µm ⇒ 面积 ±4 %），这是 k 误差的主项，比电容本身（0.3–0.6 %）大 7 倍。
 *  ② **"刻完的片"没有条目**：`rie.ts` 的低 k 刻蚀、本文件的硅烷化与阻挡层，
 *     只能按"膜 → 硅烷化+阻挡"接起来，顺序写在 `make/tin-3nm-ald` 的注释里。
 *  ③ **−30 °C 的冷凝没有设备**（`plant/sublimator` 是 0–277 °C；干冰与液氮是料，
 *     `holds` 只对机器成立），所以 CH₃Cl 那一段不写冷凝工序的 `under`；
 *     −60 °C 的深冷（R8 ⑩）同理 —— 干冰 −78.5 °C 做得到，但只能记成"料 + 手艺"。
 *  ④ **没有原位电导法判 TiN 连续**：`plant/probe-station` 能测方阻（333–667 Ω/□），
 *     但 3 nm 的膜一进探针台就被针压穿（针尖载荷 10–50 mN ⇒ 压强 >1 GPa），
 *     所以"连续"只能靠**周期数 + 陪片的 e-beam 剖面**，判据是"有没有膜"而不是"多厚"。
 *  ⑤ **DMDMS 的含量测不出**：红外 Si–CH₃ 的 1270 cm⁻¹ 只能定性（没有 FTIR，本层 0 台），
 *     气相色谱要载气与柱（0 台）⇒ 8–18 % 是**按投料比推的**，不是量的。
 *  ⑥ **酚醛残碳测不出**（没有 CHN 分析、没有 XPS）⇒ 3–8 at% 是文献量级。
 *  ⑦ **本文件不改任何别的文件**：`fine-damascene.ts:170` 的方阻（问五⑤）、
 *     `cmp-integration.ts` 缺口⑩（"k 测不出" —— 本文件问四④ 已推翻，`probe-station.ts:287`
 *     给的是能测）都只在这里**点名**，改它们由主 agent 决定。
 *  ⑧ **模型的 OR 表达不了"CMP 必须拿 E ≥5 的那一条"**：三条产出路线并列，`need` 只要
 *     有一条够就算满足（`propCovers` 逐路线试）。所以 `modulus ≥5` 这个门写不进数据，
 *     只能写在 R8 ⑬ 与 `make/sico-h-2p5` 的注释里 —— 这是本文件最要紧的一处表达力缺口：
 *     **它让"k ≤2.5 通过"与"dishing ≤5 通过"在没有人的情况下可以同时显示为通过。**
 *  ⑨ **模量能直接读，但不可复制**（R8 ⑮）：`plant/nanoindenter` 进口仪器 +
 *     `measure/nanoindent-lowk`，E 5–20 GPa、H 0.5–3 GPa；R9 未闭合，
 *     所以这一格记黄。压头/传感器/ADC 仍进口；压深 > 膜厚 10 % 的点要剔除。
 *  ⑩ **`mat/dimethyl-dimethoxysilane` 与 `mat/dimethyl-dichlorosilane` 只差一步醇解**：
 *     前者是后者加两分子甲醇（`make/dmdms`）。两个条目并存是因为"进膜的是甲氧基还是氯"
 *     决定膜的漏电与腐蚀，不是命名偏好；但读者容易混，所以两条的注释里互相点名。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目（10 件：7 料 + 3 片）
// ═══════════════════════════════════════════════════════════════════════════

export const LOWK_ITEMS: readonly Item[] = [
  /**
   * 氯甲烷（CH₃Cl，一氯甲烷）。bp **−24 °C**，常温加压就是液体。
   *
   * 它是这一整条链的入口：**硅—碳键唯一的廉价来源**。甲烷不行（自由基只会给 Si–C），
   * 而 CH₃Cl 的 C–Cl 键（339 kJ/mol）比 C–H（439）弱得多，在铜表面 300 °C 就断，
   * 断下来的 CH₃ 带着三个氢原样接上硅 —— 这才是 Si–CH₃ 与 Si–C 的分别。
   *
   * 三个规格就是 Rochow 的三个门槛：
   *   purity        96–99 %（杂质主要是二甲醚与未反应的甲醇）
   *   waterContent  0.02–0.05 %（200–500 ppm）—— 水会把 Si–Cl 水解成 Si–O–Si，
   *                 那一步之后精馏就分不掉了
   *   dmeContent    1.5–3 %（二甲醚是惰性的，但它占摩尔数、稀释 CH₃Cl/C 比）
   */
  {
    id: 'mat/methyl-chloride',
    name: '氯甲烷',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 96, max: 99, unit: '%', dir: 'atLeast' },
      { param: 'waterContent', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
      { param: 'dmeContent', kind: 'range', min: 0, max: 10, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 二甲醚（(CH₃)₂O）。bp −23.6 °C，和 CH₃Cl 几乎一样 —— 所以它不是"分掉"的，是"带走"的。
   *
   * 它是甲醇脱水那一步的副产（2.4 wt%），本层唯一的出路是**回炉裂化**：
   *      (CH₃)₂O + HCl → 2 CH₃Cl + H₂O       （300 °C，同一台炉）
   * 但模型没有循环（一条路线不能吃自己产出的东西再产回上游），
   * 所以它在这里是**联产条目**，不是回流。R8 里记这一笔。
   */
  {
    id: 'mat/dimethyl-ether',
    name: '二甲醚',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' }],
  },

  /**
   * 甲基三氯硅烷（CH₃SiCl₃，MTS）。bp **66.1 °C**，无色发烟液体，遇水剧烈水解。
   *
   * 它是 Rochow 直接法里"一个甲基"的那一档（DDS 是两个甲基、TMS 是三个）。
   * 三个氯是它下半段的价值：三个氯都能被甲氧基换掉，换完就是 MTMS。
   *
   * purity 75–90 %：本层只有釜式蒸馏（1–2 块理论板），而 MTS/DDS 的分馏要 62 块板（问三）。
   * 剩下的 8–18 % 是 DDS、1–4 % 是 SiCl₄ —— 它们会跟着变成 DMDMS 与 TMOS（R8 ④）。
   */
  {
    id: 'mat/methyl-trichlorosilane',
    name: '甲基三氯硅烷',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' }],
  },

  /**
   * 二甲基二氯硅烷（(CH₃)₂SiCl₂，DDS）。bp **70.0 °C**。
   *
   * 直接法的**主产物**（75–85 mol% of Si）—— 工业上它是硅橡胶与硅油的原料，
   * 而在本文件里它是**两个用途**：① 再分配的原料（+ SiCl₄ → 2 MTS）；
   * ② 硅烷化剂（把 Si–OH 封成 Si–(CH₃)₂，见 `make/tin-3nm-ald` 第①段）。
   * 第二件事很重要：它让"副产物"变成了"修复剂"。
   */
  {
    id: 'mat/dimethyl-dichlorosilane',
    name: '二甲基二氯硅烷',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' }],
  },

  /**
   * 甲基三甲氧基硅烷（MTMS，CH₃Si(OCH₃)₃）。bp **102–103 °C**，C4。
   *
   * **它是本文件的枢纽**：一个硅上带一个甲基（疏水 + 低极化率 ⇒ 低 k）、
   * 三个甲氧基（水解后成 Si–O–Si 网络 ⇒ 成膜）。这就是 SiCOH 的分子。
   *
   * 三个甲氧基换成三个氯就是 MTS；换成三个乙氧基就是 MTES（本文件不写，乙醇路线同 TEOS）。
   *
   * purity 75–90 %：DMDMS 8–18 % + TMOS 1–4 %。DMDMS 是双官能的**链端基**，
   * 它把 T 树脂的网截断 ⇒ 模量掉到 2–4 GPa（R8 ④），这是纯度—力学的耦合。
   */
  {
    id: 'mat/mtms',
    name: '甲基三甲氧基硅烷',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 75, max: 90, unit: '%', dir: 'atLeast' },
      { param: 'waterContent', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 正硅酸乙酯（TEOS，Si(OC₂H₅)₄）。bp 168 °C，C8。
   *
   * 它**不是**低 k 材料（它给 SiO₂，k 4.0），它在本文件里是**交联剂**：
   * 纯 MTMS 的膜是 T 树脂（三官能），网太软（2–3 GPa）；掺 10–20 % 的四官能 TEOS
   * 把网撑到 6–9 GPa，CMP 才压得住。这是工业 BD（Black Diamond）膜的配方逻辑。
   *
   * 它还有第二个身份：**"无氟硅源"** —— `cmp-integration.ts` R8 ⑥ 缺的那一件
   * （SiH₄ 0 条目、TEOS 0 条目、SiCl₄ 有但不在那份白名单）。本文件用
   * SiCl₄ + 乙醇 把 TEOS 造出来，那条路线的化学与 MTMS 是同一套（醇解 + 赶 HCl）。
   */
  {
    id: 'mat/teos',
    name: '正硅酸乙酯',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 92, max: 98, unit: '%', dir: 'atLeast' },
      { param: 'waterContent', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 二甲基二甲氧基硅烷（DMDMS，(CH₃)₂Si(OCH₃)₂）。bp **106–107 °C**，C4。
   *
   * **它是"把 k 压到 2.5 以下"的那一件**，而且只有它这一条路：
   * 一个硅上带**两个**甲基 ⇒ 膜里成了双官能的 D 单元（(CH₃)₂SiO），
   * 它不桥接、只封端 ⇒ 网被截断、自由体积上来 ⇒ k 下来（问六①）。
   * 代价全在模量上（问六②）：D 越多越软，而 CMP 要 ≥5 GPa。
   *
   * ⚠️ 不要与 `mat/dimethyl-dichlorosilane`（二**氯**，DDS）混：
   *    DDS 直接进 O₂ 等离子体会放 2 mol 的 HCl、把 1–3 at% 的氯带进膜；
   *    DMDMS 是它醇解一步的产物（`make/dmdms`，与 `make/mtms` 同一套化学）。
   *    名字里那一字之差就是"进膜的是甲氧基还是氯"。
   *
   * 它还有第三个身份：MTMS 里的**天然杂质**就是它（8–18 wt%，`make/mtms` 的 DDS
   * 跟着 MTS 一起醇解）—— 所以现在的 2.6–2.9 里已经有一份 D，只是不够。
   */
  {
    id: 'mat/dimethyl-dimethoxysilane',
    name: '二甲基二甲氧基硅烷',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'waterContent', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 长了 SiCOH 膜的片（φ100，膜厚 300–600 nm）。
   *
   * 六个规格就是这一层的全部质量语言：
   *   kValue          干态介电常数（N₂ 中 200 °C 烘 30 min 后立即测）
   *   kValueHumid     空气里放 24 h 之后 —— **这一项和上一项一起看才是低 k 膜的真相**
   *   methylRetention Si–CH₃ 保留率（FTIR 1270 cm⁻¹ 的归一化强度；本层只能按工艺窗口推）
   *   porosity        自由体积/孔隙率（多孔那条 25–35 %，致密那条 3–12 %，**混配那条 12–18 %**）
   *   thickness       膜厚（椭偏，1–1000 nm 档，±0.019 nm）
   *   modulus         弹性模量（GPa）—— **它是"k 与 CMP 能不能同时成立"的那一项**：
   *                   CMP 要 ≥5，而 k 越低模量越低（问六②）。没有它，
   *                   "2.5 GPa 的膜过不了 CMP"这句话在数据里没有落点。
   *
   * ⚠️ k 是**两个数**，不是一个。2.6 的膜吸 1 vol% 水就变 2.7，吸 10 vol% 变 3.0
   * （k_water = 80，Maxwell–Garnett）。把"2.6"单独写出来会骗人，所以这一条有两个 k。
   *
   * ⚠️ **窗口是路线的、不是条目的**：kValue 的类型区间是 2–6，三条路线各交一条窗口
   * （2.6–2.9 / 2.8–3.1 / 2.4–2.5），互不挤占。`modulus` 同理（6–9 / 4–6 / 2.5–3.5）。
   */
  {
    id: 'mat/sico-h-wafer',
    name: '长了 SiCOH 膜的片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'kValue', kind: 'range', min: 2, max: 6, unit: 'εr', dir: 'atMost' },
      { param: 'kValueHumid', kind: 'range', min: 2, max: 6, unit: 'εr', dir: 'atMost' },
      { param: 'methylRetention', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'porosity', kind: 'range', min: 0, max: 60, unit: '%' },
      { param: 'thickness', kind: 'range', min: 100, max: 2000, unit: 'nm' },
      { param: 'modulus', kind: 'range', min: 0, max: 50, unit: 'GPa', dir: 'atLeast' },
    ],
  },

  /**
   * 多孔 SiCOH 片（孔隙率 25–35 %）。**只作升级项，没有下游。**
   *
   * 它与 `mat/sico-h-wafer` 分开列，不是多一个 id，是因为**它的两个 k 差得太远**：
   * 干态 2.2–2.5（判据 2.5 在它的窗口里），湿态 3.2–3.9（比致密膜还差）。
   * 把这两个数塞进同一个 id 会让"k ≤2.5 通过了"变成一句假话 ——
   * 而它通过的方式是**孔里没有水**，不是"介质变好了"。
   *
   * 没有下游的理由：漏电 1e-6–1e-4 A/cm²（判据 1e-8）—— 接阻挡层、接铜都救不回来。
   */
  {
    id: 'mat/porous-sico-h-wafer',
    name: '多孔 SiCOH 片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'kValue', kind: 'range', min: 2, max: 6, unit: 'εr', dir: 'atMost' },
      { param: 'kValueHumid', kind: 'range', min: 2, max: 6, unit: 'εr', dir: 'atMost' },
      { param: 'methylRetention', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'porosity', kind: 'range', min: 0, max: 60, unit: '%' },
      { param: 'thickness', kind: 'range', min: 100, max: 2000, unit: 'nm' },
    ],
  },

  /**
   * 低 k 上镀了 3 nm 或 2–2.5 nm TiN 的片。**细线六格里那一格（barrierThickness ≤3）的交付物。**
   *
   * 两条并列路线：
   *   make/tin-3nm-ald   3 nm，60–150 周期，内角 1.8–2.3 nm
   *   make/tin-2nm-ald   2–2.5 nm，40–100 周期，内角 **1.1–1.5 nm**（2 nm 端 55–70 % 是
   *                      1.1–1.4 nm；算到 55–75 % 的统计上沿才到 1.5 nm）—— B 类，可能不连续
   *
   * 为什么不是 `mat/ald-barrier-wafer`（`ald.ts:877` 已有、5 nm）：那一条的五个属性
   * （thickness / stepCoverage / uniformity / cycleTime / temperature）里**没有 kValue**，
   * 而这一层的要害恰恰是"3 nm 的 ALD 热预算把 k 抬了多少"。两个 id 的区别不是厚度，
   * 是**"这一片是低 k 栈还是硅片"** —— 前者要 k，后者不要。
   *
   *   barrierThickness  3 nm（3 nm 路线）/ 2–2.5 nm（2 nm 路线）
   *   stepCoverage      88–95 %（3 nm）/ 85–92 %（2 nm 侧壁/场）；沟底内角 60–75 % / 55–70 %
   *   kValue            2.65–2.95（3 nm）/ 2.70–2.95（2 nm，周期少 1/3、热预算更低）
   *   methylRetention   50–70 %（3 nm）/ 55–75 %（2 nm）
   *
   * ⚠️ 2 nm 端内角 **1.1–1.5 nm**（55–70 % 是 1.1–1.4 nm；1.5 nm 是 55–75 % 的统计上沿），
   * 低于 TiN 在 SiO₂ 上的 1.5–2.5 nm 闭合阈值，**可能不连续**；针孔/漏电无实测；
   * 不是"连续膜已验证"。
   */
  {
    id: 'mat/lowk-barrier-wafer',
    name: '低 k 介质镀 TiN 片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'barrierThickness', kind: 'range', min: 0, max: 20, unit: 'nm', dir: 'atMost' },
      { param: 'stepCoverage', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'kValue', kind: 'range', min: 2, max: 6, unit: 'εr', dir: 'atMost' },
      { param: 'methylRetention', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      // 纳米压痕直接读数（nanoindent.ts 的 measure/nanoindent-lowk 写入）
      { param: 'youngsModulus', kind: 'range', min: 1, max: 50, unit: 'GPa' },
      { param: 'hardness', kind: 'range', min: 0.1, max: 10, unit: 'GPa' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线（12 条）
// ═══════════════════════════════════════════════════════════════════════════

export const LOWK_ROUTES: readonly Route[] = [
  {
    /**
     * **氯甲烷：甲醇 + HCl 的气相脱水（300–350 °C，Al₂O₃ 催化）。**
     *
     *   甲醇 668 + HCl 722 → CH₃Cl 1000 + 水 366 + 二甲醚 24
     *   进 1390 = 出 1390 ✓
     *
     * ── 数怎么来的 ─────────────────────────────────────────────────────────
     *
     *   CH₃OH + HCl → CH₃Cl + H₂O（32.04 + 36.46 = 50.49 + 18.02）
     *   1000 kg CH₃Cl = 19.81 kmol ⇒ 甲醇 634.6 + HCl 722.2
     *   甲醇按 5 mol% 走 2 CH₃OH → (CH₃)₂O + H₂O ⇒ 进料 634.6/0.95 = **668**
     *   副产 DME 0.521 kmol × 46.07 = **24**，副产水 357.0 + 9.4 = **366**
     *
     * ── 单程转化与总收率 ───────────────────────────────────────────────────
     *
     *   单程转化 **85–95 %**、选择性 **92–97 %**；未反应的甲醇与 HCl 回流
     *   （HCl 在 −30 °C 上不凝，天然就回去了）⇒ 总收率 96–98 %。
     *
     * ── 设备：石英内衬 + 45 钢壳 ───────────────────────────────────────────
     *
     *   干 HCl 300 °C 对碳钢 0.1–0.5 mm/年、湿 HCl 60 °C 1–10 mm/年（量级估算）；
     *   石英 <0.01、浸渍石墨 <0.1 ⇒ 反应段用 `mat/quartz-pure` 管、冷凝段用石墨（缺口⑪）。
     *   Al₂O₃ 是**固定床**（不消耗、不进 uses）：`mat/alumina` 有路线但不在本文件白名单，
     *   按 `hot-phosphoric-bath.ts:197` 的先例**只记条件、不进投料**。
     *
     * ⚠️ 冷凝 −30 °C 没有设备 hold 得住（缺口③）⇒ 这一步不写 `under`。
     */
    id: 'make/methyl-chloride',
    name: '氯甲烷制备',
    produces: [
      {
        item: 'mat/methyl-chloride',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 96, max: 99 },
          { param: 'waterContent', kind: 'range', min: 0.02, max: 0.05 },
          { param: 'dmeContent', kind: 'range', min: 1.5, max: 3 },
        ],
      },
      // 水 366 kg：主反应 357 + 副反应 9.4。含 0.3–1 % 甲醇与 HCl ⇒ 导电率 500–1000 µS/cm，
      // 只能当冲洗水（`mat/water` 的 conductivity 窗是 0.05–1000）。
      { item: 'mat/water', qty: q(366), gives: [{ param: 'conductivity', kind: 'range', min: 500, max: 1000 }] },
      { item: 'mat/dimethyl-ether', qty: q(24), gives: [{ param: 'purity', kind: 'range', min: 95, max: 99 }] },
    ],
    uses: [
      // 668 kg：净耗 634.6 + 5 mol% 走二甲醚
      { anyOf: [{ item: 'mat/methanol', qty: q(668) }] },
      // 722 kg：化学计量 722.2（HCl 的净含量口径，与 `make/trichlorosilane` 的 782 kg 一致）
      { anyOf: [{ item: 'mat/hcl', qty: q(722) }] },
    ],
    needs: [],
    performedBy: 'plant/resistance-furnace',
    under: [{ param: 'temperature', min: 300, max: 350 }],
    rate: { hours: q(8) },
  },

  {
    /**
     * **甲基氯硅烷：Rochow 直接法（硅粉 + CH₃Cl，Cu 催化，300–350 °C）。**
     *
     *   多晶硅 1253 + CH₃Cl 5067 + HCl 12 + HF 1 + 水 40
     *   → MTS 1000 + DDS 4605 + SiCl₄ 379        （进 6373、出 5984）
     *
     * ── 分布是怎么配平的 ───────────────────────────────────────────────────
     *
     *   按 100 kmol Si 记账（mol% of Si）：DDS 80、MTS 15、SiCl₄ 5，乙烯……不，**乙烷 25**。
     *
     *      Cl 衡：b = 2d + 3m + 4t = 160 + 45 + 20 = 225 kmol CH₃Cl
     *      C/H 衡：b = 2d + m + 2c ⇒ c = m + 2t = 15 + 10 = 25 kmol C₂H₆
     *      Si 衡：a = d + m + t = 100 kmol
     *
     *   ⇒ 每 1000 kg MTS 的规模：Si 1253、CH₃Cl 5067、DDS 4605、SiCl₄ 379、乙烷 336。
     *   ⚠️ **乙烷是按原子守恒配平出来的那一项**（本层没有 `mat/ethane` 条目）⇒
     *   336 kg 记在 `unbalanced_zh` 里。它可以裂化成乙烯 —— 而乙烯是 PEG 的入口
     *   （`plating-additives.ts` 的主缺口），所以这 336 kg 不是废物，是一条还没写的链。
     *
     * ── 四道工序 ───────────────────────────────────────────────────────────
     *
     *   ① 破碎：颚破 5–20 mm → 球磨 2–4 h → 筛 75–300 µm（50–200 目），收率 92–96 %
     *      （选矿厂那套；磨床是磨削不是破碎，不能用 —— 问一②）
     *   ② 酸洗：10 % HCl + 1 % HF，把钢衬板带进来的铁从 0.05–0.3 % 洗到 50–200 ppm
     *   ③ 流化床：Cu 5–8 wt%（Cu₃Si 相）、300–350 °C、常压偏正；Si + 3CH₃Cl → MTS + C₂H₆，
     *      Si + 2CH₃Cl → DDS（无副产，唯一 100 % 原子经济的通道）
     *   ④ 冷凝 + 釜式蒸馏：−20 °C 凝下全部氯硅烷，然后 100–120 °C / 250–300 kPa 的
     *      釜式蒸馏（`plant/mid-pressure-autoclave`）切出 MTS 馏分 ⇒ 纯度只有 75–90 %
     *      （塔 hold 不住这一对，问三③；1–2 块板对 62 块板）
     *
     * ⚠️ 铜催化剂不进 `uses`（不消耗、只补加），与 `make/trichlorosilane` 的写法一致；
     *    没有 Zn/Sn/P 助剂 ⇒ MTS 只剩 5–15 %（R8 ⑫，用再分配绕开）。
     */
    id: 'make/methyl-trichlorosilane',
    name: '甲基氯硅烷制备',
    produces: [
      {
        item: 'mat/methyl-trichlorosilane',
        qty: q(1000),
        gives: [{ param: 'purity', kind: 'range', min: 75, max: 90 }],
      },
      {
        item: 'mat/dimethyl-dichlorosilane',
        qty: q(4605),
        gives: [{ param: 'purity', kind: 'range', min: 85, max: 92 }],
      },
      {
        item: 'mat/silicon-tetrachloride',
        qty: q(379),
        gives: [{ param: 'purity', kind: 'range', min: 92, max: 97 }],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/polysilicon',
            qty: q(1253),
            // 投料白名单外的一处例外（见文件头四）：6N 的棒料，磨成粉要过筛 75–300 µm。
            // ⚠️ `mat/polysilicon` 没有 props（不声明纯度）⇒ 这里写不了 need，
            //    6N 这个数只活在条目注释里（`polysilicon.ts:72`）。
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/methyl-chloride',
            qty: q(5067),
            // 水 200–500 ppm 是 −30 °C 冷凝的天花板；Rochow 要 <100 ppm ⇒ 差 2–5 倍，
            // 放宽后功能还在（Si–O–Si 支化会让 DDS 变多，MTS 更少）。
            need: [
              { param: 'purity', kind: 'range', min: 95, dir: 'atLeast' },
              { param: 'waterContent', kind: 'range', max: 0.05, dir: 'atMost' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      // 酸洗：12 kg 的 31 % 盐酸（净 HCl 3.7 kg）与 1 kg 的 50 % 氢氟酸，40 kg 水。
      // 水是**净耗**：逆流洗涤的循环量 2–5 L/kg 不计（1253 kg 粉要 3–6 t 循环水）
      { anyOf: [{ item: 'mat/hcl', qty: q(12) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(40) }] },
    ],
    needs: [],
    rate: { hours: q(24) },
    unbalanced_zh:
      '进 6373 kg、出 5984 kg：差 389 kg = 乙烷 336 kg（C/H 衡要求 c = m + 2t，本层没有 mat/ethane 条目；它可裂化成乙烯，是 PEG 的入口）+ 酸洗废液与 <45 µm 的细粉 53 kg',
    steps: [
      {
        note_zh:
          '① 破碎：颚破到 5–20 mm，球磨 2–4 h，筛分 75–300 µm（50–200 目），收率 92–96 %；细粉（<45 µm）15–25 % 回炉。钢衬板带进铁 0.05–0.3 %（对 Rochow 无害，Fe 是中性的，Cu 才是催化剂）；真正怕的 B/P 是 ppb 级（6N 的料）',
        performedBy: 'plant/ore-beneficiary',
        under: [{ param: 'pressure', min: 100, max: 300 }],
      },
      {
        note_zh:
          '② 酸洗：10 % HCl + 1 % HF、20–40 °C、30 min，铁降到 50–200 ppm，然后纯水洗到导电率 <10 µS/cm。洗不干净的后果不是选择性，是 MTS 里带 FeCl₃（bp 315 °C，精馏时留在釜里）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '③ 流化床直接法：Cu 5–8 wt% 与硅磨成 Cu₃Si、300–350 °C、CH₃Cl 过量（Cl/Si 比 2.2–2.5，按上面的 225/100 记账）；分布 DDS 80 / MTS 15 / SiCl₄ 5（mol% of Si）。没有 Zn/Sn/P 助剂 ⇒ MTS 只能到 5–15 %（R8 ⑫）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 300, max: 350 }],
      },
      {
        note_zh:
          '④ 冷凝与釜式蒸馏：−20 °C 凝下全部氯硅烷（MTS 66、DDS 70、SiCl₄ 58 的 bp 都在 0 °C 以上），然后 100–120 °C / 250–300 kPa 的釜式蒸馏切 MTS 馏分。**只有 1–2 块理论板**：MTS/DDS 的 α = 1.13，要 62–130 块板才分得开（问三）⇒ 纯度 75–90 %，DDS 8–18 % 跟着走',
        performedBy: 'plant/mid-pressure-autoclave',
        under: [
          { param: 'temperature', min: 100, max: 120 },
          { param: 'pressure', min: 250, max: 300 },
        ],
      },
    ],
  },

  {
    /**
     * **再分配：DDS + SiCl₄ → 2 MTS（AlCl₃，250–300 °C）。把 15 % 的选择性拉回 45–60 %。**
     *
     *   DDS 1000 + SiCl₄ 1317 → MTS 2317
     *   129.06 + 169.90 = 298.96 = 2 × 149.48 ✓（进 2317 = 出 2317）
     *
     * 这一条是本文件对"选择性"这个问题的正面回答：**不改催化剂，改平衡。**
     * 直接法只会给 5–15 % 的 MTS（工业也就这样），而 DDS 是 80 % ——
     * 把 DDS 加 SiCl₄ 再分配，MTS 那一份就回来了：
     *
     *      (CH₃)₂SiCl₂ + SiCl₄ ⇌ 2 CH₃SiCl₃           K ≈ 1（250–300 °C）
     *
     * K ≈ 1 意味着单程只能到 50–65 %，靠回流把收率拉到 90 %+（模型没有循环，
     * 所以这里按"净反应"记账，回流量写在注释里）。
     *
     * ⚠️ AlCl₃ 是催化剂（就地由铝屑 + 氯气生成，微克级、不消耗）：不进 uses，
     *    与 Rochow 的铜同一个处理。1317 kg 的 SiCl₄ 里 **379 kg** 是 Rochow 那一批的联产，
     *    其余 **938 kg** 来自 `mat/silicon-tetrachloride` 的既有路线（`hafnium.ts:377`）—— 那一条的纯度
     *    90–99 % 正好够（本路线要 ≥90）。
     */
    id: 'make/mts-redistribution',
    name: '再分配制备',
    produces: [
      {
        item: 'mat/methyl-trichlorosilane',
        qty: q(2317),
        gives: [{ param: 'purity', kind: 'range', min: 78, max: 90 }],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/dimethyl-dichlorosilane',
            qty: q(1000),
            need: [{ param: 'purity', kind: 'range', min: 85, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/silicon-tetrachloride',
            qty: q(1317),
            need: [{ param: 'purity', kind: 'range', min: 90, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: [],
    performedBy: 'plant/resistance-furnace',
    under: [{ param: 'temperature', min: 250, max: 300 }],
    rate: { hours: q(12) },
  },

  {
    /**
     * **MTMS：MTS + 3 CH₃OH → MTMS + 3 HCl（40–70 °C，边反应边赶 HCl）。**
     *
     *   MTS 1097 + 甲醇 706 → MTMS 1000 + HCl 803
     *   149.48 + 3×32.04 = 245.60；136.22 + 3×36.46 = 245.60 ✓（进 1803 = 出 1803）
     *
     * ① 反应是**醇解**，不是水解：Si–Cl + CH₃OH → Si–OCH₃ + HCl。
     *    三个氯分三步走，每一步都放 HCl —— 而 HCl 是产物，**必须连续吹出**，
     *    否则平衡退回去（MTMS + HCl → MTS + CH₃OH）。
     * ② 甲醇必须**无水**（<0.1 %）：MTMS 遇水就水解成 Si–O–Si，那一份就再也变不回
     *    可蒸的单体（低聚物的 bp 200 °C+）。这是"水含量 0.02–0.1 %"这个规格的来处。
     * ③ 收率 90–95 %（HCl 吹出 + 甲醇过量 5–10 %），未反应的甲醇回流。
     * ④ HCl 803 kg 回到 `make/methyl-chloride`（氯在链内循环，只补损耗）——
     *    按 HCl 的净含量记，溶液里的水不计（与 `make/trichlorosilane` 的 782 kg 同一口径）。
     */
    id: 'make/mtms',
    name: '甲基三甲氧基硅烷制备',
    produces: [
      {
        item: 'mat/mtms',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 75, max: 90 },
          { param: 'waterContent', kind: 'range', min: 0.02, max: 0.1 },
        ],
      },
      // 盐酸 803 kg：31–33 % 的水溶液（净 HCl 计；商品浓盐酸就是这一档），回到 CH₃Cl 那一段
      { item: 'mat/hcl', qty: q(803), gives: [{ param: 'concentration', kind: 'range', min: 31, max: 33 }] },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/methyl-trichlorosilane',
            qty: q(1097),
            need: [{ param: 'purity', kind: 'range', min: 75, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/methanol', qty: q(706) }] },
    ],
    needs: [],
    performedBy: 'plant/wet-bench',
    under: [
      { param: 'temperature', min: 40, max: 70 },
      { param: 'pressure', min: 100, max: 300 },
    ],
    rate: { hours: q(10) },
  },

  {
    /**
     * **TEOS：SiCl₄ + 4 C₂H₅OH → TEOS + 4 HCl（60–80 °C）。**
     *
     *   SiCl₄ 816 + 乙醇 884 → TEOS 1000 + HCl 700
     *   169.90 + 4×46.07 = 354.18；208.33 + 4×36.46 = 354.17 ✓（进 1700 = 出 1700）
     *
     * 它与 `make/mtms` 是同一套化学（醇解 + 赶 HCl），所以只写一遍注释里的机理、
     * 这里只说它**为什么要存在**：TEOS 是四官能的交联剂，把纯 T 树脂的网撑起来
     * （模量 2–4 → 6–9 GPa）；它同时是 `cmp-integration.ts` R8 ⑥ 缺的**无氟硅源**
     * （SiH₄ 0 条、TEOS 0 条 —— 本路线把 TEOS 这一条补上了）。
     *
     * 收率 85–92 %（SiCl₄ 的两个氯比 MTS 的三个氯难换，要过量乙醇与更长的停留）。
     */
    id: 'make/teos',
    name: '正硅酸乙酯制备',
    produces: [
      {
        item: 'mat/teos',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 92, max: 98 },
          { param: 'waterContent', kind: 'range', min: 0.02, max: 0.1 },
        ],
      },
      { item: 'mat/hcl', qty: q(700), gives: [{ param: 'concentration', kind: 'range', min: 31, max: 33 }] },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/silicon-tetrachloride',
            qty: q(816),
            need: [{ param: 'purity', kind: 'range', min: 90, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/ethanol', qty: q(884) }] },
    ],
    needs: [],
    performedBy: 'plant/wet-bench',
    under: [
      { param: 'temperature', min: 60, max: 80 },
      { param: 'pressure', min: 100, max: 300 },
    ],
    rate: { hours: q(10) },
  },

  {
    /**
     * **DMDMS：(CH₃)₂SiCl₂ + 2 CH₃OH → (CH₃)₂Si(OCH₃)₂ + 2 HCl（40–70 °C）。**
     *
     *   DDS 1074 + 甲醇 533 → DMDMS 1000 + HCl 607
     *   129.06 + 2×32.04 = 193.14；120.22 + 2×36.46 = 193.14 ✓（进 1607 = 出 1607）
     *
     * ── 为什么必须先走这一步，而不能把 DDS 直接送进等离子体 ────────────────
     *
     *   DDS 的两个 Si–Cl 在 O₂ 等离子体里会变成 2 mol 的 HCl：一端蚀膜（HCl 是
     *   刻蚀剂），一端把氯留在膜里（1–3 at%，ρ 与漏电都涨）。醇解把两个氯换成
     *   两个甲氧基 —— 副产 HCl 在**液相**里就走掉了，进腔的是干净的 DMDMS。
     *   这与 `make/mtms` 是同一套化学（MTS 的三个氯换三个甲氧基），只是两个氯。
     *
     * ── 它同时消掉了"杂质"这个身份 ─────────────────────────────────────────
     *
     *   MTMS 里 8–18 wt% 的 DMDMS 本来是跟着 MTS 的 DDS 一起醇解出来的杂质
     *   （`make/mtms` 的 8–18 %），现在它成了**配料**：同一个分子，
     *   在 2.6–2.9 那一档是"不纯"，在 2.4–2.5 那一档是"掺进去"（问六①）。
     *
     * 收率 90–95 %（与 MTMS 同档；DDS 只有两个氯，比 MTS 好换）。
     */
    id: 'make/dmdms',
    name: '二甲基二甲氧基硅烷制备',
    produces: [
      {
        item: 'mat/dimethyl-dimethoxysilane',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 90, max: 98 },
          { param: 'waterContent', kind: 'range', min: 0.02, max: 0.1 },
        ],
      },
      { item: 'mat/hcl', qty: q(607), gives: [{ param: 'concentration', kind: 'range', min: 31, max: 33 }] },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/dimethyl-dichlorosilane',
            qty: q(1074),
            need: [{ param: 'purity', kind: 'range', min: 85, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/methanol', qty: q(533) }] },
    ],
    needs: [],
    performedBy: 'plant/wet-bench',
    under: [
      { param: 'temperature', min: 40, max: 70 },
      { param: 'pressure', min: 100, max: 300 },
    ],
    rate: { hours: q(10) },
  },

  {
    /**
     * **SiCOH 膜：MTMS + TEOS + O₂ 的 PECVD（13.56 MHz，250–350 °C，10–100 Pa）。**
     *
     *   硅片 25 + MTMS 0.02 + TEOS 0.005 + 氧 0.01 + 氩 0.01 + 氮 0.01 + 铝 0.001
     *   → SiCOH 片 25（k 2.6–2.9，500 nm）
     *
     * ── 为什么是 MTMS + TEOS + O₂ 这个三元 ─────────────────────────────────
     *
     *   MTMS 给甲基（k 的来处）；TEOS 给交联（模量的来处）；O₂ 只做一件事：
     *   把网络里的**碳氢**烧成 CO₂/H₂O 带走，但**不动甲基**。O₂/前驱体比是全局最灵的旋钮：
     *      O₂ 少 ⇒ 甲基留得多、k 低，但膜软、漏电（残碳 10 at% 以上）
     *      O₂ 多 ⇒ 甲基被氧化掉，膜变成 SiO₂，**k 回到 4.0**
     *   本文件取 O₂ : (MTMS+TEOS) = **2–4 : 1**（mol），落在 k 2.6–2.9 那一档。
     *
     * ── 等离子体能不能启辉（问四②③）───────────────────────────────────────
     *
     *   能，而且比 RIE 那台容易：10–100 Pa 的 pd 落在帕邢极小附近（0.3–5 Pa·m），
     *   击穿 200–400 V，`plant/rf-13m56` 的 V_rf 300–500 V 够；
     *   500 W / φ300 电极 = 0.7 W/cm²（工业 0.1–1）⇒ 稳定。
     *   **降级不在启辉，在气压低一个量级**：工业 130–1300 Pa、本腔 10–100 Pa
     *   ⇒ 沉积 20–60 nm/min（工业 200–600）、均匀性 ±10–20 %（工业 ±3 %）。R8 ⑥。
     *
     * ── 三个量测 ───────────────────────────────────────────────────────────
     *
     *   厚度：椭偏（488 nm、70°/75° 两角）±0.019 nm；
     *   k：**能测**——蒸 φ1 mm 的铝点，C-V（100 kHz/1 MHz）反算 EOT，
     *     k = ε₀·t/EOT ⇒ ±4 %（面积 ±4 % 是主项）。这一条推翻了
     *     `cmp-integration.ts` 缺口⑩ 的"k 测不出"：`probe-station.ts:287` 就是为这件事造的。
     *   甲基：测不出（没有 FTIR）⇒ 55–75 % 是按 O₂ 比与功率密度推的（缺口⑤）。
     */
    id: 'make/sico-h-pecvd',
    name: '长了 SiCOH 膜的片制造',
    produces: [
      {
        item: 'mat/sico-h-wafer',
        qty: q(25),
        gives: [
          { param: 'kValue', kind: 'range', min: 2.6, max: 2.9 },
          { param: 'kValueHumid', kind: 'range', min: 2.7, max: 3.0 },
          { param: 'methylRetention', kind: 'range', min: 55, max: 75 },
          { param: 'porosity', kind: 'range', min: 3, max: 10 },
          { param: 'thickness', kind: 'range', min: 400, max: 600 },
          // 15–20 % 的四官能 TEOS 把 T 树脂的网撑起来：6–9 GPa（CMP 要 ≥5 ✓）
          { param: 'modulus', kind: 'range', min: 6, max: 9 },
        ],
      },
    ],
    uses: [
      // 25 片 φ100：每片 78.5 cm² × 500 nm × 1.3 g/cm³ = 5.1 mg，25 片 128 mg；
      // 折 MTMS（膜单元 CH₃SiO₁.₅ = 67.1 g/mol 对 MTMS 136.2）= 260 mg；
      // 前驱体利用率 10–15 % ⇒ 2 g；**腔壁也在长**（0.52 m² 对 25 片的 0.196 m² = 2.7 倍）
      // ⇒ 再加 2.7 倍，取 MTMS 20 g（TEOS 按 1:0.2 的摩尔比 = 5 g）
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(25) }] },
      {
        anyOf: [
          {
            item: 'mat/mtms',
            qty: q(1, 50),
            // DMDMS 8–18 % 会当链端基（模量掉），但膜还能长 ⇒ 功能还在
            need: [
              { param: 'purity', kind: 'range', min: 75, dir: 'atLeast' },
              { param: 'waterContent', kind: 'range', max: 0.3, dir: 'atMost' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/teos', qty: q(1, 200) }] },
      // 氧 10 g：200 sccm × 20 min = 4 L = 5.7 g，加倍取 10 g
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 100) }] },
      // 氩 10 g：稀释与起辉气，1000 sccm × 20 min
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
      // 氮 10 g：吹扫与破空
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 100) }] },
      // 铝 1 g：φ1 mm 的点电极 25 只（每只 8.5e-7 m² × 100 nm × 2700 = 0.23 µg）
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 1000) }] },
    ],
    needs: [
      // 13.56 MHz 的源：**只在 needs 里**（它 hold 不了任何条件，`flow-and-rf.ts:507` 没有 holds）
      'plant/rf-13m56',
      // 三路气的计量：MTMS 鼓泡 20 sccm + TEOS 10 sccm + O₂ 200 sccm
      'plant/mfc',
      'plant/clean-room',
      'plant/metrology-room',
      'plant/water-polisher',
    ],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh:
          '沉积：MTMS:TEOS:O₂:N₂ = 1:0.2:2–4:5，13.56 MHz 300–500 W（0.7 W/cm²）、250–350 °C、10–100 Pa、20–60 nm/min ⇒ 500 nm 要 8–25 min。O₂ 是唯一的旋钮：多一分就把甲基烧掉、k 回 4.0；少一分膜软、漏电',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 250, max: 350 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '退火 30 min（N₂）：驱残余的甲氧基与溶剂、把笼状结构交联成网。**上限 400–425 °C** —— 再高甲基开始分解，k 就回不去了（这条线决定了下游 ALD 只能到 380 °C）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 425 }],
      },
      {
        note_zh:
          '蒸铝点电极：φ1 mm 的掩模孔、100 nm 铝、0.01–1 Pa（`plant/evaporator` 的窗口）。点电极是 C-V 的唯一办法 —— 低 k 膜上不能压探针（针压 >1 GPa 就穿）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.01, max: 1 }],
      },
      {
        note_zh:
          '量厚度：椭偏 488 nm、70°/75° 两角、1 s/点 ⇒ ±0.019 nm（500 nm 上是 0.004 %）。只能测平片，图形片要陪片',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '量 k：C-V 100 kHz（1 MHz 靠换槽路线圈，±5 %），电容 37.5 pF、0.6 % 档 ⇒ EOT；k = ε₀·t/EOT。误差 ±4 %（面积 ±4 % 是主项）—— 2.6 与 2.9 差 11 %，分得开',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **k 2.4–2.5：MTMS + DMDMS 的混配 PECVD（把 T 单元换成 D 单元）。**
     *
     *   硅片 25 + MTMS 10 g + DMDMS 4 g + 氧 5 g + 氩 10 g + 氮 10 g + 铝 1 g
     *   → SiCOH 片 25（k 2.4–2.5、自由体积 12–18 %、**模量 2.5–3.5 GPa**）
     *
     * ── 掺量（问六①）──────────────────────────────────────────────────────
     *
     *   DMDMS : MTMS = **0.37–0.47 : 1（摩尔）** = D 占混合气的 **27–32 vol%**（= 25–29 wt%）。
     *   由两段算出来，**只算一段会得出"掺 D 没用"的错误结论**：
     *     理想混合（Lorentz–Lorenz）：30 mol% D 只给 k **2.85**（ρ 1.22）
     *     自由体积（D 截断网络）：再要 **13–16 vol%** 的孔 ⇒ k 2.41–2.49，ρ 1.04
     *   把 p 与 D 绑成一条标定线（同一个机理）：10 %⇒2.87 · 20 %⇒2.63 · 27 %⇒2.49 · 32 %⇒2.41。
     *   ⚠️ 现在的 2.6–2.9 就是"MTMS 自带 8–18 wt% DMDMS"的那个点 —— 所以这一条不是新机理，
     *      是**把同一个杂质从 8–18 % 加到 27–32 %**（并把它从"杂质"变成"配料"）。
     *
     * ── 代价（问六②）：模量 2.5–3.5 GPa，CMP 压不塌但磨得动 ─────────────────
     *
     *   静压：20 kPa / 3 GPa = **6.7e-6** 的应变 ⇒ 500 nm 的膜压 3.3 pm，**压不塌**。
     *   被磨：H ≈ E/10 = 0.25–0.35 GPa（现在 6–9 GPa 的膜是 0.8–1 GPa、SiO₂ 9 GPa）
     *         ⇒ Preston 速率快 **2.6–3.2 倍**，过抛段介质多磨 **13–32 nm**
     *         —— 是 CMP 判据（线宽 5 % = 5 nm）的 **2.6–6.4 倍**。
     *   ⇒ 这一格是**拿 erosion 换 k**：介质下沉之后铜会凸出来，量出来的 dishing 反而变小
     *     （**假通过**）。R8 ⑬。**k 2.4–2.5 与 dishing 3–5 nm 不能同时算过。**
     *
     * ── 三个与致密膜不同的工艺参数 ─────────────────────────────────────────
     *
     *   ① O₂ : 前驱体 = **1–2 : 1**（致密膜那条是 2–4 : 1）：D 单元已经是端基，
     *      多给氧会把甲基烧掉、也把自由体积烧塌 ⇒ k 回到 2.7–2.9。
     *   ② 退火 **350–380 °C**（致密膜那条 400–425）：400 °C 上 D 的自由体积会弛豫塌掉，
     *      而它正是 k 低的那一半。
     *   ③ 沉积完不能马上量 k：先 N₂ 里 200 °C 烘 30 min 去掉吸附水（与另外两条同口径）。
     *
     * ⚠️ 模量现在能直接读（`measure/nanoindent-lowk`，E 5–20 GPa），但仪器
     *    **R9 未闭合**（不可复制）；压头/传感器/ADC 仍进口，压深 > 膜厚 10 % 的点要剔除（缺口⑨）。
     * ⚠️ CMP 那一边的 `modulus ≥5` 门写不进 `need`（多条产出路线是 OR，已知缺口⑧）⇒
     *    `fine-damascene.ts` 的 dishing 判据要主 agent 手写一条注释。
     * ⚠️ **E≥5 + k≤2.5 的硬版本（`make/sico-h-2p5-hard`）不建**：本层没有
     *    UV/EB 固化、HMDS、scCO₂ 干燥、低 k 硬罩；见文件头 R8 ⑰。本路线数值不改。
     */
    id: 'make/sico-h-2p5',
    name: '长了 SiCOH 膜的片制造',
    produces: [
      {
        item: 'mat/sico-h-wafer',
        qty: q(25),
        gives: [
          { param: 'kValue', kind: 'range', min: 2.4, max: 2.5 },
          { param: 'kValueHumid', kind: 'range', min: 2.55, max: 2.8 },
          { param: 'methylRetention', kind: 'range', min: 75, max: 90 },
          { param: 'porosity', kind: 'range', min: 12, max: 18 },
          { param: 'thickness', kind: 'range', min: 400, max: 600 },
          // 2.5–3.5：Gibson–Ashby（1.04/1.35）³⁻⁴ × 8 GPa = 2.8–3.7，再算 D 截断的连通性损失
          { param: 'modulus', kind: 'range', min: 2.5, max: 3.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(25) }] },
      // MTMS 10 g：与致密膜那条（20 g）同一个记账法的一半
      {
        anyOf: [
          {
            item: 'mat/mtms',
            qty: q(1, 100),
            need: [
              { param: 'purity', kind: 'range', min: 75, dir: 'atLeast' },
              { param: 'waterContent', kind: 'range', max: 0.3, dir: 'atMost' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      // DMDMS 4 g：D:T = 0.43 mol ⇒ 4 g / 120.22 ÷ (10 g / 136.22) = 0.45 ✓
      {
        anyOf: [
          {
            item: 'mat/dimethyl-dimethoxysilane',
            qty: q(1, 250),
            need: [{ param: 'purity', kind: 'range', min: 90, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      // 氧 5 g：O₂ : 前驱体 = 1–2 : 1（107 mmol 的前驱体要 110–210 mmol = 3.5–6.7 g）
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 100) }] },
      // 铝 1 g：φ1 mm 的点电极（C-V 用）
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 1000) }] },
    ],
    needs: [
      'plant/rf-13m56',
      'plant/mfc',
      'plant/clean-room',
      'plant/metrology-room',
      'plant/water-polisher',
    ],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh:
          '沉积：MTMS:DMDMS:O₂:N₂ = 1:0.43:1.5:5、13.56 MHz 300–500 W（0.7 W/cm²）、250–350 °C、10–100 Pa、20–60 nm/min ⇒ 500 nm 要 8–25 min。**O₂ 比致密膜那条低一半** —— D 单元已是端基，多给氧就把甲基烧掉、把自由体积烧塌',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 250, max: 350 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '退火 **350–380 °C**（比致密膜那条低 40 K）、N₂、30 min：400 °C 上 D 单元的自由体积会弛豫塌掉 —— 而它正是 k 低的那一半，塌了 k 就回 2.7–2.9',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 350, max: 380 }],
      },
      {
        note_zh:
          '蒸铝点电极：φ1 mm 掩模孔、100 nm 铝、0.01–1 Pa（`plant/evaporator`）。低 k 膜上不能压探针（针压 >1 GPa 就穿），所以 C-V 只能靠点电极',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.01, max: 1 }],
      },
      {
        note_zh:
          '量厚度：椭偏 ±0.019 nm；**多孔/低密度膜的 n 只有 1.20–1.30**，椭偏要先知 n 才能反算厚度 ⇒ 实际 ±3–5 % 而不是 0.02 nm',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '量 k：100 kHz C-V 反算 EOT、k = ε₀·t/EOT ⇒ ±4 %。2.4 与 2.5 只差 4 % ⇒ **这一档刚好在误差边界上**：判 k ≤2.5 要量 3 点取中值，单点不作数',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **SiCOH 的降级 OR：MTMS 溶胶旋涂 + 固化（MSQ，k 2.8–3.1）。**
     *
     *   硅片 25 + MTMS 0.05 + 乙醇 0.5 + 水 0.05 + HF 0.001 → SiCOH 片 25（k 2.8–3.1）
     *
     * 它与 PECVD 那条是**同一件东西的两个生产者、两个 k 窗口**（`cmp-integration.ts`
     * 对 `mat/trench-wafer` 也是这个写法）：报告会把两条并排摆出来，
     * 需要 k 小的挑 PECVD、需要应力小的挑旋涂。
     *
     * ── 为什么它更差 ───────────────────────────────────────────────────────
     *
     *   ① **没有匀胶机**：甩胶是机器人转着甩（`deprocess.ts:794` 的口径），
     *      膜厚均匀性 ±10–15 %（匀胶机 ±3 %）；
     *   ② 溶胶的缩合度靠 pH 与时间控制，本层没有 pH 计（同一族）
     *      ⇒ 批次之间的分子量分布不可控，k 的重复性 ±0.15；
     *   ③ 固化 400–450 °C 靠电阻炉，升温 5 K/min，快升就裂（膜厚 300–500 nm，
     *      热应力 σ = EΔαΔT/(1−ν) = 6 GPa × 2e-6 × 400 / 0.8 = 6 MPa，不裂；但溶剂爆沸会）。
     *
     * 它仍然有价值的理由：旋涂在**深沟里的填充**比 PECVD 好（PECVD 在 AR 2 上是保形，
     * 不是填充），而 SOG 那条老路（硅溶胶，k 4.0–4.3）已经做到了这一层的"能用"。
     */
    id: 'make/sico-h-spinon',
    name: '长了 SiCOH 膜的片制造',
    produces: [
      {
        item: 'mat/sico-h-wafer',
        qty: q(25),
        gives: [
          { param: 'kValue', kind: 'range', min: 2.8, max: 3.1 },
          { param: 'kValueHumid', kind: 'range', min: 3.2, max: 3.6 },
          { param: 'methylRetention', kind: 'range', min: 45, max: 65 },
          { param: 'porosity', kind: 'range', min: 5, max: 12 },
          { param: 'thickness', kind: 'range', min: 300, max: 500 },
          // 旋涂 MSQ 没有 TEOS 交联（没有气相混合这一步）：4–6 GPa，刚够 CMP 的 5
          { param: 'modulus', kind: 'range', min: 4, max: 6 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(25) }] },
      {
        anyOf: [
          {
            item: 'mat/mtms',
            qty: q(1, 20),
            need: [{ param: 'purity', kind: 'range', min: 75, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      // 乙醇 0.5 kg：MTMS:EtOH = 1:8（mol），25 片的胶量 250 mL
      { anyOf: [{ item: 'mat/ethanol', qty: q(1, 2) }] },
      // 水 0.05 kg：水解的化学计量（3 H₂O/MTMS），过量 3 倍
      { anyOf: [{ item: 'mat/water', qty: q(1, 20) }] },
      // HF 1 g：溶胶-凝胶的酸催化（pH 2–3），F⁻ 亲核催化 Si–O–Si 缩聚
      { anyOf: [{ item: 'mat/hf', qty: q(1, 1000) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/water-polisher'],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh:
          '配溶胶：MTMS:EtOH:H₂O:HF = 1:8:3:0.01（mol），20–30 °C 搅拌 60 min；缩合度靠时间与温度（没有 pH 计，只能按"粘度像甘油"判）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '甩胶：**没有匀胶机**——机器人转着甩（2000 r/min × 40 s），300–500 nm，均匀性 ±10–15 %（R8 里与 PECVD 的 ±10–20 % 是同一档的差）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '固化：400–450 °C、N₂、5 K/min、30 min ⇒ 甲氧基缩合成 Si–O–Si 笼（MSQ），甲基留在笼面上。温度上限与 PECVD 那条同一个理由（甲基 400–425 °C 开始掉）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
      {
        note_zh: '量厚度（椭偏 ±0.019 nm）与 k（C-V，±4 %）：与 PECVD 那条同两件量具',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '量 k：100 kHz C-V 反算 EOT，k = ε₀·t/EOT',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **多孔 SiCOH：加 20–30 wt% 酚醛造孔剂（干态 k 2.2–2.5）。只作升级项，没有下游。**
     *
     *   硅片 25 + MTMS 0.05 + 乙醇 0.5 + 酚醛 0.01 + 水 0.05 + HF 0.001 → 多孔片 25
     *
     * ── 它为什么"能到 2.5"但仍然不能用（两笔都带数）────────────────────────
     *
     *   ① **酚醛在 N₂ 里 450 °C 只碳化、不烧掉**：残碳 3–8 at% ⇒
     *      漏电 1e-6–1e-4 A/cm²（判据 1e-8）⇒ 差 **100–10⁴ 倍**。
     *      要真烧掉得在 O₂ 里 450 °C，而本层唯一 hold `oxygen_ppm` 的炉子是
     *      `plant/atmosphere-furnace`（600–2000 °C）—— 温度够不着。R8 ②。
     *   ② **孔壁的疏水端不够**：孔越大越容易被水填（k_water 80），
     *      湿态回到 **3.2–3.9**。所以 2.2–2.5 是"N₂ 里烘 30 min 后立即测"的那个数。
     *
     * 换句话说：**多孔的 2.2 里有一半是碳给的、不是空气给的。**
     * 这是本文件最不愿意写、但必须写的一句 —— 它决定了这一格"通过"是假的。
     *
     * 没有下游：接 3 nm TiN 也救不回来（漏电在介质里，不在界面）。
     */
    id: 'make/sico-h-porous',
    name: '多孔 SiCOH 片制造',
    produces: [
      {
        item: 'mat/porous-sico-h-wafer',
        qty: q(25),
        gives: [
          { param: 'kValue', kind: 'range', min: 2.2, max: 2.5 },
          { param: 'kValueHumid', kind: 'range', min: 3.2, max: 3.9 },
          { param: 'methylRetention', kind: 'range', min: 50, max: 70 },
          { param: 'porosity', kind: 'range', min: 25, max: 35 },
          { param: 'thickness', kind: 'range', min: 400, max: 700 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(25) }] },
      { anyOf: [{ item: 'mat/mtms', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/ethanol', qty: q(1, 2) }] },
      // 酚醛 10 g：溶胶的固含量 ≈ 24.6 g（MTMS 50 g 折 CH₃SiO₁.₅），造孔剂取 20–30 wt%
      // ⇒ 5–7 g；10 g 是给配液损耗与相分离的余量
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 1000) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/water-polisher'],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh:
          '配溶胶 + 造孔剂：MTMS:EtOH:H₂O:HF = 1:8:3:0.01，再加 20–30 wt% 酚醛（间甲酚/甲醛的 resole，溶于乙醇）；20–30 °C 搅拌 2 h',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      { note_zh: '甩胶：同 MSQ 那条（机器人转着甩，400–700 nm）', performedBy: 'plant/robot' },
      {
        note_zh:
          '固化/造孔：400–450 °C、N₂、30 min。酚醛在 350–450 °C 分解，但**N₂ 里只碳化**⇒ 残碳 3–8 at%、孔 5–20 nm 不可控。要真烧掉得 O₂ + 450 °C，而 `plant/atmosphere-furnace` 是 600–2000 °C（够不着）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
      {
        note_zh: '量厚度（椭偏）：多孔膜的 n 只有 1.15–1.25，椭偏要先知 n 才能反算厚度 ⇒ ±10 % 而不是 0.02 nm',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **3 nm TiN 阻挡层：硅烷化修复 + ALD（350–380 °C，60–150 周期）。**
     *
     *   低 k 片 25 + DDS 0.02 + 钛 0.001 + 氯 0.001 + 氮 0.005 + 铝 0.001 + 水 2
     *   → 3 nm 阻挡片 25（场厚 3 nm、覆盖 88–95 %、k 2.65–2.95）
     *
     * ── 3 nm 怎么来的、连续不连续（问五）──────────────────────────────────
     *
     *   GPC 0.02–0.05 nm/周期 ⇒ 3 nm = **60 周期（0.05）/ 100（0.03）/ 150（0.02）**，
     *   11.5 s/周期 ⇒ **11.5 / 19.2 / 28.8 min**。成核延迟 10–20 周期（0.2–1 nm），
     *   TiN 在 SiO₂ 上 1.5–2.5 nm 闭合 ⇒ 3 nm 连续（余量 1.2–2.0 倍）。
     *   Cu 要 >2 nm 的连续膜 ⇒ 3 nm 的有效余量 **1.5 倍** ✓。
     *   **但覆盖会吃掉它**：88–95 % ⇒ 侧壁 2.64–2.85 nm（>2 ✓）；
     *   沟底内角 60–75 % ⇒ 1.80–2.25 nm ⇒ **卡在 2 nm**（R8 ⑤）。
     *
     * ── 与低 k 的兼容性（文件头第二节）──────────────────────────────────────
     *
     *   ① **先修刻蚀损伤**：DDS 蒸汽 100–120 °C 封 Si–OH
     *      （(CH₃)₂SiCl₂ + 2 Si–OH → (Si–O)₂Si(CH₃)₂ + 2 HCl），补回 60–80 % 的疏水端。
     *      这一步是"用 Rochow 的副产物修 Rochow 的膜"。
     *   ② **ALD 只能到 380 °C**：400 °C 上甲基开始分解，且 TiCl₄ 的 HCl 副产把
     *      Si–CH₃ 打成 Si–Cl（一水解就是 Si–OH，k 回 3.0+）。350–380 °C × 11–29 min
     *      ⇒ 甲基再掉 8–15 % ⇒ k 2.6–2.9 → **2.65–2.95**。
     *   ③ **3 nm 比 5 nm 对低 k 更好**：60–150 周期对 167 周期，热预算少 36–64 %。
     *
     * ── 一个数要说清 ───────────────────────────────────────────────────────
     *
     *   3 nm TiN 的方阻 R□ = ρ/t = 100–200 µΩ·cm ÷ 3 nm = **333–667 Ω/□**
     *   （5 nm 是 200–400）。终端效应 ΔV = j·R□·a²/4 在 3 nm 上比 5 nm 大 1.67 倍 ——
     *   所以起镀前的 10 nm Cu strike 层（`fine-damascene.ts` 第⑤段）不能省。
     */
    id: 'make/tin-3nm-ald',
    name: '低 k 介质镀 TiN 片制造',
    produces: [
      {
        item: 'mat/lowk-barrier-wafer',
        qty: q(25),
        gives: [
          { param: 'barrierThickness', kind: 'range', min: 3, max: 3 },
          { param: 'stepCoverage', kind: 'range', min: 88, max: 95 },
          { param: 'kValue', kind: 'range', min: 2.65, max: 2.95 },
          { param: 'methylRetention', kind: 'range', min: 50, max: 70 },
          // 这条路线不测 E/H；按全窗口交付，nanoindent.ts 的测量路线再收窄
          { param: 'youngsModulus', kind: 'range', min: 1, max: 50 },
          { param: 'hardness', kind: 'range', min: 0.1, max: 10 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/sico-h-wafer',
            qty: q(25),
            // 旋涂那条 2.8–3.1 的上界过不了 3.0（差 3 %）⇒ 报告会挑 PECVD 那条
            need: [{ param: 'kValue', kind: 'range', max: 3, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      // DDS 20 g：硅烷化是单分子层（5 OH/nm² × 0.2 m² = 1e18 个位点 = 1.7 µmol），
      // 20 g 是给气相循环与管壁吸附的余量
      { anyOf: [{ item: 'mat/dimethyl-dichlorosilane', qty: q(1, 50) }] },
      // 钛 1 g：TiN 只有 3.1 mg（78.5 cm² × 25 片 × 3 nm × 5.2 g/cm³），折钛 2.4 mg；
      // 但每个周期的 TiCl₄ 是 10 倍过量（10 Pa·L = 3.4 µmol = 0.65 mg），60–150 周期
      // ⇒ 0.1 g TiCl₄ = 25 mg 钛。1 g 是 40 倍余量（给源池残留与阀件吹扫）
      {
        anyOf: [
          {
            item: 'mat/titanium',
            qty: q(1, 1000),
            need: [{ param: 'purity', kind: 'range', min: 99, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      // 氯 1 g：Ti + 2Cl₂ → TiCl₄（就地氯化，微克级用量；余量给阀件吹扫）
      { anyOf: [{ item: 'mat/chlorine', qty: q(1, 1000) }] },
      // 氮 5 g：N₂ 等离子体（200 W）+ 吹扫，60–150 周期 × 11.5 s × 200 sccm ≈ 2–5 L
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 200) }] },
      // 铝 1 g：点电极（方阻用四探针，C-V 用点电极）
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 1000) }] },
      // 水 2 kg：硅烷化后冲洗与冷却
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: [
      'plant/rf-13m56',
      'plant/mfc',
      'plant/clean-room',
      'plant/metrology-room',
      'plant/water-polisher',
    ],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '① 硅烷化修复（刻蚀之后、镀膜之前）：DDS 蒸汽 100–120 °C、10 min、100–300 kPa ⇒ Si–OH 封成 Si–(CH₃)₂，补回 60–80 % 的疏水端。**这一步是低 k 与等离子体的和解**：没有它，刻蚀损伤层的 k 3.2–3.6 会一直留到成品里',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 100, max: 120 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '② 钛源：钛屑在氯气里氯化成 TiCl₄（300–400 °C，bp 136 °C），进源池鼓泡（40–60 °C、N₂ 20 sccm 载气）。这一步是 `fine-damascene.ts` 第⑤段的同一手，只是用量少 2.8 倍（60–150 周期对 167）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 300, max: 400 }],
      },
      {
        note_zh:
          '③ ALD 3 nm：TiCl₄ 脉冲 0.2 s + N₂ 吹扫 5 s + N₂ 等离子体 200 W + 吹扫 5 s（11.5 s/周期）、**350–380 °C**、10–100 Pa；60–150 周期 ⇒ 11.5–28.8 min。上限 380 °C 是甲基的线（400 就掉），下限 350 是 TiN 的结晶线。台阶覆盖 88–95 %，沟底内角只有 60–75 % ⇒ 1.8–2.3 nm（R8 ⑤）',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 350, max: 380 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '原位监控：QCM 每 9 个周期（约 100 s，`sampleInterval ≤100 s` 的上限）读一次增量 —— 0.03 nm × 9 = 0.27 nm = 3.1 Hz，±1 Hz ⇒ **±30 %**；它只证明"还在长"，不证明"长多厚"（与 `ald.ts` §2.3 同一个处理）',
        performedBy: 'plant/film-monitor',
        under: [{ param: 'temperature', min: 19.5, max: 20.5 }],
      },
      {
        note_zh:
          '④ 蒸铝点电极 + 量方阻：φ1 mm 的点电极（C-V 用），四探针量 TiN 的方阻（**333–667 Ω/□**，5 nm 是 200–400 ⇒ 1.67 倍）。⚠️ 3 nm 的膜一压针就穿（针尖 >1 GPa）⇒ 方阻要在陪片的 20 nm 膜上标定，或用非接触的涡流（`plant/cmp-integration` 的涡流头只到 20–60 nm，读不出 3 nm）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.01, max: 1 }],
      },
      {
        note_zh:
          '⑤ 量 k：C-V（100 kHz）反算 EOT，k = ε₀·t/EOT ⇒ 2.65–2.95（ALD 的热预算让它比沉积态的 2.6–2.9 高 0.05）',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑥ 量厚度与覆盖：椭偏读不出 3 nm 的 TiN（n 未知，`fine-damascene.ts` 缺口⑤），只能按**周期数**记账（60–150 ± 0.2）；覆盖与连续性靠陪片的 e-beam 剖面判"有没有膜"，判不出"多厚"—— 没有原位电导法（缺口④）',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },
  {
    /**
     * **2 nm ALD TiN（并列）：硅烷化 → TiCl₄ 源 → ALD 2 nm → QCM → 电学/厚度。**
     *
     *   `mat/sico-h-wafer` 25 + DDS 20 g + Ti 1 g + Cl₂ 1 g + N₂ 5 g
     *   + Al 1 g + 水 2 kg → `mat/lowk-barrier-wafer` 25 片
     *
     * 与 `make/tin-3nm-ald` 同一台 `plant/ald-reactor`、同一套化学；只把
     * 周期数从 60–150 改成 **40–100**（2 nm 比 3 nm 少 1/3 循环）。
     * GPC 0.02–0.05 nm/周期 ⇒ 40–100 周期 = 2.0–2.5 nm；11.5 s/周期
     * ⇒ ALD 段 7.7–19.2 min（3 nm 是 11.5–28.8）。装炉/抽气/量测不变，
     * rate 仍 8 h。
     *
     * ⚠️ **B 类，不是连续膜已验证**：
     *   · 场厚 2–2.5 nm；台阶覆盖 85–92 %（侧壁/场），沟底内角 **55–70 %**
     *     ⇒ **1.1–1.4 nm（2 nm 端）** 到 1.4–1.75 nm（2.5 nm 端）。
     *     按 2 nm 端记 **1.1–1.5 nm**（55–75 % 的统计上沿）；TiN 在 SiO₂ 上
     *     1.5–2.5 nm 才闭合 ⇒ 2 nm 端在阈值下沿，可能不连续。
     *   · 针孔/漏电没有实测；没有原位电导法，e-beam 只看"有没有膜"。
     *   · **TiCl₄ 首脉冲咬 Ti 的风险仍在**：若下面有 Ti 2 nm，首脉冲可能
     *     消耗一部分 Ti；2 nm TiN 的周期更少，盖不住的风险比 3 nm 更大。
     *   · 2 nm 在这个 ALD 窗口里**做得出来**（40 周期 × 0.05 nm = 2 nm；
     *     脉冲/吹扫时间不变，吸附饱和不是瓶颈）；做不出来的是"连续"，
     *     不是"厚度"。
     */
    id: 'make/tin-2nm-ald',
    name: '低 k 介质镀 TiN 片制造',
    produces: [
      {
        item: 'mat/lowk-barrier-wafer',
        qty: q(25),
        gives: [
          { param: 'barrierThickness', kind: 'range', min: 2, max: 2.5 },
          { param: 'stepCoverage', kind: 'range', min: 85, max: 92 },
          { param: 'kValue', kind: 'range', min: 2.7, max: 2.95 },
          { param: 'methylRetention', kind: 'range', min: 55, max: 75 },
          { param: 'youngsModulus', kind: 'range', min: 1, max: 50 },
          { param: 'hardness', kind: 'range', min: 0.1, max: 10 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/sico-h-wafer',
            qty: q(25),
            need: [{ param: 'kValue', kind: 'range', max: 3, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/dimethyl-dichlorosilane', qty: q(1, 50) }] },
      {
        anyOf: [
          {
            item: 'mat/titanium',
            qty: q(1, 1000),
            need: [{ param: 'purity', kind: 'range', min: 99, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/chlorine', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: [
      'plant/rf-13m56',
      'plant/mfc',
      'plant/clean-room',
      'plant/metrology-room',
      'plant/water-polisher',
    ],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '① 硅烷化修复：DDS 蒸汽 100–120 °C、10 min、100–300 kPa ⇒ Si–OH 封成 Si–(CH₃)₂，补回 60–80 % 的疏水端；与 3 nm 路线同一步',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 100, max: 120 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '② 钛源：钛屑在氯气里氯化成 TiCl₄（300–400 °C，bp 136 °C），进源池鼓泡（40–60 °C、N₂ 20 sccm 载气）；2 nm 只跑 40–100 周期，源池装料与 3 nm 相同',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 300, max: 400 }],
      },
      {
        note_zh:
          '③ ALD 2 nm：TiCl₄ 脉冲 0.2 s + N₂ 吹扫 5 s + N₂ 等离子体 200 W + 吹扫 5 s（11.5 s/周期）、**350–380 °C**、10–100 Pa；40–100 周期 ⇒ 7.7–19.2 min。台阶覆盖 85–92 %，沟底内角 **55–70 %** ⇒ 1.1–1.4 nm（2 nm 端）/ 1.4–1.75 nm（2.5 nm 端），按 2 nm 端记 **1.1–1.5 nm**（55–75 % 上沿）；**可能不连续，B 类**',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 350, max: 380 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '原位监控：QCM 每 9 个周期读一次 —— 0.03 nm × 9 = 0.27 nm = 3.1 Hz，±1 Hz ⇒ **±30 %**；2 nm 只有 40–100 周期，它只证明"还在长"，不证明"长多厚"，也不证明"连续"',
        performedBy: 'plant/film-monitor',
        under: [{ param: 'temperature', min: 19.5, max: 20.5 }],
      },
      {
        note_zh:
          '④ 蒸铝点电极 + 量方阻：φ1 mm 点电极（C-V 用），四探针量 TiN 方阻；2 nm 的 R□ = ρ/t = 100–200 µΩ·cm ÷ 2 nm = **500–1000 Ω/□**（2.5 nm 是 400–800），比 3 nm 的 333–667 高一档。⚠️ 2 nm 膜更薄，一压针就穿（针尖 >1 GPa）；没有非接触涡流能读 2 nm',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.01, max: 1 }],
      },
      {
        note_zh:
          '⑤ 量 k：C-V（100 kHz）反算 EOT，k = ε₀·t/EOT ⇒ 2.70–2.95；2 nm 比 3 nm 少 1/3 循环，甲基损失更少，k 比 3 nm 的 2.65–2.95 略好，但没有实测',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑥ 量厚度与覆盖：椭偏读不出 2 nm 的 TiN（n 未知），只能按**周期数**记账（40–100 ± 0.2）；覆盖/连续性靠陪片的 e-beam 剖面判"有没有膜"，判不出"多厚"—— 内角 55–70 %、1.1–1.4 nm（2 nm 端），**可能不连续**；针孔/漏电无实测。**TiCl₄ 首脉冲咬 Ti 的风险仍在**：若下面有 Ti 2 nm，首脉冲会消耗一部分 Ti，2 nm TiN 的周期更少、盖不住的风险比 3 nm 更大',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '低 k 片 25 + DDS 20 g + Ti 1 g + Cl2 1 g + N2 5 g + Al 1 g + 水 2 kg → 阻挡片 25；TiN 2–2.5 nm × 78.5 cm² × 25 × 5.2 g/cm³ ≈ 2.0–2.5 mg（3 nm 是 3.1 mg）；Ti/Cl2/N2 的其余在源腔/尾气。产物按片计，不做质量守恒',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...LOWK_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...LOWK_ROUTES];
