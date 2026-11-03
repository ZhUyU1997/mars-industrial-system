/**
 * 锰铜（Manganin）电阻温度系数（TCR）的实测记录。
 *
 * **为什么这条记录重要**：本层的电阻标准（`plant/lcr-resistance-arm` 的四端对桥臂、
 * 分流器、标准电阻）都靠锰铜的 5–10 ppm/K 低温度系数立住。没有这条读数，
 * “0.05–0.2 % 的电阻精度”就只是设计值；有了它，才知道 1 K 的温度波动到底吃掉多少。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、四端对为什么是必须的
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   100 Ω 的锰铜丝，引线电阻 10–50 mΩ、接触电阻 1–10 mΩ —— 二端法直接把这些
 *   串进去，温度一变引线也变，TCR 就淹在 10–50 ppm/K 的引线项里。
 *   四端对：电流端在外、电位端在内，电位端不取电流 ⇒ 引线项 <0.1 ppm。
 *
 *   热电势：铜-锰铜结点 1–3 µV/K，三点之间差 0.5–1.5 µV；100 Ω × 1 mA = 100 mV，
 *   1 µV 是 10 ppm ⇒ 必须**换向测两次相减**，否则热电势就是 10 ppm 的假 TCR。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、分辨率的账
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   6½ 表 100 mV 档分辨 1 µV（`std/dmm-6half-general` 的 resolution2V 档更粗，
 *   按 100 mV 量程算 0.1–1 µV）；100 Ω、1 mA ⇒ 1 µV = 10 µΩ = **0.1 ppm**。
 *   5–10 ppm/K × 10 K 全程 = 50–100 ppm = 500–1000 个分辨单元 ⇒ 0.5–1 ppm/K
 *   的拟合不确定度是够的（10 次平均再降 √10）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① 没有认证的锰铜 TCR 标样（本层 0 条目）：只能与手册值 5–10 ppm/K 比，
 *     不能声明“溯源性”。
 *  ② 油浴 20–30 °C 覆盖不到 0 °C 与 50 °C，二次项（α₂）测不出，只报一次项。
 *  ③ 100 Ω 的自热：1 mA × 100 Ω = 100 µW，温升 <0.01 K ⇒ 0.1 ppm，可忽略。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const MANGANIN_TCR_ITEMS: readonly Item[] = [
  /**
   * **锰铜 TCR 记录：三点法、四端对。**
   *
   *   tc           5–10 ppm/K（线性拟合的一次项）
   *   tcUncertainty 0.5–1 ppm/K
   *   tempPoints   3（20/25/30 °C）
   *   method       four-terminal（四端对 + 换向）
   */
  {
    id: 'mat/manganin-tcr-record',
    name: 'Manganin TCR Record', name_zh: '锰铜 TCR 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'tc', kind: 'range', min: 3, max: 15, unit: 'ppm/K' },
      // 生产 give 同名别名：材质 TCR（生产用 tempCoefficient，记录原用 tc）。
      { param: 'tempCoefficient', kind: 'range', min: 5, max: 10, unit: 'ppm/K' },
      { param: 'tcUncertainty', kind: 'range', min: 0, max: 2, unit: 'ppm/K', dir: 'atMost' },
      { param: 'tempPoints', kind: 'range', min: 3, max: 3, unit: '点' },
      { param: 'method', kind: 'enum', values: ['four-terminal'] },
    ],
  },
  /**
   * 130–140 °C 退火条件记录：只记试验温度，不冒充 TCR 读数。
   */
  {
    id: 'mat/manganin-tcr-high-temp-record',
    name: '130–140 °C Annealing Condition Record', name_zh: '130–140 °C 退火条件记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'temperature', kind: 'range', min: 130, max: 140, unit: '°C' }],
  },
  /**
   * 19–21 °C 测量环境记录：只记试验温度。
   */
  {
    id: 'mat/manganin-tcr-room-temp-record',
    name: '19–21 °C Measurement Environment Record', name_zh: '19–21 °C 测量环境记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'temperature', kind: 'range', min: 19, max: 21, unit: '°C' }],
  },
];

