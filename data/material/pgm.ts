/**
 * 铂族金属 —— Pt / Pd 从阳极泥到 99.95 % 海绵金属。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 0. 为什么是这一条链（本轮 grep 结论）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `mat/platinum`、`mat/palladium`、`pgm` 建本文件之前全表 **0 条目**；`mat/anode-sludge`
 *   已有（`data/material/chain.ts:201`：铜/镍电解精炼的阳极泥，10 kg/1000 kg 阴极）。
 *   于是下游四处卡在同一张料表上：
 *
 *     `data/machine/h2-sensor.ts`       pellistor（Pt 丝线圈 + Pd 催化剂）→ 只能做 TCD
 *     `data/material/hydrogen-peroxide.ts` 蒽醌法 Pd 催化剂 → 3–5 wt% 的稀品
 *     `data/material/mlcc.ts`           Ag/Pd 内电极 → 只能纯银
 *     `data/machine/damascene.ts`       PdCl₂ 活化 → 化学镀铜缺催化剂
 *
 *   本文件只回答"铂与钯怎么从阳极泥里分出来"，不回答 pellistor 怎么绕线、
 *   MLCC 怎么流延 —— 那些是下游的事，料通了它们才有得谈。
 *
 * ⚠️ 任务里写的 `mat/anode-slime` 在本层叫 `mat/anode-sludge`（已有，不另建）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 1. 料从哪来：只走阳极泥，不新开矿
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   镍/铜硫化物精矿 → 浮选 → 矿热炉 → 电解精炼 → 阳极泥
 *        （`make/nickel`、`make/copper` 已经在做，本文件只借它们的副产；
 *          `plant/electrorefining` 就是那一步的执行设备，不重复建）
 *
 *   铂族在电解条件下不溶（标准电位比铜高得多），所以全部富集在阳极泥里。
 *   这是全厂**唯一**的铂族入口，与金/银/硒同一条入口 —— 不是"顺便回收"，
 *   是没有第二条路。
 *
 *   本文件按**镍侧阳极泥**设计（镍电解的泥比铜侧富一个数量级）：
 *
 *     设计品位（Earth 工程值，不是火星实测）：
 *       Pt 8.0 %、Pd 10.0 %、Rh 0.5 %、Ru 0.6 %、Ir 0.2 %、Os 0.1 %
 *       Au 2.0 %、Ag 5.0 %、Cu 20 %、Ni 10 %、Fe 10 %、Pb 5 %
 *       Sb 1.0 %、As 1.0 %、Te 0.5 %、S 4.0 %、SiO₂ 12 %、水/氧 10.1 %
 *
 *     1000 kg 这样的泥含 Pt 80 kg、Pd 100 kg、总 PGM 194 kg。
 *
 *   Se/Te 不在本表：它们走 `precious.ts` 的硫酸化焙烧路线（1000 kg 泥 → 60 kg Se）；
 *   本路线的焙烧把 Se/Te 赶进烟尘（`mat/tailings`），不单独回收 —— 两套账
 *   不混在一起，免得"同一吨泥出两次硒"。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 2. 四步：富集 → 浸出 → 分离 → 还原
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① 富集   阳极泥 1000 → 焙烧 850–900（roaster）→ 矿热炉 1500–1600
 *            （submerged-arc-furnace，石灰+硅石造渣、碳还原）
 *            → 铂族精矿 400 kg（PGM 47.3 %）+ 炉渣 540 + SO₂ 80
 *              + CO 159 + CO₂ 300 + 烟尘 121
 *
 *   ② 浸出   精矿 1000 + 32 % 盐酸 1500 + 氯气 800 + 水 1100
 *            → 氯化液 3900（Pt 47.5 g/L、Pd 59.4 g/L）+ 浸出渣 500
 *            （AgCl、Rh、Ir、SiO₂ 进渣；Os/Ru 以氧化物随氯气走一部分）
 *
 *   ③ 分离   氯化液 → SO₂ 还原金 45 kg → 蒸馏 Os/Ru（100–110 °C）
 *            → 加 NH₄Cl 选择性沉淀 (NH₄)₂PtCl₆ 409 kg
 *            → 滤液即钯液 3749（Pd 61.8 g/L）
 *
 *   ④ 还原   (NH₄)₂PtCl₆ 409 → 煅烧 600–800（resistance-furnace）
 *            → 海绵铂 174 kg + NH₄Cl 99 + Cl₂ 131
 *            Pd 液 3749 + NH₄Cl 10（二次沉铂）+ NH₃ 550 + HCl 480
 *            + 甲酸 130 + NaOH 230
 *            → 海绵钯 215 kg + CO₂ 89 + 盐 237 + 水 73 + 二次铂盐 13
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 3. 用户点名要的三个数
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   纯度（设计值，Earth 工程值）
 *     Pt 99.9–99.99 %，取 **99.95 %**；杂质主要是 Rh/Ir（<0.05 %）
 *     Pd 99.9–99.99 %，取 **99.95 %**；杂质主要是 Pt 与贱金属（<0.05 %）
 *     两次交付都落在 `gives` 的 99.9–99.99 窗口里；条目声明 99–100 %（atLeast）。
 *
 *   收率（设计值，Earth 工程值）
 *     Pt  浸出 95 % × 沉淀 97 % × 煅烧 97 % = **89.4 %**（取 89 %）
 *     Pd  浸出 95 % × 还原 93 % = **88.4 %**（取 88 %）
 *     两者都在任务给的 60–90 % 窗口内；不是 99 % —— 母液里那 7–8 % 的
 *     Pt/Pd 没有回收路线，记在 `unbalanced_zh` 里，不假装它没丢。
 *
 *   每 kg 精矿的酸耗（设计值，Earth 工程值）
 *     32 % 盐酸 **1.5 kg/kg**（= 0.48 kg HCl/kg；化学计量 0.249，过量 1.9×）
 *     氯气 **0.8 kg/kg**（化学计量 0.654，过量 1.2×）
 *     王水路线（备选）2.5 kg 32 % HCl + 0.6 kg 65 % HNO₃ —— 本层不用：
 *     硝酸要氨，硝烟与硝酸盐废液也没有处理路线；氯气路线把氮省下来。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 4. 为什么不用溶剂萃取（MIBK / 胺类）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   地球主流是 MIBK（甲基异丁基酮）萃取金、胺类萃取铂，但 MIBK 是 C6 酮，
 *   要异丁烯/丙酮两条有机链；本层的有机化学只到 C1/C2（`organic.ts`），
 *   没有 C6 酮，也没有萃取剂再生那套碱洗/酸洗。硬写 MIBK 就是编。
 *
 *   所以走 **NH₄Cl 选择性沉淀**：Pt(IV) 以 [PtCl₆]²⁻ 存在，加 NH₄⁺ 生成
 *   难溶的 (NH₄)₂PtCl₆（黄色）；Pd(II) 的 (NH₄)₂PdCl₄ 可溶，留在液相。
 *   这是 19 世纪的办法，慢、要反复结晶，但不需要有机萃取剂。
 *   代价：一次沉淀的 Pt 纯度只有 99.0–99.9 %，要 99.95 % 得重结晶一次；
 *   本文件把重结晶折进 97 % 的煅烧收率里，不单独建路线（R8：升级路线是
 *   "二次结晶 + 更纯的 NH₄Cl"，缺口在杂质项，不在设备）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 5. 与已有文件的边界
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   · 不碰 `mat/anode-sludge` 的产出路线（铜/镍两条在 `ores.ts`）。
 *   · 不碰 `make/anode-sludge-roast` / `make/silver-from-sludge` / `make/gold-from-sludge`
 *     —— 那三条是"先提银金、再提铂族"的串联版；本文件是"直接富集铂族"的
 *     并联版。两条都是 OR，模型不判资源竞争，所以两条并存。
 *   · 不建 `mat/osmium` / `mat/ruthenium` / `mat/iridium`：本层没有它们的确切
 *     下游，建了就是"把没人要的换成没人要的"（byproducts.ts 的立场）。
 *     `mat/rhodium` 例外：由 `data/material/rhodium.ts` 产出
 *     碱熔六步湿法（Rh 占 PGM 的 2.5 %，12 kg/1000 kg 精矿）。
 *     蒸馏出来的 Os/Ru 进碱洗塔，按 `mat/tailings` 记，不单列条目。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 6. 已知缺口（R7：按量级记，不作终止条件）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **Pt 有火试金 + 灰吹损失修正（`measure/assay.ts`）；Pd/Rh/Ir 仍缺化验。**
 *      `measure/pt-assay-corrected` 已把灰吹回收率 99.5–99.9 % 修进去，
 *      uncertainty 0.01–0.03 %；`mat/pt-assay-record` 保留为未修正的历史记录。
 *      Pd/Rh/Ir/Os/Ru 没有对应标液/火试金，品位仍是设计值；本文件不建
 *      measure/*（R13），测量全在 `data/measure/assay.ts`。
 *   ② **Pt 丝/箔有产出路线，Pd 催化剂/Pt 黑仍未建。** 本文件只交
 *      海绵金属；`pgm-products.ts` 已把丝/箔拉出来，Pd/Al₂O₃ 催化剂与
 *      Pt 黑镀层仍留给下游文件。pellistor 仍在 `h2-sensor.ts` 里用 TCD。
 *   ③ **Os/Ru 没有回收。** 蒸馏出来的是混合氧化物，进碱洗塔后按尾渣记；
 *      要单列 Os/Ru 条目，先得有它们的用途（本层没有）。
 *   ④ **Rh 有产出路线，Ir 仍在渣里。** Rh 不溶于盐酸+氯气，要
 *      碱熔/硫酸氢钠熔融；`rhodium.ts` 已用六步湿法吃精矿（与 Pt/Pd 氯化
 *      浸出并联），把 Rh 拉回本地链。**Pt/Pd 氯化渣里的 Rh 仍未单独回收**
 *      （Rh 路线吃精矿，不吃那张渣）；Ir 仍无路线，渣按 `mat/tailings` 记。
 *   ⑤ **没有 PGM 的循环料。** 废催化剂、废坩埚、废滤纸里的 Pt/Pd 不回收；
 *      本层没有"废料"类别，只有 `mat/tailings`，所以这一笔不在账上。
 *   ⑥ **富集段没有测氧/测硫。** 焙烧与矿热炉的终点靠火色与抽气时间；
 *      同一处降级（本层没有氧分析仪）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、材料条目
//
// 六个：精矿 → 氯化液 → 钯液 → 铂盐 → 铂、钯。中间体都建条目，因为
// 下游要按"这条液里 Pd 多少 g/L"配料；把中间体塞进注释，浓度就丢了。
// ═══════════════════════════════════════════════════════════════════════════

export const PGM_MATERIAL_ITEMS: readonly Item[] = [
  /**
   * 铂族精矿。**PGM 45–50 %（设计 47.3 %），其中 Pt 19.5 %、Pd 24.4 %。**
   *
   * 它不是"矿石"，是阳极泥经焙烧 + 矿热炉还原之后富集出来的金属相：
   * 1000 kg 镍侧阳极泥（Pt 8 %、Pd 10 %）→ 400 kg 精矿，富集 2.5 : 1
   * （按总 PGM 算 194 kg → 189 kg，富集比只有 2.4 : 1；真正拉开的是
   * 贱金属与硫：Cu+Ni+Fe+Pb 450 kg → 120 kg，S 40 kg → SO₂ 80 kg）。
   *
   * 为什么不是 90 %：矿热炉的金属相里还有 Cu/Ni/Fe/Pb 与 1 % 的碳，
   * 它们要到氯化浸出那一步才分得出去。把精矿写成 90 % 会让后面
   * 500 kg 的浸出渣凭空消失。
   *
   * 品位是设计值：没有阳极泥化验（缺口①）。
   */
  {
    id: 'mat/pgm-concentrate',
    name: 'PGM Concentrate', name_zh: '铂族精矿',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'pgm', kind: 'range', min: 30, max: 70, unit: '%', dir: 'atLeast' }],
  },

  /**
   * 氯化液（铂族浸出液）。**Pt 46–49 g/L、Pd 58–61 g/L。**
   *
   * 盐酸 + 氯气把 Pt/Pd/Au 从精矿里溶出来：
   *
   *   Pt + 2Cl₂ + 2HCl → H₂PtCl₆
   *   Pd + Cl₂ + 2HCl → H₂PdCl₄
   *   2Au + 3Cl₂ + 2HCl → 2HAuCl₄
   *
   * 氯化液里还有 Cu/Ni/Fe 的氯合物；它们不影响 Pt/Pd 的沉淀，
   * 但会占体积，所以 Pt/Pd 的 g/L 只有 47/59，不是 200。
   */
  {
    id: 'mat/pgm-chloride-solution',
    name: 'Chloride Solution', name_zh: '氯化液',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'pt', kind: 'range', min: 20, max: 70, unit: 'g/L', dir: 'atLeast' },
      { param: 'pd', kind: 'range', min: 30, max: 80, unit: 'g/L', dir: 'atLeast' },
    ],
  },

  /**
   * 钯液（沉铂后的滤液）。**Pd 60–63 g/L。**
   *
   * 加 NH₄Cl 之后 Pt 以 (NH₄)₂PtCl₆ 沉出，Pd 留在液相 —— 这是选择性沉淀的
   * 全部依据：Pt(IV) 的氯合铵盐难溶，Pd(II) 的可溶。液里还剩 3 % 的 Pt
   * 与 7 % 的 Pd（没还原完），Pt 在钯那一步二次沉淀，Pd 进甲酸钠还原。
   */
  {
    id: 'mat/pgm-pd-solution',
    name: 'Palladium Solution', name_zh: '钯液',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'pd', kind: 'range', min: 30, max: 80, unit: 'g/L', dir: 'atLeast' }],
  },

  /**
   * 氯铂酸铵（(NH₄)₂PtCl₆）。**黄色晶体，Pt 43.95 %（化学计量）。**
   *
   * 它是 Pt 的中间体：过滤、洗涤、干燥后进电阻炉煅烧：
   *
   *   (NH₄)₂PtCl₆ → Pt + 2NH₄Cl + 2Cl₂     600–800 °C
   *
   * 这个分解反应同时把 NH₄Cl 与 Cl₂ 还回流程 —— 两条都是本层已有的条目，
   * 所以铂那一步的质量账能闭，不用做"余量是废气"的声明。
   */
  {
    id: 'mat/ammonium-hexachloroplatinate',
    name: 'Ammonium Hexachloroplatinate', name_zh: '氯铂酸铵',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 95, max: 100, unit: '%', dir: 'atLeast' }],
  },

  /**
   * 铂（海绵铂）。**99.9–99.99 %，设计 99.95 %；形态 sponge。**
   *
   * 海绵铂是煅烧的直接产物，不是致密锭：比表面积大、表面吸附氧，
   * 但做催化剂与 pellistor 的 Pt 丝坯料都从海绵铂起 —— 先熔锭再拉丝，
   * 或直接压坯。本层只交海绵，拉丝是下游（缺口②）。
   */
  {
    id: 'mat/platinum',
    name: 'Platinum', name_zh: '铂',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'form', kind: 'enum', values: ['sponge', 'powder', 'wire', 'sheet'] },
    ],
  },

  /**
   * 钯（海绵钯）。**99.9–99.99 %，设计 99.95 %；形态 sponge。**
   *
   * 甲酸钠还原出来的是黑色钯黑/海绵钯，洗涤干燥后就是产品。
   * 它比铂容易加工（延展性好、熔点低 283 K），但本层同样只交海绵。
   */
  {
    id: 'mat/palladium',
    name: 'Palladium', name_zh: '钯',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'form', kind: 'enum', values: ['sponge', 'powder', 'wire', 'sheet'] },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、设备条目与零件
