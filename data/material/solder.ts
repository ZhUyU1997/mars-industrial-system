/**
 * 焊料与助焊剂 —— 把"带引脚的芯片"变成"贴到板上的芯片"。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么要这一份
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `data/material/package.ts` 有三样东西：丝焊（超声键合）、金属帽、酚醛塑封。
 * 它产出的是**引线已经伸出来**的器件 —— 引脚要穿过孔、要绕接、要焊。
 *
 * 而 BGA / QFN / LGA 这三种封装**没有引脚**：芯片底面是一排焊盘，靠**焊球**
 * 或**焊膏**直接连到板子的焊盘上。没有焊料，这三种封装根本不存在，
 * 机器人主板就只能是分立元件的绕接板（`data/machine/board.ts` 的做法）。
 *
 * 所以这一份是"板级组装"的第一块地基：**焊料、助焊剂、清洗**。
 * 炉子、丝印、贴片、返修在 `data/machine/reflow.ts`。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五个问题，先答完再写条目（每个数都带出处或算式）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * **① SAC305 的配比、熔点、坩埚**
 *
 *   Sn 96.5 / Ag 3.0 / Cu 0.5（wt%）。固相线 217.0 °C、液相线 220 °C，
 *   工业上就写 **217–220**（近共晶：Sn-Ag 的共晶点是 221 °C / 3.5 % Ag）。
 *
 *   熔炼温度 **280–300 °C**（过热度 60–80 K），浇铸 **250–260 °C**。为什么不是
 *   只要 240：**银在 221 °C 的锡液里只溶 3.5 %，但溶得极慢** —— 305 合金的
 *   3.0 % 要 280 °C 以上搅 30–60 min 才全溶（Cu 好办，250 °C 就溶 0.7 %）。
 *   工业熔炉的 300 °C 不是为流动性留的，是给银的溶解动力学留的。
 *
 *   坩埚：**铸铁（HT200）**，不用石墨，也不用钢。
 *     · 铁在 250–300 °C 的锡液里溶解度只有 **0.01–0.05 %**（400 °C 才到 0.1 %），
 *       而且表面立刻长一层 FeSn₂ 金属间化合物**挡住**继续溶解 —— 焊锡锅清一色铸铁
 *       就是这个原因：它不是"不被溶"，是"溶到一层就停"。
 *     · 石墨不溶铁，但石墨开口气孔 10–20 %（体积），锡会渗进去、冷缩热胀把坩埚
 *       涨裂；而且石墨导热太快，局部过热。
 *     · 钢比铸铁差：钢的珠光体先被锡沿晶界吃，铸铁的石墨片反而把锡挡在外面。
 *   摊销量：一只 30 kg 铸铁锅熔 6 t 焊料掉 0.5 %（30 kg / 6 t），本路线按 5 kg/1000 kg 记。
 *
 *   ⚠️ **配比按质量对得上，按纯度对不上**：`mat/tin` 是 3N（99.9 %），965 kg 就带进
 *   0.97 kg 杂质；`mat/silver` 的路线只交付 **95 %**（`make/silver`，precious.ts:99），
 *   30 kg 带进 1.5 kg 杂质 ⇒ 合计 **2.5 kg = 2 500 ppm**，而 SAC305 的杂质总上限是
 *   **0.1 %（1 000 ppm）**。超 2.5 倍。见降级①。
 *
 * **② 焊粉：-325 目（<45 µm）的球形粉是雾化出来的，本层没有雾化**
 *
 *   `plant/sublimator` 是**真空升华井**（273–550 °C 分馏金属，见 thermal.ts），
 *   不是雾化塔；`plant/atomizer` 在整个数据里不存在（grep 过）。
 *   能做雾化的三件东西一件都没有：2 MPa 的雾化罐、φ0.5 mm 的耐热喷嘴、旋风分级器。
 *
 *   于是只剩磨。磨出来是**片状**，差在五处（数都是算的，按 φ35 µm 球 vs 35×35×2 µm 片）：
 *
 *   | 量 | 球形（雾化） | 片状（磨） | 差 |
 *   |---|---|---|---|
 *   | 球形度 | 0.95 | 0.5 | 1.9× |
 *   | 比表面积 6/(ρd)，片取两面 2/(ρt) | 232 cm²/g | 1 351 cm²/g | **5.8×** |
 *   | Hall 流动（50 g） | 15 s | **不流**（>60 s） | — |
 *   | 松装密度 | 4.0 g/cm³ | 2.5 g/cm³ | 1.6× |
 *   | 含氧（5 nm 氧化膜，按比表面算） | 0.02 % | 0.10 % | 5× |
 *
 *   落到工艺上只有两个数要紧：**印刷开口下限 0.4 → 0.8 mm**（2 倍）、
 *   **金属含量 90 → 85 %**（5 个点，因为片状粉流不动，只能用更多助焊剂包住）。
 *   见降级②。
 *
 * **③ 助焊剂：三条候选，只有氯化锌通**
 *
 *   · 松香基 ❌ **本层没有松香**，这句话在数据里写了五遍：没有沥青、没有松香、
 *     没有蜂蜡（unblock-interferometer-flat.ts:212、unblock-comparator-mirror.ts:142、
 *     unblock-pyrometer-objective.ts:144/265、unblock-polymer-dryer.ts:425）。
 *     火星没有松树，也没有石油 —— 松香是松脂蒸馏的残余，两条都断了。
 *   · 有机酸 ❌ 柠檬酸：plating.ts:107 已经判死（"用柠檬酸代缓冲剂？也没有"，
 *     柠檬酸要发酵，本层没有发酵链）；硬脂酸：subnm-readout.ts:198 判死
 *     （"石蜡/硬脂酸 要长链烃，本层唯一的有机物是酚醛"）；油/脂：
 *     unblock-comparator-lapping.ts:229（"本层没有油、没有脂"）。
 *   · 氯化锌 ✅ Zn + 2HCl → ZnCl₂ + H₂。两样料都有（`mat/zinc` 9.09 t/kg，`mat/hcl`）。
 *     480 Zn + 1 726 的 31 % 盐酸 → 1 000 ZnCl₂ + 15 H₂ + 1 191 水（见 make/zinc-chloride）。
 *
 *   **代价是腐蚀。** ZnCl₂ 吸潮水解：ZnCl₂ + H₂O → Zn(OH)Cl + HCl，而 Cl⁻ 在
 *   偏压下会电迁移，把铜吃成 CuCl → Cu₂O 枝晶。所以 **J-STD-004 把无机盐类助焊剂
 *   归 IN 类，禁止用于电子件**。本层没有第二条路，代价必须写清：**必须水洗，且
 *   洗完的判据是离子污染 ≤1.56 µg/cm² NaCl 当量**（IPC-6012/J-STD-001 的通用上限；
 *   航天/高可靠那一档是 0.1 µg/cm²）。
 *
 *   ⚠️ 任务问"残留要 <0.1 µg/cm² 吗" —— 答案是：**行业判据不是 0.1，是 1.56**；
 *   0.1 是航天档。而本层**连 1.56 都测不了**：没有电导率仪（unblock-cleanroom-shell.ts:781
 *   "没有电导率仪，也没有盐分计"、unblock-siemens-base.ts:88 "电导率也测不了"）、
 *   没有离子色谱、没有氯离子试纸。判据只能退到"3 次换水 + 60–70 °C 热水 + 目视无白霜"。
 *   见降级③。
 *
 *   还有一条更细的账：**ZnCl₂ 的活性峰比 SAC305 的熔融早 40–60 K。**
 *   无水 ZnCl₂ 熔点 290 °C，而真正去氧化的是它的水合物在 **150–220 °C** 脱水/
 *   水解放出的 HCl。也就是说：助焊剂在**预热段**就把活干完了，等到 217 °C 焊料化开时，
 *   HCl 已经跑掉大半。工业的松香/有机酸活性窗是 180–250 °C，**正好盖住回流段** ——
 *   这一条是本层助焊剂与工业助焊剂最本质的差距（见降级④）。
 *
 * **④ 回流曲线：电阻炉的控温精度不够，靠带速与"熔断指示片"撞**
 *
 *   SAC305 要：预热 150–180 °C、均温 180–200 °C 60–90 s、**>217 °C 保持 60–90 s**、
 *   峰值 **235–245 °C**、冷却 ≤4 K/s。炉子（reflow.ts）四区各 400 mm，共 1.6 m：
 *
 *     带速 0.3 m/min（5.0 mm/s） → 每区 80 s，全程 320 s，液相线以上 **80 s** ✓
 *     带速 0.4 m/min（6.67 mm/s） → 每区 60 s，全程 240 s，液相线以上 **60 s** ✓（下限）
 *     带速 0.5 m/min（8.33 mm/s） → 液相线以上 **48 s** ✗（差 12 s = 20 %）
 *
 *   ⇒ **本层的带速窗是 0.3–0.4 m/min，不是 0.3–0.5**。0.5 那一端要么把回流区
 *   从 400 加到 500 mm（炉子 1.7 m），要么就承认做不了。
 *
 *   控温：铜-铁热电偶（本层只有铜与铁两种金属丝，Seebeck 13 µV/K，而 T 型是 43 µV/K）
 *   + 0.1 mV/格 的毫伏表 ⇒ **7.7 K/格**（T 型式子是 2.4 K/格）。接触器通断没有 PID，
 *   245 °C 上的过冲 10–15 K。**实际炉温在设定值 ±10–15 K 上摆，不是 ±5 K。**
 *   峰值窗口 235–245 只有 10 K 宽 < 摆动 20–30 K ⇒ **靠控温撞不进去**。三条补法：
 *
 *     ① 分区功率递减 + 带速把"温度-时间"曲线做出来（曲线是设计与验证出来的，不是控出来的）
 *     ② 用**熔断指示片**把窗口夹住：一片 SAC305（217–220）化了 ⇒ 到过液相线；
 *        一片纯锡（**232.0 °C**）化了 ⇒ 峰值 ≥232。232.0 是这个体系里
 *        **唯一有料的金属定点**（euv-metals.ts:208 的话），这里正好用上
 *     ③ 245 这个上限**测不了**（232 与 419.5（Zn）之间没有可用的纯金属定点），
 *        只能靠试片塌陷与桥连的目视判据 —— 见降级⑤
 *
 * **⑤ 贴片精度：靠治具，不靠视觉**
 *
 *   BGA 球距 0.4 / 0.5 / 0.8 mm（细间距到 0.3），贴片精度 = 球距的 1/8 ⇒ **±0.05 mm**。
 *
 *   · `plant/robot` 的 props 只有 `node` 7–500 nm 与 `dof` 20–40 —— **定位精度根本没有声明**
 *     （seed.ts 的机器条目）。它是"会动的手"。全层唯一有实测口径的重复定位是
 *     **±0.05 mm**（unblock-crucible-drive.ts:109/352/531：手轮 + 刻度盘 + 游标，
 *     "读到 0.01、到 0.05"），而新装后的绝对位置是 **±0.07 mm**。
 *   · `plant/laser-stage` 的 `positioning` 是 **50 nm**（真空里 20 nm，laser-stage.ts:34）——
 *     够，差 1 000 倍余量，但它是 4 英寸片、真空、0.6 s 一次定位的台子。
 *   · **视觉这条路是断的**：没有面阵摄像机（litho-m3.ts:2498 "摄像机不在模型里 ——
 *     像素要 CCD/CMOS"）；`plant/particle-scanner` 是**单点扫描的颗粒计数器**
 *     （minParticle 0.05 µm、spotSize 0.05–5 mm、scanPoints ≥1e3），它数尘埃，不定位；
 *     `plant/edge-aligner` 的 22 nm 是**光栅相位**对准，给的是相对相位不是绝对坐标，
 *     且要真空/洁净间。拿它贴片就是 edge-aligner.ts:1276 自己那句话：
 *     "为什么用一台 100 倍贵的机器去做 22 nm 的活"。
 *
 *   ⇒ 本层的贴片机 = **机械治具（销钉定位 + 挡块）+ 丝杠台（1 mm/格、刻度盘 100 格
 *     读完到 0.01、重复定位 0.05）**。结论：
 *       0.8 mm 球距（要 ±0.1） ✓ 余量 2 倍
 *       0.5 mm 球距（要 ±0.0625） △ 刚好
 *       0.4 mm 球距（要 ±0.05） ✗ 绝对位置 ±0.07 差 1.4 倍，只能靠治具把绝对误差消掉、
 *         剩下重复定位 ±0.05 踩线 —— 判定为"边界，不保证"
 *   见降级⑥。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 降级与升级（R8：每处降级都要写恢复原规格要什么、差多少量级）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① 焊料纯度 2 500 ppm（上限 1 000）
 *      升级：锡走二次电解到 5N、银走电解精炼到 4N（`make/silver` 现在只到 95 %）。
 *      缺口 **2.5 倍**。不升级的后果：固相线从 217 漂到 210–225、焊点晶界上析 Pb/Bi 发脆。
 *
 *   ② 焊粉是片状（无雾化）
 *      升级：氩气雾化 —— 要 2 MPa 的雾化罐 + φ0.5 mm 喷嘴 + 旋风分级器 + 250–300 °C
 *      坩埚，气体现成（`mat/argon` 有路线）。缺口：球形度 1.9×、比表面 5.8×、印刷开口 2×。
 *
 *   ③ 助焊剂是无机盐，且残留测不了
 *      升级：① 松香（要松树，火星没有 —— 这一条**不可降级**地断了）；
 *            ② 水白助焊剂（有机酸 + 醇，要油脂/发酵链 —— 也断了）；
 *            ③ 残留的**测量**：电导率仪（两级电导池 + 交流桥 + 毫伏表）或氯离子比色。
 *      缺口：判据 1.56 µg/cm² 现在**判不了**（不是"差几倍"，是"没有尺"）。
 *
 *   ④ 助焊剂活性窗比熔融早 40–60 K
 *      升级：换成活性窗 180–250 °C 的体系（同上，松香/有机酸都不存在）。
 *      缺口：**40–60 K**。不升级的后果：润湿角从 20–30° 涨到 40–50°，虚焊靠目视挑不出来。
 *
 *   ⑤ 峰值上限（245 °C）测不了
 *      本层没有测氧，也没有测高温的手段（最热的"温度计"是测温锥与火色）。
 *      升级：K 型热电偶 + 记录仪（要镍铬/镍硅，`mat/resistance-wire` 有镍铬但本文件
 *      不在投料白名单里），或氧化锆氧电池。缺口：±10–15 K 的峰值**不可知**，
 *      而窗口只有 10 K 宽。
 *
 *   ⑥ 贴片精度 ±0.05 踩线、0.4 mm 球距不保证
 *      升级：面阵摄像机（像素要 CCD/CMOS ⇒ L4 半导体，本层到 L2）+ 图像质心算法；
 *      或把 `plant/laser-stage` 当工作台（50 nm，余量 1 000 倍，但那是另一台设备的价钱）。
 *      缺口：0.8 mm → 0.4 mm 球距（2 倍），或 ±0.07 → ±0.05 绝对位置（1.4 倍）。
 *
 *   ⑦ 制粉设备本身也是断的
 *      `plant/grinder` 是**磨床**（磨平面），不是球磨机；`plant/ore-beneficiary` 的球磨是
 *      湿式矿浆，交叉污染 100 %。所以磨出来的 60 % 是片、40 % 是糊轮的团块（回炉）。
 *      升级同上（雾化），或补一台干式球磨（要硬质合金球 —— `std/stamping-die-general`
 *      那一档的硬质合金本层能烧，但没有球磨机条目）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 无氧 —— 这一条贯穿全文件
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 焊料对氧的敏感是**熔化状态下**的敏感：280 °C 的锡液面上，SnO₂ 浮渣按表面积长，
 * 每小时 0.5–2 %；渣里裹着的锡就是损失。本层：
 *
 *   · 熔炼用**石墨粉覆盖**（`mat/carbon`）—— 碳在 280 °C 只能物理隔氧，还原不了 SnO₂
 *     （C + SnO₂ 要 600 °C 以上）。所以渣率按 **2–3 %** 记，而氩气保护熔炼是 <0.5 %。
 *   · 炉内氧含量**不知道**：没有氧分析仪。氮气吹扫是按"经验流量"吹的，不是按 ppm 控的。
 *   · 后果照实写进每一条路线的 `gives`：`oxygen` 30–90 ppm（工业无铅焊料锭是 ≤20 ppm）。
 *
 *   升级：氧化锆氧电池（700 °C + 参考气）或氩气保护（`mat/argon` 有路线）。
 *   缺口：渣率 2–3 % → 0.5 %（4–6 倍），氧含量 90 → 20 ppm（4.5 倍）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 已知缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * · **PCB（覆铜板）不在这一份里。** BGA 要焊到板子上，而本层还没有**主板用的覆铜板**：
 *   board.ts 说"覆铜板要热压机，本层没有压机" —— 那句现在**半过期**了
 *   （`plant/press` 有了、`mat/glass-cloth` 有了、`mat/phenolic-resin` 有了），
 *   但建覆铜板链是另一件事，本文件不做。本文件只保证"有东西能把芯片焊到板子上"。
 *
 *   ⚠️ 别把两条"板"混起来：**BGA 的封装基板**（8–12 层积层基板）是芯片自己的底，
 *   与主板 PCB 不是一回事。前者在 `data/machine/pcb-package.ts` 那一支上，
 *   它要吃本文件的 `mat/solder-ball` / `mat/solder-paste` / `mat/flux-zinc-chloride`
 *   —— 两个文件是并行的两个分支，接起来才是"芯片能贴到板子上"。
 * · 焊膏的**流变性**（黏度、触变性、塌落）模型里没有位置：模型没有"黏度"这个
 *   被谁维持的条件，也没有测它的仪器。所以"片状粉流动性差"只能落在
 *   `metalLoad 85 %` 与"开口下限 0.8 mm"这两个数上。
 * · 焊点的**可靠性**（热循环、IMC 厚度、Kirkendall 空洞）写不进来：那是寿命，
 *   `Component.wear` 按运行小时计，而焊点没有"运行小时"。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const SOLDER_ITEMS: readonly Item[] = [
  /**
   * SAC305 无铅焊料锭。Sn 96.5 / Ag 3.0 / Cu 0.5，217–220 °C。
   *
   * 它是 BGA 的工业标准，理由不是"无铅环保"，而是**它不塌**：Sn-Pb 共晶（183 °C）
   * 在回流时是**液相流动**的，表面张力把焊球拉成饼；SAC305 在 217–220 之间有个
   * 半固态的糊状区（固相 217、液相 220，只差 3 K），焊球在回流时靠**表面张力自己
   * 找正**（self-alignment），塌陷量只有 10–20 %。这是 BGA 能做成 0.4 mm 球距的
   * 全部理由 —— 换共晶 Sn-Pb 就做不到。
   *
   * `oxygen` 这一项是本层最诚实的一处：工业无铅焊料锭 ≤20 ppm，本层 30–90 ppm
   *   （无氧分析仪）。
   */
  { id: 'mat/solder-sac305', name: 'SAC305 无铅焊料锭', unit: 'kg', category: 'material',
    props: [
      { param: 'meltingPoint', kind: 'range', min: 200, max: 240, unit: '°C' },
      { param: 'oxygen', kind: 'range', min: 0, max: 300, unit: 'ppm', dir: 'atMost' },
    ] },

  /**
   * 焊锡丝。φ0.2–1.2 mm，按需换模。三个用处：手工/机器人烙铁焊、切段做焊球、
   * 绕成预成型环。
   *
   * **本层的焊锡丝是实心的，没有松香芯。** 工业的"松香芯焊丝"里那根芯就是助焊剂
   * —— 而本层没有松香（见文件头③）。所以焊接时助焊剂要**单独涂**（`mat/flux-zinc-chloride`
   * 刷在接头上），这是本层与工业焊锡丝最直观的一处差别。
   *
   * 拉拔是**干拉**：本层没有油脂、没有皂液（unblock-comparator-lapping.ts:229），
   * 所以导线表面有撕裂痕、模具寿命掉一个量级 —— 见降级②的同一句话。
   */
  { id: 'mat/solder-wire', name: '焊锡丝', unit: 'kg', category: 'material',
    props: [{ param: 'diameter', kind: 'range', min: 0.15, max: 1.5, unit: 'mm' }] },

  /**
   * 预成型焊片（solder preform）。0.05–0.2 mm 的箔冲成小片，用助焊剂粘在焊盘上，
   * 回流时熔成一块。
   *
   * 它是**焊膏的替代品**，而且在本层比焊膏更可靠：焊膏要焊粉（片状，见降级②），
   * 预成型片只要"轧 + 冲"两件现成的设备。工业上它本来就用在两处：大功率器件的
   * 厚焊层，以及**BGA 返修的补球**。
   */
  { id: 'mat/solder-preform', name: '预成型焊片', unit: 'kg', category: 'material',
    props: [{ param: 'thickness', kind: 'range', min: 0.03, max: 0.30, unit: 'mm' }] },

  /**
   * 焊球。φ0.20–0.60 mm 的球，BGA 的"脚"。
   *
   * 怎么来：**焊锡丝切段 + 回熔**。段长切得与线径相等时，圆柱体积
   * V = (π/4)d²·d 熔成球后 (π/6)D³ = V ⇒ **D = 1.145 d**（算出来的，不是拍的）：
   *
   *   φ0.30 丝 → 球 φ0.343（0.5 mm 球距用）
   *   φ0.40 丝 → 球 φ0.458（0.8 mm 球距用）
   *
   * 表面张力自己成球，球形度 88–95 %（雾化的球是 99 %）。这段路**不需要雾化塔**，
   * 只需要一台能到 250 °C 的炉子 —— 这是本层能给出 BGA 的真正原因。
   */
  { id: 'mat/solder-ball', name: '焊球', unit: 'kg', category: 'material',
    props: [
      { param: 'diameter', kind: 'range', min: 0.1, max: 0.8, unit: 'mm' },
      { param: 'sphericity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
    ] },

  /**
   * 焊粉。-325 目（筛孔 45 µm），工业 Type 3 是 25–45 µm。
   *
   * 本层只有片状粉（磨出来的，见降级②）：球形度 40–65 %、比表面是球的 5.8 倍、
   * Hall 流动不流。所以 `sphericity` 这一项在这里不是"品质指标"，是**这一层做不到**
   * 的那个数。
   */
  { id: 'mat/solder-powder', name: '焊粉', unit: 'kg', category: 'material',
    props: [
      { param: 'particleSize', kind: 'range', min: 5, max: 200, unit: 'µm', dir: 'atMost' },
      { param: 'sphericity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
    ] },

  /**
   * 焊膏。焊粉 + 助焊剂。工业配比是金属 88–90 wt%（助焊剂 10–12 wt%），
   * 本层只能到 **85 wt%** —— 片状粉流不动，金属再多就搅不进去（降级②）。
   *
   * 少 5 个点的直接后果：同样开口印出来的**焊料体积少 5 %**，而 BGA 的球高
   * 公差是 ±10 % ⇒ 把 5 % 的配比误差叠上去，余量只剩一半。
   */
  { id: 'mat/solder-paste', name: '焊膏', unit: 'kg', category: 'material',
    props: [
      { param: 'metalLoad', kind: 'range', min: 60, max: 95, unit: '%' },
      { param: 'particleSize', kind: 'range', min: 5, max: 200, unit: 'µm', dir: 'atMost' },
    ] },

  /**
   * 氯化锌。白色潮解晶体，Zn + 2HCl 直接来。
   *
   * 它在这是**助焊剂的主剂**，在别处是焊锡锅的助熔剂、干电池的电解质。
   * 潮解这件事在火星上格外糟：舱内湿度低，但一遇到焊膏里的水它就吸到饱和，
   * 所以只能**配成溶液直接用**（`mat/flux-zinc-chloride`），不存干粉。
   */
  { id: 'mat/zinc-chloride', name: '氯化锌', unit: 'kg', category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 80, max: 99.9, unit: '%', dir: 'atLeast' }] },

  /**
   * 氯化锌助焊剂。ZnCl₂ 28–32 wt% 的水溶液。
   *
   * 为什么是水不是醇：醇有（`mat/ethanol`，reagents.ts:69），但**松香才需要醇**
   * （松香不溶于水），而松香不存在。ZnCl₂ 的溶解度是 432 g/100 mL（25 °C）、
   * 615 g/100 mL（100 °C）—— **水基正好对路**，而且它水溶这件事本身就是清洗的依据。
   *
   * ⚠️ 本层没有加 NH₄Cl（工业 ZnCl₂ 助焊剂是 ZnCl₂ + NH₄Cl 的低共熔混合物，
   * 熔点从 290 降到 180）：氯化铵要有氨与盐酸，本文件的投料白名单里没有。
   * 所以本层的助焊剂熔融温度是 **290 °C**，而回流峰值只有 235–245 ——
   * 助焊剂从来没有熔成液体，它是在**固态下靠水解出的 HCl 干活**（见降级④）。
   */
  { id: 'mat/flux-zinc-chloride', name: '氯化锌助焊剂', unit: 'kg', category: 'material',
    props: [{ param: 'concentration', kind: 'range', min: 5, max: 45, unit: '%' }] },

  /**
   * 印刷钢网。0.12 mm 厚、开口按焊盘做，四周绷在铝框上。
   *
   * 工业是激光切割的不锈钢（304/316L，毛刺 <5 µm）。本层两条都不占：
   *   · **没有激光切割**（`plant/laser-stage` 的"激光"是干涉仪的氦氖管，不是切东西的）
   *   · **没有不锈钢条目**（`mat/stainless-steel` 存在，但不在本文件的投料白名单里）
   * 所以是**冲压低碳钢**：毛刺 20–30 µm（板厚的 20–25 %）、冲裁面有 1–2° 锥度。
   * 后果很具体：刮刀被毛刺顶起 ⇒ 印刷厚度不均 **±20 %**（激光网是 ±5 %），
   * 而 BGA 的焊球高度公差是 ±10 %。见降级②的同一处"开口下限 0.8 mm"。
   *
   * 寿命：低碳钢 HV 120 vs 304 的 HV 200 ⇒ 约 **500 次印刷就要换网**（不锈钢 5 000 次），
   * 差 10 倍。而且它会锈，只能干存。
   */
  { id: 'std/solder-stencil-general', name: '印刷钢网', unit: '套', category: 'part',
    props: [
      { param: 'thickness', kind: 'range', min: 0.05, max: 0.30, unit: 'mm' },
      { param: 'aperture', kind: 'range', min: 0.1, max: 5, unit: 'mm', dir: 'atLeast' },
    ] },
];

