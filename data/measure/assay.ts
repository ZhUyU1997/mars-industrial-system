/**
 * 铂纯度 99.9–99.99% 的化验路线 —— 火试金 + ICP-MS 互证（R13：measure/* 与记录只放这里）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么是火试金
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   1 g 海绵 Pt 与 10 g Pb、5 g 硼砂、5 g 纯碱、2 g 石英混合，950–1000 °C
 *   熔融：Pb 捕集 Pt 族金属形成**铅扣**，硅酸盐渣浮在上面。
 *
 *   铅扣在**氧化镁灰皿**（`mat/magnesia`，2 g）上 950–1000 °C 灰吹：
 *   Pb → PbO 被灰皿吸收，Pt 不氧化，留下**金属珠**。称量珠重 / 样品重
 *   得 Pt 总量；杂质由 ICP-MS 消解（王水）另测，两者之差给纯度。
 *
 *   **火试金的 Pt 损失**：灰吹 0.1–0.5 %（细珠、PbO 黏度、温度过高都
 *   加大损失）。所以 0.02–0.05 % 不是"称一下就有"的准确度：
 *   · 它是**损失修正后**的重复性（双份 + 已知 Pt 尖标）；
 *   · 未修正的系统项就是 0.1–0.5 %，**比 0.05 % 大 2–10 倍**。
 *   本记录把这两项分开写：`uncertainty 0.02–0.05` 是修正后重复性，
 *   灰吹损失 0.1–0.5 % 是系统项，必须由 ICP-MS 的杂质和来交叉验证。
 *
 *   ICP-MS 路线：王水消解（HCl + HNO₃），测 Pd/Rh/Ir/Au/Cu/Fe 等杂质，
 *   `plant/icp-ms` 的 detectionLimit 0.01–20 ppb；Pt 基体 1 g/L 稀释
 *   1000× 后，100–1000 ppm 的杂质仍在 0.1–1 ppm 档，够算 99.9–99.99 %。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 2026-10-20：灰吹损失从"注释里的 0.1–0.5 %"变成一条记录
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   旧记录 `mat/pt-assay-record` **保留不动**：它是"双份 + 尖标修正后的重复性
 *   0.02–0.05 %"，不是可追溯准确度，灰吹损失 0.1–0.5 % 是当时未量化的系统项。
 *
 *   新增两条：
 *     `measure/pt-cupellation-loss` → `mat/pt-cupellation-loss-record`
 *       已知量纯 Pt 尖标 **10 / 100 / 1000 µg** × 双份 + 空白；测灰吹前后
 *       质量差；给 recovery **99.5–99.9 %**、repeatability **0.1–0.3 %**、
 *       2 g MgO 灰皿吸留 **1000–5000 µg Pt**、空白 **1–5 µg**。
 *     `measure/pt-assay-corrected` → `mat/pt-assay-corrected-record`
 *       把 recovery 修进旧记录；purity **99.9–99.99 %**、
 *       uncertainty **0.01–0.03 %**，可追溯到尖标。
 *
 *   **损失是挥发还是吸留？** 都不是"大量挥发"：
 *     Pt 蒸气压按 ΔHvap ≈ 510 kJ/mol、沸点 4098 K 估：
 *       950 °C（1223 K） ~5×10⁻¹¹ Pa
 *       1000 °C（1273 K）~3×10⁻¹⁰ Pa
 *     Hertz-Knudsen 通量 J = P/√(2πMRT)，1000 °C 约 1 ng/(cm²·h)；
 *     1 g 样、1 cm²、1 h 的挥发 <0.00001 % —— 比 0.1–0.5 % 小 4–5 个数量级。
 *     **真正的损失是 PbO 熔体把 Pt 细珠带进 MgO 灰皿的孔里（吸留/机械夹带）。**
 *
 *   **铅扣 10:1 是什么？** 10 g Pb / 1 g Pt 是**配料比**，不是分配比；
 *     Pt 在 Pb 熔体与硅酸盐渣之间的分配系数 D ≈ 10³–10⁴（Pt 亲铅），
 *     铅扣收 Pt >99.9 %。损失发生在灰吹，不在熔融。
 *
 *   **2 g MgO 灰皿吸多少？** 吸 5–6 g PbO 后饱和；1 g 样品的 Pt 吸留
 *     1000–5000 µg（1–5 mg，即 0.1–0.5 %），批次差 **50–150 µg**。
 *     0.01 % 的 1 g 样 = **100 µg**，正好落在批次差里 ⇒ 0.01 % 是下限。
 *     微天平 0.2 µg / 1 g = 0.00002 %，比 0.01 % 小 500 倍，**不是瓶颈**。
 *
 *   10 µg 尖标的空白 1–5 µg 占 10–50 %，所以 10 µg 点只作空白/线性，
 *   不作认证回收率；100 与 1000 µg 点给 99.5–99.9 % 的回收率。
 *
 *   ICP-MS 路线：王水消解（HCl + HNO₃），测 Pd/Rh/Ir/Au/Cu/Fe 等杂质，
 *   `plant/icp-ms` 的 detectionLimit 0.01–20 ppb；Pt 基体 1 g/L 稀释
 *   1000× 后，100–1000 ppm 的杂质仍在 0.1–1 ppm 档，够算 99.9–99.99 %。
 *
 * ⚠️ 本层没有独立的 Pt 纯度标准物质；`mat/platinum` 的 purity 99–100
 *    是设计窗口，不是证书。所以这条记录是**自校**，不是 CNAS。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ASSAY_ITEMS: readonly Item[] = [
  /**
   * 铂纯度化验记录。**一份记录对应一批/一个样品。**
   *
   *   purity       99.9–99.99 %   Pt 质量分数；火试金珠重 / 样品重（损失修正后）
   *   uncertainty  0.02–0.05 %    修正后重复性；灰吹损失 0.1–0.5 % 另记在注释
   *   method       fire-assay / icp-ms  主方法 + 交叉验证
   *
   * ⚠️ 0.02–0.05 % 是**双份 + 尖标修正后**的重复性，不是单次称量的
   *    绝对准确度；灰吹损失的 0.1–0.5 % 是这条记录最大的系统项。
   */
  {
    id: 'mat/pt-assay-record',
    name: 'Platinum Purity Assay Record', name_zh: '铂纯度化验记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'purity', kind: 'range', min: 99.9, max: 99.99, unit: '%' },
      { param: 'uncertainty', kind: 'range', min: 0.02, max: 0.05, unit: '%', dir: 'atMost' },
      { param: 'method', kind: 'enum', values: ['fire-assay', 'icp-ms'] },
    ],
  },
  /**
   * 灰吹损失记录。**一份记录对应一批 7 只灰皿（空白 + 3 水平 × 双份）。**
   *
   *   recovery       99.5–99.9 %   灰吹回收率（1000 µg 尖标；1 g 样同比例）
   *   repeatabilityRange 0.1–0.3 %  双份差（1000 µg 水平；百分数，不是微天平 µg）
   *   absorption     1000–5000 µg  2 g MgO 灰皿吸留的 Pt（1 g 样，1–5 mg）
   *   blank          1–5 µg        空白灰皿的 Pt（10 µg 尖标下占 10–50 %）
   *
   * ⚠️ 旧 `mat/pt-assay-record` 不动；这份记录只量化"灰吹损失"这一项，
   *    不替代旧记录。吸收是**吸留/机械夹带**，不是 Pt 挥发（见文件头）。
   */
  {
    id: 'mat/pt-cupellation-loss-record',
    name: 'Cupellation Loss Record', name_zh: '灰吹损失记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'recovery', kind: 'range', min: 99.5, max: 99.9, unit: '%' },
      { param: 'repeatabilityRange', kind: 'range', min: 0.1, max: 0.3, unit: '%' },
      { param: 'absorption', kind: 'range', min: 1000, max: 5000, unit: 'µg/2g' },
      { param: 'blank', kind: 'range', min: 1, max: 5, unit: 'µg' },
    ],
  },
  /**
   * Pt 纯度修正记录。**旧记录的 purity 按灰吹回收率修正后的版本。**
   *
   *   purity        99.9–99.99 %  旧 purity / recovery
   *   uncertainty   0.01–0.03 %   修正后不确定度（atMost）
   *   method        fire-assay-corrected / icp-ms
   *   traceability  spike           可追溯到 10/100/1000 µg 尖标
   *
   * ⚠️ 0.01 % 是下限：1 g 样上灰皿吸留的批次差 50–150 µg = 0.005–0.015 %；
   *    微天平 0.2 µg/1 g = 0.00002 % 不是瓶颈。旧记录保留为历史（未修正）。
   */
  {
    id: 'mat/pt-assay-corrected-record',
    name: 'Pt Purity Correction Record', name_zh: 'Pt 纯度修正记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'purity', kind: 'range', min: 99.9, max: 99.99, unit: '%' },
      { param: 'uncertainty', kind: 'range', min: 0.01, max: 0.03, unit: '%', dir: 'atMost' },
      { param: 'method', kind: 'enum', values: ['fire-assay-corrected', 'icp-ms'] },
      { param: 'traceability', kind: 'enum', values: ['spike'] },
    ],
  },
];

