/**
 * 感光胶与掩模 —— 第 9 门从 0.15 mm 进到 5 µm。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 上一版卡在"感光剂一样都没有"，那判断下得太快
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 列了五种经典光刻胶，每种的原料本层都没有：沥青、明胶、PVA、
 * 橡胶、萘醌。于是判"要另开一条感光化学链"。
 *
 * 但漏了一类：**重铬酸盐胶体**。重铬酸盐本身是感光的 —— 紫外线下 Cr(VI) 被
 * 还原成 Cr(III)，把周围的有机高分子交联起来，见光处不溶、不见光处可洗掉。
 * 这是 19 世纪照相制版（重铬酸盐-蛋白、-明胶、-虫胶）的化学，也是印刷电路
 * 在 1950 年代用的光刻胶。
 *
 * **而重铬酸盐与酚醛这两样，本层都有原料：**
 *
 *   重铬酸钠   铬铁矿精矿 + 纯碱 + 空气 → 铬酸钠（1100 °C 氧化焙烧）→ 酸化 → 重铬酸钠
 *   酚醛树脂   苯 → 苯酚 + 甲醛 → 缩聚（现成，data/material/aromatics.ts）
 *
 * 于是"感光"这一件事从"另开一条链"变成"两个现成东西兑在一起"。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 分辨率：胶能到 5 µm，卡在掩模上
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 接触式曝光的极限在衍射与胶层厚度：0.5–1 µm 的胶层能到 2–5 µm 线宽。
 * 所以胶不是瓶颈，**掩模是**：
 *
 *   第一块掩模   手刻金属箔（1 mm 级）→ 缩微照相（镜头缩 100 倍）→ 玻璃上的胶版
 *   之后的掩模   用前一块掩模 + 这套胶自己复制
 *
 * 这就是 1970 年代的"红膜刻图 + 缩微"工艺，只不过红膜在本层是**薄铁片刷漆**。
 * 1 mm ÷ 100 = 10 µm，两次缩微就是 1 µm —— 而第一次只保证 10 µm。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 曝光光源：碳弧灯
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 汞灯要汞（本层没有）。碳弧灯是电弧在两根碳棒之间燃烧 —— 光谱在紫外很强，
 * 而且**碳棒就是碳电极**（`std/carbon-electrode-300`），本层现成。
 *
 * 代价：碳弧噪声大、要经常调棒距、亮度不稳 —— 曝光时间靠试。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PHOTORESIST_ITEMS: readonly Item[] = [
  /**
   * 重铬酸钠（Na₂Cr₂O₇）。橙红色晶体，强氧化剂，水溶液感光。
   *
   * 它在这层的用处只有两个：感光胶的交联剂，和金属的钝化。
   * **顺带它是铬进入"化学"而不是"合金"的入口** —— 之前铬只做铁合金。
   */
  { id: 'mat/sodium-dichromate', name: 'Sodium Dichromate', name_zh: '重铬酸钠', unit: 'kg', category: 'material' },

  /**
   * 重铬酸盐-酚醛感光胶。琥珀色粘液，避光保存，见紫外光交联。
   *
   *   见光处   不溶于水（交联成网状）
   *   未见光   碱水或热水可洗掉
   *
   * 所以它是**负胶**：掩模挡黑的地方被洗掉，见光的地方留下 —— 与正胶相反。
   */
  { id: 'mat/photoresist', name: 'Dichromate-Phenolic Photoresist', name_zh: '重铬酸盐-酚醛感光胶', unit: 'kg', category: 'material' },

  /**
   * 接触式掩模。玻璃版上的一层图形，尺寸与片子相同，贴上去曝光。
   *
   * 第一块靠手刻 + 缩微照相；之后靠前一块复制。10 µm 起步，两代之后到 1 µm。
   */
  { id: 'std/photomask-general', name: 'Contact Mask', name_zh: '接触式掩模', unit: '件', category: 'part',
    // 掩模只声明最小图形：0.1 µm 的深亚微米版到 10 µm 的手刻版都在内。
    // 代际就是 minFeature 本身，不另设等级字段。
    props: [{ param: 'minFeature', kind: 'range', min: 0.1, max: 10, unit: 'µm', dir: 'atMost' }] },
];

