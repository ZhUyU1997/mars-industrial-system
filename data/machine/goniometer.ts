/**
 * OES 870 nm 一级衍射效率的**量具**：0–90° θ/2θ 测角仪 + 绝对反射率标准。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 先对一处数据冲突
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 任务书要「一级衍射效率 **60–85 % @870 nm**」。数据里现有
 * `plant/refractometer/oes-grating` 的效率是：
 *
 *   非闪耀（48 nm 浅槽）        **1.5–3 %（估算）**
 *   斜离子束弱闪耀（3–4° 面）   **8–15 %（设计值）**
 *
 * 60–85 % 是 **32° 深槽闪耀光栅**的目标：`oes-grating.ts` 第十一节写明
 * 「32°/40–60 % 要 520 nm 深槽 + 厚胶/深刻蚀；本层做不到」——图案转移
 * 上限 50 nm（150 nm 刻划 × 3:1）、刀尖几何 250–313 nm、32° 面与 ±2 %
 * 深度三把锁，差 10.4×（缺口总表）。所以：
 *
 *   · 本文件建的是**测角仪 + 反射率标准**（任务书 1、2 两条），
 *     它能把现有光栅的效率从「估算/设计值」变成**实测值**；
 *   · 测出来的是 **1.5–15 %**，不是 60–85 %；60–85 % 在记录里作
 *     `blazedTarget` 参考列 + `shortfall` 4–57×，**不写成读数**
 *     （R15/R16：没有 32° 深槽，就没有 60–85 % 的读数）；
 *   · 要 60–85 % 的读数，先补 32° 深槽（A 类，10.4×，不在本轮）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 测角仪：复用现有零件，不另造一套转台
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * grep 确认（数据里有什么、没有什么）：
 *   · **没有**名为 `autocollimator` 的条目。最接近的两处：
 *       `plant/refractometer/telescope`（准直管/望远镜；`unblock-refractometer-
 *       telescope.ts` 用它做「自准直校验」）；
 *       `plant/comparator/mirror` + `reticle`（杠杆上的自准直光管，读数在
 *       0.1 mm 刻度尺上，不是独立自准直仪）。
 *   · **转台**：`plant/dividing-table`（蜗轮副，重复性 0.1–0.5″、分度误差
 *     0.5–2″、步距 0.005–0.5°）；`plant/refractometer/circle`（玻璃分度盘，
 *     0–90°、读到 1″）。两者都不是「0–90° θ/2θ 双臂」。
 *
 * 所以本文件的做法是**搭**，不是买：
 *
 *   θ 轴、2θ 轴   2 × `plant/dividing-table`（机器，进 `needs`；模型里设备
 *                 不能进 uses，所以只写一次 id，注释记「两轴各一台」）
 *   角度读数      2 × `plant/refractometer/circle`（1″；直接进 BOM）
 *   自准直光管    1 × `plant/refractometer/telescope` + `plant/interferometer/
 *                 splitter`（4 % 分光板）+ `plant/interferometer/flat`（参考
 *                 平晶）+ `plant/pyrometer/filament`（照明丝）→ 做成一个零件
 *   光源          1 × `plant/xenon-lamp`（200–2500 nm，机器，进 needs）
 *   准直/偏振     1 × `plant/refractometer/telescope` + `slit` + `chopper`
 *                 + `plant/ellipsometer/polarizer`（布儒斯特片堆，18 dB）
 *
 * 角精度：分度台重复性 0.1–0.5″（0.00003–0.00014°）、分度盘 1″；自准直
 * 光管的绝对零位 0.02–0.05°（受目镜分划板与参考平晶限制）——所以整机
 * **绝对角精度 0.02–0.05° 由自准直光管定**，分辨率 0.01° 由分度盘/步距定。
 * 这正好是任务书的两个数，且它们不是同一个来源。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 反射率标准：99 % PTFE 白板 与 硅片菲涅耳，两条路线
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `make/reflectance-standard-si`
 *       硅片是**绝对**标准：R = ((n−1)² + k²)/((n+1)² + k²)；
 *       870 nm 的 Si：n = 3.6、k = 0.015 ⇒ R = 6.760/21.160 = **0.319**；
 *       n/k 的 ±2 % 与表面粗糙度（Ra ≤1 nm）给 **0.3–0.5 %** 不确定度。
 *       波长 400–1100 nm（Si 的透明区到 1.1 µm，再长就吸收，不能当镜面标准）。
 *
 *   `make/reflectance-standard-ptfe`
 *       99 % 白板：PTFE 粉压片（20–50 MPa）→ 360–380 °C 烧结 → 车平面。
 *       它的绝对值不是自明的：用硅片菲涅耳标准在 500/870/1300 nm 三点
 *       **传递**（同一台测角仪/探测器，比值法），再与 `mat/barium-sulfate`
 *       比对一次；给 **0.5–1 %** 不确定度、200–2000 nm（PTFE 在 200–2000
 *       都白，短波端到 200 nm 仍 >95 %）。
 *
 * 两条路线产出同一个 `std/reflectance-standard`，`type` 枚举区分
 * diffuse/specular；测量路线按样品选一条。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 交付（设计值）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   角度       θ 0–90°、2θ 0–90°、分辨 0.01°、绝对 0.02–0.05°
 *   样品       φ50–100 mm
 *   光源       200–2000 nm（Xe 灯 200–2500 + 准直/偏振/斩波）
 *   反射率标准 99 % PTFE（0.5–1 %）或 Si 菲涅耳 31.9 %（0.3–0.5 %）
 *   探测器     Si 200–1100 / InGaAs 900–1700 / 热电堆 300–20000 nm（绝对功率）
 *
 * ═══ R13 ═══
 * 本文件只有 Item + Route；测量路线与记录在 `data/measure/grating-efficiency.ts`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const GONIOMETER_ITEMS: readonly Item[] = [
  /**
   * **0–90° θ/2θ 测角仪（套）。**
   *
   * 它是一台**角度-功率**量具：样品转 θ、探测器臂转 2θ，在任意角度上读
   * 衍射功率。交付口径：
   *   thetaRange       0–90°
   *   twoThetaRange    0–90°
   *   angularResolution 0.01°（分度台步距 0.005–0.5° + 分度盘 1″）
   *   angularAccuracy  0.02–0.05°（自准直光管的绝对零位；不是分度盘的 1″）
   *   sampleDiameter   50–100 mm
   *   wavelengthRange  200–2000 nm（Xe 灯 + 准直/偏振/斩波）
   *
   * ⚠️ **它不维持温度**（`holds` 空）：19–21 °C 由计量间给；否则
   * "造它要 19–21、它又提供 19–21" 会形成 `condition_cycle`。
   */
  {
    id: 'plant/goniometer-theta2theta',
    name: 'θ/2θ 测角仪',
    unit: '套',
    category: 'machine',
    props: [
      { param: 'thetaRange', kind: 'range', min: 0, max: 90, unit: '°' },
      { param: 'twoThetaRange', kind: 'range', min: 0, max: 90, unit: '°' },
      { param: 'measure/angularResolution', kind: 'range', min: 0.01, max: 0.01, unit: '°' },
      { param: 'angularAccuracy', kind: 'range', min: 0.02, max: 0.05, unit: '°', dir: 'atMost' },
      { param: 'sampleDiameter', kind: 'range', min: 50, max: 100, unit: 'mm' },
      { param: 'wavelengthRange', kind: 'range', min: 200, max: 2000, unit: 'nm' },
    ],
  },

  /**
   * 底座与光学平台。HT250 铸铁，时效后铣/磨；两轴安装面平行度 ≤0.02 mm。
   * 它决定两轴的交点与水平：交点偏 0.1 mm 在 200 mm 臂上是 0.03°。
   */
  { id: 'plant/goniometer-theta2theta/base', name: '测角仪底座与光学平台', unit: '件', category: 'part' },

  /** 样品台。φ50–100 铝台 + 三顶一拉调平 + PTFE 垫；台面跳动 ≤0.01 mm。 */
  {
    id: 'plant/goniometer-theta2theta/sample-stage',
    name: '测角仪样品台',
    unit: '件',
    category: 'part',
    props: [{ param: 'diameter', kind: 'range', min: 50, max: 100, unit: 'mm' }],
  },

  /** 2θ 探测器臂。200–400 mm 臂长、φ20 光阑、可换探测器座；臂端跳动 ≤0.02 mm。 */
  {
    id: 'plant/goniometer-theta2theta/detector-arm',
    name: '2θ 探测器臂',
    unit: '件',
    category: 'part',
    props: [{ param: 'armLength', kind: 'range', min: 200, max: 400, unit: 'mm' }],
  },

  /**
   * 三探测器组：Si（200–1100 nm）+ InGaAs（900–1700 nm）+ 热电堆（300–20000 nm，
   * 绝对功率）。Si/InGaAs 读信号，热电堆读绝对功率；线性 0.5–1 %。
   */
  {
    id: 'plant/goniometer-theta2theta/detector',
    name: '测角仪三探测器组',
    unit: '件',
    category: 'part',
    props: [
      { param: 'wavelengthRange', kind: 'range', min: 200, max: 2000, unit: 'nm' },
      { param: 'linearity', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 自准直光管：望远镜 + 4 % 分光板 + 照明丝 + 参考平晶（λ/10）。
   *
   * 原理：照明丝照亮目镜焦面上的十字分划，光经望远镜成平行光出射；样品
   * 表面把光反射回来，十字像回到分划板。像与分划重合 = 样品法线与光轴
   * 平行。绝对角精度 0.02–0.05° 由分划板线宽/目镜倍率与参考平晶的平面度定。
   *
   * 它复用 `plant/refractometer/telescope` 与 `plant/interferometer/` 的
   * 分光板/平晶——数据里没有独立的 autocollimator 条目（grep 确认）。
   */
  {
    id: 'plant/goniometer-theta2theta/autocollimator',
    name: '测角仪自准直光管',
    unit: '件',
    category: 'part',
    props: [{ param: 'angularAccuracy', kind: 'range', min: 0, max: 0.05, unit: '°', dir: 'atMost' }],
  },

  /**
   * 光源准直/偏振/斩波组件：准直管 + 可调狭缝 + 布儒斯特片堆偏振器 + 斩波器。
   *
   *   wavelengthRange 200–2000 nm（Xe 灯经准直管；熔石英 200 nm 起）
   *   extinction      ≥15–20 dB（复用 `plant/ellipsometer/polarizer` 的 18 dB 片堆）
   *   斩波            200 Hz（锁相用）
   */
  {
    id: 'plant/goniometer-theta2theta/source-collimator',
    name: '测角仪光源准直组件',
    unit: '件',
    category: 'part',
    props: [
      { param: 'wavelengthRange', kind: 'range', min: 200, max: 2000, unit: 'nm' },
      { param: 'extinction', kind: 'range', min: 15, max: 20, unit: 'dB', dir: 'atLeast' },
    ],
  },

  /**
   * **绝对反射率标准。99 % PTFE 白板 或 硅片菲涅耳镜面。**
   *
   *   reflectance     0–100 %（PTFE 97–99；Si 30–34 @870）
   *   uncertainty     0.3–1 %（PTFE 0.5–1；Si 0.3–0.5）
   *   wavelengthRange 200–2000 nm（PTFE）/ 400–1100 nm（Si）
   *   type            diffuse / specular
   *
   * 它给测角仪一个**绝对反射率锚**：测光栅效率时，入射功率/参考镜的反射率
   * 用它校准；没有它，P1/P0 只是相对值。
   */
  {
    id: 'std/reflectance-standard',
    name: '绝对反射率标准',
    unit: '件',
    category: 'part',
    props: [
      { param: 'reflectance', kind: 'range', min: 0, max: 100, unit: '%' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 2, unit: '%', dir: 'atMost' },
      { param: 'wavelengthRange', kind: 'range', min: 200, max: 2000, unit: 'nm' },
      { param: 'type', kind: 'enum', values: ['diffuse', 'specular'] },
    ],
  },
];

export const GONIOMETER_ROUTES: readonly Route[] = [
  {
    /** 底座：HT250 浇 → 时效 → 铣 → 磨两轴安装面（平行度 ≤0.02 mm）。 */
    id: 'make/goniometer-base',
    name: '测角仪底座与光学平台制造',
    produces: [{ item: 'plant/goniometer-theta2theta/base', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: 'HT250 浇底座、时效 6 个月（或 550 °C 4 h 去应力）', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1300, max: 1500 }] },
      { note_zh: '铣两轴安装面与光学平台；磨到平行度 ≤0.02 mm、平面度 ≤0.01 mm', performedBy: 'plant/grinder' },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: 'HT250 1 + 45 钢 1 + 薄钢板 1 → 底座 1 件；铸件余量/浇冒口不回炉，产物按件计',
  },

  {
    /** 样品台：铝台 φ50–100 + 三顶一拉调平 + PTFE 垫；台面跳动 ≤0.01 mm。 */
    id: 'make/goniometer-sample-stage',
    name: '测角仪样品台制造',
    produces: [
      {
        item: 'plant/goniometer-theta2theta/sample-stage',
        qty: q(1),
        gives: [{ param: 'diameter', kind: 'range', min: 50, max: 100 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车铝台 φ50–100、铣三顶一拉座；装 PTFE 垫与压簧', performedBy: 'lathe' },
      { note_zh: '调平台面：跳动 ≤0.01 mm、与 θ 轴垂直 ≤0.01 mm（千分表 + 量块）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(16) },
    unbalanced_zh: '铝 1 + 45 钢 1 + PTFE 0.01 → 样品台 1 件；产物按件计',
  },

  {
    /** 2θ 臂：45 钢臂 200–400 mm + 铝光阑座 + 铜配重；臂端跳动 ≤0.02 mm。 */
    id: 'make/goniometer-detector-arm',
    name: '2θ 探测器臂制造',
    produces: [
      {
        item: 'plant/goniometer-theta2theta/detector-arm',
        qty: q(1),
        gives: [{ param: 'armLength', kind: 'range', min: 200, max: 400 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车/铣臂体（200–400 mm）、光阑座 φ20、配重；臂端跳动 ≤0.02 mm', performedBy: 'lathe' },
      { note_zh: '装臂到 2θ 分度台：与 θ 轴同心 ≤0.02 mm，转 90° 高度差 ≤0.02 mm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(16) },
    unbalanced_zh: '45 钢 1 + 铝 1 + 铜 0.01 → 臂 1 件；产物按件计',
  },

  {
    /**
     * 三探测器组：Si + InGaAs + 热电堆，同一滑座上换位。
     *
     *   Si 200–1100 nm、InGaAs 900–1700 nm、热电堆 300–20000 nm（绝对）
     *   线性 0.5–1 %（用双光路/衰减片法量）
     */
    id: 'make/goniometer-detector',
    name: '测角仪三探测器组制造',
    produces: [
      {
        item: 'plant/goniometer-theta2theta/detector',
        qty: q(1),
        gives: [
          { param: 'wavelengthRange', kind: 'range', min: 200, max: 2000 },
          { param: 'linearity', kind: 'range', min: 0.5, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/photodiode-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/photodiode-ingaas', qty: q(1) }] },
      { anyOf: [{ item: 'std/thermopile-detector-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '装三只探测器与跨阻前放：Si 0.4 A/W、InGaAs 0.8–1.1 A/W、热电堆 0.2–0.5 V/W；同一滑座换位重复 ≤0.1 mm', performedBy: 'plant/robot' },
      { note_zh: '量线性：用两片衰减片（透过 50 %/25 %）叠出 4 档，非线性 <0.5–1 %；暗电流 <1 nA', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(16) },
    unbalanced_zh: 'Si 1 + InGaAs 1 + 热电堆 1 + 运放 2 + 铝 0.01 + 铜 0.01 → 探测器组 1 件；产物按件计',
  },

  {
    /**
     * 自准直光管：望远镜 + 4 % 分光板 + 照明丝 + 参考平晶（λ/10）。
     *
     *   望远镜 1 + 分光板 1 + 参考平晶 1 + 照明丝 1 + 玻璃/氢氟酸（十字分划）
     */
    id: 'make/goniometer-autocollimator',
    name: '测角仪自准直光管制造',
    produces: [
      {
        item: 'plant/goniometer-theta2theta/autocollimator',
        qty: q(1),
        gives: [{ param: 'angularAccuracy', kind: 'range', min: 0.02, max: 0.05 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/refractometer/telescope', qty: q(1) }] },
      { anyOf: [{ item: 'plant/interferometer/splitter', qty: q(1) }] },
      { anyOf: [{ item: 'plant/interferometer/flat', qty: q(1) }] },
      { anyOf: [{ item: 'plant/pyrometer/filament', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 1000) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '在玻璃上刻十字分划（线宽 5–10 µm）并氢氟酸轻蚀；装到望远镜焦面', performedBy: 'plant/robot' },
      { note_zh: '装 4 % 分光板与照明丝：照明丝经分光板照亮分划，样品反射像回到分划；对准参考平晶（λ/10）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '量绝对角精度：转台走 ±0.2°、±0.05°，与参考平晶的自准直像比；0.02–0.05° 才收', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '望远镜 1 + 分光板 1 + 参考平晶 1 + 照明丝 1 + 玻璃 0.01 + HF 0.001 → 自准直光管 1 件；产物按件计',
  },

  {
    /**
     * 光源准直/偏振/斩波：准直管 + 狭缝 + 布儒斯特片堆 + 斩波器。
     *
     *   望远镜 1 + 狭缝 1 + 偏振器 1 + 斩波器 1 + 铝/钢座
     */
    id: 'make/goniometer-source-collimator',
    name: '测角仪光源准直组件制造',
    produces: [
      {
        item: 'plant/goniometer-theta2theta/source-collimator',
        qty: q(1),
        gives: [
          { param: 'wavelengthRange', kind: 'range', min: 200, max: 2000 },
          { param: 'extinction', kind: 'range', min: 15, max: 20 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/refractometer/telescope', qty: q(1) }] },
      { anyOf: [{ item: 'plant/refractometer/slit', qty: q(1) }] },
      { anyOf: [{ item: 'plant/ellipsometer/polarizer', qty: q(1) }] },
      { anyOf: [{ item: 'plant/refractometer/chopper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '装准直管 + 10 µm 狭缝 + 偏振器 + 200 Hz 斩波；出射光平行度 <0.1 mrad（刀口法）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '量消光比：偏振器转 0/90°，消光 ≥15 dB（片堆 18 dB，装调留 3 dB）；透射 ≥70 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(16) },
    unbalanced_zh: '望远镜 1 + 狭缝 1 + 偏振器 1 + 斩波器 1 + 铝 0.01 + 钢 0.5 → 准直组件 1 件；产物按件计',
  },

  {
    /**
     * **测角仪整机：底座 + 两台分度台 + 两轴分度盘 + 双臂 + 自准直 + 光源/探测。**
     *
     * 装配顺序（19–21 °C 计量间）：
     *   ① 两台 `plant/dividing-table` 装到底座上（θ 与 2θ 同心 ≤0.02 mm）；
     *   ② 两只 `plant/refractometer/circle` 装到两轴（1″ 读数）；
     *   ③ 样品台装 θ 轴、探测器臂装 2θ 轴；
     *   ④ 自准直光管装在 2θ 臂上方，对参考平晶；
     *   ⑤ 光源准直组件对 θ 轴（入射角 α = 22.00°）；
     *   ⑥ 角度联调：θ 走 0–45°、2θ 走 0–90°，用自准直/参考平晶核 0.02–0.05°。
     *
     * `needs` 里 `plant/dividing-table` 写一次，实际用两台（模型 needs 不带数量）；
     * `plant/xenon-lamp` 是 200–2500 nm 的光源。
     */
    id: 'make/goniometer-theta2theta',
    name: 'θ/2θ 测角仪制造',
    produces: [
      {
        item: 'plant/goniometer-theta2theta',
        qty: q(1),
        gives: [
          { param: 'thetaRange', kind: 'range', min: 0, max: 90 },
          { param: 'twoThetaRange', kind: 'range', min: 0, max: 90 },
          { param: 'measure/angularResolution', kind: 'range', min: 0.01, max: 0.01 },
          { param: 'angularAccuracy', kind: 'range', min: 0.02, max: 0.05 },
          { param: 'sampleDiameter', kind: 'range', min: 50, max: 100 },
          { param: 'wavelengthRange', kind: 'range', min: 200, max: 2000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/goniometer-theta2theta/base', qty: q(1) }] },
      { anyOf: [{ item: 'plant/goniometer-theta2theta/sample-stage', qty: q(1) }] },
      { anyOf: [{ item: 'plant/goniometer-theta2theta/detector-arm', qty: q(1) }] },
      { anyOf: [{ item: 'plant/goniometer-theta2theta/detector', qty: q(1) }] },
      { anyOf: [{ item: 'plant/goniometer-theta2theta/autocollimator', qty: q(1) }] },
      { anyOf: [{ item: 'plant/goniometer-theta2theta/source-collimator', qty: q(1) }] },
      // 两轴的角度读数：1″ 玻璃分度盘，θ 与 2θ 各一只
      { anyOf: [{ item: 'plant/refractometer/circle', qty: q(2) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
    ],
    needs: ['plant/dividing-table', 'plant/xenon-lamp', 'plant/metrology-room'],
    steps: [
      { note_zh: '装两台分度台（θ/2θ）到底座：同心 ≤0.02 mm、两轴平行 ≤0.02 mm；装两只分度盘与读数显微镜', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装样品台与 2θ 臂；自准直光管对参考平晶，调零位；光源准直组件对 θ 轴，入射角 α = 22.00°', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '角度联调：θ 0–45°、2θ 0–90° 走 0.01° 步，与自准直/参考平晶比；绝对角精度 0.02–0.05° 才收', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '光源/探测器联调：Xe 灯 200–2000 nm 经准直/偏振/斩波，Si/InGaAs/热电堆读 0 级与一级；暗室、锁相 200 Hz', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(48) },
    unbalanced_zh: '底座 1 + 样品台 1 + 臂 1 + 探测器 1 + 自准直 1 + 准直组件 1 + 分度盘 2 + 钢板 1 + 铜 0.1 → 测角仪 1 套；分度台与 Xe 灯在 needs（设备不进 uses），它们的机时不重复计',
  },

  {
    /**
     * **硅片菲涅耳反射率标准：绝对，R = ((n−1)²+k²)/((n+1)²+k²)。**
     *
     *   870 nm：n = 3.6、k = 0.015 ⇒ R = (6.760 + 0.000225)/(21.160 + 0.000225)
     *   = **0.3192**；n/k 的 ±2 % 与 Ra ≤1 nm 给 0.3–0.5 % 不确定度。
     *   波长 400–1100 nm（Si 到 1.1 µm 透明；再长吸收，不能当镜面标准）。
     */
    id: 'make/reflectance-standard-si',
    name: '绝对反射率标准制造',
    produces: [
      {
        item: 'std/reflectance-standard',
        qty: q(1),
        gives: [
          { param: 'reflectance', kind: 'range', min: 30, max: 34 },
          { param: 'uncertainty', kind: 'range', min: 0.3, max: 0.5 },
          { param: 'wavelengthRange', kind: 'range', min: 400, max: 1100 },
          { param: 'type', kind: 'enum', oneOf: ['specular'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: 'HF 30 s 去自然氧化层、超纯水冲、N₂ 吹干；Ra ≤1 nm（原子力/椭偏仪抽检）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 40 }, { param: 'pressure', min: 100, max: 200 }] },
      { note_zh: '装铝座；算 R：n = 3.6、k = 0.015 ⇒ 0.3192；用椭偏仪核 n/k（±2 %），记 30–34 %、0.3–0.5 % 不确定度', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(8) },
    unbalanced_zh: '硅片 1 + HF 0.001 + 水 0.01 + 铝 0.01 → 标准 1 件；硅片不消耗（测完留样），产物按件计',
  },

  {
    /**
     * **PTFE 99 % 白板：压片 → 烧结 → 车面 → 用硅片菲涅耳传递。**
     *
     *   PTFE 粉 0.1 kg 压 φ50×5（20–50 MPa）→ 360–380 °C 烧结 2 h →
     *   缓冷 → 车平面（Ra ≤0.5 µm）。
     *
     * 绝对值不是自明的：用硅片菲涅耳标准（30–34 %）在同一台测角仪上
     * 比值传递——PTFE/硅的比值 × 0.319 = PTFE 的 R；探测器线性 0.5–1 %
     * 是主项。再与 `mat/barium-sulfate` 压片比对一次（BaSO₄ 也是 95–98 %
     * 的白板，只作旁证，不作绝对锚）。
     */
    id: 'make/reflectance-standard-ptfe',
    name: '绝对反射率标准制造',
    produces: [
      {
        item: 'std/reflectance-standard',
        qty: q(1),
        gives: [
          { param: 'reflectance', kind: 'range', min: 97, max: 99 },
          { param: 'uncertainty', kind: 'range', min: 0.5, max: 1 },
          { param: 'wavelengthRange', kind: 'range', min: 200, max: 2000 },
          { param: 'type', kind: 'enum', oneOf: ['diffuse'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/barium-sulfate', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 100) }] },
    ],
    needs: ['plant/goniometer-theta2theta', 'plant/metrology-room'],
    steps: [
      { note_zh: '压片：PTFE 粉 0.1 kg 装 φ50 模，20–50 MPa 压 5 min；360–380 °C 烧结 2 h、缓冷 24 h', performedBy: 'plant/robot' },
      { note_zh: '烧结炉：360–380 °C（PTFE 熔点 327 °C，烧结窗口 360–380）；随炉冷到 100 °C 以下再取', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 360, max: 380 }] },
      { note_zh: '车平面：Ra ≤0.5 µm、平面度 ≤0.02 mm；φ50×5 白板装铝座', performedBy: 'lathe' },
      { note_zh: '传递：测角仪上 500/870/1300 nm 三点，PTFE/硅片比值 × 0.319 = R；与 BaSO₄ 压片比对旁证；97–99 %、0.5–1 % 才收', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: 'PTFE 0.1 + BaSO₄ 0.001 + 硅片 1（传递后留样）+ 铝 0.01 → 标准 1 件；PTFE 压片余料 0.05 kg 回用，产物按件计',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...GONIOMETER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...GONIOMETER_ROUTES];
