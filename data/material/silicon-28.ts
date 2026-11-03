/**
 * ²⁸Si 富集硅与硅球 —— 电压天平质量项的同位素缺口（⑪）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、缺口：天然硅的同位素组成不是常数
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `data/machine/voltage-anchor.ts` 的 31 ppm 预算里，质量项 10 ppm 来自
 * `std/mass-standard-10g-si`：φ20.1653 mm 的天然硅球，ρ(25 °C) = 2.3290 g/cm³。
 * 天然硅的组成是 ²⁸Si 92.227 % / ²⁹Si 4.685 % / ³⁰Si 3.088 %，而**每一批
 * 天然硅的同位素组成能差 0.1 % 量级**（硅石、还原剂、坩埚各带一点），
 * 折到密度上就是 ~10 ppm。没有同位素证书时，密度项按 20–30 ppm 记，
 * 质量项从 10 ppm 涨到 10–15 ppm（§七④ 的原话）。
 *
 * 本文件把它压下去的办法不是"测得更准"，是**把同位素换掉**：
 * 用 99.9 % 的 ²⁸Si 做球，同位素项从 10 ppm 降到 <1 ppm，剩下的是
 * 密度测量本身的 3–10 ppm（见 `data/measure/g-absolute.ts`）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、SiF₄ 低温精馏：级数、分离系数、单级能耗
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 选 SiF₄ 而不是 SiH₄/SiCl₄：SiF₄ 在 −86 °C 沸腾、临界温度 −14 °C，
 * 低温精馏的温区（−100…−20 °C）正好落在本层能做出来的复叠制冷里；
 * SiH₄ 要 −112 °C 且自燃，SiCl₄ 的氯同位素会叠在硅同位素上。
 * 这条路与 `data/machine/cmp-integration.ts` 的 `make/silicon-tetrafluoride`
 * 接上：SiO₂ + 2F₂ → SiF₄ + O₂，SiF₄ 已经是本层的条目。
 *
 * ── 2.1 级数 ───────────────────────────────────────────────────────────────
 *
 *   天然：x_F(²⁸Si) = 0.9223；目标：x_P = 0.999（99.9 %）
 *   分离系数 α = 1.01–1.02（²⁸SiF₄ 对 ²⁹SiF₄ 的每级相对挥发度，设计值）
 *
 *   N = ln[ (x_P/(1−x_P)) / (x_F/(1−x_F)) ] / ln α
 *     = ln[ (0.999/0.001) / (0.9223/0.0777) ] / ln α
 *     = ln(84.2) / ln α
 *     = **446 级（α=1.01）– 224 级（α=1.02）**
 *
 *   99.95 % 时：ln[(0.9995/0.0005)/(0.9223/0.0777)]/ln α = 515 / 258 级。
 *
 *   设计取 **450 级**（α=1.01 的保守端；若实测 α=1.02，220 级就够，
 *   塔高可以砍一半）。450 级 × 板间距 0.3 m（筛板，板效率 0.6 折）
 *   ⇒ **135 m 塔高**，分 5 段、每段 90 级、28 m，现场法兰对接。
 *   HETP 0.3 m 与板效率 0.6 都是设计值（Earth 工程值），没有水力学试验
 *   （本层没有 SiF₄ 的组成分析，见 §五①）。
 *
 * ── 2.2 回流比与能耗 ───────────────────────────────────────────────────────
 *
 *   SiF₄ 的汽化潜热 ΔH_vap = 15.7 kJ/mol = **151 kJ/kg**（Earth 工程值；
 *   文献 15.4–16.5 kJ/mol，按 15.7 记账）。
 *
 *   单级（一块理论板过一次汽化-冷凝）：
 *     热 151 kJ/kg SiF₄
 *     电 151 / COP = 151 / 1.4 = **108 kJ/kg = 0.030 kWh/kg**（−60 °C 制冷，
 *     COP 1.4 是卡诺 2.66 的 53 %）。
 *
 *   整塔按回流比 R = 50（α=1.01 时 R_min 的量级；R 再低，450 级也分不开）：
 *     一段塔的电耗 = (R+1)·ΔH/COP = 51 × 151 / 1.4 = 5.50 MJ/kg SiF₄
 *                   = **1.53 kWh/kg SiF₄**
 *     5 段串起来 = 7.64 kWh/kg SiF₄ = **35 kWh/kg Si**
 *     加泵、真空、控制与 20 % 余量，设计值取 **40 kWh/kg ²⁸Si**。
 *
 *   ⚠️ **不要拿 450 去乘单级能耗。** 单级能耗是"一块板过一次回流"的口径；
 *   精馏塔的再沸器负荷由回流比定，不由板数定 —— 板数买的是塔高，不是热量。
 *   若按"每级各有一只再沸器"的级联口径硬乘：
 *     450 × 51 × 151 / 1.4 = 2.48 GJ/kg SiF₄ = 688 kWh/kg SiF₄
 *     = **3 184 kWh/kg Si** —— 这是上限，不是本设计的结构。
 *   热力学下限只有 24 kJ/kg（0.007 kWh/kg），工程值是它的 5 000 倍：
 *   同位素分离的代价在回流，不在热力学。
 *
 * ── 2.3 物料 ───────────────────────────────────────────────────────────────
 *
 *   1 kg 99.9 % ²⁸Si 要 0.999 kg ²⁸Si；天然硅里 ²⁸Si 占 0.9223
 *   ⇒ 进料 1.083 kg Si（理想切割）；实际塔顶/塔底都带 ²⁸Si，
 *   取 **1.25 kg 天然 Si = 4.63 kg SiF₄**，塔底 0.25 kg Si（²⁸Si 61.6 %）返回。
 *
 *   还原：SiF₄ + 2 Mg → Si + 2 MgF₂（720–780 °C，镁热还原，放热自持）
 *     4.63 kg SiF₄ + 2.16 kg Mg → 1 kg Si + 4.4 kg MgF₂
 *     （4.4 是按 1 kg Si 计的化学计量；进料多出的 20 % 是未反应料，回炉）
 *     渣用 2 kg HCl + 20 kg 超纯水洗掉，洗水去废酸处理（不登条目）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、直拉单晶：为什么还用 plant/cz-puller
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   工业的 ²⁸Si 单晶也是直拉（或区熔）。本层已有 `plant/cz-puller`
 *   （1410–1480 °C、石英坩埚、φ100 级），直接复用：
 *
 *     1.2 kg ²⁸Si + 0.06 kg Ar + 石英坩埚 1 只 → 1.0 kg 单晶（收得率 85 %）
 *
 *   **坩埚的同位素稀释要算**：石英坩埚是天然 SiO₂，1450 °C 下向熔体溶进
 *   ~100 ppm 的硅（`single-crystal.ts` 的坩埚账）。100 ppm × 天然硅的
 *   7.77 % 少数同位素 = **7.8 ppm 的 ²⁹Si/³⁰Si 增量**；产品 99.9 % 的
 *   少数同位素本来是 1 000 ppm，增量 0.8 % 相对 —— 可接受。
 *   若要做 99.99 %（100 ppm 少数），坩埚稀释就变成 8 %，必须换
 *   ²⁸SiO₂ 坩埚或区熔；本文件只交 99.9 %，把这条写进 §五④。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、硅球与密度：20.1914 mm 不是 20.1653 mm
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ²⁸Si 的摩尔质量 27.97793 g/mol，天然硅 28.0855 g/mol，比值 0.9961698。
 *   晶格常数随同位素的变化 ~1×10⁻⁵（10 ppm，进不确定度，不进设计值）：
 *
 *     ρ(²⁸Si, 25 °C) = 2.3290 × 0.9961698 = **2.32008 g/cm³**
 *
 *   （Avogadro 项目的 ²⁸Si 摩尔体积 12.0588 cm³/mol ⇒ 27.9769/12.0588
 *   = 2.3200 g/cm³，与本值差 3 ppm，落在 3–10 ppm 的窗口里。）
 *
 *   10 g 球的直径：
 *     V = 10 / 2.32008 = 4.31020 cm³
 *     D = (6V/π)^(1/3) = **2.01914 cm = 20.1914 mm**
 *
 *   ⚠️ **它比天然硅球的 20.1653 mm 大 0.026 mm。** 所以本文件不冒充
 *   `std/mass-standard-10g-si`：那一条的直径窗口是 20.1651–20.1655，
 *   是天然硅的 10 g；²⁸Si 球要单独立条目 `std/si-28-sphere`，窗口
 *   20–90 mm 覆盖 20.1914 与更大的球（1 kg 的 φ93.7 mm 不在 90 内，
 *   1 kg 档另立条目）。要把它接进电压天平，得**另立**一条 10 g ²⁸Si
 *   标准（φ20.1909–20.1919），不能改天然硅那条的窗口 ——
 *   它的 `make/mass-standard-10g-si` 给的是 20.1652–20.1654，会越界。
 *   这一步留给主 agent，本文件只交球与密度记录。
 *
 *   球度：5 轴抛光机 + 软质抛光模，W1 金刚石 + CeO₂，**0.1–0.2 µm**。
 *   直径测量：激光干涉 5 方向 × 3 角度，10 nm 读数 / 20 mm = **0.5 ppm**；
 *   形状残差 0.2 µm 取平均后 **2–3 ppm**。
 *
 *   密度测量（`measure/si-28-density`，在 `data/measure/g-absolute.ts`）：
 *   阿基米德法（20.000 °C 超纯水，ρ_w = 0.998207 g/cm³）+ 干涉测径：
 *     水密度 1–2 ppm、水温 0.01 K → 2 ppm、溶解气体 0.1 ppm、
 *     形状 2–3 ppm、天平 0.1 ppm、直径 0.5 ppm
 *     ⇒ 方和根 **3–10 ppm**（设计值，不是实测；实测走记录条目）。
 *
 *   电压天平 31 ppm 预算里，质量项 10–15 ppm → **3–5 ppm**；
 *   整机方和根 31 → **27–29 ppm**（其余项不动：
 *   间隙 20、力 13.5+6.5、保护环 5、对中 5、砝码 2.5、温度 3、源 2）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、剩余缺口（带数字，不拿"本层没有"当结论）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **α=1.01–1.02 是设计值，没有实测。** 本层没有 Si 同位素标准物质，
 *      HR-ICP-MS（R=10000–12000）能分开 ²⁹Si（28.9765）与 ²⁸SiH（28.9924）
 *      —— 需要 R ≈ 29/0.0159 = 1 824，R=10000 有 5.5 倍余量 —— 但
 *      质量歧视 1–2 %/u，用天然 Si 标样 bracketing 后，富集度绝对不确定度
 *      **0.05–0.1 %**（99.9 % 上就是 500–1 000 ppm 的相对 0.5–1 %）。
 *      ³⁰Si（0.001 %）在 0.1 ppb 量级，接近 HR-ICP-MS 的丰度灵敏度 1e-7，
 *      只能报"<0.02 %"。
 *   ② **450 级的塔没有水力学试验。** 板效率 0.6、板间距 0.3 m、
 *      压降 0.3–0.5 kPa/板（450 级 = 135–225 kPa）都是设计值；
 *      液泛点按 F 因子 1.2 算，没有SiF₄ 的实测表面张力/密度。
 *      塔顶 −60 °C、塔釜 −20 °C，复叠制冷的 COP 1.4 也是设计值。
 *   ③ **镁热还原 80 % 收率是设计值。** MgF₂ 渣 4.4 kg/kg Si（化学计量）
 *      没有下游条目（工业上可以电解回 Mg + F₂，本层没有 MgF₂ 电解槽）；
 *      洗水 22 kg 带 MgCl₂，去废酸处理，不登条目。
 *   ④ **99.99 % 需要换坩埚。** 天然石英坩埚在 99.9 % 上稀释 7.8 ppm
 *      （0.8 % 相对），在 99.99 % 上就是 8 %；再上一档要 ²⁸SiO₂ 坩埚
 *      （本层没有）或区熔（`plant/zone-refiner` 0 条）。
 *   ⑤ **密度没有第二套方法。** 阿基米德 + 干涉是同一套几何；要交叉验证
 *      得再建比重瓶/悬浮法，或进口一只 1 ppm 的 ²⁸Si 球。当前的 3–10 ppm
 *      是"一套方法 + 分项预算"，不是"两套方法互检"。
 *   ⑥ **1 kg 球不在本窗口。** 20–90 mm 覆盖 20.1914 与 90 mm；1 kg ²⁸Si
 *      球的 φ93.7 mm 超上限，要另立 `std/si-28-sphere-1kg` 与一台更大的
 *      抛光机（本层 5 轴抛光机 toolDiameter 5–200 mm 够，夹具不够）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、注册（本文件不改 tools/report/data.ts，由用户注册）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { SILICON_28_ITEMS, SILICON_28_ROUTES } from '../../data/material/silicon-28.ts';
 *   items 数组加  ...SILICON_28_ITEMS,
 *   routes 数组加 ...SILICON_28_ROUTES,
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const SILICON_28_ITEMS: readonly Item[] = [
  /**
   * **²⁸Si 富集硅：²⁸Si 99.9–99.95 %，金属纯度 99.9–99.99 %，kg 计。**
   *
   * 它不是"更纯的硅"，是**同位素换过的硅**：99.9 % 的 ²⁸Si 把天然硅
   * 7.77 % 的 ²⁹Si/³⁰Si 压到 0.1 %，密度从 2.3290 变成 2.32008 g/cm³，
   * 批次之间的同位素分散从 ~10 ppm 压到 <1 ppm。
   *
   * 金属纯度只到 99.9–99.99 %：镁热还原 + 酸洗带走 Mg/MgF₂，剩下的
   * Fe/Al/B/P 由直拉与后面的区熔（本层没有）继续降。直拉前的 99.9 %
   * 够用 —— 坩埚与舟本身还会带杂质，Cz 的分凝系数把大部分赶到尾料。
   */
  {
    id: 'mat/silicon-28-enriched',
    name: '²⁸Si 富集硅',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'enrichment', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
      { param: 'purity', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * **²⁸Si 单晶棒：直拉出来的圆柱，φ100 级，取向 <100>。**
   *
   * 与 `mat/silicon-single` 的区别只有一项：同位素。直拉的炉子、坩埚、
   * 收得率全一样（15 % 的头尾/滚磨/坩埚底损失），所以这一条不改
   * `plant/cz-puller`，只把投料换成富集硅。
   *
   * 取向写 <100>：球是各向同性的，取向只影响滚磨与抛光的余量；
   * <100> 的解理面少，磨球时崩边少。区熔若以后建起来，<100> 也通用。
   */
  {
    id: 'mat/silicon-28-single',
    name: '²⁸Si 单晶棒',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'enrichment', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
      { param: 'orientation', kind: 'enum', values: ['<100>', '<111>'] },
    ],
  },

  /**
   * **²⁸Si 球：直径 20–90 mm 一档，球度 ≤0.2 µm。**
   *
   * 10 g 档是 **φ20.1914 mm**（ρ = 2.32008 g/cm³），不是天然硅的
   * φ20.1653 mm —— 差 0.026 mm，正是 0.38 % 的密度差。20–90 mm 的
   * 窗口同时盖住 10 g 档与 0.9 kg 的中间档（φ90 mm ≈ 886 g）；
   * 1 kg 的 φ93.7 mm 超上限，见文件头 §五⑥。
   *
   * 球度 0.2 µm 是**形状**，不是直径：直径 10 nm（0.5 ppm）由激光干涉
   * 5 方向 × 3 角度取平均；形状残差 0.2 µm 对体积的贡献按 2–3 ppm 记
   * （不是 0.2/20 000 = 10 ppm —— 五个方向的平均把一阶形状项抵掉了）。
   *
   * 为什么不写 `mass`：同一个工艺做 10 g 到 0.9 kg，质量由直径与密度算，
   * 不写死。10 g 档的证书在 `mat/si-28-density-record`；要把它接进
   * 电压天平，得**另立**一条 10 g ²⁸Si 标准（φ20.1909–20.1919），
   * 不能改天然硅那条的窗口（见文件头 §四的警告，本文件不碰那条条目）。
   */
  {
    id: 'std/si-28-sphere',
    name: '²⁸Si 球',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 20, max: 90, unit: 'mm' },
      { param: 'sphericity', kind: 'range', min: 0, max: 0.2, unit: 'µm', dir: 'atMost' },
      { param: 'enrichment', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
      // 密度资格带，不是单次读数；记录里的 temperature 是测量条件，不是球的产品规格。
      { param: 'density', kind: 'range', min: 2.31, max: 2.33, unit: 'g/cm³' },
      { param: 'densityUncertainty', kind: 'range', min: 0, max: 10, unit: 'ppm', dir: 'atMost' },
    ],
  },

  /**
   * **SiF₄ 低温精馏塔：450 级、5 段、135 m，−100…−20 °C / 0.1–2 MPa。**
   *
   * 它不是 `plant/vacuum-column`：那一台的窗口是 40–160 °C / 5–60 kPa，
   * 是给二甲苯异构体用的；SiF₄ 在 40 °C 已经超临界（T_c = −14 °C），
   * 换窗口迁就需求就是造活，所以另立一台。
   *
   * 也不做填料塔：规整填料要 0.1 mm 波纹板与波纹辊，本层没有；
   * 筛板只要冲孔（`plant/press` 冲 5 mm 孔、开孔率 8 %），
   * 代价是压降 0.3–0.5 kPa/板与 135 m 的塔高。
   *
   * `holds` 的 −100…−20 °C 由塔自带的复叠制冷（−60 °C 冷凝器、
   * −20 °C 再沸器）维持；0.1–2 MPa 覆盖塔顶 0.3 MPa 与塔釜 0.9 MPa。
   * `stages`/`refluxRatio`/`throughput` 是设计能力，不是实测。
   */
  {
    id: 'plant/sif4-distillation',
    name: 'SiF₄ 低温精馏塔',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: -100, max: -20 },
      { param: 'pressure', min: 100, max: 2000 },
    ],
    props: [
      { param: 'stages', kind: 'range', min: 400, max: 500, unit: '级' },
      { param: 'refluxRatio', kind: 'range', min: 20, max: 100, unit: '1' },
      { param: 'throughput', kind: 'range', min: 0.5, max: 5, unit: 'kg/h' },
    ],
  },
];

