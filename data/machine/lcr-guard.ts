/**
 * LCR 1 pF 端 2 % → 1 %：保护环夹具（差 2×）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 1 pF 的账：为什么 0.05 pF 是 5 %，0.01 pF 才是 1 %
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   1 pF @ 10 Hz 的容抗 = 1/(2π·10·1e-12) = **15.9 GΩ**
 *   夹具残散 C_s 与 DUT 并联，误差 = C_s / 1 pF：
 *     C_s = 0.05 pF ⇒ **5 %**
 *     C_s = 0.01 pF ⇒ **1 %**
 *   所以 1 % 档不是"算法修一下"，是夹具的残散必须压到 0.01 pF 以下。
 *   旧夹具（`plant/lcr-meter-lf/fixture`）残散 0.03–0.05 pF：开路/短路补偿
 *   只能扣掉可重复的那一部分，1 pF 端留 2 %。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 保护环怎么做：三层屏蔽 + 保护驱动 + 四端对
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① 内电极与保护环：同一平面、间隙 0.5 mm。保护环由单位增益缓冲驱动到
 *      与内电极**同电位** ⇒ 两者之间的电场为零，内电极的边缘场不再落到
 *      保护环上，也就不再并进 DUT 的电容；
 *   ② 中间屏蔽层：也由保护缓冲驱动（guard 电位），把内电极到外屏蔽的
 *      电缆电容"驱动掉"—— 这一层是 0.05 → 0.01 pF 的关键；
 *   ③ 外层屏蔽：接地，挡外部干扰；
 *   ④ 四端对（4TP）：电流高/低、电位高/低各一对同轴，屏蔽在源端接地、
 *      在夹具端接保护驱动；引线电感与接触电阻不进 C 读数。
 *
 * 残散 0.005–0.01 pF 的构成（设计值，Earth 工程值）：
 *   内电极-保护环的剩余边缘场  0.002–0.004 pF
 *   PTFE 绝缘的体漏与表面漏     0.001–0.003 pF
 *   接头/同轴的剩余电容         0.002–0.003 pF
 *   ⇒ RSS 0.003–0.006 pF，取 0.005–0.01 pF 的窗口
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 模型改动（两处，都是 `prop_missing_gives` 逼出来的）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① `plant/lcr-meter-lf` 加 `strayCapacitance` prop，`accuracy` 从 0.5–2
 *      放宽到 0.3–2（保护环档的中频段到 0.3 %）；
 *   ② 旧路线 `make/lcr-meter-lf` 只补**一行** gives（0.03–0.05 pF）。
 *      条目加了 prop，所有产出路线都必须给窗口，这是模型的硬规则；旧路线的
 *      频率/电容/准确度窗口一字未动。1 % 级的那一档是第二条路线
 *      `make/lcr-meter-lf-guarded`（不替换旧路线，两档并存）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 交付（设计值）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   1 pF 档        0.8–1.2 %（残散 0.005–0.01 pF ⇒ 0.5–1 %；加增益/线性 0.2 %、
 *                  噪声 0.2–0.3 %，RSS 0.6–1.1 %，取 0.8–1.2 的保证带）
 *   10 pF–100 nF   0.3–0.6 %（残散折算 0.005–0.06 %，主项是量程电阻 0.1 % 与
 *                  1 GΩ 档的增益校准）
 *   tanδ 1e-3 端   保持：保护环不改相位，只改并联电容；相位仍由锁相 0.01° 分辨
 *                  + 通道失配 0.02° 定，1e-3 处 2–3 倍余量
 *   L/R            L 1 µH–100 mH、R 1 mΩ–10 MΩ 的窗口沿用同一台表（保护环
 *                  对 4TP 的 L/R 只有好处：引线电容被驱动掉）
 *
 * ⚠️ 这是**设计值**：残散 0.005–0.01 pF 要用电容标准实测（1 pF 模拟件 +
 *    100 pF ÷100 传递），本文件不写 `measure/*`（R13：测量在 measure/）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const LCR_GUARD_ITEMS: readonly Item[] = [
  /**
   * **保护环夹具。三层屏蔽、保护驱动、四端对；残散 0.005–0.01 pF。**
   *
   * 它是 `plant/lcr-meter-lf` 的专用件（装进表头机箱），不是独立仪器；
   * id 按任务书用 `plant/lcr-guard-fixture`，类别是 part（装上去、可拆）。
   *
   *   内电极     φ20 铜，工作面镀金 2 µm
   *   保护环     φ24 铜，与内电极同平面、间隙 0.5 mm，由缓冲驱动
   *   驱动屏蔽   φ30 铜筒，接保护缓冲输出
   *   外屏蔽     φ40 铝壳，接地
   *   绝缘       PTFE，体电阻 >1e17 Ω·cm、表面电阻 >1e15 Ω
   */
  {
    id: 'plant/lcr-guard-fixture',
    name: '保护环夹具',
    unit: '件',
    category: 'part',
    props: [
      // 1 pF 端误差的主项：0.05 pF=5 %、0.01 pF=1 %
      { param: 'strayCapacitance', kind: 'range', min: 0, max: 0.02, unit: 'pF', dir: 'atMost' },
      { param: 'shieldingLayers', kind: 'range', min: 3, max: 3, unit: '层' },
    ],
  },
];

