/**
 * CMOS 测量路线与记录 —— 单独放在 data/measure。
 *
 * 约定：`measure/*` 路线和它产出的 `*-record` 条目都归这里；
 * 机器/材料文件只保留工艺路线与器件条目。
 *
 * 本文件从 `data/machine/cmos.ts` 迁出；两边不要重复定义。
 *
 * ───────────────────────────────────────────────────────────────────────────
 * W CMP dishing/erosion（`measure/w-cmp-dishing`）
 * ───────────────────────────────────────────────────────────────────────────
 *
 * 这是 **W CMP 之后的形貌**，不是 Cu dishing：
 *   · 测的是 W 塞阵列与场区氧化层的高差；5 点取 W 塞阵列边缘/中心 +
 *     场区氧化层，不是 Cu 的沟槽/线阵列。
 *   · 5 点是**抽样**，不是全片图；没有 49 点图/全片扫描。
 *   · W 与 SiO₂ 的去除率不同（W 硬、化学惰性；SiO₂ 软、在 CMP 浆里更容易
 *     被磨掉），W 塞的 dishing 可能比 Cu 大；Cu 的 7–30 nm 不能直接套到 W 上。
 *   · **测出来才算**：0–100 nm 是仪器记录窗口，不是设计值；没有测之前，
 *     W CMP 的 dishing/erosion 仍是未标定。
 *   · 只有白光干涉（垂直 0.1 nm、横向 1 µm），没有 TEM/电学；测的是形貌，
 *     不是 W 塞电阻/void。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CMOS_MEASURE_ITEMS: readonly Item[] = [
  /**
   * 反相器 VTC 记录。**是数据，不是物料；一份记录对应一次测量。**
   *
   * 三个规格（**实测窗口**，51 点扫）：
   *   gain        1–10 V/V（VTC 最大斜率；51 点有限差分）
   *   vt          1–3 V（VTC 开关阈值；实测窗口）
   *   noiseMargin 0.2–1.5 V（NMH/NML 的较小者；从 51 点 VTC 上取）
   *
   * 设计值另注：vt 1.5–2.5、gain 3–10、noiseMargin 0.5–1.5。
   * `gives` 是实测窗口（更宽），不是设计窗口；设计值不写成实测。
   */
  {
    id: 'mat/cmos-vtc-record',
    name: '反相器 VTC 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'gain', kind: 'range', min: 1, max: 10, unit: 'V/V' },
      { param: 'vt', kind: 'range', min: 1, max: 3, unit: 'V' },
      { param: 'noiseMargin', kind: 'range', min: 0.2, max: 1.5, unit: 'V' },
    ],
  },

  /**
   * 大马士革片 dishing/erosion 记录。**5 点光学轮廓，不是电测。**
   */
  {
    id: 'mat/dishing-record',
    name: '大马士革片 dishing/erosion 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'dishing', kind: 'range', min: 7, max: 30, unit: 'nm' },
      { param: 'erosion', kind: 'range', min: 30, max: 60, unit: 'nm' },
      { param: 'points', kind: 'range', min: 5, max: 5, unit: '个' },
    ],
  },

  /**
   * 结电容 C-V 记录。**1/C² 外推，不是 SIMS。**
   */
  {
    id: 'mat/junction-cv-record',
    name: '结深 C-V 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'doping', kind: 'range', min: 1e18, max: 1e21, unit: 'cm⁻³' },
      { param: 'junctionDepth', kind: 'range', min: 0.2, max: 0.5, unit: 'µm' },
      { param: 'area', kind: 'range', min: 1e-6, max: 1e-4, unit: 'cm²' },
      { param: 'waferId', kind: 'range', min: 0, max: 1000, unit: '号' },
      { param: 'region', kind: 'enum', values: ['n', 'p', 'both'] },
    ],
  },

  /**
   * p⁺ 激活率记录。**由 `measure/p-plus-activation` 产出。**
   *
   *   activeDose        1.25e13–4.16e15 cm⁻²（由 R□ 30–5000、μ 50–100 算）
   *   mobility          50–100 cm²/V·s（假设区间，不是 Hall 实测）
   *   activationFraction 0–100 %（>100 % 表示 R□/μ 假设与剂量不自洽）
   *   junctionDepth     0.2–0.5 µm（来自 C-V）
   */
  {
    id: 'mat/p-plus-activation-record',
    name: 'p⁺ 激活率记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'activeDose', kind: 'range', min: 1e13, max: 2e15, unit: 'cm⁻²' },
      { param: 'mobility', kind: 'range', min: 50, max: 100, unit: 'cm²/V·s' },
      { param: 'activationFraction', kind: 'range', min: 0, max: 100, unit: '%' },
      { param: 'junctionDepth', kind: 'range', min: 0.2, max: 0.5, unit: 'µm' },
    ],
  },

  /**
   * 阻挡层漏电记录。**0–5 V I-V；击穿没出现就记 0。**
   */
  {
    id: 'mat/barrier-leakage-record',
    name: '阻挡层漏电记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'leakageCurrent', kind: 'range', min: 1e-12, max: 1e-6, unit: 'A' },
      { param: 'breakdownVoltage', kind: 'range', min: 0, max: 200, unit: 'V' },
    ],
  },

  /**
   * 接触电阻 TLM 记录。**是数据，不是物料。**
   *
   * 三个规格：
   *   contactResistivity 1e-6–1e-5 Ω·cm²（设计窗口；实测可能高 2–10 倍）
   *   sheetResistance    50–500 Ω/□（从 R_total–L 的斜率 R_sheet/W 提）
   *   transferLength     1–15 µm（L_t = √(ρc/R_sheet)；设计窗口）
   */
  {
    id: 'mat/contact-resistance-record',
    name: '接触电阻记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'contactResistivity', kind: 'range', min: 1e-6, max: 1e-5, unit: 'Ω·cm²' },
      { param: 'sheetResistance', kind: 'range', min: 50, max: 500, unit: 'Ω/□' },
      { param: 'transferLength', kind: 'range', min: 1, max: 15, unit: 'µm' },
    ],
  },

  /**
   * W plug 四线法记录。**是 W plug 电阻，不是接触电阻。**
   *
   *   plugResistance 0.05–5 Ω/孔（设计 0.05–1；实测窗口更宽）
   *   yieldOpen      0–100 %（10 个孔开孔/导通比例；设计 80–100）
   *   voidFraction   1–5 %（估算，不是电测）
   *   temperature    19–21 °C
   */
  {
    id: 'mat/w-plug-resistance-record',
    name: 'W plug 四线法记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'plugResistance', kind: 'range', min: 0.05, max: 5, unit: 'Ω' },
      { param: 'yieldOpen', kind: 'range', min: 0, max: 100, unit: '%' },
      { param: 'voidFraction', kind: 'range', min: 1, max: 5, unit: '%' },
      { param: 'temperature', kind: 'range', min: 19, max: 21, unit: '°C' },
    ],
  },

  /**
   * W CMP dishing/erosion 记录。**是 W CMP 后的形貌，不是 Cu dishing。**
   *
   *   dishing  0–100 nm（记录窗口；不是设计值）
   *   erosion  0–100 nm（记录窗口；不是设计值）
   *   points   5（W 塞阵列边缘/中心 + 场区氧化层；抽样，不是全片图）
   *   waferId  0–1000
   *
   * ⚠️ W 与 SiO₂ 的去除率不同，W 塞 dishing 可能比 Cu 的 7–30 nm 大；
   * 白光干涉只看形貌，没有 TEM/电学；测出来才算。
   */
  {
    id: 'mat/w-cmp-dishing-record',
    name: 'W CMP dishing/erosion 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'dishing', kind: 'range', min: 0, max: 100, unit: 'nm' },
      { param: 'erosion', kind: 'range', min: 0, max: 100, unit: 'nm' },
      { param: 'points', kind: 'range', min: 5, max: 5, unit: '个' },
      { param: 'waferId', kind: 'range', min: 0, max: 1000, unit: '号' },
    ],
  },

  /**
   * 10 个接触孔的四线法记录。**是数据，不是物料。**
   *
   * 三个规格：
   *   contactResistance 30–1500 Ω/孔（设计窗口；实测可能高 2–10 倍）
   *   yieldOpen         80–100 %（10 个孔里开孔/导通的比例；设计窗口）
   *   holeDiameter      1–2 µm（开孔直径；RIE 定时 + SEM 剖面才能量准）
   */
  {
    id: 'mat/contact-hole-record',
    name: '10 个接触孔的四线法记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'contactResistance', kind: 'range', min: 30, max: 1500, unit: 'Ω' },
      { param: 'yieldOpen', kind: 'range', min: 0, max: 100, unit: '%' },
      { param: 'holeDiameter', kind: 'range', min: 1, max: 2, unit: 'µm' },
    ],
  },

  /**
   * 源漏方阻实测记录。**是数据，不是物料；一份对应一片的 10 个点。**
   *
   * 四个规格：
   *   sheetResistanceN  15–200 Ω/□（n⁺ 是 P，设计 15–80；实测可能高 2–3×）
   *   sheetResistanceP  30–5000 Ω/□（p⁺ 是 Al，设计 30–1500；实测可能更高）
   *   measurementPoints 10 个（n⁺ 5 点 + p⁺ 5 点）
   *   temperature       19–21 °C（四探针在恒温间）
   *
   * ⚠️ 这是方阻，不是结深；没有霍尔/变温台，只有四探针。
   */
  {
    id: 'mat/cmos-sheet-resistance-record',
    name: 'CMOS 方块电阻记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'sheetResistanceN', kind: 'range', min: 15, max: 200, unit: 'Ω/□' },
      { param: 'sheetResistanceP', kind: 'range', min: 30, max: 5000, unit: 'Ω/□' },
      { param: 'measurementPoints', kind: 'range', min: 10, max: 10, unit: '个' },
      { param: 'temperature', kind: 'range', min: 19, max: 21, unit: '°C' },
      { param: 'waferId', kind: 'range', min: 0, max: 1000, unit: '号' },
      { param: 'region', kind: 'enum', values: ['n', 'p', 'both'] },
    ],
  },

  /**
   * 通孔链四线法记录。**是数据，不是物料。**
   *
   * 三个规格：
   *   viaResistance 0.05–5 Ω/孔（Al/Cu 设计 0.1–1；Cu 层低端 0.05；实测可能高）
   *   chainYield    0–100 %（一条链只有“通/不通”；80–100 % 是设计）
   *   viaDiameter   1–1 µm（版图值，不是 probe-station 实测）
   */
  {
    id: 'mat/via-resistance-record',
    name: '通孔链四线法记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'viaResistance', kind: 'range', min: 0.05, max: 5, unit: 'Ω' },
      { param: 'chainYield', kind: 'range', min: 0, max: 100, unit: '%' },
      { param: 'viaDiameter', kind: 'range', min: 1, max: 1, unit: 'µm' },
    ],
  },

  /**
   * 套刻记录。**CD-SEM 读 vernier，不是 40 nm 套刻量测。**
   *
   *   overlayX/Y  ±0.6 µm
   *   points      10
   *   waferId     0–1000
   *   method      cd-sem
   */
  {
    id: 'mat/overlay-record',
    name: '套刻 vernier 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'overlayX', kind: 'range', min: -0.6, max: 0.6, unit: 'µm' },
      { param: 'overlayY', kind: 'range', min: -0.6, max: 0.6, unit: 'µm' },
      { param: 'points', kind: 'range', min: 10, max: 10, unit: '个' },
      { param: 'waferId', kind: 'range', min: 0, max: 1000, unit: '号' },
      { param: 'method', kind: 'enum', values: ['cd-sem'] },
    ],
  },

];

