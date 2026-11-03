/**
 * 原位膜厚监控 —— 把 6.9 nm 的周期从 ±0.078 nm 收到 ±0.03 nm 的那一件。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、这一件买的是什么（先算收益，再算仪器）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `euv-mirror.ts` 把周期误差翻译成反射率的那条式子是可以复算的：
 *
 *   a = 8π²σ²/λ²   （λ = 13.5 nm，σ = 周期误差，界面按 m = 1…40 逐层衰减）
 *   Σ e^(−a·m) / 40 = 振幅因子，R = 70 % × 因子²
 *
 * 代进去：
 *
 *   ┌────────┬────────┬──────────┬────────────────┐
 *   │ σ nm   │ 振幅   │ R 复算   │ R¹⁰（10 面镜）  │
 *   ├────────┼────────┼──────────┼────────────────┤
 *   │ 0.100  │ 91.6 % │ 58.7 %   │ 0.49 %         │
 *   │ 0.078  │ 94.8 % │ 62.9 %   │ 0.97 %  ← 现状 │
 *   │ 0.045  │ 98.2 % │ 67.5 %   │ 1.96 %         │
 *   │ 0.030  │ 99.2 % │ 68.9 %   │ 2.41 %  ← 目标 │
 *   │ 0.020  │ 99.7 % │ 69.5 %   │ 2.63 %         │
 *   └────────┴────────┴──────────┴────────────────┘
 *
 * **所以这一件的收益是 2.5 倍，不是 5.6 倍。** 5.6 倍是拿两个端点乘出来的：
 * 0.59¹⁰（那是 σ = 0.1 的值，不是 0.078）对 0.7¹⁰（那是 σ → 0 的天花板，
 * σ = 0.03 时只有 68.9 %）。两个数各取在对自己有利的一端，乘出来就是 5.5 倍。
 * 把 0.078 与 0.03 各自代进**同一条**式子，是 0.97 % → 2.41 %。
 *
 * 2.5 倍仍然是这条链上最大的一件：`euv-fab.ts` 的 45 片/h ✕ 2.5 = **113 片/h**
 * （按 5.5 倍算是 248 片/h）。而且——
 *
 *   **收益的大头在第一步。** 0.078 → 0.045 就拿到 2.0 倍（全收益的 80 %），
 *   0.045 → 0.03 只再加 1.23 倍。这一条决定了本文件的形状：
 *   主方案奔 0.03，降级方案奔 0.045，而**降级方案已经值回票价**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、2.8 nm 的 Mo 对应多少频移？（Sauerbrey）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   Δf = −2 f₀² Δm / (A √(ρ_q μ_q))
 *
 *   f₀ = 5.000×10⁶ Hz       AT 切 5 MHz（工业标配；本层原缺口与 334 µm 依据见第七节第 1 条）
 *   A  = π(4 mm)² = 5.027×10⁻⁵ m²   φ8 mm 电极 = 0.5027 cm²
 *   ρ_q = 2 648 kg/m³       μ_q = 2.947×10¹⁰ Pa
 *   √(ρ_q μ_q) = √(2 648 × 2.947×10¹⁰) = **8.834×10⁶ kg·m⁻²·s⁻¹**
 *
 *   C_f = 2f₀²/√(ρ_qμ_q) = 5.000×10¹³ / 8.834×10⁶ = 5.660×10⁶ Hz/(kg/m²)
 *       = **5.66×10⁷ Hz·cm²/g**     （≡ 1 Hz ↔ 17.7 ng/cm²，教科书值 5.66 对得上）
 *
 * 一层 2.8 nm 的 Mo（ρ = 10.2 g/cm³）：
 *
 *   Δm/A = 10 200 × 2.8×10⁻⁹ = 2.856×10⁻⁵ kg/m² = 2.856×10⁻⁶ g/cm²
 *   Δf = 5.660×10⁶ × 2.856×10⁻⁵ = **161.6 Hz ≈ 162 Hz**
 *
 * 一层 4.1 nm 的 Si（ρ = 2.33）：9.553×10⁻⁶ kg/m² → **54.1 Hz**；一对 **216 Hz**。
 *
 * 反过来的刻度（这三个数就是整份文件的尺子）：
 *
 *   1 Hz        ↔ 0.0173 nm 的 Mo  ↔ 17.7 ng/cm²
 *   0.028 nm    ↔ **1.62 Hz**    ← "1/100 层"，题设要的那个分辨
 *   0.015 nm    ↔ **0.87 Hz**    ← 周期做到 ±0.03 nm 时每层只许错这么多
 *
 * ⚠️ **本层的 X 切路线做不出 5 MHz 的晶片。** `make/quartz-resonator` 交付
 * 32–1 000 kHz；5 MHz 用 AT 切、厚 334 µm，由 `make/quartz-resonator-5mhz`
 * 交付（clock.ts；切型/厚度依据见第七节第 1 条）。本段先按 1 MHz 的保底路线算：
 * 1 MHz 的片子按**本层自己的算式**是 2.8 µm 厚（那个算式与教科书差 600 倍，
 * 见第七节第 1 条 —— 但不影响这一段的结论）。1 MHz 的灵敏度按 f² 掉 25 倍：
 *
 *   2.8 nm Mo @1 MHz = **6.46 Hz**，1/100 层 = 0.065 Hz → 要 15 s 的积分，
 *   而一层只走 28 s。**1 MHz 基频在这件事上没有用。**
 *
 * 一条能走通的中间路：**1 MHz 的片子跑 5 次泛音**。Δf/f 与谐波无关，
 * 所以 5 MHz 上的 Δf = 5 × 6.46 = **32.3 Hz/层 = 11.5 Hz/nm** —— 比基频好 5 倍，
 * 比 5 MHz 基频差 5 倍（泛音用的是厚片子，频率上去了、t_q 也上去了）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、频率怎么测？（计数芯片 1 MHz，或与参考晶振拍频）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 门控计数的量化误差只有一条式子：**δf = 1/T_gate**。数字位数不进来，
 * 它进来的是"T 有多长"。而 T 在这里不是自由的 —— 一层只走 28 s。
 *
 *   ┌──────────────────────────┬────────┬──────────┬──────────────────────┐
 *   │ 测法                     │ T      │ δf       │ 换算成厚度            │
 *   ├──────────────────────────┼────────┼──────────┼──────────────────────┤
 *   │ 直接数 5 MHz（要 5 MHz 闸）│ 1 s   │ 1 Hz     │ 0.0173 nm（5 MHz 基频）│
 *   │ ÷8 预分频进 1 MHz 计数芯片│ 1 s    │ 8 Hz     │ **0.139 nm ✗**        │
 *   │ 拍频进 1 MHz 计数芯片     │ 1 s    │ 1 Hz     │ **0.0173 nm ✓**       │
 *   │ 拍频                      │ 10 s   │ 0.1 Hz   │ 0.0017 nm（但见下）   │
 *   └──────────────────────────┴────────┴──────────┴──────────────────────┘
 *
 * 三条结论：
 *
 * ① **÷8 这条路是死的**：8 Hz 的量化 = 0.14 nm，比现状的 0.078 nm 还差。
 *    1 MHz 的计数芯片数不了 5 MHz，预分频又不能免费换回分辨。
 * ② **拍频是唯一的路，而且它顺手把温漂也带走了**（第三节）。
 *    双晶拍出来的差频从 0.5 kHz 长到 9.1 kHz（40 对 × 216 Hz = 8.64 kHz），
 *    1 MHz 的计数芯片全程够。1 s 门给 1 Hz。
 * ③ **10 s 门不是"更准"，是"更晚"。** 0.1 Hz 确实比 1 Hz 细 10 倍，可是
 *    0.1 nm/s 下 10 s 走过 **1 nm** 的料 —— 它读的是 1 nm 的平均，
 *    而一层只有 2.8 nm。**镀的时候必须 1 s，10 s 只在快门关着标速率时用。**
 *
 * 题设问"要 0.01 % 各要多长"—— 0.01 % = 1e-4 = 5 MHz 上 500 Hz，1 s 门给
 * 1 Hz = 2×10⁻⁷，**比 0.01 % 准 500 倍，只要 2 ms 就够**。真正的数是
 * **0.32 ppm（1.62 Hz / 5 MHz），比 0.01 % 严 310 倍** —— 所以"要 0.01 %
 * 的话各要多久"这个问题本身就问松了：两个门都远远够，卡住的是
 * **积分时间不能超过一层**，不是位数。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、温度补偿：AT 切的拐点，和"双晶差分够不够"
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * AT 切在拐点附近是抛物线：Δf/f = a(T − T₀)²，**a ≈ −0.036 ppm/K²**，
 * 出厂拐点 T₀ 在 25 °C 附近。三个数：
 *
 *   单晶，100 °C（离拐点 75 K）  斜率 2aΔT = **5.4 ppm/K = 27 Hz/K**
 *   题设给的 50 ppm/K            对应 250 Hz/K —— **那是没做切角补偿的量级**，
 *                                与 AT 切差 9 倍，差的正是"切角"这一件事
 *   整只晶片在 100 °C 待着      Δf/f = −0.036×75² = −202 ppm = **−1 012 Hz**
 *
 * 镀膜腔要烘到 150 °C、镀时基底 100–150 °C（`make/euv-mirror-300`），
 * 所以"晶片跟着腔温走 10 K"不是假设，是默认状态。四条阶梯，各自带数
 * （都按"读数偏了多少"算，也分清**慢漂**与**台阶**）：
 *
 *   ① **单晶、不差分、跟着腔温**：27 Hz/K。腔温在 66 min 里走 10 K → 270 Hz
 *      = **4.7 nm 的累积** = 周期上 **0.117 nm** —— 比现状的 0.078 还差。
 *      （所以"装一只晶振"这件事本身不会让镜子变好，这是第一处反直觉。）
 *
 *   ② **双晶差分**（一只被遮住做参考）：共模项消掉，只剩 a[2(T−T₀)Δ + Δ²]。
 *      Δ = 0.5 K 在 100 °C 上给 13.5 Hz 的偏置（开机扣得掉），
 *      但**对 Δ 的灵敏度仍是 2a(T−T₀) = 27 Hz/K** —— 两只之间的温差变 0.1 K，
 *      读数就**台阶式**跳 2.7 Hz = **0.047 nm**，而台阶全落在那一层上。
 *      **不够（预算 0.015 nm/层，差 3 倍）。**
 *      差分杀的是"两只一起漂"，杀不掉"两只漂得不一样"。
 *
 *   ③ **再把整块压在拐点上**：水冷板 20 °C（镀膜腔本来就有 20 °C 水套），
 *      AT 切角偏 ~50′ 把拐点从 25 °C 挪到 20 °C（每 1′ 约 0.1 °C）。
 *      这时 T − T₀ = 0，**2a(T−T₀)Δ 整项消失**，温差 Δ 只进二阶：
 *      aΔ² = 0.036×2² = 0.14 ppm = 0.72 Hz 的固定偏置（开机扣一次），
 *      斜率 2aΔ = 0.144 ppm/K = 0.72 Hz/K。Δ 变 0.5 K 才 0.36 Hz
 *      = **0.006 nm**（5 MHz 基频）/ 0.031 nm（泛音）。**够。**
 *      水 20 ± 0.5 K 本身反而不要紧：那是**慢漂**，1 K/66 min → 0.72 Hz
 *      = 0.0125 nm 累积，摊到 40 对只有 0.0003 nm/周期。
 *
 *   ④ 结论：**差分单独不够（0.047 nm 的台阶），差分 + 拐点恒温够（0.006 nm）。**
 *      恒温买的是"把一阶项变成二阶项"，差分买的是"共模" —— 两件事都要。
 *      "本层有恒温间 19–21 °C"帮不上忙：晶片在真空腔里，恒温间管的是腔外。
 *      能用的只有腔体自己的 20 °C 水套，而它本来就是为烘烤/控形装的。
 *
 * ⚠️ 还有一处差分救不了的：**挡片让参考晶片看不见通量**，于是靶点火时的
 * 热载阶跃只作用在测量晶片上，共模项不在那里。对策是"点火 → 等 60 s →
 * 再开快门"，代价是每批 1 min，并且第一对膜按"先空镀 20 s"处理。
 * 更好的解法写在降级点第 4 条（半透挡片）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、光学监控的极限：488 nm 的极值根本不是层界
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 稳频激光 488.0 nm（`plant/stabilized-laser`）斜照在片上，R 随厚度振荡。
 * 振荡周期 Δd = λ/(2 n_eff)，而 Mo/Si 一对的有效折射率是
 *
 *   n_eff = (2.8×3.2 + 4.1×4.2)/6.9 = **3.79**（n_Mo = 3.2、n_Si = 4.2 @488）
 *   Δd = 488/(2×3.79) = **64.3 nm = 9.3 对**
 *
 * 于是"数极值"这条路在这个体系上是这样：
 *
 *   一层 2.8 nm           = **0.0436 个周期 = 15.7° 相位** → 一层里 **0 个极值**
 *   整块 40 对（276 nm）  = 4.29 个周期 → **8.6 个极值，一个每 9.3 对**
 *   一层 28 s，一个周期   = 643 s（0.1 nm/s）
 *   1 s 时间常数          = 抹掉 0.1 nm = 0.56° = 一层相位的 3.6 %（这一项不卡）
 *
 * 极值定位精度（R 在极值附近是二次的：R = R_max − (A/4)δφ²）：
 *
 *   信噪比 δR/A = 1e-3 → δφ = 2√(1e-3) = 0.063 rad
 *   δd = (Δd/2π)·δφ = 10.23 × 0.063 = **0.65 nm**
 *   在最陡处（一阶过零）：δd = (δR/A)·Δd/π = 1e-3 × 20.5 = **0.020 nm**
 *
 * **同样一只光电管，极值法 0.65 nm、斜率法 0.020 nm，差 32 倍。**
 * 差在数学上：极值处 dR/dd = 0，而斜率处不是。所以：
 *
 *   ① 题设的"反射率极值法"在这条链上**不成立**：一层里 0 个极值，
 *      极值定位 0.65 nm 比要的 0.03 nm 粗 22 倍、比一层还厚 4 倍。
 *   ② 换成"相位斜率法"（锁相测 dφ/dt，材料切换时斜率出现拐点）能到 0.020 nm，
 *      而且 1 s 的时间常数只抹 0.56°，够。**但它读的是 n·d，不是 d** ——
 *      n 本身要标定（溅射膜的 n 随密度漂 2 %，就是 0.056 nm）。
 *   ③ 吸收还限了它看多深：α = 4πk/λ = 4π×3.4/488 = 0.0875 nm⁻¹，
 *      强度 1/e 深度 11.4 nm ≈ 1.7 对 → **它只看最上面 2–3 对**。
 *      这对"抓速率漂"是好事（局部），对"绝对厚度"是坏事（没有长基准）。
 *
 * 所以光学这一路的位置不是"定终点"，是**每 9.3 对一次的绝对校核**：
 * 它治的是 QCM 的 tooling factor 在 66 min 里慢慢漂（2 %），
 * 治不了层间随机。**终点仍然必须由 QCM 给。**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、怎么标定？（tooling factor 与那块已知厚度的片子）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 先纠一处：题设说 `plant/interferometer` 是 0.52 nm 读出 —— **不是**。
 * 它是钠焰 589 nm + 人眼数 1/20 条纹 = **15 nm**（`interferometer.ts`）。
 * 0.52 nm 是另一台：`plant/ref-flat-interferometer`（λ/1000 参考面 + 多光束
 * ℱ = 25 + 八帧移相 0.47 nm）。两台要分开说，否则"够不够"就没法算。
 *
 * 再答"euv-reflectometer 能测膜厚吗"：**不能**。它的三个 props 是
 * angleError / reflectivityAccuracy / bakeTemperature —— 里面没有 thickness。
 * 它测 13.5 nm 的反射率，而 13.5 nm 的光本层没有（`euv-reflectometer.ts`
 * 降级①：光源要用这种镜子）。所以它连"验证反射率"都做不到，更不能当厚度基准。
 *
 * 剩下两把尺子，算同一件事：**读一个 1 µm 的台阶**。
 *
 *   干涉仪 15 nm 绝对读出 / 1 000 nm 台阶   = **1.5 %**  ← 正是 `make/euv-mirror-300`
 *                                              现在花在标定上的那一笔
 *   干涉仪 15 nm / 10 000 nm 台阶           = **0.15 %**  ← 台阶越厚越准
 *   λ/1000 干涉仪 0.52 nm / 1 000 nm 台阶   = **0.05 %**  ← 余量 8.6 倍
 *
 * 要求是 0.03/6.9 = **0.43 %**。所以：**λ/1000 那台够（8.6 倍余量），
 * 15 nm 那台差 3.5 倍（1 µm 台阶），把台阶加厚到 10 µm 也够（0.15 %）。**
 *
 * ⚠️ 但 tooling factor 的真身不是"厚度比"，是**密度比**：
 * QCM 读的是质量（Δm/A），干涉仪读的是几何厚度 —— 两者一除，
 * 得到的是 ρ_film/ρ_bulk。溅射膜比块体松 2–10 %（0.3 Pa、0.5 W/cm² 下取 3 %），
 * 而它随靶面起坑、气压、功率变。**所以这是一支要跟着靶走的尺子，不是一次标定管一年。**
 * 本文件的处置：每批一片标定片、**与镜子同炉镀**（不同炉标的是另一炉的密度）。
 *
 * 最后一句是关于 `euv-mirror.ts` 那句"这台机器上不装晶振膜厚监控"的：
 * 它说"卡住周期的不是看不见厚度，是标定（1.5 %），换监控手段并不能把它改小"。
 * **这句话对了一半。** 晶振确实救不了 tooling factor —— 但 tooling factor
 * 那一笔正好被 λ/1000 干涉仪从 1.5 % 压到 0.05 %；而晶振救的是另外两样，
 * 那两样开环根本看不见：
 *
 *   快门响应 0.3 s × 0.10 nm/s  = 0.030 nm/层   ← 晶振把它变成"读到就关"
 *   速率在 66 min 里漂 2 %      = 0.35 nm/周期   ← 晶振把它变成"闭环"
 *
 * 三笔账一起清掉，才够 0.03 nm。只做其中一笔都不够。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、主方案与两条降级
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   **主方案：QCM 定速率与逐层终点，光学每 9.3 对校一次绝对值。**
 *
 *   判据不是"工业上两者并用"，是第一节那张表算出来的：
 *   QCM 独用会剩一个"tooling factor 一路漂"的系统项（2 % → 0.14 nm/周期，
 *   比 0.03 nm 大 5 倍）；光学独用会剩层间随机（0.078 nm），因为它 9.3 对
 *   才看见一个极值。**两样各补对方缺的那一半，缺一不可。**
 *
 *   三条路线（同一条 `std/euv-mirror-300`，三个等级，σ 都指**周期**误差）：
 *
 *     make/euv-mirror-300-monitored   QCM 5 MHz 基频 + 光学校核   σ ≈ 0.024 → 0.03
 *     make/euv-mirror-300-qcm         只有 QCM（1 MHz 泛音）      σ ≈ 0.05
 *     make/euv-mirror-300-optic       只有光学（斜率法）          σ ≈ 0.07
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 七、降级点台账（每一处都配升级条件与缺口量级）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 写法：**能写成路线的就写成路线（id 在下面的数据里）**；升级需要一台本文件
 * 不造的设备的，只写"条件 + 缺口" —— 造那台设备属于别的文件的一族，
 * 在这里写一条空壳路线才是假的。
 *
 *  1. **5 MHz 基频晶片**（X 切路线 `make/quartz-resonator` 只到 1 000 kHz；
 *     5 MHz 由 `make/quartz-resonator-5mhz` 交付，见 clock.ts）。
 *     降级：1 MHz 片子跑 5 次泛音，11.5 Hz/nm（比 5 MHz 基频差 5 倍）。
 *     升级：`make/film-monitor-qcm-head-5mhz`。频率/灵敏度各 **5 倍**。
 *     ⚠️ **"f·t 差 600 倍"是切型混用，不是数据错**（本节更正我自己的初判）：
 *     本层 `phase-shifter.ts` 明写的是 **X 切**（厚度伸缩模态），其频率常数
 *     N_X = **2.8 MHz·mm** —— 100 kHz ↔ 28 µm 正好对上，这一条没有错。
 *     而 QCM 用的是 **AT 切**（厚度剪切），N_AT = **1.67 MHz·mm**：5 MHz → **334 µm**，
 *     100 kHz → 16.7 mm（是根棒，不是片）。
 *     所以两个常数都对，差别只是切型；**5 MHz AT 切要磨到 334 µm，
 *     而本层已经在磨 28 µm —— 这一档反而更容易**。
 *     换切型就要换路线（AT 切角 35°15′、X 切 0°），换的是**工艺**，
 *     不是磨得动磨不动。5 MHz 的 `gives` 窗口与 334 µm 的换算式见
 *     clock.ts 的 `make/quartz-resonator-5mhz`；这条降级点仍保留，作为来料
 *     不合格时的保底。
 *
 *  2. **运放 GBW 只有 1 MHz，做不了 5 MHz 振荡器**（`stabilized-laser.ts`：
 *     10–30 门的运放 GBW ~1 MHz）。降级：拆 `std/counter-chip-general` 里的
 *     5 µm 平面管做皮尔斯级（f_T 在 100 MHz 量级），运放只用在 10 kHz 的拍频
 *     放大上（那里它是 100 倍增益）。
 *     升级：`std/opamp-chip-general` 的 GBW 到 10 MHz —— 缺口 **10 倍**，
 *     而那是 1 µm 线宽那一档的事，整条半导体链要重走一遍。
 *
 *  3. **恒温只到 ±0.5 K（借腔体那路水套），不是独立恒温浴的 ±0.1 K。**
 *     慢漂在这一档无所谓（1 K/66 min → 0.0003 nm/周期，见第三节③）；
 *     它买不到的是**快变抑制** —— 水流与负载的快变会变成 0.72 Hz/K 的读数台阶，
 *     0.5 K 一步 = 0.006 nm（5 MHz 基频）/ 0.031 nm（泛音）。
 *     升级条件：一路自己的恒温浴（±0.1 K）—— 那要一台本文件不造的设备
 *     （控温桥 + 加热器 + 独立循环水，属恒温那一族）。缺口 **5 倍**（0.5 K → 0.1 K）。
 *
 *  4. **挡片让参考晶片看不见通量**，点火热载阶跃只能靠"等 60 s"。
 *     升级：把实心挡片换成 20–30 % 透过率的网片，两只晶片吃到同一份通量的
 *     不同比例 → 阶跃的共模项回来，残差从 100 % 降到 20–30 %。缺口 **3–5 倍**，
 *     代价是对比度降一档（差频的零点要重扣）。
 *
 *  5. **tooling factor 的密度项随靶老化漂 2–10 %**，而它只能靠标定片间接看。
 *     升级：每批一片标定片（本文件已按每批写进路线）。缺口：如果省掉这一片，
 *     密度项按 3 % 算 = **0.21 nm/周期**，比 0.03 nm 大 7 倍 —— 这一片不能省。
 *
 *  6. **氧测不了。** Mo 层的密度与含氧直接相关：
 *     0.3 Pa 氩里 7 ppm 的氧在 Mo 里攒成 MoO₂，密度掉、n 掉、tooling factor 跟着掉。
 *     **氧量具已建三台**（`plant/oxygen-probe` oxygen-metrology.ts:729、`plant/dew-point-meter`
 *     802、`plant/inert-gas-fusion-analyzer` 764），但它们测的是**流动气体**（取样
 *     0.1 L/min、样品池 1 cm³）—— 接不进 0.3 Pa 的镀膜腔，所以这一项**仍既测不出也除不掉**，
 *     只能靠"五轮氩冲洗的轮数"这种工艺保证 + 每批标定片兜底。
 *     **这是本文件最诚实的一处降级**：第 5 条那个"2–10 %"里，有一半是它。
 *     升级：把探针的取样口接到腔的旁路（下界 1e-9 ppm，稀释后仍够判 7 ppm）；这条旁路本文件还没有。
 *
 *  7. **光学只有 488 nm，不是 13.5 nm。** 它量的是 n·d @488，而设计要的是
 *     6.9 nm @13.5。n(488) 与 n(13.5) 的色散关系由密度定 —— 所以光学这一路
 *     与 QCM 共用同一个未知量（密度），**它不是独立基准**，只是同一件事的第二次读数。
 *     升级：13.5 nm 的 at-wavelength 检测 —— 那要用这种镜子本身，环自己咬自己
 *     （`euv-mirror.ts` 降级第 7 条）。缺口：**本层永远补不上**。
 *
 *  8. **40 对里没有"层界"信息。** 光学 9.3 对才一个极值、QCM 一层一个数 ——
 *     但 QCM 那个数是**质量**，不是这一层的几何厚度。两者的差就是密度项，
 *     也就是第 5、6 条。这一条不是能修的东西，是这套仪器的**分辨率定义**。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目：五件零件 + 一片标定标准 + 一台仪器
// ═══════════════════════════════════════════════════════════════════════════

export const FILM_MONITOR_ITEMS: readonly Item[] = [
  /**
   * **双晶探头。** 两只 φ8 mm 的 AT 切晶片贴在同一块水冷铜块上，
   * 一只朝向靶（测），一只被不锈钢挡片遮住（参考）。挡片开一道 3 mm 的窄缝，
   * 让参考晶片也能慢慢镀上一点 —— 不然它会被"镀得比测量片少"这件事本身拖出零点。
   *
   * 三个 props 是第二节、第三节的全部结论：
   *
   *   frequency    1 000 kHz（保底）或 5 000 kHz（`make/quartz-resonator-5mhz`）
   *   sensitivity  **11.5 / 57.7 Hz/nm**（泛音 / 基频，见文件头第一节）
   *   drift        **0.72 Hz/K** —— 在 20 °C 拐点上，对块温和对两只之间的温差
   *                **都是** 0.72 Hz/K（这正是把整块压在拐点的用处：一阶项没了）。
   *                离开拐点（比如跟着腔温到 100 °C）时，对温差的灵敏度是
   *                **27 Hz/K（差 37 倍）**；单晶不差分还要外加 −1 012 Hz 的偏置。
   *
   * 两只晶片**必须配对**（频差 < 500 Hz）：差频要落进 1 MHz 计数芯片的量程，
   * 而 40 对之后差频会长到 8.64 kHz（216 Hz/对）—— 0.5 kHz 的起点正好让它
   * 全程落在 0.5–9.1 kHz 里。这不是选出来的数，是 40 对 × 216 Hz 倒推的。
   */
  {
    id: 'plant/film-monitor/qcm-head',
    name: 'In-Situ Film Thickness Monitor Dual-Crystal Probe', name_zh: '原位膜厚监控仪双晶探头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'frequency', kind: 'range', min: 0, max: 100000, unit: 'kHz', dir: 'atLeast' },
      { param: 'sensitivity', kind: 'range', min: 0, max: 1000, unit: 'Hz/nm', dir: 'atLeast' },
      { param: 'drift', kind: 'range', min: 0, max: 1000, unit: 'Hz/K', dir: 'atMost' },
    ],
  },

  /**
   * **振荡器。** 两路皮尔斯级：一路接测量晶片、一路接参考晶片，两只的输出
   * 混频取差。为什么要两路：差频是**唯一**能进 1 MHz 计数芯片又保留 1 Hz
   * 分辨的办法（文件头第二节①）。
   *
   * 增益器件是**从计数芯片里拆出来的两只平面管**，不是运放 ——
   * 本层的运放 GBW ~1 MHz，在 5 MHz 上增益小于 1，振不起来。
   * 5 µm 平面管的 f_T 在 100 MHz 量级，跑 5 MHz 有余。
   * 运放只用在**拍频放大**上：10 kHz 上 GBW 1 MHz 给 100 倍，绰绰有余。
   *
   *   frequency  5 000 kHz    工作频率（泛音或基频，由探头定）
   *   beatBand   10 000 Hz    差频量程：0.5 kHz 起、8.64 kHz 止
   */
  {
    id: 'plant/film-monitor/oscillator',
    name: 'In-Situ Film Thickness Monitor Oscillator', name_zh: '原位膜厚监控仪振荡器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'frequency', kind: 'range', min: 0, max: 100000, unit: 'kHz', dir: 'atLeast' },
      { param: 'beatBand', kind: 'range', min: 0, max: 100000, unit: 'Hz', dir: 'atLeast' },
    ],
  },

  /**
   * **门控计数器。** 三片 `std/counter-chip-general` 串成十进链（÷10³），
   * 闸门由一只 100 kHz 晶振分频得到，**两档：1.5 s 与 3 s**（一只开关），
   * 显示用机械计数器。
   *
   * 三个 props 就是第二节那张表的最后一行：
   *
   *   countRate  1 000 kHz   1 MHz —— 本层计数芯片的上限（`stabilized-laser.ts`）
   *   gateTime   ≤ 3 s       两档：1.5 s（主方案）/ 3 s（泛音探头那一档）
   *   resolution ≤ 0.67 Hz   1/1.5 s —— 折成厚度：0.67/57.7 = **0.012 nm**（主方案）
   *                          3 s 档是 0.33 Hz → 0.33/11.5 = **0.029 nm**（泛音方案）
   *
   * 为什么泛音版要用 3 s 而主方案只要 1.5 s：泛音探头的灵敏度只有 11.5 Hz/nm，
   * 要凑到同一个厚度分辨就得多积一倍时间。**这不是"更准"，是"用时间补灵敏度"** ——
   * 3 s 仍只占一层的 11 %，滞后靠"按速率外推"补掉，噪声补不掉。
   *
   * ⚠️ 闸门为什么不是 10 s：0.1 Hz 更细，但 10 s 走过 1 nm 的料，
   * 读的是"1 nm 的平均"。镀的时候最多 3 s（文件头第二节③）。
   */
  {
    id: 'plant/film-monitor/counter',
    name: 'In-Situ Film Thickness Monitor Gated Counter', name_zh: '原位膜厚监控仪门控计数器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'countRate', kind: 'range', min: 0, max: 100000, unit: 'kHz', dir: 'atLeast' },
      { param: 'gateTime', kind: 'range', min: 0, max: 100, unit: 's', dir: 'atMost' },
      { param: 'resolution', kind: 'range', min: 0, max: 1000, unit: 'Hz', dir: 'atMost' },
    ],
  },

  /**
   * **光学头。** 488 nm 稳频激光斜入射（60°），双孔光阑 + 光电二极管 +
   * 1 s 积分器；另外挂一只检流计振镜，以 ±2°、1 Hz 抖振入射角。
   *
   * 振镜不是附件，它是**把极值法换成斜率法**的那一件：
   * 角度抖振让 dR/dθ 在层界处过零，而零点定位用一阶项（0.020 nm），
   * 比等极值（二次项，0.65 nm）好 32 倍（文件头第四节）。
   *
   *   wavelength  488 nm      氩的线，`plant/stabilized-laser` 已经在
   *   probeDepth  ≤ 22 nm     Mo 在 488 的吸收深度 11.4 nm → 只看最上面 ~3 对
   *   noise       ≤ 0.1 %     δR/A —— 0.1 % 才推得出 0.020 nm
   */
  {
    id: 'plant/film-monitor/optical-head',
    name: 'In-Situ Film Thickness Monitor Optical Head', name_zh: '原位膜厚监控仪光学头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'wavelength', kind: 'range', min: 400, max: 600, unit: 'nm' },
      { param: 'probeDepth', kind: 'range', min: 0, max: 1000, unit: 'nm', dir: 'atMost' },
      { param: 'noise', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * **真空信号法兰。** 两件：一件走同轴（差频与光电信号），一件走石英窗（488 nm）。
   *
   * 漏率 1×10⁻⁴ Pa·L/s 与镀膜腔同档（`plant/euv-coater/chamber` 也是这个数）——
   * 因为腔的底线本来就不是漏率，是 1 Pa 的罗茨机组。做严没有意义。
   *
   * 唯一真要求是**不引入新的放气源**：密封圈用硅橡胶（本层没有氟橡胶），
   * 烘烤 150 °C 时硅橡胶放气比腔壁高一个量级 —— 所以这两件要在烘烤之后才装。
   */
  {
    id: 'plant/film-monitor/feedthrough',
    name: 'In-Situ Film Thickness Monitor Vacuum Signal Flange', name_zh: '原位膜厚监控仪真空信号法兰',
    unit: '件',
    category: 'part',
    props: [{ param: 'leakRate', kind: 'range', min: 0, max: 1, unit: 'Pa·L/s', dir: 'atMost' }],
  },

  /**
   * **标定片。** 一片 φ100 硅片，半边挡着、半边镀 1 µm 的钼 —— 中间那道台阶
   * 是 tooling factor 的**唯一**基准（文件头第五节）。
   *
   * 它是一片**用量极少但不可省**的东西：40 对镜子的膜重只有 0.4 mg，
   * 而这一片要镀 1 µm 的钼（≈0.4 g，是整面镜子的 1 000 倍）。为什么值：
   * 台阶越厚，15 nm 的绝对读出误差摊得越薄（1 µm → 1.5 %，10 µm → 0.15 %）。
   *
   *   stepHeight  1 000 nm    1 µm 是"干涉仪够用"与"镀 2.8 h 不太贵"的折中
   *   stepError   ≤ 15 nm（第一把尺）/ ≤ 0.52 nm（λ/1000 那把）
   */
  {
    id: 'plant/film-monitor/step-wafer',
    name: 'In-Situ Film Thickness Monitor Calibration Wafer', name_zh: '原位膜厚监控仪标定片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'stepHeight', kind: 'range', min: 0, max: 50000, unit: 'nm' },
      { param: 'stepError', kind: 'range', min: 0, max: 1000, unit: 'nm', dir: 'atMost' },
    ],
  },

  /**
   * **原位膜厚监控仪。** 一台机器，五件零件，**没有产出路线** ——
   * 与 `plant/euv-coater`、`plant/ref-flat-interferometer`、`plant/stabilized-laser`
   * 同一个形状（`composedOf` 与 `produces` 不许同时出现）。
   * "能不能造出来"由报告遍历它的五件零件回答，不由一句话回答。
   *
   * 它不进 `performedBy`（那 73 台里没有它），位置是 `needs`：
   * 镀膜路线**必须在它上面跑**，但它不被消耗。
   *
   * `holds: temperature 19.5–20.5` 是文件头第三节②那一条的数据形态：
   * **这台仪器维持的是"晶片自己在 20 °C"** —— 腔里 100–150 °C 是另一件事，
   * 由 `plant/euv-coater` 的 20–200 维持。两个 `temperature` 在同一条路线上
   * 分属不同的工序段，正是 `steps` 存在的理由。
   *
   * 两个 props 是整机的验收指标，**没有 `gives`**（它没有产出路线）：
   *
   *   thicknessError ≤ 0.012 nm   主方案（5 MHz 基频 + 1.5 s 闸 + 拐点恒温）
   *   sampleInterval ≤ 1.5 s      采样间隔 —— 一层 28 s 里取 19 个点
   *
   * ⚠️ 0.012 nm 是**仪器自己的分辨**，不是周期误差。折成周期还要乘 √2，
   * 再叠上 tooling factor 的 0.05 %（= 0.0035 nm）与密度随靶老化那一项 ——
   * 合起来才是 `make/euv-mirror-300-monitored` 的 `period 6.87–6.93`。
   *
   * ⚠️ ⚠️ 这 0.012 nm 只在**装 5 MHz 基频探头**时成立。同一台仪器装 1 MHz 泛音
   * 探头（`make/film-monitor-qcm-head`，保底路线的那一只）时是
   * 0.67 Hz / 11.5 Hz/nm = **0.058 nm**，正好对应 `make/euv-mirror-300-qcm`
   * 的 `period 6.85–6.95`。**同一个 id 的两个等级 —— 值在路线里，不在条目里**，
   * 这也是这一层 `props` 机制的用处：探头有两条产出路线（OR），
   * 装哪只由那两条路线各自交付的 `frequency` / `sensitivity` 决定。
   */
  {
    id: 'plant/film-monitor',
    name: 'In-Situ Film Thickness Monitor', name_zh: '原位膜厚监控仪',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'temperature', min: 19.5, max: 20.5 }],
    props: [
      { param: 'thicknessError', kind: 'range', min: 0, max: 100, unit: 'nm', dir: 'atMost' },
      { param: 'sampleInterval', kind: 'range', min: 0, max: 100, unit: 's', dir: 'atMost' },
    ],
    composedOf: [
      { item: 'plant/film-monitor/qcm-head', qty: q(1) },
      // 两只晶片各要一路振荡器：差频是两路混出来的，不是一路自己跟自己拍。
      { item: 'plant/film-monitor/oscillator', qty: q(2) },
      { item: 'plant/film-monitor/counter', qty: q(1) },
      { item: 'plant/film-monitor/optical-head', qty: q(1) },
      // 两件：一件走电（差频），一件走光（488 nm）。都是烘烤后才装的。
      { item: 'plant/film-monitor/feedthrough', qty: q(2) },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线
// ═══════════════════════════════════════════════════════════════════════════

export const FILM_MONITOR_ROUTES: readonly Route[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 2.1 晶振探头：本层能做的（1 MHz 泛音）与升级（5 MHz 基频）
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **探头，本层版本。** 1 MHz 的片子跑 5 次泛音。
     *
     *   晶振 4（两只装、两只是配对废品）+ 铜 2 + 钢片 1 + 铝 0.1 + 水 20
     *   → 探头 1 件（frequency 1 000 kHz、sensitivity 11.5 Hz/nm、drift ≤ 0.72 Hz/K）
     *
     * 三个数怎么来的：
     *
     *   11.5 Hz/nm   1 MHz 基频 6.46 Hz / 2.8 nm = 2.31 Hz/nm，× 5 次泛音 = 11.5
     *                 （Δf/f 与谐波无关，所以泛音的 Δf 是基频的 n 倍、不是 n² 倍）
     *   0.72 Hz/K    差分 + 20 °C 拐点的残差，2aΔ = 2×0.036×2 K = 0.144 ppm/K
     *   水 20 kg     铜块水冷槽的充水量，从腔体那一路 20 °C 水分出来（不进成品）
     *
     * 为什么是厚片子跑泛音而不是薄片子跑基频：**薄片子本层做不出来**，
     * 而厚片子磨起来是本层最轻松的一件活（按教科书的 AT 切常数 1.67 MHz·mm，
     * 1 MHz 是 1.66 mm；按本层自己那个常数是 2.8 µm —— 两个数差 600 倍，
     * 见文件头第七节第 1 条）。无论按哪个，1 MHz 都比 5 MHz 好磨。
     * 代价写在 gives 里：灵敏度掉 5 倍。
     *
     * "配对"那一道（频差 < 500 Hz）要在恒温间里做，用同一批装出来的
     * 第一套振荡器 + 计数器当量具 —— 这一批零件自己给自己当量具，
     * 是这一层的老办法（`make/galvanometer` 也是先做两只、拿好的那只调坏的）。
     */
    id: 'make/film-monitor-qcm-head',
    name: 'In-Situ Film Thickness Monitor Dual-Crystal Probe Manufacturing', name_zh: '原位膜厚监控仪双晶探头制造',
    produces: [
      {
        item: 'plant/film-monitor/qcm-head',
        qty: q(1),
        gives: [
          { param: 'frequency', kind: 'range', min: 1000, max: 1000 },
          { param: 'sensitivity', kind: 'range', min: 11.5, max: 11.5 },
          { param: 'drift', kind: 'range', min: 0, max: 0.72 },
        ],
      },
    ],
    uses: [
      // 4 只：两只装进探头（一只测、一只参考），两只是配对废品 —— 频差 >500 Hz 就淘汰。
      { anyOf: [{ item: 'std/quartz-resonator-general', qty: q(4) }] },
      // 水冷铜块：两只晶片压在同一块上，这是差分的全部依据。
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      // 挡片与屏蔽罩（0.5 mm 不锈钢板，开 3 mm 窄缝）。
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      // 电极引线与晶片座上的铝箔屏蔽。
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      // 水冷槽试压与冲洗的水，不进成品。
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: '车水冷铜块：两只晶片座共面 0.01 mm、水槽离晶片面 3 mm（共面是差分的命）',
        performedBy: 'lathe',
      },
      {
        note_zh: '磨晶片座与挡片（挡片开 3 mm 窄缝，让参考片也慢慢镀上一点）',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '装晶片、压簧、焊引线，两只晶片间距 8 mm（同一块铜块上的两点）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '配对：恒温间里量两只的差频，>500 Hz 淘汰 —— 要它落在 0.5–9.1 kHz 的差频带里',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '水冷槽试压 5 kPa / 30 min，压降 ≤2%（漏了就把腔里的 20 °C 水灌进真空）',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '晶振 4 + 铜 2 + 钢 1 + 铝 0.1 + 水 20 → 探头 1 件；水 20 kg 走掉，两只配对废品回炉。'
      + '这台机器按"件"计，本来不走质量账，这一行只是把"废品去哪儿了"写清。',
  },

  {
    /**
     * **探头，升级版本。** 5 MHz 基频 —— 57.7 Hz/nm，比本层版本好 5 倍。
     *
     *   晶振 4（**要 5 000 kHz**）+ 铜 2 + 钢片 1 + 铝 0.1 + 水 20
     *   → 探头 1 件（frequency 5 000 kHz、sensitivity 57.7 Hz/nm、drift ≤ 0.72 Hz/K）
     *
     * **这条路线是 R8 要的那条"恢复原规格的路线"；5 MHz 来料已由
     * `make/quartz-resonator-5mhz`（clock.ts）交付。**
     *
     * `std/quartz-resonator-general` 的声明窗口是 1–100 000 kHz。X 切路线
     * `make/quartz-resonator` 只交付 **32–1 000 kHz**；5 MHz 不能靠放宽它的
     * `gives` 得到（X 切 5 MHz 只有 0.56 µm），所以另开 AT 切路线，交付
     * `4 900–5 100 kHz`。这里的 `need: 4 900–5 100 kHz` 由它覆盖。
     *
     * 缺口多大：5 倍频率 = 5 倍灵敏度（0.058 nm → 0.012 nm/层），
     * 也就是 `period` 从 6.85–6.95 收到 6.87–6.93 的那一步。
     *
     * ⚠️ 缺口**不在磨制上**。按教科书的 AT 切常数（1.67 MHz·mm），
     * 5 MHz 只要一块 **334 µm** 的片子 —— 比 `make/quartz-resonator` 声称
     * 已经磨到的 28 µm 厚 12 倍，厚片子更好磨、更不容易碎。
     * （若按本层自己那个 600 倍偏小的常数，5 MHz 是 0.56 µm，那就真是磨不动了 ——
     * 两个常数的岔子记在文件头第七节第 1 条，这里不仲裁。）
     * 所以这条路线的代价只是**把切型从 X 切（0°）换成 AT 切（35°15′）**；
     * 设备与料不新增，334 µm 与 4 900–5 100 kHz 的换算式见 clock.ts。
     *
     * `onRelax: 'functional-kept'` 是这一行的诚实处：拿 1 MHz 的片子装上去，
     * 探头**照样工作**（照样镀得出镜子），只是分辨差 5 倍 —— 按"换完还会不会"，
     * 这是降级，不是"换了一个东西"。
     */
    id: 'make/film-monitor-qcm-head-5mhz',
    name: 'In-Situ Film Thickness Monitor Dual-Crystal Probe Manufacturing', name_zh: '原位膜厚监控仪双晶探头制造',
    produces: [
      {
        item: 'plant/film-monitor/qcm-head',
        qty: q(1),
        gives: [
          { param: 'frequency', kind: 'range', min: 5000, max: 5000 },
          { param: 'sensitivity', kind: 'range', min: 57.7, max: 57.7 },
          { param: 'drift', kind: 'range', min: 0, max: 0.72 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'std/quartz-resonator-general',
            qty: q(4),
            need: [{ param: 'frequency', kind: 'range', min: 4900, max: 5100 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: '车水冷铜块：晶片座共面 0.01 mm（5 MHz 片子按 AT 切是 334 µm，比 1 MHz 的 1.66 mm 薄 5 倍；共面要求一样，压簧力要轻）',
        performedBy: 'lathe',
      },
      { note_zh: '磨晶片座与挡片', performedBy: 'plant/grinder' },
      {
        note_zh: '装晶片与引线：薄片子的电极电容大，引线要短（<10 mm），否则 Q 掉一半',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '配对：两只的基频差 <500 Hz（拍频带 0.5–9.1 kHz 不变，灵敏度涨 5 倍）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      { note_zh: '水冷槽试压 5 kPa / 30 min', performedBy: 'plant/robot' },
    ],
    unbalanced_zh:
      '同上一条；差别只有晶片的那 5 MHz 一项 —— 来料由 '
      + '`make/quartz-resonator-5mhz` 交付，这条路线不再因缺料而停在 need 上。',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.2 振荡器：5 MHz 的增益从哪来（运放不够，拆计数芯片的门）
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **双路振荡器 + 混频。**
     *
     *   计数芯片 1（拆门取平面管）+ 电容 6 + 齐纳 2 + 运放 1
     *   + 铜线 0.2 + 钢片 1 → 振荡器 2 件
     *
     * 三处必须说清的：
     *
     * ① **增益器件不是运放。** `stabilized-laser.ts` 给本层运放的数是
     *    "10–30 门，GBW ~1 MHz"。5 MHz 上它的增益是 0.2，**振不起来**。
     *    所以从计数芯片里拆两只 5 µm 平面管做皮尔斯级 —— f_T 在 100 MHz 量级，
     *    5 MHz 上是几十倍增益。这是"用本层的料绕开本层的短板"，
     *    不是"做得差一点"，所以它不是降级（第 24 条的判据：还做原来那件事）。
     *
     * ② **运放不白给，它去干拍频。** 差频 0.5–9.1 kHz，GBW 1 MHz 在这里
     *    是 100–2 000 倍的余量，绰绰有余。**同一颗芯片，在 5 MHz 上不够、
     *    在 10 kHz 上太多** —— 这一句话就是"为什么要有混频"的全部理由。
     *
     * ③ **齐纳 2 只**：一只给振荡级的偏置，一只给计数器的门控。
     *    它的温度系数 +2 mV/°C 在这个应用里不要紧（差频是比值，不是绝对值）。
     *
     * beatBand 10 kHz 的来源是倒推的：40 对 × 216 Hz/对 = 8.64 kHz，
     * 加 0.5 kHz 的起点与 0.9 kHz 的余量。
     */
    id: 'make/film-monitor-oscillator',
    name: 'In-Situ Film Thickness Monitor Oscillator Manufacturing', name_zh: '原位膜厚监控仪振荡器制造',
    produces: [
      {
        item: 'plant/film-monitor/oscillator',
        qty: q(2),
        gives: [
          { param: 'frequency', kind: 'range', min: 5000, max: 5000 },
          { param: 'beatBand', kind: 'range', min: 10000, max: 10000 },
        ],
      },
    ],
    uses: [
      // 一片芯片 40 个门、每门两只管子：拆两只出来做振荡级，剩下的当废料。
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(1) }] },
      // 6 只：两只做谐振回路（各 100 pF 量级），四只做耦合与旁路。
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(6) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(2) }] },
      // 运放只出现在 10 kHz 的拍频放大上（见注释②）。
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      // 两层屏蔽盒：5 MHz 的泄漏会把差频拉成"两只一起漂"，差分就废了。
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(30) },
    steps: [
      {
        note_zh: '拆计数芯片两只平面管，焊 5 MHz 皮尔斯级（基极分压 + 发射极旁路 + 晶体在三极管基极回路）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '调谐与稳幅：两路的幅度调到相差 <5 %，否则混频出来的差频里带一个直流台阶',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装 10 kHz 拍频放大（运放 GBW 1 MHz / 10 kHz = 100 倍）与两级屏蔽盒',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '量差频带：0.5 kHz 起点、40 对之后 9.1 kHz —— 超出就说明配对的频差选错了',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.3 计数器：1.5 s / 3 s 双档闸门，0.67 / 0.33 Hz
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **门控计数器。**
     *
     *   计数芯片 3 + 齐纳 1 + 电容 4 + 铜线 0.1 + 钢片 0.5 → 计数器 1 件
     *
     * 三片串成 ÷10³：1 MHz → 1 kHz，这样闸门里数的是 kHz 级的数，
     * 而不是 MHz 级 —— **不是因为数不动，是因为机械计数器（显示）每秒只更新几次**。
     *
     *   闸门 1.5 s   一层 28 s 取 19 个点；两个相邻点之间只走 0.15 nm
     *   分辨 0.67 Hz  1/1.5 s —— 这是门控计数的硬底（δf = 1/T），不是器件不好
     *                 （另一档 3 s 给泛音探头用：0.33 Hz，见条目注释）
     *
     * ⚠️ 闸门为什么不是 10 s（0.1 Hz）：见文件头第二节③ —— 10 s 走过 1 nm 的料，
     * 读的是"1 nm 的平均"。**10 s 只在快门关着标速率时用**，
     * 而那时候它是好东西（0.1 Hz = 0.0017 nm）。同一个数，两个场合两个答案。
     */
    id: 'make/film-monitor-counter',
    name: 'In-Situ Film Thickness Monitor Gated Counter Manufacturing', name_zh: '原位膜厚监控仪门控计数器制造',
    produces: [
      {
        item: 'plant/film-monitor/counter',
        qty: q(1),
        gives: [
          { param: 'countRate', kind: 'range', min: 1000, max: 1000 },
          { param: 'gateTime', kind: 'range', min: 0, max: 3 },
          { param: 'resolution', kind: 'range', min: 0, max: 0.67 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(3) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(40) },
    steps: [
      {
        note_zh: '三级十进制链：1 MHz ÷ 10³ → 1 kHz（三片计数器串起来，进位端对接）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '做两档闸门 1.5 s / 3 s：100 kHz 晶振分频出门宽，闸门与计数器同步起停',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装齐纳基准与机械计数器显示（每秒更新 2–5 次，读得慢但不要发光材料）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '校闸门：用 1 kHz 的标准方波数 1.5 s，读数必须是 1 500 ±1 —— 差一个数就是闸门没对齐',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.4 光学头：488 nm，斜率法
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **光学头。**
     *
     *   玻璃 0.5 + 光电二极管 1 + 检流计 1 + 铝 0.05 + 氢氟酸 0.05 → 光学头 1 件
     *
     * 三个 props 是第四节那三行：
     *
     *   wavelength  488 nm   氩的线（`plant/stabilized-laser` 已在；He-Ne 632.8 本层没有）
     *   probeDepth  ≤ 22 nm  α = 4πk/λ = 0.0875 nm⁻¹ → 强度 1/e 深 11.4 nm，
     *                        只看最上面 ~3 对。**这是"局部"监视器，不是"绝对"基准。**
     *   noise       ≤ 0.1 %  δR/A。0.65 nm（极值）与 0.020 nm（斜率）都从这个数出来。
     *
     * 检流计振镜是这一件的关键：它把"等极值"换成"找过零"。极值处 dR/dd = 0，
     * 所以极值定位精度只能按二次项走（δd ∝ √δR，0.65 nm）；而 dR/dθ 在层界处
     * 过零，按一次项走（δd ∝ δR，0.020 nm）。**同一只光电管，差 32 倍。**
     *
     * 双孔光阑（φ0.5 与 φ2）是量"线性度"用的：换孔面积 ×16，读数也该 ×16；
     * 对不上就说明探测器的 1 s 积分里混进了本底（腔壁 300 K 的辐射）。
     */
    id: 'make/film-monitor-optical-head',
    name: 'In-Situ Film Thickness Monitor Optical Head Manufacturing', name_zh: '原位膜厚监控仪光学头制造',
    produces: [
      {
        item: 'plant/film-monitor/optical-head',
        qty: q(1),
        gives: [
          { param: 'wavelength', kind: 'range', min: 488, max: 488 },
          { param: 'probeDepth', kind: 'range', min: 0, max: 22 },
          { param: 'noise', kind: 'range', min: 0, max: 0.1 },
        ],
      },
    ],
    uses: [
      // 窗片与光阑基板：φ30 × 5 的平玻璃，浮法玻璃够（只看通光，不看面形）。
      { anyOf: [{ item: 'mat/glass', qty: q(1, 2) }] },
      { anyOf: [{ item: 'std/photodiode-general', qty: q(1) }] },
      // 检流计振镜：±2°、1 Hz 的角度抖振（绕光斑中心，不是扫场）。
      { anyOf: [{ item: 'std/galvanometer-general', qty: q(1) }] },
      // 光阑：0.05 mm 铝箔上腐蚀出 φ0.5 与 φ2 两个孔。
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(30) },
    steps: [
      {
        note_zh: '磨平玻璃窗片两面（面形不管，只要不散射；平行度 1′ 够）',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '铝箔光阑：光刻开两个孔（φ0.5、φ2）—— 本层光刻 5 µm，孔是 500 µm，绰绰有余',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '装光电二极管与 1 s 积分器：**1 s 是积分器的选择，不是器件的限制** —— 光电二极管本身是 µs 级，用 1 s 换的是信噪比（δR/A = 1e-3）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '装检流计振镜并标角度：±2°、1 Hz，用 1 µm 台量光斑位移（2×75 mm 臂长 = 5.2 mm）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '量线性度：双孔换着看，读数比必须是 16 ±0.16（1 %），否则 1 s 里混了本底',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.5 真空法兰
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **真空信号法兰（两件）。**
     *
     *   玻璃 0.3 + 铜 0.3 + 钢板 0.8 → 法兰 2 件
     *
     * 一件走同轴（差频与光电信号），一件走石英窗（488 nm 进出）。
     * 漏率 1×10⁻⁴ Pa·L/s 与镀膜腔同档 —— 腔的底线是 1 Pa 的罗茨机组，不是漏率。
     *
     * ⚠️ 唯一真要求是**不新增放气源**：密封圈只能用硅橡胶（本层没有氟橡胶），
     * 而硅橡胶在 150 °C 烘烤时放气比腔壁高一个量级。所以这两件**烘烤之后才装** ——
     * 这一句写在镀膜路线的工序里，不是写在这里的。
     */
    id: 'make/film-monitor-feedthrough',
    name: 'In-Situ Film Thickness Monitor Vacuum Signal Flange Manufacturing', name_zh: '原位膜厚监控仪真空信号法兰制造',
    produces: [
      {
        item: 'plant/film-monitor/feedthrough',
        qty: q(2),
        gives: [{ param: 'leakRate', kind: 'range', min: 0, max: 1e-4 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(4, 5) }] },
    ],
    needs: [],
    rate: { hours: q(16) },
    steps: [
      { note_zh: '车法兰盘与两道 O 圈槽（φ60，槽宽 3.5、深 2）', performedBy: 'lathe' },
      {
        note_zh: '封石英窗与同轴引线：低熔点玻璃粉 680 °C 熔封（可伐过渡本层没有，用铜-玻璃直接封；冷热循环 20 次不漏就算过）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 600, max: 800 }],
      },
      {
        note_zh: '检漏：保压 12 h 看回升（1×10⁻⁴ Pa·L/s 是焊缝与玻璃封接的量级）',
        performedBy: 'plant/robot',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.6 标定片：两把尺子，两个等级
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **标定片，第一把尺（普通干涉仪，15 nm）。**
     *
     *   硅片 1 + 氩 0.5 → 标定片 1（台阶 1 000 nm，读出误差 ≤15 nm = 1.5 %）
     *
     * 这就是 `make/euv-mirror-300` 现在花在标定上的那一笔 —— **同一个数**，
     * 所以这条路线本身不改进任何东西。它的用处是当"下限"：
     * 有它，镜子能造；没它，连 1.5 % 都没有。
     *
     * 1 µm 要镀 2.8 h（0.1 nm/s），加抽气、装夹、读数 = 4 h 一批。
     * 挡板遮一半，台阶边缘在 1 µm 台的定位下没有影响（台阶高度与边缘在哪无关）。
     */
    id: 'make/film-monitor-step-wafer',
    name: 'In-Situ Film Thickness Monitor Calibration Wafer Manufacturing', name_zh: '原位膜厚监控仪标定片制造',
    produces: [
      {
        item: 'plant/film-monitor/step-wafer',
        qty: q(1),
        gives: [
          { param: 'stepHeight', kind: 'range', min: 1000, max: 1000 },
          { param: 'stepError', kind: 'range', min: 0, max: 15 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 2) }] },
    ],
    needs: ['plant/interferometer', 'plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh: '镀 1 µm 钼：不锈钢挡板遮住半边，台阶边缘离片心 40 mm（挡板离片 2 mm，边缘 50 µm 过渡）',
        performedBy: 'plant/euv-coater',
        under: [
          { param: 'pressure', min: 0.1, max: 1 },
          { param: 'temperature', min: 100, max: 150 },
        ],
      },
      {
        note_zh: '干涉仪数台阶：1 µm = 3.4 级条纹，1/20 级 = **15 nm = 1.5 %**',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '硅片 1 片 + 氩 0.5 → 标定片 1 片；氩抽走，钼 0.4 g 落在片上（片按"片"计，不走 kg 账）。',
  },

  {
    /**
     * **标定片，第二把尺（λ/1000 干涉仪，0.52 nm）。**
     *
     *   硅片 1 + 氩 0.5 + 铝 0.01 → 标定片 1（台阶 1 000 nm，读出误差 ≤0.52 nm = **0.05 %**）
     *
     * 这一条是第五节那句"够不够"的答案：0.52/1 000 = 0.05 %，比要求的 0.43 %
     * 好 **8.6 倍**。同一个 1 µm 台阶，换一把尺子，1.5 % → 0.05 %。
     *
     * 怎么读：片子与 λ/1000 参考面组成 F-P 腔，两面都镀 100 nm 铝（R = 0.88），
     * 精细度 ℱ = π√R/(1−R) = 25，条纹半宽 1/25 级，人眼判到半宽的 1/10
     * → 光程 1.05 nm → 表面 **0.52 nm**（`ref-flat.ts` 第二节的算式，
     * 与 `null-test.ts` 独立复算的 0.47 nm 对得上）。
     *
     * ⚠️ 它读的不是"台阶有多高"，是"两片高原各自多平" —— 台阶高度是两者之差，
     * 而差值的误差仍然是那 0.52 nm（系统的，不是随机的）。所以这条路线的
     * `stepError` 写 0.52 而不是 0.52×√2：两个读数共用一个参考面，误差是共模的。
     */
    id: 'make/film-monitor-step-wafer-fp',
    name: 'In-Situ Film Thickness Monitor Calibration Wafer Manufacturing', name_zh: '原位膜厚监控仪标定片制造',
    produces: [
      {
        item: 'plant/film-monitor/step-wafer',
        qty: q(1),
        gives: [
          { param: 'stepHeight', kind: 'range', min: 1000, max: 1000 },
          { param: 'stepError', kind: 'range', min: 0, max: 0.52 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 2) }] },
      // F-P 的两面反射膜：参考面与片子各 100 nm 铝。
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 100) }] },
    ],
    needs: ['plant/ref-flat-interferometer', 'plant/phase-shifter', 'plant/metrology-room'],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh: '镀 1 µm 钼台阶（同普通那把尺的工序）',
        performedBy: 'plant/euv-coater',
        under: [
          { param: 'pressure', min: 0.1, max: 1 },
          { param: 'temperature', min: 100, max: 150 },
        ],
      },
      {
        note_zh: '镀 100 nm 铝（R = 0.88）—— 片子与参考面都要，才有多光束的 ℱ = 25',
        performedBy: 'plant/euv-coater',
        under: [
          { param: 'pressure', min: 0.1, max: 1 },
          { param: 'temperature', min: 20, max: 100 },
        ],
      },
      {
        note_zh: '八帧移相读数（`plant/phase-shifter` 石英压电堆走 λ/8）：两片高原各读 8 帧，台阶 = 两者之差，误差 ≤0.52 nm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '硅片 1 + 氩 0.5 + 铝 0.01 → 标定片 1；铝 0.004 kg 落在片上（两处 100 nm 膜）。',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.7 三条镀膜路线：同一条 std/euv-mirror-300，三个等级
  //
  // 这三条与 euv-mirror.ts 的 `make/euv-mirror-300` 并存（OR）。
  // 条目上只声明"period 可取 6–8 nm"，值由路线给 —— 这就是 props 那层机制。
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **主路线：QCM 定速率与逐层终点 + 光学每 9.3 对校一次绝对值。**
     *
     *   基板 1（figure ≤0.1）+ 氩 0.005 + 硅片 1（速率标定）→ 镜子 1
     *   gives: period 6.87–6.93（σ = 0.03 nm）· reflectivity 68.9–70 %
     *
     * 误差预算（一条一条都是前面算过的数，且**分清"每层的"与"整个周期的"**）：
     *
     *   层随机（随机项，按 √2 进周期）
     *     QCM 分辨：0.67 Hz ÷ 57.7 Hz/nm（5 MHz 基频、1.5 s 闸）  = 0.012 nm/层
     *   周期系统（整条路线只错一次，不按 √2）
     *     tooling 起始值：0.05 %（λ/1000 那把尺）× 6.9            = 0.0035 nm/周期
     *     密度随靶老化：3 % 本来是 0.207 nm/周期，**被光学每 9.3 对
     *       一次的 0.020 nm 校核变成"可测"**，残差 = 4.3 次校核
     *       各 0.020 nm 摊到 40 对                              = 0.002 nm/周期
     *   被消掉的（不再是误差）
     *     慢温漂：水 66 min 走 1 K → 0.72 Hz = 0.0125 nm **累积** → 0.0003 nm/周期
     *     快门响应 0.3 s：读到目标就关 + 按速率外推提前量        = 0
     *     ───────────────────────────────────────────────────────────
     *   周期 σ = √(0.012²×2 + 0.0035² + 0.002²) = **0.0177 nm**
     *   报 **6.87–6.93（±0.03）**，留 1.7 倍余量 —— 余量是给
     *   "溅射膜的密度在同一炉里前后不完全一样"这件还没量过的事。
     *
     * 对比现状（`make/euv-mirror-300` 的三笔：快门 0.030 + 标定 0.030 + 稳流 0.035
     * → 0.055 nm/层 → 周期 0.078）：**快门那 0.030 被 QCM 变成 0，
     * 标定那 0.030 被 λ/1000 变成 0.0017，稳流那 0.035 被闭环变成 0**。
     * 三笔一起清，才是这一件。只清一笔都不够。
     *
     * `figure` 仍然给 3 nm 而不是 0.1：膜厚分布 ±1 % 这件事没有变
     * （`euv-mirror.ts` 降级第 2 条），监控厚度不等于监控分布。
     */
    id: 'make/euv-mirror-300-monitored',
    name: 'EUV Multilayer Mirror Manufacturing', name_zh: 'EUV 多层膜反射镜制造',
    produces: [
      {
        item: 'std/euv-mirror-300',
        qty: q(1),
        gives: [
          { param: 'period', kind: 'range', min: 6.87, max: 6.93 },
          { param: 'pairs', kind: 'range', min: 40, max: 50 },
          { param: 'figure', kind: 'range', min: 0, max: 3 },
          { param: 'roughness', kind: 'range', min: 0, max: 0.3 },
          // 68.9 是 σ = 0.03 时代进那条式子算出的值；70 是 σ→0 的天花板。
          { param: 'reflectivity', kind: 'range', min: 68.9, max: 70 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'std/euv-substrate-300',
            qty: q(1),
            need: [
              { param: 'figure', kind: 'range', max: 0.1, dir: 'atMost' },
              { param: 'roughness', kind: 'range', max: 0.5, dir: 'atMost' },
            ],
            // 基板面形不够，40 个界面就不同相 —— 反射率掉到单界面水平。
            // 这是"换了一个东西"，不是"差一点"。
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 200) }] },
      // 速率标定用的硅片：与 euv-mirror.ts 同一个数（一片只用一次）。
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
    ],
    needs: ['plant/film-monitor', 'plant/clean-room', 'plant/metrology-room', 'plant/interferometer'],
    // 8.5 h：66 min 溅射 + 5.4 h 抽气烘烤冷却 + **0.5 h 装探头、标 tooling factor**
    rate: { hours: q(17, 2) },
    steps: [
      {
        note_zh: '装双晶探头与光学头：晶片面与基底同高 ±0.5 mm（差 0.5 mm 就是 2 % 的 tooling 差）；'
          + '法兰在烘烤之后才装（硅橡胶放气）',
        performedBy: 'plant/robot',
        // 晶片在 20 °C：由 film-monitor 的水冷板维持，与腔壁 100–150 °C 无关。
        under: [{ param: 'temperature', min: 19.5, max: 20.5 }],
      },
      {
        note_zh: '抽气 + 氩冲洗五轮（氧分压 2×10⁻⁶ Pa，工作气压的 7 ppm）',
        performedBy: 'plant/euv-coater',
        under: [{ param: 'pressure', min: 1, max: 10 }],
      },
      {
        note_zh: '烘烤除气：腔壁 150 °C × 4 h（**探头这时候还不在腔里** —— 硅橡胶与晶片都怕烤）',
        performedBy: 'plant/euv-coater',
        under: [{ param: 'temperature', min: 100, max: 200 }],
      },
      {
        note_zh: '标 tooling factor：标定片 1 µm 台阶（λ/1000 读出 0.52 nm）÷ QCM 的质量读数',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '点火 → 等 60 s 晶片温度稳下来 → 开快门（热载阶跃不进差分，见文件头第三节⚠️）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '镀 40 对：QCM 每 1.5 s 一次读数（0.67 Hz = 0.012 nm），'
          + '快门按"当前 + 速率×预测提前量"关断 —— 提前量吃掉 0.3 s 的响应与 1.5 s 的滞后',
        performedBy: 'plant/euv-coater',
        under: [
          { param: 'pressure', min: 0.1, max: 1 },
          { param: 'temperature', min: 100, max: 150 },
        ],
      },
      {
        note_zh: '每 9.3 对做一次光学校核（488 nm 相位斜率，0.020 nm）：'
          + '**它不看极值，它看 dR/dθ 的过零点** —— 极值在一层里根本没有',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '冷却出炉 ≤50 °C/h（Mo 5.0、Si 2.6、石英 0.55 ppm/K，冷快了膜会裂）',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '基板 1 件（3 kg）+ 氩 0.005 kg + 硅片 1 片 → 镜子 1 件；氩全部抽走，'
      + '钼 82 mg + 硅 120 mg 落在 707 cm² 上（膜重 0.4 mg 级，不进质量账）。',
  },

  {
    /**
     * **降级①：只有 QCM（1 MHz 片子跑泛音，11.5 Hz/nm）。**
     *
     *   gives: period 6.85–6.95（σ ≈ 0.05）· reflectivity 66.5–68 %
     *
     * 少了什么：光学那一路。预算变成两笔，**都是它自己的**：
     *
     *   层随机    QCM 分辨：0.33 Hz（3 s 闸）÷ 11.5 Hz/nm      = 0.029 nm/层
     *   周期系统  密度随靶老化：**没有人校**。速率在 66 min 里漂 2 %
     *             （`euv-mirror.ts` 的数），密度按它的一半 0.5 % 算
     *             = **0.035 nm/周期**；标定片只钉得住开头那一点，钉不住中途
     *   ───────────────────────────────────────────────────────────
     *   周期 σ = √(0.029²×2 + 0.035²) = **0.054 nm** → 报 ±0.05
     *
     * 所以这条路线给 0.05 而不是 0.03：**差的那 0.02 nm 就是光学那一路**
     * （它把 0.035 的系统项压到 0.002）。
     *
     * 但它仍然值钱：0.078 → 0.05 就是 **2.0 倍**（0.97 % → 1.96 % 的 10 面通量），
     * 而这是文件头第一节说的"收益的大头在第一步"。
     * **5 MHz 晶片路线已补（`make/quartz-resonator-5mhz`）；在它稳定供货前，
     * 这条路线仍是本层的保底答案。**
     *
     * 升级：补上 `plant/film-monitor/optical-head`（一条零件路线已在本文件里），
     * 加 0.5 h 装调 —— 缺口 0.05 → 0.03，**1.7 倍**。
     */
    id: 'make/euv-mirror-300-qcm',
    name: 'EUV Multilayer Mirror Manufacturing', name_zh: 'EUV 多层膜反射镜制造',
    produces: [
      {
        item: 'std/euv-mirror-300',
        qty: q(1),
        gives: [
          { param: 'period', kind: 'range', min: 6.85, max: 6.95 },
          { param: 'pairs', kind: 'range', min: 40, max: 50 },
          { param: 'figure', kind: 'range', min: 0, max: 3 },
          { param: 'roughness', kind: 'range', min: 0, max: 0.3 },
          { param: 'reflectivity', kind: 'range', min: 66.5, max: 68 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'std/euv-substrate-300',
            qty: q(1),
            need: [
              { param: 'figure', kind: 'range', max: 0.1, dir: 'atMost' },
              { param: 'roughness', kind: 'range', max: 0.5, dir: 'atMost' },
            ],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
    ],
    needs: ['plant/film-monitor', 'plant/clean-room', 'plant/metrology-room', 'plant/interferometer'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh: '装双晶探头（只装探头，不装光学头）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19.5, max: 20.5 }],
      },
      {
        note_zh: '抽气 + 氩冲洗五轮 → 烘烤 150 °C × 4 h',
        performedBy: 'plant/euv-coater',
        under: [{ param: 'pressure', min: 1, max: 10 }],
      },
      {
        note_zh: '标 tooling factor（标定片 1 µm 台阶，λ/1000 干涉仪）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '镀 40 对：QCM 3 s 一次读数（0.33 Hz / 11.5 Hz/nm = 0.029 nm），'
          + '**泛音峰的锁频比基频脆**，功率稍大就跳到相邻的峰 —— 稳流要更死',
        performedBy: 'plant/euv-coater',
        under: [
          { param: 'pressure', min: 0.1, max: 1 },
          { param: 'temperature', min: 100, max: 150 },
        ],
      },
      {
        note_zh: '冷却出炉 ≤50 °C/h，然后只能"外观检查"——**反射率没有量具**（13.5 nm 的光不存在）',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '基板 1 + 氩 0.005 + 硅片 1 → 镜子 1；与主路线同一笔账，少的只是那 0.5 h 装光学头。',
  },

  {
    /**
     * **降级②：只有光学（488 nm 斜率法）。**
     *
     *   gives: period 6.83–6.97（σ ≈ 0.07）· reflectivity 64 %
     *
     * 少了什么：QCM 的逐层反馈。于是每层的厚度还回到"定时 + 快门 + 镀前标定"
     * —— 也就是 `make/euv-mirror-300` 那三笔（0.055 nm/层 → 周期 0.078）。
     * 光学那一路只把**累积**锚住（每 9.3 对 0.020 nm），锚不住层间的随机。
     *
     * 所以它的 period 窗口几乎不动（6.83–6.97 对 6.8–7.0），反射率也只有 64 %：
     * **它治的是跨批系统漂移，不治这一批的层间随机。** 这一句是这条路线
     * 存在的全部意义 —— 它证明了"光学单独不够"不是一句偏好，是一个数。
     *
     * 升级：补 QCM。缺口 0.07 → 0.03，**2.3 倍**；
     * 或者只补到"泛音版 QCM" 0.07 → 0.05，**1.4 倍**（那条更便宜，见上一条）。
     */
    id: 'make/euv-mirror-300-optic',
    name: 'EUV Multilayer Mirror Manufacturing', name_zh: 'EUV 多层膜反射镜制造',
    produces: [
      {
        item: 'std/euv-mirror-300',
        qty: q(1),
        gives: [
          { param: 'period', kind: 'range', min: 6.83, max: 6.97 },
          { param: 'pairs', kind: 'range', min: 40, max: 50 },
          { param: 'figure', kind: 'range', min: 0, max: 3 },
          { param: 'roughness', kind: 'range', min: 0, max: 0.3 },
          { param: 'reflectivity', kind: 'range', min: 63, max: 65 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'std/euv-substrate-300',
            qty: q(1),
            need: [
              { param: 'figure', kind: 'range', max: 0.1, dir: 'atMost' },
              { param: 'roughness', kind: 'range', max: 0.5, dir: 'atMost' },
            ],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
    ],
    needs: ['plant/film-monitor', 'plant/stabilized-laser', 'plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh: '装光学头（只装光学头）：60° 斜入射，光斑落在片子中心 40 mm 内',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19.5, max: 20.5 }],
      },
      {
        note_zh: '抽气 + 氩冲洗五轮 → 烘烤 150 °C × 4 h',
        performedBy: 'plant/euv-coater',
        under: [{ param: 'pressure', min: 1, max: 10 }],
      },
      {
        note_zh: '定 n(488)：标定片 1 µm 台阶上光学相位走完 **15.6 个周期**（1 000/64.3）—— 这一步定的是 n·d 里的 n；没有它，光学读数只是一个相对值',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '镀 40 对：**按时间切层**（0.1 nm/s 算 28 s / 41 s），'
          + '光学每 9.3 对读一次 dR/dθ 过零，看累计偏了多少 —— 偏了就改后面的速率，改不了前面',
        performedBy: 'plant/euv-coater',
        under: [
          { param: 'pressure', min: 0.1, max: 1 },
          { param: 'temperature', min: 100, max: 150 },
        ],
      },
      {
        note_zh: '冷却出炉 ≤50 °C/h',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh: '基板 1 + 氩 0.005 + 硅片 1 → 镜子 1；这一条没有闭环，膜重与主路线相同。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...FILM_MONITOR_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/film-monitor',
    name: 'In-Situ Film Thickness Monitor Assembly', name_zh: '原位膜厚监控仪装配',
    produces: [{
      item: 'plant/film-monitor',
      qty: q(1),
      gives: [
      { param: 'thicknessError', kind: 'range', min: 0, max: 100, dir: 'atMost' },
      { param: 'sampleInterval', kind: 'range', min: 0, max: 100, dir: 'atMost' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...FILM_MONITOR_ROUTES, ...ASSEMBLY_ROUTES];
