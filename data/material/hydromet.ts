/**
 * 湿法冶金 —— 没有选矿厂、没有电解精炼时的那条路。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 两件事：先把 SO₂ 变成硫酸，再用硫酸把铜从土里泡出来
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   ① SO₂ + ½O₂ + H₂O → H₂SO₄      铁盐催化，水相氧化
 *   ② 风化层里的铜 + 硫酸 → 硫酸铜液；再 + 铁 → 铜（胆铜法）
 *
 * **两条都是"没有设备"时的路。** 工业上的接触法要 V₂O₅（钒那条链没通），
 * 铅室法要铅（铅锌链没建），而铁盐催化的水相氧化只要一个**砖砌的池子**。
 *
 * 铁盐催化是 19 世纪就有的办法：Fe²⁺ 被氧成 Fe³⁺，Fe³⁺ 再把 SO₂ 氧成硫酸根，
 * 自己还原回 Fe²⁺ —— **铁是催化剂，被消耗的是氧与水。**
 *
 * 氧从哪来：高氯酸盐分解（火星风化层里 0.5–1% 高氯酸盐，500–600 °C 放氧）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 铜的富集比：8333 : 1
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   风化层含铜约 100 ppm → 一吨土出 0.1 kg 铜
 *
 * 也就是说：**1 kg 铜要十吨土。** 但十吨土是机器人一铲一铲能挖的，
 * 而选矿厂是一整套设备。这正是"湿法"在点火阶段的意义。
 *
 * ⚠️ 一处必须说清：浸出率不可能 100%。风化层里的铜有相当部分锁在硅酸盐晶格里
 * （不是氧化物），硫酸泡不出来。所以这里按**浸出率 50%** 记 ——
 * 实际是"能泡出多少算多少"，矿相决定，模型表达不了。
 */

import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

/**
 * 稀硫酸：把浓酸兑水降到电解液浓度。
 *
 * 这一条是被属性系统逼出来的 —— 给 mat/sulfuric-acid 声明了 concentration 之后，
 * 电解精炼那条路线要 10–20 %，而两条产酸路线只给 30–50 % 与 96–98 %，
 * 校验器当场报 prop_unfilled：**模型里没有"兑水"这一步**。
 *
 * 工艺上它不值一提（一罐浓酸 + 水，搅匀，量密度），但模型必须有它，
 * 否则"稀酸从哪来"就永远是个洞。这是属性系统的第一个真实收获。
 */
export const DILUTE_ACID_ROUTE: Route = {
  id: 'make/sulfuric-acid-dilute',
  name: 'Sulfuric Acid Production', name_zh: '硫酸制备',
  // 一罐 1000 kg 的兑水与搅匀：2 h。
  rate: { hours: q(2) },
  produces: [
    {
      item: 'mat/sulfuric-acid',
      qty: q(1000),
      gives: [{ param: 'concentration', kind: 'range', min: 10, max: 20 }],
    },
  ],
  uses: [
    // 按 98 % 兑到 15 %：1000 kg 稀酸 = 153 kg 浓酸 + 847 kg 水
    {
      anyOf: [
        {
          item: 'mat/sulfuric-acid',
          qty: q(153),
          need: [{ param: 'concentration', kind: 'range', min: 96, max: 98 }],
          onRelax: 'functional-kept',
        },
      ],
    },
    { anyOf: [{ item: 'mat/water', qty: q(847) }] },
  ],
  needs: [],
  performedBy: 'plant/wet-bench',
};

export const HYDROMET_ROUTES: readonly Route[] = [
  {
    /**
     * 硫酸（湿法氧化）：SO₂ + ½O₂ + H₂O，铁盐催化。
     *
     *   二氧化硫 640 + 氧 160 + 水 200 + 铁盐 1 → 硫酸 980
     *
     * 这是接触法之前的老办法：把 SO₂ 和空气通进含铁盐的水里，
     * 塔里喷淋、池里循环。
     *
     * ⚠️ **出来的不是 30–50% 的稀硫酸，是 98%**（按账校正）：
     * 640 kg SO₂ = 10 kmol → 10 kmol H₂SO₄ = 980 kg，配 200 kg 水（理论 180）。
     * 所以这里的 980 kg 是**纯酸**；若真是 30–50%，出来的重量该是 2000–3000 kg。
     * 这条不是笔误能盖过去的：稀酸对铸铁是最坏区间（120–150 °C 浓酸反而钝化），
     * 而本层的酸槽、酸管、釜胆全是铸铁 —— **"是浓酸"这件事撑着一整片设备。**
     * 冷凝到 98% 靠把烟气冷到酸露点以下（铸铁管风冷），那一步没写进路线，记在缺口里。
     */
    id: 'make/sulfuric-acid-wet',
    name: 'Sulfuric Acid Production', name_zh: '硫酸制备',
    produces: [
      { item: 'mat/sulfuric-acid', qty: q(980), gives: [{ param: 'concentration', kind: 'range', min: 30, max: 50 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/so2', qty: q(640) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(160) }] },
      { anyOf: [{ item: 'mat/water', qty: q(200) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    unbalanced_zh: 'SO₂ 640 + 氧 160 + 水 200 → 硫酸 980；余 20 是尾气与铁盐损耗（铁盐循环）',
  },
  {
    /**
     * 胆铜法：硫酸浸出 + 铁置换。
     *
     *   风化层 10000（含铜 1 kg）+ 硫酸 200 + 铁 2 → 铜 1 + 浸出渣 10199
     *
     * 浸出：CuO·Fe₂O₃ 一类的氧化铜矿遇酸成硫酸铜
     * 置换：Cu²⁺ + Fe → Cu + Fe²⁺（铁比铜活泼，19 世纪中国人叫"胆铜"）
     *
     * ⚠️ 两个 50%：浸出率 50%（另一半锁在硅酸盐里）、置换率 95%。
     * 合起来一吨土出 0.05 kg 铜 —— **20 吨土一公斤铜。**
     */
    id: 'make/copper-cement',
    name: 'Cement Copper Production by Gall Copper Method', name_zh: '胆铜法制备',
    produces: [{ item: 'mat/copper', qty: q(1), gives: [{ param: 'purity', kind: 'range', min: 99, max: 99.9, dir: 'atLeast' }] }],
    uses: [
      { anyOf: [{ item: 'mars/regolith', qty: q(10000) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(200) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(2) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    unbalanced_zh: '风化层 10000（含铜 1 kg，按 100 ppm 计）+ 硫酸 200 + 铁 2 → 铜 1；余 10201 是浸出渣与废液（浸出率 50%、置换率 95%）',
  },
];

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...HYDROMET_ROUTES, DILUTE_ACID_ROUTE];
