/**
 * 电子级 LPCVD 氮化硅 —— 为本层的 40 nm MOS 钝化补一台炉子、两条气体纯化路线、一条成膜路线。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么必须新造一台，而不是改 `plant/diffusion-furnace`
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `plant/diffusion-furnace` 的 `holds` 是 **900–1200 °C、无 pressure**
 * （data/machine/diffusion.ts:119–129）。LPCVD Si₃N₄ 的窗口是
 * **700–780 °C、100–300 mTorr = 13.3–40 Pa**：
 *
 *   温度  下限 900 比 780 高 **120 °C**、比 700 高 **200 °C**；
 *   压力  它一个压力窗口都没有，气路是 POCl₃ 鼓泡 + O₂/N₂ 的常压气路。
 *
 * 改它的 holds 是撒谎：那台炉子的加热体、炉管、气路都不是为 13–40 Pa 的
 * 腐蚀性 TCS/NH₃ 做的。所以本文件按 R6/R7 的原则**把缺的机器造出来**：
 *
 *   `plant/glass-lathe`      φ110 石英管的拉制/扩口/封接（本层原来没有玻璃车床）
 *   `plant/lpcvd-furnace`    热壁 LPCVD 管式炉，holds 700–780 °C / 13–40 Pa
 *
 * 这两台机器按本仓库的既有写法用 `composedOf` 表达装配，**不写产出路线**：
 * `mixed_production` 禁止 `composedOf` 与产出路线并存（seed.ts:241–247 的
 * 车床复制同一条规矩：装配就是复制）。所谓“整机路线”就是这份零件清单；
 * 每个零件都有自己的 `make/*`。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 交付窗口：哪些是设计值，哪些是量具读数
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   thickness        0.3–1 µm      椭偏可测（1–1000 nm、±0.05 nm）
 *   stoichiometry    Si/N 0.75–0.85  **设计值**：没有 RBS/XPS/NRA；SIMS 的
 *                                   O₂⁺ 正离子下 N⁺(14.003) 与 Si²⁺(14.043)
 *                                   在 R=100 分不开，也没有 N 的 RSF 标样
 *   hydrogenContent  <2 at%        **设计值**：没有 FTIR；惰气熔融只测 O
 *   stress           0.5–1.5 GPa   **设计值**：没有应力仪；干涉仪是量块 Fizeau，
 *                                   不是片弓仪
 *   uniformity       ≤5 %          **设计值**：椭偏 49 点可测厚度均匀性
 *                                   （49 min/片），但炉子的流场/温场没有实测
 *
 * 这些缺口不阻止写路线（R7：缺口按量级记录，不作为终止条件），但**不许**
 * 把设计值写成实测值。本文件在 `gives` 里交设计窗口，在注释里逐条标缺口。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 气体：把 99–99.5% 的氨与无纯度数字的 TCS 提到电子级
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `mat/ammonia` 最好 99–99.5 %（尿素热解副产），主路线是 25–30 % 氨水；
 *   电子级要 99.999 %（H₂O ≤10 ppm）。本文件加一条精馏 + 分子筛/铜屑吸气剂
 *   的 `make/ammonia-electronic`，交 **99.999–99.9999 %、H₂O 1–10 ppm**。
 *
 *   `mat/trichlorosilane-pure` 只有 1000→900 的收率，**没有 purity 数字**。
 *   本文件加一条二次精馏 + 吸附的 `make/trichlorosilane-electronic`，交
 *   **99.9999–99.99999 %、B/P ≤0.1 ppb、金属 ≤1 ppb**（设计值；本层没有
 *   ICP-MS/GC-MS，B/P 的 ppb 级分析仍是缺口）。
 *
 * 纯度的“能到”与“能证”是两件事：`plant/lpcvd-furnace/gas-purifier` 的出口
 * 设计 10–50 ppb，但本层没有 <100 ppm 的气体分析仪（unblock-gas-purifier.ts:144–177
 * 自认判据差 5 个量级），所以纯度是**设计值 + 待测**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 质量账：按片/气体量算，不硬凑 kg
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   φ100 片面积 78.54 cm²；0.3–1 µm Si₃N₄（3.2 g/cm³）= **7.5–25.1 mg/片**；
 *   化学计量 TCS（SiHCl₃）= **7.3–24.3 mg**、NH₃ = **3.7–12.2 mg**。
 *   路线取 TCS/NH₃ 各 1 g，是 40–140 倍过量（配气、吹扫、返工）；
 *   100 sccm NH₃ × 30 min 是 2.28 g，也只是 10² 倍过量，不是 kg 级。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、材料：电子级氨、电子级 TCS、LPCVD 氮化硅片
// ═══════════════════════════════════════════════════════════════════════════

export const SI3N4_LPCVD_ITEMS: readonly Item[] = [
  /**
   * 电子级氨。**99.999–99.9999 %、H₂O 1–10 ppm。**
   *
   * 原料是 `mat/ammonia` 的 99–99.5 % 副产（尿素热解，polyester-monomers.ts:163–176）。
   * 提纯两步：
   *
   *   ① 精馏：NH₃ 沸点 −33.3 °C，水 100 °C；高压精馏把水与重端留在塔底
   *      （`plant/distillation-tower` 40–80 °C / 300–1000 kPa）。
   *   ② 分子筛 4A + 铜屑吸气剂：4A 的出口露点 −90…−100 °C；铜屑在 400 °C
   *      把 O₂ 压到 1e-10 Pa 量级。铜屑只走 NH₃ 路（NH₃ 不与干铜反应），
   *      活化用 `plant/resistance-furnace` 250–300 °C。
   *
   * ⚠️ **纯度的“证”是缺口**：本层没有 <100 ppm 的 NH₃ 分析仪；99.999 % 是
   * 设计值，只能靠“露点 + 铜片穿透”做过程判据（unblock-gas-purifier.ts:144–177）。
   */
  {
    id: 'mat/ammonia-electronic',
    name: 'Electronic-Grade Ammonia', name_zh: '电子级氨',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99.999, max: 99.9999, unit: '%', dir: 'atLeast' },
      { param: 'waterContent', kind: 'range', min: 0, max: 10, unit: 'ppm', dir: 'atMost' },
    ],
  },

  /**
   * 电子级三氯氢硅。**99.9999–99.99999 %、B/P ≤0.1 ppb、金属 ≤1 ppb。**
   *
   * 原料是 `mat/trichlorosilane-pure`（一次精馏，1000→900，polysilicon.ts:136–146）。
   * 二次精馏 + 吸附把 B/P 的氯化物再分一档；SiCl₄ 与硼磷氯化物从塔底走。
   *
   * ⚠️ **B/P 的 ppb 级分析没有**：本层没有 ICP-MS/GC-MS；`plant/sims` 只能
   * 测固体膜里的金属，检出限 0.6–10 ppm，离 ppb 差 2–4 个量级。纯度是设计值。
   */
  {
    id: 'mat/trichlorosilane-electronic',
    name: 'Electronic-Grade Trichlorosilane', name_zh: '电子级三氯氢硅',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99.9999, max: 99.99999, unit: '%', dir: 'atLeast' },
      { param: 'boron', kind: 'range', min: 0, max: 0.1, unit: 'ppb', dir: 'atMost' },
      { param: 'phosphorus', kind: 'range', min: 0, max: 0.1, unit: 'ppb', dir: 'atMost' },
      { param: 'metals', kind: 'range', min: 0, max: 1, unit: 'ppb', dir: 'atMost' },
    ],
  },

  /**
   * LPCVD 氮化硅钝化片。**一片 φ100 的器件片 + 0.3–1 µm Si₃N₄。**
   *
   * 五个规格里，只有 thickness 是椭偏能直接读的；stoichiometry / hydrogenContent /
   * stress / uniformity 都是设计窗口（见文件头）。`mat/silicon-nitride` 的
   * 反应溅射硬掩模（80–120 nm、N/Si 1.1–1.4、H 0.5–2 at%）不是这个条目：
   * 它是 2N 靶、台阶覆盖 20–40 %，不能当 40 nm MOS 的钝化。
   */
  {
    id: 'mat/si3n4-lpcvd',
    name: 'LPCVD Silicon Nitride Passivation Wafer', name_zh: 'LPCVD 氮化硅钝化片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'thickness', kind: 'range', min: 0.3, max: 1, unit: 'µm' },
      { param: 'stoichiometry', kind: 'range', min: 0.75, max: 0.85, unit: 'Si/N' },
      { param: 'hydrogenContent', kind: 'range', min: 0, max: 2, unit: 'at%', dir: 'atMost' },
      // 0.5–1.5 GPa 拉伸：LPCVD Si₃N₄ 的典型量级，**本层没有应力仪，设计值**
      { param: 'stress', kind: 'range', min: 0.5, max: 1.5, unit: 'GPa' },
      { param: 'uniformity', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 二、玻璃车床：φ110 石英管的地基
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * 玻璃车床。**两头顶尖同步回转 + 一排氢氧焰**，专门拉石英管、扩口、封接法兰。
   *
   * `holds` 写 **1900–2200 °C**：这是火焰落在工件上的温度区间，不是床身整体。
   * 床身、卡盘水冷；石英的软化点 1665 °C，拉管工作点 1900–2200 °C。
   *
   * 本层原来没有它（unblock-diffusion-tube.ts:26–29 点名“玻璃车床 + 氢氧焰”
   * 两样都没有）。现在按 R9 的复制逻辑造：床身、主轴箱、尾座、燃烧器、卡盘
   * 各有 `make/*`，加 `std/motor-7.5kw-4p` 与接触器。
   *
   * `composedOf` 就是装配；不写产出路线（`mixed_production`）。
   */
  {
    id: 'plant/glass-lathe',
    name: 'Glass Lathe', name_zh: '玻璃车床',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'temperature', min: 1900, max: 2200 }],
    composedOf: [
      { item: 'plant/glass-lathe/bed', qty: q(1) },
      { item: 'plant/glass-lathe/headstock', qty: q(1) },
      { item: 'plant/glass-lathe/tailstock', qty: q(1) },
      { item: 'plant/glass-lathe/burner', qty: q(1) },
      { item: 'plant/glass-lathe/chuck', qty: q(1) },
      { item: 'std/motor-7.5kw-4p', qty: q(1) },
      { item: 'std/contactor-general', qty: q(1) },
    ],
  },

  /** 玻璃车床床身。HT250 铸铁，浇后时效，铣导轨与顶尖座。 */
  { id: 'plant/glass-lathe/bed', name: 'Glass Lathe Bed', name_zh: '玻璃车床床身', unit: '件', category: 'part' },

  /** 主轴箱。45 钢主轴 + 铜轴瓦 + 同步带轮；两头顶尖同步回转是它的全部意义。 */
  { id: 'plant/glass-lathe/headstock', name: 'Glass Lathe Headstock', name_zh: '玻璃车床主轴箱', unit: '件', category: 'part' },

  /** 尾座。45 钢套筒 + 手轮 + 锁紧；与主轴箱同轴度 ≤0.05 mm。 */
  { id: 'plant/glass-lathe/tailstock', name: 'Glass Lathe Tailstock', name_zh: '玻璃车床尾座', unit: '件', category: 'part' },

  /** 氢氧焰燃烧器。铜喷嘴 φ6 + 不锈钢混合腔 + 针阀；H₂:O₂ ≈ 2:1。 */
  { id: 'plant/glass-lathe/burner', name: 'Glass Lathe Oxyhydrogen Burner', name_zh: '玻璃车床氢氧焰燃烧器', unit: '件', category: 'part' },

  /** 卡盘。45 钢三爪 + 石墨绳隔热；夹石英管不夹出应力。 */
  { id: 'plant/glass-lathe/chuck', name: 'Glass Lathe Chuck', name_zh: '玻璃车床卡盘', unit: '件', category: 'part' },

  // ═════════════════════════════════════════════════════════════════════════
  // 三、LPCVD 炉：热壁管式炉，700–780 °C / 13–40 Pa
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * 热壁 LPCVD 管式炉。**holds：700–780 °C、13–40 Pa。**
   *
   * 结构：φ110 石英管（长 1200 mm，装 φ100 片 50 片）→ 三温区 SiC 棒加热 →
   * 氧化铝空心球保温 → 水冷不锈钢炉壳 → 耐腐蚀干泵（罗茨 + 爪式）+ 手动节流阀
   * + 电容薄膜规 → 石英舟/装片 → TCS/NH₃ 两路气 + 分子筛/铜屑纯化 →
   * 小 load lock（避免每次破空）。
   *
   * 为什么是 13–40 Pa：100–300 mTorr；LPCVD 的平均自由程要远大于片间距，
   * 否则片间靠扩散、均匀性掉；40 Pa 以上气相成核开始出颗粒。
   *
   * ⚠️ 炉子的 `holds` 是设计窗口；本层没有 13–40 Pa 的绝对压力标准，
   * 电容薄膜规的标定只能靠油柱（见 `make/lpcvd-manometer`），
   * 所以“13–40 Pa ±5 %”是设计值 + 标定路线，不是实测记录。
   */
  {
    id: 'plant/lpcvd-furnace',
    name: 'Hot-Wall LPCVD Tube Furnace', name_zh: '热壁 LPCVD 管式炉',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 700, max: 780 },
      { param: 'pressure', min: 13, max: 40 },
    ],
    props: [
      { param: 'temperatureUniformity', kind: 'range', min: 0, max: 5, unit: '°C', dir: 'atMost' },
      { param: 'pressureAccuracy', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-6, unit: 'Pa·L/s', dir: 'atMost' },
      { param: 'waferCapacity', kind: 'range', min: 50, max: 50, unit: '片', dir: 'atLeast' },
    ],
    composedOf: [
      { item: 'plant/lpcvd-furnace/tube', qty: q(1) },
      { item: 'plant/lpcvd-furnace/heater', qty: q(1) },
      { item: 'plant/lpcvd-furnace/insulation', qty: q(1) },
      { item: 'plant/lpcvd-furnace/shell', qty: q(1) },
      { item: 'plant/lpcvd-furnace/pump', qty: q(1) },
      { item: 'plant/lpcvd-furnace/throttle', qty: q(1) },
      { item: 'plant/lpcvd-furnace/manometer', qty: q(1) },
      { item: 'plant/lpcvd-furnace/load-lock', qty: q(1) },
      { item: 'plant/lpcvd-furnace/gas-panel', qty: q(1) },
      { item: 'plant/lpcvd-furnace/wafer-boat', qty: q(1) },
      { item: 'std/thermocouple-t-general', qty: q(3) },
      { item: 'std/contactor-general', qty: q(2) },
    ],
  },

  /**
   * φ110 × 1200 mm 石英管 + 两端法兰/密封。
   *
   * 内径 110 是 `wafer.ts` 的 φ100 片加 5 mm 边距；1200 mm 是 50 片 × 20 mm
   * 片距 + 两端冷端。壁厚 5 mm 是抗热震与真空外压的折中。
   */
  {
    id: 'plant/lpcvd-furnace/tube',
    name: 'Hot-Wall LPCVD Tube Furnace Process Tube', name_zh: '热壁 LPCVD 管式炉镜筒',
    unit: '件',
    category: 'part',
    props: [
      { param: 'innerDiameter', kind: 'range', min: 110, max: 110, unit: 'mm' },
      { param: 'length', kind: 'range', min: 1200, max: 1200, unit: 'mm' },
      { param: 'wallThickness', kind: 'range', min: 5, max: 5, unit: 'mm' },
    ],
  },

  /** 三温区加热体。SiC 棒三段，每段独立热电偶与调压；±5 °C 靠三段配平。 */
  {
    id: 'plant/lpcvd-furnace/heater',
    name: 'Hot-Wall LPCVD Tube Furnace 3-Zone Heating Element', name_zh: '热壁 LPCVD 管式炉三温区加热体',
    unit: '件',
    category: 'part',
    props: [
      { param: 'zones', kind: 'range', min: 3, max: 3, unit: '区' },
      { param: 'temperatureUniformity', kind: 'range', min: 0, max: 5, unit: '°C', dir: 'atMost' },
      { param: 'power', kind: 'range', min: 10, max: 12, unit: 'kW' },
    ],
  },

  /** 保温层。氧化铝空心球砖 + 耐火纤维；炉壳外壁 ≤60 °C。 */
  { id: 'plant/lpcvd-furnace/insulation', name: 'Hot-Wall LPCVD Tube Furnace Insulation', name_zh: '热壁 LPCVD 管式炉保温层', unit: '件', category: 'part' },

  /** 水冷不锈钢炉壳。承外压、带观察窗与电极引入。 */
  { id: 'plant/lpcvd-furnace/shell', name: 'Hot-Wall LPCVD Tube Furnace Water-Cooled Stainless Steel Shell', name_zh: '热壁 LPCVD 管式炉水冷不锈钢炉壳', unit: '件', category: 'part' },

  /**
   * 耐腐蚀真空机组。**罗茨 + 爪式干泵两级**，13–40 Pa 工作点。
   *
   * 为什么不用 `plant/evaporator/pump` 的水环：NH₃/TCS 遇水生成 NH₄Cl 与
   * 硅酸，水环泵几天就堵；干泵的转子与腔壁用不锈钢 + PTFE 密封。
   */
  { id: 'plant/lpcvd-furnace/pump', name: 'Hot-Wall LPCVD Tube Furnace Corrosion-Resistant Vacuum Pumping System', name_zh: '热壁 LPCVD 管式炉耐腐蚀真空机组', unit: '件', category: 'part' },

  /** 爪式干泵转子。不锈钢型线，车后磨、动平衡。 */
  { id: 'plant/lpcvd-furnace/claw-rotor', name: 'Hot-Wall LPCVD Tube Furnace Claw Dry Pump Rotor', name_zh: '热壁 LPCVD 管式炉爪式干泵转子', unit: '件', category: 'part' },

  /** 手动节流阀。φ50 翻板 + 石墨绳填料，10–70:1；与 ALD/RIE 的节流阀同一副手艺。 */
  { id: 'plant/lpcvd-furnace/throttle', name: 'Hot-Wall LPCVD Tube Furnace Manual Throttle Valve', name_zh: '热壁 LPCVD 管式炉手动节流阀', unit: '件', category: 'part' },

  /**
   * 电容薄膜规。**0.1–1000 Pa、±5 %**。
   *
   * 膜片 φ30 不锈钢，电极间隙 50 µm；电容变化由交流桥读出。
   * 标定用**油柱**：13–40 Pa 对应 1.5–4.5 mm 油柱（ρ ≈ 0.9 g/cm³），
   * `plant/comparator` 的 1 µm 读柱高，U 型管本身 ±0.1 mm ⇒ ±2–7 %。
   */
  {
    id: 'plant/lpcvd-furnace/manometer',
    name: 'Hot-Wall LPCVD Tube Furnace Capacitance Diaphragm Gauge', name_zh: '热壁 LPCVD 管式炉电容薄膜规',
    unit: '件',
    category: 'part',
    props: [
      { param: 'range', kind: 'range', min: 0.1, max: 1000, unit: 'Pa' },
      { param: 'accuracy', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
    ],
  },

  /** 小 load lock。φ150 × 80 mm，手动门 + 闸阀 + 传递臂；一次装 1 舟。 */
  { id: 'plant/lpcvd-furnace/load-lock', name: 'Small Load Lock', name_zh: '小 load lock', unit: '件', category: 'part' },

  /** 闸阀。不锈钢阀体 + PTFE 阀座 + 手轮；漏率 ≤1e-6 Pa·L/s。 */
  { id: 'plant/lpcvd-furnace/gate-valve', name: 'Hot-Wall LPCVD Tube Furnace Gate Valve', name_zh: '热壁 LPCVD 管式炉闸阀', unit: '件', category: 'part' },

  /** TCS/NH₃ 两路气 + 纯化器 + 阀组。MFC 是 `plant/mfc`，在路线 `needs` 里。 */
  { id: 'plant/lpcvd-furnace/gas-panel', name: 'Hot-Wall LPCVD Tube Furnace Gas Panel', name_zh: '热壁 LPCVD 管式炉气路板', unit: '件', category: 'part' },

  /** 气体纯化器。4A 分子筛 + 石灰 + 铜屑三级；出口设计 10–50 ppb。 */
  {
    id: 'plant/lpcvd-furnace/gas-purifier',
    name: 'Hot-Wall LPCVD Tube Furnace Gas Purifier', name_zh: '热壁 LPCVD 管式炉气体纯化器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'waterContent', kind: 'range', min: 0.01, max: 0.05, unit: 'ppm', dir: 'atMost' },
      { param: 'oxygenContent', kind: 'range', min: 0.01, max: 0.05, unit: 'ppm', dir: 'atMost' },
    ],
  },

  /** 石英舟。50 片位、片距 20 mm、三点支撑；不刮片背。 */
  { id: 'plant/lpcvd-furnace/wafer-boat', name: 'Hot-Wall LPCVD Tube Furnace Quartz Boat', name_zh: '热壁 LPCVD 管式炉石英舟', unit: '件', category: 'part' },
];

