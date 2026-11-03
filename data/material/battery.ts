/**
 * 动力电池 —— **NiFe（镍铁）不是锂电。**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、为什么不写锂电
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `plant/robot/battery` 的旧注释已经把账算清：锂盐只有 `mat/lithium-carbonate`，
 * 钴、石墨、六氟磷酸锂、隔膜 0 条。整条锂电链不是"少一道工序"：正极、负极、
 * 电解液、隔膜都不在。硬写锂电就是编路线 —— 用户明确说"不要为了好看写锂电"。
 *
 * 所以这里按**本层能造的化学**写：NiFe（Edison 电池，1901 年就有）。
 *
 *   正极  Ni(OH)₂ / NiOOH      镍矾 + KOH 沉淀 → 涂膏
 *   负极  Fe / Fe₃O₄           海绵铁（`mat/sponge-iron`，本层有路线）
 *   电解液 30 % KOH            本层有 `mat/koh`（电解 KCl，45–50 %）
 *   隔膜 玻璃布                本层有 `mat/glass-cloth`
 *   壳体 镀镍钢                本层有 `mat/sheet-steel` + `mat/nickel-plating-solution`
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、交付窗口与差距（全部是设计值）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   单体      1.2 V、35–45 Ah、20–30 Wh/kg、2 000–3 000 循环
 *   整包      48 V（40 只串联）、1.7–2.2 kWh、35–45 Ah、20–27 Wh/kg
 *   整包质量  78–82 kg（40 × 1.8 kg 单体 + 壳/母线 6–7 kg）
 *
 * 与 2026 商品锂电的差：
 *
 *   能量密度  20–27 Wh/kg 对 250 Wh/kg ⇒ **差 9–12 倍**
 *   2 kWh 包  78–82 kg 对 8 kg ⇒ **差 10–11 倍**
 *   循环寿命  2 000–3 000 对 500–1 000 ⇒ NiFe **反而好 2–6 倍**
 *   自放电    20–30 %/月 对 2–3 %/月 ⇒ 差 10 倍
 *   库仑效率  70–80 % 对 99 % ⇒ 差 1.3 倍
 *
 * **不写"降级锂电"**：NiFe 不是锂电的降级，是另一种电池。它的能量密度
 * 低 8–12 倍，但循环寿命长、不用钴、不用锂、不怕过充过放。机器人要背
 * 90 kg 的包走不走得动，这个模型答不了（整机质量预算没有建模）——
 * 这句话保留在 `robot.ts` 的缺口注释里，不藏。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、为什么正极材料要新建条目
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `mat/nickel-hydroxide` 在本层原来不存在；但它的原料全在：
 *   `mat/nickel-sulfate`（`make/nickel-sulfate`，镍 + 硫酸）
 *   `mat/koh`（`make/koh`，电解 KCl，45–50 %）
 * 反应 NiSO₄ + 2 KOH → Ni(OH)₂↓ + K₂SO₄ 是 19 世纪的工艺，不需要任何
 * 本层没有的东西。副产 K₂SO₄ 本层也有条目（`mat/potassium-sulfate`），
 * 所以这是一条**质量守恒的闭环**，不是"把废物写成 unbalanced"：
 *
 *   1 000 kg 镍矾 + 1 511 kg 48 % KOH
 *   → 599 kg Ni(OH)₂ + 1 126 kg K₂SO₄ + 786 kg 水 = 2 511 kg
 *
 * 三个数按分子量算：NiSO₄ 154.75、KOH 56.11、Ni(OH)₂ 92.71、K₂SO₄ 174.26。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const BATTERY_ITEMS: readonly Item[] = [
  /**
   * 氢氧化镍（正极活性材料）。绿色粉末，d50 2–5 µm。
   *
   * 纯度 96–98 %：沉淀法带 2–4 % 的硫酸根与钠（洗涤不彻底），
   * 对 NiFe 的正极没有致命影响（硫酸根在 KOH 里不参与反应），
   * 但会让首效掉 3–5 %。商品电池级要 99.5 %，本层差 1.5–3.5 个百分点。
   */
  {
    id: 'mat/nickel-hydroxide',
    name: 'Nickel Hydroxide', name_zh: '氢氧化镍',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 90, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'd50', kind: 'range', min: 0.5, max: 10, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * NiFe 单体电池。1.2 V、35–45 Ah、20–30 Wh/kg。
   *
   * 一只 1.8 kg 的单体里：正极膏 0.7 kg、负极膏 0.7 kg、电解液 0.3 kg、
   * 镀镍钢壳 0.1 kg。35 Ah × 1.2 V = 42 Wh；42 Wh / 1.8 kg = 23 Wh/kg，
   * 取 20–30 的上沿要 45 Ah 与更薄的壳。**这是设计值，不是实测**：
   * 本层没有电池测试台，容量只能按活性物质 0.24 Ah/g 的理论值 × 利用率 70–80 % 算。
   */
  {
    id: 'plant/robot/battery-cell',
    name: 'NiFe Single Cell', name_zh: 'NiFe 单体电池',
    unit: '件',
    category: 'part',
    props: [
      { param: 'capacity', kind: 'range', min: 20, max: 60, unit: 'Ah', dir: 'atLeast' },
      { param: 'voltage', kind: 'range', min: 1.1, max: 1.3, unit: 'V', dir: 'within' },
      { param: 'energyDensity', kind: 'range', min: 10, max: 40, unit: 'Wh/kg', dir: 'atLeast' },
      { param: 'cycleLife', kind: 'range', min: 500, max: 5000, unit: '循环', dir: 'atLeast' },
    ],
  },
];

