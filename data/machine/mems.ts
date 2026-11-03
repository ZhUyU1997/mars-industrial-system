/**
 * MEMS 三台设备与那片 MEMS 裸片 —— 机器人六轴 IMU 的前半条链。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、这一份补的是哪句话
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `data/machine/robot.ts` 的 `plant/robot/imu` 条目原先写着"本层造不出"：
 * 深硅刻蚀差 8–100 倍、键合差 180 K 与 1 kV、真空封装 0 台。那三个数是对的，
 * 但它们描述的是**设备**，不是"物理上不可能"。按用户 2026-10-20 定的原则
 * （地球上存在的工程能力，模型里必须有产出路线），这里把设备补出来：
 *
 *   `plant/drie-etcher`      深硅刻蚀：10–100 µm、AR 10–20、侧壁 85–88°
 *   `plant/anodic-bonder`    阳极键合：300–450 °C、0–1.5 kV、1–100 Pa
 *   `plant/vacuum-sealer`    真空封装：1e-4–1 Pa、250–450 °C、吸气剂
 *
 * 三台都不是"再走一道"：DRIE 要 13.56 MHz 高密度等离子体（RF 源直接用既有的
 * `plant/rf-13m56`，不重复造），键合要专用炉 + 高压，封装要真空腔 + 吸气剂。
 * 它们的零件都在这份文件里，每件都有路线；三台机器本身按 `composedOf` 装配，
 * 不写产出路线（与 `plant/rie-etcher`、`plant/euv-vacuum` 同一个形状）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、DRIE 为什么不是把 RIE 调深一点
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `plant/rie-etcher` 是 134 kHz 的 CCP，刻深 0.8–1.2 µm、AR 1.6–2.2。
 * 深硅刻蚀要 10–100 µm，靠的是**电感耦合**：13.56 MHz 的线圈把功率送进
 * 石英管，电子在交变磁场里走闭合回路，离子密度比 CCP 高 10–100 倍，
 * 所以能在 1–10 Pa 的低压下拿到 1–3 µm/min 的硅刻蚀速率。
 *
 * 本机用 **SF6 + C4F6 的"伪 Bosch"**：SF6 负责刻、C4F6 负责在侧壁淀积
 * 碳氟聚合物钝化。真正的 Bosch 用 C4F8；本层 `mat/c4f8` 0 条，但 `mat/c4f6`
 * 有路线（`make/c4f6`，纯度 98.5–99.5 %），它在 RIE 里已经交过 86–88° 的
 * 介质侧壁，所以这里拿它当钝化气。代价是 C4F6 的 C/F 比 C4F8 低，
 * 侧壁聚合物薄 20–30 %，侧壁角从 89–90° 掉到 85–88°。
 *
 * **数值全部是设计值**：本层没有膜厚仪、没有 SEM 断面、没有台阶仪，
 * 深度只能靠"刻蚀时间 × 速率"和揣子量，AR 只能靠设计。所以 props 里的
 * 10–100 µm、AR 10–20、85–88° 都按 Earth 工程值写，注释里逐条标。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、阳极键合的三个数
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   温度 400 °C：钠钙/硼硅玻璃在 300 °C 以上离子电导够大，Na⁺ 才能迁移；
 *                 低于 300 °C 电流上不去，键合要几小时。
 *   电压 1 kV：   玻璃两面的电场把 Na⁺ 拉到阴极，界面留下 O²⁻，与硅的
 *                 悬空键成 Si–O–Si。0.5–1.5 kV 是 0.5–1 mm 玻璃的窗口。
 *   压力 0.1–1 MPa：让玻璃与硅的微观起伏贴住；压力太高会压碎薄片。
 *
 * `plant/hot-press` 上限 220 °C，差 180 K —— 所以这台不是"改造热压机"，
 * 是另一台：加热板要 450 °C、电极要 1.5 kV 绝缘、腔要能抽到 1 Pa。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、真空封装的吸气剂为什么是钛
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * MEMS 腔要 <1–10 Pa 且长期保持。封装时抽到 0.01 Pa，封完腔壁还会放气
 * （水汽、氢、一氧化碳），几小时就能回到 100 Pa。工业用非蒸散型吸气剂
 * （Zr–V–Fe 或 Ti）。本层没有锆铁钒，但 `mat/titanium` 有路线
 * （`make/titanium-kroll`，99.5–99.7 %）：Ti 在 300–400 °C 吸氢、吸氧、
 * 吸水汽，正好是键合/封装的温度。所以吸气剂就是**一片 1 mg 的钛箔**，
 * 封口前贴在腔里，封装升温时自己激活。代价：Ti 的吸氢容量在 400 °C 后
 * 会部分释放，长期真空度只能到 1–10 Pa，到不了商品的 0.1 Pa。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目
// ═══════════════════════════════════════════════════════════════════════════

export const MEMS_ITEMS: readonly Item[] = [
  // ───────────────────────────────────────────────────────────────────────
  // 设备（3 台）
  // ───────────────────────────────────────────────────────────────────────

  /**
   * 深硅刻蚀机（ICP，13.56 MHz，SF6/C4F6 伪 Bosch）。
   *
   * 与 `plant/rie-etcher` 的分工：
   *
   *   RIE      134 kHz CCP，刻 0.8–1.2 µm 的介质/多晶硅，AR 1.6–2.2
   *   DRIE     13.56 MHz ICP，刻 10–100 µm 的硅，AR 10–20
   *
   * 本机不含 RF 源：13.56 MHz / 500 W 的源是既有的 `plant/rf-13m56`
   * （`flow-and-rf.ts:508`，单管自激、500 W 连续波）。它作为**独立设备**
   * 出现在 MEMS 裸片路线的 `needs` 里，不装进本机零件表 —— 一台发生器
   * 给几台腔共用，这是车间里的实际接法，也避免把同一台机器拆成两个 id。
   *
   * 六个 props 是能力窗口，不是某一批的交付值：
   *
   *   depth        10–100 µm    MEMS 陀螺的质量块 10–60 µm、加速度计的梳齿 20–100 µm
   *   aspectRatio  10–20        刻 5 µm 宽、100 µm 深 = AR 20；再深侧壁就弯
   *   sidewallAngle 85–88°      伪 Bosch 的 C4F6 钝化比 C4F8 薄，差 1–2°
   *   etchRate     1–3 µm/min   13.56 MHz、1–10 Pa、SF6 200–400 sccm
   *   uniformity   0–15 %       片内 1σ；判据 ±5 %，差 3 倍（没有 ESC/背吹）
   *   selectivity  30–100 : 1   硅 : 光刻胶/SiO2；Bosch 的脉冲分离让它比 RIE 高一个量级
   */
  {
    id: 'plant/drie-etcher',
    name: 'Deep Silicon Etcher', name_zh: '深硅刻蚀机',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'pressure', min: 0.1, max: 10 },
      { param: 'temperature', min: 15, max: 80 },
    ],
    props: [
      { param: 'depth', kind: 'range', min: 10, max: 100, unit: 'µm', dir: 'atLeast' },
      { param: 'aspectRatio', kind: 'range', min: 10, max: 20, unit: '比值', dir: 'atLeast' },
      { param: 'sidewallAngle', kind: 'range', min: 85, max: 88, unit: '°', dir: 'atLeast' },
      { param: 'etchRate', kind: 'range', min: 1, max: 3, unit: 'µm/min', dir: 'atLeast' },
      { param: 'uniformity', kind: 'range', min: 0, max: 15, unit: '%', dir: 'atMost' },
      { param: 'selectivity', kind: 'range', min: 30, max: 100, unit: '比值', dir: 'atLeast' },
    ],
    composedOf: [
      { item: 'plant/drie-etcher/chamber', qty: q(1) },
      { item: 'plant/drie-etcher/icp-source', qty: q(1) },
      { item: 'plant/drie-etcher/chuck', qty: q(1) },
      { item: 'plant/drie-etcher/gas-panel', qty: q(1) },
      { item: 'plant/drie-etcher/throttle', qty: q(1) },
    ],
  },

  /**
   * 阳极键合机。**玻璃–硅键合，不是胶粘。**
   *
   * 腔里三件事同时发生：加热到 400 °C、加 0.5–1.5 kV、压 0.1–1 MPa。
   * 本层没有 400 °C 的热压机（`plant/hot-press` 只到 220 °C），所以这台
   * 必须新造：加热板、高压馈通、绝缘、加压四件都要。
   *
   * `holds` 里的 `voltage` 不是"设备的属性"，是**工艺条件**：键合那一步
   * 要求腔里维持 0.8–1.2 kV，由本机的馈通与电源承担。条件与属性分开写，
   * 是单一事实来源。
   */
  {
    id: 'plant/anodic-bonder',
    name: 'Anodic Bonder', name_zh: '阳极键合机',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 250, max: 500 },
      { param: 'pressure', min: 0.1, max: 100 },
      { param: 'voltage', min: 0, max: 1500 },
    ],
    props: [
      { param: 'bondTemperature', kind: 'range', min: 300, max: 500, unit: '°C', dir: 'atLeast' },
      { param: 'bondVoltage', kind: 'range', min: 0, max: 2000, unit: 'V', dir: 'atLeast' },
      { param: 'waferSize', kind: 'range', min: 50, max: 200, unit: 'mm', dir: 'atLeast' },
    ],
    composedOf: [
      { item: 'plant/anodic-bonder/chamber', qty: q(1) },
      { item: 'plant/anodic-bonder/heater', qty: q(1) },
      { item: 'plant/anodic-bonder/hv-feedthrough', qty: q(1) },
      { item: 'plant/anodic-bonder/press', qty: q(1) },
    ],
  },

  /**
   * 真空封装台。**金属帽 + 玻璃熔封 + 钛吸气剂。**
   *
   * 它不是键合机：键合机把玻璃盖片封到硅片上，这一步把**整只传感器**
   * 封进金属帽（TO-8 那一档）。腔内要 <1–10 Pa，封口时加热到 300–350 °C，
   * 让玻璃熔封（`mat/glass-frit`，d50 1–5 µm）软化，同时把 1 mg 钛箔
   * 激活。冷却后腔里只剩 1–10 Pa 的残余氦/氩与钛吸不掉的那一点。
   *
   * 缺口：没有氦检漏，漏率只能按"封完 24 h 后看谐振 Q 掉多少"间接判；
   * 本层没有 Q 表，所以这一项是**设计值**，不是实测。
   */
  {
    id: 'plant/vacuum-sealer',
    name: 'Vacuum Sealing Station', name_zh: '真空封装台',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'pressure', min: 1e-4, max: 1 },
      { param: 'temperature', min: 250, max: 450 },
    ],
    props: [
      { param: 'vacuum', kind: 'range', min: 1e-4, max: 1, unit: 'Pa', dir: 'atMost' },
      { param: 'maxTemperature', kind: 'range', min: 250, max: 500, unit: '°C', dir: 'atLeast' },
      { param: 'getterMass', kind: 'range', min: 0, max: 1, unit: 'g', dir: 'atMost' },
    ],
    composedOf: [
      { item: 'plant/vacuum-sealer/bell', qty: q(1) },
      { item: 'plant/vacuum-sealer/heater', qty: q(1) },
      { item: 'plant/vacuum-sealer/seal-head', qty: q(1) },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // DRIE 零件（5 件）
  // ───────────────────────────────────────────────────────────────────────

  /**
   * DRIE 腔。φ300 × 300 铝（8 mm）+ φ100 熔石英窗 + 上盖 ICP 接口。
   *
   * 铝而不是不锈钢：本层没有不锈钢的板材链（`euv-source.ts` 缺口 ④），
   * 铝 + 阳极氧化是唯一既耐氟又不太放气的组合。代价与 RIE 腔一样：
   * 铝的溅射产额是不锈钢的 2 倍，腔壁被打出来的铝会落到片子上。
   *
   * 漏率 1e-3 Pa·L/s 是铜垫刀口 + 石墨绳填料函的水平；再低要氦检，
   * 本层没有。
   */
  {
    id: 'plant/drie-etcher/chamber',
    name: 'DRIE Chamber', name_zh: 'DRIE 腔',
    unit: '件',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 10, max: 40, unit: 'L', dir: 'within' },
      { param: 'leakRate', kind: 'range', min: 0, max: 0.001, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /**
   * ICP 源：φ80 熔石英管 + 6–8 匝 φ6 铜管线圈 + 陶瓷绝缘座 + 匹配抽头。
   *
   *   线圈电感 L = µ₀N²A/ℓ：N = 7、A = π×0.04² = 5.0e-3 m²、ℓ = 7×8 mm = 56 mm
   *   ⇒ L = 1.26e-6 × 49 × 5.0e-3 / 0.056 = **5.5 µH**
   *   13.56 MHz 下感抗 ωL = **470 Ω**；500 W 时线圈电压 √(P·ωL) = **15 kV**
   *   ⇒ 线圈要按 15 kV 绝缘，石英管壁厚 3 mm（石英击穿 20–30 kV/mm）
   *
   * 这是本机最容易被忽略的一件：线圈不是"绕几圈铜管"，是**一个 15 kV 的
   * 谐振电感**，匝间要留 2 mm 油隙，否则 13.56 MHz 下会沿面打火。
   */
  {
    id: 'plant/drie-etcher/icp-source',
    name: 'ICP Source', name_zh: 'ICP 源',
    unit: '件',
    category: 'part',
    props: [
      { param: 'turns', kind: 'range', min: 4, max: 12, unit: '匝', dir: 'within' },
      { param: 'power', kind: 'range', min: 300, max: 1500, unit: 'W', dir: 'atLeast' },
      { param: 'frequency', kind: 'range', min: 13, max: 14, unit: 'MHz', dir: 'within' },
    ],
  },

  /**
   * 下电极/卡盘。φ150–200 铝盘 + 边缘 5 µm 阳极氧化 + 0.1 mm 锡箔 + 压环。
   *
   * 与 RIE 的卡盘同一个解法：没有静电吸盘、没有氦背吹，靠锡箔的接触热导
   * 把片温压在 20–25 °C。DRIE 的功率密度比 RIE 高 5–10 倍（1–3 µm/min 要
   * 300–500 W 进 200 mm 片），所以锡箔这一步更硬：锡 232 °C 熔，水路一断
   * 它就化，片子滑位就是事故信号。
   */
  {
    id: 'plant/drie-etcher/chuck',
    name: 'Deep Silicon Etcher Lower Electrode/Chuck', name_zh: '深硅刻蚀机下电极/卡盘',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 100, max: 300, unit: 'mm', dir: 'within' },
      { param: 'flatness', kind: 'range', min: 0, max: 20, unit: 'µm', dir: 'atMost' },
      { param: 'maxTemperature', kind: 'range', min: 15, max: 80, unit: '°C', dir: 'atLeast' },
    ],
  },

  /**
   * 四路气路：SF6 / C4F6 / O2 / Ar。针阀 + 手磨锥管转子流量计（±20 %）
   * + φ1×100 mm 毛细管 + U 形水柱压差计。
   *
   * 为什么不用 MFC：`plant/mfc` 有路线（0–200 sccm、标称 ±1 %FS），但它
   * 是独立的一台设备，装不进这件零件；而 DRIE 的流量窗口比 RIE 宽
   * （SF6 200–400 sccm、C4F6 20–50 sccm），±20 % 的针阀够用。代价是
   * 片内均匀性 ±10–15 %，见机器 props 的 uniformity。
   */
  {
    id: 'plant/drie-etcher/gas-panel',
    name: 'Deep Silicon Etcher 4-Channel Gas Line', name_zh: '深硅刻蚀机四路气路',
    unit: '件',
    category: 'part',
    props: [
      { param: 'gasLines', kind: 'range', min: 3, max: 8, unit: '路', dir: 'atLeast' },
      { param: 'flowAccuracy', kind: 'range', min: 0, max: 30, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 挡板阀/节流阀。φ50–80 手动翻板 + 石墨绳填料函，10–70 : 1 节流。
   *
   * 泵是既有的 `plant/euv-vacuum`（500–1 000 L/s 涡轮，本底 1e-6 Pa），
   * 但 DRIE 工作在 1–10 Pa，要把 1 000 L/s 节流到 100–400 L/s；
   * 压力是**被这只阀定的**，不是被泵定的。
   */
  {
    id: 'plant/drie-etcher/throttle',
    name: 'Deep Silicon Etcher Flap Valve/Throttle Valve', name_zh: '深硅刻蚀机挡板阀/节流阀',
    unit: '件',
    category: 'part',
    props: [
      { param: 'conductance', kind: 'range', min: 5, max: 100, unit: '倍', dir: 'within' },
      { param: 'diameter', kind: 'range', min: 30, max: 120, unit: 'mm', dir: 'within' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 阳极键合机零件（4 件）
  // ───────────────────────────────────────────────────────────────────────

  /**
   * 键合腔。φ250 × 250 不锈钢/铝 + φ80 熔石英观察窗 + 高压馈通座。
   *
   * 与 DRIE 腔的差别不在材料，在**电极**：下电极接高压、上电极接地，
   * 两电极之间是 0.5–1 mm 的玻璃 + 硅。腔壁必须与高压极隔开 20 mm 以上，
   * 否则 1.5 kV 会沿腔壁爬电。
   */
  {
    id: 'plant/anodic-bonder/chamber',
    name: 'Anodic Bonder Bonding Chamber', name_zh: '阳极键合机键合腔',
    unit: '件',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 10, max: 50, unit: 'L', dir: 'within' },
      { param: 'leakRate', kind: 'range', min: 0, max: 0.001, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /**
   * 加热板。2–4 kW，400–450 °C，φ200 铝/不锈钢板，内埋电阻丝。
   *
   *   功率：φ200 板 3 kg 钢，从 20 到 400 °C 要 3 × 0.5 × 380 = 570 kJ；
   *   30 min 升温 ⇒ 320 W 净功率，加损失取 **1–2 kW**。留 2–4 kW 是为了
   *   把升温压到 15 min（玻璃与硅的膨胀差要快速度过 200–300 °C 区间）。
   */
  {
    id: 'plant/anodic-bonder/heater',
    name: 'Anodic Bonder Heater Plate', name_zh: '阳极键合机加热板',
    unit: '件',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 0.5, max: 5, unit: 'kW', dir: 'atLeast' },
      { param: 'maxTemperature', kind: 'range', min: 300, max: 550, unit: '°C', dir: 'atLeast' },
    ],
  },

  /**
   * 高压馈通。φ30 氧化铝陶瓷绝缘子 + φ8 铜电极 + 玻璃封接。
   *
   * 1.5 kV 在 1 Pa 下的帕邢曲线：最小击穿电压约 300–400 V（间隙 1–3 mm），
   * 所以馈通内部不能有 1–3 mm 的直面间隙；陶瓷绝缘子的爬电距离取 20 mm，
   * 玻璃封接把铜电极与法兰之间的缝隙填死。
   */
  {
    id: 'plant/anodic-bonder/hv-feedthrough',
    name: 'Anodic Bonder High-Voltage Feedthrough', name_zh: '阳极键合机高压馈通',
    unit: '件',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 0, max: 3000, unit: 'V', dir: 'atLeast' },
      { param: 'leakRate', kind: 'range', min: 0, max: 0.0001, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /**
   * 加压机构。丝杠 + 四立柱 + 碟形弹簧，0.5–20 kN、行程 10–80 mm。
   *
   * 键合压力 0.1–1 MPa × φ150 片 = 1.8–18 kN，所以 20 kN 是上限。
   * 用丝杠而不是液压：1 Pa 的真空腔里不能有液压油，而丝杠的行程
   * 可以手摇，不需要伺服。
   */
  {
    id: 'plant/anodic-bonder/press',
    name: 'Anodic Bonder Press Mechanism', name_zh: '阳极键合机加压机构',
    unit: '件',
    category: 'part',
    props: [
      { param: 'force', kind: 'range', min: 0.5, max: 20, unit: 'kN', dir: 'atLeast' },
      { param: 'stroke', kind: 'range', min: 10, max: 80, unit: 'mm', dir: 'within' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 真空封装台零件（3 件）
  // ───────────────────────────────────────────────────────────────────────

  /**
   * 封装钟罩。φ250 × 200 钢/铝钟罩 + φ60 玻璃窗 + 橡胶/PTFE 门封。
   *
   * 与键合腔不同：它只到 1e-3–1 Pa，不承受 400 °C 的长时间烘烤，
   * 所以门封可以用 PTFE（`mat/ptfe`，本层有）。PTFE 在 300 °C 会冷流，
   * 所以加热只做局部（封口电极），钟罩壁保持 <100 °C。
   */
  {
    id: 'plant/vacuum-sealer/bell',
    name: 'Vacuum Sealing Station Sealing Bell Jar', name_zh: '真空封装台封装钟罩',
    unit: '件',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 5, max: 30, unit: 'L', dir: 'within' },
      { param: 'leakRate', kind: 'range', min: 0, max: 0.0001, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /**
   * 封装加热台。0.5–2 kW、300–400 °C，只加热工件局部。
   *
   * 玻璃熔封（`mat/glass-frit`）的软化点 400–450 °C，但封装腔里的
   * 钛吸气剂在 300–350 °C 就激活；两个温度取交集，工件定在 330–350 °C。
   */
  {
    id: 'plant/vacuum-sealer/heater',
    name: 'Vacuum Sealing Station Sealing Heater Stage', name_zh: '真空封装台封装加热台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 0.3, max: 3, unit: 'kW', dir: 'atLeast' },
      { param: 'maxTemperature', kind: 'range', min: 250, max: 500, unit: '°C', dir: 'atLeast' },
    ],
  },

  /**
   * 封口头。φ10 铜电极 + 内绕电阻丝 + 0.1–3 kN 气压/弹簧压头。
   *
   * 它同时做两件事：把金属帽压住、把帽沿的玻璃熔封加热到 400 °C。
   * 铜的导热好，电极尖端 2 mm 内是 400 °C，往外 10 mm 就掉到 150 °C，
   * 这样钟罩的 PTFE 门封不会被烤化。
   */
  {
    id: 'plant/vacuum-sealer/seal-head',
    name: 'Vacuum Sealing Station Seal Head', name_zh: '真空封装台封口头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'force', kind: 'range', min: 0.1, max: 3, unit: 'kN', dir: 'atLeast' },
      { param: 'maxTemperature', kind: 'range', min: 250, max: 450, unit: '°C', dir: 'atLeast' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 机器人件：MEMS 裸片（1 件，批量 200）
  // ───────────────────────────────────────────────────────────────────────

  /**
   * 六轴 IMU 的 MEMS 裸片。**一片硅片出 200 只，不是一只。**
   *
   * 一只裸片 3×3×0.4 mm，里面有：
   *   三轴陀螺    对称谐振质量 + 梳齿驱动/检测，Q > 1000
   *   三轴加速度计 梳齿差分电容，量程 ±16 g
   *   键合环      玻璃盖片压在第一层上，阳极键合封住
   *
   * 为什么是裸片而不是整只 IMU：MEMS 片与 ASIC 是两条完全不同的线
   * （硅微加工 vs 3 µm 混合信号），批量也不同（200 只/片 vs 60 只/批）。
   * 拆成两个条目，才能让"哪条线断了"在模型里看得见。
   *
   * 尺寸/厚度是设计值：本层没有膜厚仪与台阶仪，刻蚀深度靠时间×速率。
   */
  {
    id: 'plant/robot/imu-mems-die',
    name: '6-Axis IMU MEMS Die', name_zh: '六轴 IMU 的 MEMS 裸片',
    unit: '件',
    category: 'part',
    props: [
      { param: 'dieSize', kind: 'range', min: 1, max: 5, unit: 'mm', dir: 'within' },
      { param: 'thickness', kind: 'range', min: 0.2, max: 0.6, unit: 'mm', dir: 'within' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线
// ═══════════════════════════════════════════════════════════════════════════

export const MEMS_ROUTES: readonly Route[] = [
  // ───────────────────────────────────────────────────────────────────────
  // DRIE 零件
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * DRIE 腔。卷圆/焊 → 车法兰 → 装石英窗 → 检漏。
     *
     *   进   铝 25 + 石英 1 + 薄钢板 5 + 铜 1 + 水 15 = 47 kg
     *   出   腔 1 件（设计净重 34 kg：铝壁 28 + 法兰/接管 5 + 窗座 1）
     *
     * 检漏只能到 1e-3 Pa·L/s（铜垫刀口 + 石墨绳），没有氦检。
     */
    id: 'make/drie-chamber',
    name: 'DRIE Chamber Manufacturing', name_zh: 'DRIE 腔制造',
    produces: [
      {
        item: 'plant/drie-etcher/chamber',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 25, max: 30 },
          { param: 'leakRate', kind: 'range', min: 0.0001, max: 0.001 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(25) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(15) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '卷圆 + 氩弧焊纵缝/法兰/四个接管，焊后 600 °C 去应力（不去的后果是车完就变形）',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh: '车两端法兰止口、φ100 窗座、φ50 涡轮接口；内壁 20 µm 阳极氧化（只做腔壁，不做密封面）',
        performedBy: 'lathe',
      },
      { note_zh: '装熔石英窗（钠钙玻璃的热冲击一烤就炸）、铜垫、接地屏蔽', performedBy: 'plant/robot' },
      {
        note_zh: '检漏：抽到 1 Pa 关阀，10 min 压升 <10 Pa 判过；只能到 1e-3 Pa·L/s',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(40) },
    unbalanced_zh:
      '铝 25 + 石英 1 + 薄钢板 5 + 铜 1 + 水 15 = 47 kg → 腔 1 件（设计净重 34 kg）；余 13 kg 是卷圆边角、车屑、焊材与试压水；产品按件计，不进质量账；余料回 mat/metal-scrap',
  },

  {
    /**
     * ICP 源：车石英管 → 绕 7 匝铜管 → 装陶瓷座 → 测频/耐压。
     *
     *   进   石英 3 + 铜 2 + 氧化铝 2 + PTFE 0.2 + 水 10 = 17.2 kg
     *   出   ICP 源 1 件（石英管 φ80×250、线圈 7 匝、L 5.5 µH）
     *
     * 石英管要在 1900–2100 °C 拉制/封底：本层只有 `plant/glass-lathe`
     * （氢氧焰 1900–2200 °C），它本来是为玻璃仪器造的，正好干这件事。
     */
    id: 'make/drie-icp-source',
    name: 'ICP Source Manufacturing', name_zh: 'ICP 源制造',
    produces: [
      {
        item: 'plant/drie-etcher/icp-source',
        qty: q(1),
        gives: [
          { param: 'turns', kind: 'range', min: 6, max: 8 },
          { param: 'power', kind: 'range', min: 500, max: 1000 },
          { param: 'frequency', kind: 'range', min: 13.56, max: 13.56 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(3) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '石英管 φ80×250、壁厚 3 mm、一端封底：氢氧焰 1900–2100 拉制，退火 1 100 消应力',
        performedBy: 'plant/glass-lathe',
        under: [{ param: 'temperature', min: 1900, max: 2100 }],
      },
      {
        note_zh: '绕 7 匝 φ6 铜管线圈（匝距 8 mm，匝间 2 mm 油隙 —— 15 kV 下不留隙会沿面打火）；两端接匹配抽头',
        performedBy: 'plant/winder',
      },
      { note_zh: '车氧化铝绝缘座、装 PTFE 垫、把石英管与线圈同轴固定', performedBy: 'plant/robot' },
      {
        note_zh: '测电感（5.5 µH ±10 %）与 1.5 kV 匝间耐压；频率用 `plant/rf-13m56` 的源扫',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      '石英 3 + 铜 2 + 氧化铝 2 + PTFE 0.2 + 水 10 = 17.2 kg → ICP 源 1 件（设计净重 6.5 kg）；余 10.7 kg 是石英切头/炸裂、铜管边角与磨削水；产品按件计，不进质量账；余料回 mat/quartz-scrap',
  },

  {
    /**
     * 卡盘：车铝盘 → 边缘阳极氧化 → 贴锡箔 → 量平面度。
     *
     *   进   铝 5 + 锡 0.1 + 氧化铝 0.5 + 水 5 = 10.6 kg
     *   出   卡盘 1 件（φ180、平面度 5–10 µm）
     *
     * 阳极氧化只做边缘环：中间要导电（锡箔 → 片子 → 等离子体），
     * 边缘要绝缘（不然 RF 会沿腔壁对地打弧）。
     */
    id: 'make/drie-chuck',
    name: 'Deep Silicon Etcher Lower Electrode/Chuck Manufacturing', name_zh: '深硅刻蚀机下电极/卡盘制造',
    produces: [
      {
        item: 'plant/drie-etcher/chuck',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 180, max: 180 },
          { param: 'flatness', kind: 'range', min: 5, max: 10 },
          { param: 'maxTemperature', kind: 'range', min: 60, max: 80 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(5) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车 φ180 × 20 铝盘，端面平面度 0.01、内车 φ8 环形水道', performedBy: 'lathe' },
      {
        note_zh: '边缘环阳极氧化 5 µm：15 % 硫酸、1.5 A/dm²、20 V、20–25 °C；中间用锡箔掩蔽',
        performedBy: 'plant/plating-bath',
        under: [{ param: 'temperature', min: 20, max: 25 }],
      },
      { note_zh: '贴 0.1 mm 锡箔、装三道压环与压杆', performedBy: 'plant/robot' },
      {
        note_zh: '量平面度：比较仪 + 量块，四点各量一次（0.01 mm 是设计值，研磨平板只能到 2 µm）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      '铝 5 + 锡 0.1 + 氧化铝 0.5 + 水 5 = 10.6 kg → 卡盘 1 件（设计净重 4.2 kg）；余是车屑 3.5 kg、阳极氧化吃掉的 16 µm 铝与洗液',
  },

  {
    /**
     * 气路：车阀体 → 磨锥管 → 装流量计 → 标定。
     *
     *   进   铜 2 + 45 钢 1 + 玻璃 0.5 + 毛细管基准 1 + PTFE 0.1 + 水 5 = 8.6 kg
     *   出   气路 1 件（4 路，±10–20 %）
     *
     * φ1×100 mm 毛细管是"±20 %"能被说清的唯一基准：50 sccm 过它
     * Δp = 8µLQ/(πr⁴) = 61 Pa = 6.2 mm 水柱。
     */
    id: 'make/drie-gas-panel',
    name: 'Deep Silicon Etcher 4-Channel Gas Line Manufacturing', name_zh: '深硅刻蚀机四路气路制造',
    produces: [
      {
        item: 'plant/drie-etcher/gas-panel',
        qty: q(1),
        gives: [
          { param: 'gasLines', kind: 'range', min: 4, max: 4 },
          { param: 'flowAccuracy', kind: 'range', min: 10, max: 20 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 2) }] },
      { anyOf: [{ item: 'std/orifice-cal-50sccm', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车四路针阀体（铜）+ 45 钢针；阀座 60° 锥面，手研磨配', performedBy: 'lathe' },
      { note_zh: '磨 0.5° 锥孔玻璃管（转子流量计），配铝浮子', performedBy: 'plant/grinder' },
      { note_zh: '装流量计、毛细管与 U 形水柱压差计，接管路', performedBy: 'plant/robot' },
      {
        note_zh: '标定：50 sccm 对应 6.2 mm 水柱；排水集气法校 0–200 sccm（±3 % 批次）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      '铜 2 + 45 钢 1 + 玻璃 0.5 + 毛细管 1 + PTFE 0.1 + 水 5 = 9.6 kg → 气路 1 件（设计净重 4.5 kg）；余是车屑、玻璃锥管废品与标定水',
  },

  {
    /**
     * 节流阀：车翻板 → 装石墨绳填料 → 试漏。
     *
     *   进   铝 2 + 45 钢 1 + 碳 0.1 + 水 2 = 5.1 kg
     *   出   节流阀 1 件（φ60、10–70 : 1）
     */
    id: 'make/drie-throttle',
    name: 'Deep Silicon Etcher Flap Valve/Throttle Valve Manufacturing', name_zh: '深硅刻蚀机挡板阀/节流阀制造',
    produces: [
      {
        item: 'plant/drie-etcher/throttle',
        qty: q(1),
        gives: [
          { param: 'conductance', kind: 'range', min: 10, max: 70 },
          { param: 'diameter', kind: 'range', min: 50, max: 80 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车 φ60 翻板与阀体，翻板轴与阀体孔配 0.05 mm 间隙', performedBy: 'lathe' },
      { note_zh: '装石墨绳填料函（PTFE 在 100 °C 以上冷流，石墨绳才耐得住烘烤）', performedBy: 'plant/robot' },
      {
        note_zh: '试漏：关阀抽到 1 Pa，压升 <5 Pa/min 判过',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(12) },
    unbalanced_zh:
      '铝 2 + 45 钢 1 + 碳 0.1 + 水 2 = 5.1 kg → 阀 1 件（设计净重 2.3 kg）；余是车屑与试压水',
  },

  // ───────────────────────────────────────────────────────────────────────
  // 阳极键合机零件
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * 键合腔：卷圆/焊 → 车法兰 → 装窗 → 检漏。
     *
     *   进   薄钢板 30 + 铝 5 + 石英 1 + 铜 1 + 水 10 = 47 kg
     *   出   腔 1 件（设计净重 36 kg）
     *
     * 高压极与腔壁隔 20 mm：1.5 kV 在 1 Pa 下沿面爬电的距离。
     */
    id: 'make/anodic-chamber',
    name: 'Anodic Bonder Bonding Chamber Manufacturing', name_zh: '阳极键合机键合腔制造',
    produces: [
      {
        item: 'plant/anodic-bonder/chamber',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 20, max: 30 },
          { param: 'leakRate', kind: 'range', min: 0.0001, max: 0.001 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(30) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(5) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '卷圆 + 焊纵缝/上下法兰/馈通座；焊后 600 °C 去应力', performedBy: 'plant/sheet-shop' },
      { note_zh: '车两端法兰止口、φ80 窗座、馈通座 20 mm 爬电台阶', performedBy: 'lathe' },
      { note_zh: '装石英窗、铜垫、接地屏蔽；高压极与腔壁之间加 PTFE 护套', performedBy: 'plant/robot' },
      {
        note_zh: '检漏：抽到 1 Pa 关阀，10 min 压升 <10 Pa 判过',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(40) },
    unbalanced_zh:
      '薄钢板 30 + 铝 5 + 石英 1 + 铜 1 + 水 10 = 47 kg → 腔 1 件（设计净重 36 kg）；余是边角、车屑与试压水',
  },

  {
    /**
     * 加热板：绕电阻丝 → 装陶瓷 → 测功率。
     *
     *   进   电阻丝 2 + 氧化铝 5 + 薄钢板 10 + 水 5 = 22 kg
     *   出   加热板 1 件（2–4 kW、450 °C）
     *
     * 电阻丝用镍铬（`mat/resistance-wire`，本层有）；氧化铝陶瓷
     * （`mat/alumina`）做绝缘与均温板，钢壳承力。
     */
    id: 'make/anodic-heater',
    name: 'Anodic Bonder Heater Plate Manufacturing', name_zh: '阳极键合机加热板制造',
    produces: [
      {
        item: 'plant/anodic-bonder/heater',
        qty: q(1),
        gives: [
          { param: 'power', kind: 'range', min: 2, max: 4 },
          { param: 'maxTemperature', kind: 'range', min: 450, max: 500 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(2) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(5) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '绕镍铬丝 2 kW（φ0.8、电阻 12 Ω，220 V 下 18 A）在氧化铝骨架上', performedBy: 'plant/winder' },
      { note_zh: '氧化铝绝缘片 + 钢壳 + 热电偶孔；引线用陶瓷珠绝缘', performedBy: 'plant/robot' },
      {
        note_zh: '测功率与升温：20→400 °C <20 min，400 °C 恒温 30 min 波动 <10 K',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      '电阻丝 2 + 氧化铝 5 + 薄钢板 10 + 水 5 = 22 kg → 加热板 1 件（设计净重 16 kg）；余是陶瓷切边、钢屑与水',
  },

  {
    /**
     * 高压馈通：磨陶瓷绝缘子 → 装铜电极 → 玻璃封接 → 耐压。
     *
     *   进   氧化铝 2 + 铜 1 + 玻璃粉 0.1 + 水 2 = 5.1 kg
     *   出   馈通 1 件（1.5 kV、1e-4 Pa·L/s）
     *
     * 玻璃封接 800–900 °C：玻璃粉（`mat/glass-frit`，d50 1–5 µm）在
     * 陶瓷与铜之间形成气密绝缘层；本层没有可伐合金，铜的热膨胀
     * （17 ppm/K）与氧化铝（8 ppm/K）差 9 ppm/K，所以封接层要薄
     * （0.1–0.2 mm）并且慢冷（2 °C/min）。
     */
    id: 'make/anodic-feedthrough',
    name: 'Anodic Bonder High-Voltage Feedthrough Manufacturing', name_zh: '阳极键合机高压馈通制造',
    produces: [
      {
        item: 'plant/anodic-bonder/hv-feedthrough',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 1500, max: 2000 },
          { param: 'leakRate', kind: 'range', min: 0.00001, max: 0.0001 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/alumina', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass-frit', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '磨 φ30 氧化铝绝缘子（爬电 20 mm，端面平行度 0.02）', performedBy: 'plant/grinder' },
      { note_zh: '装 φ8 铜电极与法兰，玻璃粉环填缝', performedBy: 'plant/robot' },
      {
        note_zh: '玻璃封接 800–900 °C、30 min，2 °C/min 慢冷（铜与氧化铝差 9 ppm/K，快冷就裂）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 800, max: 900 }],
      },
      {
        note_zh: '耐压 2 kV/1 min 不漏电；抽到 1 Pa 压升 <1 Pa/min',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(12) },
    unbalanced_zh:
      '氧化铝 2 + 铜 1 + 玻璃粉 0.1 + 水 2 = 5.1 kg → 馈通 1 件（设计净重 0.8 kg）；余是磨削泥、玻璃粉挥发分与试压水',
  },

  {
    /**
     * 加压机构：车丝杠/立柱 → 焊框架 → 装碟簧。
     *
     *   进   45 钢 20 + 薄钢板 5 + 铜线 0.1 = 25.1 kg
     *   出   压机 1 件（20 kN、行程 60 mm）
     */
    id: 'make/anodic-press',
    name: 'Anodic Bonder Press Mechanism Manufacturing', name_zh: '阳极键合机加压机构制造',
    produces: [
      {
        item: 'plant/anodic-bonder/press',
        qty: q(1),
        gives: [
          { param: 'force', kind: 'range', min: 10, max: 20 },
          { param: 'stroke', kind: 'range', min: 40, max: 60 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(20) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车 T32×6 丝杠、四根 φ25 立柱、上下压板（45 钢调质 28–32 HRC）', performedBy: 'lathe' },
      { note_zh: '焊框架、装碟簧组（预压 2 kN）与手轮', performedBy: 'plant/sheet-shop' },
      {
        note_zh: '标定压力：用 10 kg 铸铁砝码杠杆（20 kN 量程的 1/10 点），丝杠刻度对应 0.5–20 kN',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      '45 钢 20 + 薄钢板 5 + 铜线 0.1 = 25.1 kg → 压机 1 件（设计净重 23 kg）；余是车屑与焊材',
  },

  // ───────────────────────────────────────────────────────────────────────
  // 真空封装台零件
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * 封装钟罩：卷圆/焊 → 车法兰 → 装窗 → 检漏。
     *
     *   进   薄钢板 20 + 玻璃 2 + 铜 1 + PTFE 0.2 + 水 10 = 33.2 kg
     *   出   钟罩 1 件（设计净重 22 kg）
     */
    id: 'make/sealer-bell',
    name: 'Vacuum Sealing Station Sealing Bell Jar Manufacturing', name_zh: '真空封装台封装钟罩制造',
    produces: [
      {
        item: 'plant/vacuum-sealer/bell',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 10, max: 20 },
          { param: 'leakRate', kind: 'range', min: 0.00001, max: 0.0001 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(20) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '卷圆 + 焊钟罩/法兰/抽气口；焊后 600 °C 去应力', performedBy: 'plant/sheet-shop' },
      { note_zh: '车 φ250 门法兰止口、φ60 窗座；门封槽 6×8', performedBy: 'lathe' },
      { note_zh: '装玻璃窗、PTFE 门封、铜垫与接地', performedBy: 'plant/robot' },
      {
        note_zh: '检漏：抽到 0.1 Pa 关阀，10 min 压升 <2 Pa 判过（1e-4 Pa·L/s 量级）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(32) },
    unbalanced_zh:
      '薄钢板 20 + 玻璃 2 + 铜 1 + PTFE 0.2 + 水 10 = 33.2 kg → 钟罩 1 件（设计净重 22 kg）；余是边角、车屑与试压水',
  },

  {
    /**
     * 封装加热台：绕丝 → 装陶瓷 → 测功率。
     *
     *   进   电阻丝 1 + 氧化铝 3 + 薄钢板 5 + 水 3 = 12 kg
     *   出   加热台 1 件（1–2 kW、450 °C）
     */
    id: 'make/sealer-heater',
    name: 'Vacuum Sealing Station Sealing Heater Stage Manufacturing', name_zh: '真空封装台封装加热台制造',
    produces: [
      {
        item: 'plant/vacuum-sealer/heater',
        qty: q(1),
        gives: [
          { param: 'power', kind: 'range', min: 1, max: 2 },
          { param: 'maxTemperature', kind: 'range', min: 400, max: 500 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(3) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(3) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '绕 1.5 kW 镍铬丝（φ0.6、电阻 16 Ω，220 V 下 14 A）', performedBy: 'plant/winder' },
      { note_zh: '氧化铝绝缘片 + 钢壳 + 热电偶孔；台面 φ80', performedBy: 'plant/robot' },
      {
        note_zh: '测功率与 400 °C 恒温（30 min 波动 <10 K）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(12) },
    unbalanced_zh:
      '电阻丝 1 + 氧化铝 3 + 薄钢板 5 + 水 3 = 12 kg → 加热台 1 件（设计净重 8 kg）；余是陶瓷切边、钢屑与水',
  },

  {
    /**
     * 封口头：车铜电极 → 绕加热丝 → 装压头。
     *
     *   进   铜 3 + 45 钢 5 + 碳 0.2 + 电阻丝 0.5 + 水 2 = 10.7 kg
     *   出   封口头 1 件（3 kN、450 °C）
     */
    id: 'make/sealer-head',
    name: 'Vacuum Sealing Station Seal Head Manufacturing', name_zh: '真空封装台封口头制造',
    produces: [
      {
        item: 'plant/vacuum-sealer/seal-head',
        qty: q(1),
        gives: [
          { param: 'force', kind: 'range', min: 1, max: 3 },
          { param: 'maxTemperature', kind: 'range', min: 400, max: 450 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(3) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(5) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车 φ10 铜电极（尖端 2 mm、锥面 30°）与 45 钢压头', performedBy: 'lathe' },
      { note_zh: '电极内绕 φ0.5 镍铬丝 300 W，碳刷引线', performedBy: 'plant/winder' },
      {
        note_zh: '装弹簧压头（1–3 kN）、测尖端温度（400 °C，热电偶点焊）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(12) },
    unbalanced_zh:
      '铜 3 + 45 钢 5 + 碳 0.2 + 电阻丝 0.5 + 水 2 = 10.7 kg → 封口头 1 件（设计净重 6 kg）；余是车屑与试温损耗',
  },

  // ───────────────────────────────────────────────────────────────────────
  // MEMS 裸片
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * **MEMS 六轴裸片：1 片硅片 → 200 只。**
     *
     * 工序（七段，全部有设备）：
     *   ① 清洗 + 热氧化 1–1.5 µm（SiO2 做 DRIE 掩模与绝缘）
     *   ② 光刻：陀螺质量块、梳齿、加速度计、键合环
     *   ③ DRIE 10–100 µm（`plant/drie-etcher`，SF6/C4F6 伪 Bosch）
     *   ④ 背面 KOH 各向异性腐蚀 60–80 °C（减薄到 0.4 mm、开释放腔）
     *   ⑤ HF 气相/湿法释放牺牲层（SiO2）—— 这一步决定 Q
     *   ⑥ 划片（`plant/wire-saw`）
     *   ⑦ 抽检：镜下看梳齿是否粘连（没有 SEM，只能光学 200×）
     *
     * ⚠️ 这是设计路线，不是实测路线：本层没有膜厚仪、没有台阶仪、
     * 没有 SEM 断面。深度 10–100 µm 是按 "速率 × 时间" 给的，片内
     * 均匀性 ±10–15 % 也是设计值。能交付的是**拓扑**：有这只裸片，
     * 且它的每一道工序都有设备与料。
     *
     * 质量账（片计）：
     *   1 片 φ200 硅片（0.5 mm、18.8 g）→ 200 只裸片（3×3×0.4 mm，
     *   每只约 8 mg，合计 1.6 g）；余 17.2 g 是划片道、KOH 腐蚀掉的山谷、
     *   边缘排除区与清洗损耗。**不折 kg**：输出按件计，输入按片计。
     */
    id: 'make/robot-imu-mems-die',
    name: '6-Axis IMU MEMS Die Manufacturing', name_zh: '六轴 IMU 的 MEMS 裸片制造',
    produces: [
      {
        item: 'plant/robot/imu-mems-die',
        qty: q(200),
        gives: [
          { param: 'dieSize', kind: 'range', min: 3, max: 3 },
          { param: 'thickness', kind: 'range', min: 0.38, max: 0.42 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 5) }] },
      {
        anyOf: [
          {
            item: 'mat/koh',
            qty: q(1, 2),
            need: [{ param: 'concentration', kind: 'range', min: 45, max: 50 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sf6', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/c4f6', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/rf-13m56'],
    steps: [
      {
        note_zh: '清洗：去离子水 + 乙醇 + 120 °C 烘 30 min（本层没有 SC1/SC2 的过氧化氢-氨水线，用乙醇顶）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: '热氧化 1–1.5 µm：1000–1100 °C、湿氧 2 h（SiO2 做 DRIE 掩模与绝缘）',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 1000, max: 1100 }],
      },
      {
        note_zh: '光刻：陀螺质量块 20 µm 线宽、梳齿 3–5 µm、键合环 200 µm；接触曝光，胶 1 µm',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh: 'DRIE 10–100 µm：SF6 200–400 sccm / C4F6 20–50 sccm / O2 10–30 sccm，1–10 Pa，13.56 MHz 500 W；速率 1–3 µm/min',
        performedBy: 'plant/drie-etcher',
        under: [
          { param: 'pressure', min: 1, max: 8 },
          { param: 'temperature', min: 15, max: 60 },
        ],
      },
      {
        note_zh: '背面 KOH 各向异性腐蚀 60–80 °C、30 % KOH：把 0.5 mm 减到 0.4 mm 并开出释放腔；SiO2 掩模挡 6 h',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 60, max: 80 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: 'HF 释放牺牲层 20–40 °C：泡 3–8 min，临界点干燥没有，只能乙醇置换 + 自然干（粘连率 20–40 %，这是成品率的主项）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: '划片：手磨硬质合金轮，每片 200 只（3×3 mm，划片道 100 µm，吃掉 6 % 面积）',
        performedBy: 'plant/wire-saw',
      },
      {
        note_zh: '抽检：200× 光学镜下看梳齿粘连与键合环缺口；没有 SEM，断面看不起',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(48) },
    unbalanced_zh:
      '硅片 1 片（φ200×0.5 mm，18.8 g）+ 光刻胶 0.05 + HF 0.2 + KOH 0.5 + 氧 1 + SF6 0.5 + C4F6 0.2 + 水 20 → 裸片 200 件（3×3×0.4 mm，每只约 8 mg，合计 1.6 g）。余 17.2 g 是划片道、KOH 腐蚀掉的山谷、边缘排除区与清洗损耗；**输出按件计，不折 kg**',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...MEMS_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/drie-etcher',
    name: 'Deep Silicon Etcher Assembly', name_zh: '深硅刻蚀机装配',
    produces: [{
      item: 'plant/drie-etcher',
      qty: q(1),
      gives: [
      { param: 'depth', kind: 'range', min: 10, max: 100, dir: 'atLeast' },
      { param: 'aspectRatio', kind: 'range', min: 10, max: 20, dir: 'atLeast' },
      { param: 'sidewallAngle', kind: 'range', min: 85, max: 88, dir: 'atLeast' },
      { param: 'etchRate', kind: 'range', min: 1, max: 3, dir: 'atLeast' },
      { param: 'uniformity', kind: 'range', min: 0, max: 15, dir: 'atMost' },
      { param: 'selectivity', kind: 'range', min: 30, max: 100, dir: 'atLeast' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/anodic-bonder',
    name: 'Anodic Bonder Assembly', name_zh: '阳极键合机装配',
    produces: [{
      item: 'plant/anodic-bonder',
      qty: q(1),
      gives: [
      { param: 'bondTemperature', kind: 'range', min: 300, max: 500, dir: 'atLeast' },
      { param: 'bondVoltage', kind: 'range', min: 0, max: 2000, dir: 'atLeast' },
      { param: 'waferSize', kind: 'range', min: 50, max: 200, dir: 'atLeast' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/vacuum-sealer',
    name: 'Vacuum Sealing Station Assembly', name_zh: '真空封装台装配',
    produces: [{
      item: 'plant/vacuum-sealer',
      qty: q(1),
      gives: [
      { param: 'vacuum', kind: 'range', min: 0.0001, max: 1, dir: 'atMost' },
      { param: 'maxTemperature', kind: 'range', min: 250, max: 500, dir: 'atLeast' },
      { param: 'getterMass', kind: 'range', min: 0, max: 1, dir: 'atMost' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...MEMS_ROUTES, ...ASSEMBLY_ROUTES];
