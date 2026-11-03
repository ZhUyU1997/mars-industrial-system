/**
 * 控制板 C 组的实测背书：板级漏电与热电势。
 *
 * C 组（`std/control-board-simple-general`）的“够用”原先是算术余量：
 * 板漏电 1 nA / 1–5 µA = 0.02–0.1%，热电势 1–2 µV / 10 mV = 0.01–0.02%。
 * 本文件把这两个数变成**记录条目**（窗口 + u），而不是把设计窗口写成实测。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、仪器：模型里有什么、没有什么
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `plant/electrometer`             **0 条** —— 不存在。
 *   `plant/dmm-7half`                **不是条目**；实际是 `std/dmm-7half-general`
 *                                    （7½ 位），只有 1e-7–1000 V 的电压档，
 *                                    没有 1 pA–10 nA 的电流档。
 *   `plant/picoammeter`              **存在**：1e-13–1e-3 A、分辨 1 fA、
 *                                    ±0.1–2%。漏电用它测；1 nA 档的分辨与准确度
 *                                    都够 0.1–0.3 nA 的 uLeakage。
 *   `std/dmm-7half-general`          7½ 位、0.1–1 µV 分辨 —— 热电势用它读。
 *   `plant/probe-station/shield-box` 0–140 dB 屏蔽箱（借用探针台的，只取屏蔽）。
 *   `plant/pd-test-cell`             18–22 °C / RH 0–60 的屏蔽舱；本层没有
 *                                    23 °C 恒温恒湿间，22 °C 是 23±1 K 窗口的
 *                                    下边缘，RH 40–60 由舱保持。
 *   `plant/precision-oil-bath`       20–30 °C，热电势的 ΔT 一端（25–30 °C）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、方法
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   漏电：在 2 层板边做 1 mm 间距、10 条指的梳形图形；异丙醇清洗、干氮吹干；
 *         picoammeter 极化 60 s 后取 10 次平均。**漏电随湿度指数上升**：
 *         RH 60%→80% 可能 ×10，所以本记录只对 RH 40–60% 有效。
 *
 *   热电势：Cu-焊料-Cu（SAC305）与 Cu-铜箔-Cu 两种结点；一端进油浴 25–30 °C、
 *           另一端在 19–21 °C 计量间，ΔT 5–10 K；7½ 表正反两次换向取平均，
 *           引线热电势与放大器偏置在换向中抵消。Cu-SAC305 ≈ 1–3 µV/K；
 *           Cu-63Sn37Pb ≈ 3 µV/K（本层只有 SAC305，SnPb 仅作对照）。
 *           `thermalEmf ≤2 µV` 是**换向后的残余**，不是结点电动势
 *           （seebeck × ΔT = 5–30 µV）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、这些是窗口，不是读数
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 两条记录给的是**验收窗口 + 方法不确定度**；本层没有执行这批测量，所以
 * 不写“实测到 0.4 nA”这类数。u 是仪器/方法给的，不是拟合残差。
 *
 * `std/dmm-7half-general` 是**仪器（category=machine）**：7½ 位表自己通电、
 * 自己读数，不进任何 `composedOf`。measure 检查把它当能力候选，`thermalEmf`
 * （0.1–3 µV）与 `voltage`（1e-7–1000 V）两个窗口由 `make/dmm-7half` 交。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const BOARD_LEAKAGE_ITEMS: readonly Item[] = [
  /**
   * 板级漏电/残余热电势记录。
   *
   *   leakage       ≤1 nA       （下限 0.1 nA = picoammeter 1 nA 档/uLeakage 下限）
   *   uLeakage      0.1–0.3 nA  （picoammeter 1 nA 档 + 10 次平均）
   *   thermalEmf    ≤2 µV       （板级残余，换向平均；下限 0.1 µV）
   *   uThermalEmf   0.5–1 µV    （7½ 表 0.1–1 µV 分辨 + 换向）
   *   temperature   22–24 °C    （23±1 K 窗口；实际取舱上限 22 °C）
   */
  {
    id: 'mat/board-leakage-record',
    name: 'Board-Level Leakage/Residual Thermal EMF Record', name_zh: '板级漏电/残余热电势记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'leakage', kind: 'range', min: 0.1, max: 1, unit: 'nA', dir: 'atMost' },
      { param: 'uLeakage', kind: 'range', min: 0.1, max: 0.3, unit: 'nA', dir: 'atMost' },
      { param: 'thermalEmf', kind: 'range', min: 0.1, max: 2, unit: 'µV', dir: 'atMost' },
      { param: 'uThermalEmf', kind: 'range', min: 0.5, max: 1, unit: 'µV', dir: 'atMost' },
      { param: 'temperature', kind: 'range', min: 22, max: 24, unit: '°C' },
    ],
  },

  /**
   * 结点热电势记录（板级残余的分解）。
   *
   *   thermalEmf    ≤2 µV       （换向后的残余）
   *   uThermalEmf   0.5–1 µV
   *   junction      Cu-SAC305-Cu / Cu-foil-Cu
   *   method        reversal
   */
  {
    id: 'mat/board-thermal-emf-record',
    name: 'Junction Thermoelectric Potential Record', name_zh: '结点热电势记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'thermalEmf', kind: 'range', min: 0.1, max: 2, unit: 'µV', dir: 'atMost' },
      { param: 'uThermalEmf', kind: 'range', min: 0.5, max: 1, unit: 'µV', dir: 'atMost' },
      { param: 'junction', kind: 'enum', values: ['Cu-SAC305-Cu', 'Cu-foil-Cu'] },
      { param: 'method', kind: 'enum', values: ['reversal'] },
    ],
  },
];

