/**
 * 副产物。
 *
 * 报告的提示清单里，最多的一类叫 `declared_unbalanced`：**「余 X kg 是 Y，本链未建条目」**。
 * 每一条都在说同一件事：**质量从模型里漏出去了**。
 *
 * 这一份文件的立场是：**只有"能用的东西"才补成条目，真正的损耗留在声明里。**
 *
 *   ✅ 补：氯化钙、氯化铵、硫化氢、一氧化碳、磷石膏、磷酸 —— 它们还能进别的链
 *   ❌ 不补：扬尘、挥发、切屑、残液 —— 那是损耗，`unbalanced_zh` 就是给它准备的字段
 *
 * 补进来的每一样都要有去处，否则只是把"漏掉的质量"换成"没人吃的死产"。
 * 所以这里同时给了三条闭环：
 *
 *   氯化铵 + 石灰 → 氨 + 氯化钙      （索尔维法的氨回收 —— 纯碱链自己闭合）
 *   硫化氢 + 氧   → 硫 + 水          （克劳斯法 —— 二硫化碳链自己闭合）
 *   一氧化碳 + 氧 → 二氧化碳          （把还原副产物烧掉，热与气都回来）
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const BYPRODUCT_ITEMS: readonly Item[] = [
  {
    id: 'mat/calcium-chloride',
    name: '氯化钙',
    unit: 'kg',
    category: 'material',
    // 干燥剂、融雪剂、混凝土早强剂。本层最直接的用途是气路干燥（氯化钙增重判干那一手已经在用）。
    props: [{ param: 'purity', kind: 'range', min: 70, max: 99, unit: '%', dir: 'atLeast' }],
  },
  {
    id: 'mat/ammonium-chloride',
    name: '氯化铵',
    unit: 'kg',
    category: 'material',
    // 氮肥；但在这条链上更重要的是回到氨 —— 索尔维法的氨是循环使用的。
    props: [{ param: 'purity', kind: 'range', min: 90, max: 99.5, unit: '%', dir: 'atLeast' }],
  },
  {
    id: 'mat/h2s',
    name: '硫化氢',
    unit: 'kg',
    category: 'material',
    // 剧毒（TLV 1 ppm），但也是本层唯一的"硫氢"来源 —— 克劳斯法把它变回硫。
    props: [{ param: 'purity', kind: 'range', min: 50, max: 99, unit: '%', dir: 'atLeast' }],
  },
  {
    id: 'mat/phosphogypsum',
    name: '磷石膏',
    unit: 'kg',
    category: 'material',
    // 磷石膏。工业上堆成山（全球几十亿吨），本层可以烧成硫酸 + 石灰，但能耗高。
    props: [{ param: 'purity', kind: 'range', min: 70, max: 95, unit: '%', dir: 'atLeast' }],
  },
  {
    id: 'mat/phosphoric-acid',
    name: '磷酸',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'concentration', kind: 'range', min: 20, max: 85, unit: '%' }],
  },
  {
    /**
     * 偏磷酸（HPO₃）：`make/triflic-anhydride` 的脱水副产物。
     *
     * 2 CF₃SO₃H + P₂O₅ → (CF₃SO₂)₂O + 2 HPO₃
     *
     * 真实去处：玻璃态偏磷酸可回磷链（HPO₃ + H₂O → H₃PO₄，再脱水成 P₂O₅ 循环）。
     * 本层先记条目，不建回收路线。
     */
    id: 'mat/metaphosphoric-acid',
    name: '偏磷酸',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 85, max: 95, unit: '%', dir: 'atLeast' },
      { param: 'form', kind: 'enum', values: ['glass', 'flake'] },
    ],
  },
  {
    /**
     * 硝酸铜溶液：`make/silver-from-sludge` 溶银的副产物。
     *
     * 3 Cu + 8 HNO₃ → 3 Cu(NO₃)₂ + 2 NO + 4 H₂O
     *
     * 真实去处：声明里原本就写“可回 make/copper-sulfate”——中和出碱式碳酸铜再硫酸溶。
     * 现在把它记成真实条目，让 1670 kg 进 = 210 银 + 1460 液。
     */
    id: 'mat/copper-nitrate-solution',
    name: '硝酸铜溶液',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'copper', kind: 'range', min: 20, max: 60, unit: 'g/L' },
      { param: 'acidity', kind: 'range', min: 50, max: 200, unit: 'g/L' },
      { param: 'form', kind: 'enum', values: ['solution'] },
    ],
  },
  {
    /**
     * 多乙苯（二乙苯/三乙苯混合）：`make/divinylbenzene` 烷基化段的副产物。
     *
     * 乙苯 + 乙烯 → 二乙苯（脱氢成 DVB）；过量乙烯继续烷基化成多乙苯。
     * 真实去处：工业上多乙苯可脱烷基回乙苯；本层先记条目，不建回收路线。
     */
    id: 'mat/polyethylbenzene',
    name: '多乙苯',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 60, max: 90, unit: '%' },
      { param: 'form', kind: 'enum', values: ['liquid'] },
    ],
  },
  {
    /**
     * 磺化废酸：`make/cation-resin` 磺化段的副产物（硫酸 400 kg 里未反应的 + 洗酸）。
     *
     * 真实去处：中和成石膏渣（`make/waste-acid-neutralization`）——废酸不是成品，
     * 所以它自己有处理路线；有机磺酸盐是 COD 主项。
     */
    id: 'mat/sulfonation-waste-acid',
    name: '磺化废酸',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'acid', kind: 'range', min: 30, max: 60, unit: '%' },
      { param: 'organics', kind: 'range', min: 1, max: 5, unit: '%' },
      { param: 'form', kind: 'enum', values: ['solution'] },
    ],
  },
  {
    /**
     * 未反应硅石/碳：`make/silicon-carbide-melting` 的筛下料（转化率 70 % 的其余 30 %）。
     *
     * 真实去处：**回下一炉配料**（SiC 熔炼本来就是回炉料循环），不是废料。
     */
    id: 'mat/unreacted-silica-carbon',
    name: '未反应硅石/碳',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'silica', kind: 'range', min: 55, max: 70, unit: '%' },
      { param: 'carbon', kind: 'range', min: 30, max: 45, unit: '%' },
      { param: 'form', kind: 'enum', values: ['granular'] },
    ],
  },
  {
    /**
     * 氧化皮/切边：`make/sheet-steel-forged` 锻造与磨削的副产物。
     *
     * 真实去处：**回炼钢**（Fe 氧化物还原或直接进电弧炉），不是废料。
     */
    id: 'mat/oxidation-scale',
    name: '氧化皮/切边',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'ironOxide', kind: 'range', min: 60, max: 90, unit: '%' },
      { param: 'metallicIron', kind: 'range', min: 10, max: 40, unit: '%' },
      { param: 'form', kind: 'enum', values: ['flake', 'powder'] },
    ],
  },
  {
    /**
     * 铜边裂/氧化皮/酸洗铜：`make/copper-foil` 与 `make/copper-foil-thin` 的副产物。
     *
     * 真实去处：**回熔炼**（回电解精炼或中频炉重熔），不是废料。
     */
    id: 'mat/copper-scrap',
    name: '铜边裂/氧化皮/酸洗铜',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'copper', kind: 'range', min: 85, max: 95, unit: '%' },
      { param: 'form', kind: 'enum', values: ['sheet', 'flake'] },
    ],
  },
  {
    /**
     * 覆铜板热压挤出的胶：`make/copper-clad` 与 `make/copper-clad-thin` 的副产物（半固化片流胶）。
     *
     * 真实去处：可回 `make/phenolic-resin` 的填料段，或按尾渣堆存（热固后不熔）。
     */
    id: 'mat/phenolic-scrap',
    name: '覆铜板热压挤出的胶',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'resin', kind: 'range', min: 40, max: 70, unit: '%' },
      { param: 'form', kind: 'enum', values: ['solid'] },
    ],
  },
  {
    /**
     * 环氧浇注废料：`make/epoxy-cast-insulation` 的混料/浇注废品与脱模边角。
     *
     * 真实去处：粉碎后作填料（或按尾渣堆存）——热固性环氧不能再熔。
     */
    id: 'mat/epoxy-cast-waste',
    name: '环氧浇注废料',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'resin', kind: 'range', min: 70, max: 90, unit: '%' },
      { param: 'form', kind: 'enum', values: ['solid'] },
    ],
  },
  {
    /**
     * 硬质合金废料：`make/carbide-insert` 的刃磨与烧结边角。
     *
     * **WC-Ni 牌号**：WC 85–95 %、Ni 8–12 %（设计值，Earth 工程值）。
     * 地球 WC-Co 牌号在本层不成立（无钴链），本层刀片就是 WC-Ni 10 %。
     * 磨屑与烧结边角都是能回炉的 WC 料，不是粉尘 —— 破碎、球磨、补碳后
     * 可直接回 `make/tungsten-carbide` 或刀片配料段，回炉时按 WC 含量配料。
     *
     * 85–95 % / 8–12 % 是设计值（Earth 工程值），不是本层实测。
     */
    id: 'mat/tungsten-carbide-scrap',
    name: '硬质合金废料',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'wc', kind: 'range', min: 85, max: 95, unit: '%' },
      { param: 'nickel', kind: 'range', min: 8, max: 12, unit: '%' },
      { param: 'form', kind: 'enum', values: ['powder', 'chip'] },
    ],
  },
  {
    /**
     * 未煅烧石膏（窑尾截留）：`make/lime-gypsum` 里没走完分解的那一部分。
     *
     * 砖窑 1300–1400 °C 的分解率只有 ~65 %，没进热区的那部分石膏随窑尾收尘
     * 截留下来，仍是二水石膏（CaSO₄·2H₂O 85–95 %，设计值，Earth 工程值）。
     * 真实去处：直接回煅烧炉配料（替代一部分 `mars/gypsum`），不进渣场。
     */
    id: 'mat/uncalcined-gypsum',
    name: '未煅烧石膏',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'caso4·2h2o', kind: 'range', min: 85, max: 95, unit: '%' },
      { param: 'form', kind: 'enum', values: ['powder'] },
    ],
  },
  {
    /**
     * 废电解质（spent bath）：`make/aluminium` 的清槽残料。
     *
     * 霍尔-埃鲁槽每批补 10 kg 冰晶石，同时有等量级的电解质被铝液与阳极气带出、
     * 结壳、清槽时扒出：冰晶石 60–80 %、AlF₃ 10–25 %，其余是 CaF₂、氧化铝与
     * 钠冰晶石（设计值，Earth 工程值）。真实去处：破碎筛分后回电解槽做补料 ——
     * 冰晶石与 AlF₃ 都回槽，不是危废。
     */
    id: 'mat/spent-bath',
    name: '废电解质',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'cryolite', kind: 'range', min: 60, max: 80, unit: '%' },
      { param: 'alf3', kind: 'range', min: 10, max: 25, unit: '%' },
      { param: 'form', kind: 'enum', values: ['solid'] },
    ],
  },
  {
    /**
     * 硼酸母液：`make/boric-acid` 的酸化母液与洗水（0.2 kg/批）。
     * 组成按设计值：B 1–3 %、硫酸盐 2–5 %，其余是水。可回硼酸浸出/硼砂溶解。
     */
    id: 'mat/boric-acid-mother-liquor',
    name: '硼酸母液',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'boron', kind: 'range', min: 1, max: 3, unit: '%' },
      { param: 'sulfate', kind: 'range', min: 2, max: 5, unit: '%' },
      { param: 'form', kind: 'enum', values: ['solution'] },
    ],
  },
  {
    /**
     * 硼砂母液：`make/borax` 的浸出母液与蒸发水（20 099 kg/批）。
     * 组成按设计值：硼砂 2–5 %、碳酸盐/硫酸盐 3–8 %，其余是水。可回浸出/蒸发结晶。
     */
    id: 'mat/borax-mother-liquor',
    name: '硼砂母液',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'borax', kind: 'range', min: 2, max: 5, unit: '%' },
      { param: 'carbonate', kind: 'range', min: 3, max: 8, unit: '%' },
      { param: 'form', kind: 'enum', values: ['solution'] },
    ],
  },
  {
    /**
     * 高氯酸盐分解残渣：`make/oxygen-perchlorate` 的窑底残渣（3 kg/批）。
     * 组成按设计值：氯化物 20–40 %、氧化物 10–30 %，其余是未分解盐。可回盐/尾渣。
     */
    id: 'mat/perchlorate-decomposition-residue',
    name: '高氯酸盐分解残渣',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'chloride', kind: 'range', min: 20, max: 40, unit: '%' },
      { param: 'oxide', kind: 'range', min: 10, max: 30, unit: '%' },
      { param: 'form', kind: 'enum', values: ['solid'] },
    ],
  },
  {
    /**
     * ZSM-5 母液与铵交换洗水：`make/zsm-5` 的 217 kg/批。
     * 组成按设计值：SiO₂ 0.5–2 %、Al₂O₃ 0.1–0.5 %、KOH 1–5 %、铵 0.5–2 %。
     * 可回下一釜母液（晶种法本来就走母液循环）。
     */
    id: 'mat/zsm-5-mother-liquor',
    name: 'ZSM-5 母液与铵交换洗水',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'sio2', kind: 'range', min: 0.5, max: 2, unit: '%' },
      { param: 'al2o3', kind: 'range', min: 0.1, max: 0.5, unit: '%' },
      { param: 'koh', kind: 'range', min: 1, max: 5, unit: '%' },
      { param: 'ammonium', kind: 'range', min: 0.5, max: 2, unit: '%' },
      { param: 'form', kind: 'enum', values: ['solution'] },
    ],
  },
  {
    /**
     * 刚玉铁合金渣：`make/fused-alumina` 的炉底渣（83 kg/批）。
     * 组成按设计值：Al₂O₃ 10–30 %、Fe/Si 30–60 %，其余是焦炭灰。可回铁合金/耐火骨料。
     */
    id: 'mat/fused-alumina-slag',
    name: '刚玉铁合金渣',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'al2o3', kind: 'range', min: 10, max: 30, unit: '%' },
      { param: 'iron', kind: 'range', min: 30, max: 60, unit: '%' },
      { param: 'form', kind: 'enum', values: ['granular'] },
    ],
  },
  {
    /**
     * ESR 切头/渣壳：`make/bearing-steel-esr` 的 130 kg/批（杂质富集段与渣壳）。
     * 组成按设计值：Fe 95–98 %、C 0.8–1.1 %，其余是渣。可回 ESR 重熔。
     */
    id: 'mat/esr-crop-end',
    name: 'ESR 切头/渣壳',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'iron', kind: 'range', min: 95, max: 98, unit: '%' },
      { param: 'carbon', kind: 'range', min: 0.8, max: 1.1, unit: '%' },
      { param: 'form', kind: 'enum', values: ['solid'] },
    ],
  },
  {
    /**
     * 单晶硅切头/滚磨屑：`make/silicon-single` 的 150 kg/批 + 50 kg 氩回收，合计 200 kg 质量差。
     * 组成按设计值：Si 99–99.9 %，其余是滚磨带入的 SiO₂/Fe。回 CZ 或区熔料。
     */
    id: 'mat/silicon-crop-end',
    name: '单晶硅切头/滚磨屑',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'silicon', kind: 'range', min: 99, max: 99.9, unit: '%' },
      { param: 'form', kind: 'enum', values: ['solid'] },
    ],
  },
  {
    /**
     * 锡浮渣：`make/tin-fire-refined` 的 50 kg/批。
     * 组成按设计值：Sn 40–70 %、Fe 5–20 %，其余是氧化物。可回锡精炼。
     */
    id: 'mat/tin-dross',
    name: '锡浮渣',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'tin', kind: 'range', min: 40, max: 70, unit: '%' },
      { param: 'iron', kind: 'range', min: 5, max: 20, unit: '%' },
      { param: 'form', kind: 'enum', values: ['solid'] },
    ],
  },
  {
    /**
     * 铬铁矿浸出渣：`make/sodium-dichromate` 的 1400 kg/批。
     * 组成按设计值：Fe₂O₃ 30–60 %、Cr₂O₃ 1–5 %，其余是脉石/硫酸钠。可回铁/耐火骨料。
     */
    id: 'mat/chromite-leach-slag',
    name: '铬铁矿浸出渣',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'fe2o3', kind: 'range', min: 30, max: 60, unit: '%' },
      { param: 'cr2o3', kind: 'range', min: 1, max: 5, unit: '%' },
      { param: 'form', kind: 'enum', values: ['solid'] },
    ],
  },
  {
    /**
     * 硫酸钠母液：`make/ammonium-dichromate` 的 450 kg/批。
     * 组成按设计值：Na₂SO₄ 10–20 %，其余是水与少量铬酸盐。可回硫酸钠结晶。
     */
    id: 'mat/sodium-sulfate-mother-liquor',
    name: '硫酸钠母液',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'sodiumSulfate', kind: 'range', min: 10, max: 20, unit: '%' },
      { param: 'form', kind: 'enum', values: ['solution'] },
    ],
  },
  {
    /** 硫酸镍结晶母液：`make/nickel-sulfate` 的 95 kg/批；Ni 2–5%、硫酸盐 10–20%，可回结晶。 */
    id: 'mat/nickel-sulfate-mother-liquor',
    name: '硫酸镍结晶母液',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'nickel', kind: 'range', min: 2, max: 5, unit: '%' },
      { param: 'sulfate', kind: 'range', min: 10, max: 20, unit: '%' },
      { param: 'form', kind: 'enum', values: ['solution'] },
    ],
  },
  {
    /** 钨酸钠钙渣：`make/tungstic-oxide` 的 550 kg/批；CaO 20–40%、Na₂O 5–15%，可回建材/耐火骨料。 */
    id: 'mat/tungstic-oxide-slag',
    name: '钨酸钠钙渣',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'cao', kind: 'range', min: 20, max: 40, unit: '%' },
      { param: 'na2o', kind: 'range', min: 5, max: 15, unit: '%' },
      { param: 'form', kind: 'enum', values: ['solid'] },
    ],
  },
  {
    /** 高纯石英酸洗渣：`make/quartz-pure` 的 330 kg/批；Fe 1–5%、Al 0.5–2%，可中和/回收铁铝。 */
    id: 'mat/quartz-purification-waste',
    name: '高纯石英酸洗渣',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'iron', kind: 'range', min: 1, max: 5, unit: '%' },
      { param: 'aluminium', kind: 'range', min: 0.5, max: 2, unit: '%' },
      { param: 'form', kind: 'enum', values: ['sludge'] },
    ],
  },
  {
    /**
     * 金属回炉料：车屑/卷圆边角/下料边角/铣屑/浇冒口。
     * Fe 50–99%、form [turnings, offcut, solid]；**回 make/steel-45 的 uses 替代部分铁水**。
     */
    id: 'mat/metal-scrap',
    name: '金属回炉料',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'iron', kind: 'range', min: 50, max: 99, unit: '%' },
      { param: 'form', kind: 'enum', values: ['turnings', 'offcut', 'solid'] },
    ],
  },
  {
    /**
     * 石英回炉料：拉管切头/玻璃切边/坩埚磨削。
     * SiO₂ 99–99.9%、form [cullet, offcut]；**回 make/quartz-crucible 的 uses 替代部分高纯石英**。
     */
    id: 'mat/quartz-scrap',
    name: '石英回炉料',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'sio2', kind: 'range', min: 99, max: 99.9, unit: '%' },
      { param: 'form', kind: 'enum', values: ['cullet', 'offcut'] },
    ],
  },
];

