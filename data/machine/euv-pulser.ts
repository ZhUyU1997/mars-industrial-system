/**
 * EUV 光源的脉冲电源 —— 整条 EUV 链最后一处真堵点，本文件把它填上。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 这一件堵住谁
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   `euv-source.ts` 缺口③（降级⑥）：无 1 kV / 10 kA 的脉冲电源，
 *     电容与变压器不在那份文件的投料表里 —— 于是 DPP 头只能"检漏"，不能试放；
 *   `euv-reflectometer.ts` 降级①：仪器造得出，量的那束光造不出。
 *
 * 两处指的是同一件：**等离子体点不着，后面所有精度都没有对象。**
 *
 * 要造的指标（题设）：
 *
 *   电压   1 kV
 *   电流   10 kA（峰值）
 *   脉宽   0.1–1 µs
 *   重频   400–1000 Hz
 *   储能   C 取 10 µF → E = ½CV² = ½ × 10 µF × (1 kV)² = **5.0 J/脉冲**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 三块现成的积木（先 grep 确认过，本文件只引用它们的条目 id）
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   硒整流堆   `make/selenium-rectifier` 产出的是 `std/rectifier-rotary-general`
 *              —— **不是**一个新的 id，而是那个 id 的第二条来路（与原路线 OR）。
 *              同一 id 的第一条来路是 `make/rectifier-rotary`：交流电机拖直流发电机。
 *              两支的差别在本文件里是决定性的，见降级点③与 `make/euv-pulser-charger`。
 *   薄膜电容   `std/capacitor-film-general`：**条目声明** 0.01–100 µF / 100–1000 V，
 *              而 `make/capacitor-film` **交付** 0.1–10 µF / 200–630 V。
 *              1 kV 只能串并联堆出来 —— 这一条决定了电容组的全部尺寸与寿命。
 *   ArF 先例   `litho-m3.ts` 的 24 kV × 12 nF × 100 ns = 3.46 J、21 nH —— 同一套算式。
 *              差别在电压：24 kV 下 21 nH 给出 1.1e12 A/s，1 kV 下同样的 21 nH 只有
 *              4.8e10 A/s。**能量差不多、电压低 24 倍，di/dt 就低 24 倍** ——
 *              ArF 那条能用电压买速度，这一条没有电压可挥霍，只能去买电感。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 问题 1：10 kA / 100 ns 的 di/dt 要多少电感 —— 不是 100 nH，是 10 nH
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 无阻尼 RLC 的三个式子定死整个回路：
 *
 *   峰值电流    I = V / √(L/C)          （四分之一周期处）
 *   脉宽        T/4 = (π/2)·√(LC)       （电流从 0 到峰值的那一段）
 *   上升率      (di/dt)max = V / L      （t = 0 处最陡）
 *
 * 代进题设（V = 1 kV、C = 10 µF、E = 5 J），三个要求互相打架：
 *
 *   要 I = 10 kA      L = C·(V/I)² = 10 µF × (1 kV/10 kA)² = **100 nH**
 *                     可 100 nH 下 T/4 = 1.571·√(100 nH × 10 µF) = **1.571 µs**
 *                     → **比 1 µs 的上界还慢 57 %**
 *   要 T/4 ≤ 1 µs     L ≤ (1 µs/1.571)²/C = **40 nH**
 *                     可 40 nH 下 I = V/√(L/C) = 1 kV/√(4×10⁻⁸/10⁻⁵) = **15.8 kA**
 *                     → 电流超 58 %（电极烧蚀按 I² 涨，这是要付的钱）
 *   要 di/dt = 1e11 A/s（10 kA/100 ns）  L = V/(di/dt) = **10 nH**
 *                     10 nH 下 I = **31.6 kA**、T/4 = 0.50 µs
 *                     → 31.6 kA 灌进 φ40 石墨电极，一次就把端面掀掉
 *
 * ｜一句话：½LI² = 5 J 只允许 L 落在一个值上，所以"10 kA、1 µs、5 J"三个数
 * ｜在给定电压下**超定**。能选的只是让哪一头 —— 本文件让 0.1 µs 那一头。
 *
 * 本层能做到的回路电感（算的，不是拍的；每一项都是几何）：
 *
 *   汇流      两块 250 × 170 × 2 mm 铜排夹 1 mm 玻璃，板间距 1 mm、长 60 mm
 *             L = µ₀·l·d/w = 1.257e−6 × 0.06 × 0.001/0.25 = **0.30 nH**
 *   电容 ESL  每只 20 nH（箔极板 + 100 mm 平均匝长），9 只并联 → 20/9 = **2.2 nH**
 *   开关      2 mm 弧道 ~1 nH/mm + 触发针回路 ≈ **4 nH**
 *   枪头馈线  同轴 φ80/φ40、长 100 mm：L = 2e−7·l·ln(b/a) = 2e−7 × 0.1 × 0.693 = **13.9 nH**
 *   ────────────────────────────────────────────────────────
 *   合计 20.1 nH，接头与余量 ×1.5 → **30 nH**
 *
 *   30 nH ⇒ I = **18.3 kA**、T/4 = **0.860 µs**、di/dt = 3.3e10 A/s（10 kA / 300 ns）
 *
 * **"同轴 / 平行板是唯一可能"这一句在本层是对的，但差在量级上。**
 * 决定性的不是电源柜里那 20 nH，是**从柜子到枪头那一段**：把电源装在 3 m 外
 * 用电缆连，0.5 m 的同轴电缆就是 50–250 nH/m → 25–125 nH，一根线吃掉全部预算。
 * 所以这一件的机械结论只有一条（写进了装配路线）：
 * **电源贴在腔体法兰上，枪头馈线是同轴，长度按 100 mm 设计，不许有电缆。**
 *
 * 为什么放弃 0.1 µs 那一头：它要 L = (0.1 µs/1.571)²/C = **0.405 nH** ——
 * 比两块铜排自己的 0.30 nH 只大 33 %，接插件、开关引线、电容内感**任何一项**都超过它。
 * **交付窗口是 0.5–1 µs，不是 0.1–1 µs。** 这是本文件的第一处降级。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 问题 2：电容寿命 —— 1000 Hz 下 "一组撑 17 分钟"
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 1000 Hz = 每分钟 60 000 次充放。工业上这种场合用**自愈式金属化膜**：
 * 局部击穿时金属层蒸发、把故障点孤立掉，寿命 10⁹–10¹⁰ 次。
 *
 * 本层拿不到自愈。`make/capacitor-film` 是**铝箔 + PTFE 膜 + 酚醛浸渍**
 * （data/machine/capacitor.ts 第 74–86 行）：箔极板不蒸发、不孤立，
 * 一次击穿就是硬短路 —— 一只坏了，整串 3 只一起换。
 * 而油浸纸介更做不了：`mat/` 里**一滴油都没有**（`unblock-cleanroom-shell.ts` 89 行、
 * `phase-shifter.ts` 96 行都记过这件事），蓖麻油、电容器纸、变压器油全部没有。
 *
 * 寿命怎么估 —— 三档乘起来，每一档都写出来，好被反驳：
 *
 *   基准   箔式储能电容在额定电压下 **10⁷ 次**（工业脉冲电容的常见标称）
 *   降额   反幂律 L ∝ (V_ref/V)^8；本层运行在 333 V / 630 V = 53 %：
 *          (630/333)^8 = **164 倍** → 1.6e9 次
 *   折扣   本层的手艺差三个数量级，三处各一条：
 *            ① 手工卷绕：层间错位与张力不均 → 局部场强 ×2（`make/capacitor-film`
 *               那句"这是能造和造得好之间最宽的一条缝"）
 *            ② 箔边不折、端面不喷金：边缘气隙是局部放电的起点，酚醛浸不进去
 *            ③ 酚醛不是油：局部放电的生成物是导电碳，没有吸气剂把它吃掉
 *          → 1.6e9 / 1000 ≈ **1.6e6 次**
 *
 * 取整：**10⁶ 次（区间 10⁵–10⁷）**。
 *
 *   1000 Hz → 10⁶/1000 = 1000 s = **0.28 h（17 min）换一组**
 *    400 Hz → **42 min** 换一组
 *   工业自愈膜 10⁹ 次 → 280 h 换一组 —— **差三个数量级**
 *
 * 所以电容组在本层是**消耗件**：机器 `composedOf` 上的 wear 写的就是这件事
 * （每次 100 %、每 0.25 运行小时 —— 10⁶ 次 @1 kHz = 17 min，取 1/4 h）。
 * 一组 9 只，按 `make/capacitor-film` 自己的投料（每只铝 1 + PTFE 1 + 铜 1 +
 * 酚醛 1 = 4 kg）是 36 kg，加铜接线片与玻璃隔板约 **45 kg/组**；
 * 1 kHz 连续跑，一小时 **3.5 组 ≈ 155 kg 料**。
 * ——— 这才是 DPP 在本层真正的成本：不在电上，在膜上。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 问题 3：开关选型 —— 三条路的抖动，与"能不能扛 10 kA"
 * ═══════════════════════════════════════════════════════════════════════
 *
 *                抖动        10 kA / 1e11 A/s 可行吗        结论
 *   火花隙      10–50 ns     ✓ 都做得到                      **选它**
 *   闸流管      1–10 ns      ✗ 氙闸流管不可行（三条）          不可行
 *   晶闸管      <1 ns（门极） ✗ di/dt 上限差 1000 倍           只做触发
 *
 * ── 闸流管（氙）：本层有氙，但闸流管灌的不是氙 ─────────────────────
 *   准分子激光的标配闸流管灌的是**氢 / 氘 0.1–1 Torr**，不是氙。三条理由：
 *     ① 恢复：1 kHz 要在 1 ms 内把栅极控制权收回来。氢的电子迁移率高、去电离快
 *        （µs 级）；氙离子 131 u、亚稳态寿命长，去电离是 **ms 级** → 栅极关不断，
 *        1000 Hz 下会连发。
 *     ② 溅射：10 kA 的氙离子打到阴极，溅射率比氢离子高两个数量级，
 *        本层只能做的氧化物阴极几百小时就穿。
 *     ③ 投料：本文件的许可表里没有 `mat/hydrogen`（euv-source 用了它，那是另一份
 *        文件的许可），也没有陶瓷-金属封接的栅极结构。
 *   **结论：氙闸流管不可行。氙没白给 —— 它去当触发隙的填充气。**
 *   低电离电位（Xe 12.13 eV、Ar 15.76 eV）→ 同样过压下先电离、抖动小；
 *   这是本层用氙的唯一电学理由，用量 1 g 级。
 *
 * ── 晶闸管：压不动 1e11 A/s ───────────────────────────────────────
 *   晶闸管开通是**等离子体在硅片里横向铺开**，铺开速度 0.05–0.1 mm/µs：
 *     φ16 mm 的片子全导通要 80–160 µs；元件标称 di/dt 100–200 A/µs = 1e8 A/s
 *     → 要 1e11 A/s 差 **1000 倍**，硬来就是局部烧穿（di/dt 失效）。
 *   并联 20–200 只**不解决**：di/dt 是**每只**的限制，并联只摊电流、不摊 di/dt；
 *     而均流要求母排对称到 nH 级 —— 那正是本文件做不到的那件事。
 *     （20 只并联还有一个更笨的问题：一只先通，其余 19 只的电流全灌进它。）
 *   **晶闸管的位置在触发回路**：200 V / 0.1 µF / 2 µH，di/dt = 100 A/µs，
 *   正好在标称内 —— 它做的不是切断 10 kA，是"点一下"。
 *
 * ── 选火花隙：三电极、1.2 atm 氩、2 mm 铜电极、氙触发隙 ──────────────
 *   自击穿 1.5 kV/mm × 1.2 atm × 2 mm ≈ 3.6 kV（半球电极场强增强 0.7 → 2.5 kV），
 *   是 1 kV 工作电压的 **2.5–3.6 倍**：不会自己击穿，4 kV 的触发脉冲又打得着。
 *   玻璃壳 φ60 × 2 mm，内外压差 1.2 atm：σ = pd/2t = 121e3 × 0.06/(2 × 0.002)
 *   = **1.8 MPa**（玻璃 ~50 MPa）→ 壳体不是问题，**问题在电极烧蚀**。
 *
 *   抖动预算（要求 ±1 µs，全部是算的）：
 *     石英 1e−5 × 1 ms 周期     10 ns
 *     计数器链传播延迟分散       50 ns
 *     晶闸管 + 2 µH 串感         10 ns
 *     火花隙击穿分散             30 ns
 *     ─────────────────────────────────
 *     合计                     **~100 ns** —— 是 ±1 µs 的 1/10，**够**
 *
 *   晶闸管的 di/dt 上限逼出 2 µH 串感 → 触发前沿 = 1.571·√(2 µH × 0.1 µF) = **0.70 µs**。
 *   前沿慢不增加抖动（抖动问的是重复性，不是速度），但它决定了**本层测不出来**：
 *   没有示波器、没有快光电二极管，这 100 ns 与 `litho-m3.ts` 那句
 *   "21 nH 是算的，不是量的" 是同一个性质。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 问题 4：效率与散热 —— 题设的 2.5 kW 只算了三分之一
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 题设：5 J × 1000 Hz = 5 kW 脉冲功率，效率 50 % → 2.5 kW 废热。
 * 逐项算下来是 **10.8 kW**，因为"50 % 效率"本身要先把账摊开：
 *
 *   项                        功率      依据
 *   到等离子体（有用）         3.5 kW    5 J 减去开关与 ESR 的耗散
 *   限流水电阻                 5.0 kW    RC 充电的理论下限：源给 10 J、容只拿 5 J
 *   旋转变流机                 4.3 kW    `rotary-converter.ts` 自己的 70 %
 *   火花隙弧耗                 1.0 kW    200 V × 10 kA × 0.5 µs = 1.0 J/脉冲
 *   电容 ESR（9 只并 10 mΩ）   0.5 kW    7 kA rms × 10 mΩ × 1 µs = 0.49 J/脉冲
 *   ──────────────────────────────────────────────────────
 *   电输入 14.3 kW，废热 **10.8 kW**，整体效率 **24 %**
 *
 * 那 5 kW 不进散热板：它是**水电阻**，5 kW 正好蒸 8 kg/h 水
 * （5 000 × 3 600 / 2 260 000 = 7.96 kg/h），热随蒸汽走 —— 代价是每小时 8 kg 水。
 * 剩下的 **5.8 kW** 才要散热面：
 *
 *   辐射（`radiator.ts` 的口径）350 K、850 W/m² → 6.8 m²
 *   本层把水温压到 330 K（酚醛浸渍与电容热点 ≤ 85 °C）672 W/m² → **8.6 m²**
 *   自然对流：0.6 kPa 下只有 **0.2–0.5 W/(m²·K)**（`unblock-acid-cooler.ts` 117 行
 *     引 `unblock-radiator-piping.ts` 第 298/380 行的结论）；ΔT 50 K → 10–25 W/m²
 *     → **只靠对流要 232–580 m²**，是辐射的 27–67 倍
 *   ⇒ 散热面 **8.6 m²**，挂 `plant/radiator`；对流只占 2–3 %，可以忽略但不可以算进去
 *
 * 两处对照，都是本层的账：
 *   ① 若把限流电阻换成**谐振充电扼流圈**（10 mH 铁芯 + 一只 1 kV 晶闸管），
 *      电阻那 5 kW 立刻消失、电输入从 14.3 kW 掉到 9.3 kW、耗水 8 kg/h 归零 ——
 *      而**散热面不变**（那 5 kW 本来就没走散热板）。本层没有耐压 1 kV 的晶闸管
 *      （`pattern.ts` 的晶闸管只声明 ratedCurrent），所以这 5 kW 与 8 kg/h 水是
 *      **"没有高压半导体"的直接价钱**。
 *   ② 那 3.5 kW 到等离子体之后大部分变成枪头与腔壁的热，不在本文件的散热面里
 *      （`plant/euv-source` 的水冷夹套接着）—— 本文件只算电源自己这 5.8 kW。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 选型结论（一句话）
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   主开关   **三电极吹气火花隙**（1.2 atm 氩、2 mm 铜电极、氙触发隙、玻璃壳）
 *   触发     **石英 1 MHz ÷ 1000 + 十进计数器 + 晶闸管 + 2 µH + 1:20 脉冲变压器**
 *   充电     **旋转变流机做 1 kV 母线 + 33 Ω 水电阻**（硒堆只做 200 V 辅助电源）
 *   储能     **9 只 10 µF/630 V 薄膜电容，3 串 3 并 → 10 µF / 1 890 V / 5 J**
 *   汇流     **铜排夹 1 mm 玻璃、贴装在同轴枪头上**，回路 30 nH
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 已知缺口与降级点（十条，卡在哪一步都写出来）
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   ① 脉宽 0.5–1 µs，不是 0.1–1 µs：0.1 µs 那头要 0.405 nH，比铜排自己的 0.30 nH
 *      只大 33 %，接插件就超了。
 *   ② 峰值 15–18 kA，不是"正好 10 kA"：L 压到 30–40 nH 才能进 1 µs，电流只好超。
 *      不超的唯一办法是降充电电压（800 V → 12.6 kA / 3.2 J），那样 EUV 转换效率更差。
 *   ③ 1 kHz 的母线不是硒堆：50 Hz 全波整流要 10 A 的平均电流、纹波压到 100 V 就得
 *      1 mF 滤波 = 200 只薄膜电容（约 800 kg）；硒堆那一支在本层只够 **200 Hz**。
 *      1 kHz 靠旋转变流机的电枢与飞轮（同一个条目 id 的另一条 OR 路线），代价 70 %。
 *   ④ 限流电阻吃掉 5 kW（RC 充电的理论下限）与 8 kg/h 水；换成谐振充电要 1 kV 晶闸管，
 *      本层没有。**这是全文件最贵的一处"没有高压半导体"。**
 *   ⑤ 电容组 10⁶ 次 = 1 kHz 下 17 min 一组，是消耗件（wear 已写）；工业自愈膜是 10⁹。
 *   ⑥ 开关电极 10⁶ 次 = 17 min 一组；本层没有钨、没有钼，电极烧蚀了只能车一刀再上
 *      （车三次 R6 就成 R12，间隙不对了，只能换）。
 *   ⑦ 抖动 100 ns 是算的，不是量的：没有示波器、没有快光电二极管（与 litho-m3 的 21 nH 同性质）。
 *   ⑧ **测不了氧**：氩/氙里若有 1 % 氧，电极氧化 + 局部放电使抖动
 *      从 30 ns 涨到 100 ns 以上、蚀耗翻倍；本层只能靠充气前抽到 1 Pa、气瓶按 99.9 % 买，
 *      不测。这是本文件的氧问题，按 #23 第 1 条照实写降级，不改数据。
 *   ⑨ 电感 30 nH 也是算的：本层没有电感表，只能按放电周期反推（`make/euv-pulser-busbar` 第 4 段）。
 *   ⑩ 水电阻电解出 H₂ 约 4 g/h + O₂ 30 g/h（约 0.4 m³/h）：本层唯一一处**自己产氢氧
 *      混合气**的地方，必须敞口排气、不许密闭 —— 而氧/氢都测不了（还是 #23）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const EUV_PULSER_ITEMS: readonly Item[] = [
  // ───────────────────────────────────────────────────────────────────────
  // 零件
  // ───────────────────────────────────────────────────────────────────────

  /**
   * 储能电容组。**3 串 3 并，9 只 10 µF / 630 V 薄膜电容。**
   *
   *   串并      C = 10/3 × 3 = **10 µF**；耐压 3 × 630 = **1 890 V**
   *   每只承压  1 000/3 = 333 V = 额定的 53 %（脉冲电容的标准降额）
   *   储能      ½ × 10 µF × 1 kV² = **5.0 J**
   *   为什么不是 2 串：2 × 630 = 1 260 V 只有 1.26 倍余量，而 DPP 的放电是**欠阻尼**的，
   *            1 kV 之后电流反相，末只电容会看到 1.3–1.5 kV —— 差 10 % 就击穿。
   *   体积      PTFE 只能拉到 25 µm（工业用 6–8 µm 金属化膜），介电体积按
   *            A = C·d/(ε₀εr) = 10 µF × 25 µm /(8.854e−12 × 2.1) = **13.4 m²** 极板面积
   *            → 每只 ~0.67 L 的膜 + 0.05 mm 铝箔，一组约 45 kg。
   *            同一容量在工业上是一个 φ40 × 120 的罐子 —— **本层要三倍体积**。
   *
   * 三个电容是全文件最弱的三个数，都写在这里：电容 10 µF（±20 %，手工卷绕只能配组）、
   * 耐压 1 890 V（串起来算的）、能量 5 J（前两个乘出来）。
   */
  {
    id: 'plant/euv-pulser/cap-bank',
    name: '脉冲电源储能电容组',
    unit: '件',
    category: 'part',
    props: [
      { param: 'capacitance', kind: 'range', min: 0, max: 100, unit: 'µF', dir: 'atLeast' },
      { param: 'ratedVoltage', kind: 'range', min: 0, max: 2000, unit: 'V', dir: 'atLeast' },
      { param: 'energy', kind: 'range', min: 0, max: 10, unit: 'J', dir: 'atLeast' },
    ],
  },

  /**
   * 低感汇流排。两块 250 × 170 × 2 mm 铜排夹一片 1 mm 玻璃，螺栓压紧。
   *
   *   L = µ₀·l·d/w = 1.257e−6 × 0.06 × 0.001/0.25 = **0.30 nH**（板）
   *   加 9 只电容的接线片与螺栓 → 合计 **≤ 2 nH**
   *
   * 为什么是"平行板"而不是铜排走线：两根并走 60 mm 的 20 × 2 mm 铜排是一个**回路**，
   * 磁场不抵消 —— L = 4e−7·l·ln(d/r_eq) = 4e−7 × 0.06 × ln(20/4.9) = **34 nH**，差 110 倍。
   * 夹一层绝缘做成平行板，回流就在对面那一层里，磁场自己吃掉自己。
   *
   * 绝缘为什么用玻璃：本层的投料表里没有 PTFE 膜、没有酚醛板（那是
   * `make/capacitor-film` 的内部用料），**玻璃是唯一可得的固体介质**。
   * 1 mm 玻璃、1 kV → 1 kV/mm，硼硅玻璃的设计场强 4 kV/mm（`litho-m3.ts` 那条），
   * 有 4 倍余量。
   */
  {
    id: 'plant/euv-pulser/busbar',
    name: '脉冲电源低感汇流排',
    unit: '件',
    category: 'part',
    props: [{ param: 'inductance', kind: 'range', min: 0, max: 1000, unit: 'nH', dir: 'atMost' }],
  },

  /**
   * 主开关：三电极吹气火花隙。玻璃壳 φ60 × 2 mm，1.2 atm 氩。
   *
   *   电极  两只铜半球 R6，间隙 2 mm，同轴 0.02
   *   触发  中间一根 φ3 石墨针，针尖距主电极 0.5 mm；触发脉冲 4 kV / 2 mJ
   *   自击穿 1.5 kV/mm × 1.2 atm × 2 mm ≈ 3.6 kV（半球场强增强 → 2.5 kV）
   *         = 工作电压的 2.5–3.6 倍：不自己击穿，又打得着
   *   抖动  10–50 ns（触发式）；自击穿式 > 100 ns，所以用触发、不用过压击穿
   *   寿命  10⁶ 次（电极烧蚀定，不是电路定）→ 1 kHz 下 **17 min**
   *
   * 为什么不用 DPP 头自己那 5 mm 间隙当开关（自击穿）：那样省掉这一件，
   * 但抖动到 100 ns 以上、电极与喷嘴同寿、而且**放电时刻由氙气密度决定**，
   * 与液滴/气流的 ±1 µs 同步就没了。所以单独一只开关，把"什么时候放电"抓在手里。
   */
  {
    id: 'plant/euv-pulser/switch',
    name: '脉冲电源主开关',
    unit: '件',
    category: 'part',
    props: [
      { param: 'current', kind: 'range', min: 0, max: 100000, unit: 'A', dir: 'atLeast' },
      { param: 'jitter', kind: 'range', min: 0, max: 1000, unit: 'ns', dir: 'atMost' },
      { param: 'life', kind: 'range', min: 0, max: 1000000000, unit: '次', dir: 'atLeast' },
    ],
  },

  /**
   * 充电机：1 kV 母线 + 限流水电阻 + 200 V 辅助电源。
   *
   *   母线     `std/rectifier-rotary-general`（旋转变流机，70 %，带飞轮）
   *             —— 10 A 平均、30 A 峰值，10 ms 的整流缺口由电枢惯量顶住
   *   限流     **33 Ω 水电阻**（两块 0.5 × 0.5 m 铜板相距 0.3 m，ρ ≈ 30 Ω·m 的石灰水）
   *             τ = RC = 33 Ω × 10 µF = **0.33 ms**；1 ms 充到 950 V（3τ），
   *             母线整定在 1.05 kV 才够 1 000 V
   *             峰值 30 A、rms 12.2 A，**损耗 5 J/脉冲 = 5 kW**（RC 充电的理论下限：
   *             源给 10 J、容只拿 5 J，另一半一定落在电阻上）
   *   辅助     `std/transformer-general` 5 kVA（1 kV → 200 V）+ 硒堆 1 台（8 片）
   *             → 给触发单元充电，1 mA 级，硒堆 60–70 % 的效率在这里无所谓
   *
   * 三个数：1 000 V（母线整定 1.05 kV、3τ 后 950 V）、1 ms（1000 Hz 的周期）、
   * 10 kW（母线输出；输入 14.3 kW）。
   */
  {
    id: 'plant/euv-pulser/charger',
    name: '脉冲电源充电机',
    unit: '件',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 0, max: 2000, unit: 'V', dir: 'atLeast' },
      { param: 'chargeTime', kind: 'range', min: 0, max: 10000, unit: 'µs', dir: 'atMost' },
      { param: 'power', kind: 'range', min: 0, max: 20000, unit: 'W', dir: 'atLeast' },
    ],
  },

  /**
   * 触发单元：石英 1 MHz ÷ 1000 → 1 kHz，晶闸管点 4 kV 触发脉冲。
   *
   *   时钟   `std/quartz-resonator-general` 1 MHz（`make/quartz-resonator` 交付 32–1000 kHz，
   *          取窗口上界），稳定度 1e−5 → 1 ms 周期上 **10 ns**
   *   分频   `std/counter-chip-general` ×2：÷100 与 ÷10 → 1 kHz；预置成 ÷2500 → 400 Hz
   *   开关   `std/thyristor-general` + **2 µH 空心电感**（限 di/dt 到 100 A/µs）
   *   升压   1:20 脉冲变压器 → 200 V 变 4 kV，能量 2 mJ
   *   抖动   10（石英）+ 50（计数器）+ 10（晶闸管）+ 30（火花隙）= **~100 ns**
   *          vs 要求 ±1 µs → **裕量 10 倍，够**
   *
   * 为什么要石英而不是 RC 定时：DPP 的同步对象是液滴（压电振子 45–55 kHz）与气流，
   * 三者的时钟必须同源。RC 的 1 % 在 1 ms 上是 10 µs —— **正好把 ±1 µs 的预算吃光**。
   * 石英的 1e−5 是它的 1/100，这就是本层"时间比电阻做得精"（`data/material/clock.ts`）的兑现。
   */
  {
    id: 'plant/euv-pulser/trigger',
    name: '脉冲电源触发单元',
    unit: '件',
    category: 'part',
    props: [
      { param: 'jitter', kind: 'range', min: 0, max: 10000, unit: 'ns', dir: 'atMost' },
      { param: 'repRate', kind: 'range', min: 0, max: 2000, unit: 'Hz', dir: 'atLeast' },
    ],
  },

  /**
   * 水冷板：把旋转变流机机座、火花隙外壳与电容排串在一条水路上。
   *
   *   带走 4.3（旋转变流机）+ 1.0（火花隙）+ 0.5（电容 ESR）= **5.8 kW**
   *   水 1.2 m³/h、进出口温差 4.2 K（ṁcΔT = 0.333 kg/s × 4 180 × 4.2 K）
   *   流道 8 × 8 mm、12 道折返 → 湿周面积 6 m × 0.032 = **0.19 m²**，水侧 h ≈ 3 000
   *   → 壁-水温差 5 800/(3 000 × 0.19) = **10 K**：板面 ≤ 57 °C、电容热点 ≤ 82 °C（目标 85）
   *
   * 5.8 kW 之后的事在板外：`plant/radiator` 8.6 m²（330 K、672 W/m²）。
   * 水温为什么压到 330 K 而不是 350 K：酚醛浸渍的长期上限 ~150 °C，电容热点要 ≤ 85 °C，
   * 而冷板与热点差 ~25 K —— **20 K 的代价是散热面积多 25 %**（6.8 → 8.6 m²）。
   */
  {
    id: 'plant/euv-pulser/cold-plate',
    name: '脉冲电源水冷板',
    unit: '件',
    category: 'part',
    props: [{ param: 'dissipation', kind: 'range', min: 0, max: 20000, unit: 'W', dir: 'atLeast' }],
  },

  /**
   * 机柜。1.8 × 0.8 × 0.8 m，1.5 mm 钢板，四角立柱；前门装铜丝网（10 目）做屏蔽。
   *
   * 屏蔽不是讲究：10 kA/0.86 µs 的放电，dI/dt 3.3e10 A/s，一只 100 mm 的回路就是
   * 3.3 kV 的感应电势 —— 不屏蔽，旁边的计数器会自己跳。
   * 本层没有频谱仪、没有场强计，屏蔽效果只能靠"计数器不乱跳"判（又一处"测不了"）。
   */
  { id: 'plant/euv-pulser/rack', name: '脉冲电源机柜', unit: '件', category: 'part' },

  // ───────────────────────────────────────────────────────────────────────
  // 设备
  // ───────────────────────────────────────────────────────────────────────

  /**
   * 脉冲电源整机。**没有产出路线** —— 与 `plant/euv-source` 同一种写法：
   * 它 `holds` 什么都不 hold（电压与电流是它的输出，不是它维持的环境），
   * 在描述里的作用是作为 `needs` 出现："这一步要在整机上做"。
   *
   * 它为什么是设备而不是零件：它有自己的零件清单（7 件）、会被换件（电容组与开关
   * 是消耗件，写在 composedOf 的 wear 上）、并且**四道工序要整机在场**
   * （电容配组、开关试打、充电整定、触发放相）—— 这一条与"零件"的判据（有归属、
   * 按件计、有来历、不执行工序）正好相反。
   *
   * 四个属性里，`pulseWidth` 写 500–1000 ns 而不是题设的 100–1000：
   * **交付的是它能做到的，不是被要求的**（降级点①）。
   */
  {
    id: 'plant/euv-pulser',
    name: '脉冲电源整机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'voltage', kind: 'range', min: 0, max: 2000, unit: 'V', dir: 'atLeast' },
      { param: 'current', kind: 'range', min: 0, max: 50000, unit: 'A', dir: 'atLeast' },
      { param: 'pulseWidth', kind: 'range', min: 500, max: 1000, unit: 'ns' },
      { param: 'repRate', kind: 'range', min: 0, max: 2000, unit: 'Hz', dir: 'atLeast' },
    ],
    composedOf: [
      // 10⁶ 次 @ 1 kHz = 17 min；wear 取 1/4 运行小时（=15 min，偏保守）。
      { item: 'plant/euv-pulser/cap-bank', qty: q(1), wear: { amount: q(1), per: q(1, 4) } },
      { item: 'plant/euv-pulser/busbar', qty: q(1) },
      { item: 'plant/euv-pulser/switch', qty: q(1), wear: { amount: q(1), per: q(1, 4) } },
      { item: 'plant/euv-pulser/charger', qty: q(1) },
      { item: 'plant/euv-pulser/trigger', qty: q(1) },
      { item: 'plant/euv-pulser/cold-plate', qty: q(1) },
      { item: 'plant/euv-pulser/rack', qty: q(1) },
    ],
  },
];

