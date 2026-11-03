/**
 * 剥层与复版 —— 把一颗封好的片子一层层打开、读成一套版，再把版写回新片。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 这一份补的是四段工艺，不是一台机器
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 机器人身上有两颗要"复制"的片子：40 nm 的 MCU（本地有路线；2026-10-20 前是
 * 100–300 nm 后道混合件，现在后道 40–100 nm、LPCVD 钝化）与 8 nm 的 SoC
 * （本地也有路线 `make/soc-8nm-damascene`，见 `euv-hina.ts`）。要"复制"它们，
 * 缺的不是一台设备，而是四段工艺：
 *
 *   ① 开盖          磨掉封装到露出硅片正面（磨到剩 50 µm 停，最后 50 µm 交给化学）
 *   ② 逐层去层      钝化 / 金属 / 介质 / 多晶硅，一层一层剥，每层停在界面上
 *   ③ 读与存        每层读成一张手刻原图，20 张原图缩微成一套版 —— **版就是存储器**
 *   ④ 写回新片      涂胶、穿版曝光、显影、腐蚀、蒸铝、合金化，再进下一层
 *
 * ⚠️ **本文件不新增设备。** 剥层与复版是一套**配方**，它落在已有的六台上：
 *    `plant/grinder`、`plant/cmp-polisher`、`plant/comparator`、`plant/wet-bench`、
 *    `plant/mask-aligner`、`plant/robot`。唯一的"新机器"是读+写两用的电子束柱
 *    （`plant/e-beam-column`，另一路在建），它不在本文件的 65 台白名单里 ——
 *    所以这里一条它的路线都不写，只在缺口里记着。**这不是遗漏，是分工。**
 *
 * ⚠️ 本文件只写**工艺**，不改任何既有文件；接线（`tools/report.ts` 的 import 与展开）
 *    由主 agent 做。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、怎么知道磨到了哪一层 —— 没有膜厚仪、没有椭偏仪、**也没有天平**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 先掐掉三条看着能用的路：
 *
 *   称重   本层**没有天平条目**。`plant/comparator` 是光学比较仪，读的是长度
 *          （props：range 0–25 mm、resolution 0.001–0.01 mm），不是质量。
 *          就算有 0.1 g 分度：5×5 mm 的封装面上磨掉 50 µm 环氧模塑料
 *          （ρ = 1.9 g/cm³，70–80 wt% 熔融硅粉）= **2.4 mg**，差 40 倍；
 *          1 cm² 的封装也是 9.5 mg，仍差 10 倍。**判不出来，不是"不够准"。**
 *   超声   石英是压电的，本层也拿它做振荡器（`std/quartz-resonator-general`），但测厚要
 *          宽带脉冲回波：石英 Q 高（10⁴–10⁶）、带宽窄，出不了 µs 级回波；本层也没有
 *          换能器的做法（切型、电极、背衬、声匹配层）。而且 10 MHz 在 EMC 的
 *          2500 m/s 声速下波长 0.25 mm，厚度分辨力 λ/2 = **125 µm** —— 比 50 µm 差 2.5 倍。
 *   比较仪 能用，但只防"磨过头"、不能定"磨到了"：把片子粘在磨平的小铁块上，
 *          磨一次读一次总高（0.001 mm 一档，20 次读数累积 ±20 µm）。问题不在
 *          这 20 µm，而在 **die 埋在封装里多深是名义值** —— QFN/QFP 的 die 深度
 *          公差是 ±50 µm 量级，与要守的 50 µm 是同一个数。
 *          **长度判据的天花板是"你不知道还剩多少"，不是"你读不准"。**
 *
 * 真管用的是**透射**。EMC 是环氧 + 70–80 wt% 熔融硅粉（粒径 10–30 µm），
 * 对可见光是强散射介质，散射平均自由程 ℓ ≈ 20–40 µm（估），透过比 ≈ exp(−t/ℓ)：
 *
 *     t = 200 µm → 10⁻²（看不见）    t = 50 µm → 0.3（看见轮廓）    t = 20 µm → 0.6（看见金属化）
 *
 * 碳弧从背面照、显微镜从正面看 —— **判据不是"读到厚度"，是"die 的轮廓与焊盘阵列
 * 出现对比度"**。看见就停粗磨，这时剩 30–50 µm。
 *
 * 最后那 50 µm 不再磨，交给化学：60–70 °C 浓硝酸 3–10 min。环氧在热浓硝酸里
 * 5–20 µm/min 地溶（估），而**硅在浓硝酸里自己长出 SiO₂ 钝化层**（<0.1 nm/min）、
 * **铝也钝化**（>65 % 的硝酸是铝的经典钝化剂）—— 选择性 环氧 : Si ≈ 10⁴ : 1。
 * **这一段不靠计时，靠它自己停**：多泡 10 min 也不会多去 1 µm。反证就在料表里 ——
 * `make/point-contact-transistor` 那句话："HF 溶氧化层、硝酸把硅氧化，两者交替啃下去"，
 * **单独一支硝酸是不咬硅的**，否则那句话不成立。
 *
 * **50 µm 这个数从哪来**：P1200 的磨粒 15 µm，单颗划痕深 2–5 µm（约 1/3 粒径）。
 * 磨到剩 50 µm 时划痕还在封装里；磨到剩 15 µm 时划痕已经打进钝化层。停点必须
 * ≥ 3 倍最大磨粒直径，15 × 3 = 45 ≈ **50 µm**。低于它只能换 1–5 µm 石英粉抛
 * （0.5–1 µm/min，50 µm 要 50 min），而抛光的滚动压痕 1 µm 的铝 + 0.5 µm 的钝化层
 * 一样扛不住 —— **所以 50 µm 以下是化学的地盘。**
 *
 * ⚠️ 磨料本身也是降级：白名单里只有石英与尾矿（莫氏 7），工业的碳化硅砂纸
 *    （莫氏 9）不在里面，而 EMC 的填料正是石英（莫氏 7）—— 磨料与工件同硬度，
 *    效率低 3–5 倍，且磨料会先被磨圆。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、选择性：20 层里哪几层会去过头
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 速率全是 25 °C 的量级（硝酸另标 60 °C），**比值才是判据**：
 *
 *   腐蚀液                  要去掉的        要停住的            速率比        判
 *   49 % HF                 SiO₂ 1 µm/min   Si <0.1 nm/min      10⁴ : 1       好
 *   49 % HF                 PSG 2–5 µm/min  Si₃N₄ 5–10 nm/min   300–1000 : 1  停止层
 *   49 % HF                 SiO₂ 1 µm/min   **Al 0.1–0.5 µm/min（估）** 2–10 : 1  **最坏**
 *   HF:H₂O = 1:10（5 %）      SiO₂ 0.1 µm/min Al 0.01–0.05（估）  2–10 : 1     同上，慢 10 倍
 *   65–70 % HNO₃ @25 °C     Cu 1–3 µm/min   Al **钝化** <0.01    100 : 1       用这个
 *   65–70 % HNO₃ @60 °C     环氧 5–20（估）   Si 钝化 <0.1 nm    10⁴ : 1       开盖用
 *   65–70 % HNO₃            Cu 1–3 µm/min   TaN 0.05–0.15（估） 20–50 : 1     TaN 是停止层
 *   王水 HCl:HNO₃ = 3:1      Al 5–20 µm/min  Cu 1–3              1 : 1         **不能用**
 *   NaOH 30 % @80 °C        Si 1 µm/min     SiO₂ 0.1 nm/min     10⁴ : 1       好
 *   NaOH 30 % @80 °C        Si              **Al >1 µm/min**     1 : 1         **碱吃铝**
 *
 * ⚠️ 题目给的是"HF 对 SiO₂ : Si = 100 : 1"。按物理它该是 10⁴ : 1（HF 根本不咬硅，
 *    它只溶氧化层），100 : 1 更像是 **SiO₂ : Si₃N₄** 那个数。**按保守的 100 : 1 判，
 *    结论一样：硅是安全的停止面。** 差的那两个数量级不改变任何一步该不该停。
 *    带"（估）"的三行是本层没有量具直接测的：**铝在 HF 里的速率、TaN 在硝酸里的速率、
 *    环氧在热硝酸里的速率** —— 它们只用来判"够不够停"，不用来定时间。
 *
 * 会去过头的是这样几层：
 *
 *   **最坏的一层：钝化层（Si₃N₄ + SiO₂，压在铝焊盘上）。**
 *   1 µm 的 SiO₂ 在 49 % HF 里 1–2 min 去完，同一段时间 Si₃N₄ 只掉 5–10 nm（没事）。
 *   但**过了那 1–2 min，HF 就直接见到铝焊盘**：铝在 49 % HF 里 0.1–0.5 µm/min，
 *   30 s 就是 50–250 nm 的坑，而焊盘只有 0.5–1 µm。判据（焊盘发灰）出现时已经晚了。
 *
 *   补救有两条，**第二条才是真补救**：
 *     ① 把 HF 稀释到 1:10 —— 它买到的是"**来得及**"，不是"少损失"。去掉 1 µm 氧化层
 *        期间铝掉多少，**与浓度无关**（两个速率同比例变），都是 100–700 nm；稀释只把
 *        "看见发灰到捞出来"那 10–30 s 的过腐蚀从 50–250 nm 压到 5–25 nm。
 *        **选择性买不到，能买的只有时间。**
 *     ② **不要在焊盘上停**：钝化下面是 Si₃N₄（多数芯片有），就把 HF 停在氮化硅上，
 *        把"开焊盘窗口"这一步**整条跳过** —— 焊盘不开，焊盘就一点不掉，而这一层要读的
 *        图形在焊盘之间的有源区里。**本文件走的是第二条。**
 *
 *   **第二坏：铜的 M1（100–200 nm，最薄，下面就是 TaN 与钨塞）。**
 *   浓硝酸 Cu:TaN = 20–50 : 1，200 nm 铜去完时 TaN 掉 4–10 nm，而 TaN 本体只有 5–10 nm
 *   → 阻挡层被削掉一半，图形还在、台阶塌了。补救：M1 用 1:1 稀释硝酸、5 s 一步、
 *   不冲水直接吹干。
 *
 *   **"选择性差"的那一对（Si₃N₄ : SiO₂ = 1 : 10）反而是救命的。**
 *   20 层里只有 Si₃N₄ 与 TaN 是 HF / 硝酸的停止层 —— **"差"的那一对，是整条工艺
 *   赖以停住的那一对。** 所以"选择性越低越好"这句话是错的，要看你要停在哪儿。
 *
 *   **还有一层根本去不掉：Si₃N₄（spacer / 刻蚀停止层）。**
 *   溶它只有 160–180 °C 的热磷酸（85 % H₃PO₄，Si₃N₄ : SiO₂ ≈ 10 : 1，与 HF 反过来），
 *   而 `plant/wet-bench` 的上限是 **120 °C** —— **差 40 °C，这一层在本层去不掉。**
 *   它压在阱与栅上面，所以**前段（FEOL）读不到**。再加上显微镜只看得到 5 µm，
 *   "读不出 40 nm 器件"这句话有两重原因，不只一重。
 *   （顺带：`mat/phosphoric-acid` 在料表里有条目，但不在本文件的投料白名单里。）
 *
 *   **顺序上的硬约束：多晶硅只能用碱，而碱吃铝 → 金属必须先剥完。**
 *   不是"没有钾"的问题：`mat/potassium` 本层确实没有条目，但**不需要钾** ——
 *   NaOH 是同一族各向异性腐蚀液（Si(100) 1 µm/min、SiO₂ 0.1 nm/min）。
 *   要守的是顺序：**铜/铝 → 介质 → 多晶硅**。
 *   而多晶硅只在 40 nm 那一颗里有（8 nm 是 high-k/金属栅）；**本层自产的芯片是铝栅、
 *   双极型，一层多晶硅都没有**（`data/material/computer.ts` 的 RAM 片就写着"铝栅与互连"）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、边读边写 vs 存版 —— 45 GB 存不下，但真正的理由在别处
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 先算题目给的数：3 mm × 3 mm、5 nm 点距 ⇒ (3e-3 / 5e-9)² = 600 000² = 3.6×10¹¹ 点
 * ⇒ 1 点 1 位 = **45 GB/层**，20 层 900 GB。
 * 本层的存储是 `std/ram-chip-general`：**8 位/片的动态移位寄存器**（4 管/位）。
 *     900 GB = 7.2×10¹² 位 ÷ 8 位/片 = **9×10¹¹ 片**
 *     一片 φ100 硅片切 60 片（`make/ram-chip` 自己的数）⇒ 要 **1.5×10¹⁰ 片硅片**
 *     而 `make/silicon-wafer` 一批是 1000 kg 单晶硅 → 400 片 ⇒ 要 **3.75×10⁷ 批**
 *     ⇒ **3.75×10¹⁰ kg 单晶硅（3 750 万吨）**
 *     而且它是**动态**的：断电即失、要一直通时钟推 —— **它是一条流水的河，不是一个仓库。**
 *     这一条不是"贵"，是"不成立"。
 *
 * **选存版。** 版作为存储器还有一个数：
 *     一套 20 块版，每块 3 mm 见方、接触式 1:1，分辨率由写入端给（5 µm）
 *     ⇒ 每块 600×600 = 3.6×10⁵ 个二元像素 ⇒ **20 块 = 7.2×10⁶ 位 = 0.9 MB**。
 *     45 GB 与 0.9 MB 差 **5 万倍**，而那个差正是"5 nm 你看不见"的另一种写法：
 *     **分辨率降级顺手把存储问题解掉了 —— 你不需要 45 GB，因为你看不到 5 nm。**
 *
 * 为什么不选边读边写（按致命程度排）：
 *   ① **两个工件要在 <5 nm 内共位**：读的是旧片、写的是新片。本层的台架是 0.1 mm
 *      （`plant/particle-scanner/stage` 的重复性）到 1 µm（`plant/photorepeater/stage`
 *      的丝杠 + 光栅尺）—— 0.1 mm / 5 nm = **2×10⁴ 倍**。这一条就不可能，后面两条不必算。
 *   ② 一个像素级同步的模拟通道：本层没有帧存，动态移位寄存器要一直通时钟推。
 *   ③ 原件全程在台上、一次一颗、错了无法重来；而版是"读一次、写一万次"。
 *
 * 存版的代价，说清：
 *   时间   一块版从刻图到验完 1–3 天（判据只有"印出来的图形连不连"；比较仪 0.001 mm
 *          量 5 µm 的线只有 5 格，够判"在不在"，不够判"好不好"），20 块是 20–60 天单机。
 *          **图纸的真实成本在这里。**
 *   空间   20 块 3 mm 版 + 20 张 30 mm 见方的原图 —— 这就是 0.9 MB 的全部载体。
 *   灵活性 版是硬的：改一条线要重刻一张原图再缩一次。边读边写本来能"边看边改"，
 *          但那条路不存在。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、电子束胶：本层唯一那支胶对电子**是敏感的**，但慢 2–3 个数量级
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本层唯一的胶是 `mat/photoresist`：重铬酸盐-酚醛**负胶**（`data/material/photoresist.ts`）。
 * 它靠的不是"紫外"这两个字，是 **Cr(VI) 被辐射还原成 Cr(III) 之后把酚醛交联** ——
 * 引发的是电子还是光子，化学上不分。1960 年代的电子束光刻就是用重铬酸盐胶体
 * （DEG/DCG）做的。**所以答案是"敏感"，不是"不敏感"。**
 *
 * 但灵敏度差 2–3 个数量级：
 *     紫外交联剂量      10–100 mJ/cm²
 *     同一化学的电子剂量 10⁻³–10⁻² C/cm²（PMMA 是 10⁻⁴，差 10–100 倍）
 *     一层要写多少电荷：3 mm 见方 = 0.09 cm² ⇒ 9×10⁻⁵–9×10⁻⁴ C
 *       ⇒ 1 nA 束流下 **25–250 h 一层**（100 nA 也要 15–150 min）。
 *     5 µm 像素下这 0.09 cm² 只有 3.6×10⁵ 个像素，逐点走完是秒级，所以"写得动"。
 *     换成 5 nm 像素是 3.6×10¹¹ 个点 —— **电荷还是那么多，但要写 10⁶ 倍多的点**，
 *     逐点的开关与偏转就成了新的天花板，再乘上第三节那 45 GB。
 *     **存储与写入是同一个数在卡人。**
 *
 * 所以本文件**不用电子束写**：写回新片走"穿版接触曝光"，用同一支负胶、同一台
 * `plant/mask-aligner`（碳弧紫外）—— **这是选存版带来的第二个好处：写入端
 * 一点新的胶化学都不需要。**
 *
 * 若要真电子束直写，胶怎么办：
 *     PMMA 要 MMA 单体 —— 本层没有（`mat/methyl-methacrylate`、`mat/pmma`、`mat/acrylic`
 *     三个 id 一个都不存在）。
 *     **但聚苯乙烯可以**：苯乙烯单体本层有（`mat/styrene`，乙苯脱氢来的），热引发本体
 *     聚合 120–150 °C 就是 PS；PS 是 1960–70 年代真用过的电子束胶（10⁻⁴ C/cm² 级，
 *     分辨率比 PMMA 差一档）。**它不在本文件的投料白名单里 → 只记缺口，不写路线。**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、套刻：0.86 µm 与 5 nm 差 172 倍，"标记 + 背散射成像"救不了它
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本层最好的对准是 `plant/mask-aligner`：单次对准 1σ = **0.86 µm**
 * （`unblock-mask-aligner.ts` 第七节的 RSS 误差预算），两 σ 1.7 µm。它的物镜是
 * 手抛铜镜 100× / NA 0.07 ⇒ 衍射极限 0.61λ/NA = **4.8 µm** —— "对得准到 1 µm"
 * 与"看得清 5 µm"是两件事。0.86 µm ÷ 5 nm = **172 倍**。
 *
 * 20 层怎么攒：标记对的是**前一层**，误差是随机游走 ⇒ √20 × 0.86 = **3.8 µm**
 * （不是 20 × 0.86 = 17 µm）。套刻预算按 d/3 算：本层能做的 d = 5 µm ⇒ 预算 1.7 µm，
 * 正好两 σ。**所以这条工艺在自己的 5 µm 世代里是自洽的** —— 它不是残废，它是一整代工艺。
 * 40 nm 要 ≤ 13 nm、8 nm 要 ≤ 2.7 nm ⇒ 差 **66 倍与 320 倍**。
 *
 * "标记 + 背散射电子成像"自对准，行不行？三条分开看：
 *   ① **单台机器内：行。** 束斑 5 nm，背散射像的标记边缘定位 σ ≈ 束斑/√N，
 *      N = 10³ 个电子就到 nm 级。这一条成立。
 *   ② **两片之间：不行。** 层 n 在旧片上、层 n-1 在新片上，要让它们对上需要两个
 *      工件 <5 nm 共位 —— 又回到第三节①那 2×10⁴ 倍。
 *   ③ **更根本的：旧片每读一层就被毁掉一层。** 读第 n 层时，新片的第 n-1 层已经写在
 *      另一片上了；工业解法是同一台机器、同一套标记、一次装一片（步进机逐场对准），
 *      而本层连"看得见 5 nm 标记"的手段都没有（最好物镜 4.8 µm）。
 * ⇒ 所以本文件里套刻只有 **0.86–1.7 µm** 一个窗口，`gives` 上如实写。
 *   **20 层对得上的极限是 5 µm 世代的芯片；40 nm 与 8 nm 这一条不可能。**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 结论：能剥、能读、能存、能写 —— 但读出来的不是那颗片子
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 四段工艺都成立，合起来交付的是 **5 µm 世代的一套图纸与一片复版**：
 *   剥开/去层/停在界面  行，选择性与顺序都算得通（第二节那两张表）
 *   读                  只有 5 µm（显微镜，人眼定位 0.73 µm）与 1 µm 一档（比较仪，
 *                       一维、不成像）→ 40 nm 读不出来
 *   存                  20 块版 = 0.9 MB → 够存 5 µm 的图，存不了 45 GB
 *   写                  接触曝光 3–5 µm + 套刻 0.86–1.7 µm → 写得出 L2/L3，写不出 40 nm
 *
 * 所以对这两颗片子，这套工艺交付的是"**电路的大块结构**"（电源/地平面、焊盘阵列、
 * 存储阵列的重复块、总线的走向）与"一张糊的图纸"，而不是能跑的复制品。
 * 按"换完还会不会做原来那件事"：这不是降级（"还会做那件事，只是差几倍"），是**换了一个东西** ——
 * 40 nm 的 MCU 复版到 5 µm 不会以原时钟工作，多半根本不工作。这句话写在数据里
 * （两条金属路线的 `onRelax` 是 `functional-lost`），不只写在注释里。
 *
 * 反过来，这套工艺对本层自产的芯片（L2 的 5 µm、L3 的 1 µm）是**完全成立**的：
 * 它把"每片都要重做一套版"的作坊，变成"一套版印一万片"的厂。**那才是它真正的用处。**
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目
// ═══════════════════════════════════════════════════════════════════════════

export const DEPROCESS_ITEMS: readonly Item[] = [
  /**
   * 40 nm 制程的 MCU 一颗。**仍是剥层工艺的输入；现在也有产出路线了。**
   *
   * 产出路线是 `make/mcu-40nm-damascene`（`data/material/chip-node.ts`）：
   * SAQP 前道（node 16–24）+ `make/beol-40nm-8layer`（40–100 nm / AR 2–3 /
   * dishing 3–8 / 8 层）+ LPCVD Si₃N₄ 钝化 + 划片/装架/键合/测试。
   *
   * ⚠️ 它交出的 `node` 是 **16–24 nm**，不是 40 —— 这是 SAQP 前道的实际窗口，
   * 按"40 nm 档 ≤50"落在之内。后道现在是 40–100 nm，
   * 不是 100–300 nm。**2026-10-20 前的口径**是“8 层 + SOG/酚醛钝化 +
   * 100–300 nm 后道的混合件，三格 BEOL 降级”—— 这一版已不成立。
   * 现在缺的是 40 nm CAR（本层 80–200 nm）与 E≥5 GPa 的低 k 介质，不是后道整体。
   *
   * `node` 与 `layers` 写在这里而不是写在 id 里，是因为 id 只说它是什么（#18）。
   * ⚠️ 本层另有一条 3–5 µm 互连的 `std/mcu-3um-general`（`damascene.ts`）——
   * 那是另一颗件，不是这一条的替代品。
   */
  {
    id: 'std/mcu-40nm-general',
    name: '40 nm 制程的 MCU',
    unit: '片',
    category: 'part',
    props: [
      { param: 'node', kind: 'range', min: 1, max: 100, unit: 'nm', dir: 'atMost' },
      { param: 'layers', kind: 'range', min: 1, max: 40, unit: '层', dir: 'atLeast' },
    ],
  },

  /**
   * 8 nm 制程的 SoC 一颗。**有产出路线：`make/soc-8nm-damascene`（`euv-hina.ts`）。**
   *
   * 判据：node ≤12（8 nm 本体的旧门是 ≤10；本条目把声明窗口写成 7–12，不再用 30 的旧上限）。
   * 路线交的是 **node 8–10、tops 100–275、sram 10–100 MB、power 10–30 W、
   * layers 15–20**；后四项是 2026 端侧 SoC 的需求窗口，不是本层实测 ——
   * 路线只证明工序链能排出来，不证明算力/容量真的测到。前半条：
   *
   *   `make/device-wafer-oct`（8 重成像，8–10）
   *     → `make/beol-30nm-15layer`（25–30 nm / 15–20 层）
   *     → `make/soc-8nm-damascene`（前道 7 步 + Cu 双大马士革 + 量测/缺陷/电测
   *        + 钝化/划片；`plant/robot` 已不再当执行设备）
   *
   * 旧整机（`plant/euv-stepper`，2×2 mm 场、43/560 nm）那笔账仍留在
   * `data/material/chip-node.ts` 文件头第二节，作为对照：25 块拼接、缝上
   * 60.8–86.0 nm、对 2.7 nm 差 22.5–31.9 倍；现在 high-NA 的 26×16.5 单场
   * 把 10×10 的 die 一次放下，整机 overlay ≤2.7 nm。
   *
   * 还没接上的三格（不是「造不出」）：
   *   · 可溯源套刻量具：`plant/overlay-metrology` 有机内 DBO（0.5 nm 设计值），
   *     但没有 `measure/*` 记录，仍不可溯源；
   *   · 掩模 pellicle/修版（一套 20 块、20 天）；
   *   · C-V/I-V 与高速功能测试；引线键合机 `plant/wire-bonder` 也不存在，属待建。
   * 钝化已由 `mat/si3n4-lpcvd`（`make/lpcvd-si3n4`）补上，见
   * `make/soc-8nm-damascene` 的 `uses`。
   *
   * ⚠️ 本层另有 3–5 µm 的 `std/soc-3um-general`（`make/soc-3um-damascene` 产）与
   * 100–300 nm 的 `std/soc-fine-general`（`make/fine-soc-interconnect` 产）——
   * **那都是别的件**，三颗件不共用一个 id；8 nm 这一颗的路线交 **node 8–10**，
   * 声明窗口是 **7–12**（两者不是同一个数：声明容得下容差，路线只敢交 8–10）。
   *
   * 在剥层工艺上它与 MCU 只有一处不同要紧：**层数 15–20、金属是铜**。
   * 其余（去介质、去阻挡层、去不掉 Si₃N₄）与 MCU 卡在同一个地方。
   */
  {
    id: 'std/soc-8nm-general',
    name: '8 nm 制程的 SoC',
    unit: '片',
    category: 'part',
    props: [
      { param: 'node', kind: 'range', min: 7, max: 12, unit: 'nm', dir: 'atMost' },
      { param: 'tops', kind: 'range', min: 100, max: 275, unit: 'TOPS', dir: 'atLeast' },
      { param: 'sram', kind: 'range', min: 10, max: 100, unit: 'MB', dir: 'atLeast' },
      { param: 'power', kind: 'range', min: 10, max: 30, unit: 'W', dir: 'atMost' },
      { param: 'layers', kind: 'range', min: 15, max: 20, unit: '层', dir: 'atLeast' },
      // 8 nm 节点资格带，不是单次实测；overlay 门 ≤2–3 nm、highK 2–3、
      // interface 1–2 与 `make/soc-8nm-damascene` 的第⑪/②/①步一致。
      { param: 'overlay', kind: 'range', min: 2, max: 3, unit: 'nm', dir: 'atMost' },
      { param: 'gateOxide', kind: 'range', min: 1, max: 2, unit: 'nm' },
      { param: 'highK', kind: 'range', min: 2, max: 3, unit: 'nm' },
      { param: 'metalGate', kind: 'range', min: 5, max: 10, unit: 'nm' },
      { param: 'interface', kind: 'range', min: 1, max: 2, unit: 'nm' },
    ],
  },

  /**
   * 开盖后的裸片：封装已去、硅片正面露出。
   *
   * 三个规格就是这一段的全部质量语言：
   *   residual        边角残胶厚度（mm 口径太大，用 µm）——"化学去封停得干不干净"
   *   layersRemoved   **已经剥掉几层**。这条路线是可重复的：每跑一遍 +1，
   *                   20 层就是在这一个 id 上走 20 遍（模型没有循环，所以用计数表达）
   *   metal           互连是铝还是铜 —— **它决定下一步用哪种酸**（第二节）
   *
   * ⚠️ `metal` 不是标签，是判据：铜片碰王水就是 1:1 的灾难，铝片碰浓硝酸会被钝化
   *    而根本去不掉。所以两条金属路线都写了 `need`（见下面的 onRelax）。
   */
  {
    id: 'std/die-exposed-general',
    name: '开盖后的裸片',
    unit: '件',
    category: 'part',
    props: [
      { param: 'residual', kind: 'range', min: 0, max: 500, unit: 'µm', dir: 'atMost' },
      { param: 'layersRemoved', kind: 'range', min: 0, max: 40, unit: '层', dir: 'atLeast' },
      { param: 'metal', kind: 'enum', values: ['al', 'cu'] },
    ],
  },

  /**
   * 一层的手刻原图。**这是"图纸"的物理形态，不是像素图。**
   *
   * 30 mm 见方的**玻璃片**，刷一层重铬酸盐-酚醛胶当红膜（琥珀色、厚一点就不透紫外），
   * 刀尖 0.05 mm 刻穿胶层（本层刻线的下限，见 `unblock-comparator-reticle.ts`），
   * **刻线处露出玻璃 = 透紫外** —— 这就是"红膜刻图"在本层的实现，也是缩微照相唯一
   * 能用的原图形态（不透光的薄铁片当不了照相原图，只能当 1:1 的阴影掩模）。
   * 手定位 ±0.02 mm，缩微 10× 之后就是版上的 5 µm 线与 ±2 µm 位置误差。
   *
   * `lineWidth` 的口径是**原图上的实际线宽（mm）**：手刻 0.03–0.06 mm，
   * 10× 缩微后是 3–6 µm。`make/eb-read-layer` 的 0.05 µm 是**读出分辨率**，
   * 不是这里的交付线宽；它转回的原图仍是 ≤0.05 mm 这一档。
   *
   * 它为什么必须存在：0.9 MB 的图存在哪？存在 20 张原图与 20 块版上。**玻璃与版比
   * 移位寄存器可靠五十年**，而且它们是这套工艺里唯一"看得见、摸得着、可以拿在手上核对"
   * 的东西。动态移位寄存器要一直通时钟推；版放五十年不会掉一位。
   */
  {
    id: 'std/layer-tracing-general',
    name: '一层的手刻原图',
    unit: '张',
    category: 'part',
    props: [{ param: 'lineWidth', kind: 'range', min: 0.01, max: 1, unit: 'mm', dir: 'atMost' }],
  },

  /**
   * 复版裸片：用逆向读出的那套版，在新硅片上跑完 20 层光刻与腐蚀之后的那一片。
   *
   * **它的规格上限不是这条工艺的目标，而是这条工艺的天花板**：
   *   minFeature  3–5 µm（版给的，接触式曝光的衍射极限 2–5 µm）
   *   overlay     0.86–1.7 µm（单次对准 1σ 到两 σ）
   *   layers      20 层
   */
  {
    id: 'std/die-replica-general',
    name: '复版裸片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'minFeature', kind: 'range', min: 0.1, max: 10, unit: 'µm', dir: 'atMost' },
      { param: 'overlay', kind: 'range', min: 0, max: 10, unit: 'µm', dir: 'atMost' },
      { param: 'layers', kind: 'range', min: 1, max: 40, unit: '层', dir: 'atLeast' },
    ],
  },

  /**
   * 背面红外透视图。**不剥层的那条路**：硅在 1.1 µm 以上透明，所以磨薄背面之后，
   * 用碳弧照、单点扫，就能看见有源区与阱的大块形状 —— 代价是分辨率被"光斑 0.2 mm
   * + 台 0.1 mm"钉死在 100–300 µm。
   *
   * 它的用处不是复版，是**定位**：die 在哪、有没有 die、焊盘阵列大概在哪一片。
   */
  {
    id: 'std/die-ir-image-general',
    name: '背面红外透视图',
    unit: '张',
    category: 'part',
    props: [{ param: 'minFeature', kind: 'range', min: 1, max: 2000, unit: 'µm', dir: 'atMost' }],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线
// ═══════════════════════════════════════════════════════════════════════════

export const DEPROCESS_ROUTES: readonly Route[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 2.1 开盖（两条：环氧封装 vs 金属帽）
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 开盖（环氧封装）。这两颗片子的封装都是环氧模塑料，所以同一条路线。
     *
     * 四段判据叠在一起用（第一节）：
     *   ① 比较仪读累积去除量 —— 防磨过头，答不出"还剩多少"
     *   ② 透过看见 die 轮廓 —— 真正的停点，剩 30–50 µm
     *   ③ 化学去封（60–70 °C 浓硝酸）—— **自己会停**：硅与铝都钝化，只有环氧溶
     *   ④ 镜下看焊盘阵列 —— 确认读得出来
     *
     * ⚠️ 第③步是这条路线里唯一"有危险"的一步：硝酸在 60 °C 会放出 NO₂（红烟），
     *    湿法槽必须盖紧、尾气走碱液吸收。**这类危险不写在模型里，但它是真的。**
     */
    id: 'make/deprocess-decap-epoxy',
    name: '开盖后的裸片制造',
    produces: [
      {
        item: 'std/die-exposed-general',
        qty: q(1),
        gives: [
          { param: 'residual', kind: 'range', min: 0, max: 5 },
          { param: 'layersRemoved', kind: 'range', min: 0, max: 0 },
          { param: 'metal', kind: 'enum', oneOf: ['cu'] },
        ],
      },
    ],
    uses: [
      // 两颗原件任选其一：封装一样、开盖一样、去层一样。
      // 40 nm 有路线 `make/mcu-40nm-damascene`：后道 `make/beol-40nm-8layer`
      // 交 40–100 nm / AR 2–3 / dishing 3–8 / 8 层，钝化 LPCVD Si₃N₄；
      // 2026-10-20 前的“100–300 nm 后道混合件”口径已不成立。
      // 8 nm 有路线 `make/soc-8nm-damascene`（`euv-hina.ts`；剩下的缺口见
      // `data/material/chip-node.ts` 文件头）。
      // `std/soc-3um-general` 与 `std/soc-fine-general` 是另外的件，不接在这条开盖路线上。
      {
        anyOf: [
          { item: 'std/mcu-40nm-general', qty: q(1) },
          { item: 'std/soc-8nm-general', qty: q(1) },
        ],
      },
      { anyOf: [{ item: 'mat/tailings', qty: q(1) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    // 比较仪的读数是 0.001–0.01 mm 一档，必须在 19–21 °C 里读（钢 1 °C 涨 1.15 µm/100 mm）。
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '贴片：粘在磨平的小铁块上，与铁块同一平面（比较仪的基准）', performedBy: 'plant/robot' },
      { note_zh: '粗磨 P240→P800：每级去 100–200 µm，每级后读一次总高', performedBy: 'plant/grinder' },
      { note_zh: '精磨 P1200：剩 50–100 µm 停（透过看见 die 轮廓就是到了）', performedBy: 'plant/grinder' },
      {
        note_zh: '化学去封：60–70 °C 浓硝酸 3–10 min，环氧溶净、停在硅与铝的钝化层上（多泡一会儿没关系）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 60, max: 70 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      { note_zh: '冲洗吹干、镜下看焊盘阵列与定位标记', performedBy: 'plant/mask-aligner' },
      { note_zh: '记录残留（0.001 mm 一档）并贴标签', performedBy: 'plant/comparator' },
    ],
    rate: { hours: q(5) },
  },

  {
    /**
     * 开盖（金属帽）。**本层自产芯片的封装是金属帽**，所以它不用磨 —— 车开翻边即可。
     *
     * 这一条的用处是把"能复制"与"不能复制"分开：本层自产的芯片（L2/L3）与这两颗片子
     * 走的是同一条去层、同一条存版、同一条复版 —— **差别全在开盖与互连金属上**。
     * 于是"复制自己的芯片行、复制那两颗不行"这句话，在数据里是一条路线之差，不是态度之差。
     */
    id: 'make/deprocess-decap-can',
    name: '开盖后的裸片制造',
    produces: [
      {
        item: 'std/die-exposed-general',
        qty: q(1),
        gives: [
          { param: 'residual', kind: 'range', min: 0, max: 0 },
          { param: 'layersRemoved', kind: 'range', min: 0, max: 0 },
          { param: 'metal', kind: 'enum', oneOf: ['al'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车开金属帽的翻边（帽壁 0.3 mm，进刀 0.05 mm/转，不许碰到键合丝）', performedBy: 'lathe' },
      { note_zh: '去毛刺与冲洗', performedBy: 'plant/grinder' },
      { note_zh: '镜下看芯片正面与键合点（帽一开，钝化是原来的，不磨）', performedBy: 'plant/mask-aligner' },
    ],
    rate: { hours: q(1) },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.2 逐层去层（三条化学 + 一条碱）
  //
  // 三条路线都作用在**同一个 id** 上：剥一层，layersRemoved +1。
  // 这就是 20 层循环的写法 —— 模型没有循环，所以用计数表达，
  // 而计数是刻意的：**哪一层用哪种酸，由金属与介质的顺序决定，不由时间决定。**
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 去介质/钝化（HF）。PSG、SOG、场氧、栅氧 —— 所有 SiO₂ 系一层一层都走这一条。
     *
     * 取 49 % 的 HF 一份兑水九份（≈5 %）：SiO₂ 0.1 µm/min，1 µm 要 10 min。
     * **稀释买到的是"来得及"，不是"少损失"**：去掉同样厚的氧化层，铝的总损失与浓度
     * 无关（两个速率同比例变）；变的是过腐蚀那 10–30 s 的代价 —— 49 % 时 50–250 nm，
     * 5 % 时 5–25 nm。
     *
     * **本路线的一条纪律：停在 Si₃N₄ 上，不开焊盘窗口。** 钝化下面是氮化硅时，
     * HF 对它的速率只有 5–10 nm/min（1 : 100）—— **这就是本层的停止层**。
     * 焊盘窗口那一步整条跳过：焊盘不开，焊盘一点不掉。
     *
     * ⚠️ 停不住的时候会怎样（49 % 的浓度下）：HF 穿透钝化见到铝焊盘，30 s 就是
     *    50–250 nm 的坑。判据是焊盘发灰 —— 而那时已经晚了，所以判据实际是
     *    "时间到就捞出来看"，而不是"看见再停"。
     */
    id: 'make/deprocess-oxide',
    name: '去介质/钝化',
    produces: [
      {
        item: 'std/die-exposed-general',
        qty: q(1),
        gives: [
          { param: 'residual', kind: 'range', min: 0, max: 0 },
          { param: 'layersRemoved', kind: 'range', min: 1, max: 40 },
          { param: 'metal', kind: 'enum', oneOf: ['al', 'cu'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/die-exposed-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: [],
    performedBy: 'plant/wet-bench',
    under: [
      { param: 'temperature', min: 20, max: 30 },
      { param: 'pressure', min: 100, max: 500 },
    ],
    rate: { hours: q(1) },
  },

  {
    /**
     * 去铜（65–70 % 浓硝酸）。**这一条是本文件里最要紧的一次"换酸"。**
     *
     * 题目给的三个选项：磷酸（只吃铝）、硝酸铈铵（本层没有铈）、王水（HCl + 硝酸，
     * 本层有）。王水的问题是 **Cu : Al = 1 : 1 —— 铜与铝一起没**，而铜片上恰恰还有
     * 铝焊盘，所以王水把"要读的层"和"要保的焊盘"一起吃掉。
     *
     * 换浓硝酸：Cu 1–3 µm/min，而 **Al 在 65–70 % 硝酸里钝化**（<0.01 µm/min）
     * ⇒ Cu : Al = 100 : 1，料现成、不要铈。这是本层能拿到的最好选择性。
     * 顺带它还停在 TaN 上（20–50 : 1）—— **阻挡层就是天然的停止层**。
     *
     * 代价写在第二节：200 nm 的 M1 去完时 TaN 掉 4–10 nm，而它本体只有 5–10 nm。
     */
    id: 'make/deprocess-metal-cu',
    name: '开盖后的裸片制造',
    produces: [
      {
        item: 'std/die-exposed-general',
        qty: q(1),
        gives: [
          { param: 'residual', kind: 'range', min: 0, max: 0 },
          { param: 'layersRemoved', kind: 'range', min: 1, max: 40 },
          { param: 'metal', kind: 'enum', oneOf: ['cu'] },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'std/die-exposed-general',
            qty: q(1),
            // 铜片专用。放宽成铝片 = 硝酸把铝钝化、金属根本去不掉 → **功能丢掉**。
            need: [{ param: 'metal', kind: 'enum', oneOf: ['cu'] }],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: [],
    performedBy: 'plant/wet-bench',
    under: [
      { param: 'temperature', min: 20, max: 30 },
      { param: 'pressure', min: 100, max: 500 },
    ],
    rate: { hours: q(1) },
  },

  {
    /**
     * 去铝（85 % 磷酸，50–60 °C）。
     *
     * 磷酸对铝 0.5–1 µm/min、对 SiO₂ 1–2 nm/min ⇒ **Al : SiO₂ = 500 : 1**，
     * 比王水好，而且**不含氯**（氯离子会在下一层留下可动离子污染，
     * 而本层的水只到 1–1000 µS/cm，冲不干净）。
     *
     * 这原来是"王水 + 白名单缺口"，按 R8（降级须给升级路线）改成磷酸：
     * `mat/phosphoric-acid` 已经作为氢氟酸的副产建在料表里（`data/material/byproducts.ts`），
     * 所以这条升级不需要新设备、新料、新工艺 —— 只需要把料换成已有的那个。
     *
     * 王水对铜是 1 : 1，所以它对铜片是**毁掉那一层**而不是"去过头"：放宽 = 功能丢掉。
     */
    id: 'make/deprocess-metal-al',
    name: '开盖后的裸片制造',
    produces: [
      {
        item: 'std/die-exposed-general',
        qty: q(1),
        gives: [
          { param: 'residual', kind: 'range', min: 0, max: 0 },
          { param: 'layersRemoved', kind: 'range', min: 1, max: 40 },
          { param: 'metal', kind: 'enum', oneOf: ['al'] },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'std/die-exposed-general',
            qty: q(1),
            need: [{ param: 'metal', kind: 'enum', oneOf: ['al'] }],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/phosphoric-acid', qty: q(4), need: [{ param: 'concentration', kind: 'range', min: 70, max: 85 }], onRelax: 'functional-kept' }] },
      { anyOf: [{ item: 'mat/water', qty: q(6) }] },
    ],
    needs: [],
    performedBy: 'plant/wet-bench',
    under: [
      { param: 'temperature', min: 50, max: 60 },
      { param: 'pressure', min: 100, max: 500 },
    ],
    rate: { hours: q(1) },
  },

  {
    /**
     * 去多晶硅（NaOH 30 %，80 °C，各向异性）。
     *
     * 题目说"多晶硅要 KOH（要钾）"—— **不必**。NaOH 是同一族各向异性腐蚀液：
     * Si(100) 1 µm/min、SiO₂ 0.1 nm/min（10⁴ : 1），而 `mat/naoh` 本层有
     * （`mat/potassium` 没有条目，也不需要）。
     *
     * 真正的约束是**顺序**，不是钾：**碱吃铝**（Al 在 80 °C 30 % NaOH 里 >1 µm/min，
     * Si : Al ≈ 1 : 1）。所以这一步必须等铜/铝全部剥完之后才走 —— 这也是为什么
     * 去层顺序是"金属先、poly 后"而不是反过来。
     *
     * 另一处代价：碱蚀各向异性，5 µm 的图形侧壁是 54.7° 斜面，侧蚀 ≈ 膜厚
     * （0.3–0.5 µm）→ 图形边缘糊 0.5 µm。在 5 µm 线宽上是 10 %，可以忍。
     *
     * 而它其实只服务 40 nm 那一颗：8 nm 是 high-k/金属栅，本层自产的是铝栅双极型 ——
     * **都没有多晶硅**（`data/material/computer.ts`："铝栅与互连"）。
     * 这条路线是为将来那条"能造 1 µm 的链"留的：`make/cpu-8bit` 的栅就是多晶硅。
     */
    id: 'make/deprocess-poly',
    name: '开盖后的裸片制造',
    produces: [
      {
        item: 'std/die-exposed-general',
        qty: q(1),
        gives: [
          { param: 'residual', kind: 'range', min: 0, max: 0 },
          { param: 'layersRemoved', kind: 'range', min: 1, max: 40 },
          { param: 'metal', kind: 'enum', oneOf: ['al', 'cu'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/die-exposed-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(3) }] },
    ],
    needs: [],
    performedBy: 'plant/wet-bench',
    under: [
      { param: 'temperature', min: 70, max: 90 },
      { param: 'pressure', min: 100, max: 500 },
    ],
    rate: { hours: q(1) },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.3 读与存：一层一张原图，20 张缩微成一套版
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 读一层、画一层。**这是"存版"那一条的核心。**
     *
     * 没有像素图，也没有文件 —— 只有一张 30 mm 见方的玻璃原图：按 10 倍手刻
     * （0.05 mm 的线 → 版上 5 µm），手定位 ±0.02 mm → 版上 ±2 µm。
     *
     * 为什么是 10 倍而不是 `make/photomask` 的 100 倍：100 倍要求手刻线到 0.5 mm、
     * 原图 300 mm 见方（一块 3 mm 的 die 放大 100 倍），本层的刻线下限是 0.05 mm、
     * 手定位 ±0.02 mm。**10 倍的好处是原图小、畸变小，坏处是手的误差直接变成
     * 版上的 ±2 µm（5 µm 线宽的 40 %）。** 两条并存，选哪条看要什么。
     *
     * 读的极限写在这里：物镜 4.8 µm（100×/NA 0.07 的衍射极限）、人眼定位 0.73 µm
     * ⇒ **读出来的图形最小 5 µm**。40 nm 的线在这个尺度上是"一片糊的灰"，不是线。
     */
    id: 'make/deprocess-trace',
    name: '一层的手刻原图制造',
    produces: [
      {
        item: 'std/layer-tracing-general',
        qty: q(1),
        gives: [{ param: 'lineWidth', kind: 'range', min: 0.03, max: 0.06 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 100) }] },
    ],
    // 片子**不消耗**：读一层不毁片子，毁片子的是下一条去层路线。所以它在 needs 里，
    // 与"版是工具、不进 uses"同一个判据（`make/counter-chip` 那句注释）。
    needs: ['std/die-exposed-general', 'plant/metrology-room'],
    steps: [
      { note_zh: '镜下逐块读（物镜 4.8 µm、人眼定位 0.73 µm）并记进画法', performedBy: 'plant/mask-aligner' },
      { note_zh: '在刷了胶的玻璃片上刻穿胶层（刀尖 0.05 mm，10 倍放大，刻线处透紫外）', performedBy: 'plant/robot' },
      { note_zh: '量线宽与位置（0.001 mm 一档，5 µm 的线是 5 格）', performedBy: 'plant/comparator' },
    ],
    rate: { hours: q(9) },
  },

  {
    /**
     * 20 张原图 → 20 块版。**版就是存储器（第三节）。**
     *
     * 拼版机 10 mm 视场、1 µm 定位，9 场拼一块 3 mm 见方的版；一块版要试
     * 1–3 天的曝光量，判据只有"印出来的图形连不连"。
     *
     * 这一条与 `make/photomask`（手刻 1 mm 线 + 一次缩微 100× → 10 µm）、
     * `make/photomask-1um`（缩微拼版 → 0.5–1 µm）是**同一个条目的第三条来路（OR）**。
     * 三条并存不矛盾：**版就是版，问题只是这一块刻得多细**。
     */
    id: 'make/deprocess-mask-set',
    name: '接触式掩模制造',
    produces: [
      {
        item: 'std/photomask-general',
        qty: q(20),
        gives: [
          { param: 'minFeature', kind: 'range', min: 3, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/layer-tracing-general', qty: q(20) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/sodium-dichromate', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '装母图、对光调焦（星点）、逐场步进曝光 9 场', performedBy: 'plant/photorepeater' },
      { note_zh: '显影、定影、坚膜（碱水，全程避光）', performedBy: 'plant/wet-bench' },
      { note_zh: '量线宽（0.001 mm）与看图形连通', performedBy: 'plant/comparator' },
      { note_zh: '20 块编号、成套入袋（**一套版就是一个 0.9 MB 的库**）', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(480) },
    unbalanced_zh: '原图 20 张 + 玻璃 1 + 胶 0.2 → 版 20 块；一块版要试 1–3 天曝光量，头几块是废版（rate 取乐观的 480 h = 20 天）',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.4 写到新片
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 写回新片：**穿版曝光，不用电子束。** 20 层各跑一遍这条工序链。
     *
     * 为什么这一条能成而"电子束直写"不能：它只需要本层已有的东西 ——
     * 硅片、负胶、碳弧、版、湿法槽、蒸发台。**没有一样是新的。**
     * 而电子束那一半（读+写两用柱）在另一路，不在本文件的 65 台里。
     *
     * 每一层的六步与 `make/cpu-8bit` 是同一套工艺；差别只在**版从哪来**：
     * 那一条的版是"设计出来的"，这一条的版是"从一颗片子上读回来的"。
     * **工艺一样、版不一样 —— 这就是"复版"的全部内容。**
     *
     * ⚠️ 两处真的降级：
     *   ① 水：白名单里只有 `mat/water`（1–1000 µS/cm），而芯片工艺要 18 MΩ·cm
     *      （0.055 µS/cm）。钠、钙会变成氧化层里的可动电荷 → 阈值随温度漂。
     *   ② 蒸铝：真空只到 1 Pa 档（`plant/evaporator` holds 0.001–10 Pa，泵的极限
     *      1–10 Pa），膜厚判据是"透过看灯丝暗红"（10–20 nm 的外观），
     *      **没有膜厚仪，也没有测氧的手段**—— 铝里的氧含量
     *      量不出来，只能靠"蒸之前多抽 10 min"这种没有刻度的纪律。
     */
    id: 'make/deprocess-replica',
    name: '复版裸片制造',
    produces: [
      {
        item: 'std/die-replica-general',
        qty: q(1),
        gives: [
          { param: 'minFeature', kind: 'range', min: 3, max: 5 },
          { param: 'overlay', kind: 'range', min: 0.86, max: 1.7 },
          { param: 'layers', kind: 'range', min: 20, max: 20 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/photomask-general', qty: q(20) }] },
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '① 干氧氧化（1000–1100 °C，场氧 0.1–0.5 µm）',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 1000, max: 1100 }],
      },
      { note_zh: '② 甩胶（0.5–1 µm，厚薄看干涉色 —— 与量块研磨同一招）', performedBy: 'plant/robot' },
      { note_zh: '③ 穿版接触曝光（碳弧紫外，胶面压版，间隙 <1 µm）', performedBy: 'plant/mask-aligner' },
      { note_zh: '④ 显影（碱水）+ 坚膜', performedBy: 'plant/wet-bench' },
      {
        note_zh: '⑤ 开窗腐蚀（HF 0.1 µm/min；金属层换硝酸）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: '⑥ 蒸铝（1 Pa 档、0.1 nm/s；厚度看"透过看灯丝暗红"）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.1, max: 5 }],
      },
      {
        note_zh: '⑦ 剥离/反刻 + 合金化（450–500 °C，30 min）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 450, max: 500 }],
      },
      { note_zh: '⑧ 镜下看套刻标记与连通 → 回②做下一层（共 20 遍）', performedBy: 'plant/mask-aligner' },
    ],
    rate: { hours: q(120) },
    unbalanced_zh: '硅片 1 片（φ100，约 60 个管芯位）+ 版 20 块 → 复版 1 片；其余位置是套刻与腐蚀废品',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.5 第三条路：不剥层，只看大块
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 背面红外透视图。**不剥层、不毁片**的那条路。
     *
     * 硅的带隙 1.12 eV ⇒ 1.1 µm 以上透明。把背面磨到 100 µm，用碳弧照、单点扫，
     * 就能看见有源区与阱的大块形状 —— **硅片自己就是滤光片**（可见光全被吸收，
     * 只有红外过得去），这一条是这套工艺里唯一"不用买器件"的红外成像。
     *
     * 分辨率被两件东西钉死：光斑 0.2 mm（光阑孔的机械加工下限，与
     * `plant/euv-reflectometer/aperture` 同一个数）与台 0.1 mm（手动丝杠的重复性）
     * ⇒ **100–300 µm**。比 5 µm 的读法差 20–60 倍。
     *
     * 所以它不产出图纸，只产出"定位图"：die 在哪、有没有 die、焊盘阵列大概在哪一片。
     * **有它就不用瞎磨** —— 这是它在这条工艺里的位置。
     */
    id: 'make/deprocess-ir-image',
    name: '背面红外透视图制造',
    produces: [
      {
        item: 'std/die-ir-image-general',
        qty: q(1),
        gives: [{ param: 'minFeature', kind: 'range', min: 100, max: 300 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/tailings', qty: q(1) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['std/die-exposed-general'],
    steps: [
      { note_zh: '背面减薄到 100 µm（硅在 1.1 µm 波长以上透明，但掺杂衬底的自由载流子会吸收，要薄到这个量级才透）', performedBy: 'plant/grinder' },
      { note_zh: '背面抛光（绒布 + 石英粉，散射会把信号淹掉）', performedBy: 'plant/cmp-polisher' },
      { note_zh: '红外透射单点扫描（碳弧 + 硅自滤光，光斑 0.2 mm、台 0.1 mm）', performedBy: 'plant/particle-scanner' },
    ],
    rate: { hours: q(8) },
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 三、已知缺口与降级（十行）
//
//   ① 磨料只有石英/尾矿（莫氏 7），没有碳化硅砂纸（莫氏 9）—— 与 EMC 填料同硬度，慢 3–5 倍。
//   ② 没有天平（`plant/comparator` 是长度量具）—— 称重判厚度不成立（0.1 g 对 9.5 mg）。
//   ③ 没有超声换能器（无 PZT）—— 超声测厚不成立（10 MHz 在 2500 m/s 下分辨 125 µm）。
//   ④ 没有铈、白名单里没有 FeCl₃ 与磷酸 —— 铜用浓硝酸代（Cu:Al = 100:1 拿到了，
//      但 M1 的 TaN 会被削掉一半）。
//   ⑤ `plant/wet-bench` 上限 120 °C，而溶 Si₃N₄ 要 160–180 °C 热磷酸 —— **FEOL 那一层
//      在本层去不掉**，所以阱与栅读不到。
//   ⑥ 没有电子束胶（MMA/PMMA 无条目；苯乙烯有但不在白名单）→ 只走接触曝光，不走直写。
//   ⑦ 水只到 1–1000 µS/cm（`mat/water`），芯片工艺要 18 MΩ·cm ⇒ 可动电荷污染。
//   ⑧ 套刻 1σ 0.86 µm，与 5 nm 差 172 倍；20 层随机游走累积 3.8 µm。
//   ⑨ 没有氧分析仪 —— 蒸铝前的"干净"只能靠多抽 10 min 这种无刻度纪律。
//   ⑩ 读/写两用的电子束柱（`plant/e-beam-column`）在另一路，不在本文件 65 台里 → 只记缺口。
// ═══════════════════════════════════════════════════════════════════════════

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...DEPROCESS_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...DEPROCESS_ROUTES];
