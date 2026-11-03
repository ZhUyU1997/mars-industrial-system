/**
 * 砂轮动平衡与 24 轴同步性：记录与测量路线。
 *
 * 从 data/machine/balance-and-sync.ts 迁入（R13）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DATA_ITEMS: readonly Item[] = [
  /**
   * 砂轮动平衡记录。一份记录 = 一片砂轮、一个转速、两平面。
   *
   *   unbalance    初始不平衡量 100–800 g·mm（去重前）
   *   phase        0–360°
   *   residual     0.2–0.5 g·mm（去重后）
   *   grade        G6.3 / G2.5
   *   speed        1500–3000 r/min
   *   rotorMass    5–20 kg
   *   wheelDiameter 200–400 mm
   *   permissible  40–802 g·mm（见文件头 ISO 1940 表）
   *
   * ⚠️ 0.1 g·mm 的分辨靠 5 g·mm 标定转子外推 50 倍；不确定度没有做 GUM 预算，
   * 0.2–0.5 g·mm 残余是设计窗口，不是校准证书。
   */
  {
    id: 'mat/wheel-balance-record',
    name: '砂轮动平衡记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'unbalance', kind: 'range', min: 0.1, max: 20000, unit: 'g·mm' },
      { param: 'phase', kind: 'range', min: 0, max: 360, unit: '°' },
      { param: 'residual', kind: 'range', min: 0, max: 1, unit: 'g·mm', dir: 'atMost' },
      { param: 'grade', kind: 'enum', values: ['G6.3', 'G2.5'] },
      { param: 'speed', kind: 'range', min: 300, max: 3000, unit: 'rpm' },
      { param: 'rotorMass', kind: 'range', min: 5, max: 50, unit: 'kg' },
      { param: 'wheelDiameter', kind: 'range', min: 200, max: 400, unit: 'mm' },
      { param: 'permissible', kind: 'range', min: 10, max: 20000, unit: 'g·mm' },
    ],
  },

  /**
   * 24 轴同步性记录。一份记录 = 一次 24 轴圆插补、30 s。
   *
   *   channels        24
   *   syncError       0.1–2 µs（通道间最大偏斜）
   *   followingError  1–50 µm（单轴最大跟随误差）
   *   circularity     1–30 µm（圆插补径向偏差）
   *   sampleRate      10–100 kS/s
   *   skew            0.1–1 µs
   *
   * ⚠️ 时间是相对同一 5 MHz 时钟的；1e-5 的频率误差在 30 s 内积 300 µs 绝对漂移，
   * 不是 UTC 溯源。相对偏斜不受影响（同一时钟），绝对时间不是。
   */
  {
    id: 'mat/axis-sync-record',
    name: '24 轴同步性记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'channels', kind: 'range', min: 1, max: 64, unit: '路', dir: 'atLeast' },
      { param: 'syncError', kind: 'range', min: 0.01, max: 100, unit: 'µs', dir: 'atMost' },
      { param: 'followingError', kind: 'range', min: 0.1, max: 1000, unit: 'µm', dir: 'atMost' },
      { param: 'circularity', kind: 'range', min: 0.1, max: 1000, unit: 'µm', dir: 'atMost' },
      { param: 'sampleRate', kind: 'range', min: 1, max: 200, unit: 'kS/s', dir: 'atLeast' },
      { param: 'skew', kind: 'range', min: 0.01, max: 10, unit: 'µs', dir: 'atMost' },
    ],
  },
];

