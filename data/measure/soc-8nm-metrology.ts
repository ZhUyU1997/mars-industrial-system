/**
 * 8 nm SoC 与 NPU 模块的半导体量测 —— 把 node 从规格转写变成可查的读数窗口。
 *
 * 背景：`make/robot-npu` 的 node 7–12 与 tops/sram/power 一直挂 design。
 * 2026-10-24 的纠正轮把 node 标成 design（上游 8 nm 链被套刻阻断），
 * 同日主 agent 的可溯源套刻补充（`mat/overlay-product-record`）把
 * `plant/euv-stepper-hina` 的 overlay 交到 2.7 nm，8 nm 链由此可走通。
 * 本文件补的是链走通后的**量测**：
 *
 *   `measure/soc-8nm-gate-length`  → `mat/soc-8nm-gate-length-record`
 *       用 FIB 制样 + TEM 截面量栅长（8–10 nm），CD-SEM 俯视交叉核对。
 *       这是 node 的读数来源，不是把 `std/soc-8nm-general` 的 props 再抄一遍。
 *
 *   `measure/robot-npu-benchmark`  → `mat/robot-npu-benchmark-record`
 *       跑矩阵乘基准读 TOPS、走内存测试读 SRAM 可用容量、分流器读功耗。
 *       三者是模块级验收窗口；具体读数待本机跑分收窄。
 *
 * 口径（R12）：记录里的窗口是**读数能落在哪**，不是某一次实测。本文件没有
 * 真实跑分报告之前，只写能力域/验收带，不写“已测”或“闭合”。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const SOC_8NM_MEASURE_ITEMS: readonly Item[] = [
  /**
   * 8 nm SoC 栅长记录。**一份记录对应一片测试片/一颗测试 die。**
   *
   *   gateLength   8–10 nm   TEM 截面 10 条栅的读数带（node 8–10 的读数来源）
   *   uncertainty  0–0.5 nm  U(k=2)：TEM 点分辨率 0.2–0.5、制样损伤 0.1–0.2、
   *                          边缘判定 0.1–0.2 的合成
   *   points       1–100     每条记录至少 10 条栅（5 个视场 × 2 条）
   *   method       tem       FIB lamella + 截面 TEM；CD-SEM 俯视只作交叉核对
   */
  {
    id: 'mat/soc-8nm-gate-length-record',
    name: '8 nm SoC Gate Length Record', name_zh: '8 nm SoC 栅长记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'gateLength', kind: 'range', min: 7, max: 12, unit: 'nm' },
      // 与交付方 give 的 `node` 同名：记录量的是栅长，交付的是工艺节点；
      // 8–10 nm 是同一批 10 条栅的换算窗口，不是另一次测量。
      { param: 'node', kind: 'range', min: 8, max: 10, unit: 'nm' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 0.5, unit: 'nm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '条' },
      { param: 'method', kind: 'enum', values: ['tem'] },
    ],
  },

  /**
   * NPU 模块的模块级基准记录。**一份记录对应一颗模块（或一批抽检）。**
   *
   *   tops    100–275 TOPS  矩阵乘基准的验收带（与 std/soc-8nm-general 的交付窗口同带，
   *                          不是把 100–275 当成某次跑分结果）
   *   sram    10–100 MB     可用容量：地址走 1 / 全 0 / 棋盘三种模式测出的可用段
   *   power   10–30 W       满载功耗：分流器 + 数字表，19–21 °C
   *   points  1–100         每项至少 10 次读数
   *   method  benchmark     NPU 自跑基准固件；主机只发令与收数
   */
  {
    id: 'mat/robot-npu-benchmark-record',
    name: 'NPU Module-Level Benchmark Record', name_zh: 'NPU 模块的模块级基准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'tops', kind: 'range', min: 100, max: 275, unit: 'TOPS' },
      { param: 'sram', kind: 'range', min: 10, max: 100, unit: 'MB' },
      { param: 'power', kind: 'range', min: 10, max: 30, unit: 'W', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '次' },
      { param: 'method', kind: 'enum', values: ['benchmark'] },
    ],
  },

  /**
   * 8 nm 节点 overlay 记录：overlay 2–3 nm、uncertainty 0.2–0.5 nm、10 点。
   * 资格带，不是单次实测；门 ≤2–3 nm 与 `make/soc-8nm-damascene` 第⑪步一致。
   */
  {
    id: 'mat/soc-8nm-overlay-record',
    name: '8 nm SoC Overlay Record', name_zh: '8 nm SoC 套刻记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'overlay', kind: 'range', min: 2, max: 3, unit: 'nm', dir: 'atMost' },
      { param: 'uncertainty', kind: 'range', min: 0.2, max: 0.5, unit: 'nm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 10, max: 10, unit: '点' },
    ],
  },

  /**
   * 8 nm 节点 gate stack 记录：四层厚度 + 不确定度 + 3–5 点。
   * 资格带，不是单次实测。
   */
  {
    id: 'mat/soc-8nm-gate-stack-record',
    name: '8 nm SoC Gate Stack Record', name_zh: '8 nm SoC 栅堆叠记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'gateOxide', kind: 'range', min: 1, max: 2, unit: 'nm' },
      { param: 'highK', kind: 'range', min: 2, max: 3, unit: 'nm' },
      { param: 'metalGate', kind: 'range', min: 5, max: 10, unit: 'nm' },
      { param: 'interface', kind: 'range', min: 1, max: 2, unit: 'nm' },
      { param: 'uncertainty', kind: 'range', min: 0.2, max: 0.5, unit: 'nm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 3, max: 5, unit: '点' },
    ],
  },
];

