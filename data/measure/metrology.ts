/**
 * 计量/量测类测量路线与记录 —— 按 R13 从机器/材料文件迁出。
 *
 * 只放 Item + Route。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * OES 绝对波长：钠 D 双线只能校 589 nm 附近（`measure/oes-wavelength`）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `plant/refractometer/oes-grating-spectrograph` 的 **±0.2 nm 一直是设计值**
 * （`oes-grating.ts` 第八节 R8-1：钠 D + 铜弧自校，不是溯源）。这一节加一条
 * `measure/oes-wavelength` → `mat/oes-wavelength-record`，用现有的钠源把它
 * 在 589 nm 附近实测一次 —— **只验这一小段，不验全段**。
 *
 * ⚠️ 六句先说在前面（这条路线最容易读错的地方）：
 *
 *   ① **钠源是 589.0 / 589.6 nm 的双线，不是连续谱。**
 *      588.995 nm（D₂）与 589.592 nm（D₁），Δλ = 0.597 nm；钠灯里 99 % 的
 *      可见光都在这两条线上。它给的是**两个已知点**，不是一把波长梳 ——
 *      除了这两条，没有第三条已知线。
 *
 *   ② **只能校 589 nm 附近，不能证明 200–900 nm 全段。**
 *      两个点在 589 nm 上定一条直线（色散 + 零位）；外推到 870 nm 靠的是
 *      光栅方程与正弦杆几何，不是这两个点。要证明 870 nm，需要一条 870 nm
 *      的已知窄线 —— 本层没有。所以记录里的 `error` 是 **589 nm 的局部误差**，
 *      不是 `wavelengthRange 400–900` 的误差。±0.2 nm 仍是设计值。
 *      ⚠️ 附带一句：用这两条线定零位与色散，是两个方程解两个未知量，
 *      直线必然过这两点，**残差恒为 0**；所以 `error` 记的是标定的
 *      1σ 不确定度（重复性、1 µm 估读、实测/设计色散之差），不是
 *      "两峰残差"。把 0 残差当成 0 误差，是这条路线最容易犯的错。
 *
 *   ③ **没有汞灯 / 氖灯 / 空心阴极灯。**
 *      `oes-grating.ts` 第八节查过：汞没有条目、氩灯没有、空心阴极灯没有。
 *      铜弧 510.5/515.3/521.8 是现场搭的工装、不是条目，本路线不用它；
 *      它若在，也只有 510–522 nm 的三个点，**仍到不了 870 nm**，而且碳棒
 *      弧爆会让扫描跳。**本路线只有钠的两条线。**
 *
 *   ④ **狭缝 / 像元 / 温度漂移都没有标定。**
 *      入射缝 10 µm、出射缝 25 µm（等价像元），单管硅二极管 + 斩波/锁相，
 *      **没有线阵**；波长靠 `std/micrometer-0-25` + 正弦杆手动扫描。
 *      1 µm 读数在 589 nm 约 0.034 nm（45 mm 杆；10 µm 分度约 0.34 nm），
 *      但缝宽/像元/装调/回差/温度（19–21 °C，±1 K）各自的系数没有实测。
 *      记录只写"这次扫描的 5 个点"，不写"仪器的波长准确度"。
 *
 *   ⑤ **双线能不能分开，本身就是要测的第一件事。**
 *      设计分辨率在 870 nm 是 0.2–0.5 nm，400–650 档写 0.3–0.6 nm；
 *      双线间距 0.597 nm 落在**分辨率的边缘**：好的一头（0.3 nm）能分开，
 *      差的一头（0.6 nm）会并成一个包络。**不能先验地说"一定分得开"，
 *      也不能先验地说"一定分不开"** —— 这正是 `measure/oes-wavelength`
 *      第②③步要回答的。分得开：记两个峰位、用 0.597 nm 标色散；
 *      分不开：只记包络中心，`error` 记 0.3–0.6 nm，并在记录上注明
 *      "未分辨" —— 这时它是 B 类，不能拿去签 ±0.2 nm。
 *
 *   ⑥ **钠源在数据里是干涉仪的零件，不是折射计的零件。**
 *      `litho-m3.ts` 把 `plant/refractometer` 写成"589 nm 的钠光"，但它
 *      自己并没有钠灯条目；本层唯一的钠源条目是
 *      `plant/interferometer/sodium-source`（`plant/interferometer` 的
 *      `composedOf` 之一）。所以这条路线的 `needs` 里写
 *      `plant/interferometer`（把钠源借过来），`performedBy` 写
 *      `plant/refractometer`（光谱仪模块是它的零件；模块本身是 `part`，
 *      不是 `machine`，不能当 `performedBy`）。这是数据里的归属，不是文字游戏。
 *
 * 结论（写在这里，免得读记录的人误会）：
 *
 *   **能测**：把钠源从干涉仪上取下、放在 OES 入射缝前，扫 588.9–589.7 nm
 *   的 5 个点；分得开就用 0.597 nm 标色散、回推两峰绝对波长；分不开就记
 *   包络。**只成立在 589 nm 附近**；200–900 nm 全段、±0.2 nm、870 nm 的
 *   分辨率都还是设计值/外推值，**不因这条路线变成实测值**。这条路线是
 *   **B 类**：它把"没有 589 nm 的实测"变成"有一条可执行的 589 nm 自校"，
 *   不是把 ±0.2 nm 证出来。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * OES 光栅一级效率：**曾经 A 类（路线缺失）；2026-10-20 已交**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `plant/refractometer/oes-grating` 的 `efficiency` 有两个数：非闪耀
 * **1.5–3 %（估算）**、斜离子束弱闪耀 **8–15 %（设计值）**。这一节回答
 * 任务书的问题：**用现有的椭偏仪 goniometer/detector、稳频激光、膜厚仪，
 * 能不能实测一级衍射效率？**
 *
 * 结论（2026-10-20 之前）：**不能**。不是"量具精度不够"的 B 类，而是
 * **没有一条能同时满足 870 nm 窄线、0–60° 入射角、绝对入射功率参考的
 * 路线**的 A 类。所以当时本文件**不写** `measure/oes-grating-efficiency`，
 * 也**不写** `mat/oes-grating-efficiency-record`；`efficiency` 当时仍是
 * 估算/设计值。2026-10-20 已写 `measure/grating-efficiency`（不同 id，
 * 记录 `mat/grating-efficiency-record`）。
 * OES 弱线整体仍是 B 类；效率这一格是 A 类
 * （缺的是路线，不是降级）。三处缺口逐条给数：
 *
 * ── 2026-10-20 更新（以下"不能/不写"保留为当时的推导）──────────────
 *
 * 三处缺口现在都有条目/路线：
 *   ① 870 nm 窄线源  `plant/oes-line-source`（`data/machine/lcr-lf.ts`）
 *   ② 0–90° 测角仪   `plant/goniometer-theta2theta`（`data/machine/goniometer.ts`）
 *   ③ 反射率标准     `std/reflectance-standard`（PTFE 99 % / Si 菲涅耳）
 * 测量路线 `measure/grating-efficiency` → `mat/grating-efficiency-record`
 * （`data/measure/grating-efficiency.ts`）。**曾经没有测角仪**，所以下面
 * 的"不能"是 2026-10-20 之前的结论，不删。
 * 实测窗口：现有浅槽 **1.5–15 %**；**60–85 % 仍是 32° 深槽的目标**
 * （A 类 10.4×，`oes-grating.ts` 第十一节），不是现有光栅的读数。
 *
 * ① 光源：没有 633/870 nm 的窄线源；488/589 不是设计波长。
 *
 *   633 nm  没有 He-Ne。`stabilized-laser.ts` 第二节两道墙：氦氖要
 *           0.14 m³ 火星空气 + 10⁵ 倍富集；就算气白送，95 % 银镜的
 *           11.8 % 往返损耗 > 6 % 的 He-Ne 往返增益，点不着。全表没有
 *           632.8 nm 的条目或路线（`solder.ts` 那句"干涉仪的氦氖管"是
 *           孤句；`interferometer.ts` 的实际光源是钠焰，
 *           `stabilized-laser.ts` 的实际光源是 Ar⁺ 488）。
 *
 *   870 nm  只有 `plant/ir-endpoint` 的**钨丝灯 + 870±10 nm 滤光片**：
 *           带内 0.8 mW、0.25 mW/mm²（`flow-and-rf.ts` §4.1），但它是
 *           **20 nm 带宽的灯**，不是线。`oes-grating.ts` R8-4 已经写过
 *           "20 nm 滤光片不能当谱线"—— 对效率同样成立：光栅的角色散
 *           dβ/dλ = m/(d cosβ) = 1/(833.333 nm × 0.743) = 1.615×10⁻³
 *           rad/nm = **0.0925°/nm**；20 nm 扫开 **1.85°**。探测器要么
 *           收进整个带（读到 860–880 nm 的平均），要么只取一部分
 *           （读到的中心波长随角度变）—— 两种都不是 870 nm 的单色
 *           效率。再加上 `plant/ir-endpoint/optics` 是 f = 40 聚到
 *           φ2 mm、收集角 ±12°（f/2.4），不是准直光，入射角本身就有
 *           ±12° 的锥角。
 *
 *   488 nm  `plant/stabilized-laser` 的 Ar⁺ 488.0 nm、50 mW 是**好线**，
 *           功率也够（1.5–3 % 的 50 mW 是 0.75–1.5 mW，比探测器的
 *           µW 档高 3 个量级）。但它不是 870：浅槽相位光栅的
 *           φ = 4πh cosθ/λ，488 上的 φ 是 870 的 1.78 倍，η₁ 不是
 *           1.5–3 % 那一档；在 488 上测一个数，不能给 870 的设计值
 *           签字。记录窗口写 400–900 也不能把"488 的读数"冒充
 *           "870 的效率"。
 *
 *   589 nm  钠 D 双线（589.0/589.6）是线，但同样不是 870；而且
 *           在 10 µm 缝的几何里盐焰只有 pA 级、真钠灯 nA 级
 *           （`measure/oes-wavelength` 的①），做效率的源太弱。
 *
 *   单色仪  本层确有一台**熔石英棱镜-缝单色器**（`ref-flat.ts` 的
 *           `plant/ref-flat-interferometer/cavity` 零件，60° 棱镜 +
 *           20 µm 缝，Δλ = 0.05 nm）—— 但它是**铜弧 510.5/515.3/521.8
 *           三条绿线的滤光件**，不是独立的 870 nm 光源：在 870 nm 的
 *           色散、带宽、透过都没有标定，出射也不是准直光；而且它是
 *           420 条条纹基准腔的腔内零件，拆装要动整套调整架，
 *           不是可以随手借走的独立光源。把它算成
 *           "870 nm 单色仪"是把"滤掉两条铜线"当成"一台可调单色仪"，
 *           本层没有这个数据。OES 光谱仪本身是**接收端**，反用要把
 *           它自己 1.5–3 % 的未知光栅效率乘进光源，且出射是 f/12.5
 *           的发散光，不能定义入射角 —— 也不是源。
 *
 * ② 角度：范围不够，而且几何不对 —— 这一条是**纯光栅方程**就能判死的。
 *
 *   范围   `plant/ellipsometer` 整机 angleRange **45–80°**；
 *          `make/ellipsometer-goniometer` 交付的也是 **45–80°**
 *          （`angleAccuracy ≤0.05°`、`repeatability ≤0.015°`）。
 *          零件条目 `plant/ellipsometer/goniometer` 写的是通用窗口
 *          **30–90°**（accuracy ≤0.5°、repeatability ≤0.2°）。
 *          两条都盖不住 0–60：整机/交付缺 **0–45°**，通用条目缺
 *          **0–30°**；实际只覆盖 45–60 这一段。
 *
 *   方程   d = 833.333 nm、m = 1：sinα + sinβ = λ/d。
 *          870 nm：sinα + sinβ = **1.044**。
 *            设计点 α = 22.00° → β = **42.02°**（`oes-grating.ts` 第二节）；
 *            α = 30° → β = 32.96°；α = 45° → β = 19.69°；
 *            α = 60° → β = 10.25°。
 *          0–60° 的扫描里，α = 22–60 这一段 β 在 10–42°；α < 22 时
 *          β 从 42° 涨到 90°（α = 2.52° 时 β = 90°）。无论哪一段，
 *          **两臂不能同时落在 45–80°**：α < 45 的源臂不在范围，
 *          α ≥ 45 时 β ≤ 19.7° 的接收臂不在范围；若强行两臂都
 *          ≥45°，sinα + sinβ ≥ 2 sin45° = 1.414 ⇒ λ ≥ 833.333 × 1.414
 *          = **1178 nm** —— 488/589/870 的一级衍射没有一条能满足。
 *          这不是分辨率问题，是范围与几何的硬约束。
 *
 *          通用条目的 30–90° 也只给 870 nm 一个 α = 30–32.96° 的窄窗
 *          （β = 32.96–30°），不是 0–60°；488/589 在 α = 30° 时
 *          β = 4.9°/11.9°，仍在 30° 以下；它们的 0° 入射一级在
 *          35.8°/45.0°，本身在 30–90° 内，但源臂到不了 0°。
 *
 *   0° 与记录窗口  更根本的一条：870 nm 上 λ/d = 870/833.333 = 1.044 > 1，
 *          所以 **α = 0° 时一级是倏逝波**（sinβ = 1.044 > 1，没有传播
 *          的一级）。一级只在 α ≥ arcsin(1.044 − 1) = **2.52°** 才出现，
 *          且 α = 2.52° 时 β = 90°（掠射）。所以任务书里"angle 0–60"
 *          的 **0° 点在 870 nm 上根本不是一个可测的一级衍射点**；即使
 *          有一台完美的 0–60° 测角仪，这一点也只能记"无一级"。900 nm
 *          更甚：α ≥ 4.59°。488/589 的 0° 是物理的，但 goniometer 的
 *          源臂到不了 0°。**记录窗口也有同样的边界**：λ > d = 833.333 nm
 *          时正入射没有一级；870 要 2.52°、900 要 4.59°。即使有测角仪，
 *          记录也不能从 0° 开始，更不能把 400–900 全段当成"都有一级"。
 *
 *   分辨率 这一项不是卡点：0.05° 的刻度、0.015° 的重复性对"度级"的
 *          角度包络足够；即使按通用条目的 0.5°，浅槽相位光栅的一级
 *          效率随角度也只有缓慢变化，折成效率远小于 1 %。卡的是
 *          **范围/运动学**，不是读数。
 *
 * ③ 探测：µW 能读、nW 能到百分之几；缺的是**绝对参考**，不是灵敏度。
 *
 *   探测器 `plant/ellipsometer/detector`：两只光电管 + 1 MΩ 跨阻 +
 *          1 kHz 斩波/相敏，噪声 ≤0.1 %（0.1 s）。488 nm 的 0.3 A/W、
 *          870 nm 的 0.4 A/W：
 *            1 µW → 0.3–0.4 µA → 0.3–0.4 V（1 MΩ）—— 轻松；
 *            1 nW → 0.3–0.4 nA → 0.3–0.4 mV；暗电流 ~1 nA（1 mV），
 *            直流读会被暗电流压住；但斩波/锁相把直流暗电流扔掉，
 *            1 Hz 的 `plant/ir-endpoint/preamp`（1 MΩ，噪声 1.7 pA）
 *            对 0.4 nA 给 ~0.4 % —— nW 能到百分之几，不是 0.1 %。
 *          对 1.5–3 % 的效率，百分之几的相对误差是 0.05–0.1 % 的
 *          绝对误差，够判"1.5 还是 3"；**所以探测不是卡点**。
 *
 *   饱和  同一只 1 MΩ 在 mW 上就饱和：1 mW × 0.4 A/W × 1 MΩ = **400 V**；
 *          870 灯的 0.8 mW 也有 320 V，488 激光 50 mW 是 15–20 kV。
 *          要测**入射功率**就得衰减；`plant/ellipsometer/filter-wheel`
 *          的玻璃滤光片是 400/550/600 nm 的带通，不是已标定的中性
 *          衰减片；本层只有"片堆 + 光电管"式的相对功率计
 *          （`edge-aligner.ts` 的剂量判断），没有 870 nm 的绝对标定/
 *          证书。所以"把探测器挪到样品位置读入射功率"这条路，先要
 *          一片已知衰减 —— 没有。
 *
 *   参考  椭偏仪确实有**双光路参考通道**（第二只光电管看分束片，
 *          `ellipsometer.ts` §一①），但它压的是**源漂**，不是绝对
 *          入射功率：分束比与到样品之间的光路（起偏器/补偿器/光阑/
 *          窗）都没有逐项标定；它是"相对监视"，不是"绝对参考镜/
 *          功率计"。
 *
 *         本层没有 870 nm 的绝对反射率标准：`ref-flat.ts` 的铝膜
 *          R = 0.88 ± 0.02（515 nm，间接法），870 nm 取 0.85–0.88
 *          （`oes-grating.ts` 第五节）—— **±0.02 的绝对误差在
 *          1.5–3 % 的效率上是 67–133 % 的相对误差**，不能当分母。
 *         `plant/euv-reflectometer` 的双镜互测是**相对测量**：
 *         它自己的 §一 就写了"相对测量不需要绝对标准"；两块镜子的
 *         反射率没有绝对证书；`std/calibrated-scale-100` 是长度尺，
 *         不是功率/反射率标准。
 *
 *         光栅自己的零级也不是参考：零级反射率被槽的占空比、阴影、
 *         铝吸收压低，这些正是效率测量要定的量；用零级做分母等于
 *         把未知数当基准。能量守恒 η₀ + η₁ + … = 1 要测全部级次 +
 *         铝吸收，而接收臂连一级都到不了，铝吸收也只有 ±2 %。
 *
 *         本层有一个"不靠绝对标准"的先例：`plant/euv-reflectometer`
 *         的双镜互测用"样品平移出束 + 2θ 臂到 0°"测 I₀，四个构型
 *         消掉探测器响应与金黑吸收。但那套是 13.5 nm 真空腔里的
 *         金黑热电堆，且它的 2θ 臂能到 0°；椭偏仪的接收臂到不了 0°，
 *         这套标准做法搬不过来。要搬，先有一台能到 0° 的衍射
 *         测角仪 + 870 nm 的探测器/窗 —— 又回到上面两处缺口。
 *
 *   线性/均匀性 互测那条路线给探测器线性 ≤0.3 %（设计 ≤1.6 %）；
 *          对 2 % 的效率，0.3 % 的线性误差是 15 % 的相对误差，
 *          是二级系统差；光电管不同位置的响应均匀性也没有标定。
 *          这一条可以靠"同一位置、同一光斑、衰减换档"压下去，
 *          但本层没有已标定的衰减片，所以它仍是一个未闭合项。
 *
 * ④ 结论与升级（R8：缺口写到"缺哪一环、差多少"）
 *
 *   不能测的三条，按硬度排：
 *     角度  硬约束：45–80°（或通用 30–90°）对 870 nm 一级的
 *           10–90°（设计点到 60° 是 10–42°）差 3–35°；0° 还是
 *           倏逝波。要一台**独立的 θ/2θ 衍射测角仪**：两臂 0–90°
 *           （入射 0–60°、接收 10–90°）、0.05° 读数、样品方位/俯仰、
 *           光束陷阱；不是把椭偏仪的镜面反射臂换个名字。
 *     光源  870 nm 要一条**窄线**（DFB 激光二极管，或带 870 nm 谱线
 *           的空心阴极灯；`oes-grating.ts` R8-4 的同一条缺口），
 *           功率 ≥0.1–1 mW 且已知稳定；633 nm 要 He-Ne，但氦氖
 *           两堵墙在本层没拆。488 nm 的 Ar⁺ 只能测 488 的点，不能
 *           冒充 870。
 *     参考  870 nm 的绝对功率/反射率标准：要把 1.5–3 % 测到 10 %
 *           相对，分母要 **0.15–0.3 % 绝对**；要 1 % 相对，要
 *           0.015–0.03 % 绝对。现有铝膜 2 % 差 **7–130 倍**；
 *           没有绝对标定的光功率计、没有已标定衰减片，差的是
 *           **一整条绝对光度链**，不是一台仪器。
 *
 *   这三件任缺一件，写出来的 `measure/oes-grating-efficiency` 就是
 *   一条**能过 L0 校验、但物理上走不通**的路线（椭偏仪在 `needs`
 *   里，校验不会报错；错在几何与参考，不在字段）。按任务书
 *   "不要硬写"和 RTA 均匀性那一节的先例，**不写路线、不写记录**，
 *   把缺口按 A 类记在这里。`rate 4 h` 不是问题 —— 4 h 的扫描
 *   （装样/对光 1 h + 有效段 3–60° 扫 30 点 × 4 min ≈ 2 h +
 *   写 1 h）是合理的；缺的是上面三件硬件。
 *
 *   ⚠️ 这一节不改变任何数：`efficiency` 仍是 0–1 的设计窗口，
 *   非闪耀 1.5–3 % 仍是估算，弱闪耀 8–15 % 仍是设计值；
 *   OES 弱线仍是 B 类，但"效率实测"这一格
 *   从"B 类待测"明确成 **A 类：连路线都没有**。谁要把它变实测，
 *   先补上面三件，再回来写 `measure/*` 与 `*-record`。
 *
 *   最后一句记录定义：任务书给的记录只有 efficiency / wavelength /
 *   angle / points 四格，**没有 polarization（TE/TM/平均）与
 *   uncertainty**。浅槽相位光栅的 η₁ 对偏振敏感（TE/TM 不是同一个
 *   数），OES 的等离子体光通常按非偏振用；将来真要写记录，这两格
 *   得先补，否则一个"efficiency"不知道是哪个偏振、误差多大。
 *   现在不写记录，所以只把这一条记在这里。
 *
 * ───────────────────────────────────────────────────────────────────────────
 * RTA 40 kW 长寿命灯阵：`measure/rta-lamp-life` → `mat/rta-lamp-life-record`
 * ───────────────────────────────────────────────────────────────────────────
 *
 * `plant/rta/lamp-array-long` 的三个设计值 —— **1500–2000 h、光衰 ≤5 %/2000 h、
 * 1000–1050 °C 上 ±5 K** —— 此前只有 `make/rta-lamp-array-long` 的交付窗口，
 * 没有任何实测路线。本文件加的这一条就是给它们配一条实测路线；它把
 * "没有实测路线"变成"有实测路线"，但**不等于把 5 % 光衰证出来了**。
 *
 * ⚠️ 四句先说在前面（这条路线最容易读错的地方）：
 *
 *   ① **2000 h 是加速/累计点亮，不是火星现场连续运行。**
 *      台架按 100 h × 20 段累计，40 kW 脉冲（或压到 5–6 kW 的恒功率；
 *      后者不是 40 kW）点满 2000 h；现场是每片 1.5 s 升坡 + 10 s 等温的
 *      间歇脉冲，热循环次数、冷却历史、石英壁温度都不一样。台架的数只能当
 *      "灯本身能撑多久"的下界/参考，不能直接折算成现场日历寿命。
 *
 *   ② **`plant/pyrometer` 只读一个固定点的温度，不是绝对光通量。**
 *      它是 650 nm 消失灯丝式光学高温计（±5–10 K），读的是挡光筒后那个
 *      固定点（托边/见证块），不积分全口径、不分光谱。5 % 的光衰在固定电
 *      功率下只让那个点降 **ΔT = (T/4)·(ΔP/P)**：1273 K 上 **15.9 K**、
 *      1323 K 上 **16.5 K**（与 `implant.ts` §四·⑤ 同一个式子）。所以温度
 *      这一路只能分辨几个百分点的光衰，给不了绝对刻度。
 *
 *   ③ **灯阵是消耗件。** 一条路线吃掉一件 `plant/rta/lamp-array-long`：
 *      16 只 ×2.5 kW（两组各 8 只串联），2000 h 走完额定寿命（1500–2000 h）
 *      也就用完了。注意它在模型里是 `part`（现场可换件，装在 `plant/rta` 上），
 *      不是 `consumable`；"消耗"说的是试验账，不是类别。
 *
 *   ④ **没有积分球/光通量标准，decay 用同输入功率下的温度/电流间接推。**
 *      记录里的 `decay` 不是"积分球测到的光通量掉了多少"，是"同一输入功率下
 *      固定点温度掉了多少，按 σT⁴ 折回功率"的**代理量**。转换假设（灰体、
 *      光谱不变、耦合不变）在壁黑化时并不严格成立：灯壁把可见/近红外吸收后
 *      又以红外重发，硅的带边（1.1 µm）不吸收那一份，而 pyrometer 的 650 nm
 *      通道与硅的吸收带也不是同一段光谱。**这一条没有闭环的标准件。**
 *
 * 判据与它在本层的状态（数在 `measure/rta-lamp-life` 的注释里逐条给）：
 *
 *   failures ≤1 只   可数、可判：0–16 只；1 只开路 = 该 8 只串联组断开，
 *                    短接旁路后是 15/16 = 37.5 kW（不是 40 kW）。所以这是
 *                    计数判据，不是"还能满功率"的功能判据。
 *   2000 h 无失效    lifetime 只能记 **≥2000 h（右删失）**，不能把 2000 写成
 *                    测到的寿命；要真值继续点到 3000 h 或到失效。
 *   decay ≤5 %       **本层不可判**：5 % ⇔ 16 K，与 ±5–10 K 的测温、窗口污染、
 *                    光谱失配同量级；没有光通量标准，系统差压不掉。
 *                    ⇒ 记录记 0–20 % 的实际代理值；5 % 仍是设计值（B 类，R12 未闭合）。
 *   ±5 K             本路线只读一个固定点，**不测片内均匀性**；那一格仍归
 *                    `plant/rta` 的 16 区/自转套件（`rta-uniformity.ts`），
 *                    不在本条路线。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * RTA 片内 ±5 K：A 类（≤5 K 不可测）；9 点路线只判 5–10 K
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `plant/rta` 的 `uniformity ≤5 K` 仍只是设计窗口。9 点测量路线已经写在
 * `data/measure/rta-uniformity.ts`（9 支 K 型偶 + 18 根引线 + 指零电位差计，
 * 逐支读三轮），它只判 5–10 K 档，判不了 ≤5 K；≤5 K 这一格仍按 A 类记：
 *
 *   ① `std/thermocouple-nicr-nial-general` 已补：NiCr 80/20 正极（本层电阻丝，
 *      碳 ~1.8%）+ NiAl 负极，1300–1372、氧化铝管。它不是标准 K 的
 *      90/10 低碳丝，分度逐支不同，必须配 `measure/thermocouple-cal`
 *      三点标定；T 型仍只到 400。
 *   ② 49 只 × 2 = 98 根引线；φ100 片周长 314 mm，边缘焊盘间距 3.2 mm；
 *      60 rpm 自转台没有 98 路（至少 18 路）滑环/旋转馈通。
 *   ③ 本层只有单只 `std/millivoltmeter-general`，没有 49 路（至少 9 路）
 *      扫描开关/同步采样；10 s 平台读不完 49 点；9 点路线只能逐支读。
 *   ④ 9 点是设计下限（3×3、35 mm 间距、18 根丝/18 路滑环/9 只表），不是
 *      ≤5 K 的方案；仍只能判 5–10 K 档（单支 K 型 ±2–5 K，max-min 误差
 *      4–10 K）。
 *
 *   要判 ≤5 K 先补：98/18 路滑环或馈通、49/9 路同步读数、49 点片；K 型
 *   已补但非标准，只能逐支标定。在这些之前，RTA 均匀性 ≤5 K 记 **A 类**，
 *   不写覆盖 ≤5 K 的 `measure/*` 或 `*-record`。详细缺口与 9 点网格见
 *   `rta-uniformity.ts` 文件头。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * BF₃ 的水：`measure/bf3-water` → `mat/bf3-water-record`（B 类，**仍不闭合**）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * B⁺ 硼源仍是 B 类，缺的是"BF₃ 纯度/露点实测"。
 * 这一条只补**水**，而且补得有限：它给水一条实测路线与一份记录，但**没有把
 * 10 ppm 证出来**。五句先说在前面：
 *
 *   ① **只测水，别的一格也不测。** 记录里只有 water / dewPoint / sampleId /
 *      method。BF₃ 的纯度（`mat/boron-trifluoride` 的 99.5 %）与金属杂质
 *      （Ni、Fe、Cr、B 同位素）这一条一个也不碰 —— 那要四极质谱 / FTIR 气体池 /
 *      ICP-MS，**本层三样都没有**（`ald.ts`、`implant.ts` 的"RGA（四极质谱）
 *      仍 0 台"是同一条缺口）。所以纯度 99.5 % 仍是 `make/boron-trifluoride`
 *      的目标值，不因这条路线变成实测值。
 *
 *   ② **P₂O₅ 电解池遇 HF 会被腐蚀 —— 而 BF₃ 里的水在进池子之前就变成 HF。**
 *      BF₃ + 3H₂O → H₃BO₃ + 3HF：1 个水分子带出 1 个 HF（1:1）。HF 落到
 *      P₂O₅ 膜上按 P₂O₅ + 6HF → 2POF₃ + 3H₂O 反应（POF₃ 常压下是气体，随气流
 *      走掉）—— **每 6 个 HF 放回 3 个水，正是被测的那个物种**。落到石英壁上
 *      则是 SiO₂ + 4HF → SiF₄ + 2H₂O，**同样是每 2 个 HF 放回 1 个水**。
 *      两条路都恰好 +50 %：10 ppm 的水 → 10 ppm HF → **最多**读成 15 ppm
 *      （全部反应的上界；实际落在哪边没有标定）。
 *      反过来，BF₃·H₂O、H₃BO₃ 气溶胶那种**结合态水**又进不了电解池（它读的是
 *      在膜上被电解的**自由**水）⇒ 读数偏低。**两个方向的偏差都与 10 ppm
 *      同量级，比例取决于"膜 / 壁 / 结合态"三者的分配，不是可标定的系统差。**
 *      ⇒ 这条路线**能判"湿"（露点明显高于 −60 °C 的一眼判废），判不了"合格"**
 *      （≤10 ppm 的干瓶分不开 8 与 12 ppm）。B 类不因它闭合。
 *
 *   ③ **取样必须干燥、必须旁路。** 取样管 316L 或镍内衬（Ni + HF → NiF₂
 *      钝化膜，与 `boron.ts` 的浸取槽同一条手艺；垫片镍/石墨，不用 PTFE
 *      弹性体），干 N₂ 吹扫到露点 ≤ −60 °C；**先旁路 10–20 倍把管里的空气与
 *      吸附水赶走，再切进电解池**。⚠️ 旁路吹扫解决的是**管子**（20 °C 的钢管
 *      在 1 ppm 的干气上会吸掉 90 % 的水，见 `oxygen-metrology.ts` 的
 *      sample-panel 注释），**不解决池子** —— 这是这一条最容易读错的地方：
 *      316L 让气体干净地到达仪器，然后仪器自己被吃掉。
 *      ⚠️ 还有一处硬件缺口：仪器**自己的**取样板是石英/玻璃管 + 铜针阀
 *      （`plant/dew-point-meter/sample-panel`），316L 管只能把气送到它跟前，
 *      HF 一进面板就开始蚀石英。要真做，取样板也得镍内衬 —— 本层没有这件东西。
 *
 *   ④ **池子寿命未标定。** 1 h、100 mL/min = 6 L 气、16.6 g BF₃（一瓶 0.6 kg
 *      的 2.8 %）；10 ppm 的水在这 6 L 里是 2.4 µmol，即 2.4 µmol HF，若全部
 *      落在膜上就放回 1.2 µmol 水。膜只有 mg 级（φ4 mm 内壁、300–600 mm、
 *      µm 厚），但 **"咬掉多少膜"没有读数**（没有第二只池子做对照、没有膜厚
 *      测量），所以"还能测几次"本层给不出 —— 照实写"寿命未标定"。
 *
 *   ⑤ **口径：ppm 是体积/摩尔分数，不是质量分数。** 电解池按法拉第定律把电流
 *      折成**气体里的水分子数**（13.4 µA/ppm），所以记录的 ppm 与
 *      `mat/boron-trifluoride` 的 0.001 %（1 ppm = 1e-4 %）是同一个口径。
 *      若按质量分数算，10 ppm(w) 对 BF₃ 是 37.7 ppmv、露点 −50 °C 那一侧，
 *      两者差 M(BF₃)/M(H₂O) = 3.77 倍 —— **本文件不换算，只写清按哪个口径记**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 2 nm TiN 内角覆盖：测得到什么、测不到什么（`measure/tin-2nm-corner-coverage`）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 吃 `mat/lowk-barrier-wafer`（`make/tin-2nm-ald` 产，2–2.5 nm），FIB-TEM
 * 切 5 点，读场厚/侧壁/沟底内角。
 *
 * **5 点不是全片图**：同一条薄片上的 5 个位置，不是 49 点图/全片扫描；
 * 片内均匀性、孔与孔的差异都看不见。
 *
 * **2 nm 在 TEM 下对比度低**：`plant/fib-tem` 的点分辨是 **2.9 nm**
 * （与 `measure/barrier-corner-coverage` 同一格），而 2 nm TiN 的内角只有
 * **1.1–1.5 nm** —— 是点分辨的 **0.4–0.5 倍**。所以：
 *   · 场厚 2–2.5 nm 只能读个粗窗口（±0.5 nm 量级，不是证书）；
 *   · 内角 1.1–1.5 nm **可能量不准**；`cornerCoverage 40–75 %` 是粗窗口；
 *   · 测的是**几何覆盖**，不是连续/漏电；不写“连续膜已验证”、不写“漏电已测”。
 *
 * 与 `measure/barrier-corner-coverage` 的分工：后者吃 5 nm `mat/ald-barrier-wafer`、
 * 20 条薄片、给 ±12 % 证书；本条只吃 2 nm 低 k 片、5 点、不给证书。
 * **B 类，L2**：measure 路线在，但没有实测记录前不写闭合。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const METROLOGY_MEASURE_ITEMS: readonly Item[] = [
  /**
   * 阻挡层内角覆盖证书。
   *
   * 为什么需要它：`fine-damascene.ts` 的阻挡那一格判的是"沟底内角 ≥2 nm"，
   * 而内角覆盖只有 **60–75 %**（`ald.ts` 的 88–95 % 是侧壁/场区，不是内角）。
   * 2 nm ÷ 0.60…0.75 ⇒ 场厚要 2.7–3.3 nm；再与判据上界 3 nm 一起，
   * 窗口被夹成"场厚 2.7–3.0 **且**覆盖 ≥67 %" —— 于是**判过还是判不过，
   * 全看这 60–75 % 能不能收窄**。
   *
   * ⚠️ 本层收不窄：FIB 薄片 + STEM 的点分辨是 **2.9 nm**，而要在 3 nm 膜上
   * 分辨 67 % 与 60 %（即 2.0 对 1.8 nm）—— 差的 0.2 nm 是分辨率的 **1/15**。
   * 所以证书只能给 **±12 %**（100 nm 沟、20 个剖面点统计）：
   * 分得开 60 与 75，分不开 65 与 70。
   * **该格在本层是"不可判"，不是"通过"也不是"不通过"** —— 这一句比一个假 ✓ 值钱。
   */
  {
    id: 'mat/barrier-coverage-cert',
    name: 'Barrier Layer Inner-Corner Coverage Certificate', name_zh: '阻挡层内角覆盖证书',
    unit: '件',
    category: 'part',
    props: [
      { param: 'cornerCoverage', kind: 'range', min: 0, max: 100, unit: '%' },
      { param: 'uncertainty', kind: 'range', min: 1, max: 50, unit: '%', dir: 'atMost' },
      { param: 'bottomThickness', kind: 'range', min: 0, max: 20, unit: 'nm' },
    ],
  },

  /**
   * 2 nm TiN 内角覆盖记录（`measure/tin-2nm-corner-coverage` 产出）。
   *
   * **几何覆盖，不是连续/漏电。**
   *
   *   thickness       2–2.5 nm   场厚；TEM 只能读粗窗口，不是证书
   *   cornerCoverage  40–75 %    内角覆盖；2 nm 对比度低、点分辨 2.9 nm，
   *                              1.1–1.5 nm 的内角可能量不准
   *   points          5          同一条薄片上的 5 个位置，不是全片图
   *   waferId         0–1000
   *
   * ⚠️ 2 nm 是 2.9 nm 点分辨的 0.4–0.5 倍；这条记录不能证明连续/漏电。
   * B 类，L2。
   */
  {
    id: 'mat/tin-2nm-coverage-record',
    name: '2 nm TiN Inner Corner Coverage Record', name_zh: '2 nm TiN 内角覆盖记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'filmThickness', kind: 'range', min: 2, max: 2.5, unit: 'nm' },
      { param: 'cornerCoverage', kind: 'range', min: 40, max: 75, unit: '%' },
      { param: 'points', kind: 'range', min: 5, max: 5, unit: '个' },
      { param: 'waferId', kind: 'range', min: 0, max: 1000, unit: '号' },
    ],
  },

  /**
   * RTA 40 kW 长寿命灯阵的寿命/光衰记录（`measure/rta-lamp-life` 产出）。
   *
   * **是数据，不是物料；一份记录对应一件灯阵的一轮寿命试验。**
   *
   *   lifetime  0–3000 h   测到的寿命。⚠️ 2000 h 到点没坏时只能记 **≥2000 h**
   *                        （右删失），不能把 2000 写成测到的寿命；要真值继续
   *                        点到 3000 h 或到失效。
   *   decay     0–20 %     同输入功率下由固定点温度/电流间接推的**代理值**，
   *                        不是积分球/光通量标准测到的光通量（本层没有）。
   *   failures  0–24 只    累计失效灯数。本路线是 16 只阵（0–16）；24 是给
   *                        60 kW 阵（24 只）留的通用上界。
   *   hours     0–3000 h   已累计点亮小时（100 h 一段，20 段 = 2000 h）。
   *   power     40 kW      灯阵的额定电功率（16×2.5 kW），不是失效后的实际
   *                        功率；旁路一只后实际 37.5 kW，记在步骤里。
   */
  {
    id: 'mat/rta-lamp-life-record',
    name: 'RTA 40 kW Long-Life Lamp Array Life/Lumen Depreciation Record', name_zh: 'RTA 40 kW 长寿命灯阵的寿命/光衰记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'lifetime', kind: 'range', min: 0, max: 3000, unit: 'h' },
      { param: 'decay', kind: 'range', min: 0, max: 20, unit: '%' },
      { param: 'failures', kind: 'range', min: 0, max: 24, unit: '只' },
      { param: 'hours', kind: 'range', min: 0, max: 3000, unit: 'h' },
      { param: 'power', kind: 'range', min: 40, max: 40, unit: 'kW' },
    ],
  },

  /**
   * **BF₃ 的水分记录（`measure/bf3-water` 产出）。是数据，不是物料。**
   *
   *   water     0–100 ppm   露点仪读到的水（**体积/摩尔分数**；判据 10 ppm =
   *                         0.001 %，100 ppm 是它的 10 倍）
   *   dewPoint  −80…−20 °C  同一口气的露点（P₂O₅ 电解池干端）
   *   sampleId  0–1000      瓶/取样号（与 `mat/overlay-record` 的 waferId 同一种记法）
   *   method    dew-point   本层唯一的一种：电解池 + 冷镜（`plant/dew-point-meter`）。
   *                         没有质谱/FTIR/卡尔·费休，所以没有第二种 method 可选 ——
   *                         这个枚举短，是**缺口的长度**，不是方法的长度。
   *
   * ⚠️ **water 与 dewPoint 不是一一映射，别当成同一个数的两种写法。**
   *   按冰面饱和、1 atm：0.5 ppm ⇔ −80 °C、1 ppm ⇔ −76 °C、10 ppm ⇔ −60 °C、
   *   100 ppm ⇔ −42 °C、1000 ppm ⇔ −20 °C。所以 `water 0–100` 实际对应的露点是
   *   **−80…−42 °C**；声明里写到 −20 °C 是**仪表干端的尽头**（那里已经是
   *   ~1000 ppm，water 早超出本窗口）—— 湿到那个程度的瓶子，本层**没有"判废"
   *   这个字段**，只能不出记录（路线不产），这也是 B 类的一部分。
   *
   * ⚠️ **这份记录不证明"水 ≤10 ppm"。** 读数往哪边偏，取决于 HF 蚀膜/蚀壁
   *   放出的水与结合态水各占多少（见文件头 ②），两者都与 10 ppm 同量级 ⇒
   *   记录里的 water 是**有偏的参考**：>15 ppm 足以判废（真值至少在 10 ppm
   *   以上），≤10 ppm **不能**反向证明合格（结合态水读不到）。
   *   `mat/boron-trifluoride` 的 water ≤10 ppm 仍是目标值（B 类，R12 未闭合）。
   */
  {
    id: 'mat/bf3-water-record',
    name: 'BF₃ Moisture Record', name_zh: 'BF₃ 的水分记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'water', kind: 'range', min: 0, max: 100, unit: 'ppm' },
      { param: 'dewPoint', kind: 'range', min: -80, max: -20, unit: '°C' },
      { param: 'sampleId', kind: 'range', min: 0, max: 1000, unit: '号' },
      { param: 'method', kind: 'enum', values: ['dew-point'] },
    ],
  },

  /**
   * **OES 绝对波长记录（`measure/oes-wavelength` 产出）。是数据，不是物料。**
   *
   * 一份记录 = 一次 589 nm 附近的钠 D 双线扫描（5 个点）。
   *
   *   peak1      588–590 nm   D₂ 峰位。分辨开时是实测值；未分辨时是
   *                          **约束模型的分量**（见下），不是实测峰。
   *   peak2      589–591 nm   D₁ 峰位，同上。
   *   separation 0.5–0.7 nm   两峰间距。分辨开时是实测值；未分辨时写
   *                          **已知的 0.597 nm** 作标尺 —— 这一格这时证明的是
   *                          "标尺用了多少"，不是"间距测出来多少"，记录上必须
   *                          注明"未分辨"。
   *   error      0–1 nm       标定的 **1σ 不确定度**（不是"两峰残差"——
   *                          两点定线残差恒为 0）。分辨开时 0.02–0.2 nm
   *                          （重复性 + 1 µm 估读 + 实测/设计色散之差）；
   *                          未分辨时是包络中心残差 + 半宽 0.3–0.6 nm，B 类。
   *                          **不是 200–900 nm 的误差，也不是 870 nm 的
   *                          ±0.2 nm。**
   *   points     5 个         5 个扫描点（588.9 / 589.1 / 589.3 / 589.5 /
   *                          589.7 nm），不是 5 次重复，也不是全谱图。
   *
   * ⚠️ **未分辨时的记法**：用单峰/包络的 5 点拟合出中心 c，再按名义
   *   2:1 的 D₂:D₁ 强度比把 c 拆成两条模型线（peak1 = c − 0.199、
   *   peak2 = c + 0.398；0.199/0.398 = 0.597 的 1/3 与 2/3）。自吸收会把
   *   D₂ 压低、把中心往 D₁ 推 0.05–0.2 nm，这一项已经含在 0.3–0.6 nm 的
   *   error 里，不再单独修。**这时 peak1/peak2 不是峰，是模型分量；
   *   separation 是已知值，不是测量值。**
   *
   * ⚠️ 这份记录**不证明 ±0.2 nm**，也不证明 870 nm。它只证明"在 589 nm
   *   附近，这两条已知线的位置与标尺自洽到多少"。全段的 ±0.2 nm 仍是
   *   `make/refractometer-oes-grating-spectrograph` 的设计/外推值。
   */
  {
    id: 'mat/oes-wavelength-record',
    name: 'OES Absolute Wavelength Record', name_zh: 'OES 绝对波长记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'peak1', kind: 'range', min: 588, max: 590, unit: 'nm' },
      { param: 'peak2', kind: 'range', min: 589, max: 591, unit: 'nm' },
      { param: 'separation', kind: 'range', min: 0.5, max: 0.7, unit: 'nm' },
      { param: 'error', kind: 'range', min: 0, max: 1, unit: 'nm' },
      { param: 'points', kind: 'range', min: 5, max: 5, unit: '个' },
    ],
  },

];