export const BYPRODUCT_ROUTES: readonly Route[] = [
  {
    /**
     * 氨回收（索尔维法的下半段）。
     *
     * 2NH₄Cl + Ca(OH)₂ → 2NH₃ + CaCl₂ + 2H₂O
     *
     * **这条路线让纯碱链自己闭合**：纯碱要氨，而纯碱的副产就是氯化铵 ——
     * 不回收，氨就是一次性消耗品；回收了，氨只补损耗。
     * 本层没有硝酸铵那条路，所以这是氨唯一的再生点。
     *
     * 1000 kg 氯化铵 + 1860 kg 石灰 → 640 kg 氨 + 2220 kg 氯化钙。
     */
    id: 'make/ammonia-recovery',
    name: '氨回收',
    produces: [
      { item: 'mat/ammonia', qty: q(640), gives: [{ param: 'concentration', kind: 'range', min: 25, max: 30 }] },
      { item: 'mat/calcium-chloride', qty: q(2220), gives: [{ param: 'purity', kind: 'range', min: 70 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ammonium-chloride', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(1860) }] },
    ],
    needs: [],
    // 氨回收要在 100–120 °C 蒸出氨；蒸馏塔 40–80 不够，用电阻炉。
    performedBy: 'plant/resistance-furnace',
    under: [{ param: 'temperature', min: 100, max: 120 }],
    unbalanced_zh: '氯化铵 1000 + 石灰 1860 → 氨 640 + 氯化钙 2220；氮与钙按计量，水不计',
  },
  {
    /**
     * 克劳斯法：把硫化氢变回硫。
     *
     * H₂S + ½O₂ → S + H₂O（两段：先烧三分之一成 SO₂，再让 SO₂ 与剩下的 H₂S 反应）
     *
     * **这条让二硫化碳链闭合**：CS₂ 要硫，而它的副产就是 H₂S。
     * 不回收，硫是一次性的；回收了，硫只在渣里丢一点。
     *
     * 1000 kg H₂S + 470 kg 氧 → 940 kg 硫 + 530 kg 水。
     */
    id: 'make/sulfur-from-h2s',
    name: '克劳斯法制备',
    produces: [
      { item: 'mat/sulfur', qty: q(940) },
      { item: 'mat/water', qty: q(530), gives: [{ param: 'conductivity', kind: 'range', min: 100, max: 1000 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/h2s', qty: q(1000), need: [{ param: 'purity', kind: 'range', min: 50, dir: 'atLeast' }], onRelax: 'functional-kept' }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(470), need: [{ param: 'purity', kind: 'range', min: 90, dir: 'atLeast' }], onRelax: 'functional-kept' }] },
    ],
    needs: [],
    // 克劳斯炉 250–350 °C：焙烧炉只到 850 以上，这里用电阻炉。
    performedBy: 'plant/resistance-furnace',
    under: [{ param: 'temperature', min: 250, max: 350 }],
    unbalanced_zh: 'H₂S 1000 + 氧 470 → 硫 940 + 水 530；硫与氢按计量',
  },
  {
    /**
     * 把一氧化碳烧掉。
     *
     * 2CO + O₂ → 2CO₂
     *
     * 硅热法还原每吨硅副产 840 kg CO —— 那是还原剂里多出来的碳。
     * 不烧掉它就是排放；烧掉它是**热**（火星上唯一"白捡"的燃料）。
     */
    id: 'make/co2-from-co',
    name: '把一氧化碳烧掉制备',
    produces: [{ item: 'mat/co2', qty: q(1571) }],
    uses: [
      { anyOf: [{ item: 'mat/co', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(571) }] },
    ],
    needs: [],
    // 一氧化碳燃烧 400–900 °C：电阻炉与土窑都盖得住，取电阻炉。
    performedBy: 'plant/resistance-furnace',
    under: [{ param: 'temperature', min: 400, max: 900 }],
  },
  {
    /**
     * 磺化废酸中和：废酸 1000 + 石灰 500 → 中和渣 1400 + 水 100。
     *
     * 废酸不是成品，必须中和才能堆存/回用；渣按 tailings 记（CaSO₄·2H₂O + 有机磺酸盐）。
     * 进 1500 = 出 1500。
     */
    id: 'make/waste-acid-neutralization',
    name: '磺化废酸中和',
    produces: [
      { item: 'mat/tailings', qty: q(1400) },
      { item: 'mat/water', qty: q(100), gives: [{ param: 'conductivity', kind: 'range', min: 500, max: 1000 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sulfonation-waste-acid', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(500) }] },
    ],
    needs: [],
    performedBy: 'plant/wet-bench',
    under: [{ param: 'temperature', min: 20, max: 80 }],
    unbalanced_zh: '废酸 1000 + 石灰 500 = 1500 → 中和渣 1400 + 水 100 = 1500，平；渣按 tailings 记',
  },
  {
    /**
     * 废钢回炉：金属车屑/边角 995.5 + 碳 4.5 → 45 钢 1000。
     * 回炉料替代部分原生铁水；不改 `make/steel-45` 原路线。
     */
    id: 'make/steel-from-scrap',
    name: '废钢回炉制备',
    produces: [{
      item: 'mat/steel-45',
      qty: q(1000),
      gives: [
        { param: 'hardness', kind: 'range', min: 150, max: 300 },
        { param: 'temper', kind: 'enum', oneOf: ['as-rolled', 'normalized'] },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'mat/metal-scrap', qty: q(1991, 2) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(9, 2) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '废料分选/装炉：车屑、边角、浇冒口按 Fe 50–99% 配料，替代部分原生铁水',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1550, max: 1650 }],
      },
      {
        note_zh: '熔炼、调碳到 0.45%、浇锭',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1550, max: 1650 }],
      },
    ],
    unbalanced_zh: '废钢/车屑 995.5 + 碳 4.5 = 1000 → 45 钢 1000，平；废料回炉替代部分原生料，不改 make/steel-45 原路线',
  },
  {
    /**
     * 石英废料回炉：拉管切头/玻璃切边/坩埚磨削 1 → 石英坩埚 1。
     * 回炉料替代部分高纯石英；不改 `make/quartz-crucible` 原路线。
     */
    id: 'make/quartz-from-scrap',
    name: '石英坩埚制造',
    produces: [{ item: 'mat/quartz-crucible', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/quartz-scrap', qty: q(1) }] }],
    needs: [],
    steps: [
      {
        note_zh: '石英废料清洗/装炉，回炉熔制坩埚（替代部分高纯石英）',
        performedBy: 'plant/arc-furnace',
        under: [{ param: 'temperature', min: 1900, max: 2200 }],
      },
    ],
    unbalanced_zh: '石英回炉料 1 → 坩埚 1，平；废料回炉替代部分原生料，不改 make/quartz-crucible 原路线',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...BYPRODUCT_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...BYPRODUCT_ROUTES];
