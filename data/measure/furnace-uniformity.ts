/**
 * 熔炼炉炉温均匀性的测量 —— 种子设备的精度第一次落成“可查的记录”。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么用记录条目，不塞进机器条目
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 车床、磨床的主轴是**零件**，产出路线能直接交窗口，测量路线把窗口收紧。
 * 熔炼炉是**种子**（有零件清单、没有产出路线），窗口无处可挂 —— 硬塞进
 * `props` 只会变成“声明了但没有任何 gives 能对”，表里永远写“未判”。
 *
 * 所以这一条产出的是**记录**：`mat/furnace-uniformity-record`。记录不是炉子，
 * 是“这台炉子在那个温度上，九点之间差多少”的一张证书。以后谁要判“这台炉子
 * 能不能干这个活”，看的是记录，不是炉子。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 怎么测
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① 三支 K 型热电偶（`std/thermocouple-nicr-nial-general`）插进炉膛：中心、边缘、
 *      角上各一 —— 不是九点，是三点；三点均匀性能代表九点，因为它们取的是
 *      **径向与轴向的最不利位置**；
 *   ② 每支热电偶对一支冰点瓶（0 °C）接指零电位差计（`plant/probe-station/null-detector`，
 *      0.01 µA/格，10 µV/格）—— 本层没有多通道记录仪，只能逐支读；
 *   ③ 升到设定点，保 30 min 到稳态，每 2 min 读一遍，读 5 轮；
 *   ④ 均匀性 = 三点读数的最大差；控温精度 = 同一点 5 轮的极差。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 数字与缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   K 型热电偶 1 300 °C 上误差 ±4–6 °C；指零电位差计 10 µV ≈ 0.25 °C（K 型
 *   41 µV/°C）⇒ **单点绝对误差 ±5 °C，三点之间的差能读到 ±0.5 °C**。
 *   所以这条记录能判“均匀性 ≤10 °C”，判不了“绝对温度准不准”——那是热电偶
 *   标定的事，本层没有定点炉（锌/铝/铜三点）。
 *
 *   缺口：① 只有三支热电偶，够判均匀性、不够画温度场；② 没有多点记录仪，
 *   五轮是人工读的，轮与轮之间靠钟；③ 没有冷端补偿（冰点瓶手工维持）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FURNACE_UNIFORMITY_ITEMS: readonly Item[] = [
  {
    id: 'mat/furnace-uniformity-record',
    name: 'Furnace Temperature Uniformity Measurement Record', name_zh: '炉温均匀性测量记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'uniformity', kind: 'range', min: 0, max: 100, unit: '°C', dir: 'atMost' },
      { param: 'controlBand', kind: 'range', min: 0, max: 50, unit: '°C', dir: 'atMost' },
    ],
  },
  {
    id: 'mat/furnace-cooling-record',
    name: 'Cooling Curve Measurement Record', name_zh: '降温曲线测量记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'coolingRate', kind: 'range', min: 0, max: 100, unit: '°C/min', dir: 'atMost' },
      { param: 'soakTime', kind: 'range', min: 0, max: 600, unit: 'min', dir: 'atLeast' },
    ],
  },  {
    id: 'mat/furnace-coil-record',
    name: 'Induction Coil Water Pressure Record', name_zh: '感应线圈的水压记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'waterPressure', kind: 'range', min: 0, max: 200, unit: 'kPa', dir: 'atLeast' },
      { param: 'coilCurrent', kind: 'range', min: 0, max: 1000, unit: 'A', dir: 'atLeast' },
      { param: 'flowRate', kind: 'range', min: 0, max: 100, unit: 'L/min', dir: 'atLeast' },
    ],
  },];

export const FURNACE_UNIFORMITY_ROUTES: readonly Route[] = [
  {
    /**
     * 炉温均匀性测量：三支 K 型热电偶 + 冰点瓶 + 指零电位差计，三点五轮。
     *
     * 交出去：`uniformity ≤10 °C`、`controlBand ≤5 °C`（1 300 °C 那一档）。
     */
    id: 'measure/furnace-uniformity',
    name: 'Furnace Temperature Uniformity Measurement', name_zh: '炉温均匀性测量',
    produces: [
      {
        item: 'mat/furnace-uniformity-record',
        qty: q(1),
        gives: [
          { param: 'uniformity', kind: 'range', min: 0, max: 10 },
          { param: 'controlBand', kind: 'range', min: 0, max: 5 },
        ],
      },
    ],
    uses: [
      // 热电偶是量具，不是原料：放 needs 会与 steps 的执行者冲突，放 uses 又会被当原料，
      // 所以只在 steps 里出现（见下面三步）。
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'mat/thermocouple-cal-record'],
    steps: [
      { note_zh: '插三支热电偶：中心、边缘、角上（径向与轴向最不利位置）', performedBy: 'plant/robot' },
      { note_zh: '升到设定点保 30 min 到稳态', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1200, max: 1300 }] },
      { note_zh: '每 2 min 读一遍、读 5 轮（逐支读，冰点瓶冷端）', performedBy: 'plant/probe-station' },
      { note_zh: '算三点最大差（均匀性）与同点五轮极差（控温精度）', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 降温曲线测量：炉子从 1 300 °C 自然冷到 200 °C，记每 5 min 一点。
     *
     * 为什么这条值得测：**热惯性**决定了"保温多久算透"与"停炉后能不能马上开盖"。
     * 本层没有热流计，但三支热电偶还在炉子上，降温曲线就是最便宜的热参数。
     *
     * 交出去：`coolingRate ≤80 °C/min`（点 1 300 到 200 那条弦的平均斜率上限）、
     * `soakTime ≥120 min`（从 1 300 到 1 200 的保温时间，判"炉衬蓄热够不够"）。
     *
     * 缺口：① 没有连续记录仪，5 min 一点靠人工；② 炉门开闭影响极大，
     * 本层没有"开盖状态"这个参数，只能记"全程关炉门"。
     */
    id: 'measure/furnace-cooling-curve',
    name: 'Cooling Curve Measurement', name_zh: '降温曲线测量',
    produces: [
      {
        item: 'mat/furnace-cooling-record',
        qty: q(1),
        gives: [
          { param: 'coolingRate', kind: 'range', min: 0, max: 80 },
          { param: 'soakTime', kind: 'range', min: 120, max: 600 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: ['plant/metrology-room', 'mat/thermocouple-cal-record'],
    steps: [
      { note_zh: '炉子升到 1 300 °C 保 30 min（与均匀性那条同一炉次，省一次升温）', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1200, max: 1300 }] },
      { note_zh: '断电，每 5 min 用指零电位差计读一次（三支热电偶轮读）', performedBy: 'plant/probe-station' },
      { note_zh: '记到 200 °C 以下停，算平均降温速率与 1 300→1 200 的保温时间', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 感应线圈的水压、电流、流量记录 —— 熔炼炉的“动力侧”三个数。
     *
     * 为什么用这三样：
     *   · **水压**：本层没有压力表（std 白名单里就是没有），但有一根玻璃管与水 ——
     *     U 形管水柱就是压力计，1 mm 水柱 = 9.8 Pa，读 2–6 m 水柱（20–60 kPa）；
     *   · **电流**：铜排分流器（自己车一根已知截面的铜条）+ 指零电位差计读它两端
     *     的压降，按 U = IR 反算；本层没有钳形表，这样最省；
     *   · **流量**：量筒接一分钟（水桶 + 刻度），体积法。
     *
     * 交出去：`waterPressure ≥20 kPa`、`coilCurrent ≥50 A`、`flowRate ≥10 L/min`。
     *
     * 缺口：① U 形管只能测表压，测不到 0.2 MPa 以上（水柱要 20 m）；② 分流器
     * 的电阻随温度漂（铜 0.4 %/K），只能在热态下标定；③ 没有连续记录，全是人工读。
     */
    id: 'measure/furnace-coil',
    name: 'Induction Coil Water Pressure Measurement', name_zh: '感应线圈的水压测量',
    produces: [
      {
        item: 'mat/furnace-coil-record',
        qty: q(1),
        gives: [
          { param: 'waterPressure', kind: 'range', min: 20, max: 60 },
          { param: 'coilCurrent', kind: 'range', min: 50, max: 200 },
          { param: 'flowRate', kind: 'range', min: 10, max: 60 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '接 U 形玻璃管到回水管，读水柱高度（mm）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '铜排分流器串进线圈回路，指零电位差计读压降，按 U=IR 反算电流', performedBy: 'plant/probe-station' },
      { note_zh: '量筒接一分钟，量回水体积（L/min）', performedBy: 'plant/robot' },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...FURNACE_UNIFORMITY_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...FURNACE_UNIFORMITY_ROUTES];
