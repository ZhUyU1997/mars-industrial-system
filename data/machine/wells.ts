/**
 * 阱注入 —— 把 STI 片推进到 CMOS 前道的一半。
 *
 * 现状：`mat/sti-wafer` 没有阱；本文件把它推进到阱 + 栅氧入口。
 * 本文件补：
 *
 *   p 阱：Al⁺（硼的替代品；implant.ts:50、144、1636–1673）
 *   n 阱：P⁺（implant.ts:1600）
 *   推进：1050–1100 °C / N₂ / 2–4 h
 *   栅氧入口：`mat/well-wafer` 接 `make/sti-gate-oxide`（改 sti-integration.ts 一处）
 *
 * 能量/剂量：p/n 各 **100 keV、2e13 cm⁻²、7°**。Al⁺ 分析段 25 kV / 0.473 T、
 * P⁺ 20 kV / 0.453 T（implant.ts:144–146），后加速到 100 keV。
 *
 * 掩模：1.0–1.5 µm 无钠胶；100 keV Al/P 的 Rp 约 0.12–0.14 µm（由 60 keV 的
 * 0.065 µm 外推，估算）⇒ 胶厚/射程 >7:1，离子停在胶里。版是 5 µm 级
 * （`std/photomask-general` 的 0.1–10 µm 够，5 µm 胶也刚好）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 诚实边界
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **没有硼路线。** p 阱只能用 Al 替代：Al 在 Si 里是受主（dopant.ts:10），
 *      但固溶度与扩散都和 B 不同。Al 的 D 在文献里横跨 2.5e-13–1e-10 cm²/s
 *      （implant.ts:1648–1653），本文件取 2.1e-12–1e-11 的中间带。阈值会偏：
 *      **Vt 偏 100–200 mV（估算，没有 C-V/SIMS 标定）**。B⁺ 仍缺。
 *
 *   ② **只到“阱 + 栅氧入口”。** PMOS 的 p⁺ 源漏、CMOS 的两次源漏掩模、
 *      双阱套刻（两块版的套刻没有量具）都未做。
 *
 *   ③ **阱的方阻/结深没有实测。** `plant/probe-station` 只能测 R□；
 *      结深要 SEM 剖面（e-beam 剖面束斑 12 nm，gate-stack.ts:1336），
 *      本文件没有切片/剖面步骤。`wellDepth` 与 `wellSheetResistance` 是
 *      **设计值/估算**，不是实测。
 *
 *   ④ **Al p 阱的成立条件。** 100 keV Al 的 Rp 约 0.12–0.14 µm（估算），
 *      不是 <0.1 µm；剂量 2e13 cm⁻² 在 Rp 处给 ~1.5e18 cm⁻³，低于 Al 在 Si
 *      的固溶度 ~5e18 cm⁻³（文献值，估算）。若 1100 °C/4 h 取 D 的高端
 *      （1e-10）会把 Al 推过 3 µm、稀释或团簇，**那时这条 p 阱不成立**，
 *      记缺口，不硬写。
 *
 *   ⑤ **掩模分辨率。** 无钠胶是 5 µm 级（mos.ts:56），本路线把阱版做成
 *      5 µm；3 µm 以下的阱版要更薄胶或 CAR，本轮不做。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const WELL_ITEMS: readonly Item[] = [
  /**
   * p 阱注入完、还没做 n 阱与推进的片。**只有半个阱。**
   *
   * 没有 props：这一片只证明“p 阱注入那一步走完了”；剂量/能量在路线里。
   */
  {
    id: 'mat/well-p-wafer',
    name: 'p 阱注入片',
    unit: '片',
    category: 'part',
  },

  /**
   * p 阱 + n 阱都注入完、还没推进的片。**两个阱都在，但都没扩散。**
   *
   * 没有 props：阱深/方阻要等 `make/well-drive-in` 之后才成立。
   */
  {
    id: 'mat/well-implanted-wafer',
    name: '双阱注入片',
    unit: '片',
    category: 'part',
  },

  /**
   * 做完 p 阱 + n 阱 + 推进的 STI 片。**有阱，还没有栅。**
   *
   * 两个规格：
   *   wellDepth            1–3 µm（设计窗口；1050–1100 °C / 2–4 h，√(Dt) 见路线）
   *   wellSheetResistance  300–3000 Ω/□（R□ = 1/(q·μ·N·x_j)；
   *                        p 阱 μ_p ≈ 400、n 阱 μ_n ≈ 700，N ≈ 1e17，x_j = 1–3 µm
   *                        ⇒ p 阱 520–1560、n 阱 297–892；合并 300–3000）
   *
   * 判据是设计/估算：probe-station 只测 R□；结深没有 SEM 剖面。
   */
  {
    id: 'mat/well-wafer',
    name: '阱推进片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'wellDepth', kind: 'range', min: 1, max: 3, unit: 'µm' },
      { param: 'wellSheetResistance', kind: 'range', min: 300, max: 3000, unit: 'Ω/□' },
    ],
  },
];

