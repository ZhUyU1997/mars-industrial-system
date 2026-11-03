/**
 * 扩散炉与光电高温计 —— 第 8 门：不需要光刻的第一件结型器件。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么太阳能电池/光电二极管不需要光刻
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 光刻是"在一个面上画图案"的工艺。而**整面结**的器件根本不用画：
 *
 *   一整片硅片，整面扩一层磷 → 表面全是 n 型 → 底下是 p 型底 → 一个大 p-n 结
 *   两个电极：一个在背面（整面）、一个在正面（几条细线或一个环）
 *
 * 电极的图形用**掩模挡着蒸镀**就行，精度 0.1 mm 级 —— 那是"用手摆一块开孔的
 * 铁片"，不是光刻。**所以第 8 门过得了，而第 9 门可以先绕开。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 磷从哪来：三氯氧磷
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   磷 + 氯 → 三氯化磷（PCl₃，沸点 76 °C）→ 通氧氧化 → 三氯氧磷（POCl₃，沸点 105.8）
 *
 * POCl₃ 是液体源：用氮气鼓泡带进炉管，1000 °C 下分解出磷，扩散进硅。
 * **液体源的好处是"用多少带多少"，不需要气体钢瓶与高压。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 石英管：正好是第 5 门那个坩埚的同一种材料
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 扩散炉的炉管要**高纯、耐热、不与磷反应** —— 只有石英。而高纯石英砂的提纯
 * 早已建好了（`mat/quartz-pure`）：**一个突破会被下一条链直接用上。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 器件：光电二极管 → 光电高温计
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 光电二极管把光变成电流。装进望远镜筒、配上毫伏表，就是**光电高温计**：
 *
 *   光学高温计（已有）   人眼比对灯丝与炉膛的亮度 —— 靠人、只能一个人读
 *   光电高温计（这一节） 光电池接收炉膛辐射 —— 不用人、能连续读、能进控制回路
 *
 * 而它接回的地方又是炉子：**高温炉 1100–1600 那一段一直没有仪表**，
 * 热电偶读不了、只能靠测温锥与火色。光电高温计正好覆盖那一段。
 *
 * 链条现在有两次"回头喂自己"：晶体管 → 毫伏表 → 电阻炉，
 * 光电二极管 → 光电高温计 → 高温炉（这一节）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const GATE8_PARTS: readonly Item[] = [
  /**
 * 石英炉管与法兰。高纯石英管 φ80 两端不锈钢法兰 + PTFE 密封（气密）。
 *
 * ⚠️ **φ80 与硅片对不上**（交付顺手查出）：`wafer.ts` 的硅片是 φ100 × 0.7 mm，
 * φ80 的管装不进去。这一处一直没被发现，因为模型没有"尺寸"这个量 —— 只有注释。
 * 改口径：管的内径至少 φ110（unblock-diffusion-tube.ts 那条按这个定）。
 * 旧路线与本条注释都没改数字，只把矛盾记下来 —— 改数字会牵动熔制、拉管、法兰三处，
 * 而这三处在本层都还没有可算的尺寸链。
 */
  { id: 'plant/diffusion-furnace/tube', name: 'Diffusion Furnace Quartz Tube and Flange', name_zh: '扩散炉石英炉管与法兰', unit: '件', category: 'part' },

  /** 加热体与炉膛。硅碳棒三段加热 + 氧化铝空心球砖保温（与高温炉同一套）。 */
  { id: 'plant/diffusion-furnace/heater', name: 'Diffusion Furnace Heating Element and Chamber', name_zh: '扩散炉加热体与炉膛', unit: '件', category: 'part' },

  /** 气路与源瓶。氮气鼓泡瓶（POCl₃）+ 氧气支路 + 流量阀 + 尾气处理（碱液吸收）。 */
  { id: 'plant/diffusion-furnace/gas-panel', name: 'Diffusion Furnace Gas Line and Source Bottle', name_zh: '扩散炉气路与源瓶', unit: '件', category: 'part' },
];

