/**
 * 氮化硅 —— STI 硬掩模与 CMP 停止层。
 *
 * 本文件之前，`mat/silicon-nitride` 在 data/ 里 0 条目（multi-patterning.ts 已点名）；
 * 本文件建了它，并用 `plant/euv-coater` 的反应溅射（2N 硅靶 + 氮气）
 * 交一片**硬掩模贴片**，不新增机器。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 边界：只交片，不贴片；只到隔离，不是器件
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 真实 STI 的硬掩模必须在刻槽**之前**贴到片上（pad oxide + Si₃N₄ + 光刻 +
 * 刻槽）。car-strip 已经刻完槽，所以本文件只交“硬掩模贴片”这一件，
 * **贴片与套刻仍是缺口**；P1 不含它，P2（阱/栅氧/源漏）更不含它。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 去处：现在没人吃，这是有意的（判据见 data/machine/st-i-etcher.ts 的胶选择比与 data/machine/sti.ts 的硬掩模边界）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本片在报告里是 terminal（有产出、无消费者）。**这一条故意留着**：
 * 250–300 nm 的 STI 槽由 CAR 胶自己扛（结论是**边缘**，算式见
 * data/machine/st-i-etcher.ts 的 3–5:1 选择比与 50–100 nm 胶预算），
 * 现在给它接一条消费者，就是在不需要硬掩模的档上硬加硬掩模。
 *
 * 它是**深槽那一档的备件**：槽深更大、CD 更小（胶必须更薄）、或 Cl₂ 的选择比
 * 落到窗口下界时，胶预算 < 1，那时才轮到它。料已经在了（`make/si3n4-hardmask`，
 * 80–120 nm）；缺的从来不是料，是贴片与套刻。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 两个数：N/Si 只有方向，含氢有 FTIR
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① 化学计量 N/Si：反应溅射的膜不是严格 Si₃N₄（N/Si = 1.33）。没有 RBS/XPS；
 *      FTIR 的 Si–N 840 cm⁻¹ 只给富硅/富氮方向；本文件写 **1.1–1.4**（估算）。
 *      N 少了膜富硅、漏电/应力都变。
 *   ② 含氢：`measure/sin-h-content` 用 FTIR 读 **0.5–2 at%**，记录为
 *      `mat/sin-h-record`；本文件的 H 窗口按该记录取 0.5–2 at%。
 *      溅射气是 N₂/Ar，没有刻意加 H，但靶与腔壁的吸附水会带氢。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 2N 硅靶的污染
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `plant/euv-coater/target-si` 是 2N 工业硅（98–99.5 %），金属杂质
 * 1e18–1e19 cm⁻³（gate-stack.ts 的 2N 硅靶杂质段）。对硬掩模来说，这些杂质会在
 * 剥离/清洗时沾到槽里；本层没有在线金属沾污量具（SIMS 有，但它是离线、
 * 破坏性），所以只能记缺口。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const SILICON_NITRIDE_ITEMS: readonly Item[] = [
  /**
   * 氮化硅硬掩模贴片。**一片硅片 + 80–120 nm 反应溅射 Si₃N₄。**
   *
   * 三个规格：
   *   thickness        80–120 nm（STI 硬掩模的典型档；CMP 停止层要够厚）
   *   stoichiometry    N/Si 1.1–1.4（没有 RBS/XPS；FTIR 只给方向；估算；理想 1.33）
   *   hydrogenContent  0.5–2 at%（FTIR 记录 mat/sin-h-record；原 1–10 估算已收窄）
   *
   * ⚠️ 它不是“贴好了的硬掩模”：贴片、光刻、刻槽都不在本文件。
   */
  {
    id: 'mat/silicon-nitride',
    name: 'Silicon Nitride Hard Mask Wafer', name_zh: '氮化硅硬掩模贴片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'thickness', kind: 'range', min: 80, max: 120, unit: 'nm' },
      { param: 'stoichiometry', kind: 'range', min: 1.1, max: 1.4, unit: 'N/Si' },
      { param: 'hydrogenContent', kind: 'range', min: 0.5, max: 2, unit: 'at%' },
    ],
  },
];

