/**
 * 贵金属链。
 *
 * 起点是 `mat/anode-sludge`：铜与镍电解精炼的阳极泥，每 1000 kg 阴极出 10 kg。
 * 在这份文件之前，它是**没人吃的死产** —— 模型知道它存在，但不知道拿它干什么。
 *
 * 而它是全厂**唯一**的贵金属入口：火法冶炼里，金、银、铂族全部富集在阳极泥里，
 * 因为它们在电解条件下不溶（正电位比铜高得多）。这不是"顺便回收"，是唯一路径。
 *
 * 一条真实的阳极泥流程（硫酸化焙烧 → 水浸 → 银 → 金 → 硒）：
 *
 *   阳极泥 → 硫酸化焙烧（300–400 °C，铜镍变可溶硫酸盐、硒变 SeO₂ 挥发）
 *          → 水浸（硫酸铜进液，贵金属留在渣里）
 *          → 硝酸浸银 → 铜置换 → 海绵银
 *          → 王水溶金 → 硫酸亚铁还原 → 金粉
 *          → SeO₂ 吸收 → SO₂ 还原 → 粗硒
 *
 * 一个必须说清的缺口：**本层没有氰化物**（氰化法是工业主流），
 * 所以银走硝酸-铜置换、金走王水-亚铁还原 —— 两条都是 19 世纪的路，
 * 慢、腐蚀性强，但都不需要氰化钠。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PRECIOUS_ITEMS: readonly Item[] = [
  {
    id: 'mat/silver',
    name: '银',
    unit: 'kg',
    category: 'material',
    // 银在电学上是本层最好的导体（比铜高 6%），也是唯一能"半透膜"做分光镜的金属
    // —— 那条干涉仪分光板曾因为"没有银"退成楔形玻璃板。
    props: [{ param: 'purity', kind: 'range', min: 90, max: 99.99, unit: '%', dir: 'atLeast' }],
  },
  {
    id: 'mat/gold',
    name: '金',
    unit: 'kg',
    category: 'material',
    // 本层没有真用途（不氧化、不催化、太软）—— 但金是"电接触"的最后手段：
    // 微伏级触点镀金，因为氧化层会让 µV 级测量漂掉。这是仪表链的落点。
    props: [{ param: 'purity', kind: 'range', min: 90, max: 99.99, unit: '%', dir: 'atLeast' }],
  },
  {
    id: 'mat/selenium',
    name: '硒',
    unit: 'kg',
    category: 'material',
    // 硒：整流片、光电池、玻璃脱色。本层没有光电池，但整流片用得上。
    props: [{ param: 'purity', kind: 'range', min: 90, max: 99.9, unit: '%', dir: 'atLeast' }],
  },
  {
    id: 'mat/copper-sulfate',
    name: '硫酸铜',
    unit: 'kg',
    category: 'material',
    // 硫酸铜：电镀、浮选活化剂、杀菌。以前只能从"铜 + 硫酸"硬做，现在阳极泥是它的第二条来路。
    props: [{ param: 'purity', kind: 'range', min: 90, max: 99, unit: '%', dir: 'atLeast' }],
  },
];

export const PRECIOUS_ROUTES: readonly Route[] = [
  {
    /**
     * 硫酸化焙烧 + 水浸。
     *
     * 阳极泥 1000 + 硫酸 800 → 焙烧 300–400 °C（铜镍变硫酸盐、硒变 SeO₂）
     * → 水浸 → 硫酸铜溶液（结晶得硫酸铜 1200）+ 贵金属渣 400 + 硒 60。
     *
     * 这一步把"10 kg/1000 kg 阴极"的阳极泥分成三股：
     * 铜回来了（硫酸铜），贵金属富集了（渣），硒挥发了（单独收）。
     */
    id: 'make/anode-sludge-roast',
    name: '硫酸铜制备',
    produces: [
      { item: 'mat/copper-sulfate', qty: q(1200), gives: [{ param: 'purity', kind: 'range', min: 92 }] },
      { item: 'mat/selenium', qty: q(60), gives: [{ param: 'purity', kind: 'range', min: 92 }] },
      // 贵金属渣不单设条目：它就地进下一条路线，见 make/silver-from-sludge。
    ],
    uses: [
      { anyOf: [{ item: 'mat/anode-sludge', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(800), need: [{ param: 'concentration', kind: 'range', min: 96, max: 98 }], onRelax: 'functional-kept' }] },
      { anyOf: [{ item: 'mat/water', qty: q(2000) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh:
          '硫酸化焙烧 300–400 °C：铜镍变可溶硫酸盐、硒变 SeO₂ 挥发（每 1 t 泥 800 kg 酸，焙烧 2–4 h）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 300, max: 400 }],
      },
      {
        note_zh: '水浸 20–120 °C：硫酸铜进液，贵金属留在渣里；渣 400 kg 就地进 make/silver-from-sludge',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 120 }],
      },
    ],
    unbalanced_zh:
      '阳极泥 1000 + 硫酸 800 + 水 2000 → 硫酸铜 1200 + 硒 60；余 2540 是浸出液里的水与酸，贵金属渣 400 就地进 make/silver-from-sludge',
  },
  {
    /**
     * 银：硝酸浸 → 铜置换。
     *
     * 贵金属渣 400 + 硝酸 600 → 硝酸银溶液 → 加铜片置换：
     *   2AgNO₃ + Cu → 2Ag + Cu(NO₃)₂
     * → 海绵银 210。
     *
     * **为什么用铜置换而不是电解**：电解银要 99.99 % 的纯度与纯净电解液，
     * 而铜置换只要铜片和搅拌 —— 这是本层的水平。代价是银里带 0.5–2 % 铜。
     */
    id: 'make/silver-from-sludge',
    name: '银制备',
    produces: [
      { item: 'mat/silver', qty: q(210), gives: [{ param: 'purity', kind: 'range', min: 95 }] },
      {
        item: 'mat/copper-nitrate-solution',
        qty: q(1460),
        gives: [
          { param: 'copper', kind: 'range', min: 20, max: 60 },
          { param: 'acidity', kind: 'range', min: 50, max: 200 },
          { param: 'form', kind: 'enum', oneOf: ['solution'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(600) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(70) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1000) }] },
    ],
    needs: [],
    performedBy: 'plant/wet-bench',
    under: [{ param: 'temperature', min: 20, max: 80 }],
    unbalanced_zh: '硝酸 600 + 铜 70 + 水 1000 = 1670 → 银 210 + 硝酸铜溶液 1460（已单列 mat/copper-nitrate-solution，可回 make/copper-sulfate）= 1670，平',
  },
  {
    /**
     * 金：王水溶 → 硫酸亚铁还原。
     *
     * 渣 190（提银后的残渣）+ 盐酸 400 + 硝酸 100（配王水）→ 氯金酸
     * → 加硫酸亚铁：Au³⁺ + 3Fe²⁺ → Au + 3Fe³⁺ → 金粉 12。
     *
     * 量很小，但它是**唯一**的金来源。品位口径现在三处不一致：
     * 本路线按富泥 **1.2 % Au = 12 kg/t** 记账；本节旧注写 30–100 g/t，
     * `unblock-electrorefining-cell.ts:123` 写 0.1–1 g/t —— 三处差 10²–10⁴，
     * 待统一；**不能拿金的品位外推铂族**（铂族按 `pgm.ts` 的镍侧泥品位
     * 8 %/10 % 单独设计，两套账不混用）。
     * 王水要现配（三天内失效），且必须在通风处 —— 本层没有通风条目，
     * 这条记在降级里。
     */
    id: 'make/gold-from-sludge',
    name: '金制备',
    produces: [{ item: 'mat/gold', qty: q(12), gives: [{ param: 'purity', kind: 'range', min: 98 }] }],
    uses: [
      { anyOf: [{ item: 'mat/hcl', qty: q(400) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(100) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(80) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(60), need: [{ param: 'concentration', kind: 'range', min: 96, max: 98 }], onRelax: 'functional-kept' }] },
    ],
    needs: [],
    performedBy: 'plant/wet-bench',
    under: [{ param: 'temperature', min: 20, max: 80 }],
    unbalanced_zh: '王水（盐酸 400 + 硝酸 100）+ 铁 80 → 金 12；余是氯化铁与硝酸盐废液，本链未建处理',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PRECIOUS_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PRECIOUS_ROUTES];
