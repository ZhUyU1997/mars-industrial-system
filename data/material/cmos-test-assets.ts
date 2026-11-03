/**
 * CMOS 验证用的测试设备 —— **三台都有路线了（2026-10-20）**：参数分析仪
 * `data/machine/cmos-analyzer.ts`、光学轮廓仪 `data/measure/optical-metrology.ts`、
 * LCR 表有一条本地降级 C-V 桥路线。
 * R9 状态仍是未闭合。
 *
 * 现有量具只到“能测通断/方阻”：`plant/probe-station` 是 DC 四线，VTC 只有
 * 5–10 点；dishing 7–30 nm 用 0.295 µm/条纹的干涉仪看不见；结深没有 C-V/SIMS；
 * 阻挡层针孔没有漏电测试。这三件是验证链的最小补齐。
 *
 * 边界：
 *   · 三件都是 **machine**，`performedBy` 可以指；不是 part；
 *   · R9 仍是未闭合；测试设备不要求本地复制不等于 R9 自动豁免；
 *   · 不新增生产设备；测量路线在 cmos.ts；
 *   · **证书/校准仍缺**：到货只做开箱通电与自检，没有 CNAS/原厂校准，
 *     精度按手册值记降级；这不是“已校准”。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 2026-10-20 核：三台各差多少
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   参数分析仪  1 fA 是墙：本地低电流读出下限 1 pA（`measure/barrier-leakage`）
 *               差 1 000 倍；最好的锁相噪声 ~32 fA（0.32 pA、SNR 10，
 *               `particle-counter.ts`）差 32 倍；本地半导体运放输入偏置 **nA 级**
 *               （`mask-repair.ts:634`）差 10⁶ 倍。24 位 ADC 也没有（本地 4 位
 *               DVM = 1e-4，差 1 000 倍）。⇒ **2026-10-20 补路线**
 *               （`data/machine/cmos-analyzer.ts`；仍是降级，见该文件三条边界）。
 *   光学轮廓仪  原来 0.1 nm 垂直：本层闭环最好 0.52 nm（`plant/ref-flat-interferometer`，
 *               差 5 倍）；1 µm 横向：本层光学物镜最好 4.8 µm（`plant/mask-aligner`，
 *               差 4.8 倍）。**两个条件没有一台同时满足** —— 0.52 nm 那台是 φ300
 *               面形仪，没有显微物镜；4.8 µm 物镜那台没有纳米级高度读出。
 *               ⇒ **2026-10-20 补路线**（`data/measure/optical-metrology.ts`）：
 *               Mirau 物镜 + PZT 移相台 + 白光光源 + 计量 CCD，整机
 *               0.05–0.2 nm / 0.5–1 µm / FOV 0.1–2 mm（设计值）。
 *   LCR 表      本地 C-V 桥（`plant/probe-station/cv-bridge` 的路线）1 kHz–1 MHz、
 *               1 pF–1 nF、0.3–3 %；进口机 10 Hz–1 MHz/1 %。⇒ **有降级路线**，
 *               但它是 C-V 桥，不是通用 LCR：没有 10 Hz–1 kHz、没有 L/R。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CMOS_TEST_ITEMS: readonly Item[] = [
  /**
   * 参数分析仪。**4 SMU、±200 V、1 fA–1 A、1 µV。**
   *
   * 用途：I-V / C-V 曲线；VTC 51 点扫描；阻挡层漏电 0–5 V。
   * 它是 **machine**，可以在测量步骤里做 `performedBy`；不是 part。
   *
   * ── 2026-10-20 补路线 ─────────────────────────────────────────────────
   *
   * 下面这段"缺什么"保留为缺口账；**结论已改**：三笔墙各拆成一条路线，
   * 见 `data/machine/cmos-analyzer.ts`：
   *   · 1 fA：筛选 MOS（不是 JFET/静电计管）+ 电荷积分 10 pF + 保护环 + PTFE；
   *   · 24 位：双积分 + 一级多斜率 + 5 位分压 + 零位比较（238 nV/LSB，ENOB 20–22）；
   *   · ±200 V：hv-source-500v 六件 + 100:1 精密分压 + 微调环（0.1–1 mV 设定）。
   * 仍是降级：1 fA 只在 |V| ≤ 1 V、绝对准确度 0.1 %（齐纳）、没有 CNAS。
   *
   * ── 为什么当初没有本地产出路线（2026-10-20 核；缺口账）─────────────────
   *
   * ① **1 fA 是墙，不是 1 µV。**
   *    · 本地低电流读出的下限是 **1 pA**（`measure/barrier-leakage` 的窗口下限，
   *      `pd-charge-amp.ts:194`），比 1 fA 大 **1 000 倍**；
   *    · 本地最好的锁相低电流噪声约 **32 fA**（`particle-counter.ts:1125`：
   *      0.32 pA 给 SNR 10 ⇒ 噪声 32 fA），仍大 **32 倍**；
   *    · 本地半导体运放的输入偏置电流是 **nA 级**（`mask-repair.ts:634`），
   *      比 1 fA 大 **10⁶ 倍** —— 用本地运放搭跨阻，信号被偏置电流淹没；
   *    · 低漏输入器件也没有：静电计管要 Sr 阴极、10 µm 栅、低漏封装与 50 fA
   *      测试四样（`pd-charge-amp.ts` §四全否），低漏 JFET 全表 0 条。
   * ② **4 SMU 不是墙。** `plant/probe-station` 的恒流源/零位表/偏压源各有路线，
   *    复制 4 套即可 —— 但它们是 **1 µA–100 mA、±10 V**，不是 1 fA/±200 V。
   * ③ **24 位 ADC 没有。** 本地 4 位 DVM（`clock.ts:73`）是 1e-4（约 13 位），
   *    24 位要 1e-7，差 **1 000 倍**；5 位分压器 + 零位表给到 1e-5（约 17 位），
   *    仍差 **100 倍**。没有 24 位 ADC 的芯片/模块路线。
   * ④ **±200 V 也不是现成的。** 本地偏压源 ±10 V（差 20 倍）；`plant/hv-test-bench`
   *    有 3 kV/100 kV，但那是耐压与局放，不是 µV 分辨的精密源。
   *
   * ⇒ **2026-10-20 起做降级路线，不是"不做"。** 1 fA 用筛选 MOS + 电荷积分，
   *   24 位用双积分/多斜率，±200 V 用粗档 + 100:1 分压 + 微调环；三条都在
   *   `data/machine/cmos-analyzer.ts`。**仍不是"第二台进口参数分析仪"**：
   *   1 fA 只在 |V| ≤ 1 V、绝对准确度 0.1 %（齐纳）、没有 CNAS 证书 ——
   *   这三条边界写在路线的 `gives` 与注释里，不写成"已闭合"。
   */
  {
    id: 'plant/cmos-test/parameter-analyzer',
    name: '参数分析仪',
    unit: '台',
    category: 'machine',
    // ⚠️ **它不维持温度。** 19–21 °C 是计量间 `plant/metrology-room` 的条件
    // （测量路线与造它的路线都在 `needs` 里写计量间）。原来的
    // `holds: 15–30` 是从测试台抄过来的，与 LCR 表同一处抄写错误
    // （2026-10-20 修）：仪器"能在 15–30 °C 工作"不等于"它能维持 15–30 °C"。
    // 保留它会让 `condition_cycle` 成立 —— 它提供 19–21，而造它又要 19–21。
    props: [
      { param: 'smuCount', kind: 'range', min: 4, max: 4, unit: '个' },
      { param: 'voltageRange', kind: 'range', min: -200, max: 200, unit: 'V' },
      { param: 'currentMin', kind: 'range', min: 1e-15, max: 1e-15, unit: 'A' },
      { param: 'currentMax', kind: 'range', min: 1, max: 1, unit: 'A' },
      { param: 'voltageResolution', kind: 'range', min: 1e-6, max: 1e-6, unit: 'V' },
      { param: 'measure/leakage', kind: 'range', min: 1e-12, max: 1, unit: 'A' },
    ],
  },

  /**
   * 白光干涉光学轮廓仪。**垂直 0.05–0.2 nm、范围 1 mm、横向 0.5–1 µm。**
   *
   * 用途：dishing / erosion / 台阶；5 点线扫。它是 **machine**，可以在测量
   * 步骤里做 `performedBy`；不是 part。
   *
   * ── 2026-10-20 之前为什么没有路线（缺口账，保留）────────────────────────
   *
   * ① **垂直 0.1 nm**：本层最好的**闭环**高度读数是 0.52 nm
   *    （`plant/ref-flat-interferometer`，λ/1000 多光束 F-P，差 **5 倍**）；
   *    `plant/interferometer` 15 nm（1/20 条纹，差 **150 倍**）；
   *    `plant/ellipsometer` 0.019 nm 但光斑 0.2 mm、只测膜厚不测形貌。
   *    0.1 nm 在 0.52 nm 的噪声里是 0.19 倍信噪比（`ref-flat.ts:309`），
   *    不是“再稳一点”能到的。
   * ② **横向 1 µm**：本层光学物镜最好 **4.8 µm**（`plant/mask-aligner`，
   *    `gate-stack.ts:950`，差 4.8 倍）；`plant/cd-sem` 4 nm 是电子束、不给高度；
   *    `plant/comparator` 1 µm 是接触式单点，不是成像。
   *    **0.1 nm 与 1 µm 两个条件没有一台同时满足** —— 0.52 nm 那台是 φ300
   *    平晶的斐索面形仪，没有显微物镜，读的是整口径条纹图；4.8 µm 物镜那台
   *    没有纳米级高度读出。
   * ③ **要造它得补五样**：白光光源、Mirau/干涉物镜、面阵计量探测器、
   *    PZT 移相台、0.1 nm 台阶标准。前四样是设备/器件，第五样是标准 ——
   *    2026-10-20 五样都写成了条目 + 路线，见 `data/measure/optical-metrology.ts`。
   * ④ **降级也救不了**：用 `plant/ref-flat-interferometer` 做单点高度，
   *    垂直 0.52 nm、横向是整口径（mm 级）；`measure/damascene-dishing` 要读
   *    7–30 nm 的 dishing 与 1 µm 线宽，横向差三个量级，读数只是“整片平均”，
   *    不是 5 点线扫。**所以补的是新整机路线，不是给旧面形仪加物镜。**
   */
  {
    id: 'plant/cmos-test/optical-profiler',
    name: '白光干涉光学轮廓仪',
    unit: '台',
    category: 'machine',
    // ⚠️ **它不维持温度。** 19–21 °C 是计量间 `plant/metrology-room` 的条件。
    // 原来这里的 `holds: 15–30` 会让“造它要 19–21、它又提供 19–21”形成
    // `condition_cycle`；与 `parameter-analyzer` / `lcr-meter` 的修正同一条：
    // 仪器“能在 15–30 °C 工作”不等于“它能维持 15–30 °C”。2026-10-20 补路线时删。
    //
    // ── 2026-10-20 补路线（`data/measure/optical-metrology.ts`）──────────────
    //
    //   `make/optical-profiler` 用 Mirau 物镜 + PZT 移相台 + 白光光源 +
    //   计量 CCD 装成整机；交付 vertical 0.05–0.2 nm、lateral 0.5–1 µm、
    //   FOV 0.1–2 mm。`props` 因此从“精确 0.1/1”放宽成“设计窗口”，
    //   值仍只在路线的 `gives` 上。
    //
    //   0.05 nm 端要 16 帧 + 相机 2–5 e-，余量 1–2 倍；横向 0.5 µm 端
    //   是 NA 0.55 的衍射极限 0.61λ/NA ≈ 0.61 µm，0.5 µm 列为缺口。
    props: [
      { param: 'measure/verticalResolution', kind: 'range', min: 0.05, max: 0.2, unit: 'nm' },
      { param: 'verticalRange', kind: 'range', min: 1e6, max: 1e6, unit: 'nm' },
      { param: 'measure/lateralResolution', kind: 'range', min: 0.5, max: 1, unit: 'µm' },
      { param: 'measure/fieldOfView', kind: 'range', min: 0.1, max: 2, unit: 'mm', dir: 'atLeast' },
      { param: 'measure/stepHeight', kind: 'range', min: 0, max: 1e6, unit: 'nm' },
    ],
  },

  /**
   * LCR 表。**进口机 10 Hz–1 MHz、1 %；本地 C-V 桥 1 kHz–1 MHz、0.3–3 %。**
   *
   * 用途：n⁺/p⁺ 结电容，1/C² 外推掺杂与结深。它是 **machine**，可以在测量
   * 步骤里做 `performedBy`；不是 part。
   *
   * ── 本地这条 C-V 桥能到哪（`make/probe-cv-bridge` 的同一套桥）──────────
   *
   *   频率      1 kHz–1 MHz（100 kHz 石英 ÷100/÷10；1 MHz 靠 `plant/rf-13m56`
   *             换槽路，±5 %）
   *   电容      1 pF–1 nF
   *   准确度    100 pF–1 nF 0.3 %；10–100 pF 0.6 %；1–10 pF 3 %
   *   标准      本地 100 pF 标准电容（98–102 pF、0.1–0.5 %，`measurement-local.ts`）
   *
   * 缺口：
   *   · **10 Hz–1 kHz 没有**（差 100 倍）；本地主振最低 1 kHz。
   *   · **L/R 没有**：这是一台 C-V 桥，不是通用 LCR；没有 L 标准、没有 R 桥臂、
   *     没有 D/Q 读数。`measure/junction-depth-cv` 只用 C-V，所以够用。
   *   · 1–10 pF 档 **3 %**（1 % 是进口机的；本地差 3 倍）；结电容就在 1–10 pF，
   *     所以结深/掺杂按 3 % 记，不按 1 %。
   *
   * ⚠️ 结论：**第二台“LCR 表”只能造成 C-V 桥**，不是 10 Hz–1 MHz/1 % 的通用 LCR；
   *    它够 `measure/junction-depth-cv`（10 kHz–1 MHz 的 C-V），不够 L/R 测量。
   *    props 因此放成范围（frequencyMin 10–1e6、accuracy 0.1–10），让进口机
   *    与本地桥两个等级落在同一个 id 上；`gives` 仍分别写各自窗口。
   *
   * ⚠️ **它不维持温度。** 19–21 °C 是计量间 `plant/metrology-room` 的条件，
   *    造它的路线与用它测量的步骤都在 `needs` 里写计量间；`holds` 留空。
   *    若把它写成 15–30 的恒温源，就会与"造它也要 19–21"形成 `condition_cycle`
   *    （2026-10-20 修：原来三台的 `holds` 是从测试台抄过来的，桥不需要）。
   */
  {
    id: 'plant/cmos-test/lcr-meter',
    name: 'LCR 表',
    unit: '台',
    category: 'machine',
    props: [
      // 进口机是 10 Hz；本地 C-V 桥是 1 kHz —— 放成范围，别把本地档判成越界
      { param: 'frequencyMin', kind: 'range', min: 10, max: 1e6, unit: 'Hz' },
      { param: 'frequencyMax', kind: 'range', min: 1e6, max: 1e6, unit: 'Hz' },
      // 进口机 1 %；本地 0.3–3 %
      { param: 'measure/accuracy', kind: 'range', min: 0.1, max: 10, unit: '%' },
    ],
  },
];