export const SILICON_NITRIDE_ROUTES: readonly Route[] = [
  {
    /**
     * **硅片 → 反应溅射 Si₃N₄ → 椭偏 → 硬掩模贴片。**
     *
     *   硅片 1 + 氮 10 g + 氩 10 g → 硬掩模片 1
     *
     * `plant/euv-coater`：2N Si 靶 + N₂，0.1–1 Pa、100–150 °C、0.10 nm/s
     * （gate-stack.ts 的溅射工艺段 的同一炉工艺）⇒ 80–120 nm 要 800–1 200 s。
     * 加升降温、换靶/换气，一批 2 h。
     *
     * ⚠️ 这是**反应溅射**，不是 LPCVD：台阶覆盖 20–40 %（gate-stack.ts 的台阶覆盖段），
     * 但硬掩模是平面膜，不需要保形；N/Si 没有 RBS/XPS，FTIR 只给方向；含氢有 `measure/sin-h-content`
 * 的 FTIR 记录，本路线给 0.5–2 at%。
     */
    id: 'make/si3n4-hardmask',
    name: 'Silicon Nitride Hard Mask Wafer Manufacturing', name_zh: '氮化硅硬掩模贴片制造',
    produces: [
      {
        item: 'mat/silicon-nitride',
        qty: q(1),
        gives: [
          { param: 'thickness', kind: 'range', min: 80, max: 120 },
          { param: 'stoichiometry', kind: 'range', min: 1.1, max: 1.4 },
          { param: 'hydrogenContent', kind: 'range', min: 0.5, max: 2, record: 'mat/sin-h-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      // 氮 10 g：80–120 nm Si₃N₄ 只需 0.6–0.9 mg N₂；10 g 是 10^4 倍过量
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 100) }] },
      // 氩 10 g：溅射气，绝大多数抽走
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
    ],
    needs: [
      // QCM 读速率：膜厚决定硬掩模的 CMP 停止余量
      'plant/film-monitor',
      // N₂/Ar 两路计量
      'plant/mfc',
      'plant/clean-room',
      'plant/metrology-room',
    ],
    rate: { hours: q(2) },
    steps: [
      {
        note_zh:
          '① 反应溅射 Si₃N₄：2N Si 靶 + N₂，0.1–1 Pa、100–150 °C、0.10 nm/s ⇒ 80–120 nm 要 800–1 200 s。**没有 RBS/XPS**：N/Si 1.1–1.4 是估算；FTIR 的 Si–N 只给方向；H 由 `measure/sin-h-content` 的 FTIR 读 0.5–2 at%，本路线按记录给 0.5–2；2N 靶的金属杂质 1e18–1e19 cm⁻³（gate-stack.ts 的 2N 硅靶杂质段）会带进膜里',
        performedBy: 'plant/euv-coater',
        under: [
          { param: 'pressure', min: 0.1, max: 1 },
          { param: 'temperature', min: 100, max: 150 },
        ],
      },
      {
        note_zh:
          '② 椭偏读厚度与折射率：488 nm、70°/75°，±0.019 nm（ellipsometer.ts 的椭偏精度段）；80–120 nm 的 ±5 nm 够判。折射率只能旁证 N/Si，分不开 1.1 与 1.4；含氢由 `measure/sin-h-content` 的 FTIR 读 0.5–2 at%，本路线按记录给 0.5–2',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '硅片 1（12.8 g）+ 氮 10 g + 氩 10 g → 硬掩模片 1。Si₃N₄ 80–120 nm × 78.5 cm² × 3.2 g/cm³ = 2.0–3.0 mg；按 Si₃N₄ 140.28 g/mol、N₂ 28 g/mol，只需 N₂ 0.6–0.9 mg，10 g 是 10^4 倍过量；氩 10 g 是溅射气，绝大多数抽走。硅来自 `plant/euv-coater/target-si` 的靶磨损（机器零件，不进 uses；靶按 50 000 h 换，euv-mirror.ts 的靶寿命段）。产物按片计，差额是尾气与靶磨损；不是账不平，是气体过量',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...SILICON_NITRIDE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...SILICON_NITRIDE_ROUTES];
