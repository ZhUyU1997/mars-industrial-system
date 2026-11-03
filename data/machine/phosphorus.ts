/**
 * 痕量 P：膜去溶 + O₂ 反应池 —— 仪器与零件那一半（R13）。
 *
 * ⚠️ **分工（R13）**：本文件放**仪器 / 零件**与它们的 `make/*` 路线；测量路线与记录在
 * `data/measure/phosphorus.ts`（`PHOS_MEASURE_ITEMS` / `PHOS_MEASURE_ROUTES`），按 id
 * 跨文件解析，没有跨文件 import。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、补的是 `data/machine/trace-analysis.ts` §八 缺口 ②：P 1–4 ppb，要 ≤0.1 ppb
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 两个瓶颈，两件东西：
 *
 *   ① **³¹P⁺ 与 ¹⁵N¹⁶O⁺ / ¹⁴N¹⁶O¹H⁺ 撞在同一个质量上** —— O₂ 反应池把 P⁺ 变成
 *      P¹⁶O⁺（m/z 47），NO 不跟 O₂ 反应，干扰整个挪开。
 *   ② **NO 的前驱是硝酸与空气** —— 膜去溶把溶剂负载砍掉 90–99 %，NO⁺ 降 10–20×，
 *      溶液检出限推 5–20×。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、质量差与分辨要求（算清）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ³¹P⁺            30.973762
 *   ¹⁵N¹⁶O⁺        30.995024   （¹⁵N 15.000109 + ¹⁶O 15.994915）
 *   ¹⁴N¹⁶O¹H⁺      31.005814   （+ ¹H 1.007825）
 *
 *   Δ(P, ¹⁵NO)  = **0.0213 u** ⇒ 峰位分开只要 R = 30.995/0.0213 ≈ **1 460**
 *   Δ(P, ¹⁴NOH) = **0.0321 u** ⇒ R ≈ **970**
 *   但 1 % HNO₃ 基体的 NO⁺ 有 10⁵–10⁶ cps，**峰尾**才是问题：
 *     R=4 000 ：峰宽 0.0077 u，NO 在 2.8 个峰宽外 ⇒ 尾 1e-3–1e-4 ⇒ **100–1 000 cps**
 *               而 0.02 ppb P 只有 ~200 cps（1e4 cps/ppb）⇒ 偏差 50–500 %
 *     R=10 000：峰宽 0.0031 u，NO 在 6.9 个峰宽外 ⇒ 尾 1e-6–1e-7 ⇒ 0.1–1 cps ⇒ **<1 %**
 *   ⇒ 直接测 m/z 31 要 **R 10 000 + 膜去溶**（NO 再降 10–20×）才能到 0.02–0.05 ppb。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、O₂ 反应池：把 P 挪到 m/z 47
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ³¹P⁺ + O₂ → ³¹P¹⁶O⁺ + O（放热、无势垒，k ≈ 1×10⁻¹⁰ cm³/s）
 *   池里 O₂ 1×10¹³–10¹⁴ cm⁻³、停留 0.5–2 ms ⇒ 转化率 **70–85 %**（设计 60–90 %）
 *   NO⁺ 不与 O₂ 反应（NO 已是氧化物），**m/z 47 上没有 NO**
 *
 *   第二次干扰：**⁴⁷Ti⁺**（丰度 7.44 %）与 ³¹P¹⁶O⁺ 完全重合。两条路：
 *     · Ti <0.05 ppb：47Ti 的贡献 = 0.05 × 0.0744 = **3.7×10⁻³ ppb**，是 0.02 ppb P 的 18 %
 *     · **监控 ⁴⁹Ti（5.4 %）反算 ⁴⁷Ti 再扣**：47/49 的天然比 7.44/5.38 = 1.383，
 *       Ti 到 0.5 ppb 也能把 47 上的钛扣到 1 % 以内（本路线用这条，Ti 只要求 <0.5 ppb）
 *
 *   ⇒ P 走 47、Ti 用 49 校正、B 仍在 11 测（不进池）⇒ **B 不受影响**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、膜去溶：把 NO 的前驱拿掉
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   PTFE 中空纤维束 200–400 根、膜面积 0.1–0.5 m²、120–160 °C、N₂ 吹扫 1–5 L/min
 *   水/硝酸蒸气穿膜被吹走，气溶胶只剩干颗粒 ⇒ 进入等离子体的 H₂O 从 2–5 % 降到
 *   0.05–0.2 %、HNO₃ 从 1 % 降到 0.02–0.1 %
 *   去溶效率 **90–99 %**；样品流 0.1–1 mL/min；死体积 0.5–2 mL（洗出 30–60 s）
 *
 *   代价：① 记忆效应比雾化室大（P 的洗出 60–120 s）；② 高盐会堵膜，TCS 水解液要
 *   先赶硅（本链在 `data/measure/phosphorus.ts` 第①步）；③ 膜 3–6 个月换一次。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、缺口（带数）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① O₂ 池把 P 的信号挪走 70–85 %，灵敏度掉到 15–30 %（同样浓度 47 上的计数是 31 的
 *     0.7–0.85 倍，但 31 上本来被 NO 压着）⇒ 两条通道**同时测**：31 看低 NO，47 看干净。
 *  ② ⁴⁷Ti 的天然比校正依赖 47/49 = 1.383 ± 0.001；样品里 Ti 的同位素比若被动过
 *     （浓缩/分馏），校正失效 —— TCS 的 Ti 是掺杂级，风险低。
 *  ③ 膜去溶的 P 记忆：0.1 ppb 样之后空白要洗 60–120 s，否则下一个样高 10–30 %。
 *  ④ 膜在 160 °C 以上会蠕变，120–160 °C 是窗口；温度低 10 °C 去溶效率掉 5–10 个点。
 *  ⑤ 只解决 P（和顺带 5–20× 的氧化物）；20 元素面板的窗口不变。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { PHOS_ITEMS, PHOS_ROUTES } from '../../data/machine/phosphorus.ts';
 *   import { PHOS_MEASURE_ITEMS, PHOS_MEASURE_ROUTES } from '../../data/measure/phosphorus.ts';
 *   items:  [...PHOS_ITEMS, ...PHOS_MEASURE_ITEMS]
 *   routes: [...PHOS_ROUTES, ...PHOS_MEASURE_ROUTES]
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PHOS_ITEMS: readonly Item[] = [
  /**
   * **O₂ 反应池：石英池管 100–200 mm + 316L 壳 + O₂ 入口。**
   *
   *   length     100–200 mm（停留 0.5–2 ms）
   *   o2Flow     0.1–1 mL/min（池里 1×10¹³–10¹⁴ cm⁻³）
   *   conversion 60–90 %（³¹P⁺ → ³¹P¹⁶O⁺）
   *   volume     10–50 mL
   */
  {
    id: 'plant/icp-ms/oxygen-cell',
    name: 'O₂ 反应池',
    unit: '件',
    category: 'part',
    props: [
      { param: 'length', kind: 'range', min: 100, max: 200, unit: 'mm' },
      { param: 'o2Flow', kind: 'range', min: 0.1, max: 1, unit: 'mL/min' },
      { param: 'conversion', kind: 'range', min: 60, max: 90, unit: '%', dir: 'atLeast' },
      { param: 'volume', kind: 'range', min: 10, max: 50, unit: 'mL' },
    ],
  },

  /**
   * **膜去溶整机：PTFE 中空纤维束 + 加热块 + N₂ 吹扫。holds 120–160 °C。**
   *
   *   desolvation 90–99 %（H₂O 从 2–5 % 降到 0.05–0.2 %）
   *   area        0.1–0.5 m²
   *   sampleFlow  0.1–1 mL/min · sweepFlow 1–5 L/min
   *   deadVolume  0.5–2 mL（洗出 30–60 s）
   */
  {
    id: 'plant/membrane-desolvator',
    name: '膜去溶整机',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'temperature', min: 120, max: 160 }],
    props: [
      { param: 'desolvation', kind: 'range', min: 90, max: 99, unit: '%', dir: 'atLeast' },
      { param: 'area', kind: 'range', min: 0.1, max: 0.5, unit: 'm²' },
      { param: 'sampleFlow', kind: 'range', min: 0.1, max: 1, unit: 'mL/min' },
      { param: 'sweepFlow', kind: 'range', min: 1, max: 5, unit: 'L/min' },
      { param: 'deadVolume', kind: 'range', min: 0.5, max: 2, unit: 'mL', dir: 'atMost' },
    ],
  },

  /**
   * **膜组件：PTFE 中空纤维 200–400 根、0.1–0.5 m²、孔径 0.05–0.2 µm。**
   *
   *   area    0.1–0.5 m² · poreDia 0.05–0.2 µm · length 0.3–0.6 m · fibers 200–400
   */
  {
    id: 'plant/membrane-desolvator/membrane',
    name: '膜去溶膜组件',
    unit: '件',
    category: 'part',
    props: [
      { param: 'area', kind: 'range', min: 0.1, max: 0.5, unit: 'm²' },
      { param: 'poreDia', kind: 'range', min: 0.05, max: 0.2, unit: 'µm' },
      { param: 'length', kind: 'range', min: 0.3, max: 0.6, unit: 'm' },
      { param: 'fibers', kind: 'range', min: 200, max: 400, unit: '根' },
    ],
  },

  /**
   * **去溶加热块：100–300 W、120–160 °C、稳定度 ±1–2 K。**
   */
  {
    id: 'plant/membrane-desolvator/heater',
    name: '膜去溶加热块',
    unit: '件',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 100, max: 300, unit: 'W' },
      { param: 'temperature', kind: 'range', min: 120, max: 160, unit: '°C' },
      { param: 'stability', kind: 'range', min: 1, max: 2, unit: 'K', dir: 'atMost' },
    ],
  },
];

