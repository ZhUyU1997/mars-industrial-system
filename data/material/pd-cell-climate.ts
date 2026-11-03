/**
 * PD 试验舱的气候与安全 —— 20±2 °C、RH<60%、门联锁、放电棒、接地开关。
 *
 * 本文件补「真正缺口 · B 性能/验证」最后一行：
 *   `PD 舱气候/安全 | 缺 20±2 °C、RH<60%、门联锁、放电棒/接地开关`
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四件零件，各自一条路线
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   plant/pd-test-cell/hvac           恒温恒湿机组（13 kW 冷 / 6 kW 热 / 3000 m³/h）
 *   plant/pd-test-cell/interlock      门联锁（门关 + 门锁两道，失电即断高压）
 *   plant/pd-test-cell/discharge-rod  放电棒（φ10×1.5 m 铜棒 + 胶木手柄 + 编织带）
 *   plant/pd-test-cell/ground-switch  接地开关（铜闸刀 + 瓷绝缘子 + 门机械互锁）
 *
 * 四件都是 `category: 'part'`，挂进 `plant/pd-test-cell` 的 composedOf（pd-cell.ts）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 气候口径：13 kW / 3000 m³/h 是按 101.3 kPa、20 °C 算的
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 舱 6×5×4 = 120 m³，内表面 148 m²。按 100 mm 矿棉、U = 0.5 W/(m²·K)、
 * 舱外实验室 10 °C（ΔT = 10 K）算：
 *
 *   围护漏热   148 × 0.5 × 10 = 740 W（取 1.5 kW，含热桥与门缝）
 *   内部热     风机 1.1 + 照明 0.5 + 2 人 0.2 + 仪器 0.2 = 2.0 kW
 *   显热合计   3.5 kW（+20% 余量 = 4.2 kW）
 *
 * 除湿量的算式（20 °C，p_sat = 2.339 kPa）：
 *
 *   60% RH   p_v = 1.403 kPa，d = 0.622×1.403/(101.325−1.403) = 8.73 g/kg
 *   80% RH   p_v = 1.871 kPa，d = 11.70 g/kg
 *   舱内干空气 120 m³ × 1.204 kg/m³ ≈ 142.5 kg
 *   从 80% 抽到 60% 要脱 142.5 × (11.70−8.73)/1000 = 0.42 kg
 *   持续负荷：2 人 0.10 kg/h + 开门 0.02 kg/h + 渗漏 0.10 kg/h ≈ 0.2 kg/h
 *
 * 盘管按 3000 m³/h（25 次换气/h，500×500 风道 3.3 m/s）：
 *
 *   空气质量流量  3000 × 1.204 / 3600 = 1.00 kg/s
 *   进 20 °C/60%  h = 42.3 kJ/kg
 *   出 10 °C 饱和 h = 29.3 kJ/kg（d = 7.64 g/kg）
 *   冷量          1.00 × (42.3−29.3) = 13.0 kW
 *   凝水          1.00 × (8.73−7.64) = 1.09 g/s = 3.9 kg/h
 *
 * 所以机组能力写 **13 kW 冷量 / 6 kW 加热 / 3000 m³/h / 4 kg/h 除湿**。
 * 压缩机轴功率按 COP 3.5 算 13/3.5 = 3.7 kW；蒸发器风机 1.1 kW、冷凝器风机 0.5 kW。
 * 本层只有 7.5 kW 一档电机，三台都按它配（皮带减速/风阀节流），这是效率降级，见 G8。
 * 冷凝器排热 13+3.7 = 16.7 kW。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 做法照抄恒温间：双金属片 + 继电器 + 镍铬丝 + 氨蒸发器 + 风机 + 风道
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   温控     铜片 + 45 钢片铆成双金属片，顶微动开关；死区 ≤1 K（恒温间 ±0.5 K 同型）
 *   执行     双金属片触点 → std/contactor-general（中间继电器）→ 加热器 / 压缩机
 *   加热     6 kW 镍铬丝（380 V、24 Ω、φ1.5 mm 长 38.6 m）
 *   制冷     氨蒸发器：φ16 不锈钢管 60 m + 铝翅片，5 °C 蒸发；氨对铜有腐蚀，
 *            所以制冷回路不用铜（铜只走电）
 *   除湿     蒸发器凝水盘 + φ25 排水管，凝水 4 kg/h 排走
 *   风道     500×500 mm 钢板风道，50 mm 矿棉保温
 *   氨        40 kg 25–30% 氨水（按 25% 下限）进蒸馏塔，塔顶 10 kg NH3（≥99.5%）+ 塔底 30 kg 水；
 *            再用石灰把**氨工质**干燥到水 ≤0.1% —— 舱内空气除湿只走凝水盘，不用干燥剂
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 已知缺口（R8：每一条都带升级路线）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * G1 **舱的 holds 已落。** `plant/pd-test-cell` 现在声明
 *    `holds: [{temperature 18–22}, {humidity 0–60}]`（pd-cell.ts）；
 *    四条 PD 测量路线都把舱放进 `needs`。
 *    仍缺：连续温湿度记录（G3），所以“已维持”仍不可证。缺口量级：一台记录仪。
 *
 * G2 **无水氨没有独立条目。** `mat/ammonia` 存在（alkali.ts:65，make/ammonia
 *    交付 25–30% 氨水），本层没有 99.5% 无水氨的交付窗口。本机组把提浓写成
 *    路线内的一段（蒸馏塔 + 石灰/分子筛干燥），产物按 10 kg NH3 计。
 *    升级：补一条无水氨路线（25–30% 氨水 → 99.5% NH3；拟建，本层暂无此 id），
 *    把提浓段移出机组路线。缺口量级：一条路线；塔与石灰都有，缺的是氨干燥的实测。
 *
 * G3 **没有校准过的湿度传感器。** 本层有 `plant/dew-point-meter`
 *    （oxygen-metrology.ts:802，−95…+20 °C 露点），但严格算术下本地造不出来
 *    （「长不出来」清单里卡在 `plant/dew-point-meter/electrolytic-cell`）。
 *    所以整定与验收只能用**干湿球温度计**：两支 0–60 °C、1 °C 分度的双金属温度计
 *    （`make/thermocouple` 路线里附带做的那一种），湿球包纱布浸水，RH **±5%**。
 *    不直接用 T 型偶 + 毫伏表读干湿球：那套是 7.7 K/格（reflow.ts），读不了温差。
 *    判据写成「≤55% RH 运行，留 5% 给量具误差，才能签字 <60%」。
 *    升级：补电解池链或外购露点仪，RH 不确定度从 ±5% 降到 ±1–2%。
 *
 * G4 **舱压未声明。** 本机组按舱内 101.3 kPa、20 °C 选型（PD 试验常规气压）。
 *    本层 ambient 是 0.6 kPa：在 0.6 kPa 下 20 °C 的 RH 上限 = 0.6/2.339 = 26%，
 *    RH<60% 自动满足，但没有除湿对象；在 3.5 kPa（恒温间同档）下空气侧只能带走
 *    0.45 kW，13 kW 冷量用不上 —— 低气压下要靠冷壁/辐射，不是风机盘管；
 *    1 atm 要压力壳，而屏蔽厅是 1.5 mm 钢板。
 *    升级：给 `plant/pd-test-cell` 加 pressure holds（0.6 / 3.5 / 101 kPa 三选一），
 *    按选定压力重算本机组；选 1 atm 则屏蔽厅要按压力容器加筋/加门斗。
 *
 * G5 **联锁可靠性没有试验数据。** 触点粘连、弹簧疲劳、微动开关动作次数都没有
 *    实测。本文件按「失电分闸 + 正开式触点（positive opening）」设计，但记 R8：
 *    升级路线 = ① 每只门开关用双触点冗余（2 NC 串联）；② 加带自监测的安全继电器；
 *    ③ 每 6 个月/500 次做一次动作试验（门开 → 高压断，记录动作时间与触点电阻）；
 *    ④ 1000 次寿命试验后再签字。缺口量级：一套安全继电器 + 试验台。
 *
 * G6 **屏蔽厅没有保温。** 本机组按 100 mm 矿棉、ΔT 10 K 估围护漏热 0.7–1.5 kW；
 *    裸钢板 U≈5 W/(m²·K)，同样 ΔT 是 3.7–7.4 kW，13 kW 仍 cover 但余量小。
 *    升级：给屏蔽厅内衬 100 mm 矿棉夹芯板（`plant/metrology-room/wall` 同工艺）。
 *
 * G7 **放电棒与接地开关没有耐压/机械寿命试验。** 100 kV 耐压、1 000 次分合、
 *    接触电阻 ≤200 µΩ 都是设计值；本层没有兆欧表/微欧计/100 kV 试验台
 *    （`plant/hv-test-bench` 严格算术下长不出来）。现场只做 DVM 通断与外观检查。
 *    升级：接 `plant/hv-test-bench` 做 1.2×100 kV/1 min 耐压与泄漏电流，
 *    再做 1 000 次分合与接触电阻复测。缺口量级：一套试验台 + 一套微欧计。
 *
 * G8 **电机只有 7.5 kW 一档。** 蒸发器风机 1.1 kW、冷凝器风机 0.5 kW 都用
 *    7.5 kW 电机，压缩机 3.7 kW 也只是半载；电机额定功率是负荷的 2–15 倍，
 *    效率与功率因数都掉一档。这是 R8 降级（功能在，效率差）。
 *    升级：补 0.5 / 1.5 kW 小功率电机条目，按负荷配；缺口量级：一条电机规格路线。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PD_CELL_CLIMATE_ITEMS: readonly Item[] = [
  /**
   * 恒温恒湿机组。13 kW 冷 / 6 kW 热 / 3000 m³/h / 4 kg/h 除湿。
   *
   * 服务 6×5×4 m 的舱（120 m³，25 次换气/h）。它把「20±2 °C、RH<60%」
   * 做成可测的四件事：温度 18–22 °C、湿度 ≤60% RH、冷量 ≥13 kW、风量 ≥3000 m³/h。
   * 结构照抄恒温间：双金属片 → 接触器 → 镍铬丝 / 氨压缩机；氨蒸发器盘管 + 凝水盘。
   *
   * ⚠️ 它是 part，不是 machine：`holds` 只能挂在 `plant/pd-test-cell` 上，
   * 而本轮不许改那个条目的 holds —— 见文件头 G1。
   */
  {
    id: 'plant/pd-test-cell/hvac',
    name: 'PD 恒温恒湿机组',
    unit: '件',
    category: 'part',
    props: [
      { param: 'temperature', kind: 'range', min: 18, max: 22, unit: '°C' },
      { param: 'humidity', kind: 'range', min: 0, max: 60, unit: '%RH', dir: 'atMost' },
      { param: 'coolingCapacity', kind: 'range', min: 0, max: 30, unit: 'kW', dir: 'atLeast' },
      { param: 'heatingCapacity', kind: 'range', min: 0, max: 15, unit: 'kW', dir: 'atLeast' },
      { param: 'airflow', kind: 'range', min: 0, max: 6000, unit: 'm³/h', dir: 'atLeast' },
      { param: 'dehumidification', kind: 'range', min: 0, max: 10, unit: 'kg/h', dir: 'atLeast' },
    ],
  },

  /**
   * 门联锁。双门两道：门关微动开关 SW1 + 门锁微动开关 SW2，分别驱动两只
   * 中间继电器 K1a/K1b，两只常开触点串联在高压接触器 K2 的线圈里。
   *
   * **失效方向是「门开 → 高压断」**：门开或门未锁 → 对应微动开关断开 →
   * 继电器释放 → K2 失电 → 主触点由弹簧打开。所有控制触点都是正开式
   * （positive opening， IEC 60947-5-1 Annex K 的动作方式），断线、失电、
   * 弹簧疲劳都落在断开侧；只有 K2 主触点粘连是这套单通道方案的残余风险，
   * 见文件头 G5。
   *
   * 高压接触器 K2：空气绝缘、300 mm 开距、100 kV / 1 A，弹簧分闸；
   * 主触点串在 `plant/hv-test-bench/source-100k` 的输出与试品之间
   * （源本身不归本件管）。不用 SF6：少一条氟链依赖，舱内空气绝缘够 300 mm。
   * 300 mm 是按 1 atm 算的；若舱在 0.6 kPa，击穿电压要按 Paschen 重算（见 G4）。
   * `contactResistance` 指 K2 主触点（µΩ 档）；微动开关控制触点的几十 mΩ 不在这个窗口里。
   *
   * 机械互锁与接地开关共用一块门框联锁板：门关时挡住接地开关操作杆；
   * 接地开关合闸后操作杆伸进门框，门关不上。
   */
  {
    id: 'plant/pd-test-cell/interlock',
    name: 'PD 门联锁',
    unit: '件',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 0, max: 200000, unit: 'V', dir: 'atLeast' },
      { param: 'current', kind: 'range', min: 0, max: 1000, unit: 'A', dir: 'atLeast' },
      { param: 'tripTime', kind: 'range', min: 0, max: 100, unit: 'ms', dir: 'atMost' },
      { param: 'channels', kind: 'range', min: 1, max: 2, unit: '路', dir: 'atLeast' },
      { param: 'contactResistance', kind: 'range', min: 0, max: 1000, unit: 'µΩ', dir: 'atMost' },
      { param: 'clearance', kind: 'range', min: 200, max: 400, unit: 'mm' },
    ],
  },

  /**
   * 放电棒。φ10×1.5 m 铜棒 + 0.4 m 酚醛（胶木）手柄 + 25 mm² 铜编织带 + 铜挂钩。
   *
   * 用途：高压断开、接地开关合上之后，用棒尖碰试品高压端，把残余电荷放到地。
   * 手柄 0.4 m 是 100 kV 的爬电距离（250 kV/m），棒体 1.5 m 保证人手离高压端
   * ≥1.5 m。铜棒 1.06 kg 的算法：π×(0.005)²×1.5×8960 = 1.055 kg。
   *
   * ⚠️ 0.4 m 手柄是**停电后放电**用的短手柄，不是带电作业绝缘杆：250 kV/m
   * 高于户外标准（20–25 mm/kV）；只允许在高压断开、接地开关合上后使用。
   *
   * ⚠️ 100 kV 耐压与 0.05 Ω 导通电阻都是设计值；本层没有 100 kV 试验台/微欧计，
   * 只做 DVM 通断与外观检查。升级见文件头 G7。
   */
  {
    id: 'plant/pd-test-cell/discharge-rod',
    name: 'PD 放电棒',
    unit: '支',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 8, max: 12, unit: 'mm' },
      { param: 'length', kind: 'range', min: 1.2, max: 1.8, unit: 'm' },
      { param: 'resistance', kind: 'range', min: 0, max: 0.05, unit: 'Ω', dir: 'atMost' },
      { param: 'withstandVoltage', kind: 'range', min: 0, max: 200, unit: 'kV', dir: 'atLeast' },
    ],
  },

  /**
   * 接地开关。铜闸刀 30×6 mm + 45 钢铰链 + 4 只氧化铝瓷绝缘子 + 酚醛操作杆。
   *
   * 100 kV、200 A；合闸后把试品高压端直接接地。刀口银触点、接触电阻 ≤200 µΩ。
   * 闸刀 30×6×400 mm = 0.64 kg；200 A 下电流密度 1.1 A/mm²，1 kA/1 s 下
   * 5.6 A/mm²，都在铜的短时允许范围内。300 mm 空气开距对 100 kV 是
   * 0.33 kV/mm，空气击穿约 3 kV/mm，有 9 倍余量（按 1 atm；0.6 kPa 下按 Paschen 重算，见 G4）。
   *
   * 机械互锁：门关时门框螺栓挡住操作杆（不能带电合接地刀）；接地刀合上后
   * 操作杆伸进门框（门关不上，不能带接地刀送电）。
   *
   * ⚠️ 4 只瓷绝缘子按每只 25 kV 串联；本层 `std/alumina-insulator-general`
   * 没有电压属性，25 kV/只是按 300 mm 爬距的工程假设，不是实测。
   */
  {
    id: 'plant/pd-test-cell/ground-switch',
    name: 'PD 接地开关',
    unit: '台',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 0, max: 200000, unit: 'V', dir: 'atLeast' },
      { param: 'current', kind: 'range', min: 0, max: 1000, unit: 'A', dir: 'atLeast' },
      { param: 'contactResistance', kind: 'range', min: 0, max: 500, unit: 'µΩ', dir: 'atMost' },
      { param: 'clearance', kind: 'range', min: 200, max: 400, unit: 'mm' },
    ],
    composedOf: [
      { item: 'plant/pd-test-cell/ground-switch/blade', qty: q(1) },
      { item: 'plant/pd-test-cell/ground-switch/busbar', qty: q(1) },
      { item: 'plant/pd-test-cell/ground-switch/braid', qty: q(1) },
      { item: 'plant/pd-test-cell/ground-switch/contact-set', qty: q(1) },
      { item: 'plant/pd-test-cell/ground-switch/hinge', qty: q(1) },
      { item: 'plant/pd-test-cell/ground-switch/operating-rod', qty: q(1) },
      { item: 'plant/pd-test-cell/ground-switch/base-frame', qty: q(1) },
      { item: 'plant/pd-test-cell/ground-switch/fastener-set', qty: q(1) },
      { item: 'std/alumina-insulator-general', qty: q(4) },
    ],
  },
];