export const SILICON_28_ROUTES: readonly Route[] = [
  {
    /**
     * **精馏塔：5 段 × 90 级筛板 + 再沸器/冷凝器 + 复叠制冷 + 真空机组。**
     *
     *   不锈钢 12 000 + 铜 300 + PTFE 30 + 矿棉 500 + 钢板 1 000
     *   + 电机 6 台 + 接触器 4 + 轴承 8 套
     *   → 精馏塔 1 台
     *
     * 135 m 的塔一次卷不出来，分 5 段、每段 28 m、法兰对接；塔板
     * 90 级/段、板间距 0.3 m，冲孔在 `plant/press` 上分 90 次冲，
     * 每块板 φ600、5 mm 孔、开孔率 8 %（约 1 800 孔/板）。
     *
     * 再沸器与冷凝器各 5 台（一段一对），列管式，铜管束；
     * 复叠制冷：−60 °C 用 R-23/乙烷类，−20 °C 用氨，压缩机 6 台电机。
     * 真空机组只用于开车前抽不凝气（N₂/Ar/F₂），正常运行时塔顶
     * 0.3 MPa 正压，不靠真空。
     *
     * ⚠️ 塔体焊缝没有射线探伤（本层没有 X 光机），只做 1.5 MPa 水压
     * 保压 30 min + 肥皂水查漏；塔板效率 0.6 与水力学全是设计值。
     */
    id: 'make/sif4-distillation',
    name: 'SiF₄ 低温精馏塔制造',
    rate: { hours: q(2000) },
    produces: [
      {
        item: 'plant/sif4-distillation',
        qty: q(1),
        gives: [
          { param: 'stages', kind: 'range', min: 450, max: 450 },
          { param: 'refluxRatio', kind: 'range', min: 20, max: 100 },
          { param: 'throughput', kind: 'range', min: 0.5, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(12000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(300) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(30) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(500) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1000) }] },
      { anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(6) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/bearing-general-p0', qty: q(8) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '卷焊 5 段筒节（φ600 × 28 m，6 mm 不锈钢），法兰端面车平', performedBy: 'plant/sheet-shop' },
      { note_zh: '冲 450 块筛板（5 mm 孔、开孔率 8 %、约 1 800 孔/板）+ 降液管与受液盘', performedBy: 'plant/press' },
      { note_zh: '车 10 只法兰与塔板外圆（φ600h9，与塔内壁间隙 0.3–0.5 mm）', performedBy: 'lathe' },
      { note_zh: '装 5 台再沸器/5 台冷凝器（铜管束胀接）+ 复叠制冷机组 + 真空机组', performedBy: 'plant/robot' },
      { note_zh: '5 段对接（石墨垫 + M20 对角三遍）+ 1.5 MPa 水压 30 min + 热风烘干 8 h', performedBy: 'plant/robot' },
    ],
    unbalanced_zh:
      '不锈钢 12 000 + 铜 300 + PTFE 30 + 矿棉 500 + 钢板 1 000 = 13 830 kg → 精馏塔 1 台；产物按台计，不进 kg 守恒。边角料与焊材 5 % 回炉，塔板冲孔废料按不锈钢回炉。450 级、R=20–100、0.5–5 kg/h 是设计值（Earth 工程值），水力学与板效率未实测',
  },

  {
    /**
     * **²⁸Si 富集：SiF₄ 精馏 → 镁热还原 → 酸洗 → HR-ICP-MS 定值。**
     *
     *   SiF₄ 4.63 + Mg 2.16 + HCl 2 + 超纯水 20 + N₂ 0.5 + 干冰 5
     *   + 异丙醇 1 + HF 0.05 + 亚沸 HNO₃ 0.01
     *   → ²⁸Si 1 kg（99.9–99.95 %）+ MgF₂ 渣 4.4（化学计量）+ 尾料 0.25（返回）
     *
     * 六步：
     *   ① **预冷与脱轻**：SiF₄ 进第一段塔顶冷凝器（−60 °C），N₂/Ar/F₂
     *      不凝，塔顶放空；F₂ 与 PTFE 垫片会缓慢反应，垫片用铜/石墨，
     *      PTFE 只做静密封（设计缺口，见 §五②）。
     *   ② **精馏**：450 级、R=50、塔顶 −60 °C / 0.3 MPa，塔釜 −20 °C /
     *      0.9 MPa；塔顶 ²⁸SiF₄ 99.9 %，塔底 61.6 % 返回。
     *   ③ **镁热还原**：SiF₄ + 2Mg → Si + 2MgF₂，720–780 °C，
     *      电阻炉、石墨坩埚；放热自持，产物是硅块，渣浮在上面。
     *   ④ **酸洗/水洗**：2 kg HCl 溶残余 Mg 与 MgF₂，20 kg 超纯水洗到
     *      中性（pH 6–8），洗水去废酸处理。
     *   ⑤ **干燥与定值**：80–120 °C 烘 4 h；HR-ICP-MS 测 ²⁹Si/²⁸Si 与
     *      ³⁰Si/²⁸Si（R=10000，天然 Si 标样 bracketing，质量歧视
     *      1–2 %/u 用标样压）；富集度绝对不确定度 0.05–0.1 %。
     *   ⑥ **包装**：惰性气氛（N₂）下装瓶，避免表面氧化。
     *
     * ⚠️ 干冰 5 kg 只用于开车预冷与停电保冷；正常冷量来自塔自带的
     * 复叠制冷。异丙醇 1 kg 是干冰浴的介质，回收使用，按 1 kg/批损耗记。
     */
    id: 'make/silicon-28-enriched',
    name: '²⁸Si 富集',
    rate: { hours: q(240) },
    produces: [
      {
        item: 'mat/silicon-28-enriched',
        qty: q(1),
        gives: [
          { param: 'enrichment', kind: 'range', min: 99.9, max: 99.95, record: 'mat/si28-enrichment-record' },
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-tetrafluoride', qty: q(463, 100) }] },
      { anyOf: [{ item: 'mat/magnesium', qty: q(216, 100) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(2) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(20) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/dry-ice', qty: q(5) }] },
      { anyOf: [{ item: 'mat/isopropanol', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/nitric-acid-subboiled', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '① 预冷/脱轻：SiF₄ 进塔顶冷凝器（−60 °C），N₂/Ar/F₂ 不凝放空；干冰 5 kg 只用于开车预冷',
        performedBy: 'plant/sif4-distillation',
        under: [{ param: 'temperature', min: -70, max: -40 }, { param: 'pressure', min: 300, max: 900 }],
      },
      {
        note_zh: '② 精馏：450 级、R=50，塔顶 −60 °C / 0.3 MPa，塔釜 −20 °C / 0.9 MPa；塔顶 ²⁸SiF₄ 99.9 %，塔底 61.6 % 返回',
        performedBy: 'plant/sif4-distillation',
        under: [{ param: 'temperature', min: -70, max: -40 }, { param: 'pressure', min: 300, max: 900 }],
      },
      {
        note_zh: '③ 镁热还原：SiF₄ + 2Mg → Si + 2MgF₂，720–780 °C，石墨坩埚；放热自持，硅块沉底、MgF₂ 渣浮面',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 720, max: 780 }],
      },
      {
        note_zh: '④ 酸洗/水洗：2 kg HCl 溶残余 Mg 与 MgF₂，20 kg 超纯水洗到 pH 6–8；洗水去废酸处理',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 40 }, { param: 'pressure', min: 100, max: 300 }],
      },
      {
        note_zh: '⑤ 干燥与定值：80–120 °C 烘 4 h；HR-ICP-MS 测 ²⁹Si/²⁸Si 与 ³⁰Si/²⁸Si（R=10000，天然 Si bracketing），富集度绝对不确定度 0.05–0.1 %',
        performedBy: 'plant/hr-icp-ms',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh: '⑥ 惰性气氛下装瓶（N₂），瓶口蜡封；每瓶附富集度与金属杂质证书',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '进 4.63 SiF₄ + 2.16 Mg + 2 HCl + 20 水 + 0.5 N₂ + 5 干冰 + 1 异丙醇 + 0.05 HF + 0.01 HNO₃ = 35.35 kg → ²⁸Si 1 kg；其余是 MgF₂ 渣 4.4、尾料 0.25（返回精馏）、CO₂ 5（放空）、洗水 22（带 MgCl₂，去废酸）、异丙醇 1（回收）。产物按 kg 计，质量账见左；富集度 99.9–99.95 %、金属纯度 99.9–99.99 %、40 kWh/kg 是设计值（Earth 工程值）',
  },

  {
    /**
     * **²⁸Si 直拉单晶：复用 `plant/cz-puller`，只换投料。**
     *
     *   富集硅 1.2 kg + 氩 0.06 kg + 石英坩埚 1 只 → 单晶 1 kg
     *
     * 四步与 `make/silicon-single` 完全同构：装料熔化 1420–1480、
     * 引晶缩颈、等径 1410–1450、收尾。收得率 85 %：切头尾、滚磨外圆、
     * 坩埚底杂质富集段（回炉）。
     *
     * **坩埚稀释**：天然石英坩埚在 1450 °C 向熔体溶 ~100 ppm 硅，
     * 带进 7.8 ppm 的 ²⁹Si/³⁰Si —— 对 99.9 %（1 000 ppm 少数）是 0.8 %
     * 相对，对 99.99 %（100 ppm 少数）是 8 %。所以这一条只交 99.9 %。
     *
     * 石英坩埚是一次性件（SiO₂ + Si → 2SiO↑，1450 °C 内壁方石英化），
     * 拉一根换一只；这里按 1 只/批记，与 `plant/cz-puller` 的
     * `consumption`（1 只/60 h）不冲突：条目记的是运行消耗，路线记的是
     * 这一批的投料。
     */
    id: 'make/silicon-28-single',
    name: '²⁸Si 直拉单晶制备',
    rate: { hours: q(60) },
    produces: [
      {
        item: 'mat/silicon-28-single',
        qty: q(1),
        gives: [
          { param: 'enrichment', kind: 'range', min: 99.9, max: 99.95 },
          { param: 'orientation', kind: 'enum', oneOf: ['<100>'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-28-enriched', qty: q(6, 5) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(3, 50) }] },
      { anyOf: [{ item: 'mat/quartz-crucible', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '装料、抽真空、充氩、熔化：1.2 kg ²⁸Si 装石英坩埚，1420–1480 °C',
        performedBy: 'plant/cz-puller',
        under: [{ param: 'temperature', min: 1420, max: 1480 }],
      },
      {
        note_zh: '引晶与缩颈：籽晶接触液面，先拉细 φ3–5 mm 把位错长出去',
        performedBy: 'plant/cz-puller',
        under: [{ param: 'temperature', min: 1420, max: 1480 }],
      },
      {
        note_zh: '等径生长：1410–1450 °C，坩埚 5–10 rpm、晶体反向 10–20 rpm，直径靠测径头闭环',
        performedBy: 'plant/cz-puller',
        under: [{ param: 'temperature', min: 1410, max: 1450 }],
      },
      {
        note_zh: '收尾与冷却：加速收锥、停热、冷却 8 h 取棒；切头尾、滚磨外圆，收得率 85 %',
        performedBy: 'plant/cz-puller',
        under: [{ param: 'temperature', min: 1410, max: 1450 }],
      },
    ],
    unbalanced_zh:
      '富集硅 1.2 + 氩 0.06 = 1.26 kg + 石英坩埚 1 只 → 单晶 1 kg；0.26 kg 是切头尾、滚磨与坩埚底（回炉）。坩埚带进 7.8 ppm 的 ²⁹Si/³⁰Si（100 ppm 天然硅 × 7.77 %），99.9 % 档可接受。产物按 kg 计，不进 kg 守恒',
  },

  {
    /**
     * **²⁸Si 球：切块 → 粗磨球 → 精研/抛光 → 稳定化 → 测径。**
     *
     *   ²⁸Si 单晶 0.05 kg → 球 1 件（10 g 档 φ20.1914 mm）
     *
     * 五道工序与 `make/mass-standard-10g-si` 同构，只把材料换成 ²⁸Si、
     * 把直径目标换成 20.1914 mm：
     *   ① 线锯切 20×20×22 mm 块（砂轮冲击会留微裂纹，后面抛光扩成凹坑）
     *   ② 杯形金刚石砂轮 + 双转子研磨，球度 5–10 µm
     *   ③ 5 轴抛光机 + 软质抛光模，W1 金刚石 + CeO₂，球度 0.1–0.2 µm
     *   ④ 19–21 °C 放 72 h，表面应力与吸附层稳定
     *   ⑤ 激光干涉 5 方向 × 3 角度测径，10 nm 读数；折射率用
     *      `plant/refractometer` 修正（20 mm 上 (n−1)d = 50.8 nm = 2.5 ppm）
     *
     * ⚠️ 球度 0.1–0.2 µm 是设计值：5 轴抛光机的定位是 1 µm，球度由
     * 抛光模与对研决定，不由机床定位决定。第一批实测 5 方向直径，
     * 极差 >0.2 µm 就退回重抛。
     */
    id: 'make/si-28-sphere',
    name: '²⁸Si 球制造',
    rate: { hours: q(72) },
    produces: [
      {
        item: 'std/si-28-sphere',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 20.185, max: 20.195 },
          { param: 'sphericity', kind: 'range', min: 0.1, max: 0.2 },
          { param: 'enrichment', kind: 'range', min: 99.9, max: 99.95 },
          // 密度资格带，不是单次读数；temperature 是测量条件，不写成球的产品规格。
          { param: 'density', kind: 'range', min: 2.31, max: 2.33, record: 'mat/si-28-density-record' },
          { param: 'densityUncertainty', kind: 'range', min: 0, max: 10, record: 'mat/si-28-density-record' },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/silicon-28-single', qty: q(1, 20) }] }],
    needs: ['plant/metrology-room', 'plant/refractometer'],
    steps: [
      {
        note_zh: '线锯切 20×20×22 mm 块（留 2 mm 余量），去油、酸洗、超纯水冲',
        performedBy: 'plant/wire-saw',
      },
      {
        note_zh: '粗磨球：杯形金刚石砂轮 + 双转子研磨，方块磨成球坯，球度 5–10 µm',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '精研/抛光：5 轴抛光机 + 软质抛光模，W1 金刚石 + CeO₂，球度 0.1–0.2 µm；抛光模定期修整',
        performedBy: 'plant/cnc-polisher-5axis',
      },
      {
        note_zh: '稳定化：19–21 °C 放 72 h，表面应力与吸附层稳定后再测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '测径：激光干涉 5 方向 × 3 角度，取平均到 10 nm（0.5 ppm）；折射率用 refractometer 修正',
        performedBy: 'plant/laser-stage',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '²⁸Si 单晶 0.05 kg → 球 1 件（10 g 档 0.010 kg）；0.040 kg 是套料、磨球与抛光损失（硅屑可回炉，抛光液里的硅不收）。产物按件计，不进 kg 守恒。直径 20.1914 mm、球度 0.1–0.2 µm、富集度 99.9–99.95 % 是设计值（Earth 工程值），实测走测径记录',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...SILICON_28_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...SILICON_28_ROUTES];
