/**
 * 化工装置 —— 聚合、酸吸收。
 *
 * 两台都是"气体的活"：一台把气体变成高分子，一台把气体变成酸。
 *
 *   聚合装置     氟化物单体 → PTFE。要压力、要搅拌、要引发剂。
 *   酸吸收装置   SO₂ → SO₃ → H₂SO₄，也兼着 HF 的吸收。要催化剂、要填料塔。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 那两处"一点点东西"，后来都解决了 —— 但方式不同
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   钒催化剂   接触法制酸要 V₂O₅ 载在载体上。没有它，SO₂ 与 O₂ 在 400 °C
 *              下几乎不反应 —— 硫酸停在"有 SO₂ 没有酸"。
 *              **解法是运，不是造。** 一层只用几十公斤，而富集要 500:1 加
 *              三步提纯；为它建一条线，线本身的零件比催化剂重几百倍。
 *              这是种子里第一条"因为不划算所以运"的条目。
 *   引发剂     过硫酸钠靠电解硫酸钠制得 —— 设备都有，只差一条路线。
 *              **解法是补一条。** 见 data/material/reagents.ts 的 make/initiator。
 *
 * 两处的对照本身就是结论：
 *
 *   造得出来但**不值得造** → 运（钒）
 *   造得出来但**没人写**   → 补（过硫酸钠）
 *   造不出来               → 改设计（磁体改电磁铁、电极改碳电极）
 *
 * 三句话之外没有第四种。所以"缺东西"从来不是终点，是要先问一句缺的是哪一类。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、聚合装置
// ═══════════════════════════════════════════════════════════════════════════

export const POLYMER_PARTS: readonly Item[] = [
  /**
   * 聚合釜。不锈钢壳衬 PTFE，承压 1–2 MPa，带夹套控温。
   *
   * 衬 PTFE 不只是防腐：单体与聚合物都爱粘壁，粘一圈就传热不良。
   */
  { id: 'plant/polymer-plant/autoclave', name: 'Polymer Polymerization Reactor', name_zh: '聚合物聚合釜', unit: '件', category: 'part' },

  /**
   * 搅拌器。40Cr 轴进釜，PTFE 填料密封 —— 这里唯一会漏的地方。
   *
   * 转速不高，但轴要长、要直：偏一点，PTFE 密封几分钟就磨穿。
   */
  { id: 'plant/polymer-plant/agitator', name: 'Polymer Agitator', name_zh: '聚合物搅拌器', unit: '件', category: 'part' },

  /** 精制塔。不锈钢填料塔，把单体里的水与酸气脱掉 —— 不纯就不聚合。 */
  { id: 'plant/polymer-plant/purifier', name: 'Polymer Refining Column', name_zh: '聚合物精制塔', unit: '件', category: 'part' },

  /** 引发剂计量。计量泵 + 储罐，PTFE 隔膜，每小时几毫升的精度。 */
  { id: 'plant/polymer-plant/metering', name: 'Polymer Initiator Metering', name_zh: '聚合物引发剂计量', unit: '件', category: 'part' },

  /**
   * 凝聚与干燥。乳液破乳成粉，再洗涤、脱水、烘干 —— 聚合之后还有三步。
   *
   * 干燥温度 200 °C 上下，PTFE 本身不怕，怕的是粉料结块，所以用热风循环。
   */
  { id: 'plant/polymer-plant/dryer', name: 'Polymer Coagulation and Drying', name_zh: '聚合物凝聚与干燥', unit: '件', category: 'part' },
];

