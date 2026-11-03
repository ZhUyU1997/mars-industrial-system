/**
 * X 射线干涉计量 —— Bonse-Hart 三晶干涉仪（1965）。
 *
 * 一句话：**把长度基准从"光的波长"换成"硅的晶格"**，于是 0.1 nm 从一个
 * "1/4880 个条纹"变成"0.32 个条纹"。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么这一条能解 0.1 nm
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `null-test.ts` 问题 4 的判词是：0.1 nm 面形**不能验收**。三个独立障碍之一是
 * **标定地板 8.7–10 nm**（CGH 刻写误差 8.7、球面标定不确定度、干涉仪读数 0.52）。
 * 三个数看着是三件事，其实是一件事：**尺子本身是光学做的**。
 * 光学的"参考面"是一块抛出来的面（0.52 nm）；CGH 的"基准"是一条条刻出来的线
 * （10 nm/100 mm，`std/calibrated-scale-100` 的 accuracy，`stabilized-laser.ts:645`）。
 * 抛光与刻线的极限都在 1 nm 上下 —— 这就是为什么"再往下"不能继续靠光。
 *
 * 硅 (111) 面的间距是原子自己摆出来的：
 *
 *   a = 0.5431 nm（22.5 °C；计量值 0.5431066）
 *   d₁₁₁ = a/√3 = 0.31356 nm
 *
 * 同一块完美晶体里，任意两处的面间距相对差 < 10⁻⁷ —— 这不是"加工得好"，
 * 这是"完美晶体"的定义。Bonse-Hart 1965 把一块硅凿成三片晶瓣（L 形三重劳厄），
 * 让一束 X 光劈开、再合上：**一个晶瓣相对另两片移动一个面间距，条纹正好走一圈。**
 * 于是位移直接读成"条纹的几分之一"，而分数由移相法解算。
 * 1965 年他们量到 10 pm —— 条纹的 1/31。
 *
 * ── 这台机器交付什么、不交付什么 ────────────────────────────────────────────
 *
 *   交付 ①  10 pm 的位移标尺（`resolution ≤0.01 nm`，相位 11°）
 *   交付 ②  一个 **0.1 nm 的台阶标准件**（100 nm ± 0.1 nm，
 *           `plant/xray-interferometer/step-standard`）—— 有了它，"0.1 nm 面形"的
 *           验收从"信不信 CGH 的刻写误差"变成"跟标准件比"，标定地板从 8.7 nm 落到 0.1 nm
 *   不交付  100 mm 上的绝对 0.1 nm（1e-9）—— 那要 4e-4 K 的控温 + 1e-4 K 的测温，
 *           本层都没有。问题五给了"能绕多少、绕不掉哪一半"的账
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、分辨率：一个条纹 0.3136 nm，0.1 nm 是 0.32 个条纹 —— 这为什么可行
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 条纹周期就是面间距：位移 u（沿 (111) 法向）给相位 φ = 2π·g·u，g = 1/d₁₁₁。
 * u = d₁₁₁ 时 φ = 2π，一个条纹。
 *
 *   晶格  0.1 nm / 0.31356 nm = **0.319 条纹 = 114.8°**
 *   光学  0.1 nm / 244 nm      = **4.10×10⁻⁴ 条纹 = 0.148°**
 *                             （λ/2 = 244 nm 是 488.0 nm 双程，
 *                              `stabilized-laser.ts:1376` 同一个数）
 *
 * 差 778 倍。**分数条纹靠移相法解算**：把晶瓣用石英压电堆推 8 档，
 * 每档 d₁₁₁/8 = 39.2 pm（压电 294.4 pm/V × 0.133 V，`phase-shifter.ts` 的堆），
 * 八帧解出一个分数相位；整条纹数由计数器数（整数不丢），分数由八帧插值。
 * 于是 0.1 nm 的读数是"114.8° 里读准 11°"，不是"0.148° 里读准 0.01°"。
 *
 * **为什么晶格的更容易** —— 不是晶格更准，是**被测的量更大**：
 *
 *   统计   σ_φ = 1/(m·√N)。m = 0.2、N = 10³ → σ_φ = 9° = **0.025 条纹 = 7.8 pm**
 *   光学   同一个 σ_φ = 9° 在 244 nm 上就是 6.1 nm —— 而且参考面自己就有
 *          0.52 nm（2.1×10⁻³ 条纹）的误差，比要测的 4.1×10⁻⁴ 条纹**大 5 倍**
 *   晶格   要测的 0.319 条纹比同一台机器 0.025 条纹的相位噪声**大 13 倍**
 *
 * 两个仪器的误差都按"条纹的几分之一"计，所以 778 倍的条纹分数差就是全部答案。
 * 附带一条：晶格的"参考面"是原子面（面间距复现性 10⁻⁷ = 0.03 pm），
 * 光学的参考面是抛出来的（0.52 nm = 1.7×10⁻⁹ 相对）—— 差 50 倍，
 * 但两者都不是瓶颈；瓶颈是"4×10⁻⁴ 条纹要整条链多稳"。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、完美晶体：位错密度可以到 0，但加工会引入位错 —— 要磨抛掉多少
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 直拉硅（`plant/cz-puller`）的无位错单晶，位错密度 < 100 cm⁻²，工程上就叫"零位错"。
 * 加工损伤层的深度（硅，游离磨料）：
 *
 *   线锯切片 10–20 µm（SiC 10–20 µm 粒度）→ 研磨 2–5 µm → 机械抛 0.2–1 µm → CMP < 1 nm
 *
 * 每一道要磨掉上一道损伤深度的 **3 倍**，所以整条链是 20 → 60 → 6 → 0.6 µm。
 *
 * **但本件要磨的深度是 0 µm。** 劳厄（透射）几何里 X 光从硅片的两个大面进出，
 * 而那两个面是 `make/silicon-wafer` 出厂就抛好的（Ra < 5 nm），开槽只切侧面的槽壁。
 * 光束走在晶瓣中间，离槽壁 0.25 mm —— 是槽壁 20 µm 损伤层的 12 倍远。
 * 所以：**衍射面一刀不碰，磨抛只对槽壁做**（60 µm + 6 µm + 0.6 µm），
 * 目的不是衍射，是防崩边与防裂（槽壁的微裂纹是疲劳源）。
 *
 * 位错会不会长进衍射体积：**不会。** 硅在室温是脆性区，位错滑移要 > 0.6·T_m ≈ 950 K，
 * 所以磨抛产生的位错**留在损伤层里不动**（这一点与金属相反，是硅的运气）。
 *
 * `plant/grinder` + `plant/cmp-polisher` 够不够：**够，但够在"清槽壁"上。**
 * 真正的敌人不是位错，是**应力释放的弯曲**：0.7 mm 薄片上开两条 15 mm 长的槽，
 * 残余应力释放会让晶瓣弓起来。硅片出厂弓形 < 30 µm，开槽后可能翻倍到 60 µm：
 *
 *   曲率 R = L²/(8h) = 100²/(8×0.06) = 20.8 m
 *   0.1 mm 光束上的局部转角 = 0.1 mm/20.8 m = **4.8 µrad = 0.33 个达尔文宽度**
 *   → 条纹对比度掉约 30%（写进降级③）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、X 光管：铜 Kα 0.154 nm，30 kV，多少管流，焦斑多小
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   Cu Kα₁   0.154056 nm（Kα 加权 0.15418）
 *   Cu K 吸收边 8.979 keV = 0.13808 nm
 *   布拉格   sinθ = λ/2d = 0.154056/(2×0.31356) = 0.24565 → **θ = 14.217°**（2θ = 28.43°）
 *   达尔文宽度 ≈ 3 角秒 = 1.45×10⁻⁵ rad（Si(111)、Cu Kα₁）—— 这就是整台仪器的角度通带
 *
 * **为什么是 30 kV**：阈值只要 8.98 kV（越过 K 吸收边就能激发 K 系），
 * 而 K 系产额在 V/V_K = 3–4 处最高 —— 30 kV = 3.34 倍，所以 30 kV 是"最优激发"，
 * 不是"刚好激发"。λ_min = 1.2398/30 = 0.0413 nm 的连续谱进不来：
 * 达尔文窗口的波长带宽 Δλ/λ = Δθ/tanθ = 1.45×10⁻⁵/0.2537 = 5.7×10⁻⁵，只放行 ±0.0000088 nm。
 *
 * **功率 60 W = 30 kV × 2 mA**。两个独立算法落在同一个数上：
 *
 *   ① 面负载  6° 取角把 0.1 mm 的视在焦斑铺成 0.1 × 0.955 mm 的线焦（0.0955 mm²），
 *             铜靶长期面负载 0.5–1 kW/mm² → 48–96 W
 *   ② 点源热  ΔT = P/(2πκr)，κ_Cu = 401 W/(m·K)、r = 0.05 mm → P/0.126 W/K；
 *             允许 500 K（铜熔点 1358 K）→ **63 W**
 *
 * 取 60 W（0.63 kW/mm²，留 1.6 倍余量）。**"1 kW/mm²"不是小焦斑时的限制**：
 * 0.1 mm 的点源是三维扩散，限制是 P/(2πκr) 而不是 P/A —— 6.3 kW/mm² 也扛得住，
 * 只要线焦面积够（这就是 6° 取角的意义）。
 *
 * **焦斑 0.1 mm 给的不是空间相干**：ξ = λR/s = 0.154 nm × 400 mm/0.1 mm = 0.62 µm，
 * 比 0.1 mm 的光束小 160 倍。三晶干涉仪不需要空间相干 —— 相位只由晶瓣位移定、
 * 与入射角无关（三片同一块晶体，色散与角度一阶相消），每一个源点各自干涉。
 * 0.1 mm 定的是**光束截面 = 测量点的空间分辨**。真正被源尺寸卡的是接受角：
 * 源发散 2s/R = 5×10⁻⁴ rad，晶体只收 2.9×10⁻⁵ rad → **5.8%**，
 * 于是计数率 ~10 cps（量级估计，见降级⑥）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、铍窗：没有铍，用什么
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `mat/beryllium` 全表没有（`stabilized-laser.ts:351` 同一句：氦、氖、碘也没有）。
 * 退路是铝：
 *
 *   μ/ρ(Al, 8.05 keV) = 48.6 cm²/g，ρ = 2.70 → μ = 131 cm⁻¹ → **衰减长度 76 µm**
 *   0.05 mm 窗 → exp(−0.655) = **52%**；0.02 mm 窗 → 77%
 *
 * 0.05 mm 铝箔挡 1 atm 撑得住：φ5 孔上的膜应力 σ = Δp·r/(2t)
 * = 0.1 MPa × 2.5 mm/(2×0.05 mm) = **2.5 MPa** < 铝退火屈服 35 MPa。
 *
 * 所以：**铝窗 0.05 mm，代价 48% 的计数率。** 另一条路是整机同真空、根本不要窗
 * （100%，×1.9），但换样要破真空 —— 本层先做带窗那一版（降级④的升级里写了真空版）。
 *
 * 氦只有 R10 一次性装填，不够充腔 → 腔里充**氮**：N₂ 在 8.05 keV 的衰减长度 ~4 m，
 * 100 mm 光程只丢 2.5%，而且能把水汽赶走（水对 8 keV 的吸收是空气的 100 倍）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、热：α = 2.6 ppm/K，4×10⁻⁴ K 要不要，能不能绕
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * α_Si = 2.6×10⁻⁶/K。100 mm 上 0.1 nm 是 1×10⁻⁹ → **ΔT ≤ 3.85×10⁻⁴ K**。
 * 恒温间是 19–21 °C（`plant/metrology-room` 的 holds，±1 K）→ 差 **2600 倍**。
 *
 * **结论：绕得过"测量"这一关，绕不过"绝对长度"这一关。** 三条账：
 *
 *   ① 共模   标尺 d₁₁₁(T) 与被测件同料同温时，条纹数 N = L/d 里的 (1+αΔT) 一阶相消。
 *             残差 = (α_件 − α_Si)·ΔT·L；**硅件对硅标尺是 0**。
 *             这不是推理出来的运气，是设计：本件的量测架、样品座、晶瓣
 *             **都从同一片硅上切下来**（两条路线各吃一片 `mat/silicon-wafer`）。
 *             热胀共模是 Bonse-Hart 几何自带的：三晶同块，两束在晶体里走对称路，
 *             均匀温变让两臂同胀，条纹不动。
 *   ② 差值   要验收的是**局部高差**。0.1 nm 落在 1 mm 的采样间隔上 = 1×10⁻⁷ →
 *             ΔT ≤ 1×10⁻⁷/2.6×10⁻⁶ = **0.038 K**（比 4×10⁻⁴ K 松 100 倍）。
 *             "0.1 nm 在 100 mm 上"这个说法把**绝对长度**与**局部面形**混成了一件 ——
 *             面形本来就是高差，不是长度。
 *   ③ 时间   一次相位测量 60 s，要的是**漂移**不是绝对值。0.1 K/h 在 60 s 内是
 *             1.67×10⁻³ K，在 1 mm 上是 **4.3 pm** ✓
 *
 * 于是本层的指标不是 4×10⁻⁴ K，而是 **跨晶体梯度 ≤0.05 K、漂移 ≤0.1 K/h**。怎么来：
 * 铜热沉 60 kg（热容 23 kJ/K）+ 三层矿棉 + 钢罩，漏热 0.5 W/K →
 * τ = 23×10³/0.5 = 4.6×10⁴ s = **12.8 h**；恒温间 8 h 周期的 ±0.5 K 被压 10 倍 → **0.05 K**。
 *
 * 绕不掉的那一半：**绝对 100 mm 的 1e-9 要 4×10⁻⁴ K 的控温，本层只有 0.05 K**
 * （100 mm 上合 13 nm）。所以这台机器交付的是"10 pm 的位移标尺 + 0.1 nm 的台阶标准件"，
 * 不是"100 mm 上的绝对 0.1 nm"。剩下的那一半在降级⑤里说清，并给出升级条件。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、这台机器长什么样
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   管体     铜靶（6° 取角、水冷）+ 钨丝阴极 + 0.05 mm 铝窗 + 玻璃筒（压紧式封接）
 *   高压     400 Hz 倍压，12 只 3 kV 整流堆串 36 kV，60 只薄膜电容串成电容柱（0.17 µF）
 *   三晶瓣   一整片 φ100×0.7 mm 硅上开两条槽（0.4 mm 宽、深 15 mm、间距 2 mm）
 *            **衍射面是硅片原有的抛光面，一刀不碰**（问题二）
 *   微动台   4 只石英压电堆（294.4 pm/V）+ 挠性铰链，行程 294 nm，粒度 29 pm
 *   探测器   ZnS:Ag 荧光屏 + 剥窗光电二极管 + 计数链（`mat/zns-ag-phosphor` 已有）
 *   恒温罩   60 kg 铜热沉 + 三层矿棉 + 钢罩 + 1 atm 氮，τ = 12.8 h（问题五）
 *
 * 六件零件各一条路线；机器本身是**装配体**（`composedOf`，没有产出路线，
 * 与 `plant/ref-flat-interferometer`、`plant/laser-stage`、`plant/phase-shifter` 同一个形状）。
 * 它不进 `performedBy`（那是既有设备的账），在描述里的位置是 `needs` ——
 * `make/xray-step-standard` 那条路线**必须在它上面做**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 七、降级与升级（R8：每一处降级都给出恢复原规格的条件与缺口量级）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ① 位错密度验不了：没有腐蚀坑（HF 只吃 SiO₂，HF+HNO₃ 的硝酸不在料表），
 *    没有 X 射线形貌相机。**替代体检：条纹对比度**（对比度 0.2 说明晶瓣还在达尔文宽度内）。
 *    升级：`plant/e-beam-column` 的 EBIC/CL 看位错到 10⁴ cm⁻²（缺 2 个量级）；
 *    要 100 cm⁻² 得 X 射线形貌（同步辐射那一档，本层没有）。
 * ② 晶向靠解理定：硅沿 {111} 解理，断口认 (110) 面，精度 ±1°。没有 X 射线定向仪。
 *    但**这台机器自己就是定向仪**（扫摇摆曲线，峰位就是角）—— 粗解理定 ±1°，本机定到 ±0.01°。
 * ③ 晶瓣弯曲：开槽应力释放，弓形 30 → 60 µm，局部转角 4.8 µrad = 0.33 个达尔文宽度，
 *    对比度掉 30%。升级：槽长从 15 减到 8 mm（弯曲 ∝ L²，0.33 → 0.09）；
 *    缺口 0.33 个达尔文宽度。
 * ④ 铝窗吃 48%（没有铍）。升级：整机同真空去窗 → ×1.9；或将来有铍（0.125 mm 透过 95%）→ ×1.8。
 *    缺口 1.9 倍计数率。
 * ⑤ 绝对长度（100 mm 上 1e-9）做不到：要 4×10⁻⁴ K 控温 + 1e-4 K 测温，本层只有 0.05 K。
 *    缺口 2600 倍。升级：全硅工件（Δα = 0）+ 真空腔 + 三层主动恒温；
 *    本层不做 —— 这一档是 CODATA 那条路（多个晶体互比），不是一间计量间能做到的。
 * ⑥ 计数率 ~10 cps（60 W 固定靶）。升级：转靶 2 kW（真空旋转密封 + 3000 r/min，
 *    本层没有）→ ×30；缺口 1.5 个量级。所以这台机器是**标定仪器，不是面形仪**：
 *    一点 20–100 s，一张 10×10 点图要几小时。
 * ⑦ 晶瓣 0.7 mm 厚（硅片只有这个厚度），Borrmann 下每次透过 21%，三次后 0.9%。
 *    升级：只把槽之间的薄区减薄到 0.35 mm（每次 46%、三次 10%，×11）——
 *    那要选择腐蚀，HF 不吃硅，硝酸与 KOH 都不在料表。缺口 11 倍计数率。
 * ⑧ 氧分压测不了：钨丝退火要 oxygen_ppm ≤ 50，而本层**没有氧分析仪**。
 *    照 #23 的规矩写成条件并声明降级：靠五轮氩冲洗 + 炉膛露点，判据落到"丝的室温电阻
 *    与老炼后的发射电流"。升级：氧化锆电池要 700 °C + 参考气、顺磁要精密流量 —— 都不在料表。
 *    缺口 50 ppm → 1 ppm 两个量级。
 * ⑨ 台阶的氧化层原值只到 ±1%（0.44×227 nm 的生长比），**标定补上它**：
 *    "刻不准（长不准）"与"量不准"是两件事，缺的从来是后者（`stabilized-laser.ts:631` 同一句）。
 *    升级：不要这一层误差就得在线测氧化层厚度（椭偏仪，本层没有）—— 但没必要，
 *    因为台阶高度是被 X 射线数出来的，不是算出来的。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目：六件零件 + 一件标准件 + 一台机器
//
// 顺序就是 X 光走的顺序：管 → 高压 → 三晶瓣 → 微动台 → 探测器 → 恒温罩，
// 最后是这台机器，以及它交付的那一件**能拿走的实物**（台阶标准件）。
// ═══════════════════════════════════════════════════════════════════════════

export const XRAY_ITEMS: readonly Item[] = [
  /**
   * **X 光管管体。** 铜靶 + 钨丝阴极 + 0.05 mm 铝窗 + 玻璃筒 + 铸铁法兰。
   *
   * 三个 props 就是问题三的三个结论：
   *
   *   focalSpot  0.1 mm  视在焦斑（6° 取角把线焦压回来）+ 它定的是空间分辨，不是相干
   *   power      60 W    30 kV × 2 mA；面负载 0.63 kW/mm²、点源热 ΔT = 476 K 两条都过
   *   takeoff    6°      线焦面积 0.0955 mm² 的来源；取角越小焦斑越扁、面负载越低
   *
   * 玻璃筒不焊在金属上：两端用**铜垫 + 四螺栓压紧**（可拆卸真空封接）。
   * 这样玻璃只受外压 0.1 MPa 的**压应力**（玻璃最喜欢的状态），
   * 也绕开了"没有可伐合金、做不出匹配封接"这条死路 ——
   * 铁 α = 12×10⁻⁶、钠钙玻璃 9×10⁻⁶ 的失配封接会裂（3×10⁻⁶×400 K×70 GPa = 84 MPa）。
   */
  {
    id: 'plant/xray-interferometer/tube',
    name: 'X-Ray Tube Body', name_zh: 'X 光管管体',
    unit: '件',
    category: 'part',
    props: [
      { param: 'focalSpot', kind: 'range', min: 0, max: 1, unit: 'mm', dir: 'atMost' },
      { param: 'power', kind: 'range', min: 0, max: 1000, unit: 'W', dir: 'atLeast' },
      { param: 'takeoff', kind: 'range', min: 0, max: 90, unit: '°' },
    ],
  },

  /**
   * **高压电源。** 400 Hz 倍压整流：12 只 3 kV 整流堆串成 36 kV（30 kV 额定留 20%），
   * 60 只薄膜电容（630 V 各）串成 30 kV 电容柱。
   *
   * 纹波算得出来：ΔV/V = I/(2f·C·V)。
   *   C_柱 = 10 µF/60 = 0.17 µF（`std/capacitor-film-general` 的上限是 10 µF，
   *   而串联后容量除以只数 —— 所以 60 只串出来的不是"更大"而是"更耐压、更小"）
   *   ΔV/V = 2×10⁻³/(2×400×0.17×10⁻⁶×3×10⁴) = **0.049%** ✓
   *
   * 为什么要 0.05% 而不是随便：高压漂 0.05% 就是管流漂 0.05%，
   * 而计数率的统计误差在 1% 量级 —— 高压只要稳在 0.1% 以内就不进误差表。
   * 灯丝电源浮在 −30 kV 上（阴极接地方式是"阳接地"：靶接地、水冷方便），
   * 所以要一只隔离变压器，绕在与高压同一只油箱里。
   */
  {
    id: 'plant/xray-interferometer/hv',
    name: 'X-Ray High-Voltage Power Supply', name_zh: 'X 高压电源',
    unit: '件',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 0, max: 100, unit: 'kV', dir: 'atLeast' },
      { param: 'current', kind: 'range', min: 0, max: 100, unit: 'mA', dir: 'atLeast' },
      { param: 'ripple', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * **三晶瓣 —— 整台机器的心脏。** 一整片 φ100×0.7 mm 硅上开两条槽，
   * 开出三片晶瓣（L 形三重劳厄：分束、反射、分析各一片）。
   *
   * 三个 props：
   *
   *   thickness  0.7 mm   硅片就是这个厚度，**不减薄**：0.7 mm 在 Borrmann 效应下每次透过
   *                       21 %，三次后 0.9 %；减到 0.35 mm 能到 10 %（降级⑦），
   *                       但选择腐蚀的酸不在料表
   *   lamellae   3 片     必须是**同一块单晶**：三片各自装的话相对转角 1 角秒就是 1/3
   *                       个达尔文宽度，条纹立刻糊掉。这一条是"完美晶体"真正的用处
   *   tiltError  ≤2 角秒  开槽应力释放后的晶瓣相对转角；达尔文宽度 3 角秒，
   *                       2 角秒 = 0.67 个宽度（降级③），对比度 ~30%
   *
   * **为什么不用小块晶体**：切外形会引入边缘应力与崩边，而整片是自撑的
   * （φ100 的圆盘三点支撑，刚度够），而且大热容正好帮问题五的忙。
   *
   * **为什么衍射面一刀不碰**：劳厄几何里光束从两个大面进出，而那两个面是硅片
   * 出厂抛好的（Ra < 5 nm）。开槽只切侧面 —— 损伤层（20 µm）留在槽壁上，
   * 离光束 0.25 mm。这是问题二的全部答案，也是"加工会引入位错"这句话在本件上
   * 不咬人的原因。
   */
  {
    id: 'plant/xray-interferometer/crystal',
    name: 'X-Ray Three-Crystal Element', name_zh: 'X 三晶瓣',
    unit: '件',
    category: 'part',
    props: [
      { param: 'thickness', kind: 'range', min: 0, max: 5, unit: 'mm' },
      { param: 'lamellae', kind: 'range', min: 0, max: 10, unit: '片', dir: 'atLeast' },
      { param: 'tiltError', kind: 'range', min: 0, max: 100, unit: '角秒', dir: 'atMost' },
    ],
  },

  /**
   * **微动台。** 4 只石英压电堆（每只 32 片 X 切石英，d₁₁ = 2.3 pm/V →
   * 73.6 pm/V，4 只 294.4 pm/V）+ 两根钢挠性铰链 + 一块**硅基座**。
   *
   * 三个 props：
   *
   *   coarseStroke   10 mm    螺杆行程，把样品/晶瓣送进光路（1 µm 精度就够，它只负责"到位"）
   *   fineStroke     294 nm   1000 V × 294.4 pm/V。要测的台阶是 100 nm = 319 个条纹，够
   *   resolution     29 pm    1000 V 电源的 0.1 V 一档 × 294.4 pm/V。
   *                           **粒度不是精度**：条纹相位把实际位置读到 10 pm，
   *                           粒度只限制台阶波形的平滑度（数整条纹要单调）
   *
   * 为什么基座是硅：问题五的①。量测架、样品座、晶瓣**同料同胀**，
   * (α_件 − α_Si) = 0，温度的一阶项整项消掉。用钢（α = 11×10⁻⁶）
   * 就是 4 倍的残差，100 mm 上 0.5 K 给 130 nm —— 比要测的东西大 1300 倍。
   *
   * 为什么是石英而不是 PZT：本层没有 PZT（`phase-shifter.ts` 第一段）。
   * 石英的 d₁₁ 是 PZT 的 1/200，所以行程只有 294 nm —— 但台阶与面形都在这个量级里。
   */
  {
    id: 'plant/xray-interferometer/stage',
    name: 'X-Ray Fine Adjustment Stage', name_zh: 'X 微动台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'coarseStroke', kind: 'range', min: 0, max: 100, unit: 'mm', dir: 'atLeast' },
      { param: 'fineStroke', kind: 'range', min: 0, max: 10000, unit: 'nm', dir: 'atLeast' },
      { param: 'resolution', kind: 'range', min: 0, max: 100, unit: 'nm', dir: 'atMost' },
    ],
  },

  /**
   * **探测器。** ZnS:Ag 荧光屏（8 µm 沉降层 + 40 nm 铝化）+ 剥窗光电二极管
   * + 前置放大与甄别计数链。
   *
   * 抄 `plant/se-detector` 的光路（`se-detector.ts` 第二节）：荧光粉把 8 keV 的光子
   * 换成 450 nm 的蓝光（能量效率 15–20%，一光子 8.05 keV → ~400 个蓝光子），
   * 光电二极管把蓝光变电。**本层没有 X 射线闪烁体单晶**，粉层是唯一的路。
   *
   * 三个 props：
   *
   *   efficiency  25%   8.05 keV 在 ZnS 里的 1/μ ≈ 56 µm，8 µm 层只吸收 13%；
   *                     加背面铝反射（×1.4）与光导收集（×0.65）→ 25% 是上限
   *   countRate   10³   计数链的天花板（`std/counter-chip-general` 4 位、~1 MHz 死时间；
   *                     实际计数率是 ~10 cps，见降级⑥ —— **能力不是实际**）
   *   darkCount   ≤1    荧光屏不发光时二极管的暗计数，决定"有没有信号"的判据
   *
   * 为什么不用电离室：充气电离室要 8 keV 下 100% 吸收，得 30 atm 氙 —— 本层没有氙
   * （`mat/xenon` 没有，`xenon-loop.ts` 里那点氙是循环用的）。荧光屏这条路料全是现成的。
   */
  {
    id: 'plant/xray-interferometer/detector',
    name: 'X-Ray Detector', name_zh: 'X 探测器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'efficiency', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'countRate', kind: 'range', min: 0, max: 1000000, unit: 'cps', dir: 'atLeast' },
      { param: 'darkCount', kind: 'range', min: 0, max: 1000, unit: 'cps', dir: 'atMost' },
    ],
  },

  /**
   * **恒温罩。** 60 kg 铜热沉筒 + 三层矿棉 + 钢罩 + 1 atm 氮气路。
   *
   * 三个 props 就是问题五的三个数：
   *
   *   temperatureStability  0.05 K   罩内波动（恒温间 ±0.5 K 被 τ 压 10 倍）
   *   drift                 0.1 K/h  漂移率。**这是模型写不出来的那一类条件**
   *                                  （`Condition` 只有 min/max，`phase-shifter.ts` 问题 4
   *                                  说过同一件事），所以写在 props 上而不是 `under` 里
   *   thermalTimeConstant   12.8 h   60 kg 铜（23 kJ/K）÷ 漏热 0.5 W/K = 4.6×10⁴ s
   *
   * 为什么是氮不是氦：`mat/helium` 全表没有。N₂ 在 8.05 keV 的衰减长度 ~4 m，
   * 100 mm 光程只丢 2.5%；而水汽在 8 keV 的吸收是空气的 100 倍，所以充氮同时
   * 是"除湿"，这是它比真空更省事的地方（换样不用破真空）。
   */
  {
    id: 'plant/xray-interferometer/housing',
    name: 'X-Ray Temperature-Controlled Enclosure', name_zh: 'X 恒温罩',
    unit: '件',
    category: 'part',
    props: [
      { param: 'temperatureStability', kind: 'range', min: 0, max: 10, unit: 'K', dir: 'atMost' },
      { param: 'drift', kind: 'range', min: 0, max: 10, unit: 'K/h', dir: 'atMost' },
      { param: 'thermalTimeConstant', kind: 'range', min: 0, max: 1000, unit: 'h', dir: 'atLeast' },
    ],
  },

  /**
   * **台阶标准件 —— 这台机器唯一能拿走的产出。** 硅片上 100 nm 高的台阶，
   * 高度由晶格标定到 **±0.1 nm**。
   *
   * 它为什么是零件而不是"数据"：台阶在那片硅上，十年后还在那里
   * （与 `plant/phase-shifter/step-etalon`、`std/calibrated-scale-100` 同一个形状 ——
   * **一台设备的第一件产出，是一件可以拿去复查的实物**）。
   *
   * 台阶怎么来的（两步，料全在表里）：
   *   ① 干氧 1100 °C 长 227 nm 氧化层（`plant/diffusion-furnace`，900–1200）
   *   ② HF 剥掉氧化层 —— **HF 只吃 SiO₂ 不吃硅**，于是硅面上留下
   *      0.44 × 227 = **100 nm** 的台阶（热氧化有 0.44 的硅/氧化层厚度比）
   *
   * 三个 props：
   *
   *   stepHeight   100 nm    由氧化时间定，只到 ±1%（±1 nm）
   *   uncertainty  ≤0.1 nm   **由 X 射线数出来**：100 nm = 319 个条纹，
   *                          整条纹数由计数器数（整数不丢），两端各插到 0.03 个条纹
   *                          （= 9.4 pm）→ 合成 0.1 nm
   *   area         100 mm²   台阶的有效区（10×10 mm），够盖住面形仪的一个视场
   *
   * **关键的一句**：台阶"长得准不准"不重要，重要的是"知道它多高"。
   * 氧化层 1% 的不确定度被 X 射线的 319 个条纹整个盖掉 ——
   * 这与 `std/calibrated-scale-100` 那条"刻不准没关系，量得准就行"是同一条。
   */
  {
    id: 'plant/xray-interferometer/step-standard',
    name: 'X-Ray Step Height Standard', name_zh: 'X 台阶标准件',
    unit: '件',
    category: 'part',
    props: [
      { param: 'stepHeight', kind: 'range', min: 0, max: 1000, unit: 'nm' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 100, unit: 'nm', dir: 'atMost' },
      { param: 'area', kind: 'range', min: 0, max: 10000, unit: 'mm²', dir: 'atLeast' },
    ],
  },

  /**
   * **X 射线干涉仪（整机）。** 六件零件装成一台，**没有产出路线** ——
   * `composedOf` 是空间组合（可逆），路线是不可逆加工，两样都写就是 `mixed_production`
   * （定义与制造分开）。`plant/ref-flat-interferometer`、`plant/laser-stage`、
   * `plant/phase-shifter`、`plant/euv-coater` 都是同一个形状。
   *
   * 它不进 `performedBy`：那是既有设备的账（本轮新造的机器不许当执行者）。
   * 它在描述里的位置是 `needs` —— `make/xray-step-standard` 必须在这台机器上做。
   *
   * 三个 props 是这份文件的全部结论：
   *
   *   resolution  0.01 nm  10 pm。一个条纹 0.31356 nm，相位读到 11°（0.031 条纹）——
   *                        m = 0.2、N = 10³ 时 σ_φ = 9°，10–50 cps 下 20–100 s 一点
   *   beam        0.1 mm   视在焦斑 = 光束截面 = 测量点的空间分辨。**不是相干**
   *   stability   0.05 K   罩内温度波动（问题五：0.038 K 是差值的需求）
   *
   * ⚠️ 三个数里 `resolution` 是**位移**的分辨率，不是"面形精度"。
   * 它能不能验 0.1 nm 面形，还要看相位噪声与被测件：0.1 nm = 0.319 条纹，
   * 0.025 条纹的相位噪声 → 信噪比 13。**这一条成立，但只在"局部 + 同料"两个前提下**
   * （问题五），跨越 100 mm 的绝对长度不在其中。
   */
  {
    id: 'plant/xray-interferometer',
    name: 'X-Ray Interferometer', name_zh: 'X 射线干涉仪',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'resolution', kind: 'range', min: 0, max: 0.01, unit: 'nm', dir: 'atMost' },
      { param: 'beam', kind: 'range', min: 0, max: 0.1, unit: 'mm' },
      { param: 'stability', kind: 'range', min: 0, max: 0.05, unit: 'K', dir: 'atMost' },
      { param: 'measure/stability', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
      { param: 'measure/voltage', kind: 'range', min: 0, max: 100, unit: 'kV', dir: 'atMost' },
    ],
    composedOf: [
      { item: 'plant/xray-interferometer/tube', qty: q(1) },
      { item: 'plant/xray-interferometer/hv', qty: q(1) },
      { item: 'plant/xray-interferometer/crystal', qty: q(1) },
      { item: 'plant/xray-interferometer/stage', qty: q(1) },
      { item: 'plant/xray-interferometer/detector', qty: q(1) },
      { item: 'plant/xray-interferometer/housing', qty: q(1) },
    ],
  },

  /**
   * X 射线测角仪：2θ 0–160°、0.001° 分辨率、0.005° 准确度、φ50 mm 样品。
   *
   * 摇摆曲线要 0.001° 级；普通光学测角仪（0.01°）差一个量级。
   */
  {
    id: 'std/xray-goniometer',
    name: 'X-Ray Goniometer', name_zh: 'X 射线测角仪',
    unit: '件',
    category: 'part',
    props: [
      { param: 'twoTheta', kind: 'range', min: 0, max: 160, unit: '°' },
      { param: 'resolution', kind: 'range', min: 0.0001, max: 0.01, unit: '°', dir: 'atMost' },
      { param: 'accuracy', kind: 'range', min: 0, max: 0.02, unit: '°', dir: 'atMost' },
      { param: 'sample', kind: 'range', min: 0, max: 50, unit: 'mm' },
    ],
  },

  /**
   * X 射线测角仪整机（量具）。由 `std/xray-goniometer` 装成；
   * 测量能力按 gate 记录的实际窗声明：resolution 0.001–0.005°、
   * accuracy 0.005–0.01°。
   */
  {
    id: 'plant/xray-goniometer',
    name: 'X-Ray Goniometer System', name_zh: 'X 射线测角仪整机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/resolution', kind: 'range', min: 0.001, max: 0.005, unit: '°', dir: 'atMost' },
      { param: 'measure/accuracy', kind: 'range', min: 0.005, max: 0.01, unit: '°', dir: 'atMost' },
    ],
    // 整机与 std/xray-goniometer 由同一装配路线产出，不另声明 composedOf，
    // 避免“整机需要自己路线产出的 std 件”的自环。
  },

  /**
   * 双晶 X 射线衍射仪：Cu Kα（0.154 nm）、0.001°、用于晶体摇摆曲线。
   *
   *   tube 1 + detector 1 + goniometer 1 + monochromator FZ-Si 1 + housing 1
   *   → 衍射仪 1
   *
   * 这是 X 射线晶体“三片 lamellae / tilt ≤2 角秒”的体检设备；没有它，
   * 晶体的 tiltError 只能按线锯/研磨的几何推。
   */
  {
    id: 'plant/xray-diffractometer',
    name: 'Double-Crystal X-Ray Diffractometer', name_zh: '双晶 X 射线衍射仪',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'wavelength', kind: 'range', min: 0.154, max: 0.154, unit: 'nm' },
      { param: 'twoTheta', kind: 'range', min: 0, max: 160, unit: '°' },
      { param: 'resolution', kind: 'range', min: 0.0001, max: 0.01, unit: '°', dir: 'atMost' },
    ],
  },


];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线：六条零件路线 + 两条标准件路线
//
// 六件零件没有一件是一台机床干完的，一律 `steps`。
// 最后两条产出同一个 id（`plant/xray-interferometer/step-standard`），
// 一条 0.1 nm、一条 0.7 nm —— 同一件实物、两档标定，这就是 R8 的"降级与其升级"
// 写成了数据（`props` 的窗口会按要求把不够的那条自动筛掉）。
// ═══════════════════════════════════════════════════════════════════════════