//
// 精炼线是一条线，不是一台炉：浸出槽 → 蒸馏柱 → 沉淀槽 → 压滤机 → 碱洗塔。
// 所以 unit 是"套"，五件工艺设备（外加机架）各自可换 —— 与 `plant/ore-beneficiary`
// 同一处理。
// `holds` 只写湿法段（20–120 °C、100–500 kPa）；600–800 °C 的煅烧不在这条线上，
// 用已有的 `plant/resistance-furnace`（100–1100 °C）。把 800 °C 塞进这条线的
// holds 会把它写成一台万能炉，那是纸面能力。
// ═══════════════════════════════════════════════════════════════════════════

export const PGM_REFINERY_PARTS: readonly Item[] = [
  /** 浸出槽。316L 卷焊 + PTFE 衬里 + 搅拌 + 氯气分布器；80–100 °C、浓盐酸。 */
  { id: 'plant/pgm-refinery/leach-tank', name: 'PGM Leach Tank', name_zh: 'PGM 浸出槽', unit: '件', category: 'part' },

  /** 蒸馏柱。100–110 °C 蒸 OsO₄/RuO₄；316L 外壳 + PTFE 填料 + 冷凝段。 */
  { id: 'plant/pgm-refinery/distillation-column', name: 'PGM Distillation Column', name_zh: 'PGM 蒸馏柱', unit: '件', category: 'part' },

  /** 沉淀槽。20–40 °C 加 NH₄Cl，慢搅 4–8 h；316L + PTFE，带加料漏斗。 */
  { id: 'plant/pgm-refinery/precipitator', name: 'PGM Precipitator', name_zh: 'PGM 沉淀槽', unit: '件', category: 'part' },

  /** 压滤机。PTFE 滤板 + 316L 框；滤饼洗涤到 Cl⁻ ≤50 ppm（AgNO₃ 检不出）。 */
  { id: 'plant/pgm-refinery/filter-press', name: 'PGM Filter Press', name_zh: 'PGM 压滤机', unit: '件', category: 'part' },

  /** 碱洗塔。NaOH 循环吸收 Cl₂/HCl/OsO₄；PTFE 填料 + 316L 塔体。 */
  { id: 'plant/pgm-refinery/scrubber', name: 'PGM Alkali Scrubber', name_zh: 'PGM 碱洗塔', unit: '件', category: 'part' },

  /** 机架与管路。型材焊接 + 法兰 + PTFE 垫；把五件连成一条线。 */
  { id: 'plant/pgm-refinery/frame', name: 'PGM Refinery Frame and Piping', name_zh: 'PGM 精炼装置机架与管路', unit: '件', category: 'part' },
];