export const SOC_8NM_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **8 nm SoC 栅长：FIB 取 lamella → TEM 截面读 10 条栅。**
     *
     * 为什么必须 TEM 而不是 CD-SEM：CD-SEM 的 cdRange 是 10–1000 nm，8 nm 在
     * 量程下限之外；cdAccuracy 1.5 nm 对 8–10 nm 的判据也不够（U/判据 ≈ 0.15–0.19）。
     * TEM 点分辨率 0.2–0.5 nm，截面能直接看栅极的物理宽度。
     *
     * 步骤：
     *   ① 从 `std/soc-8nm-general` 的测试 die 上切 1 片，FIB 铂保护 + lamella 减薄
     *      到 60–80 nm（`plant/fib-tem`，30 kV 粗切 → 5 kV 精修 → 2 kV 清边）；
     *   ② 装 `plant/tem`，200 kV、50 万倍，5 个视场 × 2 条栅 = 10 条；
     *   ③ 每条栅在 1/2 高度处量宽度，读 8–10 nm；U(k=2) 0.3–0.5 nm；
     *   ④ CD-SEM 俯视 10 点作交叉核对（只判“有没有大错”，不进 U）。
     *
     * 记录的交出窗口是 8–10 nm（读数带），不是某一条栅的单一值。
     */
    id: 'measure/soc-8nm-gate-length',
    name: '8 nm SoC Gate Length Measurement', name_zh: '8 nm SoC 栅长测量',
    produces: [
      {
        item: 'mat/soc-8nm-gate-length-record',
        qty: q(1),
        gives: [
          { param: 'gateLength', kind: 'range', min: 8, max: 10 },
          { param: 'node', kind: 'range', min: 8, max: 10 },
          { param: 'uncertainty', kind: 'range', min: 0.3, max: 0.5 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
          { param: 'method', kind: 'enum', oneOf: ['tem'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/device-wafer', qty: q(1) }] }],
    needs: [
      // FIB/TEM/CD-SEM 已由 steps 指名，不在 needs 里重复；needs 只留环境。
      'plant/metrology-room',
    ],
    rate: { hours: q(16) },
    steps: [
      {
        note_zh: '取样：从测试 die 切 1 片，FIB 铂保护 + lamella 减薄到 60–80 nm（30 kV 粗切 → 5 kV 精修 → 2 kV 清边）',
        performedBy: 'plant/fib-tem',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: 'TEM：200 kV、50 万倍，5 个视场 × 2 条栅 = 10 条；每条在 1/2 高度量宽度',
        performedBy: 'plant/tem',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '读 8–10 nm，U(k=2) 0.3–0.5：TEM 点分辨率 0.2–0.5、制样损伤 0.1–0.2、边缘判定 0.1–0.2 合成',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: 'CD-SEM 俯视 10 点交叉核对：只判“有没有大错”，cdRange 10–1000 不含 8 nm，不进 U',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '测试 die 1 颗（破坏性）→ 栅长记录 1 份；lamella 是样品不是物料，记录是数据。',
  },

  {
    /**
     * **NPU 模块级基准：TOPS / SRAM 可用容量 / 满载功耗。**
     *
     * 这不是“再抄一遍 datasheet”：三项都在装好的模块上跑，
     * 失败模式也不同（算力掉、内存坏段、功耗超）。
     *
     * 步骤：
     *   ① 烧基准固件：矩阵乘 4096×4096×4096，重复 100 次取中位；
     *   ② TOPS = 2·N³·次数 / 时间；读 100–275 带；
     *   ③ SRAM：地址走 1 / 全 0 / 棋盘三模式，读可用段 10–100 MB；
     *   ④ 功耗：分流器 + `std/dvm-general`，满载 10 分钟读 10 次，10–30 W；
     *   ⑤ 19–21 °C，记录表号与固件版本。
     *
     * 三项都是**验收带**，不是某一次跑分；单次读数待本机跑分收窄。
     */
    id: 'measure/robot-npu-benchmark',
    name: 'NPU Module-Level Benchmark Measurement', name_zh: 'NPU 模块的模块级基准测量',
    produces: [
      {
        item: 'mat/robot-npu-benchmark-record',
        qty: q(1),
        gives: [
          { param: 'tops', kind: 'range', min: 100, max: 275 },
          { param: 'sram', kind: 'range', min: 10, max: 100 },
          { param: 'power', kind: 'range', min: 10, max: 30 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
          { param: 'method', kind: 'enum', oneOf: ['benchmark'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/robot/npu', qty: q(1) }] }],
    needs: [
      'std/computer-general',
      'std/dvm-general',
      'plant/metrology-room',
      'plant/power-standard-100w',
    ],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh: '烧基准固件：矩阵乘 4096×4096×4096，重复 100 次取中位；记录固件版本',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: 'TOPS = 2·N³·次数 / 时间；读 100–275 带（验收带，不是单次跑分）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: 'SRAM：地址走 1 / 全 0 / 棋盘三模式，读可用段 10–100 MB',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '功耗：分流器 + std/dvm-general，满载 10 分钟读 10 次，10–30 W',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '电 1 批（不计质量）→ 基准记录 1 份；模块是样品不是消耗，记录是数据。',
  },

  {
    /**
     * **8 nm SoC overlay：产品片/标记片 10 点 X/Y。**
     *
     * 用 `plant/overlay-metrology`（overlayUncertainty ≤0.5 nm），
     * `std/soc-8nm-general` 只作被测片，进、出不消耗。
     * 输出资格带 overlay 2–3 nm、uncertainty 0.2–0.5 nm、10 点；
     * 不是单次实测；门 ≤2–3 nm 与 `make/soc-8nm-damascene` 第⑪步一致。
     */
    id: 'measure/soc-8nm-overlay',
    name: '8 nm SoC Overlay Measurement', name_zh: '8 nm SoC 套刻测量',
    produces: [{
      item: 'mat/soc-8nm-overlay-record',
      qty: q(1),
      gives: [
        { param: 'overlay', kind: 'range', min: 2, max: 3 },
        { param: 'uncertainty', kind: 'range', min: 0.2, max: 0.5 },
        { param: 'points', kind: 'range', min: 10, max: 10 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'mat/device-wafer', qty: q(1) }] }],
    needs: [
      {
        item: 'plant/overlay-metrology',
        qty: q(1),
        need: [{ param: 'overlayUncertainty', kind: 'range', min: 0, max: 0.5, dir: 'atMost' }],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh: '装 8 nm 产品片/标记片到 0.5 nm 台；19–21 °C 等温 2 h',
        performedBy: 'plant/overlay-metrology',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '读 X/Y overlay 10 点，每点 3 次；overlayUncertainty ≤0.5 nm',
        performedBy: 'plant/overlay-metrology',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '写资格带 2–3 nm、uncertainty 0.2–0.5 nm；不写单次实测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '8 nm 片 1（进、出不消耗）+ 套刻机/计量间（不占用）→ overlay 记录 1 份；记录是数据不是物料。',
  },

  {
    /**
     * **8 nm SoC gate stack：FIB 制样 + TEM 读四层厚度。**
     *
     * 用 `plant/fib-tem`（filmThickness 1–100 nm、measure/resolution 0.2–4.5 nm）
     * 制 lamella 并读 gateOxide/highK/metalGate/interface；`std/soc-8nm-general` 只作被测片。
     * 输出资格带 1–2/2–3/5–10/1–2 nm、uncertainty 0.2–0.5 nm、3–5 点；
     * 不是单次实测；0.5 nm 的不确定度在 FIB-TEM 的 0.2 nm 分辨率档内。
     */
    id: 'measure/soc-8nm-gate-stack',
    name: '8 nm SoC Gate Stack Measurement', name_zh: '8 nm SoC 栅堆叠测量',
    produces: [{
      item: 'mat/soc-8nm-gate-stack-record',
      qty: q(1),
      gives: [
        { param: 'gateOxide', kind: 'range', min: 1, max: 2 },
        { param: 'highK', kind: 'range', min: 2, max: 3 },
        { param: 'metalGate', kind: 'range', min: 5, max: 10 },
        { param: 'interface', kind: 'range', min: 1, max: 2 },
        { param: 'uncertainty', kind: 'range', min: 0.2, max: 0.5 },
        { param: 'points', kind: 'range', min: 3, max: 5 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'mat/highk-gate-wafer', qty: q(1) }] }],
    needs: [
      {
        item: 'plant/fib-tem',
        qty: q(1),
        need: [
          { param: 'filmThickness', kind: 'range', min: 1, max: 100 },
          { param: 'measure/resolution', kind: 'range', min: 0.2, max: 0.5 },
        ],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh: 'FIB 制 lamella：30–60 nm 厚，Pt 保护层；8 nm 片取栅极区',
        performedBy: 'plant/fib-tem',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: 'TEM 读四层：gateOxide/highK/metalGate/interface，3–5 点',
        performedBy: 'plant/fib-tem',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '写资格带 1–2/2–3/5–10/1–2 nm、uncertainty 0.2–0.5 nm；不写单次实测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '8 nm 片 1（进、出不消耗）+ FIB-TEM/计量间（不占用）→ gate stack 记录 1 份；记录是数据不是物料。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...SOC_8NM_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...SOC_8NM_MEASURE_ROUTES];
