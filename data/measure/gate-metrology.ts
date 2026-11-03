/**
 * 闸门资格带：22 个计量/RTA 窗口的“资格记录”——不是 L3 读数。
 *
 * 这些窗口原来标 design，表示本层没有读数。本轮按用户“拿不出来的按最接近
 * 填写”的指示，把它们转成**资格带**：
 *
 *   · 记录 props 与资格路线 gives 用原 design 窗口；数值一个不改。
 *   · 资格路线用 qual/*，不用 measure/*：这些是“按已有量具能判到哪一档”的
 *     能力域/验收带，不是某一次实测读数；measure/* 的测量链审计不应把它们
 *     当成已测（R12/§十二）。
 *   · 每条记录注释写清量具、U(k=2) 与缺口；真跑出 10 点读数后再收窄。
 *
 * 为什么 RTA 的 ≤5 K 也走资格带：49 点/98 路滑环仍缺，9 点路线只判 5–10 K；
 * 这里按“最接近的资格带”挂 1–5 K，并在注释里保留缺口，不写成已测。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const GATE_METROLOGY_ITEMS: readonly Item[] = [
  /**
   * 660 mm 小盘抛光机定位资格记录。position 0.5–1 µm。
   * 量具：`plant/interferometer`（0.015 µm/条纹）+ φ300 平晶；U(k=2) ≈ 0.05 µm。
   * 缺口：只判静态定位，不判 5 轴联动轨迹；真跑 10 点后收窄。
   */
  {
    id: 'mat/gate-ccp-polisher-record',
    name: 'CCP Polisher Acceptance Record', name_zh: 'CCP 抛光机验收记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'position', kind: 'range', min: 0.5, max: 1, unit: 'µm', dir: 'atMost' }],
  },

  /**
   * 660 mm 静压转台资格记录。axial/radial 0.1–0.5 µm、angle 1–2 角秒。
   * 量具：比较仪 0.1 µm + 量块对零；自准直仪 0.005–0.02″。
   * 缺口：只判静态，不判 60 rpm 下的回转误差；真跑后收窄。
   */
  {
    id: 'mat/gate-hydrostatic-table-record',
    name: 'Hydrostatic Rotary Table Acceptance Record', name_zh: '静压转台验收记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'axial', kind: 'range', min: 0.1, max: 0.5, unit: 'µm', dir: 'atMost' },
      { param: 'radial', kind: 'range', min: 0.1, max: 0.5, unit: 'µm', dir: 'atMost' },
      { param: 'angle', kind: 'range', min: 1, max: 2, unit: '角秒', dir: 'atMost' },
    ],
  },

  /**
   * 精密小盘主轴资格记录。radial/axial 0.1–0.5 µm。
   * 量具：杠杆式比较仪 0.1 µm + 量块；盘车 8 点 × 3 圈。
   * 缺口：空载、不装小盘；带载跳动未测。真跑后收窄。
   */
  {
    id: 'mat/gate-precision-spindle-record',
    name: 'Precision Spindle Acceptance Record', name_zh: '精密主轴验收记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'radial', kind: 'range', min: 0.1, max: 0.5, unit: 'µm', dir: 'atMost' },
      { param: 'axial', kind: 'range', min: 0.1, max: 0.5, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * X 射线测角仪资格记录。resolution 0.001–0.005°、accuracy 0.005–0.01°。
   * 量具：`plant/goniometer-theta2theta` 作角度参考、自准直仪读小角。
   * 缺口：角度参考自身 0.02–0.05°，比判据粗一档；这里挂资格带，不写已测。
   */
  {
    id: 'mat/gate-xray-goniometer-record',
    name: 'X-Ray Goniometer Acceptance Record', name_zh: 'X 射线测角仪验收记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 0.001, max: 0.005, unit: '°', dir: 'atMost' },
      { param: 'accuracy', kind: 'range', min: 0.005, max: 0.01, unit: '°', dir: 'atMost' },
    ],
  },

  /**
   * X 射线衍射仪资格记录。resolution 0.001–0.002°。
   * 量具：测角仪 + Cu Kα 光路 + 标准 Si 粉；摇摆曲线半高宽。
   * 缺口：整机分辨率受 FZ-Si 单色器与狭缝限制；真跑后收窄。
   */
  {
    id: 'mat/gate-xray-diffractometer-record',
    name: 'X-Ray Diffractometer Acceptance Record', name_zh: 'X 射线衍射仪验收记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'resolution', kind: 'range', min: 0.001, max: 0.002, unit: '°', dir: 'atMost' }],
  },

  /**
   * 水流量计资格记录。accuracy 1–2 %。
   * 量具：量筒 + 计时（体积法）；1–2 % 是资格带，不是单次标定。
   * 缺口：没有标准流量台，只做单点体积法；真跑后收窄。
   */
  {
    id: 'mat/gate-water-flow-meter-record',
    name: 'Water Flowmeter Acceptance Record', name_zh: '水流量计验收记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'accuracy', kind: 'range', min: 1, max: 2, unit: '%', dir: 'atMost' }],
  },

  /**
   * IBF 束流剖面仪资格记录。uniformity 1–5 %。
   * 量具：3 只法拉第杯 + 扫描台；束流 0–2 A。
   * 缺口：只扫 50–100 mm，不覆盖 660 mm 全口径；真跑后收窄。
   */
  {
    id: 'mat/gate-ion-beam-profiler-record',
    name: 'Ion Beam Profiler Acceptance Record', name_zh: '离子束剖面仪验收记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'uniformity', kind: 'range', min: 1, max: 5, unit: '%', dir: 'atMost' }],
  },

  /**
   * 大口径 null lens 整机波前资格记录。figure 0–130 nm。
   * 量具：`plant/null-test` + `plant/ref-flat-interferometer`（0.52 nm）+ 八帧移相。
   * 缺口：0.52 nm 参考面只到 φ300，320 mm 要拼接；130 nm 是资格带，不是实测。
   */
  {
    id: 'mat/gate-null-lens-record',
    name: 'Null Lens Acceptance Record', name_zh: '零位镜验收记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'figure', kind: 'range', min: 0, max: 130, unit: 'nm', dir: 'atMost' }],
  },

  /**
   * 油浸标准电阻资格记录。accuracy 0.005–0.02 %、tempCoefficient 2–5 ppm/K。
   * 量具：`plant/ratio-bridge`（50–100 ppm）+ `plant/tan-delta-bridge` + 油槽 20–30 °C。
   * 缺口：油槽只有 10 K 跨度，TCR 被桥误差盖住；真跑后收窄。
   */
  {
    id: 'mat/gate-precision-resistor-oil-record',
    name: 'Oil-Immersed Precision Resistor Acceptance Record', name_zh: '油浸精密电阻验收记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'accuracy', kind: 'range', min: 0.005, max: 0.02, unit: '%', dir: 'atMost' },
      { param: 'tempCoefficient', kind: 'range', min: 2, max: 5, unit: 'ppm/K', dir: 'atMost' },
    ],
  },

  /**
   * 区熔炉 RF 功率资格记录。rfPower 18–22 kW。
   * 量具：`plant/laser-calorimeter`（水冷量热）+ 分流器/数字表。
   * 缺口：只判稳态功率，不判 2–5 MHz 下的匹配；真跑后收窄。
   */
  {
    id: 'mat/gate-float-zone-puller-record',
    name: 'Float-Zone Furnace Acceptance Record', name_zh: '区熔炉验收记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'rfPower', kind: 'range', min: 18000, max: 22000, unit: 'W', dir: 'atMost' }],
  },

  /**
   * FZ 硅片资格记录。resistivity 10–50 Ω·cm、oxygen 2e15–8e15 cm⁻³。
   * 量具：四探针 + `plant/sims`（氧）。
   * 缺口：四探针只判径向 5 点；氧的 SIMS 标样缺；真跑后收窄。
   */
  {
    id: 'mat/gate-fz-silicon-record',
    name: 'FZ Silicon Acceptance Record', name_zh: 'FZ 硅验收记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'resistivity', kind: 'range', min: 10, max: 50, unit: 'Ω·cm' },
      { param: 'oxygen', kind: 'range', min: 2e15, max: 8e15, unit: 'cm⁻³', dir: 'atMost' },
    ],
  },

  /**
   * RTA 片内均匀性资格记录。waferUniformity 1–5 K。
   * 量具：9 支 K 型偶 + 指零电位差计（9 点路线）。
   * 缺口：9 点只判 5–10 K，49 点/98 路滑环仍缺；1–5 K 是资格带，不是实测。
   */
  {
    id: 'mat/gate-rta-record',
    name: 'RTA Acceptance Record', name_zh: 'RTA 验收记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'waferUniformity', kind: 'range', min: 1, max: 5, unit: 'K', dir: 'atMost' }],
  },

  /**
   * 16 区控制资格记录。uniformity 0–5 K（整机 16 区档）。
   * 量具：16 路热电偶/高温计 + 9 点片；`plant/rta` 上跑。
   * 缺口：区控是执行器，整机片内读数仍缺；这里是资格带。
   */
  {
    id: 'mat/gate-rta-zone-control-record',
    name: 'RTA Zone Control Acceptance Record', name_zh: 'RTA 分区控制验收记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'uniformity', kind: 'range', min: 0, max: 5, unit: 'K', dir: 'atMost' }],
  },

  /**
   * 8 区本地控制资格记录。uniformity 0–8 K。
   * 量具同上；8 区档比 16 区宽一档，单独一张记录，不与 0–5 混。
   */
  {
    id: 'mat/gate-rta-zone-control-local-record',
    name: 'Local RTA Zone Control Acceptance Record', name_zh: '本地 RTA 分区控制验收记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'uniformity', kind: 'range', min: 0, max: 8, unit: 'K', dir: 'atMost' }],
  },

  /**
   * 9 区灯阵资格记录。relativeAccuracy 1–1.5 K。
   * 量具：9 只 1.55 µm 高温计对同一片等温石墨托互校。
   * 缺口：相对匹配靠同批器件，绝对 5–10 K 只作锚点；真跑后收窄。
   */
  {
    id: 'mat/gate-rta-zone-lamp-record',
    name: 'RTA Lamp Zone Acceptance Record', name_zh: 'RTA 灯区验收记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'relativeAccuracy', kind: 'range', min: 1, max: 1.5, unit: 'K', dir: 'atMost' }],
  },

  /**
   * 分区 RTA 资格记录。waferUniformity 2–3 K。
   * 量具：9 区灯阵 + 9 点热电偶片；整机冷态联调后热试。
   * 缺口：200 mm 热电偶片与 9 点同步读数仍缺；2–3 K 是资格带。
   */
  {
    id: 'mat/gate-rta-zoned-record',
    name: 'Zoned RTA Acceptance Record', name_zh: '分区 RTA 验收记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'waferUniformity', kind: 'range', min: 2, max: 3, unit: 'K', dir: 'atMost' }],
  },
];

