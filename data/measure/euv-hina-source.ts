/**
 * EUV 源/激光量测（R13）：源光谱/etendue、液滴尺寸/速度、碎屑寿命、
 * 激光聚焦/指向、激光功率。
 *
 * 这 5 条 measure 路线与 5 个记录原先在 `data/machine/euv-hina.ts` 的
 * `EUV_HINA_ITEMS` / `EUV_HINA_ROUTES` 里；R13 只迁文件，id、窗口、数值、
 * 注释逐字不变，不新增/不删除任何 readout。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const EUV_HINA_SOURCE_ITEMS: readonly Item[] = [
  /**
   * 源光谱/etendue 记录：`inBandPower 0–500 W`、`bandwidth 0.1–2 nm`、
   * `etendue 0–10 mm²·sr`、`points`；不是 250 W 的“已测”读数。
   */
  {
    id: 'mat/source-spectrum-record',
    name: 'Source Spectrum/Etendue Record', name_zh: '源光谱/etendue 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'inBandPower', kind: 'range', min: 0, max: 500, unit: 'W', dir: 'atMost' },
      { param: 'bandwidth', kind: 'range', min: 0.1, max: 2, unit: 'nm' },
      { param: 'etendue', kind: 'range', min: 0, max: 10, unit: 'mm²·sr' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },

  /**
   * 液滴尺寸/速度记录：`diameter 5–50 µm`、`velocity 10–200 m/s`、
   * `rate 10–100 kHz`、`jitter 2–20 ns`、`points`；不是 18–20 µm 的读数。
   */
  {
    id: 'mat/droplet-record',
    name: 'Droplet Size/Velocity Record', name_zh: '液滴尺寸/速度记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 5, max: 50, unit: 'µm' },
      { param: 'velocity', kind: 'range', min: 10, max: 200, unit: 'm/s' },
      { param: 'rate', kind: 'range', min: 10, max: 100, unit: 'kHz' },
      { param: 'jitter', kind: 'range', min: 0, max: 100, unit: 'ns', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },

  /**
   * 碎屑寿命记录：`lifetime 0–30000 h`、`reflectivityDrop 0–50 %`、`points`；
   * 不是“10⁴ 小时”的已测读数。
   */
  {
    id: 'mat/debris-lifetime-record',
    name: 'Debris Lifetime Record', name_zh: '碎屑寿命记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'lifetime', kind: 'range', min: 0, max: 30000, unit: 'h', dir: 'atMost' },
      { param: 'reflectivityDrop', kind: 'range', min: 0, max: 50, unit: '%', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },

  /**
   * 激光聚焦/指向记录：`focusSpot 20–50 µm`、`pointing 20–50 µrad`、
   * `power 0–30000 W`、`points`；不是 20 kW/20 µm 的已测读数。
   */
  {
    id: 'mat/laser-focus-record',
    name: 'Laser Focusing / Pointing Record', name_zh: '激光聚焦/指向记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'focusSpot', kind: 'range', min: 10, max: 200, unit: 'µm', dir: 'atMost' },
      { param: 'pointing', kind: 'range', min: 0, max: 200, unit: 'µrad', dir: 'atMost' },
      { param: 'power', kind: 'range', min: 0, max: 30000, unit: 'W', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },

  /**
   * 激光功率记录：`power 0–30000 W`、`uncertainty 0.5–2 %`、`points`；
   * 不是 20 kW 的已测读数。
   */
  {
    id: 'mat/laser-power-record',
    name: 'Laser Power Record', name_zh: '激光功率记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 0, max: 30000, unit: 'W', dir: 'atMost' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },
];

export const EUV_HINA_SOURCE_ROUTES: readonly Route[] = [
  {
    /**
     * **源光谱/etendue：把 250 W 总功率拆成带内/带外与 etendue。**
     *
     * 输出能力域 `inBandPower 0–500 W`、`bandwidth 0.2–1 nm`、
     * `etendue 0–10 mm²·sr`、`points 10`；不是 250 W 的“已测”读数。
     */
    id: 'measure/source-spectrum',
    name: 'Source Spectrum/Etendue Measurement', name_zh: '源光谱/etendue 测量',
    produces: [
      {
        item: 'mat/source-spectrum-record',
        qty: q(1),
        gives: [
          { param: 'inBandPower', kind: 'range', min: 0, max: 500 },
          { param: 'bandwidth', kind: 'range', min: 0.2, max: 1 },
          { param: 'etendue', kind: 'range', min: 0, max: 10 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/euv-stepper-hina/source', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(48) },
    steps: [
      {
        note_zh: '装源到光谱机；IF 光阑对中，抽真空',
        performedBy: 'plant/euv-spectrometer',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: '扫描 10–20 nm，读带内功率/带宽；狭缝扫描读 etendue',
        performedBy: 'plant/euv-spectrometer',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: '写能力域 0–500 W、0.2–1 nm、0–10 mm²·sr；不写 250 W 已测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '源 1（不消耗）→ 光谱/etendue 记录 1 份；记录是数据不是物料。',
  },
  {
    /**
     * **液滴尺寸/速度：频闪两相位。**
     *
     * 输出能力域 `diameter 5–50 µm`、`velocity 10–200 m/s`、`rate 10–100 kHz`、
     * `jitter 2–20 ns`、`points 10`；不是 18–20 µm 的读数。
     */
    id: 'measure/droplet-size-velocity',
    name: 'Droplet Size/Velocity Measurement', name_zh: '液滴尺寸/速度测量',
    produces: [
      {
        item: 'mat/droplet-record',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 5, max: 50 },
          { param: 'velocity', kind: 'range', min: 10, max: 200 },
          { param: 'rate', kind: 'range', min: 10, max: 100 },
          { param: 'jitter', kind: 'range', min: 2, max: 10 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/euv-source/droplet-generator', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/velocity-standard'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: '装液滴发生器到成像机；喷嘴 18–20 µm、50 kHz；光轴对中',
        performedBy: 'plant/euv-droplet-imager',
      },
      {
        note_zh: '扫延迟 0–20 µs，两相位成像；测直径/间距/速度',
        performedBy: 'plant/euv-droplet-imager',
      },
      {
        note_zh: '写能力域 5–50 µm、10–200 m/s、jitter 2–20 ns；不写 18–20 µm 读数',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '液滴发生器 1 + 水 1 → 液滴记录 1 份；记录是数据不是物料。',
  },
  {
    /**
     * **碎屑寿命：源 + 收集镜 + 铜箔百叶 + 氢，跑长时间看反射率下降。**
     *
     * 输出能力域 `lifetime 0–30000 h`、`reflectivityDrop 0–50 %`、`points 10`；
     * 不是“10⁴ 小时”的已测读数。1000 h 是单轮估算；外推要至少 3 个
     * 反射率点，且每次测量前收集镜回到同一温度。
     */
    id: 'measure/debris-lifetime',
    name: 'Debris Lifetime Measurement', name_zh: '碎屑寿命测量',
    produces: [
      {
        item: 'mat/debris-lifetime-record',
        qty: q(1),
        gives: [
          { param: 'lifetime', kind: 'range', min: 0, max: 30000 },
          { param: 'reflectivityDrop', kind: 'range', min: 0, max: 50 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/euv-stepper-hina/source', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-source/collector', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-source/debris-trap', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(1000) },
    steps: [
      {
        note_zh: '装源/收集镜/铜箔百叶；氢流量按源工况；抽真空',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '跑 250 W 设计工况；每 100 h 用反射计读收集镜反射率，至少 3 点',
        performedBy: 'plant/euv-reflectometer',
        under: [{ param: 'temperature', min: 20, max: 60 }],
      },
      {
        note_zh: '外推寿命/反射率下降；写能力域 0–30000 h、0–50 %，不写 10⁴ h 已测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '源 1 + 收集镜 1 + 百叶 1 + 氢 0.01 → 寿命记录 1 份；记录是数据不是物料。',
  },
  {
    /**
     * **激光聚焦/指向：20 kW 刀口扫描。**
     *
     * 输出能力域 `focusSpot 20–50 µm`、`pointing 20–50 µrad`、
     * `power 0–30000 W`、`points 10`；不是 20 kW/20 µm 的已测读数。
     */
    id: 'measure/laser-focus',
    name: 'Laser Focusing / Pointing Measurement', name_zh: '激光聚焦/指向测量',
    produces: [
      {
        item: 'mat/laser-focus-record',
        qty: q(1),
        gives: [
          { param: 'focusSpot', kind: 'range', min: 20, max: 50 },
          { param: 'pointing', kind: 'range', min: 20, max: 50 },
          { param: 'power', kind: 'range', min: 0, max: 30000 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/euv-source/laser', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: '装激光/水冷收集/刀口；衰减到探测器安全功率',
        performedBy: 'plant/laser-beam-profiler',
      },
      {
        note_zh: '刀口扫描焦斑，双探测器读指向；20 kW 下测热漂',
        performedBy: 'plant/laser-beam-profiler',
      },
      {
        note_zh: '写能力域 20–50 µm、20–50 µrad、0–30000 W；不写 20 kW/20 µm 已测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '激光 1 + 水 10 → 聚焦/指向记录 1 份；记录是数据不是物料。',
  },
  {
    /**
     * **激光功率：20 kW 水冷量热器。**
     *
     * 输出能力域 `power 0–30000 W`、`uncertainty 0.5–2 %`、`points 10`；
     * 不是 20 kW 的已测读数。
     */
    id: 'measure/laser-power',
    name: 'Laser Power Measurement', name_zh: '激光功率测量',
    produces: [
      {
        item: 'mat/laser-power-record',
        qty: q(1),
        gives: [
          { param: 'power', kind: 'range', min: 0, max: 30000 },
          { param: 'uncertainty', kind: 'range', min: 0.5, max: 2 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/euv-source/laser', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: '装量热器/水冷；激光进铜体，流量/温差稳定 60 s',
        performedBy: 'plant/laser-calorimeter',
      },
      {
        note_zh: '读 ṁ、ΔT，算 20 kW；至少 3 次取平均',
        performedBy: 'plant/laser-calorimeter',
      },
      {
        note_zh: '写能力域 0–30000 W、uncertainty 0.5–2 %；不写 20 kW 已测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '激光 1 + 水 100 → 激光功率记录 1 份；记录是数据不是物料。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...EUV_HINA_SOURCE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...EUV_HINA_SOURCE_ROUTES];
