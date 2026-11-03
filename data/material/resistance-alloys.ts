/**
 * 精密电阻合金：manganin / constantan，以及用它们做的标准电阻。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 0. 为什么先补一段电解锰
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   本层原来只有 `mat/ferromanganese`（Mn 75 %、C 7.5 %）。manganin 要
 *   Mn 12–13 %、C <0.1 %；拿锰铁配料，100 kg 合金会带进 **1.2 kg C**，
 *   超 10 倍，TCR 直接毁掉。所以先补一步 **电解锰 99.9 %**：
 *
 *     软锰矿精矿 1000 kg（Mn 400 kg）
 *       + SO₂ 500 kg（把 MnO₂ 还原成 MnSO₄）
 *       + 水 3000 kg + 石灰 50 kg + 硫酸 100 kg
 *     60–80 °C 浸出 → 净化 → **50–60 °C 电积** → Mn 360 kg（90 %）
 *
 *   余 4190 kg 是废电解液（MnSO₄/H₂SO₄/水），本链没有回收，按不平衡声明。
 *   这一步不是"顺手"：没有它，manganin 的碳就下不来。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 1. manganin：Cu 85 / Mn 12.5 / Ni 2.5（配料 Mn 12.8，烧损 0.3）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   电阻率 43–48 µΩ·cm（设计 45–47）；对 Cu 热电势 <1 µV/K；TC **±5–10 ppm/K**，
 *   峰值在 **20–50 °C**。它不是"天生零 TCR"：冷加工后 TCR 是负的，
 *   必须在 **130–140 °C 低温退火 24–48 h**，让 Cu-Mn-Ni 短程有序 + 去应力，
 *   把 TCR 峰从 100 °C 以上挪回 20–50 °C。退火温度高了（400–500 °C），
 *   峰又往上跑，室温 TCR 变正、变大；退火温度低了，峰在室温以下，
 *   室温 TCR 仍是负的。
 *
 *   **Mn 每 1 wt% 对 TCR 的影响约 −10…−15 ppm/K（设计 −12）。**
 *   12.5 % 附近过零：13 % → 约 −6 ppm/K；12 % → 约 +6 ppm/K。
 *   所以配料窗口只有 ±0.5 % Mn，熔炼的 Mn 烧损（2–4 %）必须用覆盖剂
 *   （硼砂）压住，并按 128 kg Mn 投料补烧损。
 *
 *   应变系数 **2.0–2.2**（manganin 箔式应变片）；这是它同时能当应变片的原因。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 2. constantan：Cu 56 / Ni 44
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   电阻率 49 µΩ·cm；TC **±20–40 ppm/K**；与 Cu 配对热电势 **39–42 µV/K**
 *   （K 型热电偶的正极就是 Cu-Ni 合金这一类）。它不追求零 TCR，追求的是
 *   **热电势稳定、线性**；所以最终退火是 **400–500 °C / 2–4 h**，不是
 *   manganin 的 130–140 °C。冷拉后同样要 800–850 °C 均匀化。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 3. 标准电阻：绕线/箔式 + 无感绕法 + 老化
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   1 Ω–100 kΩ、±0.01–0.05 %、TC ≤10 ppm/K、四端对。
 *   绕法用 **双线并绕 / Aryton-Perry**（无感），骨架用氧化铝；引线用铜，
 *   压接/点焊后环氧封装（油浸版本要变压器油，本层 0 条，暂不交）。
 *   绕完 **100 °C / 100 h 老化**，再在 20/25/30 °C 四端对测，按 0.01–0.05 %
 *   分档。老化的目的不是"稳定阻值"这一句空话：manganin 的 TCR 峰在
 *   20–50 °C，老化把残余应力再放掉一截，否则第一批的 TC 会漂 2–5 ppm/K。
 *
 *   ⚠️ 标准电阻的 `accuracy 0.01–0.05 %` 是**与 `standard-resistor-local`
 *   比对后的交付窗口**，不是绝对准确度；绝对准确度仍受 0.02–0.05 % 的
 *   旧电阻标准限制。`plant/lcr-resistance-arm` 的第二条路线只交
 *   1 Ω–100 kΩ 档；1 mΩ / 10 MΩ 仍走旧路线。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const RESISTANCE_ALLOY_ITEMS: readonly Item[] = [
  /**
   * 电解锰。**99.9–99.99 %、C 0.01–0.02 %、片状。**
   *
   * 软锰矿精矿 → SO₂ 还原浸出 → 净化 → 50–60 °C 电积。它是 manganin 的
   * Mn 源；65Mn 仍用锰铁（不需要这么纯）。
   */
  {
    id: 'mat/manganese',
    name: '电解锰',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
      { param: 'carbon', kind: 'range', min: 0, max: 0.02, unit: '%', dir: 'atMost' },
      { param: 'form', kind: 'enum', values: ['electrolytic-flake'] },
    ],
  },

  /**
   * Manganin。**Cu 85 / Mn 12.5 / Ni 2.5；TC ±5–10 ppm/K（峰 20–50 °C）。**
   *
   *   cu              84–86 %
   *   mn              12–13 %
   *   ni              2–3 %
   *   tempCoefficient 0–10 ppm/K（atMost；设计 5–10）
   *   resistivity     43–48 µΩ·cm（设计 45–47）
   *   thermoEmf       0–1 µV/K（对 Cu，atMost）
   *   diameter        0.05–1 mm
   *   form            wire
   */
  {
    id: 'mat/manganin',
    name: '锰铜',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'cu', kind: 'range', min: 84, max: 86, unit: '%' },
      { param: 'mn', kind: 'range', min: 12, max: 13, unit: '%' },
      { param: 'ni', kind: 'range', min: 2, max: 3, unit: '%' },
      { param: 'tempCoefficient', kind: 'range', min: 0, max: 10, unit: 'ppm/K', dir: 'atMost' },
      { param: 'resistivity', kind: 'range', min: 43, max: 48, unit: 'µΩ·cm' },
      { param: 'thermoEmf', kind: 'range', min: 0, max: 1, unit: 'µV/K', dir: 'atMost' },
      { param: 'diameter', kind: 'range', min: 0.05, max: 1, unit: 'mm' },
      { param: 'form', kind: 'enum', values: ['wire'] },
    ],
  },

  /**
   * Constantan。**Cu 56 / Ni 44；TC ±20–40 ppm/K；与 Cu 热电势 39–42 µV/K。**
   *
   *   cu              55–57 %
   *   ni              43–45 %
   *   tempCoefficient 0–40 ppm/K（atMost；设计 20–40）
   *   resistivity     48–50 µΩ·cm（设计 49）
   *   thermoEmf       39–42 µV/K（与 Cu 配对，做热电偶）
   *   diameter        0.05–1 mm
   *   form            wire
   */
  {
    id: 'mat/constantan',
    name: '康铜',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'cu', kind: 'range', min: 55, max: 57, unit: '%' },
      { param: 'ni', kind: 'range', min: 43, max: 45, unit: '%' },
      { param: 'tempCoefficient', kind: 'range', min: 0, max: 40, unit: 'ppm/K', dir: 'atMost' },
      { param: 'resistivity', kind: 'range', min: 48, max: 50, unit: 'µΩ·cm' },
      { param: 'thermoEmf', kind: 'range', min: 39, max: 42, unit: 'µV/K' },
      { param: 'diameter', kind: 'range', min: 0.05, max: 1, unit: 'mm' },
      { param: 'form', kind: 'enum', values: ['wire'] },
    ],
  },

  /**
   * 精密 manganin 标准电阻。**1 Ω–100 kΩ、±0.01–0.05 %、TC ≤10 ppm/K。**
   *
   *   resistance      1–100 000 Ω
   *   accuracy        0.01–0.05 %（与 standard-resistor-local 比对）
   *   tempCoefficient 0–10 ppm/K（atMost；设计 5–10）
   *   terminals       4（四端对）
   *   package         oil-filled / epoxy（本文件交 epoxy；油浸见 `std/precision-resistor-oil`）
   */
  {
    id: 'std/precision-resistor-manganin',
    name: '精密 manganin 标准电阻',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resistance', kind: 'range', min: 1, max: 100000, unit: 'Ω' },
      { param: 'accuracy', kind: 'range', min: 0.01, max: 0.05, unit: '%', dir: 'atMost' },
      { param: 'tempCoefficient', kind: 'range', min: 0, max: 10, unit: 'ppm/K', dir: 'atMost' },
      { param: 'terminals', kind: 'range', min: 4, max: 4, unit: '端' },
      { param: 'package', kind: 'enum', values: ['oil-filled', 'epoxy'] },
    ],
  },
];

