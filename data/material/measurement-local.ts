/**
 * 本地量块 —— 标准电容、标准电阻、pC 校准器，给测量种子补“可造第二套”的路径。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三件里哪件能本地造、哪件不能
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   C：平行板 + guard，C = ε₀A/d 由几何定，比较仪 + 量块量 A 与 d
 *      ⇒ 能造，0.1–0.5%；100 pF 标准电容 A/B 走这条（本文件第二条路线）。
 *   R：电阻丝绕氧化铝骨架，恒温，可做到 0.1% —— 单只备件。
 *   V：**已有本地路线** —— `data/machine/voltage-reference.ts` 补了三件：
 *      补偿齐纳 `std/zener-reference-precision`（≤5 ppm/K）、
 *      mK 恒温箱 `plant/mk-oven`（±10 mK）、10:1/100:1 精密分压 +
 *      指零传递（`make/standard-voltage-reference-pair`）。传递 0.005–0.02 %，
 *      绝对项仍 0.2 %（无绝对伏特，缺口数字在那份文件头 §五）。
 *      同批 A/B 仍不是“独立第二套”：复制进口 A 只能得到同源件。
 *   pC：校准器是 Q = C·V —— C 用本地 100 pF 标准、V 用 1–10 V 标准，
 *      阶跃沿由晶闸管给 0.5–2 µs、按 0.5–1 µs 分选 ⇒ 能造，2–3%（本文件第三条路线）。
 *
 * ⚠️ 本地 C/R/校准器只解决“可造第二套”，不解决“绝对溯源”：
 *    C 的值由几何定（这是真绝对）；R 与校准器仍要拿种子或标准电阻比对。
 *    校准器的绝对电荷追溯仍到进口基准 —— 本地的 1–10 V 链只到 0.2 %（绝对项），
 *    见 voltage-reference.ts 文件头 §五；它的路线把该基准写在 needs 里。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const MEASUREMENT_LOCAL_ITEMS: readonly Item[] = [
  /**
   * 本地 100 pF 标准电容。φ80 平行板 + guard，PTFE 垫，1 kV。
   */
  {
    id: 'plant/hv-test-bench/standard-capacitor-local',
    name: 'Local 100 pF Standard Capacitor', name_zh: '本地 100 pF 标准电容',
    unit: '件',
    category: 'part',
    props: [
      { param: 'capacitance', kind: 'range', min: 95, max: 105, unit: 'pF' },
      { param: 'tolerance', kind: 'range', min: 0.1, max: 0.5, unit: '%', dir: 'atMost' },
      { param: 'voltage', kind: 'range', min: 0, max: 1000, unit: 'V', dir: 'atLeast' },
    ],
  },

  /**
   * 本地 10 kΩ / 1 MΩ 标准电阻。电阻丝绕氧化铝，恒温 20 °C。
   */
  {
    id: 'plant/hv-test-bench/standard-resistor-local',
    name: 'Local 10 kΩ / 1 MΩ Standard Resistor', name_zh: '本地 10 kΩ / 1 MΩ 标准电阻',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resistance', kind: 'range', min: 1000, max: 1000000, unit: 'Ω' },
      { param: 'tolerance', kind: 'range', min: 0.05, max: 0.5, unit: '%', dir: 'atMost' },
      { param: 'tempco', kind: 'range', min: 1, max: 20, unit: 'ppm/K', dir: 'atMost' },
    ],
  },
];

