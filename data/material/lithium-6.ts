/**
 * ⁶Li 内标：从卤水到 90–95 % 富集的锂-6。
 *
 * ⚠️ **为什么需要它**（`data/measure/boron.ts` 的缺口⑧）：ICP-MS 测 B 时，
 * ⁹Be 与 ¹⁰B 干扰（10.013 vs 10.020），Be 不能做内标；现在靠基体匹配外标，
 * 回收 90–110 %。⁶Li（6.015）离 ¹⁰B 4 u、离 ¹¹B 5 u，在 R=4000 下完全不干扰，
 * 是最干净的 B 内标。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、为什么是真空蒸馏（不是汞齐、不是冠醚）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   COLEX 汞齐法：分离系数 1.05–1.06 最好，但 `mat/mercury` **0 条目**（本轮 grep），
 *     汞链要从辰砂焙烧建起 —— 不在这一条上。
 *   冠醚法：苯并-15-冠-5 的分离系数 1.03–1.05，但 `mat/crown-ether` 0 条目，
 *     合成要邻苯二酚（也 0 条目）。
 *   **真空蒸馏**：锂金属 500–600 °C、10⁻²–1 Pa 下蒸发，⁶Li 的蒸气压高 4–8 %
 *     ⇒ 单级分离系数 **1.04–1.06**；锂的汽化焓 145 kJ/mol（20.9 MJ/kg），
 *     200–400 级的回流比 10–20 —— 这是本层唯一不需要新毒物、只吃电与钢的路。
 *
 *   级数账：天然 ⁶Li 7.5 % → 92 %，需要
 *     ln[(0.92/0.08)/(0.075/0.925)] = ln 142 = 4.96；ln 1.05 = 0.0488
 *     ⇒ **理论 102 级**，实际 200–400 级（回流与效率）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、锂从哪来：卤水
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `mars/brine`（已有，卤水）Li **1–5 ppm**（设计值）：3000 kg 卤水 → 9 g Li →
 *   0.05 kg Li₂CO₃（3.1 ppm 计）。浓缩靠真空蒸发（`plant/wet-bench` 40–60 °C），
 *   除镁钙用 NaOH，沉锂用纯碱（`mat/soda-ash`）80–95 °C。
 *   ⚠️ 卤水里的硼会跟着进来：Li₂CO₃ 的硼 **0.1–0.4 ppb**，重结晶后 0.05–0.1 ppb；
 *   做内标用还要再过一次硼树脂（`mat/boron-selective-resin`），否则 ⁶Li 标液自己
 *   带硼 —— 这是这条链最容易被忽略的一笔。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、窗口与判据
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ⁶Li 富集 **91–94 %**（90–95 的窗口）
 *   内标浓度 **10–50 ppb**（一次配 1 L，用 1 个月）
 *   回收率判据 **95–105 %**（相对外标；原来 90–110 %）
 *   标液硼本底 **≤0.05 ppb**（低于样品 0.02–0.1 ppb 的量级，不抬空白）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、缺口（带数）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① 汞齐法与冠醚法都不在本层（Hg 0 条目、冠醚 0 条目）：蒸馏法级数多、
 *     能耗高（每 kg ⁶Li 约 2–4 MWh，按 200 级回流 10 倍估）。
 *  ② 200–400 级的塔要 **6 座 4–6 m 塔串联**（总高 30–40 m）、600 °C 保温、
 *     10⁻² Pa；本文件只建一台 6 塔的级联，塔内件的效率（HETP 0.1–0.2 m）未经实测。
 *  ③ 电解槽 440–470 °C 的 LiCl-KCl：氯气腐蚀与锂的浮升分离，效率 70–85 %；
 *     阳极石墨消耗 0.2–0.5 kg/kg Li。
 *  ④ ⁶Li 的产品形态是 Li₂CO₃；配标液要再用 HCl 转 LiCl（本文件在路线第④步里，
 *     没有单独建 LiCl 条目）。
 *  ⑤ 富集度 91–94 % 够了，但**同位素稀释**（样品里的天然 Li 7.5 % ⁶Li）会改变
 *     ⁶Li/⁷Li 比：内标法只用量，不受影响；要做 ⁶Li 示踪才需 99 % 以上。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { LI6_ITEMS, LI6_ROUTES } from '../../data/material/lithium-6.ts';
 *   items: [...LI6_ITEMS] · routes: [...LI6_ROUTES]
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const LI6_ITEMS: readonly Item[] = [
  /**
   * **碳酸锂（卤水来）：Li₂CO₃ 99.2–99.5 %、⁶Li 7.45–7.55 %（天然丰度）、硼 0.1–0.4 ppb。**
   *
   *   li2co3 99.2–99.5 % · li6 7.45–7.55 % · boron 0.1–0.4 ppb · water 0.05–0.15 %
   */
  {
    id: 'mat/lithium-carbonate',
    name: '碳酸锂',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'li2co3', kind: 'range', min: 99, max: 99.5, unit: '%', dir: 'atLeast' },
      { param: 'li6', kind: 'range', min: 7.4, max: 7.6, unit: '%' },
      { param: 'boron', kind: 'range', min: 0, max: 0.5, unit: 'ppb', dir: 'atMost' },
      { param: 'water', kind: 'range', min: 0, max: 0.2, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * **熔盐电解槽内衬与电极：5–20 L、100–500 A 的石墨阳极 + 钢阴极。**
   *
   *   volume 5–20 L · current 100–500 A · temperature 440–470 °C · insulation 50–100 mm
   */
  {
    id: 'plant/li-electrolysis-cell/vessel',
    name: '熔盐电解槽内衬与电极',
    unit: '件',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 5, max: 20, unit: 'L' },
      { param: 'current', kind: 'range', min: 100, max: 500, unit: 'A' },
      { param: 'temperature', kind: 'range', min: 440, max: 470, unit: '°C' },
      { param: 'insulation', kind: 'range', min: 50, max: 100, unit: 'mm' },
    ],
  },

  /**
   * **锂熔盐电解槽。holds 440–470 °C、1 atm。**
   *
   *   current 100–500 A · voltage 3–5 V · efficiency 70–85 %
   *
   * LiCl-KCl 共晶（LiCl 45 %）熔点 353 °C，电解 440–470 °C、阴极析锂（浮在熔盐上）。
   */
  {
    id: 'plant/li-electrolysis-cell',
    name: '锂熔盐电解槽',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 440, max: 470 },
      { param: 'pressure', min: 9e4, max: 1.1e5 },
    ],
    props: [
      { param: 'current', kind: 'range', min: 100, max: 500, unit: 'A' },
      { param: 'voltage', kind: 'range', min: 3, max: 5, unit: 'V' },
      { param: 'efficiency', kind: 'range', min: 70, max: 85, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * **蒸馏塔段：φ150 × 5000 mm、40–80 块理论板、316L 填料。**
   *
   *   stages 40–80 · height 4–6 m · leakRate 1e-4–5e-4 Pa·L/s
   */
  {
    id: 'plant/li-6-cascade/column',
    name: '⁶Li 蒸馏级联蒸馏塔段',
    unit: '件',
    category: 'part',
    props: [
      { param: 'stages', kind: 'range', min: 40, max: 80, unit: '块' },
      { param: 'height', kind: 'range', min: 4, max: 6, unit: 'm' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-3, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /**
   * **⁶Li 蒸馏级联：6 塔串联、200–400 级、450–650 °C、10⁻²–1 Pa。**
   *
   *   stages 200–400 · separationFactor 1.04–1.06 · throughput 0.5–2 kg/h · enrichment 90–95 %
   *
   * 单级 1.05 的分离系数在 200–400 级上把 7.5 % 拉到 92 %（§一）。
   */
  {
    id: 'plant/li-6-cascade',
    name: '⁶Li 蒸馏级联',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 450, max: 650 },
      { param: 'pressure', min: 1e-2, max: 1 },
    ],
    props: [
      { param: 'stages', kind: 'range', min: 200, max: 400, unit: '块', dir: 'atLeast' },
      { param: 'separationFactor', kind: 'range', min: 1.04, max: 1.06, unit: '1' },
      { param: 'throughput', kind: 'range', min: 0.5, max: 2, unit: 'kg/h', dir: 'atLeast' },
      { param: 'enrichment', kind: 'range', min: 90, max: 95, unit: '%' },
    ],
  },

  /**
   * **⁶Li 富集标样（碳酸锂形态，91–94 % ⁶Li）。**
   *
   *   li6 91–94 % · boron 0.01–0.04 ppb · water 0.03–0.08 %
   *
   * 用法：0.1 g 溶成 1 L（Li 10–50 ppb 的 ⁶Li 内标），ICP-MS 每批加同量。
   */
  {
    id: 'mat/lithium-6-enriched',
    name: '⁶Li 富集标样',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'li6', kind: 'range', min: 90, max: 95, unit: '%' },
      { param: 'boron', kind: 'range', min: 0, max: 0.05, unit: 'ppb', dir: 'atMost' },
      { param: 'water', kind: 'range', min: 0, max: 0.1, unit: '%', dir: 'atMost' },
    ],
  },
];

