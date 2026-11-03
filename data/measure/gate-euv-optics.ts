/**
 * EUV 仪器与光学/激光的资格记录 —— 把 36 个 `design` 交付窗口改成“有出处的资格带”。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 这批记录是什么，不是什么
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 用户已明确：闸门通过，不再以“没有真跑”为停止理由；拿不出来的按最接近的
 * 填写。因此本轮把 36 个设计窗口从 `design: true` 改成 `record: 'mat/gate-...'`，
 * 每条记录由一个 `qual/gate-...` 资格路线产出。
 *
 * **记录里的窗口 = 原设计窗口**，它表示“这台设备/这件标准件的资格带”，
 * 不是某一次实测读数。真跑后必须收窄；注释里逐条写明这一点。
 * 没有编造新数值：窗口原样保留，只把出处从“设计”改为“资格记录”。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 资格路线怎么站住
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   · 被校件是零件 → `uses` 点名；被校件是设备 → 设备进 `needs`（设备不能在 uses）
 *   · `needs` 必带 `plant/metrology-room`；量具/参考件也写在 needs
 *   · 执行者写 `steps[].performedBy: 'plant/robot'`（有 steps 就不能再写路线级
 *     performedBy；模型不允许两处同时写）
 *   · 不写 `under`：资格跑不声称维持温度/压力，只写方法与读数点
 *   · 不新增不可达条目：所有量具/参考件都是既有、可达的
 *
 * 记录 id 统一前缀 `mat/gate-`；一条记录对应一台设备/一件标准件。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const GATE_EUV_OPTICS_ITEMS: readonly Item[] = [
  /** 660 mm at-wavelength 干涉仪资格记录：分辨率/重复性。 */
  {
    id: 'mat/gate-euv-interferometer-record',
    name: 'EUV Interferometer Acceptance Record', name_zh: 'EUV 干涉仪验收记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 0.1, max: 0.2, unit: 'nm' },
      { param: 'repeatability', kind: 'range', min: 0.05, max: 0.1, unit: 'nm' },
    ],
  },
  /** 快速 EUV 探测器资格记录：量子效率/时间常数。 */
  {
    id: 'mat/gate-euv-detector-fast-record',
    name: 'Fast EUV Detector Qualification Record', name_zh: '快速 EUV 探测器资格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'quantumEfficiency', kind: 'range', min: 0.2, max: 0.5, unit: '1' },
      { param: 'timeConstant', kind: 'range', min: 0.05, max: 0.1, unit: 's' },
    ],
  },
  /** EUV 光栅资格记录：衍射效率。 */
  {
    id: 'mat/gate-euv-grating-record',
    name: 'EUV Grating Qualification Record', name_zh: 'EUV 光栅资格记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'efficiency', kind: 'range', min: 0.15, max: 0.3, unit: '1' }],
  },
  /** EUV 光谱仪资格记录：光谱分辨率。 */
  {
    id: 'mat/gate-euv-spectrometer-record',
    name: 'EUV Spectrometer Qualification Record', name_zh: 'EUV 光谱仪资格记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'resolution', kind: 'range', min: 0.2, max: 0.5, unit: 'nm' }],
  },
  /** 液滴成像仪资格记录：空间分辨率/同步抖动。 */
  {
    id: 'mat/gate-euv-droplet-imager-record',
    name: 'Droplet Imager Qualification Record', name_zh: '液滴成像仪资格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 1, max: 3, unit: 'µm' },
      { param: 'jitter', kind: 'range', min: 2, max: 10, unit: 'ns' },
    ],
  },
  /** 660 mm 双层台资格记录：位置误差/读数分辨。 */
  {
    id: 'mat/gate-euv-stage-660-record',
    name: '660 mm Dual-Layer Stage Qualification Record', name_zh: '660 mm 双层台资格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'positionError', kind: 'range', min: 0.5, max: 1, unit: 'nm' },
      { param: 'readout', kind: 'range', min: 0.5, max: 1, unit: 'nm' },
    ],
  },
  /** 绝对平晶资格记录：面形/粗糙度。 */
  {
    id: 'mat/gate-euv-absolute-flat-record',
    name: 'Absolute Optical Flat Qualification Record', name_zh: '绝对平晶资格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'figure', kind: 'range', min: 0.1, max: 0.2, unit: 'nm rms' },
      { param: 'roughness', kind: 'range', min: 0.1, max: 0.2, unit: 'nm rms' },
    ],
  },
  /** 660 mm 多层膜镜资格记录：周期/反射率（子孔径拼接）。 */
  {
    id: 'mat/gate-euv-hina-mirror-record',
    name: '660 mm Multilayer Mirror Qualification Record', name_zh: '660 mm 多层膜镜资格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'period', kind: 'range', min: 6.8, max: 7, unit: 'nm' },
      { param: 'reflectivity', kind: 'range', min: 65, max: 70, unit: '%' },
    ],
  },
  /** 10.6 µm 铜镜资格记录：粗糙度/面形/反射率。 */
  {
    id: 'mat/gate-copper-mirror-10.6-record',
    name: '10.6 µm Copper Mirror Qualification Record', name_zh: '10.6 µm 铜镜资格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'roughness', kind: 'range', min: 10, max: 20, unit: 'nm rms' },
      { param: 'figure', kind: 'range', min: 50, max: 100, unit: 'nm rms' },
      { param: 'reflectivity', kind: 'range', min: 0.98, max: 0.99, unit: '1' },
    ],
  },
  /** 10.6 µm 离轴抛物镜资格记录：同铜镜三项。 */
  {
    id: 'mat/gate-copper-oap-10.6-record',
    name: '10.6 µm Off-Axis Parabolic Mirror Qualification Record', name_zh: '10.6 µm 离轴抛物镜资格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'roughness', kind: 'range', min: 10, max: 20, unit: 'nm rms' },
      { param: 'figure', kind: 'range', min: 50, max: 100, unit: 'nm rms' },
      { param: 'reflectivity', kind: 'range', min: 0.98, max: 0.99, unit: '1' },
    ],
  },
  /** 10.6 µm 输出耦合镜资格记录：反射率/粗糙度。 */
  {
    id: 'mat/gate-copper-output-coupler-record',
    name: '10.6 µm Output Coupler Qualification Record', name_zh: '10.6 µm 输出耦合镜资格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'reflectivity', kind: 'range', min: 0.6, max: 0.9, unit: '1' },
      { param: 'roughness', kind: 'range', min: 10, max: 20, unit: 'nm rms' },
    ],
  },
  /** ZnSe 窗口资格记录：透射/吸收/粗糙度/平面度。 */
  {
    id: 'mat/gate-znse-window-record',
    name: 'ZnSe Window Qualification Record', name_zh: 'ZnSe 窗口资格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'transmission', kind: 'range', min: 0.95, max: 0.97, unit: '1' },
      { param: 'absorption', kind: 'range', min: 0.1, max: 0.5, unit: '%/cm' },
      { param: 'roughness', kind: 'range', min: 1, max: 1, unit: 'nm rms' },
      { param: 'flatness', kind: 'range', min: 50, max: 70, unit: 'nm rms' },
    ],
  },
  /** 20 kW 板条 CO₂ 激光器资格记录：输出功率。 */
  {
    id: 'mat/gate-slab-laser-20kw-record',
    name: '20 kW Slab CO₂ Laser Qualification Record', name_zh: '20 kW 板条 CO₂ 激光器资格记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'power', kind: 'range', min: 18000, max: 22000, unit: 'W' }],
  },
  /** 20 kW/27 MHz RF 发生器资格记录：功率/效率/稳定度。 */
  {
    id: 'mat/gate-rf-generator-20kw-record',
    name: '20 kW/27 MHz RF Generator Qualification Record', name_zh: '20 kW/27 MHz RF 发生器资格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 18000, max: 22000, unit: 'W' },
      { param: 'efficiency', kind: 'range', min: 0.7, max: 0.85, unit: '1' },
      { param: 'stability', kind: 'range', min: 0.2, max: 0.5, unit: '%' },
    ],
  },
  /** 14:1 RF 合成器资格记录：插入损耗。 */
  {
    id: 'mat/gate-rf-combiner-record',
    name: '14:1 RF Combiner Qualification Record', name_zh: '14:1 RF 合成器资格记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'insertionLoss', kind: 'range', min: 0.3, max: 0.8, unit: 'dB' }],
  },
  /** 10.6 µm 光束质量分析仪资格记录：焦斑/指向。 */
  {
    id: 'mat/gate-laser-beam-profiler-record',
    name: '10.6 µm Beam Profiler Qualification Record', name_zh: '10.6 µm 光束质量分析仪资格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'focusSpot', kind: 'range', min: 20, max: 50, unit: 'µm' },
      { param: 'pointing', kind: 'range', min: 20, max: 50, unit: 'µrad' },
    ],
  },
  /** 20 kW 量热器资格记录：功率测量准确度。 */
  {
    id: 'mat/gate-laser-calorimeter-record',
    name: '20 kW Calorimeter Qualification Record', name_zh: '20 kW 量热器资格记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'accuracy', kind: 'range', min: 0.5, max: 1, unit: '%' }],
  },
  /** 激光气体循环资格记录：温度稳定度。 */
  {
    id: 'mat/gate-laser-gas-loop-record',
    name: 'Laser Gas Circulation Qualification Record', name_zh: '激光气体循环资格记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'tempStability', kind: 'range', min: 0.5, max: 2, unit: 'K' }],
  },
  /** 快刀伺服资格记录：闭环分辨率。 */
  {
    id: 'mat/gate-fast-tool-servo-record',
    name: 'Fast Tool Servo Qualification Record', name_zh: '快刀伺服资格记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'resolution', kind: 'range', min: 1, max: 10, unit: 'nm' }],
  },
];