export const POLYMER_ROUTES: readonly Route[] = [
  {
    /** 聚合釜。不锈钢板卷焊 → 内衬 PTFE 板 → 夹套试压。 */
    id: 'make/polymer-autoclave',
    name: 'Polymer Polymerization Reactor Manufacturing', name_zh: '聚合物聚合釜制造',
    produces: [{ item: 'plant/polymer-plant/autoclave', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 搅拌器。40Cr 轴车磨 → 桨叶铣 → PTFE 填料函配作。 */
    id: 'make/polymer-agitator',
    name: 'Polymer Agitator Manufacturing', name_zh: '聚合物搅拌器制造',
    produces: [{ item: 'plant/polymer-plant/agitator', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: ['plant/milling-machine', 'plant/grinder'],
    performedBy: 'lathe',
  },
  {
    /** 精制塔。不锈钢塔体焊 + 不锈钢填料，塔节法兰连接。 */
    id: 'make/polymer-purifier',
    name: 'Polymer Refining Column Manufacturing', name_zh: '聚合物精制塔制造',
    produces: [{ item: 'plant/polymer-plant/purifier', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] }],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 引发剂计量。不锈钢泵体车成，PTFE 隔膜与阀座；偏心轮轴上一对球轴承。 */
    id: 'make/polymer-metering',
    name: 'Polymer Initiator Metering Manufacturing', name_zh: '聚合物引发剂计量制造',
    produces: [{ item: 'plant/polymer-plant/metering', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
      { anyOf: [{ item: 'std/bearing-general-p0', qty: q(2) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 干燥机。不锈钢壳体 + 45 钢风机，热风来自高温窑余热。 */
    id: 'make/polymer-dryer',
    name: 'Polymer Coagulation and Drying Manufacturing', name_zh: '聚合物凝聚与干燥制造',
    produces: [{ item: 'plant/polymer-plant/dryer', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/kiln'],
    performedBy: 'plant/sheet-shop',
  },
];

/**
 * 聚合装置。氟化物单体在这里聚成高分子：PTFE、氟橡胶、氟油。
 *
 * 五件都造得出来 —— 而整条线只缺一样东西：引发剂（见文件头）。
 */
export const POLYMER_PLANT: Item = {
  id: 'plant/polymer-plant',
  name: 'Polymer Plant', name_zh: '聚合物装置',
  unit: '套',
  category: 'machine',
  holds: [{ param: 'temperature', min: 50, max: 120 }],
  composedOf: [...POLYMER_PARTS.map((p) => ({ item: p.id, qty: q(1) })), { item: 'std/motor-7.5kw-4p', qty: q(1) }],
  // 引发剂 0.2%（make/ptfe 的配比）：一批 6 kg PTFE 用 12 g，一批约 6 h → 12 g / 6 h。
  consumption: [{ item: 'mat/polymerization-initiator', qty: q(3, 250), per: q(6) }],
};

// ═══════════════════════════════════════════════════════════════════════════
// 二、酸吸收装置
// ═══════════════════════════════════════════════════════════════════════════

export const ACID_PLANT_PARTS: readonly Item[] = [
  /**
   * 转化器。不锈钢壳内衬耐火砖，中间是四层催化剂床，层间换热。
   *
   * SO₂ + ½O₂ → SO₃ 是放热反应，温度太高会把催化剂烧坏，所以要分层降温。
   * 壳、衬、床三层各有各的材料：钢、耐火砖、钒催化剂。
   */
  { id: 'plant/acid-plant/converter', name: 'Acid Plant Converter', name_zh: '制酸转化器', unit: '件', category: 'part' },

  /**
   * 钒催化剂。V₂O₅ 载在硅藻土（用高铝耐火料代）上，400–450 °C 才有活性。
   * 没有它，SO₂ 与 O₂ 在这个温度下几乎不反应。
   *
   * 载体自己造，**活性组分从地球来**：钒在风化层里百 ppm 级，富集到 5% 要
   * 500:1，再加焙烧、浸出、沉钒三步 —— 而一层只用几十公斤。这是种子里
   * 唯一一条"因为不划算所以运"，理由写在 data/floor/seed.ts 的
   * `seed/v2o5-catalyst` 上。
   *
   * 上一版把这一件标成 `deferred`，判"要一整条稀有金属线"。那句话不算错，
   * 错在没问"要不要建" —— 有些东西的价值不在造得出来，在**值不值得造**。
   */
  { id: 'plant/acid-plant/catalyst', name: 'Acid Plant Vanadium Catalyst', name_zh: '制酸钒催化剂', unit: '件', category: 'part' },

  /**
   * 吸收塔。SO₃ 从塔底上来，98% 的硫酸从塔顶淋下，酸越淋越浓。
   *
   * 填料用陶瓷环 —— 耐酸、耐温、便宜，但脆。塔里一塌，整塔填料要重装。
   */
  { id: 'plant/acid-plant/absorber', name: 'Acid Plant Absorption Tower', name_zh: '制酸吸收塔', unit: '件', category: 'part' },

  /** 鼓风机。把 SO₂ 吹过整个系统，全流程的压力都靠它。 */
  { id: 'plant/acid-plant/blower', name: 'Acid Plant Blower', name_zh: '制酸鼓风机', unit: '件', category: 'part' },

  /** 冷却器。转化器出来的气要先降温再进吸收塔，否则酸会被气带走。 */
  { id: 'plant/acid-plant/cooler', name: 'Acid Plant Cooler', name_zh: '制酸冷却器', unit: '件', category: 'part' },
];

export const ACID_PLANT_ROUTES: readonly Route[] = [
  {
    /**
     * 钒催化剂。V₂O₅ 浸在硅藻土载体上，干燥后成型。
     *
     *   80 五氧化二钒 + 920 载体 → 1 层催化剂（约一吨）
     *
     * 活性组分占 8%，与工业钒催化剂（V₂O₅ 6–10%）同一量级。载体本来用
     * 硅藻土，火星没有 —— 用高铝耐火料磨粉代，比表面积差些，靠多加一点
     * 活性组分补回来。
     * 以前这里写的是「整条链只有 80 kg 是从地球来的 —— 运比造便宜」。
     *
     * **那个判断错了。** 80 kg V₂O₅ 的土方量是 1,587 吨（见 data/material/vanadium.ts），
     * 约等于 47 吨铝的代价 —— 对它该自己造，不是运。
     *
     * 错在拿"富集比 500:1 听起来吓人"当理由，而没有乘上用量。
     * 判据是**用量 × 单价**，不是单价。
     */
    id: 'make/acid-catalyst',
    name: 'Acid Plant Vanadium Catalyst Manufacturing', name_zh: '制酸钒催化剂制造',
    produces: [{ item: 'plant/acid-plant/catalyst', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/vanadium-oxide', qty: q(80) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(920) }] },
    ],
    needs: ['plant/kiln'],
  },
  {
    /** 转化器。不锈钢壳卷焊 → 耐火砖内衬 → 催化剂床隔板装配。 */
    id: 'make/acid-converter',
    name: 'Acid Plant Converter Manufacturing', name_zh: '制酸转化器制造',
    produces: [{ item: 'plant/acid-plant/converter', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 吸收塔。不锈钢塔体焊 + 陶瓷填料环，塔节法兰连接，内壁要光滑。 */
    id: 'make/acid-absorber',
    name: 'Acid Plant Absorption Tower Manufacturing', name_zh: '制酸吸收塔制造',
    produces: [{ item: 'plant/acid-plant/absorber', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 鼓风机。45 钢叶轮车铣 + 动平衡，机壳薄板焊，轴封用 PTFE。轴用两只球轴承。 */
    id: 'make/acid-blower',
    name: 'Acid Plant Blower Manufacturing', name_zh: '制酸鼓风机制造',
    produces: [{ item: 'plant/acid-plant/blower', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
      { anyOf: [{ item: 'std/bearing-general-p0', qty: q(2) }] },
    ],
    needs: ['lathe', 'plant/milling-machine', 'plant/grinder'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 冷却器。不锈钢管束 + 薄板壳，气走管内、水走管外。 */
    id: 'make/acid-cooler',
    name: 'Acid Plant Cooler Manufacturing', name_zh: '制酸冷却器制造',
    produces: [{ item: 'plant/acid-plant/cooler', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
];

/**
 * 酸吸收装置。蒸馏、吸收、冷凝，把气体变成酸 —— 顺带成了全厂唯一的湿法装置。
 *
 * 它和 Bosch 反应器一样，已经成了**缺口折叠**的地方。按温度分段列在下面
 * （**不写"几种活"** —— 那种数字写死在注释里一定会漂，数交给
 * `node tools/report.ts` 的「执行设备负载」一节）：
 *
 *   20–45 °C    索尔维碳酸化、卤水沉镁
 *   60–120 °C   硫酸吸收、盐酸吸收、HCFC-22 氟化
 *   80–100 °C   乙醛水合、硫酸钠中和、冰晶石合成
 *   60–200 °C   氧化铝的酸法浸出
 *   200–450 °C  磷灰石蒸氟、Deacon 法（盐酸 → 氯气）
 *
 * **专用设备一台都没有**：凡是"湿法、常压到中压"的反应都往这一套上挂。
 * 这是缺口，不是优点 —— 和 Bosch 那一台什么活都干是同一个毛病。
 * 所以它的 holds 从 20 一直开到 500：不是它能在任何温度下工作，
 * 是不同用途各占一段，而模型里一台设备只能有一个区间。
 */
export const ACID_PLANT: Item = {
  id: 'plant/acid-plant',
  name: 'Acid Plant', name_zh: '制酸装置',
  unit: '套',
  category: 'machine',
  holds: [
    { param: 'temperature', min: 20, max: 500 },
    // 浸出槽与酸液都在加压下 —— 0.6 kPa 下水在 0.01 °C 就沸腾。
    { param: 'pressure', min: 100, max: 500 },
  ],
  composedOf: [...ACID_PLANT_PARTS.map((p) => ({ item: p.id, qty: q(1) })), { item: 'std/motor-7.5kw-4p', qty: q(1) }],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ACID_PLANT_PARTS, ...POLYMER_PARTS, ACID_PLANT, POLYMER_PLANT];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/acid-plant',
    name: 'Acid Plant Assembly', name_zh: '制酸装置装配',
    produces: [{
      item: 'plant/acid-plant',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/polymer-plant',
    name: 'Polymer Plant Assembly', name_zh: '聚合物装置装配',
    produces: [{
      item: 'plant/polymer-plant',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...ACID_PLANT_ROUTES, ...POLYMER_ROUTES, ...ASSEMBLY_ROUTES];
