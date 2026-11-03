/**
 * 母机精度的三件量具 —— 触针轮廓仪 / 圆光栅主轴误差分析仪 / 激光直线度。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 本层原来停在哪三处（数都在文件里）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **表面读数下限 15 nm。** 钠光 Fizeau 数 1/20 条纹 = 589/2 ÷ 20 = 0.0147 µm
 *      （`euv-mirror.ts:146`、`asphere.ts:339` 都写的这个数）。而量块工作面的
 *      Ra 是 **0.005–0.02 µm（5–20 nm）** —— 15 nm 只够 Ra 的 0.02 µm 端（差 1.3 倍），
 *      对 0.005 µm 端差 3 倍。本层能读 0.05–0.2 nm 立体高度的只有
 *      `plant/cmos-test/optical-profiler`（白光 VSI：0.05–0.2 nm 垂直、0.5–1 µm 横向、
 *      视场 0.1–2 mm）；`plant/ref-flat-interferometer` 到 0.52 nm（λ/1000），
 *      但那是 φ300 口径的面形仪，没有显微物镜，读不了 2 µm 尺度的磨痕。
 *      而 VSI 是**光学**的：NA 0.55 只收 ±33° 的斜率，研磨面的磨痕壁比这陡；
 *      而且它只有 `measure/optical-profiler-step` 一条台阶测量路线，**没有 Ra 的
 *      测量路线，也没有把 Ra 传到量块上的链**。触针是接触式：不受斜率限制，
 *      只受尖端半径限制。
 *
 *   ② **主轴只有比较仪。** `measure/lathe-spindle-runout` 是手动盘车 8 点、
 *      读极差（0.1 µm 分度），它给的是**一圈的跳动**，不是**每转内的周期误差**。
 *      两者不是一件事：跳动是 8 点的包络，周期误差是 1–100 阶谐波 —— 一个
 *      0.05 µm、100 阶的误差在 8 点上完全看不见，而它正是工件上那道波纹的来源。
 *      要看见它必须有**角度基准**（每转等分 1024 点）与**同步采样**。
 *
 *   ③ **直线度没有量具。** `measure/lathe-bed-flatness` 与
 *      `measure/grinder-bed-flatness` 量的是**平面度**（φ300 平晶 + 钠光），
 *      判据是"这块面平不平"；导轨要的是"这条线直不直"，行程 1–3 m。
 *      平晶只有 300 mm，长行程直线度用平晶**原理上量不出来**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 口径：全部是设计值（Earth 工程值）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本文件没有一条 `data/measure/` 的读数记录。
 * **没有实测就不写"闭合"**。下面每个数都是"按 Earth 工程值算出来的设计窗口"，
 * 能交叉验算的地方都写了算式；验不了的地方写"开环"，并在第四节列成缺口。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 复用的链（一件都没有重造）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   金刚石     `mat/diamond`（50–1000 µm 磨粒，做砂轮）/ `mat/diamond-tip-blank`
 *              （PCD 坯片 3–5 mm、晶粒 0.05–0.2 µm）/ `mat/diamond-powder`
 *              （0.02–0.2 µm，抛光）—— 上一轮的 HPHT 链，直接接触针。
 *   亚纳米     `plant/pzt-stage`（10–100 µm 行程、闭环 0.1–1 nm）与
 *              `plant/pzt-stage/capacitive-sensor`（0.05–0.2 nm、10–100 µm）——
 *              触针的 Z 轴与主轴探头都用它，不新造传感器。
 *   激光       `plant/stabilized-laser/tube`（Ar⁺ 488 nm、φ3×250 mm、增益 0.4 %/cm）
 *              与 `/power`（0–1000 V / 0–100 A）、`/housing`（热时间常数 0–100 h）——
 *              直线度的光源是这三件的子装配。
 *   台阶标准   `std/step-standard-0.1nm`（0.08–0.1 nm、不确定度 0.01–0.02 nm）——
 *              Z 轴 0.1 nm 的**唯一**标定物，`plant/xray-interferometer` 读相位。
 *   环境       `plant/metrology-room`（19–21 °C，±1）—— 三件量具的测量路线都
 *              在它里面做；温度条件一律写 19–21，与它的 `holds` 一字不差。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一处必须新建的中间件：分度台
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 圆光栅的 360° 是由**分度**写出来的：72000 条线 = 0.005°/步 × 72000 步。
 * 本层没有能走 0.005° 的分度机构（铣床分度头 ±1′ = 60″、
 * `plant/cd-sem/tilt-stage` 的 90:1 蜗轮 + φ200 度盘只到 0.05° = 180″），
 * 所以先造 `plant/dividing-table`：720 齿蜗轮（0.5°/步）+ 1:100 差动
 * （0.005°/步）+ 研配。**它是量具的量具** —— 分度台的蜗轮齿距误差
 * 直接变成光栅的刻划误差，见第二节的误差预算。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、触针式轮廓仪
//
// 目标：量块 Ra 0.005–0.02 µm（5–20 nm）。三件事决定它做不做得成：
//
//   ① **尖端半径 2 µm**：Ra 是高度量，尖端半径进的是**横向滤波**。2 µm 的针
//      扫 0.08 mm 截止波长，一个 2 µm 的谷被抹成 1.6 µm 宽 —— 对 Ra 的影响
//      <10 %；再小（0.5 µm）会把研磨面的磨痕读成更深的谷。ISO 3274 的
//      常规针尖就是 2 µm / 60° 或 90°。
//
//   ② **测力 0.1–1 mN**：这是本件最容易被忽略的一格。按理想球面赫兹接触，
//      F = 0.5 mN、R = 2 µm、E* = 189 GPa（金刚石 1050 / 钢 210、ν 0.07/0.3）：
//
//        a = (3FR/4E*)^(1/3) = (3×5e-4×2e-6 / (4×1.89e11))^(1/3) = 0.158 µm
//        平均压强 = F/(πa²) = 5e-4 / (π×2.5e-14) = 6.4 GPa
//
//      淬硬钢（62 HRC）的屈服是 2–3 GPa —— **6.4 GPa 已经压进去了**。
//      塑性压痕深度量级 a²/2R = 0.158²/4 = **6 nm**，与要测的 5–20 nm 同量级：
//      0.5 mN 测 5 nm 的 Ra，读到的可能大半是自己压出来的沟。
//      F = 0.1 mN 时 a = 0.092 µm、深度 2 nm，才降到 Ra 的 1/3 以下。
//      所以"0.1 mN 端"不是为了温柔，是为了**读数有效**。
//      （真实触针在针尖磨出 0.1–0.2 µm 的小平面后，压强降 2–4 倍，
//       0.5 mN 也能测量块 —— 但那要靠磨损，不能写进设计。）
//
//   ③ **垂直 0.1 nm**：靠 `plant/pzt-stage/capacitive-sensor` 差分，不新造。
//      两只 0.05–0.2 nm 的电容传感器差分平均到 0.05–0.1 nm；PZT 台只负责
//      跟随（定位 0.1–1 nm），**分辨率是读数，不是定位**。
// ═══════════════════════════════════════════════════════════════════════════

export const METROLOGY_PRECISION_ITEMS: readonly Item[] = [
  /**
   * 金刚石触针。**PCD 坯片磨出来的 60°/90° 锥体，尖端 R 1.8–2.2 µm。**
   *
   * 为什么不是单晶金刚石：本层没有单晶金刚石的切磨链（HPHT 粉 → PCD 坯片
   * 是已有的，`make/diamond-tip-blank`）。PCD 是多晶烧结体，晶粒 0.05–0.2 µm，
   * 磨到 R 2 µm 时尖端跨 10–40 个晶粒 —— 比单晶差的地方是**晶界会掉粒**，
   * 所以寿命按"扫 1000 条 0.4 mm 的行程后重磨"记，不写"永久"。
   *
   * 锥角两种：60° 给深谷/陡壁（横向分辨率优先），90° 给软表面（压强低一半）。
   * 尖端半径与锥角都在 `plant/cd-sem` 里判：20 000× 下 1 像素 ≈ 50 nm，
   * 2 µm 半径 ≈ 40 像素 ⇒ R 判到 ±0.1 µm；锥角靠在 ±60° 倾转台上转 30°
   * 读两条母线，角度判到 ±0.2°。
   */
  {
    id: 'plant/stylus-profilometer/stylus',
    name: 'Stylus Profilometer Diamond Stylus', name_zh: '触针式轮廓仪金刚石触针',
    unit: '件',
    category: 'part',
    props: [
      { param: 'tipRadius', kind: 'range', min: 1.8, max: 2.2, unit: 'µm' },
      { param: 'coneAngle', kind: 'enum', values: ['60', '90'] },
    ],
  },

  /**
   * 低力传感器。**0.1–1 mN、分辨 0.002–0.005 mN（0.2–0.5 % FS）、电容式。**
   *
   * 为什么不是应变片（这一格算过才敢写）：1 mN 落在 0.2×5×20 的钢梁上，
   * 根部应变只有
   *
   *   ε = 6FL/(E b t²) = 6×10⁻³×0.02 / (210×10⁹ × 5×10⁻³ × 4×10⁻⁸) = 2.9 µε
   *
   * 全桥、GF 2 也就 0.006 mV/V —— 比桥路漂移小一个量级。要 400–1000 µε
   * 得把梁做成 10 µm 箔、挠度 3.8 mm：那不是测力，那是弹簧。
   * 所以**力的读数和轮廓仪的 Z 共用一条电容链**：
   *
   *   柔性梁 0.2×5×20（45 钢）   k = 3EI/L³ = 0.26 N/mm
   *   1 mN 时挠度               4 µm；0.1 mN 时 0.4 µm
   *   电容极板 φ6、间隙 20–50 µm ΔC/C = Δd/d = 4/20 = 20 % FS
   *   读数                      `plant/pzt-stage/capacitive-sensor`
   *                             0.05–0.2 nm ⇒ 0.0002–0.0008 mN 的电学极限
   *
   * **交付 0.002–0.005 mN 不是电学极限，是柔性梁的蠕变 + 伺服死区**
   * （0.2–0.5 % FS）—— 这一句是这一件唯一诚实的降级说明。
   *
   * 标定靠 `std/mass-weight-set-mg`（1 µg–1 g、容差 ≤25 ppm）+ 火星 g 3.71：
   *
   *   1 mN   = 0.2695 g × 3.71 m/s²   （269.5 mg 砝码）
   *   0.1 mN = 26.95 mg × 3.71
   *
   * 26.95–269.5 mg 落在砝码组的量程里，所以力值可溯源到质量；不可溯源的是
   * **g 的本地值**（火星 g 3.71 的本地实测没有，按 0.1 % 记 ⇒ 力的绝对
   * 不确定度 0.1–0.2 %，比 0.2 % FS 的分辨略小，正好不成为瓶颈）。
   */
  {
    id: 'plant/stylus-profilometer/force-sensor',
    name: 'Stylus Profilometer Low-Force Sensor', name_zh: '触针式轮廓仪低力传感器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'force', kind: 'range', min: 0.1, max: 1, unit: 'mN' },
      { param: 'resolution', kind: 'range', min: 0.002, max: 0.005, unit: 'mN', dir: 'atMost' },
      { param: 'stiffness', kind: 'range', min: 0.1, max: 0.5, unit: 'N/mm' },
      { param: 'tempDrift', kind: 'range', min: 0.03, max: 0.05, unit: '%/K', dir: 'atMost' },
    ],
  },

  /**
   * Z 轴。**读数 0.05–0.1 nm、行程 10–100 µm、线性 0.01–0.1 %。**
   *
   * `plant/pzt-stage`（40 片 PZT + 20:1 柔性杠杆 + 闭环）+ 两只
   * `plant/pzt-stage/capacitive-sensor` 差分。为什么不写"干涉式 Z"：
   * 干涉要稳频激光与条纹计数（`plant/laser-stage` 是 2000 mm 的大家伙，
   * 装不进 300 mm 的轮廓仪）；电容差分在同轴、同温、同结构上是更短的一条路，
   * 代价是量程只有 10–100 µm —— 对 Ra 足够的（Ra 10 µm 已到量程上限）。
   *
   * 0.1 nm 的标定只有一条：`std/step-standard-0.1nm`（0.08–0.1 nm 台阶、
   * 不确定度 0.01–0.02 nm），由 `plant/xray-interferometer` 读相位
   * （0.1 nm = 0.319 个 Si(111) 条纹，八帧相位 11° ⇒ 0.008 nm）。
   * 这是全表唯一能"给出 0.1 nm 该有多高"的东西 —— 没有它，0.1 nm 只是一个数。
   */
  {
    id: 'plant/stylus-profilometer/z-axis',
    name: 'Z-Axis', name_zh: 'Z 轴',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 0.05, max: 0.1, unit: 'nm', dir: 'atMost' },
      { param: 'travel', kind: 'range', min: 10, max: 100, unit: 'µm', dir: 'atLeast' },
      { param: 'linearity', kind: 'range', min: 0.01, max: 0.1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 精密导轨（X 行程）。**50–100 mm 行程，直线度 0.05–0.1 µm/50 mm。**
   *
   * 0.1 µm/50 mm = 2×10⁻⁶ —— 这是本层最直的一条线。做法只有一条：
   * **磨 → 研 → 抛**，基准是三块对研的平板（`plant/comparator/lapping-plate`），
   * 最后一道用 `mat/diamond-powder` 0.02–0.2 µm 在铸铁盘上抛。
   *
   * 判据用**翻转法**（与三块对研同一个思路：自己给自己当基准）：
   * 把导轨在平板上量一遍，翻 180° 再量一遍，两次之差的一半是平板自己的
   * 起伏，平均值才是导轨的直线度。比较仪 0.1 µm 分度，翻转平均后到 0.05 µm。
   *
   * ⚠️ 它对 Ra 的影响其实被 λc 滤掉了（0.08–0.25 mm 的高通把 50 mm 的长波
   * 全砍掉），真正需要它的是 Rz/Rmax 与长波轮廓。仍按 0.1 µm 做，是因为
   * 轮廓仪的**支承靴**也在这条导轨上 —— 靴子一走波浪，基准就跟着波浪。
   */
  {
    id: 'plant/stylus-profilometer/guide',
    name: 'Stylus Profilometer Precision Guideway', name_zh: '触针式轮廓仪精密导轨',
    unit: '件',
    category: 'part',
    props: [
      { param: 'straightness', kind: 'range', min: 0.05, max: 0.1, unit: 'µm/50mm', dir: 'atMost' },
      { param: 'travel', kind: 'range', min: 50, max: 100, unit: 'mm', dir: 'atLeast' },
    ],
  },

  /**
   * 行程驱动。**0.05–1 mm/s、速度纹波 1–2 %、行程 50–100 mm。**
   *
   * 蜗轮 48:1 + T2 丝杠（导程 2 mm）+ 7.5 kW 电机（本层只有这一种电机）：
   *
   *   1440 r/min ÷ 48 = 30 r/min ⇒ 30 × 2 mm = 60 mm/min = 1.0 mm/s
   *   变频 5 % = 1.5 r/min ⇒ 3 mm/min = 0.05 mm/s
   *
   * 速度纹波进的是 Ra 的**幅值**：纹波 1 % ⇒ Ra 偏差 <1 %（λc 0.08 mm、
   * 速度 0.5 mm/s 时，1 % 的纹波落在 0.03–3 Hz，远低于截止频率）。
   * 所以这一件不难，难的是**不爬行**：导轨要油膜、丝杠要消隙螺母。
   */
  {
    id: 'plant/stylus-profilometer/traverse',
    name: 'Stylus Profilometer Traverse Drive', name_zh: '触针式轮廓仪行程驱动',
    unit: '件',
    category: 'part',
    props: [
      { param: 'speed', kind: 'range', min: 0.05, max: 1, unit: 'mm/s' },
      { param: 'speedRipple', kind: 'range', min: 1, max: 2, unit: '%', dir: 'atMost' },
      { param: 'stroke', kind: 'range', min: 50, max: 100, unit: 'mm', dir: 'atLeast' },
    ],
    composedOf: [
      { item: 'plant/stylus-profilometer/traverse/frame', qty: q(1) },
      { item: 'plant/stylus-profilometer/traverse/worm', qty: q(1) },
      { item: 'plant/stylus-profilometer/traverse/worm-wheel', qty: q(1) },
      { item: 'plant/stylus-profilometer/traverse/lead-screw', qty: q(1) },
      { item: 'plant/stylus-profilometer/traverse/anti-backlash-nut', qty: q(1) },
      { item: 'std/motor-7.5kw-4p', qty: q(1) },
      { item: 'std/bearing-general-p0', qty: q(2) },
    ],
  },

  /**
   * 基座与立柱。**HT250 一次浇成，热时间常数 24–48 h。**
   *
   * 亚纳米读数的敌人是温度：钢 11.5 µm/(m·K)，100 mm 上 0.1 K 就是 1.15 µm ——
   * 比 0.1 nm 大四个量级。所以基座要"重 + 大热容 + 隔振"：
   * 铸铁 30 kg + 矿棉垫，时间常数按 30 kg × 0.46 kJ/(kg·K) / (表面 0.5 m² ×
   * 8 W/(m²·K)) ≈ 24 h 算（与 `plant/metrology-room` 的 19–21 °C 配合）。
   *
   * 热膨胀系数 11 ppm/K 是铸铁的牌号值，不是"越低越好"—— 要与导轨（GCr15
   * 11.5）和量块（钢 11.5）匹配，三者一起胀，差值才小。
   */
  {
    id: 'plant/stylus-profilometer/base',
    name: 'Stylus Profilometer Base and Column', name_zh: '触针式轮廓仪基座与立柱',
    unit: '件',
    category: 'part',
    props: [
      { param: 'cte', kind: 'range', min: 8, max: 12, unit: 'ppm/K' },
      { param: 'timeConstant', kind: 'range', min: 10, max: 100, unit: 'h', dir: 'atLeast' },
      { param: 'attenuation', kind: 'range', min: 20, max: 100, unit: 'dB', dir: 'atLeast' },
    ],
  },

  /**
   * 触针式轮廓仪。**Ra 0.005–10 µm、垂直 0.1 nm、R2 µm、测力 0.1–1 mN。**
   *
   * 六件：触针、测力传感器、Z 轴、导轨、行程驱动、基座。
   * 交付窗口与 `props` 一一对应（声明了就必须交付，`prop_missing_gives`）：
   *
   *   ra                0.005–10 µm     ISO 4288 的 λc 分档：0.08 / 0.25 / 0.8 / 2.5 / 8 mm
   *   verticalResolution 0.05–0.1 nm   电容差分 + 16 帧平均（设计值）
   *   stylusRadius      1.8–2.2 µm     PCD 磨出来的实测散布
   *   measuringForce    0.1–1 mN       电子闭环恒力（悬臂位移反馈）
   *   cutoff            0.08–8 mm      五个标准档
   *   evaluationLength  0.4–40 mm      5λc
   *
   * 与 `plant/cmos-test/optical-profiler` 的分工写在文件头：那台读台阶
   * （0.05–0.2 nm 垂直、0.5–1 µm 横向、视场 0.1–2 mm），这台读 Ra 且是接触式。
   */
  {
    id: 'plant/stylus-profilometer',
    name: 'Stylus Profilometer', name_zh: '触针式轮廓仪',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'ra', kind: 'range', min: 0.005, max: 10, unit: 'µm' },
      { param: 'verticalResolution', kind: 'range', min: 0.05, max: 0.1, unit: 'nm', dir: 'atMost' },
      { param: 'stylusRadius', kind: 'range', min: 1.8, max: 2.2, unit: 'µm' },
      { param: 'measuringForce', kind: 'range', min: 0.1, max: 1, unit: 'mN' },
      { param: 'cutoff', kind: 'range', min: 0.08, max: 8, unit: 'mm' },
      { param: 'evaluationLength', kind: 'range', min: 0.4, max: 40, unit: 'mm' },
      { param: 'measure/stepHeight', kind: 'range', min: 0, max: 10, unit: 'µm' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 二、圆光栅与主轴周期误差分析仪
  //
  // 这一节的链条是四层，**每一层的精度都从上一层来**，所以顺序不能反：
  //
  //   720 齿研配蜗轮（0.5°/步）
  //        ↓  1:100 差动
  //   分度台（0.005°/步、重复性 0.1–0.5″）
  //        ↓  72000 次曝光
  //   圆光栅（21600–72000 线、精度 ±0.5–2″、分辨 0.14–0.47″）
  //        ↓  双读数头 180° 对置
  //   主轴误差分析仪（1024 点/转、1–100 阶）
  //
  // 为什么光栅要"分度"而不是"直写"：`plant/e-beam-column` 的台是**直线**的
  // （travel 10–1000 mm），写径向线必须有回转轴；而回转轴的精度就是分度台的
  // 精度 —— **分度台躲不掉**。既然如此，用一条 1.7 µm 的狭缝 + 72000 次分度曝光
  // （每次 1.5 s ≈ 30 h）比在电子束里加一套回转轴便宜；电子束只用来写那条
  // 狭缝（`std/photomask-general` 的现有路线）。成本全在"每步 0.005° 的分度"上。
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * 分度台蜗轮。**720 齿、齿距误差 0.5–2 角秒、与蜗杆对研。**
   *
   * 720 齿 = 每齿 0.5°。齿距误差是**整条链的源头**：光栅的刻划误差
   * ≈ 蜗轮的累积齿距误差（720 步 = 一转，一一对应）。
   *
   * 滚齿只能到 ±10–20″（6 级齿轮），所以关键是**研配**：蜗轮与蜗杆涂
   * 刚玉 W7→W1 对研 20–40 h，把齿距误差"平均"掉 —— 研具的每一次啮合
   * 都在修相邻齿的相对位置，累积误差被拉平到 0.5–2″。这是 19 世纪
   * 分度机的做法（Rowland 的螺杆、Troughton & Simms 的蜗轮）。
   *
   * ⚠️ 0.5–2″ 是**开环值**：本层没有角度原器去测它（见第四节）。
   */
  {
    id: 'plant/dividing-table/worm-wheel',
    name: 'Dividing Table Worm Wheel', name_zh: '分度台蜗轮',
    unit: '件',
    category: 'part',
    props: [
      { param: 'teeth', kind: 'range', min: 720, max: 720, unit: '齿' },
      { param: 'pitchError', kind: 'range', min: 0.5, max: 2, unit: '角秒', dir: 'atMost' },
      { param: 'diameter', kind: 'range', min: 200, max: 250, unit: 'mm' },
    ],
  },

  /**
   * 蜗杆。**m=0.3、单头、q=80（d=24 mm）、导程误差 1–3 µm/300 mm。**
   *
   * 导程误差**不进分度精度**：蜗杆转一圈 = 蜗轮过一齿 = 0.5°，这是啮合
   * 关系，不是导程的函数。它影响的是传动平稳性与回差 —— 分度台要的是
   * "停得准"，不是"走得匀"。
   */
  {
    id: 'plant/dividing-table/worm',
    name: 'Dividing Table Worm', name_zh: '分度台蜗杆',
    unit: '件',
    category: 'part',
    props: [{ param: 'leadError', kind: 'range', min: 1, max: 3, unit: 'µm/300mm', dir: 'atMost' }],
  },

  /**
   * 分度台主轴。**P5 轴承、跳动 0.2–1 µm。**
   *
   * 轴系跳动直接变成光栅的**偏心**：e = 0.2–1 µm、R = 40 mm ⇒ 1–5″ 的 1 阶
   * 误差（0.2 µm 是 1″，1 µm 是 5″）。1 阶由双读数头平均消掉（见分析仪），
   * 但 2 阶消不掉，
   * 所以轴系仍要 0.2–1 µm —— 它是"消掉之后还剩多少"的地板。
   */
  {
    id: 'plant/dividing-table/spindle',
    name: 'Dividing Table Spindle', name_zh: '分度台主轴',
    unit: '件',
    category: 'part',
    props: [{ param: 'runout', kind: 'range', min: 0.2, max: 1, unit: 'µm', dir: 'atMost' }],
    composedOf: [
      { item: 'plant/dividing-table/spindle/shaft', qty: q(1) },
      { item: 'std/bearing-spindle-p5', qty: q(2) },
    ],
  },

  /** 分度台基座。HT250 25 kg + 矿棉，与轮廓仪基座同一条工艺（热时间常数 24–48 h）。 */
  {
    id: 'plant/dividing-table/base',
    name: 'Dividing Table Base', name_zh: '分度台基座',
    unit: '件',
    category: 'part',
    props: [
      { param: 'cte', kind: 'range', min: 8, max: 12, unit: 'ppm/K' },
      { param: 'timeConstant', kind: 'range', min: 10, max: 100, unit: 'h', dir: 'atLeast' },
    ],
  },

  /**
   * 分度台。**0.005–0.5°/步、重复性 0.1–0.5″、盘面 150–250 mm。**
   *
   * 粗分度：720 齿蜗轮，0.5°/步；细分：差动 + 换齿轮（1:30 / 1:50 / 1:100
   * 三档，出轴带 30/50/100 孔分度盘），对应 0.01667° / 0.01° / 0.005°/步。
   * 720 × 100 = 72000 步/转（72000 线），720 × 30 = 21600 步/转（21600 线）。
   *
   * 为什么差动而不是"蜗轮直接做 72000 齿"：72000 齿的蜗轮直径要 2 m 以上
   * （m=0.03 时 2.16 m），而且滚齿机装不下。差动把"大数"与"小数"
   * 分开，是分度机的标准做法。
   *
   * 重复性 0.1–0.5″ 的验证：比较仪 0.1 µm 分度 + 50 mm 力臂 = 0.41″，
   * 所以 0.5″ 端可验、0.1″ 端验不了（要 0.025 µm/50 mm）。
   */
  {
    id: 'plant/dividing-table',
    name: 'Dividing Table', name_zh: '分度台',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'repeatability', kind: 'range', min: 0.1, max: 0.5, unit: '角秒', dir: 'atMost' },
      { param: 'indexError', kind: 'range', min: 0.5, max: 2, unit: '角秒', dir: 'atMost' },
      { param: 'stepAngle', kind: 'range', min: 0.005, max: 0.5, unit: '°' },
      { param: 'tableDiameter', kind: 'range', min: 150, max: 250, unit: 'mm' },
      { param: 'load', kind: 'range', min: 20, max: 50, unit: 'kg', dir: 'atLeast' },
    ],
  },

  /**
   * 圆光栅盘。**φ100–200 玻璃盘、21600–72000 条径向线、精度 ±0.5–2″。**
   *
   * 几何（φ100、读数半径 R = 40 mm）：
   *
   *   72000 线：节距 = 2π×40/72000 = 3.49 µm，128 倍细分 27 nm ⇒ 0.14″
   *   21600 线：节距 = 2π×40/21600 = 11.64 µm，128 倍细分 91 nm ⇒ 0.47″
   *
   * 分辨率的算式：360° = 1 296 000″，÷（线数 × 128）= 0.14–0.47″。
   *
   * 精度（±0.5–2″）的误差预算：
   *
   *   分度台累积齿距误差   0.5–2″   （研配后，见蜗轮条目）
   *   玻璃盘偏心 e ≤ 5 µm  25″ 的 1 阶 → 双读数头平均消掉，残 0.2″
   *   细分线性度 1 %       0.18″    （1 条线 = 18″）
   *   玻璃热膨胀 0.5 ppm/K 0.09″    （±0.5 K、R=40）
   *   合成                 ≈ 0.6–2.1″
   *
   * **所以精度就是分度台的精度**，光栅本身不贡献新误差 —— 这也是它
   * 能"造得出来"的原因：不要求比母机更准。
   */
  {
    id: 'std/rotary-encoder',
    name: 'Rotary Grating Disk', name_zh: '圆光栅盘',
    unit: '件',
    category: 'part',
    props: [
      { param: 'lines', kind: 'range', min: 20000, max: 100000, unit: '线', dir: 'atLeast' },
      { param: 'accuracy', kind: 'range', min: 0.5, max: 2, unit: '角秒', dir: 'atMost' },
      { param: 'resolution', kind: 'range', min: 0.1, max: 0.5, unit: '角秒', dir: 'atMost' },
      { param: 'diameter', kind: 'range', min: 100, max: 200, unit: 'mm' },
      { param: 'pitch', kind: 'range', min: 3.4, max: 11.7, unit: 'µm' },
    ],
  },

  /**
   * 圆光栅读数头。**4 只光电二极管 + 指示光栅 + 128 倍模拟细分。**
   *
   * 指示光栅与盘同节距（`mat/glass` + `mat/hf` 刻），四只光电二极管错开
   * 1/4 节距 → 两路正弦/余弦；模拟细分取 arctan（四象限乘法器），
   * 128 倍。分辨率由**信噪比**定，不由时钟定：1 mW 光、1 % 线性 → 0.18″。
   *
   * 带宽 100–500 kHz：72000 线在 3000 r/min 时基频 = 72000×50/60 = 60 kHz，
   * 128 倍细分若用计数就要 7.7 MHz —— 模拟细分不需要，它只要求前端
   * 带宽盖住 60 kHz，所以 100–500 kHz 够。
   */
  {
    id: 'std/rotary-encoder/head',
    name: 'Rotary Grating Disk Read Head', name_zh: '圆光栅盘圆光栅读数头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 0.1, max: 0.5, unit: '角秒', dir: 'atMost' },
      { param: 'bandwidth', kind: 'range', min: 100, max: 500, unit: 'kHz', dir: 'atLeast' },
      { param: 'channels', kind: 'range', min: 4, max: 4, unit: '通道' },
    ],
  },

  /**
   * 电容位移探头。**0.05–0.2 nm、10–100 µm、1–10 kHz。**
   *
   * 就是 `plant/pzt-stage/capacitive-sensor` 加一个可调支架与屏蔽：
   * 主轴周期误差要测的是 0.02–0.5 µm 的位移，探头量程 10–100 µm 绰绰有余，
   * 关键是 0.05 nm 的噪声地板 —— 它决定 0.01 µm 的周期误差能不能看见。
   *
   * 与轮廓仪 Z 轴的区别：那一件要闭环（跟着表面走），这一件是**纯读数**
   * （不闭环），所以只需一只传感器 + 屏蔽，不需要差分。
   */
  {
    id: 'plant/spindle-error-analyzer/probe',
    name: 'Spindle Periodic Error Analyzer Capacitive Displacement Probe', name_zh: '主轴周期误差分析仪电容位移探头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 0.05, max: 0.2, unit: 'nm', dir: 'atMost' },
      { param: 'range', kind: 'range', min: 10, max: 100, unit: 'µm' },
      { param: 'bandwidth', kind: 'range', min: 1, max: 10, unit: 'kHz', dir: 'atLeast' },
    ],
    composedOf: [
      { item: 'plant/spindle-error-analyzer/probe/body', qty: q(1) },
      { item: 'plant/spindle-error-analyzer/probe/sensor', qty: q(1) },
      { item: 'std/opamp-chip-general', qty: q(2) },
    ],
  },

  /**
   * 同步采样时钟。**抖动 0.1–1 µs、10–100 kHz、2–4 通道同时锁存。**
   *
   * 10 MHz 石英晶振（`std/quartz-resonator-general`，1–100 MHz 档）分频到
   * 10–100 kHz；所有通道**同一个时钟沿**采样保持，通道间偏斜 ≤0.1 µs。
   *
   * 抖动为什么重要：3000 r/min = 50 r/s，100 阶 = 5 kHz；1 µs 的采样
   * 抖动在 5 kHz 上是 1.8° 相位 ⇒ 幅值误差 0.05 %；10 µs 就是 18°相位
   * ⇒ 5 % 幅值误差。所以窗口写 ≤10 µs 是**需求**，交 0.1–1 µs 是余量。
   */
  {
    id: 'plant/spindle-error-analyzer/sync-clock',
    name: 'Spindle Periodic Error Analyzer Synchronous Sampling Clock', name_zh: '主轴周期误差分析仪同步采样时钟',
    unit: '件',
    category: 'part',
    props: [
      { param: 'jitter', kind: 'range', min: 0.1, max: 1, unit: 'µs', dir: 'atMost' },
      { param: 'rate', kind: 'range', min: 10, max: 100, unit: 'kHz', dir: 'atLeast' },
      { param: 'channels', kind: 'range', min: 2, max: 4, unit: '通道' },
    ],
  },

  /**
   * 定心/翻转夹具。**定心 1–5 µm、0°/90°/180°/270° 四个定位销、承重 5–50 kg。**
   *
   * 定心误差 e 进的是 1 阶：e = 5 µm、R = 40 mm ⇒ 25″。双读数头 180°
   * 对置后 1 阶被平均掉，但夹具仍要做到 1–5 µm —— 否则两个读数头看到的
   * 不是同一个偏心，平均就变成"平均两个不同的错"。
   *
   * 四个销是**多步分离法**的硬件：光盘相对主轴转 0/90/180/270° 各测一遍，
   * 可以把光盘刻划误差与主轴误差分开（见分析仪条目）。
   */
  {
    id: 'plant/spindle-error-analyzer/fixture',
    name: 'Spindle Periodic Error Analyzer Centering/Flipping Fixture', name_zh: '主轴周期误差分析仪定心/翻转夹具',
    unit: '件',
    category: 'part',
    props: [
      { param: 'centering', kind: 'range', min: 1, max: 5, unit: 'µm', dir: 'atMost' },
      { param: 'reversal', kind: 'enum', values: ['0-90-180-270'] },
      { param: 'capacity', kind: 'range', min: 5, max: 50, unit: 'kg', dir: 'atLeast' },
    ],
    composedOf: [
      { item: 'plant/spindle-error-analyzer/fixture/body', qty: q(1) },
      { item: 'plant/spindle-error-analyzer/fixture/locating-pin', qty: q(4) },
      { item: 'std/bearing-spindle-p5', qty: q(2) },
    ],
  },

  /** 分析仪基座。HT250 40 kg + 矿棉：探头与主轴之间不许有相对振动（0.05 nm 的地板）。 */
  {
    id: 'plant/spindle-error-analyzer/frame',
    name: 'Spindle Periodic Error Analyzer Base', name_zh: '主轴周期误差分析仪基座',
    unit: '件',
    category: 'part',
    props: [
      { param: 'cte', kind: 'range', min: 8, max: 12, unit: 'ppm/K' },
      { param: 'attenuation', kind: 'range', min: 20, max: 100, unit: 'dB', dir: 'atLeast' },
    ],
  },

  /**
   * 主轴周期误差分析仪。**0.1–1″、同步 ≤10 µs、10–3000 r/min、1–100 阶。**
   *
   * 七件：光盘 1 + 读数头 2（180° 对置）+ 探头 1 + 同步钟 1 + 夹具 1 +
   * 基座 1 + 计算机 1。
   *
   * 数据链：编码器 128 倍细分 → 每 1024 个细分计数触发一次采样保持
   * （1024 点/转）→ 探头与编码器同沿锁存 → 计算机做 FFT。
   *
   *   3000 r/min：1024 × 50 = 51.2 kS/s；100 阶 = 5 kHz（奈奎斯特 25.6 kHz）
   *   10 r/min：1024 × 0.167 = 171 S/s
   *
   * 为什么是 1024 点：100 阶要 ≥200 点（每阶 2 点），1024 给 5 倍余量，
   * 且 1024 = 2¹⁰，FFT 不用补零。
   */
  {
    id: 'plant/spindle-error-analyzer',
    name: 'Spindle Periodic Error Analyzer', name_zh: '主轴周期误差分析仪',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/angularResolution', kind: 'range', min: 0.1, max: 1, unit: '角秒', dir: 'atMost' },
      { param: 'measure/syncError', kind: 'range', min: 0.1, max: 10, unit: 'µs', dir: 'atMost' },
      { param: 'measure/spindleSpeed', kind: 'range', min: 10, max: 3000, unit: 'rpm' },
      { param: 'measure/harmonicOrder', kind: 'range', min: 1, max: 100, unit: '阶' },
      { param: 'measure/periodicError', kind: 'range', min: 0.01, max: 5, unit: 'µm' },
      { param: 'probeResolution', kind: 'range', min: 0.05, max: 0.2, unit: 'nm', dir: 'atMost' },
      // 同一探头能力的参数名对齐：probeResolution 的交付窗是 0.05–0.1 nm；
      // 这里只暴露同名 alias，不是新量程。
      { param: 'measure/resolution', kind: 'range', min: 0.05, max: 0.1, unit: 'nm', dir: 'atMost' },
    ],
  },


  // ═════════════════════════════════════════════════════════════════════════
  // 三、激光直线度
  //
  // 为什么不是自准直仪：直线度 0.5 µm/m = 0.5 µrad = 0.1″。本层自准直光管
  // 的读数到 0.02° = 72″（`comparator.ts:68`、`cd-sem.ts:632`），差 700 倍；
  // 比较仪当杠杆用（0.1 µm / 50 mm = 0.4″）也不够长行程。
  //
  // 为什么是"激光 + 四象限"：激光束是一条**直的参考线**，四象限读的是
  // 光束中心的位移。分辨率不是探测器噪声（1 mW、0.1 s 积分下散粒噪声
  // 折 0.2–1 nm），而是**光束指向漂移 + 空气折射率梯度** —— 所以窗口
  // 0.05–0.2 µm 里 99 % 是这两项，不是光电二极管。
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * 激光头。**488 nm、1–5 mW、φ6–10 mm、指向稳定 0.2–0.5 µrad/K。**
   *
   * `plant/stabilized-laser/tube`（Ar⁺、φ3×250、0.2–5 W）+ `/power` +
   * `/housing`（热时间常数 0–100 h）三件子装配，再扩束 10×：
   *
   *   管出口 φ3、发散 λ/(πw₀) = 488e-9/(π×1.5e-3) = 0.10 mrad
   *   10× 扩束后 φ8、发散 10 µrad ⇒ 3 m 上光斑 8 + 30 = 38 mm（够四象限）
   *
   * 指向稳定性 0.2–0.5 µrad/K：管长 250 mm，若镜座是钢（11.5 ppm/K），
   * 1 K 端面走 2.9 µm ⇒ 11.5 µrad/K；外壳的热时间常数 24–48 h 把它压到
   * 0.2–0.5 µrad/K（衰减 20–50 倍）。**这是整台仪器最贵的一格。**
   */
  {
    id: 'plant/laser-straightness/source',
    name: 'Laser Straightness Instrument Laser Head', name_zh: '激光直线度仪激光头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 1, max: 5, unit: 'mW' },
      { param: 'beamDiameter', kind: 'range', min: 6, max: 10, unit: 'mm' },
      { param: 'divergence', kind: 'range', min: 5, max: 10, unit: 'µrad', dir: 'atMost' },
      { param: 'pointingStability', kind: 'range', min: 0.2, max: 0.5, unit: 'µrad/K', dir: 'atMost' },
    ],
  },

  /**
   * 四象限探测器。**4 只光电二极管 + 十字缝，等效位移分辨 0.05–0.2 µm。**
   *
   * φ8 的光斑落在 4 只二极管上，横移 x 使左右功率差 ΔP/P ≈ 2x/(w√(π/2))；
   * w = 4 mm 时，0.1 µm 的位移给 ΔP/P = 3×10⁻⁵ —— 1 mW、0.1 s 积分的
   * 散粒噪声只有 6×10⁻⁸（√N/N），比它小 400 倍。所以 0.05–0.2 µm 不是电学极限，
   * 是**光束自己漂**：0.2 µrad/K × 0.5 K × 3 m = 0.3 µm。
   */
  {
    id: 'plant/laser-straightness/quadrant',
    name: 'Laser Straightness Instrument Quadrant Detector', name_zh: '激光直线度仪四象限探测器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 0.05, max: 0.2, unit: 'µm', dir: 'atMost' },
      { param: 'bandwidth', kind: 'range', min: 0.1, max: 10, unit: 'kHz', dir: 'atLeast' },
      { param: 'activeDiameter', kind: 'range', min: 5, max: 10, unit: 'mm' },
      { param: 'channels', kind: 'range', min: 4, max: 4, unit: '象限' },
    ],
  },

  /** 四路读数。**增益 100–1000、噪声 1–5 µV、4 通道。** 相减/相加后给 X、Y 与总光强（总光强用来归一化，压掉功率波动）。 */
  {
    id: 'plant/laser-straightness/readout',
    name: 'Laser Straightness Instrument Four-Channel Readout', name_zh: '激光直线度仪四路读数',
    unit: '件',
    category: 'part',
    props: [
      { param: 'gain', kind: 'range', min: 100, max: 1000, unit: '倍', dir: 'atLeast' },
      { param: 'noise', kind: 'range', min: 1, max: 5, unit: 'µV', dir: 'atMost' },
      { param: 'channels', kind: 'range', min: 4, max: 4, unit: '通道' },
    ],
  },

  /**
   * 靶座/滑块。**磁力 50–100 N、二维微调 2–5 mm、高 20–100 mm。**
   *
   * 它骑在待测导轨上（或吸在床身上），带着四象限走 1–3 m。磁力不够会
   * 在移动时动 —— 动 0.1 µm 就是 0.1 µm 的假直线度。
   */
  {
    id: 'plant/laser-straightness/carriage',
    name: 'Laser Straightness Instrument Target Mount / Slider', name_zh: '激光直线度仪靶座/滑块',
    unit: '件',
    category: 'part',
    props: [
      { param: 'adjustRange', kind: 'range', min: 2, max: 5, unit: 'mm' },
      { param: 'magneticForce', kind: 'range', min: 50, max: 100, unit: 'N', dir: 'atLeast' },
      { param: 'height', kind: 'range', min: 20, max: 100, unit: 'mm' },
    ],
  },

  /**
   * 激光直线度仪。**行程 1–3 m、直线度 0.5–2 µm/m、不确定度 0.3–1 µm/m。**
   *
   * 误差预算（3 m 行程、垂直温度梯度 0.2 K/m）：
   *
   *   空气折射率梯度   dn/dT = −0.9×10⁻⁶/K、0.2 K/m
   *                    ⇒ 曲率 1.8×10⁻⁷/m ⇒ 3 m 上弯 0.8 µm = 0.27 µm/m
   *   光束指向漂移     0.2–0.5 µrad/K × 0.1 K = 0.02–0.05 µrad
   *                    ⇒ 3 m 上 0.06–0.15 µm = 0.02–0.05 µm/m
   *   翻转法残差       光束的静态弯曲被 180° 翻转平均消掉，残 0.1–0.3 µm/m
   *   四象限噪声       0.05–0.2 µm/点 ⇒ 0.02–0.07 µm/m（0.1 m 步距）
   *   合成             0.3–0.8 µm/m
   *
   * 1 m 行程时空气项只 0.09 µm/m，合成 0.2–0.4 µm/m；3 m 行程 + 0.5 K/m
   * 梯度时到 1–2 µm/m。**所以窗口写 0.5–2 µm/m，随行程分档**。
   */
  {
    id: 'plant/laser-straightness',
    name: 'Laser Straightness Instrument', name_zh: '激光直线度仪',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'straightness', kind: 'range', min: 0.5, max: 2, unit: 'µm/m', dir: 'atMost' },
      { param: 'travel', kind: 'range', min: 1000, max: 3000, unit: 'mm', dir: 'atLeast' },
      { param: 'detectorResolution', kind: 'range', min: 0.05, max: 0.2, unit: 'µm', dir: 'atMost' },
      { param: 'pointingStability', kind: 'range', min: 0.2, max: 0.5, unit: 'µrad/K', dir: 'atMost' },
      { param: 'uncertainty', kind: 'range', min: 0.3, max: 1, unit: 'µm/m', dir: 'atMost' },
    ],
  },

];