export const SOLDER_ROUTES: readonly Route[] = [
  {
    /**
     * SAC305 合金锭：熔锡 → 加银铜 → 浇铸。
     *
     *   锡 965 + 银 30 + 铜 5 = 1 000 kg（wt% 正好 96.5/3.0/0.5）
     *
     * 温度分两段：**熔炼 280–300**（银的溶解动力学，见文件头①）、**浇铸 250–260**
     * （过热度 30–40 K，太低会先在流槽里结壳，太高氧化渣翻倍）。
     *
     * 三步的执行者拆开：熔锡是炉子的活（要 280 °C），加料搅拌是机器人的活
     * （要 30–60 min 不停搅，炉子不干这个），浇铸又是机器人的活。
     *
     * ⚠️ 覆盖剂是石墨粉（`mat/carbon` 2 kg）：碳在 280 °C 只挡氧、不还原
     * （C + SnO₂ 要 600 °C 以上），所以渣里照样裹锡 —— 这是本层没有氧分析仪的
     * 直接后果，渣率按 2–3 % 记。
     */
    id: 'make/solder-sac305',
    name: 'SAC305 合金锭制备',
    produces: [{
      item: 'mat/solder-sac305',
      qty: q(1000),
      gives: [
        { param: 'meltingPoint', kind: 'range', min: 217, max: 220 },
        { param: 'oxygen', kind: 'range', min: 30, max: 90 },
      ],
    },
    { item: 'mat/tailings', qty: q(7) }],
    uses: [
      // 3N 锡 965 kg 带进 0.97 kg 杂质；银只有 95 %（make/silver），30 kg 带进 1.5 kg
      // ⇒ 合计 2 500 ppm，超 SAC305 的 1 000 ppm 上限 2.5 倍（降级①）。
      { anyOf: [{ item: 'mat/tin', qty: q(965), need: [{ param: 'purity', kind: 'range', min: 99.9, dir: 'atLeast' }], onRelax: 'functional-kept' }] },
      { anyOf: [{ item: 'mat/silver', qty: q(30) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(5) }] },
      // 铸铁坩埚摊销：一只 30 kg 锅熔 6 t 焊料掉 0.5 %（铁在 250–300 °C 的锡里
      // 只溶 0.01–0.05 %，FeSn₂ 层挡住继续溶解）。
      { anyOf: [{ item: 'mat/iron-ht200', qty: q(5) }] },
      // 石墨覆盖剂：物理隔氧，不还原。
      { anyOf: [{ item: 'mat/carbon', qty: q(2) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '① 铸铁坩埚熔锡（232 °C 化，升到 285–300）+ 石墨粉覆盖隔氧', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 285, max: 300 }] },
      { note_zh: '② 加银 3.0 % 与铜 0.5 %，285 °C 搅 30–60 min 至全溶 —— 银在 221 °C 只溶 3.5 %，溶解是这里唯一限速的一步', performedBy: 'plant/robot' },
      { note_zh: '③ 降温到 250–260 浇成 5 kg 锭（铸铁模预热 150），扒渣', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '入 965 锡 + 30 银 + 5 铜 + 5 铸铁锅 + 2 石墨 = 1 007 → 出 1 000 kg + 锅/石墨渣 7 kg（已单列 mat/tailings）；' +
      '渣里裹的锡另按 2–3 % 记，不在这一行里（测不了氧，只能按表面积估）',
  },
  {
    /**
     * 焊锡丝：φ8 挤压杆 → 粗拉 → 中间退火 → 细拉到 φ0.2–1.2 → 绕卷。
     *
     * 与 `make/bonding-wire`（φ25 µm 铝丝）同一条路，但松弛得多：焊锡丝只到
     * φ0.2 mm（是铝丝的 8 倍粗），退火 2 次而不是 3 次。
     *
     * **干拉**这一条要写清楚：本层没有油脂、没有皂液（unblock-comparator-lapping.ts:229），
     * 所以拉拔是干的 —— 导线表面有撕裂痕（拉毛），模具（`std/wire-die-general`，
     * 不在本文件白名单里，所以不列进 needs）寿命掉一个量级。
     * 工业用皂液/矿物油，两者本层都没有。
     */
    id: 'make/solder-wire',
    name: '焊锡丝制备',
    produces: [
      { item: 'mat/solder-wire', qty: q(980), gives: [{ param: 'diameter', kind: 'range', min: 0.2, max: 1.2 }] },
      {
        item: 'mat/solder-sac305',
        qty: q(20),
        gives: [
          { param: 'meltingPoint', kind: 'range', min: 217, max: 220 },
          { param: 'oxygen', kind: 'range', min: 0, max: 300 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/solder-sac305', qty: q(1000) }] }],
    needs: [],
    steps: [
      // 铸杆而不是挤压：`plant/forge` 不 hold 温度（它只有锤与砧），而 240–270 的
      // 保温要炉子。连续铸 φ8 杆是 1930 年代就有的做法，挤压是后来为了细化晶粒。
      { note_zh: '① 铸 φ8 杆（铸铁模，浇温 250–270）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 250, max: 270 }] },
      { note_zh: '② 粗拉 φ8 → φ2（六道模，干拉，无润滑）', performedBy: 'plant/rolling-mill' },
      { note_zh: '③ 中间退火 120–150 °C ×2（焊锡再结晶温度低，退火比铝丝低 150 K）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 120, max: 150 }] },
      { note_zh: '④ 细拉到 φ0.2–1.2（按需换模）+ 绕卷', performedBy: 'plant/rolling-mill' },
    ],
    unbalanced_zh: '锭 1 000 → 丝 980 kg + 头尾/氧化皮 20 kg（回炉）',
  },
  {
    /**
     * 预成型焊片：轧到 0.10 mm → 冲成小片。
     *
     * 这是本层**不需要焊粉**的那条路：`plant/rolling-mill` 与 `plant/press` 都是现成的，
     * 冲模用 `std/stamping-die-general`（0.3 mm 间隙那一档，冲 0.1 mm 箔绰绰有余）。
     *
     * 冲出来的片用助焊剂粘在焊盘上（助焊剂是粘的，这正好是它的第二个用处），
     * 回流时熔成一块。BGA 返修补球用的也是它 —— 一片 φ0.45 的片，回熔后是 φ0.46 的球。
     */
    id: 'make/solder-preform',
    name: '预成型焊片制备',
    produces: [
      { item: 'mat/solder-preform', qty: q(950), gives: [{ param: 'thickness', kind: 'range', min: 0.10, max: 0.12 }] },
      {
        item: 'mat/solder-sac305',
        qty: q(50),
        gives: [
          { param: 'meltingPoint', kind: 'range', min: 217, max: 220 },
          { param: 'oxygen', kind: 'range', min: 0, max: 300 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/solder-sac305', qty: q(1000) }] }],
    needs: ['std/stamping-die-general', 'plant/metrology-room'],
    steps: [
      { note_zh: '① 轧到 0.10 mm（四道，每道压缩 30 %，中间不退火 —— 焊料软）', performedBy: 'plant/rolling-mill' },
      { note_zh: '② 冲 φ0.3–2.0 圆片或方片（步距送料 ±0.02）', performedBy: 'plant/press' },
      { note_zh: '③ 检厚（0.10 ±0.01）与去毛刺', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '锭 1 000 → 片 950 kg + 轧制头尾/冲边 50 kg（回炉）',
  },
  {
    /**
     * 焊球：焊锡丝切段 → 撒助焊剂 → 回熔成球 → 筛分。
     *
     *   段长 = 线径时，V = (π/4)d²·d = (π/6)D³ ⇒ **D = 1.145 d**
     *   φ0.40 丝切 0.40 段 → 球 φ0.458（0.8 mm 球距）
     *   φ0.30 丝切 0.30 段 → 球 φ0.343（0.5 mm 球距）
     *
     * 回熔只要 240–260 °C，**用电阻炉就够**（单温区，不需要曲线）——
     * 四温区的回流炉在 `reflow.ts`，那是给"板子上有几十种不同热容的元件"用的。
     *
     * 表面张力是这一步唯一的成形力：球在助焊剂里自己圆，球形度 88–95 %
     * （雾化的球 99 %）。差的 4–11 个点是**球上有卫星**（小球粘在大球上），
     * 靠筛分与滚圆筛不掉，只能目视挑。
     */
    id: 'make/solder-ball',
    name: '焊球制备',
    produces: [{
      item: 'mat/solder-ball',
      qty: q(960),
      gives: [
        { param: 'diameter', kind: 'range', min: 0.34, max: 0.46 },
        { param: 'sphericity', kind: 'range', min: 88, max: 95 },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'mat/solder-wire', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/flux-zinc-chloride', qty: q(20) }] },
    ],
    needs: ['std/stamping-die-general'],
    steps: [
      { note_zh: '① 切段（段长 = 线径，±0.005；冲切而不是剪，剪会把线压扁）', performedBy: 'plant/press' },
      { note_zh: '② 与助焊剂一起滚在瓷盘里（每球裹一层，回熔时它防氧化也防粘连）', performedBy: 'plant/robot' },
      { note_zh: '③ 回熔成球 240–260 °C（表面张力成形，30–60 s）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 240, max: 260 }] },
      { note_zh: '④ 筛分（±0.02 分级）+ 目视挑卫星球', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '丝 1 000 + 助焊剂 20 → 球 960 kg；60 kg 是切段头尾（回炉）、助焊剂（挥发与洗掉）、' +
      '以及球径超差与卫星球（回炉）',
  },
  {
    /**
     * 焊粉：铸 1 mm 细条 → 磨 → 磁选 → 筛 -325 目。
     *
     * **这是本文件最难看的一条路线，因为它本来不该存在**（见降级②⑦）：
     *   · 工业用**气体雾化**：熔体经 φ0.5 mm 喷嘴被 2–4 MPa 的氩/氮剪切碎成球。
     *     本层没有雾化塔、没有 2 MPa 的罐、没有喷嘴。
     *   · 退到磨：焊料软（HV 15–20，比铝还软），砂轮一碰就**糊轮**（磨屑焊在磨粒上），
     *     要不停用金刚石笔修整 —— 而本层没有金刚石笔，用碳化硅砂条替，修一次停 10 min。
     *   · 磨出来的是**片**（2–5 µm 厚、20–60 µm 宽），比表面是球的 5.8 倍。
     * 于是产率只有 62 %，38 % 是粗粒（>45 µm）与团块，全部回炉。
     *
     * 磁选那一步不是可选的：磨屑里混着砂轮屑（SiC）与床身磨下来的铁，
     * 铁在焊膏里就是**每颗焊球里的一颗硬点** —— 用 `plant/magnetic-separator`
     * 的 0.1 T 滚筒过两遍（铁 <50 ppm）。
     */
    id: 'make/solder-powder',
    name: '焊粉制备',
    produces: [{
      item: 'mat/solder-powder',
      qty: q(620),
      gives: [
        { param: 'particleSize', kind: 'range', min: 15, max: 45 },
        { param: 'sphericity', kind: 'range', min: 40, max: 65 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'mat/solder-sac305', qty: q(1000) }] }],
    needs: [],
    steps: [
      { note_zh: '① 铸 1 mm 细条（铸铁模，260–280）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 260, max: 280 }] },
      { note_zh: '② 磨（碗形砂轮，低速 + 水冷；每 10 min 修一次砂轮 —— 糊轮是这条路的常态）', performedBy: 'plant/grinder' },
      { note_zh: '③ 磁选除铁与砂轮屑（0.1 T 滚筒过两遍）', performedBy: 'plant/magnetic-separator' },
      { note_zh: '④ 筛 -325 目（45 µm），粗粒回炉', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '条 1 000 → 粉 620 kg；380 kg 是 >45 µm 的粗粒与糊轮的团块（回炉），' +
      '另有 0.1 % 的氧（片状粉比表面 1 351 cm²/g，是球的 5.8 倍，5 nm 氧化膜就是 0.10 %）',
  },
  {
    /**
     * 焊膏：焊粉 850 + 助焊剂 150 = 1 000 kg（金属含量 **85 wt%**）。
     *
     * 工业是 88–90 wt%，本层只能到 85：片状粉的松装密度 2.5 g/cm³（球 4.0），
     * 金属再多就搅不进去，膏体变成"干面团"，印刷时拉不开。
     *
     * **必须在加压腔里配**：助焊剂是水溶液，而火星 0.6 kPa 下水在 0.01 °C 就沸。
     * 敞口搅 10 min，膏体就干成饼 —— 所以执行者是 `plant/wet-bench`（100–500 kPa），
     * 不是机器人。这一条与"0.6 kPa 的车间里所有湿法工序都要加压"是同一条
     * （wet-bench、electrolyzer、plating-bath 都一样）。
     *
     * 搅拌是**慢的**（30–60 min，桨式，转速 <100 rpm）：快了会把片状粉打碎、
     * 把空气卷进去。空气在焊膏里就是**印刷时的空洞**，那是 BGA 第一大缺陷。
     */
    id: 'make/solder-paste',
    name: '焊膏制备',
    produces: [{
      item: 'mat/solder-paste',
      qty: q(1000),
      gives: [
        { param: 'metalLoad', kind: 'range', min: 84, max: 86 },
        { param: 'particleSize', kind: 'range', min: 15, max: 45 },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'mat/solder-powder', qty: q(850) }] },
      { anyOf: [{ item: 'mat/flux-zinc-chloride', qty: q(150) }] },
    ],
    needs: [],
    performedBy: 'plant/wet-bench',
    under: [
      { param: 'temperature', min: 20, max: 40 },
      // 水溶液在 0.6 kPa 下 0.01 °C 就沸 —— 敞口配膏就是"把水抽干"。
      { param: 'pressure', min: 100, max: 500 },
    ],
  },
  {
    /**
     * 氯化锌：Zn + 2HCl → ZnCl₂ + H₂。
     *
     *   480 Zn + 1 726 的 31 % 盐酸 → 1 000 ZnCl₂ + 15 H₂ + 1 191 水
     *
     * 配平：HCl 1 726 × 0.31 = 535；Zn 65.38 + 2HCl 72.92 = ZnCl₂ 136.28 + H₂ 2.02
     * ⇒ 1 000 kg ZnCl₂ 要 Zn 479.8、HCl 535.1（取 480 / 535，误差 0.04 %）。
     * 水 1 726 − 535 = 1 191 是盐酸带进来的，浓缩时蒸掉。
     *
     * 反应放热很凶（ΔH = −340 kJ/mol Zn），所以是**慢加锌**：一次丢进去会沸。
     * 氢气要排到室外 —— 本层没有氢气报警器，也没有氧分析仪（#23），
     * 判据只能是"通风 + 不在密闭处攒"。**这是本文件第二处"失败得不出声"的地方。**
     *
     * 产物是**溶液**（含 1 191 kg 水），不结晶成干粉：ZnCl₂ 潮解，烘干要 200 °C
     * 且会水解出 HCl，得不偿失。所以下一步配助焊剂时直接用水溶液计量。
     */
    id: 'make/zinc-chloride',
    name: '氯化锌制备',
    produces: [{ item: 'mat/zinc-chloride', qty: q(1000), gives: [{ param: 'purity', kind: 'range', min: 96, max: 99 }] }],
    uses: [
      { anyOf: [{ item: 'mat/zinc', qty: q(480) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(1726), need: [{ param: 'concentration', kind: 'range', min: 30, max: 33 }], onRelax: 'functional-kept' }] },
    ],
    needs: [],
    performedBy: 'plant/wet-bench',
    under: [
      // 反应自己会把液温顶到 80–90，不用加热；但不能超过 100（水会沸）
      { param: 'temperature', min: 40, max: 90 },
      { param: 'pressure', min: 100, max: 500 },
    ],
    unbalanced_zh: 'Zn 480 + 31 % 盐酸 1 726 = 2 206 → ZnCl₂ 1 000 kg；余 1 206 = 水 1 191（盐酸带进来、' +
      '浓缩时蒸掉）+ 氢 15（排空）。HCl 535/1 726 = 31.0 %，与 make/hcl 的 30–33 % 一致；' +
      '⚠️ 与 make/hcl 那条把 qty 记成纯 HCl 的口径不同，本条按**溶液质量**记 —— 因为水要一进一出对得上',
  },
  {
    /**
     * 氯化锌助焊剂：ZnCl₂ 300 + 水 700 → 1 000 kg 的 30 % 溶液。
     *
     * 计量是**重量法**：本层没有密度计、没有黏度计（`plant/refractometer` 是折光仪，
     * 测不了这么浓的盐液），所以"30 %"是称出来的，不是量出来的。
     *
     * 不用加 HCl 调 pH：工业助焊剂加一点盐酸抑制水解（ZnCl₂ + H₂O ⇌ Zn(OH)Cl + HCl），
     * 而本层加不了 —— 加了就是往焊膏里多灌氯离子，洗完更麻烦。代价是溶液会缓慢浑浊
     * （水解产物），放置超过一周就要重配。
     *
     * ⚠️ 这一条同时是**清洗的依据**：ZnCl₂ 的溶解度 432 g/100 mL（25 °C）、
     * 615 g/100 mL（100 °C）—— 它水溶，所以热水能洗掉。松香不溶于水，
     * 那才需要醇洗；本层没有松香，这条限制反而不咬人（见文件头③）。
     */
    id: 'make/flux-zinc-chloride',
    name: '氯化锌助焊剂制备',
    produces: [{ item: 'mat/flux-zinc-chloride', qty: q(1000), gives: [{ param: 'concentration', kind: 'range', min: 28, max: 32 }] }],
    uses: [
      { anyOf: [{ item: 'mat/zinc-chloride', qty: q(300) }] },
      { anyOf: [{ item: 'mat/water', qty: q(700) }] },
    ],
    needs: [],
    performedBy: 'plant/wet-bench',
    under: [
      { param: 'temperature', min: 20, max: 60 },
      { param: 'pressure', min: 100, max: 500 },
    ],
  },
  {
    /**
     * 印刷钢网：轧到 0.12 mm → 冲开口 → 去毛刺 → 绷框。
     *
     * 0.12 mm 这个厚度不是随便定的：**面积比**（开口面积 / 孔壁面积）要 ≥0.66 才能
     * 脱模干净。0.4 mm 球距的开口是 0.24 mm 方、0.12 mm 厚 ⇒
     * (0.24×0.24)/(2×0.24×0.12) = 1.0，余量 1.5 倍。再厚就印不进。
     *
     * 冲压这一条与 `make/lead-frame` 把铜带轧到 0.15 mm 同一条路（rolling-mill + 纵剪），
     * 冲模用 `std/stamping-die-general`（0.3 mm 间隙那一档）。**冲不出来的是毛刺**：
     * 冲裁面有 20–30 µm 的毛刺与 1–2° 锥度，激光切割是 <5 µm 且锥度可控。
     *
     * 绷框是手工：四边用铝框夹住，张力 30–40 N/cm（用弹簧秤拉，本层没有张力计），
     * 张力不匀，网就会在刮刀下"鼓"，一鼓就是一块板的厚度不均。
     */
    id: 'make/solder-stencil',
    name: '印刷钢网制造',
    produces: [{
      item: 'std/solder-stencil-general',
      qty: q(1),
      gives: [
        { param: 'thickness', kind: 'range', min: 0.10, max: 0.12 },
        // 冲压毛刺限制开口下限：0.24 mm 开口配 25 µm 毛刺 = 板厚的 21 %，
        // 刮刀会被顶起 ⇒ 只保证 ≥0.4 mm 的开口（0.8 mm 球距）。
        { param: 'aperture', kind: 'range', min: 0.4, max: 3 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] }],
    needs: ['std/stamping-die-general', 'plant/metrology-room'],
    steps: [
      { note_zh: '① 轧到 0.12 mm 并纵剪（与 lead-frame 把铜带轧到 0.15 mm 同一条路）', performedBy: 'plant/rolling-mill' },
      { note_zh: '② 冲开口（0.4–3 mm；冲裁间隙 6–10 µm，毛刺 20–30 µm）', performedBy: 'plant/press' },
      { note_zh: '③ 去毛刺（油石只推一个方向，推两下就把开口推大）', performedBy: 'plant/robot' },
      { note_zh: '④ 绷框 30–40 N/cm 并用工具显微镜检开口（±0.02）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...SOLDER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...SOLDER_ROUTES];
