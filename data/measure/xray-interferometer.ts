/**
 * X 射线干涉仪/衍射/管/探测器/高压的五条测量路线与记录（R13）。
 *
 * 从 `data/machine/xray-interferometer.ts` 迁入，id、窗口、数值均不变；
 * 机器文件只保留条目与生产路线。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DATA_ITEMS: readonly Item[] = [
  /**
   * X 射线干涉仪自校准记录：`resolution 0.005–0.02 nm`、`stability 0.02–0.05 K`、
   * `beam 0.05–0.1 mm`、`points`；不是 10 pm 的实测。
   */
  {
    id: 'mat/xray-cal-record',
    name: 'X 射线干涉仪自校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 0, max: 1, unit: 'nm', dir: 'atMost' },
      { param: 'stability', kind: 'range', min: 0, max: 1, unit: 'K', dir: 'atMost' },
      { param: 'beam', kind: 'range', min: 0.05, max: 0.1, unit: 'mm' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },

  /**
   * 摇摆曲线记录：`tiltError 0–100 角秒`、`fwhm 0–200 角秒`、`points`。
   */
  {
    id: 'mat/xray-rocking-record',
    name: '摇摆曲线记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'tiltError', kind: 'range', min: 0, max: 100, unit: '角秒', dir: 'atMost' },
      { param: 'fwhm', kind: 'range', min: 0, max: 200, unit: '角秒' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },

  /**
   * X 射线管焦斑记录：`focalSpot 0.05–0.5 mm`、`power 0–100 W`、`stability 0–2 %`。
   * 焦斑是干涉仪/衍射仪空间分辨的源头；不是 0.1 mm 的实测。
   */
  {
    id: 'mat/xray-tube-spot-record',
    name: 'X 射线管焦斑记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'focalSpot', kind: 'range', min: 0, max: 2, unit: 'mm', dir: 'atMost' },
      { param: 'power', kind: 'range', min: 0, max: 200, unit: 'W', dir: 'atMost' },
      { param: 'stability', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },

  /**
   * X 射线探测器记录：`efficiency 0.2–0.8`、`linearity 1–5 %`、`darkCount 0–10 cps`。
   */
  {
    id: 'mat/xray-detector-record',
    name: 'X 射线探测器记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'efficiency', kind: 'range', min: 0, max: 1, unit: '1' },
      { param: 'linearity', kind: 'range', min: 0, max: 10, unit: '%', dir: 'atMost' },
      { param: 'darkCount', kind: 'range', min: 0, max: 100, unit: 'cps', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },

  /**
   * X 射线高压记录：`voltage 20–60 kV`、`ripple 0–1 %`、`stability 0–0.1 %`。
   */
  {
    id: 'mat/xray-hv-record',
    name: 'X 射线高压记录',
    unit: '份',
    category: 'part',
    props: [
      // 资格带：只保留生产 give 能接收的 30–60 kV / 纹波 ≤0.5 % 段；
      // 原始测量范围 20–60 kV / 0–1 % 里低于 30 kV、纹波 >0.5 % 的点不合格，
      // 不写进这条“可交付”记录（见 measure/xray-hv 注释）。
      { param: 'voltage', kind: 'range', min: 30, max: 60, unit: 'kV' },
      { param: 'ripple', kind: 'range', min: 0, max: 0.5, unit: '%', dir: 'atMost' },
      { param: 'stability', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },
];

export const DATA_ROUTES: readonly Route[] = [
  {
    /**
     * **X 射线干涉仪自校准：220 晶格条纹 + 相位噪声 + 罩内温度。**
     *
     * 输出能力域 `resolution 0.005–0.02 nm`、`stability 0.02–0.05 K`、
     * `beam 0.05–0.1 mm`、`points 10`；不是 10 pm 的实测。
     */
    id: 'measure/xray-interferometer-cal',
    name: 'X 射线干涉仪自校准',
    produces: [
      {
        item: 'mat/xray-cal-record',
        qty: q(1),
        gives: [
          { param: 'resolution', kind: 'range', min: 0.005, max: 0.01 },
          { param: 'stability', kind: 'range', min: 0.02, max: 0.05 },
          { param: 'beam', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [],
    needs: [
      {
        item: 'plant/xray-interferometer',
        qty: q(1),
        need: [
          { param: 'resolution', kind: 'range', min: 0.005, max: 0.01 },
          { param: 'stability', kind: 'range', min: 0.02, max: 0.05 },
          { param: 'beam', kind: 'range', min: 0.05, max: 0.1 },
        ],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(12) },
    steps: [
      {
        note_zh: '220 晶格条纹（0.31356 nm）+ 八帧移相；相位噪声 0.025 条纹',
        performedBy: 'plant/xray-interferometer',
      },
      {
        note_zh: '罩内温度 0.02–0.05 K；读 10 点；写能力域，不写 10 pm 已测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '干涉仪 1 台（进、出，不消耗）+ 计量间 1 间（进、出，不占用）→ 校准记录 1 份；记录是数据不是物料。',
  },
  {
    /**
     * **晶体摇摆曲线：三片 lamellae 的 tiltError/FWHM。**
     */
    id: 'measure/xray-rocking-curve',
    name: '摇摆曲线测量',
    produces: [
      {
        item: 'mat/xray-rocking-record',
        qty: q(1),
        gives: [
          { param: 'tiltError', kind: 'range', min: 2, max: 20 },
          { param: 'fwhm', kind: 'range', min: 10, max: 100 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/xray-interferometer/crystal', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh: '装晶体到衍射仪；(111) 峰扫摇摆曲线',
        performedBy: 'plant/xray-diffractometer',
      },
      {
        note_zh: '峰位定晶向、峰形定 tiltError/FWHM；写能力域 2–20 角秒',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '晶体 1（不消耗）→ 摇摆曲线记录 1 份；记录是数据不是物料。',
  },
  {
    /**
     * **X 射线管焦斑：针孔/刀口扫描。**
     *
     * 输出能力域 `focalSpot 0.05–0.5 mm`、`power 0–100 W`、`stability 0–2 %`、
     * `points 10`；不是 0.1 mm 的实测。
     */
    id: 'measure/xray-tube-spot',
    name: 'X 射线管焦斑测量',
    produces: [
      {
        item: 'mat/xray-tube-spot-record',
        qty: q(1),
        gives: [
          { param: 'focalSpot', kind: 'range', min: 0.05, max: 0.5 },
          { param: 'power', kind: 'range', min: 0, max: 100 },
          { param: 'stability', kind: 'range', min: 0, max: 2 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/xray-interferometer/tube', qty: q(1) }] },
      { anyOf: [{ item: 'plant/xray-interferometer/detector', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/xray-interferometer', 'plant/power-standard-100w'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh: '针孔/刀口扫描焦斑；功率/稳定度同步读',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '写能力域 0.05–0.5 mm/0–100 W/0–2 %；不写 0.1 mm 已测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '管 1 + 探测器 1（不消耗）→ 焦斑记录 1 份；记录是数据不是物料。',
  },
  {
    /**
     * **X 射线探测器效率/线性/暗计数。**
     *
     * 输出能力域 `efficiency 0.2–0.8`、`linearity 1–5 %`、`darkCount 0–10 cps`、
     * `points 10`；不是 25 % 的已测读数。
     */
    id: 'measure/xray-detector',
    name: 'X 射线探测器测量',
    produces: [
      {
        item: 'mat/xray-detector-record',
        qty: q(1),
        gives: [
          { param: 'efficiency', kind: 'range', min: 0.2, max: 0.8 },
          { param: 'linearity', kind: 'range', min: 1, max: 5 },
          { param: 'darkCount', kind: 'range', min: 0, max: 10 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/xray-interferometer/detector', qty: q(1) }] },
      { anyOf: [{ item: 'plant/xray-interferometer/tube', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/efficiency-standard'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh: '管 Kα + 已知铝衰减片；计数率 vs 衰减片厚度 → 效率',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '变管流读线性；遮光读暗计数；写能力域 0.2–0.8/1–5 %/0–10 cps',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '管 1 + 探测器 1（不消耗）→ 探测器记录 1 份；记录是数据不是物料。',
  },
  {
    /**
     * **X 射线高压：分压器 + DVM 读电压/纹波/稳定度。**
     *
     * 输出能力域 `voltage 20–60 kV`、`ripple 0–1 %`、`stability 0–0.1 %`、
     * `points 10`；不是 60 kV/0.1 % 的已测读数。
     */
    id: 'measure/xray-hv',
    name: 'X 射线高压测量',
    produces: [
      {
        item: 'mat/xray-hv-record',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 30, max: 60 },
          { param: 'ripple', kind: 'range', min: 0, max: 0.5 },
          { param: 'stability', kind: 'range', min: 0, max: 0.1 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/xray-interferometer/hv', qty: q(1) }] },
      { anyOf: [{ item: 'std/divider-100to1-precision', qty: q(1) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/xray-interferometer'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh: '100:1 分压器 + DVM；20–60 kV 逐点读，纹波/稳定度',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '写能力域 20–60 kV/0–1 %/0–0.1 %；不写 60 kV 已测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '高压 1 + 分压器 1 + DVM 1（不消耗）→ 高压记录 1 份；记录是数据不是物料。',
  },
];
