/**
 * 溴与溴化氢：从卤水到无水 HBr。
 *
 * **背景**：`plant/st-i-etcher` 装了 HBr 线（`plant/st-i-etcher/hbr-line`），
 * 但基线路线 `make/car-sti-trench-hbr` 只吃 Cl₂/O₂；没有 HBr 料时侧壁停在
 * 86–89°、Si:SiO₂ 3–5:1。本文件把 `mat/bromine` 与 `mat/hbr` 建出来，
 * 第二条刻蚀路线 `make/car-sti-trench-hbr-gas` 才有料可烧。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、料从哪来：卤水提溴
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `mars/brine` 的 Br 按 **65 ppm**（设计值，地球海水同级 65–70 ppm）：
 *   1 kg Br₂ 要 1 kg 溴原子 ⇒ 65 ppm 下 **15.4 t 卤水**，按 85 % 收率 **18.1 t**。
 *
 *   ① 酸化到 pH 3–4（抑制 Br₂ 歧化）
 *   ② Cl₂ 氧化：Br⁻ + ½Cl₂ → ½Br₂ + Cl⁻，Cl₂ 1.1 倍当量（0.57 kg/kg Br₂）
 *   ③ 空气吹出：80 °C 空气把 Br₂ 带出（Br₂ 蒸气压在 80 °C 有 0.3 atm）
 *   ④ 冷凝与蒸馏：Br₂ bp **58.8 °C**，40–60 °C 蒸馏，冷凝水 20–30 °C
 *   ⑤ 98 % H₂SO₄ 干燥：Br₂ 里的水从 200–500 ppm 降到 20–40 ppm
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、HBr 合成：H₂ + Br₂ 催化
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   H₂ + Br₂ → 2 HBr（Pt/Al₂O₃，350–450 °C，H₂ 过量 5–10 %）
 *
 *   每 kg HBr 的账（HBr 80.91 g/mol ⇒ 12.36 mol）：
 *     Br₂ = 6.18 mol = **0.99 kg**（按 95 % 收率 **1.04 kg**）
 *     H₂  = 6.18 mol = **12.5 g**（0.0125 kg；过量 5–10 % ⇒ 0.013 kg）
 *     Pt/Al₂O₃ 催化剂 0.5 g Pt + 10 g 载体，寿命 2–5 年
 *   冷凝：HBr bp **−66.8 °C** ⇒ 干冰冷阱（−78 °C）就够，不必液氮
 *   干燥：98 % H₂SO₄ 洗 + 3A 分子筛，水从 1 % 降到 3–10 ppm
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、腐蚀：为什么必须 ≤10 ppm 水
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   干 HBr（<10 ppm H₂O）、<50 °C：316L 腐蚀 **0.01–0.05 mm/y**（可用）；石英
 *     几乎不蚀（SiO₂ + HBr 无挥发性产物，除非有 HF）
 *   湿 HBr（1 % H₂O）：316L **0.5–2 mm/y** 且点蚀，Fe/Cr/Ni 离子污染晶圆；
 *     石英在 200 °C 以上 + 水汽会慢蚀 0.1–0.3 nm/min
 *   ⇒ 输送与刻蚀必须 **PFA/PTFE 内衬**（`mat/pfa`/`mat/ptfe`），只有干气段才允许 316L。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、为什么 HBr 能到 88–89°、Cl₂/O₂ 只能 85°
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   Cl₂/O₂：O₂ 在侧壁生成 **SiO_xCl_y** 钝化层，但它同时氧化 Si 表面、吃掉 CAR 胶，
 *     侧壁横向刻蚀靠 O₂ 比例平衡，85–86° 就到头；Si:SiO₂ 只有 **3–5:1**（O₂ 让
 *     SiO₂ 也慢慢被还原/溅射）。
 *   HBr：Br 的黏附系数 **0.01–0.05**（Cl 是 0.3–0.5）⇒ 只有离子轰击处才有 Br，
 *     侧壁几乎不吸附；侧壁钝化是 **SiBr_x（x=2–3）**，不含碳、不含氧，厚 1–2 nm，
 *     横向刻蚀 <2 nm ⇒ **88–89°**；SiO₂ 与 HBr 无挥发性产物（要靠离子溅射）⇒
 *     Si:SiO₂ **25–50:1**。代价是 HBr 流量大（30 sccm）与腐蚀性。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、缺口（带数）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① Br 按 65 ppm（设计值）：卤水实际 Br 20–100 ppm 时，18 t 的产量在 0.3–1.5 kg 间浮动。
 *  ② Br₂ 的 Cl₂ 过量 10 %：过量氯进 Br₂ 产品 0.01–0.05 %，要求 99.9 % 的 Br₂ 还要再蒸一次。
 *  ③ HBr 的 3A 分子筛会吸附 1–3 % 的 HBr，再生要 200–250 °C 氮气吹。
 *  ④ 刻蚀腔在 180–250 °C 下用干 HBr：316L 0.05–0.2 mm/y、石英窗 0.1–0.3 nm/min；
 *     湿气一进，316L 的腐蚀率 ×10–40 且带金属污染。
 *  ⑤ 本文件只给到钢瓶级无水 HBr；现场供气（bulk）要再加汽化器与 PFA 管路，未建。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { HBR_ITEMS, HBR_ROUTES } from '../../data/material/hbr.ts';
 *   items: [...HBR_ITEMS] · routes: [...HBR_ROUTES]
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const HBR_ITEMS: readonly Item[] = [
  /**
   * **溴（工业级 Br₂）：99.6–99.9 %、水 20–40 ppm、氯 0.01–0.05 %。**
   *
   *   purity 99.6–99.9 % · water 20–40 ppm · chlorine 0.01–0.05 % · bp 58.75–58.85 °C
   */
  {
    id: 'mat/bromine',
    name: '溴',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99.5, max: 99.9, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 0, max: 50, unit: 'ppm', dir: 'atMost' },
      { param: 'chlorine', kind: 'range', min: 0, max: 0.1, unit: '%', dir: 'atMost' },
      { param: 'boilingPoint', kind: 'range', min: 58.7, max: 58.9, unit: '°C' },
    ],
  },

  /**
   * **无水溴化氢：99.9–99.99 %、水 ≤10 ppm。**
   *
   *   purity 99.9–99.99 % · water 3–10 ppm · bp −66.8 °C
   *
   * ⚠️ 水 >10 ppm 就只能走 PFA/PTFE 管路；316L 只许用在干气段。
   */
  {
    id: 'mat/hbr',
    name: '无水溴化氢',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 0, max: 10, unit: 'ppm', dir: 'atMost' },
      { param: 'boilingPoint', kind: 'range', min: -66.9, max: -66.7, unit: '°C' },
    ],
  },
];

