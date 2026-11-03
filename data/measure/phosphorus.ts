/**
 * 痕量 P 的测量与记录（R13：只放 data/measure/）。
 *
 * ⚠️ **分工（R13）**：本文件只放 **1 条测量路线 + 1 个记录条目**；O₂ 反应池与膜去溶在
 * `data/machine/phosphorus.ts`（`PHOS_ITEMS` / `PHOS_ROUTES`），HR-ICP-MS 在
 * `data/machine/boron.ts`，无硼实验室在 `data/material/pfa.ts` —— 按 id 跨文件解析。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、P 从 1–4 ppb 到 0.02–0.08 ppb 的账
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   原状：³¹P⁺ 30.9738 被 ¹⁵N¹⁶O⁺ 30.9950（Δ 0.0213 u）与 ¹⁴N¹⁶O¹H⁺ 31.0058
 *   （Δ 0.0321 u）压着；H₂ 池只降 10–50×，R=4 000 的峰尾还留 100–1 000 cps ⇒ 1–4 ppb。
 *
 *   本路线两条通道**同时测**：
 *     m/z 31（P⁺）：膜去溶把 NO 降 10–20×，R=10 000 的尾再降 10× ⇒ 0.02–0.05 ppb
 *     m/z 47（P¹⁶O⁺）：O₂ 池转化 70–85 %，NO 不在 47 上 ⇒ 干净通道，0.02–0.08 ppb
 *   两通道差 <20 % 才报；47 上的 ⁴⁷Ti 用 ⁴⁹Ti 反算扣除（Ti 允许到 0.5 ppb）。
 *
 *   B 仍走 m/z 11、不进池 ⇒ **B 0.01–0.05 ppb 不受影响**；20 元素面板窗口不变。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、窗口与判据
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   P **0.02–10 ppb**（定量下限 0.02–0.08；31 与 47 双通道）
 *   回收 **95–105 %**（⁶Li 内标 + P 标准加入）
 *   Ti **≤0.05 ppb**（不校正时）/ ≤0.5 ppb（用 ⁴⁹Ti 校正时）
 *   B **0.01–0.05 ppb**（同批验证 B 不掉）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、缺口（带数，推导在 machine 文件 §四）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① P 在膜上的记忆：0.1 ppb 样后要洗 60–120 s，否则下一个样高 10–30 %。
 *   ② O₂ 池把信号挪走 15–30 %（转化率 70–85 %），两通道差 <20 % 才报。
 *   ③ ⁴⁷Ti 校正依赖 47/49 = 1.383 的天然比；Ti 同位素分馏会让校正偏 1–3 %。
 *   ④ 31 通道在 C 高时还有 ³⁰Si¹H⁺（29.9738 + 1.0078 = 30.9816，Δ 0.0078 u，R 3 970
 *      才分开）—— 溶液里 Si 要 <0.1 ppm（赶硅那一步负责）。
 *   ⑤ 只解决 P；20 元素面板不变（膜去溶顺带把氧化物 MO⁺ 降 5–20×，但窗口不动）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { PHOS_MEASURE_ITEMS, PHOS_MEASURE_ROUTES } from '../../data/measure/phosphorus.ts';
 *   items: [...PHOS_MEASURE_ITEMS] · routes: [...PHOS_MEASURE_ROUTES]
 *
 * ⚠️ 同时要注册 `data/machine/phosphorus.ts`（HW 两行）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PHOS_MEASURE_ITEMS: readonly Item[] = [
  /**
   * **磷记录。一份对应一批。**
   *
   *   phosphorus 0.02–10 ppb（双通道：31 膜去溶 + 47 O₂ 池）
   *   boron      0.01–0.05 ppb（同批验证 B 不掉）
   *   titanium   0.01–0.05 ppb（⁴⁹Ti 反算 ⁴⁷Ti 之后）
   *   recovery   95–105 %
   */
  {
    id: 'mat/phosphorus-record',
    name: 'Phosphorus Record', name_zh: '磷记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'phosphorus', kind: 'range', min: 0.02, max: 0.1, unit: 'ppb' },
      { param: 'boron', kind: 'range', min: 0.005, max: 0.2, unit: 'ppb' },
      { param: 'titanium', kind: 'range', min: 0, max: 0.1, unit: 'ppb', dir: 'atMost' },
      { param: 'recovery', kind: 'range', min: 0.9, max: 1.1, unit: '1' },
    ],
  },
];

