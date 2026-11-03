/**
 * 绝对电压记录与测量路线（从 data/machine/voltage-anchor.ts 迁入，R13）。
 *
 * 把 10 V 基准「称」出来，再传到 0.5–10 V 五档；锚是长度/质量/时间。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DATA_ITEMS: readonly Item[] = [
  /**
   * **绝对电压记录：0.5–10 V，不确定度 50–90 ppm，锚 = 长度/质量/时间。**
   *
   * 它是 `measure/voltage-absolute` 的产出，不是一台仪表。记录里写：
   *
   *   ① 10 V 档的绝对修正值（相对标称 10.000 V 的 ppm 数）；
   *   ② 1 / 2 / 5 V 抽头相对 10 V 的比值（由基准内部分压串给，30 ppm）；
   *   ③ 0.5 V 档（10:1 再分一次，60 ppm）；
   *   ④ 不确定度分项（间隙、面积、质量、g、力、分压比）；
   *   ⑤ `anchor = length-mass-time` —— 明确写「不再以温度为绝对锚」。
   *
   * ⚠️ 记录的是**读数与修正值**，不是「设计值」。设计值 31 ppm 在文件头；
   * 记录的 50–90 ppm 是含装调、温漂、首批未知项的交付窗口。
   */
  {
    id: 'mat/voltage-absolute-record',
    name: '绝对电压记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 0.5, max: 10, unit: 'V' },
      { param: 'uncertainty', kind: 'range', min: 50, max: 100, unit: 'ppm', dir: 'atMost' },
      { param: 'anchor', kind: 'enum', values: ['length-mass-time'] },
    ],
  },
];

