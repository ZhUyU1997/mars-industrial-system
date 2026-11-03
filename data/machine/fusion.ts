/**
 * 核聚变装置：ITER 级 D-T 托卡马克，一级系统 BOM。
 *
 * 参考装置与公开值（https://www.iter.org/facts-figures）：
 *   500 MW 聚变功率 / 50 MW 注入功率 / Q≥10 / 400–600 s 脉冲；等离子体 830 m³、
 *   1.5 亿 °C；整机 23,000 t；18 个环向场线圈每个约 310 t（17 m × 9 m）；
 *   中心螺线管 1,000 t；真空室含包层与偏滤器 8,000 t；Nb3Sn 股线 100,000 km、400 t 以上。
 *   iter.org 的 magnets 页写 TF 单个 330 t，真空室页写含包层与偏滤器 8,500 t、
 *   等离子体 840 m³，与 facts-figures 有出入；条目按 facts-figures 记，差异留在这里。
 *
 * 假设边界（都不是读数）：
 *   ITER 不发电、未运行。把聚变装置当能源用，下面三条是外推，按假设记：
 *     连续运行（公开设计是 400–600 s 脉冲）、氚自持（ITER 只在试验包层模块里验证增殖）、
 *     发电模块（热转电 35–40%，按常规蒸汽循环估）。
 *
 * 第一台外部输入；第二台起必须能从火星表面物质造出。
 * 其余一级系统以下不列；燃料循环与控制向下拆到组成件。
 * 14 项不等于 ITER 的全部系统：校正线圈、磁体馈线、
 * 真空室内线圈、真空抽气、诊断、遥控维护、冷却水、热室都不在这一级清单内。
 *
 * 数量：18 个 TF、6 个 PF、6 个中心螺线管模块、9 个真空室扇区、440 个包层模块、
 * 54 个偏滤器盒体取公开数量；其余系统按套计。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FUSION_ITEMS: readonly Item[] = [
  /**
   * 聚变装置整机：500 MW 聚变热功率，热量由包层与偏滤器的冷却水带出。
   *
   * fusionPower 400–500 MW：公开设计点 500 MW；400 下限按 80% 取，属假设。
   * q 5–10：公开 Q≥10；5 下限按长脉冲低增益工况取，属假设。
   * pulseLength 400–600 s 是 ITER 公开脉冲长度；dutyCycle 0.1–1 是假设，
   * 连续运行取 1。等离子体按脉冲运行；连续运行是假设。
   * consumption 按运行小时计，日历平均要乘 dutyCycle。
   * 整机装配路线见下；10 个一级系统没有产出路线，整机路线因此 blocked。
   */
  {
    id: 'plant/fusion-reactor',
    name: '聚变装置',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'fusionPower', kind: 'range', min: 400, max: 500, unit: 'MW' },
      { param: 'q', kind: 'range', min: 5, max: 10, unit: '倍' },
      { param: 'pulseLength', kind: 'range', min: 400, max: 600, unit: 's' },
      { param: 'dutyCycle', kind: 'range', min: 0.1, max: 1, unit: '1' },
    ],
    // 包层与偏滤器是消耗性部件：寿命按连续运行小时计（包层 5 年、偏滤器 2 年，
    // 均为假设，不是实测）；换料与检修时间未建模。
    composedOf: [
      { item: 'plant/fusion-reactor/tf-coil', qty: q(18) },
      { item: 'plant/fusion-reactor/pf-coil', qty: q(6) },
      { item: 'plant/fusion-reactor/central-solenoid', qty: q(6) },
      { item: 'plant/fusion-reactor/vacuum-vessel', qty: q(9) },
      { item: 'plant/fusion-reactor/blanket', qty: q(440), wear: { amount: q(1), per: q(43800) } },
      { item: 'plant/fusion-reactor/divertor', qty: q(54), wear: { amount: q(1), per: q(17520) } },
      { item: 'plant/fusion-reactor/cryostat', qty: q(1) },
      { item: 'plant/fusion-reactor/thermal-shield', qty: q(1) },
      { item: 'plant/fusion-reactor/cryoplant', qty: q(1) },
      { item: 'plant/fusion-reactor/heating', qty: q(1) },
      { item: 'plant/fusion-reactor/fuel-cycle', qty: q(1) },
      { item: 'plant/fusion-reactor/power-block', qty: q(1) },
      { item: 'plant/fusion-reactor/control', qty: q(1) },
      { item: 'plant/fusion-reactor/shield', qty: q(1) },
    ],
    // 按 500 MW 连续运行估：1.77e20 反应/s，氚约 3.18 g/h、氘约 2.12 g/h；
    // 折成 kg/h 为 1/315 与 1/470，与 fuel-cycle 的 burnRate 0.05–0.1 kg/day
    // 同量级，标假设。
    consumption: [
      { item: 'mat/deuterium', qty: q(1, 470), per: q(1) },
      { item: 'mat/tritium', qty: q(1, 315), per: q(1) },
    ],
  },

  /**
   * 首台装置 commissioning 诊断：整机 10 个 measure/* 能力窗口。
   *
   * 它是独立设备，不并入整机 composedOf；整机只保留 4 个普通 props。
   * 能力窗口是设计值，不是产品实测。
   */
  {
    id: 'plant/fusion-reactor/diagnostics',
    name: '聚变装置 commissioning 诊断',
    unit: '台',
    category: 'machine',
    // 单件诊断设备：机柜、传感器、采集按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/fusionPower', kind: 'range', min: 400, max: 500, unit: 'MW' },
      { param: 'measure/q', kind: 'range', min: 5, max: 10, unit: '倍' },
      { param: 'measure/pulseLength', kind: 'range', min: 400, max: 600, unit: 's' },
      { param: 'measure/dutyCycle', kind: 'range', min: 0.1, max: 1, unit: '1' },
      { param: 'measure/injectedPower', kind: 'range', min: 45, max: 50, unit: 'MW' },
      { param: 'measure/installedPower', kind: 'range', min: 90, max: 95, unit: 'MW' },
      { param: 'measure/electricPower', kind: 'range', min: 150, max: 200, unit: 'MW' },
      { param: 'measure/efficiency', kind: 'range', min: 35, max: 40, unit: '%' },
      { param: 'measure/burnRate', kind: 'range', min: 0.05, max: 0.1, unit: 'kg/day' },
      { param: 'measure/tritiumInventory', kind: 'range', min: 2, max: 3, unit: 'kg' },
    ],
  },

  /**
   * 环向场线圈：18 个 D 形超导线圈，产生约束等离子体的环向场。
   *
   * 公开：单个约 310 t、17 m × 9 m；最大场 11.8 T；储能 41 GJ；
   * Nb3Sn 股线总量 100,000 km、400 t 以上。
   * 假设：11.8–12.5 T 与 40–42 GJ 是验收窗口；质量两处公开值不一致，不写 mass。
   * 缺口：线圈绕制、导体、结构件以下不列。
   */
  {
    id: 'plant/fusion-reactor/tf-coil',
    name: '聚变装置环向场线圈',
    unit: '件',
    category: 'part',
    props: [
      { param: 'peakField', kind: 'range', min: 11.8, max: 12.5, unit: 'T', dir: 'atLeast' },
      { param: 'storedEnergy', kind: 'range', min: 40, max: 42, unit: 'GJ' },
    ],
  },

  /**
   * 极向场线圈：6 个环形超导线圈，成形并稳定等离子体。
   *
   * 公开：6 个；最大直径 24 m；最重 400 t；总储能 4 GJ；最大场 6 T。
   * 假设：运行电流 40–52 kA 是估；最小直径 8 m 也是估。
   * 缺口：各线圈单件质量与尺寸没有公开分项。
   */
  {
    id: 'plant/fusion-reactor/pf-coil',
    name: '聚变装置极向场线圈',
    unit: '件',
    category: 'part',
    props: [
      { param: 'peakField', kind: 'range', min: 5, max: 6, unit: 'T' },
      { param: 'current', kind: 'range', min: 40, max: 52, unit: 'kA' },
    ],
  },

  /**
   * 中心螺线管：6 个独立模块叠成，感应并维持等离子体电流。
   *
   * 公开：6 个模块；13 m 高（含结构 18 m）、4 m 宽、1,000 t；储能 6.4 GJ；
   * 最大场 13 T；支撑结构承受 60 MN；可在 15 MA 下维持 300–500 s。
   * 磁通摆幅 240 Wb 是公开设计值，iter.org 的 facts-figures 与 magnets 页未列。
   * 假设：220–260 Wb、12–13 T 是验收窗口。
   * 缺口：模块、导体、支撑结构以下不列。
   */
  {
    id: 'plant/fusion-reactor/central-solenoid',
    name: '聚变装置中心螺线管',
    unit: '件',
    category: 'part',
    props: [
      { param: 'flux', kind: 'range', min: 220, max: 260, unit: 'Wb' },
      { param: 'peakField', kind: 'range', min: 12, max: 13, unit: 'T' },
    ],
  },

  /**
   * 真空室：双层不锈钢容器，9 个扇区焊成，装包层与偏滤器并作放射性包容边界。
   *
   * 公开：内体积 1,400 m³；外径 19.4 m、高 11.4 m、5,200 t；含包层与偏滤器 8,500 t
   * （facts-figures 页写 8,000 t）；44 个窗口；双层壁间装约 9,000 块硼化不锈钢屏蔽块。
   * 漏率 ≤1×10⁻⁹ Pa·m³/s 是验收工程口径，iter.org 页面未列，按假设记。
   * 假设：扇区质量 500–600 t 由 5,200 t 除以 9 推得，属估。
   * 缺口：扇区、窗口、屏蔽块以下不列。
   */
  {
    id: 'plant/fusion-reactor/vacuum-vessel',
    name: '聚变装置真空室',
    unit: '件',
    category: 'part',
    props: [
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-9, unit: 'Pa·m³/s', dir: 'atMost' },
      { param: 'sectorMass', kind: 'range', min: 500, max: 600, unit: 't' },
    ],
  },

  /**
   * 包层：440 个模块覆盖真空室内壁，屏蔽中子并把热量交给冷却水。
   *
   * 公开：440 个模块；每块 1 m × 1.5 m、最重 4.6 t；覆盖 600 m²；
   * 冷却水 4 MPa / 70 °C，带走 736 MW；第一壁材料由铍改为钨。
   * 假设：第一壁热流 0.3–0.5 MW/m² 是估。
   * 核原料按前提无限供应，包层只做中子屏蔽与取热，氚增殖比不再作为本条的规格。
   * 缺口：模块内的第一壁与屏蔽块以下不列；寿命挂在整机装配处，是假设。
   */
  {
    id: 'plant/fusion-reactor/blanket',
    name: '聚变装置包层',
    unit: '件',
    category: 'part',
    props: [
      { param: 'heatFlux', kind: 'range', min: 0.3, max: 0.5, unit: 'MW/m²' },
    ],
  },

  /**
   * 偏滤器：54 个盒体，抽出聚变灰与热量，保护壁面。
   *
   * 公开：54 个盒体、每个 10 t；钨装甲；稳态 10 MW/m²、慢瞬态 20 MW/m²；
   * 垂直靶由水冷带走热量。
   * 假设：稳态窗口上限 12 与瞬态上限 25 是估。
   * 缺口：盒体、垂直靶、穹顶以下不列；遥控更换装置不在这 14 项内。
   */
  {
    id: 'plant/fusion-reactor/divertor',
    name: '聚变装置偏滤器',
    unit: '件',
    mass: q(10000),
    category: 'part',
    props: [
      { param: 'steadyHeatFlux', kind: 'range', min: 10, max: 12, unit: 'MW/m²', dir: 'atLeast' },
      { param: 'transientHeatFlux', kind: 'range', min: 20, max: 25, unit: 'MW/m²', dir: 'atLeast' },
    ],
  },

  /**
   * 低温恒温器：不锈钢高真空压力容器，把真空室与磁体包在冷环境里。
   *
   * 公开：16,000 m³；内径 28 m；高近 30 m；3,850 t；底座 1,250 t；
   * 真空 1×10⁻⁴ Pa；泵容 8,500 m³；23 个维护窗口与 200 多个贯穿件。
   * 假设：14,000–16,000 m³ 与 1×10⁻⁵–1×10⁻⁴ Pa 是验收窗口。
   * 缺口：贯穿件、波纹管、底座以下不列。
   */
  {
    id: 'plant/fusion-reactor/cryostat',
    name: '聚变装置低温恒温器',
    unit: '件',
    mass: q(3850000),
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 14000, max: 16000, unit: 'm³' },
      { param: 'vacuum', kind: 'range', min: 1e-5, max: 1e-4, unit: 'Pa', dir: 'atMost' },
    ],
  },

  /**
   * 冷屏：两层不锈钢面板，镀银或抛光，氦气冷却，隔断向 4.5 K 侧的热负荷。
   *
   * 公开：面板由氦气冷却，运行温度 80–100 K；覆盖约 5,000 m²；最高点 25 m；
   * 把辐射与传导热负荷降低两个数量级以上。
   * 假设：发射率 0.05–0.1 是估（公开只说低发射率，没给数）。
   * 缺口：面板、冷却管、支撑以下不列。
   */
  {
    id: 'plant/fusion-reactor/thermal-shield',
    name: '聚变装置冷屏',
    unit: '套',
    category: 'part',
    props: [
      { param: 'temperature', kind: 'range', min: 80, max: 100, unit: 'K' },
      { param: 'emissivity', kind: 'range', min: 0.05, max: 0.1, unit: '1', dir: 'atMost' },
    ],
  },

  /**
   * 低温厂：氦制冷机与氮制冷机，给磁体、冷泵、冷屏供冷。
   *
   * 公开：4.5 K 下 75 kW、80 K 下 1,300 kW；氦库存 25 t；
   * 三个温度级 4 K / 50 K / 80 K；三台氦制冷机加两台氮制冷机。
   * 假设：70–75 kW 与 20–30 t 是验收窗口；库存按质量计，不按体积。
   * 缺口：冷箱、储罐、分配阀箱、4.5 K 液氦浴以下不列。
   */
  {
    id: 'plant/fusion-reactor/cryoplant',
    name: '聚变装置低温厂',
    unit: '套',
    category: 'part',
    props: [
      { param: 'coolingPower', kind: 'range', min: 70, max: 75, unit: 'kW', dir: 'atLeast' },
      { param: 'heliumInventory', kind: 'range', min: 20, max: 30, unit: 't' },
    ],
  },

  /**
   * 辅助加热：中性束、电子回旋、离子回旋三套，把等离子体加热到聚变温度。
   *
   * 公开：中性束 2×16.5 MW、1 MeV 负离子源；ECRH 40 MW（后阶段 67 MW）、170 GHz；
   * ICRH 20 MW、40–55 MHz；注入等离子体的功率 50 MW。
   * 假设：注入窗口 45–50 MW、源侧安装窗口 90–95 MW（33 + 40 + 20 = 93 MW 起）。
   * 4,750 个 20 kW 射频模块并联（装机 95 MW）；模块是专用件，装在 heating 下。
   * 缺口：负离子源、加速器、回旋管、传输线、天线以下不列。
   */
  {
    id: 'plant/fusion-reactor/heating',
    name: '聚变装置辅助加热',
    unit: '套',
    category: 'part',
    props: [
      { param: 'injectedPower', kind: 'range', min: 45, max: 50, unit: 'MW', dir: 'atLeast' },
      { param: 'installedPower', kind: 'range', min: 90, max: 95, unit: 'MW' },
    ],
    composedOf: [{ item: 'plant/fusion-reactor/heating/rf-module', qty: q(4750) }],
  },

  /**
   * 射频模块：1 台 20 kW 射频源 + 汇流与冷却。
   *
   * 无 props：模块级规格由 4,750 个并联后的整机窗口承担，单模块不单独验收。
   * 20 kW 源本身是 plant/rf-generator-20kw，作为本模块的前置件写在其产出路线里。
   */
  {
    id: 'plant/fusion-reactor/heating/rf-module',
    name: '聚变装置射频模块',
    unit: '件',
    category: 'part',
  },

  /**
   * 燃料循环：气体注入、弹丸注入、氚厂，把氘氚送进等离子体并回收未燃燃料。
   *
   * 公开：气体注入平均 200、峰值 400 Pa·m³/s；弹丸 3,600 km/h、毫米级 D-T 冰丸；
   * 氚厂六个子系统（堆排气处理、同位素分离、储存与输送、大气除氚、水除氚、分析）；
   * 全库氚约 20 kg，等离子体内燃料不足 1 g。
   * 假设：在场氚 2–3 kg 是假设；氚燃耗 0.05–0.1 kg/day 是估
   * （500 MW 下 D-T 总燃料约 0.13 kg/day，其中氚约 0.065 kg/day）。
   * 缺口：六个子系统以下不列；氚自持靠包层，不在本系统内。
   */
  {
    id: 'plant/fusion-reactor/fuel-cycle',
    name: '聚变装置燃料循环',
    unit: '套',
    category: 'part',
    props: [
      { param: 'tritiumInventory', kind: 'range', min: 2, max: 3, unit: 'kg' },
      { param: 'burnRate', kind: 'range', min: 0.05, max: 0.1, unit: 'kg/day' },
    ],
    // 五个组成件：⁶Li 级联、电解槽、真空塔、GM 冷头、控制板。
    composedOf: [
      { item: 'plant/li-6-cascade', qty: q(1) },
      { item: 'plant/electrolyzer', qty: q(1) },
      { item: 'plant/vacuum-column', qty: q(1) },
      { item: 'plant/gm-cryocooler', qty: q(1) },
      { item: 'std/control-board-general', qty: q(1) },
    ],
  },

  /**
   * 发电模块：把聚变热转成电。ITER 上没有这一项。
   *
   * 假设：500 MW 聚变热 × 35–40% = 175–200 MW 电，扣厂用电后净 150–200 MW；
   * 效率按常规蒸汽循环估，没有实测。热输入 450–500 MW 对应当前聚变功率窗口。
   * 缺口：蒸汽循环、汽轮机、发电机、排热、厂用电分配以下不列。
   */
  {
    id: 'plant/fusion-reactor/power-block',
    name: '聚变装置发电模块',
    unit: '套',
    category: 'part',
    props: [
      { param: 'electricPower', kind: 'range', min: 150, max: 200, unit: 'MW' },
      { param: 'efficiency', kind: 'range', min: 35, max: 40, unit: '%' },
    ],
  },

  /**
   * 控制系统：中央控制、联锁与安全，接口各厂房仪控。
   *
   * 公开：CODAC 接口 220 套厂房仪控系统、30 多个厂房系统；
   * 机器保护联锁与人员/核安全系统独立于 CODAC。
   * 假设：控制周期 0.5–1 ms、可用率 0.9–0.95 都是估
   * （iter.org 只给接口规模，没给周期与可用率）。
   * 缺口：诊断、联锁、安全系统不在这 14 项内；连续运行的控制策略未定。
   */
  {
    id: 'plant/fusion-reactor/control',
    name: '聚变装置控制系统',
    unit: '套',
    category: 'part',
    props: [
      { param: 'cycleTime', kind: 'range', min: 0.5, max: 1, unit: 'ms', dir: 'atMost' },
      { param: 'availability', kind: 'range', min: 0.9, max: 0.95, unit: '1' },
    ],
    // 四个组成件：控制板 ×4、传感器 ×20、功率器件 ×1、接线端子 ×10。
    composedOf: [
      { item: 'std/control-board-general', qty: q(4) },
      { item: 'std/sensor-general', qty: q(20) },
      { item: 'std/power-device-general', qty: q(1) },
      { item: 'std/terminal-block-8p-general', qty: q(10) },
    ],
  },

  /**
   * 屏蔽：厂房级生物屏蔽与中子屏蔽，把剂量降到人员进入限值。
   *
   * 公开：ITER 的屏蔽分散在真空室内约 9,000 块硼化不锈钢屏蔽块、包层、
   * 真空室双层水与厂房屏蔽墙里；本项只取厂房级一套。
   * 假设：厚度 1.5–2.5 m、硼含量 1–2% 都是假设（iter.org 没给这两个数）。
   * 缺口：与真空室内屏蔽块、包层的界面未拆清；剂量率没有实测。
   */
  {
    id: 'plant/fusion-reactor/shield',
    name: '聚变装置屏蔽',
    unit: '套',
    category: 'part',
    props: [
      { param: 'thickness', kind: 'range', min: 1.5, max: 2.5, unit: 'm' },
      { param: 'boronContent', kind: 'range', min: 1, max: 2, unit: '%' },
    ],
  },
];

