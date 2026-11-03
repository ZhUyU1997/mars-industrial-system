/**
 * 氨的 CH₄ / 总烃 / H₂S（+CO/CO₂）—— **测量与记录那一半**（R13：只放 data/measure/）。
 *
 * ⚠️ **分工（R13）**：本文件只放 **1 条测量路线 + 1 个记录条目**；仪器与零件
 * （`plant/fid`、`plant/methanizer`、`plant/fpd`、`std/sipm-1mm-general`、
 * `mat/nickel-catalyst` 及其零件）与它们的 `make/*` 路线在 `data/machine/nh3-ch4.ts`
 * （导出名 `NH3_CH4_HW_ITEMS` / `NH3_CH4_HW_ROUTES`），按 id 跨文件解析 ——
 * 两文件在同一次 data 装配里注册，数据层只引 id，没有跨文件 import。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、三项（+两项）各测到哪
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   CH₄      0.1–10 ppm    FID、5 mL 环、N₂ 载 20 mL/min（方法检出限 0.1；
 *                          纯仪器 0.01–0.05，见 machine 文件 §一）
 *   总烃     0.1–10 ppm    同一台 FID，无柱直通；按 CH₄ 折算，重烃响应因子差 ±20 %
 *   H₂S      0.1–5 ppm     FPD、394 nm + SiPM；测的是**总硫（以 H₂S 计）**，不分柱
 *   CO       0.1–10 ppm    Ni 转化炉 → CH₄ → FID，±5–10 %（`mat/co-high-purity`；
 *                          旧 `mat/co` 30–99 % 只能 ±30–50 % 半定量）
 *   CO₂      0.1–10 ppm    同上
 *
 * 上游的 NH₃ 先过 `plant/nh3-absorber`（`data/machine/nh3-gas.ts` 的阱）：NH₃ 被
 * 85 % 磷酸吸掉，H₂S 回收 >95 %、CH₄ >99 %；CO₂ 在阱里要 1–2 h 预平衡（同一条缺口）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、推导与缺口在哪
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   FID 的碳质量→电流账（10 mC/g C、1 pg C/s = 1e-14 A）、为什么没有真空 PMT
 *   （Cs/Sb 两条料链 0 条目 ⇒ 用 SiPM，增益 1e6 同级）、Ni 转化炉的毒化账
 *   （1 ppm H₂S 下 1 900 h 饱和、按 500 h 换）—— 全在 `data/machine/nh3-ch4.ts`
 *   的文件头 §一–§五，这一份不重复抄。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { NH3_CH4_MEASURE_ITEMS, NH3_CH4_MEASURE_ROUTES } from '../../data/measure/nh3-ch4.ts';
 *   items: [...NH3_CH4_MEASURE_ITEMS] · routes: [...NH3_CH4_MEASURE_ROUTES]
 *
 * ⚠️ 同时要注册 `data/machine/nh3-ch4.ts`（HW 两行）；只注册这一半，`plant/fid` 等
 * 会 `unknown_item`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、记录条目（R12 的收窄产物）
// ═══════════════════════════════════════════════════════════════════════════

export const NH3_CH4_MEASURE_ITEMS: readonly Item[] = [
  /**
   * **氨中 CH₄ / 总烃 / H₂S（+CO/CO₂）记录。一份对应一批。**
   *
   *   methane           0.1–10 ppm    FID（方法检出限 0.1）
   *   totalHydrocarbons 0.1–10 ppm    FID 直通（按 CH₄ 折算）
   *   hydrogenSulfide   0.1–5 ppm     FPD 394 nm + SiPM，PTFE 柱 0.8 min
   *   methylMercaptan   0.1–5 ppm     CH₃SH，2.4 min
   *   carbonylSulfide   0.1–5 ppm     COS，1.5 min
   *   carbonDisulfide   0.1–5 ppm     CS₂，3.8 min
   *   carbonMonoxide    0.1–10 ppm    Ni 转化炉 → FID，±5–10 %（高纯 CO 标气）
   *   uCO              5–10 %        CO 的配气/全方法不确定度（高纯 CO 标气）
   *   carbonDioxide     0.1–10 ppm    同上
   *   method            fid / fpd（哪些项用哪台）
   *
   * ⚠️ 分种靠 `plant/fpd/ptfe-column`（0.5 m、60–80 目 PTFE + 8 % PEG-20M）：
   * 保留时间 H₂S 0.8 / COS 1.5 / CH₃SH 2.4 / CS₂ 3.8 min，分离度 3.2 / 3.3 / 4.2（≥1.5）。
   * ⚠️ CO/CO₂ 两格是转化炉的存在理由（`data/machine/nh3-ch4.ts` §三）；不要的话
   *    删这两格 + 测量路线第 ④ 步即可，其余不动。
   */
  {
    id: 'mat/nh3-ch4-h2s-record',
    name: 'Ammonia CH₄ / Total Hydrocarbons / H₂S Record', name_zh: '氨中 CH₄ / 总烃 / H₂S记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'methane', kind: 'range', min: 0.05, max: 20, unit: 'ppm' },
      { param: 'hydrogenSulfide', kind: 'range', min: 0.05, max: 10, unit: 'ppm' },
      { param: 'methylMercaptan', kind: 'range', min: 0.05, max: 10, unit: 'ppm' },
      { param: 'carbonylSulfide', kind: 'range', min: 0.05, max: 10, unit: 'ppm' },
      { param: 'carbonDisulfide', kind: 'range', min: 0.05, max: 10, unit: 'ppm' },
      { param: 'totalHydrocarbons', kind: 'range', min: 0.05, max: 20, unit: 'ppm' },
      { param: 'carbonMonoxide', kind: 'range', min: 0.05, max: 20, unit: 'ppm' },
      { param: 'uCO', kind: 'range', min: 5, max: 10, unit: '%', dir: 'atMost' },
      { param: 'carbonDioxide', kind: 'range', min: 0.05, max: 20, unit: 'ppm' },
      { param: 'method', kind: 'enum', values: ['fid', 'fpd'] },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、测量路线（R12：窗口在这里从仪器能力收窄成记录）
// ═══════════════════════════════════════════════════════════════════════════

export const NH3_CH4_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **氨中 CH₄ / 总烃 / H₂S（+CO/CO₂）：过阱 → 分离 → FID → 转化炉 → FPD。**
     *
     *   5 g 电子级 NH₃ + H₂/空气/N₂ 载气 → 记录 1 份
     *
     * 六步（3 h 机时 + 1 h 前处理）：
     *
     *   ① 进样：5 mL 环；样品先过 `plant/nh3-absorber`（脱 NH₃，H₂S 回收 >95 %）
     *   ② 分离：硅胶柱 70 °C、N₂ 20 mL/min；CH₄ 1.1 min、C2+ 3–8 min；总烃走直通
     *   ③ FID：H₂ 35 + 空气 350 mL/min、极化 150–200 V、检测器 300–350 °C
     *   ④ 转化炉：CO/CO₂ + H₂ 380 °C（Ni）→ CH₄，再过 FID
     *   ⑤ FPD：H₂S 不分柱、H₂ 120 + 空气 150、394 nm + SiPM 光子计数
     *   ⑥ 积分与外标（1/10/100 ppm 动态配气）
     */
    id: 'measure/nh3-sulfur-and-hydrocarbon',
    name: 'Ammonia CH₄ / Total Hydrocarbons / H₂S Measurement', name_zh: '氨中 CH₄ / 总烃 / H₂S 测量',
    produces: [
      {
        item: 'mat/nh3-ch4-h2s-record',
        qty: q(1),
        gives: [
          { param: 'methane', kind: 'range', min: 0.1, max: 10 },
          { param: 'hydrogenSulfide', kind: 'range', min: 0.1, max: 5 },
          { param: 'methylMercaptan', kind: 'range', min: 0.1, max: 5 },
          { param: 'carbonylSulfide', kind: 'range', min: 0.1, max: 5 },
          { param: 'carbonDisulfide', kind: 'range', min: 0.1, max: 5 },
          { param: 'totalHydrocarbons', kind: 'range', min: 0.1, max: 10 },
          { param: 'carbonMonoxide', kind: 'range', min: 0.1, max: 10 },
          { param: 'uCO', kind: 'range', min: 5, max: 10 },
          { param: 'carbonDioxide', kind: 'range', min: 0.1, max: 10 },
          { param: 'method', kind: 'enum', oneOf: ['fid', 'fpd'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ammonia-electronic', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/co-high-purity', qty: q(1, 1000) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/mfc', 'plant/nh3-absorber'],
    steps: [
      {
        note_zh: '① 进样：5 mL 定量环；样品先过 `plant/nh3-absorber`（85 % 磷酸脱 NH₃，H₂S 回收 >95 %、CH₄ >99 %；CO₂ 要 1–2 h 预平衡）',
        performedBy: 'plant/gc-tcd',
        under: [{ param: 'pressure', min: 1.2e5, max: 1.6e5 }],
      },
      {
        note_zh: '② 分离：硅胶柱 70 °C、N₂ 载 20 mL/min；CH₄ 1.1 min、C2+ 3–8 min；总烃档不接柱（直通 FID）',
        performedBy: 'plant/gc-tcd',
        under: [{ param: 'temperature', min: 60, max: 90 }],
      },
      {
        note_zh: '③ FID：H₂ 35 + 空气（O₂+N₂ 21:79）350 mL/min、极化 150–200 V、检测器 300–350 °C；CH₄ 0.1–10 ppm、总烃 0.1–10 ppm（按 CH₄ 折算，重烃 ±20 %）',
        performedBy: 'plant/fid',
        under: [{ param: 'temperature', min: 300, max: 350 }],
      },
      {
        note_zh: '④ 转化炉：CO/CO₂ + H₂ 过量 10 倍、380 °C、Ni/Al₂O₃（转化率 90–97 %）→ CH₄，再过 FID；CO/CO₂ 0.1–10 ppm。CO 标气改用 `mat/co-high-purity`（99.9–99.99 %），配气 ≤5 %、全方法 ±5–10 %；旧 `mat/co` 30–99 % 只能 ±30–50 %。催化剂按 500 h 换（1 ppm H₂S 下 1 900 h 饱和）',
        performedBy: 'plant/methanizer',
        under: [{ param: 'temperature', min: 360, max: 390 }],
      },
      {
        note_zh: '⑤ FPD 分种：过 `plant/fpd/ptfe-column`（0.5 m、60–80 目 PTFE + 8 % PEG-20M、60 °C、N₂ 20 mL/min）；H₂S 0.8 / COS 1.5 / CH₃SH 2.4 / CS₂ 3.8 min，分离度 3.2/3.3/4.2（≥1.5）；H₂ 120 + 空气 150、394 nm + SiPM（偏压 32–36 V、暗计数 0.2–0.8 Mcps）；各 0.1–5 ppm',
        performedBy: 'plant/fpd',
        under: [{ param: 'temperature', min: 180, max: 240 }],
      },
      {
        note_zh: '⑥ 积分与外标：保留时间定性（0.8/1.5/2.4/3.8 min）、峰高外标（各 0.1/1/5 ppm 动态配气）；CH₄ 与总烃同批、CO/CO₂ 走转化炉档（CO 用高纯 CO 标气，记 ±5–10 %）、四项硫化物走 FPD 分种档；记进 `mat/nh3-ch4-h2s-record`',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(3) },
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...NH3_CH4_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...NH3_CH4_MEASURE_ROUTES];
