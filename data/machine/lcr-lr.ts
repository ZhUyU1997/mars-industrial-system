/**
 * L/R 档：电感标准 + 四端对电阻桥臂（补 `plant/lcr-meter-lf` 只会 C/tanδ 的缺口）。
 *
 * ⚠️ **补的是什么**：`data/machine/lcr-lf.ts` 的 `plant/lcr-meter-lf` 只标了
 * `capacitance`/`tanDelta`，没有 `inductance`、没有 `resistance` —— 也就是说那台
 * 表只能验电容。这一份给两条**可溯源的标准件**：
 *
 *   `std/inductor-standard`     1 µH–100 mH、±0.2–1 %、Q 10–100、TC ≤50 ppm/K
 *   `plant/lcr-resistance-arm`  1 mΩ–10 MΩ 四端对、±0.01–0.5 %、TC 5–50 ppm/K
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、电感标准怎么溯源（Maxwell 桥）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   本层没有 L 的基准，但有 **C 的标准**（`plant/hv-test-bench/standard-capacitor-local`
 *   100 pF、0.1–0.5 %）与 **R 的标准**（`standard-resistor-local` 0.05–0.2 %）。
 *   Maxwell 桥：Lx = R2·R3·C1 —— 用两只标准电阻与一只标准电容**算**出电感：
 *
 *     0.1 %（R）× 0.1 %（R）× 0.1 %（C）⇒ 平方和开根 ≈ **0.17–0.3 %**
 *     加上绕组与磁芯的损耗、桥的灵敏度 ⇒ **0.2–0.5 %** 是这一档的真实水平
 *
 *   磁芯：`std/ferrite-core-general`（MnZn，μ 2000–5000）。100 mH 用 μ2000 的罐形
 *   磁芯要 1 200–2 000 匝（0.1 mm 线，R ≈ 10–20 Ω，1 kHz 下 Q ≈ 40–60 ✓）。
 *   温度系数：MnZn 的 μ 温漂 100–500 ppm/K，靠**退火 + 气隙**压到 20–40 ppm/K；
 *   空气芯段（1–100 µH）本身 20–30 ppm/K ✓。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、电阻桥臂：四端对 + 标准电阻比对
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   1 mΩ 档：引线电阻 1 mΩ 与 1 mΩ 的 0.1 % 差 = 1 µΩ ⇒ 必须四端对（电流端与
 *   电压端分开），端子的接触电阻 50–200 µΩ 在电压端不产生压降。
 *   量程：1 mΩ / 10 mΩ / … / 10 MΩ 共七档，每档用 `standard-resistor-local` 比对；
 *   10 MΩ 档用 10 GΩ 的 `range-network` 反馈电阻做 I/V，靠电压比而不是电阻比。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、交付窗口（与 `plant/lcr-meter-lf` 扩出来的能力对齐）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   L  1 µH–100 mH（0.5–2 %，1 pF 端的 2 % 是另一头的事）
 *   R  1 mΩ–10 MΩ（旧路线 0.05–1 %；manganin 新路线 1 Ω–100 kΩ 档 0.01–0.05 %）
 *   Q  0.1–100
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、缺口（带数）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① **manganin/constantan 已建（`resistance-alloys.ts`）。** 旧桥臂仍用
 *     `standard-resistor-local` 与 `std/resistor-network-general`（0.05–0.2 %、
 *     TC 15–30 ppm/K）；新路线 `make/lcr-resistance-arm-manganin` 用
 *     `std/precision-resistor-manganin`（0.01–0.05 %、TC 5–10 ppm/K）只交
 *     1 Ω–100 kΩ 档；1 mΩ/10 MΩ 仍走旧路线。油浴已建
 *     （`plant/precision-oil-bath`），第三条油浸路线 `make/lcr-resistance-arm-oil`
 *     把 1 Ω–100 kΩ 档再压到 0.005–0.02 %、TC 2–5 ppm/K。
 *  ② 100 mH 的磁芯电感 Q 只有 40–60（1 kHz）；要 Q 100 得用大体积罐形磁芯或
 *     多股线，体积 ×2–3。
 *  ③ 电感的三阶效应：绕组电容 20–50 pF 让 100 mH 在 100 kHz 以上自谐振，
 *     本文件只保 10 Hz–10 kHz 的标定；10 kHz 以上要逐点标。
 *  ④ 磁芯的磁滞与老化：100 °C/100 h 后 L 掉 0.1–0.5 %，所以路线里有老化一步。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { LCR_LR_ITEMS, LCR_LR_ROUTES } from '../../data/machine/lcr-lr.ts';
 *   items: [...LCR_LR_ITEMS] · routes: [...LCR_LR_ROUTES]
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const LCR_LR_ITEMS: readonly Item[] = [
  /**
   * **电感标准：1 µH–100 mH，铁氧体罐形磁芯 + 铜绕组。**
   *
   *   inductance      1–100 000 µH（1 µH–100 mH）
   *   accuracy        0.2–0.5 %（Maxwell 桥，Lx = R₂·R₃·C₁）
   *   qFactor         20–80（1 kHz）
   *   tempCoefficient 20–40 ppm/K（退火 + 气隙后的 MnZn；空气芯段 20–30）
   *   currentRating   5–50 mA（不饱和）
   */
  {
    id: 'std/inductor-standard',
    name: '电感标准',
    unit: '件',
    category: 'part',
    props: [
      { param: 'inductance', kind: 'range', min: 1, max: 1e5, unit: 'µH' },
      { param: 'accuracy', kind: 'range', min: 0.2, max: 1, unit: '%', dir: 'atMost' },
      { param: 'qFactor', kind: 'range', min: 10, max: 100, unit: '1' },
      { param: 'tempCoefficient', kind: 'range', min: 10, max: 50, unit: 'ppm/K', dir: 'atMost' },
      { param: 'currentRating', kind: 'range', min: 1, max: 100, unit: 'mA' },
    ],
  },

  /**
   * **四端对电阻桥臂：1 mΩ–10 MΩ，七档 1-2-5 量程。**
   *
   *   resistance      1e-3–1e7 Ω
   *   accuracy        0.005–0.5 %（油浸 0.005–0.02；manganin 环氧 0.01–0.05；旧 0.05–0.2）
   *   terminals       4（电流/电压端分开）
   *   tempCoefficient 2–50 ppm/K（油浸 2–5；manganin 环氧 5–10；旧 15–30）
   */
  {
    id: 'plant/lcr-resistance-arm',
    name: '四端对电阻桥臂',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resistance', kind: 'range', min: 1e-3, max: 1e7, unit: 'Ω' },
      { param: 'accuracy', kind: 'range', min: 0.005, max: 0.5, unit: '%', dir: 'atMost' },
      { param: 'terminals', kind: 'range', min: 4, max: 4, unit: '端' },
      { param: 'tempCoefficient', kind: 'range', min: 2, max: 50, unit: 'ppm/K', dir: 'atMost' },
    ],
  },
];

