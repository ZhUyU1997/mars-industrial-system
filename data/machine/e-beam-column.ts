/**
 * 电子束柱 —— 一台"读也用它、写也用它"的电子光学系统。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么这一件是"复制芯片"的唯一入口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本层已有的光学分辨极限是 0.17 µm（193 nm + 萤石，见 `litho-m3.ts`）。机器人
 * 身上的 40 nm MCU 与 8 nm SoC 差 5–25 倍 —— **光看不见它们，不是"看不清"，是"看不见"。**
 *
 * 电子束绕开的是波长这一条：20 kV 电子的德布罗意波长
 *
 *   λ = 1.226 / √V [nm] = 1.226 / √20000 = **8.67 pm**
 *
 * 比 193 nm 短四万倍，所以"分辨极限"不再由 λ 定，而由**透镜的像差与阴极的亮度**定。
 * 这是本层唯一一条不看波长的成像路，也是唯一一条**不需要掩模**的写图路：
 *
 *   读   剥一层 → 束扫一层 → 像素图（这就是"图纸"）
 *   写   同一根柱子，把像素图直接写到新片的胶上（无掩模直写，不需要 EUV）
 *
 * 所以这一件不是"又一类设备"，它是芯片这一支能否闭环的那把钥匙。
 * 而它给出的答案不全是好消息 —— 五个问题逐条写清。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 问题一：束斑 5 nm 靠什么？
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 探针直径的账是四项平方相加：
 *
 *   d_p² = (d₀/M)² + (½·C_s·α³)² + (C_c·α·ΔE/V)² + (0.61·λ/α)²
 *          几何        球差            色差             衍射
 *
 * 本层的取值（两透镜镜筒、工作距离 12 mm、20 kV）：
 *
 *   d₀ = 10 µm   热发射钨发叉的虚光源（真机 15–25 µm，这里取乐观值）
 *   C_s = 20 mm  物镜球差系数
 *   C_c = 20 mm  物镜色差系数
 *   ΔE  = 3 eV   2700 K 钨阴极的热电子能量展宽
 *
 * ─── 先把题设那个 50× 算一遍：它是对的 ───────────────────────────────────
 *
 *   10 µm / 50 = **200 nm**。题设没算错，结论也对：50 倍缩小给的是 200 nm，
 *   差 5 nm 四十倍。要 5 nm 得 M = 10 µm / 5 nm = **2000 倍**。
 *
 * ─── 但 2000 倍也不够：5 nm 在 20 kV 下**无解** ──────────────────────────
 *
 * 把三个像差项对 α 最小化（点源极限），得
 *
 *   α = 1.33 mrad 时  C_c·α·ΔE/V = 4.0 nm、0.61λ/α = 4.0 nm
 *   平方相加 → **5.63 nm**
 *
 * 这 5.63 nm 是**点源的下限**。再叠上"虚源缩到 5 nm"那一项：
 *
 *   √(5² + 5.63²) = **7.53 nm**
 *
 * 也就是说：**20 kV 下无论把 M 开到多大，也到不了 5 nm。** 卡住的不是缩小率，
 * 是 3 eV 的热展宽乘 20 mm 的色差系数。
 *
 * 30 kV 好一点（ΔE/V 小 1.5 倍）：λ = 7.08 pm，同样的最小化给 4.16 nm，叠 5 nm
 * 几何项 → **6.5 nm**。仍然不是 5 nm。
 *
 * ─── 5 nm 只有场发射能给，而本层"能试、不能验" ───────────────────────────
 *
 * 虚源降到 5–20 nm（冷场发射 W 针）时几何项几乎为零，20–30 kV 下能到
 * **4.2–6.2 nm**。本层勉强凑得出这套东西：NaOH 电解腐蚀 W 针（碱有）、
 * `plant/euv-vacuum` 的 1e-8 Pa（够）、3 kV 引出（`std/hv-rectifier-general` 串）。
 * 但**没有单晶钨**（多晶针的发射点会跳）、**没有测尖端半径的手段**
 * （要 FIM 或另一台电镜——"看电镜的电镜"不存在）。所以场发射记为**未达到**，
 * 不写进交付窗口。
 *
 * ─── 本层的设计点：9.3 nm、0.72 pA ───────────────────────────────────────
 *
 *   M = 2150  → 几何项 5.0 nm
 *   α = 2.6 mrad → 色差 7.8 nm、衍射 2.0 nm、球差 0.18 nm
 *   d_p = √(5.0² + 7.8² + 2.0² + 0.18²) = **9.3 nm**（设计值；含对中误差按 12 nm 算）
 *
 * 束流由亮度定。钨的 Richardson 常数实测在 60–120 A/(cm²·K²) 之间（逸出功 4.55 eV，
 * patch field 让它在这个区间里漂），2700 K 上 J_c = A_R·T²·e^(−φ/kT) = 1.4–2.8 A/cm²，
 * 取 **1.85 A/cm²**。约化亮度
 *
 *   B_r = J_c·e/(π·k·T) = 1.85×10⁴ / (π·0.2327) = **2.5×10⁴ A/(m²·sr·V)**
 *   J   = B_r·V·π·α² = 2.5×10⁴ × 2×10⁴ × π × (2.6×10⁻³)² = **1.06×10⁴ A/m²**
 *   I_p = J·π·d_p²/4 = 1.06×10⁴ × π × (4.65×10⁻⁹)² = **0.72 pA**（4.5×10⁶ e/s）
 *
 * **答：5 nm 做不到。设计 9.3 nm / 0.72 pA，实际交付按 12 nm 记。**
 * 差的那一点不是手艺，是"热发射"三个字本身 —— 要 5 nm 必须换阴极，而换了也验不了。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 问题二：读的速度
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 题设的算术对：3×3 mm、5 nm 点距 → (3×10⁶)²/25 = **3.6×10¹¹ 点**；
 * 每点 1 µs → 3.6×10⁵ s = **4.2 天/层**；20 层 84 天。
 *
 * **但 1 µs 驻留要 64 pA 打进 5 nm 的点里**（每点 100 个电子算）。
 * 9.3 nm 束斑只有 0.72 pA，能做出的最小束斑（7.6 nm）也只有 0.29 pA —— 差 **90–220 倍**。
 * 真实驻留是 100 e / 0.72 pA = **22 µs**，不是 1 µs。
 *
 * 下表全部按"束斑 = 点距、每点 100 电子、一天按 24 h"算（点距一放，束流按 α² 涨，
 * 所以一层的耗时 ∝ 1/点距⁴ —— 这是这台机器最要紧的一个标度关系）：
 *
 *   点距=束斑   M      α        束流      驻留    一层（9 mm²）  20 层
 *   7.6 nm     2630   2.0 mrad  0.29 pA   56 µs   100 天         5.5 年
 *   9.3 nm     2150   2.6       0.72 pA   22 µs   27 天          1.5 年
 *   15 nm      1330   4.3       5.1 pA    3.1 µs  1.4 天         29 天
 *   20 nm      1000   5.7       16 pA     1.0 µs  6.2 小时       5.1 天
 *   40 nm      500    10.8      229 pA    0.07 µs 6.6 分钟       2.2 小时
 *
 * 三个方案（都是"能不能更快"的正面回答，不是安慰）：
 *
 *   ① 降点距   20 nm（Nyquist 刚好分辨 40 nm 图形）→ 40 nm MCU 20 层 **5.1 天**
 *              代价：8 nm SoC 的 28–36 nm 金属间距看不出来（要 15 nm 点距）
 *   ② 只扫关键层 40 nm MCU 的 20 版里只有 12 版有几何，其余是阱/注入/钝化
 *              （靠电学与光学判，不必成像）→ 20 nm 点距 × 12 层 = **3.1 天**
 *   ③ 并行     不做微透镜阵列（1 万个静电透镜本层做不出），做**多柱并联** ——
 *              前提给的是不限量机器人 → 10 台 × ② = **7.5 小时**
 *
 * 串起来：40 nm MCU 全片 **7.5 小时**（③+②）；8 nm SoC 要 15 nm 点距 → 29 天/20 层，
 * 单柱也读得完，只是慢。
 *
 * ⚠️ 还有一笔不在上表里：**9.3 nm 的分辨率是靠"透射"拿到的**（见问题五），
 * 所以每读一层要先减薄到 100 nm（`make/eb-thin-coupon`，约 4 小时/层，
 * 其中离子束 30 min）。相对 27 天，这笔可以忽略。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 问题三：写的速度与剂量
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本层的胶不是 PMMA，是**重铬酸盐-酚醛负胶**（`mat/photoresist`，见
 * `photoresist.ts`）。它的感度不能抄 PMMA，得从光学感度折算：
 *
 *   光学     100 mJ/cm² @365 nm = 100×10⁻³/(3.40 eV × 1.602×10⁻¹⁹) = 1.84×10¹⁷ 光子/cm²
 *   电子束   20 keV 电子在 0.5 µm 胶层里只落 ~15%（Bethe，其余穿透进衬底）
 *            → 要达到同样的能量沉积密度：**33 µC/cm²**
 *   取        **50 µC/cm²**（负胶溶胀与显影损失留 1.5× 余量）
 *
 * 题设的 10 µC/cm² 是**化学放大胶**的数 —— 本层没有光酸产生剂，所以剂量取它的 5 倍。
 *
 * ─── 题设那笔账重算：数对，但前提是一个拿不到的束流 ─────────────────────
 *
 *   3×3 mm、图形密度 30%（20 层的平均）→ 曝光面积 0.027 cm²
 *   Q = 0.027 cm² × 50 µC/cm² = **1.35 µC**
 *   1 nA → 1.35×10⁻⁶ / 10⁻⁹ = 1350 s = **22.5 分钟/层** ✓（与题设 15 min 同量级）
 *
 * **但 1 nA 只有把束斑糊到 100 nm 才拿得到**（α 开到 8.2 mrad，色差 24.6 nm，
 * 而那个光阑只给 0.83 nA → **27 分钟/层**）。写 40 nm 图形要 9.3 nm 束斑 = 0.72 pA：
 *
 *   1.35 µC / 0.72 pA = 1.88×10⁶ s = **21.7 天/层**；20 层 **434 天**
 *
 * 折中：16 nm 束斑（α = 5 mrad，7.9 pA）→ **47 小时/层**，20 层 39 天。
 * 这就是"写得快"与"写得细"在这台机器上的真实兑换率：**分辨率差 1.7 倍，速度快 11 倍。**
 *
 * ─── "每点剂量"怎么核 ───────────────────────────────────────────────────
 *
 *   50 µC/cm² × (9.3 nm)² = 4.32×10⁻¹⁷ C = **270 个电子/点**
 *   0.72 pA 下驻留 22 µs → 10 MHz 时钟数 **220 拍**，1 拍误差 = 0.45%
 *   → 剂量误差 ≤1%，由 `plant/e-beam-column/control`（计数器 + 石英时钟 +
 *     电流积分）与 `plant/e-beam-column/beam-blanker`（束闸）保证
 *   束流本身每场用 `plant/e-beam-column/faraday-cup` 标一次（1e-13 A 的分辨力）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 问题四：样品台的 10 nm
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本层最好的台有两台，都是 **1 µm**：
 *   `plant/ion-beam-figuring/stage`  positionError ≤ 1 µm（三轴，300 mm）
 *   `plant/photorepeater/stage`      丝杠 + 光栅尺 + 步进电机，1 µm
 * 10 nm 差 **100 倍**。
 *
 * ─── 光栅尺 + 细分这条路，走到 10 nm 就断了 ──────────────────────────────
 *
 * 1 µm 是光栅尺的**分辨力**。细分 100 倍能读出 10 nm 的数，但**分辨力不是准确度**：
 * 要把 1 µm 的栅距在 100 mm 上刻到 ±10 nm，得先有一台干涉仪去标它 —— 而本层
 * **没有稳频激光**（铜绿线相干长度只有 24 µm，Fizeau 平晶只能测 0.3 mm 内，
 * 见 `interferometer.ts`）。细分给出的是"更细的刻度"，不是"更准的位置"。
 *
 * ─── 热：这一条才是硬墙 ────────────────────────────────────────────────
 *
 *   铸铁/钢 α = 11.7×10⁻⁶/K
 *   100 µm 上 1 K → **1.2 nm**（可忽略）
 *   3 mm 芯片上 1 K → **35 nm**
 *   100 mm 行程上 1 K → 1.17 µm
 *
 * 计量室是 19–21 °C（`plant/metrology-room`，±1 K）→ **跨整片的绝对定位被热漂
 * 锁在 35 nm**，除非给样品台套一个 ±0.1 K 的罩子（那 35 nm 降到 4 nm）。
 *
 * ─── 方案：写小场 + **用束自己闭环**（不是光栅尺，也不是纯拼接）──────────
 *
 *   ① 场 = 100 µm。扫场由双偏转线圈给：θ = 100 µm / 8 mm = 12.5 mrad，
 *      场 0.30 mT、7.1 安匝（200 匝 × 36 mA），气隙外无铁 —— 线性好做
 *   ② 场内 10 nm：靠偏转电流的稳定度（1×10⁻⁴ → 10 nm/100 µm），可标
 *   ③ 场间**不靠台**：先用同一条柱子写一组 10 µm 节距的基准标记，再用同一条
 *      柱子把它测出来 —— **束既是笔又是尺**，不需要激光。9.3 nm 束斑测边缘
 *      到 1/5 个束斑 = 2 nm，拼接残差 ≈ **10–20 nm**
 *   ④ 台只负责"把下一个 100 µm 送到场里"，1 µm 的台在这里够用（1/100 场）
 *
 * **答：10 nm 只在 100 µm 场内成立；场与场之间 10–20 nm（闭环后）；跨整片
 * 3 mm 的绝对定位 35 nm（±1 K）/ 4 nm（±0.1 K）。台本身的 1 µm 不是瓶颈 ——
 * 瓶颈是热与"谁来当尺子"。**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 问题五：二次电子探测 —— 本层做不出 SE 探测器
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 先说结论：**二次电子这条路上，本层缺的不是手艺而是料。**
 *
 *   闪烁体 + 光电倍增管（Everhart–Thornley）  要 PMT —— 没有
 *   ZnS:Ag 闪烁体                              要锌 —— `mat/zinc` 不存在
 *   塑料闪烁体（蒽 / PBD + 聚苯乙烯）           要蒽 —— 芳香族只有苯、甲苯、苯酚
 *   通道电子倍增器 / 微通道板                   要**铅**硅酸盐玻璃 —— `mat/lead` 不存在
 *
 * 所以二次电子（2–50 eV，穿不过任何死层）**测不了**。能成像的是下面三种，
 * 分辨率各不相同：
 *
 *   ① PN 结背散射（BSE）—— `std/photodiode-general` 剥掉窗口与钝化层
 *      增益：20 keV/3.6 eV = **5560 对电子空穴/电子**（一个电子就够，不需要倍增）
 *      分辨率：被**相互作用体积**锁死。Kanaya–Okayama 射程在硅里
 *              20 kV → 4.74 µm、5 kV → 0.47 µm、2 kV → 0.10 µm、1 kV → 32 nm
 *              → **20 kV 下 1–2 µm**；降到 2–5 kV 可到 50–200 nm
 *              （低电压的束斑也被色差糊到 21–42 nm，两笔一起限）
 *      **看不到 40 nm 图形。**
 *
 *   ② 样品电流（法拉第杯当样品）—— 测 (1−δ−η)·I_b
 *      绝对、慢。0.72 pA × 22 µs = 1.6×10⁻¹⁷ C 进 1 pF 只有 **16 µV**，
 *      而半导体运放的输入偏置是 nA 级（是信号的 1000 倍）—— **被淹没**。
 *      要测 pA 得用振簧静电计（45 钢簧片 + `std/quartz-resonator-general` 定频），
 *      带宽 10 Hz → 一点 0.1 s → 9×10¹⁰ 点 = **285 年**。
 *      **只用来标定束流与剂量，不成像。**
 *
 *   ③ 透射（STEM）—— 片子减薄到 100 nm，PN 结放在下面直接收 20 keV 透射电子
 *      增益同样是 5560 对/电子，信号是束流的 10–50%
 *      分辨率 = **束斑 9.3 nm**（相互作用体积变成"膜厚投影"，不再是 4.7 µm）
 *
 * **答：能成像的是 ① 与 ③。要读 40 nm 图形只有 ③ —— 代价是每读一层必须先减薄
 * 到 100 nm（`make/eb-thin-coupon`）。①只够找层与定位。②只够标束流。**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 已知缺口（都是"现在没有"，不是"暂未实现"）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① 没有荧光屏（ZnS:Ag 要锌）→ 束斑与焦距**看不见**。9.3 nm 是算出来的，
 *      唯一的实测是"曝一条线，显影后用比较仪量线宽"—— 而比较仪的分辨力是 1 µm。
 *      所以"束斑 12 nm"这个交付值里有 1/3 是自证。
 *   ② 没有测氧 → 气氛炉那两个 oxygen_ppm 0–50 的判据，
 *      在这里仍然是"靠抽气时间与火焰颜色"。钨在 1800 °C 有氧就氧化，
 *      这条缺口直接咬在阴极的良率上。
 *   ③ 没有示波器 → 束闸的 100 ns 开关时间只能按 RC 算（48 Ω × 0.75 mH ≈ 17 µs
 *      是扫描线圈的 L/R；束闸是静电的，C = 20 pF、80 V、`std/hv-thyristor-general`
 *      开关 → 100 ns 量级，算得出、测不出）。
 *   ④ 没有电离规 → 1e-6 Pa 只能靠抽气时间与泵电流反推（`euv-source.ts` 同一个缺口）。
 *   ⑤ 工件的条目只到 `mat/silicon-wafer`。**40 nm MCU 与 8 nm SoC 不在这一层** ——
 *      它们属于机器人那一份。所以读/写两段都按"一片硅片"写，芯片本身进不来。
 *   ⑥ 阴极寿命：2700 K 下钨的蒸发速率约 1 nm/h（丝径 0.12 mm），
 *      50 h 掉 4% 截面就该换；换一次要破真空 + 4 h 烘烤。
 *      一炉 6 根，够用 300 运行小时。
 *   ⑦ `plant/e-beam-column` 的泵组是 `plant/euv-vacuum`（一台**设备**，不是零件），
 *      所以它进不了 `composedOf`，只能写在用它的路线 `needs` 里 —— 与
 *      `plant/euv-source` 同一个处理方式。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目
//
// 零件按"粗到细"：电子枪（阴极、栅极帽、枪室）→ 透镜（聚光、物镜）→
// 光阑 → 偏转 → 镜筒 → 样品室 → 台 → 探测 → 高压 → 束闸 → 控制。
//
// 两个工件（`exposed-wafer`、`thin-coupon`）也在这一节：它们是"写"与"读"的
// 产出物，有自己的路线，所以是条目而不是注释。
// ═══════════════════════════════════════════════════════════════════════════

export const EBEAM_ITEMS: readonly Item[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1.1 电子枪
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 钨发叉阴极。φ0.12 mm 的钨丝弯成 V 形，尖端曲率半径 0.06 mm，
   * 通电到 2700 K 热发射。
   *
   * 它是这台机器唯一的**耗材件**：50 运行小时换一根（丝径蒸发掉 4% 截面）。
   *
   * 为什么是"发叉"不是"螺旋"：直丝的两端要落在栅极帽外面（不然离子轰击 +
   * 热辐射把帽烤变形），而螺旋的轴向磁场会把虚源拉长成一条线 ——
   * 线源在扫描方向上永远比垂直方向糊，本层没有消像散器（要 8 极，
   * 8 个独立电源，本层做不到）。
   *
   * ⚠️ 钨丝是本层最难的一根线（`pyrometer.ts` 已经说过一遍）：钨的加工温度要
   * 1200–1600（脆），拉丝要热拉，没有金刚石模具，只能用小孔硬钢板模 —— 损耗大、
   * 直径不均。**直径不均的阴极，虚源不是一个点，是一团。** 这就是设计值 9.3 nm
   * 而交付按 12 nm 记的原因之一。
   */
  {
    id: 'plant/e-beam-column/cathode',
    name: '电子束柱钨发叉阴极',
    unit: '件',
    category: 'part',
    props: [
      { param: 'virtualSource', kind: 'range', min: 1, max: 100, unit: 'µm', dir: 'atMost' },
      { param: 'brightness', kind: 'range', min: 1000, max: 1000000, unit: 'A/(m²·sr·V)', dir: 'atLeast' },
    ],
  },

  /**
   * 栅极帽（Wehnelt）。钼杯 φ6、孔 φ0.6，压在阴极外面，接 −50…−300 V 偏压。
   *
   * 它的作用是**把虚源往上收**：偏压越负，发射面积越小、虚源越小、束流也越小。
   * 这是"用束流换束斑"的第一级，比换光阑细。
   *
   * 为什么用钼不用钨：钼的蒸发速率比钨低一个量级（1 600 °C 上），而且
   * `mat/molybdenum-powder` 那条线已经在了（`euv-metals.ts`）。
   * 帽的孔边会被离子轰击打成喇叭口 —— 那是寿命的第二个限，300 h 换。
   */
  {
    id: 'plant/e-beam-column/wehnelt',
    name: '电子束柱栅极帽',
    unit: '件',
    category: 'part',
    props: [{ param: 'bias', kind: 'range', min: -400, max: 0, unit: 'V' }],
  },

  /**
   * 枪室。熔石英绝缘子 + 钢板筒 + 石灰吸气 + 高压馈入。
   *
   * 耐压 35 kV（工作 20 kV，留 1.75×）：熔石英的击穿场强 20 kV/mm，
   * 1 mm 壁厚就是 20 kV —— 所以绝缘子做 2 mm、沿面爬电距离 30 mm。
   *
   * 石灰吸气是为了**水**：10⁻⁶ Pa 下残气的主要成分是水，
   * 而钨在 1800 °C 见水就氧化（W + 2H₂O → WO₂ + 2H₂）。
   * 这与 `unblock-pyrometer-filament.ts` 第三节的石灰是同一条手艺。
   */
  {
    id: 'plant/e-beam-column/gun-chamber',
    name: '电子束柱枪室',
    unit: '件',
    category: 'part',
    props: [{ param: 'withstand', kind: 'range', min: 0, max: 100, unit: 'kV', dir: 'atLeast' }],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 1.2 磁透镜（聚光镜 + 物镜）
  //
  // 两台透镜的算法写在路线里。这里要记的是**为什么是两个、不是一个**：
  //   聚光镜把虚源缩到 1–5 µm 的中间像，物镜再缩 200–500 倍到 9.3 nm。
  //   一级做不到 2000 倍（单透镜的缩小率受它的焦距与物距比限，最多 50–100 倍）。
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 聚光镜。软铁磁轭 + 极靴 + 2360 匝铜线。f = 20–60 mm 可调（改励磁电流）。
   *
   * 气隙 8 mm、极靴孔 φ12、锥角 90°。**极靴用纯铁不用铸铁**：铸铁里的片状
   * 石墨把磁导率从 4000 打到 400，同样的安匝只能拿到一半的场。
   */
  {
    id: 'plant/e-beam-column/condenser',
    name: '电子束柱聚光镜',
    unit: '件',
    category: 'part',
    props: [
      { param: 'focalLength', kind: 'range', min: 5, max: 200, unit: 'mm' },
      { param: 'ampereTurns', kind: 'range', min: 100, max: 5000, unit: 'A·匝', dir: 'atLeast' },
    ],
  },

  /**
   * 物镜。与聚光镜同一个原理，但**极靴精度高一个量级**：孔 φ12 与气隙 8 mm
   * 的同轴度要 0.02 mm，因为它是最后一级 —— 它的像差直接就是束斑。
   *
   *   1/f = (e/8mV)·∫B_z²dz      （薄透镜近似）
   *   1/f = 125 m⁻¹ 要 ∫B²dz = 1.14×10⁻⁴ T²·m
   *   Glaser 钟形场（半宽 4 mm）→ B_p = **0.135 T**
   *   NI = B_p·S/μ₀ + B_p·L_fe/(μ₀μ_r) = 856 + 17 = 873 → 留 30% 漏磁 → **1134 安匝**
   *
   * C_s = 20 mm、C_c = 20 mm 是这台机器的两个关键系数 —— 问题一的账全压在它们身上。
   */
  {
    id: 'plant/e-beam-column/objective',
    name: '电子束柱物镜',
    unit: '件',
    category: 'part',
    props: [
      { param: 'focalLength', kind: 'range', min: 2, max: 50, unit: 'mm', dir: 'atMost' },
      { param: 'sphericalAberration', kind: 'range', min: 5, max: 100, unit: 'mm', dir: 'atMost' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 1.3 光阑与偏转
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 光阑组。30 µm 厚钼片上的四个孔：φ20 / φ50 / φ100 / φ200 µm，横向拨动切换。
   *
   * 光阑是**束斑的主要调节手段**：α ≈ 孔半径 / 极靴到光阑的距离（40 mm）。
   *   φ20 → 0.25 mrad（0.29 pA，最小束斑）
   *   φ200 → 2.5 mrad（设计点 0.72 pA）
   *   再大就要开物镜的孔，那是另一个零件了
   *
   * 孔怎么来：钼粉热压 + 轧薄到 30 µm → 双面光刻 → 湿法腐蚀 → 离子束修圆。
   * 双面光刻的对准是本层 5 µm 光刻能干的（孔是 20 µm 以上），
   * 而 `plant/ion-beam-figuring` 的 19 nm 去除函数刚好用来"修圆 + 去毛刺"——
   * 这一件是离子束修形机在芯片链上的第一个正经用处。
   */
  {
    id: 'plant/e-beam-column/aperture',
    name: '电子束柱光阑组',
    unit: '件',
    category: 'part',
    props: [{ param: 'holeDiameter', kind: 'range', min: 5, max: 500, unit: 'µm' }],
  },

  /**
   * 双偏转扫描线圈。四只鞍形线圈（两对，X/Y），200 匝 φ0.1，无铁芯。
   *
   * 为什么是**双**偏转：单偏转的束绕不过光阑中心，视场一大就切束；
   * 两组线圈反向串接可以让束在光阑处不动、在样品上偏 —— 这就是"双偏转"。
   *
   *   θ = 100 µm / 8 mm = 12.5 mrad
   *   B·L = θ·m·v/e = 5.96×10⁻⁶ T·m   （v = 8.39×10⁷ m/s @20 kV）
   *   L = 20 mm → B = **0.30 mT**，鞍形线圈 NI = B·2a/μ₀ = **7.1 安匝**
   *   200 匝 → **36 mA**
   *
   * 电感 L ≈ μ₀N²r = 0.75 mH，R = 43 Ω → L/R = **17 µs**（settling）。
   * 写一个 100 µm 场、20 nm 点距 = 2.5×10⁷ 点，光 settling 就 425 s ——
   * 相对 6 小时的场写时间可以忽略。
   */
  {
    id: 'plant/e-beam-column/scan-coil',
    name: '电子束柱双偏转扫描线圈',
    unit: '件',
    category: 'part',
    props: [
      { param: 'fieldOfView', kind: 'range', min: 10, max: 1000, unit: 'µm', dir: 'atLeast' },
      { param: 'settling', kind: 'range', min: 1, max: 1000, unit: 'µs', dir: 'atMost' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 1.4 镜筒与样品室
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 镜筒。四段 φ80 碳钢筒 + 两层软铁屏蔽 + 内衬铜。
   *
   * 屏蔽算的是地磁：50 µT 沿 0.3 m 的筒走，偏转角 θ = eBL/(mv) = **0.6 mrad**，
   * 在样品上就是 **5 µm** —— 比束斑大五百倍。两层软铁（各 3 mm、850 °C 退火）
   * 把筒内剩场压到 1 µT 以下 → 0.1 µm，才不碍事。
   *
   * ⚠️ 本层**没有坡莫合金**（要镍铁轧制 + 氢气退火，`mat/iron` 与 `mat/nickel`
   * 都在，但没有那条轧制线）。软铁能做到 1 µT，坡莫能到 0.01 µT —— 差 100 倍，
   * 这就是"本层的镜筒比工业件重 3 倍"的原因。
   */
  {
    id: 'plant/e-beam-column/column-tube',
    name: '电子束柱镜筒',
    unit: '件',
    category: 'part',
    props: [{ param: 'residualField', kind: 'range', min: 0, max: 10, unit: 'µT', dir: 'atMost' }],
  },

  /**
   * 样品室。300 × 300 × 250，五个法兰（束入口、样品更换、探测、泵口、观察）。
   *
   * 工作压力 **1×10⁻⁴ Pa**（涡轮泵已够，`plant/euv-vacuum` 持有 1e-8–1 Pa）。
   * 比枪室的 1e-6 宽两个量级，因为样品室有胶、有样品、有出气 —— 而且电子
   * 只需要走完最后 12 mm，平均自由程在 1e-4 Pa 下还有 50 m。
   *
   * 漏率 1×10⁻⁵ Pa·L/s：比离子束修形腔宽 10 倍（那一台要 0.05 Pa 工作气压），
   * 与镀膜腔同档。
   */
  {
    id: 'plant/e-beam-column/chamber',
    name: '电子束柱样品室',
    unit: '件',
    category: 'part',
    props: [{ param: 'leakRate', kind: 'range', min: 0, max: 10, unit: 'Pa·L/s', dir: 'atMost' }],
  },

  /**
   * 五轴样品台。X/Y 各 100 mm 丝杠、Z 10 mm 楔块、倾转 ±10°、旋转 360°。
   *
   * 定位 **1 µm**（丝杠 + 1 µm 光栅尺 + 步进电机，与 `plant/photorepeater/stage`
   * 同一套手艺、同一条精度）。**不是 10 nm** —— 10 nm 由束的偏转给，
   * 台只负责把下一个 100 µm 场送进来（1/100 场，够用）。这一段推理在文件头问题四。
   *
   * 五轴的用处：
   *   X/Y  拼接（3 mm 芯片 = 30 × 30 个 100 µm 场）
   *   Z    调焦（工作距离 12 mm ± 0.1 mm，超了束斑就糊）
   *   倾转 让束与样品表面垂直（斜着打，束斑在样品上拉长 1/cosθ）
   *   旋转 让扫描方向对准芯片的晶向（对准标记那条线）
   */
  {
    id: 'plant/e-beam-column/stage',
    name: '电子束柱五轴样品台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'positionError', kind: 'range', min: 0, max: 10000, unit: 'nm', dir: 'atMost' },
      { param: 'travel', kind: 'range', min: 10, max: 1000, unit: 'mm', dir: 'atLeast' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 1.5 探测
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 电子轰击二极管探测器。两片 `std/photodiode-general`：一片在样品上方收背散射，
   * 一片在样品下方收透射（STEM）。
   *
   * 增益是物理给的，不是电路给的：一个 20 keV 电子在硅里产生 20000/3.6 = **5560**
   * 对电子空穴。所以"没有 PMT"这件事在这一台上不要紧 —— 倍增不是必需的，
   * 缺的是**二次电子穿不过死层**（问题五）。
   *
   * 剥窗口：HF 30 s 去掉钝化层，死层从 1 µm 减到 20 nm。2 kV 的背散射电子
   * 射程只有 100 nm，剥完才收得到。
   *
   * 暗电流 50 nA：反偏 100 V、20 × 20 mm（4 cm²）的片子，按 10 nA/cm² 算就是 40 nA ——
   * 是信号（5560 对/电子 × 0.72 pA 的 35% = **1.4 nA**）的 **28 倍**。
   * 所以背散射像的信噪比不是由散粒噪声定的，是由暗电流的**漂移**定的：
   * 只要它漂小于 0.1%（40 pA），减掉之后残差只有信号的 3%（要用"打一帧空帧减掉"，
   * 本层没有锁相放大器 —— 这是本层对 BSE 成像的最后一次降级）。
   */
  {
    id: 'plant/e-beam-column/detector',
    name: '电子轰击二极管探测器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'gain', kind: 'range', min: 10, max: 100000, unit: '对/电子', dir: 'atLeast' },
      { param: 'darkCurrent', kind: 'range', min: 0, max: 10000, unit: 'nA', dir: 'atMost' },
    ],
  },

  /**
   * 法拉第杯。石墨杯 + 铜抑制环（−100 V）+ 熔石英绝缘 + 齐纳偏压。
   *
   * 它测的是**绝对束流**，不是图像。分辨力 1×10⁻¹³ A：0.72 pA 的束流上有 14%
   * 的读数分辨力 —— 够标剂量（判据 1%），不够成像（那要 16 µV/点，见问题五）。
   *
   * 抑制环为什么必须有：不打 −100 V，二次电子从杯口逃出去，读数偏高 10–50%，
   * 而剂量是照这个数算的 —— 少 10% 的剂量就是显影过度，整层废掉。
   */
  {
    id: 'plant/e-beam-column/faraday-cup',
    name: '电子束柱法拉第杯',
    unit: '件',
    category: 'part',
    props: [{ param: 'minCurrent', kind: 'range', min: 1e-15, max: 1e-9, unit: 'A', dir: 'atMost' }],
    composedOf: [
      { item: 'plant/e-beam-column/faraday-cup/graphite-cup', qty: q(1) },
      { item: 'plant/e-beam-column/faraday-cup/copper-ring', qty: q(1) },
      { item: 'plant/e-beam-column/faraday-cup/quartz-insulator', qty: q(1) },
      { item: 'std/zener-reference-general', qty: q(2) },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 1.6 高压、束闸、控制
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 高压电源。10–30 kV、100 µA，纹波 ≤0.5%。
   *
   * 12 只 `std/hv-rectifier-general`（3 kV/10 A 各）串成 30 kV 堆，倍压整流在
   * 400 Hz 上做（`plant/rotary-converter` 给 400 Hz —— 同样容量的滤波电容，
   * 400 Hz 的纹波是 50 Hz 的 1/8，这是本层能做小高压箱的原因）。
   *
   * 闭环：高压分压电阻（1000:1）→ 与 `std/zener-reference-general` 的 6.2 V
   * 基准比 → `std/opamp-chip-general` 积分 → 调可控硅导通角。
   * 环路带宽 10 Hz（受滤波时间常数限）。
   *
   * ⚠️ 1% 的束流稳定度要 0.1% 的高压稳定度（I ∝ V^1.5 的 1.5 次方）——
   * 而本层**没有高压精密电阻**，分压比靠 100 只 1% 金属膜电阻串起来配对，
   * 温度系数 ±100 ppm/K → 20 K 的温升就是 0.2%。所以高压箱要恒温到 ±5 K
   * 才有 0.1% —— 这条写进路线，不写在条目上。
   */
  {
    id: 'plant/e-beam-column/hv-supply',
    name: '电子束柱高压电源',
    unit: '台',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 0, max: 50, unit: 'kV', dir: 'atLeast' },
      { param: 'ripple', kind: 'range', min: 0, max: 10, unit: '%', dir: 'atMost' },
      { param: 'current', kind: 'range', min: 1, max: 1000, unit: 'µA', dir: 'atLeast' },
    ],
  },

  /**
   * 束闸。一对 φ5 的铜偏转板，间距 5 mm，±80 V 把束甩出光阑。
   *
   * 它的作用只有一个：**把"什么时候打"变成电信号**，于是
   * 剂量 = 束流 × 停留时间 这件事能被计数器数出来。
   *
   * 开关时间 100 ns：C = 20 pF、80 V、`std/hv-thyristor-general` 直接开关。
   * 相对 22 µs 的驻留是 1/220 —— 不影响剂量。
   * 消光比 1000:1（80 V 偏转 0.5 mrad，足够把束甩到 φ200 孔外）。
   */
  {
    id: 'plant/e-beam-column/beam-blanker',
    name: '电子束柱束闸',
    unit: '件',
    category: 'part',
    props: [
      { param: 'switchingTime', kind: 'range', min: 1, max: 10000, unit: 'ns', dir: 'atMost' },
      { param: 'extinction', kind: 'range', min: 10, max: 1000000, unit: '倍', dir: 'atLeast' },
    ],
  },

  /**
   * 剂量与扫描控制单元。8 片 `std/counter-chip-general`（24 位计数链）、
   * 10 MHz 石英时钟、电流积分器、扫描 DAC。
   *
   * 它回答的是这一台机器最要紧的那道算术：
   *
   *   剂量 = 束流 × 停留时间
   *   每点 50 µC/cm² × (9.3 nm)² = 4.32×10⁻¹⁷ C = 270 个电子
   *   0.72 pA 下 = 22 µs = 220 个 10 MHz 拍
 *
   * 计数到 220 就关束闸，误差 1 拍 = 0.45%。
   * 为什么要计数器而不是定时器：束流会漂（阴极蒸发、高压漂、温度），
   * 定时器数的是"时间"，计数器数的是"电子"—— 后者才是剂量。
   * 束流由法拉第杯每场标一次，计数阈值按标定值改。
   */
  {
    id: 'plant/e-beam-column/control',
    name: '剂量与扫描控制单元',
    unit: '件',
    category: 'part',
    props: [
      { param: 'clock', kind: 'range', min: 0.1, max: 100, unit: 'MHz', dir: 'atLeast' },
      { param: 'doseError', kind: 'range', min: 0, max: 20, unit: '%', dir: 'atMost' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 1.7 两个工件：写的产物与读的准备
  //
  // ⚠️ 工件的条目只到"一片硅片"。**40 nm MCU 与 8 nm SoC 不在这一层**（见缺口⑤），
  //    所以这两个条目写的是"一片有图形/一片薄到能透射"的工件，
  //    不写具体是哪颗芯片 —— 写不出来就不写。
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 写好的片子。一层图形已经曝光、还没显影 —— 显影是 `plant/wet-bench` 的事，
   * 在另一条路线上（本文件只管"束写"这一段）。
   *
   * 三个交付窗口就是这一台机器"写得怎么样"的全部实话：
   *   剂量   50 µC/cm²（40–70，±20% 是负胶的宽容度）
   *   线宽   ≤100 nm（40 nm 的图形在 12 nm 束斑下能开到 60–100 nm；
   *                   写到 40 nm 要 9.3 nm 束斑 + 邻近效应校正，本层没做校正）
   *   套刻   ≤50 nm（场间，见问题四；跨片是 35 nm/K 的热漂）
   */
  {
    id: 'plant/e-beam-column/exposed-wafer',
    name: '电子束柱写好的片子',
    unit: '片',
    category: 'part',
    props: [
      { param: 'dose', kind: 'range', min: 1, max: 1000, unit: 'µC/cm²' },
      { param: 'minFeature', kind: 'range', min: 10, max: 10000, unit: 'nm', dir: 'atMost' },
      { param: 'overlay', kind: 'range', min: 10, max: 10000, unit: 'nm', dir: 'atMost' },
    ],
  },

  /**
   * 透射样品（薄片）。3 × 3 mm、厚 100 nm、贴在小铜环上。
   *
   * 它是"读"的前提：9.3 nm 的分辨率只有透射模式拿得到（问题五）。
   * 100 nm 这个数不是随便挑的 —— 20 kV 电子在硅里的平均自由程约 100 nm，
   * 更厚则多重散射把 9.3 nm 的束斑糊成 30 nm 以上。
   *
   * ⚠️ 这一件是**破坏性**的：减薄之后那片芯片就没了。所以读一颗芯片要
   * 先复制一颗、再拿复制品去剥（这也是为什么"读"与"写"必须是同一根柱子）。
   */
  {
    id: 'plant/e-beam-column/thin-coupon',
    name: '电子束柱透射样品',
    unit: '件',
    category: 'part',
    props: [
      { param: 'thickness', kind: 'range', min: 10, max: 1000, unit: 'nm', dir: 'atMost' },
      { param: 'roughness', kind: 'range', min: 0.1, max: 100, unit: 'nm', dir: 'atMost' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 1.8 整机
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * 电子束柱。**没有产出路线** —— 与 `plant/euv-source`、`plant/hv-test-bench`
   * 同一种写法：它是这一条链的入口，在本文件里只作为执行者出现。
   *
   * 它 `holds` 压力 1e-7–1e-3：下界是枪室（冷阱之后），上界是样品室换样时的峰。
   * 泵组本身是 `plant/euv-vacuum`（一台设备，不是零件），所以进不了 `composedOf`，
   * 只写在用它的路线 `needs` 里。
   *
   * 三个属性是这台机器的全部答案：
   *   束斑   9.3 nm（设计）/ 12 nm（含对中误差）
   *   加速电压 10–30 kV（写用 20、读用 20 或 30）
   *   定位   10 nm（100 µm 场内闭环）/ 50 nm（场间）
   */
  {
    id: 'plant/e-beam-column',
    name: '电子束柱',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'pressure', min: 1e-7, max: 1e-3 }],
    props: [
      { param: 'spotSize', kind: 'range', min: 1, max: 1000, unit: 'nm', dir: 'atMost' },
      { param: 'accelVoltage', kind: 'range', min: 10, max: 30, unit: 'kV' },
      { param: 'positionError', kind: 'range', min: 10, max: 10000, unit: 'nm', dir: 'atMost' },
    ],
    composedOf: [
      { item: 'plant/e-beam-column/cathode', qty: q(1) },
      { item: 'plant/e-beam-column/wehnelt', qty: q(1) },
      { item: 'plant/e-beam-column/gun-chamber', qty: q(1) },
      { item: 'plant/e-beam-column/condenser', qty: q(1) },
      { item: 'plant/e-beam-column/objective', qty: q(1) },
      { item: 'plant/e-beam-column/aperture', qty: q(1) },
      { item: 'plant/e-beam-column/scan-coil', qty: q(4) },
      { item: 'plant/e-beam-column/column-tube', qty: q(1) },
      { item: 'plant/e-beam-column/chamber', qty: q(1) },
      { item: 'plant/e-beam-column/stage', qty: q(1) },
      { item: 'plant/e-beam-column/detector', qty: q(1) },
      { item: 'plant/e-beam-column/faraday-cup', qty: q(1) },
      { item: 'plant/e-beam-column/hv-supply', qty: q(1) },
      { item: 'plant/e-beam-column/beam-blanker', qty: q(1) },
      { item: 'plant/e-beam-column/control', qty: q(1) },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线
//
// 十五件零件各一条，外加两条工件路线（写、减薄）。
// 多工序一律 `steps`：这些零件没有一件是一台机床干完的。
// ═══════════════════════════════════════════════════════════════════════════

export const EBEAM_ROUTES: readonly Route[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 2.1 电子枪
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 钨发叉阴极。一炉 6 根，用 1 kg 钨粉。
     *
     *   压制 → 预烧 → 烧结 → 旋锻 → 热拉 → 绕发叉 → 氢中退火
     *
     * 每一段的温度都是钨的加工窗口，不是随手写的：
     *   预烧 1200   粉坯的强度刚够搬动（再低温一碰就碎）
     *   烧结 1800   密度到 95%，晶粒 20–30 µm（再高温晶粒粗化，拉丝会断）
     *   旋锻 1200–1400  钨的韧脆转变温度在 400 上下，但**大变形**要 1200 以上
     *   热拉 800–1000   18 道，φ3 → φ0.12，每道减面 15%
     *   退火 2000   再结晶成等轴晶，不然通电会下垂（sag）
     *
     * **1 kg 粉 → 6 根**：这不是浪费，是拉丝的真实损耗（断头、直径超差、
     * 绕制时开裂）。`pyrometer.ts` 那条路线是 1 kg → 1 根 —— 这里好 6 倍，
     * 因为阴极丝的直径（0.12）比灯丝（0.2–0.3）细、批量大、可以挑。
     */
    id: 'make/eb-cathode',
    name: '电子束柱钨发叉阴极制造',
    produces: [
      {
        item: 'plant/e-beam-column/cathode',
        qty: q(6),
        gives: [
          { param: 'virtualSource', kind: 'range', max: 20, dir: 'atMost' },
          { param: 'brightness', kind: 'range', min: 24000, dir: 'atLeast' },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/tungsten-powder', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '压 φ12×80 钨棒（3 t 液压，2% 石蜡作粘结剂）',
        performedBy: 'plant/press',
      },
      {
        note_zh: '预烧 1200 排蜡，再烧结 1800（H₂ 保护，密度 95%）',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 1750, max: 1800 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      { note_zh: '旋锻 φ12 → φ3（1200–1400 氢焰，每道减面 15%）', performedBy: 'plant/forge' },
      { note_zh: '热拉到 φ0.12（18 道，800–1000，石墨乳润滑，硬钢板小孔模）', performedBy: 'plant/rolling-mill' },
      { note_zh: '绕成 V 形发叉（直边 8 mm，尖端曲率 0.06 mm）', performedBy: 'plant/winder' },
      {
        note_zh: '氢中退火 2000 再结晶，量丝径与尖端半径（丝径 0.12 ±0.01）',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 1900, max: 2000 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '恒温间用比较仪量尖端曲率半径（判据 0.06 ±0.01 mm）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(40) },
  },

  {
    /**
     * 栅极帽。钼粉热压成 φ20×5 的片 → 车杯形 → 钻 φ0.6 → 离子束修圆。
     *
     * 一炉 2 件，用 100 g 钼粉。
     *
     * 孔口为什么要离子束修：钻出来的孔边有 5–10 µm 的毛刺与崩边，那些尖点
     * 在 −300 V 偏压下会**先放电**，束流一跳一跳。离子束 19 nm 的去除函数
     * 把孔边倒成 R5 的圆弧，放电就没了。
     *
     * 这是本层把 `plant/ion-beam-figuring` 用在"毫米级零件"上的第一处 ——
     * 那台机器原本是为 300 mm 的镜子造的，它的台只走 300 mm 而这一件只要
     * 走 20 mm，等于用大炮打蚊子，但除此之外本层没有别的东西能把孔修圆。
     */
    id: 'make/eb-wehnelt',
    name: '电子束柱栅极帽制造',
    produces: [
      {
        item: 'plant/e-beam-column/wehnelt',
        qty: q(2),
        gives: [{ param: 'bias', kind: 'range', min: -300, max: -50 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/molybdenum-powder', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 200) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '钼粉热压成 φ20×5 片（30 MPa、1600 °C）',
        performedBy: 'plant/press',
      },
      {
        note_zh: '热压件在氢中 1600 烧结',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 1550, max: 1650 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      { note_zh: '车杯形（内 φ6、壁 0.5）与 φ0.6 通孔', performedBy: 'lathe' },
      {
        note_zh: '离子束修圆孔边（R5，去毛刺与崩边）',
        performedBy: 'plant/ion-beam-figuring',
        under: [{ param: 'pressure', min: 0.05, max: 0.5 }],
      },
      {
        note_zh: '恒温间量孔径与同轴（φ0.6 ±0.02）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(16) },
  },

  {
    /**
     * 枪室。薄钢板筒 + 熔石英绝缘子 + 石灰吸气 + 高压馈入。
     *
     *   钢板 25 + 熔石英 2 + 铜 1 + 铝 1 + 石灰 0.25 → 枪室 1 件
     *
     * 耐压 35 kV 的算法：熔石英击穿场强 20 kV/mm，绝缘子壁 2 mm → 40 kV，
     * 留 1/2 余量 → **35 kV**（工作 20 kV，1.75×）。
     * 石灰 0.25 kg 吸 1.79 mmol/g × 250 g = 0.45 mol 水，够 10⁻⁶ Pa 下 3000 h。
     */
    id: 'make/eb-gun-chamber',
    name: '电子束柱枪室制造',
    produces: [
      {
        item: 'plant/e-beam-column/gun-chamber',
        qty: q(1),
        gives: [{ param: 'withstand', kind: 'range', min: 35, dir: 'atLeast' }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(25) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(1, 4) }] },
    ],
    needs: ['plant/evaporator', 'plant/metrology-room'],
    steps: [
      { note_zh: '折焊筒体与四个法兰座（3 mm 板，连续焊）', performedBy: 'plant/sheet-shop' },
      { note_zh: '车法兰与铜垫密封槽（平面度 0.02、Ra 0.8）', performedBy: 'lathe' },
      { note_zh: '磨石英绝缘子两端面平行度 0.01、沿面爬电距离 30 mm', performedBy: 'plant/grinder' },
      {
        note_zh: '保压检漏 24 h（判据 1×10⁻⁵ Pa·L/s），装石灰吸气与高压馈入',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(60) },
    unbalanced_zh:
      '钢板 25 + 石英 2 + 铜 1 + 铝 1 + 石灰 0.25 → 枪室 1 件；余是边角料、焊材与加工屑（kg 料装 件 件，质量账在本层不核）',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.2 两台磁透镜
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 聚光镜。软铁磁轭 + 极靴 + 2360 匝铜线，f = 20–60 mm 可调。
     *
     * ─── 安匝数怎么算出来的 ───────────────────────────────────────────────
     *
     *   1/f = (e/8mV)·∫B_z²dz                       （薄透镜近似）
     *   e/(8mV) = 1.099×10⁶ m/(T²·m)   @ 20 kV
     *   f = 8 mm → 1/f = 125 m⁻¹ → ∫B_z²dz = **1.14×10⁻⁴ T²·m**
     *   Glaser 钟形场 B(z) = B_p/(1+(z/a)²)，a = 4 mm：
     *     ∫B²dz = (π/2)·B_p²·a = 1.571·B_p²·0.004
     *     → B_p = √(1.14×10⁻⁴ / 6.28×10⁻³) = **0.135 T**
     *
     *   磁路：气隙 S = 8 mm、铁路 L_fe = 150 mm、μ_r = 1000（纯铁 0.135 T 下）
     *     NI = B_p·S/μ₀ + B_p·L_fe/(μ₀μ_r) = 0.135×0.008/1.2566×10⁻⁶ + 0.135×0.15/(1.2566×10⁻⁶×1000)
     *        = 856 + 17 = **873 安匝**，留 30% 漏磁与边缘 → **1134 安匝**
     *
     *   线圈：φ0.35 漆包线、窗口 30 × 14 mm，一层 75 匝 × 35 层 = 2625 匝，
     *         去掉端部与引出 → **2360 匝**；2360 × 0.48 A = **1133 安匝** ✓
     *         平均匝长 129 mm → 304 m；R = ρL/A = 1.7×10⁻⁸×304/(π(0.175×10⁻³)²) = **54 Ω**
     *         P = I²R = 0.48²×54 = **12.4 W**（自然对流够，不用水冷）
     *         铜重 304 m × 9.62×10⁻⁸ m² × 8930 = **0.26 kg**
     *
     * ⚠️ 焦距**不能直接测**（没有荧光屏，见缺口①）。所以这一件交付的是
     * "按公式算出来的焦距" + "气隙与极靴孔量到 0.01 mm"。要把焦距验出来，
     * 得把它装进整机、用"束斑最小"反推 —— 那是另一件事，本文件不写。
     *
     * ✅ 那把反推的尺子在这里：`plant/cd-sem` 重复性 0.30 nm，
     *    它测的就是束斑与线宽 ⇒ **测尖与束斑从此可以互相标定**，
     *    只是闭环落在 cd-sem 那一侧（"测尖靠本机"）。
     */
    id: 'make/eb-condenser',
    name: '电子束柱聚光镜制造',
    produces: [
      {
        item: 'plant/e-beam-column/condenser',
        qty: q(1),
        gives: [
          { param: 'focalLength', kind: 'range', min: 20, max: 60 },
          { param: 'ampereTurns', kind: 'range', min: 1100, dir: 'atLeast' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron', qty: q(12) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 4) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
    ],
    // `plant/comparator` 不写进 needs —— 它在最后一段当执行者（`redundant_need`）。
    // 恒温室仍然在 needs 里：那一段的 `under` 是它 hold 的。
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '车磁轭与两极靴（气隙 8 mm、孔 φ12、锥角 90°，同轴 0.03）',
        performedBy: 'lathe',
      },
      { note_zh: '绕 2360 匝 φ0.35 漆包线，层间垫 0.05 电话纸', performedBy: 'plant/winder' },
      {
        note_zh: '浸漆固化，装极靴与铝骨架，量气隙 8 ± 0.01、量直流电阻 54 ± 3 Ω',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '恒温间用比较仪量两极靴同轴度（判据 0.03 mm）',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(24) },
  },

  {
    /**
     * 物镜。与聚光镜同一套算法，但极靴精度高一个量级（同轴 0.02），
     * 而且 f 要短（8 mm）—— 它决定 C_s 与 C_c，那两个系数决定束斑。
     *
     *   铁 18 + 铜线 0.26 + 铝 0.5 → 物镜 1 件
     *
     * 为什么物镜的极靴要"锥角 90° + 孔 φ12"：极靴孔越小，C_s 越小（∝ 孔的
     * 三次方量级），但工作距离也越小 —— 12 mm 的工作距离是"能放进五轴台 +
     * 探测器"的下限。这是一个被机械挤出来的数，不是光学挑出来的。
     */
    id: 'make/eb-objective',
    name: '电子束柱物镜制造',
    produces: [
      {
        item: 'plant/e-beam-column/objective',
        qty: q(1),
        gives: [
          { param: 'focalLength', kind: 'range', max: 8.5, dir: 'atMost' },
          { param: 'sphericalAberration', kind: 'range', max: 20, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron', qty: q(18) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 4) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '车极靴（孔 φ12、气隙 8、锥角 90°），端面 Ra 0.4、同轴 0.02',
        performedBy: 'lathe',
      },
      { note_zh: '绕 2360 匝 φ0.35，装水冷环（12 W 不必通水，环留着给 30 kV 的耐压）', performedBy: 'plant/winder' },
      { note_zh: '浸漆、装配、量气隙与孔（8.00 ± 0.01、φ12.00 ± 0.01）', performedBy: 'plant/robot' },
      {
        note_zh: '恒温间量两极靴同轴度（判据 0.02 mm）与端面平行度',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(40) },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.3 光阑与偏转
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 光阑组。30 µm 钼片、四个孔（φ20 / 50 / 100 / 200）。
     *
     *   钼粉 0.05 + 光刻胶 5 g + HF 10 g + 铜 10 g（框架）→ 光阑 1 件
     *
     * 四步：
     *   ① 热压 + 轧薄到 30 µm —— 30 µm 是"孔边能承受 20 kV 场强"的下限
     *      （场强 20 kV / 30 µm = 6.7×10⁸ V/m，钼的场致发射阈值 3×10⁹ 以上，3 倍余量）
     *   ② 双面光刻（φ20 孔用 5 µm 光刻绰绰有余，孔是光刻分辨力的 4 倍）
     *   ③ 湿法腐蚀（HF + 硝酸？本层只有 HF —— 钼不溶于 HF！
     *      ⚠️ 这一处是真的卡：钼要用 HNO₃/H₂SO₄ 或铁氰化钾腐蚀，
     *      而本层料表里**没有硝酸**。所以孔不是腐出来的，是**离子束打出来的**
     *      （19 nm 去除函数，φ20 孔 = 1000 × 1000 个去除格点，2 小时）。
     *      光刻胶在这里的作用只剩"挡束"，不是"挡酸"。
     *   ④ 离子束修圆 + 去毛刺
     */
    id: 'make/eb-aperture',
    name: '电子束柱光阑组制造',
    produces: [
      {
        item: 'plant/e-beam-column/aperture',
        qty: q(1),
        gives: [{ param: 'holeDiameter', kind: 'range', min: 20, max: 200 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/molybdenum-powder', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '钼粉热压成块，再轧到 30 µm（六道，900 °C 中间退火）', performedBy: 'plant/press' },
      {
        note_zh: '轧薄（30 ± 2 µm，用比较仪量）',
        performedBy: 'plant/rolling-mill',
      },
      {
        note_zh: '双面光刻四个孔位（5 µm 线宽，胶厚 1 µm）',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh: '离子束打孔与修圆（φ20/50/100/200，2 h），显影洗胶',
        performedBy: 'plant/ion-beam-figuring',
        under: [{ param: 'pressure', min: 0.05, max: 0.5 }],
      },
      {
        note_zh: '恒温间量四个孔径（判据 ±1 µm）与孔圆度',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(20) },
  },

  {
    /**
     * 扫描线圈四只。铝骨架（鞍形槽）+ 200 匝 φ0.1 漆包线，无铁芯。
     *
     *   铜线 0.05 + 铝 0.25 → 四只（一台机器用 4 只）
     *
     * 无铁芯的理由：铁芯有磁滞，扫描一快（1 kHz 行频）就剩磁、
     * 下一个像素的位置就偏。空气芯的线性由几何定，只要骨架铣得准。
     */
    id: 'make/eb-scan-coil',
    name: '电子束柱双偏转扫描线圈制造',
    produces: [
      {
        item: 'plant/e-beam-column/scan-coil',
        qty: q(4),
        gives: [
          { param: 'fieldOfView', kind: 'range', min: 100, dir: 'atLeast' },
          { param: 'settling', kind: 'range', max: 20, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 4) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '铣铝骨架上的鞍形槽（±2′ 几何精度）', performedBy: 'plant/milling-machine' },
      { note_zh: '绕四只 200 匝 φ0.1，反向串接成双偏转', performedBy: 'plant/winder' },
      {
        note_zh: '装、量电阻（43 ± 2 Ω）与电感（0.75 ± 0.1 mH），量四只的正交度',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(12) },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.4 镜筒、样品室、台
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 镜筒。四段 φ80 筒、两层软铁屏蔽、内衬铜。
     *
     *   钢板 40 + 纯铁 40 + 铜 2 → 镜筒 1 件
     *
     * 退火 850 是**消磁**：钢板卷焊之后有剩磁（0.5–2 mT），不退火就带着
     * 一个恒定偏转，束永远不在轴上。850 °C 保温 2 h、炉冷 ——
     * 与 `plant/resistance-furnace` 的 100–1100 温区对得上。
     */
    id: 'make/eb-column-tube',
    name: '电子束柱镜筒制造',
    produces: [
      {
        item: 'plant/e-beam-column/column-tube',
        qty: q(1),
        gives: [{ param: 'residualField', kind: 'range', max: 1, dir: 'atMost' }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(40) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(40) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
    ],
    needs: ['plant/evaporator', 'plant/metrology-room'],
    steps: [
      { note_zh: '卷焊四段 φ80 筒与两层软铁屏蔽筒', performedBy: 'plant/sheet-shop' },
      {
        note_zh: '850 °C 保温 2 h 消磁退火，炉冷',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 800, max: 900 }],
      },
      { note_zh: '车各段法兰与定位止口（止口配合 0.02）', performedBy: 'lathe' },
      {
        note_zh: '组装、量四段同轴（0.05 mm/300 mm）、保压检漏',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(80) },
  },

  {
    /**
     * 样品室。300 × 300 × 250、五个法兰、工作 1×10⁻⁴ Pa。
     *
     *   钢板 150 + 铜 3 + 玻璃 0.5 → 样品室 1 件
     *
     * 钢板 150 kg 的算法：六个面 0.54 m² + 五个法兰颈 0.09 m² = 0.63 m²，
     * 8 mm 厚 → 0.005 m³ × 7850 = 40 kg；加强筋、门框、支腿、法兰再 110 kg。
     * （比 `euv-source` 那个 1.7 m² 的腔小一半，但厚一倍 —— 样品室要开门，
     * 门框是刚度的大头。）
     */
    id: 'make/eb-chamber',
    name: '电子束柱样品室制造',
    produces: [
      {
        item: 'plant/e-beam-column/chamber',
        qty: q(1),
        gives: [{ param: 'leakRate', kind: 'range', max: 1e-5, dir: 'atMost' }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(150) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(3) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 2) }] },
    ],
    needs: ['plant/evaporator', 'plant/metrology-room'],
    steps: [
      { note_zh: '折焊六面腔体、门框加强筋与五个法兰颈', performedBy: 'plant/sheet-shop' },
      { note_zh: '车五个法兰的铜垫密封槽与门框止口（平面度 0.02）', performedBy: 'lathe' },
      { note_zh: '装石英观察窗', performedBy: 'plant/robot' },
      {
        note_zh: '保压检漏 24 h（涂酒精看气泡 + 压升法，判据 1×10⁻⁵ Pa·L/s）',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(50) },
  },

  {
    /**
     * 五轴台。铸铁床身 + 刮研导轨 + 三根丝杠 + 1 µm 光栅尺 + 步进电机。
     *
     *   铸铁 40 + 45 钢 8 + 铜线 2 + 铝 2 → 台 1 件
     *
     * **定位 1 µm，不是 10 nm**。这是本层能拿出的最好的台（与
     * `plant/photorepeater/stage` 同一套），而 10 nm 由束的偏转给 ——
     * 理由在文件头问题四，这里只重复一句：台负责"送场"，束负责"场内"。
     *
     * 倾转 ±10° 与旋转 360° 用的都是蜗轮蜗杆（`plant/gear-hobbing` 的活，
     * 但那台不在执行设备表里，所以这里用"车 + 磨"配研，精度降一档：±10° 上
     * 的角度分辨力 0.1° → 3 mm 上 5 µm 的余弦误差，够用）。
     */
    id: 'make/eb-stage',
    name: '电子束柱五轴样品台制造',
    produces: [
      {
        item: 'plant/e-beam-column/stage',
        qty: q(1),
        gives: [
          { param: 'positionError', kind: 'range', max: 1000, dir: 'atMost' },
          { param: 'travel', kind: 'range', min: 100, dir: 'atLeast' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(40) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(8) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room', 'plant/gauge-block', 'plant/comparator'],
    steps: [
      {
        note_zh: '浇铸铁床身（HT250，1350–1450），浇完人工时效 6 个月',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1350, max: 1450 }],
      },
      { note_zh: '刮研两轴导轨（12 点/25 mm²）与 Z 楔块斜面', performedBy: 'plant/grinder' },
      { note_zh: '车三根丝杠（T10×2，中径 ±5 µm/300 mm）与蜗轮蜗杆配研', performedBy: 'lathe' },
      {
        note_zh: '装 1 µm 光栅尺、步进电机与楔块，恒温间定位检验（判据 1 µm/100 mm）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(120) },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.5 探测
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 电子轰击二极管探测器。两片光电二极管 + 前置放大 + 屏蔽壳。
     *
     *   光电二极管 2 + 运放 4 + 高压整流 1（偏压）+ 铝 1 + 金 10 g + 银浆 1 g
     *   → 探测器 1 件
     *
     * 三步关键：
     *   ① 剥窗口：HF 30 s 去掉钝化层与减反射膜，死层从 1 µm 减到 20 nm
     *      —— 2 kV 的背散射电子射程只有 100 nm，不剥就一个也收不到
     *   ② 蒸金 20 nm 做接触与屏蔽（金的背散射系数高，别蒸在入射面上 ——
     *      蒸在**背面**，入射面留裸硅）
     *   ③ 前置放大：5560 对/电子 × 0.72 pA 的 35% = 1.58×10⁶ 电子/s
     *      × 5560 = **8.8×10⁹ 对/s = 1.4 nA** 的二极管电流
     *      → 1 MΩ 反馈 → **1.4 mV**。**低噪声运放够用**
     *      （这一处是本层少见的"信号足够大"的地方）
     *
     * ⚠️ 暗电流 40 nA 是信号 1.4 nA 的 **28 倍** —— 所以 BSE 像要靠"打空帧减掉"，
     *    而且每帧都要重打（暗电流随温度漂）。它漂 0.1% 就是 40 pA，残差是信号的 3%。
     *    这是问题五里说的那次降级。
     */
    id: 'make/eb-detector',
    name: '电子轰击二极管探测器制造',
    produces: [
      {
        item: 'plant/e-beam-column/detector',
        qty: q(1),
        gives: [
          { param: 'gain', kind: 'range', min: 500, dir: 'atLeast' },
          { param: 'darkCurrent', kind: 'range', max: 50, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/photodiode-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/hv-rectifier-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/silver', qty: q(1, 1000) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/euv-vacuum'],
    steps: [
      {
        note_zh: 'HF 30 s 剥钝化层与减反射膜（死层 1 µm → 20 nm），去离子水冲净',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 30 }],
      },
      {
        note_zh:
          '背面蒸金 20 nm 做接触（入射面留裸硅）；蒸发台自带泵只到 0.5–5 Pa，高真空由 plant/euv-vacuum 机组抽到 1e-3–1e-2 Pa',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh: '银浆粘片、装前置放大（1 MΩ 反馈）与铝屏蔽壳',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '恒温间量暗电流（反偏 100 V，判据 ≤50 nA）与增益（用已知束流标）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(32) },
  },

  {
    /**
     * 法拉第杯。石墨杯 + 铜抑制环 + 熔石英绝缘 + 齐纳偏压。
     *
     *   碳 0.2 + 铜 1 + 石英 0.1 + 齐纳 2 → 杯 1 件
     *
     * 石墨杯的好处：二次电子产额低（δ ≈ 0.05 @20 kV，金属是 0.1–0.3）、
     * 耐轰击、不充磁。杯口做成 45° 内锥，进来的电子打两三次才出来。
     * 抑制环 −100 V（两个齐纳串），把逃出的二次电子赶回去。
     *
     * 分辨力 1×10⁻¹³ A 的算法：石英绝缘的漏电阻 >10¹⁴ Ω，20 kV 下漏 0.2 pA…
     * ⚠️ 这就是它的极限：**漏电流与 0.72 pA 同量级**，所以读数要"打束/挡束"两次相减。
     * 判据 1e-13 A 是相减之后的。
     */
    id: 'make/eb-faraday-cup',
    name: '电子束柱法拉第杯制造',
    produces: [
      {
        item: 'plant/e-beam-column/faraday-cup',
        qty: q(1),
        gives: [{ param: 'minCurrent', kind: 'range', max: 1e-13, dir: 'atMost' }],
      },
    ],
    // 石墨杯、铜环、石英垫、齐纳在条目 composedOf 上；这里只写总装与漏电测量。
    uses: [],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '装石墨杯、铜抑制环与石英绝缘垫', performedBy: 'plant/robot' },
      {
        note_zh: '接两只齐纳成 −100 V 偏压，量绝缘电阻（>10¹⁴ Ω）与漏电流（<0.2 pA @20 kV）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(10) },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.6 高压、束闸、控制
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 高压电源。12 只 3 kV 整流堆串成 30 kV / 100 µA，400 Hz 倍压，闭环稳 0.1%。
     *
     *   整流堆 12 + 晶闸管 2 + 齐纳 2 + 运放 1 + 铜线 1 + 石英 1 + 矿棉 1
     *   + 钢板 5 + 水 5 → 高压电源 1 台
     *
     * 为什么要 12 只 3 kV 而不是 10 只：3 kV × 10 = 30 kV 是**额定**，
     * 而耐压试验要打 35 kV（1.17×），10 只不够。12 只给 36 kV。
     *
     * 纹波 0.5% 的算法：倍压整流的纹波 ΔV/V = I/(2f·C·V)。
     *   I = 100 µA、f = 400 Hz、V = 30 kV → C = 100×10⁻⁶/(2×400×0.005×30000)
     *   = **0.83 nF** —— 也就是 10 只 0.1 µF/3 kV 的油浸电容串起来再并。
     *   ⚠️ 本层**没有油浸电容**（没有电容器油）→ 用矿棉浸蜡 + 石英板隔开的
     *   平板电容，体积大 10 倍，纹波做到 0.5% 就到头了。
     *
     * 0.1% 的稳定度要恒温 ±5 K（分压电阻的温漂 100 ppm/K）：所以这一台的
     * 最后一道工序是"装进恒温箱、在计量室里标分压比"。
     */
    id: 'make/eb-hv-supply',
    name: '电子束柱高压电源制造',
    produces: [
      {
        item: 'plant/e-beam-column/hv-supply',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 30, dir: 'atLeast' },
          { param: 'ripple', kind: 'range', max: 0.5, dir: 'atMost' },
          { param: 'current', kind: 'range', min: 100, dir: 'atLeast' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/hv-rectifier-general', qty: q(12) }] },
      { anyOf: [{ item: 'std/hv-thyristor-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '绕高压变压器（副边 30000 匝 φ0.1，分 12 层，层间矿棉浸蜡）', performedBy: 'plant/winder' },
      {
        note_zh: '串 12 只整流堆与 10 只平板电容（矿棉浸蜡 + 石英隔板）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '装 1000:1 分压电阻（100 只 1% 金属膜配对）与齐纳基准闭环',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '打 35 kV 耐压、量纹波（判据 0.5%）与 100 µA 满载压降',
        performedBy: 'plant/hv-test-bench',
      },
      {
        note_zh: '恒温间标分压比（20 ± 5 K，判据 0.1%）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(80) },
    unbalanced_zh:
      '器件与铜线按件/匝计，水 5 kg 是工质不进成品；质量账在本层不核（产出以 台 计）',
  },

  {
    /**
     * 束闸。两块 φ5 铜板、间距 5 mm、±80 V、100 ns。
     *
     *   铜 0.1 + 石英 0.05 + 铝 0.2 + 晶闸管 2 + 运放 2 → 束闸 1 件
     *
     * ⚠️ 开关时间**测不出来**（没有示波器，缺口③）：100 ns 是按 C = 20 pF、
     * 80 V、晶闸管的 di/dt 算的。实测只能间接：写一组等间距点，量"点与点之间
     * 的拖尾"—— 拖尾长度 × 扫描速度 = 开关时间，而扫描速度已知。这算"能验，
     * 但精度只有一个量级"。
     */
    id: 'make/eb-beam-blanker',
    name: '电子束柱束闸制造',
    produces: [
      {
        item: 'plant/e-beam-column/beam-blanker',
        qty: q(1),
        gives: [
          { param: 'switchingTime', kind: 'range', max: 100, dir: 'atMost' },
          { param: 'extinction', kind: 'range', min: 1000, dir: 'atLeast' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
      { anyOf: [{ item: 'std/hv-thyristor-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车两块 φ5 偏转板，平行度 0.02、间距 5.00 ± 0.02', performedBy: 'lathe' },
      { note_zh: '装石英绝缘柱与屏蔽壳，引出 ±80 V', performedBy: 'plant/robot' },
      {
        note_zh: '恒温间量极板平行度与绝缘（判据 5.00 ± 0.02 mm、>10¹³ Ω）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(16) },
  },

  {
    /**
     * 剂量与扫描控制。8 片四位计数器串成 24 位、10 MHz 石英钟、电流积分、扫描 DAC。
     *
     *   计数器 8 + 石英谐振器 1 + 运放 6 + 齐纳 2 + 铜 1 + 铝 1 + 玻璃 0.5
     *   → 控制单元 1 件
     *
     * 24 位 = 1677 万拍 × 0.1 µs = 1.68 s —— 一个 100 µm 场（2.5×10⁷ 点 × 22 µs
     * = 550 s）要重装 330 次。这就是为什么要有"场计数器 + 点计数器"两级：
     * 24 位管一个场，场结束重装。
     *
     * ⚠️ 本层**没有 PROM**（`multilayer.ts` 的天花板是 40 门/片），所以扫描
     * 图形不是"存进去放出来"，而是**计数器 + 比较器现算**：X 计数到 5000 换行、
     * Y 加一。图形数据（那 3.6×10¹¹ 个点）**根本进不了这台机器** —— 它只存
     * 一层的"走法"，图形靠光刻胶本身记住。这一点与工业直写机（要几 TB 的
     * 图形数据流）差得最远，也是本层"读出来也写不快"的根（问题二、三）。
     */
    id: 'make/eb-control',
    name: '剂量与扫描控制单元制造',
    produces: [
      {
        item: 'plant/e-beam-column/control',
        qty: q(1),
        gives: [
          { param: 'clock', kind: 'range', min: 10, dir: 'atLeast' },
          { param: 'doseError', kind: 'range', max: 1, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(8) }] },
      { anyOf: [{ item: 'std/quartz-resonator-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(6) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 2) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '焊 8 片计数器成 24 位链（点计数 + 场计数两级）', performedBy: 'plant/robot' },
      { note_zh: '装 10 MHz 石英钟与扫描 DAC（12 位，两轴）', performedBy: 'plant/robot' },
      {
        note_zh: '用齐纳基准 + 标准电阻标电流积分器（判据 1%），标扫描线性（1×10⁻⁴）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(40) },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.7 两条工件路线：写一层、减薄一片
  //
  // 这两条是"这台机器怎么被用"，不是"这台机器怎么被造"。
  // 它们让 `plant/e-beam-column` 不是一台闲置设备（`idle_machine` 的判据是
  // "有没有 route 由它执行"）。
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 写一层。这就是"无掩模直写"：束按图形走，走到的地方胶交联。
     *
     *   硅片 1 + 胶 10 g + 水 1 + HF 0.01 kg → 写好的片子 1 片
     *
     * 时间那一栏写的是**设计点的真数**，不是"工业机的一小时"：
     *
     *   图形密度 30% × 0.09 cm² × 50 µC/cm² = 1.35 µC
     *   1.35×10⁻⁶ C / 0.72×10⁻¹² A = 1.88×10⁶ s = **521 小时**
     *
     * 这就是问题三的结论落在这条路线上的样子：**一层 22 天。**
     * 20 层 434 天 —— 而 16 nm 束斑（α 5 mrad，7.9 pA）能把它压到 47 h/层（20 层 39 天）。
     * 所以"写多细"是一个要当场决定的事，不是这台机器的固定参数。
     *
     * `under` 里的两条：
     *   压力 1e-5–1e-3  由 `plant/e-beam-column` 自己 hold（它是执行者）
     *   温度 19–21      由 `plant/metrology-room` hold（它在 needs 里）
     */
    id: 'make/eb-expose-layer',
    name: '电子束柱写好的片子制造',
    produces: [
      {
        item: 'plant/e-beam-column/exposed-wafer',
        qty: q(1),
        gives: [
          { param: 'dose', kind: 'range', min: 40, max: 70 },
          { param: 'minFeature', kind: 'range', max: 100, dir: 'atMost' },
          { param: 'overlay', kind: 'range', max: 50, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 100) }] },
    ],
    needs: ['plant/clean-room', 'plant/euv-vacuum', 'plant/metrology-room'],
    performedBy: 'plant/e-beam-column',
    under: [
      { param: 'pressure', min: 1e-5, max: 1e-3 },
      { param: 'temperature', min: 19, max: 21 },
    ],
    rate: { hours: q(521) },
  },

  {
    /**
     * 减薄。把片子切成 3×3 mm、磨到 30 µm、离子束减到 100 nm、贴铜环。
     *
     *   硅片 1 + 磨料 1 + 水 2 + 氩 0.1 + 胶 5 g → 薄片 1 件
     *
     * 100 nm 这个数是**电子的平均自由程**：20 kV 在硅里约 100 nm，
     * 更厚则多重散射把 9.3 nm 的束斑糊成 30 nm 以上（问题五③）。
     *
     * 三步减薄，每步留 1/10 的余量：
     *   线锯   700 µm → 30 µm（切 3×3 方块，切片损耗 200 µm）
     *   CMP    30 µm → 1 µm（机械抛光，去线锯损伤层 5 µm）
     *   离子束 1 µm → 100 nm（19 nm 去除函数，30 min，氩 0.05 Pa）
     *
     * ⚠️ 离子束的 600 eV 氩会在表面留 5–10 nm 的非晶层，那正好是 40 nm
     * 图形的 1/4 —— 读出来的边缘会糊。这是本层"读"的最后一次精度损失，
     * 记在这里而不是藏起来。
     */
    id: 'make/eb-thin-coupon',
    name: '减薄',
    produces: [
      {
        item: 'plant/e-beam-column/thin-coupon',
        qty: q(1),
        gives: [
          { param: 'thickness', kind: 'range', max: 100, dir: 'atMost' },
          { param: 'roughness', kind: 'range', max: 5, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '线锯切 3×3 mm 方块，背面减到 30 µm', performedBy: 'plant/wire-saw' },
      { note_zh: 'CMP 机械抛光到 1 µm（去线锯损伤层 5 µm）', performedBy: 'plant/cmp-polisher' },
      {
        note_zh: '离子束减薄到 100 nm（19 nm 去除函数、30 min、氩 0.05 Pa）',
        performedBy: 'plant/ion-beam-figuring',
        under: [{ param: 'pressure', min: 0.05, max: 0.5 }],
      },
      {
        note_zh: '贴到铜环上，量厚度（判据 100 ± 20 nm）与粗糙度（≤5 nm）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(4) },
  },

  {
    /**
     * 用二次电子读一层（这条路线让降级⑤闭合）。
     *
     * 在这之前"读"只有两条路：背散射（1–2 µm，看不见 40 nm）与 STEM 透射
     * （9.3 nm，但每层要先把片子减薄到 100 nm）。两条都不适合 20 层循环。
     *
     * 补上 `plant/se-detector`（ZnS:Ag 屏 + 光电管，`data/machine/se-detector.ts`）
     * 之后有了第三条路：**块样直接成像，不用减薄**。代价是慢 ——
     * 运放 GBW 1 MHz × 100 pF 与 ZnS:Ag 余辉 20–50 µs 两条墙夹出
     * **25 µs/像素**（SNR 47）。20 nm 束斑、40 µs/像素、100 µm 场 = **17 min/层**。
     *
     * **读出分辨率 0.05 µm**（20 nm 束斑的 2.5 个像素）—— 比
     * `make/deprocess-trace` 的 5 µm 世代好 100 倍，正好够 0.13 µm 的图形
     * （不够 40 nm 的 MCU，那还要 9.3 nm 束斑 + STEM）。
     *
     * ⚠️ 0.05 µm 是"读得出"，不是"画得出"：SE 像转回玻璃原图的线宽仍是
     * ≤0.05 mm（条目 `lineWidth` 的 mm 口径，与手刻原图同一档）。
     */
    id: 'make/eb-read-layer',
    name: '一层的手刻原图制造',
    produces: [
      {
        item: 'std/layer-tracing-general',
        qty: q(1),
        // 写回原图的线宽（mm 口径）：0.05 µm 是读出分辨率，不是这里的交付值。
        gives: [{ param: 'lineWidth', kind: 'range', max: 0.05, dir: 'atMost' }],
      },
    ],
    uses: [
      // 交付 ≤0.05 mm；这里要的是足够细的输入，不是下限 0.04。
      { anyOf: [{ item: 'std/layer-tracing-general', qty: q(1), need: [{ param: 'lineWidth', kind: 'range', max: 0.05, dir: 'atMost' }], onRelax: 'functional-kept' }] },
    ],
    needs: ['plant/se-detector', 'plant/metrology-room'],
    steps: [
      { note_zh: '装片、抽到 1e-4 Pa（SE 要洁净表面，碳氢一层就掉一半信号）', performedBy: 'plant/euv-vacuum' },
      { note_zh: '20 nm 束斑、40 µs/像素、100 µm 场扫描（17 min/层）', performedBy: 'plant/e-beam-column' },
      { note_zh: 'SE 像转原图（玻璃干版，与 deprocess 的工艺共用）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(2) },
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...EBEAM_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/e-beam-column',
    name: '电子束柱装配',
    produces: [{
      item: 'plant/e-beam-column',
      qty: q(1),
      gives: [
      { param: 'spotSize', kind: 'range', min: 1, max: 1000, dir: 'atMost' },
      { param: 'accelVoltage', kind: 'range', min: 10, max: 30 },
      { param: 'positionError', kind: 'range', min: 10, max: 10000, dir: 'atMost' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...EBEAM_ROUTES, ...ASSEMBLY_ROUTES];