export const MANGANIN_TCR_ROUTES: readonly Route[] = [
  {
    /** 锰铜 TCR：四端对接线 → 20/25/30 °C 油浴三点 → 换向读 R → 线性拟合。 */
    id: 'measure/manganin-tcr',
    name: 'Manganin TCR Measurement', name_zh: '锰铜 TCR 测量',
    produces: [
      {
        item: 'mat/manganin-tcr-record',
        qty: q(1),
        gives: [
          { param: 'tc', kind: 'range', min: 5, max: 10 },
          { param: 'tempCoefficient', kind: 'range', min: 5, max: 10 },
          { param: 'tcUncertainty', kind: 'range', min: 0.5, max: 1 },
          { param: 'tempPoints', kind: 'range', min: 3, max: 3 },
          { param: 'method', kind: 'enum', oneOf: ['four-terminal'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/manganin', qty: q(1, 1000) }] }],
    needs: ['plant/lcr-resistance-arm', 'plant/ratio-bridge', 'std/dmm-6half-general', 'plant/metrology-room'],
    steps: [
      {
        note_zh: '① 四端对接线：电流端在外、电位端在内，引线绞合屏蔽；换向测两次相减，热电势压到 <0.3 µV（否则 1 µV 就是 10 ppm 的假 TCR）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '② 恒温三点：20/25/30 °C，油浴每点 30 min、波动 ±0.02 K（`plant/precision-oil-bath`）',
        performedBy: 'plant/precision-oil-bath',
      },
      {
        note_zh: '③ 读 R：100 Ω 量级、1 mA，6½ 表 100 mV 档（1 µV = 0.1 ppm）；每点正反向各 10 次取平均',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '④ 线性拟合 R(T)：TCR = (1/R₂₅)·dR/dT ⇒ 5–10 ppm/K；残差 >0.5 ppm/K 说明某点接触不良，重测',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '⑤ 判读与复测：与手册 5–10 ppm/K 比；U 0.5–1 ppm/K（10 次平均再除 √10）；写记录（三点 R、斜率、残差）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(8) },
    unbalanced_zh: '锰铜丝 1 g → 记录 1 份（样品不消耗，按件计）',
  },
  {
    /** 130–140 °C 退火条件：只产出温度记录，不产出 TCR 读数。 */
    id: 'measure/manganin-tcr-high-temp',
    name: '130–140 °C Annealing Condition Measurement', name_zh: '130–140 °C 退火条件测量',
    produces: [{
      item: 'mat/manganin-tcr-high-temp-record',
      qty: q(1),
      gives: [{ param: 'temperature', kind: 'range', min: 130, max: 140 }],
    }],
    uses: [],
    needs: ['plant/metrology-room'],
    steps: [{
      note_zh: '退火炉 130–140 °C 恒温，记录试验温度；TCR 读数仍由 measure/manganin-tcr 产出',
      performedBy: 'plant/pgm-wire-mill',
      under: [{ param: 'temperature', min: 130, max: 140 }],
    }],
    rate: { hours: q(1) },
  },
  {
    /** 19–21 °C 测量环境条件：只产出温度记录。 */
    id: 'measure/manganin-tcr-room-temp',
    name: '19–21 °C Measurement Environment Measurement', name_zh: '19–21 °C 测量环境测量',
    produces: [{
      item: 'mat/manganin-tcr-room-temp-record',
      qty: q(1),
      gives: [{ param: 'temperature', kind: 'range', min: 19, max: 21 }],
    }],
    uses: [],
    needs: ['plant/temperature-standard'],
    steps: [{
      note_zh: '计量间 19–21 °C 等温，记录试验环境温度；不是 TCR 读数',
      performedBy: 'plant/metrology-room',
      under: [{ param: 'temperature', min: 19, max: 21 }],
    }],
    rate: { hours: q(1) },
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...MANGANIN_TCR_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...MANGANIN_TCR_ROUTES];
