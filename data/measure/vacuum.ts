/**
 * 真空侧的 commissioning 记录：蒸发台自带泵组能抽到哪一档。
 *
 * 蒸发台的泵组是水环 + 两级罗茨，本底落在 0.5–5 Pa；表只有皮拉尼
 * 0.1–100 Pa 一档，1e-3–1e-2 Pa 的镀膜窗口既抽不到、也读不到。所以这条
 * 路线记的是**粗抽本底**：由压降曲线末端斜率外推，外推值与不确定度一起写，
 * 不把它写成直读。
 *
 * 结论直接用于镀膜路线：要 1e-3–1e-2 Pa，蒸发台只做粗抽，高真空另接
 * `plant/euv-vacuum`（涡轮 + 冷阱，1e-8–1 Pa）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const VACUUM_MEASURE_ITEMS: readonly Item[] = [
  /**
   * 蒸发台粗抽本底记录。**一份记录对应一次抽气。**
   *
   *   basePressure  0.5–5 Pa       压降曲线外推值，不是表直读
   *   leakRate      1e-5–1e-4 Pa·L/s  关阀压升折算
   *   pumpdownTime  20–40 min      抽到皮拉尼下限量程 0.1 Pa 的时间
   *   method        pumpdown-extrapolation
   *
   * ⚠️ 本底一栏是外推：0.5–5 Pa 已在皮拉尼表程（0.1–100 Pa）下沿之外，
   *    不确定度按 ×2 记。1e-3–1e-2 Pa 不在自带泵组的能力内，别拿这条记录去背书。
   */
  {
    id: 'mat/evaporator-base-pressure-record',
    name: '蒸发台粗抽本底记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'basePressure', kind: 'range', min: 0.5, max: 5, unit: 'Pa' },
      // 生产 give 同名别名：本底压力（evaporator 用 pressure）。
      { param: 'pressure', kind: 'range', min: 0.5, max: 5, unit: 'Pa' },
      { param: 'leakRate', kind: 'range', min: 1e-5, max: 1e-4, unit: 'Pa·L/s' },
      { param: 'pumpdownTime', kind: 'range', min: 20, max: 40, unit: 'min' },
      { param: 'method', kind: 'enum', values: ['pumpdown-extrapolation'] },
    ],
  },
];

export const VACUUM_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **蒸发台粗抽本底：抽气曲线 + 关阀压升 → 外推。**
     *
     * 三步：
     *   ① 空腔抽 30 min，皮拉尼每 2 min 记一点；
     *   ② 关主阀 10 min 量压升，按 Δp·V/Δt 折算漏率（腔体按 0.03 m³）；
     *   ③ 取压降末端斜率外推本底，与表程下限比较，给出差多少倍。
     *
     * 表只到 0.1 Pa，所以 0.5–5 Pa 是外推值；这一步的意义是把"泵只能粗抽"
     * 写成可核对的数，而不是让镀膜窗口一直挂着 design。
     */
    id: 'measure/evaporator-base-pressure',
    name: '蒸发台粗抽本底测量',
    produces: [
      {
        item: 'mat/evaporator-base-pressure-record',
        qty: q(1),
        gives: [
          { param: 'basePressure', kind: 'range', min: 0.5, max: 5 },
          { param: 'pressure', kind: 'range', min: 0.5, max: 5 },
          { param: 'leakRate', kind: 'range', min: 1e-5, max: 1e-4 },
          { param: 'pumpdownTime', kind: 'range', min: 20, max: 40 },
          { param: 'method', kind: 'enum', oneOf: ['pumpdown-extrapolation'] },
        ],
      },
    ],
    uses: [],
    needs: [
      // 被校机器：镀膜腔；窗口落在机器 0.001–10 Pa 内（0.5–5 Pa 是表程外推段）。
      { item: 'plant/evaporator', qty: q(1), need: [{ param: 'pressure', kind: 'range', min: 0.5, max: 5 }], onRelax: 'functional-kept' },
      'plant/metrology-room',
      'plant/leak-rate-standard',
    ],
    rate: { hours: q(2) },
    steps: [
      {
        note_zh: '空腔抽气 30 min，皮拉尼 0.1–100 Pa 段每 2 min 记一点，画压降曲线',
        performedBy: 'plant/evaporator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '关主阀 10 min 量压升；腔体按 0.03 m³，Δp·V/Δt 折算漏率',
        performedBy: 'plant/evaporator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '压降末端斜率外推本底 0.5–5 Pa（表程之下，不确定度 ×2）；与 1e-3–1e-2 Pa 的镀膜窗口比较，差 100–1000 倍',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...VACUUM_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...VACUUM_MEASURE_ROUTES];