export const ASSAY_ROUTES: readonly Route[] = [
  {
    /**
     * **Pt 纯度：火试金铅扣 → 灰吹 → 称量，ICP-MS 杂质交叉验证。**
     *
     *   海绵 Pt 1 g + 铅 10 g + 硼砂 5 g + 纯碱 5 g + 石英 2 g
     *   + 氧化镁 2 g（灰皿）+ 王水 0.07 kg → 纯度记录 1 份
     *
     * 六段：
     *   ① 混料装坩埚
     *   ② 950–1000 °C 熔融 30 min，铅扣沉底
     *   ③ 铅扣在氧化镁灰皿上 950–1000 °C 灰吹 45–60 min，PbO 被灰皿吸收
     *   ④ 微天平称 Pt 珠（readability 0.05–0.1 µg）
     *   ⑤ ICP-MS 王水消解测杂质（Pd/Rh/Ir/Au/Cu/Fe），与 100 % 差减
     *   ⑥ 双份 + 尖标修正灰吹损失，算 purity 与 uncertainty
     *
     * 灰吹条件：950–1000 °C、盖一层灰皿粉、不能过吹（Pt 开始挥发/合金化）；
     * 铅扣 10 g 对 1 g Pt 是 10:1，PbO 生成量约 10.8 g，2 g MgO 灰皿
     * 吸收 5–6 g PbO 就饱和 —— 所以灰皿要浅、面积大，分两次灰吹。
     */
    id: 'measure/pt-assay',
    name: 'Platinum Purity Assay Measurement', name_zh: '铂纯度化验测量',
    produces: [
      {
        item: 'mat/pt-assay-record',
        qty: q(1),
        gives: [
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99 },
          { param: 'uncertainty', kind: 'range', min: 0.02, max: 0.05 },
          { param: 'method', kind: 'enum', oneOf: ['fire-assay'] },
        ],
      },
    ],
    uses: [
      // 1 g 样品（0.001 kg）；`mat/platinum` 的 purity 99–100 是设计窗口
      { anyOf: [{ item: 'mat/platinum', qty: q(1, 1000) }] },
      // 10 g 铅捕集剂
      { anyOf: [{ item: 'mat/lead', qty: q(1, 100) }] },
      // 5 g 硼砂 + 5 g 纯碱 + 2 g 石英：造渣
      { anyOf: [{ item: 'mat/borax', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/soda-ash', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(1, 500) }] },
      // 2 g 氧化镁灰皿（PbO 吸收体）
      { anyOf: [{ item: 'mat/magnesia', qty: q(1, 500) }] },
      // 王水：HCl 0.05 kg + HNO₃ 0.02 kg（ICP-MS 消解）
      { anyOf: [{ item: 'mat/hcl', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '① 混料：1 g 海绵 Pt + 10 g Pb + 5 g 硼砂 + 5 g 纯碱 + 2 g 石英，装 30 mL 黏土坩埚；空白与双份各一份',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 熔融：950–1000 °C、30 min；铅扣沉底，渣浮面。温度 >1050 °C 会加大 Pt 在渣中的损失',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 950, max: 1000 }],
      },
      {
        note_zh:
          '③ 灰吹：铅扣放 2 g 氧化镁灰皿（浅、面积大），950–1000 °C、45–60 min；Pb → PbO 被灰皿吸收，Pt 珠留下。**灰吹损失 0.1–0.5 %**，过吹会到 1 %',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 950, max: 1000 }],
      },
      {
        note_zh:
          '④ 称量：微天平 readability 0.05–0.1 µg、重复性 0.1–0.2 µg；1 g 样品上 0.2 µg 是 0.00002 %，称量不是瓶颈',
        performedBy: 'plant/micro-balance',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑤ ICP-MS 消解：王水 0.07 kg、稀释 1000×，测 Pd/Rh/Ir/Au/Cu/Fe；detectionLimit 0.01–20 ppb，100–1000 ppm 杂质在 0.1–1 ppm 档，够与 100 % 差减',
        performedBy: 'plant/icp-ms',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh:
          '⑥ 计算：purity = 珠重/样品重（尖标修正灰吹损失）；双份差给 uncertainty 0.02–0.05 %；ICP-MS 杂质和与火试金差 >0.05 % 就重做',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },
  {
    /**
     * **灰吹损失：10/100/1000 µg 尖标 × 双份 + 空白，测灰吹前后质量差。**
     *
     *   7 只 2 g MgO 灰皿：空白 1 + 10 µg×2 + 100 µg×2 + 1000 µg×2。
     *   每只 10 g Pb + 5 g 硼砂 + 5 g 纯碱 + 2 g 石英；950–1000 °C 熔融 30 min，
     *   灰吹 45–60 min。微天平称尖标与 Pt 珠（0.2 µg），灰皿粉碎 + 王水消解
     *   + ICP-MS 测吸留 Pt。
     *
     *   结果：recovery **99.5–99.9 %**；repeatabilityRange **0.1–0.3 %**（按 1 g 样折算）；
     *   2 g MgO 吸留 **1000–5000 µg**（1 g 样，1–5 mg）；空白 **1–5 µg**。
     *   10 µg 点空白占 10–50 %，只作空白/线性，不作认证回收率。
     *
     *   进 Pt 2.5 mg + Pb 70 g + 硼砂 35 g + 纯碱 35 g + 石英 14 g
     *   + MgO 14 g + 王水 0.13 kg + 水 2 kg → 记录 1 份。
     */
    id: 'measure/pt-cupellation-loss',
    name: 'Cupellation Loss Measurement', name_zh: '灰吹损失测量',
    produces: [
      {
        item: 'mat/pt-cupellation-loss-record',
        qty: q(1),
        gives: [
          { param: 'recovery', kind: 'range', min: 99.5, max: 99.9 },
          { param: 'repeatabilityRange', kind: 'range', min: 0.1, max: 0.3 },
          { param: 'absorption', kind: 'range', min: 1000, max: 5000 },
          { param: 'blank', kind: 'range', min: 1, max: 5 },
        ],
      },
    ],
    uses: [
      // 2.5 mg Pt：3 水平 × 双份 + 空白，含 10 % 余量
      { anyOf: [{ item: 'mat/platinum', qty: q(1, 400000) }] },
      // 7 只灰皿 × 10 g Pb
      { anyOf: [{ item: 'mat/lead', qty: q(7, 100) }] },
      // 7 × 5 g 硼砂 + 7 × 5 g 纯碱 + 7 × 2 g 石英
      { anyOf: [{ item: 'mat/borax', qty: q(7, 200) }] },
      { anyOf: [{ item: 'mat/soda-ash', qty: q(7, 200) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(7, 500) }] },
      // 7 × 2 g MgO 灰皿
      { anyOf: [{ item: 'mat/magnesia', qty: q(7, 500) }] },
      // 灰皿粉碎后的王水消解：HCl 0.1 kg + HNO₃ 0.03 kg
      { anyOf: [{ item: 'mat/hcl', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(3, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(16) },
    steps: [
      {
        note_zh:
          '① 7 只 2 g MgO 灰皿：空白 1 + 10 µg×2 + 100 µg×2 + 1000 µg×2；105 °C 烘干 2 h；尖标用 99.99 % Pt（从 mat/platinum 挑批次）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 每只加 10 g Pb + 5 g 硼砂 + 5 g 纯碱 + 2 g 石英，950–1000 °C 熔融 30 min；铅扣 10:1 捕集 Pt（D≈10³–10⁴，>99.9 % 进扣）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 950, max: 1000 }],
      },
      {
        note_zh:
          '③ 灰吹 950–1000 °C、45–60 min：Pb → PbO 被 MgO 灰皿吸收，Pt 珠留下；不能过吹（过吹 >1 %）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 950, max: 1000 }],
      },
      {
        note_zh:
          '④ 微天平称尖标与 Pt 珠（readability 0.2 µg）：灰吹前后质量差 = 损失；1 g 样上 0.2 µg 是 0.00002 %',
        performedBy: 'plant/micro-balance',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑤ 灰皿粉碎 + 王水消解 + ICP-MS 测吸留 Pt：把"吸留"与"挥发"分开；Pt 蒸气压 950–1000 °C 只有 5×10⁻¹¹–3×10⁻¹⁰ Pa，挥发 <0.00001 %',
        performedBy: 'plant/icp-ms',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh:
          '⑥ 计算：recovery = 1 − 损失/尖标；1000 µg 点给 99.5–99.9 %、双份差 0.1–0.3 %；2 g MgO 吸留 1000–5000 µg（1 g 样）；空白 1–5 µg',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },
  {
    /**
     * **修正记录：旧记录 purity 按灰吹回收率修正，可追溯到尖标。**
     *
     *   旧记录 1 份 + 灰吹损失记录 1 份 → 修正记录 1 份。
     *   purity_corr = purity_raw / recovery；recovery 99.5–99.9 % ⇒
     *   相对修正 +0.1–0.5 %。旧记录保留为历史（未修正的重复性 0.02–0.05 %）。
     *
     *   uncertainty 0.01–0.03 % 的来源：灰皿吸留批次差 50–150 µg / 1 g
     *   = 0.005–0.015 %，与微天平 0.00002 %、旧重复性合成；0.01 % 是下限。
     */
    id: 'measure/pt-assay-corrected',
    name: 'Pt Purity Correction Measurement', name_zh: 'Pt 纯度修正测量',
    produces: [
      {
        item: 'mat/pt-assay-corrected-record',
        qty: q(1),
        gives: [
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99 },
          { param: 'uncertainty', kind: 'range', min: 0.01, max: 0.03 },
          { param: 'method', kind: 'enum', oneOf: ['fire-assay-corrected'] },
          { param: 'traceability', kind: 'enum', oneOf: ['spike'] },
        ],
      },
    ],
    uses: [
      // 旧记录：未修正的表观值 + 重复性
      { anyOf: [{ item: 'mat/pt-assay-record', qty: q(1) }] },
      // 灰吹损失记录：recovery / absorption / blank
      { anyOf: [{ item: 'mat/pt-cupellation-loss-record', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(2) },
    steps: [
      {
        note_zh:
          '① 读旧记录：purity_raw 99.9–99.99 %、uncertainty_raw 0.02–0.05 %、method fire-assay/icp-ms',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 按 recovery 修正：purity_corr = purity_raw / recovery；recovery 99.5–99.9 % ⇒ 相对 +0.1–0.5 %，仍落在 99.9–99.99 % 窗口',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 不确定度：灰皿批次差 50–150 µg/1 g = 0.005–0.015 %，与微天平/旧重复性合成，给 0.01–0.03 %；出修正记录，可追溯到 10/100/1000 µg 尖标',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ASSAY_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...ASSAY_ROUTES];