export const PHOS_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **痕量 P：赶硅 → 膜去溶 → O₂ 池 → R=10000 双通道（31/47）。**
     *
     *   10 g 电子级 TCS + O₂ 0.3 mL/min + ⁶Li 内标 → 记录 1 份
     *
     * 五步（4 h 前处理 + 1.5 h 机时）：
     *   ① 赶硅：水解 + HF + 亚沸 HNO₃ 蒸干，复溶 10 mL（Si <0.1 ppm，防 ³⁰Si¹H⁺）
     *   ② 膜去溶：120–160 °C、0.5 mL/min、N₂ 3 L/min、效率 93–98 %
     *   ③ 等离子体 + O₂ 池：池长 150 mm、O₂ 0.3 mL/min、转化 70–85 %
     *   ④ 磁扇：R=10 000、m/z 31 与 47 双通道、⁴⁹Ti 监控
     *   ⑤ 外标与判读：0.02/0.1/1/10 ppb P；回收 95–105 %；31 与 47 差 <20 %
     */
    id: 'measure/trace-phosphorus',
    name: 'Phosphorus Measurement', name_zh: '磷测量',
    produces: [
      {
        item: 'mat/phosphorus-record',
        qty: q(1),
        gives: [
          // 收窄到电子级 TCS 的 P 给出窗 0.01–0.1 ppb（原 0.02–10 是仪器量程）。
          { param: 'phosphorus', kind: 'range', min: 0.02, max: 0.1 },
          { param: 'boron', kind: 'range', min: 0.01, max: 0.05 },
          { param: 'titanium', kind: 'range', min: 0.01, max: 0.05 },
          { param: 'recovery', kind: 'range', min: 0.95, max: 1.05 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/trichlorosilane-electronic', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 2000) }] },
      { anyOf: [{ item: 'mat/nitric-acid-subboiled', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(7, 10) }] },
      { anyOf: [{ item: 'mat/lithium-6-enriched', qty: q(1, 10000) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/mfc', 'plant/icp-ms/oxygen-cell'],
    steps: [
      {
        note_zh: '① 赶硅：10 g TCS 冰水浴水解，+0.5 g HF +20 g 亚沸 HNO₃，80 °C 蒸到近干，复溶 10 mL（Si <0.1 ppm，否则 ³⁰Si¹H⁺ 在 30.9816 拖尾）',
        performedBy: 'plant/boron-free-lab',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '② 膜去溶：0.5 mL/min、120–160 °C、N₂ 3 L/min、去溶 93–98 %（H₂O 从 2–5 % 到 0.05–0.2 %）',
        performedBy: 'plant/membrane-desolvator',
        under: [{ param: 'temperature', min: 120, max: 160 }],
      },
      {
        note_zh: '③ 等离子体 + O₂ 池：Ar 15 L/min、1.2–1.6 kW；池长 150 mm、O₂ 0.3 mL/min、³¹P→³¹P¹⁶O⁺ 转化 70–85 %',
        performedBy: 'plant/hr-icp-ms',
        under: [{ param: 'pressure', min: 9e4, max: 1.1e5 }],
      },
      {
        note_zh: '④ 磁扇双通道：R=10 000、缝 10–15 µm；m/z 31（P⁺，NO 尾 <1 %）与 47（P¹⁶O⁺，干净）；⁴⁹Ti 反算 ⁴⁷Ti',
        performedBy: 'plant/hr-icp-ms',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh: '⑤ 外标与判读：0.02/0.1/1/10 ppb P 标准加入；31 与 47 差 <20 % 才报；回收 95–105 %；同批 B 0.01–0.05 ppb 验证不掉',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(11, 2) },
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PHOS_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PHOS_MEASURE_ROUTES];