/**
 * 三台都有本地路线（2026-10-20）：参数分析仪 `make/cmos-parameter-analyzer`
 * （`data/machine/cmos-analyzer.ts`）、光学轮廓仪 `make/optical-profiler`
 * （`data/measure/optical-metrology.ts`）、LCR 表 `make/cmos-test-lcr-meter`
 * （本文件下方）。旧句“参数分析仪与光学轮廓仪没有路线”已过期，只作历史。
 */
export const CMOS_TEST_ROUTES: readonly Route[] = [
  {
    /**
     * **本地 LCR 表 = C-V 桥 + 偏压源 + 屏蔽箱装成一台。**
     *
     * 为什么能造：`plant/probe-station` 的三个零件各有路线
     * （`make/probe-cv-bridge` 24 h、`make/probe-bias-source`、`make/probe-shield-box`），
     * 桥本身已经覆盖 1 kHz–1 MHz、1 pF–1 nF、0.3–3 %；这台只是把它们从
     * probe-station 上拆成独立机箱，并用本地 100 pF 标准做三点标定。
     *
     * 为什么只是 C-V 桥、不是通用 LCR：桥的比率臂是 1:1 空气芯变压器 + 检流计
     * 零位，只平衡电容；没有 L 标准、没有 R 桥臂、没有 D/Q。**不写它测 L/R。**
     *
     * 频率下限 1 kHz 是 100 kHz 石英 ÷100 定的；10 Hz–1 kHz 这一档没有，
     * 所以 `gives` 写 1 kHz–1 MHz，不写 10 Hz。
     *
     * 标定：100 pF 点用本地 100 pF 标准（0.1–0.5 %）；10 pF 与 1 nF 用桥的
     * 10:1 比率臂传递；1–10 pF 段 3 % 是杂散（开短路补偿扣 1.5 pF，漂扣不掉）。
     */
    id: 'make/cmos-test-lcr-meter',
    name: 'LCR 表制造',
    produces: [
      {
        item: 'plant/cmos-test/lcr-meter',
        qty: q(1),
        gives: [
          { param: 'frequencyMin', kind: 'range', min: 1000, max: 1000 },
          { param: 'frequencyMax', kind: 'range', min: 1e6, max: 1e6 },
          { param: 'measure/accuracy', kind: 'range', min: 0.3, max: 3 },
        ],
      },
    ],
    uses: [
      // 桥、偏压、屏蔽三件都是从 probe-station 的零件线上来的（各有路线）
      { anyOf: [{ item: 'plant/probe-station/cv-bridge', qty: q(1) }] },
      { anyOf: [{ item: 'plant/probe-station/bias-source', qty: q(1) }] },
      { anyOf: [{ item: 'plant/probe-station/shield-box', qty: q(1) }] },
      // 机箱、面板与连线
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
    ],
    // 恒温间是标定的前提；100 pF 标准是量值前提，不被消耗。
    needs: ['plant/metrology-room', 'plant/hv-test-bench/standard-capacitor-local'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '装机：把 C-V 桥、偏压源、屏蔽箱装进钢板机箱，接同轴端子与地；桥的 20 ms 检流计零位与 5 位刻度盘保持原样（这是它 0.16 fF 分辨的来源）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '100 pF 点：接本地 100 pF 标准电容（98–102 pF、0.1–0.5 %），做开路/短路补偿，扣掉 1.5 pF 杂散；在 1 kHz / 10 kHz / 100 kHz 各调一次零位，写刻度',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '传递 10 pF / 1 nF：用桥的 10:1 空气芯比率臂，以 100 pF 标准往上、往下各传一档；每档记三次，差 >0.5 % 就重调抽头。1–10 pF 段只到 3 %（杂散漂），不写成 1 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '1 MHz 档：换 `plant/rf-13m56` 的槽路线圈（L ×13.56），重调抽头到 1 MHz ±5 %；用同一只检流计做零位（20 ms 平均掉 20 000 个周期）。频率误差不进 C 的比值读数，但绝对 LCR 会进 —— 所以只报 C-V',
        performedBy: 'plant/rf-13m56',
      },
      {
        note_zh:
          '验收：10 kHz / 100 kHz / 1 MHz 三点，C 读数与 100 pF 标准比；写校准记录（100 pF 点 0.3 %、1–10 pF 3 %、10 Hz–1 kHz 不覆盖、L/R 不覆盖）。**证书/校准仍缺**：这是自校，不是 CNAS',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'C-V 桥 1 + 偏压源 1 + 屏蔽箱 1（按件）+ 钢板 2 + 玻璃 0.2 + 铜 0.1 kg → LCR 1 台；产物按台计，kg 项只是机箱与连线，余是边角料。桥本身的 24 h 记在 make/probe-cv-bridge，不重复计入这 8 h（只算装机与三点标定）',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CMOS_TEST_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CMOS_TEST_ROUTES];