export const MEASUREMENT_LOCAL_ROUTES: readonly Route[] = [
  {
    /**
     * **本地标准电容：两块 φ80 铝板 + guard + PTFE 垫。**
     *
     *   铝 2 + PTFE 0.2 + 铜 0.1 → 标准电容 1
     */
    id: 'make/standard-capacitor-local',
    name: 'Local 100 pF Standard Capacitor Manufacturing', name_zh: '本地 100 pF 标准电容制造',
    produces: [
      {
        item: 'plant/hv-test-bench/standard-capacitor-local',
        qty: q(1),
        gives: [
          { param: 'capacitance', kind: 'range', min: 98, max: 102 },
          { param: 'tolerance', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'voltage', kind: 'range', min: 1000, max: 1000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(8) },
    unbalanced_zh:
      '铝 2 + PTFE 0.2 + 铜 0.1 → 标准电容 1；余是板边/垫圈/引线废料。按几何 C=ε₀A/d 算 100 pF，±0.1–0.5% 靠机械公差',
  },
  {
    /**
     * **本地标准电阻：电阻丝绕氧化铝骨架 + 恒温。**
     *
     *   电阻丝 0.05 + 氧化铝 0.2 + 铜 0.05 → 标准电阻 1
     */
    id: 'make/standard-resistor-local',
    name: 'Local 10 kΩ / 1 MΩ Standard Resistor Manufacturing', name_zh: '本地 10 kΩ / 1 MΩ 标准电阻制造',
    produces: [
      {
        item: 'plant/hv-test-bench/standard-resistor-local',
        qty: q(1),
        gives: [
          { param: 'resistance', kind: 'range', min: 10000, max: 10000 },
          { param: 'tolerance', kind: 'range', min: 0.05, max: 0.5 },
          { param: 'tempco', kind: 'range', min: 1, max: 20 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 20) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(8) },
    unbalanced_zh:
      '电阻丝 0.05 + 氧化铝 0.2 + 铜 0.05 → 标准电阻 1；余是绕线/骨架/引线废料。10 kΩ、±0.05–0.5%、1–20 ppm/K；值要用 A/B 标准电阻或电桥比对',
  },
  {
    /**
     * **100 pF 标准电容 A/B：一对同批的 φ80 平行板 + guard。**
     *
     * 为什么一条路线产两个 id：A/B 必须**同批、同几何、同一次几何测量** ——
     * 分成两条路线就是两批，批间差会被互比读成漂移。B 不是 A 的复制路线，
     * 是同一批里的第二只；两只的证书值各自用几何算，不互相引用。
     *
     * 与 `make/standard-capacitor-local` 的分工：那条是车间单只备件（不进证书）；
     * 本路线是标准对（两只、几何值进各自的证书）。同一几何，验收不同。
     *
     * 质量账：铝 4 + PTFE 0.4 + 铜 0.2 = 4.6 kg → A/B 各 1 只；
     * 下料余量按 local 线同口径 2 kg 铝/只，净件约 0.7 kg（φ80×10 极板对
     * + guard + 垫圈的设计值），余 3.9 kg 是铝屑 3.4、PTFE 边角 0.35、
     * 铜引线头 0.15（铝/铜回炉，PTFE 报废）。
     *
     * 交货窗口：98–102 pF、0.1–0.5%、1 kV。C = ε₀A/d 由几何定；
     * 0.1–0.5% 靠比较仪 + 量块量 A 与 d（设计值，不是实测）。
     * 低损耗靠空气/PTFE 介质与 guard；铝极板氧化会让 tanδ 变差，
     * 本层没有 tanδ 测量 —— 缺口，不写数。
     */
    id: 'make/standard-capacitor-100pf-pair',
    name: '100 pF Standard Capacitor Pair Assembly', name_zh: '100 pF 标准电容对装配',
    produces: [
      {
        item: 'plant/hv-test-bench/standard-capacitor-100pf',
        qty: q(1),
        gives: [
          { param: 'capacitance', kind: 'range', min: 98, max: 102 },
          { param: 'tolerance', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'voltage', kind: 'range', min: 1000, max: 1000 },
        ],
      },
      {
        item: 'plant/hv-test-bench/standard-capacitor-100pf-b',
        qty: q(1),
        gives: [
          { param: 'capacitance', kind: 'range', min: 98, max: 102 },
          { param: 'tolerance', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'voltage', kind: 'range', min: 1000, max: 1000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(4) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(2, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
    ],
    needs: ['plant/comparator', 'plant/gauge-block', 'plant/metrology-room'],
    steps: [
      {
        note_zh: '车两只 φ80 极板、guard 环与 PTFE 垫圈（A/B 同批同刀，间隙按 C = ε₀A/d 留研磨量）',
        performedBy: 'lathe',
      },
      {
        note_zh: '研磨极板工作面到平面度 0.2 µm（研磨平板 + 刚玉膏）',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '装架：两极板 + guard + PTFE 垫，三点支撑保证平行度；A/B 各装一只',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '量 A 与 d：比较仪 + 量块，各量 3–5 点（A 的 0.05%、d 的 0.1% 合成 0.11%，加平行度按 0.1–0.5% 交）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '算 C = ε₀A/d，A/B 各写一份几何证书；两只不互相引用，也不共用一份读数',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      '铝 4 + PTFE 0.4 + 铜 0.2 = 4.6 kg → 标准电容 A/B 各 1 只（净件约 0.7 kg，φ80×10 极板对 + guard 的设计值）；余 3.9 kg 是铝板下料/车削屑 3.4、PTFE 垫圈边角 0.35、铜引线头 0.15（铝/铜回炉，PTFE 报废）。C 按几何 ε₀A/d 算，0.1–0.5% 靠比较仪 + 量块量 A 与 d；低损耗靠空气/PTFE 与 guard，铝极板氧化会让 tanδ 变差，本层没有 tanδ 测量（缺口）',
  },
  {
    /**
     * **1–100 pC 校准器参考 A/B：100 pF 电荷电容 + 晶闸管阶跃 + 0–1 V 基准。**
     *
     * 为什么能造：Q = C·V。C 用本地 100 pF 标准（几何 0.1–0.5%），
     * V 用 1–10 V 标准（0.01–0.1%）；两项合成 √(0.5²+0.1²) ≈ 0.51%，
     * 留杂散电容与分压误差后按 2–3% 交（条目窗口 1–3%）。
     * 阶跃沿由 `std/hv-thyristor-general` 给 0.5–2 µs，按 0.5–1 µs 分选。
     *
     * 为什么一条路线产两个 id：本地只有这一条电荷校准链，A/B 是同批两台、
     * 同一次 C·V 标定；分成两条路线会假装有两套独立标准。同批同链的
     * 共同偏差查不出 —— 与 `pd-intercompare.ts` 的“独立种子”口径不同，
     * 这是本地复制的固有限制，不写成“独立第二套”。
     *
     * 质量账：电容 2 + 晶闸管 2 + 基准 2 + 电阻丝 0.02 + 铝 0.4 + 铜 0.1
     * → 校准器 2 台；余是屏蔽盒/接头/触发板废料。电荷 = C×V；
     * 10/50/100 pC 三点各读数 3 次，A/B 各写一份校准记录。
     *
     * ⚠️ 绝对溯源仍到进口 1–10 V 基准（R9 仍豁免）；本路线只把
     * “本地可造”补上，不把溯源闭环补上。
     */
    id: 'make/pd-calibrator-reference',
    name: 'pC Calibrator Reference Pair Assembly', name_zh: 'pC 校准器基准对装配',
    produces: [
      {
        item: 'plant/hv-test-bench/pd-calibrator-reference',
        qty: q(1),
        gives: [
          { param: 'charge', kind: 'range', min: 1, max: 100 },
          { param: 'riseTime', kind: 'range', min: 0.5, max: 1 },
          { param: 'accuracy', kind: 'range', min: 2, max: 3 },
        ],
      },
      {
        item: 'plant/hv-test-bench/pd-calibrator-reference-b',
        qty: q(1),
        gives: [
          { param: 'charge', kind: 'range', min: 1, max: 100 },
          { param: 'riseTime', kind: 'range', min: 0.5, max: 1 },
          { param: 'accuracy', kind: 'range', min: 2, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/hv-test-bench/cal-capacitor', qty: q(2) }] },
      { anyOf: [{ item: 'std/hv-thyristor-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
    ],
    needs: [
      'plant/hv-test-bench/standard-capacitor-100pf',
      'plant/hv-test-bench/standard-voltage-reference',
      'plant/metrology-room',
      'std/dvm-general',
    ],
    steps: [
      {
        note_zh: '装 100 pF 电荷电容 + 晶闸管阶跃开关 + 0–1 V 分压（6.2 V 基准经电阻分压）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '分选阶跃沿：0.5–1 µs 的收，>1 µs 的退回（晶闸管 0.5–2 µs 的窗口里选）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '标定：C 用本地 100 pF 标准、V 用 1–10 V 标准，Q = C·V；10/50/100 pC 三点各 3 次',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装屏蔽盒与 BNC；A/B 各写一份校准记录（不共用一份）',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      '产出按台计，不进 kg 守恒；kg 项 电阻丝 0.02 + 铝 0.4 + 铜 0.1 = 0.52 kg，另加 电容 2 + 晶闸管 2 + 基准 2（按件）→ 校准器 2 台；余是屏蔽盒/接头/触发板废料。Q = C·V：C 取本地 100 pF 标准（0.1–0.5%）、V 取 1–10 V 标准（0.01–0.1%），合成 0.51%；2–3% 是设计窗口（含杂散电容与分压误差），实际按 10/50/100 pC 三点校准记录。上升沿 0.5–1 µs 靠晶闸管分选，>1 µs 退回',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...MEASUREMENT_LOCAL_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...MEASUREMENT_LOCAL_ROUTES];
