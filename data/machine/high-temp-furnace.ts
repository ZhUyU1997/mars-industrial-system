/**
 * 高温炉 —— 1100 °C 以上那一段，靠硅碳棒。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么要有第二台炉子
 * ═══════════════════════════════════════════════════════════════════════
 *
 * `plant/resistance-furnace`（镍铬丝）的上限是 1100 °C —— 镍铬丝长期超过 1200 会
 * 晶粒长大、丝发脆。这个上限刚好卡在多晶硅还原那一步（1100 °C），
 * 一点余量都没有。
 *
 * 再往上一档的发热体是**硅碳棒**：空气中 1500 °C 长期、1600 短时。
 * 而硅碳棒本层造得出 —— 碳化硅有（`mat/silicon-carbide`），烧结靠电弧炉（1900–2200）。
 *
 * 于是两台炉子分工：
 *
 *   电阻炉   100–1100   淬火、回火、氮化、时效、多晶硅的边
 *   高温炉  1100–1600   氧化铝瓷烧结、多晶硅还原、玻璃与釉的高温段
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它解开的是"第 4 门"
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 自造芯片的路拆成十道门，第 4 门是"多晶硅 1100 °C CVD"，
 * 当时的状态是"卡在线上"。这台炉子让那一步有了余量。
 *
 * 但**温度只是那一步的一个条件**：三氯氢硅的合成与精馏还没建，
 * 还原钟罩也没有 —— 门过了温度这一关，不等于门开了。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 控温：光电高温计接上了，测温锥与火色仍留着
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 上一版这里写的是"没有能读 1600 的仪表"。后来不再是：光电高温计
 * （光电二极管 + 毫伏表）覆盖 800–2000 °C，**正好是这一段**。现在的分工：
 *
 *   光电高温计  连续读数、能进控制回路（装配清单里有它）
 *   测温锥      塞格锥标号到 1800，选号摆进去，倒了就是到温 —— 复核用
 *   火色        900 橙、1100 黄白、1300 亮黄、1500 白（`plant/pyrometer` 那条链）
 *
 * 保留后两条不是保守：光电高温计读的是**表面辐射**，炉膛有烟、有挥发物时读数会漂；
 * 测温锥不漂，它只回答"到没到那个温度"。
 *
 * 功率靠抽头换接（硅碳棒的电阻随温度变，要串并联切换）—— 保温精度只有几十度，
 * 与电阻炉同档。**它不是精密炉，是一台能上 1600 的炉子。**
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const HIGH_TEMP_FURNACE_PARTS: readonly Item[] = [
  /** 炉壳。薄钢板焊箱，水冷法兰（1600 时炉口热辐射很强）。 */
  { id: 'plant/high-temp-furnace/shell', name: '高温炉炉壳', unit: '件', category: 'part' },

  /**
   * 炉衬。**氧化铝空心球砖**：刚玉质，耐火度 1800 以上，比高铝砖轻一半。
   *
   * 用空心球是为了隔热 —— 1600 °C 的炉子如果炉衬蓄热太大，升温要几小时，
   * 电全花在烧砖上。
   */
  { id: 'plant/high-temp-furnace/lining', name: '高温炉炉衬', unit: '件', category: 'part' },

  /**
   * 硅碳棒与夹具。六根棒分两组，串并联切换给三档功率。
   *
   * **它是这台炉子的寿命件**：硅碳棒用久了电阻变大（氧化生成二氧化硅膜），
   * 功率上不去，就要换。而它自己也是本层造的（`std/sic-heating-element-general`）。
   */
  { id: 'plant/high-temp-furnace/heating', name: '高温炉硅碳棒与夹具', unit: '件', category: 'part' },

  /** 炉门与料台。炉门水冷夹套 + 配重；料台用刚玉板，不粘不裂。 */
  { id: 'plant/high-temp-furnace/door', name: '高温炉炉门与料台', unit: '件', category: 'part' },
];

export const HIGH_TEMP_FURNACE_ROUTES: readonly Route[] = [
  {
    /** 炉壳。薄板剪折焊 + 水冷夹套 + 开孔。 */
    id: 'make/hightemp-shell',
    name: '高温炉炉壳制造',
    produces: [{ item: 'plant/high-temp-furnace/shell', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 炉衬。氧化铝空心球砖砌筑 —— 砌是装配，执行者是机器人。 */
    id: 'make/hightemp-lining',
    name: '高温炉炉衬制造',
    produces: [{ item: 'plant/high-temp-furnace/lining', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(1) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
    ],
    needs: ['plant/kiln'],
    performedBy: 'plant/robot',
  },
  {
    /** 硅碳棒与夹具。棒外购自产，夹具是铜排 + 铝座，压紧不发热。 */
    id: 'make/hightemp-heating',
    name: '高温炉硅碳棒与夹具制造',
    produces: [{ item: 'plant/high-temp-furnace/heating', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/sic-heating-element-general', qty: q(6) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 炉门与料台。水冷门 + 配重；料台刚玉板由熔融氧化铝浇成。 */
    id: 'make/hightemp-door',
    name: '高温炉炉门与料台制造',
    produces: [{ item: 'plant/high-temp-furnace/door', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/sheet-shop',
  },
];

/**
 * 高温炉。1100–1600 °C，四件 + 电机 + 六根硅碳棒。
 *
 * 与电阻炉同一族，差在发热体与炉衬：硅碳棒能上 1600，氧化铝空心球砖扛得住，
 * 镍铬丝与高铝砖都不行。**这两样是本层能自己造的上限**，再往上是石墨与钨钼，
 * 那要真空或惰性气氛（`plant/atmosphere-furnace` 那一台，2200 °C）。
 */
export const HIGH_TEMP_FURNACE: Item = {
  id: 'plant/high-temp-furnace',
  name: '高温炉',
  unit: '台',
  category: 'machine',
  holds: [{ param: 'temperature', min: 1100, max: 1600 }],
  composedOf: [
    ...HIGH_TEMP_FURNACE_PARTS.map((p) => ({ item: p.id, qty: q(1) })),
    { item: 'std/motor-7.5kw-4p', qty: q(1) },
    // 通断靠接触器。
    // **不装热电偶**：T 型只到 350 °C，这个温区它读不了。
    // 现在装的是**光电高温计**：光电二极管接收炉膛辐射，不用人眼比对，能连续读。
    // 这是这台炉子第一次有能进控制回路的仪表（以前只有测温锥与火色）。
    { item: 'std/contactor-general', qty: q(1) },
    { item: 'std/photoelectric-pyrometer-general', qty: q(1) },
    { item: 'std/process-controller-general', qty: q(1) },
  ],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...HIGH_TEMP_FURNACE_PARTS, HIGH_TEMP_FURNACE];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/high-temp-furnace',
    name: '高温炉装配',
    produces: [{
      item: 'plant/high-temp-furnace',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...HIGH_TEMP_FURNACE_ROUTES, ...ASSEMBLY_ROUTES];