export const METROLOGY_PRECISION_ROUTES: readonly Route[] = [
  {
    /**
     * **触针：PCD 坯 → 粗磨 60°/90° 锥 → 抛 R2 µm → SEM 判形。**
     *
     *   金刚石坯 1 件 + 金刚石 0.01 + 金刚石粉 0.005 + 刚玉 0.05 → 触针 1 支
     *
     * ① `plant/wire-saw` 切坯：φ3–5 的 PCD 片切成 1.5×1.5×8 的方条（线锯
     *    切金刚石用 0.1 mm 的黄铜线 + 金刚石浆，切 8 mm 要 2–3 h）；
     * ② 粗磨锥面：青铜结合剂金刚石砂轮（`mat/diamond` 50–100 µm 磨粒），
     *    60° 或 90° 靠磨床的分度夹具，角度 ±0.5°；
     * ③ 精磨 + 抛尖端：铸铁盘 + `mat/diamond-powder` 0.02–0.2 µm，
     *    20 min/支 ⇒ R 1.8–2.2 µm。**这一步的判据是"R 落在 2±0.2"，不是"更尖"**：
     *    更尖的针不会更准 —— 压强 p ∝ F^(1/3)·R^(−2/3)，R 从 2 µm 减到 1 µm
     *    只把压强乘 1.59，却把尖端做得更脆；而横向滤波变强（谷被抹平），
     *    Ra 会偏低。所以按 2±0.2 做，不按"越尖越好"做。
     * ④ 装柄：压板夹持，**不钎焊** —— PCD 在 700 °C 以上石墨化，本层没有
     *    真空钎焊炉（`plant/evaporator` 只到 10 Pa、不能到 700 °C 加热工件）；
     * ⑤ 检验：`plant/cd-sem` 20 000× 量 R（±0.1 µm）、±60° 倾转台转 30°
     *    量锥角（±0.2°）。
     */
    id: 'make/stylus-profilometer-stylus',
    name: 'Stylus Profilometer Diamond Stylus Manufacturing', name_zh: '触针式轮廓仪金刚石触针制造',
    produces: [
      {
        item: 'plant/stylus-profilometer/stylus',
        qty: q(1),
        gives: [
          { param: 'tipRadius', kind: 'range', min: 1.8, max: 2.2 },
          { param: 'coneAngle', kind: 'enum', oneOf: ['60', '90'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/diamond-tip-blank', qty: q(1) }] },
      { anyOf: [{ item: 'mat/diamond', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/diamond-powder', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/comparator/lapping-plate'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '切坯：φ3–5 PCD 片切成 1.5×1.5×8 方条（0.1 mm 黄铜线 + 金刚石浆，2–3 h/支）', performedBy: 'plant/wire-saw' },
      { note_zh: '粗磨 60°/90° 锥面：青铜结合剂金刚石砂轮（50–100 µm），角度 ±0.5°', performedBy: 'plant/grinder' },
      { note_zh: '精磨 + 抛尖端：铸铁盘 + 金刚石粉 0.02–0.2 µm，20 min/支 ⇒ R 1.8–2.2 µm', performedBy: 'plant/grinder', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装柄：压板夹持（不钎焊，PCD 700 °C 石墨化），径向跳动 ≤2 µm', performedBy: 'plant/robot' },
      { note_zh: 'SEM 判形：20 000×（50 nm/像素）量 R ±0.1 µm；倾转台 ±30° 量锥角 ±0.2°', performedBy: 'plant/cd-sem', under: [{ param: 'pressure', min: 0.000001, max: 0.001 }] },
    ],
  },

  {
    /**
     * **低力传感器：45 钢柔性梁 + 电容极板 + `plant/pzt-stage` 的桥。**
     *
     *   电容传感器 1 + 45 钢 0.05 + 铜 0.02 + PTFE 0.005 + 铜线 0.005
     *   + 运放 2 + 水 0.5 → 传感器 1 件
     *
     * ① 铣柔性梁 0.2×5×20（一次装夹保证两个极板面平行 ≤2 µm），
     *    k = 3EI/L³ = 0.26 N/mm、1 mN 时挠度 4 µm；
     * ② 装电容极板 φ6、间隙 20–50 µm（垫片定间隙），屏蔽环接地；
     * ③ 接 `plant/pzt-stage/capacitive-sensor` 的 1 kHz 桥 + 相敏检波，
     *    零位 ≤2 µV；0.05–0.2 nm 折 0.0002–0.0008 mN；
     * ④ 标定：26.95 / 53.9 / 134.8 / 269.5 mg 砝码（火星 g 3.71）
     *    = 0.1 / 0.2 / 0.5 / 1 mN；线性 ≤1 %、蠕变 ≤0.5 %/min。
     *
     * 为什么不是应变片：1 mN 在这根梁上只有 2.9 µε，全桥 0.006 mV/V，
     * 比桥漂小一个量级（算在条目注释里）。**这一格是算出来该用电容的。**
     */
    id: 'make/stylus-force-sensor',
    name: 'Stylus Profilometer Low-Force Sensor Manufacturing', name_zh: '触针式轮廓仪低力传感器制造',
    produces: [
      {
        item: 'plant/stylus-profilometer/force-sensor',
        qty: q(1),
        gives: [
          { param: 'force', kind: 'range', min: 0.1, max: 1 },
          { param: 'resolution', kind: 'range', min: 0.002, max: 0.005 },
          { param: 'stiffness', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'tempDrift', kind: 'range', min: 0.03, max: 0.05 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/pzt-stage/capacitive-sensor', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 2) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
    ],
    needs: ['plant/comparator', 'plant/metrology-room', 'std/dvm-general', 'std/mass-weight-set-mg'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '铣柔性梁 0.2×5×20（45 钢，k = 0.26 N/mm），两片极板面平行 ≤2 µm', performedBy: 'plant/milling-machine' },
      { note_zh: '装电容极板 φ6、间隙 20–50 µm（垫片定间隙），屏蔽环接地', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '接 1 kHz 交流桥 + 相敏检波（与 pzt-stage 同一个桥），零位 ≤2 µV', performedBy: 'plant/robot' },
      { note_zh: '标定：26.95 / 53.9 / 134.8 / 269.5 mg 砝码 = 0.1 / 0.2 / 0.5 / 1 mN；线性 ≤1 %、蠕变 ≤0.5 %/min', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **Z 轴：PZT 台 + 两只电容传感器差分 + 台阶标准件标定。**
     *
     *    PZT 台 1 + 电容传感器 2 + 45 钢 0.5 + 铜线 0.02 + 运放 4 → Z 轴 1 件
     *
     * 两只传感器对置（差分）：同向漂移相减，灵敏度加倍。0.05–0.2 nm 各一只，
     * 差分后噪声 ×1/√2 ⇒ 0.04–0.14 nm；交付只报 0.05–0.1 nm，0.14 那端不交。
     *
     * 标定链：`std/step-standard-0.1nm`（0.08–0.1 nm）→ `plant/xray-interferometer`
     * 读相位（0.1 nm = 0.319 个 (111) 条纹，八帧 11° ⇒ 0.008 nm）→ Z 轴读数。
     * 这是**整份文件里唯一有溯源的纳米级高度**；0.1 nm 的分辨率若没有它，
     * 就只是"电噪声小"，不是"读得准"。
     */
    id: 'make/stylus-z-axis',
    name: 'Z-Axis Manufacturing', name_zh: 'Z 轴制造',
    produces: [
      {
        item: 'plant/stylus-profilometer/z-axis',
        qty: q(1),
        gives: [
          { param: 'resolution', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'travel', kind: 'range', min: 10, max: 100 },
          { param: 'linearity', kind: 'range', min: 0.01, max: 0.05 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/pzt-stage', qty: q(1) }] },
      { anyOf: [{ item: 'plant/pzt-stage/capacitive-sensor', qty: q(2) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 20) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
    ],
    needs: ['plant/metrology-room', 'std/step-standard-0.1nm', 'std/dvm-general'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '装 PZT 台：台面与传感器同轴，极板间隙 20–50 µm（垫片定间隙）', performedBy: 'plant/robot' },
      { note_zh: '两只电容传感器对置装，差分接桥；零位 ≤2 µV、带宽 1–10 kHz', performedBy: 'plant/robot' },
      { note_zh: '闭环整定：阶跃 0.1 µm，整定 10–100 ms，超调 ≤5 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '标定：台阶标准件 0.08–0.1 nm，X 射线干涉读相位到 0.008 nm；每档 10 点', performedBy: 'plant/xray-interferometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '线性度：10 µm 行程 11 点，偏差 ≤0.01–0.05 %（电容桥的线性区）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **导轨：磨 → 研 → 抛 → 翻转法测直线度。**
     *
     *    GCr15 1 + 刚玉 0.5 + 金刚石粉 0.02 → 导轨 1 件（0.05–0.1 µm/50 mm）
     *
     * 0.1 µm/50 mm 的算术：研具走 50 mm 的直线运动，导轨的直线度是研具
     * 直线度的**复印**，所以研具本身要在三块对研的平板上修（平板 0.1 µm）。
     * 最后一道金刚石粉抛光的去除量 0.2–0.5 µm，只修 0.05 µm 级的局部高点。
     *
     * 检验（这是本件成立的关键，也是它的天花板）：
     *   r₁(x) = w(x) + p(x)，翻转 180° 后 r₂(x) = w(L−x) + p(x)；
     *   r₁ − r₂ = w(x) − w(L−x) —— **平板 p(x) 被消掉**，得到导轨的奇部。
     *   比较仪 0.1 µm 分度、10 点 × 3 次平均 ⇒ 奇部 0.05 µm。
     *   偶部消不掉，只能靠平板自己的平面度（0.1 µm）—— 所以窗口是 0.05–0.1。
     */
    id: 'make/stylus-guide',
    name: 'Stylus Profilometer Precision Guideway Manufacturing', name_zh: '触针式轮廓仪精密导轨制造',
    produces: [
      {
        item: 'plant/stylus-profilometer/guide',
        qty: q(1),
        gives: [
          { param: 'straightness', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'travel', kind: 'range', min: 50, max: 100 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/bearing-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/diamond-powder', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/comparator/lapping-plate', 'plant/metrology-room'],
    rate: { hours: q(60) },
    steps: [
      { note_zh: '淬火 830–860 + 回火 500–600（GCr15，58–62 HRC）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 500, max: 860 }] },
      { note_zh: '粗磨：磨床磨 V 形/矩形导轨面，留 0.02 mm 研量', performedBy: 'plant/grinder' },
      { note_zh: '研：三块对研平板 + 刚玉 W7→W1，研具走 50 mm 直线行程（复印的是研具的直线度）', performedBy: 'plant/grinder', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '抛：铸铁盘 + 金刚石粉 0.02–0.2 µm，去 0.2–0.5 µm 高点', performedBy: 'plant/grinder', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '翻转法测直线度：比较仪 0.1 µm、10 点 × 2 向 × 3 次；差值的一半 = 导轨奇部（0.05 µm），偶部靠平板 0.1 µm 兜底', performedBy: 'plant/comparator', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **行程驱动：蜗轮 1:48 + T2 丝杠 + 7.5 kW 电机。**
     *
     *    电机 1 + 45 钢 2 + 轴承钢 0.5 + P0 轴承 2 + 铸铁 3 → 行程 1 件
     *
     * 4 极 1440 r/min ÷ 48 = 30 r/min → 丝杠 2 mm 导程 = 60 mm/min = 1.0 mm/s；
     * 变频 5 %（1.5 r/min）⇒ 3 mm/min = 0.05 mm/s。7.5 kW 是**大马拉小车**：
     * 低速端的转矩余量 100 倍，换来的是 0.05 mm/s 不爬行 —— 本层只有这一种电机。
     */
    id: 'make/stylus-traverse',
    name: 'Stylus Profilometer Traverse Drive Manufacturing', name_zh: '触针式轮廓仪行程驱动制造',
    produces: [
      {
        item: 'plant/stylus-profilometer/traverse',
        qty: q(1),
        gives: [
          { param: 'speed', kind: 'range', min: 0.05, max: 1 },
          { param: 'speedRipple', kind: 'range', min: 1, max: 2 },
          { param: 'stroke', kind: 'range', min: 50, max: 100 },
        ],
      },
    ],
    // 机座、蜗杆、蜗轮、丝杠、螺母、电机、轴承在条目 composedOf 上。
    uses: [{ anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(30) },
    steps: [
      { note_zh: '装蜗杆、蜗轮、丝杠与消隙螺母，配轴承', performedBy: 'plant/robot' },
      { note_zh: '装电机与带轮，接铜线', performedBy: 'plant/robot' },
      { note_zh: '量速度纹波 1–2 %（0.5 mm/s 走 3 个 10 s 段）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **基座：HT250 30 kg + 矿棉垫，时间常数 24–48 h。**
     *
     *    铸铁 30 + 矿棉 2 → 基座 1 件
     *
     * 与 `plant/metrology-room/isolation` 同一思路（铸铁块 + 矿棉），
     * 但这一件要**大热容**而不是隔振：30 kg 的铸铁，表面 0.5 m²，
     * 对流 8 W/(m²·K) ⇒ 时间常数 τ = mc/(hA) = 30×460/(8×0.5) = 3450 s
     * = 0.96 h（裸铁）；加 50 mm 矿棉后 h 降到 0.5 W/(m²·K) ⇒ τ ≈ 15 h；
     * 再套一层钢板外壳到 24–48 h。**τ 越大，房间 ±1 K 的波动进到导轨上的
     * 就越少** —— 24 h 后残余 1 K 的 1/24 ≈ 0.04 K，折算 100 mm 上 1.15 µm/K × 0.04 K
     * = 0.046 µm，仍在亚微米档。
     */
    id: 'make/stylus-base',
    name: 'Stylus Profilometer Base and Column Manufacturing', name_zh: '触针式轮廓仪基座与立柱制造',
    produces: [
      {
        item: 'plant/stylus-profilometer/base',
        qty: q(1),
        gives: [
          { param: 'cte', kind: 'range', min: 11, max: 11 },
          { param: 'timeConstant', kind: 'range', min: 24, max: 48 },
          { param: 'attenuation', kind: 'range', min: 30, max: 60 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(30) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(2) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(3) }] },
    ],
    needs: ['plant/grinder', 'plant/milling-machine'],
    rate: { hours: q(40) },
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },

  {
    /**
     * **整机：六件装成触针轮廓仪，交付 Ra 0.005–10 µm。**
     *
     *    触针 1 + 测力 1 + Z 轴 1 + 导轨 1 + 行程 1 + 基座 1
     *    + 计算机 1 + DVM 1 + 钢板 2 + 铝 0.5 + 铜线 0.05 → 轮廓仪 1 台
     *
     * 装调的顺序就是误差链的顺序：
     *   ① 基座调水平（0.02 mm/m），导轨装上后**先量直线度**（翻转法 0.05–0.1 µm）；
     *   ② Z 轴与触针同轴：触针尖在导轨上的投影 ≤2 µm（否则行程中测力变）；
     *   ③ 恒力闭环：0.1–1 mN，设定值写完用 mg 砝码复核；
     *   ④ 综合标定：台阶标准件验 Z（0.1 nm）、量块验 Ra（对研合面 0.005–0.02 µm）；
     *   ⑤ 重复性：同一量块 10 次，σ(Ra) ≤0.005 µm（Ra 的 25 %，设计值）。
     *
     * ⚠️ 第 ⑤ 步的"σ ≤0.005 µm"是**开环目标**：本层没有第二台轮廓仪做比对，
     * 重复性只能自己重复自己 —— 它证明的是"稳定"，不是"准"。
     */
    id: 'make/stylus-profilometer',
    name: 'Stylus Profilometer Assembly', name_zh: '触针式轮廓仪装配',
    produces: [
      {
        item: 'plant/stylus-profilometer',
        qty: q(1),
        gives: [
          { param: 'ra', kind: 'range', min: 0.005, max: 10 },
          { param: 'verticalResolution', kind: 'range', min: 0.05, max: 0.1, record: 'mat/profiler-vertical-cal-record' },
          { param: 'stylusRadius', kind: 'range', min: 1.8, max: 2.2 },
          { param: 'measuringForce', kind: 'range', min: 0.1, max: 1 },
          { param: 'cutoff', kind: 'range', min: 0.08, max: 8 },
          { param: 'evaluationLength', kind: 'range', min: 0.4, max: 40 },
          { param: 'measure/stepHeight', kind: 'range', min: 0, max: 10, record: 'mat/profiler-vertical-cal-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/stylus-profilometer/stylus', qty: q(1) }] },
      { anyOf: [{ item: 'plant/stylus-profilometer/force-sensor', qty: q(1) }] },
      { anyOf: [{ item: 'plant/stylus-profilometer/z-axis', qty: q(1) }] },
      { anyOf: [{ item: 'plant/stylus-profilometer/guide', qty: q(1) }] },
      { anyOf: [{ item: 'plant/stylus-profilometer/traverse', qty: q(1) }] },
      { anyOf: [{ item: 'plant/stylus-profilometer/base', qty: q(1) }] },
      { anyOf: [{ item: 'std/computer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room', 'plant/cd-sem', 'std/step-standard-0.1nm', 'plant/comparator'],
    rate: { hours: q(160) },
    steps: [
      { note_zh: '装基座与导轨：水平 0.02 mm/m；导轨直线度翻转法复测 0.05–0.1 µm/50 mm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装 Z 轴与触针：触针尖对导轨的投影 ≤2 µm；测力闭环 0.1–1 mN', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装行程与丝杠：0.05–1 mm/s，空回 ≤2 µm，爬行 ≤5 %', performedBy: 'plant/robot' },
      { note_zh: 'Z 标定：台阶标准件 0.08–0.1 nm 十点，读 0.05–0.1 nm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: 'Ra 综合标定：量块研合面 3 条 × 5 点，λc 0.08 mm、评长 0.4 mm；重复性 σ(Ra) ≤0.005 µm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },


  // ═════════════════════════════════════════════════════════════════════════
  // 二（续）、从蜗轮走到分析仪 —— 五条零件路线 + 两条测量路线
  // ═════════════════════════════════════════════════════════════════════════

  {
    /**
     * **720 齿蜗轮：滚齿 → 淬火 → 与蜗杆对研到 0.5–2″。**
     *
     *    轴承钢 2 + 刚玉 0.5 + 水 1 → 蜗轮 1 件
     *
     * 滚齿给 ±10–20″；**精度是研出来的**：蜗轮与蜗杆涂刚玉 W7→W1 对研
     * 20–40 h。每一次啮合都只磨到相碰的齿面，把相邻齿距差一点点拉平，
     * 累积误差被"平均"到 0.5–2″ —— 与三块对研得到平面是同一个道理：
     * **要一个准的东西，不需要一个准的基准，需要一套会自我纠正的工序。**
     */
    id: 'make/dividing-worm-wheel',
    name: 'Dividing Table Worm Wheel Manufacturing', name_zh: '分度台蜗轮制造',
    produces: [
      {
        item: 'plant/dividing-table/worm-wheel',
        qty: q(1),
        gives: [
          { param: 'teeth', kind: 'range', min: 720, max: 720 },
          { param: 'pitchError', kind: 'range', min: 0.5, max: 2 },
          { param: 'diameter', kind: 'range', min: 200, max: 250 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/bearing-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/dividing-table/worm', 'plant/metrology-room'],
    rate: { hours: q(80) },
    steps: [
      { note_zh: '车坯：φ216×20 的 GCr15 盘，车出 720 齿的滚齿毛坯（m=0.3，齿距 0.94 mm）', performedBy: 'lathe' },
      { note_zh: '滚 720 齿，齿面留 0.1 mm 研量（滚齿 ±10–20″）', performedBy: 'plant/gear-hobbing' },
      { note_zh: '淬火 830–860 + 回火 150–200，58–62 HRC', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 830, max: 860 }] },
      { note_zh: '与蜗杆对研：刚玉 W7→W1、20–40 h、正反各半；齿距误差研到 0.5–2″（开环，见第四节）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **蜗杆：m=0.3 单头（q=80、d=24 mm），导程误差 1–3 µm/300 mm。**
     *
     *    45 钢 1 + 轴承钢 0.2 → 蜗杆 1 件
     *
     * 导程误差**不进分度精度**（一转 = 一齿 = 0.5° 是啮合关系），只进传动
     * 平稳性。检验用比较仪在车床的 300 mm 行程上读 5 点 —— 而车床丝杠自己
     * 的误差是 3–8 µm/300 mm（`lathe` 的 `pitchError`），所以 1–3 µm 是
     * **开环值**：量具比被量的还粗。
     */
    id: 'make/dividing-worm',
    name: 'Dividing Table Worm Manufacturing', name_zh: '分度台蜗杆制造',
    produces: [
      {
        item: 'plant/dividing-table/worm',
        qty: q(1),
        gives: [{ param: 'leadError', kind: 'range', min: 1, max: 3 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/bearing-steel', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(20) },
    steps: [
      { note_zh: '车蜗杆：m=0.3、单头、q=80（φ24×120），齿面留 0.2 mm 磨量', performedBy: 'lathe' },
      { note_zh: '磨齿面与轴颈：表面 Ra ≤0.1 µm，与蜗轮的接触区研到 70 %', performedBy: 'plant/grinder' },
      { note_zh: '导程检验：车床 300 mm 行程 5 点，比较仪 0.1 µm；车床丝杠自己 3–8 µm ⇒ 1–3 µm 是开环值', performedBy: 'plant/comparator', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **分度台主轴：车 → 磨轴颈 → 装 P5 轴承 → 跳动 0.2–1 µm。**
     *
     *    轴承钢 1 + 45 钢 1 + P5 轴承 2 → 主轴 1 件
     *
     * 轴系跳动进光栅的偏心（1 阶），1 阶被双读数头平均消掉，但 2 阶消不掉，
     * 所以仍要 0.2–1 µm。磨轴颈在恒温间做：0.1 K 的温差在 φ60 上就是 0.07 µm。
     */
    id: 'make/dividing-spindle',
    name: 'Dividing Table Spindle Manufacturing', name_zh: '分度台主轴制造',
    produces: [
      {
        item: 'plant/dividing-table/spindle',
        qty: q(1),
        gives: [{ param: 'runout', kind: 'range', min: 0.2, max: 1 }],
      },
    ],
    // 轴与 P5 轴承在条目 composedOf 上；铜线只作装轴承时的锁线。
    uses: [{ anyOf: [{ item: 'mat/copper-wire', qty: q(1, 100) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '装两只 P5 轴承，预紧 20–30 N', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '量径向跳动 0.2–1 µm（比较仪 0.1 µm 分度）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '锁线固定轴承螺母', performedBy: 'plant/robot' },
    ],
  },

  {
    /** **分度台基座：HT250 25 kg + 矿棉，热时间常数 24–48 h。** 与轮廓仪基座同一工艺。 */
    id: 'make/dividing-base',
    name: 'Dividing Table Base Manufacturing', name_zh: '分度台基座制造',
    produces: [
      {
        item: 'plant/dividing-table/base',
        qty: q(1),
        gives: [
          { param: 'cte', kind: 'range', min: 11, max: 11 },
          { param: 'timeConstant', kind: 'range', min: 24, max: 48 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(25) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(2) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
    ],
    needs: ['plant/grinder'],
    rate: { hours: q(40) },
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },

  {
    /**
     * **分度台：720 齿蜗轮 + 1:30–1:100 差动，0.005–0.01667°/步。**
     *
     *    蜗轮 1 + 蜗杆 1 + 主轴 1 + 基座 1 + P0 轴承 2 + 铜线 0.05 → 台 1 台
     *
     * 粗 0.5°（蜗杆一转）+ 细 0.005–0.01667°（差动 1:100 / 1:50 / 1:30）
     * = 72000 / 36000 / 21600 步/转。
     *
     * 重复性 0.1–0.5″ 的验法：台面上 R = 50 mm 处放一块量块，比较仪
     * 0.1 µm 分度读它的位移 —— 0.1 µm/50 mm = 0.41″。所以 **0.5″ 端可验，
     * 0.1″ 端验不了**（要 0.025 µm/50 mm，比较仪不够）。这是分度台唯一
     * 能写出来的验收数，也是它被写进缺口表的原因。
     *
     * 闭合：720 步转一圈回零，闭合差 ≤2″。闭合差只证明"一圈走完回到原处"，
     * 不证明中间 720 个位置各自准 —— 这一条与编码器同源，见第四节。
     */
    id: 'make/dividing-table',
    name: 'Dividing Table Manufacturing', name_zh: '分度台制造',
    produces: [
      {
        item: 'plant/dividing-table',
        qty: q(1),
        gives: [
          { param: 'repeatability', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'indexError', kind: 'range', min: 0.5, max: 2 },
          { param: 'stepAngle', kind: 'range', min: 0.005, max: 0.5 },
          { param: 'tableDiameter', kind: 'range', min: 150, max: 250 },
          { param: 'load', kind: 'range', min: 20, max: 50 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/dividing-table/worm-wheel', qty: q(1) }] },
      { anyOf: [{ item: 'plant/dividing-table/worm', qty: q(1) }] },
      { anyOf: [{ item: 'plant/dividing-table/spindle', qty: q(1) }] },
      { anyOf: [{ item: 'plant/dividing-table/base', qty: q(1) }] },
      { anyOf: [{ item: 'std/bearing-general-p0', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/comparator'],
    rate: { hours: q(60) },
    steps: [
      { note_zh: '装蜗轮蜗杆：中心距配作，侧隙 ≤2′，正反空回 ≤1′', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装差动与 30/50/100 孔分度盘（换齿轮）：粗 0.5° × 细 1/30–1/100 = 0.005–0.01667°', performedBy: 'plant/robot' },
      { note_zh: '装台面：与主轴一次装夹，端跳 ≤1 µm、径跳 ≤1 µm（比较仪）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '重复性：R=50 mm 力臂 + 量块 + 比较仪，同一位置往返 20 次，散布 ≤0.5″（0.1 µm/50 mm）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '闭合：720 步转一圈回零，闭合差 ≤2″；中间位置准不准没有量具（见第四节）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **圆光栅盘：玻璃磨抛 → 甩胶 → 72000 次分度曝光 → 显影 → HF 刻。**
     *
     *    玻璃 0.12 + 胶 0.001 + HF 0.01 + NaOH 0.005 + 丙酮 0.05 + 水 2 → 盘 1 件
     *
     * 不是"写满 360°"，是**一条一条地分度曝光**：
     *
     *   缝宽 1.7 µm（= 3.49 µm 节距的一半，在 R=40 处）
     *   72000 次 × (分度 0.1 s + 曝光 1.5 s) ≈ 32 h
     *
     * 为什么缝是 1.7 µm：径向线的节距随半径变（R=30 时 2.6 µm、R=50 时 4.4 µm），
     * 固定缝宽在 30–50 mm 带上的占空比是 39–65 %；读数头放在 R=40 的
     * 50 % 占空比处，所以 1.7 µm 是**按读数半径定的**，不是按整条带。
     *
     * 刻深 0.244 µm = λ/2 @488 nm：二元相位光栅（占空比 0.5）的
     * 零级 |c₀|² = (1+cos φ)/2 = 0、±1 级各 |c₁|² = (1−cos φ)/(2π²) = **10.1 %**；
     * 若只刻 λ/4，零级 50 %、±1 各 5.1 % —— 读数头要的是 ±1 的干涉，所以取 λ/2。
     * 不做金属膜：本层没有纯铬（`asphere.ts:1181` 的同一句话），幅值光栅
     * 只能用胶线（几十次曝光就磨坏），所以走**玻璃刻蚀的相位光栅**，
     * 母版（狭缝掩模）可以反复用。
     */
    id: 'make/rotary-encoder',
    name: 'Rotary Grating Disk Manufacturing', name_zh: '圆光栅盘制造',
    produces: [
      {
        item: 'std/rotary-encoder',
        qty: q(1),
        gives: [
          { param: 'lines', kind: 'range', min: 21600, max: 72000 },
          { param: 'accuracy', kind: 'range', min: 0.5, max: 2 },
          { param: 'resolution', kind: 'range', min: 0.14, max: 0.47 },
          { param: 'diameter', kind: 'range', min: 100, max: 200 },
          { param: 'pitch', kind: 'range', min: 3.49, max: 11.64 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(12, 100) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/acetone', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['std/photomask-general', 'plant/metrology-room', 'plant/comparator/lapping-plate'],
    rate: { hours: q(48) },
    steps: [
      { note_zh: '磨盘：φ100×6 玻璃两面研抛（平面度 λ/2、平行度 2 µm、Ra ≤0.005 µm）', performedBy: 'plant/grinder', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '甩胶 0.5 µm（3 000 r/min），前烘 90 °C 30 min', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装盘与狭缝掩模：缝宽 1.7 µm、径向长 20 mm（R 30–50），盘心与分度台同轴 ≤2 µm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '分度 0.005°（×72000 次；21600 线时走 0.01667°）', performedBy: 'plant/dividing-table' },
      { note_zh: '接触曝光 1.5 s/次（365 nm，胶面与掩模硬接触）', performedBy: 'plant/mask-aligner', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '显影：0.5 % NaOH 60 s + 去离子水冲 + 甩干', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 30 }] },
      { note_zh: 'HF 刻 0.244 µm 深（λ/2 @488 nm，零级压到 0、±1 各 10.1 %）；刻深靠时间 180 s ±5 %，深度差进的是衍射效率不是节距', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 30 }] },
      { note_zh: '检验：节距 3.49 µm ±0.02（SEM 量 20 条取平均）；盘面形 λ/2（干涉仪）', performedBy: 'plant/cd-sem', under: [{ param: 'pressure', min: 0.000001, max: 0.001 }] },
    ],
  },

  {
    /**
     * **读数头：指示光栅 + 4 只光电二极管 + 128 倍模拟细分。**
     *
     *    光电二极管 4 + 玻璃 0.02 + HF 0.005 + 钢板 0.2 + 铜线 0.01
     *    + 运放 4 + 薄膜电容 4 → 读数头 1 件
     *
     * 四只二极管错开 1/4 节距（3.49/4 = 0.87 µm），得 sin/cos 两路；
     * arctan 细分 128 倍。分辨率的算式：一条线 = 18.0″（72000 线时），
     * ÷128 = 0.14″；21600 线时一条线 = 60.0″，÷128 = 0.47″。
     * 交付写 0.14–0.47″，就是 18″/128 与 60″/128 这两个数本身。
     */
    id: 'make/rotary-encoder-head',
    name: 'Rotary Grating Disk Read Head Manufacturing', name_zh: '圆光栅盘圆光栅读数头制造',
    produces: [
      {
        item: 'std/rotary-encoder/head',
        qty: q(1),
        gives: [
          { param: 'resolution', kind: 'range', min: 0.14, max: 0.47 },
          { param: 'bandwidth', kind: 'range', min: 100, max: 500 },
          { param: 'channels', kind: 'range', min: 4, max: 4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/photodiode-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(2, 100) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 100) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(4) }] },
    ],
    needs: ['plant/metrology-room', 'plant/comparator'],
    rate: { hours: q(40) },
    steps: [
      { note_zh: '刻指示光栅：4×4 mm 窗口、与盘同节距（3.49 µm），玻璃 + 胶 + HF', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 30 }] },
      { note_zh: '装 4 只光电二极管：错开 1/4 节距（0.87 µm），与指示光栅间隙 ≤20 µm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '细分电路：arctan（四象限乘法器）128 倍，线性度 ≤1 %（= 0.18″）', performedBy: 'plant/robot' },
      { note_zh: '检验：装在分度台上转 1°，与台面比较，细分线性 ≤1 %、噪声 ≤0.05″', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **电容探头：车体 → 装传感器 → 台阶标准件标定。**
     *
     *    `plant/pzt-stage/capacitive-sensor` 1 + 45 钢 0.5 + PTFE 0.02
     *    + 铜线 0.01 + 运放 2 → 探头 1 件
     *
     * 与轮廓仪 Z 轴共用同一种传感器，只去掉差分与闭环。标定仍只有一条路：
     * `std/step-standard-0.1nm` + `plant/xray-interferometer` 读相位（0.008 nm）。
     * 0.05–0.1 nm 的噪声地板由此判定 —— **不是看示波器上有多安静，是看
     * 0.08 nm 的台阶在不在**。
     */
    id: 'make/spindle-probe',
    name: 'Spindle Periodic Error Analyzer Capacitive Displacement Probe Manufacturing', name_zh: '主轴周期误差分析仪电容位移探头制造',
    produces: [
      {
        item: 'plant/spindle-error-analyzer/probe',
        qty: q(1),
        gives: [
          { param: 'resolution', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'range', kind: 'range', min: 10, max: 100 },
          { param: 'bandwidth', kind: 'range', min: 1, max: 10 },
        ],
      },
    ],
    // 探头体、传感器、运放在条目 composedOf 上；PTFE 与铜线是屏蔽/接线。
    uses: [
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room', 'std/step-standard-0.1nm', 'plant/xray-interferometer'],
    rate: { hours: q(16) },
    steps: [
      { note_zh: '装探头体、传感器与运放，接屏蔽与铜线', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '标定：台阶标准件 0.08–0.1 nm 十点，X 射线干涉读相位；噪声 ≤0.1 nm(rms)', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **同步钟：10 MHz 晶振分频 + 同沿锁存，抖动 0.1–1 µs。**
     *
     *    石英晶振 1 + 计数芯片 2 + 运放 2 + 铜线 0.01 + 钢板 0.1 → 钟 1 件
     *
     * 抖动不是"时钟本身的相位噪声"，是**通道间采样时刻的差**：编码器
     * 细分计数与探头必须同一个沿锁存，差 1 µs 在 5 kHz（100 阶 @3000 r/min）
     * 上就是 1.8° 相位。所以 10 µs 的需求、0.1–1 µs 的交付。
     */
    id: 'make/spindle-sync-clock',
    name: 'Spindle Periodic Error Analyzer Synchronous Sampling Clock Manufacturing', name_zh: '主轴周期误差分析仪同步采样时钟制造',
    produces: [
      {
        item: 'plant/spindle-error-analyzer/sync-clock',
        qty: q(1),
        gives: [
          { param: 'jitter', kind: 'range', min: 0.1, max: 1 },
          { param: 'rate', kind: 'range', min: 10, max: 100 },
          { param: 'channels', kind: 'range', min: 2, max: 4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/quartz-resonator-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room', 'std/dvm-general'],
    rate: { hours: q(8) },
    steps: [
      { note_zh: '10 MHz 分频到 10–100 kHz（计数器链，分频比 100–1000）', performedBy: 'plant/robot' },
      { note_zh: '2–4 通道同沿采样保持（同一时钟沿驱动 CMOS 开关），通道偏斜 ≤0.1 µs', performedBy: 'plant/robot' },
      { note_zh: '检验抖动：同一时钟两路各计 10⁵ 个周期，差 ≤0.1 µs；温度 19–21 °C 下 1 h 漂 ≤1 µs', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **定心/翻转夹具：车锥面 → 磨配 → 定心 ≤5 µm。**
     *
     *    45 钢 2 + 轴承钢 0.5 + P5 轴承 2 + 铜线 0.01 → 夹具 1 件
     *
     * 定心 5 µm 在 R=40 上是 25″ 的 1 阶 —— 它**故意留在双读数头平均之前**，
     * 由两个头把它消掉；若夹具能做到 1 µm，双头平均的残差也更小。
     * 四个定位销（0/90/180/270°）让光盘相对主轴转四次，是多步分离法的硬件。
     */
    id: 'make/spindle-fixture',
    name: 'Spindle Periodic Error Analyzer Centering/Flipping Fixture Manufacturing', name_zh: '主轴周期误差分析仪定心/翻转夹具制造',
    produces: [
      {
        item: 'plant/spindle-error-analyzer/fixture',
        qty: q(1),
        gives: [
          { param: 'centering', kind: 'range', min: 1, max: 5 },
          { param: 'reversal', kind: 'enum', oneOf: ['0-90-180-270'] },
          { param: 'capacity', kind: 'range', min: 5, max: 50 },
        ],
      },
    ],
    // 本体、4 只定位销、P5 轴承在条目 composedOf 上；铜线只作锁线。
    uses: [{ anyOf: [{ item: 'mat/copper-wire', qty: q(1, 100) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '装本体与 4 只定位销，配两只 P5 轴承', performedBy: 'plant/robot' },
      { note_zh: '磨锥面，与主轴锥面配作（接触 ≥80 %）', performedBy: 'plant/grinder', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '定心检验：装光盘后编码器读数首阶 ≤5 µm 当量（双头平均前）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /** **分析仪基座：HT250 40 kg + 矿棉。** 探头与主轴之间不许有相对振动（0.05 nm 的地板）。 */
    id: 'make/spindle-frame',
    name: 'Spindle Periodic Error Analyzer Base Manufacturing', name_zh: '主轴周期误差分析仪基座制造',
    produces: [
      {
        item: 'plant/spindle-error-analyzer/frame',
        qty: q(1),
        gives: [
          { param: 'cte', kind: 'range', min: 11, max: 11 },
          { param: 'attenuation', kind: 'range', min: 20, max: 40 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(40) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(3) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(3) }] },
    ],
    needs: ['plant/grinder'],
    rate: { hours: q(40) },
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },

  {
    /**
     * **整机：双读数头 + 探头 + 同步钟，交付 0.1–1″、≤10 µs、10–3000 r/min。**
     *
     *    光盘 1 + 读数头 2 + 探头 1 + 同步钟 1 + 夹具 1 + 基座 1 + 计算机 1
     *    + DVM 1 + 钢板 1 + 铜线 0.05 → 分析仪 1 台
     *
     * **自校用多步分离法**（这是本件唯一诚实的地方）：
     *
     * 设光盘刻划误差 d(θ)、主轴误差 s(θ)。盘相对主轴转 φ 后测得
     * m_φ(θ) = d(θ−φ) + s(θ)。取 φ = 0/90/180/270° 四组，可解出 d 与 s
     * 的**除 4 的倍数阶以外**的所有谐波（4、8、12… 阶不可分）。
     *
     * 所以：
     *   · 1–3、5–7… 阶（含 1 阶）—— 可分离，这是本机的主交付；
     *   · 4 的倍数阶 —— 不可分，幅度上限 = 光盘刻划误差折算到 R=40：
     *     2″ × 40 mm = 0.39 µm。**这四分之一阶数上是"看不出来"的**，
     *     要再换 0/120/240° 三步或第二只盘（缺口，见第四节）。
     */
    id: 'make/spindle-error-analyzer',
    name: 'Spindle Periodic Error Analyzer Assembly', name_zh: '主轴周期误差分析仪装配',
    produces: [
      {
        item: 'plant/spindle-error-analyzer',
        qty: q(1),
        gives: [
          { param: 'measure/angularResolution', kind: 'range', min: 0.1, max: 0.5, record: 'mat/spindle-error-record' },
          { param: 'measure/syncError', kind: 'range', min: 0.1, max: 1, record: 'mat/spindle-error-record' },
          { param: 'measure/spindleSpeed', kind: 'range', min: 10, max: 3000, record: 'mat/spindle-error-record' },
          { param: 'measure/harmonicOrder', kind: 'range', min: 1, max: 100, record: 'mat/spindle-error-record' },
          { param: 'measure/periodicError', kind: 'range', min: 0.02, max: 0.5, record: 'mat/spindle-error-record' },
          { param: 'probeResolution', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'measure/resolution', kind: 'range', min: 0.05, max: 0.1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/rotary-encoder', qty: q(1) }] },
      { anyOf: [{ item: 'std/rotary-encoder/head', qty: q(2) }] },
      { anyOf: [{ item: 'plant/spindle-error-analyzer/probe', qty: q(1) }] },
      { anyOf: [{ item: 'plant/spindle-error-analyzer/sync-clock', qty: q(1) }] },
      { anyOf: [{ item: 'plant/spindle-error-analyzer/fixture', qty: q(1) }] },
      { anyOf: [{ item: 'plant/spindle-error-analyzer/frame', qty: q(1) }] },
      { anyOf: [{ item: 'std/computer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room', 'std/step-standard-0.1nm', 'plant/comparator'],
    rate: { hours: q(120) },
    steps: [
      { note_zh: '装盘与夹具：定心 ≤5 µm；两只读数头 180° 对置，1 阶在平均里消掉', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装探头：径向 R=40 处一只、端面 10 mm 处一只（轴向/径向分开）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '同步链：1024 细分计数/转触发采样保持，通道偏斜 ≤0.1 µs', performedBy: 'plant/robot' },
      { note_zh: '自校：0/90/180/270° 四步分离，解出光盘与主轴误差；4 的倍数阶标"未分离"', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '综合检验：已知 1 µm 偏心样件，1–100 阶幅值表（0.02–0.5 µm 档）；重复性 ≤0.01 µm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },



  // ═════════════════════════════════════════════════════════════════════════
  // 三（续）、激光直线度的六条路线
  // ═════════════════════════════════════════════════════════════════════════

  {
    /**
     * **激光头：稳频管 + 电源 + 热罩 + 10× 扩束。**
     *
     *    Ar⁺ 管 1 + 电源 1 + 热罩 1 + 玻璃 0.2 + 钢板 1 + 铝 0.2 + 铜线 0.02
     *    → 激光头 1 件
     *
     * 管子是 `plant/stabilized-laser` 的同一只（φ3×250、0.2–5 W）；本件只要
     * 1–5 mW，所以出口加 8 片吸收玻璃（每片 50 %，0.5 W / 2⁸ = 2 mW）。
     *
     * 扩束 10×：两片玻璃透镜（f = 10 mm 与 100 mm，开普勒式，镜距 110 mm）；波前 ≤λ/4 用
     * `plant/interferometer` 判。**扩束镜的像差不是问题，指向稳定性才是** ——
     * 所以镜筒与管子一起装进热罩（时间常数 24–48 h），而不是分体。
     */
    id: 'make/laser-straightness-source',
    name: 'Laser Straightness Instrument Laser Head Manufacturing', name_zh: '激光直线度仪激光头制造',
    produces: [
      {
        item: 'plant/laser-straightness/source',
        qty: q(1),
        gives: [
          { param: 'power', kind: 'range', min: 1, max: 5 },
          { param: 'beamDiameter', kind: 'range', min: 6, max: 10 },
          { param: 'divergence', kind: 'range', min: 5, max: 10 },
          { param: 'pointingStability', kind: 'range', min: 0.2, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/stabilized-laser/tube', qty: q(1) }] },
      { anyOf: [{ item: 'plant/stabilized-laser/power', qty: q(1) }] },
      { anyOf: [{ item: 'plant/stabilized-laser/housing', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 50) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(60) },
    steps: [
      { note_zh: '车镜筒与镜座：两片透镜同轴 ≤10 µm，f = 10 / 100 mm、镜距 110 mm（10×）', performedBy: 'lathe' },
      { note_zh: '装管、电源、热罩：管子与镜筒同一热罩，时间常数 24–48 h', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '调准直：出射 φ6–10 mm，发散 5–10 µrad；干涉仪判波前 ≤λ/4', performedBy: 'plant/interferometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '测指向稳定性：30 min 内漂 ≤0.05 µrad；温度每变 1 K 的指向变化 ≤0.5 µrad', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **四象限：4 只光电二极管 + 十字缝掩模 + 前置放大。**
     *
     *    光电二极管 4 + 玻璃 0.01 + 钢板 0.2 + 铜线 0.01 + 运放 4 → 四象限 1 件
     *
     * 十字缝宽 50 µm（玻璃 + HF 刻，或刀口拼缝），四只二极管贴成 2×2、
     * 间隙 ≤20 µm。四路电流各自跨阻放大（100–1000 倍）。
     *
     * 检验不用位移台：把靶座装在千分尺上走 10 µm 一步读 ΔP/P 的线性；
     * 0.1 µm 一步走不了（千分尺 10 µm 分度），所以**0.05–0.2 µm 的"分辨"
     * 是算的**（散粒噪声 + 光束漂移），不是量的。这一条写在缺口里。
     */
    id: 'make/laser-quadrant',
    name: 'Laser Straightness Instrument Quadrant Detector Manufacturing', name_zh: '激光直线度仪四象限探测器制造',
    produces: [
      {
        item: 'plant/laser-straightness/quadrant',
        qty: q(1),
        gives: [
          { param: 'resolution', kind: 'range', min: 0.05, max: 0.2 },
          { param: 'bandwidth', kind: 'range', min: 0.1, max: 10 },
          { param: 'activeDiameter', kind: 'range', min: 5, max: 10 },
          { param: 'channels', kind: 'range', min: 4, max: 4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/photodiode-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 100) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
    ],
    needs: ['plant/metrology-room', 'std/dvm-general'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '刻十字缝：缝宽 50 µm（玻璃 + 胶 + HF），两条缝正交 ≤10 µm', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 30 }] },
      { note_zh: '贴 4 只光电二极管：2×2、间隙 ≤20 µm、与缝对齐 ≤20 µm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '四路跨阻放大 100–1000 倍，带宽 0.1–10 kHz；暗电流补偿', performedBy: 'plant/robot' },
      { note_zh: '检验：1 mW 光下四路平衡 ≤2 %；用千分尺走 10 µm 读 ΔP/P，线性 ≤1 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **四路读数：相减/相加 + 归一化，压掉激光功率波动。**
     *
     *    运放 8 + 计数芯片 2 + DVM 1 + 铜线 0.02 + 钢板 0.3 + 铝 0.2 → 读数 1 件
     *
     * 四路电流 I₁..I₄：
     *   X ∝ (I₁+I₄ − I₂−I₃)/(I₁+I₂+I₃+I₄)
     * 分母是总光强，功率漂 1 % 时 X 不动 —— **归一化是 0.1 µm 能稳 10 min 的原因**。
     */
    id: 'make/laser-readout',
    name: 'Laser Straightness Instrument Four-Channel Readout Manufacturing', name_zh: '激光直线度仪四路读数制造',
    produces: [
      {
        item: 'plant/laser-straightness/readout',
        qty: q(1),
        gives: [
          { param: 'gain', kind: 'range', min: 100, max: 1000 },
          { param: 'noise', kind: 'range', min: 1, max: 5 },
          { param: 'channels', kind: 'range', min: 4, max: 4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(8) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 3) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room', 'std/dvm-general'],
    rate: { hours: q(20) },
    performedBy: 'plant/robot',
  },

  {
    /**
     * **靶座：磁力座 + 二维微调，骑在导轨上走 1–3 m。**
     *
     *    磁铁 2 + 45 钢 1 + 铸铁 1 + P0 轴承 2 → 靶座 1 件
     *
     * 磁力 50–100 N：吸在铸铁床身上（`mat/iron-ht250` 是铁磁的）。
     * 微调 2–5 mm 用来把光斑调到四象限中心（φ8 光斑、φ10 靶面，偏心
     * ≤1 mm 内线性够）。
     */
    id: 'make/laser-carriage',
    name: 'Laser Straightness Instrument Target Mount / Slider Manufacturing', name_zh: '激光直线度仪靶座/滑块制造',
    produces: [
      {
        item: 'plant/laser-straightness/carriage',
        qty: q(1),
        gives: [
          { param: 'adjustRange', kind: 'range', min: 2, max: 5 },
          { param: 'magneticForce', kind: 'range', min: 50, max: 100 },
          { param: 'height', kind: 'range', min: 20, max: 100 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/permanent-magnet-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] },
      { anyOf: [{ item: 'std/bearing-general-p0', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(20) },
    steps: [
      { note_zh: '铣磁座与燕尾，装两块磁铁（磁力 50–100 N）', performedBy: 'plant/milling-machine' },
      { note_zh: '车二维微调（丝杆 0.5 mm/转，行程 2–5 mm）', performedBy: 'lathe' },
      { note_zh: '装四象限靶面（高 20–100 mm 可调），整体刚性：手推 10 N 位移 ≤0.1 µm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **整机：激光头 + 四象限 + 读数 + 靶座，交付 0.5–2 µm/m、1–3 m。**
     *
     *    激光头 1 + 四象限 1 + 读数 1 + 靶座 1 + 计算机 1 + 钢板 1.5
     *    + 铝 0.5 + 铜线 0.05 → 直线度仪 1 台
     *
     * 装调与标定：
     *   ① 激光头固定在导轨一端（磁力座或螺栓），光束与导轨大致平行 ≤1 mm/m；
     *   ② 靶座放在另一端，四象限居中；走 10 点看光斑不丢；
     *   ③ **翻转法**：把激光头绕光轴转 180° 再测一遍 —— 光束的静态弯曲
     *      反号，平均后消掉；两次之差的一半是光束的弯曲量（0.1–0.3 µm/m）；
     *   ④ 直线度没有绝对原器：本层有一把 `std/calibrated-scale-100`（1 m 刻线尺），
     *      但它只声明了**刻线间距**的准确度（10 nm/100 mm），**直线度没有声明、
     *      也没有证书**；更长的大地基准更没有。**所以"直线度"是自校量**
     *      （翻转法的一致性），不是对原器的偏差。
     */
    id: 'make/laser-straightness',
    name: 'Laser Straightness Instrument Assembly', name_zh: '激光直线度仪装配',
    produces: [
      {
        item: 'plant/laser-straightness',
        qty: q(1),
        gives: [
          { param: 'straightness', kind: 'range', min: 0.5, max: 2 },
          { param: 'travel', kind: 'range', min: 1000, max: 3000 },
          { param: 'detectorResolution', kind: 'range', min: 0.05, max: 0.2 },
          { param: 'pointingStability', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'uncertainty', kind: 'range', min: 0.3, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/laser-straightness/source', qty: q(1) }] },
      { anyOf: [{ item: 'plant/laser-straightness/quadrant', qty: q(1) }] },
      { anyOf: [{ item: 'plant/laser-straightness/readout', qty: q(1) }] },
      { anyOf: [{ item: 'plant/laser-straightness/carriage', qty: q(1) }] },
      { anyOf: [{ item: 'std/computer-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(3, 2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room', 'plant/interferometer', 'plant/comparator'],
    rate: { hours: q(80) },
    steps: [
      { note_zh: '装激光头与四象限：光束与导轨平行 ≤1 mm/m；1 m 内光斑不丢', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '对中与量程：靶座从 0 走到 3 m，四象限四路平衡 ≤5 %、总光强 ≥0.5 mW', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '翻转法自校：激光头绕光轴转 180° 复测，两次之差的一半 = 光束弯曲（0.1–0.3 µm/m）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '重复性：同一 1 m 段走 10 次，σ ≤0.1 µm/m；温度梯度用两支热电偶记（0.1–0.5 K/m）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

];

// ═══════════════════════════════════════════════════════════════════════════
// 四、剩余缺口（全部带数；没有一条写成"造不出"）
//
// 这些不是设计里能补的格，是**本层没有更高一级的标准**。写在这里，
// 是为了让上表的每个"设计值"都能被追问到底。
//
//   ① **角度原器：0 件。** 分度台的齿距误差 0.5–2″、编码器的精度 ±0.5–2″
//      都是**开环值**。闭合差（720 步回零 ≤2″）只证明"一圈走完回到原处"，
//      不证明中间 72000 个位置各自准。要独立验证，本层只有两条更粗的路：
//      `plant/cd-sem` 的倾转台 + 度盘（0.05° = 180″，差 90–360 倍）与
//      比较仪当杠杆（0.1 µm/50 mm = 0.41″）只在 50 mm 行程内够用，
//      量不了 0°–360° 上的 72000 个位置。
//      **绝对角误差在本层不可独立验证** —— 这是三件量具共同的上游缺口。
//
//   ② **分度台 0.1″ 端验不了。** 比较仪 0.1 µm/50 mm = 0.41″，只能验到
//      0.5″ 端；要验 0.1″ 得 0.025 µm/50 mm，比较仪差 4 倍。
//      所以 `repeatability` 交 0.1–0.5″，但**能证明的是 0.5″**。
//
//   ③ **100 000 线那一档没做。** 100000 不是 360 的整数倍：278 线/° × 360
//      = 100080，最后一段会多 0.8° 的接缝。本文件交 21600 / 36000 / 72000
//      （60 / 100 / 200 线每度，都能被 360 整除）。要 100000 线：
//      分度步距要 0.0036°（0.5°/0.0036° ⇒ 1:139 差动；现在最大 1:100 = 0.005°，差 1.4 倍）；
//      缝宽要 1.25 µm（现在 1.7 µm），而接触曝光的 1 µm 间隙在 365 nm 上
//      的近场衍射极限是 1.3–1.5 µm —— **两道墙，各差 1.3–1.5 倍**。
//
//   ④ **4 的倍数阶不可分。** 0/90/180/270° 四步分离法解不出 4、8、12…
//      阶；这些阶的幅度上限 = 2″ × 40 mm = **0.39 µm**（光盘刻划误差折算）。
//      要分离：再取 0/120/240° 三步（多一组工装与 1 天测量），或第二只盘
//      （多一套 `std/rotary-encoder` + `std/rotary-encoder/head`）。
//
//   ⑤ **主轴探头带宽 1–10 kHz 把阶数锁在 100。** 3000 r/min 的 100 阶是
//      5 kHz，够；200 阶是 10 kHz，正好在带宽边缘（幅值误差 −3 dB）。
//      所以 `harmonicOrder` 写 1–100，不写 1–200。
//
//   ⑥ **直线度没有原器。** 翻转法自校只证明"两次量的是同一条线"，
//      不证明那条线是直的。本层最长的是 300 mm 平晶、1 m 刻线尺
//      （`std/calibrated-scale-100`，只声明刻线间距准确度）与 2 m 床身本身 ——
//      **没有一件声明过直线度**，也没有大地基准。3 m 行程的 0.3–1 µm/m 不确定度
//      是**误差预算**，不是比对结果。
//
//   ⑦ **空气温度梯度没有承担者。** 19–21 °C 是 `plant/metrology-room` 的
//      `holds`，但**垂直梯度**没有设备维持：没有梯度传感器、没有分层风幕。
//      0.2 K/m ⇒ 3 m 上弯 0.8 µm（0.27 µm/m）；0.5 K/m ⇒ 2 µm（0.67 µm/m）。
//      所以 0.5 µm/m 端只在 ≤0.1 K/m 时成立，而 0.1 K/m 是**开环声明**。
//
//   ⑧ **触针是接触式，会压。** 0.5 mN / R2 µm 的赫兹平均压强 6.4 GPa，
//      超过淬硬钢屈服 2–3 GPa，理想球面压痕深 a²/2R = **6 nm**；0.1 mN 时
//      2 nm。量块只能测一次、且测非工作面 —— 这是接触式的固有代价，
//      光学 VSI 不受这个限，但也读不了陡壁（NA 0.55 ⇒ ±33°）。
//
//   ⑨ **Ra 的"准"没有比对。** 重复性 σ(Ra) ≤0.005 µm 是自己重复自己；
//      本层没有第二台轮廓仪，也没有 Ra 标准样板（`std/step-standard-0.1nm`
//      是**台阶**高度标准，不是粗糙度标准，Ra 0.005–0.02 µm 那一档没有样板）。
//
//   ⑩ **力值的 g 不确定度。** 火星 g 3.71 m/s² 没有本地实测，按 0.1 % 记
//      ⇒ 力的绝对不确定度 0.1–0.2 %，与 0.2 % FS 的分辨同量级。
//      要压下去得先有绝对重力仪（0 件）。
//
//   ⑪ **四象限的 0.05–0.2 µm 是算的。** 千分尺只能走 10 µm 一步，
//      验不了 0.1 µm 的线性；散粒噪声算得 0.2–1 nm、光束漂移
//      0.02–0.05 µrad，合成 0.05–0.2 µm 是**设计值**，不是实测。
//
//   ⑫ **分度台与编码器的热梯度。** 铸铁 11 ppm/K：分度台 R=100 mm 上
//      1 K 的温差走 1.1 µm = 2.3″；玻璃盘 0.5 ppm/K 在 R=40 mm 上只有 0.09″。
//      24–48 h 的热时间常数只压**波动**，不消**梯度** —— 梯度没有量具。
// ═══════════════════════════════════════════════════════════════════════════

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...METROLOGY_PRECISION_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...METROLOGY_PRECISION_ROUTES];
