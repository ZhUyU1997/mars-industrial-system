/**
 * 公开规格记录：FZ-Si 与 ZnSe 窗口的材料/元件级读数。
 *
 * 这不是本路线本批的实测，是公开材料规格：
 *
 *   · FZ-Si：ρ 1–100 Ω·cm、O ≤1e16 cm⁻³、无位错
 *   · ZnSe 窗口：10.6 µm 透射 0.95–0.98、吸收 0.05–0.5 %/cm
 *
 * 用途：把 `make/fz-silicon` 与 `make/znse-window` 的 design 窗口
 * 挂到公开规格记录上；`record` 只证明“这类材料有公开读数”，不证明
 * 本批产品。本批仍要 incoming inspection。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PUBLIC_SPEC_ITEMS: readonly Item[] = [
  /**
   * FZ-Si 公开规格记录：ρ 1–100 Ω·cm、O ≤1e16 cm⁻³、位错 0。
   *
   * 来源：公开 FZ-Si 材料规格（Siltronic / Topsil FZ wafer datasheet；
   * 典型 FZ 硅 ρ 1–100 Ω·cm、O ≤1e16 cm⁻³、 dislocation-free）。
   */
  {
    id: 'mat/fz-silicon-public-record',
    name: 'FZ-Si 公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'resistivity', kind: 'range', min: 1, max: 100, unit: 'Ω·cm' },
      { param: 'oxygen', kind: 'range', min: 0, max: 1e16, unit: 'cm⁻³', dir: 'atMost' },
      { param: 'dislocation', kind: 'range', min: 0, max: 0, unit: 'cm⁻²', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /**
   * ZnSe 窗口公开规格记录：10.6 µm 透射 0.95–0.98、吸收 0.05–0.5 %/cm。
   *
   * 来源：Shalom EO ZnSe windows 产品页（10.6 µm 透射 >95 %、
   * 吸收 ≤0.5 %/cm；典型值 0.1–0.2 %/cm）。
   */
  {
    id: 'mat/znse-window-public-record',
    name: 'ZnSe 窗口公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'transmission', kind: 'range', min: 0.95, max: 0.98, unit: '1' },
      { param: 'absorption', kind: 'range', min: 0.05, max: 0.5, unit: '%/cm', dir: 'atMost' },
      { param: 'roughness', kind: 'range', min: 0.3, max: 1, unit: 'nm rms', dir: 'atMost' },
      { param: 'flatness', kind: 'range', min: 50, max: 70, unit: 'nm rms', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /**
   * 金刚石车削镀金铜镜/OAP 公开规格：roughness 1–20 nm、reflectivity 0.97–0.99。
   *
   * 来源：公开红外镜数据（金刚石车削 + 金膜，Ra ≤10 nm、
   * 10.6 µm 反射率 ≥98 %；OAP 同工艺）。不是本镜实测。
   */
  {
    id: 'mat/diamond-turned-copper-public-record',
    name: '金刚石车削镀金铜镜/OAP 公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'roughness', kind: 'range', min: 1, max: 20, unit: 'nm rms', dir: 'atMost' },
      { param: 'figure', kind: 'range', min: 50, max: 100, unit: 'nm rms', dir: 'atMost' },
      { param: 'reflectivity', kind: 'range', min: 0.97, max: 0.99, unit: '1' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /**
   * 精密电阻公开规格：accuracy 0.005–0.02 %、TCR 2–5 ppm/K。
   *
   * 来源：Vishay VHP101/VHP精密箔电阻 datasheet（0.005 %、2 ppm/°C）。
   * 不是本油浸电阻实测。
   */
  {
    id: 'mat/precision-resistor-public-record',
    name: '精密电阻公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'accuracy', kind: 'range', min: 0.005, max: 0.02, unit: '%' },
      { param: 'tempCoefficient', kind: 'range', min: 2, max: 5, unit: 'ppm/K' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /**
   * EUV 绝对平面公开规格：figure 0.1–0.2 nm、roughness 0.1–0.2 nm。
   *
   * 来源：公开超抛光熔石英/微晶基板数据（Ra ≤0.1–0.2 nm、
   * figure λ/10 级）。不是本基板实测。
   */
  {
    id: 'mat/euv-absolute-flat-public-record',
    name: 'EUV 绝对平面公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'figure', kind: 'range', min: 0.1, max: 0.2, unit: 'nm rms' },
      { param: 'roughness', kind: 'range', min: 0.1, max: 0.2, unit: 'nm rms' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /**
   * EUV 光栅公开规格：1200 lines/mm、效率 0.15–0.3。
   *
   * 来源：公开 1200 l/mm 闪耀光栅 datasheet（13.5 nm 一级效率 15–30 %）。
   * 不是本光栅实测。
   */
  {
    id: 'mat/euv-grating-public-record',
    name: 'EUV 光栅公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'efficiency', kind: 'range', min: 0.15, max: 0.3, unit: '1' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /**
   * EUV 快探测器公开规格：QE 0.2–0.5、timeConstant 0.05–0.1 s。
   *
   * 来源：公开背照 EUV CCD/CMOS datasheet（13.5 nm QE 20–50 %、
   * 10–30 fps）。不是本探测器实测。
   */
  {
    id: 'mat/euv-detector-fast-public-record',
    name: 'EUV 快探测器公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'quantumEfficiency', kind: 'range', min: 0.2, max: 0.5, unit: '1' },
      { param: 'timeConstant', kind: 'range', min: 0.05, max: 0.1, unit: 's' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /**
   * 30 kW 水冷量热器公开规格：accuracy 0.5–1 %。
   *
   * 来源：公开 30 kW 水冷量热器 datasheet（±1 %）。不是本量热器实测。
   */
  {
    id: 'mat/laser-calorimeter-public-record',
    name: '30 kW 水冷量热器公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'accuracy', kind: 'range', min: 0.5, max: 1, unit: '%', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /**
   * 水流量计公开规格：accuracy 1–2 %。
   *
   * 来源：公开涡轮/孔板流量计 datasheet（1–2 %）。不是本流量计实测。
   */
  {
    id: 'mat/water-flow-meter-public-record',
    name: '水流量计公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'accuracy', kind: 'range', min: 1, max: 2, unit: '%', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /** RF 合成器公开规格：insertionLoss 0.3–0.8 dB（14:1、27 MHz）。 */
  {
    id: 'mat/rf-combiner-public-record',
    name: '射频合成器公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'insertionLoss', kind: 'range', min: 0.3, max: 0.8, unit: 'dB', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /** 激光光束剖面仪公开规格：spot 20–50 µm、pointing 20–50 µrad。 */
  {
    id: 'mat/laser-beam-profiler-public-record',
    name: '激光光束剖面仪公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'spot', kind: 'range', min: 20, max: 50, unit: 'µm' },
      { param: 'pointing', kind: 'range', min: 0, max: 50, unit: 'µrad', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /** IBF 束流剖面仪公开规格：uniformity 1–5 %。 */
  {
    id: 'mat/ion-beam-profiler-public-record',
    name: '离子束剖面仪公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'uniformity', kind: 'range', min: 1, max: 5, unit: '%', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /** X 射线测角仪公开规格：resolution 0.001–0.005°、accuracy 0.005–0.01°。 */
  {
    id: 'mat/xray-goniometer-public-record',
    name: 'X 射线测角仪公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 0.001, max: 0.005, unit: '°', dir: 'atMost' },
      { param: 'accuracy', kind: 'range', min: 0.005, max: 0.01, unit: '°', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /** 双晶 X 射线衍射仪公开规格：resolution 0.001–0.002°。 */
  {
    id: 'mat/xray-diffractometer-public-record',
    name: 'X 射线衍射仪公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 0.001, max: 0.002, unit: '°', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /** EUV 液滴成像仪公开规格：resolution 1–3 µm、jitter 2–10 ns。 */
  {
    id: 'mat/euv-droplet-imager-public-record',
    name: 'EUV 液滴成像仪公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 1, max: 3, unit: 'µm' },
      { param: 'jitter', kind: 'range', min: 2, max: 10, unit: 'ns', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /** EUV 光谱仪公开规格：resolution 0.2–0.5 nm（10–20 nm）。 */
  {
    id: 'mat/euv-spectrometer-public-record',
    name: 'EUV 光谱仪公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 0.2, max: 0.5, unit: 'nm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /** 快刀伺服公开规格：resolution 1–10 nm。 */
  {
    id: 'mat/fast-tool-servo-public-record',
    name: '快速刀具伺服公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 1, max: 10, unit: 'nm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /** 激光气体循环公开规格：tempStability 0.5–2 K。 */
  {
    id: 'mat/laser-gas-loop-public-record',
    name: '激光气体循环公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'tempStability', kind: 'range', min: 0.5, max: 2, unit: 'K', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /** 20 kW RF 发生器公开规格：power 18–22 kW、efficiency 0.7–0.85、stability 0.2–0.5 %。 */
  {
    id: 'mat/rf-generator-public-record',
    name: '射频发生器公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 18000, max: 22000, unit: 'W' },
      { param: 'efficiency', kind: 'range', min: 0.7, max: 0.85, unit: '1' },
      { param: 'stability', kind: 'range', min: 0.2, max: 0.5, unit: '%', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /** 精密主轴公开规格：radial 0.1–0.5 µm、axial 0.1–0.5 µm。 */
  {
    id: 'mat/precision-spindle-public-record',
    name: '精密主轴公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'radial', kind: 'range', min: 0.1, max: 0.5, unit: 'µm', dir: 'atMost' },
      { param: 'axial', kind: 'range', min: 0.1, max: 0.5, unit: 'µm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /** 660 mm 静压转台公开规格：axial/radial 0.1–0.5 µm、angle 1–2 角秒。 */
  {
    id: 'mat/rotary-table-public-record',
    name: '回转台公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'axial', kind: 'range', min: 0.1, max: 0.5, unit: 'µm', dir: 'atMost' },
      { param: 'radial', kind: 'range', min: 0.1, max: 0.5, unit: 'µm', dir: 'atMost' },
      { param: 'angle', kind: 'range', min: 1, max: 2, unit: '角秒', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /** EUV 660 mm 台公开规格：positionError 0.5–1 µm、readout 0.5–1 µm。 */
  {
    id: 'mat/euv-stage-public-record',
    name: 'EUV 工件台公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'positionError', kind: 'range', min: 0.5, max: 1, unit: 'µm', dir: 'atMost' },
      { param: 'readout', kind: 'range', min: 0.5, max: 1, unit: 'µm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /** 10.6 µm 铜输出耦合镜公开规格：reflectivity 0.6–0.9。 */
  {
    id: 'mat/copper-output-coupler-public-record',
    name: '铜输出耦合镜公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'reflectivity', kind: 'range', min: 0.6, max: 0.9, unit: '1' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /** 320 mm NA 0.43 大 null lens 公开规格：figure 0–130 nm。 */
  {
    id: 'mat/large-null-lens-public-record',
    name: '大口径零位镜公开规格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'figure', kind: 'range', min: 0, max: 130, unit: 'nm rms', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },
];

export const PUBLIC_SPEC_ROUTES: readonly Route[] = [
  {
    /**
     * **FZ-Si 公开规格复核：查材料证书/公开 datasheet，不冒充本锭实测。**
     */
    id: 'spec/fz-silicon-public-spec',
    name: 'FZ-Si 公开规格采集',
    produces: [
      {
        item: 'mat/fz-silicon-public-record',
        qty: q(1),
        gives: [
          { param: 'resistivity', kind: 'range', min: 1, max: 100 },
          { param: 'oxygen', kind: 'range', min: 0, max: 1e16 },
          { param: 'dislocation', kind: 'range', min: 0, max: 0 },
          { param: 'points', kind: 'range', min: 3, max: 3 },
        ],
      },
    ],
    uses: [],
    needs: [],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh: '查公开 FZ-Si datasheet/材料证书：ρ 1–100 Ω·cm、O ≤1e16 cm⁻³、无位错',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '写公开规格记录；注明不是本锭实测，本锭仍做 incoming inspection',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    /**
     * **ZnSe 窗口公开规格复核：10.6 µm 透射/吸收 datasheet。**
     */
    id: 'spec/znse-window-public-spec',
    name: 'ZnSe 窗口公开规格采集',
    produces: [
      {
        item: 'mat/znse-window-public-record',
        qty: q(1),
        gives: [
          { param: 'transmission', kind: 'range', min: 0.95, max: 0.98 },
          { param: 'absorption', kind: 'range', min: 0.05, max: 0.5 },
          { param: 'roughness', kind: 'range', min: 0.3, max: 1 },
          { param: 'flatness', kind: 'range', min: 50, max: 70 },
          { param: 'points', kind: 'range', min: 3, max: 3 },
        ],
      },
    ],
    uses: [],
    needs: [],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh: '查 Shalom EO ZnSe windows 产品页：10.6 µm 透射 >95 %、吸收 ≤0.5 %/cm',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '写公开规格记录；注明不是本窗实测，本窗仍做 FTIR/吸收测试',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    /**
     * **金刚石车削铜镜/OAP 公开规格复核：Ra/反射率 datasheet。**
     */
    id: 'spec/diamond-turned-copper-public-spec',
    name: '金刚石车削镀金铜镜/OAP 公开规格采集',
    produces: [
      {
        item: 'mat/diamond-turned-copper-public-record',
        qty: q(1),
        gives: [
          { param: 'roughness', kind: 'range', min: 1, max: 20 },
          { param: 'figure', kind: 'range', min: 50, max: 100 },
          { param: 'reflectivity', kind: 'range', min: 0.97, max: 0.99 },
          { param: 'points', kind: 'range', min: 3, max: 3 },
        ],
      },
    ],
    uses: [],
    needs: [],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh: '查公开金刚石车削镀金铜镜数据：Ra ≤10 nm、10.6 µm 反射率 ≥98 %',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '写公开规格记录；注明不是本镜实测，本镜仍做 AFM/FTIR',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    /**
     * **精密电阻公开规格复核：Vishay VHP101 datasheet。**
     */
    id: 'spec/precision-resistor-public-spec',
    name: '精密电阻公开规格采集',
    produces: [
      {
        item: 'mat/precision-resistor-public-record',
        qty: q(1),
        gives: [
          { param: 'accuracy', kind: 'range', min: 0.005, max: 0.02 },
          { param: 'tempCoefficient', kind: 'range', min: 2, max: 5 },
          { param: 'points', kind: 'range', min: 3, max: 3 },
        ],
      },
    ],
    uses: [],
    needs: [],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh: '查 Vishay VHP101 datasheet：0.005 %、2 ppm/°C；写公开规格记录',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '注明不是本油浸电阻实测；本电阻仍做四端对/油槽测试',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    /**
     * **EUV 绝对平面公开规格复核：超抛光基板 datasheet。**
     */
    id: 'spec/euv-absolute-flat-public-spec',
    name: 'EUV 绝对平面公开规格采集',
    produces: [
      {
        item: 'mat/euv-absolute-flat-public-record',
        qty: q(1),
        gives: [
          { param: 'figure', kind: 'range', min: 0.1, max: 0.2 },
          { param: 'roughness', kind: 'range', min: 0.1, max: 0.2 },
          { param: 'points', kind: 'range', min: 3, max: 3 },
        ],
      },
    ],
    uses: [],
    needs: [],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh: '查公开超抛光熔石英/微晶基板数据：Ra 0.1–0.2 nm、figure λ/10 级',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '写公开规格记录；注明不是本基板实测，本基板仍做干涉/AFM',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    /**
     * **EUV 光栅公开规格复核：1200 l/mm 闪耀光栅 datasheet。**
     */
    id: 'spec/euv-grating-public-spec',
    name: 'EUV 光栅公开规格采集',
    produces: [
      {
        item: 'mat/euv-grating-public-record',
        qty: q(1),
        gives: [
          { param: 'efficiency', kind: 'range', min: 0.15, max: 0.3 },
          { param: 'points', kind: 'range', min: 3, max: 3 },
        ],
      },
    ],
    uses: [],
    needs: [],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh: '查公开 1200 l/mm 闪耀光栅数据：13.5 nm 一级效率 15–30 %',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '写公开规格记录；注明不是本光栅实测，本光栅仍做效率测试',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    /**
     * **EUV 快探测器公开规格复核：QE/timeConstant datasheet。**
     */
    id: 'spec/euv-detector-fast-public-spec',
    name: 'EUV 快探测器公开规格采集',
    produces: [
      {
        item: 'mat/euv-detector-fast-public-record',
        qty: q(1),
        gives: [
          { param: 'quantumEfficiency', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'timeConstant', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'points', kind: 'range', min: 3, max: 3 },
        ],
      },
    ],
    uses: [],
    needs: [],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh: '查公开背照 EUV CCD/CMOS datasheet：QE 20–50 %、10–30 fps',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '写公开规格记录；注明不是本探测器实测，本探测器仍做 QE/响应测试',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    /**
     * **30 kW 量热器公开规格复核：±1 % datasheet。**
     */
    id: 'spec/laser-calorimeter-public-spec',
    name: '30 kW 水冷量热器公开规格采集',
    produces: [
      {
        item: 'mat/laser-calorimeter-public-record',
        qty: q(1),
        gives: [
          { param: 'accuracy', kind: 'range', min: 0.5, max: 1 },
          { param: 'points', kind: 'range', min: 3, max: 3 },
        ],
      },
    ],
    uses: [],
    needs: [],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh: '查公开 30 kW 水冷量热器 datasheet：±1 %',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '写公开规格记录；注明不是本量热器实测，本量热器仍做电加热标定',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    /**
     * **水流量计公开规格复核：1–2 % datasheet。**
     */
    id: 'spec/water-flow-meter-public-spec',
    name: '水流量计公开规格采集',
    produces: [
      {
        item: 'mat/water-flow-meter-public-record',
        qty: q(1),
        gives: [
          { param: 'accuracy', kind: 'range', min: 1, max: 2 },
          { param: 'points', kind: 'range', min: 3, max: 3 },
        ],
      },
    ],
    uses: [],
    needs: [],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh: '查公开涡轮/孔板流量计 datasheet：1–2 %',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '写公开规格记录；注明不是本流量计实测，本流量计仍做称重法标定',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    id: 'spec/rf-combiner-public-spec',
    name: '射频合成器公开规格采集',
    produces: [{
      item: 'mat/rf-combiner-public-record', qty: q(1),
      gives: [
        { param: 'insertionLoss', kind: 'range', min: 0.3, max: 0.8 },
        { param: 'points', kind: 'range', min: 3, max: 3 },
      ],
    }],
    uses: [], needs: [], rate: { hours: q(1) },
    steps: [
      { note_zh: '查公开 14:1、27 MHz RF 合成器 datasheet：插损 0.3–0.8 dB', performedBy: 'plant/robot' },
      { note_zh: '写公开规格记录；注明不是本合成器实测，本合成器仍做插损/隔离测试', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    id: 'spec/laser-beam-profiler-public-spec',
    name: '激光光束剖面仪公开规格采集',
    produces: [{
      item: 'mat/laser-beam-profiler-public-record', qty: q(1),
      gives: [
        { param: 'spot', kind: 'range', min: 20, max: 50 },
        { param: 'pointing', kind: 'range', min: 0, max: 50 },
        { param: 'points', kind: 'range', min: 3, max: 3 },
      ],
    }],
    uses: [], needs: [], rate: { hours: q(1) },
    steps: [
      { note_zh: '查公开 10.6 µm 光束剖面仪 datasheet：焦斑 20–50 µm、指向 20–50 µrad', performedBy: 'plant/robot' },
      { note_zh: '写公开规格记录；注明不是本机实测，本机仍做刀口扫描', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    id: 'spec/ion-beam-profiler-public-spec',
    name: '离子束剖面仪公开规格采集',
    produces: [{
      item: 'mat/ion-beam-profiler-public-record', qty: q(1),
      gives: [
        { param: 'uniformity', kind: 'range', min: 1, max: 5 },
        { param: 'points', kind: 'range', min: 3, max: 3 },
      ],
    }],
    uses: [], needs: [], rate: { hours: q(1) },
    steps: [
      { note_zh: '查公开 IBF 束流剖面仪 datasheet：均匀性 1–5 %', performedBy: 'plant/robot' },
      { note_zh: '写公开规格记录；注明不是本机实测，本机仍做法拉第杯扫描', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    id: 'spec/xray-goniometer-public-spec',
    name: 'X 射线测角仪公开规格采集',
    produces: [{
      item: 'mat/xray-goniometer-public-record', qty: q(1),
      gives: [
        { param: 'resolution', kind: 'range', min: 0.001, max: 0.005 },
        { param: 'accuracy', kind: 'range', min: 0.005, max: 0.01 },
        { param: 'points', kind: 'range', min: 3, max: 3 },
      ],
    }],
    uses: [], needs: [], rate: { hours: q(1) },
    steps: [
      { note_zh: '查公开 X 射线测角仪 datasheet：0.001–0.005° 分辨率、0.005–0.01° 准确度', performedBy: 'plant/robot' },
      { note_zh: '写公开规格记录；注明不是本机实测，本机仍做自准直仪标定', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    id: 'spec/xray-diffractometer-public-spec',
    name: 'X 射线衍射仪公开规格采集',
    produces: [{
      item: 'mat/xray-diffractometer-public-record', qty: q(1),
      gives: [
        { param: 'resolution', kind: 'range', min: 0.001, max: 0.002 },
        { param: 'points', kind: 'range', min: 3, max: 3 },
      ],
    }],
    uses: [], needs: [], rate: { hours: q(1) },
    steps: [
      { note_zh: '查公开双晶 X 射线衍射仪 datasheet：0.001–0.002° 分辨率', performedBy: 'plant/robot' },
      { note_zh: '写公开规格记录；注明不是本机实测，本机仍做标准 Si 粉/单晶测试', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    id: 'spec/euv-droplet-imager-public-spec',
    name: 'EUV 液滴成像仪公开规格采集',
    produces: [{
      item: 'mat/euv-droplet-imager-public-record', qty: q(1),
      gives: [
        { param: 'resolution', kind: 'range', min: 1, max: 3 },
        { param: 'jitter', kind: 'range', min: 2, max: 10 },
        { param: 'points', kind: 'range', min: 3, max: 3 },
      ],
    }],
    uses: [], needs: [], rate: { hours: q(1) },
    steps: [
      { note_zh: '查公开高速显微成像 datasheet：1–3 µm、2–10 ns jitter', performedBy: 'plant/robot' },
      { note_zh: '写公开规格记录；注明不是本机实测，本机仍做刻线尺标定', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    id: 'spec/euv-spectrometer-public-spec',
    name: 'EUV 光谱仪公开规格采集',
    produces: [{
      item: 'mat/euv-spectrometer-public-record', qty: q(1),
      gives: [
        { param: 'resolution', kind: 'range', min: 0.2, max: 0.5 },
        { param: 'points', kind: 'range', min: 3, max: 3 },
      ],
    }],
    uses: [], needs: [], rate: { hours: q(1) },
    steps: [
      { note_zh: '查公开 10–20 nm EUV 光谱仪 datasheet：0.2–0.5 nm 分辨率', performedBy: 'plant/robot' },
      { note_zh: '写公开规格记录；注明不是本机实测，本机仍做带内扫描', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    id: 'spec/fast-tool-servo-public-spec',
    name: '快速刀具伺服公开规格采集',
    produces: [{
      item: 'mat/fast-tool-servo-public-record', qty: q(1),
      gives: [{ param: 'resolution', kind: 'range', min: 1, max: 10 }, { param: 'points', kind: 'range', min: 3, max: 3 }],
    }],
    uses: [], needs: [], rate: { hours: q(1) },
    steps: [
      { note_zh: '查公开压电快刀伺服 datasheet：1–10 nm 分辨率', performedBy: 'plant/robot' },
      { note_zh: '写公开规格记录；注明不是本机实测', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    id: 'spec/laser-gas-loop-public-spec',
    name: '激光气体循环公开规格采集',
    produces: [{
      item: 'mat/laser-gas-loop-public-record', qty: q(1),
      gives: [{ param: 'tempStability', kind: 'range', min: 0.5, max: 2 }, { param: 'points', kind: 'range', min: 3, max: 3 }],
    }],
    uses: [], needs: [], rate: { hours: q(1) },
    steps: [
      { note_zh: '查公开激光气体循环 datasheet：0.5–2 K 温控', performedBy: 'plant/robot' },
      { note_zh: '写公开规格记录；注明不是本机实测', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    id: 'spec/rf-generator-public-spec',
    name: '射频发生器公开规格采集',
    produces: [{
      item: 'mat/rf-generator-public-record', qty: q(1),
      gives: [
        { param: 'power', kind: 'range', min: 18000, max: 22000 },
        { param: 'efficiency', kind: 'range', min: 0.7, max: 0.85 },
        { param: 'stability', kind: 'range', min: 0.2, max: 0.5 },
        { param: 'points', kind: 'range', min: 3, max: 3 },
      ],
    }],
    uses: [], needs: [], rate: { hours: q(1) },
    steps: [
      { note_zh: '查公开 20 kW RF 发生器 datasheet：18–22 kW、0.7–0.85、0.2–0.5 %', performedBy: 'plant/robot' },
      { note_zh: '写公开规格记录；注明不是本机实测', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    id: 'spec/precision-spindle-public-spec',
    name: '精密主轴公开规格采集',
    produces: [{
      item: 'mat/precision-spindle-public-record', qty: q(1),
      gives: [
        { param: 'radial', kind: 'range', min: 0.1, max: 0.5 },
        { param: 'axial', kind: 'range', min: 0.1, max: 0.5 },
        { param: 'points', kind: 'range', min: 3, max: 3 },
      ],
    }],
    uses: [], needs: [], rate: { hours: q(1) },
    steps: [
      { note_zh: '查公开精密主轴 datasheet：径向/轴向 0.1–0.5 µm', performedBy: 'plant/robot' },
      { note_zh: '写公开规格记录；注明不是本机实测', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    id: 'spec/rotary-table-public-spec',
    name: '回转台公开规格采集',
    produces: [{
      item: 'mat/rotary-table-public-record', qty: q(1),
      gives: [
        { param: 'axial', kind: 'range', min: 0.1, max: 0.5 },
        { param: 'radial', kind: 'range', min: 0.1, max: 0.5 },
        { param: 'angle', kind: 'range', min: 1, max: 2 },
        { param: 'points', kind: 'range', min: 3, max: 3 },
      ],
    }],
    uses: [], needs: [], rate: { hours: q(1) },
    steps: [
      { note_zh: '查公开 660 mm 静压转台 datasheet：0.1–0.5 µm、1–2 角秒', performedBy: 'plant/robot' },
      { note_zh: '写公开规格记录；注明不是本机实测', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    id: 'spec/euv-stage-public-spec',
    name: 'EUV 工件台公开规格采集',
    produces: [{
      item: 'mat/euv-stage-public-record', qty: q(1),
      gives: [
        { param: 'positionError', kind: 'range', min: 0.5, max: 1 },
        { param: 'readout', kind: 'range', min: 0.5, max: 1 },
        { param: 'points', kind: 'range', min: 3, max: 3 },
      ],
    }],
    uses: [], needs: [], rate: { hours: q(1) },
    steps: [
      { note_zh: '查公开 660 mm 精密台 datasheet：0.5–1 µm 定位/读数', performedBy: 'plant/robot' },
      { note_zh: '写公开规格记录；注明不是本机实测', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    id: 'spec/copper-output-coupler-public-spec',
    name: '铜输出耦合镜公开规格采集',
    produces: [{
      item: 'mat/copper-output-coupler-public-record', qty: q(1),
      gives: [{ param: 'reflectivity', kind: 'range', min: 0.6, max: 0.9 }, { param: 'points', kind: 'range', min: 3, max: 3 }],
    }],
    uses: [], needs: [], rate: { hours: q(1) },
    steps: [
      { note_zh: '查公开 CO₂ 铜输出耦合镜 datasheet：反射率 60–90 %', performedBy: 'plant/robot' },
      { note_zh: '写公开规格记录；注明不是本镜实测', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
  {
    id: 'spec/large-null-lens-public-spec',
    name: '大口径零位镜公开规格采集',
    produces: [{
      item: 'mat/large-null-lens-public-record', qty: q(1),
      gives: [{ param: 'figure', kind: 'range', min: 0, max: 130 }, { param: 'points', kind: 'range', min: 3, max: 3 }],
    }],
    uses: [], needs: [], rate: { hours: q(1) },
    steps: [
      { note_zh: '查公开 320 mm NA 0.43 null lens datasheet：figure ≤130 nm', performedBy: 'plant/robot' },
      { note_zh: '写公开规格记录；注明不是本镜实测', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...PUBLIC_SPEC_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PUBLIC_SPEC_ROUTES];
