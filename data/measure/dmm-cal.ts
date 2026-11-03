/**
 * 6½ / 7½ 位 DMM 准确度校准 —— 两张记录，补"可造但没有测量记录"的两条。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 两条链，两个层级
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   6½ 位  10/100/1000 V 三档，对 `std/dmm-7half-general` 读同一台源，
 *          差值就是 6½ 的误差；窗口 **35–100 ppm**。
 *          源用 `plant/hv-test-bench`（种子，3 kV/100 kV）；两台表读同一台源，
 *          源的漂移是**共模**，差值里一阶抵消——所以 35–100 ppm 是表的误差，
 *          不是源的稳定度。
 *
 *   7½ 位  10/100/1000 V 三档，对 `std/zener-reference-7half`（6.5–7.5 V，
 *          25.000 ±0.01 K 油浴）+ `plant/hamon-divider-7half`（100:1，
 *          0.1–0.3 ppm）+ `std/divider-10to1-precision`；窗口 **3.5–10 ppm**。
 *          100/1000 V 档用表内 10:1/100:1 分压比对外部 Hamon 核，**不需要
 *          外部 1000 V 源**；比值误差 0.1–0.3 ppm 远小于 3.5–10 ppm。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * "无绝对 10 V"：准确说法
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 任务书写"注明无绝对 10 V"。数据里现在有一条**绝对电压路线**
 * `measure/voltage-absolute` → `mat/voltage-absolute-record`：
 *   电压 0.5–10 V、不确定度 **50–100 ppm**（电压天平，30–90 ppm 设计值）。
 * 所以准确说法是：
 *
 *   · **没有 3.5–10 ppm 的绝对 10 V** —— 3.5–10 ppm 是对齐纳 + Hamon 的
 *     **传递/线性**，不是绝对；
 *   · 绝对 10 V 只有 **50–100 ppm**（电压天平记录）；7½ 的 3.5–10 ppm
 *     比它好 5–20 倍，所以两者的关系是：**绝对项 50–100 ppm、传递项
 *     3.5–10 ppm**，不能把传递项写成绝对项。
 *
 * 记录里 `absoluteUncertainty` 一列写 50–100 ppm，`traceability` 写
 * `transfer-only`——这两格就是"无绝对 10 V"的量化写法。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 不确定度
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   6½  误差 35–100 ppm（表本身）；校准不确定度 3.5–10 ppm（7½ 的传递项
 *       + 共模残余 0.2–1 ppm + 读数噪声 0.5–2 ppm）。
 *   7½  误差 3.5–10 ppm（表本身）；传递链不确定度 0.5–1.3 ppm
 *       （齐纳年漂 0.5–1 + Hamon 0.1–0.3 + 10:1 0.1–0.2，RSS）；
 *       绝对项 50–100 ppm（`mat/voltage-absolute-record`）。
 *
 *   ⚠️ 6½ 的 35–100 ppm 对 7½ 的 3.5–10 ppm：参考比被测好 10 倍，
 *      所以 6½ 的误差不会被参考吃掉——这是"对 7½ 传递"成立的前提。
 *
 * ═══ R13 ═══
 * 本文件只有两张记录 + 两条测量路线；DMM 本体、齐纳、Hamon、油浴都在
 * `data/machine/dmm-6half.ts`、`dmm-7half.ts`、`precision-oil-bath` 与
 * `voltage-anchor.ts`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DMM_CAL_ITEMS: readonly Item[] = [
  /**
   * **6½ 位 DMM 准确度校准记录。是数据，不是物料。**
   *
   *   voltage       10–1000 V   三档（10/100/1000）
   *   error         35–100 ppm  对 7½ 的差值（6½ 的误差窗口）
   *   uncertainty   3.5–10 ppm  校准不确定度（7½ 的传递项 + 共模残余 + 噪声）
   *   points        3           三档
   *   traceability  transfer-only  没有 3.5–10 ppm 的绝对 10 V；绝对项见 7½
   *
   * ⚠️ 这是"对 7½ 的传递"，不是"对绝对 10 V 的校准"：7½ 自己也只有
   *   50–100 ppm 的绝对项（见 `mat/dmm-7half-cal-record`）。6½ 的
   *   35–100 ppm 里不含绝对项，记录上必须这样读。
   */
  {
    id: 'mat/dmm-6half-cal-record',
    name: '6½ 位 DMM 准确度校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 10, max: 1000, unit: 'V' },
      { param: 'error', kind: 'range', min: 0, max: 200, unit: 'ppm', dir: 'atMost' },
      // 生产 give 用 %：error(ppm)/1e4；35–100 ppm = 0.0035–0.01 %。
      { param: 'accuracy', kind: 'range', min: 0.0035, max: 0.01, unit: '%' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 30, unit: 'ppm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 3, max: 3, unit: '个' },
      { param: 'traceability', kind: 'enum', values: ['transfer-only', 'absolute'] },
    ],
  },

  /**
   * **7½ 位 DMM 准确度校准记录。是数据，不是物料。**
   *
   *   voltage              10–1000 V   三档
   *   error                3.5–10 ppm  对 zener + Hamon 的传递/线性
   *   uncertainty          0.5–1.3 ppm 传递链（齐纳年漂 + Hamon 自校 + 10:1）
   *   absoluteUncertainty  50–100 ppm  **绝对 10 V 只有这一档**（电压天平记录）
   *   points               3           三档
   *   traceability         transfer-only
   *
   * ⚠️ **没有 3.5–10 ppm 的绝对 10 V。** 3.5–10 ppm 是传递/线性；绝对项
   *   是 `mat/voltage-absolute-record` 的 50–100 ppm。把 3.5–10 写成绝对，
   *   就是把传递当溯源（R16）。
   */
  {
    id: 'mat/dmm-7half-cal-record',
    name: '7½ 位 DMM 准确度校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 10, max: 1000, unit: 'V' },
      { param: 'error', kind: 'range', min: 0, max: 30, unit: 'ppm', dir: 'atMost' },
      // 生产 give 用 %：error(ppm)/1e4；3.5–10 ppm = 0.00035–0.001 %。
      { param: 'accuracy', kind: 'range', min: 0.00035, max: 0.001, unit: '%' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 5, unit: 'ppm', dir: 'atMost' },
      { param: 'absoluteUncertainty', kind: 'range', min: 0, max: 200, unit: 'ppm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 3, max: 3, unit: '个' },
      { param: 'traceability', kind: 'enum', values: ['transfer-only', 'absolute'] },
    ],
  },
];

