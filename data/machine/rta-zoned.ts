/**
 * RTA 片内温差 ±5 K → ±3 K（差 1.6×）：9 区灯阵 + 每区独立温度 PID。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么这是一个**变体整机** `plant/rta-zoned`，不是 `plant/rta` 的第二条路线
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `plant/rta`（`implant.ts`）是 **composedOf 装配**：11 件零件、没有产出路线
 * （该文件明确"不另写 make/rta"，避免把同一份 BOM 抄两遍）。模型里同一个条目
 * 不能既有 composedOf 又有产出路线（`mixed_production`），所以"第二条路线
 * make/rta-zoned 产出 plant/rta"写不出来。可行的两条路：
 *
 *   ① 把 plant/rta 的 composedOf 拆成 make/rta-base + make/rta-zoned 两条路线
 *      —— 11 件 BOM 要在两条路线里各抄一遍，且 `holds` 只能有一份（基型
 *      400–1200、变体 1000–1300 不能共存），等于把一台机器的两种能力压进
 *      一个条目；
 *   ② **变体整机单列** `plant/rta-zoned`（本文件）：基型 `plant/rta` 不动，
 *      只把 `uniformity` prop 改名为 `waferUniformity`（0–5 K，任务书要的名字），
 *      变体有自己的 `waferUniformity` 0–3 K 与 1000–1300 °C 的 holds。
 *
 * 本文件取 ②。代价是变体的 8 件 BOM 要在 `make/rta-zoned` 的 uses 里写一遍
 * （基型的 11 件在 composedOf 里）；这不是"同一份装配抄两遍"，是两台不同
 * 整机——变体少了旧 lamp-array/zone-control/lamp-trim/pyrometer 四件，
 * 多了一件 zone-lamp（它们都在 zone-lamp 里）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ±5 K 卡在哪，±3 K 靠什么
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 旧 RTA：24 只灯并成 **16 个功率区**（每区一个可控硅 + 逐灯电流微调），
 * 温度反馈只有 **1 只 1.55 µm 高温计**（±5–10 K，单点）。16 区是"功率开环
 * 分区"，不是"温度闭环分区"——区与区之间靠边缘环 + 60 rpm 自转抹平，
 * 片内 ±5 K 是设计值（`rta-uniformity.ts` 的 A 类：连读数都没有）。
 *
 * ±3 K 的杠杆不是"更多区"，是**每区有独立的温度反馈**：
 *
 *   9 个同心区（24 只灯按 2–3 只一区并接），每区一只 1.55 µm 高温计；
 *   9 只同一批 InGaAs 管 + 同一批滤光片，**相对匹配 1–1.5 K**（绝对仍
 *   5–10 K，均匀性只用相对值）；60 rpm 自转把方位角抹平，径向 9 区闭环，
 *   边缘环补最外区的辐射损失。
 *
 * 数：
 *   9 区 × 1 只高温计，扫描/并行不限；PID 更新 10–100 Hz（`plant/rta/zone-control`
 *   的 updateRate 窗口），热时间常数 1–3 s，10 s 平台够收敛。
 *   区功率 60 kW / 9 = 6.7 kW/区；200 mm 片面积 314 cm²，片热容
 *   （0.7 mm 硅、1.65 J/(cm³·K)）= 36 J/K；50–100 K/s 要 1.8–3.6 kW，
 *   60 kW 的灯阵余量 16–33 倍。
 *   片内 ±3 K 对 200 mm 是径向 3 K/100 mm 的梯度；9 区每区 22 mm 宽，
 *   区中心间隔 22 mm，相邻区温差 3 K 时热扩散长度 sqrt(a·t)：
 *   a = 0.9 cm²/s（硅），10 s 平台 sqrt(9)=3 cm > 22 mm，横向扩散把区界
 *   抹平——所以 9 区够，不需要 16 区。
 *
 * ⚠️ **±3 K 仍是设计值**：`rta-uniformity.ts` 已把"片内均匀性无读数"记为
 *    A 类（K 型偶已补，仍缺滑环/同步读数），本文件不假装测了。9 只高温计的
 *    相对匹配 1–1.5 K 也是设计值；绝对 5–10 K 只作温度锚点。
 *
 * ⚠️ **1300 °C 端**：石英腔的长期上限是 1150–1250。RTA 是冷壁——灯从上面
 *    照片，片到 1300 时石英壁靠 9 区功率分配 + 边缘环压在 1250 以下；
 *    1300 只在 ≤10 s 的短时平台成立。长期 1300 要换 SiC 腔（缺 1 条路线，
 *    不在本文件）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 交付（设计值）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   片内        ±3 K（200 mm；9 区温度闭环 + 边缘环 + 60 rpm）
 *   重复性      ±1.5 K（同一配方 3 次，区温 max-min）
 *   升温        50–100 K/s（1000–1300 °C 段）
 *   片          200 mm
 *   旧基型      `plant/rta` 仍 ±5 K（`waferUniformity` 0–5 K），不替换
 *
 * ═══ R13 ═══
 * 本文件只有 Item + Route；没有 `measure/*`、没有 `*-record`。片内均匀性的
 * 测量仍是 A 类缺口（见 `rta-uniformity.ts` 文件头四条），不在本文件里假装。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const RTA_ZONED_ITEMS: readonly Item[] = [
  /**
   * **9 区灯阵：24 只灯分 9 个同心区，每区一只高温计 + 独立 PID。**
   *
   * 它是 `plant/rta-zoned` 的专用件，装进 RTA 的灯阵位置（替换旧
   * `plant/rta/lamp-array` + `plant/rta/zone-control` + `plant/rta/lamp-trim`
   * + 单点 `plant/rta/pyrometer` 四件）。
   *
   *   区数      5–9（本文件交 9：24 只灯 2–3 只一区）
   *   功率      60–80 kW（24 × 2.5 kW 的灯管不变）
   *   相对精度  1–1.5 K（设计值；9 只同批高温计的相对匹配，绝对 5–10 K 只作锚点）
   *
   * 为什么 9 区不是 16 区：旧 16 区是**功率**区，没有每区温度反馈；9 区是
   * **温度**区，每区一只高温计闭环。区数少一半，但每区有独立的温度自由度，
   * 片内从 ±5 K 到 ±3 K 靠的是反馈，不是区数。
   */
  {
    id: 'plant/rta/zone-lamp',
    name: '9-Zone Lamp Array', name_zh: '9 区灯阵',
    unit: '件',
    category: 'part',
    props: [
      { param: 'zones', kind: 'range', min: 5, max: 9, unit: '区' },
      { param: 'power', kind: 'range', min: 60, max: 80, unit: 'kW' },
      { param: 'relativeAccuracy', kind: 'range', min: 0, max: 1.5, unit: 'K', dir: 'atMost' },
    ],
  },

  /**
   * **±3 K 的 RTA 变体整机：9 区温度闭环 + 200 mm + 50–100 K/s。**
   *
   * 与 `plant/rta` 的差别只有灯阵与反馈：
   *   旧  24 灯 / 16 功率区 / 1 只高温计 / 16 区功率控制 / 逐灯微调
   *   新  24 灯 / 9 温度区 / 9 只高温计 / 9 路 PID（`zone-control` 的 9 路）/ 逐灯微调
   * 反射罩、石英腔、石墨托、功率柜、装卸台、边缘环、自转台沿用。
   *
   * `holds` 是 1000–1300 °C（变体的片温窗口）；基型仍是 400–1200。
   * `waferUniformity` 0–3 K，`repeatability` 0–1.5 K，片 200 mm。
   */
  {
    id: 'plant/rta-zoned',
    name: '±3 K Zoned RTA System', name_zh: '±3 K 分区 RTA 整机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'temperature', kind: 'range', min: 1000, max: 1300, unit: '°C' },
      { param: 'rampRate', kind: 'range', min: 50, max: 100, unit: 'K/s' },
      { param: 'soak', kind: 'range', min: 1, max: 120, unit: 's' },
      { param: 'waferUniformity', kind: 'range', min: 0, max: 3, unit: 'K', dir: 'atMost' },
      { param: 'measure/repeatability', kind: 'range', min: 0, max: 1.5, unit: 'K', dir: 'atMost' },
      { param: 'waferSize', kind: 'range', min: 100, max: 200, unit: 'mm', dir: 'atLeast' },
      { param: 'pressure', kind: 'range', min: 5e4, max: 2e5, unit: 'Pa' },
    ],
    holds: [
      { param: 'temperature', min: 1000, max: 1300 },
      { param: 'rampRate', min: 50, max: 100 },
      { param: 'pressure', min: 5e4, max: 2e5 },
    ],
  },
];