// ═══════════════════════════════════════════════════════════════════════════
// 四、路线
// ═══════════════════════════════════════════════════════════════════════════

export const SI3N4_LPCVD_ROUTES: readonly Route[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 4.1 电子级氨：精馏 + 分子筛/铜屑
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **氨提纯：精馏 → 4A 分子筛 → 铜屑吸气剂。**
     *
     *   氨（99–99.5 %）1000 + 分子筛 20 + 铜屑 1 + 水 2 → 电子级氨 990
     *
     * 精馏 40–80 °C / 300–1000 kPa：NH₃ 在 40 °C 下约 1.6 MPa，塔压 300–1000 kPa
     * 足够把 NH₃ 留在塔顶、水与重端留在塔底。分子筛 4A 在 250–300 °C 活化，
     * 出口露点 −90…−100 °C；铜屑 400 °C 把 O₂ 压到 1e-10 Pa 量级。
     *
     * ⚠️ 99.999 % 是设计值：本层没有 <100 ppm 的 NH₃ 分析仪，
     * 只能靠露点与铜片穿透做过程判据（unblock-gas-purifier.ts:144–177）。
     */
    id: 'make/ammonia-electronic',
    name: 'Ammonia Purification', name_zh: '氨提纯',
    produces: [
      {
        item: 'mat/ammonia-electronic',
        qty: q(990),
        gives: [
          { param: 'purity', kind: 'range', min: 99.999, max: 99.9999 },
          { param: 'waterContent', kind: 'range', min: 1, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ammonia', qty: q(1000) }] },
      // 分子筛与铜屑是纯化介质，按批更换；20 kg 分子筛 ≈ 0.2 kg 水容量
      { anyOf: [{ item: 'mat/zeolite-4a', qty: q(20) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh:
          '① 精馏：40–80 °C、300–1000 kPa；NH₃ 从塔顶走，水与重端从塔底排。塔板数按 B/P 与水的分离定，本层没有在线分析，按温差与压力开环',
        performedBy: 'plant/distillation-tower',
        under: [
          { param: 'temperature', min: 40, max: 80 },
          { param: 'pressure', min: 300, max: 1000 },
        ],
      },
      {
        note_zh:
          '② 活化分子筛：250–300 °C、干氮吹扫 4 h；4A 出口露点 −90…−100 °C（设计值）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 250, max: 300 }],
      },
      {
        note_zh:
          '③ 吸附/过滤：NH₃ 依次过 4A 分子筛与铜屑床；铜屑只走 NH₃ 路，出口含水 1–10 ppm、含氧 10–50 ppb（设计值）。⚠️ 没有 <100 ppm 的在线分析仪，只能看露点与铜片是否变黑',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '氨 1000 kg（99–99.5 %）+ 分子筛 20 kg + 铜屑 1 kg + 水 2 kg → 电子级氨 990 kg（99.999–99.9999 %）。差 10 kg 是水 5 kg + 重端 4 kg + 取样/放空 1 kg；分子筛与铜屑是介质，按批更换，不按 kg 折进产品。产物按 kg 计，纯度是设计值（没有 <100 ppm 分析仪）',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4.2 电子级 TCS：二次精馏 + 吸附
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **TCS 二次精馏：粗纯 1000 → 电子级 900。**
     *
     *   TCS（一次精馏）1000 → 电子级 TCS 900 + 塔底 100
     *
     * 一次精馏（polysilicon.ts:136–146）已经把 SiCl₄ 与大部分 B/P 氯化物分掉；
     * 二次精馏把沸点只差几度的 BCl₃（12.6 °C）与 PCl₃（76 °C）再分一档。
     * 40–80 °C / 300–1000 kPa 与一次塔同一窗口。
     *
     * ⚠️ 99.9999 %、B/P ≤0.1 ppb、金属 ≤1 ppb 是设计值：
     * 本层没有 ICP-MS/GC-MS；SIMS 只能测固体膜，检出限 0.6–10 ppm，差 2–4 个量级。
     */
    id: 'make/trichlorosilane-electronic',
    name: 'TCS Secondary Rectification', name_zh: 'TCS 二次精馏',
    produces: [
      {
        item: 'mat/trichlorosilane-electronic',
        qty: q(900),
        gives: [
          { param: 'purity', kind: 'range', min: 99.9999, max: 99.99999 },
          { param: 'boron', kind: 'range', min: 0.01, max: 0.1, record: 'mat/boron-record' },
          { param: 'phosphorus', kind: 'range', min: 0.01, max: 0.1, record: 'mat/phosphorus-record' },
          { param: 'metals', kind: 'range', min: 0.1, max: 1 },
        ],
      },
      // 塔底 SiCl₄ 单列（1000 → 900 + 100）
      {
        item: 'mat/silicon-tetrachloride',
        qty: q(100),
        gives: [{ param: 'purity', kind: 'range', min: 95, max: 99 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/trichlorosilane-pure', qty: q(1000) }] }],
    needs: ['plant/clean-room'],
    performedBy: 'plant/distillation-tower',
    under: [
      { param: 'temperature', min: 40, max: 80 },
      { param: 'pressure', min: 300, max: 1000 },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      '一次精馏 TCS 1000 kg → 电子级 TCS 900 kg + 塔底 SiCl₄ 100 kg（已单列 mat/silicon-tetrachloride；B/P 氯化物并入同一条），进 1000 = 出 1000。纯度 99.9999 %、B/P ≤0.1 ppb 是设计值：本层没有 ICP-MS/GC-MS，SIMS 的 0.6–10 ppm 检出限差 2–4 个量级',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4.3 玻璃车床的五个零件
  // ─────────────────────────────────────────────────────────────────────────
  {
    /** 床身：HT250 浇 500 kg → 时效 → 铣导轨与顶尖座。 */
    id: 'make/glass-lathe-bed',
    name: 'Glass Lathe Bed Manufacturing', name_zh: '玻璃车床床身制造',
    produces: [{ item: 'plant/glass-lathe/bed', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(500) }] }],
    needs: ['plant/milling-machine'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
    rate: { hours: q(40) },
    unbalanced_zh:
      'HT250 500 kg → 床身 1 件（约 420 kg）；余 80 kg 是浇冒口、时效后加工余量与废品；产品按件计，不进质量账；余料回 mat/metal-scrap',
  },
  {
    /** 主轴箱：45 钢主轴 + 铜轴瓦 + 同步带轮 + 电机座。 */
    id: 'make/glass-lathe-headstock',
    name: 'Glass Lathe Headstock Manufacturing', name_zh: '玻璃车床主轴箱制造',
    produces: [{ item: 'plant/glass-lathe/headstock', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(50) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(1) }] },
    ],
    needs: ['plant/grinder'],
    rate: { hours: q(32) },
    steps: [
      { note_zh: '车主轴与轴瓦座，磨主轴颈', performedBy: 'lathe' },
      { note_zh: '装同步带轮、电机座与电机', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '45 钢 50 + 铜 2 kg + 电机 1 台 → 主轴箱 1 件；余是车屑与磨削量。产出按件计',
  },
  {
    /** 尾座：45 钢套筒 + 手轮 + 锁紧。 */
    id: 'make/glass-lathe-tailstock',
    name: 'Glass Lathe Tailstock Manufacturing', name_zh: '玻璃车床尾座制造',
    produces: [{ item: 'plant/glass-lathe/tailstock', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(30) }] }],
    needs: [],
    performedBy: 'lathe',
    rate: { hours: q(16) },
    unbalanced_zh: '45 钢 30 kg → 尾座 1 件（约 26 kg）；余是车屑。产出按件计',
  },
  {
    /** 燃烧器：铜喷嘴 φ6 + 不锈钢混合腔 + 针阀。 */
    id: 'make/glass-lathe-burner',
    name: 'Glass Lathe Oxyhydrogen Burner Manufacturing', name_zh: '玻璃车床氢氧焰燃烧器制造',
    produces: [{ item: 'plant/glass-lathe/burner', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'lathe',
    rate: { hours: q(8) },
    unbalanced_zh: '铜 2 + 不锈钢 1 kg → 燃烧器 1 件；余是车屑。产出按件计',
  },
  {
    /** 卡盘：45 钢三爪 + 石墨绳隔热。 */
    id: 'make/glass-lathe-chuck',
    name: 'Glass Lathe Chuck Manufacturing', name_zh: '玻璃车床卡盘制造',
    produces: [{ item: 'plant/glass-lathe/chuck', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(10) }] }],
    needs: [],
    performedBy: 'lathe',
    rate: { hours: q(12) },
    unbalanced_zh: '45 钢 10 kg → 卡盘 1 件（约 9 kg）；余是车屑。产出按件计',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4.4 LPCVD 炉的零件
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **φ110 石英管：石英砂 → 电弧熔锭 → 玻璃车床拉管/扩口/封接 → 磨口 → 法兰。**
     *
     *   石英砂 6 + 不锈钢 1 + PTFE 0.2 + 水 5 → φ110 × 1200 管 1 件
     *
     * 石英砂的软化点 1665 °C；拉管工作点 1900–2200 °C，由 `plant/arc-furnace`
     * 熔锭、`plant/glass-lathe` 的氢氧焰拉管与封接。这是本层第一次把
     * “玻璃车床”写进路线；原先 unblock-diffusion-tube.ts 说它不在闭包里。
     */
    id: 'make/lpcvd-tube',
    name: 'Hot-Wall LPCVD Tube Furnace Process Tube Manufacturing', name_zh: '热壁 LPCVD 管式炉镜筒制造',
    produces: [
      {
        item: 'plant/lpcvd-furnace/tube',
        qty: q(1),
        gives: [
          { param: 'innerDiameter', kind: 'range', min: 110, max: 110 },
          { param: 'length', kind: 'range', min: 1200, max: 1200 },
          { param: 'wallThickness', kind: 'range', min: 5, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(6) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
      // 玻璃车床的氢氧焰：H₂:O₂ ≈ 2:1（摩尔），按质量 1:8；这里取富氢焰
      { anyOf: [{ item: 'mat/oxygen', qty: q(2) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 2) }] },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh:
          '① 电弧熔石英锭：石英砂 6 kg，1900–2200 °C，熔成 φ140 × 300 的锭；气泡 10³–10⁴ 个/cm³（火焰法的通例）',
        performedBy: 'plant/arc-furnace',
        under: [{ param: 'temperature', min: 1900, max: 2200 }],
      },
      {
        note_zh:
          '② 玻璃车床：锭重加热到 1900–2200 °C，拉成 φ120 × 1200 的管，扩口、封接两端法兰；同轴度 ≤0.3 mm',
        performedBy: 'plant/glass-lathe',
        under: [{ param: 'temperature', min: 1900, max: 2200 }],
      },
      {
        note_zh: '③ 切定长、磨两端面与磨口；端面平行度 ≤0.05 mm',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '④ 不锈钢法兰配作、PTFE 垫圈、对角拧紧；冷态试漏（没有氦检，按保压）',
        performedBy: 'plant/sheet-shop',
      },
    ],
    unbalanced_zh:
      '石英砂 6 + 不锈钢 1 + PTFE 0.2 + 氧 2 + 氢 0.5 + 水 5 kg → φ110 × 1200 石英管 1 件（约 4.8 kg）；余 2.4 kg 是拉管/切磨/废品，水 5 kg 是冷却与清洗，氢氧焰 2.5 kg 走尾气。产出按件计，不折 kg',
  },
  {
    /** 三温区加热体：SiC 棒 3 支 + 氧化铝砖 + 热电偶 3 支。 */
    id: 'make/lpcvd-heater',
    name: 'Hot-Wall LPCVD Tube Furnace 3-Zone Heating Element Manufacturing', name_zh: '热壁 LPCVD 管式炉三温区加热体制造',
    produces: [
      {
        item: 'plant/lpcvd-furnace/heater',
        qty: q(1),
        gives: [
          { param: 'zones', kind: 'range', min: 3, max: 3 },
          { param: 'temperatureUniformity', kind: 'range', min: 3, max: 5 },
          { param: 'power', kind: 'range', min: 10, max: 12 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/sic-heating-element-general', qty: q(3) }] },
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(5) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(3) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(16) },
    steps: [
      { note_zh: '① 装 SiC 棒与氧化铝砖：三段独立，段间留 20 mm 膨胀缝', performedBy: 'plant/robot' },
      { note_zh: '② 焊热电偶与电极引入；三支 T 型热电偶分别贴三段', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: 'SiC 棒 3 + 氧化铝 5 + 热电偶 3 + 不锈钢 2 + 铜 1 → 加热体 1 件；按件计，余是装配损耗',
  },
  {
    /** 保温层：氧化铝空心球砖 + 耐火纤维，1300–1500 °C 烧成。 */
    id: 'make/lpcvd-insulation',
    name: 'Hot-Wall LPCVD Tube Furnace Insulation Manufacturing', name_zh: '热壁 LPCVD 管式炉保温层制造',
    produces: [{ item: 'plant/lpcvd-furnace/insulation', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(10) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/grinder'],
    performedBy: 'plant/kiln',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
    rate: { hours: q(12) },
    unbalanced_zh: '氧化铝 10 + 耐火料 10 + 水 2 kg → 保温层 1 件（约 18 kg）；余是烧失与切磨。产出按件计',
  },
  {
    /** 水冷炉壳：不锈钢卷焊 + 法兰 + 水套 + 试压。 */
    id: 'make/lpcvd-shell',
    name: 'Hot-Wall LPCVD Tube Furnace Water-Cooled Stainless Steel Shell Manufacturing', name_zh: '热壁 LPCVD 管式炉水冷不锈钢炉壳制造',
    produces: [{ item: 'plant/lpcvd-furnace/shell', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(20) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(20) },
    steps: [
      { note_zh: '① 卷筒、焊纵缝与法兰；水套试压 0.4 MPa / 30 min', performedBy: 'plant/sheet-shop' },
      { note_zh: '② 车两端法兰面、配 O 圈槽', performedBy: 'lathe' },
      { note_zh: '③ 装观察窗、电极引入与接地；外观/焊缝检查', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '不锈钢 20 + 钢板 5 + 铜 2 + 水 2 kg → 炉壳 1 件（约 24 kg）；余是焊材、切边与水。产出按件计',
  },
  {
    /**
     * 耐腐蚀真空机组：罗茨 + 爪式干泵 + 电机 + PTFE 密封。
     *
     * 罗茨转子用 `plant/evaporator/pump/roots`（已有路线 make/roots-rotor）；
     * 爪式转子自制；两级串联，13–40 Pa 工作点，极限 ≤0.1 Pa。
     */
    id: 'make/lpcvd-pump',
    name: 'Hot-Wall LPCVD Tube Furnace Corrosion-Resistant Vacuum Pumping System Manufacturing', name_zh: '热壁 LPCVD 管式炉耐腐蚀真空机组制造',
    produces: [{ item: 'plant/lpcvd-furnace/pump', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'plant/evaporator/pump/roots', qty: q(1) }] },
      { anyOf: [{ item: 'plant/lpcvd-furnace/claw-rotor', qty: q(1) }] },
      { anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/grinder', 'plant/clean-room'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '① 车泵壳与端盖、装罗茨转子与爪式转子；间隙 0.1–0.15 mm', performedBy: 'lathe' },
      { note_zh: '② 装电机、PTFE 密封与冷却水路；手盘车不咬', performedBy: 'plant/robot' },
      { note_zh: '③ 试漏与抽速：进口 13–40 Pa，极限 ≤0.1 Pa；没有氦检，按压升法', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '罗茨转子 1 + 爪式转子 1 + 电机 1 + 不锈钢 5 + PTFE 1 + 铜 1 + 水 2 → 真空机组 1 件；按件计，余是切屑与试漏损耗',
  },
  {
    /** 爪式干泵转子：不锈钢型线，车后磨、动平衡。 */
    id: 'make/lpcvd-claw-rotor',
    name: 'Hot-Wall LPCVD Tube Furnace Claw Dry Pump Rotor Manufacturing', name_zh: '热壁 LPCVD 管式炉爪式干泵转子制造',
    produces: [{ item: 'plant/lpcvd-furnace/claw-rotor', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 5) }] },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(12) },
    steps: [
      { note_zh: '① 车转子型线，留 0.2 mm 磨量', performedBy: 'lathe' },
      { note_zh: '② 磨型线到 0.01 mm，动平衡 ≤0.5 g·mm/kg', performedBy: 'plant/grinder' },
    ],
    unbalanced_zh: '不锈钢 2 + PTFE 0.2 kg → 爪式转子 1 件（约 1.8 kg）；余是车屑。产出按件计',
  },
  {
    /** 手动节流阀：φ50 翻板 + 石墨绳填料 + 手轮。 */
    id: 'make/lpcvd-throttle',
    name: 'Hot-Wall LPCVD Tube Furnace Manual Throttle Valve Manufacturing', name_zh: '热壁 LPCVD 管式炉手动节流阀制造',
    produces: [{ item: 'plant/lpcvd-furnace/throttle', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '① 车阀体与翻板，铣密封面', performedBy: 'lathe' },
      { note_zh: '② 铣翻板轴孔与填料函', performedBy: 'plant/milling-machine' },
      { note_zh: '③ 装石墨绳填料与手轮；10–70:1 节流曲线', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '铝 1 + 45 钢 0.5 + 碳 0.1 + 铜 0.2 kg → 节流阀 1 件；余是车屑。产出按件计',
  },
  {
    /**
     * 电容薄膜规：车膜片座 → 焊膜片/装电极 → 交流桥 → 油柱标定。
     *
     *   不锈钢 0.5 + 氧化铝 0.1 + 运放 1 + 稳压管 1 + 铜线 0.1 + 玻璃 0.1
     *     → 薄膜规 1 件（0.1–1000 Pa、±5 %）
     *
     * 标定：13–40 Pa 对应 1.5–4.5 mm 油柱（ρ ≈ 0.9 g/cm³）；
     * `plant/comparator` 的 1 µm 读柱高，U 型管 ±0.1 mm ⇒ ±2–7 %。
     */
    id: 'make/lpcvd-manometer',
    name: 'Hot-Wall LPCVD Tube Furnace Capacitance Diaphragm Gauge Manufacturing', name_zh: '热壁 LPCVD 管式炉电容薄膜规制造',
    produces: [
      {
        item: 'plant/lpcvd-furnace/manometer',
        qty: q(1),
        gives: [
          { param: 'range', kind: 'range', min: 0.1, max: 1000 },
          { param: 'accuracy', kind: 'range', min: 3, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(1, 10) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 10) }] },
    ],
    needs: ['plant/comparator', 'plant/metrology-room', 'plant/clean-room'],
    rate: { hours: q(12) },
    steps: [
      { note_zh: '① 车膜片座与电极，焊 30 µm 不锈钢膜片；间隙 50 µm', performedBy: 'lathe' },
      { note_zh: '② 装交流桥、稳压与屏蔽盒；零位调平', performedBy: 'plant/robot' },
      {
        note_zh:
          '③ 油柱标定：13–40 Pa 对应 1.5–4.5 mm 油柱，U 型管 ±0.1 mm，`plant/comparator` 读柱高；三点（13/25/40 Pa）线性 ≤2 %，总不确定度 3–5 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '不锈钢 0.5 + 氧化铝 0.1 + 运放 1 + 稳压管 1 + 铜线 0.1 + 玻璃 0.1 → 薄膜规 1 件；电子件按件计，不折 kg。标定是油柱法，不是活塞/钟罩压力标准',
  },
  {
    /** 小 load lock：腔体 + 闸阀 + 传递臂 + 手动门。 */
    id: 'make/lpcvd-load-lock',
    name: 'Small Load Lock Manufacturing', name_zh: '小 load lock 制造',
    produces: [{ item: 'plant/lpcvd-furnace/load-lock', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'plant/lpcvd-furnace/gate-valve', qty: q(1) }] },
      { anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(3) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(20) },
    steps: [
      { note_zh: '① 卷焊 φ150 × 80 腔体、焊法兰与观察窗', performedBy: 'plant/sheet-shop' },
      { note_zh: '② 车门口与 O 圈槽', performedBy: 'lathe' },
      { note_zh: '③ 装闸阀、传递臂与电机；手动门开合 100 次', performedBy: 'plant/robot' },
      { note_zh: '④ 试漏：保压 0.1 MPa / 30 min，压降 ≤1 %', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '闸阀 1 + 电机 1 + 不锈钢 5 + 铝 3 + PTFE 1 + 玻璃 1 + 水 2 → load lock 1 件；按件计',
  },
  {
    /** 闸阀：不锈钢阀体 + PTFE 阀座 + 手轮。 */
    id: 'make/lpcvd-gate-valve',
    name: 'Hot-Wall LPCVD Tube Furnace Gate Valve Manufacturing', name_zh: '热壁 LPCVD 管式炉闸阀制造',
    produces: [{ item: 'plant/lpcvd-furnace/gate-valve', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '① 车阀体与阀板，铣密封槽', performedBy: 'lathe' },
      { note_zh: '② 铣导向槽与手轮轴孔', performedBy: 'plant/milling-machine' },
      { note_zh: '③ 装 PTFE 阀座与手轮；开关 200 次', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '不锈钢 1 + PTFE 0.1 + 铜 0.1 kg → 闸阀 1 件；余是车屑。产出按件计',
  },
  {
    /** TCS/NH₃ 两路气 + 纯化器 + 阀组；MFC 由 `plant/mfc` 在路线 needs 里给。 */
    id: 'make/lpcvd-gas-panel',
    name: 'Hot-Wall LPCVD Tube Furnace Gas Panel Manufacturing', name_zh: '热壁 LPCVD 管式炉气路板制造',
    produces: [{ item: 'plant/lpcvd-furnace/gas-panel', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'plant/lpcvd-furnace/gas-purifier', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(3) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(16) },
    steps: [
      { note_zh: '① 弯管、焊阀组：TCS 与 NH₃ 各一路，316L φ6 × 1；死体积 ≤20 cm³', performedBy: 'plant/sheet-shop' },
      { note_zh: '② 装纯化器、过滤器与取样口；两路交叉 purge。⚠️ MFC 由 `plant/mfc` 在路线 needs 里给，本层只有 N₂ 标定（0–200 sccm、±3 %）；NH₃ 路的耐腐蚀兼容与流量标定仍是缺口，按同一开度重复性用', performedBy: 'plant/robot' },
      { note_zh: '③ 试漏：0.4 MPa / 30 min，压降 ≤0.5 %；没有氦检', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '纯化器 1 + 不锈钢 3 + PTFE 1 + 铜 1 + 玻璃 1 + 水 2 → 气路面板 1 件；按件计',
  },
  {
    /**
     * 气体纯化器：4A 分子筛 + 石灰 + 铜屑。
     *
     * 出口设计 **H₂O 10–50 ppb、O₂ 10–50 ppb**；但本层没有 <100 ppm 的分析仪，
     * 这个窗口只能靠露点与铜片穿透做过程判据（unblock-gas-purifier.ts:144–177）。
     */
    id: 'make/lpcvd-gas-purifier',
    name: 'Hot-Wall LPCVD Tube Furnace Gas Purifier Manufacturing', name_zh: '热壁 LPCVD 管式炉气体纯化器制造',
    produces: [
      {
        item: 'plant/lpcvd-furnace/gas-purifier',
        qty: q(1),
        gives: [
          { param: 'waterContent', kind: 'range', min: 0.01, max: 0.05 },
          { param: 'oxygenContent', kind: 'range', min: 0.01, max: 0.05 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/zeolite-4a', qty: q(20) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(12) },
    steps: [
      {
        note_zh:
          '① 装填：4A 分子筛 20 kg + 石灰 10 kg + 铜屑 2 kg；三柱串联，末级观察窗挂抛光铜片',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '② 活化：250–300 °C、干氮吹扫 4 h；分子筛出口露点 −90…−100 °C，铜屑 400 °C 把 O₂ 压到 1e-10 Pa 量级（设计值）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 250, max: 300 }],
      },
      { note_zh: '③ 试漏与标志：0.4 MPa / 30 min；出口取样口与压差计', performedBy: 'plant/robot' },
    ],
    unbalanced_zh:
      '分子筛 20 + 石灰 10 + 铜 2 + 不锈钢 2 + 水 2 → 纯化器 1 件；介质按批更换，不按 kg 折进产品。出口 10–50 ppb 是设计值，本层没有 <100 ppm 的分析仪',
  },
  {
    /** 石英舟：石英棒切槽 + 玻璃车床焊 + 磨槽，50 片位。 */
    id: 'make/lpcvd-wafer-boat',
    name: 'Hot-Wall LPCVD Tube Furnace Quartz Boat Manufacturing', name_zh: '热壁 LPCVD 管式炉石英舟制造',
    produces: [{ item: 'plant/lpcvd-furnace/wafer-boat', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 4) }] },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh: '① 石英棒切 4 根纵梁 + 51 根横档，玻璃车床焊成 50 片位舟；片距 20 mm',
        performedBy: 'plant/glass-lathe',
        under: [{ param: 'temperature', min: 1900, max: 2200 }],
      },
      { note_zh: '② 磨槽与倒角，三点支撑；不刮片背', performedBy: 'plant/grinder' },
    ],
    unbalanced_zh: '石英 1 + 水 1 + 氧 1 + 氢 0.25 kg → 石英舟 1 件（约 0.8 kg）；余是切磨，氢氧焰 1.25 kg 走尾气。产出按件计',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4.5 Si₃N₄ 成膜
  // ─────────────────────────────────────────────────────────────────────────
  {
    /**
     * **LPCVD Si₃N₄：TCS + NH₃，700–780 °C、13–40 Pa。**
     *
     *   device 片 1 + TCS 1 g + NH₃ 1 g + N₂ 10 g + 水 2 kg
     *     → 钝化片 1（Si₃N₄ 0.3–1 µm）
     *
     * 反应：3 SiHCl₃ + 4 NH₃ → Si₃N₄ + 6 HCl + 6 H₂（简化式；TCS 的 Si/N
     * 目标 0.75–0.85，Si 富一点膜应力更大、HF 里更慢）。
     *
     * 温度 700–780 °C：低于 700 则 NH₃ 分解不足、膜含氢高；高于 780 则
     * 气相成核出颗粒、且与 40 nm 前道的热预算打架。
     * 压力 13–40 Pa：100–300 mTorr；平均自由程远大于片间距，片间靠分子流。
     *
     * ⚠️ TCS/NH₃ 的 MFC 是 `plant/mfc`（N₂ 标定、0–200 sccm、±3 %）；
     * NH₃ 路的耐腐蚀阀件在气路面板里，但 MFC 的 NH₃ 标定没有，流量只能按
     * 同一开度重复性用。这是气路缺口，不是炉子窗口缺口。
     *
     * ⚠️ 交付窗口里的四个“设计值”：
     *   stoichiometry 0.75–0.85  无 RBS/XPS/NRA；SIMS 的 N⁺/Si²⁺ 分不开
     *   hydrogenContent <2 at%   无 FTIR
     *   stress 0.5–1.5 GPa       无应力仪；干涉仪不是片弓仪
     *   uniformity ≤5 %          椭偏 49 点可测厚度，但炉子流场/温场没有实测
     *
     * ✅ 这条路线**已接进** `make/mcu-40nm-damascene`（`chip-node.ts` 的
     * uses/steps 用 `mat/si3n4-lpcvd` + `plant/lpcvd-furnace`）。
     * **2026-10-20 前的口径**是“不接、40 nm MCU 仍用 SOG + 酚醛
     * （chip-node.ts:57–66）”—— 那一版已不成立；现在 40 nm MCU 的钝化
     * 就是本条的 `mat/si3n4-lpcvd`。
     */
    id: 'make/lpcvd-si3n4',
    name: 'LPCVD Silicon Nitride Passivation Wafer Manufacturing', name_zh: 'LPCVD 氮化硅钝化片制造',
    produces: [
      {
        item: 'mat/si3n4-lpcvd',
        qty: q(1),
        gives: [
          { param: 'thickness', kind: 'range', min: 0.3, max: 1, record: 'mat/si3n4-vbd-record' },
          { param: 'stoichiometry', kind: 'range', min: 0.75, max: 0.85 },
          { param: 'hydrogenContent', kind: 'range', min: 0, max: 2 },
          { param: 'stress', kind: 'range', min: 0.5, max: 1.5 },
          { param: 'uniformity', kind: 'range', min: 3, max: 5 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/device-wafer',
            qty: q(1),
            need: [{ param: 'node', kind: 'range', max: 50, dir: 'atMost' }],
            onRelax: 'functional-lost',
          },
        ],
      },
      // 化学计量只要 7.3–24.3 mg TCS、3.7–12.2 mg NH₃；取 1 g 是 40–140 倍过量
      { anyOf: [{ item: 'mat/trichlorosilane-electronic', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/ammonia-electronic', qty: q(1, 1000) }] },
      // 载气/吹扫 10 g：100 sccm × 2 min 只有 0.25 g，取 10 g 留 purge 与死体积
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/mfc', 'plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '① 清洗/装片：RCA 式清洗、甩干，装石英舟 50 片；进 load lock，抽到 ≤1 Pa 再开主阀',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 22, max: 26 },
          { param: 'pressure', min: 120, max: 180 },
        ],
      },
      {
        note_zh:
          '② 沉积：700–780 °C、13–40 Pa；TCS/NH₃ 各 20–100 sccm，N₂ 载气；0.3–1 µm 按 5–10 nm/min 要 30–200 min。**温度/压力窗口由 plant/lpcvd-furnace 维持**；停气后 N₂ 吹扫、降温暖炉',
        performedBy: 'plant/lpcvd-furnace',
        under: [
          { param: 'temperature', min: 700, max: 780 },
          { param: 'pressure', min: 13, max: 40 },
        ],
      },
      {
        note_zh:
          '③ 椭偏：488 nm、70°/75°，读厚度与 n；49 点（7 半径 × 7 方位，60 s/点 = 49 min）读厚度均匀性。n 只能旁证 Si/N，分不开 0.75 与 0.85；H、应力、Vbd、Na 都没有量具',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'device 片 1 + TCS 1 g + NH₃ 1 g + N₂ 10 g + 水 2 kg → 钝化片 1。膜 7.5–25.1 mg（0.3–1 µm × 78.54 cm² × 3.2 g/cm³）；化学计量 TCS 7.3–24.3 mg、NH₃ 3.7–12.2 mg —— 1 g 是 40–140 倍过量，走尾气。水是清洗。产物按片计，芯片质量没有条目，不折 kg。Si₃N₄ 的 Si/N、H、应力、均匀性是设计值，不是实测',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...SI3N4_LPCVD_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/glass-lathe',
    name: 'Glass Lathe Assembly', name_zh: '玻璃车床装配',
    produces: [{
      item: 'plant/glass-lathe',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/lpcvd-furnace',
    name: 'Hot-Wall LPCVD Tube Furnace Assembly', name_zh: '热壁 LPCVD 管式炉装配',
    produces: [{
      item: 'plant/lpcvd-furnace',
      qty: q(1),
      gives: [
      { param: 'temperatureUniformity', kind: 'range', min: 0, max: 5, dir: 'atMost' },
      { param: 'pressureAccuracy', kind: 'range', min: 0, max: 5, dir: 'atMost' },
      { param: 'leakRate', kind: 'range', min: 0, max: 0.000001, dir: 'atMost' },
      { param: 'waferCapacity', kind: 'range', min: 50, max: 50, dir: 'atLeast' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...SI3N4_LPCVD_ROUTES, ...ASSEMBLY_ROUTES];