export const BOARD_LEAKAGE_ROUTES: readonly Route[] = [
  /**
   * 板级漏电：梳形图形 → picoammeter 1 nA 档 → 换向热电势。
   *
   *   2 层板 1 + 异丙醇 0.1 → 记录 1 份
   *
   * 屏蔽箱在 needs；22 °C / RH 40–60% 由 pd-test-cell 保持（23±1 K 的下边缘）。
   */
  {
    id: 'measure/board-leakage',
    name: 'Board-Level Leakage/Residual Thermal EMF Measurement', name_zh: '板级漏电/残余热电势测量',
    produces: [
      {
        item: 'mat/board-leakage-record',
        qty: q(1),
        gives: [
          { param: 'leakage', kind: 'range', min: 0.1, max: 1 },
          { param: 'uLeakage', kind: 'range', min: 0.1, max: 0.3 },
          { param: 'thermalEmf', kind: 'range', min: 0.1, max: 2 },
          { param: 'uThermalEmf', kind: 'range', min: 0.5, max: 1 },
          { param: 'temperature', kind: 'range', min: 22, max: 24 },
        ],
      },
    ],
    uses: [
      // 待测板本身：C 组二层简版；梳形图形是同一块板上的测试图形，不是新元件
      { anyOf: [{ item: 'std/control-board-simple-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/isopropanol', qty: q(1, 10) }] },
    ],
    needs: [
      'plant/probe-station/shield-box',
      'plant/pd-test-cell',
      'std/dmm-7half-general',
      'plant/temperature-standard',
    ],
    steps: [
      { note_zh: '① 梳形图形：待测 2 层板边做 1 mm 间距、10 条指的叉指图形；异丙醇清洗、干氮吹干', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 22, max: 22 }, { param: 'humidity', min: 40, max: 60 }] },
      { note_zh: '② 漏电：plant/picoammeter 1e-13–1e-3 A、分辨 1 fA、±0.1–2%；1 nA 档、屏蔽箱内、极化 60 s 后 10 次平均。漏电随湿度指数上升，RH 60→80% 可能 ×10', performedBy: 'plant/picoammeter', under: [{ param: 'temperature', min: 22, max: 22 }, { param: 'humidity', min: 40, max: 60 }] },
      { note_zh: '③ 残余热电势：板级两端接 std/dmm-7half-general（0.1–1 µV 分辨），正反两次换向取平均，抵消引线热电势与放大器偏置', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 22, max: 22 }, { param: 'humidity', min: 40, max: 60 }] },
    ],
    rate: { hours: q(4) },
    unbalanced_zh:
      '2 层板 1 + 异丙醇 0.1 → 记录 1 份；按份计。漏电 ≤1 nA（uLeakage 0.1–0.3 nA）、残余热电势 ≤2 µV（uThermalEmf 0.5–1 µV）是验收窗口 + u，不是实测读数；23 °C ±1 K 目标，实际 pd-test-cell 上限 22 °C（窗口下边缘），RH 40–60 由舱保持；漏电随湿度指数上升（RH 60→80% 可能 ×10），本记录只对 40–60% 有效',
  },

  /**
   * 结点热电势：Cu-SAC305-Cu 与 Cu-铜箔-Cu，换向法，ΔT 5–10 K。
   *
   *   铜 0.01 + 铜箔 0.01 + SAC305 0.001 + 异丙醇 0.01 → 记录 1 份
   *
   * ΔT 一端是油浴 25–30 °C，另一端是 19–21 °C 计量间；7½ 表正反两次。
   *
   * `std/dmm-7half-general` 的 `thermalEmf`（0.1–3 µV）与 `voltage`
   * （1e-7–1000 V）由 `make/dmm-7half` 交；它是 machine，measure 检查直接认。
   */
  {
    id: 'measure/board-thermal-emf',
    name: 'Junction Thermoelectric Potential Measurement', name_zh: '结点热电势测量',
    produces: [
      {
        item: 'mat/board-thermal-emf-record',
        qty: q(1),
        gives: [
          { param: 'thermalEmf', kind: 'range', min: 0.1, max: 2 },
          { param: 'uThermalEmf', kind: 'range', min: 0.5, max: 1 },
          { param: 'junction', kind: 'enum', oneOf: ['Cu-SAC305-Cu', 'Cu-foil-Cu'] },
          { param: 'method', kind: 'enum', oneOf: ['reversal'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/copper-foil', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/solder-sac305', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/isopropanol', qty: q(1, 100) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/precision-oil-bath',
      'plant/probe-station/shield-box',
      'std/dmm-7half-general',
    ],
    steps: [
      { note_zh: '① 结点：Cu-焊料-Cu（SAC305 0.1 g）与 Cu-铜箔-Cu 两种；铜丝/铜箔异丙醇清洗，焊点 0.5–1 mm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 温差：一端进 plant/precision-oil-bath 25–30 °C，另一端在 19–21 °C 计量间；ΔT 5–10 K（两支 Pt RTD 读）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 换向：std/dmm-7half-general 0.1–1 µV 分辨，正反两次读数取平均；引线热电势与放大器偏置在换向中抵消', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 系数：Cu-SAC305 ≈ 1–3 µV/K；Cu-63Sn37Pb ≈ 3 µV/K（本层只有 SAC305，SnPb 仅作对照）。残余 ≤2 µV 是换向后板级热电势，不是结点电动势（seebeck × ΔT = 5–30 µV）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(8) },
    unbalanced_zh:
      '铜 0.01 + 铜箔 0.01 + SAC305 0.001 + 异丙醇 0.01 → 记录 1 份；按份计。残余热电势 ≤2 µV（uThermalEmf 0.5–1 µV）是验收窗口 + u，不是实测读数；ΔT 5–10 K、Cu-SAC305 1–3 µV/K、Cu-63Sn37Pb ≈3 µV/K 是方法/文献值，不是本层实测',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...BOARD_LEAKAGE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...BOARD_LEAKAGE_ROUTES];