export const METROLOGY_MEASURE_ROUTES: readonly Route[] = [
  {
    /** 量内角覆盖：FIB 切 20 个剖面点 → STEM 读四个角 → 统计。给的是 ±12 % 的证书。 */
    id: 'measure/barrier-corner-coverage',
    name: 'Barrier Layer Inner-Corner Coverage Certificate Measurement', name_zh: '阻挡层内角覆盖证书测量',
    produces: [
      {
        item: 'mat/barrier-coverage-cert',
        qty: q(1),
        gives: [
          { param: 'cornerCoverage', kind: 'range', min: 55, max: 80 },
          { param: 'uncertainty', kind: 'range', min: 10, max: 14 },
          { param: 'bottomThickness', kind: 'range', min: 1.6, max: 2.4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ald-barrier-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room', 'plant/fib-tem'],
    steps: [
      { note_zh: 'FIB 在沟上切 20 个 5×5×0.05 µm 薄片（每片 5–5.5 h，20 片 4–5 天）', performedBy: 'plant/robot', under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }] },
      { note_zh: 'STEM 读四个内角：3 nm 膜的 67 % 与 60 % 差 0.2 nm，是 2.9 nm 点分辨的 1/15', performedBy: 'plant/e-beam-column', under: [{ param: 'pressure', min: 1e-5, max: 1e-4 }] },
      { note_zh: '统计出证书：±12 %，分得开 60 与 75，分不开 65 与 70', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(110) },
    unbalanced_zh: '阻挡片 1 + 水 1 → 证书 1 件；这一条只判不造，产物按件计（20 个薄片消耗在同一片硅上）',
  },

  {
    /**
     * **2 nm TiN 内角覆盖：FIB-TEM 切 1 条薄片、读 5 点 → 记录。**
     *
     *   低 k 阻挡片 1（`mat/lowk-barrier-wafer`，2–2.5 nm，`make/tin-2nm-ald` 产）
     *     → `mat/tin-2nm-coverage-record` 1 份
     *
     * 5 点：场区、两侧壁、沟底两个内角；同一条 5×5×0.05 µm 薄片，不是 5 条
     * 独立薄片。rate 4 h（若每点单独制样，按 fib-tem 3–7 h/片要 15–35 h）。
     *
     * ⚠️ **2 nm 对比度低，1.1–1.5 nm 内角可能量不准。**
     * `plant/fib-tem` 的点分辨是 2.9 nm，2 nm TiN 的内角 1.1–1.5 nm 是它的
     * 0.4–0.5 倍；`cornerCoverage 40–75 %` 是粗窗口，`thickness 2–2.5 nm`
     * 也只是粗读。**测的是几何覆盖，不是连续/漏电**；不写“连续膜已验证”。
     * 5 点不是全片图，片内均匀性/孔间差异看不见。
     *
     * 与 `measure/barrier-corner-coverage` 的分工：后者吃 5 nm `mat/ald-barrier-wafer`、
     * 20 条薄片、给 ±12 % 证书；本条只吃 2 nm 低 k 片、5 点、不给证书。
     */
    id: 'measure/tin-2nm-corner-coverage',
    name: '2 nm TiN Inner Corner Coverage Measurement', name_zh: '2 nm TiN 内角覆盖测量',
    produces: [
      {
        item: 'mat/tin-2nm-coverage-record',
        qty: q(1),
        gives: [
          { param: 'filmThickness', kind: 'range', min: 2, max: 2.5 },
          { param: 'cornerCoverage', kind: 'range', min: 40, max: 75 },
          { param: 'points', kind: 'range', min: 5, max: 5 },
          { param: 'waferId', kind: 'range', min: 0, max: 1000 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/lowk-barrier-wafer',
            qty: q(1),
            need: [{ param: 'barrierThickness', kind: 'range', min: 2, max: 2.5 }],
            onRelax: 'functional-lost',
          },
        ],
      },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① FIB 制样：在 2–2.5 nm TiN 的低 k 片上切 1 条 5×5×0.05 µm 薄片，减到 50 nm；取场区、两侧壁、沟底两个内角共 5 个位置。5 点是同一条薄片上的位置，不是 5 条独立薄片',
        performedBy: 'plant/fib-tem',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh:
          '② STEM 读：场厚 2–2.5 nm、侧壁/沟底内角覆盖 40–75 %。⚠️ 2 nm 对比度低，fib-tem 点分辨 2.9 nm，1.1–1.5 nm 内角可能量不准；这一条只给几何覆盖粗窗口，不是连续/漏电',
        performedBy: 'plant/fib-tem',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh:
          '③ 记录：thickness 2–2.5、cornerCoverage 40–75、points 5、waferId；B 类，L2，没有实测记录前不写闭合',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '低 k 阻挡片 1 → 记录 1 份；FIB/TEM 是破坏性，片不回收；产物按份计，没有质量账；5 点是同一条薄片上的位置，不是 5 片',
  },

  {
    /**
     * **⚠️ 没有 X 射线尺的拼接：≤10 nm，而它的错全部来自"标度"。**
     *
     *   镜坯 1 件（deviation ≤ 20）+ 氩 0.05 + 水 5 → 镜坯 1 件（deviation ≤ **10 nm**）
     *
     * 这条路线写出来**不是为了走通**，是为了把"标度"这一维零空间的价格标在数据里
     * （手法与 `make/ref-flat-hg-oxide` 在 `subnm-readout.ts` 里同一类：不复用原路线、
     * 写清为什么不通、付出什么代价）。
     *
     * ═══ 数 ═══
     *
     *   没有尺 ⇒ 标度只能靠 `std/calibrated-scale-100`（10 nm / 100 mm = **0.1 ppm**）
     *   ⇒ 面形项 0.1 × 68.9 = **6.9 nm**
     *   其余项与主路线相同（缝 0.68、零位 0.30、power 0.60、读数 0.043）
     *   ⇒ RSS = √(6.9² + 0.68² + 0.30² + 0.60² + 0.043²) = **6.95 nm**
     *
     * **所以它交的不是 5 nm，是 7 nm —— 而 ON/OFF 这一只尺的差是 100 倍（6.9 对 0.07）。**
     * 这一条是本文件最想让人记住的一句：**拼接的精度不在读数上，在两个标定上。**
     *
     * 升级路线（R8）：`plant/xray-interferometer` + `plant/ellipsoid-stitch/xray-bridge`
     * + **一次 2.3 h 的定标** ⇒ 0.001 ppm ⇒ 0.07 nm ⇒ 回到主路线 `measure/collector-stitch-subnm`。
     */
    id: 'measure/collector-stitch-noruler',
    name: 'EUV Collector Mirror Blank Measurement', name_zh: 'EUV 收集镜坯测量',
    rate: { hours: q(36) },
    produces: [
      {
        item: 'plant/euv-source/collector',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 300, max: 300 },
          { param: 'figure', kind: 'range', min: 0, max: 40 },
          { param: 'roughness', kind: 'range', min: 0, max: 0.3 },
          { param: 'deviation', kind: 'range', min: 0, max: 10 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/euv-source/collector',
            qty: q(1),
            need: [
              { param: 'aperture', kind: 'range', min: 300, dir: 'atLeast' },
              { param: 'figure', kind: 'range', max: 40, dir: 'atMost' },
              { param: 'roughness', kind: 'range', max: 0.3, dir: 'atMost' },
              { param: 'deviation', kind: 'range', max: 20, dir: 'atMost' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: [
      'plant/subnm-thermostat',
      'plant/ref-flat-interferometer',
      'plant/phase-shifter',
      'plant/stabilized-laser',
      'plant/metrology-room',
      'plant/afm',
    ],
    steps: [
      {
        note_zh: '划网格与装夹（与主路线相同：64 块、步距 35、镜子只装一次）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '7 只局部球的猫眼标定（0.3 nm，与主路线相同）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 0.005, max: 0.015 }],
      },
      {
        note_zh:
          '逐块测 + 两块位定局部 R（13.9 h + 4.3 h，与主路线相同）—— **注意：power 这一维它是补了的**，只有标度没补',
        performedBy: 'plant/ellipsoid-stitch',
        under: [{ param: 'temperature', min: 0.005, max: 0.015 }],
      },
      {
        note_zh:
          '标度只能靠台子的光栅尺 + `std/calibrated-scale-100` 反标：0.1 ppm ⇒ **6.9 nm**。这一步就是这条路线到不了 5 nm 的全部原因',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 0.005, max: 0.015 }],
      },
      {
        note_zh: '解 256 未知量并合账：RSS = √(6.9²+0.68²+0.30²+0.60²) = **6.95 nm**；写清"差的那 7 nm 是标度，不是面形"',
        performedBy: 'plant/ellipsoid-stitch',
      },
    ],
    unbalanced_zh: '镜坯 1 进、1 出；氩 0.05 与水 5 走掉 —— 与主路线同一条质量账，差别只在标度那一项',
  },

  {
    /**
     * **椭球拼接检验（主路线）：把"偏差 20 nm（10 nm 的读法说的）"换成"偏差 2 nm（1 nm 的读法证的）"。**
     *
     *   镜坯 1 件（deviation ≤ 20）+ 氩 0.05 + 水 5 → 镜坯 1 件（deviation ≤ **2 nm**）
     *
     * ⚠️ **`gives` 比 `uses` 紧，不是"测量改变了镜子"，是验收**：真值没变，
     * 变的是"我们知道的精度"。真值若在 2 nm 之外，它在这里被**判掉**
     * （与 `measure/collector-null-accept` 同一个性质）。要让镜子真的到 2 nm，
     * 得让 `make/collector-null-figure` 按这张 1 nm 的图多抛两轮 —— **那是另一条路线的账。**
     *
     * ═══ 八段，每段一个判据 ═══
     *
     *   ① 划网格：64 块、六方、步距 35（重叠 30 %）。**"64 块 + 20 %"不能同时成立**
     *      （20 % 是步距 40，那只放得下 45–55 块）。
     *   ② 7 只局部球的猫眼标定：每只 30 min，标到 0.3 nm（文件头 2.3）。
     *   ③ 站内读数自检：对板 ℱ = 224 → 0.0613 nm。**这一段的结论只对仪器，不对工件。**
     *   ④ 装冷腔 + 12 h 等温（τ = 71 min，10 τ 后振幅降到 1/22 000）。
     *   ⑤ 逐块测：定位 10 min + 8 档移相 32 s（121 点）× 64 = **13.9 h**。
     *   ⑥ 每块两块位定局部 R（猫眼 + 共心）：64 × 4 min = **4.3 h** ⇒ power 0.60 nm。
     *   ⑦ X 射线尺定横向标度：30 跳 × 4 min = **2.3 h** ⇒ 标度 0.07 nm。
     *   ⑧ 解 256 未知量（1.3×10⁷ 运算、6 s）+ 与主方案逐点比（差 ≤ 10 nm 才都算对）。
     *
     * ═══ 结果 ═══
     *
     *   RSS = √(0.68² + 0.30² + 0.60² + 0.07² + 0.043²) = **0.96 nm**
     *   ⇒ 交付窗口 2 nm（2 倍余量）；5 nm 有 5 倍；对 Hindle 的 10 nm 好 10 倍。
     *
     *   工时 38 h（Hindle 30 h 的 1.3 倍、旧拼接 384 h 的 1/10）。
     */
    id: 'measure/collector-stitch-subnm',
    name: 'EUV Collector Mirror Blank Measurement', name_zh: 'EUV 收集镜坯测量',
    rate: { hours: q(38) },
    produces: [
      {
        item: 'plant/euv-source/collector',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 300, max: 300 },
          { param: 'figure', kind: 'range', min: 0, max: 40 },
          { param: 'roughness', kind: 'range', min: 0, max: 0.3 },
          { param: 'deviation', kind: 'range', min: 0, max: 2 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/euv-source/collector',
            qty: q(1),
            need: [
              { param: 'aperture', kind: 'range', min: 300, dir: 'atLeast' },
              { param: 'figure', kind: 'range', max: 40, dir: 'atMost' },
              { param: 'roughness', kind: 'range', max: 0.3, dir: 'atMost' },
              { param: 'deviation', kind: 'range', max: 20, dir: 'atMost' },
            ],
            // 放宽到 160 nm（设计指标那一档）：块、方程、未知量全不变，
            // 只是这一遍证不到 2 nm —— **它还是拼接，还是一张 64 块的面形图**。
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: [
      'plant/subnm-thermostat',
      'plant/xray-interferometer',
      'plant/ref-flat-interferometer',
      'plant/phase-shifter',
      'plant/stabilized-laser',
      'plant/metrology-room',
      'plant/afm',
    ],
    steps: [
      {
        note_zh:
          '划网格与装夹：64 块、六方、步距 35 mm（重叠 30 %）、块心可到 r = 150（最外一圈有一部分落到镜外，只有一半视场有效）；镜子按三点球窝装**一次**，之后 64 次只搬不改装 —— 缝的共模全靠这一步',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '7 只局部球的猫眼标定：焦点落在 λ/1000 平晶上，回波 = 2×球的误差，回迹 R·θ²/2 = 0.07 nm ⇒ 每只标到 0.3 nm（7 × 30 min）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 0.005, max: 0.015 }],
      },
      {
        note_zh:
          '站内读数自检：对板（ℱ = 224）在相变恒温下读 16 帧 32 s、外推到 t = 0，得 **0.0613 nm**。**这一段证的是仪器，不是工件** —— 椭球是裸面，它的读数是 0.47 nm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 0.005, max: 0.015 }],
      },
      {
        note_zh:
          '装冷腔 + 冰浴：镜子、7 只球、X 射线桥一起进 φ400 干腔，夹套灌冰水，12 h 等温（τ = 71 min，10 τ）。**尺也必须在腔里**：腔外 0.5 K 的膨胀就是 0.1 µm ⇒ 标度 1 ppm ⇒ 69 nm',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '逐块测：定位 10 min（5 轴：x/y 350 mm、z 100 mm、俯仰/方位 ±25° @2 µrad）+ 8 档移相 32 s（2 s/步，121 点 11×11、5 mm 栅格）⇒ 13 min/块、64 块 = **13.9 h**。条纹级数由**设计**给（71 µm 的偏离 = 242 条条纹，错一级就是 244 nm 的台阶，再解一次即收敛）',
        performedBy: 'plant/ellipsoid-stitch',
        under: [{ param: 'temperature', min: 0.005, max: 0.015 }],
      },
      {
        note_zh:
          '每块两块位定局部 R：猫眼位（焦点在块面）+ 共心位（焦点在块心）各 32 s，位移 = 局部 R（343–371 mm）。1 µm 的台 ⇒ 局部 R 到 1 µm ⇒ 该块离焦 2.55 nm；64 个方程拟合全局二次项 ⇒ **power 0.60 nm**（64 × 4 min = 4.3 h）',
        performedBy: 'plant/ellipsoid-stitch',
        under: [{ param: 'temperature', min: 0.005, max: 0.015 }],
      },
      {
        note_zh:
          'X 射线尺定横向标度：30 跳 × 10 mm，每跳 10 pm ⇒ 累计 0.3 nm / 300 mm = **1×10⁻⁹（0.001 ppm）** ⇒ 面形项 **0.07 nm**。**这是全流程里最便宜、也最容易被忘掉的一步** —— 漏了它，1 ppm 就是 68.9 nm',
        performedBy: 'plant/ellipsoid-stitch',
        under: [{ param: 'temperature', min: 0.005, max: 0.015 }],
      },
      {
        note_zh:
          '解 256 个未知量（活塞 + 两向倾斜 + 离焦，4×64）：正规方程 AᵀA（156 对 × 121 点 × 36 次乘加 = 6.8×10⁵）+ Cholesky（256³/3 = 5.6×10⁶）+ 两轮迭代 = **1.3×10⁷ 次运算、6 s**；再做剪切/回迹修正（71 µm 的偏离把参考球的面形图剪切 3.9 mm）',
        performedBy: 'plant/ellipsoid-stitch',
      },
      {
        note_zh:
          '与主方案逐点比：Hindle 那条 10 nm 的图与本条 1 nm 的图**差 ≤ 10 nm 才算两边都对**（误差机制不相干：一条是球面面形 + 33 % 遮挡，一条是 64 块 + 两个零空间）。差得大了，先怀疑标度（68.9 nm/ppm），再怀疑 power（96 nm/µm）',
        performedBy: 'plant/ellipsoid-stitch',
        under: [{ param: 'temperature', min: 0.005, max: 0.015 }],
      },
    ],
    unbalanced_zh:
      '镜坯 1 进、镜坯 1 出（同一件物），氩 0.05 与水 5 走掉 —— 64 次装夹不改变质量；这条路线产出的是 7 744 个读数、一张 64 块拼起来的面形与两个零空间的标定值',
  },

  {
    /**
     * **⚠️ 只在顶点定一次 R 的拼接：≤100 nm。`null-test` 那个 0.096 nm 的真身。**
     *
     *   镜坯 1 件（deviation ≤ 20）+ 氩 0.05 + 水 5 → 镜坯 1 件（deviation ≤ **100 nm**）
     *
     * ═══ 数（三个，全部可验算）═══
     *
     *   ① 顶点一次猫眼 + 共心（1 µm 的台）⇒ R 到 1 µm
     *   ② 矢高灵敏度 dz/dR = r²/(2R²) = 22 500/(2×117 551) = **0.095 7**
     *      ⇒ δR = 1 µm ⇒ **95.7 nm**
     *   ③ `null-test.ts` 写的 0.096 nm 是 **ΔR = 1 nm** 的值（那要一只 1 nm 的台）
     *      —— **同一行里 1 000 倍的差**，本文件把它算清（第八节已记：只许改一个文件，
     *      所以没有改那一行，只能在报告里点名）。
     *
     * ═══ 它为什么还值得写出来 ═══
     *
     *   因为它正是"漏一个零空间"的代价：**缝 0.68、零位 0.30、标度 0.07 全都很好，
     *   而总数是 95.7 nm** —— 比 Hindle 主方案的 10 nm 还差 10 倍。
     *   一张"局部处处漂亮、全局错一个二次项"的面形图，是拼接最典型的失败形状。
     *
     * 升级路线（R8）：**每块 4 min × 64 = 4.3 h** 的两块位 ⇒ 0.60 nm ⇒ 回到主路线。
     * 这一条与上一条合起来说明：**拼接的两个零空间各值 96 nm 与 200 nm，
     * 而补它们一共只要 6.6 h（4.3 + 2.3）。**
     */
    id: 'measure/collector-stitch-vertex-R',
    name: 'EUV Collector Mirror Blank Measurement', name_zh: 'EUV 收集镜坯测量',
    rate: { hours: q(32) },
    produces: [
      {
        item: 'plant/euv-source/collector',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 300, max: 300 },
          { param: 'figure', kind: 'range', min: 0, max: 40 },
          { param: 'roughness', kind: 'range', min: 0, max: 0.3 },
          { param: 'deviation', kind: 'range', min: 0, max: 100 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/euv-source/collector',
            qty: q(1),
            need: [
              { param: 'aperture', kind: 'range', min: 300, dir: 'atLeast' },
              { param: 'figure', kind: 'range', max: 40, dir: 'atMost' },
              { param: 'roughness', kind: 'range', max: 0.3, dir: 'atMost' },
              { param: 'deviation', kind: 'range', max: 20, dir: 'atMost' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: [
      'plant/subnm-thermostat',
      'plant/xray-interferometer',
      'plant/ref-flat-interferometer',
      'plant/phase-shifter',
      'plant/stabilized-laser',
      'plant/metrology-room',
      'plant/afm',
    ],
    steps: [
      {
        note_zh: '划网格与装夹（与主路线相同）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '只在**顶点**做一次猫眼 + 共心定 R（1 µm 的台 ⇒ R 到 1 µm），不做 64 次两块位',
        performedBy: 'plant/ellipsoid-stitch',
        under: [{ param: 'temperature', min: 0.005, max: 0.015 }],
      },
      {
        note_zh:
          '逐块测 + X 射线尺定标度（13.9 h + 2.3 h，与主路线相同）—— **标度这一维它是补了的**，只有 power 没补',
        performedBy: 'plant/ellipsoid-stitch',
        under: [{ param: 'temperature', min: 0.005, max: 0.015 }],
      },
      {
        note_zh:
          '解 256 未知量：离焦**没有外部约束**，全局二次项任意 ⇒ 解出来的图可以整体加减一个 a·r²。判据只能靠"与 Hindle 那条 10 nm 的图比差 ≤ 10 nm"—— 而 95.7 nm 的零空间会把它顶掉',
        performedBy: 'plant/ellipsoid-stitch',
      },
      {
        note_zh: '合账：√(95.7² + 0.68² + 0.30² + 0.07²) = **95.7 nm**；写清"这 96 nm 不是面形，是没测 R"',
        performedBy: 'plant/ellipsoid-stitch',
      },
    ],
    unbalanced_zh:
      '镜坯 1 进、1 出；氩 0.05 与水 5 走掉 —— 与主路线同一条质量账。**这条路线的不平衡在信息上，不在质量上：它少做 64 次测量，代价是 96 nm**',
  },

  {
    /**
     * **双镜互测（Goniometer 法）。** 本文件的主路线，也是整个 EUV 环里
     * 唯一能对"这面镜子多少反射率"给出数字的一步。
     *
     * 四个构型、同一个探测器（问题四的数学）：
     *
     *   I₀   样品平移出束、2θ 臂转到 0°      直射（1.0）
     *   I₁   M₁ 单独在 6°                    R₁
     *   I₂   M₂ 单独在 6°                    R₂
     *   I₁₂  M₁、M₂ 串联（两次反射）           R₁R₂
     *
     *   R₁ = √(I₁₂/I₀ × I₁/I₂)，R₂ = √(I₁₂/I₀ ÷ I₁/I₂)
     *
     * **没有一处用到绝对标准**：探测器的 0.33 V/W、金黑的 95 %、光阑的 φ0.2、
     * 立体角、衰减 —— 全在比值里消掉。要的只有两件：**线性**（≤1.6 %，本层 0.3 %）
     * 与**几何一致**（同一个 6°、同一个 2θ 臂、同一个光阑、同一个面元）。
     *
     * 几何一致这一条的具体数字（题设点名的那三处）：
     *   入射角   重装重复性 0.02°（三点支承 + 同一基准面）→ **峰顶** dR/dθ = 0 → 0
     *            （只在掠入射的陡沿上才值 2 %/°：0.02° × 2 %/° = 0.04 %）
     *   立体角   2θ 臂长 60 mm、探测器 3×3 mm → Ω = 2.5e-3 sr；臂的重复性 0.1 mm → 0.3 %，
     *            而它在 I₁、I₂、I₁₂、I₀ 里**同时出现**，所以只在 I₁/I₂ 里留 0.3 %
     *   探测器位 同一个 2θ 臂、同一次抽真空 —— **不重装**，0
     *
     * 时间账：一个构型开 30 s / 关 30 s × 10 轮 = 10 min，四个构型**交替** = 40 min
     * 一个角度点；本路线按"测 12 个角度点"算 8 h：峰顶 3 点（11.5 / 11.9 / 12.3°）
     * + 两侧各 2 点定本底，够定峰高与峰位。加上 36 h 烘烤与抽气，一批 46 h。
     */
    id: 'measure/euv-mirror-mutual',
    name: 'EUV Multilayer Mirror Measurement', name_zh: 'EUV 多层膜反射镜测量',
    produces: [
      {
        item: 'std/euv-mirror-300',
        qty: q(2),
        gives: [
          { param: 'period', kind: 'range', min: 6.8, max: 7.0 },
          { param: 'pairs', kind: 'range', min: 40, max: 50 },
          { param: 'figure', kind: 'range', min: 0, max: 3 },
          { param: 'roughness', kind: 'range', min: 0, max: 0.3 },
          // 测量**不改变**反射率，它只是把一个未知变成已知。
          // 所以窗口就是 `make/euv-mirror-300` 的设计窗口：这条路线的意义是
          // **验收**（低于 55 % 的镜子在这里被判掉，不再往下走）。
          { param: 'reflectivity', kind: 'range', min: 55, max: 70 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'std/euv-mirror-300',
            qty: q(2),
            need: [
              { param: 'period', kind: 'range', min: 6.8, max: 7.0 },
              { param: 'pairs', kind: 'range', min: 40, max: 50 },
              { param: 'figure', kind: 'range', max: 3, dir: 'atMost' },
              { param: 'roughness', kind: 'range', max: 0.3, dir: 'atMost' },
              // 低于 55 % 的镜子在这里被**判掉**：测是测得出来的（互测对 R 的大小
              // 没有下限，只受信噪比限制），但测出来的是一个不合格的镜子 ——
              // 所以放宽这条要求不会让路线"差一点"，而是让它产出一个不是镜子的东西。
              { param: 'reflectivity', kind: 'range', min: 55, dir: 'atLeast' },
            ],
            onRelax: 'functional-lost',
          },
        ],
      },
      // 冷却水：DPP 的电极与探测器的冷环各要一路 20 °C 水，一批 12 个点跑 8 h。
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    needs: [
      'plant/euv-reflectometer',
      'plant/euv-source',
      'plant/euv-vacuum',
      'plant/metrology-room',
      'plant/clean-room',
      'plant/afm',
      'plant/ref-flat-interferometer',
    ],
    rate: { hours: q(46) },
    unbalanced_zh:
      '两块镜子进、两块镜子出（同一对物），水 20 kg 走掉 —— 这条路线的"产物"不是新东西，是**同一对镜子的一个数**；质量账只记这一行',
    steps: [
      {
        note_zh: '装双镜与对中：两块镜子同一炉镀、同一批装夹；用光电二极管看 DPP 的辉光对 φ0.2 光阑，偏心 < 0.05 mm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '抽真空 + 第一次烘烤：腔体 150 °C × 24 h（**探测器还没装** —— 金黑 60 °C 就烧结）',
        performedBy: 'plant/robot',
        under: [
          { param: 'temperature', min: 150, max: 150 },
          { param: 'pressure', min: 0.001, max: 0.01 },
        ],
      },
      {
        note_zh: '装探测器，第二次轻烘 60 °C × 12 h，降到 20 °C（碳氢 1e-8 → 1e-10）',
        performedBy: 'plant/robot',
        under: [
          { param: 'temperature', min: 60, max: 60 },
          { param: 'pressure', min: 1e-5, max: 1e-3 },
        ],
      },
      {
        note_zh: '测 I₀：样品平移出束 50 mm、2θ 臂到 0°；开/关各 30 s × 10 轮（本底 3.6 mW 减去）',
        performedBy: 'plant/robot',
        under: [
          { param: 'temperature', min: 19, max: 21 },
          { param: 'pressure', min: 1e-5, max: 1e-5 },
        ],
      },
      {
        note_zh: '测 I₁、I₂、I₁₂ 三个构型，**交替** 10 轮（不一口气测完 —— 本底漂移 0.1 %/30 s 会变成系统差）',
        performedBy: 'plant/robot',
        under: [
          { param: 'temperature', min: 19, max: 21 },
          { param: 'pressure', min: 1e-5, max: 1e-5 },
        ],
      },
      {
        note_zh: '角度扫描：峰位 11.9°，峰顶 0.05° 一档扫 ±1°，两侧 0.5° 一档各 2 点定本底',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-5 }],
      },
      {
        note_zh: '线性度校验：光阑换 φ1 mm（面积 ×25），看读数是不是也 ×25；若超线性就反解 ε',
        performedBy: 'plant/robot',
        under: [
          { param: 'temperature', min: 19, max: 21 },
          { param: 'pressure', min: 1e-5, max: 1e-5 },
        ],
      },
      {
        note_zh: '解方程 R₁ = √(C·D)、R₂ = √(C/D)，带 δR/R = ½√((δC/C)²+(δD/D)²)；出报告：R = 60.0 % ± 0.3 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **粗糙度上限法。** 它不测 R，它测 R 不可能超过多少。
     *
     *   TIS(13.5) = TIS(589) × (589/13.5)² = TIS(589) × 1903
     *   R ≤ R_ideal × (1 − TIS) = 70 × (1 − TIS)
     *
     * σ = 0.3 nm → TIS = 7.8 % → **R ≤ 64.5 %**
     * σ = 0.5 nm → TIS = 21.7 % → **R ≤ 54.8 %**
     * σ 只到 ±50 % → TIS 1.95–17.6 % → **R ≤ 57.7–68.6 %**（区间，不是一个数）
     *
     * ⚠️ 这条路线的产出是**上限**，不是值。所以它的 gives 里 `reflectivity` 是
     * `0–64.5`（atMost 的语义：天花板），而**任何要求 `reflectivity ≥ 55` 的
     * 地方都不会被它满足** —— 这正是 props 这一层存在的理由：一条"只给天花板"
     * 的路线，不能冒充"给了值"的路线。
     *
     * 它自己的两处缺口（文件头降级点第 7、8 条）：
     *   ① σ 只到 ±50 %（AFM 没有、干涉仪 15 nm、可见光散射 41 pW → 12 pA 对 1 nA 暗电流）
     *   ② σ 的锚点在工艺里（磨料粒径 / 10），不在测量里
     * 所以它给的是"如果 σ = 0.3 ± 0.15 nm 则 R ≤ 58–69 %"这个区间。它的价值在：
     * 当互测给出 R = 60.0 % 时，这个区间说明该数**物理上说得通**；
     * 如果互测给出 68 % 以上，那一定哪里错了（比天花板还高）。
     */
    id: 'measure/euv-mirror-tis',
    name: 'EUV Multilayer Mirror Measurement', name_zh: 'EUV 多层膜反射镜测量',
    produces: [
      {
        item: 'std/euv-mirror-300',
        qty: q(1),
        gives: [
          { param: 'period', kind: 'range', min: 6.8, max: 7.0 },
          { param: 'pairs', kind: 'range', min: 40, max: 50 },
          { param: 'figure', kind: 'range', min: 0, max: 3 },
          { param: 'roughness', kind: 'range', min: 0, max: 0.3 },
          // 0–64.5 %：这是**上限**，不是值。写成 atMost 的语义。
          { param: 'reflectivity', kind: 'range', min: 0, max: 64.5, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'std/euv-mirror-300',
            qty: q(1),
            need: [
              { param: 'period', kind: 'range', min: 6.8, max: 7.0 },
              { param: 'pairs', kind: 'range', min: 40, max: 50 },
              { param: 'figure', kind: 'range', max: 3, dir: 'atMost' },
              // 粗糙度可以放宽：更糙的镜子 TIS 更大、上限更低，**仍是有效上限**
              // （54.8 % < 64.5 %，说得更死）。所以这是真正的降级，不是换东西。
              { param: 'roughness', kind: 'range', max: 0.3, dir: 'atMost' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: [
      'plant/euv-reflectometer',
      'plant/interferometer',
      'plant/metrology-room',
      'plant/afm',
      'plant/ref-flat-interferometer',
    ],
    rate: { hours: q(6) },
    unbalanced_zh: '一面镜子进、一面镜子出（同一个物），水 5 kg 走掉；产物是它的一个上限',
    steps: [
      { note_zh: '装样品与碳光阱：镜面在中心，镜面反射进光阱，旁瓣打到光电二极管上', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '借干涉仪的钠焰做 589 nm 准直（把那片 λ/4 平晶换成被测镜）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '量 TIS(589)：样品上 1 µW、散射 41 pW（−44 dB）→ 光电二极管 12 pA（金黑热电堆只有 13 nV，看不见）；对 1 nA 暗电流只能到 ±50 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '用标准片的四档 σ 定标这条曲线（工艺锚点：σ = 磨料粒径/10）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '算 TIS(13.5) = TIS(589) × 1903，R ≤ 70 × (1 − TIS)；σ = 0.3 ± 0.15 → 1.95–17.6 % → R ≤ 58–69 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **三项验收** —— 面形、斜率、粗糙度，一项一条读法，**三项全过才算过**。
     *
     *   镜坯 1 件（deviation ≤ 20）+ 氩 0.05 + 水 5 → 镜坯 1 件（同窗口，**被验过**）
     *
     * 这条路线与 `measure/euv-mirror-mutual` 同一个性质：**它不改变镜子，
     * 它把一个未知变成已知**，所以 `gives` 与 `uses` 的窗口相同 —— 低于窗口的
     * 在这里被判掉，不再往下走。
     *
     * ═══ 三项的判据与读数 ═══
     *
     *   ① 面形 ≤ 40 nm（10 mm 周期）、偏差 ≤ 20 nm
     *      双程 + 八帧移相：读数 **0.47 nm**，系统差 **10 nm**（球标定后；有点衍射板时 6）
     *      → 能给 10 nm；对 160 nm 的设计指标好 16 倍
     *
     *   ② 斜率 ≤ 0.1 mrad —— **两条独立的读法，必须一致**
     *      (a) 零位图求导：10 nm 在 10 mm 周期上 = 2π×10/10 000 = **0.006 mrad**
     *      (b) 刀口扫像斑：0.1 mrad ↔ 0.24 mm；读 0.05 mm → **0.021 mrad**
     *      两条都在 0.1 mrad 之内 5 倍以上 → 这一项**这一层过得去**
     *
     *   ③ 粗糙度 ≤ 0.24 nm（TIS 5 %）
     *      反射计散射通道：TIS(589) → ×1 903 → TIS(13.5)；
     *      σ = 0.3 nm → **7.8 %**，差 1.55 倍 —— **这一项本文件解决不了**，
     *      它在镀膜与 `measure/euv-mirror-tis` 那条线上（文件头问题 4 ③）。
     *      写在这里是因为"验收"必须三项齐全，缺一项的验收不是验收。
     */
    id: 'measure/collector-null-accept',
    name: 'EUV Collector Mirror Blank Measurement', name_zh: 'EUV 收集镜坯测量',
    produces: [
      {
        item: 'plant/euv-source/collector',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 300, max: 300 },
          { param: 'figure', kind: 'range', min: 0, max: 40 },
          { param: 'roughness', kind: 'range', min: 0, max: 0.3 },
          { param: 'deviation', kind: 'range', min: 0, max: 20 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/euv-source/collector',
            qty: q(1),
            need: [
              { param: 'aperture', kind: 'range', min: 300, dir: 'atLeast' },
              { param: 'figure', kind: 'range', max: 40, dir: 'atMost' },
              { param: 'roughness', kind: 'range', max: 0.3, dir: 'atMost' },
              { param: 'deviation', kind: 'range', max: 20, dir: 'atMost' },
            ],
            // 粗糙度放宽到 0.5 nm（不镀膜那一档）只让 TIS 从 7.8 % 涨到 21.7 %：
            // 反射率掉、镜面寿命掉，但**它还是收集镜**（聚光、成像都还在）。
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: [
      'plant/null-test',
      'plant/ref-flat-interferometer',
      'plant/metrology-room',
      'plant/interferometer',
      'plant/euv-reflectometer',
      'plant/afm',
    ],
    steps: [
      {
        note_zh: '面形：共轭双程（F2 进、Hindle 球在 F1 返、回 F2 与透射球参考面干涉），八帧移相读 0.47 nm；把球的 10 nm 系统差按绝对检验的表逐点减掉',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '斜率 (a)：对零位图求径向导数，10 mm 档看 0.006 mrad；(b) 独立法：φ1 mm 光阑 + 刀口在 F2 后 1 200 mm 扫像斑（0.1 mrad ↔ 0.24 mm，读到 0.05 mm = 0.021 mrad）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '粗糙度：进反射计散射通道，量 TIS(589)、乘 1 903 折到 13.5 nm，σ = 0.3 ± 0.15 nm（±50 % 是本层散射法的先例）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 20, max: 150 }],
      },
      {
        note_zh: '判据与记档：三项全过才放行；每面记一张偏差图与一条刀口曲线，随板走 —— 十年后重研时它是唯一的对照',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      '镜坯 1 进、镜坯 1 出（同一件物），水 5 与氩 0.05 走掉 —— 这条路线产出的不是新东西，是**同一面镜子的三个数**；质量账只记这一行',
  },

  {
    /**
     * **亚口径拼接：8×8 = 64 块，φ50，20 % 重叠，步距 40 mm。**
     *
     *   镜坯 1 件（deviation ≤ 20）+ 氩 0.02 + 水 5 → 镜坯 1 件（deviation ≤ **10 nm**）
     *
     * 它是**第二原理**：误差机制与主方案不相干，所以两条一致才算测准。
     *
     *   主方案（双程）  误差 = 一只球面的轴对面形（m = 0，转动平均对它完全无效）
     *   拼接           误差 = 64 块铺在 50 mm 栅格上（m ≠ 0，且基频跑在 10 mm 指标之外）
     *   → 两者一通一不通，**正好互相补**。与 `ref-flat.ts` 第三节"液面破 m = 0 盲区"
     *     同一个结构：不是"再测一遍"，是"换一种不会犯同一个错的方法"。
     *
     * ═══ 三个数 ═══
     *
     *   ① **64 块不是 36 块**：300²/50² = 36 是"不重叠"的数，而无重叠就没有方程 ——
     *      倾斜/离焦不是解出来的，是从重叠里解出来的。留 20 % 重叠 → 8×8。
     *      ⚠️ 8×8 铺的是**外接正方形**；φ300 的圆里只落 **约 50 块**（π/4 = 78.5 %），
     *      四角 14 块在镜外。以后若要按圆排，步距 40 在 φ300 里是 45（方）/55（六方）块 ——
     *      见 `ellipsoid-stitch.ts` 的 64 块/30 % 重叠（步距 35，那是把重叠加到 30 % 换缝）。
     *   ② **缝的底是 5 nm，不是 11.5 nm**：11.5 = 1 µm × 11.5 mrad 是"没解倾斜"的上界；
     *      解完之后 1 µm 只落一次项与二次项，残差三阶 10⁻¹⁵ nm。真正的缝是
     *      子孔径自己的零位（每块相对它的最佳球只差 1 µm = 3 条条纹、0.06 mrad
     *      → 用球就够），而那份误差铺在 50 mm 上，10 mm 谐波只剩 1/5。
     *      ⚠️ "1 µm" 是**子午线一维**的数；二维（像散 67.5 + 彗差 21.0）是
     *      **块心 0.18 µm → r=140 处 71 µm**，本检具只解倾斜/离焦，解不掉这两项 ——
     *      这是一维口径下算漏的，实测要按 71 µm 的三条条纹余量算。
     *   ③ **算力不是瓶颈**：192 个未知量（含离焦 256），4 位机要 20 天，
     *      `std/cpu-32bit-general` 要分钟级，机器人自带算力就够。
     *
     * ═══ 它测不到的那个数 ═══
     *
     * 全局 power（"整块椭球当球看有多大"）是拼接方程的**一维零空间**。必须另用
     * 共心/猫眼位定顶点 R：1 µm 的台 → R 到 1 µm → 矢高 22 500×10⁻³/(2×117 551) = **95.7 nm**。
     * 这一个数不补，R 差 0.1 mm 就是 9.6 µm 的面形差 —— 拼接会以为自己测得很准。
     */
    id: 'measure/collector-stitch',
    name: 'EUV Collector Mirror Blank Measurement', name_zh: 'EUV 收集镜坯测量',
    produces: [
      {
        item: 'plant/euv-source/collector',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 300, max: 300 },
          { param: 'figure', kind: 'range', min: 0, max: 40 },
          { param: 'roughness', kind: 'range', min: 0, max: 0.3 },
          { param: 'deviation', kind: 'range', min: 0, max: 10 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/euv-source/collector',
            qty: q(1),
            need: [
              { param: 'aperture', kind: 'range', min: 300, dir: 'atLeast' },
              { param: 'figure', kind: 'range', max: 40, dir: 'atMost' },
              { param: 'roughness', kind: 'range', max: 0.3, dir: 'atMost' },
              { param: 'deviation', kind: 'range', max: 20, dir: 'atMost' },
            ],
            // 放宽到 160 nm（设计指标那一档）：未知量不变、方程不变，
            // 只是放弃"读出 10 nm"这件事 —— **它还是拼接，还是第二原理**。
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/null-test', 'plant/metrology-room', 'plant/interferometer', 'plant/ref-flat-interferometer', 'plant/afm'],
    steps: [
      {
        note_zh: '划网格：8×8、步距 40 mm、20 % 重叠（36 是无重叠的数，那版没有方程可解）；把 64 个位置写进台子的程序',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '定全局 power：共心位（焦点落在每块的局部球心）与猫眼位（焦点落在面上）各测一次，1 µm 台定顶点 R → 矢高 95.7 nm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '逐块测：每块的局部最佳球先解掉（残余 1 µm = 3 条条纹、0.06 mrad），八帧移相读 0.47 nm；64 块 × 6 h = 384 h',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '解 192 个未知量（活塞 + 两向倾斜；含离焦 256）：重叠区的最小二乘，256³ 次运算 —— 32 位机分钟级，4 位机 20 天',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '与主方案逐点比：**两条路的差 ≤ 10 nm 才算两边都对**（误差机制不相干，见本条注释）；差得大了，先怀疑子孔径零位，再怀疑球的标定',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(400) },
    unbalanced_zh:
      '镜坯 1 进、镜坯 1 出（同一件物），水 5 与氩 0.02 走掉 —— 64 次装夹不改变质量；这条路线产出的是 64 张子图与一张拼起来的面形',
  },

  {
    /**
     * **量铪里的氧（#23 的第二块：金属里的氧含量）—— `hafnium.ts:519` 那句"估的"落点。**
     *
     *   铪 1 kg（氧 500–3000 ppm，**估的**）→ 铪 1 kg（**氧 ≤1000 ppm 已被证实**）
     *
     * ⚠️ **`uses` 里的 `mat/hafnium` 是本文件唯一一处投料白名单例外**（§二），
     * 理由：全表只有它声明了 `oxygen` 属性（`hafnium.ts:526`），而它正是这台仪器
     * 存在的理由。要守白名单就删这一条 `uses`，代价是这台仪器 `idle_machine`。
     *
     * 步骤与数（§一问 3）：
     *
     *   ① **空烧坩埚（空白）**：3000 °C / 30 s，1000 A 通坩埚自身，把吸附氧先放掉；
     *      空坩埚走完整周期的读数 ≤5 ppm —— 这一条决定判据能不能落地
     *   ② **熔融**：0.5 g 样品 + 助熔（本层没有镍、没有锡 ⇒ **不加助熔**，靠 3000 °C
     *      本身），40 s；样品里的氧被碳还原成 CO
     *   ③ **载气与检测**：氩 0.5 L/min、释放 30 s = 250 mL 气；0.5 g × 500 ppm = 0.25 mg 氧
     *      = 15.6 µmol CO ⇒ 在 10.4 mmol 载气里是 **1 500 ppm**（1 ppm 氧 ⇒ 3.0 ppm CO）
     *   ④ **红外**：CO 的 2.3 µm 泛频（线型 × 光程 ≈ 1.5×10⁻⁵ 每 ppm 每 m，1 atm 展宽）、
     *      1 m 光程，A(1 500 ppm) = **2.3×10⁻²**、A(3.0 ppm) = **4.7×10⁻⁵**
     *      ⇒ 热电堆 + 10 s 积分够（NEP 1e-8 W/√Hz 对 1 µW 级信号）
     *   ⑤ **判据**：核级/靶材 ≤1000 ppm；本机的 ±3 % + 空白 5 ppm ⇒ 判得出（**这是 #23 里
     *      第一次"估"变成"测"**）
     */
    id: 'measure/hafnium-oxygen',
    name: 'Oxygen-in-Hafnium Measurement Production', name_zh: '量铪里的氧制备',
    rate: { hours: q(2) },
    produces: [
      {
        item: 'mat/hafnium',
        qty: q(1),
        gives: [
          { param: 'purity', kind: 'range', min: 98, max: 99.9 },
          { param: 'zrInHf', kind: 'range', min: 0, max: 2000 },
          { param: 'oxygen', kind: 'range', min: 0, max: 3000 },
        ],
      },
    ],
    uses: [
      // ⚠️ 唯一一处白名单例外，见 §二 与上面的注释。
      {
        anyOf: [
          {
            item: 'mat/hafnium',
            qty: q(1),
            need: [{ param: 'oxygen', kind: 'range', min: 0, max: 5000, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room', 'plant/hv-test-bench'],
    steps: [
      {
        note_zh:
          '空烧坩埚（空白）：1000 A / 3.5 V 通 30 s 到 3000 °C，坩埚灰里的吸附氧先放掉；空坩埚整周期读数 ≤5 ppm 才算过',
        performedBy: 'plant/inert-gas-fusion-analyzer',
        under: [{ param: 'temperature', min: 2400, max: 3000 }],
      },
      {
        note_zh:
          '取样与熔融：0.5 g 铪屑（车屑或剪屑）+ 新坩埚，40 s 到 3000 °C；石墨把 HfO₂ 还原成 HfC + CO（这一步只与碳和温度有关）',
        performedBy: 'plant/inert-gas-fusion-analyzer',
        under: [{ param: 'temperature', min: 2400, max: 3000 }],
      },
      {
        note_zh:
          '载气与检测：氩 0.5 L/min、释放 30 s = 250 mL 气；500 ppm O 的 0.5 g 样 ⇒ 15.6 µmol CO ⇒ 1 500 ppm 峰浓度；2.3 µm / 1 m 光程 ⇒ A = 2.3 %',
        performedBy: 'plant/inert-gas-fusion-analyzer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '反算与判据：ppm O = A/A_单位 × 稀释比 ÷ 样品质量；判据 ≤1000 ppm（核级/靶材）；±3 % + 空白 5 ppm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '铪 1 kg（未判）+ 氩 0.01 kg → 铪 1 kg（**同一批料，只是被验过了**）+ 取样熔掉的 0.5 g 与氩 0.01 kg（吹扫与载流，全走掉）；0.5 g 在这个刻度上是 0.05 %，与那 0.01 kg 的氩按同一口径记在差额里，不单列条目',
  },

  {
    /**
     * **量氮气里的水（#23 的第三块：气体中的水分）。**
     *
     *   氮 1 kg（未判）→ 氮 1 kg（**水 ≤10 ppm 已被证实**）
     *
     * 这一条是 `rie.ts` 的"刻蚀腔水汽只能算 12–120 ppm"、`pcb.ts` 的"层间氧化只能看颜色"、
     * 燃气泄漏那三处共同的答案。步骤与数：
     *
     *   ① **P₂O₅ 池（干端）**：100 mL/min、13.4 µA/ppm ⇒ 10 ppm = **134 µA**；
     *      1/10 格 = 1 nA ⇒ 75 ppt 的理想分辨，本底 1–3 µA 把判据压到 **0.1 ppm**
     *   ② **冷镜（湿端）**：湿端（−20…+20 °C）电解池饱和，换冷镜；镜温 ±1.0 K ⇒ ±6 % RH
     *   ③ **判据**：露点 ≤ −60 °C = 10 ppm（`diffusion.ts` 的气路判据）
     *
     * ⚠️ 这条路线**不需要 `under` 温度**：P₂O₅ 池在室温工作，冷镜的 −80…−70 °C 由
     * `plant/xenon-loop` 的 holds 给，而镜温本身是**被测量**，不是"必须维持的环境条件"
     * —— 两者不能混成一句 `under`。
     */
    id: 'measure/nitrogen-moisture',
    name: 'Water-in-Nitrogen Measurement Production', name_zh: '量氮气里的水制备',
    rate: { hours: q(4) },
    produces: [
      {
        item: 'mat/nitrogen-characterized',
        qty: q(1),
        gives: [
          { param: 'concentration', kind: 'range', min: 99.5, max: 100 },
          { param: 'oxygen', kind: 'range', min: 1e-12, max: 1 },
          { param: 'moisture', kind: 'range', min: 0.01, max: 3000 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/nitrogen',
            qty: q(1),
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    // ⚠️ 不写 `plant/dew-point-meter` —— 它已经是三段工序的执行者，再进 needs 就是
    // 同一个事实两个说法（`redundant_need`）。
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh:
          '干端：P₂O₅ 池 250 V/5 段、100 mL/min；10 ppm ⇒ 134 µA，判 1 nA ⇒ 75 ppt；本底跑 1 h 记 ≤3 µA（这一条是判据的真正分母）',
        performedBy: 'plant/dew-point-meter',
      },
      {
        note_zh:
          '湿端：冷镜降到 −20…+20 °C 的设定点，光电判露（反射掉 10–30 % 为结露），镜温 ±1.0 K ⇒ 露点 ±1 K（±6 % RH）',
        performedBy: 'plant/dew-point-meter',
      },
      {
        note_zh: '判据：露点 ≤ −60 °C（= 10 ppm）为合格；分辨 0.05 ppm = 0.5 °C 露点 @−60；反算 p_H₂O = 13.4 µA / ppm 的法拉第式',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **量氮气里的氧（#23 的第一块：气体中的氧分压）。**
     *
     *   氮 1 kg（未判）→ 氮 1 kg（**氧 ≤1 ppm 已被证实**）
     *
     * 这条路线就是 `diffusion.ts` 气路纯化器那一句"判据 100 ppm、机器 50–500 ppb、
     * 本层测不了"的答案。步骤与数：
     *
     *   ① **标斜率（温度）**：干空气 0.2095 与 `mat/oxygen` 0.995 两个参考气，
     *      E = −32.66 mV；读数 6 µV ⇒ 比值 2×10⁻⁴，但参考气纯度只给 0.6 %
     *      ⇒ **T = 973 ± 6 K**（这是整套仪器的精度上限，D9）
     *   ② **取样**：100 mL/min、旁路 15 倍、伴热 50 °C；死体积 5 cm³ ⇒ 换气 3 s
     *   ③ **读数**：能斯特电压 257–691 mV 与分压器反向串联到零，检流计判 1/10 格 = 1 µV
     *      ⇒ 0.0002 个数量级
     *   ④ **反算**：p = 0.2095·exp(−4FE/RT)，用 ① 定出的 T；判据氧 ≤10⁻⁶ atm（1 ppm）
     *
     * ⚠️ `needs` 里必须有 `plant/resistance-furnace`：700–800 °C 不是本机给的（§条目注释）。
     */
    id: 'measure/nitrogen-oxygen',
    name: 'Oxygen-in-Nitrogen Measurement Production', name_zh: '量氮气里的氧制备',
    rate: { hours: q(3) },
    produces: [
      {
        item: 'mat/nitrogen-characterized',
        qty: q(1),
        gives: [
          { param: 'concentration', kind: 'range', min: 99.5, max: 100 },
          { param: 'oxygen', kind: 'range', min: 1e-12, max: 1 },
          { param: 'moisture', kind: 'range', min: 0.01, max: 3000 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/nitrogen',
            qty: q(1),
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: ['plant/resistance-furnace', 'plant/metrology-room'],
    steps: [
      {
        note_zh:
          '标斜率（电池当温度计）：干空气 0.2095 与 `mat/oxygen` 0.995 交替进样品侧，E = −32.66 mV ± 0.6 % ⇒ T = 973 ± 6 K',
        performedBy: 'plant/oxygen-probe',
        under: [{ param: 'temperature', min: 700, max: 800 }],
      },
      {
        note_zh: '取样：100 mL/min、旁路 15 倍、伴热 50 °C、死体积 5 cm³（换气 3 s）；参比侧走同一根石英管',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 700, max: 800 }],
      },
      {
        note_zh:
          '指零读数：E 与 6.2 V/10⁵ 分压器反向串联，检流计 0.01 µA/格（串 1 kΩ = 10 µV/格）判 1/10 格 = 1 µV',
        performedBy: 'plant/oxygen-probe',
        under: [{ param: 'temperature', min: 700, max: 800 }],
      },
      {
        note_zh:
          '反算与判据：p = 0.2095·exp(−4FE/RT)；氧 ≤10⁻⁶ atm（1 ppm）为合格，分辨 10⁻⁴ 个数量级 ⇒ 0.3 % 的比值',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **量氧气自己的纯度（同一只电池的另一端：0.2–1 atm）。**
     *
     *   氧 1 kg（90–99.5 %）→ 氧 1 kg（**≥90 % 已被证实**）
     *
     * 这一端是量程的顶上（0.9–0.995 atm），电压只有 ∓16 mV，是**最容易**的一段；
     * 放在文件里的理由是它对 `mat/oxygen` 的 `purity` 有用：电解水出来的氧 90–99.5 %
     * 从来没被任何东西量过（`electrolyzer` 的 gives 都是工艺保证）。
     *
     * ⚠️ 与 `measure/nitrogen-oxygen` 共用同一套标定（同一只电池、同一个 973 K），
     * 所以两条路线**共用 ① 那一步**：这不是重复，是同一台仪器的一次开机。
     */
    id: 'measure/oxygen-purity',
    name: 'Oxygen Purity Measurement Production', name_zh: '量氧气自己的纯度制备',
    rate: { hours: q(2) },
    produces: [
      {
        item: 'mat/oxygen',
        qty: q(1),
        gives: [{ param: 'purity', kind: 'range', min: 90, max: 99.5 }],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/oxygen',
            qty: q(1),
            need: [{ param: 'purity', kind: 'range', min: 90, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: ['plant/resistance-furnace', 'plant/metrology-room'],
    steps: [
      {
        note_zh:
          '同一次开机：干空气 0.2095 与样品 0.9–0.995 交替；E = 20.965·ln(0.2095/p) ⇒ 0.9 atm 是 −15.3 mV、0.995 是 −32.66 mV（**信号很小，正好检验 ① 的标定**）',
        performedBy: 'plant/oxygen-probe',
        under: [{ param: 'temperature', min: 700, max: 800 }],
      },
      {
        note_zh: '反算纯度：p = 0.2095·exp(−4FE/RT)，纯度 = p/1 atm；判据 90–99.5 %，E 分辨 6 µV ⇒ 0.03 % 纯度',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **均匀性量测：涡流 9 点（每片）+ 椭偏 49 点（1/25）+ 干涉仪台阶（1/25）。**
     *
     *   进 1 片 → 出 1 片（**同一批料，只是被验过了** —— `oxygen-metrology.ts` 的
     *   `measure/*` 路线同一个写法，所以两边都是 `mat/damascene-layer`、质量账平）。
     *
     * 三步就是 §5.1–5.3 的答案：
     *   ① **涡流单探头 9 点**（`plant/cmp-integration` 的探头 + 本文件的扫描台）：
     *      不配对 ⇒ 2–6 nm，9 点 × 15 s = **2.7 min/片** ⇒ **每片都做**
     *   ② **椭偏 49 点**（`plant/ellipsometer`，60 s/点）：**49 min/片 ⇒ 只能 1/25**
     *   ③ **干涉仪台阶**（`plant/interferometer`，15 nm 一档）：给涡流与椭偏**绝对定标**
     *      （1/25 片切方坑），否则 2–6 nm 的"相对分辨"没有锚
     *
     * ⚠️ **它不改 dishing 的窗口**：`gives` 与 `make/cmp-endpoint-optical` 同窗口
     * （dishing 7–12 nm）。本文件确实知道均匀性从 8–12 % 到了 5–6 %，
     * 而那会把 `cmp-integration.ts` 预算表里 "② 清铜必须的过抛 = 片内 % × 600 nm"
     * 那一项从 48–72 nm 压到 30 nm ⇒ dishing 应当再小几 nm。
     * **但模型里属性不沿链传递**（`cmp-integration.ts` 缺口⑧），所以不冒充、
     * 不给更窄的 `dishing` 窗口 —— 那一格要等属性传递那一层建起来。
     */
    id: 'measure/cmp-uniformity-map',
    name: 'Single-Layer Copper Interconnect Wafer Measurement', name_zh: '单层铜互连片测量',
    rate: { hours: q(1, 10) },
    produces: [
      {
        item: 'mat/damascene-layer',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 3000, max: 5000 },
          { param: 'aspectRatio', kind: 'range', min: 0.08, max: 0.13 },
          { param: 'dishing', kind: 'range', min: 7, max: 12 },
          { param: 'barrierThickness', kind: 'range', min: 5, max: 10 },
          { param: 'kValue', kind: 'range', min: 4.0, max: 4.5 },
          { param: 'layers', kind: 'range', min: 1, max: 1 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/damascene-layer', qty: q(1) }] }],
    needs: ['plant/cmp-uniformity-kit', 'plant/metrology-room', 'plant/clean-room'],
    steps: [
      {
        note_zh:
          '涡流 9 点（3 半径 × 3 方位，15 s/点 = 2.7 min）：**单探头、不配对** —— 配对的 3–5 % 一消失，1.67 %/10 nm 的信号对 0.2–1 % 的 2 min 漂移就是 2–6 nm；方位那 3 点当"轴对称性判据"（≤1 %）',
        performedBy: 'plant/cmp-integration',
      },
      {
        note_zh:
          '椭偏 49 点（7 半径 × 7 方位，60 s/点 = 49 min，**1/25 片**）：光斑 0.2–2 mm 在 3–5 µm 的图形上是"块平均膜厚"，正好是要的去除率块平均',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '干涉仪台阶（1/25 片切 1 mm 方坑，15 nm 一档）：给涡流与椭偏绝对定标；它同时是 dishing 的抽检（判据 10 nm 落在量具极限上，见 `cmp-integration.ts:1133`）',
        performedBy: 'plant/interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '反馈：9 点的径向剖面 → 内/外区压比（`plant/cmp-uniformity-kit` 的执行器拧 1/4 圈 = 2.5 %）；每 25 片的 49 点图重标一次"翘曲 → 压比"的系数（片批换了就重标）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **量测：装片 → 对中光栅 → 逐层溅射 + 逐层计数 → 坑深定标 → 反演。**
     *
     *   退火片 1 + 氧 0.02 + 氩 0.005 + 氮 0.3 + 水 1 → 带剖面的片 1 片
     *
     * **这条路线是 §〇 那四行开环的唯一交付者**，它的三个输出对应三个开环：
     *
     *   junctionDepth   ∫I dz/SF 沿深度找 1e17 cm⁻³ 的位置 ⇒ **0.152 µm ±10 %**
     *                   （`implant.ts` 的 0.088–1.73 µm 区间从此成为"退火前的不确定度"）
     *   doseMeasured    整条剖面的积分 ⇒ 与注入机记的 1.5–2.5e15 独立比一次
     *                   **两个数差 ≤20 %** 才算这条路线合格（互证，不是自证）
     *   hfZrRatio       在没有硅的层（HfO₂ 膜）里取 Hf⁺(178/180) 与 Zr⁺(90) 的比
     *                   ⇒ **±3 %**（比值，剂量与传输率全约掉）
     *
     * 时间账（3 keV 工作点、53 nA、0.33 nm/s、200 µm 光栅）：
     *
     *   0.152 µm 的剖面：深度分辨 8 nm ⇒ **8 nm 一格 = 19 点**
     *   每点 1 s（1 s 率表）+ 跳峰与稳定 1 s ⇒ **2 s/点**，19 点 = **38 s**
     *   溅射 0.152 µm/0.33 nm/s = **460 s** ⇒ **采集藏在溅射里，不占时间**
     *   ⇒ 剖面本身 **8 min**；进样 25 min、对中 10 min、坑深 15 min（干涉仪）
     *   ⇒ **一片一小时**（含装片）。**这是"破坏性"的账**：那一点上 200×200 µm 的
     *   材料没了，40 nm 的线宽上就是 **5000 根线**。
     *
     * ⚠️ 坑深定标两条路（§一 Q5②）：**200–1000 nm 用 `plant/interferometer`**
     * （0.295 µm/条纹、读 1/50 条 = 6 nm ⇒ ±3 %）；**20–100 nm 用 `plant/fib-tem`**
     * （4 nm 束斑的剖面，±5 nm）—— 后者 5 h/片，所以浅坑的标定**一次做一批**，
     * 不是每片都切。
     *
     * ⚠️ **本机在 `needs` 里，不在 `performedBy` 里** —— 102 台的白名单不含第 103 台
     * （§二与 `ellipsometer.ts:1353` 同一个处理）。本机只当前提，
     * 执行者填 `plant/robot`：它装片、它对中、它记录，本机提供那 1e-6 Pa 与那个束。
     */
    id: 'measure/sims-depth-profile',
    name: 'Cross-Section Sample Wafer Measurement', name_zh: '剖面样品片测量',
    rate: { hours: q(1) },
    produces: [
      {
        item: 'mat/sims-profiled-wafer',
        qty: q(1),
        gives: [
          { param: 'junctionDepth', kind: 'range', min: 137, max: 167 },
          { param: 'doseMeasured', kind: 'range', min: 1.2e15, max: 2.8e15 },
          // ⚠️ 这一片没有 HfO₂ 膜，所以 hfZrRatio 报 0（"无膜、未测"）。
          // 同一个条目也被"栅介质剖面"那一次量测用，那时它报的是真比值（±3 %）。
          { param: 'hfZrRatio', kind: 'range', min: 0, max: 1000 },
          { param: 'depthResolution', kind: 'range', min: 7, max: 9 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/rtp-annealed-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/sims', 'plant/metrology-room', 'plant/euv-vacuum'],
    steps: [
      {
        note_zh:
          '进样与抽气：60 °C/20 min 烘 + 传递（25 min，上限由光刻胶定）；一次束通气 0.05 sccm',
        performedBy: 'plant/robot',
        under: [
          { param: 'temperature', min: 19, max: 21 },
          { param: 'pressure', min: 1e-6, max: 1e-5 },
        ],
      },
      {
        note_zh:
          '对中与光栅校准：3 keV/53 nA/φ60 µm、200 µm 光栅、30 µm 门；用 ²⁸Si⁺ 锁峰（±0.01 u）',
        performedBy: 'plant/robot',
        under: [
          { param: 'temperature', min: 19, max: 21 },
          { param: 'pressure', min: 1e-6, max: 1e-5 },
        ],
      },
      {
        note_zh:
          '逐层溅射 + 跳峰采集：Al⁺(27)/Si⁺(28)/SiH⁺(29)/P⁺(31)/Hf⁺(180)/Zr⁺(90) 六个峰，8 nm 一格的深度网格',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh:
          '坑深定标：干涉仪读 200–1000 nm 的坑（0.295 µm/条纹、6 nm/读 ⇒ ±3 %）；浅坑用 FIB 剖面（±5 nm，一批一次）',
        performedBy: 'plant/interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '反演与出证：∫I dz/SF 定 junctionDepth（1e17 cm⁻³ 的交点）与 doseMeasured；比值定 hfZrRatio；Δz 与检出限一起进证书',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '退火片 1 + 氧 0.02 + 氩 0.005 + 氮 0.3 + 水 1 → 带剖面的片 1 片；溅射掉的 200×200×0.15 µm 只有 5.5×10⁻¹¹ kg（以离子形式进泵），氧是束，氩是泛射枪的备用气，氮是回填。产物按片计，不做质量守恒',
  },

  {
    /**
     * **0.1 nm 读数（闭环，主路线）。** 在 0.01 °C 的相变恒温腔里读三次、外推到 t = 0。
     *
     *   参考面 1 件（figure ≤ 0.1、R ≥ 98.5）+ 氩 0.01 + 氮 0.01
     *   → 参考面 1 件（**同窗口，被验过**）
     *
     * 这条路线与 `measure/collector-null-accept` 同一个性质：**它不改变镜子，
     * 它把一个未知变成已知**，所以 `gives` 与 `uses` 的窗口相同。
     *
     * ═══ 为什么这一条能到 0.1 nm：三项 RSS ═══
     *
     *   ① 读数     ℱ = π√0.986/(1−0.986) = **224** → λ/(40ℱ) = **0.0545 nm**
     *   ② 热       腔的平台 2×10⁻⁴ K → 103.1 × 2×10⁻⁴ = **0.0206 nm**
     *              （夹套本身给 1×10⁻⁴ K → 0.0103 nm；窗口、支撑、通气孔各是一条热桥，
     *                装成腔之后按 2 倍留余量）
     *   ③ 标定     108 次换位的角向平均残差 **0.019 nm**（`ref-flat.ts` 第三节）
     *
     *   RSS = √(0.0545² + 0.0206² + 0.019²) = **0.0613 nm** ✓（好 1.6 倍）
     *
     *   再算上镀膜的方位向（≤0.0149 nm）：√(…+0.0149²) = **0.0631 nm**
     *
     * ═══ 光路的四件事，每一件都是一个"不做就输"的数 ═══
     *
     *   · **全口径照明**：吸收 1.4 % × 145 mW = 2 mW，摊在 φ300 上 0.03 W/m²，
     *     局部 ΔT < 10⁻⁵ K。**聚成 φ10 的光斑就是 4.5×10⁻³ K = 0.15 nm 的鼓包。**
     *   · **间隙 2–3 µm**：ℱ × 2d ≤ L = 1 m ⇒ d ≤ 2.2 mm，2–3 µm 有 700 倍余量；
     *     而且 2.5 µm 的楔形给 10 条条纹，条纹间距 30 mm、半宽 0.13 mm —— 眼睛看得见。
     *   · **背面磨毛 + 1° 楔角**：1 m 的相干会看见两块板的背面反射（170 mm 光程），
     *     把对比度从 0.98 打到 0.90。磨毛 + 楔角把背面反射折出光路（降级⑨）。
     *   · **窗口的畸变不用管**：菲索在参考面处才分束，窗口在分束之前 ——
     *     它的 0.8 µm 波前畸变对整个视场是共模的，抵消。**这是冷腔能造出来的全部理由。**
     */
    id: 'measure/subnm-readout',
    name: 'λ/1000 Reference Flat Element Measurement', name_zh: 'λ/1000 参考面元件测量',
    rate: { hours: q(36) },
    produces: [
      {
        item: 'plant/ref-flat-interferometer/reference-flat',
        qty: q(1),
        gives: [
          // 三项 RSS = 0.0613 nm ⇒ 窗口写到 0.1（下一档是 0.52，差 5 倍，没必要）。
          { param: 'figure', kind: 'range', min: 0, max: 0.1 },
          { param: 'reflectivity', kind: 'range', min: 98.5, max: 99.5 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/ref-flat-interferometer/reference-flat',
            qty: q(1),
            need: [
              { param: 'figure', kind: 'range', min: 0, max: 0.1, dir: 'atMost' },
              { param: 'reflectivity', kind: 'range', min: 98.5, dir: 'atLeast' },
            ],
            // 用铝膜的 R = 0.88：ℱ 从 224 掉到 25，读数从 0.0545 掉到 0.497
            // —— 它还是"一块被验过的参考面"，只是验到 0.5 nm 那一档。
            // **功能还在（还是读数），所以是降级。**
            onRelax: 'functional-kept',
          },
        ],
      },
      // 0.01 kg 氩：冷腔的干燥吹扫（每次开门换气 10 s，含 20 次装夹）。
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
      // 0.01 kg 氮：吹窗防霜（在 −30 °C 露点的火星气里其实用不上，留一手）。
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 100) }] },
    ],
    needs: [
      'plant/subnm-thermostat',
      'plant/ref-flat-interferometer',
      'plant/stabilized-laser',
      'plant/metrology-room',
    ],
    steps: [
      {
        note_zh:
          '预对准（19–21 °C，腔外做）：三点支撑对位、Z 量块定 2–3 µm 间隙的三根石英垫片、把光束扩到全口径（**不许聚焦**：φ10 的光斑在 145 mW 下给 0.15 nm 的鼓包）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '液面定 m = 0（先做，在 19–21 °C）：把参考面放到 φ400 液面槽上，减掉 φ300 上 3.3 nm 的可算球面项 —— 这一项是多光束测不出、装调也补不掉的那一半（`ref-flat.ts` 第三节）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '装冷腔 + 冰浴：把参考面与对面板一起装进 φ400 干腔，夹套灌冰水，12 h 等温（τ = t²/κ = 4 245 s = 71 min，12 h 是 10 τ，振幅降到 1/22 000）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '16 帧移相 32 s（2 s/帧，光电二极管；眼睛 4 s/帧只能 8 帧）：`plant/phase-shifter` 的石英压电堆推 λ/8 = 61 nm/步，八帧最小二乘解出相位，δ 也当未知数解',
        performedBy: 'plant/phase-shifter',
        under: [{ param: 'temperature', min: 0.005, max: 0.015 }],
      },
      {
        note_zh:
          '32 s 内读三次、线性外推到 t = 0：残差 = 52 × (30/4245)²/2 = 0.0013 nm。**这一步是候选 3 那条路的落地 —— 但它只在"单指数漂移"下成立，所以恒温腔（候选 1）是主，它是辅**',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 0.005, max: 0.015 }],
      },
      {
        note_zh:
          '换位置复测三次（每次 120°、重新装夹在同一三个球窝上）：装夹的重复性靠球窝，不靠台子；三次的图像差异就是重复性那一项',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 0.005, max: 0.015 }],
      },
      {
        note_zh:
          '合账：三项 RSS = √(0.0545² + 0.0206² + 0.019²) = 0.061 nm；四项（加镀膜方位向 0.0149）= 0.063 nm。**判据 0.1 nm，余量 1.6 倍**。记一张偏差图随板走',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 0.005, max: 0.015 }],
      },
    ],
    unbalanced_zh:
      '参考面 1 件进、1 件出（同一件物），氩 0.01 + 氮 0.01 走掉 —— **这条路线产出的不是新东西，是同一块参考面的一个数**；质量账只记这一行',
  },

  {
    /**
     * **短时读数（第二原理，也是恒温腔的替代）。** 不装冷腔，就在 19–21 °C 的恒温间里
     * 32 s 做完、三次外推。
     *
     *   参考面 1 件（figure ≤ 0.15、R ≥ 98.5）→ 参考面 1 件（figure ≤ **0.15**）
     *
     * ═══ 它为什么值得单列（它是"两条互不相干的原理"里的第二条）═══
     *
     *   主路线把热按在 0.01 °C（**改环境**）；这一条把扰动甩在身后（**改时间**）。
     *   两者的误差机制完全不相干：一个的残余是"平台不均"，另一个的残余是
     *   "外推不干净"。两条对得上，才说明 0.02 nm 那一档的读数是真的。
     *
     * ═══ 它的数 ═══
     *
     *   单次 32 s：103.1 × 2.6×10⁻³ × 32 = **8.58 nm**  ✗（差 86 倍，这就是"快"救不了）
     *   三次外推：52 × (30/4245)²/2 = **0.0013 nm** ✓
     *   铁罩（τ = 5 h）对 20 min 的循环衰减 100 倍：8.58/100 = **0.086 nm** ✓
     *
     *   RSS = √(0.0545² + 0.0013² + 0.086²) = **0.102 nm** —— **刚好卡在 0.1 上**
     *
     * **所以这一条交的不是 0.1，是 0.15。** 差的那一点全是"铁罩衰减 100 倍"
     * 这个假设：局部热源（10 A 的铜弧、人手、开门）造成的横向梯度是分钟尺度，
     * 71 min 那个 τ 是厚度方向的，外推只能外推后者。
     *
     * 升级路线（R8）：把铜弧移出 3 m（光束用 `plant/stabilized-laser` 的准直输出引过去）
     * + 两层铁罩（衰减 10⁴）→ 那一项到 0.0086 nm，RSS 回到 0.065 nm，与主路线一致。
     * **它比恒温腔便宜得多（一台 30 kg 的铁罩对一台 100 kg 的冰浴腔），
     * 所以它是"先做哪一条"的答案：先做这一条，恒温腔是它的确认。**
     */
    id: 'measure/subnm-readout-short',
    name: 'λ/1000 Reference Flat Element Measurement', name_zh: 'λ/1000 参考面元件测量',
    rate: { hours: q(12) },
    produces: [
      {
        item: 'plant/ref-flat-interferometer/reference-flat',
        qty: q(1),
        gives: [
          { param: 'figure', kind: 'range', min: 0, max: 0.15 },
          { param: 'reflectivity', kind: 'range', min: 98.5, max: 99.5 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/ref-flat-interferometer/reference-flat',
            qty: q(1),
            need: [
              { param: 'figure', kind: 'range', min: 0, max: 0.15, dir: 'atMost' },
              { param: 'reflectivity', kind: 'range', min: 98.5, dir: 'atLeast' },
            ],
            // R 掉到 0.88：读数 0.497，这条路的 RSS 变成 √(0.497²+…) = 0.5 nm
            // —— 那是"铝膜那一档"，不再是 0.1 nm 的验证。**功能还在，只是差 5 倍**。
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
    ],
    needs: [
      'plant/ref-flat-interferometer',
      'plant/stabilized-laser',
      'plant/metrology-room',
    ],
    steps: [
      {
        note_zh:
          '把铜弧移出 3 m、罩两层 30 kg 铁罩（τ = 5 h，对 20 min 的循环衰减 100 倍）；这一步是这一条路线的全部成败 —— **屏蔽做不好，8.58 nm 一分不少**',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '32 s 内 8 帧（眼睛 4 s/帧）或 16 帧（光电二极管 2 s/帧）；`plant/phase-shifter` 推 λ/8 = 61 nm/步',
        performedBy: 'plant/phase-shifter',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '读三次、线性外推到 t = 0（30 s 内）：残差 0.0013 nm。**第四次就必须重新对零** —— 这是 71 min 时间常数换来的操作纪律（`ref-flat.ts` 降级⑨）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '合账：√(0.0545² + 0.0013² + 0.086²) = 0.102 nm。**它比恒温腔那条差 1.6 倍，而它便宜 10 倍** —— 两条都要，因为它们错的不是同一件事',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '参考面 1 件进、1 件出（同一件物），氩 0.01 走掉 —— 同 `measure/subnm-readout`，产出的是"一个数"不是"一件东西"',
  },

  {
    /**
     * **量测：这两瓶气的含氧量与含水量（氧与水都直接量）。**
     *
     *   进   C₄F₈ 0.1 + CHF₃ 0.1 → 出 C₄F₈ 0.1（**氧 ≤5 ppm 已被证实**）+ CHF₃ 0.1（同）
     *
     * ── 形状照 `measure/oxygen-purity`（`oxygen-metrology.ts:1857`）────────────
     *
     *   它不改变被测物，它把一个"未知"变成"已知" ⇒ `uses` 与 `produces` 是同一个
     *   物件，只是出去的那个带了**被验过的窗口**。这里比那一条更重要的是：
     *
     *   **① 读数够不够。** 5 ppm 的氧在 1 atm 的样品里就是 **5×10⁻⁶ atm**，而
     *      `plant/oxygen-probe` 的下界是 **10⁻¹⁵ atm** ⇒ 高 9 个数量级，**直接读**，
     *      不用稀释。这是氟碳气体比氮气好测的地方（氮那一路要测的是 1e-12）。
     *
     *   **② 但样品会毒化电池。** C₄F₈ 在 700–800 °C 的样品管里会裂解（C₄F₈ 的
     *      稳定上限约 600 °C）⇒ 碳沉在 CaSZ 电极上，能斯特电压逐次下跌。
     *      本层的做法：**每批一次、样品 100 mL、石英衬管随批更换**，读数按
     *      "开机 30 min 内"取（漂移在这一段 <2 %，之后不可用）。
     *      代价写在 R8 ⑩：读数滞后一批，不是在线。
     *
     *   **③ 水用 P₂O₅ 电解池（`plant/dew-point-meter`）：0.05–1000 ppm、绝对法**
     *      （电流按法拉第定律直接折成水，不需要标气）。判据 20 ppm。
     *
     * ⚠️ `needs` 里必须有 `plant/resistance-furnace`：700–800 °C 是炉子给的，
     * 探头自己不 hold 温度（与 `measure/nitrogen-oxygen` 同一条）。
     */
    id: 'measure/fcgas-oxygen',
    name: 'Measurement Production', name_zh: '量测制备',
    rate: { hours: q(6) },
    produces: [
      {
        item: 'mat/c4f8',
        qty: q(1, 10),
        gives: [
          { param: 'purity', kind: 'range', min: 98, max: 99.5, dir: 'atLeast' },
          { param: 'boilingPoint', kind: 'range', min: -5.9, max: -5.7 },
          { param: 'selectivity', kind: 'range', min: 4, max: 8, dir: 'atLeast' },
          { param: 'yield', kind: 'range', min: 55, max: 80, dir: 'atLeast' },
          { param: 'oxygen', kind: 'range', min: 1, max: 5, dir: 'atMost' },
        ],
      },
      {
        item: 'mat/chf3',
        qty: q(1, 10),
        gives: [
          { param: 'purity', kind: 'range', min: 99.5, max: 99.9, dir: 'atLeast' },
          { param: 'boilingPoint', kind: 'range', min: -82.2, max: -82.0 },
          { param: 'selectivity', kind: 'range', min: 2, max: 4, dir: 'atLeast' },
          { param: 'yield', kind: 'range', min: 60, max: 85, dir: 'atLeast' },
          { param: 'oxygen', kind: 'range', min: 1, max: 5, dir: 'atMost' },
        ],
      },
    ],
    uses: [
      {
        /**
         * 0.1 kg C₄F₈。**只要氧 ≤10 ppm 的**（`make/c4f8` 的交付窗口就是 1–10）
         * ——放宽到 100 ppm 也还能读，只是那批气已经该判废了 ⇒ `functional-kept`
         * （仪器照样工作，读数是坏料的读数）。
         */
        anyOf: [
          {
            item: 'mat/c4f8',
            qty: q(1, 10),
            need: [{ param: 'oxygen', kind: 'range', max: 10, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/chf3',
            qty: q(1, 10),
            need: [{ param: 'oxygen', kind: 'range', max: 10, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: ['plant/resistance-furnace', 'plant/metrology-room'],
    steps: [
      {
        note_zh:
          '取样与吹扫：100 mL 样品、旁路 15 倍、石英衬管（随批更换，碳沉积是它的耗材判据）；瓶口取样前先放掉 50 mL 赶走空气',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '读氧分压：氧化锆电池 700–800 °C，能与干空气 0.2095 交替标斜率（E = −32.66 mV ⇒ T = 973 ± 6 K）；C₄F₈ 在样品管里裂解沉碳 ⇒ 只取开机 30 min 内的读数（漂移 <2 %）',
        performedBy: 'plant/oxygen-probe',
        under: [{ param: 'temperature', min: 700, max: 800 }],
      },
      {
        note_zh:
          '读水分：P₂O₅ 电解池（0.05–1000 ppm，绝对法），100 mL/min、伴热 50 °C；判据 20 ppm。**露点本层只有这一种读法**，硅胶增重那种是估',
        performedBy: 'plant/dew-point-meter',
      },
      {
        note_zh:
          '反算与判据：p = 0.2095·exp(−4FE/RT)，折成 ppm 记进批卡；O₂ ≤5 ppm 且 H₂O ≤20 ppm 才放行。**不合格的批不退货也不可能重蒸**（重蒸要 80–120 块板，R8 ④）⇒ 只能记降级：那批气去刻"不要求侧壁角"的场区',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **低 k 膜纳米压痕：10 点、20–100 nm 压深、Oliver–Pharr。**
     *
     *   低 k 片 1 → 低 k 片 1（带 E/H 读数；非破坏）
     */
    id: 'measure/nanoindent-lowk',
    name: 'Low-k Dielectric TiN-Coated Wafer Measurement', name_zh: '低 k 介质镀 TiN 片测量',
    produces: [
      {
        item: 'mat/lowk-barrier-wafer',
        qty: q(1),
        gives: [
          { param: 'youngsModulus', kind: 'range', min: 5, max: 20 },
          { param: 'hardness', kind: 'range', min: 0.5, max: 3 },
          // 测量不改变其余四项；按原窗口交付
          { param: 'barrierThickness', kind: 'range', min: 0, max: 20 },
          { param: 'stepCoverage', kind: 'range', min: 0, max: 100 },
          { param: 'kValue', kind: 'range', min: 2, max: 6 },
          { param: 'methylRetention', kind: 'range', min: 0, max: 100 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/lowk-barrier-wafer', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh:
          '装片、找低 k 区（避开边缘 5 mm 与切割道）；载荷 0.1–10 mN、压深 20–100 nm、10 点；每点保载 5 s、卸载 5 s，热漂移先等 30 min',
        performedBy: 'plant/nanoindenter',
      },
      {
        note_zh:
          'Oliver–Pharr：从卸载曲线斜率 S 与接触面积 A 算 E_r = √π·S/(2√A)、H = P_max/A；E 用 ν=0.25 折成膜模量。压深 > 膜厚 10 % 的点剔除（基底效应）',
        performedBy: 'plant/nanoindenter',
      },
    ],
    rate: { hours: q(2) },
    unbalanced_zh:
      '低 k 片 1 → 低 k 片 1；非破坏，质量不变。E/H 是读数，不是材料；10 点里允许 2 点因基底/颗粒剔除',
  },

  {
    /**
     * **EUV 套刻 send-ahead：vernier 版曝两层 → CD-SEM 10 点读 X/Y。**
     *
     *   硅片 1 + 胶 1 + 氢氟酸 0.1 + 水 1 → `mat/overlay-record` 1 份
     *
     * 用 `std/overlay-vernier-general`（外框 5 µm / 内框 2 µm / 10 级 0.1 µm）
     * 在同一片上曝两层：第一层显影后 HF 蚀 122 nm 把外框固定，第二层再曝同一块版、
     * 显影，CD-SEM 读顶层内框对底层外框的偏移。**同一块版两次曝光 ⇒ 版内图形
     * 位置是共模**，量到的是台 + 对准，不是版差。
     *
     * 窗口 ±0.6 µm 覆盖 `plant/euv-stepper` 的 560 nm（500 合同值 + 250 人眼
     * RSS = 559，向上取 560）：CD-SEM 的 vernier 读数 0.1 µm/级，0.56 µm 是
     * 5.6 级；旧窗口 ±0.5 µm 只够判合同门 500 nm（5 级），盖不住 560 nm，
     * 所以记录窗口放到 ±0.6 µm。**仍不够判 43 nm**（0.43 级，没有亚级插值/标准件）。
     *
     * ⚠️ **43 nm 档不能用这条路线测。**
     *   · 43 nm 是 `make/euv-wafer-overlay-43`（`edge-aligner.ts`）的片级合成：
     *     干涉台 20 nm + 边缘对准器 22 nm + 槽深漂 1.7 nm ⇒ RSS 29.8，门 43。
     *     本路线用的是 `plant/euv-stepper` 的**基础台**（刻度盘 1 µm + 机器人视觉
     *     250 nm），不走那条配置。
     *   · 43 nm 那条的“检验”是边缘对准器读同一组**对准**标记的相位 —— 那是对准
     *     自检，不是独立套刻量测；标记零点与图形零点之间 12.9 nm 的基准传递
     *     它看不见。
     *   · 要独立测 43 nm，缺的是（a）随图形一起印下的每层 box-in-box 标记
     *     （现在只有零层对准光栅，20 块图形版上没有 overlay 标记），
     *     （b）一台不确定度 ≤4 nm、可溯源的套刻量具（CD-SEM 的 0.1 µm 级
     *     vernier 差 2.3 倍；比较仪/光学显微镜 1 µm 更不够）。
     *
     * 所以这条路线只把 **560 nm 档**从“设计窗口”变成“可测”；43 nm 仍是设计值。
     * 记录条目复用 `mat/overlay-record`（`cmos.ts`）—— 形状一样，差的是被测对象；
     * 那个条目的 props 仍写 ±0.5 µm（本轮不在改动范围），要让声明与交付一致，
     * 得把它也放到 ±0.6 µm —— 这里先留一条明账，不把 0.56 µm 藏进 ±0.5 的窗口里。
     *
     * ⚠️ 版沿用 `std/photomask-general` 的同一简化：本层没有 EUV 专用反射坯条目，
     * `make/euv-exposed-wafer` 也是这块版族。所以这条路线测的是“台 + 对准”，
     * 不是“EUV 掩模 + 台”的全链 —— 后者缺的是 EUV 反射坯/掩模条目，不在本文件。
     */
    id: 'measure/euv-overlay',
    name: 'Overlay Vernier Measurement', name_zh: '套刻 vernier 测量',
    rate: { hours: q(3) },
    produces: [
      {
        item: 'mat/overlay-record',
        qty: q(1),
        gives: [
          { param: 'overlayX', kind: 'range', min: -0.6, max: 0.6 },
          { param: 'overlayY', kind: 'range', min: -0.6, max: 0.6 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
          { param: 'waferId', kind: 'range', min: 0, max: 1000 },
          { param: 'method', kind: 'enum', oneOf: ['cd-sem'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: [
      // vernier 版不消耗（一块能过很多片）；它在这里是**在场的前提**，
      // 与 `measure/overlay-vernier` 同一个写法。
      'std/overlay-vernier-general',
      'plant/euv-stepper',
      'plant/euv-source',
      'plant/euv-vacuum',
      'plant/euv-pulser',
      'plant/clean-room',
      'plant/metrology-room',
    ],
    steps: [
      {
        note_zh: '① 涂胶：2 500 rpm、0.2 µm（负胶；与 EUV 曝光同一条湿法线）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 第一层曝光：vernier 版一场（2×2 mm），收 21.5 mW、100 mJ/cm²；外框与内框同时印下',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh:
          '③ 显影 + HF 蚀 122 nm：把第一层的外框刻进硅（第二层才看得见它；与 `make/edge-aligner-marked-wafer` 同一个槽深）',
        performedBy: 'plant/wet-bench',
      },
      {
        note_zh: '④ 二次涂胶：2 500 rpm、0.2 µm（盖住第一层，留出 box 窗口）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑤ 第二层曝光：同一块 vernier 版、同一场位置，靠刻度盘 + 机器人视觉对位 —— 这一档的 560 nm（500 合同值 + 250 人眼 RSS = 559，向上取 560）就是从这里来的',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh: '⑥ 显影：第二层的内框留在第一层外框里面，两层偏移就是套刻',
        performedBy: 'plant/wet-bench',
      },
      {
        note_zh:
          '⑦ CD-SEM 读 10 点：每点 X/Y 各一次；外框 5 µm、内框 2 µm，0.1 µm/级，判 500 nm 合同档 / 560 nm 窗口（不是 43 nm）',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh:
          '⑧ 算均值/3σ：overlayX/Y 记均值，3σ 记重复性；10 点、X/Y 各一组。结果给 ±0.6 µm 窗口，超出就是这台基础台的 560 nm 没做到',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '硅片 1 片 + 胶 1 + 氢氟酸 0.1 + 水 1 → 套刻记录 1 份；测试片是一次性的（两层图形留在片上，不回收），记录是数据、不是物料；vernier 版在 needs 里、不被消耗',
  },

  {
    /**
     * **RTA 40 kW 长寿命灯阵：一件灯阵点满 2000 h，每 100 h 读一次固定点。**
     *
     *   灯阵 1 件（`plant/rta/lamp-array-long`，16×2.5 kW，两组各 8 只串联）
     *     → 记录 1 份（`mat/rta-lamp-life-record`）
     *
     * ═══ 怎么点、怎么读 ═══
     *
     *   ① 换装：长寿命阵装到 `plant/rta`（60 kW 阵拆下；`plant/rta` 的
     *      `composedOf` 不改，这是现场换装件）。40 kW 脉冲（或压到 5–6 kW 的
     *      恒功率；后者不是 40 kW，见下）、常压 N₂、1000–1050 °C 点 10 min
     *      做早期失效筛查，逐组记初始电流/电压。
     *   ② 0 h 基准：固定 40 kW（脉冲档读平台；恒功率档是 5–6 kW）、等温后
     *      `plant/pyrometer` 读挡光筒后同一个固定点（托边/见证块，不是被灯直照
     *      的片心），记 T₀、I₀、V₀、failures = 0。**这是差值测量的零点，
     *      不是绝对光通量。**
     *   ③ 累计点亮：100 h × 20 段 = **2000 h**，40 kW 脉冲（或 5–6 kW 恒功率；
     *      两种都记在记录里）；40 kW × 2000 h = **80 000 kWh = 2.88×10¹¹ J**
     *      （脉冲点亮能量；恒功率档 5.3–6.2 kW × 2000 h = 10.6–12.4 MWh，
     *      不是 40 kW）。
     *   ④ 每 100 h 复读：停灯，在固定输入功率下用同一台 pyrometer 读同一
     *      固定点，记 T、每组 I/V、失效灯数；共 20 次。
     *   ⑤ 判据与记录：2000 h 后 decay ≤5 %、failures ≤1 只；达不到就记实际值。
     *
     *   ⚠️ **40 kW 与 1000–1050 °C 不能同时是裸片的连续工况**：裸片在 40 kW
     *   下的净热约 8 kW（吸收 9.28 − 辐射 1.23），热容 6.41 J/K ⇒ **1250 K/s**，
     *   从 1000 到 1050 °C 只要 **0.04 s**。所以**裸片上**只有两种点法：
     *   ① **40 kW 脉冲**（瞬时 40 kW，平均约 5–6 kW，占空比 13–16%）；
     *   ② **恒功率压到 5–6 kW**（那不是 40 kW，灯丝温度低一档，寿命不能当
     *      额定寿命）。本条按题设把两种都记进记录，**不把②的结果冒充①**。
     *   要 40 kW 恒功率 + 2000 h 日历，得另加水冷负载（试验夹具）；本层没有，
     *   所以不把它写成已经做到。
     *
     * ═══ 为什么 5 % 这一格判不了（数）═══
     *
     *   5 % 光衰 ⇔ 1273 K 上 **15.9 K**（ΔT = (T/4)(ΔP/P)）。而
     *   `plant/pyrometer` 是 ±5–10 K；做 t=0 与 t=2000 的差值时静态空间差
     *   会抵消，但 2000 h 里的**窗口污染**不会：650 nm 上透过率掉 5 %，
     *   单色高温计少读 **3.7 K**（ΔT/T = (λT/c₂)·(ΔL/L) = 0.0575 × 5 %），
     *   折成光衰 **1.15 %**；掉 20 % 就是 **4.6 %**，正好吃掉整个判据。
     *   还有 pyrometer 自己的灯丝老化（`pyrometer.ts:76–79`：它会蒸发变细，
     *   同一个读数对应的温度就偏了）—— 只能用铜凝固点 1084.62 °C 重标。重标
     *   只能压标定漂移（2000 h 点亮连续走约 83 天，脉冲走日历更长），压不掉
     *   窗口污染与光谱失配。**没有光通量标准，这些系统差压不掉。**
     *
     *   ⚠️ 还有一条更硬的：**650 nm 上灯丝比 1273 K 的片亮 2.2×10⁴ 倍**
     *   （Wien：exp[(c₂/λ)(1/1273 − 1/3000)] = exp(10.01) = 2.2×10⁴；
     *   同一个式子在 1.55 µm 给 66 倍，正是 `implant.ts:259` 的"70 倍"）。
     *   所以**不能直接看被灯照着的片心**，必须看挡光筒后的固定点；否则读到
     *   的全是灯。`plant/rta` 自己的 `plant/rta/pyrometer`（1.55 µm + 斩波/
     *   锁相）就是为这个造的，但它是 `part`，不能当 `performedBy` —— 本路线
     *   只能让 `plant/pyrometer` 这台 `machine` 去读那个影子里的固定点。
     *
     * ═══ 判据逐条 ═══
     *
     *   failures ≤1 只   **可数、可判**：0–16 只。1 只开路 = 该 8 只串联组
     *                    断开；短接旁路后 15 × 2.5 kW = **37.5 kW**（不是
     *                    40 kW）。0 只才满 40 kW。所以"≤1"是计数判据，不是
     *                    "40 kW 还能满功率"的功能判据。
     *
     *   lifetime         2000 h 无失效 ⇒ **右删失**，只能记 ≥2000 h；要真值
     *                    继续点到 3000 h 或到失效。1500–2000 h 的窗口只能
     *                    验下界（1500 h 前失效 = 不合格）。
     *
     *   decay ≤5 %       **本层不可判**：5 % ⇔ 16 K，与 ±5–10 K 的测温、
     *                    窗口污染（20 % ⇒ 4.6 %）、光谱失配同量级；转换因子
     *                    (1/4) 还假设灰体、光谱不变、见证块只靠辐射散热
     *                    （有水冷/导热时灵敏度更低，得另标）。⇒ 记录记 0–20 %
     *                    的实际代理值；5 % 仍是设计值，按 B 类（R12 未闭合）。
     *
     *   ⚠️ 中途 1 只失效时：旁路后 37.5 kW，温度直接掉 **~20 K**
     *   （6.25 % 功率 ⇒ T/4），比 5 % 光衰的 16 K 还大；所以失效后必须重标
     *   一次基准（或把 T 按 P^{1/4} 归一），否则前后的 decay 不可比。重标
     *   也记进记录。
     *
     * ═══ R8：把"不可判"变成"可判"的最短一步 ═══
     *
     *   不是买积分球，是**把"定功率读温度"改成"定温读电功率"**：
     *   RTA 本来就有闭环，5 % 光衰 ⇔ 电功率 **+5.3 %**（P_elec = P_abs/f，
     *   f 掉 5 % ⇒ 1/0.95 − 1 = 5.26 %）；`std/dvm-general` 4 位够读，
     *   信号从 16 K 变成 5.3 %。但分流器的 TCR 要先解决（铜排 0.39 %/K，
     *   10 K 就是 3.9 %，与判据同量级）；再往上才是积分球/标准灯。
     *   **本条路线按题设的"定功率读温度"写，升级路线写在这里，不冒充已做到。**
     *
     * ⚠️ 记录按现有约定是 `category: 'part'`（`mat/*-record` 全是），所以
     *   `part_as_raw_material` 这一关把"灯阵 → 记录"当成子装配放行；这是
     *   模型对破坏性寿命试验的唯一表达方式，不是把记录当零件。
     *
     * ⚠️ `rate: 2000 h` 按**累计点亮**计（题设口径）；脉冲模式的日历是
     *   2000/0.133…0.155 = **1.3–1.5×10⁴ h**（约 1.5–1.7 年），恒功率档才是
     *   2000 h 日历。20 次停灯/读数的降温与复温约 +20 h（1 %），不另加。
     *   2000 h 是台架累计，不是现场连续运行 —— 现场是 1.5 s 升坡 + 10 s
     *   等温的间歇脉冲（见文件头）。
     */
    id: 'measure/rta-lamp-life',
    name: 'RTA 40 kW Long-Life Lamp Array Life/Lumen Depreciation Measurement', name_zh: 'RTA 40 kW 长寿命灯阵的寿命/光衰测量',
    rate: { hours: q(2000) },
    produces: [
      {
        item: 'mat/rta-lamp-life-record',
        qty: q(1),
        gives: [
          { param: 'lifetime', kind: 'range', min: 0, max: 3000 },
          { param: 'decay', kind: 'range', min: 0, max: 20 },
          { param: 'failures', kind: 'range', min: 0, max: 24 },
          { param: 'hours', kind: 'range', min: 0, max: 3000 },
          { param: 'power', kind: 'range', min: 40, max: 40 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/rta/lamp-array-long', qty: q(1) }] }],
    needs: ['plant/metrology-room', 'plant/power-standard-100w'],
    steps: [
      {
        note_zh:
          '① 换装 + 早期失效筛查：长寿命阵装到 plant/rta（60 kW 阵拆下；plant/rta 的 composedOf 不改，这是现场换装件）；40 kW 脉冲（或 5–6 kW 恒功率；后者不是 40 kW）、常压 N₂、1000–1050 °C 点 10 min，看 16 只里有没有早期失效；逐组记初始电流/电压（两组各 8 只串联，每组都记，因为光衰不一样）',
        performedBy: 'plant/rta',
        under: [
          { param: 'temperature', min: 1000, max: 1050 },
          { param: 'pressure', min: 9.5e4, max: 1.05e5 },
        ],
      },
      {
        note_zh:
          '② 0 h 基准：固定 40 kW（脉冲档读平台；恒功率档 5–6 kW）、等温后 plant/pyrometer 读挡光筒后同一个固定点（托边/见证块，不是被 3000 K 灯丝直照的片心），记 T₀；同刻记 I₀/V₀、failures = 0。**这是差值测量的零点，不是绝对光通量**',
        performedBy: 'plant/pyrometer',
        under: [{ param: 'temperature', min: 1000, max: 1050 }],
      },
      {
        note_zh:
          '③ 累计点亮 2000 h：100 h 一段 × 20 段，40 kW 脉冲（或 5–6 kW 恒功率；后者不是 40 kW，两种点法都记进记录）；40 kW × 2000 h = 80 000 kWh = 2.88×10¹¹ J（脉冲点亮能量；恒功率档 5.3–6.2 kW × 2000 h = 10.6–12.4 MWh）。每段结束停灯，下一段开始前在固定输入功率下复读同一固定点',
        performedBy: 'plant/rta',
        under: [
          { param: 'temperature', min: 1000, max: 1050 },
          { param: 'pressure', min: 9.5e4, max: 1.05e5 },
        ],
      },
      {
        note_zh:
          '④ 每 100 h 复读（共 20 次）：40 kW 固定输入（脉冲档读平台；恒功率档 5–6 kW），plant/pyrometer 读同一固定点 T；同刻记每组 I/V 与失效灯数。温度差按 ΔT = (T/4)(ΔP/P) 折成光衰代理值；**电流只作旁证** —— 恒功率下 I ∝ 1/√R，但光衰可能来自壁黑化（几乎不动 R）或丝径变化（动 R），两者对电流的影响不同，所以电流不能当光衰的刻度；动铁表 ±2 % 也到不了 5 % 的电流变化',
        performedBy: 'plant/pyrometer',
        under: [{ param: 'temperature', min: 1000, max: 1050 }],
      },
      {
        note_zh:
          '⑤ 判据与记录：2000 h 后 decay ≤5 %、failures ≤1 只；达不到就记实际值。**failures 可数可判；decay 是代理值，不能签"≤5 %"**（没有光通量标准；5 % ⇔ 16 K，落在 ±5–10 K、窗口污染 20 % ⇒ 4.6 % 与光谱失配里）。lifetime 在 2000 h 无失效时记 ≥2000 h（右删失），要真值继续点到 3000 h 或到失效。中途 1 只失效：旁路后 37.5 kW，温度掉 ~20 K，必须先重标基准再比。记录在 19–21 °C 的计量间写',
        performedBy: 'plant/rta',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '灯阵 1 件（16×2.5 kW，现场可换件）→ 记录 1 份。**这是一次寿命试验：灯阵按消耗件记账，2000 h 走完额定寿命（1500–2000 h）就报废、不回收装回 plant/rta**；记录是数据，不是物料。灯阵本身的料账（钨 25 g、石英 2 kg、铜 4 kg、碘 0.08 g、水 20 kg）在 make/rta-lamp-array-long 里，不在这里重复。产物按份计，没有质量账；20 次停灯/读数的降温与复温约 +20 h（1 %），rate 2000 h 按累计点亮计',
  },

  {
    /**
     * **BF₃ 的水：一瓶 0.6 kg 进，一份记录出。**
     *
     *   三氟化硼 1 瓶（0.6 kg = `make/boron-trifluoride` 一批）+ 干氮 0.02 kg
     *     → `mat/bf3-water-record` 1 份
     *
     * 这一条回应"BF₃ 纯度/露点未测"那半句。
     * 它**只回答"水"**，而且答案是"能判废、不能判合格"（文件头 ②）。
     *
     * ═══ 工序：一台机器，四步（所以写 performedBy，不写 steps）═══
     *
     *   ① **接管**：316L 或镍内衬取样管（φ3 mm × 2 m = 14 cm³）接到瓶阀与
     *      露点仪的取样板之间；垫片镍/石墨，不用 PTFE 弹性体。接管之前整根
     *      管子用干 N₂ 吹到露点 ≤ −60 °C —— 否则读的是管子的历史。
     *   ② **旁路吹扫**：不开样品阀，先走旁路 10–20 倍（100 mL/min 的采样流量
     *      ⇒ 1.5 L/min，10 min ≈ 15 L），把管里的空气与管壁吸附水赶走
     *      （管里的空气不是样品，它的露点本层没测过，也没必要测）。
     *      **这一步不是可选的。**
     *   ③ **切进电解池**：旁路关、样品进 P₂O₅ 池（250 V / 5 段，100 mL/min）。
     *      10 ppm ⇒ **134 µA**（13.4 µA/ppm，见 `measure/nitrogen-moisture`）；
     *      池子对水的响应 60–120 s，但**膜与管壁的水平衡是分钟级**。
     *   ④ **读 1 h 的后半段 + 记档**：本底跑 1 h 记 ≤3 µA（与
     *      `measure/nitrogen-moisture` 同一个做法）。`rate` 那 1 h 是
     *      "本底 + 一次读数"的账；6 L 气正好也走 1 h（100 mL/min），两件事
     *      落在同一个小时里，不冲突 —— 判据是**本底压到 1–3 µA**，不是 6 L。
     *
     * ═══ 数 ═══
     *
     *   取样量    100 mL/min × 60 min = **6 L = 0.245 mol = 16.6 g BF₃**
     *             （一瓶 0.6 kg 的 **2.8 %**）
     *   瓶里的水  6 L × 10 ppm = **2.4 µmol**；按 1:1 折 HF = 2.4 µmol HF
     *   读数偏差  2.4 µmol HF 落在膜上（或壁上）放回 **1.2 µmol 水** ⇒
     *             **最多是真值的 1.5 倍**（全部反应的上界；落在哪里没有标定，
     *             所以是上界不是修正）；仪器本身 ±10 %，合起来分不开 8 与 12 ppm
     *   吹扫氮    旁路 1.5 L/min × 10 min = 15 L + 预干燥 ≈ **0.02 kg**
     *   瓶的余量  0.6 kg − 16.6 g = **583 g 不回注入线**（瓶已开封、已吹扫，
     *             按"一瓶一次"记账）—— 这是这条路线最大的物料代价，也是
     *             "为什么不能每瓶都测"的答案
     *
     * ═══ 它测不到的三样（与文件头 ① 同一件事，落在这里再说一遍）═══
     *
     *   · **纯度**：没有质谱/FTIR，99.5 % 仍是 `make/boron-trifluoride` 的目标值。
     *   · **金属杂质**：没有 ICP-MS；镍内衬的 NiF₂ 钝化膜掉了多少 Ni 进气流，
     *     这一条读不到（它只读水）。
     *   · **结合态水**：BF₃·H₂O、H₃BO₃ 气溶胶不在"自由水"里，电解池看不见 ⇒
     *     读数偏低的那一半。要测它得先把 BF₃ 水解成氟硼酸再做卡尔·费休，
     *     而本层既没有卡尔·费休，也没有"水解-滴定"这条路线。
     *
     * ═══ 口径（最容易读错的一处）═══
     *
     *   ppm 是**体积/摩尔分数**：电解池按法拉第定律把电流折成气体里的水分子数，
     *   所以记录的 ppm 与 `mat/boron-trifluoride` 的 0.001 %（1 ppm = 1e-4 %）
     *   同口径。若按质量分数算，10 ppm(w) 对 BF₃ 是 37.7 ppmv、露点 −50 °C
     *   那一侧 —— 差 3.77 倍。本文件不换算（单位只留一个刻度）。
     *
     * ⚠️ **B 类：这一条不把"BF₃ 露点未测"变成"已测"。** 它把"没有路线"变成
     *   "有路线、有记录、读数有偏（±50 %）、池子一次性、寿命未标定"，并且
     *   仪器自己的取样板还是石英的（文件头 ③ 的最后一句）—— 缺口的位置从
     *   "没有量具"移到了"量具会被样品吃掉"，**这是更准确的缺口，不是闭合**。
     *   判废可用（>15 ppm 一眼看出），判合格不可用。
     */
    id: 'measure/bf3-water',
    name: 'BF₃ Moisture Measurement', name_zh: 'BF₃ 的水分测量',
    rate: { hours: q(1) },
    produces: [
      {
        item: 'mat/bf3-water-record',
        qty: q(1),
        gives: [
          { param: 'water', kind: 'range', min: 0, max: 100 },
          { param: 'dewPoint', kind: 'range', min: -80, max: -20 },
          { param: 'sampleId', kind: 'range', min: 0, max: 1000 },
          { param: 'method', kind: 'enum', oneOf: ['dew-point'] },
        ],
      },
    ],
    uses: [
      // 1 瓶 = `make/boron-trifluoride` 一批的 0.6 kg（q(3,5)）—— 条目按 kg 计，
      // 所以"瓶"这个数只能写成质量；不是 1 kg。
      { anyOf: [{ item: 'mat/boron-trifluoride', qty: q(3, 5) }] },
      // 吹扫氮。⚠️ `mat/nitrogen` 没有声明 water —— "干 N₂"在本层是**没声明的
      // 假设**（只有 `mat/nitrogen-characterized` 有 moisture 0.01–3000 ppm，
      // 而它自己也要一条量测路线才成立）。要真做，吹扫氮先过露点仪的
      // guard-column（P₂O₅ 前置床）那道闸。
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 50) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/dew-point-meter',
    // 室温 + 计量间的 19–21 °C：池子不 hold 温度（与 `measure/nitrogen-moisture`
    // 同一条），取样板的 40–60 °C 伴热是仪器自己的能力、不是本路线的条件。
    under: [{ param: 'temperature', min: 19, max: 21 }],
    unbalanced_zh:
      '三氟化硼 0.6 kg（1 瓶 = make/boron-trifluoride 一批）+ 氮 0.02 kg → 记录 1 份。取样只取走 16.6 g（6 L），剩下 583 g 不回注入线：瓶已开封、已用干 N₂ 吹扫，按"一瓶一次"记 —— 这是这条路线最大的物料代价。氮 0.02 kg 是旁路吹扫（1.5 L/min × 10 min ≈ 15 L）与管子预干燥，全走掉。产物按份计，没有质量账；池子的膜被 HF 咬掉的那一薄层没有读数，也记不进 kg 账',
  },

  {
    /**
     * **OES 绝对波长：用钠 D 双线在 589 nm 附近自校。**
     *
     *   钠源 1/500 件（从 `plant/interferometer` 借来，按 2 h / 500–1500 h
     *   寿命摊销）+ 光谱仪 1 台 → `mat/oes-wavelength-record` 1 份
     *
     * ⚠️ 这条路线**只回答 589 nm 附近**。它不是 200–900 nm 的波长校准，
     *   也不是 ±0.2 nm 的证明；它是"把 589 nm 的两个已知点读出来"。
     *
     * ═══ 为什么能接：零件可拆，狭缝是通的 ═══
     *
     *   ① 钠源是 `plant/interferometer/sodium-source`（part），从干涉仪上
     *      取下即可；它有两个生产者：`make/interferometer-source`（盐焰，
     *      暗 50–100×、抖 10–30%）与 `make/interferometer-sodium-source`
     *      （真钠灯，亮、<1% 稳）。**只有后者适合本路线**：10 µm 缝的几何
     *      收集 ~5×10⁻¹⁰ m²·sr，盐焰的 D 线落到探测器上只有 pA 级（估算），
     *      比 1 nA 暗电流小 2–3 个量级；真钠灯是 nA 级，锁相能读。
     *   ② 光谱仪模块（`plant/refractometer/oes-grating-spectrograph`）是
     *      `plant/refractometer` 的零件；入射缝 10 µm、出射缝 25 µm、
     *      单管硅二极管 + 斩波。**数据里没有专门的灯输入口/聚光镜**，钠源
     *      放在缝前 20–50 mm，靠几何收集；不加透镜/光纤（本层没有这些
     *      条目，也不新增设备）。
     *   ③ "接得进"因此是两件事：**机械上放得进**是确定的；**光上够不够**
     *      取决于钠源是灯还是焰（①）。焰不够时照实写"S/N < 10，测不了"，
     *      不产记录 —— 这是 B 类的第一道门。
     *
     * ═══ 双线分不分得开：这是要测的，不是假设 ═══
     *
     *   分辨率：870 nm 设计 0.2–0.5 nm；589 nm 按 λ/cos β 折算约
     *   0.14–0.34 nm；400–650 档数据写 0.3–0.6 nm（45 mm 杆）。
     *   双线间距 0.597 nm：
     *     0.3 nm 档：0.597 / 0.3 ≈ 2.0 ⇒ 谷深约 70–90%，清楚分开
     *     0.5 nm 档：0.597 / 0.5 ≈ 1.2 ⇒ 谷深约 20–30%，边缘可分
     *     0.6 nm 档：0.597 / 0.6 ≈ 1.0 ⇒ 瑞利限，谷深约 0–10%，
     *                实际上是一个包络
     *   **所以先扫 5 个点看 589.3 nm 处有没有谷**：有谷且两峰位置稳定
     *   ⇒ 记两个峰；没有谷 ⇒ 只记包络中心，`separation` 写已知 0.597 作
     *   标尺，`error` 写包络半宽（0.3–0.6 nm），记录注明"未分辨"。
     *
     * ═══ 数 ═══
     *
     *   扫描点   588.9 / 589.1 / 589.3 / 589.5 / 589.7 nm（5 点，步距 0.2 nm）
     *            589.0 与 589.6 落在点之间，用抛物线插值/两线模型定峰位
     *   色散     分辨开：0.597 nm / (x₂ − x₁) = nm/µm；未分辨：用光栅方程
     *            的 0.034 nm/µm（45 mm 杆，589 nm）作先验，记录里注明
     *   零位     x₁ 对 588.995 nm（D₂）；error 记 1σ 不确定度，不是残差
     *   时间     装源/对光 + 钠灯稳 40 min 0.8 h + 扫 5 点 × 3 次 0.5 h
     *            + 算/写 0.4 h + 拆/复装 0.3 h = **2 h**
     *   读数     1 µm ≈ 0.034 nm（45 mm 杆）；10 µm 分度 ≈ 0.34 nm ——
     *            **10 µm 分度只做粗定位，峰位靠 1 µm 估读/插值**
     *
     * ═══ 它测不到的四样 ═══
     *
     *   ① 200–900 nm 全段：只有 589 nm 的两个点；870 nm 靠光栅方程外推，
     *      没有 870 nm 的已知窄线（R8-4）。
     *   ② 绝对溯源性：没有汞/氖/空心阴极灯，钠双线是**自校**，不是
     *      溯源到一级标准；±0.2 nm 是设计值，不是这条路线测出来的。
     *   ③ 狭缝/像元/温度漂移：10 µm/25 µm 缝、单管探测器、19–21 °C ±1 K；
     *      缝宽、像元位置、正弦杆/光栅温度系数都没有单独标定。记录只写
     *      "这次扫描的 5 个点"，不写"仪器准确度"。
     *   ④ 分辨率本身：589 nm 的双线只能给"分得开/分不开"二值 + 包络宽度，
     *      给不出 870 nm 的分辨率；870 nm 仍是 0.2–0.5 nm 的设计值。
     *
     * ═══ 判据 ═══
     *
     *   分辨开：实测色散 0.597/(x₂ − x₁) 与设计 0.034 nm/µm 之差 ≤ 5–10%，
     *           且两峰重复性折成 nm ≤ 0.2 nm ⇒ 589 nm 局部 ±0.2 nm **成立**；
     *           记录 error 写 1σ 不确定度（0.02–0.2 nm），不是两点残差。
     *   未分辨：只记包络中心；error 0.3–0.6 nm；**589 nm 局部也不到 ±0.2 nm**，
     *           全段更不成立 —— 照实记，不签 ±0.2。
     *
     * ⚠️ 这条路线是 **B 类**：它给 589 nm 一个可执行的实测，但不把
     *   `oes-grating-spectrograph` 的 `resolution 0.2–0.5` / `wavelengthRange
     *   400–900` / 设计 ±0.2 nm 变成全段实测。记录里的 error 是局部的。
     */
    id: 'measure/oes-wavelength',
    name: 'OES Absolute Wavelength Measurement', name_zh: 'OES 绝对波长测量',
    rate: { hours: q(2) },
    produces: [
      {
        item: 'mat/oes-wavelength-record',
        qty: q(1),
        gives: [
          { param: 'peak1', kind: 'range', min: 588, max: 590 },
          { param: 'peak2', kind: 'range', min: 589, max: 591 },
          { param: 'separation', kind: 'range', min: 0.5, max: 0.7 },
          { param: 'error', kind: 'range', min: 0, max: 1 },
          { param: 'points', kind: 'range', min: 5, max: 5 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/interferometer/sodium-source',
            qty: q(1, 500),
          },
        ],
      },
    ],
    needs: ['plant/interferometer', 'plant/metrology-room'],
    steps: [
      {
        note_zh:
          '① 装源、对光、稳灯：把 `plant/interferometer/sodium-source` 从干涉仪上取下，装在 OES 入射缝（10 µm）前 20–50 mm；φ30 石英窗对着缝，中间加矿棉/石棉隔热板，不让 300 °C 的灯壳直照缝座。钠灯先稳 40 min（钠压对温度是 ×2/20 K，亮度/线宽/自吸收都跟着走，不稳就扫不了）；暗室、斩波 100–300 Hz、锁相；先看 589 nm 的一级有没有信号。**盐焰（`make/interferometer-source`）在这个几何下只有 pA 级，S/N < 10 就停，不产记录。**',
        performedBy: 'plant/refractometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 扫 5 个点：45 mm 正弦杆、400–650 档；测微头从 588.9 走到 589.7 nm（步距 0.2 nm ≈ 6 µm；10 µm 分度只做粗定位，峰位靠 1 µm 估读/插值）。每点重复 3 次，记 5 个点的强度；看 589.3 nm 处有没有谷 —— 有谷 = 双线分得开，没谷 = 一个包络。',
        performedBy: 'plant/refractometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 定峰/定包络：分得开时用抛物线或两线模型定 peak1/peak2，separation = peak2 − peak1（应在 0.5–0.7 nm）；分不开时用单峰拟合定包络中心 c，按名义 2:1 的 D₂:D₁ 强度比拆成 peak1 = c − 0.199、peak2 = c + 0.398，separation 写已知 0.597 nm，并在记录上注明"未分辨"（这时 peak1/peak2 是模型分量，不是峰）。',
        performedBy: 'plant/refractometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '④ 标色散/回推误差：分辨开时用 0.597 nm / (x₂ − x₁) 定 nm/µm，再由 x₁ → 588.995 nm 定零位（peak1 就是 588.995）。**两点定线必然过这两点，残差恒为 0，别把 0 当误差**：error 记的是 1σ 不确定度 = 5 点 × 3 次重复的峰位散差（折 nm）+ 1 µm 估读/回差 0.034 nm + 实测色散与设计 0.034 nm/µm 的差（这一项检验正弦杆/光栅方程）。未分辨时用 0.034 nm/µm 的先验和包络中心对 589.194 nm 的残差，error 记 0.3–0.6 nm。**error 只对 589 nm 附近负责，不外推到 870 nm。**',
        performedBy: 'plant/refractometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑤ 写记录 + 拆源复装：记录 5 个点、peak1/peak2/separation/error、是否分辨；把钠源装回 `plant/interferometer`，干涉仪复零。**记录上必须写：只校 589 nm 附近；没有汞/氖多线灯；狭缝/像元/温度漂移未标定；±0.2 nm 是设计值，不是全段实测。**',
        performedBy: 'plant/refractometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '钠源按 1/500 件/次摊销（2 h ÷ 500–1500 h 寿命，取中值 1000 h），不是整只灯被吃掉；光谱仪模块 1 件（装在 `plant/refractometer` 上）不消耗；→ 记录 1 份。**记录是数据，不是物料**，没有 kg 账。钠源是干涉仪的零件，拆下 2 h 后装回；这 2 h 干涉仪不能做长度测量 —— 这个停机不另记（rate 的 2 h 就是它）。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...METROLOGY_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...METROLOGY_MEASURE_ROUTES];
