/**
 * EUV 杂项量测（R13）：IBF 去除函数、CCP 抛光机校准、静压转台校准、
 * 精密主轴跳动。
 *
 * 这 4 条 measure 路线与 4 个记录原先在 `data/machine/euv-hina.ts` 的
 * `EUV_HINA_ITEMS` / `EUV_HINA_ROUTES` 里；R13 只迁文件，id、窗口、数值、
 * 注释逐字不变，不新增/不删除任何 readout。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const EUV_HINA_MISC_ITEMS: readonly Item[] = [
  /**
   * IBF 去除函数记录：`depth 0–200 nm`、`sigma 5–50 mm`、`peakRate 0.01–10 nm/s`。
   * 去除函数是 IBF 的“刀”：高斯/超高斯拟合的 σ 与峰值速率决定驻留图。
   */
  {
    id: 'mat/ibf-removal-record',
    name: 'IBF Removal Function Record', name_zh: 'IBF 去除函数记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'depth', kind: 'range', min: 0, max: 200, unit: 'nm', dir: 'atMost' },
      { param: 'sigma', kind: 'range', min: 5, max: 50, unit: 'mm' },
      { param: 'peakRate', kind: 'range', min: 0.01, max: 10, unit: 'nm/s' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },

  /**
   * 抛光机校准记录：`position 0.5–2 µm`、`pressure 0.05–1 psi`、`spindle 10–200 rpm`。
   */
  {
    id: 'mat/ccp-cal-record',
    name: 'Polishing Machine Calibration Record', name_zh: '抛光机校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'position', kind: 'range', min: 0.5, max: 2, unit: 'µm', dir: 'atMost' },
      { param: 'pressure', kind: 'range', min: 0.05, max: 1, unit: 'psi' },
      { param: 'spindle', kind: 'range', min: 10, max: 200, unit: 'rpm' },
      { param: 'points', kind: 'range', min: 10, max: 10, unit: '点' },
    ],
  },

  /**
   * 转台记录：`axial/radial 0.1–1 µm`、`angle 1–2 角秒`。
   */
  {
    id: 'mat/rotary-table-record',
    name: 'Rotary Table Record', name_zh: '转台记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'axial', kind: 'range', min: 0, max: 10, unit: 'µm', dir: 'atMost' },
      { param: 'radial', kind: 'range', min: 0, max: 10, unit: 'µm', dir: 'atMost' },
      { param: 'angle', kind: 'range', min: 0, max: 20, unit: '角秒', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },

  /**
   * 主轴跳动记录：`radial/axial 0.1–1 µm`、`speed 10–200 rpm`。
   */
  {
    id: 'mat/spindle-runout-record',
    name: 'Spindle Runout Record', name_zh: '主轴跳动记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'radial', kind: 'range', min: 0, max: 5, unit: 'µm', dir: 'atMost' },
      { param: 'axial', kind: 'range', min: 0, max: 5, unit: 'µm', dir: 'atMost' },
      { param: 'speed', kind: 'range', min: 0, max: 300, unit: 'rpm' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },
];

export const EUV_HINA_MISC_ROUTES: readonly Route[] = [
  {
    /**
     * **IBF 去除函数：已知驻留 → 台阶 → AFM/干涉仪拟合 σ。**
     *
     * 输出能力域 `depth 1–20 nm`、`sigma 10–30 mm`、`peakRate 0.1–1 nm/s`、
     * `points 10`；不是 0.1 nm 面形的实测。
     */
    id: 'measure/ibf-removal',
    name: 'IBF Removal Function Measurement', name_zh: 'IBF 去除函数测量',
    produces: [
      {
        item: 'mat/ibf-removal-record',
        qty: q(1),
        gives: [
          { param: 'depth', kind: 'range', min: 1, max: 20 },
          { param: 'sigma', kind: 'range', min: 10, max: 30 },
          { param: 'peakRate', kind: 'range', min: 0.1, max: 1 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh: '装硅片到 IBF 台；固定驻留 20 s、600–900 eV、0.05–0.5 Pa',
        performedBy: 'plant/ion-beam-figuring',
        under: [{ param: 'pressure', min: 0.05, max: 0.5 }],
      },
      {
        note_zh: 'AFM/干涉仪读去除台阶轮廓；拟合 σ/峰值速率',
        performedBy: 'plant/afm',
      },
      {
        note_zh: '写能力域 1–20 nm/10–30 mm/0.1–1 nm/s；不写 0.1 nm 已测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '硅片 1 + 水 1 → 去除函数记录 1 份；硅片是样品，记录是数据不是物料。',
  },
  {
    /**
     * **抛光机校准：位置/压力/转速。**
     */
    id: 'measure/ccp-calibration',
    name: 'Polishing Machine Calibration', name_zh: '抛光机校准',
    produces: [
      {
        item: 'mat/ccp-cal-record',
        qty: q(1),
        gives: [
          { param: 'position', kind: 'range', min: 0.5, max: 2 },
          { param: 'pressure', kind: 'range', min: 0.05, max: 1 },
          { param: 'spindle', kind: 'range', min: 10, max: 200 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [],
    needs: [
      {
        item: 'plant/ccp-polisher',
        qty: q(1),
        need: [
          { param: 'position', kind: 'range', min: 0.5, max: 1 },
          { param: 'pressure', kind: 'range', min: 0.05, max: 1 },
          { param: 'spindle', kind: 'range', min: 10, max: 200 },
        ],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: '干涉仪/测力计/转速表读位置/压力/转速；5 轴重复性',
        performedBy: 'plant/ccp-polisher',
      },
      {
        note_zh: '写能力域 0.5–2 µm/0.05–1 psi/10–200 rpm；不写 0.1 nm 已测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '抛光机 1 台（进、出，不消耗）+ 计量间 1 间（进、出，不占用）→ 校准记录 1 份；记录是数据不是物料。',
  },
  {
    /**
     * **转台校准：轴向/径向/角。**
     */
    id: 'measure/rotary-table-cal',
    name: 'Rotary Table Calibration', name_zh: '转台校准',
    produces: [
      {
        item: 'mat/rotary-table-record',
        qty: q(1),
        gives: [
          { param: 'axial', kind: 'range', min: 0.1, max: 1 },
          { param: 'radial', kind: 'range', min: 0.1, max: 1 },
          { param: 'angle', kind: 'range', min: 1, max: 2 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/hydrostatic-rotary-table-660', qty: q(1) }] }],
    needs: ['std/autocollimator-precision', 'plant/metrology-room', 'plant/angle-standard'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: '千分表读轴向/径向；自准直仪读角；转 0/90/180/270',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '写能力域 0.1–1 µm/1–2 角秒；不写 0.1 µm 已测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '转台 1（不消耗）+ 自准直仪 1 → 记录 1 份；记录是数据不是物料。',
  },
  {
    /**
     * **主轴跳动：电容传感器 + 千分表。**
     */
    id: 'measure/spindle-runout',
    name: 'Spindle Runout Measurement', name_zh: '主轴跳动测量',
    produces: [
      {
        item: 'mat/spindle-runout-record',
        qty: q(1),
        gives: [
          { param: 'radial', kind: 'range', min: 0.1, max: 1 },
          { param: 'axial', kind: 'range', min: 0.1, max: 1 },
          { param: 'speed', kind: 'range', min: 10, max: 200 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/precision-spindle', qty: q(1) }] },
      { anyOf: [{ item: 'plant/pzt-stage/capacitive-sensor', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/ccp-polisher'],
    rate: { hours: q(12) },
    steps: [
      {
        note_zh: '电容传感器/千分表读径向/轴向跳动；10–200 rpm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '写能力域 0.1–1 µm/10–200 rpm；不写 0.1 µm 已测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '主轴 1 + 传感器 1（不消耗）→ 记录 1 份；记录是数据不是物料。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...EUV_HINA_MISC_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...EUV_HINA_MISC_ROUTES];
