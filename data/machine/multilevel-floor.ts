/**
 * 多层互连的两件地基：化学机械抛光（CMP）与缺陷检测（颗粒计数）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么是这两件
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 判决：**EUV 只替代光刻一步，真正缺的是 CMP 与缺陷检测** ——
 * 那两件不是 EUV 特有，而是 L4 / L5 / EUV 共用的地基。跳过它们，EUV 造出来也用不了。
 *
 * 数据里两处早就把这话说了一半，只是没有对应条目：
 *
 *   `make/euv-mirror-300`   80 层 Mo/Si 镀完了，**从没说每层之间怎么平坦化**
 *   `make/cpu-32bit` 降级⑧   "没有 CMP、没有铜 → 蒸铝，电迁移寿命 3 年（不是 10）"
 *
 * 所以本文件只补这两件的**物**：一台抛光的机器、一台数颗粒的机器，以及它们各自的零件、
 * 两条产物路线、三条检验路线。它不碰别的文件，接线（`tools/report.ts` 的 import 与展开）
 * 由主 agent 做。
 *
 * ⚠️ 一处口径先说清：**本层的片是 φ100**（`mat/silicon-wafer`，wafer.ts 第 49 行；
 * `unblock-evaporator-bell` 第 120 行也写着"本层硅片就是 φ100 档"）。
 * 而任务给的判据是"300 mm 片上均匀性 <5 %"。所以下面所有算式按 **φ300 设计口径**写，
 * 并说明这一项在 φ100 上等于多少 —— **同一个数**（问题一：8μr_s/R 与片子大小无关，
 * 因为载荷与摩擦力矩一起按 R² 变）。而**本文件造出来的片子是 φ100**，
 * 因为本层没有 φ300 片（降级⑩）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 问题一：CMP 的均匀性靠什么？
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 去除速率服从 Preston 方程 **R = k·P·v**（k 是 Preston 系数，本层取 1×10⁻¹³ m²/N，
 * 是石英浆对 SiO₂ 的量级；未标定，所以整条链是开环的）。
 *
 * **速度项是唯一白给的。** 抛光盘与载片头同向、同速旋转时，
 *
 *     v = |ω × r_盘 − ω × r_片| = |ω × (r_盘 − r_片)| = ω·L        （L = 两轴中心距）
 *
 * v 与片上的位置**无关** —— ω_p = ω_c 时相对速度在整个片面上是常量。
 * 取 ω = 3.14 rad/s（30 r/min）、L = 0.20 m ⇒ **v = 0.63 m/s**。
 * 片上任何一点的速度都等于这个数，所以速度项贡献 0 %。
 *
 * **压力项则一点余量都没有。** 本层没有气囊（聚氨酯要异氰酸酯 + 多元醇，本层没有），
 * 也没有闭环（`std/` 白名单里没有压力传感器，也没有电流表）⇒ **只有一个压力区**。
 * 压力均匀性只能靠两个**被动**件：
 *
 *   ① 球铰自找正：载片头挂在球面座上，压力合力把片子自己摆平到与盘面平行。
 *      能摆多平由**摩擦**定 —— 倾斜要克服的力矩是 μ·N·r_s，
 *      而压力不均给出的力矩是 Δp·πR³/8：
 *
 *          ΔP/P = 8·μ·r_s/R
 *
 *      N = P·πR² = 21 kPa × π(0.15)² = 1.48 kN；球面座按投影面积算
 *      q = N/(πr_s²) = 1.48 kN/(π·25 mm²) = **18.8 MPa**（青铜/铸铁座许用 50–100 MPa，
 *      静载，余量 3–5 倍）⇒ r_s = 5 mm 够；淬硬钢球对青铜窝，油润 μ = 0.1：
 *
 *          ΔP/P = 8 × 0.1 × 5/150 = **2.7 %**（φ300）
 *
 *      **这一项与片子大小无关**：r_s 由 q = N/(πr_s²) 定，N ∝ R² ⇒ r_s ∝ R ⇒
 *      r_s/R 是常数。φ100 上也是 2.7 %（同一个 μ 时）。μ 若到 0.2（干摩擦），
 *      5.3 % —— **门槛就在 μ 上，而不在结构上。**
 *
 *   ② 弹性垫：矿棉毡 + 玻璃布背衬（本层没有聚氨酯，见降级⑤）。它把残余倾斜
 *      按 p = E·δ/t 换成压力。3 mm 毡、10 % 压缩工作的好处是"能吸收 0.3 mm 的
 *      高低差"，代价是**垫厚公差直接变成压力公差**：3.0 ±0.1 mm（模压限位）
 *      ⇒ **±3 %**。这条是 CMP 里最反直觉的一句：**软垫换来的均匀性要用厚度公差付账。**
 *
 * 预算（φ300，三项独立）：
 *
 *     球铰 μ = 0.1                     2.7 %
 *     垫厚 3.0 ±0.1 mm                 3.0 %
 *     浆料沿盘面的分布梯度（中心加料）  1.5 %
 *     ────────────────────────────────────────
 *     合成 √(2.7² + 3.0² + 1.5²) = **4.3 %** < 5 % ✓（余量 14 %）
 *
 * 结论：**靠"球铰 + 毡垫"两件被动件，算下来 4.3 %，刚好在 5 % 门槛里面。**
 * 工业的 1–2 % 靠的是 3 区气囊 + 闭环 + 终点检测，这三样本层一样都没有 ——
 * 所以这 4.3 % 是**开环预算，不是实测值**（见降级②）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 问题二：碟形凹陷（dishing）与"只能定时"
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 铜比介质软，而且氧化剂把它变成更容易磨掉的氧化物 ⇒ 同一个压力下铜走得快：
 *
 *     k(SiO₂) = 1×10⁻¹³ → R = 1e-13 × 2.1e4 × 0.63 = 79 nm/min
 *     k(Cu)   = 2.5×10⁻¹³ → R = **198 nm/min**（选择性 2.5 : 1）
 *
 * 每层要磨掉 600 nm 的覆盖介质（400 nm 沟深 + 200 nm 余量）⇒ 定时 **7.6 min**。
 *
 * **定时误差 10 % = 46 s，在那 46 s 里露出来的铜走 198 × 0.77 = 151 nm。**
 * 沟深只有 400 nm，所以一次"晚停 10 %"就吃掉 **38 % 的铜线厚度** ——
 * 而指标是 dishing ≤ 50 nm。**差 4 倍，且不是随机误差，是系统性过抛。**
 *
 * 加本征 dishing（宽 100 µm 的线，软毡垫会把凹陷里的铜继续磨）：50–80 nm（工业硬垫 20–50）。
 * 合计最深凹陷 **200–230 nm**。
 *
 * 那 10 % 从哪来（三条都不是猜的）：
 *
 *   温度    车间 15–30 °C（CMP 进不了恒温间：φ700 铁盘 + 2 m² 占地），
 *           铜的化学项 2–5 %/K ⇒ **±10–25 %**。这一项自己就吃光预算。
 *   浆料    重力供浆（没有隔膜泵 —— 没有橡胶）：液位 500 → 300 mm，Q ∝ √h ⇒ **−22 %**
 *   垫      釉化：100 片后 k 掉 10–20 %，靠修整环拉回来（本层没有金刚石修整器，见降级⑥）
 *
 * **终点检测的三条工业路，本层三条都不通：**
 *
 *   电机电流   终点时负载只变 1–3 %；本层最好的电流指示是指针式检流计
 *              （`std/galvanometer-general`），自身漂移就有 2 %/h ⇒ 分辨不出来
 *   涡流       要 10 kHz 振荡 + 线圈 + 解调；本层有石英振荡器，没有线圈工艺与解调
 *   光学       要单色光 + 光强计；600 nm 膜厚变的反射率只有 ~1 %，淹没在垫与浆的散射里
 *
 * 所以**只能定时**：先用 3 片标定片把 k 标出来（干涉仪读台阶，15 nm 一档 = 600 nm 的 2.5 %），
 * 再按 Preston 算时间。标定能压到 2.5 %，**但 8 min 里的漂移压不住** ——
 * 漂移不是标定能解决的，只有闭环能。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 问题三：0.1 µm 的颗粒，暗场散射要多少功率与时间？
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 瑞利区散射截面 σ = (8π³/3)(a⁶/λ⁴)·|(m²−1)/(m²+2)|²，取 λ = 0.5 µm、m = 1.5
 * （SiO₂ 在空气里），系数 82.6 × 0.0865 = 7.14：
 *
 *     σ(0.5 µm) = 7.14 × (0.25 µm)⁶/(0.5 µm)⁴ = **2.8×10⁻¹⁴ m²**
 *     σ(0.1 µm) = 7.14 × (0.05 µm)⁶/(0.5 µm)⁴ = **1.8×10⁻¹⁸ m²**
 *     比        = (0.1/0.5)⁶ = **6.4×10⁻⁵** ✓（与题目给的数一致）
 *
 * 照明：碳弧 10⁸ cd/m² ⇒ 可见辐射亮度 L = 10⁸/683 = **1.5×10⁵ W/(m²·sr)**。
 * 聚光到 NA 0.5：E = L·π·sin²30° = 1.2×10⁵ W/m² = **12 W/cm²（85 个太阳）**。
 * 收集：椭球 NA 0.5 ⇒ Ω/4π = (1−cos 30°)/2 = 0.067。
 *
 * 一颗 0.1 µm 颗粒交到光电管上的功率与电流（R = 0.4 A/W）：
 *
 *     P = E·σ·Ω/4π = 1.2e5 × 1.8e-18 × 0.067 = **1.4×10⁻¹⁴ W**
 *     I = 1.4e-14 × 0.4 = **5.8×10⁻¹⁵ A = 5.8 fA**
 *
 * **要 >10× 暗电流（10 nA）⇒ 差 1.7×10⁶ 倍。** 折算回光源：要 2×10¹¹ W/m²，
 * 是太阳表面（6×10⁷ W/m²）的 3 400 倍。**这条路在"功率"上是死的。**
 *
 * 换积分（散粒噪声，i_n = √(2e·I_d) = 1.8×10⁻¹⁴ A/√Hz）：
 *
 *     T = (10·i_n/I)² = (10 × 1.8e-14/5.8e-15)² = **960 s ≈ 16 min / 点**
 *
 * 而漂移比散粒噪声更狠：暗电流 7 %/K，恒温间 ±0.5 K ⇒ 3.5 % = 35 pA，
 * 是一颗 0.1 µm 信号的 **6 000 倍**。反解"信号 = 10×漂移"：
 *
 *     短时（1 min 内 ±0.05 K，3.5 pA）  → 可测到 **0.43 µm**
 *     全片（42 min 里 ±0.5 K，35 pA）   → 可测到 **0.63 µm**
 *     散粒噪声硬底（60 s/点）           → 可测到 **0.40 µm**
 *
 * **所以本层的暗场计数下限是 0.4–0.6 µm，0.1 µm 差 4–5 倍。** 与显微镜的 0.7 µm 同量级
 * —— 两条路都停在"半微米"，这不是巧合：卡住的是**光电管的暗电流**，不是光学。
 *
 * 扫描时间的账（这一步最难看）：φ100 片面积 78.5 cm²，光斑 φ0.2 mm（本层钻/磨孔径的下限，
 * 与 `plant/euv-reflectometer/aperture` 同一个数），步距 0.1 mm（50 % 重叠）：
 *
 *     78.5 cm²/(0.1 mm)² = **78.5 万点** × 1 s = **218 h ≈ 9 天/片**
 *     要数 0.1 µm（16 min/点）        = **24 年/片**
 *     只抽 5 % 面积                   = 11 h/片（但抽检证明不了 <0.1 个/cm²）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 问题四：能不能用"镜子法"间接测颗粒？
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 能"定位"，但只到 **8 µm**，不是颗粒计数器。账如下（`plant/euv-reflectometer`）：
 *
 *   光斑     入射光阑 φ0.2 mm ⇒ 面积 3.14×10⁻⁸ m²
 *   精度     ±0.3 %（那一份文件自己的验收值，问题四的误差预算合成 0.26 %）
 *   一颗 0.1 µm 的消光截面 = 2×(π/4)d² = 1.6×10⁻¹⁴ m²（大颗粒极限：遮蔽 + 散射各一份）
 *
 *     ΔR/R = 1.6e-14/3.14e-8 = 5.1×10⁻⁷ = 5×10⁻⁵ %
 *
 * 而仪器分辨 0.3 % ⇒ **差 5.9×10³ 倍**。反解"ΔR/R = 0.3 %"对应的粒径：
 *
 *     2×(π/4)d² = 3e-3 × 3.14e-8 ⇒ d = **7.7 µm**（取 8 µm）
 *
 * 分辨率就是光斑 = **0.2 mm = 0.1 µm 的 2 000 倍**。
 * 而且反射计**没有 X/Y 扫描台**（它自己的降级第 5 条，只有 50 mm 平移去测 I₀）：
 * 全片 19.6 万点 × 10 min（30 s 开 + 30 s 关 × 10 轮）= **3.7 年/片**，还要人搬。
 *
 * 结论：**镜子法是"宏观缺陷检具"** —— 划伤、麻点、膜厚台阶 ≥8 µm，它是本层唯一能
 * 全口径看一遍的东西（这也是它值得留着的原因）；**它不是颗粒计数器**，
 * 对 0.1 µm 差 80 倍（灵敏度）与 2 000 倍（分辨率）。
 *
 * 顺带把"表面等离子体共振"也判掉：SPR 探的是表面 200 nm 内的折射率，
 * 一颗 0.1 µm 颗粒只占光斑（1 mm²）的 7.9×10⁻⁹，共振角移动
 * Δθ = 10⁻² rad × 7.9e-9 = **7.9×10⁻¹¹ rad**，而本层最好的角度读数
 * （`plant/refractometer` 分度盘，无放大镜）是 1′ = 2.9×10⁻⁴ rad ⇒ **差 4 个数量级**。
 * 所以 SPR 连"看得见"都算不上，不必给它建条目。
 *
 * 顺带交代本层另外两件光学仪器：`plant/refractometer` 是上面 SPR 那条的**角度基准**
 * （分度盘 1′ = 2.9×10⁻⁴ rad，没有放大镜，`unblock-refractometer-circle` 第六节）；
 * `plant/pyrometer`（1000–2000 °C）在颗粒这件事上**没有位置** —— 颗粒是冷的，
 * 而高温计测的是热辐射，它不是"另一种散射计"。
 * 缺的从来不是仪器，是**能把 0.1 µm 的散射变成 10 倍暗电流的那只光电管**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 本文件的结构
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   一、CMP 的七个零件 → 机器 `plant/cmp-polisher`（composedOf，无产出路线）
 *   二、扫描仪的五个零件 → 机器 `plant/particle-scanner`（同上）
 *   三、两条产物路线：make/wafer-level-cmp（正路）/ make/wafer-level-handlap（反例）
 *   四、三条检验路线：暗场散射 / 显微镜目视 / 镜子法 —— 产出同一个
 *       `mat/wafer-inspected`，靠 `gives` 把"能数到多小"写成数据
 *
 * 质量账：本文件的产出全是**件/片**，不算 kg 守恒（`unbalanced` 只对全 kg 产出生效）。
 * 投料量是"每片每层"的实用量，取整到能算的数，不是配比。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 降级点（十处，按严重程度）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  1. **Ra < 1 nm 做不到，也测不了。** 本层最细的磨料是 0.3 µm（石英粉沉降 35 h 分档，
 *     unblock-interferometer-flat 第八节②），工业是 0.05 µm 胶体硅，差 6 倍；
 *     而干涉仪一档 15 nm，比 1 nm 差 15 倍。所以 `roughness` 只能**开环声明 1–3 nm**
 *     （抛光面本身是光的，测不出比 λ/20 更细的东西）。
 *  2. **片内 5 % 是预算，不是实测。** 4.3 % 靠三项误差合成算出来；验它要在 300 mm 上
 *     测 49 点膜厚，本层没有椭圆仪/反射谱仪，只能切 1 mm 方坑、用干涉仪读 30 nm 的台阶
 *     —— **破坏性、且只有 1/5 条纹的判读精度**。而本层只有 φ100 片（降级⑩）。
 *  3. **没有终点检测。** 定时 ±10 % = 过抛 151 nm 铜（沟深的 38 %），指标 50 nm，差 4 倍。
 *     三条工业路（电流/涡流/光学）都不通（问题二）。
 *  4. **没有分区压力、没有闭环。** 均匀性的硬底是球铰摩擦 8μr_s/R = 2.7 %（μ = 0.1）；
 *     μ 一到 0.2 就是 5.3 %，直接出界。本层无法测 μ，也无法测压力分布。
 *  5. **没有聚氨酯垫。** 矿棉毡（石灰胶结）+ 玻璃布背衬的压缩率 10 %、厚度公差 ±0.1 mm
 *     ⇒ 压力预算里 3 % 是它给的。工业 IC1000 的闭孔结构（可控孔隙率、可开沟）
 *     这一层做不出来 —— 沟槽只能用铣床在**铸铁盘**上开，垫上开不了。
 *  6. **修整没有金刚石。** 铸铁环 + 尾矿砂修整，垫寿命 100 片（工业 500–1000）；
 *     而修整用的砂是 0.3 µm 的石英，**修整本身就在引入 ≥0.3 µm 的划痕源**。
 *  7. **浆料没有 pH 计、没有氧化剂浓度计**（同一条：本层没有在线化学
 *     传感器）。重铬酸钠 0.5 % 靠称量加料、靠定时换槽；Cr(VI) 废液只能用石灰还原中和
 *     （Cr³⁺ 沉淀），本层**没有铬的检测手段**，只能按投料量记账。
 *  8. **0.1 µm 的颗粒数不出来。** 暗场下限 0.4–0.6 µm（散粒噪声 0.40、温漂 0.43–0.63），
 *     差 4–5 倍；全片扫一遍 218 h。显微镜 0.7 µm（差 7 倍）。镜子法 8 µm（差 80 倍）。
 *  9. **指标 <0.1 个/cm² 落在量程之外。** φ100 片 78.5 cm² ⇒ 每片 ≤7.9 颗 ≥0.1 µm；
 *     而能测的 ≥0.5 µm 上，按 d⁻³ 的分布只有 7.9×(0.1/0.5)³ = **0.06 颗/片**
 *     —— 也就是"整片一颗都找不到"。这个指标**不能验收，只能靠洁净间与工艺保证**。
 * 10. **本层没有 φ300 片。** CMP 的盘子按 φ700 做（装得下 φ300），但 `mat/silicon-wafer`
 *     是 φ100 ⇒ 300 mm 口径的均匀性没有片子可验；而 5 % 的预算在 φ100 上是同一个数
 *     （问题一：与 R 无关），所以"设计口径"与"能验的片"始终差着两代。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、CMP 的零件（七件）
//
// 一台"铸铁盘 + 毡垫 + 球铰载片头 + 重力供浆 + 20 kPa 罩"的抛光机。
// 它比工业机少四样东西，而这四样正是它慢与不匀的全部原因：
// 分区气囊、闭环压力、终点检测、金刚石修整器。
// ═══════════════════════════════════════════════════════════════════════════

export const MULTILEVEL_ITEMS: readonly Item[] = [
  /**
   * 抛光盘。φ700×60 铸铁 HT250，面上车同心沟（1.5 mm 宽 × 1 mm 深，间距 15 mm）。
   *
   * 为什么是铸铁而不是钢：铸铁里的石墨片是**固体润滑剂**，盘面被浆料磨的时候
   * 石墨把磨屑带走，盘不容易"咬"住片子；钢盘会冷焊上一层铜。
   * 为什么是 HT250 而不是 HT200/HT300：与 `unblock-interferometer-flat` 同一条理由 ——
   * HT200 的石墨片粗（麻点 5 µm），HT300 白口倾向大、磨不动。**三档里只有中间那档能抛光。**
   *
   * 平面度 20 µm 是这一件唯一的规格。它比片子大 7 倍，所以盘子自己的形状
   * **会以 1:1 印到片子上**（弹性垫只抹得掉高频，抹不掉 φ700 上的碗形）。
   */
  {
    id: 'plant/cmp-polisher/platen',
    name: '化学机械抛光机抛光盘',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 500, max: 1000, unit: 'mm' },
      { param: 'flatness', kind: 'range', min: 0, max: 40, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * 抛光垫。**本层没有聚氨酯**（那要异氰酸酯 + 多元醇，`plant/polymer-plant` 只到 PVC 那一族），
   * 所以垫是：玻璃布背衬（`mat/glass-cloth`）+ 矿棉毡面层（`mat/mineral-wool`）+
   * 石灰胶结（`mat/lime` 消解成 Ca(OH)₂，150–200 °C 下与矿棉表面的 SiO₂ 生成
   * 水化硅酸钙把纤维粘住 —— 这就是"砂灰砖"的化学，本层有石灰）。
   *
   * 三处代价，都写进压力预算里：
   *   · 没有闭孔结构 ⇒ 压缩率 10 %（工业 IC1000 是 2–5 %）⇒ 倾斜被放大成压力
   *   · 没有发泡工艺 ⇒ 硬度不可调，只能靠"压多少"调，一压就变薄
   *   · 垫上开不了沟（毡一铣就散）⇒ 浆料只能靠盘上的沟输运
   * 好处是它是**可以自己做出来的最软的东西**，而软正是"球铰不够时最后一层均匀化"。
   */
  {
    id: 'plant/cmp-polisher/pad',
    name: '化学机械抛光机抛光垫',
    unit: '件',
    category: 'part',
    props: [
      { param: 'thickness', kind: 'range', min: 1, max: 6, unit: 'mm' },
      { param: 'compression', kind: 'range', min: 2, max: 30, unit: '%' },
    ],
  },

  /**
   * 抛光头（载片器）。三件东西：**球面座 + 弹性背垫 + 挡圈**。
   *
   * 球面座是这一台机器里唯一"有精度"的件：r_s = 5 mm 的淬硬 45 钢球坐在铸铁窝里，
   * 靠压力合力自己找正。它给的均匀性是 8μr_s/R = 2.7 %（问题一），
   * 而它**不能更好**：μ 是干摩擦/油膜的函数，本层测不了。
   *
   * 挡圈（retaining ring）压住片边，防止片子被摩擦力甩出去；它也决定了边缘
   * 那 3–5 mm 的"边缘效应"——工业用分区压力单独压挡圈，本层只有同一个压力。
   */
  {
    id: 'plant/cmp-polisher/carrier',
    name: '化学机械抛光机抛光头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'ballRadius', kind: 'range', min: 2, max: 20, unit: 'mm' },
      { param: 'downforce', kind: 'range', min: 0.02, max: 0.6, unit: 'MPa' },
    ],
  },

  /**
   * 修整环。铸铁环 + 槽里嵌尾矿砂，压在盘上跟着转，把垫面重新拉毛。
   *
   * 工业用金刚石修整盘（寿命 500–1000 片），本层没有金刚石 ⇒ 用**铸铁环 + 尾矿砂**
   * （`mat/tailings`，SiO₂ 45 % / Al₂O₃ 9 %，莫氏 6–7，比矿棉硬）。
   * 代价两条：寿命只有 100 片；而且**修整用的砂本身就是 0.3 µm 的划痕源** ——
   * 修整与洁净在这一件上是矛盾的，只能靠修整后冲洗 30 s 压住。
   */
  {
    id: 'plant/cmp-polisher/conditioner',
    name: '化学机械抛光机修整环',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 300, max: 900, unit: 'mm' },
      { param: 'ringLoad', kind: 'range', min: 10, max: 500, unit: 'N' },
    ],
  },

  /**
   * 主传动。两根立轴（盘轴 + 载片轴），各一台直流电机 + 90:1 蜗轮副 + 塔轮变速。
   *
   * **两轴必须同速** —— 这是问题一里那个"白给的均匀性"的机械前提：
   * ω_p = ω_c 时 v = ω·L 与位置无关。同速靠塔轮（同一根皮带、同一个直径），
   * 不靠调速器（本层没有）。代价是**只能整档换速**：10 / 20 / 40 / 80 r/min 四档。
   */
  {
    id: 'plant/cmp-polisher/drive',
    name: '化学机械抛光机主传动',
    unit: '件',
    category: 'part',
    props: [
      { param: 'speed', kind: 'range', min: 5, max: 150, unit: 'r/min' },
      { param: 'power', kind: 'range', min: 0.5, max: 30, unit: 'kW', dir: 'atLeast' },
    ],
  },

  /**
   * 供浆。**没有泵** —— 浆罐架高 500 mm，靠位差 + 针阀限流。
   *
   * 为什么不做泵：浆里 5 % 的石英砂，齿轮泵 50 h 就磨圆齿顶；隔膜泵要橡胶膜，
   * 本层没有橡胶。重力供浆是本层唯一"没有运动件"的计量方式。
   * 代价写在问题二里：**液位从 500 落到 300 mm，流量按 √h 掉 22 %**，
   * 而流量决定磨料供给，也就是决定 k。
   */
  {
    id: 'plant/cmp-polisher/slurry-feed',
    name: '化学机械抛光机供浆',
    unit: '件',
    category: 'part',
    props: [
      { param: 'flow', kind: 'range', min: 10, max: 1000, unit: 'mL/min' },
      { param: 'head', kind: 'range', min: 100, max: 2000, unit: 'mm' },
    ],
  },

  /**
   * 罩。**不是为了压力，是为了水。**
   *
   * 火星大气 0.6 kPa：20 °C 的水蒸气压是 2.3 kPa，比环境高 4 倍 ⇒ 浆料膜几分钟就干，
   * 干了的石英粉是一层磨料壳，下一转就是一片划痕。
   * 20 kPa 够了：水在 60 °C 才开，而抛光是 20 °C。同一条理由写在
   * `plant/wet-bench` 的 100–500 kPa 上（它要 120 °C，所以要 200 kPa）。
   *
   * 密封用**铜垫**（0.5 mm 铜片压服）—— 本层没有橡胶。φ800 的罩在 20 kPa 上受 10 kN，
   * 20 mm 钢板 + 16 只 M16 就够了。
   */
  {
    id: 'plant/cmp-polisher/enclosure',
    name: '化学机械抛光机罩',
    unit: '件',
    category: 'part',
    props: [{ param: 'leakRate', kind: 'range', min: 0, max: 5, unit: 'Pa·L/s', dir: 'atMost' }],
  },

  /**
   * 化学机械抛光机。φ700 盘、单压力区、定时、20 kPa 罩。
   *
   * 它是**设备**，不是零件：它不装在别的东西上，它执行工序。
   * 所以它没有产出路线 —— 它的来历是 `composedOf`（装配），按定义与制造分开
   * 定义与制造分开。
   *
   * `holds` 只有压力：15–30 kPa 的罩。**温度它 hold 不了** —— 它站在车间里，
   * 15–30 °C 的昼夜温差直接进 k（问题二那 10 % 的一半）。
   * 想 hold 温度就得进恒温间，而 φ700 的铁盘 + 2 m² 占地进不去 φ3 m 的计量间。
   */
  {
    id: 'plant/cmp-polisher',
    name: '化学机械抛光机',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'pressure', min: 15, max: 30 }],
    props: [
      { param: 'downforce', kind: 'range', min: 0.02, max: 0.6, unit: 'MPa' },
      { param: 'platenSpeed', kind: 'range', min: 5, max: 150, unit: 'r/min' },
      { param: 'uniformity', kind: 'range', min: 0, max: 15, unit: '%', dir: 'atMost' },
    ],
    composedOf: [
      // 盘要定期重研（1400 h ≈ 一年半），垫与修整环按片数换（100 片 = 25 h）
      { item: 'plant/cmp-polisher/platen', qty: q(1), wear: { amount: q(1), per: q(1400) } },
      { item: 'plant/cmp-polisher/pad', qty: q(1), wear: { amount: q(1), per: q(25) } },
      { item: 'plant/cmp-polisher/carrier', qty: q(2) },
      { item: 'plant/cmp-polisher/conditioner', qty: q(1), wear: { amount: q(1), per: q(25) } },
      { item: 'plant/cmp-polisher/drive', qty: q(1) },
      { item: 'plant/cmp-polisher/slurry-feed', qty: q(1) },
      { item: 'plant/cmp-polisher/enclosure', qty: q(1) },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 二、颗粒扫描仪的零件（五件）
  //
  // 一台"碳弧斜照 + 椭球收集 + 光电管 + 手动扫描台 + 暗箱"的暗场散射计数器。
  // 它必须全反射：**本层没有光学玻璃**（`mat/glass` 不在本文件的投料白名单里，
  // 而且玻璃透镜要研磨 + 定心，那是 `plant/refractometer` 那条链的活）。
  // 反射式还有第二个好处：碳弧是**扩展光源**，聚不到衍射极限，
  // 光斑不由光学的 λ/NA 定，而由**光阑孔的机械加工下限 φ0.2 mm** 定。
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * 反射光学：照明抛物碗（镀银）+ 收集椭球（镀银）+ 光阑 + 挡光板。
   *
   * 光斑由光阑孔定：**φ0.2 mm** —— 这是本层钻/磨孔径的下限
   * （`euv-source.ts` 问题三，与 `plant/euv-reflectometer/aperture` 同一个数）。
   * 于是"分辨率"不是光学问题，是**机械问题**：0.2 mm 是 0.1 µm 的 2 000 倍。
   *
   * 亮度 10⁸ cd/m² 是碳弧的数（`plant/mask-aligner/lamp` 那套的老底子）；
   * 本件用它的一半（3×10⁷–10⁸），因为镀银碗只有 85 % 反射、再加一级挡光板。
   */
  {
    id: 'plant/particle-scanner/optics',
    name: '暗场颗粒扫描仪反射光学',
    unit: '件',
    category: 'part',
    props: [
      { param: 'spotSize', kind: 'range', min: 0.05, max: 5, unit: 'mm', dir: 'atMost' },
      { param: 'luminance', kind: 'range', min: 1e6, max: 1e9, unit: 'cd/m²', dir: 'atLeast' },
    ],
  },

  /**
   * 探测头。光电管（`std/photodiode-general`）+ 积分器（`std/opamp-chip-general`
   * + `std/capacitor-film-general` ×2）+ 屏蔽盒。
   *
   * 积分器的存在是因为信号太小：一颗 0.1 µm 颗粒给 5.8 fA，而暗电流 1 nA ——
   * 两者都进同一个电容，**积分不能提高信噪比**，只能把"电流的差别"变成"电荷的差别"。
   * 真正决定下限的是暗电流的温度系数（7 %/K），所以这一件的外壳是**铝盒 + 铜丝弹簧**
   * （等温 + 屏蔽），并且整台仪器必须进恒温间（±0.5 K ⇒ ±3.5 %）。
   */
  {
    id: 'plant/particle-scanner/detector',
    name: '暗场颗粒扫描仪探测头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'darkCurrent', kind: 'range', min: 0, max: 100, unit: 'nA', dir: 'atMost' },
      { param: 'responsivity', kind: 'range', min: 0.05, max: 1, unit: 'A/W', dir: 'atLeast' },
    ],
  },

  /**
   * 计数与显示。`std/counter-chip-general` 数脉冲，`std/galvanometer-general` 当表头。
   *
   * 为什么还要一只指针表：计数芯片数的是**阈值以上**的脉冲，而阈值要人看着表调 ——
   * 调阈值就是调"信噪比门槛"，那一步是本层唯一能做的"判据设定"，
   * 也是它不可重复的原因（每片都要重调一次）。
   */
  {
    id: 'plant/particle-scanner/counter',
    name: '暗场颗粒扫描仪计数与显示',
    unit: '件',
    category: 'part',
    props: [{ param: 'maxCount', kind: 'range', min: 1e3, max: 1e7, unit: '个', dir: 'atLeast' }],
  },

  /**
   * 片子台。φ320 三点支承（三个淬硬球磨到同一高度）+ 手动 X/Y 丝杠台
   * （300 mm 行程、丝杠 0.5 mm/转、刻度盘 100 格 ⇒ 5 µm 一格）。
   *
   * **没有自动扫描、没有光栅尺、没有自动对焦**：位置靠"数格子 + 回到限位块"，
   * 重复性 0.1 mm = 光斑只挪半个斑。这是 `plant/euv-reflectometer/sample-stage`
   * 那一件的手动版，理由同一条：**本层的定位精度停在 0.1 mm，而 0.1 mm 是光斑的尺寸。**
   */
  {
    id: 'plant/particle-scanner/stage',
    name: '暗场颗粒扫描仪片子台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'travel', kind: 'range', min: 100, max: 400, unit: 'mm', dir: 'atLeast' },
      { param: 'positionError', kind: 'range', min: 0, max: 2, unit: 'mm', dir: 'atMost' },
    ],
  },

  /**
   * 暗箱。折焊钢板箱 + 炭黑内衬。
   *
   * 暗场散射的前提是"除了颗粒，什么也不亮"：碳弧的直射光比颗粒的散射强 10⁹ 量级，
   * 箱内反射一次就把信号淹掉。炭黑（`mat/carbon`，Bosch 来的 30–100 nm 球状颗粒）
   * 是这层最黑的东西（反射率 1–2 %），比黑漆强一个量级。
   *
   * 判据是可测的：**光闸闭上时光电管的读数 ≤ 2× 暗电流**（那就是"箱里不漏光"）。
   */
  {
    id: 'plant/particle-scanner/dark-box',
    name: '暗场颗粒扫描仪暗箱',
    unit: '件',
    category: 'part',
    props: [{ param: 'attenuation', kind: 'range', min: 1e2, max: 1e9, unit: '倍', dir: 'atLeast' }],
  },

  /**
   * 暗场颗粒扫描仪。碳弧斜照、椭球收集、光电管积分、手动扫 78.5 万点。
   *
   * 它的**指标**写在 props 上，而它的**极限**也在 props 上 —— 两者是同一个数：
   * `minParticle` 声明 0.05–10 µm，路线只敢交付 0.4–0.6 µm（问题三）。
   */
  {
    id: 'plant/particle-scanner',
    name: '暗场颗粒扫描仪',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'minParticle', kind: 'range', min: 0.05, max: 10, unit: 'µm', dir: 'atMost' },
      { param: 'spotSize', kind: 'range', min: 0.05, max: 5, unit: 'mm', dir: 'atMost' },
      { param: 'scanPoints', kind: 'range', min: 1e3, max: 1e7, unit: '点', dir: 'atLeast' },
    ],
    composedOf: [
      { item: 'plant/particle-scanner/optics', qty: q(1) },
      { item: 'plant/particle-scanner/detector', qty: q(1) },
      { item: 'plant/particle-scanner/counter', qty: q(1) },
      { item: 'plant/particle-scanner/stage', qty: q(1) },
      { item: 'plant/particle-scanner/dark-box', qty: q(1) },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 三、两种片：磨过的（wafer-level）与判过的（wafer-inspected）
  //
  // 为什么用两个 id 而不是一个：**"磨平"与"判过"是两件事**，
  // 而检验的结论（能数到多小）不是片的属性，是**量具的属性**。
  // 把它写在 `mat/wafer-inspected` 上，三条检验路线就有了同一张表上的三行数。
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * 一层做完、表面已平坦化的片。**这是 CMP 的产物**，也是多层互连往下走的台阶。
   *
   * 五个规格就是这一层全部的质量语言：
   *   diameter        φ95–105（本层只有 φ100 片；字段留着是为了将来接 φ300）
   *   roughness  Ra   抛光面粗糙度
   *   dishing         宽线上的碟形凹陷
   *   erosion         密排区里介质被多磨掉的深度
   *   defectDensity   ≥0.5 µm 的颗粒密度（能测到的那个档）
   *
   * ⚠️ 注意 `defectDensity` 的定义域：**它是"能测到的那一档"的密度，不是 ≥0.1 µm 的。**
   * 这正是指标与量具打架的地方（问题三、降级⑨）。
   */
  {
    id: 'mat/wafer-level',
    name: '单层完成片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 50, max: 320, unit: 'mm' },
      { param: 'roughness', kind: 'range', min: 0, max: 60, unit: 'nm', dir: 'atMost' },
      { param: 'dishing', kind: 'range', min: 0, max: 1200, unit: 'nm', dir: 'atMost' },
      { param: 'erosion', kind: 'range', min: 0, max: 600, unit: 'nm', dir: 'atMost' },
      { param: 'defectDensity', kind: 'range', min: 0, max: 60, unit: '个/cm²', dir: 'atMost' },
    ],
  },

  /**
   * 判过的片。**它带的不是"合格"两个字，是"这次判据有多硬"**：
   *
   *   minParticle  这一次能数到的最小粒径
   *   density      报出来的颗粒密度（分母就是上面那个粒径档）
   *   coverage     扫过的面积占比（抽检与全检是两种东西）
   *
   * 三条检验路线给三组数：0.4–0.6 µm / 0.7–1.0 µm / 8–15 µm。**没有一条到 0.1 µm。**
   * 把这句话写成数据，比写在注释里管用：任何需要 `minParticle ≤ 0.15` 的下游路线
   * 都会被这三行窗口筛掉，而在本文件里**筛掉之后没有替代品**。
   */
  {
    id: 'mat/wafer-inspected',
    name: '检验后晶圆',
    unit: '片',
    category: 'part',
    props: [
      { param: 'minParticle', kind: 'range', min: 0.05, max: 50, unit: 'µm', dir: 'atMost' },
      { param: 'density', kind: 'range', min: 0, max: 300, unit: '个/cm²', dir: 'atMost' },
      { param: 'coverage', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 四、路线
// ═══════════════════════════════════════════════════════════════════════════

export const MULTILEVEL_ROUTES: readonly Route[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 4.1 CMP 的七个零件
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 抛光盘：一炉铁水浇 φ700×60 板 → 时效 → 车 → 磨 → 铣同心沟 → 验平。
     *
     *   铁水 185 kg（净件 166 + 冒口浇道 19）→ 盘 1 件
     *
     * φ700 用 60 mm 厚不是强度要的（自重下挠度 < 1 µm），是**热容与刚度**要的：
     * 盘面被浆料与摩擦加热 2–3 K，60 mm 铁的热时间常数 40 min ⇒ 一个班之内
     * 盘面温度基本不变 —— 这一条比"挠度"要紧，因为 k 的温度系数是几个 %/K。
     *
     * 平面度 20 µm 的验法：**刀口尺 1 µm 光隙法 + 量块塞**，沿六条直径走一遍。
     * 干涉仪帮不上忙 —— 它的平晶只有 φ70。
     */
    id: 'make/cmp-platen',
    name: '化学机械抛光机抛光盘制造',
    produces: [
      {
        item: 'plant/cmp-polisher/platen',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 690, max: 710 },
          { param: 'flatness', kind: 'range', min: 8, max: 20 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(185) }] },
      // 三只调整垫铁与压板：盘要能调平到 1 µm/300 mm
      { anyOf: [{ item: 'mat/steel-45', qty: q(4) }] },
      { anyOf: [{ item: 'mat/water', qty: q(30) }] },
    ],
    needs: ['plant/gauge-block'],
    rate: { hours: q(60) },
    steps: [
      {
        note_zh: '造型浇注：砂型立浇，浇温 1350–1400，冒口 19 kg',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1350, max: 1400 }],
      },
      {
        note_zh: '时效 550–650 保温 4 h 随炉冷 —— 必须在车之前，否则盘面在一年里自己翘 0.05',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 550, max: 650 }],
      },
      { note_zh: '车：两端面 + φ700 外圆 + 中心孔与键槽', performedBy: 'lathe' },
      { note_zh: '磨平面：砂轮端面磨，从车的 0.2 振纹压到 20 µm', performedBy: 'plant/grinder' },
      {
        note_zh: '铣同心沟：1.5 宽 × 1 深、间距 15，四段圆弧接刀 —— 沟是浆料的输运通道，也是磨屑的出口',
        performedBy: 'plant/milling-machine',
      },
      {
        note_zh:
          '验平：刀口尺沿六条直径看光隙（1 µm 光隙法拦住 10 µm 的弯），量块组塞最深的缝；判据 20 µm',
        performedBy: 'plant/robot',
      },
    ],
  },

  {
    /**
     * 抛光垫：玻璃布背衬 + 矿棉毡面层 + 石灰胶结，模压到 3.0 mm，150–200 °C 烘干。
     *
     *   玻璃布 0.4 + 矿棉 0.6 + 石灰 0.2 + 水 3 → 垫 1 件（φ700，3 mm）
     *
     * 三处手艺：
     *   ① 消解：生石灰 + 水 → Ca(OH)₂，放热 65 kJ/mol，湿法槽里 20–60 °C 搅 30 min
     *   ② 模压：模深 3.0 ±0.1（限位块定厚，不靠压力 —— 毡是弹的，压不"准"）
     *   ③ 烘干：150–200 °C 4 h，水化硅酸钙脱水成胶结相；温度低了不固化，高了毡焦
     *
     * **厚度公差 ±0.1 mm 直接变成压力公差 ±3 %**（问题一）—— 这是本件最贵的一个数，
     * 而它由模具的限位块决定，不由抛光决定。
     *
     * 玻璃布在这条路线里是**背衬**（抗拉、防止毡被剪切带走）。它自己有路线
     * （`make/glass-cloth`，unblock-insulation 第 353 行，一批 1000 kg），
     * 所以这一条不欠料账。
     */
    id: 'make/cmp-pad',
    name: '化学机械抛光机抛光垫制造',
    produces: [
      {
        item: 'plant/cmp-polisher/pad',
        qty: q(1),
        gives: [
          { param: 'thickness', kind: 'range', min: 2.9, max: 3.1 },
          { param: 'compression', kind: 'range', min: 8, max: 15 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/glass-cloth', qty: q(2, 5) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(3, 5) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(3) }] },
    ],
    needs: ['plant/gauge-block'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '消解石灰并打浆：CaO + H₂O → Ca(OH)₂（放热 65 kJ/mol），配 20 % 灰浆，湿法槽 20–60 °C 搅 30 min —— 火星 0.6 kPa 下水在 0 °C 就开，所以必须在加压槽里做',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: '铺层模压：玻璃布 → 灰浆 → 矿棉两层 → 灰浆，模深 3.0 由限位块定（毡是弹的，压不"准"，只能定厚）',
        performedBy: 'plant/press',
      },
      {
        note_zh: '烘干 150–200 °C 4 h：水化硅酸钙脱水胶结；低了不固化、高了矿棉焦',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 150, max: 200 }],
      },
      {
        note_zh: '修边与测厚：沿 φ700 剪圆，九点量厚（判据 3.0 ±0.1）；这一步决定压力预算里的 3 %',
        performedBy: 'plant/robot',
      },
    ],
  },

  {
    /**
     * 抛光头：车球窝与挡圈 → 磨球 → 对研球窝 → 装弹性背垫。
     *
     *   铸铁 30 + 45 钢 4 + 矿棉 0.3 + 水 10 → 载片头 1 件
     *
     * 球与窝的**对研**是这一件的核心工序：球与窝不是车出来的配合，是磨出来的贴合
     * （与三块平晶互研同门）—— 贴合面 ≥80 % 才不"点接触"。
     * 球半径 5 mm 是问题一算出来的：q = N/(πr_s²) = 18.8 MPa 在青铜/铸铁座的许用内，
     * 而 8μr_s/R = 2.7 % 在 5 % 预算内。**球再大一点点，均匀性就出界。**
     */
    id: 'make/cmp-carrier',
    name: '化学机械抛光机抛光头制造',
    produces: [
      {
        item: 'plant/cmp-polisher/carrier',
        qty: q(1),
        gives: [
          { param: 'ballRadius', kind: 'range', min: 4.9, max: 5.1 },
          { param: 'downforce', kind: 'range', min: 0.05, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(30) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(4) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/gauge-block'],
    rate: { hours: q(20) },
    steps: [
      { note_zh: '车：球窝（R5 粗成形）、挡圈止口、三只压紧螺孔', performedBy: 'lathe' },
      { note_zh: '磨：45 钢球磨到 φ10 ±0.001、淬硬 HRC 55；球窝磨到 R5 留 5 µm 研量', performedBy: 'plant/grinder' },
      {
        note_zh: '对研球窝：球与窝之间撒 1 µm 石英粉对研 40 min，贴合斑 ≥80 %（量块对研的判据，接触斑连续不断）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '装弹性背垫与挡圈：矿棉毡垫 3 mm 粘在球座背面（它是"第二层弹性"，与抛光垫串联）',
        performedBy: 'plant/robot',
      },
    ],
  },

  {
    /**
     * 修整环：浇铸铁环 → 车 → 铣四条嵌砂槽 → 填尾矿砂。
     *
     *   铸铁 14 + 尾矿 1 + 水 5 → 环 1 件（φ620）
     *
     * 为什么是铸铁而不是钢：环比垫硬不了多少（HB 180 对矿棉的莫氏 6），
     * 磨的是自己而不是垫 —— **这一件的寿命就是"环被磨穿"**。
     * 嵌砂槽 4 条 3×3 mm，填尾矿砂后用少量石灰浆固定（同一个胶结）。
     */
    id: 'make/cmp-conditioner',
    name: '化学机械抛光机修整环制造',
    produces: [
      {
        item: 'plant/cmp-polisher/conditioner',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 610, max: 630 },
          { param: 'ringLoad', kind: 'range', min: 100, max: 300 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht200', qty: q(14) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: [],
    rate: { hours: q(12) },
    steps: [
      {
        note_zh: '浇环：HT200 一炉 14 kg，浇温 1350–1400（HT200 不是选便宜 —— 粗石墨片在这里正好是"自锐"）',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1350, max: 1400 }],
      },
      { note_zh: '车：内圆 φ600、外圆 φ620、工作面车平（不留磨量：工作面越粗越好，它要刮垫）', performedBy: 'lathe' },
      { note_zh: '铣四条 3×3 嵌砂槽 + 填尾矿砂 + 石灰浆固定', performedBy: 'plant/milling-machine' },
    ],
  },

  {
    /**
     * 主传动：两根立轴 + 两台直流电机 + 90:1 蜗轮副 + 塔轮。
     *
     *   铜线 14 + 铸铁 70 + 45 钢 30 + 铜 4 + 水 10 → 传动 1 套
     *
     * 塔轮是"同速"的实现：盘轴与载片轴由同一根皮带、同一对塔轮驱动 ⇒
     * **两轴永远同速**，这正好是问题一里 v = ωL 的前提。
     * 代价是调速只能换塔轮档位（10/20/40/80 r/min 四档），没有无级。
     */
    id: 'make/cmp-drive',
    name: '化学机械抛光机主传动制造',
    produces: [
      {
        item: 'plant/cmp-polisher/drive',
        qty: q(1),
        gives: [
          { param: 'speed', kind: 'range', min: 10, max: 80 },
          { param: 'power', kind: 'range', min: 2, max: 7 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper-wire', qty: q(14) }] },
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(70) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(30) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(4) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/gauge-block'],
    rate: { hours: q(40) },
    steps: [
      { note_zh: '车两根立轴与法兰（φ80 轴承位、h6，1 µm 台找正）', performedBy: 'lathe' },
      { note_zh: '滚 90:1 蜗轮副：蜗杆 Tr40×6、蜗轮 90 齿，回差 ≤5′', performedBy: 'plant/gear-hobbing' },
      { note_zh: '绕线与嵌线：两台 3 kW 直流电机，换向器车后精车一道', performedBy: 'plant/winder' },
      { note_zh: '装配与空载试转：两轴同速误差 ≤0.2 %（皮带在同一对塔轮上，误差来自皮带打滑）', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * 供浆：卷焊浆罐（架高 500 mm）+ 针阀 + 管路。
     *
     *   钢板 45 + 铝 8 + 铜线 1 + 水 15 → 供浆件 1 套
     *
     * 罐 30 L、锥底、侧壁一支 1 m 的玻璃管当液位计（**没有液位计就用看得见的玻璃管** ——
     * 玻璃管本层也没有，所以退成"一根透明石英管"，而石英管也不会做 ⇒ 退成
     * **罐外一根带刻度的铜管 + 浮子**）。这一段是本件最土、也最省事的地方：
     * 液位可视化换来的是"操作者每 10 min 记一次液位"，也就是流量漂移 22 % 是**已知的**。
     *
     * 针阀：φ6 通径，阀杆 1:50 锥面，一圈 = 0.2 mm ⇒ 开度可重复到 5 %。
     */
    id: 'make/cmp-slurry-feed',
    name: '化学机械抛光机供浆制造',
    produces: [
      {
        item: 'plant/cmp-polisher/slurry-feed',
        qty: q(1),
        gives: [
          { param: 'flow', kind: 'range', min: 20, max: 400 },
          { param: 'head', kind: 'range', min: 400, max: 600 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(45) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(8) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(15) }] },
    ],
    needs: [],
    rate: { hours: q(16) },
    steps: [
      { note_zh: '卷焊罐体、锥底、支架与接管（罐架高 500 mm，靠位差供浆）', performedBy: 'plant/sheet-shop' },
      { note_zh: '车阀体与针阀：1:50 锥面配研，一圈 0.2 mm 开度', performedBy: 'lathe' },
      { note_zh: '装配与试漏：灌水 1 h 看锥底与管路（判据是纸上不许有湿点）', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * 罩：折焊箱体 + 法兰 + 铜垫 + 压环。
     *
     *   钢板 120 + 铜 3 + 45 钢 12 + 水 10 → 罩 1 件
     *
     * 试压没有压力表（`std/` 白名单里没有）：用**水柱**。2.5 m 高的水柱 = 25 kPa，
     * 是工作压力的 1.25 倍。判据是"30 min 水柱掉 <50 mm"，即漏率 <1 Pa·L/s 的量级。
     * 这一条与 `unblock-evaporator-bell` 的保压法同门：**没有表就用水柱，水柱本身就是表。**
     */
    id: 'make/cmp-enclosure',
    name: '化学机械抛光机罩制造',
    produces: [
      {
        item: 'plant/cmp-polisher/enclosure',
        qty: q(1),
        gives: [{ param: 'leakRate', kind: 'range', min: 0, max: 1 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(120) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(3) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(12) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/gauge-block'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '卷焊罩体、φ800 法兰、铰链门（连续焊，不许有针孔）', performedBy: 'plant/sheet-shop' },
      { note_zh: '车密封面与压环：0.5 mm 铜垫压服，16 只 M16', performedBy: 'lathe' },
      { note_zh: '试压：接 2.5 m 水柱（25 kPa）保 30 min，水柱掉 <50 mm', performedBy: 'plant/robot' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4.2 扫描仪的五个零件
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 反射光学：车灯体与镜座 → 手抛抛物碗与椭球 → 镀银 → 钻光阑孔 → 对光。
     *
     *   碳电极 1 根 + 铝 25 + 银 0.15 + 铜 3 + 钢板 12 + 水 20 → 光学件 1 套
     *
     * 两片反射面的面形要求比透镜低得多（反射只有一次，不用消色差），
     * 但要 **Ra < 5 nm 才能把散射本底压下去** —— 而面形误差在本件里不是"成像质量"，
     * 是"光斑边缘的杂散光"。抛到 λ 就够（弓高法验：与 `unblock-mask-stage` 的凹镜同门）。
     *
     * 碳电极 φ300 锯成四根 φ8×150 的碳棒（一根电极锯 40 段，够 10 台）。
     * 镀银用蒸镀台（1 Pa 下平均自由程 7 cm，银膜带 90 % 反射 —— 比工业的 96 % 差，
     * 但比不镀（铝 85 %、钢 55 %）都好）。
     */
    id: 'make/scanner-optics',
    name: '暗场颗粒扫描仪反射光学制造',
    produces: [
      {
        item: 'plant/particle-scanner/optics',
        qty: q(1),
        gives: [
          { param: 'spotSize', kind: 'range', min: 0.2, max: 0.25 },
          { param: 'luminance', kind: 'range', min: 3e7, max: 1e8 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/carbon-electrode-300', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(25) }] },
      { anyOf: [{ item: 'mat/silver', qty: q(3, 20) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(3) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(12) }] },
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    needs: ['plant/gauge-block'],
    rate: { hours: q(60) },
    steps: [
      { note_zh: '锯电极与车灯体：φ300 碳电极锯四根 φ8×150；灯体、镜座、电极夹车配', performedBy: 'lathe' },
      { note_zh: '手抛抛物碗与椭球：粗磨 → 0.3 µm 石英粉抛到 λ（弓高法验：弦长 20 时 h = R − √(R²−100)）', performedBy: 'plant/robot' },
      {
        note_zh: '镀银：真空 1–10 Pa 下蒸银 80 nm（反射 90 %，比铝高 5 个百分点 —— 这 5 % 就是信噪比的 5 %）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.1 }],
      },
      { note_zh: '钻光阑孔 φ0.2（本层钻/磨孔径下限）+ 装挡光板与碳光阱', performedBy: 'plant/robot' },
      { note_zh: '对光与调焦：碳弧像落在光阑上，光斑量到 0.2–0.25（判据：光斑边缘的亮度掉一半处）', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * 探测头：光电管 + 积分器 + 铝屏蔽盒。
     *
     *   光电管 1 + 运放 1 + 薄膜电容 2 + 铝 6 + 铜线 1 + 钢板 3 → 探测头 1 件
     *
     * 暗电流标定是这一件唯一有数的工序：**遮光、加反偏、等 30 min 热平衡，
     * 读 10 次取平均**。判据 0.5–2 nA（工业的 PIN 管是 0.1–1 nA）。
     * 这 1 nA 就是整台仪器的地板（问题三），所以标定必须在恒温间里做 ——
     * 温度差 1 K，暗电流就变 7 %。
     */
    id: 'make/scanner-detector',
    name: '暗场颗粒扫描仪探测头制造',
    produces: [
      {
        item: 'plant/particle-scanner/detector',
        qty: q(1),
        gives: [
          { param: 'darkCurrent', kind: 'range', min: 0.5, max: 2 },
          { param: 'responsivity', kind: 'range', min: 0.3, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/photodiode-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(6) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(3) }] },
    ],
    needs: ['plant/metrology-room', 'plant/gauge-block'],
    rate: { hours: q(20) },
    steps: [
      { note_zh: '车屏蔽盒与管座：铝盒壁 5 mm（等温）、管座绝缘用铝阳极氧化', performedBy: 'lathe' },
      {
        note_zh: '装管与调零：光电管 + 运放积分器 + 两只薄膜电容（1 µF，积分 1–1000 s 可切）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '标定暗电流：遮光、加 10 V 反偏、等 30 min 热平衡，读 10 次取平均；判据 0.5–2 nA（温度差 1 K 就差 7 %）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * 计数与显示：计数芯片数脉冲，检流计当阈值表。
     *
     *   计数芯片 1 + 检流计 1 + 铝 4 + 铜线 1 + 钢板 2 → 计数件 1 套
     */
    id: 'make/scanner-counter',
    name: '暗场颗粒扫描仪计数与显示制造',
    produces: [
      {
        item: 'plant/particle-scanner/counter',
        qty: q(1),
        gives: [{ param: 'maxCount', kind: 'range', min: 1e5, max: 1e6 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/galvanometer-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(4) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
    ],
    needs: [],
    rate: { hours: q(12) },
    steps: [
      { note_zh: '车面板、开表窗、装表：φ60 窗（没有玻璃，用 0.5 mm 铝板压一圈，表盘外露）', performedBy: 'lathe' },
      { note_zh: '接线与计数校验：脉冲发生器（检流计摆动的触点）喂 1000 个脉冲，数错 ≤1', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * 片子台：浇三点支承座 → 刮研导轨与丝杠 → 磨丝杠 → 装配找正。
     *
     *   铸铁 40 + 45 钢 8 + 铜线 0.5 + 水 8 → 台 1 件
     *
     * 丝杠 0.5 mm/转、刻度盘 100 格 ⇒ 5 µm 一格。但**重复性只有 0.1 mm** ——
     * 因为回程差与丝杠热伸长都在 50 µm 量级，而定位靠"回到限位块"消掉一半。
     * 0.1 mm 恰好是光斑的一半，所以"相邻两点重叠 50 %"这件事是**靠限位块保证的**，
     * 不是靠刻度。
     */
    id: 'make/scanner-stage',
    name: '暗场颗粒扫描仪片子台制造',
    produces: [
      {
        item: 'plant/particle-scanner/stage',
        qty: q(1),
        gives: [
          { param: 'travel', kind: 'range', min: 300, max: 320 },
          { param: 'positionError', kind: 'range', min: 0.1, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(40) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(8) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(8) }] },
    ],
    needs: ['plant/gauge-block'],
    rate: { hours: q(30) },
    steps: [
      {
        note_zh: '浇三点支承座：HT250 一炉 40 kg，三个 φ20 淬硬球窝同箱浇（三个球必须等高 ±1 µm）',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1250, max: 1350 }],
      },
      { note_zh: '刮研导轨、车丝杠 Tr16×2 与刻度盘（100 格）', performedBy: 'lathe' },
      { note_zh: '磨丝杠到 5 µm/300 mm，配消隙螺母', performedBy: 'plant/grinder' },
      { note_zh: '装配找正：三点等高、丝杠与导轨平行 0.05/300，限位块敲定零点', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * 暗箱：折焊箱体与门 → 内衬炭黑 → 漏光检验。
     *
     *   钢板 30 + 炭黑 1.5 + 铜线 0.3 + 水 5 → 暗箱 1 件
     *
     * 漏光检验是有判据的：**光闸闭上、碳弧点着，光电管读数 ≤2× 暗电流**。
     * 这一条把"暗"变成可测的：2 nA 对应 10⁻¹⁰ 的漏光比，正是不漏光的样子。
     */
    id: 'make/scanner-darkbox',
    name: '暗场颗粒扫描仪暗箱制造',
    produces: [
      {
        item: 'plant/particle-scanner/dark-box',
        qty: q(1),
        gives: [{ param: 'attenuation', kind: 'range', min: 1e4, max: 1e6 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(30) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(3, 2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: [],
    rate: { hours: q(16) },
    steps: [
      { note_zh: '折焊箱体、门与挡光檐（门缝做两道折边，光走不进直缝）', performedBy: 'plant/sheet-shop' },
      { note_zh: '内衬炭黑：水玻璃? 没有 —— 用石灰浆点粘炭黑，烘干后抖掉浮粉', performedBy: 'plant/robot' },
      { note_zh: '漏光检验：光闸闭上、碳弧点着，光电管读数 ≤2× 暗电流', performedBy: 'plant/robot' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4.3 两条产物路线：有 CMP 与没有 CMP
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **正路**：配浆 → 装片找正 → 抛 7.6 min → 修整 → 冲洗 → 抽检 dishing。
     *
     *   片 1 + 石英粉 0.05 + 水 1 + 重铬酸钠 0.005 + 尾矿砂 0.01 → 平坦化的片 1
     *
     * 投料是"每片每层"的实用量：
     *   浆 1 kg（200 mL/min × 7.6 min ≈ 1.5 L，取 1 kg 只算被带走的那一份；
     *   循环罐里的浆反复用，直到金属离子攒到 100 ppm 才换 —— 这一条模型里没有位置）
     *   石英粉 0.05 kg = 浆的 5 wt%
     *   重铬酸钠 0.005 kg = 0.5 wt%，是氧化剂：Cu → CuO → 被磨掉（Cr(VI) 的毒见降级⑦）
     *   尾矿砂 0.01 kg = 修整环每片要消耗的那一点
     *
     * 工序里有三处"没有 under"的格子，都是缺口不是豁免（第③种情形）：
     *   · 装片找正：不要条件
     *   · 抛光：温度没人维持（车间）
     *   · 冲洗：不要条件
     * 只有"配浆"有温度与压力（湿法槽），"抽检"有 19–21（计量间）。
     */
    id: 'make/wafer-level-cmp',
    name: '单层完成片制造',
    produces: [
      {
        item: 'mat/wafer-level',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 95, max: 105 },
          // 三个数都是**开环声明**：Ra 测不了（15 nm 一档），dishing 只抽 1/25 片
          { param: 'roughness', kind: 'range', min: 1, max: 3 },
          { param: 'dishing', kind: 'range', min: 40, max: 150 },
          { param: 'erosion', kind: 'range', min: 20, max: 60 },
          { param: 'defectDensity', kind: 'range', min: 0.2, max: 0.5 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          // 第一层从裸片起，之后从上一层平坦化的片起 —— 同一条路线套着走
          { item: 'mat/silicon-wafer', qty: q(1) },
          { item: 'mat/wafer-level', qty: q(1) },
        ],
      },
      { anyOf: [{ item: 'mat/silica', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sodium-dichromate', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room', 'plant/water-polisher', 'plant/clean-room'],
    rate: { hours: q(1, 2) },
    steps: [
      {
        note_zh:
          '配浆：石英粉 5 wt% + 重铬酸钠 0.5 wt%，沉降 35 h 取 0.3 µm 那一档（粗粉是划痕源），湿法槽 20–60 °C 搅 30 min',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: '装片与球铰找正：片贴上弹性背垫、挡圈压住边缘，球铰让片自己摆平（倾斜 ≤0.03° = 5×10⁻⁴ rad）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '抛光 7.6 min（600 nm ÷ 79 nm/min）：盘与载片头同速 30 r/min、压力 21 kPa、浆 200 mL/min；**温度没人维持** —— 车间 15–30 °C，这是定时误差的一半',
        performedBy: 'plant/cmp-polisher',
        under: [{ param: 'pressure', min: 15, max: 30 }],
      },
      {
        note_zh: '修整垫 30 s：铸铁环 + 尾矿砂压上去，把釉化的垫面拉毛（修整后必须冲洗，砂本身是划痕源）',
        performedBy: 'plant/cmp-polisher',
        under: [{ param: 'pressure', min: 15, max: 30 }],
      },
      { note_zh: '冲洗与甩干：去离子水冲 60 s（纯水站的产出，量不计入 —— 只写 needs）', performedBy: 'plant/robot' },
      {
        note_zh:
          'dishing 抽检 1/25 片：切 1 mm 方坑，干涉仪读台阶（15 nm 一档，600 nm 的 5 % = 30 nm 刚好两条条纹）—— **破坏性，且只有半定量**',
        performedBy: 'plant/interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * ⚠️ **反例路线，不是替代**：没有 CMP 时本层只能"手抛"。
     *
     *   片 1 + 石英粉 0.1 + 水 2 + 尾矿 0.05 → 平坦化的片 1
     *
     * 这就是 `make/silicon-wafer` 与三块平晶那条手艺：机器人拿着片在 φ300 铸铁平板上
     * 对研 + 0.3 µm 石英粉手抛。它不是"差一点的 CMP"，它是**另一种东西**：
     *
     *   · 压力靠手：±30 %（没有球铰、没有压力区、没有人能按 7.6 min 不变）
     *   · 没有终点：靠看颜色，而 600 nm 的膜看不出颜色变化
     *   · 没有挡圈：边缘塌得更狠
     *   · 一小时抛一片（工业 CMP 是 8 片/h）
     *
     * 交付的窗口是 dishing 300–800 nm、erosion 150–300、defectDensity 3–20 ——
     * 任何一个要求 `dishing ≤ 200` 的下游路线都会把它筛掉。**这一行是 props 的价值**：
     * "没有 CMP 就用不了"这句话，在这里是可以被数据执行的。
     */
    id: 'make/wafer-level-handlap',
    name: '单层完成片制造',
    produces: [
      {
        item: 'mat/wafer-level',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 95, max: 105 },
          { param: 'roughness', kind: 'range', min: 5, max: 15 },
          { param: 'dishing', kind: 'range', min: 300, max: 800 },
          { param: 'erosion', kind: 'range', min: 150, max: 300 },
          { param: 'defectDensity', kind: 'range', min: 3, max: 20 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1, 20) }] },
    ],
    needs: ['plant/comparator/lapping-plate', 'plant/clean-room'],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh: '手抛：片压在 φ300 铸铁平板上，0.3 µm 石英粉 + 水，机器人推 40 min（压力靠手，±30 %）',
        performedBy: 'plant/robot',
      },
      { note_zh: '冲洗（这片子上的砂比 CMP 那片多一倍，冲 120 s）', performedBy: 'plant/robot' },
      { note_zh: '外观检查：斜射光看划痕 —— 判据只有"有没有一片雾"，没有量具', performedBy: 'plant/robot' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4.4 三条检验路线：同一个产物，三种"能数到多小"
  //
  // 三条路线产出同一个 `mat/wafer-inspected`，靠 gives 把量具的极限写成数据。
  // 这不是"三条替代路线"，是**三种量具**：它们给的不是同一个答案，
  // 而 props 让"哪个答案能用"可以被下游筛。
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 暗场散射：碳弧斜照 + 椭球收集 + 光电管积分 + 手动扫点。
     *
     *   片 1 → 判过的片 1（minParticle 0.4–0.6、coverage 100 %）
     *
     * 218 h 一片，是 78.5 万点 × 1 s 算出来的（问题三）。这个数难看，
     * 但它就是"每片每层 <0.1 个/cm²"这个指标的真实价格：
     * **一层 9 天，十层 90 天，一片晶圆三个月只做检验。**
     *
     * 阈值是每片重调的：把检流计摆到"暗电流的 10 倍"，那就是判据。
     * 所以这一条路线**不可重复**（温度一变，阈值就偏），这也是它只敢报 0.4–0.6 的原因。
     */
    id: 'make/wafer-inspect-darkfield',
    name: '检验后晶圆制造',
    produces: [
      {
        item: 'mat/wafer-inspected',
        qty: q(1),
        gives: [
          { param: 'minParticle', kind: 'range', min: 0.4, max: 0.6 },
          { param: 'density', kind: 'range', min: 0, max: 0.5 },
          { param: 'coverage', kind: 'range', min: 100, max: 100 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/wafer-level',
            qty: q(1),
            need: [{ param: 'dishing', kind: 'range', max: 200, dir: 'atMost' }],
            // 放宽到 800 nm 只是"数颗粒不受影响"（颗粒与台阶是两件事），
            // 但那样的片子进不了下一层 —— 所以是 functional-kept 的检验、functional-lost 的工艺
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    // 78.5 万点 × 1 s = 218 h。抽 5 % 面积是 11 h，但那证明不了 <0.1 个/cm²。
    rate: { hours: q(218) },
    steps: [
      { note_zh: '装片、关暗箱、光闸闭上读暗电流（判据 ≤2 nA；这一个数决定整片的下限）', performedBy: 'plant/robot' },
      {
        note_zh:
          '暗场扫点：光斑 φ0.2、步距 0.1（50 % 重叠）、每点积分 1 s，78.5 万点 —— 阈值摆到"暗电流 ×10"',
        performedBy: 'plant/particle-scanner',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '复判：亮点用 100× 反射显微镜看一遍（0.7 µm），把"划痕/针孔"与"颗粒"分开',
        performedBy: 'plant/mask-aligner',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      { note_zh: '计数与画图：按 5 个环带记密度，报"≥0.5 µm 的颗粒数/cm²"', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * 显微镜目视：100× 反射物镜 + 人眼，判 0.7 µm。
     *
     *   片 1 → 判过的片 1（minParticle 0.7–1.0、coverage 2 %）
     *
     * 0.7 µm 不是物镜的分辨率，是**人眼的**：1′ 的角分辨 ÷ 100× = 0.73 µm
     * （`unblock-mask-stage` 第六节那张表，与掩模对准同一支镜筒）。
     * 覆盖 2 % 是因为人扫不动：一个视场 φ0.1 mm，看 1 分钟，看 100 个视场就是 2 h，
     * 那 100 个视场只占 φ100 片的 0.16 % —— 2 % 已经是"看一整天"。
     *
     * 为什么留着这一条：**它是唯一能"看着东西说出它是什么"的手段**。
     * 暗场只给"这里有个亮点"，显微镜给"这是一颗 0.6 µm 的颗粒，不是针孔"。
     */
    id: 'make/wafer-inspect-microscope',
    name: '检验后晶圆制造',
    produces: [
      {
        item: 'mat/wafer-inspected',
        qty: q(1),
        gives: [
          { param: 'minParticle', kind: 'range', min: 0.7, max: 1.0 },
          { param: 'density', kind: 'range', min: 0, max: 5 },
          { param: 'coverage', kind: 'range', min: 2, max: 4 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/wafer-level',
            qty: q(1),
            need: [{ param: 'dishing', kind: 'range', max: 200, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    rate: { hours: q(10) },
    steps: [
      { note_zh: '装片与对位：x-y-θ 台把片心送到物镜下（行程 ±12 mm）', performedBy: 'plant/robot' },
      {
        note_zh: '目视扫视场：100×、NA 0.07、视场 φ0.1，看 100 个视场 = 2 h；人眼判读 0.7 µm',
        performedBy: 'plant/mask-aligner',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      { note_zh: '判读与记数：亮点是颗粒还是针孔，靠"调焦时它变不变形"分', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * 镜子法：用 13.5 nm 反射计逐点测反射率，找"变暗的点"。
     *
     *   片 1 → 判过的片 1（minParticle 8–15、coverage 100 %）
     *
     * 它**看得见**颗粒 —— 一颗颗粒挡掉光斑里的一块面积，反射率就掉那么多。
     * 但两个硬限制（问题四）：
     *   灵敏度  一颗 0.1 µm 掉 5×10⁻⁵ %，而仪器分辨 0.3 % ⇒ 只能看见 ≥8 µm
     *   分辨率  光斑 φ0.2 mm ⇒ 0.1 µm 的 2 000 倍
     *
     * 所以它在这一层的用处是**宏观缺陷**：划伤（几十 µm 宽、几 mm 长）、
     * 麻点、膜厚台阶。对颗粒计数，它连分母都算不上。
     *
     * 时间也是不可能的：19.6 万点 × 10 min = 3.7 年/片（而且没有 X/Y 台，要人搬）。
     * 所以 `coverage 100` 在这里是"道理上全覆盖"，不是"这一片真扫完了" —— 这是它最糟的一处。
     */
    id: 'make/wafer-inspect-mirror',
    name: '检验后晶圆制造',
    produces: [
      {
        item: 'mat/wafer-inspected',
        qty: q(1),
        gives: [
          { param: 'minParticle', kind: 'range', min: 8, max: 15 },
          { param: 'density', kind: 'range', min: 0, max: 0.02 },
          { param: 'coverage', kind: 'range', min: 100, max: 100 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/wafer-level',
            qty: q(1),
            need: [{ param: 'dishing', kind: 'range', max: 200, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(40) },
    steps: [
      { note_zh: '装片：φ320 三点支承，俯仰微调（0.2 mm 的光斑落在哪一点，靠 50 mm 平移与限位块找）', performedBy: 'plant/robot' },
      {
        note_zh:
          '逐点测反射率：入射角 6°，开 30 s / 关 30 s × 10 轮取差值；0.1 mm 的颗粒在这台仪器上是 5×10⁻⁵ %，看不见',
        performedBy: 'plant/euv-reflectometer',
        under: [{ param: 'temperature', min: 20, max: 150 }],
      },
      { note_zh: '画缺陷图：把 R 掉超过 0.3 % 的点连起来 —— 得到的是划伤与麻点的形状，不是颗粒', performedBy: 'plant/robot' },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...MULTILEVEL_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/cmp-polisher',
    name: '化学机械抛光机装配',
    produces: [{
      item: 'plant/cmp-polisher',
      qty: q(1),
      gives: [
      { param: 'downforce', kind: 'range', min: 0.02, max: 0.6 },
      { param: 'platenSpeed', kind: 'range', min: 5, max: 150 },
      { param: 'uniformity', kind: 'range', min: 0, max: 15, dir: 'atMost' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/particle-scanner',
    name: '暗场颗粒扫描仪装配',
    produces: [{
      item: 'plant/particle-scanner',
      qty: q(1),
      gives: [
      { param: 'minParticle', kind: 'range', min: 0.05, max: 10, dir: 'atMost' },
      { param: 'spotSize', kind: 'range', min: 0.05, max: 5, dir: 'atMost' },
      { param: 'scanPoints', kind: 'range', min: 1000, max: 10000000, dir: 'atLeast' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...MULTILEVEL_ROUTES, ...ASSEMBLY_ROUTES];