export const DMM_CAL_ROUTES: readonly Route[] = [
  {
    /**
     * **6½ 位校准：10/100/1000 V，对 7½ 读同一台源。**
     *
     *   6½ 表 1 + 7½ 表 1 + `plant/hv-test-bench` 源 1（needs）
     *   → `mat/dmm-6half-cal-record` 1 份
     *
     * 两台表并接在同一台源上：源的漂移、纹波、负载调整是共模，差值里一阶
     * 抵消；剩下的就是 6½ 的误差（35–100 ppm）+ 7½ 的传递（3.5–10 ppm）
     * + 读数噪声（0.5–2 ppm）。
     */
    id: 'measure/dmm-6half-accuracy',
    name: '6½ 位校准',
    rate: { hours: q(8) },
    produces: [
      {
        item: 'mat/dmm-6half-cal-record',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 10, max: 1000 },
          { param: 'error', kind: 'range', min: 35, max: 100 },
          // 别名：生产 give accuracy 用 %（35–100 ppm = 0.0035–0.01 %）。
          { param: 'accuracy', kind: 'range', min: 0.0035, max: 0.01 },
          { param: 'uncertainty', kind: 'range', min: 3.5, max: 10 },
          { param: 'points', kind: 'range', min: 3, max: 3 },
          { param: 'traceability', kind: 'enum', oneOf: ['transfer-only'] },
        ],
      },
    ],
    uses: [],
    needs: [
      {
        item: 'std/dmm-6half-general',
        qty: q(1),
        need: [{ param: 'accuracy', kind: 'range', min: 0.0035, max: 0.01 }],
        onRelax: 'functional-kept',
      },
      'std/dmm-7half-general',
      'plant/hv-test-bench',
      'plant/metrology-room',
    ],
    steps: [
      {
        note_zh:
          '① 10 V 档：6½ 与 7½ 并接在 6.5–7.5 V 的齐纳/源上，各读 10 次；差值 / 读数 = 6½ 的 10 V 档误差。7½ 的 3.5–10 ppm 是参考，6½ 的 35–100 ppm 是主项。',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 100 V 档：`plant/hv-test-bench` 源升到 ~100 V，两台表并接同读；源漂移共模抵消；差值 / 读数 = 6½ 的 100 V 档误差。',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 1000 V 档：源升到 ~1000 V，两台表并接同读；6½ 的 1000–1500 V 保护在这档；差值 / 读数 = 6½ 的 1000 V 档误差。**源是种子 hv-test-bench，不是精密源**——共模抵消后源只贡献 0.2–1 ppm 的残余。',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '④ 不确定度与记录：7½ 传递 3.5–10 ppm + 共模残余 0.2–1 ppm + 读数噪声 0.5–2 ppm，RSS 3.5–10 ppm；写 voltage/error/uncertainty/points/traceability。**error 35–100 ppm 是 6½ 的误差，不是绝对 10 V**。',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '6½ 表 1 台（进、出，不消耗）+ 7½ 表 1 台（进、出，不消耗）+ hv-test-bench 源 1 台（进、出，不占用）→ 校准记录 1 份；**记录是数据不是物料**，没有 kg 账。8 h 是两表预热 + 三档读数 + 写记录。',
  },

  {
    /**
     * **7½ 位校准：zener + Hamon + 10:1，对 10 V 档与 100/1000 V 分压比。**
     *
     *   7½ 表 1 + 7½ 齐纳 1 + Hamon 1 + 10:1 分压 1 + 油浴 1
     *   + `mat/voltage-absolute-record`（绝对项）
     *   → `mat/dmm-7half-cal-record` 1 份
     *
     * 10 V 档：齐纳 6.5–7.5 V 在 25.000 ±0.01 K 油浴里，7½ 读；10:1 分压
     * 核 1 V/10 V 线性；Hamon 100:1 核 100:1 比值。
     * 100/1000 V 档：用表内 10:1/100:1 分压比对外部 Hamon 核，不需要外部
     * 1000 V 源；比值 0.1–0.3 ppm 远小于 3.5–10 ppm。
     * 绝对项：`mat/voltage-absolute-record` 0.5–10 V、50–100 ppm；**3.5–10 ppm
     * 是传递，不是绝对**。
     */
    id: 'measure/dmm-7half-accuracy',
    name: '7½ 位校准',
    rate: { hours: q(12) },
    produces: [
      {
        item: 'mat/dmm-7half-cal-record',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 10, max: 1000 },
          { param: 'error', kind: 'range', min: 3.5, max: 10 },
          // 别名：生产 give accuracy 用 %（3.5–10 ppm = 0.00035–0.001 %）。
          { param: 'accuracy', kind: 'range', min: 0.00035, max: 0.001 },
          { param: 'uncertainty', kind: 'range', min: 0.5, max: 1.3 },
          { param: 'absoluteUncertainty', kind: 'range', min: 50, max: 100 },
          { param: 'points', kind: 'range', min: 3, max: 3 },
          { param: 'traceability', kind: 'enum', oneOf: ['transfer-only'] },
        ],
      },
    ],
    uses: [],
    needs: [
      {
        item: 'std/dmm-7half-general',
        qty: q(1),
        need: [{ param: 'accuracy', kind: 'range', min: 0.00035, max: 0.001 }],
        onRelax: 'functional-kept',
      },
      'std/zener-reference-7half',
      'plant/hamon-divider-7half',
      'std/divider-10to1-precision',
      'mat/voltage-absolute-record',
      'plant/precision-oil-bath',
      'plant/metrology-room',
    ],
    steps: [
      {
        note_zh:
          '① 10 V 档：齐纳 6.5–7.5 V 进 `plant/precision-oil-bath`（25.000 ±0.01 K，三只 Pt RTD 互查）；7½ 读 10 次；10:1 精密分压核 1 V/10 V 线性，Hamon 100:1 核 100:1 比值。',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 24.9, max: 25.1 }],
      },
      {
        note_zh:
          '② 100/1000 V 档：不接外部 1000 V 源——用表内 10:1/100:1 分压比对外部 Hamon（0.1–0.3 ppm）核；比值误差远小于 3.5–10 ppm，所以 100/1000 V 档的误差仍由表的线性/噪声定。',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 绝对项：取 `mat/voltage-absolute-record`（0.5–10 V、50–100 ppm，电压天平）；**3.5–10 ppm 是传递/线性，不是绝对 10 V**。绝对 10 V 只有 50–100 ppm——这一格写 absoluteUncertainty，traceability 写 transfer-only。',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '④ 不确定度与记录：齐纳年漂 0.5–1 ppm/a + Hamon 自校 0.1–0.3 ppm + 10:1 0.1–0.2 ppm，RSS 0.5–1.3 ppm（传递链）；表的线性/噪声 3–9 ppm ⇒ error 3.5–10 ppm；写 voltage/error/uncertainty/absoluteUncertainty/points/traceability。**无 3.5–10 ppm 的绝对 10 V**。',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '7½ 表 1 台（进、出，不消耗）+ 齐纳 1 只、Hamon 1 台、10:1 分压 1 件、油浴 1 台（进、出，不占用）+ absolute record 1 份 → 校准记录 1 份；**记录是数据不是物料**，没有 kg 账。12 h = 油浴稳 25.000 K 4 h + 三档读数 + 写记录。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...DMM_CAL_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...DMM_CAL_ROUTES];
