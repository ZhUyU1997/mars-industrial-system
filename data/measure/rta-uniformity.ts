/**
 * RTA 片内均匀性测量 —— 三支热电偶 + 指零电位差计。
 *
 * 与 `measure/furnace-uniformity` 同法：三点（中心/边缘/角上）取径向最不利
 * 位置，逐支读、读三轮。`std/thermocouple-t-general` 是 T 型铜-康铜，
 * `rangeMax` 400 °C、PTFE 套管；`plant/rta-zoned` 的 1000–1300 °C 它读不了。
 * 片要 1300 °C，改用 `std/thermocouple-nicr-nial-general`（NiCr-NiAl，非标准 K，
 * 短时 1372、氧化铝管）：它能到 1300，但正极是 80/20 高碳镍铬，分度逐支
 * 不同，必须配 `measure/thermocouple-cal` 的三点记录。
 *
 * 记录是 9 点测量窗口，不是单点读数；绝对温度标定由 `measure/thermocouple-cal`
 * 交。9 点/18 根引线是设计下限，只判 5–10 K 档，判不了 ≤5 K。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const RTA_UNIFORMITY_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/rta-uniformity-record',
    name: '9 点记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'waferUniformity', kind: 'range', min: 1, max: 5, unit: 'K', dir: 'atMost' },
      { param: 'controlBand', kind: 'range', min: 0, max: 5, unit: 'K', dir: 'atMost' },
    ],
  },
  /**
   * 9 点/200 mm 热电偶片。1300 °C 是 RTA 片内均匀性的使用上限；片上的
   * 9 支偶必须能到 1300 °C，T 型只到 400 °C，用 K 型（非标准，逐支标定）。
   */
  {
    id: 'std/thermocouple-wafer-200mm',
    name: '9 点/200 mm 热电偶片',
    unit: '件',
    category: 'part',
    props: [
      { param: 'points', kind: 'range', min: 9, max: 9, unit: '点' },
      { param: 'waferSize', kind: 'range', min: 200, max: 200, unit: 'mm' },
      { param: 'rangeMax', kind: 'range', min: 1300, max: 1300, unit: '°C' },
      { param: 'leadCount', kind: 'range', min: 18, max: 18, unit: '根' },
    ],
  },

  /**
   * 49 点/200 mm 热电偶片。7×7 方阵、35 mm 间距，四角 r≈49.5 mm；
   * 98 根引线，逐支 NiCr-NiAl 偶。9 点片只判 5–10 K，49 点是升级的第一步：
   * 片静置，98 根引线从炉口密封座引出，不靠旋转滑环；代价是方位角只有
   * 一列，4 次谐波仍可能漏掉。真正的全档要 98 路滑环 + 60 rpm 自转。
   */
  {
    id: 'std/thermocouple-wafer-49',
    name: '49 点/200 mm 热电偶片',
    unit: '件',
    category: 'part',
    props: [
      { param: 'points', kind: 'range', min: 49, max: 49, unit: '点' },
      { param: 'waferSize', kind: 'range', min: 200, max: 200, unit: 'mm' },
      { param: 'rangeMax', kind: 'range', min: 1300, max: 1300, unit: '°C' },
      { param: 'leadCount', kind: 'range', min: 98, max: 98, unit: '根' },
      { param: 'pitch', kind: 'range', min: 35, max: 35, unit: 'mm' },
    ],
  },

  /**
   * 49 点 RTA 均匀性记录。**能力域 0–10 K**，不是某台机器测出来的 3.5–5 K；
   * 1–5 K 的控温域同理。要把 base RTA 的 5 K 档写实，必须在具体炉子上
   * 真跑一组 49 点，把本条的 props 收窄到那一组。
   */
  {
    id: 'mat/rta-uniformity-record-49',
    name: '49 点 RTA 均匀性记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'waferUniformity', kind: 'range', min: 0, max: 10, unit: 'K', dir: 'atMost' },
      { param: 'controlBand', kind: 'range', min: 0, max: 5, unit: 'K', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 49, unit: '点' },
    ],
  },

  /**
   * 49 点 + 自转的 RTA 均匀性记录。能力域 0–10 K，不是读数；与静态 49 点
   * 记录分开，因为多了 98 路滑环的接触噪声。滑环噪声若压不到 µV 级，
   * 这一档的 5–10 K 会被接触噪声吃掉。
   */
  {
    id: 'mat/rta-uniformity-record-49-rot',
    name: '49 点旋转 RTA 均匀性记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'waferUniformity', kind: 'range', min: 0, max: 10, unit: 'K', dir: 'atMost' },
      { param: 'controlBand', kind: 'range', min: 0, max: 5, unit: 'K', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 49, unit: '点' },
    ],
  },

  /**
   * 16 区分区温差记录。**能力域**：zoneDelta 0–30 K、controlBand 0–10 K，
   * 不是某台炉子测出来的 5 K。整机 49 点记录不能顶替分区温差；这一条
   * 把 49 点按 16 区归并，看的是区与区的平均温度差。
   */
  {
    id: 'mat/rta-zone-record-16',
    name: '16 区分区温差记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'zoneDelta', kind: 'range', min: 0, max: 50, unit: 'K', dir: 'atMost' },
      { param: 'controlBand', kind: 'range', min: 0, max: 20, unit: 'K', dir: 'atMost' },
      { param: 'zones', kind: 'range', min: 16, max: 16, unit: '区' },
      { param: 'points', kind: 'range', min: 1, max: 49, unit: '点' },
    ],
  },

  /**
   * 8 区本地版的分区温差记录。能力域 zoneDelta 0–50 K、controlBand 0–20 K、
   * zones 8、points 49；与 16 区分开，不能互相顶替。8 区本地版的控制器
   * 更新率只有 1–10 Hz，区界热扩散比 16 区粗一档，能力域也宽一档。
   */
  {
    id: 'mat/rta-zone-record-8',
    name: '8 区本地版的分区温差记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'zoneDelta', kind: 'range', min: 0, max: 50, unit: 'K', dir: 'atMost' },
      { param: 'controlBand', kind: 'range', min: 0, max: 20, unit: 'K', dir: 'atMost' },
      { param: 'zones', kind: 'range', min: 8, max: 8, unit: '区' },
      { param: 'points', kind: 'range', min: 1, max: 49, unit: '点' },
    ],
  },

  /**
   * RTA 高温计相对准确度记录。能力域 `relativeAccuracy 0–5 K`、
   * `absoluteAccuracy 0–20 K`、`pyrometers 9`、`points 3`；不是某批 9 只
   * 高温计的 1–1.5 K 读数。绝对准确度受标准光电高温计的 ±10 K 限制，
   * 相对准确度只看 9 只之间的最大差。
   */
  {
    id: 'mat/rta-pyrometer-record',
    name: 'RTA 高温计相对准确度记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'relativeAccuracy', kind: 'range', min: 0, max: 10, unit: 'K', dir: 'atMost' },
      { param: 'absoluteAccuracy', kind: 'range', min: 0, max: 50, unit: 'K', dir: 'atMost' },
      { param: 'pyrometers', kind: 'range', min: 9, max: 9, unit: '只' },
      { param: 'points', kind: 'range', min: 1, max: 3, unit: '点' },
    ],
  },

  /**
   * zoned RTA 的 2–3 K 档记录。能力域 `uniformity 0–10 K`、`controlBand 0–5 K`、
   * `points 49`；不是某台 zoned 炉子的 2–3 K 读数。zoned 的 9 区/9 高温计
   * 与 base 的 16 区不是同一台机器，记录不能共用。
   */
  {
    id: 'mat/rta-zoned-record',
    name: 'zoned RTA 的 2–3 K 档记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'waferUniformity', kind: 'range', min: 0, max: 10, unit: 'K', dir: 'atMost' },
      { param: 'controlBand', kind: 'range', min: 0, max: 5, unit: 'K', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 49, unit: '点' },
    ],
  },
];

