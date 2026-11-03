/**
 * 片式电阻 + 铁氧体（片式电感 / 磁珠）—— 机器人主板上三件用得最多的贴片件里缺的那两件。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么这一层要它们
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 一块控制板上贴片件的用量次序是**电容 > 电阻 > 电感/磁珠**。本层之前的状况：
 *
 *   电容     `data/machine/capacitor.ts`（箔式膜电容）+ `data/material/passive.ts`
 *            的电阻丝 —— 至少有一件能造的
 *   电阻     **一个都没有**。`passive.ts` 只到"镍铬丝"，连插件电阻都没有独立条目
 *   电感     **一个都没有**
 *   铁氧体   **没有**（`magnet.ts` 里有 `grade: 'ferrite'` 的永磁铁，但那是硬磁，
 *            与软磁铁氧体是两种材料，不能互相顶）
 *
 * 所以这一份补的不是"又一个材料"，是**三种元件的两种**。判据沿用 `passive.ts`
 * 开头那一节：这三种都不需要单晶硅，门槛在材料与烧结，不在光刻。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五问五答（先看这一节，下面的数据都是它的展开）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * **问一：没有钌，电阻走哪条路？**
 *
 * 四条路（前两条断在元素上），各自的方阻（Ω/□）与温度系数（TCR，ppm/K）：
 *
 *   ① RuO₂ 厚膜                10 – 10 kΩ/□   TCR ±100
 *   ② 铋钌烧绿石 Bi₂Ru₂O₇      100 – 100 kΩ/□ TCR ±100
 *   ③ SnO₂（掺锑 ATO）厚膜      100 – 10 kΩ/□  TCR ±200
 *   ④ 碳膜（碳 + 酚醛）         100 – 1 MΩ/□   TCR −500 … −1500
 *
 * ①②断在**元素**上，不是断在工艺上：`mat/ruthenium` 与 `mat/bismuth` 全表 0 条
 * （当时贵金属链 `precious.ts` 只到银/金/硒；现在 `pgm.ts` 建了 Pt/Pd，但 Ru 仍 0 条）。铋也一样 —— 它
 * 是铅/铜冶炼的副产，本层没有铅链。所以"用钌"这句话在本层等于"用一件不存在的东西"。
 *
 * **选 ③ SnO₂。** 理由是元素齐：锡有真链（`make/tin`，99.9–99.99 %，`euv-metals.ts`），
 * 氧是电解水的副产（每公斤氢带 7.9 kg 氧）。代价写在下面这一条里。
 *
 * ⚠️ **掺锑是本文件最大的一处降级。** 工业 SnO₂ 电阻浆靠 0.5–2 % Sb₂O₃ 把 TCR
 * 压到 ±200，而 `mat/antimony` 当时全表 0 条；现在它是一次性输入（`cs-sb.ts`，
 * 无本地路线、不可复制），不拿不可复制的料做电阻浆的掺杂剂。不掺锑的
 * SnO₂ 厚膜，TCR 掉到 **−800 … +300**，方阻抬到 **1 kΩ – 50 kΩ/□**。
 * 也就是说：本层做得出"电阻"，做不出"温度稳定的电阻"。
 *
 * ④ 留着当第二条路（OR，不是降级链）：它是唯一能到 **1 MΩ** 的配方，而 SnO₂ 到不了
 * 100 kΩ 以上（方阻天花板）。**0402 的 1 MΩ 只有碳膜做得出；0603 的 1 kΩ 两种都做得
 * 出，但 TCR 一个 −1500、一个 −800** —— 同一张板上同名同值的两只电阻，可能不是一种东西。
 *
 * **问二：氧化铝基板能不能到 96 %、0.5 mm、Ra<0.5 µm？**
 *
 * 1600 °C 有：`plant/high-temp-furnace` hold **1100–1600**，正好卡在上限
 * （`data/material/ceramic.ts` 的刚玉瓷走的就是 1500–1600，同一条路）。
 * 助烧剂也有：SiO₂/CaO（`mat/silica`、`mat/lime`）与 MgO（`mat/magnesia`，抑制
 * 晶粒长大）都在表里。
 *
 * **瓶颈在料，不在炉子。** `mat/refractory` 的 `grade` 声明了四档
 * （clay / high-alumina / silica / corundum）；现在三条路线交付：
 * `make/refractory` 给 high-alumina（尾矿 Al₂O₃ 9 % 富集 5 : 1 到 **45 %**，
 * 见 chain.ts:520），`make/silica-brick` 给 silica，`make/corundum-refractory`
 * 给 corundum（`mat/alumina` 95–99 % + 0.5 % MgO，1500–1600）。
 *
 * 96 % 的基板现在走 corundum：`make/alumina-substrate` 吃 `mat/refractory`
 * 的 corundum 档，交付 al2o3 96 %（本层交 96 %，不再是 82–92 %）。
 *
 * **问三：激光调阻用哪台？调到 ±1 % 到底卡在哪？**
 *
 * **用 `plant/arf-laser`（193 nm）。** 参数：10.4 mJ/脉冲、400 Hz、4.2 W、带宽 ≤2 pm
 * （`litho-m3.ts:607`）。193 nm 是光化学断裂，"冷"烧蚀 —— 热影响区 <1 µm，
 * 不会把切口边上的玻璃相烧成导体，这对厚膜电阻是硬要求。配 `plant/laser-stage`
 * 定位（50 nm / 200 mm 行程）。
 *
 * **`plant/euv-pulser` 不行，而且不是"差一档"，是"不是这个东西"。** 它的组成是
 * 24 kV / 12 nF / 100 ns 的电容组 + 闸流管 + 充电机 + 触发（`euv-pulser.ts:425`）——
 * 输出是**电脉冲**，它驱动的是 EUV 源的放电，自己**没有光束**。拿它调阻等于拿电源切电阻。
 *
 * 真正卡住的不是手，是**判据**。本层量电阻只有一条路：齐纳基准（`std/zener-reference-general`
 * 6.2 V）+ 检流计（`std/galvanometer-general`，0.01–100 µA/格，满度 100 格）。
 *
 *   直读伏安法   I = 6.2 V / R。检流计一个量程内可读满度的 1 % ⇒ **绝对阻值只到 ±1 %**
 *   桥式指零     检流计当指零仪，1 mA 桥流下 0.1 % 失衡 = 0.25 µA = 25 格 ⇒ **比值可到 ±0.05 %**
 *
 * 所以"把方阻调到 ±1 %"这句话在本层是**循环论证**：用 ±1 % 的判据去证明 ±1 % 的精度。
 * 而且就算判据到了，TCR 也不允许 —— ±1 % 的阻值配 −800 ppm/K 的 TCR，
 * 在 −40 … +85 °C 上是 **−6 … +5 %**。**决定档位的是 TCR，不是调阻精度。**
 *
 * 于是本文件把精度押在**比值**上而不是绝对值上：这正是 `make/resistor-network`
 * 值得单列的全部理由（同片同批的 4 只，比值 0.2 %，绝对值只按 ±5 % 出手）。
 *
 * 时间账：切一刀 50–200 µm 槽、切口 10 µm ⇒ 10–40 个脉冲 ⇒ **<0.1 s**；
 * 但每切一刀要再测一次，桥式指零 2–5 s ⇒ 一只 30 s ⇒ 一台班 8 h 出 **960 只**，
 * 而 850 °C 一炉出 5500 只 ⇒ **调阻是瓶颈，差 5.7 倍**。（模型没有时间维，这两个数
 * 只写在这里，进不了 `rate` —— 那是"一批占设备多久"，不是"一年多少"。）
 *
 * **问四：镍链已通，铁氧体还差什么？**
 *
 * NiZn 的计量是按 Ni₀.₅Zn₀.₅Fe₂O₄ 算的：1000 kg 粉要**镍 123 kg**、锌 138 kg、
 * 铁 470 kg、氧 269 kg（见 `make/ferrite-powder-nizn` 的账，加法正好 1000）。
 * 镍料已通（`make/nickel`，ores.ts:216；`make/flotation-reagent`，reagents.ts:265）
 * —— 仍卡在**镍粉 0.2–0.5 µm 球状、无氧化层**与焙烧 850–900 °C 通氧的均匀性。
 *
 * 工艺侧的退路有两条：
 *
 *   ZnFe₂O₄（锌铁氧体）     µi **40 – 120**，截止频率 10 – 200 MHz，烧 1200
 *   Zn₀.₇Cu₀.₃Fe₂O₄（锌铜） µi **100 – 300**，烧 900（Cu 促进低温烧结）
 *
 * 代价是 µi 掉 **5–12 倍**（NiZn 的 200–1500 → 40–120）：同样阻抗的磁珠体积要
 * ×5–12，所以 **0402 磁珠在本层做不出来**，最小 0603。
 *
 * 而锌铜那一条不是"退而求其次"，是**叠层共烧的必要条件**：Ag 内电极 961 °C 熔，
 * 共烧必须 ≤900，纯 Zn 铁氧体 1200 那一档烧不了叠层 —— 加了 Cu 才降下来。
 * 所以三条粉路线不是三个档次，是**三个用处**：
 *
 *   make/ferrite-powder-nizn   µi 最好，**镍料已通**；仍卡在镍粉工艺（0.2–0.5 µm 球状/无氧化层）
 *   make/ferrite-powder-zn     干压磁芯（绕线片感用，无内电极，可以 1200 烧）
 *   make/ferrite-powder-zncu   叠层磁珠（有 Ag 内电极，必须 ≤900）
 *
 * 低频那一头（MnZn，µi 1000–5000，100 kHz–1 MHz）**做不了**：`mat/manganese`
 * 全表 0 条，锰是炼钢的脱氧剂，本层连钢都只走"铁 + 碳"。
 *
 * **问五：绕线片感的线，拉得出 / 绕得上吗？**
 *
 * 分开答，因为两个答案是相反的。
 *
 * **拉得出。** `std/wire-die-general` 的模孔是分级碳化硅磨的（最细 ~5 µm 磨料），
 * `package.ts` 用它拉到 **φ25 µm**（键合丝那一档，代价是表面有划痕）。
 * 从 φ1.0 mm 到 φ0.1 mm 是**19 道**、到 φ25 µm 是**28 道**（断面积比 1111，
 * 每道减面 22 %，ln 1111 / ln(1/0.78) = 28.2）。铜丝到 φ30 µm 可行。
 *
 * **绕不上。** `plant/winder`（`forming.ts:262`）是手摇 + 飞轮 + 挂轮排线 +
 * 摩擦盘张力 + 机械计数器，它**没有"线径下限"这个字段**，所以只能从别处用它绕过的
 * 最小线径反推 —— 全表最细是 **φ0.1 mm（100 µm）**：`litho-m2.ts` 的定子 3300 匝
 * φ0.1、`e-beam-column.ts` 的偏转线圈 φ0.1、`hv-semiconductor.ts` 的变压器副边 φ0.1。
 *
 * 而 0402/0603 的绕线片感要 **φ20–50 µm 绕 5–20 匝在 0.4 mm 的芯上** —— 差 **2–5 倍**。
 * 差的不只是手：φ100 µm 铜丝的破断力只有 1.7 N，张力要稳在 0.3–0.5 N（20–30 % 破断力），
 * 而摩擦盘 + 弹簧的手感档位是给 φ0.5–1.0（破断力 43–173 N）设计的，
 * 对应的张力在 10–50 N —— **差两个数量级，不是同一只弹簧。**
 *
 * 结论：**0402/0603 走叠层**（不需要绕线，这正是叠层的价值），
 * **绕线只做 1008/1210**（φ100 µm 绕 5–20 匝，L = 0.5–22 µH）。
 * 升级路线是把摩擦盘换成磁粉离合器 + 显微镜下目视排线（R8⑥）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 两条链的形状
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   A 片式电阻（厚膜）
 *     尾矿 →氧化铝基板 0.5 mm →┐
 *     玻璃 →玻璃粉 ─┐          ├→ 丝印 → 850 烧成 → 激光调阻 → 端头 → 镀 Ni/Sn → 片阻
 *     锡 + 氧 →SnO₂ ─┼→ 电阻浆 ─┘
 *     碳 + 酚醛 ────┘
 *     银 →银浆 ───────────────→ 端头 / 内电极
 *
 *   B 铁氧体
 *     铁 + 锌 + 氧 (+ 镍 / 铜) →氧化焙烧 →一次球磨 →预烧 850 →二次球磨→ 铁氧体粉
 *        粉 + 酚醛 →流延 →生片 ─丝印银内电极 →叠层 →等静压 →脱脂 →900 共烧 →磁珠
 *        粉 →干压 →1200 烧 →磨 →磁芯 ─φ100 铜线绕 →焊接 →端头 →镀 →绕线片感
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 降级与升级（R8：每处降级都配一条恢复原规格的路，十处）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① 没有钌/铋，且锑是一次性输入 ⇒ SnO₂ 未掺锑：TCR −800…+300（工业 ±200）、方阻 1 k–50 kΩ/□
 *      升级：锑 0.5–2 % Sb₂O₃（要一条**可复制**的锑链，铅/铜冶炼副产；现在只有
 *            一次性输入，不可复制）⇒ 回到 ±200；
 *            或钌（贵金属链现在有 Pt/Pd，但 Ru 仍 0 条）
 *   ② 基板原 82–92 %、现在 96 %：走 `make/corundum-refractory` → `make/alumina-substrate`
 *      原升级 = `mat/alumina`（95–99 %）+ MgO 0.5 %；路线已写，未实测
 *   ③ 没有测氧：电阻 850 烧成的**氧化气氛**与铁氧体的**氧分压**
 *      都只能靠"炉口进气 + 观火孔看火色 + 抽气时间"保证，没有读数
 *      升级：氧化锆电池要 700 °C + 参考气、原电池要铅、顺磁要精密流量 —— 都没有
 *   ④ 没有四探针、没有精密电桥、没有阻抗分析仪：
 *      `tcr`、`permeability`、`impedance` 三个 props 是**工艺保证，不是实测**
 *      （与 `zinc.ts` 缺口①、`film-monitor.ts` 降级⑥同一个性质）
 *      升级：四探针（4 根钨针 + 恒流源 + `std/millivoltmeter-general`——它不在本轮白名单里）；
 *            阻抗要 1 MHz 的射频桥，本层没有
 *   ⑤ 调阻精度被判据限制在 ±1 %（直读）/ ±0.05 %（比值）：见问三
 *      升级：先有标准电阻（锰铜/康铜箔，`meter.ts` 会熔康铜但不做标准电阻）
 *   ⑥ 绕线只做 1008/1210（winder 最小 100 µm）：见问五
 *      升级：磁粉离合器张力 + 显微镜目视排线（φ50 µm 是下一档，不是 20 µm）
 *   ⑦ 镍链**已通** ⇒ 不再需要 Zn / Zn-Cu 铁氧体那一档：µi 从 40–120 回到 200–1500（5–12 倍）
 *      升级**已闭合**：`make/ferrite-powder-nizn`（chip-passives.ts:1087）+ `make/nickel`（ores.ts:216）+ `make/flotation-reagent`（reagents.ts:265）
 *   ⑧ MnZn 低频档：电解锰已建（`resistance-alloys.ts`），但 MnZn 铁氧体粉的
 *      共沉淀/煅烧路线仍未建；磁珠的 100 kHz 以下那一档缺
 *      升级：电解锰已建（`resistance-alloys.ts` 的 `make/manganese-electrolytic`，99.9 %）；硅锰仍无
 *   ⑨ 酚醛当流延粘结剂：脱脂窗口窄、残碳 0.1–0.5 %，碳会把 Fe³⁺ 还原成 Fe²⁺
 *      升级：PVB / PVA（要聚乙烯醇链，本层只有酚醛与聚苯乙烯）
 *   ⑩ 端头镀 Ni/Sn 靠 `plant/plating-bath`（20–60 °C、15–20 kPa）：
 *      镀液成分靠投料对账，镀层厚度只有"镀多久"一个判据（没有 XRF）
 *      升级：库仑法测厚（要恒流源 + 计时）—— 本层只有"称重法"，精度差一个量级
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 已知缺口（都是"现在没有"，不是"那时没有"）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **钌、铋、锰仍 0 条；锑是一次性输入、钯只有海绵料。** 所以：
 *      片阻没有 10 Ω 以下与 100 kΩ 以上的"好 TCR"档；MLCC 的 Ag/Pd 内电极
 *      仍只能纯银（Pd 粉与 Ag-Pd 共烧路线未建），烧银温度因此要压在 850 以下更多。
 *   ② **没有测氧**：见降级③。铁氧体的氧分压决定 Fe²⁺/Fe³⁺，
 *      而 Fe²⁺ 的比例决定 µi 与损耗 —— 这是"看不见的那个变量"。
 *   ③ **没有膜厚测量**：丝印湿膜 20 µm、烧后 12–15 µm 全靠"网目 + 刮刀压力 + 浆的黏度"
 *      这三个工艺量守，没有台阶仪（`film-monitor.ts` 有一台，但它测的是光学膜）。
 *      而方阻 = 电阻率 / 膜厚 —— 膜厚差 10 %，方阻就差 10 %，**调阻调不回来**（调的是长宽）。
 *   ④ **没有阻抗分析仪**：磁珠的 `impedance`（Ω@100 MHz）与电感的 Q 值在本层**测不了**。
 *      能测的只有直流电阻（伏安法）与尺寸（量块 + 比较仪）。
 *   ⑤ **`plant/atmosphere-furnace` 不能烧这两样。** 它 hold 的是
 *      `oxygen_ppm 0–50`（无氧那一侧），而厚膜烧成与 NiZn/Zn 铁氧体烧结都要**空气**。
 *      它在本文件里一次都没被执行 —— 那是对的，硬用它是错的。
 *      它的正当用途是 MnZn 的低氧烧结，而 MnZn 缺锰。
 *   ⑥ **切割（划片）没有专门的设备。** 片阻/磁珠的分离靠 `plant/robot` + 划刀 +
 *      滚压折断，边崩 20–50 µm（工业金刚石划片 <10 µm）。代价是切割道必须放到
 *      0.2 mm（工业 0.1）：0402 的单元格从 1.1×0.6 = 0.66 mm² 变成 1.2×0.75 =
 *      0.90 mm²，同一片 60×60 基板从 **5400 只掉到 4000 只 —— 少排 26 %**。
 *
 * 单位口径：材料按 kg、元件按件。所以"7.4 kg 耐火料出 1000 片基板"
 * 这种跨量纲的账进 `unbalanced_zh`，不进质量守恒。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CHIPPASSIVE_ITEMS: readonly Item[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 一、A 链的四种料：玻璃粉、电阻浆、银浆、基板
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * 玻璃粉（frit），d50 1–5 µm。厚膜浆料的**玻璃相**。
   *
   * 它在电阻浆里干三件事，三件都不是"粘结"这么简单：
   *
   *   ① 烧结：850 °C 时玻璃软化流布，把 SnO₂ 颗粒焊在一起 —— 导电靠颗粒接触，
   *      不靠玻璃，但**没有玻璃就没有机械强度**，一擦就掉
   *   ② 调阻：玻璃把导电颗粒"稀释"，方阻随玻璃比例变 —— 同一批 SnO₂，
   *      玻璃从 45 % 加到 65 %，方阻可以差 10 倍。这就是"一个配方一个方阻档"
   *      的物理原因（工业上叫"阻值系列"，一个系列一个玻璃比）
   *   ③ 定 TCR：玻璃的热膨胀与 SnO₂ 差得远，玻璃相把颗粒箍住，**TCR 的正负
   *      由玻璃/导电相的比例决定** —— 这也是为什么"改方阻"必然"改 TCR"，
   *      两个参数不能独立调
   *
   * 为什么单独一个条目而不是直接用 `mat/glass`：`mat/glass` 是熔好的块/片，
   * 而厚膜要的是 **d50 1–5 µm 的粉**（网目 200–325，颗粒比网孔小一个量级
   * 才过得去）。从块到粉是一道球磨 + 水选分级，与本文件的其它粉料共用设备。
   *
   * 铁氧体那边也能用它（0.5–2 % 当烧结助剂），但本文件的三条铁氧体配方都**不加**：
   * 加了就破坏"铁 + 锌 (+ 镍/铜) + 氧 四个数加起来正好 1000"那笔账，而 900 °C
   * 那一档的助烧作用已经被 CuO 的液相顶掉了（见 `make/ferrite-powder-zncu`）。
   * 所以它是**两条链共用的料、只在一条链上真用** —— 写在这里，别让读的人以为
   * 铁氧体那三条漏了它。
   */
  {
    id: 'mat/glass-frit',
    name: 'Glass Frit', name_zh: '玻璃粉',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'd50', kind: 'range', min: 0.3, max: 8, unit: 'µm', dir: 'atMost' }],
  },

  /**
   * 厚膜电阻浆。**一个条目、两个配方窗口** —— 这就是"降级在模型里的样子"：
   * 不是把 1 MΩ 说成 10 kΩ，是多一条路线、多一个窗口，由 `propCovers` 挑。
   *
   *   锡系  make/resistor-paste-tin     1 k – 50 kΩ/□   TCR −800 … +300
   *   碳系  make/resistor-paste-carbon  100 – 1 MΩ/□    TCR −1500 … −500
   *
   * 两个窗口**不重叠在 1 k–50 kΩ 之外**：100 Ω–1 kΩ 与 100 kΩ–1 MΩ 只有碳系，
   * 所以"0402 的 1 MΩ"与"0603 的 1 kΩ"用的不是同一种浆 —— 读数据的人要能看见这件事。
   *
   * `tcr` 这个 props 是本文件最要紧的一行：它是**唯一决定"这只能用在哪儿"**的参数。
   * 主板上的分压/偏置网络可以容忍 ±10 % 的绝对值，但容忍不了 ±1500 ppm/K；
   * 而限流、上拉、RC 时间常数反过来。所以档位不是按方阻分的，是按 TCR 分的。
   */
  {
    id: 'mat/resistor-paste',
    name: 'Thick-Film Resistor Paste', name_zh: '厚膜电阻浆',
    unit: 'kg',
    category: 'material',
    props: [
      // 方阻：一个配方的"一平方多少欧"。厚膜的标准刻度是每档 ×√10（10/31.6/100/…）。
      { param: 'sheetResistance', kind: 'range', min: 50, max: 1000000, unit: 'Ω/□' },
      { param: 'tcr', kind: 'range', min: -1500, max: 300, unit: 'ppm/K' },
    ],
  },

  /**
   * 银浆。片阻/磁珠/片感的**端头**与叠层的**内电极**，同一种东西。
   *
   * 本层只能是**纯银**：工业的 Ag/Pd（钯抑制银的迁移与球化）要钯，而
   * `mat/palladium` 当时全表 0 条；现在 `pgm.ts` 有海绵 Pd，但 Pd 粉与
   * Ag-Pd 共烧路线仍未建（`xenon-loop.ts:193` 当时已为 MLCC 记过这一条）。
   * 纯银在 850 °C 会开始球化（agglomeration）、在直流偏压下会电迁移 ——
   * 这两件事在片阻端头上都还能忍（端头是两个独立电极，不构成迁移回路），
   * 在**高阻值窄线条**上不能忍。所以本文件的银浆只用在端头与内电极，
   * 不用在"细线电阻"上。这是**不能降级**的那一类（换完还会不会做原来那件事：
   * 换掉钯之后它还能当电极，但不能当"窄线电极"）。
   *
   * 玻璃粉在银浆里是**熔接相**：它把银颗粒与陶瓷基板焊在一起（银本身不润湿氧化铝），
   * 所以银浆要 5–10 % 玻璃 —— 这也是它和 `mat/silver`（纯银）不能互相顶的原因。
   */
  {
    id: 'mat/silver-paste',
    name: 'Silver Paste', name_zh: '银浆',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'silverContent', kind: 'range', min: 60, max: 90, unit: '%', dir: 'atLeast' }],
  },

  /**
   * 氧化铝基板，0.5 mm。片阻、排阻、片感的**共同载体**，也是"烧成时不变形"的唯一保证。
   *
   * 三个参数都是硬要求，各有各的下游：
   *
   *   al2o3     96 % 是工业标准（本层现在交 96 %，corundum 路线；原 82–92 % 已收口）
   *   thickness 0.5 mm：0402 折断槽要 0.5 才有足够横向刚度；薄了折断时崩边
   *   roughness Ra<0.5 µm：厚膜浆的丝印厚度由"浆/基板"的润湿决定，
   *              Ra 大了浆会往凹处流，膜厚不匀 10 % 以上（缺口③）
   *
   * 96 % 与 82 % 的差别不在"能不能用"，在**烧成收缩的一致性**：96 % 的基板
   * 在 850 °C 几乎不动（收缩 <0.05 %），82 % 的里面玻璃相多，850 °C 会再收
   * 0.2–0.4 % —— 一片 60 mm 的基板上就是 0.12–0.24 mm 的位移，
   * **丝印的套准公差（±50 µm）被它吃掉一半**。这是原基板降级的真实代价，
   * 不是"强度差一点"；现在换 corundum 料后，这一条按 96 % 交付。
   */
  {
    id: 'std/alumina-substrate-general',
    name: 'Alumina Substrate', name_zh: '氧化铝基板',
    unit: '件',
    category: 'part',
    props: [
      { param: 'al2o3', kind: 'range', min: 80, max: 99.9, unit: '%', dir: 'atLeast' },
      { param: 'thickness', kind: 'range', min: 0.2, max: 1.6, unit: 'mm' },
      { param: 'roughness', kind: 'range', min: 0.05, max: 1.6, unit: 'µm', dir: 'atMost' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 二、A 链的两个成品：片式电阻、排阻
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * 片式厚膜电阻，0402 与 0603 两档。
   *
   * 一个条目两档，靠 `caseSize` 分开（规格写在属性里，
   * 不写进 id —— 否则 `std/chip-resistor-0402` 与 `caseSize` 就是两处真相）。
   *
   * 五个参数都是主板上真正会被查的：
   *
   *   resistance  Ω        1 Ω – 10 MΩ（本层实际 50 Ω – 1 MΩ）
   *   tolerance   %        工业 ±0.1 %（精密）到 ±20 %（通用）；本层 1–20
   *   tcr         ppm/K    **本层 1 000 倍于工业**，见文件头
   *   caseSize             0402 = 1.0×0.5 mm、0603 = 1.6×0.8 mm
   *   power       W        0402 = 1/16 W = 0.0625、0603 = 1/10 W = 0.1
   *
   * ⚠️ 功率这个参数在本层**只能靠设计保证**（散热面积 × 允许温升），
   * 没有一样手段能验证它 —— 过载试验要恒流源 + 红外测温，两样都没有。
   */
  {
    id: 'std/chip-resistor-general',
    name: 'Thick-Film Chip Resistor', name_zh: '片式厚膜电阻',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resistance', kind: 'range', min: 1, max: 10000000, unit: 'Ω' },
      { param: 'tolerance', kind: 'range', min: 0.1, max: 20, unit: '%' },
      { param: 'tcr', kind: 'range', min: -1500, max: 300, unit: 'ppm/K' },
      { param: 'caseSize', kind: 'enum', values: ['0402', '0603'] },
      { param: 'power', kind: 'range', min: 0.03, max: 0.25, unit: 'W' },
    ],
  },

  /**
   * 排阻（4 只一组的网络），0603 外形。
   *
   * **它值得单列，理由不是"省地方"，是"比值"。**
   *
   * 4 只电阻印在同一片基板上、同一批浆、同一炉烧成、同一刀调阻 —— 它们的
   * 绝对阻值可能都偏 5 %，但彼此的**比值**只差 0.2 %。这个性质在三个地方
   * 直接决定电路能不能成立：
   *
   *   运放的差分对偏置     比值错 1 % ⇒ 共模抑制差 46 dB（= 1/0.01）
   *   R-2R 网络的每一位     比值错 ⇒ 单调性破坏，DAC 出现"回折"
   *   分压比基准           绝对值没人看，只有比值进公式
   *
   * 而本层的判据链恰好**能证明比值、不能证明绝对值**（问三）：桥式指零 ±0.05 %
   * 是比出来的，直读 ±1 % 是量出来的。所以排阻不是"片阻的变种"，
   * 是**本层唯一能把精度兑现的那件东西**。这是它在文件里的位置。
   */
  {
    id: 'std/resistor-network-general',
    name: 'Resistor Network', name_zh: '排阻',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resistance', kind: 'range', min: 1, max: 1000000, unit: 'Ω' },
      { param: 'tolerance', kind: 'range', min: 0.1, max: 20, unit: '%' },
      { param: 'tcr', kind: 'range', min: -1500, max: 300, unit: 'ppm/K' },
      { param: 'caseSize', kind: 'enum', values: ['0603', '1206'] },
      { param: 'power', kind: 'range', min: 0.03, max: 0.25, unit: 'W' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 三、B 链的三种料：铁氧体粉、生片、细铜线
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * 软磁铁氧体粉。**三个配方一个条目**，靠 `grade` 分（enum 而不是三个 id，
   * 因为它们的下游是同一台球磨、同一台预烧炉、同一条流延线）。
   *
   *   nizn   Ni₀.₅Zn₀.₅Fe₂O₄   µi 200–1500  1–100 MHz  烧 1150–1250  ← 断在镍上
   *   zn     ZnFe₂O₄           µi 40–120    10–200 MHz 烧 1200      ← 干压磁芯
   *   zncu   Zn₀.₇Cu₀.₃Fe₂O₄   µi 100–300   5–50 MHz   烧 900       ← 叠层共烧
   *
   * ⚠️ **`permeability` 这一行是工艺保证，不是实测**（降级④）：µi 要在环形样上
   * 绕 20 匝、用 1 kHz 电桥量电感反推，本层没有电桥。给出的窗口来自配方与烧结
   * 温度的设计值，误差按 ±30 % 记 —— 所以窗口写得宽，写窄了就是编。
   *
   * 为什么是"粉"而不是"料块"：铁氧体的全部性能在**粉**这一层就定了 ——
   * 粒径（1–2 µm，固相反应的扩散距离）、纯度、Fe²⁺/Fe³⁺ 比。之后的成型
   * （干压 or 流延）只决定形状与密度，改不了 µi 的量级。这与陶瓷链
   * （`ceramic.ts`）把"刚玉粉"和"瓷件"分开是同一个理由。
   */
  {
    id: 'mat/ferrite-powder',
    name: 'Soft Ferrite Powder', name_zh: '软磁铁氧体粉',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'grade', kind: 'enum', values: ['nizn', 'zn', 'zncu'] },
      { param: 'permeability', kind: 'range', min: 20, max: 5000, unit: '1' },
      { param: 'd50', kind: 'range', min: 0.5, max: 5, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * 流延生片（green tape）：铁氧体粉 + 酚醛 + 水，刮刀刮成 20–40 µm 的薄片。
   *
   * 为什么必须是薄片而不是"压成块再切"：叠层磁珠的内电极是**印在片上**的，
   * 每层 20–30 µm 厚、10–26 层 —— 电极图形的最小线宽（60–100 µm）与层厚
   * 是同一个量级，只有流延能做到"每层都平、都能印"。
   *
   * `ferriteLoad`（粉的固含量，80–90 %）是这张片最要紧的一个数：固含量低了，
   * 干燥收缩大（湿 100 µm → 干 30 µm 是 3.3 倍），层与层之间的收缩不一致
   * 就会**翘曲**，而翘曲在叠层共烧里等于内电极错位。
   *
   * 溶剂是**水**不是有机溶剂：本层没有乙醇/萜品醇那类载体（`mat/ethanol` 只有
   * `reagents.ts` 的一条路线，不在本轮白名单里），而甲阶酚醛是水溶性的 ——
   * 这是"配方迁就料"的一处，代价是干燥慢（水潜热 2260 kJ/kg，是有机溶剂的 5 倍）。
   */
  {
    id: 'mat/ferrite-tape',
    name: 'Tape Casting Green Sheet', name_zh: '流延生片',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'thickness', kind: 'range', min: 10, max: 60, unit: 'µm' },
      { param: 'ferriteLoad', kind: 'range', min: 70, max: 92, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * 细铜线，φ25–120 µm。绕线片感的绕组。
   *
   * 与 `mat/copper-wire`（φ1.0 mm，`unblock-wire.ts:128`）的关系不是"另一种规格"，
   * 是**再拉 19–28 道**：断面积从 0.785 mm² 到 0.0007 mm²，中间每一次减面 22 %
   * 之后都要退火，否则冷作硬化到下一道就断。所以它是一条独立路线
   * （`make/fine-copper-wire`），不是 `make/copper-wire-drawn` 的一个参数。
   *
   * 下限 φ25 µm 不是选出来的，是 `std/wire-die-general` 的模孔能磨到的极限
   * （分级碳化硅最细 ~5 µm）。而**键合丝也在这一档**（`package.ts` 用它拉金丝到
   * φ25 µm）—— 也就是说铜丝与金丝共用同一批模具的下限，这是本层的一个巧合，
   * 不是设计。
   */
  {
    id: 'mat/fine-copper-wire',
    name: 'Fine Copper Wire', name_zh: '细铜线',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'diameter', kind: 'range', min: 15, max: 200, unit: 'µm' }],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 四、B 链的三个成品：磁芯、磁珠、绕线片感
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * 铁氧体磁芯（绕线片感的骨架），干压成型、1200 烧。
   *
   * 只有一个参数 `permeability`，因为其余尺寸由绕线机的卡盘决定、不自由。
   * 而 µi 在这里决定了"20 匝能绕出多少 µH" —— 这是绕线片感与叠层片感
   * 唯一的本质差别：**绕线靠匝数与 µ，叠层靠层数与内电极图形**。
   *
   * 为什么是干压而不是流延：磁芯是**立体**的（0.4–1.0 mm 见方、1.6 mm 高），
   * 流延只能做片子。而干压要模具 —— 模具是工具，按 `unblock-wire.ts:175` 的
   * 办法处理（工具只出现在注释里，不进 uses 也不进 needs）：45 钢淬火，
   * 与 `stamping-die.ts` 同一套手艺。
   */
  {
    id: 'std/ferrite-core-general',
    name: 'Ferrite Core', name_zh: '铁氧体磁芯',
    unit: '件',
    category: 'part',
    props: [{ param: 'permeability', kind: 'range', min: 20, max: 5000, unit: '1' }],
  },

  /**
   * 叠层片式磁珠。**0402 与 0603 里只能做 0603**（µi 掉 5–12 倍，见问四）。
   *
   * 磁珠与电感的分别，用参数说清：
   *
   *   磁珠   `impedance` 高、`resistance`（DC）低 —— 它要的是"高频阻塞、直流放行"
   *   电感   `inductance` 大、Q 高 —— 它要的是"储能、不损耗"
   *
   * 本层两项都测不了（降级④）。所以这两个条目在本层的状态是：
   * **能造，不能验**。这与 `zinc.ts` 的"品位靠投料对账"是同一类诚实 ——
   * 不写"暂未实现"，写清"卡在哪个判据上"。
   */
  {
    id: 'std/chip-bead-general',
    name: 'Multilayer Chip Bead', name_zh: '叠层片式磁珠',
    unit: '件',
    category: 'part',
    props: [
      // Ω@100 MHz
      { param: 'impedance', kind: 'range', min: 5, max: 2000, unit: 'Ω' },
      { param: 'caseSize', kind: 'enum', values: ['0402', '0603'] },
      // 直流电阻。磁珠的 DCR 是"能过多大电流"的另一面，越低越好。
      { param: 'resistance', kind: 'range', min: 0.005, max: 2, unit: 'Ω' },
    ],
  },

  /**
   * 绕线片式电感。**只做 1008/1210 两档**（winder 最小线径 100 µm，见问五）。
   *
   * 电感量的算法（`euv-pulser.ts:807` 那条空心电感用的是同一个式子，只是那里 µr = 1）：
   *
   *   L = µ₀ · µr · N² · A / l
   *
   *   1210（3.2×2.5×2.2）：芯 1.0×0.8 mm、A = 0.8 mm²、绕 20 匝、
   *                       µr = 120、l = 20 × 0.11 = 2.2 mm
   *     L = 1.257e−6 × 120 × 400 × 0.8e−6 / 2.2e−3 = 2.2e−5 H = **22 µH**
   *   1008（2.5×2.0×1.6）：芯 0.6×0.5 mm、A = 0.3 mm²、绕 5 匝、
   *                       µr = 40、l = 5 × 0.11 = 0.55 mm
   *     L = 1.257e−6 × 40 × 25 × 0.3e−6 / 0.55e−3 = 6.9e−7 H = **0.69 µH**
   *
   * 所以窗口 0.5–22 µH 是这两个端点算出来的，不是估的。
   */
  {
    id: 'std/chip-inductor-general',
    name: 'Wire-Wound Chip Inductor', name_zh: '绕线片式电感',
    unit: '件',
    category: 'part',
    props: [
      { param: 'inductance', kind: 'range', min: 0.1, max: 1000, unit: 'µH' },
      { param: 'tolerance', kind: 'range', min: 1, max: 20, unit: '%' },
      { param: 'caseSize', kind: 'enum', values: ['1008', '1210'] },
      // 直流电阻：铜线长度 × 线径决定的，绕 20 匝 φ0.1 的 1210 是 1–3 Ω 量级。
      { param: 'resistance', kind: 'range', min: 0.05, max: 5, unit: 'Ω' },
    ],
  },
];

export const CHIPPASSIVE_ROUTES: readonly Route[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 一、A 链的料：玻璃粉 → 电阻浆 → 银浆 → 基板
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * 玻璃粉：碎玻璃 → 球磨 → 水选分级 → 烘干。
     *
     *   玻璃 1050 → 玻璃粉 1000 + 尾粉 50
     *
     * 1050 → 1000 不是"收率"，是**分级**：球磨出来是 0.2–20 µm 的全谱，
     * 要的是 d50 1–5 µm 那一段。粗的（>8 µm）回磨、细的（<0.3 µm）不要 ——
     * 细过头会让浆的比表面太大、载体不够润湿，丝印时"干得快、堵网"。
     * 所以那 50 kg 是**分级切掉的两头**，走 `mat/tailings`（与选矿尾砂同一个条目 ——
     * 它确实就是"磨细了的岩石"，回砖窑能当助熔料）。
     *
     * 为什么在 `plant/ore-beneficiary` 上做：那套线本来就是"破碎 + 球磨 + 分级"，
     * 玻璃与矿石在这三道工序上没有区别。差别在**污染**：磨矿石的球磨机磨玻璃，
     * 铁磨球的磨损会把 Fe₂O₃ 带进玻璃粉（0.05–0.1 %），而铁在厚膜电阻里是
     * **掺杂**，0.1 % 就能让 TCR 往负走 100 ppm/K。所以同一台球磨机要换
     * 陶瓷衬里与刚玉球 —— 这是"借设备"的真实代价，写在这里而不是藏起来。
     */
    id: 'make/glass-frit',
    name: 'Glass Frit Production', name_zh: '玻璃粉制备',
    produces: [
      { item: 'mat/glass-frit', qty: q(1000), gives: [{ param: 'd50', kind: 'range', min: 1, max: 5 }] },
      { item: 'mat/tailings', qty: q(50) },
    ],
    uses: [{ anyOf: [{ item: 'mat/glass', qty: q(1050) }] }],
    needs: [],
    steps: [
      {
        note_zh: '粗碎与球磨 6 h（刚玉球、陶瓷衬里 —— 铁磨球会带进 0.1 % Fe₂O₃，那是掺杂不是杂质）',
        performedBy: 'plant/ore-beneficiary',
      },
      {
        note_zh: '水选分级：沉降 4 h 取上层（Stokes 沉降，d50 由时间定，不用离心 —— 与拉丝模同一处降级）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '烘干 150–250：粉要干到 <0.5 % 水分，否则配浆时载体比例算不准',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 150, max: 250 }],
      },
    ],
    rate: { hours: q(12) },
  },

  {
    /**
     * 锡系电阻浆：Sn + O₂ → SnO₂，再与玻璃粉、载体轧成浆。
     *
     *   锡 236 + 氧 64 + 玻璃粉 550 + 酚醛 150 → 电阻浆 1000
     *
     * 四个数都是算的：
     *
     *   SnO₂ 300 kg 是浆的**导电相**（30 wt%）：
     *     Sn + O₂ → SnO₂，M = 118.71 + 32.00 = 150.71
     *     Sn  300 × 118.71 / 150.71 = 236.3 → 236
     *     O₂  300 × 32.00 / 150.71 =  63.7 →  64
     *   玻璃粉 550（55 wt%）—— 见 `mat/glass-frit` 那一节，玻璃比定方阻也定 TCR
     *   酚醛 150（15 wt%）—— 有机载体，烧成时全部烧掉，它只负责"印得出来"
     *
     *   236 + 64 + 550 + 150 = 1000 ✓ 质量是平的，没有 unbalanced。
     *
     * **为什么锡要先氧化成 SnO₂ 再配浆，而不是"直接拿锡粉配"**：厚膜电阻的导电
     * 机制是**烧结后的 SnO₂ 颗粒网络**（颗粒接触 + 玻璃里的离子导电），锡粉在
     * 850 °C 会先熔（232 °C）再氧化，熔过的锡会把玻璃相顶开 —— 出来的是"一块
     * 带玻璃的锡"，方阻低到 0.1 Ω/□，而且 TCR 是金属的正 4000，不是氧化物的负值。
     * 所以氧化必须在配浆之前单独做完，这一步不能省。
     *
     * TCR 写 −800 … +300：这是"未掺锑的 SnO₂ 厚膜"的窗口（工业掺锑是 ±200，
     * 见文件头问一）。窗口为什么这么宽：TCR 由玻璃/导电相的比例决定，而
     * 方阻也由它决定 —— 同一个配方的不同批次之间，这个比例本来就在 ±3 % 漂，
     * 那就是 ±300 的 TCR。**这条路线交的每一批 TCR 都不一样，这是它的定义。**
     */
    id: 'make/resistor-paste-tin',
    name: 'Tin Resistor Paste Production', name_zh: '锡系电阻浆制备',
    produces: [
      {
        item: 'mat/resistor-paste',
        qty: q(1000),
        gives: [
          { param: 'sheetResistance', kind: 'range', min: 1000, max: 50000 },
          { param: 'tcr', kind: 'range', min: -800, max: 300 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/tin', qty: q(236) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(64) }] },
      { anyOf: [{ item: 'mat/glass-frit', qty: q(550) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(150) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '锡氧化焙烧：Sn + O₂ → SnO₂，850–900，通氧（不是空气 —— 炉膛里要正压，否则 0.6 kPa 下氧分压不够；本层没有氧表，靠流量计刻度）',
        performedBy: 'plant/roaster',
        under: [{ param: 'temperature', min: 850, max: 900 }],
      },
      {
        note_zh: 'SnO₂ 球磨到 0.3–0.8 µm（颗粒比膜厚小两个量级，丝印才不堵网）',
        performedBy: 'plant/ore-beneficiary',
      },
      {
        note_zh: '有机载体：甲阶酚醛溶在水里（固含 40 %），加消泡剂',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 60 }],
      },
      {
        note_zh: '三辊轧浆 3 道（细度 ≤15 µm，刮板法判）—— 本层没有细度计，靠"刮板看划痕"',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(24) },
  },

  {
    /**
     * 碳系电阻浆：碳黑 + 玻璃粉 + 酚醛。**唯一能到 1 MΩ 的配方。**
     *
     *   碳 250 + 玻璃粉 150 + 酚醛 600 → 电阻浆 1000
     *
     * 与锡系的两个差别，两个都是代价：
     *
     *   碳 25 wt%（不是 30）  碳黑的比表面 60–1000 m²/g，25 % 就已经吸干了载体 ——
     *                          再多就轧不成浆（成了膏）。所以它的膜电阻率靠
     *                          "碳的牌号"（粒径）而不是"配比"，档位少
     *   玻璃只有 15 %          玻璃少了，烧结后颗粒之间靠"点接触"，接触电阻
     *                          的温度系数是**半导体的负值**（碳黑是跳跃导电），
     *                          这就是 TCR −1500 的物理来源
     *
     * 为什么还要它：SnO₂ 的方阻上限在 50 kΩ/□（再多玻璃，颗粒就不连续了，
     * 变成绝缘体而不是高阻），而主板上 100 kΩ–1 MΩ 的偏置电阻到处都是。
     * 碳膜的宽 TCR 在这一档是**可以忍的**，因为偏置电阻的绝对值本来就要
     * 按 ±30 % 设计（负载的 hFE 就散 3 倍）。
     *
     * 质量：250 + 150 + 600 = 1000 ✓
     */
    id: 'make/resistor-paste-carbon',
    name: 'Carbon Resistor Paste Production', name_zh: '碳系电阻浆制备',
    produces: [
      {
        item: 'mat/resistor-paste',
        qty: q(1000),
        gives: [
          { param: 'sheetResistance', kind: 'range', min: 100, max: 1000000 },
          { param: 'tcr', kind: 'range', min: -1500, max: -500 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/carbon', qty: q(250) }] },
      { anyOf: [{ item: 'mat/glass-frit', qty: q(150) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(600) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '碳黑与玻璃粉干混 2 h（碳黑轻，先与玻璃粉掺着混，直接投会把碳吹走）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '酚醛溶解配载体（固含 45 %，25–40 黏度才够）',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 60 }],
      },
      {
        note_zh: '三辊轧浆 4 道（碳黑难润湿，比锡系多一道）',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(20) },
  },

  {
    /**
     * 银浆：银粉 + 玻璃粉 + 酚醛。
     *
     *   银 750 + 玻璃粉 100 + 酚醛 150 → 银浆 1000
     *
     * 银 75 wt% 是端头浆的典型值（内电极浆更高，80–85 %）。为什么不能再高：
     * 银多了浆的黏度上不去，丝印时"塌边"；为什么不能再低：银少了烧成时
     * 颗粒不连续，端头的方阻上到 mΩ/□ 量级，一只 0402 的接触电阻就 0.1 Ω ——
     * 而那比 10 Ω 的电阻本身还大 1 %。
     *
     * 银粉要球磨到 1–3 µm：片状银粉（工业常用）能提高覆盖率，但片状是
     * **球磨出来的**（球磨把球压成片），本层只有球磨，正好是这条路的天然形态。
     * 代价是片状银的比表面大，载体要多 2–3 %。
     *
     * 750 + 100 + 150 = 1000 ✓
     */
    id: 'make/silver-paste',
    name: 'Silver Paste Production', name_zh: '银浆制备',
    produces: [
      { item: 'mat/silver-paste', qty: q(1000), gives: [{ param: 'silverContent', kind: 'range', min: 70, max: 80 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silver', qty: q(750) }] },
      { anyOf: [{ item: 'mat/glass-frit', qty: q(100) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(150) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '银粉球磨 8 h 到 1–3 µm（球磨把海绵银的球粒压成片状 —— 片状覆盖率高，这是球磨的副产品不是设计）',
        performedBy: 'plant/ore-beneficiary',
      },
      {
        note_zh: '配载体与浸润（银粉比表面大，载体要比电阻浆多 2–3 %）',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 60 }],
      },
      {
        note_zh: '三辊轧浆 3 道',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(16) },
  },

  {
    /**
     * 氧化铝基板：耐火料 → 球磨酸洗 → 成型 0.5 mm → 1600 烧 → 双面磨 → 检。
     *
     *   耐火料 7.4 kg → 基板 1000 片（60×60×0.5 mm，每片 7.0 g）+ 磨削渣 0.4 kg
     *
     * 每片的质量是算的：60 × 60 × 0.5 mm = 1.8 cm³ × 3.9 g/cm³ = 7.02 g。
     * 7.4 kg / 7.02 g = 1054 片，取 1000 片，余 0.4 kg 是磨削与崩边。
     *
     * ⚠️ **吃的是 `mat/refractory` 的 corundum 档（96 % Al₂O₃，`make/corundum-refractory`）**，
     * 所以交付的 al2o3 是 96 %。high-alumina 档（45–80 %）只能到 82–92 %，
     * 已不在本路线的投料里；要低档基板得另开一条，不在本轮。
     *
     * 烧成 1500–1600：`plant/high-temp-furnace` hold 1100–1600，本条压在上限。
     * 96 % 的氧化铝在 1600 是**液相烧结**（MgO–SiO₂–CaO 三元共晶 1350 就开始出液相），
     * 不是纯固相 —— 所以助烧剂是必需的，不是"加一点更好"。
     */
    id: 'make/alumina-substrate',
    name: 'Alumina Substrate Manufacturing', name_zh: '氧化铝基板制造',
    produces: [
      {
        item: 'std/alumina-substrate-general',
        qty: q(1000),
        gives: [
          { param: 'al2o3', kind: 'range', min: 96, max: 96 },
          { param: 'thickness', kind: 'range', min: 0.45, max: 0.55 },
          { param: 'roughness', kind: 'range', min: 0.2, max: 0.5 },
        ],
      },
      { item: 'mat/tailings', qty: q(2, 5) },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/refractory',
            qty: q(37, 5),
            need: [{ param: 'grade', kind: 'enum', oneOf: ['corundum'] }],
            // 只要 corundum；high-alumina 档会掉到 82–92 %，不在本路线降级。
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '球磨 12 h 到 d50 1–2 µm，酸洗除铁（Fe 0.05 % 就把基板染成灰的，白度是 96 % 瓷的外观判据）',
        performedBy: 'plant/ore-beneficiary',
      },
      {
        note_zh: '流延成型 0.5 mm 生片（刮刀间隙 0.9 mm，干燥收缩 1.8 倍）—— 用压机干压 60×60 方片也行，但 0.5 mm × 60 mm 的压制密度不匀',
        performedBy: 'plant/press',
      },
      {
        note_zh: '烧结 1500–1600 保温 2 h（液相烧结，MgO 0.5 % 抑晶粒长大 + SiO₂/CaO 3 % 助烧）',
        performedBy: 'plant/high-temp-furnace',
        under: [{ param: 'temperature', min: 1500, max: 1600 }],
      },
      {
        note_zh: '双面磨与抛光：金刚石? 没有 —— 分级碳化硅（最细 5 µm）+ 铸铁盘，Ra 到 0.2–0.5 µm',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '检厚（0.5 ±0.05）与翘曲（60 mm 上 <20 µm）：量块 + 比较仪，恒温间里做',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '料以 kg 计、基板按件计：7.4 kg 耐火料出 1000 片 60×60×0.5 mm（每片 7.02 g，共 7.0 kg），磨削渣 0.4 kg 走 mat/tailings；两个量纲不同，故声明不平衡',
    rate: { hours: q(36) },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 二、A 链的成品：片式电阻、排阻
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * 片式厚膜电阻：丝印 → 850 烧成 → 激光调阻 → 端头 → 镀 Ni/Sn。
     *
     * 一批 = **两片基板**（一片排 0402、一片排 0603），出 4000 + 1500 只。
     *
     * 排版是算的（基板 60×60 = 3600 mm²）：
     *
     *   0402  单元 1.0×0.5 + 切割道 0.2 ⇒ 单元格 1.2×0.75 = 0.90 mm²；
     *         60/1.2 = 50 列 × 60/0.75 = 80 行 = **4000 只**（排满，靠边那一列
     *         当留白不要 —— 崩边 20–50 µm 落在这一列里）
     *   0603  单元 1.6×0.8 + 切割道 0.3 ⇒ 单元格 1.9×1.1 = 2.09 mm²；
     *         3600 / 2.09 = 1722 只，取 **1500**（留 13 % 给边缘与对位标记 ——
     *         0603 的崩边比 0402 大，切割道必须宽 0.1 mm）
     *
     * 用料：2 片基板、10 g 电阻浆、3 g 银浆、1 g 镍、1 g 锡。
     * 10 g 浆印 5500 只、每只湿膜 20 µm × 0.5 mm² ⇒ 每只 0.03 mg 浆，
     * 5500 只 = 0.17 g 净浆 —— 10 g 里有 98 % 留在网上与回浆里，这个比例
     * （网损 2 %? 实际丝印的转移率 30–60 %，回浆可再用）是**丝印这个工艺的常态**，
     * 不是浪费。模型里它表现为"10 g 进、5500 只出"，两边不同量纲，不判守恒。
     *
     * 六道工序，六台设备，**没有一台是可省的**：
     *
     *   ① 丝印    plant/robot         200 目不锈钢网，乳胶感光胶，母图 = std/photomask-general
     *   ② 烧成    resistance-furnace  850，峰值 10 min，总周期 60 min
     *   ③ 调阻    plant/arf-laser     193 nm，切口 10 µm，逐只测-切-再测
     *   ④ 端头    plant/robot         浸涂银浆 → 烧银 600 → 镀 Ni 3 µm → 镀 Sn 5 µm
     *   ⑤ 镀层    plant/plating-bath
     *   ⑥ 分离    plant/robot         划刀 + 滚压折断 + 逐只测阻分选
     *
     * 烧成 850 的两件事一起发生：**有机载体烧掉**（酚醛 300–500 分解，CO₂ + H₂O 走）
     * 与**玻璃相软化流布**（550–700 软化，850 流动）。所以升温曲线比峰值温度重要：
     * 300–500 那一段必须慢（≤2 K/min），快了酚醛爆燃会把膜顶起来（起泡）。
     *
     * ⚠️ **这一条在 `plant/resistance-furnace` 上做是"敞着炉膛烧"**：
     * 厚膜烧成需要**氧化气氛**（有机烧尽、SnO₂ 不被还原），而本层唯一能控气氛的
     * `plant/atmosphere-furnace` hold 的是 `oxygen_ppm 0–50` —— 那是**无氧**那一侧，
     * 用它烧电阻会把 SnO₂ 还原成 SnO，方阻掉两个数量级（缺口⑤）。
     * 所以只能敞炉烧、靠炉口进气，**没有任何氧分压读数**（降级③）。
     */
    id: 'make/chip-resistor',
    name: 'Thick-Film Chip Resistor Manufacturing', name_zh: '片式厚膜电阻制造',
    produces: [
      {
        item: 'std/chip-resistor-general',
        qty: q(5500),
        gives: [
          { param: 'resistance', kind: 'range', min: 50, max: 1000000 },
          { param: 'tolerance', kind: 'range', min: 1, max: 20 },
          { param: 'tcr', kind: 'range', min: -1500, max: 300 },
          { param: 'caseSize', kind: 'enum', oneOf: ['0402', '0603'] },
          { param: 'power', kind: 'range', min: 0.03, max: 0.25 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/alumina-substrate-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/resistor-paste', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/silver-paste', qty: q(3, 1000) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(1, 1000) }] },
    ],
    // 判据（std/galvanometer-general + std/zener-reference-general）、定位（plant/laser-stage）、
    // 母图（std/photomask-general）、恒温（plant/metrology-room）都是**在场的前提**，
    // 不被吃掉 —— 所以进 needs，不进 uses。
    needs: [
      'plant/metrology-room',
      'plant/laser-stage',
      'std/galvanometer-general',
      'std/zener-reference-general',
      'std/photomask-general',
    ],
    steps: [
      {
        note_zh: '丝印电阻浆：200 目不锈钢网 + 乳胶感光胶（母图 std/photomask-general，紫外曝光显影），湿膜 20 µm',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '烧成 850 保温 10 min、总周期 60 min；300–500 段 ≤2 K/min（快了酚醛爆燃起泡）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 840, max: 870 }],
      },
      {
        note_zh: '激光调阻：193 nm、10.4 mJ/脉冲、400 Hz，切口 10 µm；逐只"测—切—再测"，切到比值（排阻）或 ±1 %（单只）为止',
        performedBy: 'plant/arf-laser',
      },
      {
        note_zh: '端头浸涂银浆（端面积 0.15 mm²，湿膜 30 µm）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '烧银 600 保温 10 min：玻璃熔接相把银焊在基板上（银本身不润湿氧化铝）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 560, max: 620 }],
      },
      {
        note_zh: '镀镍 3 µm（50–55 °C，瓦特镀液；镍挡银向焊料里扩散 —— 没有镍，锡焊时银会被吃掉）',
        performedBy: 'plant/plating-bath',
        under: [{ param: 'temperature', min: 50, max: 55 }],
      },
      {
        note_zh: '镀锡 5 µm（20–30 °C，纯锡；镀层厚度只有"镀多久"一个判据，见降级⑩）',
        performedBy: 'plant/plating-bath',
        under: [{ param: 'temperature', min: 20, max: 30 }],
      },
      {
        note_zh: '划刀分离（崩边 20–50 µm）+ 滚压折断 + 逐只测阻分选（伏安法，桥式指零）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(48) },
  },

  {
    /**
     * 排阻：4 只电阻 + 共用端，印在同一片基板上，**一次调阻调的是比值**。
     *
     *   基板 1 片 + 电阻浆 1 g + 银浆 2 g → 排阻 1000 只
     *
     * 与 `make/chip-resistor` 的三处差别，三处都是"为什么它单列"：
     *
     *   ① **调阻目标不同**：片阻调的是绝对阻值（±1 %，判据本身就是 ±1 %，循环论证），
     *      排阻调的是**4 只之间的比值**（±0.05 %，桥式指零能做到）。判据链恰恰
     *      只支持后者 —— 这是问三的落点，也是本文件唯一"精度能兑现"的地方。
     *   ② **共用端让端头工序少一半**：4 只电阻共享 3 个内部节点，端头只有 5 个
     *      而不是 8 个，浸涂一次做完。
     *   ③ **同片同批的价值**：4 只的 TCR 与老化**同步**，所以比值在 −40…+85 °C
     *      几乎不动（±0.3 %），而绝对阻值动 ±6 %。运放的差分对要的就是这个。
     *
     * 排版：1000 只 × 2.09 mm²（0603 单元含 0.3 mm 切割道）= **2090 mm²**，
     * 占 3600 mm² 的 58 % —— 排得下，剩下的 42 % 是边缘留白：排阻的 5 个端
     * 按 0.5 mm 引脚间距排，留白必须跟着引脚走，不能跟着单元走。
     *
     * 质量：浆 1 g / 1000 只 = 每只 1 mg 湿浆，比片阻（0.03 mg × 4 = 0.12 mg）
     * 多 8 倍 —— 因为每只排阻有 4 个电阻体 + 3 段内部互连，面积 4 倍以上。
     */
    id: 'make/resistor-network',
    name: 'Resistor Network Manufacturing', name_zh: '排阻制造',
    produces: [
      {
        item: 'std/resistor-network-general',
        qty: q(1000),
        gives: [
          { param: 'resistance', kind: 'range', min: 10, max: 100000 },
          // 绝对值 1–5 %（直读判据的极限），比值 0.2 %（桥式指零）—— 后者进注释，
          // 因为 props 里没有"比值"这个量，硬加一个只为一行注释的字段是加机制。
          { param: 'tolerance', kind: 'range', min: 1, max: 5 },
          { param: 'tcr', kind: 'range', min: -800, max: 300 },
          { param: 'caseSize', kind: 'enum', oneOf: ['0603'] },
          { param: 'power', kind: 'range', min: 0.03, max: 0.06 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/alumina-substrate-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/resistor-paste', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/silver-paste', qty: q(2, 1000) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 5000) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(1, 5000) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/laser-stage',
      'std/galvanometer-general',
      'std/zener-reference-general',
      'std/photomask-general',
    ],
    steps: [
      {
        note_zh: '丝印 4 只电阻体 + 3 段内部互连 + 共用端（一次印完，套准 ±25 µm）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '烧成 850 保温 10 min（与片阻同炉 —— 同炉是比值一致的一半）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 840, max: 870 }],
      },
      {
        note_zh: '调阻：桥式指零，逐只切 4 个电阻体把比值压到 0.2 %（绝对值不管 —— 它反正只到 ±5 %）',
        performedBy: 'plant/arf-laser',
      },
      {
        note_zh: '端头浸银（5 个端，共用端连通）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '烧银 600',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 560, max: 620 }],
      },
      {
        note_zh: '镀镍 3 µm 与镀锡 5 µm（一次挂具做完）',
        performedBy: 'plant/plating-bath',
        under: [{ param: 'temperature', min: 20, max: 55 }],
      },
      {
        note_zh: '测比值（桥式，4 只两两比）+ 划刀分离',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(24) },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 三、B 链的料：三种铁氧体粉 → 生片 → 细铜线
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * NiZn 铁氧体粉（µi 最好，**断在镍上**）。
     *
     *   铁 470 + 锌 138 + 镍 123 + 氧 269 → 铁氧体粉 1000
     *
     * 按 Ni₀.₅Zn₀.₅Fe₂O₄ 算，M = 0.5×74.69(NiO) + 0.5×81.38(ZnO) + 159.69(Fe₂O₃)
     * = 37.35 + 40.69 + 159.69 = **237.73**，所以 1000 kg 是 1000/237.73 = 4.2065 kmol：
     *
     *   NiO  2.1032 kmol × 74.69 = 157.1 kg → 镍 157.1 × 58.69/74.69 = 123.4 → **123**
     *   ZnO  2.1032 kmol × 81.38 = 171.2 kg → 锌 171.2 × 65.38/81.38 = 137.5 → **138**
     *   Fe₂O₃ 4.2065 × 159.69 = 671.6 kg → 铁 671.6 × 111.69/159.69 = 469.8 → **470**
     *   氧（三个氧化物的合计） 33.6 + 33.6 + 201.8 = 269.0 → **269**
     *
     *   123 + 138 + 470 + 269 = 1000 ✓
     *
     * **四个数是同一个 kmol 乘出来的**，没有一个是减出来的 —— 减出来的数会把
     * 任何一处笔误吸进"氧"里，账照样平（`chain.ts` 的水汽 314 就是被这件事
     * 教过的）。
     *
     * 为什么不做成"NiO + ZnO + Fe₂O₃ 三种粉配料"：本层**没有** `mat/iron-oxide`、
     * 没有 NiO 条目、ZnO 有（`mat/zinc-oxide`，焙砂）。而铁、锌、镍三种金属都有。
     * 所以本路线把"氧化"这一步合并进焙烧（850–900，通氧）—— 出来的就是三种
     * 氧化物，再球磨混合。这不是简化，是**本层唯一能凑齐三条金属链的走法**。
     *
     * ⚠️ 这条路线在数据上**已通**：`make/nickel`（ores.ts:216）吃
     * `mat/ferronickel`，`make/flotation-reagent`（reagents.ts:265）也已有路线。
     * 仍卡在工艺侧：镍粉 0.2–0.5 µm 球状、无氧化层，而本层的磨只到 0.3 µm 且带铁污染；
     * 焙烧 850–900 °C 通氧的均匀性也没有在线判据。数据闭合不等于粉体合格。
     * 它比 Zn 系的 µi 好 5–12 倍，所以这条路线值得留着。
     */
    id: 'make/ferrite-powder-nizn',
    name: 'NiZn Ferrite Powder Production', name_zh: 'NiZn 铁氧体粉制备',
    produces: [
      {
        item: 'mat/ferrite-powder',
        qty: q(1000),
        gives: [
          { param: 'grade', kind: 'enum', oneOf: ['nizn'] },
          { param: 'permeability', kind: 'range', min: 200, max: 1500 },
          { param: 'd50', kind: 'range', min: 0.8, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron', qty: q(470) }] },
      { anyOf: [{ item: 'mat/zinc', qty: q(138) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(123) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(269) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '氧化焙烧 850–900、通氧：Fe→Fe₂O₃、Zn→ZnO、Ni→NiO（一次全氧，省掉三种氧化物的单独工序）',
        performedBy: 'plant/roaster',
        under: [{ param: 'temperature', min: 850, max: 900 }],
      },
      {
        note_zh: '配料与一次球磨 4 h（钢球 —— 铁磨球带进 0.1–0.3 % Fe 对本体系是配方内元素，不是污染，这是它比玻璃粉幸运的地方）',
        performedBy: 'plant/ore-beneficiary',
        under: [{ param: 'pressure', min: 100, max: 300 }],
      },
      {
        note_zh: '预烧 800–900 保温 2 h：让尖晶石相先长出来，否则烧结时收缩 8 % 会把叠层拉裂',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 800, max: 900 }],
      },
      {
        note_zh: '二次球磨到 d50 1–2 µm（叠层要 1 µm 以下才烧得动 900 那一档，而 1–2 µm 是这一档的折中）',
        performedBy: 'plant/ore-beneficiary',
        under: [{ param: 'pressure', min: 100, max: 300 }],
      },
    ],
    rate: { hours: q(40) },
  },

  {
    /**
     * 锌铁氧体粉（ZnFe₂O₄）—— **不用镍的那条路**。干压磁芯用它。
     *
     *   铁 463 + 锌 271 + 氧 266 → 铁氧体粉 1000
     *
     * M(ZnFe₂O₄) = 81.38 + 159.69 = 241.07，1000/241.07 = 4.1482 kmol：
     *
     *   ZnO  4.1482 × 81.38 = 337.6 kg → 锌 337.6 × 65.38/81.38 = 271.2 → **271**
     *   Fe₂O₃ 4.1482 × 159.69 = 662.4 kg → 铁 662.4 × 111.69/159.69 = 463.3 → **463**
     *   氧  66.4 + 199.1 = 265.5 → **266**
     *
     *   271 + 463 + 266 = 1000 ✓（氧取 266，算得 265.5 —— 四舍五入到整数让账平）
     *
     * **代价（问四）**：µi 从 NiZn 的 200–1500 掉到 **40–120**（掉 5–12 倍）。
     * 为什么掉这么多：Ni²⁺ 的磁晶各向异性是负的、Zn²⁺ 是非磁性的稀释剂 ——
     * NiZn 的 µi 高峰来自"Ni 与 Zn 的比例把各向异性常数 K₁ 拉到过零"。
     * 没有 Ni，只剩 Zn 的稀释与 Fe 的各向异性，K₁ 大、µi 就低。
     * 这不是"配方没调好"，是**二元系少了一个自由度**。
     *
     * 好处是截止频率高（10–200 MHz）：µi 与 f_c 的乘积（Snoek 极限）是常数
     * 量级，µi 低了 f_c 自然高。所以 Zn 铁氧体当**磁珠**（要高频阻塞）比当
     * **电感**（要低频储能）合适 —— 但叠层磁珠还有共烧温度的问题（见下一条）。
     */
    id: 'make/ferrite-powder-zn',
    name: 'Zinc Ferrite Powder Production', name_zh: '锌铁氧体粉制备',
    produces: [
      {
        item: 'mat/ferrite-powder',
        qty: q(1000),
        gives: [
          { param: 'grade', kind: 'enum', oneOf: ['zn'] },
          { param: 'permeability', kind: 'range', min: 40, max: 120 },
          { param: 'd50', kind: 'range', min: 0.8, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron', qty: q(463) }] },
      { anyOf: [{ item: 'mat/zinc', qty: q(271) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(266) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '氧化焙烧 850–900、通氧：Fe→Fe₂O₃、Zn→ZnO',
        performedBy: 'plant/roaster',
        under: [{ param: 'temperature', min: 850, max: 900 }],
      },
      {
        note_zh: '配料与一次球磨 4 h',
        performedBy: 'plant/ore-beneficiary',
        under: [{ param: 'pressure', min: 100, max: 300 }],
      },
      {
        note_zh: '预烧 800–900 保温 2 h（尖晶石相生成；这一步放出的氧要排掉，炉门留缝）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 800, max: 900 }],
      },
      {
        note_zh: '二次球磨到 d50 1–2 µm',
        performedBy: 'plant/ore-beneficiary',
        under: [{ param: 'pressure', min: 100, max: 300 }],
      },
    ],
    rate: { hours: q(40) },
  },

  {
    /**
     * 锌铜铁氧体粉（Zn₀.₇Cu₀.₃Fe₂O₄）—— **叠层共烧的那一条**。
     *
     *   铁 464 + 锌 190 + 铜 79 + 氧 267 → 铁氧体粉 1000
     *
     * M = 0.7×81.38(ZnO) + 0.3×79.55(CuO) + 159.69(Fe₂O₃) = 56.97 + 23.86 + 159.69
     * = 240.52，1000/240.52 = 4.1576 kmol：
     *
     *   ZnO  2.9103 × 81.38 = 236.8 kg → 锌 236.8 × 65.38/81.38 = 190.3 → **190**
     *   CuO  1.2473 × 79.55 =  99.2 kg → 铜  99.2 × 63.55/79.55 =  79.3 → **79**
     *   Fe₂O₃ 4.1576 × 159.69 = 663.9 kg → 铁 663.9 × 111.69/159.69 = 464.4 → **464**
     *   氧  46.6 + 20.0 + 199.6 = 266.2 → **267**
     *
     *   464 + 190 + 79 + 267 = 1000 ✓（氧取 267，算得 266.2）
     *
     * **为什么非得加铜（问四）**：叠层磁珠的内电极是银，银的熔点 **961 °C**。
     * 共烧必须 ≤900，而纯 Zn 铁氧体在 900 °C 只烧到 85 % 理论密度
     * （µi 再掉一半、损耗大 3 倍）。CuO 在 900–1000 出**液相**（CuO–Cu₂O 共晶），
     * 把烧结机制从固相扩散换成液相烧结 —— 900 °C 就能到 95 % 密度。
     * 这是"低温共烧铁氧体（LTCF）"的全部秘密，本层正好有铜（`mat/copper`，
     * 风化层 30 ppm，一吨铜要挖三万多吨土 —— 但叠层磁珠一只只用 0.1 mg 铜，
     * 这个贵法在这里是可承受的：**贵金属用在毫克级的地方才不贵**）。
     *
     * 代价：Cu 在铁氧体里是**受主**，µi 比纯 Zn 高（100–300 对 40–120），
     * 但损耗角正切 tanδ 大 2–3 倍（Cu²⁺ 的 hopping 导电）。当磁珠可以（它本来就要阻），
     * 当电感不行（Q 会掉到 20 以下）。
     */
    id: 'make/ferrite-powder-zncu',
    name: 'Zinc-Copper Ferrite Powder Production', name_zh: '锌铜铁氧体粉制备',
    produces: [
      {
        item: 'mat/ferrite-powder',
        qty: q(1000),
        gives: [
          { param: 'grade', kind: 'enum', oneOf: ['zncu'] },
          { param: 'permeability', kind: 'range', min: 100, max: 300 },
          { param: 'd50', kind: 'range', min: 0.8, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron', qty: q(464) }] },
      { anyOf: [{ item: 'mat/zinc', qty: q(190) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(79) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(267) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '氧化焙烧 850–900、通氧：Fe→Fe₂O₃、Zn→ZnO、Cu→CuO（铜 850 就够，Zn 与 Fe 要 900 —— 取上限）',
        performedBy: 'plant/roaster',
        under: [{ param: 'temperature', min: 850, max: 900 }],
      },
      {
        note_zh: '配料与一次球磨 4 h',
        performedBy: 'plant/ore-beneficiary',
        under: [{ param: 'pressure', min: 100, max: 300 }],
      },
      {
        note_zh: '预烧 800–850（铜系要低 50 K：850 以上 CuO 开始往 Cu₂O 走，预烧就把铜还原了）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 800, max: 850 }],
      },
      {
        note_zh: '二次球磨到 d50 0.8–1.5 µm（比干压粉细一档 —— 流延的片厚只有 30 µm，颗粒必须 ≤1.5）',
        performedBy: 'plant/ore-beneficiary',
        under: [{ param: 'pressure', min: 100, max: 300 }],
      },
    ],
    rate: { hours: q(40) },
  },

  {
    /**
     * 流延生片：铁氧体粉 + 酚醛 + 水 → 刮刀流延 → 干燥收卷。
     *
     *   粉 850 + 酚醛 150 → 生片 1000
     *
     * 850 + 150 是守恒的，水**不进账**：水是载体，干燥时全部走掉
     * （与"窑不记燃料"同一个口径，见 `chain.ts` 的 make/iron 注释）。
     * 生片的终点定义就是"干片"，所以水不在产物里，也不在进料里。
     *
     * 15 % 的酚醛偏高（工业 PVB 只 5–8 %），原因是**酚醛的碳残留**：
     * 它在 300–500 分解，残碳 0.1–0.5 %，而碳在 900 °C 会把 Fe³⁺ 还原成 Fe²⁺ ——
     * 那是"配方内的还原剂"，直接改 µi 与损耗。所以脱脂必须慢（见 `make/chip-bead`
     * 的脱脂段：0.5 K/min 到 500 保温 2 h）。多配 5 % 酚醛是为了浆的流变性够
     * （粉 85 % + 水 25 % 的浆太稠，刮出来有"竹节"纹）。
     *
     * 降级⑨（R8）：酚醛换成 PVB/PVA ⇒ 脱脂窗口变宽、残碳 <0.05 %、生片柔韧性
     * 好 3 倍（能卷起来）。要一条聚乙烯醇链 —— 本层只有酚醛与聚苯乙烯。
     */
    id: 'make/ferrite-tape',
    name: 'Tape Casting Green Sheet Production', name_zh: '流延生片制备',
    produces: [
      {
        item: 'mat/ferrite-tape',
        qty: q(1000),
        gives: [
          { param: 'thickness', kind: 'range', min: 20, max: 40 },
          { param: 'ferriteLoad', kind: 'range', min: 80, max: 90 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ferrite-powder', qty: q(850) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(150) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '配浆：粉 85 % + 甲阶酚醛 15 % + 水 25 %（水的账不进模型），球磨 12 h 到无团聚',
        performedBy: 'plant/ore-beneficiary',
      },
      {
        note_zh: '流延：刮刀间隙 100 µm，载体是不锈钢带（没有聚酯膜 —— 不锈钢带能反复用，但要接缝，接缝处 3 mm 不能排版）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '干燥 60–80：湿 100 µm → 干 30 µm（收缩 3.3 倍）；借湿法槽的加热夹套吹热风，本层没有恒温干燥箱',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 60, max: 80 }],
      },
    ],
    rate: { hours: q(20) },
  },

  {
    /**
     * 细铜线：φ1.0 mm → φ100 µm 或 φ30 µm，**19–28 道模拔**。
     *
     *   铜线 1000 → 细铜线 1000（1 : 1）
     *
     * 道次是算的：每道减面 22 %（直径 ×0.883），
     *
     *   φ1.0 → φ0.1：断面积比 100，ln 100 / ln(1/0.78) = 4.605 / 0.2485 = 18.5 → **19 道**
     *   φ1.0 → φ0.03：断面积比 1111，ln 1111 / ln(1/0.78) = 7.013 / 0.2485 = 28.2 → **28 道**
     *
     * 质量 1 : 1 是**真的**：断头、氧化皮、模口切屑全部回熔（与
     * `unblock-wire.ts` 的 φ1.0 那条同一个口径，它也不是 0.98）。
     *
     * 中间退火 3 次（200–400）：铜的再结晶 200–300，每 6–8 道退一次。
     * 6 道之后断面积剩 0.22（φ×0.47），冷作硬化到 HV 130，再拉就断。
     *
     * ⚠️ 这条路线与 `unblock-wire.ts` 的 φ1.0 那条**不是同一条的两个参数**：
     * 那一条从 `mat/copper` 起（铸杆 → 拉丝），这一条从 φ1.0 起。
     * 分成两条是因为中间有一个**只有这条才有的动作**：φ0.1 以下的线不能用
     * 手摇卷筒收（张力波动 ±30 % 就断），必须**先拉后绕**（拉丝卷筒 + 收线分开）。
     * 那个"分开"就是 `plant/winder` 进这条路线的原因（第 4 道工序）。
     */
    id: 'make/fine-copper-wire',
    name: 'Fine Copper Wire Production', name_zh: '细铜线制备',
    produces: [
      { item: 'mat/fine-copper-wire', qty: q(1000), gives: [{ param: 'diameter', kind: 'range', min: 25, max: 120 }] },
    ],
    uses: [{ anyOf: [{ item: 'mat/copper-wire', qty: q(1000) }] }],
    // 拉丝模与量块都是**工具**，不被吃掉：模孔决定线径（φ25 µm 是磨料粒度的极限），
    // 量块决定"量得出来"（线径差 2 µm 就量不出，前 28 道全白干）。
    needs: ['std/wire-die-general', 'plant/gauge-block'],
    steps: [
      {
        note_zh: '粗拉到 φ0.5（6 道，手摇卷筒 φ320，张力靠手感）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '中间退火 200–400（400–600 那档是给 φ1.0 的，细线要低 200 K —— 否则晶粒长大、再拉就"竹节"断）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 200, max: 400 }],
      },
      {
        note_zh: '细拉到 φ0.1（13 道，每道减面 22 %；6 + 13 = 共 19 道，直径比 10、断面积比 100）；断头率高，接头处就是以后绕线的断点',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '复绕到线轴（收线张力 0.3–0.5 N —— φ0.1 铜丝破断力 1.7 N，取 20–30 %）',
        performedBy: 'plant/winder',
      },
    ],
    rate: { hours: q(30) },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 四、B 链的成品：磁芯、磁珠、绕线片感
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * 铁氧体磁芯（绕线片感的骨架）：造粒 → 干压 → 1200 烧 → 磨端面。
     *
     *   铁氧体粉 1 g → 磁芯 1000 只
     *
     * 每只 1.0 mg 是算的：磁芯 0.4×0.4×1.6 mm = 0.256 mm³ × 4.8 g/cm³ = 1.23 mg，
     * 1000 只 = 1.23 g，取 1 g 粉（收率 80 %，低于干压的常态 95 % —— 0.4 mm
     * 的芯脱模时崩边率高，这是尺寸决定的）。
     *
     * 只用 Zn 系粉（`need: grade = zn`）：磁芯是立体的、无内电极，可以 1200 烧，
     * 正好是 Zn 铁氧体那一档。**不能用 zncu**：铜系 1200 会熔成一摊（CuO 液相太多）。
     *
     * 1200 是 `plant/kiln` 的下限（hold 1200–1750）。为什么不用电阻炉（到 1100）：
     * 1100 烧的 Zn 铁氧体只有 88 % 密度，µi 40–120 会掉到 30–60。
     *
     * ⚠️ 1200 °C 烧 Zn 铁氧体会**挥发锌**（ZnO 蒸气压在 1200 已经是 1 kPa 量级）：
     * 工业上放密闭匣钵 + 埋同成分粉（牺牲粉）。本层的窑没有匣钵，只能把芯埋在
     * 同批粉里烧（一炉埋一炉）—— 这是"用粉换锌"，不是精度问题。
     */
    id: 'make/ferrite-core',
    name: 'Ferrite Core Manufacturing', name_zh: '铁氧体磁芯制造',
    produces: [
      { item: 'std/ferrite-core-general', qty: q(1000), gives: [{ param: 'permeability', kind: 'range', min: 40, max: 120 }] },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/ferrite-powder',
            qty: q(1, 1000),
            need: [{ param: 'grade', kind: 'enum', oneOf: ['zn'] }],
            // 吃 nizn/zncu 也压得出芯，只是烧成温度对不上：nizn 要 1250（窑能到，
            // 但那时镍链已经通了，这条降级就没意义了）、zncu 1200 会熔。
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: [],
    steps: [
      {
        note_zh: '造粒：加 3 % 酚醛与 8 % 水，碾盘上滚成 φ0.3–0.8 的团粒，过 60 目筛（粉太细压不实，会"架桥"）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '干压 100–200 MPa（φ3 模具，45 钢淬火 —— 模具是工具，不进 uses）',
        performedBy: 'plant/press',
      },
      {
        note_zh: '烧结 1200 保温 3 h，埋同批粉防锌挥发（窑的下限就是 1200）',
        performedBy: 'plant/kiln',
        under: [{ param: 'temperature', min: 1200, max: 1250 }],
      },
      {
        note_zh: '磨端面与倒角（绕线时棱角会把漆皮刮掉，倒角 0.05）',
        performedBy: 'plant/grinder',
      },
    ],
    rate: { hours: q(24) },
  },

  {
    /**
     * 叠层片式磁珠：流延片 → 丝印内电极 → 叠层 → 等静压 → 脱脂 → 900 共烧 → 端头 → 镀。
     *
     *   生片 4 g + 银浆 0.3 g → 磁珠 1000 只（0603）
     *
     * 每只的质量是算的：0603 = 1.6×0.8×0.8 mm = 1.024 mm³ × 5.0 g/cm³ = 5.1 mg，
     * 其中生片 ~4.1 mg（未烧前含酚醛，烧后掉 10 %）、银 ~0.3 mg。
     * 1000 只 = 4.1 g 生片 + 0.3 g 银浆 ✓
     *
     * 层数：0.8 mm 厚 / 30 µm 每层 = **26 层**。内电极印在奇数层上，
     * 相邻层电极错开半格，两端错开 0.3 mm —— 这就是"叠层"的全部几何。
     * 26 层 × 丝印 26 次 × 对位 ±10 µm：这是本文件里**对位最多的工序**，
     * 也是 0402 做不了的原因（0402 只有 0.5 mm 宽，两端错开 0.2 mm 之后
     * 每层电极只有 0.1 mm 宽，丝印的浆在 30 µm 的片上会塌）。
     *
     * 为什么必须 ≤900：Ag 熔 961。所以只能用 zncu 粉（见 `make/ferrite-powder-zncu`）。
     *
     * 脱脂与共烧**分两炉**，不能合并：脱脂要**氧气**（把酚醛的碳烧成 CO₂，
     * 500 °C 保温 2 h 就是为了它）；共烧也要一点氧把最后那点残碳烧尽 ——
     * 银本身不怕氧（Ag₂O 在 200 °C 以上就分解了），**怕的是碳**：残碳把 Fe³⁺
     * 还原成 Fe²⁺，µi 与损耗一起崩。两段都在 `plant/resistance-furnace` 上、
     * 敞开炉膛、靠进气量控制 —— 而这正是**没有氧表的那个代价**：
     * 残碳 0.2 % 就能把 µi 打掉 30 %，而这件事在本层**看不见**。
     */
    id: 'make/chip-bead',
    name: 'Multilayer Chip Bead Manufacturing', name_zh: '叠层片式磁珠制造',
    produces: [
      {
        item: 'std/chip-bead-general',
        qty: q(1000),
        gives: [
          // Ω@100 MHz —— 工艺保证，测不了（降级④）
          { param: 'impedance', kind: 'range', min: 10, max: 600 },
          { param: 'caseSize', kind: 'enum', oneOf: ['0603'] },
          { param: 'resistance', kind: 'range', min: 0.02, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ferrite-tape', qty: q(4, 1000) }] },
      { anyOf: [{ item: 'mat/silver-paste', qty: q(3, 10000) }] },
    ],
    // 最后一段是恒温间里的直流电阻测量（19–21 °C）：`plant/robot` 不 hold 温度，
    // 承担者必须是 `plant/metrology-room`（hold 19–21）—— 所以它在 needs 里。
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '切片与丝印内电极：26 层，每层印完烘干；内电极线宽 0.2 mm、两端错开 0.3 mm',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '叠层与温等静压 70–80 °C、20 MPa（100 t 压机摊到 60×60 的叠层上是 28 MPa，够）',
        performedBy: 'plant/press',
      },
      {
        note_zh: '切割成 0603 素坯（划刀 + 折断）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '脱脂 300–500 慢升（0.5 K/min，500 保温 2 h）—— 酚醛残碳必须烧尽，这是降级⑨的正面代价',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 300, max: 500 }],
      },
      {
        note_zh: '共烧 880–900 保温 2 h（Ag 内电极 961 熔，卡在下面 60 K）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 880, max: 900 }],
      },
      {
        note_zh: '端头银浆（两端各 0.3 mm 长，浸涂）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '烧银 600 保温 10 min',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 560, max: 620 }],
      },
      {
        note_zh: '镀镍 3 µm + 镀锡 5 µm',
        performedBy: 'plant/plating-bath',
        under: [{ param: 'temperature', min: 20, max: 55 }],
      },
      {
        note_zh: '测直流电阻（伏安法）+ 分选；阻抗测不了（降级④）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(56) },
  },

  {
    /**
     * 绕线片式电感：磁芯 + φ0.1 铜线绕 5–20 匝 + 焊接 + 端头 + 镀。**只做 1008/1210。**
     *
     *   磁芯 1000 只 + 细铜线 5 g + 银浆 0.3 g → 片感 1000 只
     *
     * 5 g 铜是算的（每匝平均长度 ≈ 2×芯长 + 2×芯宽 + 壁厚，绕在长边上）：
     *
     *   1210（芯 1.0×0.8、20 匝、每匝 6 mm）= 120 mm
     *        断面积 7.85e-3 mm² × 120 = 0.94 mm³ × 8.96 = **8.4 mg/只**
     *   1008（芯 0.6×0.5、5 匝、每匝 2.6 mm）= 13 mm → 0.10 mm³ = **0.9 mg/只**
     *   一半一半：500 × 8.4 + 500 × 0.9 = 4.2 + 0.45 = **4.65 g** → 取 5 g
     *
     * **为什么只做 1008/1210（问五）**：`plant/winder` 全表用过的最细线是 φ0.1 mm；
     * 0402/0603 的绕线档要 φ20–50 µm，差 2–5 倍。而且不是"换只导轮"的事：
     * φ50 µm 铜丝的破断力 0.43 N，张力要稳在 0.1 N，而摩擦盘+弹簧的手感量程
     * 是给 φ0.5–1.0（破断力 43–173 N、对应张力 10–50 N）设计的 ——
     * **差两个数量级，不是同一只弹簧**。
     *
     * 电感量的算法见 `std/chip-inductor-general` 的注释（L = µ₀µrN²A/l，
     * 与 `euv-pulser.ts:807` 的空心电感同一个式子，那里 µr = 1）。
     *
     * 降级⑥（R8）：磁粉离合器张力 + 显微镜目视排线 ⇒ φ50 µm 是下一档。
     * 20 µm 那一档要的不是设备，是**在线测径 + 闭环张力**，本层两样都没有。
     */
    id: 'make/chip-inductor',
    name: 'Wire-Wound Chip Inductor Manufacturing', name_zh: '绕线片式电感制造',
    produces: [
      {
        item: 'std/chip-inductor-general',
        qty: q(1000),
        gives: [
          { param: 'inductance', kind: 'range', min: 0.5, max: 22 },
          { param: 'tolerance', kind: 'range', min: 10, max: 20 },
          { param: 'caseSize', kind: 'enum', oneOf: ['1008', '1210'] },
          { param: 'resistance', kind: 'range', min: 0.1, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/ferrite-core-general', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/fine-copper-wire', qty: q(5, 1000) }] },
      { anyOf: [{ item: 'mat/silver-paste', qty: q(3, 10000) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '绕线：φ0.1 mm，5–20 匝，张力 0.3–0.5 N（φ0.1 破断 1.7 N 的 20–30 %）；手摇 + 挂轮排线，圈数靠机械计数器',
        performedBy: 'plant/winder',
      },
      {
        note_zh: '端头焊接：热压锡焊 240–260，焊点 0.15 mm²（线头 0.1 mm 焊在端头银层上 —— 这一步的手艺是"不烫化芯子"）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 240, max: 260 }],
      },
      {
        note_zh: '端头银浆补涂（焊点外面再包一层银，机械强度靠它）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '烧银 600 保温 10 min',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 560, max: 620 }],
      },
      {
        note_zh: '镀镍 3 µm + 镀锡 5 µm',
        performedBy: 'plant/plating-bath',
        under: [{ param: 'temperature', min: 20, max: 55 }],
      },
      {
        note_zh: '测直流电阻（伏安法，判线圈通断与线径）+ 量外形；电感量测不了（降级④），只能抽一只绕样圈互比',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(40) },
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CHIPPASSIVE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CHIPPASSIVE_ROUTES];
