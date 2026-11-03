/**
 * CMOS 的源漏 + 200–400 nm 反相器测试结构 —— LDD 之后做 S/D、激活、C49，
 * 再在 damascene-layer 上做单级反相器。
 *
 * 顺序（本轮修正）：
 *
 *   mat/ldd-wafer（栅 + 侧墙都在）
 *     → make/cmos-nsd（P⁺ 源漏，用栅/侧墙自对准）
 *     → make/implant-p-source-drain（Al⁺ 源漏）
 *     → make/cmos-activation（RTA 1000–1050 °C / 10 s）
 *     → mat/cmos-sd-wafer
 *     → make/cmos-silicide（产 mat/silicide-wafer，C49）
 *     → 现有 make/device-wafer
 *
 * 为什么选 `mat/ldd-wafer` 而不是 `mat/gate-electrode-wafer`：
 * `make/ldd-spacer-oxide`（gate-stack.ts:846–923）已经把栅与 40–55 nm 侧墙
 * 做在 `mat/ldd-wafer` 上；源漏注入要的正是“栅 + 侧墙”做自对准掩模。
 * 从 `mat/gate-electrode-wafer` 起步会缺侧墙，源漏会压到栅边缘。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 诚实边界：这一步只证明“顺序能接上”，不证明电学成立
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **没有 B⁺，PMOS 源漏未真正闭合。** p⁺ 只能用 Al⁺（27 amu）替代 B⁺
 *      （11 amu）。1–2e15 cm⁻² 在 0.15 µm 里是 5e20–1.3e21 cm⁻³，而 Al 在 Si
 *      的固溶度 ~5e18 cm⁻³（估算）⇒ **超 100–260 倍**，Al 会析出/团簇。
 *      p⁺ 只能算**候选、不保证**；`mat/cmos-sd-wafer` 不能写成“已闭合”。
 *      升级：B⁺ 要硼源（BF₃ / B₂H₆）；本层无硼矿，只有进口硼砂/硼酸（种子）
 *      或风化层 ppm 级硼富集，富集比差 **10³–10⁴ 倍**。B 源补上之前，p⁺ 不算闭合。
 *
 *   ② **p-LDD 没有。** 现有 `make/ldd-spacer-oxide` 用磷硅玻璃（PSG）开窗
 *      （gate-stack.ts:860–874），只做 n-LDD；p⁺ 源漏直接注进 n 阱，
 *      没有 p-LDD。PMOS 的 S/D 结因此更陡、更漏，未做。
 *      升级：p-LDD 同样卡在 B⁺（BF₂/B 低剂量）；Al 低剂量可作降级路线，
 *      但 Al 的扩散/固溶度问题仍在——先补硼源，再谈 p-LDD。
 *
 *   ③ **结深语义按 LDD 的 300–400 nm 对齐。** `mat/ldd-wafer` 的
 *      `junctionDepth` 是 300–400 nm（gate-stack.ts:851–855）。本文件最终
 *      `mat/cmos-sd-wafer` 也用 **0.3–0.4 µm**：P⁺/Al⁺ 100 keV 的 135 nm
 *      只是**接触注入**，落在 LDD 里面；最终结深由 LDD 的 300–400 nm 定，
 *      不是由 100 keV 的 Rp 定。这与上一版“0.15–0.3 µm”不同：上一版把
 *      S/D 当独立浅结，和 LDD 300–400 对不上；本轮改为 LDD 定义结深。
 *
 *   ④ **结深测不了。** SEM 剖面要切片，e-beam 剖面束斑 12 nm
 *      （gate-stack.ts:1336）；`plant/probe-station` 只能测方阻。
 *      `junctionDepth` 与两个方阻是设计值/估算，不是实测；没有 SIMS/C-V。
 *
 *   ⑤ **只到“S/D + C49 + C54 + 反相器测试结构”。** 接触孔、双阱套刻、
 *      VTC 实测都仍有限制。`make/device-wafer` 现在只吃 `mat/c54-silicide-wafer`
 *      + 水（gate-stack.ts 已拆）；C49 由 `make/rtp-silicide-c54` 转成 C54，
 *      高 k 走并列的 `make/device-wafer-highk` —— 两条支路不是 AND。
 *
 *   ⑥ **p⁺ 剂量超固溶度。** 见①；`sheetResistanceP` 的 30 Ω/□ 是“全部激活”
 *      的理想值，1500 Ω/□ 是固溶度封顶的估算；两者不是同一个物理状态。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 200–400 nm 反相器测试结构（接在 damascene-layer 之后）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 链路：
 *
 *   mat/cmos-sd-wafer
 *     → make/cmos-silicide → mat/silicide-wafer
 *     → make/rtp-silicide-c54 → mat/c54-silicide-wafer
 *     → make/device-wafer → mat/device-wafer
 *     → make/damascene-trench … make/damascene-stack → mat/damascene-layer
 *     → make/cmos-inverter → std/cmos-inverter-general
 *     → measure/cmos-vtc → mat/cmos-vtc-record
 *
 * 这是 **200–400 nm 档、5 µm 版、Vdd 5 V** 的单级反相器测试结构，
 * **不是 40 nm MCU**。输入/输出各 1 个 Al pad，另有 Vdd/GND 两个 pad
 * （共 4 个 100×100 µm pad，正好一台四探针台）；1 层金属；Al 互连 5 µm。
 *
 * p⁺ 仍是 Al 候选（超固溶度 100–260×），所以 `vt`/`gain` 只能算**设计窗口**；
 * 本文件不声称“CMOS 工艺闭合”。VTC 用 `plant/cmos-test/parameter-analyzer`
 * 扫 0–5 V 共 51 点；gain 是有限差分，noiseMargin 从 VTC 上估。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 接触 TLM 测试结构（接在 mat/device-wafer 之后，不动反相器接线）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   mat/device-wafer
 *     → make/cmos-contact-tlm → std/contact-tlm-general
 *     → measure/contact-resistance → mat/contact-resistance-record
 *
 * 这是 **TLM 测试结构，不是完整接触孔/通孔**：4 个 100×100 µm Al pad，
 * 间距 5/10/20 µm；Al 直接接触 p⁺/n⁺，**没有 W plug**；TiN 3 nm 只是阻挡层；
 * SOG 带钠（测试结构 only）。接触电阻仍是设计/估算，**测出来才算**。
 * 升级：W plug（WF₆ CVD；本层无 WF₆，要补钨卤化物路线）或完整接触孔
 * + TiN/Al 叠层；在那之前只按 TLM 外推，不外推到反相器。
 *
 * 算式：
 *   L_t = √(ρc / R_sheet)
 *   R_total(L) = 2R_c + R_sheet·L/W
 *   R_c = √(ρc·R_sheet)/W（L_c ≫ L_t）
 *   ρc = R_c²·W² / R_sheet
 *
 * W = 100 µm；间距 5/10/20 µm；设计窗口 ρc 1e-6–1e-5 Ω·cm²、
 * R_sheet 50–500 Ω/□、L_t 1–15 µm。只有 probe-station 的三点四线法，
 * 没有 TLM 曲线仪/变温台。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * Al 接触孔（接在 mat/device-wafer 之后，不做 W plug）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   mat/device-wafer
 *     → make/cmos-contact-hole → mat/contacted-wafer
 *     → measure/contact-hole-resistance → mat/contact-hole-record
 *
 * 这是 **Al 接触孔，不是 W plug**：没有钨塞、没有 CVD W；SOG 带钠仅测试结构；
 * RIE 无终点；接触电阻**测出来才算**。孔直径 1–2 µm、TiN 3–5 nm、每孔
 * 设计 30–1500 Ω。
 *
 * 每孔接触电阻：
 *   R_c ≈ ρc/A + R_spread，A = π(d/2)²
 *   d = 1–2 µm、ρc = 1e-6–1e-5 Ω·cm² ⇒ A = 7.85e-9–3.14e-8 cm²
 *   ⇒ ρc/A = 32–1274 Ω；加 TiN/Al 界面与扩散，取 30–1500 Ω/孔。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 反相器专用 6 孔接触（并列，保留 damascene 支路作对照）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   mat/device-wafer
 *     → make/cmos-inverter-contact → mat/inverter-contacted-wafer
 *     → make/cmos-inverter-contacted → std/cmos-inverter-general
 *     → measure/cmos-vtc → mat/cmos-vtc-record
 *
 * 孔位按反相器版图，不是 TLM/接触孔测试阵列：
 *   PMOS 源 → Vdd
 *   NMOS 源 → GND
 *   PMOS 漏 → OUT
 *   NMOS 漏 → OUT
 *   PMOS 栅 → IN
 *   NMOS 栅 → IN
 *
 * 5 µm 规则下的排布（详见 make/cmos-inverter-contact 注释）：
 *   孔 1–2 µm、孔间距 2–3 µm；每管 3 孔一排 = 1+2+1+2+1 = 7 µm（1 µm 孔），
 *   两管 + 5 µm 阱间距 = 7+5+7 = **19 µm**；2 µm 孔/3 µm 间距 = 29 µm。
 *   高 ~6–8 µm，单元 20–30 µm —— **6 孔排得下**。套刻 ±0.25 µm。
 *
 * **版图是设计输入，不是制造缺口**：`std/inverter-layout-general` 给 5 层图形
 * （有源/栅/接触/金属/pad）、minFeature 5 µm、die 30×25 µm；本层不模拟坐标/DRC，
 * 也没有产出路线。6 孔坐标来自这套版图，版图与接触孔同源 —— 孔相对管子的位置
 * 由设计定义，不再靠猜。仍然没有套刻实测；前道片是否按同一版图制造，要靠版图
 * 与工艺共同保证，不在数据里用坐标仿真替代。
 *
 * 若前道不能重排，最少是 **4 孔**（PMOS 源/Vdd、NMOS 源/GND、公共漏/OUT、
 * 公共栅/IN），但那是把两管漏/栅短接的另一拓扑；本文件按设计输入选 6 孔，
 * 不把 4 孔写成默认。
 *
 * TLM/接触孔测试阵列（`std/contact-tlm-general`、`mat/contacted-wafer`）
 * 保留，**不与反相器混用**。接触电阻 30–1500 Ω/孔仍是设计值。
 *
 * VTC 用参数分析仪 51 点（0–5 V）；`measure/cmos-vtc` 只吃 `std/cmos-inverter-general`，
 * 两条生产路线的产物都能测，不用改。
 *
 * 冲突：item 只声明 vt/gain/voh/vol，不声明 pad 数/线宽；两路都是 4 pad、
 * 5 µm Al 互连，pad 数/线宽不冲突。但 30–1500 Ω/孔会拉低 vol/增益 ——
 * 同一个 `gives` 对 contacted 支路偏乐观；不改 item 定义，只记冲突。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 源漏方阻实测（不依赖版图，接在 cmos-sd-wafer 之后）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   mat/cmos-sd-wafer
 *     → measure/cmos-sheet-resistance → mat/cmos-sheet-resistance-record
 *
 * 这是**方阻**，不是结深：四探针只能测 R□；结深仍要 SEM 剖面/e-beam 12 nm。
 * n⁺ 是 P，设计 15–80 Ω/□；p⁺ 是 Al，设计 30–1500 Ω/□，实测可能更高
 * （Al 固溶度/团簇）。每区 5 点、共 10 点；温度 19–21 °C。
 * 只有 `plant/probe-station` 的四探针，没有霍尔/变温台；版图标记/焊盘只用来
 * 定位 n⁺/p⁺ 区，不改变“这是方阻不是结深”。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 通孔链测试结构（接在 mat/damascene-layer 之后）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   mat/damascene-layer（layers ≥2、lineWidth ≥3 µm）
 *     → make/damascene-via → mat/via-layer
 *     → make/via-chain → std/via-chain-general
 *     → measure/via-resistance → mat/via-resistance-record
 *
 * 2 层金属、100 个 1 µm 通孔串联、两端各 1 个 100×100 µm Al pad。
 * 不是完整双大马士革；套刻按 damascene 的 ±0.86 µm。
 *
 * 1 µm 通孔在 3 µm 线上的余量：
 *   半线宽 1.5 µm − 孔半径 0.5 µm − 套刻 0.86 µm = **0.14 µm** ⇒ 排得下。
 *   100 孔 10×10、5 µm 间距 ⇒ 50×50 µm；两端 pad 100×100 ⇒ 单元 ~200×150 µm。
 *   mat/damascene-layer 的 layers 2–3、lineWidth 3–5 µm、AR 0.08–0.13 都撑得住。
 *
 * 算式：
 *   R_chain = 100·R_via + 2R_pad + R_wire
 *   R_via ≈ R_chain / 100（四线法，pad/引线可忽略）
 *   设计 R_via 0.1–1 Ω ⇒ R_chain 10–100 Ω。
 *
 * ⚠️ 这是 **Al 通孔，不是 Cu 双大马士革**：`make/damascene-via` 开孔后蒸 Al
 * 填孔，再回蚀；没有 Cu 电镀 + 双大马士革。
 *
 * ⚠️ **Al CMP 不成立**：`plant/cmp-polisher` 是 Cu/SiO₂ 的抛光机，
 * `mat/colloidal-silica` 没有 Al 专用抛光液；Al 软、易划伤，硅溶胶 pH 下
 * 会点蚀/腐蚀，且没有 Al 终点。改用 **5 % NaOH、40 °C、定时回蚀**
 * （litho-m3.ts:2191 的同一句）—— 各向同性、dishing/过蚀未标定，记降级。
 * RIE 刻介质也没有终点，只能定时 ±10–15 %。单孔电阻测出来才算。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * Ti 2 nm + TiN 5 nm 叠层（Cu 通孔 / 双大马士革 / W plug 共用）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 三条路线的阻挡段从「TiN 5 nm 单层」改成「Ti 2 nm + TiN 5 nm」：
 *
 *   衬底 → Ti 2 nm（粘附/成核）→ TiN 5 nm（扩散阻挡）→ Cu 或 W
 *
 * 为什么不能反序：Ti 与 Cu 在 300–450 °C 会生成 **TiCu₃**（低温时效），
 * Ti 本身也不是 Cu 的扩散阻挡。**Ti 必须在 TiN 下面，TiN 必须把 Ti 完全
 * 盖住**；反序（TiN 下、Ti 上）就是 Cu 直接贴 Ti —— 退火后 TiCu₃ 消耗粘附层，
 * 接触电阻上升，Cu 照样能进 Si。W plug 没有 Cu，TiCu₃ 不适用，但 Ti 仍是
 * 粘附/成核层，TiN 要盖住 Ti 防止 W/F 与 Ti 反应。
 *
 * 为什么 Ti 与 TiN 要同腔连做、不破真空：Ti 见空气/水汽就成 TiO₂（几埃
 * 就够），TiN 长在 TiO₂ 上粘附差，成核作用也没了。所以 Ti 2 nm 之后不能
 * 开腔、不能换机；本文件按 `plant/ald-reactor` 同腔 PEALD 写（TiCl₄ + H₂
 * 等离子体 → Ti，再 TiCl₄ + N₂ 等离子体 → TiN），不按蒸发 Ti 写（见下）。
 *
 * 厚度账（名义值，不是实测）：
 *   Ti 2 + TiN 5 = **7 nm**。
 *   1 µm 孔：名义 2×7 = 14 nm ⇒ 净径 986 nm（−1.4 %），可忽略。
 *   孔底内角按 TiN 60–75 % 覆盖 ⇒ 3.0–3.75 nm；Ti 同按 60–75 % ⇒ 1.2–1.5 nm；
 *   孔底合计 4.2–5.25 nm ⇒ 净径减 8.4–10.5 nm。
 *   任务书里的“6 nm”只算 TiN 的孔底内角（2×3.0–3.75），不含 Ti 2 nm；
 *   两种口径都可忽略，但别把 6 nm 当成 7 nm 全厚的净径账。
 *
 * 覆盖 **96–99 % 是设计值**：多 ALD 循环 + 低 AR（≈0.6）撑得住，但本层
 * 没有 TEM/漏电实测；e-beam 只能看 6–9 % 以上的空洞，针孔看不见。96–99 %
 * 不是实测值，也不是“连续”的证明。
 *
 * ⚠️ Ti 2 nm 的设备判断（B 类：路线在、工艺未验证）：
 *   · 在的：`plant/ald-reactor`（150–400 °C / 10–100 Pa）、它的
 *     `rf-electrode`（2000 W、13.56 MHz）、`plant/rf-13m56`、`plant/mfc`、
 *     `mat/titanium` + `mat/chlorine`（就地氯化成 TiCl₄，300–400 °C）、
 *     `mat/hydrogen`，以及**新补的 `plant/ald-reactor/h2-line`**
 *     （316L 管 + 双阀串联 + 独立 H₂ MFC + 检漏；四路吹扫板加第五路 H₂，
 *     MFC 按 H₂ 重标）。
 *   · **H₂ 气路已补**（ald.ts 的 `make/ald-h2-line`）：不再靠“把 NH₃/H₂O
 *     那一路换接 H₂”，Ti/TiN 同腔连做时 NH₃/H₂O 路保持原样；H₂ 走第五路。
 *     **但 Ti PEALD 工艺仍未验证**：Cl/O 含量、HCl 对泵/腔壁的腐蚀、1 Pa
 *     底压下的残气氧化（无 RGA、无 load-lock）都没有实测。工艺不成立则
 *     Ti 2 nm 不成立，barrierThickness 回 5 nm，三条路线都退回 TiN 5 nm。
 *     **这是 B 类工艺降级，不是气路缺口。**
 *   · 本路线没有给 H₂ 写纯度要求：电解氢 `mat/hydrogen` 只到 99–99.5 %
 *     （O₂/H₂O 0.5–1 %），`make/hydrogen-purified` 的 99.999 % 要另接；
 *     这也是“残气氧化”的一部分。
 *   · 热还原不行：TiCl₄ + 2H₂ → Ti + 4HCl 的热还原要 900–1100 °C，
 *     本机上限 400 °C；只能用 H₂ 等离子体在 350–380 °C 还原。Ti 膜会带
 *     Cl（几个 at%）与 O（残气），GPC 低（~0.02–0.05 nm/周期），2 nm 要
 *     40–100 周期；这些都没有实测。
 *   · 蒸发 Ti 不选：现有蒸发舟是 W 篮/钼舟，按 1200 °C 蒸 Al 设计；
 *     Ti 熔点 1668 °C、蒸发要 ~1700 °C，W 舟在这个温度会下垂/与 Ti 合金。
 *     `make/damascene-barrier` 里“W 舟蒸钛 5–10 nm”是旧账，没算舟温。
 *     且蒸发是直线视线（AR 0.6 的孔侧壁只有 35–45 %），Ti 出蒸发腔要
 *     破真空，见空气就成 TiO₂。所以本文件不用蒸发。
 *
 * ⚠️ 仍然没有的：
 *   · 没有 TEM/漏电实测：96–99 % 覆盖、孔底 4.2–5.25 nm、7 nm 总厚都是
 *     设计值/估算；连续性与阻挡性“测出来才算”。
 *   · 没有 Ti 膜厚/成分的在线量具：QCM 只看“还在长”，e-beam 剖面只能判
 *     “有没有膜”；Ti 的 Cl/O 含量、TiCu₃ 都没有测。
 *   · Ti 的有效金属厚度未标定：腔内残气（底压 1 Pa、无 load-lock）会氧化
 *     一部分 Ti，TiN 的 TiCl₄ 首脉冲也可能咬 Ti；2 nm 是名义值，不是剩下的
 *     金属厚度。
 *   · W plug 的 contacted-wafer 原有 TiN 3–5 nm 若未被 NaOH 完全去掉，
 *     总阻挡是 3–5 + 2 + 5 = 10–12 nm，不是 7 nm；7 nm 只算新叠层。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * Cu 通孔（双大马士革的 via 段，并列）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   mat/damascene-layer
 *     → make/damascene-via-cu → mat/cu-via-layer
 *     → make/via-chain-cu → std/via-chain-general
 *     → measure/via-resistance → mat/via-resistance-record
 *
 * **是双大马士革的 via 段，不是完整 dual damascene**：只有通孔 + Cu 填孔 +
 * Cu CMP + 退火，没有沟槽/金属层的一体化。
 *
 * 设备成立但降级：
 *   · Cu 电镀：`plant/plating-bath` + `mat/superfill-bath-3`（Cl⁻ + 硫脲 +
 *     JGB，additiveCount=3）有；`make/plating-superfill-peg` 在 AR ≤2 时交
 *     **voidFraction ≤1 %**。我们的 via AR≈0.6，落在窗口内。**这是设计值，
 *     未测**：e-beam 只能看见 6–9 % 以上的空洞，0–1 % 看不见。
 *   · Cu CMP：`plant/cmp-polisher` + `plant/cmp-integration`（硬垫 + 870 nm
 *     光学终点）+ `plant/cmp-uniformity-kit`（两区闭环）有；dishing **7–30 nm**、
 *     erosion **30–60 nm** 是设计窗口，**不是现状**（现状 200–230 是毡垫
 *     `make/damascene-cmp`，保留作对照）。硬垫不吸翘曲，片内均匀性靠两区闭环；
 *     没有实测。
 *   · Ti 2 nm + TiN 5 nm：Ti 做粘附/成核、TiN 做扩散阻挡；总厚 **7 nm**。
 *     TiN 多 ALD 循环封 3 nm 针孔；台阶覆盖 **96–99 % 是设计值，没有
 *     TEM/漏电实测**；孔底内角 60–75 % ⇒ TiN 3.0–3.75 nm，加 Ti 2 nm 的
 *     60–75 % ⇒ 孔底合计 4.2–5.25 nm。e-beam 只能看 6–9 % 以上的空洞，
 *     针孔看不见。1 µm 孔名义净径减 2×7 = 14 nm（986 nm），按孔底内角口径
 *     减 8.4–10.5 nm；都可忽略。Cu 仍是 Si 里的深能级复合中心，阻挡层断了
 *     就是漏电/寿命问题。
 *   · **Ti 必须压在 TiN 下面**：Ti 与 Cu 在 300–450 °C 生成 TiCu₃，Ti 本身
 *     也不挡 Cu；反序就是 Cu 直接贴 Ti。Ti 见空气成 TiO₂，所以 Ti/TiN 同腔
 *     连做、不破真空。**Ti 2 nm 是 B 类（工艺未验证）**：H₂ 气路已补
 *     （`plant/ald-reactor/h2-line`，四路吹扫板加第五路、MFC 按 H₂ 重标），
 *     但 Ti PEALD 的 Cl/O、HCl 腐蚀、残气氧化没实测；工艺不成立就回 TiN 5 nm。
 *
 * ⚠️ 没有 `mat/plating-ready-wafer` 这一环：本路线直接吃 damascene-layer，
 * 自己算 AR≈0.6，不把 AR/stepCoverage 作为中间 item 传下来；与
 * `make/plating-superfill-peg` 的 ready-wafer 接口是接线缺口，照实记。
 *
 * ⚠️ 100 孔串联 + 单孔 ≤1 %（设计值）空洞 ⇒ `chainYield 80–100 %` 仍只是
 * 设计窗口；`std/via-chain-general` 不改，冲突照实记。单孔电阻测出来才算。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * via-first 双大马士革（通孔 + 沟槽一次填铜）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   mat/damascene-layer
 *     → make/dual-damascene → mat/dual-damascene-layer
 *
 * via-first：通孔光刻/RIE → 沟槽光刻/RIE → Ti 2 nm → TiN 5 nm → Cu 一次
 * 填 via+trench → Cu CMP → 400–450 °C 退火。两块版，套刻各 ±0.86 µm。
 *
 * 3 µm 线、1 µm 孔、±0.86 µm：
 *   1.5 − 0.5 − 0.86 = **0.14 µm**（每个界面各自算）。
 * 若把两块版误差相加：1.5 − 0.5 − 1.72 = **−0.72 µm** ⇒ 3 µm 线排不下；
 * 5 µm 线是 2.5 − 0.5 − 1.72 = **+0.28 µm**。
 * 所以 3–4 µm 只在“每块版各自 ±0.86”的读法下成立；相加读法只有 5 µm 成立。
 * 这是 0.14 µm 的紧窗口，不是安全余量；路线按每界面读法写，记冲突。
 *
 * ⚠️ **void/dishing 改善，Ti 2 + TiN 5 是设计**：换 `mat/superfill-bath-3`
 * （Cl⁻ + 硫脲 + JGB，additiveCount=3）后 voidFraction 设计 **≤1 %**
 * （AR≈0.6，`make/plating-superfill-peg` 的 AR ≤2 窗口；**设计值、未测**，
 * e-beam 只能看见 6–9 % 以上的空洞）。Cu CMP 换硬垫 + 870 nm 光学终点后
 * dishing **7–30 nm**、erosion **30–60 nm**（设计窗口，不是现状）。Ti 2 nm
 * 粘附/成核 + TiN 5 nm 阻挡，总厚 7 nm；TiN 用多 ALD 循环封 3 nm 针孔，
 * 台阶覆盖 **96–99 % 是设计值，无 TEM/漏电**；孔底 TiN 3.0–3.75 nm +
 * Ti 1.2–1.5 nm = 4.2–5.25 nm。Ti 必须压在 TiN 下面（TiCu₃），Ti/TiN 同腔
 * 连做（Ti 见空气成 TiO₂）；Ti 2 nm 的 H₂ 气路已补（`h2-line`），剩 Ti PEALD
 * 工艺未验证（Cl/O、HCl 腐蚀、残气氧化），工艺不成立回 TiN 5 nm。
 *
 * 接进通孔链：
 *   mat/dual-damascene-layer → make/via-chain-dual → std/via-chain-general
 * via 已含在双大马士革层内；两块版余量按每界面 ±0.86 成立（3 µm 线 0.14），
 * 相加则 3–4 µm 不成立、只有 5 µm 线 +0.28。void ≤1 %（设计）/ dishing
 * 7–30 nm（设计）照实保留；dishing 是硬垫设计值，没有实测。
 * 单孔电阻测出来才算。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * W plug（接在 contacted-wafer 之后）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   mat/contacted-wafer（Al 塞）→ 回蚀 Al → Ti 2 nm → TiN 5 nm → W 成核/CVD →
 *   W CMP → 退火 → mat/w-plug-wafer
 *
 * 这是 **W plug，不是 Al 塞**；contacted-wafer 的 Al 必须先回蚀掉。
 * W CVD 窗口 400–450 °C / 1–5 kPa；`plant/w-cvd-reactor` holds 350–500 °C /
 * 0.5–10 kPa。WF₆ 纯度 99.0–99.9 %；W CMP 没有专用抛光液（硅溶胶 + H₂O₂）；
 * 孔内 void/seam 未标定；plugResistance 0.05–1 Ω/孔是设计值。
 *
 * **Ti 2 nm + TiN 5 nm**：W plug 没有 Cu，TiCu₃ 不适用；Ti 仍是粘附/成核层，
 * TiN 仍是扩散阻挡，TiN 必须盖住 Ti（防止 W/F 与 Ti 反应）。总厚 7 nm；
 * TiN 覆盖 96–99 % 是设计值，孔底 TiN 3.0–3.75 nm + Ti 1.2–1.5 nm =
 * 4.2–5.25 nm。Ti/TiN 同腔连做、不破真空；Ti 2 nm 的 H₂ 气路已补
 * （`plant/ald-reactor/h2-line`），剩 Ti PEALD 工艺未验证（Cl/O、HCl 腐蚀、
 * 残气氧化，见文件头），工艺不成立就回 TiN 5 nm。contacted-wafer 原有 TiN 3–5 nm 若
 * 未被 NaOH 完全去掉，总阻挡是 10–12 nm，不是 7 nm。
 *
 * 实测：`measure/w-plug-resistance` 10 个孔、0–0.2 V 四线法，参数分析仪测、
 * probe-station 压针；记录 plugResistance 实测 0.05–5 Ω（设计 0.05–1）、
 * yieldOpen、voidFraction 估算、19–21 °C。**这是 W plug 电阻，不是接触电阻**；
 * W CMP dishing/void 未标定，没有变温台。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * B⁺ p⁺ 替代 Al 候选
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   mat/cmos-nsd-wafer + BF₃ + 水 → B⁺ 30 keV / 1e15 cm⁻² / 7° → 激活
 *
 * Al 在硅里固溶度 ~5e18 cm⁻³，1e15 剂量会超 100–260 倍；B 的固溶度高得多，
 * p⁺ 超固溶度问题消失。**但 BF₃ 纯度 99.5 %、水 ≤10 ppm 没有实测，
 * 质量分离（¹¹B/¹⁰B）也没有标定**；B⁺ 的 Rp 比 Al 浅，结深仍按 LDD 的
 * 0.3–0.4 µm 记账，不是 30 keV 的射程。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * p⁺ 激活率：两本记录 + 一条计算路线
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   D_active = 1/(q·μ·R□)，N_active = D_active/x_j，
 *   activationFraction = D_active / 1e15
 *
 * `mat/cmos-sheet-resistance-record` 与 `mat/junction-cv-record` 都加了
 * `waferId`（0–1000）与 `region`（n/p/both）；`measure/p-plus-activation`
 * 用 need 要求两本的 `region` 都是 `both`（both 覆盖 p；p-only 记录不满足）。
 *
 * **代码不强制跨条目 waferId 相等**：`measure/p-plus-activation` 第①步人工
 * 核对两本记录的 waferId，必须相同；不相等则整份记录作废。第②步核对
 * region 含 p；C-V 的 area 取 p⁺ 测试结 100×100 µm pad 的面积，不拿 n⁺ 区顶。
 *
 * 窗口：R□ 30–5000 Ω/□、μ 50–100 cm²/V·s ⇒ D_active 1.25e13–4.16e15 cm⁻²；
 * 路线 gives 取 **1e13–2e15 cm⁻²**。activationFraction >100 % 时记 100 %
 * 并注明 R□/μ 不自洽；mobility 区间让结果带 2× 不确定度。
 * 没有 Hall/SIMS，这是**电学提取**，不是实测激活率。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 套刻 vernier：CD-SEM 读 5 µm 框，不是 40 nm 套刻
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `std/overlay-vernier-general`（5 µm 外框 / 2 µm 内框 / 10 级 0.1 µm）
 *   + dual-LDD 片 → `measure/overlay-vernier` → `mat/overlay-record`
 *
 * **vernier 必须由两块 LDD 版同时印出**：外框来自第一块版、内框来自第二块版。
 * `make/dual-ldd-spacer` 已在两块版里带 vernier（`overlayMarks: present`），
 * 所以当前 dual-LDD 片可以测；单条 n/p LDD 片仍是 `absent`，不测。
 * CD-SEM 只看 5 µm/2 µm 框，读数分辨率 0.1 µm，**不是 40 nm 套刻量测**；
 * overlayX/Y ±0.5 µm 是设计窗口。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * Cu 离位 BTS：专门 MOS 电容试样
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `mat/cu-via-layer` 与 `std/via-chain-general` 是**通孔/链**，不是 MOS 电容：
 * 没有 gate oxide、没有 C-V 的积累/耗尽区，加偏压只能测链电阻/漏电，
 * 读不出 flatband shift。`mat/device-wafer` 只有 node，没有 MOS 电容面积。
 *
 * `mat/gate-electrode-wafer` 的**顶面是多晶硅栅，不是栅氧**；Cu/TiN 直接贴上去
 * 只是栅接触，不是 Cu/TiN/栅氧 MOS 电容。所以试样改用 `mat/gate-oxide-wafer`
 * （栅氧在顶面）做 `make/cu-bts-capacitor`：100×100 µm pad → TiN 5 nm →
 * Cu 200–500 nm → 剥离 → 400–450 °C 退火。
 *
 * 这是专门试样，不是产品片；没有通孔，Cu 直接贴在 TiN/栅氧上。
 * BTS 是**离位**：150–200 °C、1 MV/cm、1 h，探针不留在炉里，冷却后复测 C-V/I-V。
 * 没有热台，stress 时不能原位测；1 MV/cm 是设计值；Cu 深能级复合中心只能靠
 * 漏电/寿命间接看，不是直接测 Cu 浓度。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * RTA 长寿命灯阵：40 kW / 2000 h / 1.5 s
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `plant/rta/lamp-array-long` 是 **40 kW（16×2.5 kW）现场可换件**：
 * lifetime 1500–2000 h、decay ≤5 %/2000 h；对应升温 **1.5 s**（60 kW 是 1 s）。
 * `make/cmos-activation-long` 与 `make/cmos-activation` 同片/同料，只在
 * `needs` 里指名长寿命灯阵；`plant/rta` 的 composedOf 仍是 60 kW，不改机器。
 * 2000 h/±5 K/≤5 % 是设计值，没有光衰/测温实测；碘仍靠回收。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CMOS_ITEMS: readonly Item[] = [
  /**
   * n⁺ 源漏注入完、还没做 p⁺ 与激活的片。**只有 n⁺ 半边。**
   *
   * 没有 props：剂量/能量/结深在路线里；激活后才成立。
   */
  {
    id: 'mat/cmos-nsd-wafer',
    name: 'n⁺ 源漏注入片',
    unit: '片',
    category: 'part',
  },

  /**
   * n⁺ + p⁺ 都注入完、还没激活的片。**两个源漏都在，但都还在 Rp 附近。**
   *
   * 没有 props：结深/方阻要等 `make/cmos-activation` 之后才成立。
   */
  {
    id: 'mat/cmos-sd-implanted-wafer',
    name: 'n⁺/p⁺ 源漏注入片',
    unit: '片',
    category: 'part',
  },

  /**
   * p⁺ + n⁺ 源漏都注入、RTA 激活后的片。**有源漏，还没有硅化物。**
   *
   * 三个规格（按 `mat/ldd-wafer` 的 300–400 nm 对齐）：
   *   junctionDepth      0.3–0.4 µm（LDD 的 300–400 nm 定义；100 keV 的
   *                      P⁺/Al⁺ Rp 135 nm 只是接触注入，落在 LDD 里）
   *   sheetResistanceN   15–80 Ω/□（R□ = 1/(q·μ_n·dose)；
   *                      μ_n = 100–200、dose = 1–2e15 ⇒ 15.6–62.4，取 15–80）
   *   sheetResistanceP   30–1500 Ω/□（理想全激活 31–125；Al 固溶度 ~5e18
   *                      只容 7.5e13–1.5e14 cm⁻² 有效剂量，μ_p = 50–100
   *                      ⇒ 417–1665，取高端 1500）
   *
   * ⚠️ p⁺ 的低端是理想值、高端是固溶度封顶；p⁺ 是候选，不是保证（R8①）。
   */
  {
    id: 'mat/cmos-sd-wafer',
    name: '源漏激活片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'junctionDepth', kind: 'range', min: 0.3, max: 0.4, unit: 'µm' },
      { param: 'sheetResistanceN', kind: 'range', min: 15, max: 80, unit: 'Ω/□' },
      { param: 'sheetResistanceP', kind: 'range', min: 30, max: 1500, unit: 'Ω/□' },
    ],
  },

  /**
   * 200–400 nm 档单级 CMOS 反相器测试结构。**不是 40 nm MCU，也不是量产单元。**
   *
   * Vdd 5 V；4 个 100×100 µm Al pad：Vdd / GND / IN / OUT（IN/OUT 是任务点名的
   * 两个，Vdd/GND 是电学上必须多出来的两个）；1 层金属；Al 互连 5 µm。
   *
   * 四个规格都是**设计窗口/估算**（没有 VTC 曲线仪、没有 SIMS/C-V）：
   *   vt    1.5–2.5 V（Vdd 5 V 的开关阈值；200–400 nm、EOT 3.5–4.5 nm）
   *   gain  3–10 V/V（5 µm 版、Al 互连；有限差分能测到，但没有闭环）
   *   voh   4.5–5.0 V（PMOS 上拉；p⁺ 是 Al 候选，可能到不了 5.0）
   *   vol   0.1–0.5 V（NMOS 下拉；Al 互连/接触电阻会抬高）
   *
   * ⚠️ p⁺ 是 Al 候选（超固溶度 100–260×），PMOS 的 Vt/gain 只是设计值；
   * 不声称“CMOS 工艺闭合”。
   */
  {
    id: 'std/cmos-inverter-general',
    name: '单级 CMOS 反相器测试结构',
    unit: '件',
    category: 'part',
    props: [
      { param: 'vt', kind: 'range', min: 1.5, max: 2.5, unit: 'V' },
      { param: 'gain', kind: 'range', min: 3, max: 10, unit: 'V/V' },
      { param: 'voh', kind: 'range', min: 4.5, max: 5.0, unit: 'V' },
      { param: 'vol', kind: 'range', min: 0.1, max: 0.5, unit: 'V' },
    ],
  },

  /**
   * 反相器 5 层版图数据集（有源/栅/接触/金属/pad）。**设计输入，不是可制造件。**
   *
   *   layers      5 层
   *   minFeature  5 µm
   *   dieWidth    30 µm
   *   dieHeight   25 µm
   *
   * ⚠️ 与 `std/photomask-general` 不同：那个是**空白版**，这个是**图形数据**。
   * **路线已建**：`make/inverter-layout-general`（本文件末尾）—— 设计数据由
   * 前提给的算力生成，不投料、不占专用设备。本层仍不
   * 模拟坐标/DRC；它只把"6 个孔相对管子的位置"从猜变成设计定义。
   * 接触孔版与这套版图同源；套刻仍没有实测。
   */
  {
    id: 'std/inverter-layout-general',
    name: '反相器 5 层版图数据集',
    unit: '件',
    category: 'part',
    props: [
      { param: 'layers', kind: 'range', min: 5, max: 5, unit: '层' },
      { param: 'minFeature', kind: 'range', min: 5, max: 5, unit: 'µm' },
      { param: 'dieWidth', kind: 'range', min: 30, max: 30, unit: 'µm' },
      { param: 'dieHeight', kind: 'range', min: 25, max: 25, unit: 'µm' },
    ],
  },






  /**
   * 接触 TLM 测试结构。**4 个 100×100 µm Al pad，间距 5/10/20 µm，做在
   * `mat/device-wafer` 上。**
   *
   * 两个规格（设计窗口，不是实测）：
   *   contactResistivity 1e-6–1e-5 Ω·cm²（Al/TiN/p⁺ 或 n⁺，没有硅化物；
   *                      比 C49 的 1e-7–4e-7 高 2.5–100 倍，估算）
   *   sheetResistance    50–500 Ω/□（接触区下面的 S/D 方阻；从 15–1500 里取中段）
   *
   * TLM 算式（W = 100 µm，间距 L = 5/10/20 µm）：
   *   L_t = √(ρc / R_sheet)
   *   R_total(L) = 2R_c + R_sheet·L/W
   *   R_c = √(ρc·R_sheet)/W（L_c ≫ L_t）
   *   ρc = R_c²·W² / R_sheet
   *
   * 没有 W plug、没有完整接触孔；Al 直接接触 p⁺/n⁺，TiN 3 nm 只是阻挡层。
   */
  {
    id: 'std/contact-tlm-general',
    name: '接触 TLM 测试结构',
    unit: '件',
    category: 'part',
    props: [
      { param: 'contactResistivity', kind: 'range', min: 1e-6, max: 1e-5, unit: 'Ω·cm²' },
      { param: 'sheetResistance', kind: 'range', min: 50, max: 500, unit: 'Ω/□' },
    ],
  },


  /**
   * 做完 Al 接触孔的 device 片。**孔里有 TiN + Al，不是 W plug。**
   *
   * 三个规格：
   *   holeDiameter    1–2 µm（5 µm 版开孔；RIE 无终点，实际 1–2 µm）
   *   contactResistance 30–1500 Ω/孔（R_c ≈ ρc/A + R_spread；d=1–2 µm、
   *                    ρc=1e-6–1e-5 Ω·cm² ⇒ ρc/A=32–1274 Ω；含 TiN/Al 界面）
   *   barrierThickness 3–5 nm（TiN ALD 3 nm 名义 + 台阶覆盖；孔底 1.8–2.3 nm）
   *
   * ⚠️ 没有 W plug、没有 CVD W；SOG 带钠；RIE 无终点；接触电阻是设计/估算。
   */
  {
    id: 'mat/contacted-wafer',
    name: '做完 Al 接触孔的 device 片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'holeDiameter', kind: 'range', min: 1, max: 2, unit: 'µm' },
      { param: 'contactResistance', kind: 'range', min: 30, max: 1500, unit: 'Ω' },
      { param: 'barrierThickness', kind: 'range', min: 3, max: 5, unit: 'nm' },
    ],
  },

  /**
   * W plug 片。**W 塞，不是 Al 塞；contacted-wafer 的 Al 先回蚀掉。**
   *
   *   plugResistance 0.05–1 Ω/孔（设计值）
   *   voidFraction 1–5 %（孔内 void/seam，未标定）
   *   barrierThickness 7 nm（Ti 2 + TiN 5；TiN 台阶覆盖 96–99 % 是设计值）
   *   plugDiameter 1–2 µm
   *
   * ⚠️ W plug 没有 Cu，TiCu₃ 不适用；Ti 仍是粘附/成核层，TiN 仍是阻挡层，
   * TiN 必须盖住 Ti。contacted-wafer 原有 TiN 3–5 nm 若未被 NaOH 完全去掉，
   * 总阻挡是 3–5 + 2 + 5 = 10–12 nm，不是 7 nm；7 nm 只算新叠层。
   * Ti 2 nm 的 H₂ 气路已补（`plant/ald-reactor/h2-line`），但 Ti PEALD 工艺
   * 未验证、无 TEM/漏电实测（见文件头）。
   */
  {
    id: 'mat/w-plug-wafer',
    name: 'W plug 片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'plugResistance', kind: 'range', min: 0.05, max: 1, unit: 'Ω' },
      { param: 'voidFraction', kind: 'range', min: 1, max: 5, unit: '%' },
      { param: 'barrierThickness', kind: 'range', min: 7, max: 7, unit: 'nm' },
      { param: 'plugDiameter', kind: 'range', min: 1, max: 2, unit: 'µm' },
      // W CMP 资格带（0–100 nm）：`measure/w-cmp-dishing` 的读数窗口，不是单次测量。
      { param: 'dishing', kind: 'range', min: 0, max: 100, unit: 'nm' },
      { param: 'erosion', kind: 'range', min: 0, max: 100, unit: 'nm' },
    ],
  },



  /**
   * 按**反相器版图**开的 6 孔接触片。**不是 TLM/接触孔测试阵列。**
   *
   * 6 个孔：
   *   PMOS 源 → Vdd、NMOS 源 → GND、
   *   PMOS 漏 → OUT、NMOS 漏 → OUT、
   *   PMOS 栅 → IN、NMOS 栅 → IN。
   *
   * 四个规格：
   *   holeCount        6 个（固定，不是范围）
   *   holeDiameter     1–2 µm（5 µm 专用版；不是 TLM 的 5/10/20 µm 阵列）
   *   contactResistance 30–1500 Ω/孔（设计窗口；R_c ≈ ρc/A + R_spread）
   *   barrierThickness 3–5 nm（TiN 3 nm + 台阶覆盖）
   *
   * ⚠️ 版图在 5 µm 规则下排得下（见 make/cmos-inverter-contact），但
   * device-wafer 是通用前道，没有反相器专用有源/栅版图；本片只保证
   * “6 个孔按反相器版图坐标开”，不保证下面的 PMOS/NMOS 已对位。
   */
  {
    id: 'mat/inverter-contacted-wafer',
    name: '反相器接触片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'holeCount', kind: 'range', min: 6, max: 6, unit: '个' },
      { param: 'holeDiameter', kind: 'range', min: 1, max: 2, unit: 'µm' },
      { param: 'contactResistance', kind: 'range', min: 30, max: 1500, unit: 'Ω' },
      { param: 'barrierThickness', kind: 'range', min: 3, max: 5, unit: 'nm' },
    ],
  },


  /**
   * 在 2 层大马士革上开通孔、填 Al、回蚀后的片。**Al 通孔，不是 Cu 双大马士革。**
   *
   * 三个规格：
   *   viaDiameter   1–2 µm（5 µm 版开孔；RIE 无终点，实际 1–2 µm）
   *   viaResistance 0.1–2 Ω/孔（Al 填充 + TiN/Cu 界面；设计/估算）
   *   layers        2–3 层（来自 damascene stack；不是本层新增层数）
   *
   * ⚠️ Al CMP 不成立（软、易划伤/腐蚀、无专用抛光液），本片用 5 % NaOH
   * 40 °C 定时回蚀；各向同性、dishing/过蚀未标定，记降级。
   */
  {
    id: 'mat/via-layer',
    name: '在 2 层大马士革上开通孔',
    unit: '片',
    category: 'part',
    props: [
      { param: 'viaDiameter', kind: 'range', min: 1, max: 2, unit: 'µm' },
      { param: 'viaResistance', kind: 'range', min: 0.1, max: 2, unit: 'Ω' },
      { param: 'layers', kind: 'range', min: 2, max: 3, unit: '层' },
    ],
  },

  /**
   * Cu 通孔片（双大马士革的 via 段）。**不是完整 dual damascene。**
   *
   * 六个规格：
   *   viaDiameter   1–2 µm
   *   viaResistance 0.05–0.5 Ω/孔（Cu 填充；比 Al 低；设计/估算）
   *   layers        2–3 层（来自 damascene stack）
   *   dishing       7–30 nm（硬垫 + 光学终点，设计）
   *   erosion       30–60 nm（硬垫 + dummy fill，设计）
   *   barrierThickness 7 nm（Ti 2 + TiN 5；TiN 台阶覆盖 96–99 % 是设计值）
   *
   * ⚠️ Cu 电镀换 `mat/superfill-bath-3`（Cl⁻ + 硫脲 + JGB，additiveCount=3）后
   * void **≤1 %**（设计值、未测；AR≈0.6；e-beam 看不见 0–1 %）；Cu CMP
   * dishing 7–30 nm / erosion 30–60 nm 是硬垫设计窗口，不是现状。Ti 2 nm
   * 提高粘附/成核，TiN 5 nm 仍做扩散阻挡；**Ti 必须压在 TiN 下面**（Ti 与
   * Cu 在 300–450 °C 生成 TiCu₃，反序就是 Cu 直接贴 Ti），Ti/TiN 同腔连做
   * （Ti 见空气成 TiO₂）。孔底 TiN 3.0–3.75 nm + Ti 1.2–1.5 nm = 4.2–5.25 nm；
   * 台阶覆盖 96–99 % 是设计值，无 TEM/漏电。Ti 2 nm 的 H₂ 气路已补；剩 Ti PEALD
   * 工艺未验证（Cl/O、HCl 腐蚀、残气氧化），工艺不成立回 TiN 5 nm。Cu 是 Si 里的深能级复合中心。
   */
  {
    id: 'mat/cu-via-layer',
    name: 'Cu 通孔片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'viaDiameter', kind: 'range', min: 1, max: 2, unit: 'µm' },
      { param: 'viaResistance', kind: 'range', min: 0.05, max: 0.5, unit: 'Ω' },
      { param: 'layers', kind: 'range', min: 2, max: 3, unit: '层' },
      { param: 'dishing', kind: 'range', min: 7, max: 30, unit: 'nm' },
      { param: 'erosion', kind: 'range', min: 30, max: 60, unit: 'nm' },
      { param: 'barrierThickness', kind: 'range', min: 7, max: 7, unit: 'nm' },
    ],
  },

  /**
   * via-first 双大马士革片：通孔 + 沟槽一次 Cu 填、Cu CMP、退火。
   *
   * 七个规格：
   *   layers        3–4 层（输入 2–3 + 本层 1）
   *   viaDiameter   1–2 µm
   *   viaResistance 0.05–0.5 Ω/孔（Cu；设计/估算）
   *   lineWidth     3–5 µm
   *   dishing       7–30 nm（硬垫 + 光学终点，设计；不是现状 200–230）
   *   erosion       30–60 nm（硬垫 + dummy fill 那一档，设计）
   *   barrierThickness 7 nm（Ti 2 + TiN 5；TiN 台阶覆盖 96–99 % 是设计值）
   *
   * ⚠️ void 设计 **≤1 %**（三组分 bath，additiveCount=3，AR≈0.6；设计值、
   * 未测；e-beam 只能看见 6–9 % 以上）。dishing 7–30 / erosion 30–60 是
   * 硬垫 + 光学终点的设计窗口，不是实测。Ti 2 nm 粘附/成核 + TiN 5 nm 阻挡；
   * Ti 必须压在 TiN 下面（TiCu₃），Ti/TiN 同腔连做（Ti 见空气成 TiO₂）；
   * 孔底 TiN 3.0–3.75 nm + Ti 1.2–1.5 nm = 4.2–5.25 nm；台阶覆盖 96–99 % 是
   * 设计值，无 TEM/漏电。Ti 2 nm 的 H₂ 气路已补；剩 Ti PEALD 工艺未验证
   * （Cl/O、HCl 腐蚀、残气氧化），工艺不成立回 TiN 5 nm。
   */
  {
    id: 'mat/dual-damascene-layer',
    name: 'via-first 双大马士革片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'layers', kind: 'range', min: 3, max: 4, unit: '层' },
      { param: 'viaDiameter', kind: 'range', min: 1, max: 2, unit: 'µm' },
      { param: 'viaResistance', kind: 'range', min: 0.05, max: 0.5, unit: 'Ω' },
      { param: 'lineWidth', kind: 'range', min: 3, max: 5, unit: 'µm' },
      { param: 'dishing', kind: 'range', min: 7, max: 30, unit: 'nm' },
      { param: 'erosion', kind: 'range', min: 30, max: 60, unit: 'nm' },
      { param: 'barrierThickness', kind: 'range', min: 7, max: 7, unit: 'nm' },
    ],
  },

  /**
   * 2 层金属、100 个 1 µm 通孔串联、两端 100×100 µm Al pad 的通孔链。
   *
   * 三个规格（设计窗口）：
   *   viaResistance 0.1–1 Ω/孔（Al 或 Cu 1 µm 通孔；两个生产者共用）
   *   chainYield    80–100 %（100 孔串联；单孔开就整链开）
   *   viaDiameter   1–1 µm（版图 1 µm；不是实测）
   *
   * ⚠️ 不是完整双大马士革；Al 是回蚀，Cu 是 Cu CMP；套刻 ±0.86 µm。
   * ⚠️ Cu 路线的单孔 ≤1 %（设计值）空洞会让 chainYield 远低于 80–100；
   * 同一个 item 不能按路线分叉，冲突记在 make/via-chain-cu。
   */
  {
    id: 'std/via-chain-general',
    name: '2 层金属通孔链',
    unit: '件',
    category: 'part',
    props: [
      { param: 'viaResistance', kind: 'range', min: 0.1, max: 1, unit: 'Ω' },
      { param: 'chainYield', kind: 'range', min: 80, max: 100, unit: '%' },
      { param: 'viaDiameter', kind: 'range', min: 1, max: 1, unit: 'µm' },
      // 可靠性资格带，不是单次读数；记录见 data/measure 的 mat/barrier-leakage-record。
      // breakdownVoltage 的 200 V 是资格带上界：实测只扫 0–5 V，5–200 V 未测；
      // 0 记“未观察到击穿”，不是 0 V 击穿。
      { param: 'leakageCurrent', kind: 'range', min: 1e-12, max: 0.000001, unit: 'A', dir: 'atMost' },
      { param: 'breakdownVoltage', kind: 'range', min: 0, max: 200, unit: 'V' },
    ],
  },


  /**
   * 套刻 vernier 掩模。**可制造件，由 `make/overlay-vernier-mask` 产出。**
   *
   * box-in-box：外框 5 µm、内框 2 µm、10 级 0.1 µm 台阶，X/Y 各一组。
   * 它是**掩模**，不是设计数据；`measure/overlay-vernier` 靠 CD-SEM 读印在片上的它。
   * `make/dual-ldd-spacer` 两块版都带这组 marks（overlayMarks present），
   * 单条 n/p LDD 版没有（overlayMarks absent），不测。
   */
  {
    id: 'std/overlay-vernier-general',
    name: '套刻 vernier 掩模',
    unit: '件',
    category: 'part',
    props: [
      { param: 'outerBox', kind: 'range', min: 5, max: 5, unit: 'µm' },
      { param: 'innerBox', kind: 'range', min: 2, max: 2, unit: 'µm' },
      { param: 'steps', kind: 'range', min: 10, max: 10, unit: '级' },
      { param: 'stepSize', kind: 'range', min: 0.1, max: 0.1, unit: 'µm' },
      { param: 'axes', kind: 'enum', values: ['x', 'y', 'both'] },
    ],
  },



  /**
   * Cu/TiN/栅氧 MOS 电容专门试样。**不是产品片，没有通孔。**
   *
   *   area             1e-4 cm²（100×100 µm pad）
   *   oxideThickness   1.5–4.5 nm（gate-oxide-wafer 的 EOT；直接贴在 TiN 下）
   *   barrierThickness 5 nm（TiN 5 nm）
   *   cuThickness      200–500 nm（Cu 蒸镀/电镀）
   */
  {
    id: 'mat/cu-bts-wafer',
    name: 'Cu/TiN/栅氧 MOS 电容专门试样',
    unit: '片',
    category: 'part',
    props: [
      { param: 'area', kind: 'range', min: 1e-4, max: 1e-4, unit: 'cm²' },
      { param: 'oxideThickness', kind: 'range', min: 1.5, max: 4.5, unit: 'nm' },
      { param: 'barrierThickness', kind: 'range', min: 5, max: 5, unit: 'nm' },
      { param: 'cuThickness', kind: 'range', min: 200, max: 500, unit: 'nm' },
      // BTS 可靠性资格带：应力条件 + 应力前后漏电/平带偏移，记录在 measure/cu-bts-leakage。
      { param: 'leakageBefore', kind: 'range', min: 1e-12, max: 1e-6, unit: 'A' },
      { param: 'leakageAfter', kind: 'range', min: 1e-12, max: 1e-6, unit: 'A' },
      { param: 'flatbandShift', kind: 'range', min: -5, max: 5, unit: 'V' },
      { param: 'stressTemperature', kind: 'range', min: 150, max: 200, unit: '°C' },
      { param: 'stressField', kind: 'range', min: 0.5, max: 2, unit: 'MV/cm' },
    ],
  },
];

