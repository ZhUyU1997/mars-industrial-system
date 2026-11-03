/**
 * 光学量测的两件能力 —— 白光垂直扫描干涉轮廓仪 + 可溯源成像式 DBO 套刻量具。
 *
 * 这一份回答两个缺口（2026-10-20）：
 *
 *   ① `plant/cmos-test/optical-profiler` 原来只有条目、没有路线（`data/material/
 *      cmos-test-assets.ts`）：垂直 0.1 nm 与横向 1 µm **没有一台同时满足**；
 *      本文件把它拆成 Mirau 物镜 + PZT 移相台 + 白光光源 + 计量 CCD 四件，
 *      再装成整机。整机交付 vertical 0.05–0.2 nm、lateral 0.5–1 µm、FOV 0.1–2 mm。
 *
 *   ② 可溯源套刻只有机内 2.7 nm（`measure/euv-hina`），独立 DBO / 亚纳米 CD-SEM
 *      没有；CD-SEM 的 vernier 只到 0.1 µm，差 200 倍。本文件建
 *      `plant/overlay-metrology`（成像式 DBO：照明 + NA 0.9 物镜 + 计量相机 +
 *      0.5 nm 测长台），交付 overlay 不确定度 ≤0.5 nm、点距 ≤30 nm；标定用
 *      `std/overlay-standard`（已知偏移 0/2/5/10 nm，e-beam 写 + SEM 交叉标定）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 口径
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 全部数值是**设计值（Earth 工程值）**，不是实测值。本文件没有 `measure/*`
 * 读数记录；没有 `data/measure/` 的记录就不写“闭合”。
 * 这里只回答“路线怎么写才成立、缺多少”。
 *
 * 两个能力各有一条整机路线和一条测量路线（`measure/` 前缀），测量路线的
 * `gives` 是这台仪器/这条方法能覆盖的窗口；记录条目的 `props` 是实测窗口的
 * 类型声明。**没有测之前，窗口不是读数。**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么 VSI / Mirau + PZT 能到 0.1 nm，而本层原来的 0.52 nm 面形仪不能
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   0.52 nm 那台（`plant/ref-flat-interferometer`）是 φ300 斐索面形仪：它读的是
 *   整口径条纹，没有显微物镜；4.8 µm 物镜那台（`plant/mask-aligner`）没有纳米级
 *   高度读出。两件事必须同时成立，所以需要**显微干涉**：
 *
 *     Mirau 物镜      把参考镜放到物镜与样品之间，共光路、对振动不敏感；
 *                     NA 0.3–0.55、工作距 1–3 mm，横向分辨 ≈ 0.61λ/NA =
 *                     0.7–1.2 µm（设计值，λ 取 550 nm 中心）
 *     PZT 移相台      行程 10–100 µm、闭环 0.1–1 nm；八帧/十六帧移相把
 *                     条纹小数解出来，垂直读出不再靠人眼数条纹
 *     白光 VSI        宽谱短相干：只有光程差 ≈0 的一点有干涉包络，包络峰值
 *                     定位给垂直高度；0.1 nm 是包络拟合的设计值，不是单帧读数
 *
 *   整机交付 0.05–0.2 nm 是“设计窗口”：0.05 nm 端要 16 帧 + 低噪声相机；
 *   0.2 nm 端是单帧/少帧的降级档。没有实测之前，这两个数都不是读数。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 套刻为什么用成像式 DBO，而不是 CD-SEM 的 vernier
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   CD-SEM 的 vernier 是 5/2 µm 框、0.1 µm/级：它读的是“第几级台阶”，
 *   不是“亚纳米相位”。0.5 nm 比 0.1 µm 小 200 倍，靠 vernier 永远读不到。
 *
 *   成像式 DBO 不靠台阶：它用一组周期 10–30 nm 的光栅靶，照明光在 ±1 级
 *   衍射上产生相位差；NA 0.9 的物镜把 ±1 级都收进光瞳，相机读干涉强度，
 *   移相/多波长解出相位，相位 × 周期/(2π) 就是偏移。0.5 nm 的不确定度
 *   来自：台 0.5 nm 测长 + 相机 2–5 e- 读出 + 标准片 0.2–0.3 nm 标定。
 *
 *   ⚠️ 这台量具的“可溯源”只到 `std/overlay-standard` 的 0.2–0.3 nm；
 *   标准片由 e-beam 写、CD-SEM 交叉标定，CD-SEM 的绝对准确度 1.5 nm
 *   （`plant/cd-sem` 的 D3）仍是这条链的上游缺口。0.5 nm 不确定度是
 *   **设计值**，不是已经拿标准片实测过的数。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 仍缺什么（带数字）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   · 垂直 0.05 nm 端：要 16 帧 + 相机读出 ≤2 e-；本文件相机设计 2–5 e-，
 *     0.05 nm 端只有 1–2 倍余量。没有实测噪声谱。
 *   · 横向 0.5 µm 端：NA 0.55 在 550 nm 的衍射极限 0.61λ/NA = 0.61 µm；
 *     0.5 µm 是**设计值**，实际要到 0.5 µm 需要 NA 0.67 或短波长，
 *     本文件按 0.61–1.0 µm 交付，0.5 µm 列为缺口（差 1.2 倍）。
 *   · 套刻 0.5 nm：标准片 0.2–0.3 nm + 台 0.5 nm + 相机 2–5 e- 的 RSS
 *     约 0.6–0.8 nm；0.5 nm 是**设计目标**，不是已经闭合的数。
 *   · 点距 30 nm：NA 0.9、λ 450–650 nm 的成像截止 0.61λ/NA = 0.30–0.44 µm；
 *     30 nm 点距靠**相位式 DBO**（不是分辨 30 nm 的图形），所以写成
 *     “点距 ≤30 nm”是靶的周期，不是物镜分辨率。
 *   · 标准片：e-beam 写 0/2/5/10 nm 的偏移，CD-SEM 交叉标定；CD-SEM 的
 *     1.5 nm 绝对准确度把 2 nm 点的相对不确定度压到 0.2–0.3 nm（设计值），
 *     但 0 nm 点的“零点”仍是 CD-SEM 的边缘判定，不是计量院的证书。
 *   · 没有 CNAS / 原厂校准：两条整机路线都只做自校；证书仍缺。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目
// ═══════════════════════════════════════════════════════════════════════════

export const OPTICAL_METROLOGY_ITEMS: readonly Item[] = [
  /**
   * 铅（Pb，99–99.9 %）。**只为一件事建它：PZT 的铅源。**
   *
   * 全表原来没有 `mat/lead`（`phase-shifter.ts` / `laser-stage.ts` 都写过
   * “铅、锆、钛三样，全表没有铅”）。PZT（Pb(Zr,Ti)O₃）绕不开铅，所以这条
   * 铅链是 PZT 陶瓷片的**前置件**，不是“再补一个金属”。
   *
   * 来源：铜电解的阳极泥。铜精矿里铅是常见杂质（阳极泥 5–15 % Pb，本文件
   * 取 **10 % 设计值**）；阳极泥在 950–1050 °C 用碳还原：
   *
   *   PbSO₄ + 2C → Pb + SO₂ + 2CO
   *   303.26 + 24.02 = 207.2 + 64.06 + 56.02
   *
   * 1000 kg 阳极泥（100 kg Pb = 146.2 kg PbSO₄）+ 12 kg 碳 →
   * 100 kg 铅 + 31 kg SO₂ + 27 kg CO + 854 kg 渣。1000 + 12 = 1012 =
   * 100 + 31 + 27 + 854。**质量账是平的。**
   *
   * ⚠️ 10 % Pb 是设计值：没有阳极泥化验（本层没有铅的滴定/原子吸收）。
   * 铅的纯度 99–99.9 % 也按设计值写；PZT 不需要 99.99 %，所以这条降级
   * 不影响陶瓷片。
   */
  {
    id: 'mat/lead',
    name: 'Lead', name_zh: '铅',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 99, max: 99.9, unit: '%', dir: 'atLeast' }],
  },

  /**
   * PZT 陶瓷片（锆钛酸铅）。**一块 0.15–0.25 mm 厚的极化陶瓷片。**
   *
   * 配比按 Pb(Zr₀.₅₂Ti₀.₄₈)O₃：
   *
   *   Pb 207.2 + ZrO₂ 64.07 + TiO₂ 38.34 + O 24.00 = 333.6 g/mol
   *   1 kg PZT = 铅 0.621 + 锆石 0.192 + 钛白 0.115 + 氧 0.072
   *
   * d₃₃ 350–500 pm/V、应变 0.12–0.18 %、居里温度 280–320 °C 是设计窗口
   * （Earth 工程值；PZT-5H 一档的公开量级）。厚 0.15–0.25 mm 是为了
   * 500 V 下 2–3.3 kV/mm 的极化场，不用另做 kV 级电源。
   *
   * ⚠️ 它不是“单晶”也不是“PMN-PT”：本层只有 PZT 这条多晶陶瓷路线；
   * 压电系数比单晶低 2–3 倍，但 40 片串起来 + 20:1 杠杆够 100 µm 行程。
   */
  {
    id: 'plant/pzt-stage/pzt-ceramic',
    name: 'PZT Ceramic Plate', name_zh: 'PZT 陶瓷片',
    unit: '件',
    category: 'part',
    props: [
      { param: 'd33', kind: 'range', min: 300, max: 600, unit: 'pm/V', dir: 'atLeast' },
      { param: 'thickness', kind: 'range', min: 0.1, max: 0.3, unit: 'mm' },
      { param: 'strain', kind: 'range', min: 0.1, max: 0.2, unit: '%' },
      { param: 'curieTemperature', kind: 'range', min: 250, max: 350, unit: '°C', dir: 'atLeast' },
    ],
  },

  /**
   * PZT 台的柔性杠杆与导向。**一块 45 钢单体件，20:1 位移放大。**
   *
   * 40 片 PZT 串起来在 500 V 上给 40 × 0.4 nm/V × 500 V = 8 µm；
   * 20:1 杠杆把它放到 160 µm，限到 100 µm 就是台子的行程。
   * 缺口铰链只转微弧度，没有滑动面 —— 没有粘滑，这是亚纳米闭环的前提。
   *
   * 刚度 0.2–0.5 N/µm：PZT 堆的阻挡力约 1–2 N，杠杆后仍有 8 倍余量。
   */
  {
    id: 'plant/pzt-stage/flexure',
    name: 'PZT Stage Flexure Lever and Guide', name_zh: 'PZT 台的柔性杠杆与导向',
    unit: '件',
    category: 'part',
    props: [
      { param: 'ratio', kind: 'range', min: 15, max: 25, unit: '倍' },
      { param: 'stroke', kind: 'range', min: 50, max: 200, unit: 'µm', dir: 'atLeast' },
      { param: 'stiffness', kind: 'range', min: 0.1, max: 1, unit: 'N/µm' },
      { param: 'crossTalk', kind: 'range', min: 0.1, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 电容位移传感器。**0.05–0.2 nm 分辨、10–100 µm 量程、1–10 kHz 带宽。**
   *
   * 为什么用电容而不是光栅/干涉：台子本身要闭环，传感器必须和 PZT 堆
   * **同轴、同温、同结构**。电容极板（φ10 mm，间隙 20–50 µm）直接做在
   * 柔性杠杆的输出端，引线到 1 pF–1 nF 的电容桥；桥的参考臂用
   * `plant/probe-station/cap-standard`（10 pF/100 pF/1 nF，0.01–10 %）。
   *
   * 0.1 nm 从哪来：20 µm 间隙、φ10 mm 极板，C ≈ ε₀A/d ≈ 35 pF；
   * d 变 0.1 nm 是 ΔC/C = 5×10⁻⁶；桥的 1 µV 零位 + 100 kHz 时基能读出。
   * 这是设计值；实测噪声没有记录。
   */
  {
    id: 'plant/pzt-stage/capacitive-sensor',
    name: 'PZT Capacitive Displacement Sensor', name_zh: 'PZT 电容位移传感器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 0.05, max: 0.2, unit: 'nm', dir: 'atMost' },
      { param: 'range', kind: 'range', min: 10, max: 100, unit: 'µm' },
      { param: 'bandwidth', kind: 'range', min: 1, max: 10, unit: 'kHz', dir: 'atLeast' },
      { param: 'linearity', kind: 'range', min: 0.01, max: 0.1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * PZT 闭环驱动。**0–500 V、0.1–1 mV 设定、1–10 kHz 带宽。**
   *
   * 功率级用 `plant/phase-shifter/drive`（1000 V 他励直流发电机 + 励磁变阻器
   * + 薄膜电容；0–1000 V、纹波 ≤0.1 %、重复性 0.1 %）—— 本层没有高压运放，
   * 机电发电机是唯一现成的 kV 级源。外面套一层比较环：电容传感器 → 误差
   * 积分 → 励磁/串联微调。0.1 mV × 40 片 × 20 = 0.08 nm 的设定分辨，
   * 正好落在传感器的 0.1 nm 噪声里。
   */
  {
    id: 'plant/pzt-stage/driver',
    name: 'PZT Closed-Loop Driver', name_zh: 'PZT 闭环驱动',
    unit: '件',
    category: 'part',
    props: [
      { param: 'voltageRange', kind: 'range', min: 0, max: 500, unit: 'V' },
      { param: 'resolution', kind: 'range', min: 0.1, max: 1, unit: 'mV', dir: 'atMost' },
      { param: 'bandwidth', kind: 'range', min: 1, max: 10, unit: 'kHz', dir: 'atLeast' },
      { param: 'ripple', kind: 'range', min: 0.01, max: 0.1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * PZT 移相/扫描台。**行程 10–100 µm、闭环 0.1–1 nm、整定 20–50 ms。**
   *
   * 40 片 PZT 陶瓷串堆 + 20:1 柔性杠杆 + 两只电容传感器（差分）+ 闭环驱动。
   * 台面是 `plant/phase-shifter/platen`（HT250，400×300×40，30 kg）——
   * 与 `plant/phase-shifter` 共用同一块平台，热共模与它同源。
   *
   * 为什么不是 `plant/phase-shifter`：那一台是 221 nm 行程的石英压电堆，
   * 给斐索移相；这一台要 10–100 µm 的扫描行程，只能靠 PZT + 杠杆。
   * 为什么不是工业 PZT 台：本层没有滚珠丝杠/静压导轨，长行程靠杠杆放大，
   * 行程与分辨率是同一笔账（放大 20 倍，分辨率也放大 20 倍，闭环把它拉回来）。
   */
  {
    id: 'plant/pzt-stage',
    name: 'PZT Phase Shift/Scan Stage', name_zh: 'PZT 移相/扫描台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'travel', kind: 'range', min: 10, max: 100, unit: 'µm', dir: 'atLeast' },
      { param: 'resolution', kind: 'range', min: 0.1, max: 1, unit: 'nm', dir: 'atMost' },
      { param: 'closedLoop', kind: 'enum', values: ['yes', 'no'] },
      { param: 'settling', kind: 'range', min: 10, max: 100, unit: 'ms', dir: 'atMost' },
    ],
  },

  /**
   * Mirau 物镜的镜组。**3–5 片熔石英/玻璃透镜，NA 0.45–0.55。**
   *
   * 可见光显微物镜的数值孔径由前组正透镜的孔径与后组负透镜的场曲共同定；
   * 本层没有光学设计软件，按“三片式 + 一片场曲校正”的公版结构做，再用
   * `plant/ion-beam-figuring` 修非球面。面形 0.8–1.2 nm 是设计值。
   *
   * ⚠️ 本层手抛光学的最好纪录是 NA 0.07（`plant/edge-aligner/objective`）；
   * NA 0.55 的镜组不是“再抛一次”，要靠离子束修形 + 干涉仪逐片装调。
   * 这是本文件最贵的一件（120 h），也是横向 1 µm 的来源。
   */
  {
    id: 'plant/mirau-objective/lens-group',
    name: 'Mirau Objective Lens Group', name_zh: 'Mirau 物镜的镜组',
    unit: '件',
    category: 'part',
    props: [
      { param: 'lensCount', kind: 'range', min: 3, max: 5, unit: '片' },
      { param: 'na', kind: 'range', min: 0.4, max: 0.55, unit: 'NA', dir: 'atLeast' },
      { param: 'surfaceFigure', kind: 'range', min: 0.5, max: 1.5, unit: 'nm', dir: 'atMost' },
      { param: 'clearAperture', kind: 'range', min: 5, max: 10, unit: 'mm', dir: 'atLeast' },
    ],
  },

  /**
   * Mirau 物镜筒。**φ24–26 mm 内孔、同轴 1–2 µm、长 45–55 mm。**
   *
   * 它要同时装下镜组、分束片、参考镜与压圈，且三者同轴到 1–2 µm。
   * 铸铁/45 钢筒比铝好：铝的 23 ppm/K 会让 50 mm 上的同轴每 K 走 1.15 µm，
   * 正好吃掉 1–2 µm 的公差。**材料选 45 钢，不是铝。**
   */
  {
    id: 'plant/mirau-objective/barrel',
    name: 'Mirau Objective Barrel', name_zh: 'Mirau 物镜筒',
    unit: '件',
    category: 'part',
    props: [
      { param: 'bore', kind: 'range', min: 20, max: 30, unit: 'mm' },
      { param: 'concentricity', kind: 'range', min: 1, max: 3, unit: 'µm', dir: 'atMost' },
      { param: 'length', kind: 'range', min: 40, max: 60, unit: 'mm' },
    ],
  },

  /**
   * Mirau 干涉物镜。**NA 0.3–0.55、工作距 1–3 mm、20–50×、视场 0.2–2 mm。**
   *
   * 结构：镜组 + 45° 分束片（`plant/interferometer/splitter`）+ 参考镜
   * （`plant/phase-shifter/mirror`，λ/4 铝膜）+ 物镜筒。分束片把照明光分到
   * 样品与参考镜，参考镜在物镜前、与样品共光路 —— 这就是 Mirau 对振动
   * 不敏感的原因：两臂走同一只物镜。
   *
   * 工作距 1–3 mm 是几何约束：分束片 + 参考镜 + 压圈要放在物镜与样品之间，
   * 少于 1 mm 装不下，多于 3 mm 数值孔径掉下去。
   */
  {
    id: 'plant/mirau-objective',
    name: 'Mirau Interference Objective', name_zh: 'Mirau 干涉物镜',
    unit: '件',
    category: 'part',
    props: [
      { param: 'na', kind: 'range', min: 0.3, max: 0.55, unit: 'NA', dir: 'atLeast' },
      { param: 'workingDistance', kind: 'range', min: 1, max: 3, unit: 'mm' },
      { param: 'magnification', kind: 'range', min: 10, max: 50, unit: '倍', dir: 'atLeast' },
      { param: 'fieldOfView', kind: 'range', min: 0.1, max: 2, unit: 'mm', dir: 'atLeast' },
    ],
  },

  /**
   * 卤素灯。**2900–3200 K、20–50 W、500–2000 h。**
   *
   * 熔石英壳 φ12×40 + φ20 µm 钨丝 V 形 + **5 kPa 氩 + 0.1 mg 碘**。
   * 卤素循环 W + I₂ ⇌ WI₂ 把蒸发的钨送回灯丝，寿命从 100–300 h 拉到
   * 500–2000 h；VSI 要的是宽谱（400–700 nm），不是长寿命，但换灯会改
   * 光谱，所以寿命也是判据。
   *
   * 与 `plant/ir-endpoint/lamp` 的区别：那一支是 15 W、5 kPa 氩、无碘，
   * 给 870 nm 终点；这一支加碘、功率 20–50 W，给白光干涉。
   */
  {
    id: 'plant/white-light-source/halogen-lamp',
    name: 'White-Light Source Halogen Lamp', name_zh: '白光光源卤素灯',
    unit: '件',
    category: 'part',
    props: [
      { param: 'colorTemperature', kind: 'range', min: 2800, max: 3400, unit: 'K' },
      { param: 'power', kind: 'range', min: 10, max: 100, unit: 'W' },
      { param: 'lifetime', kind: 'range', min: 200, max: 5000, unit: 'h', dir: 'atLeast' },
    ],
  },

  /**
   * 白光聚光镜。**f = 25–40 mm、φ12–18 mm、透过 88–92 %。**
   *
   * 两片熔石英（双胶合做不了：没有胶），把灯丝（φ0.02 mm、8 mm 长）的像
   * 投到 Mirau 物镜的入瞳上。数值孔径按 0.15–0.2 设计，充满物镜光瞳即可；
   * 再大只会让杂散光进参考臂。
   */
  {
    id: 'plant/white-light-source/condenser',
    name: 'White-Light Source Condenser', name_zh: '白光光源白光聚光镜',
    unit: '件',
    category: 'part',
    props: [
      { param: 'focalLength', kind: 'range', min: 20, max: 50, unit: 'mm' },
      { param: 'aperture', kind: 'range', min: 10, max: 20, unit: 'mm' },
      { param: 'transmission', kind: 'range', min: 85, max: 95, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * 白光光源。**400–700 nm、10–40 W、2900–3200 K、稳定度 0.2–0.5 %。**
   *
   * 卤素灯 + 滤光轮（`plant/ellipsometer/filter-wheel`，6 位；本文件用
   * 400/550/600 nm 三档做光谱整形与 ND）+ 聚光镜 + 灯室。
   * 滤光轮不是“单色器”：本层没有光栅单色器，VSI 也不需要单色 —— 要的是
   * 宽谱短相干。三档滤光只是把 400 nm 以下与 700 nm 以上切掉，减少
   * 相机硅响应之外的杂散光。
   */
  {
    id: 'plant/white-light-source',
    name: 'White-Light Source', name_zh: '白光光源',
    unit: '件',
    category: 'part',
    props: [
      { param: 'spectrum', kind: 'range', min: 400, max: 700, unit: 'nm' },
      { param: 'power', kind: 'range', min: 5, max: 50, unit: 'W' },
      { param: 'colorTemperature', kind: 'range', min: 2800, max: 3400, unit: 'K' },
      { param: 'stability', kind: 'range', min: 0.1, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 计量 CCD 的帧积分器。**1–1000 帧、读出 1–3 e-、16 位。**
   *
   * `plant/robot/camera` 的读出噪声是 40 e-（`cis.ts` 的 3T 无源像素），
   * 单帧不够 0.1 nm；100 帧平均把随机噪声压到 4 e-，但固定图形噪声不降。
   * 帧积分器做三件事：相关双采样（扣复位噪声）、100 帧平均、16 位累加。
   * **不冷却**：暗电流 10–100 e-/s，曝光 10 ms 时暗电荷 <1 e-，可以忽略。
   */
  {
    id: 'plant/metrology-ccd/frame-integrator',
    name: 'Metrology CCD Frame Integrator', name_zh: '计量 CCD 的帧积分器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'integrationFrames', kind: 'range', min: 1, max: 1000, unit: '帧', dir: 'atLeast' },
      { param: 'readNoise', kind: 'range', min: 1, max: 5, unit: 'e-', dir: 'atMost' },
      { param: 'bitDepth', kind: 'range', min: 16, max: 16, unit: 'bit' },
    ],
  },

  /**
   * 计量 CCD。**2 MP、读出 2–5 e-、暗电流 10–50 e-/像素/s、像元 1.4–2 µm。**
   *
   * 它不是“新造一颗传感器”，是把 `plant/robot/camera`（2 MP、1.4 µm 像元、
   * 40 e- 读出）加帧积分器、遮光与温漂补偿，做成一台**可积分的计量相机**。
   * 2 MP 在 0.2 mm 视场上给 0.14 µm/像素，配 Mirau 的 0.6–1.0 µm 横向分辨
   * 有 4–7 个像素/分辨单元，够做包络拟合。
   *
   * ⚠️ 它不是科学级背照 CCD：量子效率 40–70 %、没有深度制冷；0.05 nm 端
   * 只有 1–2 倍噪声余量。这是本文件最诚实的一处降级。
   */
  {
    id: 'plant/metrology-ccd',
    name: 'Metrology CCD', name_zh: '计量 CCD',
    unit: '件',
    category: 'part',
    props: [
      { param: 'pixels', kind: 'range', min: 1, max: 5, unit: 'MP', dir: 'atLeast' },
      { param: 'readNoise', kind: 'range', min: 0.5, max: 10, unit: 'e-', dir: 'atMost' },
      { param: 'darkCurrent', kind: 'range', min: 1, max: 100, unit: 'e-/像素/s', dir: 'atMost' },
      { param: 'pixelPitch', kind: 'range', min: 1, max: 10, unit: 'µm', dir: 'atMost' },
      { param: 'quantumEfficiency', kind: 'range', min: 20, max: 80, unit: '%', dir: 'atLeast' },
    ],
    composedOf: [
      { item: 'plant/metrology-ccd/camera-head', qty: q(1) },
      { item: 'plant/metrology-ccd/frame-integrator', qty: q(1) },
      { item: 'std/opamp-chip-general', qty: q(2) },
    ],
  },

  /**
   * 套刻量具的成像物镜。**NA 0.85–0.9、50–100×、工作距 0.8–1.5 mm。**
   *
   * DBO 的 ±1 级衍射角由靶周期定：sinθ = λ/P。P = 20–30 nm、λ = 450–650 nm
   * 时 θ = 0.9–2.1°，NA 0.9 收得下；普通 0.5 NA 物镜收不全 ±1 级，
   * 信号会掉 3–5 倍。所以 0.9 不是“更亮的显微镜”，是 DBO 的带宽要求。
   *
   * 本层没有 30 片萤石物镜；这台按“4 片熔石英 + 2 片玻璃 + 离子束修形”
   * 设计，NA 0.85–0.9 是设计值，实际像差没有实测。
   */
  {
    id: 'plant/overlay-metrology/objective',
    name: 'Overlay Metrology Imaging Objective', name_zh: '套刻量具的成像物镜',
    unit: '件',
    category: 'part',
    props: [
      { param: 'na', kind: 'range', min: 0.8, max: 0.95, unit: 'NA', dir: 'atLeast' },
      { param: 'magnification', kind: 'range', min: 40, max: 120, unit: '倍', dir: 'atLeast' },
      { param: 'workingDistance', kind: 'range', min: 0.5, max: 2, unit: 'mm' },
      { param: 'fieldOfView', kind: 'range', min: 0.03, max: 0.3, unit: 'mm', dir: 'atLeast' },
    ],
  },

  /**
   * 成像式 DBO 套刻量具。**overlay 不确定度 ≤0.5 nm、点距 ≤30 nm。**
   *
   * 四件：白光照明（`plant/white-light-source`）、NA 0.9 物镜
   * （`plant/overlay-metrology/objective`）、计量相机（`plant/metrology-ccd`）、
   * 0.5 nm 测长台（`plant/euv-stepper-hina/stage`，300 mm 行程、readout 0.5 nm）。
   * 台与物镜装在 `plant/phase-shifter/platen` 上，共模热膨胀。
   *
   * 0.5 nm 不确定度是设计目标：台 0.5 nm + 相机 2–5 e- + 标准片 0.2–0.3 nm
   * 的 RSS 约 0.6–0.8 nm；0.5 nm 这一档要靠标准片逐台标定后把系统项扣掉。
   * **没有实测，不写成已闭合。**
   */
  {
    id: 'plant/overlay-metrology',
    name: 'Imaging-Based DBO Overlay Metrology Tool', name_zh: '成像式 DBO 套刻量具',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'na', kind: 'range', min: 0.8, max: 0.95, unit: 'NA', dir: 'atLeast' },
      { param: 'magnification', kind: 'range', min: 40, max: 120, unit: '倍', dir: 'atLeast' },
      { param: 'fieldOfView', kind: 'range', min: 0.03, max: 0.3, unit: 'mm', dir: 'atLeast' },
      { param: 'overlayUncertainty', kind: 'range', min: 0, max: 0.5, unit: 'nm', dir: 'atMost' },
      { param: 'pitch', kind: 'range', min: 5, max: 30, unit: 'nm', dir: 'atMost' },
      { param: 'stageReadout', kind: 'range', min: 0, max: 0.5, unit: 'nm', dir: 'atMost' },
      { param: 'wavelength', kind: 'range', min: 400, max: 700, unit: 'nm' },
    ],
  },

  /**
   * 0.1 nm 台阶标准件。**硅片上 0.08–0.1 nm 的 ALD HfO₂ 台阶。**
   *
   * 做法：10 片硅片，半片用 0.05 mm 钢掩模遮住，ALD 一个 HfO₂ 周期
   * （HfCl₄ + H₂O，200–250 °C；GPC 0.08–0.1 nm/周期）。台阶 = 一个周期的
   * 膜厚，0.08–0.1 nm。
   *
   * 标定链：
   *   ① GPC 用 25 周期（2.0 nm）的监控片 + 椭偏仪定值（2.0 ±0.05 nm）；
   *   ② 台阶用 X 射线干涉仪读相位（0.1 nm = 0.319 个 (111) 条纹，
   *      八帧相位 11° ⇒ 0.008 nm）；
   *   ③ 椭偏仪对 0.08 nm 只能判“膜在不在/均匀不均匀”，**不能定绝对值**
   *      （椭偏厚度下限 1 nm）。
   *
   * 0.01–0.02 nm 的 `uncertainty` 是设计值；没有实测记录。
   */
  {
    id: 'std/step-standard-0.1nm',
    name: '0.1 nm Step Height Standard', name_zh: '0.1 nm 台阶标准件',
    unit: '片',
    category: 'part',
    props: [
      { param: 'stepHeight', kind: 'range', min: 0.05, max: 0.12, unit: 'nm' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 0.03, unit: 'nm', dir: 'atMost' },
      { param: 'area', kind: 'range', min: 100, max: 10000, unit: 'mm²', dir: 'atLeast' },
    ],
  },

  /**
   * 套刻标准片。**已知偏移 0/2/5/10 nm 的 box-in-box 靶。**
   *
   * e-beam 直写：`plant/e-beam-column` 在 100 µm 场内闭环 10 nm 定位，
   * 先把标记写到 0/2/5/10 nm 的**程序偏移**；实际偏移由 CD-SEM 交叉标定
   * （4 nm 束斑、0.05 nm 边缘内插、cdAccuracy 1.5 nm）。
   *
   * 为什么 0/2/5/10 nm：0 nm 点给零点，2 nm 点给 0.5 nm 不确定度的
   * 最小可辨偏移，5/10 nm 点把线性段拉开。靶周期 2–10 µm，NA 0.9 的
   * 物镜在 0.08–0.15 mm 视场里装得下 8–75 个周期。
   *
   * `uncertainty` 0.2–0.3 nm 是 CD-SEM 1.5 nm 绝对准确度下的相对标定
   * 设计值；0 nm 点的零点仍是 CD-SEM 的边缘判定。
   */
  {
    id: 'std/overlay-standard',
    name: 'Overlay Standard Wafer', name_zh: '套刻标准片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'offset', kind: 'range', min: 0, max: 10, unit: 'nm' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 0.5, unit: 'nm', dir: 'atMost' },
      { param: 'pitch', kind: 'range', min: 1, max: 10, unit: 'µm' },
    ],
  },

  /**
   * 台阶高度记录。**一份记录对应一片标准件/一片工件。**
   *
   * 读数：stepHeight 0–1000 nm、uncertainty 0–0.2 nm、lateralResolution
   * 0.5–1 µm、fieldOfView 0.1–2 mm。`uncertainty` 是记录元数据，不是
   * 机器能力；0.2 nm 是设计值。
   */
  {
    id: 'mat/step-height-record',
    name: 'Step Height Record', name_zh: '台阶高度记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'stepHeight', kind: 'range', min: 0, max: 1000, unit: 'nm' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 0.2, unit: 'nm', dir: 'atMost' },
      { param: 'lateralResolution', kind: 'range', min: 0.5, max: 1, unit: 'µm' },
      { param: 'fieldOfView', kind: 'range', min: 0.1, max: 2, unit: 'mm' },
    ],
  },

  /**
   * 可溯源套刻记录。**与 `mat/overlay-record`（CD-SEM vernier，±0.6 µm）分开。**
   *
   * 读数：overlayX/Y −10..10 nm、uncertainty 0–0.5 nm、pitch 0–30 nm、
   * 10–100 点、method = dbo。它与 `measure/euv-hina-overlay` 的
   * `mat/overlay-record-hina`（机内 2.7 nm）也是两个件：那一条量的是
   * 整机重复性，这一条量的是**独立 DBO + 标准片**的偏移。
   */
  {
    id: 'mat/overlay-record-traceable',
    name: 'Traceable Overlay Record', name_zh: '可溯源套刻记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'overlayX', kind: 'range', min: -10, max: 10, unit: 'nm' },
      { param: 'overlayY', kind: 'range', min: -10, max: 10, unit: 'nm' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 0.5, unit: 'nm', dir: 'atMost' },
      { param: 'pitch', kind: 'range', min: 0, max: 30, unit: 'nm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 10, max: 100, unit: '点' },
      { param: 'method', kind: 'enum', values: ['dbo', 'sem'] },
    ],
  },

  /**
   * 大口径 null lens 的整机波前记录。能力域 `figure/wavefront 0–200 nm rms`、
   * `aperture 0–400 mm`、`points 1–100`；不是 λ/50（12.7 nm）读数。
   *
   * `assemble/large-null-lens` 交的是每面 figure 0–130 的 design；CGH 标定
   * 读的是系统残差 5–6 nm 与复装 10 nm，两者不能直接换算成整机 λ/50。
   * 这一条用 `plant/null-test` + `plant/ref-flat-interferometer`（0.52 nm）
   * + 八帧移相，测整机波前；300 mm 参考平晶盖 320 mm 口径要拼接。
   */
  {
    id: 'mat/null-lens-wavefront-record',
    name: 'Large-Aperture Null Lens System Wavefront Record', name_zh: '大口径 null lens 的整机波前记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'figure', kind: 'range', min: 0, max: 500, unit: 'nm rms', dir: 'atMost' },
      { param: 'wavefront', kind: 'range', min: 0, max: 500, unit: 'nm rms', dir: 'atMost' },
      { param: 'aperture', kind: 'range', min: 0, max: 400, unit: 'mm', dir: 'atLeast' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线
// ═══════════════════════════════════════════════════════════════════════════

export const OPTICAL_METROLOGY_ROUTES: readonly Route[] = [
  {
    /**
     * **铅：阳极泥 + 碳 → 铅 + SO₂ + CO + 渣。**
     *
     *   阳极泥 1000 + 碳 12 → 铅 100 + SO₂ 31 + CO 27 + 渣 854
     *
     * 1000 + 12 = 1012 = 100 + 31 + 27 + 854。质量账平。
     * 950–1050 °C 在 `plant/roaster`（850–1400）上做；PbSO₄ 被碳还原，
     * 铅以液态放出，渣从底部排出。
     *
     * ⚠️ 10 % Pb 是阳极泥的设计品位（没有化验）；SO₂/CO 的分配按
     * PbSO₄ + 2C 的化学计量。PZT 只需要 99–99.9 % 的铅，所以不再精炼。
     */
    id: 'make/lead',
    name: 'Lead Production', name_zh: '铅制备',
    produces: [
      {
        item: 'mat/lead',
        qty: q(100),
        gives: [{ param: 'purity', kind: 'range', min: 99, max: 99.9 }],
      },
      { item: 'mat/so2', qty: q(31), gives: [] },
      {
        item: 'mat/co',
        qty: q(27),
        gives: [{ param: 'purity', kind: 'range', min: 30, max: 90 }],
      },
      { item: 'mat/slag', qty: q(854), gives: [] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/anode-sludge', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(12) }] },
    ],
    needs: [],
    performedBy: 'plant/roaster',
    under: [{ param: 'temperature', min: 950, max: 1050 }],
    rate: { hours: q(24) },
  },

  {
    /**
     * **PZT 陶瓷片：配料 → 预烧 → 压片 → 烧结 → 减薄 → 被银 → 极化。**
     *
     *   铅 0.621 + 锆石 0.192 + 钛白 0.115 + 氧 0.072 + 银 0.02
     *   + 酚醛 0.01 + 水 2 → PZT 陶瓷 1 件
     *
     * 配比按 Pb(Zr₀.₅₂Ti₀.₄₈)O₃ 的 333.6 g/mol 算；产物按件计，不折 kg。
     * 预烧 850–900 °C（`plant/resistance-furnace`，100–1100），烧结
     * 1200–1300 °C（`plant/high-temp-furnace`，1100–1600）。极化在
     * 500 V / 0.15–0.25 mm = 2–3.3 kV/mm，用 `plant/hv-source-500v`。
     *
     * ⚠️ 烧结要 PbO 气氛抑制铅挥发；本层没有 PbO 粉，靠埋粉（同成分
     * PZT 粉）实现，损失按 2–5 % 记，不另列条目。
     */
    id: 'make/pzt-ceramic',
    name: 'PZT Ceramic Plate Manufacturing', name_zh: 'PZT 陶瓷片制造',
    produces: [
      {
        item: 'plant/pzt-stage/pzt-ceramic',
        qty: q(1),
        gives: [
          { param: 'd33', kind: 'range', min: 350, max: 500 },
          { param: 'thickness', kind: 'range', min: 0.15, max: 0.25 },
          { param: 'strain', kind: 'range', min: 0.12, max: 0.18 },
          { param: 'curieTemperature', kind: 'range', min: 280, max: 320 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/lead', qty: q(621, 1000) }] },
      { anyOf: [{ item: 'mat/zirconia', qty: q(192, 1000) }] },
      { anyOf: [{ item: 'mat/titanium-dioxide', qty: q(115, 1000) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(72, 1000) }] },
      { anyOf: [{ item: 'mat/silver', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: [],
    rate: { hours: q(48) },
    steps: [
      { note_zh: '配料与球磨：Pb/ZrO₂/TiO₂ 按 0.621/0.192/0.115 称量，水磨 4 h，烘干', performedBy: 'plant/robot' },
      { note_zh: '预烧 850–900 °C，2 h：生成钙钛矿相；温度低了不反应，高了铅挥发', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 850, max: 900 }] },
      { note_zh: '压片：φ10–20 mm、0.2–0.3 mm 生坯，100–200 MPa', performedBy: 'plant/press' },
      { note_zh: '烧结 1200–1300 °C，2 h，埋粉抑制铅挥发', performedBy: 'plant/high-temp-furnace', under: [{ param: 'temperature', min: 1200, max: 1300 }] },
      { note_zh: '减薄到 0.15–0.25 mm，两面平行度 ≤2 µm', performedBy: 'plant/grinder' },
      { note_zh: '被银电极：银浆丝印两面，600 °C 烧银 10 min', performedBy: 'plant/robot' },
      { note_zh: '极化：500 V（2–3.3 kV/mm）、100–120 °C 油浴/空气浴 10 min，极化后 24 h 老化', performedBy: 'plant/hv-source-500v' },
    ],
  },

  {
    /**
     * **PZT 柔性杠杆：45 钢单体件，20:1 缺口铰链。**
     *
     *   45 钢 2 + 铝 0.1 + 水 2 → 杠杆 1 件
     *
     * 线切割/铣出缺口铰链（本层没有线切割，用铣 + 磨 + 手工修）；
     * 缺口半径 0.2–0.5 mm 决定应力集中与寿命。20:1 的放大比靠两段
     * 缺口臂的长度比，不靠装配。
     */
    id: 'make/pzt-flexure',
    name: 'PZT Stage Flexure Lever and Guide Manufacturing', name_zh: 'PZT 台的柔性杠杆与导向制造',
    produces: [
      {
        item: 'plant/pzt-stage/flexure',
        qty: q(1),
        gives: [
          { param: 'ratio', kind: 'range', min: 18, max: 22 },
          { param: 'stroke', kind: 'range', min: 80, max: 120 },
          { param: 'stiffness', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'crossTalk', kind: 'range', min: 0.2, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: [],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '铣外形与两段缺口臂；缺口根部留 0.3 mm，最后手工修圆', performedBy: 'plant/milling-machine' },
      { note_zh: '磨两段臂的厚度到 ±5 µm：厚度差直接变成 ratio 误差', performedBy: 'plant/grinder' },
      { note_zh: '装夹与预压：输出端预压 0.1 N，量 20 µm 行程内的位移比', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * **电容位移传感器：极板 + 1 pF–1 nF 桥 + 零位读出。**
     *
     *   气容标准 1 + 运放 2 + 计数器 1 + 齐纳 1 + 排阻 2 + 铜 0.1
     *   + 钢板 0.5 + PTFE 0.01 + 铜线 0.02 + 水 2 → 传感器 1 件
     *
     * 极板 φ10 mm、间隙 20–50 µm；桥用 100 kHz 时基 + 1 µV 零位，
     * 差分两只传感器抵消共模热漂。0.05–0.1 nm 是设计分辨。
     */
    id: 'make/pzt-capacitive-sensor',
    name: 'PZT Capacitive Displacement Sensor Manufacturing', name_zh: 'PZT 电容位移传感器制造',
    produces: [
      {
        item: 'plant/pzt-stage/capacitive-sensor',
        qty: q(1),
        gives: [
          { param: 'resolution', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'range', kind: 'range', min: 10, max: 50 },
          { param: 'bandwidth', kind: 'range', min: 1, max: 5 },
          { param: 'linearity', kind: 'range', min: 0.02, max: 0.05 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/probe-station/cap-standard', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/resistor-network-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '车/磨两只 φ10 mm 极板，间隙垫 20–50 µm 的 PTFE 箔；极板与杠杆输出端同轴', performedBy: 'plant/robot' },
      { note_zh: '装 100 kHz 桥与 1 µV 零位；用 10 pF 气容标准标刻度，差分两只传感器', performedBy: 'plant/probe-station', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '测噪声与线性：0–50 µm 行程 11 点，残差 ≤0.05 %；100 次读数 σ ≤0.1 nm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **PZT 驱动：1000 V 发电机 + 比较环 → 0–500 V、0.1–1 mV。**
     *
     *   相移器驱动 1 + 运放 2 + 计数器 1 + 齐纳 1 + 排阻 2
     *   + 铜线 0.05 + 钢板 1 + 玻璃 0.1 → 驱动 1 件
     *
     * `plant/phase-shifter/drive` 是 1000 V 他励直流发电机（0–1000 V、
     * 纹波 ≤0.1 %、重复性 0.1 %），本层没有高压运放，它是唯一现成的
     * kV 级源。比较环把电容传感器读数与设定值相减，控制励磁/串联微调。
     */
    id: 'make/pzt-driver',
    name: 'PZT Closed-Loop Driver Manufacturing', name_zh: 'PZT 闭环驱动制造',
    produces: [
      {
        item: 'plant/pzt-stage/driver',
        qty: q(1),
        gives: [
          { param: 'voltageRange', kind: 'range', min: 0, max: 500 },
          { param: 'resolution', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'bandwidth', kind: 'range', min: 1, max: 5 },
          { param: 'ripple', kind: 'range', min: 0.02, max: 0.05 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/phase-shifter/drive', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/resistor-network-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '装比较环：电容传感器 → 误差积分 → 励磁变阻器/串联微调；输出限到 0–500 V', performedBy: 'plant/robot' },
      { note_zh: '标定：0/100/200/300/400/500 V 六点，用 µV 计读回，0.1–0.5 mV/步；纹波 ≤0.05 %', performedBy: 'plant/probe-station', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **PZT 台：40 片陶瓷 + 20:1 杠杆 + 双电容传感器 + 闭环。**
     *
     *   陶瓷 40 + 杠杆 1 + 传感器 2 + 驱动 1 + 平台 1 + 计算机 1
     *   + 铝 1 + 钢板 2 + 铜 0.2 + 水 5 → PZT 台 1 件
     *
     * 40 × 0.4 nm/V × 500 V = 8 µm；20:1 杠杆 = 160 µm，限到 100 µm。
     * 闭环用两只电容传感器差分（一只测台面、一只测参考），驱动 0–500 V。
     * 标定用 `plant/xray-interferometer`：0.1 nm = 0.319 个 (111) 条纹，
     * 八帧相位 11° ⇒ 0.008 nm，给台的 0.1 nm 分辨一个独立尺。
     */
    id: 'make/pzt-stage',
    name: 'PZT Phase Shift/Scan Stage Manufacturing', name_zh: 'PZT 移相/扫描台制造',
    produces: [
      {
        item: 'plant/pzt-stage',
        qty: q(1),
        gives: [
          { param: 'travel', kind: 'range', min: 10, max: 100 },
          { param: 'resolution', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'closedLoop', kind: 'enum', oneOf: ['yes'] },
          { param: 'settling', kind: 'range', min: 20, max: 50 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/pzt-stage/pzt-ceramic', qty: q(40) }] },
      { anyOf: [{ item: 'plant/pzt-stage/flexure', qty: q(1) }] },
      { anyOf: [{ item: 'plant/pzt-stage/capacitive-sensor', qty: q(2) }] },
      { anyOf: [{ item: 'plant/pzt-stage/driver', qty: q(1) }] },
      { anyOf: [{ item: 'plant/phase-shifter/platen', qty: q(1) }] },
      { anyOf: [{ item: 'std/computer-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(80) },
    steps: [
      { note_zh: '串堆：40 片陶瓷 + 铜箔电极，预压 0.5 N；堆叠电容 3–5 nF', performedBy: 'plant/robot' },
      { note_zh: '装 20:1 柔性杠杆与导向；输出端接台面，行程 100 µm 内无卡滞', performedBy: 'plant/robot' },
      { note_zh: '装两只电容传感器（差分）：一只对台面、一只对参考块；间隙 20–50 µm', performedBy: 'plant/robot' },
      { note_zh: '闭环标定：X 射线干涉仪读 0.1 nm 台阶，10 点行程 0–100 µm；分辨 0.1–0.5 nm、整定 20–50 ms', performedBy: 'plant/xray-interferometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '闭环扫频：1–5 kHz 带宽，相位裕度 >45°；重复定位 100 次 σ ≤0.5 nm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **Mirau 镜组：3–5 片熔石英/玻璃，NA 0.45–0.55。**
     *
     *   熔石英 1 + 玻璃 0.2 + 氧化铝 0.1 + 水 5 → 镜组 1 件
     *
     * 粗磨 → 手抛 → 离子束修形 → 逐片干涉装调。NA 0.55 的镜组不是
     * “再抛一次”：本层手抛上限 NA 0.07，必须靠 `plant/ion-beam-figuring`
     * 把非球面修到 1 nm 级。面形 0.8–1.2 nm 是设计值。
     */
    id: 'make/mirau-lens-group',
    name: 'Mirau Objective Lens Group Manufacturing', name_zh: 'Mirau 物镜的镜组制造',
    produces: [
      {
        item: 'plant/mirau-objective/lens-group',
        qty: q(1),
        gives: [
          { param: 'lensCount', kind: 'range', min: 3, max: 5 },
          { param: 'na', kind: 'range', min: 0.45, max: 0.55 },
          { param: 'surfaceFigure', kind: 'range', min: 0.8, max: 1.2 },
          { param: 'clearAperture', kind: 'range', min: 6, max: 8 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(120) },
    steps: [
      { note_zh: '粗磨/手抛 3–5 片球面，面形 λ/4（约 130 nm）；厚度与曲率半径按设计值', performedBy: 'plant/grinder' },
      { note_zh: '离子束修形：Kaufman 源 Ar 500 eV，0.05–0.5 Pa；非球面量 0.8–1.2 nm', performedBy: 'plant/ion-beam-figuring', under: [{ param: 'pressure', min: 0.05, max: 0.5 }] },
      { note_zh: '逐片装调：干涉仪看波前，偏心 ≤2 µm，间隔 ≤1 µm', performedBy: 'plant/interferometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **Mirau 物镜筒：45 钢，内孔 24–26 mm、同轴 1–2 µm。**
     *
     *   铝 0.5 + 45 钢 0.2 + 铜 0.02 + 水 2 → 镜筒 1 件
     *
     * 车内外圆 → 铣压圈螺纹与分束片槽 → 磨端面 → 同轴检验。
     * 45 钢的热膨胀 11.5 ppm/K，50 mm 上 1 K 是 0.58 µm —— 比铝的
     * 1.15 µm 好一倍，正好卡在 1–2 µm 的同轴公差里。
     */
    id: 'make/mirau-barrel',
    name: 'Mirau Objective Barrel Manufacturing', name_zh: 'Mirau 物镜筒制造',
    produces: [
      {
        item: 'plant/mirau-objective/barrel',
        qty: q(1),
        gives: [
          { param: 'bore', kind: 'range', min: 24, max: 26 },
          { param: 'concentricity', kind: 'range', min: 1, max: 2 },
          { param: 'length', kind: 'range', min: 45, max: 55 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: [],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '车内外圆与两端面，一次装夹；内孔留 0.1 mm 磨量', performedBy: 'lathe' },
      { note_zh: '铣分束片 45° 槽与压圈螺纹；槽面与光轴 45°±0.1°', performedBy: 'plant/milling-machine' },
      { note_zh: '磨内孔与端面，同轴 1–2 µm；压圈端面平行度 ≤1 µm', performedBy: 'plant/grinder' },
    ],
  },

  {
    /**
     * **Mirau 物镜：镜组 + 分束片 + 参考镜 + 镜筒。**
     *
     *   镜组 1 + 分束片 1 + 参考镜 1 + 镜筒 1 + 铝 0.2 + 45 钢 0.1
     *   + 铜 0.02 + 水 2 → 物镜 1 件
     *
     * 分束片用 `plant/interferometer/splitter`（50/50 平板），参考镜用
     * `plant/phase-shifter/mirror`（λ/4、铝膜 88 %）。装完用干涉仪看
     * 参考臂与测试臂的波前；NA 0.4–0.55、工作距 1.5–3 mm。
     */
    id: 'make/mirau-objective',
    name: 'Mirau Interference Objective Manufacturing', name_zh: 'Mirau 干涉物镜制造',
    produces: [
      {
        item: 'plant/mirau-objective',
        qty: q(1),
        gives: [
          { param: 'na', kind: 'range', min: 0.4, max: 0.55 },
          { param: 'workingDistance', kind: 'range', min: 1.5, max: 3 },
          { param: 'magnification', kind: 'range', min: 20, max: 50 },
          { param: 'fieldOfView', kind: 'range', min: 0.2, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/mirau-objective/lens-group', qty: q(1) }] },
      { anyOf: [{ item: 'plant/interferometer/splitter', qty: q(1) }] },
      { anyOf: [{ item: 'plant/phase-shifter/mirror', qty: q(1) }] },
      { anyOf: [{ item: 'plant/mirau-objective/barrel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    rate: { hours: q(80) },
    steps: [
      { note_zh: '装镜组与分束片：分束片在 45° 槽里，胶接/压圈；参考镜在分束片上方', performedBy: 'plant/robot' },
      { note_zh: '对光轴：参考镜中心与物镜光轴 ≤2 µm；工作距 1.5–3 mm', performedBy: 'plant/comparator', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '干涉检验：参考臂与测试臂的波前差 ≤λ/10；NA 0.4–0.55、视场 0.2–2 mm', performedBy: 'plant/interferometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **卤素灯：φ20 µm 钨丝 + 5 kPa 氩 + 0.1 mg 碘 + 石英壳。**
     *
     *   钨粉 0.002 + 石英 0.3 + 碘 0.0001 + 氩 0.001 + 钼粉 0.01
     *   + 水 5 → 灯 6 支
     *
     * 与 `make/ir-lamp` 同一套拉丝/封壳手艺，加碘量 0.1 mg/6 支。
     * 2900–3200 K、20–50 W、500–2000 h；一批 6 支，出 3 支能用
     * （φ20 µm 钨丝断丝率 50 %）。
     */
    id: 'make/halogen-lamp',
    name: 'White-Light Source Halogen Lamp Manufacturing', name_zh: '白光光源卤素灯制造',
    produces: [
      {
        item: 'plant/white-light-source/halogen-lamp',
        qty: q(6),
        gives: [
          { param: 'colorTemperature', kind: 'range', min: 2900, max: 3200 },
          { param: 'power', kind: 'range', min: 20, max: 50 },
          { param: 'lifetime', kind: 'range', min: 500, max: 2000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/iodine', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/molybdenum-powder', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '拉 φ20 µm 钨丝、绕 V 形 8 mm、焊钼引线；一批 6 支', performedBy: 'plant/winder' },
      { note_zh: '封 φ12×40 石英壳：抽到 1e-3 Pa，充 5 kPa 氩 + 0.1 mg 碘，烧封', performedBy: 'plant/euv-vacuum', under: [{ param: 'pressure', min: 1e-3, max: 1e-2 }] },
      { note_zh: '老练 10 h / 2900 K：让钾钠痕量先蒸发，避免 50 h 内壁镀黑', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * **白光聚光镜：两片熔石英，f = 25–40 mm。**
     *
     *   熔石英 0.2 + 铝 0.05 + 45 钢 0.1 + 水 2 → 聚光镜 1 件
     *
     * 两片分离式（没有胶），把灯丝像投到 Mirau 入瞳。透过 88–92 %
     * 是两片裸石英的菲涅耳 + 吸收（每面 4 %，四面前后 85 %，加吸收 3 %）。
     */
    id: 'make/white-light-condenser',
    name: 'White-Light Source Condenser Manufacturing', name_zh: '白光光源白光聚光镜制造',
    produces: [
      {
        item: 'plant/white-light-source/condenser',
        qty: q(1),
        gives: [
          { param: 'focalLength', kind: 'range', min: 25, max: 40 },
          { param: 'aperture', kind: 'range', min: 12, max: 18 },
          { param: 'transmission', kind: 'range', min: 88, max: 92 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: [],
    rate: { hours: q(16) },
    steps: [
      { note_zh: '磨两片熔石英球面（R 按 f = 25–40 mm），面形 λ/4、中心厚 3–5 mm', performedBy: 'plant/grinder' },
      { note_zh: '车铝镜座与 45 钢压圈，两片间距 2–5 mm 可调', performedBy: 'lathe' },
      { note_zh: '装校：灯丝像落在 φ12–18 mm 内，透过率 88–92 %', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * **白光光源：卤素灯 + 滤光轮 + 聚光镜 + 灯室。**
     *
     *   卤素灯 1 + 滤光轮 1 + 聚光镜 1 + 铝 0.5 + 钢板 0.5
     *   + 铜线 0.02 + 水 1 → 光源 1 件
     *
     * 滤光轮用 `plant/ellipsometer/filter-wheel`（6 位，400/550/600 nm
     * + 空位）。它不是单色器；VSI 要宽谱，滤光只是切掉带外杂散光。
     */
    id: 'make/white-light-source',
    name: 'White-Light Source Manufacturing', name_zh: '白光光源制造',
    produces: [
      {
        item: 'plant/white-light-source',
        qty: q(1),
        gives: [
          { param: 'spectrum', kind: 'range', min: 400, max: 700 },
          { param: 'power', kind: 'range', min: 10, max: 40 },
          { param: 'colorTemperature', kind: 'range', min: 2900, max: 3200 },
          { param: 'stability', kind: 'range', min: 0.2, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/white-light-source/halogen-lamp', qty: q(1) }] },
      { anyOf: [{ item: 'plant/ellipsometer/filter-wheel', qty: q(1) }] },
      { anyOf: [{ item: 'plant/white-light-source/condenser', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(16) },
    steps: [
      { note_zh: '装灯室：灯丝在聚光镜焦点，滤光轮在灯与聚光镜之间；风冷/自然对流', performedBy: 'plant/robot' },
      { note_zh: '老练 24 h 并测稳定度：0.2–0.5 %/h（光电二极管 + 1 s 积分）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **计量 CCD 帧积分器：相关双采样 + 100 帧平均 + 16 位累加。**
     *
     *   运放 4 + 计数器 1 + 排阻 2 + 薄膜电容 2 + 铜线 0.02
     *   + 钢板 0.5 → 积分器 1 件
     *
     * `plant/robot/camera` 的 40 e- 读出是 3T 无源像素的复位噪声；
     * 相关双采样把复位噪声扣掉，100 帧平均把随机噪声压到 4 e-。
     * 固定图形噪声不降，靠平场校正扣。
     */
    id: 'make/metrology-ccd-frame-integrator',
    name: 'Metrology CCD Frame Integrator Manufacturing', name_zh: '计量 CCD 的帧积分器制造',
    produces: [
      {
        item: 'plant/metrology-ccd/frame-integrator',
        qty: q(1),
        gives: [
          { param: 'integrationFrames', kind: 'range', min: 1, max: 1000 },
          { param: 'readNoise', kind: 'range', min: 1, max: 3 },
          { param: 'bitDepth', kind: 'range', min: 16, max: 16 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/resistor-network-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(12) },
    steps: [
      { note_zh: '装相关双采样与 16 位累加；100 帧平均、平场/暗场校正表', performedBy: 'plant/robot' },
      { note_zh: '测读出噪声：暗场 1000 帧，σ ≤3 e-；积分 1–1000 帧线性 ≤1 %', performedBy: 'plant/probe-station', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **计量 CCD：2 MP 相机 + 帧积分器 + 遮光/温漂补偿。**
     *
     *   相机 1 + 积分器 1 + 铜 0.05 + 铝 0.2 + PTFE 0.01 + 运放 2
     *   → 计量相机 1 件
     *
     * 2 MP、1.4 µm 像元、读出 2–5 e-、暗电流 10–50 e-/像素/s。
     * 不冷却：10 ms 曝光的暗电荷 <1 e-；长曝光要另加制冷（缺口）。
     */
    id: 'make/metrology-ccd',
    name: 'Metrology CCD Manufacturing', name_zh: '计量 CCD 制造',
    produces: [
      {
        item: 'plant/metrology-ccd',
        qty: q(1),
        gives: [
          { param: 'pixels', kind: 'range', min: 2, max: 2 },
          { param: 'readNoise', kind: 'range', min: 2, max: 5 },
          { param: 'darkCurrent', kind: 'range', min: 10, max: 50 },
          { param: 'pixelPitch', kind: 'range', min: 1.4, max: 2.0 },
          { param: 'quantumEfficiency', kind: 'range', min: 40, max: 70 },
        ],
      },
    ],
    // 相机、帧积分器、运放在条目 composedOf 上；铜/铝/PTFE 是遮光罩与接线材料。
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '装帧积分器与遮光罩，接相机头', performedBy: 'plant/robot' },
      { note_zh: '平场/暗场标定：2 MP 全画面，坏点 <0.1 %；读出 2–5 e-', performedBy: 'plant/comparator', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **套刻物镜：NA 0.85–0.9、50–100×、工作距 0.8–1.5 mm。**
     *
     *   熔石英 2 + 玻璃 0.5 + 45 钢 0.5 + 铝 0.1 + 氧化铝 0.2
     *   + 水 10 → 物镜 1 件
     *
     * 4 片熔石英 + 2 片玻璃，离子束修形；NA 0.9 收 ±1 级（靶 20–30 nm、
     * λ 450–650 nm）。视场 0.08–0.15 mm，装 8–75 个靶周期。
     */
    id: 'make/overlay-objective',
    name: 'Overlay Metrology Imaging Objective Manufacturing', name_zh: '套刻量具的成像物镜制造',
    produces: [
      {
        item: 'plant/overlay-metrology/objective',
        qty: q(1),
        gives: [
          { param: 'na', kind: 'range', min: 0.85, max: 0.9 },
          { param: 'magnification', kind: 'range', min: 50, max: 100 },
          { param: 'workingDistance', kind: 'range', min: 0.8, max: 1.5 },
          { param: 'fieldOfView', kind: 'range', min: 0.08, max: 0.15 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(2) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(160) },
    steps: [
      { note_zh: '粗磨/手抛 6 片；面形 λ/4，厚度/曲率按设计值', performedBy: 'plant/grinder' },
      { note_zh: '离子束修形：0.05–0.5 Pa，非球面 0.5–1 nm；逐片装调偏心 ≤1 µm', performedBy: 'plant/ion-beam-figuring', under: [{ param: 'pressure', min: 0.05, max: 0.5 }] },
      { note_zh: '干涉检验：NA 0.85–0.9、视场 0.08–0.15 mm、波前 ≤λ/8', performedBy: 'plant/interferometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **成像式 DBO 套刻量具：照明 + NA 0.9 物镜 + 计量相机 + 0.5 nm 台。**
     *
     *   白光光源 1 + 物镜 1 + 计量相机 1 + 高 NA 台 1 + 平台 1
     *   + 计算机 1 + 运放 4 + 计数器 2 + 铝 2 + 钢板 5 + 铜 0.5
     *   + 水 10 → 套刻量具 1 台
     *
     * 台用 `plant/euv-stepper-hina/stage`（300 mm、readout 0.5 nm）；
     * 物镜与台共装 `plant/phase-shifter/platen`，共模热膨胀。
     * 0.5 nm 不确定度是设计目标，标准片标定后扣系统项。
     */
    id: 'make/overlay-metrology',
    name: 'Imaging-Based DBO Overlay Metrology Tool Manufacturing', name_zh: '成像式 DBO 套刻量具制造',
    produces: [
      {
        item: 'plant/overlay-metrology',
        qty: q(1),
        gives: [
          { param: 'na', kind: 'range', min: 0.85, max: 0.9 },
          { param: 'magnification', kind: 'range', min: 50, max: 100 },
          { param: 'fieldOfView', kind: 'range', min: 0.08, max: 0.15 },
          { param: 'overlayUncertainty', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'pitch', kind: 'range', min: 10, max: 30 },
          { param: 'stageReadout', kind: 'range', min: 0.5, max: 0.5 },
          { param: 'wavelength', kind: 'range', min: 450, max: 650 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/white-light-source', qty: q(1) }] },
      { anyOf: [{ item: 'plant/overlay-metrology/objective', qty: q(1) }] },
      { anyOf: [{ item: 'plant/metrology-ccd', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-stepper-hina/stage', qty: q(1) }] },
      { anyOf: [{ item: 'plant/phase-shifter/platen', qty: q(1) }] },
      { anyOf: [{ item: 'std/computer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    rate: { hours: q(200) },
    steps: [
      { note_zh: '装照明/物镜/相机/台：物镜与台共装铸铁平台，光轴与台面垂直 ≤1 µm/100 mm', performedBy: 'plant/robot' },
      { note_zh: '对光轴与视场：NA 0.85–0.9、视场 0.08–0.15 mm；靶 20–30 nm 的 ±1 级进光瞳', performedBy: 'plant/comparator', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '台标定：X 射线干涉仪读 0.5 nm 步进，300 mm 行程 10 点；回零重复性 ≤0.5 nm', performedBy: 'plant/xray-interferometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '系统测试：标准片 0/2/5/10 nm 四点，10 点/片；不确定度 0.2–0.5 nm（设计值）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **0.1 nm 台阶标准件：ALD 一个 HfO₂ 周期 + X 射线干涉标定。**
     *
     *   硅片 10 + HfCl₄ 0.00001 + 水 1 + 氮 0.1 + 钢掩模 0.01
     *   → 标准件 10 片
     *
     * ① 25 周期监控片（2.0 nm）+ 椭偏仪定 GPC；
     * ② 半片钢掩模 + 1 周期，台阶 0.08–0.1 nm；
     * ③ X 射线干涉仪读 0.1 nm = 0.319 个 (111) 条纹，八帧相位 11°
     *    ⇒ 0.008 nm；
     * ④ 椭偏仪只判“膜在不在/均匀不均匀”，0.08 nm 低于它的 1 nm 下限。
     */
    id: 'make/step-standard-0.1nm',
    name: '0.1 nm Step Height Standard Manufacturing', name_zh: '0.1 nm 台阶标准件制造',
    produces: [
      {
        item: 'std/step-standard-0.1nm',
        qty: q(10),
        gives: [
          { param: 'stepHeight', kind: 'range', min: 0.08, max: 0.1 },
          { param: 'uncertainty', kind: 'range', min: 0.01, max: 0.02 },
          { param: 'area', kind: 'range', min: 2000, max: 8000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(10) }] },
      { anyOf: [{ item: 'mat/hafnium-chloride', qty: q(1, 100000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    rate: { hours: q(40) },
    steps: [
      { note_zh: '清洗 10 片 φ100 硅片：碱洗/酸洗/去离子水冲/甩干', performedBy: 'plant/wet-bench' },
      { note_zh: 'GPC 标定：监控片 25 周期 HfO₂（HfCl₄ + H₂O，200–250 °C、20–60 Pa）→ 2.0 nm；椭偏仪读 2.0 ±0.05 nm ⇒ GPC 0.08 ±0.002 nm', performedBy: 'plant/ald-reactor', under: [{ param: 'temperature', min: 200, max: 250 }, { param: 'pressure', min: 20, max: 60 }] },
      { note_zh: '台阶片：半片 0.05 mm 钢掩模遮住，1 周期 HfO₂ ⇒ 0.08–0.1 nm 台阶', performedBy: 'plant/ald-reactor', under: [{ param: 'temperature', min: 200, max: 250 }, { param: 'pressure', min: 20, max: 60 }] },
      { note_zh: 'X 射线干涉标定：0.1 nm = 0.319 个 (111) 条纹；八帧相位 11° ⇒ 0.008 nm；每片 10 点', performedBy: 'plant/xray-interferometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '椭偏交叉检查：只判膜连续性/均匀性；0.08 nm 在 1 nm 下限以下，绝对高度以 X 射线干涉为准', performedBy: 'plant/ellipsometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装盒、编号、写标定记录；10 片里取 6 片合格', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * **套刻标准片：e-beam 写 0/2/5/10 nm 偏移 + CD-SEM 交叉标定。**
     *
     *   硅片 10 + 胶 0.01 + HF 0.001 + 水 5 → 标准片 10 片
     *
     * e-beam 在 100 µm 场内闭环 10 nm 定位，按程序偏移写 box-in-box；
     * CD-SEM 用 4 nm 束斑、0.05 nm 边缘内插读实际偏移（cdAccuracy 1.5 nm）。
     * 0/2/5/10 nm 四点给零点、最小可辨、线性段。
     *
     * 靶周期 2–10 µm；NA 0.9、视场 0.08–0.15 mm 装 8–75 个周期。
     */
    id: 'make/overlay-standard',
    name: 'Overlay Standard Wafer Manufacturing', name_zh: '套刻标准片制造',
    produces: [
      {
        item: 'std/overlay-standard',
        qty: q(10),
        gives: [
          { param: 'offset', kind: 'range', min: 0, max: 10 },
          { param: 'uncertainty', kind: 'range', min: 0.2, max: 0.3 },
          { param: 'pitch', kind: 'range', min: 2, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(10) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(48) },
    steps: [
      { note_zh: '涂胶 0.2 µm、前烘；写 0/2/5/10 nm 四组 box-in-box，场 100 µm、剂量 50 µC/cm²', performedBy: 'plant/robot' },
      { note_zh: 'e-beam 直写：20 kV、20 nm 束斑、闭环 10 nm 定位；四组偏移按程序给', performedBy: 'plant/e-beam-column', under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }] },
      { note_zh: '显影 + 冲洗：0.3–1 µm 线宽；去胶前用 HF 轻蚀 2–5 nm 定影', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 30 }] },
      { note_zh: 'CD-SEM 交叉标定：4 nm 束斑、0.05 nm 内插、10 点/组；读实际偏移 0–10 nm，不确定度 0.2–0.3 nm', performedBy: 'plant/cd-sem', under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }] },
      { note_zh: '编号、装盒；0 nm 点零点仍按 CD-SEM 边缘判定，不写成计量院证书', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * **整机：Mirau 物镜 + PZT 台 + 白光光源 + 计量 CCD → 光学轮廓仪。**
     *
     *   物镜 1 + PZT 台 1 + 光源 1 + 相机 1 + 平台 1 + 计算机 1
     *   + 运放 4 + 计数器 2 + 铝 2 + 钢板 3 + 铜 0.2 + 铜线 0.1
     *   + 玻璃 0.5 + 水 5 → 轮廓仪 1 台
     *
     * 交付 vertical 0.05–0.2 nm、lateral 0.5–1 µm、FOV 0.1–2 mm。
     * 标定用 `std/step-standard-0.1nm`（0.08–0.1 nm 台阶）与
     * `plant/interferometer` 的波前检验；0.05 nm 端要 16 帧 + 2–5 e- 相机，
     * 余量只有 1–2 倍，写成设计值。
     */
    id: 'make/optical-profiler',
    name: 'White-Light Interferometric Optical Profiler Assembly', name_zh: '白光干涉光学轮廓仪装配',
    produces: [
      {
        item: 'plant/cmos-test/optical-profiler',
        qty: q(1),
        gives: [
          { param: 'measure/verticalResolution', kind: 'range', min: 0.05, max: 0.2 },
          { param: 'verticalRange', kind: 'range', min: 1e6, max: 1e6 },
          { param: 'measure/lateralResolution', kind: 'range', min: 0.5, max: 1, record: 'mat/step-height-record' },
          { param: 'measure/fieldOfView', kind: 'range', min: 0.1, max: 2, record: 'mat/step-height-record' },
          { param: 'measure/stepHeight', kind: 'range', min: 0, max: 1e6, record: 'mat/step-height-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/mirau-objective', qty: q(1) }] },
      { anyOf: [{ item: 'plant/pzt-stage', qty: q(1) }] },
      { anyOf: [{ item: 'plant/white-light-source', qty: q(1) }] },
      { anyOf: [{ item: 'plant/metrology-ccd', qty: q(1) }] },
      { anyOf: [{ item: 'plant/phase-shifter/platen', qty: q(1) }] },
      { anyOf: [{ item: 'std/computer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(3) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room', 'std/step-standard-0.1nm'],
    rate: { hours: q(160) },
    steps: [
      { note_zh: '装台与物镜：PZT 台在铸铁平台上，Mirau 物镜垂直向下；工作距 1.5–3 mm', performedBy: 'plant/robot' },
      { note_zh: '装白光光源与 CCD：灯丝像进物镜入瞳，CCD 在物镜像面；视场 0.1–2 mm', performedBy: 'plant/robot' },
      { note_zh: '对光轴与干涉：参考臂/测试臂波前 ≤λ/10；横向 0.5–1 µm（NA 0.55）', performedBy: 'plant/comparator', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: 'VSI 扫描标定：step-standard 0.08–0.1 nm 台阶，16 帧移相；垂直 0.05–0.2 nm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '重复性：同一台阶 100 次，σ ≤0.1 nm；横向 5 点线扫 1 µm 线宽', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **测量：光学轮廓仪读 0.1 nm 台阶标准件 → 台阶高度记录。**
     *
     *   标准件（needs，不消耗）→ 台阶高度记录 1 份
     *
     * 10 点/片，VSI 16 帧；垂直 0.05–0.2 nm、横向 0.5–1 µm、FOV 0.1–2 mm。
     * 记录的是读数，不是设计值；`uncertainty` 0–0.2 nm 是记录元数据。
     */
    id: 'measure/optical-profiler-step',
    name: 'Step Height Measurement', name_zh: '台阶高度测量',
    produces: [
      {
        item: 'mat/step-height-record',
        qty: q(1),
        gives: [
          { param: 'stepHeight', kind: 'range', min: 0, max: 1000 },
          { param: 'uncertainty', kind: 'range', min: 0, max: 0.2 },
          { param: 'lateralResolution', kind: 'range', min: 0.5, max: 1 },
          { param: 'fieldOfView', kind: 'range', min: 0.1, max: 2 },
        ],
      },
    ],
    uses: [],
    needs: [
      {
        item: 'plant/cmos-test/optical-profiler',
        qty: q(1),
        need: [
          { param: 'measure/stepHeight', kind: 'range', min: 0, max: 1000 },
          { param: 'measure/verticalResolution', kind: 'range', min: 0.05, max: 0.2 },
          { param: 'measure/lateralResolution', kind: 'range', min: 0.5, max: 1 },
        ],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
      'std/step-standard-0.1nm',
      'std/step-standard-100nm',
    ],
    rate: { hours: q(2) },
    steps: [
      { note_zh: '装标准件：φ100 片放到 PZT 台，找 0.08–0.1 nm 台阶；19–21 °C', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: 'VSI 扫描：Mirau 物镜、白光、16 帧移相；10 点/片，垂直 0.05–0.2 nm、横向 0.5–1 µm', performedBy: 'plant/cmos-test/optical-profiler', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '算台阶高度与不确定度，写记录；0.05 nm 端只作设计值，不写成实测噪声', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '光学轮廓仪 1 台（进、出，不消耗）+ 台阶标准片 2 件（进、出，不消耗）→ 台阶高度记录 1 份；记录是数据不是物料。',
  },

  {
    /**
     * **测量：成像式 DBO 读套刻标准片 → 可溯源套刻记录。**
     *
     *   标准片（needs，不消耗）→ 套刻记录 1 份
     *
     * 10–100 点 X/Y；NA 0.9、靶 20–30 nm、台 0.5 nm 测长；
     * overlay 不确定度 ≤0.5 nm、点距 ≤30 nm（设计值）。
     * 标准片的 0/2/5/10 nm 四点给线性与零点。
     */
    id: 'measure/overlay-dbo',
    name: 'Traceable Overlay Measurement', name_zh: '可溯源套刻测量',
    produces: [
      {
        item: 'mat/overlay-record-traceable',
        qty: q(1),
        gives: [
          { param: 'overlayX', kind: 'range', min: 0, max: 10 },
          { param: 'overlayY', kind: 'range', min: 0, max: 10 },
          { param: 'uncertainty', kind: 'range', min: 0, max: 0.5 },
          { param: 'pitch', kind: 'range', min: 10, max: 30 },
          { param: 'points', kind: 'range', min: 10, max: 100 },
          { param: 'method', kind: 'enum', oneOf: ['dbo'] },
        ],
      },
    ],
    uses: [],
    needs: [
      {
        item: 'plant/overlay-metrology',
        qty: q(1),
        need: [
          { param: 'overlayUncertainty', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'pitch', kind: 'range', min: 10, max: 30 },
          { param: 'stageReadout', kind: 'range', min: 0.5, max: 0.5 },
        ],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
      'std/overlay-standard',
    ],
    rate: { hours: q(2) },
    steps: [
      { note_zh: '装标准片：φ100 片放到 0.5 nm 台，找 0/2/5/10 nm 四组靶；19–21 °C', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: 'DBO 读偏移：NA 0.9、白光 450–650 nm、靶 20–30 nm；10 点 X/Y，台 0.5 nm 测长', performedBy: 'plant/overlay-metrology', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '算均值/不确定度：四点线性、10 点/片；overlay ≤0.5 nm、点距 ≤30 nm；写记录并注明标准片标定链', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '套刻量测仪 1 台（进、出，不消耗）+ 套刻标准片 1 件（进、出，不消耗）→ 套刻记录 1 份；记录是数据不是物料。',
  },
  {
    /**
     * 大口径 null lens 的整机波前：`plant/null-test` + 0.52 nm 参考平晶 + 八帧移相。
     *
     *   null-test 装三片与石英隔圈 → 零条纹对位 → 八帧移相 → 300 mm 子孔径
     *   拼接 320 mm 口径 → 算整机波前。
     *
     * 输出是**能力域** `figure 0–50 nm rms`、`wavefront 0–50 nm rms`、
     * `aperture 300–320 mm`、`points 10`，不是 λ/50 的 12.7 nm 读数。
     * 0.52 nm 参考平晶的 300 mm 口径小于 320 mm 透镜，必须拼接；拼接残差
     * 与复装 10 nm 都进系统差。`assemble/large-null-lens` 的 figure 130 nm
     * 仍是 design。
     */
    id: 'measure/null-lens-wavefront',
    name: 'Large-Aperture Null Lens System Wavefront Measurement', name_zh: '大口径 null lens 的整机波前测量',
    produces: [
      {
        item: 'mat/null-lens-wavefront-record',
        qty: q(1),
        gives: [
          { param: 'figure', kind: 'range', min: 0, max: 50 },
          { param: 'wavefront', kind: 'range', min: 0, max: 50 },
          { param: 'aperture', kind: 'range', min: 300, max: 320 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: 'null-test 装三片与石英隔圈；零条纹对位到 1/20 条纹（15 nm）',
        performedBy: 'plant/null-test',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '八帧移相：0.52 nm 参考平晶 + 压电步进；300 mm 子孔径读波前',
        performedBy: 'plant/ref-flat-interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '300 mm 子孔径拼接到 320 mm 口径；拼接残差与复装 10 nm 进系统差',
        performedBy: 'plant/phase-shifter',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '算整机 figure/wavefront；写能力域 0–50 nm，不写 λ/50 的 12.7 nm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '水 1 kg → 整机波前记录 1 份；透镜、参考平晶与移相器都是量具，不消耗。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...OPTICAL_METROLOGY_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...OPTICAL_METROLOGY_ROUTES];