export const RESISTANCE_ALLOY_ROUTES: readonly Route[] = [
  /**
   * 电解锰：精矿 1000 + SO₂ 500 + 水 3000 + 石灰 50 + 硫酸 100
   *   → Mn 360 + 渣 100；余 4190 废电解液。
   *
   *   ① 60–80 °C 还原浸出：MnO₂ + SO₂ → MnSO₄
   *   ② 石灰调 pH 4.5–5.0，除 Fe/Ni，压滤
   *   ③ 50–60 °C 电积：MnSO₄ + H₂O → Mn + H₂SO₄ + ½ O₂
   *   ④ 剥离/水洗/干燥：Mn 99.9–99.99 %、C 0.01–0.02 %
   */
  {
    id: 'make/manganese-electrolytic',
    name: '电解锰制备',
    rate: { hours: q(48) },
    produces: [
      {
        item: 'mat/manganese',
        qty: q(360),
        gives: [
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99 },
          { param: 'carbon', kind: 'range', min: 0.01, max: 0.02 },
          { param: 'form', kind: 'enum', oneOf: ['electrolytic-flake'] },
        ],
      },
      { item: 'mat/tailings', qty: q(100) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/pyrolusite-concentrate', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/so2', qty: q(500) }] },
      { anyOf: [{ item: 'mat/water', qty: q(3000) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(50) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(100) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh:
          '① 还原浸出 60–80 °C、100–500 kPa、2 h：精矿 1000（Mn 400）+ 水 3000 + SO₂ 500；MnO₂ + SO₂ → MnSO₄',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 60, max: 80 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '② 净化 20–60 °C：石灰 50 kg 调 pH 4.5–5.0，Fe/Ni 进渣；压滤得 100 kg 渣',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '③ 电积 50–60 °C、300–500 A/m²：Mn²⁺ + 2e → Mn；电流效率 85–90 %，360 kg Mn（90 %）',
        performedBy: 'plant/electrorefining',
        under: [{ param: 'temperature', min: 50, max: 60 }],
      },
      {
        note_zh:
          '④ 剥离/水洗/干燥：Mn 片 360 kg、99.9–99.99 %、C 0.01–0.02 %；余 4190 kg 废电解液未回收',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '精矿 1000 + SO₂ 500 + 水 3000 + 石灰 50 + 硫酸 100 → Mn 360 + 渣 100；余 4190 是废电解液（MnSO₄/H₂SO₄/水）',
  },

  /**
   * Manganin：Cu 850 + Mn 128 + Ni 25 + 硼砂 30 → 合金 1000 + 渣 33。
   *
   *   ① 感应熔炼 1100–1200 °C，硼砂覆盖防 Mn 烧损（2–4 %）
   *   ② 均匀化 800–850 °C / 4–8 h
   *   ③ 冷拉 φ8 → 0.05–1 mm，15–20 %/道次，中间退火 400–500 °C
   *   ④ **最终低温退火 130–140 °C / 24–48 h** —— TCR 峰挪到 20–50 °C
   *   ⑤ 检 TC / 电阻率 / 对 Cu 热电势
   */
  {
    id: 'make/manganin',
    name: '锰铜制备',
    rate: { hours: q(72) },
    produces: [
      {
        item: 'mat/manganin',
        qty: q(1000),
        gives: [
          { param: 'cu', kind: 'range', min: 85, max: 85 },
          { param: 'mn', kind: 'range', min: 12.5, max: 12.5 },
          { param: 'ni', kind: 'range', min: 2.5, max: 2.5 },
          { param: 'tempCoefficient', kind: 'range', min: 5, max: 10 },
          { param: 'resistivity', kind: 'range', min: 45, max: 47 },
          { param: 'thermoEmf', kind: 'range', min: 0.2, max: 0.8 },
          { param: 'diameter', kind: 'range', min: 0.05, max: 1 },
          { param: 'form', kind: 'enum', oneOf: ['wire'] },
        ],
      },
      { item: 'mat/slag', qty: q(33) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(850) }] },
      { anyOf: [{ item: 'mat/manganese', qty: q(128) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(25) }] },
      { anyOf: [{ item: 'mat/borax', qty: q(30) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh:
          '① 感应熔炼 1100–1200 °C：Cu 850 + Mn 128 + Ni 25；硼砂 30 kg 覆盖，Mn 烧损 2–4 %，按 12.8 % 配料、产品 12.5 %',
        performedBy: 'plant/pgm-wire-mill',
        under: [{ param: 'temperature', min: 1120, max: 1180 }],
      },
      {
        note_zh:
          '② 均匀化 800–850 °C / 4–8 h：铸锭在保护气氛下保温，Mn/Ni 偏析压到 ±0.3 %',
        performedBy: 'plant/pgm-wire-mill',
        under: [{ param: 'temperature', min: 810, max: 840 }],
      },
      {
        note_zh:
          '③ 冷拉 φ8 → 0.05–1 mm，15–20 %/道次；中间退火 400–500 °C，防止加工硬化开裂',
        performedBy: 'plant/pgm-wire-mill',
        under: [{ param: 'temperature', min: 420, max: 480 }],
      },
      {
        note_zh:
          '④ 最终低温退火 130–140 °C / 24–48 h：短程有序 + 去应力，把 TCR 峰从 100 °C 以上挪到 20–50 °C；温度高了峰上跑，低了峰在室温以下',
        performedBy: 'plant/pgm-wire-mill',
        under: [{ param: 'temperature', min: 130, max: 140, record: 'mat/manganin-tcr-high-temp-record' }],
      },
      {
        note_zh:
          '⑤ 检 TC（20–50 °C，±5–10 ppm/K）、电阻率 45–47 µΩ·cm、对 Cu 热电势 0.2–0.8 µV/K；每 1 % Mn ≈ −12 ppm/K',
        performedBy: 'plant/metrology-room',
        under: [{ param: 'temperature', min: 19, max: 21, record: 'mat/manganin-tcr-room-temp-record' }],
      },
    ],
    unbalanced_zh:
      'Cu 850 + Mn 128 + Ni 25 + 硼砂 30 → 合金 1000 + 渣 33；Mn 烧损 3 kg，产品 Mn 12.5 %（配料 12.8 %）',
  },

  /**
   * Constantan：Cu 560 + Ni 440 + 硼砂 30 → 合金 1000 + 渣 30。
   *
   *   熔炼/均匀化/冷拉同 manganin；最终退火 **400–500 °C / 2–4 h**。
   *   它要的是与 Cu 配对的 39–42 µV/K 热电势，不是零 TCR。
   */
  {
    id: 'make/constantan',
    name: '康铜制备',
    rate: { hours: q(48) },
    produces: [
      {
        item: 'mat/constantan',
        qty: q(1000),
        gives: [
          { param: 'cu', kind: 'range', min: 56, max: 56 },
          { param: 'ni', kind: 'range', min: 44, max: 44 },
          { param: 'tempCoefficient', kind: 'range', min: 20, max: 40 },
          { param: 'resistivity', kind: 'range', min: 49, max: 49 },
          { param: 'thermoEmf', kind: 'range', min: 39, max: 42 },
          { param: 'diameter', kind: 'range', min: 0.05, max: 1 },
          { param: 'form', kind: 'enum', oneOf: ['wire'] },
        ],
      },
      { item: 'mat/slag', qty: q(30) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(560) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(440) }] },
      { anyOf: [{ item: 'mat/borax', qty: q(30) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh:
          '① 感应熔炼 1100–1200 °C：Cu 560 + Ni 440；硼砂 30 kg 覆盖，Ni 烧损 <1 %',
        performedBy: 'plant/pgm-wire-mill',
        under: [{ param: 'temperature', min: 1100, max: 1200 }],
      },
      {
        note_zh:
          '② 均匀化 800–850 °C / 4–8 h：Cu-Ni 无限固溶，仍需压偏析',
        performedBy: 'plant/pgm-wire-mill',
        under: [{ param: 'temperature', min: 800, max: 850 }],
      },
      {
        note_zh:
          '③ 冷拉 φ8 → 0.05–1 mm，15–20 %/道次；中间退火 500–600 °C',
        performedBy: 'plant/pgm-wire-mill',
        under: [{ param: 'temperature', min: 500, max: 600 }],
      },
      {
        note_zh:
          '④ 最终退火 400–500 °C / 2–4 h：定热电势 39–42 µV/K 与 TC 20–40 ppm/K；不是 manganin 的 130–140 °C',
        performedBy: 'plant/pgm-wire-mill',
        under: [{ param: 'temperature', min: 400, max: 500 }],
      },
      {
        note_zh:
          '⑤ 检 TC 20–40 ppm/K、电阻率 49 µΩ·cm、与 Cu 热电势 39–42 µV/K',
        performedBy: 'plant/metrology-room',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'Cu 560 + Ni 440 + 硼砂 30 → 合金 1000 + 渣 30；Ni 烧损与渣带走 30 kg',
  },

  /**
   * T 型热电偶（constantan 版）：constantan 1 + 铜 1 + PTFE 1 → 1 件。
   *
   *   旧 `make/thermocouple`（meter.ts）是现场熔康铜；这条直接用
   *   `mat/constantan` 丝，少一次熔炼与成分波动。两条路线都保留。
   */
  {
    id: 'make/thermocouple-constantan',
    name: '热电偶制造',
    rate: { hours: q(4) },
    produces: [
      {
        item: 'std/thermocouple-t-general',
        qty: q(1),
        gives: [
          { param: 'rangeMin', kind: 'range', min: -200, max: -50 },
          { param: 'rangeMax', kind: 'range', min: 400, max: 400 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/constantan', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '拉丝：constantan 与铜丝各拉到 φ0.5 mm；constantan 已按 400–500 °C 退火，不现场熔', performedBy: 'plant/rolling-mill' },
      { note_zh: '对焊热端：两根丝端部熔成珠', performedBy: 'plant/robot' },
      { note_zh: '穿 PTFE 套管、冷端接线；量程 −200…400 °C', performedBy: 'plant/robot' },
    ],
  },

  /**
   * 精密标准电阻：manganin 0.01 + 铜线 0.005 + 环氧 0.01 + 氧化铝骨架 0.005
   *   → 标准电阻 1 件。
   *
   *   双线并绕/Aryton-Perry 无感绕法；四端对；100 °C/100 h 老化；
   *   20/25/30 °C 四端对测，按 0.01–0.05 % 分档。油浸版本要变压器油，
   *   本层 0 条，只交环氧封装。
   */
  {
    id: 'make/precision-resistor-manganin',
    name: '精密 manganin 标准电阻制造',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'std/precision-resistor-manganin',
        qty: q(1),
        gives: [
          { param: 'resistance', kind: 'range', min: 1, max: 100000 },
          { param: 'accuracy', kind: 'range', min: 0.01, max: 0.05 },
          { param: 'tempCoefficient', kind: 'range', min: 5, max: 10, record: 'mat/manganin-tcr-record' },
          { param: 'terminals', kind: 'range', min: 4, max: 4 },
          { param: 'package', kind: 'enum', oneOf: ['epoxy'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/manganin', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 200) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh:
          '① 双线并绕/Aryton-Perry 无感绕法：manganin 丝绕在氧化铝骨架上，1 Ω–100 kΩ；匝间不重叠',
        performedBy: 'plant/winder',
      },
      {
        note_zh:
          '② 调阻/点焊：按目标阻值修长度，铜引线点焊到四端对端子；电流端与电压端分开',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '③ 环氧封装：真空浸渍、80 °C 固化 2 h；油浸版本要变压器油，本层 0 条',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '④ 老化 100 °C / 100 h：放掉残余应力，否则第一批 TC 会漂 2–5 ppm/K',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 100 }],
      },
      {
        note_zh:
          '⑤ 四端对测 20/25/30 °C：R 1 Ω–100 kΩ、TC 5–10 ppm/K、与标准电阻比对 0.01–0.05 %，分档',
        performedBy: 'plant/metrology-room',
      },
    ],
    unbalanced_zh:
      'manganin 0.01 + 铜线 0.005 + 环氧 0.01 + 氧化铝 0.005 → 标准电阻 1 件；按件计',
  },

  /**
   * LCR 桥臂第二条路线：用 6 只 manganin 标准电阻装 1 Ω–100 kΩ 档。
   *
   *   旧路线 `make/lcr-resistance-arm`（lcr-lr.ts）仍交 1 mΩ–10 MΩ、0.05–0.2 %；
   *   这条只交 1 Ω–100 kΩ、0.01–0.05 %、TC 5–10 ppm/K。1 mΩ/10 MΩ 仍走旧路线。
   */
  {
    id: 'make/lcr-resistance-arm-manganin',
    name: '四端对电阻桥臂制造',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'plant/lcr-resistance-arm',
        qty: q(1),
        gives: [
          { param: 'resistance', kind: 'range', min: 1, max: 100000 },
          { param: 'accuracy', kind: 'range', min: 0.01, max: 0.05 },
          { param: 'terminals', kind: 'range', min: 4, max: 4 },
          { param: 'tempCoefficient', kind: 'range', min: 5, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/precision-resistor-manganin', qty: q(6) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(1, 50) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh:
          '① 装 6 只 manganin 标准电阻（1 Ω/10 Ω/100 Ω/1 kΩ/10 kΩ/100 kΩ）+ 四端对端子；电流端 4 mm² 铜排',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '② 屏蔽/接地：PTFE 绝缘、钢板屏蔽盒；引线电容与漏电流压在 0.01 % 以下',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '③ 与 standard-resistor-local 逐档比对：1 Ω–100 kΩ，0.01–0.05 %；1 mΩ/10 MΩ 仍走旧路线',
        performedBy: 'plant/metrology-room',
      },
      {
        note_zh:
          '④ 温漂：20–30 °C 扫 TC 5–10 ppm/K；油浴/油浸已由 `plant/precision-oil-bath` 与 `std/precision-resistor-oil` 补上，本路线仍用环氧封装',
        performedBy: 'plant/metrology-room',
      },
    ],
    unbalanced_zh:
      '标准电阻 6 + 铜 0.5 + 钢板 1 + PTFE 0.05 + 环氧 0.02 → 桥臂 1 件（按件计）',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 接线（主 agent 注册；本文件不动 tools/report/data.ts）
//
//   import { RESISTANCE_ALLOY_ITEMS, RESISTANCE_ALLOY_ROUTES } from '../../data/material/resistance-alloys.ts';
//   items:  [...RESISTANCE_ALLOY_ITEMS]
//   routes: [...RESISTANCE_ALLOY_ROUTES]
//
// `plant/lcr-resistance-arm` 的条目仍在 data/machine/lcr-lr.ts（本文件只加
// 第二条路线，不重复声明）；该条目的 accuracy/TC 窗口已扩到 0.005–0.5 %、
// 2–50 ppm/K，旧路线与油浸路线都落在窗口内。
// ═══════════════════════════════════════════════════════════════════════════

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...RESISTANCE_ALLOY_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...RESISTANCE_ALLOY_ROUTES];
