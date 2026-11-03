/**
 * 电渣重熔 —— 把轴承钢的氧含量从"压不下去"变成"压得下去"。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 那一处降级挂了很多节
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 写轴承的时候留下的：
 *
 *   > 轴承钢的难点不在成分，在**纯净度**。氧含量要压到 10 ppm 以下 ——
 *   > 氧化物夹杂是疲劳剥落的起点。工业上靠真空脱气或电渣重熔，本层两样都没有。
 *   > 所以做出来的是低端轴承：成分对、硬度对、寿命短一截。
 *
 * **真空脱气**要真空炉（10 Pa 级 + 大抽速），本层做不到。
 * 但**电渣重熔（ESR）**只是"用电把钢重新化一遍，让它穿过一层渣" ——
 * 而要的东西本层全有：电、渣料、水冷铜结晶器。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它是怎么除杂的
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   自耗电极  要提纯的钢，做成一根电极，插进渣池
 *   渣池       CaF₂–Al₂O₃ 熔渣，1800 °C，通电后是电阻发热体
 *   重熔      电极端面熔化，钢滴**穿过渣层**落进下面的钢池
 *   凝固      水冷铜结晶器把钢池自下而上定向凝固
 *
 * 三个除杂机制同时起作用：
 *
 *   渣洗     钢滴穿过渣，氧化物夹杂被渣吸收（渣与夹杂的界面能低）
 *   渣保护   钢池上始终有一层渣，隔绝空气 —— **不氧化就少夹渣**
 *   定向凝固 自下而上凝固，杂质往头部富集，最后切掉
 *
 * 效果：氧含量从 40–80 ppm 降到 **15–25 ppm**，夹杂物尺寸小一个量级。
 * 这就是"10 ppm 以下"与"低端"之间的大部分距离 —— **不是全部，但大部分。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 一处本层没有的：萤石
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 工业渣料的主成分是萤石（CaF₂，占 70%）。火星风化层里的氟在磷灰石中（约 2.5%），
 * 本层已经从那里提取氢氟酸了（`make/hf`）—— 所以氟有，但要单独做成渣料。
 *
 * 退路：**用纯 Al₂O₃–CaO 渣**（不含氟）。它的熔点高（1400 °C 起）、黏度大，
 * 除杂能力差一档，但不需要萤石。这一版走这条。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ESR_ITEMS: readonly Item[] = [
  /**
   * 重熔渣料。CaO–Al₂O₃ 系（本层没有萤石，所以不用 CaF₂ 系）。
   *
   * 熔点 1400 °C 起、1800 °C 流动性够用。工业用 CaF₂ 系的理由是"熔点低、黏度小、
   * 除杂快"—— 本层用氧化钙氧化铝系，慢一档。
   */
  { id: 'mat/esr-slag', name: 'Remelted Slag', name_zh: '重熔渣料', unit: 'kg', category: 'material' },
];

export const ESR_PARTS: readonly Item[] = [
  /** 水冷铜结晶器。铜壁 + 水套，内径决定钢锭直径（φ200）。 */
  { id: 'plant/esr-furnace/mold', name: 'Electroslag Remelting Furnace Water-Cooled Copper Mold', name_zh: '电渣重熔炉水冷铜结晶器', unit: '件', category: 'part' },

  /** 电极升降机构。丝杠 + 立柱 + 夹持，速度 5–20 mm/min，要稳。 */
  { id: 'plant/esr-furnace/feed', name: 'Electroslag Remelting Furnace Electrode Lifting Mechanism', name_zh: '电渣重熔炉电极升降机构', unit: '件', category: 'part' },

  /** 短网与电源接口。大电流（几千安）铜排 + 抽头变压器。 */
  { id: 'plant/esr-furnace/busbar', name: 'Electroslag Remelting Furnace Short Network and Power Interface', name_zh: '电渣重熔炉短网与电源接口', unit: '件', category: 'part' },
];

