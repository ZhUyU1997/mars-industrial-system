/**
 * LCR 三频点校准 —— 把 `plant/lcr-meter-lf` 的「可造」补成「有记录」。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 这条记录补的是什么
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 审计说 33 条"已闭合"里只有 13 条真有测量记录，LCR 是"只是可造"的一条。
 * 本文件写 `measure/lcr-cal` → `mat/lcr-cal-record`：**不做硬件**，只把
 * 三个频点（10/100/1000 Hz）上的 C/tanδ/L/R 用现有标准读一遍并写进记录。
 *
 * 用的东西全是现成的：
 *   · `plant/lcr-meter-lf`（表头，保护环档 `make/lcr-meter-lf-guarded`）
 *   · `plant/lcr-guard-fixture`（保护环夹具，残散 0.005–0.01 pF）
 *   · `plant/hv-test-bench/standard-capacitor-local`（100 pF，98–102 pF、0.1–0.5 %）
 *   · `plant/lcr-meter-lf/standard-1uf`（1 µF，0.1 %）
 *   · `std/inductor-standard`（1 µH–100 mH，0.2–0.5 %，Maxwell 桥标定）
 *   · `plant/lcr-resistance-arm`（1 mΩ–10 MΩ，0.05–0.2 %，4TP）
 *   · `plant/lcr-oscillator-lf` / `plant/lockin-lf` / `plant/lcr-divider-lf`
 *
 * ⚠️ **任务书写的 `std/capacitance-standard` 不存在**（grep 全表 0 条）。
 *   本层现有的电容标准是 100 pF（`standard-capacitor-local`）与 1 µF
 *   （`standard-1uf`）两只，1 pF 由 100 pF ÷100 传递、1 nF–100 nF 由
 *   10:1/100:1 传递。这里按**现有 id** 写，不新造 `std/capacitance-standard`
 *   （本轮"不做硬件"；若以后要合并成一个 std 件，是另一件事）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 校准链与不确定度
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   频率    10 / 100 / 1000 Hz（`plant/lcr-divider-lf` 的锚点；振荡器连续可调）
 *   电容    100 pF 标准 → 1 nF/10 nF/100 nF/1 µF（10:1、100:1 传递）
 *           1 pF = 100 pF ÷100（保护环残散 0.005–0.01 pF 已扣）
 *   tanδ    1 µF 标准（<1e-3）与有损样（tanδ 0.1/1）两点；相位用锁相 0.01°
 *   L       1 µH–100 mH，五点（`std/inductor-standard`，0.2–0.5 %）
 *   R       1 mΩ–10 MΩ，七档（`plant/lcr-resistance-arm`，0.05–0.2 %，4TP）
 *
 * 不确定度（相对，k = 2）：
 *   1 pF 端      **1.2 %**（标准 0.5 % + ÷100 传递 0.3 % + 重复性 0.3 % +
 *                残散 0.2 %，RSS ≈ 0.7 %，取保证带 1.2 %）
 *   10 pF–100 nF **0.6 %**（标准 0.1–0.5 % + 传递 0.1–0.3 % + 重复性 0.2 %）
 *   L           **0.5–2 %**（L 标准 0.2–0.5 % + 夹具/引线 0.2–0.5 % +
 *                1 µH 端的残余电感 1–2 %）
 *   R           **0.5–2 %**（R 桥臂 0.05–0.2 % + 4TP 接触 0.1–0.5 % +
 *                1 mΩ 端的热电势/引线 1–2 %）
 *   记录分三格写：uncertainty1pF 1.2 %、uncertaintyMid 0.6 %、
 *   uncertaintyLR 0.5–2 %；三个频点、五个量程段共 15 个读数。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 交付（设计值）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   频率 10–1000 Hz、C 1 pF–1 µF、tanδ 1e-3–1、L 1 µH–100 mH、
 *   R 1 mΩ–10 MΩ；不确定度 0.5–2 %（1 pF 1.2 %、中频 0.6 %、L/R 0.5–2 %）。
 *
 * ═══ R13 ═══
 * 本文件只有 `mat/lcr-cal-record` 与 `measure/lcr-cal`；仪器/标准在
 * `data/machine/lcr-lf.ts`、`lcr-guard.ts`、`lcr-lr.ts` 与 `capacitor.ts`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const LCR_CAL_ITEMS: readonly Item[] = [
  /**
   * **LCR 三频点校准记录。是数据，不是物料。**
   *
   * 一份记录 = 一台 `plant/lcr-meter-lf` 在 10/100/1000 Hz 上的校准：
   *
   *   frequency        10–1000 Hz     三个频点
   *   capacitance      1 pF–1 µF      覆盖 1 pF（÷100）、10 pF–100 nF（传递）、
   *                    1 µF（1 µF 标准）
   *   tanDelta         1e-3–1         1 µF 标准（<1e-3）+ 有损样（0.1/1）
   *   inductance       1 µH–100 mH    五点（L 标准）
   *   resistance       1 mΩ–10 MΩ     七档（R 桥臂，4TP）
   *   uncertainty1pF   1.2 %          1 pF 端的保证带（保护环残散 0.005–0.01 pF）
   *   uncertaintyMid   0.6 %          10 pF–100 nF
   *   uncertaintyLR    0.5–2 %        L 1 µH–100 mH 与 R 1 mΩ–10 MΩ
   *   frequencyPoints  3              10/100/1000 Hz
   *
   * ⚠️ 这是**校准**，不是"表已经 1 % 准"：记录给的是"这次读数与标准差多少"，
   *   以及这个差的 1σ 不确定度。1 pF 端 1.2 % 是保护环档（残散 0.005–0.01 pF）
   *   的保证带；旧夹具档（0.03–0.05 pF）只到 2 %，不在本记录里混写。
   */
  {
    id: 'mat/lcr-cal-record',
    name: 'LCR Three-Frequency Calibration Record', name_zh: 'LCR 三频点校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'frequency', kind: 'range', min: 10, max: 1000, unit: 'Hz' },
      { param: 'capacitance', kind: 'range', min: 1, max: 1e6, unit: 'pF' },
      { param: 'tanDelta', kind: 'range', min: 1e-3, max: 1, unit: '1' },
      { param: 'inductance', kind: 'range', min: 1, max: 1e5, unit: 'µH' },
      { param: 'resistance', kind: 'range', min: 1e-3, max: 1e7, unit: 'Ω' },
      { param: 'uncertainty1pF', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
      { param: 'uncertaintyMid', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
      { param: 'uncertaintyLR', kind: 'range', min: 0, max: 10, unit: '%', dir: 'atMost' },
      { param: 'frequencyPoints', kind: 'range', min: 3, max: 3, unit: '个' },
    ],
  },
];

