/**
 * GC-MS 谱库匹配的测量与记录 —— 把 `measure/volatile-organic-gcms` 的
 * 「5 个标样 + 15 个未知峰、半定量 ±30–50 %」变成「30–50 个可定性、
 * ±15–25 %」。
 *
 * 本文件只放 `measure/*` 路线与 `*-record` 条目（R13）；谱库 `mat/gc-ms-library`
 * 与它的 `make/*` 路线在 `data/material/gc-ms-library.ts`；仪器在
 * `data/machine/trace-analysis.ts`（`plant/gc-ms`）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、这条记录补的是什么
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `measure/volatile-organic-gcms` 已经出一份 `mat/gcms-volatile-organic-record`：
 *   detectionLimit 0.1–1 ppm、compoundCount 20–30、rtRepeatability 0.5–3 %。
 *   它的问题写在 `data/machine/trace-analysis.ts` 缺口⑥：**没有谱库**，
 *   20 个目标物里 15 个只能按「1 个保留时间 + 3 个离子」半定量（±30–50 %）。
 *
 *   本记录补的是**定性那一格**：
 *
 *     compoundCount  40–50 个（可定性；5 个锚定 + 35 个库匹配）
 *     matchScore     80–100 / 100（余弦相似度；三条判据全过才写「定性」）
 *     uRI            10–20 指数单位（RI 窗口；锚点内 ±10、锚点外 ±20–30）
 *     uQuant         15–25 %（半定量的相对标准不确定度，k=1）
 *     detectionLimit 0.1–1 ppm（SIM，与既有记录同档）
 *
 *   半定量从 ±30–50 % 收到 ±15–25 % 的机理：**归属错**从 ±50–100 % 降到
 *   5–10 %（谱库 + RI 窗口 + 丰度比），合成后 ±15–25 %；剩下的 ±15–25 %
 *   是**响应因子的类间差**，它要每个化合物的纯品标样，不归谱库管
 *   （缺 15 条纯品料，见 §四②）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、判据：三条全过才叫「定性」
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① 匹配度 ≥80/100：未知峰与库谱的余弦相似度（只用 3–5 个特征离子，
 *      归一化到基峰）。四极杆 0.7–1.0 u 的单位分辨比高分辨低 5–10 分，
 *      所以门是 80 不是 NIST 的 90。
 *   ② |RI_测得 − RI_库| ≤ 20 指数单位（锚点内 ≤10；锚点外 20–30）。
 *   ③ 3 个特征离子的丰度比在 ±30 % 内（至少 2 个）—— 同分异构体（间/对二甲苯）
 *      离子表几乎相同，靠这一条与 RI 一起排除。
 *
 *   只过 ① ② 写「tentative」；三条全过写「定性」。记录里的 compoundCount
 *   只数**定性**的，tentative 另记（本文件不单开字段，写在注释里）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、测量步骤（6 h = 取样 0.5 h + 分离 1 h + 匹配 1 h + 定量 2 h + 记录 1.5 h）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① 取样/称重：液体 10 g（±0.1 mg）或 1 L 气体过活性炭管
 *   ② 分离：H₂ 1 mL/min，40 °C (3 min) → 10 °C/min → 300 °C (10 min)，39 min
 *   ③ EI 70 eV + SIM：每个目标物 3–5 个特征离子、驻留 50 ms；与库匹配
 *   ④ 定量：5 个标样外标 + RI 窗口；其余按类平均响应因子，报 uQuant
 *   ⑤ 记录：compoundCount、matchScore、uRI、uQuant、detectionLimit
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、缺口（按 R7 记量级）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **35 个库匹配物没有纯品**：定性靠匹配度 + RI，不是保留时间 + 响应因子；
 *      要全部定量，仍缺 15 条纯品料（trace-analysis 缺口⑥ 的原账）。
 *   ② **±15–25 % 的剩余项是响应因子**：5 个标样只覆盖 5 类（醇/酮/芳烃/酚/烯），
 *      其余按类平均；类间差 ±15–25 %，要纯品才能再往下。
 *   ③ **同分异构体分不开**：间/对二甲苯 RI 差 10、离子表几乎相同，库只能报
 *      「二甲苯（总和）」；要异构体分辨要 0.1–0.2 u 的高分辨（GC 双聚焦磁扇 0 台）。
 *   ④ **H₂ 载气的质量歧视**：低 m/z 抬 5–15 %，库的丰度比是 He 载气的值；
 *      ±30 % 的丰度容差吸收它，也吃掉一部分区分力。
 *   ⑤ **没有独立验证**：自建库 + 文献 RI，不是 NIST 认证；与第二台 GC-MS 的
 *      A/B 互比也没有（本层只有一台）。
 *   ⑥ **1 条测量提示是有意保留的**：`mat/gc-ms` 的 props 里没有 `matchScore`
 *      （匹配是软件，不是仪器量程），报告会记 1 条 `measure_no_cap`；这一条
 *      记录的就是「软件能力不在仪器 props 上」，不硬塞进机器。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、记录条目
// ═══════════════════════════════════════════════════════════════════════════

export const GC_LIBRARY_MEASURE_ITEMS: readonly Item[] = [
  /**
   * **谱库匹配记录。一份记录对应一批样品。**
   *
   *   compoundCount  30–50 个（可定性：5 个锚定 + 35 个库匹配；本版 40）
   *   matchScore     80–100 / 100（余弦相似度门；≥80 才收）
   *   uRI            10–20 指数单位（k=1；锚点外 20–30 记在注释）
   *   uQuant         15–25 %（半定量的相对标准不确定度，k=1）
   *   detectionLimit 0.1–1 ppm（SIM；与 `mat/gcms-volatile-organic-record` 同档）
   *
   * ⚠️ `uQuant` 是**半定量的误差**，不是检测限；它从 ±30–50 % 收到 ±15–25 %
   * 靠的是谱库把「归属错」压掉，不是仪器变好。`matchScore` 不在 `plant/gc-ms`
   * 的 props 上（匹配是软件），所以报告会记 1 条 `measure_no_cap` —— 有意保留。
   */
  {
    id: 'mat/gc-ms-library-record',
    name: 'Spectral Library Match Record', name_zh: '谱库匹配记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'compoundCount', kind: 'range', min: 30, max: 50, unit: '个' },
      { param: 'matchScore', kind: 'range', min: 80, max: 100, unit: '分', dir: 'atLeast' },
      { param: 'uRI', kind: 'range', min: 10, max: 20, unit: '指数单位', dir: 'atMost' },
      { param: 'uQuant', kind: 'range', min: 15, max: 25, unit: '%', dir: 'atMost' },
      { param: 'detectionLimit', kind: 'range', min: 0.1, max: 1, unit: 'ppm', dir: 'atMost' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、测量路线
// ═══════════════════════════════════════════════════════════════════════════

export const GC_LIBRARY_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **谱库匹配：取样 → 分离 → EI/SIM → 库匹配 → 定量 → 记录。**
     *
     *   10 g 电子级 TCS（或 NH₃）+ H₂ 0.2 g → 记录 1 份
     *   （compoundCount 40–50、matchScore 80–100、uRI 10–20、uQuant 15–25 %、
     *     detectionLimit 0.1–1 ppm）
     *
     * 五步（6 h）：
     *   ① 取样：液体 10 g 称到 ±0.1 mg（NH₃ 走 1 L 活性炭管）
     *   ② 分离：H₂ 1 mL/min、40 °C (3 min) → 10 °C/min → 300 °C (10 min)，39 min
     *   ③ EI 70 eV/50 µA + SIM：每个目标物 3–5 个离子、驻留 50 ms；分析腔 1e-4–1e-3 Pa
     *   ④ 库匹配 + 定量：三条判据（匹配度 ≥80、|ΔRI| ≤20、丰度比 ±30 %）；
     *      5 个标样外标、其余按类平均响应因子
     *   ⑤ 记录：compoundCount、matchScore、uRI、uQuant、detectionLimit；
     *      tentative 的另记（不进 compoundCount）
     */
    id: 'measure/gcms-library-match',
    name: 'Spectral Library Match Measurement', name_zh: '谱库匹配测量',
    produces: [
      {
        item: 'mat/gc-ms-library-record',
        qty: q(1),
        gives: [
          { param: 'compoundCount', kind: 'range', min: 40, max: 50 },
          { param: 'matchScore', kind: 'range', min: 80, max: 100 },
          { param: 'uRI', kind: 'range', min: 10, max: 20 },
          { param: 'uQuant', kind: 'range', min: 15, max: 25 },
          { param: 'detectionLimit', kind: 'range', min: 0.1, max: 1 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          { item: 'mat/trichlorosilane-electronic', qty: q(1, 100) },
          { item: 'mat/ammonia-electronic', qty: q(1, 100) },
        ],
      },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 5000) }] },
    ],
    needs: [
      'plant/clean-room',
      'plant/metrology-room',
      'plant/mfc',
      'mat/gc-ms-library',
    ],
    steps: [
      {
        note_zh: '① 取样/称重：液体 10 g 称到 ±0.1 mg；NH₃ 走 1 L 活性炭管（0.1–0.2 g 炭、50 mL/min、20 min）',
        performedBy: 'plant/micro-balance',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '② 分离：H₂ 载气 1 mL/min，40 °C (3 min) → 10 °C/min → 300 °C (10 min)，39 min；柱前压 0.5–1.2 bar',
        performedBy: 'plant/gc-ms',
        under: [
          { param: 'temperature', min: 40, max: 300 },
          { param: 'pressure', min: 9e4, max: 1.6e5 },
        ],
      },
      {
        note_zh: '③ EI 70 eV/50 µA + SIM：3–5 个特征离子、驻留 50 ms；源 250 °C、传输线 280 °C；分析腔 1e-4–1e-3 Pa',
        performedBy: 'plant/gc-ms',
        under: [{ param: 'pressure', min: 1e-4, max: 1e-3 }],
      },
      {
        note_zh: '④ 库匹配 + 定量：匹配度 ≥80、|ΔRI| ≤20、丰度比 ±30 %（三条全过才算定性）；5 个标样外标、其余按类平均响应因子',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '⑤ 记录：compoundCount 40–50、matchScore 80–100、uRI 10–20、uQuant 15–25 %、detectionLimit 0.1–1 ppm；tentative 另记',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(6) },
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...GC_LIBRARY_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...GC_LIBRARY_MEASURE_ROUTES];
