/**
 * 变压器油 + 油浸标准电阻 —— 把“manganin 只能环氧封装”补到油浸。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、没有原油：选 PAO，不选煤液化/费托
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本层 `crude`/`petroleum` 0 条目，也没有煤液化/费托合成油链。两条可选：
 *
 *   煤液化/费托  要从煤 + 气化 + 变换 + 费托 + 加氢精制起，是一条 C10–C20
 *                 的大链；油里仍有烯烃/含氧物，要白土/加氢精制，硫 50–3 000 ppm。
 *   PAO          从现有 `mat/ethylene` 起：乙烯 → α-烯烃（C10–C14）→ BF₃
 *                 寡聚 → 加氢 → 真空脱气。纯烃、无硫/芳烃，击穿更高、倾点更低；
 *                 成本高 2–4 倍，但对密封标准电阻不需要添加剂，正合适。
 *
 * 所以本文件走 **PAO**：乙烯 1 000 → α-烯烃 850 → PAO 油 820 kg。
 * 收率 85 % / 96.5 %，总 82 %；能耗约 4–8 kWh/kg（寡聚 1.5–3、蒸馏 0.8–1.5、
 * 加氢 1–2、真空脱气 0.3–0.8）。
 *
 * 矿物油路线（常压蒸馏 → 糠醛精制 → 白土精制 → 真空脱气）本文件不建：
 * 没有原油、没有糠醛/白土条目；若以后有原油，按那条走，PAO 作为“无硫高击穿”
 * 的对照。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、油浸相对环氧的 TC 改善
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   manganin 本征 TC          5–10 ppm/K
 *   环氧封装（CTE 20–50 ppm/K） 6–13 ppm/K（树脂约束加 1–3 ppm/K）
 *   油浸（PAO，无约束）         2–5 ppm/K（挑本征低端 + 油恒温）
 *
 *   ⇒ 油浸比环氧低 **3–8 ppm/K**；不是“油有魔法”，是去掉环氧的机械约束 +
 *     油的热容把短时波动压下去。精度从 0.01–0.05 % 到 0.005–0.02 %。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、体积膨胀与波纹补偿
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PAO 的体积膨胀系数 β = **0.7–0.9 ‰/K**（7–9×10⁻⁴/K）。取 0.2–0.5 L 油、
 * 20→80 °C 的 60 K 温差：
 *
 *   ΔV = V·β·ΔT
 *   0.2 L：0.2 × 7e-4 × 60 = **8.4 mL**（9e-4 时 10.8 mL）
 *   0.5 L：0.5 × 7e-4 × 60 = **21 mL**（9e-4 时 27 mL）
 *
 * 波纹补偿容积取 **1.5–2× 最大膨胀**：0.2 L 壳配 **15–20 mL**，0.5 L 壳配
 * **35–50 mL**。波纹用 0.1–0.2 mm 不锈钢膜片，行程 2–5 mm；补偿不足会把
 * 玻璃-金属封接顶裂，补偿过大则油面随温度晃、增加对流。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、油与电阻丝的长期相容性
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * manganin 是 Cu-85/Mn-12.5/Ni-2.5；铜怕硫。PAO 的硫 **<1–5 ppm**，
 * 矿物油 50–3 000 ppm（其中腐蚀性硫醇/硫醚 1–50 ppm）。90 °C 下硫醇
 * 1–5 ppm 就会在铜表面生成 Cu₂S，电阻丝截面一年掉 0.1–0.5 %。
 *
 * 所以油浸电阻用 PAO，并加 **铜钝化/除硫**：白土或活性氧化铝吸附到
 * 硫 ≤1–5 ppm、酸值 ≤0.01–0.03 mgKOH/g、水 ≤10–20 ppm；密封前 10 Pa
 * 真空、80–100 °C 脱水。环氧封装的失效模式是吸水/开裂；油浸的失效模式
 * 是漏油/硫腐蚀，两条都要写进寿命。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const TRANSFORMER_OIL_ITEMS: readonly Item[] = [
  /**
   * C10–C14 α-烯烃。**碳数 10–14、纯度 90–98 %、烯烃 95–99 %。**
   *
   * 乙烯寡聚 + 中和/水洗 + 真空蒸馏切 C10–C14；轻端 C4–C8 进尾料。
   */
  {
    id: 'mat/alpha-olefins-c10c14',
    name: 'C10–C14 α-Olefins', name_zh: 'C10–C14 α-烯烃',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'carbonNumber', kind: 'range', min: 10, max: 14, unit: 'C' },
      { param: 'purity', kind: 'range', min: 90, max: 98, unit: '%', dir: 'atLeast' },
      { param: 'olefin', kind: 'range', min: 95, max: 99, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 100, max: 500, unit: 'ppm', dir: 'atMost' },
    ],
  },

  /**
   * 变压器油（PAO）。**击穿 30–60 kV/2.5 mm、水 10–20 ppm、
   * 酸值 0.01–0.03 mgKOH/g、倾点 ≤−40 °C、闪点 ≥140 °C、
   * 40 °C 粘度 9–12 cSt、tanδ ≤0.001（90 °C）。**
   *
   * 本路线交 PAO；矿物油（环烷基/石蜡基）走另一条，本层没有原油。
   */
  {
    id: 'mat/transformer-oil',
    name: 'Transformer Oil', name_zh: '变压器油',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'baseOil', kind: 'enum', values: ['PAO', 'mineral-oil'] },
      { param: 'breakdown', kind: 'range', min: 30, max: 60, unit: 'kV/2.5mm', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 10, max: 20, unit: 'ppm', dir: 'atMost' },
      { param: 'acidValue', kind: 'range', min: 0.01, max: 0.03, unit: 'mgKOH/g', dir: 'atMost' },
      { param: 'pourPoint', kind: 'range', min: -50, max: -40, unit: '°C', dir: 'atMost' },
      { param: 'flashPoint', kind: 'range', min: 140, max: 160, unit: '°C', dir: 'atLeast' },
      { param: 'viscosity40', kind: 'range', min: 9, max: 12, unit: 'cSt' },
      { param: 'tanDelta', kind: 'range', min: 0.0005, max: 0.001, unit: '1', dir: 'atMost' },
      { param: 'expansion', kind: 'range', min: 0.0007, max: 0.0009, unit: '1/K' },
      { param: 'sulfur', kind: 'range', min: 0.5, max: 5, unit: 'ppm', dir: 'atMost' },
      { param: 'density', kind: 'range', min: 0.82, max: 0.86, unit: 'g/cm³' },
    ],
  },

  /**
   * 油浸精密标准电阻。**1 Ω–100 kΩ、±0.005–0.02 %、TC 2–5 ppm/K、四端对。**
   *
   * 密封壳：不锈钢/铝 + 玻璃-金属封接 + 波纹补偿；注油真空 10 Pa。
   */
  {
    id: 'std/precision-resistor-oil',
    name: 'Oil-Immersed Precision Standard Resistor', name_zh: '油浸精密标准电阻',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resistance', kind: 'range', min: 1, max: 100000, unit: 'Ω' },
      { param: 'accuracy', kind: 'range', min: 0.005, max: 0.02, unit: '%', dir: 'atMost' },
      { param: 'tempCoefficient', kind: 'range', min: 2, max: 5, unit: 'ppm/K', dir: 'atMost' },
      { param: 'terminals', kind: 'range', min: 4, max: 4, unit: '端' },
      { param: 'package', kind: 'enum', values: ['oil-filled', 'epoxy'] },
      { param: 'oilVolume', kind: 'range', min: 0.05, max: 0.5, unit: 'L' },
      { param: 'seal', kind: 'enum', values: ['glass-metal', 'welded'] },
    ],
  },
];