export const GATE_EUV_OPTICS_ROUTES: readonly Route[] = [
  {
    /** 干涉仪资格：绝对平晶 + CGH 零位 + 八帧移相，读分辨率与重复性。 */
    id: 'qual/gate-euv-interferometer',
    name: 'EUV Interferometer Acceptance', name_zh: 'EUV 干涉仪验收',
    produces: [{
      item: 'mat/gate-euv-interferometer-record',
      qty: q(1),
      gives: [
        { param: 'resolution', kind: 'range', min: 0.1, max: 0.2 },
        { param: 'repeatability', kind: 'range', min: 0.05, max: 0.1 },
      ],
    }],
    uses: [],
    needs: [
      {
        item: 'plant/euv-interferometer',
        qty: q(1),
        need: [
          { param: 'resolution', kind: 'range', min: 0.1, max: 0.2 },
          { param: 'repeatability', kind: 'range', min: 0.05, max: 0.1 },
        ],
        onRelax: 'functional-kept',
      },
      'std/euv-absolute-flat',
      'plant/metrology-room',
    ],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '绝对平晶装 0.5 nm 台，CGH 零位；八帧移相，2001×2001 网格', performedBy: 'plant/robot' },
      { note_zh: '十次装夹读同一波前，取重复性；分辨率按 1/20 条纹判读', performedBy: 'plant/robot' },
      { note_zh: '写资格记录：0.1/0.05 nm 是资格带，真跑后收窄', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '干涉仪 1 台（进、出，不消耗）+ 绝对平晶 1 块（进、出，不消耗）→ 资格记录 1 份；记录是数据不是物料。',
  },
  {
    /** 探测器资格：EUV 源下参考探测器比对 QE，示波器读时间常数。 */
    id: 'qual/gate-euv-detector-fast',
    name: 'Fast EUV Detector Qualification', name_zh: '快速 EUV 探测器资格验收',
    produces: [{
      item: 'mat/gate-euv-detector-fast-record',
      qty: q(1),
      gives: [
        { param: 'quantumEfficiency', kind: 'range', min: 0.2, max: 0.5 },
        { param: 'timeConstant', kind: 'range', min: 0.05, max: 0.1 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'std/euv-detector-fast', qty: q(2) }] }],
    needs: ['plant/euv-source', 'plant/euv-interferometer', 'plant/scope-1ghz', 'plant/metrology-room'],
    rate: { hours: q(16) },
    steps: [
      { note_zh: 'EUV 源下同批两只探测器比对：一只参考、一只被校，读光电流', performedBy: 'plant/robot' },
      { note_zh: '斩光/脉冲，示波器读上升沿 10–90%，取时间常数', performedBy: 'plant/robot' },
      { note_zh: '写资格记录：QE 0.2–0.5、τ 0.05–0.1 s 是资格带', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 光栅资格：13.5 nm 0/1 级衍射功率比。 */
    id: 'qual/gate-euv-grating',
    name: 'EUV Grating Qualification', name_zh: 'EUV 光栅资格验收',
    produces: [{
      item: 'mat/gate-euv-grating-record',
      qty: q(1),
      gives: [{ param: 'efficiency', kind: 'range', min: 0.15, max: 0.3 }],
    }],
    uses: [{ anyOf: [{ item: 'std/euv-grating', qty: q(1) }] }],
    needs: ['plant/euv-spectrometer', 'plant/euv-source', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '光栅装光谱仪，13.5 nm 入射；测 0 级与 1 级衍射功率', performedBy: 'plant/robot' },
      { note_zh: 'efficiency = 1 级/入射；三个入射角各 3 次取平均', performedBy: 'plant/robot' },
      { note_zh: '写资格记录：0.15–0.3 是资格带', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 光谱仪资格：13.5 nm 线宽（FWHM）。 */
    id: 'qual/gate-euv-spectrometer',
    name: 'EUV Spectrometer Qualification', name_zh: 'EUV 光谱仪资格验收',
    produces: [{
      item: 'mat/gate-euv-spectrometer-record',
      qty: q(1),
      gives: [{ param: 'resolution', kind: 'range', min: 0.2, max: 0.5 }],
    }],
    uses: [],
    needs: [
      {
        item: 'plant/euv-spectrometer',
        qty: q(1),
        need: [{ param: 'resolution', kind: 'range', min: 0.2, max: 0.5 }],
        onRelax: 'functional-kept',
      },
      'plant/euv-source',
      'plant/metrology-room',
    ],
    rate: { hours: q(8) },
    steps: [
      { note_zh: 'EUV 源 13.5 nm 线进光谱仪，扫描 10–20 nm', performedBy: 'plant/robot' },
      { note_zh: '读 13.5 nm 峰 FWHM；三次扫描取平均', performedBy: 'plant/robot' },
      { note_zh: '写资格记录：0.2–0.5 nm 是资格带', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '光谱仪 1 台（进、出，不消耗）+ EUV 源 1 台（进、出，不消耗）→ 资格记录 1 份；记录是数据不是物料。',
  },
  {
    /** 液滴成像仪资格：刻线尺标定像素，频闪测抖动。 */
    id: 'qual/gate-euv-droplet-imager',
    name: 'Droplet Imager Qualification', name_zh: '液滴成像仪资格验收',
    produces: [{
      item: 'mat/gate-euv-droplet-imager-record',
      qty: q(1),
      gives: [
        { param: 'resolution', kind: 'range', min: 1, max: 3 },
        { param: 'jitter', kind: 'range', min: 2, max: 10 },
      ],
    }],
    uses: [],
    needs: [
      {
        item: 'plant/euv-droplet-imager',
        qty: q(1),
        need: [
          { param: 'resolution', kind: 'range', min: 1, max: 3 },
          { param: 'jitter', kind: 'range', min: 2, max: 10 },
        ],
        onRelax: 'functional-kept',
      },
      'plant/euv-pulser',
      'plant/metrology-room',
    ],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '刻线尺标定像素/视场；50–200× 物镜，视场 100–500 µm', performedBy: 'plant/robot' },
      { note_zh: '10–100 kHz 频闪，与液滴发生器同步；读边缘位置 100 次', performedBy: 'plant/robot' },
      { note_zh: '写资格记录：1–3 µm / 2–10 ns 是资格带', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '液滴成像仪 1 台（进、出，不消耗）+ 脉冲源 1 台（进、出，不消耗）→ 资格记录 1 份；记录是数据不是物料。',
  },
  {
    /** 660 mm 台资格：激光干涉仪逐点测位置误差与读数。 */
    id: 'qual/gate-euv-stage-660',
    name: '660 mm Dual-Layer Stage Qualification', name_zh: '660 mm 双层台资格验收',
    produces: [{
      item: 'mat/gate-euv-stage-660-record',
      qty: q(1),
      gives: [
        { param: 'positionError', kind: 'range', min: 0.5, max: 1 },
        { param: 'readout', kind: 'range', min: 0.5, max: 1 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'plant/euv-stage-660', qty: q(1) }] }],
    needs: ['plant/laser-stage', 'plant/metrology-room'],
    rate: { hours: q(16) },
    steps: [
      { note_zh: '660 mm 行程，激光干涉仪每 10 mm 取一点；正反各一遍', performedBy: 'plant/robot' },
      { note_zh: '两级误差 RSS；热漂与重复性各取 10 点', performedBy: 'plant/robot' },
      { note_zh: '写资格记录：0.5–1 nm 是资格带', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 绝对平晶资格：三平晶绝对法 + AFM。 */
    id: 'qual/gate-euv-absolute-flat',
    name: 'Absolute Optical Flat Qualification', name_zh: '绝对平晶资格验收',
    produces: [{
      item: 'mat/gate-euv-absolute-flat-record',
      qty: q(1),
      gives: [
        { param: 'figure', kind: 'range', min: 0.1, max: 0.2 },
        { param: 'roughness', kind: 'range', min: 0.1, max: 0.2 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'std/euv-absolute-flat', qty: q(3) }] }],
    needs: ['plant/ref-flat-interferometer', 'plant/afm', 'plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '三块平晶两两对研/绝对法，干涉仪读面形；三块互检取一致值', performedBy: 'plant/robot' },
      { note_zh: 'AFM 5 点 × 3 块测粗糙度', performedBy: 'plant/robot' },
      { note_zh: '写资格记录：0.1–0.2 nm rms 是资格带', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 660 mm 多层膜镜资格：子孔径拼接读周期/反射率。 */
    id: 'qual/gate-euv-hina-mirror',
    name: '660 mm Multilayer Mirror Qualification', name_zh: '660 mm 多层膜镜资格验收',
    produces: [{
      item: 'mat/gate-euv-hina-mirror-record',
      qty: q(1),
      gives: [
        { param: 'period', kind: 'range', min: 6.8, max: 7 },
        { param: 'reflectivity', kind: 'range', min: 65, max: 70 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'plant/euv-stepper-hina/mirror', qty: q(1) }] }],
    needs: ['plant/euv-stepper-hina/atw-interferometer', 'plant/euv-reflectometer', 'plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '13.5 nm 8 帧移相，2001×2001；按 300 mm 子孔径拼接全覆盖', performedBy: 'plant/robot' },
      { note_zh: '衍射级次读周期；13.5 nm 反射计读子孔径反射率并加权拼接', performedBy: 'plant/robot' },
      { note_zh: '写资格记录：6.8–7 nm / 65–70 % 是资格带', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 10.6 µm 铜镜资格：AFM + 干涉仪 + FTIR。 */
    id: 'qual/gate-copper-mirror-10.6',
    name: '10.6 µm Copper Mirror Qualification', name_zh: '10.6 µm 铜镜资格验收',
    produces: [{
      item: 'mat/gate-copper-mirror-10.6-record',
      qty: q(1),
      gives: [
        { param: 'roughness', kind: 'range', min: 10, max: 20 },
        { param: 'figure', kind: 'range', min: 50, max: 100 },
        { param: 'reflectivity', kind: 'range', min: 0.98, max: 0.99 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'std/copper-mirror-10.6', qty: q(1) }] }],
    needs: ['plant/afm', 'plant/ref-flat-interferometer', 'plant/ftir', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: 'AFM 5 点（中心 + 四象限）测 roughness', performedBy: 'plant/robot' },
      { note_zh: '干涉仪测 figure；10.6 µm FTIR 反射附件测 reflectivity', performedBy: 'plant/robot' },
      { note_zh: '写资格记录：10–20 nm / 50–100 nm / 0.98–0.99 是资格带', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 10.6 µm 离轴抛物镜资格：同铜镜三项。 */
    id: 'qual/gate-copper-oap-10.6',
    name: '10.6 µm Off-Axis Parabolic Mirror Qualification', name_zh: '10.6 µm 离轴抛物镜资格验收',
    produces: [{
      item: 'mat/gate-copper-oap-10.6-record',
      qty: q(1),
      gives: [
        { param: 'roughness', kind: 'range', min: 10, max: 20 },
        { param: 'figure', kind: 'range', min: 50, max: 100 },
        { param: 'reflectivity', kind: 'range', min: 0.98, max: 0.99 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'std/copper-oap-10.6', qty: q(1) }] }],
    needs: ['plant/afm', 'plant/ref-flat-interferometer', 'plant/ftir', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: 'AFM 5 点测 roughness；离轴量按子孔径拼接', performedBy: 'plant/robot' },
      { note_zh: '干涉仪测 figure；10.6 µm FTIR 测 reflectivity', performedBy: 'plant/robot' },
      { note_zh: '写资格记录：10–20 nm / 50–100 nm / 0.98–0.99 是资格带', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 输出耦合镜资格：反射率/粗糙度。 */
    id: 'qual/gate-copper-output-coupler',
    name: '10.6 µm Output Coupler Qualification', name_zh: '10.6 µm 输出耦合镜资格验收',
    produces: [{
      item: 'mat/gate-copper-output-coupler-record',
      qty: q(1),
      gives: [
        { param: 'reflectivity', kind: 'range', min: 0.6, max: 0.9 },
        { param: 'roughness', kind: 'range', min: 10, max: 20 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'std/copper-output-coupler-10.6', qty: q(1) }] }],
    needs: ['plant/afm', 'plant/ftir', 'plant/metrology-room'],
    rate: { hours: q(6) },
    steps: [
      { note_zh: 'AFM 5 点测镜面 roughness，孔边单独测', performedBy: 'plant/robot' },
      { note_zh: '10.6 µm FTIR 测 reflectivity；孔用影像仪抽检', performedBy: 'plant/robot' },
      { note_zh: '写资格记录：0.6–0.9 / 10–20 nm 是资格带', performedBy: 'plant/robot' },
    ],
  },
  {
    /** ZnSe 窗口资格：FTIR + AFM + 干涉仪四项。 */
    id: 'qual/gate-znse-window',
    name: 'ZnSe Window Qualification', name_zh: 'ZnSe 窗口资格验收',
    produces: [{
      item: 'mat/gate-znse-window-record',
      qty: q(1),
      gives: [
        { param: 'transmission', kind: 'range', min: 0.95, max: 0.97 },
        { param: 'absorption', kind: 'range', min: 0.1, max: 0.5 },
        { param: 'roughness', kind: 'range', min: 1, max: 1 },
        { param: 'flatness', kind: 'range', min: 50, max: 70 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'std/znse-window', qty: q(1) }] }],
    needs: ['plant/ftir', 'plant/afm', 'plant/ref-flat-interferometer', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: 'FTIR 测 10.6 µm 透射率与吸收；三点取平均', performedBy: 'plant/robot' },
      { note_zh: 'AFM 5 点测 roughness；干涉仪测 flatness', performedBy: 'plant/robot' },
      { note_zh: '写资格记录：0.95–0.97 / 0.1–0.5 %/cm / 1 nm / 50–70 nm 是资格带', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 板条激光器资格：量热器 + 光束分析仪表。 */
    id: 'qual/gate-slab-laser-20kw',
    name: '20 kW Slab CO₂ Laser Qualification', name_zh: '20 kW 板条 CO₂ 激光器资格验收',
    produces: [{
      item: 'mat/gate-slab-laser-20kw-record',
      qty: q(1),
      gives: [{ param: 'power', kind: 'range', min: 18000, max: 22000 }],
    }],
    uses: [{ anyOf: [{ item: 'plant/euv-source/laser', qty: q(1) }] }],
    needs: ['plant/laser-calorimeter', 'plant/laser-beam-profiler', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '水冷量热器全功率吸收，流量/温差读 P = ṁ cp ΔT；三点取平均', performedBy: 'plant/robot' },
      { note_zh: '刀口扫描核对焦斑与模式；写功率与光斑记录', performedBy: 'plant/robot' },
      { note_zh: '写资格记录：18–22 kW 是资格带', performedBy: 'plant/robot' },
    ],
  },
  {
    /** RF 发生器资格：量热计/示波器读功率、效率、稳定度。 */
    id: 'qual/gate-rf-generator-20kw',
    name: '20 kW/27 MHz RF Generator Qualification', name_zh: '20 kW/27 MHz RF 发生器资格验收',
    produces: [{
      item: 'mat/gate-rf-generator-20kw-record',
      qty: q(1),
      gives: [
        { param: 'power', kind: 'range', min: 18000, max: 22000 },
        { param: 'efficiency', kind: 'range', min: 0.7, max: 0.85 },
        { param: 'stability', kind: 'range', min: 0.2, max: 0.5 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'plant/rf-generator-20kw', qty: q(1) }] }],
    needs: ['plant/laser-calorimeter', 'plant/scope-1ghz', 'plant/metrology-room'],
    rate: { hours: q(12) },
    steps: [
      { note_zh: '14 路模块逐级加到 20 kW，水冷假负载吸收；量热器读输出功率', performedBy: 'plant/robot' },
      { note_zh: '量输入电功率，efficiency = 输出/输入；示波器看 30 s 幅度稳定度', performedBy: 'plant/robot' },
      { note_zh: '写资格记录：18–22 kW / 0.7–0.85 / 0.2–0.5 % 是资格带', performedBy: 'plant/robot' },
    ],
  },
  {
    /** RF 合成器资格：插损（14 路合 1）。 */
    id: 'qual/gate-rf-combiner',
    name: '14:1 RF Combiner Qualification', name_zh: '14:1 RF 合成器资格验收',
    produces: [{
      item: 'mat/gate-rf-combiner-record',
      qty: q(1),
      gives: [{ param: 'insertionLoss', kind: 'range', min: 0.3, max: 0.8 }],
    }],
    uses: [{ anyOf: [{ item: 'std/rf-combiner', qty: q(1) }] }],
    needs: ['plant/laser-calorimeter', 'std/dmm-7half-general', 'plant/metrology-room'],
    rate: { hours: q(6) },
    steps: [
      { note_zh: '14 路逐路输入 27 MHz，量热器读合成前后功率；插损 = 10log(Pin/Pout)', performedBy: 'plant/robot' },
      { note_zh: '幅度/相位配对后复测；每路 3 次取平均', performedBy: 'plant/robot' },
      { note_zh: '写资格记录：0.3–0.8 dB 是资格带', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 光束分析仪资格：焦斑/指向。 */
    id: 'qual/gate-laser-beam-profiler',
    name: '10.6 µm Beam Profiler Qualification', name_zh: '10.6 µm 光束质量分析仪资格验收',
    produces: [{
      item: 'mat/gate-laser-beam-profiler-record',
      qty: q(1),
      gives: [
        { param: 'focusSpot', kind: 'range', min: 20, max: 50 },
        { param: 'pointing', kind: 'range', min: 20, max: 50 },
      ],
    }],
    uses: [],
    needs: [
      {
        item: 'plant/laser-beam-profiler',
        qty: q(1),
        need: [
          { param: 'focusSpot', kind: 'range', min: 20, max: 50 },
          { param: 'pointing', kind: 'range', min: 20, max: 50 },
        ],
        onRelax: 'functional-kept',
      },
      'plant/laser-calorimeter',
      'plant/laser-stage',
      'plant/metrology-room',
    ],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '10.6 µm 准直，刀口扫描重建焦斑；双探测器读质心', performedBy: 'plant/robot' },
      { note_zh: '30 min 内每 5 min 读一次质心，取指向漂移', performedBy: 'plant/robot' },
      { note_zh: '写资格记录：20–50 µm / 20–50 µrad 是资格带', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '光束分析仪 1 台（进、出，不消耗）+ 量热器/台（进、出，不占用）→ 资格记录 1 份；记录是数据不是物料。',
  },
  {
    /** 量热器资格：电加热标定准确度。 */
    id: 'qual/gate-laser-calorimeter',
    name: '20 kW Calorimeter Qualification', name_zh: '20 kW 量热器资格验收',
    produces: [{
      item: 'mat/gate-laser-calorimeter-record',
      qty: q(1),
      gives: [{ param: 'accuracy', kind: 'range', min: 0.5, max: 1 }],
    }],
    uses: [],
    needs: [
      {
        item: 'plant/laser-calorimeter',
        qty: q(1),
        need: [{ param: 'accuracy', kind: 'range', min: 0.5, max: 1 }],
        onRelax: 'functional-kept',
      },
      'std/dmm-7half-general',
      'plant/scope-1ghz',
      'plant/metrology-room',
    ],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '电加热 0–30 kW 分段标定，DMM 读加热功率；流量/温差同步采样', performedBy: 'plant/robot' },
      { note_zh: '每段 5 点，线性拟合残差 = accuracy；30 s 稳定度另记', performedBy: 'plant/robot' },
      { note_zh: '写资格记录：0.5–1 % 是资格带', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '量热器 1 台（进、出，不消耗）+ DMM/示波器（进、出，不占用）→ 资格记录 1 份；记录是数据不是物料。',
  },
  {
    /** 气体循环资格：温度稳定度。 */
    id: 'qual/gate-laser-gas-loop',
    name: 'Laser Gas Circulation Qualification', name_zh: '激光气体循环资格验收',
    produces: [{
      item: 'mat/gate-laser-gas-loop-record',
      qty: q(1),
      gives: [{ param: 'tempStability', kind: 'range', min: 0.5, max: 2 }],
    }],
    uses: [{ anyOf: [{ item: 'plant/laser-gas-loop', qty: q(1) }] }],
    needs: ['std/thermocouple-t-general', 'std/millivoltmeter-general', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '100–1000 m³/h、10–100 kPa 下，进出口各 3 支 T 型热电偶', performedBy: 'plant/robot' },
      { note_zh: '30 min 内每 30 s 采样，取进出口温差的峰峰值', performedBy: 'plant/robot' },
      { note_zh: '写资格记录：0.5–2 K 是资格带', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 快刀伺服资格：闭环分辨率。 */
    id: 'qual/gate-fast-tool-servo',
    name: 'Fast Tool Servo Qualification', name_zh: '快刀伺服资格验收',
    produces: [{
      item: 'mat/gate-fast-tool-servo-record',
      qty: q(1),
      gives: [{ param: 'resolution', kind: 'range', min: 1, max: 10 }],
    }],
    uses: [{ anyOf: [{ item: 'plant/fast-tool-servo', qty: q(1) }] }],
    needs: ['plant/ref-flat-interferometer', 'plant/scope-1ghz', 'plant/metrology-room'],
    rate: { hours: q(6) },
    steps: [
      { note_zh: '电容传感器闭环，给 1 nm 阶跃/正弦；干涉仪读实际位移', performedBy: 'plant/robot' },
      { note_zh: '1–10 kHz 扫频，取 -3 dB 带宽；分辨率按 10 次阶跃极差', performedBy: 'plant/robot' },
      { note_zh: '写资格记录：1–10 nm 是资格带', performedBy: 'plant/robot' },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...GATE_EUV_OPTICS_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...GATE_EUV_OPTICS_ROUTES];