/**
 * 铂族精炼线（`plant/pgm-refinery`）。**20–120 °C、100–500 kPa。**
 *
 * 这条线做四件事：氯气浸出、Os/Ru 蒸馏、NH₄Cl 选择性沉淀、甲酸钠还原 Pd。
 * 它不做煅烧 —— 600–800 °C 的 (NH₄)₂PtCl₆ 分解在电阻炉里做，两条路线分开，
 * 因为"湿法槽"与"煅烧炉"不是同一台设备，写成一台就看不见这个区别。
 *
 * `holds` 的压力 100–500 kPa 是必须的：火星 0.6 kPa 下 80 °C 的盐酸会沸腾，
 * 浸出槽必须是压力容器。温度上限 120 °C 由 PTFE 衬里定（PTFE 长期 260 °C，
 * 但 120 °C 以上 HCl/Cl₂ 对 316L 的腐蚀速率开始上翘，取 120 作工程上限）。
 */
export const PGM_REFINERY: Item = {
  id: 'plant/pgm-refinery',
  name: 'PGM Refinery', name_zh: 'PGM 精炼装置',
  unit: '套',
  category: 'machine',
  holds: [
    { param: 'temperature', min: 20, max: 120 },
    { param: 'pressure', min: 100, max: 500 },
  ],
  composedOf: [
    ...PGM_REFINERY_PARTS.map((p) => ({ item: p.id, qty: q(1) })),
    { item: 'std/motor-7.5kw-4p', qty: q(1) },
    { item: 'std/contactor-general', qty: q(1) },
    { item: 'std/thermocouple-t-general', qty: q(1) },
    { item: 'std/process-controller-general', qty: q(1) },
  ],
};