export const LCR_GUARD_ROUTES: readonly Route[] = [
  {
    /**
     * **保护环夹具：车/铣三层电极 → 装 PTFE 与保护驱动 → 4TP 接线 → 量残散。**
     *
     *  铜 1 + PTFE 0.05 + 氧化铝 0.05 + 铝 0.1 + 运放 2 + 电阻 6 → 夹具 1 件
     *
     * 保护驱动是两只运放（跟随器 + 缓冲），跟随误差 <0.1 mV 就够：内电极与
     * 保护环之间的电场只剩 0.1 mV/0.5 mm = 0.2 V/m 的残差，对应的边缘电容
     * 变化 <0.001 pF。
     */
    id: 'make/lcr-guard-fixture',
    name: '保护环夹具制造',
    produces: [
      {
        item: 'plant/lcr-guard-fixture',
        qty: q(1),
        gives: [
          { param: 'strayCapacitance', kind: 'range', min: 0.005, max: 0.01 },
          { param: 'shieldingLayers', kind: 'range', min: 3, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/chip-resistor-general', qty: q(6) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh:
          '车/铣三层电极：内电极 φ20、保护环 φ24（同平面、间隙 0.5 mm）、驱动屏蔽 φ30、外屏蔽 φ40 铝壳；同轴度 ≤0.02 mm，内电极工作面镀金 2 µm',
        performedBy: 'lathe',
      },
      {
        note_zh:
          '装 PTFE 绝缘与保护驱动：两只运放做跟随/缓冲，驱动保护环与中间屏蔽；跟随误差 <0.1 mV（1 kHz 方波看前后沿）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '4TP 接线与残散：电流高/低、电位高/低各一对同轴，屏蔽在源端接地、夹具端接保护驱动；用 100 pF 标准与 1 pF 模拟件，开路残散量到 0.005–0.01 pF（>0.02 pF 退回）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      '铜 1 + PTFE 0.05 + 氧化铝 0.05 + 铝 0.1 + 运放 2 + 电阻 6 → 夹具 1 件；产物按件计，余是车屑/铣屑与绝缘边角',
  },

  {
    /**
     * **保护环档 LCR 表头：保护环夹具 + 量程网络 + 1 µF 标准 + L/R 标准。**
     *
     * 这是 `plant/lcr-meter-lf` 的**第二条产出路线**，不替换旧路线：
     *   · 旧 `make/lcr-meter-lf`：4 端屏蔽夹具，残散 0.03–0.05 pF，1 pF 端 2 %；
     *   · 新 `make/lcr-meter-lf-guarded`：保护环夹具，残散 0.005–0.01 pF，
     *     1 pF 端 0.8–1.2 %、10 pF–100 nF 0.3–0.6 %。
     *
     * 窗口（设计值）：
     *   频率      10 Hz–1 kHz
     *   电容      1 pF–1 µF
     *   tanδ      1e-3–1（保持）
     *   准确度    1 pF 端 0.8–1.2 %、10 pF–100 nF 0.3–0.6 %、0.1–1 µF 1–2 %
     *              ⇒ 单窗口 accuracy 0.3–1.2
     *   残散      0.005–0.01 pF
     *   L/R       L 1 µH–100 mH、R 1 mΩ–10 MΩ、Q 0.1–100（沿用 lcr-lr.ts 的标准）
     *
     * 标定：
     *   ① 开路/短路：残散 0.005–0.01 pF、短路 20 nH；
     *   ② 1 pF 档：100 pF ÷100 传递 + 1 pF 模拟件；10/100/1000 Hz 各 3 次；
     *      10 Hz 上 63 pA 经 1 GΩ 变 63 mV，正反激励各 30 s 扣偏置；
     *   ③ 100 pF/1 nF/10 nF/1 µF 传递；tanδ 用 1 µF 标准（<1e-3）；
     *   ④ L/R：L 五点、R 七档；Q 0.1–100。
     */
    id: 'make/lcr-meter-lf-guarded',
    name: '10 Hz–1 kHz LCR 表制造',
    produces: [
      {
        item: 'plant/lcr-meter-lf',
        qty: q(1),
        gives: [
          { param: 'frequencyMin', kind: 'range', min: 10, max: 10 },
          { param: 'frequencyMax', kind: 'range', min: 1000, max: 1000 },
          { param: 'measure/frequency', kind: 'range', min: 10, max: 1000 },
          { param: 'measure/capacitance', kind: 'range', min: 1, max: 1e6 },
          { param: 'measure/tanDelta', kind: 'range', min: 1e-3, max: 1 },
          { param: 'measure/accuracy', kind: 'range', min: 0.3, max: 1.2 },
          { param: 'strayCapacitance', kind: 'range', min: 0.005, max: 0.01 },
          { param: 'measure/inductance', kind: 'range', min: 1, max: 1e5 },
          { param: 'measure/resistance', kind: 'range', min: 1e-3, max: 1e7 },
          { param: 'qFactor', kind: 'range', min: 0.1, max: 100 },
          // 保护环不改变 R 的准确度（R 由四端对桥臂定），沿用旧档 0.1–0.5
          { param: 'resistanceAccuracy', kind: 'range', min: 0.1, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/lcr-guard-fixture', qty: q(1) }] },
      { anyOf: [{ item: 'plant/lcr-meter-lf/range-network', qty: q(1) }] },
      { anyOf: [{ item: 'plant/lcr-meter-lf/standard-1uf', qty: q(1) }] },
      { anyOf: [{ item: 'std/inductor-standard', qty: q(1) }] },
      { anyOf: [{ item: 'plant/lcr-resistance-arm', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 100) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/lcr-oscillator-lf',
      'plant/lockin-lf',
      'plant/lcr-divider-lf',
      'plant/hv-test-bench/standard-capacitor-local',
    ],
    steps: [
      {
        note_zh:
          '装保护环夹具与保护驱动：三层屏蔽接好（内电极/保护环/驱动屏蔽/外屏蔽），4TP 同轴进机箱；保护驱动跟随误差 <0.1 mV',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '开路/短路补偿：开路残散 0.005–0.01 pF（旧夹具 0.03–0.05）、短路 20 nH；扣到残差 <0.002 pF 才收',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '1 pF 档：100 pF 标准 ÷100 传递 + 1 pF 模拟件；10/100/1000 Hz 各 3 次；10 Hz 上 63 pA 经 1 GΩ 变 63 mV，正反激励各 30 s（TC 30 s）扣 1 pA 偏置；三点差 <0.4 % 才写 0.8–1.2 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '100 pF/1 nF/10 nF/1 µF 传递：10:1 与 100:1 两级；1 µF 与 1 µF 标准比，差 <0.2 %；tanδ 用 1 µF 标准（<1e-3）验相位，1e-3 处 2–3 倍余量',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          'L/R：装 `std/inductor-standard` 与 `plant/lcr-resistance-arm`；L 用 1 µH–100 mH 五点（0.5–2 %），R 用 1 mΩ–10 MΩ 七档（0.1–0.5 %），Q 0.1–100。保护环把引线电容驱动掉，L 的低端（1 µH）比旧夹具少 0.05 pF 的并联',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      '保护环夹具 1 + 量程网络 1 + 1 µF 标准 1 + L 标准 1 + R 桥臂 1 + 钢板 1 + 铜 0.1 + PTFE 0.01 → 表头 1 台；产物按台计。三台机箱（振荡器/锁相/分频）只进 needs，机时记在各自路线',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...LCR_GUARD_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...LCR_GUARD_ROUTES];
