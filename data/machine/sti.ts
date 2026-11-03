/**
 * STI（浅槽隔离）模块 —— 衬里氧化、TEOS 填充、氧化物 CMP。
 *
 * 现有前道的隔离是 LOCOS 场氧 / pn 结隔离（mos.ts:188、237；integrated.ts:17–23；
 * cis.ts:532），全 data 没有 STI。本文件只补 STI 这一段：
 *
 *   槽片（data/material/car-sti.ts）→ 衬里 → TEOS 填充 → CMP → `mat/sti-wafer`
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 边界：只到隔离，不是器件；P2 仍未做
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `mat/sti-wafer` 出了 CMP 仍是**隔离片**，没有阱、没有栅氧入口、没有源漏。
 * P2（阱 / 栅氧入口 / 源漏收口）不在本文件，也不在 car-sti.ts。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三处降级（本文件的全部诚实所在）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① 填充：TEOS + O₂ 的 PECVD 是**保形性差**的那一档。10–100 Pa 下平均自由程
 *      毫米级，AR 0.5–3.75 的槽会出空洞/seam；本文件写 **void 5–20 %、
 *      seam 10–50 nm**（估算），没有截面量具（FIB-TEM 有，但破坏性）。
 *   ② CMP：现有 CMP 的 dishing 是 40–150 nm（毯式氧化物，multilevel-floor.ts:1154）
 *      与 200–230 nm（大马士革，damascene.ts:406）；STI 的 80–200 nm 图形更小，
 *      本文件保守写 **dishing 50–120 nm、erosion 60–120 nm**（估算）。
 *      这不是“达标”，是把最差的一格先记下来。
 *   ③ 硬掩模：`mat/silicon-nitride` 在 data/material/silicon-nitride.ts 才刚有；
 *      真实 STI 要在刻槽**之前**贴硬掩模，而 car-strip 已经刻完 —— 本模块只交
 *      “槽 + 填充 + CMP”，硬掩模贴片仍是缺口。
 *
 *   ④ **ALD 填充补上了专用炉，但仍降级。** `plant/sti-ald-reactor`：
 *      150–400 °C / **1–10 kPa**，TEOS/O₃/N₂，喷淋头 + 加热台 + 泵 + 臭氧管。
 *      `make/sti-fill-ald` 是**空间/时间 ALD**：TEOS 饱和 → N₂ 吹扫 → O₃/O₂
 *      反应 → N₂ 吹扫，循环到 50–150 nm 过填。**不是 PECVD。**
 *      AR 3.75 的槽中心仍有 seam；void 0–5 %、seam 5–20 nm、overburden 50–150 nm
 *      都是**设计值**；没有截面量具，seam/void 测不了。O₃ 靠 O₂ 无声放电，
 *      没有臭氧浓度计；1–10 kPa 没有漏率/压力标定。
 *
 *   ⑤ **截面量测是破坏性的。** `measure/sti-fill-cross-section` 用
 *      `plant/fib-tem` 切 5 个槽，量 void 面积比/seam/dishing；**一片只能测一次**，
 *      5 点不是全片图；FIB 切样会引入 Ga 污染。测出来之前，void/seam/dishing
 *      都只是设计窗口，不是实测值。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 机器都在，缺的是工艺路线
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `plant/diffusion-furnace`（900–1200 °C，diffusion.ts:120）
 *   `plant/ald-reactor`（150–400 °C / 10–100 Pa，ald.ts:543）
 *   `plant/rf-13m56`（13.56 MHz / 500 W，flow-and-rf.ts:508）
 *   `plant/cmp-polisher`（15–30 kPa，multilevel-floor.ts:399）
 *
 * 没有新增一台机器；只新增路线与三种片级条目。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const STI_ITEMS: readonly Item[] = [
  /**
   * 长完衬里氧化（liner）的 STI 槽片。**槽还在，只是内壁多了一层 SiO₂。**
   *
   * 两个规格：
   *   linerThickness 8–12 nm（干氧 900–1000 °C；Deal-Grove 线性区，取 10 nm 中心）
   *   sidewallAngle  85–90°（衬里很薄，角度基本不变；只做继承/复核）
   */
  {
    id: 'mat/sti-lined-wafer', name: 'Wafer with Grown Liner Oxide', name_zh: '长完衬里氧化',
    unit: '片',
    category: 'part',
    props: [
      { param: 'linerThickness', kind: 'range', min: 8, max: 12, unit: 'nm' },
      { param: 'sidewallAngle', kind: 'range', min: 85, max: 90, unit: '°', dir: 'atLeast' },
    ],
  },

  /**
   * TEOS 填完、还没 CMP 的 STI 片。**过填是故意的：CMP 要磨掉它。**
   *
   * 三个规格（都是估算，没有截面量具）：
   *   voidFraction 5–20 %（AR 0.5–3.75 的槽，PECVD 保形性差）
   *   seamWidth    10–50 nm（槽中心缝）
   *   overburden   100–300 nm（场上过填层；CMP 的去除量由它定）
   */
  {
    id: 'mat/sti-filled-wafer', name: 'TEOS Filled Wafer', name_zh: 'TEOS 填充片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'voidFraction', kind: 'range', min: 0, max: 20, unit: '%', dir: 'atMost' },
      { param: 'seamWidth', kind: 'range', min: 0, max: 50, unit: 'nm', dir: 'atMost' },
      { param: 'overburden', kind: 'range', min: 50, max: 300, unit: 'nm' },
    ],
  },

  /**
   * CMP 完的 STI 成品片。**隔离有了，器件还没有。**
   *
   * 三个规格（dishing/erosion 是估算，见文件头）：
   *   dishing       50–120 nm（槽内氧化物比场区低多少）
   *   erosion       60–120 nm（场区氧化物被磨掉多少）
   *   oxideThickness 200–300 nm（槽内剩余氧化物；从 250–300 nm 槽深来）
   */
  {
    id: 'mat/sti-wafer', name: 'STI Finished Wafer after CMP', name_zh: 'CMP 完的 STI 成品片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'dishing', kind: 'range', min: 0, max: 120, unit: 'nm', dir: 'atMost' },
      { param: 'erosion', kind: 'range', min: 0, max: 120, unit: 'nm', dir: 'atMost' },
      { param: 'oxideThickness', kind: 'range', min: 200, max: 300, unit: 'nm' },
    ],
  },

];