/**
 * 一个出口：材料 + 零件 + 整线，按注册顺序拼好。
 * 父任务加一行 import + 一个 spread 就能注册（见文件末的接线说明）。
 */
export const PGM_ITEMS: readonly Item[] = [...PGM_MATERIAL_ITEMS, ...PGM_REFINERY_PARTS, PGM_REFINERY];

// ═══════════════════════════════════════════════════════════════════════════
// 三、路线
// ═══════════════════════════════════════════════════════════════════════════

export const PGM_ROUTES: readonly Route[] = [
  /**
   * ① 富集：阳极泥 → 焙烧 → 矿热炉 → 铂族精矿。
   *
   *   阳极泥 1000 + 石灰 100 + 硅石 100 + 碳 150 + 氧 250 = 1600
   *   → 精矿 400 + 炉渣 540 + SO₂ 80 + CO 159 + CO₂ 300 + 烟尘 121 = 1600
   *
   * 两段：
   *   焙烧 850–900 °C：S 变成 SO₂（40 kg S → 80 kg SO₂），As/Te/Pb 部分挥发；
   *      Ag/Au/PGM 留在焙砂里（Ag₂S 在 850 °C 还没大量分解）。
   *   矿热炉 1500–1600 °C：石灰 + 硅石造渣，碳把 Fe/Ni/Cu 的氧化物还原成金属；
   *      PGM/Au/Ag 与部分 Cu/Ni/Fe 形成金属相（精矿 400 kg），其余进渣。
   *      碳 150 kg 的去处：68 kg → CO 159 kg、82 kg → CO₂ 300 kg（合计 150 kg C）；
   *      炉气里的 CO 可以回 `make/water-gas-shift` 榨氢，不是废气。
   *
   * 为什么是 1500–1600 而不是更低：FeO-SiO₂-CaO 渣的熔点在这段，
   * 低于 1500 渣黏、金属珠沉不下去，PGM 会跟着渣走。
   * 为什么不是 1800：再高 Pb/As 挥发更猛，且碳电极消耗对不上（本层只有
   * `std/carbon-electrode-300` 一档）；1500–1600 是矿热炉区间的下三分之一。
   *
   * 收率：PGM 97.5 %（194 → 189 kg），Au 97.5 %（20 → 19.5 kg），
   * Ag 97.5 %（50 → 48.75 kg）。损失的 2.5 % 在炉渣与烟尘里，没有回收路线。
   *
   * 品位是设计值（缺口①）：没有阳极泥的化验，8 %/10 % 是地球镍精炼的
   * 工程值，不是火星实测。
   */
  {
    id: 'make/pgm-concentrate',
    name: 'PGM Concentrate Production', name_zh: '铂族精矿制备',
    // 一批 48 h：焙烧 24 h + 矿热炉 24 h（含升温与出料）。
    rate: { hours: q(48) },
    produces: [
      {
        item: 'mat/pgm-concentrate',
        qty: q(400),
        gives: [{ param: 'pgm', kind: 'range', min: 45, max: 50 }],
      },
      { item: 'mat/slag', qty: q(540) },
      { item: 'mat/so2', qty: q(80) },
      {
        item: 'mat/co',
        qty: q(159),
        gives: [{ param: 'purity', kind: 'range', min: 60, max: 80 }],
      },
      { item: 'mat/co2', qty: q(300) },
      { item: 'mat/tailings', qty: q(121) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/anode-sludge', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(100) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(100) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(150) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(250) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh:
          '焙烧 850–900 °C：S→SO₂（40 kg S → 80 kg SO₂），As/Te/Pb 部分挥发进烟尘；Ag/Au/PGM 留在焙砂',
        performedBy: 'plant/roaster',
        under: [{ param: 'temperature', min: 850, max: 900 }],
      },
      {
        note_zh:
          '矿热炉 1500–1600 °C：石灰 100 + 硅石 100 造渣，碳 150 还原（68 kg C → CO 159、82 kg C → CO₂ 300）；PGM/Au/Ag 与部分 Cu/Ni/Fe 进金属相（精矿 400 kg），其余进渣 540 kg',
        performedBy: 'plant/submerged-arc-furnace',
        under: [{ param: 'temperature', min: 1500, max: 1600 }],
      },
    ],
  },

  /**
   * ② 氯气浸出：精矿 → 氯化液 + 浸出渣。
   *
   *   精矿 1000 + 32 % 盐酸 1500 + 氯气 800 + 水 1100 = 4400
   *   → 氯化液 3900 + 浸出渣 500 = 4400
   *
   *   1000 kg 精矿 = 2.5 批富集（2500 kg 阳极泥，见 `make/pgm-concentrate`）；
   *   精矿里的 Pt 195 kg、Pd 244 kg 就是下游收率的分母。
   *
   * 酸耗（用户点名）：**每 kg 精矿 1.5 kg 32 % 盐酸 + 0.8 kg 氯气**。
   *   化学计量：HCl 0.249 kg/kg（Pt 0.073 + Pd 0.167 + Au 0.009），
   *   实配 0.48 kg/kg ⇒ 过量 1.9×；Cl₂ 0.654 kg/kg（含 Cu/Ni/Fe 的氯化），
   *   实配 0.8 ⇒ 过量 1.2×。过量酸是为了把 Pt(IV) 稳定在 [PtCl₆]²⁻，
   *   酸度低了会水解成 Pt(OH)₂ 胶体，过滤时穿滤。
   *
   * 80–100 °C：低于 80 氯化慢（Pt 的溶解要活化），高于 100 盐酸蒸气压
   * 太高、氯气溶解度掉；湿法槽是压力容器（100–300 kPa），所以 100 °C 不沸腾。
   *
   * 分配（设计值）：
   *   Pt 95 %（195 → 185.25 kg）、Pd 95 %（244 → 231.8 kg）、Au 95 %（49 → 46.55 kg）
   *   进液；Ag 以 AgCl 进渣（122 kg Ag → 162 kg AgCl），Rh 12 / Ir 5 进渣，
   *   Ru 15 与 Os 2 的 80 % 以 RuO₄/OsO₄ 随氯气进气相（后接蒸馏与碱洗），
   *   20 % 进渣。渣 500 kg 的组成（设计值）：AgCl 162 + Rh 12 + Ir 5 + Ru 3
   *   + Os 0.4 + Pb 20 + SiO₂ 51 + 残碳 5 + 未反应物 241.6；不单列条目。
   *
   * 为什么渣不单列：它没有下游 —— AgCl 可以回银那条线，但本文件不建
   * "AgCl → Ag"的路线（`make/silver-from-sludge` 走的是硝酸法，不是氯化银）；
   * Ir 仍没有下游。Rh 现在有 `rhodium.ts` 的路线，但那条吃精矿、不吃这张渣
   * （真实厂会吃渣；模型里 `mat/tailings` 标识不了来源）。建一个
   * `mat/pgm-residue` 只是多一个没人吃的条目，所以按 `mat/tailings` 记，
   * 缺口写在文件头③④。
   */
  {
    id: 'make/pgm-chloride-solution',
    name: 'Chloride Solution Production', name_zh: '氯化液制备',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'mat/pgm-chloride-solution',
        qty: q(3900),
        gives: [
          { param: 'pt', kind: 'range', min: 46, max: 49 },
          { param: 'pd', kind: 'range', min: 58, max: 61 },
        ],
      },
      { item: 'mat/tailings', qty: q(500) },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/pgm-concentrate',
            qty: q(1000),
            need: [{ param: 'pgm', kind: 'range', min: 45, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/hcl',
            qty: q(1500),
            need: [{ param: 'concentration', kind: 'range', min: 30, max: 33 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/chlorine', qty: q(800) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1100) }] },
    ],
    needs: [],
    performedBy: 'plant/pgm-refinery',
    under: [
      { param: 'temperature', min: 80, max: 100 },
      { param: 'pressure', min: 100, max: 300 },
    ],
  },

  /**
   * ③ 分离：氯化液 → 金 + 铂盐 + 钯液。
   *
   *   氯化液 3900 + NH₄Cl 300 + SO₂ 25 = 4225
   *   → 金 45 + 铂盐 409 + 钯液 3749 + 尾渣 22 = 4225
   *
   * 四段：
   *   ⑴ SO₂ 还原金（60–80 °C）：2HAuCl₄ + 3SO₂ + 6H₂O → 2Au + 3H₂SO₄ + 8HCl。
   *      46.55 kg Au 理论要 21.9 kg SO₂，实配 25（过量 14 %）；收 45 kg（97 %）。
   *      先除金，否则甲酸钠会把金一起还原进钯里 —— 那 Pd 的 99.95 % 就没了。
   *   ⑵ 蒸馏 Os/Ru（100–110 °C）：通少量氯气，RuO₄（bp 40 °C）/OsO₄（bp 130 °C）
   *      随水蒸气进碱洗塔；13.6 kg Ru+Os 变成 22 kg 混合氧化物/碱洗渣。
   *      本层没有 Os/Ru 的下游，按 `mat/tailings` 记（缺口③）。
   *   ⑶ NH₄Cl 选择性沉淀（20–40 °C，慢搅 4–8 h）：
   *      H₂PtCl₆ + 2NH₄Cl → (NH₄)₂PtCl₆↓ + 2HCl。
   *      185.25 kg Pt 的 97 % = 179.7 kg 进盐；盐 409 kg（Pt 43.95 %，含 179.8 kg Pt）。
   *      300 kg NH₄Cl 是化学计量的 7×：过量把 Pt 推到底，同时把 Pd 留在液相。
   *   ⑷ 压滤：滤饼用 1 M HCl 洗到 Cl⁻ ≤50 ppm（AgNO₃ 检不出），滤液即钯液。
   *
   * 为什么 Pt 沉淀收率只有 97 %：一次沉淀的母液里还有 3 % 的 Pt（5.5 kg），
   * 二次沉铂在 `make/palladium` 里做 —— 那一步把 Pt 降到 0.05 kg，
   * 否则甲酸钠会把残留 Pt 一起还原进钯，Pd 的 99.95 % 就是假的。
   */
  {
    id: 'make/ammonium-hexachloroplatinate',
    name: 'Ammonium Hexachloroplatinate Production', name_zh: '氯铂酸铵制备',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'mat/ammonium-hexachloroplatinate',
        qty: q(409),
        gives: [{ param: 'purity', kind: 'range', min: 99, max: 99.9 }],
      },
      {
        item: 'mat/gold',
        qty: q(45),
        gives: [{ param: 'purity', kind: 'range', min: 99, max: 99.9 }],
      },
      {
        item: 'mat/pgm-pd-solution',
        qty: q(3749),
        gives: [{ param: 'pd', kind: 'range', min: 60, max: 63 }],
      },
      { item: 'mat/tailings', qty: q(22) },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/pgm-chloride-solution',
            qty: q(3900),
            need: [
              { param: 'pt', kind: 'range', min: 46, dir: 'atLeast' },
              { param: 'pd', kind: 'range', min: 58, dir: 'atLeast' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/ammonium-chloride',
            qty: q(300),
            need: [{ param: 'purity', kind: 'range', min: 95, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/so2', qty: q(25) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh:
          '⑴ SO₂ 还原金 60–80 °C：HAuCl₄ + SO₂ → Au↓；45 kg 金粉（97 %），先除金以免污染钯',
        performedBy: 'plant/pgm-refinery',
        under: [
          { param: 'temperature', min: 60, max: 80 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '⑵ 蒸馏 Os/Ru 100–110 °C：Cl₂ 氧化，RuO₄/OsO₄ 随蒸气进碱洗塔；13.6 kg Ru+Os → 22 kg 尾渣（本层无 Os/Ru 下游）',
        performedBy: 'plant/pgm-refinery',
        under: [
          { param: 'temperature', min: 100, max: 110 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '⑶ NH₄Cl 选择性沉淀 20–40 °C、4–8 h：H₂PtCl₆ + 2NH₄Cl → (NH₄)₂PtCl₆↓ + 2HCl；Pt 179.7 kg 进盐 409 kg，Pd 留在液相',
        performedBy: 'plant/pgm-refinery',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '⑷ 压滤与洗涤：滤饼洗到 Cl⁻ ≤50 ppm（AgNO₃ 检不出），滤液 3749 kg 即钯液（Pd 61.8 g/L）',
        performedBy: 'plant/pgm-refinery',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
    ],
  },

  /**
   * ④ 铂：氯铂酸铵 → 海绵铂。
   *
   *   铂盐 409 → 铂 174 + NH₄Cl 99 + Cl₂ 131 + 尾渣 5 = 409
   *
   *   (NH₄)₂PtCl₆ → Pt + 2NH₄Cl + 2Cl₂     600–800 °C
   *
   * 600–800 的理由：低于 600 分解不完全（盐发黄、Pt 里夹 Cl），高于 800
   * 海绵铂开始烧结成块、比表面积掉；电阻炉 hold 100–1100，本条用中段。
   *
   * 收率 97 %（179.8 → 174 kg）：差的 5.8 kg 是坩埚粘料与粉尘，
   * 按 `mat/tailings` 记。NH₄Cl 与 Cl₂ 回流程（两条都有条目），
   * 所以这一步的质量账是闭的 —— 不是"余量是废气"。
   *
   * 纯度 99.95 % 是设计值：一次沉淀 99.0–99.9 %，煅烧不再提纯；
   * 要 99.99 % 得二次结晶 + 更纯的 NH₄Cl（缺口①的升级路线）。
   */
  {
    id: 'make/platinum',
    name: 'Platinum Production', name_zh: '铂制备',
    rate: { hours: q(12) },
    produces: [
      {
        item: 'mat/platinum',
        qty: q(174),
        gives: [
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99 },
          { param: 'form', kind: 'enum', oneOf: ['sponge'] },
        ],
      },
      {
        item: 'mat/ammonium-chloride',
        qty: q(99),
        gives: [{ param: 'purity', kind: 'range', min: 95, max: 98 }],
      },
      { item: 'mat/chlorine', qty: q(131) },
      { item: 'mat/tailings', qty: q(5) },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/ammonium-hexachloroplatinate',
            qty: q(409),
            need: [{ param: 'purity', kind: 'range', min: 99, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: [],
    performedBy: 'plant/resistance-furnace',
    under: [{ param: 'temperature', min: 600, max: 800 }],
  },

  /**
   * ⑤ 钯：钯液 → 二次沉铂 → 甲酸钠还原 → 海绵钯。
   *
   *   钯液 3749 + NH₄Cl 10 + NH₃ 550 + HCl 480 + 甲酸 130 + NaOH 230 = 5149
   *   → 钯 215 + CO₂ 89 + 盐 237 + 水 73 + 二次铂盐 13 = 627
   *   余 4522 是母液（声明不平衡）
   *
   *   PdCl₂ + HCOOH + 2NaOH → Pd + CO₂ + 2NaCl + 2H₂O
   *
   * 三步：
   *   ⑴ 二次沉铂（20–40 °C）：第一次沉淀后的钯液里还剩 5.5 kg Pt（3 %），
   *      补 10 kg NH₄Cl 再沉一次，得 (NH₄)₂PtCl₆ 12.5 kg；连同滤布与
   *      洗涤损失按 13 kg 尾渣记。Pt 降到 0.05 kg ⇒ Pd 产品里 Pt ≤0.03 %。
   *      不把这一步省掉的理由：甲酸钠不挑金属，残留 Pt 会一起还原，
   *      99.95 % 的钯就变成 97 % 的钯铂合金。
   *   ⑵ 氨络合除贱金属（25–40 °C）：NH₃ 550 kg（25–30 %，约 1.1 倍化学计量）
   *      到 pH 8–9，Pd 成 [Pd(NH₃)₄]²⁺ 溶解；Cu/Ni/Fe 的氨合物留在母液。
   *      过滤后用 HCl 480 kg（32 %，约 1.05 倍）酸化到 pH 1–2，析出
   *      Pd(NH₃)₂Cl₂。这一步是 99.95 % 的前提 —— 不除贱金属，甲酸会把
   *      Cu 一起还原，4N 的钯就只是账面数字。
   *   ⑶ 甲酸钠还原（60–100 °C）：甲酸 130 kg（化学计量 93，过量 1.4×）、
   *      NaOH 230 kg（化学计量 162，过量 1.4×）。为什么不在条目里单列甲酸钠：
   *      它只在还原槽里现配，不储存、不外售；单列一个条目只会多一次"它从哪来"。
   *
   * 60–100 °C：低于 60 还原慢（Pd 黑会穿滤），高于 100 甲酸分解成 CO₂+H₂，
   * 还原剂白烧。湿法槽 20–120，本条压在中段。
   *
   * 收率 93 %（231.8 → 215 kg）：母液里剩 16.8 kg Pd 与 0.05 kg Pt，
   * 没有回收路线；那 4522 kg 母液按不平衡声明，不假装它是水。
   *
   * 纯度 99.95 % 是设计值：金已先除、Pt 两次沉淀、Cu/Ni/Fe 在氨络合段进母液；
   * 成品杂质 ≤0.05 %（主要是 0.03 % 的 Pt）。要 99.99 % 得二次甲酸还原 +
   * 更纯的氨与酸，缺口①。
   */
  {
    id: 'make/palladium',
    name: 'Palladium Production', name_zh: '钯制备',
    rate: { hours: q(20) },
    produces: [
      {
        item: 'mat/palladium',
        qty: q(215),
        gives: [
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99 },
          { param: 'form', kind: 'enum', oneOf: ['sponge'] },
        ],
      },
      { item: 'mat/co2', qty: q(89) },
      { item: 'mat/salt', qty: q(237) },
      {
        item: 'mat/water',
        qty: q(73),
        gives: [{ param: 'conductivity', kind: 'range', min: 500, max: 1000 }],
      },
      { item: 'mat/tailings', qty: q(13) },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/pgm-pd-solution',
            qty: q(3749),
            need: [{ param: 'pd', kind: 'range', min: 60, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/ammonium-chloride',
            qty: q(10),
            need: [{ param: 'purity', kind: 'range', min: 95, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/ammonia',
            qty: q(550),
            need: [{ param: 'concentration', kind: 'range', min: 25, max: 30 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/hcl',
            qty: q(480),
            need: [{ param: 'concentration', kind: 'range', min: 30, max: 33 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/formic-acid',
            qty: q(130),
            need: [{ param: 'purity', kind: 'range', min: 85, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/naoh',
            qty: q(230),
            need: [{ param: 'concentration', kind: 'range', min: 40, max: 50 }],
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: [],
    steps: [
      {
        note_zh:
          '⑴ 二次沉铂 20–40 °C：钯液里还剩 5.5 kg Pt，补 NH₄Cl 10 kg 再沉一次，得 (NH₄)₂PtCl₆ 12.5 kg；连滤布按尾渣 13 kg，Pt 降到 0.05 kg',
        performedBy: 'plant/pgm-refinery',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '⑵ 氨络合/酸化 25–40 °C：NH₃ 550 kg 到 pH 8–9，Pd 成 [Pd(NH₃)₄]²⁺；Cu/Ni/Fe 氨合物留在母液；过滤后 HCl 480 kg 酸化到 pH 1–2，析出 Pd(NH₃)₂Cl₂',
        performedBy: 'plant/pgm-refinery',
        under: [
          { param: 'temperature', min: 25, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '⑶ 甲酸钠还原 60–100 °C：甲酸 130 + NaOH 230 现场配，PdCl₂ + HCOOH + 2NaOH → Pd + CO₂ + 2NaCl + 2H₂O；得海绵钯 215 kg',
        performedBy: 'plant/pgm-refinery',
        under: [
          { param: 'temperature', min: 60, max: 100 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
    ],
    unbalanced_zh:
      '钯液 3749 + NH₄Cl 10 + NH₃ 550 + HCl 480 + 甲酸 130 + NaOH 230 → 钯 215 + CO₂ 89 + 盐 237 + 水 73 + 二次铂盐 13；余 4522 是母液（含未还原 Pd 16.8 kg、Pt 0.05 kg、Cu/Ni/Fe 氨合物、NaCl、NH₄Cl 与过量甲酸盐），本链未建回收',
  },

  // ═══ 精炼线零件：六条路线，全部只用已有料与已有设备 ═══

  /**
   * 浸出槽：316L 800 kg + PTFE 40 kg + 45 钢 60 kg → 1 件。
   *
   * 为什么 800 kg：φ1.2 × 1.5 m 的 316L 槽，壁厚 6 mm，封头与法兰另计；
   * 按 7.9 t/m³ 算壳体约 700 kg，加法兰/支腿 100 kg。PTFE 是衬里与垫片。
   */
  {
    id: 'make/pgm-leach-tank',
    name: 'PGM Leach Tank Manufacturing', name_zh: 'PGM 浸出槽制造',
    rate: { hours: q(24) },
    produces: [{ item: 'plant/pgm-refinery/leach-tank', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(800) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(40) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(60) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '卷焊 316L 槽体与封头，环缝连续焊；开氯气入口与测温口', performedBy: 'plant/sheet-shop' },
      { note_zh: '车法兰与盖板，配 PTFE 垫；搅拌轴孔 φ60', performedBy: 'lathe' },
      { note_zh: '衬 PTFE 板（40 kg）、装搅拌与分布器；0.5 MPa 水压 30 min（一次性动作，不写 under）', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '316L 800 + PTFE 40 + 45 钢 60 → 浸出槽 1 件；按件计，余是焊材与边角',
  },

  /**
   * 蒸馏柱：316L 250 kg + PTFE 60 kg + 铜 20 kg + 玻璃 30 kg → 1 件。
   *
   * φ200 × 1200 mm 的填料柱，PTFE 拉西环 60 kg；玻璃是视镜（看馏出液颜色）。
   * 铜 20 kg 是冷凝器的换热管 —— 铜在 HCl 气氛里会腐蚀，所以只做间接冷却段。
   */
  {
    id: 'make/pgm-distillation-column',
    name: 'PGM Distillation Column Manufacturing', name_zh: 'PGM 蒸馏柱制造',
    rate: { hours: q(24) },
    produces: [{ item: 'plant/pgm-refinery/distillation-column', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(250) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(60) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(20) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(30) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '卷焊柱体与冷凝器壳；法兰按 0.5 MPa 配', performedBy: 'plant/sheet-shop' },
      { note_zh: '车法兰/管板，装铜换热管与玻璃视镜', performedBy: 'lathe' },
      { note_zh: '装 PTFE 填料 60 kg、液体分布器；气密 0.3 MPa', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '316L 250 + PTFE 60 + 铜 20 + 玻璃 30 → 蒸馏柱 1 件；按件计，余是管件边角',
  },

  /**
   * 沉淀槽：316L 500 kg + PTFE 30 kg + 45 钢 40 kg → 1 件。
   *
   * 带慢速搅拌（10–30 rpm）与 NH₄Cl 加料漏斗；20–40 °C，不需要夹套加热
   * （反应微放热，靠槽壁散热）。PTFE 30 kg 是衬里与搅拌桨包覆。
   */
  {
    id: 'make/pgm-precipitator',
    name: 'PGM Precipitator Manufacturing', name_zh: 'PGM 沉淀槽制造',
    rate: { hours: q(20) },
    produces: [{ item: 'plant/pgm-refinery/precipitator', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(500) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(30) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(40) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '卷焊槽体，装加料漏斗与溢流口；内壁抛光', performedBy: 'plant/sheet-shop' },
      { note_zh: '车搅拌轴与桨，配减速机座', performedBy: 'lathe' },
      { note_zh: '衬 PTFE、装慢速搅拌（10–30 rpm）；0.3 MPa 气密', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '316L 500 + PTFE 30 + 45 钢 40 → 沉淀槽 1 件；按件计，余是边角',
  },

  /**
   * 压滤机：316L 300 kg + PTFE 80 kg + 45 钢 50 kg → 1 件。
   *
   * 板框式，10 片 400 × 400 mm 滤板；PTFE 滤板与滤布 80 kg。
   * 滤饼洗到 Cl⁻ ≤50 ppm —— 这个终点靠 AgNO₃ 滴在洗液里看浑浊，本层没有
   * 氯离子计（与 `precious.ts` 的银量同一条降级）。
   */
  {
    id: 'make/pgm-filter-press',
    name: 'PGM Filter Press Manufacturing', name_zh: 'PGM 压滤机制造',
    rate: { hours: q(20) },
    produces: [{ item: 'plant/pgm-refinery/filter-press', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(300) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(80) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(50) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '焊框体与集液盘；装 10 片 400×400 滤板', performedBy: 'plant/sheet-shop' },
      { note_zh: '车压紧螺杆与手轮；配 PTFE 滤板与滤布', performedBy: 'lathe' },
      { note_zh: '装管路与压力表；0.6 MPa 水压 30 min', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '316L 300 + PTFE 80 + 45 钢 50 → 压滤机 1 件；按件计，余是边角',
  },

  /**
   * 碱洗塔：316L 200 kg + PTFE 50 kg + 玻璃纤维 10 kg → 1 件。
   *
   * φ300 × 1500 mm 填料塔，NaOH 循环吸收 Cl₂/HCl/OsO₄；玻璃纤维 10 kg 是
   * 除雾器（不是填料 —— 填料是 PTFE 拉西环）。塔顶要接排风，本层没有
   *   排风条目，按"塔顶高点放空"记（缺口：没有风量计，同族）。
   */
  {
    id: 'make/pgm-scrubber',
    name: 'PGM Alkali Scrubber Manufacturing', name_zh: 'PGM 碱洗塔制造',
    rate: { hours: q(16) },
    produces: [{ item: 'plant/pgm-refinery/scrubber', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(200) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(50) }] },
      { anyOf: [{ item: 'mat/glass-fiber', qty: q(10) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '卷焊塔体与循环槽；开进气口、喷淋口、除雾器座', performedBy: 'plant/sheet-shop' },
      { note_zh: '车法兰与喷头；装 PTFE 填料 50 kg 与玻璃纤维除雾器 10 kg', performedBy: 'lathe' },
      { note_zh: '装循环泵与 NaOH 加药；0.3 MPa 气密', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '316L 200 + PTFE 50 + 玻璃纤维 10 → 碱洗塔 1 件；按件计，余是边角',
  },

  /**
   * 机架与管路：钢板 200 kg → 1 件。
   *
   * 把五件连成一条线：型材焊接 + 法兰 + PTFE 垫 + 阀门。按件计，不判 kg 守恒。
   */
  {
    id: 'make/pgm-frame',
    name: 'PGM Refinery Frame and Piping Manufacturing', name_zh: 'PGM 精炼装置机架与管路制造',
    rate: { hours: q(12) },
    produces: [{ item: 'plant/pgm-refinery/frame', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(200) }] }],
    needs: [],
    performedBy: 'plant/sheet-shop',
    unbalanced_zh: '钢板 200 → 机架 1 件；按件计，余是边角与焊材',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 四、接线（主 agent 注册；本文件不动 tools/report/data.ts）
//
//   import { PGM_ITEMS, PGM_ROUTES } from '../../data/material/pgm.ts';
//   items:  [...PGM_ITEMS]
//   routes: [...PGM_ROUTES]
//
// 如果父任务想按"材料 / 零件 / 整线"分开注册，也可以：
//   import { PGM_MATERIAL_ITEMS, PGM_REFINERY, PGM_REFINERY_PARTS, PGM_ROUTES }
//   items: [...PGM_MATERIAL_ITEMS, ...PGM_REFINERY_PARTS, PGM_REFINERY]
// 但最省事的是 `PGM_ITEMS`（已经拼好），不要再 spread 一次 ——
// 重复 id 会报 duplicate_id。
// ═══════════════════════════════════════════════════════════════════════════

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PGM_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/pgm-refinery',
    name: 'PGM Refinery Assembly', name_zh: 'PGM 精炼装置装配',
    produces: [{
      item: 'plant/pgm-refinery',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...PGM_ROUTES, ...ASSEMBLY_ROUTES];