export const WELL_ROUTES: readonly Route[] = [
  {
    /**
     * **STI 片 → 涂胶/前烘 → 曝光/显影（p 阱版）→ Al⁺ 100 keV → 去胶 → p 阱片。**
     *
     *   STI 片 1 + Al 0.1 g + 无钠胶 1 g + Ar 2 g + N₂ 1 g + 水 1 kg
     *     → p 阱片 1
     *
     * 能量/剂量：Al⁺ 100 keV、2e13 cm⁻²、7°；分析段 25 kV / 0.473 T
     * （implant.ts:144），后加速到 100 keV。
     *
     * 掩模：1.0–1.5 µm 无钠胶；Al 100 keV 的 Rp 0.12–0.14 µm（由 60 keV 的
     * 0.065 µm 外推，估算）⇒ 胶/射程 >7:1。版 5 µm 级；`std/photomask-general`
     * 的 0.1–10 µm 够。
     *
     * 时间：2e13 × 78.5 × 1.602e-19 / 63e-6 = **4.0 s**（60 keV 的 63 µA）；
     * 100 keV 只有 22 µA ⇒ **11.4 s**。装卸、抽真空、换片才是大头，一批 3 h。
     */
    id: 'make/implant-well-p',
    name: 'p 阱注入片制造',
    produces: [{ item: 'mat/well-p-wafer', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sti-wafer', qty: q(1) }] },
      // Al 固体源：0.1 g；进硅的只有 0.070 µg（2e13 × 78.5 = 1.57e15 个 Al）
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10000) }] },
      // 无钠胶 1 g：1.0–1.5 µm 膜只要 9.4–14.1 mg，甩掉 95 % ⇒ 0.19–0.28 g，取 1 g
      { anyOf: [{ item: 'mat/photoresist-sodium-free', qty: q(1, 1000) }] },
      // 显影碱：NaOH 5 g + 水 1 kg（0.5 wt%）；负胶未见光处被碱水洗掉
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 200) }] },
      // 氩 2 g：源腔稀释/起辉；氮 1 g：吹扫
      { anyOf: [{ item: 'mat/argon', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    // 执行者（robot / resistance-furnace / mask-aligner / wet-bench / ion-implanter）
    // 都在 steps 里，不进 needs，避免 redundant_need。
    needs: ['std/photomask-general', 'plant/clean-room', 'plant/euv-vacuum'],
    rate: { hours: q(3) },
    steps: [
      {
        note_zh:
          '① 涂胶：无钠胶 1.0–1.5 µm（旋涂 3000 r/min）；胶里的钠对栅氧是死刑，所以不用含钠的重铬酸盐胶。膜厚 1.0–1.5 µm 比 Al 的 Rp 0.12–0.14 µm 厚 7–12 倍，离子停在胶里',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '② 前烘 100–120 °C / 60 s：赶走残余溶剂。温度上限由胶的感光剂与后续显影定，下限 100 是溶剂走干净的门槛',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 120 }],
      },
      {
        note_zh:
          '③ 曝光：p 阱版、接触曝光；版 5 µm 级（std/photomask-general 的 0.1–10 µm）。p 阱版与 n 阱版是两块版，套刻靠现有 mask-aligner 的对位（±0.25 µm，没有套刻测量机）',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '④ 显影：碱水 20–30 °C / 60 s；无钠胶是负胶，见光处交联、未见光处洗掉 —— 阱的窗口是“没见光”的那一块',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '⑤ Al⁺ 注入：100 keV、2e13 cm⁻²、7° 倾斜；分析段 25 kV / 0.473 T（implant.ts:144）后加速到 100 keV。2e13 在 Rp 0.12–0.14 µm 处给 ~1.5e18 cm⁻³，低于 Al 固溶度 ~5e18（估算），先避免团簇',
        performedBy: 'plant/ion-implanter',
        under: [
          { param: 'energy', min: 95, max: 100 },
          { param: 'pressure', min: 1e-4, max: 1e-3 },
        ],
      },
      {
        note_zh:
          '⑥ 去胶：70–90 °C 热水 + 刷（交联的负胶没有溶剂可溶）；不能用 HF —— 它会把 STI 槽里的氧化物与胶一起咬',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 70, max: 90 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
    ],
    unbalanced_zh:
      'STI 片 1（12.8 g）+ Al 0.1 g + 无钠胶 1 g + NaOH 5 g + Ar 2 g + N₂ 1 g + 水 1 kg → p 阱片 1。2e13 cm⁻² × 78.5 cm² = 1.57e15 个 Al，质量 1.57e15 / 6.022e23 × 27 = **0.070 µg** 进入硅；源投 0.1 g（100 mg）的其余 99.99993 % 淀积在电离室屏/光阑上。胶 1 g 里成膜 9.4–14.1 mg，其余甩掉/洗掉；NaOH 5 g 是 0.5 wt% 显影碱，随冲洗水走；Ar/N₂ 是稀释/吹扫，水是冲洗。产物按片计（12.8 g + 0.070 µg Al），差额是源损耗/胶/碱/水；不是账不平，是注入的固有损耗',
  },

  {
    /**
     * **p 阱片 → 涂胶/前烘 → 曝光/显影（n 阱版）→ P⁺ 100 keV → 去胶 → 双阱注入片。**
     *
     *   p 阱片 1 + P 0.1 g + 无钠胶 1 g + Ar 2 g + N₂ 1 g + 水 1 kg
     *     → 双阱注入片 1
     *
     * 能量/剂量：P⁺ 100 keV、2e13 cm⁻²、7°；分析段 20 kV / 0.453 T
     * （implant.ts:145），后加速到 100 keV。
     *
     * 时间：2e13 × 78.5 × 1.602e-19 / 22e-6 = **11.4 s**（100 keV 的 22 µA）；
     * 一批 3 h 与 p 阱同。
     */
    id: 'make/implant-well-n',
    name: 'n 阱注入',
    produces: [{ item: 'mat/well-implanted-wafer', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/well-p-wafer', qty: q(1) }] },
      // P 固体源：0.1 g；进硅的只有 0.081 µg（2e13 × 78.5 = 1.57e15 个 P）
      { anyOf: [{ item: 'mat/phosphorus', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/photoresist-sodium-free', qty: q(1, 1000) }] },
      // 显影碱：NaOH 5 g + 水 1 kg（0.5 wt%）
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['std/photomask-general', 'plant/clean-room', 'plant/euv-vacuum'],
    rate: { hours: q(3) },
    steps: [
      {
        note_zh:
          '① 涂胶：无钠胶 1.0–1.5 µm；n 阱版与 p 阱版是两块版，p 阱区在这一步被胶挡住',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '② 前烘 100–120 °C / 60 s：与 p 阱同一档',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 120 }],
      },
      {
        note_zh:
          '③ 曝光：n 阱版、接触曝光；版 5 µm 级。两块版的套刻没有量具，只按 mask-aligner 的 ±0.25 µm 记账（R8②）',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '④ 显影：碱水 20–30 °C / 60 s；n 阱窗口是未见光的那一块',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '⑤ P⁺ 注入：100 keV、2e13 cm⁻²、7°；分析段 20 kV / 0.453 T（implant.ts:145）后加速到 100 keV。P 的 Rp 与 Al 同量级（0.13 µm），胶厚 1.0–1.5 µm 足够挡',
        performedBy: 'plant/ion-implanter',
        under: [
          { param: 'energy', min: 95, max: 100 },
          { param: 'pressure', min: 1e-4, max: 1e-3 },
        ],
      },
      {
        note_zh:
          '⑥ 去胶：70–90 °C 热水 + 刷；不能 HF。到这一步 p 阱与 n 阱的掺杂都进了硅，但都还在 Rp 附近，等推进',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 70, max: 90 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
    ],
    unbalanced_zh:
      'p 阱片 1（12.8 g）+ P 0.1 g + 无钠胶 1 g + NaOH 5 g + Ar 2 g + N₂ 1 g + 水 1 kg → 双阱注入片 1。2e13 cm⁻² × 78.5 cm² = 1.57e15 个 P，质量 1.57e15 / 6.022e23 × 31 = **0.081 µg** 进入硅；源投 0.1 g（100 mg）的其余 99.99992 % 淀积在电离室屏/光阑上。胶 1 g 里成膜 9.4–14.1 mg，其余甩掉/洗掉；NaOH 5 g 是 0.5 wt% 显影碱，随冲洗水走；Ar/N₂ 是稀释/吹扫，水是冲洗。产物按片计（12.8 g + 0.070 µg Al + 0.081 µg P），差额是源损耗/胶/碱/水',
  },

  {
    /**
     * **双阱注入片 → 1050–1100 °C / N₂ / 2–4 h 推进 → 四探针方阻 → 阱片。**
     *
     *   双阱注入片 1 + N₂ 1 kg → 阱片 1
     *
     * 扩散长度（用户要的 √(Dt)）：
     *   D(1100 °C) = 2.8·exp(−3.3 eV / kT)，k·1373 K = 0.1183 eV
     *              = 2.8·exp(−27.9) = **2.1e-12 cm²/s**（D₀/Ea 取 implant.ts:1648–1649）
     *   t = 2–4 h = 7200–14400 s ⇒ L = √(Dt) = **1.23–1.74 µm**
     *   加 Rp 0.12–0.14 µm ⇒ x_j ≈ **1.4–1.9 µm**
     *   若取实验值 D = 1e-11（文献跨度 2.5e-13–1e-10 的中间带）⇒ L = 2.7–3.8 µm，
     *   x_j ≈ 2.8–3.9 µm ⇒ **1–3 µm 的设计窗口就在这两端之间**。
     *
     *   注意：不是每个 1050–1100 °C / 2–4 h 的组合都给 1–3 µm。1 µm 端要
     *   1050 °C/4 h 或 1100 °C/2 h；3 µm 端要 D 取 1e-11。`gives` 是可选窗口，
     *   不是任意组合的保证。
     *
     * 方阻：R□ = 1/(q·μ·N·x_j)。p 阱 μ_p≈400、n 阱 μ_n≈700、N≈1e17、
     * x_j=1–3 µm ⇒ p 阱 520–1560、n 阱 297–892 ⇒ 合并 **300–3000 Ω/□**。
     *
     * ⚠️ 这是设计/估算：probe-station 只测 R□；结深要 SEM 剖面（e-beam 束斑
     * 12 nm），本路线没有切片步骤。
     */
    id: 'make/well-drive-in',
    name: '阱推进',
    produces: [
      {
        item: 'mat/well-wafer',
        qty: q(1),
        gives: [
          { param: 'wellDepth', kind: 'range', min: 1, max: 3 },
          { param: 'wellSheetResistance', kind: 'range', min: 300, max: 3000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/well-implanted-wafer', qty: q(1) }] },
      // N₂ 1 kg：φ100 炉管 2–5 L/min × 2–4 h = 0.24–1.2 m³ ⇒ 0.28–1.4 kg；取 1 kg
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh:
          '① 推进：1050–1100 °C / N₂ / 2–4 h。√(Dt)：D(1100)=2.1e-12 cm²/s ⇒ L=1.23–1.74 µm，加 Rp 0.12–0.14 ⇒ x_j=1.4–1.9 µm；取 D=1e-11 ⇒ x_j=2.8–3.9 µm。1–3 µm 的设计窗口在两端之间。N₂ 1 kg 是吹扫/载气，不参与反应',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 1050, max: 1100 }],
      },
      {
        note_zh:
          '② 四探针方阻：`plant/probe-station` 读 300–3000 Ω/□；四探针只测 R□，**测不了结深**。结深要 SEM 剖面（e-beam 剖面束斑 12 nm，gate-stack.ts:1336），本路线没有切片/剖面步骤 ⇒ wellDepth 是设计/估算，不是实测（R8③）',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '双阱注入片 1（12.8 g，含 Al 0.070 µg + P 0.081 µg）+ N₂ 1 kg → 阱片 1。推进只改掺杂分布，不改质量：硅 12.8 g 原样，Al/P 仍是 0.070/0.081 µg，只是从 Rp 附近扩到 1–3 µm；N₂ 1 kg 全部进尾气。产物按片计，差额是 N₂；不是账不平，是载气过量',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...WELL_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...WELL_ROUTES];
