/**
 * 油试验设备 —— 把变压器油的击穿、含水量、tanδ、酸值和铜相容性从“设计值”变成“可测”。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、为什么是这四件
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   oil-breakdown-tester   IEC 60156 球-球/球-板，0–80 kV、2–3 kV/s、2.5 mm
 *   karl-fischer-titrator  库仑法 10 µg–100 mg 水、10–50 µg 检出、±2–5 %
 *   tan-delta-bridge       40–200 °C、0.0001–0.1、100 V/50 Hz、10 pF–1 µF
 *   oil-aging-oven         80–100 °C、1000 h 铜片老化（90 °C）
 *
 * 前三件对应 `mat/transformer-oil` 的击穿/水/tanδ；第四件对应
 * `measure/oil-copper-compatibility` 的 1000 h / 90 °C 铜片试验。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、卡氏试剂：碘有、咪唑没有
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * grep 结果：
 *
 *   `mat/iodine` 有（卤水 → 碘，`make/iodine`）
 *   `mat/so2` 有
 *   `mat/methanol` 有
 *   `mat/imidazole` **0 条**；吡啶也 0 条
 *
 * 因此不建“咪唑合成”（那要乙二醛 + 甲醛 + 氨，乙二醛 0 条），改用
 * **一次性无吡啶卡氏试剂**：500 mL 预混碘/二氧化硫/咪唑/甲醇，约
 * 50–100 mL/100 次。毒性：甲醇（易燃、经皮）、SO₂（刺激性）、碘（腐蚀）、
 * 咪唑（刺激性）；不用吡啶（气味/肝毒性更大）。用量与废液按危废记。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、击穿电极与静置
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 球-球 φ12.5 mm 或球-板 φ36 mm；间距 2.5 mm；电极工作面 Ra ≤0.2 µm，
 * 倒角 R0.5–1 mm。油杯 0.3–0.5 L，注油后**静置 5–10 min 消泡**，否则
 * 气泡把击穿电压拉低 10–30 %。升压 2–3 kV/s；击穿后搅拌/静置 2 min 再打，
 * 取 5–6 次中位数；不确定度 3–5 %。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const OIL_TEST_ITEMS: readonly Item[] = [
  /**
   * 油击穿试验机（IEC 60156）。**0–80 kV、2–3 kV/s、φ12.5/36 mm、2.5 mm、0.3–0.5 L。**
   */
  {
    id: 'plant/oil-breakdown-tester',
    name: 'Oil Breakdown Tester', name_zh: '油击穿试验机',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'voltage', min: 0, max: 80 }],
    props: [
      { param: 'measure/voltage', kind: 'range', min: 0, max: 80, unit: 'kV' },
      { param: 'measure/breakdown', kind: 'range', min: 30, max: 60, unit: 'kV/2.5mm', dir: 'atLeast' },
      { param: 'rate', kind: 'range', min: 2, max: 3, unit: 'kV/s' },
      { param: 'electrode', kind: 'enum', values: ['ball-ball', 'ball-plane'] },
      { param: 'electrodeDiameter', kind: 'range', min: 12.5, max: 36, unit: 'mm' },
      { param: 'gap', kind: 'range', min: 2.5, max: 2.5, unit: 'mm' },
      { param: 'cupVolume', kind: 'range', min: 0.3, max: 0.5, unit: 'L' },
      { param: 'uncertainty', kind: 'range', min: 3, max: 5, unit: '%', dir: 'atMost' },
      { param: 'measure/roughness', kind: 'range', min: 0.05, max: 0.2, unit: 'µm', dir: 'atMost' },
      { param: 'settling', kind: 'range', min: 5, max: 10, unit: 'min' },
    ],
  },

  /**
   * 库仑法卡尔·费休水分滴定仪。**10 µg–100 mg 水、10–50 µg 检出、±2–5 %。**
   *
   * 同一台带 pH 电极可做酸值/硫醇碘量滴定（酸值 0.001–1 mgKOH/g、硫醇 0.1–10 ppm）。
   */
  {
    id: 'plant/karl-fischer-titrator',
    name: 'Coulometric Karl Fischer Moisture Titrator', name_zh: '库仑法卡尔·费休水分滴定仪',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'waterRange', kind: 'range', min: 1e-5, max: 0.1, unit: 'g' },
      { param: 'measure/water', kind: 'range', min: 10, max: 20, unit: 'ppm', dir: 'atMost' },
      { param: 'measure/detectionLimit', kind: 'range', min: 10, max: 50, unit: 'µg', dir: 'atMost' },
      { param: 'measure/accuracy', kind: 'range', min: 2, max: 5, unit: '%', dir: 'atMost' },
      { param: 'method', kind: 'enum', values: ['coulometric'] },
      { param: 'reagent', kind: 'enum', values: ['pyridine-free'] },
      { param: 'measure/acidValue', kind: 'range', min: 0.001, max: 1, unit: 'mgKOH/g', dir: 'atMost' },
      { param: 'measure/thiol', kind: 'range', min: 0.1, max: 10, unit: 'ppm', dir: 'atMost' },
    ],
  },

  /**
   * 介损/电容桥。**40–200 °C、tanδ 0.0001–0.1、100 V/50 Hz、10 pF–1 µF。**
   *
   * 精度 ±(1 % + 1e-4)：tanδ 绝对项 1e-4，比例项 1 %。
   */
  {
    id: 'plant/tan-delta-bridge',
    name: 'Dielectric Loss / Capacitance Bridge', name_zh: '介损/电容桥',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 40, max: 200 },
      { param: 'voltage', min: 100, max: 100 },
    ],
    props: [
      { param: 'temperature', kind: 'range', min: 40, max: 200, unit: '°C' },
      { param: 'measure/tanDelta', kind: 'range', min: 0.0001, max: 0.1, unit: '1' },
      { param: 'measure/voltage', kind: 'range', min: 100, max: 100, unit: 'V' },
      { param: 'measure/frequency', kind: 'range', min: 50, max: 50, unit: 'Hz' },
      { param: 'measure/capacitance', kind: 'range', min: 1e-11, max: 1e-6, unit: 'F' },
      { param: 'tanDeltaAccuracy', kind: 'range', min: 0.0001, max: 0.001, unit: '1', dir: 'atMost' },
      { param: 'capacitanceAccuracy', kind: 'range', min: 0.5, max: 1, unit: '%', dir: 'atMost' },
      { param: 'measure/tempCoefficient', kind: 'range', min: 2, max: 5, unit: 'ppm/K', dir: 'atMost' },
    ],
  },

  /**
   * 油老化烘箱。**80–100 °C、±0.5–2 K、5–20 L、1000–2000 h。**
   *
   * 铜片 1000 h / 90 °C；D130 目视无标准色卡，改用质量/粗糙度/铜含量三项定量。
   */
  {
    id: 'plant/oil-aging-oven',
    name: 'Oil Aging Oven', name_zh: '油老化烘箱',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'temperature', min: 80, max: 100 }],
    props: [
      { param: 'temperature', kind: 'range', min: 80, max: 100, unit: '°C' },
      { param: 'measure/stability', kind: 'range', min: 0.5, max: 2, unit: 'K', dir: 'atMost' },
      { param: 'volume', kind: 'range', min: 5, max: 20, unit: 'L' },
      { param: 'duration', kind: 'range', min: 1000, max: 2000, unit: 'h', dir: 'atLeast' },
      { param: 'measure/massChange', kind: 'range', min: 0.1, max: 0.3, unit: 'mg/cm²', dir: 'atMost' },
      { param: 'measure/roughnessChange', kind: 'range', min: 0.02, max: 0.05, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * 闭杯闪点仪（Pensky-Martens）。**0–300 °C、±2 °C、5–6 °C/min。**
   */
  {
    id: 'plant/flash-point-tester',
    name: 'Closed-Cup Flash Point Tester', name_zh: '闭杯闪点仪',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'temperature', min: 0, max: 300 }],
    props: [
      { param: 'temperature', kind: 'range', min: 0, max: 300, unit: '°C' },
      { param: 'measure/flashPoint', kind: 'range', min: 140, max: 160, unit: '°C', dir: 'atLeast' },
      { param: 'measure/accuracy', kind: 'range', min: 1, max: 2, unit: '°C', dir: 'atMost' },
      { param: 'method', kind: 'enum', values: ['Pensky-Martens-closed-cup'] },
      { param: 'cupVolume', kind: 'range', min: 50, max: 100, unit: 'mL' },
      { param: 'heatingRate', kind: 'range', min: 5, max: 6, unit: '°C/min' },
    ],
  },

  /**
   * 倾点仪。**−60…+50 °C、±1 °C、1–2 K/min。**
   */
  {
    id: 'plant/pour-point-tester',
    name: 'Pour Point Tester', name_zh: '倾点仪',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'temperature', min: -60, max: 50 }],
    props: [
      { param: 'temperature', kind: 'range', min: -60, max: 50, unit: '°C' },
      { param: 'measure/pourPoint', kind: 'range', min: -50, max: -40, unit: '°C', dir: 'atMost' },
      { param: 'measure/accuracy', kind: 'range', min: 0.5, max: 1, unit: '°C', dir: 'atMost' },
      { param: 'method', kind: 'enum', values: ['pour-point'] },
      { param: 'coolingRate', kind: 'range', min: 1, max: 2, unit: 'K/min' },
    ],
  },

  /**
   * 运动粘度恒温浴。**40 °C ±0.1 K、Ubbelohde 毛细管、9–12 cSt。**
   */
  {
    id: 'plant/kinematic-viscosity-bath',
    name: 'Kinematic Viscosity Constant-Temperature Bath', name_zh: '运动粘度恒温浴',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'temperature', min: 40, max: 40 }],
    props: [
      { param: 'temperature', kind: 'range', min: 40, max: 40, unit: '°C' },
      { param: 'measure/stability', kind: 'range', min: 0.05, max: 0.1, unit: 'K', dir: 'atMost' },
      { param: 'measure/viscosity40', kind: 'range', min: 9, max: 12, unit: 'cSt' },
      { param: 'capillary', kind: 'enum', values: ['Ubbelohde'] },
      { param: 'bathVolume', kind: 'range', min: 5, max: 20, unit: 'L' },
      { param: 'timingAccuracy', kind: 'range', min: 0.1, max: 0.5, unit: '%', dir: 'atMost' },
    ],
  },
];

