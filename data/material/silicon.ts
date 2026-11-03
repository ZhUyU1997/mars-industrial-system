/**
 * 硅与硅钢 —— 电机链的上游。
 *
 * 风化层 45% 是 SiO₂，而数据里从来没有"硅"这个条目。这一层补三样：
 *
 *   硅石    尾矿富集到 90% SiO₂（2.5 : 1）
 *   硅铁    SiO₂ + 2C → Si + 2CO，配铁成 45% FeSi
 *   硅钢    铁加 3% 硅，轧成片 —— 电机的铁芯就是它
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 硅铁把温度上限顶到了尽头
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 75% 硅铁要 1900 °C 以上，本层最热的矿热炉只有 1800。所以这里做 **45% 硅铁**：
 * 它在 1700–1800 °C 就能出炉，正好卡在矿热炉的上限里。
 *
 * 45% 够不够？硅钢要 3% 硅，一吨钢配 67 kg 硅铁就够 —— 用量很小，
 * 品位低一点不碍事，多配几公斤而已。**这是"降级使用"的第三次**：
 * 碳电极（电阻大）、丁醇（起泡弱）、45% 硅铁（品位低）——
 * 都是"能用但不是最好"，而三次都恰好够用。
 *
 * 再往上就不行了：半导体级硅要 99.9999%，那是另一层，本层连 98% 的
 * 冶金级硅都不做（它要 1900–2000 °C 与碳电极，温度不够）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 硅钢为什么要轧
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 电机铁芯用 0.35–0.5 mm 的硅钢片叠成，不是为了强度，是为了**切断涡流**：
 * 片与片之间绝缘，涡流绕不出去，铁损就小一个数量级。所以硅钢必须薄，
 * 薄就必须轧 —— 轧机在这一层第二次出场（第一次是冷轧薄板）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const SILICON_ITEMS: readonly Item[] = [
  /**
   * 硅石。尾矿富集到 90% SiO₂，作硅铁的料、玻璃的料、耐火料的料。
   *
   * 它是全表最不缺的东西：风化层 45% 是它。缺的从来不是硅石，是把它还原成
   * 硅的能量与温度。
   */
  { id: 'mat/silica', name: 'Silica', name_zh: '硅石', unit: 'kg', category: 'material',
    props: [{ param: 'sio2', kind: 'range', min: 85, max: 99, unit: '%' }] },

  /**
   * 硅铁，45% Si。SiO₂ 用碳还原，硅溶进铁里。
   *
   * 它有三处用处：硅钢的合金、钢的脱氧剂、以及"硅"这个元素本身的载体。
   * 75% 的牌号要 1900 °C，本层只有 1800，所以做 45% 的。
   *
   * **品位写进 id。** 与 `mat/steel-45`、`mat/iron-ht300` 同一条规矩：牌号
   * 就是"它是什么"。不写的话，将来若真有 75% 牌号，两者会共用一个 id，
   * 下游按 67 kg 配料就悄悄从 3% 硅变成 5% 硅，而质量账仍是 1000 kg，
   * 校验一条也报不出来。
   */
  { id: 'mat/ferrosilicon-45', name: 'Ferrosilicon', name_zh: '硅铁', unit: 'kg', category: 'material' },

  /**
   * 硅钢，3% Si。电机与变压器的铁芯材料。
   *
   * 硅的作用有两个：提高电阻率（涡流小）、降低矫顽力（磁滞小）。
   * 两者都直接变成效率 —— 一台电机的损耗，一半在铁芯上。
   *
   * 牌号同理写进 id。真实牌号还有取向/无取向与厚度两个轴，模型不建模尺寸，
   * 所以这里只钉住最要紧的那一个数：3% 硅。
   */
  { id: 'mat/silicon-steel-3si', name: 'Silicon Steel', name_zh: '硅钢', unit: 'kg', category: 'material' },
];

export const SILICON_ROUTES: readonly Route[] = [
  {
    /**
     * 硅石富集：尾矿 2470 → 硅石 1000（90% SiO₂，2.5 : 1）。
     *
     * 尾矿里 SiO₂ 约 45%，富集到 90% 要 2 : 1，再加筛余与烧失。
     * 这一步与耐火料同源 —— 同一堆尾矿，一个烧砖、一个做硅石。
     */
    id: 'make/silica',
    name: 'Silica Enrichment', name_zh: '硅石富集',
    produces: [
      { item: 'mat/silica', qty: q(1000), gives: [{ param: 'sio2', kind: 'range', min: 90, max: 98, dir: 'atLeast' }] },
      { item: 'mat/tailings', qty: q(1470) },
    ],
    uses: [{ anyOf: [{ item: 'mat/tailings', qty: q(2470) }] }],
    needs: [],
    performedBy: 'plant/ore-beneficiary',
    unbalanced_zh: '尾矿 2470 kg 富集到 1000 kg 硅石 + 选矿尾砂 1470（已单列 mat/tailings，回到尾矿）',
  },
  {
    /**
     * 硅铁：SiO₂ + 2C → Si + 2CO，硅溶进铁里成 45% FeSi，1700–1800 °C。
     *
     *   963 硅石 + 385 碳 + 550 铁 → 1000 硅铁 + 898 一氧化碳
     *
     * 硅 450 kg、铁 550 kg，正好 45%。一氧化碳是可燃的尾气，可以回炉，
     * 但本链没有它的条目，所以随炉气排掉 —— 它是这套体系里第二大的
     * 废气来源（第一是 Bosch 制碳的循环气）。
     */
    id: 'make/ferrosilicon',
    name: 'Ferrosilicon Production', name_zh: '硅铁制备',
    produces: [
      { item: 'mat/ferrosilicon-45', qty: q(1000) },
      { item: 'mat/co', qty: q(898), gives: [{ param: 'purity', kind: 'range', min: 40, dir: 'atLeast' }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silica', qty: q(963) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(385) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(550) }] },
    ],
    needs: ['plant/radiator'],
    performedBy: 'plant/submerged-arc-furnace',
    under: [{ param: 'temperature', min: 1700, max: 1800 }],
  },
  {
    /**
     * 硅钢：铁 933 + 硅铁 67 → 1000（硅 30 kg，即 3%）。
     *
     * 熔炼后热轧、冷轧到 0.5 mm，再退火。**退火是关键**：冷轧后的晶粒
     * 变形了，磁性能差，要在 800–1000 °C 保温让晶粒长大、取向。
     *
     * 取向硅钢（变压器用）要更复杂的工艺，本层只做无取向的（电机用）。
     */
    id: 'make/silicon-steel',
    name: 'Silicon Steel Production', name_zh: '硅钢制备',
    produces: [{ item: 'mat/silicon-steel-3si', qty: q(1000) }],
    uses: [
      { anyOf: [{ item: 'mat/iron', qty: q(933) }] },
      { anyOf: [{ item: 'mat/ferrosilicon-45', qty: q(67) }] },
    ],
    needs: ['plant/kiln'],
    performedBy: 'plant/rolling-mill',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...SILICON_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...SILICON_ROUTES];
