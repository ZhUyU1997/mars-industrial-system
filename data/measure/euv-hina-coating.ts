/**
 * EUV 铜镜/窗口/离子束量测（R13）：10.6 µm 铜镜、铜 OAP、ZnSe 窗口、
 * 铜输出耦合镜、IBF 束流。
 *
 * 这 5 条 measure 路线与 5 个记录原先在 `data/machine/euv-hina.ts` 的
 * `EUV_HINA_ITEMS` / `EUV_HINA_ROUTES` 里；R13 只迁文件，id、窗口、数值、
 * 注释逐字不变，不新增/不删除任何 readout。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const EUV_HINA_COATING_ITEMS: readonly Item[] = [
  /**
   * 铜镜记录：`roughness 10–50 nm`、`figure 50–200 nm`、`reflectivity 0.9–0.99`。
   */
  {
    id: 'mat/copper-mirror-record',
    name: '铜镜记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'roughness', kind: 'range', min: 0, max: 200, unit: 'nm rms', dir: 'atMost' },
      { param: 'figure', kind: 'range', min: 0, max: 500, unit: 'nm rms', dir: 'atMost' },
      { param: 'reflectivity', kind: 'range', min: 0, max: 1, unit: '1' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },

  /**
   * OAP 记录：`roughness 10–50 nm`、`figure 50–200 nm`、`reflectivity 0.9–0.99`。
   */
  {
    id: 'mat/oap-record',
    name: 'OAP 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'roughness', kind: 'range', min: 0, max: 200, unit: 'nm rms', dir: 'atMost' },
      { param: 'figure', kind: 'range', min: 0, max: 500, unit: 'nm rms', dir: 'atMost' },
      { param: 'reflectivity', kind: 'range', min: 0, max: 1, unit: '1' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },

  /**
   * ZnSe 窗口记录：`transmission 0.85–0.97`、`absorption 0.1–1 %/cm`、
   * `roughness 1–5 nm`、`flatness 50–200 nm`、`points`。
   */
  {
    id: 'mat/znse-window-record',
    name: 'ZnSe 窗口传输/吸收记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'transmission', kind: 'range', min: 0, max: 1, unit: '1' },
      { param: 'absorption', kind: 'range', min: 0, max: 5, unit: '%/cm', dir: 'atMost' },
      { param: 'roughness', kind: 'range', min: 0, max: 50, unit: 'nm rms', dir: 'atMost' },
      { param: 'flatness', kind: 'range', min: 0, max: 500, unit: 'nm rms', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },

  /**
   * 输出耦合镜记录：`hole 0–50 mm`、`reflectivity 0–1`、`roughness 0–200 nm`。
   */
  {
    id: 'mat/output-coupler-record',
    name: '输出耦合镜记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'hole', kind: 'range', min: 5, max: 20, unit: 'mm' },
      { param: 'reflectivity', kind: 'range', min: 0, max: 1, unit: '1' },
      { param: 'roughness', kind: 'range', min: 0, max: 200, unit: 'nm rms', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },

  /**
   * IBF 束流记录：`beamCurrent 0–2 A`、`uniformity 0–20 %`、`energy 300–1500 eV`。
   */
  {
    id: 'mat/ibf-beam-record',
    name: 'IBF 束流记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'beamCurrent', kind: 'range', min: 0, max: 2, unit: 'A', dir: 'atMost' },
      { param: 'uniformity', kind: 'range', min: 0, max: 20, unit: '%', dir: 'atMost' },
      { param: 'energy', kind: 'range', min: 300, max: 1500, unit: 'eV' },
      // 生产 give 用 beamEnergy；与 energy 同窗（600–900 eV 的离子源束能）。
      { param: 'beamEnergy', kind: 'range', min: 600, max: 900, unit: 'eV' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },
];

export const EUV_HINA_COATING_ROUTES: readonly Route[] = [
  {
    /**
     * **铜镜记录：AFM 粗糙度 + 干涉仪面形 + 10.6 µm 反射率。**
     *
     * 能力域 `roughness 10–50 nm`、`figure 50–200 nm`、`reflectivity 0.9–0.99`；
     * 不是 0.98/10 nm 的实测读数。
     */
    id: 'measure/copper-mirror-10.6',
    name: '铜镜测量',
    produces: [
      {
        item: 'mat/copper-mirror-record',
        qty: q(1),
        gives: [
          { param: 'roughness', kind: 'range', min: 10, max: 50 },
          { param: 'figure', kind: 'range', min: 50, max: 200 },
          { param: 'reflectivity', kind: 'range', min: 0.9, max: 0.99 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/copper-mirror-10.6', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: 'AFM 读 roughness：5 点；z 噪声 0.05 nm',
        performedBy: 'plant/afm',
      },
      {
        note_zh: '干涉仪读 figure；10.6 µm 反射率用 FTIR 附件',
        performedBy: 'plant/interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '写能力域 10–50 nm/50–200 nm/0.9–0.99；不写 0.98/10 nm 已测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '铜镜 1（不消耗）→ 记录 1 份；记录是数据不是物料。',
  },
  {
    /**
     * **OAP 记录：AFM 粗糙度 + 干涉仪面形 + 10.6 µm 反射率。**
     */
    id: 'measure/copper-oap-10.6',
    name: 'OAP 测量',
    produces: [
      {
        item: 'mat/oap-record',
        qty: q(1),
        gives: [
          { param: 'roughness', kind: 'range', min: 10, max: 50 },
          { param: 'figure', kind: 'range', min: 50, max: 200 },
          { param: 'reflectivity', kind: 'range', min: 0.9, max: 0.99 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/copper-oap-10.6', qty: q(1) }] }],
    needs: ['plant/metrology-room', 'plant/interferometer'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: 'AFM 读 roughness；干涉仪读 OAP 面形；10.6 µm 反射率',
        performedBy: 'plant/afm',
      },
      {
        note_zh: '写能力域 10–50 nm/50–200 nm/0.9–0.99；不写 0.98/10 nm 已测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: 'OAP 1（不消耗）→ 记录 1 份；记录是数据不是物料。',
  },
  {
    /**
     * **ZnSe 窗口记录：FTIR 透射/吸收 + AFM 粗糙度 + 干涉仪面形。**
     */
    id: 'measure/znse-window',
    name: 'ZnSe 窗口传输/吸收测量',
    produces: [
      {
        item: 'mat/znse-window-record',
        qty: q(1),
        gives: [
          { param: 'transmission', kind: 'range', min: 0.85, max: 0.97 },
          { param: 'absorption', kind: 'range', min: 0.1, max: 1 },
          { param: 'roughness', kind: 'range', min: 1, max: 5 },
          { param: 'flatness', kind: 'range', min: 50, max: 200 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/znse-window', qty: q(1) }] }],
    needs: ['plant/metrology-room', 'plant/afm'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: 'FTIR 读 10.6 µm 透射/吸收；AFM 读粗糙度；干涉仪读面形',
        performedBy: 'plant/ftir',
      },
      {
        note_zh: '写能力域 0.85–0.97/0.1–1 %/cm/1–5 nm/50–200 nm；不写 20 kW 已测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '窗口 1（不消耗）→ 记录 1 份；记录是数据不是物料。',
  },
  {
    /**
     * **输出耦合镜记录：孔 + 反射率 + 粗糙度。**
     */
    id: 'measure/copper-output-coupler',
    name: '输出耦合镜测量',
    produces: [
      {
        item: 'mat/output-coupler-record',
        qty: q(1),
        gives: [
          { param: 'hole', kind: 'range', min: 5, max: 20 },
          { param: 'reflectivity', kind: 'range', min: 0.6, max: 0.9 },
          { param: 'roughness', kind: 'range', min: 10, max: 50 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/copper-output-coupler-10.6', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: '影像仪/CD-SEM 读孔；AFM 读粗糙度；FTIR 读反射率',
        performedBy: 'plant/afm',
      },
      {
        note_zh: '写能力域 5–20 mm/0.6–0.9/10–50 nm；不写 20 kW 已测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '耦合镜 1（不消耗）→ 记录 1 份；记录是数据不是物料。',
  },
  {
    /**
     * **IBF 束流：束流/均匀性/能量，剖面仪扫描。**
     *
     * 输出能力域 `beamCurrent 0–2 A`、`uniformity 1–20 %`、`energy 600–900 eV`、
     * `points 10`；不是 0.1 nm 去除函数的实测。
     */
    id: 'measure/ibf-beam',
    name: 'IBF 束流测量',
    produces: [
      {
        item: 'mat/ibf-beam-record',
        qty: q(1),
        gives: [
          { param: 'beamCurrent', kind: 'range', min: 0, max: 2 },
          { param: 'uniformity', kind: 'range', min: 1, max: 20 },
          { param: 'energy', kind: 'range', min: 600, max: 900 },
          // 别名：生产 give 用 beamEnergy；本条读数 600–900 eV。
          { param: 'beamEnergy', kind: 'range', min: 600, max: 900 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/ion-beam-figuring/source', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: '装源到剖面仪；束流 0–2 A、能量 600–900 eV',
        performedBy: 'plant/ion-beam-profiler',
      },
      {
        note_zh: '扫 50–100 mm 剖面；均匀性/束流漂移',
        performedBy: 'plant/ion-beam-profiler',
      },
      {
        note_zh: '写能力域 0–2 A/1–20 %/600–900 eV；不写 0.1 nm 已测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '源 1 + 水 10 → 束流记录 1 份；记录是数据不是物料。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...EUV_HINA_COATING_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...EUV_HINA_COATING_ROUTES];