export const BATTERY_ROUTES: readonly Route[] = [
  /**
   * 氢氧化镍：镍矾 + KOH 沉淀 → 过滤洗涤 → 干燥。
   *
   * 工序（三段的设备都已有）：
   *   ① 沉淀：1 000 kg NiSO₄ 配 20 % 溶液，加 1 511 kg 48 % KOH，
   *      40–60 °C、pH 9–10、搅拌 2 h；Ni(OH)₂ 绿色沉淀析出
   *   ② 过滤/洗涤：板框过滤 + 去离子水洗 3 次（洗掉 K₂SO₄ 与 Na⁺）
   *   ③ 干燥：100–120 °C、8 h，含水 <1 %
   *
   * 质量账（精确平衡，不写 unbalanced）：
   *   进 NiSO₄ 1 000 + KOH 溶液 1 511 = 2 511 kg
   *   出 Ni(OH)₂ 599 + K₂SO₄ 1 126 + 水 786 = 2 511 kg
   *
   * 收率 95 %：上面的 599 kg 是 95 % 收率后的数（理论 630 kg），
   * 损失 31 kg 在洗液里，已经含在"水 786"那一项里，不另立条目。
   *
   * KOH 按 48 % 计（`make/koh` 的窗口 45–50 %）；若是 45 %，要补到
   * 1 611 kg 才够同样的 KOH 量，反应与产率不变 —— 所以 `need` 写
   * 48–50，`onRelax: functional-kept`。
   */
  {
  id: 'make/nickel-hydroxide',
  name: 'Nickel Hydroxide Production', name_zh: '氢氧化镍制备',
  produces: [
    {
      item: 'mat/nickel-hydroxide',
      qty: q(599),
      gives: [
        { param: 'purity', kind: 'range', min: 96, max: 98 },
        { param: 'd50', kind: 'range', min: 2, max: 5 },
      ],
    },
    {
      item: 'mat/potassium-sulfate',
      qty: q(1126),
      gives: [
        { param: 'purity', kind: 'range', min: 92, max: 96 },
        { param: 'waterContent', kind: 'range', min: 0.5, max: 2 },
      ],
    },
    { item: 'mat/water', qty: q(786), gives: [{ param: 'conductivity', kind: 'range', min: 0.05, max: 1000 }] },
  ],
  uses: [
    { anyOf: [{ item: 'mat/nickel-sulfate', qty: q(1000) }] },
    {
      anyOf: [
        {
          item: 'mat/koh',
          qty: q(1511),
          need: [{ param: 'concentration', kind: 'range', min: 48, max: 50 }],
          onRelax: 'functional-kept',
        },
      ],
    },
  ],
  needs: ['plant/metrology-room'],
  steps: [
    {
      note_zh: '沉淀：NiSO₄ 20 % 溶液 + 48 % KOH，40–60 °C、pH 9–10、搅拌 2 h；KOH 稍过量 5 % 保镍沉干净',
      performedBy: 'plant/wet-bench',
      under: [
        { param: 'temperature', min: 40, max: 60 },
        { param: 'pressure', min: 100, max: 500 },
      ],
    },
    { note_zh: '板框过滤 + 去离子水洗 3 次（洗 K₂SO₄ 与 Na⁺；洗液进蒸发池回收 K₂SO₄）', performedBy: 'plant/robot' },
    {
      note_zh: '干燥 100–120 °C、8 h 到含水 <1 %；磨到 d50 2–5 µm',
      performedBy: 'plant/resistance-furnace',
      under: [{ param: 'temperature', min: 100, max: 120 }],
    },
  ],
  rate: { hours: q(24) },
  },
];