export const LI6_ROUTES: readonly Route[] = [
  {
    /**
     * **碳酸锂：卤水 3000 kg → 浓缩 → 除镁钙 → 沉锂 → Li₂CO₃ 0.05 kg。**
     *
     *   卤水 3000（Li 3.1 ppm ⇒ 9.3 g Li）+ 纯碱 0.1 + NaOH 0.05 + 水 5
     *   → Li₂CO₃ 0.05 kg
     */
    id: 'make/lithium-carbonate',
    name: '碳酸锂制备',
    produces: [
      {
        item: 'mat/lithium-carbonate',
        qty: q(1, 20),
        gives: [
          { param: 'li2co3', kind: 'range', min: 99.2, max: 99.5 },
          { param: 'li6', kind: 'range', min: 7.45, max: 7.55 },
          { param: 'boron', kind: 'range', min: 0.1, max: 0.4 },
          { param: 'water', kind: 'range', min: 0.05, max: 0.15 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mars/brine', qty: q(3000) }] },
      { anyOf: [{ item: 'mat/soda-ash', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 真空蒸发浓缩：卤水 3000 kg → 30 kg（Li 100 mg/kg 级），40–60 °C', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 40, max: 60 }] },
      { note_zh: '② 除镁钙：加 NaOH 到 pH 11–12，沉淀 Mg(OH)₂/CaCO₃，过滤', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 沉锂：加纯碱到 Li₂CO₃ 1.2 倍当量，85–95 °C 搅 1 h，Li₂CO₃ 析出', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 85, max: 95 }] },
      { note_zh: '④ 过滤、洗涤、120 °C 干燥、重结晶（硼从 0.1–0.4 降到 0.05–0.1 ppb）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(72) },
    unbalanced_zh: '卤水 3000（Li 3.1 ppm）+ 纯碱 0.1 + NaOH 0.05 + 水 5 → Li₂CO₃ 0.05（0.0094 kg Li，收率 92 %）；余 3005 是蒸发水、母液与钙镁渣；纯碱过量 20 %',
  },

  {
    /**
     * **电解槽内衬：316L 壳 + 石墨阳极 + 钢阴极 + 氧化铝绝缘。**
     *
     *   45 钢 50 + 石墨 20 + 氧化铝 4 + 316L 10 → 内衬 1 套
     */
    id: 'make/li-electrolysis-cell-vessel',
    name: '熔盐电解槽内衬与电极制造',
    produces: [
      {
        item: 'plant/li-electrolysis-cell/vessel',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 8, max: 15 },
          { param: 'current', kind: 'range', min: 150, max: 400 },
          { param: 'temperature', kind: 'range', min: 445, max: 465 },
          { param: 'insulation', kind: 'range', min: 60, max: 90 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(50) }] },
      { anyOf: [{ item: 'std/carbon-electrode-300', qty: q(4) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(10) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(40) },
    unbalanced_zh: '45 钢 50 + 石墨 20 + 氧化铝 4 + 316L 10 → 内衬 1 套；余是切屑与保温层（按件计）',
  },

  {
    /**
     * **电解槽装配：内衬 + 电极 + 保温 + 控温。**
     */
    id: 'make/li-electrolysis-cell',
    name: '电解槽装配',
    produces: [
      {
        item: 'plant/li-electrolysis-cell',
        qty: q(1),
        gives: [
          { param: 'current', kind: 'range', min: 150, max: 400 },
          { param: 'voltage', kind: 'range', min: 3.2, max: 4.5 },
          { param: 'efficiency', kind: 'range', min: 72, max: 82 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/li-electrolysis-cell/vessel', qty: q(1) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/temp-controller-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 装石墨阳极与钢阴极（极距 30–50 mm），砌氧化铝绝缘', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 装保温与两支热电偶、控温回路（440–470 °C）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 空载升温到 450 °C、测槽电压 3.2–4.5 V', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(30) },
    unbalanced_zh: '内衬 1 + 热电偶 2 + 控温器 1 + 接触器 1 → 电解槽 1 台（按件计）',
  },

  {
    /**
     * **蒸馏塔段：316L 填料塔 5 m、40–80 块理论板。**
     */
    id: 'make/li-6-cascade-column',
    name: '⁶Li 蒸馏级联蒸馏塔段制造',
    produces: [
      {
        item: 'plant/li-6-cascade/column',
        qty: q(1),
        gives: [
          { param: 'stages', kind: 'range', min: 50, max: 70 },
          { param: 'height', kind: 'range', min: 4.5, max: 5.5 },
          { param: 'leakRate', kind: 'range', min: 1e-4, max: 5e-4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(40) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(6) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(60) },
    unbalanced_zh: '316L 40 + 氧化铝 6 + 铜 5 → 塔段 1 件；按件计',
  },

  {
    /**
     * **级联装配：6 座塔串联 + 保温 + 检漏 + 标定。**
     *
     *   塔段 6 + 45 钢 30 + 氧化铝 8 + 热电偶 6 + 接触器 2 → 级联 1 台
     *
     * ⚠️ 检漏只写 2–5 Pa（借 `plant/evaporator` 的 0.001–10 Pa），不写 1e-2 ——
     * 会撞 `condition_cycle`（级联自己 holds 1e-2–1 Pa）。
     */
    id: 'make/li-6-cascade',
    name: '级联装配',
    produces: [
      {
        item: 'plant/li-6-cascade',
        qty: q(1),
        gives: [
          { param: 'stages', kind: 'range', min: 250, max: 350 },
          { param: 'separationFactor', kind: 'range', min: 1.045, max: 1.055 },
          { param: 'throughput', kind: 'range', min: 0.8, max: 1.5 },
          { param: 'enrichment', kind: 'range', min: 91, max: 94 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/li-6-cascade/column', qty: q(6) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(30) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(8) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(6) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room', 'plant/evaporator'],
    steps: [
      { note_zh: '① 六塔串联（塔顶冷凝器接下一塔底），总高 30–40 m', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 600 °C 保温与 6 支热电偶、10⁻² Pa 抽气口', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 检漏：抽 2–5 Pa，关阀 1 h 压升 ≤1e-3 Pa·L/s', performedBy: 'plant/robot', under: [{ param: 'pressure', min: 2, max: 5 }] },
      { note_zh: '④ 标定：天然 Li 进料、200–400 级、回流比 10–20，测分离系数 1.04–1.06', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(400) },
    unbalanced_zh: '塔段 6 + 45 钢 30 + 氧化铝 8 + 热电偶 6 + 接触器 2 → 级联 1 台（按件计）',
  },

  {
    /**
     * **⁶Li 富集：Li₂CO₃ → LiCl → 电解 → 蒸馏级联 → 转回 Li₂CO₃。**
     *
     *   Li₂CO₃ 1.2 + HCl 1.5 + KCl 0.3 + 水 2 → ⁶Li 标样 0.012 kg
     *
     * 物料：1.2 kg Li₂CO₃ = 226 g Li（⁶Li 17 g）→ 电解 0.2 kg Li → 级联 92 %
     * 产品 0.012 kg（⁶Li 11 g，回收 65 %）。
     */
    id: 'make/lithium-6-enriched',
    name: '⁶Li 富集',
    produces: [
      {
        item: 'mat/lithium-6-enriched',
        qty: q(3, 250),
        gives: [
          { param: 'li6', kind: 'range', min: 91, max: 94 },
          { param: 'boron', kind: 'range', min: 0.01, max: 0.04 },
          { param: 'water', kind: 'range', min: 0.03, max: 0.08 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/lithium-carbonate', qty: q(6, 5) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(3, 2) }] },
      { anyOf: [{ item: 'mat/potassium-chloride', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
      { anyOf: [{ item: 'mat/boron-selective-resin', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 转化：Li₂CO₃ + HCl → LiCl 溶液，蒸发到 LiCl 45 % 的 KCl 共晶', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 60, max: 80 }] },
      { note_zh: '② 电解：450 °C 熔盐电解，阴极析锂（100–400 A、3.2–4.5 V、效率 72–82 %）', performedBy: 'plant/li-electrolysis-cell', under: [{ param: 'temperature', min: 445, max: 465 }] },
      { note_zh: '③ 蒸馏：200–400 级、500–600 °C、10⁻²–1 Pa、回流 10–20，⁶Li 从 7.5 % 到 92 %', performedBy: 'plant/li-6-cascade', under: [{ param: 'temperature', min: 500, max: 600 }] },
      { note_zh: '④ 转化与标定：⁶Li 金属 → Li₂CO₃（CO₂ 碳酸化），过硼树脂除硼，ICP-MS 定 ⁶Li/⁷Li 与硼本底', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(120) },
    unbalanced_zh: 'Li₂CO₃ 1.2 + HCl 1.5 + KCl 0.3 + 水 2 → ⁶Li 标样 0.012；余 4.99 是 LiCl 母液、电解氯气（0.2 kg）、级联尾料（⁶Li 6 g）与洗水；回收 65 %',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...LI6_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...LI6_ROUTES];
