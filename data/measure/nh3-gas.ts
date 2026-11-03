/**
 * 氨气杂质的**测量与记录那一半**（R13：`measure/*` 与 `*-record` 只放 data/measure/）。
 *
 * ⚠️ **分工（R13）**：本文件只放 **2 条测量路线 + 2 个记录条目**；仪器与零件
 * （`plant/nh3-absorber`、`plant/nh3-moisture-analyzer` 及其零件、`plant/gc-tcd` 及其
 * 六件、`mat/zeolite-5a`）与它们的 `make/*` 路线在 `data/machine/nh3-gas.ts`
 * （导出名 `NH3_GAS_HW_ITEMS` / `NH3_GAS_HW_ROUTES`），按 id 跨文件解析 ——
 * 两文件在同一次 data 装配里注册，数据层只引 id，没有跨文件 import。
 *
 * id 与窗口**一个字都没改**：
 *   measure/nh3-moisture        → mat/nh3-h2o-record
 *   measure/nh3-gas-impurities  → mat/nh3-o2-co-co2-n2-h2-record
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、六项读数（窗口 = 这台仪器能覆盖的范围，不是读数）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   H₂O   0.1–100 ppm（检出限 0.1–0.2、响应 60–180 s、NH₃ 残余偏移 0.02–0.05 ppm）
 *        电解池法拉第账：1 ppm = 14.3 µA @100 mL/min；同批干氨标零扣掉 NH₃ 交叉项
 *   O₂    0.2–5 ppm    GC-TCD、5A 柱、H₂ 载（Δλ 0.161 W/(m·K)）
 *   N₂    0.2–5 ppm    同上（载气 N₂ <0.1 ppm 靠 500 °C 镁床）
 *   CO    0.5–10 ppm   同上；**半定量 ±30–50 %**（`mat/co` 纯度只有 30–99 %）
 *   CO₂   1–10 ppm    硅胶柱、H₂ 载；1 ppm 档要 5–6 h 预平衡（酸膜先溶 4.5–6.7 µmol）
 *   H₂    0.1–5 ppm    5A 柱、**Ar 载**（Δλ 0.169，本链最好测的一格）
 *
 * 六项检出限之和 ≈ 2.1 ppm < 10 ppm 预算 ⇒ 判 99.999 % 时六项都够。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、推导与缺口在哪
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   §〇–§五（法拉第账、λ 表、氨阱的溶解/容量账、六项窗口、九条缺口）全在
 *   `data/machine/nh3-gas.ts` 的文件头 —— 这一份不重复抄，免得两处各说一套。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { NH3_GAS_MEASURE_ITEMS, NH3_GAS_MEASURE_ROUTES } from '../../data/measure/nh3-gas.ts';
 *   items: [...NH3_GAS_MEASURE_ITEMS] · routes: [...NH3_GAS_MEASURE_ROUTES]
 *
 * ⚠️ 同时要注册 `data/machine/nh3-gas.ts`（HW 两行）；只注册这一半，
 * `plant/gc-tcd` 等会 `unknown_item`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、两个记录条目（R12 的收窄产物）
// ═══════════════════════════════════════════════════════════════════════════

export const NH3_GAS_MEASURE_ITEMS: readonly Item[] = [
  /**
   * **氨中水分记录。一份对应一批。**
   *
   *   water          0.1–100 ppm（法拉第读数，1 ppm = 14.3 µA）
   *   detectionLimit 0.1–0.2 ppm（池空白 + 零气本底）
   *   responseTime   60–180 s
   *   nh3Offset      0.02–0.05 ppm（同批干氨标零之后）
   *
   * ⚠️ 0.1 ppm 以下是**证不了**的，不是「没测」：零气本身有 0.05–0.1 ppm 水。
   */
  {
    id: 'mat/nh3-h2o-record',
    name: '氨中水分记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'water', kind: 'range', min: 3, max: 8, unit: 'ppm' },
      { param: 'detectionLimit', kind: 'range', min: 0.05, max: 0.5, unit: 'ppm', dir: 'atMost' },
      { param: 'responseTime', kind: 'range', min: 30, max: 600, unit: 's', dir: 'atMost' },
      { param: 'nh3Offset', kind: 'range', min: 0, max: 0.1, unit: 'ppm', dir: 'atMost' },
    ],
  },

  /**
   * **氨中 O₂/N₂/CO/CO₂/H₂ 记录。一份对应一批。**
   *
   *   oxygen          0.2–5 ppm
   *   nitrogen        0.2–5 ppm
   *   carbonMonoxide  0.5–10 ppm（半定量 ±30–50 %）
   *   carbonDioxide   1–10 ppm
   *   hydrogen        0.1–5 ppm
   *   speciesCount    5
   *
   * 六项检出限之和 ≈ 2.1 ppm < 10 ppm 预算 ⇒ 判 99.999 % 够；但 CH₄/H₂S/总烃
   * 不在这里（缺口⑧）。
   */
  {
    id: 'mat/nh3-o2-co-co2-n2-h2-record',
    name: '氨中 O₂/N₂/CO/CO₂/H₂ 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'oxygen', kind: 'range', min: 0.1, max: 1000, unit: 'ppm' },
      { param: 'nitrogen', kind: 'range', min: 0.1, max: 1000, unit: 'ppm' },
      { param: 'carbonMonoxide', kind: 'range', min: 0.2, max: 1000, unit: 'ppm' },
      { param: 'carbonDioxide', kind: 'range', min: 0.5, max: 1000, unit: 'ppm' },
      { param: 'hydrogen', kind: 'range', min: 0.1, max: 1000, unit: 'ppm' },
      { param: 'speciesCount', kind: 'range', min: 3, max: 6, unit: '个' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 10, unit: '%', dir: 'atMost' }, // O₂/N₂/CO₂/H₂ 的 U：标气外标后 5–10 % → 2–4 %
      { param: 'uCO', kind: 'range', min: 0, max: 50, unit: '%', dir: 'atMost' }, // CO 单独：标气源仍 30–99 % ⇒ 15–30 %，压不下去
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、两条测量路线（R12：窗口在这里从仪器能力收窄成记录）
// ═══════════════════════════════════════════════════════════════════════════

export const NH3_GAS_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **氨中水分：零气吹扫 → 同批干氨读零 → 样品进池 → 差减。**
     *
     *   1 g 电子级 NH₃ + 干氮吹扫 → 记录 1 份
     *
     * 五步（1 h 机时 + 1 h 前处理）：
     *
     *   ① 干氮 50 mL/min 吹 10 min（露点 ≤ −60 °C）
     *   ② 同批 NH₃ 过 4A 零气发生器 10 min，读 I₀（NH₃ 交叉项，0.15–0.75 ppm 水当量）
     *   ③ 样品进池 5 min，读 I（1 ppm ≈ 14.3 µA @100 mL/min）
     *   ④ 水 = (I − I₀)/14.3 + 0.05–0.1 ppm（零气本底）
     *
     * 交付窗口：水 0.1–100 ppm、检出限 0.1–0.2 ppm、响应 60–180 s、
     * NH₃ 残余偏移 0.02–0.05 ppm。
     */
    id: 'measure/nh3-moisture',
    name: '氨中水分测量',
    produces: [
      {
        item: 'mat/nh3-h2o-record',
        qty: q(1),
        gives: [
          // 收窄到标准气的水分给出窗 3–8 ppm（原 0.1–100 是传感器量程）。
          { param: 'water', kind: 'range', min: 3, max: 8 },
          { param: 'detectionLimit', kind: 'range', min: 0.1, max: 0.2 },
          { param: 'responseTime', kind: 'range', min: 60, max: 180 },
          { param: 'nh3Offset', kind: 'range', min: 0.02, max: 0.05 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ammonia-electronic', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 100) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/picoammeter', 'plant/mfc'],
    steps: [
      {
        note_zh: '① 吹扫：干氮 50 mL/min × 10 min（露点 ≤ −60 °C，把板与池里的残水赶走）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '② 读零：同批 NH₃ 过零气发生器 10 min（出口 0.05–0.08 ppm 水、NH₃ 95–99 % 穿过），读 I₀',
        performedBy: 'plant/nh3-moisture-analyzer',
        under: [{ param: 'temperature', min: 30, max: 40 }],
      },
      {
        note_zh: '③ 读样：样品 100 mL/min × 5 min，读 I；池温 30–40 °C、板伴热 45–55 °C',
        performedBy: 'plant/nh3-moisture-analyzer',
        under: [{ param: 'temperature', min: 30, max: 40 }],
      },
      {
        note_zh: '④ 差减：水 = (I − I₀)/14.3 µA/ppm + 0.05–0.1 ppm（零气本底）；斜率每次开机用 0.1/1/10 ppm 三点校；涂层每 30–150 h（10 ppm 下）重涂',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(2) },
  },

  {
    /**
     * **氨中 O₂/N₂/CO/CO₂/H₂：过阱 → 两种载气两次进样 → 外标。**
     *
     *   5 g 电子级 NH₃ + 氨阱 1 支 + Ar/H₂ 载气 → 记录 1 份
     *
     * 五步（3 h 机时 + 1 h 前处理）：
     *
     *   ① 装阱与预平衡 1–2 h（CO₂ 要等酸膜溶满；O₂/CO/N₂/H₂ 3 min 即稳）
     *   ② Ar 载气 20 mL/min、5A 柱 50 °C：H₂（Δλ 0.169，0.1–5 ppm）
     *   ③ H₂ 载气 20 mL/min、5A 柱 50 °C：O₂、N₂、CO（0.2–10 ppm）
     *   ④ H₂ 载气、硅胶柱 80 °C：CO₂（1–10 ppm）
     *   ⑤ 积分：保留时间定性、峰高外标（1/10/100 ppm 动态配气）
     *
     * 交付窗口：O₂ 0.2–5、N₂ 0.2–5、CO 0.5–10、CO₂ 1–10、H₂ 0.1–5 ppm、5 项。
     */
    id: 'measure/nh3-gas-impurities',
    name: '氨中 O₂/N₂/CO/CO₂/H₂测量',
    produces: [
      {
        item: 'mat/nh3-o2-co-co2-n2-h2-record',
        qty: q(1),
        gives: [
          { param: 'oxygen', kind: 'range', min: 0.2, max: 5 },
          { param: 'nitrogen', kind: 'range', min: 0.2, max: 5 },
          { param: 'carbonMonoxide', kind: 'range', min: 0.5, max: 10 },
          { param: 'carbonDioxide', kind: 'range', min: 1, max: 10 },
          { param: 'hydrogen', kind: 'range', min: 0.1, max: 5 },
          { param: 'speciesCount', kind: 'range', min: 5, max: 5 },
          { param: 'uncertainty', kind: 'range', min: 2, max: 4 },
          { param: 'uCO', kind: 'range', min: 15, max: 30 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ammonia-electronic', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/nh3-standard-gas', qty: q(1, 100) }] },
      { anyOf: [{ item: 'plant/nh3-absorber', qty: q(1) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/co2', qty: q(1, 5000) }] },
      { anyOf: [{ item: 'mat/co', qty: q(1, 5000) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/mfc'],
    steps: [
      {
        note_zh: '① 装阱与预平衡：5 mL 环、20 mL/min 走 1–2 h；O₂/CO/N₂/H₂ 3 min 即稳，CO₂ 要等酸膜溶满（4.5–6.7 µmol）',
        performedBy: 'plant/gc-tcd',
        under: [{ param: 'pressure', min: 1.2e5, max: 1.6e5 }],
      },
      {
        note_zh: '② 氩载 20 mL/min、5A 柱 50 °C：H₂ 2.0 min 出峰；Δλ 0.169 W/(m·K)，0.1–5 ppm',
        performedBy: 'plant/gc-tcd',
        under: [{ param: 'temperature', min: 40, max: 80 }],
      },
      {
        note_zh: '③ 氢载 20 mL/min、5A 柱 50 °C：O₂ 4.1 / N₂ 5.6 / CO 12.5 min；Ar 载气下 Δλ 只有 0.007–0.008，差 20 倍，必须换氢',
        performedBy: 'plant/gc-tcd',
        under: [{ param: 'temperature', min: 40, max: 80 }],
      },
      {
        note_zh: '④ 氢载、硅胶柱 80 °C：CO₂ 6.8 min；1 ppm 档要 5–6 h 预平衡（缺口③），3–10 ppm 1–2 h',
        performedBy: 'plant/gc-tcd',
        under: [{ param: 'temperature', min: 60, max: 100 }],
      },
      {
        note_zh: '⑤ 积分与外标：保留时间定性、峰高外标（1/10/100 ppm 动态配气，Ar/H₂ 两路 MFC 稀释）；CO 只报半定量 ±30–50 %（标气源 30–99 %）；5 项加和 ≤10 ppm 判 99.999 %；标气外标改用 mat/nh3-standard-gas（10/100 ppm 三点，U 1–1.5 %）⇒ O₂/N₂/CO₂/H₂ 的 U 从 5–10 % 收到 2–4 %；CO 仍 15–30 %（CO 标气源只有 30–99 %，压不下去）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(4) },
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...NH3_GAS_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...NH3_GAS_MEASURE_ROUTES];