export const RTA_UNIFORMITY_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * 9 点/200 mm 热电偶片：9 支热电偶 + 200 mm 硅片 + 氧化铝绝缘。
     * 18 根引线；片内 9 点覆盖中心/边缘/角上。
     *
     * 片按 1300 °C 使用，偶也须到 1300 °C；T 型交付 400 °C，K 型交付
     * 1300–1372。把量程要求写进选项，这一格才按实物判。
     */
    id: 'make/thermocouple-wafer-200mm',
    name: '9 点/200 mm 热电偶片制造',
    produces: [
      {
        item: 'std/thermocouple-wafer-200mm',
        qty: q(1),
        gives: [
          { param: 'points', kind: 'range', min: 9, max: 9 },
          { param: 'waferSize', kind: 'range', min: 200, max: 200 },
          { param: 'rangeMax', kind: 'range', min: 1300, max: 1300 },
          { param: 'leadCount', kind: 'range', min: 18, max: 18 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'std/thermocouple-nicr-nial-general',
            qty: q(9),
            need: [{ param: 'rangeMax', kind: 'range', min: 1300, dir: 'atLeast' }],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    rate: { hours: q(8) },
    unbalanced_zh: '9 支热电偶 + 硅片 1 片 + 氧化铝 0.05 → 9 点片 1；余是引线/切割/装配损耗（零件质量不计入片重）',
  },
  {
    /**
     * 9 点、三轮：中心/边缘/角上；`plant/rta` 1000–1200 °C（无分区）。
     * 9 点片用 K 型偶（非标准，逐支标定）；绝对温度标定由
     * `measure/thermocouple-cal` 交，不再借 T 型。
     */
    id: 'measure/rta-uniformity',
    name: '9 点测量',
    produces: [
      {
        item: 'mat/rta-uniformity-record',
        qty: q(1),
        gives: [
          { param: 'waferUniformity', kind: 'range', min: 1, max: 5 },
          { param: 'controlBand', kind: 'range', min: 0, max: 5 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: ['std/thermocouple-wafer-200mm', 'plant/metrology-room', 'mat/thermocouple-cal-record'],
    steps: [
      { note_zh: '装 9 点/200 mm 热电偶片：18 根冷端引线接指零电位差计', performedBy: 'plant/robot' },
      { note_zh: 'plant/rta 整片升温 1000–1200 °C、soak 120 s（plant/rta 上限，无分区）', performedBy: 'plant/rta', under: [{ param: 'temperature', min: 1000, max: 1200 }] },
      { note_zh: '每 2 min 读一遍、读 3 轮（逐支读，冰点瓶冷端）', performedBy: 'plant/probe-station' },
      { note_zh: '算 9 点最大差（均匀性）与同点三轮极差（控温精度）；记录是测量窗口', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 49 点/200 mm 热电偶片：49 支 NiCr-NiAl 偶 + 200 mm 硅片 + 氧化铝绝缘。
     * 7×7 方阵、35 mm 间距；98 根引线，四角 r≈49.5 mm。
     *
     * 与 9 点片同一条装配手艺，只把点数从 9 加到 49；多的 40 支偶是同一批
     * NiCr-NiAl（逐支标定），不是新量具。`rate 24 h` 是按 9 点片的 8 h 与
     * 点数线性放大的估算，不是实测节拍。
     */
    id: 'make/thermocouple-wafer-49',
    name: '49 点/200 mm 热电偶片制造',
    produces: [
      {
        item: 'std/thermocouple-wafer-49',
        qty: q(1),
        gives: [
          { param: 'points', kind: 'range', min: 49, max: 49 },
          { param: 'waferSize', kind: 'range', min: 200, max: 200 },
          { param: 'rangeMax', kind: 'range', min: 1300, max: 1300 },
          { param: 'leadCount', kind: 'range', min: 98, max: 98 },
          { param: 'pitch', kind: 'range', min: 35, max: 35 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'std/thermocouple-nicr-nial-general',
            qty: q(49),
            need: [{ param: 'rangeMax', kind: 'range', min: 1300, dir: 'atLeast' }],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    rate: { hours: q(24) },
    unbalanced_zh: '49 支热电偶 + 硅片 1 片 + 氧化铝 0.2 → 49 点片 1；余是引线/切割/装配损耗（零件质量不计入片重）',
  },
  {
    /**
     * 49 点、三轮：7×7 方阵，片静置；98 根引线从炉口密封座引出，接 49 只
     * 毫伏表（一只表读一支偶，不靠扫描开关；R1，数量不限）。RTA 升到
     * 1000–1200 °C 保 30 min 到稳态，每 2 min 读一遍、读 3 轮。
     *
     * 输出是**能力域** `uniformity 0–10 K`、`controlBand 0–5 K`、`points 49`，
     * 不是某台炉子的 3.5–5 K 读数。要收窄到 5 K 档，必须在这台炉子上真跑
     * 一组 49 点，把记录条目的 props 改掉；`make/rta` 在那之前仍是 design。
     *
     * 历史顺序：9 点（5–10 K）→ 本条 49 点静态（一列方位角）→ 98 路滑环 +
     * 60 rpm 自转（全档）。先降级再升级，48 支偶与 80 根引线是同一批 K 型。
     */
    id: 'measure/rta-uniformity-49',
    name: '49 点 RTA 均匀性测量',
    produces: [
      {
        item: 'mat/rta-uniformity-record-49',
        qty: q(1),
        gives: [
          { param: 'waferUniformity', kind: 'range', min: 0, max: 10 },
          { param: 'controlBand', kind: 'range', min: 0, max: 5 },
          { param: 'points', kind: 'range', min: 49, max: 49 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: [
      'std/thermocouple-wafer-49',
      { item: 'std/millivoltmeter-general', qty: q(49) },
      { item: 'mat/thermocouple-cal-record', qty: q(49) },
      'plant/metrology-room',
    ],
    steps: [
      { note_zh: '装 49 点/200 mm 热电偶片：98 根引线从炉口密封座引出，接 49 只毫伏表', performedBy: 'plant/robot' },
      { note_zh: 'RTA 升到 1000–1200 °C 保 30 min 到稳态', performedBy: 'plant/rta', under: [{ param: 'temperature', min: 1000, max: 1200 }] },
      { note_zh: '每 2 min 读一遍、读 3 轮（49 只表同时读，冰点瓶冷端）', performedBy: 'plant/robot' },
      { note_zh: '算 49 点最大差与同点三轮极差；写能力域 0–10 K，不写某台炉子的读数', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(8) },
    unbalanced_zh: '水 1 kg → 49 点记录 1 份；片与 49 只表是量具，不消耗。',
  },
  {
    /**
     * 49 点 + 自转：98 路滑环 + 60 rpm，把方位角抹平。这是 49 点静态片
     * 之后的升级段，不是替代：静态片只测一列方位角，4 次谐波可能漏掉。
     *
     * 输出仍是**能力域** `uniformity 0–10 K`、`controlBand 0–5 K`、`points 49`，
     * 不是某台炉子的 3.5–5 K 读数；要收窄，必须在这台炉子上真跑一组。
     *
     * 前提里多了 `plant/rta/slip-ring-98`（98 路金刷滑环）与 49 只毫伏表；
     * 滑环的热电势噪声 2 µV 是设计估算，如果实测压不到 µV 级，这一档的
     * 5–10 K 会被接触噪声吃掉。历史顺序：9 点 → 49 点静态 → 本条。
     */
    id: 'measure/rta-uniformity-49-rot',
    name: '49 点旋转 RTA 均匀性测量',
    produces: [
      {
        item: 'mat/rta-uniformity-record-49-rot',
        qty: q(1),
        gives: [
          { param: 'waferUniformity', kind: 'range', min: 0, max: 10 },
          { param: 'controlBand', kind: 'range', min: 0, max: 5 },
          { param: 'points', kind: 'range', min: 49, max: 49 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: [
      'std/thermocouple-wafer-49',
      'plant/rta/slip-ring-98',
      { item: 'std/millivoltmeter-general', qty: q(49) },
      { item: 'mat/thermocouple-cal-record', qty: q(49) },
      'plant/metrology-room',
    ],
    steps: [
      { note_zh: '装 49 点/200 mm 热电偶片到自转台；98 根引线经滑环引出，接 49 只毫伏表', performedBy: 'plant/robot' },
      { note_zh: 'RTA 升到 1000–1200 °C 保 30 min 到稳态', performedBy: 'plant/rta', under: [{ param: 'temperature', min: 1000, max: 1200 }] },
      { note_zh: '60 rpm 自转，每 2 min 读一遍、读 3 轮（49 只表同时读，冰点瓶冷端）', performedBy: 'plant/robot' },
      { note_zh: '算 49 点最大差与同点三轮极差；写能力域 0–10 K，不写某台炉子的读数', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(8) },
    unbalanced_zh: '水 1 kg → 49 点自转记录 1 份；片、滑环与 49 只表是量具，不消耗。',
  },
  {
    /**
     * 16 区分区温差：49 点片静置，49 只毫伏表逐点读；按 `plant/rta/zone-control`
     * 的 16 区把 49 点归并，算每区平均温度与区间最大差。
     *
     * 输出是**能力域** `zoneDelta 0–30 K`、`controlBand 0–10 K`、`zones 16`、
     * `points 49`，不是某台炉子的 5 K。整机 49 点记录不能顶替这一格：整机
     * 看的是片内最大差，分区看的是区与区的平均差，两者不是同一个量。
     *
     * 8 区本地版是另一条控制板（`make/rta-zone-control-local`）；这一条只
     * 测 16 区。8 区的记录要另一轮，不能拿 16 区的数去顶。
     */
    id: 'measure/rta-zone-uniformity-16',
    name: '16 区分区温差测量',
    produces: [
      {
        item: 'mat/rta-zone-record-16',
        qty: q(1),
        gives: [
          { param: 'zoneDelta', kind: 'range', min: 0, max: 30 },
          { param: 'controlBand', kind: 'range', min: 0, max: 10 },
          { param: 'zones', kind: 'range', min: 16, max: 16 },
          { param: 'points', kind: 'range', min: 49, max: 49 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: [
      'std/thermocouple-wafer-49',
      { item: 'std/millivoltmeter-general', qty: q(49) },
      { item: 'mat/thermocouple-cal-record', qty: q(49) },
      'plant/metrology-room',
    ],
    steps: [
      {
        note_zh: '装 49 点/200 mm 热电偶片；98 根引线从炉口密封座引出，接 49 只毫伏表',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '16 区控制上电，RTA 升到 1000–1200 °C 保 30 min 到稳态',
        performedBy: 'plant/rta',
        under: [{ param: 'temperature', min: 1000, max: 1200 }],
      },
      {
        note_zh: '每 2 min 读一遍、读 3 轮；按 16 区把 49 点归并，算区平均与区间最大差',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '写能力域 zoneDelta 0–30 K、controlBand 0–10 K；某台炉子的 5 K 要真跑后再收窄',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(8) },
    unbalanced_zh: '水 1 kg → 16 区记录 1 份；片与 49 只表是量具，不消耗。',
  },
  {
    /**
     * 8 区本地版分区温差：49 点片静置、49 只毫伏表逐点读；按 8 区归并。
     *
     * 与 16 区那条的区别不是点数，是控制器：本地版只有 8 路、1–10 Hz，
     * 区界更宽，zoneDelta 能力域也宽一档。两条记录不共用。
     *
     * 输出是**能力域** `zoneDelta 0–50 K`、`controlBand 0–20 K`、`zones 8`、
     * `points 49`，不是某台炉子的读数。`make/rta-zone-control-local` 的
     * `uniformity 0–8` 仍是 design。
     */
    id: 'measure/rta-zone-uniformity-8',
    name: '8 区本地版的分区温差测量',
    produces: [
      {
        item: 'mat/rta-zone-record-8',
        qty: q(1),
        gives: [
          { param: 'zoneDelta', kind: 'range', min: 0, max: 50 },
          { param: 'controlBand', kind: 'range', min: 0, max: 20 },
          { param: 'zones', kind: 'range', min: 8, max: 8 },
          { param: 'points', kind: 'range', min: 49, max: 49 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: [
      'std/thermocouple-wafer-49',
      { item: 'std/millivoltmeter-general', qty: q(49) },
      { item: 'mat/thermocouple-cal-record', qty: q(49) },
      {
        item: 'plant/rta/zone-control',
        qty: q(1),
        need: [{ param: 'zones', kind: 'range', min: 8, max: 8 }],
        onRelax: 'functional-lost',
      },
      'plant/metrology-room',
    ],
    steps: [
      {
        note_zh: '装 49 点/200 mm 热电偶片；98 根引线从炉口密封座引出，接 49 只毫伏表',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '8 区本地控制上电（1–10 Hz），RTA 升到 1000–1200 °C 保 30 min 到稳态',
        performedBy: 'plant/rta',
        under: [{ param: 'temperature', min: 1000, max: 1200 }],
      },
      {
        note_zh: '每 2 min 读一遍、读 3 轮；按 8 区把 49 点归并，算区平均与区间最大差',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '写能力域 zoneDelta 0–50 K、controlBand 0–20 K；某台炉子的 8 K 要真跑后再收窄',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(8) },
    unbalanced_zh: '水 1 kg → 8 区记录 1 份；片与 49 只表是量具，不消耗。',
  },
  {
    /**
     * 9 只 zone 高温计的相对准确度：石墨黑体腔 + 电阻炉 + 标准光电高温计。
     *
     *   黑体腔  φ20×100、壁 3、端面 φ3 孔，有效发射率 0.99（`make/pyrometer-blackbody-cavity`）
     *   炉温    1000–1100 °C（电阻炉上限 1100；再高要碳管炉）
     *   参考    标准光电高温计（`std/photoelectric-pyrometer-general`，绝对 ±10 K）
     *   被测    9 只 zone 高温计（`plant/rta/zone-lamp` 上的 InGaAs 1.55 µm）
     *
     * 逐只装同一孔径、读 3 次；相对准确度 = 9 只读数的最大差，绝对准确度
     * 受参考表的 ±10 K 限制。输出是**能力域** `relativeAccuracy 0–5 K`、
     * `absoluteAccuracy 0–20 K`、`pyrometers 9`、`points 3`，不是某批 9 只
     * 高温计的 1–1.5 K 读数。`make/rta-zone-lamp` 的 relativeAccuracy 1–1.5
     * 仍是 design。
     */
    id: 'measure/rta-zone-lamp-accuracy',
    name: 'RTA 高温计相对准确度测量',
    produces: [
      {
        item: 'mat/rta-pyrometer-record',
        qty: q(1),
        gives: [
          { param: 'relativeAccuracy', kind: 'range', min: 0, max: 5 },
          { param: 'absoluteAccuracy', kind: 'range', min: 0, max: 20 },
          { param: 'pyrometers', kind: 'range', min: 9, max: 9 },
          { param: 'points', kind: 'range', min: 3, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/argon', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: [
      'plant/rta/zone-lamp',
      'std/photoelectric-pyrometer-general',
      'std/photoelectric-pyrometer-general/blackbody-cavity',
      'plant/metrology-room',
    ],
    steps: [
      {
        note_zh: '装石墨黑体腔（φ20×100、端面 φ3 孔），氩气吹扫；电阻炉升到 1000–1100 °C 保 30 min',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 1000, max: 1100 }],
      },
      {
        note_zh: '标准光电高温计对准黑体腔，读 3 次；换 9 只 zone 高温计，逐只同孔径读 3 次',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '算 9 只之间的最大差（相对准确度）与对标准表的偏差（绝对准确度）；写能力域',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(12) },
    unbalanced_zh: '氩 1 + 水 1 → 高温计记录 1 份；黑体腔、标准表、9 只被测表都是量具，不消耗。',
  },
  {
    /**
     * zoned RTA 的 49 点 + 自转：`plant/rta-zoned` 1000–1300 °C、60 rpm、
     * 98 路滑环、49 只毫伏表。9 区灯阵 + 9 只高温计的 zoned 机，不是 base
     * 的 16 区；49 点记录不能共用。
     *
     * 输出是**能力域** `uniformity 0–10 K`、`controlBand 0–5 K`、`points 49`，
     * 不是某台 zoned 炉子的 2–3 K 读数。要收窄到 2–3 K，必须在这台炉子上
     * 真跑一组；`make/rta-zoned` 的 `waferUniformity 2–3` 仍是 design。
     *
     * 前提里多了滑环与 49 份偶标定；zoned 的 9 只高温计相对准确度是另一条
     * 路线（`measure/rta-zone-lamp-accuracy`），两条不互相顶替。
     */
    id: 'measure/rta-zoned-uniformity',
    name: 'zoned RTA 的 2–3 K 档测量',
    produces: [
      {
        item: 'mat/rta-zoned-record',
        qty: q(1),
        gives: [
          { param: 'waferUniformity', kind: 'range', min: 0, max: 5 },
          { param: 'controlBand', kind: 'range', min: 0, max: 2 },
          { param: 'points', kind: 'range', min: 49, max: 49 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: [
      'std/thermocouple-wafer-49',
      'plant/rta/slip-ring-98',
      { item: 'std/millivoltmeter-general', qty: q(49) },
      { item: 'mat/thermocouple-cal-record', qty: q(49) },
      'plant/metrology-room',
    ],
    steps: [
      {
        note_zh: '装 49 点/200 mm 热电偶片到 zoned 自转台；98 根引线经滑环引出，接 49 只毫伏表',
        performedBy: 'plant/robot',
      },
      {
        note_zh: 'zoned 机升到 1000–1300 °C 保 30 min 到稳态；9 区 PID 与 9 只高温计投入',
        performedBy: 'plant/rta-zoned',
        under: [{ param: 'temperature', min: 1000, max: 1300 }],
      },
      {
        note_zh: '60 rpm 自转，每 2 min 读一遍、读 3 轮（49 只表同时读，冰点瓶冷端）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '算 49 点最大差与同点三轮极差；写能力域 0–10 K / 0–5 K，不写某台 zoned 炉子的 2–3 K',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(8) },
    unbalanced_zh: '水 1 kg → zoned 49 点记录 1 份；片、滑环与 49 只表是量具，不消耗。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...RTA_UNIFORMITY_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...RTA_UNIFORMITY_MEASURE_ROUTES];
