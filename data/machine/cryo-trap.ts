/**
 * 80 K 冷阱：把出口水从干冰冷阱的 **0.5–1.9 ppm** 压到 **0.005–0.01 ppm**。
 *
 * 本文件放仪器、零件与 `make/*` 路线（R13）；测量路线与记录在
 * `data/measure/cryo-trap.ts`。冷源复用 `plant/gm-cryocooler` 的**一级**
 * （45–80 K、40–60 W），不新建制冷机、不耗干冰、不再要氦。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、缺口：干冰冷阱的地板是 0.5–1.9 ppm，不是 0.69
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `plant/dry-ice-trap`（`data/machine/cryo.ts`）的交货窗口 0.5–1.9 ppm：
 *
 *     −78.5 °C 的冰面饱和蒸气压 **0.070 Pa** = 0.69 ppm（平衡值）
 *     实际出口 0.5–1.9 ppm —— 比平衡值高 3–8 倍（气体没全冷到 −78.5、
 *     霜面温度高于浴温、边界层旁路）
 *
 *   所以干冰阱有两道墙，**第二道比第一道更硬**：
 *     ① 平衡墙：0.69 ppm —— 再怎么加大面积也下不去（面积只解决传质）；
 *     ② 接近墙：0.5–1.9 ppm —— 实际气体与冷面的接近程度。
 *
 *   0.01 ppm 以下只能换冷面。80 K 的水面平衡是 **1.8×10⁻²¹ Pa**（§二），
 *   比 0.01 ppm 对应的 1.0×10⁻³ Pa 低 **5×10¹⁷ 倍** —— 平衡墙消失，
 *   剩下的是传质、系统出气与**露点仪的读出地板**（§四、§七）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、80 K 的水饱和蒸气压：1.8×10⁻²¹ Pa（Clausius–Clapeyron 核过）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   冰的升华焓 ΔH_sub = 51 kJ/mol；以 273.15 K（0 °C，p = 611.66 Pa）为锚
 *   （**不是** −78.5 °C：−78.5 °C / 1 atm 是 CO₂ 的升华点，水的冰面在那只有 0.070 Pa）：
 *
 *     ln(p₂/p₁) = −(ΔH/R)(1/T₂ − 1/T₁)
 *               = −(51 000/8.314)(1/80 − 1/273.15)
 *               = −6 135 × (0.01250 − 0.003661)
 *               = −6 135 × 0.008839 = **−54.23**
 *     p₂ = 611.66 × e^(−54.23) = **1.8×10⁻²¹ Pa**
 *
 *   换成 1 atm 下的体积分数：1.8×10⁻²¹ / 1.01×10⁵ = **1.8×10⁻²⁶ = 1.8×10⁻²⁰ ppm**。
 *   与干冰的 0.69 ppm 差 **3.8×10¹⁹ 倍**。
 *
 *   ⚠️ 这个数**不是**交付窗口，是冷面的平衡。出口能到多少由传质与量具定
 *   （§四、§七）。把 1.8e-20 ppm 写成记录也是错的：量具读不到。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、为什么干冰到不了、80 K 能到（一句话 + 三条数）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   一句话：**干冰的墙是平衡（0.69 ppm），80 K 的墙是量具（0.005 ppm）。**
 *
 *   ① 平衡：干冰 0.070 Pa vs 80 K 1.8×10⁻²¹ Pa（差 3.8×10¹⁹）。
 *   ② 冷量：干冰 8–15 W @−78 °C、4–12 h 换一次；GM 一级 40–60 W @80 K、
 *      连续（只吃 4–6 kW 电）。80 K 的冷量多 3–7 倍，且不用装填。
 *   ③ 温度稳定性：干冰浴随霜层厚与开盖漂 0.5–1 K；GM 一级 0.2–0.5 K。
 *      dew point 对温度的斜率在 −78 °C 附近是 **0.3–0.5 ppm/K**，0.5 K 的
 *      漂移就是 0.15–0.25 ppm 的读数 —— 比 0.01 ppm 的目标大 15–25 倍，
 *      所以干冰的**读数重复性**也输。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、面积与传质：100 mL/min、1000 ppm 入口要多大的冷面
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   一级近似（冷面吸收是一阶过程，C_out/C_in = e^(−k_c·A/Q)）：
 *
 *     Q = 100 mL/min = **1.67×10⁻⁶ m³/s**
 *     D(H₂O–N₂, 300 K) = 2.5×10⁻⁵ m²/s；管径 d = 0.06 m；层流 Sh = 3.66
 *     k_c = Sh·D/d = 3.66 × 2.5×10⁻⁵ / 0.06 = **1.5×10⁻³ m/s**
 *     A = ln(C_in/C_out) × Q / k_c
 *
 *   入口 → 出口 0.01 ppm 所需的冷面：
 *
 *     入口 1 ppm     ln(100)   = 4.61 ⇒ A = 4.61 × 1.67e-6 / 1.5e-3 = 0.0051 m² = **51 cm²**
 *     入口 100 ppm   ln(10⁴)   = 9.21 ⇒ A = 0.0103 m² = **103 cm²**
 *     入口 1000 ppm  ln(10⁵)   = 11.51 ⇒ A = 0.0128 m² = **128 cm²**
 *     入口 0.7 ppm（干冰出口）ln(70) = 4.25 ⇒ A = 0.0047 m² = **47 cm²**
 *
 *   本文件的设计冷面 **0.05 m²（500 cm²）= 冷指 0.02–0.03 + 挡板 0.02–0.03**：
 *     对 1000 ppm 的扰动工况还有 **3.9 倍**余量；对正常入口（0.7 ppm）
 *     余 11 倍。**面积不是为了正常工况，是为了 1000 ppm 的旁路/再生后浪涌。**
 *
 *   停留时间：阱体 0.4–0.8 L @100 mL/min = 4–8 min（不是秒级）；
 *   传质的限制是 k_c·A，不是停留时间 —— 这一点与干冰阱的注释（2–4 s）
 *   不同，别把两个数混着用。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、再生周期：12–24 h 是霜层厚度定的，不是饱和定的
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   设计入口取 **1000 ppm 水**（干冰后 0.05 ppm 的正常工况不会积霜，见下）：
 *
 *     水流量 = 0.1 L/min × 10⁻³ = 1.0×10⁻⁴ L/min 的水汽
 *            = 4.46×10⁻⁶ mol/min = 8.0×10⁻⁵ g/min = **6.9 g/天**
 *     0.05 m² 上 0.1 mm 霜（密度 900 kg/m³）= 4.5 g
 *     ⇒ 4.5 / 6.9 = **0.65 天 ≈ 15.7 h**
 *
 *   1000 ppm 时 16 h、500 ppm 时 31 h、2000 ppm 时 8 h —— 所以再生周期
 *   写 **12–24 h** 对应入口 **700–1400 ppm**。正常工况（干冰后 0.05 ppm）
 *   的霜量是 0.35 mg/天，理论上几个月不用再生；**12–24 h 的排程是为
 *   扰动工况与冷头换热余量留的**，不是饱和极限。
 *
 *   再生：加热器 100–200 W 把 3 kg 铜从 80 提到 100 K
 *   （3×0.385×20 = 23 kJ）+ 4.5 g 霜升华（4.5e-3×2.83e6 = 12.7 kJ）
 *   = 36 kJ ⇒ 150 W 下 **4 min**；加抽空/吹扫 30–60 min，全周期 **1 h**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、热账：GM 一级够不够
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   GM 一级 40–60 W @80 K。本阱的负载：
 *     辐射（300 K 腔壁 → 80 K，ε 0.05，0.1 m²）= σT⁴·ε·A = 5.67e-8×8.1e9×0.05×0.1
 *       = **2.3 W**
 *     铜冷指漏热（20–40 W/K 是**冷量传输能力**，不是负载；
 *       沿冷指漏进来 0.5–2 W）
 *     气体显热：0.1 L/min 从 20 °C 冷到 80 K
 *       = 1.2×10⁻⁴ kg/min = 2×10⁻⁶ kg/s × 1.0 kJ/kgK × 220 K = **0.44 W**
 *     霜的凝结热：6.9 g/天 × 2.83 MJ/kg = 0.23 W
 *     ⇒ 总负载 **3–6 W**，一级 40–60 W 余 7–15 倍。
 *   降温：3 kg 铜 + 0.5 kg 不锈钢从 300 到 80 K，平均 cp 0.385：
 *     3.5 × 0.385 × 220 = 296 kJ；40 W 下 **2.1 h**、60 W 下 **1.4 h**。
 *     所以冷阱从室温到 80 K 要 **1.5–2 h**，与 `measure/cryo-capacity` 的
 *     整机 3–6 h 不矛盾（那一份含 20 K 二级）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 七、交付与量具地板：为什么记录写 0.005–0.01，不写 1.8e-20
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   阱本身（冷面 80 K、0.05 m²）能把水压到 **<10⁻⁶ ppm**，但
 *   `plant/dew-point-meter` 的地板是 **0.05 ppm**（P₂O₅ 电解池，
 *   `data/machine/oxygen-metrology.ts` 的 `detectionLimit`）—— 直接读 0.005–0.01
 *   是**读不到的**。所以本机的测量链是「冷面凝水 + 100× 富集 + 仪表读 0.5–1 ppm」：
 *
 *     ① 10 L 样气过 80 K 阱（100 mL/min × 100 min），水全凝在冷面上
 *     ② 升温到 100 K，解吸进 0.1 L 定容环（`.../desorption-loop`）
 *        富集 = 10 L / 0.1 L = **100×** ⇒ 环里 0.5–1 ppm
 *     ③ 露点仪读 0.5–1 ppm（地板 0.05 ppm 的 10–20 倍）
 *     ④ 折算回原气：0.5–1 ppm / 100 = **0.005–0.01 ppm**
 *        等效地板：0.05 ppm / 100 = **0.0005 ppm**
 *
 *   所以「记录写 0.005–0.01」不是冷面的极限（冷面是 1.8×10⁻²⁰ ppm），是
 *   **仪表地板 ÷ 富集比**。再往下要（a）更大的样气量（100 L → 1000×，但要 17 h）
 *   或（b）更低地板的仪表（本层没有，见 §八①）。
 *
 *   环里 1 ppm 的露点约 −76 °C（在仪表 −95…20 °C 量程内）；记录里的
 *   −105…−101 °C 是**折算回原气**的值（0.005 ppm ↔ −105 °C、0.01 ppm ↔ −101 °C），
 *   不是仪表直接读的 —— 这一点必须写清，否则会被读成「仪表能读 −80 °C」。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 八、缺口（按 R7 记量级）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **仪表地板 0.05 ppm**：靠 100× 富集才到 0.005–0.01；要直接读 0.01 ppm
 *      要一台低地板表（0.001–0.005 ppm 档，本层没有）。等效地板 0.0005 ppm
 *      是「100× 富集」换来的，不是表变好了。
 *   ② **取样板出气 0.002–0.01 ppm**：PTFE 在 0.01 ppm 档是污染源（与
 *      trace-analysis 缺口⑪ 同源）；全金属板要 PFA/金属垫（缺）。富集时
 *      这部分也被浓缩 100×，所以富集只对「样气里的水」有效，对「管路出气」
 *      是放大 —— 定容环与阀必须全金属、烘烤。
 *   ③ **单阱不能连续**：再生 1 h 离线，12–24 h 一个周期 ⇒ 要连续采样
 *      必须**双阱切换**（第二台 `plant/cryo-trap-80k` + 切换阀）。本文件
 *      只建一台；双阱的阀与程序是下一件。
 *   ④ **GM 一级 40–60 W 是与 20 K 二级共用的**：二级 1.5–4 W @20 K 的
 *      负载不变，但一级多 3–6 W 的阱负载会抬一级温度 1–2 K（80 → 81–82 K），
 *      对水无所谓，对 CO₂ 也够；对 20 K 二级的预冷只差 1–2 %。
 *   ⑤ **80 K 面上的 CO₂/N₂O 也凝**：CO₂ 在 80 K 的 p_sat <10⁻¹⁰ Pa，会与
 *      水一起积霜；再生温度 100 K 能把 CO₂ 升华（−78.5 °C = 1 atm），
 *      所以再生必须到 **100 K**，不能只到 90 K —— 这是 80–100 K 这一格的由来。
 *   ⑥ **富集的空白**：10 L 样气的富集把管路出气也浓缩 100×；空白 = 0.005 ppm
 *      等效（10 L 的 0.0005 ppm 级空白），与目标同量级 —— 所以记录的下端
 *      0.005 ppm 实际上就是**空白**，不是「测到的水」。
 *   ⑦ **没有原位水分析**：出口水靠离线富集 + 露点仪，5 h 一次；在线 0.01 ppm
 *      的腔体水分析（RGA 或光腔）本层没有（与 ald.ts 缺口⑦同源）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目
// ═══════════════════════════════════════════════════════════════════════════

export const CRYO_TRAP_ITEMS: readonly Item[] = [
  /**
   * **铜冷指：φ20 铜棒 + 12 片径向铜翅，钎焊到 GM 一级的冷台上。**
   *
   *   area        0.02–0.06 m²（翅片 + 棒面）
   *   conductance 20–50 W/K（3–6 W 的负载下 ΔT 0.1–0.3 K）
   *
   * 为什么是铜：λ(80 K) = 400–600 W/mK，是不锈钢的 20 倍；铝在 80 K 也够
   * （λ 200–300）但钎焊到不锈钢法兰上要镍层，铜直接银钎。
   * 翅片间距 4–6 mm：太小被霜堵（0.1 mm 霜在 2 mm 间距上就堵 10 %），
   * 太大面积不够（§四的 0.05 m² 要 12 片 φ60 的翅）。
   */
  {
    id: 'plant/cryo-trap-80k/cold-finger',
    name: '80 K 冷阱铜冷指',
    unit: '件',
    category: 'part',
    props: [
      { param: 'area', kind: 'range', min: 0.02, max: 0.06, unit: 'm²' },
      { param: 'conductance', kind: 'range', min: 20, max: 50, unit: 'W/K', dir: 'atLeast' },
    ],
  },

  /**
   * **80 K 挡板：铜板百叶，挡住样品气的直射路径，只让分子经冷面反射。**
   *
   *   area     0.02–0.06 m²（与冷指合计 0.05 m²）
   *   blocking 90–99 %（直射光学/分子束的遮挡率）
   *
   * 挡板的作用不是「多一块冷面」，是**强迫气体与冷面碰撞**：没有挡板时，
   * 0.1 L/min 的层流会从冷指旁边直穿过去，有效 k_c 掉 5–10 倍（§四的
   * 面积就要乘 5–10）。百叶开孔率 30–40 %，压降 <50 Pa（0.1 L/min 下），
   * 不改变取样流量。
   */
  {
    id: 'plant/cryo-trap-80k/baffle',
    name: '80 K 挡板',
    unit: '件',
    category: 'part',
    props: [
      { param: 'area', kind: 'range', min: 0.02, max: 0.06, unit: 'm²' },
      { param: 'blocking', kind: 'range', min: 90, max: 99, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * **再生加热器：镍铬丝 + 氧化铝骨架 + 316L 护套，100–200 W。**
   *
   *   power         100–200 W（§五：36 kJ / 4 min = 150 W）
   *   maxTemperature 100–150 K（到 100 K 才能把 CO₂ 升华，见 §八⑤）
   *   responseTime   5–20 min（从 80 到 100 K；铜 3 kg 的热容决定）
   *
   * ⚠️ 它**不装在冷指上**，装在冷指根部与法兰之间：装翅片上会把霜局部
   * 先化，水再凝到别处（「烤干一处、潮一处」）。温度用 T 型热电偶读
   * （`std/thermocouple-t-general`，−200…350 °C）。
   */
  {
    id: 'plant/cryo-trap-80k/regen-heater',
    name: '80 K 冷阱再生加热器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 100, max: 200, unit: 'W' },
      { param: 'maxTemperature', kind: 'range', min: 100, max: 150, unit: 'K', dir: 'atLeast' },
      { param: 'responseTime', kind: 'range', min: 5, max: 20, unit: 'min', dir: 'atMost' },
    ],
  },

  /**
   * **切换阀：316L 阀体 + PTFE 阀座 + 自整角机驱动，2–5 s 切换。**
   *
   *   switchTime 2–5 s（切换时样品气走旁路，不中断下游）
   *   leakRate   2×10⁻⁶–5×10⁻⁶ Pa·L/s（对 0.1 L/min 的 0.001–0.003 ppm，§七）
   *
   * 两个位置：阱在线 / 阱再生（旁路）。再生时阀把阱隔离，加热到 100 K，
   * 抽走释出的水与 CO₂，再冷回 80 K 才切回 —— **再生期间不能有气流过阱**，
   * 否则水直接进下游。
   */
  {
    id: 'plant/cryo-trap-80k/valve',
    name: '80 K 冷阱切换阀',
    unit: '件',
    category: 'part',
    props: [
      { param: 'switchTime', kind: 'range', min: 1, max: 10, unit: 's', dir: 'atMost' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-5, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /**
   * **预浓缩定容环：0.05–0.2 L 的 316L 环 + 两端阀，把 10 L 样气里的水浓缩 100×。**
   *
   *   volume   0.05–0.2 L（本文件 0.1 L）
   *   leakRate 2×10⁻⁵–5×10⁻⁵ Pa·L/s
   *
   * 为什么要有它：`plant/dew-point-meter` 的地板是 **0.05 ppm**（P₂O₅ 电解池，
   * `data/machine/oxygen-metrology.ts` 的 `detectionLimit`），直接读 0.005–0.01 ppm
   * 是**读不到的**。办法是先把水从 10 L 样气里凝到 80 K 面上，再升温到 100 K
   * 解吸进 0.1 L 定容环 —— 富集 **10 L / 0.1 L = 100×**：
   *
   *     原气 0.005–0.01 ppm × 100 = 环里 0.5–1 ppm
   *     仪表地板 0.05 ppm ÷ 100 = **0.0005 ppm**（等效）
   *     ⇒ 0.005–0.01 ppm 在等效地板之上 **10–20 倍**
   *
   * 这是「80 K 阱能把记录写到 0.005–0.01」的真正原因：冷面给富集的原料，
   * 定容环给 100× 的杠杆，仪表只读 0.5–1 ppm 这一档。
   */
  {
    id: 'plant/cryo-trap-80k/desorption-loop',
    name: '80 K 冷阱预浓缩定容环',
    unit: '件',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 0.05, max: 0.2, unit: 'L' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-4, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /**
   * **80 K 冷阱整机。holds 70–80 K；出口水 0.005–0.01 ppm、捕集效率 >99 %、
   * 再生周期 12–24 h。**
   *
   *   面温        70–80 K（接 GM 一级；一级 45–80 K，取 70–80 这一段）
   *   出口水      0.001–0.02 ppm（本机设计 0.005–0.01，量具地板见 §七）
   *   露点        −115…−95 °C（0.01 ppm ↔ −101 °C、0.005 ppm ↔ −105 °C）
   *   捕集效率    99–99.9 %（1–1000 ppm 入口、100 mL/min）
   *   再生周期    12–24 h（1000 ppm 入口；0.7 ppm 入口时霜量按比例更低）
   *   冷面        0.05–0.08 m²（挡板 + 冷指，§四的 11–17 倍余量）
   *
   * 它**挂在 `plant/gm-cryocooler` 的一级上**（`needs`）：不新建制冷机、
   * 不耗干冰、不再要氦（GM 的 0.8–1.5 kg 仍是一次性装填，见 cryo.ts §二）。
   * 它还带一只 **0.1 L 定容环**（`.../desorption-loop`）：出口水 0.005–0.01 ppm
   * 靠「10 L 样气 → 0.1 L 环 = 100× 富集」才读得到（§七）。
   */
  {
    id: 'plant/cryo-trap-80k',
    name: '80 K 冷阱整机',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'temperature', min: 70, max: 80 }],
    props: [
      { param: 'faceTemperature', kind: 'range', min: 70, max: 80, unit: 'K' },
      { param: 'measure/water', kind: 'range', min: 0.001, max: 0.02, unit: 'ppm', dir: 'atMost' },
      { param: 'measure/dewPoint', kind: 'range', min: -115, max: -95, unit: '°C' },
      { param: 'captureEfficiency', kind: 'range', min: 99, max: 99.9, unit: '%', dir: 'atLeast' },
      { param: 'regenCycle', kind: 'range', min: 12, max: 24, unit: 'h' },
      { param: 'coldArea', kind: 'range', min: 0.03, max: 0.1, unit: 'm²' },
      { param: 'measure/repeatability', kind: 'range', min: 0, max: 1, unit: 'K', dir: 'atMost' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线
// ═══════════════════════════════════════════════════════════════════════════

export const CRYO_TRAP_ROUTES: readonly Route[] = [
  {
    /**
     * **冷指：铜 2 kg → 1 件（0.03–0.05 m²、25–40 W/K）。**
     *
     * 车铜棒 φ20、铣 12 片径向翅（厚 2 mm、间距 5 mm），银钎到 CF63 法兰。
     */
    id: 'make/cryo-trap-cold-finger',
    name: '80 K 冷阱铜冷指制造',
    produces: [
      {
        item: 'plant/cryo-trap-80k/cold-finger',
        qty: q(1),
        gives: [
          { param: 'area', kind: 'range', min: 0.02, max: 0.04 },
          { param: 'conductance', kind: 'range', min: 25, max: 40 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(2) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车铜棒 φ20 与 12 片翅（厚 2 mm、间距 5 mm；翅根圆角 R1 减少应力）', performedBy: 'lathe' },
      { note_zh: '银钎到 CF63 法兰：钎缝 0.05–0.1 mm、气密 1e-9 Pa·m³/s；钎后酸洗去氧化', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(30) },
    unbalanced_zh: '铜 2 kg → 冷指 1 件；余是车屑与翅间余料（按件计）',
  },

  {
    /**
     * **挡板：铜 1 + 316L 0.5 → 1 件（0.03–0.05 m²、遮挡 95–99 %）。**
     *
     * 百叶：20 片铜板 45° 叠成，开孔率 30–40 %；外框 316L，压降 <50 Pa。
     */
    id: 'make/cryo-trap-baffle',
    name: '80 K 挡板制造',
    produces: [
      {
        item: 'plant/cryo-trap-80k/baffle',
        qty: q(1),
        gives: [
          { param: 'area', kind: 'range', min: 0.025, max: 0.04 },
          { param: 'blocking', kind: 'range', min: 95, max: 99 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '剪 20 片铜板 45° 百叶、点焊到 316L 外框；开孔率 30–40 %', performedBy: 'plant/sheet-shop' },
      { note_zh: '装到冷指根部：与冷指热接触（铟箔 0.1 mm），遮挡 95–99 %（激光准直法）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(20) },
    unbalanced_zh: '铜 1 + 316L 0.5 → 挡板 1 件；余是剪边（按件计）',
  },

  {
    /**
     * **再生加热器：镍铬丝 0.1 + 氧化铝 0.2 + 316L 0.3 → 1 件（120–180 W）。**
     *
     * 镍铬丝绕在氧化铝骨架上、316L 护套管保护；100 K 下 150 W。
     */
    id: 'make/cryo-trap-regen-heater',
    name: '80 K 冷阱再生加热器制造',
    produces: [
      {
        item: 'plant/cryo-trap-80k/regen-heater',
        qty: q(1),
        gives: [
          { param: 'power', kind: 'range', min: 120, max: 180 },
          { param: 'maxTemperature', kind: 'range', min: 120, max: 150 },
          { param: 'responseTime', kind: 'range', min: 8, max: 15 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(3, 10) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '绕镍铬丝到氧化铝骨架（φ8、长 60 mm，匝距 1 mm）', performedBy: 'plant/winder' },
      { note_zh: '装 316L 护套与引线（陶瓷封口），150 W 下 100 K；响应 8–15 min', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(15) },
    unbalanced_zh: '镍铬丝 0.1 + 氧化铝 0.2 + 316L 0.3 → 加热器 1 件（按件计）',
  },

  {
    /**
     * **切换阀：316L 0.5 + PTFE 0.02 + 自整角机 1 → 1 件（2–5 s、漏率 2e-6）。**
     *
     * 两通球阀 + 自整角机驱动；PTFE 阀座在 100 K 下仍软（脆化点 −100 °C 以下）。
     */
    id: 'make/cryo-trap-valve',
    name: '80 K 冷阱切换阀制造',
    produces: [
      {
        item: 'plant/cryo-trap-80k/valve',
        qty: q(1),
        gives: [
          { param: 'switchTime', kind: 'range', min: 2, max: 5 },
          { param: 'leakRate', kind: 'range', min: 2e-6, max: 5e-6 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 50) }] },
      { anyOf: [{ item: 'std/selsyn-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车 316L 阀体与 PTFE 阀座（球面 0.05 mm 配合），装自整角机', performedBy: 'lathe' },
      { note_zh: '检漏：2×10⁻⁶–5×10⁻⁶ Pa·L/s；2–5 s 切换（旁路→阱在线）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(25) },
    unbalanced_zh: '316L 0.5 + PTFE 0.02 + 自整角机 1 → 切换阀 1 件（按件计）',
  },

  {
    /**
     * **预浓缩定容环：316L 0.5 kg → 0.1 L 环 1 件（富集 100× 的杠杆）。**
     *
     * 车 φ60 × 40 mm 的 316L 环 + 两端 CF16 阀座；内壁抛光（Ra ≤0.4 µm，
     * 减少水吸附）；体积用称水法标定（0.1 L ±1 %）。
     */
    id: 'make/cryo-trap-desorption-loop',
    name: '80 K 冷阱预浓缩定容环制造',
    produces: [
      {
        item: 'plant/cryo-trap-80k/desorption-loop',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 0.1, max: 0.1 },
          { param: 'leakRate', kind: 'range', min: 2e-5, max: 5e-5 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 2) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车 316L 环 φ60 × 40 mm（内腔 0.1 L）、内壁抛光 Ra ≤0.4 µm、两端 CF16 阀座', performedBy: 'lathe' },
      { note_zh: '称水法标定体积 0.1 L ±1 %；检漏 2×10⁻⁵–5×10⁻⁵ Pa·L/s', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(12) },
    unbalanced_zh: '316L 0.5 → 0.1 L 定容环 1 件；余是车屑（按件计）',
  },

  {
    /**
     * **80 K 冷阱装配：冷指 + 挡板 + 加热器 + 阀 + 定容环 + 热电偶 2 + 接触器 1 → 1 台。**
     *
     * 四道工序：
     *   ① 冷指钎到 GM 一级冷台（铟箔 0.1 mm，接触热阻 ≤0.5 K/W）
     *   ② 装挡板/加热器/切换阀（旁路管与阱并联）
     *   ③ 冷试：GM 一级到 75–80 K，通 100 mL/min N₂ 30 min，露点 −105…−101 °C
     *   ④ 再生试验：阀切旁路、加热到 100 K 保持 30 min、冷回 80 K；
     *      记录压升与时间（12–24 h 周期）
     *
     * ⚠️ 冷试那一步**不写 `under: 70–80 K`**：本机自己 holds 70–80 K，
     * 写上去会与「造它又要 70–80 K」构成 `condition_cycle`；冷源是
     * `needs` 里的 `plant/gm-cryocooler`（holds 45–80 K），条件写在注释里。
     */
    id: 'make/cryo-trap-80k',
    name: '80 K 冷阱装配',
    produces: [
      {
        item: 'plant/cryo-trap-80k',
        qty: q(1),
        gives: [
          { param: 'faceTemperature', kind: 'range', min: 75, max: 80 },
          { param: 'measure/water', kind: 'range', min: 0.005, max: 0.01 },
          { param: 'measure/dewPoint', kind: 'range', min: -105, max: -101 },
          { param: 'captureEfficiency', kind: 'range', min: 99, max: 99.9 },
          { param: 'regenCycle', kind: 'range', min: 12, max: 24 },
          { param: 'coldArea', kind: 'range', min: 0.05, max: 0.08 },
          { param: 'measure/repeatability', kind: 'range', min: 0.2, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/cryo-trap-80k/cold-finger', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cryo-trap-80k/baffle', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cryo-trap-80k/regen-heater', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cryo-trap-80k/valve', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cryo-trap-80k/desorption-loop', qty: q(1) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
    ],
    needs: ['plant/gm-cryocooler', 'plant/metrology-room', 'plant/clean-room'],
    steps: [
      {
        note_zh: '① 冷指钎到 GM 一级冷台：铟箔 0.1 mm、接触热阻 ≤0.5 K/W；一级 45–80 K 这一段取 70–80 K 用',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '② 装挡板/加热器/切换阀：旁路管与阱并联；阀切换 2–5 s；热电偶 2 支（冷指/出口）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '③ 冷试：一级降到 75–80 K（1.5–2 h），通 N₂ 100 mL/min 30 min；出口露点 −105…−101 °C、水 0.005–0.01 ppm',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '④ 再生试验：阀切旁路、150 W 加热到 100 K 保持 30 min（CO₂ 升华）、冷回 80 K；单周期 1 h，排程 12–24 h',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(80) },
    unbalanced_zh:
      '冷指 1 + 挡板 1 + 加热器 1 + 阀 1 + 定容环 1 + 热电偶 2 + 接触器 1 → 冷阱 1 台（按件计）；冷源是 needs 里的 GM 一级，不重复计冷量。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CRYO_TRAP_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CRYO_TRAP_ROUTES];