export const OIL_TEST_ROUTES: readonly Route[] = [
  /**
   * 击穿试验机：HV 变压器 + 分压器 + 整流 + 电极/油杯 + DVM。
   *
   *   变压器 1 + 分压 1 + 整流 1 + 夹具 1 + DVM 1 + 控制板 1
   *   + 铜 0.5 + PTFE 0.2 + 玻璃 0.5 + 不锈钢 1 → 试验机 1
   */
  {
    id: 'make/oil-breakdown-tester',
    name: 'Oil Breakdown Tester Manufacturing', name_zh: '油击穿试验机制造',
    produces: [
      {
        item: 'plant/oil-breakdown-tester',
        qty: q(1),
        gives: [
          { param: 'measure/voltage', kind: 'range', min: 0, max: 80 },
          { param: 'measure/breakdown', kind: 'range', min: 30, max: 60 },
          { param: 'rate', kind: 'range', min: 2, max: 3 },
          { param: 'electrode', kind: 'enum', oneOf: ['ball-ball', 'ball-plane'] },
          { param: 'electrodeDiameter', kind: 'range', min: 12.5, max: 36 },
          { param: 'gap', kind: 'range', min: 2.5, max: 2.5 },
          { param: 'cupVolume', kind: 'range', min: 0.3, max: 0.5 },
          { param: 'uncertainty', kind: 'range', min: 3, max: 5 },
          { param: 'measure/roughness', kind: 'range', min: 0.05, max: 0.2 },
          { param: 'settling', kind: 'range', min: 5, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/hv-test-bench/transformer', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/divider', qty: q(1) }] },
      { anyOf: [{ item: 'std/hv-rectifier-general', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/fixture', qty: q(1) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      // SMT 主路保持通用板；OR 备路：手工焊（升压/计时/联锁，高压回路不经过板）
      {
        anyOf: [
          { item: 'std/control-board-general', qty: q(1) },
          { item: 'std/control-board-simple-manual-general', qty: q(1) },
        ],
      },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 车/抛球-球 φ12.5 或球-板 φ36 电极：工作面 Ra ≤0.2 µm、倒角 R0.5–1 mm；间距 2.5 mm', performedBy: 'lathe', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 装 0.3–0.5 L 油杯、搅拌与静置计时；注油后静置 5–10 min 消泡', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 装 HV 变压器/分压/整流/DVM：升压 2–3 kV/s，0–80 kV；分压比校准 3–5 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 用标准油样/纯油做重复性：5–6 次取中位数，不确定度 3–5 %；击穿后静置 2 min 再打', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(120) },
    unbalanced_zh:
      '变压器 1 + 分压 1 + 整流 1 + 夹具 1 + DVM 1 + 控制板 1 + 铜 0.5 + PTFE 0.2 + 玻璃 0.5 + 不锈钢 1 → 试验机 1；按件计。0–80 kV、2–3 kV/s、3–5 % 是设计值；电极抛光 Ra ≤0.2 µm',
  },

  /**
   * 卡氏滴定仪：铂电极 + 玻璃池 + 库仑控制 + DVM。
   *
   *   铂丝 0.001 + 玻璃 0.5 + PTFE 0.05 + 铜 0.05 + 运放 4 + 控制板 1 + DVM 1 → 滴定仪 1
   */
  {
    id: 'make/karl-fischer-titrator',
    name: 'Coulometric Karl Fischer Moisture Titrator Manufacturing', name_zh: '库仑法卡尔·费休水分滴定仪制造',
    produces: [
      {
        item: 'plant/karl-fischer-titrator',
        qty: q(1),
        gives: [
          { param: 'waterRange', kind: 'range', min: 1e-5, max: 0.1 },
          { param: 'measure/water', kind: 'range', min: 10, max: 20 },
          { param: 'measure/detectionLimit', kind: 'range', min: 10, max: 50 },
          { param: 'measure/accuracy', kind: 'range', min: 2, max: 5 },
          { param: 'method', kind: 'enum', oneOf: ['coulometric'] },
          { param: 'reagent', kind: 'enum', oneOf: ['pyridine-free'] },
          { param: 'measure/acidValue', kind: 'range', min: 0.001, max: 1 },
          { param: 'measure/thiol', kind: 'range', min: 0.1, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/platinum-wire', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 20) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      // C 组 OR：主路仍是通用板；终点 1–5 µA 在外部运放/DVM 前端，板只做恒流/显示（I/O 8–16）。
      // 简版漏电 1 nA / 1–5 µA = 0.02–0.1%；热电势 1–2 µV / (1 µA × 10 kΩ = 10 mV) = 0.01–0.02%
      // （跨阻 ≥1 kΩ 时 ≤0.2%），都 < 2–5% 终点容差 → 简版够用。
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }, { item: 'std/control-board-simple-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 封玻璃滴定池：阳极/阴极室隔膜、进样口、废液口；体积 50–100 mL', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 装双铂电极：φ0.5 mm 铂丝，间距 2–3 mm；电极面积 0.5–1 cm²', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 库仑控制：恒流 10–100 mA、终点判据 1–5 µA；DVM 读 0–2 V', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 标定：10–100 µg 水标准（甲醇/水），±2–5 %；同台 pH 电极做酸值/硫醇', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(100) },
    unbalanced_zh:
      '铂丝 0.001 + 玻璃 0.5 + PTFE 0.05 + 铜 0.05 + 运放 4 + 控制板 1 + DVM 1 → 滴定仪 1；按件计。10 µg–100 mg、10–50 µg、±2–5 % 是设计值；试剂用一次性无吡啶卡氏试剂（咪唑本地 0 条）',
  },

  /**
   * 介损桥：标准电容/电阻 + 运放 + 控制 + DVM + 油杯。
   *
   *   标准电容 1 + 标准电阻 1 + 运放 4 + 控制板 1 + DVM 1
   *   + 铜 0.5 + PTFE 0.2 + 钢板 1 + 玻璃 0.2 → 介损桥 1
   */
  {
    id: 'make/tan-delta-bridge',
    name: 'Dielectric Loss / Capacitance Bridge Manufacturing', name_zh: '介损/电容桥制造',
    produces: [
      {
        item: 'plant/tan-delta-bridge',
        qty: q(1),
        gives: [
          { param: 'temperature', kind: 'range', min: 40, max: 200 },
          { param: 'measure/tanDelta', kind: 'range', min: 0.0001, max: 0.1 },
          { param: 'measure/voltage', kind: 'range', min: 100, max: 100 },
          { param: 'measure/frequency', kind: 'range', min: 50, max: 50 },
          { param: 'measure/capacitance', kind: 'range', min: 1e-11, max: 1e-6 },
          { param: 'tanDeltaAccuracy', kind: 'range', min: 0.0001, max: 0.001 },
          { param: 'capacitanceAccuracy', kind: 'range', min: 0.5, max: 1 },
          { param: 'measure/tempCoefficient', kind: 'range', min: 2, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/hv-test-bench/standard-capacitor-local', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/standard-resistor-local', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 装 100 V/50 Hz 源、标准电容（100 pF）与标准电阻（10 kΩ）比例臂；R 四端对输入可扫 TC', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 装油杯：三端屏蔽、10 pF–1 µF；40–200 °C 加热，Pt100 读温', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 调零/校准：tanδ 0.0001–0.1、精度 ±(1 %+1e-4)；用标准电容/电阻复核', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(120) },
    unbalanced_zh:
      '标准电容 1 + 标准电阻 1 + 运放 4 + 控制板 1 + DVM 1 + 铜 0.5 + PTFE 0.2 + 钢板 1 + 玻璃 0.2 → 介损桥 1；按件计。40–200 °C、0.0001–0.1、100 V/50 Hz、±(1 %+1e-4) 是设计值',
  },

  /**
   * 油老化烘箱：电阻丝 + 钢板壳 + 矿棉 + T 型热电偶 + 接触器。
   *
   *   电阻丝 0.05 + 钢板 1 + 矿棉 1 + 热电偶 1 + 接触器 1 + 控制板 1 → 烘箱 1
   */
  {
    id: 'make/oil-aging-oven',
    name: 'Oil Aging Oven Manufacturing', name_zh: '油老化烘箱制造',
    produces: [
      {
        item: 'plant/oil-aging-oven',
        qty: q(1),
        gives: [
          // 90 °C / 1000 h 老化试验条件与输出，记录在 measure/oil-copper-compatibility；
          // 是试验能力/资格带，不是单次老化读数。
          { param: 'temperature', kind: 'range', min: 90, max: 90, record: 'mat/oil-copper-record' },
          { param: 'measure/stability', kind: 'range', min: 0.5, max: 2 },
          { param: 'volume', kind: 'range', min: 5, max: 20 },
          { param: 'duration', kind: 'range', min: 1000, max: 1000, record: 'mat/oil-copper-record' },
          { param: 'measure/massChange', kind: 'range', min: 0.1, max: 0.3, record: 'mat/oil-copper-record' },
          { param: 'measure/roughnessChange', kind: 'range', min: 0.02, max: 0.05, record: 'mat/oil-copper-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      // SMT 主路保持通用板；OR 备路：手工焊（90 °C 恒温 + 1000 h 计时，60 点内）
      {
        anyOf: [
          { item: 'std/control-board-general', qty: q(1) },
          { item: 'std/control-board-simple-manual-general', qty: q(1) },
        ],
      },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(24) },
    unbalanced_zh:
      '电阻丝 0.05 + 钢板 1 + 矿棉 1 + 热电偶 1 + 接触器 1 + 控制板 1 → 烘箱 1；按件计。90 °C、±0.5–2 K、1000 h 是设计值；D130 目视无标准色卡，改用质量/粗糙度/铜含量三项定量',
  },

  /**
   * 闪点仪：闭杯 Pensky-Martens，0–300 °C、±2 °C、5–6 °C/min。
   */
  {
    id: 'make/flash-point-tester',
    name: 'Closed-Cup Flash Point Tester Manufacturing', name_zh: '闭杯闪点仪制造',
    produces: [
      {
        item: 'plant/flash-point-tester',
        qty: q(1),
        gives: [
          { param: 'temperature', kind: 'range', min: 0, max: 300 },
          { param: 'measure/flashPoint', kind: 'range', min: 140, max: 160 },
          { param: 'measure/accuracy', kind: 'range', min: 1, max: 2 },
          { param: 'method', kind: 'enum', oneOf: ['Pensky-Martens-closed-cup'] },
          { param: 'cupVolume', kind: 'range', min: 50, max: 100 },
          { param: 'heatingRate', kind: 'range', min: 5, max: 6 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      // A 组 OR：主路仍是四层通用板；备路分立绕接板（体积 3–5×、手工绕接 8–12 h/块、只到 100 kHz）。
      // 闪点仪是 5–6 °C/min 升温/点火/计时，I/O ≤32、无高频/无精密 ADC，分立板够用。
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }, { item: 'std/control-board-discrete', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(40) },
    unbalanced_zh:
      '不锈钢杯 1 + 玻璃 0.2 + 电阻丝 0.05 + 热电偶 1 + 接触器 1 + 控制板 1 + 运放 2 → 闪点仪 1；按件计。0–300 °C、±2 °C、5–6 °C/min 是设计值；闭杯 Pensky-Martens',
  },

  /**
   * 倾点仪：−60…+50 °C、±1 °C、1–2 K/min。
   */
  {
    id: 'make/pour-point-tester',
    name: 'Pour Point Tester Manufacturing', name_zh: '倾点仪制造',
    produces: [
      {
        item: 'plant/pour-point-tester',
        qty: q(1),
        gives: [
          { param: 'temperature', kind: 'range', min: -60, max: 50 },
          { param: 'measure/pourPoint', kind: 'range', min: -50, max: -40 },
          { param: 'measure/accuracy', kind: 'range', min: 0.5, max: 1 },
          { param: 'method', kind: 'enum', oneOf: ['pour-point'] },
          { param: 'coolingRate', kind: 'range', min: 1, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 20) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      // A 组 OR：主路仍是四层通用板；备路分立绕接板（体积 3–5×、手工绕接 8–12 h/块、只到 100 kHz）。
      // 倾点仪是 1–2 K/min 降温/倾斜检测/计时，I/O ≤32、无高频/无精密 ADC，分立板够用。
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }, { item: 'std/control-board-discrete', qty: q(1) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(40) },
    unbalanced_zh:
      '不锈钢浴 1 + 玻璃 0.2 + PTFE 0.05 + 热电偶 1 + 接触器 1 + 控制板 1 + 矿棉 1 → 倾点仪 1；按件计。−60…+50 °C、±1 °C 是设计值；冷浴用干冰/乙醇或外部冷源',
  },

  /**
   * 运动粘度浴：40 °C ±0.1 K、Ubbelohde 毛细管、9–12 cSt。
   */
  {
    id: 'make/kinematic-viscosity-bath',
    name: 'Kinematic Viscosity Constant-Temperature Bath Manufacturing', name_zh: '运动粘度恒温浴制造',
    produces: [
      {
        item: 'plant/kinematic-viscosity-bath',
        qty: q(1),
        gives: [
          { param: 'temperature', kind: 'range', min: 40, max: 40 },
          { param: 'measure/stability', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'measure/viscosity40', kind: 'range', min: 9, max: 12 },
          { param: 'capillary', kind: 'enum', oneOf: ['Ubbelohde'] },
          { param: 'bathVolume', kind: 'range', min: 5, max: 20 },
          { param: 'timingAccuracy', kind: 'range', min: 0.1, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      // A 组 OR：主路仍是四层通用板；备路分立绕接板（体积 3–5×、手工绕接 8–12 h/块、只到 100 kHz）。
      // 粘度浴是 40 °C 恒温/计时/显示，I/O ≤32、无高频/无精密 ADC，分立板够用；恒温环取窗口低端。
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }, { item: 'std/control-board-discrete', qty: q(1) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(40) },
    unbalanced_zh:
      '玻璃毛细管 1 + 不锈钢浴 1 + PTFE 0.1 + 热电偶 1 + 接触器 1 + 控制板 1 + 矿棉 1 → 粘度浴 1；按件计。40 °C ±0.1 K、9–12 cSt 是设计值；Ubbelohde 毛细管常数用标准油标定',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...OIL_TEST_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...OIL_TEST_ROUTES];