export const CMOS_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **反相器 → 参数分析仪 + 四探针台扫 VTC → 记录 gain / vt / noiseMargin。**
     *
     *   反相器 1 + （无物料）→ VTC 记录 1 份
     *
     * Vdd 5 V；Vin 从 0 到 5 V，**51 点（0.1 V 步进）**，每点读 Vout。
     * `plant/cmos-test/parameter-analyzer` 有 4 SMU、±200 V、1 fA–1 A、1 µV；
     * 接 `plant/probe-station` 的 4 根针做 4 pad 扫描。参数分析仪是 machine，
     * 执行测量；probe-station 在 `needs` 里负责压针。
     *
     * 提取：
     *   vt          VTC 上 Vin = Vout 的那一点（实测窗口 1–3 V；设计 1.5–2.5）
     *   gain        ΔVout/ΔVin 的最大值（51 点有限差分；实测 1–10；设计 3–10）
     *   noiseMargin min(NMH, NML)，用 VOH/VOL 与单位增益点估（实测 0.2–1.5；
     *               设计 0.5–1.5）
     *
     * ⚠️ 记录里的 `gives` 是**实测窗口**（更宽），设计值另注；不是把设计值
     * 写成实测。p⁺ 是 Al 候选、接触孔没做，实测可能仍低于设计。
     */
    id: 'measure/cmos-vtc',
    name: '反相器 VTC 测量',
    produces: [
      {
        item: 'mat/cmos-vtc-record',
        qty: q(1),
        gives: [
          { param: 'gain', kind: 'range', min: 1, max: 10 },
          { param: 'vt', kind: 'range', min: 1, max: 3 },
          { param: 'noiseMargin', kind: 'range', min: 0.2, max: 1.5 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/cmos-inverter-general', qty: q(1) }] }],
    needs: ['plant/metrology-room', 'plant/probe-station'],
    rate: { hours: q(2) },
    steps: [
      {
        note_zh:
          '① 装片/接线：`plant/robot` 把反相器放到 probe-station，4 个 SMU 接 4 根针（Vdd/GND/IN/OUT），开短路校准；probe-station 在 needs 里。19–21 °C',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 扫 VTC：Vdd 5 V、GND 接地，Vin 0→5 V **51 点（0.1 V 步进）**，每点读 Vout；4 SMU 同步，扫描/平均由参数分析仪做，probe-station 只负责接触',
        performedBy: 'plant/cmos-test/parameter-analyzer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 提取：vt = Vin=Vout 的交点；gain = ΔVout/ΔVin 最大斜率（51 点有限差分）；noiseMargin = min(NMH, NML)。实测窗口 gain 1–10、vt 1–3、noiseMargin 0.2–1.5；设计值 3–10 / 1.5–2.5 / 0.5–1.5 另注',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '反相器 1 件 + 无物料 → VTC 记录 1 份。测量不改质量、不消耗反相器（测完可退回/留样）；记录是数据，不是物料。产物按份计，没有质量账；51 点扫描不耗材料，4 个针痕是 µm 级，不进 kg 账',
  },

  {
    /**
     * **TLM → 四线法测 5/10/20 µm 间距 → 外推 R_c / R_sheet / L_t / ρc。**
     *
     *   TLM 1 + （无物料）→ 接触电阻记录 1 份
     *
     * 每两个相邻 pad 之间用四线法测 R_total（外侧两根进电流，内侧两根取电压），
     * 得到 L = 5/10/20 µm 三个点：
     *
     *   R_total(L) = 2R_c + R_sheet·L/W
     *   slope = R_sheet/W；intercept = 2R_c
     *   R_c = intercept/2
     *   ρc = R_c²·W² / R_sheet
     *   L_t = √(ρc / R_sheet)
     *
     * W = 100 µm；L = 5/10/20 µm；只有 3 个点，线性外推的误差很大。
     * 实测可能比设计窗口高 2–10 倍；没有变温台/TLM 曲线仪。
     */
    id: 'measure/contact-resistance',
    name: '接触电阻测量',
    produces: [
      {
        item: 'mat/contact-resistance-record',
        qty: q(1),
        gives: [
          { param: 'contactResistivity', kind: 'range', min: 1e-6, max: 1e-5 },
          { param: 'sheetResistance', kind: 'range', min: 50, max: 500 },
          { param: 'transferLength', kind: 'range', min: 1, max: 15 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/contact-tlm-general', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh:
          '① 四线法测 TLM：`plant/probe-station` 四根针接相邻 pad；外侧两根进 0.1–10 mA，内侧两根读电压；L=5/10/20 µm 三个间距各测一次。19–21 °C，接触热电势用换向平均掉',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 外推：R_total–L 线性拟合，截距 = 2R_c、斜率 = R_sheet/W；ρc = R_c²·W²/R_sheet；L_t = √(ρc/R_sheet)。设计 ρc 1e-6–1e-5 Ω·cm²、R_sheet 50–500 Ω/□ ⇒ L_t 1.4–14.1 µm（取 1–15）。只有 3 个点，误差大；实测可能高 2–10 倍',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'TLM 1 件 + 无物料 → 接触电阻记录 1 份。测量不改质量、不消耗 TLM（测完可退回/留样）；记录是数据，不是物料。产物按份计，没有质量账；探针压痕是 µm 级，不进 kg 账',
  },

  {
    /**
     * **接触孔片 → 10 个孔的四线法 → 记录接触电阻/yieldOpen/孔径。**
     *
     *   接触孔片 1 + （无物料）→ 接触孔记录 1 份
     *
     * 10 个孔逐个用四线法：外侧两根进 0.1–10 mA，内侧两根读电压；
     * R_hole = V/I（含孔底接触 + TiN + Al 塞 + 引线）。开孔/短路按 10 个计数。
     *
     * 孔径 1–2 µm 是设计/工艺记账：CD-SEM 的 cdRange 10–1000 nm
     * （cd-sem.ts:1019）覆盖不了 1–2 µm，所以 `holeDiameter` 不是逐孔实测。
     *
     * ⚠️ 接触电阻设计 30–1500 Ω/孔（ρc/A + 界面）；实测可能高 2–10 倍。
     * 没有 W plug、没有变温台；只有 probe-station 的四线法。
     */
    id: 'measure/contact-hole-resistance',
    name: '10 个接触孔的四线法测量',
    produces: [
      {
        item: 'mat/contact-hole-record',
        qty: q(1),
        gives: [
          { param: 'contactResistance', kind: 'range', min: 30, max: 1500 },
          { param: 'yieldOpen', kind: 'range', min: 80, max: 100 },
          { param: 'holeDiameter', kind: 'range', min: 1, max: 2 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/contacted-wafer', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh:
          '① 四线法测 10 个孔：`plant/probe-station` 四根针压在一个孔的四点上；外侧两根进 0.1–10 mA，内侧两根读电压；19–21 °C，换向平均掉热电势。10 个孔逐个测，记 R_hole = V/I',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 记录：yieldOpen = 10 个孔里导通的比例（80–100 % 是设计窗口）；contactResistance = 30–1500 Ω/孔的设计窗口；holeDiameter 1–2 µm 是光刻/RIE 的记账值，不是 CD-SEM 实测（cdRange 只到 1000 nm）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '接触孔片 1 片 + 无物料 → 接触孔记录 1 份。测量不改质量、不消耗片（测完可退回/留样）；记录是数据，不是物料。产物按份计，没有质量账；10 个针痕是 µm 级，不进 kg 账',
  },

  {
    /**
     * **通孔链 → 四线法测链电阻 → 除以 100 → 单孔电阻记录。**
     *
     *   通孔链 1 + （无物料）→ 通孔电阻记录 1 份
     *
     *   R_chain = 100·R_via + 2R_pad + R_wire
     *   R_via ≈ R_chain / 100（四线法，pad/引线可忽略）
     *
     * 设计 R_via 0.1–1 Ω ⇒ R_chain 10–100 Ω；实测可能高 2–5×。
     * `chainYield` 对一条串联链只有“通/不通”，80–100 % 是设计；
     * `viaDiameter` 1 µm 是版图值，probe-station 量不了。
     */
    id: 'measure/via-resistance',
    name: '通孔链四线法测量',
    produces: [
      {
        item: 'mat/via-resistance-record',
        qty: q(1),
        gives: [
          { param: 'viaResistance', kind: 'range', min: 0.05, max: 5 },
          { param: 'chainYield', kind: 'range', min: 0, max: 100 },
          { param: 'viaDiameter', kind: 'range', min: 1, max: 1 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/via-chain-general', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh:
          '① 四线法测链：`plant/probe-station` 四根针接两端 pad 的内外点；外侧两根进 0.1–10 mA，内侧两根读电压；19–21 °C，换向平均掉热电势。R_chain = V/I',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 除以 100：R_via = R_chain/100；设计 0.1–1 Ω/孔、链 10–100 Ω。chainYield 对一条串联链只有通/不通；viaDiameter 1 µm 是版图值，不是 probe-station 实测。实测可能高 2–5×，记录分开写',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '通孔链 1 件 + 无物料 → 通孔电阻记录 1 份。测量不改质量、不消耗链（测完可退回/留样）；记录是数据，不是物料。产物按份计，没有质量账；探针压痕是 µm 级，不进 kg 账',
  },

  {
    /**
     * **Cu 通孔片 / 双大马士革片 → 白光干涉 5 点 → dishing/erosion 记录。**
     *
     *   `mat/cu-via-layer` 1 或 `mat/dual-damascene-layer` 1
     *     → `mat/dishing-record` 1 份
     *
     * `plant/cmos-test/optical-profiler`：垂直 0.1 nm、范围 1 mm、横向 1 µm。
     * 5 点线扫，读 dishing 7–30 nm、erosion 30–60 nm；设计窗口，不是实测值。
     * optical-profiler 是 machine，执行测量；robot 只装片。
     */
    id: 'measure/damascene-dishing',
    name: '大马士革 CMP 碟形凹陷与侵蚀测量',
    produces: [
      {
        item: 'mat/dishing-record',
        qty: q(1),
        gives: [
          { param: 'dishing', kind: 'range', min: 7, max: 30 },
          { param: 'erosion', kind: 'range', min: 30, max: 60 },
          { param: 'points', kind: 'range', min: 5, max: 5 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          { item: 'mat/cu-via-layer', qty: q(1) },
          { item: 'mat/dual-damascene-layer', qty: q(1) },
        ],
      },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh:
          '① 装片与找基准：`plant/robot` 把片放到 optical-profiler 台面，用 1 µm 横向分辨率找 5 个测试点；垂直 0.1 nm、范围 1 mm。这一步只装片，不做测量',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 5 点线扫：由 optical-profiler 读 dishing 7–30 nm、erosion 30–60 nm；白光干涉只看形貌，不看电学。5 点是设计窗口，不是全片图；不需要压针，所以不把 probe-station 放进 needs',
        performedBy: 'plant/cmos-test/optical-profiler',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'Cu 通孔片/双大马士革片 1 片 + 无物料 → dishing 记录 1 份。光学测量不改质量、不消耗片（测完可退回）；记录是数据，不是物料。产物按份计，没有质量账；5 个光斑是 µm 级，不进 kg 账',
  },

  {
    /**
     * **cmos-sd-wafer → LCR 表 C-V → 1/C² 外推掺杂/结深。**
     *
     *   `mat/cmos-sd-wafer` 1 → `mat/junction-cv-record` 1 份
     *
     * `plant/cmos-test/lcr-meter`：进口机 10 Hz–1 MHz、1 %；本地 C-V 桥
     * `make/cmos-test-lcr-meter` 1 kHz–1 MHz、0.3–3 %（1–10 pF 3 %）；probe-station 接
     * n⁺/p⁺ 测试结。扫 C-V，1/C² 对 V 的斜率给 doping，截距给 built-in
     * potential，再结合面积估 junctionDepth。lcr-meter 是 machine，执行测量；
     * probe-station 在 `needs` 里负责压针。
     *
     * ⚠️ 不是 SIMS：C-V 外推的结深是电学结，不是冶金结；面积靠版图/pad 算，
     * 没有逐点面积测量。1 % 是进口机手册值；本地 C-V 桥 0.3–3 %，证书/校准仍缺。
     */
    id: 'measure/junction-depth-cv',
    name: '结深 C-V 测量',
    produces: [
      {
        item: 'mat/junction-cv-record',
        qty: q(1),
        gives: [
          { param: 'doping', kind: 'range', min: 1e18, max: 1e21 },
          { param: 'junctionDepth', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'area', kind: 'range', min: 1e-6, max: 1e-4 },
          { param: 'waferId', kind: 'range', min: 0, max: 1000 },
          { param: 'region', kind: 'enum', oneOf: ['both'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/cmos-sd-wafer', qty: q(1) }] }],
    needs: ['plant/metrology-room', 'plant/probe-station'],
    rate: { hours: q(2) },
    steps: [
      {
        note_zh:
          '① 装片/接线：`plant/robot` 把片放到 probe-station，两根针压到 n⁺/p⁺ 测试结的 pad 上；probe-station 在 needs 里。LCR 表：进口机 10 Hz–1 MHz/1 %，本地 C-V 桥 1 kHz–1 MHz/0.3–3 %；面积按版图/pad 算，没有逐点面积测量',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 扫 C-V：由 LCR 表在 10 kHz–1 MHz 取 C-V；1/C² 对 V 的斜率给 doping，截距给 built-in potential，再结合面积估 junctionDepth',
        performedBy: 'plant/cmos-test/lcr-meter',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 记录：doping 1e18–1e21 cm⁻³、junctionDepth 0.2–0.5 µm、area 1e-6–1e-4 cm²。**p⁺ 结面积取法**：C-V 探针压在 p⁺ 测试结的 100×100 µm pad 上，area 按版图 p⁺ 结窗口算（1e-4 cm² 量级）；n⁺ 区的面积不混用。这是电学结，不是 SIMS 冶金结；1 % 是进口机手册精度，本地 C-V 桥 0.3–3 %（1–10 pF 3 %），证书/校准仍缺',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'cmos-sd-wafer 1 片 + 无物料 → 结电容记录 1 份。C-V 不改质量、不消耗片（测完可退回）；记录是数据，不是物料。产物按份计，没有质量账；探针压痕是 µm 级，不进 kg 账',
  },

  {
    /**
     * **通孔链 / Cu 通孔片 → 参数分析仪 0–5 V 漏电 → 阻挡层漏电记录。**
     *
     *   `std/via-chain-general` 1 件 → `mat/barrier-leakage-record` 1 份
     *
     * `mat/cu-via-layer` 是同一测量的替代样品（片），但单位不同，不能和
     * 通孔链（件）塞进同一个 anyOf；本路线选通孔链，Cu 片要走另一条测量。
     *
     * `plant/cmos-test/parameter-analyzer`：4 SMU、±200 V、1 fA–1 A、1 µV。
     * 0–5 V 扫 I-V，读 leakageCurrent；击穿没出现就记 breakdownVoltage=0。
     * 参数分析仪是 machine，执行测量；probe-station 在 needs 里负责压针。
     *
     * ⚠️ 0–5 V 看不到 >5 V 的击穿；`breakdownVoltage` 的 0 是“未观察到”，
     * 不是“0 V 击穿”。漏电窗口 1 pA–1 µA 是设计值，证书/校准仍缺。
     */
    id: 'measure/barrier-leakage',
    name: '阻挡层漏电测量',
    produces: [
      {
        item: 'mat/barrier-leakage-record',
        qty: q(1),
        gives: [
          { param: 'leakageCurrent', kind: 'range', min: 1e-12, max: 1e-6 },
          { param: 'breakdownVoltage', kind: 'range', min: 0, max: 200 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/via-chain-general', qty: q(1) }] }],
    needs: ['plant/metrology-room', 'plant/probe-station'],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh:
          '① 装片/接线：`plant/robot` 把通孔链放到 probe-station，SMU 接到链两端；probe-station 在 needs 里。参数分析仪 4 SMU、±200 V、1 fA–1 A',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 0–5 V 扫 I-V：由参数分析仪读 leakageCurrent 1 pA–1 µA；击穿没出现就记 breakdownVoltage=0（“未观察到”，不是 0 V 击穿）。0–5 V 看不到 >5 V 的击穿',
        performedBy: 'plant/cmos-test/parameter-analyzer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '通孔链 1 件 + 无物料 → 漏电记录 1 份。电测不改质量、不消耗样品（测完可退回）；记录是数据，不是物料。产物按份计，没有质量账；探针压痕是 µm 级，不进 kg 账',
  },

  {
    /**
     * **W plug 片 → 开孔检测 → 四线法 10 孔 → 统计。**
     *
     *   `mat/w-plug-wafer` 1 → `mat/w-plug-resistance-record` 1 份
     *
     * 0–0.2 V 小偏压四线法，10 个 W plug；不是接触电阻（contactResistance
     * 是 Al/TiN/Si 的接触，plugResistance 是 W 塞本身）。
     * 参数分析仪是 machine，执行测量；probe-station 装片/压针；
     * 没有变温台，只记 19–21 °C。
     *
     * ⚠️ W CMP dishing/void 未标定；voidFraction 是估算，不是电测。
     */
    id: 'measure/w-plug-resistance',
    name: 'W plug 四线法测量',
    produces: [
      {
        item: 'mat/w-plug-resistance-record',
        qty: q(1),
        gives: [
          { param: 'plugResistance', kind: 'range', min: 0.05, max: 5 },
          { param: 'yieldOpen', kind: 'range', min: 0, max: 100 },
          { param: 'voidFraction', kind: 'range', min: 1, max: 5 },
          { param: 'temperature', kind: 'range', min: 19, max: 21 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/w-plug-wafer', qty: q(1) }] }],
    needs: ['plant/metrology-room', 'plant/temperature-standard'],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh:
          '① 开孔检测：`plant/probe-station` 装片/压针，10 个 W plug 逐个通断；开孔率记 yieldOpen。19–21 °C',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 四线法单孔电阻：参数分析仪 4 SMU，0–0.2 V 小偏压（避免自热/非线性），外侧两根进电流、内侧两根取电压；10 个孔逐个测 R=V/I',
        performedBy: 'plant/cmos-test/parameter-analyzer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 统计：10 点中位/分布；plugResistance 0.05–5 Ω 实测窗口（设计 0.05–1）；voidFraction 1–5 % 是估算，不是电测；没有变温台，只记 19–21 °C',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'W plug 片 1 + 无物料 → W plug 电阻记录 1 份。电测不改质量、不消耗片（测完可退回）；记录是数据，不是物料。产物按份计，没有质量账；10 个针痕是 µm 级，不进 kg 账',
  },

  {
    /**
     * **W plug 片 → 白光干涉 5 点 → W CMP dishing/erosion 记录。**
     *
     *   `mat/w-plug-wafer` 1 → `mat/w-cmp-dishing-record` 1 份
     *
     * 5 点：W 塞阵列边缘、W 塞阵列中心、场区氧化层（每个点都跨 W/氧化物台阶）。
     * `plant/cmos-test/optical-profiler`：垂直 0.1 nm、范围 1 mm、横向 1 µm。
     * 读 dishing/erosion 0–100 nm 记录窗口；**不是设计值**，测出来才算。
     *
     * ⚠️ 这是 W CMP 形貌，不是 Cu dishing：W 与 SiO₂ 去除率不同，
     * W 塞 dishing 可能比 Cu 大；5 点是抽样，不是全片图；没有 TEM/电学。
     */
    id: 'measure/w-cmp-dishing',
    name: '钨 CMP 碟形凹陷与侵蚀测量',
    produces: [
      {
        item: 'mat/w-cmp-dishing-record',
        qty: q(1),
        gives: [
          { param: 'dishing', kind: 'range', min: 0, max: 100 },
          { param: 'erosion', kind: 'range', min: 0, max: 100 },
          { param: 'points', kind: 'range', min: 5, max: 5 },
          { param: 'waferId', kind: 'range', min: 0, max: 1000 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/w-plug-wafer', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh:
          '① 装片与找基准：`plant/robot` 把 W plug 片放到 optical-profiler 台面，用 1 µm 横向分辨率找 5 个点：W 塞阵列边缘 2 点、阵列中心 1 点、场区氧化层 2 点；垂直 0.1 nm、范围 1 mm。这一步只装片，不做测量',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 5 点线扫：由 optical-profiler 读 W 塞与场区氧化层的高差，记 dishing/erosion 0–100 nm；白光干涉只看形貌，不看电学。5 点是抽样，不是全片图；不需要压针，所以不把 probe-station 放进 needs。W 与 SiO₂ 去除率不同，W 塞 dishing 可能比 Cu 大，Cu 的 7–30 nm 不能直接套',
        performedBy: 'plant/cmos-test/optical-profiler',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 记录：5 点的中位/最大 dishing、erosion + waferId；0–100 nm 是仪器记录窗口，不是设计值。没有 TEM/电学，形貌测出来才算；W CMP 的 dishing/erosion 在测之前仍是未标定',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'W plug 片 1 片 + 无物料 → W CMP dishing/erosion 记录 1 份。光学测量不改质量、不消耗片（测完可退回）；记录是数据，不是物料。产物按份计，没有质量账；5 个光斑是 µm 级，不进 kg 账',
  },

  {
    /**
     * **两本记录 → p⁺ 激活率：D_active = 1/(q·μ·R□)。**
     *
     *   `mat/cmos-sheet-resistance-record` 1（region 含 p）
     *   + `mat/junction-cv-record` 1（region 含 p）
     *     → `mat/p-plus-activation-record` 1 份
     *
     * 两本记录的 `waferId` 必须相同、`region` 必须含 p（p 或 both）；
     * 代码只校验单本的 region 覆盖 p，**不强制跨条目 waferId 相等** ——
     * 第①步人工核对，不等则整份记录作废。
     *
     * 公式：D_active = 1/(q·μ·R□)，activationFraction = D_active/1e15。
     * μ 取 50–100 cm²/V·s（假设区间，不是 Hall 实测）。
     * activationFraction >100 % 时记 100 %，并注明 R□/μ 不自洽。
     *
     * ⚠️ 这是电学提取，不是 Hall/SIMS；mobility 区间让结果带 2× 不确定度。
     */
    id: 'measure/p-plus-activation',
    name: 'p⁺ 激活率测量',
    produces: [
      {
        item: 'mat/p-plus-activation-record',
        qty: q(1),
        gives: [
          { param: 'activeDose', kind: 'range', min: 1e13, max: 2e15 },
          { param: 'mobility', kind: 'range', min: 50, max: 100 },
          { param: 'activationFraction', kind: 'range', min: 0, max: 100 },
          { param: 'junctionDepth', kind: 'range', min: 0.2, max: 0.5 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/cmos-sheet-resistance-record',
            qty: q(1),
            need: [{ param: 'region', kind: 'enum', oneOf: ['both'] }],
            onRelax: 'functional-lost',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/junction-cv-record',
            qty: q(1),
            need: [{ param: 'region', kind: 'enum', oneOf: ['both'] }],
            onRelax: 'functional-lost',
          },
        ],
      },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh:
          '① 核对 waferId：两本记录的 waferId 必须相同（0–1000）。代码不强制跨条目相等，靠这一步人工核对；不同片则整份记录作废',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 核对 region：两本记录都必须含 p（p 或 both）；n-only 的记录不能用于 p⁺ 激活率。C-V 的 area 是 p⁺ 测试结 100×100 µm pad 的面积，不能拿 n⁺ 区面积顶',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 计算：D_active = 1/(q·μ·R□)，μ 取 50–100 cm²/V·s；activationFraction = D_active/1e15；junctionDepth 取 C-V 的 0.2–0.5 µm。>100 % 时记 100 %，并注明 R□/μ 不自洽。没有 Hall/SIMS，这是电学提取，结果带 2× 不确定度',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '方阻记录 1 份 + C-V 记录 1 份 → p⁺ 激活率记录 1 份。记录是数据，不是物料；没有质量账。两本记录的 waferId 相同、region 含 p 才有效；activationFraction >100 % 时记 100 % 并注明不自洽',
  },

  {
    /**
     * **CD-SEM 读 box-in-box vernier：X/Y 各 10 点，算均值/3σ。**
     *
     *   `mat/ldd-wafer` 1（dual-LDD，lddType=both、overlayMarks=present）
     *   + `std/overlay-vernier-general` 1（设计输入）
     *     → `mat/overlay-record` 1 份
     *
     * **vernier 由两块 LDD 版同时印出**：外框来自第一块版、内框来自
     * 第二块版，才能读两次套刻的叠加。`make/dual-ldd-spacer` 已把
     * `std/overlay-vernier-general` 放进 uses，两条版都带 marks；单条 n/p LDD
     * 是 `overlayMarks: absent`，不测。CD-SEM 只看 5 µm 框（外框）与 2 µm 内框，
     * **不是 40 nm 套刻量测**；0.1 µm 台阶是 vernier 的读数分辨率，不是 CD-SEM 的束斑。
     *
     * 10 点、X/Y 各一组；overlayX/Y 记均值，3σ 是重复性，不是绝对套刻误差。
     */
    id: 'measure/overlay-vernier',
    name: '套刻 vernier 测量',
    produces: [
      {
        item: 'mat/overlay-record',
        qty: q(1),
        gives: [
          { param: 'overlayX', kind: 'range', min: -0.5, max: 0.5 },
          { param: 'overlayY', kind: 'range', min: -0.5, max: 0.5 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
          { param: 'waferId', kind: 'range', min: 0, max: 1000 },
          { param: 'method', kind: 'enum', oneOf: ['cd-sem'] },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/ldd-wafer',
            qty: q(1),
            need: [
              { param: 'lddType', kind: 'enum', oneOf: ['both'] },
              { param: 'overlayMarks', kind: 'enum', oneOf: ['present'] },
            ],
            onRelax: 'functional-lost',
          },
        ],
      },
    ],
    needs: ['std/overlay-vernier-general', 'plant/metrology-room'],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh:
          '① CD-SEM 找 X/Y vernier：外框 5 µm、内框 2 µm；dual-LDD 版已有 marks，单条 n/p LDD 片没有，不测',
        performedBy: 'plant/cd-sem',
      },
      {
        note_zh:
          '② 读 10 点内外框偏移：每点读 X/Y 各一次，0.1 µm/级台阶给读数；CD-SEM 只看 5 µm 框，不是 40 nm 套刻',
        performedBy: 'plant/cd-sem',
      },
      {
        note_zh:
          '③ 算均值/3σ：overlayX/Y 记均值，3σ 记重复性；10 点、X/Y 各一组。结果给 ±0.5 µm 窗口，不是 40 nm 判据',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'dual-LDD 片 1 + vernier 设计输入 1 件 → 套刻记录 1 份。vernier 是版图标记，不消耗；记录是数据，不是物料。dual-LDD 片有 marks，single-LDD 片没有，只测 dual 片',
  },

  {
    /**
     * **Cu/TiN/栅氧 MOS 电容 → 初始 C-V/I-V → 离位 BTS → 冷却复测。**
     *
     *   `mat/cu-bts-wafer` 1 → `mat/cu-bts-record` 1 份
     *
     * 150–200 °C、1 MV/cm、1 h；**探针不留在炉里**，偏压通过炉外引线/焊盘加，
     * 炉子只 hold 温度，不 hold 电场。冷却后复测 C-V/I-V。
     *
     * 没有热台：stress 时不能原位测；1 MV/cm 是设计值；Cu 深能级复合中心
     * 只能靠漏电/寿命间接看，不是直接测 Cu 浓度。rate 4 h。
     */
    id: 'measure/cu-bts-leakage',
    name: 'Cu 离位 BTS 测量',
    produces: [
      {
        item: 'mat/cu-bts-record',
        qty: q(1),
        gives: [
          { param: 'leakageBefore', kind: 'range', min: 1e-12, max: 1e-6 },
          { param: 'leakageAfter', kind: 'range', min: 1e-12, max: 1e-6 },
          { param: 'flatbandShift', kind: 'range', min: -5, max: 5 },
          { param: 'stressTemperature', kind: 'range', min: 150, max: 200 },
          { param: 'stressField', kind: 'range', min: 1, max: 1 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/cu-bts-wafer', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① 初始 C-V：LCR 表 10 kHz–1 MHz，扫积累/耗尽，记 flatband/oxide 电容；100×100 µm pad，面积 1e-4 cm²',
        performedBy: 'plant/cmos-test/lcr-meter',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 初始 I-V：参数分析仪 0–5 V（或到 1 MV/cm 对应电压），记 leakageBefore；1 MV/cm × 1.5–4.5 nm = 0.15–0.45 V',
        performedBy: 'plant/cmos-test/parameter-analyzer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 离位 BTS：150–200 °C、加 1 MV/cm 偏压 1 h；**探针不留在炉里**，用炉外引线/焊盘加偏压。炉子只 hold 温度，不 hold 电场',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 150, max: 200 }],
      },
      {
        note_zh:
          '④ 冷却后复测 C-V：同一 pad、同一 LCR 设置；flatbandShift 是 after−before，不是 absolute',
        performedBy: 'plant/cmos-test/lcr-meter',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑤ 复测 I-V：同参数分析仪，记 leakageAfter；leakage 增大/flatband 漂移是 Cu 扩散的间接信号，不是 Cu 浓度',
        performedBy: 'plant/cmos-test/parameter-analyzer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑥ 记录：leakageBefore/After、flatbandShift、stressTemperature、stressField。没有热台，stress 时没有原位数据；1 MV/cm 是设计值',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'Cu/TiN/栅氧试样 1 片 → BTS 记录 1 份。电测/退火不改质量、不消耗片；记录是数据，不是物料。产物按份计，没有质量账；探针压痕是 µm 级，不进 kg 账',
  },


  {
    /**
     * **cmos-sd-wafer → 划片道清洁 → 版图标记定位 → 四探针 5+5 点 → 方阻记录。**
     *
     *   `mat/cmos-sd-wafer` 1 + （无物料）→ 方阻记录 1 份
     *
     * n⁺ 区 5 点、p⁺ 区 5 点，共 10 点；每点用四探针读 R□。
     * 温度 19–21 °C（恒温间）；版图标记/焊盘只用来找 n⁺/p⁺ 区。
     *
     * ⚠️ 这是**方阻**，不是结深：四探针只能测 R□；结深仍要 SEM 剖面
     * （e-beam 束斑 12 nm），本路线没有切片/剖面步骤。
     * n⁺ 是 P，设计 15–80 Ω/□；p⁺ 是 Al，设计 30–1500 Ω/□，实测可能更高
     * （Al 固溶度/团簇）。没有霍尔/变温台，只有 probe-station。
     */
    id: 'measure/cmos-sheet-resistance',
    name: 'CMOS 方块电阻测量',
    produces: [
      {
        item: 'mat/cmos-sheet-resistance-record',
        qty: q(1),
        gives: [
          { param: 'sheetResistanceN', kind: 'range', min: 15, max: 200 },
          { param: 'sheetResistanceP', kind: 'range', min: 30, max: 5000 },
          { param: 'measurementPoints', kind: 'range', min: 10, max: 10 },
          { param: 'temperature', kind: 'range', min: 19, max: 21 },
          { param: 'waferId', kind: 'range', min: 0, max: 1000 },
          { param: 'region', kind: 'enum', oneOf: ['both'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/cmos-sd-wafer', qty: q(1) }] }],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/temperature-standard'],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh:
          '① 划片道清洁：20–40 °C 水 + 刷洗/冲洗，去掉划片道的碎屑；甩干。四探针要压在干净表面上，否则接触电阻把 R□ 读高',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '② 定位 n⁺/p⁺ 区：用版图标记/焊盘在 `plant/mask-aligner` 的物镜下找有源区；这一步只定位，不曝光。版图标记只能给“大概在哪”，不能替代结深剖面',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '③ 四探针 5+5 点：`plant/probe-station` 在 n⁺ 区打 5 点、p⁺ 区打 5 点；每点读 R□（0.001–1e6 Ω/□ 量程，本层 15–5000）。19–21 °C；四探针只测方阻，不测结深',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '④ 记录：10 个点、每区 5 点；温度 19–21 °C；n⁺ 设计 15–80、p⁺ 设计 30–1500。p⁺ 是 Al 掺杂，实测可能比设计高；记录里把设计窗口和实测值分开写',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'cmos-sd-wafer 1 片 + 无物料 → 方阻记录 1 份。测量不改质量、不消耗片（测完可退回/留样）；记录是数据，不是物料。产物按份计，没有质量账；10 个探针压痕是 µm 级，不进 kg 账',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CMOS_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CMOS_MEASURE_ROUTES];
