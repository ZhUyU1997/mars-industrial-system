/**
 * AFM（原子力显微镜）+ 1/10 nm 台阶标准件 —— 把两处「没有」补成「有」。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、这一份解的两处薄弱
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① `measure/tip-radius` 只有 SEM 顶视反卷积，不确定度 **15–25 %**，
 *      原因是全表 `plant/afm` 0 条（`metrology-cal.ts` 第一段自己写死的降级）。
 *   ② `measure/profiler-vertical-cal` 的 1/10 nm 两档**没有独立标准件**，
 *      靠 0.1 nm 标准的多周期叠加 + X 射线借标尺（同一份文件第三节）。
 *
 * 本文件造：
 *
 *   `plant/afm`（台）          整机，按 `composedOf` 装配（与 `plant/interferometer`、
 *                              `plant/cd-sem` 同一形状：机器只交定义，零件各有 make 路线）
 *   `plant/afm/scanner`        管式 PZT 扫描器 φ8 × 60 mm、壁 0.25 mm、3 轴闭环
 *   `plant/afm/optical-lever`  770 nm 激光 + 4 只 `std/photodiode-general` 四象限 + 聚焦镜
 *   `plant/afm/feedback`       模拟 PID + 高压接口 + 16 位读出
 *   `plant/afm/isolation`      4 簧 + 涡流阻尼
 *   `plant/afm/base`           铸铁基座 + 三点调平 + 粗调 Z
 *   `std/afm-cantilever`       Si 探针，k 0.01–40 N/m、f0 10–300 kHz、尖端 5–10 nm、镀金
 *   `std/laser-diode-770nm`    780 nm 窗口内的 GaAs/AlGaAs 激光二极管（实际 770 nm）
 *   `std/step-standard-1nm-10nm`  1.0 ± 0.05 nm / 10 ± 0.2 nm 台阶标准件（含 make 路线）
 *
 * 测量路线在 `data/measure/afm.ts`（R13：measure/* 与 *-record 只放 measure）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、光杠杆：悬臂弯 1 nm → 光斑走 1.0 µm（放大 1000 倍）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 矩形悬臂末端受集中力时，末端斜率与挠度的关系是
 *
 *   θ = 3δ/(2L)          δ = 端部挠度，L = 悬臂长
 *   反射光转 2θ ⇒ 光斑位移  x = 2θD = 3δD/L
 *
 * 本机取 **L = 150 µm、D = 50 mm**（D 是悬臂到四象限探测器的光程）：
 *
 *   x/δ = 3 × 50 mm / 150 µm = **1000**
 *   δ = 1 nm ⇒ **x = 1.0 µm**
 *
 * 这不是「随便选一个放大倍数」：D 受光路长度限制（50 mm 是基座能装下的），
 * L 受 k 与 f0 限制（§五），1000 倍是这两条线的交点。L = 100 µm 能到 1500 倍，
 * 但 k 与 f0 的窗口会窄一档；L = 300 µm 只有 500 倍，1 nm 只走 0.5 µm，
 * 探测器上的信噪比掉一半。
 *
 * ── 探测器：四象限的散粒噪声决定「1 nm 能不能看见」────────────────────────
 *
 * 聚焦：f = 50 mm 的平凸镜把 φ2 mm 的入射束聚到悬臂背面，
 *   w0 = λf/(πw) = 770 nm × 50 mm / (π × 1 mm) = **12 µm**（半宽）
 *   悬臂宽 30 µm > 2w0 = 24 µm，光斑能整个落在金膜上；
 *   回程 50 mm 后束半宽 w = λD/(πw0) = 770e-9 × 0.05/(π × 12e-6) = **1.02 mm**
 *
 * 探测器收到 P = 100 µW（激光 3 mW，用光阑/离焦衰减到 100 µW 的工作点，
 * 避免四象限饱和；散粒噪声 ∝ √P，P 再大 10 倍也只降 3.2 倍），
 * Si 光电二极管在 770 nm 的响应度 R ≈ 0.5 A/W ⇒ **I = 50 µA**。
 *
 *   散粒噪声（B = 1 Hz）：i_n = √(2eI) = √(2 × 1.602e-19 × 50e-6) = **4.0 pA/√Hz**
 *   相对噪声：4.0e-12 / 50e-6 = **8.0e-8 /√Hz**
 *   四象限归一化差信号 S = erf(x/(√2 w)) ⇒ dS/dx = √(2/π)/w = 0.798/w
 *   探测器上的位置噪声：x_n = 8.0e-8 × w/0.798 = 8.0e-8 × 1.02 mm/0.798
 *                              = **0.102 nm/√Hz**
 *   折回悬臂（÷1000）：**0.10 pm/√Hz**
 *
 * 带宽一开大，这个数就乘 √B：
 *
 *   B = 1 kHz    → 探测器 3.2 nm、悬臂 **3.2 pm**
 *   B = 10 kHz   → 10 nm、**10 pm**
 *   B = 100 kHz  → 32 nm、**32 pm**
 *
 * 激光的强度噪声 RIN ≈ 1e-5/√Hz 不按位置噪声算：四象限是**差分**读出，
 * 共模强度起伏被通道匹配（1 %）压到 1e-7/√Hz ⇒ 悬臂上 0.125 pm/√Hz，
 * 1 kHz 下 4 pm，比散粒噪声还小一档。**所以 1 nm 的弯曲在 1 kHz 下
 * 信噪比 1 nm / 3.2 pm = 312**，不是「刚好看见」。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、热噪声：√(k_BT/k) 是总振幅，带宽内的值小两个量级
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 能量均分给的是**总**均方位移：
 *
 *   ⟨δz²⟩ = k_BT/k ⇒ δz_rms = √(k_BT/k)
 *
 * 293 K（20 °C）时 k_BT = 1.381e-23 × 293 = **4.04e-21 J**：
 *
 *   k (N/m)    0.01    0.1    0.33    1      2      10     40
 *   δz (nm)    0.64    0.20   0.11    0.064  0.045  0.020  0.010
 *
 * 这组数看着比 0.05 nm 大，但它几乎全部集中在**共振峰**上。AFM 的 Z 反馈
 * 工作在 f ≪ f0，离共振的位移功率谱是
 *
 *   S_z(0) = 4k_BT/(k Q ω0)        （m²/Hz，单边）
 *
 * 设计点 k = 0.33 N/m、Q = 100、f0 = 57.7 kHz：
 *
 *   S_z = 4 × 4.04e-21 / (0.33 × 100 × 2π × 5.77e4) = 1.35e-27 m²/Hz
 *   √S_z = 3.7e-14 m/√Hz = **0.037 pm/√Hz**
 *   1 kHz → **1.2 pm**；100 kHz → **12 pm**
 *
 * 最软的针 k = 0.01 N/m（f0 = 10.8 kHz、Q = 100）：
 *
 *   √S_z = 0.49 pm/√Hz ⇒ 1 kHz → 15 pm；**100 kHz → 0.15 nm**
 *
 * **这条要写清：0.05 nm 的 Z 噪声在 k ≥ 0.03 N/m、10 kHz 内成立；
 * k = 0.01 N/m 的针在 100 kHz 带宽下热噪声就 0.15 nm，已经越过 0.05 nm。**
 * 成像用 1–10 kHz 线频（§三），所以实际工作点没事；100 kHz 是放大器上限，
 * 不是成像带宽。这是本机第一条「指标不能脱离针」的边界。
 *
 * 力噪声 = k × 光杠杆噪声（1 kHz 的 3.2 pm）：
 *
 *   k = 0.01 → 0.032 pN      k = 0.33 → 1.1 pN
 *   k = 1    → 3.2 pN        k = 3    → 9.6 pN
 *   k = 40   → 128 pN
 *
 * **「力分辨 <10 pN」只在 k ≤ 3 N/m（1 kHz）成立**；40 N/m 的硬针在同样的
 * 读出噪声下是 128 pN。这不是设计失误，是力 = k × 位移的直接后果；
 * 要硬针也到 10 pN，得把读出噪声再压 13 倍（或把带宽降到 6 Hz）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、Z 噪声与 1 nm 台阶：0.05 nm 是 5 %，靠平均与差分压到 2 %
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 0.05 nm / 1 nm = **5 %/点**。台阶不是单点读数：一条 10 µm 线 256 点、
 * 100 条线 = 25 600 点 ⇒ 白噪声 0.05/√25600 = **0.3 pm**。真正的底不是白噪声，
 * 是**漂移**与**非线性**：
 *
 *   漂移：50 mm 的铁基座 CTE 12e-6/K ⇒ **0.6 µm/K**。19–21 °C 的 ±1 K 是
 *     房间的**窗口**，不是短期稳定度；按 0.01 K/min 估，1 min 漂 6 nm。
 *     1 nm 台阶若按 1 µm/s 慢扫，一条线就吃掉 0.1 nm —— 所以本机用
 *     **10 Hz 线频（100 µm/s）**，10 µm 线 0.1 s ⇒ 漂移 0.01 nm；
 *     再把 A–C、B–C 两个平台放在**同一条扫描线**上做差分，线性漂移共模扣掉，
 *     残余按 **0.01 nm** 记（设计值）。
 *   非线性：扫描器全行程 0.5 %（10 µm 上 50 nm）；1 nm 台阶只走 1 nm 的
 *     局部段，按 16 点标定表的分段残差 **0.1 % = 1 pm** 记。
 *   热噪声（§二）：1 kHz 内 1.2 pm。
 *
 * 与 X 射线（`plant/xray-interferometer`，0.1 nm = 0.319 个 (111) 条纹，
 * 八帧相位 11° ⇒ 0.01 nm）合成：
 *
 *   1 nm：√(0.01² + 0.01²) = **0.014 nm = 1.4 %**（标准 ±5 %，余量 3.5×）
 *   10 nm：√(0.05² + 0.01²) = **0.051 nm = 0.51 %**（标准 ±2 %，余量 3.9×）
 *
 * **0.05 nm 的 Z 噪声不是「1 nm 的 5 % 所以测不了」**：单点 5 %、25600 点
 * 平均 0.3 pm，剩下的是漂移（用差分与快扫压）与非线性（用标定表压）。
 * 1 nm 档的不确定度 1.4 % 来自漂移 0.01 nm，不来自传感器噪声。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、扫描器：管式 PZT φ8 × 60 mm、壁 0.25 mm，500 V 给 219 µm
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 四象限外电极 + 内电极的经典管式扫描器。横向偏转（对置两象限 ±V）：
 *
 *   δ = 2√2 · d31 · L² · V / (π · D · t)
 *
 *   d31 = 270 pm/V（PZT-5H 量级；本层 `plant/pzt-stage/pzt-ceramic` 的
 *        d33 350–500 pm/V，d31 ≈ 0.4 d33）
 *   L = 60 mm、D = 8 mm、t = 0.25 mm、V = 500 V：
 *   δ = 2×1.414 × 270e-12 × 3.6e-3 × 500 / (π × 8e-3 × 2.5e-4)
 *     = **219 µm**
 *
 * 所以 1–100 µm 的窗口只用 230 V 就够；500 V 是**留 2.2 倍余量**（温度、
 * 老化、批次 d31 差异）。轴向（内电极）：
 *
 *   ΔL = d31 · L · V / t = 270e-12 × 0.06 × 500 / 2.5e-4 = **32.4 µm**
 *   1–10 µm 的 Z 窗口用 155 V，余量 3.2×。
 *
 * 非线性：开环 PZT 的迟滞 10–15 %（`phase-shifter.ts` 自己写过）。本机
 * 用 **3 只 `plant/pzt-stage/capacitive-sensor`（0.05–0.2 nm、1–10 kHz、
 * 线性 0.01–0.1 %）**做 X/Y/Z 闭环，闭环后非线性 <0.5 %；0.5 % 不是 PZT
 * 的性质，是**传感器的线性度 + 标定表残差**。Z 噪声 0.05 nm 也来自这只
 * 传感器，不来自光杠杆（光杠杆只管悬臂挠度/力）。
 *
 * 机械共振：60 mm 管的一阶弯曲约 1–2 kHz（管壁 0.25 mm，质量 2.7 g），
 * 所以**闭环带宽取 1 kHz**，不是 100 kHz。100 kHz 是 PID 的小信号带宽
 * （§七 D2），真正限制环路的是高压驱动（`plant/pzt-stage/driver` 1–10 kHz）
 * 与管子的机械共振。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、探针：Si，k = Ewt³/(4L³)、f0 = 0.162 t/L² √(E/ρ)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * E_Si = 150 GPa、ρ = 2330 kg/m³ ⇒ √(E/ρ) = 8022 m/s。四条代表几何：
 *
 *   L (µm)  w (µm)  t (µm)   k (N/m)   f0 (kHz)
 *   300     20      0.75      0.0117    10.8
 *   150     30      1.0       0.333     57.7
 *   150     30      2.0       2.67      115
 *   300     40      9.0       40.0      130
 *
 * **k 与 f0 不是两个独立旋钮**：k ∝ t³/L³、f0 ∝ t/L²，给定 k 后 f0 ∝ 1/L。
 * 所以「k 0.01–40 N/m、f0 10–300 kHz」是一片**可达区**，不是任意组合都能取；
 * 本文件给的是覆盖四角的四条几何。反例：k=40、f0=10 kHz 在同一根针上不共存
 * ——那要 L ≈ 3.9 mm、t ≈ 116 µm，已经不是悬臂而是梁。这一条写在这里，
 * 免得后面有人拿「k=40、f0=10 kHz」来要求同一根针。
 *
 * 尖端 5–10 nm 的做法：KOH 各向异性在 SiO₂ 掩模点下留出 Si 金字塔，
 * 再**热氧化锐化**——1000 °C 干氧长 180 nm，尖端凸角的氧化层受应力抑制、
 * 比平面薄，HF 剥掉后尖端曲率半径从 20–30 nm 收到 **5–10 nm**
 * （Earth 工程值：Marcus–Sheng 的氧化锐化，工业 AFM 针尖的常规做法）。
 * 镀金：背面 Ti 5 nm 附着 + Au 30 nm 反射。质量负载 25 %（Au 19.3 × 30 nm
 * 对 Si 2.33 × 1000 nm），f0 降约 12 % —— 表里的 f0 是**镀金后**的值。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、隔振：4 簧 2 Hz + 涡流 Q≈4
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 65Mn 簧：D_mean = 20 mm、d = 2 mm、n = 10 圈
 *   k = G d⁴/(8 D³ n) = 79.3e9 × 1.6e-11/(8 × 8e-6 × 10) = **1983 N/m/簧**
 *   4 簧 7932 N/m，m = 50 kg ⇒ f0 = √(k/m)/(2π) = **2.0 Hz**（窗口 0.5–5 Hz）
 *
 * 涡流：铜板 100 × 100 × 3 mm 在 0.3 T 气隙里
 *   c = σ B² A t = 5.96e7 × 0.09 × 0.01 × 0.003 = **161 N·s/m**
 *   c_c = 2√(km) = 1260 ⇒ ζ = 0.128、Q = 3.9
 *   10 Hz 传递率 = 1/|1 − (10/2)²| = **0.042（−27.5 dB）**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 七、台阶标准件：为什么是 ALD + 光刻，不是热氧化
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 题目给了两条路：「Si 上热氧化台阶（1/10 nm 用不同氧化时间）或 ALD + 光刻」。
 * 本文件选 **ALD + 光刻**，理由是数：
 *
 *   热氧化：Deal-Grove 900 °C 干氧的线性段 B/A ≈ 30 nm/h ⇒ 1 nm 理论 2 min。
 *     但 native oxide 本身 1.5–2 nm，1 nm 落在**初始快速段**里，时间-厚度
 *     不是线性；±0.05 nm（±5 %）要求 ±6 s 的炉温/进舟控制，本层扩散炉
 *     （`plant/diffusion-furnace`，900–1200 °C、整批进舟）给不出。1 nm 端
 *     实际是 ±20–30 %。**所以热氧化只能做 10 nm 档，做不了 1 nm 档的 ±5 %。**
 *   ALD：HfO₂ 的 GPC 0.09–0.1 nm/周期（`std/step-standard-0.1nm` 已经用
 *     25 周期 = 2.0 nm 标过 GPC）；10 周期 = 0.9–1.0 nm、100 周期 = 9–10 nm。
 *     周期数是**数字**，不是炉时；±0.05 nm 就是 ±0.5 个周期，靠 GPC 标定
 *     （椭偏仪 2.0 ± 0.05 nm）+ 片内均匀性 1 %（±0.01 nm）兜住。
 *
 * 台阶怎么做（两次 lift-off，不用刻蚀 HfO₂）：
 *
 *   ① 清洗 + HF 剥 native oxide；
 *   ② 蒸发 Al 50 nm 牺牲层；
 *   ③ 光刻 A 区 5 × 5 mm 开窗，HCl 湿法刻 Al（HfO₂ 不被 HCl 侵蚀）；
 *   ④ 去胶后 ALD **10 周期 = 1.0 nm**（200–250 °C、20–60 Pa）；
 *   ⑤ HCl 剥 Al，Al 上的 HfO₂ 一起掀掉 ⇒ A 区留 1.0 nm、C 区 0；
 *   ⑥ 第二次：蒸 Al、光刻 B 区（A 区被 Al 盖住保护）、HCl 开窗；
 *   ⑦ ALD **90 周期 = 9.0 nm** 叠在 B 区的 1.0 nm 上 ⇒ B 区 10.0 nm；
 *   ⑧ HCl 剥 Al ⇒ A = 1.0、B = 10.0、C = 0，三块平台在同一片上。
 *
 * 为什么不是「ALD 完再刻蚀」：1 nm 的 HfO₂ 用 RIE 刻，过刻 20 % 就是 0.2 nm，
 * 而且 HfO₂/Si 的选择比不好；lift-off 把图形定义在 Al 上，HfO₂ 只**长**在
 * 开窗里，不存在「刻过头」这一项。代价是 Al 掩模要两次光刻（工时翻倍），
 * 这一条记在降级 D4 里。
 *
 * 定值：AFM（`data/measure/afm.ts` 的 `measure/step-height-afm`）测 1/10 nm，
 * X 射线干涉仪读同一台阶（0.1 nm = 0.319 条纹，11° ⇒ 0.01 nm），两者差 <2 %。
 * 交付 1.0 ± 0.05 nm / 10 ± 0.2 nm；1 nm 端不确定度 0.014 nm（1.4 %），
 * 10 nm 端 0.051 nm（0.51 %）。**没有 CNAS 证书，全部是设计值。**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 八、降级与升级（R8：八处，一一对应）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ┌──┬─────────────────────────────────┬───────────────────────────┬──────────────────────────────────┐
 * │  │ 降级                            │ 代价（带数）              │ 升级（R8）                       │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D1│ 横向**形貌**分辨 5–10 nm         │ 1 nm 台阶的边被针尖抹成    │ 碳纳米管针尖（尖端 1–2 nm；      │
 * │  │ （针尖 5–10 nm 的卷积）         │ 2√(2Rh)：1 nm 台阶 6.3 nm、│ `std/cnt-tip` 全表 0 条）        │
 * │  │                                 │ 10 nm 台阶 20 nm           │                                  │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D2│ 闭环带宽 1 kHz（不是 100 kHz）   │ PID 100 kHz 被高压驱动     │ 更快的高压放大（>100 kHz、500 V）│
 * │  │                                 │ 1–10 kHz 与管共振卡住      │ 与更短的管（L 30 mm、δ 掉 4×）   │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D3│ 力分辨 10 pN 只到 k ≤ 3 N/m      │ k=40 N/m 时 128 pN         │ 读出噪声再压 13×（更高功率/        │
 * │  │                                 │                           │ 更好探测器）或带宽降到 6 Hz      │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D4│ 1 nm 端不确定度 0.014 nm（1.4 %）│ 标准 ±5 % 有 3.5× 余量；    │ RTO 秒级氧化 + 主动隔振 +        │
 * │  │ 来自框架漂移 0.6 µm/K            │ 与 X 射线差 1.4 %（判据 2 %）│ 0.01 K 恒温（本层没有）          │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D5│ 管式 PZT 手工干压 + 磨          │ 壁厚 0.25 ± 0.01 mm，      │ 等静压/挤出成型 + 无心磨        │
 * │  │                                 │ 良率按 50 % 记             │ （要连续式窑，本层没有）         │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D6│ 隔振 f0 = 2 Hz（窗口 0.5–5）     │ 0.5 Hz 要 4× 更软的簧     │ 主动隔振（压电/音圈 + 传感器）   │
 * │  │                                 │ （d 1.4 mm，易失稳）       │ 本层没有                         │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D7│ 激光做 770 nm，不是 650 nm       │ 窗口 650–780 只用到 770 端│ AlGaInP 650 nm（要 In/P 链，     │
 * │  │                                 │ 短波端 0 条               │ `mat/trimethyl-indium` 有，P 链  │
 * │  │                                 │                           │ 没有 650 nm 的 AlGaInP 外延）    │
 * ├──┼─────────────────────────────────┼───────────────────────────┼──────────────────────────────────┤
 * │D8│ 标准件只覆盖 1/10 nm 两档        │ 0.5–50 nm 的 AFM 量程里    │ 多台阶标准（0.5/5/50 nm 三档，   │
 * │  │                                 │ 0.5–1 nm 与 10–50 nm 无标准│ 每档多一次 ALD + 光刻）          │
 * └──┴─────────────────────────────────┴───────────────────────────┴──────────────────────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 九、已知缺口（都是「现在没有」，不是「暂未实现」）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **碳纳米管/1–2 nm 针尖 0 条** ⇒ D1 的 5–10 nm 形貌分辨是针尖的底，
 *      不是 1–5 nm。`plant/afm` 的 `lateralResolution` 1–5 nm 是**扫描器的
 *      定位分辨**（1 µm 场 / 256 点 = 3.9 nm/点；电容传感器 0.05 nm 的闭环
 *      定位），不是「能看 1 nm 的形貌」。这两件事必须分开读。
 *   ② **650 nm 端没有 AlGaInP**：本机做 770 nm 的 GaAs/AlGaAs（D7）。
 *   ③ **主动隔振与 0.01 K 恒温没有**：19–21 °C 是 `plant/metrology-room` 的
 *      窗口，短期漂移按 0.01 K/min 估（§三），不是实测。
 *   ④ **1 nm 端的热氧化路线没有做**：本文件走 ALD lift-off（§七）；热氧化
 *      的 2 min/1 nm 控制不住，是**没选它**，不是不存在。
 *   ⑤ **没有 AFM 原厂证书 / CNAS**：全部设计值（Earth 工程值），
 * 没有 `data/measure/` 的读数不写「闭合」。
 *   ⑥ **PZT 管的 d31 没有实测**：270 pm/V 是 PZT-5H 的公开量级，
 *      本层 `plant/pzt-stage/pzt-ceramic` 只声明 d33 350–500 pm/V。
 *      行程 219 µm 的设计余量 2.2× 就是给这一条留的。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 十、接线：主 agent 要改的那几行（本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① `tools/report/data.ts` 加 import：
 *      `import { AFM_ITEMS, AFM_ROUTES } from '../../data/machine/afm.ts';`
 *      `import { AFM_MEASURE_ITEMS, AFM_MEASURE_ROUTES } from '../../data/measure/afm.ts';`
 *   ② `items:` 里加 `...AFM_ITEMS, ...AFM_MEASURE_ITEMS`；
 *      `routes:` 里加 `...AFM_ROUTES, ...AFM_MEASURE_ROUTES`。
 *   ③ `data/measure/metrology-cal.ts` 的注释已改成「SEM 顶视 15–25 % 保留；
 *      AFM 5–8 % 是新主路径」，并改了一条 note_zh（1/10 nm 独立标准件已存在）。
 *      **没有改它的 needs** —— 注册前加 `std/step-standard-1nm-10nm` 会报
 *      unknown_item；两个新文件注册后，主 agent 可选加：
 *      `needs: ['plant/xray-interferometer', 'plant/metrology-room', 'std/step-standard-1nm-10nm']`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、零件
// ═══════════════════════════════════════════════════════════════════════════

export const AFM_ITEMS: readonly Item[] = [
  /**
   * **管式 PZT 扫描器。φ8 × 60 mm、壁 0.25 mm、三轴闭环。**
   *
   * 四象限外电极做 X/Y，内电极做 Z；500 V 的横向偏转 219 µm、轴向 32.4 µm
   * （§四）。交付窗口 1–100 µm（X/Y）与 1–10 µm（Z），用 230 V / 155 V 就够，
   * 余量 2.2× / 3.2×。
   *
   * 三个数：
   *   zNoise        0.03–0.05 nm  来自 3 只 `plant/pzt-stage/capacitive-sensor`
   *                               （0.05–0.2 nm、1–10 kHz）的闭环噪声
   *   nonlinearity  0.2–0.5 %     闭环后；开环 PZT 是 10–15 %
   *   outerDiameter 7.5–8.5 mm    φ8 是四个象限各 3 mm 宽、壁 0.25 mm 的折中
   *
   * ⚠️ 非线性 0.5 % 不是「PZT 做好了」：它是**电容传感器线性度
   * （0.01–0.1 %）+ 16 点标定表残差**。没有传感器时这只管子是 10–15 %。
   */
  {
    id: 'plant/afm/scanner',
    name: 'AFM Tube PZT Scanner', name_zh: 'AFM 管式 PZT 扫描器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'outerDiameter', kind: 'range', min: 5, max: 10, unit: 'mm' },
      { param: 'xyRange', kind: 'range', min: 1, max: 100, unit: 'µm' },
      { param: 'zRange', kind: 'range', min: 1, max: 10, unit: 'µm' },
      { param: 'zNoise', kind: 'range', min: 0, max: 0.05, unit: 'nm', dir: 'atMost' },
      { param: 'nonlinearity', kind: 'range', min: 0, max: 0.5, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * **光杠杆：770 nm 激光二极管 + 4 只 `std/photodiode-general` 拼的四象限 + 聚焦镜。**
   *
   * 几何：f = 50 mm 聚焦到悬臂背面（w0 = 12 µm），回程 50 mm（w = 1.02 mm）；
   * D/L = 50 mm / 150 µm ⇒ 放大 **1000 倍**（1 nm 挠度 → 1.0 µm 光斑位移，§一）。
   *
   *   leverGain 950–1050      实测装配后的 D/L；D 用钢直尺量到 ±0.5 mm
   *                           ⇒ 增益 ±1 %，取 5 % 窗口
   *   spotSize  12–24 µm      悬臂背面的 2w0；大于悬臂宽 30 µm 就会漏光
   *   wavelength 765–775 nm   770 nm 激光二极管（650–780 窗口内，D7）
   *
   * 四象限不是买来的：4 只 `std/photodiode-general` 贴在同一块铝座上，
   * 中间 20 µm 十字掩模 —— 这是「复用标准件」而不是「假设有四象限管」。
   */
  {
    id: 'plant/afm/optical-lever',
    name: 'AFM Optical Lever', name_zh: 'AFM 光杠杆',
    unit: '件',
    category: 'part',
    props: [
      { param: 'wavelength', kind: 'range', min: 650, max: 780, unit: 'nm' },
      { param: 'leverGain', kind: 'range', min: 800, max: 1200, unit: '×' },
      { param: 'spotSize', kind: 'range', min: 10, max: 30, unit: 'µm' },
    ],
  },

  /**
   * **模拟 PID + 高压接口 + 16 位读出。**
   *
   * 为什么是模拟不是数字：数字 PID 要 ADC/DAC/CPU 与 1–100 kHz 的采样，
   * 本层的 `std/cpu-32bit-general` 有（`make/cpu-32bit`），但数字环的
   * 1–100 kHz 需要 16 位、>200 kS/s 的 ADC —— 那是另一条链。模拟 PID
   * 用 4 片 `std/opamp-chip-general`（GBW 1 MHz）就能做到 100 kHz 小信号
   * 带宽，且没有量化噪声。
   *
   *   bandwidth        1–100 kHz   小信号；真正闭环受高压驱动（1–10 kHz）限制（D2）
   *   forceResolution  0.03–10 pN  k=0.01 时 0.032 pN、k=3 时 9.6 pN（1 kHz）；
   *                                k=40 时 128 pN —— 见 §二，指标随针走
   *   pidType          analog      没有数字环
   */
  {
    id: 'plant/afm/feedback',
    name: 'AFM Feedback Controller', name_zh: 'AFM 反馈控制器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'bandwidth', kind: 'range', min: 1, max: 100, unit: 'kHz' },
      { param: 'forceResolution', kind: 'range', min: 0, max: 10, unit: 'pN', dir: 'atMost' },
      { param: 'pidType', kind: 'enum', values: ['analog', 'digital'] },
    ],
  },

  /**
   * **隔振：4 根 65Mn 簧 + 铜板涡流阻尼。**
   *
   * f0 = 2.0 Hz（4 簧 7932 N/m、m = 50 kg），Q = 3.9（c = 161 N·s/m，
   * c_c = 1260），10 Hz 传递率 0.042（−27.5 dB），§六。
   *
   *   naturalFrequency 1.5–2.5 Hz  窗口 0.5–5 Hz；0.5 Hz 要更软的簧（D6）
   *   qualityFactor    3–5
   *   transmissibility 0.03–0.06   10 Hz 处
   */
  {
    id: 'plant/afm/isolation',
    name: 'AFM Vibration Isolation', name_zh: 'AFM 隔振',
    unit: '件',
    category: 'part',
    props: [
      { param: 'naturalFrequency', kind: 'range', min: 0.5, max: 5, unit: 'Hz' },
      { param: 'qualityFactor', kind: 'range', min: 2, max: 10, unit: '1' },
      { param: 'transmissibility', kind: 'range', min: 0.01, max: 0.2, unit: '1' },
    ],
  },

  /**
   * **基座：HT250 铸铁 30 kg + 三点调平 + 粗调 Z。**
   *
   * 它决定两件事：
   *   ① 热漂移：50 mm 的铁基座 CTE 12e-6/K ⇒ 0.6 µm/K（§三）；
   *      所以基座不高、探针与样品同在一根 50 mm 的短路径上，差分测量扣共模。
   *   ② 粗调：差动螺丝 0.1 mm/转 + 三点调平 ±1 mm；扫描器只有 10 µm 的 Z，
   *      没有粗调就贴不上样品。
   *
   * 不写 props：它的规格（30 kg、50 mm 路径）是结构，不是可交付的属性窗口；
   * 写成 props 反而要每条产出路线都给窗口，那是把结构当规格。
   */
  {
    id: 'plant/afm/base',
    name: 'AFM Base', name_zh: 'AFM 基座',
    unit: '件',
    category: 'part',
  },

  /**
   * **Si 探针（标准件）。k 0.01–40 N/m、f0 10–300 kHz、尖端 5–10 nm、镀金。**
   *
   * 几何与 k/f0 的四条代表见 §五。尖端：KOH 金字塔 + 热氧化锐化
   * （180 nm 氧化、HF 剥）⇒ 5–10 nm；背面 Ti 5 nm + Au 30 nm 反射，
   * 质量负载 25 %，f0 已按镀金后记。
   *
   * ⚠️ k 与 f0 是耦合的（k ∝ t³/L³、f0 ∝ t/L²）：这是**一片可达区**，
   * 不是任意组合。k=40、f0=10 kHz 的同一根针不存在。
   */
  {
    id: 'std/afm-cantilever',
    name: 'Si Probe', name_zh: 'Si 探针',
    unit: '件',
    category: 'part',
    props: [
      { param: 'stiffness', kind: 'range', min: 0.01, max: 40, unit: 'N/m' },
      { param: 'resonance', kind: 'range', min: 10, max: 300, unit: 'kHz' },
      { param: 'tipRadius', kind: 'range', min: 5, max: 10, unit: 'nm', dir: 'atMost' },
      { param: 'length', kind: 'range', min: 50, max: 300, unit: 'µm' },
      { param: 'coating', kind: 'enum', values: ['au', 'al'] },
    ],
  },

  /**
   * **770 nm GaAs/AlGaAs 激光二极管。**
   *
   * 为什么是 770 不是 870：`plant/oes-line-source/laser-chip` 是 870 nm
   * （GaAs 有源层），不在 650–780 窗口里；770 nm 要把有源层换成
   * Al₀.₁₅Ga₀.₈₅As（Eg 1.61 eV），MOCVD 的 TMAl 配比从 0.35 降到 0.20。
   * 这是**同一条 MOCVD 线的另一个配方**，不是另一台机器。
   *
   *   wavelength       765–775 nm  ±5 nm（25 °C；0.3 nm/K 的温漂不算在内）
   *   outputPower      3–15 mW     AFM 只要 3 mW；15 mW 是余量
   *   thresholdCurrent 40–80 mA    条宽 50 µm、腔长 500 µm（比 870 的 100/750 小）
   *   package          to-18        不是 C-mount：光杠杆要小
   */
  {
    id: 'std/laser-diode-770nm',
    name: '770 nm GaAs/AlGaAs Laser Diode', name_zh: '770 nm GaAs/AlGaAs 激光二极管',
    unit: '件',
    category: 'part',
    props: [
      { param: 'wavelength', kind: 'range', min: 650, max: 780, unit: 'nm' },
      { param: 'outputPower', kind: 'range', min: 2, max: 20, unit: 'mW' },
      { param: 'thresholdCurrent', kind: 'range', min: 20, max: 100, unit: 'mA', dir: 'atMost' },
      { param: 'package', kind: 'enum', values: ['to-18', 'c-mount'] },
    ],
  },

  /**
   * **1/10 nm 台阶标准件（件）。1.0 ± 0.05 nm / 10 ± 0.2 nm。**
   *
   * 一片上三块平台：A = 1.0 nm、B = 10.0 nm、C = 0（裸 Si），
   * ALD HfO₂ 两次 lift-off（§七）。AFM 与 X 射线互证。
   *
   *   stepHeight1   0.98–1.02 nm   交付窗口；判据 1.0 ± 0.05
   *   stepHeight10  9.9–10.1 nm    交付窗口；判据 10 ± 0.2
   *   uncertainty   0.01–0.06 nm   1 nm 端 0.014（1.4 %）、10 nm 端 0.051（0.51 %）
   *   area          5000–7850 mm²  一片 φ100 的可用面积
   */
  {
    id: 'std/step-standard-1nm-10nm',
    name: '1/10 nm Step Height Standard', name_zh: '1/10 nm 台阶标准件',
    unit: '片',
    category: 'part',
    props: [
      { param: 'stepHeight1', kind: 'range', min: 0.95, max: 1.05, unit: 'nm' },
      { param: 'stepHeight10', kind: 'range', min: 9.8, max: 10.2, unit: 'nm' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 0.06, unit: 'nm', dir: 'atMost' },
      { param: 'area', kind: 'range', min: 100, max: 10000, unit: 'mm²', dir: 'atLeast' },
    ],
  },

  /**
   * **AFM 整机。**
   *
   * 交付：横向 1–5 nm（**采样/边缘定位**，不是形貌分辨，见 D1）、
   * 垂直 0.05–0.1 nm、扫描 1–100 µm、Z 噪声 ≤0.05 nm、非线性 <0.5 %、
   * 力分辨 0.03–10 pN（软针档）、带宽 1–100 kHz（PID）。
   *
   * 按 `composedOf` 装配（与 `plant/interferometer`、`plant/cd-sem` 同一形状）：
   * 7 件 —— 扫描器、光杠杆、反馈、隔振、基座、探针（带磨损）、计算机。
   * 零件各有 make 路线；整机不写产出路线（那会要求「造整机要有零件输入」，
   * 而本模型里装配由 composedOf 表达，见 `src/core/describe.ts` 的 Item 注释）。
   *
   * 探针磨损：1 支 / 48 运行小时。AFM 的针是**消耗件性质**，但它是标准件
   * （规格独立于机器），所以按 part + wear 记，不按 consumable（consumable
   * 要绑 perItem/per，这里绑运行小时更贴切）。
   */
  {
    id: 'plant/afm',
    name: 'AFM System', name_zh: 'AFM 整机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'lateralResolution', kind: 'range', min: 1, max: 5, unit: 'nm', dir: 'atMost' },
      { param: 'verticalResolution', kind: 'range', min: 0.05, max: 0.1, unit: 'nm', dir: 'atMost' },
      { param: 'scanRangeX', kind: 'range', min: 1, max: 100, unit: 'µm' },
      { param: 'scanRangeY', kind: 'range', min: 1, max: 100, unit: 'µm' },
      { param: 'scanRangeZ', kind: 'range', min: 1, max: 10, unit: 'µm' },
      { param: 'zNoise', kind: 'range', min: 0, max: 0.05, unit: 'nm', dir: 'atMost' },
      { param: 'nonlinearity', kind: 'range', min: 0, max: 0.5, unit: '%', dir: 'atMost' },
      { param: 'forceResolution', kind: 'range', min: 0, max: 10, unit: 'pN', dir: 'atMost' },
      { param: 'bandwidth', kind: 'range', min: 1, max: 100, unit: 'kHz' },
      { param: 'tipRadius', kind: 'range', min: 0.005, max: 0.1, unit: 'µm' },
      { param: 'stepHeight', kind: 'range', min: 0.5, max: 50, unit: 'nm' },
      { param: 'measure/roughness', kind: 'range', min: 0, max: 100, unit: 'nm' },
      { param: 'wavelength', kind: 'range', min: 650, max: 780, unit: 'nm' },
    ],
    composedOf: [
      { item: 'plant/afm/scanner', qty: q(1) },
      { item: 'plant/afm/optical-lever', qty: q(1) },
      { item: 'plant/afm/feedback', qty: q(1) },
      { item: 'plant/afm/isolation', qty: q(1) },
      { item: 'plant/afm/base', qty: q(1) },
      { item: 'std/afm-cantilever', qty: q(1), wear: { amount: q(1), per: q(48) } },
      { item: 'std/computer-general', qty: q(1) },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线
// ═══════════════════════════════════════════════════════════════════════════

export const AFM_ROUTES: readonly Route[] = [
  {
    /**
     * **770 nm 激光二极管：1 片 2 英寸 GaAs 衬底 → 200 只。**
     *
     * 与 `make/gaas-algaas-epi-wafer` + `make/oes-laser-chip` 同一条线，
     * 只换三处配方：
     *   有源层   Al₀.₁₅Ga₀.₈₅As 0.12 µm（Eg 1.61 eV ⇒ 770 nm），TMAl 配比 0.20
     *   条宽/腔长 50 µm / 500 µm（870 是 100 / 750）⇒ 阈值 40–80 mA
     *   封装     TO-18（870 是 C-mount）
     *
     * 工序 12 段（MOCVD 外延 4 层 → SiO₂ 硬掩模 → 光刻 → HF 开窗 →
     * p 面 Ti/Au → 合金 → 减薄 → n 面 AuGe/Ni/Au → 合金 → 解理 →
     * HR/AR 镀膜 → 装 TO-18 → L-I 测），全部有设备。
     *
     * 成品率：2 英寸片 20.27 cm² ÷ (0.05 × 0.05 cm) = 8100 个腔面位；
     * 解理/镀膜/焊装废 97 %，交 200 只（2.5 %）。这个数比 870 的 7–8 % 低，
     * 因为 50 µm 条宽的解理/焊装更难 —— 记在 D7 的代价里。
     */
    id: 'make/laser-diode-770',
    name: '770 nm GaAs/AlGaAs Laser Diode Manufacturing', name_zh: '770 nm GaAs/AlGaAs 激光二极管制造',
    produces: [
      {
        item: 'std/laser-diode-770nm',
        qty: q(200),
        gives: [
          { param: 'wavelength', kind: 'range', min: 765, max: 775 },
          { param: 'outputPower', kind: 'range', min: 3, max: 15 },
          { param: 'thresholdCurrent', kind: 'range', min: 40, max: 80 },
          { param: 'package', kind: 'enum', oneOf: ['to-18'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/gaas-substrate-2in', qty: q(1) }] },
      { anyOf: [{ item: 'mat/trimethyl-gallium', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/trimethyl-aluminium', qty: q(1, 25000) }] },
      { anyOf: [{ item: 'mat/arsine', qty: q(1, 15000) }] },
      { anyOf: [{ item: 'mat/silane', qty: q(1, 1000000) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/titanium', qty: q(1, 50000) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 20000) }] },
      { anyOf: [{ item: 'mat/germanium-metal', qty: q(1, 50000) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 50000) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(1, 50000) }] },
      { anyOf: [{ item: 'mat/titanium-dioxide', qty: q(1, 50000) }] },
      { anyOf: [{ item: 'mat/indium', qty: q(1, 50000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 20) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(80) },
    steps: [
      {
        note_zh: '装片/烘烤：1 片 2 英寸 GaAs，H₂ 680 °C、10 min 去氧化（MOCVD 上限 700 °C）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: 'n-GaAs 缓冲 0.5 µm：SiH₄ 1e18、680 °C、10 kPa；1 µm/h ⇒ 0.5 h',
        performedBy: 'plant/mocvd-reactor',
        under: [
          { param: 'temperature', min: 680, max: 700 },
          { param: 'pressure', min: 8, max: 12 },
        ],
      },
      {
        note_zh: 'n-Al₀.₃Ga₀.₇As 包层 1.2 µm：TMGa + TMAl + AsH₃、SiH₄ 5e17；TMAl/(TMGa+TMAl) ≈ 0.35',
        performedBy: 'plant/mocvd-reactor',
        under: [
          { param: 'temperature', min: 680, max: 700 },
          { param: 'pressure', min: 8, max: 12 },
        ],
      },
      {
        note_zh: 'Al₀.₁₅Ga₀.₈₅As 有源层 0.12 µm：不掺杂、700 °C；V/III 30–50，界面停 10 s；TMAl 配比 0.20（870 的 GaAs 有源层是 0）',
        performedBy: 'plant/mocvd-reactor',
        under: [
          { param: 'temperature', min: 690, max: 700 },
          { param: 'pressure', min: 8, max: 12 },
        ],
      },
      {
        note_zh: 'p-Al₀.₃Ga₀.₇As 包层 1.2 µm：低 V/III 5–10 碳掺 5e17–1e18；p-GaAs 帽 0.2 µm（碳 1e19）',
        performedBy: 'plant/mocvd-reactor',
        under: [
          { param: 'temperature', min: 680, max: 700 },
          { param: 'pressure', min: 8, max: 12 },
        ],
      },
      {
        note_zh: '蒸发 SiO₂ 200 nm 硬掩模（p 面，衬底不加热）；膜疏松，当掩模够用',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh: '条宽光刻：50 µm 条、1 mm 间距；显影后线条 ±1.5 µm',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh: 'HF 开窗 30 s，去窗口 SiO₂；水冲、甩干',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
      {
        note_zh: 'p 面 Ti/Au 60/200 nm，蒸发 0.2–0.5 nm/s',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh: '合金 380–420 °C、30 s，N₂ 保护；接触电阻 <1e-4 Ω·cm²',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 380, max: 420 }],
      },
      {
        note_zh: '背面减薄到 100 µm（TTV ≤5 µm）；n 面 AuGe/Ni/Au 100/20/200 nm，再合金 380–420 °C',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '解理 500 µm 腔长（(110) 面）；每片出 200–300 条',
        performedBy: 'plant/dicing-saw',
      },
      {
        note_zh: '端面镀膜：HR 4 对 SiO₂/TiO₂（R ≥97 %）、AR 3 层 TiO₂/SiO₂/TiO₂（R ≤1 %）；膜厚由 film-monitor 监控',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh: '装 TO-18：In 焊料 2 µm、金丝球焊；焊后热阻 40–60 K/W（TO-18 比 C-mount 差 10 倍，3 mW 够）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '测 L-I：阈值 40–80 mA、斜率 0.3–0.6 W/A、3–15 mW @ 100 mA；挑 200 只',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **Si 探针：1 片 φ100 硅片 → 100 支。**
     *
     * 工序（九段）：
     *   ① 清洗（乙醇 + 去离子水，本层没有 SC1/SC2）
     *   ② 热氧化 300 nm SiO₂ 硬掩模
     *   ③ 光刻悬臂图形（100 条 × 1.6 mm 节距）
     *   ④ KOH 各向异性：SiO₂ 掩模点下留 Si 金字塔尖 + 悬臂梁
     *   ⑤ 热氧化锐化 180 nm（1000 °C 干氧 20 min）
     *   ⑥ HF 剥氧化层 ⇒ 尖端 5–10 nm
     *   ⑦ DRIE 背面释放悬臂（50 µm 深，SF6/C4F6）
     *   ⑧ 蒸发 Ti 5 nm + Au 30 nm（背面反射面）
     *   ⑨ 划片 + 抽检尖端半径
     *
     * 质量账：1 片 18.8 g → 100 支。悬臂本体 150×30×1 µm = 4.5e-15 m³
     * × 2330 kg/m³ = **1.05e-11 kg（10.5 ng）**；每支的 3×1.6×0.5 mm Si 座
     * = 2.4e-9 m³ × 2330 = 5.6 mg，100 支 0.56 g。其余 18.2 g 是划片道、
     * KOH 腐蚀掉的山谷与边缘排除区。**按件计，不折 kg。**
     *
     * ⚠️ f0 是镀金后的值（Au 30 nm 质量负载 25 %，f0 降 12 %）。
     */
    id: 'make/afm-cantilever',
    name: 'Si Probe Manufacturing', name_zh: 'Si 探针制造',
    produces: [
      {
        item: 'std/afm-cantilever',
        qty: q(100),
        gives: [
          { param: 'stiffness', kind: 'range', min: 0.012, max: 40 },
          { param: 'resonance', kind: 'range', min: 10.8, max: 260 },
          { param: 'tipRadius', kind: 'range', min: 6, max: 9 },
          { param: 'length', kind: 'range', min: 50, max: 300 },
          { param: 'coating', kind: 'enum', oneOf: ['au'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/koh', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 2000) }] },
      { anyOf: [{ item: 'mat/titanium', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/acetone', qty: q(1, 50) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(60) },
    steps: [
      {
        note_zh: '清洗：乙醇 + 去离子水冲、120 °C 烘 30 min（本层没有 SC1/SC2，用乙醇顶）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: '热氧化 300 nm SiO₂ 硬掩模：1000–1100 °C、湿氧 40 min',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 1000, max: 1100 }],
      },
      {
        note_zh: '光刻悬臂图形：100 条 × 1.6 mm 节距，梁宽 20–40 µm、长 50–300 µm；接触曝光',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh: 'KOH 各向异性 60–80 °C、30 %：SiO₂ 掩模点下留 Si 金字塔，梁从背面掏空；腐蚀 6 h',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 60, max: 80 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: '氧化锐化：1000 °C 干氧 20 min 长 180 nm；凸角应力抑制氧化层厚度 ⇒ 剥后尖端更尖',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 1000, max: 1100 }],
      },
      {
        note_zh: 'HF 剥氧化层 3–5 min；尖端 20–30 nm → 5–10 nm（Marcus–Sheng 氧化锐化）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: 'DRIE 背面释放：SF6 200 sccm / C4F6 20 sccm、3 Pa、500 W，刻 50 µm；速率 2 µm/min ⇒ 25 min',
        performedBy: 'plant/drie-etcher',
        under: [
          { param: 'pressure', min: 1, max: 8 },
          { param: 'temperature', min: 15, max: 60 },
        ],
      },
      {
        note_zh: '蒸发背面反射面：Ti 5 nm 附着 + Au 30 nm；速率 0.1–0.3 nm/s，片架倾斜 30° 保证梁背面也镀上',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh: '划片：每片 100 支（3×1.6 mm 座，划片道 100 µm）；去掉边缘 20 %',
        performedBy: 'plant/dicing-saw',
      },
      {
        note_zh: '抽检尖端半径：AFM 反向成像（measure/tip-radius-afm 的同一方法）或 SEM 顶视；每批 5 支',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **管式扫描器：PZT 粉 → φ8 × 60 × 0.25 mm 管 → 三轴闭环。**
     *
     *   铅 0.0033 + 锆石 0.001 + 钛白 0.00061 + 氧 0.00038 + 银 0.0005
     *   + 金 0.001 + 酚醛 0.0002 + 45 钢 0.2 + 铝 0.1 + 水 1
     *   + 驱动 1 + 电容传感器 3 → 扫描器 1 件
     *
     * 与 `make/pzt-ceramic` 是同一配方（Pb(Zr₀.₅₂Ti₀.₄₈)O₃），只换成型：
     * 钢芯棒干压成管 → 烧结 → 磨内外圆 → 四象限镀金 + 内电极 → 500 V 极化
     * （2 kV/mm，壁 0.25 mm）→ 装 3 只电容传感器与驱动 → X 射线标定。
     *
     * 为什么壁是 0.25 mm：极化场 500 V / 0.25 mm = 2 kV/mm（PZT 要 2–3）；
     * 再厚极化不透，再薄管子在 60 mm 长度上装夹就碎（D5）。
     */
    id: 'make/afm-scanner',
    name: 'AFM Tube PZT Scanner Manufacturing', name_zh: 'AFM 管式 PZT 扫描器制造',
    produces: [
      {
        item: 'plant/afm/scanner',
        qty: q(1),
        gives: [
          { param: 'outerDiameter', kind: 'range', min: 7.5, max: 8.5 },
          { param: 'xyRange', kind: 'range', min: 1, max: 100 },
          { param: 'zRange', kind: 'range', min: 1, max: 10 },
          { param: 'zNoise', kind: 'range', min: 0.03, max: 0.05 },
          { param: 'nonlinearity', kind: 'range', min: 0.2, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/lead', qty: q(17, 10000) }] },
      { anyOf: [{ item: 'mat/zirconia', qty: q(53, 100000) }] },
      { anyOf: [{ item: 'mat/titanium-dioxide', qty: q(4, 12500) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 5000) }] },
      { anyOf: [{ item: 'mat/silver', qty: q(1, 2000) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 5000) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 100) }] },
      { anyOf: [{ item: 'plant/pzt-stage/driver', qty: q(1) }] },
      { anyOf: [{ item: 'plant/pzt-stage/capacitive-sensor', qty: q(3) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(72) },
    steps: [
      {
        note_zh: '配料/球磨：Pb/ZrO₂/TiO₂ 按 0.621/0.192/0.115 称量，水磨 4 h，烘干',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '预烧 850–900 °C、2 h 生成钙钛矿相；温度低了不反应，高了铅挥发',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 850, max: 900 }],
      },
      {
        note_zh: '干压成管：φ8 外径 × 60 mm、壁 0.25 mm，钢芯棒定内孔；100–200 MPa',
        performedBy: 'plant/press',
      },
      {
        note_zh: '烧结 1250–1300 °C、2 h，埋粉抑制铅挥发（与 make/pzt-ceramic 同一炉）',
        performedBy: 'plant/high-temp-furnace',
        under: [{ param: 'temperature', min: 1250, max: 1300 }],
      },
      {
        note_zh: '磨内外圆与端面：壁厚 0.25 ± 0.01 mm、同轴 0.02 mm；金刚石砂轮，最后 800# 精磨',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '电极：外壁 4 象限金电极（20 µm 间隙）+ 内壁整面金；蒸发 0.1 µm，掩模对位 ±20 µm',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh: '极化：500 V（2 kV/mm）、120 °C 空气浴 10 min；极化后 24 h 老化（与 pzt-ceramic 同一电源）',
        performedBy: 'plant/hv-source-500v',
      },
      {
        note_zh: '装 3 只电容传感器（X/Y/Z）与驱动：传感器极板直接顶在管端，间隙 20–50 µm；闭环带宽 1 kHz',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '闭环标定：X 射线干涉仪读 10 µm 步进、每轴 16 点，线性残差 <0.5 %；Z 噪声 0.05 nm（10 s）',
        performedBy: 'plant/xray-interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **光杠杆：激光二极管 + 4 只光电二极管 + 两片聚焦镜。**
     *
     *   激光 1 + 光电二极管 4 + 玻璃 0.05 + 铝 0.2 + 铜线 0.005
     *   + 酚醛 0.005 → 光杠杆 1 件
     *
     * 聚焦镜：f = 50 mm 平凸，φ12.7，装在铝镜筒里；激光二极管 TO-18 座
     * 带准直（f = 15 mm 非球面）。四象限：4 只 `std/photodiode-general`
     * 贴在同一块铝座上，中间 20 µm 十字掩模 —— 不是买现成的四象限管。
     *
     * 标定：给悬臂架一个 1 nm 的压电阶跃（用扫描器的 Z 轴、电容传感器读），
     * 光斑应走 1.0 µm；实测 950–1050 nm 收。散粒噪声按 §一 的 0.1 nm/√Hz 验。
     */
    id: 'make/afm-optical-lever',
    name: 'AFM Optical Lever Manufacturing', name_zh: 'AFM 光杠杆制造',
    produces: [
      {
        item: 'plant/afm/optical-lever',
        qty: q(1),
        gives: [
          { param: 'wavelength', kind: 'range', min: 765, max: 775 },
          { param: 'leverGain', kind: 'range', min: 950, max: 1050 },
          { param: 'spotSize', kind: 'range', min: 12, max: 24 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/laser-diode-770nm', qty: q(1) }] },
      { anyOf: [{ item: 'std/photodiode-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 200) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: '磨/抛两片平凸镜：f = 50 mm（R = 25.8 mm，n = 1.453 @770）与 f = 15 mm 准直镜；面形 λ/4',
        performedBy: 'plant/cnc-polisher-5axis',
      },
      {
        note_zh: '装激光与准直：TO-18 座进铝镜筒，准直镜轴向调 0–3 mm，出射束 φ2 mm、发散 <1 mrad',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装四象限：4 只光电二极管贴铝座、20 µm 十字掩模；四路跨阻 1 MΩ、带宽 100 kHz',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '增益标定：扫描器 Z 走 1 nm 阶跃，光斑应走 1.0 µm；实测 D/L = 950–1050；散粒噪声 0.1 nm/√Hz',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **反馈：模拟 PID + 高压接口 + 16 位读出。**
     *
     *   PCB 0.05 + 运放 4 + 薄膜电容 8 + 排阻 6 + 焊膏 0.01
     *   + 铜线 0.005 + 铝 0.2 → 反馈 1 件
     *
     * 三片运放做 PID（比例/积分/微分），一片做高压驱动的误差放大；
     * 16 位 ADC（`std/computer-general` 侧）读 Z 电压。小信号带宽 100 kHz
     * （GBW 1 MHz、增益 10）；真正闭环受高压驱动 1–10 kHz 限制（D2）。
     */
    id: 'make/afm-feedback',
    name: 'AFM Feedback Controller Manufacturing', name_zh: 'AFM 反馈控制器制造',
    produces: [
      {
        item: 'plant/afm/feedback',
        qty: q(1),
        gives: [
          { param: 'bandwidth', kind: 'range', min: 1, max: 100 },
          { param: 'forceResolution', kind: 'range', min: 0.03, max: 10 },
          { param: 'pidType', kind: 'enum', oneOf: ['analog'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1, 20) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(8) }] },
      { anyOf: [{ item: 'std/resistor-network-general', qty: q(6) }] },
      { anyOf: [{ item: 'mat/solder-paste', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(16) },
    steps: [
      {
        note_zh: '印刷焊膏 0.1 mm 钢网；焊盘 0.3 mm 间距',
        performedBy: 'plant/solder-printer',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: '贴片：4 运放 + 8 电容 + 6 排阻，共 18 件；0402/0603 封装',
        performedBy: 'plant/pick-place',
        under: [
          { param: 'temperature', min: 20, max: 28 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: '回流 150–250 °C（SAC305 峰值 245 °C）；氮气保护',
        performedBy: 'plant/reflow-furnace',
        under: [
          { param: 'temperature', min: 150, max: 250 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: '测带宽与噪声：方波 1 kHz/10 kHz/100 kHz，小信号 −3 dB；输入短路噪声 <10 nV/√Hz',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **隔振：4 根 65Mn 簧 + 铜板涡流阻尼。**
     *
     *   65Mn 2 + 磁铁 4 + 铜 1 + HT250 10 + 45 钢 1 → 隔振 1 件
     *
     * 簧：D = 20 mm、d = 2 mm、n = 10，1983 N/m/根；4 根 7932 N/m，
     * m = 50 kg ⇒ f0 = 2.0 Hz。涡流：100×100×3 mm 铜板在 0.3 T 气隙里，
     * c = 161 N·s/m、Q = 3.9；10 Hz 传递率 0.042（§六）。
     *
     * ⚠️ 0.5 Hz 端要 4 倍更软的簧（d 1.4 mm），60 mm 长的细簧在 50 kg
     * 预压下容易失稳 —— 这是 D6，不是本机没算。
     */
    id: 'make/afm-isolation',
    name: 'AFM Vibration Isolation Manufacturing', name_zh: 'AFM 隔振制造',
    produces: [
      {
        item: 'plant/afm/isolation',
        qty: q(1),
        gives: [
          { param: 'naturalFrequency', kind: 'range', min: 1.5, max: 2.5 },
          { param: 'qualityFactor', kind: 'range', min: 3, max: 5 },
          { param: 'transmissibility', kind: 'range', min: 0.03, max: 0.06 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-65mn', qty: q(1, 10) }] },
      { anyOf: [{ item: 'std/permanent-magnet-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(10) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: '绕簧：65Mn φ2 丝、芯棒 φ18、10 圈；两端并紧磨平，自由长 60 mm',
        performedBy: 'lathe',
      },
      {
        note_zh: '去应力 400–450 °C、30 min；再喷丸（0.2 mm 铸钢丸）提高疲劳寿命',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
      {
        note_zh: '铣铜板 100×100×3 与磁座：4 块 30×10×5 钕铁硼，气隙 0.3 T',
        performedBy: 'plant/milling-machine',
      },
      {
        note_zh: '装：4 簧在四角、铜板与磁座对中（气隙 2 mm）；m = 50 kg 预压 6 mm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '测 f0 与 Q：敲击法自由衰减，f0 1.5–2.5 Hz、Q 3–5；10 Hz 传递率 <0.06',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **基座：HT250 30 kg + 三点调平 + 差动粗调 Z。**
     *
     *   HT250 30 + 45 钢 2 + 钢板 1 + 铜线 0.001 → 基座 1 件
     *
     * 铸铁浇成 300×250×80 的台面，铣/磨平，三点调平（M10 细牙，±1 mm）；
     * 差动螺丝 0.1 mm/转带探针架升降 0–25 mm。探针与样品同在这根 50 mm
     * 的短路径上 —— 热漂移 0.6 µm/K 是**共模**的，差分测量把它扣掉（§三）。
     */
    id: 'make/afm-base',
    name: 'AFM Base Manufacturing', name_zh: 'AFM 基座制造',
    produces: [{ item: 'plant/afm/base', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(30) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(2) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 1000) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(40) },
    steps: [
      {
        note_zh: '浇铸 300×250×80 台面：HT250、1300–1500 °C；时效 550–650 °C 去应力',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1300, max: 1500 }],
      },
      {
        note_zh: '铣/磨台面：平面度 0.02 mm/300 mm，Ra 1.6；三只 M10 细牙调平螺钉',
        performedBy: 'plant/milling-machine',
      },
      {
        note_zh: '差动粗调 Z：0.1 mm/转，行程 0–25 mm；探针架与样品台同装在这块台面上（50 mm 短路径）',
        performedBy: 'lathe',
      },
      {
        note_zh: '装：调平三点、差动螺丝对零；台面与隔振上板之间加 3 mm 铜垫（热共模）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **1/10 nm 台阶标准件：10 片 φ100，两次 ALD lift-off。**
     *
     *   硅片 10 + HfCl₄ 0.0001 + 水 2 + 氮 0.1 + 光刻胶 0.05
     *   + 铝 0.0002 + HCl 0.02 + HF 0.005 + 丙酮 0.02 → 标准件 10 片
     *
     * A 区 10 周期（1.0 nm）、B 区再叠 90 周期（+9.0 nm）、C 区 0；
     * Al 50 nm 牺牲层 + 光刻开窗 + HCl 剥离（HfO₂ 不被 HCl 侵蚀）。
     * 定值：AFM（measure/step-height-afm）+ X 射线（0.1 nm = 0.319 条纹，
     * 11° ⇒ 0.01 nm），两者差 <2 %。
     *
     * ⚠️ 1 nm 端**不是热氧化**：native oxide 1.5–2 nm、初始快速段，
     * 1 nm 的 ±5 % 控不住（§七）。热氧化只能做 10 nm 档；本文件选 ALD
     * 是因为 1 nm 档，不是因为 10 nm 档更容易。
     */
    id: 'make/step-standard-1nm-10nm',
    name: '1/10 nm Step Height Standard Manufacturing', name_zh: '1/10 nm 台阶标准件制造',
    produces: [
      {
        item: 'std/step-standard-1nm-10nm',
        qty: q(10),
        gives: [
          { param: 'stepHeight1', kind: 'range', min: 0.98, max: 1.02 },
          { param: 'stepHeight10', kind: 'range', min: 9.9, max: 10.1 },
          { param: 'uncertainty', kind: 'range', min: 0.01, max: 0.06 },
          { param: 'area', kind: 'range', min: 5000, max: 7850 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(10) }] },
      { anyOf: [{ item: 'mat/hafnium-chloride', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 50000) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/acetone', qty: q(1, 50) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(80) },
    steps: [
      {
        note_zh: '清洗 10 片 φ100 硅片：碱洗/酸洗/去离子水冲/甩干；HF 30 s 剥 native oxide（1.5–2 nm）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: '第一次牺牲层：蒸发 Al 50 nm（p 面，衬底不加热）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh: '第一次光刻：A 区 5×5 mm 开窗（每片 4 个 A 区）；显影后线条 ±2 µm',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh: 'HCl 湿法刻 Al 开窗：10 % HCl、40 °C、1–2 min；HfO₂/Si 不被侵蚀',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: '去胶：丙酮 + 异丙醇 + 水冲；Al 掩模保留（它才是 lift-off 的模具）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: 'ALD 10 周期 HfO₂ = 1.0 nm：HfCl₄ + H₂O、200–250 °C、20–60 Pa；GPC 0.09–0.1 nm',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 200, max: 250 },
          { param: 'pressure', min: 20, max: 60 },
        ],
      },
      {
        note_zh: '第一次 lift-off：HCl 溶 Al 50 nm，Al 上的 HfO₂ 一起掀掉；A 区留 1.0 nm、C 区 0',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: '第二次牺牲层：蒸发 Al 50 nm（盖住 A 区与 C 区）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh: '第二次光刻：B 区 5×5 mm 开窗（A 区被 Al 盖住保护）',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh: 'HCl 刻 Al 开窗；ALD 90 周期 = 9.0 nm 叠在 B 区 1.0 nm 上 ⇒ B 区 10.0 nm',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 200, max: 250 },
          { param: 'pressure', min: 20, max: 60 },
        ],
      },
      {
        note_zh: '第二次 lift-off：HCl 溶 Al ⇒ A = 1.0、B = 10.0、C = 0；水冲、甩干',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: 'X 射线定值：0.1 nm = 0.319 个 (111) 条纹、八帧相位 11° ⇒ 0.01 nm；A/B 各 10 点/片',
        performedBy: 'plant/xray-interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: 'AFM 复测：measure/step-height-afm 的双平台差分测 1/10 nm；与 X 射线差 <2 % 才收',
        performedBy: 'plant/afm',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '编号/装盒：10 片里取 8 片合格（A/B 区无颗粒、无剥离）；写定值记录',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...AFM_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/afm',
    name: 'AFM System Assembly', name_zh: 'AFM 整机装配',
    produces: [{
      item: 'plant/afm',
      qty: q(1),
      gives: [
      { param: 'lateralResolution', kind: 'range', min: 1, max: 5, dir: 'atMost' },
      { param: 'verticalResolution', kind: 'range', min: 0.05, max: 0.1, dir: 'atMost', record: 'mat/step-height-afm-record' },
      { param: 'scanRangeX', kind: 'range', min: 1, max: 100 },
      { param: 'scanRangeY', kind: 'range', min: 1, max: 100 },
      { param: 'scanRangeZ', kind: 'range', min: 1, max: 10 },
      { param: 'zNoise', kind: 'range', min: 0, max: 0.05, dir: 'atMost' },
      { param: 'nonlinearity', kind: 'range', min: 0, max: 0.5, dir: 'atMost' },
      { param: 'forceResolution', kind: 'range', min: 0, max: 10, dir: 'atMost' },
      { param: 'bandwidth', kind: 'range', min: 1, max: 100 },
      { param: 'tipRadius', kind: 'range', min: 0.005, max: 0.1 },
      { param: 'stepHeight', kind: 'range', min: 0.5, max: 50, record: 'mat/step-height-afm-record' },
      { param: 'measure/roughness', kind: 'range', min: 0, max: 100, record: 'mat/ra-afm-record' },
      { param: 'wavelength', kind: 'range', min: 650, max: 780 },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...AFM_ROUTES, ...ASSEMBLY_ROUTES];
