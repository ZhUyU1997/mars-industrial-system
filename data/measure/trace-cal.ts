/**
 * 四条校准/测定记录（补审计 B 类里属于痕量/化学域的四条）。
 *
 * ⚠️ **只写记录与测量路线，不动硬件**（R13：本文件在 `data/measure/`）。
 * 每条 = 1 个 `mat/*-record` + 1 条 `measure/*`，都带不确定度预算与判据。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、碘纯度（`mat/iodine-purity-record`）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   方法：硫代硫酸钠滴定（I₂ + 2S₂O₃²⁻ → 2I⁻ + S₄O₆²⁻，淀粉终点）
 *         + ICP-MS 测金属（1–10 ppm）
 *
 *   不确定度来源（合成 0.15–0.3 %；10 mL 微量滴定管把滴定管项从 0.2 % 降到 0.08 %）：
 *     称量     0.1 mg / 0.5 g           = 0.02 %
 *     滴定管   0.02 mL / 25 mL          = 0.08 %（10 mL 微量滴定管）
 *     终点     最后半滴 + 淀粉褪色       = 0.10–0.20 %
 *     标定     硫代硫酸钠对 K₂Cr₂O₇     = 0.10 %
 *     均匀性   0.5 g 取样代表整批        = 0.10–0.30 %
 *     ICP-MS   金属 1–10 ppm 的回收     = 5–10 %
 *
 *   ⚠️ 本层没有 `mat/sodium-thiosulfate` 条目（硫代硫酸钠要 Na₂S₂O₃·5H₂O 自配），
 *      滴定剂在注释里写；`mat/starch` 也没有，淀粉指示剂同样只在注释里。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、BF₃ 收率（`mat/bf3-yield-record`）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   链：萤石 → HF（CaF₂ + H₂SO₄）→ 硼酸（H₃BO₃）→ BF₃（H₃BO₃ + 3HF → BF₃ + 3H₂O）
 *   收率 = 实际 BF₃ / 理论（按硼酸投料），60–90 %；纯度 99.5–99.9 %；水 ≤0.001 %（10 ppm）
 *
 *   不确定度来源（收率 ±3–6 个点）：
 *     称量              0.1 kg / 2 kg            = 0.05 %
 *     HF 计量（改称重）  1–2 %（主项；体积计量时代是 3–8 %）
 *     干冰冷凝收集      95–98 % ⇒ 损失 2–5 %
 *     HF 滴定           0.5–1 %
 *     水（露点法）      0.5–2 ppm（对 10 ppm 是 5–20 %）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、KED 八元素检出限（`mat/ked-dl-record`）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   Cu/Zn/Ni/Al/Fe/Mg/As/Se 各 0.02–0.2 ppb（PFA 器皿 + 每批 3 空白：空白降 3× ⇒ DL 降 2.5×）
 *   与 H₂ 池路线（`make/hr-icp-ms`）对比：KED 用 He 动能歧视，Ar 基干扰（⁴⁰Ar¹⁶O⁺ 对
 *   ⁵⁶Fe、⁴⁰Ar³⁵Cl⁺ 对 ⁷⁵As）压 10–100×；代价是灵敏度掉 3–5×。
 *
 *   不确定度来源：
 *     计数统计      2–5 %（0.05 ppb 处 30 s）
 *     空白          0.005–0.01 ppb（是 0.02 ppb 的 25–50 % ⇒ 检出限主项，已用 PFA + 3 空白压过）
 *     回收          95–105 %
 *     漂移          2–3 %/h（KED 的 He 流量与透镜漂）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、²⁸Si 富集度（`mat/si28-enrichment-record`）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   HR-ICP-MS 测 ²⁸Si/²⁹Si/³⁰Si，富集度 = ²⁸Si /（²⁸+²⁹+³⁰）= 99.9–99.95 %
 *
 *   干扰账（**一处修正**）：²⁸Si¹H⁺ 28.984752 vs ²⁹Si 28.976495
 *     Δ = **0.008257 u** ⇒ 峰位分开要 R = 28.9848 / 0.008257 = **3 510**（不是 1 824）
 *     R = 10 000 的余量 = **2.8 倍**（不是 5.5 倍）
 *     ²⁹Si¹H⁺ 29.984320 vs ³⁰Si 29.973770：Δ = 0.010550 ⇒ R = **2 842**，余量 3.5 倍
 *   SiH⁺/Si⁺ ≤1e-4（膜去溶 + 干等离子体）时，R=10 000 下 ²⁸SiH 对 ²⁹Si 的拖尾 <0.01 %
 *   （²⁸Si 占 99.9 %，SiH 产率每 1e-4 就把 28.9847 处的峰抬到 ²⁹Si 的 0.2 %；
 *   尾巴再压 2 个量级才够 —— 所以 SiH 产率必须 ≤1e-4，否则 R 再高也没用）
 *
 *   不确定度来源：
 *     计数统计      0.05–0.2 %（1e6 计数）
 *     质量歧视      0.5–1 %/u（天然 Si 标准归一）
 *     SiH 拖尾      <0.01 %
 *     富集度传播    0.05–0.1 %（100 − ²⁹Si − ³⁰Si）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { TRACE_CAL_ITEMS, TRACE_CAL_ROUTES } from '../../data/measure/trace-cal.ts';
 *   items: [...TRACE_CAL_ITEMS] · routes: [...TRACE_CAL_ROUTES]
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const TRACE_CAL_ITEMS: readonly Item[] = [
  /**
   * **碘纯度记录。**
   *
   *   purity      99.5–99.9 %（滴定，合成不确定度 0.15–0.3 %）
   *   metals      1–10 ppm（ICP-MS）
   *   method      titration + icp-ms
   */
  {
    id: 'mat/iodine-purity-record',
    name: '碘纯度记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'purity', kind: 'range', min: 99.5, max: 99.9, unit: '%' },
      { param: 'metals', kind: 'range', min: 0, max: 20, unit: 'ppm', dir: 'atMost' },
      { param: 'method', kind: 'enum', values: ['titration', 'icp-ms'] },
      { param: 'uncertainty', kind: 'range', min: 0.1, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * **BF₃ 收率记录。**
   *
   *   yield        60–90 %（按硼酸的硼计）
   *   purity       99.5–99.9 %
   *   waterContent 0.0005–0.001 %（5–10 ppm）
   */
  {
    id: 'mat/bf3-yield-record',
    name: 'BF₃ 收率记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'yield', kind: 'range', min: 55, max: 95, unit: '%' },
      { param: 'purity', kind: 'range', min: 99.5, max: 99.9, unit: '%' },
      { param: 'waterContent', kind: 'range', min: 0, max: 0.005, unit: '%', dir: 'atMost' },
      // 生产 give 同名别名（BF₃ 的 water 以 % 计）。
      { param: 'water', kind: 'range', min: 0, max: 0.001, unit: '%', dir: 'atMost' },
      { param: 'method', kind: 'enum', values: ['gravimetric', 'dew-point'] },
      { param: 'uncertainty', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' }, // 收率的 ± 个百分点（主项从 HF 过量/损失 3–8 % 降到 1–2 %）
    ],
  },

  /**
   * **KED 八元素检出限记录。**
   *
   *   traceMetalDL 0.02–0.2 ppb（Cu/Zn/Ni/Al/Fe/Mg/As/Se 各；空白降 3× ⇒ DL 降 2.5×）
   *   blank        0.005–0.01 ppb（PFA 器皿 + 每批 3 空白）
   *   recovery     95–105 %
   *   resolution   10000–12000
   */
  {
    id: 'mat/ked-dl-record',
    name: 'KED 八元素检出限记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'traceMetalDL', kind: 'range', min: 0.01, max: 1, unit: 'ppb', dir: 'atMost' },
      { param: 'blank', kind: 'range', min: 0, max: 0.02, unit: 'ppb', dir: 'atMost' },
      { param: 'recovery', kind: 'range', min: 0.9, max: 1.1, unit: '1' },
      { param: 'elements', kind: 'enum', values: ['Cu', 'Zn', 'Ni', 'Al', 'Fe', 'Mg', 'As', 'Se'] },
      { param: 'resolution', kind: 'range', min: 4000, max: 12000, unit: 'M/ΔM' },
    ],
  },

  /**
   * **²⁸Si 富集度记录。**
   *
   *   enrichment 99.9–99.95 %（²⁸Si/(²⁸+²⁹+³⁰)）
   *   si28       99.9–99.95 · si29 0.04–0.08 · si30 0.01–0.05
   *   resolution 10000–12000（²⁸SiH 与 ²⁹Si 要 3510，余量 2.8×）
   *   hydrideRate ≤1e-3（SiH⁺/Si⁺；要在 1e-4 才是 <0.01 % 的偏）
   */
  {
    id: 'mat/si28-enrichment-record',
    name: '²⁸Si 富集度记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'enrichment', kind: 'range', min: 99.9, max: 99.95, unit: '%' },
      { param: 'si28', kind: 'range', min: 99, max: 99.99, unit: '%' },
      { param: 'si29', kind: 'range', min: 0.01, max: 0.1, unit: '%' },
      { param: 'si30', kind: 'range', min: 0.01, max: 0.1, unit: '%' },
      { param: 'resolution', kind: 'range', min: 4000, max: 12000, unit: 'M/ΔM' },
      { param: 'abundanceSensitivity', kind: 'range', min: 1e-7, max: 1e-6, unit: '1', dir: 'atMost' },
    ],
  },
];