export const EUV_PULSER_ROUTES: readonly Route[] = [
  // ───────────────────────────────────────────────────────────────────────
  // 零件路线
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * 储能电容组：9 只 10 µF/630 V 配组 → 3 串 3 并 → 耐压老炼 → 装整机配组。
     *
     * 这一条路线最要紧的一步是**配组**，而它不是电气工序，是"分类"：
     * 手工卷的 9 只容值分散 ±20 %，3 串里若三只差 20 %，1 kV 分下去就是
     * 375/333/292 V —— 差的那只先击穿。所以先逐只测、按 3 只一组把容值差压到 5 % 以内。
     * **本层没有电容表**（`meter.ts` 里没有电容档）：只能用电压表 + 已知电阻放电、
     * 看时间 —— 充到 100 V、在 100 kΩ 上放到 37 V，τ = RC 反解 C，精度 ±3 %。
     *
     * 交付窗口是 3S3P 的结果（10 µF / 1 890 V / 5 J），不是单只的。
     */
    id: 'make/euv-pulser-cap-bank',
    name: '脉冲电源储能电容组制造',
    produces: [
      {
        item: 'plant/euv-pulser/cap-bank',
        qty: q(1),
        gives: [
          { param: 'capacitance', kind: 'range', min: 10, dir: 'atLeast' },
          { param: 'ratedVoltage', kind: 'range', min: 1500, dir: 'atLeast' },
          { param: 'energy', kind: 'range', min: 5, dir: 'atLeast' },
        ],
      },
    ],
    uses: [
      {
        /**
         * 9 只薄膜电容。**要 630 V 那一档、容值取窗口上界 8–10 µF。**
         * 放宽到 200 V 那一档：1 kV 要串 6 只 → 每组 1.67 µF，凑 10 µF 要 6 组并联
         * = **36 只**（体积与料翻 4 倍）。**功能还在**（电容还是电容），
         * 所以是 `functional-kept`。
         */
        anyOf: [
          {
            item: 'std/capacitor-film-general',
            qty: q(9),
            need: [
              { param: 'ratedVoltage', kind: 'range', min: 400, max: 630 },
              { param: 'capacitance', kind: 'range', min: 8, max: 10 },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      // 9 只的接线片与串间连接：0.2 mm 铜片，每只两片，加余量 6 kg
      { anyOf: [{ item: 'mat/copper', qty: q(6) }] },
      // 组间隔板与引出套管（玻璃是唯一可得的固体绝缘）
      { anyOf: [{ item: 'mat/glass', qty: q(3) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh:
          '逐只测容值（充到 100 V、量 100 kΩ 上的放电时间反解 C，精度 ±3 %）、按 3 只一组把容值差压到 5 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      { note_zh: '焊铜接线片、装组间隔板与引出套管（9 只 → 3 串 3 并）', performedBy: 'plant/robot' },
      {
        note_zh:
          '耐压老炼：1.4 kV 空载打 1 000 次（没有局部放电检测，只能打完测绝缘电阻；击穿的挑出来换）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '在整机上配组：3S3P 接汇流排，按放电声音的脆度与感应铜环的亮度把三串调平（没有示波器，见降级⑦）',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      '薄膜电容 9 只 × 4 kg（每只按 make/capacitor-film 的投料：铝 1 + PTFE 1 + 铜 1 + 酚醛 1）= 36 kg + 铜 6 + 玻璃 3 → 电容组 1 件（约 45 kg）；余是接线片剪屑与老炼打坏的 1–2 只',
  },

  {
    /**
     * 低感汇流排：剪板 → 钻孔铣绝缘槽 → 夹玻璃叠压 → 装同轴馈线座。
     *
     * 这一条是**机械决定电气**的典型：0.30 nH 是几何算出来的，装歪 10 mm
     * 脉宽就变。所以最后一步不是"测电感"（本层没有电感表），是**用放电周期反推**：
     * 拿一组已知的 10 µF 打一次，从电流环（感应铜环）的宽度读 T/4，
     * 反解 L = (T/4 / 1.571)²/C = (0.86 µs/1.571)²/10 µF ≈ 30 nH。
     * 精度只有 ±30 %，但足够判"是 30 nH 还是 300 nH" —— 而后者才是会出事的那一档。
     */
    id: 'make/euv-pulser-busbar',
    name: '脉冲电源低感汇流排制造',
    produces: [
      {
        item: 'plant/euv-pulser/busbar',
        qty: q(1),
        gives: [{ param: 'inductance', kind: 'range', max: 2, dir: 'atMost' }],
      },
    ],
    uses: [
      // 两块 250 × 170 × 2 mm 铜排（0.76 kg ×2）+ 9 对电容接线片 + 同轴馈线座
      { anyOf: [{ item: 'mat/copper', qty: q(4) }] },
      // 1 mm 玻璃绝缘板 250 × 170 + 螺栓绝缘垫
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      // 压板与屏蔽罩
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '剪板、折边：两块 250 × 170 × 2 mm 铜排（四边折 5 mm 防电晕）', performedBy: 'plant/sheet-shop' },
      { note_zh: '铣绝缘槽、钻 36 个孔（9 只电容 × 2 + 馈线座 4）、攻丝', performedBy: 'lathe' },
      { note_zh: '夹 1 mm 玻璃叠压，螺栓 6 N·m 对角紧（压不实就有气隙，气隙就是局部放电点）', performedBy: 'plant/robot' },
      {
        note_zh:
          '反推电感：用已知 10 µF 打一次，从感应铜环的波形宽度读 T/4 → L = (T/4/1.571)²/C；30 nH 合格、> 100 nH 就重装（没有电感表，降级⑨）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(12) },
    unbalanced_zh: '铜 4 + 玻璃 1 + 钢板 2 → 汇流排 1 件（约 7 kg）；余是剪边与钻孔屑',
  },

  {
    /**
     * 主开关：车铜电极 → 玻璃-金属封接 → 装触发针与吹气口 → 充气 → 整机试打。
     *
     * 充气那一步是本层最像"真空管"的一道，但比闸流管省掉三件事：不要阴极、
     * 不要栅极、不要烘烤除气。留下的只有"静置 24 h 看气压"——
     * 本层没有氦检漏（`make/euv-source-vessel` 那句"涂酒精看气泡"），
     * 所以漏率判到 1e-3 Pa·L/s 级；玻璃-金属封接漏到这一档就够，因为
     * 1.2 atm 的氩本来就要在几十小时里慢慢漏（电极磨损先到）。
     *
     * 氙在这里是**唯一用处**：触发隙充 2 kPa 氙，低电离电位让它先电离。
     * 用量 1 g 级 —— 全层最贵的气体，用在最便宜的位置上。
     */
    id: 'make/euv-pulser-switch',
    name: '脉冲电源主开关制造',
    produces: [
      {
        item: 'plant/euv-pulser/switch',
        qty: q(1),
        gives: [
          { param: 'current', kind: 'range', min: 10000, dir: 'atLeast' },
          { param: 'jitter', kind: 'range', max: 50, dir: 'atMost' },
          { param: 'life', kind: 'range', min: 1000000, dir: 'atLeast' },
        ],
      },
    ],
    uses: [
      // 两只半球电极 R6、上下法兰、触发针座
      { anyOf: [{ item: 'mat/copper', qty: q(3) }] },
      // φ3 石墨触发针（碳在 10 kA 的弧根上不熔化，只升华）
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 10) }] },
      // 主间隙 1.2 atm 氩：腔 60 cm³ → 0.12 g，含吹扫按 10 g 记
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
      {
        /**
         * 触发隙 2 kPa 氙，含吹扫按 1 g 记。
         *
         * 99.9 % 是硬要求：20 % 的富氙气里 80 % 是氮与氩，它们电离电位更高、
         * 先被电离却发不出足够的种子电子，抖动从 30 ns 涨到 100 ns 以上 ——
         * **功能还在（还是能点着），所以 `functional-kept`**，代价是抖动预算
         * 从 100 ns 涨到 170 ns（仍小于 ±1 µs，所以不算换东西）。
         * 与 `make/euv-dpp-head` 那里 `functional-lost` 的判法不同：那里氙是燃料，
         * 这里氙只是引子。
         */
        anyOf: [
          {
            item: 'mat/xenon',
            qty: q(1, 1000),
            need: [{ param: 'purity', kind: 'range', min: 99.9, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      // 陶瓷绝缘套与封接环（1.2 atm 压差下玻璃-金属封接的过渡件）
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
      // 玻璃壳 φ60 × 2 mm × 120 mm
      { anyOf: [{ item: 'mat/glass', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车两只铜半球电极 R6、端面 Ra 1.6、间隙 2 mm；车上下法兰与触发针座（同轴 0.02）', performedBy: 'lathe' },
      { note_zh: '玻璃-金属封接：φ60 × 2 mm 玻璃壳与铜法兰封接（1.2 atm 压差，σ = 1.8 MPa）', performedBy: 'plant/robot' },
      { note_zh: '装石墨触发针，针尖距主电极 0.5 mm；装吹气口与接地环', performedBy: 'plant/robot' },
      {
        note_zh:
          '抽到 1 Pa、充氩 1.2 atm + 氙 2 kPa；静置 24 h 看气压（没有氦检漏，漏率只判到 1e-3 Pa·L/s）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '整机试打：1 kV 打 1 000 次，称重看电极烧蚀、用感应环与计数器读抖动分散（目标 ≤ 50 ns）',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(20) },
    unbalanced_zh:
      '铜 3 + 石墨 0.1 + 氩 0.01 + 氙 0.001 + 耐火瓷 1 + 玻璃 2 → 开关 1 件；余是车屑与充放气损耗（氙 1 g 里真正留在管里的不到 0.03 g）',
  },

  {
    /**
     * 充电机：绕变压器 → 装旋转变流机与飞轮 → 砌水电阻 → 整定充电时间。
     *
     * ⚠️ 这一条与本文件头问题 4 的第三节是一件事：**1 kHz 的母线不是硒堆做的**。
     *
     *   硒堆一支（`make/selenium-rectifier`，同一个条目 id 的 OR 路线）：
     *     50 Hz 全波整流、10 A 平均，纹波要压到 100 V 就得 1 mF 滤波
     *     = 200 只薄膜电容 ≈ 800 kg。硒堆本身没有错，错在**频率**：
     *     它按 50 Hz 的充电电源设计，而这里要的是 1 kHz 的连续 10 A。
     *     → 这一支在本层只够 **200 Hz**，且只能做 200 V 辅助电源（触发单元的 1 mA）。
     *   旋转变流机一支（`make/rectifier-rotary`）：电枢 + 飞轮把 10 ms 的缺口顶住，
     *     内阻 1 Ω 级 → 30 A 的充电脉冲只掉 30 V。代价是效率 70 %（4.3 kW 热）。
     *
     * 水电阻为什么不是铸铁电阻栅：33 Ω / 5 kW 的铸铁栅要 3 300 m 的薄带
     * （ρ_铁 = 1e−7 Ω·m，R = ρL/A 反算），本层没有镍铬丝（`mat/resistance-wire`
     * 不在本文件的许可表里）。水是唯一能同时给"33 Ω""5 kW""可调"三样的东西。
     * 代价：石灰水吸 CO₂ 长碳酸钙壳，要定期换水；还要敞口排气（电解出 H₂ 4 g/h）。
     */
    id: 'make/euv-pulser-charger',
    name: '脉冲电源充电机制造',
    produces: [
      {
        item: 'plant/euv-pulser/charger',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 1000, dir: 'atLeast' },
          { param: 'chargeTime', kind: 'range', max: 1000, dir: 'atMost' },
          { param: 'power', kind: 'range', min: 10000, dir: 'atLeast' },
        ],
      },
    ],
    uses: [
      {
        /** 5 kVA 工频变压器：1 kV → 200 V，供辅助电源取 20 VA（本层只有这一档铁芯）。 */
        anyOf: [
          {
            item: 'std/transformer-general',
            qty: q(1),
            need: [{ param: 'ratedPower', kind: 'range', min: 5, max: 500 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      /**
       * 1 kV 母线：旋转变流机 1 台（`make/rectifier-rotary` 那一支）。
       * 硒堆 1 台（`make/selenium-rectifier` 那一支）做 200 V 辅助电源 ——
       * **同一个 id、两条 OR 路线，这里两台各走一支**，这正是那个 id 存在的意思。
       */
      { anyOf: [{ item: 'std/rectifier-rotary-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      // 1 kV 母线铜排 + 水电阻两块 0.5 × 0.5 m 电极
      { anyOf: [{ item: 'mat/copper', qty: q(8) }] },
      // 玻璃水箱 0.5 × 0.5 × 0.6（水位可调）+ 绝缘子
      { anyOf: [{ item: 'mat/glass', qty: q(6) }] },
      // 水箱外壳与机柜底座
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(4) }] },
      /**
       * 水电阻的工质：250 kg 石灰水（ρ ≈ 30 Ω·m）。
       * 用石灰不用盐：本层没有 `mat/salt`，而 `mat/lime`（CaO → Ca(OH)₂）是
       * 唯一可得的可溶电解质。5 kW 蒸 8 kg/h，**这是连续耗水项**，
       * 按一批（1 h）的补水量记在这里。
       */
      { anyOf: [{ item: 'mat/water', qty: q(250) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '绕辅助变压器：5 kVA、1 kV / 200 V（实际只取 20 VA，本层只有这一档铁芯）', performedBy: 'plant/winder' },
      { note_zh: '装旋转变流机与飞轮（10 kW、1 kV），调励磁抽头把输出整定到 1.05 kV；做空载与 10 A 负载试验（量电压跌落 < 5 %）', performedBy: 'plant/robot' },
      {
        note_zh:
          '砌水电阻：玻璃箱 0.5 × 0.5 × 0.6、两块 0.5 × 0.5 m 铜板相距 0.3 m、石灰水调 ρ 到 30 Ω·m → 36 Ω；电极可升降，插到 0.27 m 得 33 Ω',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '整定充电：τ = RC = 0.33 ms，1 ms 后到 950 V；用电压表与放电声音判，反复调电极深度与母线抽头（没有示波器）',
        performedBy: 'plant/robot',
      },
      { note_zh: '装敞口排气管与补水口（水电阻电解出 H₂ 4 g/h，实测 ~0.4 m³/h 混合气，不许密闭）', performedBy: 'plant/sheet-shop' },
    ],
    rate: { hours: q(40) },
    unbalanced_zh:
      '变压器 1 台 + 旋转变流机 2 台 + 接触器 1 + 铜 8 + 玻璃 6 + 钢板 4 + 水 250 + 石灰 1 → 充电机 1 件；水是水电阻的工质（5 kW 蒸 8 kg/h，要持续补水），不进成品',
  },

  {
    /**
     * 触发单元：装分频链 → 改绕脉冲变压器 → 绕 2 µH 空心电感 → 整机校相。
     *
     * 这条路线里最不显眼、最要紧的是那 2 µH：晶闸管的 di/dt 标称 100–200 A/µs，
     * 而 200 V 直接短路它就是一个 200 V/0.1 µF 的无感回路 → 上 1 000 A/µs，
     * 一次就烧。串 2 µH 把上升率压到 V/L = 200 V/2 µH = **100 A/µs**，正好在线内。
     * 代价是触发前沿从 50 ns 掉到 0.70 µs —— 抖动不变，但**确定不了它**（降级⑦）。
     *
     * 脉冲变压器为什么用 5 kVA 的工频铁芯：本层只有这一档（`std/transformer-general`
     * 交付 5–500 kVA）。传的功率只有 2 mJ × 1 kHz = 2 W，铁芯在 1 kHz 下涡流损耗
     * 大十倍也无所谓 —— 这是本文件唯一一处"用大件干小事"而不付代价的地方。
     */
    id: 'make/euv-pulser-trigger',
    name: '脉冲电源触发单元制造',
    produces: [
      {
        item: 'plant/euv-pulser/trigger',
        qty: q(1),
        gives: [
          { param: 'jitter', kind: 'range', max: 100, dir: 'atMost' },
          { param: 'repRate', kind: 'range', min: 1000, dir: 'atLeast' },
        ],
      },
    ],
    uses: [
      {
        /**
         * 1 MHz 石英。`make/quartz-resonator` 交付 32–1 000 kHz，1 MHz 正好在窗口上界
         * （片子磨到 28 µm 是 100 kHz，1 MHz 要磨到 2.8 µm）。
         *
         * 为什么要 1 MHz 而不是 100 kHz —— **难点不在抖动，在相位分辨力**：
         * 液滴与放电锁在同一个时钟上，两者的相对相位只能取时钟周期的整数倍。
         * 1 MHz 时是 **1 µs**，正好等于题设的 ±1 µs；100 kHz 时是 10 µs，粗 10 倍。
         * 降一档到 100 kHz 仍能出 1 kHz（÷100）与 400 Hz（÷250）—— **同步还在，
         * 精度掉一档**，所以是 `functional-kept`（第 24 条：降级换得掉精度）。
         */
        anyOf: [
          {
            item: 'std/quartz-resonator-general',
            qty: q(1),
            need: [{ param: 'frequency', kind: 'range', min: 500, max: 1000 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      // ÷100 与 ÷10 两级十年计数器（÷1000 → 1 kHz；预置 ÷2500 → 400 Hz）
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(2) }] },
      // 触发开关：200 V / 0.1 µF，di/dt 限到 100 A/µs
      { anyOf: [{ item: 'std/thyristor-general', qty: q(1) }] },
      // 1:20 脉冲变压器（200 V → 4 kV，2 mJ）
      {
        anyOf: [
          {
            item: 'std/transformer-general',
            qty: q(1),
            need: [{ param: 'ratedPower', kind: 'range', min: 5, max: 500 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      // 触发储能 0.1 µF（本层薄膜电容的最小档）
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(1) }] },
      // 2 µH 空心线圈（无磁芯：磁芯会饱和，饱和了 di/dt 就限不住）+ 引线
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
      // 屏蔽盒（dI/dt 3.3e10 A/s 的邻场里，不屏蔽计数器自己会跳）
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '装分频链：1 MHz ÷ 1000 → 1 kHz，÷2500 → 400 Hz（两级十年计数器，预置端设定）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      { note_zh: '改绕脉冲变压器为 1:20（5 kVA 铁芯，次级 4 kV 绝缘按 6 kV 做）', performedBy: 'plant/winder' },
      { note_zh: '绕 2 µH 空心电感 φ20 × 20 mm 十匝（L = µ₀N²A/l = 1.257e−6 × 100 × 3.14e−4/0.02；限晶闸管 di/dt 到 100 A/µs）', performedBy: 'plant/winder' },
      {
        note_zh:
          '装触发盒与屏蔽、接整机校相：调液滴相位与气流的延时，看等离子体亮度峰值（唯一判据，没有示波器）',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      '石英 1 + 计数器 2 + 晶闸管 1 + 变压器 1 + 电容 1 + 铜线 1 + 钢板 1 → 触发单元 1 件；余是绕线漆皮与屏蔽盒边角',
  },

  {
    /**
     * 水冷板：铣蛇形流道 → 焊集管 → 装温度计接口 → 通水试验。
     *
     * 5.8 kW、1.2 m³/h、进出口温差 4.2 K。散热量的判据只有一条：**进出口温差**。
     * 本层没有流量计（`unblock-acid-cooler.ts` 271 行、`unblock-airsep-throttle.ts` 352 行
     * 都记过这件事），流量按"接满 20 L 桶的时间"量，精度 ±10 % ——
     * 所以 5.8 kW 这个数在实物上是 ±15 % 的。
     */
    id: 'make/euv-pulser-cold-plate',
    name: '脉冲电源水冷板制造',
    produces: [
      {
        item: 'plant/euv-pulser/cold-plate',
        qty: q(1),
        gives: [{ param: 'dissipation', kind: 'range', min: 5800, dir: 'atLeast' }],
      },
    ],
    uses: [
      // 500 × 300 × 12 铝板（4.9 kg）+ 集管与接头，按 14 kg 投
      { anyOf: [{ item: 'mat/aluminium', qty: q(14) }] },
      // 均温块与快换接头（铜-铝过渡，防电偶腐蚀）
      { anyOf: [{ item: 'mat/copper', qty: q(3) }] },
      // 回路充装 20 L
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    needs: ['plant/radiator'],
    steps: [
      { note_zh: '铣蛇形流道 8 × 8 mm、集管孔与快换接头座（0.5 × 0.3 m 板上 6 道折返）', performedBy: 'plant/milling-machine' },
      { note_zh: '焊集管与接头、水压 0.4 MPa 保压 30 min', performedBy: 'plant/sheet-shop' },
      { note_zh: '装进出口温度计与流量接口（流量按接满 20 L 桶的时间量，±10 %）', performedBy: 'lathe' },
      {
        note_zh: '通水试验：带 5.8 kW 电热负载跑 1 h，量进出口温差 4.2 K 与流量 1.2 m³/h（Q = ṁcΔT，±15 %）',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(20) },
    unbalanced_zh: '铝 14 + 铜 3 + 水 20 → 水冷板 1 件（约 17 kg）；余是铣屑，水是回路充装（不消耗）',
  },

  {
    /**
     * 机柜：剪板折弯 → 焊柜体 → 装屏蔽网与接地母排 → 装门与百叶。
     *
     * 1.5 mm 钢板 4 m² = 47 kg。前门铜网 10 目：屏蔽 10 kA/0.86 µs 的磁场，
     * 判据只能用"旁边的计数器不乱跳"（没有场强计）。
     */
    id: 'make/euv-pulser-rack',
    name: '脉冲电源机柜制造',
    produces: [{ item: 'plant/euv-pulser/rack', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(45) }] },
      // 屏蔽网与接地母排
      { anyOf: [{ item: 'mat/copper-wire', qty: q(2) }] },
      // 门缝防尘与减振棉
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '剪板、折弯、焊柜体 1.8 × 0.8 × 0.8 m（四角立柱 + 底座）', performedBy: 'plant/sheet-shop' },
      { note_zh: '装铜屏蔽网（前门 10 目）、接地母排与三层导轨', performedBy: 'plant/robot' },
      { note_zh: '装门、百叶与减振棉', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(16) },
    unbalanced_zh: '钢板 45 + 铜线 2 + 矿棉 1 → 机柜 1 件（约 48 kg）；余是边角料',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...EUV_PULSER_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/euv-pulser',
    name: '脉冲电源整机装配',
    produces: [{
      item: 'plant/euv-pulser',
      qty: q(1),
      gives: [
      { param: 'voltage', kind: 'range', min: 0, max: 2000, dir: 'atLeast' },
      { param: 'current', kind: 'range', min: 0, max: 50000, dir: 'atLeast' },
      { param: 'pulseWidth', kind: 'range', min: 500, max: 1000 },
      { param: 'repRate', kind: 'range', min: 0, max: 2000, dir: 'atLeast' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...EUV_PULSER_ROUTES, ...ASSEMBLY_ROUTES];
