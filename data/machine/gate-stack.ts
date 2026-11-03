/**
 * 栅极与晶体管工艺 —— 40 nm / 8 nm 节点的「栅极那一半」。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、为什么写这个文件：R9 的芯片卡口只剩两颗，而栅是它们的第一道死结
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * **种子设备必须可复制。** 判据是「种子自给率」，而剩下的芯片卡口是
 * `std/mcu-40nm-general`（有路线 `make/mcu-40nm-damascene`：前道 SAQP 16–24、
 * 后道 `make/beol-40nm-8layer` 交 40–100 nm / AR 2–3 / dishing 3–8 / 8 层、
 * 钝化 LPCVD Si₃N₄。**2026-10-20 前的口径**是“16–24 nm + 100–300 nm 后道
 * + 3–5 µm 钝化的混合件，不是完整 40 nm”—— 这一版已不成立；现在缺的是
 * 40 nm CAR 与 E≥5 GPa 的低 k 介质，不是后道整体）与
 * `std/soc-8nm-general`（有路线 `make/soc-8nm-damascene`，`euv-hina.ts`；剩下的缺口见 `data/material/chip-node.ts` 文件头）。
 * 本层另有两颗 3–5 µm 后道的通用件
 * `std/mcu-3um-general` / `std/soc-3um-general`，以及 100–300 nm 的细线档
 * `std/soc-fine-general` —— 那是本地能交付的另一档，不是这两颗缺口的替代品；
 * 不把 3–5 µm 叫 40 nm 或 8 nm，也不把 100–300 nm 叫 8 nm。
 *
 * 一颗芯片拆两半：**栅极那一半**（栅氧 / 栅电极 / LDD 与侧墙 / 硅化物 / 高k 金属栅）
 * 与**互连那一半**（铜大马士革、阻挡层、CMP）。本文件只写前者，后者由另一份文件写。
 * 两半的接口是 `mat/gate-electrode-wafer` 与 `mat/silicide-wafer` 这两个片级条目。
 *
 * 本文件的判据只有一条，而且可以被反驳：
 *
 *   **同一条工艺路线，把 gateLength / eot / leakage / junctionDepth / spacerWidth
 *   这几个数交出来，判据写在注释里，差几倍写成算式。**
 *
 * 所以下面每一条路线都同时说两件事：「本层能做到多少」与「判据是多少」。
 * 数字一律能从本仓库别的文件里核（Deal-Grove 常数、HF 与热磷酸的速率、
 * 炉子的升降温 30 min、`plant/euv-coater` 的靶与速率、`mat/` 的料表），
 * 核不到的（比接触电阻、界面态）**标成文献值而不是实测值** —— 本层没有测它们的量具。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、1.5 nm 栅氧：**41 s 的工艺，炉子要占 1 h，而最薄只到 4 nm**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 干氧 1000 °C，Deal-Grove（x² + Ax = Bt，A ≈ 0.165 µm、B ≈ 0.0117 µm²/h）：
 *
 *   x = 1.5 nm = 1.5e-3 µm
 *   x² = 2.25e-6、A·x = 2.475e-4，和 = 2.4975e-4 µm² = B·t
 *   t = 2.4975e-4 / 0.0117 = 0.02135 h = **76.9 s**
 *
 * 换 `make/cpu-32bit` 用的那个口径（Deal-Grove 线性区 2.2 nm/min，含 Massoud
 * 初始快速区）：1.5 / 2.2 = 0.68 min = **41 s**。
 * ⇒ **1.5 nm 只要 41–77 s。取 41 s。**
 *
 * **问题不在那 41 s，在于本层的炉子升降温各 30 min**（`make/cpu-32bit` 第一条
 * 工序的常数，`data/machine/cis.ts:48` 又量了一遍，是同一台炉子）。1800 s ÷ 41 s = **44 倍**。
 * 而且坡上也在长氧化层 —— 把 Ea(B/A) = 2.0 eV 代进去（Ea/k = 23 207 K）：
 *
 *   D(T)/D(1000 °C) = exp[−23 207 × (1/T − 1/1273)]
 *     650 °C 1.0e-3   750 °C 1.16e-2   850 °C 6.46e-2   950 °C 2.56e-1   和 = 0.334
 *   一个坡 400 K 走 1800 s ⇒ 每 100 K 450 s
 *   坡上生长 = 450 s × (2.2 nm / 60 s) × 0.334 = **5.5 nm**（2.2 口径）
 *              450 s × (1.18 nm / 60 s) × 0.334 = **2.95 nm**（A/B 口径）
 *
 * ⇒ **一个升温坡自己就长 3–5.5 nm。** 装片/卸片按 800 °C 走（工业惯例，也是
 * `make/cpu-32bit` 的口径），所以只有升温坡全长；等温段压到 0，片子上仍有 4 nm。
 *
 * **交付 eot 3.5–4.5 nm，判据 1.2–1.5 nm，差 2.7–3 倍。**
 * 这一条与 `cis.ts` 的浅结、`make/cpu-32bit` 的 4 nm 是**同一堵墙**：
 * 不是炉子不够热，是**炉子没有「秒」这个刻度**。真正的解法是 RTO（灯阵、
 * 100–200 K/s、秒级控温），本层 0 台 —— 见 R8 表第 1 行。
 *
 * **厚度测不了（同型降级）：判据靠什么？**
 *
 *   ① `plant/interferometer` 一条纹 0.295 µm —— 4 nm 是 **0.014 条纹**，读不出；
 *   ② 本层**没有椭偏仪**（`cis.ts` 已经确认过，全表 0 台）；
 *   ③ `plant/film-monitor` 是真空腔里的石英晶振（QCM），**它测沉积速率，不在炉管里**，
 *      长出来的氧化层它看不见；
 *   ④ HF 剥离速度：4 nm 在 49 % HF 里 **0.4 s** —— 比人手的反应还短，判不了；
 *   ⑤ 颜色只判「有没有」（4 nm 是无色，20 nm 才见茶色）。
 *
 *   于是**判据只剩两条，而且都是间接的**：
 *     a. **开环记账**：炉温（热电偶 + `std/photoelectric-pyrometer-general` 校）
 *        × 时间（表），按 Deal-Grove 反算 —— 精度 ±10 %，只保证「不是 1 nm 也不是 20 nm」；
 *     b. **电学终检：漏不漏**。`make/cpu-32bit` 第⑦段的判据就是这一句
 *        （「栅氧漏不漏」是那颗芯片唯一量得到的参数）。本层**没有 C-V 仪**，
 *        所以 EOT 只能等成品反向特性出来才反向判 —— 超标的片只能报废，不能返修。
 *   ⑥ 干氧气路 50–500 ppb 是**铭牌不是读数**（#23）：坡上那 4 nm 里混进多少氧、
 *      界面态是多少，本层判不了。栅氧的命门（氧分压 + 界面态）在这里是**开环的**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、没有干法刻蚀：栅长 = **L_mask − 2 × 膜厚**，这是全节点的死穴
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * **先说一句会让人卡住的话：HF 不咬硅。**
 * `data/machine/deprocess.ts:79` 那张表写着 49 % HF 对 SiO₂ 1–2–5 µm/min、
 * 对 Si₃N₄ 5–10 nm/min —— 而**对硅是 0**：HF 是硅的停止层（氢终止面）。
 * 所以「用 HF 湿法刻多晶硅栅」这句话本身不成立，不是「精度差」而是「没有反应」。
 *
 * 白名单里唯一能咬硅的是 **Cr(VI) + HF**（Secco / Sirtl 型：Cr₂O₇²⁻ 把 Si 氧化成
 * SiO₂，HF 立刻溶掉它）。`mat/sodium-dichromate` 与 `mat/hf` 都在料表里
 * （`data/material/photoresist.ts:56`、`chain.ts:244`），所以这条路**能写**。
 * 代价是**各向同性**：室温 0.5–1.5 µm/min，横向与纵向**等速**。
 *
 *   刻穿 t 要 t 的时间 ⇒ 横向也刻掉 t ⇒ **每边 t，两边 2t**
 *   **Lg = L_mask − 2·t_poly**
 *
 *   t_poly = 150 nm 时：
 *     0.13 µm 的 ArF 版（deepsub）：Lg = 130 − 300 = **−170 nm < 0 ⇒ 图形消失**
 *     0.5 µm 的 M1 版（halfmicron）：Lg = 500 − 300 = **200 nm**
 *     0.7 µm 的 M2 版：            Lg = 700 − 300 = **400 nm**
 *
 * ⇒ **横向蚀刻量 150 nm/边；40 nm 的图形蚀完只剩 0（负数，即消失）；
 *    最小可实现栅长 200 nm（用 0.5 µm 版）。判据 40 nm，差 5 倍。**
 *
 * **膜厚是唯一的杠杆，而它同时钉住栅电阻 —— 这是本文件最要紧的一条两难：**
 *
 *   Lg = L_mask − 2t        （要细，t 就得薄）
 *   R□ = ρ / t，ρ(掺磷多晶硅) ≈ 1 mΩ·cm   （要导电，t 就得厚）
 *
 *   t = 150 nm → R□ = 1e-3 / 1.5e-5 = **67 Ω/□**，0.5 µm 版给 Lg = 200 nm
 *   t =  45 nm → R□ = **222 Ω/□**（判据 20–30，差 7–11 倍），0.13 µm 版才给 Lg = 40 nm
 *   t = 330 nm → R□ = 30 Ω/□（判据达标），Lg = 130 − 660 < 0（做不出栅）
 *
 * **两个都对，就是不能同时对。** 这一句就是「没有干法刻蚀」的全部代价。
 *
 * 还有第二笔：**腐蚀液同时也咬栅氧。** Cr(VI)+HF 里的 HF 对 SiO₂ ≈ 5 nm/s
 * （稀释一半），刻 13.5 s 就从掩模边缘往里咬 **67 nm/边** ⇒ 200 nm 的栅底下
 * 只剩 200 − 134 = **66 nm 连续的 4 nm 栅氧**。所以就算掩模给得出 40 nm，
 * 栅氧也已经被从两侧掏空 —— 这是同一个各向同性的第二次收费。
 *
 * **一条看起来能绕过去的路，要先说清它绕不过什么**：把铝压到 50 nm、
 * 配 0.13 µm 的版，磷酸刻铝（`deprocess.ts:578` 那条：85 % H₃PO₄ / 50–60 °C，
 * Al 0.5–1 µm/min、**对 SiO₂ 只有 1–2 nm/min**）= Lg = 130 − 100 = **30 nm 线宽**，
 * 而且栅氧几乎不被咬（0.075 nm）。**但那不是「40 nm 达标」**：铝 660 °C 就熔，
 * 1000 °C 的源漏推进它一步也过不去 ⇒ 栅只能最后做 ⇒ 源漏靠另一块版，
 * 套刻 ±0.25 µm 让结离栅 250 nm（**8 倍于栅长**）⇒ 那不是自对准晶体管了。
 * 问一句「换完之后它还会不会做原来那件事」—— 会，但频率掉两个量级。
 * 换的是器件结构，不是精度，所以本文件**不把它记账成降级**，记成缺口（§四·⑦）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、侧墙：**各向同性回刻在数学上留不下侧墙；能做出来的是热氧化侧墙**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 判据：Si₃N₄ 侧墙 40–60 nm，做法是「沉积 + 各向异性回刻」。两个条件本层各缺一半：
 *
 * **① 沉积：只能反应溅射，而溅射的台阶覆盖是 20–40 %。**
 *    `plant/euv-coater` 的 Si 靶 + N₂ 就是氮化硅（`subnm-readout.ts:768` 那一炉
 *    就是 SiO₂/Si₃N₄ 8 对）。但磁控溅射的原子到达角 ±13°，在 150 nm 的栅台阶上：
 *    场区 150 nm → **侧壁只有 30–60 nm**。偏偏这 30–60 nm 正是想要的宽度 ——
 *    看起来运气很好，下一句就把它推翻。
 *
 * **② 回刻：热磷酸是各向同性的，10 nm/min。**
 *    `plant/hot-phosphoric-bath` 的实测口径：85 % H₃PO₄ @ 160 °C，
 *    Si₃N₄ **10 nm/min**、SiO₂ 0.1–1 nm/min（选择比 10 : 1）。
 *    各向同性回刻「清掉场区 150 nm」要溶 150 nm，而侧壁只有 30–60 nm：
 *      t = 4 min 时侧壁已净尽（40 nm / 10 nm·min⁻¹），场区还剩 110 nm。
 *    ⇒ **留下的充分必要条件是「侧壁比场区厚」，而溅射给的是反的。**
 *      这一步在数学上不可能成功，与工艺参数无关 —— 这是各向同性的定义。
 *    ⇒ **Si₃N₄ 侧墙交付 spacerWidth = 0。判据 40–60 nm。差 ∞（0 对 40）。**
 *
 * **③ 能做出来的那一种是热氧化侧墙 —— 而且它达标。**
 *    干氧 1000 °C，在栅的侧壁上长 SiO₂：Deal-Grove 45 nm ⇒ x²+Ax = Bt 给
 *    0.808 h ≈ **48 min**（2.2 nm/min 口径是 20 min，取 30–60 min）。
 *    侧墙宽度 = 氧化层厚度 = **40–55 nm**（判据 40–60 ✓），自对准、不要套刻；
 *    代价是多晶硅每边被吃掉 0.44 × 45 = **20 nm**（栅长 200 → 160）。
 *    它挡住硅化物是够的：Ti 与 SiO₂ 在 600 °C 不反应。
 *
 * **④ 那为什么工业上侧墙一定是 Si₃N₄？不是刻蚀，是 HF。**
 *    后道开接触孔要用 HF（10 nm/s）。热氧化侧墙与场氧**同材质** ⇒ 按同样速率溶，
 *    清掉源漏上 45 nm 就要 4.5 s，侧墙同时净尽；Si₃N₄ 在同样 4.5 s 里只掉
 *    **0.4–0.75 nm**（5–10 nm/min）⇒ 扛得住。**各向同性不能制造差分** ——
 *    这句话在本文件里出现两次（回刻、开孔），两次都是同一个定理。
 *    接触孔那一半不在本文件（互连那一半），所以这一格在这里记成**升级路线**（R8 第 3 行）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、接触：TiSi₂ 能做，n⁺ 刚好压线、p⁺ 差 4 倍
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * **先把单位换算钉死（这一格最容易错 100 倍）：**
 *
 *   1 Ω·cm² = 1 Ω × (1 cm)² = (1e4 µm)² = **1e8 Ω·µm²**
 *   ⇒ 判据 **1×10⁻⁷ Ω·cm² = 10 Ω·µm²**
 *   （不是 0.1 Ω·µm² —— 0.1 Ω·µm² 对应 1×10⁻⁹ Ω·cm²，那是再往后一代的判据）
 *
 * **镍链已通、钛也通：** `make/nickel`（ores.ts:216，250 : 1 富集经
 * `make/nickel-concentrate` + `make/flotation-reagent`）已有路线；`mat/titanium`
 * 也有一整条 `make/` 路线（`data/material/titanium.ts`）。但 **NiSi 的溅射/硅化路线
 * 还没写**，所以 **40 nm 该用 NiSi，本层数据里仍只能给 TiSi₂。**
 *
 *   比接触电阻（文献值，**本层测不了**：TLM 要四探针 + 变温，两者都没有）：
 *     TiSi₂  n⁺ **1×10⁻⁷ Ω·cm² = 10 Ω·µm²**（判据压线，差 1 倍）
 *            p⁺ **4×10⁻⁷ Ω·cm² = 40 Ω·µm²**（**差 4 倍**）
 *     NiSi   n⁺ 5×10⁻⁸ = 5 Ω·µm²、p⁺ 1.5×10⁻⁷ = 15 Ω·µm²（好 2–3 倍）
 *   片阻：20 nm 的钛长成 49 nm 的 TiSi₂（2.46 倍的体积膨胀：Ti 47.9 g/mol、4.51 g/cm³；
 *         TiSi₂ 104.9 g/mol、4.02 g/cm³ ⇒ 30 nm Ti → 74 nm，20 nm → 49 nm）
 *         C49（600–650 °C 形成）60–100 µΩ·cm ÷ 49 nm = **12–20 Ω/□**
 *         C54（700–800 °C 转变）13–17 µΩ·cm ÷ 49 nm = **2.7–3.5 Ω/□**（差 4.5–6 倍）
 *
 *   **本层只能停在 C49**：C54 要 700–800 °C，而炉子没有秒级刻度 ——
 *   30 min 的炉时让硅化物横向长 **0.1–0.15 µm**，而侧墙只有 45 nm：
 *   **硅化物从源漏一侧爬过侧墙、碰到栅 ⇒ 栅源漏短路**（垂直方向不穿结，横向穿侧墙）。
 *   C49 在 600 °C/30 min 只长 **0.05 µm ≈ 侧墙的宽度**，刚好不越过。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、高k：**铪 0 命中，Si₃N₄ 顶得了 EOT、顶不了漏电**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 按任务书 grep 过：**`mat/hafnium` / `mat/hafnia` 在 `data/` 全表 0 命中**。
 * 不是「有条目没路线」，是**连条目都没有**。铪在锆石里 1–2 %，要锆铪分离
 * （萃取或分馏），而本层连锆都没有（`data/material/ceramic.ts:31`：透明氧化铝、氮化硅
 * 都归到「另一条链」）⇒ **HfO₂ 差整条链，不是一个缺口。**
 *
 * 钛**有**（`mat/titanium` + `make/` 路线）⇒ **TiN 金属栅能做**：
 * 反应溅射 Ti 靶 + N₂，与 `cis.ts` 里 TiO₂ 那一层同一个手法。
 *
 * Si₃N₄（k = 7）顶 HfO₂（k = 25），同一个 EOT 1.2 nm：
 *
 *   物理厚度 = EOT × k / k(SiO₂) = 1.2 × 7 / 3.9 = **2.15 nm**（Si₃N₄）
 *                              1.2 × 25 / 3.9 = **7.7 nm**（HfO₂）
 *
 *   **EOT 这一格达标**：2.2 nm 的溅射 Si₃N₄ 用 0.10 nm/s × 22 s 就能给，
 *   而且 QCM 的分辨是 0.14 nm = 6 %（`plant/film-monitor`），时间不是问题 ——
 *   **沉积没有热预算**，这是它与热氧化最要紧的区别。
 *
 *   但隧穿按**物理厚度**算，不按 EOT 算：2.15 nm 的 Si₃N₄ 与 1.2 nm 的 SiO₂
 *   在 1 V 下是同一个量级（**0.3–3 A/cm²**），而 HfO₂ 的 7.7 nm 把它压到 1e-3 以下。
 *   ⇒ **判据 ≤1×10⁻² A/cm²，交付 0.3–3 A/cm²，差 30–300 倍。**
 *   **高k 的全部意义就是用厚度换漏电 —— Si₃N₄ 只换到一半（k 从 3.9 到 7）。**
 *
 *   界面：HF-last 剥掉 4 nm 栅氧（10 nm/s，**0.4 s**）之后直接溅射 ⇒ 没有热氧化
 *   界面层，硅面在等离子体里过一遍 ⇒ Dit **1e13** 对判据 1e11（**差 100 倍**）→
 *   迁移率与阈值漂移。判据靠疏水性（氢终止的硅面不润湿），这是本层唯一判得出
 *   「氧化层去净了没」的手段。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、40 nm 与 8 nm 各差几倍（一张表，数字都来自下面各条 `gives`）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * | 规格 | 40 nm 判据 | 40 nm 交付 | 差 | 8 nm 判据 | 8 nm 交付 | 差 |
 * |---|---|---|---|---|---|---|
 * | gateLength   | 40 nm     | 200–400 nm（多晶硅 t=150） | **5–10×** | 20 nm | 70–110 nm（TiN t=20） | **3.5–5.5×** |
 * | eot          | 1.2–1.5 nm | 3.5–4.5 nm（4 nm 热氧化） | **2.7–3×** | 1.2 nm | 1.2–1.3 nm（2.2 nm Si₃N₄） | **✓ 1×** |
 * | leakage      | —          | （厚了 3 倍，漏电反而低） | — | ≤1e-2 A/cm² | 0.3–3 A/cm² | **30–300×** |
 * | junctionDepth| 20–30 nm   | 300–400 nm | **10–20×** | 20–30 nm | 300–400 nm | **10–20×** |
 * | spacerWidth  | 40–60 nm   | 40–55 nm（热氧化，不是氮化硅） | **✓ 1×** | 40–60 nm | 40–55 nm | **✓ 1×** |
 * | 接触 ρc      | 10 Ω·µm²   | n⁺ 10 / p⁺ 40 | **1× / 4×** | 5 Ω·µm² | n⁺ 10 / p⁺ 40 | **2× / 8×** |
 * | 栅片阻       | 20–30 Ω/□  | 55–80 Ω/□（多晶硅）/ 0.2–0.3（铝） | **2–3×** | — | 80–120 Ω/□（TiN 20 nm） | — |
 *
 * **一句话**：40 nm 卡在「膜厚 × 各向同性」（5–10 倍），8 nm 卡在「没有铪」
 * （漏电 30–300 倍、界面态 100 倍）；两者的 EOT 反而是最好的那一格 ——
 * 因为**沉积不用热预算**，而热预算才是本层真正的天花板。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 七、R8 —— 每一处降级的升级路线（恢复原规格要什么 + 缺口量级）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * | 降级 | 现在 | 原规格 | 恢复它要什么 | 缺口量级 |
 * |---|---|---|---|---|
 * | 栅氧 eot | 3.5–4.5 nm | 1.2–1.5 nm | **已建**：RTO 走 `make/rto-gate-oxide`（implant.ts:1873，经 `plant/rta` implant.ts:442：400–1200 °C、1–400 K/s、1–120 s）；量具 `plant/ellipsometer`（ellipsometer.ts:689，thicknessAccuracy ≤0.05 nm）+ `plant/probe-station` 的 C-V（probe-station.ts:396，1 MHz、1e-13–1e-8 F） | 差 2.7–3× → **1.0–1.7×**（RTO 交付 1.5–2.0 nm）；厚度从"0.005 条纹"变成 ≤0.05 nm |
 * | 栅长 | 200–400 nm | 40 nm | **已建**：`plant/rie-etcher`（rie.ts:454，134 kHz、78–88°）⇒ 交付 **104–120 nm**；更近的是 SADP `make/gate-electrode-poly-sadp`（gate-stack.ts:1273）⇒ **29–48 nm**（名义 40，✓），代价方阻 100–160 Ω/□ | 差 5–10× → **2.6–3×**（RIE 一条）或 **0**（SADP 的栅长）；SADP 把代价转到方阻（100–160 对 20–30 Ω/□，差 3.3–8×） |
 * | 侧墙材质 | 热氧化 SiO₂ 40–55 nm | Si₃N₄ 40–60 nm | LPCVD Si₃N₄（SiH₄ + NH₃，700–800 °C）+ RIE 回刻 | 宽度达标；**HF 里差 20–100×**（4.5 s 掉 45 nm 对 0.75 nm） |
 * | 浅结 x_j | 300–400 nm | 20–30 nm | **已建**：`plant/ion-implanter`（implant.ts:399，5–100 keV、≤240 µA、7° 倾斜）+ `plant/rta`（implant.ts:442：400–1200 °C、1–400 K/s）+ `make/rtp-activate`（implant.ts:1746） | 差 10–20× → **5–8×**（RTA 后结深 140–160 nm）；注入机窗口 5–100 keV、240 µA |
 * | 硅化物相 | C49（12–20 Ω/□） | C54（2.7–3.5 Ω/□） | **已闭合**：`make/rtp-silicide-c54`（implant.ts:1807，750 °C/30 s，经 `plant/rta`） | **已闭合**：片阻 2.7–3.5 Ω/□、横向 23–35 nm < 45 nm 侧墙（原差 4.5–6×） |
 * | ρc(p⁺) | 40 Ω·µm² | 10 Ω·µm² | ① NiSi（Ni 溅射 + 400–500 °C/30 s 两段 RTA）② 或 p⁺ 活性浓度 1e20 → 3e20（要注入） | 差 4×；**RTA 已建**（implant.ts:442）；**镍料已通**（`make/nickel`，ores.ts:216）；仍缺 NiSi 的镍膜溅射/硅化路线 |
 * | 高k 漏电 | 0.3–3 A/cm²（Si₃N₄） | ≤1e-2 A/cm²（HfO₂） | **已闭合**：`make/ald-hfo2`（ald.ts:1979，HfCl₄ + H₂O，250–350 °C）→ `mat/hfo2-wafer`；再用 `make/highk-metal-gate-ald`（gate-stack.ts:1184）成栅；铪链 `mat/hafnium`（hafnium.ts:524）/`mat/hafnium-chloride`（472）已建 | **已闭合**：漏电 1e-3–1e-2 A/cm²（判据 ≤1e-2）、EOT 1.0–1.2 nm；Dit 1e11–1e12 是算的 |
 * | 界面态 | 1e13 | 1e11 | 界面层：热氧化 0.5–1 nm（要 RTO，否则又回到 4 nm）+ 退火 | 差 100× |
 * | 多晶硅纯度 | 2N（工业硅靶） | 6N | 西门子 + 区熔：`mat/polysilicon` 条目与路线**都有**，只是不在本文件白名单 | 金属杂质差 1000–10000× |
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 八、已知缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ① **磷源不在本文件的投料白名单里。** `mat/pocl3` 有条目、也有路线
 *    （`data/machine/diffusion.ts:170` 的 `make/pocl3`），但白名单只给到
 *    `mat/silica`。所以掺杂写成「磷硅玻璃涂布 + 推进」（与 `make/cpu-32bit`
 *    第③段的写法一致），**方阻重复性 ±20 %（气体源是 ±3 %）**。
 * ② **硅靶是 2N 工业硅。** `plant/euv-coater/target-si` 来自石英砂碳热还原
 *    （`make/euv-coater-target-si`：98–99.5 %，杂质是铁、铝、钙）。溅射出来的
 *    多晶硅里金属 1e18–1e19 cm⁻³，判据 1e15 ⇒ **差 1000–10000 倍**。
 *    真正的解法不是换靶而是换料：`mat/polysilicon`（西门子链已有）不在白名单。
 * ③ **Ti 靶不在 `plant/euv-coater` 的 `composedOf` 里** —— 改它就越界（那是
 *    `data/machine/euv-mirror.ts` 的地盘）。按 `cis.ts` 八·② 的同一写法处理：
 *    同一规格的靶座换靶，记在这里。
 * ④ **`mat/naoh` 不在白名单**。`deprocess.ts:632` 的去多晶硅用的是 30 % NaOH / 80 °C
 *    （Si 1 µm/min、各向异性、侧蚀 ≈ 膜厚 —— 与本文件的结论同量级）。
 *    本文件走 Cr(VI)+HF，两者的侧蚀都在 0.15–0.5 µm 一档，不影响结论。
 * ⑤ **没有氧分析仪。** 干氧气路的 ppb 级、HF-last 之后的
 *    界面氧，都判不了。栅氧的命门在这一层是开环的 —— 照实写，不绕过。
 * ⑥ **模型表达不了一件事：`minFeature` 的 `dir` 只有 `atMost`（越细越好）**，
 *    而在各向同性腐蚀下**越细的版越做不出栅**（Lg = L_mask − 2t 可以是负数）。
 *    所以本文件的掩模 `need` 写 `0.5–0.7`（区间包含）而不是 `atMost 0.7`，
 *    并在注释里说清 —— 与 `cis.ts` 八·③ 是同一处表达力缺口。
 * ⑦ **应变硅（eSiGe 源漏）：路线已建，仍是 B 类。** 旧账是"没有路线，只有条目"——
 *    当时全表没有外延炉，`mat/strain-sd-wafer` 故意留着不产。现在
 *    `plant/lpcvd-furnace` 已经能跑 SiGe 外延（`make/sige-epi-wafer`：
 *    700–750 °C / 13–40 Pa，SiHCl₃ + GeCl₄ + H₂），所以补了
 *    `make/strain-sd-wafer`（LDD 片当掩模做选择性外延）与
 *    `make/silicide-tisi2-c49-sige`（SiGe 上的 TiSi₂）。
 *    **没变的是实测**：选择比、Ge 偏析、应变 0.8–1.2 % 都没有量具，
 *    0.8 % 判据只按设计窗口记；迁移率增益 1.3–1.5× 仍是文献值。
 *    工艺不成立时退回"整面 SiGe + 光刻开窗"，多两块版。
 * ⑧ **铝栅那条路（`make/gate-electrode-aluminium`）与硅化物路线不相容**：
 *    Al–Si 共晶 577 °C，而 C49 的形成要 600–650 °C。本文件的链按多晶硅排；
 *    铝栅必须把顺序倒过来（硅化物先做、栅最后做），那一处代价见 §二末段。
 * ⑨ **成品率没有模型**：本文件只写「这一片能不能做出来」，不写「一片里几颗好」。
 *    良率那一层在 `cis.ts` 算过（e^(−AD)），逻辑芯片的 D 值本层没有出处，不写。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 十、p-LDD：BF₃ 补的是“有 p 型低掺杂”，不是 p⁺
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `make/ldd-spacer-oxide` 是 PSG + 磷，只给 n-LDD；`mat/ldd-wafer` 的
 *   `lddType` 因此分 n/p/both。并列的 `make/p-ldd-spacer-oxide` 用 BF₃
 *   开 p 窗口，B⁺ 20–30 keV、1e13–1e14 cm⁻²、7°，再长 45 nm 侧墙。
 *
 *   **只解决“有 p 型低掺杂”**：p⁺ 源漏的固溶度/激活仍是 `make/implant-p-source-drain`
 *   那一格，p-LDD 不碰它。BF₃ 的 ¹¹B/¹⁰B 质量分离与剂量均匀性没有标定。
 *
 *   `make/dual-ldd-spacer` 把 n/p 两道 LDD 串在同一片上：n 开窗（PSG）→ 推进 →
 *   去 PSG → p 开窗（BF₃）→ 去胶 → 45 nm 侧墙。**这不是“同版”**：两块版分别
 *   开 n/p 窗，套刻各 ±0.25 µm；两次误差叠加后 n/p 窗口可能重叠（p 注入补偿
 *   n-LDD）或留缝（边界没有 LDD），而本层没有 overlay 实测。所以
 *   `lddType=both` 只证明“两种 LDD 能先后做”，不证明 n/p 窗口合格。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目 —— 六片（栅极那一半的五道工序各一片，加一个缺口条目）
//
// 全部是 `unit: '片'`，所以不写 `mass`：一片的「质量」不是这道工序的判据
// （质量守恒那一条校验也就不参与 —— 与 `mat/cis-array` 同一种写法）。
// ═══════════════════════════════════════════════════════════════════════════

export const GATE_ITEMS: readonly Item[] = [
  /**
   * 长完栅氧化层的片。**栅极那一半的第一片，也是唯一不需要光刻的一片。**
   *
   * 两个规格：
   *   eot        等效氧化层厚度，**越小越好** —— 判据 1.2–1.5 nm，交付 3.5–4.5（差 2.7–3×）
   *   oxideKind  氧化层是「热干氧 / 湿氧 / 沉积」哪一种 ——
   *              这一格是本层与工业分岔的地方：热干氧受热预算限制，沉积不受
   *              （所以 8 nm 那一支反过来用沉积，见 `mat/highk-gate-wafer`）
   *
   * 判据是 1.2–1.5 nm，而本层能稳定重复的最薄是 **4 nm** —— 差的那 2.5 nm 全是
   * 炉子升降温坡上长出来的（文件头 §一）。而 4 nm 连**测**都测不了：
   * 干涉仪一条纹 0.295 µm，4 nm 是 0.014 条纹。所以这一格的 eot 是
   * **按工艺记账开环声明的，不是量的**（同型降级）。
   */
  {
    id: 'mat/gate-oxide-wafer',
    name: '栅氧化片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'eot', kind: 'range', min: 0, max: 20, unit: 'nm', dir: 'atMost' },
      { param: 'oxideKind', kind: 'enum', values: ['thermal-dry-o2', 'thermal-wet', 'deposited'] },
      // GOI 资格带，不是单次读数；thickness 是物理厚度，不是 eot（eot 见上）。
      { param: 'vbd', kind: 'range', min: 0, max: 200, unit: 'V' },
      { param: 'ebd', kind: 'range', min: 5, max: 12, unit: 'MV/cm' },
      { param: 'weibullBeta', kind: 'range', min: 1, max: 3, unit: '1' },
      { param: 'thickness', kind: 'range', min: 0.0035, max: 0.4, unit: 'µm' },
      { param: 'waferDiameter', kind: 'range', min: 100, max: 150, unit: 'mm' },
    ],
  },

  /**
   * 栅电极定义完的片。**「栅长」这个数第一次落地的地方，也是死穴所在。**
   *
   * 三个规格，它们互相钉住（文件头 §二）：
   *   gateLength      栅长，**越小越好** —— 判据 40 nm，交付 200–400（差 5–10×）
   *   gateMaterial    多晶硅 / 铝 —— 两条 OR 路线，代价各不相同
   *   sheetResistance 栅的方阻，**越小越好** —— 判据 20–30 Ω/□
   *
   * **Lg = L_mask − 2·t**：各向同性腐蚀下，栅长由**被刻那一层的厚度**决定，
   * 不由掩模决定。所以这个条目的 gateLength 与 sheetResistance 是同一个旋钮
   * 的两头：t = 150 nm 给 200–400 nm / 67 Ω/□；t = 45 nm 才给 40 nm / 222 Ω/□。
   * 铝把两头同时解开（ρ 小 300 倍），代价是 660 °C 的天花板。
   */
  {
    id: 'mat/gate-electrode-wafer',
    name: '栅电极片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'gateLength', kind: 'range', min: 0, max: 2000, unit: 'nm', dir: 'atMost' },
      { param: 'gateMaterial', kind: 'enum', values: ['poly-si', 'aluminium'] },
      { param: 'sheetResistance', kind: 'range', min: 0, max: 10000, unit: 'Ω/□', dir: 'atMost' },
    ],
  },

  /**
   * 做完 LDD 与侧墙的片。
   *
   *   junctionDepth  **越浅越好** —— 判据 20–30 nm，交付 300–400（差 10–20×）
   *   spacerWidth    侧墙宽，**有一个窗口**（40–60 nm），不是单调方向 ——
   *                  所以 `dir` 是缺省的 `within`：交付 0 会被判「不够」，
   *                  交付 200 也会被判「太宽」。这一格是本文件**唯一达标**的一格：
   *                  热氧化侧墙 40–55 nm。
   *   spacerMaterial 材质：本层只有 silicon-dioxide 做得出，silicon-nitride
   *                  **现在没有**（不是「那时没有」）。
   *                  区别不在宽度，在 HF 里（45 nm 对 0.75 nm）。
   *
   * 结深为什么比判据差一个量级：**侧墙本身要 45 min 的 1000 °C。**
   * 浅结的预算（名义 20 nm 只要 Dt = 1.445e-13，即 14 s）在第一个升降温坡上
   * 就用完了（坡 = 3.96e-12，是它的 27 倍）；再叠上侧墙氧化的 45 min
   * （Dt = 1e-14 × 2 700 = 2.7e-11）⇒ x_j = 5.26√(4.1e-11) = **0.34 µm**。
   * **侧墙的宽度与浅结的深度是同一笔热预算买的两样东西**，不能只要一样。
   */
  {
    id: 'mat/ldd-wafer',
    name: 'LDD 侧墙片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'junctionDepth', kind: 'range', min: 0, max: 2000, unit: 'nm', dir: 'atMost' },
      { param: 'spacerWidth', kind: 'range', min: 0, max: 1000, unit: 'nm' },
      { param: 'spacerMaterial', kind: 'enum', values: ['silicon-nitride', 'silicon-dioxide', 'none'] },
      // n：PSG 开窗 + 磷 LDD；p：BF₃ 开窗 + 硼 LDD；both：两道都做（本层没有套刻，未做）
      { param: 'lddType', kind: 'enum', values: ['n', 'p', 'both'] },
      { param: 'waferId', kind: 'range', min: 0, max: 1000, unit: '号' },
      // 版图里有没有 box-in-box vernier；single-LDD 版没有，dual-LDD 版有
      { param: 'overlayMarks', kind: 'enum', values: ['present', 'absent'] },
    ],
  },

  /**
   * 自对准硅化物做完的片。**接触电阻这一格就落在这里。**
   *
   *   contactResistivity  比接触电阻，**越小越好** —— 判据 10 Ω·µm²（= 1e-7 Ω·cm²）
   *   silicidePhase       C49 / C54（TiSi₂ 的两个相）/ none
   *   sheetResistance     硅化物本身的方阻，判据 2.7–3.5 Ω/□（C54）
   *
   * n⁺ 与 p⁺ 的比接触电阻不是同一个数（TiSi₂ 上差 4 倍），而一个 `props` 只能声明
   * 一个窗口 ⇒ 交付窗口写成 `10–40`（下界是 n⁺、上界是 p⁺），注释里分开说。
   * 这不是含糊，是把两个真值都交出来；要区分的读法在注释里。
   *
   * 本层只能停在 **C49**：C54 要 700–800 °C，而炉子没有秒级刻度，30 min 会把
   * 硅化物横向长出去 0.1–0.15 µm —— 在 0.3 µm 的结上就是穿结。
   */
  {
    id: 'mat/silicide-wafer',
    name: '自对准硅化物片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'contactResistivity', kind: 'range', min: 0, max: 1000, unit: 'Ω·µm²', dir: 'atMost' },
      { param: 'silicidePhase', kind: 'enum', values: ['c49', 'c54', 'none'] },
      { param: 'sheetResistance', kind: 'range', min: 0, max: 1000, unit: 'Ω/□', dir: 'atMost' },
    ],
  },

  /**
   * 高k 介质 + 金属栅做完的片。**8 nm 节点那一半。**
   *
   *   eot             **达标的一格**：2.2 nm 的 Si₃N₄ = EOT 1.2 nm（判据 1.2，✓）
   *   leakage         **差 30–300 倍的一格**：0.3–3 A/cm² 对 1e-2（判据）
   *   gateLength      70–110 nm，判据 20 nm（差 3.5–5.5×）——
   *                   比多晶硅那条好 3 倍，只因为 TiN 只有 20 nm 厚
   *   gateDielectric  本层能给的只有 silicon-nitride；**hafnia 现在没有**
   *                   （`mat/hafnium` / `mat/hafnia` 全表 0 命中 —— 连条目都没有）
   *   metalGate       tin **有**：钛有链、氮有料、反应溅射有设备。这一格是 8 nm
   *                   那一支里唯一「要什么有什么」的
   *
   * 这一条与 `mat/gate-oxide-wafer` 的对比是本文件的主结论：
   * **热氧化的墙是热预算，沉积的墙是材料。** EOT 达标、材料没有，漏电就差 2.5 个量级。
   */
  {
    id: 'mat/highk-gate-wafer',
    name: '高 k 金属栅片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'eot', kind: 'range', min: 0, max: 10, unit: 'nm', dir: 'atMost' },
      { param: 'leakage', kind: 'range', min: 0, max: 1000, unit: 'A/cm²', dir: 'atMost' },
      { param: 'gateLength', kind: 'range', min: 0, max: 2000, unit: 'nm', dir: 'atMost' },
      { param: 'gateDielectric', kind: 'enum', values: ['hafnia', 'silicon-nitride'] },
      { param: 'metalGate', kind: 'enum', values: ['tin', 'none'] },
    ],
  },

  /**
   * 应变硅源漏片（eSiGe）。**路线已建（B 类），实测没有。**
   *
   * `make/strain-sd-wafer` 用 `plant/lpcvd-furnace`（700–750 °C / 13–40 Pa，
   * SiHCl₃ + GeCl₄ + H₂）在 LDD 片的源漏窗口里做选择性 SiGe 外延；
   * `make/silicide-tisi2-c49-sige` 再把它接回硅化物主线。
   *
   * 仍然缺的三样：选择比（对 SiO₂/Si₃N₄ 的成核抑制）没有实测、几何
   * （凹槽 20–30 nm）靠定时 ±10–15 %、应变/Ge 组分没有 Raman/XRD 量具。
   * 所以这一格是**设计值**：
   *
   *   strain  **越大越好**：判据 0.8 % 张应变（Ge 20–25 %），交付 0
   *           迁移率增益 1.3–1.5× 是文献值；本层没有迁移率/应变实测
   */
  {
    id: 'mat/strain-sd-wafer',
    name: '应变硅源漏片',
    unit: '片',
    category: 'part',
    props: [{ param: 'strain', kind: 'range', min: 0, max: 3, unit: '%', dir: 'atLeast' }],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线 —— 六条
//
// 接力顺序（一条链，一处分岔）：
//   硅片 →[栅氧 4 nm]→ 栅氧片 →[多晶硅栅 | 铝栅]→ 栅极片 →[LDD + 侧墙]→ LDD 片
//        →[TiSi₂]→ 硅化物片
//   栅氧片 →[HF-last + Si₃N₄ + TiN]→ 高k 片（8 nm 那一支，从中途分出去）
// ═══════════════════════════════════════════════════════════════════════════

export const GATE_ROUTES: readonly Route[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 2.1 栅氧化：41 s 的工艺，占 1 h 的炉时，交出 4 nm
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 干氧长栅氧。**唯一不需要掩模的一道，所以光刻的极限不吃它。**
     *
     *   进   硅片 1 片 + 氧 0.2 + 氮 0.2 + 氢氟酸 0.005 + 水 1
     *   出   栅氧片 1 片（eot 3.5–4.5 nm）
     *
     * ── 时间账（文件头 §一）──────────────────────────────────────────────
     *
     *   1.5 nm：Deal-Grove 76.9 s / 2.2 nm·min⁻¹ 口径 41 s ⇒ **41–77 s**
     *   而炉子升降温各 30 min ⇒ 1800 s ÷ 41 s = **44 倍**
     *   坡上自己长 3–5.5 nm（Ea = 2.0 eV，逐段积出来的）
     *   ⇒ 等温段压到 0，片子仍有 **4 nm** ⇒ eot 3.5–4.5（判据 1.2–1.5，差 2.7–3×）
     *
     * ── 为什么要 1 h 炉时而不是 41 s ──────────────────────────────────────
     *
     *   升温 30 + 等温 0.1 + 降温 30 = 60 min。**41 s 的工艺要被 3600 s 的炉时包着**，
     *   这是本层所有热工艺的共同形状（`make/cpu-32bit` 的 4 nm 也是这样来的）。
     *   后果不只是慢：**坡上那 3 nm 是不受控的** —— 炉温是热电偶读的，
     *   升降温曲线的重复性只有 ±10 %，所以 4 nm 的重复性也只有 ±10 %（工业 ±2 %）。
     *
     * ── 判据（#23）────────────────────────────────────────────────────────
     *
     *   厚度测不了（无椭偏仪；干涉仪 0.295 µm/条纹；QCM 在镀膜腔里不在炉管里）。
     *   所以这一条的 `gives` 是**开环声明**：判据 = 记账 + 成品「漏不漏」。
     *   干氧气路的 50–500 ppb 是铭牌不是读数 —— 坡上那 4 nm 里混多少氧，判不了。
     *
     * ── R8 升级 ──────────────────────────────────────────────────────────
     *
     *   RTO（100–200 K/s、秒级控温）+ 椭偏仪。缺 2 件，差 2.7–3×。
     */
    id: 'make/gate-oxide-dry',
    name: '栅氧化片制造',
    produces: [
      {
        item: 'mat/gate-oxide-wafer',
        qty: q(1),
        gives: [
          { param: 'eot', kind: 'range', min: 3.5, max: 4.5 },
          { param: 'oxideKind', kind: 'enum', oneOf: ['thermal-dry-o2'] },
          // GOI 资格带，不是单次读数；thickness 是物理厚度，不是 eot。
          { param: 'vbd', kind: 'range', min: 0, max: 200, record: 'mat/goi-vramp-record' },
          { param: 'ebd', kind: 'range', min: 5, max: 12, record: 'mat/goi-vramp-record' },
          { param: 'weibullBeta', kind: 'range', min: 1, max: 3, record: 'mat/goi-vramp-record' },
          { param: 'thickness', kind: 'range', min: 0.0035, max: 0.4, record: 'mat/goi-vramp-record' },
          { param: 'waferDiameter', kind: 'range', min: 100, max: 150, record: 'mat/goi-vramp-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 5) }] },
      // HF-last：剥 1–2 nm 原生氧化层。10 nm/s ⇒ 0.1–0.2 s，**只能靠疏水性判停**。
      { anyOf: [{ item: 'mat/hf', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh:
          'RCA 清洗 + HF-last：49 % 氢氟酸 1–2 s 剥掉 1–2 nm 原生氧化层（10 nm/s）—— 不能泡 10 s，那是 100 nm。停没停只能看疏水性（氢终止的硅面不润湿），没有膜厚量具',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '干氧 1000 °C：等温段压到 0（41 s 那一步控制不了，见文件头 §一），坡上自己长 3–5.5 nm ⇒ 交付 4 nm；升降温各 30 min，炉时 1 h。这一炉的 41 s 与 3600 s 的比值就是本层栅氧的下限',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 950, max: 1100 }],
      },
      {
        note_zh:
          '检验：厚度测不了（干涉仪 0.295 µm/条，4 nm = 0.014 条）→ 判据只有两条：时间×温度的记账，与成品的「栅氧漏不漏」。恒温间 ±1 K 是记账可重复的前提',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '硅片 1 片（0.05 kg）+ 氧 0.2 + 氮 0.2 + 氢氟酸 0.005 + 水 1 → 栅氧片 1 片；余是坡上多长出来的氧化层（4 nm 对判据 1.5）与清洗液。产物按片计，不做质量守恒',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.2 多晶硅栅：Lg = L_mask − 2t，t = 150 nm
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 多晶硅栅（自对准那一支）。**本层唯一能给出「自对准栅」的路，代价是栅长。**
     *
     *   进   栅氧片 1 片 + 氩 0.02 + 氮 0.02 + 硅溶胶 0.05 + 氧 0.02
     *        + 氢氟酸 0.02 + 重铬酸钠 0.005 + 胶 1 + 版 1 块 + 水 1
     *   出   栅极片 1 片（Lg 200–400 nm、多晶硅、55–80 Ω/□）
     *
     * ── 多晶硅从哪来：不是 LPCVD，是**溅射 + 高温晶化** ────────────────────
     *
     *   工业是 LPCVD（SiH₄，600–650 °C）。本层**没有硅烷**（`mat/silane` 0 条目，
     *   全仓库只有 `mat/trichlorosilane`，而它不在本文件白名单）。
     *   所以走 `plant/euv-coater` 的 `target-si`：0.10 nm/s（2N 硅靶起微弧，
     *   功率密度压到 0.5 W/cm² 才不弧，速率因此砍半 —— `euv-mirror.ts:335` 那段）
     *   ⇒ 150 nm 要 **1 500 s = 25 min**。膜是非晶的，后面的 1000 °C 磷推进
     *   顺手把它晶化（这一步不用单独一炉）。
     *
     *   ⚠️ 代价写在缺口②：靶是 2N 工业硅（98–99.5 %），金属杂质 1e18–1e19 cm⁻³
     *   ⇒ 比判据 1e15 差 1000–10000 倍。**这一条不是清洁工艺，是能出图形的工艺。**
     *
     * ── 刻蚀：Cr(VI) + HF（Secco 型），各向同性 ─────────────────────────────
     *
     *   HF 对硅是**停止层**（不咬），所以「HF 刻多晶硅」不成立。能咬硅的是
     *   Cr₂O₇²⁻ 先把 Si 氧化、HF 再把氧化层溶掉（`mat/sodium-dichromate` + `mat/hf`）。
     *   室温 0.5–1.5 µm/min，横向 = 纵向：
     *
     *     150 nm 膜：9–18 s，横向 **150 nm/边** ⇒ Lg = L_mask − 300 nm
     *     0.5 µm 版 → 200 nm；0.7 µm 版 → 400 nm；0.13 µm 版 → **−170 nm（图形消失）**
     *
     *   ⇒ 交付 **200–400 nm**，判据 40 nm，差 5–10×。
     *   同时 HF 从侧向咬 4 nm 栅氧（5 nm/s × 13.5 s = 67 nm/边）——
     *   200 nm 的栅底下只剩 66 nm 连续的栅氧。**各向同性的第二次收费。**
     *
     * ── 为什么版要 0.5 µm 而**不能**是 0.13 µm ────────────────────────────
     *
     *   这是本文件最反直觉的一格：**版越细，栅越不存在**（Lg 可以小于 0）。
     *   所以 `need` 写 `minFeature 0.5–0.7`（区间包含），不是 `atMost 0.7`。
     *   模型只有 `atMost`（越细越好），表达不了这一层 —— 见缺口⑥。
     *
     * ── R8 升级 ──────────────────────────────────────────────────────────
     *
     *   RIE（CF₄/O₂、10–30 mTorr、80–150 W、终点）+ 0.13 µm 投影曝光。
     *   缺 1 台设备 + 1 个投影台，差 5–10×。
     */
    id: 'make/gate-electrode-poly',
    name: '栅电极片制造',
    produces: [
      {
        item: 'mat/gate-electrode-wafer',
        qty: q(1),
        gives: [
          { param: 'gateLength', kind: 'range', min: 200, max: 400 },
          { param: 'gateMaterial', kind: 'enum', oneOf: ['poly-si'] },
          // ρ ≈ 1 mΩ·cm ÷ 150 nm = 67 Ω/□；磷掺杂重复性 ±20 %（PSG 不是气体源）
          { param: 'sheetResistance', kind: 'range', min: 55, max: 80 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/gate-oxide-wafer', qty: q(1) }] },
      // 溅射气：0.3 Pa 氩，25 min。用量按腔体体积与换气次数算，这里取 20 g/片。
      { anyOf: [{ item: 'mat/argon', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 50) }] },
      // 磷源：磷硅玻璃的 SiO₂ 骨架。真正的磷（POCl₃）不在白名单 —— 缺口①。
      { anyOf: [{ item: 'mat/silica', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 50) }] },
      // 去 PSG（20 nm，10 nm/s ⇒ 2 s）+ 刻蚀液的氢氟酸组分
      { anyOf: [{ item: 'mat/hf', qty: q(1, 50) }] },
      // Cr(VI)：把硅氧化成 SiO₂ 的那一半。浴液按 200 片换一次，取 5 g/片。
      { anyOf: [{ item: 'mat/sodium-dichromate', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      {
        /**
         * 一块 0.5–0.7 µm 的版。**这里要的是「粗版」** ——
         * Lg = L_mask − 2·150 nm：0.13 µm 的版会算出 −170 nm（图形消失）。
         * 所以窗口写成区间 `0.5–0.7`，放宽的后果是 `functional-kept`：
         * 换 0.7 µm 的版只是栅长从 200 涨到 400 nm，还是栅，只是更慢。
         */
        anyOf: [
          {
            item: 'std/photomask-general',
            qty: q(1),
            need: [{ param: 'minFeature', kind: 'range', min: 0.5, max: 0.7 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/film-monitor'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '溅射非晶硅 150 nm：`plant/euv-coater` 的 2N 硅靶，0.10 nm/s ⇒ 1 500 s（25 min）。速率用 `plant/film-monitor` 的 QCM 读 —— 膜厚直接决定栅长（Lg = L_mask − 2t），所以这一步的厚度比任何一步都要紧',
        performedBy: 'plant/euv-coater',
        under: [{ param: 'pressure', min: 0.1, max: 10 }],
      },
      {
        note_zh:
          '磷硅玻璃涂布 + 1000 °C 推进：同时完成晶化、掺磷、（对多晶硅而言）方阻 55–80 Ω/□。本层没有 POCl₃ 的气体源，重复性 ±20 %（气体源 ±3 %）',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 950, max: 1100 }],
      },
      {
        note_zh: '去 PSG：20 nm 在 49 % HF 里 2 s（10 nm/s）—— 多停 10 s 就把多晶硅顶上的栅氧也吃了',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '光刻 1 层：0.5–0.7 µm，胶 0.5 µm（M2 那一档）。±0.25 µm 的套刻在这里够用 —— 因为栅长本来就由膜厚定，不是由套刻定',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '湿法刻多晶硅：重铬酸钠 + 氢氟酸（Secco 型），室温、0.5–1.5 µm/min ⇒ 150 nm 用 9–18 s。**各向同性**：横向也 150 nm/边，Lg = L_mask − 300 nm。同一段时间 HF 还从侧向咬栅氧 67 nm/边',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '去胶 + 检验：看栅有没有连、有没有被侧蚀断（200 nm 的栅只剩 66 nm 连续栅氧，是这一格最脆的地方）。厚度用台阶仪量的那一档本层也没有 —— 栅长由「版宽 − 2×膜厚」记账',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '栅氧片 1 片 + 氩 0.02 + 氮 0.02 + 硅溶胶 0.05 + 氧 0.02 + 氢氟酸 0.02 + 重铬酸钠 0.005 + 胶 1 + 版 1 块 + 水 1 → 栅极片 1 片；余是刻掉的多晶硅（150 nm × 78.5 cm² × 2.33 g/cm³ ≈ 0.027 g）、Cr(III) 废液与胶的溶剂。产物按片计',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.3 铝栅（OR）：方阻好 100 倍，耐温差 340 K
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 铝栅（**非自对准**那一支，也是本层「自产芯片」历史上用的那一种 ——
     * `data/machine/deprocess.ts:628` 那句：「本层自产的是铝栅双极型」）。
     *
     *   进   栅氧片 1 片 + 铝 0.02 + 磷酸 0.004 + 胶 1 + 版 1 块 + 水 1
     *   出   栅极片 1 片（Lg 200–400 nm、铝、0.2–0.3 Ω/□）
     *
     * ── 为什么值得单独写一条：它把「栅长 × 方阻」那个两难解开了一半 ────────
     *
     *   磷酸刻铝（`deprocess.ts:578` 那条，85 % H₃PO₄ / 50–60 °C）：
     *     Al 0.5–1 µm/min、**对 SiO₂ 只有 1–2 nm/min** ⇒ 选择比 **500 : 1**
     *   于是：
     *     150 nm 的铝 9–18 s 刻穿，横向同样 150 nm/边 ⇒ Lg = L_mask − 300 nm（与多晶硅同）
     *     而栅氧只掉 1–2 nm/min × 0.3 min = **0.3–0.6 nm**（HF 那条是 67 nm/边）
     *   方阻：3.5 µΩ·cm ÷ 150 nm = **0.23 Ω/□**（判据 20–30，好 100 倍）
     *
     *   ⇒ **同样的栅长，方阻好 100 倍，栅氧几乎不被咬。** 这是磷酸相对 HF 的全部优势。
     *
     * ── 代价：660 °C ──────────────────────────────────────────────────────
     *
     *   铝 660 °C 熔、Al–Si 共晶 577 °C。所以后面任何一道 1000 °C 的工序
     *   （LDD 推进、侧墙氧化）都必须在**做栅之前**完成，栅只能最后做。
     *   ⇒ 栅与源漏之间没有自对准关系，靠另一块版（±0.25 µm）。
     *   ⇒ 重叠电容 C_ov ∝ 0.25 µm，在 200 nm 的栅上是 **1.25 倍的栅长**：
     *      f_T ∝ 1/(2π·gm/C) 直接掉一个量级。**仍然是晶体管，只是慢。**
     *
     *   所以本路线与 `make/ldd-spacer-none`（2.4 那条，1000 °C）**不能接**：
     *   链是按多晶硅排的。铝栅要用，得把 2.4 与 2.5 的顺序倒过来（缺口⑧）。
     *
     * ── 栅长还有一步可取 ──────────────────────────────────────────────────
     *
     *   把铝压到 50 nm + 0.13 µm 版：Lg = 130 − 100 = **30 nm 线宽**（判据 40 ✓）。
     *   但那不是「自对准栅」，换的是器件结构（#24 的 functional-lost），
     *   所以本文件不把它记账成降级，记成缺口（§四·⑦）。
     */
    id: 'make/gate-electrode-aluminium',
    name: '栅电极片制造',
    produces: [
      {
        item: 'mat/gate-electrode-wafer',
        qty: q(1),
        gives: [
          { param: 'gateLength', kind: 'range', min: 200, max: 400 },
          { param: 'gateMaterial', kind: 'enum', oneOf: ['aluminium'] },
          { param: 'sheetResistance', kind: 'range', min: 0.2, max: 0.3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/gate-oxide-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 50) }] },
      {
        /**
         * 85 % 磷酸。`mat/phosphoric-acid` 的条目里声明的浓度是 20–85 %，
         * 而这条路线要 70 % 以上（稀了速率掉、选择比也掉）。
         * 放宽的后果是 `functional-kept`：慢一点、栅长涨一点，还是栅。
         */
        anyOf: [
          {
            item: 'mat/phosphoric-acid',
            qty: q(1, 250),
            need: [{ param: 'concentration', kind: 'range', min: 70, max: 85 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      {
        // 同 2.2：要的是 0.5–0.7 的「粗版」，不是 0.13 的细版。
        anyOf: [
          {
            item: 'std/photomask-general',
            qty: q(1),
            need: [{ param: 'minFeature', kind: 'range', min: 0.5, max: 0.7 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(5) },
    steps: [
      {
        note_zh:
          '蒸铝 150 nm（0.001–0.01 Pa，基片 150 °C）。铝的蒸发温度低、绕射好，150 nm 在 200–400 nm 的线上台阶覆盖不是问题 —— 这一条比 `make/cpu-32bit` 的 1 µm 铝容易',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh: '光刻 1 层：0.5–0.7 µm。非自对准 —— 栅与源漏的关系由这一块版单独定位',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '湿法刻铝：85 % 磷酸 / 50–60 °C，Al 0.5–1 µm/min、对 SiO₂ 1–2 nm/min（500 : 1）⇒ 150 nm 用 9–18 s，横向 150 nm/边（Lg = L_mask − 300 nm），栅氧只掉 0.3–0.6 nm',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 50, max: 60 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '去胶 + 检验。⚠️ 这一片**不能进 660 °C 以上的炉子**：铝熔。所以它只能接非自对准的后道，接不了 2.4 那条 1000 °C 的 LDD',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '栅氧片 1 片 + 铝 0.02 + 磷酸 0.004 + 胶 1 + 版 1 块 + 水 1 → 栅极片 1 片；余是刻掉的铝（150 nm × 78.5 cm² × 2.7 g/cm³ ≈ 0.032 g）与磷酸铝废液。产物按片计',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.4 LDD 与侧墙：结深差 10–20 倍，侧墙反而达标
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * LDD 浅结 + 热氧化侧墙。**本文件里唯一「一条规格差一个量级、另一条规格达标」的路。**
     *
     *   进   栅极片 1 片 + 硅溶胶 0.05 + 胶 1 + 版 1 块 + 氢氟酸 0.02
     *        + 氧 0.2 + 氮 0.2 + 水 1
     *   出   LDD 片 1 片（x_j 300–400 nm、侧墙 40–55 nm 氧化硅）
     *
     * ── LDD 的浅结：名义 14 s，坡上就用完了 ────────────────────────────────
     *
     *   目标 x_j = 20 nm ⇒ Dt = (2e-6)² / 27.67 = 1.445e-13 cm²
     *   硼在 1000 °C 的 D = 1e-14 ⇒ t = **14.4 s**
     *   而两个升降温坡合计 3.96e-12，是它的 **27 倍** ⇒ 坡一过就是 105 nm
     *   再加 0–2 min 的等温（1.2e-12）⇒ **120–150 nm**（判据 20–30，差 4–7×）
     *
     * ── 侧墙氧化又把结推深一次（这才是 300–400 nm 的来源）────────────────
     *
     *   侧墙要 45 nm 的 SiO₂ ⇒ 干氧 1000 °C：x² + Ax = Bt 给 0.808 h ≈ **48 min**
     *   这 48 min 的 Dt = 1e-14 × 2 880 = **2.88e-11**，比 LDD 那一炉大 4 倍：
     *     x_j = 5.26√(5.16e-12 + 2.88e-11) = 5.26 × 5.8e-6 = **0.31 µm**
     *   ⇒ **交付 300–400 nm，判据 20–30 nm，差 10–20×。**
     *   **侧墙的 45 nm 与浅结的 300 nm 是同一笔热预算买的两样东西** ——
     *   这一句是本路线唯一要记住的。
     *
     * ── 侧墙为什么是氧化硅而不是氮化硅（文件头 §三）──────────────────────
     *
     *   氮化硅那条**数学上不可能**：溅射台阶覆盖 20–40 %（侧壁 30–60 nm 而场区
     *   150 nm），热磷酸各向同性 10 nm/min ⇒ 清场区要溶 150 nm，侧壁先净尽。
     *   留下的必要条件是「侧壁比场区厚」，溅射给的是反的。
     *
     *   热氧化侧墙则是**自对准**长出来的：宽度 = 氧化层厚度 = 45 nm（判据 40–60 ✓），
     *   不需要套刻。它挡住硅化物也够（Ti 与 SiO₂ 在 600 °C 不反应）。
     *   代价两条：① 多晶硅每边被吃掉 0.44 × 45 = 20 nm（栅长 200 → 160）；
     *   ② 与场氧同材质 ⇒ 后道开接触孔的 HF（10 nm/s）会把两者同速溶掉
     *   —— 那是互连那一半的事，记成 R8 第 3 行（Si₃N₄ 在同样 4.5 s 里只掉 0.4–0.75 nm）。
     *
     *   **只给 n 型 LDD**：PSG 里的磷是 n 型掺杂；p-LDD 不能靠这一条，
     *   要走并列的 `make/p-ldd-spacer-oxide`（BF₃）。同一块版只开一种窗口，
     *   n/p 两道 LDD 的套刻本层没做。
     *
     * ── LDD 的位置只有光刻的精度 ──────────────────────────────────────────
     *
     *   磷硅玻璃 + 一块版开窗（±0.25 µm）。侧墙是在 LDD 之后才长的，所以它
     *   **不提供 LDD 的偏移** ⇒ LDD 的边界离栅 0 ± 250 nm（6 倍于 40 nm 的栅长）。
     */
    id: 'make/ldd-spacer-oxide',
    name: 'LDD 侧墙片制造',
    produces: [
      {
        item: 'mat/ldd-wafer',
        qty: q(1),
        gives: [
          { param: 'junctionDepth', kind: 'range', min: 300, max: 400 },
          { param: 'spacerWidth', kind: 'range', min: 40, max: 55 },
          { param: 'spacerMaterial', kind: 'enum', oneOf: ['silicon-dioxide'] },
          { param: 'lddType', kind: 'enum', oneOf: ['n'] },
          { param: 'waferId', kind: 'range', min: 0, max: 1000 },
          { param: 'overlayMarks', kind: 'enum', oneOf: ['absent'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/gate-electrode-wafer', qty: q(1) }] },
      // 磷源：磷硅玻璃（缺口① —— 真正的 POCl₃ 不在白名单）。
      { anyOf: [{ item: 'mat/silica', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      {
        // 开 LDD 窗口的那一块：0.5–0.7 µm 就够（要开的是 1–2 µm 的源漏窗），
        // 但「够」不等于「越细越好」—— 细版的套刻仍是 ±0.25 µm。
        anyOf: [
          {
            item: 'std/photomask-general',
            qty: q(1),
            need: [{ param: 'minFeature', kind: 'range', min: 0.5, max: 0.7 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      // 去 PSG（20 nm，2 s）
      { anyOf: [{ item: 'mat/hf', qty: q(1, 50) }] },
      // 侧墙氧化 45 nm：O₂ 是耗材里的大头（48 min 的炉时）
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(14) },
    steps: [
      {
        note_zh:
          '磷硅玻璃涂布 + 光刻开窗（1 块版，±0.25 µm 套刻）：LDD 的边界离栅 0 ± 250 nm —— 侧墙是在这之后才长的，所以它不给 LDD 任何偏移',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          'LDD 推进 1000 °C：名义 20 nm 只要 14.4 s（Dt = 1.445e-13 / D = 1e-14），而两个坡合计 3.96e-12 是它的 27 倍 ⇒ 坡一过就 105 nm，等温 0–2 min 后 120–150 nm（判据 20–30，差 4–7×）',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 950, max: 1100 }],
      },
      {
        note_zh: '去 PSG：20 nm 在 49 % HF 里 2 s。多停 5 s 就把源漏上那层薄的牺牲氧化层也吃了',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '侧墙：干氧 1000 °C，45 nm SiO₂（x²+Ax=Bt ⇒ 0.808 h ≈ 48 min）。自对准长在栅的侧壁上，宽度就是厚度 40–55 nm（判据 40–60 ✓）。**代价**：多晶硅每边吃掉 20 nm（栅长 200→160），而这 48 min 的 Dt = 2.88e-11 把 LDD 的 0.15 µm 推到 0.31 µm',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 950, max: 1100 }],
      },
      {
        note_zh:
          '**不做的那一步，写在这里**：氮化硅侧墙 + 热磷酸各向异性回刻。溅射的台阶覆盖只有 20–40 %（侧壁 30–60 nm 而场区 150 nm），热磷酸是各向同性 10 nm/min ⇒ 清场区时侧壁先净尽（4 min 侧壁没了，场区还剩 110 nm）。这一步在数学上不可能成功，与参数无关',
      },
      {
        note_zh:
          '检验：结深**可测了**（`plant/sims`：深度分辨 2.4–8 nm、RSF 自建 ±8 %，实测 ±10 %），判据 0.1 µm 只差 1.5 倍而不是 10–20 倍；侧墙宽度用显微镜量线宽差（`plant/mask-aligner` 的物镜 4.8 µm —— 45 nm 是它的 1/100，仍量不了）⇒ 侧墙那一格还是开环声明',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '栅极片 1 片 + 硅溶胶 0.05 + 胶 1 + 版 1 块 + 氢氟酸 0.02 + 氧 0.2 + 氮 0.2 + 水 1 → LDD 片 1 片；余是 PSG 的溶剂、HF 溶掉的 20 nm 氧化层、侧墙氧化消耗掉的硅（45 nm × 78.5 cm² × 2.33 ≈ 0.008 g）。产物按片计',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.5 自对准硅化物：TiSi₂ 能做，n⁺ 压线、p⁺ 差 4 倍
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 自对准硅化物（TiSi₂，C49）。**接触电阻这一格的答案。**
     *
     *   进   LDD 片 1 片 + 钛 0.001 + 氩 0.02 + 氮 0.02 + 氢氟酸 0.01 + 水 1
     *   出   硅化物片 1 片（ρc n⁺ 10 / p⁺ 40 Ω·µm²、C49、12–20 Ω/□）
     *
     * ── 为什么是 TiSi₂ 而不是 NiSi ────────────────────────────────────────
     *
     *   40 nm 节点工业上用 NiSi（低温 400–500 °C、ρc 好 2–3 倍）。
     *   本层**镍链已通**：`make/nickel`（ores.ts:216，250 : 1 富集经
     *   `make/nickel-concentrate` + `make/flotation-reagent`）—— 但 **NiSi 的
     *   镍膜溅射/硅化路线还没写**，所以本文件仍只给 TiSi₂。
     *   钛**通**（`data/material/titanium.ts` 一整条 make/）。
     *
     * ── 比接触电阻：单位先钉死（这一格最容易错 100 倍）────────────────────
     *
     *   1 Ω·cm² = (1e4 µm)² = **1e8 Ω·µm²** ⇒ 判据 1e-7 Ω·cm² = **10 Ω·µm²**
     *     TiSi₂  n⁺ **1e-7 Ω·cm² = 10 Ω·µm²**（判据压线，1×）
     *            p⁺ **4e-7 Ω·cm² = 40 Ω·µm²**（**差 4 倍**）
     *     NiSi   n⁺ 5e-8（5）、p⁺ 1.5e-7（15）—— 好 2–3 倍，但料没有
     *   ⇒ `gives` 的窗口写 **10–40**：下界是 n⁺、上界是 p⁺，一个 props 只能一个窗口。
     *   这两个数是**文献值不是实测**：TLM 要四探针 + 变温，本层都没有。
     *
     * ── 为什么只到 C49 ────────────────────────────────────────────────────
     *
     *   C49 → C54 要 700–800 °C / 30 s 的 RTA。本层只有炉子（升降温各 30 min）：
     *   30 min 的炉时让硅化物横向长 **0.1–0.15 µm**，而侧墙只有 45 nm ——
     *   它从源漏一侧**爬过侧墙碰到栅**，栅源漏短路（垂直方向 74 nm 远没到 0.3 µm 的结）。
     *   600–650 °C / 30 min 只长 **0.05 µm ≈ 侧墙宽**，刚好不越过
     *   ⇒ **交付 C49，片阻 12–20 Ω/□**（C54 是 2.7–3.5，差 4.5–6 倍）。
     *
     * ── 自对准这个词在这里是真的 ──────────────────────────────────────────
     *
     *   侧墙（40–55 nm 热氧化硅）挡住横向硅化：Ti 与 SiO₂ 在 600 °C 不反应，
     *   所以栅顶与源漏上的硅化物被侧墙隔开 —— 这一步是**自对准**的，不要掩模。
     *   没有侧墙就没有自对准硅化物，这是 2.4 那条侧墙真正的用处。
     *
     * ⚠️ 与 2.3 的铝栅不相容：600 °C 会把 Al–Si（共晶 577 °C）熔穿（缺口⑧）。
     */
    id: 'make/silicide-tisi2-c49',
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
      { anyOf: [{ item: 'mat/ldd-wafer', qty: q(1) }] },
      // 20 nm 钛：78.5 cm² × 20 nm × 4.5 g/cm³ = 7.1e-4 kg；取 1 g 含靶与夹具损耗
      { anyOf: [{ item: 'mat/titanium', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 50) }] },
      // 退火与溅射的氮（Ti 在氮里 600 °C 会氮化，所以退火用氮、溅射用氩，不能串）
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 50) }] },
      // 选择性去未反应 Ti：HF。Ti : TiSi₂ 只有 5–10 : 1（工业要 20 : 1）
      { anyOf: [{ item: 'mat/hf', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh:
          '溅射 Ti 20 nm（0.1–10 Pa 氩，`plant/euv-coater` 换 Ti 靶 —— 靶不在它的 composedOf 里，见缺口③）。厚度决定硅化物厚度：20 nm Ti → 约 49 nm TiSi₂（2.46 倍的体积膨胀）',
        performedBy: 'plant/euv-coater',
        under: [{ param: 'pressure', min: 0.1, max: 10 }],
      },
      {
        note_zh:
          '硅化 600–650 °C / 30 min（氮气氛）：Ti + 2Si → TiSi₂（C49，ρ 60–100 µΩ·cm）。横向生长 0.05 µm ≈ 侧墙宽 —— 刚好不越过。**不能升到 700–800**：那是 C54，横向会长 0.1–0.15 µm，爬过 45 nm 的侧墙就是栅源漏短路',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 600, max: 650 }],
      },
      {
        note_zh:
          '选择性去未反应 Ti（49 % HF，室温）：**Ti : TiSi₂ 只有 5–10 : 1**，过刻 50 % 会吃掉 4–10 nm 的硅化物（49 nm 剩 39–45）。工业用 NH₄OH/H₂O₂ 或 H₂SO₄/H₂O₂（选择性 20 : 1 以上），本层的双氧水没有条目',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '检验：比接触电阻测不了（TLM 要四探针 + 变温，本层 0 台）⇒ ρc 是**按工艺窗口声明的文献值**。能测的只有「源漏通不通、栅漏不漏」',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'LDD 片 1 片 + 钛 0.001 + 氩 0.02 + 氮 0.02 + 氢氟酸 0.01 + 水 1 → 硅化物片 1 片；余是 HF 溶掉的未反应钛（约 0.4 g）、被吃掉的 4–10 nm 硅化物、蒸发皿损耗。产物按片计',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2.6 高k 金属栅（8 nm 那一支）：EOT 达标，漏电差 2.5 个量级
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 高k 介质 + 金属栅（8 nm 节点那一支）。**从栅氧片分岔出去，不走多晶硅那一条。**
     *
     *   进   栅氧片 1 片 + 氢氟酸 0.005 + 氮 0.05 + 氩 0.05 + 钛 0.001
     *        + 胶 1 + 版 1 块 + 水 1
     *   出   高k 片 1 片（eot 1.2–1.3、漏电 0.3–3 A/cm²、Lg 70–110 nm、Si₃N₄ + TiN）
     *
     * ── 为什么从「已经长过 4 nm 氧化层」的片上做 ──────────────────────────
     *
     *   因为那一层要被**剥掉**（HF-last）：4 nm 在 49 % HF 里 **0.4 s**。
     *   留着它就是 4 nm 的界面层 + 2.15 nm 的氮化硅 ⇒ EOT = 4 + 1.2 = 5.2 nm，
     *   比不换高k 还差。所以 8 nm 那一支的第一道是「把前面那一支的成果去掉」——
     *   这不是浪费，它说明**热氧化与沉积是两条互斥的路**。
     *
     * ── EOT：沉积没有热预算，所以这一格达标 ──────────────────────────────
     *
     *   Si₃N₄ k = 7：EOT = t × 3.9/7 ⇒ t = 1.2 × 7/3.9 = **2.15 nm**（取 2.2）
     *   溅射 Si₃N₄（Si 靶 + N₂，`subnm-readout.ts:768` 同一炉工艺）0.10 nm/s
     *   ⇒ **22 s**，QCM 分辨 0.14 nm = 6 %（`plant/film-monitor`）
     *   ⇒ **eot 1.2–1.3 nm 对判据 1.2 —— 达标。** 这是本文件唯一「对标即达」的规格。
     *
     * ── 漏电：同 EOT 下隧穿按物理厚度算，Si₃N₄ 只换到一半 ─────────────────
     *
     *   Si₃N₄ 2.15 nm ↔ HfO₂ 7.7 nm（同 EOT 1.2）。隧穿对物理厚度是指数的：
     *   **0.3–3 A/cm² 对 ≤1e-2 ⇒ 差 30–300 倍。**
     *   高k 的全部意义是「用厚度换漏电」；Si₃N₄ 的 k 只有 7，换到一半就没了。
     *   要补这一格不是工艺问题，是**材料问题**：铪 0 条目（连 `mat/hafnium` 都没有），
     *   差整条锆铪分离链。
     *
     * ── 界面：HF-last 之后直接溅射，没有热氧化界面层 ───────────────────────
     *
     *   Dit 1e13 对判据 1e11 ⇒ **差 100 倍**。判据只能靠疏水性（氢终止面不润湿）。
     *   这是"没有量具就算未测"的同型：判据在那儿，量具不在那儿。
     *
     * ── 栅长：TiN 只有 20 nm，所以反而比多晶硅那条细 3 倍 ─────────────────
     *
     *   Lg = L_mask − 2·t_metal；t = 20 nm ⇒ 0.13 µm 的版给 **70–110 nm**
     *   （判据 20 nm，差 3.5–5.5×）。**同一个各向同性定理，被一个更薄的膜解开了大半。**
     *   而 TiN 20 nm 的方阻 80–120 Ω/□（判据没有规定 —— 8 nm 的金属栅本来就该更厚，
     *   加厚就换回栅长，还是 §二那个两难）。
     *
     * ── 顺带一句：腐蚀液吃 2.2 nm 的介质 ──────────────────────────────────
     *
     *   HF 对 Si₃N₄ 5–10 nm/min ⇒ 0.08–0.17 nm/s；刻 20 nm TiN 只要 2–3 s
     *   ⇒ 介质掉 **0.25–0.5 nm（11–23 %）**。所以这一条的过刻只能 50 %，
     *   而且这 0.25 nm 要算进 EOT 的重复性里。
     */
    id: 'make/highk-metal-gate',
    name: '高 k 金属栅片制造',
    produces: [
      {
        item: 'mat/highk-gate-wafer',
        qty: q(1),
        gives: [
          { param: 'eot', kind: 'range', min: 1.2, max: 1.3 },
          { param: 'leakage', kind: 'range', min: 0.3, max: 3 },
          { param: 'gateLength', kind: 'range', min: 70, max: 110 },
          { param: 'gateDielectric', kind: 'enum', oneOf: ['silicon-nitride'] },
          { param: 'metalGate', kind: 'enum', oneOf: ['tin'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/gate-oxide-wafer', qty: q(1) }] },
      // HF-last：剥掉 4 nm 的热氧化层（0.4 s）+ 之后每次开腔前的清洗
      { anyOf: [{ item: 'mat/hf', qty: q(1, 200) }] },
      // 氮：Si₃N₄ 的氮与 TiN 的氮，反应溅射的两路气
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 20) }] },
      // TiN 20 nm：78.5 cm² × 20 nm × 5.4 g/cm³ = 8.5e-4 kg；取 1 g 含靶损耗
      { anyOf: [{ item: 'mat/titanium', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      {
        /**
         * 一块 0.1–0.15 µm 的版（`make/photomask-deepsub` 那一档）。
         * **这里要的是细版** —— 因为被刻的金属只有 20 nm，Lg = L_mask − 40 nm。
         * 与 2.2/2.3 正好相反：同一台对准机，一条要粗版、一条要细版，
         * 差别全在被刻膜厚。这一对照就是 §二那个定理的两种极端。
         */
        anyOf: [
          {
            item: 'std/photomask-general',
            qty: q(1),
            need: [
              { param: 'minFeature', kind: 'range', min: 0.1, max: 0.15 },
            ],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/film-monitor'],
    rate: { hours: q(7) },
    steps: [
      {
        note_zh:
          'HF-last：49 % 氢氟酸剥掉前面那 4 nm 热氧化层（10 nm/s ⇒ 0.4 s）。停没停只看疏水性 —— 氢终止的硅面不润湿。这一步是 8 nm 那一支与 40 nm 那一支的分岔点',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '反应溅射 Si₃N₄ 2.2 nm（Si 靶 + N₂，0.10 nm/s ⇒ 22 s；QCM 分辨 0.14 nm = 6 %）⇒ EOT = 2.2 × 3.9/7 = 1.2 nm（判据 1.2 ✓）。**沉积没有热预算**，这是它与热氧化最要紧的区别',
        performedBy: 'plant/euv-coater',
        under: [{ param: 'pressure', min: 0.1, max: 10 }],
      },
      {
        note_zh:
          '反应溅射 TiN 20 nm（Ti 靶 + N₂，钛有链、氮有料 —— 8 nm 那一支唯一「要什么有什么」的一格）。方阻 200 µΩ·cm ÷ 20 nm = 100 Ω/□',
        performedBy: 'plant/euv-coater',
        under: [{ param: 'pressure', min: 0.1, max: 10 }],
      },
      {
        note_zh:
          '光刻 1 层：0.1–0.15 µm（deepsub 版），胶 0.5 µm。±0.25 µm 的套刻在这一层是 2 倍于线宽 —— 所以 8 nm 这一支的套刻账比 40 nm 那一支更难看，只是本文件只判栅长',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '湿法刻 TiN（HF 型）：TiN 约 10 nm/s ⇒ 20 nm 用 2–3 s（含 50 % 过刻）。横向同量 ⇒ 20–30 nm/边 ⇒ Lg = 130 − 40~60 = **70–90 nm**。同一段时间 HF 咬 Si₃N₄ 5–10 nm/min ⇒ 介质掉 0.25–0.5 nm（11–23 %），**所以过刻只能 50 %**',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '去胶 + 检验：EOT 与漏电都测不了（没有 C-V、没有 I-V 台）⇒ 两格都是开环声明。能测的只有「栅与源漏通不通」',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '栅氧片 1 片 + 氢氟酸 0.005 + 氮 0.05 + 氩 0.05 + 钛 0.001 + 胶 1 + 版 1 块 + 水 1 → 高k 片 1 片；余是 HF 剥掉的 4 nm 氧化层（0.07 g 的 SiO₂）、刻掉的 TiN（20 nm × 78.5 cm² × 5.4 ≈ 0.008 g）、未反应 Ti。产物按片计',
  },

  {
    /**
     * 高 k 金属栅（**ALD 版**）—— 8 nm 那一格的收尾。
     *
     * 与 \`make/highk-metal-gate\` 同产物，只换**介质来源**：
     * 从"溅射 2.15 nm Si₃N₄ 顶 EOT"换成"\`mat/hfo2-wafer\`（ALD 长的 HfO₂）"。
     *
     * 这一换的差别全在三处：
     *   EOT      1.0–1.2 nm（与 Si₃N₄ 那版持平 —— **不是它赢的地方**）
     *   漏电     1e-3–1e-2 A/cm² 对 Si₃N₄ 的 0.3–3 → **30–300 倍**
     *   Dit      1e11–1e12 对直接溅射的 1e13 → **10–100 倍**
     * 所以 HfO₂ 换来的不是"更薄的等效氧化层"，是**"薄了还不漏电"**。
     */
    id: 'make/highk-metal-gate-ald',
    name: '高 k 金属栅片制造',
    produces: [
      {
        item: 'mat/highk-gate-wafer',
        qty: q(1),
        gives: [
          { param: 'eot', kind: 'range', min: 1.0, max: 1.2 },
          { param: 'leakage', kind: 'range', min: 1e-3, max: 1e-2 },
          { param: 'gateLength', kind: 'range', min: 29, max: 48 },
          { param: 'gateDielectric', kind: 'enum', oneOf: ['hafnia'] },
          { param: 'metalGate', kind: 'enum', oneOf: ['tin'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/hfo2-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/titanium', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '反应溅射 TiN 金属栅 20 nm（Ti + N₂）', performedBy: 'plant/euv-coater', under: [{ param: 'pressure', min: 0.1, max: 10 }] },
      { note_zh: '光刻 + RIE 刻栅（现在有 Cl₂ 的 85–88° 了）', performedBy: 'plant/rie-etcher' },
      { note_zh: '量 EOT 与漏电（C-V 与 I-V）；**Dit 仍测不出，只能算**', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(7) },
    unbalanced_zh:
      'HfO₂ 片 1 + 钛 0.001 + 氮 0.02 + 氩 0.02 + 胶 1 + 水 1 → 高 k 片 1 片；余是刻掉的 TiN（20 nm × 78.5 cm² × 5.4 ≈ 0.008 g）与未反应钛。产物按片计',
  },

  {
    /**
     * **前道完成片（SADP 版）** —— 按名义栅长判 node 之后补的第二条生产者。
     *
     * 与 `make/device-wafer` 同产物、同检验，区别只在**栅的来源**：
     * 那一条吃任意栅片（200–400 nm 的 poly 或 0.13 µm 的铝），所以 node 只能写 40–400；
     * 这一条只吃 SADP 的 29–48 nm 栅，于是 node 能收到 **32–48**（名义 40、容差 ±25 %）。
     *
     * 为什么必须分成两条：`node` 的判据是 atMost，而窗口 40–400 的上界 400 永远压不过
     * "40 nm 档 ≤50" 这一格 —— 一条宽窗口会把两条芯片路线的判决一起拖成"不通过"。
     * 分开之后报告才能说清"走 SADP 这一支是 40 nm 档"。
     */
    id: 'make/device-wafer-sadp',
    name: '前道完成片制造',
    produces: [
      {
        item: 'mat/device-wafer',
        qty: q(1),
        gives: [{ param: 'node', kind: 'range', min: 32, max: 48 }],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/gate-electrode-wafer',
            qty: q(1),
            need: [{ param: 'gateLength', kind: 'range', max: 48, dir: 'atMost' }],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '测 Vt 与 Lg：SADP 那一支的 Lg 是 29–48 nm，CD 3σ 9 nm（cd-sem 可量）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '判是否够 40 nm 档：node = 名义栅长 ±25 % ⇒ 32–48 才算', performedBy: 'plant/cd-sem', under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }] },
      { note_zh: '转序入后道（划片道清洁）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 60 }] },
    ],
    rate: { hours: q(2) },
    unbalanced_zh: 'SADP 栅片 1 + 水 1 → device 片 1 片；这一条只判不造，产物按片计',
  },

  {
    /**
     * 多晶硅栅（**SADP 定义的 40 nm 那一版**）。
     *
     * 与 `make/gate-electrode-poly` 同产物、同工艺，只换**起始片**：
     * 从 `mat/gate-oxide-wafer`（裸栅氧）换成 `mat/mp-gate-wafer`
     * （`data/machine/multi-patterning.ts` 长出侧墙、去芯轴、转移后的栅图形）。
     *
     * 代价与收益：栅长从 200–400 nm 掉到 **29–48 nm（名义 40）**，
     * 而**套刻是 0** —— SADP 那八道工序全部自对准（侧墙贴芯轴长、回刻垂直、
     * 以侧墙为掩模转移），这是本层唯一一处不需要对准机的图形步骤。
     * 换来的代价是方阻升到 100–160 Ω/□（线宽收窄到 40 nm）。
     */
    id: 'make/gate-electrode-poly-sadp',
    name: '栅电极片制造',
    produces: [
      {
        item: 'mat/gate-electrode-wafer',
        qty: q(1),
        gives: [
          { param: 'gateLength', kind: 'range', min: 29, max: 48 },
          { param: 'gateMaterial', kind: 'enum', oneOf: ['poly-si'] },
          { param: 'sheetResistance', kind: 'range', min: 100, max: 160 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/mp-gate-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '磷硅玻璃沉积 150 nm（POCl₃ 不在白名单，用 PSG 固体源）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 950, max: 1100 }] },
      { note_zh: '退火让磷进多晶硅（30 min）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 950, max: 1100 }] },
      { note_zh: '去 PSG（HF 2 s）+ 冲洗', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 60 }] },
      { note_zh: '量线宽与方阻（Lg 29–48、R□ 100–160）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(9) },
    unbalanced_zh:
      'SADP 栅片 1 + 硅石 0.05 + 氧 0.02 + 氢氟酸 0.005 + 水 1 → 多晶硅栅片 1 片；余是 PSG 与刻掉的氧化层（产物按片计）',
  },

  {
    /**
     * **前道完成片**（`mat/device-wafer`）—— 全链最后一处接口节点。
     *
     * 它夹在"前道（器件）"与"后道（互连）"之间：
     *   栅氧 → 多晶硅/高 k 栅 → LDD 与侧墙 → 硅化物 → **这一条** → 大马士革互连
     * 所以它自己不改变器件，只做**检验与转序**：量 Vt、量 Lg、判良品，然后进互连。
     *
     * 在补这一条之前，`mat/device-wafer` 在 `damascene.ts` 里是**声明了却没有路线的断点**
     * —— 大马士革每一道工序都消费它，而没有任何一处产出它。
     */
    id: 'make/device-wafer',
    name: '前道完成片制造',
    produces: [
      {
        item: 'mat/device-wafer',
        qty: q(1),
        gives: [
          { param: 'node', kind: 'range', min: 40, max: 400 },
        ],
      },
    ],
    uses: [
      // C54 是硅化物的最终相；C49（mat/silicide-wafer）只是它的前驱，
      // 不跟 C54 并列。高 k 栅是另一条支路（见 make/device-wafer-highk），
      // 不是本路线的 AND 项。
      { anyOf: [{ item: 'mat/c54-silicide-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '测 Vt 与 Lg（40 nm 那支量 CD 3σ）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '剖面复核：e-beam 剖面束斑 12 nm，而 CD 3σ 是 3.5 nm（0.3 个束斑 ⇒ 开环）', performedBy: 'plant/e-beam-column' },
      { note_zh: '划片道清洁 + 转序入后道', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 60 }] },
    ],
    rate: { hours: q(2) },
    unbalanced_zh: '前道完成片 1 片 + 水 1 → device 片 1 片；这一条只判不造，产物按片计',
  },

  {
    /**
     * **高 k 栅支路的前道完成片** —— 与 `make/device-wafer` 并列，不是 AND。
     *
     * 原来 `make/device-wafer` 的 `uses` 同时要 c54、C49 与 high-k 三片，
     * 那是把“多晶硅/SiON”与“高 k 金属栅”两条互斥的栅栈写成了 AND：
     * 没有任何一片真实的 wafer 同时是这三样。
     * 本路线只吃高 k 片；多晶硅支路走 `make/device-wafer`。
     */
    id: 'make/device-wafer-highk',
    name: '前道完成片制造',
    produces: [
      {
        item: 'mat/device-wafer',
        qty: q(1),
        gives: [{ param: 'node', kind: 'range', min: 40, max: 400 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/highk-gate-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '测 Vt 与 Lg（40 nm 那支量 CD 3σ）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '剖面复核：e-beam 剖面束斑 12 nm，而 CD 3σ 是 3.5 nm（0.3 个束斑 ⇒ 开环）', performedBy: 'plant/e-beam-column' },
      { note_zh: '划片道清洁 + 转序入后道', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 60 }] },
    ],
    rate: { hours: q(2) },
    unbalanced_zh: '高 k 前道片 1 片 + 水 1 → device 片 1 片；这一条只判不造，产物按片计',
  },

  {
    /**
     * **p-LDD：BF₃ 开窗 + B⁺ 注入 + 45 nm 侧墙氧化。**
     *
     *   `mat/gate-electrode-wafer` 1 + BF₃ 1 mg + 胶 1 g
     *   + 0.5–0.7 µm 版 1 + O₂ 0.2 kg + N₂ 0.2 kg + 水 1 kg
     *     → `mat/ldd-wafer` 1（lddType = p）
     *
     * 步骤：p-LDD 开窗光刻 → BF₃ 注入（B⁺ 20–30 keV、1e13–1e14 cm⁻²、7°）
     * → 去胶 → 侧墙干氧 45 nm。
     *
     * ⚠️ p-LDD 只解决“有 p 型低掺杂”；**不解决 p⁺ 固溶度**（p⁺ 仍是
     * 源漏注入 + 激活那一格）。BF₃ 的质量分离/剂量均匀性未标定；
     * n/p 两道 LDD 的套刻未做——同一块版只开一种窗口。
     *
     * 结深：B⁺ 20–30 keV 的 Rp 只有几十 nm；45 min 侧墙氧化的热预算把
     * 它推到 0.3–0.4 µm，与 n 路线同账。侧墙宽度 40–55 nm 是热氧化
     * 厚度，不是淀积/回刻。
     */
    id: 'make/p-ldd-spacer-oxide',
    name: 'LDD 侧墙片制造',
    produces: [
      {
        item: 'mat/ldd-wafer',
        qty: q(1),
        gives: [
          { param: 'junctionDepth', kind: 'range', min: 300, max: 400 },
          { param: 'spacerWidth', kind: 'range', min: 40, max: 55 },
          { param: 'spacerMaterial', kind: 'enum', oneOf: ['silicon-dioxide'] },
          { param: 'lddType', kind: 'enum', oneOf: ['p'] },
          { param: 'waferId', kind: 'range', min: 0, max: 1000 },
          { param: 'overlayMarks', kind: 'enum', oneOf: ['absent'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/gate-electrode-wafer', qty: q(1) }] },
      // BF₃ 1 mg：B⁺ 1e13–1e14 × 78.5 cm² = 7.85e14–7.85e15 个 B，质量 ng 级；1 mg 是过量源
      { anyOf: [{ item: 'mat/boron-trifluoride', qty: q(1, 1000000) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      {
        anyOf: [
          {
            item: 'std/photomask-general',
            qty: q(1),
            need: [{ param: 'minFeature', kind: 'range', min: 0.5, max: 0.7 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      // 侧墙干氧 45 nm：与 n 路线同一笔 48 min 炉时
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(14) },
    steps: [
      {
        note_zh:
          '① p-LDD 开窗光刻：涂胶 1–1.5 µm、前烘、0.5–0.7 µm 版曝光、NaOH 显影；版只开 p 型窗口，套刻 ±0.25 µm',
        performedBy: 'plant/mask-aligner',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② BF₃ 注入：B⁺ 20–30 keV、1e13–1e14 cm⁻²、7°；BF₃ 是源气，不是固体源。剂量均匀性/质量分离（¹¹B/¹⁰B）未标定',
        performedBy: 'plant/ion-implanter',
        under: [
          { param: 'energy', min: 20, max: 30 },
          { param: 'pressure', min: 1e-4, max: 1e-3 },
        ],
      },
      {
        note_zh:
          '③ 去胶：70–90 °C 热水 + 刷；不能 HF（HF 会吃侧墙/牺牲氧化）。B⁺ 尚未激活',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 70, max: 90 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '④ 侧墙干氧 1000 °C，45 nm SiO₂（≈48 min）：x²+Ax=Bt。**这一步同时把 B⁺ 的 20–30 keV 浅结推到 0.3–0.4 µm**；p-LDD 的结深不是注入射程',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 950, max: 1100 }],
      },
      {
        note_zh:
          '⑤ 检验：结深/SIMS 可测 ±10 %；侧墙 45 nm 仍低于显微镜 4.8 µm 物镜，宽度是开环声明。n/p 两道 LDD 的套刻未做',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '栅电极片 1（12.8 g）+ BF₃ 1 mg + 胶 1 g + O₂ 0.2 kg + N₂ 0.2 kg + 水 1 kg → p-LDD 片 1。B⁺ 1e13–1e14×78.5 = 7.85e14–7.85e15 个 B，质量 14–141 ng；BF₃ 1 mg 中 B 0.131 mg，其余 F/过量源气。侧墙氧化吃掉 Si 约 20 nm/边；产物按片计（12.8 g + ng B + 45 nm SiO₂）',
  },

  {
    /**
     * **dual LDD：n-LDD（PSG）→ 推进 → 去 PSG → p-LDD（BF₃）→ 去胶 → 45 nm 侧墙。**
     *
     *   `mat/gate-electrode-wafer` 1 + PSG（`mat/silica`）50 g
     *   + BF₃ 1 mg + 胶 2 g + 0.5–0.7 µm 版 2 块
     *   + O₂/N₂ 各 0.2 kg + HF 20 g + 水 1 kg
     *     → `mat/ldd-wafer` 1（lddType = both）
     *
     * 这不是“同版”：两块版分别开 n/p 窗，套刻各 ±0.25 µm；两次误差叠加后
     * n/p 窗口可能重叠（p 注入补偿 n-LDD）或留缝（边界没有 LDD）。
     * **本层没有 overlay 实测**，所以只证明“两种 LDD 能先后做”，
     * 不证明 n/p 窗口合格；这是 B 类降级，不是 qualified CMOS。
     *
     * p 注入前 PSG 已去掉：挡住 p 注入的是 p 窗口的光刻胶，不是 PSG。
     * 如果两块版重叠，p 会进 n-LDD 窗口，补偿 n-LDD。
     */
    id: 'make/dual-ldd-spacer',
    name: 'LDD 侧墙片制造',
    produces: [
      {
        item: 'mat/ldd-wafer',
        qty: q(1),
        gives: [
          { param: 'junctionDepth', kind: 'range', min: 300, max: 400 },
          { param: 'spacerWidth', kind: 'range', min: 40, max: 55 },
          { param: 'spacerMaterial', kind: 'enum', oneOf: ['silicon-dioxide'] },
          { param: 'lddType', kind: 'enum', oneOf: ['both'] },
          { param: 'waferId', kind: 'range', min: 0, max: 1000 },
          { param: 'overlayMarks', kind: 'enum', oneOf: ['present'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/gate-electrode-wafer', qty: q(1) }] },
      // PSG：n-LDD 的磷源；50 g 覆盖 4 次涂布/返工
      { anyOf: [{ item: 'mat/silica', qty: q(1, 20) }] },
      // BF₃ 1 mg：p-LDD 的 B⁺ 源，剂量 1e13–1e14
      { anyOf: [{ item: 'mat/boron-trifluoride', qty: q(1, 1000000) }] },
      // 两次光刻各 1 g 胶
      { anyOf: [{ item: 'mat/photoresist', qty: q(2) }] },
      // 两块版：n 窗 + p 窗，各 0.5–0.7 µm；版上同时带 box-in-box vernier
      {
        anyOf: [
          {
            item: 'std/photomask-general',
            qty: q(2),
            need: [{ param: 'minFeature', kind: 'range', min: 0.5, max: 0.7 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      // 侧墙干氧 45 nm
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 5) }] },
      // 去 PSG：20 nm 在 49 % HF 里 2 s
      { anyOf: [{ item: 'mat/hf', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'std/overlay-vernier-general'],
    rate: { hours: q(20) },
    steps: [
      {
        note_zh:
          '① n-LDD 开窗：PSG 涂布 + 光刻（第一块版，n 窗）；套刻 ±0.25 µm。LDD 边界离栅 0 ±250 nm，侧墙还没长，不给 LDD 偏移',
        performedBy: 'plant/mask-aligner',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② n-LDD 推进：1000 °C，名义 20 nm 只要 14.4 s，坡上就 105 nm；等温 0–2 min 后 120–150 nm。结深仍被后续侧墙氧化推到 0.3–0.4 µm',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 950, max: 1100 }],
      },
      {
        note_zh:
          '③ 去 PSG：20 nm 在 49 % HF 里 2 s；多停 5 s 会吃源漏上的牺牲氧化层。**PSG 去掉后，p 注入靠光刻胶挡，不靠 PSG**',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '④ p-LDD 开窗：涂胶 + 第二块版（p 窗）曝光/显影；套刻 ±0.25 µm。两次套刻误差叠加，n/p 窗口可能重叠或留缝；没有 overlay 实测',
        performedBy: 'plant/mask-aligner',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑤ p-LDD 注入：B⁺ 20–30 keV、1e13–1e14 cm⁻²、7°；BF₃ 源气。若两块版重叠，B⁺ 会进 n-LDD 窗口，补偿 n-LDD',
        performedBy: 'plant/ion-implanter',
        under: [
          { param: 'energy', min: 20, max: 30 },
          { param: 'pressure', min: 1e-4, max: 1e-3 },
        ],
      },
      {
        note_zh:
          '⑥ 去胶：70–90 °C 热水 + 刷；不能 HF。B⁺ 尚未激活，n-LDD 已推进',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 70, max: 90 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '⑦ 侧墙干氧 1000 °C，45 nm SiO₂（≈48 min）：x²+Ax=Bt。**这一步同时把 p-LDD 的 20–30 keV 浅结推到 0.3–0.4 µm**；n-LDD 也被同一笔热预算再推一次',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 950, max: 1100 }],
      },
      {
        note_zh:
          '⑧ 检验：结深/SIMS 可测 ±10 %；侧墙 45 nm 仍低于显微镜物镜；**overlay 没有量具**，n/p 窗口重叠/留缝只能开环声明',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '栅电极片 1（12.8 g）+ PSG 50 g + BF₃ 1 mg + 胶 2 g + O₂ 0.2 kg + N₂ 0.2 kg + HF 20 g + 水 1 kg → dual-LDD 片 1。n-LDD 磷来自 PSG，p-LDD 硼来自 BF₃；两者剂量 ng–µg 级。侧墙吃掉 Si 约 20 nm/边；两次光刻的套刻误差没有实测，n/p 窗口重叠/留缝是 B 类缺口',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // eSiGe 应变源漏：把"缺口条目"补成有产出路线的 B 类工艺
  //
  // ⑦ 原来写"没有路线，只有条目"—— 那是"缺设备"的旧账：全表没有外延炉。
  // 现在 `plant/lpcvd-furnace` 已经能跑 SiGe 外延（`make/sige-epi-wafer`：
  // 700–750 °C / 13–40 Pa，SiHCl₃ + GeCl₄ + H₂），同一台炉子加一层
  // **选择性**的约束就是 eSiGe 源漏。所以补两条：
  //
  //   make/strain-sd-wafer          LDD 片（栅 + 侧墙当掩模）→ 应变源漏片
  //   make/silicide-tisi2-c49-sige  应变源漏片 → 硅化物片（SiGe 上 TiSi₂）
  //
  // 代价照实写：选择比（对 SiO₂/Si₃N₄ 的成核抑制）没有实测，Ge 偏析让
  // TiSi₂ 片阻比纯硅高 1.5–2 倍。0.8–1.2 % 应变是**设计值**，判据 0.8 %。
  // ═════════════════════════════════════════════════════════════════════════

  {
    /**
     * **应变源漏片：p 型 LDD 片 → S/D 凹槽刻蚀 → 选择性 SiGe 外延 → 应变源漏片。**
     *
     *   `mat/ldd-wafer` 1 片（lddType = p 或 both）+ 三氯氢硅 0.1 + 锗 0.001
     *   + 氯 0.01 + 氢 0.1 + 水 1 → `mat/strain-sd-wafer` 1 片
     *
     * ── 为什么是"选择性"而不是整面外延 ────────────────────────────────────
     *
     *   栅与 40–55 nm 侧墙已经在 LDD 片上：它们是**自对准的掩模**，SiGe 只长在
     *   露出来的源漏窗口里（凹槽 20–30 nm），不长在 SiO₂/Si₃N₄ 上。
     *   几何与 `make/sige-epi-wafer` 同一套（SiHCl₃ + GeCl₄ + H₂、700–750 °C /
     *   13–40 Pa、Ge 18–22 %），只多一步 S/D 凹槽刻蚀（RIE，C4F6/O₂）。
     *
     * ── 应变从哪来 ──────────────────────────────────────────────────────
     *
     *   Si₀.₈Ge₀.₂ 的晶格比 Si 大 0.8 %；外延层被下面的 Si 压住 ⇒ 面内压应变，
     *   对面内沟道是**张应变**（eSiGe 的用法）。0.8–1.2 % 是设计值，
     *   判据 0.8 %；迁移率增益 1.3–1.5× 是文献值，本层没有霍尔/应变实测。
     *
     * ── B 类（工艺未验证）────────────────────────────────────────────────
     *
     *   · LPCVD 是热壁管，不是 UHV-RPCVD：选择比靠 HCl/氯自限制，**没有实测**；
     *     若整面成核，Ge 会落在侧墙/场氧上，后续硅化会短路 —— 工艺不成立时
     *     本条退回"整面 SiGe + 光刻开窗"，多两块版。
     *   · Ge 偏析：600 °C 以上 Ge 向表面扩散，TiSi₂ 的片阻升高（见下一条）。
     *   · 本层没有应变/Ge 组分实测（Raman/XRD 都没有），0.8–1.2 % 是设计值。
     */
    id: 'make/strain-sd-wafer',
    name: '应变硅源漏片制造',
    produces: [
      {
        item: 'mat/strain-sd-wafer',
        qty: q(1),
        gives: [{ param: 'strain', kind: 'range', min: 0.8, max: 1.2 }],
      },
    ],
    uses: [
      {
        // eSiGe 是 PMOS 的源漏工艺：片上必须有 p 型 LDD 窗。
        // 取 p（`make/p-ldd-spacer-oxide` 的单窗口）；dual-LDD 的 both 也含
        // p 窗，但它是另一个窗口，这里不写成 OR —— 窗口判定只认单条路线。
        anyOf: [
          {
            item: 'mat/ldd-wafer',
            qty: q(1),
            need: [{ param: 'lddType', kind: 'enum', oneOf: ['p'] }],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/trichlorosilane-pure', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/germanium', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/c4f6', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① S/D 凹槽刻蚀：RIE，C4F6/O₂/Ar、20–60 °C / 1–10 Pa，凹槽 20–30 nm；栅/侧墙是自对准掩模。**没有终点**，靠定时 ±10–15 %',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 1, max: 10 },
        ],
      },
      {
        note_zh:
          '② 选择性 SiGe 外延：LPCVD 700–750 °C / 13–40 Pa，SiHCl₃ + GeCl₄（Ge 由 `mat/germanium` + `mat/chlorine` 就地生成）+ H₂；Ge 18–22 %、层厚 50–80 nm。只长在硅窗口，不长在氧化物/氮化物上（选择比未实测）',
        performedBy: 'plant/lpcvd-furnace',
        under: [
          { param: 'temperature', min: 700, max: 750 },
          { param: 'pressure', min: 13, max: 40 },
        ],
      },
      {
        note_zh:
          '③ 检验：台阶仪/椭偏看厚度；应变与 Ge 组分没有量具（Raman/XRD 全表 0 台）⇒ 0.8–1.2 % 是设计值，不写"已测"',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'LDD 片 1（12.8 g）+ 三氯氢硅 0.1 + 锗 0.001 + 氯 0.01 + 氢 0.1 + C4F6/O2 各 0.001 + 水 1 → 应变源漏片 1。外延层 50–80 nm × 78.5 cm² × 4.5 g/cm³ ≈ **18–28 mg**（含 Ge 18–22 % ⇒ Ge 3–6 mg）；锗源 1 mg 是 1 片的配比（0.001 kg）。凹槽刻掉 Si 约 20–30 nm × 源漏面积 ≈ 10–15 mg。产物按片计；差额是刻蚀/外延尾气与水，不是账不平。0.8–1.2 % 应变是设计值',
  },

  {
    /**
     * **SiGe 上 TiSi₂：应变源漏片 → 溅射 Ti → 600–650 °C 硅化 → HF 去未反应 Ti。**
     *
     *   `mat/strain-sd-wafer` 1 + Ti 1 g + Ar 20 g + N₂ 20 g + HF 10 g + 水 1 kg
     *     → `mat/silicide-wafer` 1 片
     *
     * 与 `make/silicide-tisi2-c49` 同一套工艺（Ti 20 nm → 600–650 °C / 30 min
     * → 49 % HF 去未反应 Ti），差别只在起始片是 SiGe：
     *
     *   · Ge 在 600 °C 以上向表面偏析，TiSi₂/SiGe 界面能垒比 TiSi₂/Si 高；
     *     **片阻从 12–20 升到 20–40 Ω/□（设计值）**，比接触电阻也变差；
     *   · 仍是 C49（C54 要 700–800 °C 秒级，本层炉子没有秒级刻度）；
     *   · 横向生长 0.05 µm ≈ 侧墙宽，不会爬过侧墙。
     *
     * 这条把 `mat/strain-sd-wafer` 接回主管线：硅化物片 → `make/rtp-silicide-c54`
     * → `mat/c54-silicide-wafer` → `make/device-wafer`。**不是新分支的终点。**
     */
    id: 'make/silicide-tisi2-c49-sige',
    name: '自对准硅化物片制造',
    produces: [
      {
        item: 'mat/silicide-wafer',
        qty: q(1),
        gives: [
          // p⁺ 那一侧本来就宽：TiSi₂ 上 n/p 差 4 倍，SiGe 再抬 1.5–2 倍
          { param: 'contactResistivity', kind: 'range', min: 10, max: 60 },
          { param: 'silicidePhase', kind: 'enum', oneOf: ['c49'] },
          { param: 'sheetResistance', kind: 'range', min: 20, max: 40 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/strain-sd-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/titanium', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh: '① 溅射 Ti 20 nm（0.1–10 Pa 氩，`plant/euv-coater` 换 Ti 靶）；Ti : SiGe 的硅化物厚度比纯硅低 10–15 %（Ge 占位）',
        performedBy: 'plant/euv-coater',
        under: [{ param: 'pressure', min: 0.1, max: 10 }],
      },
      {
        note_zh: '② 硅化 600–650 °C / 30 min（N₂）：Ti + SiGe → TiSi₂（C49）。Ge 向表面偏析，界面粗糙度上升 ⇒ 片阻 20–40 Ω/□（纯硅 12–20）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 600, max: 650 }],
      },
      {
        note_zh: '③ 选择性去未反应 Ti（49 % HF，20–30 °C）；HF 对 SiGe 的腐蚀比 Si 快 2–3 倍，过刻会吃掉 5–10 nm 硅化物 —— 只能定时 + 看疏水性',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: '④ 检验：四探针读 20–40 Ω/□；比接触电阻仍测不了（TLM 要变温台）。这一格的 20–40 是设计值，不是实测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '应变源漏片 1（12.8 g + 18–28 mg SiGe）+ Ti 1 g + Ar 20 g + N₂ 20 g + HF 10 g + 水 1 kg → 硅化物片 1。Ti 膜 20 nm × 78.5 cm² × 4.5 g/cm³ = 7.1 mg；成 TiSi₂ 约 42–45 nm（SiGe 比纯硅薄 10–15 %）× 78.5 cm² × 4.0 g/cm³ ≈ 13–14 mg。Ti 源 1 g 的其余在靶/挡板；HF 10 g 去未反应 Ti；Ar/N₂ 是溅射/退火气。产物按片计；片阻 20–40 Ω/□ 是设计值',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...GATE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...GATE_ROUTES];