export const CMOS_ROUTES: readonly Route[] = [
  {
    /**
     * **LDD 片 → 涂胶/前烘 → 曝光/显影（n⁺ 源漏版）→ P⁺ 100 keV → 去胶 → n⁺ 源漏片。**
     *
     *   `mat/ldd-wafer` 1 + P 0.1 g + 无钠胶 1 g + NaOH 5 g + Ar 2 g + N₂ 1 g + 水 1 kg
     *     → `mat/cmos-nsd-wafer` 1
     *
     * 自对准：栅与 40–55 nm 侧墙已经在 `mat/ldd-wafer` 上，源漏窗口由
     * “栅/侧墙 + n⁺ 版”共同定义；不需要额外套刻去对栅。
     *
     * 参数复用 `make/implant-n-source-drain`（implant.ts:1600）：P⁺ 100 keV、
     * 1–2e15 cm⁻²、7°；Rp 135 nm。版 5 µm 级；无钠胶 5 µm 级，5 µm 版刚好。
     *
     * 时间：1e15 的 P⁺ 在 22 µA 下 5.7 s、2e15 是 11.4 s；装卸/抽真空/换片
     * 才是大头，一批 3 h。
     */
    id: 'make/cmos-nsd',
    name: 'n⁺ 源漏注入',
    produces: [{ item: 'mat/cmos-nsd-wafer', qty: q(1) }],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/ldd-wafer',
            qty: q(1),
            need: [{ param: 'lddType', kind: 'enum', oneOf: ['n'] }],
            onRelax: 'functional-lost',
          },
        ],
      },
      // P 固体源：0.1 g；进硅 4.0–8.1 µg（1–2e15 × 78.5 × 31/6.022e23）
      { anyOf: [{ item: 'mat/phosphorus', qty: q(1, 10000) }] },
      // 无钠胶 1 g：1.0–1.5 µm 膜只要 9.4–14.1 mg，甩掉 95 % ⇒ 0.19–0.28 g
      { anyOf: [{ item: 'mat/photoresist-sodium-free', qty: q(1, 1000) }] },
      // 显影碱：NaOH 5 g + 水 1 kg（0.5 wt%）
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['std/photomask-general', 'plant/clean-room', 'plant/euv-vacuum'],
    rate: { hours: q(3) },
    steps: [
      {
        note_zh:
          '① 涂胶：无钠胶 1.0–1.5 µm；胶厚/射程 >7:1（P⁺ 100 keV 的 Rp 135 nm），离子停在胶里',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '② 前烘 100–120 °C / 60 s：赶溶剂；与 wells.ts 的阱掩模同一档',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 120 }],
      },
      {
        note_zh:
          '③ 曝光：n⁺ 源漏版、接触曝光；版 5 µm 级。栅/侧墙已经在 LDD 片上，源漏靠它们自对准；n⁺/p⁺ 两块版的套刻 ±0.25 µm（mask-aligner，没有套刻测量机）',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '④ 显影：NaOH 0.5 wt% / 20–30 °C / 60 s；负胶未见光处洗掉，n⁺ 窗口是未见光的那一块',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '⑤ P⁺ 注入：100 keV、1–2e15 cm⁻²、7°；与 make/implant-n-source-drain（implant.ts:1600）同参数。Rp 135 nm 落在 LDD 300–400 nm 里面 —— 它是接触注入，不定义结深（R8③）',
        performedBy: 'plant/ion-implanter',
        under: [
          { param: 'energy', min: 95, max: 100 },
          { param: 'pressure', min: 1e-4, max: 1e-3 },
        ],
      },
      {
        note_zh:
          '⑥ 去胶：70–90 °C 热水 + 刷；不能 HF —— 它会把 STI 槽里的氧化物一起咬',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 70, max: 90 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
    ],
    unbalanced_zh:
      'LDD 片 1（12.8 g）+ P 0.1 g + 无钠胶 1 g + NaOH 5 g + Ar 2 g + N₂ 1 g + 水 1 kg → n⁺ 源漏片 1。1–2e15 cm⁻² × 78.5 cm² = 7.85e16–1.57e17 个 P，质量 ×31/6.022e23 = **4.0–8.1 µg** 进入硅；源投 0.1 g（100 mg）的其余 99.999 % 量级淀积在电离室屏/光阑上。胶 1 g 里成膜 9.4–14.1 mg，其余甩掉/洗掉；NaOH 5 g 是显影碱；Ar/N₂ 是稀释/吹扫；水是冲洗。产物按片计（12.8 g + 4.0–8.1 µg P），差额是源损耗/胶/碱/水；不是账不平，是注入的固有损耗',
  },

  {
    /**
     * **n⁺ 源漏片 → 涂胶/前烘 → 曝光/显影（p⁺ 源漏版）→ Al⁺ 100 keV → 去胶 → 双源漏注入片。**
     *
     *   `mat/cmos-nsd-wafer` 1 + Al 0.1 g + 无钠胶 1 g + NaOH 5 g + Ar 2 g + N₂ 1 g + 水 1 kg
     *     → `mat/cmos-sd-implanted-wafer` 1
     *
     * 参数：Al⁺ 100 keV、1–2e15 cm⁻²、7°；分析段 25 kV / 0.473 T
     * （implant.ts:144），后加速到 100 keV。Rp 0.12–0.14 µm。
     *
     * ⚠️ Al 固溶度 ~5e18 cm⁻³；1–2e15 在 0.15 µm 里是 5e20–1.3e21，
     * 超 100–260 倍 ⇒ Al 会析出/团簇。p⁺ 方阻的低端是理想值、高端是
     * 固溶度封顶（R8①/⑥）。若团簇，这条 p⁺ 不成立，记缺口。
     */
    id: 'make/implant-p-source-drain',
    name: 'p⁺ 源漏注入',
    produces: [{ item: 'mat/cmos-sd-implanted-wafer', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/cmos-nsd-wafer', qty: q(1) }] },
      // Al 固体源：0.1 g；进硅 3.5–7.0 µg（1–2e15 × 78.5 × 27/6.022e23）
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/photoresist-sodium-free', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['std/photomask-general', 'plant/clean-room', 'plant/euv-vacuum'],
    rate: { hours: q(3) },
    steps: [
      {
        note_zh:
          '① 涂胶：无钠胶 1.0–1.5 µm；Al⁺ 100 keV 的 Rp 0.12–0.14 µm，胶/射程 >7:1',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '② 前烘 100–120 °C / 60 s：与 n⁺ 源漏同一档',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 120 }],
      },
      {
        note_zh:
          '③ 曝光：p⁺ 源漏版、接触曝光；版 5 µm 级。栅/侧墙仍在片上，p⁺ 靠它们自对准；p⁺/n⁺ 两块版套刻 ±0.25 µm（R8⑤）',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '④ 显影：NaOH 0.5 wt% / 20–30 °C / 60 s；p⁺ 窗口是未见光的那一块',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '⑤ Al⁺ 注入：100 keV、1–2e15 cm⁻²、7°；分析段 25 kV / 0.473 T（implant.ts:144）后加速到 100 keV。**剂量超过 Al 固溶度 100–260 倍**，析出/团簇是这条 p⁺ 的命门（R8①/⑥）',
        performedBy: 'plant/ion-implanter',
        under: [
          { param: 'energy', min: 95, max: 100 },
          { param: 'pressure', min: 1e-4, max: 1e-3 },
        ],
      },
      {
        note_zh:
          '⑥ 去胶：70–90 °C 热水 + 刷；不能 HF。到这一步 n⁺ 与 p⁺ 都注入完，但都没激活',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 70, max: 90 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
    ],
    unbalanced_zh:
      'n⁺ 源漏片 1（12.8 g）+ Al 0.1 g + 无钠胶 1 g + NaOH 5 g + Ar 2 g + N₂ 1 g + 水 1 kg → 双源漏注入片 1。1–2e15 cm⁻² × 78.5 cm² = 7.85e16–1.57e17 个 Al，质量 ×27/6.022e23 = **3.5–7.0 µg** 进入硅；源投 0.1 g（100 mg）的其余 99.999 % 量级淀积在电离室屏/光阑上。胶 1 g 里成膜 9.4–14.1 mg，其余甩掉/洗掉；NaOH 5 g 是显影碱；Ar/N₂ 是稀释/吹扫；水是冲洗。产物按片计（12.8 g + 4.0–8.1 µg P + 3.5–7.0 µg Al），差额是源损耗/胶/碱/水',
  },

  {
    /**
     * **双源漏注入片 → RTA 1000–1050 °C / 10 s → 四探针方阻 → CMOS 源漏片。**
     *
     *   双源漏注入片 1 + N₂ 0.1 kg → CMOS 源漏片 1
     *
     * 激活：RTA 1000–1050 °C、120–200 K/s、10 s、常压 N₂。
     * 把注入损伤激活、把 S/D 接触区的掺杂推到电学活性；**结深仍由
     * `mat/ldd-wafer` 的 300–400 nm 定**（R8③），不是 100 keV 的 135 nm。
     *
     * 方阻：R□ = 1/(q·μ·dose)。N⁺ μ_n=100–200、dose=1–2e15 ⇒ 15.6–62.4，
     * 取 15–80；P⁺ 理想 31–125，但 Al 固溶度 ~5e18 只容 7.5e13–1.5e14
     * ⇒ μ_p=50–100 给 417–1665，取高端 1500 ⇒ **30–1500 Ω/□**。
     *
     * ⚠️ 结深测不了（SEM 剖面/e-beam 束斑 12 nm）；probe-station 只测 R□。
     * p⁺ 的低端是理想值、高端是固溶度封顶，不是同一个物理状态（R8①/⑥）。
     */
    id: 'make/cmos-activation',
    name: '源漏激活',
    produces: [
      {
        item: 'mat/cmos-sd-wafer',
        qty: q(1),
        gives: [
          { param: 'junctionDepth', kind: 'range', min: 0.3, max: 0.4 },
          { param: 'sheetResistanceN', kind: 'range', min: 15, max: 80 },
          { param: 'sheetResistanceP', kind: 'range', min: 30, max: 1500 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/cmos-sd-implanted-wafer', qty: q(1) }] },
      // N₂ 0.1 kg：RTA 常压腔的吹扫/保护气，不参与反应
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh:
          '① RTA 激活：1000–1050 °C / 10 s / 120–200 K/s / 常压 N₂。结深按 LDD 的 300–400 nm 记账；100 keV 的 P⁺/Al⁺ 只是接触注入，不把结深拉回 0.15 µm。p-LDD 没有，PMOS 的 S/D 结仍不闭合（R8②）',
        performedBy: 'plant/rta',
        under: [
          { param: 'temperature', min: 1000, max: 1050 },
          { param: 'rampRate', min: 120, max: 200 },
          { param: 'pressure', min: 9.5e4, max: 1.05e5 },
        ],
      },
      {
        note_zh:
          '② 四探针方阻：`plant/probe-station` 读 N⁺ 15–80、P⁺ 30–1500 Ω/□；四探针只测 R□，**测不了结深**。结深要 SEM 剖面（e-beam 束斑 12 nm，gate-stack.ts:1336），本路线没有切片/剖面步骤（R8④）',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '双源漏注入片 1（12.8 g，含 P 4.0–8.1 µg + Al 3.5–7.0 µg）+ N₂ 0.1 kg → CMOS 源漏片 1。RTA 只改掺杂分布与激活率，不改质量：硅 12.8 g 原样，P/Al 仍在 µg 级，只是把接触区激活；结深仍由 LDD 的 300–400 nm 定。N₂ 0.1 kg 全部进尾气。产物按片计，差额是 N₂；不是账不平，是保护气过量',
  },

  {
    /**
     * **CMOS 源漏片 → 溅射 Ti 20 nm → 600–650 °C 硅化 → HF 去未反应 Ti → C49 片。**
     *
     *   `mat/cmos-sd-wafer` 1 + Ti 1 g + Ar 20 g + N₂ 20 g + HF 10 g + 水 1 kg
     *     → `mat/silicide-wafer` 1
     *
     * 与 `make/silicide-tisi2-c49`（gate-stack.ts:969–1019）同一套工艺，
     * 只换起始片：LDD 片 → CMOS 源漏片。`gives` 逐项一致：
     * contactResistivity 10–40、silicidePhase c49、sheetResistance 12–20。
     *
     * 为什么只到 C49：C54 要 700–800 °C / 30 s，本层炉子没有秒级刻度；
     * 30 min 会让硅化物横向长 0.1–0.15 µm，爬过 40–55 nm 侧墙就是栅源漏短路。
     * 所以交付 C49，片阻 12–20 Ω/□（C54 是 2.7–3.5，差 4.5–6 倍）。
     *
     * 接线：本路线交 C49（`mat/silicide-wafer`），由现有 `make/rtp-silicide-c54`
     * 转成 C54，再进 `make/device-wafer`（多晶硅支路，只吃 c54 + 水）。
     * 高 k 是并列的 `make/device-wafer-highk`，不是同一条的 AND 项。
     */
    id: 'make/cmos-silicide',
    name: '自对准硅化物片制造',
    produces: [
      {
        item: 'mat/silicide-wafer',
        qty: q(1),
        gives: [
          { param: 'contactResistivity', kind: 'range', min: 10, max: 40 },
          { param: 'silicidePhase', kind: 'enum', oneOf: ['c49'] },
          { param: 'sheetResistance', kind: 'range', min: 12, max: 20 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/cmos-sd-wafer', qty: q(1) }] },
      // 20 nm Ti：78.5 cm² × 20 nm × 4.5 g/cm³ = 7.1 mg；取 1 g 含靶/夹具损耗
      { anyOf: [{ item: 'mat/titanium', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 50) }] },
      // 选择性去未反应 Ti：HF。Ti : TiSi₂ 只有 5–10 : 1
      { anyOf: [{ item: 'mat/hf', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh:
          '① 溅射 Ti 20 nm（0.1–10 Pa 氩，`plant/euv-coater` 换 Ti 靶）。20 nm Ti → 约 49 nm TiSi₂（2.46 倍体积膨胀）；厚度决定硅化物厚度',
        performedBy: 'plant/euv-coater',
        under: [{ param: 'pressure', min: 0.1, max: 10 }],
      },
      {
        note_zh:
          '② 硅化 600–650 °C / 30 min（N₂）：Ti + 2Si → TiSi₂（C49，ρ 60–100 µΩ·cm）。横向长 0.05 µm ≈ 侧墙宽；不能升到 700–800（C54 会长 0.1–0.15 µm，爬过 40–55 nm 侧墙就是栅源漏短路）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 600, max: 650 }],
      },
      {
        note_zh:
          '③ 选择性去未反应 Ti（49 % HF，20–30 °C）：Ti : TiSi₂ 只有 5–10 : 1，过刻 50 % 会吃掉 4–10 nm 硅化物（49 nm 剩 39–45）。工业用 NH₄OH/H₂O₂ 或 H₂SO₄/H₂O₂（20 : 1 以上），本层的双氧水没有条目',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '④ 检验：比接触电阻测不了（TLM 要四探针 + 变温，本层 0 台）⇒ ρc 是按工艺窗口声明的文献值。能测的只有“源漏通不通、栅漏不漏”；C49 的 12–20 Ω/□ 是四探针可读的那一格',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'CMOS 源漏片 1（12.8 g）+ Ti 1 g + Ar 20 g + N₂ 20 g + HF 10 g + 水 1 kg → 硅化物片 1。Ti 膜 20 nm × 78.5 cm² × 4.5 g/cm³ = **7.1 mg**；成 TiSi₂ 约 49 nm × 78.5 cm² × 4.0 g/cm³ = **15.4 mg**（其中 Si 8.3 mg 来自片）。Ti 源 1 g 的其余在靶/挡板/腔壁；HF 10 g 去未反应 Ti（Ti : TiSi₂ 5–10 : 1，过刻吃掉 4–10 nm 硅化物）；Ar/N₂ 是溅射/退火气，水是冲洗。产物按片计（12.8 g + 15.4 mg TiSi₂）；差额是靶损耗/HF/水，不是账不平',
  },

  {
    /**
     * **1 层大马士革片 → pad/互连光刻 → 蒸铝/剥离 → 检验 → 单级反相器。**
     *
     *   `mat/damascene-layer` 1 + Al 10 g + 无钠胶 1 g + NaOH 5 g + 水 1 kg
     *     → `std/cmos-inverter-general` 1 件
     *
     * 4 个 100×100 µm pad：Vdd / GND / IN / OUT；Al 互连 5 µm；版 5 µm 级。
     * 用 lift-off：胶 1.0–1.5 µm，蒸 0.5–1 µm Al，剥离后只留 pad 与互连。
     *
     * ⚠️ 这是**测试结构**：1 片 damascene 层只取 1 个反相器，其余划片/陪片
     * 丢弃；Al 直接搭在顶层铜上，**没有做接触孔**，接触电阻是开环。
     *
     * 时间：光刻 0.5 h + 蒸铝/剥离 1.5 h + 检验 0.5 h + 装片/传片 ≈ 4 h。
     */
    id: 'make/cmos-inverter',
    name: '单级 CMOS 反相器测试结构制造',
    produces: [
      {
        item: 'std/cmos-inverter-general',
        qty: q(1),
        // 设计窗口/估算；p⁺ 是 Al 候选，Vt/gain 不保证
        gives: [
          { param: 'vt', kind: 'range', min: 1.5, max: 2.5 },
          { param: 'gain', kind: 'range', min: 3, max: 10 },
          { param: 'voh', kind: 'range', min: 4.5, max: 5.0 },
          { param: 'vol', kind: 'range', min: 0.1, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/damascene-layer', qty: q(1) }] },
      // Al 10 g：4 个 pad 与 5 µm 互连的净耗 <1 µg；10 g 是蒸发舟一次装料
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 100) }] },
      // 无钠胶 1 g：1.0–1.5 µm 膜只要 9.4–14.1 mg，甩掉 95 % ⇒ 0.19–0.28 g
      { anyOf: [{ item: 'mat/photoresist-sodium-free', qty: q(1, 1000) }] },
      // 显影碱：NaOH 5 g + 水 1 kg（0.5 wt%）
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['std/photomask-general', 'plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① pad/互连光刻：4 个 100×100 µm pad（Vdd/GND/IN/OUT）+ 5 µm Al 互连；版 5 µm 级。涂胶/前烘/曝光/显影都在这一步里（机器人涂胶、电阻炉 100–120 前烘、mask-aligner 曝光、湿法槽 NaOH 显影）',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '② 蒸铝 0.5–1 µm + 剥离：0.001–0.01 Pa、钨舟 1200 °C；lift-off 只留 pad 与互连。**没有做接触孔**：Al 直接搭在 damascene 顶层铜上，接触电阻开环，VTC 的 vol/增益会受它影响',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh:
          '③ 检验：`plant/probe-station` 看 IN/OUT 与 Vdd/GND 不短、pad 通断；VTC 另走 `measure/cmos-vtc`。四探针台的 4 根针正好接 4 个 pad，但这一步只判通断，不扫曲线',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '大马士革层 1 片（12.8 g 硅 + 1 层铜）+ Al 10 g + 无钠胶 1 g + NaOH 5 g + 水 1 kg → 反相器 1 件。4 个 pad 的铝只有 4 × 100 × 100 µm² × 1 µm × 2.7 g/cm³ ≈ **0.11 µg**，5 µm × 1 cm × 1 µm 的互连再加 0.14 µg；10 g 是蒸发舟装料，不是净耗（99.999 % 留在舟/腔壁）。1 片大马士革层只取 1 个测试结构，其余划片/陪片丢弃 —— 这是测试结构的固有浪费，不是账不平。产物按件计（1 个反相器），差额是晶圆/铝装料/胶/碱/水',
  },


  {
    /**
     * **device-wafer → SOG 氧化层 → 接触孔光刻 → RIE 开孔 → TiN 3 nm →
     * 蒸铝/剥离 → 合金 → TLM。**
     *
     *   `mat/device-wafer` 1 + SOG 1 g + 无钠胶 1 g + NaOH 5 g
     *   + C4F6 1 g + O2 1 g + Ar 2 g + Ti 1 g + Cl2 1 g + N2 5 g
     *   + Al 10 g + 水 1 kg → `std/contact-tlm-general` 1 件
     *
     * 5 步：
     *   ① 接触孔光刻（4 个 pad，间距 5/10/20 µm；版 5 µm 级）
     *   ② RIE 开氧化层（C4F6/O2/Ar，20–60 °C / 1–10 Pa；无终点，定时）
     *   ③ TiN 3 nm（Ti + Cl2 + N2，ALD 350–380 °C / 10–100 Pa；
     *      与 `make/tin-3nm-ald`（lowk-barrier.ts:1464）同一套化学）
     *   ④ 蒸铝 0.5–1 µm + 剥离（0.001–0.01 Pa）
     *   ⑤ 合金 400–450 °C / 30 min（Al/TiN/Si；不是 Al–Si 共晶 577 °C）
     *
     * ⚠️ 这不是完整接触孔/通孔：**没有 W plug**，Al 直接接触 p⁺/n⁺；
     * SOG 带钠（测试结构 only）；RIE 没有终点；TiN 3 nm 的台阶覆盖
     * 88–95 %（`make/tin-3nm-ald` 同一格），孔底可能不连续。
     *
     * 时间：光刻 0.5 + RIE 0.5 + ALD 1–2 + 蒸铝/剥离 1.5 + 合金 1 + 装卸 ≈ 6 h。
     */
    id: 'make/cmos-contact-tlm',
    name: '接触 TLM 测试结构制造',
    produces: [
      {
        item: 'std/contact-tlm-general',
        qty: q(1),
        gives: [
          { param: 'contactResistivity', kind: 'range', min: 1e-6, max: 1e-5, record: 'mat/contact-resistance-record' },
          { param: 'sheetResistance', kind: 'range', min: 50, max: 500, record: 'mat/contact-resistance-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/device-wafer', qty: q(1) }] },
      // 氧化层：SOG 1 g；0.5–1 µm × 78.5 cm² × 2.1 = 0.08–0.17 g，取 1 g 留返工
      { anyOf: [{ item: 'mat/spin-on-glass', qty: q(1, 1000) }] },
      // 无钠胶 1 g：1.0–1.5 µm 膜，接触孔版 5 µm 级
      { anyOf: [{ item: 'mat/photoresist-sodium-free', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 200) }] },
      // RIE 开氧化层：C4F6/O₂/Ar；与 make/rie-oxide-trench-c4f6 同一族
      { anyOf: [{ item: 'mat/c4f6', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 500) }] },
      // TiN 3 nm：Ti + Cl₂ + N₂；与 make/tin-3nm-ald 同一套化学
      { anyOf: [{ item: 'mat/titanium', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 200) }] },
      // Al 10 g：4 个 pad + 互连净耗 <1 µg；10 g 是蒸发舟装料
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: [
      'std/photomask-general',
      'plant/clean-room',
      'plant/metrology-room',
      // ALD TiN 的 13.56 MHz 源与三路气计量
      'plant/rf-13m56',
      'plant/mfc',
    ],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh:
          '① 接触孔光刻：4 个 pad、间距 5/10/20 µm；版 5 µm 级。涂胶/前烘/曝光/显影都在这一步里（机器人涂胶、电阻炉 100–120 前烘、mask-aligner 曝光、湿法槽 NaOH 显影）',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '② RIE 开氧化层：C4F6/O2/Ar、20–60 °C / 1–10 Pa；SOG 是硅酸盐，刻蚀速率比热氧化层快 2–3 倍（`damascene.ts` 的同一口径）。**没有终点**，只能定时 ±10–15 %；过刻会打穿下面的硅',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 1, max: 10 },
        ],
      },
      {
        note_zh:
          '③ TiN 3 nm（ALD）：Ti + Cl2 + N2，350–380 °C / 10–100 Pa；与 `make/tin-3nm-ald`（lowk-barrier.ts:1464）同一套化学。台阶覆盖 88–95 %，孔底内角只有 60–75 % ⇒ 1.8–2.3 nm；3 nm 在平处连续，孔底可能不连续（R8）',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 350, max: 380 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '④ 蒸铝 0.5–1 µm + 剥离：0.001–0.01 Pa、钨舟 1200 °C；lift-off 只留 pad 与接触孔里的 Al。**没有 W plug**：Al 直接填在接触孔里，接触面积由孔底决定',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh:
          '⑤ 合金 400–450 °C / 30 min：Al/TiN/Si 的固相烧结，不是 Al–Si 共晶（577 °C）。温度上限 450 留给共晶 577 °C 的余量；合金化降低接触电阻，但不会把 Al 的固溶度问题消掉',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
    ],
    unbalanced_zh:
      'device 片 1（12.8 g）+ SOG 1 g + 无钠胶 1 g + NaOH 5 g + C4F6 1 g + O2 1 g + Ar 2 g + Ti 1 g + Cl2 1 g + N2 5 g + Al 10 g + 水 1 kg → TLM 1 件。3 nm TiN 只覆盖 4 个接触孔（约 100 µm²）⇒ **1.6 pg**；Al pad 4 × 100×100 µm² × 1 µm × 2.7 = **0.11 µg**；两者都远小于投料。Ti/Cl2 的其余在源腔/腔壁，Al 10 g 是蒸发舟装料（99.999 % 留在舟/挡板），SOG 1 g 里成膜 0.08–0.17 g、其余甩掉；C4F6/O2/Ar/N2 是刻蚀/ALD 气，水是冲洗。产物按件计（1 个 TLM；1 片 device 只取 1 个测试结构，其余划片/陪片丢弃）；差额是晶圆/源料/气/水，不是账不平',
  },


  {
    /**
     * **device-wafer → SOG 涂布/固化 → 接触孔光刻 → RIE 开孔 → TiN 3 nm →
     * 蒸铝/剥离填孔 → 合金 → Al 接触孔片。**
     *
     *   `mat/device-wafer` 1 + SOG 1 g + 无钠胶 1 g + NaOH 5 g
     *   + C4F6 1 g + O2 1 g + Ar 2 g + Ti 1 g + Cl2 1 g + N2 5 g
     *   + Al 10 g + 水 1 kg → `mat/contacted-wafer` 1 片
     *
     * 6 步：
     *   ① SOG 涂布 + 400–450 °C 固化（0.5–1 µm 氧化层）
     *   ② 接触孔光刻（5 µm 版；孔 1–2 µm）
     *   ③ RIE 开孔（C4F6/O2/Ar，20–60 °C / 1–10 Pa；无终点，定时）
     *   ④ TiN 3 nm ALD（Ti + Cl2 + N2，350–380 °C / 10–100 Pa）
     *   ⑤ 蒸铝 0.5–1 µm + 剥离填孔（0.001–0.01 Pa）
     *   ⑥ 合金 400–450 °C / 30 min
     *
     * ⚠️ 这是 **Al 接触孔，不是 W plug**：没有钨塞、没有 CVD W；SOG 带钠
     * （测试结构 only）；RIE 无终点；TiN 3 nm 孔底覆盖 1.8–2.3 nm。
     * 接触电阻是设计/估算，只有 measure/contact-hole-resistance 测出来才算。
     *
     * 时间：SOG 1 + 光刻 0.5 + RIE 0.5 + ALD 1–2 + 蒸铝/剥离 1.5 + 合金 1
     * + 装卸 ≈ 6 h。
     */
    id: 'make/cmos-contact-hole',
    name: '做完 Al 接触孔的 device 片制造',
    produces: [
      {
        item: 'mat/contacted-wafer',
        qty: q(1),
        gives: [
          { param: 'holeDiameter', kind: 'range', min: 1, max: 2, record: 'mat/contact-hole-record' },
          { param: 'contactResistance', kind: 'range', min: 30, max: 1500, record: 'mat/contact-hole-record' },
          { param: 'barrierThickness', kind: 'range', min: 3, max: 4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/device-wafer', qty: q(1) }] },
      // SOG 1 g：0.5–1 µm × 78.5 cm² × 2.1 = 0.08–0.17 g；取 1 g 留返工
      { anyOf: [{ item: 'mat/spin-on-glass', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/photoresist-sodium-free', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 200) }] },
      // RIE 开孔：C4F6/O2/Ar；与 make/rie-oxide-trench-c4f6 同一族
      { anyOf: [{ item: 'mat/c4f6', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 500) }] },
      // TiN 3 nm：Ti + Cl2 + N2；与 make/tin-3nm-ald 同一套化学
      { anyOf: [{ item: 'mat/titanium', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 200) }] },
      // Al 10 g：填孔 + pad 净耗 <1 µg；10 g 是蒸发舟装料
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: [
      'std/photomask-general',
      'plant/clean-room',
      'plant/metrology-room',
      // ALD TiN 的 13.56 MHz 源与三路气计量
      'plant/rf-13m56',
      'plant/mfc',
    ],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh:
          '① SOG 涂布 + 固化：旋涂 0.25 µm/道 ×2–3 道，400–450 °C / 30 min 固化（缩聚失水缩 20–30 %）⇒ 0.5–1 µm。SOG 是硅酸钠，带钠 1–5 wt% —— 测试结构 only，不是 MOS 级 ILD',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
      {
        note_zh:
          '② 接触孔光刻：5 µm 版、1–2 µm 孔；涂胶/前烘/曝光/显影都在这一步里（机器人涂胶、电阻炉 100–120 前烘、mask-aligner 曝光、湿法槽 NaOH 显影）',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '③ RIE 开孔：C4F6/O2/Ar、20–60 °C / 1–10 Pa；SOG 是硅酸盐，刻蚀速率比热氧化层快 2–3 倍。**没有终点**，只能定时 ±10–15 %；过刻会打穿下面的硅/硅化物',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 1, max: 10 },
        ],
      },
      {
        note_zh:
          '④ TiN 3 nm（ALD）：Ti + Cl2 + N2，350–380 °C / 10–100 Pa；与 `make/tin-3nm-ald`（lowk-barrier.ts:1464）同一套化学。平处 3 nm 连续，孔底内角 60–75 % ⇒ 1.8–2.3 nm；3 nm 在孔底可能不连续（R8）',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 350, max: 380 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '⑤ 蒸铝 0.5–1 µm + 剥离填孔：0.001–0.01 Pa、钨舟 1200 °C。Al 直接填进孔里，**不是 W plug**；孔口会挂边，剥离后留下 Al 塞 + pad',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh:
          '⑥ 合金 400–450 °C / 30 min：Al/TiN/Si 固相烧结，不是 Al–Si 共晶（577 °C）。合金化降低接触电阻，但 Al 的固溶度/团簇问题仍在；孔底 1–2 µm 的接触电阻是设计窗口，测出来才算',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
    ],
    unbalanced_zh:
      'device 片 1（12.8 g）+ SOG 1 g + 无钠胶 1 g + NaOH 5 g + C4F6 1 g + O2 1 g + Ar 2 g + Ti 1 g + Cl2 1 g + N2 5 g + Al 10 g + 水 1 kg → 接触孔片 1。TiN 3–4 nm 只覆盖孔壁/孔底（10 孔 × 1–2 µm 直径 × 1 µm 深 ≈ 3–13 µm²）⇒ **pg 级**；Al 填 10 个孔 ≈ 20–90 pg，加 pad 0.1 µg；两者都远小于投料。Ti/Cl2 的其余在源腔/腔壁，Al 10 g 是蒸发舟装料（99.999 % 留在舟/挡板），SOG 1 g 里成膜 0.08–0.17 g、其余甩掉；C4F6/O2/Ar/N2 是刻蚀/ALD 气，水是冲洗。产物按片计（12.8 g 片 + pg 级 TiN/Al）；差额是源料/气/水，不是账不平',
  },


  {
    /**
     * **device-wafer → SOG 固化 → 反相器专用 6 孔光刻 → RIE → TiN 3 nm →
     * 蒸铝填孔 → 合金 → 反相器接触孔片。**
     *
     *   `mat/device-wafer` 1 + SOG 1 g + 无钠胶 1 g + NaOH 5 g
     *   + C4F6 1 g + O2 1 g + Ar 2 g + Ti 1 g + Cl2 1 g + N2 5 g
     *   + Al 10 g + 水 1 kg → `mat/inverter-contacted-wafer` 1 片
     *
     * 6 个孔（专用版，**不是 TLM/接触孔测试阵列的 5/10/20 µm 版**）：
     *   PMOS 源 → Vdd、NMOS 源 → GND、
     *   PMOS 漏 → OUT、NMOS 漏 → OUT、
     *   PMOS 栅 → IN、NMOS 栅 → IN。
     *
     * 5 µm 规则的排布：
     *   孔 1–2 µm、孔间距 2–3 µm；每管 3 孔一排 = 1+2+1+2+1 = **7 µm**
     *   （1 µm 孔）或 2+3+2+3+2 = **12 µm**（2 µm 孔）。
     *   两管之间留 **5 µm 阱间距** ⇒ 单元宽 7+5+7 = **19 µm** 到
     *   12+5+12 = **29 µm**；高 6–8 µm。100 mm 片上放得下，套刻 ±0.25 µm。
     *
     * 版图是设计输入：6 孔坐标来自 `std/inverter-layout-general`（5 层、5 µm、
     * die 30×25 µm），版图与接触孔同源。孔相对管子的位置由设计定义，不再靠猜；
     * 本层不模拟坐标/DRC，也没有套刻实测。前道片是否按同一版图制造，要靠
     * 版图与工艺共同保证。
     *
     * 若前道不能重排，最少是 **4 孔**（PMOS 源/Vdd、NMOS 源/GND、
     * 公共漏/OUT、公共栅/IN），但那是把两管漏/栅短接的另一拓扑；
     * 本文件按设计输入选 6 孔，不把 4 孔写成默认。
     *
     * 时间：SOG 1 + 光刻 0.5 + RIE 0.5 + ALD 1–2 + 蒸铝/剥离 1.5 + 合金 1
     * + 装卸 ≈ 6 h。
     */
    id: 'make/cmos-inverter-contact',
    name: '反相器接触片制造',
    produces: [
      {
        item: 'mat/inverter-contacted-wafer',
        qty: q(1),
        gives: [
          { param: 'holeCount', kind: 'range', min: 6, max: 6 },
          { param: 'holeDiameter', kind: 'range', min: 1, max: 2 },
          { param: 'contactResistance', kind: 'range', min: 30, max: 1500 },
          { param: 'barrierThickness', kind: 'range', min: 3, max: 4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/device-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/spin-on-glass', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/photoresist-sodium-free', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/c4f6', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/titanium', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: [
      'std/photomask-general',
      'std/inverter-layout-general',
      'plant/clean-room',
      'plant/metrology-room',
      'plant/rf-13m56',
      'plant/mfc',
    ],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh:
          '① SOG 涂布 + 固化：旋涂 0.25 µm/道 ×2–3 道，400–450 °C / 30 min ⇒ 0.5–1 µm。SOG 带钠 1–5 wt%，测试结构 only',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
      {
        note_zh:
          '② 反相器专用接触孔光刻：**6 孔专用版**（不是 TLM 的 5/10/20 µm 版）；孔 1–2 µm、间距 2–3 µm，套刻 ±0.25 µm。6 孔坐标来自 `std/inverter-layout-general`，版图与接触孔同源：PMOS源/Vdd、NMOS源/GND、PMOS漏/OUT、NMOS漏/OUT、PMOS栅/IN、NMOS栅/IN',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '③ RIE 开孔：C4F6/O2/Ar、20–60 °C / 1–10 Pa；SOG 是硅酸盐，速率比热氧化层快 2–3 倍。**没有终点**，只能定时 ±10–15 %；过刻会打穿下面的硅/硅化物',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 1, max: 10 },
        ],
      },
      {
        note_zh:
          '④ TiN 3 nm（ALD）：Ti + Cl2 + N2，350–380 °C / 10–100 Pa；与 `make/tin-3nm-ald`（lowk-barrier.ts:1464）同一套化学。平处 3 nm 连续，孔底 1.8–2.3 nm，可能不连续',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 350, max: 380 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '⑤ 蒸铝 0.5–1 µm + 剥离填孔：0.001–0.01 Pa、钨舟 1200 °C。Al 填 6 个孔 + 孔口挂边；**不是 W plug**，没有钨塞/CVD W',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh:
          '⑥ 合金 400–450 °C / 30 min：Al/TiN/Si 固相烧结，不是 Al–Si 共晶（577 °C）。6 个孔的接触电阻 30–1500 Ω/孔仍是设计值；测出来才算',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
    ],
    unbalanced_zh:
      'device 片 1（12.8 g）+ SOG 1 g + 无钠胶 1 g + NaOH 5 g + C4F6 1 g + O2 1 g + Ar 2 g + Ti 1 g + Cl2 1 g + N2 5 g + Al 10 g + 水 1 kg → 反相器接触孔片 1。TiN 3–4 nm 只覆盖 6 个孔（6 × 1–2 µm 直径 × 1 µm 深 ≈ 5–19 µm²）⇒ **pg 级**；Al 填 6 个孔 ≈ 13–57 pg，加 pad 0.1 µg；两者都远小于投料。Ti/Cl2 的其余在源腔/腔壁，Al 10 g 是蒸发舟装料（99.999 % 留在舟/挡板），SOG 1 g 里成膜 0.08–0.17 g、其余甩掉；C4F6/O2/Ar/N2 是刻蚀/ALD 气，水是冲洗。产物按片计（12.8 g 片 + pg 级 TiN/Al）；差额是源料/气/水，不是账不平',
  },

  {
    /**
     * **有真实 6 孔接触的反相器 —— `make/cmos-inverter` 的并列路线。**
     *
     *   `mat/inverter-contacted-wafer` 1 + Al 10 g + 无钠胶 1 g + NaOH 5 g + 水 1 kg
     *     → `std/cmos-inverter-general` 1 件
     *
     * 与 `make/cmos-inverter` 的差别只在起始片：
     *   · `make/cmos-inverter`：damascene 顶层，Al 直接搭 Cu，**没有接触孔**；
     *   · 本路线：`mat/inverter-contacted-wafer` 已有 6 个按反相器版图开的
     *     Al 接触孔（TiN 3–5 nm + Al 塞），pad/互连再蒸 Al；
     *     接触孔是真的，但接触电阻 30–1500 Ω/孔仍是设计值，没有逐孔实测。
     *
     * 相同点：4 个 100×100 µm pad（Vdd/GND/IN/OUT）、5 µm Al 互连、5 µm 版、
     * lift-off、Vdd 5 V；`gives` 与 `make/cmos-inverter` 逐项相同。
     *
     * ⚠️ **冲突**：item 只声明 vt/gain/voh/vol，不声明 pad 数/线宽；两路的
     * pad 数/线宽相同，不冲突。但 30–1500 Ω/孔会拉低 vol、压低 gain ——
     * 同一个 `gives` 对 contacted 支路偏乐观；本文件不改 item 定义，
     * 只把这条冲突写在注释里，测出来才算。
     *
     * ⚠️ **版图是设计输入**：6 个孔坐标来自 `std/inverter-layout-general`，
     * 与接触孔同源；孔相对管子的位置由设计定义，不再靠猜。本层不模拟坐标/
     * DRC，也没有套刻实测；前道片是否按同一版图制造要靠版图与工艺共同保证。
     */
    id: 'make/cmos-inverter-contacted',
    name: '单级 CMOS 反相器测试结构制造',
    produces: [
      {
        item: 'std/cmos-inverter-general',
        qty: q(1),
        // 与 make/cmos-inverter 逐项一致；不因接触孔另立窗口
        gives: [
          { param: 'vt', kind: 'range', min: 1.5, max: 2.5 },
          { param: 'gain', kind: 'range', min: 3, max: 10 },
          { param: 'voh', kind: 'range', min: 4.5, max: 5.0 },
          { param: 'vol', kind: 'range', min: 0.1, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/inverter-contacted-wafer', qty: q(1) }] },
      // Al 10 g：4 个 pad + 5 µm 互连的净耗 <1 µg；10 g 是蒸发舟一次装料
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/photoresist-sodium-free', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['std/photomask-general', 'std/inverter-layout-general', 'plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① pad/互连光刻：4 个 100×100 µm pad（Vdd/GND/IN/OUT）+ 5 µm Al 互连；版 5 µm 级。6 个反相器接触孔已在 `mat/inverter-contacted-wafer` 里，坐标与 `std/inverter-layout-general` 同源，不需要再开孔；这一步只做 pad/互连（涂胶/前烘/曝光/显影在步骤里）',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '② 蒸铝 0.5–1 µm + 剥离：0.001–0.01 Pa、钨舟 1200 °C；lift-off 只留 pad 与互连。Al 落在接触孔的 Al 塞上，形成“孔塞 + pad”叠层；接触电阻仍是 30–1500 Ω/孔的设计值',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh:
          '③ 检验：`plant/probe-station` 看 IN/OUT 与 Vdd/GND 不短、pad 通断；VTC 另走 `measure/cmos-vtc`。4 根针接 4 个 pad；这一步只判通断，不扫曲线',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '反相器接触孔片 1 片（12.8 g + 6 孔 TiN/Al 塞的 pg 级材料）+ Al 10 g + 无钠胶 1 g + NaOH 5 g + 水 1 kg → 反相器 1 件。4 个 pad 的铝约 0.11 µg、5 µm × 1 cm × 1 µm 互连约 0.14 µg；10 g 是蒸发舟装料，不是净耗（99.999 % 留在舟/挡板）。1 片反相器接触孔片只取 1 个测试结构，其余划片/陪片丢弃 —— 测试结构的固有浪费，不是账不平。产物按件计（1 个反相器），差额是晶圆/铝装料/胶/碱/水',
  },


  {
    /**
     * **2 层大马士革片 → 通孔光刻 → RIE 刻介质 → 蒸铝填孔 → Al 回蚀 → 合金。**
     *
     *   `mat/damascene-layer` 1（layers ≥2、lineWidth ≥3 µm）
     *   + Al 10 g + 无钠胶 1 g + NaOH 5 g + C4F6 1 g + O2 1 g + Ar 2 g + 水 1 kg
     *     → `mat/via-layer` 1 片
     *
     * 5 步：
     *   ① 通孔光刻（5 µm 版；孔 1–2 µm，套刻 ±0.86 µm）
     *   ② RIE 刻介质（C4F6/O2/Ar，20–60 °C / 1–10 Pa；**无终点**，定时）
     *   ③ 蒸铝 0.5–1 µm 填孔（0.001–0.01 Pa）
     *   ④ **Al 回蚀**（5 % NaOH、40 °C、定时；不是 CMP）
     *   ⑤ 合金 400–450 °C / 30 min
     *
     * ⚠️ **Al CMP 不成立**：`plant/cmp-polisher` 是 Cu/SiO₂ 的抛光机；
     * `mat/colloidal-silica` 没有 Al 专用抛光液，Al 软、易划伤，硅溶胶
     * pH 下会点蚀/腐蚀，且没有 Al 终点。改用 5 % NaOH、40 °C 定时回蚀
     * （litho-m3.ts:2191 的同一句）—— 各向同性、dishing/过蚀未标定，记降级。
     *
     * 尺寸：1 µm 孔 + 0.86 µm 套刻在 3 µm 线上的余量
     * 1.5 − 0.5 − 0.86 = **0.14 µm**；1–2 µm 线放不下，所以 need lineWidth ≥3 µm。
     *
     * 时间：光刻 0.5 + RIE 0.5 + 蒸铝/回蚀 2 + 合金 1 + 装卸 ≈ 6 h。
     */
    id: 'make/damascene-via',
    name: '在 2 层大马士革上开通孔制造',
    produces: [
      {
        item: 'mat/via-layer',
        qty: q(1),
        gives: [
          { param: 'viaDiameter', kind: 'range', min: 1, max: 2 },
          { param: 'viaResistance', kind: 'range', min: 0.1, max: 2 },
          { param: 'layers', kind: 'range', min: 2, max: 3 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/damascene-layer',
            qty: q(1),
            need: [
              { param: 'layers', kind: 'range', min: 2, dir: 'atLeast' },
              { param: 'lineWidth', kind: 'range', min: 3000, dir: 'atLeast' },
            ],
            onRelax: 'functional-lost',
          },
        ],
      },
      // Al 10 g：100 个 1 µm 孔 + 0.5 µm overburden 约 0.1 g；10 g 是装料
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/photoresist-sodium-free', qty: q(1, 1000) }] },
      // 显影 + Al 回蚀：NaOH 5 g + 水（0.5 wt% 显影；5 wt% 回蚀另配）
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/c4f6', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['std/photomask-general', 'plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh:
          '① 通孔光刻：5 µm 版、1–2 µm 孔；涂胶/前烘/曝光/显影在步骤里。套刻 ±0.86 µm；1 µm 孔在 3 µm 线上只剩 0.14 µm 余量',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '② RIE 刻介质：C4F6/O2/Ar、20–60 °C / 1–10 Pa；SOG/低 k 是硅酸盐，速率比热氧化层快 2–3 倍。**没有终点**，只能定时 ±10–15 %；过刻会打穿下层铜/阻挡层',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 1, max: 10 },
        ],
      },
      {
        note_zh:
          '③ 蒸铝 0.5–1 µm 填孔：0.001–0.01 Pa、钨舟 1200 °C。Al 填 1–2 µm 孔 + 0.5 µm overburden；不是 Cu 电镀，也不是双大马士革',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh:
          '④ Al 回蚀（**不是 CMP**）：5 % NaOH、40 °C、定时；各向同性，会同时吃孔口/场区 Al，dishing 与过蚀未标定。CMP 不成立：抛光机是 Cu/SiO₂ 的，硅溶胶没有 Al 专用抛光液，Al 软、易划伤/点蚀，且没有 Al 终点',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 38, max: 42 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '⑤ 合金 400–450 °C / 30 min：Al/阻挡层/下层铜固相烧结，不是 Al–Si 共晶（577 °C）。孔里 Al 与下层铜的接触电阻 0.1–2 Ω/孔是设计值；测出来才算',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
    ],
    unbalanced_zh:
      '2 层大马士革片 1（12.8 g + 2–3 层铜）+ Al 10 g + 无钠胶 1 g + NaOH 5 g + C4F6 1 g + O2 1 g + Ar 2 g + 水 1 kg → 通孔片 1。100 个 1 µm 孔填 Al 约 100 × 0.785 µm³ × 2.7 = **0.21 µg**；0.5 µm overburden 约 0.1 g，回蚀掉 95–99 %；10 g 是蒸发舟装料（99.999 % 留在舟/挡板）。C4F6/O2/Ar 是刻蚀气，NaOH 是显影 + 回蚀，水是冲洗。产物按片计（12.8 g + 0.21 µg Al）；差额是源料/气/水，不是账不平',
  },

  {
    /**
     * **2 层大马士革片 → 通孔光刻 → RIE → Ti 2 nm → TiN 5 nm →
     * Cu 电镀填孔 → Cu CMP → 退火 → Cu 通孔片。**
     *
     *   `mat/damascene-layer` 1（layers ≥2、lineWidth ≥3 µm）
     *   + 无钠胶 1 g + NaOH 5 g + C4F6 1 g + O2 1 g + Ar 2 g
     *   + Ti 1 g + Cl2 1 g + N2 5 g + H2 1 g
     *   + superfill 镀液 20 g + Cu 1 g + 硅溶胶 50 g + 重铬酸钠 5 g + 水 1 kg
     *     → `mat/cu-via-layer` 1 片
     *
     * 7 步：
     *   ① 通孔光刻（5 µm 版；孔 1–2 µm，套刻 ±0.86 µm）
     *   ② RIE 刻介质（C4F6/O2/Ar，20–60 °C / 1–10 Pa；**无终点**，定时）
     *   ③ Ti 2 nm PEALD（TiCl₄ + H₂ 等离子体；350–380 °C / 10–100 Pa）
     *   ④ TiN 5 nm ALD（350–380 °C / 10–100 Pa；多循环，设备不变）
     *   ⑤ Cu 籽晶 + 电镀填孔（40–50 °C / 15–20 kPa）
     *   ⑥ Cu CMP（15–30 kPa；硅溶胶 + 重铬酸钠）
     *   ⑦ 退火 400–450 °C / 30 min
     *
     * ⚠️ **成立但降级**（主机都在，H₂ 气路已补，Ti PEALD 工艺未验证）：
     *   · Ti 2 nm：`plant/ald-reactor` + `rf-electrode` + `plant/rf-13m56`
     *     在；TiCl₄ 由 Ti + Cl₂ 就地氯化。**H₂ 走 `plant/ald-reactor/h2-line`
     *     第五路**（四路吹扫板加第五路 H₂、MFC 按 H₂ 重标），不再占 NH₃/H₂O
     *     那一路；Ti/TiN 同腔连做时两路都在。
     *     **气路缺口已闭合，但 Ti PEALD 工艺未验证**：Cl/O 含量、HCl 对泵/
     *     腔壁的腐蚀、1 Pa 底压下的残气氧化都没有量具。这是 B 类工艺降级，
     *     不是气路缺失；工艺不成立就回 TiN 5 nm。热还原要 900–1100 °C，
     *     本机 400 °C 上限做不到，只能等离子体。Ti 与 TiN 同腔连做、不破
     *     真空（Ti 见空气成 TiO₂）；Ti 必须压在 TiN 下面（TiCu₃）。
     *   · Cu 电镀换 `mat/superfill-bath-3`（Cl⁻ + 硫脲 + JGB，additiveCount=3）：
     *     `make/plating-superfill-peg` 在 AR ≤2 时交 **voidFraction ≤1 %**，
     *     via AR≈0.6 落在窗口内；additiveCount=3 / concentration≥100 的 need
     *     都满足。**这是设计值、未测**：e-beam 只能看见 6–9 % 以上。
     *   · Cu CMP：加 `plant/cmp-integration`（硬垫 + 870 nm 光学终点）与
     *     `plant/cmp-uniformity-kit`（两区闭环）；执行者仍是 `plant/cmp-polisher`。
     *     dishing **7–30 nm**、erosion **30–60 nm** 是硬垫设计窗口，**不是现状**：
     *     现状 200–230 nm 来自毡垫 `make/damascene-cmp`，保留作对照。没有实测。
     *   · TiN 5 nm：多 ALD 循环把 3 nm 的针孔封住；台阶覆盖 **96–99 % 是
     *     设计值，没有 TEM/漏电实测**。孔底内角 60–75 % ⇒ TiN 3.0–3.75 nm，
     *     加 Ti 2 nm 的 60–75 % ⇒ 孔底合计 4.2–5.25 nm；e-beam 只能看 6–9 %
     *     以上的空洞，**针孔看不见**。1 µm 孔名义净径减 2×7 = 14 nm（986 nm），
     *     按孔底内角口径减 8.4–10.5 nm，都可忽略。Cu 仍是 Si 里的深能级复合
     *     中心，阻挡层断了就是漏电/寿命问题。
     *   · 100 孔串联 + 单孔 ≤1 %（设计值）空洞 ⇒ `chainYield 80–100 %`
     *     仍只是设计窗口。
     *   · 没有 `mat/plating-ready-wafer` 这一环：本路线直接吃 damascene-layer，
     *     自己算 AR≈0.6；与 `make/plating-superfill-peg` 的 ready-wafer 接口是缺口。
     *
     * 不是完整双大马士革：只有 via 段，没有沟槽/金属层一体化。
     * 时间：光刻 0.5 + RIE 0.5 + Ti PEALD 0.5–1 + TiN ALD 1–2 + 电镀 1 +
     * CMP 1.5 + 退火 1 + 装卸 ≈ 9 h。
     */
    id: 'make/damascene-via-cu',
    name: 'Cu 通孔片制造',
    produces: [
      {
        item: 'mat/cu-via-layer',
        qty: q(1),
        gives: [
          { param: 'viaDiameter', kind: 'range', min: 1, max: 2 },
          { param: 'viaResistance', kind: 'range', min: 0.05, max: 0.5 },
          { param: 'layers', kind: 'range', min: 2, max: 3 },
          { param: 'dishing', kind: 'range', min: 7, max: 30, record: 'mat/dishing-record' },
          { param: 'erosion', kind: 'range', min: 30, max: 60, record: 'mat/dishing-record' },
          { param: 'barrierThickness', kind: 'range', min: 7, max: 7 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/damascene-layer',
            qty: q(1),
            need: [
              { param: 'layers', kind: 'range', min: 2, dir: 'atLeast' },
              { param: 'lineWidth', kind: 'range', min: 3000, dir: 'atLeast' },
            ],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/photoresist-sodium-free', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/c4f6', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 500) }] },
      // Ti 2 nm + TiN 5 nm：Ti 1 g 够两层（TiN 0.16 mg + Ti 0.06 mg），
      // Cl2 是就地氯化成 TiCl4 的氯源；H2 是 Ti 的等离子体还原气
      { anyOf: [{ item: 'mat/titanium', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 1000) }] },
      // Cu 镀液 20 g + Cu 1 g：100 个 1 µm 孔 + overburden 约 0.1 g
      { anyOf: [{ item: 'mat/superfill-bath-3', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 1000) }] },
      // Cu CMP：硅溶胶 50 g + 重铬酸钠 5 g（damascene 的同一口径）
      { anyOf: [{ item: 'mat/colloidal-silica', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/sodium-dichromate', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: [
      'std/photomask-general',
      'plant/clean-room',
      'plant/metrology-room',
      'plant/rf-13m56',
      'plant/mfc',
      // CMP 硬垫 + 870 nm 光学终点；均匀性两区闭环
      'plant/cmp-integration',
      'plant/cmp-uniformity-kit',
    ],
    rate: { hours: q(9) },
    steps: [
      {
        note_zh:
          '① 通孔光刻：5 µm 版、1–2 µm 孔；套刻 ±0.86 µm；1 µm 孔在 3 µm 线上只剩 0.14 µm 余量',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '② RIE 刻介质：C4F6/O2/Ar、20–60 °C / 1–10 Pa；**没有终点**，只能定时 ±10–15 %；过刻会打穿下层铜/阻挡层',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 1, max: 10 },
        ],
      },
      {
        note_zh:
          '③ Ti 2 nm（PEALD）：TiCl₄ + H₂ 等离子体还原，350–380 °C / 10–100 Pa；TiCl₄ 由 Ti 屑 + Cl₂ 在 `plant/resistance-furnace` 300–400 °C 就地氯化后进源池，H₂ 走 `plant/ald-reactor/h2-line` 第五路（四路吹扫板加第五路 H₂、独立 H₂ MFC 按 H₂ 重标）。**Ti 与 TiN 同腔连做、不破真空** —— Ti 见空气就成 TiO₂，粘附/成核作用就没了。**H₂ 气路已补**（`plant/ald-reactor/h2-line`，四路吹扫板加第五路 H₂、MFC 按 H₂ 重标）；**Ti PEALD 工艺仍未验证**：Cl/O 含量、HCl 对泵/腔壁的腐蚀、残气氧化（1 Pa 底压、无 RGA）都没实测，2 nm 要 40–100 周期也未实测；工艺不成立则 Ti 2 nm 不成立，回 TiN 5 nm。热还原要 900–1100 °C，本机 400 °C 上限做不到，只能等离子体。',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 350, max: 380 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '④ TiN 5 nm（ALD）：Ti + Cl2 + N2 就地做 TiCl₄，350–380 °C / 10–100 Pa，N₂ 等离子体 200 W；多 ALD 循环，设备不变。**TiN 必须盖住 Ti，不能反序**：Ti 与 Cu 在 300–450 °C 生成 TiCu₃，Ti 本身也不挡 Cu。覆盖 96–99 % 是设计值、没有 TEM/漏电实测；孔底内角 60–75 % ⇒ TiN 3.0–3.75 nm，加 Ti 2 nm 的 60–75 % ⇒ 孔底合计 4.2–5.25 nm。e-beam 看不见针孔；1 µm 孔名义净径减 2×7 = 14 nm（986 nm），按孔底内角口径减 8.4–10.5 nm，都可忽略',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 350, max: 380 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '⑤ Cu 籽晶 + 电镀填孔：`plant/plating-bath` 40–50 °C / 15–20 kPa、2 A/dm²、26.5 µm/h。换 `mat/superfill-bath-3`（additiveCount=3，AR≤2）后 **voidFraction ≤1 %**（设计值、未测；e-beam 看不见 0–1 %）；没有 `mat/plating-ready-wafer`，AR≈0.6 是本路线自己算的',
        performedBy: 'plant/plating-bath',
        under: [
          { param: 'temperature', min: 40, max: 50 },
          { param: 'pressure', min: 15, max: 20 },
        ],
      },
      {
        note_zh:
          '⑥ Cu CMP：`plant/cmp-polisher` 15–30 kPa、硅溶胶 + 重铬酸钠；加 `plant/cmp-integration`（硬垫 + 870 nm 光学终点）与 `plant/cmp-uniformity-kit`（两区闭环）。dishing 7–30 nm、erosion 30–60 nm 是设计窗口，不是实测；现状 200–230 nm 只在毡垫 `make/damascene-cmp` 那一档',
        performedBy: 'plant/cmp-polisher',
        under: [{ param: 'pressure', min: 15, max: 30 }],
      },
      {
        note_zh:
          '⑦ 退火 400–450 °C / 30 min：Cu 晶粒长大/应力松弛；温度上限 450 留给 Cu 扩散与低 k 的余量。阻挡层若断，Cu 进 Si 就是深能级复合中心；Ti 若没被 TiN 盖住，就在这里生成 TiCu₃',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
    ],
    unbalanced_zh:
      '2 层大马士革片 1（12.8 g + 2–3 层铜）+ 无钠胶 1 g + NaOH 5 g + C4F6 1 g + O2 1 g + Ar 2 g + Ti 1 g + Cl2 1 g + N2 5 g + H2 1 g + Cu 镀液 20 g + Cu 1 g + 硅溶胶 50 g + 重铬酸钠 5 g + 水 1 kg → Cu 通孔片 1。100 个 1 µm 孔填 Cu 约 100 × 0.785 µm³ × 8.96 = **0.70 ng**；0.5 µm overburden 约 0.35 g，CMP 磨掉 95–99 %。Cu 源 1 g、镀液 20 g、硅溶胶 50 g 都是过量装料；Ti/Cl2 的其余在源腔/腔壁，H2 的其余在尾气。产物按片计（12.8 g + 0.7 ng Cu）；差额是源料/镀液/浆/水，不是账不平',
  },

  {
    /**
     * **2 层大马士革通孔片 → pad 光刻 → 蒸铝/剥离 → 通孔链。**
     *
     *   `mat/via-layer` 1（layers 2–3、viaDiameter 1–2 µm）
     *   + Al 10 g + 无钠胶 1 g + NaOH 5 g + 水 1 kg
     *     → `std/via-chain-general` 1 件
     *
     * 100 个 1 µm 通孔已经在 `mat/via-layer` 里（Al 填孔 + 回蚀），
     * 本路线只做两端 100×100 µm Al pad；不再假设 damascene 层里已有通孔。
     *
     * 为什么 need layers ≥2：通孔链要两层金属；`mat/via-layer` 交 2–3 层，
     * 1 层的片不够。1 µm 孔 + 0.86 µm 套刻在 3 µm 线上的余量
     * 1.5 − 0.5 − 0.86 = **0.14 µm**，由 `make/damascene-via` 的
     * lineWidth ≥3 µm need 保证。
     *
     * 时间：光刻 0.5 + 蒸铝/剥离 1.5 + 检验 0.5 + 装卸 ≈ 4 h。
     */
    id: 'make/via-chain',
    name: '2 层金属通孔链制造',
    produces: [
      {
        item: 'std/via-chain-general',
        qty: q(1),
        gives: [
          { param: 'viaResistance', kind: 'range', min: 0.1, max: 1 },
          { param: 'chainYield', kind: 'range', min: 80, max: 100 },
          { param: 'viaDiameter', kind: 'range', min: 1, max: 1, record: 'mat/via-resistance-record' },
          { param: 'leakageCurrent', kind: 'range', min: 1e-12, max: 0.000001, record: 'mat/barrier-leakage-record' },
          { param: 'breakdownVoltage', kind: 'range', min: 0, max: 200, record: 'mat/barrier-leakage-record' },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/via-layer',
            qty: q(1),
            need: [
              { param: 'layers', kind: 'range', min: 2, dir: 'atLeast' },
            ],
            onRelax: 'functional-lost',
          },
        ],
      },
      // Al 10 g：2 个 pad + 引线净耗 <1 µg；10 g 是蒸发舟一次装料
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/photoresist-sodium-free', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['std/photomask-general', 'plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① pad 光刻：两端各 1 个 100×100 µm Al pad，5 µm 版；涂胶/前烘/曝光/显影在步骤里。100 个 1 µm 通孔已在 `mat/via-layer` 里，本步不刻孔',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '② 蒸铝 0.5–1 µm + 剥离：0.001–0.01 Pa、钨舟 1200 °C；lift-off 只留两端 pad 与引线。Al 落在顶层铜上；通孔链的电阻仍由 100 个通孔决定',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh:
          '③ 检验：`plant/probe-station` 看两端 pad 不短、链通断；四线法测链电阻另走 `measure/via-resistance`。1 µm 通孔/100 孔串联，单孔开就整链开',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '通孔片 1（12.8 g + 2–3 层铜 + 100 个 Al 通孔）+ Al 10 g + 无钠胶 1 g + NaOH 5 g + 水 1 kg → 通孔链 1 件。2 个 pad 的铝约 2 × 100×100 µm² × 1 µm × 2.7 = **0.054 µg**，引线再加 ~0.1 µg；10 g 是蒸发舟装料（99.999 % 留在舟/挡板）。100 个 1 µm 通孔已在 `mat/via-layer` 里，本路线不新增通孔材料；1 片只取 1 个测试结构，其余划片/陪片丢弃。产物按件计（1 条链），差额是晶圆/铝装料/胶/碱/水',
  },

  {
    /**
     * **Cu 通孔片 → pad 光刻 → 蒸铝/剥离 → 通孔链（并列 Al 路线）。**
     *
     *   `mat/cu-via-layer` 1（layers 2–3、viaDiameter 1–2 µm）
     *   + Al 10 g + 无钠胶 1 g + NaOH 5 g + 水 1 kg
     *     → `std/via-chain-general` 1 件
     *
     * 与 `make/via-chain`（Al 回蚀）的差别只在起始片：Cu 通孔是
     * Ti 2 nm + TiN 5 nm + Cu 电镀 + Cu CMP + 退火；本路线只做 pad，
     * 不重复填孔。
     *
     * ⚠️ **gives 冲突**：同一个 item 的 `chainYield 80–100 %` 对 Cu 路线
     * 偏乐观。Cu 电镀用三组分 bath 后 void 设计 **≤1 %**（未测）；100 孔串联时
     * 整链良率仍可能低于 80 %。按任务要求 gives 与 Al 路线一致，不改 item；
     * 冲突记在这里，测出来才算。
     *
     * 时间：光刻 0.5 + 蒸铝/剥离 1.5 + 检验 0.5 + 装卸 ≈ 4 h。
     */
    id: 'make/via-chain-cu',
    name: '2 层金属通孔链制造',
    produces: [
      {
        item: 'std/via-chain-general',
        qty: q(1),
        // 与 make/via-chain 逐项一致；不因 Cu/Al 另立窗口
        gives: [
          { param: 'viaResistance', kind: 'range', min: 0.1, max: 1 },
          { param: 'chainYield', kind: 'range', min: 80, max: 100 },
          { param: 'viaDiameter', kind: 'range', min: 1, max: 1, record: 'mat/via-resistance-record' },
          { param: 'leakageCurrent', kind: 'range', min: 1e-12, max: 0.000001, record: 'mat/barrier-leakage-record' },
          { param: 'breakdownVoltage', kind: 'range', min: 0, max: 200, record: 'mat/barrier-leakage-record' },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/cu-via-layer',
            qty: q(1),
            need: [
              { param: 'layers', kind: 'range', min: 2, dir: 'atLeast' },
            ],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/photoresist-sodium-free', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['std/photomask-general', 'plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① pad 光刻：两端各 1 个 100×100 µm Al pad，5 µm 版；100 个 1 µm Cu 通孔已在 `mat/cu-via-layer` 里，本步不刻孔',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '② 蒸铝 0.5–1 µm + 剥离：0.001–0.01 Pa、钨舟 1200 °C；lift-off 只留两端 pad 与引线。Cu 通孔链的电阻由 100 个 Cu 通孔 + TiN/Cu 界面决定，Ti 2 nm 在 TiN 下面、不直接贴 Cu',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh:
          '③ 检验：`plant/probe-station` 看两端 pad 不短、链通断；四线法另走 `measure/via-resistance`。Cu 填充 void 设计 ≤1 %（未测），单孔开就整链开',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'Cu 通孔片 1（12.8 g + 2–3 层铜 + 100 个 Cu 通孔）+ Al 10 g + 无钠胶 1 g + NaOH 5 g + 水 1 kg → 通孔链 1 件。2 个 pad 的铝约 2 × 100×100 µm² × 1 µm × 2.7 = **0.054 µg**，引线再加 ~0.1 µg；10 g 是蒸发舟装料（99.999 % 留在舟/挡板）。100 个 1 µm Cu 通孔已在 `mat/cu-via-layer` 里，本路线不新增通孔材料；1 片只取 1 个测试结构，其余划片/陪片丢弃。产物按件计（1 条链），差额是晶圆/铝装料/胶/碱/水',
  },


  {
    /**
     * **via-first 双大马士革：通孔 + 沟槽一次 Cu 填、Cu CMP、退火。**
     *
     *   `mat/damascene-layer` 1（layers ≥2、lineWidth ≥3 µm）
     *   + 无钠胶 1 g + NaOH 5 g + C4F6 1 g + O2 1 g + Ar 2 g
     *   + Ti 1 g + Cl2 1 g + N2 5 g + H2 1 g
     *   + superfill 镀液 20 g + Cu 1 g + 硅溶胶 50 g + 重铬酸钠 5 g + 水 1 kg
     *     → `mat/dual-damascene-layer` 1 片
     *
     * 9 步：
     *   ① 通孔光刻（第一块版；1–2 µm 孔，套刻 ±0.86 µm）
     *   ② RIE 刻通孔（无终点，定时 ±10–15 %）
     *   ③ 沟槽光刻（第二块版；套刻 ±0.86 µm）
     *   ④ RIE 刻沟槽（无终点，定时）
     *   ⑤ Ti 2 nm PEALD（TiCl₄ + H₂ 等离子体；台阶覆盖 96–99 % 是设计值）
     *   ⑥ TiN 5 nm ALD（多循环；台阶覆盖 96–99 % 是设计值）
     *   ⑦ Cu 电镀一次填 via+trench（40–50 °C / 15–20 kPa）
     *   ⑧ Cu CMP（15–30 kPa；硬垫 + 870 nm 光学终点，dishing 7–30 nm）
     *   ⑨ 退火 400–450 °C / 30 min
     *
     * 两块版余量：
     *   3 µm 线、1 µm 孔、±0.86 µm：1.5 − 0.5 − 0.86 = **0.14 µm**（每界面）。
     *   若把两块版误差相加：1.5 − 0.5 − 1.72 = **−0.72 µm** ⇒ 3 µm 线排不下；
     *   5 µm 线 = 2.5 − 0.5 − 1.72 = **+0.28 µm**。
     *   本路线按“每界面各自 ±0.86”写；相加读法只有 5 µm 成立。0.14 µm 是
     *   紧窗口，不是安全余量。
     *
     * ⚠️ **void/dishing 改善，Ti 2 + TiN 5 是设计**：换 `mat/superfill-bath-3`
     * （Cl⁻ + 硫脲 + JGB，additiveCount=3）后 voidFraction 设计 **≤1 %**
     * （AR≈0.6；`make/plating-superfill-peg` 的 AR ≤2 窗口；**设计值、未测**，
     * e-beam 只能看见 6–9 % 以上）。Cu CMP 换硬垫 + 光学终点后 dishing
     * **7–30 nm**、erosion **30–60 nm**（设计窗口，不是现状）。Ti 2 nm 粘附/
     * 成核 + TiN 5 nm 阻挡；TiN 用多 ALD 循环封 3 nm 针孔，台阶覆盖
     * **96–99 % 是设计值，没有 TEM/漏电实测**；孔底 TiN 3.0–3.75 nm +
     * Ti 1.2–1.5 nm = 4.2–5.25 nm。Ti 必须压在 TiN 下面（TiCu₃），Ti/TiN
     * 同腔连做（Ti 见空气成 TiO₂）；Ti 2 nm 的 H₂ 气路已补（`h2-line`），
     * 剩 Ti PEALD 工艺未验证（Cl/O、HCl 腐蚀、残气氧化），工艺不成立回 TiN 5 nm。
     * 1 µm 孔名义净径减 2×7 = 14 nm（986 nm），按孔底内角口径
     * 减 8.4–10.5 nm，都可忽略。双大马士革只是把两段并成一次填铜。
     *
     * 时间：两道光刻 1 + 两次 RIE 1 + Ti PEALD 0.5–1 + TiN ALD 1–2 +
     * 电镀 1.5 + CMP 2 + 退火 1 + 装卸 ≈ 11 h。
     */
    id: 'make/dual-damascene',
    name: 'via-first 双大马士革片制造',
    produces: [
      {
        item: 'mat/dual-damascene-layer',
        qty: q(1),
        gives: [
          { param: 'layers', kind: 'range', min: 3, max: 4 },
          { param: 'viaDiameter', kind: 'range', min: 1, max: 2 },
          { param: 'viaResistance', kind: 'range', min: 0.05, max: 0.5 },
          { param: 'lineWidth', kind: 'range', min: 3, max: 5 },
          { param: 'dishing', kind: 'range', min: 7, max: 30, record: 'mat/dishing-record' },
          { param: 'erosion', kind: 'range', min: 30, max: 60, record: 'mat/dishing-record' },
          { param: 'barrierThickness', kind: 'range', min: 7, max: 7 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/damascene-layer',
            qty: q(1),
            need: [
              { param: 'layers', kind: 'range', min: 2, dir: 'atLeast' },
              { param: 'lineWidth', kind: 'range', min: 3000, dir: 'atLeast' },
            ],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/photoresist-sodium-free', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/c4f6', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 500) }] },
      // Ti 2 nm + TiN 5 nm：Ti 1 g 够两层；Cl2 就地氯化成 TiCl4；H2 是 Ti 的还原气
      { anyOf: [{ item: 'mat/titanium', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/superfill-bath-3', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/colloidal-silica', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/sodium-dichromate', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: [
      'std/photomask-general',
      'plant/clean-room',
      'plant/metrology-room',
      'plant/rf-13m56',
      'plant/mfc',
      // CMP 硬垫 + 870 nm 光学终点；均匀性两区闭环
      'plant/cmp-integration',
      'plant/cmp-uniformity-kit',
    ],
    rate: { hours: q(11) },
    steps: [
      {
        note_zh:
          '① 通孔光刻：第一块版、1–2 µm 孔，套刻 ±0.86 µm；涂胶/前烘/曝光/显影在步骤里',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '② RIE 刻通孔：C4F6/O2/Ar、20–60 °C / 1–10 Pa；**没有终点**，只能定时 ±10–15 %。via-first 先只刻到下层阻挡/停止层',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 1, max: 10 },
        ],
      },
      {
        note_zh:
          '③ 沟槽光刻：第二块版、3–5 µm 线，套刻 ±0.86 µm。两块版各 0.86；3 µm 线每界面余量 0.14，相加读法则 −0.72（见注释）',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '④ RIE 刻沟槽：C4F6/O2/Ar、20–60 °C / 1–10 Pa；**没有终点**，定时 ±10–15 %。沟槽与通孔在介质里形成 via-first 的双大马士革轮廓',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 1, max: 10 },
        ],
      },
      {
        note_zh:
          '⑤ Ti 2 nm（PEALD）：TiCl₄ + H₂ 等离子体还原，350–380 °C / 10–100 Pa；TiCl₄ 由 Ti 屑 + Cl₂ 在 `plant/resistance-furnace` 300–400 °C 就地氯化后进源池，H₂ 走 `plant/ald-reactor/h2-line` 第五路（四路吹扫板加第五路 H₂、独立 H₂ MFC 按 H₂ 重标）。**Ti 与 TiN 同腔连做、不破真空** —— Ti 见空气就成 TiO₂，粘附/成核作用就没了。**H₂ 气路已补**（`plant/ald-reactor/h2-line`，四路吹扫板加第五路 H₂、MFC 按 H₂ 重标）；**Ti PEALD 工艺仍未验证**：Cl/O 含量、HCl 对泵/腔壁的腐蚀、残气氧化（1 Pa 底压、无 RGA）都没实测，2 nm 要 40–100 周期也未实测；工艺不成立则 Ti 2 nm 不成立，回 TiN 5 nm。热还原要 900–1100 °C，本机 400 °C 上限做不到，只能等离子体。',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 350, max: 380 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '⑥ TiN 5 nm（ALD）：Ti + Cl2 + N2 就地做 TiCl₄，350–380 °C / 10–100 Pa，N₂ 等离子体 200 W；多 ALD 循环，设备不变。**TiN 必须盖住 Ti，不能反序**：Ti 与 Cu 在 300–450 °C 生成 TiCu₃，Ti 本身也不挡 Cu。覆盖 96–99 % 是设计值、没有 TEM/漏电实测；孔底内角 60–75 % ⇒ TiN 3.0–3.75 nm，加 Ti 2 nm 的 60–75 % ⇒ 孔底合计 4.2–5.25 nm。e-beam 看不见针孔；1 µm 孔名义净径减 2×7 = 14 nm（986 nm），按孔底内角口径减 8.4–10.5 nm，都可忽略',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 350, max: 380 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '⑦ Cu 电镀一次填 via+trench：`plant/plating-bath` 40–50 °C / 15–20 kPa、2 A/dm²、26.5 µm/h。换 `mat/superfill-bath-3`（additiveCount=3，AR≤2）后 **voidFraction ≤1 %**（设计值、未测；e-beam 看不见 0–1 %）；dishing/TiN 没改善。没有 `mat/plating-ready-wafer`，AR≈0.6 是本路线自己算的',
        performedBy: 'plant/plating-bath',
        under: [
          { param: 'temperature', min: 40, max: 50 },
          { param: 'pressure', min: 15, max: 20 },
        ],
      },
      {
        note_zh:
          '⑧ Cu CMP：`plant/cmp-polisher` 15–30 kPa、硅溶胶 + 重铬酸钠；加 `plant/cmp-integration`（硬垫 + 870 nm 光学终点）与 `plant/cmp-uniformity-kit`（两区闭环）。dishing 7–30 nm、erosion 30–60 nm 是设计窗口，不是实测；现状 200–230 nm 只在毡垫 `make/damascene-cmp` 那一档',
        performedBy: 'plant/cmp-polisher',
        under: [{ param: 'pressure', min: 15, max: 30 }],
      },
      {
        note_zh:
          '⑨ 退火 400–450 °C / 30 min：Cu 晶粒长大/应力松弛；温度上限 450 留给 Cu 扩散与低 k 的余量。阻挡层若断，Cu 进 Si 就是深能级复合中心；Ti 若没被 TiN 盖住，就在这里生成 TiCu₃',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
    ],
    unbalanced_zh:
      '2 层大马士革片 1（12.8 g + 2–3 层铜）+ 无钠胶 1 g + NaOH 5 g + C4F6 1 g + O2 1 g + Ar 2 g + Ti 1 g + Cl2 1 g + N2 5 g + H2 1 g + Cu 镀液 20 g + Cu 1 g + 硅溶胶 50 g + 重铬酸钠 5 g + 水 1 kg → 双大马士革片 1。沟槽 + 通孔净填 Cu 约 **14 mg**（0.4 µm 深 × 3–5 µm 线 × 50 % 覆盖）；0.5 µm overburden 约 0.35 g，CMP 磨掉 95–99 %。Cu 源 1 g、镀液 20 g、硅溶胶 50 g 都是过量装料；Ti/Cl2 的其余在源腔/腔壁，H2 的其余在尾气。产物按片计（12.8 g + 14 mg Cu）；差额是源料/镀液/浆/水，不是账不平',
  },

  {
    /**
     * **双大马士革片 → pad 光刻 → 蒸铝/剥离 → 通孔链（第三条并列路线）。**
     *
     *   `mat/dual-damascene-layer` 1（layers ≥3、viaDiameter ≤1 µm）
     *   + Al 10 g + 无钠胶 1 g + NaOH 5 g + 水 1 kg
     *     → `std/via-chain-general` 1 件
     *
     * via 已含在双大马士革层内；本路线只做两端 100×100 µm Al pad，
     * 不再刻孔、不再填 Cu。gives 与 Al/Cu 两条逐项一致。
     *
     * 两块版余量仍按每界面 ±0.86：3 µm 线 1.5 − 0.5 − 0.86 = **0.14 µm**；
     * 相加读法 3–4 µm 不成立，5 µm 线 +0.28。void ≤1 %（设计）/ dishing 7–30 nm（设计）
     * 原样保留，不因接入链而改善。
     *
     * 时间：光刻 0.5 + 蒸铝/剥离 1.5 + 检验 0.5 + 装卸 ≈ 4 h。
     */
    id: 'make/via-chain-dual',
    name: '2 层金属通孔链制造',
    produces: [
      {
        item: 'std/via-chain-general',
        qty: q(1),
        // 与 make/via-chain / make/via-chain-cu 逐项一致
        gives: [
          { param: 'viaResistance', kind: 'range', min: 0.1, max: 1 },
          { param: 'chainYield', kind: 'range', min: 80, max: 100 },
          { param: 'viaDiameter', kind: 'range', min: 1, max: 1, record: 'mat/via-resistance-record' },
          { param: 'leakageCurrent', kind: 'range', min: 1e-12, max: 0.000001, record: 'mat/barrier-leakage-record' },
          { param: 'breakdownVoltage', kind: 'range', min: 0, max: 200, record: 'mat/barrier-leakage-record' },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/dual-damascene-layer',
            qty: q(1),
            need: [
              { param: 'layers', kind: 'range', min: 3, dir: 'atLeast' },
              // 直径 1 µm：≤1 在正直径上等价于 1–1
              { param: 'viaDiameter', kind: 'range', min: 1, max: 1 },
            ],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/photoresist-sodium-free', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['std/photomask-general', 'plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① pad 光刻：两端各 1 个 100×100 µm Al pad，5 µm 版；100 个 1 µm 通孔已含在双大马士革层内，本步不刻孔、不填 Cu',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '② 蒸铝 0.5–1 µm + 剥离：0.001–0.01 Pa、钨舟 1200 °C；lift-off 只留两端 pad 与引线。通孔链的电阻仍由层内 100 个双大马士革通孔决定',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh:
          '③ 检验：`plant/probe-station` 看两端 pad 不短、链通断；四线法另走 `measure/via-resistance`。void 设计 ≤1 %（未测）仍在，单孔开就整链开',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '双大马士革片 1（12.8 g + 3–4 层铜 + 100 个 via） + Al 10 g + 无钠胶 1 g + NaOH 5 g + 水 1 kg → 通孔链 1 件。2 个 pad 的铝约 2 × 100×100 µm² × 1 µm × 2.7 = **0.054 µg**，引线再加 ~0.1 µg；10 g 是蒸发舟装料（99.999 % 留在舟/挡板）。100 个 1 µm 通孔已含在双大马士革层里，本路线不新增通孔材料；1 片只取 1 个测试结构，其余划片/陪片丢弃。产物按件计（1 条链），差额是晶圆/铝装料/胶/碱/水',
  },




  {
    /**
     * **Al 塞回蚀 → 去气 → Ti 2 nm → TiN 5 nm → W 成核 → W CVD → W CMP →
     * 退火 → W plug 片。**
     *
     *   `mat/contacted-wafer` 1 + Ti 1 g + Cl2 1 g + N2 5 g
     *   + WF6 10 g + H2 1 g + NaOH 5 g + 水 1 kg
     *   + 硅溶胶 20 g + H2O2 5 g → `mat/w-plug-wafer` 1 片
     *
     * ⚠️ **contacted-wafer 是 Al 塞**：直接在上面做 W 只是 W-on-Al，不是 W plug。
     * 所以第①步先用 5 % NaOH、40 °C 把 Al 塞回蚀掉，露出接触孔和 TiN；
     * 再补 Ti 2 nm + TiN 5 nm，W 才能从孔底长。
     *
     * **Ti 2 nm + TiN 5 nm**：W plug 没有 Cu，TiCu₃ 不适用；Ti 仍是粘附/成核层，
     * TiN 仍是扩散阻挡，TiN 必须盖住 Ti（防止 W/F 与 Ti 反应）。总厚 7 nm；
     * TiN 覆盖 96–99 % 是设计值，孔底 TiN 3.0–3.75 nm + Ti 1.2–1.5 nm =
     * 4.2–5.25 nm。Ti/TiN 同腔连做、不破真空；Ti 2 nm 的 H₂ 气路已补
     * （`plant/ald-reactor/h2-line`），剩 Ti PEALD 工艺未验证（Cl/O、HCl 腐蚀、
     * 残气氧化，见文件头），工艺不成立就回 TiN 5 nm。contacted-wafer 原有 TiN 3–5 nm 若
     * 未被 NaOH 完全去掉，总阻挡是 10–12 nm，不是 7 nm。
     *
     * W CVD：WF₆ + 3H₂ → W + 6HF，400–450 °C / 1–5 kPa；
     * `plant/w-cvd-reactor` holds 350–500 °C / 0.5–10 kPa，窗口内。
     * 没有 W 专用 CMP 液：硅溶胶 + H₂O₂，dishing/erosion 未标定；
     * 孔内 void/seam 未标定；WF₆ 纯度 99.0–99.9 %；plugResistance 是设计值。
     *
     * 时间：回蚀 1 + 去气 1 + Ti PEALD 0.5–1 + TiN 1 + W 2 + CMP 1.5 +
     * 退火 1 + 装卸 ≈ 9 h。
     */
    id: 'make/cmos-w-plug',
    name: 'W plug 片制造',
    produces: [
      {
        item: 'mat/w-plug-wafer',
        qty: q(1),
        gives: [
          { param: 'plugResistance', kind: 'range', min: 0.05, max: 1 },
          { param: 'voidFraction', kind: 'range', min: 1, max: 5, record: 'mat/w-plug-resistance-record' },
          { param: 'barrierThickness', kind: 'range', min: 7, max: 7 },
          { param: 'plugDiameter', kind: 'range', min: 1, max: 2 },
          // W CMP 的 dishing/erosion：第⑦步回磨后的资格带，记录在 measure/w-cmp-dishing。
          { param: 'dishing', kind: 'range', min: 0, max: 100, record: 'mat/w-cmp-dishing-record' },
          { param: 'erosion', kind: 'range', min: 0, max: 100, record: 'mat/w-cmp-dishing-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/contacted-wafer', qty: q(1) }] },
      // Ti 2 nm + TiN 5 nm：Ti 1 g 够两层；Cl2 就地氯化成 TiCl4；N2 是 TiN 的氮源
      { anyOf: [{ item: 'mat/titanium', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 200) }] },
      // WF6 10 g + H2 1 g：H2 同时是 Ti PEALD 的还原气与 W CVD 的还原气
      // 6 个 1–2 µm 孔，W 净耗 ng 级；余是过量/尾气
      { anyOf: [{ item: 'mat/wf6', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 1000) }] },
      // Al 塞回蚀：5 % NaOH、40 °C
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
      // W CMP：专用浆（硅溶胶 + 重铬酸钠 + 硝酸，pH 2–4）
      { anyOf: [{ item: 'mat/w-cmp-slurry', qty: q(1) }] },
    ],
    needs: [
      'plant/clean-room',
      'plant/metrology-room',
      // Ti 2 nm 的 H2 等离子体：rf 源与 MFC（TiN 用 N2 等离子体也走这两件）
      'plant/rf-13m56',
      'plant/mfc',
    ],
    rate: { hours: q(9) },
    steps: [
      {
        note_zh:
          '① Al 塞回蚀：5 % NaOH、40 °C、定时，把 contacted-wafer 的 Al 塞/顶层 Al 溶掉，露出接触孔与 TiN。**不先回蚀就是 W-on-Al，不是 W plug**；过蚀会咬 Si/侧壁',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 38, max: 42 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '② 去气：W CVD 反应器抽到 ≤1 Pa，400–450 °C 烘 10 min，去孔内水汽/残胶；WF₆ 遇水水解，水汽必须走',
        performedBy: 'plant/w-cvd-reactor',
        under: [
          { param: 'temperature', min: 400, max: 450 },
          { param: 'pressure', min: 1, max: 5 },
        ],
      },
      {
        note_zh:
          '③ Ti 2 nm（PEALD）：TiCl₄ + H₂ 等离子体还原，350–380 °C / 10–100 Pa；TiCl₄ 由 Ti 屑 + Cl₂ 在 `plant/resistance-furnace` 300–400 °C 就地氯化后进源池，H₂ 走 `plant/ald-reactor/h2-line` 第五路（四路吹扫板加第五路 H₂、独立 H₂ MFC 按 H₂ 重标）。**Ti 与 TiN 同腔连做、不破真空** —— Ti 见空气就成 TiO₂，粘附/成核作用就没了。**H₂ 气路已补**（`plant/ald-reactor/h2-line`，四路吹扫板加第五路 H₂、MFC 按 H₂ 重标）；**Ti PEALD 工艺仍未验证**：Cl/O 含量、HCl 对泵/腔壁的腐蚀、残气氧化（1 Pa 底压、无 RGA）都没实测，2 nm 要 40–100 周期也未实测；工艺不成立则 Ti 2 nm 不成立，回 TiN 5 nm。热还原要 900–1100 °C，本机 400 °C 上限做不到，只能等离子体。',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 350, max: 380 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '④ TiN 5 nm（ALD）：Ti + Cl2 + N2，350–380 °C / 10–100 Pa，N₂ 等离子体 200 W；多 ALD 循环。**TiN 必须盖住 Ti，不能反序**：W plug 没有 Cu，TiCu₃ 不适用，但 TiN 破了 W/F 就会与 Ti 反应。覆盖 96–99 % 是设计值、没有 TEM/漏电实测；孔底内角 60–75 % ⇒ TiN 3.0–3.75 nm，加 Ti 2 nm 的 60–75 % ⇒ 孔底合计 4.2–5.25 nm。TiN 到 W CVD 仍要破真空转移，TiN 表面吸氧会让 W 成核延迟，未标定',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 350, max: 380 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '⑤ W 成核：WF₆ + H₂ 400–450 °C / 1–5 kPa，短脉冲成核 5–10 nm；成核不均会让 later CVD 出现孔口封死/中心缝。TiN 表面若已吸氧，成核会延迟，本层没有原位清洗',
        performedBy: 'plant/w-cvd-reactor',
        under: [
          { param: 'temperature', min: 400, max: 450 },
          { param: 'pressure', min: 1, max: 5 },
        ],
      },
      {
        note_zh:
          '⑥ W CVD：WF₆ + 3H₂ → W + 6HF，400–450 °C / 1–5 kPa，填 1–2 µm 孔；孔内 void/seam 未标定。WF₆ 纯度 99.0–99.9 %，HF 尾气走碱洗',
        performedBy: 'plant/w-cvd-reactor',
        under: [
          { param: 'temperature', min: 400, max: 450 },
          { param: 'pressure', min: 1, max: 5 },
        ],
      },
      {
        note_zh:
          '⑦ W CMP：`mat/w-cmp-slurry`（硅溶胶 + 重铬酸钠 + 硝酸，pH 2–4）在 `plant/cmp-polisher` 15–30 kPa 下回磨；去除率 20–80 nm/min，dishing/erosion 未标定；Cr(VI) 废浆石灰还原',
        performedBy: 'plant/cmp-polisher',
        under: [{ param: 'pressure', min: 15, max: 30 }],
      },
      {
        note_zh:
          '⑧ 退火 400–450 °C / 30 min：W 晶粒/应力；TiN 若断，W/F 进 Si 就是深能级/漏电。plugResistance 0.05–1 Ω/孔是设计值，测出来才算',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
    ],
    unbalanced_zh:
      'contacted-wafer 1（12.8 g + Al 塞 pg 级）+ Ti 1 g + Cl2 1 g + N2 5 g + WF6 10 g + H2 1 g + NaOH 5 g + 水 1 kg + 硅溶胶 20 g + H2O2 5 g → W plug 片 1。6 个 1–2 µm 孔填 W 约 6 × 0.785–3.14 µm³ × 19.3 = **0.09–0.36 ng**；Ti 2 nm + TiN 5 nm 的 Ti 净耗约 0.06 mg（TiN 另 0.16 mg），1 g 是源腔过量。Al 塞被 NaOH 溶掉（pg 级，进废液）；Ti/Cl2/WF6/H2 的其余在腔壁/尾气。产物按片计（12.8 g + ng W）；差额是源料/碱/水/浆，不是账不平',
  },


  {
    /**
     * **B⁺ 替代 Al 的 p⁺ 源漏：BF₃ → B⁺ 30 keV / 1e15 cm⁻² / 7° → 激活。**
     *
     *   `mat/cmos-nsd-wafer` 1 + BF₃ 1 mg + 水 1 kg → `mat/cmos-sd-wafer` 1
     *
     * 与 `make/implant-p-source-drain` 并列：Al 路线是 Al⁺ 100 keV，B⁺ 是
     * 30 keV。B 在 Si 里的固溶度高，1e15 不再超固溶度 100–260 倍；
     * p⁺ 的 Al 团簇问题消失。
     *
     * ⚠️ BF₃ 纯度 99.5 %、水 ≤10 ppm 是目标值；没有质谱/露点实测，
     * 质量分离（¹¹B/¹⁰B）未标定。B⁺ 的 Rp 只有 ~0.1 µm，结深仍按
     * LDD 的 0.3–0.4 µm 记账；30 keV 只改接触区，不把结深拉回 0.1 µm。
     *
     * ⚠️ 本路线没有单独的光刻/开窗步骤：假定 nsd 片已有 p⁺ 窗口；
     * 若是全片注入，B⁺ 会把 n⁺ 源漏补偿掉。这一条是并列候选的边界。
     */
    id: 'make/implant-p-source-drain-bf3',
    name: 'BF₃ p⁺ 源漏注入',
    produces: [
      {
        item: 'mat/cmos-sd-wafer',
        qty: q(1),
        gives: [
          { param: 'junctionDepth', kind: 'range', min: 0.3, max: 0.4 },
          { param: 'sheetResistanceN', kind: 'range', min: 15, max: 80 },
          { param: 'sheetResistanceP', kind: 'range', min: 30, max: 1500 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/cmos-nsd-wafer', qty: q(1) }] },
      // B⁺ 1e15 × 78.5 cm² = 7.85e16 个 B = 1.4 µg；BF3 1 mg 是过量源
      { anyOf: [{ item: 'mat/boron-trifluoride', qty: q(1, 1000000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh:
          '① B⁺ 注入：30 keV、1e15 cm⁻²、7°；BF₃ 是源气，B⁺ 的 Rp 约 0.1 µm。**没有单独光刻/开窗**：假定 nsd 片已有 p⁺ 窗口，否则全片补偿 n⁺',
        performedBy: 'plant/ion-implanter',
        under: [
          { param: 'energy', min: 30, max: 30 },
          { param: 'pressure', min: 1e-4, max: 1e-3 },
        ],
      },
      {
        note_zh:
          '② RTA 激活：1000–1050 °C / 10 s / 120–200 K/s / 常压 N₂；B 的电学激活，结深仍按 LDD 0.3–0.4 µm',
        performedBy: 'plant/rta',
        under: [
          { param: 'temperature', min: 1000, max: 1050 },
          { param: 'rampRate', min: 120, max: 200 },
          { param: 'pressure', min: 9.5e4, max: 1.05e5 },
        ],
      },
      {
        note_zh:
          '③ 四探针方阻：N⁺ 15–80、P⁺ 30–1500 Ω/□；只测 R□，测不了结深。B⁺ 的 p⁺ 低端是理想值，高端仍是测量上限',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'nsd 片 1（12.8 g）+ BF₃ 1 mg + 水 1 kg → CMOS 源漏片 1。B⁺ 1e15×78.5=7.85e16 个 B，质量 7.85e16×10.81/6.022e23 = **1.41 µg** 进入硅；BF₃ 1 mg 中 B 只有 0.131 mg，其余是 F/过量源气。水是冲洗。产物按片计（12.8 g + 1.4 µg B）；BF₃ 纯度/质量分离未标定',
  },



  {
    /**
     * **Cu/TiN/栅氧 MOS 电容专门试样：pad 光刻 → TiN 5 nm → Cu → 剥离 → 退火。**
     *
     *   `mat/gate-oxide-wafer` 1（栅氧在顶面；不是 gate-electrode-wafer）
     *   + Ti 1 g + Cl₂ 1 g + N₂ 5 g + Cu 0.1 g + 胶 1 g + 水 1 kg
     *     → `mat/cu-bts-wafer` 1
     *
     * **不用 `mat/gate-electrode-wafer`**：它的顶面是多晶硅栅，Cu/TiN 贴上去
     * 只是栅接触，不是 Cu/TiN/栅氧 MOS 电容。`mat/gate-oxide-wafer` 的栅氧
     * 在顶面，才是这个试样的正确起点。
     *
     * 结构：100×100 µm Cu pad / 5 nm TiN / 1.5–4.5 nm 栅氧 / Si。
     * 没有通孔；Cu 直接贴在 TiN/栅氧上。rate 6 h。
     */
    id: 'make/cu-bts-capacitor',
    name: 'Cu/TiN/栅氧 MOS 电容专门试样制造',
    produces: [
      {
        item: 'mat/cu-bts-wafer',
        qty: q(1),
        gives: [
          { param: 'area', kind: 'range', min: 1e-4, max: 1e-4 },
          { param: 'oxideThickness', kind: 'range', min: 1.5, max: 4.5 },
          { param: 'barrierThickness', kind: 'range', min: 5, max: 5 },
          { param: 'cuThickness', kind: 'range', min: 200, max: 500 },
          // BTS 可靠性：应力条件与应力前后漏电/平带偏移的资格带，记录在 measure/cu-bts-leakage。
          { param: 'leakageBefore', kind: 'range', min: 1e-12, max: 1e-6, record: 'mat/cu-bts-record' },
          { param: 'leakageAfter', kind: 'range', min: 1e-12, max: 1e-6, record: 'mat/cu-bts-record' },
          { param: 'flatbandShift', kind: 'range', min: -5, max: 5, record: 'mat/cu-bts-record' },
          { param: 'stressTemperature', kind: 'range', min: 150, max: 200, record: 'mat/cu-bts-record' },
          { param: 'stressField', kind: 'range', min: 0.5, max: 2, record: 'mat/cu-bts-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/gate-oxide-wafer', qty: q(1) }] },
      // TiN 5 nm：Ti + Cl2 + N2，与 make/tin-3nm-ald 同一套化学，多循环到 5 nm
      { anyOf: [{ item: 'mat/titanium', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 200) }] },
      // Cu 0.1 g：100×100 µm × 200–500 nm = 2–5e-6 cm³ × 8.96 = 18–45 µg；0.1 g 是蒸发舟装料
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      { anyOf: [{ item: 'std/photomask-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh:
          '① 电容 pad 光刻：100×100 µm 版，涂胶/前烘/曝光/显影；开的是 Cu pad 窗口，不是通孔',
        performedBy: 'plant/mask-aligner',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② TiN 5 nm（ALD）：Ti + Cl2 + N2，350–380 °C / 10–100 Pa；平处 5 nm，孔底覆盖不适用（这试样没有孔）',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 350, max: 380 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '③ Cu 蒸镀：0.001–0.01 Pa、200–500 nm；蒸发舟装 0.1 g，净耗 18–45 µg。也可电镀，但本层没有 Cu 电镀液',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh:
          '④ 剥离：丙酮/异丙醇去掉胶上的 Cu/TiN，留下 100×100 µm pad；水温 20–40 °C，不超声（怕掀 pad）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '⑤ 退火 400–450 °C / 30 min：Cu 晶粒/界面；温度上限受 Al 共晶与栅氧热预算限制。没有形成气，退火在 N₂ 里',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
    ],
    unbalanced_zh:
      '栅氧片 1（12.8 g）+ Ti 1 g + Cl2 1 g + N2 5 g + Cu 0.1 g + 胶 1 g + 水 1 kg → Cu/TiN/栅氧试样 1。Cu pad 100×100 µm×200–500 nm = 18–45 µg；TiN 5 nm×1e-4 cm²×5.2 g/cm³ ≈ 0.26 µg；Ti/Cl2/N2 其余在腔壁/尾气。产物按片计（12.8 g + 45 µg Cu + 0.26 µg TiN），不是账不平',
  },


  {
    /**
     * **长寿命 40 kW RTA 激活：与 make/cmos-activation 同一片/料。**
     *
     *   `mat/cmos-sd-implanted-wafer` 1 + N₂ 0.1 kg → `mat/cmos-sd-wafer` 1
     *
     * 40 kW 灯阵现场换装到 `plant/rta`：灯寿命 1500–2000 h、光衰 ≤5 %/2000 h，
     * 升温 **1.5 s**（60 kW 是 1 s），1000–1050 °C / 10 s、±5 K。
     *
     * ⚠️ `plant/rta` 的 composedOf 仍是 60 kW 灯阵；本路线只在 needs 里
     * 指名 `plant/rta/lamp-array-long`，注明**现场换装**，不改机器定义。
     * 2000 h/±5 K/≤5 % 是设计值，没有光衰/测温实测；碘仍靠回收。
     *
     * 1.5 s 升温对应 1000 K / 1.5 s ≈ 667 K/s，超过 `plant/rta` 的
     * `rampRate` 声明窗口 1–400 K/s，所以这里不写 `under rampRate`；
     * 只写温度/压力，1.5 s 记在步骤里。
     */
    id: 'make/cmos-activation-long',
    name: '长时源漏激活',
    produces: [
      {
        item: 'mat/cmos-sd-wafer',
        qty: q(1),
        gives: [
          { param: 'junctionDepth', kind: 'range', min: 0.3, max: 0.4 },
          { param: 'sheetResistanceN', kind: 'range', min: 15, max: 80 },
          { param: 'sheetResistanceP', kind: 'range', min: 30, max: 1500 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/cmos-sd-implanted-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/rta/lamp-array-long'],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh:
          '① RTA 激活：40 kW 长寿命灯阵、1000–1050 °C / 10 s、±5 K、常压 N₂；升温 1.5 s（不是 60 kW 的 1 s）。灯阵是现场换装件，plant/rta 的 composedOf 不改',
        performedBy: 'plant/rta',
        under: [
          { param: 'temperature', min: 1000, max: 1050 },
          { param: 'pressure', min: 9.5e4, max: 1.05e5 },
        ],
      },
      {
        note_zh:
          '② 四探针方阻：与 make/cmos-activation 同一判据，N⁺ 15–80、P⁺ 30–1500 Ω/□；只测 R□，测不了结深。结深仍按 LDD 0.3–0.4 µm 记账',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '双源漏注入片 1（12.8 g）+ N₂ 0.1 kg → CMOS 源漏片 1。RTA 不改质量；N₂ 是吹扫/保护气，差额进尾气。产物按片计（12.8 g），与 make/cmos-activation 同一账。灯阵 40 kW/2000 h 是现场换装件，不按片计',
  },

  {
    /**
     * **空白版 → e-beam 直写 box-in-box → 显影/刻蚀/去胶 → vernier 掩模。**
     *
     *   `std/photomask-general` 1 + 胶 1 g + NaOH 5 g + 水 1 kg
     *     → `std/overlay-vernier-general` 1
     *
     * e-beam 直写外 5 µm / 内 2 µm / 10 级 0.1 µm 台阶，X/Y 各一组。
     * 这是**掩模**，不是设计数据；双 LDD 两块版都要带这组 marks。
     * e-beam 直写分辨率够 0.1 µm，但套刻测量仍只到 5/2 µm 框。
     */
    id: 'make/overlay-vernier-mask',
    name: '套刻 vernier 掩模制造',
    produces: [
      {
        item: 'std/overlay-vernier-general',
        qty: q(1),
        gives: [
          { param: 'outerBox', kind: 'range', min: 5, max: 5 },
          { param: 'innerBox', kind: 'range', min: 2, max: 2 },
          { param: 'steps', kind: 'range', min: 10, max: 10 },
          { param: 'stepSize', kind: 'range', min: 0.1, max: 0.1 },
          { param: 'axes', kind: 'enum', oneOf: ['both'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/photomask-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① 清洗空白版：丙酮/异丙醇/水；铬版或现有掩模坯。版上不能有颗粒，否则 0.1 µm 台阶被颗粒盖住',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '② 涂胶/前烘：负胶 0.2–0.5 µm，90–100 °C 前烘；e-beam 直写要求胶薄且均匀',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '③ e-beam 直写：外框 5 µm、内框 2 µm、10 级 0.1 µm 台阶，X/Y 各一组；10–30 kV、束斑/定位按 plant/e-beam-column。写的是掩模图形，不是硅片',
        performedBy: 'plant/e-beam-column',
        under: [{ param: 'pressure', min: 1e-7, max: 1e-3 }],
      },
      {
        note_zh:
          '④ 显影：NaOH 0.5 wt% / 20–30 °C；显影不足台阶糊，过度则 0.1 µm 线宽掉',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '⑤ 刻蚀/去胶：铬版用现有湿法/干法刻蚀（本文件不新增刻蚀机）；去胶后 0.1 µm 台阶应保留。没有 CD 量具时用 CD-SEM 抽检',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '⑥ 检图：CD-SEM 看 5/2 µm 框与 0.1 µm 台阶；e-beam 直写分辨率够 0.1 µm，但套刻测量仍只到 5/2 µm 框，不是 40 nm 套刻',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '空白版 1 + 胶 1 g + NaOH 5 g + 水 1 kg → vernier 掩模 1。版是石英/铬坯，不按 kg 计；胶/碱/水是涂布/显影/冲洗，差额进废液。产物按件计，没有质量账；e-beam 直写不改质量',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 反相器版图（`std/inverter-layout-general`）—— 设计输入也要有来源
  //
  // 它原来是"设计输入，不是可制造件，没有产出路线"：6 孔坐标与 5 层图形
  // 都靠这句话给定。但严格闭包里"没有路线"就是长不出来，而
  // `make/cmos-inverter-contact` / `make/cmos-inverter-contacted` 都以
  // `needs` 指名它 —— 整条反相器支路因此断在这里。
  //
  // 版图是**算**出来的，不是造出来的：前提把计算机、存储、
  // 控制器这类"算"归前提（机器人自带算力），不要求本地复制。所以这条
  // 路线不投料、不占一台专用设备，只把"这份版图存在且能重新生成"记清楚：
  //
  //   performedBy  plant/robot —— 前提给的手
  //   needs        std/computer-general + plant/metrology-room —— 算力与
  //                坐标基准（版图尺寸要跟比较仪/量块的读数对齐）
  //
  // 它不是"把缺口扫到地毯下"：DRC、坐标仿真、套刻实测仍没有，那些写在
  // 各条接触孔路线的注释里，不在这条上假装。
  // ═════════════════════════════════════════════════════════════════════════
  {
    /**
     * **反相器 5 层版图：有源/栅/接触/金属/pad，minFeature 5 µm，die 30×25 µm。**
     *
     * 产出的是**图形数据**，不是掩模：`std/photomask-general` 是空白版，
     * 这个是版图。两者的界在 `make/cmos-inverter-contact` 的 6 孔坐标：
     * 孔位由这份版图定义，掩模只负责把图形转印到片上。
     *
     * 无投料（设计数据，前提给算力）；8 h 是绘制 + 交叉校对 + 与量块
     * 基准对齐的记账工时，不是光刻工时。**没有 DRC/坐标仿真**，
     * 30×25 µm 与 5 µm 规则是设计窗口，不是仿真结果。
     */
    id: 'make/inverter-layout-general',
    name: '反相器 5 层版图数据集制造',
    produces: [
      {
        item: 'std/inverter-layout-general',
        qty: q(1),
        gives: [
          { param: 'layers', kind: 'range', min: 5, max: 5 },
          { param: 'minFeature', kind: 'range', min: 5, max: 5 },
          { param: 'dieWidth', kind: 'range', min: 30, max: 30 },
          { param: 'dieHeight', kind: 'range', min: 25, max: 25 },
        ],
      },
    ],
    uses: [],
    needs: ['std/computer-general', 'plant/metrology-room'],
    performedBy: 'plant/robot',
    rate: { hours: q(8) },
    unbalanced_zh:
      '无投料：版图是设计数据（把计算机/存储/控制器归前提，不要求本地复制）。5 层、minFeature 5 µm、die 30×25 µm 是设计窗口，不是仿真/实测；DRC、坐标仿真、套刻实测都没有',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CMOS_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CMOS_ROUTES];