/**
 * NiFe 单体与整包。
 *
 * 单体路线是 40 只/批；整包是 40 只串成 48 V。中间没有"电芯分选"条目：
 * 本层没有内阻仪，只能按开路电压与 1 C 放电 10 s 的压降分三档，
 * 分选标准写在注释里，不另立条目（避免为了形式造一件没有设备的工序）。
 */
export const BATTERY_CELL_ROUTES: readonly Route[] = [
  {
    /**
     * NiFe 单体：正极膏 / 负极膏 → 涂膏辊压 → 裁片 → 装壳 → 注液 → 化成。
     *
     * 与商品 NiFe 的差别：
     *   · 商品正极是**烧结式**镍基板（镍粉烧结在镀镍钢网上，面容量 0.15–0.25 Ah/cm²）；
     *     本层没有镍粉，走**涂膏式**（Ni(OH)₂ + 碳 + PTFE 压在镀镍钢网上），
     *     面容量掉到 0.08–0.12 Ah/cm²，同样容量要多 1.5–2 倍面积。
     *   · 商品隔膜是尼龙/聚丙烯；本层只有玻璃布（`mat/glass-cloth`），
     *     30 % KOH 在 40 °C 下会缓慢侵蚀玻璃（0.1–0.3 mm/年），
     *     寿命从 20 年掉到 3–5 年。
     *   · 商品加 LiOH 提高高温性能；本层没有锂，省掉，高温容量掉 5–10 %。
     *
     * 质量账（按件计）：
     *   正极膏 30 + 负极膏 30 + 碳 3 + PTFE 2 + KOH 8 + 水 40
     *   + 玻璃布 5 + 钢壳 20 + 镍 8 + 镀镍液 2 = 148 kg
     *   → 40 只 × 1.8 kg = 72 kg；余 76 kg 是水（洗与配液）、边角料、
     *     化成损失与报废 5–10 %。
     */
    id: 'make/robot-battery-cell',
    name: 'NiFe Single Cell Manufacturing', name_zh: 'NiFe 单体电池制造',
    produces: [
      {
        item: 'plant/robot/battery-cell',
        qty: q(40),
        gives: [
          { param: 'capacity', kind: 'range', min: 35, max: 45 },
          { param: 'voltage', kind: 'range', min: 1.2, max: 1.2 },
          { param: 'energyDensity', kind: 'range', min: 20, max: 30 },
          { param: 'cycleLife', kind: 'range', min: 2000, max: 3000 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/nickel-hydroxide',
            qty: q(30),
            need: [{ param: 'purity', kind: 'range', min: 95, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/sponge-iron', qty: q(30) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(3) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(2) }] },
      {
        anyOf: [
          {
            item: 'mat/koh',
            qty: q(8),
            need: [{ param: 'concentration', kind: 'range', min: 45, max: 50 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/water', qty: q(40) }] },
      { anyOf: [{ item: 'mat/glass-cloth', qty: q(5) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(20) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(8) }] },
      { anyOf: [{ item: 'mat/nickel-plating-solution', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room', 'std/dvm-general'],
    steps: [
      {
        note_zh: '正极膏：Ni(OH)₂ 30 + 碳 1.5 + PTFE 1 + 水 20，捏合 30 min 到膏状（固含量 60–65 %）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '负极膏：海绵铁 30 + 碳 1.5 + PTFE 1 + 水 20；海绵铁的比表面 0.5–1 m²/g，涂膏前要球磨到 5–20 µm',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '涂膏 + 辊压到 0.6 mm（面容量 0.08–0.12 Ah/cm²）+ 裁片 120×80 mm',
        performedBy: 'plant/press',
      },
      { note_zh: '镀镍钢网（0.1 mm、冲孔）+ 极耳点焊 + 玻璃布隔膜包覆', performedBy: 'plant/robot' },
      {
        note_zh: '深冲 0.5 mm 钢壳（φ30×120）+ 镀镍 5 µm（KOH 里没有镍层，钢会析氢）',
        performedBy: 'plant/plating-bath',
        under: [{ param: 'temperature', min: 20, max: 40 }],
      },
      {
        note_zh: '装配：极组入壳、注 30 % KOH 电解液、封口（PTFE 垫 + 卷边）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '化成：0.1 C 充 12 h → 0.2 C 放 5 h，反复 20 次；末端容量 <35 Ah 的降级',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(48) },
    unbalanced_zh:
      '正极膏 30 + 负极膏 30 + 碳 3 + PTFE 2 + KOH 8 + 水 40 + 玻璃布 5 + 钢壳 20 + 镍 8 + 镀镍液 2 = 148 kg → 40 只 × 1.8 kg = 72 kg。余 76 kg 是配液/洗涤水、冲裁边角、化成损失与报废 5–10 %；**输出按件计，不折 kg**',
  },
];

export const BATTERY_PACK_ROUTES: readonly Route[] = [
  {
    /**
     * 48 V / 1.7–2.2 kWh NiFe 整包：40 只单体串联。
     *
     *   40 × 1.2 V = 48 V；40 × 40 Ah = 1.6 Ah? 不 —— 串联不增容量，
     *   容量仍是 35–45 Ah，能量 = 48 × 35–45 = **1.68–2.16 kWh**。
     *
     * 整包质量：
     *   40 × 1.8 kg = 72 kg 单体 + 壳 5 + 铜母线 2 + PTFE 0.5
     *   + 酚醛 0.5 + 接触器 1 ≈ **81 kg**；设计净重 78–82 kg。
     *   1.68–2.16 kWh / 0.081 t = **20.7–26.7 Wh/kg**，与单体 20–30 的差
     *   就是壳与母线。
     *
     * 与锂电 2 kWh 包（8 kg）差 **10–11 倍**；这是本路线最大的代价，
     * 不是"再优化一下"能补的。
     *
     * 没有 BMS：本层没有锂电那种需要每串监控的化学，NiFe 耐过充过放，
     * 只装 1 只 40 A 接触器 + 分流器 + 总压检测。单体电压不巡 —— 这是
     * 一处**真实的功能缺口**（不是降级：没有单体监控，长期使用会有一只
     * 先反极）。记在这里，不写成"有"。
     */
    id: 'make/robot-battery',
    name: 'Robot Power Battery Manufacturing', name_zh: '机器人动力电池制造',
    produces: [
      {
        item: 'plant/robot/battery',
        qty: q(1),
        gives: [
          { param: 'energy', kind: 'range', min: 1.7, max: 2.2 },
          { param: 'energyDensity', kind: 'range', min: 20, max: 27 },
          { param: 'voltage', kind: 'range', min: 48, max: 48 },
          { param: 'capacity', kind: 'range', min: 35, max: 45 },
          { param: 'cycleLife', kind: 'range', min: 2000, max: 3000 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/robot/battery-cell',
            qty: q(40),
            need: [
              { param: 'capacity', kind: 'range', min: 35, dir: 'atLeast' },
              // 单体镍铁标称就是 1.2 V，判据写 1.2–1.2 而不是 1.1–1.3：
              // `within` 要求交付窗口盖住要求窗口，1.2–1.2 盖不住 1.1–1.3，
              // 写宽窗口等于要求单体在 1.1–1.3 之间任意波动，与实测标称不符。
              { param: 'voltage', kind: 'range', min: 1.2, max: 1.2 },
              { param: 'cycleLife', kind: 'range', min: 2000, dir: 'atLeast' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 2) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room', 'std/dvm-general'],
    steps: [
      {
        note_zh: '40 只单体串联：铜母线 2 mm × 20 mm，螺栓压接；每 10 只一组，组间加 PTFE 隔板',
        performedBy: 'plant/robot',
      },
      { note_zh: '装 1.2 mm 钢壳、减震垫、吊耳；壳内涂酚醛绝缘', performedBy: 'plant/robot' },
      { note_zh: '装 40 A 接触器、分流器与总压检测线（没有单体巡检，见条目注释的缺口）', performedBy: 'plant/robot' },
      {
        note_zh: '充放电测试：0.2 C 放到底，量 1.68–2.16 kWh；内阻按 10 s 压降算（没有内阻仪）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      '单体 40 × 1.8 kg = 72 kg + 钢壳 5 + 铜母线 2 + PTFE 0.5 + 酚醛 0.5 + 接触器 1 ≈ 81 kg → 整包 1 件（设计净重 78–82 kg）。能量 1.68–2.16 kWh ⇒ 20–27 Wh/kg（含壳与母线）；**输出按件计，不折 kg**',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...BATTERY_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...BATTERY_CELL_ROUTES, ...BATTERY_PACK_ROUTES, ...BATTERY_ROUTES];