export const DATA_ROUTES: readonly Route[] = [
  {
    /**
     * **绝对电压测量：把 10 V 基准「称」出来，再传到 0.5–10 V 五档。**
     *
     * 这是本文件的终点。它不改已有基准的任何一条路线，只给
     * `plant/hv-test-bench/standard-voltage-reference` 的 10 V 档写一个
     * **绝对修正值**，并把 1/2/5/0.5 V 档的比值接上去。
     *
     * ── 八道工序 ──────────────────────────────────────────────────────
     *
     *   ① **测 g**：可逆摆正倒挂各 1000 周期，g = 4π²L/T² = 3.7100 m/s²，
     *      25 ppm。g 是本地值，不是书本的 3.71 —— 火星不同纬度/高程差 0.1 %，
     *      不测就把 1000 ppm 的 g 误差写成 500 ppm 的 V 误差。
     *   ② **标定微天平**：10 g 硅标准 → 砝码组四代二分 → 1 mg；
     *      再用 1 mg/10 mg 砝码标力常数。判据：3.75 mg 点上 ≤5 ppm。
     *   ③ **测极板几何**：内盘 φ200.000（0.3 µm）、环隙 0.100 mm（5 µm）、
     *      平面度 0.2 µm；A_eff = 0.031400 m²（几何 0.031416，修正 −0.05 %，其不确定度 10 ppm）。
     *   ④ **测间隙**：激光干涉仪 3 点，d = 1.000000 mm ±20 nm；
     *      折射率修正 2.5 nm。
     *   ⑤ **10 V 加力**：把基准的 10 V 档接电极，微天平回零，读补偿力
     *      m_eq = 3.75 mg；正反向各 3 次，取平均。
     *   ⑥ **算绝对电压并比对**：V_abs = d√(2m_eq g/(ε₀A_eff))；
     *      与基准 10 V 标称值比，差就是绝对修正值（设计 31 ppm）。
     *      这一步在 25.00 °C 下做：基准的证书点是 25.00 °C，不是 20 °C。
     *   ⑦ **传到 1/2/5/0.5 V**：基准内部分压串给 1/2/5 V（比值 30 ppm）；
     *      0.5 V 用 `std/divider-10to1-precision` 从 5 V 再分一次（30 ppm）。
     *      每档正反向各 3 次，记比值与修正值。
     *   ⑧ **写记录**：`mat/voltage-absolute-record` 一份，写 10 V 绝对修正、
     *      四档比值、不确定度分项、`anchor = length-mass-time`。
     *
     * ── 溯源怎么从温度锚转到长度/时间/质量锚 ─────────────────────────
     *
     *   旧链的绝对锚是冰点（0–0.02 °C），从温度借电压只有塞贝克系数
     *   （铜-铁 41 µV/K，书本值 ±0.2 %）—— 2000 ppm 就是这 ±0.2 %。
     *
     *   新链：V = d√(2mg/(ε₀A))。
     *     d、A ← 长度（量块基准 / 激光干涉 / 折射率）
     *     m    ← 硅球密度 × 体积（体积又由长度定）
     *     g    ← 摆长（长度）+ 周期（石英时基，时间）
     *     ε₀   ← 光速（定义值）
     *   **温度只用来修正热膨胀，不再是绝对锚；塞贝克系数退出这条链。**
     *   记录里的 `anchor = length-mass-time` 就是这件事的数据形式。
     *
     * ── 不确定度（设计值） ───────────────────────────────────────────
     *
     *   10 V 档 31 ppm；1–5 V 43 ppm；0.5 V 68 ppm。
     *   记录交付窗口 50–90 ppm（含装调与首批未知项），满足 50–100 ppm。
     *
     * ⚠️ 三个必须先满足的条件（写在记录里）：
     *   ① 0.5 V 档依赖 10:1 分压自校到 0.003 %（30 ppm）；若只到 0.01 %
     *      （100 ppm），0.5 V 档变 105 ppm，**超出 100 ppm**，记录要降级。
     *   ② 相对湿度 <40 %；保护环表面泄漏 1 pA 在 10 V 下是 10 TΩ。
     *   ③ 基准在 25.00 °C（mk-oven），电压天平在 19–21 °C；两边温差用
     *      1 µV 量级的热电势修正（10 V 上 0.1 ppm）。
     */
    id: 'measure/voltage-absolute',
    name: '绝对电压测量',
    rate: { hours: q(120) },
    produces: [
      {
        item: 'mat/voltage-absolute-record',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 0.5, max: 10 },
          { param: 'uncertainty', kind: 'range', min: 50, max: 90 },
          { param: 'anchor', kind: 'enum', oneOf: ['length-mass-time'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/hv-test-bench/standard-voltage-reference', qty: q(1) }] }],
    needs: [
      'plant/metrology-room',
      'plant/mk-oven',
      'std/mass-standard-10g-si',
      'std/mass-weight-set-mg',
      'std/divider-10to1-precision',
      'std/quartz-resonator-general',
      'std/counter-chip-general',
      'plant/stabilized-laser',
      'plant/refractometer',
      'plant/probe-station/null-detector',
      'std/dvm-general',
      'plant/gauge-block',
      'std/gauge-block-reference',
    ],
    steps: [
      {
        note_zh:
          '测 g：可逆摆正挂 1000 周期、倒挂 1000 周期，调到相等；L = 1.000000 m、T = 3.262 s，g = 4π²L/T² = 3.7100 m/s²，不确定度 25 ppm',
        performedBy: 'plant/gravity-pendulum',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '标定微天平：10 g 硅标准 → 10×1 g → 10×100 mg → 10×10 mg → 10×1 mg 四代二分；再用 1 mg/10 mg 标力常数，3.75 mg 点 ≤5 ppm',
        performedBy: 'plant/micro-balance',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '测极板几何：内盘 φ200.000（5 点）、环隙 0.100 mm（3 点）、平面度 0.2 µm；A_eff = 0.031400 m²（几何 0.031416，修正 −0.05 %，其不确定度 10 ppm）',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '测间隙：激光干涉仪 3 个孔位量 d = 1.000000 mm，20 nm 读数；refractometer 修正 (n−1)d = 2.5 nm，取 3 点平均',
        performedBy: 'plant/laser-stage',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '10 V 加力：基准 10 V 档接电极，微天平伺服回零，读补偿力 m_eq = 3.75 mg；正反向各 3 次，回零偏差 ≤0.3 µg',
        performedBy: 'plant/voltage-balance',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '算绝对电压并比对：V_abs = d√(2m_eq g/(ε₀A_eff))；与基准 10 V 标称比，差即绝对修正值（设计 31 ppm）；基准在 25.00 °C',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 24.99, max: 25.01 }],
      },
      {
        note_zh:
          '传到 1/2/5/0.5 V：基准内部分压串给 1/2/5 V（比值 30 ppm）；0.5 V 用 10:1 分压从 5 V 再分一次（30 ppm）；每档正反向各 3 次',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 24.99, max: 25.01 }],
      },
      {
        note_zh:
          '写记录：10 V 绝对修正、四档比值、不确定度分项（间隙/面积/质量/g/力/分压比）、anchor = length-mass-time、湿度与温度；0.5 V 档注明依赖分压自校',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '无 kg 投入（记录用的电、纸、清洗剂不登条目）→ 记录 1 份；产物按份计，不进 kg 守恒。设计值：10 V 31 ppm、1–5 V 43 ppm、0.5 V 68 ppm；交付窗口 50–90 ppm（含装调与首批未知项），满足任务要求的 50–100 ppm。剩余缺口：0.5 V 依赖分压比自校到 0.003 %；没有独立第二套绝对方法；量子标准差 3000 倍（见文件头 §七）',
  },
];