export const DATA_ROUTES: readonly Route[] = [
  /**
   * 砂轮动平衡测量：装轮 → 初始不平衡 → 钻孔去重 → 复测残余。
   *
   *   砂轮 1 + 标定转子/动平衡机（工具）→ 记录 1
   *
   * 1500–3000 r/min；G6.3 许用 100–802 g·mm、G2.5 40–318 g·mm（m=5–20 kg）。
   * φ400 只跑到 ~1670 r/min（35 m/s，树脂结合剂上限）。
   */
  {
    id: 'measure/grinding-wheel-balance',
    name: '砂轮动平衡测量',
    produces: [
      {
        item: 'mat/wheel-balance-record',
        qty: q(1),
        gives: [
          { param: 'unbalance', kind: 'range', min: 100, max: 800 },
          { param: 'phase', kind: 'range', min: 0, max: 360 },
          { param: 'residual', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'grade', kind: 'enum', oneOf: ['G6.3', 'G2.5'] },
          { param: 'speed', kind: 'range', min: 1500, max: 3000 },
          { param: 'rotorMass', kind: 'range', min: 5, max: 20 },
          { param: 'wheelDiameter', kind: 'range', min: 200, max: 400 },
          { param: 'permissible', kind: 'range', min: 40, max: 802 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/grinder/wheel', qty: q(1) }] }],
    needs: [
      'plant/metrology-room',
      'plant/dynamic-balance-machine/calibration-rotor',
    ],
    steps: [
      {
        note_zh:
          '装轮/对中（≤0.05 mm），先用标定转子复核刻度；φ200 可 3000 r/min，φ400 只到 ~1670 r/min',
        performedBy: 'plant/dynamic-balance-machine',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '1500–3000 r/min 测初始不平衡量与相位（左右两平面各一次）',
        performedBy: 'plant/dynamic-balance-machine',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '按相位在去重工位钻孔：φ6 钻头 R=150 mm 上 0.02 mm ≈ 0.66 g·mm；粗去重后复测，再精钻到残余 ≤0.5 g·mm',
        performedBy: 'plant/dynamic-balance-machine',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '复测残余与 G 级：G6.3 的 U_per = 9549×6.3×m/n，G2.5 同式；写记录（φ400 注明 35 m/s 速度限制）',
        performedBy: 'plant/dynamic-balance-machine',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(4) },
    unbalanced_zh:
      '砂轮 1 + 标定转子/动平衡机（工具，不消耗）→ 记录 1；无材料消耗。100–800 g·mm 初始量、0.2–0.5 g·mm 残余、40–802 g·mm 许用值都是设计/计算窗口，记录里是读数',
  },

  /**
   * 24 轴同步性测量：接线 → 圆插补 → 算偏斜/跟随/圆度。
   *
   *   控制器 1 + 分析仪/机器人（工具）→ 记录 1
   *
   * 24 路、10–100 kS/s、30 s；同步误差 0.1–2 µs、跟随 1–50 µm、圆度 1–30 µm。
   */
  {
    id: 'measure/24axis-synchronism',
    name: '24 轴同步性测量',
    produces: [
      {
        item: 'mat/axis-sync-record',
        qty: q(1),
        gives: [
          { param: 'channels', kind: 'range', min: 24, max: 24 },
          { param: 'syncError', kind: 'range', min: 0.1, max: 2 },
          { param: 'followingError', kind: 'range', min: 1, max: 50 },
          { param: 'circularity', kind: 'range', min: 1, max: 30 },
          { param: 'sampleRate', kind: 'range', min: 10, max: 100 },
          { param: 'skew', kind: 'range', min: 0.1, max: 1 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/robot/controller', qty: q(1) }] }],
    needs: [
      {
        item: 'plant/multi-axis-sync-analyzer',
        qty: q(1),
        need: [
          { param: 'channels', kind: 'range', min: 24, max: 24 },
          { param: 'measure/sampleRate', kind: 'range', min: 10, max: 100 },
          { param: 'measure/skew', kind: 'range', min: 0.1, max: 1 },
          { param: 'measure/syncError', kind: 'range', min: 0.1, max: 2 },
          { param: 'measure/followingError', kind: 'range', min: 1, max: 50 },
          { param: 'measure/circularity', kind: 'range', min: 1, max: 30 },
        ],
        onRelax: 'functional-kept',
      },
      'plant/robot',
      'plant/metrology-room',
    ],
    steps: [
      {
        note_zh:
          '把 24 路编码器 A/B/Z 从控制柜引到分析仪；同一 5 MHz 时钟，逐路对通道号（19–21 °C）',
        performedBy: 'plant/multi-axis-sync-analyzer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '24 轴圆插补：R=100 mm、10 mm/s、30 s；10–100 kS/s 采 24 路时间戳与计数',
        performedBy: 'plant/multi-axis-sync-analyzer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '算通道间最大偏斜、单轴跟随误差（指令−实际，µm）、圆度（径向偏差峰峰值）；写记录',
        performedBy: 'plant/multi-axis-sync-analyzer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(8) },
    unbalanced_zh:
      '控制器 1 + 分析仪/机器人（工具，不消耗）→ 记录 1；无材料消耗。0.1–2 µs、1–50 µm、1–30 µm 是记录窗口；5 MHz 时钟的 100–200 ns 时间戳是设计值，不是绝对时间溯源',
  },
];