export const TRANSFORMER_OIL_ROUTES: readonly Route[] = [
  /**
   * α-烯烃：乙烯 + AlCl₃ 寡聚 → 中和/水洗 → 真空蒸馏 C10–C14。
   *
   *   乙烯 1000 + AlCl₃ 5 + 水 200 + NaOH 10
   *   → α-烯烃 850 + 水 200 + 尾料 165
   */
  {
    id: 'make/alpha-olefins',
    name: 'α-Olefin Production', name_zh: 'α-烯烃制备',
    produces: [
      {
        item: 'mat/alpha-olefins-c10c14',
        qty: q(850),
        gives: [
          { param: 'carbonNumber', kind: 'range', min: 10, max: 14 },
          { param: 'purity', kind: 'range', min: 92, max: 98 },
          { param: 'olefin', kind: 'range', min: 95, max: 99 },
          { param: 'water', kind: 'range', min: 100, max: 500 },
        ],
      },
      {
        item: 'mat/water',
        qty: q(200),
        gives: [{ param: 'conductivity', kind: 'range', min: 500, max: 1000 }],
      },
      { item: 'mat/tailings', qty: q(165) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ethylene', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/aluminium-chloride', qty: q(5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(200) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(10) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 乙烯寡聚：90–120 °C、1–3 MPa、AlCl₃ 5 kg；C4–C20 宽分布，4–8 h', performedBy: 'plant/mid-pressure-autoclave', under: [{ param: 'temperature', min: 90, max: 120 }, { param: 'pressure', min: 1000, max: 3000 }] },
      { note_zh: '② 中和/水洗：20–60 °C，NaOH 10 kg 中和 AlCl₃，水 200 kg 洗；废液进尾料', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 60 }, { param: 'pressure', min: 100, max: 500 }] },
      { note_zh: '③ 真空蒸馏：5–20 kPa、120–160 °C，切 C10–C14；轻端 C4–C8 进尾料', performedBy: 'plant/vacuum-column', under: [{ param: 'temperature', min: 120, max: 160 }, { param: 'pressure', min: 5, max: 20 }] },
    ],
    rate: { hours: q(36) },
    unbalanced_zh:
      '乙烯 1000 + AlCl₃ 5 + 水 200 + NaOH 10 → α-烯烃 850 + 水 200 + 尾料 165；85 % 收率，尾料是 C4–C8/废催化剂/中和渣。能耗约 1.5–3 kWh/kg（寡聚）+ 0.8–1.5（蒸馏）',
  },

  /**
   * PAO 变压器油：α-烯烃 + BF₃ 寡聚 → 加氢 → 中和/水洗 → 真空脱气。
   *
   *   α-烯烃 850 + BF₃ 2 + H₂ 10 + Ni 0.1 + 水 100 + NaOH 5
   *   → 变压器油 820 + 水 100 + 尾料 47.1
   */
  {
    id: 'make/transformer-oil',
    name: 'PAO Transformer Oil Production', name_zh: 'PAO 变压器油制备',
    produces: [
      {
        item: 'mat/transformer-oil',
        qty: q(820),
        gives: [
          { param: 'baseOil', kind: 'enum', oneOf: ['PAO'] },
          { param: 'breakdown', kind: 'range', min: 40, max: 60, record: 'mat/oil-qualification-record' },
          { param: 'water', kind: 'range', min: 10, max: 20, record: 'mat/oil-qualification-record' },
          { param: 'acidValue', kind: 'range', min: 0.01, max: 0.02, record: 'mat/oil-qualification-record' },
          { param: 'pourPoint', kind: 'range', min: -50, max: -45, record: 'mat/flash-point-pour-point-record' },
          { param: 'flashPoint', kind: 'range', min: 150, max: 160, record: 'mat/flash-point-pour-point-record' },
          { param: 'viscosity40', kind: 'range', min: 9.5, max: 11.5, record: 'mat/kinematic-viscosity-record' },
          { param: 'tanDelta', kind: 'range', min: 0.0005, max: 0.001, record: 'mat/oil-qualification-record' },
          { param: 'expansion', kind: 'range', min: 0.0007, max: 0.0009 },
          { param: 'sulfur', kind: 'range', min: 0.5, max: 2 },
          { param: 'density', kind: 'range', min: 0.83, max: 0.85 },
        ],
      },
      {
        item: 'mat/water',
        qty: q(100),
        gives: [{ param: 'conductivity', kind: 'range', min: 500, max: 1000 }],
      },
      { item: 'mat/tailings', qty: q(471, 10) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/alpha-olefins-c10c14', qty: q(850) }] },
      { anyOf: [{ item: 'mat/boron-trifluoride', qty: q(2) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(10) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(100) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① PAO 寡聚：80–120 °C、1–3 MPa、BF₃ 2 kg；α-烯烃二聚/三聚，2–4 h', performedBy: 'plant/mid-pressure-autoclave', under: [{ param: 'temperature', min: 80, max: 120 }, { param: 'pressure', min: 1000, max: 3000 }] },
      { note_zh: '② 加氢：150–200 °C、1–3 MPa、Ni 0.1 kg；把残余双键降到 ≤0.1 mgKOH/g', performedBy: 'plant/mid-pressure-autoclave', under: [{ param: 'temperature', min: 150, max: 200 }, { param: 'pressure', min: 1000, max: 3000 }] },
      { note_zh: '③ 中和/水洗：20–60 °C，NaOH 5 kg + 水 100 kg；废液进尾料', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 60 }, { param: 'pressure', min: 100, max: 500 }] },
      { note_zh: '④ 真空脱气脱水：80–100 °C、1–10 Pa、2–4 h；水 ≤10–20 ppm、气含量 ≤0.1 %', performedBy: 'plant/boron-crystallizer', under: [{ param: 'temperature', min: 80, max: 100 }, { param: 'pressure', min: 1, max: 10 }] },
    ],
    rate: { hours: q(48) },
    unbalanced_zh:
      'α-烯烃 850 + BF₃ 2 + H₂ 10 + Ni 0.1 + 水 100 + NaOH 5 → 油 820 + 水 100 + 尾料 47.1；96.5 % 收率，总 82 %。能耗约 1–2 kWh/kg（寡聚/加氢）+ 0.3–0.8（真空脱气）',
  },

  /**
   * 油浸标准电阻：manganin 无感绕制 → 退火 → 装壳/封接/波纹 → 真空注油 → 标定。
   *
   *   manganin 0.01 + 变压器油 0.2 + 不锈钢 0.2 + 玻璃粉 0.01
   *   + 铜 0.05 + 氧化铝 0.005 → 油浸电阻 1 件
   *
   * ⚠️ accuracy 与 tempCoefficient 保留 design，不是漏测：比值桥 ratioError
   * 50–100 ppm，直接测阻值只到 0.01–0.02 %；油槽 20–30 °C 只有 10 K 跨度，
   * 2–5 ppm/K 折算 20–50 ppm，被桥误差盖住。要收窄这两格，需要更高准确度的
   * 标准电阻与更宽的恒温槽，本层没有。
   */
  {
    id: 'make/precision-resistor-oil',
    name: 'Oil-Immersed Precision Standard Resistor Manufacturing', name_zh: '油浸精密标准电阻制造',
    produces: [
      {
        item: 'std/precision-resistor-oil',
        qty: q(1),
        gives: [
          { param: 'resistance', kind: 'range', min: 1, max: 100000 },
          { param: 'accuracy', kind: 'range', min: 0.005, max: 0.02, record: 'mat/precision-resistor-oil-measure-record' },
          { param: 'tempCoefficient', kind: 'range', min: 2, max: 5, record: 'mat/precision-resistor-oil-measure-record' },
          { param: 'terminals', kind: 'range', min: 4, max: 4 },
          { param: 'package', kind: 'enum', oneOf: ['oil-filled'] },
          { param: 'oilVolume', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'seal', kind: 'enum', oneOf: ['glass-metal'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/manganin', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/transformer-oil', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/glass-frit', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 200) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 无感绕制：manganin 丝绕氧化铝骨架，Aryton-Perry 双线并绕，1 Ω–100 kΩ；匝间不重叠', performedBy: 'plant/winder', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 退火：130–140 °C / 24–48 h，把 TCR 峰挪到 20–50 °C；复测阻值变化 ≤0.001 %', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 130, max: 140 }] },
      { note_zh: '③ 装壳/封接：不锈钢壳 + 玻璃-金属封接 + 0.1–0.2 mm 不锈钢波纹；氦检漏 ≤1e-9 Pa·L/s', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 真空注油：80–100 °C、1–10 Pa、2–4 h；油量 0.2–0.5 L，波纹补偿 15–50 mL；封口', performedBy: 'plant/boron-crystallizer', under: [{ param: 'temperature', min: 80, max: 100 }, { param: 'pressure', min: 1, max: 10 }] },
      { note_zh: '⑤ 标定：20–30 °C 与标准电阻比对，0.005–0.02 %；TC 2–5 ppm/K（20–50 °C 扫）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(80) },
    unbalanced_zh:
      'manganin 0.01 + 变压器油 0.2 + 不锈钢 0.2 + 玻璃粉 0.01 + 铜 0.05 + 氧化铝 0.005 → 油浸电阻 1；按件计。油量 0.2–0.5 L；波纹补偿 15–50 mL；0.005–0.02 %、2–5 ppm/K 是设计值',
  },

  /**
   * LCR 桥臂第三条路线：6 只油浸标准电阻（1/10/100/1k/10k/100k）+ 四端对。
   *
   *   油浸电阻 6 + 铜 0.5 + 钢板 1 + PTFE 0.02 + 接触器 1 → 桥臂 1
   */
  {
    id: 'make/lcr-resistance-arm-oil',
    name: 'Four-Terminal-Pair Resistance Arm Manufacturing', name_zh: '四端对电阻桥臂制造',
    produces: [
      {
        item: 'plant/lcr-resistance-arm',
        qty: q(1),
        gives: [
          { param: 'resistance', kind: 'range', min: 1, max: 100000 },
          { param: 'accuracy', kind: 'range', min: 0.005, max: 0.02 },
          { param: 'terminals', kind: 'range', min: 4, max: 4 },
          { param: 'tempCoefficient', kind: 'range', min: 2, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/precision-resistor-oil', qty: q(6) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 50) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 装 6 只油浸标准电阻（1 Ω/10 Ω/100 Ω/1 kΩ/10 kΩ/100 kΩ）+ 四端对端子；电流端 4 mm² 铜排', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 屏蔽/温控：钢板屏蔽盒 + PTFE 绝缘；20–30 °C 油浴或计量间', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 逐档与标准电阻比对：0.005–0.02 %；TC 2–5 ppm/K（油浸电阻本征）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      '油浸电阻 6 + 铜 0.5 + 钢板 1 + PTFE 0.02 + 接触器 1 → 桥臂 1 件；只交 1 Ω–100 kΩ 档。旧路线仍交 1 mΩ–10 MΩ、0.05–0.2 %；manganin 环氧路线交 1 Ω–100 kΩ、0.01–0.05 %、5–10 ppm/K',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...TRANSFORMER_OIL_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...TRANSFORMER_OIL_ROUTES];
