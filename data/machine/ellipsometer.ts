/**
 * 椭偏仪：把「膜厚测不出」这一族缺口，一次解掉。
 *
 * 这一份造的是**量具**，不是工艺。它自己的价值只有一句：**它是本层唯一能同时给出
 * 厚度、折射率、消光系数三件的量具**，0.01 nm 级。而它的用处写在下面六处已经
 * 写好的数据里 —— 那六处现在都写着同一句话。
 *
 * ┌────────────────────┬────────────────────────────────────────┬─────────────────────────────────────┐
 * │ 文件               │ 现在那句话                             │ 这台机器给什么                      │
 * ├────────────────────┼────────────────────────────────────────┼─────────────────────────────────────┤
 * │ gate-stack.ts      │ 1.5 nm 栅氧只剩「温度×时间记账 ±10 %」 │ 0.005–0.02 nm（±0.3–1 %）           │
 * │ cmp-integration.ts │ FSG 的 F 含量与 k 值测不出             │ n ±0.0003、k ±3×10⁻⁵ ⇒ F ±0.08 at % │
 * │ ald.ts             │ 台阶覆盖与厚度「只能算不能量」         │ 厚度 0.005 nm/点                    │
 * │ implant.ts         │ 结深、注入剂量测不出（p⁺ 只交区间）    │ 结深（非晶层厚度）；剂量仍测不出    │
 * │ hafnium.ts         │ HfO₂ 纯度 3N5 缺膜厚/成分反馈          │ 厚度与 n；k 与金属杂质仍没有        │
 * │ rie.ts             │ 刻蚀深度只靠 488 nm 干涉（±5 nm）      │ 陪片差值法 ±0.01 nm                 │
 * └────────────────────┴────────────────────────────────────────┴─────────────────────────────────────┘
 *
 * ⚠️ 上表最后两行**不是同一句"解掉了"**：椭偏仪测的是**膜的厚度与光学常数**，
 * 不是杂质浓度、也不是剂量。所以第 4、5 行各只解掉一半，两处都在 §七 的降级表里
 * 写清了剩下那一半卡在哪。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、问题一：精度能到多少？（答案：δΨ/δΔ ≈ 0.06°，δd = 0.02 nm @70° / 0.007 nm @75°）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * **先立尺**：整台机器只做一件事 —— 让偏振光打到膜上、反射之后
 * 量它的**振幅比**与**相位差**：
 *
 *   tan Ψ = |r_p / r_s|          Δ = arg(r_p) − arg(r_s)          ρ = tanΨ·e^{iΔ}
 *
 * 三件输入全是本层已有的，一件新器件都不用发明：
 *
 *   光源   488.0 nm、相干 ≥1 m、50 mW（`plant/stabilized-laser`）
 *   起偏   布儒斯特片堆 12 片、24 面、消光 **18 dB**（`plant/laser-stage/polarizer`
 *          同一条手艺，算式在 `laser-stage.ts` 第一节②：p 过 81 %、s 过 9.9 %）
 *   补偿   λ/4 波片 **13.71 µm** 的 X 切石英（= 209 kHz 的振子片子，见零件 `compensator`）
 *
 * ⚠️ **"18 dB"这个数的口径要写清**：它是 `laser-stage.ts` 的口径（p 过 81 %、s 过 9.9 %，
 * 比 8.3:1，按 20·lg 记作 18 dB）。**按 10·lg（强度比）记，同一个片堆是 9.2 dB。**
 * 本文件沿用 18 dB 这个说法，是为了不与 `laser-stage.ts` 打架；而下面每处用到它时，
 * 用的是**强度泄漏 1.6 %**（= 10^(−1.8)）。若按 20·lg 读成 8.3:1，泄漏是 12 %（幅度 35 %）：
 * 消光漂移那一项从 0.009° 涨到 0.07°，1 s 合成 0.09°、δd = **0.029 nm** —— 仍在 0.03 nm 档，
 * **不改变本文的结论**，只把"0.01 nm"那一档改成"0.03 nm"。
 *
 * ── ① 从「强度噪声」到「Ψ/Δ 噪声」的传导 ──────────────────────────────────
 *
 * 固定起偏 45°、检偏以 2ω 转，光电管上是一个三项式：
 *
 *   I(A) = I₀ (1 + α cos 2A + β sin 2A)
 *   α = −cos 2Ψ            β = sin 2Ψ · cos Δ
 *
 * 两个系数都是从波形里**闭式**解出来的（§四），所以噪声直接进 α、β：
 *
 *   δα = δβ = √2 × (δI/I)
 *
 *   δΨ       = δα / (2 sin 2Ψ)
 *   δ(cos Δ) = δβ / sin 2Ψ      ⇒   δΔ = δ(cos Δ) / |sin Δ|
 *
 * ⚠️ **最后那一项是整台机器的形状来源**：Δ 贴着 180°（裸 Si 在 70° 上是 177.6°）时
 * sin Δ 只有 0.042，同样 0.1 % 的噪声折成 **4.2°** 的 Δ 误差 —— 高得没法用。
 * **所以补偿器不是"可选项"**：λ/4 把工作点搬到 Δ ≈ 90°（sin Δ = 1），灵敏度的分母
 * 从 0.042（裸片）/0.124（1.5 nm 膜）变成 1，**同一份噪声换来的 Δ 精度好 8–25 倍**。
 * 没有它，1 s 的 δΔ 是 0.45°，厚度只有 **0.14 nm** 级；有它才是 0.06°/0.019 nm。
 *
 * 预算表（1.5 nm SiO₂/Si、70°、488 nm ⇒ Ψ = 13.78°、sin 2Ψ = 0.463）：
 *
 * ┌──────────────────────────────────┬────────────┬──────────┬───────────────┐
 * │ 项                               │ 量         │ 折 δΔ    │ 折 δd（70°）  │
 * ├──────────────────────────────────┼────────────┼──────────┼───────────────┤
 * │ 相敏检波强度噪声（0.1 s 时间常数）│ 0.1 %      │ 0.17°    │ 0.054 nm      │
 * │ 1 s 平均（10 帧）                │ 0.032 %    │ 0.054°   │ 0.017 nm      │
 * │ 10 s 平均（100 帧）              │ 0.010 %    │ 0.017°   │ 0.005 nm      │
 * │ 消光的漂移（18 dB 的 1 %）        │ 1.6×10⁻⁴   │ 0.009°   │ 0.003 nm      │
 * │ 补偿器相位漂（±1.5° 的 1 %）      │ 0.015°     │ 0.0003°  │ ≈0            │
 * │ 角度：时基 10⁻⁵ + 每转标记 0.02°  │ —          │ 0.02°    │ 0.006 nm      │
 * │ **合成（1 s / 70°）**            │            │ **0.06°**│ **0.019 nm**  │
 * │ **合成（1 s / 75°）**            │            │ **0.06°**│ **0.007 nm**  │
 * │ **合成（10 s / 70°）**           │            │ **0.03°**│ **0.010 nm**  │
 * └──────────────────────────────────┴────────────┴──────────┴───────────────┘
 *
 * 0.1 % 那一格有出处：`plant/ir-endpoint/preamp` 交付的是 **≤1 %**（受灯老化与等离子体
 * 基线限制，`flow-and-rf.ts` 降级④）。本机不做灯，它做的是三件事把 1 % 压到 0.1 %：
 * ① 光源换成激光（稳亮 0.5 %，不是灯的 2–5 %）；② **双光路**（第二只光电管看分束片，
 * 源的漂移被除掉 —— 与 `plant/laser-stage/receiver` 的正交检波同一个手法）；
 * ③ 斩波 1 kHz + 相敏检波的 0.1 s 时间常数（动圈当乘法器，`flow-and-rf.ts:2071` 的先例）。
 *
 * ── ② 灵敏度：dΔ/dd 有多大（这是"0.01 nm"那个数的分母）───────────────────
 *
 * 1.5 nm SiO₂（n = 1.462）在 Si（n = 4.35、k = 0.09）上，488 nm：
 *
 *   入射角   Ψ        Δ          dΨ/dd        dΔ/dd        备注
 *   60°      25.63°   −177.04°   +0.008 °/nm  +1.31 °/nm   太平
 *   70°      13.78°   −172.89°   +0.049 °/nm  +3.14 °/nm   主工作点
 *   75°       4.95°   −158.23°   +0.230 °/nm  +9.13 °/nm   最灵敏（Ψ 已小到 5°）
 *   78°                              +0.54      −11.6        过伪布儒斯特，符号翻
 *
 * 裸片到 1.5 nm：**Δ 一共走 4.72°**（−177.61 → −172.89），Ψ 只走 0.055°。
 *
 * ⇒ **δd = δΔ / (dΔ/dd)**：
 *
 *   70°、1 s：0.06 / 3.14 = **0.019 nm**
 *   75°、1 s：0.06 / 9.13 = **0.007 nm**
 *   70°、10 s：0.03 / 3.14 = **0.010 nm**
 *
 * **结论（问题一）**：综合 Ψ/Δ 精度 **0.06°（1 s）/ 0.03°（10 s）**；
 * 对 1.5 nm SiO₂ 的厚度灵敏度 dΔ/dd = **3.14 °/nm @70°**（9.13 @75°）；
 * 厚度精度 **0.01 nm 是拿得到的**（比 1.5 nm 的 1 % 还小 30 %）。
 * 对照 `gate-stack.ts` 现在的 ±10 %（= ±0.15 nm）：**好 8–30 倍**（按 0.019 / 0.005 nm）。
 *
 * ⚠️ 但这个 0.01 nm 有一个前提，而它比精度本身更要紧 —— 见问题二。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、问题二：单波长够不够？（答案：方程够，条件数不够 —— 差 200 倍）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 单波长单角度给两个读数（Ψ、Δ），未知两个（d、n）—— **个数上是够的**。
 * 但把 1.5 nm 的 SiO₂ 在 70° 上的雅可比写出来，就看见问题：
 *
 *   ∂Ψ/∂d = 0.055 °/nm    ∂Ψ/∂n = 0.062
 *   ∂Δ/∂d = 3.13 °/nm     ∂Δ/∂n = 4.84
 *   det = 0.072            cond = **462**
 *   退化方向：**Δd + 1.55·Δn = 0**（膜厚加 1 nm 与折射率加 0.65 给出同一组 Ψ/Δ）
 *
 * ⇒ δΨ = δΔ = 0.02° 时 **δd = 1.35 nm、δn = 0.87** —— 比膜本身（1.5 nm）还厚。
 * **也就是说：n 未知的单波长椭偏仪，对 1.5 nm 的膜"测不出厚度"，只测得出 d·f(n)。**
 *
 * 四条出路，每条都给数（同一套 0.02° 的噪声）：
 *
 *   ① **n 已知**（真实做法）：SiO₂ 的 1.462、Si₃N₄ 的 2.03、多晶硅的 4.0+0.05i
 *      都是材料常数，±0.001 ⇒ 未知量只剩 d ⇒ δd = **0.019 nm @70°、0.007 @75°** ✓
 *   ② **变角**：70° + 78° 两个角 ⇒ cond 435、δd = **0.33 nm**。只改善 4 倍 ——
 *      因为 1.5 nm ≪ λ，两个角看到的是同一个 d(n²−1)，不同只在二阶。
 *   ③ **多波长 + 色散**：488/400/300/250 四个滤光片 + Cauchy 两参数（A + B/λ²）
 *      ⇒ cond 2.6×10⁵、δd = **0.10 nm**、δn = 0.81。仍不到 0.01 nm。
 *   ④ **厚膜就没有这个问题**：100 nm 的 SiO₂ cond = 98（δd = 0.008 nm）；
 *      600 nm 的 FSG cond = 4200，但 δd = 0.23 nm、**δn = 0.0003** ——
 *      厚膜的 n 反而定得死准（多转几圈条纹）。**短膜缺的是 n，长膜不缺。**
 *
 * ── 一个不该被当成设计的巧合 ───────────────────────────────────────────────
 *
 *   在 70°/488 上，**n ≈ 2.1 的膜恰好 ∂Δ/∂n ≈ 0**（HfO₂ −0.035、Si₃N₄ +0.267）。
 *   于是 HfO₂ 的 1.5 nm 膜：δd = **0.006 nm**（Δ 单独定死它），δn = 0.41（Ψ 定不动）。
 *   这条**换一个角就没了**（80° 上 ∂Δ/∂n 回到 −0.3 量级），所以它是"读数条件"，
 *   不是"设计裕度"。同理 SiO₂（n = 1.46，本层最要紧的那一层膜）恰好是**最坏的一档**。
 *
 * ⇒ **结论（问题二）**：本层走 ①（n 已知）+ 488 单波长。②③ 都写进 R8 当升级路线：
 * 它们不是"能不能做"的问题，是"做了也只把 δd 从 1.35 压到 0.1–0.33"的问题。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、问题三：角度读出的 0.01° 从哪来？（答案：不从度盘来，从时间基准来）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `std/selsyn-general` 的 props 是 accuracy **0.01–1 °**，而 `make/selsyn`
 * 交付的是 **0.1–0.5 °**（`electromechanical.ts:54、78`）。
 * ⇒ **要 0.01° 的度盘它给不了，差 10–50 倍。** 这句话必须先承认。
 *
 * **但旋转检偏器根本不用度盘。** RAE 的 Δ 不是"检偏器转到多少度时归零"，是
 * 2ω 分量的**相位**；而相位参考是**时间**，不是角度：
 *
 *   25 r/min = 2.4 s/转 ⇒ 0.01° = 2.8×10⁻⁵ 转 = **67 µs**
 *   时基 `std/quartz-resonator-general` 100 kHz（10⁻⁵）= **10 µs 一格** ⇒ 够 6.7 格 ✓
 *
 * 自整角机在这台机器上只剩两个职责：**速度反馈**（±0.2 %，让 ω 在转内不变）与
 * **每转一个标记脉冲**（`plant/ellipsometer/rotary-head` 的标记盘 + 一只光电管）。
 * 标记的角度抖动 0.02°（转子惯性 + 阻尼）⇒ 用 **A 与 A+180° 成对读数**（一阶对消
 * 偏心与周期性抖动）⇒ 残余 **0.005°**。
 *
 * ── 变角臂要的是"绝对"角度，那里 0.01° 是真的要 ──────────────────────────
 *
 *   ∂Δ/∂θ（1.5 nm 膜、70° 附近）= **0.94 °/°** ⇒ 入射角差 0.1° 就是 0.094° 的 Δ
 *   = **0.030 nm 的假厚度**。要 0.01 nm ⇒ θ 得读到 **0.03°**。
 *   自整角机 0.1–0.5° 差 3–16 倍 ⇒ **度盘 + 游标**：φ200 mm、1° 一格（弧长 1.75 mm）、
 *   20 分游标 ⇒ **0.05°**，差 1.7 倍；再往下要靠对零片重复读数取平均。
 *
 * ⇒ **结论（问题三）**：0.01° 落在两处，两处的解法不同 ——
 * **旋转检偏器靠时基（拿得到 0.005°）**，**变角臂靠度盘游标（只到 0.05°，差 1.7 倍）**。
 * 后者是降级 D4，升级写进 R8。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、问题四：反演要多久？（答案：闭式 0.06 ms，迭代 0.3–1 s —— 只有闭式算实时）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * **两件事必须分开说，混在一起就会得出错误的结论：**
 *
 *   ① **闭式**（RAE 的核心）：36 个等间隔采样点做离散 Fourier，取 0 次与 2ω 的两个分量
 *      ⇒ Ψ、Δ 一击得出。36 × 4 次乘加 ≈ 300 flops；`std/cpu-32bit-general`
 *      （10 万门、10 MHz、5 MIPS）⇒ **0.06 ms**。**这一档是实时的**（1 kHz 都行）：
 *      闭环终点检测、扫描成图走它。
 *   ② **迭代**（n 未知、多层膜、有 k）：Gauss-Newton，2 个参数、100 次迭代、
 *      每次 100 个波长点、3 次有限差分雅可比 ⇒ 300 次目标函数求值 × 100 点 × ~50 flops
 *      = **1.5×10⁶ flops** ⇒ 5 MIPS ⇒ **0.3 s**；每点还要两个复指数（级数 20 flops）
 *      ⇒ 实测档 **0.3–1 s**。**这一档不实时。**
 *
 *   一片 φ200 片 49 点均匀性：49 ×（2 s 移动 + 1 s 测量 + 0.3 s 反演）≈ **2.7 min/片**。
 *
 * ⇒ **结论（问题四）**：**能不能实时，取决于你问的是哪一个**。单点 (Ψ,Δ) 是实时的
 * （0.06 ms）；两参数拟合 0.3–1 s（不实时）；一片 49 点 2.7 min。
 * 本机把两档都装进去（零件 `inverter`）：**扫图走闭式，报厚度走迭代**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、问题五：能不能测 HfO₂？（答案：能，而且不需要 UV —— 488 nm 上 Δ 走 5.93°）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1.5 nm HfO₂（n = 2.10）在 Si 上、488 nm、70°：
 *
 *   Ψ：13.725° → 13.779°（**只动 0.054°**）
 *   Δ：−177.606° → −171.674°（**走 5.93°**），斜率 **3.95 °/nm**
 *   ⇒ δΔ = 0.06° 折 **δd = 0.015 nm**；δΔ = 0.02° 折 **0.005 nm** —— 够。
 *
 * ── "波长越短越灵敏"这句话对多少？──────────────────────────────────────────
 *
 * ┌────────┬──────────────┬───────────┬──────────────┬────────────────────┐
 * │ λ (nm) │ Si 的 n + ik │ HfO₂ 的 n │ dΔ/dd (°/nm) │ 1.5 nm 膜的 Δ 变化 │
 * ├────────┼──────────────┼───────────┼──────────────┼────────────────────┤
 * │ 488    │ 4.35 + 0.09i │ 2.10      │ 3.95         │ 5.93°  ← 主工作点  │
 * │ 300    │ 7.6 + 2.9i   │ 2.35      │ 5.22         │ 7.83°  （1.32 倍） │
 * │ 280    │ 7.0 + 3.3i   │ 2.35      │ 5.56         │ 8.35°  （1.41 倍） │
 * │ 250    │ 6.5 + 3.5i   │ 2.35      │ 6.20         │ 9.30°  （1.57 倍） │
 * └────────┴──────────────┴───────────┴──────────────┴────────────────────┘
 *
 * **只赚 1.3–1.6 倍，不是 2 倍** —— 因为 488 上 Δ 已经贴着 180°，本来就在陡段。
 * 紫外真正赚的是另外两件：**Si 的 k 从 0.09 涨到 3.3**（光穿不进基底，背界面反射没了，
 * 测的就纯粹是膜）与 **HfO₂ 自己的 k**（带隙 5.8 eV = 214 nm，往上才开始吸收）。
 *
 * ── 本层能不能做 250–300 nm：能给 400 nm 的"有选择"，再短就没选择 ───────────
 *
 *   `plant/xenon-lamp`：150 W、**250–400 nm 连续谱** ✓（`litho-m2.ts:231`）
 *   熔石英：250 nm 透过 90 %、200 nm 还有 80 %，190 nm 以下开始陡降
 *             （OH 含量未定，这片窗的紫外截止没有量过 ⇒ 降级 D5）
 *   **玻璃在 350 nm 截止** ⇒ 滤光片只到 400 nm。**300 nm 以下没有窄带滤光片**，
 *   而本层没有单色器 ⇒ UV 段只能用"氙灯全谱 + 石英窗"，波长不可选，
 *   Δ 的色散正好把 1.4 倍的灵敏度优势吃掉。
 *   200 nm 以下 O₂ 有 Schumann-Runge 吸收 ⇒ 光路要吹氮；而**没有氧分析仪**
 *   （不自造、不列种子）⇒ 只能"吹 30 min 记时"，不测氧分压。
 *
 * ⇒ **结论（问题五）**：**HfO₂ 能测，判据放在 488 nm，不放 UV**。UV 是 R8 的升级方向
 * （石英棱镜单色器 —— 棱镜本身本层磨得出，`plant/refractometer/prism` 是先例），
 * 不是这一版的判据。
 *
 * ⚠️ **k 测不出来，这一条要说死**：1.5 nm 膜的 ∂Δ/∂k = **−0.19 °/单位 k**（同一个
 * "∂Δ/∂n ≈ 0"的幸运点对 k 也几乎归零），δΔ = 0.02° ⇒ **δk = 0.10**，等于没测。
 * 100 nm 膜上 ∂Δ/∂k = −750 ⇒ **δk = 3×10⁻⁵**（很好）；20 nm 上 −11.5 ⇒ δk = 0.002。
 * **k 的精度随膜厚变好**，所以 `hafnium.ts` 想要的"缺氧 ⇒ k 涨 ⇒ 化学计量比"
 * 这条反馈，在 1.5 nm 的 HfO₂ 上**给不了** —— 记降级 D6。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、白名单（本文件自己划的，违者 tsc 过、审查不过）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   投料  mat/quartz-pure · mat/glass · mat/aluminium · mat/copper · mat/copper-wire ·
 *         mat/iron-ht200 · mat/iron-ht250 · mat/steel-45 · mat/sheet-steel · mat/carbon ·
 *         mat/tailings · mat/water · mat/nitrogen · mat/oxygen · mat/silicon-wafer ·
 *         mat/phenolic-resin · mat/mineral-wool
 *   std/  std/quartz-resonator-general · std/capacitor-film-general ·
 *         std/zener-reference-general · std/opamp-chip-general · std/counter-chip-general ·
 *         std/photodiode-general · std/galvanometer-general · std/selsyn-general ·
 *         std/cpu-32bit-general · std/calibrated-scale-100
 *         （11 种里用到 10 种；`std/carbon-electrode-300` 不用 —— 那是一件电极，
 *          与光学无关，列在白名单里只是因为它属于同一批）
 *   设备  **既有 95 台里用到 14 台**（+ 本文件新建的第 96 台）：lathe ·
 *         plant/milling-machine · plant/grinder · plant/sheet-shop · plant/robot ·
 *         plant/diffusion-furnace · plant/xray-interferometer · plant/interferometer ·
 *         plant/laser-stage · plant/stabilized-laser · plant/xenon-lamp ·
 *         plant/metrology-room · plant/clean-room · plant/wet-bench
 *
 * ⚠️ **本文件新建的这台 `plant/ellipsometer` 不进 `performedBy`**（95 台的白名单不含
 * 第 96 台），与 `cmp-integration.ts:369` 是同一个处理：**机器只交定义（composedOf），
 * 零件各写路线**。它出现在 `make/ellipsometer-standard-wafer` 的 `needs` 里 ——
 * 标准片是本机的零点，它必须在场（属于"前提是设备"那一类）。
 * **把它接进那六条既有路线的三行改动，是主 agent 的活**（接线归主 agent），
 * 接法写在 §八。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 七、降级与升级（R8：每一处降级必须同时给出升级路线）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ┌──┬─────────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
 * │  │ 降级                            │ 代价（带数）              │ 升级（R8）                       │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D1│ 单波长；n 未知时 d 与 n 简并     │ cond 462 ⇒ δd 1.35 nm     │ 变角 70+78°（δd 0.33）→ 多波长   │
 * │  │                                 │ （比膜本身还厚）          │ Cauchy（δd 0.10）；已够的：n 已知│
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D2│ 没有单色器，只有玻璃滤光片        │ 300 nm 以下波长不可选；   │ 石英棱镜单色器（棱镜本层磨得出： │
 * │  │                                 │ UV 的 1.4 倍灵敏度吃不到  │ `plant/refractometer/prism` 先例）│
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D3│ 没有偏振片、没有光学胶 ⇒ 片堆     │ 消光 18 dB（泄漏 1.6 %），│ 14 片 → 21 dB（p 78.7 %，光电管  │
 * │  │                                 │ 靠标准片标定；漂 1 % ⇒    │ 上还有 31 mW）；代价是工时 +17 % │
 * │  │                                 │ δΔ 0.009°                 │ 与装调                           │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D4│ 变角臂用度盘 + 20 分游标         │ 0.05°（要 0.03°）         │ `std/calibrated-scale-100` 绕 φ100│
 * │  │（自整角机只到 0.1–0.5°）         │ ⇒ 假厚度 0.015 nm         │ ⇒ 0.0002°（弯曲后只保 0.005°）   │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D5│ 熔石英的紫外截止未定（OH 含量）   │ 200 nm 以下不承诺         │ 石英窗口逐片量 250/200 的透过比；│
 * │  │                                 │                           │ 但 <200 nm 还要真空，本层只有容器│
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D6│ 1.5 nm 膜的 k 测不出             │ ∂Δ/∂k = −0.19 ⇒ δk 0.10   │ 加厚到 20 nm 再测（δk 0.002，好  │
 * │  │（hafnium.ts 的缺氧判据缺这一半） │                           │ 50 倍），或换 UV（214 nm 以下）  │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D7│ 光斑最小 0.2 mm（没有显微物镜）   │ 局域测量 0.2 mm > 一个结  │ 显微物镜（本层没有）；先退到     │
 * │  │                                 │ ⇒ 结深只能测宽区          │ φ0.2 光阑 + 扫描，不改光学分辨   │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D8│ 厚度 >220 nm 有 2π 模糊          │ 488 的周期 218 nm；600 nm │ 多波长（250 nm 的周期 107 nm）； │
 * │  │（CMP 的 600 nm FSG 靠粗先验）    │ 的 FSG 要工艺先验         │ 或先用干涉仪读干涉级次           │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D9│ 标准片只有一片 100 nm（0.3 %）    │ 1.5 nm 的膜靠外推 Δ 零点  │ 三片证书：100 nm / 10 nm / 2 nm  │
 * │  │                                 │                           │（同一炉的 45 / 5 / 1 min 三档）  │
 * └──┴─────────────────────────────────┴───────────────────────────┴──────────────────────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 八、接线：主 agent 要把这六处各改一行（本文件不动别人的文件）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① `gate-stack.ts`  栅氧那一步之后再挂一段：
 *      { note_zh: '量栅氧：488 nm、70°/75° 两角、n = 1.462 固定', performedBy: 'plant/ellipsometer',
 *        under: [{ param: 'temperature', min: 19, max: 21 }] }
 *      并把 `needs` 加上 `plant/metrology-room`。
 *   ② `cmp-integration.ts`  膜厚/均匀性那两处同理；FSG 那一格把 "F 含量测不出" 改成
 *      "n ±0.0003 ⇒ F ±0.08 at %"。
 *   ③ `ald.ts`  把"厚度记在 ±30 % 窗口上"换成"每点 0.005 nm"，台阶覆盖那一半仍空着。
 *   ④ `implant.ts`  结深那一段加一次量测（非晶层 + 氧化层两层模型）；**剂量不改**。
 *   ⑤ `hafnium.ts`  HfO₂ 的膜厚与 n 有了；纯度那一半（金属杂质）仍要 SMS，本层没有。
 *   ⑥ `rie.ts`  终点之后加一次陪片量测：刻蚀前/后各一次 ⇒ 深度 ±0.01 nm。
 *
 *   接线时注意两件事：**（a）**`performedBy: 'plant/ellipsometer'` 只有在白名单加到
 *   96 台之后才合法，否则写成 `needs` + 机器人执行；**（b）**那六处路线都要有
 *   `plant/metrology-room` 在 `needs` 里，否则 19–21 °C 没有承担者（`no_machine`）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、零件（13 件）
// ═══════════════════════════════════════════════════════════════════════════

export const ELLIPSOMETER_PARTS: readonly Item[] = [
  /**
   * **光源台。** 铸铁底座 + 两条光轴 + 快门口 + 三点调整座 + 隔热罩。
   *
   * 它要的不是强度，是**两根轴的重合**：Ar⁺ 激光（488 nm）与氙灯（250–400 nm）
   * 换着用，两束光必须落在同一条轴上、同一个光斑里 —— 否则换一次光源就要重调
   * 一次偏振与角度。三点调整座（两顶一拉）给 0.3 mrad 的对准。
   *
   * 三个数：
   *   sources     2 台    激光与氙灯各一（本层没有"可调谐源"）
   *   aiming      ≤0.3 mrad  300 mm 上是 90 µm，比光斑（0.2 mm）小
   *   railLength  ≥800 mm  起偏 → 样品 → 补偿 → 检偏 → 探测器五段要排开
   */
  {
    id: 'plant/ellipsometer/source-bench',
    name: '椭偏仪光源台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'sources', kind: 'range', min: 1, max: 4, unit: '台', dir: 'atLeast' },
      { param: 'aiming', kind: 'range', min: 0, max: 2, unit: 'mrad', dir: 'atMost' },
      { param: 'railLength', kind: 'range', min: 0, max: 2000, unit: 'mm', dir: 'atLeast' },
    ],
  },

  /**
   * **滤光片轮。** 6 位：3 片玻璃滤光片 + 2 片石英窗 + 1 个空位。
   *
   * **"本层没有单色器"这句话的落地**：波长选择只能靠滤光片。玻璃在 350 nm 截止，
   * 所以轮上能给的是 400/550/600 nm 三档（±15 nm），488 nm 走激光直通（不经过轮）。
   * UV（250–400 nm）只有"氙灯全谱 + 石英窗"那一档 —— 波长不可选，记降级 D2。
   *
   * 三个数：
   *   positions  6 位      4 个波长 + 空位 + 备用
   *   bandwidth  ≤30 nm    玻璃滤光片的典型带宽（名义值 ±15 nm）
   *   wobble     ≤20 µm    轮盘端跳；它让光斑在样品上挪，0.2 mm 的光斑吃得下
   *
   * ⚠️ 中心波长按玻璃牌号的名义值记，**没有分光计可以复核**（本层没有光谱仪）
   * —— 这是 D2 的一半，另一半是"没有窄带"。
   */
  {
    id: 'plant/ellipsometer/filter-wheel',
    name: '椭偏仪滤光片轮',
    unit: '件',
    category: 'part',
    props: [
      { param: 'positions', kind: 'range', min: 2, max: 12, unit: '位', dir: 'atLeast' },
      { param: 'bandwidth', kind: 'range', min: 0, max: 40, unit: 'nm', dir: 'atMost' },
      { param: 'wobble', kind: 'range', min: 0, max: 100, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * **斩波器。** 30 叶盘 + 同步电机 + 参考光电管。1 kHz。
   *
   * 它存在的理由只有一条：**相敏检波要一个参考相位**。而相位一漂，检波就从
   * "测信号"变成"测相位"（`flow-and-rf.ts:938` 那句原话）。
   *
   * 与 `plant/ir-endpoint/chopper`（50 Hz 簧片）的分工：那一台靠市电励磁，
   * 所以频率被 50 Hz 钉死；这一台要 1 kHz（避开 1/f 与市电谐波），簧片做不到，
   * 用**冲压的 30 叶盘**：2000 r/min = 33.3 转/s × 30 叶 = **1000 Hz**。
   * （1500 r/min 的同步电机经 3:4 皮带就到 2000 —— 本层最常见的增速对。）
   *
   * 三个数：
   *   frequency  1 kHz     避开 50 Hz 及其谐波，也避开激光的 1/f（≤100 Hz）
   *   depth      ≥90 %     叶宽 2 mm、节距 8.4 mm（φ80 盘），边缘衍射让零点漏光 10 %
   *   jitter     ≤2°       参考管与斩波盘同轴，相位抖动只由轴承给
   */
  {
    id: 'plant/ellipsometer/chopper',
    name: '椭偏仪斩波器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'frequency', kind: 'range', min: 0.2, max: 2, unit: 'kHz' },
      { param: 'depth', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'jitter', kind: 'range', min: 0, max: 5, unit: '°', dir: 'atMost' },
    ],
  },

  /**
   * **起偏器（布儒斯特片堆）。** 12 片 φ30 熔石英平板，55.6° 装在一个 45 钢座里。
   *
   * **它不是新器件**：`plant/laser-stage/polarizer` 是同一件东西的同一条手艺
   * （`laser-stage.ts` 第一节② 的算式：n = 1.46 ⇒ θ_B = 55.6°，Rs = 9.2 %、
   * Rp = 0.85 %，24 个面 ⇒ p 过 81 %、s 过 9.9 % ⇒ **18 dB**）。
   * 差别只在用途：那一台是"分光"，这一台是"定偏振方位"。
   *
   * 三个数：
   *   extinction  ≥18 dB    泄漏 1.6 %（幅度 12.6 %），标定后残差只由它的漂移定（D3）
   *   transmission ≥78 %    81 % 交付，留 3 % 给装调
   *   angle       55.6±0.4° 偏 0.4° 就把 Rp 从 0 推到 0.2 %
   */
  {
    id: 'plant/ellipsometer/polarizer',
    name: '椭偏仪起偏器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'extinction', kind: 'range', min: 0, max: 60, unit: 'dB', dir: 'atLeast' },
      { param: 'transmission', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'angle', kind: 'range', min: 50, max: 60, unit: '°' },
    ],
  },

  /**
   * **补偿器（λ/4 波片，488.0 nm，13.71 µm 的 X 切石英）。**
   *
   * 它是**这台机器里最重要的一个零件**，而它同时是本层最便宜的一个：
   *
   *   d = λ/(4Δn) = 488/(4 × 0.0089) = **13.71 µm**
   *   f·d ≈ 2.87 MHz·mm ⇒ 13.71 µm ⇔ **209 kHz** 的石英振子
   *   （`phase-shifter.ts` 问题 3 的频率-厚度关系，`laser-stage.ts` 第一节① 的同一算式）
   *
   * **"波片"在这层不是新器件，是"挑一只 209 kHz 的振子、拆帽取片、磨到位"。**
   * 为什么非要它：没有它 Δ 就贴着 180° 读（1.5 nm 膜 sin Δ = 0.124、裸片 0.042）
   * ⇒ 噪声放大 8–25 倍（§一①）。有它，工作点搬到 Δ ≈ 90°，**同一份噪声换来好 8–25 倍的 Δ**。
   *
   * 三个数：
   *   retardance  90° ±1.5    相位误差 0.026 rad（`laser-stage.ts` 同一条）
   *   thickness   13.71 ±0.2  厚度用**频率**量，不用千分尺：1 µm = 6.6° 相位误差
   *   aperture    ≥6 mm       13.71 µm 自支撑，再大就塌
   */
  {
    id: 'plant/ellipsometer/compensator',
    name: '椭偏仪补偿器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'retardance', kind: 'range', min: 85, max: 95, unit: '°' },
      { param: 'thickness', kind: 'range', min: 13, max: 14.5, unit: 'µm' },
      { param: 'aperture', kind: 'range', min: 0, max: 20, unit: 'mm', dir: 'atLeast' },
    ],
  },

  /**
   * **检偏器（第二只片堆，装在一根空心轴里，跟着转）。**
   *
   * 与起偏器同一套 12 片，区别只有一个：它**要转**。所以多了两个数：
   *
   *   runout  ≤1.5 µm   旋转轴的径向跳动。它让光斑在片堆上画一个 φ3 µm 的圈 ——
   *                     片堆是 φ8 mm 的通光口径，3 µm 的走位不影响消光
   *   angle   55.4–55.8 与起偏器同一个布儒斯特角（两只片堆要对称，
   *                     否则两端的不对称会变成 Δ 的一个固定偏置）
   *
   * ⚠️ 装在空心轴上而不是"片堆 + 齿轮"：齿轮的回差会让角度-时间关系出现 0.05° 的
   * 台阶，而这一台的角度是靠**时间**读的（§三）—— 回差直接变成 Δ 的误差。
   */
  {
    id: 'plant/ellipsometer/analyzer',
    name: '椭偏仪检偏器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'extinction', kind: 'range', min: 0, max: 60, unit: 'dB', dir: 'atLeast' },
      { param: 'runout', kind: 'range', min: 0, max: 10, unit: 'µm', dir: 'atMost' },
      { param: 'angle', kind: 'range', min: 50, max: 60, unit: '°' },
    ],
  },

  /**
   * **旋转头。** 同步电机 + 蜗轮副 + 空心轴 + 自整角机 + **每转一个标记盘**。
   *
   * 自整角机的精度只有 0.1–0.5°（`std/selsyn-general`，`make/selsyn` 交付那一档），
   * **差 10–50 倍** —— 所以它不是"角度读出"，它是**速度反馈**（±0.2 %）与
   * **每转一次的粗对零**。真正的角度基准是时间：25 r/min 下 0.01° = 67 µs，
   * 100 kHz 的石英时基给 10 µs 一格（§三）。
   *
   * 四个数：
   *   speed          25 r/min   2.4 s/转；一轮 36 个采样点，每点 67 ms
   *   speedStability ≤0.3 %     转内速度变了，角度-时间的线性就变了
   *   runout         ≤1.5 µm    空心轴的端跳
   *   indexJitter    ≤0.02°     标记脉冲的角度抖动（转子惯性 + 阻尼绕组）
   */
  {
    id: 'plant/ellipsometer/rotary-head',
    name: '椭偏仪旋转头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'speed', kind: 'range', min: 1, max: 200, unit: 'r/min' },
      { param: 'speedStability', kind: 'range', min: 0, max: 2, unit: '%', dir: 'atMost' },
      { param: 'runout', kind: 'range', min: 0, max: 20, unit: 'µm', dir: 'atMost' },
      { param: 'indexJitter', kind: 'range', min: 0, max: 0.2, unit: '°', dir: 'atMost' },
    ],
  },

  /**
   * **变角臂。** 45–80° 的入射臂 + 与之对偶的接收臂 + 度盘 + 20 分游标。
   *
   * 变角的用处**不是**"多测一个角更准"（§二②：两个角只把 δd 从 1.35 压到 0.33），
   * 而是**换工作点**：60° 上 dΔ/dd = 1.31，75° 上是 9.13 —— 同一台机器在 75° 上
   * 对薄膜灵敏 7 倍。所以这一件是"把工作点挪到最陡的地方"的机构，不是"多测一点"。
   *
   * 三个数：
   *   angleRange    45–80°    70° 是主工作点，75° 是最灵敏点，60° 是厚膜点
   *   angleAccuracy ≤0.05°    度盘 1° 一格 + 20 分游标。∂Δ/∂θ = 0.94 °/°
   *                           ⇒ 0.05° 折 0.015 nm 的假厚度（要 0.03° ⇒ 降级 D4）
   *   repeatability ≤0.015°   回到同一角度的重复性（对零片 + 两次读数取平均）
   */
  {
    id: 'plant/ellipsometer/goniometer',
    name: '椭偏仪变角臂',
    unit: '件',
    category: 'part',
    props: [
      { param: 'angleRange', kind: 'range', min: 30, max: 90, unit: '°' },
      { param: 'angleAccuracy', kind: 'range', min: 0, max: 0.5, unit: '°', dir: 'atMost' },
      { param: 'repeatability', kind: 'range', min: 0, max: 0.2, unit: '°', dir: 'atMost' },
    ],
  },

  /**
   * **样品台。** φ200 片承片盘 + X/Y 丝杠台 + θ 台 + 两把 100 nm 刻线尺 + 两只自整角机。
   *
   * 为什么它非有不可：**一片 φ200 上"1.5 nm"不是一个数，是一张图**。
   * 49 点（7 × 7，间距 25 mm）才看得见"中心 1.52、边缘 1.43"这种坡 —— 而
   * `gate-stack.ts` 现在连一个点都没有。
   *
   * 四个数：
   *   stroke          ≥200 mm   φ200 片对角线 283 mm 的一多半；够扫 7 × 7
   *   positionAccuracy ≤15 µm   光斑 0.2 mm，15 µm 是它的 7 %
   *   scanPoints      49        7 × 7；每点 1 s 测量 + 2 s 移动
   *   rotation        0–360°    θ 台（看各向异性与晶向）
   *
   * ⚠️ 定位不需要更好：**位置精度只要比光斑小一个量级就不进误差**。
   * 这一点与 `plant/laser-stage`（10 nm 定位）正好相反 —— 那台是"光斑要走在 nm 上"，
   * 这台是"光斑 0.2 mm，位置随便"。
   */
  {
    id: 'plant/ellipsometer/sample-stage',
    name: '椭偏仪样品台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'stroke', kind: 'range', min: 0, max: 500, unit: 'mm', dir: 'atLeast' },
      { param: 'positionAccuracy', kind: 'range', min: 0, max: 50, unit: 'µm', dir: 'atMost' },
      { param: 'scanPoints', kind: 'range', min: 1, max: 500, unit: '点', dir: 'atLeast' },
      { param: 'rotation', kind: 'range', min: 0, max: 360, unit: '°' },
    ],
    composedOf: [
      { item: 'plant/ellipsometer/sample-stage/table', qty: q(1) },
      { item: 'plant/ellipsometer/sample-stage/lead-screw', qty: q(2) },
      { item: 'plant/ellipsometer/sample-stage/anti-backlash-nut', qty: q(2) },
      {
        item: 'std/calibrated-scale-100',
        qty: q(2),
        // 要的是“100 nm 刻度、1 m 长”那一档；精度差一档只让回到同一点变差，
        // 不改光斑 0.2 mm 的测量本身。
        need: [{ param: 'accuracy', kind: 'range', max: 1000, dir: 'atMost' }],
        onRelax: 'functional-kept',
      },
      { item: 'std/selsyn-general', qty: q(2) },
    ],
  },

  /**
   * **探测器。** 两只光电管（信号 + 参考）+ 1 MΩ 跨阻 + **动圈乘法的相敏检波**。
   *
   * 本层没有锁相放大器这件商品，但**相敏检波的做法本层已经有了**：
   * `plant/ir-endpoint/preamp` 用 `std/galvanometer-general` 的动圈当乘法器，
   * 参考信号从同一只振荡器来（`flow-and-rf.ts:2071`）。这里照抄，只把 50 Hz 换成 1 kHz。
   *
   * 三个数：
   *   noise     ≤0.1 %    0.1 s 时间常数下的强度噪声（§一① 的预算表第一行）
   *   bandwidth ≥150 kHz  光电管 1 nF × 1 kΩ = 159 kHz；采样 36 点/2.4 s 只要 15 Hz
   *   channels  2 路      信号 + 参考（参考那一路是"双光路"的全部内容）
   */
  {
    id: 'plant/ellipsometer/detector',
    name: '椭偏仪探测器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'noise', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
      { param: 'bandwidth', kind: 'range', min: 0, max: 1000, unit: 'kHz', dir: 'atLeast' },
      { param: 'channels', kind: 'range', min: 1, max: 4, unit: '路', dir: 'atLeast' },
    ],
  },

  /**
   * **反演单元。** 1 片 `std/cpu-32bit-general`（10 万门、10 MHz、5 MIPS）+
   * 2 片计数器（分频与计时）+ 100 kHz 石英时基 + 齐纳基准 + 6 位显示。
   *
   * **它同时装两条算法**（§四）：36 点离散 Fourier 的**闭式解**（0.06 ms，实时，
   * 扫图走它）与 Gauss-Newton 的**迭代解**（0.3–1 s，报厚度走它）。
   *
   * 三个数：
   *   fitTime  ≤1 s     100 次 × 100 点 × 3 次雅可比 = 1.5×10⁶ flops ⇒ 5 MIPS 下 0.3 s
   *   points   100      一次拟合用的波长/角度点数
   *   clock    ≥100 kHz 时基（10⁻⁵）；它同时是"角度-时间"的基准（§三）
   */
  {
    id: 'plant/ellipsometer/inverter',
    name: '椭偏仪反演单元',
    unit: '件',
    category: 'part',
    props: [
      { param: 'fitTime', kind: 'range', min: 0, max: 10, unit: 's', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 1000, unit: '点', dir: 'atLeast' },
      { param: 'clock', kind: 'range', min: 1, max: 1000, unit: 'kHz', dir: 'atLeast' },
    ],
  },

  /**
   * **标准片。** 一片 100 nm 干氧的硅片，厚度由 **XRR**（不是椭偏自己）定值。
   *
   * 为什么必须有它：§一 的整张预算表里，**消光 18 dB 的那 1.6 % 是一个系统偏置**，
   * 它把 β 缩了 1.6 % ⇒ Δ 偏 0.9°。这个偏置不能靠"算"，只能靠一片已知的膜标掉。
   * 而"已知"不能用椭偏自己给（循环），所以用 X 射线：
   *
   *   100 nm 的膜，Kiessig 条纹间距 2θ = λ/(2d) = 0.154/(2 × 100) = 7.7×10⁻⁴ rad
   *   = **0.044°/条**；读 5 条 ⇒ 厚度 ±0.3 nm（0.3 %）
   *
   * 三个数：
   *   thickness   100 nm ±0.5   干氧、1000 °C、2.2 nm/min ⇒ 45 min（`gate-stack.ts:36` 同一口径）
   *   uncertainty ≤0.3 nm       XRR 的 5 条条纹；它是整台机器的 Δ 零点
   *   diameter    ≥100 mm       φ100 就够（不用 φ200：标准片只用来定零点，不扫图）
   */
  {
    id: 'plant/ellipsometer/standard-wafer',
    name: '椭偏仪标准片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'thickness', kind: 'range', min: 90, max: 110, unit: 'nm' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 0.5, unit: 'nm', dir: 'atMost' },
      { param: 'diameter', kind: 'range', min: 0, max: 300, unit: 'mm', dir: 'atLeast' },
    ],
  },

  /**
   * **光阑组。** 4 档刀口光阑 + 视场光阑 + 石英窗。
   *
   * 它决定**测的是哪一块面积**：φ2 mm（均匀性）/ φ1 mm（常规）/ φ0.5 mm（图形片）/
   * φ0.2 mm（最细）。最小 0.2 mm 是**没有显微物镜**的结果 —— 再细就只能靠光阑硬抠，
   * 抠到 0.1 mm 时衍射与边缘散射就把 Ψ/Δ 拖走了（D7）。
   *
   * 两个数：
   *   spotSize  0.2–2 mm
   *   steps     4 档
   */
  {
    id: 'plant/ellipsometer/aperture',
    name: '椭偏仪光阑组',
    unit: '件',
    category: 'part',
    props: [
      { param: 'spotSize', kind: 'range', min: 100, max: 2000, unit: 'µm' },
      { param: 'steps', kind: 'range', min: 1, max: 6, unit: '档', dir: 'atLeast' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、设备：整机（composedOf 十三件，没有产出路线）
// ═══════════════════════════════════════════════════════════════════════════

/**
 * **椭偏仪。** 一台"把偏振当尺子"的量具。
 *
 * 它由十三件组成，**没有产出路线** —— 与 `plant/stabilized-laser`、`plant/phase-shifter`、
 * `plant/laser-stage`、`plant/cmp-integration` 同一个形状：**有 composedOf 就不许有
 * 产出路线**（`mixed_production`），因为"空间组合"与"不可逆加工"是两件事。
 * 装配的规格由零件清单承担，不由某条路线交付（`prop_missing_gives` 只判产出了却没说
 * 规格的路线）—— 所以下面这六个数**是设计的结论，不是某条路线交付的实测值**。
 *
 * 六个读数（算式全在文件头）：
 *
 *   thicknessAccuracy ≤0.05 nm   0.019 nm @70°/1 s（§一②）；报"0.01 nm 级"是因为
 *                                75° 或 10 s 平均都是 0.007–0.010 nm
 *   thicknessRange    1–1000 nm  1 nm 是 488 nm 的信号下限（Δ 走 3.1°，δΔ 0.06° ⇒ 2 %）；
 *                                1000 nm 靠多波长（D8：488 单色在 220 nm 处有 2π 模糊）
 *   nAccuracy         ≤0.02      100 nm 膜 ±0.0001；1.5 nm 膜上 n 测不出（0.87）—— 见 §二
 *   spotSize          0.1–2 mm   没有显微物镜（D7）
 *   angleRange        45–80 °    70° 主点、75° 最灵敏点、60° 厚膜点
 *   measureTime       ≤60 s/点   1 s 测量 + 0.3 s 反演 + 移动
 */
export const ELLIPSOMETER: Item = {
  id: 'plant/ellipsometer',
  name: '椭偏仪',
  unit: '台',
  category: 'machine',
  props: [
    { param: 'thicknessAccuracy', kind: 'range', min: 0, max: 0.05, unit: 'nm', dir: 'atMost' },
    { param: 'thicknessRange', kind: 'range', min: 1, max: 1000, unit: 'nm' },
    { param: 'nAccuracy', kind: 'range', min: 0, max: 0.02, unit: '1', dir: 'atMost' },
    { param: 'spotSize', kind: 'range', min: 100, max: 2000, unit: 'µm' },
    { param: 'angleRange', kind: 'range', min: 45, max: 80, unit: '°' },
    { param: 'measureTime', kind: 'range', min: 0, max: 60, unit: 's', dir: 'atMost' },
  ],
  composedOf: [
    { item: 'plant/ellipsometer/source-bench', qty: q(1) },
    { item: 'plant/ellipsometer/filter-wheel', qty: q(1) },
    { item: 'plant/ellipsometer/chopper', qty: q(1) },
    { item: 'plant/ellipsometer/polarizer', qty: q(1) },
    { item: 'plant/ellipsometer/compensator', qty: q(2) },
    { item: 'plant/ellipsometer/analyzer', qty: q(1) },
    { item: 'plant/ellipsometer/rotary-head', qty: q(1) },
    { item: 'plant/ellipsometer/goniometer', qty: q(2) },
    { item: 'plant/ellipsometer/sample-stage', qty: q(1) },
    { item: 'plant/ellipsometer/detector', qty: q(1) },
    { item: 'plant/ellipsometer/inverter', qty: q(1) },
    { item: 'plant/ellipsometer/aperture', qty: q(4) },
    { item: 'plant/ellipsometer/standard-wafer', qty: q(1) },
    // 光源不是零件，是**别的机器**：Ar⁺ 激光与氙灯在几条路线里当 `needs` 出现
    // （`plant/stabilized-laser`、`plant/xenon-lamp`）—— 它们比本机先坏、也装不进本机。
    // 电子件同理：光电管、运放、CPU、自整角机在 detector / inverter / rotary-head 三件里，
    // 不在这儿重复数一遍（一件事只写在一个地方）。
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// 三、路线：十三件零件
// ═══════════════════════════════════════════════════════════════════════════

export const ELLIPSOMETER_ROUTES: readonly Route[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 3.1 光源台
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **光源台：浇底座 → 铣 T 型槽 → 车三点座与快门口 → 刮研 → 装。**
     *
     *   铸铁 8 + 铝 2 + 45 钢 1.5 + 铜 0.2 + 矿棉 0.5 + 水 5 → 光源台 1 件
     *
     * 铸铁底座的理由与 `plant/comparator` 的床身同一条：**热惰性**。
     * 铝的热膨胀是铁的两倍，底座若用铝，19–21 °C 的房间里 1 °C 就让两条光轴
     * 相对走 20 µm（800 mm × 23 µm/(m·K)）—— 那是 0.05° 的角度漂。
     */
    id: 'make/ellipsometer-source-bench',
    name: '椭偏仪光源台制造',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'plant/ellipsometer/source-bench',
        qty: q(1),
        gives: [
          { param: 'sources', kind: 'range', min: 2, max: 2 },
          { param: 'aiming', kind: 'range', max: 0.3 },
          { param: 'railLength', kind: 'range', min: 800 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(8) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(3, 2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room', 'plant/stabilized-laser', 'plant/xenon-lamp'],
    steps: [
      { note_zh: '铣底座与两条 T 型槽（槽距 200 ±0.05 mm）', performedBy: 'plant/milling-machine' },
      { note_zh: '车三点调整座与快门口（φ60 的通光孔，刀口倒角）', performedBy: 'lathe' },
      {
        note_zh:
          '刮研安装面（12 点/25 mm²）并装配；**两只光源都上机**，激光打 800 mm 外的靶把两轴调到 ≤0.3 mrad',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '铸铁 8 + 铝 2 + 45 钢 1.5 + 铜 0.2 → 光源台 1 件（约 11 kg）；矿棉 0.5 与 5 kg 水走掉（磨削冷却与清洗）',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3.2 滤光片轮
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **滤光片轮：磨 6 片（3 片滤光玻璃 + 2 片石英窗）→ 车 6 位盘 → 装 → 记波长。**
     *
     *   玻璃 0.6 + 石英 0.15 + 铝 0.4 + 磨料 0.3 + 水 3 → 滤光片轮 1 件
     *
     * ⚠️ **波长不可复核**：本层没有分光计（没有光栅、没有光谱仪），所以
     * "550 nm"是玻璃牌号的名义值（±15 nm）。这一条写在这里，是因为它是 D2 的
     * 另一半 —— **中心波长不确定 3 %，靠色散反演 n 就不可能**（§二③ 那条升级路线
     * 因此在报告里只会是一条 `prop_unfilled`，而不是一条能落地的路线）。
     */
    id: 'make/ellipsometer-filter-wheel',
    name: '椭偏仪滤光片轮制造',
    rate: { hours: q(16) },
    produces: [
      {
        item: 'plant/ellipsometer/filter-wheel',
        qty: q(1),
        gives: [
          { param: 'positions', kind: 'range', min: 6 },
          { param: 'bandwidth', kind: 'range', max: 30 },
          { param: 'wobble', kind: 'range', max: 20 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(3, 5) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(3, 20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2, 5) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(3) }] },
    ],
    needs: ['plant/metrology-room', 'plant/xenon-lamp'],
    steps: [
      {
        note_zh: '磨 6 片两面研平行到 0.1 µm、面形 λ/2（滤光片进了会聚光就是一块楔）',
        performedBy: 'plant/grinder',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      { note_zh: '车 6 位轮盘与锥销定位（定位重复性 ≤10 µm），铣 φ35 的六个座孔', performedBy: 'lathe' },
      {
        note_zh: '装片；量端跳 ≤20 µm；按玻璃牌号记三个中心波长（**没有分光计复核** —— D2）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '玻璃 0.6 + 石英 0.15 + 铝 0.4 → 滤光片轮 1 件（约 1.2 kg）；磨料 0.3 与水 3 走掉',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3.3 斩波器
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **斩波器：冲 30 叶盘 → 黑化 → 车轴与电机座 → 装参考管 → 量斩波深度。**
     *
     *   铝 0.3 + 45 钢 0.2 + 石墨 0.05 + 铜线 0.2 + 水 1 → 斩波器 1 件
     *
     * 石墨那一小撮是**黑化**：光电管的暗电流与杂散光决定了 1 kHz 上的噪声底，
     * 而叶片正面抛光会把激光反射回光源（那会让激光跳模）。黑化用石墨粉擦，
     * 与 `deprocess.ts` 的"刻线后填石墨粉"是同一句话。
     *
     * 量斩波深度的办法与 `flow-and-rf.ts:1995` 一模一样：**没有示波器，就用毫伏表的
     * 交流档读峰谷比** —— 这一层的仪器就这些，够用。
     */
    id: 'make/ellipsometer-chopper',
    name: '椭偏仪斩波器制造',
    rate: { hours: q(8) },
    produces: [
      {
        item: 'plant/ellipsometer/chopper',
        qty: q(1),
        gives: [
          { param: 'frequency', kind: 'range', min: 0.95, max: 1.05 },
          { param: 'depth', kind: 'range', min: 90 },
          { param: 'jitter', kind: 'range', max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'std/photodiode-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '冲 30 叶遮光盘（占空比 45 %，φ80 盘上节距 8.4 mm）并石墨黑化', performedBy: 'plant/sheet-shop' },
      { note_zh: '车轴与同步电机座：1500 r/min 经 3:4 皮带 = 2000 r/min，× 30 叶 = 1 kHz', performedBy: 'lathe' },
      {
        note_zh: '装参考光电管与一级运放整形；量斩波深度 ≥90 %（毫伏表交流档读峰谷比）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '铝 0.3 + 45 钢 0.2 + 石墨 0.05 + 铜线 0.2 → 斩波器 1 件（约 0.8 kg）；1 kg 水走掉',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3.4 起偏器（12 片布儒斯特片堆）
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **起偏器：12 片熔石英两面研平行 → 车 55.6° 座 → 装片 → 量消光比。**
     *
     *   石英 3 + 45 钢 1 + 磨料 3 + 水 5 → 起偏器 1 件
     *
     * 与 `make/laser-stage-polarizer` 是同一条路线、同一组数（12 片、24 面、
     * p 过 81 %、s 过 9.9 %、18 dB）—— **本层造第三个片堆了**（`laser-stage` 两个、
     * `unblock-interferometer-splitter` 那个是分光）。这说明"布儒斯特片堆"不是
     * 权宜之计，而是**这层的偏振元件就只有这一种**（没有偏振片、没有光学胶）。
     *
     * 为什么 18 dB 够：§一① 的预算表里，消光进的是**系统偏置**（β 被缩 1.6 % ⇒ Δ 偏 0.9°），
     * 靠标准片标掉之后只剩它的漂移（1 % ⇒ 0.009°）。**要的不是"消光比高"，
     * 要的是"消光比稳"** —— 这一条与 `laser-stage` 的 2.4 nm 插值误差是同一个道理。
     */
    id: 'make/ellipsometer-polarizer',
    name: '椭偏仪起偏器制造',
    rate: { hours: q(40) },
    produces: [
      {
        item: 'plant/ellipsometer/polarizer',
        qty: q(1),
        gives: [
          { param: 'extinction', kind: 'range', min: 18 },
          { param: 'transmission', kind: 'range', min: 78 },
          { param: 'angle', kind: 'range', min: 55.3, max: 55.9 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(3) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(3) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room', 'plant/interferometer', 'plant/stabilized-laser', 'plant/wet-bench'],
    steps: [
      {
        note_zh: '12 片两面研平行到 0.1 µm、面形 λ/4（**不要楔**：透射用的楔角是把光分走）',
        performedBy: 'plant/grinder',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      { note_zh: '车 55.6° 的 12 槽座与压条（槽角 ±0.1°：偏 0.4° 就把 Rp 从 0 推到 0.2 %）', performedBy: 'lathe' },
      {
        note_zh: '装片；量消光比：488 nm 激光 + 片堆 + 光电管，转 90° 读两次强度，判 ≥18 dB、p ≥78 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '石英 3 + 45 钢 1 → 起偏器 1 件（约 2.2 kg）；磨料 3 与 5 kg 水走掉',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3.5 补偿器（λ/4，13.71 µm）
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **补偿器：拆 8 只振子 → 挑 209 kHz → 磨到 13.71 µm → 检偏量 90°。**
     *
     *   振子 8 + 玻璃 0.1 + 磨料 1 + 水 2 → 补偿器 4 片（两只一组，另两只备）
     *
     * **这是整台机器里唯一"不按图纸做、按频率挑"的零件**，而它恰好是最要紧的一件
     * （§一①：没有它 1 s 的 δΔ 从 0.06° 变 0.45°）。三个数：
     *
     *   f·d ≈ 2.87 MHz·mm（`phase-shifter.ts` 问题 3）⇒ 209 kHz ⇔ 13.71 µm
     *   1 µm 的厚度误差 = 6.6° 相位误差；1 % 的频率误差 = 0.9° ⇒ **用频率，不用千分尺**
     *   8 只挑 4 只（50 % 良品）是给振子频率 ±1 % 分散留的余量
     *
     * 为什么只能做 13.71 µm 的"零级"：云母全表没有（`mat/mica` 不存在），石英的
     * Δn 只有 0.0089（云母 0.004）—— **所以它必须极薄，薄到只能靠谐振频率定厚**。
     * 这是"缺料换来更薄"，不是"做不到"（`laser-stage.ts` 第一节① 同一句）。
     */
    id: 'make/ellipsometer-compensator',
    name: '椭偏仪补偿器制造',
    rate: { hours: q(20) },
    produces: [
      {
        item: 'plant/ellipsometer/compensator',
        qty: q(4),
        gives: [
          { param: 'retardance', kind: 'range', min: 88.5, max: 91.5 },
          { param: 'thickness', kind: 'range', min: 13.5, max: 13.9 },
          { param: 'aperture', kind: 'range', min: 6 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'std/quartz-resonator-general',
            qty: q(8),
            // 209 kHz ⇔ 13.71 µm。窗口给宽到 200–220 kHz，因为振子频率带 ±1 % 的分散。
            need: [{ param: 'frequency', kind: 'range', min: 200, max: 220 }],
            // 挑不到就磨 —— 磨薄一点点就够（28 → 13.71 µm 要磨掉一半，但那是磨，不是废）。
            // 功能还在，只是良品率掉。
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room', 'plant/interferometer', 'plant/laser-stage'],
    steps: [
      {
        note_zh: '拆帽取片：8 只振子各取一片 X 切单晶。两面是蒸铝电极，要透光就磨掉',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '磨到 13.71 ±0.2 µm：**厚度由谐振频率定**（209 ±2 kHz），不用千分尺',
        performedBy: 'plant/grinder',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装自由孔径座（φ6、三点压簧，不能胶：酚醛会流动、会发黄）；用片堆 + 光电管检偏量 90 ±1.5°',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '振子 8 → 补偿器 4 片（50 % 良品）；玻璃 0.1 + 磨料 1 + 水 2 全走掉；8 只振子的壳与簧片回炉',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3.6 检偏器
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **检偏器：12 片研平行 → 车 55.6° 座与空心轴 → 装片 → 量消光与端跳。**
     *
     *   石英 2.5 + 45 钢 1.2 + 磨料 2 + 水 4 → 检偏器 1 件
     *
     * 与起偏器**同一套片子、同一个角度**，两处不同：它装在空心轴上（要转），
     * 而且端跳 ≤1.5 µm。端跳为什么能松到 1.5 µm：片堆通光 φ8，转动时 1.5 µm
     * 的走位只等于"光斑挪了 1.5 µm"，而光束本身是 φ8 的近平行光 —— 强度变化 10⁻⁴ 量级。
     * **真正要求严的是"角度的均匀性"（时间），不是"位置"。**
     */
    id: 'make/ellipsometer-analyzer',
    name: '椭偏仪检偏器制造',
    rate: { hours: q(40) },
    produces: [
      {
        item: 'plant/ellipsometer/analyzer',
        qty: q(1),
        gives: [
          { param: 'extinction', kind: 'range', min: 18 },
          { param: 'runout', kind: 'range', max: 1.5 },
          { param: 'angle', kind: 'range', min: 55.4, max: 55.8 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(5, 2) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(6, 5) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(4) }] },
    ],
    needs: ['plant/metrology-room', 'plant/interferometer', 'plant/stabilized-laser', 'plant/wet-bench'],
    steps: [
      {
        note_zh: '12 片两面研平行到 0.1 µm、面形 λ/4',
        performedBy: 'plant/grinder',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      { note_zh: '车 55.6° 座与 φ40 空心轴（轴孔与座面一次装夹：不同心就是端跳）', performedBy: 'lathe' },
      {
        note_zh: '装片；量消光比 ≥18 dB（两只片堆的差就是 Δ 的固定偏置，由标准片标掉）与端跳 ≤1.5 µm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '石英 2.5 + 45 钢 1.2 → 检偏器 1 件（约 2 kg）；磨料 2 与 4 kg 水走掉',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3.7 旋转头
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **旋转头：车蜗轮副与轴 → 铣标记盘 → 装同步电机与自整角机 → 调平衡。**
     *
     *   45 钢 2 + 铁 2 + 铜线 0.4 + 水 3 → 旋转头 1 件
     *
     * 它的三个数都不考"准"，考"稳"：
     *   speed 25 r/min（2.4 s/转）—— 36 点采样，每点 67 ms，够相敏检波积 6 个斩波周期
     *   speedStability ≤0.3 % —— **转内的速度变化就是角度的非线性**
     *   indexJitter ≤0.02° —— 每转一次的标记；A 与 A+180° 成对读数把它收到 0.005°
     *
     * ⚠️ 自整角机在这里读的是"转了多少"，不是"转到哪" —— 精度 0.1–0.5° 够用来做
     * 速度环，**不够用来定角度**（§三）。角度由时基给。
     */
    id: 'make/ellipsometer-rotary-head',
    name: '椭偏仪旋转头制造',
    rate: { hours: q(30) },
    produces: [
      {
        item: 'plant/ellipsometer/rotary-head',
        qty: q(1),
        gives: [
          { param: 'speed', kind: 'range', min: 20, max: 30 },
          { param: 'speedStability', kind: 'range', max: 0.3 },
          { param: 'runout', kind: 'range', max: 1.5 },
          { param: 'indexJitter', kind: 'range', max: 0.02 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/selsyn-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/photodiode-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(2) }] },
      { anyOf: [{ item: 'mat/iron-ht200', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(2, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(3) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车蜗轮副（40:1）与空心轴，磨轴颈到 0.005 mm', performedBy: 'lathe' },
      { note_zh: '铣标记盘（一条 0.5 mm 的缝）+ 标记光电管的座', performedBy: 'plant/milling-machine' },
      {
        note_zh:
          '装同步电机（1500 r/min ÷ 6 带轮 ÷ 10 蜗轮 = 25 r/min）与自整角机；静平衡到 0.5 g·mm；量标记抖动 ≤0.02°',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '45 钢 2 + 铁 2 + 铜线 0.4 → 旋转头 1 件（约 4.5 kg）；3 kg 水走掉',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3.8 变角臂
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **变角臂：铣两臂 → 车度盘与游标 → 装轴系 → 对零。**
     *
     *   铸铁 6 + 45 钢 2 + 铝 0.5 + 磨料 1 + 水 4 → 变角臂 1 件（入射 + 接收，两件一套）
     *
     * 度盘的做法是本层的老手艺：**1° 一格、20 分游标 ⇒ 0.05°**。
     * 为什么不再细：游标细分的极限是"刻线本身多直"，而手工刻线到 20′ 已经要
     * 每格 0.87 mm 的弧长（φ200）—— 再细就刻不出来了（0.05° 一格就是 0.17 mm）。
     *
     * ⚠️ 0.05° 折 0.015 nm 的假厚度（∂Δ/∂θ = 0.94 °/°、dΔ/dd = 3.14 °/nm），
     * 而目标 0.01 nm 要 0.03° —— **差 1.7 倍，是这一版最紧的一处**（D4）。
     * 变角本来就不是为了"更准"（§二②：两角只把 δd 从 1.35 压到 0.33），
     * 是为了**把工作点挪到陡的地方**（75° 上 dΔ/dd = 9.13，是 70° 的 2.9 倍）。
     */
    id: 'make/ellipsometer-goniometer',
    name: '椭偏仪变角臂制造',
    rate: { hours: q(36) },
    produces: [
      {
        item: 'plant/ellipsometer/goniometer',
        qty: q(2),
        gives: [
          { param: 'angleRange', kind: 'range', min: 45, max: 80 },
          { param: 'angleAccuracy', kind: 'range', max: 0.05 },
          { param: 'repeatability', kind: 'range', max: 0.015 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(6) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(4) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '铣两条臂（45–80° 的行程，45° 处留 5 mm 的越程）与轴承孔', performedBy: 'plant/milling-machine' },
      { note_zh: '车度盘（φ200、1° 一格）与 20 分游标；两臂的转轴一次装夹镗出', performedBy: 'lathe' },
      {
        note_zh: '装轴系与对零片：入射臂与接收臂的夹角用自准直对到 2×θ；回同一角度读数重复性 ≤0.015°',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '铸铁 6 + 45 钢 2 + 铝 0.5 → 变角臂 2 件（一套，约 8.5 kg）；磨料 1 与 4 kg 水走掉',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3.9 样品台
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **样品台：铣台面与 φ200 承片盘 → 车丝杠与消隙螺母 → 装自整角机与标尺。**
     *
     *   铝 12 + 45 钢 4 + 铜线 0.3 + 水 6 → 样品台 1 件
     *
     * 三样东西各有出处：
     *   承片盘    铝（轻；这里不要热惰性，要"转得快、不压弯"）
     *   X/Y 台    45 钢丝杠 + 消隙螺母（`laser-stage.ts` 的 carriage 同一条手艺）
     *   位置读数  **两把 `std/calibrated-scale-100`**（100 nm 刻线、1 m 长）：
     *             它不是给"准"用的（光斑 0.2 mm），是给**"同一片上下次还能回到那一点"**用的
     *
     * 为什么不用自整角机读位置：自整角机是**角度**传感器（0.1–0.5°），丝杠 2 mm/转
     * ⇒ 0.1° 就是 0.55 µm，比标尺的 100 nm 差 5 倍；而且它没有"绝对零"。
     */
    id: 'make/ellipsometer-sample-stage',
    name: '椭偏仪样品台制造',
    rate: { hours: q(48) },
    produces: [
      {
        item: 'plant/ellipsometer/sample-stage',
        qty: q(1),
        gives: [
          { param: 'stroke', kind: 'range', min: 200 },
          { param: 'positionAccuracy', kind: 'range', max: 15 },
          { param: 'scanPoints', kind: 'range', min: 49 },
          { param: 'rotation', kind: 'range', min: 0, max: 360 },
        ],
      },
    ],
    // 台面、丝杠、螺母、标尺、自整角机在条目 composedOf 上；铜线是接线，水是清洗。
    uses: [
      { anyOf: [{ item: 'mat/copper-wire', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(6) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '装 X/Y 丝杠、消隙螺母、承片台与两只自整角机；接铜线',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装两把标尺；扫 7 × 7 网格，量定位重复性 ≤15 µm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '铝 12 + 45 钢 4 + 铜线 0.3 → 样品台 1 件（约 18 kg）；6 kg 水走掉',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3.10 探测器
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **探测器：装两只光电管 → 1 MΩ 跨阻 → 动圈相敏检波 → 量噪声与带宽。**
     *
     *   光电管 2 + 运放 4 + 检流计 1 + 齐纳 2 + 薄膜电容 4 + 铜线 0.3 + 钢板 1.5 +
     *   铝 0.5 → 探测器 1 件
     *
     * **相敏检波是本层已有的手艺**：`plant/ir-endpoint/preamp` 用 `std/galvanometer-general`
     * 的动圈当乘法器，参考信号从同一只振荡器来（`flow-and-rf.ts:2071`、`:2104`）。
     * 这里只把 50 Hz 换成 1 kHz —— 因为激光的噪声在 100 Hz 以下是 1/f，
     * **而斩波频率就是"把信号搬到噪声低的地方去"的那个搬运工**。
     *
     * 三个数：
     *   noise ≤0.1 %（0.1 s 时间常数）—— 这是 §一① 预算表的第一行，整台机器的起点
     *   bandwidth ≥150 kHz
     *   channels 2（信号 + 参考）—— 参考那一路把源的漂移除掉，是 1 % → 0.1 % 的第二步
     */
    id: 'make/ellipsometer-detector',
    name: '椭偏仪探测器制造',
    rate: { hours: q(16) },
    produces: [
      {
        item: 'plant/ellipsometer/detector',
        qty: q(1),
        gives: [
          { param: 'noise', kind: 'range', max: 0.1 },
          { param: 'bandwidth', kind: 'range', min: 150 },
          { param: 'channels', kind: 'range', min: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/photodiode-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/galvanometer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(3, 2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    steps: [
      { note_zh: '装两只光电管（信号 + 参考）与 1 MΩ 跨阻；参考那只看分束片', performedBy: 'plant/robot' },
      {
        note_zh: '搭 1 kHz 相敏检波：动圈当乘法器 + 0.1 µF/33 kΩ 移相（移 6°，差 84° 才归零 ⇒ 相位容差很宽）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '量噪声：遮光读 0.1 s 时间常数下的峰峰值，折 ≤0.1 %；量带宽（方波上升沿）≥150 kHz',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '钢板 1.5 + 铝 0.5 + 铜线 0.3 → 探测器 1 件（约 2.5 kg）；电子件按件计，不折质量',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3.11 反演单元
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **反演单元：搭计数器与 100 kHz 时基 → 装 CPU 与 6 位显示 → 灌两条算法。**
     *
     *   CPU 1 + 计数器 2 + 石英 1 + 齐纳 1 + 铜线 0.2 + 酚醛板 0.5 + 钢板 1 → 反演单元 1 件
     *
     * **它灌进去的是两条算法，不是一个**（§四）：
     *   ① 36 点离散 Fourier ⇒ Ψ、Δ **闭式**，0.06 ms（实时，扫图与闭环走它）
     *   ② Gauss-Newton 2 参数 ⇒ (d, n) 同时拟合，0.3–1 s（报数走它）
     *
     * 为什么要把 ① 也装上：**如果只有 ②，这台机器就永远是"每点 1 s"**，
     * 49 点的图要 2.7 min，而 `rie.ts` 的终点检测要的是 0.1 s 一帧。
     * 两条算法装在两段程序里，是这台机器"能当量具、也能当传感器"的全部秘密。
     */
    id: 'make/ellipsometer-inverter',
    name: '椭偏仪反演单元制造',
    rate: { hours: q(20) },
    produces: [
      {
        item: 'plant/ellipsometer/inverter',
        qty: q(1),
        gives: [
          { param: 'fitTime', kind: 'range', max: 1 },
          { param: 'points', kind: 'range', min: 100 },
          { param: 'clock', kind: 'range', min: 100 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/cpu-32bit-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/quartz-resonator-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '搭 100 kHz 时基（石英 ÷10）与两只 16 位计数器（一轮 36 点、每点 67 ms）', performedBy: 'plant/robot' },
      { note_zh: '装 CPU 与 6 位显示（Ψ、Δ、d 三个数各两位小数）', performedBy: 'plant/robot' },
      {
        note_zh:
          '灌两条程序；用标准片的 Ψ/Δ 把零点钉住；量一次 100 点拟合的耗时（判 ≤1 s，与 0.3 s 的算账对得上）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '钢板 1 + 酚醛 0.5 + 铜线 0.2 → 反演单元 1 件（约 1.8 kg）；电子件按件计',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3.12 标准片（φ100、100 nm 干氧、XRR 定值）
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **标准片：干氧 100 nm → XRR 定值 → 装盒。**
     *
     *   硅片 1 + 氧 0.002 + 氮 0.05 + 水 2 → 标准片 1 片
     *
     * ⚠️ **定值的是 X 射线，不是椭偏自己** —— 这一条是整台机器的合法性来源：
     * 用椭偏定标椭偏是循环。XRR 给 0.3 %，椭偏拿它当零点。
     *
     *   100 nm 的膜：Kiessig 条纹间距 2θ = λ/(2d) = 0.154/200 = 7.7×10⁻⁴ rad = **0.044°/条**
     *   读 5 条（0.22° 的扫描范围）⇒ 厚度 ±0.3 nm
     *
     * 干氧的口径与 `gate-stack.ts:36` 同一句（Deal-Grove 线性区 2.2 nm/min）：
     * **100 nm = 45 min**，加上本层炉子升降温各 30 min ⇒ 一批 2 h。
     *
     * ⚠️ 氧的账：100 nm × φ100 的膜是 1.4 mg SiO₂，其中氧 0.74 mg；这里记 2 g，
     * 余下的是配气与吹扫的过供（与 `gate-stack.ts` 把氧记成"流过"是同一个口径）。
     *
     * **`plant/ellipsometer` 在 `needs` 里，不在 `performedBy` 里** ——
     * 理由写在 §六：95 台白名单不含第 96 台（`cmp-integration.ts:369` 同一个处理）。
     * 物理上它的位置是"标准片必须在本机上读数一致才发证"（属于"前提是设备"：
     * 前提是设备）。
     */
    id: 'make/ellipsometer-standard-wafer',
    name: '椭偏仪标准片制造',
    rate: { hours: q(2) },
    produces: [
      {
        item: 'plant/ellipsometer/standard-wafer',
        qty: q(1),
        gives: [
          { param: 'thickness', kind: 'range', min: 99.7, max: 100.7 },
          { param: 'uncertainty', kind: 'range', max: 0.3 },
          { param: 'diameter', kind: 'range', min: 100 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room', 'plant/interferometer', 'plant/comparator'],
    steps: [
      {
        note_zh:
          '干氧 100 nm：1000 °C、2.2 nm/min ⇒ 45 min；升降温各 30 min（本层炉子的常数，`make/cpu-32bit` 同一条）',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 900, max: 1200 }],
      },
      {
        note_zh:
          'XRR 定值：扫描 0–0.5°，读 5 条 Kiessig 条纹（0.044°/条）⇒ 厚度 ±0.3 nm；**这是整机的 Δ 零点**',
        performedBy: 'plant/xray-interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '硅片 1 片 + 氧 0.002 + 氮 0.05 + 水 2 → 标准片 1 片；氧全部进了膜（1.4 mg 的 SiO₂ 要 0.74 mg 的氧，余量是配气的过供），氮与水是吹扫与清洗',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3.13 光阑组
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **光阑组：车 4 档刀口光阑 → 装石英窗 → 装座。**
     *
     *   铝 0.2 + 45 钢 0.2 + 石英 0.1 + 水 1 → 光阑组 4 件
     *
     * 刀口要**薄而直**：φ0.2 mm 的通光孔在 300 mm 的光程上，孔边厚 0.2 mm 就会
     * 切掉一半的会聚光锥。所以刀口是 0.5 mm 的 45 钢片，用研磨而不是车削做刃口。
     *
     * 为什么最小只到 φ0.2 mm：**没有显微物镜**。再小就是"用光阑抠光斑"，
     * 而抠到 0.1 mm 时衍射（λ/0.1 mm = 5 mrad）与孔边的散射会把 Ψ/Δ 拖走（D7）。
     */
    id: 'make/ellipsometer-aperture',
    name: '椭偏仪光阑组制造',
    rate: { hours: q(10) },
    produces: [
      {
        item: 'plant/ellipsometer/aperture',
        qty: q(4),
        gives: [
          { param: 'spotSize', kind: 'range', min: 200, max: 1500 },
          { param: 'steps', kind: 'range', min: 4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车四只座与刀口毛坯（φ2/1/0.5/0.2 mm 四个孔）', performedBy: 'lathe' },
      { note_zh: '研磨刃口（0.5 mm 片厚，刃口 <0.02 mm）；量四个孔的同心与椭圆度', performedBy: 'plant/robot' },
      {
        note_zh: '装石英窗（φ25 × 3 mm，两面研平行）；死区与散射用一片哑片读一次背景',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '铝 0.2 + 45 钢 0.2 + 石英 0.1 → 光阑组 4 件（约 0.6 kg）；1 kg 水走掉',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 四、出口
// ═══════════════════════════════════════════════════════════════════════════

export const ELLIPSOMETER_ITEMS: readonly Item[] = [
  ...ELLIPSOMETER_PARTS,
  ELLIPSOMETER,
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ELLIPSOMETER_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/ellipsometer',
    name: '椭偏仪装配',
    produces: [{
      item: 'plant/ellipsometer',
      qty: q(1),
      gives: [
      { param: 'thicknessAccuracy', kind: 'range', min: 0, max: 0.05, dir: 'atMost' },
      { param: 'thicknessRange', kind: 'range', min: 1, max: 1000 },
      { param: 'nAccuracy', kind: 'range', min: 0, max: 0.02, dir: 'atMost' },
      { param: 'spotSize', kind: 'range', min: 100, max: 2000 },
      { param: 'angleRange', kind: 'range', min: 45, max: 80 },
      { param: 'measureTime', kind: 'range', min: 0, max: 60, dir: 'atMost' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...ELLIPSOMETER_ROUTES, ...ASSEMBLY_ROUTES];