export const LCR_LR_ROUTES: readonly Route[] = [
  {
    /**
     * **电感标准：绕制 → 浸渍固化 → 老化 → Maxwell 桥标定。**
     *
     *   铁氧体磁芯 1 + 铜线 0.2 + 酚醛骨架 0.02 → 电感标准 1 只
     */
    id: 'make/inductor-standard',
    name: '电感标准制造',
    produces: [
      {
        item: 'std/inductor-standard',
        qty: q(1),
        gives: [
          { param: 'inductance', kind: 'range', min: 1, max: 1e5, record: 'mat/lcr-cal-record' },
          { param: 'accuracy', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'qFactor', kind: 'range', min: 20, max: 80 },
          { param: 'tempCoefficient', kind: 'range', min: 20, max: 40 },
          { param: 'currentRating', kind: 'range', min: 5, max: 50 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/ferrite-core-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 50) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/lcr-resistance-arm',
      'plant/hv-test-bench/standard-capacitor-local',
    ],
    steps: [
      { note_zh: '① 绕制：罐形磁芯 + 0.1 mm 漆包线，1 200–2 000 匝（100 mH）；1 µH–100 µH 段用空心线圈', performedBy: 'plant/winder' },
      { note_zh: '② 浸渍与固化：真空浸漆、100–120 °C 固化 2 h（防潮与防振）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 100, max: 120 }] },
      { note_zh: '③ 老化：100–120 °C / 100 h，复测 L 变化 <0.1 %', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 100, max: 120 }] },
      { note_zh: '④ Maxwell 桥标定：Lx = R₂·R₃·C₁（两只 standard-resistor-local + 100 pF 标准），1 kHz、0.2–0.5 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '⑤ Q 与 TC：1 kHz 下 Q 20–80；−10…+50 °C 扫 TC 20–40 ppm/K', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(16) },
    unbalanced_zh: '铁氧体磁芯 1 + 铜线 0.2 + 酚醛 0.02 → 电感标准 1 只；余是绕线头与浸漆损耗（按件计）',
  },

  {
    /**
     * **电阻桥臂：装四端对端子与量程电阻 → 屏蔽 → 与标准电阻比对。**
     *
     *   标准电阻 1 + 电阻网络 2 + 片阻 4 + 铜 0.5 + 钢板 1 → 桥臂 1 件
     */
    id: 'make/lcr-resistance-arm',
    name: '四端对电阻桥臂制造',
    produces: [
      {
        item: 'plant/lcr-resistance-arm',
        qty: q(1),
        gives: [
          { param: 'resistance', kind: 'range', min: 1e-3, max: 1e7, record: 'mat/lcr-cal-record' },
          { param: 'accuracy', kind: 'range', min: 0.05, max: 0.2 },
          { param: 'terminals', kind: 'range', min: 4, max: 4 },
          { param: 'tempCoefficient', kind: 'range', min: 15, max: 30 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/hv-test-bench/standard-resistor-local', qty: q(1) }] },
      { anyOf: [{ item: 'std/resistor-network-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/chip-resistor-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 装四端对端子：电流端用 4 mm² 铜排、电压端用 0.5 mm 铜线（接触电阻落在电流端）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 七档量程电阻与屏蔽盒：1 mΩ–10 MΩ，1-2-5 步进', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 与 standard-resistor-local 逐档比对：1 mΩ 用 10 A 四端对、10 MΩ 用 10 V/1 GΩ 分压，0.05–0.2 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 温漂：20–30 °C 扫 15–30 ppm/K（本路线仍未装油浴；油浴/油浸见 make/lcr-resistance-arm-oil）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '标准电阻 1 + 电阻网络 2 + 片阻 4 + 铜 0.5 + 钢板 1 → 桥臂 1 件（按件计）',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...LCR_LR_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...LCR_LR_ROUTES];
