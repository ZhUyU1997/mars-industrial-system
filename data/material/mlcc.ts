/**
 * 片式多层陶瓷电容（MLCC）—— 从火星的钡到一颗 0805 上的去耦电容。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么要有这一份
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 机器人主板上**数量最多的元件就是 MLCC**：一颗 SoC 旁边 10–30 颗 0.1 µF 去耦，
 * DDR/PCIe 的每一条电源脚上还要各一颗。而本层在此之前只有
 * `std/capacitor-film-general`（`data/machine/capacitor.ts`）—— 铝箔 + PTFE 膜卷绕、
 * 插件、厘米级、0.1–10 µF/200–630 V。那是**中频谐振回路**的电容，
 * 它替不了 0402 贴在 SoC 旁边的那一颗：
 *
 * ```
 * 薄膜卷绕   厘米级、插件、引线电感 10 nH 量级  → 1 MHz 以上就成电感
 * 片式 MLCC  毫米级、贴片、无引线、ESL 0.5 nH  → 去耦到 1 GHz
 * ```
 *
 * 高速数字电路没有 MLCC 就没有去耦：电源脚的 di/dt 只能由最近的电容供，
 * 走线那几 nH 在 100 MHz 上就是 60 Ω，板子根本不成立。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五问（每条带数）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * **问一：钡从哪来？——本层没有重晶石，全表 0 处。**
 *
 * `grep 'barium|barite|BaSO|BaCO|BaTiO' data/` 只命中一句注释
 * （`data/machine/unblock-electrorefining-cell.ts:124` 讲铅钡硫酸盐进阳极泥）。
 * 没有 `mat/barite`、没有 `mat/barium-carbonate`、没有 `mat/barium-titanate` —— 三个都没有。
 *
 * 所以钡只能从**风化层**里取，而它在风化层里是散在长石与玻璃相里的：
 *
 * ```
 * 玄武岩/风化层的钡      300–500 ppm（本文件取 300 ppm 那一头算最坏的账）
 * BaCO₃ 的钡含量         137.33/197.34 = 69.6 %
 * 1 kg BaCO₃ 要          0.696 kg Ba
 * 300 ppm、浸出率 80 %   0.696/0.0003/0.8 = 2900 kg 土 = **2.9 t**
 * 500 ppm、浸出率 80 %   0.696/0.0005/0.8 = 1740 kg 土 = **1.7 t**
 * ```
 *
 * **结论：1 kg BaCO₃ 要 1.7–2.9 t 风化层。** 折到 BaTiO₃（要 0.846 kg BaCO₃/kg）
 * 就是 **1.4–2.5 t 土/kg BaTiO₃**，而钛那一份只要 156 kg 土/kg Ti × 0.205 = **32 kg**
 * —— 钡占 98 %，钛可以忽略。
 *
 * 这个数字听起来很吓人，但它**不是本文件的瓶颈**（见问三）。
 *
 * **问二：介质粉要多细？——粉不是瓶颈，生带才是。**
 *
 * 容量是几何算出来的：**C = ε₀·εr·A·n/t**（n 层、每层介质厚 t、极板重叠面积 A）。
 *
 * ```
 * 本层这一档   εr 1200（玻璃助熔、无稀土掺杂）、t 16 µm（生带 20 µm × 烧结收缩 0.8）
 *              n 25 层、A 1.2 mm²（0805 的 2.0×1.25 减去四周留边）
 *              C = 8.854e-12 × 1200 × 1.2e-6 × 25 / 16e-6 = **19.9 nF**
 *
 * 现代 0402 0.1 µF 档  εr 2500、t 1.5 µm、n 30、A 0.2 mm²
 *              C = 8.854e-12 × 2500 × 0.2e-6 × 30 / 1.5e-6 = 88.5 nF
 *
 * 单位面积容量密度   本层 19.9/1.2 = **16.6 nF/mm²**；现代 88.5/0.2 = **443 nF/mm²**
 *                    差 **27 倍** —— 拆开是 εr 2.1 倍 × 层厚比 16 倍 / 层数 0.83 倍
 * ```
 *
 * 20 µm 生带在一个 0.9 mm 高的 0805 里能叠几层：留上下各 0.1 mm 保护层，
 * 每层占 16 µm 介质 + 2 µm 电极 = 18 µm → **上限 39 层**，实际取 **25 层**
 * （手工叠层对位要余量）。要 0.1 µF 就得 n/t = 7.8e6 m⁻¹，20 µm 下要 **157 层 = 2.8 mm 厚**
 * —— 0805 装不下，差 6 倍。
 *
 * **粒度：0.1–0.3 µm 是给 1 µm 介质用的（介质厚度要 ≥ 5×d50）。本层磨到 0.3 µm，
 * 已经够做 1.5 µm 介质 —— 卡住的不是粉，是生带。** 粉再细下去只有两个后果：
 * 比表面积 ×3（载体用量 +30 %、收缩率 +5 %）、烧结温度 −100 °C。
 *
 * **问三：镍还是银？——按土耗算，银反而便宜 4 倍。**
 *
 * 每只 0805 的金属量（内电极 25 层 × 1.2 mm² × 2 µm 厚 + 端头，含印刷留边与切割废料）：
 *
 * ```
 * 银   内电极 1.12 mg + 端头 0.56 mg = **1.7 mg/只**   （几何净量 0.63 + 0.40，乘 1.8 的印刷/切割余量）
 * 镍   同体积 × 8.9 = 0.53 mg（净量）
 * 1 kg 银 → **59 万只** 0805（1e6 mg / 1.7 mg）→ 14.3 t/kg 银 ⇒ **24 g 风化层/只**
 * ```
 *
 * 而"银贵 60 倍"是按**价格**说的（Ag ≈ 1.0 $/g、Ni ≈ 0.017 $/g）。本层不认钱，
 * 只认土、工时与设备。按**土耗**重算（全部用本层自己的路线数字）：
 *
 * ```
 * 银  `make/silver-from-sludge`：阳极泥 1000 → 银 210；阳极泥 10 kg/t 阴极铜
 *     ⇒ 1 kg 银 要 476 kg 铜；铜 30 ppm、富集 8333:1
 *         （chain.ts:188 记"一吨铜挖三万吨土"，含回收损失，取这个数）
 *     ⇒ 1 kg 银 = 476 × 30 = **14.3 t 风化层**
 * 镍  chain.ts:222：风化层 400 ppm，富集到 10 % 是 250:1 ⇒ 1 kg 镍 = 250 × 250 = **62.5 t 风化层**
 * ```
 *
 * **银 14.3 t/kg、镍 62.5 t/kg —— 银比镍便宜 4.4 倍**，因为银是铜的副产品，
 * 而镍要从 400 ppm 单独富集 250 倍。这与价格的方向相反，也正是本层该有的答案：
 * **料上银不亏**。
 *
 * 所以"先做银电极那一档"不是权宜，是三条理由都指向它：
 * ① 银链通（`make/silver-from-sludge` 交付 95 % 的银）；镍链的料也通了 ——
 *    `mat/nickel` 有条目（chain.ts:224）、有 `mat/nickel-concentrate`，
 *    浮选药剂已有 `make/flotation-reagent` 路线；镍电极的难点转到还原气氛共烧；
 * ② 银能在空气里烧（961 °C 熔点，端头共烧 900–930 °C），镍必须还原气氛（问四）；
 * ③ 银的用量小到不构成产能问题（1.7 mg/只 → 1 kg 银做 59 万只 → 一块 30 颗的板子 51 mg 银）。
 *
 * **代价是什么：本层这一档只有 0.012–0.022 µF。** SoC 旁边那颗 0.1 µF 要 5–8 倍容量，
 * 靠的是 1.5 µm 介质 + 30 层 + εr 2500（镍电极 + 0.1 µm 掺杂粉 + 还原气氛），
 * 本层在"介质厚度 / 层数 / εr / 电极"四个维度上同时差 —— 这不是"差一点"，是差一代。
 *
 * **问四：还原气氛烧结？——做不到，而且这一处最要命。**
 *
 * 镍电极的共烧要 1300 °C、**低氧但非零**：太高（>Ni/NiO 线）镍氧化成 NiO（绝缘，
 * 电容变电阻），太低 BaTiO₃ 被还原（Ti⁴⁺→Ti³⁺，半导化，漏电流爆掉）。窗口窄到
 * 只有两三个数量级，而它正好落在测不了的地方：
 *
 * ```
 * Ni + ½O₂ = NiO   1573 K 下 ΔG° ≈ −168 kJ/mol
 *                  ln K = 168000/(8.314×1573) = 12.85 → K = 3.8e5 bar^-½
 *                  pO₂ = (1/K)² = 6.9e-12 bar = **6.9e-7 Pa ≈ 10⁻⁶ Pa** ← 窗口的下沿
 * 工艺窗口          **10⁻⁶ – 10⁻⁹ Pa**（低于它 BaTiO₃ 还原，高于它镍氧化）
 * 本层气氛炉         `plant/atmosphere-furnace` holds oxygen_ppm 0–50
 *                  50 ppm = 50e-6 atm = **5.07 Pa**
 * 缺口              5.07 / 6.9e-7 = **7.3e6 倍 = 6.7 个数量级**
 * ```
 *
 * 在 5 Pa 下 1300 °C 的镍会**完全**氧化成 NiO。按 #24 的判据问一句"换完还做不做原来
 * 那件事"——**不做**。所以这不是降级，是换了一个东西。
 *
 * 三条替代都堵在 #23 上：
 *
 * ```
 * 氮气稀释   N₂ 99.999 % 的残余氧 = 10 ppm = 1 Pa，仍高 6 个数量级。
 *            "稀释"只能在你还测得出氧的时候有意义，而本层测不出（#23）。
 * 银钯电极   当时 Pd 全表没有（`mat/palladium` 不存在）；现在 `pgm.ts` 有海绵 Pd，
 *            但 Ag/Pd 内电极要 Pd 粉、与银共烧的流延/烧结路线，仍未建。
 *            （`data/machine/xenon-loop.ts:193` 当时已记这一条。）
 * 湿氢缓冲   工业真正的做法：1–3 % H₂ + 露点 20–40 °C，pO₂ 由 H₂/H₂O 平衡钉死。
 *            要三样东西：氢、露点计、氧分析仪 —— **三样都没有**（#23）。
 * ```
 *
 * **结论：本层不烧镍。** 走银 + 空气 + 低烧玻璃（900–930 °C），介质 εr 从 3000 掉到 1200。
 *
 * **问五：端头与镀锡？——有槽有锡，缺一只滚筒。**
 *
 * ```
 * 铜端浆 + 烧端   Cu/Cu₂O 平衡在 800 °C 约 10⁻³ Pa —— 比镍松 3 个数量级，仍高 4 个，
 *                 所以铜端同样烧不了（要 N₂ 保护）。端头用银，700–800 °C 空气烧。✓
 * 镀镍 + 镀锡     `plant/plating-bath`（20–60 °C、15–20 kPa）✓；`mat/nickel`/`mat/tin` ✓
 * 滚镀            **`plant/plating-bath` 的 composedOf 只有槽体 + 阳极挂具 + 阴极挂具**
 *                 （`data/machine/plating.ts:162`），**没有滚筒**。片式件挂挂具上镀，
 *                 接触点被夹具遮住 → 每只 5–10 % 面积漏镀 → 可焊性 90–95 %（滚镀 99 %+）。
 * ```
 *
 * 滚筒要四件：φ100×150 打孔不锈钢筒（φ1 孔 × 3000 个）、两端板、齿圈、阴极触点。
 * 把它装进镀槽要改 `data/machine/plating.ts` 的 composedOf —— **本文件不许改别的文件**，
 * 所以按先例（`data/machine/hot-phosphoric-bath.ts:197`"不在白名单里，只记条件、
 * 不写路线"）记成**升级条件**，不建条目。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六段工艺：真实的那六段，与本层落到哪台设备上
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ```
 * 段  真实工艺                                    本层设备                       降在哪
 * ─────────────────────────────────────────────────────────────────────────────────────
 * ①  重晶石碳热还原 1000–1200 + 碳化               plant/kiln + plant/wet-bench   窑是氧化焰
 * ②  BaCO₃ + TiO₂ 固相反应 1000–1200（4 h）        plant/resistance-furnace       上限 1100
 * ③  掺杂 + 球磨到 0.1–0.3 µm（行星磨）            车床摇罐（**没有球磨机**）      0.3 µm
 * ④  流延 5–30 µm（流延机 + PVB + 甲苯）           plant/robot 手刮               只能 20 µm
 * ⑤  丝印镍浆 + 几十层叠层 + 等静压 + 切割          plant/robot + plant/press      25 层、手工
 * ⑥  排胶 450–700 + 共烧 1300/低氧 + 端头 + 镀     resistance-furnace/atmosphere  见问四
 * ```
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 降级与升级（R8：每一处降级都配一条恢复原规格的路，或写清缺口与量级）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ```
 * ① 钡的品位 300 ppm → 土耗 2.9 t/kg BaCO₃
 *    升级**路线**：`make/barium-sulfate-lime-sinter` 石灰烧结（风化层 + 石灰 1200 °C，
 *    玻璃相解聚）→ 浸出率 80→95 % → 2.45 t（−16 %）。换来的是通量，不是质量。
 * ② 回转窑是氧化焰、下限 1200 °C → 只能 1200–1250（工艺要求 1000–1200 的低端进不去）、
 *    碳过量 18 %、转化率 55–75 %
 *    升级**路线**：`make/barium-sulfide-reduced` 搬进气氛炉（600–2000、oxygen_ppm 0–50）
 *    → 1200 °C 与还原气氛一起解决，转化率 82–90 %，代价是间歇、装料少、要 30 kg 氮置换。
 * ③ 没有分散剂（鱼油/聚丙烯酸铵）→ 浆料絮凝，固含量只能 45 %
 *    升级条件：聚丙烯酸铵要丙烯酸 + 氨，两者都不在本轮 uses 白名单 → 记条件。
 * ④ 载体只有酚醛（resole）+ 水：热固性、残碳 40–50 % → 生带只能 20 µm 以上、排胶发脆
 *    升级条件：PVB + 乙醇/甲苯。`mat/ethanol` **有条目**（reagents.ts:69）但不在本轮
 *    白名单；`mat/pvb`/`mat/toluene` 全表没有 → 记条件。
 * ⑤ 球磨靠车床卡罐 → D50 0.3–1.0 µm（行星磨 0.1–0.3）
 *    升级条件：球磨机 —— `plant/` 的 106 台里没有这一台 → 记条件。
 *    但按问二，这一条**不卡容量**（粉够用，生带不够薄）。
 * ⑥ 没有稀土/镁/锰掺杂 → 只有 CaTiO₃ 4 %（石灰 + 二氧化钛自做）→ 温度特性 Y5V
 *    （−55~+85 °C 内 −82/+22 %），不是 X7R（±15 %）
 *    升级条件：`mat/magnesia` 有条目，Dy/La 没有分离链；两者都不在本轮白名单 → 记条件。
 * ⑦ 925 °C 靠火色判温（±30 °C），而银熔点 961 °C —— **余量只有 31 °C**
 *    升级条件：`std/photoelectric-pyrometer-general` 已有（高温炉在用），
 *    但不在本轮 std/ 白名单 → 记条件。超温那批 = 内电极熔断短路。
 * ⑧ 没有电容表 → 交付的 tolerance 是**设计值，未检**
 *    升级条件：LCR 电桥 + 标准电容（`data/machine/se-detector.ts:171` 已记"本层没有电容表"）。
 * ⑨ 镀槽没有滚筒 → 接触点漏镀 5–10 %（问五）
 *    升级条件：滚筒四件 + 改 plating.ts 的 composedOf。
 * ⑩ 银电极这一档（本文件交付的那一档）→ 只到 0.022 µF
 *    升级**路线**：**已建：`make/mlcc-ni-sintered`（mlcc.ts:1112）**（镍电极、1.5 µm 介质、120 层、0402、1 µF）
 *    —— `gives` 窗口 0.1–1 µF 写了，但**规格不够、今天走不通**：
 *    ① **已闭合**：镍链通了（`make/nickel`，ores.ts:216；浮选药剂 `make/flotation-reagent`，reagents.ts:265）；② 还原气氛仍卡在 #23；③ 生带 **20–30 µm** 对 **2–5 µm** 仍 `functional-lost`（报告 `prop_unfilled` 记的就是这一条），差 4–15 倍。
 *    这条路线写在数据里不是为了好看，是为了让"差多少"有个能算的窗口。
 * ```
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三处模型表示不出来的东西（照实写，不绕过）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ① **气氛炉的 "oxygen_ppm 0–50" 是一个能力声明，不是一个测量结果。**
 *    `plant/atmosphere-furnace` 的 holds 说它能把氧维持在 0–50 ppm，于是
 *    `make/mlcc-ni-sintered` 写 `oxygen_ppm ∈ [1e-8, 1e-5]` 时校验会**通过** ——
 *    而它既没有测氧的手段，也没有把氧压到 10⁻⁵ ppm 的手段（要 H₂/H₂O 缓冲 + 露点计）。
 *    这是与 #23 另外三处同型的一处：模型过了，工艺没过。**别把校验通过当成能做。**
 *
 * ② **容量是算出来的，不是量出来的。** `capacitance` 的窗口来自 C = ε₀εr·A·n/t 与
 *    几何公差（面积 ±8 %、层厚 ±10 %、εr ±8 %），不是来自任何一次测量。
 *    `tolerance` 因此是**设计公差**。这句必须留在数据里，否则下一个读的人会以为
 *    那 15–20 % 是检出来的。
 *
 * ③ **叠层与切割的成品率没有任何数据支撑。** 本文件按"切割 30 % 边角 + 印刷废 10 %"
 *    折进生带用量（1.28 kg → 1.2 kg/批），那是个**量级假设**，不是查来的数。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 白名单（本文件自己划的，违者编译不过）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * uses 只碰这些外部条目：mat/titanium、mat/sulfuric-acid、mat/hcl、mat/carbon、
 * mat/silver、mat/nickel、mat/tin、mat/oxygen、mat/nitrogen、mat/lime、mat/water、
 * mat/tailings、mat/phenolic-resin、mars/regolith。std/ 一个都不碰（新条目不在 std/ 白名单里，
 * 所以本文件的产品是 `std/mlcc-general` 这个**新**标准件，而不是借用别人的）。
 * 设备只用 82 台里的：lathe、plant/robot、plant/press、plant/kiln、
 * plant/atmosphere-furnace、plant/resistance-furnace、plant/high-temp-furnace、
 * plant/wet-bench、plant/plating-bath、plant/ore-beneficiary、plant/water-polisher。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目
// ═══════════════════════════════════════════════════════════════════════════

export const MLCC_ITEMS: readonly Item[] = [
  /**
   * 硫酸钡。**本层的"重晶石"是人造出来的**：风化层 → 盐酸浸出 → 硫酸沉钡。
   *
   * 它不是矿物，是化学沉淀物，所以 purity 只能到 92–96 %：钡沉下来的同时
   * 把钙也带下来一部分（CaSO₄），那 4–8 % 就是它。
   *
   * 真实的重晶石矿含 BaSO₄ 85–98 %、重选后 95 % 以上 —— 火星没有这种矿，
   * 只有 300 ppm 的散装钡（问一）。
   */
  { id: 'mat/barium-sulfate', name: '硫酸钡', unit: 'kg', category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 80, max: 99, unit: '%', dir: 'atLeast' }] },

  /**
   * 硫化钡（黑灰）。重晶石碳热还原的产物：BaSO₄ + 2C → BaS + 2CO₂。
   *
   * 它是**水溶性**的（这是整条路线的关键：溶解 → 过滤 → 只把钡带走，
   * 未反应的重晶石与碳渣留在滤纸上）。也是剧毒 + 遇酸放 H₂S。
   *
   * purity 只有 55–90 %：黑灰里混着未反应的 BaSO₄、过量碳、灰分。
   */
  { id: 'mat/barium-sulfide', name: '硫化钡', unit: 'kg', category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 50, max: 95, unit: '%', dir: 'atLeast' }] },

  /** 碳酸钡。碳化的产物：BaS + CO₂ + H₂O → BaCO₃↓ + H₂S。钛酸钡的钡源。 */
  { id: 'mat/barium-carbonate', name: '碳酸钡', unit: 'kg', category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 90, max: 99.9, unit: '%', dir: 'atLeast' }] },

  /**
   * 窑气。**为什么要建这个条目**（本文件唯一一个自己造的中气体）：
   *
   * 碳化段要 CO₂，而 `mat/co2` 不在本轮的 uses 白名单里。可是还原段的尾气本来就是
   * CO₂ —— BaSO₄ + 2C → BaS + 2CO₂，每 1000 kg 重晶石产 377 kg CO₂，而碳化段
   * 每 1000 kg 硫化钡只要 260 kg。**一半都用不完**，这正是工厂里"烟气回用"的做法。
   *
   * 把它写成条目，两段的账就都是平的：
   *   还原 1000 + 103 = 726 BaS + 377 窑气   （严丝合缝）
   *   碳化 726 + 189 + 77 = 846 BaCO₃ + 146 H₂S（H₂S 那 146 kg 走 unbalanced_zh）
   *
   * 不建这个条目，两条路线就只能在两边各挂一句 unbalanced_zh —— 那等于把一笔
   * 算得清的账推给注释。
   */
  { id: 'mat/kiln-gas', name: '窑气', unit: 'kg', category: 'material',
    props: [{ param: 'co2', kind: 'range', min: 40, max: 99, unit: '%', dir: 'atLeast' }] },

  /**
   * 二氧化钛。**本层没有钛白粉链**（硫酸法要钛铁矿、氯化法要 900 °C 氯化炉 + 氯气），
   * 只有海绵钛（`make/titanium-kroll`，50 kWh/kg）。所以这里的 TiO₂ 是**把钛烧出来的**：
   *
   *   Ti + O₂ → TiO₂      47.87 + 32.00 = 79.87，即 1 kg Ti → 1.668 kg TiO₂
   *
   * 工业上钛白粉 2–3 $/kg，这条路线贵两个数量级 —— 但它用的是本层**已有**的料，
   * 而且 TiO₂ 在 BaTiO₃ 里只占 34 %（1 kg BaTiO₃ 要 0.342 kg TiO₂ = 0.205 kg Ti）。
   * 升级路线见文件头 ⑩ 之前那一条：`mat/ilmenite`（TiO₂ 47.4 %）有条目，
   * 走硫酸法能把这个数降到 1/5 —— 但它不在本轮 uses 白名单里。
   */
  { id: 'mat/titanium-dioxide', name: '二氧化钛', unit: 'kg', category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 95, max: 99.9, unit: '%', dir: 'atLeast' }] },

  /**
   * 钛酸钡（BaTiO₃）。介质的主晶相。固相反应：
   *
   *   BaCO₃ + TiO₂ → BaTiO₃ + CO₂↑     197.34 + 79.87 = 233.19 + 44.01
   *
   * 1 kg BaTiO₃ 要 BaCO₃ 0.846 kg、TiO₂ 0.342 kg，放出 CO₂ 0.189 kg（那 189 kg
   * 就是这条路线 unbalanced 的那一半）。
   *
   * d50 1.5–4 µm：固相反应出来的是**烧结块**，要磨细才轮到介质粉那一步。
   */
  { id: 'mat/barium-titanate', name: '钛酸钡', unit: 'kg', category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 90, max: 99.5, unit: '%', dir: 'atLeast' },
      { param: 'd50', kind: 'range', min: 0.1, max: 10, unit: 'µm', dir: 'atMost' },
    ] },

  /**
   * MLCC 介质粉。BaTiO₃ 96 % + 钛酸钙 4 %，球磨到 D50 0.3–1.0 µm。
   *
   * 掺的那 4 % 是**钛酸钙**（CaTiO₃），不是工业上的 Dy₂O₃/MgO/MnCO₃：
   * 本层没有稀土分离、没有镁的化合物（`mat/magnesia` 有条目但不在白名单）。
   * CaTiO₃ 4 % 能把 125 °C 的居里峰削平并挪到 100 °C 附近 —— 温度特性好一档，
   * 但仍不是 X7R（±15 %），是 Y5V（−55~+85 °C 内 −82/+22 %）。
   */
  { id: 'mat/mlcc-dielectric-powder', name: 'MLCC 介质粉', unit: 'kg', category: 'material',
    props: [{ param: 'd50', kind: 'range', min: 0.1, max: 2, unit: 'µm', dir: 'atMost' }] },

  /**
   * 有机载体。**本层只能用酚醛 + 水**：
   *
   *   工业    PVB（聚乙烯醇缩丁醛）+ 乙醇/甲苯 + 分散剂 + 增塑剂
   *   本层    resole 型酚醛 40 % + 水 60 %
   *
   * 选 resole 是因为它**水溶**（A 阶段带大量羟甲基，能溶于水）——
   * 这是"没有乙醇/甲苯"下唯一能做成载体的东西。代价两条：热固性（生带一固化就脆）、
   * 残碳 40–50 %（排胶排不干净，见 `make/mlcc-green-tape`）。
   */
  { id: 'mat/mlcc-vehicle', name: '有机载体', unit: 'kg', category: 'material',
    props: [{ param: 'solid', kind: 'range', min: 30, max: 60, unit: '%', dir: 'atLeast' }] },

  /**
   * 流延浆料。粉 45 % + 载体 + 水。**固含量只有 45 %，工业是 55–65 %**
   * —— 没有分散剂，粉在水里絮凝，稀了才流得动。
   */
  { id: 'mat/mlcc-slurry', name: '流延浆料', unit: 'kg', category: 'material',
    props: [{ param: 'solidLoading', kind: 'range', min: 35, max: 70, unit: '%', dir: 'atLeast' }] },

  /**
   * 生带（green tape）。刮刀流延 + 干燥之后的干膜，**20–30 µm**。
   *
   * 工业下限 5 µm（薄型 MLCC 用 1–3 µm 生带），本层的下限卡在 20 µm：
   * 酚醛载体脆 + 没有分散剂 + 没有真空脱泡（`plant/wet-bench` 是正压 100–500 kPa，
   * 抽不了真空）→ 膜薄了就有针孔，一烧结就是个洞。
   */
  { id: 'mat/mlcc-green-tape', name: '生带', unit: 'kg', category: 'material',
    props: [{ param: 'thickness', kind: 'range', min: 2, max: 100, unit: 'µm' }] },

  /**
   * 内电极浆料。银浆（本文件交付的）或镍浆（`make/mlcc-electrode-paste-ni`，断在镍链上）。
   *
   * 两者是同一个条目、两条路线 —— 与 `mat/sulfuric-acid` 的 98 % 与 30–50 % 同型：
   * 条目只说"有金属这个属性"，值在路线上。
   */
  { id: 'mat/mlcc-electrode-paste', name: '内电极浆料', unit: 'kg', category: 'material',
    props: [
      { param: 'metal', kind: 'enum', values: ['Ag', 'Ni'] },
      { param: 'solidLoading', kind: 'range', min: 50, max: 90, unit: '%', dir: 'atLeast' },
    ] },

  /** 端浆。银 80 %、固含量 80 % —— 端头要厚、要快干、要能烧成连着的一层壳。 */
  { id: 'mat/mlcc-terminal-paste', name: '端浆', unit: 'kg', category: 'material',
    props: [
      { param: 'metal', kind: 'enum', values: ['Ag', 'Cu'] },
      { param: 'solidLoading', kind: 'range', min: 50, max: 95, unit: '%', dir: 'atLeast' },
    ] },

  /**
   * **片式多层陶瓷电容（MLCC）**。本文件的产品。
   *
   * 与 `std/capacitor-film-general` 是**互补**不是子集：那一档是厘米级插件、200–630 V、
   * 用于谐振与滤波；这一档是毫米级贴片、16–50 V、用于去耦。两者在电路里不能互换
   * （前者 ESL 10 nH 量级，1 MHz 以上就是个电感）。
   *
   * 五个属性就是它的规格：容量、耐压、封装、层数、公差。**值都在路线上**：
   * 银电极那条交付 0805/25 层/0.012–0.022 µF/25–50 V/±15–20 %；
   * 镍电极那条交付 0402/120 层/0.1–1 µF/16 V/±5–10 %（今天走不通，见文件头 ⑩）。
   *
   * ⚠️ 不写 `mass`：条目横跨 0402（约 2 mg）到 0805（约 14 mg），一个数说不清；
   * 而且 `mass` 一旦写上，`validate` 会拿它去核每一条产出路线的 kg 投料 ——
   * 一条出 10 万只、投 1.2 kg 生带的路线会立刻报 `mass_mismatch`。这是模型的正确行为：
   * 件与 kg 是两个刻度。要称重，写进零件清单那一侧。
   */
  {
    id: 'std/mlcc-general',
    name: '片式多层陶瓷电容',
    unit: '件',
    category: 'part',
    props: [
      { param: 'capacitance', kind: 'range', min: 0.001, max: 10, unit: 'µF' },
      { param: 'ratedVoltage', kind: 'range', min: 10, max: 100, unit: 'V' },
      { param: 'caseSize', kind: 'enum', values: ['0402', '0603', '0805'] },
      { param: 'layerCount', kind: 'range', min: 5, max: 500, unit: '层', dir: 'atLeast' },
      { param: 'tolerance', kind: 'range', min: 1, max: 30, unit: '%', dir: 'atMost' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线
// ═══════════════════════════════════════════════════════════════════════════

export const MLCC_ROUTES: readonly Route[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 2.1 钡：风化层 → 硫酸钡
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 硫酸钡（湿法）。**钡从 300 ppm 的风化层里来。**
     *
     * ```
     * 风化层 2900 + 盐酸 2900 + 硫酸 45 → 硫酸钡 1183 + 尾矿 4662
     *
     * 2900 × 300 ppm × 80 % = 0.696 kg Ba = 1.183 kg BaSO₄   ← 就是 1 kg BaCO₃ 的钡
     * ```
     *
     * 为什么盐酸是 2900 kg（1:1 液固）而硫酸只有 45 kg：**酸浸那一步是过量酸泡土**，
     * 而沉钡只要化学计量的酸 —— 0.696 kg Ba 要 0.497 kg H₂SO₄。多出来的 44.5 kg
     * 全花在钙上：风化层含钙 5 %（145 kg Ca），沉钡时的 pH 1.5 把 18 kg 钙也带下来，
     * 那就是 62 kg CaSO₄ —— **硫酸钡纯度只能到 92–96 % 的全部原因。**
     *
     * 尾矿 4662 kg 是"其余的一切"：没溶的硅酸盐、被酸溶掉的铁铝钙镁、用剩的酸。
     * 它不是一个数，是一笔账：5845 − 1183 = 4662。
     *
     * 四道工序全落在 `plant/ore-beneficiary`（破碎磨矿，选矿厂本来就是干这个的）
     * 与 `plant/wet-bench`（浸出、过滤、沉淀 —— 都要 100–300 kPa：火星 0.6 kPa 下
     * 80 °C 的水直接开）。
     */
    id: 'make/barium-sulfate',
    name: '硫酸钡制备',
    produces: [
      { item: 'mat/barium-sulfate', qty: q(1183), gives: [{ param: 'purity', kind: 'range', min: 92, max: 96 }] },
      { item: 'mat/tailings', qty: q(4662) },
    ],
    uses: [
      { anyOf: [{ item: 'mars/regolith', qty: q(2900) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(2900) }] },
      // 现有路线只交 96–98% 浓硫酸；90% 下限是写宽了。
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(45), need: [{ param: 'concentration', kind: 'range', min: 96, max: 98 }], onRelax: 'functional-kept' }] },
    ],
    needs: [],
    steps: [
      { note_zh: '破碎与磨矿到 <50 µm（钡在长石颗粒里，磨不细就浸不出来）', performedBy: 'plant/ore-beneficiary', under: [{ param: 'pressure', min: 100, max: 300 }] },
      {
        note_zh: '6 M 盐酸浸出：80 °C、2 h、液固比 1:1 —— 钡成 BaCl₂ 进液',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 70, max: 85 }, { param: 'pressure', min: 100, max: 300 }],
      },
      { note_zh: '过滤与洗涤（滤渣即尾矿）', performedBy: 'plant/wet-bench', under: [{ param: 'pressure', min: 100, max: 300 }] },
      {
        note_zh: '加硫酸沉钡：pH 1.5，BaSO₄ 比 CaSO₄ 先沉 —— 分步沉淀就靠这一步的 pH',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 40 }, { param: 'pressure', min: 100, max: 300 }],
      },
    ],
  },

  {
    /**
     * 硫酸钡（石灰烧结法）—— **第①条降级的升级路线**（文件头 ①）。
     *
     * ```
     * 风化层 2450 + 石灰 1200 + 盐酸 2450 + 硫酸 38 → 硫酸钡 1183 + 尾矿 4955
     *
     * 2450 × 300 ppm × 95 % = 0.698 kg Ba = 1.187 kg BaSO₄
     * ```
     *
     * 原理：钡锁在长石与玻璃相里，盐酸常温浸不动它。**石灰烧结**（风化层 + 石灰
     * 1200–1250 °C，水淬）把长石解聚成可酸溶的钙铝硅酸盐 —— 这是铝工业从正长岩
     * 提氧化铝用过的同一招（lime-sinter process）。浸出率 80 % → 95 %。
     *
     * 代价：每 1183 kg 硫酸钡要烧 1200 kg 石灰石，而石灰是从石膏热分解来的
     * （`mat/lime`，chain.ts:162）。**换来的是通量不是质量**：少挖 450 kg 土（−16 %）、
     * 多烧一炉 1200 °C 的料。电力由种子聚变装置供给，装置可复制扩容、不是免费 ——
     * 这条前提在本项目里成立。
     */
    id: 'make/barium-sulfate-lime-sinter',
    name: '硫酸钡制备',
    produces: [
      { item: 'mat/barium-sulfate', qty: q(1183), gives: [{ param: 'purity', kind: 'range', min: 90, max: 95 }] },
      { item: 'mat/tailings', qty: q(4955) },
    ],
    uses: [
      { anyOf: [{ item: 'mars/regolith', qty: q(2450) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(1200) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(2450) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(38) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '配料与磨细（风化层 + 石灰 1:0.5）', performedBy: 'plant/ore-beneficiary', under: [{ param: 'pressure', min: 100, max: 300 }] },
      {
        note_zh: '石灰烧结 1200–1250 °C：长石解聚成可酸溶的钙铝硅酸盐',
        performedBy: 'plant/high-temp-furnace',
        under: [{ param: 'temperature', min: 1200, max: 1250 }],
      },
      {
        note_zh: '水淬 + 盐酸浸出 70–85 °C（浸出率 95 %）',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 70, max: 85 }, { param: 'pressure', min: 100, max: 300 }],
      },
      { note_zh: '过滤、加硫酸沉钡（pH 1.5）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 40 }, { param: 'pressure', min: 100, max: 300 }] },
    ],
  },

  {
    /**
     * 硫化钡（黑灰）—— 段①的正身：重晶石碳热还原。
     *
     * ```
     * BaSO₄ + 2C → BaS + 2CO₂     233.39 + 24.02 = 169.39 + 88.02
     * 硫酸钡 1183 + 碳 122 → 硫化钡 1015 + 窑气 290
     * ```
     *
     * **碳为什么是 122 而不是理论的 103**：`plant/kiln` 只有温度一个窗口
     * （1200–1750，`data/material/thermal.ts:200`），它是**氢氧焰**的窑 ——
     * 炉膛是氧化气氛，料层表面的碳会被烧掉，只有料层内部是还原的。
     * 所以碳要过量 18 %，而转化率只能到 65 %（工业黑灰窑 60–80 %，同一个原因）。
     *
     * **还有一个 200 °C 的错位要说清**：重晶石还原的历史温区是 1000–1200 °C
     * （低温端靠长时间保温就够），而这座窑的下限就是 1200 —— 1000–1199 这一段
     * **进不去**。所以本路线只能 1200–1250：高 100 °C 会让少量 BaS 被 CO₂ 回氧化，
     * 那一份已经算在 65 % 的转化率里（不是另加的损失）。
     *
     * 65 % 的账：BaS 558 kg（占产物 55 %）、未反应 BaSO₄ 414 kg、灰分与残碳 43 kg，
     * 合计 1015 kg。CO₂ 290 kg 进窑气。**这个 55–75 % 的纯度窗口是本层窑的天花板，
     * 不是配方** —— 升级路线是把它搬进气氛炉，见下一条。
     */
    id: 'make/barium-sulfide',
    name: '硫化钡制备',
    produces: [
      { item: 'mat/barium-sulfide', qty: q(1015), gives: [{ param: 'purity', kind: 'range', min: 55, max: 75 }] },
      { item: 'mat/kiln-gas', qty: q(290), gives: [{ param: 'co2', kind: 'range', min: 70, max: 95 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/barium-sulfate', qty: q(1183) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(122), need: [{ param: 'ash', kind: 'range', max: 10, dir: 'atMost' }], onRelax: 'functional-kept' }] },
    ],
    needs: [],
    performedBy: 'plant/kiln',
    under: [{ param: 'temperature', min: 1200, max: 1250 }],
  },

  {
    /**
     * 硫化钡（气氛炉版）—— **第②条降级的升级路线**（文件头 ②）。
     *
     * ```
     * 硫酸钡 1183 + 碳 110 + 氮 30 → 硫化钡 920 + 窑气 403
     *
     * 还原 88 %：BaS 756 kg（占产物 82 %）、未反应 BaSO₄ 137、灰 27
     * 碳回到理论值 110（只多 7 %，因为炉膛没有火焰来烧它）
     * ```
     *
     * `plant/atmosphere-furnace` 有**第二个条件**：oxygen_ppm 0–50
     * （`data/material/carbide.ts:188`，与碳化钨烧结共用同一台设备）。料在石墨管里、
     * 氮置换三次，碳就不会被烧掉，转化率从 65 % 抬到 88 %。
     *
     * 代价：间歇炉、装料少（一批 1.3 t 而不是回转窑的连续料流）、30 kg 氮置换。
     * 而且这条路线**同样踩在 #23 上**：那 0–50 ppm 是能力声明，没人测过。
     */
    id: 'make/barium-sulfide-reduced',
    name: '硫化钡制备',
    produces: [
      { item: 'mat/barium-sulfide', qty: q(920), gives: [{ param: 'purity', kind: 'range', min: 80, max: 90 }] },
      { item: 'mat/kiln-gas', qty: q(403), gives: [{ param: 'co2', kind: 'range', min: 85, max: 99 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/barium-sulfate', qty: q(1183) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(110) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(30) }] },
    ],
    needs: [],
    performedBy: 'plant/atmosphere-furnace',
    under: [{ param: 'temperature', min: 1200, max: 1250 }, { param: 'oxygen_ppm', min: 0, max: 50 }],
  },

  {
    /**
     * 碳酸钡。**黑灰水浸 + 窑气碳化**——钡链的第二段，也是它的分选段。
     *
     * ```
     * BaS + CO₂ + H₂O → BaCO₃↓ + H₂S↑      169.39 + 44.01 + 18.02 = 197.34 + 34.08
     * 硫化钡 1048 + 窑气 223 + 水 91 → 碳酸钡 1000 + 尾矿 189
     * ```
     *
     * 为什么这道工序能把 82 % 的黑灰变成 92–96 % 的碳酸钡：**BaS 溶于水，
     * BaSO₄ 与碳不溶**。水浸把钡带走、把杂质留在滤纸上（那 189 kg 就是它），
     * 滤液再通窑气 —— 碳酸钡沉出来，硫化氢进尾气。
     *
     * `needs` 那一个 `purity ≥ 80` 是**这条路线真正的门槛**：它只要气氛炉那批灰。
     * 回转窑的 55–75 % 灰也能用，只是每 1000 kg 碳酸钡要吃 1562 kg 灰、
     * 多出 703 kg 返回料 —— 那是 `onRelax: functional-kept`（还是碳酸钡，只是吃得多）。
     *
     * 173 kg H₂S 走 `unbalanced_zh`：硫回收（克劳斯法要 H₂S + SO₂ + 催化剂）不在本层，
     * 它是真损失，不是记账缺口。
     */
    id: 'make/barium-carbonate',
    name: '碳酸钡制备',
    produces: [
      { item: 'mat/barium-carbonate', qty: q(1000), gives: [{ param: 'purity', kind: 'range', min: 92, max: 96 }] },
      { item: 'mat/tailings', qty: q(189) },
    ],
    uses: [
      {
        anyOf: [{
          item: 'mat/barium-sulfide',
          qty: q(1048),
          need: [{ param: 'purity', kind: 'range', min: 80, dir: 'atLeast' }],
          onRelax: 'functional-kept',
        }],
      },
      { anyOf: [{ item: 'mat/kiln-gas', qty: q(223) }] },
      { anyOf: [{ item: 'mat/water', qty: q(91) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '黑灰水浸：70–85 °C，BaS 溶、BaSO₄ 与碳不溶（溶解这一步就是分选）',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 70, max: 85 }, { param: 'pressure', min: 100, max: 300 }],
      },
      { note_zh: '过滤（滤渣返回还原段 —— 模型没有回流，只能记成尾矿）', performedBy: 'plant/wet-bench', under: [{ param: 'pressure', min: 100, max: 300 }] },
      {
        note_zh: '碳化：滤液通窑气到 pH 8，BaCO₃ 沉出、H₂S 进尾气',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 30, max: 50 }, { param: 'pressure', min: 100, max: 300 }],
      },
      { note_zh: '过滤、洗涤、120 °C 干燥', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 100, max: 120 }, { param: 'pressure', min: 100, max: 300 }] },
    ],
    unbalanced_zh:
      '硫化钡 1048 + 窑气 223 + 水 91 → 碳酸钡 1000 + 尾矿 189；余 173 kg 是 H₂S 进尾气（硫回收不在本层，这是真损失）',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.2 钛与钛酸钡
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 二氧化钛。**把海绵钛在氧里烧掉** —— 这是本层拿到 TiO₂ 的唯一一条路。
     *
     * ```
     * Ti + O₂ → TiO₂     47.87 + 32.00 = 79.87
     * 钛 599 + 氧 401 → 二氧化钛 1000
     * ```
     *
     * 599 × 79.87/47.87 = 999.3、401/31.998 × 47.867 = 599.9 —— 两个方向都合得上。
     *
     * ⚠️ 钛是**自燃性**的：海绵钛细粉在 600 °C、氧里会自己烧起来。所以先 400 °C
     * 缓慢氧化生成一层壳，再升到 800–1000 °C 烧透 —— 一步到位会烧掉一炉。
     *
     * 代价（文件头 ③ 的邻居）：这条 TiO₂ 的料是 50 kWh/kg 的 Kroll 钛，比钛白粉贵
     * 两个数量级。它在 BaTiO₃ 里只占 34 %（0.205 kg Ti/kg BaTiO₃），所以还撑得住 ——
     * 但它把"钛白粉链"这个缺口的价钱标了出来：`mat/ilmenite` 条目有（titanium.ts:312），
     * 硫酸法能把 TiO₂ 的成本降一个数量级，而 ilmenite 不在本轮白名单里。
     */
    id: 'make/titanium-dioxide',
    name: '二氧化钛制备',
    produces: [
      { item: 'mat/titanium-dioxide', qty: q(1000), gives: [{ param: 'purity', kind: 'range', min: 96, max: 98 }] },
    ],
    uses: [
      {
        anyOf: [{
          item: 'mat/titanium',
          qty: q(599),
          need: [{ param: 'purity', kind: 'range', min: 98, dir: 'atLeast' }],
          // Kroll 海绵钛交付 99.5–99.7 %，够。掉到 98 % 的二级钛带 0.2 % 氧，
          // 烧出来的 TiO₂ 里氧已经过量，对 BaTiO₃ 的化学计量无害 —— 功能还在。
          onRelax: 'functional-kept',
        }],
      },
      { anyOf: [{ item: 'mat/oxygen', qty: q(401) }] },
    ],
    needs: [],
    performedBy: 'plant/resistance-furnace',
    under: [{ param: 'temperature', min: 800, max: 1000 }],
  },

  {
    /**
     * 钛酸钡。固相反应，段②。
     *
     * ```
     * BaCO₃ + TiO₂ → BaTiO₃ + CO₂↑      197.34 + 79.87 = 233.19 + 44.01
     * 碳酸钡 846 + 二氧化钛 342 → 钛酸钡 1000（+ CO₂ 189 逸出）
     * ```
     *
     * 846 × 233.19/197.34 = 999.6、342 × 233.19/79.87 = 998.6 —— 两条路径都对得上。
     * 189 kg CO₂ 走 `unbalanced_zh`：它是反应放出来的气体，不是账差了。
     *
     * 温度：工业固相法 1100–1250 °C、2–4 h。**本层只能 1050–1100** ——
     * `plant/resistance-furnace` 的上限就是 1100（`data/machine/resistance-furnace.ts:169`），
     * 再上去要 `plant/high-temp-furnace`，而那台的温区是 1100–1600，低端不够。
     * 低温长时（4 h）能把转化率追到 94–97 %，但晶粒长得慢、d50 偏细 —— 这对介质粉是好事。
     *
     * 混料用**车床卡球磨罐**：本层没有球磨机（82 台里没有这一台），
     * 车床是唯一能连续转 8 h 的现成主轴。罐里 45 钢球，磨介污染见下一条。
     */
    id: 'make/barium-titanate',
    name: '钛酸钡制备',
    produces: [
      {
        item: 'mat/barium-titanate',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 94, max: 97 },
          { param: 'd50', kind: 'range', min: 1.5, max: 4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/barium-carbonate', qty: q(846) }] },
      { anyOf: [{ item: 'mat/titanium-dioxide', qty: q(342) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '球磨混料 8 h（车床卡罐 60 r/min，45 钢球）', performedBy: 'lathe' },
      {
        note_zh: '固相反应 1050–1100 °C、4 h（低温长时，补回 200 °C 的温差）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 1050, max: 1100 }],
      },
    ],
    unbalanced_zh:
      '碳酸钡 846 + 二氧化钛 342 = 1188 → 钛酸钡 1000；余 189 kg 是反应放出的 CO₂（BaCO₃ 44.01/197.34 = 22.3 %）',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.3 介质粉
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 介质粉。BaTiO₃ 96 % + 钛酸钙 4 %，球磨 48 h 到 D50 0.3–1.0 µm。段③。
     *
     * ```
     * 钛酸钡 960 + 石灰 16.5 + 二氧化钛 23.5 → 介质粉 1000
     *
     * CaTiO₃ 4 % = 40 kg：CaO 56.08 + TiO₂ 79.87 → CaTiO₃ 135.98
     *                  16.5 × 135.98/56.08 = 40.0、23.5 × 135.98/79.87 = 40.0 ✓
     * ```
     *
     * **为什么掺的是钛酸钙而不是 Dy₂O₃/MgO/MnCO₃**：稀土没有分离链，镁的化合物
     * 不在本轮白名单（`mat/magnesia` 有条目）。而石灰与二氧化钛都有 —— CaTiO₃
     * 是 1950 年代 X7R 最早用的那一种改性剂（把 125 °C 的居里峰削平并挪低），
     * 它确实有用，只是不够：交付的是 Y5V 档，不是 X7R。
     *
     * 磨介是 45 钢球 → **铁污染 0.05–0.2 %**。Fe 在 BaTiO₃ 里是受主，
     * 会把绝缘电阻拉下来一档。这是"能磨细"与"磨得干净"之间那条缝。
     */
    id: 'make/mlcc-dielectric-powder',
    name: '介质粉制备',
    produces: [
      { item: 'mat/mlcc-dielectric-powder', qty: q(1000), gives: [{ param: 'd50', kind: 'range', min: 0.3, max: 1.0 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/barium-titanate', qty: q(960) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(33, 2) }] },
      { anyOf: [{ item: 'mat/titanium-dioxide', qty: q(47, 2) }] },
    ],
    needs: ['plant/water-polisher'],
    steps: [
      { note_zh: '配料 + 球磨 48 h（车床摇罐，45 钢球，水介质）', performedBy: 'lathe' },
      {
        note_zh: '干燥 100–120 °C、过 100 目筛',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 100, max: 120 }, { param: 'pressure', min: 100, max: 300 }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.4 流延：载体 → 浆料 → 生带
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 有机载体。**酚醛 40 % + 水 60 %** —— 本层没有 PVB，也没有乙醇/甲苯。
     *
     * resole 型酚醛（A 阶段，带羟甲基）能溶于水，这是"没有溶剂"下唯一走得通的路。
     * 60–80 °C 搅拌 2 h 到透明。它同时也是**分散剂**（羟基润湿 BaTiO₃ 表面）——
     * 弱得可怜，但聊胜于无。
     *
     * 两条代价写在后面两条路线上：热固性（生带一固化就脆）、残碳 40–50 %。
     */
    id: 'make/mlcc-vehicle',
    name: '有机载体制备',
    produces: [
      { item: 'mat/mlcc-vehicle', qty: q(1000), gives: [{ param: 'solid', kind: 'range', min: 38, max: 42 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(400) }] },
      { anyOf: [{ item: 'mat/water', qty: q(600) }] },
    ],
    needs: ['plant/water-polisher'],
    performedBy: 'plant/wet-bench',
    under: [{ param: 'temperature', min: 60, max: 80 }, { param: 'pressure', min: 100, max: 300 }],
  },

  {
    /**
     * 流延浆料。粉 1000 + 载体 700 + 水 500 = 2200，**固含量 45 %**。
     *
     * 工业浆料是 55–65 % 固含量、黏度 2000–4000 mPa·s。这里的 45 % 不是配方选择，
     * 是**没有分散剂的结果**：粉在水里絮凝成团，稀了才流得动。
     * 稀了的三条后果：干燥收缩 42 %（工业 30 %）、生带密度低、烧结收缩大到 18–22 %。
     *
     * 也没有真空脱泡（`plant/wet-bench` 是正压 100–500 kPa，抽不了真空）→
     * 浆料里的气泡就是生带上的针孔，针孔就是烧结后的击穿点。
     */
    id: 'make/mlcc-slurry',
    name: '流延浆料制备',
    produces: [
      { item: 'mat/mlcc-slurry', qty: q(2200), gives: [{ param: 'solidLoading', kind: 'range', min: 43, max: 47 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/mlcc-dielectric-powder', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/mlcc-vehicle', qty: q(700) }] },
      { anyOf: [{ item: 'mat/water', qty: q(500) }] },
    ],
    needs: ['plant/water-polisher'],
    performedBy: 'plant/wet-bench',
    under: [{ param: 'temperature', min: 20, max: 30 }, { param: 'pressure', min: 100, max: 300 }],
  },

  {
    /**
     * 生带。刮刀流延，干膜 **20–30 µm**。段④。
     *
     * ```
     * 浆料 2200 → 生带 1280（+ 920 kg 水汽）
     * 1280 = 粉 1000 + 载体里的树脂 280 —— 干膜里没有水
     * ```
     *
     * 刮刀与载带：载带用不锈钢带（0.5 mm 冷轧、抛光），刀口 200 µm、走刀 0.1 m/s。
     * 干后生带靠酚醛的固化收缩自己离型 —— 这是选它的一个意外好处。
     *
     * **921 kg 水走 `unbalanced_zh`**：`mat/water-vapor` 有条目（chain.ts:127）
     * 但不在本轮白名单，所以干燥段的水只能记成"走了"。
     *
     * 20 µm 这个下限是本文件最重要的一处降级：工业 5 µm（高容 MLCC 用 1–3 µm），
     * 本层卡在三件事上 —— 酚醛固化后脆、没有分散剂、没有真空脱泡。
     * **介质薄不下去，容量就上不去**（问二）。
     */
    id: 'make/mlcc-green-tape',
    name: '生带制备',
    produces: [
      { item: 'mat/mlcc-green-tape', qty: q(1280), gives: [{ param: 'thickness', kind: 'range', min: 20, max: 30 }] },
    ],
    uses: [{ anyOf: [{ item: 'mat/mlcc-slurry', qty: q(2200) }] }],
    needs: [],
    steps: [
      { note_zh: '刮刀流延：不锈钢载带、刀口 200 µm、0.1 m/s（本层没有流延机，机器人拉刀）', performedBy: 'plant/robot' },
      {
        note_zh: '隧道干燥 40–60 °C（慢干：快干必裂）',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 40, max: 60 }, { param: 'pressure', min: 100, max: 300 }],
      },
    ],
    unbalanced_zh: '浆料 2200 → 生带 1280；余 920 kg 是干燥段蒸发的水（mat/water-vapor 不在本轮白名单，记成逸出）',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.5 电极浆料
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 内电极银浆。银 70 % + 载体 30 %。
     *
     * ⚠️ **本层的银只有 95 %**（`make/silver-from-sludge`，precious.ts:99，
     * 铜置换法的代价是带 0.5–2 % 铜）。工业电极银要 99.9 %。那 5 % 铜铅在
     * 900–930 °C 的共烧里形成低熔点相，银迁移（Ag⁺ 沿晶界往介质里跑）因此加剧
     * —— 这是本层银电极的第二个代价，第一个是 961 °C 的熔点上限。
     *
     * 银粉要磨到 1–3 µm（车床摇罐 12 h），再三辊轧浆。片状粉比球状粉好：
     * 片状叠起来接触点多，2 µm 的印刷膜才能烧成连续导体。
     */
    id: 'make/mlcc-electrode-paste-ag',
    name: '内电极银浆制备',
    produces: [
      {
        item: 'mat/mlcc-electrode-paste',
        qty: q(1000),
        gives: [
          { param: 'metal', kind: 'enum', oneOf: ['Ag'] },
          { param: 'solidLoading', kind: 'range', min: 68, max: 72 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silver', qty: q(700) }] },
      { anyOf: [{ item: 'mat/mlcc-vehicle', qty: q(300) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '球磨银粉到 1–3 µm（车床摇罐 12 h）', performedBy: 'lathe' },
      { note_zh: '三辊轧浆（片状化 + 排气）', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * 内电极镍浆。**这条路线写在数据里；镍链已通，但仍卡在烧结气氛与镍粉粒度。**
     *
     * 三处，一处比一处硬：
     * ```
     * ① 镍链  已闭合：make/nickel（ores.ts:216，镍 100 + 阳极泥 10 + 渣 290）
     *        + make/flotation-reagent（reagents.ts:265）
     * ② 烧结  镍要还原气氛，#23 那一条（问四）仍卡
     * ③ 粉    镍粉要 0.2–0.5 µm 球状、无氧化层，而本层的磨只能到 0.3 µm 且带铁污染
     * ```
     *
     * 写它的用处不是"留个占位"，是让 `metal` 这个属性有两个值：
     * `make/mlcc-ni-sintered` 要 `metal ∈ {Ni}`，而它的窗口只有这一条路线能给。
     * **"缺什么"因此可以被校验出来，而不是只写在注释里。**
     */
    id: 'make/mlcc-electrode-paste-ni',
    name: '内电极镍浆制备',
    produces: [
      {
        item: 'mat/mlcc-electrode-paste',
        qty: q(1000),
        gives: [
          { param: 'metal', kind: 'enum', oneOf: ['Ni'] },
          { param: 'solidLoading', kind: 'range', min: 68, max: 72 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/nickel', qty: q(700) }] },
      { anyOf: [{ item: 'mat/mlcc-vehicle', qty: q(300) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '球磨镍粉到 0.3–0.5 µm（要惰性气氛，本层没有）', performedBy: 'lathe' },
      { note_zh: '三辊轧浆（同上，仍要惰性气氛）', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * 端浆。银 80 % + 载体 20 %，固含量 80 %。
     *
     * 端头与内电极不是一回事：内电极要薄（2 µm）、要跟介质同步收缩；
     * 端头要厚（20–30 µm）、要能盖住 25 层电极的断面、要在 700–800 °C
     * 烧成一层连着所有内电极的壳。所以固含量高、树脂少、一次涂不上去涂两次。
     *
     * `metal` 声明了两个值（Ag/Cu），但只交付 Ag：**铜端在火星上烧不了**
     * （Cu/Cu₂O 平衡在 800 °C 约 10⁻³ Pa，`plant/resistance-furnace` 是空气炉）——
     * 与镍同一个病，只是轻三个数量级。声明 Cu 是留一个类型位，不是留一条路线。
     */
    id: 'make/mlcc-terminal-paste',
    name: '端浆制备',
    produces: [
      {
        item: 'mat/mlcc-terminal-paste',
        qty: q(1000),
        gives: [
          { param: 'metal', kind: 'enum', oneOf: ['Ag'] },
          { param: 'solidLoading', kind: 'range', min: 78, max: 82 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silver', qty: q(800) }] },
      { anyOf: [{ item: 'mat/mlcc-vehicle', qty: q(200) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.6 成品：印刷、叠层、切割、排胶、共烧、端头、镀
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **片式多层陶瓷电容（银电极档）—— 本文件交付的那一档。** 段⑤⑥。
     *
     * ```
     * 一批 10 万只：生带 1.2 kg + 银浆 0.16 kg + 端浆 0.07 kg
     *              + 镍 7 g（阻挡层）+ 锡 7 g（可焊层）+ 氧 0.5 kg（排胶）
     *
     * 容量  C = ε₀·εr·A·n/t = 8.854e-12 × 1200 × 1.2e-6 × 25 / 16e-6 = 19.9 nF
     * 交付窗口 0.012–0.022 µF（A 1.0–1.3 mm²、t 15–17 µm、εr 1100–1300 三个公差叠起来）
     * 银耗   0.16 × 70 % + 0.07 × 80 % = 0.168 kg / 10 万只 = **1.7 mg/只**（含端头）
     *        ⇒ 1 kg 银 ≈ 59 万只 ⇒ 土耗 14.3 t/kg 银 ⇒ **24 g 风化层/只**
     * ```
     *
     * 十道工序，四台设备接力（机器人、压机、电阻炉、镀槽）。逐段说降级：
     *
     * ```
     * ① 丝印     手工刮板，膜厚 2 µm ±15 %（丝印机 ±3 %）→ 电极边距留 0.2 mm
     * ② 叠层     25 层手工对准，±0.1 mm（叠层机 ±0.02 mm）→ 电极重叠面积只有 60 %
     * ③ 层压     plant/press 是单轴曲轴压（20 MPa），没有温等静压 → 层间密度不均
     * ④ 切割     刀片手切，边角 30 % 报废
     * ⑤ 排胶     450–700 °C、2 °C/min。**酚醛残碳 40–50 %**，PVB 是 <0.1 %。
     *            残碳在 700 °C 烧不干净 → 烧结时局部还原 → 介质半导化 → 漏电
     *            所以排胶段要通**纯氧** 0.5 kg（火星大气 0.6 kPa 只有 0.13 % 氧，
     *            换气量不够，必须补氧）
     * ⑥ 共烧     900–930 °C 空气。银熔点 961 °C，**余量 31 °C**；而电阻炉 350 °C
     *            以上只有测温锥与火色可看（±30 °C，machine/resistance-furnace.ts:169）
     *            → 一批里超温的那几只，内电极熔断，短路
     * ⑦ 端头     银端浆两次涂、700–800 °C 烧端（银不氧化，这是选银的第二个好处）
     * ⑧ 镀镍     50–60 °C、3 µm 阻挡层。**没有镍就跳这一步**（见下面 anyOf 那一段）
     * ⑨ 镀锡     20–30 °C、4 µm 可焊层
     * ⑩ 分选     **没有电容表**（se-detector.ts:171 已记），只按几何抽检 → 见下
     * ```
     *
     * 关于 `tolerance 15–20 %`：这是**设计公差**，不是检出来的。面积 ±8 %、
     * 层厚 ±10 %、εr ±8 % 三个独立公差方和开根 ≈ 15 %，再留一点手工叠层的余量到 20 %。
     * 没有 LCR 电桥，这 15–20 % 就没被任何一次测量证实过 —— 文件头第二节第 ② 条。
     *
     * 关于 `anyOf`（本文件唯一一处用它表达"两档工艺"）：
     * 有镍就镀 3 µm 镍（焊接 5 次不穿），没镍就把锡加厚到 10 µm（焊 2 次就露银）——
     * 这不是配比替代，是**两种镀层结构**，而 anyOf 恰好就是"任选其一"。
     * 镍料已通（`make/nickel`，ores.ts:216），所以两档都可走；仍差 3 µm 镍层的
     * 厚度/结合力量具 —— 数据上只能让两档并存，不能判哪一档真的合格。
     */
    id: 'make/mlcc-ag-fired',
    name: '片式多层陶瓷电容制造',
    produces: [{
      item: 'std/mlcc-general',
      qty: q(100000),
      gives: [
        { param: 'capacitance', kind: 'range', min: 0.012, max: 0.022 },
        { param: 'ratedVoltage', kind: 'range', min: 25, max: 50 },
        { param: 'caseSize', kind: 'enum', oneOf: ['0805'] },
        { param: 'layerCount', kind: 'range', min: 25, max: 25 },
        { param: 'tolerance', kind: 'range', min: 15, max: 20 },
      ],
    }],
    uses: [
      // 生带：10 万只 × 13 mg 净料 = 1.3 kg，按切割 30 % 边角 + 印刷废 10 % 折 1.2 kg
      // （这个成品率是量级假设，不是查来的数 —— 文件头第三节第 ③ 条）
      {
        anyOf: [{
          item: 'mat/mlcc-green-tape',
          qty: q(6, 5),
          need: [{ param: 'thickness', kind: 'range', min: 20, max: 30 }],
          onRelax: 'functional-kept',
        }],
      },
      { anyOf: [{ item: 'mat/mlcc-electrode-paste', qty: q(4, 25), need: [{ param: 'metal', kind: 'enum', oneOf: ['Ag'] }], onRelax: 'functional-lost' }] },
      // 端头：没有银端就只能用铜，而铜端烧不了（要 N₂ 保护）→ functional-lost
      { anyOf: [{ item: 'mat/mlcc-terminal-paste', qty: q(7, 100), need: [{ param: 'metal', kind: 'enum', oneOf: ['Ag'] }], onRelax: 'functional-lost' }] },
      // 阻挡层：镍 3 µm，或（无镍时）把锡加到 10 µm
      { anyOf: [{ item: 'mat/nickel', qty: q(7, 1000) }, { item: 'mat/tin', qty: q(9, 500) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(7, 1000) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 2) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '丝印内电极（银浆、膜厚 2 µm、手工刮板）', performedBy: 'plant/robot' },
      { note_zh: '叠层 25 层（手工对准 ±0.1 mm）', performedBy: 'plant/robot' },
      { note_zh: '层压 20 MPa（单轴，没有温等静压）', performedBy: 'plant/press' },
      { note_zh: '切割成 2.0×1.25 mm 生坯（刀片手切，边角 30 %）', performedBy: 'plant/robot' },
      {
        note_zh: '排胶 450–700 °C、2 °C/min、通纯氧（酚醛残碳 40–50 %，要慢慢烧）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 450, max: 700 }],
      },
      {
        note_zh: '共烧 900–930 °C、2 h 空气（银 961 °C 熔点，余量 31 °C）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 900, max: 930 }],
      },
      { note_zh: '涂端两次、干燥', performedBy: 'plant/robot' },
      {
        note_zh: '烧端 700–800 °C（银在空气里不氧化）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 700, max: 800 }],
      },
      {
        note_zh: '滚镀镍 3 µm、50–60 °C（**没有滚筒**：篮镀，接触点 5–10 % 漏镀）',
        performedBy: 'plant/plating-bath',
        under: [{ param: 'temperature', min: 50, max: 60 }, { param: 'pressure', min: 15, max: 20 }],
      },
      {
        note_zh: '滚镀锡 4 µm、20–30 °C',
        performedBy: 'plant/plating-bath',
        under: [{ param: 'temperature', min: 20, max: 30 }, { param: 'pressure', min: 15, max: 20 }],
      },
    ],
  },

  {
    /**
     * **片式多层陶瓷电容（镍电极档）—— 升级路线，今天走不通。**
     *
     * ```
     * 交付窗口 0402 / 120 层 / 0.1–1 µF / 16 V / ±5–10 %
     * C = ε₀ × 3000 × 0.2e-6 × 120 / 1.2e-6 = 5.3e-7 F = **0.53 µF** ✓ 落在窗口里
     * ```
     *
     * 它就是 SoC 旁边那颗 0.1 µF 该长的样子：εr 3000（0.1 µm 掺杂粉）、1.2 µm 介质、
     * 120 层、0402。**而它有三处缺口，每一处都写在这一行上面**：
     *
     * ```
     * ① metal ∈ {Ni}   已通：make/mlcc-electrode-paste-ni 可产（make/nickel, ores.ts:216）；
     *                  仍差镍粉 0.2–0.5 µm 球状/无氧化层
     * ② thickness 2–5  **没有任何路线能交付** —— make/mlcc-green-tape 只到 20 µm
     * ③ oxygen_ppm     [1e-8, 1e-5] 折 10⁻⁶–10⁻⁹ Pa，#23（问四）
     * ```
     *
     * ② 那条在数据里是可校验的：`mat/mlcc-green-tape` 的产出窗口是 20–30 µm，
     * 这里要 2–5 µm → `prop_unfilled` 报出来，而 `onRelax: functional-lost` 说明
     * **放宽救不了**（20 µm 生带做不出 0.53 µF，只能做 20 nF —— 差 26 倍，那是换了东西）。
     *
     * ③ 那条**校验会通过**：`plant/atmosphere-furnace` 的 holds 说它能维持
     * oxygen_ppm 0–50，而 1e-8–1e-5 落在里面。这是一个假 ✓，
     * 文件头第三节第 ① 条专门说了这件事 —— 模型过了，工艺没过。
     */
    id: 'make/mlcc-ni-sintered',
    name: '片式多层陶瓷电容制造',
    produces: [{
      item: 'std/mlcc-general',
      qty: q(100000),
      gives: [
        { param: 'capacitance', kind: 'range', min: 0.1, max: 1 },
        { param: 'ratedVoltage', kind: 'range', min: 16, max: 16 },
        { param: 'caseSize', kind: 'enum', oneOf: ['0402'] },
        { param: 'layerCount', kind: 'range', min: 120, max: 120 },
        { param: 'tolerance', kind: 'range', min: 5, max: 10 },
      ],
    }],
    uses: [
      {
        anyOf: [{
          item: 'mat/mlcc-green-tape',
          qty: q(3, 10),
          need: [{ param: 'thickness', kind: 'range', min: 2, max: 5 }],
          // 20 µm 生带做不出 0.53 µF。这不是"差几倍"，是"换了一个东西"。
          onRelax: 'functional-lost',
        }],
      },
      { anyOf: [{ item: 'mat/mlcc-electrode-paste', qty: q(1, 10), need: [{ param: 'metal', kind: 'enum', oneOf: ['Ni'] }], onRelax: 'functional-lost' }] },
      { anyOf: [{ item: 'mat/mlcc-terminal-paste', qty: q(2, 25), need: [{ param: 'metal', kind: 'enum', oneOf: ['Ag'] }], onRelax: 'functional-kept' }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '丝印镍浆（2 µm、对位 ±0.02 mm）', performedBy: 'plant/robot' },
      { note_zh: '叠层 120 层（夹层对位靠手，这是这条路线今天做不到的第三处）', performedBy: 'plant/robot' },
      { note_zh: '温等静压 70 °C、20 MPa', performedBy: 'plant/press' },
      { note_zh: '切割成 1.0×0.5 mm', performedBy: 'plant/robot' },
      {
        note_zh: '排胶 450–700 °C（PVB 载体，残碳 <0.1 %）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 450, max: 700 }],
      },
      {
        note_zh: '共烧 1300 °C、pO₂ 10⁻⁶–10⁻⁹ Pa（**这一条本层做不到**，见问四）',
        performedBy: 'plant/atmosphere-furnace',
        under: [{ param: 'temperature', min: 1300, max: 1320 }, { param: 'oxygen_ppm', min: 1e-8, max: 1e-5 }],
      },
      { note_zh: '涂端、烧端 700–800 °C', performedBy: 'plant/robot' },
      {
        note_zh: '滚镀镍 3 µm 再镀锡 4 µm',
        performedBy: 'plant/plating-bath',
        under: [{ param: 'temperature', min: 50, max: 60 }, { param: 'pressure', min: 15, max: 20 }],
      },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...MLCC_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...MLCC_ROUTES];
