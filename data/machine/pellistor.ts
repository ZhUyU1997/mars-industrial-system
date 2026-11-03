/**
 * Pellistor（催化燃烧式）氢传感器 —— 把 `plant/h2-sensor` 从 4 % LEL 报警器
 * 升级成 10–100 ppm 的 ppm 检漏仪。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、器件与第二条路线
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * TCD 路线（`make/h2-sensor`）保留不动：0–100 vol%、LEL/高浓度、3–8 % CH₄ 交叉。
 * 本文件新增：
 *
 *   plant/pellistor              Pt 丝线圈 + γ-Al₂O₃ 珠 + Pd/Pt 催化剂 + 补偿珠 + 烧结罩
 *   plant/pellistor/oven         300–500 °C 珠温，1–5 W
 *   make/pellistor               绕线 → 浸渍 → 500–600 °C 分解/还原 → 装补偿珠/烧结罩
 *   make/pellistor-h2-sensor     同 id `plant/h2-sensor` 的第二条产出路线
 *   measure/pellistor-h2-sensor-calibration → mat/h2-sensor-record
 *
 * 料用另一位 agent 正在建的 `mat/platinum-wire` / `mat/platinum-foil` /
 * `mat/palladium-foil`；催化剂浸渍用硝酸钯/铂（`mat/nitric-acid` + 箔材），
 * 500–600 °C 分解、氢还原。γ-Al₂O₃ 用 `mat/alumina`；烧结罩复用
 * `plant/h2-sensor/flame-arrestor`（316L、20–40 µm）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、预算：4 vol% H₂ 在珠上升多少 K，桥路出多少 mV
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 珠：φ0.8 mm，几何面积 A = πd² = 2.01e-6 m²；有效催化面积按 30 % 取
 * 6.0e-7 m²。膜温取 400 °C（673 K）。
 *
 *   4 vol% H₂ 的分压：c = 0.04 × P/(RT) = 0.04 × 18.11 = **0.724 mol/m³**
 *   H₂ 在 673 K 空气中的 D ≈ 1.5e-4 m²/s；Sh = 2 ⇒ k = 2D/d = **0.375 m/s**
 *   摩尔通量 = k·c = **0.271 mol/(m²·s)**
 *   有效面积 6.0e-7 m² ⇒ 1.63e-7 mol/s
 *   放热 = 1.63e-7 × 242 000 = **0.0394 W（39 mW）**
 *
 * 散热：气体导热 G_cond = 0.05 × 4πr = 2.51e-4 W/K；辐射
 * 4εσAT³ = 1.11e-4 W/K；合计 G = **3.62e-4 W/K**。
 *
 *   ΔT(4 %) = 0.0394 / 3.62e-4 = **109 K**
 *   取设计窗口 **80–120 K / 30–45 mW**
 *
 * 线性外推（扩散控制、浓度 << LEL）：
 *
 *   10 ppm  = 4 % 的 1/4000 ⇒ ΔT = **0.020–0.030 K**
 *   100 ppm = 4 % 的 1/400  ⇒ ΔT = **0.20–0.30 K**
 *   两者都 > 0.01 K，可测；10 ppm 已接近 0.02 K 地板。
 *
 * 桥路：Pt 的 α = 0.00385 /K；4 % 时 ΔR/R = αΔT = 0.308–0.462；
 * V_ex = 2 V，ΔV ≈ V_ex·(ΔR/R)/4：
 *
 *   4 %    → **154–231 mV**
 *   100 ppm → **385–578 µV**
 *   10 ppm  → **38–58 µV**
 *
 * 桥路噪声 0.1–1 µV ⇒ 10 ppm 的 SNR = **38–580**；100 ppm = **385–5 780**。
 * 所以 10–100 ppm 的分辨在噪声上站得住；下限由零点漂移（<2 %/月）与
 * 催化剂中毒决定，不是桥路噪声。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、寿命与中毒（照实写）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Pd/Pt 催化剂 0.5–3 wt%，珠温 350–500 °C：
 *
 *   洁净气寿命        1000–2000 h（灵敏度掉 20–30 % 判换）
 *   1 ppm H₂S        500–1000 h；>5 ppm 不可逆，100–300 h 失效
 *   硅氧烷 0.1–1 ppm 500–1000 h（0.1 ppm）到 50–200 h（1 ppm）——
 *                    分解出的 SiO₂ 把催化剂包死，不可逆
 *   CO               可逆竞争，2–5 % 交叉；高 CO 下灵敏度暂时掉
 *
 * 所以 ppm 档要配前置过滤（活性炭/分子筛）与 3–6 个月标定；没有过滤时
 * 寿命按 500 h 下限记。Ex d 壳与烧结罩仍复用 TCD 那一套。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PELLISTOR_ITEMS: readonly Item[] = [
  /**
   * Pellistor 检测头。**Pt 丝 φ0.02–0.05 mm、10–20 圈、2–10 Ω；珠 φ0.5–1 mm；
   * Pd/Pt 0.5–3 wt%；两只珠（测量 + 补偿）；烧结罩 10–50 µm。**
   *
   *   工作温度 350–500 °C
   *   4 % H₂ 的 ΔT 80–120 K、功率 30–45 mW、桥路 150–230 mV
   *   寿命 1000–2000 h；H₂S 1–5 ppm、硅氧烷 0.1–1 ppm 中毒
   */
  {
    id: 'plant/pellistor',
    name: 'Pellistor Detection Head', name_zh: 'Pellistor 检测头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'wireDiameter', kind: 'range', min: 0.02, max: 0.05, unit: 'mm' },
      { param: 'turns', kind: 'range', min: 10, max: 20, unit: '圈' },
      { param: 'resistance', kind: 'range', min: 2, max: 10, unit: 'Ω' },
      { param: 'beadDiameter', kind: 'range', min: 0.5, max: 1, unit: 'mm' },
      { param: 'catalystLoading', kind: 'range', min: 0.5, max: 3, unit: 'wt%' },
      { param: 'beads', kind: 'range', min: 2, max: 2, unit: '只' },
      { param: 'temperature', kind: 'range', min: 300, max: 500, unit: '°C' },
      { param: 'poreSize', kind: 'range', min: 10, max: 50, unit: 'µm', dir: 'atMost' },
      { param: 'catalyst', kind: 'enum', values: ['Pd/Pt', 'Pd', 'Pt'] },
      { param: 'deltaT4pct', kind: 'range', min: 50, max: 150, unit: 'K' },
      { param: 'bridgeOutput4pct', kind: 'range', min: 100, max: 250, unit: 'mV' },
      { param: 'power4pct', kind: 'range', min: 20, max: 50, unit: 'mW' },
      { param: 'catalystLife', kind: 'range', min: 500, max: 2000, unit: 'h', dir: 'atLeast' },
      { param: 'h2sLimit', kind: 'range', min: 1, max: 5, unit: 'ppm', dir: 'atMost' },
      { param: 'siloxaneLimit', kind: 'range', min: 0.1, max: 1, unit: 'ppm', dir: 'atMost' },
    ],
  },

  /**
   * Pellistor 珠温炉。**350–500 °C、±1–5 °C、1–5 W。**
   *
   * 珠温漂 1 K 会让零点漂 0.1–0.3 % FS；用电阻丝绕氧化铝骨架 + T 型热电偶
   * + 接触器通断。它和 TCD 的 100–140 °C 加热块不是同一件。
   */
  {
    id: 'plant/pellistor/oven',
    name: 'Pellistor Bead Temperature Furnace', name_zh: 'Pellistor 珠温炉',
    unit: '件',
    category: 'part',
    props: [
      { param: 'temperature', kind: 'range', min: 300, max: 500, unit: '°C' },
      { param: 'stability', kind: 'range', min: 1, max: 5, unit: '°C', dir: 'atMost' },
      { param: 'power', kind: 'range', min: 1, max: 5, unit: 'W' },
    ],
  },
];