export const PHOS_ROUTES: readonly Route[] = [
  {
    /**
     * **O₂ 池：石英池管 → 316L 壳 → O₂ 入口 → 测转化率。**
     *
     *   石英 0.02 + 316L 0.2 + PTFE 0.01 → 池 1 件（150 mm、0.2–0.8 mL/min、70–85 %）
     */
    id: 'make/icp-ms-oxygen-cell',
    name: 'O₂ 反应池制造',
    produces: [
      {
        item: 'plant/icp-ms/oxygen-cell',
        qty: q(1),
        gives: [
          { param: 'length', kind: 'range', min: 150, max: 180 },
          { param: 'o2Flow', kind: 'range', min: 0.2, max: 0.8 },
          { param: 'conversion', kind: 'range', min: 70, max: 85 },
          { param: 'volume', kind: 'range', min: 20, max: 40 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 拉 φ8 石英池管（150–180 mm）与车 316L 外壳', performedBy: 'plant/glass-lathe', under: [{ param: 'temperature', min: 1900, max: 2200 }] },
      { note_zh: '② 装 O₂ 入口与 PTFE 密封；流量 0.2–0.8 mL/min（`plant/mfc` 标）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 转化率测试：1 ppb P 标液，31 与 47 两通道比，70–85 % 判合格', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(12) },
    unbalanced_zh: '石英 0.02 + 316L 0.2 + PTFE 0.01 → O₂ 池 1 件；按件计',
  },

  {
    /**
     * **膜组件：PTFE 管拉伸成 0.05–0.2 µm 孔 → 束 200–400 根 → 环氧封头。**
     *
     *   PTFE 0.5 + 环氧 0.05 → 膜组件 1 件
     */
    id: 'make/membrane-desolvator-membrane',
    name: '膜去溶膜组件制造',
    produces: [
      {
        item: 'plant/membrane-desolvator/membrane',
        qty: q(1),
        gives: [
          { param: 'area', kind: 'range', min: 0.2, max: 0.4 },
          { param: 'poreDia', kind: 'range', min: 0.08, max: 0.15 },
          { param: 'length', kind: 'range', min: 0.4, max: 0.5 },
          { param: 'fibers', kind: 'range', min: 250, max: 350 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 挤 PTFE 管 φ1.0/0.6 mm，260–300 °C 拉伸成 0.05–0.2 µm 的微孔膜', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 260, max: 300 }] },
      { note_zh: '② 束 250–350 根、环氧封头、切面开孔（扫描电镜查堵孔 <2 %）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(20) },
    unbalanced_zh: 'PTFE 0.5 + 酚醛 0.05 → 膜组件 1 件；余是拉断的纤维与封头切屑（按件计）',
  },

  {
    /**
     * **加热块：100–300 W 加热棒 + 热电偶 + 氧化铝绝缘。**
     */
    id: 'make/membrane-desolvator-heater',
    name: '膜去溶加热块制造',
    produces: [
      {
        item: 'plant/membrane-desolvator/heater',
        qty: q(1),
        gives: [
          { param: 'power', kind: 'range', min: 150, max: 250 },
          { param: 'temperature', kind: 'range', min: 130, max: 150 },
          { param: 'stability', kind: 'range', min: 1, max: 1.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 50) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(6) },
    unbalanced_zh: '电阻丝 0.02 + 氧化铝 2 + 热电偶 1 → 加热块 1 件（按件计）',
  },

  {
    /**
     * **膜去溶装配：膜组件 + 加热块 + 316L 壳 + N₂ 吹扫口。**
     *
     *   膜组件 1 + 加热块 1 + 316L 2 + 接触器 1 → 去溶器 1 台
     */
    id: 'make/membrane-desolvator',
    name: '膜去溶装配',
    produces: [
      {
        item: 'plant/membrane-desolvator',
        qty: q(1),
        gives: [
          { param: 'desolvation', kind: 'range', min: 93, max: 98 },
          { param: 'area', kind: 'range', min: 0.2, max: 0.4 },
          { param: 'sampleFlow', kind: 'range', min: 0.2, max: 0.8 },
          { param: 'sweepFlow', kind: 'range', min: 2, max: 4 },
          { param: 'deadVolume', kind: 'range', min: 0.8, max: 1.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/membrane-desolvator/membrane', qty: q(1) }] },
      { anyOf: [{ item: 'plant/membrane-desolvator/heater', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(2) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '① 装膜组件与加热块、316L 壳；N₂ 吹扫口与样品口分开（防短路）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 120–160 °C 烘干 2 h（加热块自身回路，未写 under 防 condition_cycle）', performedBy: 'plant/robot' },
      { note_zh: '③ 效率测试：1 % HNO₃ 以 0.5 mL/min 过膜，称量冷凝水，去溶 93–98 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(14) },
    unbalanced_zh: '膜组件 1 + 加热块 1 + 316L 2 + 接触器 1 → 去溶器 1 台（按件计）',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PHOS_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PHOS_ROUTES];