export const PD_CELL_CLIMATE_ROUTES: readonly Route[] = [
  {
    /**
     * **恒温恒湿机组：钢框 + 风道 + 氨压缩机 + 蒸发器 + 镍铬加热器 + 双金属温控。**
     *
     * 物料（kg）：
     *   钢 300 + 不锈钢 100 + 铜 12 + 铝 30 + 铸铁 60 + 45 钢 25
     *   + 镍铬丝 1 + 矿棉 60 + 酚醛 6 + 银 0.05 + 氨水 40 + 石灰 2 + PTFE 1 = 637.05 kg
     * → 机组 1 台（本体约 580 kg，含 10 kg 无水氨；按 25% 氨水下限折）
     *   + 提浓排水 30 kg + 边角/浇冒口/调试 27.05 kg
     *
     * 七道工序：钣金 → 浇铸 → 机加工 → 绕丝 → 氨提浓 → 总装充氨 → 恒温间整定。
     * 氨提浓那一段由 `plant/distillation-tower` 做（它 holds 40–80 °C、300–1000 kPa）；
     * 温控器在 `plant/metrology-room` 的 19–21 °C 里整定（`under` 引用它的 holds）。
     *
     * ⚠️ 机组本身是 part，不能 holds；`plant/pd-test-cell` 的 holds 是缺口 G1。
     */
    id: 'make/pd-cell-hvac',
    name: 'PD 恒温恒湿机组制造',
    produces: [
      {
        item: 'plant/pd-test-cell/hvac',
        qty: q(1),
        gives: [
          { param: 'temperature', kind: 'range', min: 19, max: 21 },
          { param: 'humidity', kind: 'range', min: 40, max: 55 },
          { param: 'coolingCapacity', kind: 'range', min: 13, max: 16 },
          { param: 'heatingCapacity', kind: 'range', min: 6, max: 9 },
          { param: 'airflow', kind: 'range', min: 3000, max: 3500 },
          { param: 'dehumidification', kind: 'range', min: 4, max: 6 },
        ],
      },
    ],
    uses: [
      // 300 kg：箱体 2.0×1.2×1.5 m 的 1.2 mm 钢板约 136 kg；500×500 风道 12 m 的 0.75 mm 钢板约 141 kg；
      // 框架/支架/凝水盘 23 kg
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(300) }] },
      // 100 kg：φ16×1.5 mm 不锈钢蒸发器管 60 m（约 32 kg）+ 集管/压缩机阀件/紧固件
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(100) }] },
      // 12 kg：接线、端子、控制线；制冷回路不用铜（NH₃ 与 Cu 生成络合物）
      { anyOf: [{ item: 'mat/copper', qty: q(12) }] },
      // 30 kg：蒸发器/冷凝器铝翅片，0.12 mm 铝箔约 25 kg + 边框
      { anyOf: [{ item: 'mat/aluminium', qty: q(30) }] },
      // 60 kg：氨压缩机缸体/缸盖 HT200
      { anyOf: [{ item: 'mat/iron-ht200', qty: q(60) }] },
      // 25 kg：曲轴、连杆、阀片、风机轴、双金属片钢侧
      { anyOf: [{ item: 'mat/steel-45', qty: q(25) }] },
      // 1 kg：6 kW/380 V 镍铬丝 R=24 Ω、φ1.5 mm 长 38.6 m 重 0.54 kg，取 1 kg 含引线
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1) }] },
      // 60 kg：风道/机组 12 m² 保温，50 mm 矿棉 100 kg/m³
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(60) }] },
      // 6 kg：温控器座、接线板、风阀叶片
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(6) }] },
      // 0.05 kg：温控器/接触器银触点（本层银 95%）
      {
        anyOf: [
          {
            item: 'mat/silver',
            qty: q(1, 20),
            need: [{ param: 'purity', kind: 'range', min: 95, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      // 40 kg 25–30% 氨水（按 25% 下限）→ 10 kg NH3 + 30 kg 水（蒸馏塔提浓）
      {
        anyOf: [
          {
            item: 'mat/ammonia',
            qty: q(40),
            need: [{ param: 'concentration', kind: 'range', min: 25, max: 30 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      // 1 kg：法兰垫片、阀杆填料
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
      // 2 kg：氨工质干燥用石灰（CaO + H₂O → Ca(OH)₂；10 g 水只要 31 g 石灰，2 kg 是床层余量）
      { anyOf: [{ item: 'mat/lime', qty: q(2) }] },
      // 3 台 7.5 kW：蒸发器风机 1（轴功率 1.1 kW）+ 压缩机 1（3.7 kW）+ 冷凝器风机 1（0.5 kW）
      { anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(3) }] },
      // 3 只：压缩机、风机、加热器各一只
      { anyOf: [{ item: 'std/contactor-general', qty: q(3) }] },
      // 4 套：风机轴 2 + 压缩机曲轴 2
      { anyOf: [{ item: 'std/bearing-general-p0', qty: q(4) }] },
      // 2 只：6 kW 加热器接线柱绝缘
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh:
          '焊机组箱体 2.0×1.2×1.5 m、500×500 风道 12 m、凝水盘与 φ25 排水管；内贴 50 mm 矿棉，外皮 1 mm 钢板',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh: '浇氨压缩机缸体/缸盖（HT200，缸径 φ80、行程 60）与风机蜗壳',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1300, max: 1500 }],
      },
      {
        note_zh:
          '车压缩机曲轴/连杆/阀座、风机轴、蒸发器管板与弯头；压缩机与风机按 7.5 kW/4 极电机配皮带轮',
        performedBy: 'lathe',
      },
      {
        note_zh:
          '把 6 kW 镍铬丝绕在氧化铝骨架上（380 V、24 Ω、φ1.5 mm × 38.6 m）；加热器接线柱装瓷绝缘子',
        performedBy: 'plant/winder',
      },
      {
        note_zh:
          '氨提浓：40 kg 25–30% 氨水进蒸馏塔，塔釜 40–80 °C、塔顶 25 °C 冷凝（1.0 MPa）得 10 kg NH3（≥99.5%），塔底 30 kg 水/稀氨水回 make/ammonia；石灰干燥氨工质到水 ≤0.1%（舱内空气除湿只走凝水盘，不用干燥剂）',
        performedBy: 'plant/distillation-tower',
        under: [
          { param: 'pressure', min: 300, max: 1000 },
        ],
      },
      {
        note_zh:
          '总装：压缩机、蒸发器（φ16 不锈钢管 60 m + 铝翅片）、风冷冷凝器、风机、6 kW 加热器、双金属温控器、3 只接触器与接线；抽真空、充 10 kg 氨、检漏；凝水盘接 φ25 排水',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '在恒温间整定双金属片：19–21 °C 下测通断点，调触点螺钉到死区 ≤1 K；干湿球温度计读 RH（两支 0–60 °C、1 °C 分度双金属温度计，湿球包纱布，±5%）；按 ≤55% RH 整定，留 5% 给量具误差',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(120) },
    unbalanced_zh:
      '钢 300 + 不锈钢 100 + 铜 12 + 铝 30 + 铸铁 60 + 45 钢 25 + 镍铬丝 1 + 矿棉 60 + 酚醛 6 + 银 0.05 + 氨水 40 + 石灰 2 + PTFE 1 = 637.05 kg → 机组 1 台（本体约 580 kg，含 10 kg 无水氨，按 25% 氨水下限折）+ 提浓排水 30 kg（回 make/ammonia）+ 边角/浇冒口/调试 27.05 kg；3 台电机、3 只接触器、4 套轴承、2 只绝缘子按件计，不计入 kg 账',
  },

  {
    /**
     * **门联锁柜：两只微动开关 + 两只中间继电器 + 一只 100 kV 接触器 + 机械联锁板。**
     *
     * 物料（kg）：
     *   钢 100 + 不锈钢 10 + 铜 28 + 银 0.3 + 酚醛 10 + 45 钢 12
     *   + 漆包线 3 + 硅钢 8 = 171.3 kg
     * → 联锁柜 1 台（约 155 kg）+ 边角/线头/调试 16.3 kg
     *   + 2 只中间继电器、4 只瓷套管（按件计）
     *
     * 双通道：SW1（门关）→ K1a；SW2（门锁）→ K1b；K1a、K1b 的常开触点串联
     * 驱动 K2 线圈。任一门开关断开 → 对应继电器释放 → K2 失电 → 高压断。
     * 一只中间继电器触点粘连时，另一只仍能断开 K2；K2 主触点粘连才是残余风险。
     *
     * 微动开关：45 钢簧片 + 银触点 + 酚醛座。**本该是磷青铜簧片**，但本层没有
     * 磷青铜/黄铜条目（全表 0 命中），用 0.15 mm 45 钢片代 ——
     * 弹性后效大、易疲劳。这是 R8 降级，升级路线见文件头 G5
     * （补 Cu-6Sn-0.2P 合金路线；`mat/copper`、`mat/tin`、`mat/phosphorus`
     * 三样都有，缺的是合金与轧制）。
     */
    id: 'make/pd-cell-interlock',
    name: 'PD 门联锁制造',
    produces: [
      {
        item: 'plant/pd-test-cell/interlock',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 100000, max: 150000 },
          { param: 'current', kind: 'range', min: 1, max: 10 },
          { param: 'tripTime', kind: 'range', min: 50, max: 100 },
          { param: 'channels', kind: 'range', min: 2, max: 2 },
          { param: 'contactResistance', kind: 'range', min: 100, max: 500 },
          { param: 'clearance', kind: 'range', min: 300, max: 350 },
        ],
      },
    ],
    uses: [
      // 100 kg：联锁柜 1.2×0.8×0.8 m 的 1.5 mm 钢板约 60 kg + 门框/安装板/电缆槽/框架 40 kg
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(100) }] },
      // 10 kg：高压接触器触头座、灭弧角、不锈钢紧固件
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(10) }] },
      // 28 kg：主回路铜排 30×5 mm × 3 m = 4 kg；触点/触指/接线 8 kg；屏蔽/接地铜排 16 kg
      { anyOf: [{ item: 'mat/copper', qty: q(28) }] },
      // 0.3 kg：微动开关 2×0.002 + 高压接触器 0.29（中间继电器是成品件，触点已含）
      { anyOf: [{ item: 'mat/silver', qty: q(3, 10) }] },
      // 10 kg：微动开关座、继电器底座、绝缘板、端子排、面板
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(10) }] },
      // 12 kg：簧片 2×0.005、弹簧/衔铁/铰链/螺栓 11.99
      { anyOf: [{ item: 'mat/steel-45', qty: q(12) }] },
      // 3 kg：高压接触器合闸/分闸线圈（两只中间继电器用 std/contactor-general，不再单列漆包线）
      { anyOf: [{ item: 'mat/enamel-wire', qty: q(3) }] },
      // 8 kg：高压接触器电磁铁铁芯（中间继电器是成品件）
      { anyOf: [{ item: 'mat/silicon-steel-3si', qty: q(8) }] },
      // 2 只中间继电器（10–60 A 接触器当继电器用，线圈 220 V）
      { anyOf: [{ item: 'std/contactor-general', qty: q(2) }] },
      // 4 只瓷套管：高压接触器每只 25 kV，串联 100 kV
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(4) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh:
          '焊联锁柜 1.2×0.8×0.8 m、门框联锁板、电缆槽；面板开孔，柜内装酚醛绝缘板',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh:
          '车微动开关顶杆、高压接触器触头/灭弧角/衔铁；铰链销 φ12；接触器开距按 300 mm 配',
        performedBy: 'lathe',
      },
      {
        note_zh: '绕高压接触器合闸/分闸线圈（220 V，漆包线）；两只中间继电器用 std/contactor-general',
        performedBy: 'plant/winder',
      },
      {
        note_zh:
          '装微动开关（0.15 mm 45 钢簧片 + 银触点 + 酚醛座）、两只中间继电器、空气绝缘高压接触器、4 只瓷套管与接线；机械联锁板与门框配作',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '动作试验：门开 → 高压断；门关未锁 → 高压断；门关 + 锁 → 允许合闸。记录动作时间 50–100 ms 与各触点通断；每 500 次复测（本层没有寿命试验台，见 G5）',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(80) },
    unbalanced_zh:
      '钢 100 + 不锈钢 10 + 铜 28 + 银 0.3 + 酚醛 10 + 45 钢 12 + 漆包线 3 + 硅钢 8 = 171.3 kg → 联锁柜 1 台（约 155 kg）+ 边角/线头/调试 16.3 kg；2 只中间继电器、4 只瓷套管按件计，不计入 kg 账',
  },

  {
    /**
     * **放电棒：车铜棒 → 弯挂钩 → 编编织带 → 装酚醛手柄。**
     *
     * 物料（kg）：
     *   铜 1.6 + 铜线 0.6 + 酚醛 0.35 + PTFE 0.03 = 2.58 kg
     * → 放电棒 1 支约 1.83 kg（铜棒 1.06 + 编织带 0.45 + 手柄 0.20 + 挂钩/端子 0.10 + 端盖 0.02）
     *   + 车屑/编织边角 0.75 kg
     *
     * 铜棒 1.06 kg 的算法：π×(0.005)²×1.5×8960 = 1.055 kg。
     * 手柄 0.20 kg 的算法：π/4×(0.030²−0.020²)×0.4×1300 = 0.204 kg。
     * 编织带 0.45 kg 的算法：25 mm² × 2 m × 8960 = 0.448 kg。
     */
    id: 'make/pd-cell-discharge-rod',
    name: 'PD 放电棒制造',
    produces: [
      {
        item: 'plant/pd-test-cell/discharge-rod',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 10, max: 10 },
          { param: 'length', kind: 'range', min: 1.5, max: 1.5 },
          { param: 'resistance', kind: 'range', min: 0.005, max: 0.01 },
          { param: 'withstandVoltage', kind: 'range', min: 100, max: 150 },
        ],
      },
    ],
    uses: [
      // 1.6 kg：φ10×1.5 m 铜棒 1.06 kg + 挂钩/端子 0.35 kg + 车屑 0.19 kg
      { anyOf: [{ item: 'mat/copper', qty: q(8, 5) }] },
      // 0.6 kg：25 mm² 编织带 2 m（0.45 kg）+ 编织边角 0.15 kg；由 φ1.0 铜线编成
      { anyOf: [{ item: 'mat/copper-wire', qty: q(3, 5) }] },
      // 0.35 kg：手柄 φ30/φ20×0.4 m（0.20 kg）+ 车屑 0.15 kg
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(7, 20) }] },
      // 0.03 kg：手柄端盖与垫 0.02 kg + 边角 0.01 kg
      { anyOf: [{ item: 'mat/ptfe', qty: q(3, 100) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '车 φ10×1.5 m 铜棒，端部车 M8 螺纹；车酚醛手柄内孔与 PTFE 端盖',
        performedBy: 'lathe',
      },
      {
        note_zh:
          '弯铜挂钩、压接铜端子；剪 φ1.0 铜线定长',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh:
          '编 25 mm² × 2 m 编织带，两端压铜鼻子；装手柄、护环、挂钩、编织带与接地夹；DVM 测通断（本层没有微欧计，0.05 Ω 是设计值，见 G7）',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      '铜 1.6 + 铜线 0.6 + 酚醛 0.35 + PTFE 0.03 = 2.58 kg → 放电棒 1 支约 1.83 kg（铜棒 1.06 + 编织带 0.45 + 手柄 0.20 + 挂钩/端子 0.10 + 端盖 0.02）+ 车屑/编织边角 0.75 kg',
  },

  {
    /**
     * **接地开关：铣铜闸刀 → 车铰链/操作杆 → 装瓷绝缘子 → 与门框联锁板配作。**
     *
     * 物料（kg）：
     *   铜 6 + 45 钢 2 + 酚醛 1 + 银 0.05 + 不锈钢 2 + 钢板 5 = 16.05 kg
     * → 接地开关 1 台约 14.8 kg + 边角/车屑 1.25 kg
     *   + 4 只瓷绝缘子（按件计）
     *
     * 闸刀 30×6×400 mm = 0.64 kg；200 A 下电流密度 1.1 A/mm²，1 kA/1 s 下
     * 5.6 A/mm²，都在铜的短时允许范围内。300 mm 开距对 100 kV 是 0.33 kV/mm，
     * 空气击穿约 3 kV/mm，有 9 倍余量。
     */
    id: 'make/pd-cell-ground-switch',
    name: 'PD 接地开关制造',
    produces: [
      {
        item: 'plant/pd-test-cell/ground-switch',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 100000, max: 150000 },
          { param: 'current', kind: 'range', min: 200, max: 400 },
          { param: 'contactResistance', kind: 'range', min: 50, max: 200 },
          { param: 'clearance', kind: 'range', min: 300, max: 350 },
        ],
      },
    ],
    // 闸刀、铜排、编织带、触点、铰链、操作杆、底座、紧固件、4 只绝缘子在 composedOf 上。
    uses: [],
    needs: [],
    steps: [
      {
        note_zh:
          '装 4 只瓷绝缘子、闸刀、铜排、编织带、铰链、酚醛操作杆与底座；调接触压力与分合到位',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '与门框联锁板配作：门关挡操作杆，合闸后操作杆伸进门框挡门；量接触电阻 ≤200 µΩ 与 300 mm 开距',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(32) },
    unbalanced_zh:
      '铜 6 + 45 钢 2 + 酚醛 1 + 银 0.05 + 不锈钢 2 + 钢板 5 = 16.05 kg → 接地开关 1 台约 14.8 kg + 边角/车屑 1.25 kg；4 只瓷绝缘子按件计，不计入 kg 账',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PD_CELL_CLIMATE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PD_CELL_CLIMATE_ROUTES];