export const ESR_ROUTES: readonly Route[] = [
  {
    /** 渣料：氧化铝 + 石灰（不要萤石），磨细混匀、预熔。 */
    id: 'make/esr-slag',
    name: 'Slag Production', name_zh: '渣料制备',
    produces: [{ item: 'mat/esr-slag', qty: q(1000) }],
    uses: [
      { anyOf: [{ item: 'mat/alumina', qty: q(700) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(300) }] },
    ],
    needs: ['plant/high-temp-furnace'],
    performedBy: 'plant/robot',
  },
  {
    /** 结晶器：铜板卷筒 + 水套 + 底水箱（可升降，决定锭长）。 */
    id: 'make/esr-mold',
    name: 'Electroslag Remelting Furnace Water-Cooled Copper Mold Manufacturing', name_zh: '电渣重熔炉水冷铜结晶器制造',
    produces: [{ item: 'plant/esr-furnace/mold', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 电极升降：立柱 + 丝杠 + 夹持 —— 与直拉炉的提拉头同一套手艺。 */
    id: 'make/esr-feed',
    name: 'Electroslag Remelting Furnace Electrode Lifting Mechanism Manufacturing', name_zh: '电渣重熔炉电极升降机构制造',
    produces: [{ item: 'plant/esr-furnace/feed', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/iron-ht200', qty: q(1) }] },
      { anyOf: [{ item: 'std/bearing-general-p0', qty: q(2) }] },
    ],
    needs: ['plant/grinder'],
    performedBy: 'lathe',
  },
  {
    /** 短网与电源：铜排 + 抽头变压器（与焊机、中频电源同一族）。 */
    id: 'make/esr-busbar',
    name: 'Electroslag Remelting Furnace Short Network and Power Interface Manufacturing', name_zh: '电渣重熔炉短网与电源接口制造',
    produces: [{ item: 'plant/esr-furnace/busbar', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'std/transformer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(2) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 电渣重熔：把轴承钢重新化一遍。
     *
     *   轴承钢 1000 + 渣料 30 → 重熔钢 900
     *
     * 收率 90%：切头（杂质富集段）与渣壳损失。
     * **它不改成分，只改纯净度** —— 所以这条路线产出的仍是 `mat/bearing-steel`，
     * 只是氧含量低了。化学成分没变，性能变了一截。
     */
    id: 'make/bearing-steel-esr',
    name: 'Bearing Steel Production by Electroslag Remelting', name_zh: '电渣重熔制备',
    produces: [
      {
        item: 'mat/bearing-steel',
        qty: q(900),
        // 同上：重熔只改纯净度，仍是退火态，硬度不给窗口。
        gives: [{ param: 'hardness', kind: 'range', min: 60, max: 65 }],
      },
      {
        item: 'mat/esr-crop-end',
        qty: q(130),
        gives: [
          { param: 'iron', kind: 'range', min: 95, max: 98 },
          { param: 'carbon', kind: 'range', min: 0.8, max: 1.1 },
          { param: 'form', kind: 'enum', oneOf: ['solid'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/bearing-steel', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/esr-slag', qty: q(30) }] },
    ],
    needs: [],
    performedBy: 'plant/esr-furnace',
    under: [{ param: 'temperature', min: 1750, max: 1850 }],
    unbalanced_zh: '轴承钢 1000 + 渣 30 → 重熔钢 900 + 切头/渣壳 130（已单列 mat/esr-crop-end，可回 ESR 重熔）',
  },
];

/**
 * 电渣重熔炉。1750–1850 °C 的渣池。
 *
 * `holds` 温度 —— 它是本层温度最高的"精炼"设备（熔炼炉 1650、电弧炉 2200 但不是精炼）。
 */
export const ESR_FURNACE: Item = {
  id: 'plant/esr-furnace',
  name: 'Electroslag Remelting Furnace', name_zh: '电渣重熔炉',
  unit: '台',
  category: 'machine',
  holds: [{ param: 'temperature', min: 1750, max: 1850 }],
  composedOf: [
    ...ESR_PARTS.map((p) => ({ item: p.id, qty: q(1) })),
    { item: 'std/motor-7.5kw-4p', qty: q(1) },
    { item: 'std/process-controller-general', qty: q(1) },
  ],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ESR_PARTS, ...ESR_ITEMS, ESR_FURNACE];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/esr-furnace',
    name: 'Electroslag Remelting Furnace Assembly', name_zh: '电渣重熔炉装配',
    produces: [{
      item: 'plant/esr-furnace',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...ESR_ROUTES, ...ASSEMBLY_ROUTES];
