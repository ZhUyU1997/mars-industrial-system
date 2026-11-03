/**
 * InGaAs 光电二极管 —— 把种子清单上最后一条没有路线的条目接上。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 这条链补的是什么
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `std/photodiode-ingaas` 是 `data/floor/seed.ts` 里最后一条只有条目、没有
 * 产出路线的种子。它此前被写成“本层没有 III-V，所以进口”——那句话不是结论，
 * 只是把缺口记在了清单上。本文件按 Earth 工程把它拆成四段：
 *
 *   ① 金属与气体   In、Ga、As 从锌/铜/磷的副产与风化层来；P、H₂ 已有路线。
 *   ② 金属有机源   TMIn / TMGa：金属氯化物 + 甲基氯 + 镁（格氏），低温精馏。
 *                   PH₃ / AsH₃：磷/砷 + 氢，高压合成。
 *   ③ 磷化铟       多晶合成（1050–1100 °C、~40 atm）→ LEC 单晶（B₂O₃ 液封，
 *                   10–50 atm）→ 线锯/研磨/CMP → 2 英寸衬底。
 *   ④ 器件          MOCVD 外延 InGaAs 吸收层 + InP 窗口 → p-i-n 台面 →
 *                   SiNx 钝化 → Ti/Au 与 AuGe/Ni/Au 欧姆接触 → AR 膜 →
 *                   划片 → TO 封装 → 暗电流/响应度/光谱响应测试。
 *
 * 每一段的数都按 Earth 工程值写，并在注释里给算式。没有中试的地方标
 * “设计值”，不写成实测；没有量具的地方给缺口数字，不写“造不出”。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 关键设计窗口（全部是设计值，Earth 工程值）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   InP 多晶合成     1050–1100 °C、3500–4500 kPa（≈35–45 atm）
 *   LEC 单晶         1050–1100 °C、2000–4000 kPa（≈20–40 atm），B₂O₃ 液封
 *   位错密度         ≤1×10⁵ cm⁻²（EPD，设计目标；LEC 的典型 1×10⁴–1×10⁵）
 *   衬底             2 英寸（50.8 mm）、350–500 µm、TTV ≤10 µm
 *   MOCVD            500–700 °C、7–13 kPa（50–100 Torr）
 *   InGaAs 吸收层    2–3 µm，In₀.₅₃Ga₀.₄₇As（x = 0.45–0.49）
 *   器件             900–1700 nm、0.8–1.1 A/W、0.5–1.0 mm²、暗电流 ≤5 nA
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 质量账的口径
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 材料按 kg 计，但这一层的批量小到克：1 kg InP 单晶切 130 片 2 英寸片，
 * 一片 4.4 g；一只器件的外延层只有约 30 mg；金属有机源按 g 投。所有
 * “片/克”都在路线注释里换算成 kg 的有理数，模型只认 kg，不认 g。
 *
 * 产出是“片/件”的路线不做质量守恒断言（kg 与非 kg 不可相加）；这些路线
 * 用 `unbalanced_zh` 写清每一段的克数与去向，避免把“按件”当成“账平”。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 量具缺口（照实写，给数字）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① 单色仪：本层原来没有 `monochromator`；本文件建 `plant/monochromator`
 *      （600 线/mm、800–1800 nm、2–10 nm 分辨率）。波长标定用钠 589.0 nm 的
 *      二级 1178.0 nm 与镉 643.8 nm 的二级 1287.6 nm，绝对波长 ±2–5 nm。
 *   ② 标准探测器：本层没有校准过的 1.55 µm 标准管；本文件建
 *      `std/thermopile-detector-general`（金黑 + 25 对铜-铁热电堆，0.3–20 µm
 *      平坦响应）。它的绝对响应按电功率替代标定，设计值 0.2–0.5 V/W；
 *      没有 NIST 溯源，光谱响应的不确定度按 ±5–10 % 记。
 *   ③ 暗电流：`plant/probe-station` 的 µV 级前端不够；本文件建
 *      `plant/picoammeter`（借用参数分析仪的 femto 前端 + 24 位 ADC，
 *      1×10⁻¹³–1×10⁻³ A、分辨 1×10⁻¹⁵ A）。5 nA 的判据有 5000 倍余量。
 *   ④ 光源：`plant/white-light-source` 的声明窗口是 400–700 nm，而卤素灯
 *      2800–3400 K 在 1550 nm 仍有约 10–20 % 的相对光谱辐亮度；1.55 µm 的
 *      绝对功率由热电堆读，不靠灯的标称功率。这是降级，不是缺口归零。
 *   ⑤ 热电制冷：Bi、Te 两条链都还没有路线，本文件按**不制冷**写（25 °C、
 *      暗电流 ≤5 nA）。升级到 −20 °C、≤0.5 nA 要 Bi₂Te₃，缺口是 10 倍暗电流
 *      与两条金属链；这条升级不在本文件里假装完成。
 *   ⑥ 纯度：In/Ga 是 4N5–5N，TMIn/TMGa 是 4N5，InP 是 4N5–5N；MOCVD 的
 *      6N 级源还有 10 倍杂质缺口。氨水是 25–30 % 的水溶液，本文件另建
 *      `mat/ammonia-anhydrous` 把它蒸到 99.99 % 以上；硅烷走 TCS 歧化，
 *      99.9–99.999 %。这些窗口写在各自的 `gives` 里。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 和既有条目的关系
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   In   `mat/zinc-sulfate`（`zinc.ts`）里 90 ppm 的铟，锌粉置换 → 电解。
 *   Ga   同一股锌浸出液里 50 ppm 的镓，树脂吸附 → 电解。
 *   As   锌精矿里 0.2 % 的砷，焙烧成 As₂O₃ → 碳还原 → 单质砷。
 *   P    `mat/phosphorus`（`dopant.ts`）已有电炉路线，直接用。
 *   H₂   `mat/hydrogen`（`chain.ts`）已有电解水路线，直接用。
 *   B₂O₃ `mat/boric-acid`（`boron.ts`）脱水，不另开硼矿。
 *
 * `mat/germanium-metal` 是本文件新建的：`uhf-pd.ts` 里声明过 `mat/germanium`，
 * 但那份 items 没有进 `tools/report/data.ts` 的装配；为避免与未注册声明撞 id，
 * 这里用 `mat/germanium-metal`，只服务 AuGe/Ni/Au 接触的几毫克。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目
// ═══════════════════════════════════════════════════════════════════════════

export const INGAAS_ITEMS: readonly Item[] = [
  // ───────────────────────────────────────────────────────────────────────
  // 1. 金属与气体
  // ───────────────────────────────────────────────────────────────────────

  /**
   * 铟（In，4N5–5N）。银白色软金属，熔点 156.6 °C。
   *
   * 地球上的铟几乎全部是锌冶炼的副产：闪锌矿里 10–100 ppm，焙烧/浸出后
   * 留在硫酸锌溶液里，用锌粉置换出海绵铟，再电解精炼到 4N5–5N。
   * 本层取 90 ppm（设计值，落在锌浸出液的常见区间）。
   */
  {
    id: 'mat/indium',
    name: 'Indium', name_zh: '铟',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 99.99, max: 99.999, unit: '%', dir: 'atLeast' }],
  },

  /**
   * 镓（Ga，4N5–5N）。银白色软金属，熔点 29.8 °C，手里会化。
   *
   * 地球上的镓主要从拜耳法铝酸钠母液里提；本层铝走酸法（`aluminium.ts`），
   * 没有拜耳母液，所以走**锌浸出液**这条次要来源（地球也有 10–20 % 的镓
   * 来自锌渣）。浓度取 50 ppm，树脂吸附 → 碱解吸 → 电解。
   */
  {
    id: 'mat/gallium',
    name: 'Gallium', name_zh: '镓',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 99.99, max: 99.999, unit: '%', dir: 'atLeast' }],
  },

  /**
   * 锗（Ge，4N5–5N）。只用于 AuGe/Ni/Au 欧姆接触，每只器件几微克。
   *
   * 来源与 `uhf-pd.ts` 的 `make/germanium` 同一条：锌浸出液沉锗 →
   * 氯化蒸馏 → 水解 → 氢还原 → 区熔。这里换个 id 是为了不与那份
   * 未进 data 装配的声明撞名（见文件头）。
   */
  {
    id: 'mat/germanium-metal',
    name: 'Germanium for Ohmic Contacts', name_zh: '欧姆接触用锗',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 99.99, max: 99.999, unit: '%', dir: 'atLeast' }],
  },

  /**
   * 三氯化铟（InCl₃）。白色吸湿固体，熔点 586 °C，遇水水解。
   *
   * 铟溶于盐酸直接得到 InCl₃ 溶液，蒸发/升华得无水盐；它是格氏反应的
   * 铟源。本层用湿法槽 60–80 °C、100–300 kPa（火星 0.6 kPa 下水会沸）。
   */
  {
    id: 'mat/indium-trichloride',
    name: 'Indium Trichloride', name_zh: '三氯化铟',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 0, max: 0.5, unit: '%', dir: 'atMost' },
    ],
  },

  /** 三氯化镓（GaCl₃）。白色吸湿固体，熔点 77.9 °C，同样遇水水解。 */
  {
    id: 'mat/gallium-trichloride',
    name: 'Gallium Trichloride', name_zh: '三氯化镓',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 0, max: 0.5, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 三甲基铟（TMIn，(CH₃)₃In）。MOCVD 的铟源，室温下是白色固体/低熔点
   * 配合物，蒸气压在 20 °C 约 1–2 Torr，用鼓泡器带入反应室。
   *
   * 路线：InCl₃ + 3 CH₃Cl + 3 Mg → TMIn + 3 MgCl₂（格氏，二乙醚中），
   * 再低温精馏。4N5 是设计值；6N 级要 6N 的 In 与更深的精馏。
   */
  {
    id: 'mat/trimethyl-indium',
    name: 'Trimethylindium', name_zh: '三甲基铟',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 0, max: 0.001, unit: '%', dir: 'atMost' },
    ],
  },

  /** 三甲基镓（TMGa，(CH₃)₃Ga）。无色液体，bp 55.7 °C，MOCVD 的镓源。 */
  {
    id: 'mat/trimethyl-gallium',
    name: 'Trimethylgallium', name_zh: '三甲基镓',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 0, max: 0.001, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 砷（As，99.5–99.9 %）。灰砷，升华点 616 °C。
   *
   * 来源是锌精矿里的砷（0.2 % 设计值）：焙烧时以 As₂O₃ 进烟尘，
   * 碳还原成单质砷。它是 AsH₃ 的原料，不是“本层没有砷”。
   */
  {
    id: 'mat/arsenic',
    name: 'Arsenic', name_zh: '砷',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 99.5, max: 99.99, unit: '%', dir: 'atLeast' }],
  },

  /**
   * 磷化氢（PH₃，99.9–99.99 %）。无色剧毒气体，bp −87.7 °C。
   *
   * 路线：P₄ + 6 H₂ → 4 PH₃，300–350 °C、150–250 atm。高压有利于平衡，
   * 本层用 `plant/autoclave`（150–550 °C、100–350 atm）。半导体级 5N
   * 还要低温精馏；本文件给 4N5，缺口写在文件头⑥。
   */
  {
    id: 'mat/phosphine',
    name: 'Phosphine', name_zh: '磷化氢',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 0, max: 0.001, unit: '%', dir: 'atMost' },
    ],
  },

  /** 砷化氢（AsH₃，99.9–99.99 %）。无色剧毒气体，bp −62.5 °C。 */
  {
    id: 'mat/arsine',
    name: 'Arsine', name_zh: '砷化氢',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 0, max: 0.001, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 氧化硼（B₂O₃，99–99.9 %）。白色玻璃状固体，熔点 450 °C。
   *
   * 它是 LEC 的液封覆盖剂：密度 1.8 g/cm³、熔点 450 °C，浮在 InP 熔体上，
   * 挡住磷的挥发，也把熔体与石英/气氛隔开。由硼酸脱水：
   * 2 H₃BO₃ → B₂O₃ + 3 H₂O，400–500 °C。
   */
  {
    id: 'mat/boron-oxide',
    name: 'Boron Oxide', name_zh: '氧化硼',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99, max: 99.9, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 0, max: 0.5, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 硅烷（SiH₄，99.9–99.999 %）。PECVD 的硅源，自燃，遇空气爆炸。
   *
   * 本层没有硅烷路线；这里补的是三氯氢硅歧化：
   * 4 SiHCl₃ → SiH₄ + 3 SiCl₄，60–80 °C、500–800 kPa，离子交换树脂催化。
   * 产出的 SiCl₄ 回多晶硅链（`hafnium.ts` 已有条目）。
   */
  {
    id: 'mat/silane',
    name: 'Silane', name_zh: '硅烷',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99.9, max: 99.999, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 0, max: 0.0001, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 乙醚（(C₂H₅)₂O，99–99.9 %）。格氏反应的溶剂，bp 34.6 °C。
   *
   * 乙醇脱水：2 C₂H₅OH → (C₂H₅)₂O + H₂O，140–150 °C、硫酸催化。
   * 本层用 `plant/acid-plant`（20–500 °C、100–500 kPa）做脱水，
   * `plant/distillation-tower` 精馏。
   */
  {
    id: 'mat/diethyl-ether',
    name: 'Diethyl Ether', name_zh: '乙醚',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99, max: 99.9, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 0, max: 0.1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 无水氨（NH₃，99.99–99.999 %）。PECVD 的氮源。
   *
   * 本层的 `mat/ammonia` 是 25–30 % 的水溶液；PECVD 要无水氨，否则
   * 水汽把 SiNx 变成 SiOxNy 并带氢。这里补一条 40–80 °C、300–800 kPa
   * 的精馏/干燥路线，把 28 % 氨水蒸成无水氨。
   */
  {
    id: 'mat/ammonia-anhydrous',
    name: 'Anhydrous Ammonia', name_zh: '无水氨',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99.99, max: 99.999, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 0, max: 0.001, unit: '%', dir: 'atMost' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 2. 磷化铟：多晶 → 单晶 → 衬底
  // ───────────────────────────────────────────────────────────────────────

  /**
   * 磷化铟多晶（InP，4N5–5N）。深灰色脆性块，密度 4.81 g/cm³。
   *
   * 合成：In + P → InP，1050–1100 °C、~40 atm。磷在 1 atm 下 590 °C 就
   * 升华，所以必须封在高压里；40 atm 把磷的蒸气压压住，化学计量才不会
   * 偏。本层用 `plant/inp-crystal-grower` 原位合成，再在同一台设备里
   * 换成 LEC 拉晶。
   */
  {
    id: 'mat/inp-polycrystal',
    name: 'Indium Phosphide Polycrystal', name_zh: '磷化铟多晶',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 99.99, max: 99.999, unit: '%', dir: 'atLeast' }],
  },

  /**
   * 磷化铟单晶（InP，4N5–5N）。LEC 拉出的 2 英寸锭，B₂O₃ 液封。
   *
   * 规格：
   *   EPD                ≤1×10⁵ cm⁻²（设计目标；LEC 典型 1×10⁴–1×10⁵）
   *   diameter           50.8 mm（2 英寸）
   *   length             80–150 mm
   *   carrierConcentration 1×10¹⁷–1×10¹⁸ cm⁻³（n 型，S 掺杂）
   */
  {
    id: 'mat/inp-single-crystal',
    name: 'Indium Phosphide Single Crystal', name_zh: '磷化铟单晶',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'epd', kind: 'range', min: 0, max: 1e5, unit: 'cm⁻²', dir: 'atMost' },
      { param: 'diameter', kind: 'range', min: 50.8, max: 50.8, unit: 'mm' },
      { param: 'length', kind: 'range', min: 80, max: 150, unit: 'mm' },
      { param: 'carrierConcentration', kind: 'range', min: 1e17, max: 1e18, unit: 'cm⁻³' },
    ],
  },

  /**
   * 2 英寸 InP 衬底（n 型，S 掺杂）。单面抛光/双面抛光按需，本文件按
   * 双面抛光写。
   *
   * 规格：
   *   diameter    50.8 mm
   *   thickness   350–500 µm
   *   EPD         ≤1×10⁵ cm⁻²
   *   TTV         ≤10 µm
   *   orientation (100) 偏 (110) 2°
   */
  {
    id: 'std/inp-substrate-general',
    name: '2-Inch InP Substrate', name_zh: '2 英寸 InP 衬底',
    unit: '片',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 50.8, max: 50.8, unit: 'mm' },
      { param: 'thickness', kind: 'range', min: 350, max: 500, unit: 'µm' },
      { param: 'epd', kind: 'range', min: 0, max: 1e5, unit: 'cm⁻²', dir: 'atMost' },
      { param: 'ttv', kind: 'range', min: 0, max: 10, unit: 'µm', dir: 'atMost' },
      { param: 'orientation', kind: 'enum', values: ['(100) 2°→(110)'] },
      { param: 'carrierConcentration', kind: 'range', min: 1e17, max: 1e18, unit: 'cm⁻³' },
    ],
  },

  /**
   * InGaAs 外延片。2 英寸 InP 衬底上长 n-InP 缓冲（0.5 µm）/
   * i-InGaAs 吸收（2–3 µm）/ n-InP 帽层（0.5 µm）。
   *
   * p 层**不在 MOCVD 里长**：外延片是 n-i-n 结构，p-InP 窗口由后面的
   * Zn 扩散做出来（500–600 °C、30–60 min，Zn 源 `mat/zinc`）。这样
   * 不需要 Zn 的金属有机源，也不需要把 p 型掺杂剂带进 MOCVD 气路。
   *
   * 规格：
   *   absorptionThickness 2–3 µm
   *   composition         x = 0.45–0.49（In₁₋ₓGaₓAs，匹配 InP）
   *   doping              1×10¹⁵–1×10¹⁶ cm⁻³（i 层）
   *   uniformity          ≤3 %
   */
  {
    id: 'mat/ingaas-epi-wafer',
    name: 'InGaAs Epi Wafer', name_zh: 'InGaAs 外延片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'absorptionThickness', kind: 'range', min: 2, max: 3, unit: 'µm' },
      { param: 'composition', kind: 'range', min: 0.45, max: 0.49, unit: 'x' },
      { param: 'doping', kind: 'range', min: 1e15, max: 1e16, unit: 'cm⁻³' },
      { param: 'uniformity', kind: 'range', min: 0, max: 3, unit: '%', dir: 'atMost' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 3. 设备
  // ───────────────────────────────────────────────────────────────────────

  /**
   * 高压 LEC 单晶炉。**holds：1000–1150 °C、1000–5100 kPa（10–50 atm）。**
   *
   * 结构：φ150 mm 高压不锈钢腔（壁厚 30 mm）→ 石墨/碳化硅加热体 →
   * 石英坩埚（外套石墨托）→ 籽晶杆/提拉头 → B₂O₃ 加料器 →
   * 压力控制与泄放。原位合成 InP 多晶，再换籽晶拉单晶。
   *
   * 为什么是 10–50 atm：InP 熔体上方的磷蒸气压在 1062 °C 约 27 atm，
   * 低于 10 atm 磷会从熔体跑掉，化学计量偏；高于 50 atm 石英坩埚
   * 的寿命掉得快。40 atm 是合成，20–40 atm 是拉晶。
   */
  {
    id: 'plant/inp-crystal-grower',
    name: 'High-Pressure LEC Crystal Grower', name_zh: '高压 LEC 单晶炉',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 1000, max: 1150 },
      { param: 'pressure', min: 1000, max: 5100 },
    ],
    props: [
      { param: 'maxTemperature', kind: 'range', min: 1100, max: 1150, unit: '°C' },
      { param: 'maxPressure', kind: 'range', min: 4000, max: 5100, unit: 'kPa' },
      { param: 'crucibleDiameter', kind: 'range', min: 75, max: 100, unit: 'mm' },
      { param: 'pullRate', kind: 'range', min: 1, max: 10, unit: 'mm/h' },
      { param: 'temperatureUniformity', kind: 'range', min: 0, max: 5, unit: '°C', dir: 'atMost' },
    ],
  },

  /** 高压腔体。φ150 mm 内径、30 mm 壁厚、40 atm 设计压力；40Cr 锻件 + 316L 内衬。 */
  {
    id: 'plant/inp-crystal-grower/chamber',
    name: 'High-Pressure LEC Crystal Grower High-Pressure Chamber', name_zh: '高压 LEC 单晶炉高压腔体',
    unit: '件',
    category: 'part',
    props: [
      { param: 'innerDiameter', kind: 'range', min: 150, max: 150, unit: 'mm' },
      { param: 'wallThickness', kind: 'range', min: 30, max: 30, unit: 'mm' },
      { param: 'maxPressure', kind: 'range', min: 4000, max: 5100, unit: 'kPa' },
    ],
  },

  /** 石墨/碳化硅加热体。φ120 × 150 mm 筒形，2–3 区，10–20 kW。 */
  {
    id: 'plant/inp-crystal-grower/heater',
    name: 'Graphite/Silicon Carbide Heating Element', name_zh: '石墨/碳化硅加热体',
    unit: '件',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 10, max: 20, unit: 'kW' },
      { param: 'zones', kind: 'range', min: 2, max: 3, unit: '区' },
    ],
  },

  /**
   * 石英坩埚。φ75–100 mm，壁厚 3–5 mm；内壁先涂 B₂O₃ 再装料。
   *
   * ⚠️ **这是降级，不是工业标准。** InP LEC 的工业坩埚是热解氮化硼
   * （PBN）：它不被 InP 浸润、不引入 Si/O。本层没有 BN 路线，用石英
   * 代替；石英在 1050–1100 °C 被 InP 侵蚀，寿命 1–2 炉，Si 会进熔体
   * （掺杂浓度 10¹⁶–10¹⁷ cm⁻³ 量级）。升级要 `mat/boron-nitride`
   * （B + N，缺口 1 条路线）与 PBN 坩埚的 CVD 沉积；本文件不假装完成。
   */
  {
    id: 'plant/inp-crystal-grower/crucible',
    name: 'High-Pressure LEC Crystal Grower Quartz Crucible', name_zh: '高压 LEC 单晶炉石英坩埚',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 75, max: 100, unit: 'mm' },
      { param: 'height', kind: 'range', min: 100, max: 150, unit: 'mm' },
    ],
  },

  /** 提拉头。籽晶夹 + 软轴 + 称重/位移；1–10 mm/h、5–30 rpm。 */
  {
    id: 'plant/inp-crystal-grower/pull-head',
    name: 'High-Pressure LEC Crystal Grower Pull Head', name_zh: '高压 LEC 单晶炉提拉头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'pullRate', kind: 'range', min: 1, max: 10, unit: 'mm/h' },
      { param: 'rotation', kind: 'range', min: 5, max: 30, unit: 'rpm' },
    ],
    composedOf: [
      { item: 'plant/inp-crystal-grower/pull-head/shaft', qty: q(1) },
      { item: 'std/bearing-spindle-p5', qty: q(1) },
      { item: 'std/motor-7.5kw-4p', qty: q(1) },
    ],
  },

  /** 压力控制。B₂O₃ 加料器 + 电容薄膜规 + 泄放阀；1000–5100 kPa、±2 %。 */
  {
    id: 'plant/inp-crystal-grower/pressure-control',
    name: 'High-Pressure LEC Crystal Grower Pressure Control', name_zh: '高压 LEC 单晶炉压力控制',
    unit: '件',
    category: 'part',
    props: [
      { param: 'pressureRange', kind: 'range', min: 1000, max: 5100, unit: 'kPa' },
      { param: 'accuracy', kind: 'range', min: 0, max: 2, unit: '%', dir: 'atMost' },
    ],
    composedOf: [
      { item: 'plant/inp-crystal-grower/pressure-control/manometer', qty: q(1) },
      { item: 'plant/inp-crystal-grower/pressure-control/feeder', qty: q(1) },
      { item: 'plant/inp-crystal-grower/pressure-control/relief-valve', qty: q(1) },
      { item: 'plant/inp-crystal-grower/pressure-control/manifold', qty: q(1) },
    ],
  },

  /**
   * MOCVD 反应室。**holds：500–700 °C、6–14 kPa（50–100 Torr）。**
   *
   * 结构：水平/垂直冷壁石英-不锈钢腔 → 石墨基座（SiC 涂层）→
   * RF 感应/电阻加热 → TMIn/TMGa 鼓泡器 + PH₃/AsH₃/H₂ 气路 →
   * 干泵 + 节流阀 + 压力计 → 尾气洗涤。
   *
   * 生长温度 500–700 °C 是 InGaAs/InP 的 MOCVD 窗口：低于 500 °C
   * 源不完全分解、碳沾污高；高于 700 °C 铟的解吸与互扩散把界面弄糊。
   */
  {
    id: 'plant/mocvd-reactor',
    name: 'MOCVD Reactor', name_zh: 'MOCVD 反应室',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 500, max: 700 },
      { param: 'pressure', min: 6, max: 14 },
    ],
    props: [
      { param: 'temperatureUniformity', kind: 'range', min: 0, max: 5, unit: '°C', dir: 'atMost' },
      { param: 'pressureAccuracy', kind: 'range', min: 0, max: 2, unit: '%', dir: 'atMost' },
      { param: 'growthRate', kind: 'range', min: 0.5, max: 2, unit: 'µm/h' },
      { param: 'waferCapacity', kind: 'range', min: 3, max: 3, unit: '片' },
      { param: 'layerUniformity', kind: 'range', min: 0, max: 3, unit: '%', dir: 'atMost' },
    ],
  },

  /** MOCVD 腔体。φ300 × 600 mm，316L 水冷夹套 + 石英内衬 + 观察窗。 */
  {
    id: 'plant/mocvd-reactor/chamber',
    name: 'MOCVD Chamber', name_zh: 'MOCVD 腔体',
    unit: '件',
    category: 'part',
    props: [
      { param: 'innerDiameter', kind: 'range', min: 300, max: 300, unit: 'mm' },
      { param: 'length', kind: 'range', min: 600, max: 600, unit: 'mm' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-6, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /** 石墨基座（SiC 涂层）。φ100–120 mm，承 3 片 2 英寸；±5 °C。 */
  {
    id: 'plant/mocvd-reactor/susceptor',
    name: 'MOCVD Graphite Susceptor', name_zh: 'MOCVD 石墨基座',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 100, max: 120, unit: 'mm' },
      { param: 'temperatureUniformity', kind: 'range', min: 0, max: 5, unit: '°C', dir: 'atMost' },
    ],
  },

  /** 感应/电阻加热体。5–10 kW，2–3 区。 */
  {
    id: 'plant/mocvd-reactor/heater',
    name: 'MOCVD Induction/Resistance Heater', name_zh: 'MOCVD 感应/电阻加热体',
    unit: '件',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 5, max: 10, unit: 'kW' },
      { param: 'zones', kind: 'range', min: 2, max: 3, unit: '区' },
    ],
  },

  /** 金属有机源鼓泡器。0.5–2 L 不锈钢瓶，20–40 °C 恒温；TMIn 是固体，用 40–60 °C。 */
  {
    id: 'plant/mocvd-reactor/bubbler',
    name: 'MOCVD Metal-Organic Source Bubbler', name_zh: 'MOCVD 金属有机源鼓泡器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 0.5, max: 2, unit: 'L' },
      { param: 'temperature', kind: 'range', min: 20, max: 60, unit: '°C' },
    ],
  },

  /**
   * PECVD 反应室。**holds：200–400 °C、0.01–0.5 kPa。**
   *
   * 结构：φ300 × 400 mm 腔 → 喷淋头（showerhead）→ 基座加热 →
   * SiH₄/NH₃/N₂ 气路 → 干泵/节流阀/压力计 → RF 13.56 MHz。
   *
   * 250–350 °C 是 InGaAs 器件钝化的上限：再高，欧姆接触的 AuGe 会球化、
   * 光刻胶残碳会进 SiNx。PECVD 的氢含量比 LPCVD 高，但 300 °C 的
   * SiNx 折射率 1.9–2.1，正好做 1.55 µm 的 λ/4 减反射膜。
   */
  {
    id: 'plant/pecvd-reactor',
    name: 'PECVD Reactor', name_zh: 'PECVD 反应室',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 200, max: 400 },
      { param: 'pressure', min: 0.01, max: 0.5 },
    ],
    props: [
      { param: 'temperatureUniformity', kind: 'range', min: 0, max: 5, unit: '°C', dir: 'atMost' },
      { param: 'pressureAccuracy', kind: 'range', min: 0, max: 2, unit: '%', dir: 'atMost' },
      { param: 'filmUniformity', kind: 'range', min: 0, max: 3, unit: '%', dir: 'atMost' },
      { param: 'power', kind: 'range', min: 100, max: 600, unit: 'W', dir: 'atLeast' },
    ],
  },

  /** PECVD 腔体。φ300 × 400 mm，316L + 石英内衬。 */
  {
    id: 'plant/pecvd-reactor/chamber',
    name: 'PECVD Chamber', name_zh: 'PECVD 腔体',
    unit: '件',
    category: 'part',
    props: [
      { param: 'innerDiameter', kind: 'range', min: 300, max: 300, unit: 'mm' },
      { param: 'length', kind: 'range', min: 400, max: 400, unit: 'mm' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-6, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /** 喷淋头。φ200–250 mm，100–500 个 φ0.3 mm 孔；气流均匀性靠孔板压降。 */
  {
    id: 'plant/pecvd-reactor/showerhead',
    name: 'PECVD Showerhead', name_zh: 'PECVD 喷淋头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 200, max: 250, unit: 'mm' },
      { param: 'holes', kind: 'range', min: 100, max: 500, unit: '个' },
    ],
  },

  /** PECVD 基座加热。1–3 kW，200–400 °C。 */
  {
    id: 'plant/pecvd-reactor/heater',
    name: 'PECVD Susceptor Heating', name_zh: 'PECVD 基座加热',
    unit: '件',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 1, max: 3, unit: 'kW' },
      { param: 'temperature', kind: 'range', min: 200, max: 400, unit: '°C' },
    ],
  },

  /**
   * 划片机。**不是线锯**：线锯切整根锭，划片机把外延片切成 1.2 mm 的管芯。
   *
   * 结构：空气轴承主轴（10 000–40 000 rpm）+ 金刚石镍刀片（φ50–60 mm、
   * 厚 30–50 µm）+ X-Y 工作台（1–5 µm）+ 显微镜 + 冷却水。
   */
  {
    id: 'plant/dicing-saw',
    name: 'Dicing Saw', name_zh: '划片机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'bladeSpeed', kind: 'range', min: 10000, max: 40000, unit: 'rpm' },
      { param: 'kerf', kind: 'range', min: 30, max: 50, unit: 'µm', dir: 'atMost' },
      { param: 'positioning', kind: 'range', min: 1, max: 5, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * 精密主轴。10 000–40 000 rpm，径向跳动 ≤2 µm。
   *
   * 原注释写“空气轴承”，但实际路线是成对 P5 滚动轴承预紧；这里按路线改正。
   * 组成件与子路线见 `data/machine/mech-dicing-spindle.ts`。
   */
  {
    id: 'plant/dicing-saw/spindle',
    name: 'Dicing Saw Precision Spindle', name_zh: '划片机精密主轴',
    unit: '件',
    category: 'part',
    props: [
      { param: 'speed', kind: 'range', min: 10000, max: 40000, unit: 'rpm' },
      { param: 'runout', kind: 'range', min: 0, max: 2, unit: 'µm', dir: 'atMost' },
    ],
    composedOf: [
      { item: 'plant/dicing-saw/spindle/shaft', qty: q(1) },
      { item: 'std/bearing-spindle-p5', qty: q(2) },
      { item: 'std/motor-7.5kw-4p', qty: q(1) },
    ],
  },

  /** 金刚石镍刀片。φ50–60 mm、厚 30–50 µm，镍电镀把金刚石粉粘在刃口。 */
  {
    id: 'plant/dicing-saw/blade',
    name: 'Dicing Saw Diamond Nickel Blade', name_zh: '划片机金刚石镍刀片',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 50, max: 60, unit: 'mm' },
      { param: 'thickness', kind: 'range', min: 0.03, max: 0.05, unit: 'mm' },
    ],
  },

  /** X-Y 工作台。100–150 mm 行程，1–5 µm 定位；丝杠 + 消隙螺母，定位用千分尺校。 */
  {
    id: 'plant/dicing-saw/stage',
    name: 'X-Y Table', name_zh: 'X-Y 工作台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'travel', kind: 'range', min: 100, max: 150, unit: 'mm' },
      { param: 'positioning', kind: 'range', min: 1, max: 5, unit: 'µm', dir: 'atMost' },
    ],
    composedOf: [
      { item: 'plant/dicing-saw/stage/table', qty: q(1) },
      { item: 'plant/dicing-saw/stage/lead-screw', qty: q(2) },
      { item: 'plant/dicing-saw/stage/anti-backlash-nut', qty: q(2) },
      { item: 'std/bearing-general-p0', qty: q(4) },
    ],
  },

  /** 对准显微镜。50–200×，同轴光 + 十字线。 */
  {
    id: 'plant/dicing-saw/microscope',
    name: 'Dicing Saw Alignment Microscope', name_zh: '划片机对准显微镜',
    unit: '件',
    category: 'part',
    props: [{ param: 'magnification', kind: 'range', min: 50, max: 200, unit: '×' }],
  },

  /**
   * 光栅单色仪。**800–1800 nm、2–10 nm 分辨率、f = 500 mm。**
   *
   * 用 `plant/refractometer` 的既有镜/缝/斩波器/镜体，另做一块
   * 600 线/mm、100–200 nm 槽深、镀金的平面光栅；测微头 + 正弦杆扫描。
   * 它不是“光谱仪整机”，是**把宽带光变成单色光**的那一段；探测器
   * 另接热电堆或待测管。
   */
  {
    id: 'plant/monochromator',
    name: 'Grating Monochromator', name_zh: '光栅单色仪',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'wavelengthRange', kind: 'range', min: 800, max: 1800, unit: 'nm' },
      { param: 'measure/resolution', kind: 'range', min: 2, max: 10, unit: 'nm', dir: 'atMost' },
      { param: 'focalLength', kind: 'range', min: 500, max: 500, unit: 'mm' },
      { param: 'strayLight', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /** 600 线/mm 平面光栅。30 × 30 mm，槽深 100–200 nm，镀金 100 nm。 */
  {
    id: 'plant/monochromator/grating',
    name: '600 Lines/mm Plane Grating', name_zh: '600 线/mm 平面光栅',
    unit: '件',
    category: 'part',
    props: [
      { param: 'linesPerMM', kind: 'range', min: 600, max: 600, unit: '线/mm' },
      { param: 'grooveDepth', kind: 'range', min: 100, max: 200, unit: 'nm' },
      { param: 'width', kind: 'range', min: 30, max: 30, unit: 'mm' },
      { param: 'height', kind: 'range', min: 30, max: 30, unit: 'mm' },
      { param: 'efficiency', kind: 'range', min: 0.05, max: 0.15, unit: '一级衍射效率' },
    ],
  },

  /**
   * 皮安表。**1×10⁻¹³–1×10⁻³ A、分辨 1×10⁻¹⁵ A。**
   *
   * 借用 `plant/cmos-test/parameter-analyzer` 的 femto 前端与 24 位 ADC，
   * 加屏蔽箱与数字表。暗电流 5 nA 的判据有 5000 倍余量；1 pA 的
   * 分辨是设计值，没有标准电流源溯源（用 100 GΩ 电阻 + 1 V 做
   * 10 pA 的替代标定）。
   */
  {
    id: 'plant/picoammeter',
    name: 'Picoammeter', name_zh: '皮安表',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'currentRange', kind: 'range', min: 1e-13, max: 1e-3, unit: 'A' },
      { param: 'measure/resolution', kind: 'range', min: 1e-15, max: 1e-15, unit: 'A', dir: 'atMost' },
      { param: 'measure/accuracy', kind: 'range', min: 0.1, max: 2, unit: '%', dir: 'atMost' },
      { param: 'measure/bandwidth', kind: 'range', min: 0, max: 1000, unit: 'Hz', dir: 'atLeast' },
      // 板级漏电的窗口：1 nA 档准确度 1–20 pA；0.1–10 nA 覆盖 O(1 nA) 的读数
      { param: 'measure/leakage', kind: 'range', min: 0.1, max: 10, unit: 'nA' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 4. 封装与标准探测器
  // ───────────────────────────────────────────────────────────────────────

  /** TO-46 窗片。φ2.5–3.0 mm、厚 0.3–0.5 mm 的硼硅玻璃，双面抛光，1.55 µm 透过 ≥92 %。 */
  {
    id: 'std/to-window-glass-general',
    name: 'TO-46 Window', name_zh: 'TO-46 窗片',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 2.5, max: 3.0, unit: 'mm' },
      { param: 'thickness', kind: 'range', min: 0.3, max: 0.5, unit: 'mm' },
      { param: 'transmission', kind: 'range', min: 90, max: 95, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * TO-46 封装。钢帽开 φ2.5 mm 窗 → 玻璃-金属封接 → 三根引线 →
   * 检漏。它给的是“气密 + 可焊 + 能装窗”，不是塑料封装。
   */
  {
    id: 'std/to-package-46',
    name: 'TO-46 Package', name_zh: 'TO-46 封装',
    unit: '套',
    category: 'part',
    props: [
      { param: 'packageType', kind: 'enum', values: ['TO-46'] },
      { param: 'windowDiameter', kind: 'range', min: 2.5, max: 3.0, unit: 'mm' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-9, unit: 'Pa·m³/s', dir: 'atMost' },
    ],
  },

  /**
   * 标准探测器：金黑吸收腔 + 25 对铜-铁热电堆。**0.3–20 µm 平坦响应。**
   *
   * 为什么是它而不是另一只 InGaAs 管：光谱响应要的是**绝对功率**，
   * 不是另一只同型号管子的相对曲线。金黑在 0.3–20 µm 吸收 >95 %，
   * 热电堆的响应与波长无关；用斩波 + 锁相读 µV 级热电势。
   *
   * 规格：
   *   responsivity  0.2–0.5 V/W（设计值，按电功率替代标定）
   *   spectralRange 0.3–20 µm
   *   timeConstant  0.5–1.5 s
   *   activeArea    4–9 mm²
   */
  {
    id: 'std/thermopile-detector-general',
    name: 'Standard Detector', name_zh: '标准探测器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'responsivity', kind: 'range', min: 0.1, max: 1, unit: 'V/W', dir: 'atLeast' },
      { param: 'spectralRange', kind: 'range', min: 0.3, max: 20, unit: 'µm' },
      { param: 'timeConstant', kind: 'range', min: 0.1, max: 2, unit: 's', dir: 'atMost' },
      { param: 'activeArea', kind: 'range', min: 4, max: 9, unit: 'mm²' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线
// ═══════════════════════════════════════════════════════════════════════════

export const INGAAS_ROUTES: readonly Route[] = [
  // ───────────────────────────────────────────────────────────────────────
  // 1. 金属：In / Ga / Ge / As
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * **铟：锌浸出液 → 锌粉置换 → 电解精炼。**
     *
     *   硫酸锌溶液 1000（90 ppm In = 0.09 kg）+ 锌粉 0.0769
     *     → 铟 0.09 + 贫铟硫酸锌溶液 999.9869
     *
     * 置换：2 In³⁺ + 3 Zn → 2 In + 3 Zn²⁺，锌粉把铟从硫酸锌里换出来；
     * 0.09 kg In 要 3/2 × 65.38/114.82 × 0.09 = 0.0769 kg Zn。锌进溶液，
     * 所以溶液质量从 1000 变成 999.9869（少了铟、多了锌，净 −0.0131）。
     *
     * 海綿铟用碱洗去锌/镉，压团，再在硫酸盐槽里电解到 4N5；50–60 °C
     * 是 `plant/electrorefining` 的下沿。90 ppm 是设计值，没有溶液化验。
     */
    id: 'make/indium',
    name: 'Indium Production', name_zh: '铟制备',
    produces: [
      {
        item: 'mat/indium',
        qty: q(9, 100),
        gives: [{ param: 'purity', kind: 'range', min: 99.99, max: 99.999 }],
      },
      {
        item: 'mat/zinc-sulfate',
        qty: q(9999869, 10000),
        gives: [{ param: 'zn', kind: 'range', min: 120, max: 140 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/zinc-sulfate', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/zinc', qty: q(769, 10000) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '锌粉置换：50–60 °C、100–300 kPa，搅拌 2 h；铟以海綿状析出，锌进溶液',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 50, max: 60 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      { note_zh: '碱洗、压团、装阳极袋', performedBy: 'plant/robot' },
      {
        note_zh: '电解精炼：硫酸铟槽，50–60 °C，阴极 4N5；电流效率按 90 % 记，金属不丢',
        performedBy: 'plant/electrorefining',
        under: [{ param: 'temperature', min: 50, max: 60 }],
      },
    ],
    rate: { hours: q(12) },
  },

  {
    /**
     * **镓：同一股锌浸出液的 50 ppm，树脂吸附 → 电解。**
     *
     *   硫酸锌溶液 10000（50 ppm Ga = 0.5 kg）+ 氢氧化钠 1
     *     → 镓 0.5 + 贫镓硫酸锌溶液 10000.5
     *
     * 镓在硫酸锌里以 Ga³⁺ 存在；螯合/阳离子树脂吸附，NaOH 解吸成
     * 镓酸钠，电解得 4N5。10000 kg 溶液对应 0.5 kg Ga，是“副产”的量级：
     * 锌厂每天几千吨溶液，镓只是其中 50 ppm。
     *
     * ⚠️ 本层铝走酸法、没有拜耳母液，所以镓走锌渣这条次要来源；
     * 地球 80–90 % 的镓仍从拜耳母液来。这是来源降级，不是不能做。
     */
    id: 'make/gallium',
    name: 'Gallium Production', name_zh: '镓制备',
    produces: [
      {
        item: 'mat/gallium',
        qty: q(1, 2),
        gives: [{ param: 'purity', kind: 'range', min: 99.99, max: 99.999 }],
      },
      {
        item: 'mat/zinc-sulfate',
        qty: q(20001, 2),
        gives: [{ param: 'zn', kind: 'range', min: 120, max: 140 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/zinc-sulfate', qty: q(10000) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1) }] },
    ],
    needs: ['mat/cation-resin'],
    steps: [
      {
        note_zh: '树脂吸附/解吸：20–60 °C、100–300 kPa；NaOH 把 Ga 从树脂上洗成镓酸钠',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh: '电解：50–60 °C，阴极镓；4N5 是设计值，6N 要区熔（缺口 10 倍杂质）',
        performedBy: 'plant/electrorefining',
        under: [{ param: 'temperature', min: 50, max: 60 }],
      },
    ],
    rate: { hours: q(24) },
  },

  {
    /**
     * **锗：锌浸出液 → 沉锗 → 氯化蒸馏 → 水解 → 氢还原 → 区熔。**
     *
     *   锌浸出液 1511 + 盐酸 200 + 氯 150 + 氢 10 + 碳 20 + 水 1000
     *     → 锗 0.04
     *
     * 数字沿用 `uhf-pd.ts` 的 `make/germanium`：1511 kg 溶液按 33 ppm Ge
     * 含 0.05 kg，80 % 收率交 0.04 kg。只服务 AuGe/Ni/Au 的几毫克，
     * 一批够几千只器件。
     *
     * 质量不守恒（进 2891 kg，出 0.04 kg）：余是氯化物/水解废液与尾渣，
     * 本层未逐项建条目，所以显式声明。
     */
    id: 'make/germanium-metal',
    name: 'Germanium for Ohmic Contacts Production', name_zh: '欧姆接触用锗制备',
    produces: [
      {
        item: 'mat/germanium-metal',
        qty: q(1, 25),
        gives: [{ param: 'purity', kind: 'range', min: 99.99, max: 99.999 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/zinc-sulfate', qty: q(1511) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(200) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(150) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(10) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1000) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '沉锗：60–90 °C、100–300 kPa，单宁/碱中和，Ge 共沉进渣',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 60, max: 90 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh: '氯化蒸馏：GeO₂ + 4HCl → GeCl₄ + 2H₂O，GeCl₄ bp 83 °C；60–90 °C、5–30 kPa',
        performedBy: 'plant/vacuum-column',
        under: [
          { param: 'temperature', min: 60, max: 90 },
          { param: 'pressure', min: 5, max: 30 },
        ],
      },
      {
        note_zh: '水解：GeCl₄ + 2H₂O → GeO₂ + 4HCl，洗到 Cl⁻ <10 ppm',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh: '氢还原：GeO₂ + 2H₂ → Ge + 2H₂O，600–700 °C',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 600, max: 700 }],
      },
      {
        note_zh: '区熔：900–950 °C、5–10 次，电阻率 ≥10 Ω·cm；切锭、酸洗',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 900, max: 950 }],
      },
    ],
    rate: { hours: q(80) },
    unbalanced_zh:
      '锌浸出液 1511 + 盐酸 200 + 氯 150 + 氢 10 + 碳 20 + 水 1000 = 2891 kg → 锗 0.04 kg；0.05 kg 是 1511 kg × 33 ppm 的化学计量，0.04 kg 是 80 % 收率；余是氯化物/水解废液与尾渣（未逐项建条目）',
  },

  {
    /**
     * **砷：锌精矿焙烧 → As₂O₃ 烟尘 → 碳还原 → 单质砷。**
     *
     *   锌精矿 1000（0.2 % As = 2 kg）+ 氧 404.4 + 碳 0.5
     *     → 砷 2 + 氧化锌 863.2 + SO₂ 538.9 + CO 1.12
     *
     * 焙烧：ZnS + 1.5 O₂ → ZnO + SO₂；As 被氧化成 As₂O₃ 进烟尘。
     * 还原：As₂O₃ + 3 C → 2 As + 3 CO，700–800 °C、无氧。
     *
     * 2 kg As 要 2.64 kg As₂O₃、0.48 kg C；产物 2 kg As + 1.12 kg CO。
     * 氧化锌 863.2 kg = ZnO 684.6 + 脉石 178.6。进出差 0.3 kg 是
     * 四舍五入与烟尘损失，显式声明。
     */
    id: 'make/arsenic',
    name: 'Arsenic Production', name_zh: '砷制备',
    produces: [
      {
        item: 'mat/arsenic',
        qty: q(2),
        gives: [{ param: 'purity', kind: 'range', min: 99.5, max: 99.9 }],
      },
      {
        item: 'mat/zinc-oxide',
        qty: q(4316, 5),
        gives: [{ param: 'zno', kind: 'range', min: 78, max: 80 }],
      },
      { item: 'mat/so2', qty: q(5389, 10) },
      {
        item: 'mat/co',
        qty: q(28, 25),
        gives: [{ param: 'purity', kind: 'range', min: 60, max: 85 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/zinc-concentrate', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(2022, 5) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 2) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '焙烧：900–1000 °C，ZnS → ZnO + SO₂，As → As₂O₃ 进烟尘；烟尘单独收',
        performedBy: 'plant/roaster',
        under: [{ param: 'temperature', min: 900, max: 1000 }],
      },
      {
        note_zh: '碳还原：As₂O₃ + 3C → 2As + 3CO，700–800 °C、氧 ≤50 ppm',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 700, max: 800 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      { note_zh: '冷凝、升华精制、铸锭（灰砷）', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      '锌精矿 1000 + 氧 404.4 + 碳 0.5 = 1404.9 kg → 砷 2 + 氧化锌 863.2 + SO₂ 538.9 + CO 1.12 = 1405.22 kg；③ 可接受：差 0.32 kg 是四舍五入/烟尘/渣，不建条目。砷 2 kg = 1000 kg × 0.2 %，As₂O₃ 2.64 kg、碳 0.48 kg',
  },

  // ───────────────────────────────────────────────────────────────────────
  // 2. 金属有机源与气体
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * **三氯化铟：铟 + 盐酸 → InCl₃ + H₂。**
     *
     *   铟 1000 + 盐酸 952.6 → 三氯化铟 1926.3 + 氢 26.3
     *
     * 2 In + 6 HCl → 2 InCl₃ + 3 H₂；60–80 °C、100–300 kPa 的湿法槽。
     * 盐酸按 100 % HCl 计（本层 `mat/hcl` 是 30–33 %，用量按净 HCl 折算），
     * 水与酸雾在废气/废液里，不进 kg 账。
     */
    id: 'make/indium-trichloride',
    name: 'Indium Trichloride Production', name_zh: '三氯化铟制备',
    produces: [
      {
        item: 'mat/indium-trichloride',
        qty: q(19263, 10),
        gives: [
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99 },
          { param: 'water', kind: 'range', min: 0, max: 0.5 },
        ],
      },
      {
        item: 'mat/hydrogen',
        qty: q(263, 10),
        gives: [{ param: 'purity', kind: 'range', min: 99, max: 99.9 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/indium', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(4763, 5) }] },
    ],
    needs: [],
    performedBy: 'plant/wet-bench',
    under: [
      { param: 'temperature', min: 60, max: 80 },
      { param: 'pressure', min: 100, max: 300 },
    ],
    rate: { hours: q(8) },
  },

  {
    /**
     * **三氯化镓：镓 + 盐酸 → GaCl₃ + H₂。**
     *
     *   镓 1000 + 盐酸 1568.8 → 三氯化镓 2525.4 + 氢 43.4
     *
     * 2 Ga + 6 HCl → 2 GaCl₃ + 3 H₂；60–80 °C、100–300 kPa。
     */
    id: 'make/gallium-trichloride',
    name: 'Gallium Trichloride Production', name_zh: '三氯化镓制备',
    produces: [
      {
        item: 'mat/gallium-trichloride',
        qty: q(12627, 5),
        gives: [
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99 },
          { param: 'water', kind: 'range', min: 0, max: 0.5 },
        ],
      },
      {
        item: 'mat/hydrogen',
        qty: q(217, 5),
        gives: [{ param: 'purity', kind: 'range', min: 99, max: 99.9 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/gallium', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(7844, 5) }] },
    ],
    needs: [],
    performedBy: 'plant/wet-bench',
    under: [
      { param: 'temperature', min: 60, max: 80 },
      { param: 'pressure', min: 100, max: 300 },
    ],
    rate: { hours: q(8) },
  },

  {
    /**
     * **三甲基铟：InCl₃ + 3 CH₃Cl + 3 Mg → TMIn + 3 MgCl₂。**
     *
     *   三氯化铟 1383 + 甲基氯 947 + 镁 456
     *     → 三甲基铟 1000 + 氯化镁 1786
     *
     * 格氏路径：Mg + CH₃Cl → CH₃MgCl（20–60 °C，乙醚）；再与 InCl₃
     * 在 20–60 °C 反应。乙醚不按批计（循环使用，补损在 unbalanced 外），
     * 所以质量账只算四样反应物/产物：2786 进、2786 出。
     *
     * 精馏在 40–80 °C、300–800 kPa 下切掉乙醚与低沸物；4N5 是设计值。
     */
    id: 'make/trimethyl-indium',
    name: 'Trimethylindium Production', name_zh: '三甲基铟制备',
    produces: [
      {
        item: 'mat/trimethyl-indium',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99 },
          { param: 'water', kind: 'range', min: 0, max: 0.001 },
        ],
      },
      {
        item: 'mat/magnesium-chloride',
        qty: q(1786),
        gives: [
          { param: 'purity', kind: 'range', min: 95, max: 98 },
          { param: 'water', kind: 'range', min: 0.5, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/indium-trichloride', qty: q(1383) }] },
      { anyOf: [{ item: 'mat/methyl-chloride', qty: q(947) }] },
      { anyOf: [{ item: 'mat/magnesium', qty: q(456) }] },
    ],
    needs: ['mat/diethyl-ether', 'plant/clean-room'],
    steps: [
      {
        note_zh: '格氏/烷基化：20–60 °C、100–300 kPa，乙醚中 Mg + CH₃Cl → CH₃MgCl，再与 InCl₃ 反应',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      { note_zh: '过滤 MgCl₂、回收乙醚（减压）', performedBy: 'plant/robot' },
      {
        note_zh: '低温精馏：40–80 °C、300–800 kPa，切乙醚/低沸物；4N5 是设计值，6N 另需深精馏',
        performedBy: 'plant/distillation-tower',
        under: [
          { param: 'temperature', min: 40, max: 80 },
          { param: 'pressure', min: 300, max: 800 },
        ],
      },
    ],
    rate: { hours: q(24) },
  },

  {
    /**
     * **三甲基镓：GaCl₃ + 3 CH₃Cl + 3 Mg → TMGa + 3 MgCl₂。**
     *
     *   三氯化镓 1533.5 + 甲基氯 1319.2 + 镁 634.9
     *     → 三甲基镓 1000 + 氯化镁 2487.6
     *
     * 与 TMIn 同一条格氏/精馏路径；TMGa bp 55.7 °C，精馏切割点更低。
     */
    id: 'make/trimethyl-gallium',
    name: 'Trimethylgallium Production', name_zh: '三甲基镓制备',
    produces: [
      {
        item: 'mat/trimethyl-gallium',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99 },
          { param: 'water', kind: 'range', min: 0, max: 0.001 },
        ],
      },
      {
        item: 'mat/magnesium-chloride',
        qty: q(24876, 10),
        gives: [
          { param: 'purity', kind: 'range', min: 95, max: 98 },
          { param: 'water', kind: 'range', min: 0.5, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/gallium-trichloride', qty: q(3067, 2) }] },
      { anyOf: [{ item: 'mat/methyl-chloride', qty: q(6596, 5) }] },
      { anyOf: [{ item: 'mat/magnesium', qty: q(6349, 10) }] },
    ],
    needs: ['mat/diethyl-ether', 'plant/clean-room'],
    steps: [
      {
        note_zh: '格氏/烷基化：20–60 °C、100–300 kPa，乙醚中 Mg + CH₃Cl → CH₃MgCl，再与 GaCl₃ 反应',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      { note_zh: '过滤 MgCl₂、回收乙醚（减压）', performedBy: 'plant/robot' },
      {
        note_zh: '低温精馏：40–80 °C、300–800 kPa；TMGa bp 55.7 °C，切乙醚/低沸物',
        performedBy: 'plant/distillation-tower',
        under: [
          { param: 'temperature', min: 40, max: 80 },
          { param: 'pressure', min: 300, max: 800 },
        ],
      },
    ],
    rate: { hours: q(24) },
  },

  {
    /**
     * **磷化氢：P₄ + 6 H₂ → 4 PH₃。**
     *
     *   磷 124 + 氢 12.1 → 磷化氢 136.1
     *
     * 300–350 °C、150–250 atm。高压把平衡推向 PH₃；`plant/autoclave`
     * 的 150–550 °C、100–350 atm 正好覆盖。产物经碱洗/干燥/冷凝进钢瓶。
     *
     * ⚠️ 这是**直接合成**，不是工业上更常见的磷化钙水解或黄磷+碱；
     * 直接合成在实验室可行、工业上因转化率低而少用。本层选它是因为
     * 它只用 P 与 H₂ 两样已有物料；转化率 60–80 % 的未反应气循环，
     * 本模型不记循环，所以按 100 % 计量、把代价记在 `rate` 与能耗上。
     */
    id: 'make/phosphine',
    name: 'Phosphine Production', name_zh: '磷化氢制备',
    produces: [
      {
        item: 'mat/phosphine',
        qty: q(1361, 10),
        gives: [
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99 },
          { param: 'water', kind: 'range', min: 0, max: 0.001 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/phosphorus', qty: q(124) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(121, 10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    performedBy: 'plant/autoclave',
    under: [
      { param: 'temperature', min: 300, max: 350 },
      { param: 'pressure', min: 15000, max: 25000 },
    ],
    rate: { hours: q(12) },
  },

  {
    /**
     * **砷化氢：2 As + 3 H₂ → 2 AsH₃。**
     *
     *   砷 150 + 氢 6.05 → 砷化氢 156.05
     *
     * 200–300 °C、150–250 atm。AsH₃ 在 300 °C 以上明显分解，所以温度
     * 比 PH₃ 低一档；高压 + 快速冷凝把产物带出平衡。
     */
    id: 'make/arsine',
    name: 'Arsine Production', name_zh: '砷化氢制备',
    produces: [
      {
        item: 'mat/arsine',
        qty: q(3121, 20),
        gives: [
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99 },
          { param: 'water', kind: 'range', min: 0, max: 0.001 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/arsenic', qty: q(150) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(121, 20) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    performedBy: 'plant/autoclave',
    under: [
      { param: 'temperature', min: 200, max: 300 },
      { param: 'pressure', min: 15000, max: 25000 },
    ],
    rate: { hours: q(12) },
  },

  {
    /**
     * **硅烷：4 SiHCl₃ → SiH₄ + 3 SiCl₄。**
     *
     *   三氯氢硅 1000 → 硅烷 59.3 + 四氯化硅 940.7
     *
     * 三氯氢硅的歧化在 60–80 °C、500–800 kPa 下用阴离子交换树脂催化；
     * 硅烷从塔顶走，SiCl₄ 从塔底回多晶硅链。1000 kg TCS 只出 59.3 kg
     * SiH₄，这是硅烷贵的原因，也是 PECVD 用量按克记的原因。
     */
    id: 'make/silane',
    name: 'Silane Production', name_zh: '硅烷制备',
    produces: [
      {
        item: 'mat/silane',
        qty: q(593, 10),
        gives: [
          { param: 'purity', kind: 'range', min: 99.9, max: 99.999 },
          { param: 'water', kind: 'range', min: 0, max: 0.0001 },
        ],
      },
      {
        item: 'mat/silicon-tetrachloride',
        qty: q(9407, 10),
        gives: [{ param: 'purity', kind: 'range', min: 95, max: 99 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/trichlorosilane-pure', qty: q(1000) }] }],
    needs: ['mat/cation-resin'],
    performedBy: 'plant/distillation-tower',
    under: [
      { param: 'temperature', min: 60, max: 80 },
      { param: 'pressure', min: 500, max: 800 },
    ],
    rate: { hours: q(12) },
  },

  {
    /**
     * **乙醚：2 C₂H₅OH → (C₂H₅)₂O + H₂O。**
     *
     *   乙醇 1000 → 乙醚 804.4 + 水 195.6
     *
     * 140–150 °C、硫酸催化；`plant/acid-plant` 的 20–500 °C、100–500 kPa
     * 覆盖。硫酸在 needs 里（催化/吸水，不按批计），精馏塔切乙醚/水。
     */
    id: 'make/diethyl-ether',
    name: 'Diethyl Ether Production', name_zh: '乙醚制备',
    produces: [
      {
        item: 'mat/diethyl-ether',
        qty: q(4022, 5),
        gives: [
          { param: 'purity', kind: 'range', min: 99, max: 99.9 },
          { param: 'water', kind: 'range', min: 0, max: 0.1 },
        ],
      },
      {
        item: 'mat/water',
        qty: q(978, 5),
        gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/ethanol', qty: q(1000) }] }],
    needs: ['mat/sulfuric-acid', 'plant/distillation-tower'],
    performedBy: 'plant/acid-plant',
    under: [
      { param: 'temperature', min: 140, max: 150 },
      { param: 'pressure', min: 100, max: 500 },
    ],
    rate: { hours: q(16) },
  },

  {
    /**
     * **无水氨：28 % 氨水 → 无水 NH₃ + 水。**
     *
     *   氨水 1000（28 % = 280 NH₃ + 720 H₂O）+ 氢氧化钠 1
     *     → 无水氨 280 + 水 721
     *
     * 40–80 °C、300–800 kPa 精馏；NaOH 作干燥剂。氨水浓度 25–30 %
     * 取 28 %，所以 1000 kg 出 280 kg NH₃；1 kg NaOH 进废水。
     */
    id: 'make/ammonia-anhydrous',
    name: 'Anhydrous Ammonia Production', name_zh: '无水氨制备',
    produces: [
      {
        item: 'mat/ammonia-anhydrous',
        qty: q(280),
        gives: [
          { param: 'purity', kind: 'range', min: 99.99, max: 99.999 },
          { param: 'water', kind: 'range', min: 0, max: 0.001 },
        ],
      },
      {
        item: 'mat/water',
        qty: q(721),
        gives: [{ param: 'conductivity', kind: 'range', min: 500, max: 1000 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ammonia', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/distillation-tower',
    under: [
      { param: 'temperature', min: 40, max: 80 },
      { param: 'pressure', min: 300, max: 800 },
    ],
    rate: { hours: q(12) },
  },

  {
    /**
     * **氧化硼：2 H₃BO₃ → B₂O₃ + 3 H₂O。**
     *
     *   硼酸 1000 → 氧化硼 563 + 水 437
     *
     * 400–500 °C 脱水；`plant/resistance-furnace` 的 100–1100 °C 覆盖。
     * 产物是玻璃状 B₂O₃，冷却后破碎成 5–20 mm 颗粒，供 LEC 液封。
     */
    id: 'make/boron-oxide',
    name: 'Boron Oxide Production', name_zh: '氧化硼制备',
    produces: [
      {
        item: 'mat/boron-oxide',
        qty: q(563),
        gives: [
          { param: 'purity', kind: 'range', min: 99, max: 99.9 },
          { param: 'water', kind: 'range', min: 0, max: 0.5 },
        ],
      },
      {
        item: 'mat/water',
        qty: q(437),
        gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/boric-acid', qty: q(1000) }] }],
    needs: [],
    performedBy: 'plant/resistance-furnace',
    under: [{ param: 'temperature', min: 400, max: 500 }],
    rate: { hours: q(12) },
  },

  // ───────────────────────────────────────────────────────────────────────
  // 3. 磷化铟：多晶、单晶、衬底
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * **InP 多晶：In + P → InP，1050–1100 °C、~40 atm。**
     *
     *   铟 787.6 + 磷 212.4 → 磷化铟 1000
     *
     * 化学计量：In 114.82 / InP 145.79 = 78.76 %；P 30.97 / 145.79 = 21.24 %。
     * 磷按 1–2 % 过量装料，过量部分在开炉时以 PH₃ 抽走，本账按化学计量。
     * 黄磷先真空干燥/升华，水不进安瓿（水在 1050 °C 会把 In 氧化成 In₂O₃）。
     *
     * 40 atm = 4053 kPa，落在 `plant/inp-crystal-grower` 的 1000–5100 kPa
     * 内。磷在 1050 °C 的蒸气压约 27 atm，40 atm 把磷压在熔体里；温度
     * 低于 1050 °C 合成不完全，高于 1100 °C 石英坩埚的侵蚀加快。
     */
    id: 'make/inp-polycrystal',
    name: 'InP Polycrystal Production', name_zh: 'InP 多晶制备',
    produces: [
      {
        item: 'mat/inp-polycrystal',
        qty: q(1000),
        gives: [{ param: 'purity', kind: 'range', min: 99.99, max: 99.999 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/indium', qty: q(3938, 5) }] },
      { anyOf: [{ item: 'mat/phosphorus', qty: q(1062, 5) }] },
    ],
    needs: ['plant/clean-room'],
    performedBy: 'plant/inp-crystal-grower',
    under: [
      { param: 'temperature', min: 1050, max: 1100 },
      { param: 'pressure', min: 3500, max: 4500 },
    ],
    rate: { hours: q(24) },
  },

  {
    /**
     * **LEC 单晶：多晶 1000 → 单晶 850 + 头尾料 150。**
     *
     * 液封直拉（LEC）：B₂O₃ 覆盖剂浮在 InP 熔体上（厚 10–20 mm），
     * 籽晶 <100> 接触熔体，1–10 mm/h 提拉，10–50 atm 压住磷。
     * 单晶 850 g 是 85 % 的成锭率；头尾料 150 g 回多晶。
     *
     * EPD 目标 ≤1×10⁵ cm⁻²：LEC 的位错主要来自籽晶与温度梯度；
     * B₂O₃ 液封把磷的挥发压住，化学计量比（P/In = 1）是低位错的前提。
     * B₂O₃ 覆盖剂 50–100 g/kg 装料（厚 10–20 mm），循环使用、补损 5–10 %；
     * 本模型把它记在 needs 里（不按批消耗），损失写在 `rate` 与废料里。
     * 本层没有 EPD 腐蚀坑计数的手段，EPD 是**设计值**，不是实测。
     */
    id: 'make/inp-single-crystal',
    name: 'LEC Single-Crystal Production', name_zh: 'LEC 单晶制备',
    produces: [
      {
        item: 'mat/inp-single-crystal',
        qty: q(85, 100),
        gives: [
          { param: 'epd', kind: 'range', min: 0, max: 1e5 },
          { param: 'diameter', kind: 'range', min: 50.8, max: 50.8 },
          { param: 'length', kind: 'range', min: 80, max: 150 },
          { param: 'carrierConcentration', kind: 'range', min: 1e17, max: 1e18 },
        ],
      },
      {
        item: 'mat/inp-polycrystal',
        qty: q(15, 100),
        gives: [{ param: 'purity', kind: 'range', min: 99.99, max: 99.999 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/inp-polycrystal', qty: q(1) }] }],
    needs: ['mat/boron-oxide', 'plant/clean-room'],
    performedBy: 'plant/inp-crystal-grower',
    under: [
      { param: 'temperature', min: 1050, max: 1100 },
      { param: 'pressure', min: 2000, max: 4000 },
    ],
    rate: { hours: q(48) },
  },

  {
    /**
     * **衬底：单晶 1 kg → 130 片 2 英寸片 + 切磨抛废料 0.428 kg。**
     *
     *   单晶 1 + 碳化硅浆料 0.2 + 胶体硅 0.02 + 超纯水 5
     *     → 衬底 130 片 + 尾料/废液 5.222
     *
     * 一片 2 英寸、450 µm 厚的 InP 重 π×(25.4 mm)²×0.45 mm×4.81 g/cm³
     * = 4.38 g。线锯切缝 0.2 mm、片厚 0.45 mm，1 kg 锭切 150 片，
     * 磨/抛再掉 20 片，交 130 片；切磨抛损失的 0.428 kg 进尾料。
     *
     * 出片是“片”，不是 kg，所以质量账不做断言；`unbalanced_zh` 写清
     * 每片的克数与去向。
     */
    id: 'make/inp-substrate',
    name: '2-Inch InP Substrate Manufacturing', name_zh: '2 英寸 InP 衬底制造',
    produces: [
      {
        item: 'std/inp-substrate-general',
        qty: q(130),
        gives: [
          { param: 'diameter', kind: 'range', min: 50.8, max: 50.8 },
          { param: 'thickness', kind: 'range', min: 350, max: 500 },
          { param: 'epd', kind: 'range', min: 0, max: 1e5 },
          { param: 'ttv', kind: 'range', min: 0, max: 10 },
          { param: 'orientation', kind: 'enum', oneOf: ['(100) 2°→(110)'] },
          { param: 'carrierConcentration', kind: 'range', min: 1e17, max: 1e18 },
        ],
      },
      { item: 'mat/tailings', qty: q(107, 250) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/inp-single-crystal', qty: q(1) }] },
      { anyOf: [{ item: 'mat/silicon-carbide', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/colloidal-silica', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(5) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      {
        note_zh: '线锯切片：导轮槽距 0.45 mm、切缝 0.2 mm，1 kg 锭挂 150 刀；切缝损失约 0.29 kg',
        performedBy: 'plant/wire-saw',
      },
      {
        note_zh: '研磨：去 40–60 µm 锯伤层，TTV 收到 ≤10 µm；边倒角',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: 'CMP：胶体硅浆料（pH 10–11）抛光 10–20 µm，Ra ≤1 nm；双面抛光',
        performedBy: 'plant/cmp-polisher',
      },
      {
        note_zh: '清洗/检验：超纯水冲洗、甩干；量厚度、TTV、EPD（EPD 无腐蚀坑计数手段，按设计值）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      '单晶 1 + 碳化硅 0.2 + 胶体硅 0.02 + 超纯水 5 = 6.22 kg → 衬底 130 片（每片 4.38 g，合计 0.569 kg）+ 尾料 0.428 kg + 废液/水 5.22 kg；出片按件计，质量账不做断言。切缝 0.2 mm、片厚 0.45 mm，1 kg 锭切 150 片，磨抛后交 130 片',
  },

  // ───────────────────────────────────────────────────────────────────────
  // 4. MOCVD 外延
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * **InGaAs/InP 外延：MOCVD，500–700 °C、50–100 Torr。**
     *
     *   衬底 1 片 + TMIn 0.05 g + TMGa 0.02 g + AsH₃ 0.05 g
     *     + PH₃ 0.02 g + H₂ 1 g + N₂ 0.5 g → 外延片 1 片
     *
     * 三层：
     *   n-InP 缓冲   0.5 µm，TMIn + PH₃
     *   i-InGaAs     2–3 µm，TMIn + TMGa + AsH₃（x = 0.45–0.49）
     *   n-InP 帽层   0.5 µm，TMIn + PH₃（n 型；p 层由后面的 Zn 扩散做，
     *                所以 MOCVD 气路里不需要 Zn 源）
     *
     * 2 英寸片面积 20.27 cm²；2.5 µm 的 InGaAs 体积 5.07×10⁻³ cm³、
     * 密度 5.5 g/cm³，重 0.028 g；加上 InP 层约 0.033 g。源按 20–30 %
     * 利用率、其余进尾气，所以投料 0.14 g 是 4 倍过量。
     *
     * 50–100 Torr = 6.7–13.3 kPa；低于 50 Torr 气相成核、高于 100 Torr
     * 边界层太厚、均匀性掉。500–700 °C 是 InGaAs 的 MOCVD 窗口。
     */
    id: 'make/ingaas-epi-wafer',
    name: 'InGaAs/InP Epitaxy', name_zh: 'InGaAs/InP 外延',
    produces: [
      {
        item: 'mat/ingaas-epi-wafer',
        qty: q(1),
        gives: [
          { param: 'absorptionThickness', kind: 'range', min: 2, max: 3 },
          { param: 'composition', kind: 'range', min: 0.45, max: 0.49 },
          { param: 'doping', kind: 'range', min: 1e15, max: 1e16 },
          { param: 'uniformity', kind: 'range', min: 0, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/inp-substrate-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/trimethyl-indium', qty: q(1, 20000) }] },
      { anyOf: [{ item: 'mat/trimethyl-gallium', qty: q(1, 50000) }] },
      { anyOf: [{ item: 'mat/arsine', qty: q(1, 20000) }] },
      { anyOf: [{ item: 'mat/phosphine', qty: q(1, 50000) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 2000) }] },
    ],
    needs: ['plant/clean-room'],
    performedBy: 'plant/mocvd-reactor',
    under: [
      { param: 'temperature', min: 600, max: 650 },
      { param: 'pressure', min: 7, max: 13 },
    ],
    rate: { hours: q(8) },
    unbalanced_zh:
      '衬底 1 片（4.4 g）+ TMIn 0.05 g + TMGa 0.02 g + AsH₃ 0.05 g + PH₃ 0.02 g + H₂ 1 g + N₂ 0.5 g → 外延片 1 片（外延层约 0.033 g，衬底 4.4 g）；源利用率 20–30 %，其余进尾气洗涤。出片按件计，质量账不做断言',
  },

  // ───────────────────────────────────────────────────────────────────────
  // 5. 器件：p-i-n 台面、钝化、接触、AR、划片、TO、测试
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * **InGaAs p-i-n 光电二极管：1 片外延片 → 300 只 TO-46 器件。**
     *
     * 工艺顺序（全部在洁净间内）：
     *   ① 清洗外延片
     *   ② Zn 扩散：500–600 °C、30–60 min，Zn 源 `mat/zinc`，形成 0.5–1 µm
     *      p-InP 窗口（外延片是 n-i-n；p 层靠扩散，不靠 MOCVD 掺杂）
     *   ③ 台面光刻（φ1.2 mm 圆，管芯 1.5×1.5 mm）
     *   ④ 台面腐蚀：HCl : H₂O₂ : H₂O = 1 : 1 : 8，20–40 °C，刻到 n-InP 缓冲
     *   ⑤ SiNx 钝化：PECVD 300 °C、200 nm
     *   ⑥ 开窗光刻 + SiNx 干法刻蚀：CF₄/O₂，5–20 Pa
     *   ⑦ p 面 Ti/Au（50/200 nm）蒸发
     *   ⑧ n 面 AuGe/Ni/Au（100/30/200 nm）蒸发
     *   ⑨ 欧姆合金：RTA 420 °C、60 s
     *   ⑩ AR 膜：PECVD SiNx 190 nm（1.55 µm 的 λ/4，n ≈ 2.0），光刻开焊盘窗
     *   ⑪ 划片：1.5×1.5 mm 管芯，刀缝 30–50 µm
     *   ⑫ 贴片/键合：AuSn 焊片 + φ25 µm 金丝
     *   ⑬ 封帽：TO-46 缝焊
     *   ⑭ 测试：暗电流（−5 V）、响应度（1.55 µm）、光谱响应（900–1700 nm）
     *
     * 一片 2 英寸片面积 20.27 cm²，1.5×1.5 mm 管芯 900 个；按 33 % 成品率
     * 交 300 只。成品率的分母是划片崩边、台面漏电、接触电阻与封帽废品；
     * 没有实测，按设计值记。
     *
     * 规格窗口（设计值）：
     *   wavelength    900–1700 nm（In₀.₅₃Ga₀.₄₇As 截止 1.7 µm）
     *   responsivity  0.8–1.1 A/W @ 1.55 µm（η ≈ 0.7–0.9）
     *   activeArea    0.5–1.0 mm²
     *   darkCurrent   ≤5 nA @ −5 V、25 °C
     *
     * ⚠️ 两处降级：
     *   ① TO 封装没有热电制冷（Bi₂Te₃ 两条金属链未建）；25 °C 的 5 nA
     *      对应 −20 °C 的 0.5 nA，缺口 10 倍暗电流。
     *   ② n 面用 AuGe/Ni/Au，Ge 来自 `mat/germanium-metal` 的 0.02 g/批；
     *      接触电阻的设计值 1×10⁻⁵ Ω·cm²，没有 TLM 实测（本层有
     *      `std/contact-tlm-general`，但不在本文件里假装已测）。
     */
    id: 'make/photodiode-ingaas',
    name: 'InGaAs Photodiode Manufacturing', name_zh: 'InGaAs 光电二极管制造',
    produces: [
      {
        item: 'std/photodiode-ingaas',
        qty: q(300),
        gives: [
          { param: 'wavelength', kind: 'range', min: 900, max: 1700 },
          { param: 'responsivity', kind: 'range', min: 0.8, max: 1.1 },
          { param: 'activeArea', kind: 'range', min: 0.5, max: 1.0 },
          { param: 'darkCurrent', kind: 'range', min: 0, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ingaas-epi-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/zinc', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/hydrogen-peroxide', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/silane', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/ammonia-anhydrous', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/cf4', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/titanium', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 5000) }] },
      { anyOf: [{ item: 'mat/germanium-metal', qty: q(1, 50000) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 50000) }] },
      { anyOf: [{ item: 'mat/solder-preform', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/gold-bonding-wire', qty: q(3, 5) }] },
      { anyOf: [{ item: 'std/to-package-46', qty: q(300) }] },
    ],
    needs: [
      'std/photomask-general',
      'plant/clean-room',
      'plant/metrology-room',
      'plant/picoammeter',
      'plant/monochromator',
      'plant/white-light-source',
      'std/thermopile-detector-general',
    ],
    steps: [
      {
        note_zh: '清洗：丙酮/乙醇/超纯水，去有机与颗粒；外延片不能超声（InGaAs 表面易损）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh: 'Zn 扩散：500–600 °C、30–60 min，密封石英管，Zn 源 0.1 g；p-InP 窗口 0.5–1 µm。Zn 在 InP 中扩散快（D ≈ 1×10⁻¹² cm²/s @ 550 °C），靠 n-InP 帽层厚度止住结深',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 500, max: 600 }],
      },
      { note_zh: '台面光刻：φ1.2 mm 圆、管芯 1.5×1.5 mm；接触曝光 5–10 µm 精度', performedBy: 'plant/mask-aligner' },
      {
        note_zh: '台面腐蚀：HCl : H₂O₂ : H₂O = 1 : 1 : 8，20–40 °C，刻到 n-InP 缓冲；刻深 1.2–1.5 µm',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh: 'SiNx 钝化：PECVD 300 °C、200 nm；折射率 1.9–2.1，氢含量 10–15 %',
        performedBy: 'plant/pecvd-reactor',
        under: [
          { param: 'temperature', min: 250, max: 350 },
          { param: 'pressure', min: 0.05, max: 0.2 },
        ],
      },
      { note_zh: '开窗光刻：p/n 电极窗口，直径 0.6–0.9 mm', performedBy: 'plant/mask-aligner' },
      {
        note_zh: 'SiNx 干法刻蚀：CF₄/O₂，5–20 Pa，20–60 °C；刻穿 200 nm SiNx，过刻 20 %',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 5, max: 20 },
        ],
      },
      {
        note_zh: 'p 面 Ti/Au：Ti 50 nm + Au 200 nm，电子束/钨舟蒸发，0.001–0.01 Pa',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh: 'n 面 AuGe/Ni/Au：AuGe 100 nm + Ni 30 nm + Au 200 nm；AuGe 共晶 88Au:12Ge',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        // 欧姆合金用**管式炉**而不是 RTA：Zn 扩散与 AuGe/Ni/Au 合金在 400–450 °C、
        // N₂ 气氛下 5–10 min 就够（升温慢一点只影响节拍，不影响结果）。
        // 为什么不写 RTA：`plant/rta` 的高温计要用 InGaAs 光电二极管本身（`make/rta-pyrometer`），
        // 而这条路线正是造 InGaAs 的 —— 互相依赖，闭包会死锁。管式炉没有这个环，
        // 也是历史上 InP 欧姆合金的标准做法。RTA 那一档留作升级路径（节拍 3–5×）。
        note_zh: '欧姆合金：管式炉 400–450 °C、N₂、5–10 min（不用 RTA，见注释；RTA 版是节拍升级，不是能力前提）；接触电阻设计 1×10⁻⁵ Ω·cm²，无 TLM 实测',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
      {
        note_zh: 'AR 膜：PECVD SiNx 190 nm（1.55 µm 的 λ/4，n ≈ 2.0）；与钝化同一台，换程序',
        performedBy: 'plant/pecvd-reactor',
        under: [
          { param: 'temperature', min: 250, max: 350 },
          { param: 'pressure', min: 0.05, max: 0.2 },
        ],
      },
      {
        note_zh: '划片：1.5×1.5 mm 管芯，刀缝 30–50 µm；冷却水，转速 20 000–30 000 rpm',
        performedBy: 'plant/dicing-saw',
      },
      {
        note_zh: '贴片/键合：AuSn 焊片（或银浆）粘到 TO-46  header，φ25 µm 金丝键合 p/n 电极',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      { note_zh: '封帽：TO-46 缝焊，气密 ≤1×10⁻⁹ Pa·m³/s', performedBy: 'plant/sheet-shop' },
      {
        note_zh:
          '测试：暗电流（−5 V，pA 表，≤5 nA）、响应度（1.55 µm，单色仪 + 热电堆标定，0.8–1.1 A/W）、光谱响应（900–1700 nm，2–10 nm 步长）；25 °C、19–21 °C 恒温',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      '外延片 1 片（4.4 g）+ 胶 1 g + 碱 1 g + 酸/氧化剂 10 g + 水 500 g + 硅烷 1 g + 无水氨 1 g + 氮 10 g + CF₄/O₂ 0.2 g + 金属与焊料 0.44 g + 封装 300 套 → 器件 300 只（每只约 5 mg 芯片 + 0.3 g 封装）；一片 900 个管芯，按 33 % 成品率交 300 只。出器件按件计，质量账不做断言',
  },

  // ───────────────────────────────────────────────────────────────────────
  // 6. 设备制造：LEC 炉、MOCVD、PECVD、划片机、单色仪、皮安表
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * **LEC 单晶炉装配：腔体 + 加热体 + 坩埚 + 提拉头 + 压力控制。**
     *
     *   chamber 1 + heater 1 + crucible 1 + pull-head 1 + pressure-control 1
     *   + 电机 1 + 热电偶 2 + 接触器 2 → LEC 炉 1 台
     *
     * 装配在洁净间常温做；高压腔体先做 1.5 倍设计压力的水压试验
     * （60 atm、30 min），再装加热体与坩埚。没有氦检漏，漏率按
     * 压升法记到 1×10⁻³ Pa·L/s 级。
     */
    id: 'make/inp-crystal-grower',
    name: 'LEC Single-Crystal Furnace Assembly', name_zh: 'LEC 单晶炉装配',
    produces: [
      {
        item: 'plant/inp-crystal-grower',
        qty: q(1),
        gives: [
          { param: 'maxTemperature', kind: 'range', min: 1100, max: 1150 },
          { param: 'maxPressure', kind: 'range', min: 4000, max: 5100 },
          { param: 'crucibleDiameter', kind: 'range', min: 75, max: 100 },
          { param: 'pullRate', kind: 'range', min: 1, max: 10 },
          { param: 'temperatureUniformity', kind: 'range', min: 0, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/inp-crystal-grower/chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/inp-crystal-grower/heater', qty: q(1) }] },
      { anyOf: [{ item: 'plant/inp-crystal-grower/crucible', qty: q(1) }] },
      { anyOf: [{ item: 'plant/inp-crystal-grower/pull-head', qty: q(1) }] },
      { anyOf: [{ item: 'plant/inp-crystal-grower/pressure-control', qty: q(1) }] },
      { anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(1) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(2) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: '装腔体/法兰/观察窗：CF 铜垫一次用；水压试验 60 atm、30 min，保压不降',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装加热体/坩埚/保温：石墨托与石英坩埚同心，间隙 2–3 mm；热电偶 2 支',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装提拉头/籽晶杆/压力控制：提拉 1–10 mm/h、转动 5–30 rpm；B₂O₃ 加料器对准坩埚口',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '检漏/空炉升温：抽到 10 Pa 后压升 ≤1×10⁻³ Pa·L/s；空炉到 1100 °C 看三区温差 ≤5 °C',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '腔体 1 + 加热体 1 + 坩埚 1 + 提拉头 1 + 压力控制 1 + 电机 1 + 热电偶 2 + 接触器 2 → LEC 炉 1 台；零件按件计，没有 kg 账。装配 24 h；水压 60 atm、漏率只到 1×10⁻³ Pa·L/s 级',
  },

  {
    /**
     * **MOCVD 反应室装配：腔体 + 基座 + 加热 + 鼓泡器 + 气路/泵。**
     *
     *   chamber 1 + susceptor 1 + heater 1 + bubbler 1
     *   + LPCVD 气路 1 + 干泵 1 + 节流阀 1 + 压力计 1 + load-lock 1
     *   + 热电偶 3 + 接触器 2 → MOCVD 1 台
     *
     * 气路复用 LPCVD 的 TCS/NH₃ 面板（不锈钢阀 + MFC + 纯化器），
     * 另加 TMIn/TMGa 鼓泡器与 PH₃/AsH₃ 毒气管线；尾气进酸洗塔。
     * RF 由 `plant/rf-13m56` 提供，不在本机零件里。
     */
    id: 'make/mocvd-reactor',
    name: 'MOCVD Reactor Assembly', name_zh: 'MOCVD 反应室装配',
    produces: [
      {
        item: 'plant/mocvd-reactor',
        qty: q(1),
        gives: [
          { param: 'temperatureUniformity', kind: 'range', min: 0, max: 5 },
          { param: 'pressureAccuracy', kind: 'range', min: 0, max: 2 },
          { param: 'growthRate', kind: 'range', min: 0.5, max: 2 },
          { param: 'waferCapacity', kind: 'range', min: 3, max: 3 },
          { param: 'layerUniformity', kind: 'range', min: 0, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/mocvd-reactor/chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mocvd-reactor/susceptor', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mocvd-reactor/heater', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mocvd-reactor/bubbler', qty: q(1) }] },
      { anyOf: [{ item: 'plant/lpcvd-furnace/gas-panel', qty: q(1) }] },
      { anyOf: [{ item: 'plant/lpcvd-furnace/pump', qty: q(1) }] },
      { anyOf: [{ item: 'plant/lpcvd-furnace/throttle', qty: q(1) }] },
      { anyOf: [{ item: 'plant/lpcvd-furnace/manometer', qty: q(1) }] },
      { anyOf: [{ item: 'plant/lpcvd-furnace/load-lock', qty: q(1) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(3) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(2) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/rf-13m56', 'plant/acid-plant'],
    rate: { hours: q(16) },
    steps: [
      {
        note_zh: '装腔体/基座：φ300 × 600 mm，基座与喷淋头间距 50–80 mm；石英内衬',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装气路/鼓泡器：TMIn/TMGa 瓶恒温 20–60 °C；PH₃/AsH₃ 经纯化器与质量流量计',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装泵/压力控制/尾气：干泵 + 节流阀 + 电容薄膜规；尾气进酸洗塔，PH₃/AsH₃ 不得直排',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '检漏/烘烤：抽到 10 Pa，压升 ≤1×10⁻⁶ Pa·L/s；120 °C 烘 4 h 去水',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '腔体 1 + 基座 1 + 加热 1 + 鼓泡器 1 + 气路 1 + 泵 1 + 节流阀 1 + 压力计 1 + load-lock 1 + 热电偶 3 + 接触器 2 → MOCVD 1 台；零件按件计，没有 kg 账。装配 16 h',
  },

  {
    /**
     * **PECVD 反应室装配：腔体 + 喷淋头 + 加热 + 气路/泵。**
     *
     *   chamber 1 + showerhead 1 + heater 1 + LPCVD 气路 1
     *   + 干泵 1 + 节流阀 1 + 压力计 1 + 热电偶 2 + 接触器 2 → PECVD 1 台
     *
     * RF 由 `plant/rf-13m56` 提供；SiH₄/NH₃/N₂ 三路气，SiH₄ 侧要
     * 防回火（干泵前装氮气吹扫）。
     */
    id: 'make/pecvd-reactor',
    name: 'PECVD Reactor Assembly', name_zh: 'PECVD 反应室装配',
    produces: [
      {
        item: 'plant/pecvd-reactor',
        qty: q(1),
        gives: [
          { param: 'temperatureUniformity', kind: 'range', min: 0, max: 5 },
          { param: 'pressureAccuracy', kind: 'range', min: 0, max: 2 },
          { param: 'filmUniformity', kind: 'range', min: 0, max: 3 },
          { param: 'power', kind: 'range', min: 300, max: 600 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/pecvd-reactor/chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/pecvd-reactor/showerhead', qty: q(1) }] },
      { anyOf: [{ item: 'plant/pecvd-reactor/heater', qty: q(1) }] },
      { anyOf: [{ item: 'plant/lpcvd-furnace/gas-panel', qty: q(1) }] },
      { anyOf: [{ item: 'plant/lpcvd-furnace/pump', qty: q(1) }] },
      { anyOf: [{ item: 'plant/lpcvd-furnace/throttle', qty: q(1) }] },
      { anyOf: [{ item: 'plant/lpcvd-furnace/manometer', qty: q(1) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(2) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/rf-13m56', 'plant/acid-plant'],
    rate: { hours: q(16) },
    steps: [
      {
        note_zh: '装腔体/喷淋头/基座：间距 20–30 mm，孔板对中 ±0.5 mm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装气路/泵：SiH₄/NH₃/N₂ 三路 + 质量流量计；干泵前氮气吹扫，防 SiH₄ 回火',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '检漏/试片：抽到 0.1 Pa，压升 ≤1×10⁻⁶ Pa·L/s；空跑 300 °C、200 W，看温场 ±5 °C',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '腔体 1 + 喷淋头 1 + 加热 1 + 气路 1 + 泵 1 + 节流阀 1 + 压力计 1 + 热电偶 2 + 接触器 2 → PECVD 1 台；零件按件计，没有 kg 账。装配 16 h',
  },

  {
    /**
     * **划片机装配：主轴 + 刀片 + 工作台 + 显微镜。**
     *
     *   spindle 1 + blade 1 + stage 1 + microscope 1 + 电机 1 + 接触器 1
     *   + 冷却水 1 → 划片机 1 台
     */
    id: 'make/dicing-saw',
    name: 'Dicing Saw Assembly', name_zh: '划片机装配',
    produces: [
      {
        item: 'plant/dicing-saw',
        qty: q(1),
        gives: [
          { param: 'bladeSpeed', kind: 'range', min: 10000, max: 40000 },
          { param: 'kerf', kind: 'range', min: 30, max: 40 },
          { param: 'positioning', kind: 'range', min: 1, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/dicing-saw/spindle', qty: q(1) }] },
      { anyOf: [{ item: 'plant/dicing-saw/blade', qty: q(1) }] },
      { anyOf: [{ item: 'plant/dicing-saw/stage', qty: q(1) }] },
      { anyOf: [{ item: 'plant/dicing-saw/microscope', qty: q(1) }] },
      { anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(16) },
    steps: [
      {
        note_zh: '装主轴/刀片：刀片法兰端跳 ≤2 µm；新刀片先修整（切硅片 100 刀）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装工作台/显微镜：X-Y 行程 100–150 mm，定位 1–5 µm；十字线对刀',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '试切/测刀缝：1.5×1.5 mm 管芯，刀缝 30–50 µm；崩边 ≤20 µm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '主轴 1 + 刀片 1 + 工作台 1 + 显微镜 1 + 电机 1 + 接触器 1 + 水 1 → 划片机 1 台；零件按件计，没有 kg 账。装配 16 h',
  },

  {
    /**
     * **单色仪装配：光栅 + 镜 + 缝 + 斩波器 + 镜体 + 测微头。**
     *
     *   光栅 1 + 球面镜 2 + 狭缝 2 + 斩波器 1 + 镜体 1 + 千分尺 1
     *     → 单色仪 1 台
     *
     * 复用折射计的 500 mm 球面镜、刀口狭缝、斩波器与镜体；只把光栅
     * 换成 600 线/mm、100–200 nm 槽深、镀金的那一块。测微头 + 正弦杆
     * 扫描，800–1800 nm 对应 0–25 mm 的测微头行程。
     *
     * 标定：钠 589.0 nm 的二级 1178.0 nm、镉 643.8 nm 的二级 1287.6 nm；
     * 绝对波长 ±2–5 nm。没有汞灯/氩灯，长波端靠二级线外推。
     */
    id: 'make/monochromator',
    name: 'Monochromator Assembly', name_zh: '单色仪装配',
    produces: [
      {
        item: 'plant/monochromator',
        qty: q(1),
        gives: [
          { param: 'wavelengthRange', kind: 'range', min: 800, max: 1800 },
          { param: 'measure/resolution', kind: 'range', min: 2, max: 5 },
          { param: 'focalLength', kind: 'range', min: 500, max: 500 },
          { param: 'strayLight', kind: 'range', min: 0, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/monochromator/grating', qty: q(1) }] },
      { anyOf: [{ item: 'plant/refractometer/oes-mirror', qty: q(2) }] },
      { anyOf: [{ item: 'plant/refractometer/slit', qty: q(2) }] },
      { anyOf: [{ item: 'plant/refractometer/chopper', qty: q(1) }] },
      { anyOf: [{ item: 'plant/refractometer/oes-body', qty: q(1) }] },
      { anyOf: [{ item: 'std/micrometer-0-25', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/white-light-source'],
    rate: { hours: q(16) },
    steps: [
      {
        note_zh: '装光栅/镜/缝：入射缝 10–50 µm、出射缝 25–100 µm；光栅面与入射光垂直，偏差 <0.1°',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装正弦杆/测微头：25° 基块 + 100 mm 正弦杆；测微头 0–25 mm 对应 800–1800 nm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '标定：钠 589.0 nm 二级 1178.0 nm、镉 643.8 nm 二级 1287.6 nm；读测微头二次拟合 λ(x)，绝对波长 ±2–5 nm；1.55 µm 处分辨率 2–10 nm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '光栅 1 + 球面镜 2 + 狭缝 2 + 斩波器 1 + 镜体 1 + 千分尺 1 → 单色仪 1 台；零件按件计，没有 kg 账。装配/标定 16 h；长波端靠二级线外推，绝对波长 ±2–5 nm',
  },

  {
    /**
     * **皮安表装配：femto 前端 + 24 位 ADC + 屏蔽箱 + 数字表。**
     *
     *   femto 前端 1 + ADC 1 + 屏蔽箱 1 + 数字表 1 + 铜 0.1 + 铝 0.5
     *     → 皮安表 1 台
     *
     * 前端是参数分析仪的 `femto-front-end`（1×10⁻¹³ A 满度），ADC 是
     * 24 位；屏蔽箱是 `plant/probe-station/shield-box`。1 pA 的分辨靠
     * 100 GΩ 电阻 + 1 V 做替代标定，没有标准电流源溯源。
     */
    id: 'make/picoammeter',
    name: 'Picoammeter Assembly', name_zh: '皮安表装配',
    produces: [
      {
        item: 'plant/picoammeter',
        qty: q(1),
        gives: [
          { param: 'currentRange', kind: 'range', min: 1e-13, max: 1e-3 },
          { param: 'measure/resolution', kind: 'range', min: 1e-15, max: 1e-15 },
          { param: 'measure/accuracy', kind: 'range', min: 0.3, max: 1 },
          { param: 'measure/bandwidth', kind: 'range', min: 500, max: 1000 },
          { param: 'measure/leakage', kind: 'range', min: 0.1, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/cmos-test/parameter-analyzer/femto-front-end', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cmos-test/parameter-analyzer/adc-24bit', qty: q(1) }] },
      { anyOf: [{ item: 'plant/probe-station/shield-box', qty: q(1) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh: '装前放/ADC：femto 前端 + 24 位 ADC，输入保护 <10 V；反馈电阻 1 GΩ–100 GΩ',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装屏蔽/接地：法拉第笼 60–80 dB，单点接地；输入电缆 <50 mm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '标定：100 GΩ + 1 V → 10 pA；1 GΩ + 1 V → 1 nA；线性 1 pA–1 nA ±5 %，没有标准电流源',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '前端 1 + ADC 1 + 屏蔽箱 1 + 数字表 1 + 铜 0.1 + 铝 0.5 → 皮安表 1 台；零件按件计，没有 kg 账。装配/标定 8 h；1 pA 分辨靠 100 GΩ 替代，无标准源',
  },

  // ───────────────────────────────────────────────────────────────────────
  // 7. 零件制造
  // ───────────────────────────────────────────────────────────────────────

  {
    /** LEC 高压腔体：40Cr 锻件 + 316L 内衬，深孔/法兰/水压。 */
    id: 'make/inp-crystal-grower-chamber',
    name: 'High-Pressure LEC Crystal Grower High-Pressure Chamber Manufacturing', name_zh: '高压 LEC 单晶炉高压腔体制造',
    produces: [
      {
        item: 'plant/inp-crystal-grower/chamber',
        qty: q(1),
        gives: [
          { param: 'innerDiameter', kind: 'range', min: 150, max: 150 },
          { param: 'wallThickness', kind: 'range', min: 30, max: 30 },
          { param: 'maxPressure', kind: 'range', min: 4000, max: 5100 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-40cr', qty: q(300) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(50) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '锻件/钢板成形：筒体卷焊 + 法兰锻环', performedBy: 'plant/forge' },
      { note_zh: '深孔与法兰：φ150 H8、法兰 12×M16；同轴度 0.05 mm', performedBy: 'plant/milling-machine' },
      { note_zh: '内壁磨/抛光：Ra ≤0.8 µm，避免高压下应力集中', performedBy: 'plant/grinder' },
      { note_zh: '水压试验：60 atm、30 min，保压不降；磁粉/超声焊缝', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(40) },
    unbalanced_zh:
      '40Cr 300 + 316L 50 = 350 kg → 腔体 1 件（约 280 kg）；余 70 kg 是切削/焊材/水压试验用水；产品按件计，不进质量账；余料回 mat/metal-scrap',
  },

  {
    /** LEC 加热体：SiC 筒 + 铜电极，2–3 区、10–20 kW。 */
    id: 'make/inp-crystal-grower-heater',
    name: 'Graphite/Silicon Carbide Heating Element Manufacturing', name_zh: '石墨/碳化硅加热体制造',
    produces: [
      {
        item: 'plant/inp-crystal-grower/heater',
        qty: q(1),
        gives: [
          { param: 'power', kind: 'range', min: 10, max: 20 },
          { param: 'zones', kind: 'range', min: 2, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-carbide', qty: q(20) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(10) }] },
    ],
    needs: [],
    steps: [
      { note_zh: 'SiC 筒成形：φ120 × 150 mm，开槽分 2–3 区', performedBy: 'lathe' },
      { note_zh: '铜电极/接线：水冷铜排，接触电阻 <1 mΩ', performedBy: 'plant/milling-machine' },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      'SiC 20 + 铜 10 = 30 kg → 加热体 1 件（约 25 kg）；余 5 kg 是切屑/电极边角。零件按件计，质量账不做断言',
  },

  {
    /** LEC 石英坩埚：φ75–100 mm、高 100–150 mm，玻璃车床成形 + 退火。 */
    id: 'make/inp-crystal-grower-crucible',
    name: 'High-Pressure LEC Crystal Grower Quartz Crucible Manufacturing', name_zh: '高压 LEC 单晶炉石英坩埚制造',
    produces: [
      {
        item: 'plant/inp-crystal-grower/crucible',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 75, max: 100 },
          { param: 'height', kind: 'range', min: 100, max: 150 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/quartz-pure', qty: q(2) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '玻璃车床成形：φ75–100 mm、壁厚 3–5 mm；2000 °C 氢氧焰', performedBy: 'plant/glass-lathe', under: [{ param: 'temperature', min: 1900, max: 2200 }] },
      { note_zh: '退火：800–900 °C、2 h，去应力', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 800, max: 900 }] },
      { note_zh: '清洗/检：HF 轻蚀 30 s、超纯水冲；椭圆度 ≤0.5 mm', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 60 }, { param: 'pressure', min: 100, max: 300 }] },
    ],
    rate: { hours: q(8) },
    unbalanced_zh:
      '石英 2 kg → 坩埚 1 件（约 0.8 kg）；余 1.2 kg 是切割/磨削/酸蚀；产品按件计，不进质量账；余料回 mat/quartz-scrap',
  },

  {
    /** LEC 提拉头：籽晶夹 + 软轴 + 称重；1–10 mm/h、5–30 rpm。 */
    id: 'make/inp-crystal-grower-pull-head',
    name: 'High-Pressure LEC Crystal Grower Pull Head Manufacturing', name_zh: '高压 LEC 单晶炉提拉头制造',
    produces: [
      {
        item: 'plant/inp-crystal-grower/pull-head',
        qty: q(1),
        gives: [
          { param: 'pullRate', kind: 'range', min: 1, max: 10 },
          { param: 'rotation', kind: 'range', min: 5, max: 30 },
        ],
      },
    ],
    // 轴、轴承、电机在条目 composedOf 上；这里只写总装与动平衡。
    uses: [],
    needs: [],
    steps: [
      { note_zh: '装轴、P5 轴承与电机', performedBy: 'plant/robot' },
      { note_zh: '装配/动平衡：5–30 rpm 无异响', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      '轴 1 + 轴承 1 + 电机 1 → 提拉头 1 件（约 25 kg）；零件按件计，质量账不做断言',
  },

  {
    /** LEC 压力控制：B₂O₃ 加料器 + 电容薄膜规 + 泄放阀。 */
    id: 'make/inp-crystal-grower-pressure-control',
    name: 'High-Pressure LEC Crystal Grower Pressure Control Manufacturing', name_zh: '高压 LEC 单晶炉压力控制制造',
    produces: [
      {
        item: 'plant/inp-crystal-grower/pressure-control',
        qty: q(1),
        gives: [
          { param: 'pressureRange', kind: 'range', min: 1000, max: 5100 },
          { param: 'accuracy', kind: 'range', min: 0, max: 2 },
        ],
      },
    ],
    // 薄膜规、加料器、泄放阀、阀组在条目 composedOf 上；这里只写总装与标定。
    uses: [],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '装阀组、加料器与泄放阀，接电容薄膜规', performedBy: 'plant/robot' },
      { note_zh: '标定：1000–5100 kPa、±2 %；用标准压力表比对', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(8) },
    unbalanced_zh:
      '薄膜规 1 + 加料器 1 + 泄放阀 1 + 阀组 1 → 压力控制 1 件；零件按件计，质量账不做断言',
  },

  {
    /** MOCVD 腔体：φ300 × 600 mm，316L 水冷夹套 + 石英内衬。 */
    id: 'make/mocvd-chamber',
    name: 'MOCVD Chamber Manufacturing', name_zh: 'MOCVD 腔体制造',
    produces: [
      {
        item: 'plant/mocvd-reactor/chamber',
        qty: q(1),
        gives: [
          { param: 'innerDiameter', kind: 'range', min: 300, max: 300 },
          { param: 'length', kind: 'range', min: 600, max: 600 },
          { param: 'leakRate', kind: 'range', min: 0, max: 1e-6 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(200) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(20) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '卷焊/法兰：φ300 × 600 mm，水冷夹套 2 层', performedBy: 'plant/sheet-shop' },
      { note_zh: '内壁抛光/石英内衬：Ra ≤0.8 µm，内衬与腔体间隙 2 mm', performedBy: 'plant/grinder' },
      { note_zh: '检漏：抽到 10 Pa，压升 ≤1×10⁻⁶ Pa·L/s', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      '316L 200 + 石英 20 = 220 kg → 腔体 1 件（约 190 kg）；余 30 kg 是切边/焊材/石英边角。零件按件计，质量账不做断言',
  },

  {
    /** MOCVD 基座：SiC 涂层石墨盘，φ100–120 mm，±5 °C。 */
    id: 'make/mocvd-susceptor',
    name: 'MOCVD Graphite Susceptor Manufacturing', name_zh: 'MOCVD 石墨基座制造',
    produces: [
      {
        item: 'plant/mocvd-reactor/susceptor',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 100, max: 120 },
          { param: 'temperatureUniformity', kind: 'range', min: 0, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-carbide', qty: q(5) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(2) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '车/磨：φ100–120 mm、平面度 ≤10 µm、3 个片坑深 0.2 mm', performedBy: 'lathe' },
      { note_zh: '磨/抛光：Ra ≤0.4 µm，避免背面划伤', performedBy: 'plant/grinder' },
    ],
    rate: { hours: q(8) },
    unbalanced_zh:
      'SiC 5 + 45 钢 2 = 7 kg → 基座 1 件（约 5 kg）；零件按件计，质量账不做断言',
  },

  {
    /** MOCVD 加热体：5–10 kW、2–3 区，感应/电阻。 */
    id: 'make/mocvd-heater',
    name: 'MOCVD Induction/Resistance Heater Manufacturing', name_zh: 'MOCVD 感应/电阻加热体制造',
    produces: [
      {
        item: 'plant/mocvd-reactor/heater',
        qty: q(1),
        gives: [
          { param: 'power', kind: 'range', min: 5, max: 10 },
          { param: 'zones', kind: 'range', min: 2, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-carbide', qty: q(10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(5) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '绕制/加工：感应线圈或 SiC 棒，2–3 区', performedBy: 'lathe' },
      { note_zh: '绝缘/电极：云母/陶瓷绝缘，铜电极水冷', performedBy: 'plant/milling-machine' },
    ],
    rate: { hours: q(8) },
    unbalanced_zh:
      'SiC 10 + 铜 5 = 15 kg → 加热体 1 件（约 12 kg）；零件按件计，质量账不做断言',
  },

  {
    /** MOCVD 鼓泡器：0.5–2 L 不锈钢瓶，20–60 °C 恒温。 */
    id: 'make/mocvd-bubbler',
    name: 'MOCVD Metal-Organic Source Bubbler Manufacturing', name_zh: 'MOCVD 金属有机源鼓泡器制造',
    produces: [
      {
        item: 'plant/mocvd-reactor/bubbler',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 0.5, max: 2 },
          { param: 'temperature', kind: 'range', min: 20, max: 60 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '瓶体/阀：0.5–2 L，进出口阀 + 鼓泡管；内壁钝化', performedBy: 'plant/sheet-shop' },
      { note_zh: '恒温夹套：20–60 °C 水浴/电加热', performedBy: 'plant/robot' },
      { note_zh: '检漏/清洗：抽真空 + 氦检？没有氦，压升法 ≤1×10⁻⁶ Pa·L/s', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(8) },
    unbalanced_zh:
      '不锈钢 5 + 玻璃 1 = 6 kg → 鼓泡器 1 件（约 4 kg）；零件按件计，质量账不做断言',
  },

  {
    /** PECVD 腔体：φ300 × 400 mm，316L + 石英内衬。 */
    id: 'make/pecvd-chamber',
    name: 'PECVD Chamber Manufacturing', name_zh: 'PECVD 腔体制造',
    produces: [
      {
        item: 'plant/pecvd-reactor/chamber',
        qty: q(1),
        gives: [
          { param: 'innerDiameter', kind: 'range', min: 300, max: 300 },
          { param: 'length', kind: 'range', min: 400, max: 400 },
          { param: 'leakRate', kind: 'range', min: 0, max: 1e-6 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(150) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(10) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '卷焊/法兰：φ300 × 400 mm，观察窗 + 电极引入', performedBy: 'plant/sheet-shop' },
      { note_zh: '内壁抛光：Ra ≤0.8 µm', performedBy: 'plant/grinder' },
      { note_zh: '检漏：压升 ≤1×10⁻⁶ Pa·L/s', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      '316L 150 + 玻璃 10 = 160 kg → 腔体 1 件（约 140 kg）；零件按件计，质量账不做断言',
  },

  {
    /** PECVD 喷淋头：φ200–250 mm、100–500 个 φ0.3 mm 孔。 */
    id: 'make/pecvd-showerhead',
    name: 'PECVD Showerhead Manufacturing', name_zh: 'PECVD 喷淋头制造',
    produces: [
      {
        item: 'plant/pecvd-reactor/showerhead',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 200, max: 250 },
          { param: 'holes', kind: 'range', min: 100, max: 500 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '钻孔：100–500 个 φ0.3 mm，孔距 5–10 mm；钻头 0.3 mm 易断，每 50 孔换', performedBy: 'plant/milling-machine' },
      { note_zh: '车/磨：平面度 ≤20 µm，与基座平行', performedBy: 'lathe' },
      { note_zh: '清洗/检：超声 + 氮吹；孔通透率 100 %', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      '不锈钢 5 + 铝 2 = 7 kg → 喷淋头 1 件（约 5 kg）；零件按件计，质量账不做断言',
  },

  {
    /** PECVD 基座加热：1–3 kW，200–400 °C。 */
    id: 'make/pecvd-heater',
    name: 'PECVD Susceptor Heating Manufacturing', name_zh: 'PECVD 基座加热制造',
    produces: [
      {
        item: 'plant/pecvd-reactor/heater',
        qty: q(1),
        gives: [
          { param: 'power', kind: 'range', min: 1, max: 3 },
          { param: 'temperature', kind: 'range', min: 200, max: 400 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(5) }] },
      { anyOf: [{ item: 'mat/silicon-carbide', qty: q(5) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '基座/加热盘：φ250 mm，埋入式电阻丝或 SiC 加热片', performedBy: 'lathe' },
      { note_zh: '磨/绝缘：平面度 ≤20 µm，耐压 1 kV', performedBy: 'plant/grinder' },
    ],
    rate: { hours: q(8) },
    unbalanced_zh:
      '铝 5 + SiC 5 = 10 kg → 加热盘 1 件（约 7 kg）；零件按件计，质量账不做断言',
  },

  {
    /** 划片机主轴：10 000–40 000 rpm，径向跳动 ≤2 µm。 */
    id: 'make/dicing-spindle',
    name: 'Dicing Saw Precision Spindle Manufacturing', name_zh: '划片机精密主轴制造',
    produces: [
      {
        item: 'plant/dicing-saw/spindle',
        qty: q(1),
        gives: [
          { param: 'speed', kind: 'range', min: 10000, max: 40000 },
          { param: 'runout', kind: 'range', min: 0, max: 2 },
        ],
      },
    ],
    // 轴、轴承、电机在条目 composedOf 上；这里只写总装与动平衡。
    uses: [],
    needs: [],
    steps: [
      { note_zh: '装轴与成对 P5 轴承：预紧后径向跳动 ≤2 µm', performedBy: 'plant/grinder' },
      { note_zh: '装电机与联轴器，手动盘车确认无干涉', performedBy: 'plant/robot' },
      { note_zh: '动平衡：40 000 rpm、G2.5', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      '轴 1 + P5 轴承 2 + 电机 1 → 主轴 1 件；零件按件计，质量账不做断言',
  },

  {
    /** 金刚石镍刀片：φ50–60 mm、厚 30–50 µm。 */
    id: 'make/dicing-blade',
    name: 'Dicing Saw Diamond Nickel Blade Manufacturing', name_zh: '划片机金刚石镍刀片制造',
    produces: [
      {
        item: 'plant/dicing-saw/blade',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 50, max: 60 },
          { param: 'thickness', kind: 'range', min: 0.03, max: 0.05 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/diamond-powder', qty: q(1, 2000) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 500) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '电镀镍-金刚石：20–60 °C、15–20 kPa；金刚石 5–15 µm，镍层 30–50 µm', performedBy: 'plant/plating-bath', under: [{ param: 'temperature', min: 20, max: 60 }, { param: 'pressure', min: 15, max: 20 }] },
      { note_zh: '修整：开刃、端跳 ≤5 µm', performedBy: 'plant/grinder' },
    ],
    rate: { hours: q(8) },
    unbalanced_zh:
      '金刚石 0.0005 + 镍 0.005 + 铜 0.002 = 0.0075 kg → 刀片 1 件（约 0.001 kg）；余是镀液带出与修整损耗。零件按件计，质量账不做断言',
  },

  {
    /** 划片机工作台：100–150 mm 行程、1–5 µm 定位。 */
    id: 'make/dicing-stage',
    name: 'X-Y Table Manufacturing', name_zh: 'X-Y 工作台制造',
    produces: [
      {
        item: 'plant/dicing-saw/stage',
        qty: q(1),
        gives: [
          { param: 'travel', kind: 'range', min: 100, max: 150 },
          { param: 'positioning', kind: 'range', min: 1, max: 3 },
        ],
      },
    ],
    // 台面、丝杠、螺母、轴承在条目 composedOf 上；千分尺是装配时量的工具，放 needs。
    uses: [],
    needs: ['std/micrometer-0-25'],
    steps: [
      { note_zh: '装 X/Y 丝杠、消隙螺母、台面与 4 套 P0 轴承', performedBy: 'plant/robot' },
      { note_zh: '调导轨与丝杠，千分尺量定位 1–5 µm', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      '台面 1 + 丝杠 2 + 消隙螺母 2 + P0 轴承 4 → 工作台 1 件；零件按件计，质量账不做断言',
  },

  {
    /** 划片机显微镜：50–200×，同轴光。 */
    id: 'make/dicing-microscope',
    name: 'Dicing Saw Alignment Microscope Manufacturing', name_zh: '划片机对准显微镜制造',
    produces: [
      {
        item: 'plant/dicing-saw/microscope',
        qty: q(1),
        gives: [{ param: 'magnification', kind: 'range', min: 50, max: 200 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(2) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '镜片/镜筒：50×/100×/200× 物镜，工作距 5–10 mm', performedBy: 'plant/grinder' },
      { note_zh: '装配/调焦：十字线对刀，同轴光', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(8) },
    unbalanced_zh:
      '玻璃 1 + 铝 1 + 45 钢 2 = 4 kg → 显微镜 1 件；零件按件计，质量账不做断言',
  },

  {
    /**
     * **单色仪光栅：600 线/mm、100–200 nm 槽深、镀金。**
     *
     *   玻璃 0.12 + 胶 0.001 + 金 0.001 + 氩 0.001 + 尾料 0.02 + 水 0.5
     *     → 光栅 10 件
     *
     * 30×30×6 mm 玻璃基板（每件 11.9 g，10 件 119 g），旋涂负胶 0.3 µm，
     * 车床挂轮 1/600（600 线/mm，30 mm 走 18 000 刀），显影后用 Ar⁺ 刻
     * 100–200 nm，镀金 100 nm。
     * 600 线/mm 的节距 1.667 µm，是 1200 线/mm 光栅的两倍，刻划与
     * 镀金都更容易；一级效率设计 5–15 %（浅槽，不是闪耀光栅）。
     */
    id: 'make/monochromator-grating',
    name: '600 Lines/mm Plane Grating Manufacturing', name_zh: '600 线/mm 平面光栅制造',
    produces: [
      {
        item: 'plant/monochromator/grating',
        qty: q(10),
        gives: [
          { param: 'linesPerMM', kind: 'range', min: 600, max: 600 },
          { param: 'grooveDepth', kind: 'range', min: 100, max: 200 },
          { param: 'width', kind: 'range', min: 30, max: 30 },
          { param: 'height', kind: 'range', min: 30, max: 30 },
          { param: 'efficiency', kind: 'range', min: 0.05, max: 0.15 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(3, 25) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 1000) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '基板磨/抛：30×30×6 mm，面形 λ/4，Ra ≤1 nm', performedBy: 'plant/grinder' },
      { note_zh: '旋涂负胶 0.3 µm + 前烘 90 °C 30 min', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 90, max: 90 }] },
      { note_zh: '刻划：车床丝杠 1 mm、挂轮 1/600，30 mm 走 18 000 刀；恒温 19–21 °C', performedBy: 'lathe', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '显影：0.5–1 % NaOH、20–30 °C、30–60 s', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 30 }, { param: 'pressure', min: 100, max: 300 }] },
      { note_zh: '离子束刻蚀：Ar⁺ 600 eV、0.05–0.5 Pa，刻 100–200 nm', performedBy: 'plant/ion-beam-figuring', under: [{ param: 'pressure', min: 0.05, max: 0.5 }] },
      { note_zh: '镀金 100 nm：附着力靠 5 nm Ti 打底；R(1.55 µm) ≥0.98', performedBy: 'plant/evaporator', under: [{ param: 'pressure', min: 0.001, max: 0.01 }] },
      { note_zh: '检验：600 线/mm 节距 1.667 µm；槽深/效率没有量具，按设计值 5–15 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      '玻璃 0.12 + 胶 0.001 + 金 0.001 + 氩 0.001 + 尾料 0.02 + 水 0.5 + NaOH 0.001 = 0.644 kg → 光栅 10 件（每件约 0.013 kg）；余是切割/磨削/水。出片按件计，质量账不做断言',
  },

  {
    /** TO-46 窗片：φ2.5–3.0 mm、0.3–0.5 mm 硼硅玻璃，双面抛光。 */
    id: 'make/to-window-glass',
    name: 'TO-46 Window Manufacturing', name_zh: 'TO-46 窗片制造',
    produces: [
      {
        item: 'std/to-window-glass-general',
        qty: q(1000),
        gives: [
          { param: 'diameter', kind: 'range', min: 2.5, max: 3.0 },
          { param: 'thickness', kind: 'range', min: 0.3, max: 0.5 },
          { param: 'transmission', kind: 'range', min: 92, max: 95 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/colloidal-silica', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '切片/粗磨：φ2.5–3.0 mm、厚 0.3–0.5 mm', performedBy: 'plant/grinder' },
      { note_zh: 'CMP：胶体硅抛光，Ra ≤1 nm；双面', performedBy: 'plant/cmp-polisher' },
      { note_zh: '清洗/测透过：超纯水冲、甩干；1.55 µm 透过 92–95 %（设计值）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 40 }, { param: 'pressure', min: 100, max: 300 }] },
    ],
    rate: { hours: q(8) },
    unbalanced_zh:
      '玻璃 0.05 + 尾料 0.02 + 水 0.5 + 胶体硅 0.01 = 0.58 kg → 窗片 1000 件（每件约 0.01 g）；出片按件计，质量账不做断言',
  },

  {
    /**
     * **TO-46 封装：钢帽开窗 + 玻璃封接 + 检漏。**
     *
     *   金属帽 1000 + 窗片 1000 + 玻璃粉 0.1 + 氮 0.1 → TO-46 1000 套
     *
     * 金属帽复用 `std/metal-can-general`（钢帽 + 引线 + 框）；开 φ2.5 mm
     * 窗，填玻璃粉，800–900 °C 烧结（压缩封接），检漏 ≤1×10⁻⁹ Pa·m³/s。
     * 1000 套的玻璃粉 0.1 kg = 每套 0.1 g，是封接量的 3–5 倍（含损耗）。
     */
    id: 'make/to-package',
    name: 'TO-46 Package', name_zh: 'TO-46 封装',
    produces: [
      {
        item: 'std/to-package-46',
        qty: q(1000),
        gives: [
          { param: 'packageType', kind: 'enum', oneOf: ['TO-46'] },
          { param: 'windowDiameter', kind: 'range', min: 2.5, max: 3.0 },
          { param: 'leakRate', kind: 'range', min: 0, max: 1e-10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/metal-can-general', qty: q(1000) }] },
      { anyOf: [{ item: 'std/to-window-glass-general', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/glass-frit', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '帽壳开窗：φ2.5 mm，位置 ±0.1 mm；去毛刺', performedBy: 'plant/milling-machine' },
      { note_zh: '玻璃封接：800–900 °C、10 min，压缩封接；退火缓冷', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 800, max: 900 }] },
      { note_zh: '检漏：压升法 ≤1×10⁻⁹ Pa·m³/s；引线拉力 ≥5 N', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      '金属帽 1000 + 窗片 1000 + 玻璃粉 0.1 + 氮 0.1 → TO-46 1000 套；按件计，质量账不做断言',
  },

  {
    /**
     * **标准热电堆：金黑 + 25 对铜-铁热电堆。**
     *
     *   金 0.001 + 铜 0.002 + 铁 0.002 + 玻璃 0.02 + 氩 0.001
     *     → 热电堆 10 件
     *
     * 金黑在 1–10 Pa 氩里蒸发，吸收 0.3–20 µm；25 对 0.02 mm 铜-铁丝
     * 点焊，热端在吸收腔、冷端在水冷环。设计响应 0.2–0.5 V/W，
     * 时间常数 0.5–1.5 s；绝对响应按电功率替代标定，没有 NIST 溯源。
     */
    id: 'make/thermopile-detector',
    name: 'Standard Detector Manufacturing', name_zh: '标准探测器制造',
    produces: [
      {
        item: 'std/thermopile-detector-general',
        qty: q(10),
        gives: [
          { param: 'responsivity', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'spectralRange', kind: 'range', min: 0.3, max: 20 },
          { param: 'timeConstant', kind: 'range', min: 0.5, max: 1.5 },
          { param: 'activeArea', kind: 'range', min: 4, max: 9 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/gold', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 1000) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '蒸金黑：1–10 Pa 氩、金丝 0.1 g，吸收率 >95 %（0.3–20 µm）', performedBy: 'plant/evaporator', under: [{ param: 'pressure', min: 1, max: 10 }] },
      { note_zh: '点焊 25 对铜-铁：0.02 mm 丝、热端在吸收腔、冷端水冷环', performedBy: 'plant/robot' },
      { note_zh: '装壳/标定：响应 0.2–0.5 V/W（电功率替代），时间常数 0.5–1.5 s', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      '金 0.001 + 铜 0.002 + 铁 0.002 + 玻璃 0.02 + 氩 0.001 = 0.026 kg → 热电堆 10 件；按件计，质量账不做断言',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...INGAAS_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...INGAAS_ROUTES];
