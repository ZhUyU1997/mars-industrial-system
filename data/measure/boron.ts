/**
 * 硼 —— **测量与记录那一半**（R13：只放 data/measure/）。
 *
 * ⚠️ **分工（R13）**：本文件只放 **1 条测量路线 + 1 个记录条目**；树脂、无硼台、
 * 高分辨磁扇与它们的零件在 `data/machine/boron.ts`（导出名 `BORON_HW_ITEMS` /
 * `BORON_HW_ROUTES`），按 id 跨文件解析 —— 两文件在同一次 data 装配里注册，
 * 数据层只引 id，没有跨文件 import。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、这条路线把 B 从 3–10 ppb 压到 0.02 ppb 的账
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① 赶硅：10 g TCS 水解 + HF 蒸干（SiF₄ −86 °C 走掉）→ 10 mL 溶液
 *   ② 树脂富集：0.5 g 二醇季铵树脂闭口摇 30 min（B 吸附 >95 %）、
 *      0.5 mL 0.5 M 亚沸 HNO₃ 洗脱 = **20×**
 *   ③ HR-ICP-MS：R = 4000 下 ¹¹B（与 ¹²C 尾分开），溶液 5–25 ppt
 *   ④ 空白：无硼台 + 亚沸酸 + PTFE ⇒ **0.02–0.05 ppb**（地板）
 *
 *   ⇒ 样品检出限 **0.02 ppb**、定量下限 0.05–0.1 ppb；
 *     对 TCS 的 ≤0.1 ppb 判据：**5 倍余量**（原来 3–10 ppb 差 30–100 倍）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、推导与缺口在哪
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   树脂为什么不是 IRA-743（没有葡萄糖）、无硼台为什么必须是 PTFE（硼硅玻璃
 *   3–4 % 硼）、磁扇为什么常导就够（m/z 11 只要 0.14 T、铁 2.5–4 t）、
 *   八条缺口（formose 缺、PFA 缺、R=10000 的缝与场稳定度、铁 2–3 t/炉……）
 *   —— 全在 `data/machine/boron.ts` 的文件头 §一–§五，这一份不重复抄。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { BORON_MEASURE_ITEMS, BORON_MEASURE_ROUTES } from '../../data/measure/boron.ts';
 *   items: [...BORON_MEASURE_ITEMS] · routes: [...BORON_MEASURE_ROUTES]
 *
 * ⚠️ 同时要注册 `data/machine/boron.ts`（HW 两行）；只注册这一半，
 * `plant/hr-icp-ms` 等会 `unknown_item`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、记录条目（R12 的收窄产物）
// ═══════════════════════════════════════════════════════════════════════════

export const BORON_MEASURE_ITEMS: readonly Item[] = [
  /**
   * **硼记录。一份对应一批。**
   *
   *   boron       0.02–10 ppb（样品当量；富集 20×、R=4000）
   *   resolution  4000（本批实测；R=4000–8000 由缝宽决定）
   *   blankBoron  0.02–0.05 ppb（无硼台 + 亚沸酸 + PTFE，开盖 10 min）
   *
   * ⚠️ 单点分辨率记 4000 是**本批工作点**，不是机器上限（上限 8000）。
   * ⚠️ 空白 0.05 ppb 是开盖 10 min 的值；开盖 1 h 会到 0.3–3 ppb。
   */
  {
    id: 'mat/boron-record',
    name: '硼含量记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'boron', kind: 'range', min: 0.02, max: 0.1, unit: 'ppb' },
      { param: 'resolution', kind: 'range', min: 4000, max: 10000, unit: 'M/ΔM', dir: 'atLeast' },
      { param: 'blankBoron', kind: 'range', min: 0, max: 0.1, unit: 'ppb', dir: 'atMost' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、测量路线（R12：窗口在这里从仪器能力收窄成记录）
// ═══════════════════════════════════════════════════════════════════════════

export const BORON_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **痕量硼：赶硅 → 树脂富集 → HR-ICP-MS（¹¹B, R=4000）。**
     *
     *   10 g 电子级 TCS + 树脂 0.5 g + 亚沸酸 → 记录 1 份
     *
     * 五步（4 h 前处理 + 1 h 机时）：
     *
     *   ① 水解/赶硅：冰水浴水解（SiHCl₃ + 3H₂O → H₂SiO₃ + 3HCl），加 0.5 g HF 与
     *      亚沸 HNO₃，80 °C 蒸到近干（SiF₄ −86 °C），超纯水复溶 10 mL，稀氨调 pH 6–8
     *   ② 树脂富集：0.5 g 树脂 + 10 mL 样**闭口**摇 30 min，滤出，0.5 mL 0.5 M 亚沸
     *      HNO₃ 洗脱 = 20×
     *   ③ HR-ICP-MS：¹¹B、R=4000、炬箱 1 atm、分析腔 1e-4–1e-3 Pa
     *   ④ 外标：0.02/0.1/1/10 ppb（亚沸酸基体），内标 ⁹Be？—— 不，Be 与 ¹⁰B 干扰，
     *      内标用 ⁶Li（6.015，与 ¹⁰B 的 10.013 差 4 u；本层没有锂标液，缺一格）
     *   ⑤ 空白与判读：同一批做 3 个空白（台面开盖 10 min），B 空白 ≤0.05 ppb
     */
    id: 'measure/trace-boron',
    name: '硼含量测量',
    produces: [
      {
        item: 'mat/boron-record',
        qty: q(1),
        gives: [
          // 收窄到电子级 TCS 的 B 给出窗 0.01–0.1 ppb（原 0.02–10 是仪器量程）。
          { param: 'boron', kind: 'range', min: 0.02, max: 0.1 },
          { param: 'resolution', kind: 'range', min: 4000, max: 4000 },
          { param: 'blankBoron', kind: 'range', min: 0.02, max: 0.05 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/trichlorosilane-electronic', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 2000) }] },
      { anyOf: [{ item: 'mat/nitric-acid-subboiled', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/boron-selective-resin', qty: q(1, 2000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(7, 10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/mfc'],
    steps: [
      {
        note_zh: '① 水解/赶硅：10 g TCS 冰水浴水解，+0.5 g HF +20 g 亚沸 HNO₃，80 °C 蒸到近干（SiF₄ −86 °C），超纯水复溶 10 mL，稀氨调 pH 6–8',
        performedBy: 'plant/boron-free-bench',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '② 树脂富集：0.5 g 二醇季铵树脂 + 10 mL 样，**闭口**摇 30 min（B 吸附 >95 %），滤出树脂，0.5 mL 0.5 M 亚沸 HNO₃ 洗脱 = 20×',
        performedBy: 'plant/boron-free-bench',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '③ HR-ICP-MS 进样与等离子体：¹¹B、炬箱 1 atm、Ar 15 L/min、1.2–1.6 kW；R=4000（缝 15 µm）',
        performedBy: 'plant/hr-icp-ms',
        under: [{ param: 'pressure', min: 9e4, max: 1.1e5 }],
      },
      {
        note_zh: '④ 磁扇分析：8 kV 加速、B=0.14 T（m/z 11）、分析腔 1e-4–1e-3 Pa；¹²C 尾压到 1e-6 量级，¹¹B 峰不被垫高',
        performedBy: 'plant/hr-icp-ms',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh: '⑤ 外标与空白：0.02/0.1/1/10 ppb 五点（亚沸酸基体）；同批 3 个空白（台面开盖 10 min）≤0.05 ppb；报 B 0.02–10 ppb',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(5) },
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...BORON_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...BORON_MEASURE_ROUTES];
