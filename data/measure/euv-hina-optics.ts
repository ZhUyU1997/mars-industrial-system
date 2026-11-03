/**
 * EUV 光学量测（R13）：干涉仪自校准、660 mm 镜面形、三平晶绝对校准、
 * CGH 相位、收集镜面形。
 *
 * 这 5 条 measure 路线与 5 个记录原先在 `data/machine/euv-hina.ts` 的
 * `EUV_HINA_ITEMS` / `EUV_HINA_ROUTES` 里；R13 只迁文件，id、窗口、数值、
 * 注释逐字不变，不新增/不删除任何 readout。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const EUV_HINA_OPTICS_ITEMS: readonly Item[] = [
  /**
   * 干涉仪自校准记录：用已知镜/球面 + CGH 零位，读系统波前与重复性。
   * 能力域 `wavefront 0–10 nm`、`repeatability 0–0.5 nm`、`aperture 0–660 mm`；
   * 不是 0.1 nm 的绝对校准。
   */
  {
    id: 'mat/euv-interferometer-cal-record',
    name: 'Interferometer Self-Calibration Record', name_zh: '干涉仪自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'wavefront', kind: 'range', min: 0, max: 10, unit: 'nm rms', dir: 'atMost' },
      // make/euv-interferometer 的 give 用 measure/figure；与 wavefront 同义，同一读数。
      { param: 'measure/figure', kind: 'range', min: 0, max: 2, unit: 'nm rms', dir: 'atMost' },
      { param: 'repeatability', kind: 'range', min: 0, max: 0.5, unit: 'nm', dir: 'atMost' },
      { param: 'aperture', kind: 'range', min: 0, max: 660, unit: 'mm' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },

  /**
   * 660 mm 镜子的 at-wavelength 面形记录。能力域 `figure 0–10 nm`、
   * `wavefront 0–20 nm`、`aperture 0–660 mm`；不是 0.1 nm 的读数。
   */
  {
    id: 'mat/euv-mirror-figure-record',
    name: 'EUV Mirror Surface Figure Record', name_zh: 'EUV 镜面形记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'figure', kind: 'range', min: 0, max: 10, unit: 'nm rms', dir: 'atMost' },
      { param: 'wavefront', kind: 'range', min: 0, max: 20, unit: 'nm rms', dir: 'atMost' },
      { param: 'aperture', kind: 'range', min: 0, max: 660, unit: 'mm' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },

  /**
   * EUV 三平晶绝对校准记录。能力域 `figure 0–2 nm`、`aperture 0–300 mm`、
   * `points 1–100`；不是 0.1 nm 读数。
   */
  {
    id: 'mat/euv-absolute-flat-record',
    name: 'EUV Three-Flat Absolute Calibration Record', name_zh: 'EUV 三平晶绝对校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'figure', kind: 'range', min: 0, max: 2, unit: 'nm rms', dir: 'atMost' },
      { param: 'aperture', kind: 'range', min: 0, max: 300, unit: 'mm' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },

  /**
   * CGH 相位误差记录：`phaseError 0–20 nm`、`aperture 0–300 mm`、`points`。
   * 相位误差 1:1 进镜子面形；不是 0.1 nm 读数。
   */
  {
    id: 'mat/cgh-phase-record',
    name: 'CGH Phase Error Record', name_zh: 'CGH 相位误差记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'phaseError', kind: 'range', min: 0, max: 20, unit: 'nm rms', dir: 'atMost' },
      // 生产 give 同名别名：CGH 零位波前（make/null-test-cgh 用 wavefront）。
      { param: 'wavefront', kind: 'range', min: 0.5, max: 2, unit: 'nm rms', dir: 'atMost' },
      { param: 'aperture', kind: 'range', min: 0, max: 300, unit: 'mm' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },

  /**
   * 收集镜 at-wavelength 面形记录：`figure 0–2 nm`、`deviation 0–2 nm`、
   * `aperture 0–300 mm`、`points`；不是 0.1 nm 读数。
   *
   * 收集镜是 φ300 椭球；`make/euv-hina-collector` 的 Hindle 球零位只到
   * 1 nm，0.1 nm 要 at-wavelength CGH 拼接。本条补的是那一步。
   */
  {
    id: 'mat/collector-figure-record',
    name: 'Collector Mirror At-Wavelength Figure Record', name_zh: '收集镜 at-wavelength 面形记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'figure', kind: 'range', min: 0, max: 2, unit: 'nm rms', dir: 'atMost' },
      { param: 'deviation', kind: 'range', min: 0, max: 2, unit: 'nm rms', dir: 'atMost' },
      { param: 'aperture', kind: 'range', min: 0, max: 300, unit: 'mm' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },
];

export const EUV_HINA_OPTICS_ROUTES: readonly Route[] = [
  {
    /**
     * **干涉仪自校准：绝对平晶 + CGH 零位 + 八帧移相。**
     *
     * 输出能力域 `wavefront 0–2 nm`、`repeatability 0.1–0.2 nm`、
     * `aperture 300 mm`、`points 10`。参考面用 `std/euv-absolute-flat`
     * 的三平晶绝对平晶（0.1–0.2 nm design），不再用 0–130 nm 的
     * `std/euv-mirror-300` 做粗校准；0.1 nm 仍是设计，不是本条读数。
     */
    id: 'measure/euv-interferometer-cal',
    name: 'Interferometer Self-Calibration', name_zh: '干涉仪自校准',
    produces: [
      {
        item: 'mat/euv-interferometer-cal-record',
        qty: q(1),
        gives: [
          { param: 'wavefront', kind: 'range', min: 0, max: 2 },
          { param: 'measure/figure', kind: 'range', min: 0, max: 2 },
          { param: 'repeatability', kind: 'range', min: 0.1, max: 0.2 },
          { param: 'aperture', kind: 'range', min: 300, max: 300 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/euv-absolute-flat', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: '装绝对平晶到 0.5 nm 台；CGH 零位对准，零条纹 ≤1/20',
        performedBy: 'plant/euv-interferometer',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: '八帧移相；读系统波前与重复性；绝对平晶 0.1–0.2 nm design 进账',
        performedBy: 'plant/phase-shifter',
      },
      {
        note_zh: '写能力域 wavefront 0–2 nm、repeatability 0.1–0.2 nm；不写 0.1 nm 绝对校准',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '参考镜 1 件（不消耗）→ 自校准记录 1 份；记录是数据不是物料。',
  },
  {
    /**
     * **660 mm 镜子的 at-wavelength 面形：CGH 零位 + 300 mm 子孔径拼接。**
     *
     * 输出能力域 `figure 0–1 nm`、`wavefront 0–5 nm`、`aperture 300–660 mm`、
     * `points 10`；不是 0.1 nm 读数。0.1 nm 要绝对标准镜与全口径拼接，
     * 本条只到 0.2–1 nm 档。
     */
    id: 'measure/euv-mirror-figure',
    name: 'EUV Mirror Surface Figure Measurement', name_zh: 'EUV 镜面形测量',
    produces: [
      {
        item: 'mat/euv-mirror-figure-record',
        qty: q(1),
        gives: [
          { param: 'figure', kind: 'range', min: 0.2, max: 1 },
          { param: 'wavefront', kind: 'range', min: 0.5, max: 2 },
          { param: 'aperture', kind: 'range', min: 300, max: 660 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: ['plant/euv-stepper-hina/mirror-blank', 'plant/metrology-room'],
    rate: { hours: q(48) },
    steps: [
      {
        note_zh: '装 660 mm 镜子到拼接台；CGH 零位对准，子孔径 300 mm',
        performedBy: 'plant/euv-interferometer',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: '八帧移相逐子孔径读；拼接残差与复装 10 nm 进系统差',
        performedBy: 'plant/phase-shifter',
      },
      {
        note_zh: '算 figure/wavefront；写能力域 0.2–1 nm，不写 0.1 nm 读数',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '水 1 kg → 面形记录 1 份；镜子与 CGH 是量具/样品，记录是数据不是物料。',
  },
  {
    /**
     * **EUV 三平晶绝对校准：A-B、A-C、B-C 三对，解出每块的绝对面形。**
     *
     * 不用已知标准镜；三块平晶两两干涉，联立解出各自的面形（三平晶法）。
     * 输出能力域 `figure 0–2 nm`、`aperture 300 mm`、`points 10`；
     * 0.1 nm 是设计，不是本条读数。三块必须同炉镀、同批装夹。
     */
    id: 'measure/euv-three-flat-absolute',
    name: 'EUV Three-Flat Absolute Calibration', name_zh: 'EUV 三平晶绝对校准',
    produces: [
      {
        item: 'mat/euv-absolute-flat-record',
        qty: q(1),
        gives: [
          { param: 'figure', kind: 'range', min: 0.2, max: 1 },
          { param: 'aperture', kind: 'range', min: 300, max: 300 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/euv-absolute-flat', qty: q(3) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(36) },
    steps: [
      {
        note_zh: '装 A/B 两块，CGH 零位，读 A-B 干涉图；19–21 °C',
        performedBy: 'plant/euv-interferometer',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: '换 A-C、B-C 各读一次；三对解三块绝对面形',
        performedBy: 'plant/phase-shifter',
      },
      {
        note_zh: '合账写能力域 figure 0.2–1 nm；不写 0.1 nm 读数',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '三块平晶（不消耗）→ 绝对校准记录 1 份；记录是数据不是物料。',
  },
  {
    /**
     * **CGH 相位误差：绝对平晶做参考，测 CGH 零位波前，再减设计相位。**
     *
     * CGH 的相位误差 1:1 进镜子面形；写机定位 5–10 nm、刻蚀侧壁 60–80°
     * 是底。输出能力域 `phaseError 0.5–2 nm`、`aperture 300 mm`、`points 10`；
     * 不是 0.1 nm 读数。CGH 与平晶都是 300 mm 口径内的子孔径。
     */
    id: 'measure/cgh-phase',
    name: 'CGH Phase Error Measurement', name_zh: 'CGH 相位误差测量',
    produces: [
      {
        item: 'mat/cgh-phase-record',
        qty: q(1),
        gives: [
          { param: 'phaseError', kind: 'range', min: 0.5, max: 2 },
          { param: 'wavefront', kind: 'range', min: 0.5, max: 2 },
          { param: 'aperture', kind: 'range', min: 300, max: 300 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/euv-cgh-null', qty: q(1) }] },
      { anyOf: [{ item: 'std/euv-absolute-flat', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: '装绝对平晶 + CGH 零位；八帧移相读 CGH 波前；19–21 °C',
        performedBy: 'plant/euv-interferometer',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: '减设计相位，得 CGH 相位误差图；写能力域 0.5–2 nm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: 'CGH 1 + 平晶 1（不消耗）→ 相位误差记录 1 份；记录是数据不是物料。',
  },
  {
    /**
     * **收集镜 at-wavelength 面形：φ300 椭球 + CGH 零位 + 拼接。**
     *
     * 输出能力域 `figure 0.2–1 nm`、`deviation 0.2–1 nm`、`aperture 300 mm`、
     * `points 10`；不是 0.1 nm 读数。Hindle 球零位只到 1 nm；0.1 nm 要
     * CGH 相位误差先标定（`measure/cgh-phase`），再拼接。
     */
    id: 'measure/collector-figure',
    name: 'Collector Mirror At-Wavelength Figure Measurement', name_zh: '收集镜 at-wavelength 面形测量',
    produces: [
      {
        item: 'mat/collector-figure-record',
        qty: q(1),
        gives: [
          { param: 'figure', kind: 'range', min: 0.2, max: 1 },
          { param: 'deviation', kind: 'range', min: 0.2, max: 1 },
          { param: 'aperture', kind: 'range', min: 300, max: 300 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/euv-source/collector', qty: q(1) }] },
      { anyOf: [{ item: 'std/euv-cgh-null', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(36) },
    steps: [
      {
        note_zh: '装 φ300 椭球到拼接台；CGH 零位对准，零条纹 ≤1/20',
        performedBy: 'plant/euv-interferometer',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: '八帧移相逐子孔径读；拼接 + CGH 相位修正；1 nm 是 Hindle 球的底',
        performedBy: 'plant/phase-shifter',
      },
      {
        note_zh: '写能力域 figure 0.2–1 nm、deviation 0.2–1 nm；不写 0.1 nm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '收集镜 1 + CGH 1（不消耗）→ 面形记录 1 份；记录是数据不是物料。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...EUV_HINA_OPTICS_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...EUV_HINA_OPTICS_ROUTES];