export const PELLISTOR_ROUTES: readonly Route[] = [
  /**
   * Pellistor 检测头：绕 Pt 丝 → 浸渍 γ-Al₂O₃ → 500–600 °C 分解/还原 →
   * 装补偿珠与烧结罩。
   *
   *   Pt 丝 0.01 + Pt 箔 0.001 + Pd 箔 0.001 + 氧化铝 0.05
   *   + 硝酸 0.01 + 氢 0.01 + 水 0.5 + 捕获器 1 + 不锈钢 0.05 → 检测头 1
   */
  {
    id: 'make/pellistor',
    name: 'Pellistor Detection Head Manufacturing', name_zh: 'Pellistor 检测头制造',
    produces: [
      {
        item: 'plant/pellistor',
        qty: q(1),
        gives: [
          { param: 'wireDiameter', kind: 'range', min: 0.03, max: 0.05 },
          { param: 'turns', kind: 'range', min: 10, max: 20 },
          { param: 'resistance', kind: 'range', min: 2, max: 8 },
          { param: 'beadDiameter', kind: 'range', min: 0.6, max: 1 },
          { param: 'catalystLoading', kind: 'range', min: 0.5, max: 3 },
          { param: 'beads', kind: 'range', min: 2, max: 2 },
          { param: 'temperature', kind: 'range', min: 350, max: 500 },
          { param: 'poreSize', kind: 'range', min: 20, max: 40 },
          { param: 'catalyst', kind: 'enum', oneOf: ['Pd/Pt'] },
          { param: 'deltaT4pct', kind: 'range', min: 80, max: 120 },
          { param: 'bridgeOutput4pct', kind: 'range', min: 150, max: 230 },
          { param: 'power4pct', kind: 'range', min: 30, max: 45 },
          { param: 'catalystLife', kind: 'range', min: 1000, max: 2000 },
          { param: 'h2sLimit', kind: 'range', min: 1, max: 5 },
          { param: 'siloxaneLimit', kind: 'range', min: 0.1, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/platinum-wire', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/platinum-foil', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/palladium-foil', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 2) }] },
      { anyOf: [{ item: 'plant/h2-sensor/flame-arrestor', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '绕 Pt 丝线圈：φ0.03–0.05 mm、10–20 圈、2–8 Ω，绕在 φ0.8 mm 芯棒上', performedBy: 'lathe' },
      { note_zh: '浸渍：γ-Al₂O₃ 珠（0.6–1 mm）吸 Pd/Pt 硝酸盐溶液，0.5–3 wt%，60–80 °C 干燥', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 60, max: 80 }] },
      { note_zh: '分解/还原：500–600 °C、H₂ 0.1–1 % 30 min，Pd/Pt 还原成金属', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 500, max: 600 }] },
      { note_zh: '装第二只补偿珠（同结构、不浸渍）与 316L 烧结罩；配对阻值差 ≤2 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(40) },
    unbalanced_zh:
      'Pt 丝 0.01 + Pt 箔 0.001 + Pd 箔 0.001 + 氧化铝 0.05 + 硝酸 0.01 + 氢 0.01 + 水 0.5 + 捕获器 1 + 不锈钢 0.05 → 检测头 1；余是绕线头、浸渍废液与烧结罩边角。4 % H₂ 的 ΔT 80–120 K、39 mW、桥路 150–230 mV 是计算值（见文件头），未实测',
  },

  /**
   * 珠温炉：电阻丝 + 氧化铝骨架 + T 型热电偶 + 接触器。
   *
   *   电阻丝 0.05 + 氧化铝 0.3 + 钢板 0.5 + 热电偶 1 + 接触器 1 → 炉 1
   */
  {
    id: 'make/pellistor-oven',
    name: 'Pellistor Bead Temperature Furnace Manufacturing', name_zh: 'Pellistor 珠温炉制造',
    produces: [
      {
        item: 'plant/pellistor/oven',
        qty: q(1),
        gives: [
          { param: 'temperature', kind: 'range', min: 350, max: 500 },
          { param: 'stability', kind: 'range', min: 1, max: 5 },
          { param: 'power', kind: 'range', min: 1, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 2) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(12) },
    unbalanced_zh: '电阻丝 0.05 + 氧化铝 0.3 + 钢板 0.5 + 热电偶 1 + 接触器 1 → 珠温炉 1；余是绕线/保温边角',
  },

  /**
   * **pellistor 版 `plant/h2-sensor`：第二条产出路线，不改 TCD 路线。**
   *
   *   检测头 1 + 珠温炉 1 + 防爆壳 1 + 桥路 1 + 控制板 1 + DVM 1
   *   + 接触器 1 + 钢板 2 + 铜线 0.5 → 传感器 1 台
   *
   * 交：range 0–4 vol%、resolution **0.001–0.01 vol%**、
   * detectionLimit **10–100 ppm**、bridgeOutput 0.15–0.23 V、
   * CH₄ 5–15 %、CO 2–5 %、响应 3–8 s、Ex d IIC T1。
   */
  {
    id: 'make/pellistor-h2-sensor',
    name: 'Hydrogen Sensor (Pellistor Version) Manufacturing', name_zh: '氢气传感器（pellistor 版）制造',
    produces: [
      {
        item: 'plant/h2-sensor',
        qty: q(1),
        gives: [
          { param: 'measure/range', kind: 'range', min: 0, max: 4 },
          { param: 'measure/lelRange', kind: 'range', min: 0, max: 5 },
          { param: 'measure/lelAlarm', kind: 'range', min: 4, max: 4 },
          { param: 'measure/response', kind: 'range', min: 3, max: 8 },
          { param: 'measure/accuracy', kind: 'range', min: 2, max: 5 },
          { param: 'measure/crossCH4', kind: 'range', min: 5, max: 15 },
          { param: 'measure/crossCO', kind: 'range', min: 2, max: 5 },
          { param: 'measure/zeroDrift', kind: 'range', min: 0.5, max: 1.5 },
          { param: 'temperature', kind: 'range', min: 5, max: 40 },
          { param: 'protection', kind: 'enum', oneOf: ['Ex d IIC T1'] },
          { param: 'measure/resolution', kind: 'range', min: 0.001, max: 0.01 },
          { param: 'measure/detectionLimit', kind: 'range', min: 10, max: 100 },
          { param: 'measure/bridgeOutput', kind: 'range', min: 0.15, max: 0.23 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/pellistor', qty: q(1) }] },
      { anyOf: [{ item: 'plant/pellistor/oven', qty: q(1) }] },
      { anyOf: [{ item: 'plant/h2-sensor/flameproof-housing', qty: q(1) }] },
      { anyOf: [{ item: 'plant/h2-sensor/bridge', qty: q(2) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room', 'plant/mfc'],
    steps: [
      { note_zh: '装检测头与珠温炉：珠温 350–500 °C，两只珠（测量/补偿）配对阻值 ≤2 %，珠面离烧结罩 1–2 mm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装防爆壳/烧结罩：间隙 0.10–0.15 mm、8 颗 M8 25 N·m；1.5 MPa 水压', performedBy: 'plant/sheet-shop' },
      { note_zh: '装双桥路：测量珠/补偿珠各一臂，V_ex 2 V；LEL 比较器 4 vol%，ppm 档增益 100–1000', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '标定：0/10/50/100 ppm + 0.4/1/2/4 vol% H₂；4 % 阶跃 T90 <10 s；CH₄/CO 交叉各一点', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(40) },
    unbalanced_zh:
      '检测头 1 + 珠温炉 1 + 防爆壳 1 + 桥路 2 + 控制板 1 + DVM 1 + 接触器 1 + 钢板 2 + 铜线 0.5 → 传感器 1 台；余是钣金/线头。10–100 ppm、0.001–0.01 vol%、CH₄ 5–15 %、CO 2–5 % 是设计值；4 % H₂ 的 ΔT 80–120 K、桥路 150–230 mV 是计算值',
  },

];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PELLISTOR_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PELLISTOR_ROUTES];