export const HBR_ROUTES: readonly Route[] = [
  {
    /**
     * **提溴：卤水酸化 → 氯氧化 → 空气吹出 → 蒸馏 → 硫酸干燥。**
     *
     *   卤水 18 t（Br 65 ppm）+ 氯 0.57 + 硫酸 5 + 水 20 → Br₂ 1 kg（85 % 收率）
     */
    id: 'make/bromine',
    name: '提溴制备',
    produces: [
      {
        item: 'mat/bromine',
        qty: q(1),
        gives: [
          { param: 'purity', kind: 'range', min: 99.6, max: 99.9 },
          { param: 'water', kind: 'range', min: 20, max: 40 },
          { param: 'chlorine', kind: 'range', min: 0.01, max: 0.05 },
          { param: 'boilingPoint', kind: 'range', min: 58.75, max: 58.85 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mars/brine', qty: q(18000) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(57, 100) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 酸化：硫酸调 pH 3–4（抑制 Br₂ 歧化成 BrO⁻/BrO₃⁻），20–40 °C', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 40 }] },
      { note_zh: '② 氯氧化：Cl₂ 1.1 倍当量通入，Br⁻ 变 Br₂（淡黄→橙红），20–40 °C', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 40 }] },
      { note_zh: '③ 空气吹出：80 °C 热空气逆流吹脱 Br₂（Br₂ 蒸气压 0.3 atm），带出 95 %', performedBy: 'plant/distillation-tower', under: [{ param: 'temperature', min: 60, max: 80 }] },
      { note_zh: '④ 冷凝与蒸馏：冷凝水 20–30 °C，Br₂ 收集后 40–60 °C 蒸馏（bp 58.8 °C），弃头尾 5 %', performedBy: 'plant/distillation-tower', under: [{ param: 'temperature', min: 40, max: 60 }] },
      { note_zh: '⑤ 干燥：98 % H₂SO₄ 洗，水 200–500 ppm → 20–40 ppm；装 PTFE 瓶', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '卤水 18000（Br 65 ppm ⇒ 1.17 kg Br）+ 氯 0.57 + 硫酸 5 + 水 20 → Br₂ 1.0（收率 85 %，提溴后 Br⁻ 6–10 ppm）；余 18024.6 = 提溴后卤水 + 洗水 + 过量氯 0.05；Cl₂ 按 1.1 当量、实际耗 0.52',
  },

  {
    /**
     * **HBr 合成：Br₂ + H₂（Pt/Al₂O₃，350–450 °C）→ 冷凝 → 干燥 → 蒸馏。**
     *
     *   Br₂ 1.04 + H₂ 0.013 + Pt 0.0005 + 硫酸 0.5 → HBr 1 kg（95 % 收率）
     */
    id: 'make/hbr',
    name: 'HBr 合成',
    produces: [
      {
        item: 'mat/hbr',
        qty: q(1),
        gives: [
          { param: 'purity', kind: 'range', min: 99.9, max: 99.97 },
          { param: 'water', kind: 'range', min: 3, max: 10 },
          { param: 'boilingPoint', kind: 'range', min: -66.85, max: -66.75 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/bromine', qty: q(26, 25) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(13, 1000) }] },
      { anyOf: [{ item: 'mat/platinum', qty: q(1, 2000) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room', 'plant/dew-point-meter'],
    steps: [
      { note_zh: '① 催化合成：Pt/Al₂O₃（0.5 g Pt/10 g 载体）350–450 °C，H₂ 过量 5–10 %，Br₂ 汽化后混合，转化 95 %', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 350, max: 450 }] },
      { note_zh: '② 冷凝：−78 °C 干冰冷阱收 HBr（bp −66.8 °C），未反应 Br₂ 冻结在阱前段', performedBy: 'plant/dry-ice-trap', under: [{ param: 'temperature', min: -85, max: -70 }] },
      { note_zh: '③ 干燥：98 % H₂SO₄ 洗 + 3A 分子筛，水 1 % → 3–10 ppm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 蒸馏与检测：−70 °C 蒸馏去轻组分；`plant/dew-point-meter` 测水 ≤10 ppm 才装瓶（PFA 瓶）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(18) },
    unbalanced_zh: 'Br₂ 1.04 + H₂ 0.013 + Pt 0.0005 + 氧化铝 0.01 + 硫酸 0.5 + 水 0.01 → HBr 1.0（95 % 收率）；余 0.57 = 过量 H₂（0.003）+ 未反应 Br₂（0.05）+ 干燥酸与洗水',
  },

  {
    /**
     * **HBr/Cl₂ 刻蚀（HBr 线可用之后的第二条路线）。**
     *
     *   与 `make/car-sti-trench-hbr`（Cl₂/O₂）比：HBr 30 sccm + Cl₂ 20 sccm，
     *   180–250 °C、1.3–2.7 Pa、400–600 W；侧壁 **88–89°**（原路线 86–89）、
     *   Si:SiO₂ **25–50:1**（原路线 3–5:1）。
     *
     * 为什么 HBr 能到 88–89°：Br 的黏附系数 0.01–0.05（Cl 0.3–0.5）⇒ 只有离子轰击处
     * 有 Br；侧壁钝化是 **SiBr_x（x=2–3）**，不含碳/氧、厚 1–2 nm，横向刻蚀 <2 nm；
     * SiO₂ 与 HBr 无挥发性产物 ⇒ 选择性 25–50。详见本文件 §四。
     *
     * 料账：HBr 30 sccm × 90 s = 2.7 L = **9.7 g**；Cl₂ 20 sccm × 90 s = 1.8 L = **5.7 g**。
     *
     * 流量：HBr 30 sccm 由 `plant/mfc` 的 0–200 sccm 通道给；干 HBr（水 ≤10 ppm）
     * 下按 316L 使用，湿气会腐蚀 MFC 与管路。`plant/mfc` 的 accuracy ≤3 %；
     * 30 sccm 的实际窗口取 29.1–30.9 sccm，湿件兼容仍是残余缺口。
     *
     * ⚠️ 这条路线放在本文件（而不是 st-i-etcher.ts）是刻意的：它与在 `mat/hbr` 的
     * 注册同生同灭 —— 分开放会在注册前留一条 unknown_item。
     */
    id: 'make/car-sti-trench-hbr-gas',
    name: 'HBr/Cl₂ 刻蚀',
    produces: [
      {
        item: 'mat/car-stripped-wafer',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 100, max: 200 },
          { param: 'etchDepth', kind: 'range', min: 250, max: 300 },
          { param: 'sidewallAngle', kind: 'range', min: 88, max: 89 },
          { param: 'residue', kind: 'range', min: 0, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/car-patterned-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hbr', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/water-polisher', 'plant/mfc'],
    steps: [
      {
        note_zh: '① HBr/Cl₂ 刻蚀：`plant/st-i-etcher` 180–250 °C、1.3–2.7 Pa、400–600 W、HBr 30 sccm + Cl₂ 20 sccm、60–120 s；侧壁 88–89°、depth 250–300 nm、Si:SiO₂ 25–50:1；HBr 的 SiBr_x 钝化把横向刻蚀压到 <2 nm',
        performedBy: 'plant/st-i-etcher',
        under: [
          { param: 'temperature', min: 180, max: 250 },
          { param: 'pressure', min: 1.3, max: 2.7 },
          { param: 'hbrFlow', min: 29.1, max: 30.9 },
        ],
      },
      {
        note_zh: '② 原位 O₂ 灰化：200 W、120 s；HBr 路线的碳质残渣本来就 <0.5 nm，这一步是保险',
        performedBy: 'plant/st-i-etcher',
        under: [{ param: 'temperature', min: 180, max: 250 }, { param: 'pressure', min: 1, max: 5 }],
      },
      {
        note_zh: '③ HF 1–2 s + 水冲 + 甩干：只去 1–2 nm 原生氧化层，HF 对 Si 是停止层',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '④ CD-SEM 筛：读 100–200 nm 槽宽与槽底闭合；88–89° 的角度由 X-SEM 记录',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
    ],
    rate: { hours: q(3) },
    unbalanced_zh:
      '图形片 1 + HBr 10 g + Cl₂ 5 g + O₂ 2 g + HF 0.1 g + 水 100 g → 刻蚀片 1。硅刻掉 4.6–5.5 mg；HBr/Cl₂ 大部分进尾气（碱洗塔），HF 随水走；按片计',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...HBR_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...HBR_ROUTES];