export const TRACE_CAL_ROUTES: readonly Route[] = [
  {
    /**
     * **碘纯度：称样 → 硫代硫酸钠滴定 → ICP-MS 金属 → 判读。**
     *
     *   1 g 碘 + 亚沸硝酸 + Ar → 记录 1 份
     */
    id: 'measure/iodine-purity',
    name: '碘纯度测量',
    produces: [
      {
        item: 'mat/iodine-purity-record',
        qty: q(1),
        gives: [
          { param: 'purity', kind: 'range', min: 99.5, max: 99.9 },
          { param: 'metals', kind: 'range', min: 1, max: 10 },
          { param: 'method', kind: 'enum', oneOf: ['titration', 'icp-ms'] },
          { param: 'uncertainty', kind: 'range', min: 0.15, max: 0.3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iodine', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/nitric-acid-subboiled', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 1000) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      {
        note_zh: '① 称样 0.5 g（0.1 mg 天平）+ 溶解；硫代硫酸钠滴定剂当天标定（对 K₂Cr₂O₇，0.1 %）',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 40 }],
      },
      {
        note_zh: '② 滴定：淀粉终点，近终点半滴；10 mL 微量滴定管（分度 0.02 mL ⇒ 0.08 %）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '③ 金属：0.5 g 溶后 ICP-MS 测 1–10 ppm（回收 95–105 %，5–10 % 不确定度）',
        performedBy: 'plant/icp-ms',
        under: [{ param: 'pressure', min: 9e4, max: 1.1e5 }],
      },
      {
        note_zh: '④ 判读：purity 99.5–99.9 %、metals 1–10 ppm；合成不确定度 0.15–0.3 %（滴定管项 0.2 %→0.08 %），两份平行差 >0.2 % 重做',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(6) },
  },

  {
    /**
     * **BF₃ 收率：硼酸计量 → BF₃ 发生 → 干冰冷凝称量 → 水与纯度。**
     *
     *   0.1 kg 硼酸 + 0.1 kg HF + 0.1 kg 硫酸 → 记录 1 份
     */
    id: 'measure/bf3-yield',
    name: 'BF₃ 收率测量',
    produces: [
      {
        item: 'mat/bf3-yield-record',
        qty: q(1),
        gives: [
          { param: 'yield', kind: 'range', min: 60, max: 90 },
          { param: 'purity', kind: 'range', min: 99.5, max: 99.9 },
          { param: 'waterContent', kind: 'range', min: 0.0005, max: 0.001 },
          { param: 'water', kind: 'range', min: 0, max: 0.001 },
          { param: 'method', kind: 'enum', oneOf: ['gravimetric', 'dew-point'] },
          { param: 'uncertainty', kind: 'range', min: 1, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/boric-acid', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(1, 100) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      {
        note_zh: '① 计量与反应：0.1 kg 硼酸 + HF **称重法**（分度 0.01 g，取代体积计量）过量 5–10 %，80 °C、100–200 Pa 下反应（H₃BO₃ + 3HF → BF₃ + 3H₂O）',
        performedBy: 'plant/boron-leach-tank',
        under: [{ param: 'temperature', min: 80, max: 100 }],
      },
      {
        note_zh: '② BF₃ 发生与冷凝：干冰 −78 °C 收集（BF₃ bp −100 °C、mp −127 °C），收集效率 95–98 %',
        performedBy: 'plant/dry-ice-trap',
        under: [{ param: 'temperature', min: -85, max: -70 }],
      },
      {
        note_zh: '③ 称量收率：BF₃ 净重 / 理论（按硼酸的硼）⇒ 60–90 %；HF 改称重后主项从 3–8 % 降到 1–2 %，收率不确定度 ±1–2 点',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '④ 水与纯度：露点法测 5–10 ppm（0.0005–0.001 %，露点仪 0.5–2 ppm 分辨）；纯度 99.5–99.9 %',
        performedBy: 'plant/dew-point-meter',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(8) },
  },

  {
    /**
     * **KED 八元素检出限：混标 → KED 进样 → 分析腔 → 与 H₂ 池对比。**
     *
     *   8 支单元素标液 + 亚沸硝酸 + Ar → 记录 1 份
     */
    id: 'measure/ked-dl',
    name: 'KED 八元素检出限测量',
    produces: [
      {
        item: 'mat/ked-dl-record',
        qty: q(1),
        gives: [
          { param: 'traceMetalDL', kind: 'range', min: 0.02, max: 0.2 },
          { param: 'blank', kind: 'range', min: 0.005, max: 0.01 },
          { param: 'recovery', kind: 'range', min: 0.95, max: 1.05 },
          { param: 'elements', kind: 'enum', oneOf: ['Cu', 'Zn', 'Ni', 'Al', 'Fe', 'Mg', 'As', 'Se'] },
          { param: 'resolution', kind: 'range', min: 10000, max: 12000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/icp-single-element-standard', qty: q(8, 1000) }] },
      { anyOf: [{ item: 'mat/nitric-acid-subboiled', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(7, 10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/mfc'],
    steps: [
      {
        note_zh: '① 配混标：Cu/Zn/Ni/Al/Fe/Mg/As/Se 各 0/0.05/0.1/0.5 ppb（2 % 亚沸硝酸基体）+ 3 个空白；全部在 plant/boron-free-lab 用 PFA 器皿配（空白降 3× ⇒ DL 降 2.5×）',
        performedBy: 'plant/boron-free-lab',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '② KED 进样：He 4–5 mL/min、动能歧视偏压 −20…−10 V；⁴⁰Ar¹⁶O⁺/⁴⁰Ar³⁵Cl⁺ 压 10–100×',
        performedBy: 'plant/hr-icp-ms',
        under: [{ param: 'pressure', min: 9e4, max: 1.1e5 }],
      },
      {
        note_zh: '③ 分析腔：R=10 000、8 个质量数各 30 s；空白 0.005–0.01 ppb 是 0.02 ppb 的 25–50 %',
        performedBy: 'plant/hr-icp-ms',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh: '④ 与 H₂ 池路线对比：同批样走 `collisionGas=H2` 再测一遍；KED 的 DL 0.02–0.2 ppb、回收 95–105 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(6) },
  },

  {
    /**
     * **²⁸Si 富集度：溶样 → 进样 → R=10000 三同位素 → 比值与判读。**
     *
     *   0.1 g ²⁸Si + HF/HNO₃ + Ar → 记录 1 份
     */
    id: 'measure/si28-enrichment',
    name: '²⁸Si 富集度测量',
    produces: [
      {
        item: 'mat/si28-enrichment-record',
        qty: q(1),
        gives: [
          { param: 'enrichment', kind: 'range', min: 99.9, max: 99.95 },
          { param: 'si28', kind: 'range', min: 99.9, max: 99.95 },
          { param: 'si29', kind: 'range', min: 0.04, max: 0.08 },
          { param: 'si30', kind: 'range', min: 0.01, max: 0.05 },
          { param: 'resolution', kind: 'range', min: 10000, max: 12000 },
          { param: 'abundanceSensitivity', kind: 'range', min: 1e-7, max: 2e-7 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-28-enriched', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/nitric-acid-subboiled', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 1000) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/mfc', 'std/si-isotope-working-standard'],
    steps: [
      {
        note_zh: '① 溶样：0.1 g ²⁸Si 粉 + HF/HNO₃ 溶解，赶酸，2 % 亚沸硝酸定容（Si 10–50 ppb）',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 40 }],
      },
      {
        note_zh: '② 进样：Ar 15 L/min、1.2–1.6 kW；膜去溶（H₂O <0.2 %）把 SiH⁺/Si⁺ 压到 ≤1e-4',
        performedBy: 'plant/hr-icp-ms',
        under: [{ param: 'pressure', min: 9e4, max: 1.1e5 }],
      },
      {
        note_zh: '③ 分析腔：R=10 000（²⁸SiH 与 ²⁹Si 要 3 510，余量 2.8×），测 28/29/30 各 30 s',
        performedBy: 'plant/hr-icp-ms',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh: '④ 比值与判读：天然 Si 标准归一质量歧视（0.5–1 %/u）；富集度 = 28/(28+29+30) = 99.9–99.95 %；两平行差 >0.05 % 重测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(7) },
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...TRACE_CAL_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...TRACE_CAL_ROUTES];
