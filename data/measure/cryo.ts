/**
 * 低温链 —— **测量与记录那一半**（R13：只放 data/measure/）。
 *
 * ⚠️ **分工（R13）**：本文件只放 **2 条测量路线 + 2 个记录条目**；干冰冷阱与 GM
 * 制冷机的整机、零件在 `data/machine/cryo.ts`（导出名 `CRYO_ITEMS` /
 * `CRYO_ROUTES`），按 id 跨文件解析 —— 两文件在同一次 data 装配里注册，
 * 数据层只引 id，没有跨文件 import。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、两条读数
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   measure/dew-point      → mat/dew-point-record
 *       露点 −80…−72 °C、水 0.5–1.9 ppm、重复性 0.5–1 K
 *       （干冰 −78.5 °C；平衡 0.69 ppm，传质限把出口抬到 −72…−80 °C）
 *
 *   measure/cryo-capacity  → mat/cryo-record
 *       冷量 1.5–4 W @ 19–22 K、降温 3–6 h、氦充装 0.8–1.5 kg、稳定度 0.2–0.5 K
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、推导与缺口在哪
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   −78.5 °C 的冷量账（573 kJ/kg、19.9 W/K·h）、露点阶梯（−78.5 / −98 要 LN₂ /
 *   −100 以下只能靠冷头）、**氦为什么只能一次性装填 0.8–1.5 kg**（1 kg He =
 *   1.1×10⁶ m³ 空气、20 K 精馏循环依赖、R10 非设备条目）—— 全在
 *   `data/machine/cryo.ts` 的文件头 §一–§三，这一份不重复抄。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { CRYO_MEASURE_ITEMS, CRYO_MEASURE_ROUTES } from '../../data/measure/cryo.ts';
 *   items: [...CRYO_MEASURE_ITEMS] · routes: [...CRYO_MEASURE_ROUTES]
 *
 * ⚠️ 同时要注册 `data/machine/cryo.ts`（HW 两行）；只注册这一半，
 * `plant/dry-ice-trap` 等会 `unknown_item`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、两个记录条目（R12 的收窄产物）
// ═══════════════════════════════════════════════════════════════════════════

export const CRYO_MEASURE_ITEMS: readonly Item[] = [
  /**
   * **露点记录。一份对应一批。**
   *
   *   dewPoint     −80…−72 °C（干冰冷阱出口；平衡 −78.5，传质限 −72…−80）
   *   water        0.5–1.9 ppm（−80…−72 °C 的冰面饱和值）
   *   repeatability 0.5–1 K（浴温波动）
   *
   * ⚠️ −78.5 °C 冰面的饱和蒸气压是 **0.070 Pa**（0.69 ppm），不是 6×10⁻⁴ Pa：
   * 常用的 −60/−70/−78.5 °C 三档是 1.1 / 0.26 / 0.070 Pa（hPa 值 1.1×10⁻² /
   * 2.6×10⁻³ / 7×10⁻⁴）。按 Pa 直接除 101 325 会把水含量算低 100 倍。
   *
   * 80 K 档（GM 一级）在 `data/measure/cryo-trap.ts` 的 `measure/dew-point-80k`，
   * 单独一条 `mat/dew-point-80k-record`；干冰阱与 80 K 阱窗口不相交，不能共记录。
   */
  {
    id: 'mat/dew-point-record',
    name: '露点记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'dewPoint', kind: 'range', min: -80, max: -72, unit: '°C' },
      { param: 'water', kind: 'range', min: 0.5, max: 1.9, unit: 'ppm' },
      { param: 'repeatability', kind: 'range', min: 0.5, max: 1, unit: 'K', dir: 'atMost' },
    ],
  },

  /**
   * **80 K 阱露点记录。** 与干冰阱记录分开：窗口 −105…−101 °C，交集为空。
   */
  {
    id: 'mat/dew-point-80k-record',
    name: '80 K 阱露点记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'dewPoint', kind: 'range', min: -105, max: -101, unit: '°C' },
      { param: 'water', kind: 'range', min: 0.005, max: 0.01, unit: 'ppm' },
      { param: 'repeatability', kind: 'range', min: 0.3, max: 0.6, unit: 'K', dir: 'atMost' },
    ],
  },

  /**
   * **20 K 冷量记录。一份对应一次验收。**
   *
   *   coolingPower 1.5–4 W @19–22 K
   *   temperature  19–22 K
   *   cooldownTime 3–6 h
   *   heliumCharge 0.8–1.5 kg（**一次性装填**；`mat/helium` 已建条目，见 ONE_TIME）
   *   stability    0.2–0.5 K
   */
  {
    id: 'mat/cryo-record',
    name: '20 K 冷量记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'coolingPower', kind: 'range', min: 1.5, max: 4, unit: 'W' },
      { param: 'temperature', kind: 'range', min: 19, max: 22, unit: 'K' },
      { param: 'cooldownTime', kind: 'range', min: 1, max: 12, unit: 'h' },
      { param: 'heliumCharge', kind: 'range', min: 0.5, max: 2, unit: 'kg' },
      { param: 'stability', kind: 'range', min: 0.1, max: 2, unit: 'K', dir: 'atMost' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、两条测量路线（R12：窗口在这里从仪器能力收窄成记录）
// ═══════════════════════════════════════════════════════════════════════════

export const CRYO_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **干冰冷阱的露点：装干冰 → 预冷 → 通 N₂ 过阱 → 读出口露点。**
     *
     *   2 kg 干冰 + 2 L 异丙醇 + 0.1 kg N₂ → 露点记录 1 份
     *
     * 四步（1 h 前处理 + 30 min 稳定）：
     *   ① 装 2 kg 干冰 + 2 L 异丙醇，浴温 −78 °C，预冷 30 min
     *   ② 通 N₂ 100 mL/min 过阱 30 min（出口露点稳定）
     *   ③ 用 `plant/dew-point-meter` 读出口露点（电解式，下限 0.05 ppm ≈ −95 °C）
     *   ④ 记录：露点 −80…−72 °C、水 0.5–1.9 ppm、重复性 0.5–1 K
     */
    id: 'measure/dew-point',
    name: '露点测量',
    produces: [
      {
        item: 'mat/dew-point-record',
        qty: q(1),
        gives: [
          { param: 'dewPoint', kind: 'range', min: -80, max: -72 },
          { param: 'water', kind: 'range', min: 0.5, max: 1.9 },
          { param: 'repeatability', kind: 'range', min: 0.5, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/dry-ice', qty: q(2) }] },
      { anyOf: [{ item: 'mat/isopropanol', qty: q(2) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/mfc'],
    steps: [
      {
        note_zh: '① 装 2 kg 干冰 + 2 L 异丙醇到浴槽，浴温 −78 °C，预冷 30 min（出口热电偶 −75…−78）',
        performedBy: 'plant/dry-ice-trap',
        under: [{ param: 'temperature', min: -85, max: -70 }],
      },
      {
        note_zh: '② 通 N₂ 100 mL/min 过阱 30 min；阱体出口露点稳定到 −72…−80 °C',
        performedBy: 'plant/dry-ice-trap',
        under: [{ param: 'temperature', min: -85, max: -70 }],
      },
      {
        note_zh: '③ 用 `plant/dew-point-meter` 读出口露点（电解式，0.05 ppm 地板 ≈ −95 °C）；读数前吹 5 min 让池平衡',
        performedBy: 'plant/dew-point-meter',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '④ 记录：露点 −80…−72 °C、水 0.5–1.9 ppm、重复性 0.5–1 K；同批做 3 次取中位',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(2) },
  },

  {
    /**
     * **20 K 冷量验收：抽真空 → 一级 → 二级 → 加热标定 → 记录。**
     *
     *   0.1 kg N₂ + 电加热 1–4 W → 冷量记录 1 份
     *
     * 五步（6–8 h）：
     *   ① 抽真空：真空罩 1e-5–1e-3 Pa（冷头不结霜）
     *   ② 一级 45–80 K（40–60 W）
     *   ③ 二级 19–22 K（1.5–4 W）
     *   ④ 加热标定：冷台上的电阻加热器加 1/2/4 W，等温 ±0.3 K，读冷量
     *   ⑤ 记录：冷量 1.5–4 W、温度 19–22 K、降温 3–6 h、氦充装 0.8–1.5 kg、稳定度 0.2–0.5 K
     */
    id: 'measure/cryo-capacity',
    name: '20 K 冷量测量',
    produces: [
      {
        item: 'mat/cryo-record',
        qty: q(1),
        gives: [
          { param: 'coolingPower', kind: 'range', min: 1.5, max: 4 },
          { param: 'temperature', kind: 'range', min: 19, max: 22 },
          { param: 'cooldownTime', kind: 'range', min: 3, max: 6 },
          { param: 'heliumCharge', kind: 'range', min: 0.8, max: 1.5 },
          { param: 'stability', kind: 'range', min: 0.2, max: 0.5 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/nitrogen', qty: q(1, 10) }] }],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    steps: [
      {
        note_zh: '① 抽真空：真空罩 1e-5–1e-3 Pa（不结霜、不漏热）',
        performedBy: 'plant/gm-cryocooler',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh: '② 一级降到 45–80 K（40–60 W），冷屏先挡辐射',
        performedBy: 'plant/gm-cryocooler',
        under: [{ param: 'temperature', min: 50, max: 80 }],
      },
      {
        note_zh: '③ 二级降到 19–22 K；降温总时间 3–6 h（冷头 10–14 kg + 负载）',
        performedBy: 'plant/gm-cryocooler',
        under: [{ param: 'temperature', min: 18, max: 25 }],
      },
      {
        note_zh: '④ 加热标定：冷台电阻加热器加 1/2/4 W，等温 ±0.3 K，读冷量曲线 1.5–4 W @20 K',
        performedBy: 'plant/gm-cryocooler',
        under: [{ param: 'temperature', min: 18, max: 25 }],
      },
      {
        note_zh: '⑤ 记录：冷量、温度、降温时间、氦充装 0.8–1.5 kg（一次性输入）、稳定度 0.2–0.5 K',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(7) },
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CRYO_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CRYO_MEASURE_ROUTES];