export const RTA_ZONED_ROUTES: readonly Route[] = [
  {
    /**
     * **9 区灯阵：分 9 个同心区 → 装 9 只高温计 → 接 9 路 PID → 试机。**
     *
     *   灯阵 1 + 16 区控制 1 + 逐灯微调 1 + 高温计 9
     *     + 铜 1 + 氧化铝 0.1 + 45 钢 0.5 → 灯阵 1 件
     *
     * 9 只高温计是相对匹配的关键：同一批 InGaAs 管、同一批 1.55 µm 滤光片、
     * 同一批跨阻电阻；9 个视场对准 9 个径向带，60 rpm 自转把每个视场的
     * 方位角平均掉。相对精度 1–1.5 K 是 9 只光电高温计对黑体标定后的
     * 相互偏差，不是 49 点片均匀性；本层没有 49 点均匀性读数。
     */
    id: 'make/rta-zone-lamp',
    name: '9-Zone Lamp Array Manufacturing', name_zh: '9 区灯阵制造',
    produces: [
      {
        item: 'plant/rta/zone-lamp',
        qty: q(1),
        gives: [
          { param: 'zones', kind: 'range', min: 9, max: 9 },
          { param: 'power', kind: 'range', min: 60, max: 80 },
          { param: 'relativeAccuracy', kind: 'range', min: 1, max: 1.5, record: 'mat/rta-zone-lamp-measure-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/rta/lamp-array', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rta/zone-control', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rta/lamp-trim', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rta/pyrometer', qty: q(9) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 2) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh:
          '分 9 个同心区：24 只灯按 2–3 只一区并接，每区一只可控硅（用 `plant/rta/zone-control` 的 9 路）；区间绝缘 ≥100 MΩ',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '装 9 只 1.55 µm 高温计：同批 InGaAs 管 + 同批滤光片，9 个视场对准 9 个径向带（中心 + 4 个 r/2 + 4 个 3r/4）；相对匹配 1–1.5 K（绝对 5–10 K 只作锚点）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '接 16 区控制（用 9 路）与逐灯微调；PID 自整定：1000→1100 °C 阶跃的 63 % 上升 0.1–1 s，超调 <3 K；灯管电流差 <0.5 %',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '把新灯阵换到 `plant/rta` 的灯阵位置试机 1000–1200 °C：9 区各自到温，区间偏差 ≤3 K（设计值）；记录 9 区灯电流与高温计读数，作为 `plant/rta-zoned` 的初始参数表',
        performedBy: 'plant/rta',
        under: [{ param: 'temperature', min: 1000, max: 1200 }],
      },
    ],
    rate: { hours: q(32) },
    unbalanced_zh:
      '灯阵 1 + 16 区控制 1 + 逐灯微调 1 + 高温计 9 + 铜 1 + 氧化铝 0.1 + 45 钢 0.5 → 灯阵 1 件；产物按件计，余是接线/支架/绝缘边角',
  },

  {
    /**
     * **±3 K RTA 变体整机：8 件装配 + 9 区参数表。**
     *
     *   9 区灯阵 1 + 反射罩 1 + 石英腔 1 + 石墨托 1 + 功率柜 1
     *     + 装卸台 1 + 边缘环 1 + 自转台 1 → RTA 变体 1 台
     *
     * 装配后不做整机热试：热试已经在 `make/rta-zone-lamp` 里用基型 `plant/rta`
     * 做过（1000–1200 °C、9 区 ≤3 K）。整机这一步只做冷态联调（绝缘、联锁、
     * 通道通断）与参数表；片内 ±3 K 的整机读数仍是 A 类缺口（无 9 点同步
     * 读数、无 200 mm 热电偶片），不写"已测"。
     */
    id: 'make/rta-zoned',
    name: '±3 K Zoned RTA System Manufacturing', name_zh: '±3 K 分区 RTA 整机制造',
    produces: [
      {
        item: 'plant/rta-zoned',
        qty: q(1),
        gives: [
          { param: 'temperature', kind: 'range', min: 1000, max: 1300 },
          { param: 'rampRate', kind: 'range', min: 50, max: 100 },
          { param: 'soak', kind: 'range', min: 1, max: 120 },
          // 外部核对（2026-10）：Applied Vantage Vulcan 2011 厂商报道 18 区、
          // 75–1300 °C、<3 °C 波动；本条 2–3 K 是 design，不是实测。
          // https://sst.semiconductor-digest.com/mysemicondaily/2011/07/14/vantage-vulcan-turns-rtp-upside-down/
          { param: 'waferUniformity', kind: 'range', min: 2, max: 3, record: 'mat/rta-zoned-measure-record' },
          { param: 'measure/repeatability', kind: 'range', min: 0.8, max: 1.5 },
          { param: 'waferSize', kind: 'range', min: 200, max: 200 },
          { param: 'pressure', kind: 'range', min: 5e4, max: 2e5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/rta/zone-lamp', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rta/reflector', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rta/quartz-chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rta/susceptor', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rta/power-stack', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rta/load-lock', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rta/edge-ring', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rta/rotation-stage', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh:
          '装 9 区灯阵、反射罩、石英腔、石墨托、功率柜、装卸台、边缘环、60 rpm 自转台；灯阵与片距离 40–60 mm（冷壁）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '接 9 区 PID、超温 1350 °C 联锁（独立于 PID 的硬件回路）、冷却水与氮气；联锁动作 ≤50 ms',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '冷态联调：9 路高温计通断、绝缘 ≥100 MΩ、9 区可控硅触发、联锁回路；通道串扰 <1 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '写参数表：升温 50–100 K/s、1000–1300 °C、200 mm、60 rpm、9 区初始功率分配；片内 ±3 K 是设计值（A 类无读数），重复性 ±1.5 K 按 3 次配方记录',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(32) },
    unbalanced_zh:
      '灯阵 1 + 反射罩 1 + 石英腔 1 + 石墨托 1 + 功率柜 1 + 装卸台 1 + 边缘环 1 + 自转台 1 → RTA 变体 1 台；零件按件计，没有 kg 账；余是装配废品与接线',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...RTA_ZONED_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...RTA_ZONED_ROUTES];