export const STI_ROUTES: readonly Route[] = [
  {
    /**
     * **STI 槽片 → 衬里氧化 → 椭偏 → 衬里片。**
     *
     *   槽片 1 + 氧 0.01 g + 氮 10 g → 衬里片 1
     *
     * 干氧 900–1000 °C，10 nm：Deal-Grove 线性区，10 nm 约 20–30 min（估算）；
     * 加升降温与装片，一批 4 h。
     *
     * 为什么衬里要有：TEOS 直接填在裸硅槽壁上，界面态与固定电荷不可控；
     * 一层 10 nm 热氧化把槽壁“钝化”后再填。它也是 HF 的停止层/缓冲层。
     */
    id: 'make/sti-liner', name: 'Wafer with Grown Liner Oxide Manufacturing', name_zh: '长完衬里氧化制造',
    produces: [
      {
        item: 'mat/sti-lined-wafer',
        qty: q(1),
        gives: [
          { param: 'linerThickness', kind: 'range', min: 8, max: 12 },
          { param: 'sidewallAngle', kind: 'range', min: 85, max: 90 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/car-sti-trench-wafer', qty: q(1) }] },
      // 10 nm × 78.5 cm² × 2.27 g/cm³ = 0.178 mg SiO₂；其中氧 0.095 mg。
      // 取 10 mg 是 100 倍过量（炉管气路与坡上也要氧）
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 100000) }] },
      // 氮 10 g：升降温与吹扫，不进膜
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 100) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① 干氧 900–1000 °C / 20–30 min ⇒ 8–12 nm 衬里（Deal-Grove 线性区；温度低限 900 是炉子的下限，上限 1000 是控制在 10 nm 附近）。氧 10 mg 是 100 倍过量，坡上与气路也要氧',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 900, max: 1000 }],
      },
      {
        note_zh:
          '② 椭偏读衬里厚度：488 nm、70°/75° 两角，±0.019 nm（ellipsometer.ts:693–698）；10 nm 的 ±2 nm 窗口够判。只能测平片/陪片，槽内壁测不到 —— 槽内厚度是“同炉同片”外推（估算）',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'STI 槽片 1 + 氧 0.01 g + 氮 10 g → 衬里片 1。10 nm × 78.5 cm² × 2.27 g/cm³ = 0.178 mg SiO₂，其中氧 0.095 mg、硅 0.083 mg（来自槽壁）；氧投 10 mg 是 100 倍过量，氮 10 g 是吹扫，差额进尾气。产物按片计（12.8 g 硅片 + 0.18 mg SiO₂，其中氧 0.095 mg），不是账不平，是气体过量',
  },

  {
    /**
     * **衬里片 → TEOS/O₂ PECVD 填充 → 致密化 → 椭偏 → 填充片。**
     *
     *   衬里片 1 + TEOS 1 g + 氧 10 g + 氩 10 g + 氮 10 g → 填充片 1
     *
     * PECVD：250–350 °C / 10–100 Pa / 13.56 MHz、300–500 W。
     * 0.33–1.0 nm/s（20–60 nm/min，同 `make/sico-h-pecvd` 的降级档，
     * lowk-barrier.ts:1031、1100）⇒ 100–300 nm 过填要 1.7–15 min，
     * 加升降温与换气一批 5 h。
     *
     * ⚠️ 保形性降级：10–100 Pa 下平均自由程毫米级，AR 0.5–3.75 的槽
     * 会出空洞/seam。本文件写 void 5–20 %、seam 10–50 nm，是**估算**，
     * 没有截面量具（FIB-TEM 有但破坏性，见 data/machine/fib 那类）。
     */
    id: 'make/sti-fill-teos', name: 'TEOS Filled Wafer Manufacturing', name_zh: 'TEOS 填充片制造',
    produces: [
      {
        item: 'mat/sti-filled-wafer',
        qty: q(1),
        gives: [
          { param: 'voidFraction', kind: 'range', min: 5, max: 20, record: 'mat/sti-cross-section-record' },
          { param: 'seamWidth', kind: 'range', min: 10, max: 50, record: 'mat/sti-cross-section-record' },
          { param: 'overburden', kind: 'range', min: 100, max: 300 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sti-lined-wafer', qty: q(1) }] },
      // TEOS 1 g：SiO₂ 4.5–8.0 mg；TEOS/SiO₂ 摩尔质量比 208.33/60.08 = 3.47
      // ⇒ 15.6–27.8 mg；前驱体利用率 10–15 % + 腔壁 2.7× ⇒ 0.28–0.75 g，取 1 g
      { anyOf: [{ item: 'mat/teos', qty: q(1, 1000) }] },
      // 氧 10 g：200 sccm × 20 min = 4 L = 5.7 g；加倍取 10 g
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 100) }] },
      // 氩 10 g：稀释/起辉，1000 sccm × 20 min
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
      // 氮 10 g：吹扫与破空
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 100) }] },
    ],
    needs: [
      // 13.56 MHz 源：只在 needs 里（它没有 holds，flow-and-rf.ts:508）
      'plant/rf-13m56',
      // 三路气计量：TEOS 鼓泡 + O₂ + Ar
      'plant/mfc',
      // QCM 读速率：膜厚直接决定过填量，过填量又决定 CMP 去除量
      'plant/film-monitor',
      'plant/clean-room',
      'plant/metrology-room',
    ],
    rate: { hours: q(5) },
    steps: [
      {
        note_zh:
          '① TEOS/O₂ PECVD：250–350 °C / 10–100 Pa / 13.56 MHz、300–500 W；0.33–1.0 nm/s（20–60 nm/min，估算）⇒ 100–300 nm 过填 1.7–15 min。**10–100 Pa 下保形性差**：AR 0.5–3.75 的槽会出空洞/seam；void 5–20 %、seam 10–50 nm 是估算，没有截面量具',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 250, max: 350 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '② 致密化 400–450 °C / 30 min（N₂）：赶残余甲氧基/水分、把 PECVD 氧化层压实。上限 450 是 Al 的共晶 577 °C 与后续 gate 热预算的折中；下限 400 是致密化开始明显的温度',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
      {
        note_zh:
          '③ 椭偏读过填厚度：488 nm、70°/75°，±0.019 nm；过填 100–300 nm 的 ±10 nm 够判。槽内填充量测不到，只能按“过填 − 槽深”记账（估算）',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '衬里片 1 + TEOS 1 g + 氧 10 g + 氩 10 g + 氮 10 g → 填充片 1。SiO₂ 量：槽体积按 50 % 面积、300 nm 深算 = 1.18e-3 cm³ ⇒ 2.7 mg；过填 100–300 nm = 1.8–5.3 mg；合计 4.5–8.0 mg。TEOS 按 3.47 的质量比只需 15.6–27.8 mg，前驱体利用率 10–15 %、腔壁再吃 2.7 倍 ⇒ 0.28–0.75 g，取 1 g。氧/氩/氮都是过量吹扫，差额进尾气；TEOS 的碳氢进 CO₂/H₂O 与腔壁沉积。产物按片计，不是账不平，是前驱体利用率低',
  },

  {
    /**
     * **填充片 → 氧化物 CMP → 清洗 → 干涉仪 → STI 片。**
     *
     *   填充片 1 + 硅溶胶 50 g + 水 50 g → STI 片 1
     *
     * 硅溶胶 50 g（固含 4.6–5.2 %）兑水 50 g ⇒ 2.3–2.6 wt% 磨料、100 g 浆。
     * 15–25 kPa、定时；去除量 = 过填 100–300 nm + 少量槽内氧化物。
     *
     * ⚠️ 本模块最差的一格：STI 的 80–200 nm 图形上，dishing 50–120 nm、
     * erosion 60–120 nm（估算）。现有 CMP 没有 STI 级终点/硬垫匹配；
     * `make/wafer-level-cmp` 的 40–150 nm 与 `make/damascene-cmp` 的
     * 200–230 nm 都不是这个图形。升级要硬垫 + 分区 + 终点（P2/P3）。
     */
    id: 'make/sti-cmp', name: 'STI Finished Wafer after CMP Manufacturing', name_zh: 'CMP 完的 STI 成品片制造',
    produces: [
      {
        item: 'mat/sti-wafer',
        qty: q(1),
        gives: [
          { param: 'dishing', kind: 'range', min: 50, max: 120 },
          { param: 'erosion', kind: 'range', min: 60, max: 120 },
          { param: 'oxideThickness', kind: 'range', min: 200, max: 300 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sti-filled-wafer', qty: q(1) }] },
      // 硅溶胶 50 g（4.6–5.2 wt% ⇒ 2.3–2.6 g SiO₂ 磨料）；兑水 50 g
      { anyOf: [{ item: 'mat/colloidal-silica', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 20) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/water-polisher'],
    rate: { hours: q(3) },
    steps: [
      {
        note_zh:
          '① 氧化物 CMP：15–25 kPa、100 g 浆（2.3–2.6 wt% 硅溶胶）、定时；去过填 100–300 nm + 槽内 20–50 nm。dishing 50–120 nm、erosion 60–120 nm 是估算 —— 现有 CMP 没有 STI 级终点/硬垫匹配，这是本模块最差的一格',
        performedBy: 'plant/cmp-polisher',
        under: [{ param: 'pressure', min: 15, max: 25 }],
      },
      {
        note_zh:
          '② 冲洗甩干：DI 水 3 段 × 10 s + 氮气甩干；磨料残粒就是缺陷。这一步没有温压条件（机器人拿片、冲水、吹干），所以不写 under',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '③ 抽检 dishing/erosion：干涉仪 0.295 µm/条纹，50–120 nm 是 0.17–0.41 条纹 —— **判据落在量具极限附近**，只能抽 1/25 片、看趋势，不能逐片判。7–12 nm 的硬垫档本模块没有接',
        performedBy: 'plant/interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '填充片 1 + 硅溶胶 50 g + 水 50 g → STI 片 1。要去掉过填 100–300 nm：78.5 cm² × 100–300 nm × 2.27 g/cm³ = 1.8–5.3 mg SiO₂；硅溶胶里 2.3–2.6 g 磨料绝大多数随废浆走（只有 0.1 % 量级参与去除）。产物按片计（12.8 g 硅 + 200–300 nm 槽内氧化物 ≈ 3.6–5.3 mg），差额是废浆与磨掉的氧化物。不是账不平，是 CMP 的浆料利用率低',
  },

  {
    /**
     * **硬垫 + 光学终点 STI CMP：dishing 20–50 nm、erosion 10–30 nm（设计值）。**
     *
     *   填充片 1 + 硅溶胶 50 g + 重铬酸钠 1 g + 水 50 g → STI 片 1
     *
     * 与 `make/sti-cmp` 并列，不改旧路线；旧路线保留作对照（50–120 nm
     * dishing / 60–120 nm erosion）。硬垫 + `plant/cmp-integration` 的
     * 光学终点把窗口压到 20–50 / 10–30 nm，但仍是**设计值**：
     * 没有逐片 dishing/erosion 量具，干涉仪只能抽检。
     *
     * ⚠️ 重铬酸钠是 Cr(VI)：废浆是危废，冲洗水不能直排；本层没有
     * Cr(VI) 还原/沉淀线。硬垫的沟槽/分区匹配也没有实测。
     */
    id: 'make/sti-cmp-hard', name: 'STI Finished Wafer after CMP Manufacturing', name_zh: 'CMP 完的 STI 成品片制造',
    produces: [
      {
        item: 'mat/sti-wafer',
        qty: q(1),
        gives: [
          { param: 'dishing', kind: 'range', min: 20, max: 50 },
          { param: 'erosion', kind: 'range', min: 10, max: 30 },
          { param: 'oxideThickness', kind: 'range', min: 200, max: 300 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sti-filled-wafer', qty: q(1) }] },
      // 硅溶胶 50 g（4.6–5.2 wt% ⇒ 2.3–2.6 g SiO₂）+ 重铬酸钠 1 g + 水 50 g
      { anyOf: [{ item: 'mat/colloidal-silica', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/sodium-dichromate', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 20) }] },
    ],
    needs: ['plant/cmp-integration', 'plant/cmp-uniformity-kit', 'plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(2) },
    steps: [
      {
        note_zh:
          '① 硬垫 CMP：15–30 kPa、硅溶胶 + 重铬酸钠浆；硬垫 + 光学终点，目标 dishing 20–50 nm、erosion 10–30 nm。**这是设计值**，没有逐片量具；旧路线 50–120 / 60–120 保留作对照',
        performedBy: 'plant/cmp-polisher',
        under: [{ param: 'pressure', min: 15, max: 30 }],
      },
      {
        note_zh:
          '② 冲洗/检漏：DI 水 + N₂ 甩干；Cr(VI) 废浆单独收集，不能直排。干涉仪抽 1/25 片看 dishing/erosion 趋势，0.295 µm/条纹对 20–50 nm 仍是 0.07–0.17 条纹，判据在量具极限附近',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '填充片 1 + 硅溶胶 50 g + 重铬酸钠 1 g + 水 50 g → STI 片 1。去掉过填 100–300 nm（1.8–5.3 mg SiO₂）；磨料 2.3–2.6 g 绝大多数随废浆走；Cr(VI) 1 g 进废浆/冲洗水，是危废。产物按片计（12.8 g 硅 + 200–300 nm 槽内氧化物 ≈ 3.6–5.3 mg），差额是废浆/磨掉的氧化物/Cr(VI) 废液',
  },

  {
    /**
     * **STI 槽片 → TEOS/O₃ ALD 填充 → 填充片。**
     *
     *   衬里片 1 + TEOS 1 g + O₂ 10 g + N₂ 10 g → 填充片 1
     *
     * 空间/时间 ALD：TEOS 饱和 → N₂ 吹扫 → O₃/O₂ 反应 → N₂ 吹扫，
     * 循环到 50–150 nm 过填；300–400 °C / 1–10 kPa。
     * 不是 PECVD：不靠等离子体，靠前驱体饱和 + 吹扫。
     *
     * ⚠️ AR 3.75 的槽中心仍有 seam；void 0–5 %、seam 5–20 nm、
     * overburden 50–150 nm 是**设计值**，没有截面量具。O₃ 由 O₂ 在
     * 喷淋头前的无声放电管生成；没有臭氧浓度计。
     */
    id: 'make/sti-fill-ald', name: 'TEOS Filled Wafer Manufacturing', name_zh: 'TEOS 填充片制造',
    produces: [
      {
        item: 'mat/sti-filled-wafer',
        qty: q(1),
        gives: [
          { param: 'voidFraction', kind: 'range', min: 0, max: 5, record: 'mat/sti-cross-section-record' },
          { param: 'seamWidth', kind: 'range', min: 5, max: 20, record: 'mat/sti-cross-section-record' },
          { param: 'overburden', kind: 'range', min: 50, max: 150 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sti-lined-wafer', qty: q(1) }] },
      // TEOS 1 g：SiO₂ 4.5–8.0 mg；前驱体利用率低 + 腔壁，取 1 g
      { anyOf: [{ item: 'mat/teos', qty: q(1, 1000) }] },
      // O₂ 10 g：O₃ 现场无声放电生成，O₂ 过量
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 100) }] },
    ],
    needs: [
      'plant/mfc',
      'plant/film-monitor',
      'plant/clean-room',
      'plant/metrology-room',
    ],
    rate: { hours: q(10) },
    steps: [
      {
        note_zh:
          '① 抽气/ purge：反应器抽到 1–10 kPa，N₂ 吹扫 3 次；腔壁 300–400 °C 烘烤去水汽',
        performedBy: 'plant/sti-ald-reactor',
        under: [
          { param: 'temperature', min: 300, max: 400 },
          { param: 'pressure', min: 1, max: 10 },
        ],
      },
      {
        note_zh:
          '② TEOS 饱和：TEOS 经 MFC 进喷淋头，300–400 °C / 1–10 kPa；表面饱和后停，**不是 PECVD 的连续通**',
        performedBy: 'plant/sti-ald-reactor',
        under: [
          { param: 'temperature', min: 300, max: 400 },
          { param: 'pressure', min: 1, max: 10 },
        ],
      },
      {
        note_zh:
          '③ N₂ 吹扫：清残余 TEOS，防气相反应；吹扫不足会在槽口先成核，AR 3.75 中心留 seam/void',
        performedBy: 'plant/sti-ald-reactor',
        under: [
          { param: 'temperature', min: 300, max: 400 },
          { param: 'pressure', min: 1, max: 10 },
        ],
      },
      {
        note_zh:
          '④ O₃/O₂ 反应：O₂ 经无声放电管生成 O₃，进喷淋头把 TEOS 氧化成 SiO₂；O₃ 浓度没有量具，按 O₂ 流量/放电功率开环',
        performedBy: 'plant/sti-ald-reactor',
        under: [
          { param: 'temperature', min: 300, max: 400 },
          { param: 'pressure', min: 1, max: 10 },
        ],
      },
      {
        note_zh:
          '⑤ 循环到 50–150 nm 过填：每循环 0.05–0.1 nm，约 500–3000 循环；之后椭偏读过填厚度。AR 3.75 的槽中心仍有 seam，void 0–5 % 是设计值',
        performedBy: 'plant/sti-ald-reactor',
        under: [
          { param: 'temperature', min: 300, max: 400 },
          { param: 'pressure', min: 1, max: 10 },
        ],
      },
      {
        note_zh:
          '⑥ 椭偏读过填：488 nm、70°/75°；过填 50–150 nm 的 ±10 nm 够判。槽内 void/seam 没有截面量具，测不了',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '衬里片 1 + TEOS 1 g + O₂ 10 g + N₂ 10 g → 填充片 1。SiO₂ 量：槽体积 2.7 mg + 过填 50–150 nm（0.9–2.7 mg）= 3.6–5.4 mg；TEOS 按 3.47 质量比需 12.5–18.7 mg，利用率 10–15 %、腔壁再吃 2.7× ⇒ 0.23–0.5 g，取 1 g。O₂/N₂ 是过量反应/吹扫气，差额进尾气；产物按片计，不是账不平',
  },

];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...STI_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...STI_ROUTES];
