/**
 * 铜互连大马士革 —— 3–5 µm 互连的交付，以及 40 nm / 8 nm 的缺口。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、这一份在补什么（R9：种子设备必须可复制）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 一颗芯片是两半拼起来的：
 *
 *   前半条（栅极那一半）  氧化、光刻、扩散、注入、接触 —— 造器件
 *   后半条（本文件）      **互连** —— 把器件连起来，并把信号送到焊盘
 *
 * 本层现有的互连是**双层铝**（`data/material/multilayer.ts`：蒸发 + 反刻，5 µm 线、
 * 两层、40 门/片）。那是 1960 年代的做法，它到"四十个门"就到顶了 —— 不是因为它细不下去，
 * 是因为**线不能交叉，而层数上不去**。
 *
 * 工业从 1997 年起把铝换成铜，并把"刻金属"换成"刻介质"：
 *
 *   铝互连   蒸一层铝 → 光刻 → **反刻金属**（减材）
 *   铜大马士革  刻介质出沟 → 填铜 → **CMP 去多余铜**（增材）
 *
 * 换铜的三个理由（每个都是数）：电阻率 1.67 对 2.65 µΩ·cm（1.6 倍）、
 * 抗电迁移 5–10 倍、以及**铜能用电镀填进深沟**（铝只能靠蒸发，而蒸发填不了沟）。
 * 换"刻介质"的唯一理由：**铜的卤化物在光刻胶能承受的温度（<200 °C）里没有可用的蒸气压**
 * —— CuCl₂ 要到 400–500 °C 才挥发，所以干法在 200 °C 以下刻不动铜，只能反过来做。
 *
 * 本文件把这条路从"本层有什么"一路写到"交付到哪一步、缺哪一环、缺多少"。
 * 结论先放在这里：**五段全部能走通，但每一段都差一个量级**，而它交付的东西
 * 是一个 3–5 µm 线宽、0.4 µm 厚、1–3 层的铜层 —— 不是 40 nm 与 8 nm 的互连。
 * 所以本文件把 3–5 µm 那一档写成两个可交付的独立件：
 *   `std/mcu-3um-general`（MCU 的后道）与 `std/soc-3um-general`（SoC 的后道）。
 * 细线档另立 `std/soc-fine-general`（100–300 nm，`fine-damascene.ts` 产），
 * 它既不是 3–5 µm，也不是 8 nm。
 * 40 nm 的 `std/mcu-40nm-general` 有路线 `make/mcu-40nm-damascene`：
 * 前道 SAQP 16–24、后道 `make/beol-40nm-8layer` 交 40–100 nm / AR 2–3 /
 * dishing 3–8 / 8 层、钝化 LPCVD Si₃N₄。**2026-10-20 前的口径**是“16–24 nm 前道
 * + 100–300 nm 后道 + 3–5 µm 钝化的混合件，缺后道图形化与电子级钝化”——
 * 这一版已不成立；现在缺的是 40 nm CAR（本层 80–200 nm）与 E≥5 GPa 的低 k 介质，
 * 不是后道整体。
 * 8 nm 的 `std/soc-8nm-general` **有路线**：`make/soc-8nm-damascene`（`euv-hina.ts`）
 * 交 node 8–10、15–20 层 30 nm 后道；旧整机（2×2 场、43/560 nm）的算术留在
 * `data/material/chip-node.ts` 文件头作对照。**不把 3–5 µm 叫 40 nm 或 8 nm**，
 * 本层交付与缺口分开记。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、五段工艺与它们的工业规格 / 本层规格
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * | 段 | 工业做法（40 nm / 8 nm） | 本层做法 | 本层交付 | 缺口 |
 * |---|---|---|---|---|
 * | ① 介质沉积 | CVD TEOS 400 °C / SiCOH k = 2.5–2.7 | 旋涂 SOG ×2 + 450 °C 固化 | k = 4.0–4.5 | k 差 1.6–1.8 倍 |
 * | ② 沟槽刻蚀 | RIE / 双频 CCP，各向异性，AR 2–3 | 5 % HF 湿法（各向同性）；升级走离子束 | AR 0.08–0.13；离子束 1.2–1.6 | AR 差 15–25 倍（湿法的几何上限 0.5 本身就差 4 倍） |
 * | ③ 阻挡 + 籽晶 | PVD TaN/Ta 2–3 nm + Cu 籽晶，或 ALD | 蒸发 Ti 5–10 nm + N₂ 氮化 + 蒸 Cu 100 nm | 台阶覆盖 50–60 % | AR 2 处只有 8–12 % |
 * | ④ 电镀铜 | CuSO₄ + H₂SO₄ + Cl⁻ + **3 种添加剂**，超填充 | CuSO₄ + H₂SO₄ + Cl⁻，**无添加剂** | 空洞 5–15 %（AR 0.13 可以） | AR 2 处空洞 87 % |
 * | ⑤ CMP | 终点检测 + 硬垫 + 分区压力 + 0.05 µm 浆 | 定时 7.6 min、毡垫、单压力区 | dishing 200–230 nm | 差 20–23 倍 |
 *
 * 机型全部是既有的（`plant/wet-bench`、`plant/resistance-furnace`、`plant/mask-aligner`、
 * `plant/evaporator`、`plant/plating-bath`、`plant/cmp-polisher`、`plant/ion-beam-figuring`、
 * `plant/film-monitor`）。**本文件不新增设备、不新增零件。**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、五问（每一问都带数）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── 问一：没有干法刻蚀，怎么开沟槽？0.13 µm 沟、0.26 µm 深能成立吗？ ──────────
 *
 * **不成立，而且不是差一点，是差 4 倍加一个几何死结。**
 *
 * 本层只有湿法（`plant/wet-bench` 20–120 °C）+ HF。HF 刻 SiO₂ 是**各向同性**的：
 * 侧蚀 = 深度，一比一。于是有两条硬账：
 *
 *   ① **纵横比的几何上限 = 0.5。** 掩模开 w 宽，刻到 d 深，两侧各吃掉 d，
 *      沟底在 d = w/2 处闭合（剖面从矩形变成半圆）⇒ AR = d/w ≤ **0.5**。
 *      要 AR 2 ⇒ 差 **4 倍**。
 *   ② **相邻沟槽并拢得更早。** 间距取 0.13 µm（与线同宽；40 nm 节点实际的金属间距只有
 *      0.05–0.09 µm，比这个更狠），掩模壁就只有 0.13 µm 宽 —— 两侧各侧蚀 0.065 µm 时它没了
 *      ⇒ **只刻到目标的 1/4 深（0.065 µm）相邻沟就并成一片**。
 *      最后得到的不是 0.13 × 0.26 的沟，是 0.13 + 2 × 0.26 = **0.65 µm 宽、0.26 µm 深的一个碟**，
 *      宽度是设计值的 5 倍，而它与左右邻居已经连在一起。
 *
 * 反过来，**3–5 µm 的沟在湿法下是成立的**，这就是本文件的交付点：
 *   刻 0.4 µm 深 ⇒ 侧蚀 0.4 µm/侧 ⇒ 沟 3.0 → 3.8 µm（+27 %），线间距 3 µm 时还剩
 *   3.0 − 2 × 0.4 = **2.2 µm 的介质墙** ⇒ 不并拢 ✓。
 *   刻蚀时间：5 % HF、20 °C、SOG 是多孔硅酸盐（比热氧化层快 2–3 倍）⇒
 *   0.2–0.3 µm/min ⇒ 0.4 µm 要 **1.3–2 min**（计时 ±10 s = 深度 ±8–13 % = ±30–50 nm，
 *   而这 ±30–50 nm 会原样进 CMP 的去除量，也就是进 dishing）。
 *
 * 三条替代，各带一个能算死的数：
 *
 *   **① 离子束（本文件写成正式路线 `make/damascene-trench-ion`）—— 成立，但要两件本层没有的东西。**
 *      `plant/ion-beam-figuring` 是 Kaufman 源（Ar 500 eV），物理溅射，**各向异性**，
 *      侧壁 80–85°，AR 1.2–1.6 能开出来。三条代价：
 *        · 选择比 **1:1**（胶 : SiO₂）⇒ 刻 1.2–1.6 µm 要 1.5–2 µm 的胶，
 *          而本层胶厚的上限是 1.0 µm（`cis.ts:878` 的 M1 档 0.5–1.0）⇒ 差 **1.5–2 倍**
 *        · 束斑 25 mm FWHM 的高斯 + 扫描台 ±2 mm ⇒ 均匀性 **±15 %**
 *          （刻 1.6 µm 就是 ±240 nm 的深度差）
 *        · 没有终点、没有底层选择 ⇒ 定时 ±15 % 会打穿下层铜
 *   **② 剥离法（lift-off）—— 行，但它不是大马士革。** 它是"蒸 + 剥"，回到减材。
 *      而且剥离要"胶比膜厚、下切住"：0.4 µm 金属要 0.6–0.8 µm 胶，
 *      去胶在本层只有 70–90 °C 热水 + 铜丝刷（**没有溶剂**）⇒ 0.13 µm 的胶线一刷就掉。
 *      **所以 lift-off 在本层也只到 3–5 µm，与湿法同档，它不构成升级。**
 *   **③ 电镀模具（plating mold）—— 到 1–2 µm。** 厚胶开模 → 电镀 → 去模，
 *      绕开了"刻介质"这一整段（模具壁是胶的侧壁，70–80° 陡，不需要干法刻蚀）。
 *      但去模同样卡在"没有溶剂"：5 µm 的重铬酸盐胶交联后要热碱 + 刷 ⇒ 1–2 µm 以上的图形刷不掉。
 *
 * ── 问二：没有 CVD，阻挡层怎么镀？蒸发能镀 5–10 nm 的**保形**阻挡层吗？ ────────
 *
 * **能镀，但"保形"两个字做不到 —— 本层最好的是 50–60 %，保形要 ≥90 %。**
 *
 * 蒸发是**直线视线**：0.1–1 Pa 下平均自由程 ~1 cm，远大于沟宽，所以气相不散射，
 * 只有"看得见"的表面才长膜。台阶覆盖（侧壁中段厚度 ÷ 场厚）的手册值随 AR 掉得很快：
 *
 *   AR 0.1 → **55–65 %**    AR 0.5 → 35–45 %    AR 1 → 20–25 %    AR 2 → **8–12 %**    AR 4 → 3–5 %
 *
 * 于是：
 *   · 本层的沟 AR **0.13** ⇒ 侧壁 **50–60 %** ⇒ 5–10 nm 的 Ti 在侧壁还剩 2.5–6 nm，
 *     氮化成 TiN 之后仍高于"连续膜"的阈值（2–3 nm，岛状生长到渗流的经验值）⇒
 *     **勉强连续，这是本层唯一能给出的阻挡层。**
 *   · 40 nm 的沟 AR **2** ⇒ 侧壁 **0.4–1.2 nm** ⇒ 岛状、不连续 ⇒ 铜直接贴着 SOG。
 *     没有阻挡层时铜在 SiO₂ 里的扩散系数 D ≈ 1×10⁻¹³ cm²/s（300 °C）⇒
 *     √(Dt) = **0.19 µm/h** ⇒ 0.4 µm 的介质层在 **2 h 内被穿透**，层间短路，
 *     而铜在硅里是深能级（E_v + 0.24 eV）⇒ 漏电涨 3–5 个数量级。
 *
 * 无电镀（electroless）能不能救？**不能，缺的不是还原剂。** 甲醛有（`mat/formaldehyde`，
 * make/formaldehyde），**缺的是络合剂**：EDTA（要乙二胺 + 一氯乙酸）、酒石酸钾钠（要顺丁烯二酸酐）、
 * 柠檬酸（要发酵）三样都不在料表里；还要 SnCl₂/PdCl₂ 活化（**当时钯没有条目；
 * 现在 `pgm.ts` 有海绵 Pd，但 PdCl₂ 活化液路线仍未建**）。
 * **与 `data/material/pcb.ts:55` 是同一个缺口、同一个量级**（那里用它替孔壁化学镀铜，替法也是石墨浆）。
 * 所以这一格写的是：**络合剂 0/3 种、催化剂 0/1 种 ⇒ 化学镀铜（阻挡层/籽晶层）一条也走不通。**
 *
 * 籽晶层（Cu）同一个道理但宽松些：Cu 的渗流阈值 5–8 nm，AR 0.13 处 100 nm 场厚给
 * 50–60 nm 侧壁 ⇒ 连续 ✓；AR 2 处 8–12 nm ⇒ 临界。
 *
 * ── 问三：没有添加剂的电镀铜，会形成什么样的空洞？ ─────────────────────────
 *
 * 关键不是"有没有空洞"，是**沟口先闭合还是沟底先填满**。超填充（superfill）是
 * 三种添加剂合作的结果，没有它们只剩"保形填充"，于是：
 *
 *   空洞占比 **void ≈ 1 − w/(2·r·d)**      w 沟宽、d 沟深、r = 沟口/沟底电流密度比
 *
 * 本层搅拌下的 r = 1.05–1.2（沟浅、欧姆降小）：
 *
 *   · AR 0.13（w 3 µm、d 0.4 µm、r 1.05）⇒ 1 − 3/(2×1.05×0.4) = **−2.6 < 0**
 *     ⇒ 沟口**根本闭合不了**，保形填满 ⇒ **几何空洞 0**。
 *     实测的 5–15 % 是颗粒与氢气泡造成的偶然空洞，不是超填充失败。
 *     **这是本文件最反直觉、也最要紧的一处自洽：湿法挖不深，反而让无添加剂能填满。**
 *   · AR 0.5（w 1 µm、d 0.5 µm、r 1.2）⇒ **17 %**
 *   · AR 2（w 0.13 µm、d 0.26 µm、r 2）⇒ **87 %**：0.13 × 0.26 × 0.875 ≈ **0.030 µm³**
 *     的空腔沿沟连成一条**中心缝（keyhole）** —— 这是断路，不是"电阻大一点"。
 *
 * 三种添加剂各缺什么，一条一条：
 *
 *   抑制剂（PEG/PPG）  缺 ⇒ 沟口不钝化 ⇒ 电流全挤在沟口 ⇒ 缝（上面那条公式里的 r 变大）
 *   加速剂（SPS/MPS）  缺 ⇒ 没有"自下而上" ⇒ 只能保形
 *   整平剂（JGB/PEI）  缺 ⇒ 沟口长成**蘑菇头 2–3 倍** ⇒ CMP 要多去 1–2 倍的铜
 *
 * 三样都是精细有机（聚醚、有机硫化物、季铵盐），本层有机只到 **C1 甲烷与 C2 乙炔→苯** ——
 * 与 `pcb.ts` 第 21 行"这一层的有机化学没有三碳"是同一条边界。
 *
 * 铜从哪来：`mat/copper`（电解精炼，97–99.99 % 纯度）+ **现场生成硫酸铜**
 * （Cu + H₂SO₄ + ½O₂ → CuSO₄ + H₂O）。本层不用现成的 `mat/copper-sulfate`
 * （它在 `precious.ts`，从阳极泥来，纯度 90–99 % 且不在本文件投料白名单里）。
 *
 * ── 问四：CMP 的 dishing 200–230 nm，8 nm 要 <10 nm。靠"过度抛光 + 反向图形"补得了吗？ ─
 *
 * **补不了。而且"过度抛光"不是补偿手段，它就是 dishing 的来源。**
 *
 * 200–230 nm 的账（沿用 `data/machine/multilevel-floor.ts` 的四个数）：
 *
 *   每层要去 600 nm 铜（400 nm 沟 + 200 nm 余量）；Cu 的去除率 **198 nm/min**（k = 2.5e-13）
 *   ⇒ 定时 **7.6 min**；定时误差 ±10 % = 46 s；在那 46 s 里露出来的铜走 198 × 0.77 = **151 nm**
 *   加本征 dishing（软毡垫把凹陷里的铜继续磨）**50–80 nm** ⇒ **合计 200–230 nm**
 *   反推 dishing 速率：151 nm ÷ 46 s = **3.3 nm/s** —— 抛光多停 1 s，凹陷就多 3.3 nm。
 *
 * 8 nm 节点的判据 <10 nm ⇒ 差 **20–23 倍**。
 *
 * 两条候选补偿，各算一遍：
 *
 *   **过度抛光**  ✗ —— 它就是那 151 nm 的来处。抛光时间与 dishing 成正比（3.3 nm/s），
 *                多抛只会更凹。它唯一能救的是"欠抛"那一侧。
 *   **反向图形（dummy fill）** △ —— dummy 只能加在**线之间**，加不进**线里面**。
 *                它治的是**erosion**（密排区介质被多磨，本层 150–300 nm），
 *                把密度从 20–80 % 收到 40–55 % ⇒ erosion 80–150 nm；
 *                对 dishing（单根宽线自身凹陷）**一点不动**。
 *
 * 真正能压 dishing 的只有两件，都还得再上一层：
 *
 *   ① **终点检测**把定时 ±10 % 压到 ±2 % ⇒ 过抛 151 → **30 nm**
 *      （三条工业路本层都不通：电流 1–3 % 淹没在检流计 2 %/h 的漂移里、
 *        涡流要 10 kHz 解调、光学要 1 % 的反射率差 —— 见 multilevel-floor.ts 问题二）
 *   ② **slotting**（把 5 µm 宽线切成 1 µm 条、两头连）⇒ 垫弯曲项 50–80 → **10–16 nm**
 *      代价：3 条 1.3 µm + 2 条 0.5 µm 的缝 ⇒ 有效宽度 4.0/5 = 80 % ⇒ **电阻涨 25 %**
 *      （缝开到 1 µm 就涨 40 %）—— 这是拿电阻换平面度，不是白拿的。
 *
 *   两件一起：30 + 12 ≈ **40–46 nm** —— 仍差 **4 倍**。
 *
 * 要到 <10 nm 还要三件，本层 0/3：**硬垫**（聚氨酯闭孔，本层只有矿棉毡 10 % 压缩率）、
 * **分区压力 + 闭环**（本层单压力区，球铰硬底 2.7 % = 16 nm @600 nm）、
 * **0.05 µm 胶体硅浆**（本层 0.3 µm，差 6 倍，而 0.3 µm 本身就是划痕源）。
 *
 * ── 问五：多层怎么叠？8–10 层（40 nm）与 12–15 层（8 nm）叠得上去吗？ ─────────
 *
 * **叠不上去；卡住它的不是 CMP，是套刻。** 两笔账分开算：
 *
 * **TTV（每层一次 CMP，去除 600 nm）**：增量 = 0.043 × 600 = **25.8 nm/层**
 *   8 层：√8 × 25.8 = **73 nm**（随机游走）／8 × 25.8 = 206 nm（线性最坏）
 *   15 层：√15 × 25.8 = **100 nm**／387 nm
 *   ⇒ 判据取 **0.2 µm**（下一层介质 0.4 µm 的一半：再大就过刻/欠刻半个介质层），
 *     随机游走那一端（73 nm）过，线性最坏那一端（206 nm）不过 —— **TTV 不是第一瓶颈，但也不是零。**
 *
 * **dishing 累积**：每层 200–230 nm，√8 × 215 = **608 nm** ⇒ 下一层的介质厚度差
 *   **0.6 µm = 一层金属的厚度** ⇒ 通孔过刻/欠刻 ±0.6 µm ⇒ **这是第二道死结**。
 *
 * **套刻（真正的瓶颈）**：本层最好的对准是 `plant/mask-aligner` 接触式，
 *   单次对准 1σ = **0.86 µm**（deprocess.ts 第五节：0.86 µm 是它那一代工艺的全部预算）。
 *   叠 N 层是随机游走 ⇒ √N × 0.86 µm：
 *
 *     N = 2 → 1.22 µm    N = 4 → 1.72 µm    N = 8 → **2.43 µm**
 *     N = 10 → **2.72 µm**    N = 15 → **3.33 µm**
 *
 *   判据是**通孔要落在线上**：√N × 0.86 ≤ w/2
 *     w = 3 µm（余量 1.5 µm）⇒ N ≤ **3**    w = 5 µm（余量 2.5 µm）⇒ N ≤ **8.5**
 *   ⇒ **本层能叠 3 层（3 µm 线）到 8 层（5 µm 线）。** 8 层这一端刚好够到 40 nm 的
 *     下限，12–15 层（8 nm）无论如何不够。
 *
 *   ⚠️ 5–6 层 / 0.5–1 µm via 的审计见 `fine-damascene.ts` 五·补：
 *      **written max 4 层**；5 层 / 1 µm via 只剩 0.08 µm 余量，6 层排不下；
 *      0.5 µm via 本层没有路线 ⇒ **不写 `make/dual-damascene-5l`/`-8l`**。
 *      8 层只是 5 µm 线、仅按套刻的算术上限；dishing 608 nm 与 7 nm 阻挡让它不可制造。
 *
 *   而线宽判据（套刻 ≤ 线宽/3）差得更远：40 nm 节点 65 nm 线要 ≤22 nm，8 nm 节点 30 nm 线要 ≤10 nm
 *   （deprocess.ts 取 13 nm / 2.7 nm）。2 430 nm ÷ 22 nm = **差 110 倍**；3 330 ÷ 10 = **差 333 倍**。
 *
 *   **升级路线是现成的，但它只把账从 0.86 µm 挪到 29.8 nm：**
 *   `plant/edge-aligner`（光栅相位对准 22 nm）+ `plant/laser-stage`（真空台 20 nm）+ 槽深漂 1.7 nm
 *   ⇒ √(20² + 22² + 1.7²) = **29.8 nm**（edge-aligner.ts 问题五）。
 *   √10 × 29.8 = **94.2 nm** —— 对 40 nm 的 13 nm 差 **7.2 倍**，对 8 nm 的 2.7 nm 差 **35 倍**。
 *   再往下要**每层 <4 nm**（自对准通孔或每层一次全场干涉对准），本层没有。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、本文件的投料 / std / 设备白名单（自己划的，违者编译不过）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   投料   mat/copper · mat/sulfuric-acid · mat/hcl · mat/water · mat/photoresist ·
 *          mat/sodium-dichromate · mat/hf · mat/titanium · mat/nitrogen · mat/argon ·
 *          mat/oxygen · mat/silica · mat/tailings
 *          **外加一处链内中间物**：`mat/spin-on-glass`（`make/spin-on-glass`，multilayer.ts:96）。
 *          按 `pcb.ts:176` 的先例：白名单管"从外面拿进来的料"，不拦本链自己刚造出来的中间物 ——
 *          否则 SOG 那条路线在本文件里就一个消费者都没有，链条自己断了。
 *          ⚠️ 白名单里的 `mat/silicon-wafer` 在本文件**一次也没用**，这是故意的：
 *          片子进本文件时已经过了前道，身份是 `mat/device-wafer`。若在这里写硅片，
 *          就等于宣称本文件也做了栅极 —— 见已知缺口①。
 *   std/   std/photomask-general（版；`needs` 里，不被消耗）
 *   设备   全部是既有 87 台里的：wet-bench · resistance-furnace · mask-aligner · evaporator ·
 *          plating-bath · cmp-polisher · ion-beam-figuring · interferometer ·
 *          clean-room · metrology-room · water-polisher · film-monitor · robot
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、R8 —— 每一处降级的升级路线与缺口量级
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * | # | 降级（现在） | 原规格 | 恢复它要什么 | 缺口量级 |
 * |---|---|---|---|---|
 * | ① | 湿法开沟 AR 0.08–0.13（3–5 µm 宽、0.4 µm 深） | AR 2（0.065 × 0.13 µm） | `plant/ion-beam-figuring` 走 `make/damascene-trench-ion`；再加 **1.5–2 µm 厚胶**与**M2 版** | AR 差 15–25 倍；胶厚差 1.5–2 倍；版差 2.5 倍 |
 * | ② | 版只到 3–5 µm（`make/photomask`） | 0.5–0.7 µm（M2）／0.13 µm（M3） | **M3 已建**：`make/photomask-deepsub`（0.1–0.15 µm）；**M2 仍缺**：photorepeater + 0.5 µm 缩微镜头 | 差 5–8 倍（3–5 → 0.5–0.7）；M3 **已闭合**（0.1–0.15 µm 覆盖 0.13） |
 * | ③ | k = 4.0–4.5（硅酸钠系 SOG） | k = 2.5（SiCOH，Si–CH₃） | **甲基源**：甲醇 / MTMS —— 本层有机只到 C1（甲烷）与 C2（乙炔→苯） | k 差 1.6–1.8 倍；有机碳数差 1 个 |
 * | ④ | 阻挡层台阶覆盖 50–60 %（蒸发，直线） | ≥90 %（ALD TaN/TiN 2–3 nm） | TDMAT/TMA 前驱体 + 干泵（10⁻³ Pa）+ 加热管路（防前驱体冷凝） | AR 2 处差 8–11 倍；缺 3 件 |
 * | ⑤ | 化学镀铜（络合剂 0/3、催化剂 0/1） | 0/3 → 3/3 | EDTA（乙二胺 + 一氯乙酸）或酒石酸钾钠或柠檬酸；PdCl₂ 活化（Pd 有海绵料，PdCl₂ 路线未建） | 缺 4 样；与 `pcb.ts:55` 同一缺口 |
 * | ⑥ | 电镀添加剂 0/3 种 | 3 种（PEG / SPS / JGB） | 聚醚、有机硫化物、季铵盐 —— 都要 C3 以上的有机链 | AR 2 处空洞 87 %（判据 <1 %）⇒ 差 2 个数量级 |
 * | ⑦ | dishing 200–230 nm | <10 nm（8 nm 节点） | 终点检测 + 硬垫 + 分区压力闭环 + 0.05 µm 胶体硅浆 | **差 20–23 倍**；只有终点 + slotting 时 40–46 nm（仍差 4 倍） |
 * | ⑧ | 叠 3–8 层（套刻 0.86 µm × √N） | 8–10 层（40 nm）／12–15 层（8 nm） | `edge-aligner` + `laser-stage` 29.8 nm ⇒ √10 = 94.2 nm | 套刻差 29 倍（0.86 µm → 29.8 nm）；仍差 7.2 倍（40 nm）／35 倍（8 nm） |
 * | ⑨ | SOG 带钠（硅酸钠，Na 1–5 wt%） | MOS 级 SiO₂（Na < 1 ppm） | TEOS/硅烷 + CVD 炉（400 °C） | 钠差 4–5 个数量级；缺 1 台设备 + 1 种料 |
 * | ⑩ | 镀液氯离子 300 ppm（工业 40–80） | ±5 ppm | 氯离子选择电极或离子色谱 | 差 4–7 倍；**本层没有在线化学传感器** |
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、已知缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ① **`mat/device-wafer` 的前道在另一份文件。** 它是本文件与"栅极那一半"之间的
 *    那道缝：前道（氧化、光刻、扩散、接触）归 `gate-stack.ts` 等文件，那里已有
 *    SADP/SAQP 等产出路线；本文件只承接它，不在本文件里造它。
 * ② **模型缺口（表达力，不是数据错）**：`std/mcu-40nm-general` 与 `std/soc-8nm-general`
 *    只声明 `node` 与 `layers` 两个属性，**没有 lineWidth / dishing / kValue**。
 *    所以模型看不出"一条 3–5 µm 的互连"与"40 nm / 8 nm 的芯片"不是一回事 ——
 *    本文件不让它们共用一个 id：40 nm 的 `std/mcu-40nm-general` 有路线
 *    `make/mcu-40nm-damascene`（2026-10-20 前是 100–300 nm 后道混合件；现在后道
 *    `make/beol-40nm-8layer` 交 40–100 nm / AR 2–3 / dishing 3–8 / 8 层、LPCVD 钝化）；
 *    8 nm 的 `std/soc-8nm-general` 有路线 `make/soc-8nm-damascene`
 *    （`euv-hina.ts`，node 8–10、15–20 层）。
 *    本层交付另立 `std/mcu-3um-general` 与 `std/soc-3um-general`（`lineWidth 3–5 µm`），
 *    细线档再立 `std/soc-fine-general`（`lineWidth 100–300 nm`，`fine-damascene.ts` 产）。
 *    真话同时钉在两处：`mat/damascene-layer` 的 props 上，与各条芯片路线的 6 个
 *    `need` 上（3–5 µm 那几条报告会一条条点出来；40 nm 那条现在由
 *    `make/beol-40nm-8layer` 一条路线交六格，不再靠逐属性 OR 拼）。
 * ③ **模型的 `need` 按条目聚合，不能逐条路线表态**（与 `cis.ts` 八·③ 同一个缺口）。
 *    所以"AR 0.13 的沟台阶覆盖 50–60 %、AR 2 的沟 8–12 %"写不进 `gives`
 *    （`make/damascene-barrier` 只有一个窗口），只能写在注释里。
 * ④ **没有镀层厚度量具。** `plant/film-monitor` 的石英晶振只测蒸发/溅射的膜厚（0.14 nm 分辨），
 *    电镀的 0.6 µm 只能按法拉第定律算（电流 × 时间，±5 %）—— 铜的电阻率因此测不出，
 *    只能按 1.75–2.2 µΩ·cm 的**上限**记账。
 * ⑤ **dishing 只能抽检 1/25 片、且是破坏性的**（切 1 mm 方坑，干涉仪读台阶，15 nm 一档）
 *    —— 200–230 nm 这个数本身是**开环预算 + 半定量抽检**，不是全检。
 * ⑥ **没有氧分析仪。** 三处栽在氧上：镀液的溶解氧（Cu⁺ 会被氧化成 Cu²⁺ 沉渣）、
 *    HF 槽里的氧（不影响，记在这里是为了完整）、N₂ 氮化炉的残氧（>100 ppm 就长 TiO₂ 而不是 TiN）。
 *    判据只能是"镀层颜色"与"氮化后发蓝还是发金"。
 * ⑦ **`mat/titanium` 没有产出路线**（`subnm-readout.ts:410`：TiCl₄ 要氯气、还原要镁，
 *    铝热法只给 Ti–Al 合金）。所以 `make/damascene-barrier` 的**真正断点在钛上**，
 *    不在蒸发机上 —— 这一条与 ① 合起来是两处断点，不是一个。
 *    ⚠️ 同一份文件第 417 行还写着"**任何路线都不许在 uses 里放它**，唯一例外是
 *    `make/ref-flat-hr-oxide`"。那句话已经被数据推翻了：`cis.ts:850` 就在用（反应溅射的钛靶）。
 *    本文件按同一先例用它 —— 阻挡层这一格必须让断点**看得见**，藏起来才是错的。
 * ⑧ **没有电阻率/应力/附着力的量具**：镀层的方阻只能用惠斯通电桥 + 一段已知图形估，
 *    应力只有"看片弯不弯"，附着力只有"划格 + 胶带拉"（本层没有胶带）。
 * ⑨ **`needs` 不能带属性窗口。** 版、洁净间、量具都是"在场的前提"，写在 `needs` 里；
 *    而 `needs` 是一个裸 id 列表 —— 于是"这一条要 ≤2 µm 的版"写不出来。
 *    本文用两条 `uses` + 6 个 `need` 把**材料侧**的缺口钉住了（那才是主项），
 *    版与量具侧的缺口只能留在 R8 表第②行。这是模型的一处表达力缺口，不是数据的形状。
 * ⑩ **镀层厚度、氯离子、溶解氧、残氧，四样都测不了。** 前两件归 #23 与 ④，
 *    后两件（镀液的 Cu⁺ 与氮化炉的 O₂）连"看颜色"都只能半定量 ——
 *    本文件不假装有它们，判据一律记成"工艺纪律"，不记成"验收"。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目（八件：一片一道缝、四个工艺态、一瓶镀液、两颗 3–5 µm 芯片）
// ═══════════════════════════════════════════════════════════════════════════

export const DAMASCENE_ITEMS: readonly Item[] = [
  /**
   * 电镀铜液。硫酸铜 ~200 g/L + 硫酸 ~150 g/L + 氯离子 ~300 ppm。**添加剂 0 种。**
   *
   * `additiveCount` 是这一格的**交付值**，不是"忘了写"：抑制剂（PEG/PPG）、
   * 加速剂（SPS/MPS）、整平剂（JGB/PEI）三样都是 C3 以上的精细有机，
   * 而本层的有机化学到 C2 为止。没有它们，电镀只能是**保形填充**，
   * 超填充（自下而上）不存在 —— 后果见文件头问三的公式。
   *
   * `chloride` 写在 0–1000 ppm：工业是 40–80 ppm，本层给到 **300 ppm**（4–7 倍），
   * 因为**没有氯离子分析手段**（本层没有在线化学传感器），
   * 只能按称量加、按换槽周期记账。过量的氯让镀层粗 30 %（更糙的表面 = CMP 多磨）。
   */
  {
    id: 'mat/cu-plating-bath',
    name: '电镀铜液',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'additiveCount', kind: 'range', min: 0, max: 3, unit: '种', dir: 'atLeast' },
      { param: 'chloride', kind: 'range', min: 0, max: 1000, unit: 'ppm' },
    ],
  },

  /**
   * 前道做完、互连未做的片 —— **本文件与栅极那一半之间的那道缝。**
   *
   * 本文件不声明它的产出路线（前道归 `gate-stack.ts` 等文件，已有 SADP/SAQP 等路线）。
   * 它不再出现在 `unproduced` 里；本文件只承接它，不假装造它。
   * 40 nm/8 nm 的器件（栅、源漏、接触孔）不是"刻介质 + 填铜"能回答的。
   *
   * `node` 是它唯一的规格 —— 后端只承接它，不改它。
   */
  {
    id: 'mat/device-wafer',
    name: '前道完成片',
    unit: '片',
    category: 'part',
    props: [{ param: 'node', kind: 'range', min: 1, max: 400, unit: 'nm', dir: 'atMost' }],
  },

  /**
   * 开好沟槽、等着镀的片。**第①②段（介质 + 刻蚀）到这里为止。**
   *
   * 三个规格就是这两段的全部质量语言：
   *   lineWidth     沟宽。本层 3–5 µm（**版只到 3–5 µm**，`make/photomask`）
   *   aspectRatio   深/宽。本层 0.08–0.13（0.4 µm 深）—— 不是刻不深，是**宽**：
   *                 3–5 µm 的沟要 AR 0.5 得 1.5–2.5 µm 深，而一层金属 0.4 µm 厚
   *                 是 CMP 的 600 nm 去除量钉死的（去得越深，dishing 的 151 nm 越大）
   *   kValue        介质的介电常数。4.0–4.5（硅酸钠系 SOG）；8 nm 节点要 2.5
   */
  {
    id: 'mat/trench-wafer',
    name: '开好沟槽',
    unit: '片',
    category: 'part',
    props: [
      { param: 'lineWidth', kind: 'range', min: 100, max: 5000, unit: 'nm', dir: 'atMost' },
      { param: 'aspectRatio', kind: 'range', min: 0.05, max: 3, unit: '深/宽', dir: 'atLeast' },
      { param: 'kValue', kind: 'range', min: 2, max: 6, unit: 'εr', dir: 'atMost' },
    ],
  },

  /**
   * 镀完阻挡层与籽晶的片。**第③段到这里为止。**
   *
   *   barrierThickness  场厚（沟外平坦处的厚度）5–10 nm
   *   stepCoverage      侧壁中段厚度 ÷ 场厚。蒸发是直线视线，这一格只能 **50–60 %**；
   *                     保形（≥90 %）要 ALD，而 ALD 要前驱体与干泵，本层都没有
   *
   * 8 nm 节点的阻挡层只有 2–3 nm 厚，要求台阶覆盖 ≥90 % —— 两个数一起看，
   * 才知道这一段的缺口是"厚度 × 保形"而不是"膜不够厚"。
   */
  {
    id: 'mat/barrier-wafer',
    name: '阻挡层籽晶片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'barrierThickness', kind: 'range', min: 0, max: 50, unit: 'nm' },
      { param: 'stepCoverage', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * 电镀填满铜的片。**第④段到这里为止。**
   *
   *   voidFraction  空洞占沟槽体积的比例。判据是"沟口先闭合还是沟底先填满"：
   *                 void ≈ 1 − w/(2·r·d)。AR 0.13 时这个式子给负值（不闭合），
   *                 AR 2 时给 87 %（中心缝）
   *   overburden    场上的过镀层（含沟口蘑菇头）。无整平剂 ⇒ 蘑菇头 2–3 倍，
   *                 CMP 因此要多去 1–2 倍的铜 —— 这一格是⑤段的输入
   */
  {
    id: 'mat/plated-wafer',
    name: '电镀铜片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'voidFraction', kind: 'range', min: 0, max: 50, unit: '%', dir: 'atMost' },
      { param: 'overburden', kind: 'range', min: 0, max: 10000, unit: 'nm', dir: 'atMost' },
    ],
  },

  /**
   * 一层（或一叠）大马士革铜互连 —— **本文件的产物，也是"五段跑完一遍"的凭证。**
   *
   * 六个规格里前五个是五段各自的量，第六个是层数：
   *   lineWidth         3–5 µm（②段给的，⑤段不改图形）
   *   aspectRatio       0.08–0.13
   *   dishing           200–230 nm（⑤段给的，8 nm 判据 <10 nm）
   *   barrierThickness  5–10 nm（③段给的）
   *   kValue            4.0–4.5（①段给的）
   *   layers            1–20。**它是计数，不是循环**：模型没有循环，第 n+1 层就是
   *                     在这一个 id 上再跑一遍（与 `deprocess.ts` 的 `layersRemoved`
   *                     同一个写法）。本层实际能叠到 3–8 层 —— 卡在套刻 0.86 µm × √N。
   *
   * ⚠️ 这个条目是本文件对那颗芯片说的**真话所在**：两条芯片路线要
   * lineWidth ≤100 nm、AR ≥1.5、dishing ≤10 nm、k ≤2.5、layers ≥8 ——
   * 而这里交付的是 3–5 µm / 0.13 / 200–230 / 4.0–4.5 / 1–3。
   * 报告会把这六条一条条点成 `prop_unfilled` + `functional-lost`。
   */
  {
    id: 'mat/damascene-layer',
    name: '单层铜互连片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'lineWidth', kind: 'range', min: 100, max: 5000, unit: 'nm', dir: 'atMost' },
      { param: 'aspectRatio', kind: 'range', min: 0.05, max: 3, unit: '深/宽', dir: 'atLeast' },
      { param: 'dishing', kind: 'range', min: 0, max: 1200, unit: 'nm', dir: 'atMost' },
      { param: 'barrierThickness', kind: 'range', min: 0, max: 50, unit: 'nm' },
      { param: 'kValue', kind: 'range', min: 2, max: 6, unit: 'εr', dir: 'atMost' },
      { param: 'layers', kind: 'range', min: 1, max: 20, unit: '层', dir: 'atLeast' },
    ],
  },

  /**
   * 3–5 µm 互连的 MCU 一颗 —— **本层真正能交付的那颗芯片。**
   *
   * 规格只写后道：`lineWidth 3–5 µm`、`layers 2–3`。**不写 `node`**：
   * 前道是 40 nm 档的 `mat/device-wafer`（SADP 支路，栅长 29–48 nm），
   * 后道只有本文件的 3–5 µm 铜互连。它是一颗 **40 nm 前道 + 3–5 µm 后道**
   * 的混合件；id 里的 `3um` 指后道线宽，不指栅长，也不冒充 40 nm。
   *
   * 六条 40 nm 互连判据不写在这里，而写在 `make/mcu-3um-damascene` 的输入 `need`
   * 上（`functional-lost`）—— 报告点的是"离 40 nm 差多少"，不是"这颗是 40 nm"。
   */
  {
    id: 'std/mcu-3um-general',
    name: '3–5 µm 互连的 MCU',
    unit: '片',
    category: 'part',
    props: [
      { param: 'lineWidth', kind: 'range', min: 3000, max: 5000, unit: 'nm' },
      { param: 'layers', kind: 'range', min: 2, max: 3, unit: '层' },
    ],
  },

  /**
   * 3–5 µm 互连的 SoC 一颗 —— **本层能交付的粗线档，与细线档、8 nm（`euv-hina.ts` 有路线）的条目分开。**
   *
   * 规格只写后道：`lineWidth 3–5 µm`、`layers 2–3`。**不写 `node`**：
   * 前道是 40 nm 档的 `mat/device-wafer`（SADP 支路，栅长 29–48 nm），
   * 后道是 `make/soc-3um-damascene` 的 3–5 µm 铜互连。它是一颗
   * **40 nm 前道 + 3–5 µm 后道**的通用 SoC；id 里的 `3um` 指后道线宽，
   * 不指栅长，也**不冒充 8 nm**。
   *
   * 细线档是另一个件 `std/soc-fine-general`（100–300 nm，`make/fine-soc-interconnect` 产）；
   * 8 nm 的 `std/soc-8nm-general`（`deprocess.ts`）**有路线** `make/soc-8nm-damascene`
   * （`euv-hina.ts`），不是本文件的产物。三颗件不共用一个 id：3–5 µm、100–300 nm、8 nm 各说各的。
   */
  {
    id: 'std/soc-3um-general',
    name: '3–5 µm 互连的 SoC',
    unit: '片',
    category: 'part',
    props: [
      { param: 'lineWidth', kind: 'range', min: 3000, max: 5000, unit: 'nm' },
      { param: 'layers', kind: 'range', min: 2, max: 3, unit: '层' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线（十条：一瓶镀液、五段、一叠层、两颗 3–5 µm 芯片；SoC 另有一条按实物栈走的后道，细线档在 fine-damascene.ts，8 nm SoC 在 euv-hina.ts）
// ═══════════════════════════════════════════════════════════════════════════

export const DAMASCENE_ROUTES: readonly Route[] = [
  {
    /**
     * 电镀铜液。**现场生成硫酸铜**，不买现成的硫酸铜。
     *
     *   铜 80 + 硫酸 274 + 氧 20 + 盐酸 1 + 水 625 = 1000 kg → 镀液 1000 kg
     *
     * 账是死的，一步一步：
     *   Cu 80 kg = 1.26 kmol；Cu + H₂SO₄ + ½O₂ → CuSO₄ + H₂O
     *     ⇒ 耗硫酸 1.26 kmol = **123.6 kg**、耗氧 0.63 kmol = **20.2 kg**
     *     ⇒ 得 CuSO₄ **201 kg**（200 g/L 的槽液 ≈ 1000 L）+ 水 22.7 kg
     *   游离酸 = 274 − 123.6 = **150 kg**（150 g/L；工业 40–80 g/L 的 2 倍 ——
     *   高酸提高分散能力，这是没有添加剂时唯一能改善填充的旋钮）
     *   氯离子 = 1 kg 31 % 盐酸 × 30 % = **0.30 kg = 300 ppm**（工业 40–80 ppm）
     *   水 625 + 反应生成 22.7 = 647.7 kg
     *   ⇒ 201 + 150 + 0.3 + 647.7 = **999 kg ≈ 1000**，进 1000 出 1000 ✓（不用 unbalanced）
     *
     * ⚠️ 水只能是 `mat/water`（1–1000 µS/cm），不是 18 MΩ·cm 的去离子水：
     * `plant/water-polisher` 有（1000 → 950 kg），但本文件按投料白名单只写 `mat/water`。
     * 后果是钙镁随水进槽 —— 镀层里 10–100 ppm 的金属杂质，电阻率高 3–8 %。
     * 这一条与 `deprocess.ts:757` 是同一个缺口。
     */
    id: 'make/cu-plating-bath',
    name: '电镀铜液制备',
    produces: [
      {
        item: 'mat/cu-plating-bath',
        qty: q(1000),
        gives: [
          { param: 'additiveCount', kind: 'range', min: 0, max: 0 },
          { param: 'chloride', kind: 'range', min: 300, max: 300 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(80) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(274) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(20) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(625) }] },
    ],
    needs: ['plant/water-polisher'],
    performedBy: 'plant/wet-bench',
    under: [{ param: 'temperature', min: 20, max: 40 }],
  },

  {
    /**
     * **①② 介质沉积 + 沟槽刻蚀（本层的主路，也是降级最大的一段）。**
     *
     *   片 1 + 旋涂玻璃 0.001 kg + 胶 0.001 kg + 氢氟酸 0.01 kg + 水 1 kg
     *   → 开好沟的片 1（3–5 µm 宽、0.4 µm 深、k 4.0–4.5）
     *
     * ① 介质：工业是 CVD TEOS（硅烷 + 氧，400 °C）。本层没有硅烷、没有 CVD 炉，
     *    退到**旋涂玻璃**（`mat/spin-on-glass`，硅酸钠溶水，multilayer.ts:96）：
     *    每道 0.25 µm（10–20 cP、2000 r/min、甩 1 min），400–450 °C 固化 30 min，
     *    缩聚失水缩 20–30 % ⇒ **涂两道得 0.4 µm**。
     *    ⚠️ 它带钠（硅酸钠，Na 1–5 wt%）：钠离子在电场与潮气下漂移，对 MOS 是死刑。
     *    本层的双极型电路能忍（multilayer.ts 已说过同一句），40 nm/8 nm 的 MOS **不能**。
     *    这一条是"能做出沟"与"能做互连"之间的距离 —— 前者是本条路线，后者要 CVD。
     *
     * ② 沟槽：5 % HF、20 °C、**1.3–2 min** 刻 0.4 µm。各向同性 ⇒ 侧蚀 = 深度；
     *    3 µm 的沟变 3.8 µm（+27 %），线间还剩 2.2 µm 介质墙，不并拢 ✓。
     *    0.13 µm 的沟在同一道工序里**做不到**（刻到 1/4 深处相邻沟就合并，
     *    且 AR 上限 0.5）—— 见文件头问一。
     *
     * ⚠️ 刻蚀深度没有终点：只能定时，±10 s = ±8–13 % = ±30–50 nm。
     *    这 30–50 nm 直接进 CMP 的去除量，也就是直接进 dishing。
     */
    id: 'make/damascene-trench',
    name: '开好沟槽制造',
    produces: [
      {
        item: 'mat/trench-wafer',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 3000, max: 5000 },
          { param: 'aspectRatio', kind: 'range', min: 0.08, max: 0.13 },
          { param: 'kValue', kind: 'range', min: 4.0, max: 4.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/device-wafer', qty: q(1) }] },
      // 实用量，不是成膜量：0.4 µm × 78.5 cm² = 3.1 µL，甩掉 95 % ⇒ 60 µL/道，
      // 两道 0.12 g。取 1 g 是给过滤损耗、缩聚失水与返工留的余量。
      { anyOf: [{ item: 'mat/spin-on-glass', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['std/photomask-general', 'plant/clean-room'],
    rate: { hours: q(2) },
    steps: [
      {
        note_zh:
          '旋涂 ×2 且每道固化：10–20 cP 的 SOG 甩 2000 r/min 得 0.25 µm，400–450 °C 固化 30 min（缩聚失水缩 20–30 %），两道得 0.4 µm —— 一道涂 0.4 µm 会缩出裂纹',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
      {
        note_zh:
          '光刻：辊涂 5 µm 负胶、100–110 °C 烘 10 min、接触曝光（版 3–5 µm、对位 ±0.86 µm）、碱水显影',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '5 % HF 开沟 1.3–2 min：SOG 是多孔硅酸盐，比热氧化层快 2–3 倍（0.2–0.3 µm/min）；各向同性 ⇒ 侧蚀 = 深度 = 0.4 µm，3 µm 的沟变 3.8 µm',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '去胶：70–90 °C 热水 + 铜丝刷 —— 交联过的重铬酸盐胶没有溶剂可溶，只有热碱与力。0.13 µm 的图形会在这把刷子下面消失',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 70, max: 90 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
    ],
  },

  {
    /**
     * **② 的升级路线：离子束开沟（各向异性）。**
     *
     *   片 1 + SOG 0.005 + 厚胶 0.002 + 氩 0.002 + 水 1 → 开好沟的片 1（1–2 µm 宽、AR 1.2–1.6）
     *
     * `plant/ion-beam-figuring` 是 Kaufman 源（Ar 500 eV），物理溅射：
     * **侧壁 80–85°，AR 1.2–1.6 开得出来** —— 这是本层唯一真正的干法刻蚀。
     * 三条代价，每一条都写在下面：
     *
     *   ① **选择比 1:1**（胶 : SiO₂）⇒ 刻 1.2–1.6 µm 要 1.5–2 µm 的胶，
     *      本层胶厚上限 1.0 µm（`cis.ts:878`）⇒ **差 1.5–2 倍**，所以写成两道厚胶
     *   ② **束斑 25 mm FWHM 的高斯 + 扫描台 ±2 mm** ⇒ 均匀性 ±15 %
     *      （1.6 µm 深 = ±240 nm 的深度差，这是"深度"这一格的硬底）
     *   ③ **没有终点、没有底层选择** ⇒ 定时 ±15 %，过刻就打穿下层铜
     *
     * 速率：500 eV Ar 对 SiO₂ 约 18–20 nm/min（0.3 nm/s）⇒ 1.2 µm 要 **60–67 min**。
     *
     * 版要更细，但这件事**写不进数据**：版在 `needs` 里，而 `needs` 是一个裸 id 列表，
     * 没有属性窗口（模型缺口，见已知缺口③）。本层 `make/photomask` 只给 3–5 µm，
     * 所以这一条的 1–2 µm 线宽**跟着版走**："要 ≤2 µm 的版"只能写在 R8 表第②行里，
     * 缺口 2.5 倍。版不够细时这一条退到与 `make/damascene-trench` 同档的 3–5 µm / AR 0.5
     * —— 那时离子束买到的是**深度**（AR 0.13 → 0.5，金属厚 4 倍），不是宽度。
     */
    id: 'make/damascene-trench-ion',
    name: '开好沟槽制造',
    produces: [
      {
        item: 'mat/trench-wafer',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 1000, max: 2000 },
          { param: 'aspectRatio', kind: 'range', min: 1.2, max: 1.6 },
          { param: 'kValue', kind: 'range', min: 4.0, max: 4.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/device-wafer', qty: q(1) }] },
      // 1.2–1.6 µm 的介质要涂 5–6 道（每道 0.25 µm）
      { anyOf: [{ item: 'mat/spin-on-glass', qty: q(1, 200) }] },
      // 1.5–2 µm 的厚胶（选择性 1:1，胶必须比要刻的深）
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 500) }] },
      // 工作气：0.5 Pa、10 sccm、67 min → 670 cm³ = 0.03 mol × 40 = 1.2 g
      { anyOf: [{ item: 'mat/argon', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['std/photomask-general', 'plant/clean-room'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh: '旋涂 ×5 + 每道 400–450 °C 固化：1.2–1.6 µm 的介质，一道一道来（缩 20–30 %，裂纹比厚度可怕）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
      {
        note_zh:
          '厚胶光刻：1.5–2 µm 胶（两道辊涂）、接触曝光、显影 —— 要 1–2 µm 的线，版也得到 1–2 µm',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '离子束刻蚀（Ar 500 eV、0.3 nm/s）：各向异性、侧壁 80–85°，1.2–1.6 µm 深要 60–67 min；束斑 25 mm FWHM + 扫描台 ±2 mm ⇒ 均匀性 ±15 %',
        performedBy: 'plant/ion-beam-figuring',
        under: [{ param: 'pressure', min: 0.05, max: 0.5 }],
      },
      {
        note_zh: '去胶：70–90 °C 热水 + 刷（离子束把胶表面碳化了，热水要多泡 10 min）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 70, max: 90 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
    ],
  },

  {
    /**
     * **③ 阻挡层与籽晶层 —— 蒸发能镀，但"保形"做不到。**
     *
     *   片 1 + 钛 0.001 kg + 氮 0.01 kg + 铜 0.001 kg → 镀好的片 1
     *
     * 三步：蒸钛 5–10 nm（0.1 nm/s ⇒ 50–100 s）→ 650–750 °C、N₂ 60 min 氮化
     * → 蒸铜籽晶 100 nm（0.3 nm/s ⇒ 5.6 min）。
     *
     * 为什么钛能氮化透：N 在 Ti 里的扩散系数 600 °C 约 1×10⁻¹² cm²/s ⇒
     *   √(Dt) = 0.6 µm ≫ 10 nm ⇒ 5–10 nm 的膜在 1 h 内**全氮化** ✓
     * 为什么温度不能上 800：Ti 会在 700 °C 以上还原 SOG 里的 SiO₂（Ti + SiO₂ → TiO₂ + Si），
     *   界面长出一层 TiO₂/Si 混合 —— 阻挡层变成了电阻层。
     *
     * **台阶覆盖是本条的命门：50–60 %（AR 0.13 的沟）。**
     *   蒸发是直线视线（0.1–1 Pa、平均自由程 1 cm ≫ 沟宽）：侧壁只接到斜着进来的一部分通量。
     *   手册值：AR 0.1 → 55–65 %、0.5 → 35–45 %、1 → 20–25 %、2 → **8–12 %**、4 → 3–5 %。
     *   ⇒ 本层的沟 5–10 nm 的 Ti 在侧壁剩 2.5–6 nm，氮化后仍 > 2–3 nm 的连续阈值（勉强 ✓）
     *   ⇒ 40 nm 的 AR 2 沟只剩 0.4–1.2 nm，**岛状不连续**（✗）：铜会穿过它，
     *      300 °C 下 D ≈ 1e-13 cm²/s ⇒ 0.19 µm/h ⇒ 0.4 µm 的介质 2 h 穿透。
     *
     * 无电镀（electroless）为什么不写：缺络合剂（EDTA/酒石酸/柠檬酸，0/3）与活化催化剂
     * （PdCl₂，0/1；Pd 有海绵料，但 PdCl₂ 路线未建）—— 与 `data/material/pcb.ts:55` 是同一个缺口，那里用它做孔壁的
     * 化学镀铜种子层，最后也是退到石墨浆。
     */
    id: 'make/damascene-barrier',
    name: '阻挡层籽晶片制造',
    produces: [
      {
        item: 'mat/barrier-wafer',
        qty: q(1),
        gives: [
          { param: 'barrierThickness', kind: 'range', min: 5, max: 10 },
          { param: 'stepCoverage', kind: 'range', min: 50, max: 60 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/trench-wafer', qty: q(1) }] },
      // 膜本身只有 78.5 cm² × 10 nm × 4.5 = 0.35 mg，取 1 g 是给舟上损耗与换舟留的
      { anyOf: [{ item: 'mat/titanium', qty: q(1, 1000) }] },
      // 氮化气：1 atm 的炉膛换三次 + 60 min 流过，10 g 够
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 100) }] },
      // 籽晶 100 nm：78.5 cm² × 100 nm × 8.96 = 7 mg，取 1 g
      { anyOf: [{ item: 'mat/copper', qty: q(1, 1000) }] },
    ],
    // QCM 读蒸发膜厚（0.14 nm 分辨 = 5 nm 的 2.8 %）—— 这是本段唯一能测的量
    needs: ['plant/film-monitor'],
    rate: { hours: q(2) },
    steps: [
      {
        note_zh:
          '蒸发钛 5–10 nm：W 舟、0.1–1 Pa、0.1 nm/s ⇒ 50–100 s；QCM 盯着厚度 —— 没有它就只能按时间猜（±30 %）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 2 }],
      },
      {
        note_zh:
          '氮化：650–750 °C、N₂ 60 min ⇒ 5–10 nm 全氮化（N 在 Ti 里 0.6 µm/h）。温度不能上 800：Ti 会把 SOG 的 SiO₂ 还原成 TiO₂ + Si',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 650, max: 750 }],
      },
      {
        note_zh:
          '蒸铜籽晶 100 nm（0.3 nm/s、5.6 min）：台阶覆盖 50–60 % ⇒ 侧壁 50–60 nm，高于铜的渗流阈值 5–8 nm ✓（籽晶比阻挡层宽容，因为它只要导电，不要求致密）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 2 }],
      },
    ],
  },

  {
    /**
     * **④ 电镀铜填沟 —— 没有添加剂，但沟浅，所以能填满。**
     *
     *   片 1 + 镀液 0.02 kg + 铜（阳极）0.001 kg + 水 1 kg → 填满铜的片 1
     *
     * 法拉第账：1.186 g/(A·h)，2 A/dm² ⇒ **26.5 µm/h** ⇒ 0.6 µm（0.4 沟 + 0.2 余量）
     *   要 **1.4 min**；加上装夹与预浸，一批 0.1 h。
     *   铜阳极用量：78.5 cm² × 0.6 µm × 8.96 = **0.042 g**（取 1 g，余下是阳极泥与挂具镀层）。
     *
     * 空洞按 `void ≈ 1 − w/(2·r·d)` 算（r = 沟口/沟底电流密度比，本层搅拌下 1.05）：
     *   1 − 3/(2 × 1.05 × 0.4) = −2.6 < 0 ⇒ 沟口闭合不了 ⇒ **保形填满**。
     *   交付的 5–15 % 是颗粒与氢气泡的偶然空洞（没有过滤的槽液、没有除氧）。
     *   ⚠️ 这一格**只在 AR ≤ 0.4 时成立**：AR 0.5 是 17 %，AR 2 是 87 %（中心缝）。
     *   所以"没有添加剂"这件事的真实价格，要到 40 nm 的沟里才付 —— 见文件头问三。
     *
     * 蘑菇头：没有整平剂，沟口电流密度是场区的 2–3 倍 ⇒ 沟口过镀 2–3 倍（overburden 200–500 nm），
     *   CMP 因此要多去 1–2 倍的铜 —— 这也是 dishing 变大的一个来源。
     */
    id: 'make/damascene-plate',
    name: '电镀铜片制造',
    produces: [
      {
        item: 'mat/plated-wafer',
        qty: q(1),
        gives: [
          { param: 'voidFraction', kind: 'range', min: 5, max: 15 },
          { param: 'overburden', kind: 'range', min: 200, max: 500 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/barrier-wafer', qty: q(1) }] },
      // 带出与换槽：一片带走 1–5 mL 槽液 + 过滤损耗
      { anyOf: [{ item: 'mat/cu-plating-bath', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/plating-bath',
    under: [
      { param: 'temperature', min: 40, max: 50 },
      { param: 'pressure', min: 15, max: 20 },
    ],
    rate: { hours: q(1, 10) },
  },

  {
    /**
     * **⑤ CMP 去多余铜 —— 这一段是本文件最贵的一格。**
     *
     *   片 1 + 石英粉 0.05 + 重铬酸钠 0.005 + 水 1 + 尾矿砂 0.01 → 一层互连 1 片
     *
     * 投料沿用 `make/wafer-level-cmp` 的口径（每片每层）：浆 1 kg、石英粉 5 wt%、
     * 重铬酸钠 0.5 wt%（氧化剂：Cu → CuO → 被磨掉）、尾矿砂是修整环每片的消耗。
     *
     * 抛光 7.6 min（600 nm ÷ 198 nm/min，Cu 的 k = 2.5e-13）；Cu : SiO₂ 选择性 2.5:1。
     * dishing 的账写在文件头问四：**151 nm（±10 % 定时的 46 s）+ 50–80 nm（垫弯曲）= 200–230 nm**。
     *
     * **这一条路线不改图形**（CMP 只去铜），所以 lineWidth / aspectRatio 的窗口是
     * 上游两条沟槽路线（3–5 µm 与 1–2 µm）的并集 —— 0.08–1.6。这不是懒，是事实。
     */
    id: 'make/damascene-cmp',
    name: '单层铜互连片制造',
    produces: [
      {
        item: 'mat/damascene-layer',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 1000, max: 5000 },
          { param: 'aspectRatio', kind: 'range', min: 0.08, max: 1.6 },
          { param: 'dishing', kind: 'range', min: 200, max: 230 },
          { param: 'barrierThickness', kind: 'range', min: 5, max: 10 },
          { param: 'kValue', kind: 'range', min: 4.0, max: 4.5 },
          { param: 'layers', kind: 'range', min: 1, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/plated-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sodium-dichromate', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room', 'plant/water-polisher'],
    rate: { hours: q(1, 5) },
    steps: [
      {
        note_zh:
          '配浆：石英粉 5 wt% + 重铬酸钠 0.5 wt%，沉降 35 h 取 0.3 µm 那一档（粗粉是划痕源），20–60 °C 搅 30 min',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: '装片与球铰找正：弹性背垫 + 挡圈压边，球铰让片自己摆平（倾斜 ≤0.03°）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '抛光 7.6 min（600 nm ÷ 198 nm/min）：盘与载片头同速 30 r/min、压力 21 kPa、浆 200 mL/min；**温度没人维持**（车间 15–30 °C，铜的化学项 2–5 %/K）—— 定时 ±10 % 的 46 s 里露出来的铜走 151 nm，这就是 dishing 的主项',
        performedBy: 'plant/cmp-polisher',
        under: [{ param: 'pressure', min: 15, max: 30 }],
      },
      {
        note_zh: '修整垫 30 s：铸铁环 + 尾矿砂把釉化的垫面拉毛（修整后必须冲洗，砂本身是划痕源）',
        performedBy: 'plant/cmp-polisher',
        under: [{ param: 'pressure', min: 15, max: 30 }],
      },
      {
        note_zh: '冲洗与甩干 60 s（去离子水，量不计入，只写 needs）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          'dishing 抽检 1/25 片：切 1 mm 方坑、干涉仪读台阶（15 nm 一档 = 200 nm 的 7.5 %）—— **破坏性、半定量**，200–230 nm 这个数是开环预算 + 抽检',
        performedBy: 'plant/interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **⑥ 叠第 n+1 层 —— 每叠一层，就把五段重跑一遍。**
     *
     *   已叠的片 1（n 层）+ 上层的全套料 → 已叠的片 1（n+1 层）
     *
     * 模型没有循环，所以"层数"用计数表达：这条路线消费 `mat/damascene-layer`
     * （任意层数）再产出一个 `mat/damascene-layer`，`gives` 里写 **2–3 层**。
     * 这个上限不是任意的，是算出来的（文件头问五）：
     *
     *   套刻 √N × 0.86 µm，通孔要落在线上 ⇒ √N × 0.86 ≤ w/2
     *   3 µm 线（余量 1.5 µm）⇒ N ≤ 3.04 ⇒ **3 层**
     *   5 µm 线（余量 2.5 µm）⇒ N ≤ 8.5  ⇒ 8 层（那一档本文件不另写路线，只在 R8 表⑧记账）
     *
     * 为什么不是 8–10 层：dishing 累积到 √8 × 215 = 608 nm，已经等于一层金属的厚度；
     * 套刻到 √8 × 0.86 = 2.43 µm，是 3 µm 线的 0.8 倍 —— 通孔根本落不到线上。
     *
     * 升到 8–15 层要 `plant/edge-aligner` + `plant/laser-stage`（29.8 nm/层），
     * 那时 √10 × 29.8 = 94.2 nm，对 40 nm 节点的 13 nm 仍差 7.2 倍（见 R8 表第⑧行）。
     */
    id: 'make/damascene-stack',
    name: '单层铜互连片制造',
    produces: [
      {
        item: 'mat/damascene-layer',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 3000, max: 5000 },
          { param: 'aspectRatio', kind: 'range', min: 0.08, max: 0.13 },
          { param: 'dishing', kind: 'range', min: 200, max: 230 },
          { param: 'barrierThickness', kind: 'range', min: 5, max: 10 },
          { param: 'kValue', kind: 'range', min: 4.0, max: 4.5 },
          { param: 'layers', kind: 'range', min: 2, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/damascene-layer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/spin-on-glass', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 100) }] },
      // 阻挡层 1 g + 籽晶 1 g
      { anyOf: [{ item: 'mat/titanium', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/cu-plating-bath', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/sodium-dichromate', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['std/photomask-general', 'plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh: '① 介质：旋涂 ×2 + 400–450 °C 固化（同 make/damascene-trench，只是叠在上层的 dishing 之上）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
      {
        note_zh: '② 光刻：换本层的版（对位 ±0.86 µm —— 这一格就是层数的上限所在）',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh: '② 刻沟与去胶：5 % HF 1.3–2 min + 70–90 °C 热水刷胶',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 70, max: 90 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: '③ 蒸钛 5–10 nm（0.1 nm/s）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 2 }],
      },
      {
        note_zh: '③ 氮化 650–750 °C、N₂ 60 min；然后蒸铜籽晶 100 nm（同一台机、两次装舟）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 650, max: 750 }],
      },
      {
        note_zh: '④ 电镀 1.4 min（2 A/dm²、26.5 µm/h）+ 冲洗',
        performedBy: 'plant/plating-bath',
        under: [
          { param: 'temperature', min: 40, max: 50 },
          { param: 'pressure', min: 15, max: 20 },
        ],
      },
      {
        note_zh: '⑤ CMP 7.6 min + 修整 30 s：每一层都要付一次 200–230 nm 的 dishing',
        performedBy: 'plant/cmp-polisher',
        under: [{ param: 'pressure', min: 15, max: 30 }],
      },
      {
        note_zh: '⑤ 抽检：通孔与下层的套刻（这一条只能靠"切开工字形看"——本层没有套刻测量机）',
        performedBy: 'plant/interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **本层能交付的那颗 MCU：3–5 µm 互连的后半条。**
     *
     *   前道片 1 + 一层大马士革 1 → 3–5 µm 互连 MCU 1 片
     *
     * 这条路线只做"拼接 + 划片 + 装架 + 键合 + 封帽 + 测试"，五段互连在
     * `make/damascene-trench` / `-barrier` / `-plate` / `-cmp` / `-stack` 里，
     * 前道在 `mat/device-wafer` 那一半（另一份文件）。
     *
     * ⚠️ **互连那六个 `need` 一个都够不着，六个全是 functional-lost。** 这是本文件最要紧的一处：
     * 40 nm 的 `std/mcu-40nm-general` 现在有路线 `make/mcu-40nm-damascene`：
     * 后道 `make/beol-40nm-8layer` 交 40–100 nm / AR 2–3 / dishing 3–8 / 8 层、
     * 钝化 LPCVD Si₃N₄（2026-10-20 前的“100–300 nm 后道混合件”口径已不成立）；
     * 这条路线交的是 `std/mcu-3um-general` —— 它的规格是 3–5 µm 互连、
     * 2–3 层，不是 40 nm。把六条 40 nm 判据留在输入 `need` 上，报告才会一条条点出来：
     *
     *   lineWidth ≤ 100 nm   交付 3000–5000  ⇒ 差 30–50 倍
     *   AR ≥ 1.5             交付 0.08–0.13   ⇒ 差 12–19 倍
     *   dishing ≤ 10 nm      交付 200–230     ⇒ 差 20–23 倍
     *   barrier ≤ 3 nm       交付 5–10        ⇒ 差 1.7–3.3 倍
     *   kValue ≤ 2.5         交付 4.0–4.5     ⇒ 差 1.6–1.8 倍
     *   layers ≥ 8           交付 2–3         ⇒ 差 2.7–4 倍
     *
     * `gives` 只写实物：`lineWidth 3000–5000` 与 `layers 2–3`。不再写 `node 40` ——
     * 前道片的 40 nm 是 `mat/device-wafer` 的输入判据（见上面的 need），不是这颗
     * 3–5 µm 互连件的规格。交付与要求分开两行，读的人一眼能看出差在哪。
     */
    id: 'make/mcu-3um-damascene',
    name: '3–5 µm 互连的 MCU 制造',
    produces: [
      {
        item: 'std/mcu-3um-general',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 3000, max: 5000 },
          { param: 'layers', kind: 'range', min: 2, max: 3 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/device-wafer',
            qty: q(1),
            need: [{ param: 'node', kind: 'range', max: 50, dir: 'atMost' }],
            onRelax: 'functional-lost',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/damascene-layer',
            qty: q(1),
            need: [
              { param: 'lineWidth', kind: 'range', max: 100, dir: 'atMost' },
              { param: 'aspectRatio', kind: 'range', min: 1.5, dir: 'atLeast' },
              { param: 'dishing', kind: 'range', max: 10, dir: 'atMost' },
              { param: 'barrierThickness', kind: 'range', max: 3, dir: 'atMost' },
              { param: 'kValue', kind: 'range', max: 2.5, dir: 'atMost' },
              { param: 'layers', kind: 'range', min: 8, dir: 'atLeast' },
            ],
            onRelax: 'functional-lost',
          },
        ],
      },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      {
        note_zh:
          '钝化与划片：氮化硅/酚醛钝化层（本层没有 Si₃N₄，用 SOG + 酚醛双层）→ 划片（手磨硬质合金轮，每片 200–400 个 die）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '装架、键合、封帽、测试：与 make/counter-chip 的⑧同一套（芯片 1 片的引线 8–40 根、金属帽、逐只测通断与漏电）',
        performedBy: 'plant/robot',
      },
    ],
  },

  {
    /**
     * **3–5 µm 互连 SoC 的后半条：带料账的那条。**
     *
     * 与 `make/soc-3um-damascene` 交同一个条目、同一档后道（`make/damascene-stack`
     * 的 3–5 µm / 2–3 层 / 阻挡 5–10 / k 4–4.5）；本条另写键合用的铝与水，并给批次
     * `rate`。两条都按 3–5 µm / 2–3 层写；8 nm 档的六条判据在 `make/soc-8nm-damascene`。
     *
     * 前道仍是 40 nm 档的 `mat/device-wafer`（`make/device-wafer`，node 40–400）：
     * 3–5 µm 是**后道线宽**，不是栅长。把 40 nm 前道 + 3–5 µm 后道拼成一颗
     * 通用 SoC，与 `make/mcu-3um-stack` 的拼法相同，只是 die 数与焊盘数不同。
     *
     * 缺口没变：这是 3–5 µm、2–3 层的板，不是 40 nm，也不是 8 nm。40 nm 的
     * 路线是 `make/mcu-40nm-damascene`（后道 `make/beol-40nm-8layer`），8 nm 的
     * 路线是 `make/soc-8nm-damascene`（`euv-hina.ts`）；三档各一个条目、各一条路线。
     *
     * ⚠️ `rate 24 h` 是按 `make/mcu-3um-stack` 同型取的估算，不是实测节拍；
     * die 数 3 000–8 000 与焊盘 200–400 来自 `make/soc-3um-damascene` 的注释。
     */
    id: 'make/soc-3um-stack',
    name: '3–5 µm 互连的 SoC 制造',
    produces: [
      {
        item: 'std/soc-3um-general',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 3000, max: 5000 },
          { param: 'layers', kind: 'range', min: 2, max: 3 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/device-wafer',
            qty: q(1),
            need: [{ param: 'node', kind: 'range', max: 50, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/damascene-layer',
            qty: q(1),
            need: [
              { param: 'lineWidth', kind: 'range', min: 3000, max: 5000 },
              { param: 'layers', kind: 'range', min: 2, max: 3 },
              { param: 'barrierThickness', kind: 'range', min: 5, max: 10 },
              { param: 'kValue', kind: 'range', min: 4, max: 4.5 },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh:
          '钝化与划片：SOG + 酚醛双层钝化 → 手磨硬质合金轮划片（3–5 µm 线宽；每片 3 000–8 000 个 die 与 200–400 个焊盘是设计估算，不是实测）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '装架、键合、封帽、测试：引线键合 200–400 个焊盘（倒装焊要助焊剂，本层没有）→ 金属帽 → 逐片测通断与漏电',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '硅片 1 片 + 3–5 µm 互连层 1 片 + 铝 0.01 + 水 1 → SoC 1 片；余是划片道、封帽边角与测试报废。产物按片计，不做质量守恒',
  },

  {
    /**
     * **两颗芯片之二：3–5 µm 互连 SoC 的后半条 —— 从粗线栈交出那颗通用 SoC。**
     *
     * 工序与 `make/mcu-3um-damascene` 同一套：钝化 → 划片 → 装架、键合、封帽、测试。
     * 输入按本件交付的规格写：前道是 40 nm 档的 `mat/device-wafer`（node ≤50），
     * 后道是 `make/damascene-stack` 交的 3–5 µm / 2–3 层 / 阻挡 5–10 / k 4–4.5 的层。
     *
     * 8 nm 档的六条判据（线宽 ≤30 nm、AR ≥2、dishing ≤5、barrier ≤2、k ≤2.5、
     * 层数 ≥12）写在 `make/soc-8nm-damascene` 的输入上：那一档的卡点是 12–15 层的
     * 套刻（要 ≤10 nm/层，本层最好的组合是 29.8 nm，√12 × 29.8 = 103 nm），
     * 不是本条的 3–5 µm 栈。
     *
     * die 3 000–8 000 只、焊盘 200–400 个、划片道 0.1 mm（刀痕 0.05–0.1 mm 吃掉
     * 10–20 % 面积）是设计估算，不是实测。
     */
    id: 'make/soc-3um-damascene',
    name: '3–5 µm 互连的 SoC 制造',
    produces: [
      {
        item: 'std/soc-3um-general',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 3000, max: 5000 },
          { param: 'layers', kind: 'range', min: 2, max: 3 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/device-wafer',
            qty: q(1),
            need: [{ param: 'node', kind: 'range', max: 50, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/damascene-layer',
            qty: q(1),
            need: [
              { param: 'lineWidth', kind: 'range', min: 3000, max: 5000 },
              { param: 'layers', kind: 'range', min: 2, max: 3 },
              { param: 'barrierThickness', kind: 'range', min: 5, max: 10 },
              { param: 'kValue', kind: 'range', min: 4, max: 4.5 },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      {
        note_zh:
          '钝化与划片：与 `make/mcu-3um-damascene` 同一套（die 更小、每片 3 000–8 000 个），划片道 0.1 mm —— 本层的刀痕宽度就是 0.05–0.1 mm，划片道吃掉 10–20 % 的面积',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '装架、键合、封帽、测试：倒装焊要焊球（锡有）与助焊剂（没有），只能走引线键合 ⇒ 焊盘数限制在 200–400 个',
        performedBy: 'plant/robot',
      },
    ],
  },
  {
    /**
     * **3–5 µm 互连的那颗 MCU：按它真正吃的栈来要求。**
     *
     * `make/mcu-3um-damascene` 把 40 nm 的六条判据写在输入上，是为了让报告点名缺口 ——
     * 那条路线因此永远跑不通。本条不删它，只在旁边给一条**真能跑**的：吃
     * `make/damascene-stack` 交的那档栈（线宽 3000–5000、2–3 层、阻挡 5–10、k 4–4.5、
     * dishing 200–230），交同一个条目 `std/mcu-3um-general`。
     *
     * 代价写清楚：这是 3–5 µm、2–3 层的板，不是 40 nm。40 nm 现在有路线
     * `make/mcu-40nm-damascene`：后道 `make/beol-40nm-8layer` 交 40–100 nm /
     * AR 2–3 / dishing 3–8 / 8 层、钝化 LPCVD Si₃N₄；2026-10-20 前的
     * “100–300 nm 后道混合件”口径已不成立；两件事分开记。
     */
    id: 'make/mcu-3um-stack',
    name: '3–5 µm 互连的 MCU 制造',
    produces: [
      {
        item: 'std/mcu-3um-general',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 3000, max: 5000 },
          { param: 'layers', kind: 'range', min: 2, max: 3 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/device-wafer',
            qty: q(1),
            need: [{ param: 'node', kind: 'range', max: 50, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/damascene-layer',
            qty: q(1),
            need: [
              { param: 'lineWidth', kind: 'range', min: 3000, max: 5000 },
              { param: 'layers', kind: 'range', min: 2, max: 3 },
              { param: 'barrierThickness', kind: 'range', min: 5, max: 10 },
              { param: 'kValue', kind: 'range', min: 4, max: 4.5 },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: '钝化与划片：SOG + 酚醛双层钝化 → 手磨硬质合金轮划片（每片 200–400 个 die）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '装架、键合、封帽、测试：与 make/counter-chip 的⑧同一套（引线 8–40 根、金属帽、逐只测通断与漏电）',
        performedBy: 'plant/robot',
      },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...DAMASCENE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...DAMASCENE_ROUTES];