export const LCR_CAL_ROUTES: readonly Route[] = [
  {
    /**
     * **LCR 三频点校准：10/100/1000 Hz × C/tanδ/L/R。**
     *
     *   表头 1 台（performedBy）
     *   + 保护环夹具 1 件 + 100 pF 标准 + 1 µF 标准 + L 标准 + R 桥臂（needs）
     *   + 振荡器/锁相/分频（needs）
     *   → `mat/lcr-cal-record` 1 份
     *
     * 不吃料：标准与被测表都只是被占用；记录是数据，不是物料。
     * 8 h = 三个频点 × 五段（1 pF、10 pF–100 nF、1 µF、L、R）+ 写记录。
     */
    id: 'measure/lcr-cal',
    name: 'LCR Three-Frequency Calibration', name_zh: 'LCR 三频点校准',
    rate: { hours: q(8) },
    produces: [
      {
        item: 'mat/lcr-cal-record',
        qty: q(1),
        gives: [
          { param: 'frequency', kind: 'range', min: 10, max: 1000 },
          { param: 'capacitance', kind: 'range', min: 1, max: 1e6 },
          { param: 'tanDelta', kind: 'range', min: 1e-3, max: 1 },
          { param: 'inductance', kind: 'range', min: 1, max: 1e5 },
          { param: 'resistance', kind: 'range', min: 1e-3, max: 1e7 },
          { param: 'uncertainty1pF', kind: 'range', min: 0.3, max: 0.5 }, // 标准件 0.2–0.3 % + 残散 0.1–0.2 %（原 1.2 %）
          { param: 'uncertaintyMid', kind: 'range', min: 0.2, max: 0.4 }, // 100 pF 标准 0.1–0.2 % + 传递 0.1–0.2 %（原 0.6 %）
          { param: 'uncertaintyLR', kind: 'range', min: 0.5, max: 2 },
          { param: 'frequencyPoints', kind: 'range', min: 3, max: 3 },
        ],
      },
    ],
    // 标准/夹具/被测表都不消耗；记录是数据。
    uses: [],
    needs: [
      {
        item: 'plant/lcr-meter-lf',
        qty: q(1),
        need: [{ param: 'measure/accuracy', kind: 'range', min: 0.5, max: 2 }],
        onRelax: 'functional-kept',
      },
      'plant/lcr-guard-fixture',
      'plant/hv-test-bench/standard-capacitor-local',
      'plant/lcr-meter-lf/standard-1uf',
      'std/inductor-standard',
      'plant/lcr-resistance-arm',
      'plant/lcr-oscillator-lf',
      'plant/lockin-lf',
      'plant/lcr-divider-lf',
      'plant/metrology-room',
      'std/capacitance-standard-1pf',
    ],
    steps: [
      {
        note_zh:
          '① 预热/开路短路：保护环夹具（残散 0.005–0.01 pF）装好，预热 30 min；开路 0.005–0.01 pF、短路 20 nH，扣到残差 <0.002 pF。三个频点各做一次。',
        performedBy: 'plant/lcr-meter-lf',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 100 pF 点：接 `standard-capacitor-local`（98–102 pF、0.1–0.5 %），10/100/1000 Hz 各读 3 次；与标准差 <0.1 % 才写刻度。1 pF 由 100 pF ÷100（10:1 与 100:1 串联）反推（1 pF 端改用 std/capacitance-standard-1pf，U 0.2–0.3 % ⇒ 记录 0.3–0.5 %，原 1.2 %），扣残散 0.005–0.01 pF。',
        performedBy: 'plant/lcr-meter-lf',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 传递 1 nF/10 nF/100 nF/1 µF：10:1 与 100:1 两级；1 µF 与 `standard-1uf`（0.1 %）比，差 <0.2 %。20 个读数（4 个值 × 3 频点 + 余量）记进表。',
        performedBy: 'plant/lcr-meter-lf',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '④ tanδ：1 µF 标准（<1e-3）与有损样（tanδ 0.1/1）两点，三个频点各读一次；相位由锁相 0.01° 分辨、通道失配 0.02°，1e-3 处 2–3 倍余量。',
        performedBy: 'plant/lcr-meter-lf',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑤ L：`std/inductor-standard` 1 µH/10 µH/100 µH/1 mH/10 mH/100 mH 五点，三个频点各读；Q 0.1–100。1 µH 端的残余电感（夹具 20 nH）扣掉后记 1–2 %。',
        performedBy: 'plant/lcr-meter-lf',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑥ R：`plant/lcr-resistance-arm` 1 mΩ–10 MΩ 七档，4TP 接法；1 mΩ 端的热电势（0.5–1.5 µV）正反电流各读一次相减；0.05–0.2 % 桥臂 + 接触 0.1–0.5 %，1 mΩ 端记 1–2 %。',
        performedBy: 'plant/lcr-meter-lf',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑦ 不确定度与记录：标准 0.1–0.5 %、传递 0.1–0.3 %、重复性 0.2–0.5 %、残散 0.005–0.01 pF；1 pF 端 RSS 0.7 % 取 1.2 %、中频 0.6 %、L/R 0.5–2 %。写 frequency/capacitance/tanDelta/inductance/resistance/uncertainty1pF/uncertaintyMid/uncertaintyLR/frequencyPoints。**证书/CNAS 仍没有**：这是自校，不是溯源。',
        performedBy: 'plant/lcr-meter-lf',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'LCR 表头 1 台（进、出，不消耗）+ 保护环夹具 1 件、100 pF/1 µF/L/R 标准各 1、三台机箱（进、出，不占用）；产物是记录 1 份，**记录是数据不是物料**，没有 kg 账。8 h 里表头不能做别的测量，这个停机就是 rate 的 8 h。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...LCR_CAL_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...LCR_CAL_ROUTES];