export const XRAY_ROUTES: readonly Route[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 2.1 三晶瓣：一片硅，两条槽，衍射面一刀不碰
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **三晶瓣。** 硅片 1 片 → 槽 2 条 → 三晶瓣 1 件。
     *
     *   硅片 1 片（φ100×0.7，12.8 g）+ 磨料 0.5 + HF 0.1 + 水 5 → 三晶瓣 1 件
     *
     * 四道工序与它们的判据：
     *
     *   定向     硅沿 {111} 解理。掰一块下来，断口上两组解理台阶的夹角认出 (110) 面
     *            （要 (111) 面法向**落在片面内**才对：这样劳厄透射的衍射矢量 g 与
     *            片平行，光束从两个大面进出）。精度 ±1° —— 剩下的角度由本机的
     *            摇摆曲线自己量（降级②）
     *   开槽     0.4 mm 宽、深 15 mm、间距 2 mm、慢走丝 0.5 mm/min。
     *            崩边 < 20 µm（走快了槽口崩，崩口是裂纹源）。槽壁损伤层 20 µm 留在
     *            壁上 —— **离光束 0.25 mm**，不进衍射体积（问题二）
     *   磨槽壁   60 µm（= 线锯损伤 20 µm × 3），`plant/grinder`
     *   抛与 CMP 6 µm + 0.6 µm（研磨损伤 2 µm × 3，再 × 3），`plant/cmp-polisher`
     *
     * **HF 那一项的用途只有一个**：洗掉原生氧化层与金属沾污（30 s）。
     * 它**不**用来腐蚀硅 —— HF 只吃 SiO₂；啃硅要 HF+HNO₃，硝酸不在料表
     * （这就是降级⑦里"不能把晶瓣减薄到 0.35 mm"的原因，也是降级①里
     * "做不出腐蚀坑"的原因）。
     *
     * 装架：三点自由支撑（不粘接）。**粘接的胶层收缩 10⁻³ 就是 0.7 µm 的位移**，
     * 比要测的 0.1 nm 大 7000 倍 —— 所以只能靠重力与三个球窝（`null-test.ts` 2.1 同一条）。
     */
    id: 'make/xray-interferometer-crystal',
    name: 'X-Ray Three-Crystal Element Manufacturing', name_zh: 'X 三晶瓣制造',
    rate: { hours: q(16) },
    produces: [
      {
        item: 'plant/xray-interferometer/crystal',
        qty: q(1),
        gives: [
          { param: 'thickness', kind: 'range', min: 0.7, max: 0.7 },
          { param: 'lamellae', kind: 'range', min: 3, dir: 'atLeast' },
          { param: 'tiltError', kind: 'range', max: 2, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/fz-silicon', qty: q(1) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    steps: [
      { note_zh: '沿 {111} 解理定晶向（断口两组台阶夹角认出 (110) 面，±1°）', performedBy: 'plant/robot' },
      {
        note_zh: '线锯开两条槽（0.4 mm 宽、深 15 mm、间距 2 mm）：慢走丝 0.5 mm/min，崩边 < 20 µm',
        performedBy: 'plant/wire-saw',
      },
      { note_zh: '磨槽壁 60 µm（线锯 20 µm 损伤层 × 3；衍射面一刀不碰）', performedBy: 'plant/grinder' },
      { note_zh: '抛槽壁 6 µm + CMP 0.6 µm（研磨 2 µm 损伤 × 3，再 × 3）', performedBy: 'plant/cmp-polisher' },
      {
        note_zh: 'HF 30 s 洗原生氧化层与沾污、水冲（HF 不吃硅，只吃 SiO₂）',
        performedBy: 'plant/wet-bench',
      },
      {
        note_zh: '三点自由支撑装架（不粘接：胶层收缩 10⁻³ = 0.7 µm，是 0.1 nm 的 7000 倍）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '体检：拿 (111) 峰扫摇摆曲线，峰位定晶向、峰形定 tiltError，判 ≤2 角秒（降级①的替代体检）',
        performedBy: 'plant/xray-diffractometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.2 X 光管：铜靶、钨丝、铝窗、玻璃筒
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **X 光管。** 铜 4 + 钨粉 0.5 + 铝 0.1 + 玻璃 0.2 + 铸铁 12 + 水 50 → 管体 1 件。
     *
     * 十道工序，每一道都对着文件头问题三的一个数：
     *
     *   铸法兰   上下两只铸铁法兰（HT200，1350–1450）—— 玻璃筒靠它们压紧
     *   车铜靶   6° 斜面，靶面 Ra 0.4。**焦斑就印在这一面上**：
     *            视在 0.1 mm 靠 6° 取角把 0.955 mm 的线焦压回去，面积 0.0955 mm²
     *   钨丝     压坯 → 预烧 1200 → 烧结 1800（密度 95%）→ 旋锻 → 热拉到 φ0.25
     *            → 绕 12 匝螺旋（节距 0.4）→ 氢退火 1500 定型。
     *            与 `make/eb-cathode`（`e-beam-column.ts:743`）同一手，1 kg 粉出 6 根
     *   装管     玻璃筒两端铜垫 + 四螺栓压紧（可拆卸；玻璃受 0.1 MPa 压应力）
     *   排气     抽到 1e-4 Pa、350 °C 烘烤 12 h（12 h 是"管壳里那层水膜"的时间常数）
     *   老炼     灯丝 6 V/4 A，高压 10→30 kV 逐步升，量发射电流到 2 mA
     *
     * 2 mA 从哪来：钨的 Richardson 常数 A = 60 A/(cm²·K²)、φ = 4.5 eV（φ/k = 5.22×10⁴ K）。
     * 丝是 φ0.25 × 12 匝绕在 φ1.2 芯棒上：展开 12×π×1.2 = 45 mm，表面积 0.355 cm²。
     *
     *   J = 60·T²·exp(−5.22×10⁴/T)
     *   2000 K → 1.1×10⁻³ A/cm² → **0.39 mA**（不够）
     *   2150 K → 7.8×10⁻³ A/cm² → **2.8 mA**（够，取这一档）
     *
     * 100 K 就是 7 倍 —— 这就是"灯丝电流要稳"的全部理由（管流随灯丝电压指数变）。
     * 寿命：2700 K 下钨的蒸发 1 nm/h（`e-beam-column.ts:253`），2150 K 下 ~0.005 nm/h，
     * 丝径 250 µm 蒸发掉 10 % 要 5000 h。
     */
    id: 'make/xray-interferometer-tube',
    name: 'X-Ray Tube Body Manufacturing', name_zh: 'X 光管管体制造',
    rate: { hours: q(40) },
    produces: [
      {
        item: 'plant/xray-interferometer/tube',
        qty: q(1),
        gives: [
          { param: 'focalSpot', kind: 'range', max: 0.1, dir: 'atMost' },
          { param: 'power', kind: 'range', min: 60, dir: 'atLeast' },
          { param: 'takeoff', kind: 'range', min: 6, max: 6 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(4) }] },
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/iron-ht200', qty: q(12) }] },
      { anyOf: [{ item: 'mat/water', qty: q(50) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '浇上下法兰（HT200，1 350–1 450；水冷腔与靶座同炉浇，配合面留 2 mm 余量）',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1350, max: 1450 }],
      },
      { note_zh: '车铜靶 6° 斜面（靶面 Ra 0.4）+ 车铬铜水套与法兰止口', performedBy: 'lathe' },
      { note_zh: '压 φ12 钨棒（3 t，2 % 石蜡粘结）', performedBy: 'plant/press' },
      {
        note_zh: '预烧 1200 排蜡 → 烧结 1800（密度 95 %，H₂ 保护）—— 氧分压测不了，见降级⑧',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 1750, max: 1800 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      { note_zh: '旋锻 φ12 → φ4（1 200–1 400，每道减面 15 %）', performedBy: 'plant/forge' },
      { note_zh: '热拉到 φ0.25（12 道，800–1000，石墨乳润滑）', performedBy: 'plant/rolling-mill' },
      { note_zh: '绕 12 匝螺旋（节距 0.4，芯棒 φ1.2）', performedBy: 'plant/winder' },
      {
        note_zh: '氢中退火 1500 定型（再结晶，不然通电会下垂）',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 1400, max: 1500 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '装管：玻璃筒 + 铜垫 + 四螺栓压紧，装 0.05 mm 铝窗（φ5 孔，膜应力 2.5 MPa）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '排气：抽到 1e-4 Pa、350 °C 烘烤 12 h 后封离',
        performedBy: 'plant/euv-vacuum',
        under: [{ param: 'pressure', min: 1e-4, max: 1e-2 }],
      },
      {
        note_zh: '老炼：灯丝升到 6 V/4 A，高压 10→30 kV 逐步，量发射到 2 mA、焦斑用针孔照相',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.3 高压电源
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **高压电源。** 整流堆 12 + 薄膜电容 60 + 铜线 3 + 钢板 8 + 玻璃 0.5 → 电源 1 件。
     *
     * 四个数：
     *
     *   36 kV   12 只 3 kV 串（额定 30 kV 留 20 %；3 kV×10 是**额定**，不是余量 ——
     *           `stabilized-laser.ts:1342` 算过同一笔账）
     *   0.17 µF 60 只 10 µF 串（耐压 630 V × 60 = 37.8 kV）
     *   0.049 % 纹波 = I/(2f·C·V) = 2 mA/(2×400×0.17 µF×30 kV)
     *   2 mA    管流；配套的灯丝电源 6 V/4 A 浮在 −30 kV 上（隔离变压器同油箱）
     *
     * 耐压试验用 `plant/hv-test-bench`（40 kV/1 min）—— 它与 `unblock-electrolyzer-rectifier.ts`
     * 那条 3 kV 堆的试验是同一台设备、同一个判据（1.3 倍额定）。
     */
    id: 'make/xray-interferometer-hv',
    name: 'X-Ray High-Voltage Power Supply Manufacturing', name_zh: 'X 高压电源制造',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'plant/xray-interferometer/hv',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 30, dir: 'atLeast', record: 'mat/xray-hv-record' },
          { param: 'current', kind: 'range', min: 2, dir: 'atLeast' },
          { param: 'ripple', kind: 'range', max: 0.5, dir: 'atMost', record: 'mat/xray-hv-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/hv-rectifier-general', qty: q(12) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(60) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(3) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(8) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '绕 400 Hz 高压变压器（次级 30 kV，环氧浸渍）与灯丝隔离变压器', performedBy: 'plant/winder' },
      { note_zh: '12 只 3 kV 整流堆串成 36 kV 桥（每只匀压电阻分压）', performedBy: 'plant/robot' },
      { note_zh: '60 只薄膜电容串成电容柱（0.17 µF / 37.8 kV），装均压环', performedBy: 'plant/robot' },
      { note_zh: '装油箱、玻璃高压套管与接地栅（非匹配封接一律不用，见管体那条）', performedBy: 'plant/robot' },
      {
        note_zh: '耐压 40 kV/1 min、纹波实测到 0.05 %（判据 0.5 %）、30 kV 下漏电流',
        performedBy: 'plant/hv-test-bench',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.4 微动台
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **微动台。** 石英 0.5 + 45 钢 2 + HT250 20 + 硅片 1 片 + 铜线 0.5 + 铝 0.01
     * → 微动台 1 件。
     *
     * 石英堆的数（`phase-shifter.ts` 同一套）：
     *
     *   d₁₁ = 2.3 pm/V（X 切，厚度伸缩）→ 32 片 = 73.6 pm/V → 4 只并联 = 294.4 pm/V
     *   1000 V 行程 = 294 nm；0.1 V 一档 = 29 pm
     *   迟滞 < 0.01 %（石英无畴壁）—— 但它**不保证线性**，所以标定要逐段做
     *
     * 为什么微动台的基座要从**另一片硅**上切：问题五的①。
     * 这是本文件里唯一"多花一片硅"的地方，也是 4×10⁻⁴ K 那个数被绕掉的关键 ——
     * 用铸铁基座（α = 11×10⁻⁶，4 倍于硅）时 100 mm 上 0.5 K 给 130 nm。
     *
     * 标定：**先光学、后晶格**。装台时用 `plant/ref-flat-interferometer` 的
     * 八帧移相读到 0.47 nm（`plant/phase-shifter` 给的读数）
     * —— 那一步只能把 294 nm 的行程标到 0.1 %（0.3 nm）；
     * 等整机装好，台阶标准件那一条路线会把它重标到 10 pm（这就是这台机器的用处）。
     */
    id: 'make/xray-interferometer-stage',
    name: 'X-Ray Fine Adjustment Stage Manufacturing', name_zh: 'X 微动台制造',
    rate: { hours: q(30) },
    produces: [
      {
        item: 'plant/xray-interferometer/stage',
        qty: q(1),
        gives: [
          { param: 'coarseStroke', kind: 'range', min: 10, dir: 'atLeast' },
          { param: 'fineStroke', kind: 'range', min: 294, dir: 'atLeast' },
          { param: 'resolution', kind: 'range', max: 0.029, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(2) }] },
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(20) }] },
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room', 'plant/ref-flat-interferometer'],
    steps: [
      { note_zh: '切 0.5 mm 石英片 32 片 ×4 组（X 切，切向由解理面认）', performedBy: 'plant/wire-saw' },
      { note_zh: '研平两面、平行度 1 µm、厚差 < 1 %（d₁₁ 与厚度无关，但电容与刚度有关）', performedBy: 'plant/grinder' },
      { note_zh: '蒸铝电极 0.1 µm（两面）', performedBy: 'plant/evaporator' },
      { note_zh: '车两根钢挠性铰链（φ8、壁 0.3，行程内应力 < 200 MPa）', performedBy: 'lathe' },
      {
        note_zh: '叠堆 4 组、装硅基座与球窝（同料同胀：基座与晶瓣是同一批硅片）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '光学标定 294 nm 行程：八帧移相读到 0.47 nm，逐段记 nm/V（0.1 %）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      { note_zh: '装螺杆粗行程 10 mm（1 µm 精度，它只负责"到位"）', performedBy: 'plant/milling-machine' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.5 探测器
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **探测器。** 荧光粉 0.01 + 光电二极管 2 + 铝 0.02 + 玻璃 0.1 + 铜线 0.2
     * + 计数片 2 + 运放 1 → 探测器 1 件。
     *
     * 抄 `plant/se-detector`（`se-detector.ts` 第二节），因为它已经是"荧光粉 → 光 → 电"
     * 这一整条链在本层唯一通的路：
     *
     *   8.05 keV 光子 → ZnS:Ag 8 µm 层（吸 13 %，能量效率 15–20 %）→ 450 nm 蓝光 ~400 个
     *   → 剥窗光电二极管（HF 30 s 去死层，450 nm 响应 0.25 A/W）
     *   → 运放积分 → 甄别 → 计数器
     *
     * 效率 25 % 是怎么来的：13 %（吸收）× 1.4（背面铝反射）× 0.65（光导收集）
     * × 0.9（量子效率）。**它比电离室差，但电离室要 30 atm 氙，本层没有氙。**
     *
     * 为什么荧光屏要 8 µm 而不是更厚：ZnS 的 1/μ 是 56 µm，加到 20 µm 只把吸收从
     * 13 % 提到 30 %，但屏的自吸收与光导收集一起掉（`se-detector.ts` 第三节同一条），
     * 净收益不到 1.5 倍 —— 而 8 µm 是沉降法最好控制的那一档。
     */
    id: 'make/xray-interferometer-detector',
    name: 'X-Ray Detector Manufacturing', name_zh: 'X 探测器制造',
    rate: { hours: q(20) },
    produces: [
      {
        item: 'plant/xray-interferometer/detector',
        qty: q(1),
        gives: [
          { param: 'efficiency', kind: 'range', min: 25, dir: 'atLeast' },
          { param: 'countRate', kind: 'range', min: 1000, dir: 'atLeast' },
          { param: 'darkCount', kind: 'range', max: 1, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/zns-ag-phosphor', qty: q(1, 100) }] },
      { anyOf: [{ item: 'std/photodiode-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '沉降 ZnS:Ag 8 µm 到 φ10 玻璃片上（硅酸钾粘结，沉降 30 min）', performedBy: 'plant/robot' },
      { note_zh: '蒸 40 nm 铝化层（挡光、导电、把背向光反射回来）', performedBy: 'plant/evaporator' },
      { note_zh: '两只光电二极管剥窗（HF 30 s，死层 1 µm → 20 nm）、背面蒸铝、焊引线', performedBy: 'plant/robot' },
      { note_zh: '装光导与遮光壳、装前置放大与甄别（运放 + 计数片）', performedBy: 'plant/robot' },
      {
        note_zh: '量效率（管子的 Kα + 已知铝衰减片，没有放射性同位素源）与暗计数（< 1 cps）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.6 恒温罩
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **恒温罩。** 铜 60 + 矿棉 3 + 钢板 20 + 氮 1 + 玻璃 0.2 + 铝 0.2 + HT250 40
     * → 恒温罩 1 件。
     *
     * 热账（问题五的③）：
     *
     *   铜热沉 60 kg，比热 385 J/(kg·K) → C = 23 kJ/K
     *   三层矿棉 + 钢罩 + 自然对流 → 漏热 G ≈ 0.5 W/K（矿棉 0.04 W/(m·K)，
     *   1.2 m² 罩、50 mm 厚 → 0.96 W/K；三层折半，取 0.5）
     *   τ = C/G = 23×10³/0.5 = **4.6×10⁴ s = 12.8 h**
     *   恒温间 ±0.5 K、周期 8 h（ωτ = 2π/8 h × 12.8 h = 10.1）→ 罩内 **0.05 K**
     *
     * 这是"用热容换稳定度"，不是"控温"。它换来的是**漂移慢**（τ 大，相位测量的
     * 60 s 里温度几乎不动），而绝对值仍然跟着恒温间走 —— 这正是问题五的结论：
     * 能绕"测量"，绕不过"绝对"。
     *
     * 1 atm 氮在罩里还有一个副作用：它把 X 光管的热与晶体的热隔开（气体导热 0.026 W/(m·K)，
     * 但**对流**会把管壳的热带到晶体上）—— 所以管与晶体之间有一块铜隔板（钢罩的一部分）。
     */
    id: 'make/xray-interferometer-housing',
    name: 'X-Ray Temperature-Controlled Enclosure Manufacturing', name_zh: 'X 恒温罩制造',
    rate: { hours: q(36) },
    produces: [
      {
        item: 'plant/xray-interferometer/housing',
        qty: q(1),
        gives: [
          { param: 'temperatureStability', kind: 'range', max: 0.05, dir: 'atMost' },
          { param: 'drift', kind: 'range', max: 0.1, dir: 'atMost' },
          { param: 'thermalTimeConstant', kind: 'range', min: 12.8, dir: 'atLeast' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(60) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(3) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(20) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(40) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '浇铸铁底板（HT250，1 350–1 450）并人工时效，垫三层矿棉隔振',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1350, max: 1450 }],
      },
      { note_zh: '车铜热沉筒 60 kg（φ400×250，壁 40；内腔车到 Ra 1.6）', performedBy: 'lathe' },
      { note_zh: '卷焊三层钢罩、填矿棉（层间留 10 mm，不压实）', performedBy: 'plant/sheet-shop' },
      { note_zh: '装氮气路、压力平衡窗与管/晶体之间的铜隔板', performedBy: 'plant/robot' },
      {
        note_zh: '测时间常数：加热一步 1 K 看回零（判据 τ ≥ 12.8 h，实测要 68 h 走完 5τ）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.7 台阶标准件：0.1 nm（晶格标定）与 0.7 nm（光学标定）两条
  //
  // ⚠️ 两条路线产出**同一个 id**（OR），差别只在 `uncertainty` 的窗口。
  // 这就是本文件的结论，也是"降级与其升级"写成了数据：
  // 要求 0.1 nm 的地方，0.7 nm 那条会被 `dir: 'atMost'` 自动筛掉。
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **台阶标准件（晶格标定版）。100 nm ± 0.1 nm。**
     *
     *   硅片 1 片 + 氧 2 + 光刻胶 0.01 + HF 0.05 + 水 5 → 标准件 1 件
     *
     * 台阶怎么长出来的：干氧 1100 °C 长 0.227 µm 氧化层。**热氧化有 0.44 的厚度比**
     * （硅被吃掉 0.44 nm 换 1 nm 氧化层）—— 所以剥掉氧化层之后硅面上留下的台阶
     * 是 0.44 × 227 = **100 nm**，不是 227 nm。氧化层越厚比越接近 0.45，
     * 用线性 0.44 在 227 nm 上的误差 < 1 %。
     *
     * 台阶"长不准"没关系（±1 % = ±1 nm），**关键是把 1 nm 的不确定换成 0.1 nm 的确定**：
     *
     *   100 nm / 0.31356 nm = **318.9 个条纹**
     *   微动台推 100 nm（340 V），计数器数整条纹（整数不丢，±1 = ±0.31 nm）
     *   两端各插值到 0.03 个条纹（σ_φ = 11° = 9.4 pm，m = 0.2、N = 10³ 时）
     *   → 合成 **0.1 nm**（√(0.31² + 0.0094²) 不是这么加的：
     *     整条纹数由两端相位的连续性保证，真正的误差是两端各 0.03 条纹 → 0.0094 nm，
     *     再叠 0.09 nm 的行程非线性和 0.03 nm 的样品放置 —— 交付写 0.1 nm）
     *
     * "到面"怎么判：台阶件装在微动台上，用 `plant/ref-flat-interferometer` 的猫眼
     * 看焦点的回光（台阶上下两面各判一次）。**X 射线只负责量"台走了多少"，
     * 不负责看台阶** —— 8 keV 的光子是透射的，表面的高低它看不见（δ = 7.6×10⁻⁶，
     * 100 nm 的厚度差只给 0.005 个条纹的相位，淹没在噪声里）。
     * 这一句是本路线最容易被读错的地方。
     */
    id: 'make/xray-step-standard',
    name: 'X-Ray Step Height Standard Manufacturing', name_zh: 'X 台阶标准件制造',
    rate: { hours: q(30) },
    produces: [
      {
        item: 'plant/xray-interferometer/step-standard',
        qty: q(1),
        gives: [
          { param: 'stepHeight', kind: 'range', min: 100, max: 100 },
          { param: 'uncertainty', kind: 'range', max: 0.1, dir: 'atMost' },
          { param: 'area', kind: 'range', min: 100, dir: 'atLeast' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(2) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/xray-interferometer', 'plant/ref-flat-interferometer', 'plant/metrology-room'],
    steps: [
      {
        note_zh: '干氧 1100 °C 长 0.227 µm 氧化层（判据：比色法看干涉色，±5 % 就够）',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 1050, max: 1100 }],
      },
      { note_zh: '甩胶 1 µm、贴掩模、曝光（10×10 mm 窗口）', performedBy: 'plant/mask-aligner' },
      {
        note_zh: 'HF 剥氧化层（只吃 SiO₂、不吃硅 —— 所以台阶是 0.44 倍而不是 1 倍），去胶',
        performedBy: 'plant/wet-bench',
      },
      {
        note_zh: '装台：台阶件三点支撑在硅基座上（同料同胀），扫 100 nm = 340 V',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '猫眼判"到面"（上/下各一次），X 射线数 319 个条纹、两端各插到 0.03 条纹',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '复检：同一台阶在 3 个位置各量一遍（判据 3 次差 < 0.05 nm），写证书',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **台阶标准件（光学标定版）。100 nm ± 0.7 nm。**
     *
     *   硅片 1 片 + 氧 2 + 光刻胶 0.01 + HF 0.05 + 水 5 → 标准件 1 件
     *
     * 材料、台阶、工序都与上一条**一模一样**，只有最后一步的"量"换了：
     *
     *   1 nm   氧化时间推算（0.44 × 227，±1 %）—— 这是没量过的样子
     *   0.7 nm 光学八帧移相：读数 0.47 nm（`plant/phase-shifter`）与
     *          参考面 0.52 nm（`plant/ref-flat-interferometer`）的 RSS
     *          = √(0.47² + 0.52²) = **0.70 nm**
     *   0.1 nm 晶格（上一条）
     *
     * 为什么留着这一条：它**就是本层原来的样子**（`null-test.ts` 问题 4 的 0.52 nm
     * 那半张账）。两条路线产出同一个 id、差 7 倍 —— 要求 0.1 nm 的地方，
     * 这一条被 `uncertainty` 的 `dir: 'atMost'` 自动筛掉，不需要谁去记得。
     *
     * **光学这一档为什么到不了 0.1 nm**：不是读数不够（八帧移相读到 0.47 nm），
     * 是**参考面自己只有 0.52 nm**。这正是文件头那句"尺子本身是光学做的"的出处。
     */
    id: 'make/xray-step-standard-optical',
    name: 'X-Ray Step Height Standard Manufacturing', name_zh: 'X 台阶标准件制造',
    rate: { hours: q(20) },
    produces: [
      {
        item: 'plant/xray-interferometer/step-standard',
        qty: q(1),
        gives: [
          { param: 'stepHeight', kind: 'range', min: 95, max: 105 },
          { param: 'uncertainty', kind: 'range', max: 0.7, dir: 'atMost' },
          { param: 'area', kind: 'range', min: 100, dir: 'atLeast' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(2) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/ref-flat-interferometer', 'plant/phase-shifter', 'plant/metrology-room'],
    steps: [
      {
        note_zh: '干氧 1100 °C 长 0.227 µm 氧化层（同上）',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 1050, max: 1100 }],
      },
      { note_zh: '甩胶 1 µm、贴掩模、曝光（10×10 mm 窗口，同上）', performedBy: 'plant/mask-aligner' },
      { note_zh: 'HF 剥氧化层、去胶（同上）', performedBy: 'plant/wet-bench' },
      {
        note_zh: '光学八帧移相量台阶：读数 0.47 nm + 参考面 0.52 nm → RSS 0.70 nm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '复检 3 点（判据 3 次差 < 0.2 nm），写证书 —— 这一档就是 null-test 原来的地板',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **X 射线测角仪：编码器 + 0.5 nm 台 + 钢座。**
     *
     *   编码器 1 + 台 1 + 钢 5 + 控制板 1 → 测角仪 1
     *
     * 2θ 0–160°、0.001–0.005° 分辨率、0.005–0.01° 准确度是 design；150 h。
     */
    id: 'make/xray-goniometer',
    name: 'X-Ray Goniometer Manufacturing', name_zh: 'X 射线测角仪制造',
    produces: [
      {
        item: 'std/xray-goniometer',
        qty: q(1),
        gives: [
          { param: 'twoTheta', kind: 'range', min: 0, max: 160 },
          { param: 'resolution', kind: 'range', min: 0.001, max: 0.005, record: 'mat/gate-xray-goniometer-record' },
          { param: 'accuracy', kind: 'range', min: 0.005, max: 0.01, record: 'mat/gate-xray-goniometer-record' },
          { param: 'sample', kind: 'range', min: 0, max: 50 },
        ],
      },
      {
        item: 'plant/xray-goniometer',
        qty: q(1),
        gives: [
          { param: 'measure/resolution', kind: 'range', min: 0.001, max: 0.005 },
          { param: 'measure/accuracy', kind: 'range', min: 0.005, max: 0.01 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/rotary-encoder', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-stepper-hina/stage', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(5) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(150) },
    steps: [
      {
        note_zh: '装编码器/0.5 nm 台/钢座；2θ 0–160°',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '自准直仪标定 0.001–0.005°；写验收（design）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '编码器 1 + 台 1 + 钢 5 + 控制板 1 → 测角仪 1；余是装调/标定损耗。',
  },
  {
    /**
     * **双晶 X 射线衍射仪：tube + detector + 测角仪 + 单色器 FZ-Si。**
     *
     *   tube 1 + detector 1 + 测角仪 1 + FZ-Si 1 + housing 1 + 控制板 1
     *   → 衍射仪 1
     *
     * Cu Kα 0.154 nm、0.001–0.002° 是 design；200 h 估算。
     */
    id: 'make/xray-diffractometer',
    name: 'Double-Crystal X-Ray Diffractometer Manufacturing', name_zh: '双晶 X 射线衍射仪制造',
    produces: [
      {
        item: 'plant/xray-diffractometer',
        qty: q(1),
        gives: [
          { param: 'wavelength', kind: 'range', min: 0.154, max: 0.154 },
          { param: 'twoTheta', kind: 'range', min: 0, max: 160 },
          { param: 'resolution', kind: 'range', min: 0.001, max: 0.002, record: 'mat/xray-diffractometer-measure-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/xray-interferometer/tube', qty: q(1) }] },
      { anyOf: [{ item: 'plant/xray-interferometer/detector', qty: q(1) }] },
      { anyOf: [{ item: 'std/xray-goniometer', qty: q(1) }] },
      { anyOf: [{ item: 'std/fz-silicon', qty: q(1) }] },
      { anyOf: [{ item: 'plant/xray-interferometer/housing', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(200) },
    steps: [
      {
        note_zh: '装 tube/detector/测角仪/单色器 FZ-Si；Cu Kα 光路',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '对准/狭缝；0.001–0.002° 分辨率，摇摆曲线',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '测标准 Si 粉/单晶；写验收（分辨率是 design）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: 'tube 1 + detector 1 + 测角仪 1 + FZ-Si 1 + housing 1 + 控制板 1 → 衍射仪 1；余是装调损耗。',
  },




];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...XRAY_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/xray-interferometer',
    name: 'X-Ray Interferometer Assembly', name_zh: 'X 射线干涉仪装配',
    produces: [{
      item: 'plant/xray-interferometer',
      qty: q(1),
      gives: [
      { param: 'resolution', kind: 'range', min: 0, max: 0.01, dir: 'atMost', record: 'mat/xray-cal-record' },
      { param: 'beam', kind: 'range', min: 0, max: 0.1, record: 'mat/xray-cal-record' },
      { param: 'stability', kind: 'range', min: 0, max: 0.05, dir: 'atMost', record: 'mat/xray-cal-record' },
      { param: 'measure/stability', kind: 'range', min: 0, max: 5 },
      { param: 'measure/voltage', kind: 'range', min: 0, max: 100 },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...XRAY_ROUTES, ...ASSEMBLY_ROUTES];
