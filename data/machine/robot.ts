/**
 * 机器人 —— 机器与料之间的那只手。
 *
 * 条目本身在 data/floor/seed.ts（第一节），这里只有它的零件与路线，
 * 和 data/machine/lathe.ts、data/machine/tools.ts 同一个结构：
 * **机器条目在种子清单里，零件清单与制造路线在 machine/ 里。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它在模型里的位置：不是机床
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 车床、磨床、铣床把料变成形状；机器人把料搬上机床、把零件装成机器、
 * 把耐火料捣实、把线压进端子。它做的每一件事都不需要精度，也都无法由
 * 任何机床代劳。
 *
 * 所以它既当不了别的路线的 `needs`（那是在场的前提，指条件与工装），
 * 也不是任何工序的"机床" —— 它自己是一条路线的执行者（装配、砌筑、配液）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 十一个零件：全都有路；四件只到降级档
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ⚠️ **本文件下面写的"零件都有路"，读到时要带上那一条。**
 *
 * 这台机器人是 **2026 年的具身机器人**：端侧 NPU（100–275 TOPS，7–12 nm）、
 * 每关节一颗 Cortex-M7（40 nm）、堆叠 CMOS 双目、MEMS 六轴 IMU（体微加工）、
 * 六轴力传感器、19–23 位磁/光编码器 ASIC、EtherCAT 从站 FPGA。
 *
 * 而这一层的半导体天花板是 **MSI**（5 µm、40 门/片、10⁴ 次加法/秒）。
 *
 * ```
 * 算力   10¹⁴ 次/秒  vs  10⁴ 次/秒      → 差 10¹⁰ 倍
 * 视觉   1.2×10⁸ 像素/秒 vs 32×32×1fps  → 差 10⁵ 倍
 * 自由度 20–40 DOF 双编码器 vs 6 DOF 开环 → 差 4–7 倍
 * ```
 *
 * **这个差不是"降级能补"到 2026 那一档的。** 降级换得掉精度与效率，
 * 换不掉感知与决策。本书里降级成功的五条（路布兰、铸铁、罗茨、铸铁钟罩、
 * 人眼对准）换掉的都是精度/效率/结构，功能都还在；把具身机器人降成
 * "凸轮程序器 + 自整角机 + 接触器"则是**换了一个东西**，不是降级。
 *
 * 所以：**下面的零件表描述的是"这台机器是由什么组成的"，
 * 不是"这一层能把它造成 2026 那一档"。** 报告是否把它从"种子自给"里摘出去，
 * 取决于 `tools/report/data.ts` 的 `NOT_BUILDABLE` 名单（另一个 agent 在改）；
 * 四条新路线本身已经写出来，见下。
 *
 * **2026-10-20 更新：** 五件"造不出"里，`plant/robot/force-sensor` 有条分立式
 * 路线（`make/robot-force-sensor`，40Cr 十字梁 + 康铜箔应变片，3–5% 绝对精度）；
 * IMU / NPU / EtherCAT / 电池现在也都有路线，但**只交降级档**：
 *
 *   IMU       `make/robot-imu`：体硅 DRIE + 阳极键合 + 真空封装，
 *             20–50 °/h、100–300 Hz、1 kHz 更新（商品 1–10 °/h）
 *   NPU       `make/robot-npu`：2 片 40 nm 门阵列，2–10 TOPS（商品 100–275 TOPS）
 *   EtherCAT  `make/robot-ethercat-slave`：2 片 32 位 CPU 跑软件 ESC + E-bus，
 *             1–2 ms 周期、1–2 轴（商品 62.5–125 µs、20–40 轴）
 *   电池      `make/robot-battery`：NiFe 48 V / 1.7–2.2 kWh / 78–82 kg，
 *             20–27 Wh/kg（锂电 250 Wh/kg）
 *
 * 四条的规格差写在各自条目注释里，**没有一个数字被写成"追上"**。整机仍不是
 * 2026 那一档；但按用户 2026-10-20 的原则（地球上存在的工程能力，模型里必须有
 * 产出路线），"有没有路线"与"是不是同一档"现在是两个分开的答案。
 *
 * 剩下那个"卡在外部输入"的说法也过期了：编码器（std/sensor-general）现在有路
 * （make/sensor-assembly ← 光敏管 ← 两条路），但那解决的是**零件**，
 * 不解决 23 位编码器 ASIC 那一档。
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 六个是零件、带路线：底座（铸铁）、臂体（铸铝）、伺服电机（冲片、绕线、
 * 装编码器）、末端夹爪（钢）、线缆（漆包线 + PTFE）、控制柜（钣金 + 装配）。
 * 第七个是**减速器**，它自己有四个零件（data/machine/reducer.ts），
 * 不是"造不出的黑盒"。
 *
 * ⚠️ 还有一件**不在整机零件表上**：**抱闸**（`plant/robot/brake`，
 * `make/robot-brake`，在文件末尾）。它就是上面那句"装编码器与抱闸"里的抱闸 ——
 * 这句话在注释里挂了很多轮，条目到这一轮才有。不进整机 `composedOf` 是因为
 * 伺服电机已经有产出路线，而"有产出路线的装配件不能再有 `composedOf`"
 * （describe.ts 的同一个判据），所以它按伺服电机的子件挂在 `uses` 里。
 *
 * 它走的是一条新链路：风化层 → 软锰矿精矿 → 高碳锰铁 → 65Mn 弹簧钢 → 抱闸
 * （`data/material/manganese.ts`）。这条链以前不存在，`unblock-arc-tilting.ts:142`
 * 把后果写死过："抱闸 要弹簧钢与摩擦片（**弹簧钢的锰链没建**）"。
 *
 * **原有零件的路线用的设备全在别的链上跑着，没有一样要新设备。**
 * 2026-10-20 补的四件不一样：它们要三台新设备（`plant/drie-etcher`、
 * `plant/anodic-bonder`、`plant/vacuum-sealer`），设备本身有零件与零件路线，
 * 在 `data/machine/mems.ts`。这是"缺的中间设备就新建条目并给它路线"。
 *
 * 按"会不会卡在外部输入"算，**仍然**卡住的两个：
 *
 *   伺服电机      路线齐，但编码器要从 std/sensor-general 来。
 *   控制柜        同上 —— 驱动器、电源、接口板都是那几十公斤里的一部分。
 *
 * 两个卡在同一件事上，而那件事是半导体层里的 ASIC/功率件。IMU / NPU /
 * EtherCAT / 电池四件现在有降级路线，不再是永久外购；所以机器人留在种子里
 * 的理由从"关键一两件造不出"变成"整机只到降级档，第一台整机仍是种子"。
 *
 * ⚠️ 减速器一度是第三条"卡住"：当时判它"柔轮要磨齿，本层没有磨齿机"。
 * 那句判错了，三处都错 —— 谐波的齿本来就不磨、内齿能铣、柔性薄壁轴承能用
 * 双滚轮绕开。现在它的四个零件都有路线，代价是回差从 1′ 掉到 5–10′。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 六处降级、一处外购
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ① **伺服电机做电励磁，不做永磁。** 真实的关节电机是永磁同步电机，
 *    永磁体是钕铁硼 —— 稀土本层没有，也没有烧结永磁的链。电励磁同样能
 *    调速、同样能闭环，扭矩密度差一档、转子要电刷或旋转变压器励磁。
 *    与"定子冲片用铣削代冲压"同一类：缺的不是化学，是一台没有的设备。
 * ② **减速器用双滚轮波发生器**，不用商品的柔性薄壁轴承 —— 那一枚才是这一族
 *    真正的门槛。见 data/machine/reducer.ts 的推演。
 * ③–⑥ **IMU / NPU / EtherCAT / 电池各降一档**：四条路线在
 *    `data/machine/mems.ts`、`data/machine/robot-electronics.ts`、
 *    `data/material/battery.ts`，设备与规格差写在各自条目注释里。
 *    四件不再是"永久外购"；但也不是 2026 那一档（差距见条目）。
 *
 * ⚠️ 臂体用铸铝是有依据的：`mat/aluminium` 有路线（电解铝，33 kg 风化层换
 * 1 kg），不是假设。**铝是本层曾经没有、后来补上的那一类** —— 电机文件头
 * 那句"没有铝"讲的是那一段历史，不是现在。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 数字
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 不写质量：整机重量由型号定，而型号是本层选定的占位（见 seed.ts），
 * 不是从负载算出来的。路线按件或片计，质量账写在 `unbalanced_zh` 里；
 * 只证明拓扑与工序，不证明量。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';
// 2026-10-21：mems.ts / robot-electronics.ts / battery.ts 改为由清单直接注册，
// 本文件不再 import 它们；见文件末尾两条注释。

export const ROBOT_PARTS: readonly Item[] = [
  /**
   * 底座。机器人与地面的界面：铸铁件，底面四个安装孔，上面一圈法兰装第一轴。
   *
   * 它是整台机器人的基准件，但它要的只是平面度与孔的相对位置 —— 铣完就能用，
   * 不需要磨。**这一点和机床床身正相反**：床身的精度在磨，底座的精度在铸造
   * 与一次装夹。
   */
  {
    id: 'plant/robot/base',
    name: '机器人底座',
    unit: '件',
    category: 'part',
    // 安装面平面度。底座是整机的基准件：四个安装孔与第一轴法兰都从这一面装起，
    // 面不平，整机就歪。0–0.05 mm 是过程能力推算（HT250 铸造 + 一次装夹铣），
    // 由 `measure/robot-parts` 用表面平板 + 千分表验；不是单次实测读数。
    props: [{ param: 'flatness', kind: 'range', min: 0, max: 0.05, unit: 'mm', dir: 'atMost' }],
  },

  /**
   * 臂体。大臂与小臂各一件，同一张图，只是长度不同。
   *
   * 铸铝，两端车出装减速器的轴承位。铝的刚性够、重量轻，但轴承位会蠕变 ——
   * 所以那两处镶 45 钢套，磨完压进去，再一起镗。
   *
   * 它是机器人里唯一一件"越大越吃亏"的零件：臂越长，同样的末端负载要求的
   * 关节扭矩越大，减速器越贵。所以工业机器人的臂长不是设计出来的，
   * 是减速器的价格定的。
   */
  {
    id: 'plant/robot/arm',
    name: '机器人臂体',
    unit: '件',
    category: 'part',
    // 两端轴承位圆度。臂体是铸铝 + 两端车轴承位 + 镶 45 钢套，磨完压进去再一起镗；
    // 圆度决定减速器轴承位贴合与回差。0–0.01 mm 是磨 + 镗的过程能力推算，
    // 由 `measure/robot-parts` 用塞规/内径比较仪 + 表面平板验。
    props: [{ param: 'roundness', kind: 'range', min: 0, max: 0.01, unit: 'mm', dir: 'atMost' }],
  },

  /**
   * 大腿与小腿。**与臂体同族**：铸铝 + 两端车轴承位 + 镶 45 钢套。
   *
   * 补它们是因为整机声明的 20–40 轴与原来的 6 关节零件表对不上（见
   * `data/floor/seed.ts` 机器人条目上的那一段）。一条腿 5 个关节
   * （髋 3 + 膝 1 + 踝 1），大腿与小腿各一件，左右各一对。
   *
   * 它们不是新能力：料（铸铝、45 钢）、设备（熔炼炉、车床、铣床、磨床）
   * 与臂体完全一样，只是尺寸与轴承位不同。所以是**零件级新增**，
   * 不是路线级新发明。
   */
  {
    id: 'plant/robot/thigh',
    name: '机器人大腿',
    unit: '件',
    category: 'part',
    // 髋/膝关节轴承位圆度；工艺同臂体（铸铝 + 车 + 磨 + 镶套镗）。0–0.01 mm 过程能力推算。
    props: [{ param: 'roundness', kind: 'range', min: 0, max: 0.01, unit: 'mm', dir: 'atMost' }],
  },
  {
    id: 'plant/robot/shin',
    name: '机器人小腿',
    unit: '件',
    category: 'part',
    // 膝/踝关节轴承位圆度；工艺同大腿。0–0.01 mm 过程能力推算。
    props: [{ param: 'roundness', kind: 'range', min: 0, max: 0.01, unit: 'mm', dir: 'atMost' }],
  },
  {
    id: 'plant/robot/torso',
    name: '机器人躯干',
    unit: '件',
    category: 'part',
    // 躯干与髋部/颈部的安装面平面度。0–0.05 mm 是铸造 + 铣削的过程能力推算。
    props: [{ param: 'flatness', kind: 'range', min: 0, max: 0.05, unit: 'mm', dir: 'atMost' }],
  },
  {
    id: 'plant/robot/foot',
    name: '机器人足部',
    unit: '件',
    category: 'part',
    // 踝部安装面平面度与着地面贴合。0–0.05 mm 过程能力推算。
    props: [{ param: 'flatness', kind: 'range', min: 0, max: 0.05, unit: 'mm', dir: 'atMost' }],
  },
  {
    id: 'plant/robot/forearm',
    name: '机器人前臂',
    unit: '件',
    category: 'part',
    // 腕/肘关节轴承位圆度；工艺同臂体。0–0.01 mm 过程能力推算。
    props: [{ param: 'roundness', kind: 'range', min: 0, max: 0.01, unit: 'mm', dir: 'atMost' }],
  },
  {
    id: 'plant/robot/neck',
    name: '机器人颈部',
    unit: '件',
    category: 'part',
    // 颈部回转轴承位圆度。0–0.01 mm 过程能力推算。
    props: [{ param: 'roundness', kind: 'range', min: 0, max: 0.01, unit: 'mm', dir: 'atMost' }],
  },
  {
    id: 'plant/robot/hand',
    name: '机器人手部',
    unit: '件',
    category: 'part',
    // 手指驱动销孔/腕部接口圆度。0–0.01 mm 过程能力推算。
    props: [{ param: 'roundness', kind: 'range', min: 0, max: 0.01, unit: 'mm', dir: 'atMost' }],
  },
  {
    id: 'plant/robot/finger',
    name: '机器人手指',
    unit: '件',
    category: 'part',
    // 指面平面度。指面是夹持接触面，0–0.02 mm 是铣 + 磨的过程能力推算。
    props: [{ param: 'flatness', kind: 'range', min: 0, max: 0.02, unit: 'mm', dir: 'atMost' }],
  },
  /**
   * 六轴惯性测量（3 加速度 + 3 陀螺）。**本层原先造不出；2026-10-20 补了
   * 体硅 MEMS 路线，但只交降级档。**
   *
   * 要什么：MEMS 体硅工艺 —— 10–100 µm 深硅刻蚀（AR 10–50）、SOI 片、
   * 玻璃-硅阳极键合 400 °C / 1 kV、<1–10 Pa 真空封装（含吸气剂）；
   * 陀螺还要对称谐振质量与 Q > 1000。
   *
   * 本层原来有什么：`plant/rie-etcher` 是 134 kHz 的 RIE，刻深 **0.8–1.2 µm**
   * （胶只有 1.0 µm，选择比 0.8–1.2:1），AR **1.6–2.2**；没有 ICP/DRIE，
   * 也没有 SOI 片（`mat/` 里只有普通单晶硅片）。
   * 键合：`plant/hot-press` 上限 **220 °C**，阳极键合要 **400 °C + 1 kV**
   * —— 差 180 K 与一台高压电源（`cis.ts:723–726` 同一笔账）。
   * 真空封装：`plant/evaporator` 的 0.001–0.01 Pa 是镀膜腔，不是封好的芯片腔；
   * 没有 wafer-level 键合、没有吸气剂。
   *
   * 差额：刻深 **8–100 倍**（0.8–1.2 µm 对 10–100 µm），AR **5–30 倍**
   * （1.6–2.2 对 10–50），键合温度 **180 K** + 偏压 **1 kV**，真空封装 **0 台**。
   * 这三样不是"再走一道"能补的：DRIE 要电感耦合高密度等离子体，
   * 键合要专用炉 + 高压，真空封装要 wafer-level 键合 + 吸气剂。
   *
   * ── 2026-10-20 补的路线（把上面三台设备造出来）──────────────────────
   *
   * 三台设备在 `data/machine/mems.ts`，每台都有零件与零件路线：
   *
   *   plant/drie-etcher      ICP、13.56 MHz（借既有 `plant/rf-13m56`）、
   *                          SF6/C4F6 伪 Bosch；10–100 µm、AR 10–20、侧壁 85–88°
   *   plant/anodic-bonder    300–450 °C、0–1.5 kV、1–100 Pa、20 kN
   *   plant/vacuum-sealer    1e-4–1 Pa、250–450 °C、玻璃熔封 + 1 mg 钛吸气剂
   *
   * 六轴 IMU 的整条路线（`make/robot-imu`）：
   *
   *   体硅片（不用 SOI：SOI 要键合 + 减薄两条额外的线，本层用体硅 + DRIE）
   *   → 热氧化 1–1.5 µm（SiO2 掩模）
   *   → 光刻（陀螺质量块 20 µm、梳齿 3–5 µm）
   *   → DRIE 10–100 µm（`plant/drie-etcher`）
   *   → 背面 KOH 60–80 °C 减薄/开腔
   *   → HF 释放牺牲层（粘连率 20–40 %，这是成品率主项）
   *   → 玻璃盖片 HF 开腔 + 阳极键合 380–420 °C / 800–1200 V
   *   → 划片、装架、铝丝键合
   *   → 真空封装 300–350 °C / 1e-3–0.1 Pa + 钛吸气剂
   *   → 标定（光学分度头 0.5′，没有转台）
   *
   * 两件中间件也各有路线（都在 `robot-electronics.ts` / `mems.ts`）：
   *   `plant/robot/imu-mems-die`  1 片硅片 → 200 只裸片（3×3×0.4 mm）
   *   `std/imu-asic-general`      3 µm 混合信号、六通道 16–18 位、60 片/批
   *
   * ── 交付窗口（全部是设计值，Earth 工程值）────────────────────────────
   *
   *   陀螺量程        ±2 000 °/s
   *   陀螺零偏稳定性  20–50 °/h（商品战术级 1–10 °/h ⇒ 差 2–50 倍；
   *                   导航级 0.1 °/h ⇒ 差 200–500 倍）
   *   陀螺 ARW        0.2–0.5 °/√h
   *   加速度计量程    ±16 g
   *   加速度计零偏    5–10 mg（商品 0.1–1 mg ⇒ 差 5–100 倍）
   *   带宽            100–300 Hz
   *   更新率          1 000 Hz
   *
   * ── 仍然缺的量具/材料（不藏）────────────────────────────────────────
   *
   *   ① **没有转台**：零偏 20–50 °/h 是设计值 + 光学分度头（0.5′）标定，
   *      不是速率转台的实测；ARW 0.2–0.5 °/√h 是噪声密度算的。
   *   ② **没有 Q 表 / 没有膜厚仪 / 没有 SEM 断面**：DRIE 深度、侧壁角、
   *      谐振 Q > 1000 三样都只能按"速率 × 时间"与光学 200× 抽检。
   *   ③ **真空度只到 1–10 Pa**：金属帽 + 玻璃熔封 + 钛吸气剂，不是
   *      wafer-level 真空键合（商品 <0.1 Pa）；差 10–100 倍。
   *   ④ **ASIC 16–18 位对商品 19–23 位**，差 2–3 位（8–32 倍分辨率）；
   *      3 µm 的 ΔVt 5–10 mV 撑不起 20 位以上的失调。
   *   ⑤ **没有 SOI**：体硅的寄生电容与温度漂移比 SOI 差一档，
   *      这是零偏稳定性 20–50 °/h 的主因之一。
   *
   * 条目仍在 `plant/robot` 的零件表上 —— 第一台机器人整机仍是种子；
   * 但它自己现在有路线，不再是"永久外购"。
   */
  {
    id: 'plant/robot/imu',
    name: '机器人六轴惯性测量',
    unit: '件',
    category: 'part',
    props: [
      { param: 'axes', kind: 'range', min: 6, max: 6, unit: '维', dir: 'atLeast' },
      { param: 'gyroRange', kind: 'range', min: 0, max: 2000, unit: '°/s', dir: 'within' },
      { param: 'accelRange', kind: 'range', min: 0, max: 16, unit: 'g', dir: 'within' },
      { param: 'gyroBiasStability', kind: 'range', min: 0, max: 50, unit: '°/h', dir: 'atMost' },
      { param: 'accelBiasStability', kind: 'range', min: 0, max: 10, unit: 'mg', dir: 'atMost' },
      { param: 'bandwidth', kind: 'range', min: 100, max: 500, unit: 'Hz', dir: 'atLeast' },
      { param: 'updateRate', kind: 'range', min: 1000, max: 2000, unit: 'Hz', dir: 'atLeast' },
    ],
  },

  /**
   * 六轴力/力矩传感器。**分立式应变片版，不是 MEMS 集成版。**
   *
   * 2026 机身的腕部六维力是集成半导体件（L4）；本层没有体硅工艺，
   * 但应变片这一路只要箔、胶、梁与桥路 —— 这些本层都有。
   * ⚠️ 这不是 L4 的集成件：体积、重量、一致性都低一档；L4 的
   * MEMS/集成版仍无路线，本条只交分立式降级版。
   *
   *   弹性体  40Cr 十字梁（铣 + 磨，不用电火花/线切割；17-4PH 不在料表，
   *           40Cr 可调质，不锈钢 304 太软、不能调质）
   *   应变片  康铜 55Cu/45Ni 箔 35 µm（光刻 + FeCl3 腐蚀，PVA 载体转移）
   *   粘接    酚醛 150–180 °C / 3–6 MPa（plant/hot-press）
   *   桥路    1 kHz 交流激励 + 相敏检波 + 4 位 DVM（避开运放 mV 级直流失调）
   *
   * 八个窗口见 props，全部是设计值：
   *   灵敏度 0.8–2 mV/V（GF 2、额定应变 400–1000 µε）
   *   分辨 0.2–0.5% FS（机械迟滞/蠕变是主项，不是电噪声）
   *   绝对精度 3–5% FS（砝码 2% + 串扰残差 2–4% + 温度 1% 的 RSS；
   *   没有标准力机）
   *   温漂 0.03–0.05%/K（40Cr 模量 −0.03%/K + 康铜 GF −0.01%/K，算的）
   *   串扰 2–4% FS（6×6 标定矩阵后）
   *
   * ⚠️ 缺口（都不藏）：
   *   ① 没有硬度计，40Cr 调质到 28–32 HRC 是炉温/时间目标，未测；
   *   ② 没有 0–40 °C 温箱，温漂是算的，不是实测；
   *   ③ 标定砝码 ±1–2% + 串扰残差 2–4%，所以绝对精度卡在 3–5%；分辨/重复性 0.2–0.5%
   *      是另一件事，不能拿它当精度；
   *   ④ 35 µm 箔比商品应变片（3–6 µm）厚 6–10 倍，蠕变/迟滞更大；
   *   ⑤ 六轴解耦靠标定矩阵，不是结构上天然解耦；矩阵外的工况没有验证。
   */
  {
    id: 'plant/robot/force-sensor',
    name: '六轴力/力矩传感器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'axes', kind: 'range', min: 6, max: 6, unit: '维' },
      { param: 'forceRange', kind: 'range', min: 0, max: 200, unit: 'N' },
      { param: 'momentRange', kind: 'range', min: 0, max: 20, unit: 'N·m' },
      { param: 'sensitivity', kind: 'range', min: 0.8, max: 2.0, unit: 'mV/V' },
      { param: 'resolution', kind: 'range', min: 0, max: 0.5, unit: '%FS', dir: 'atMost' },
      { param: 'accuracy', kind: 'range', min: 0, max: 5, unit: '%FS', dir: 'atMost' },
      { param: 'tempDrift', kind: 'range', min: 0, max: 0.05, unit: '%/K', dir: 'atMost' },
      { param: 'crossTalk', kind: 'range', min: 0, max: 4, unit: '%FS', dir: 'atMost' },
    ],
  },

  /**
   * 端侧 NPU。**本层原先造不出；2026-10-20 补了 40 nm 门阵列路线，
   * 只交 2–10 TOPS 的"能造档"。**
   *
   * 要什么：100–275 TOPS = **1–2.75×10^14 次/秒**（机器人条目，L6）；
   * 还要 10–100 MB 片上 SRAM、1–10 TB/s 带宽、MAC 阵列与 NPU 的版图/工具链。
   *
   * 本层原来最好到哪一档：`std/mcu-40nm-general` 有路线（`make/mcu-40nm-damascene`），
   * **2026-10-20 前的口径**是"16–24 nm 前道 + 100–300 nm 后道、8 层"的混合 MCU；
   * 现在 40 nm MCU 的后道已改 `make/beol-40nm-8layer`（40–100 nm / AR 2–3 /
   * dishing 3–8 / 8 层、LPCVD 钝化）。但 NPU 裸片仍走 `make/damascene-stack-8`
   * （100–300 nm），所以下面 NPU 的工艺数还是 100–300。它是 CPU 不是 NPU
   * （`chip-node.ts` 的逐格表）。本层 CPU 的算力口径是
   * 32 位 **5 MIPS = 5×10^6 次/秒**（`controller-24axis.ts:15–16`）；
   * 条目注释里的 L2 口径是 **10^4 次/秒**。两个口径对 10^14 的差额分别是
   * **2×10^7 倍**与 **10^10 倍**。
   * 存储：本层只有 256 字程序存储 + 8 位数据存储（`std/computer-general`），
   * 几百字节量级；离 10–100 MB 差 **10^4–10^5 倍**；没有 LPDDR PHY/SRAM 编译器。
   *
   * ── 2026-10-20 补的路线：不是"再补一条 40 nm"，是把同一条 40 nm 后道
   *    连成门阵列 ─────────────────────────────────────────────────────
   *
   * `std/npu-die-40nm`（`make/npu-die-40nm`，30 片/批）：
   *
   *   前道  `mat/device-wafer`（`make/device-wafer-saqp`，16–24 nm）
   *   后道  `mat/damascene-layer`（`make/damascene-stack-8`，8 层、100–300 nm；
   *         NPU 裸片仍走这条，40 nm MCU 已改走 `make/beol-40nm-8layer` 40–100）
   *   阵列  16 384 个 INT8 MAC（128×128），200 MHz
   *   峰值  16 384 × 200 MHz × 2 = **6.6 TOPS**；受 SRAM 带宽限制持续 **2–5 TOPS**
   *   存储  1–2 MB 片上 SRAM（6T 单元，手工版图）
   *
   * `plant/robot/npu`（`make/robot-npu`）是**模块**不是单芯片：
   *   2 片 NPU 裸片 + 1 片 32 位 CPU + 4 片 RAM + 8 层板 + 铝散热片
   *   → **2–10 TOPS、2–4 MB SRAM、10–20 W**
   *
   * ── 交付窗口与商品档的差（全部设计值）──────────────────────────────
   *
   *   算力      2–10 TOPS 对 100–275 TOPS ⇒ **差 10–137 倍**
   *   片上 SRAM 2–4 MB 对 10–100 MB ⇒ **差 3–50 倍**
   *   带宽      20–40 GB/s（并行总线 50 MHz）对 1–10 TB/s ⇒ **差 25–500 倍**
   *   工艺      16–24 nm 前道 + 100–300 nm 后道（NPU 裸片；40 nm MCU 现在 40–100）
   *
   * 为什么只到 2–10 TOPS：① 后道线宽 100–300 nm（NPU 裸片仍用 stack-8），MAC
   * 互连密度只有真 40 nm 的 1/5–1/10；② 没有 SRAM 编译器，1–2 MB 是手工版图；
   * ③ 没有 LPDDR PHY，片外带宽 20–40 GB/s；④ 30 mm² 以上成品率 <10 %。
   * 这四条都不是"再走一道"，是这一层半导体的天花板。
   *
   * ── 仍然缺的量具/工具 ───────────────────────────────────────────────
   *
   *   ① **没有逻辑分析仪、没有推理框架**：2–5 TOPS 是设计值，没有实测；
   *      片上只能测静态电流、复位与 DDR 环回。
   *   ② **没有 2.5D 封装/硅中介层**：两片裸片只能并排贴板，片间 20–40 GB/s。
   *   ③ **没有 SRAM 编译器**：1–2 MB 手工版图，再大放不下。
   *
   * 条目仍在 `plant/robot` 的零件表上（第一台整机是种子），但它自己有路线。
   */
  {
    id: 'plant/robot/npu',
    name: '机器人端侧 NPU',
    unit: '件',
    category: 'part',
    props: [
      { param: 'tops', kind: 'range', min: 100, max: 275, unit: 'TOPS', dir: 'atLeast' },
      { param: 'node', kind: 'range', min: 7, max: 12, unit: 'nm', dir: 'atMost' },
      { param: 'sram', kind: 'range', min: 10, max: 100, unit: 'MB', dir: 'atLeast' },
      { param: 'power', kind: 'range', min: 10, max: 30, unit: 'W', dir: 'atMost' },
    ],
  },

  /**
   * EtherCAT 从站控制器（ESC）。**本层原先造不出；2026-10-20 补了
   * "2 片 32 位 CPU 跑软件 ESC + E-bus PHY"的降级路线。**
   *
   * 要什么：100BASE-TX PHY（100 Mbps、125 MHz 模拟、MLT-3、自适应均衡）、
   * ESC 逻辑（约 10^5–10^6 门、8–16 KB 过程 RAM、2–4 端口）、25 MHz 时钟、
   * 隔离变压器/RJ45。
   *
   * 本层原来有什么：数字芯片天花板 5 µm / 40 门/片（MSI），最好的 40 nm 件是
   * `std/mcu-40nm-general`（2026-10-20 前口径：16–24 nm 前道 + 100–300 nm 后道；
   * 现在后道 40–100 nm、LPCVD 钝化），是 CPU 不是 FPGA；没有 100 Mbps PHY，也没有 25 MHz 晶振
   * （`std/quartz-resonator-general` 只到 1 MHz 与 5 MHz 两档）。
   *
   * 差额：PHY 的 125 MHz 模拟前端对 1 MHz 运放 = **125 倍**；
   * ESC 门数 10^5–10^6 对 40 门/片 = **2 500–25 000 片**；
   * 25 MHz 时钟对 5 MHz = **5 倍**；5 µm 平面管的 f_T 只有 ~100 MHz
   * （`film-monitor.ts:364`），对 125 MHz 收发器还差 10 倍以上。
   *
   * ── 2026-10-20 补的路线：绕开 125 MHz，走 E-bus ─────────────────────
   *
   * 物理层 `std/phy-100mbps-general`（`make/phy-100mbps`，20 片/批）：
   *
   *   4 位 LVDS × 25 MHz = **100 Mbps**（EtherCAT E-bus，不是 100BASE-TX）
   *   3 µm 双极（与 `make/opamp-chip` 同一条线），f_T 100–300 MHz
   *   5–10 m 屏蔽对绞线、直流耦合、无变压器
   *
   * 25 MHz 晶体 `make/quartz-resonator-25mhz`：AT 切磨到 **66.8 µm**
   * （N_AT = 1.67 MHz·mm / 25 MHz），20 只/批 —— 原缺的 5 倍补上。
   *
   * ESC 本体 `make/robot-ethercat-slave`：
   *
   *   2 片 `std/cpu-32bit-general`（8–12 万门/片，共 16–24 万门）跑软件状态机
   *   20 片 `std/logic-chip-general`（10–50 门/片）做 MAC 前置
   *   4 片 `std/ram-chip-general` 做过程 RAM（8–16 KB 的缺口在这里）
   *   2 片 E-bus PHY + 2 只 8 位端子排 + 2 只共模扼流圈
   *
   * ── 交付窗口（全部设计值）──────────────────────────────────────────
   *
   *   速率        100 Mbps（E-bus）
   *   端口        2
   *   周期        1–2 ms（商品 ESC 62.5–125 µs ⇒ **差 8–32 倍**）
   *   轴数        1–2（商品 20–40 轴；CPU 5 MIPS 口径撑不住更多）
   *   时钟        25 MHz
   *
   * ── 仍然缺的三样（不藏）────────────────────────────────────────────
   *
   *   ① **不是 100BASE-TX**：没有 125 MHz 模拟前端、没有自适应均衡、
   *      没有隔离变压器、没有 100 m 双绞线；对 125 MHz 仍差 5 倍，
   *      对 1 MHz 运放仍是 125 倍（旧注释那句仍成立）。
   *   ② **没有 RJ45**：E-bus 用 8 位端子排（`std/terminal-block-8p-general`），
   *      不能热插拔、没有 100 Ω 阻抗控制、IP20。
   *   ③ **没有 EtherCAT 主站 / 分布式时钟测试**：1–2 ms 周期是 GPIO 翻转
   *      + 示波器量的设计值；没有主站，一致性测试做不了。
   *      本层也没有 FPGA 路线（旧注释那句仍成立）。
   *
   * 条目仍在 `plant/robot` 的零件表上（第一台整机是种子），但它自己有路线。
   */
  {
    id: 'plant/robot/ethercat-slave',
    name: 'EtherCAT 从站控制器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'dataRate', kind: 'range', min: 10, max: 1000, unit: 'Mbps', dir: 'atLeast' },
      { param: 'ports', kind: 'range', min: 2, max: 8, unit: '口', dir: 'atLeast' },
      { param: 'cycleTime', kind: 'range', min: 0.05, max: 2, unit: 'ms', dir: 'atMost' },
      { param: 'axes', kind: 'range', min: 1, max: 32, unit: '轴', dir: 'atLeast' },
      { param: 'clock', kind: 'range', min: 10, max: 50, unit: 'MHz', dir: 'within' },
    ],
  },

  /**
   * 动力电池。**本层造不出高能量密度锂电；2026-10-20 补的是 NiFe 路线，
   * 不是锂电。**
   *
   * 2026 机身是锂电（~250 Wh/kg）。本层料表里：
   *   锂 0 条（`mat/lithium` 不存在）、钴 0 条、石墨 0 条；
   *   六氟磷酸锂/碳酸酯电解液没有（只有 `mat/ethylene-carbonate` 一种溶剂，
   *   没有锂盐）；隔膜没有（`mat/separator` 不存在；PTFE/玻纤不是锂电隔膜）。
   * 所以锂电这条链不是"少一道工序"，是**从矿到电解液整条都不在**。
   *
   * 本层能凑出的可充电池：NiFe（Ni/Fe/KOH/玻纤）—— 1.2 V/单体、
   * **20–30 Wh/kg**；对锂电 250 Wh/kg 差 **8–12 倍**。
   * 2 kWh 的包：NiFe 约 **70–100 kg**，锂电约 **8 kg**。
   * 铅酸要铅（`mat/lead` 0 条），NiCd 要镉（0 条），NiMH 要稀土（0 条）。
   *
   * ── 2026-10-20 补的 NiFe 路线（不冒充锂电）──────────────────────────
   *
   * `mat/nickel-hydroxide`（`make/nickel-hydroxide`）：
   *   1 000 kg 镍矾 + 1 511 kg 48 % KOH
   *   → 599 kg Ni(OH)₂ + 1 126 kg K₂SO₄ + 786 kg 水（精确平衡）
   *   原料 `mat/nickel-sulfate` 与 `mat/koh` 本层都有路线。
   *
   * `plant/robot/battery-cell`（`make/robot-battery-cell`，40 只/批）：
   *   正极  Ni(OH)₂ + 碳 + PTFE 涂膏在镀镍钢网上（不是烧结式，面容量 0.08–0.12 Ah/cm²）
   *   负极  海绵铁（`mat/sponge-iron`，本层有路线）+ 碳 + PTFE
   *   电解液 30 % KOH（`mat/koh` 兑水）
   *   隔膜  玻璃布（`mat/glass-cloth`；30 % KOH 会侵蚀，寿命 3–5 年）
   *   壳体  0.5 mm 镀镍钢（深冲 + 镀镍）
   *   → 1.2 V、35–45 Ah、20–30 Wh/kg、2 000–3 000 循环
   *
   * `plant/robot/battery`（`make/robot-battery`）：
   *   40 只串联 = 48 V、35–45 Ah、**1.7–2.2 kWh**、
   *   整包 78–82 kg、**20–27 Wh/kg**；对锂电 2 kWh 包 8 kg 差 **10–11 倍**。
   *
   * ── 与锂电的差（不藏）──────────────────────────────────────────────
   *
   *   能量密度  20–27 Wh/kg 对 250 Wh/kg ⇒ **差 9–12 倍**
   *   2 kWh 包  78–82 kg 对 8 kg ⇒ **差 10–11 倍**
   *   循环寿命  2 000–3 000 对 500–1 000 ⇒ NiFe **反而好 2–6 倍**
   *   自放电    20–30 %/月 对 2–3 %/月 ⇒ 差 10 倍
   *   库仑效率  70–80 % 对 99 % ⇒ 差 1.3 倍
   *
   * ── 仍然缺的量具/功能 ───────────────────────────────────────────────
   *
   *   ① **没有电池测试台**：容量 35–45 Ah 是按活性物质 0.24 Ah/g 的理论值
   *      × 利用率 70–80 % 算的，不是实测；没有内阻仪，只能按 10 s 压降估。
   *   ② **没有单体巡检/BMS**：NiFe 耐过充过放，只装 1 只 40 A 接触器 +
   *      分流器 + 总压；长期使用会有一只先反极。这是真实的功能缺口。
   *   ③ **玻璃布隔膜寿命 3–5 年**（商品尼龙/聚丙烯 20 年），
   *      因为 30 % KOH 在 40 °C 下侵蚀玻璃 0.1–0.3 mm/年。
   *   ④ **没有锂/钴/石墨/LiPF₆**：整条锂电链仍不在，这不是路线能补的。
   *
   * 条目仍在 `plant/robot` 的零件表上（第一台整机是种子），但它自己有路线。
   * 整机质量预算没有建模，78–82 kg 的包会不会让机器人走不动，这个模型答不了。
   */
  {
    id: 'plant/robot/battery',
    name: '机器人动力电池',
    unit: '件',
    category: 'part',
    props: [
      { param: 'energy', kind: 'range', min: 0.5, max: 5, unit: 'kWh', dir: 'atLeast' },
      { param: 'energyDensity', kind: 'range', min: 10, max: 250, unit: 'Wh/kg', dir: 'atLeast' },
      { param: 'voltage', kind: 'range', min: 40, max: 60, unit: 'V', dir: 'within' },
      { param: 'capacity', kind: 'range', min: 20, max: 60, unit: 'Ah', dir: 'atLeast' },
      { param: 'cycleLife', kind: 'range', min: 500, max: 5000, unit: '循环', dir: 'atLeast' },
    ],
  },

  /**
   * 机器人的相机。
   *
   * 机器人**本来就有眼睛**：§102 的 2026 具身机器人是**双目 RGB-D**（L5–L6 的
   * 堆叠 CMOS，2 MP/目、全局快门、深度 0.2–3 m）。`plant/robot` 的 composedOf
   * 装两台 —— 深度靠视差，一只不够。
   *
   * **R9 复制路径：已闭到 0.35 µm 那一档。** `make/cis-2mp`（data/machine/cis.ts）用
   * 0.35 µm 准钉扎工艺产 30 件/批，交付 0.35 µm、2 MP —— 够机器人自己用，
   * 也够借给贴片机、返修台、键合机、外观检验（§120）。
   *
   * **仍然写不出的是 40 nm 的堆叠 BSI 那一档**：堆叠 BSI、全局快门与深度 0.2–3 m 的完整
   * 指标都超出本层；路线只交 0.35 µm 的下沿，不冒充 40 nm。所以条目保留，但 R9
   * 记“0.35 µm 已闭、40 nm 未闭”，不是整条都不可写。
   *
   * 所以它是 `part`（件），不是 `machine`：相机不执行工序，只被工序 `needs`。
   */
  {
    id: 'plant/robot/camera',
    name: '机器人的相机',
    unit: '件',
    category: 'part',
    // 2 MP、0.35 µm（本层）到 40 nm（2026 堆叠 BSI）两档、全局快门、深度 0.2–3 m。
    props: [
      { param: 'node', kind: 'range', min: 40, max: 350, unit: 'nm', dir: 'atMost' },
      { param: 'pixels', kind: 'range', min: 1, max: 10, unit: 'MP', dir: 'atLeast' },
    ],
  },

  /**
   * 伺服电机。关节的动力，一个关节一台。
   *
   * 与标准电机（std/motor-7.5kw-4p）同一套工艺 —— 冲片铣槽、叠压、绕线、
   * 浸漆 —— 差别在两处：**转子是电励磁的**（永磁体要稀土，本层没有），
   * 以及**编码器从 std/sensor-general 来**：关节能不能定位，全在这一只上。
   *
   * 顺带说一下为什么它不能直接用标准电机：标准电机是恒速的，关节要的是
   * 低速大扭矩 + 频繁正反转。减速比能换扭矩，换不了"每转都要知道自己在哪"。
   */
  {
    id: 'plant/robot/servo',
    name: '机器人伺服电机',
    unit: '件',
    category: 'part',
    // 绕组电阻与空载电流：伺服能用/不能用的现场判据（同标准电机一台一台检）。
    // 0.5–10 Ω、0.2–2 A 是这一档关节电机的过程能力带；读数由 `measure/robot-parts`
    // 用 LCR 表 + 分流器/数字表交，不是单次实测。
    props: [
      { param: 'windingResistance', kind: 'range', min: 0.5, max: 10, unit: 'Ω' },
      { param: 'noLoadCurrent', kind: 'range', min: 0.2, max: 2, unit: 'A' },
    ],
  },

  /**
   * 末端夹爪。机器人唯一与被加工件直接接触的零件。
   *
   * 两指平行夹爪，45 钢指爪淬硬后磨导轨面，蜗轮蜗杆驱动 —— 蜗轮蜗杆能自锁，
   * 断电时工件不会掉。指爪是可换的：夹铸件与夹薄板要两副。
   */
  {
    id: 'plant/robot/gripper',
    name: '机器人末端夹爪',
    unit: '件',
    category: 'part',
    // 指爪导轨面平面度。0–0.02 mm 是淬硬后磨导轨面的过程能力推算；
    // `measure/robot-parts` 用表面平板 + 千分表验。
    props: [{ param: 'jawFlatness', kind: 'range', min: 0, max: 0.02, unit: 'mm', dir: 'atMost' }],
  },

  /**
   * 线缆与拖链。六只伺服电机的动力线与编码器线，从控制柜一路走到腕部。
   *
   * 走线要过拖链：臂在动，线在弯，弯几百万次。这是机器人身上唯一一件
   * **寿命比整机短**的零件，也是唯一一件"造得出来但会先坏"的零件。
   *
   * `Component.wear` 这个字段在，但它按运行小时计，而模型没有时长，所以这条寿命现在挂不上 ——
   * 与刀片、磨料同一个已知缺口。
   */
  {
    id: 'plant/robot/harness',
    name: '机器人线缆与拖链',
    unit: '件',
    category: 'part',
    // 成缆后的通路电阻。0–0.1 Ω 是压接 + 绞合的过程能力上限；
    // `measure/robot-parts` 用数字表四线法逐路验（绝缘电阻另列缺口，见台账）。
    props: [{ param: 'continuityResistance', kind: 'range', min: 0, max: 0.1, unit: 'Ω', dir: 'atMost' }],
  },

  /**
   * 控制柜。驱动器、电源、安全回路、接口板 —— 除了电机与减速器，
   * 机器人身上所有的"电"都在这个柜子里。
   *
   * 柜体是钣金活（剪、折、焊），配线是手工。它的成本不在柜体，
   * 在柜子里的那几十公斤电子元件。
   */
  {
    id: 'plant/robot/controller',
    name: '机器人控制柜',
    unit: '件',
    category: 'part',
    // 控制柜能带几根轴。**这是整机规格第一次有交付者**：七条控制柜路线里，
    // 继电器版（凸轮程序器 + 自整角机 + 接触器）只做点位，交 6 轴；
    // 32 位那版也是 6 轴（多出来的是插补与视觉，不是轴数）。
    props: [
      // 上限放到 32：24 轴那台控制柜（make/robot-controller-32bit-24axis）要落在声明里。
      // 4–8 是“这一层默认交付”的档，不是“不可能更多”——声明要容得下交付。
      { param: 'dof', kind: 'range', min: 4, max: 32, unit: '轴' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 2026-10-21：MEMS 三台设备与裸片、IMU ASIC / NPU 裸片 / E-bus PHY /
  // 25 MHz 晶体 / 端子排、NiFe 电池的条目已**改由清单直接注册**
  // （`data/machine/mems.ts`、`data/machine/robot-electronics.ts`、
  // `data/material/battery.ts` 各自进 `data.manifest.ts`），
  // 本文件不再 spread 它们 —— 否则同一批 id 会装两遍（duplicate_id）。
  // ───────────────────────────────────────────────────────────────────────
];

export const ROBOT_ROUTES: readonly Route[] = [
  {
    /** 底座。HT250 浇铸 → 铣底面 → 钻四个安装孔 → 车第一轴法兰止口。 */
    id: 'make/robot-base',
    name: '机器人底座制造',
    produces: [{
      item: 'plant/robot/base',
      qty: q(1),
      // 制造过程能力窗口（验收上限 0.05 mm，见条目 props）；现场用表面平板 + 千分表验，
      // 收窄读数由 `measure/robot-parts` 交，二者不混成同一个来源。
      gives: [{ param: 'flatness', kind: 'range', min: 0, max: 0.05 }],
    }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] }],
    needs: ['lathe'],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 臂体。铸铝 → 车两端轴承位 → 镶 45 钢套 → 一起镗 → 钻减重孔。 */
    id: 'make/robot-arm',
    name: '机器人臂体制造',
    produces: [{
      item: 'plant/robot/arm',
      qty: q(1),
      // 制造过程能力窗口（圆度验收上限 0.01 mm）；读数由 `measure/robot-parts` 收窄。
      gives: [{ param: 'roundness', kind: 'range', min: 0, max: 0.01 }],
    }],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 大腿。与臂体同一套手艺：铸铝 → 车两端轴承位 → 镶 45 钢套 → 一起镗。 */
    id: 'make/robot-thigh',
    name: '机器人大腿制造',
    produces: [{
      item: 'plant/robot/thigh',
      qty: q(1),
      gives: [{ param: 'roundness', kind: 'range', min: 0, max: 0.01 }],
    }],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 小腿。同上，轴承位小一档。 */
    id: 'make/robot-shin',
    name: '机器人小腿制造',
    produces: [{
      item: 'plant/robot/shin',
      qty: q(1),
      gives: [{ param: 'roundness', kind: 'range', min: 0, max: 0.01 }],
    }],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/milling-machine',
  },
  {
    /**
     * 伺服电机。冲片铣槽叠压 → 绕线 → 装编码器与抱闸 → 动平衡。
     *
     * 与标准电机同一条工艺链，所以这条路线**没有引入任何新设备**：
     * 绕线机、磨床、铣床都是现成的。差别只在那一只编码器上。
     */
    id: 'make/robot-servo',
    name: '机器人伺服电机制造',
    produces: [{
      item: 'plant/robot/servo',
      qty: q(1),
      // 绕组电阻/空载电流的制造过程能力带（验收用）；读数由 measure/robot-parts 收窄。
      gives: [
        { param: 'windingResistance', kind: 'range', min: 0.5, max: 10 },
        { param: 'noLoadCurrent', kind: 'range', min: 0.2, max: 2 },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-steel-3si', qty: q(1) }] },
      /**
       * 漆包线。**这一格会判 kept**：关节电机要 F 级绝缘（155 °C，连续 155
       * 不击穿），本层只有 B 级（130 °C，见 `make/enamel-wire` 的注释）。
       *
       * 后果不是"不能用"，是**降额**：绕组温升要压在 75 K 以内（B 级 130 −
       * 环境 40 − 裕度 15），而 F 级能压 105 K。同样的铁芯，连续扭矩只能出
       * 七成 —— 与减速器回差 5–10′ 同一档：能用，差一档。
       */
      {
        anyOf: [
          {
            item: 'mat/enamel-wire',
            qty: q(1),
            need: [{ param: 'thermalClass', kind: 'range', min: 155, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      // 四类电子料里只要这一样。功率级在控制柜里，不在电机上 —— 拆开之后
      // 这句话才写得出来：关节能不能定位，取决于"测角"这一路。
      // 外购的编码器，或本地做的自整角机 —— 后者是装在电机轴上的机械版编码器：
      // 精度 0.5°，经 100:1 减速后是 0.005°，比减速器本身的回差小一个数量级。
      { anyOf: [{ item: 'std/sensor-general', qty: q(1) }, { item: 'std/selsyn-general', qty: q(1) }] },
      /**
       * 抱闸。断电靠碟形弹簧抱死，通电由电磁铁释放 —— 每个关节一只。
       *
       * 关节额定 13 N·m，保持系数 1.5 ⇒ 要 **≥20 N·m**；`make/robot-brake` 交 30，
       * 余 1.5 倍。这一格是本条路线唯一一处带 `need` 的子句，也是机器人零件链上
       * 除了控制器那颗 CPU 之外的第四处规格判据。
       */
      {
        anyOf: [
          {
            item: 'plant/robot/brake',
            qty: q(1),
            need: [{ param: 'holdingTorque', kind: 'range', min: 20, dir: 'atLeast' }],
            // 保持力矩不够只是关节会滑，抱闸还在、还能动 ⇒ functional-kept。
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: ['plant/grinder'],
    performedBy: 'plant/winder',
  },
  {
    /** 夹爪。指爪淬硬后磨导轨面；蜗杆车制，蜗轮滚齿 —— 自锁，断电不掉件。 */
    id: 'make/robot-gripper',
    name: '机器人末端夹爪制造',
    produces: [{
      item: 'plant/robot/gripper',
      qty: q(1),
      gives: [{ param: 'jawFlatness', kind: 'range', min: 0, max: 0.02 }],
    }],
    uses: [
      { anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['plant/gear-hobbing', 'plant/grinder'],
    performedBy: 'plant/milling-machine',
  },
  {
    /**
     * 线缆与拖链。漆包线绞合成缆 → 压接端子 → 套 PTFE 护套 → 穿拖链 → 绑扎。
     *
     * **没有机床干这件事**：成缆、压接、穿管、绑扎全是手工，所以执行者是机器人。
     * 这是"机器人给自己造零件"的第一个例子 —— 与车床用车床造自己同理，
     * 不是循环论证：两种情况下，开路的那一件已经在场。
     *
     * ── 拖链为什么是钢的，不是尼龙的 ────────────────────────────────────
     *
     * 商品拖链是 PA66 注塑的：轻、无声、绝缘。尼龙 66 = 己二酸 + 己二胺，
     * 己二酸要环己烷（苯加氢）氧化、己二胺要丙烯腈 + HCN 再加氢 —— 本层
     * 的芳烃链到苯为止，**没有环己烷那一步**，所以尼龙没有路线。
     *
     * 退到**钢带链节 + PTFE 衬套**：0.5 mm 冷轧带冲成 U 形链节，销轴穿孔，
     * 每节一对 PTFE 衬套。这是高温与磨蚀场合本来就在用的做法。代价三条：
     * 重（比尼龙重 4–6 倍，腕部惯量跟着涨）、响（钢对钢要衬套顶着）、
     * 导电（必须把链节与动力线隔开，多一层护套）。
     *
     * ── 这一格里唯一一处规格判据 ──────────────────────────────────────
     *
     * 衬套要**摩擦系数 ≤0.12**（PTFE 对钢干摩擦 0.04–0.10，`make/ptfe` 交这一档）。
     * 判据盯的不是"能不能做"，是"做出来拖链会不会自己磨自己"：摩擦系数升到
     * 0.2 以上，钢链节每弯一次就要刮掉一层衬套，几百万次的弯曲寿命直接归零。
     */
    id: 'make/robot-harness',
    name: '机器人线缆与拖链制造',
    produces: [{
      item: 'plant/robot/harness',
      qty: q(1),
      gives: [{ param: 'continuityResistance', kind: 'range', min: 0, max: 0.1 }],
    }],
    uses: [
      { anyOf: [{ item: 'mat/enamel-wire', qty: q(1) }] },
      // 钢带链节（0.5 mm 冷轧带，冲 U 形 + 销轴孔）
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(8, 5) }] },
      // 护套与衬套：PTFE 一件两用。need 落在衬套上（见上）。
      {
        anyOf: [
          {
            item: 'mat/ptfe',
            qty: q(1, 2),
            need: [{ param: 'frictionCoefficient', kind: 'range', max: 0.12, dir: 'atMost' }],
            // 摩擦系数更高只是衬套磨得快、寿命短 —— 拖链还在，走线还在 ⇒ kept。
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 控制柜。薄板柜体剪折焊 → 装驱动器、电源、接口板 → 配线 → 通电老化。
     *
     * 柜体归钣金间，配线归机器人 —— 一条路线只能填一个执行者，填柜体那一台，
     * 因为柜体是这条路线里唯一需要设备的工序。
     *
     * 备选件：控制板子句的 `std/control-board-discrete` 是第二供应（anyOf 第二备选），
     * DFS 选 `std/control-board-general`，它不进证明树属预期（PLAN 监控项，不删不塞）。
     */
    id: 'make/robot-controller',
    name: '机器人控制柜制造',
    produces: [{ item: 'plant/robot/controller', qty: q(1), gives: [{ param: 'dof', kind: 'range', min: 6, max: 6 }] }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      // 驱动器 = 功率级 + 触发；电源 = 功率级 + 电容；接口板 = 控制板。
      { anyOf: [{ item: 'std/power-device-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }, { item: 'std/control-board-discrete', qty: q(4) }] },
      { anyOf: [{ item: 'std/passive-component-general', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
  {
    /**
     * 控制柜（机电版）。**不要半导体的第二条来路 —— 只能点位控制。**
     *
     * 一件半导体都不用，三件东西排班：
     *
     *   凸轮程序器  决定顺序：转到 30° 开夹爪、90° 升臂、150° 转腕……
     *   自整角机    决定到位：装在电机轴上，接收端跟着转，角度直接传回去
     *   接触器      决定动作：切电机的正反转与调速档位（互锁）
     *
     * **能做点位，不能做连续轨迹。** 插补要算，算要半导体 —— 所以沿焊缝走、
     * 沿曲面磨这类活做不了；上料、砌砖、捣固、压端子这类"走到位置、停住、
     * 干一下"的活，它够。
     *
     * 另三条代价：慢（每步几秒，凸轮转到位才动作）、不能改程序（要换凸轮）、
     * 占地方（一只柜子变一排柜子）。
     */
    id: 'make/robot-controller-relay',
    name: '机器人控制柜制造',
    produces: [
      {
        item: 'plant/robot/controller',
        qty: q(1),
        // 点位控制、六轴。插补要算、算要半导体，所以这一版只能走到位置停住。
        gives: [{ param: 'dof', kind: 'range', min: 6, max: 6 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'std/cam-programmer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/selsyn-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
  // 2026 机器人的结构件：躯干、颈、脚、前臂、手、指。与臂体同族 ——
  // 铸铝 + 车轴承位 + 镶 45 钢套，设备还是熔炼炉、车床、铣床、磨床。
  {
    id: 'make/robot-torso',
    name: '机器人躯干制造',
    produces: [{
      item: 'plant/robot/torso',
      qty: q(1),
      gives: [{ param: 'flatness', kind: 'range', min: 0, max: 0.05 }],
    }],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/milling-machine',
  },
  {
    id: 'make/robot-neck',
    name: '机器人颈部制造',
    produces: [{
      item: 'plant/robot/neck',
      qty: q(1),
      gives: [{ param: 'roundness', kind: 'range', min: 0, max: 0.01 }],
    }],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/milling-machine',
  },
  {
    id: 'make/robot-foot',
    name: '机器人足部制造',
    produces: [{
      item: 'plant/robot/foot',
      qty: q(1),
      gives: [{ param: 'flatness', kind: 'range', min: 0, max: 0.05 }],
    }],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/milling-machine',
  },
  {
    id: 'make/robot-forearm',
    name: '机器人前臂制造',
    produces: [{
      item: 'plant/robot/forearm',
      qty: q(1),
      gives: [{ param: 'roundness', kind: 'range', min: 0, max: 0.01 }],
    }],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/milling-machine',
  },
  {
    id: 'make/robot-hand',
    name: '机器人手部制造',
    produces: [{
      item: 'plant/robot/hand',
      qty: q(1),
      gives: [{ param: 'roundness', kind: 'range', min: 0, max: 0.01 }],
    }],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/milling-machine',
  },
  {
    id: 'make/robot-finger',
    name: '机器人手指制造',
    produces: [{
      item: 'plant/robot/finger',
      qty: q(1),
      gives: [{ param: 'flatness', kind: 'range', min: 0, max: 0.02 }],
    }],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/milling-machine',
  },
  {
    /**
     * **六轴力传感器：40Cr 十字梁 + 康铜箔应变片 + 交流桥 + 6×6 标定。**
     *
     * 为什么是“分立式”不是 MEMS：MEMS 六轴要体硅工艺（DRIE/键合/真空封装），
     * 本层没有（见 `plant/robot/imu`）；应变片只要箔、胶、梁与桥路 —— 本层都有。
     * 代价：体积、重量、一致性、温漂各差一档（见条目注释的五条缺口）。
     *
     * 工序（执行者全是已有设备，没有一台新机器）：
     *   ① 熔康铜 55Cu/45Ni：melting-furnace 1200–1300
     *   ② 叠轧到 35 µm：rolling-mill（与 make/copper-foil-thin 同一条）
     *   ③ 退火 600–700：resistance-furnace
     *   ④ 光刻 / FeCl3 腐蚀：mask-aligner + wet-bench（PVA 载体，20–40）
     *   ⑤ 40Cr 十字梁：milling-machine → 淬火 830–860 → 回火 500–600 → grinder
     *   ⑥ 酚醛粘接 150–180 °C / 3–6 MPa：hot-press → 温水脱载体 → 焊引线
     *   ⑦ 组桥：1 kHz 交流激励 + 相敏检波 + 4 位 DVM
     *   ⑧ 六轴标定：砝码杠杆，6 个加载点各 3 点，解 6×6 矩阵
     *
     * 质量账（kg 项）：
     *   40Cr 1 + 不锈钢 0.2 + 镍 0.02 + 铜 0.05 + 酚醛 0.05 + PVA 0.005
     *   + 光刻胶 0.005 + FeCl3 0.05 + NaOH 0.01 + 丙酮 0.01 + 焊料 0.01
     *   + 薄钢板 0.2 + 电阻丝 0.01 + 水 1 = **2.63 kg**
     *   → 传感器 1 件（设计净重约 1.1 kg：弹性体 0.55 + 壳体 0.2 +
     *   电路 0.15 + 灌封/引线 0.2）；余约 1.5 kg 是车铣屑 0.35、
     *   箔边/胶的挥发分 0.1、清洗与刻蚀废液 1.0、其他 0.05。
     *
     * 标定基准：铸铁砝码按 φ140×105、7.2 g/cm³ 算 10 kg（`unblock-pull-head`
     * 的先例），±0.2 kg = 2%；火星 g 3.71。杠杆/滑轮把力放大到 200 N、
     * 力矩放大到 20 N·m。砝码是工装，不进 uses。
     */
    id: 'make/robot-force-sensor',
    name: '六轴力/力矩传感器制造',
    produces: [
      {
        item: 'plant/robot/force-sensor',
        qty: q(1),
        gives: [
          { param: 'axes', kind: 'range', min: 6, max: 6 },
          { param: 'forceRange', kind: 'range', min: 0, max: 200 },
          { param: 'momentRange', kind: 'range', min: 0, max: 20 },
          { param: 'sensitivity', kind: 'range', min: 0.8, max: 2.0 },
          { param: 'resolution', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'accuracy', kind: 'range', min: 3, max: 5 },
          { param: 'tempDrift', kind: 'range', min: 0.03, max: 0.05 },
          { param: 'crossTalk', kind: 'range', min: 2, max: 4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/polyvinyl-alcohol', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/ferric-chloride', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/acetone', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/solder-wire', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(6) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
    ],
    needs: ['plant/comparator', 'plant/gauge-block', 'plant/metrology-room', 'std/photomask-general', 'std/dvm-general'],
    steps: [
      {
        note_zh: '熔康铜 55Cu/45Ni：镍 45 + 铜 55，1200–1300 铸锭',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1200, max: 1300 }],
      },
      {
        note_zh: '叠轧到 35 µm（与 make/copper-foil-thin 同一条；单张会折，四张一组）',
        performedBy: 'plant/rolling-mill',
      },
      {
        note_zh: '退火 600–700，消除轧制应力（箔不平，贴片会有初始弯矩）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 600, max: 700 }],
      },
      {
        note_zh: '光刻：PVA 把箔临时粘在玻璃载片，涂胶、曝光十字梁四组片图形',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh: '显影 + FeCl3 腐蚀 + 去胶（线宽 0.2–0.5 mm，侧蚀按 1:1 留 0.1 mm 余量）',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 40 }],
      },
      {
        note_zh: '40Cr 铣十字梁（4 根梁 + 中间扭矩梁；梁截面 3×3 mm，不用电火花）',
        performedBy: 'plant/milling-machine',
      },
      {
        note_zh: '淬火 830–860（40Cr 调质；没有硬度计，按炉温/时间控制）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 830, max: 860 }],
      },
      {
        note_zh: '回火 500–600（目标 28–32 HRC；硬度未测，只保证不脆断）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 500, max: 600 }],
      },
      {
        note_zh: '磨四根梁的贴片面（平面度 2 µm；贴片面糙了，胶层厚薄直接进零漂）',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '量梁截面与贴片位置：比较仪 + 量块，各量 3 点（灵敏度靠这三个尺寸）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '酚醛粘接：贴片 → 150–180 °C / 3–6 MPa 固化 2 h（PVA 载体一起压住）',
        performedBy: 'plant/hot-press',
        under: [
          { param: 'temperature', min: 150, max: 180 },
          { param: 'pressure', min: 3000, max: 6000 },
        ],
      },
      {
        note_zh: '温水脱 PVA 载体、焊引线（φ0.1 mm 铜线，焊料 SAC305）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '组桥：4 只运放做 1 kHz 振荡、差分放大与相敏检波；6 只薄膜电容滤波；桥臂用镍铬丝配平',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '六轴标定：砝码杠杆在 6 个加载点各加 3 点，读 8 路桥输出，解 6×6 矩阵（19–21 °C）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '迟滞/蠕变：额定载荷加卸载 100 次，零点回差 ≤0.5% FS；温度漂移只按材料系数算，不做 0–40 °C 实测（缺温箱）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(48) },
    unbalanced_zh:
      '40Cr 1 + 不锈钢 0.2 + 镍 0.02 + 铜 0.05 + 酚醛 0.05 + PVA 0.005 + 光刻胶 0.005 + FeCl3 0.05 + NaOH 0.01 + 丙酮 0.01 + 焊料 0.01 + 薄钢板 0.2 + 电阻丝 0.01 + 水 1 = 2.63 kg → 传感器 1 件（设计净重约 1.1 kg：弹性体 0.55 + 壳体 0.2 + 电路 0.15 + 灌封/引线 0.2）；余约 1.5 kg 是车铣屑 0.35、箔边/胶的挥发分 0.1、清洗与刻蚀废液 1.0、其他 0.05（差 0.03 是取整）。六轴解耦靠 6×6 标定矩阵；绝对精度 3–5% 受砝码 ±1–2% 与串扰残差 2–4% 限制；分辨/重复性 0.2–0.5% FS；温漂 0.03–0.05%/K 是按 40Cr 模量 −0.03%/K + 康铜 GF −0.01%/K 算的，没有温箱实测',
  },

  // 2026-10-21：MEMS 三台设备、四个电子件与 NiFe 电池的产出路线已改由清单
  // 直接注册（见 `data.manifest.ts` 里的 mems / robot-electronics / battery），
  // 本文件不再 spread。
];

/**
 * 伺服电机的子件：**抱闸**。不在整机 `composedOf` 上 —— 理由见文件头那一段
 * （伺服电机已经有产出路线，有路线的装配件不能再有零件表）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么它是机器人身上最 "不起眼但最要命" 的一件
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 六轴机器人在断电、急停、伺服报警的瞬间，每个关节都要在几十毫秒内抱死。
 * 不抱死的后果不是"精度差一点"，是**臂会掉下来**（J2 一个减速比 100 的关节，
 * 断电时负载侧的扭矩全部回到电机轴）。
 *
 * 所以它是**安全件**，不是性能件：坏了不是"做不了活"，是"不能上电"。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 数字（全部是设计值，由下面几行推出来）
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   保持力矩   T = μ · F · r · 2（两个摩擦面）
 *              = 0.35 × 1 430 × 0.030 × 2 = **30 N·m**
 *              μ 0.35 是酚醛基摩擦片对钢的干摩擦系数（0.3–0.4 的中值）
 *
 *   释放力     F = B²A / (2μ₀)，B 1.2 T、磁极面 25 cm²
 *              = 1.44 × 25e−4 / (2 × 4πe−7) = **1 433 N** > 1 430 N（刚好够）
 *              所以磁极面不能再小：少 1 cm² 就少 57 N
 *
 *   线圈       NI ≈ H·δ = (1.2 / 4πe−7) × 0.3e−3 = 287 A·匝（气隙 0.3 mm）
 *              24 V / 0.42 A = 10 W，φ0.3 mm 漆包线 1 000 匝、57 Ω ⇒ 420 A·匝
 *
 *   响应       释放 20 ms（剩磁与涡流决定下限）、断电抱死 15 ms（弹簧自由行程 0.3 mm）
 *
 * 1.2 kg 的分配（与路线里的用量一一对应）：
 *   65Mn 碟形弹簧组 0.22 · 硅钢磁轭与衔铁 0.55 · 酚醛摩擦片 0.15
 *   漆包线 0.12 · 铜引线 0.05 · 45 钢花键套 0.11
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 已知缺口
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  ① **摩擦系数没有量具**：0.35 是手册值，本层没有摩擦磨损试验机；抱闸的
 *     实际保持力矩只能按"吊重物打滑"整机验，验不到单片。
 *  ② **剩磁与释放时间没有量具**：没有示波器，20 ms 是设计值；本层能测的是
 *     "通电吸合、断电松开"这个二值事实（目视 + 手动盘车）。
 *  ③ **弹簧组的疲劳寿命没有量具**：65Mn 碟簧 10⁶ 次循环是标准值，本层没有
 *     疲劳试验台，寿命这一项挂不上（与线缆的弯曲寿命同一个缺口）。
 */
export const ROBOT_SUB_ITEMS: readonly Item[] = [
  {
    id: 'plant/robot/brake',
    name: '机器人制动器',
    unit: '件',
    mass: q(6, 5),
    category: 'part',
    props: [{ param: 'holdingTorque', kind: 'range', min: 20, max: 45, unit: 'N·m', dir: 'atLeast' }],
  },
];

export const ROBOT_SUB_ROUTES: readonly Route[] = [
  {
    /**
     * 抱闸。线圈绕制 → 磁轭与衔铁叠装 → 摩擦片热压粘接 → 碟簧组预压 →
     * 装花键套 → 调气隙 0.3 mm → 通电吸合/断电抱死试验。
     *
     * 两步要设备，其余是手：
     *   绕线        plant/winder（与伺服电机同一台）
     *   摩擦片粘接  plant/hot-press（150–180 °C、1–3 MPa，酚醛固化）
     *
     * 弹簧件本身要淬火回火到 42–50 HRC：本层没有硬度计，只能用锉刀对比
     * 标准块（`std/gauge-block-working` 的同一套"比"的思路），所以硬度
     * 这一格不写 `need`，写在这里当缺口。
     */
    id: 'make/robot-brake',
    name: '机器人制动器制造',
    produces: [
      {
        item: 'plant/robot/brake',
        qty: q(1),
        gives: [
          { param: 'holdingTorque', kind: 'range', min: 30, max: 30 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-65mn', qty: q(11, 50) }] },
      { anyOf: [{ item: 'mat/silicon-steel-3si', qty: q(11, 20) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(3, 20) }] },
      { anyOf: [{ item: 'mat/enamel-wire', qty: q(3, 25) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(11, 100) }] },
    ],
    needs: ['plant/winder', 'plant/hot-press'],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 第二台整机：21 种零件各 1 件装配成 `plant/robot-assembled`。
     * 第一台 `plant/robot` 是种子（外部输入）；本路线只证第二台，二者规格相同。
     * 本层没有 assembly-bench，装配/检查/标定/跑合都在 metrology-room（19–21 °C）。
     */
    id: 'make/plant-robot',
    name: '机器人整机制造',
    produces: [{
      item: 'plant/robot-assembled',
      qty: q(1),
      gives: [
        { param: 'dof', kind: 'range', min: 20, max: 40 },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'plant/robot/base', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/arm', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/thigh', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/shin', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/torso', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/neck', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/foot', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/forearm', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/hand', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/finger', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/imu', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/force-sensor', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/npu', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/ethercat-slave', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/battery', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/servo', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/reducer', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/gripper', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/camera', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/harness', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/controller', qty: q(1) }] },
    ],
    needs: ['std/dmm-7half-general'],
    steps: [
      {
        note_zh: '① 底盘/减速器装配',
        performedBy: 'plant/metrology-room',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '② 关节/伺服安装 + 电缆走线',
        performedBy: 'plant/metrology-room',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '③ 上电前绝缘/导通检查（std/dmm-7half-general 逐路测）',
        performedBy: 'plant/metrology-room',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '④ 零位标定/回零（编码器 + 控制器）',
        performedBy: 'plant/metrology-room',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '⑤ 空载跑合 30–60 min + 噪声/温升检查',
        performedBy: 'plant/metrology-room',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '21 种零件各 1 件 → 第二台整机；第一台 plant/robot 是种子（外部输入），robot-assembled 规格相同；零件总质量 ≈ 整机质量，无质量损失；包装/废料另计',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
const ROBOT_ASSEMBLED: Item = {
  id: 'plant/robot-assembled',
  name: '机器人整机',
  unit: '台',
  category: 'machine',
  // 与 plant/robot 同规格；无 composedOf，只由 make/plant-robot 装配。
  props: [
    { param: 'dof', kind: 'range', min: 20, max: 40, unit: '轴' },
  ],
};

export const DATA_ITEMS: readonly Item[] = [...ROBOT_PARTS, ...ROBOT_SUB_ITEMS, ROBOT_ASSEMBLED];
/**
 * 种子设备的装配路线 —— 第一台是运来的，第二台起由这条路线造。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件在条目的 `composedOf` 上。
 */
export const SEED_ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/robot',
    name: '机器人装配',
    produces: [{
      item: 'plant/robot',
      qty: q(1),
      gives: [
      { param: 'dof', kind: 'range', min: 20, max: 40 },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...ROBOT_ROUTES, ...ROBOT_SUB_ROUTES, ...SEED_ASSEMBLY_ROUTES];