export const PHOTORESIST_ROUTES: readonly Route[] = [
  {
    /**
     * 重铬酸钠：铬铁矿精矿 + 纯碱 + 空气，1100 °C 氧化焙烧 → 酸化 → 结晶。
     *
     *   铬铁矿精矿 1000（Cr₂O₃ 45%）+ 纯碱 800 → 铬酸钠 1050，再酸化得重铬酸钠 700
     *
     * 两步：
     *   焙烧   4FeCr₂O₄ + 8Na₂CO₃ + 7O₂ → 8Na₂CrO₄ + 2Fe₂O₃ + 8CO₂
     *   酸化   2Na₂CrO₄ + H₂SO₄ → Na₂Cr₂O₇ + Na₂SO₄ + H₂O
     *
     * ⚠️ 六价铬是剧毒与致癌物，本层的每一次操作都在湿法槽里做，废液必须还原处理
     * （用铁屑或亚硫酸氢钠把 Cr(VI) 还原成 Cr(III) 再沉淀）。**这条比以前任何一条都毒。**
     */
    id: 'make/sodium-dichromate',
    name: 'Sodium Dichromate Production', name_zh: '重铬酸钠制备',
    produces: [
      { item: 'mat/sodium-dichromate', qty: q(700) },
      {
        item: 'mat/chromite-leach-slag',
        qty: q(1400),
        gives: [
          { param: 'fe2o3', kind: 'range', min: 30, max: 60 },
          { param: 'cr2o3', kind: 'range', min: 1, max: 5 },
          { param: 'form', kind: 'enum', oneOf: ['solid'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/chromite-concentrate', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/soda-ash', qty: q(800) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(300) }] },
    ],
    needs: [],
    performedBy: 'plant/roaster',
    under: [{ param: 'temperature', min: 1000, max: 1200 }],
    unbalanced_zh: '铬铁矿 1000 + 纯碱 800 + 硫酸 300 → 重铬酸钠 700 + 浸出渣/钠盐/CO₂ 合计 1400（渣已单列 mat/chromite-leach-slag）',
  },
  {
    /**
     * 感光胶：重铬酸钠 + 酚醛 + 水，避光搅匀、过滤。
     *
     *   重铬酸钠 50 + 酚醛 150 + 水 800 → 胶 1000
     *
     * 配比决定感光度与分辨率：胶太稠（酚醛多）分辨率差，太稀（水多）附着不住。
     * 搅匀后要**静置消泡** —— 气泡在胶层里就是一个个针孔。
     */
    id: 'make/photoresist',
    name: 'Photoresist Production', name_zh: '感光胶制备',
    produces: [{ item: 'mat/photoresist', qty: q(1000) }],
    uses: [
      { anyOf: [{ item: 'mat/sodium-dichromate', qty: q(50) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(150) }] },
      { anyOf: [{ item: 'mat/water', qty: q(800) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '避光配液与搅拌', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 120 }, { param: 'pressure', min: 100, max: 500 }] },
      { note_zh: '静置消泡与过滤', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 120 }, { param: 'pressure', min: 100, max: 500 }] },
    ],
  },
  {
    /**
     * 掩模：薄铁片刻图 → 缩微照相 → 显影定影。
     *
     *   铁片 1 + 玻璃 1（版基）+ 胶 1 → 一块掩模
     *
     * 手刻那条线是 1 mm 级；缩 100 倍到 10 µm。镜头用比较仪那套手工研磨的镜片 ——
     * 不是照相镜头，成像有畸变，所以**同一块掩模上的图形尺寸一致性只能到 ±20%**。
     *
     * 这是本层第一次做"缩微"：图形不是画出来的，是**缩小**出来的。
     */
    id: 'make/photomask',
    name: 'Contact Mask Manufacturing', name_zh: '接触式掩模制造',
    produces: [{ item: 'std/photomask-general', qty: q(1), gives: [{ param: 'minFeature', kind: 'range', min: 3, max: 5 }] }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
    ],
    needs: ['plant/comparator'],
    steps: [
      { note_zh: '手刻铁片（1 mm 图形）', performedBy: 'plant/robot' },
      { note_zh: '缩微照相（镜头缩 100 倍，曝光在胶版上）', performedBy: 'plant/robot' },
      { note_zh: '显影与定影（碱水洗）', performedBy: 'plant/wet-bench' },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PHOTORESIST_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PHOTORESIST_ROUTES];