export const FUSION_ROUTES: readonly Route[] = [
  {
    /**
     * 燃料循环装配：⁶Li 级联 + 电解槽 + 真空塔 + GM 冷头 + 控制板 → 一套燃料循环。
     *
     * uses 为空：装配不消耗材料，组成件按 composedOf 计入。
     * tritiumInventory 与 burnRate 已转 calculated 记录，不是读数。
     */
    id: 'make/fusion-fuel-cycle',
    name: '燃料循环装配',
    produces: [
      {
        item: 'plant/fusion-reactor/fuel-cycle',
        qty: q(1),
        gives: [
          { param: 'tritiumInventory', kind: 'range', min: 2, max: 3, record: 'mat/fusion-fuel-record' },
          { param: 'burnRate', kind: 'range', min: 0.05, max: 0.1, record: 'mat/fusion-fuel-record' },
        ],
      },
    ],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 控制系统装配：控制板 ×4 + 传感器 ×20 + 功率器件 ×1 + 接线端子 ×10 → 一套控制。
     *
     * availability 已转 assumed 记录；cycleTime 已是记录（不是实测）。
     */
    id: 'make/fusion-control',
    name: '控制系统装配',
    produces: [
      {
        item: 'plant/fusion-reactor/control',
        qty: q(1),
        gives: [
          { param: 'cycleTime', kind: 'range', min: 0.5, max: 1, record: 'mat/fusion-control-cycle-record' },
          { param: 'availability', kind: 'range', min: 0.9, max: 0.95, record: 'mat/fusion-control-availability-record' },
        ],
      },
    ],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 真空室扇区：316L 不锈钢 578 t → 卷板 → 焊接 → 端口机加工 → 装配检漏
     * → 一个 40° 扇区。
     *
     * 一件 = 一个 40° 扇区，9 件成整室；578 t 由整室 5,200 t 除以 9 推得，属估。
     * 卷板、焊接、车削、检漏都借用现有设备；9 m 级幅面与吨位的产能未建模，
     * 大件成形、焊接与热处理设备本身是缺口。
     * 去应力不写成工序：现有电阻炉温度 100–1100 °C 够 550–650 °C，但炉膛
     * 装不下 9 m 扇区；条件未建模。
     * 大件总装车间缺失，装配环境温度未建模；现用 ambient/未约束，不等于有车间。
     * leakRate 已转 assumed 记录、sectorMass 已转 calculated 记录，不是读数。
     */
    id: 'make/fusion-vacuum-vessel-sector',
    name: '聚变装置真空室制造',
    produces: [
      {
        item: 'plant/fusion-reactor/vacuum-vessel',
        qty: q(1),
        gives: [
          { param: 'leakRate', kind: 'range', min: 1e-10, max: 1e-9, record: 'mat/fusion-vessel-leak-record' },
          { param: 'sectorMass', kind: 'range', min: 500, max: 600, record: 'mat/fusion-vessel-mass-record' },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(578000) }] }],
    needs: [],
    steps: [
      { note_zh: '卷板：316L 厚板卷成 40° 扇区筒壁', performedBy: 'plant/rolling-mill' },
      { note_zh: '焊接：双层壁与筋板组焊', performedBy: 'plant/sheet-shop' },
      { note_zh: '端口机加工：窗口法兰面与孔', performedBy: 'lathe' },
      {
        note_zh: '装配与检漏：大件总装车间缺失，装配环境温度未建模，本段不写 under',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh: '不锈钢 578000 kg → 扇区 1 件（约 578 t）；余是切头、焊材与开孔，按件计',
  },
  {
    /**
     * 低温恒温器：316L 不锈钢 3,850 t → 卷板 → 焊接 → 装配检漏 → 整台。
     *
     * 一件 = 整台；3,850 t 是公开质量，投入 3,850,000 kg 与条目 mass 正好对上。
     * 卷板、焊接与检漏借用现有设备；28 m 级幅面与 3,850 t 吨位的产能未建模，
     * 大件成形、焊接与热处理设备本身是缺口。
     * 去应力不写成工序：现有电阻炉 100–1100 °C 的温度够，但炉膛装不下整台；
     * 条件未建模。
     * 大件总装车间缺失，装配环境温度未建模；现用 ambient/未约束，不等于有车间。
     * volume 已转 calculated 记录；vacuum 已是记录（assumed，不是实测）。
     */
    id: 'make/fusion-cryostat',
    name: '聚变装置低温恒温器制造',
    produces: [
      {
        item: 'plant/fusion-reactor/cryostat',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 14000, max: 16000, record: 'mat/fusion-cryostat-volume-record' },
          { param: 'vacuum', kind: 'range', min: 1e-5, max: 1e-4, record: 'mat/fusion-cryostat-vacuum-record' },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(3850000) }] }],
    needs: [],
    steps: [
      { note_zh: '卷板：316L 厚板卷成筒节与封头', performedBy: 'plant/rolling-mill' },
      { note_zh: '焊接：筒节、封头与贯穿件组焊', performedBy: 'plant/sheet-shop' },
      {
        note_zh: '装配与检漏：大件总装车间缺失，装配环境温度未建模，本段不写 under',
        performedBy: 'plant/robot',
      },
    ],
  },
  {
    /**
     * 整机装配：按空间与时间拆成四段 —— 厂址与基础 → 核岛总装 → 配套岛
     * → 分系统调试与联调。
     *
     * 空间拆分：核岛、低温岛、燃料厂、动力岛分区；时间拆分：土建、总装、
     * 配套、联调四段，rate 取 43,800 h（5 年，假设，不是实测）。
     * 四个整机窗口已转 public-spec 记录；新增 10 个 measure 能力窗口仍是
     * design（首台装置 commissioning 用，不是读数）；seed specOk 仍不成立。
     * 14 个一级系统都有产出路线，本路线不再缺件。
     * 换料与检修时间未建模。
     */
    id: 'make/fusion-reactor',
    name: '聚变装置装配',
    produces: [
      {
        item: 'plant/fusion-reactor',
        qty: q(1),
        gives: [
          { param: 'fusionPower', kind: 'range', min: 400, max: 500, record: 'mat/fusion-plant-record' },
          { param: 'q', kind: 'range', min: 5, max: 10, record: 'mat/fusion-plant-record' },
          { param: 'pulseLength', kind: 'range', min: 400, max: 600, record: 'mat/fusion-plant-record' },
          { param: 'dutyCycle', kind: 'range', min: 0.1, max: 1, record: 'mat/fusion-plant-record' },
        ],
      },
    ],
    uses: [],
    needs: [],
    steps: [
      {
        note_zh: '厂址与基础：核岛/低温岛/燃料厂/动力岛分区、场地平整与基础',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '核岛总装：真空室扇区、TF/PF/CS、包层、偏滤器、冷屏、恒温器',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '配套岛：低温厂、燃料循环、发电模块、控制、屏蔽',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '分系统调试与联调：真空、低温、磁体、燃料、并网',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(43800) },
  },
  {
    /**
     * 首台装置 commissioning 诊断：机柜/传感器 → 接线/采集 → 安装到整机 → 一台。
     *
     * uses 316L 5 t + 铜 1 t + 运放 100 + 环氧 50 kg。
     * 10 个 measure/* 窗口是设计值，不是产品实测。
     */
    id: 'make/fusion-diagnostics',
    name: '聚变装置 commissioning 诊断制造',
    produces: [
      {
        item: 'plant/fusion-reactor/diagnostics',
        qty: q(1),
        gives: [
          { param: 'measure/fusionPower', kind: 'range', min: 400, max: 500, record: 'mat/cal-diagnostics-record' },
          { param: 'measure/q', kind: 'range', min: 5, max: 10, record: 'mat/cal-diagnostics-record' },
          { param: 'measure/pulseLength', kind: 'range', min: 400, max: 600, record: 'mat/cal-diagnostics-record' },
          { param: 'measure/dutyCycle', kind: 'range', min: 0.1, max: 1, record: 'mat/cal-diagnostics-record' },
          { param: 'measure/injectedPower', kind: 'range', min: 45, max: 50, record: 'mat/cal-diagnostics-record' },
          { param: 'measure/installedPower', kind: 'range', min: 90, max: 95, record: 'mat/cal-diagnostics-record' },
          { param: 'measure/electricPower', kind: 'range', min: 150, max: 200, record: 'mat/cal-diagnostics-record' },
          { param: 'measure/efficiency', kind: 'range', min: 35, max: 40, record: 'mat/cal-diagnostics-record' },
          { param: 'measure/burnRate', kind: 'range', min: 0.05, max: 0.1, record: 'mat/cal-diagnostics-record' },
          { param: 'measure/tritiumInventory', kind: 'range', min: 2, max: 3, record: 'mat/cal-diagnostics-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(5000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1000) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(100) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(50) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '机柜与传感器', performedBy: 'plant/sheet-shop' },
      { note_zh: '接线与采集', performedBy: 'plant/robot' },
      { note_zh: '安装到整机', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 生物屏蔽与中子屏蔽：硼化混凝土 2 万吨 → 模板/钢筋 → 浇注 → 养护 → 安装。
     *
     * 2 万吨按 30 m 级厂房、2 m 壁厚的量级估，是假设，不是实测；
     * 壁厚已转 assumed 记录；硼含量已转 calculated 记录，都不是实测。
     * 配筋、模板、养护与现场施工设备未建模；养护温度未建模，因此不写 under。
     */
    id: 'make/fusion-shield',
    name: '聚变装置屏蔽制造',
    produces: [
      {
        item: 'plant/fusion-reactor/shield',
        qty: q(1),
        gives: [
          { param: 'thickness', kind: 'range', min: 1.5, max: 2.5, record: 'mat/fusion-shield-thickness-record' },
          { param: 'boronContent', kind: 'range', min: 1, max: 2, record: 'mat/fusion-shield-boron-record' },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/borated-concrete', qty: q(20000000) }] }],
    needs: [],
    steps: [
      { note_zh: '模板与钢筋：屏蔽墙模板、钢筋笼', performedBy: 'plant/robot' },
      { note_zh: '浇注：硼化混凝土分层浇注', performedBy: 'plant/robot' },
      { note_zh: '养护：现场养护，温度未建模', performedBy: 'plant/robot' },
      { note_zh: '安装：与厂房结构连接、预埋件就位', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 冷屏：316L 面板 80 t + 铜冷却管 20 t → 卷板/成形 → 焊/钎焊冷却管 → 装配。
     *
     * 5,000 m² 面板（2 mm）与 80 t/20 t 是量级估，是假设，不是实测；
     * 80–100 K 与发射率 0.05–0.1 是设计窗口，不是读数。
     * 大面积钎焊设备与低温测试未建模，因此不写 under。
     */
    id: 'make/fusion-thermal-shield',
    name: '聚变装置冷屏制造',
    produces: [
      {
        item: 'plant/fusion-reactor/thermal-shield',
        qty: q(1),
        gives: [
          { param: 'temperature', kind: 'range', min: 80, max: 100, record: 'mat/fusion-thermal-temp-record' },
          { param: 'emissivity', kind: 'range', min: 0.05, max: 0.1, record: 'mat/fusion-thermal-emissivity-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(80000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(20000) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '卷板/成形：316L 面板成形', performedBy: 'plant/rolling-mill' },
      { note_zh: '焊/钎焊冷却管：面板与铜管连接', performedBy: 'plant/sheet-shop' },
      { note_zh: '装配：面板与冷却管总装', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 环向场线圈：Nb3Sn 前驱电缆 100 t + 316L 150 t + 铜 30 t + 环氧 5 t
     * → 绕线 → 反应热处理 → 真空浸渍 → 套装/装配 → 一件。
     *
     * 投料合计 285 t，对 310 t 整件的余量（附件、工装、余量）未列，是量级拆分。
     * 310 t/17 m 级绕线与热处理设备幅面未建模；反应热处理的升温曲线未给。
     * peakField 已转 public-spec 记录；storedEnergy 已转 calculated 记录，不是读数。
     */
    id: 'make/fusion-tf-coil',
    name: '聚变装置环向场线圈制造',
    produces: [
      {
        item: 'plant/fusion-reactor/tf-coil',
        qty: q(1),
        gives: [
          { param: 'peakField', kind: 'range', min: 11.8, max: 12.5, record: 'mat/fusion-tf-field-record' },
          { param: 'storedEnergy', kind: 'range', min: 40, max: 42, record: 'mat/fusion-tf-energy-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/nb3sn-cable', qty: q(100000) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(150000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(30000) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(5000) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '绕线：Nb3Sn 电缆绕成双饼', performedBy: 'plant/winder' },
      {
        note_zh: '反应热处理：650 °C、氧 0–50 ppm 生成 A15 相',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 600, max: 700 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '真空浸渍：环氧浸渍固化',
        performedBy: 'plant/autoclave',
        under: [
          { param: 'temperature', min: 150, max: 200 },
          { param: 'pressure', min: 10000, max: 35000 },
        ],
      },
      { note_zh: '套装/装配：线圈入壳、装配', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 极向场线圈：NbTi 线缆 80 t + 316L 120 t + 铜 25 t + 环氧 4 t
     * → 绕线 → 浸渍 → 装配 → 一件。
     *
     * 单件量级按 229 t 投料估；NbTi 不需要反应热处理，绕线后直接浸渍。
     * peakField 已是记录；current 已转 assumed 记录，不是读数。
     */
    id: 'make/fusion-pf-coil',
    name: '聚变装置极向场线圈制造',
    produces: [
      {
        item: 'plant/fusion-reactor/pf-coil',
        qty: q(1),
        gives: [
          { param: 'peakField', kind: 'range', min: 5, max: 6, record: 'mat/fusion-pf-field-record' },
          { param: 'current', kind: 'range', min: 40, max: 52, record: 'mat/fusion-pf-current-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/nbti-cable', qty: q(80000) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(120000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(25000) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(4000) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '绕线：NbTi 线缆绕成线圈', performedBy: 'plant/winder' },
      {
        note_zh: '真空浸渍：环氧浸渍固化',
        performedBy: 'plant/autoclave',
        under: [
          { param: 'temperature', min: 150, max: 200 },
          { param: 'pressure', min: 10000, max: 35000 },
        ],
      },
      { note_zh: '装配：线圈入壳、装配', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 中心螺线管模块：Nb3Sn 前驱电缆 60 t + 316L 90 t + 铜 15 t + 环氧 3 t
     * → 绕线 → 反应热处理 → 浸渍 → 叠装 → 一个模块。
     *
     * 6 个模块叠成 1,000 t；单模块质量与绕线设备幅面未建模。
     * 220–260 Wb 是 6 模块叠成整组的磁通摆幅，按单模块条目交付，
     * 单模块分摊未建模；flux 与 peakField 都已转记录。
     */
    id: 'make/fusion-central-solenoid',
    name: '聚变装置中心螺线管制造',
    produces: [
      {
        item: 'plant/fusion-reactor/central-solenoid',
        qty: q(1),
        gives: [
          { param: 'flux', kind: 'range', min: 220, max: 260, record: 'mat/fusion-cs-flux-record' },
          { param: 'peakField', kind: 'range', min: 12, max: 13, record: 'mat/fusion-cs-field-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/nb3sn-cable', qty: q(60000) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(90000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(15000) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(3000) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '绕线：Nb3Sn 电缆绕成模块', performedBy: 'plant/winder' },
      {
        note_zh: '反应热处理：650 °C、氧 0–50 ppm 生成 A15 相',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 600, max: 700 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '真空浸渍：环氧浸渍固化',
        performedBy: 'plant/autoclave',
        under: [
          { param: 'temperature', min: 150, max: 200 },
          { param: 'pressure', min: 10000, max: 35000 },
        ],
      },
      { note_zh: '叠装：模块叠装、预紧', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 包层模块：W 粉 1 t + 316L 2.5 t + 铜 1 t + 水 0.1 t → W 瓦烧结
     * → 与铜热沉钎焊 → 模块装配 → 一件。
     *
     * 4.6 t 模块、440 个、第一壁 W 瓦与铜热沉是量级拆分，标假设；
     * HIP/钎焊大面积与热流测试未建模。
     * heatFlux 已转 calculated 记录，不是读数。
     */
    id: 'make/fusion-blanket-module',
    name: '聚变装置包层制造',
    produces: [
      {
        item: 'plant/fusion-reactor/blanket',
        qty: q(1),
        gives: [{ param: 'heatFlux', kind: 'range', min: 0.3, max: 0.5, record: 'mat/fusion-blanket-heat-record' }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(2500) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(100) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: 'W 瓦烧结：1800–2000 °C、氧 0–50 ppm',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 1800, max: 2000 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '与铜热沉钎焊：800–900 °C、氧 0–50 ppm',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 800, max: 900 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      { note_zh: '模块装配：W 瓦、热沉、屏蔽块装配', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 偏滤器盒体：W 粉 3 t + 铜 5 t + 316L 1.5 t + 水 0.5 t → W 单块烧结
     * → 铜合金热沉 → 钎焊 → 盒体装配 → 一件。
     *
     * 54 盒体、每件 10 t 是公开量级；W/Cu 接头与热流测试未建模。
     * steady/transient 已转 public-spec 记录，不是读数。
     */
    id: 'make/fusion-divertor-cassette',
    name: '聚变装置偏滤器制造',
    produces: [
      {
        item: 'plant/fusion-reactor/divertor',
        qty: q(1),
        gives: [
          { param: 'steadyHeatFlux', kind: 'range', min: 10, max: 12, record: 'mat/fusion-divertor-steady-record' },
          { param: 'transientHeatFlux', kind: 'range', min: 20, max: 25, record: 'mat/fusion-divertor-transient-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(3000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(5000) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1500) }] },
      { anyOf: [{ item: 'mat/water', qty: q(500) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: 'W 单块烧结：1800–2000 °C、氧 0–50 ppm',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 1800, max: 2000 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '铜合金热沉：400–500 °C',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 500 }],
      },
      {
        note_zh: '钎焊：800–900 °C、氧 0–50 ppm',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 800, max: 900 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      { note_zh: '盒体装配：靶板、热沉、盒体装配', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 低温厂：316L 2,000 t + 铜 300 t + 铝 100 t + 氦 25 t + 环氧 10 t
     * → 冷箱/换热器 → 压缩机 → 低温管路 → 总装 → 一套。
     *
     * ITER 公开 75 kW @ 4.5 K、氦库存 25 t；现有 GM/JT 冷头只有 0.05–5 W，
     * 差 4 个数量级；氦透平/冷箱未建模。本路线是链条占位，不是已能造 75 kW。
     * 70–75 kW 与 20–30 t 已转记录，不是读数。
     */
    id: 'make/fusion-cryoplant',
    name: '聚变装置低温厂制造',
    produces: [
      {
        item: 'plant/fusion-reactor/cryoplant',
        qty: q(1),
        gives: [
          { param: 'coolingPower', kind: 'range', min: 70, max: 75, record: 'mat/fusion-cryoplant-cooling-record' },
          { param: 'heliumInventory', kind: 'range', min: 20, max: 30, record: 'mat/fusion-cryoplant-helium-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(2000000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(300000) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(100000) }] },
      { anyOf: [{ item: 'mat/helium', qty: q(25000) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(10000) }] },
    ],
    needs: ['plant/air-separator'],
    steps: [
      { note_zh: '冷箱与换热器：板翅式换热器冷箱', performedBy: 'plant/sheet-shop' },
      { note_zh: '压缩机：氦压缩机与油站', performedBy: 'plant/air-compressor' },
      { note_zh: '低温管路：真空绝热低温管', performedBy: 'plant/sheet-shop' },
      { note_zh: '总装：冷箱、压缩机、储罐与分配阀箱总装', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 射频模块：铜 2 kg + 铝 3 kg + 316L 5 kg → 一个模块
     * （含 1 台 20 kW 射频源 + 汇流/冷却）。
     *
     * 20 kW 源取 plant/rf-generator-20kw，作为前置件写在 needs 里，不消耗；
     * 模块自身只做汇流与冷却结构。质量按量级估，不是实测。
     */
    id: 'make/fusion-heating-module',
    name: '聚变装置射频模块制造',
    produces: [{ item: 'plant/fusion-reactor/heating/rf-module', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(3) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(5) }] },
    ],
    needs: ['plant/rf-generator-20kw'],
    performedBy: 'plant/robot',
    unbalanced_zh: '一个模块含 1 台 20 kW 射频源 + 汇流/冷却，质量按量级估',
  },
  {
    /**
     * 辅助加热：4,750 个射频模块并联、汇流与老练 → 一套加热。
     *
     * 4,750 × 20 kW = 95 MW 装机；注入 50 MW（约 52%）。
     * 真实 ECRH 是 1 MW 回旋管，20 kW 并联是降级架构；NBI/ICRH 未建模。
     * injectedPower 与 installedPower 已转 public-spec 记录，不是读数。
     */
    id: 'make/fusion-heating',
    name: '聚变装置辅助加热制造',
    produces: [
      {
        item: 'plant/fusion-reactor/heating',
        qty: q(1),
        gives: [
          { param: 'injectedPower', kind: 'range', min: 45, max: 50, record: 'mat/fusion-heating-record' },
          { param: 'installedPower', kind: 'range', min: 90, max: 95, record: 'mat/fusion-heating-record' },
        ],
      },
    ],
    uses: [],
    needs: [],
    steps: [
      { note_zh: '4,750 个射频模块并联', performedBy: 'plant/robot' },
      { note_zh: '汇流与老练', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 发电岛：316L 5,000 t + 铜 500 t + 3% 硅钢 200 t + 环氧 50 t + 水 10 t
     * → 汽轮机转子 → 发电机 → 冷凝器/换热器 → 总装 → 一套。
     *
     * 200 MW 汽轮机/发电机是量级；叶片高温合金、凝汽器、并网未建模；
     * ITER 本身不发电，本路线是发电岛占位。
     * electricPower 与 efficiency 已转 assumed 记录，不是读数。
     */
    id: 'make/fusion-power-block',
    name: '聚变装置发电模块制造',
    produces: [
      {
        item: 'plant/fusion-reactor/power-block',
        qty: q(1),
        gives: [
          { param: 'electricPower', kind: 'range', min: 150, max: 200, record: 'mat/fusion-power-record' },
          { param: 'efficiency', kind: 'range', min: 35, max: 40, record: 'mat/fusion-power-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(5000000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(500000) }] },
      { anyOf: [{ item: 'mat/silicon-steel-3si', qty: q(200000) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(50000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10000) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '汽轮机转子：锻造', performedBy: 'plant/forge' },
      { note_zh: '车削', performedBy: 'lathe' },
      { note_zh: '磨削', performedBy: 'plant/grinder' },
      { note_zh: '动平衡', performedBy: 'plant/dynamic-balance-machine' },
      { note_zh: '发电机：绕线', performedBy: 'plant/winder' },
      { note_zh: '冷凝器/换热器', performedBy: 'plant/sheet-shop' },
      { note_zh: '总装', performedBy: 'plant/robot' },
    ],
  },
];

export const DATA_ITEMS: readonly Item[] = [...FUSION_ITEMS];
// 一级系统只回答“由什么组成、怎么装”；系统以下不在这张表里。
export const DATA_ROUTES: readonly Route[] = [...FUSION_ROUTES];
