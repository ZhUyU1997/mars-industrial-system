/**
 * 痕量分析链的**测量与记录那一半**（R13：measure/* 与 *-record 只放 data/measure/）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、这一份是从 data/machine/trace-analysis.ts 搬出来的（R13）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `measure/*` 路线与 `*-record` 条目只放 `data/measure/`，机器/材料
 * 文件不得定义测量路线或记录。原来这四件与仪器写在同一份文件里（任务指定的单文件），
 * 现按规约搬到这里，**id 与窗口一个字都没改**：
 *
 *   mat/icpms-trace-metals-record     ← measure/trace-metals-icpms
 *   mat/gcms-volatile-organic-record  ← measure/volatile-organic-gcms
 *
 * 仪器的 id（`plant/icp-ms`、`plant/gc-ms`）、标液（`mat/icp-single-element-standard`、
 * `mat/icp-tuning-solution`、`mat/gcms-calibration-standard`）、吸附管
 * （`mat/gc-ms-adsorbent-tube`）与样品（`mat/trichlorosilane-electronic`、
 * `mat/ammonia-electronic`）仍在 `data/machine/trace-analysis.ts` —— 两个文件
 * 在同一次 data 装配里注册，路线里的 `uses` / `needs` / `performedBy` 按 id
 * 解析即可，**没有跨文件 import**（数据层只引 id，不引代码）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、窗口（与仪器 props 一一对应，推导在 machine 文件 §二 / §三）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ICP-MS  measure/trace-metals-icpms → mat/icpms-trace-metals-record
 *     detectionLimit            0.05–10 ppb   常规档（1 g/5 mL）
 *     traceDetectionLimit       0.02–2 ppb    基体消除档（HF 赶硅，1 g/2 mL，20 个金属）
 *     boronDetectionLimit       3–10 ppb      B 只能走 10× 稀释档（BF₃ 挥发，不赶硅）
 *     phosphorusDetectionLimit  1–4 ppb       H₂ 池压 NOH⁺、赶硅后 ×2
 *     elementCount              20–22 · massRange 2–260 u · resolution 0.7–1.0 u
 *
 *   GC-MS   measure/volatile-organic-gcms → mat/gcms-volatile-organic-record
 *     detectionLimit 0.1–1 ppm（SIM；全扫描 1–10 ppm）· compoundCount 20–30
 *     massRange 10–300 u · resolution 0.7–1.0 u · rtRepeatability 0.5–3 %
 *
 * 口径与 data/measure 其它文件一致：记录条目的 `props` 是**实测窗口**，路线的
 * `gives` 是这台仪器/这条方法能覆盖的窗口；没有真跑之前，它们都不是读数。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { TRACE_ANALYSIS_MEASURE_ITEMS, TRACE_ANALYSIS_MEASURE_ROUTES }
 *     from '../../data/measure/trace-analysis.ts';
 *   然后 items: [...TRACE_ANALYSIS_MEASURE_ITEMS] · routes: [...TRACE_ANALYSIS_MEASURE_ROUTES]
 *
 * ⚠️ 缺口（带数）不在这里重复：B 30–100×、P 10–40×、8/20 元素只到 0.2–2 ppb、
 *    无氦、NH₃ 只证 2/6 项 —— 全部在 `data/machine/trace-analysis.ts` §八。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、两个记录条目（R12 的收窄产物）
// ═══════════════════════════════════════════════════════════════════════════

export const TRACE_ANALYSIS_MEASURE_ITEMS: readonly Item[] = [
  /**
   * **ICP-MS 痕量金属记录。一份记录对应一批样品（TCS 或 NH₃）。**
   *
   * 七个字段就是「这台机器测得了什么」：
   *
   *   detectionLimit            0.05–10 ppb   常规档（5× 稀释；8 个受沾污/干扰元素在 0.5–10）
   *   traceDetectionLimit       0.02–2 ppb    基体消除档（HF 赶硅，20 个金属）
   *   boronDetectionLimit       3–10 ppb      B 只走 10× 稀释档（不赶硅）
   *   phosphorusDetectionLimit  1–4 ppb       H₂ 池压 NOH⁺、赶硅后 ×2
   *   elementCount              20–22         有标液的元素数
   *   massRange                 2–260 u
   *   resolution                0.7–1.0 u
   *
   * 与 TCS 判据的对照（`mat/trichlorosilane-electronic`）：
   *   金属 ≤1 ppb  → **12/20 够**（0.02–0.2 ppb）；8/20 只到 0.2–2 ppb（判超标够）
   *   B/P ≤0.1 ppb → **不够**（B 30–100×、P 10–40×，见 §八 ①②）
   */
  {
    id: 'mat/icpms-trace-metals-record',
    name: 'ICP-MS Trace Metal Record', name_zh: 'ICP-MS 痕量金属记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'detectionLimit', kind: 'range', min: 0.01, max: 20, unit: 'ppb', dir: 'atMost' },
      { param: 'traceDetectionLimit', kind: 'range', min: 0.001, max: 5, unit: 'ppb', dir: 'atMost' },
      { param: 'boronDetectionLimit', kind: 'range', min: 0.5, max: 50, unit: 'ppb', dir: 'atMost' },
      { param: 'phosphorusDetectionLimit', kind: 'range', min: 0.2, max: 20, unit: 'ppb', dir: 'atMost' },
      { param: 'elementCount', kind: 'range', min: 20, max: 22, unit: '个' },
      { param: 'massRange', kind: 'range', min: 2, max: 260, unit: 'u' },
      { param: 'resolution', kind: 'range', min: 0.2, max: 2, unit: 'u', dir: 'atMost' },
    ],
  },

  /**
   * **GC-MS 挥发性有机物记录。一份记录对应一批样品（NH₃ 气体或 TCS 液体）。**
   *
   *   detectionLimit  0.1–1 ppm（SIM、20 个目标物；全扫描 1–10 ppm）
   *   compoundCount   20–30 个目标物（5 个有标样）
   *   massRange       10–300 u（复用 SIMS 杆）
   *   resolution      0.7–1.0 u
   *   rtRepeatability 0.5–3 %
   *
   * ⚠️ 它**不是**「NH₃ 纯度证书」：99.999 % 是 6 项杂质的总账，这份记录只证
   * 有机物一项（0.1–1 ppm），金属那项在 `mat/icpms-trace-metals-record`，
   * 剩下 H₂O/O₂/CO₂/CO/N₂/H₂ 四项**没有路线**（§八 ⑤）。
   */
  {
    id: 'mat/gcms-volatile-organic-record',
    name: 'GC-MS Volatile Organic Compound Record', name_zh: 'GC-MS 挥发性有机物记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'detectionLimit', kind: 'range', min: 0.01, max: 10, unit: 'ppm', dir: 'atMost' },
      { param: 'compoundCount', kind: 'range', min: 20, max: 30, unit: '个' },
      { param: 'massRange', kind: 'range', min: 10, max: 300, unit: 'u' },
      { param: 'resolution', kind: 'range', min: 0.2, max: 2, unit: 'u', dir: 'atMost' },
      { param: 'rtRepeatability', kind: 'range', min: 0.05, max: 10, unit: '%', dir: 'atMost' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、两条测量路线（R12：窗口在这里从设计值收窄成记录）
// ═══════════════════════════════════════════════════════════════════════════

export const TRACE_ANALYSIS_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **ICP-MS 痕量金属：取样 → 基体消除 → 调谐 → 进样 → 四极杆扫描 → 外标法。**
     *
     *   1 g 电子级 TCS 或 NH₃ + HF + 亚沸 HNO₃ → 记录 1 份
     *
     * 五步（2 h 机时 + 2 h 前处理）：
     *
     *   ① 水解/赶硅：TCS 1 g 冰水浴水解（SiHCl₃ + 3H₂O → H₂SiO₃ + 3HCl，放热
     *      200 kJ/mol），加 0.5 g HF 与 20 g 亚沸 HNO₃，80 °C 蒸到近干 ——
     *      Si 以 SiF₄（沸点 −86 °C）走掉，金属留在残液里；2 mL 2 % HNO₃ 复溶。
     *      **浓缩 2 倍**（1 g → 2 mL），HF 也被赶掉 99 % 以上（炬管只挨残液）。
     *   ② 调谐：In/La/Ba 调谐液 —— LaO/La ≤2 %、Ba²⁺/Ba⁺ ≤3 %、灵敏度 2e5–1e6 cps/ppb
     *   ③ 进样：0.4 mL/min、Ar 1.0 L/min、等离子体 15 L/min、1.2–1.6 kW
     *   ④ 扫描：2–260 u、0.7–1.0 u 峰宽、碰撞池 H₂ 0.05 Pa、每个质量 3×10 s
     *   ⑤ 外标法：0/1/5/10/50 ppb 五点 + In 115 内标（内标回收 70–130 % 才收）
     *
     * 交付窗口（= 记录里的检测限，见 `mat/icpms-trace-metals-record`）：
     *   常规档 0.05–10 ppb（上限 10 是给最坏元素的包络）、基体消除档 0.02–2 ppb、
     *   B 3–10 ppb、P 1–4 ppb、
     *   20–22 元素、2–260 u、0.7–1.0 u。
     */
    id: 'measure/trace-metals-icpms',
    name: 'ICP-MS Trace Metal Measurement', name_zh: 'ICP-MS 痕量金属测量',
    produces: [
      {
        item: 'mat/icpms-trace-metals-record',
        qty: q(1),
        gives: [
          { param: 'detectionLimit', kind: 'range', min: 0.05, max: 10 },
          { param: 'traceDetectionLimit', kind: 'range', min: 0.02, max: 2 },
          { param: 'boronDetectionLimit', kind: 'range', min: 3, max: 10 },
          { param: 'phosphorusDetectionLimit', kind: 'range', min: 1, max: 4 },
          { param: 'elementCount', kind: 'range', min: 20, max: 22 },
          { param: 'massRange', kind: 'range', min: 2, max: 260 },
          { param: 'resolution', kind: 'range', min: 0.7, max: 1 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          { item: 'mat/trichlorosilane-electronic', qty: q(1, 1000) },
          { item: 'mat/ammonia-electronic', qty: q(1, 1000) },
        ],
      },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 2000) }] },
      { anyOf: [{ item: 'mat/nitric-acid-subboiled', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(7, 10) }] },
      { anyOf: [{ item: 'mat/icp-single-element-standard', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/icp-tuning-solution', qty: q(1, 100) }] },
    ],
    needs: [{ item: 'plant/clean-room', qty: q(1), need: [{ param: 'isoClass', kind: 'range', min: 5, dir: 'atLeast' }], onRelax: 'functional-kept' }, 'plant/metrology-room'],
    steps: [
      {
        note_zh:
          '① 前处理：1 g 样品冰水浴水解（TCS 放热 200 kJ/mol），加 0.5 g HF 与 20 g 亚沸 HNO₃，80 °C 蒸到近干赶硅（SiF₄ −86 °C），2 mL 2 % HNO₃ 复溶 = 2 倍浓缩',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'pressure', min: 100, max: 500 },
          { param: 'temperature', min: 19, max: 21 },
        ],
      },
      {
        note_zh:
          '② 调谐：In 115 / La 139 / Ba 137 各 10 µg/mL；LaO/La ≤2 %、Ba²⁺/Ba⁺ ≤3 %、灵敏度 2e5–1e6 cps/ppb、峰宽 0.7–1.0 u 才往下做',
        performedBy: 'plant/icp-ms',
        under: [
          { param: 'pressure', min: 9e4, max: 1.1e5 },
          { param: 'temperature', min: 19, max: 21 },
        ],
      },
      {
        note_zh:
          '③ 进样与等离子体：蠕动泵 0.4 mL/min、雾化气 Ar 1.0 L/min、等离子体气 15 L/min、27.12 MHz/1.2–1.6 kW；炬箱 1 atm（正压 +200 Pa）',
        performedBy: 'plant/icp-ms',
        under: [{ param: 'pressure', min: 9e4, max: 1.1e5 }],
      },
      {
        note_zh:
          '④ 四极杆扫描：2–260 u、0.7–1.0 u 峰宽、碰撞池 H₂ 0.05 Pa（压 ⁵⁶Fe/⁷⁵As/⁵¹V/³¹P 的同量异位素）；每个质量 3×10 s，分析腔 1e-4–1e-3 Pa',
        performedBy: 'plant/icp-ms',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh:
          '⑤ 外标法：0/1/5/10/50 ppb 五点 + In 115 内标（回收 70–130 % 才收）；B 与 P 单列（B 不赶硅、P 看 NOH⁺ 尾巴）；出 20+ 元素的 ppb 表',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(4) },
  },

  {
    /**
     * **GC-MS 挥发性有机物：取样 → 进样 → 分离 → EI/四极杆 → 积分。**
     *
     *   10 g 电子级 TCS 或 NH₃（或 1 L 气体过活性炭管）→ 记录 1 份
     *
     * 五步（3 h 机时 + 2 h 前处理）：
     *
     *   ① 取样：液体 1 µL 直接进样（分流 1:10 ⇒ 0.1 µL 上柱）；
     *      NH₃ 气体过 1 L 活性炭管（0.1–0.2 g 炭），300 °C 热脱附 1 mL ⇒ 富集 500–800×
     *   ② 进样口 250 °C、H₂ 载气 1 mL/min（60 sccm，`plant/mfc` 覆盖 0–200）
     *   ③ 分离：40 °C (3 min) → 10 °C/min → 300 °C (10 min)，39 min；
     *      30 m × 0.25 mm × 0.25 µm 甲基硅氧烷，9×10⁴ 板
     *   ④ EI 70 eV/50 µA、源 250 °C、传输线 280 °C；四极杆 10–300 u、0.7–1.0 u 峰宽、
     *      分析腔 1e-4–1e-3 Pa；检测器复用 SIMS 的电子倍增器
     *   ⑤ 积分：5 点标液（甲苯/苯乙烯/苯酚/丙酮/甲醇）外标；其余 15 个目标物
     *      按保留时间 + 3 个特征离子半定量（±30–50 %）
     *
     * ⚠️ **H₂ 载气下测不了 H₂**；N₂/CO 在甲基硅氧烷上不保留（k≈0）——
     * 永久气体这一格要分子筛柱 + TCD，本层没有（§八 ⑤）。
     */
    id: 'measure/volatile-organic-gcms',
    name: 'GC-MS Volatile Organic Compound Measurement', name_zh: 'GC-MS 挥发性有机物测量',
    produces: [
      {
        item: 'mat/gcms-volatile-organic-record',
        qty: q(1),
        gives: [
          { param: 'detectionLimit', kind: 'range', min: 0.1, max: 1 },
          { param: 'compoundCount', kind: 'range', min: 20, max: 30 },
          { param: 'massRange', kind: 'range', min: 10, max: 300 },
          { param: 'resolution', kind: 'range', min: 0.7, max: 1 },
          { param: 'rtRepeatability', kind: 'range', min: 0.5, max: 3 },
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
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 100000) }] },
      { anyOf: [{ item: 'mat/gcms-calibration-standard', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/gc-ms-adsorbent-tube', qty: q(2) }] },
    ],
    needs: [{ item: 'plant/clean-room', qty: q(1), need: [{ param: 'isoClass', kind: 'range', min: 5, dir: 'atLeast' }], onRelax: 'functional-kept' }, 'plant/metrology-room', 'plant/mfc'],
    steps: [
      {
        note_zh:
          '① 取样/称重：液体 10 g 称到 ±0.1 mg；NH₃ 气体过 1 L 活性炭管（0.1–0.2 g 炭，流量 50 mL/min、20 min），两端封口送检',
        performedBy: 'plant/micro-balance',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 进样：液体 1 µL 分流 1:10、进样口 250 °C；气体管 300 °C 热脱附 10 min、1 mL 脱附体积进 1 mL 定量环（富集 500–800×）',
        performedBy: 'plant/gc-ms',
        under: [{ param: 'temperature', min: 200, max: 300 }],
      },
      {
        note_zh:
          '③ 分离：H₂ 载气 1 mL/min，40 °C (3 min) → 10 °C/min → 300 °C (10 min)，39 min；柱前压 0.5–1.2 bar',
        performedBy: 'plant/gc-ms',
        under: [
          { param: 'temperature', min: 40, max: 300 },
          { param: 'pressure', min: 1.2e5, max: 1.5e5 },
        ],
      },
      {
        note_zh:
          '④ EI 70 eV/50 µA、源 250 °C、传输线 280 °C；四极杆 10–300 u、0.7–1.0 u 峰宽、SIM 3–5 个特征离子；分析腔 1e-4–1e-3 Pa',
        performedBy: 'plant/gc-ms',
        under: [{ param: 'pressure', min: 1e-4, max: 1e-3 }],
      },
      {
        note_zh:
          '⑤ 积分与半定量：5 点标液外标（甲苯 91、苯乙烯 104、苯酚 94、丙酮 43、甲醇 31）；其余 15 个目标物按保留时间 + 3 个特征离子，报 ±30–50 %；20 个目标物的 SIM 检出限 0.1–1 ppm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(5) },
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...TRACE_ANALYSIS_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...TRACE_ANALYSIS_MEASURE_ROUTES];
