/**
 * 二次电子探测器 —— 荧光屏 + 光导 + 光电管。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 这一件补的是 `e-beam-column.ts` 降级⑤ 的第一句
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 那一节列了四条"没有"：
 *
 *   Everhart–Thornley（闪烁体 + 光电倍增管）   要 PMT        —— 仍然没有
 *   ZnS:Ag 闪烁体                              要锌          —— **有了**（`zinc.ts`）
 *   塑料闪烁体（蒽 / PBD + 聚苯乙烯）           要蒽          —— 仍然没有
 *   通道电子倍增器 / 微通道板                   要铅硅酸盐玻璃 —— 仍然没有
 *
 * 四条里只有第二条被补上。所以这一件**不是** Everhart–Thornley：
 * 它是一块 ZnS:Ag 屏、一根光导、一只 PN 结光电管、一级运放。
 * 没有倍增，没有光阴极，没有快闪烁体 —— 三处代价都在下面算成数。
 *
 * 但它确实把"看不见"变成了"看得见"：二次电子（2–50 eV）从表面 5–50 nm 内逃出，
 * 所以**它的分辨率由束斑定，不由相互作用体积定** —— 这正是 BSE 那条路
 * （1–2 µm，被 4.7 µm 的相互作用体积锁死）拿不到的那 100 倍。
 * `make/wafer-inspect-193` 的最细一档 0.09–0.10 µm，这一件给 **0.05 µm**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 问题三：一个 10 keV 电子在 ZnS:Ag 里出多少光子，到光电管还剩几个
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ─── ① 产生 ───────────────────────────────────────────────────────────────
 *
 *   按"1 光子 / 25 eV"的经验律：      10000 / 25 = **400 光子**
 *   按 20 % 能量效率、450 nm（2.76 eV）：10000 × 0.20 / 2.76 = **725 光子**
 *
 * 两个数差 1.8 倍。**本层按 400 记** —— 那 1.8 倍就是降级表第 ④⑤⑥ 三条
 * （ZnS 只有 99.5 %、没有助熔剂、银只能干混）吃掉的那部分，不假装没有。
 *
 * 450 nm 选得对：ZnS 的带隙 3.68 eV（337 nm），所以 450 nm 在 ZnS 里**不自吸收**。
 * 这一条决定了屏可以做厚（8 µm），也是 ZnS:Ag 能从 CRT 时代活到现在的理由。
 *
 * ─── ② 出屏：只有 30 % 逃得出来 ──────────────────────────────────────────
 *
 *   ZnS 折射率 2.4 → 全内反射临界角 arcsin(1/2.4) = 24.6°
 *   平面屏的逃逸率 (1 − cos 24.6°)/2 = **4.5 %**
 *   粉层（1–10 µm 晶粒、多次散射）实测有效逃逸率 **25–30 %**，取 **30 %**
 *
 * 这 4.5 % → 30 % 的差额，就是"粉层比单晶好"的全部内容：晶粒把光散射几次，
 * 总有几次落在逃逸锥里。代价是光从入射点扩散开（这一件不靠屏成像，所以不要紧）。
 *
 * ─── ③ 光导与耦合 ─────────────────────────────────────────────────────────
 *
 *   光导     φ10/φ8、长 30 mm 的玻璃锥，全内反射        **65 %**
 *   耦合     6×6 mm 裸片贴在锥出口，无增透膜（硅 n = 3.6）**60 %**
 *            （面积 36/78 = 46 % 落进裸片，其余靠铝反射罩折回，合 60 %）
 *
 * **打上屏的电子：400 × 0.30 × 0.65 × 0.60 = 47 个光子到光电管。**
 *
 * ─── ④ 电子侧：屏能收到一半的二次电子 ─────────────────────────────────────
 *
 *   屏 φ10 @ 距样品 15 mm、与束轴 45°：立体角 (1 − cos18.4°)/2 = 2.6 %，×cos45° = 1.9 %
 *   前面 5 mm 一层 +300 V 铜网（透过 70 %）：2–50 eV 的电子被场拉弯，
 *   落到屏上的比例从 1.9 % 抬到 **50 %** —— 这就是"收集极"的全部作用，
 *   它不是增益，是**立体角补偿**。
 *
 * **每个出射的二次电子：47 × 0.50 = 23 个光子。**
 *
 * ─── ⑤ 光电管：0.25 A/W，不是 0.4 ────────────────────────────────────────
 *
 * ⚠️ 题设给的"响应 0.4 A/W @450 nm"**物理上不成立**：
 *
 *   R 的上限 = qλ/hc = 1.602×10⁻¹⁹ × 450×10⁻⁹ / (6.626×10⁻³⁴ × 2.998×10⁸)
 *            = **0.363 A/W**（外量子效率 100 %）
 *
 * 裸硅片（无增透膜、剥了钝化层）实测 0.22–0.26 A/W，取 **0.25 A/W = 69 % QE**。
 * 0.4 A/W 要 110 % 的量子效率 —— 这不是"差一点"，是能量守恒。
 *
 * **增益：23 × 0.69 = 16 个光电子 / 每个二次电子。**
 * 这就是这一件的全部增益（PMT 是 10⁶，这里 1.6×10¹）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 问题四：信噪比 —— 1 µs/像素 做不到，10 µs 可以
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ─── 先把"每像素多少电子"算对 ─────────────────────────────────────────────
 *
 *   100 pA × 1 µs = 1×10⁻¹⁶ C = **624 个电子**（不是 6×10⁵）
 *
 * 6×10⁵ 那一档要 **100 nA** —— 差 1000 倍。所以下面的表从 624 起算：
 *   624 SE → 624 × 16 = **1.0×10⁴ 个光电子** → 1.6×10⁻¹⁵ C → 平均电流 **1.6 nA**。
 *
 * ─── 墙不在光子，在电阻热噪声乘结电容乘 GBW ──────────────────────────────
 *
 * 跨阻放大器的噪声带宽被一个乘积锁死（C_in = 100 pF 结电容 + 运放 GBW = 1 MHz）：
 *
 *   R_f = GBW / (2π·C_in·f²)      f 越高，R_f 必须越小
 *   i_n = √(4kT·B/R_f)            R_f 越小，噪声越大 ⇒ **i_n ∝ f^1.5**
 *
 * 四个候选点（T = 300 K，B = (π/2)f）：
 *
 *   驻留   f      R_f(受限)    电阻热噪声  + 暗电流 5 nA 散粒 + 信号散粒   总噪声   SNR@100 pA
 *   1 µs   1 MHz  1.6 kΩ         4.0 nA      50 pA             28 pA          4.0 nA   **0.4**
 *   10 µs  100 k  159 kΩ       128 pA      16 pA             9 pA           129 pA   **12**
 *   25 µs  40 k   995 kΩ       32 pA       10 pA             5.7 pA         34 pA    **47**
 *   250 µs 4 k    1 MΩ(顶到)   10 pA       3.2 pA            1.8 pA         11 pA    **148**
 *
 * 25 µs 那一行是**本层的设计点**，两个独立的墙正好撞在一起：
 *
 *   运放    GBW 1 MHz ÷ (2π × 1 MΩ × 100 pF) 开根 = **40 kHz**（R_f 到 1 MΩ 就到头）
 *   荧光粉  ZnS:Ag 的 10 % 余辉 20–50 µs（P4 是"中短余辉"）→ **20–50 kHz**
 *
 * 所以 25 µs 不是选的，是**两条互不相干的限制交出来的**。这句话是本文件的中心。
 *
 * ─── 结论 ────────────────────────────────────────────────────────────────
 *
 *   **能成像。** 但不是 1 µs/像素：
 *     1 µs   要 SE ≥ 0.76 nA 才有 SNR 3 —— 100 pA 那一档差 7.6 倍，**不能**
 *     10 µs  能，SNR 12（100 pA）/ 1.2（10 pA）
 *     25 µs  能，SNR 47（100 pA）/ 4.7（10 pA）      ← 本层设计点
 *     250 µs 能，2 pA 就够；1 pA 时 SNR 1.5，还要再慢一倍
 *   折算到镜筒：20 nm 束斑给 16 pA 束流、δ ≈ 0.3 → SE 5 pA → **40 µs/像素**，
 *   一个 100 µm 场（20 nm 点距）2.5×10⁷ 点 = **17 分钟**。9.3 nm 束斑只有 0.2 pA
 *   SE → 1.2 ms/像素，**只够对焦距，不够读图**。
 *
 * 所以这一件的用途是**它该有的那个**：看束斑、对焦距、看一小块形貌；
 * 全片读图仍然要靠 STEM（`make/eb-thin-coupon`）或复制。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 设计
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   荧光屏   φ10 石英基片 + **8 µm** ZnS:Ag（晶粒 1–10 µm）+ 40 nm 铝化层
 *           8 µm 的理由：10 keV 电子在 ZnS 里的射程（Kanaya–Okayama，
 *           A = 97.44、ρ = 4.09、Z_eff = 23）是
 *             5 keV 0.60 µm · 10 keV 1.90 · 20 keV 6.1 · 40 keV 19.3
 *           → 8 µm 把 5–20 keV 全吃掉；25 keV 要 8.8、40 keV 要 19.3（本层最多涂 15，所以 40 keV 只吸收一半）
 *   收集极   铜网 + 偏压环，+300 V（从 `plant/e-beam-column/hv-supply` 分压取）
 *   光导     φ10/φ8 玻璃锥，30 mm
 *   光电管   6×6 mm 硅 PN 结裸片，反偏 100 V，0.25 A/W，暗电流 5 nA，C_j ≈ 100 pF
 *   前置放大 1 MΩ + 运放（`std/opamp-chip-general`，GBW 1 MHz），0.13 pA/√Hz
 *   总增益   16（光电子 / SE），带宽 40 kHz，分辨率 12 nm（束斑）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 降级与升级（R8：每处降级都写"恢复原规格要什么"与缺口量级）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ① **没有光电倍增管** → 无倍增，增益 16 而不是 10⁶。差的那 6×10⁴ 倍噪声全靠
 *    运放吃。升级：打拿极（Be-Cu 或 Cs₃Sb 光阴极）；Be-Cu 仍没有，Cs/Sb 现在
 *    只有一次性输入（`cs-sb.ts`），光阴极/打拿极仍未建；缺口 **6×10⁴ 倍增益**（10⁶ / 16）。
 * ② **没有快闪烁体** → ZnS:Ag 的 20–50 µs 余辉把带宽锁在 20–50 kHz。
 *    升级：YAG:Ce（60 ns，要钇）或塑料闪烁体（5 ns，要蒽）；缺口 **10³ 倍带宽**。
 * ③ **运放 GBW 只有 1 MHz** → 配 100 pF 结电容，跨阻带宽 40 kHz。
 *    升级：GBW 10–25 MHz 的运放，缺口 **25 倍**，而那是 1 µm 线宽那一档的事。
 *    这三条**同时**卡在 1 µs/像素上，缺一不可 —— 只升级一条，另外两条还是墙。
 * ④ **ZnS 只有 99.5 %（碳热法）** → 亮度比 4N 低 20–30 %。
 *    升级：H₂S 沉淀（要 `mat/sulfur`），缺口 **50 倍的杂质**（0.5 % → 0.01 %）。见 `zinc.ts` 缺口。
 * ⑤ **没有助熔剂**（NaCl / KCl 都没有）→ 晶粒 1–10 µm 而不是 3–5、亮度再低 30 %。
 *    升级：助熔剂，要一条氯碱/钾盐链；缺口 **1.5 倍亮度**（粒径分布宽 3 倍是余量，不是指标）。
 * ⑥ **银只能干混，没有 AgNO₃ 浸渍** → 激活不均，亮度再低 10–20 %。
 *    升级：硝酸银浸渍（银 + 硝酸，硝酸那条线本层有，但不在本文件的料单里）。
 * ⑦ **没有测光的手段**（没有积分球、没有标准灯）→ `efficiency` 15–20 % 是
 *    工艺保证不是实测。与 `film-monitor.ts` 那几处"量不了"同一性质。
 * ⑧ **屏会"晒黑"**（电子轰击下 ZnS 变褐，光输出 200 h 掉 30 %）→ 200 h 换一片
 *    （写在 `composedOf` 的 `wear` 上）。升级：铝化层加厚 + 更低加速电压，那会更慢。
 * ⑨ **没有测氧** → 900–1000 °C 灼烧时 0.1 % 的氧就把 ZnS
 *    变成 ZnO + SO₂，而这件事**失败得不出声**（粉还是白的，只是不发光）。
 *    这是本文件最诚实的一处降级：判据只有"亮度对不对"，而亮度又量不了（⑦）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 已知缺口（都是"现在没有"）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ① 亮度与效率量不了（⑦），所以 400 光子这个数是**算的**，不是测的。
 * ② 光电管的 C_j = 100 pF 是算的（6×6 mm、反偏 100 V、耗尽 30 µm），
 *    本层没有电容表（`std/capacitor-film-general` 的标称值之外没有测量手段）。
 * ③ `mat/silver` 的 0.5 kg 是按 0.05 % 激活剂算的，没有考虑银在球磨与灼烧里的
 *    挥发损失（900 °C 下银蒸气压 10⁻³ Pa，会掉几个百分点）。
 * ④ 屏的"晒黑"只写了 `wear`（200 h 一片），没有写"亮度随轰击剂量怎么掉"——
 *    那要一个电子束老化台，本层没有。
 * ⑤ 这一件的主设备 `plant/se-detector` 在本文件里**没有产出路线**（机器不许被
 *    路线产出，CONVENTIONS：`mixed_production`）。它的装配是 `composedOf`，
 *    它的使用是 `make/wafer-inspect-se`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目：荧光粉 → 六件零件 → 一台仪器
//
// 顺序就是光走的顺序：ZnS:Ag（发光）→ 屏（衬底与铝化）→ 收集极（把 SE 拉进来）
// → 光导（把光送到管子）→ 光电管（光变电）→ 前置放大（电变数）→ 壳体（遮光与密封）。
// ═══════════════════════════════════════════════════════════════════════════

export const SE_DETECTOR_ITEMS: readonly Item[] = [
  /**
   * ZnS:Ag 荧光粉（银激活硫化锌）。蓝光 450 nm，是本层的"蓝"。
   *
   * 三个规格各自对应文件头里的三笔账：
   *   ag          0.04–0.06 %：题设 0.01–0.1 % 的中段。少了不亮（Ag 是发光中心），
   *               多了浓度猝灭（Ag–Ag 无辐射跃迁）—— 峰值就在 0.05 % 附近
   *   grainSize   3–8 µm：沉淀法能选的窗口（题设 1–10 µm 是整个可行域）
   *   efficiency  15–20 %：能量效率，按 400 光子/10 keV 反推（400 × 2.76 / 10000 = 11 %，
   *               加上未计入的谱分布与背面损失，工艺窗口写 15–20 %）
   *
   * 它是 `mat/zinc-sulfide` 的**唯一**消费者，也是 `mat/silver` 在这一层最小的用处：
   * 1000 kg 粉只要 0.5 kg 银。
   */
  {
    id: 'mat/zns-ag-phosphor',
    name: 'ZnS:Ag Phosphor', name_zh: 'ZnS:Ag 荧光粉',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'ag', kind: 'range', min: 0.01, max: 0.1, unit: '%' },
      { param: 'grainSize', kind: 'range', min: 1, max: 10, unit: 'µm' },
      { param: 'efficiency', kind: 'range', min: 5, max: 30, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * 荧光屏。熔石英基片 φ10 × 1 mm + 8 µm 的 ZnS:Ag 沉降层 + 40 nm 铝化层。
   *
   * 为什么基片是**石英**不是普通玻璃：电子轰击下钠钙玻璃会变褐（色心），
   * 450 nm 的透过率 200 h 掉一半；熔石英只掉几个百分点。这一片只有 0.2 g，
   * 用得起（`mat/quartz-pure` 在本层是有的）。
   *
   * 为什么有铝化层：它做三件事 —— ① 把往背面跑的光反射回光导侧；
   * ② 导电，把屏上攒的电荷导走（否则 100 pA 的束流几分钟就把屏充到几千伏，
   * 二次电子全被顶回去）；③ 挡掉屏自己发的光直接漏进样品室。
   * 40 nm 这个厚度是两头夹出来的：
   *   对电子  10 keV 电子穿过 40 nm 铝只损失 **0.3 keV**（铝的阻止本领 ≈ 7 keV/µm）—— 挡得住光，挡不住电子
   *   对光    450 nm 光在铝里的趋肤深度 **6 nm** —— 40 nm 已经是 6.7 个趋肤深度，不透
   * 两条要求差 100 倍，**这个差就是铝化层存在的原因**。
   */
  {
    id: 'plant/se-detector/scintillator',
    name: 'Secondary Electron Detector Scintillator', name_zh: '二次电子探测器荧光屏',
    unit: '件',
    category: 'part',
    props: [
      { param: 'thickness', kind: 'range', min: 1, max: 30, unit: 'µm', dir: 'atMost' },
      { param: 'diameter', kind: 'range', min: 5, max: 30, unit: 'mm' },
    ],
  },

  /**
   * 收集极。φ12 的铜网（80 目，透过 70 %）+ 铜偏压环 + 石英绝缘座。
   *
   * 它的作用写在文件头 ④：把 1.9 % 的立体角抬到 50 %。**它不是增益。**
   *
   * 偏压 300 V 的两个界：低于 100 V 拉不弯 2 eV 的慢电子（那正是 SE 的大多数）；
   * 高于 500 V 网自己开始场发射，而且会把 BSE 一起收进来（对比度掉）。
   */
  {
    id: 'plant/se-detector/collector',
    name: 'Secondary Electron Detector Collector', name_zh: '二次电子探测器收集极',
    unit: '件',
    category: 'part',
    props: [
      { param: 'bias', kind: 'range', min: 50, max: 600, unit: 'V' },
      { param: 'transmission', kind: 'range', min: 30, max: 95, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * 光导。φ10 → φ8 的玻璃锥，长 30 mm，两端光学抛光。
   *
   * 锥形不是为了聚光（那是错的：锥越收越亮是"亮度守恒"的错觉），是为了**匹配**：
   * 屏 φ10（78 mm²）与裸片 6×6（36 mm²）面积差 2.2 倍，锥把出射角压到 62 %，
   * 于是落在裸片上的那一半不再被浪费。透过 65 % 里，反射损耗 8 %、体吸收 12 %、
   * 端面反射 15 %。
   */
  {
    id: 'plant/se-detector/light-guide',
    name: 'Secondary Electron Detector Light Guide', name_zh: '二次电子探测器光导',
    unit: '件',
    category: 'part',
    props: [
      { param: 'transmission', kind: 'range', min: 20, max: 90, unit: '%', dir: 'atLeast' },
      { param: 'length', kind: 'range', min: 10, max: 100, unit: 'mm' },
    ],
  },

  /**
   * 光电管。6×6 mm 硅 PN 结裸片（`std/photodiode-general` 剥窗口）+ 铝反射罩 + 座的组件。
   *
   * 为什么剥窗口：450 nm 的硅吸收深度 0.2 µm，而封装窗口与钝化层有 1–2 µm ——
   * **光在到达耗尽区之前就被吃了**。HF 30 s 把死层从 1 µm 减到 20 nm，
   * 450 nm 的响应从 0.03 A/W 回到 0.25 A/W（与 `make/eb-detector` 同一个手法）。
   *
   * 6×6 mm 是"面积 vs 电容"的折中：
   *   面积大 → 收光多，但 C_j ∝ 面积 → 带宽掉（文件头问题四）
   *   36 mm²、反偏 100 V、耗尽 30 µm → C_j = ε·A/d = 100 pF
   */
  {
    id: 'plant/se-detector/photocell',
    name: 'Secondary Electron Detector Photocell', name_zh: '二次电子探测器光电管',
    unit: '件',
    category: 'part',
    props: [
      { param: 'responsivity', kind: 'range', min: 0.05, max: 0.36, unit: 'A/W', dir: 'atLeast' },
      { param: 'darkCurrent', kind: 'range', min: 0, max: 100, unit: 'nA', dir: 'atMost' },
      { param: 'junctionCapacitance', kind: 'range', min: 5, max: 1000, unit: 'pF', dir: 'atMost' },
    ],
  },

  /**
   * 前置放大。1 MΩ 跨阻 + `std/opamp-chip-general`（GBW 1 MHz）+ 反馈电容 + 屏蔽盒。
   *
   * 两只运放：一只跨阻（电流→电压），一只做 ×10 电压放大与低通。
   * 反馈电阻是**碳膜**的，不是精密金属膜 —— 因为本层没有那个标准件。
   * 代价写在降级③里：温度系数 500 ppm/K、1/f 拐点 1 kHz。
   * 恒温间（19–21 °C）把温漂压到 1 %/天，够用。
   */
  {
    id: 'plant/se-detector/preamplifier',
    name: 'Secondary Electron Detector Preamplifier', name_zh: '二次电子探测器前置放大',
    unit: '件',
    category: 'part',
    props: [
      { param: 'transimpedance', kind: 'range', min: 10, max: 100000, unit: 'kΩ', dir: 'atLeast' },
      { param: 'bandwidth', kind: 'range', min: 0.5, max: 1000, unit: 'kHz', dir: 'atLeast' },
      { param: 'noiseCurrent', kind: 'range', min: 0.01, max: 10, unit: 'pA/√Hz', dir: 'atMost' },
    ],
  },

  /**
   * 壳体。2 mm 钢板筒 + 铝观察窗座 + 法兰 + 矿棉遮光。
   *
   * "遮光"是它的**第一个**功能，比密封还先：屏上 1 lx 的漏光在光电管上就是
   * 3×10⁻⁵ W，是信号（4×10⁻¹⁵ W）的 10¹⁰ 倍 —— 漏一点就全瞎。
   * 所以内壁要发黑（氧化发黑处理），法兰要双道 O 圈。
   */
  {
    id: 'plant/se-detector/housing',
    name: 'Secondary Electron Detector Housing', name_zh: '二次电子探测器壳体',
    unit: '件',
    category: 'part',
    props: [
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-3, unit: 'Pa·L/s', dir: 'atMost' },
      { param: 'lightLeak', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 二次电子探测器。**没有产出路线** —— 与 `plant/e-beam-column`、`plant/euv-source`
   * 同一种写法：机器的装配是 `composedOf`，它自己不出现在任何 `produces` 里
   * （那会撞 `mixed_production`：空间组合与不可逆加工不能混）。
   *
   * 它 hold 压力 1e-5–1e-3：**壳体是一只独立密封的罐**（遮光与真空是同一件事的两面），
   * 所以它不挂在镜筒的真空上，只挂在镜筒的**束**上 —— 后者由 `make/wafer-inspect-se`
   * 的 `needs` 表达。
   *
   * 四个属性就是文件头的四个数：
   *   resolution  12 nm（束斑给的；屏不参与成像）
   *   gain        16（光电子/SE，没有倍增）
   *   bandwidth   40 kHz（运放与余辉两条墙交出来的）
   *   minCurrent  7 pA（SNR 3 对应的 SE 电流，25 µs 驻留）
   */
  {
    id: 'plant/se-detector',
    name: 'Secondary Electron Detector', name_zh: '二次电子探测器',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
    props: [
      { param: 'resolution', kind: 'range', min: 5, max: 500, unit: 'nm', dir: 'atMost' },
      { param: 'gain', kind: 'range', min: 1, max: 1000, unit: '倍', dir: 'atLeast' },
      { param: 'bandwidth', kind: 'range', min: 0.01, max: 1000, unit: 'kHz', dir: 'atLeast' },
      { param: 'minCurrent', kind: 'range', min: 0.1, max: 10000, unit: 'pA', dir: 'atMost' },
    ],
    composedOf: [
      // 屏是**耗材**：200 h 一片（降级⑧，电子轰击下变褐）。磨损写在装配处，
      // 不写在零件上 —— 同一个零件装在不同机器上寿命不一样。
      {
        item: 'plant/se-detector/scintillator',
        qty: q(1),
        wear: { amount: q(1), per: q(200) },
      },
      { item: 'plant/se-detector/collector', qty: q(1) },
      { item: 'plant/se-detector/light-guide', qty: q(1) },
      { item: 'plant/se-detector/photocell', qty: q(1) },
      { item: 'plant/se-detector/preamplifier', qty: q(1) },
      { item: 'plant/se-detector/housing', qty: q(1) },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线：七条零件路线 + 一条检验路线
//
// 每一条的 `gives` 就是它交付的那一段窗口 —— 窗口比题设窄，是因为窄的那一头
// 才是本层真做得到的（`prop_widened` 那条提示就是为这个写的）。
// ═══════════════════════════════════════════════════════════════════════════

export const SE_DETECTOR_ROUTES: readonly Route[] = [
  {
    /**
     * ZnS:Ag 荧光粉：ZnS 999.5 + 银 0.5 → 1000 kg，900–1000 °C 灼烧 2 h。
     *
     * 999.5 + 0.5 = 1000 —— 质量是平的，因为激活剂只是"掺进去"，不带走什么。
     *
     * 温度的两头：
     *   低于 880   银扩散不进晶格（要 900 以上才有体扩散），粉不亮
     *   高于 1030  ZnS 开始升华（10⁻³ Pa 的硫蒸气压），收率掉、晶粒长到 20 µm
     *
     * 必须在**无氧**下做：`oxygen_ppm` 0–50 由气氛炉 hold。但本层没有测氧手段
     * 所以这一条的实现是"石英坩埚 + 木炭填埋 + 抽气 4 h"，
     * 不是"读到 30 ppm 才点火"。降级⑨ 说的就是这一处。
     *
     * 银是干混不是浸渍（没有 AgNO₃）：球磨 24 h 把 0.5 kg 银磨到 1 µm 以下，
     * 一颗银粒激活它周围约 10 µm 的 ZnS —— 所以激活是**斑驳的**，亮度低 10–20 %
     * （降级⑥）。这是本路线最贵的一处手艺损失。
     */
    id: 'make/zns-ag-phosphor',
    name: 'ZnS:Ag Phosphor Production', name_zh: 'ZnS:Ag 荧光粉制备',
    produces: [
      {
        item: 'mat/zns-ag-phosphor',
        qty: q(1000),
        gives: [
          { param: 'ag', kind: 'range', min: 0.04, max: 0.06 },
          { param: 'grainSize', kind: 'range', min: 3, max: 8 },
          { param: 'efficiency', kind: 'range', min: 15, max: 20 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/zinc-sulfide', qty: q(9995, 10) }] },
      { anyOf: [{ item: 'mat/silver', qty: q(1, 2) }] },
    ],
    needs: [],
    performedBy: 'plant/atmosphere-furnace',
    under: [
      { param: 'temperature', min: 900, max: 1000 },
      { param: 'oxygen_ppm', min: 0, max: 50 },
    ],
    rate: { hours: q(28) },
  },

  {
    /**
     * 荧光屏：沉降涂覆 8 µm 粉层 + 铝化。
     *
     *   粉 20 g + 石英 2 g + 铝 1 g + 水 500 g → 屏 4 件
     *
     * 为什么一批 4 件：φ10 的屏一片只用 2.6 mg 粉，称不准；20 g 粉一批做 4 片
     * 还有 6 倍余量，够赔沉降失败的（沉降法废品率 20–30 %）。
     *
     * **沉降法（settling）的算法**：按 Stokes 定律，5 µm 的 ZnS 粒在 20 °C 水里
     * 沉 42 µm/s —— 8 µm 的粉层 0.19 s 就沉完；而 1 µm 的粒是 1.7 µm/s（4.8 s），
     * 10 µm 是 168 µm/s（0.05 s）。所以"1–10 µm"这条粒径窗口**不是筛出来的，
     * 是沉降时间窗口选出来的**：倾析掉上清液，留下的就是这一段。
     *
     * 铝化用 `plant/evaporator`：40 nm 铝，0.001–0.01 Pa，蒸发速率 1 nm/s。
     * 40 nm 这个数是文件头那个"100 倍诀窍"：对 10 keV 电子损失 0.3 keV（能穿），
     * 对 450 nm 光不透明（趋肤深度 6 nm）。
     */
    id: 'make/se-scintillator',
    name: 'Secondary Electron Detector Scintillator Manufacturing', name_zh: '二次电子探测器荧光屏制造',
    produces: [
      {
        item: 'plant/se-detector/scintillator',
        qty: q(4),
        gives: [
          { param: 'thickness', kind: 'range', min: 7, max: 9 },
          { param: 'diameter', kind: 'range', min: 9.5, max: 10.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/zns-ag-phosphor', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '配浆：20 g 粉 + 500 g 去离子水，超声 10 min（沉降法不用粘结剂，靠范德华力 + 300 °C 灼烧贴牢）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '沉降涂覆：静置 30 s 后倾析，8 µm 层（Stokes：5 µm 粒 42 µm/s）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh: '干燥：60 °C 2 h 再去 300 °C 灼烧 1 h 去有机物（粉层才贴牢）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 250, max: 320 }],
      },
      {
        note_zh: '铝化：40 nm 铝，0.001–0.01 Pa，1 nm/s（对 10 keV 只损失 0.3 keV，对 450 nm 不透）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 1e-3, max: 1e-2 }],
      },
      {
        note_zh: '装框并量厚度（判据 8 ± 1 µm：称重法，2.6 mg/cm² ± 15 %）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(12) },
  },

  {
    /**
     * 光导：熔制拉锥 → 切段 → 端面抛光 → 清洗。
     *
     *   玻璃 20 g → 光导 2 件
     *
     * φ10 → φ8 的锥在玻璃软化温度（780 °C）上拉：拉速 5 mm/s，锥角 4°。
     * 端面必须光学抛光（Ra 1 nm）—— 磨出来的雾面会把 65 % 的透过率打到 20 %，
     * 而这条损失在文件头那张账里是乘进 47 个光子的，所以不能省。
     */
    id: 'make/se-light-guide',
    name: 'Secondary Electron Detector Light Guide Manufacturing', name_zh: '二次电子探测器光导制造',
    produces: [
      {
        item: 'plant/se-detector/light-guide',
        qty: q(2),
        gives: [
          { param: 'transmission', kind: 'range', min: 60, max: 70 },
          { param: 'length', kind: 'range', min: 29, max: 31 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/glass', qty: q(1, 50) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '熔制拉锥：780 °C 软化，φ10 → φ8，锥角 4°，拉速 5 mm/s',
        performedBy: 'plant/kiln',
        under: [{ param: 'temperature', min: 1200, max: 1300 }],
      },
      { note_zh: '切段 30 mm，两端光学抛光（Ra 1 nm，磨雾会把透过率打到 20 %）', performedBy: 'plant/grinder' },
      {
        note_zh: '清洗烘干，量透过率（比对：有件/无件的硅光电池读数，判据 ≥60 %）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(8) },
  },

  {
    /**
     * 光电管：两只 `std/photodiode-general` 剥窗口 → 背面蒸铝 → 装座焊引线。
     *
     * 一只片子做一只管子，另一只是备件（剥窗口的废品率 30–50 %）。
     *
     * 剥窗口的手法与 `make/eb-detector` 完全一样：HF 30 s，死层 1 µm → 20 nm，
     * 450 nm 的响应从 0.03 A/W 回到 0.25 A/W。**同一个手法在两处出现，不是重复，
     * 是同一个物理**：硅在 450 nm 只吸收 0.2 µm，死层比它厚就全白费。
     *
     * 背面蒸 100 nm 铝做反射罩：把穿过耗尽区没被吸收的光反射回来再走一遍，
     * 450 nm 的量子效率从 55 % 抬到 69 %（= 0.25 A/W）。
     */
    id: 'make/se-photocell',
    name: 'Secondary Electron Detector Photocell Manufacturing', name_zh: '二次电子探测器光电管制造',
    produces: [
      {
        item: 'plant/se-detector/photocell',
        qty: q(2),
        gives: [
          { param: 'responsivity', kind: 'range', min: 0.24, max: 0.26 },
          { param: 'darkCurrent', kind: 'range', min: 3, max: 5 },
          { param: 'junctionCapacitance', kind: 'range', min: 80, max: 120 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/photodiode-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 1000) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: 'HF 30 s 剥钝化层与减反射膜（死层 1 µm → 20 nm），去离子水冲净',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh: '背面蒸 100 nm 铝做反射罩（450 nm 的 QE 从 55 % 到 69 %）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 1e-3, max: 1e-2 }],
      },
      { note_zh: '焊引线、粘到铝座上、装遮光罩', performedBy: 'plant/robot' },
      {
        note_zh: '反偏 100 V 量暗电流（判据 ≤5 nA）与响应度（比对法，判据 0.25 ± 0.01 A/W）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(16) },
  },

  {
    /**
     * 前置放大：碳膜 1 MΩ + 两级运放 + 屏蔽盒。
     *
     *   运放 2 + 薄膜电容 4 + 碳 0.01 + 玻璃 0.01 + 铜线 0.002 + 钢板 0.02 → 放大 2 件
     *
     * 反馈电阻为什么是**碳膜**：本层没有精密金属膜电阻那个标准件（`std/` 里
     * 没有电阻这一族），而 1 MΩ 的碳膜可以自己热解出来 —— 玻璃棒上 350–500 °C
     * 热解碳氢，膜厚控制阻值。代价是三个：±10 % 精度、500 ppm/K 温漂、
     * 1/f 噪声拐点 1 kHz。而这一级的噪声底在 129 nV/√Hz（1 MΩ 的热噪声），
     * 1/f 在 40 kHz 带宽里只占 3 %，所以**能用**。
     *
     * 反馈电容 2 pF（`std/capacitor-film-general` 里最小的那只再串）：
     * 它把 40 kHz 以上的噪声压掉，是"用带宽换噪声"的那只旋钮。
     *
     * 噪声 0.13 pA/√Hz = 129 nV/√Hz ÷ 1 MΩ —— 全部来自那只电阻，运放自己的
     * 输入电流噪声（nA/√Hz 级）在这里比它大 10 倍，所以**先用碳膜电阻，
     * 运放的电流噪声反而被它盖住了**（这是本层第一次因为"器件差"而受益）。
     */
    id: 'make/se-preamplifier',
    name: 'Secondary Electron Detector Preamplifier Manufacturing', name_zh: '二次电子探测器前置放大制造',
    produces: [
      {
        item: 'plant/se-detector/preamplifier',
        qty: q(2),
        gives: [
          { param: 'transimpedance', kind: 'range', min: 950, max: 1050 },
          { param: 'bandwidth', kind: 'range', min: 35, max: 45 },
          { param: 'noiseCurrent', kind: 'range', min: 0.12, max: 0.14 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 50) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '在玻璃棒上热解碳膜做 1 MΩ（350–500 °C，膜厚定阻值，±10 %）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 350, max: 500 }],
      },
      {
        note_zh: '装两级（跨阻 + ×10），焊反馈 2 pF，进钢屏蔽盒',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '量跨阻、带宽（方波法）与噪声底（判据 0.13 pA/√Hz）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(20) },
  },

  {
    /**
     * 收集极：织铜网 → 车偏压环 → 装石英绝缘座。
     *
     *   铜线 0.02 + 铜 0.01 + 玻璃 0.01 → 收集极 2 件
     *
     * 80 目铜网（丝径 0.1、孔 0.22）的透过率是 (0.22/0.32)² = 47 %，
     * 而文件头取的是 **70 %** —— 差的那部分是电镀加粗边框换来的（边框只占 15 % 面积）。
     * 网不能太疏：疏了电场穿不过去，边上的 SE 拉不回来。
     *
     * 偏压从 `plant/e-beam-column/hv-supply` 的分压抽头取，不另造电源 ——
     * 那台电源已经在镜筒上（`needs` 里不写：它由镜筒那条路线供给，
     * 这里只是**同一台仪器的另一根线**）。
     */
    id: 'make/se-collector',
    name: 'Secondary Electron Detector Collector Manufacturing', name_zh: '二次电子探测器收集极制造',
    produces: [
      {
        item: 'plant/se-detector/collector',
        qty: q(2),
        gives: [
          { param: 'bias', kind: 'range', min: 250, max: 350 },
          { param: 'transmission', kind: 'range', min: 65, max: 75 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '织 80 目铜网并电镀加粗边框（透过率 47 % → 70 %）', performedBy: 'plant/robot' },
      { note_zh: '车偏压环 φ12 与绝缘座（石英，沿面爬电 10 mm）', performedBy: 'lathe' },
      {
        note_zh: '装配，量透过率与耐压（判据 350 V 不打火）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(6) },
  },

  {
    /**
     * 壳体：折焊筒体与法兰 → 车密封槽 → 内壁发黑 → 检漏。
     *
     *   钢板 2 + 铝 0.5 + 玻璃 0.05 + 矿棉 0.02 → 壳体 1 件
     *
     * 遮光比密封难：1e-5 Pa·L/s 的漏率对应的漏光量已经足够把光电管打饱和
     * （文件头那句话：1 lx 漏光 = 信号的 10¹⁰ 倍）。所以法兰是**双道 O 圈 +
     * 中间抽气**，内壁氧化发黑（反射率 2 %）。
     */
    id: 'make/se-housing',
    name: 'Secondary Electron Detector Housing Manufacturing', name_zh: '二次电子探测器壳体制造',
    produces: [
      {
        item: 'plant/se-detector/housing',
        qty: q(1),
        gives: [
          { param: 'leakRate', kind: 'range', min: 1e-6, max: 1e-5 },
          { param: 'lightLeak', kind: 'range', min: 1e-3, max: 1e-2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1, 50) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '折焊 φ60 × 120 筒体与五个法兰座（3 mm 板，连续焊）', performedBy: 'plant/sheet-shop' },
      { note_zh: '车双道 O 圈密封槽（平面度 0.02、Ra 0.8）', performedBy: 'lathe' },
      { note_zh: '内壁氧化发黑（反射率 2 %），塞矿棉遮光', performedBy: 'plant/robot' },
      {
        note_zh: '保压检漏 24 h（判据 1e-5 Pa·L/s）与暗箱漏光（判据 0.01 %）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(30) },
  },

  {
    /**
     * 二次电子抽检：一片硅片进、一片判过的片出，最细一档 0.05 µm。
     *
     *   片 1 + 水 2 → 判过的片 1
     *
     * **它是产出 `mat/wafer-inspected` 的第五条路线**（前四条：暗场 0.4–0.6、
     * 显微镜 0.7–1.0、镜子法 8–15、193 nm 暗场 0.09–0.10）。
     * 五条不是替代关系，是**五件量具** —— `gives` 让"哪一个答案能用"被下游筛。
     *
     * 它换到了什么、付出了什么（判据：换完之后还做不做那件事）：
     *
     *   换到   minParticle 0.09–0.10 → **0.05**（二次电子从 5–50 nm 深处逃出，
     *           所以分辨率由束斑 12 nm 定，不由相互作用体积定 —— BSE 那条路的
     *           1–2 µm 差 100 倍就是这一句）
     *   付出   coverage 100 % → **0.005 %**。20 nm 点距、25 µs 驻留下，全片
     *           1.96×10¹³ 像素要 **15.5 年**；扫 0.1 %（7.85 mm²）要 136 h；
     *           本条扫的是**一个 600×600 µm 的场**（9×10⁸ 点，6.25 h）。
     *           所以它是**抽检**，不是全检 —— 密度那一格只能报到 300 个/cm²
     *           （0.0036 cm² 上落一颗就是 278 个/cm²，这是统计底，不是仪器差）。
     *
     * 一句话：**它把"最小的能看见"推到 50 nm，代价是"看见多少面积"退到万分之零点五。**
     * 两者不可兼得，而 193 nm 那条路是反过来的（全片、只到 0.1 µm）。
     *
     * 执行者写成探测器自己而不是镜筒：读这条链上新增的那台机器就是它，
     * 镜筒在 `needs` 里（它给束与真空：1e-5–1e-3 由镜筒 hold，19–21 °C 由计量间 hold）。
     * 压力那一条**探测器自己也 hold**（壳体是独立密封罐）—— 两个承担者都合法。
     */
    id: 'make/wafer-inspect-se',
    name: 'Inspected Wafer Manufacturing', name_zh: '检验后晶圆制造',
    produces: [
      {
        item: 'mat/wafer-inspected',
        qty: q(1),
        gives: [
          { param: 'minParticle', kind: 'range', min: 0.05, max: 0.05 },
          { param: 'density', kind: 'range', min: 0, max: 300 },
          { param: 'coverage', kind: 'range', min: 0.005, max: 0.005 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/e-beam-column', 'plant/clean-room', 'plant/metrology-room'],
    performedBy: 'plant/se-detector',
    under: [
      { param: 'pressure', min: 1e-5, max: 1e-3 },
      { param: 'temperature', min: 19, max: 21 },
    ],
    // 一个 600×600 µm 的场 = 9×10⁸ 点 × 25 µs = 6.25 h；+ 装片、对焦 0.75 h
    rate: { hours: q(7) },
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...SE_DETECTOR_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/se-detector',
    name: 'Secondary Electron Detector Assembly', name_zh: '二次电子探测器装配',
    produces: [{
      item: 'plant/se-detector',
      qty: q(1),
      gives: [
      { param: 'resolution', kind: 'range', min: 5, max: 500, dir: 'atMost' },
      { param: 'gain', kind: 'range', min: 1, max: 1000, dir: 'atLeast' },
      { param: 'bandwidth', kind: 'range', min: 0.01, max: 1000, dir: 'atLeast' },
      { param: 'minCurrent', kind: 'range', min: 0.1, max: 10000, dir: 'atMost' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...SE_DETECTOR_ROUTES, ...ASSEMBLY_ROUTES];