export const GATE8_ROUTES: readonly Route[] = [
  {
    /** 石英管。高纯石英砂 → 电弧熔制成管（拉管）→ 切定长 → 磨口 → 法兰配作。 */
    id: 'make/diffusion-tube',
    name: 'Diffusion Furnace Quartz Tube and Flange Manufacturing', name_zh: '扩散炉石英炉管与法兰制造',
    produces: [{ item: 'plant/diffusion-furnace/tube', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '熔制拉管（1900–2200 °C）', performedBy: 'plant/arc-furnace' },
      { note_zh: '切定长、磨口、退火', performedBy: 'plant/grinder' },
      { note_zh: '法兰配作与装配', performedBy: 'plant/sheet-shop' },
    ],
  },
  {
    /** 加热体。硅碳棒三段 + 氧化铝砖 + 热电偶孔（用毫伏表读）。 */
    id: 'make/diffusion-heater',
    name: 'Diffusion Furnace Heating Element and Chamber Manufacturing', name_zh: '扩散炉加热体与炉膛制造',
    produces: [{ item: 'plant/diffusion-furnace/heater', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/sic-heating-element-general', qty: q(3) }] },
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(1) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 气路与源瓶。不锈钢阀件 + 玻璃瓶 + 碱液尾气吸收塔（防 POCl₃ 水解的酸雾）。 */
    id: 'make/diffusion-gas-panel',
    name: 'Diffusion Furnace Gas Line and Source Bottle Manufacturing', name_zh: '扩散炉气路与源瓶制造',
    produces: [{ item: 'plant/diffusion-furnace/gas-panel', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
];

/**
 * 扩散炉。900–1200 °C，管式，气路可通氧、氮与 POCl₃ 蒸气。
 *
 * 三个温区（源区 200、扩散区 1000、尾区 800）—— 模型只有一个温度，
 * 所以 `holds` 写主温区那一段，源区温度记在注释里。
 */
export const DIFFUSION_FURNACE: Item = {
  id: 'plant/diffusion-furnace',
  name: 'Diffusion Furnace', name_zh: '扩散炉',
  unit: '台',
  category: 'machine',
  holds: [{ param: 'temperature', min: 900, max: 1200 }],
  composedOf: [
    ...GATE8_PARTS.map((p) => ({ item: p.id, qty: q(1) })),
    // 气路先过纯化单元：干氧才长得出致密氧化层（露点 −60 °C 以下）。
    { item: 'plant/diffusion-furnace/gas-purifier', qty: q(1) },
    { item: 'std/contactor-general', qty: q(2) },
  ],
};

export const GATE8_ITEMS: readonly Item[] = [
  /**
   * 三氯氧磷（POCl₃）。无色液体，沸点 105.8 °C，遇水剧烈水解成磷酸与氯化氢。
   *
   * 它是磷扩散的液体源：用氮气鼓泡带进炉管 —— **液体源不用高压钢瓶**，
   * 这是本层能碰扩散工艺的原因之一。
   */
  { id: 'mat/pocl3', name: 'Phosphorus Oxychloride', name_zh: '三氯氧磷', unit: 'kg', category: 'material' },

  /**
   * 光电二极管。一整片硅片上的大 p-n 结，正面一个环电极、背面整面电极。
   *
   * 它**不需要光刻**：结是整面的，电极靠掩模挡着蒸镀 —— 精度 0.1 mm 级就够。
   */
  { id: 'std/photodiode-general', name: 'Photodiode', name_zh: '光电二极管', unit: '件', category: 'part' },

  /**
   * 隐灭式光学高温计，本层基线设计。
   *
   * 条目名沿用旧称，但本层实际路线不含光电二极管：它由铜镜、碳丝灯室、
   * 红滤光片、动铁式电流表、刻度盘与铸铁镜筒等件装配。零件与零件路线见
   * `data/machine/mech-pyrometer.ts`。
   */
  { id: 'std/photoelectric-pyrometer-general', name: 'Disappearing-Filament Optical Pyrometer', name_zh: '隐灭式光学高温计', unit: '台', category: 'part',
    composedOf: [
      { item: 'std/photoelectric-pyrometer-general/tube', qty: q(1) },
      { item: 'std/photoelectric-pyrometer-general/case', qty: q(1) },
      { item: 'std/photoelectric-pyrometer-general/base', qty: q(1) },
      { item: 'std/photoelectric-pyrometer-general/mirror', qty: q(1) },
      { item: 'std/photoelectric-pyrometer-general/mirror-frame', qty: q(1) },
      { item: 'std/photoelectric-pyrometer-general/lamp-house', qty: q(1) },
      { item: 'std/photoelectric-pyrometer-general/filter', qty: q(1) },
      { item: 'std/photoelectric-pyrometer-general/ammeter', qty: q(1) },
      { item: 'std/photoelectric-pyrometer-general/scale', qty: q(1) },
      { item: 'std/photoelectric-pyrometer-general/sight', qty: q(1) },
      { item: 'std/photoelectric-pyrometer-general/spacer', qty: q(1) },
      { item: 'std/photoelectric-pyrometer-general/field-stop', qty: q(1) },
      { item: 'std/photoelectric-pyrometer-general/lamp-socket', qty: q(2) },
      { item: 'std/photoelectric-pyrometer-general/adjusting-screw', qty: q(6) },
      { item: 'std/photoelectric-pyrometer-general/blackbody-cavity', qty: q(1) },
      { item: 'std/photoelectric-pyrometer-general/spider', qty: q(1) },
      { item: 'std/photoelectric-pyrometer-general/filter-retainer', qty: q(1) },
    ] },

  /**
   * 光电式高温计。光电二极管 + 望远镜筒 + 毫伏表。
   *
   * 与光学高温计（人眼比对灯丝）的分工：**它不用人、能连续读、能进控制回路。**
   * 量程 800–2000 °C，正是高温炉那一段。
   *
   * 光电二极管与表头为装配/接线关系；半导体结属于不可逆加工，零件输入写在路线 uses。
   */
  { id: 'std/photoelectric-pyrometer-electronic', name: 'Photoelectric Pyrometer', name_zh: '光电式高温计', unit: '台', category: 'part' },
];

export const GATE8_ITEM_ROUTES: readonly Route[] = [
  {
    /**
     * 三氯氧磷：磷 + 氯 → 三氯化磷 → 通氧氧化 → POCl₃。
     *
     *   磷 100 + 氯 344 → 三氯化磷 444（PCl₃ 沸点 76，蒸馏提纯）
     *   三氯化磷 444 + 氧 64 → 三氯氧磷 508（POCl₃ 沸点 105.8，再蒸馏）
     *
     * 反应放热，本层用通用反应器做。⚠️ 降级：工业上磷与氯 60–90 °C 就够了，
     * 而本层那台反应器下限 150 —— 温度偏高会多生成五氯化磷（PCl₅），
     * 蒸馏时它受热分解回 PCl₃ 与氯，可以循环，但收率低一档。
     * 产物见水就水解，所以**蒸馏塔与储罐必须干燥** —— 与精馏三氯氢硅同一条纪律。
     */
    id: 'make/pocl3',
    name: 'Phosphorus Oxychloride Production', name_zh: '三氯氧磷制备',
    produces: [{ item: 'mat/pocl3', qty: q(508) }],
    uses: [
      { anyOf: [{ item: 'mat/phosphorus', qty: q(100) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(344) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(64) }] },
    ],
    needs: ['plant/distillation-tower'],
    performedBy: 'plant/bosch-reactor',
    under: [{ param: 'temperature', min: 150, max: 200 }],
  },
  {
    /**
     * 光电二极管：磷扩散 → 掩模蒸铝 → 合金化 → 封装 → 测光。
     *
     *   硅片 1 片（划成几十小片）+ 三氯氧磷 + 氧 + 铝
     *
     * 扩散温度 1000–1100，时间决定结深（模型没有时间）。
     * 正面电极用**掩模挡着**蒸铝 —— 掩模是一块开了窗的薄铁片，不是光刻版。
     */
    id: 'make/photodiode',
    name: 'Photodiode Manufacturing', name_zh: '光电二极管制造',
    produces: [{ item: 'std/photodiode-general', qty: q(20) }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pocl3', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
      // 光刻的料：胶、显影碱、开窗酸、清洗水。
      // 掩模不在这里 —— 它是**工具**（一块版压几百片），放在 needs 里，不消耗。
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['std/photomask-general', 'plant/evaporator'],
    steps: [
      { note_zh: '清洗与氧化（干氧，1000–1100）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1000, max: 1100 }] },
      { note_zh: '磷扩散（POCl₃ 源，1000–1100）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1000, max: 1100 }] },
      { note_zh: '涂胶与接触曝光（负胶，5–10 µm）', performedBy: 'plant/mask-aligner' },
      { note_zh: '显影与开窗腐蚀（碱水显影 + 氢氟酸）', performedBy: 'plant/wet-bench' },
      { note_zh: '掩模蒸铝与合金化（500–600）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 500, max: 600 }] },
      { note_zh: '划片、封装、测光（测短路电流）', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '硅片 1 片（约 40 小片）→ 光电二极管 20 只；余 20 片是扩散不合格与封装废品',
  },
  {
    /**
     * 光电高温计：光电二极管 + 望远镜筒 + 毫伏表 + 表壳。
     *
     *   筒是玻璃透镜 + 钢筒（对光用）；读数用毫伏表；标定仍走定点法
     *   （锡、锌、铝、银的凝固点 + 黑体炉 = 电阻炉加一个碳管靶）。
     */
    id: 'make/photoelectric-pyrometer',
    name: 'Photoelectric Pyrometer Manufacturing', name_zh: '光电式高温计制造',
    produces: [{ item: 'std/photoelectric-pyrometer-electronic', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/photodiode-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/millivoltmeter-electronic', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...GATE8_ITEMS, ...GATE8_PARTS, DIFFUSION_FURNACE];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/diffusion-furnace',
    name: 'Diffusion Furnace Assembly', name_zh: '扩散炉装配',
    produces: [{
      item: 'plant/diffusion-furnace',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...GATE8_ITEM_ROUTES, ...GATE8_ROUTES, ...ASSEMBLY_ROUTES];