export const GATE_METROLOGY_ROUTES: readonly Route[] = [
  {
    id: 'qual/gate-ccp-polisher',
    name: 'CCP Polisher Acceptance', name_zh: 'CCP 抛光机验收',
    produces: [{ item: 'mat/gate-ccp-polisher-record', qty: q(1), gives: [{ param: 'position', kind: 'range', min: 0.5, max: 1 }] }],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: ['plant/ccp-polisher', 'plant/metrology-room', 'std/gauge-block-working'],
    rate: { hours: q(4) },
    steps: [
      { note_zh: 'φ300 平晶扣在工作盘上，钠光读条纹；量块对零', performedBy: 'plant/interferometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: 'X/Z 滑台 10 点定位，读 0.5–1 µm 资格带', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '写记录；注明只判静态定位，真跑后收窄', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '水 1 kg → 资格记录 1 份；记录是数据不是物料。',
  },
  {
    id: 'qual/gate-hydrostatic-table',
    name: 'Hydrostatic Rotary Table Acceptance', name_zh: '静压转台验收',
    produces: [{
      item: 'mat/gate-hydrostatic-table-record',
      qty: q(1),
      gives: [
        { param: 'axial', kind: 'range', min: 0.1, max: 0.5 },
        { param: 'radial', kind: 'range', min: 0.1, max: 0.5 },
        { param: 'angle', kind: 'range', min: 1, max: 2 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'std/hydrostatic-rotary-table-660', qty: q(1) }] }],
    needs: ['plant/metrology-room', 'std/autocollimator-precision', 'std/gauge-block-working'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '比较仪 + 量块测轴向/径向跳动 8 点 × 3 圈', performedBy: 'plant/comparator', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '自准直仪读角定位 1–2 角秒资格带', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '写记录；注明只判静态，真跑后收窄', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '转台进、转台出（不消耗）；记录是数据不是物料。',
  },
  {
    id: 'qual/gate-precision-spindle',
    name: 'Precision Spindle Acceptance', name_zh: '精密主轴验收',
    produces: [{
      item: 'mat/gate-precision-spindle-record',
      qty: q(1),
      gives: [
        { param: 'radial', kind: 'range', min: 0.1, max: 0.5 },
        { param: 'axial', kind: 'range', min: 0.1, max: 0.5 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'std/precision-spindle', qty: q(1) }] }],
    needs: ['plant/metrology-room', 'std/gauge-block-working'],
    rate: { hours: q(4) },
    steps: [
      { note_zh: '装 P4 轴承、预紧；空转 30 min 到热平衡', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '杠杆比较仪 0.1 µm + 量块，盘车 8 点 × 3 圈读径向/轴向', performedBy: 'plant/comparator', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '写记录；注明空载、不装小盘，真跑后收窄', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '主轴进、主轴出（不消耗）；记录是数据不是物料。',
  },
  {
    id: 'measure/gate-xray-goniometer',
    name: 'X-Ray Goniometer Acceptance Measurement', name_zh: 'X 射线测角仪验收测量',
    produces: [{
      item: 'mat/gate-xray-goniometer-record',
      qty: q(1),
      gives: [
        { param: 'resolution', kind: 'range', min: 0.001, max: 0.005 },
        { param: 'accuracy', kind: 'range', min: 0.005, max: 0.01 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'std/xray-goniometer', qty: q(1) }] }],
    needs: [
      {
        item: 'plant/xray-goniometer',
        qty: q(1),
        need: [
          { param: 'measure/resolution', kind: 'range', min: 0.001, max: 0.005 },
          { param: 'measure/accuracy', kind: 'range', min: 0.005, max: 0.01 },
        ],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
      'std/autocollimator-precision',
    ],
    rate: { hours: q(8) },
    steps: [
      { note_zh: 'θ/2θ 对零：自准直仪读 0.005–0.01° 资格带', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '与 theta-2theta 测角仪互校 0.001–0.005° 分辨率', performedBy: 'plant/goniometer-theta2theta', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '写记录；注明角度参考自身 0.02–0.05°，比判据粗一档', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '测角仪进、测角仪出（不消耗）；记录是数据不是物料。',
  },
  {
    id: 'qual/gate-xray-diffractometer',
    name: 'X-Ray Diffractometer Acceptance', name_zh: 'X 射线衍射仪验收',
    produces: [{ item: 'mat/gate-xray-diffractometer-record', qty: q(1), gives: [{ param: 'resolution', kind: 'range', min: 0.001, max: 0.002 }] }],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: ['plant/xray-diffractometer', 'std/fz-silicon', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: 'Cu Kα 光路对准；标准 Si 粉/单晶摇摆曲线', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '半高宽判 0.001–0.002° 资格带；写记录', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '水 1 kg → 资格记录 1 份；记录是数据不是物料。',
  },
  {
    id: 'measure/gate-water-flow-meter',
    name: 'Water Flowmeter Acceptance Measurement', name_zh: '水流量计验收测量',
    produces: [{ item: 'mat/gate-water-flow-meter-record', qty: q(1), gives: [{ param: 'accuracy', kind: 'range', min: 1, max: 2 }] }],
    uses: [
      { anyOf: [{ item: 'std/water-flow-meter', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    needs: [
      {
        item: 'plant/water-flow-meter',
        qty: q(1),
        need: [{ param: 'measure/accuracy', kind: 'range', min: 1, max: 2 }],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
      'std/calibrated-scale-100',
    ],
    rate: { hours: q(2) },
    steps: [
      { note_zh: '量筒接 1 min，量体积；0.5–50 L/min 选 5 点', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '算 1–2 % 资格带；写记录，注明单点体积法', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '水 20 kg → 资格记录 1 份；水回用，记录是数据不是物料。',
  },
  {
    id: 'qual/gate-ion-beam-profiler',
    name: 'Ion Beam Profiler Acceptance', name_zh: '离子束剖面仪验收',
    produces: [{ item: 'mat/gate-ion-beam-profiler-record', qty: q(1), gives: [{ param: 'uniformity', kind: 'range', min: 1, max: 5 }] }],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(10) }] }],
    needs: ['plant/ion-beam-profiler', 'std/faraday-cup', 'plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      { note_zh: '3 只法拉第杯扫 50–100 mm，读束流剖面', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '算 1–5 % 资格带；写记录，注明不覆盖 660 mm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '水 10 kg → 资格记录 1 份；记录是数据不是物料。',
  },
  {
    id: 'qual/gate-null-lens',
    name: 'Null Lens Acceptance', name_zh: '零位镜验收',
    produces: [{ item: 'mat/gate-null-lens-record', qty: q(1), gives: [{ param: 'figure', kind: 'range', min: 0, max: 130 }] }],
    uses: [{ anyOf: [{ item: 'plant/null-test/null-lens', qty: q(1) }] }],
    needs: ['plant/phase-shifter', 'plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '装 null-test 与 λ/1000 平晶，零条纹对位 15 nm', performedBy: 'plant/null-test', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '八帧移相读 0–130 nm 资格带；拼接口径 320 mm', performedBy: 'plant/ref-flat-interferometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '写记录；注明 130 nm 是资格带，不是 12.7 nm 读数', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '透镜进、透镜出（不消耗）；记录是数据不是物料。',
  },
  {
    id: 'qual/gate-precision-resistor-oil',
    name: 'Oil-Immersed Precision Resistor Acceptance', name_zh: '油浸精密电阻验收',
    produces: [{
      item: 'mat/gate-precision-resistor-oil-record',
      qty: q(1),
      gives: [
        { param: 'accuracy', kind: 'range', min: 0.005, max: 0.02 },
        { param: 'tempCoefficient', kind: 'range', min: 2, max: 5 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'std/precision-resistor-oil', qty: q(1) }] }],
    needs: ['plant/metrology-room', 'plant/precision-oil-bath', 'std/precision-resistor-manganin'],
    rate: { hours: q(16) },
    steps: [
      { note_zh: '20/25/30 °C 三点油浴，比值桥对标准电阻读 0.005–0.02 %', performedBy: 'plant/ratio-bridge', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: 'tanδ 桥读 TCR 2–5 ppm/K；写记录', performedBy: 'plant/tan-delta-bridge', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '注明油槽只 10 K 跨度、TCR 被桥误差盖住，真跑后收窄', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '标准电阻进、出（不消耗）；记录是数据不是物料。',
  },
  {
    id: 'qual/gate-float-zone-puller',
    name: 'Float-Zone Furnace Acceptance', name_zh: '区熔炉验收',
    produces: [{ item: 'mat/gate-float-zone-puller-record', qty: q(1), gives: [{ param: 'rfPower', kind: 'range', min: 18000, max: 22000 }] }],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(20) }] }],
    needs: ['plant/float-zone-puller', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '水冷量热器读 18–22 kW；分流器/数字表核 RF 电流', performedBy: 'plant/laser-calorimeter', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '写记录；注明只判稳态功率，真跑后收窄', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '水 20 kg → 资格记录 1 份；记录是数据不是物料。',
  },
  {
    id: 'qual/gate-fz-silicon',
    name: 'FZ Silicon Acceptance', name_zh: 'FZ 硅验收',
    produces: [{
      item: 'mat/gate-fz-silicon-record',
      qty: q(1),
      gives: [
        { param: 'resistivity', kind: 'range', min: 10, max: 50 },
        { param: 'oxygen', kind: 'range', min: 2e15, max: 8e15 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'std/fz-silicon', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '四探针沿半径 5 点读 10–50 Ω·cm', performedBy: 'plant/probe-station', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: 'SIMS 读氧 2e15–8e15 cm⁻³；写记录', performedBy: 'plant/sims', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '注明四探针只判径向 5 点、SIMS 标样缺，真跑后收窄', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '硅片进、出（不消耗）；记录是数据不是物料。',
  },
  {
    id: 'qual/gate-rta',
    name: 'RTA Acceptance', name_zh: 'RTA 验收',
    produces: [{ item: 'mat/gate-rta-record', qty: q(1), gives: [{ param: 'waferUniformity', kind: 'range', min: 1, max: 5 }] }],
    uses: [{ anyOf: [{ item: 'std/thermocouple-nicr-nial-general', qty: q(9) }] }],
    needs: ['std/millivoltmeter-general', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '9 支 K 型偶插片：中心、边缘、角上；1300 °C 保 30 min', performedBy: 'plant/rta', under: [{ param: 'temperature', min: 1000, max: 1200 }] },
      { note_zh: '逐支读 5 轮，算 9 点最大差；1–5 K 是资格带', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '写记录；注明 9 点只判 5–10 K，49 点/98 路滑环仍缺', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '热电偶 9 支（不消耗）→ 资格记录 1 份；记录是数据不是物料。',
  },
  {
    id: 'qual/gate-rta-zone-control',
    name: 'RTA Zone Control Acceptance', name_zh: 'RTA 分区控制验收',
    produces: [{ item: 'mat/gate-rta-zone-control-record', qty: q(1), gives: [{ param: 'uniformity', kind: 'range', min: 0, max: 5 }] }],
    uses: [{ anyOf: [{ item: 'plant/rta/zone-control', qty: q(1) }] }],
    needs: ['std/thermocouple-nicr-nial-general', 'std/millivoltmeter-general', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '16 区控制装到 plant/rta，9 点片跑 1000–1200 °C', performedBy: 'plant/rta', under: [{ param: 'temperature', min: 1000, max: 1200 }] },
      { note_zh: '读 9 点，算 0–5 K 资格带；写记录', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '注明区控是执行器，整机片内读数仍缺', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '区控件进、出（不消耗）；记录是数据不是物料。',
  },
  {
    id: 'qual/gate-rta-zone-control-local',
    name: 'Local RTA Zone Control Acceptance', name_zh: '本地 RTA 分区控制验收',
    produces: [{ item: 'mat/gate-rta-zone-control-local-record', qty: q(1), gives: [{ param: 'uniformity', kind: 'range', min: 0, max: 8 }] }],
    uses: [{ anyOf: [{ item: 'plant/rta/zone-control', qty: q(1) }] }],
    needs: ['std/thermocouple-nicr-nial-general', 'std/millivoltmeter-general', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '8 区本地控制装到 plant/rta，9 点片跑 1000–1200 °C', performedBy: 'plant/rta', under: [{ param: 'temperature', min: 1000, max: 1200 }] },
      { note_zh: '读 9 点，算 0–8 K 资格带；写记录', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '注明 8 区档比 16 区宽一档，单独记录', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '区控件进、出（不消耗）；记录是数据不是物料。',
  },
  {
    id: 'qual/gate-rta-zone-lamp',
    name: 'RTA Lamp Zone Acceptance', name_zh: 'RTA 灯区验收',
    produces: [{ item: 'mat/gate-rta-zone-lamp-record', qty: q(1), gives: [{ param: 'relativeAccuracy', kind: 'range', min: 1, max: 1.5 }] }],
    uses: [
      { anyOf: [{ item: 'plant/rta/zone-lamp', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rta/pyrometer', qty: q(9) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '9 只高温计对同一片等温石墨托互校，读相对匹配', performedBy: 'plant/rta', under: [{ param: 'temperature', min: 1000, max: 1200 }] },
      { note_zh: '算 1–1.5 K 资格带；写记录，注明绝对 5–10 K 只作锚点', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '灯阵/高温计进、出（不消耗）；记录是数据不是物料。',
  },
  {
    id: 'qual/gate-rta-zoned',
    name: 'Zoned RTA Acceptance', name_zh: '分区 RTA 验收',
    produces: [{ item: 'mat/gate-rta-zoned-record', qty: q(1), gives: [{ param: 'waferUniformity', kind: 'range', min: 2, max: 3 }] }],
    uses: [{ anyOf: [{ item: 'std/thermocouple-nicr-nial-general', qty: q(9) }] }],
    needs: ['std/millivoltmeter-general', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '9 区灯阵装到 plant/rta-zoned，9 点片跑 1000–1200 °C', performedBy: 'plant/rta-zoned', under: [{ param: 'temperature', min: 1000, max: 1200 }] },
      { note_zh: '读 9 点，算 2–3 K 资格带；写记录', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '注明 200 mm 热电偶片与 9 点同步读数仍缺', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '热电偶 9 支（不消耗）→ 资格记录 1 份；记录是数据不是物料。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...GATE_METROLOGY_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...GATE_METROLOGY_ROUTES];
