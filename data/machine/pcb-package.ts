/**
 * 机器人主板的三种封装族 —— FCBGA / QFN·LQFP / LGA（附两件辅料）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、这一层在哪
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `data/material/package.ts` 里那三种封装是 1980 年代的：
 *
 *   丝焊（φ25 µm 铝丝或金丝）+ 金属帽（钢帽 + 玻璃压缩封接）+ 酚醛塑封 + 冲压引线框
 *
 * 2026 年机器人主板上真正装的芯片是另一种东西：
 *
 *   主控 SoC        FCBGA   倒装 + 球阵列，0.4–0.8 mm 球距，1000+ 球，
 *                            8–12 层有机基板，铜盖 + TIM
 *   内存            FBGA/PoP 0.8 mm 球距（本文件不写，与 FCBGA 同族）
 *   关节 MCU        QFN/LQFP 引线框 + 塑封，0.5 mm 脚距
 *   力/编码器 ASIC  LGA     陶瓷基板、无引脚、底部焊盘阵列
 *   晶振            SMD 3225 陶瓷壳（`std/quartz-resonator-general`，不在本文件）
 *
 * **这五样本层一个都没有** —— 而它们是"主板"这个词的实际内容。
 * 本文件补前四样：三族封装 + 两件辅料（底部填充胶、导热界面材料）。
 *
 * 文件形状：**10 个条目、12 条路线、0 台新设备**。
 * 82 台执行设备一台不用加 —— 缺的不是设备，是**材料与工艺窗口**。
 * 三处真正缺的设备（球磨机、激光钻孔机、探针台）写在第五节缺口里，
 * 不假装它们不存在。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、五个问题（每个都带数）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── ① 有机封装基板：8–12 层 / 10 µm 线宽 / 0.3 mm 厚 ─────────────────────
 *
 * ABF（味之素积层膜）= **环氧 + 硅微粉**。本层**没有环氧**：环氧要双酚 A +
 * 环氧氯丙烷，双酚 A 要苯酚 + 丙酮，而丙酮那条链没建（苯酚有，见
 * `data/material/aromatics.ts`）。所以介质只能换：
 *
 *     酚醛树脂（`mat/phenolic-resin`）+ 石英粉（`mat/silica`，60 wt%）
 *
 * 三个数分别回答"够不够"：
 *
 *   **线宽 10 µm —— 够，而且是全篇最不缺的一项。**
 *     本层光刻是 0.13 µm（`litho-m3.ts`），10 µm 是分辨率的 **77 倍**。
 *     真正的限制不在光刻，在**电镀填孔**：10 µm 宽的线要镀 12 µm 高（AR 1.2），
 *     而 150 µm 的孔口会堆积（"狗骨"），线宽公差 ±3 µm。
 *     所以交付窗口写 `lineWidth ≤ 10`，实测最好 **8 µm**，不是 5。
 *
 *   **层数 8 —— 差 2026 的 12 层 1.5 倍，卡在层压次数不在布线。**
 *     8 层 = 芯 2 + 每边 3 次积层。每加一层要在 180–200 °C / 10 MPa 压一次，
 *     每次介质厚度公差 ±15 %（酚醛的流动比环氧难控），压到第 5 次，板子在
 *     30 mm 跨距上已经 50 µm 翘（第 ⑤ 问的算式，判据的一半）。**所以 8 是压得出来的上限。**
 *
 *   **CTE 差 3 倍会不会翘 —— 会，加填料之后不会。**
 *     未填料酚醛 α = **60 ppm/K**，铜 17 → 差 **3.5 倍**（这就是"3 倍"的出处）。
 *     60 wt% 石英 = **46 vol%**（ρ 1.25 / 2.2），Turner 混合律下界
 *     α = (0.46×0.5×70 + 0.54×60×4)/(0.46×70 + 0.54×4) = **4.2 ppm/K**；
 *     工业 ABF（环氧 + 65 wt% 硅微粉）实测 10–13，差的那 2.5 倍来自界面脱粘与
 *     树脂自由体积。酚醛更脆一档，取 **15 ppm/K**。
 *     → 与铜差 **2 ppm/K（1.1 倍）**，比 ABF 与铜的 5 ppm/K 还匹配。
 *     **填料把 3.5 倍压到 1.1 倍 —— 这是这条替代路线成立的唯一理由。**
 *
 *   代价两处，都照实记：酚醛 Dk 4.8（ABF 3.3）、吸水率 1.5 %（ABF 0.3 %）。
 *   Dk 在 10 MHz 上不构成限制（20 mm 长的 10×12 µm 线：R = 2.8 Ω、C = 3.4 pF、
 *   RC = 9.5 ps）；吸水率构成限制 —— 回流时水汽爆米花（popcorn），这是第三节降级 ⑤。
 *
 * ── ② C4 微凸点：80–100 µm 间距 / 30–50 µm 高 / 共面性 ±5 µm ─────────────
 *
 * **做法是电镀，不是印刷。** 三条路一条条否掉：
 *
 *   钢网印刷   要 50 µm 厚的钢网。本层轧不出 50 µm 钢箔（`make/lead-frame` 用的是
 *              0.15 mm 铜带，辊轧下限同档），而 0.15 mm 网 + 50 µm 开孔 = AR 3:1，
 *              焊膏根本填不进去。**否。**
 *   蒸发（IBM C4 原法）  要 100 µm 开孔的钼掩模，钼链没建。**否。**
 *   电镀       ✓ 只要一层 50 µm 的厚胶模（甩三次胶），孔径 50 µm / 深 50 µm = AR 1:1，
 *              这是厚胶光刻的舒适区。
 *
 * 共镀 Sn 与 Ag 要络合剂（碘化物 / 硫脲 / 吡啶），本层只有 HF、硝酸、硫酸 —— 都不到。
 * 所以走**分层镀 + 回流互扩散**：
 *
 *   先镀 Ag 1.4 µm，再镀 Sn 38 µm → 回流 245 °C / 30 s → SnAg3.5
 *   均质化判据：√(D·t)，液态锡里 Ag 的 D ≈ 1×10⁻⁹ m²/s，
 *              √(1e−9 × 30) = **5.5 µm** > 1.4 µm ✓ 30 s 够把银吃干净
 *
 * **共面性 ±5 µm 是量出来的，不是猜的：**
 *   镀层厚度均匀性 ±5 % → ±2 µm（40 µm 高）；
 *   回流成球靠表面张力自愈 → ±2 µm；
 *   再压平（`plant/press`，200 t / 0.09 m² = **22 MPa**）→ **±2 µm**。
 *   判据 ±5 µm，余量 **2.5 倍** ✓
 *   ⚠️ 但只能**抽 5 颗**：`plant/comparator` 是单点接触式（读 1 µm），
 *   100 颗的整面共面度要白光干涉或阴影云纹 —— 本层都没有（第三节降级 ⑫）。
 *
 * ── ③ 底部填充：100 µm 间隙里 30 s 流满 ──────────────────────────────────
 *
 * 先把判据换掉：**"黏度 < 100 mPa·s"不是判据，"30 s 流满"才是。**
 * Washburn：t = 3ηL² /(h·γ·cosθ)，L = 7.5 mm（15 mm 基板的一半）、γ = 0.035 N/m。
 * 反解黏度上限：η ≤ t·h·γ / (3L²)。
 *
 *   **酚醛 resol 的黏度**（本层只有 resol，novolak 是固体）：
 *     25 °C → 1 200 mPa·s；Arrhenius，Ea = 50 kJ/mol：
 *     70 °C → 1 200 × exp[(50 000/8.314)(1/343 − 1/298)] = **85 mPa·s**
 *     90 °C → 1 200 × exp[(50 000/8.314)(1/363 − 1/298)] = **32 mPa·s**
 *   60 wt% 石英再抬 4 倍（Einstein + 拥挤效应）→ **90 °C 时 128 mPa·s**
 *
 *   两个间隙，两笔账：
 *     塌球后间隙 **28 µm**（40 µm 凸点 × 0.7）→ η ≤ 174 mPa·s → 128 ✓ 余量 1.4×
 *     若按题设 100 µm 间隙           → η ≤ 620 mPa·s → 128 ✓ 余量 4.8×
 *   **结论：70 °C 做不了（85×4 = 340 mPa·s，对 28 µm 间隙超 2 倍），
 *   90 °C 能做，余量只有 1.4 倍。** 而 90 °C 上胶的代价是凝胶时间 ~30 min，
 *   所以是"少量多次"，一次配 200 g。
 *
 *   **填料粒径 < 5 µm：磨不到，但分得到。**
 *   球磨到 d50 3 µm 不难，难的是尾巴 —— d99 落在 15–20 µm，一颗就能堵死 28 µm 的间隙。
 *   分级靠 **Stokes 沉降**（5 µm 石英、ρ 2.2、水中）：
 *     v = 2(ρp−ρ)g·r²/(9η) = 2×1 200×9.81×(2.5×10⁻⁶)²/(9×10⁻³) = **1.63×10⁻⁵ m/s**
 *     → 沉 1 cm 要 **613 s ≈ 10 min**
 *   所以"磨到 3 µm + 沉 10 min 取上清"能给 **d99 < 5 µm**，
 *   代价是产率：只有约 **30 %** 的粉进底填，其余回磨。**分级才是瓶颈，不是研磨。**
 *
 * ── ④ TIM：W/(m·K) 要 3–8 ────────────────────────────────────────────────
 *
 * 三条候选一条条查（都用 grep 验过，全表 0 条的不编）：
 *
 *   铟片      `mat/indium` **全表 0 条**（`mask-repair.ts` 第 52 行原话：gallium、
 *             indium、bismuth、antimony 一条都没有）。铟从锌渣提，铅锌链没建这一段。
 *   硅脂      要硅油（PDMS）→ 甲基氯硅烷 → 硅 + 甲基氯。本层没有有机硅链。
 *   石墨片    `mat/graphite` **全表 0 条**，而且不是待办：石墨化要 2 500–3 000 °C，
 *             本层天花板是 `plant/atmosphere-furnace` 的 2 000 °C。差 500 K。
 *
 * 所以 TIM 只有两条路，都落在同一格"导热填料 + 粘结剂"上：
 *
 *   **SnAg 焊料片**（`make/tim-solder`）  k = **45–55**，最好
 *     25 µm 层热阻 25e−6/50 = **5.0×10⁻⁷ m²K/W**
 *     3 W 的热流摊在 30×30 mm 上（q″ = 3.33 kW/m²）→ ΔT = **1.7 K**
 *     代价：SnAg 的 CTE 22 vs 硅 2.6，差 8.5 倍 → 热循环会把 die 边角拉裂，
 *     所以**盖必须 ≥ 0.4 mm**（第 ⑤ 问：盖是热扩散层，也是应力扩散层）
 *
 *   **银填充酚醛**（`make/tim-silver-epoxy`）  k = **3–4**，刚好落在 3–8 的下限
 *     银 80 wt% = (80/10.5)/((80/10.5)+(20/1.25)) = **32 vol%**，
 *     球状银的渗流阈值在 50–60 vol%，片状银在 25–30 vol% —— 我们只有球磨片，
 *     刚过渗流，所以 3–4 而不是 8。工业银胶（75–85 wt%）正是这个数。
 *     25 µm 层热阻 25e−6/3.5 = **7.1×10⁻⁶ m²K/W** → ΔT = **24 K**
 *
 *   **氧化铝填充酚醛** k = 1.06（Maxwell，φ=0.6、k_f=30、k_m=0.2）—— **不够 3**，
 *   只能给 < 1 W 的器件（力/编码器 ASIC、晶振），不给主控 SoC。
 *
 *   结论：**主控 SoC 用 SnAg 焊料片（k 50，ΔT 1.7 K）；MCU/ASIC 用银胶（k 3.5，ΔT 24 K）。
 *   石墨片与铟片是升级方向，本层差 500 K 炉温 / 一条锌渣提铟线。**
 *
 * ── ⑤ 翘曲：回流温度下 < 100 µm，否则焊球开路 ───────────────────────────
 *
 * 双金属公式（Timoshenko），κ = 6ΔαΔT(1+n)² / [h(3(1+n)² + (1+nm)(n²+1/(nm)))]，
 * n = t₁/t₂、m = E₁/E₂、h = t₁+t₂，拱度 w = κL²/8，L = 30 mm，ΔT = 220−25 = 195 K。
 *
 *   **盖（铜 0.5 mm，E 120）压在基板（0.3 mm，E 20，α 15）上：**
 *     Δα = 17 − 15 = 2 ppm/K → κ = 0.393 /m → R = 2.55 m → **w = 44 µm** ✓
 *   **盖厚 0.4 mm** → w = **61 µm** ✓ ；**盖厚 0.25 mm** → w = **104 µm** ✗
 *     （盖越薄越翘 —— 因为它不再是"刚性主导层"，反而被基板拖着走）
 *   **die（硅 0.1 mm，α 2.6）压在基板上：** Δα = 12.4 → 2 mm 见方上 w = **4.5 µm**
 *     —— **die 项根本不是问题，因为它只有 2 mm**。这与直觉相反，但算式如此。
 *   **单边积层（6 层铜 72 µm 只在一边）：** Δα = 2 → **w = 169 µm** ✗
 *   **无填料（α 60）：** 盖项 Δα = 43 → **w = 949 µm** ✗（21.5 倍）
 *
 *   所以"能不能焊"的答案不是"填料够不够"，是**三者同时**：
 *     对称积层（每边层数相同）+ 60 wt% 石英 + 盖 ≥ 0.45 mm → **44–52 µm，余量 1.9 倍** ✓
 *   缺任何一条：
 *     缺对称 → 169 µm（3.8 倍超线）
 *     缺填料 → 949 µm（21.5 倍超线）
 *     盖 0.25 mm → 104 µm（刚超线）
 *     → 所以盖的规格写成 **0.45–0.50 mm**，交付窗口写成 **warpage ≤ 52**（0.45 那一端的数）
 *
 *   ⚠️ 回流温度（260 °C）本身**不是**最危险的温区：那时基板在 Tg（~175 °C）以上，
 *   E 从 20 GPa 掉到 0.5 GPa，翘曲反而降到 **39 µm**。危险的是 **Tg 附近那 40 K**：
 *   模量还没掉、α 已经开始涨，焊点在 217→175 °C 这一段要吃掉相对位移。
 *   本层量不了这个 —— 没有阴影云纹 / 热机械分析（第三节降级 ⑫）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、三族各自的结论（能做到哪一代）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   **FCBGA** —— 形状全对、规模差 5 倍。
 *     倒装 ✓、球阵列 ✓、有机基板 ✓、铜盖 + TIM ✓、底填 ✓
 *     0.8 mm 球距（2026 是 0.4–0.8，**踩上限**）、196 球（2026 是 1000+，**差 5 倍**）、
 *     8 层（2026 是 8–12，**踩下限**）、10 µm 线宽（2026 是 10 µm，**打平**）。
 *     **卡点只有一个：微通孔。** 机械钻最小 0.15 mm，落在 0.8 mm 球距上是"两个球
 *     之间刚好过一个孔 + 一个环"（0.3 mm 通道），再密就扇不出。1000 球要
 *     50 µm 激光孔，本层没有激光钻孔机。
 *     判决：**FCPGA 级别的"小 FCBGA"（< 300 球），不是 2026 的主控封装。**
 *
 *   **QFN / LQFP** —— 形状对了，脚距差 2.5 倍。
 *     `std/lead-frame-general` 的脚距是 **1.27 mm**（`make/lead-frame` 的 gives：
 *     1.27±0.02、悬臂平直度 < 0.05 mm）。用同一套框做 QFN 的"无引脚化"
 *     （背面磨到露焊盘 + 侧壁半蚀 + 镀锡）与 LQFP 的鸥翼成形，几何上都成立，
 *     但 0.5 mm 脚距要的是 **0.02 mm** 的悬臂平直度 —— 冲模是 5 µm 级够，
 *     送料步距的 ±0.02 mm 重复性不够。
 *     判决：**PQFP-44（1.27 mm）级别；不是 2026 的 QFN-48（0.5 mm）。**
 *
 *   **LGA / 陶瓷 QFN** —— 这一族最接近可用。
 *     96 % 氧化铝生坯流延 + 3 层叠压 + 1 500–1 600 °C 烧结，
 *     铜厚膜 900 °C 在 `plant/atmosphere-furnace` 的 **0–50 ppm 氧**里烧 ——
 *     这是全文件唯一一处真的用上"无氧炉"的地方。
 *     0.8 mm 焊盘阵列、32 脚、不气密（封盖用酚醛，玻璃封接要 N₂ 而炉子最低 600 °C）。
 *     判决：**力/编码器 ASIC 的 LGA 可用；气密版差一堵"600 °C 以下的无氧炉"的墙。**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、降级与升级（R8：每处降级都写升级路线与差多少）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ┌──┬────────────────────────┬──────────────┬──────────────────────────┬──────┐
 *   │# │降级（本层）            │现在的数      │升级要什么                │差    │
 *   ├──┼────────────────────────┼──────────────┼──────────────────────────┼──────┤
 *   │① │基板 8 层 ← 12 层       │层压 8 次     │一台 2–4 MPa 的层压机     │1.5×  │
 *   │  │                        │翘曲 50 µm    │（现借高压釜，下限 10 MPa）│      │
 *   │② │线宽 10 µm ← 5 µm       │镀层狗骨 ±3 µm│UV 激光钻孔 φ50 µm        │2×    │
 *   │③ │球距 0.8 ← 0.4 mm       │机械孔 0.15 mm│激光孔 50 µm              │2×    │
 *   │  │球数 196 ← 1000+        │              │同上                      │5×    │
 *   │④ │凸点 100 µm ← 40 µm     │50 µm 厚胶模  │干膜 + 步进曝光           │2.5×  │
 *   │⑤ │基板吸水 1.5 %          │回流爆米花    │环氧（要双酚 A → 丙酮链） │5×    │
 *   │⑥ │底填 90 °C 上胶         │128 mPa·s     │脂环族环氧 <10 mPa·s      │13×   │
 *   │⑦ │TIM 3–4 ← 8 W/(m·K)     │银 80 wt%     │石墨片（2 500 °C）或铟片  │2.3×  │
 *   │⑧ │QFN 1.27 mm ← 0.5 mm    │送料 ±0.02 mm │0.5 mm 冲模 + 平直度 0.02 │2.5×  │
 *   │⑨ │LGA 非气密 ← 气密       │玻璃封接 480  │600 °C 以下的无氧炉       │一堵墙│
 *   │⑩ │回流在空气里 ← N₂       │炉子下限 600  │同上                      │一堵墙│
 *   │⑪ │电测抽检 5 % ← 100 %    │392 次/片 1.1 h│探针台                   │20×   │
 *   │⑫ │共面度量 5 颗 ← 全测    │比较仪单点    │白光干涉 / 阴影云纹       │20×   │
 *   └──┴────────────────────────┴──────────────┴──────────────────────────┴──────┘
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、本文件碰到"要测氧"的三处
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本层没有测氧的手段（#23）。封装这一段对氧**特别敏感**，三处，都照实写：
 *
 *   ① **焊点氧化 —— 无氧与回温区不重叠，这是本文件最硬的一堵墙。**
 *      `plant/atmosphere-furnace` 能维持 **0–50 ppm 氧**，但它最低 **600 °C**；
 *      而回流峰温是 **245–260 °C**。两个窗口**零重叠**。
 *      → 回流只能在 `plant/resistance-furnace` 的**空气**里做，焊点必长 5–10 nm SnO₂。
 *      本层**没有松香助焊剂**（松香要松树，火星没有生物），替代品是
 *      `mat/flux-zinc-chloride`（ZnCl₂ 28–32 wt% 水溶液，`data/material/solder.ts`）——
 *      它是水基无机盐，**焊后必须洗**；而 BGA 球阵底下洗不干净（水进得去、出不来）。
 *      所以能用它的只有开放面（凸点回流、焊盘预镀），植球那一格靠"刚镀的新鲜锡面
 *      + 4 h 内回流"的工序纪律。**纪律比材料脆 —— 这一句是本文件最不放心的一处。**
 *      而氧化膜有多厚、炉里到底几个 ppm —— **读不出来**（#23）。
 *
 *   ② **底填固化。** 150–165 °C × 60 min 在空气里做；酚醛固化**放缩合水**
 *      （每 mol 羟甲基放 1 mol H₂O，本文件一批 ~3.5 kg），水汽要从 28 µm 的
 *      间隙里走出去 —— 走不掉就是空洞（void）。判据本来该是 X 光或超声 C 扫描，
 *      本层两样都没有，**只能看外观**。#23 的同一类。
 *
 *   ③ **陶瓷基板的铜厚膜 900 °C 烧成。** 这一处**真的**用上了无氧炉：
 *      Cu/Cu₂O 平衡要求 **< 10 ppm**，炉子给 0–50 ppm，**差 5 倍**，
 *      铜会轻微氧化 —— 方阻涨 15 %，但附着力反而变好（界面长出 CuAlO₂ 尖晶石）。
 *      仍然：50 ppm 是**标称值**，实测不了。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、已知缺口（不是"暂未实现"，是"卡在哪一步"）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **球磨机没有。** 石英粉分级到 d99 < 5 µm 要球磨 8 h，本层只能用
 *      "衬陶瓷滚筒 + 刚玉球 + 机器人转"，转速不可控（60–80 rpm 靠手拨），
 *      一批的 d50 在 2.5–4 µm 之间跳。升级：一台球磨机（几十块砖的活，不是难事）。
 *   ② **激光钻孔机没有。** 见降级 ③。82 台里最接近的是 `plant/laser-stage`
 *      （它是曝光台，不是钻机）。
 *   ③ **探针台没有。** 见降级 ⑪。196 球 × 2 = 392 次接触，机器人手持探针一次 10 s。
 *   ④ **阴影云纹 / 热机械分析没有。** 见降级 ⑫。翘曲只在室温、只在 5 个点上量。
 *   ⑤ **SMD 3225 晶振不在本文件。** 它是 `std/quartz-resonator-general`
 *      （`data/material/quartz-crystal.ts`），陶瓷壳同 LGA 一族，但 3.2×2.5 mm
 *      的瓷壳要 0.2 mm 厚的生坯流延，本层的刮刀做不到那个厚度均匀性。
 *   ⑥ **焊料链是并行分支上的**（`data/material/solder.ts` / `data/machine/reflow.ts`）。
 *      本文件用的是 `mat/solder-ball`、`mat/solder-paste`、`mat/flux-zinc-chloride`
 *      三个 id（都已在那份文件里定义）。**每一处引用都写了 OR 分支**，另一支是
 *      `mat/tin` —— 物理上真的能替代（自己回熔成球），只是球高公差翻倍。
 *      若那份文件未并入，删掉第一支即可，不影响任何其它条目。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目（10 个）
// ═══════════════════════════════════════════════════════════════════════════

export const PCBPKG_ITEMS: readonly Item[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1.1 FCBGA 族：凸点、底填、基板、盖、TIM
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * C4 微凸点（controlled collapse chip connection）。**一颗** SnAg3.5 焊点，
   * 30–50 µm 高、50 µm 粗，立在 die 的焊盘上。
   *
   * 它不是"一坨锡" —— 它是**一个已经成球、已经压平、已经知道共面度有多少的几何体**。
   * 这三件事各占一道工序（电镀 → 回流 → 压平），见 `make/flip-chip-microbump`。
   *
   * 为什么按"颗"计而不按 kg：一颗只有 **5.7×10⁻¹⁰ kg**（ρ7 300、φ50×40 µm 圆柱），
   * 一片 die 100 颗、一片 φ100 晶圆 1.5 万颗。按 kg 记的话每一个数都要写七位小数。
   *
   * 三个属性就是三道工序的产出：
   *   `ballPitch`    80–100 µm —— 被厚胶模的孔径与 AR 决定（文件头一·②）
   *   `height`       30–50 µm —— 被镀层厚度决定（38 µm 的锡 + 1.4 µm 的银）
   *   `coplanarity`  ≤ 5 µm  —— 被电镀均匀性 + 压平决定（±2 µm，余量 2.5 倍）
   */
  {
    id: 'mat/flip-chip-microbump',
    name: 'C4 Microbump', name_zh: 'C4 微凸点',
    unit: '颗',
    category: 'material',
    props: [
      { param: 'ballPitch', kind: 'range', min: 0, max: 2, unit: 'mm', dir: 'atMost' },
      { param: 'height', kind: 'range', min: 0, max: 200, unit: 'µm' },
      { param: 'coplanarity', kind: 'range', min: 0, max: 50, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * 底部填充胶（underfill）。酚醛 resol + 60 wt% 石英粉。
   *
   * 它干的事只有一件：**把焊点从"点连接"变成"整片胶粘接"**。焊点自己承不住
   * 硅与基板的 CTE 差（12.4 ppm/K，195 K 上是 0.24 % 应变），胶把它摊到整个
   * die 面上，焊点的应变掉一个量级。
   *
   * 工业配方是脂环族环氧 + 硅微粉，黏度 10–20 Pa·s（25 °C）。本层没有环氧，
   * 所以是酚醛 resol —— **一个必须加热才流得动的胶**：
   *
   *   25 °C  1 200 mPa·s   ← 流不动，28 µm 的间隙要 6 min
   *   90 °C  **128 mPa·s** ← 含 60 wt% 填料，30 s 流满（文件头一·③ 的 Washburn 算式）
   *
   * `viscosity` 这个属性记的是**上胶温度（90 °C）的值**。25 °C 的 1 200 写不进来
   * —— 一个属性只有一个窗口，两个温度两个值，模型表达不了。这是模型的一处缺口，
   * 不是数据的缺口（第 ⑤ 节缺口表里没有它，因为它不影响任何判据：判据是 90 °C 下 30 s）。
   *
   * `fillerSize` ≤ 5 µm 是**分级分出来的**，不是磨出来的（文件头一·③ 的 Stokes 算式）。
   */
  {
    id: 'mat/underfill',
    name: 'Underfill', name_zh: '底部填充胶',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'viscosity', kind: 'range', min: 10, max: 5000, unit: 'mPa·s', dir: 'atMost' },
      { param: 'fillerSize', kind: 'range', min: 0, max: 50, unit: 'µm', dir: 'atMost' },
      { param: 'cte', kind: 'range', min: 0, max: 100, unit: 'ppm/K', dir: 'atMost' },
    ],
  },

  /**
   * 有机封装基板（build-up substrate），8 层、0.3 mm 厚、10 µm 线宽。
   *
   * 规格号写进名字（`-8l`）—— 标准件的规格写在名字里。
   * **层数是这件东西的第一规格**：它决定了"能不能扇出 196 个球"，
   * 而不是决定了"贵不贵"。
   *
   * 结构（对称，这是第 ⑤ 问的硬要求）：
   *
   *   建层 3（Cu 12 µm + 介质 30 µm）
   *   建层 2
   *   建层 1
   *   ── 芯板 0.1 mm（玻璃布 + 酚醛，两面各 1 层铜）──
   *   建层 1
   *   建层 2
   *   建层 3
   *
   *   总厚 = 2 × (3×30) + 100 + 8×12 ≈ **0.28–0.32 mm** ✓
   *
   * 为什么每边恰好 3 层：**扇出 10 行 100 µm 间距的凸点到 0.8 mm 球网格，
   * 每层只能走 2 行**（150 µm 的孔 + 环占掉 0.3 mm 通道）。10 行 ÷ 2 = 5 层，
   * 加 2 层电源地 + 1 层芯 = **8 层**。这个数字是从扇出算出来的，不是抄的。
   */
  {
    id: 'std/build-up-substrate-8l',
    name: 'Organic Package Substrate', name_zh: '有机封装基板',
    unit: '件',
    category: 'part',
    props: [
      { param: 'layers', kind: 'range', min: 1, max: 20, unit: '层', dir: 'atLeast' },
      { param: 'lineWidth', kind: 'range', min: 0, max: 200, unit: 'µm', dir: 'atMost' },
      { param: 'thickness', kind: 'range', min: 0, max: 2, unit: 'mm' },
      { param: 'warpage', kind: 'range', min: 0, max: 500, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * 铜盖（heat spreader / lid）。0.4–0.5 mm 电解铜板冲压成帽，镀锡 0.5 µm 防氧化。
   *
   * 它同时是三样东西：
   *   ① **热扩散层** —— 2 mm² 的 die 上 3 W 的密度是 1.5 MW/m²，
   *      不摊开的话 TIM 那一层就能吃掉 20 K；摊到 30×30 mm 上降到 3.3 kW/m²
   *   ② **应力扩散层** —— SnAg TIM 的 CTE 22 与硅 2.6 差 8.5 倍
   *   ③ **机械保护** —— 没有它，100 µm 的 die 一夹就碎（`package.ts` 的第一句话）
   *
   * **厚度是翘曲的旋钮，而且方向反直觉**（文件头一·⑤）：
   *   0.5 mm → 44 µm ✓ ；0.45 mm → 52 µm ✓ ；0.4 mm → 61 µm ；0.25 mm → 104 µm ✗
   * 越厚越不翘 —— 因为它成了刚性主导层，薄基板反而去贴它。
   * 所以规格是 **0.45–0.50 mm**（冲模按 0.5 配、公差 ±0.05），
   * 不是"越薄越好"（薄是为了省铜，本层不缺铜）。
   */
  {
    id: 'std/copper-lid-general',
    name: 'Copper Lid', name_zh: '铜盖',
    unit: '件',
    category: 'part',
    props: [
      { param: 'thickness', kind: 'range', min: 0, max: 2, unit: 'mm' },
      { param: 'flatness', kind: 'range', min: 0, max: 200, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * 导热界面材料（TIM）。**一个条目、两条路线**，k 差 13 倍，用途完全分开。
   *
   *   `make/tim-solder`        SnAg 焊料片，k = 45–55 → 主控 SoC（3 W）
   *   `make/tim-silver-epoxy`  银 80 wt% 酚醛，k = 3–4  → MCU / ASIC（< 1 W）
   *
   * 两条都落在"金属填料 + 粘结剂"，因为三条更好的路全断了（文件头一·④）：
   * 铟（全表 0 条）、硅脂（没有有机硅链）、石墨片（要 2 500 °C，本层 2 000）。
   *
   * `conductivity` 的下限就是判据 3 W/(m·K)：**银胶 3–4 刚过线，氧化铝填充的 1.06 不过**。
   * 这个数不是一个"等级"，是一条**门槛** —— 过线的两条路，不过线的那条不许用。
   */
  {
    id: 'mat/thermal-interface',
    name: 'Thermal Interface Material', name_zh: '导热界面材料',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'conductivity', kind: 'range', min: 0, max: 500, unit: 'W/(m·K)', dir: 'atLeast' },
      { param: 'cte', kind: 'range', min: 0, max: 100, unit: 'ppm/K', dir: 'atMost' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 1.2 陶瓷族：LGA 的基板
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 陶瓷基板（96 % 氧化铝，3 层，厚膜铜）。7×7 mm 见方，给力/编码器 ASIC 用。
   *
   * 它不是"便宜的有机基板"，它是**另一种物理**：
   *
   *   有机基板    CTE 15、Dk 4.0、吸水 1.5 %、靠电镀做线
   *   96 % 氧化铝 CTE **7.5**、Dk **9**、吸水 **0**、靠丝网印刷做线
   *
   * 三处因此反过来了：
   *   ① **CTE 7.5 比有机基板的 15 更接近硅的 2.6** —— 大芯片反而该用陶瓷；
   *      我们不用，是因为陶瓷做不大（生坯流延 7×7 mm 是舒适区，30×30 会翘 40 µm）
   *   ② **Dk 9 太高**，10 MHz 以上就开始吃信号 —— 所以它只给模拟前端
   *      （力/编码器 ASIC 是 1 MHz 以下的电荷放大器）
   *   ③ **不吸水** —— 回流时没有爆米花，这一条是陶瓷对有机基板的唯一绝对优势
   *
   * 厚膜铜的线宽是 **200 µm**，不是 10 µm：丝网印刷的分辨率上限是网目
   * （325 目 = 46 µm 丝径），浆料还会流平。想细，要薄膜工艺（那要真空镀 + 光刻，
   * 本层有 `plant/evaporator` 但没有陶瓷上的薄膜光刻线）。
   */
  {
    id: 'std/ceramic-substrate-3l',
    name: 'Ceramic Substrate', name_zh: '陶瓷基板',
    unit: '件',
    category: 'part',
    props: [
      { param: 'layers', kind: 'range', min: 1, max: 20, unit: '层', dir: 'atLeast' },
      { param: 'lineWidth', kind: 'range', min: 0, max: 500, unit: 'µm', dir: 'atMost' },
      { param: 'warpage', kind: 'range', min: 0, max: 500, unit: 'µm', dir: 'atMost' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 1.3 三族的成品（+ 一条 LQFP，因为 QFN 与 LQFP 是同一套框的两种成形）
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * FCBGA 封装成品。**本文件的主角** —— 一块 15×15 mm 的板子，上面倒装一颗
   * 2 mm 的 32 位 CPU，底下 196 个 0.8 mm 的锡球，顶上扣一片 0.5 mm 的铜盖。
   *
   * 五个规格就是五道墙（文件头二）：
   *
   *   ballPitch   0.8 mm   2026 是 0.4–0.8 → **踩上限**
   *   ballCount   196      2026 是 1000+   → **差 5 倍**（卡在 150 µm 机械孔）
   *   layers      8        2026 是 8–12    → **踩下限**
   *   lineWidth   10 µm    2026 是 10 µm   → **打平**
   *   warpage     44–52 µm < 100 µm 判据    → **余量 1.9 倍**
   *
   * 注意 warpage 这个数**不是工艺能力的上限，是三个选择凑出来的**：
   * 对称积层 + 60 wt% 石英 + 盖 0.45–0.50 mm。任改一条，这个数就跳（52 → 61 → 169 → 949）。
   * 把它写成 `gives` 而不是注释，就是为了让"改一条"的时候它会被算出来。
   */
  {
    id: 'std/fcbga-package-general',
    name: 'FCBGA Package', name_zh: 'FCBGA 封装成品',
    unit: '片',
    category: 'part',
    props: [
      { param: 'ballPitch', kind: 'range', min: 0, max: 2, unit: 'mm', dir: 'atMost' },
      { param: 'ballCount', kind: 'range', min: 1, max: 5000, unit: '个', dir: 'atLeast' },
      { param: 'layers', kind: 'range', min: 1, max: 20, unit: '层', dir: 'atLeast' },
      { param: 'lineWidth', kind: 'range', min: 0, max: 200, unit: 'µm', dir: 'atMost' },
      { param: 'warpage', kind: 'range', min: 0, max: 500, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * QFN 封装成品。**无引脚** —— 焊盘在底面，侧壁是半蚀出来的可焊面。
   *
   * 与 `std/lqfp-package-general` 是**同一套引线框的两种成形**，差别只在最后一道：
   *   QFN   背面磨到露焊盘、侧面半蚀、侧壁镀锡 → 贴板面积 = 本体面积
   *   LQFP  引脚弯成鸥翼、伸出本体 1 mm → 贴板面积 = 本体 + 4×1 mm，但焊点看得见
   *
   * 判据 `pinPitch ≤ 1.27 mm` 这个数看着难看（2026 是 0.5），但它**是对的**：
   * 它精确地记着"本层只有 1.27 mm 的引线框"。写 0.5 会让下游以为能做 0.5 —— 
   * 那是把降级藏起来，不是把能力写下来。
   */
  {
    id: 'std/qfn-package-general',
    name: 'QFN Package', name_zh: 'QFN 封装成品',
    unit: '片',
    category: 'part',
    props: [
      { param: 'pinPitch', kind: 'range', min: 0, max: 3, unit: 'mm', dir: 'atMost' },
      { param: 'pinCount', kind: 'range', min: 1, max: 300, unit: '个', dir: 'atLeast' },
      { param: 'warpage', kind: 'range', min: 0, max: 500, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * LQFP 封装成品。鸥翼引脚伸出本体，**焊点看得见** —— 这一条在显微镜下就能
   * 判"焊没焊上"，而 QFN 与 BGA 都要 X 光。本层没有 X 光。
   *
   * 所以 LQFP 在本层的真实地位比它在 2026 的地位高得多：
   * 它不是"落后的封装"，它是**唯一一种肉眼可检的封装**。
   * 32 脚、1.27 mm 脚距、能返修 —— 力/编码器的 ASIC 用 LGA，关节 MCU 用 LQFP，
   * 主控才用 FCBGA，这个分工有一半是被"检具"逼出来的，不是被性能。
   */
  {
    id: 'std/lqfp-package-general',
    name: 'LQFP Package', name_zh: 'LQFP 封装成品',
    unit: '片',
    category: 'part',
    props: [
      { param: 'pinPitch', kind: 'range', min: 0, max: 3, unit: 'mm', dir: 'atMost' },
      { param: 'pinCount', kind: 'range', min: 1, max: 300, unit: '个', dir: 'atLeast' },
      { param: 'warpage', kind: 'range', min: 0, max: 500, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * LGA 封装成品。陶瓷基板 + **底部焊盘阵列（不是球）** + 酚醛封盖。
   *
   * 为什么不是球：球要植球 + 回流，而陶瓷基板的热容是 FR-4 的 3 倍，
   * 植球回流的峰值温度要 +15 K，焊球就氧化了（没有 N₂，见 #23）。焊盘不用熔化 ——
   * **焊盘是被板子上的焊膏焊的，不是被自己焊的。** 这一句就是 LGA 存在的全部理由。
   *
   * `warpage ≤ 25 µm`：陶瓷不是"更平"，是**不吸水**。回流的翘曲一半来自水汽，
   * 陶瓷那一半是零，所以它能进 25 µm 而有机基板只能进 44 µm。
   */
  {
    id: 'std/lga-package-general',
    name: 'LGA Package', name_zh: 'LGA 封装成品',
    unit: '片',
    category: 'part',
    props: [
      { param: 'pinPitch', kind: 'range', min: 0, max: 3, unit: 'mm', dir: 'atMost' },
      { param: 'pinCount', kind: 'range', min: 1, max: 300, unit: '个', dir: 'atLeast' },
      { param: 'layers', kind: 'range', min: 1, max: 20, unit: '层', dir: 'atLeast' },
      { param: 'warpage', kind: 'range', min: 0, max: 500, unit: 'µm', dir: 'atMost' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线（12 条）
// ═══════════════════════════════════════════════════════════════════════════

export const PCBPKG_ROUTES: readonly Route[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 2.1 辅料一：底部填充胶
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 底部填充胶：球磨 → Stokes 分级 → 配胶 → 真空脱泡 → 灌装。
     *
     *   酚醛 40 + 石英 60 + 水 20 → 底填胶 100
     *
     * 三步都是"把一件事推到极限"，纸面上看不出难：
     *
     *   ① **磨**   石英砂 → d50 3 µm。**本层没有球磨机**（缺口①），用衬陶瓷滚筒 +
     *              刚玉球，机器人转 8 h。d50 好办，d99 不好办：球磨的粒度分布
     *              是 Rosin–Rammler，尾巴拖到 15–20 µm。
     *   ② **分**   Stokes 沉降：5 µm 的石英在水里沉 1 cm 要 **613 s**，
     *              15 µm 的只要 **68 s**。所以静置 10 min 后取上清液 = d99 < 5 µm。
     *              **这一格才是这道工序的真身** —— 磨是 8 小时的手，分是 10 分钟的钟。
     *              代价写在这里：只有约 30 % 的粉进成品，其余回磨。
     *   ③ **脱**   真空 0.5–5 kPa 抽 2 h。加热到 80 °C 会快 10 倍，但**没有一台设备
     *              能同时给 80 °C 与 1 kPa**（`plant/evaporator` 只管压力、
     *              `plant/resistance-furnace` 只管温度，而温度下限 100 °C）。
     *              所以是**冷抽**，黏度 1 200 mPa·s，气泡往上爬的速度 ∝ 1/η
     *              —— 这一点是本文件降级 ⑥ 的一半。
     */
    id: 'make/underfill',
    name: 'Underfill Production', name_zh: '底部填充胶制备',
    produces: [
      {
        item: 'mat/underfill',
        qty: q(100),
        gives: [
          { param: 'viscosity', kind: 'range', min: 100, max: 160, dir: 'atMost' },
          { param: 'fillerSize', kind: 'range', max: 5, dir: 'atMost' },
          { param: 'cte', kind: 'range', min: 12, max: 20, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(40) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(60) }] },
      // 配胶的水在 80 °C 脱泡与固化时走掉；酚醛缩聚本身再放 3.5 kg 缩合水。
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(16) },
    steps: [
      {
        note_zh:
          '① 球磨 8 h：石英砂 → d50 3 µm（**本层没有球磨机**，衬陶瓷滚筒 + 刚玉球，机器人手拨 60–80 rpm，d50 在 2.5–4 µm 之间跳 —— 缺口①）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '② Stokes 分级：水稀释后静置 10 min 取上清（5 µm 沉 613 s、15 µm 沉 68 s）→ 只有约 30 % 的粉进成品，其余回磨；这是本工序的真正瓶颈',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          // 0.6 kPa 下水在 0.01 °C 就开 —— 分级槽必须是加压的
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '③ 配胶：酚醛 40 + 分级石英 60 + 水 20，搅 2 h。60 wt% = 46 vol%，黏度按 Einstein + 拥挤抬 4 倍',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 40, max: 60 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '④ 真空脱泡 0.5–5 kPa × 2 h：**冷抽**（没有一台设备能同时给 80 °C 与 1 kPa），黏度 1 200 mPa·s 时气泡上浮慢 10 倍 —— 这是降级⑥的一半',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.5, max: 5 }],
      },
      {
        note_zh: '⑤ 灌装 200 g/支（90 °C 凝胶时间 30 min，所以是小支不是大桶）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '酚醛 40 + 石英 60 + 水 20 = 120 → 底填胶 100；余 20 是配胶水在 80 °C 脱泡时走掉（酚醛缩聚另有 3.5 kg 缩合水，也走掉，未登条目）',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.2 辅料二：TIM（两条路线，k 差 13 倍）
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * SnAg 焊料片 TIM：熔炼 → 铸片 → 冲切 → 表面处理。
     *
     *   锡 96.5 + 银 3.5 → TIM 100
     *
     * 96.5 : 3.5 是 SnAg 的共晶比（熔点 221 °C，比 SAC305 的 217 高 4 K，
     * 但少一味铜 —— 本层的铜要留给导线，而且 Cu₆Sn₅ 的脆性层在这里是负担）。
     *
     * **铸造，不是轧制。** 25 µm 的箔要轧六道，而每一道都要退火、都会氧化；
     * 铸一片 25 µm 厚的模不但一步到位，**而且它必须是 25 µm** ——
     * 热阻 R = t/k，t 是从 25 起的，不是从 50 起的（50 µm 时 ΔT 从 1.7 K 变 3.4 K）。
     *
     * ⚠️ SnAg 的 CTE 22 vs 硅 2.6 差 8.5 倍。这不是可以忽略的：
     *   Δα·ΔT = 19.4e−6 × 195 = 0.38 % 应变，锡的屈服应变 0.2 % → **必然塑性变形**。
     *   工业上靠"薄 + 盖当应力扩散层"两件事吸收，本层同样靠这两件（文件头一·④）。
     */
    id: 'make/tim-solder',
    name: 'SnAg Solder Sheet TIM Production', name_zh: 'SnAg 焊料片 TIM 制备',
    produces: [
      {
        item: 'mat/thermal-interface',
        qty: q(100),
        gives: [
          { param: 'conductivity', kind: 'range', min: 45, max: 55, dir: 'atLeast' },
          { param: 'cte', kind: 'range', min: 20, max: 24, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/tin', qty: q(965, 10) }] },
      { anyOf: [{ item: 'mat/silver', qty: q(7, 2) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(10) },
    steps: [
      {
        note_zh:
          '① 熔炼 380–420 °C 并保温 1 h（锡 232、银 962，380 足够互溶；**用电阻炉不用熔炼炉** —— 熔炼炉下限 1 200 会把银烧成渣）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 380, max: 420 }],
      },
      {
        note_zh: '② 铸 25 µm 片（石墨模预热 200 °C，浇完立刻水冷 —— 冷速决定晶粒，晶粒决定 k）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '③ 冲切成 30×30 mm 方片（`std/stamping-die-general` 的 5 µm 模，冲 25 µm 箔是它最轻松的活）',
        performedBy: 'plant/press',
      },
      {
        note_zh: '④ 两面对研到 25.0 ± 0.5 µm 并除氧化皮（刮，不是酸洗 —— 酸洗会留氢）',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '⑤ 检厚度与平面度（比较仪 + 量块），检完立刻真空封装 —— 新鲜锡面 4 h 就长氧化膜',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '锡 96.5 + 银 3.5 + 氮 0.01 = 100.01 → TIM 100；那 0.01 kg 氮是熔炼与浇铸的覆盖气，随排气走（造 500 000 片的用量，每片 0.2 g）',
  },

  {
    /**
     * 银填充酚醛 TIM：银粉球磨 → 三辊研磨 → 混胶 → 脱泡。
     *
     *   酚醛 20 + 银 80 → TIM 100
     *
     * 80 wt% 银 = **32 vol%**（ρ 10.5 / 1.25）。这个数不是随便选的 —— 它是
     * **渗流阈值之上、又刚刚好**的那个点：
     *
     *   球状银   渗流在 50–60 vol% → 32 vol% 不导通
     *   片状银   渗流在 25–30 vol% → 32 vol% **刚过线**
     *
     * 所以银粉必须是**片**不是球：球磨 12 h 把 1 µm 的球磨成 0.1 µm 厚、5 µm 宽的片。
     * 磨不出来就是绝缘体（0.2 W/(m·K)，比不加还差，因为它去掉了酚醛的流动）。
     *
     * k = 3–4 对 3 W/(m·K) 的判据只有 1.2 倍余量 —— **这一条是本次全文件里
     * 余量最小的一格**。它只配给 < 1 W 的器件：力/编码器 ASIC（0.3 W）、
     * 晶振（0.02 W）。主控 SoC 的 3 W 必须用 `make/tim-solder`。
     */
    id: 'make/tim-silver-epoxy',
    name: 'Silver-Filled Phenolic TIM Production', name_zh: '银填充酚醛 TIM 制备',
    produces: [
      {
        item: 'mat/thermal-interface',
        qty: q(100),
        gives: [
          { param: 'conductivity', kind: 'range', min: 3, max: 4, dir: 'atLeast' },
          { param: 'cte', kind: 'range', min: 28, max: 40, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(20) }] },
      { anyOf: [{ item: 'mat/silver', qty: q(80) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(20) },
    steps: [
      {
        note_zh:
          '① 银粉球磨 12 h：1 µm 球 → 0.1 µm 厚 × 5 µm 宽的片（**片才是导电的**；球状银在 32 vol% 不渗流）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '② 三辊研磨 3 遍：银片与酚醛润湿、破团聚（团聚的片不导电）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '③ 真空脱泡 0.5–5 kPa × 3 h（黏度 40 Pa·s，比底填还稠 100 倍）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.5, max: 5 }],
      },
      {
        note_zh: '④ 灌装 20 g/支（银胶一次用不完就废 —— 90 °C 开始固化）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.3 FCBGA：基板、凸点、盖
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 有机封装基板（8 层 build-up）：芯板层压 → 三次积层 → 钻微通孔 → 图形 → 电镀。
     *
     *   铜 50 g + 酚醛 20 g + 石英 33 g + 玻璃布 20 g + 光刻胶 10 g → 基板 10 件
     *
     * 每边三次积层，每次五道工序（介质 → 钻孔 → 光刻 → 电镀 → 去胶闪蚀），
     * 三次是 15 道。这里写成 8 道（把三次积层合并叙述），因为**每一层做的事完全一样**，
     * 三次的差别只是"这次钻的孔在哪儿"。
     *
     * ── 三处非做不可的选择 ────────────────────────────────────────────────
     *
     *   ① **半加成（SAP），不是减成。** 减成法要先铺满铜再蚀掉 90 %，
     *      侧蚀在 10 µm 线上是 3 µm/边 —— 直接吃掉 60 % 的线宽。
     *      SAP 是"只在要的地方长铜"，侧壁垂直，10 µm 做得出来。
     *      种子层 0.5 µm 靠**反向电解**去掉（本层没有过硫酸铵、没有氯化铁、
     *      没有双氧水+硫酸 —— 只有 HF 和硝酸，两个都会连酚醛一起啃）。
     *
     *   ② **对称积层。** 单边 6 层铜（72 µm）在 0.3 mm 板上是 **169 µm 翘曲**，
     *      判据 100 µm → 不能焊。对称之后铜的力两两抵消，翘曲掉回 **44 µm**。
     *      **这一条不是工艺偏好，是算式（文件头一·⑤）。**
     *
     *   ③ **孔靠机械钻，最小 0.15 mm。** 本层没有激光钻孔机（缺口②）。
     *      0.15 mm 的孔 + 0.075 mm 的环 = 0.3 mm 通道，落在 0.8 mm 球距上
     *      刚好"两个球之间过一个孔"。**这就是 196 球而不是 1000 球的原因。**
     *
     * ⚠️ 层压借 `plant/autoclave`（150–550 °C、10–35 MPa）。工业 build-up 的
     * 层压是 2–4 MPa，我们下限只有 10 MPa —— 树脂被挤出 3–5 倍，
     * 介质厚度公差从 ±8 % 掉到 **±15 %**。这是降级①。
     */
    id: 'make/build-up-substrate',
    name: 'Organic Package Substrate Manufacturing', name_zh: '有机封装基板制造',
    produces: [
      {
        item: 'std/build-up-substrate-8l',
        qty: q(10),
        gives: [
          { param: 'layers', kind: 'range', min: 8, max: 8, dir: 'atLeast' },
          { param: 'lineWidth', kind: 'range', max: 10, dir: 'atMost' },
          { param: 'thickness', kind: 'range', min: 0.28, max: 0.32 },
          // 未封装的裸基板：对称积层之后铜的力两两抵消，剩下的只有芯板与玻璃布的不对称
          { param: 'warpage', kind: 'range', max: 50, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(1, 30) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(96) },
    steps: [
      {
        note_zh:
          '① 芯板层压 180–200 °C / 10–30 MPa：玻璃布浸酚醛半固化片，两面覆 12 µm 铜箔。**借高压釜** —— 它的下限 10 MPa 是工业 build-up（2–4 MPa）的 3–5 倍，树脂挤出多，介质厚度公差 ±15 %（降级①）',
        performedBy: 'plant/autoclave',
        under: [
          { param: 'temperature', min: 180, max: 200 },
          { param: 'pressure', min: 10000, max: 30000 },
        ],
      },
      {
        note_zh:
          '② 积层介质：酚醛 + 60 wt% 石英（"本层的 ABF"）辊涂 30 µm、180 °C 半固化 30 min。Dk 4.8 对 ABF 的 3.3，吸水 1.5 % 对 0.3 % —— 后者是回流爆米花的来源（降级⑤）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 170, max: 190 }],
      },
      {
        note_zh:
          '③ 微通孔：**机械钻 φ0.15 mm**（无激光钻孔机 —— 缺口②）。主轴 2 000 rpm 时 0.15 mm 钻头的线速度只有 15.7 mm/s，工业要 100–200 mm/s，所以孔壁粗糙、崩边 20 µm',
        performedBy: 'plant/milling-machine',
      },
      {
        note_zh:
          '④ 光刻：0.13 µm 的曝光机做 10 µm 的线，是分辨率的 77 倍，这一格全篇最不缺（`plant/mask-aligner` 接触式，正胶 3 µm 厚）',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh: '⑤ 显影与清洗（重铬酸盐胶的碱显影，25 °C）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '⑥ 半加成电镀铜：0.5 µm 种子 + 12 µm 图形填充。25–35 °C、16 kPa（镀液在 0.6 kPa 下会自己沸腾）。**孔口的"狗骨"堆积让线宽公差 ±3 µm** —— 10 µm 的窗口是这么来的，不是光刻给的（降级②）',
        performedBy: 'plant/plating-bath',
        under: [
          { param: 'temperature', min: 25, max: 35 },
          { param: 'pressure', min: 15, max: 20 },
        ],
      },
      {
        note_zh:
          '⑦ 去胶 + 闪蚀 0.5 µm 种子层：**反向电解**（把种子当阳极溶掉，10 s）。本层没有过硫酸铵、没有氯化铁、没有双氧水+硫酸 —— 只有 HF 与硝酸，两个都会连酚醛一起啃',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '⑧ 重复 ②–⑦ 两次（每边三层，共 8 层），最后一次不闪蚀、直接留焊盘并在锡槽里浸 0.5 µm Sn（球下金属化）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '⑨ 检线宽与层数：比较仪读线宽（±1 µm），切片读层数（8 层，每层 30 µm 介质）',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑩ 检翘曲：放在平晶上，四角塞 50 µm 的塞尺 —— **通则合格**。这是本层唯一能做的翘曲判据（没有阴影云纹，降级⑫）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '铜 50 + 酚醛 20 + 石英 33 + 玻璃布 20 + 光刻胶 10 + 水 1 000 = 1 133 g → 基板 10 件（每件约 11 g）；余是电镀废液带走的铜（约 15 %，回收）与显影冲掉的胶',
  },

  {
    /**
     * C4 微凸点：UBM 蒸镀 → 厚胶模 → 分层电镀 → 去胶 → 回流成球 → 压平。
     *
     *   锡 1 + 银 33 g + 铜 1 + 光刻胶 1 + 水 1 → 凸点 1 000 颗
     *
     * ── 为什么是电镀不是印刷（文件头一·②的三条否）────────────────────────
     *
     *   印刷要 50 µm 钢网 → 本层轧不出（0.15 mm 是下限）→ AR 3:1 填不进去
     *   蒸发要钼掩模        → 钼链没建
     *   电镀只要 50 µm 胶模 → AR 1:1，厚胶光刻的舒适区 ✓
     *
     * ── 为什么是"分层镀"不是"共镀" ───────────────────────────────────────
     *
     * Sn-Ag 共镀要络合剂（碘化物 / 硫脲 / 吡啶），本层只有 HF、硝酸、硫酸，都不到。
     * 所以先镀 1.4 µm 的 Ag、再镀 38 µm 的 Sn，靠**回流 30 s 的互扩散**均质化：
     *
     *   √(D·t) = √(1×10⁻⁹ m²/s × 30 s) = **5.5 µm** > 1.4 µm ✓
     *
     * 30 s 足够把那一层银吃干净，出来就是 SnAg3.5。这个判据比"能不能镀"要紧得多
     * —— 吃不动的话，界面会留一层纯银，那是脆性层，剪切强度掉一半。
     *
     * ── 共面性 ±5 µm 的三笔账 ─────────────────────────────────────────────
     *
     *   镀层均匀性 ±5 %（40 µm）  → ±2 µm
     *   回流表面张力自愈          → ±2 µm
     *   压平 22 MPa（200 t/0.09 m²）→ **±2 µm**（判据 ±5，余量 2.5 倍）
     */
    id: 'make/flip-chip-microbump',
    name: 'C4 Microbump Production', name_zh: 'C4 微凸点制备',
    produces: [
      {
        item: 'mat/flip-chip-microbump',
        qty: q(1000),
        gives: [
          // 厚胶模 50 µm 孔径 + 50 µm 间距 = 100 µm 球距；本层做不到 80 以下（AR 会到 1.6）
          { param: 'ballPitch', kind: 'range', min: 0.08, max: 0.1, dir: 'atMost' },
          { param: 'height', kind: 'range', min: 30, max: 50 },
          { param: 'coplanarity', kind: 'range', max: 5, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/tin', qty: q(1) }] },
      { anyOf: [{ item: 'mat/silver', qty: q(1, 30) }] },
      // UBM：Ti 0.1 µm + Cu 0.5 µm，蒸在整片 die 面上（每片 2 mm² × 100 片 = 2 cm²）
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(12) },
    steps: [
      {
        note_zh:
          '① UBM 蒸镀：Ti 0.1 µm 粘附层 + Cu 0.5 µm 可焊层，`plant/evaporator` 的 10⁻³–10⁻² kPa 里做（蒸铜要用钨舟，1 450 °C）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh:
          '② 厚胶模：正胶甩三次成 50 µm（一次只能 15–18 µm，中间 90 °C 前烘），孔径 50 µm —— AR 1:1，厚胶光刻的舒适区',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '③ 分层电镀：先 Ag 1.4 µm（25 mA/cm²、30 min），再 Sn 38 µm（40 mA/cm²、90 min）。**不共镀** —— Sn-Ag 共镀要络合剂，本层没有',
        performedBy: 'plant/plating-bath',
        under: [
          { param: 'temperature', min: 25, max: 35 },
          { param: 'pressure', min: 15, max: 20 },
        ],
      },
      {
        note_zh: '④ 去胶 + 闪蚀掉 UBM 的铜（反向电解 10 s，只留焊点底下那一块）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '⑤ 回流 245–250 °C × 30 s：柱状锡熔成球，同时把 1.4 µm 的银吃进去（√(Dt) = 5.5 µm > 1.4 µm）。**在空气里做** —— 无氧炉下限 600 °C（文件头四·①）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 245, max: 250 }],
      },
      {
        note_zh: '⑥ 压平（coining）22 MPa：200 t 压机 / 0.09 m² 平砧。共面度从 ±3 µm 收到 **±2 µm**',
        performedBy: 'plant/press',
      },
      {
        note_zh:
          '⑦ 抽检共面度：比较仪逐颗点测，**只测 5 颗/片** —— 单点接触式量不了整面（降级⑫）',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '锡 1 000 g + 银 33 g + 铜 1 000 g + 胶 1 000 g → 凸点 1 000 颗（净重只有 0.57 mg）；**这不是配比错，是环**：1 kg 锡是镀槽阳极的起始量，够镀 1.7×10⁹ 颗，真正的配比是 Sn:Ag = 96.5:3.5；铜、胶、水同理，都是槽液与靶材',
  },

  {
    /**
     * 铜盖：冲压 → 去应力退火 → 镀锡 → 检平面度。
     *
     *   铜 1 kg + 锡 5 g → 盖 1 件（约 52 g：30×30×0.5 mm × 8.96）
     *
     * 冲压这一步看着简单，但它是**全文件唯一一处"厚度就是判据"的地方**：
     * 0.5 mm → 翘曲 44 µm、0.45 mm → 52 µm、0.4 mm → 61 µm、0.25 mm → 104 µm（超线）。
     * 所以冲模间隙按 0.45 mm 配，冲出来 **0.45–0.50 mm** 都收，
     * 但不能为了省铜冲 0.25 —— 省下的 26 g 铜会换来一整批废板子。
     *
     * 去应力退火 250 °C × 2 h 不能省：冲压的残余应力会让盖在回流时**自己拱起来**，
     * 而那正好抵消掉 TIM 的厚度均匀性。
     */
    id: 'make/copper-lid',
    name: 'Copper Lid Manufacturing', name_zh: '铜盖制造',
    produces: [
      {
        item: 'std/copper-lid-general',
        qty: q(1),
        gives: [
          { param: 'thickness', kind: 'range', min: 0.45, max: 0.5 },
          { param: 'flatness', kind: 'range', max: 20, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(1, 200) }] },
      { anyOf: [{ item: 'std/stamping-die-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① 冲压：0.5 mm 电解铜板冲成带翻边的帽，四角留 3 mm 支撑脚（支撑脚高 0.3 mm = TIM 的厚度 + 0.05 的余量）',
        performedBy: 'plant/press',
      },
      {
        note_zh: '② 去应力退火 250 °C × 2 h 随炉冷（不去应力，盖会在回流时自己拱起来，正好抵消 TIM 的均匀性）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 230, max: 260 }],
      },
      {
        note_zh: '③ 镀锡 0.5 µm（防氧化；不镀镍 —— 镍链堵在浮选药剂，`litho-m3.ts` 一·⑥）',
        performedBy: 'plant/plating-bath',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 15, max: 20 },
        ],
      },
      {
        note_zh: '④ 检平面度 ≤ 20 µm（比较仪 + 平晶；盖比基板好量，因为它是刚性的、不吸水）',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '铜 1 000 g + 锡 5 g → 盖 1 件（52 g）；余 948 g 是冲边废料，回炉',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.4 FCBGA 成品
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * FCBGA 封装：倒装贴片 → 回流 → 底填 → 固化 → TIM + 盖 → 植球 → 检。
     *
     *   32 位 CPU 1 + 基板 1 + 凸点 100 + 底填 1 g + 盖 1 + TIM 1 g + 焊料 1 g
     *   → FCBGA 1 片
     *
     * ── 七道工序，三处是这道封装真正的难点 ─────────────────────────────────
     *
     *   ① **对位 ±25 µm 而不是 ±5。** 倒装的好处正是"不用对得准"：
     *      回流时表面张力把 die 拉到最能量的位置，这叫**自对准**，
     *      能纠正 20–30 % 球距的偏差（100 µm 球距 → ±25 µm）。
     *      所以贴片用 `plant/mask-aligner` 的对准台（本来就是 1 µm 台）是**杀鸡用牛刀**，
     *      但也正因为牛刀，这一步反而没有降级。
     *   ② **底填 90 °C、30 s 流满。** 这是全文件余量最小的一格（1.4 倍），
     *      算式在文件头一·③。70 °C 做不了：340 mPa·s 对 28 µm 间隙超 2 倍。
     *   ③ **植球回流在空气里。** 无氧炉下限 600 °C、峰温 250 °C，两个窗口零重叠。
     *      焊点必长 5–10 nm SnO₂，而**读不出炉里的氧**。
     *
     * ── 翘曲是"算出来的"不是"调出来的" ───────────────────────────────────
     *
     *   die（硅 2 mm、α 2.6）压在基板（α 15）上：Δα 12.4 → 2 mm 上只有 **4.5 µm**
     *   盖（铜 0.5 mm、α 17）压在基板（α 15）上：Δα 2 → 30 mm 上 **44 µm**
     *   合计 ≈ **44–52 µm**（die 项被它自己的尺寸吃掉了）→ 判据 100 µm，余量 1.9 倍
     *
     *   注意这个 44 是**盖项**撑起来的，不是 die 项 —— 与直觉相反，但它是
     *   2 mm die 的必然结果。**如果哪天 die 长到 20 mm（新一代芯片），
     *   这一项会变成 450 µm，整个封装要重新设计。**
     */
    id: 'make/fcbga-package',
    name: 'FCBGA Packaging', name_zh: 'FCBGA 封装',
    produces: [
      {
        item: 'std/fcbga-package-general',
        qty: q(1),
        gives: [
          { param: 'ballPitch', kind: 'range', max: 0.8, dir: 'atMost' },
          { param: 'ballCount', kind: 'range', min: 196, dir: 'atLeast' },
          { param: 'layers', kind: 'range', min: 8, dir: 'atLeast' },
          { param: 'lineWidth', kind: 'range', max: 10, dir: 'atMost' },
          { param: 'warpage', kind: 'range', max: 52, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'std/cpu-32bit-general',
            qty: q(1),
            need: [{ param: 'node', kind: 'range', max: 130, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'std/build-up-substrate-8l', qty: q(1) }] },
      { anyOf: [{ item: 'mat/flip-chip-microbump', qty: q(100) }] },
      { anyOf: [{ item: 'mat/underfill', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'std/copper-lid-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/thermal-interface', qty: q(1, 1000) }] },
      {
        /**
         * 植球的 196 颗焊球。三条路是同一个意思：往焊盘上放 3.8×10⁻⁴ kg 的 SnAg。
         *
         *   焊球   `solder.ts` 的 φ0.40 丝切段回熔（D = 1.145 d → 球 φ0.458）—— **最准**
         *   焊膏   片状粉流不动，金属只能到 85 wt%，印出来体积少 5 % —— 最方便
         *   纯锡   自己回熔成球，球高公差翻倍 —— 最省事
         *
         * 这一格写三条 OR 不是为了留后路，是因为**本层三条都真的能走**，
         * 而它们的差别（球高度公差 ±5 % / ±10 % / ±20 %）正好是降级表里
         * "球距 0.8 ← 0.4"那一行的余量来源。
         */
        anyOf: [
          { item: 'mat/solder-ball', qty: q(1, 1000) },
          { item: 'mat/solder-paste', qty: q(1, 1000) },
          { item: 'mat/tin', qty: q(1, 1000) },
        ],
      },
      {
        /**
         * 助焊剂：ZnCl₂ 28–32 wt% 水溶液。**本层没有松香**（松香要松树，火星没有生物），
         * 所以助焊剂是水基的无机盐，不是树脂 —— 这意味着它**焊后必须洗**。
         *
         * 而 196 个 0.8 mm 球底下洗不干净：水靠毛细进去，却出不来（表面张力把它
         * 留在球间，间距只有 0.34 mm）。所以：
         *
         *   能用它的地方   凸点回流（开放面）、焊盘预镀（整片能冲）
         *   不能用它的地方 **植球**（球阵底下是封闭区）
         *
         * 这一支留着，是因为 `mat/solder-ball` 的球面本身有氧化膜（雾化球是 99 %
         * 球形但不是 99 % 干净），不涂助焊剂就得靠"4 h 内用完"的纪律 —— 那是
         * 工序纪律，不是材料。**纪律比材料脆，所以两支都写上。**
         */
        anyOf: [
          { item: 'mat/flux-zinc-chloride', qty: q(1, 1000) },
          { item: 'mat/tin', qty: q(1, 10000) },
        ],
      },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '① 倒装贴片：die 翻过来对准基板，对位 ±25 µm（回流的自对准能纠 20–30 % 球距，所以用不着更准；借 mask-aligner 的 1 µm 台反而余量大 5 倍）',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '② 回流 245–250 °C × 60 s：100 颗 40 µm 的凸点熔塌到 28 µm 的站高。**在电阻炉的空气里** —— 无氧炉下限 600 °C，与峰温零重叠（文件头四·①）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 245, max: 250 }],
      },
      {
        note_zh:
          '③ 底填：90 °C 上胶（128 mPa·s），沿 die 一边滴一条，毛细 30 s 流满 15 mm。**70 °C 做不了** —— 340 mPa·s 对 28 µm 间隙超 2 倍。借湿法槽的 120 °C 加热台当热板',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 85, max: 95 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '④ 底填固化 150–165 °C × 60 min。酚醛放缩合水，要沿 die 边缘走掉 —— 走不掉就是空洞，而**判据该是超声 C 扫描，本层没有，只能看外观**（文件头四·②）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 150, max: 165 }],
      },
      {
        note_zh:
          '⑤ TIM 涂 25 µm + 扣盖：0.5 mm 铜盖，四个支撑脚落在基板上，胶固化 150–180 °C。**盖厚 ≥ 0.4 mm 是硬要求**（0.25 mm 时翘曲 104 µm，超线）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 150, max: 180 }],
      },
      {
        note_zh:
          '⑥ 植球：196 颗 0.8 mm 锡球点焊膏、落球、回流 245–250 °C。球径/球距 = 0.5，熔塌后站高 0.5 mm',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 245, max: 250 }],
      },
      {
        note_zh:
          '⑦ 检：翘曲（平晶 + 50 µm 塞尺，通则合格）、球偏（20× 显微镜）、切片看 8 层。**翘曲量不出量，只判通/不通**（降级⑫）',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'CPU 1 + 基板 1（11 g）+ 凸点 100（0.06 mg）+ 底填 1 g + 盖 1（52 g）+ TIM 1 g + 焊料 1 g → FCBGA 1 片；底填与 TIM 各只有 11 mg 用上，其余是注射器死体积（**登账，不假装用掉了**）',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.5 QFN / LQFP：同一套引线框的两种成形
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * QFN 封装：粘片 → 丝焊 → 塑封 → 背面磨 → 侧壁半蚀 → 镀锡 → 成形。
     *
     *   引线框 100 套 + 裸片 100 + 丝 2 m + 酚醛 10 g + 石英 10 g + 锡 1 g
     *   → QFN 100 片
     *
     * ── "无引脚化"是三道工，不是一道 ────────────────────────────────────────
     *
     *   ① **背面磨** 到露出焊盘（磨掉 0.1 mm 的框底，露出铜）—— `plant/grinder`
     *   ② **侧壁半蚀** 把引脚外侧蚀掉一半，留下一个个独立的焊盘（不蚀就全连在一起，
     *      那是"短路"不是"封装"）
     *   ③ **镀锡** 0.5–1 µm，让侧壁"可焊" —— 工业上叫 wettable flank，
     *      作用是回流时**焊点能爬上侧壁**，肉眼（或 AOI）能看见焊没焊上。
     *
     * 第③步在本层的意义比在 2026 大：**它是唯一不需要 X 光的焊点判据**。
     *
     * ── 脚距 1.27 mm 是引线框给的，不是选的 ────────────────────────────────
     *
     * `std/lead-frame-general` 的规格是 1.27 mm（`make/lead-frame`：间距 1.27±0.02、
     * 悬臂平直度 < 0.05 mm）。做 0.5 mm 要 **0.02 mm** 的平直度 —— 冲模 5 µm 级够，
     * 送料步距的重复性不够（降级⑧）。所以这条路线产出的是 **PQFP 级**的 QFN。
     *
     * ⚠️ 塑封借 `plant/autoclave`（150–550 °C、10–35 MPa）。工业传递模压是
     * 5–15 MPa 合模、175 °C 模温 —— 高压釜两样都覆盖，但它是**气压不是模压**，
     * 没有浇口、没有排气。所以飞边（flash）会比工业厚，要 100 % 手工去飞边。
     */
    id: 'make/qfn-package',
    name: 'QFN Packaging', name_zh: 'QFN 封装',
    produces: [
      {
        item: 'std/qfn-package-general',
        qty: q(100),
        gives: [
          { param: 'pinPitch', kind: 'range', max: 1.27, dir: 'atMost' },
          { param: 'pinCount', kind: 'range', min: 44, dir: 'atLeast' },
          { param: 'warpage', kind: 'range', max: 30, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/lead-frame-general', qty: q(100) }] },
      { anyOf: [{ item: 'mat/ic-die', qty: q(100) }] },
      {
        // 6 根丝 × 2 mm × 100 片 = 1.2 m；铝丝是功率器件的标准，金丝是微伏级触点的唯一材料
        anyOf: [
          { item: 'mat/bonding-wire', qty: q(2) },
          { item: 'mat/gold-bonding-wire', qty: q(2) },
        ],
      },
      // 塑封料 = 酚醛 + 70 wt% 石英（本层的"EMC"）
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(20) },
    steps: [
      {
        note_zh:
          '① 点胶与贴片：裸片粘在框的芯片岛上，胶厚 25 µm（**粘片胶与塑封料同族** —— 酚醛 + 石英，只是填料从 70 wt% 降到 40 wt%，好点到 25 µm 的薄层）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '② 粘片胶固化 120–150 °C × 30 min（贴片是手上的活，固化是炉子的活 —— 两段两个执行者）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 120, max: 150 }],
      },
      {
        note_zh:
          '③ 丝焊：φ25 µm，6 根，**超声键合**（铝丝表面有 Al₂O₃，必须摩擦破膜，不能热压）。焊点 100 µm、弧高 200 µm',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '④ 塑封 175 °C / 10–20 MPa：**借高压釜** —— 它是气压不是模压，没有浇口与排气，所以飞边厚（后要手工去）。工业传递模压是 5–15 MPa + 175 °C 模温，压力这一格反而是够的',
        performedBy: 'plant/autoclave',
        under: [
          { param: 'temperature', min: 170, max: 180 },
          { param: 'pressure', min: 10000, max: 20000 },
        ],
      },
      {
        note_zh:
          '⑤ 无引脚化之一：**背面磨**到露出焊盘（磨 0.1 mm 框底，见铜为止）。研磨量靠量块 + 比较仪控，磨穿就废',
        performedBy: 'plant/grinder',
      },
      {
        note_zh:
          '⑥ 无引脚化之二：**侧壁半蚀** —— 引脚外侧蚀掉一半，把连成一片的框底分成一个个独立焊盘。不蚀就是短路',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '⑦ 无引脚化之三：**侧壁镀锡** 0.5–1 µm（wettable flank）。回流时焊点爬上侧壁 —— 这是本层唯一不用 X 光就能判"焊没焊上"的封装',
        performedBy: 'plant/plating-bath',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 15, max: 20 },
        ],
      },
      {
        note_zh:
          '⑧ 切筋、成形、去飞边（100 % 手工 —— 高压釜塑封没有排气，飞边比工业厚）；检脚距 1.27±0.02、共面度 0.05、本体翘曲 ≤ 30 µm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '引线框 100 套（55 g）+ 裸片 100 + 丝 2 m（0.02 g）+ 酚醛 10 g + 石英 10 g + 锡 1 g + 水 1 000 g → QFN 100 片；余是去飞边、水洗与蚀刻掉的框底铜（约 15 g，回收）',
  },

  {
    /**
     * LQFP 封装：与 QFN **同一套引线框**，最后一道不同 —— 引脚弯成鸥翼、伸出本体。
     *
     *   引线框 100 套 + 裸片 100 + 丝 2 m + 酚醛 10 g + 石英 10 g → LQFP 100 片
     *
     * ── 为什么两种封装各写一条路线，而不是一条带开关 ────────────────────────
     *
     * 因为**它们消耗的东西不同**：QFN 要锡（侧壁镀锡）、LQFP 不要；
     * LQFP 要成形模、QFN 要半蚀。一条路线带开关写不出来 —— 写得出的是
     * 两条路线共享同一个 `uses` 子集，而共享由 `std/lead-frame-general`
     * 这个条目本身表达（它被两族同时消费）。**单一事实来源在条目上，不在路线上。**
     *
     * ── LQFP 在本层比它在 2026 更能干 ──────────────────────────────────────
     *
     *   焊点看得见（显微镜）、能返修（烙铁拆）、翘曲容忍度高（鸥翼能弯 0.1 mm 补偿）
     *   ／ 缺点：占板面积是 QFN 的 2.2 倍、引脚电感高 3 倍（10 MHz 以上开始难看）
     *
     * 所以分工不是"先进 vs 落后"，是"看不看得见"：
     *   关节 MCU → LQFP（1.27 mm，3021 的机器人也这么用）
     *   力/编码器 ASIC → LGA（陶瓷、不吸水、模拟前端）
     *   主控 → FCBGA（看不出，只能电测）
     */
    id: 'make/lqfp-package',
    name: 'LQFP Packaging', name_zh: 'LQFP 封装',
    produces: [
      {
        item: 'std/lqfp-package-general',
        qty: q(100),
        gives: [
          { param: 'pinPitch', kind: 'range', max: 1.27, dir: 'atMost' },
          { param: 'pinCount', kind: 'range', min: 44, dir: 'atLeast' },
          // 鸥翼能弯 0.1 mm 补偿板子的翘 —— 所以它的 tolerance 是 QFN 的 1.3 倍
          { param: 'warpage', kind: 'range', max: 40, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/lead-frame-general', qty: q(100) }] },
      { anyOf: [{ item: 'mat/ic-die', qty: q(100) }] },
      {
        anyOf: [
          { item: 'mat/bonding-wire', qty: q(2) },
          { item: 'mat/gold-bonding-wire', qty: q(2) },
        ],
      },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(18) },
    steps: [
      {
        note_zh: '① 点胶与贴片：裸片粘在芯片岛上，胶厚 25 µm（与 QFN 同一道粘片胶、同一个 25 µm）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '② 粘片胶固化 120–150 °C × 30 min（贴片是手、固化是炉 —— 两段两个执行者）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 120, max: 150 }],
      },
      {
        note_zh: '③ 丝焊 φ25 µm × 6 根（超声键合，破 Al₂O₃ 膜）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '④ 塑封 175 °C / 10–20 MPa（借高压釜，同 QFN 的问题：没有浇口，飞边厚）',
        performedBy: 'plant/autoclave',
        under: [
          { param: 'temperature', min: 170, max: 180 },
          { param: 'pressure', min: 10000, max: 20000 },
        ],
      },
      {
        note_zh:
          '⑤ 切筋后**鸥翼成形**：引脚弯两道（根部 90°、脚尖 30°），共面度 0.05 mm、脚尖半径 0.2 mm。弯的角度决定它能不能在回流时"弹"下去补偿板翘',
        performedBy: 'plant/press',
      },
      {
        note_zh:
          '⑥ 检：脚距 1.27±0.02、共面度 0.05、本体翘曲 ≤ 40 µm。**鸥翼焊点在 20× 显微镜下直接看得见** —— 不需要 X 光',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '引线框 100 套（55 g）+ 裸片 100 + 丝 2 m + 酚醛 10 g + 石英 10 g + 水 1 000 g → LQFP 100 片；余是切筋与弯脚的废料（约 12 g 铜，回炉）',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.6 陶瓷族：基板 + LGA
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 陶瓷基板（96 % Al₂O₃，3 层，厚膜铜）：配料 → 流延 → 打孔 → 叠压 → 排胶 → 烧结 → 印铜烧成。
     *
     *   氧化铝 48 + 石英 1 + 石灰 1 + 酚醛 5 + 铜 5 + 水 50 → 基板 20 件
     *
     * 96 % 氧化铝的配方是算出来的：48/(48+1+1) = **96.0 %**，余 4 % 是
     * 1 % SiO₂（助烧结，形成玻璃相把刚玉颗粒粘住）+ 1 % CaO（抑制晶粒长大）
     * + 2 % 杂质。**少于 4 % 的玻璃相，1 600 °C 也烧不密**（刚玉自己不烧结）。
     *
     * ── 为什么是"后烧"不是"共烧"────────────────────────────────────────────
     *
     * 共烧（HTCC/LTCC）要把导体和陶瓷一起烧：钨/钼要 1 600 °C 还原气氛，
     * 本层**钨钼链没建**；铜要 900 °C 但铜在 1 600 °C 早化成汽了。
     * 所以只能**后烧（post-fired）**：先把陶瓷烧到 1 600，再在烧好的瓷面上
     * 丝印铜浆、900 °C 烧成 —— 这叫**厚膜**，1950 年代的老工艺，正是本层的菜。
     *
     * ── 唯一真用上无氧炉的地方 ──────────────────────────────────────────────
     *
     * 铜厚膜的烧成必须在 N₂ 里：Cu/Cu₂O 平衡要求 **< 10 ppm 氧**，
     * 而 `plant/atmosphere-furnace` 给 **0–50 ppm**（差 5 倍，文件头四·③）。
     * 铜会轻微氧化 → 方阻涨 15 %，但界面长出 CuAlO₂ 尖晶石，**附着力反而变好**。
     * 这是本文件里唯一一处"降级反而有一头是好的"。
     *
     * ⚠️ 线宽 200 µm，不是 10 µm：丝网印刷的上限是网目（325 目 = 46 µm 丝径），
     * 浆料还会流平。所以要细就得薄膜光刻 —— 本层有 `plant/evaporator`，
     * 但陶瓷片上的薄膜光刻线没有（缺口表里没单列，因为 LGA 不需要细线）。
     */
    id: 'make/ceramic-substrate',
    name: 'Ceramic Substrate Manufacturing', name_zh: '陶瓷基板制造',
    produces: [
      {
        item: 'std/ceramic-substrate-3l',
        qty: q(20),
        gives: [
          { param: 'layers', kind: 'range', min: 3, max: 3, dir: 'atLeast' },
          { param: 'lineWidth', kind: 'range', max: 200, dir: 'atMost' },
          // 陶瓷不吸水 —— 回流的翘曲一半来自水汽，那一半是零
          { param: 'warpage', kind: 'range', max: 15, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/alumina',
            qty: q(48, 1000),
            need: [{ param: 'al2o3', kind: 'range', min: 95, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/silica', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(1, 1000) }] },
      // 流延用的粘结剂。烧之前要全部排掉（排胶 400–600 °C）
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 200) }] },
      // 厚膜铜浆（铜粉 + 玻璃粉 + 有机载体；这里只登铜，玻璃与载体按损耗不登）
      { anyOf: [{ item: 'mat/copper', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(48) },
    steps: [
      {
        note_zh:
          '① 配料与球磨 12 h：Al₂O₃ 96 % + SiO₂ 1 % + CaO 1 %（后两个是助烧结，少了 1 600 °C 也烧不密）+ 酚醛粘结剂 5 % + 水，球磨到 d50 1 µm',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '② 流延（doctor blade，刮刀间隙 120 µm → 干坯 0.1 mm）—— 3 层叠起来正好 0.3 mm。**7×7 mm 是舒适区，30×30 会翘 40 µm**',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '③ 打孔：0.3 mm 层间互连孔 + 2 个 1 mm 定位孔（机械冲，不是激光 —— 生坯软，冲得动）',
        performedBy: 'plant/milling-machine',
      },
      {
        note_zh: '④ 叠层与等静压 20 MPa（生坯要压实，否则烧结收缩不均）',
        performedBy: 'plant/press',
      },
      {
        note_zh: '⑤ 排胶 400–600 °C × 4 h（慢升温 1 K/min）：酚醛烧掉，留孔道。快了会起泡分层',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 600 }],
      },
      {
        note_zh:
          '⑥ 烧结 1 500–1 600 °C × 2 h：刚玉颗粒靠 4 % 的玻璃相粘住，收缩 17 %（线性）。**这是全文件唯一用上高温炉的地方**',
        performedBy: 'plant/high-temp-furnace',
        under: [{ param: 'temperature', min: 1500, max: 1600 }],
      },
      {
        note_zh:
          '⑦ 丝印铜浆（200 µm 线宽、10 µm 干膜厚）→ 900 °C 在 **0–50 ppm 氧**里烧成。Cu/Cu₂O 平衡要 < 10 ppm，**差 5 倍** —— 方阻涨 15 %，但 CuAlO₂ 让附着力变好（文件头四·③）',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 880, max: 920 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '⑧ 检：翘曲 ≤ 15 µm（陶瓷不吸水，翘曲只有烧结收缩不均这一项）、线宽 200±20、层数 3',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '氧化铝 48 + 石英 1 + 石灰 1 + 酚醛 5 + 铜 5 + 水 50 = 110 g → 基板 20 件（每件 3.2 g）；余是排胶烧掉的酚醛 5 g、烧结收缩与丝印损耗',
  },

  {
    /**
     * LGA 封装：粘片 → 丝焊 → 封盖 → 焊盘镀锡 → 检。
     *
     *   陶瓷基板 50 + 裸片 50 + 丝 1 m + 酚醛 5 g + 锡 0.5 g → LGA 50 片
     *
     * ── 为什么"焊盘"不是"球"────────────────────────────────────────────────
     *
     * 球要植球 + 回流，而陶瓷基板的热容是 FR-4 的 3 倍：植球峰温要 +15 K，
     * 到 265 °C 时焊球氧化得比有机基板上快一倍，而本层没有 N₂（文件头四·①）。
     * 焊盘不用熔化 —— **它是被板子上的焊膏焊的，不是被自己焊的**。
     * 这一句就是 LGA 存在的全部理由，也是它为什么属于"封装"而不是"连接"。
     *
     * ── 不气密，这是唯一的硬缺口 ────────────────────────────────────────────
     *
     * 气密封盖要玻璃粉封接，480 °C，**必须在 N₂ 里**（玻璃不润湿氧化过的可伐/瓷）。
     * 而 `plant/atmosphere-furnace` 最低 600 °C —— **无氧与封接温区不重叠**，
     * 与回流是**同一堵墙**（文件头四·①）。
     * 所以封盖用酚醛（150–180 °C 固化）：**不气密**。
     * 后果具体：潮气 3–5 年走到结面，漏电慢慢涨 —— `data/material/package.ts`
     * 第 12 行说的那句原话，这里再响一次。
     *
     * 陶瓷基板本来可以让它气密（陶瓷本身不透气），**堵住的只是那圈玻璃**。
     * 所以降级⑨的升级路线很窄：一台能给 480 °C + N₂ 的炉子（比"无氧回流炉"容易得多）。
     */
    id: 'make/lga-package',
    name: 'LGA Packaging', name_zh: 'LGA 封装',
    produces: [
      {
        item: 'std/lga-package-general',
        qty: q(50),
        gives: [
          { param: 'pinPitch', kind: 'range', max: 0.8, dir: 'atMost' },
          { param: 'pinCount', kind: 'range', min: 32, dir: 'atLeast' },
          { param: 'layers', kind: 'range', min: 3, dir: 'atLeast' },
          { param: 'warpage', kind: 'range', max: 25, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/ceramic-substrate-3l', qty: q(50) }] },
      { anyOf: [{ item: 'mat/ic-die', qty: q(50) }] },
      { anyOf: [{ item: 'mat/bonding-wire', qty: q(1) }] },
      // 粘片用银胶：陶瓷上的粘片不能共晶（共晶要 400 °C + N₂，而这层连 480 °C 的 N₂ 都没有）
      { anyOf: [{ item: 'mat/thermal-interface', qty: q(1, 2000) }] },
      // 封盖：酚醛（不气密）。气密版要玻璃粉 + 480 °C 的 N₂ —— 见上面的注释
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 200) }] },
      // 底部焊盘镀锡 0.5–1 µm（不是球）
      { anyOf: [{ item: 'mat/tin', qty: q(1, 2000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(14) },
    steps: [
      {
        note_zh:
          '① 点胶与贴片：银胶（`mat/thermal-interface`）点 25 µm 薄层，die 落位。陶瓷上的粘片不用共晶（共晶要 400 °C、要 N₂）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '② 银胶固化 150–165 °C × 60 min（点胶是手、固化是炉 —— 两段两个执行者）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 150, max: 165 }],
      },
      {
        note_zh: '③ 丝焊 φ25 µm：die 焊盘 → 瓷面厚膜焊盘。瓷面粗糙（Ra 0.3 µm），超声能量要比有机基板高 20 %',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '④ 封盖：瓷盖 + 酚醛，150–180 °C × 60 min。**不气密** —— 气密的玻璃封接要 480 °C + N₂，而无氧炉最低 600 °C（降级⑨，与回流同一堵墙）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 150, max: 180 }],
      },
      {
        note_zh:
          '⑤ 底部焊盘镀锡 0.5–1 µm：50 个 0.8 mm 焊盘，露出瓷面 0.1 mm（露太多会爬锡短路）。**不是球，是盘**',
        performedBy: 'plant/plating-bath',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 15, max: 20 },
        ],
      },
      {
        note_zh:
          '⑥ 检：焊盘位置度 ±25 µm、共面度 ≤ 10 µm、本体翘曲 ≤ 25 µm（陶瓷不吸水，所以这一项比有机基板的 44 µm 更紧）',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '陶瓷基板 50 件（160 g）+ 裸片 50 + 丝 1 m + 酚醛 5 g + 锡 0.5 g + 水 1 000 g → LGA 50 片；余是封盖胶的外溢与镀锡废液（回收）',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.7 测试：分档
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 封装复检与分档：外观 → 电测（抽样 5 %）→ 焊球剪切（抽样）→ 分档打标。
     *
     *   进 100 片 → 出 92 片；余 8 片 = 5 片抽检剪坏 + 3 片判废
     *
     * ── 三件检具，三处降级 ──────────────────────────────────────────────────
     *
     *   ① **外观**：20× 显微镜（其实是 `plant/comparator` 的读数显微镜）。
     *      查球偏 > 0.15 mm、崩边、本体翘曲。**这一件是本文件唯一不降级的检具。**
     *   ② **电测**：没有探针台（缺口③）。196 球 × 2 = **392 次接触**，
     *      机器人手持探针一次 10 s → **1.1 h/片**。所以只能抽 **5 %**（100 片测 5 片）
     *      —— 这是降级⑪。误判风险写在这里：**抽样 5 % 只能发现批次性问题，
     *      发现不了单只的球开路。** 工业上 100 % 测，本层做不到。
     *   ③ **焊球剪切**：没有推拉力计（要应变片或压电片）。
     *      退路是**把 `std/calibrated-scale-100` 当天平式测力计用**：
     *      横顶 0.8 mm 的球直到剪断，天平读数差 × g = 剪切力。
     *      SAC305 的 0.8 mm 球剪切力是 **0.6–1.2 N = 61–122 gf**，
     *      100 g 天平分辨 0.1 mg → 力分辨 1 mN。**够。**
     *      但这是**破坏性**的：一片 5 个球，剪完这片就废 —— 这就是"5 片"的来源。
     *
     * ── 为什么 92 而不是 95 ────────────────────────────────────────────────
     *
     * 100 − 5（剪坏）− 3（判废）= 92。3 片的判废率 = 3 %，
     * 是"8 层基板 + 100 凸点 + 底填 + 植球"这一段良率的**诚实估值**：
     * 主要失效是底填空洞（文件头四·② 量不出来）与球偏。
     *
     * ⚠️ 这条路线的 `warpage` 窗口比 `make/fcbga-package` **更紧（35 对 52 µm）**，
     * 但这不是"筛得更准"，是**筛掉了一半**：进来的 100 片翘曲在 20–52 µm 之间分布，
     * 只有 ≤ 35 µm 的那 92 片出得去。**35 这个数不是能力，是良率的另一种写法。**
     * 量法只有平晶 + 塞尺（没有阴影云纹，降级⑫），所以这道筛的判据本身也只有 ±5 µm。
     */
    id: 'make/package-test',
    name: 'FCBGA Package Manufacturing', name_zh: 'FCBGA 封装成品制造',
    produces: [
      {
        item: 'std/fcbga-package-general',
        qty: q(92),
        gives: [
          { param: 'ballPitch', kind: 'range', max: 0.8, dir: 'atMost' },
          { param: 'ballCount', kind: 'range', min: 196, dir: 'atLeast' },
          { param: 'layers', kind: 'range', min: 8, dir: 'atLeast' },
          { param: 'lineWidth', kind: 'range', max: 10, dir: 'atMost' },
          { param: 'warpage', kind: 'range', max: 35, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/fcbga-package-general', qty: q(100) }] },
      // 可替换规格族：同一套测试夹具覆盖 QFN/LQFP 两种封装（引脚数/节距不同，测试条件相同）
      { anyOf: [{ item: 'std/qfn-package-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/lqfp-package-general', qty: q(1) }] },
    ],
    needs: ['std/calibrated-scale-100', 'plant/metrology-room'],
    rate: { hours: q(16) },
    steps: [
      {
        note_zh:
          '① 外观 100 %：20× 显微镜查球偏 > 0.15 mm、崩边、本体翘曲（平晶 + 50 µm 塞尺）。**这一件不降级** —— 它是全文件唯一能全检的项',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 电测抽检 5 %：392 次接触 × 10 s = **1.1 h/片**（没有探针台，机器人手持探针）。**只能发现批次性问题，发现不了单只球开路** —— 降级⑪',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 焊球剪切抽 1 片 × 5 球：用 `std/calibrated-scale-100` 当天平式测力计，横顶 0.8 mm 球到剪断，读 61–122 gf 为合格。**破坏性 —— 剪完这片就废**',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '④ 分档、打标（批号 + 档位）、入防潮袋（陶瓷与有机基板都要，酚醛吸水 1.5 %）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'FCBGA 100 片 → 92 片；余 8 片 = 5 片被剪切试验剪废 + 3 片判废（良率 92 %，主要失效是底填空洞与球偏）',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PCBPKG_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PCBPKG_ROUTES];
