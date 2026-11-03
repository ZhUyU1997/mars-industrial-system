/**
 * 砖梯子 —— 从土窑到砖窑，第一级到第二级。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么要有这一段
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 严格算术暴露出设备链是圆的：
 *
 *   炼钢要熔化炉 → 熔化炉的炉壳要钢板 → 钢板要轧机 → 轧机要钢
 *
 * 环的入口是土窑（`plant/earth-kiln`，900–1100，只有夯土窑体一件零件）。
 * 但土窑上不去 1300，而耐火料、玻璃、熔渣都要 1300 以上 —— 于是需要第二级：
 *
 *   土窑（1100）→ 黏土砖（1000–1100 烧成）→ 砖窑（1300–1500）→ 玻璃、耐火料
 *
 * **这是真实历史里的顺序**：人类先有陶窑，用陶窑烧砖，用砖砌更高的窑，
 * 才烧得出玻璃与瓷。每一级都是用上一级的温度换下一级的耐火度。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 黏土砖：风化层里现成的料
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 火星风化层含黏土矿物（层状硅酸盐）10–20%，加水就有塑性，晾干就能成形。
 * 砖坯在土窑里烧到 1000–1100，黏土脱水、烧结，耐火度从 1100 提到 1300。
 *
 * 一处降级：工业黏土砖用高岭土（Al₂O₃ 35% 以上），本层用风化层直接做，
 * 铝低、铁高（风化层含 Fe₂O₃ 18%），**铁在高温下是助熔剂** —— 耐火度掉一档，
 * 砖窑的实际上限按 1300 保守写（工业砖窑能到 1500）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const BRICK_ITEMS: readonly Item[] = [
  /**
   * 黏土砖。风化层 + 水，成形晾干，土窑里烧到 1000–1100。
   *
   * 它是第一件**用窑烧出来的东西** —— 而它烧出来又是为了砌下一座更大的窑。
   * 这个循环在人类史上跑了五千年。
   */
  { id: 'std/firebrick-clay-general', name: '黏土砖', unit: '块', category: 'part' },

  /** 砖窑窑体。黏土砖砌筑的拱顶窑，只有砖与泥，没有一根金属件。 */
  { id: 'plant/brick-kiln/body', name: '砖窑窑体', unit: '件', category: 'part' },
];

export const BRICK_ROUTES: readonly Route[] = [
  {
    /**
     * 黏土砖：取土 → 掺砂 → 和水 → 制坯 → 晾干 → 入土窑烧。
     *
     *   风化层 1000 + 水 250 → 砖 800 块（每块约 1.5 kg，烧失与水各占一成）
     *
     * 掺砂是为了防止干燥开裂（砂降低收缩）。制坯用木模 —— 本层没有木，
     * 用陶瓷模（砖窑烧出的第一批瓷件之一）。
     */
    id: 'make/firebrick-clay',
    name: '黏土砖制造',
    produces: [{ item: 'std/firebrick-clay-general', qty: q(800) }],
    uses: [
      { anyOf: [{ item: 'mars/regolith', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(250) }] },
    ],
    needs: [],
    performedBy: 'plant/earth-kiln',
    under: [{ param: 'temperature', min: 1000, max: 1100 }],
    unbalanced_zh: '风化层 1000 + 水 250 → 砖 800 块；余 450 是烧失（碳酸盐分解、结合水）与晾干蒸发；产品按块计，不进质量账；余料回 mat/tailings',
  },
  {
    /**
     * 砖窑窑体：砌筑 → 留火口与烟道 → 抹泥密封 → 首烧（砖自己烧结在一起）。
     *
     *   黏土砖 5000 块 + 泥 2000 kg → 一件窑体
     *
     * **这是一台"砌出来"的机器**：不用车、不用焊、不用螺栓，只要砖与泥与手。
     * 与土窑的区别是它的砖是烧过的 —— 烧过的土能装住更高的火。
     */
    id: 'make/brick-kiln-body',
    name: '砖窑窑体制造',
    produces: [{ item: 'plant/brick-kiln/body', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/firebrick-clay-general', qty: q(5000) }] },
      { anyOf: [{ item: 'mars/regolith', qty: q(2000) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '砌窑壁与拱顶（错缝、留火口与烟道）', performedBy: 'plant/robot' },
      { note_zh: '抹泥密封与保温层', performedBy: 'plant/robot' },
      { note_zh: '首烧：慢火烘干，再升到 1300 让砖面烧结', performedBy: 'plant/earth-kiln' },
    ],
  },
];

/**
 * 砖窑。1300–1500 °C（按风化层砖的铁含量保守取 1300–1500）。
 *
 * 这一台能烧：玻璃（1400）、耐火黏土、石灰、以及下一级的耐火料。
 * 它仍然没有一台风机、没有一根钢梁 —— **第二级台阶也是土做的。**
 */
export const BRICK_KILN: Item = {
  id: 'plant/brick-kiln',
  name: '砖窑',
  unit: '座',
  category: 'machine',
  holds: [{ param: 'temperature', min: 1300, max: 1500 }],
  composedOf: [{ item: 'plant/brick-kiln/body', qty: q(1) }],
};

/**
 * 玻璃（砖窑版）。与 `make/glass` 同一个产出，第二条来路 ——
 * 差别只在设备：那一台要工业窑（1200–1750）且要辐射板散热，这一台只要砖窑。
 *
 * 配方与产气量照抄原路线（硅石 761 + 纯碱 220 + 石灰石 110 → 玻璃 1000 + 二氧化碳 91）：
 * **同一个配方，换一台炉子** —— 这正是"同产出、多路线"该有的样子。
 *
 * ⚠️ **这条路线还断在纯碱上**（查清 —— 前几轮我一度以为窑通了玻璃就通了，错的）：
 *
 *   mat/glass ← mat/soda-ash ← make/soda-ash（performedBy plant/acid-plant）
 *             ← plant/acid-plant/cooler（酸厂最后一件）
 *
 * **窑通了只是必要条件，酸厂才是这条链的门。** 酸厂一通，soda-ash → glass →
 * 玻璃钟罩、玻璃器皿一大批同时开；在那之前，凡是要 `mat/glass` 的路线都得另想办法
 * （铜镜、石英、铸铁、挂釉陶 —— 这几种都已在本层用过）。
 */
export const GLASS_BY_BRICK_KILN: Route = {
  id: 'make/glass-brick-kiln',
  name: '玻璃制备',
  produces: [
    { item: 'mat/glass', qty: q(1000), gives: [
      { param: 'type', kind: 'enum', oneOf: ['soda-lime'] },
      { param: 'alpha', kind: 'range', min: 8, max: 9 },
    ] },
    { item: 'mat/co2', qty: q(91) },
  ],
  uses: [
    { anyOf: [{ item: 'mat/silica', qty: q(761) }] },
    { anyOf: [{ item: 'mat/soda-ash', qty: q(220) }] },
    { anyOf: [{ item: 'mat/lime', qty: q(110) }] },
  ],
  needs: [],
  performedBy: 'plant/brick-kiln',
  under: [{ param: 'temperature', min: 1400, max: 1500 }],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...BRICK_ITEMS, BRICK_KILN];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/brick-kiln',
    name: '砖窑装配',
    produces: [{
      item: 'plant/brick-kiln',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...BRICK_ROUTES, GLASS_BY_BRICK_KILN, ...ASSEMBLY_ROUTES];
