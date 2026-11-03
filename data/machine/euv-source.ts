/**
 * EUV 光源（13.5 nm）与它的高真空系统 —— 整条半导体线的入口。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 这一件为什么是入口
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 13.5 nm 的光子能量是 92 eV。只有等离子体能发这个波长：把工质加热到
 * **40–50 eV（≈ 5×10⁵ K）**，让它成为 Xe¹⁰⁺ / Sn⁸⁺。两条路：
 *
 *   DPP  电极间高压放电，氙被电离压缩 —— 简单，但电极烧蚀、功率低
 *   LPP  CO₂ 激光（10.6 µm）打锡液滴 —— 工业主流，但要 10–20 kW 级 CO₂ 激光
 *
 * 本文件两条都写：`plant/euv-source/laser`（LPP 头）与 `plant/euv-source/dpp-head`
 * （DPP 头）是**并存的第二条来路**，整机的 `composedOf` 选 LPP。
 *
 * 整机 `plant/euv-source` 与高真空机组 `plant/euv-vacuum` **都没有产出路线**。
 * 这不是漏写：13.5 nm 光源是这一整条线的入口，下面的四个问题就是四处"为什么
 * 造不出来"。它们有 `composedOf`，所以不是黑箱 —— 运来之后哪一件坏了、本层能
 * 把那一件做到什么程度，逐条写在零件路线里，也逐条写在下面的数字里。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 问题 1：真空 —— 1e-5 Pa 差 5 个数量级，怎么爬
 * ═══════════════════════════════════════════════════════════════════════
 *
 * **先说一句反直觉的：这个 1e-5 Pa 不是被"吸收"定死的。**
 *
 *   1 atm 空气 1 mm 吸收 99 %（光学厚度 4.6）
 *   → 吸收截面 σ_eff ≈ 1.8e-22 m²（13.5 nm 对 N₂ 的电离截面量级，2 Mb）
 *   1e-5 Pa、300 K 下 n = p/kT = 1e-5/(1.38e-23×300) = 2.4e15 m⁻³
 *   走 1 m 的光学厚度 = 2.4e15 × 1.8e-22 = 4.3e-7 → **只吸收 0.00004 %**
 *
 * 所以真空度是被另外两件事定死的：**镜面污染**与**等离子体不被杂气冷却**。
 *
 *   撞击率 Z = p/√(2πmkT)。碳氢化合物 M = 100 u → √(2πmkT) = 6.6e-23
 *   Z(1e-8 Pa) = 1e-8/6.6e-23 = 1.5e14 m⁻²s⁻¹ = **1.5e10 cm⁻²s⁻¹**
 *   单分子层 ≈ 1e15 cm⁻² → **18 h 长满一层碳**；Z(1e-6 Pa) 时同一层只要 **1.8 h**
 *
 * 要按年算镜面寿命，碳氢分压得压到 1e-11 Pa 级 —— 工业机靠"氢自由基随时把碳洗掉"
 * 顶住这一档，本层没有。本层只能把碳氢分压压到 1e-8 Pa 以下，并按天计镜面寿命。
 *
 * ─── 阶梯：本层现有 1 Pa（`plant/evaporator/pump`，水环 + 两级罗茨） ───
 *
 * 腔体按 φ600 × 900 mm、8 mm 碳钢板：V = 0.25 m³ = 250 L，
 * 内表面 A ≈ 3 m²（筒 1.70 + 两端 0.57 + 接管法兰）。
 *
 *   ① 粗抽   600 Pa（火星大气）→ 1 Pa   水环 + 两级罗茨，S = 140 L/s
 *            理想 t = (V/S)·ln(600/1) = (0.25/0.14)×6.40 = **11 s**
 *            实际 5–10 min：10–1000 Pa 这一段由表面水汽支配
 *            （3 m² 钢面吸 0.3 g 水 = 37.9 Pa·m³，37.9/0.14 = 271 s）
 *
 *   ② 高真空 1 Pa → 1e-6 Pa（泵的本底）  2 × φ250 涡轮，S = 2000 L/s
 *            τ = V/S = 0.125 s → t = 0.125×ln(1e6) = **1.7 s**（纯气体）
 *
 *   ③ 墙在放气，不在泵速
 *            未烘烤碳钢 q = 1e-7 mbar·L/(s·cm²)（不锈钢是 1e-8，本层没有不锈钢）
 *            Q = 3e4 cm² × 1e-7 = 3e-3 mbar·L/s = 3e-4 Pa·m³/s
 *            p∞ = Q/S = 3e-4 / 2 = **1.5e-4 Pa** —— 距 1e-5 差 15 倍，抽不下去
 *            150 °C 烘 24 h，q → 1e-9 → Q = 3e-6 → p∞ = **1.5e-6 Pa** ✓
 *
 *   合计：首次开机 → 1e-5 Pa 约 **30 h**（粗抽 0.2 + 升温 3 + 烘烤 24 + 降温 3）
 *         日常（干氮回填、不烘烤）4–6 h，只到 1e-4 Pa —— **到不了 1e-5**。
 *
 * ─── 三条候选路，只走通一条 ───
 *
 *   扩散泵  要硅油（硅 + 甲基氯 → 二甲基二氯硅烷 → 水解，一条完整新链）或汞。
 *           **本层两样都没有**；且汞蒸气在等离子体里会淬灭 92 eV 的辐射。
 *   吸附泵  活性炭 77 K 抽不了 H₂ / He / Ne。而烘烤放的就是 H₂、等离子体区的
 *           缓冲气也是 H₂（1 sccm）。且它是批量式，连续运行要两组轮换。
 *   涡轮泵  ✔ 20 级、φ250、2.4 万转、叶尖 π×0.25×(24000/60) = **314 m/s**
 *           （工业 300–500 m/s）、压缩比 N₂ 1e6 → 前级 1 Pa → 入口 1e-6 Pa。
 *           代价写在下面：**它的轴承本层做不出来。**
 *
 * ─── 氢的账：为什么"全程 1e-5 Pa"要松成"光学腔 1e-5 Pa" ───
 *
 *   1 sccm H₂ = 1.69e-3 Pa·m³/s。2 m³/s 的抽速下这只值 8.4e-4 Pa。
 *   所以源腔实际跑在 ~1e-3 Pa，不是 1e-5 Pa。光学腔（收集镜背面到 IF）靠
 *   φ2 mm 差分孔隔开：
 *     气导 C = 11.6 × A[cm²] = 11.6 × 0.0314 = **0.36 L/s**（分子流，20 °C）
 *     Q = 8.4e-4 × 3.6e-4 = 3e-7 Pa·m³/s，光学腔 1000 L/s → **3e-7 Pa** ✓
 *   这是本文件的第一处降级，数字在上面：源腔 1e-3 Pa、光学腔 1e-5 Pa 以下。
 *
 *   ⚠️ 单位刻度：`pressure` 在本文件按 **Pa** 写（1e-5 = 工作压力）。
 *      `data/floor/mars.ts` 的 `ambient` 按 kPa 写（0.6），模型不做换算 ——
 *      两处刻度不同是本层旧账（`data/machine/vacuum.ts` 的 0.001–10 也在两可之间），
 *      这里选 Pa，是因为 1e-5 这个数只有按 Pa 才读得懂；判据不受影响
 *      （1e-5 与 600 不可能互相覆盖，也不会误判成"环境满足"）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 问题 2：CO₂ 激光 —— 本层能做多大
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 需要：LPP 打锡滴，**10–20 kW @ 10.6 µm**（工业机 20 kW、50 kHz、双脉冲）。
 *
 * 本层能做的三件都在：石英放电管（`make/diffusion-tube` 已有 1900–2200 °C
 * 熔制拉管的先例）、铜电极、铜镜谐振腔（铜在 10.6 µm 反射 ~98 %）。
 *
 *   功率密度  密封 CO₂ 管用 He 冷却是 60–80 W/m
 *             本层只有氩代 He：导热 0.0177 对 0.152 W/m·K，差 **8.6 倍**
 *             → 排热掉一档，**30–50 W/m**
 *   一台       φ10 × 1 000 mm 石英管 → **30–50 W**
 *   要 10 kW   10 000 / 40 = **250 m 放电长度**（250 根并联，或折返 250 次的光路）
 *             → 差 **200–330 倍**
 *   电源       15 kV × 20 mA × 250 = **75 kW** 的高压电源；电容与变压器不在
 *             本文件的投料白名单里 —— 电源是硬堵点。
 *   出光口     石英/玻璃在 10.6 µm 不透（Si–O 吸收边 ~4 µm）；ZnSe、Ge、岩盐
 *             本层都没有 → **连"把光引出来"的那片窗都做不出来**。
 *             铜镜开孔耦合可以省掉输出镜，但孔会漏气，仍要一片红外窗。
 *
 * 结论：LPP 在本层停在"1 m 管、30–50 W、没有窗口、没有电源"。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 问题 3：锡液滴发生器 —— 压电能用，喷嘴只能到 30 µm
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   滴径与射流  Rayleigh 破碎：滴径 = 1.89 × 射流直径
 *               → 25 µm 滴要 **φ13 µm 孔**；φ20 µm 孔出来的是 **38 µm 滴**
 *   频率与速度  λ = 4.5 d = 90 µm（φ20 射流）；50 kHz → v = λf = **4.5 m/s**
 *   流量        25 µm 滴 × 50 kHz → 4.1e-7 L/s → 锡 2.8 mg/s = **10 g/h**
 *   喷嘴压差    Hagen–Poiseuille Δp = 8µLv/r²
 *               µ(Sn 250 °C) = 1.9 mPa·s、L = 50 µm、r = 6.5 µm、v = 2.9 m/s
 *               → **52 kPa**（含表面张力与惯性，取 50–100 kPa）
 *
 *   压电：`std/quartz-resonator-general` 声明的窗口是 1–100 000 kHz（路线交付
 *   32–1 000 kHz），50 kHz 在窗口内 → **能用**，但两处要打折扣：
 *     ① 它是频率基准，不是功率器件：振幅 ~1 µm，而 Rayleigh 要 d/10 = 1.3–2.5 µm
 *        → 得做 2 倍机械放大（膜片或杠杆）；
 *     ② 它的 Q 高，粘到喷嘴上就被负载拉偏 —— 只能当频率源，激励另给。
 *
 *   喷嘴：本层机械加工的最小孔是 **φ0.2 mm**（钻/磨），差 15 倍。
 *     宝石孔不可行：没有单晶刚玉（只有磨料级），也没有超声/激光打孔。
 *     石英毛细管拉制要 1900–2200 °C，而碳弧在 2 000 °C 以上与石英反应
 *     （SiO₂ + C → SiO↑ + CO，`unblock-atmos-sight.ts` 已记）。
 *     **唯一走通的一条是把 `make/wire-die` 的手艺借过来**：φ25 µm 铜丝 +
 *     水选 5 µm 尾矿粉往复拉磨 —— 孔径 ≈ 丝径 + 磨料 ≈ **30 µm（±50 %）**，
 *     滴径 1.89 × 30 = **57 µm**，体积是 25 µm 滴的 11.8 倍 → 锡耗 **120 g/h**。
 *
 *     **再补一条微调**（`make/euv-nozzle-trim`）：30 µm 那只再镀一层热解碳，
 *     把孔缩到 18–20 µm —— 镀的还是碳，"熔锡不润湿"不变。滴径回到 38 µm、
 *     锡耗 34 g/h。代价是成品率 1/2，且孔径只能按流量反算。
 *     补完之后 `need bore ≤20` 有交付者，这条链上不再有 `functional-kept`。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 问题 4：收集镜 —— φ300 椭球，卡在非球面度与检具
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 几何：等离子体在 F1、中间焦点 IF 在 F2，物距/像距 200/1 200 mm
 *       → 长半轴 a = 700、偏心率 e = (q−p)/(q+p) = 0.714、顶点 R = b²/a = 343 mm。
 *       放大 6×（200 µm 源 → 1.2 mm 像），收集立体角 5 sr（4π 的 40 %）。
 *       **非球面度（相对最接近球面 R352）≈ 0.24 mm = 1.8×10⁴ λ**，边缘两面的
 *       斜率差 11.5 mrad —— 这一件真正的难度不在口径，在"要按测量一点一点去掉
 *       0.24 mm 的料"。
 *
 * 要求（λ = 13.5 nm）：
 *   ① 斜率 ≤ **0.1 mrad** —— IF 弥散 2δθ·q = 2×1e-4×1 200 = 0.24 mm，
 *      而 IF 光阑是 φ1 mm，斜率预算就到这里。
 *   ② 面形（10 mm 空间周期）≤ **160 nm rms** —— 由 ① 折算：h = δθ·L/2π。
 *   ③ 粗糙度 σ ≤ **0.24 nm rms** —— 散射 TIS = (4πσ/λ)² ≤ 5 %
 *      （同一个式子在 `unblock-pyrometer-objective` 用过：λ = 650 nm、σ = 4 nm → 0.6 %）
 *   ④ 口径 φ300。
 *
 * 本层能给（对着 `data/machine/euv-mirror.ts` 那条线看，差别不在口径）：
 *   口径 φ300 ✓ —— 那份文件里 `make/euv-substrate-300` 就是 φ300 × 20 的熔石英板。
 *   面形 32 nm ✓ —— **但那是平面**。同一双手在 φ300 平板上做到 λ/20 = 32 nm
 *     （铸铁盘 + 分级石英粉 + 恒温间），靠的是"盘抄形"：盘是平的，镜就平。
 *   粗糙度 0.5 nm —— TIS = (4π×0.5/13.5)² = **21.7 %**，比 5 % 差 4 倍；
 *     这一项不是死结（镀完膜 0.3 nm → 7.8 %）。
 *   **非球面度 0.24 mm 去不掉**：刚性的盘只能抄出球面/平面。要变成椭球，得局部
 *     修抛掉 0.24 mm，而"去哪一块、去多少"要靠非球面测量。开环修抛（与
 *     `make/euv-substrate-figure` 那句"开环声明"同一个性质）按 Preston 残差 20 % 算，
 *     还剩 **48 µm（取 50 µm）**；斜率残差 0.2×11.5 = 2.3 mrad → IF 弥散
 *     2×2.3e-3×1 200 = **5.5 mm**，φ1 mm 光阑的通过率 (1/5.5)² ≈ **3 %**。
 *   检具没有：干涉仪只做平面 Fizeau 对比（λ/4 平晶、读 0.015 µm），刀口法只判球面
 *     —— 椭球那 0.24 mm 偏差"往哪边、差多少"，本层测不出来，闭环无从谈起。
 *
 * 结论：φ300 椭球做不出来，卡在**非球面度与检具**，不是口径、也不是粗糙度。
 * 本层路线交付的是一片"球面 R343、面形 32 nm、与设计椭球差 50 µm"的镜坯
 * （`gives` 里那四个数就是这四个）。Mo/Si 多层膜（40–50 对、周期 6.9 nm、
 * λ = 2d·sinθ）由 `data/machine/euv-mirror.ts` 给，不在本文件的投料白名单里 ——
 * 它要的界面粗糙度 0.3 nm 与镀后 figure 3 nm，与这里的 50 µm 差 10⁴ 倍，
 * 所以这一条不用等它。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 已知缺口（不是"暂未实现"，是卡在哪一步）
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   ① 2.4 万转的轴承：要油气润滑或陶瓷球脂润滑，本层**没有真空油/脂**
 *      （油脂要石油或硅油）→ 涡轮泵"画得出、装不起来"。这是第五个数量级真正的门。
 *   ② 10.6 µm 窗口：没有 ZnSe / Ge / 岩盐 → CO₂ 激光的光引不出来。
 *   ③ 高压脉冲电源：1 kV / 10 kA 的电容组与变压器不在本文件许可的投料表内。
 *   ④ 卷制 φ600 筒：本层没有卷板机，只能四瓣折弯 + 4 条焊缝 → 漏率与放气都变大
 *      （上面 q = 1e-7 那个数就是这么来的）。
 *   ⑤ 碳氢分压测不了：本层没有质谱（残余气体分析），只能按抽气时间与泵电流反推。
 *   ⑥ 1e-5 Pa 的全压测不了：皮拉尼/热偶到 0.1 Pa，电离规要钨丝与高压，本层没有。
 *   ⑦ 液氮：`mat/nitrogen` 只有气氮，冷阱要的液氮靠节流膨胀自产，没有单独的条目。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const EUV_SOURCE_ITEMS: readonly Item[] = [
  // ───────────────────────────────────────────────────────────────────────
  // 光源本体：零件
  // ───────────────────────────────────────────────────────────────────────

  /**
   * 真空腔。φ600 × 900、8 mm 碳钢板四瓣折弯焊成筒，两端 CF 法兰用**铜垫**密封
   * （PTFE 本层有，但它放气与渗透太大、260 °C 就软，要烘到 150 °C 的 UHV 密封
   * 只能用无氧铜垫），φ100 熔石英观察窗、外壁水冷夹套。
   *
   * 为什么是碳钢而不是不锈钢：本层没有不锈钢（`mat/stainless-steel` 不在这一件
   * 的投料表里，也不在整条线的白名单里）。代价写在文件头问题 1 的 ③：放气率高
   * 3–10 倍，于是必须烘烤。
   */
  { id: 'plant/euv-source/vessel', name: 'EUV Source Vacuum Vessel', name_zh: 'EUV 光源真空室', unit: '件', category: 'part' },

  /**
   * 收集镜坯。φ300 椭球，熔石英基体（CTE 0.55e-6/K）。
   *
   * 只到**基体**：口径、面形、粗糙度、与设计椭球的偏差四个属性在这里声明，
   * Mo/Si 多层膜不在本文件（在 `data/machine/euv-mirror.ts`）。
   *
   * 四个属性对应四句实话：口径 300 做到了、球面面形 32 nm 做到了、粗糙度 0.5 nm
   * 差 2 倍、**与椭球的偏差 50 µm** —— 最后这一项才是"它当不了收集镜"的原因。
   */
  {
    id: 'plant/euv-source/collector',
    name: 'EUV Collector Mirror Blank', name_zh: 'EUV 收集镜坯',
    unit: '件',
    category: 'part',
    props: [
      { param: 'aperture', kind: 'range', min: 0, max: 1000, unit: 'mm', dir: 'atLeast' },
      { param: 'figure', kind: 'range', min: 0, max: 10000, unit: 'nm rms', dir: 'atMost' },
      { param: 'roughness', kind: 'range', min: 0, max: 100, unit: 'nm rms', dir: 'atMost' },
      { param: 'deviation', kind: 'range', min: 0, max: 1000000, unit: 'nm', dir: 'atMost' },
    ],
  },

  /**
   * 锡液滴发生器。1 kg 锡罐 + 2 kW 加热套（250 °C，锡的熔点 232 °C）+ 压电座
   * + 喷嘴座。不含喷嘴 —— 喷嘴单列一条路线，因为它的手艺与发生器完全不同。
   */
  {
    id: 'plant/euv-source/droplet-generator',
    name: 'EUV Tin Droplet Generator', name_zh: 'EUV 锡液滴发生器',
    unit: '件',
    category: 'part',
    props: [
      // 能力域/资格带，不是单次读数；与 mat/droplet-record 的资格带一致。
      // jitter 0–100 ns 是设计能力；measure/droplet-size-velocity 的实测段是 2–10 ns。
      { param: 'diameter', kind: 'range', min: 5, max: 50, unit: 'µm' },
      { param: 'velocity', kind: 'range', min: 10, max: 200, unit: 'm/s' },
      { param: 'rate', kind: 'range', min: 10, max: 100, unit: 'kHz' },
      { param: 'jitter', kind: 'range', min: 0, max: 100, unit: 'ns', dir: 'atMost' },
    ],
  },

  /**
   * 喷嘴。石墨片 φ10 × 0.5，中心孔由 φ25 µm 铜丝 + 水选 5 µm 尾矿粉拉磨出来。
   *
   * 为什么是石墨不是石英：熔锡不润湿石墨（接触角 > 120°），出口不会挂锡；
   * 而石英要拉成管得 1 900–2 200 °C，本层到得了那个温度的只有碳弧炉，碳又与
   * 石英反应（SiO₂ + C → SiO↑ + CO），拉出来的管内径也控不到 ±1 µm。
   * 孔径 `bore` 是本文件最要紧的一个尺寸 —— 滴径 = 1.89 × 孔（Rayleigh）。
   *
   * 两条路：`make/euv-nozzle` 磨到 ≤30 µm；`make/euv-nozzle-trim` 再镀热解碳补到
   * 18–20 µm（镀的还是碳，润湿性不变）。要 ≤20 的消费者选后者。
   */
  {
    id: 'plant/euv-source/nozzle',
    name: 'EUV Nozzle', name_zh: 'EUV 喷嘴',
    unit: '件',
    category: 'part',
    props: [{ param: 'bore', kind: 'range', min: 1, max: 500, unit: 'µm', dir: 'atMost' }],
  },

  /**
   * CO₂ 激光头（**不含电源**）。φ10/φ12 × 1 000 mm 熔石英放电管 + 两只铜电极
   * + 三片铜镜谐振腔 + 铜开孔输出镜，CO₂:N₂:Ar = 1:1:3 充到 10 kPa。
   *
   * 功率属性按 30–50 W 交付（氩代氦，见文件头问题 2）；10 kW 要 250 m 管长。
   * 电源与红外窗口是本层的两处硬堵点，都不在这条路线的投料里。
   */
  {
    id: 'plant/euv-source/laser',
    name: 'CO₂ Laser Head', name_zh: 'CO₂ 激光头',
    unit: '件',
    category: 'part',
    props: [{ param: 'power', kind: 'range', min: 0, max: 100000, unit: 'W', dir: 'atLeast' }],
  },

  /**
   * DPP 放电头 —— 与激光头**并存的第二条来路**。
   *
   * 两根 φ40 石墨电极（从 φ300 碳电极上锯下来）、5 mm 间隙、陶瓷绝缘套、
   * 氙气喷嘴。整机的 composedOf 选 LPP，这一件仍然写出来：它是"没有 20 kW
   * 激光时唯一能点着等离子体"的办法，代价是石墨溅射到收集镜上。
   */
  { id: 'plant/euv-source/dpp-head', name: 'DPP Discharge Head', name_zh: 'DPP 放电头', unit: '件', category: 'part' },

  /**
   * 碎屑抑制。铜箔百叶（0.05 mm 厚、间隔 1 mm）+ 支撑 + φ2 mm 差分孔。
   *
   * 13.5 nm 的收集镜离等离子体只有 200 mm，锡与石墨的溅射物必须挡在这里。
   * 工业机用氢气流帘；本层能给的氢气只有 1 sccm（见问题 1 的氢账），
   * 所以百叶是主力，氢只是辅助。
   */
  {
    id: 'plant/euv-source/debris-trap',
    name: 'EUV Debris Mitigation', name_zh: 'EUV 碎屑抑制',
    unit: '件',
    category: 'part',
    props: [
      // 能力域/资格带，不是单次读数；与 mat/debris-lifetime-record 的资格带一致。
      { param: 'lifetime', kind: 'range', min: 0, max: 30000, unit: 'h', dir: 'atMost' },
      { param: 'reflectivityDrop', kind: 'range', min: 0, max: 50, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 中间焦点组件。φ1 mm 光阑铜板 + 热隔离 + φ2 mm 差分抽气接管。
   *
   * IF 是光源与照明的交接面：光在这里会聚成 1.2 mm 的像，穿过 φ1 mm 光阑的
   * 那一部分才进后面的照明系统。光阑同时是差分抽气的第一级。
   */
  { id: 'plant/euv-source/if-module', name: 'EUV Intermediate Focus Module', name_zh: 'EUV 中间焦点组件', unit: '件', category: 'part' },

  // ───────────────────────────────────────────────────────────────────────
  // 高真空系统：零件
  // ───────────────────────────────────────────────────────────────────────

  /**
   * 粗抽机组。水环泵（叶轮在水环里转，不要油，极限 3 kPa）+ 两级罗茨
   * （8 字形转子对转，压缩比 10–30/级）→ 1 Pa。
   *
   * 与 `plant/evaporator/pump` 同一个原理、同一条手艺，但不能共用那条条目：
   * 那一套是蒸镀机的一部分（记成零件），这一套是独立的高真空机组的前级。
   */
  { id: 'plant/euv-vacuum/pump/rough', name: 'High-Vacuum Pumping System Roughing Pump Set', name_zh: '高真空机组粗抽机组', unit: '套', category: 'part' },

  /**
   * 涡轮分子泵。φ250、20 级、2.4 万转、叶尖 314 m/s、间隙 0.1 mm、1000 L/s。
   *
   * 它是本层的第五个数量级，也是本层**装不起来**的那一级：转子能铣能磨
   * （与罗茨同一条手艺），但 2.4 万转的轴承要油气润滑或陶瓷球脂润滑，
   * 而油脂要石油或硅油 —— 两样都没有。见文件头缺口 ①。
   *
   * `pressure` 属性写成 0–100 000 Pa（`dir: 'atMost'`：越小越好），路线交付
   * 1e-6 Pa（泵的本底）。工作压力 1e-5 Pa 是腔体放气定的，不是泵定的。
   */
  {
    id: 'plant/euv-vacuum/pump/turbo',
    name: 'High-Vacuum Pumping System Turbomolecular Pump', name_zh: '高真空机组涡轮分子泵',
    unit: '台',
    category: 'part',
    props: [{ param: 'pressure', kind: 'range', min: 0, max: 100000, unit: 'Pa', dir: 'atMost' }],
  },

  /**
   * 液氮冷阱。φ8 铜盘管 12 圈 + 液氮罐 + 矿棉保温。
   *
   * 它挡两样东西：水汽（不挡就要 10 倍抽气时间）与返流的泵油。
   * 液氮本身没有条目 —— `mat/nitrogen` 是气氮，靠节流膨胀自产（缺口 ⑦）。
   */
  { id: 'plant/euv-vacuum/pump/cold-trap', name: 'High-Vacuum Pumping System Liquid Nitrogen Cold Trap', name_zh: '高真空机组液氮冷阱', unit: '件', category: 'part' },

  /**
   * 真空计。皮拉尼（0.1–100 Pa）与热偶（1–100 Pa）各一只，铜丝 + 玻璃壳 + 铁座。
   *
   * 这是本层**测不到工作压力**的那一处：1e-5 Pa 要电离规（钨丝 + 高压 + 微电流
   * 放大），本层三样都没有。所以"抽到 1e-5 Pa"在本层只能靠抽气时间与泵电流反推。
   */
  { id: 'plant/euv-vacuum/pump/gauge', name: 'High-Vacuum Pumping System Vacuum Gauge', name_zh: '高真空机组真空计', unit: '件', category: 'part' },

  // ───────────────────────────────────────────────────────────────────────
  // 设备
  // ───────────────────────────────────────────────────────────────────────

  /**
   * EUV 光源整机（LPP）。**由 `make/euv-source` 装配，不再是 composedOf 黑箱。**
   *
   * 它 `holds` 什么？什么都不 hold。真空由 `plant/euv-vacuum` 维持，温度是环境。
   * 它在描述里的作用是作为 `needs` 出现："这一步要在光源上做"—— 与
   * `plant/clean-room` 同一个写法（`clean.ts` 里那台也不 holds 条件）。
   */
  {
    id: 'plant/euv-source',
    name: 'EUV Source System', name_zh: 'EUV 光源整机',
    unit: '台',
    category: 'machine',
  },

  /**
   * 高真空机组。粗抽 + 2 台涡轮 + 冷阱 + 真空计，**由 `make/euv-vacuum` 装配。**
   *
   * `holds` 写 1e-8–1 Pa：下界是涡轮 1e-6 Pa 的本底再留两个量级的余量（放气墙
   * 才是真下界），上界是粗抽的 1 Pa。`covers` 是区间包含，所以任何在
   * 1e-8–1 Pa 之内的 `under: pressure` 都由它承担 —— 本文件里三处（标定、
   * 氢帘、IF 对中）就是这么写的。
   */
  {
    id: 'plant/euv-vacuum',
    name: 'High-Vacuum Pumping System', name_zh: '高真空机组',
    unit: '套',
    category: 'machine',
    holds: [{ param: 'pressure', min: 1e-8, max: 1 }],
  },
];

export const EUV_SOURCE_ROUTES: readonly Route[] = [
  // ───────────────────────────────────────────────────────────────────────
  // 光源本体
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * 真空腔。8 mm 碳钢板四瓣折弯 → 焊筒体与水冷夹套 → 车两端 CF 法兰与
     * 铜垫密封槽 → 水压试验 0.2 MPa + 检漏（氦检漏要氦，本层没有，只能涂酒精
     * 看气泡 —— 漏率判到 1e-3 Pa·L/s 级，够粗抽，不够 UHV，UHV 靠烘烤后的压升判）。
     *
     * 钢板 180 kg 的算法：筒面 1.70 m² + 两端 0.57 m² = 2.27 m²，8 mm 厚 →
     * 0.0182 m³ × 7 850 = 143 kg；法兰、接管、支腿再 37 kg。
     */
    id: 'make/euv-source-vessel',
    name: 'EUV Source Vacuum Vessel Manufacturing', name_zh: 'EUV 光源真空室制造',
    produces: [{ item: 'plant/euv-source/vessel', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(180) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(3) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '四瓣折弯、卷圆、焊筒体与 4 条纵缝（没有卷板机，见缺口 ④）', performedBy: 'plant/sheet-shop' },
      { note_zh: '焊水冷夹套与接管座', performedBy: 'plant/sheet-shop' },
      { note_zh: '车两端 CF 法兰与铜垫密封槽（平面度 0.02、Ra 0.8）', performedBy: 'lathe' },
      { note_zh: '装石英观察窗，水压试验 0.2 MPa，涂酒精查漏', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(60) },
    unbalanced_zh: '钢板 180 + 铜 3 + 石英 0.5 + 水 20 → 腔体 1 件；余是边角料、焊材与试压水',
  },

  {
    /**
     * 收集镜坯。熔石英盘 φ320 × 40（7.1 kg，算 8 kg 留余地）→ 磨球面 R343 →
     * 手抛到 λ/20 → 开环修抛去 0.24 mm 非球面量 → 球面面形检验。
     *
     * 交付的四个数就是本层的实话：口径 300 ✓、球面面形 32 nm ✓、粗糙度 0.5 nm
     * （差 2 倍）、**与设计椭球的偏差 50 µm**（差 310 倍）。
     * 最后一步是开环的 —— 没有非球面检具，"去掉了多少"只能按 Preston 公式算。
     */
    id: 'make/euv-source-collector',
    name: 'EUV Collector Mirror Blank Manufacturing', name_zh: 'EUV 收集镜坯制造',
    produces: [
      {
        item: 'plant/euv-source/collector',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 300, dir: 'atLeast' },
          { param: 'figure', kind: 'range', max: 32, dir: 'atMost' },
          { param: 'roughness', kind: 'range', max: 0.5, dir: 'atMost' },
          { param: 'deviation', kind: 'range', max: 50000, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(8) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(60) }] },
      { anyOf: [{ item: 'mat/water', qty: q(30) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
    ],
    needs: ['plant/interferometer', 'plant/metrology-room', 'plant/clean-room'],
    steps: [
      { note_zh: '熔制 φ320 × 40 石英盘（石墨模浇板，熔石英软化点 1 713 °C）', performedBy: 'plant/arc-furnace', under: [{ param: 'temperature', min: 1900, max: 2200 }] },
      { note_zh: '退火去应力：1 100 °C 保温 4 h、48 h 缓冷（应力不除，面形几周就漂）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 1050, max: 1100 }] },
      { note_zh: '粗磨球面 R343：铸铁凸盘展成，厚薄差 0.05 mm', performedBy: 'plant/grinder' },
      { note_zh: '手抛到 λ/20 = 32 nm（铸铁盘 + 分级尾矿粉，恒温间 19–21 °C）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '开环修抛：按 Preston 去 0.24 mm 非球面量，残差按 20 % 记 → 50 µm（没有椭球检具，这是本条路线最虚的一步）', performedBy: 'plant/robot' },
      { note_zh: '检验：平晶 Fizeau 看球面面形（读 1/20 条 = 15 nm）+ 刀口法判球', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(160) },
    unbalanced_zh: '石英 8 + 尾矿 60 + 水 30 + 氢氟酸 1 → 镜坯 1 件；余是磨削量与抛光粉',
  },

  {
    /**
     * 锡液滴发生器。铸铁锡罐 φ120 × 200（30 kg）+ 2 kW 铜丝加热套 + 压电座
     * + 喷嘴座 + 充装 1 kg 锡。
     *
     * 三处降级都在这一条路线上：
     *   喷嘴   要 φ20 µm，本层给 30 ± 15 µm（`need` 那里写着，会报 prop_unfilled）
     *   压电   石英振子要 45–55 kHz，交付窗口是 32–1 000 kHz（够用，窗口更宽）
     *   标定   只能在光源上做 —— 滴频与滴径的唯一判据是等离子体亮没亮
     */
    id: 'make/euv-droplet-generator',
    name: 'EUV Tin Droplet Generator Manufacturing', name_zh: 'EUV 锡液滴发生器制造',
    produces: [{
      item: 'plant/euv-source/droplet-generator',
      qty: q(1),
      gives: [
        { param: 'diameter', kind: 'range', min: 5, max: 50, record: 'mat/droplet-record' },
        { param: 'velocity', kind: 'range', min: 10, max: 200, record: 'mat/droplet-record' },
        { param: 'rate', kind: 'range', min: 10, max: 100, record: 'mat/droplet-record' },
        { param: 'jitter', kind: 'range', min: 0, max: 100, record: 'mat/droplet-record' },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(30) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(2) }] },
      {
        anyOf: [
          {
            item: 'plant/euv-source/nozzle',
            qty: q(1),
            need: [{ param: 'bore', kind: 'range', max: 20, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'std/quartz-resonator-general',
            qty: q(1),
            need: [{ param: 'frequency', kind: 'range', min: 45, max: 55 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/tin', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/euv-vacuum'],
    steps: [
      { note_zh: '车锡罐与加热套（工作 250 °C，罐口与喷嘴座缝隙 0.1）', performedBy: 'lathe' },
      { note_zh: '装压电座与喷嘴座，同轴 0.02', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '充锡、加热到 260、试射流（看射流是否连续）', performedBy: 'plant/robot' },
      { note_zh: '在光源上标定：50 kHz 打靶，看等离子体亮度与放电电流', performedBy: 'plant/robot', under: [{ param: 'pressure', min: 1e-4, max: 1e-3 }] },
    ],
    rate: { hours: q(16) },
    unbalanced_zh: '铸铁 30 + 铜线 2 + 喷嘴 1 + 石英振子 1 + 锡 1 → 发生器 1 件；锡是充装量，运行时被等离子体吃掉，不计入成品质量',
  },

  {
    /**
     * 喷嘴。石墨片 φ10 × 0.5，孔由 φ25 µm 铜丝 + 水选 5 µm 尾矿粉往复拉磨。
     *
     * 孔径 ≈ 丝径 + 磨料粒径 = 25 + 5 = 30 µm，分级靠沉降（±50 %）。
     * 这条路借的是 `make/wire-die` 的手艺：它本来是磨拉丝模孔的，
     * 同一个动作挪到石墨上 —— 石墨软，反而好磨，只是孔径一致性差。
     *
     * 交付窗口写 30 µm，不写成 13 µm：前者是这条路线真能做到的。
     */
    id: 'make/euv-nozzle',
    name: 'EUV Nozzle Manufacturing', name_zh: 'EUV 喷嘴制造',
    produces: [
      {
        item: 'plant/euv-source/nozzle',
        qty: q(1),
        gives: [{ param: 'bore', kind: 'range', max: 30, dir: 'atMost' }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/carbon', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '磨孔：φ25 µm 铜丝 + 5 µm 尾矿粉往复拉磨，几小时一只', performedBy: 'plant/robot' },
      { note_zh: '装喷嘴座、通气测流量反算孔径（Q = πr⁴Δp/8µL）', performedBy: 'lathe' },
      { note_zh: '检验：喷一段锡、显微镜量滴径，按孔径分档', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(6) },
    unbalanced_zh: '石墨 1 + 铜丝 0.01 + 尾矿 2 + 水 2 → 喷嘴 1 件；余是磨屑与磨料',
  },

  {
    /**
     * **喷嘴微调：把 30 µm 的孔补到 18–20 µm。**
     *
     * 为什么要这一条：滴径 = 1.89 × 孔径（Rayleigh）。φ30 出 57 µm 滴、锡耗 120 g/h；
     * φ20 出 38 µm 滴、锡耗 34 g/h（体积比 3.4）。`make/euv-droplet-generator` 的
     * `need` 是 `bore ≤20`，而 `make/euv-nozzle` 只保证 ≤30 —— 这是全表最后一处
     * `functional-kept`（提示清单里那条 kept）。
     *
     * 为什么不是"磨得更细"：`std/wire-die-general` 的模孔极限就是 φ20–25 µm
     * （φ20 钨丝要多拉 12 道、断丝率 50 %），而孔径 ≈ 丝径 + 磨料 —— 磨不到 20 以下。
     * 为什么不是石英毛细：1900–2200 °C 只有碳弧到得了，碳又跟石英反应（SiO₂ + C →
     * SiO↑ + CO）；玻璃毛细管的拉制这一层也没有（见 `unblock-diffusion-tube.ts`）。
     *
     * 所以走"先磨大、再补小"：甲烷在 950–1 000 °C 热解成碳，镀在孔壁上。
     *
     *   · 镀的还是碳 —— "熔锡不润湿石墨"这条前提不变（接触角 > 120°）
     *   · 炉子是 `plant/diffusion-furnace`（900–1 200 °C，温区正好）
     *   · 甲烷有路线（`organic.ts` 的 C1 链：CO₂ + H₂ → 甲醇 → 甲烷）
     *   · 同族沉积的先例在 `se-detector.ts`（热解碳膜定阻值）—— 这里只是把膜镀进孔里
     *
     * 三处代价：
     *
     *   ① **孔径只能按流量反算**：Q = πr⁴Δp/(8µL)，r 差 1 µm 流量差 40 %，
     *      所以交付写 18–20（留 2 µm 余量）、单只按流量分选；实物孔径没有量具。
     *   ② **补过头就废**：缩到 18 以下不能车、不能磨回去（碳与石墨一样脆），
     *      成品率按 1/2 记。外表面与炉管壁一起长 5 µm，端面要重磨到 0.5 mm 平。
     *   ③ **沉积速率没实测**：按 0.5–1 µm/h（1 000 °C、50 kPa 甲烷的量级）记，
     *      5 µm 要 5–10 h；实际每 2 h 复测一次流量、够了就停 —— 所以 `rate` 写 12 h
     *      是"一只、含复测"的占用，不是炉子的批次时间。
     *
     * 孔形是**喇叭口**：孔口镀得厚、孔底薄（气在孔里被消耗），喉口在进气侧。
     * 射流由喉口定，滴径仍按 20 µm 算；但流量比同径直孔小 20–30 %，
     * 到 50 kHz 的压差要多给一点（发生器那条的 50–100 kPa 够）。
     */
    id: 'make/euv-nozzle-trim',
    name: 'EUV Nozzle Manufacturing', name_zh: 'EUV 喷嘴制造',
    rate: { hours: q(12) },
    produces: [
      {
        item: 'plant/euv-source/nozzle',
        qty: q(1),
        gives: [{ param: 'bore', kind: 'range', min: 18, max: 20, dir: 'atMost' }],
      },
    ],
    uses: [
      // 半成品：`make/euv-nozzle` 那只 30 ± 15 µm。小于 18 的不必补，直接分选。
      { anyOf: [{ item: 'plant/euv-source/nozzle', qty: q(1) }] },
      // 甲烷 10 g：炉管 5 L × 50 kPa × 8 次换气 ≈ 4 g，加吹扫取 10 g。
      { anyOf: [{ item: 'mat/methane', qty: q(1, 100) }] },
      // 氮 1 kg：换气前置换 —— 甲烷与空气混到 5–15 % 就自己烧，先烧掉的是碳。
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
      // 端面重磨的磨料（5 µm 档尾矿粉，与 make/wire-die 同一手艺）。
      { anyOf: [{ item: 'mat/tailings', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '装夹：石墨片进石英夹具，两端通气（孔要通气，不然只有孔口长碳，孔底还是 30）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '测初始孔径：50 kPa 干氮过孔，Q = πr⁴Δp/(8µL) 反算（r 的 1 µm 误差 = 流量 40 %）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '补碳：抽到 50 kPa 甲烷、950–1 000 °C，每 2 h 复测流量，孔缩到 20 µm 停（外表面与炉管壁一起长 5 µm）',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 950, max: 1000 }],
      },
      {
        note_zh: '端面重磨到 0.5 mm（外表面长厚了 5 µm，不磨平喷嘴座压不严）',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '分选：流量落到 18–20 µm 档的入库；<18 报废，>20 再补一轮 —— 一只成品率按 1/2',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '喷嘴 1（30 µm）+ 甲烷 0.01 + 氮 1 + 水 1 + 磨料 1 → 喷嘴 1（18–20 µm）；进孔成碳的只有 0.4 µg，其余约 2.8 g 长在炉管壁与夹具上（随炉管一起换），氮、水、磨料走掉',
  },

  {
    /**
     * CO₂ 激光头。熔制拉管 φ10/φ12 × 1 000（1900–2200 °C，跟着
     * `make/diffusion-tube` 那条先例）→ 车铜电极与铜镜座（镜面 Ra 0.02）→
     * 玻璃-金属封接、抽气、充气 → 出光试验。
     *
     * 功率交付写 30 W：1 m 管、氩代氦、30–50 W/m 的下界。
     * 这条路线的产出**不含电源、不含红外窗口** —— 两处缺口在文件头 ②③。
     */
    id: 'make/euv-co2-laser',
    name: 'CO₂ Laser Head Manufacturing', name_zh: 'CO₂ 激光头制造',
    produces: [
      {
        item: 'plant/euv-source/laser',
        qty: q(1),
        gives: [{ param: 'power', kind: 'range', min: 30, dir: 'atLeast' }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(4) }] },
      { anyOf: [{ item: 'mat/co2', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(50) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '熔制拉管 φ10/φ12 × 1 000（管内壁不许有气泡，否则放电打火）', performedBy: 'plant/arc-furnace', under: [{ param: 'temperature', min: 1900, max: 2200 }] },
      { note_zh: '车铜电极对与三片铜镜座（镜面 Ra 0.02）', performedBy: 'lathe' },
      { note_zh: '玻璃-金属封接、抽气、充 CO₂:N₂:Ar = 1:1:3 到 10 kPa', performedBy: 'plant/robot' },
      { note_zh: '出光试验：铜镜衰减 + 水量热，量 10.6 µm 输出', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(40) },
    unbalanced_zh: '石英 2 + 铜 4 + CO₂ 1 + 氮 1 + 氩 1 + 铜线 2 + 水 50 → 激光头 1 件；水是冷却水，不进成品',
  },

  {
    /**
     * DPP 放电头。从 `std/carbon-electrode-300`（φ300 石墨电极）上锯两段 φ40 做
     * 电极对，端面车出 R、间隙 5 mm，配陶瓷绝缘套与氙气喷嘴。
     *
     * 为什么用石墨：本层没有钨、没有钼，能导电又耐弧的只有碳。代价是碳溅射到
     * 200 mm 外的收集镜上 —— 一片镜面按小时计寿命。这是 DPP 在本层的真正成本，
     * 不在电学上，在镜面上。
     */
    id: 'make/euv-dpp-head',
    name: 'DPP Discharge Head Manufacturing', name_zh: 'DPP 放电头制造',
    produces: [{ item: 'plant/euv-source/dpp-head', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/carbon-electrode-300', qty: q(1) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
      {
        anyOf: [
          {
            item: 'mat/xenon',
            qty: q(1),
            // 氙必须 99.9 %：DPP 的辐射线来自 Xe^10+，20 % 的富氙气里 80 % 是氮与氩，
            // 它们会先被电离、把放电能量吃掉（氙那条曾指出这处缺 need）。
            need: [{ param: 'purity', kind: 'range', min: 99.9, dir: 'atLeast' }],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '锯切与车石墨电极：φ40、端面球面、间隙 5 mm', performedBy: 'lathe' },
      { note_zh: '装陶瓷绝缘套与氙喷嘴（同轴 0.05）', performedBy: 'plant/robot' },
      { note_zh: '检漏（放电试验做不了：1 kV/10 kA 的脉冲电源没有，缺口 ③）', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(12) },
    unbalanced_zh: 'φ300 石墨电极 1 根（锯下两段 φ40）+ 耐火瓷 1 + 氙 1 + 铜 1 → 放电头 1 件；电极切屑不计',
  },

  {
    /**
     * 碎屑抑制。铜箔百叶（0.05 mm、间隔 1 mm）+ 支撑 + φ2 mm 差分孔。
     *
     * 氢帘那一场试验是本文件唯一消耗氢的路线：1 sccm 的流量下量源腔压升，
     * 得到 8.4e-4 Pa —— 文件头问题 1 的氢账就是这么算出来的。
     */
    id: 'make/euv-debris-trap',
    name: 'EUV Debris Mitigation Manufacturing', name_zh: 'EUV 碎屑抑制制造',
    produces: [{
      item: 'plant/euv-source/debris-trap',
      qty: q(1),
      gives: [
        { param: 'lifetime', kind: 'range', min: 0, max: 30000, record: 'mat/debris-lifetime-record' },
        { param: 'reflectivityDrop', kind: 'range', min: 0, max: 50, record: 'mat/debris-lifetime-record' },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 10) }] },
    ],
    needs: ['plant/euv-vacuum', 'plant/clean-room'],
    steps: [
      { note_zh: '冲铜箔百叶（0.05 mm 厚、100 片、间隔 1 mm）', performedBy: 'plant/sheet-shop' },
      { note_zh: '装 φ2 mm 差分孔与支撑', performedBy: 'lathe' },
      { note_zh: '氢帘标定：1 sccm，量源腔压升（应到 8.4e-4 Pa）', performedBy: 'plant/robot', under: [{ param: 'pressure', min: 1e-3, max: 1e-2 }] },
    ],
    rate: { hours: q(30) },
    unbalanced_zh: '铜 2 + 钢板 2 + 氢 0.1 → 碎屑阱 1 件；氢是试验气（1 sccm × 4 h ≈ 0.1 g，按一瓶 0.1 kg 记），不进成品',
  },

  {
    /**
     * 中间焦点组件。φ1 mm 光阑与 φ2 mm 差分孔车在一片铜板上，加热隔离与接管。
     *
     * 最后一道工序是**在光源上对中**：光斑位置是唯一判据，靠 3 个螺钉调。
     * 于是它同时用到 `plant/euv-source`（那台机器）与 `plant/euv-vacuum`（真空）。
     */
    id: 'make/euv-if-module',
    name: 'EUV Intermediate Focus Module Manufacturing', name_zh: 'EUV 中间焦点组件制造',
    produces: [{ item: 'plant/euv-source/if-module', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
    ],
    needs: [ 'plant/euv-vacuum', 'plant/metrology-room'],
    steps: [
      { note_zh: '车 φ1 mm 光阑与 φ2 mm 差分孔（同轴 0.05）', performedBy: 'lathe' },
      { note_zh: '装热隔离与差分接管', performedBy: 'plant/robot' },
      { note_zh: '在光源上对中 IF：看等离子体光斑落在光阑中心，调 3 个螺钉', performedBy: 'plant/robot', under: [{ param: 'pressure', min: 1e-4, max: 1e-3 }] },
    ],
    rate: { hours: q(20) },
    unbalanced_zh: '铜 1 + 钢板 1 + 耐火瓷 1 → IF 组件 1 件；余是切屑',
  },

  // ───────────────────────────────────────────────────────────────────────
  // 高真空系统
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * 粗抽机组。铸泵壳与叶轮 → 车偏心泵腔 → 铣罗茨 8 字形型线（间隙 0.1）
     * → 装配试抽到 1 Pa。
     *
     * 与 `plant/evaporator/pump` 同一套手艺（那一份已经写过一遍），
     * 差别只在它是独立机组、要跑到 1 Pa 并且给涡轮当前级。
     */
    id: 'make/euv-rough-pump',
    name: 'High-Vacuum Pumping System Roughing Pump Set Manufacturing', name_zh: '高真空机组粗抽机组制造',
    produces: [{ item: 'plant/euv-vacuum/pump/rough', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht200', qty: q(40) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/grinder', 'plant/metrology-room'],
    steps: [
      { note_zh: '铸泵壳、叶轮与罗茨转子毛坯', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1350, max: 1450 }] },
      { note_zh: '车偏心泵腔与叶轮（径向间隙 0.05）', performedBy: 'lathe' },
      { note_zh: '铣罗茨 8 字形型线（间隙 0.1，不接触不磨损）', performedBy: 'plant/milling-machine' },
      { note_zh: '装配与试抽：到 1 Pa，用真空计读', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(80) },
    unbalanced_zh: '铸铁 40 + 45 钢 5 + 铜线 2 + 水 10 → 机组 1 套；余是浇冒口与切屑，水是水环的工作水',
  },

  {
    /**
     * 涡轮分子泵。车壳体与 20 级转子盘 → 铣每级 24 片叶片（共 480 片，
     * 叶高从进口 30 mm 收到出口 8 mm）→ 动平衡 G2.5 → 装配试转 2.4 万转。
     *
     * 交付 1e-6 Pa。**装不起来的地方在轴承**：2.4 万转、叶尖 314 m/s 的轴颈
     * 要油气润滑或陶瓷球脂润滑，本层只有 45 钢 + 石墨，没有真空油、没有脂。
     * 所以这条路线的工序全是真的，"装完能连续跑"那一步是假的 —— 缺口 ①。
     */
    id: 'make/euv-turbo-pump',
    name: 'High-Vacuum Pumping System Turbomolecular Pump Manufacturing', name_zh: '高真空机组涡轮分子泵制造',
    produces: [
      {
        item: 'plant/euv-vacuum/pump/turbo',
        qty: q(1),
        gives: [{ param: 'pressure', kind: 'range', max: 1e-6, dir: 'atMost' }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(60) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(10) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(3) }] },
    ],
    needs: ['plant/grinder', 'plant/metrology-room', 'plant/comparator'],
    steps: [
      { note_zh: '车壳体与 20 级转子盘（φ250，级间隙 0.1）', performedBy: 'lathe' },
      { note_zh: '铣每级 24 片叶片，共 480 片（叶高 30 → 8 mm）', performedBy: 'plant/milling-machine' },
      { note_zh: '动平衡 G2.5（比较仪读振幅、试重法找相位，残余 0.5 g·mm/kg）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装配与试转：2.4 万转、叶尖 314 m/s（轴承是本层的门，缺口 ①）', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(160) },
    unbalanced_zh: '铸铁 60 + 45 钢 10 + 铜线 3 → 涡轮泵 1 台；余是切屑与动平衡去重',
  },

  {
    /**
     * 液氮冷阱。弯 φ8 铜盘管 12 圈 → 焊液氮罐与矿棉保温 → 检漏与降温试验。
     *
     * 它挡水汽与返油。冷面 0.5 m²、液氮耗量 ~1 L/h —— 液氮靠气氮节流自产（缺口 ⑦）。
     */
    id: 'make/euv-cold-trap',
    name: 'High-Vacuum Pumping System Liquid Nitrogen Cold Trap Manufacturing', name_zh: '高真空机组液氮冷阱制造',
    produces: [{ item: 'plant/euv-vacuum/pump/cold-trap', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(6) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(3) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1) }] },
    ],
    needs: ['plant/clean-room'],
    steps: [
      { note_zh: '弯铜盘管 φ8 × 12 圈（冷面 0.5 m²）', performedBy: 'plant/robot' },
      { note_zh: '焊液氮罐、包矿棉保温', performedBy: 'plant/sheet-shop' },
      { note_zh: '检漏与降温试验：灌液氮到 −196 °C，看结霜均匀', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '铜 6 + 钢板 3 + 矿棉 1 + 氮 1 → 冷阱 1 件；氮是液氮（试验与首次预冷）',
  },

  {
    /**
     * 真空计。吹玻壳与封接 → 绕热丝与桥路 → 标定。
     *
     * 标定没有标准真空计可比：只能按热丝电阻随压力的变化外推，并用"抽气时间
     * 对应压力"的曲线做一次交叉。于是它只能读到 0.1 Pa，读不到 1e-5 Pa ——
     * 本层测不到自己的工作压力，这是缺口 ⑥。
     */
    id: 'make/euv-vacuum-gauge',
    name: 'High-Vacuum Pumping System Vacuum Gauge Manufacturing', name_zh: '高真空机组真空计制造',
    produces: [{ item: 'plant/euv-vacuum/pump/gauge', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '吹玻壳、封接铜引线', performedBy: 'plant/robot' },
      { note_zh: '绕热丝与惠斯通电桥（没有检流计就用热丝自热亮度比对）', performedBy: 'plant/robot' },
      { note_zh: '标定：用粗抽的时间-压力曲线反推，两点定标', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(8) },
    unbalanced_zh: '玻璃 1 + 铜线 1 + 铁 1 → 真空计 1 只；余是玻璃料与切屑',
  },

  {
    /**
     * **EUV 光源整机装配：vessel → collector → droplet/laser → debris/IF → 检漏。**
     *
     *   vessel 1 + collector 1 + droplet-generator 1 + laser 1
     *   + debris-trap 1 + if-module 1 → plant/euv-source 1 台
     *
     * `plant/euv-source` 不再用 `composedOf`；装配是路线，不是定义。
     * 真空由 `plant/euv-vacuum` 提供，装配后先抽到 1 Pa 做酒精气泡检漏，
     * 再烘烤到 150 °C 看压升；没有氦检漏，漏率只能判到 1e-3 Pa·L/s 级。
     */
    id: 'make/euv-source',
    name: 'EUV Source System Assembly', name_zh: 'EUV 光源整机装配',
    produces: [{ item: 'plant/euv-source', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'plant/euv-source/vessel', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-source/collector', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-source/droplet-generator', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-source/laser', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-source/debris-trap', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-source/if-module', qty: q(1) }] },
      // 放电头是光源的组成件（DPP 放电电极 + 绝缘 + 喷嘴），随光源装配
      { anyOf: [{ item: 'plant/euv-source/dpp-head', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/euv-vacuum'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh:
          '① 清洗腔体/法兰：丙酮 + 异丙醇 + 去离子水；CF 铜垫一次性，不重复用',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 装收集镜：φ300 椭球镜进 vessel，三点支撑；先对中再锁紧，避免夹应力',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 装液滴发生器 + CO₂ 激光：喷嘴对准收集镜第一焦点；激光光路与液滴同轴，偏 0.1 mm 就打偏',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '④ 装碎屑抑制 + IF 模块：百叶在收集镜前 200 mm；IF 光阑 φ1 mm 对到 1.2 mm 像点',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑤ 检漏：接 plant/euv-vacuum 粗抽到 1 Pa，酒精涂焊缝/法兰看气泡；再烘 150 °C 看压升。没有氦检漏，漏率只到 1e-3 Pa·L/s 级，UHV 判据靠压升',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'vessel 1 + collector 1 + droplet 1 + laser 1 + debris 1 + IF 1 → 光源 1 台。没有质量账（part 按件）。装配 24 h；检漏只到 1e-3 Pa·L/s，UHV 靠烘烤压升',
  },

  {
    /**
     * **高真空机组装配：粗抽 → 2 台涡轮 → 冷阱 → 真空计。**
     *
     *   rough 1 + turbo 2 + cold-trap 1 + gauge 1 → plant/euv-vacuum 1 套
     *
     * `plant/euv-vacuum` 不再用 `composedOf`；装配是路线。
     * 先装粗抽/涡轮，再装冷阱与真空计；抽到 1 Pa 做酒精气泡，烘烤后看压升。
     * 没有氦检漏，漏率只到 1e-3 Pa·L/s 级；涡轮轴承仍是缺口（无油气/陶瓷球脂）。
     */
    id: 'make/euv-vacuum',
    name: 'High-Vacuum Pumping System Assembly', name_zh: '高真空机组装配',
    produces: [{ item: 'plant/euv-vacuum', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'plant/euv-vacuum/pump/rough', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-vacuum/pump/turbo', qty: q(2) }] },
      { anyOf: [{ item: 'plant/euv-vacuum/pump/cold-trap', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-vacuum/pump/gauge', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(16) },
    steps: [
      {
        note_zh:
          '① 装粗抽与涡轮：水环泵 + 两级罗茨 + 2 台涡轮；涡轮轴承仍无油气/陶瓷球脂，寿命是缺口',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 装冷阱与真空计：液氮冷阱挡水汽/返油；皮拉尼 + 热偶只到 1e-5 Pa 级，工作压力靠抽气时间反推',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 抽气/检漏：粗抽到 1 Pa，酒精气泡；烘烤后看压升。没有氦检漏，漏率只到 1e-3 Pa·L/s 级',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '粗抽 1 + 涡轮 2 + 冷阱 1 + 真空计 1 → 真空机组 1 套。没有质量账（part 按件）。装配 16 h；没有氦检漏，涡轮轴承是缺口',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...EUV_SOURCE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...EUV_SOURCE_ROUTES];
