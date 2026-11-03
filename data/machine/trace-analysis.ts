/**
 * 痕量分析链 —— 把 TCS 与 NH₃ 的 ppb 级纯度变成可测。
 *
 * ⚠️ **分工（R13）**：本文件只放**机器 / 零件 / 材料 / 标液**（30 条目 / 32 路线）。
 * 测量与记录已移到 `data/measure/trace-analysis.ts`（R13：`measure/*` 与
 * `*-record` 只放 data/measure/）：2 条测量路线 + 2 个记录条目，id 与窗口未改。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、这一份要解的开环（三处原文，本轮 grep）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   si3n4-lpcvd.ts:109   「B/P 的 ppb 级分析没有：本层没有 ICP-MS/GC-MS；
 *                         `plant/sims` 只能测固体膜，检出限 0.6–10 ppm，差 2–4 个量级」
 *   si3n4-lpcvd.ts:437   「TCS 的纯度 99.9999 %、B/P ≤0.1 ppb 是设计值」
 *   measure/metrology.ts:355 「要四极质谱 / FTIR 气体池 / ICP-MS，三样都没有」
 *
 * 差多少（都按 1 s 计数、3σ 计）：
 *
 *   SIMS           0.6–10 ppm      对 TCS 的 B/P ≤0.1 ppb：差 **6 000–100 000 倍**
 *   ICP-MS（本件） 0.02–5 ppb      对 TCS 的金属 ≤1 ppb：12/20 元素**够**（5–50 倍余量），
 *                                  8/20 只够判超标（差 2–20 倍，§八 缺口④）
 *                  1–10 ppb        对 B/P ≤0.1 ppb：还差 **10–100 倍**（见 §八 缺口）
 *   GC-MS（本件）  0.1–1 ppm       对 NH₃ 的 99.999 %（≤10 ppm 杂质）：**够**
 *
 * 所以这一份**不写「闭合」**：它把「2–4 个量级」缩到「B 30–100 倍、P 10–40 倍」，
 * 剩下的差数逐条写进 §八。R7：缺口按量级记录，不作为终止条件；R12：窗口由
 * `measure/*` 收窄并产出记录，记录条目里的是这台仪器的**能力窗口**，不是某次读数。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、复用表（先 grep 再建；能复用的不重造）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ┌──────────────────────────────┬──────────────────┬──────────┬─────────────────────────────┐
 * │ 复用件（既有 id）             │ 原来给谁          │ 这一份   │ 为什么能复用                │
 * ├──────────────────────────────┼──────────────────┼──────────┼─────────────────────────────┤
 * │ plant/sims/quadrupole        │ SIMS             │ ICP+GC   │ 200 mm 圆杆、r0 4 mm、2.26 MHz、│
 * │                              │                  │          │ 1–300 u、R 100–400、传输 3–10 % │
 * │ plant/sims/rf-driver         │ SIMS             │ ICP+GC   │ 2.26 MHz = 13.56/6、1.8–2.2 kV、│
 * │                              │                  │          │ V/U 稳定度 1e-4                  │
 * │ plant/sims/electron-multiplier│ SIMS            │ ICP+GC   │ 16 级铝打拿极、1e6–1e7、暗 0.5/s│
 * │ plant/sims/faraday-cup       │ SIMS             │ ICP      │ 大信号那一路（≥1e6 cps）        │
 * │ euv-vacuum/pump/rough        │ EUV 真空         │ ICP+GC   │ 水环 + 两级罗茨 → 1 Pa          │
 * │ euv-vacuum/pump/turbo        │ EUV 真空         │ ICP+GC   │ φ250、20 级、2.4 万转、1000 L/s │
 * │ euv-vacuum/pump/cold-trap    │ EUV 真空         │ ICP+GC   │ 挡水汽与返油                    │
 * │ euv-vacuum/pump/gauge        │ EUV 真空         │ ICP+GC   │ 皮拉尼 0.1–100 Pa + 热偶 1–100 Pa│
 * │ plant/rf-13m56               │ 13.56 MHz 源     │ ICP      │ 27.12 = 2 × 13.56（倍频）       │
 * │ plant/mfc                    │ 气路             │ GC       │ 0–200 sccm，载气 1 mL/min=60 sccm│
 * │ plant/micro-balance          │ 称量             │ 标液+GC  │ 0.05–0.1 µg 可读                │
 * │ plant/clean-room             │ 洁净             │ 全部     │ ISO 5–7（`measure/cleanroom-class`）│
 * │ plant/metrology-room         │ 19–21 °C         │ 全部     │ 质量轴与柱温的 1 K 基准          │
 * └──────────────────────────────┴──────────────────┴──────────┴─────────────────────────────┘
 *
 * ⚠️ 三台新机器（`plant/icp-ms` / `plant/gc-ms` / `plant/sub-boiling-still`）**不进
 * 任何零件路线的 `needs`** —— 与 `sims.ts:225` 同一条规矩（自己装自己是本轮被点名
 * 二十多次的错）。它们只出现在自己的装配路线（`make/*`）与量测/提纯路线的
 * `performedBy` 里。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、ICP-MS：六个必须咬在一起的数
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── ① 等离子体：27.12 MHz、1.0–1.6 kW ───────────────────────────────────────
 *
 * 本层唯一的频率源是 `plant/rf-13m56`（5–30 MHz、0–2 kW）。27.12 = **2 × 13.56**，
 * 用推挽二倍频（两只 6P45S 之类的束射管，栅极反相激励）从同一只晶振取；
 * 倍频后功率取 1.0–1.6 kW（匹配网络损失 15–25 %）。
 *
 *   Ar 13–15 L/min 等离子气 + 0.8–1.0 辅助 + 0.9–1.1 雾化 = **15–17 L/min**
 *   一次测量 25 min（含调谐余量）⇒ 375–425 L × 1.784 g/L = **0.67–0.76 kg Ar**
 *
 * 为什么不选 40.68 MHz（工业上另一档）：40.68 = 3 × 13.56，也能倍频，但 40.68 的
 * 趋肤深度更浅、炬管要重做（18 mm 石英管在 40 MHz 上等离子体偏细，采样锥要往前
 * 挪 2 mm），本层没有第二根炬管的手艺。27.12 与 13.56 共用一半的匹配元件。
 *
 * ── ② 进样：蠕动泵 0.4 mL/min + 同心雾化器 + 双通道雾化室 ─────────────────
 *
 *   蠕动泵 0.1–2.5 mL/min（12 滚轮，±1–2 %），工作点 0.4 mL/min
 *   雾化气 Ar 0.9–1.1 L/min，气溶胶 D50 = **2–5 µm**（同心雾化器的经验值）
 *   雾化室 **不冷却**（本层没有 −5 °C 冷机、没有 Peltier 的 Bi₂Te₃）：
 *   20 °C 下传输效率 **2–3.5 %**（冷到 2 °C 是 3–5 %），溶剂负荷高 1.5–2 倍
 *   ⇒ 氧化物比（LaO/La）比冷雾化室高 **0.5 个百分点**，这一笔记在 §八 缺口 ⑩
 *
 * ── ③ 接口：1 atm → 200 Pa → 0.1 Pa → 1e-4 Pa ─────────────────────────────
 *
 *   采样锥 Ni φ1.0 mm、60° 锥、厚 1.0 mm；截取锥 Ni φ0.6 mm，距离 **7 mm**
 *   1 atm 的 Ar 经 φ1.0 孔绝热膨胀到 200 Pa：膨胀比 500，马赫盘在 5–8 mm
 *   ⇒ 截取锥必须落在马赫盘之后的**亚声速区**，这就是 7 mm 的来历（也是为什么
 *   采样锥孔磨大 0.1 mm，信号涨 20 % 而氧化物比涨 0.3 个百分点）
 *
 *   三级压力与泵：膨胀腔 100–300 Pa（粗抽 8–15 L/s）· 中间腔 0.05–0.2 Pa（涡轮 1）
 *   · 分析腔 1e-4–1e-3 Pa（涡轮 2）。本层只有 φ250/1000 L/s 的涡轮（EUV 那台），
 *   对 ICP-MS 是 **2–3 倍余量**（真实 ICP-MS 用 300–500 L/s）—— 余量不花钱，只多
 *   占地方，所以直接复用。
 *
 * ── ④ 四极杆：复用 SIMS 的杆，只换「工作点」 ──────────────────────────────
 *
 *   `plant/sims/quadrupole` 的 200 mm 杆在 2.26 MHz 上：N = f·L/v，v = √(2E/m)
 *
 *     E = 3 eV（ICP-MS 的离子轴向能量）、m = 260 u：v = 1492 m/s ⇒ N = 363
 *       ⇒ 理想 R = N²/20 = 6600，交付按 **400** 记（杆偏心、边缘场、能量散）
 *     m/z 2：v = 17 012 m/s ⇒ N = 31.9 ⇒ R = 51，峰宽 2/51 = **0.04 u**
 *
 *   **四极杆的峰宽在 u 上是常数**（R ∝ m），所以「2–260 u、0.7–1.0 u 峰宽」不是
 *   两档指标，是**同一个工作点**：把 R 调到 m/0.85。本机交付 0.7–1.0 u（质量歧视
 *   造成两端差 0.3 u），比 SIMS 的「R = 100 @ m/z 30 = 0.3 u」更宽 —— 宽是为了
 *   **灵敏度**（GC-MS 与 ICP-MS 都要峰顶平，不是要窄）。
 *   质量范围上限：V = 5.90 V/u × 260 = **1534 V(0-p)**，而驱动器的窗口是
 *   1800–2200 V ⇒ 300 u 也在窗口内（SIMS 的 `massRange 1–300` 就是这条的上界）。
 *
 * ── ⑤ 碰撞/反应池：只有 H₂，没有 He ────────────────────────────────────────
 *
 * 1 u 峰宽下，四极杆分不开的干扰（Δm 全部 < 0.04 u，R = m/Δm 要 1400–2800）：
 *
 *   ┌────────┬──────────────────┬─────────┬──────────────────────────────────┐
 *   │ 分析物 │ 干扰             │ Δm (u)  │ H₂ 池之后                        │
 *   ├────────┼──────────────────┼─────────┼──────────────────────────────────┤
 *   │ ⁵⁶Fe   │ ⁴⁰Ar¹⁶O          │ 0.022   │ 降 10–50× ⇒ DL 1–10 ppb          │
 *   │ ⁷⁵As   │ ⁴⁰Ar³⁵Cl         │ 0.010   │ 降 10–50× ⇒ DL 1–10 ppb          │
 *   │ ⁵¹V    │ ³⁵Cl¹⁶O          │ 0.020   │ 降 10–50× ⇒ DL 1–10 ppb          │
 *   │ ⁸⁰Se   │ ⁴⁰Ar⁴⁰Ar         │ 0.008   │ 降 10–30× + ⁷⁸/⁸²Se 校正          │
 *   │ ⁴⁰Ca   │ ⁴⁰Ar             │ 0.000   │ 降 10–30× ⇒ DL 10–100 ppb        │
 *   │ ³⁹K    │ ³⁸Ar¹H           │ 0.006   │ 降 10–50× ⇒ DL 1–10 ppb          │
 *   │ ³¹P    │ ¹⁴N¹⁶O¹H         │ 0.032   │ 降 10–100× ⇒ 溶液 0.5–2 ppb      │
 *   │ ²⁸Si   │ ¹²C¹⁶O / ¹⁴N₂    │ 0.018 / 0.029 │ 降 10× ⇒ DL 10–50 ppb     │
 *   │ ²⁶Mg   │ ¹²C¹⁴N           │ 0.021   │ 降 10–30×                        │
 *   └────────┴──────────────────┴─────────┴──────────────────────────────────┘
 *
 * ⚠️ 表里的 Ca/K/Si **没有标液**（本层没有纯钙、纯钾条目）—— 20 个元素的表里没有它们，
 * 列在这里只因为干扰机理是同一份。
 *
 * **H₂ 不是 He 的等价物**：He 是「碰撞阻尼」把干扰离子的动能差放大，降 1000×；
 * H₂ 是「电荷转移/解离」，只降 10–100×。所以上表里 Fe/As/Se/Ca 的 DL 是 ppb 级，
 * 不是 ppt 级 —— 这就是为什么「20 个元素」里 8 个（Cu/Zn/Fe/Ni/Al/Mg/As/Se）只能报
 * 0.5–10 ppb，其余 12 个 0.01–0.5 ppb（§八 缺口 ④）。
 *
 * ── ⑥ 检出限：三笔账，最后一笔是空白 ──────────────────────────────────────
 *
 *   LOD = 3σ_空白 / S，S = 2×10⁵–10⁶ cps/ppb（轴向观测、1.4 kW、0.4 mL/min）
 *
 *   计数账：B = 1–10 cps、t = 10 s ⇒ 3√(B/t)/S = **0.03–1 ppt**（可忽略）
 *   空白账（真空瓶 + 亚沸酸 + PTFE 器皿，10 次）：
 *       洁净 9 元素（Ag/Au/Pb/Sn/In/Ga/Ge/La/Ba） σ = 2–10 ppt ⇒ 溶液 **0.01–0.1 ppb**
 *       中间 3 元素（Ti/Mo/W）                       σ = 0.02–0.2 ppb ⇒ 溶液 **0.02–0.2 ppb**
 *       沾污 4 元素（Cu/Zn/Ni/Al）                   σ = 0.1–0.5 ppb ⇒ 溶液 **0.1–0.5 ppb**
 *       干扰 4 元素（Fe/As/Se/Mg）                   σ = 0.1–1 ppb ⇒ 溶液 **0.1–1 ppb**
 *       P（³¹P 的 NOH⁺ 尾巴，H₂ 池压 10–100× 之后）  ⇒ 溶液 **0.5–2 ppb**
 *       B（PTFE 记忆 + 硅基体）                      ⇒ 溶液 **0.3–1 ppb**
 *
 *   样品账：常规 1 g/5 mL（**×5**）· 基体消除 1 g/2 mL（**×2**）· B 1 g/10 mL（**×10**）
 *
 *   ⇒ 常规档 0.05–5 ppb（洁净 0.05–0.5、沾污/干扰 0.5–5）；
 *     基体消除档 0.02–2 ppb（20 个金属）；P 1–4 ppb；B 3–10 ppb。
 *
 * ⚠️ 对 TCS 的「金属 ≤1 ppb」：**12/20 元素有余量**（0.02–0.2 ppb ⇒ 5–50×），
 *    8/20（Cu/Zn/Ni/Al/Fe/Mg/As/Se）只到 0.2–2 ppb ⇒ **判超标够、判合格差 2–20×**
 *    （10σ 定量限 2–20 ppb）。这一条写进 §八 缺口 ④，不许当成「金属全测得了」。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、GC-MS：没有氦，载气是氢
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── ① 为什么没有氦（带数） ──────────────────────────────────────────────────
 *
 *   火星大气 He = **2.5–7 ppm**（Curiosity/SAM 与 MAVEN 的量级）
 *   1 m³ 空气 = 44.6 mol ⇒ He 2.2×10⁻⁴ mol = **0.9 mg** ⇒ **1 kg He 要 1.1×10⁶ m³ 空气**
 *   分离要 20 K（He 沸点 4.2 K），而本层最冷的设备是液氮冷阱 **−196 °C = 77 K**
 *   ⇒ 差 57 K，不是「效率低」，是**没有那条制冷链**（缺口 ③）
 *
 *   改用 H₂（`mat/hydrogen`，电解水，1 kg 只要 9 m³ 水）：
 *   H₂ 的最佳线速度 40–60 cm/s（He 是 25–35），柱效高 10–20 %，但**分析快 30–40 %**；
 *   代价三条：① H₂ 与空气 4–75 % 爆炸，柱箱 300 °C 要有通风与探测（缺口 ⑧）；
 *   ② H₂ 载气下 H₂ 杂质本身测不了（载气本底）；③ 高沸点组分在 H₂ 里扩散快，
 *   柱末端要 1.5–2 倍载气流速吹扫。
 *
 * ── ② 柱、进样、电离 ───────────────────────────────────────────────────────
 *
 *   柱：30 m × φ0.25 mm × 0.25 µm 甲基硅氧烷（OV-1/DB-1 等价，从
 *       `mat/methyl-trichlorosilane` 水解 + 缩聚 + 交联做，见 `make/gc-ms-column`）
 *       3000 板/m ⇒ **9×10⁴ 板**；H₂ 1.0 mL/min（60 sccm，`plant/mfc` 覆盖 0–200）
 *   进样：1 µL、分流 1:10（0.1 µL 上柱）、进样口 250 °C；气体样走 1 mL 定量环
 *   程序升温：40 °C (3 min) → 10 °C/min → 300 °C (10 min)，**39 min/样**
 *   EI：70 eV、50 µA、源 250 °C、传输线 280 °C
 *   四极杆：复用 `plant/sims/quadrupole`（10–300 u，峰宽 0.3 u 最小，工作 0.7–1.0）
 *   检测器：复用 `plant/sims/electron-multiplier`（1e6–1e7）
 *
 * ── ③ 检出限 ───────────────────────────────────────────────────────────────
 *
 *   SIM（目标物 20 个，每个 3–5 个特征离子、驻留 50 ms）：**0.1–1 ppm**
 *   全扫描（10–300 u、5 扫/s）：1–10 ppm
 *   ⇒ 记录交 0.1–1 ppm；NH₃ 的气体样过活性炭管（1 L → 热脱附 1 mL，富集 500–800×）
 *     能把 0.1–1 ppm 再往下推 2 个量级，但**只对 C2–C8**（活性炭的脱附温度
 *     300–350 °C，高沸点会分解 —— 缺口 ⑦）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、亚沸蒸馏：酸里的金属怎么下去
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   亚沸（sub-boiling）= 把酸加热到**沸点以下** 20–60 °C，只有蒸气过去：
 *   金属盐不挥发、留在残液里；酸的蒸气在冷凝柱上回流，把雾滴带回去。
 *
 *   HNO₃ 65 % 沸点 121 °C ⇒ 工作点 **60–90 °C**
 *   HCl 37 % 沸点 48 °C（发烟）⇒ 工作点 **40–60 °C**（高于 60 会把 HCl 赶光）
 *
 *   净化倍数：工业酸里的 Fe/Ca/Na 0.1–1 ppm，亚沸馏出液 **10–50 ppt** ⇒
 *   **2 000–100 000 倍**。机理不是「蒸馏」，是「金属盐的蒸气压≈0」：只有雾滴夹带
 *   带得过去，回流比 5–10:1 把夹带压到 0.001–0.05 %。
 *
 *   材质：本层只有 `mat/ptfe`（PTFE），**没有 PFA**。PTFE 的微孔隙与不透明
 *   让硼的记忆效应比 PFA 差 **2–5 倍**（缺口 ⑪ 的一部分）。
 *   一次装 1.5–2 L、200–500 mL/天（`plant/sub-boiling-still` 的 throughput）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、标液：22 个单元素 + 调谐液 + GC-MS 五点标
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `mat/icp-single-element-standard` 的 anyOf 有 **22 个纯元素/纯氧化物**：
 *   16 个纯金属 Cu/Zn/Fe/Ni/Al/Mg/Ti/Ag/Au/Pb/Sn/In/Ga/Ge/As/Se
 *   ＋ 2 个粉末 Mo/W（氢还原，金属态）
 *   ＋ P（白磷）、B（B₂O₃）—— 这两样没有金属态条目
 *   ＋ La（La₂O₃）、Ba（BaCO₃）—— 调谐与稀土杂质共用
 * ⇒ `elementCount` 交 **20–22**（Si 不算：基体就是硅，且 ²⁸Si 被 ¹²C¹⁶O/¹⁴N₂ 压住）
 *
 * 不确定度分解（0.1 g 金属 / 100 mL = 1000 µg/mL）：
 *   称量 ±0.1 mg / 0.1 g = **0.1 %**（`plant/micro-balance` 0.05–0.1 µg 可读）
 *   金属纯度证书 99.99–99.999 % ⇒ **0.001–0.01 %**
 *   100 mL 容量瓶 ±0.1 mL ⇒ **0.1 %**
 *   两次稀释 ±0.2 % ⇒ RSS = **0.3–0.5 %**，保守交 0.5–1.5 %
 *   ⚠️ As（99.5 %）与 Se（90–99.9 %）的单质纯度不够：这两种的标液 **5–10 %**，
 *      只能半定量（缺口 ⑫）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、条目与路线的口径
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   · 每个条目都有 `props`，每条产出路线都逐项写 `gives`（`prop_missing_gives` 会核）；
 *   · 机器设备都写 `holds`：ICP-MS 两个压力窗口（炬箱 1 atm / 四极杆 1e-5–1e-3 Pa），
 *     GC-MS 三个（柱温 40–350 °C、进样口 0.9–1.6 bar、分析腔 1e-4–1e-3 Pa）；
 *   · 装配路线里**不写与自身 holds 重叠的压力条件**：`make/icp-ms` 的检漏写
 *     1e-2–1e-1 Pa（借 `plant/euv-vacuum`），不写 1e-4 Pa —— 后者会触发
 *     `condition_cycle`（造它的路线又需要同一个条件）。这是模型的一处已知边界，
 *     不是设备不行；真正的 1e-4 Pa 调谐写在路线注释里。
 *   · `unbalanced_zh` 只有两条酸路线会被判据用到（kg 进 kg 出）；零件与标液的
 *     `unbalanced_zh` 只是「按件计」的说明，不触发 `unbalanced`。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 七、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本文件只交**机器 / 零件 / 材料 / 标液**。测量路线与记录条目**已经搬到
 * `data/measure/trace-analysis.ts`**（R13：`measure/*` 与 `*-record` 只放
 * data/measure/），导出名 `TRACE_ANALYSIS_MEASURE_ITEMS` /
 * `TRACE_ANALYSIS_MEASURE_ROUTES`。两处注册：
 *
 *   import { TRACE_ANALYSIS_ITEMS, TRACE_ANALYSIS_ROUTES }
 *     from '../../data/machine/trace-analysis.ts';
 *   import { TRACE_ANALYSIS_MEASURE_ITEMS, TRACE_ANALYSIS_MEASURE_ROUTES }
 *     from '../../data/measure/trace-analysis.ts';
 *
 * 两边在**同一次 data 装配**里注册，所以记录条目（`mat/icpms-trace-metals-record`、
 * `mat/gcms-volatile-organic-record`）虽然定义在 measure 文件里，引用它们的
 * id 照旧解析得到 —— 数据层只引 id，没有跨文件 import。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 八、缺口表（全部带数；R7：按量级记录，不作为终止条件）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ┌──┬──────────────────────────────┬─────────────────────────┬────────────────────────────────┐
 *  │# │ 缺口                         │ 差多少                  │ 升级路线（R8）                 │
 *  ├──┼──────────────────────────────┼─────────────────────────┼────────────────────────────────┤
 *  │① │ B ≤0.1 ppb（TCS 判据）       │ 本机 3–10 ppb ⇒ 30–100× │ B 专用螯合树脂（IRA-743 一类，│
 *  │  │                              │                         │ 无条目）；或 HR-ICP-MS 磁扇    │
 *  ├──┼──────────────────────────────┼─────────────────────────┼────────────────────────────────┤
 *  │② │ P ≤0.1 ppb（TCS 判据）       │ 本机 1–4 ppb ⇒ 10–40×   │ 30 s 积分 → 0.5–2 ppb（5–20×）│
 *  │  │                              │                         │ ＋He 碰撞（缺口③）             │
 *  ├──┼──────────────────────────────┼─────────────────────────┼────────────────────────────────┤
 *  │③ │ 没有氦（载气与碰撞气）       │ 1 kg He 要 1.1e6 m³ 空气│ 20 K 制冷链（本层 77 K 到底）  │
 *  │  │                              │ 本层最冷 77 K           │                                │
 *  ├──┼──────────────────────────────┼─────────────────────────┼────────────────────────────────┤
 *  │④ │ 只有 H₂ 碰撞池               │ Fe/As/Se 只降 10–50× ⇒  │ 缺 He（同③）；或用 ¹⁶O/³⁴S 的  │
 *  │  │ ＋8/20 元素空白高            │ 0.2–2 ppb；判「≤1 ppb」 │ 同位素稀释法（要同位素富集）   │
 *  │  │                              │ 合格差 2–20×（10σ 定量限）│                              │
 *  ├──┼──────────────────────────────┼─────────────────────────┼────────────────────────────────┤
 *  │⑤ │ NH₃ 的 6 项杂质只证 2 项     │ 金属 0.01–10 ppb ✓、    │ H₂O：冷镜先被 −33 °C 的 NH₃ 淹│
 *  │  │                              │ 有机物 0.1–1 ppm ✓；    │ 掉（10 ppm 水的霜点 −60 °C）⇒ │
 *  │  │                              │ H₂O/CO₂/CO/N₂/H₂ 无路线 │ 要 FTIR 气体池（缺）；O₂：氧  │
 *  │  │                              │ （4 项，占预算 10 ppm 的 │ 探针 700 °C 下 NH₃ 全分解 ⇒ 缺│
 *  │  │                              │ 5–17 ppm）              │ 一台耐氨的 O₂ 池（0 台）       │
 *  ├──┼──────────────────────────────┼─────────────────────────┼────────────────────────────────┤
 *  │⑥ │ 没有谱库（NIST 或自建）      │ 20 个目标物靠 5 个标样  │ 谱库是数据不是设备：可外购；   │
 *  │  │                              │ 的保留时间 + 3 个特征离子│ 本层按「半定量 ±30–50 %」记账  │
 *  ├──┼──────────────────────────────┼─────────────────────────┼────────────────────────────────┤
 *  │⑦ │ 吸附管只有活性炭             │ C2–C8 可用；C9–C12 脱附 │ Tenax TA 要聚(2,6-二苯基对苯  │
 *  │  │                              │ 300–350 °C 会分解，差   │ 醚)（本层 0 条目）             │
 *  │  │                              │ 一个沸点档              │                                │
 *  ├──┼──────────────────────────────┼─────────────────────────┼────────────────────────────────┤
 *  │⑧ │ 没有 H₂ 传感器               │ 0 台；柱箱 300 °C、H₂  │ 催化燃烧式 H₂ 探测器（Pt 丝 +  │
 *  │  │                              │ 爆炸限 4–75 %           │ 桥路，一条小链）               │
 *  ├──┼──────────────────────────────┼─────────────────────────┼────────────────────────────────┤
 *  │⑨ │ 超净台                       │ 房间证书 ISO 5–7，台面  │ 层流台 + PTFE 内衬（缺条目）   │
 *  │  │                              │ 要 ISO 4–5 ⇒ 差 1–3 级  │                                │
 *  ├──┼──────────────────────────────┼─────────────────────────┼────────────────────────────────┤
 *  │⑩ │ 雾化室不冷却                 │ 传输效率 2–3.5 %（设计  │ 一台 −5 °C 冷机（Peltier 要   │
 *  │  │                              │ 3–5 %），LaO/La 高 0.5 %│ Bi₂Te₃，0 条目）               │
 *  ├──┼──────────────────────────────┼─────────────────────────┼────────────────────────────────┤
 *  │⑪ │ 没有 PFA、没有 Pt 炬管       │ B 记忆效应差 2–5×；HF  │ 当时 `mat/platinum` 0 条；现在 │
 *  │  │                              │ 残液把炬管寿命从 6 月砍 │ 有海绵 Pt（`pgm.ts`），但 Pt 炬 │
 *  │  │                              │ 到 1–2 月               │ 管未建；PFA 要全氟烷氧基树脂    │
 *  ├──┼──────────────────────────────┼─────────────────────────┼────────────────────────────────┤
 *  │⑫ │ 没有 Ce/Co/Tl/Li 调谐元素    │ 用 In/La/Ba 顶：LaO/La  │ 缺三条纯金属料（Ce、Co、Tl）   │
 *  │  │                              │ 代替 CeO/Ce，Ba²⁺/Ba⁺   │                                │
 *  │  │                              │ 代替 Ce²⁺/Ce —— 都是     │                                │
 *  │  │                              │ 1–2 % 档，够用不同源        │                                │
 *  └──┴──────────────────────────────┴─────────────────────────┴────────────────────────────────┘
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、ICP-MS 的十三件零件
//
// 顺序就是样品与离子的路：进样（泵/雾化器/雾化室）→ 等离子体（炬/线圈/RF）
// → 接口（采样锥/截取锥/接口腔）→ 离子光学（透镜/碰撞池）→ 复用件（四极杆/
// 驱动/检测器，见 make/icp-ms）→ 外围（气路板/1 atm 箱体）。
// ═══════════════════════════════════════════════════════════════════════════

export const TRACE_ANALYSIS_ITEMS: readonly Item[] = [
  /**
   * **同心雾化器。** PTFE 毛细管（内径 0.15 mm）+ 石英外套，Ar 从环缝里把液体
   * 剪成 2–5 µm 的雾滴。
   *
   *   sampleFlow    0.1–0.5 mL/min（工作点 0.4）
   *   gasFlow       0.9–1.1 L/min（雾化气，与等离子体气分开一路）
   *   dropletSize   2–5 µm（D50）；>10 µm 的雾滴进不了等离子体，会挂在雾化室壁上
   *
   * ⚠️ 它是**唯一一件石英与 PTFE 粘在一起的零件**：石英外套的锥面要与 PTFE
   * 毛细管同轴（偏心 <0.05 mm），偏了雾化效率掉一半。本层用玻璃车床
   * （`plant/glass-lathe`，1900–2200 °C）收石英锥，PTFE 管冷压进去。
   */
  {
    id: 'plant/icp-ms/nebulizer',
    name: 'ICP-MS 同心雾化器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'sampleFlow', kind: 'range', min: 0.05, max: 1, unit: 'mL/min' },
      { param: 'gasFlow', kind: 'range', min: 0.5, max: 1.5, unit: 'L/min' },
      { param: 'dropletSize', kind: 'range', min: 1, max: 10, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * **双通道雾化室（Scott 型）。** PTFE 车出来的两段筒 + 中心进样管，大雾滴撞壁
   * 流走，只有 2–3.5 % 的样品进等离子体。
   *
   *   volume               25–60 cm³
   *   transportEfficiency  2–5 %（**不冷却**：20 °C 取 2–3.5 %，2 °C 才是 3–5 %）
   *
   * ⚠️ 不冷却的原因写在 §二②：本层没有 −5 °C 冷机。代价是溶剂负荷高 1.5–2 倍
   * ⇒ 等离子体要多吃 0.2 kW，LaO/La 高 0.5 个百分点（缺口 ⑩）。
   */
  {
    id: 'plant/icp-ms/spray-chamber',
    name: 'ICP-MS 双通道雾化室',
    unit: '件',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 10, max: 100, unit: 'cm³' },
      { param: 'transportEfficiency', kind: 'range', min: 1, max: 10, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * **蠕动泵。** 12 滚轮压 PTFE 泵管，0.1–2.5 mL/min、8 通道（样品 + 内标 +
   * 冲洗 + 废液）。
   *
   *   flowRange  0.1–2.5 mL/min（8 通道并联时每道 0.1–0.4）
   *   accuracy   ±1–2 %（滚轮的脉动被 8 通道错相抵掉一半）
   *   channels   8（工作用 4，其余备用）
   *
   * 驱动用 `std/selsyn-general`（自整角机，几十瓦）—— 用 7.5 kW 的
   * `std/motor-7.5kw-4p` 推一只蠕动泵是把 100 倍余量当成标配。
   */
  {
    id: 'plant/icp-ms/peristaltic-pump',
    name: 'ICP-MS 蠕动泵',
    unit: '台',
    category: 'part',
    props: [
      { param: 'flowRange', kind: 'range', min: 0.05, max: 5, unit: 'mL/min', dir: 'atLeast' },
      { param: 'accuracy', kind: 'range', min: 0.5, max: 3, unit: '%', dir: 'atMost' },
      { param: 'channels', kind: 'range', min: 1, max: 8, unit: '道' },
    ],
  },

  /**
   * **ICP 炬：三层同心石英管，外管 φ18 mm。**
   *
   *   tubeId            18–19 mm
   *   injectorDiameter  1.2–1.8 mm（中心进样管，雾化气把样品送到等离子体轴心）
   *   length            100–115 mm
   *
   * 三层气：外（等离子体）13–15 L/min 切向进，形成涡流把等离子体约束在轴心；
   * 中（辅助）0.8–1.0 L/min 把等离子体从炬口托起来，防止石英过热；
   * 内（雾化）0.9–1.1 L/min 带样品。
   *
   * ⚠️ 石英炬管**怕 HF**：基体消除档的残液含 100–1000 ppm F⁻，炬管寿命从
   * 6 个月掉到 1–2 个月（缺口 ⑪）。本层没有 Pt 炬管（当时 `mat/platinum` 0 条目；
   * 现在 `pgm.ts` 有海绵 Pt，但炬管的成形/焊接路线仍未建）。
   */
  {
    id: 'plant/icp-ms/torch',
    name: 'ICP 炬',
    unit: '件',
    category: 'part',
    props: [
      { param: 'tubeId', kind: 'range', min: 15, max: 22, unit: 'mm' },
      { param: 'injectorDiameter', kind: 'range', min: 0.8, max: 3, unit: 'mm' },
      { param: 'length', kind: 'range', min: 80, max: 140, unit: 'mm' },
    ],
  },

  /**
   * **负载线圈。** φ2.5 mm 铜管绕 3 匝、内径 φ25 mm，水冷 2–4 L/min。
   *
   *   turns        3（2 匝耦合差、4 匝挡住观察窗）
   *   tubeDiameter 2.4–2.6 mm（壁厚 0.8，通水）
   *   coolingFlow  2–4 L/min（1 kW 里有 15–25 % 落在铜上）
   *
   * ⚠️ 线圈的**匝间距**决定等离子体的轴向位置：间距 2 mm 时等离子体中心在
   * 线圈上沿 +3 mm，采样锥就在那里。
   */
  {
    id: 'plant/icp-ms/load-coil',
    name: 'ICP-MS 负载线圈',
    unit: '件',
    category: 'part',
    props: [
      { param: 'turns', kind: 'range', min: 2, max: 5, unit: '匝' },
      { param: 'tubeDiameter', kind: 'range', min: 1.5, max: 4, unit: 'mm' },
      { param: 'coolingFlow', kind: 'range', min: 0.5, max: 5, unit: 'L/min', dir: 'atLeast' },
    ],
  },

  /**
   * **27.12 MHz、1.0–1.6 kW 的射频发生器。**
   *
   *   27.12 MHz = **2 × 13.56 MHz**：晶振、缓冲级、推挽二倍频、匹配网络。
   *   频率稳定度 ±20 ppm（`std/quartz-resonator-general`），功率稳定 ±0.05–0.1 %
   *   （`std/zener-reference-general` 的 ±5 ppm 做基准，`std/hv-rectifier-general`
   *   升到 2.8 kV 供阳极）。
   *
   *   frequency  27.06–27.18 MHz
   *   power      1.2–1.6 kW（进等离子体 0.9–1.3 kW，其余在匹配网络与线圈上）
   *   stability  ≤0.1 %（功率漂 0.1 % ⇒ 等离子体温度漂 ~10 K ⇒ 灵敏度漂 0.2 %）
   *
   * ⚠️ 它**由 `plant/rf-13m56` 执行**（倍频调谐、负载匹配都在那台机器的测试位上做）
   * —— 本层没有第二套 27 MHz 的调试台，这也不是缺口：同一个晶振倍频出来，
   * 频率差为 0，比另做一台 27 MHz 源更稳。
   */
  {
    id: 'plant/icp-ms/rf-generator',
    name: '27.12 MHz 发生器',
    unit: '台',
    category: 'part',
    props: [
      { param: 'frequency', kind: 'range', min: 26.5, max: 27.7, unit: 'MHz' },
      { param: 'power', kind: 'range', min: 1, max: 1.8, unit: 'kW' },
      { param: 'stability', kind: 'range', min: 0, max: 0.2, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * **采样锥。** 镍，φ1.0 mm 孔、60° 锥、厚 1.0 mm。1 atm 的等离子体从这里
   * 被抽进 200 Pa 的膨胀腔。
   *
   *   orifice    0.95–1.05 mm（孔大 0.1 mm，信号 +20 %、氧化物 +0.3 %）
   *   thickness  0.9–1.1 mm（薄了会变形、厚了孔口有隧道效应）
   *   material   Ni（当时没有 Pt：`mat/platinum` 0 条目；现在有海绵 Pt，
   *              但 Pt 采样锥仍未建）
   *
   * ⚠️ 镍锥在**高氯酸**里会炸（Ni + HClO₄ 生成易爆的 Ni(ClO₄)₂）——本层没有
   * 高氯酸，这条只作记录。镍锥的寿命 3–6 个月（孔口被等离子体慢慢啃大）。
   */
  {
    id: 'plant/icp-ms/sampler-cone',
    name: 'ICP-MS 采样锥',
    unit: '件',
    category: 'part',
    props: [
      { param: 'orifice', kind: 'range', min: 0.7, max: 1.3, unit: 'mm' },
      { param: 'thickness', kind: 'range', min: 0.7, max: 1.3, unit: 'mm' },
      { param: 'material', kind: 'enum', values: ['Ni', 'Pt'] },
    ],
  },

  /**
   * **截取锥。** 镍，φ0.6 mm 孔，距采样锥 **7 mm**（马赫盘之后的亚声速区）。
   *
   *   orifice  0.55–0.65 mm
   *   spacing  6–8 mm（<5 mm 在马赫盘里，信号抖 ±30 %；>10 mm 信号掉一半）
   *
   * 它把膨胀的射流「切」出一束，剩下的抽走 —— 这一刀决定了离子的**初始能量散**
   * （±2 eV），也就是四极杆入口的能量分散。
   */
  {
    id: 'plant/icp-ms/skimmer-cone',
    name: 'ICP-MS 截取锥',
    unit: '件',
    category: 'part',
    props: [
      { param: 'orifice', kind: 'range', min: 0.3, max: 0.9, unit: 'mm' },
      { param: 'spacing', kind: 'range', min: 4, max: 12, unit: 'mm' },
    ],
  },

  /**
   * **接口腔。** 不锈钢三级差分腔：采样锥座、截取锥座、两道抽气口（各接一台
   * 涡轮）、一个观察窗。
   *
   *   stages             2–3（本机 3：膨胀腔 / 中间腔 / 分析腔）
   *   leakRate           ≤1e-3 Pa·L/s（没有氦检漏，酒精气泡 + 压升法能判到的下限）
   *   apertureAlignment  0.05–0.1 mm（两锥的同轴度；偏 0.1 mm 信号掉 15 %）
   */
  {
    id: 'plant/icp-ms/interface-housing',
    name: 'ICP-MS 接口腔',
    unit: '件',
    category: 'part',
    props: [
      { param: 'stages', kind: 'range', min: 2, max: 4, unit: '级' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-3, unit: 'Pa·L/s', dir: 'atMost' },
      { param: 'apertureAlignment', kind: 'range', min: 0.02, max: 0.2, unit: 'mm', dir: 'atMost' },
    ],
  },

  /**
   * **离子透镜。** 三片不锈钢电极：提取极（−1500…−2500 V）、聚焦极、入口极。
   *
   *   extractionVoltage  1500–2500 V（把 3 eV 的离子从射流里拉出来）
   *   transmission       30–60 %（光阑与像差吃掉其余）
   *   electrodes         3（提取/聚焦/门）
   *
   * ⚠️ 全部**非磁**（μr ≤ 1.01）：45 钢的剩磁 1 mT 会把 3 eV 的离子吹偏 0.3 mm。
   * 电极用不锈钢、座用氧化铝、紧固件退磁 —— 与 `sims.ts` 的柱同一条手艺。
   */
  {
    id: 'plant/icp-ms/ion-lens',
    name: 'ICP-MS 离子透镜',
    unit: '件',
    category: 'part',
    props: [
      { param: 'extractionVoltage', kind: 'range', min: 1000, max: 3000, unit: 'V' },
      { param: 'transmission', kind: 'range', min: 20, max: 80, unit: '%', dir: 'atLeast' },
      { param: 'electrodes', kind: 'range', min: 2, max: 6, unit: '片' },
    ],
  },

  /**
   * **碰撞/反应池：八极、H₂ 0.02–0.1 Pa。**
   *
   *   cellPressure  0.02–0.1 Pa（H₂ 流量 0.1–1 mL/min，由气路板的分压阀给）
   *   transmission  40–80 %（八极的接受度比四极杆高）
   *   length        100–120 mm
   *
   * 它解的是 §二⑤ 那张表：⁵⁶Fe/⁷⁵As/⁵¹V/⁸⁰Se/⁴⁰Ca/³⁹K/³¹P 的同量异位素。
   * **H₂ 不是 He**：只降 10–100×，不是 1000× —— 所以 Fe/As/Se 只能报 1–10 ppb。
   *
   * ⚠️ H₂ 在池里会与**带正电的金属离子**反应吗？不会（H₂ 只与 Ar⁺、ArO⁺ 这类
   * 高能态离子做电荷转移）；但 H₂ 里的微量水会把池变成「H₂O 池」，氧化物比反而
   * 上升 0.2 个百分点 ⇒ H₂ 要过分子筛（`make/gc-ms` 的同一只干燥管）。
   */
  {
    id: 'plant/icp-ms/collision-cell',
    name: 'ICP-MS 碰撞/反应池',
    unit: '件',
    category: 'part',
    props: [
      { param: 'cellPressure', kind: 'range', min: 0.005, max: 0.5, unit: 'Pa' },
      { param: 'transmission', kind: 'range', min: 20, max: 90, unit: '%', dir: 'atLeast' },
      { param: 'length', kind: 'range', min: 50, max: 200, unit: 'mm' },
    ],
  },

  /**
   * **氩气路板。** 三路（等离子体 13–15、辅助 0.8–1.0、雾化 0.9–1.1 L/min）
   * 转子流量计 + 减压阀 + 电磁阀 + 0.5 µm 过滤器。
   *
   *   flowRange  0–20 L/min（三路合计；`plant/mfc` 只有 0–200 sccm = 0.2 L/min，
   *              **小 65 倍**，所以这一件必须单独做，见下）
   *   accuracy   ±1–2 %（转子流量计在 20 °C、1 atm 标定）
   *   channels   3–5
   *
   * ⚠️ **为什么不用 `plant/mfc`**：ICP-MS 的等离子体气是 13–15 L/min（**L 档**），
   * 而质量流量计那台是 0–200 sccm = 0.2 L/min —— 差 **65–75 倍**。转子流量计
   * 的精度 1–2 % 对等离子体气够用（它只要「不熄火」），对雾化气不够（雾化气
   * 决定灵敏度，1 % 的流量变化 = 1 % 的信号变化，反正要归一化）。
   */
  {
    id: 'plant/icp-ms/gas-panel',
    name: 'ICP-MS 氩气路板',
    unit: '件',
    category: 'part',
    props: [
      { param: 'flowRange', kind: 'range', min: 0, max: 20, unit: 'L/min', dir: 'atLeast' },
      { param: 'accuracy', kind: 'range', min: 0.5, max: 3, unit: '%', dir: 'atMost' },
      { param: 'channels', kind: 'range', min: 2, max: 6, unit: '路' },
    ],
  },

  /**
   * **1 atm 箱体。** 火星大气 0.6 kPa，而等离子体要 1 atm：整机装在一个
   * 0.6–1.0 m³ 的密封箱里，箱内充 Ar/N₂ 到 0.9–1.1 bar，箱壁 3 mm 钢板折弯焊。
   *
   *   volume    0.6–1.0 m³（炬箱 + 接口 + 电子学，人只在换锥时开侧门）
   *   leakRate  ≤1e-3 Pa·L/s（1 bar 下相当于 1e-8 Pa·m³/s；不要氦检漏也能保压）
   *
   * ⚠️ 箱内是**负压还是正压**：正压（+200 Pa），泄漏方向朝外，火星尘进不来；
   * 代价是 Ar/N₂ 补气 0.5–2 L/min。这一笔算在 `mat/argon` 的消耗里。
   */
  {
    id: 'plant/icp-ms/enclosure',
    name: '1 atm 箱体',
    unit: '件',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 0.3, max: 2, unit: 'm³' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-3, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 二、ICP-MS 整机
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * **ICP-MS。一台「把 20+ 元素的溶液检出限压到 0.1–10 ppb」的量具。**
   *
   * 它和 `plant/sims` 是**同一族仪器、不同的源**：SIMS 用一次离子束打固体，
   * ICP-MS 用 6000–8000 K 的 Ar 等离子体把液体烧成离子。所以四极杆、射频驱动、
   * 电子倍增器、法拉第杯**全部复用**（见 `make/icp-ms`），新做的只有「源+接口」。
   *
   * 两个 `holds` 压力窗口（同一台机器，两个区域）：
   *
   *   9e4–1.1e5 Pa   炬箱（1 atm 的 Ar 气氛，箱体正压 +200 Pa）
   *   1e-5–1e-3 Pa   四极杆/检测器腔（涡轮 2 抽）
   *
   * 七个 props 就是 §二 那六笔账的结论，逐项由 `make/icp-ms` 交付、由
   * `measure/trace-metals-icpms` 收窄成记录：
   *
   *   detectionLimit           0.05–10 ppb（常规档，5× 稀释）
   *   traceDetectionLimit      0.02–2 ppb（基体消除档，20 个金属）
   *   boronDetectionLimit      3–10 ppb（B 只走 10× 稀释档，不赶硅）
   *   phosphorusDetectionLimit 1–4 ppb（H₂ 池压 NOH⁺、赶硅后 ×2）
   *   elementCount             20–22
   *   massRange                2–260 u
   *   resolution               0.7–1.0 u（峰宽；四极杆在 u 上是常数）
   */
  {
    id: 'plant/icp-ms',
    name: 'ICP-MS 整机',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'pressure', min: 9e4, max: 1.1e5 },
      { param: 'pressure', min: 1e-5, max: 1e-3 },
    ],
    props: [
      { param: 'measure/detectionLimit', kind: 'range', min: 0.01, max: 20, unit: 'ppb', dir: 'atMost' },
      { param: 'measure/traceDetectionLimit', kind: 'range', min: 0.001, max: 5, unit: 'ppb', dir: 'atMost' },
      { param: 'measure/boronDetectionLimit', kind: 'range', min: 0.5, max: 50, unit: 'ppb', dir: 'atMost' },
      { param: 'measure/phosphorusDetectionLimit', kind: 'range', min: 0.2, max: 20, unit: 'ppb', dir: 'atMost' },
      { param: 'elementCount', kind: 'range', min: 18, max: 30, unit: '个' },
      { param: 'measure/massRange', kind: 'range', min: 1, max: 300, unit: 'u' },
      { param: 'measure/resolution', kind: 'range', min: 0.2, max: 2, unit: 'u', dir: 'atMost' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 三、GC-MS 的六件零件 + 一支吸附管
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * **进样口。** 分流/不分流 + 1 mL 气体定量环，两用。
   *
   *   temperature  250–300 °C（液体样；气体样走定量环，不进衬管）
   *   splitRatio   5–20（1 µL 里 0.05–0.2 µL 上柱；不分流时 0.1–2 µL 全上）
   *   loopVolume   1 mL（气体样；NH₃ 的 1 mL 环要**镍内衬**，PTFE 会被氨溶胀）
   *
   * ⚠️ 气体样的 NH₃ 会溶胀 PTFE 阀片、腐蚀硅胶垫 ⇒ 阀片用镍、垫片用石墨
   * （`make/gc-ms-injector` 的注释里有这一步）。
   */
  {
    id: 'plant/gc-ms/injector',
    name: 'GC-MS 进样口',
    unit: '件',
    category: 'part',
    props: [
      { param: 'temperature', kind: 'range', min: 50, max: 350, unit: '°C' },
      { param: 'splitRatio', kind: 'range', min: 1, max: 100, unit: ':1' },
      { param: 'loopVolume', kind: 'range', min: 0.1, max: 2, unit: 'mL' },
    ],
  },

  /**
   * **毛细管柱：30 m × φ0.25 mm × 0.25 µm 甲基硅氧烷。**
   *
   *   length          25–30 m
   *   innerDiameter   0.24–0.26 mm（0.25 是「柱效/柱容量」的折中）
   *   filmThickness   0.2–0.3 µm（薄了容量小、厚了高沸点出不来）
   *
   * 做法三步（全部本层有）：
   *   ① φ0.25 mm 的石英毛细管在玻璃车床上拉（1900–2200 °C）
   *   ② `mat/methyl-trichlorosilane` 水解 + 缩聚成聚甲基硅氧烷，静态涂布
   *   ③ 250–280 °C 交联 4 h（`plant/resistance-furnace`），再用溶剂冲掉未交联的
   *
   * 板数：3000 板/m × 30 m = **9×10⁴ 板**；H₂ 载气 1.0 mL/min 下 39 min 走完
   * 40→300 °C 的程序。
   */
  {
    id: 'plant/gc-ms/capillary-column',
    name: 'GC-MS 毛细管柱',
    unit: '件',
    category: 'part',
    props: [
      { param: 'length', kind: 'range', min: 20, max: 60, unit: 'm' },
      { param: 'innerDiameter', kind: 'range', min: 0.15, max: 0.4, unit: 'mm' },
      { param: 'filmThickness', kind: 'range', min: 0.1, max: 1, unit: 'µm' },
    ],
  },

  /**
   * **柱温箱。** 40–320 °C、程序升温 1–20 °C/min、±0.05–0.2 °C 稳定度。
   *
   *   temperature  40–320 °C
   *   rampRate     1–20 °C/min（再快柱效掉 20 %）
   *   stability    ±0.05–0.2 °C（保留时间的重复性 ±0.5–3 % 就是它给的）
   *
   * ⚠️ 300 °C 的箱子里通 H₂ 是**本层最危险的一处**：H₂ 爆炸限 4–75 %，
   * 而本层没有 H₂ 传感器（缺口 ⑧）。箱体的排风与柱接头的检漏只能靠人。
   */
  {
    id: 'plant/gc-ms/column-oven',
    name: 'GC-MS 柱温箱',
    unit: '件',
    category: 'part',
    composedOf: [
      { item: 'plant/gc-ms/column-oven/shell', qty: q(1) },
      { item: 'plant/gc-ms/column-oven/insulation', qty: q(1) },
      { item: 'plant/gc-ms/column-oven/heater', qty: q(1) },
      { item: 'std/ramp-controller-general', qty: q(1) },
      { item: 'std/thermocouple-t-general', qty: q(1) },
      { item: 'std/contactor-general', qty: q(1) },
    ],
    props: [
      { param: 'temperature', kind: 'range', min: 40, max: 350, unit: '°C' },
      { param: 'rampRate', kind: 'range', min: 0.1, max: 40, unit: '°C/min' },
      { param: 'stability', kind: 'range', min: 0, max: 0.5, unit: '°C', dir: 'atMost' },
    ],
  },

  { id: 'plant/gc-ms/column-oven/shell', name: '柱箱炉壳', unit: '件', category: 'part' },
  { id: 'plant/gc-ms/column-oven/insulation', name: '柱箱保温', unit: '件', category: 'part' },
  { id: 'plant/gc-ms/column-oven/heater', name: '柱箱加热丝', unit: '件', category: 'part' },

  /**
   * **EI 源：70 eV 电子轰击、10–100 µA 发射、源温 220–260 °C。**
   *
   *   electronEnergy  70 eV（标准谱库都是 70 eV；本层没有谱库，但 70 eV 仍是
   *                   裂解模式最可重复的一档）
   *   emissionCurrent 20–100 µA（灯丝是 φ0.15 钨丝，`mat/tungsten-powder`）
   *   temperature     220–260 °C（低了有机物在源里冷凝，高了分子离子峰消失）
   *
   * ⚠️ 灯丝寿命：70 eV、50 µA 下 **800–1500 h**；换灯丝要破真空 2 h（与 SIMS 的
   * 一次源同一条「钨丝是耗材」的账）。
   */
  {
    id: 'plant/gc-ms/ei-source',
    name: 'EI 源',
    unit: '件',
    category: 'part',
    props: [
      { param: 'electronEnergy', kind: 'range', min: 30, max: 120, unit: 'eV' },
      { param: 'emissionCurrent', kind: 'range', min: 5, max: 300, unit: 'µA' },
      { param: 'temperature', kind: 'range', min: 150, max: 350, unit: '°C' },
    ],
  },

  /**
   * **传输线。** 不锈钢 φ0.25 mm 内衬管 + 铜加热块 + K 型热电偶，柱出口到源
   * 入口 200–300 mm，260–300 °C。
   *
   *   temperature    260–300 °C（比柱终温高 20–40 °C，防冷点）
   *   length         200–300 mm
   *   innerDiameter  0.25–0.3 mm（死体积 <1 µL，否则峰变宽 2–3 倍）
   */
  {
    id: 'plant/gc-ms/transfer-line',
    name: 'GC-MS 传输线',
    unit: '件',
    category: 'part',
    props: [
      { param: 'length', kind: 'range', min: 100, max: 400, unit: 'mm' },
      { param: 'innerDiameter', kind: 'range', min: 0.1, max: 0.5, unit: 'mm' },
    ],
  },

  /**
   * **四极杆适配器。** 把 `plant/sims/quadrupole`（φ9 杆、r0 4 mm 的石英座）
   * 装进 GC-MS 的分析腔：CF100 法兰 + 杆座转接 + 入口光阑（φ3 mm）。
   *
   *   flangeSize  100–150 mm（CF100 是 euv 真空那套的规格）
   *   alignment   0.05–0.1 mm（杆轴与入口光阑的同轴度）
   *
   * **复用关系写在这里**：GC-MS 不自制四极杆，直接用 SIMS 的杆与驱动；这一件
   * 是两者之间唯一的新接口 —— 所以本层「质谱部件」只有一套工艺。
   */
  {
    id: 'plant/gc-ms/analyzer-adapter',
    name: 'GC-MS 四极杆适配器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'flangeSize', kind: 'range', min: 50, max: 200, unit: 'mm' },
      { param: 'alignment', kind: 'range', min: 0.02, max: 0.5, unit: 'mm', dir: 'atMost' },
    ],
  },

  /**
   * **活性炭吸附管。** φ6 × 90 mm 玻璃管，装 0.1–0.2 g 活性炭（`mat/carbon`），
   * 两端石英棉。
   *
   *   adsorbentMass  0.1–0.2 g
   *   capacity       5–10 mg（有机物总吸附量；1 L 的 10 ppm 样只有 0.7 mg，余量 10×）
   *   blank          1–5 ng（管子的本底；它决定气体样的检出限 2–5 ppb）
   *
   * 用途：NH₃ 是气体，直接进 1 mL 环只有 0.1–1 ppm 的灵敏度；过 1 L 气到
   * 这根管上、300 °C 热脱附进柱，富集 **500–800 倍**（1 L → 1 mL 脱附体积，
   * 回收 50–80 % ⇒ 500–800）。
   *
   * ⚠️ 活性炭对 **C9–C12 保留过强**（脱附要 350–400 °C，那时高沸点已经裂解）；
   * Tenax TA 才是 C4–C12 的管子，而 Tenax 要聚(2,6-二苯基对苯醚) —— 本层
   * 0 条目（缺口 ⑦）。所以这根管只对 **C2–C8** 定量。
   */
  {
    id: 'mat/gc-ms-adsorbent-tube',
    name: '活性炭吸附管',
    unit: '支',
    category: 'consumable',
    props: [
      { param: 'adsorbentMass', kind: 'range', min: 0.05, max: 0.5, unit: 'g' },
      { param: 'capacity', kind: 'range', min: 1, max: 20, unit: 'mg' },
      { param: 'blank', kind: 'range', min: 0, max: 10, unit: 'ng', dir: 'atMost' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 四、GC-MS 整机
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * **GC-MS。一台「把有机杂质量到 0.1–1 ppm」的量具。**
   *
   * 三个 `holds`：
   *
   *   40–350 °C      柱温箱（程序升温的那条轴）
   *   1e-4–1e-3 Pa   分析腔（涡轮；与 ICP-MS 同一套泵件）
   *   0.9–1.6 bar    进样口与载气（H₂ 1 mL/min 时柱前压 0.5–1.2 bar，
   *                  再加上 1 atm 的箱内气氛）
   *
   * 五个 props 就是 §三 的结论：
   *
   *   detectionLimit  0.1–1 ppm（SIM；全扫描 1–10 ppm）
   *   compoundCount   20–30 个目标物（5 个有标样、其余保留时间 + 特征离子）
   *   massRange       10–300 u（复用 SIMS 杆）
   *   resolution      0.7–1.0 u
   *   rtRepeatability 0.5–3 %（保留时间；柱温 ±0.1 °C 给的就是这个数）
   */
  {
    id: 'plant/gc-ms',
    name: 'GC-MS 整机',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 40, max: 350 },
      { param: 'pressure', min: 1e-4, max: 1e-3 },
      { param: 'pressure', min: 9e4, max: 1.6e5 },
    ],
    props: [
      { param: 'detectionLimit', kind: 'range', min: 0.01, max: 10, unit: 'ppm', dir: 'atMost' },
      { param: 'compoundCount', kind: 'range', min: 5, max: 50, unit: '个' },
      { param: 'massRange', kind: 'range', min: 1, max: 300, unit: 'u' },
      { param: 'resolution', kind: 'range', min: 0.2, max: 2, unit: 'u', dir: 'atMost' },
      { param: 'rtRepeatability', kind: 'range', min: 0.05, max: 10, unit: '%', dir: 'atMost' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 五、亚沸蒸馏：四件 + 一台
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * **亚沸瓶。** PTFE 车削，1.5–2 L，壁厚 3–4 mm，口部磨砂接冷凝柱。
   *
   *   volume        1.5–2 L（一次装 1.5 L 酸，蒸 3–5 天出 0.5–1 L）
   *   wallThickness 3–4 mm（薄了会塌、厚了传热慢 30 %）
   *
   * ⚠️ PTFE 的**微孔隙**会吸酸、也吸硼：换酸种要先用 1:1 亚沸 HNO₃ 煮 4 h，
   * 不然 B 的本底从 0.3 ppb 涨到 2–5 ppb（缺口 ⑪）。
   */
  {
    id: 'plant/sub-boiling-still/flask',
    name: '亚沸蒸馏器亚沸瓶',
    unit: '件',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 1, max: 3, unit: 'L' },
      { param: 'wallThickness', kind: 'range', min: 2, max: 6, unit: 'mm' },
    ],
  },

  /**
   * **冷凝柱。** PTFE 管 φ30 × 500 mm，内壁刻螺旋槽（回流液沿壁下、蒸气走中间）。
   *
   *   length       400–600 mm
   *   surfaceArea  0.15–0.25 m²（冷凝面；2 L 瓶的蒸气量 3–8 g/h，够）
   *
   * 亚沸的关键是**回流比**：柱顶温度比瓶里低 15–30 °C，蒸气在柱里冷凝回流，
   * 把雾滴（带金属）冲回瓶里 —— 这就是「亚沸」比「蒸馏」干净的全部原因。
   */
  {
    id: 'plant/sub-boiling-still/condenser',
    name: '亚沸蒸馏器冷凝柱',
    unit: '件',
    category: 'part',
    props: [
      { param: 'length', kind: 'range', min: 200, max: 800, unit: 'mm' },
      { param: 'surfaceArea', kind: 'range', min: 0.05, max: 0.5, unit: 'm²' },
    ],
  },

  /**
   * **红外加热器。** φ100 石英玻璃罩 + 钨丝灯芯 + 铝反射罩 + K 型热电偶，
   * 150–300 W、1.2–2.5 µm 辐射峰。
   *
   *   power       150–300 W（把 1.5 L 65 % HNO₃ 维持在 60–90 °C 只要 80–150 W，
   *               余量给「开着侧门调」的那天）
   *   wavelength  1.2–2.5 µm（石英透过、PTFE 吸收；用红外是为了**只加热液体
   *               表面**，不加热瓶壁 —— 壁一热，金属就从壁上洗下来）
   */
  {
    id: 'plant/sub-boiling-still/ir-heater',
    name: '亚沸蒸馏器红外加热器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 50, max: 600, unit: 'W' },
      { param: 'wavelength', kind: 'range', min: 1, max: 3, unit: 'µm' },
    ],
  },

  /**
   * **接收瓶。** PTFE 0.5–1 L，带 φ30 磨口与 0.2 µm 排气过滤（防止空气中的
   * 尘与氨进瓶 —— 氨溶进酸会把 pH 抬起来，金属的溶解度就变了）。
   *
   *   volume  0.5–1 L
   *   neckId  30–40 mm
   */
  {
    id: 'plant/sub-boiling-still/receiver',
    name: '亚沸蒸馏器接收瓶',
    unit: '件',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 0.2, max: 3, unit: 'L' },
      { param: 'neckId', kind: 'range', min: 20, max: 60, unit: 'mm' },
    ],
  },

  /**
   * **亚沸蒸馏器。整机 `holds` 40–120 °C。**
   *
   *   throughput  200–500 mL/天（1.5 L 装料、60–90 °C、冷凝面 0.2 m² 的账）
   *
   * 两个酸种两个工作点（`make/nitric-acid-subboiled` 60–90 °C、
   * `make/hcl-subboiled` 40–60 °C），同一台机器换瓶就行。
   *
   * ⚠️ **不许与别的蒸馏共用**：`plant/water-polisher` 是石英三级蒸馏（做超纯水），
   * 石英在 HF/HCl 里会掉钠、掉硅 —— 痕量酸的器皿只能是 PTFE。
   */
  {
    id: 'plant/sub-boiling-still',
    name: '亚沸蒸馏器',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'temperature', min: 40, max: 120 }],
    props: [
      { param: 'throughput', kind: 'range', min: 100, max: 1000, unit: 'mL/天', dir: 'atLeast' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 六、亚沸酸与标液（五种材料）
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * **亚沸硝酸。65–70 %、金属 10–50 ppt。**
   *
   * 原料是 `mat/nitric-acid`（65 %，电弧固氮，`make/nitric-acid`）——
   * 它的 Fe/Ca/Na 在 0.1–1 ppm 量级（电弧炉与吸收塔带来的）。
   * 亚沸之后 **10–50 ppt**，净化 **2 000–100 000 倍**：金属盐的蒸气压≈0，
   * 只有雾滴夹带带得过去；回流比 5–10:1 把夹带压到 0.001–0.05 %。
   *
   * ⚠️ 「金属 ≤10 ppt」是**设计窗口**：能证到 10–100 ppt（ICP-MS 的酸空白），
   * 再往下要 10 倍预浓缩 —— 与本文件同一条口径（没有实测不写实测）。
   */
  {
    id: 'mat/nitric-acid-subboiled',
    name: '亚沸硝酸',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'concentration', kind: 'range', min: 60, max: 72, unit: '%' },
      { param: 'metals', kind: 'range', min: 0, max: 50, unit: 'ppt', dir: 'atMost' },
    ],
  },

  /**
   * **亚沸盐酸。32–35 %、金属 10–50 ppt。**
   *
   * 原料 `mat/hcl`（15–38 %，`make/hcl`）。HCl 37 % 在 20 °C 就冒白烟（蒸气压
   * 大），所以亚沸温度只能取 **40–60 °C**：高于 60 °C 时 HCl 跑得比水快，
   * 馏出液会稀到 20 % 以下，金属反而浓缩在瓶里（这一步是「提纯酸」不是「浓缩酸」）。
   */
  {
    id: 'mat/hcl-subboiled',
    name: '亚沸盐酸',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'concentration', kind: 'range', min: 28, max: 38, unit: '%' },
      { param: 'metals', kind: 'range', min: 0, max: 50, unit: 'ppt', dir: 'atMost' },
    ],
  },

  /**
   * **单元素标准溶液。1000 µg/mL，1 瓶 = 100 mL。**
   *
   * 配法：0.1 g 纯元素 + 5 g 亚沸 HNO₃（+ 2 g 亚沸 HCl 助溶，Ag/Au/Pb 要
   * 王水）+ 超纯水定容到 100 mL。
   *
   *   浓度     995–1005 µg/mL
   *   不确定度 0.5–10 %（14 个金属 0.5–1.5 %；As 99.5 %、Se 90–99.9 %
   *             两种单质的纯度不够 ⇒ 5–10 %，见 §五 与缺口 ⑫）
   *
   * 22 个元素见 `make/icp-single-element-standard` 的 anyOf。**Si 不做标液**：
   * 基体就是硅，且 ²⁸Si 被 ¹²C¹⁶O/¹⁴N₂ 压住（0.018/0.029 u，1 u 峰宽分不开）。
   */
  {
    id: 'mat/icp-single-element-standard',
    name: '单元素标准溶液',
    unit: '瓶',
    category: 'material',
    props: [
      { param: 'concentration', kind: 'range', min: 50, max: 1100, unit: 'µg/mL' },
      { param: 'uncertainty', kind: 'range', min: 0.3, max: 10, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * **调谐液：In 115 / La 139 / Ba 137，各 10 µg/mL。**
   *
   *   为什么是这三样：本层没有 Ce、Co、Tl、Li 的纯金属（缺口 ⑫），能拿到的
   *   纯物质只有 `mat/indium`、`mat/lanthanum-oxide`、`mat/barium-carbonate`。
   *
   *   **LaO/La 代替 CeO/Ce**：La—O 的键能 798 kJ/mol（Ce—O 795），氧化物比
   *   同一档（1–2 %）；**Ba²⁺/Ba⁺ 代替 Ce²⁺/Ce**：Ba 的第二电离能 10.00 eV
   *   （Ce 10.85），在 7000 K 下双电荷比例同量级（1–3 %）。
   *
   *   浓度 9–11 µg/mL、元素数 3。
   */
  {
    id: 'mat/icp-tuning-solution',
    name: '调谐液',
    unit: '瓶',
    category: 'material',
    props: [
      { param: 'concentration', kind: 'range', min: 1, max: 100, unit: 'µg/mL' },
      { param: 'elementCount', kind: 'range', min: 1, max: 10, unit: '个' },
    ],
  },

  /**
   * **GC-MS 五点标准：5 个组分各 10 µg/mL，溶剂异丙醇。**
   *
   *   甲醇（醇）、丙酮（酮）、甲苯（芳烃）、苯乙烯（芳烃）、苯酚（酚）
   *   —— 这五样覆盖 NH₃/TCS 里最常见的极性/非极性有机杂质类型，
   *   而且**全部本层有产出路线**（`make/methanol`、`make/acetone`、`make/toluene`、
   *   `make/styrene`、`make/phenol`）。
   *
   *   浓度 5–20 µg/mL；组分 5；溶剂 isopropanol。
   *   不确定度 2–5 %（天平 0.1 %、移液 1 %、挥发损失 1–3 %）。
   *
   * ⚠️ 它只是**外标**：20 个目标物里 15 个没有标样，只能按保留时间 + 3 个
   * 特征离子半定量（±30–50 %）。要全部定量，缺 15 条纯品料（缺口 ⑥）。
   */
  {
    id: 'mat/gcms-calibration-standard',
    name: 'GC-MS 五点标准',
    unit: '瓶',
    category: 'material',
    props: [
      { param: 'concentration', kind: 'range', min: 1, max: 100, unit: 'µg/mL' },
      { param: 'compoundCount', kind: 'range', min: 3, max: 10, unit: '个' },
      { param: 'solvent', kind: 'enum', values: ['isopropanol', 'methanol', 'toluene'] },
    ],
  },

];

// ═══════════════════════════════════════════════════════════════════════════
// 九、路线：十三件 ICP-MS 零件 → 整机 → 六件 GC-MS 零件 → 整机 →
//     四件亚沸件 → 整机 → 两种酸 → 三种标液
//     （两条量测路线在 data/measure/trace-analysis.ts，R13）
//
// 每一段的执行者都在既有设备表里（`lathe` / `plant/robot` / `plant/sheet-shop`
// / `plant/glass-lathe` / `plant/winder` / `plant/rf-13m56` / `plant/grinder` /
// `plant/comparator` / `plant/micro-balance` …）；没有一台是新造出来才能造自己的。
// ═══════════════════════════════════════════════════════════════════════════

export const TRACE_ANALYSIS_ROUTES: readonly Route[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 9.1 ICP-MS 零件
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **雾化器：石英外套收锥 → PTFE 毛细管冷压 → 通气量雾滴。**
     *
     *   石英 0.01 + PTFE 0.02 → 雾化器 1 件
     *
     * 石英外套在玻璃车床（1900–2200 °C）上收成 30° 锥，锥口 φ0.25 mm；
     * PTFE 毛细管 φ0.15/φ0.3 冷压进锥孔，偏心 ≤0.05 mm。
     */
    id: 'make/icp-ms-nebulizer',
    name: 'ICP-MS 同心雾化器制造',
    produces: [
      {
        item: 'plant/icp-ms/nebulizer',
        qty: q(1),
        gives: [
          { param: 'sampleFlow', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'gasFlow', kind: 'range', min: 0.9, max: 1.1 },
          { param: 'dropletSize', kind: 'range', min: 2, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 50) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/glass-lathe',
    under: [{ param: 'temperature', min: 1900, max: 2200 }],
    rate: { hours: q(6) },
    unbalanced_zh:
      '石英 0.01 + PTFE 0.02 → 雾化器 1 件；余是收锥掉的石英与压装废料。按件计，不做质量账',
  },

  {
    /**
     * **雾化室：PTFE 两段筒 + 中心进样管 + 排液口。**
     *
     *   参考 `plant/icp-ms/spray-chamber` 的两个数：容积 25–60 cm³、
     *   传输效率 2–3.5 %（不冷却的那一档）。
     */
    id: 'make/icp-ms-spray-chamber',
    name: 'ICP-MS 双通道雾化室制造',
    produces: [
      {
        item: 'plant/icp-ms/spray-chamber',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 25, max: 60 },
          { param: 'transportEfficiency', kind: 'range', min: 2, max: 3.5 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/ptfe', qty: q(3, 20) }] }],
    needs: [],
    performedBy: 'lathe',
    rate: { hours: q(8) },
    unbalanced_zh: 'PTFE 0.15 → 雾化室 1 件；余是车屑。按件计',
  },

  {
    /**
     * **蠕动泵：12 滚轮 + 8 通道 + 自整角机驱动。**
     *
     *   自整角机 1 + 接触器 1 + PTFE 管 0.05 + 铝 0.2 + 45 钢 0.1 → 泵 1 台
     *
     * 为什么用 `std/selsyn-general`：它是一只几十瓦的小电机，转速 60–600 rpm
     * 可调；7.5 kW 的 `std/motor-7.5kw-4p` 推蠕动泵是 100 倍余量。
     */
    id: 'make/icp-ms-peristaltic-pump',
    name: 'ICP-MS 蠕动泵制造',
    produces: [
      {
        item: 'plant/icp-ms/peristaltic-pump',
        qty: q(1),
        gives: [
          { param: 'flowRange', kind: 'range', min: 0.1, max: 2.5 },
          { param: 'accuracy', kind: 'range', min: 1, max: 2 },
          { param: 'channels', kind: 'range', min: 8, max: 8 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/selsyn-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 10) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(8) },
    unbalanced_zh:
      '自整角机 1 + 接触器 1 + PTFE 0.05 + 铝 0.2 + 45 钢 0.1 → 泵 1 台；按件计，余是机架与滚轮切屑',
  },

  {
    /**
     * **炬管：三层石英管烧接。**
     *
     *   石英 0.12 → 炬 1 件；外管 φ18–19、中心进样管 1.2–1.8、长 100–115 mm。
     *   玻璃车床 1900–2200 °C 收口、三层同轴度 ≤0.2 mm（偏了等离子体偏一边，
     *   采样锥吃不到轴心的离子）。
     */
    id: 'make/icp-ms-torch',
    name: 'ICP 炬制造',
    produces: [
      {
        item: 'plant/icp-ms/torch',
        qty: q(1),
        gives: [
          { param: 'tubeId', kind: 'range', min: 18, max: 19 },
          { param: 'injectorDiameter', kind: 'range', min: 1.2, max: 1.8 },
          { param: 'length', kind: 'range', min: 100, max: 115 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/quartz-pure', qty: q(3, 25) }] }],
    needs: ['lathe'],
    performedBy: 'plant/glass-lathe',
    under: [{ param: 'temperature', min: 1900, max: 2200 }],
    rate: { hours: q(10) },
    unbalanced_zh: '石英 0.12 → 炬管 1 件；余是烧接的边角与废品（三层同轴要试 3–5 根）',
  },

  {
    /**
     * **负载线圈：φ2.5 铜管绕 3 匝。**
     *
     *   铜 0.12 → 线圈 1 件；匝数 3、管径 2.4–2.6、冷却水 2–4 L/min。
     *   绕线机（`plant/winder`）绕完要退火（300 °C、2 h）去应力，不然通水后
     *   线圈会慢慢变形，等离子体的位置跟着漂。
     */
    id: 'make/icp-ms-load-coil',
    name: 'ICP-MS 负载线圈制造',
    produces: [
      {
        item: 'plant/icp-ms/load-coil',
        qty: q(1),
        gives: [
          { param: 'turns', kind: 'range', min: 3, max: 3 },
          { param: 'tubeDiameter', kind: 'range', min: 2.4, max: 2.6 },
          { param: 'coolingFlow', kind: 'range', min: 2, max: 4 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(3, 25) }] }],
    needs: ['lathe'],
    performedBy: 'plant/winder',
    rate: { hours: q(4) },
    unbalanced_zh: '铜 0.12 → 线圈 1 件；余是弯管废料。按件计',
  },

  {
    /**
     * **27.12 MHz 发生器：13.56 MHz 二倍频 + 匹配网络。**
     *
     *   铜 2 + 铜线 1 + 45 钢 3 + 铝 1 + 稳压管 1 + 晶振 1 + 高压整流 1 → 1 台
     *
     * 执行者是 `plant/rf-13m56`（5–30 MHz、0–2 kW 的那台）：倍频级、槽路线圈、
     * 真空可变电容、负载匹配全部在它的测试位上调。频率 27.06–27.18 MHz、
     * 功率 1.2–1.6 kW、稳定度 0.05–0.1 %。
     */
    id: 'make/icp-ms-rf-generator',
    name: '27.12 MHz 发生器制造',
    produces: [
      {
        item: 'plant/icp-ms/rf-generator',
        qty: q(1),
        gives: [
          { param: 'frequency', kind: 'range', min: 27.06, max: 27.18 },
          { param: 'power', kind: 'range', min: 1.2, max: 1.6 },
          { param: 'stability', kind: 'range', min: 0.05, max: 0.1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(3) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/quartz-resonator-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/hv-rectifier-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/rf-13m56',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(30) },
    unbalanced_zh:
      '铜 2 + 铜线 1 + 45 钢 3 + 铝 1 + 稳压管/晶振/整流各 1 → 发生器 1 台；按件计，余是机箱与屏蔽罩',
  },

  {
    /**
     * **采样锥：车 60° 锥面 → 钻铰 φ1.0 孔 → 磨孔口。**
     *
     *   镍 0.06 → 锥 1 件；孔 0.95–1.05、厚 0.9–1.1、材质 Ni。
     *
     * 0.1 mm 的孔口倒角是**唯一能磨的地方**：孔口 0.05 mm 的毛刺会把射流打散，
     * 信号掉 30 %、氧化物比涨 1 个百分点。磨完在比较仪上看孔口的圆度（≤2 µm）。
     */
    id: 'make/icp-ms-sampler-cone',
    name: 'ICP-MS 采样锥制造',
    produces: [
      {
        item: 'plant/icp-ms/sampler-cone',
        qty: q(1),
        gives: [
          { param: 'orifice', kind: 'range', min: 0.95, max: 1.05 },
          { param: 'thickness', kind: 'range', min: 0.9, max: 1.1 },
          { param: 'material', kind: 'enum', oneOf: ['Ni'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/nickel', qty: q(3, 50) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车 60° 锥面与背面定位面（同轴 ≤0.02 mm）', performedBy: 'lathe' },
      { note_zh: '钻 φ0.9 → 铰 φ1.0（铰刀手进，转速 200 rpm）', performedBy: 'lathe' },
      { note_zh: '磨孔口倒角 0.03×45°，比较仪看圆度 ≤2 µm', performedBy: 'plant/grinder' },
    ],
    rate: { hours: q(12) },
    unbalanced_zh: '镍 0.06 → 采样锥 1 件；余是车屑与铰屑。按件计',
  },

  {
    /**
     * **截取锥：φ0.6 mm 孔、距采样锥 7 mm 的定位面。**
     *
     *   镍 0.03 → 锥 1 件；孔 0.55–0.65、间距 6–8 mm。
     *
     * φ0.6 的孔已经是本层钻削的下限（φ0.3 钻头 + 铰）。孔口同样要磨 ——
     * 截取锥的孔口毛刺是「信号抖 ±30 %」的常见原因。
     */
    id: 'make/icp-ms-skimmer-cone',
    name: 'ICP-MS 截取锥制造',
    produces: [
      {
        item: 'plant/icp-ms/skimmer-cone',
        qty: q(1),
        gives: [
          { param: 'orifice', kind: 'range', min: 0.55, max: 0.65 },
          { param: 'spacing', kind: 'range', min: 6, max: 8 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/nickel', qty: q(3, 100) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车锥面与 7 mm 定位台阶（台阶面到孔口 7.0±0.1）', performedBy: 'lathe' },
      { note_zh: '钻 φ0.5 → 铰 φ0.6；磨孔口倒角', performedBy: 'lathe' },
      { note_zh: '比较仪测孔口圆度与台阶高度，超差重做', performedBy: 'plant/comparator' },
    ],
    rate: { hours: q(14) },
    unbalanced_zh: '镍 0.03 → 截取锥 1 件；余是切屑。按件计',
  },

  {
    /**
     * **接口腔：不锈钢三级差分腔 + 两道抽气口 + 观察窗。**
     *
     *   不锈钢 3 + 铜 0.3（CF 铜垫）+ PTFE 0.05 → 腔 1 件
     *   stages 2–3、漏率 ≤1e-3 Pa·L/s、两锥同轴 0.05–0.1 mm
     *
     * 检漏借 `plant/euv-vacuum`：抽到 1e-2–1e-1 Pa，关阀 1 h 看压升。
     * 本层没有氦检漏（与 `euv-source.ts` 缺口⑥同一条）。
     */
    id: 'make/icp-ms-interface-housing',
    name: 'ICP-MS 接口腔制造',
    produces: [
      {
        item: 'plant/icp-ms/interface-housing',
        qty: q(1),
        gives: [
          { param: 'stages', kind: 'range', min: 2, max: 3 },
          { param: 'leakRate', kind: 'range', min: 1e-4, max: 1e-3 },
          { param: 'apertureAlignment', kind: 'range', min: 0.05, max: 0.1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(3) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 20) }] },
    ],
    needs: ['plant/euv-vacuum', 'plant/metrology-room'],
    steps: [
      { note_zh: '折弯焊三级腔体与两道抽气口（8 mm 板，氩弧焊）', performedBy: 'plant/sheet-shop' },
      { note_zh: '车两锥的定位止口，同轴 ≤0.05 mm', performedBy: 'lathe' },
      { note_zh: '装 CF 铜垫与观察窗，接 euv-vacuum 抽到 1e-2–1e-1 Pa，关阀 1 h 看压升 ≤1e-3 Pa·L/s', performedBy: 'plant/robot', under: [{ param: 'pressure', min: 1e-2, max: 1e-1 }] },
    ],
    rate: { hours: q(20) },
    unbalanced_zh: '不锈钢 3 + 铜 0.3 + PTFE 0.05 → 接口腔 1 件；余是焊缝与切屑。按件计',
  },

  {
    /**
     * **离子透镜：三片不锈钢电极 + 氧化铝座。**
     *
     *   不锈钢 0.2 + 氧化铝 2 + 铜线 0.05 → 透镜 1 件
     *   提取 1500–2500 V、传输 30–60 %、3 片电极。
     *
     * 电极全部退磁（μr ≤1.01），座用氧化铝 —— 与 `sims.ts` 的柱同一条手艺。
     */
    id: 'make/icp-ms-ion-lens',
    name: 'ICP-MS 离子透镜制造',
    produces: [
      {
        item: 'plant/icp-ms/ion-lens',
        qty: q(1),
        gives: [
          { param: 'extractionVoltage', kind: 'range', min: 1500, max: 2500 },
          { param: 'transmission', kind: 'range', min: 30, max: 60 },
          { param: 'electrodes', kind: 'range', min: 3, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 5) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'lathe',
    rate: { hours: q(16) },
    unbalanced_zh: '不锈钢 0.2 + 氧化铝 2 + 铜线 0.05 → 透镜 1 件；按件计，余是切屑',
  },

  {
    /**
     * **碰撞池：八极杆 + 氧化铝座 + H₂ 进气口。**
     *
     *   不锈钢 0.5 + 钼粉 0.05 + 氧化铝 2 → 池 1 件
     *   池压 0.02–0.1 Pa、传输 40–80 %、长 100–120 mm。
     *
     * 八极杆用钼（与四极杆同一种拉丝/磨圆手艺，只是短、不用配对）；
     * 杆间绝缘用氧化铝环，偏心 ≤0.05 mm。
     */
    id: 'make/icp-ms-collision-cell',
    name: 'ICP-MS 碰撞/反应池制造',
    produces: [
      {
        item: 'plant/icp-ms/collision-cell',
        qty: q(1),
        gives: [
          { param: 'cellPressure', kind: 'range', min: 0.02, max: 0.1 },
          { param: 'transmission', kind: 'range', min: 40, max: 80 },
          { param: 'length', kind: 'range', min: 100, max: 120 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/molybdenum-powder', qty: q(1, 20) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'lathe',
    rate: { hours: q(24) },
    unbalanced_zh: '不锈钢 0.5 + 钼粉 0.05 + 氧化铝 2 → 碰撞池 1 件；按件计，余是切屑与钼的磨削量',
  },

  {
    /**
     * **气路板：三路转子流量计 + 减压阀 + 电磁阀。**
     *
     *   不锈钢 0.8 + 铜 0.2 + PTFE 0.1 + 接触器 1 → 气路板 1 件
     *   0–20 L/min、±1–2 %、3–5 路。
     *
     * ⚠️ `plant/mfc` 只有 0–200 sccm = 0.2 L/min，比等离子体气小 65–75 倍 ——
     * 所以这一件必须另做（不是重复，是量程差两个数量级）。
     */
    id: 'make/icp-ms-gas-panel',
    name: 'ICP-MS 氩气路板制造',
    produces: [
      {
        item: 'plant/icp-ms/gas-panel',
        qty: q(1),
        gives: [
          { param: 'flowRange', kind: 'range', min: 0, max: 20 },
          { param: 'accuracy', kind: 'range', min: 1, max: 2 },
          { param: 'channels', kind: 'range', min: 3, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(4, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'lathe',
    rate: { hours: q(16) },
    unbalanced_zh: '不锈钢 0.8 + 铜 0.2 + PTFE 0.1 + 接触器 1 → 气路板 1 件；按件计',
  },

  {
    /**
     * **1 atm 箱体：3 mm 钢板折弯焊 + 玻璃观察窗 + 密封条。**
     *
     *   钢板 60 + PTFE 0.5 + 玻璃 1 → 箱体 1 件
     *   容积 0.6–1.0 m³、漏率 1e-4–5e-4 Pa·L/s。
     *
     * 保压试验：充 Ar 到 1.1 bar，关阀 24 h，压降 ≤2 %（= 漏率 5e-4 Pa·L/s）。
     * 本层没有氦检漏，1e-4 这一档是「压降法 + 酒精气泡」能给到的最好值。
     */
    id: 'make/icp-ms-enclosure',
    name: '1 atm 箱体制造',
    produces: [
      {
        item: 'plant/icp-ms/enclosure',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 0.6, max: 1 },
          { param: 'leakRate', kind: 'range', min: 1e-4, max: 5e-4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(60) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '3 mm 钢板折弯、氩弧焊六面（门框加 10 mm 折边）', performedBy: 'plant/sheet-shop' },
      { note_zh: '装玻璃观察窗与 PTFE 密封条、侧门铰链', performedBy: 'plant/robot' },
      { note_zh: '充 Ar 到 1.1 bar、关阀 24 h，压降 ≤2 % 判合格', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(40) },
    unbalanced_zh: '钢板 60 + PTFE 0.5 + 玻璃 1 → 箱体 1 件；余是折弯边角与焊材。按件计',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 9.2 ICP-MS 整机
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **ICP-MS 装配：13 件新零件 + 9 件复用件。**
     *
     *   雾化器 1 + 雾化室 1 + 蠕动泵 1 + 炬 1 + 线圈 1 + 27.12 MHz 发生器 1
     *   + 采样锥 1 + 截取锥 1 + 接口腔 1 + 透镜 1 + 碰撞池 1 + 气路板 1 + 箱体 1
     *   + **复用**：`plant/sims/quadrupole` 1 + `plant/sims/rf-driver` 1
     *     + `plant/sims/electron-multiplier` 1 + `plant/sims/faraday-cup` 1
     *     + `plant/euv-vacuum/pump/rough` 1 + `.../turbo` 2 + `.../cold-trap` 1
     *     + `.../gauge` 1
     *   + 接触器 2 → `plant/icp-ms` 1 台
     *
     * 六道工序：真空机组 → 接口 → 离子光学 → 源 → 检漏 → 调谐。
     *
     * ⚠️ **调谐那一步为什么不写 `under: pressure 1e-4`**：写了会触发
     * `condition_cycle` —— 造 `plant/icp-ms` 的路线又要它自己维持的条件。
     * 这是模型（不是设备）的边界：SIMS 用 `composedOf` 避开同一个坑，本机选了
     * 「装配路线 + gives」，所以把 1e-4 Pa 写在注释里（§六 也说了）。
     */
    id: 'make/icp-ms',
    name: 'ICP-MS 装配',
    produces: [
      {
        item: 'plant/icp-ms',
        qty: q(1),
        gives: [
          { param: 'measure/detectionLimit', kind: 'range', min: 0.05, max: 10, record: 'mat/icpms-trace-metals-record' },
          { param: 'measure/traceDetectionLimit', kind: 'range', min: 0.02, max: 2, record: 'mat/icpms-trace-metals-record' },
          { param: 'measure/boronDetectionLimit', kind: 'range', min: 3, max: 10, record: 'mat/icpms-trace-metals-record' },
          { param: 'measure/phosphorusDetectionLimit', kind: 'range', min: 1, max: 4, record: 'mat/icpms-trace-metals-record' },
          { param: 'elementCount', kind: 'range', min: 20, max: 22, record: 'mat/icpms-trace-metals-record' },
          { param: 'measure/massRange', kind: 'range', min: 2, max: 260, record: 'mat/icpms-trace-metals-record' },
          { param: 'measure/resolution', kind: 'range', min: 0.7, max: 1, record: 'mat/icpms-trace-metals-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/icp-ms/nebulizer', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/spray-chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/peristaltic-pump', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/torch', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/load-coil', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/rf-generator', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/sampler-cone', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/skimmer-cone', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/interface-housing', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/ion-lens', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/collision-cell', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/gas-panel', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/enclosure', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sims/quadrupole', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sims/rf-driver', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sims/electron-multiplier', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sims/faraday-cup', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-vacuum/pump/rough', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-vacuum/pump/turbo', qty: q(2) }] },
      { anyOf: [{ item: 'plant/euv-vacuum/pump/cold-trap', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-vacuum/pump/gauge', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(2) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/euv-vacuum'],
    steps: [
      { note_zh: '① 装真空机组：粗抽 + 2 台涡轮 + 冷阱 + 皮拉尼/热偶（三级差分，膨胀腔 100–300 Pa / 中间腔 0.05–0.2 Pa / 分析腔 1e-4–1e-3 Pa）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 装接口腔与采样/截取锥：两锥同轴 0.05–0.1 mm、间距 7 mm（比较仪对中）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 装离子透镜、碰撞池与四极杆（复用 SIMS 的杆/驱动/倍增器/法拉第杯；杆轴与入口光阑同轴 0.05 mm）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 装炬管、3 匝线圈与 27.12 MHz 发生器：炬口到采样锥 10–12 mm，线圈上沿对准等离子体中心', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '⑤ 粗抽检漏：接 euv-vacuum 抽到 1e-2–1e-1 Pa，关阀 1 h 压升 ≤1e-3 Pa·L/s；没有氦检漏，1e-4 档判不了', performedBy: 'plant/robot', under: [{ param: 'pressure', min: 1e-2, max: 1e-1 }] },
      { note_zh: '⑥ 调谐：Ar 15 L/min 点炬（1.2–1.6 kW）、自己的涡轮抽到 1e-4 Pa、In/La/Ba 调谐液 —— LaO/La ≤2 %、Ba²⁺/Ba⁺ ≤3 %、灵敏度 2e5–1e6 cps/ppb、峰宽 0.7–1.0 u', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(120) },
    unbalanced_zh:
      '22 件零件（13 新 + 9 复用）→ ICP-MS 1 台；按件计，不做质量账。装配 120 h（含抽真空、检漏与调谐 3 天）',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 9.3 GC-MS 零件
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **进样口：分流/不分流 + 1 mL 气体定量环。**
     *
     *   不锈钢 0.5 + PTFE 0.05 + 热电偶 1 + 铜线 0.05 → 进样口 1 件
     *   250–300 °C、分流 5–20、定量环 1 mL。
     *
     * ⚠️ 气体样的阀片用**镍**不用 PTFE：NH₃ 会溶胀 PTFE、把阀粘住。
     */
    id: 'make/gc-ms-injector',
    name: 'GC-MS 进样口制造',
    produces: [
      {
        item: 'plant/gc-ms/injector',
        qty: q(1),
        gives: [
          { param: 'temperature', kind: 'range', min: 250, max: 300 },
          { param: 'splitRatio', kind: 'range', min: 5, max: 20 },
          { param: 'loopVolume', kind: 'range', min: 1, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 20) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
    ],
    needs: [],
    performedBy: 'lathe',
    rate: { hours: q(12) },
    unbalanced_zh: '不锈钢 0.5 + PTFE 0.05 + 热电偶 1 + 铜线 0.05 → 进样口 1 件；按件计',
  },

  {
    /**
     * **毛细管柱：拉管 → 涂布 → 交联。**
     *
     *   石英 0.05 + 甲基三氯硅烷 0.02 → 柱 1 根（30 m）
     *
     * 三步：
     *   ① 玻璃车床 1900–2200 °C 把 φ6 石英管拉成 φ0.25（拉丝速度 1–3 m/s）
     *   ② 甲基三氯硅烷水解成聚甲基硅氧烷，配成 5 % 溶液静态涂布（0.25 µm 膜）
     *   ③ 电阻炉 250–280 °C 交联 4 h，甲苯冲出未交联部分
     *
     * 9×10⁴ 板、柱效 3000 板/m；膜厚 0.2–0.3 µm。
     */
    id: 'make/gc-ms-column',
    name: 'GC-MS 毛细管柱制造',
    produces: [
      {
        item: 'plant/gc-ms/capillary-column',
        qty: q(1),
        gives: [
          { param: 'length', kind: 'range', min: 25, max: 30 },
          { param: 'innerDiameter', kind: 'range', min: 0.24, max: 0.26 },
          { param: 'filmThickness', kind: 'range', min: 0.2, max: 0.3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/methyl-trichlorosilane', qty: q(1, 50) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '拉 φ0.25 mm 毛细管（φ6 石英管在玻璃车床上拉，1900–2200 °C）', performedBy: 'plant/glass-lathe', under: [{ param: 'temperature', min: 1900, max: 2200 }] },
      { note_zh: '静态涂布：甲基三氯硅烷水解物配 5 % 溶液，0.25 µm 膜', performedBy: 'plant/robot' },
      { note_zh: '交联 250–280 °C × 4 h，甲苯冲出未交联部分', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 250, max: 280 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '石英 0.05 + 甲基三氯硅烷 0.02 → 柱 1 根；余是拉管废品（一根 30 m 柱要 40–60 m 毛管）',
  },

  {
    /**
     * 柱温箱炉体：钢板箱体，8 kg 薄板剪折焊。
     */
    id: 'make/gc-ms-oven-shell',
    name: '柱箱炉壳制造',
    produces: [{ item: 'plant/gc-ms/column-oven/shell', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(8) }] }],
    needs: [],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(8) },
    unbalanced_zh: '钢板 8 → 炉体 1 件；按件计',
  },

  {
    /**
     * 柱温箱保温层：矿棉 1 kg，填在炉体与内胆之间。
     */
    id: 'make/gc-ms-oven-insulation',
    name: '柱箱保温制造',
    produces: [{ item: 'plant/gc-ms/column-oven/insulation', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/mineral-wool', qty: q(1) }] }],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(2) },
    unbalanced_zh: '矿棉 1 → 保温层 1 件；按件计',
  },

  {
    /**
     * 柱温箱加热器：铜线 0.3 kg 绕在炉体内壁。
     */
    id: 'make/gc-ms-oven-heater',
    name: '柱箱加热丝制造',
    produces: [{ item: 'plant/gc-ms/column-oven/heater', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/copper-wire', qty: q(3, 10) }] }],
    needs: [],
    performedBy: 'plant/winder',
    rate: { hours: q(4) },
    unbalanced_zh: '铜线 0.3 → 加热器 1 件；按件计',
  },

  {
    /**
     * **柱温箱：40–320 °C、程序升温。**
     *
     * 总装：炉体 + 保温层 + 加热器 + 控温器 + 热电偶 + 接触器。
     * 子件路线见 make/gc-ms-oven-shell / -insulation / -heater。
     */
    id: 'make/gc-ms-oven',
    name: 'GC-MS 柱温箱制造',
    produces: [
      {
        item: 'plant/gc-ms/column-oven',
        qty: q(1),
        gives: [
          { param: 'temperature', kind: 'range', min: 40, max: 320 },
          { param: 'rampRate', kind: 'range', min: 1, max: 20 },
          { param: 'stability', kind: 'range', min: 0.05, max: 0.2 },
        ],
      },
    ],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(16) },
    unbalanced_zh: '炉体/保温层/加热器 + 控温器/热电偶/接触器各 1 → 柱温箱 1 件；按件计',
  },

  {
    /**
     * **EI 源：70 eV 灯丝 + 电离室 + 氧化铝绝缘。**
     *
     *   钨粉 0.005（灯丝）+ 不锈钢 0.2 + 氧化铝 2 + 铜线 0.02 → 源 1 件
     *   70 eV、20–100 µA、220–260 °C。
     *
     * 灯丝是 φ0.15 钨丝绕成 1.5 mm 螺旋；寿命 800–1500 h（与 SIMS 一次源同一笔账）。
     */
    id: 'make/gc-ms-ei-source',
    name: 'EI 源制造',
    produces: [
      {
        item: 'plant/gc-ms/ei-source',
        qty: q(1),
        gives: [
          { param: 'electronEnergy', kind: 'range', min: 70, max: 70 },
          { param: 'emissionCurrent', kind: 'range', min: 20, max: 100 },
          { param: 'temperature', kind: 'range', min: 220, max: 260 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 5) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 50) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '车源盒与电离室（φ6 腔、出口 φ1 mm）', performedBy: 'lathe' },
      { note_zh: '绕 φ0.15 钨灯丝（1.5 mm 螺旋，圈距 0.4）', performedBy: 'plant/robot' },
      { note_zh: '装氧化铝绝缘与 70 eV 引出极，冷态测绝缘 >1e12 Ω', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(20) },
    unbalanced_zh: '钨粉 0.005 + 不锈钢 0.2 + 氧化铝 2 + 铜线 0.02 → EI 源 1 件；按件计',
  },

  {
    /**
     * **传输线：φ0.25 内衬管 + 铜加热块 + 热电偶。**
     *
     *   不锈钢 0.3 + 铜线 0.1 + 热电偶 1 + 矿棉 0.2 → 传输线 1 件
     *   200–300 mm、内径 0.25–0.3 mm（死体积 <1 µL）、260–300 °C。
     */
    id: 'make/gc-ms-transfer-line',
    name: 'GC-MS 传输线制造',
    produces: [
      {
        item: 'plant/gc-ms/transfer-line',
        qty: q(1),
        gives: [
          { param: 'length', kind: 'range', min: 200, max: 300 },
          { param: 'innerDiameter', kind: 'range', min: 0.25, max: 0.3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1, 5) }] },
    ],
    needs: [],
    performedBy: 'lathe',
    rate: { hours: q(8) },
    unbalanced_zh: '不锈钢 0.3 + 铜线 0.1 + 热电偶 1 + 矿棉 0.2 → 传输线 1 件；按件计',
  },

  {
    /**
     * **四极杆适配器：把 SIMS 的杆装进 GC-MS 的腔。**
     *
     *   不锈钢 1.2 + 铜 0.2（CF 铜垫）+ 氧化铝 2 → 适配器 1 件
     *   CF100、同轴 0.05–0.1 mm。
     *
     * **这是全套复用关系里唯一的新接口**：`plant/sims/quadrupole` 的石英座
     * （r0 4 mm）经这一件转到 GC-MS 的 CF100 法兰上，杆轴与入口光阑 φ3 mm 同轴。
     */
    id: 'make/gc-ms-analyzer-adapter',
    name: 'GC-MS 四极杆适配器制造',
    produces: [
      {
        item: 'plant/gc-ms/analyzer-adapter',
        qty: q(1),
        gives: [
          { param: 'flangeSize', kind: 'range', min: 100, max: 150 },
          { param: 'alignment', kind: 'range', min: 0.05, max: 0.1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(6, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'lathe',
    rate: { hours: q(14) },
    unbalanced_zh: '不锈钢 1.2 + 铜 0.2 + 氧化铝 2 → 适配器 1 件；按件计',
  },

  {
    /**
     * **活性炭吸附管：玻璃管 + 活性炭 + 石英棉。**
     *
     *   活性炭 0.0012 + 玻璃 0.006 + 石英 0.0012 → 管 6 支
     *   每支 0.1–0.2 g 炭、容量 5–10 mg、本底 1–5 ng。
     *
     * 一次做 6 支（3 支现场样 + 1 支空白 + 2 支备用），与 `std/motor` 的
     * 「一炉多件」同一个批量逻辑。玻璃车床收 φ6 管、两端塞石英棉。
     */
    id: 'make/gc-ms-adsorbent-tube',
    name: '活性炭吸附管制造',
    produces: [
      {
        item: 'mat/gc-ms-adsorbent-tube',
        qty: q(6),
        gives: [
          { param: 'adsorbentMass', kind: 'range', min: 0.1, max: 0.2 },
          { param: 'capacity', kind: 'range', min: 5, max: 10 },
          { param: 'blank', kind: 'range', min: 1, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/carbon', qty: q(3, 2500) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(3, 500) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(3, 2500) }] },
    ],
    needs: [],
    performedBy: 'plant/glass-lathe',
    rate: { hours: q(4) },
    unbalanced_zh:
      '活性炭 0.0012 + 玻璃 0.006 + 石英 0.0012 → 吸附管 6 支；余是玻璃头与炭粉（每支装 0.15 g，装完封口）',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 9.4 GC-MS 整机
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **GC-MS 装配：6 件新零件 + 复用件。**
     *
     *   进样口 1 + 柱 1 + 柱温箱 1 + EI 源 1 + 传输线 1 + 适配器 1
     *   + **复用**：`plant/sims/quadrupole` 1 + `plant/sims/rf-driver` 1
     *     + `plant/sims/electron-multiplier` 1
     *     + `plant/euv-vacuum/pump/rough` 1 + `.../turbo` 2 + `.../cold-trap` 1
     *     + `.../gauge` 1
     *   + 接触器 2 + 钢板 40（机架）→ `plant/gc-ms` 1 台
     *
     * 五道工序：真空 → 四极杆 → 进样/柱 → 检漏 → 调谐（EI + H₂ 载气）。
     *
     * ⚠️ 调谐不写 `under: pressure 1e-4` 的理由同 `make/icp-ms`：会撞
     * `condition_cycle`（§六）。
     */
    id: 'make/gc-ms',
    name: 'GC-MS 装配',
    produces: [
      {
        item: 'plant/gc-ms',
        qty: q(1),
        gives: [
          { param: 'detectionLimit', kind: 'range', min: 0.1, max: 1, record: 'mat/gcms-volatile-organic-record' },
          { param: 'compoundCount', kind: 'range', min: 20, max: 30, record: 'mat/gcms-volatile-organic-record' },
          { param: 'massRange', kind: 'range', min: 10, max: 300, record: 'mat/gcms-volatile-organic-record' },
          { param: 'resolution', kind: 'range', min: 0.7, max: 1, record: 'mat/gcms-volatile-organic-record' },
          { param: 'rtRepeatability', kind: 'range', min: 0.5, max: 3, record: 'mat/gcms-volatile-organic-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/gc-ms/injector', qty: q(1) }] },
      { anyOf: [{ item: 'plant/gc-ms/capillary-column', qty: q(1) }] },
      { anyOf: [{ item: 'plant/gc-ms/column-oven', qty: q(1) }] },
      { anyOf: [{ item: 'plant/gc-ms/ei-source', qty: q(1) }] },
      { anyOf: [{ item: 'plant/gc-ms/transfer-line', qty: q(1) }] },
      { anyOf: [{ item: 'plant/gc-ms/analyzer-adapter', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sims/quadrupole', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sims/rf-driver', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sims/electron-multiplier', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-vacuum/pump/rough', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-vacuum/pump/turbo', qty: q(2) }] },
      { anyOf: [{ item: 'plant/euv-vacuum/pump/cold-trap', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-vacuum/pump/gauge', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(40) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/euv-vacuum'],
    steps: [
      { note_zh: '① 装真空机组：粗抽 + 2 台涡轮 + 冷阱 + 真空计（分析腔 1e-4–1e-3 Pa）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 装适配器与四极杆：复用 SIMS 的杆/驱动/倍增器，杆轴与入口光阑 φ3 mm 同轴 0.05–0.1 mm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 装进样口、柱温箱与毛细管柱：柱两端各留 10 mm，石墨垫密封；进样口 250 °C、传输线 280 °C', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 粗抽检漏：接 euv-vacuum 抽到 1e-2–1e-1 Pa，关阀 1 h 压升 ≤1e-3 Pa·L/s', performedBy: 'plant/robot', under: [{ param: 'pressure', min: 1e-2, max: 1e-1 }] },
      { note_zh: '⑤ 调谐：H₂ 载气 1 mL/min、EI 70 eV/50 µA，进 5 点标液 —— 甲苯 91 的峰宽 0.7–1.0 u、保留时间重复性 ≤3 %、SIM 检出限 0.1–1 ppm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(100) },
    unbalanced_zh:
      '21 件零件（6 新 + 7 复用 + 接触器/钢板）→ GC-MS 1 台；按件计，装配 100 h（含抽真空、检漏与五点调谐）',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 9.5 亚沸蒸馏
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **亚沸瓶：PTFE 车削。**
     *   参考 1.5–2 L、壁厚 3–4 mm。
     */
    id: 'make/sub-boiling-still-flask',
    name: '亚沸蒸馏器亚沸瓶制造',
    produces: [
      {
        item: 'plant/sub-boiling-still/flask',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 1.5, max: 2 },
          { param: 'wallThickness', kind: 'range', min: 3, max: 4 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/ptfe', qty: q(7, 10) }] }],
    needs: [],
    performedBy: 'lathe',
    rate: { hours: q(10) },
    unbalanced_zh: 'PTFE 0.7 → 亚沸瓶 1 件；余是车屑。按件计',
  },

  {
    /**
     * **冷凝柱：PTFE 管车内螺旋槽。**
     *   400–600 mm、冷凝面 0.15–0.25 m²（内壁拉毛增加凝结核）。
     */
    id: 'make/sub-boiling-still-condenser',
    name: '亚沸蒸馏器冷凝柱制造',
    produces: [
      {
        item: 'plant/sub-boiling-still/condenser',
        qty: q(1),
        gives: [
          { param: 'length', kind: 'range', min: 400, max: 600 },
          { param: 'surfaceArea', kind: 'range', min: 0.15, max: 0.25 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/ptfe', qty: q(2, 5) }] }],
    needs: [],
    performedBy: 'lathe',
    rate: { hours: q(12) },
    unbalanced_zh: 'PTFE 0.4 → 冷凝柱 1 件；余是车屑与螺旋槽的料。按件计',
  },

  {
    /**
     * **红外加热器：石英罩 + 钨丝灯芯 + 铝反射罩 + 热电偶。**
     *   150–300 W、辐射峰 1.2–2.5 µm。
     */
    id: 'make/sub-boiling-still-ir-heater',
    name: '亚沸蒸馏器红外加热器制造',
    produces: [
      {
        item: 'plant/sub-boiling-still/ir-heater',
        qty: q(1),
        gives: [
          { param: 'power', kind: 'range', min: 150, max: 300 },
          { param: 'wavelength', kind: 'range', min: 1.2, max: 2.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(6) },
    unbalanced_zh: '石英 0.05 + 钨粉 0.005 + 铜线 0.05 + 热电偶 1 → 加热器 1 件；按件计',
  },

  {
    /**
     * **接收瓶：PTFE 瓶 + 磨口 + 0.2 µm 排气过滤。**
     */
    id: 'make/sub-boiling-still-receiver',
    name: '亚沸蒸馏器接收瓶制造',
    produces: [
      {
        item: 'plant/sub-boiling-still/receiver',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 0.5, max: 1 },
          { param: 'neckId', kind: 'range', min: 30, max: 40 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/ptfe', qty: q(3, 10) }] }],
    needs: [],
    performedBy: 'lathe',
    rate: { hours: q(6) },
    unbalanced_zh: 'PTFE 0.3 → 接收瓶 1 件；余是车屑。按件计',
  },

  {
    /**
     * **亚沸蒸馏器装配：四件 + 控温器 + 接触器。**
     *
     *   瓶 1 + 柱 1 + 加热器 1 + 接收瓶 1 + 控温器 1 + 接触器 1 + 钢板 3 → 1 台
     *
     * `holds` 40–120 °C 由加热器 + 热电偶 + 控温器给；throughput 200–500 mL/天。
     * 装配完要**试漏与试蒸**：装 1 L 水、60 °C 蒸 4 h，看馏出 30–50 mL/h。
     */
    id: 'make/sub-boiling-still',
    name: '亚沸蒸馏器装配',
    produces: [
      {
        item: 'plant/sub-boiling-still',
        qty: q(1),
        gives: [{ param: 'throughput', kind: 'range', min: 200, max: 500 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/sub-boiling-still/flask', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sub-boiling-still/condenser', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sub-boiling-still/ir-heater', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sub-boiling-still/receiver', qty: q(1) }] },
      { anyOf: [{ item: 'std/temp-controller-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(3) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '装瓶、柱、加热器与接收瓶（磨口涂 PTFE 脂，不许用硅脂）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '接热电偶与控温器（40–120 °C 可调）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '试蒸：1 L 水、60 °C、4 h，馏出 30–50 mL/h 判合格', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '四件 + 控温器/接触器 + 钢板 3 → 亚沸蒸馏器 1 台；按件计',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 9.6 两种亚沸酸
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **亚沸硝酸：1200 kg 工业酸 → 1000 kg 亚沸酸（67–69 %、金属 10–50 ppt）。**
     *
     *   硝酸 1200 + 超纯水 30 → 亚沸硝酸 1000
     *
     * 60–90 °C（HNO₃ 65 % 沸点 121 °C，亚沸留 30–60 °C 余量）、
     * 400–600 mm 冷凝柱、回流比 5–10:1。
     *
     * ⚠️ 余 230 kg：前馏分 30（回用）+ 残液 200（金属富集 3–30 倍，
     * 回 `make/nitric-acid` 的工业酸罐）。
     */
    id: 'make/nitric-acid-subboiled',
    name: '亚沸硝酸制备',
    produces: [
      {
        item: 'mat/nitric-acid-subboiled',
        qty: q(1000),
        gives: [
          { param: 'concentration', kind: 'range', min: 67, max: 69 },
          { param: 'metals', kind: 'range', min: 10, max: 50 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1200) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(30) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    performedBy: 'plant/sub-boiling-still',
    under: [{ param: 'temperature', min: 60, max: 90 }],
    rate: { hours: q(96) },
    unbalanced_zh:
      '硝酸 1200 + 超纯水 30 → 亚沸硝酸 1000；余 230 = 前馏分 30（回用）+ 残液 200（金属富集 3–30 倍，回工业酸罐）',
  },

  {
    /**
     * **亚沸盐酸：1200 kg 工业酸 → 1000 kg 亚沸酸（32–35 %、金属 10–50 ppt）。**
     *
     *   盐酸 1200 + 超纯水 30 → 亚沸盐酸 1000
     *
     * 40–60 °C：HCl 37 % 沸点 48 °C，再高就把 HCl 赶光（馏出液稀到 20 % 以下）。
     */
    id: 'make/hcl-subboiled',
    name: '亚沸盐酸制备',
    produces: [
      {
        item: 'mat/hcl-subboiled',
        qty: q(1000),
        gives: [
          { param: 'concentration', kind: 'range', min: 32, max: 35 },
          { param: 'metals', kind: 'range', min: 10, max: 50 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/hcl', qty: q(1200) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(30) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    performedBy: 'plant/sub-boiling-still',
    under: [{ param: 'temperature', min: 40, max: 60 }],
    rate: { hours: q(80) },
    unbalanced_zh:
      '盐酸 1200 + 超纯水 30 → 亚沸盐酸 1000；余 230 = 前馏分 30（回用）+ 残液 200（金属富集，回工业酸罐）',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 9.7 三种标液
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **单元素标液：0.1 g 纯元素 + 亚沸酸 + 超纯水 → 1 瓶（100 mL、1000 µg/mL）。**
     *
     *   anyOf 22 个纯元素/纯氧化物（每个 0.1 g）：
     *     16 纯金属 Cu/Zn/Fe/Ni/Al/Mg/Ti/Ag/Au/Pb/Sn/In/Ga/Ge/As/Se
     *     ＋ Mo、W 粉；P（白磷）、B（B₂O₃）；La（La₂O₃）、Ba（BaCO₃）
     *   ＋ 亚沸 HNO₃ 5 g、亚沸 HCl 2 g（Ag/Au/Pb 要王水）、超纯水 93 g
     *
     * 不确定度 0.5–10 %：14 个金属 0.5–1.5 %；As（99.5 %）与 Se（90–99.9 %）
     * 的单质纯度不够 ⇒ 5–10 %（缺口 ⑫）。
     *
     * ⚠️ 22 个选项是 anyOf（一批只溶一种），但模型会把它们的量全加起来 ——
     * 产物按「瓶」计，不做质量账，所以这一条不会被 `unbalanced` 拦。
     */
    id: 'make/icp-single-element-standard',
    name: '单元素标液制备',
    produces: [
      {
        item: 'mat/icp-single-element-standard',
        qty: q(1),
        gives: [
          { param: 'concentration', kind: 'range', min: 995, max: 1005 },
          { param: 'uncertainty', kind: 'range', min: 0.5, max: 10 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          { item: 'mat/copper', qty: q(1, 10000) },
          { item: 'mat/zinc', qty: q(1, 10000) },
          { item: 'mat/iron', qty: q(1, 10000) },
          { item: 'mat/nickel', qty: q(1, 10000) },
          { item: 'mat/aluminium', qty: q(1, 10000) },
          { item: 'mat/magnesium', qty: q(1, 10000) },
          { item: 'mat/titanium', qty: q(1, 10000) },
          { item: 'mat/silver', qty: q(1, 10000) },
          { item: 'mat/gold', qty: q(1, 10000) },
          { item: 'mat/lead', qty: q(1, 10000) },
          { item: 'mat/tin', qty: q(1, 10000) },
          { item: 'mat/indium', qty: q(1, 10000) },
          { item: 'mat/gallium', qty: q(1, 10000) },
          { item: 'mat/germanium-metal', qty: q(1, 10000) },
          { item: 'mat/arsenic', qty: q(1, 10000) },
          { item: 'mat/selenium', qty: q(1, 10000) },
          { item: 'mat/molybdenum-powder', qty: q(1, 10000) },
          { item: 'mat/tungsten-powder', qty: q(1, 10000) },
          { item: 'mat/phosphorus', qty: q(1, 10000) },
          { item: 'mat/boron-oxide', qty: q(1, 10000) },
          { item: 'mat/lanthanum-oxide', qty: q(1, 10000) },
          { item: 'mat/barium-carbonate', qty: q(1, 10000) },
        ],
      },
      { anyOf: [{ item: 'mat/nitric-acid-subboiled', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/hcl-subboiled', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(93, 1000) }] },
    ],
    needs: ['plant/micro-balance', 'plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '① 称 0.1 g 纯元素（微量天平 ±0.1 mg）进 100 mL PTFE 烧杯（石英会掉钠，不许用）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 加 5 g 亚沸 HNO₃（Ag/Au/Pb 加 2 g 亚沸 HCl 配王水），60–80 °C 溶到澄清', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 定容 100 mL：超纯水到刻度，摇匀；瓶上记元素、批号、称量与不确定度', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(8) },
  },

  {
    /**
     * **调谐液：In 115 / La 139 / Ba 137，各 10 µg/mL。**
     *
     *   铟 0.00001 + 氧化镧 0.00001 + 碳酸钡 0.00001 + 亚沸 HNO₃ 5 g
     *   + 超纯水 95 g → 1 瓶
     *
     * 10 mg/kg = 10 µg/g ≈ 10 µg/mL。三样都有产出路线（`make/indium`、
     * `make/lanthanum-oxide`、`make/barium-carbonate`）。
     */
    id: 'make/icp-tuning-solution',
    name: '调谐液制备',
    produces: [
      {
        item: 'mat/icp-tuning-solution',
        qty: q(1),
        gives: [
          { param: 'concentration', kind: 'range', min: 9, max: 11 },
          { param: 'elementCount', kind: 'range', min: 3, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/indium', qty: q(1, 100000) }] },
      { anyOf: [{ item: 'mat/lanthanum-oxide', qty: q(1, 100000) }] },
      { anyOf: [{ item: 'mat/barium-carbonate', qty: q(1, 100000) }] },
      { anyOf: [{ item: 'mat/nitric-acid-subboiled', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(19, 200) }] },
    ],
    needs: ['plant/micro-balance', 'plant/clean-room', 'plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(6) },
  },

  {
    /**
     * **GC-MS 五点标准：5 个组分各 10 mg、异丙醇定容 100 mL。**
     *
     *   甲醇 0.00001 + 丙酮 0.00001 + 甲苯 0.00001 + 苯乙烯 0.00001
     *   + 苯酚 0.00001 + 异丙醇 78 g → 1 瓶（5 个组分各 10 µg/mL）
     *
     * 60–80 °C 水浴溶解苯酚，冷却后定容；瓶口用 PTFE 垫，不许用橡胶垫
     * （异丙醇把橡胶里的增塑剂洗出来，那就是假峰）。
     */
    id: 'make/gcms-calibration-standard',
    name: 'GC-MS 五点标准制备',
    produces: [
      {
        item: 'mat/gcms-calibration-standard',
        qty: q(1),
        gives: [
          { param: 'concentration', kind: 'range', min: 5, max: 20 },
          { param: 'compoundCount', kind: 'range', min: 5, max: 5 },
          { param: 'solvent', kind: 'enum', oneOf: ['isopropanol'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/methanol', qty: q(1, 100000) }] },
      { anyOf: [{ item: 'mat/acetone', qty: q(1, 100000) }] },
      { anyOf: [{ item: 'mat/toluene', qty: q(1, 100000) }] },
      { anyOf: [{ item: 'mat/styrene', qty: q(1, 100000) }] },
      { anyOf: [{ item: 'mat/phenol', qty: q(1, 100000) }] },
      { anyOf: [{ item: 'mat/isopropanol', qty: q(39, 500) }] },
    ],
    needs: ['plant/micro-balance', 'plant/clean-room', 'plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(6) },
  },

];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...TRACE_ANALYSIS_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...TRACE_ANALYSIS_ROUTES];
