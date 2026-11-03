/**
 * 回流焊 —— 把焊膏/焊球变成焊点的那四台机器，以及它们怎么被造出来。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 这一份接的是什么
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `data/material/solder.ts` 给出了料：SAC305 锭、丝、预成型片、焊球、片状焊粉、
 * 85 % 金属含量的焊膏、ZnCl₂ 助焊剂、冲压钢网。**料不会自己变成焊点。**
 *
 * 一台 BGA 从"芯片 + 板子"到"焊上了"，要走四步，每一步一台机器：
 *
 *   丝印/点胶   `plant/solder-printer`   钢网刮一刀，或点胶针点一下
 *   贴片       `plant/pick-place`      把元件放到焊膏上，±0.05 mm
 *   回流       `plant/reflow-furnace`  四温区一次过带，峰值 235–245 °C
 *   返修       `plant/rework-station`  拆下来、清焊盘、重植球、再焊回去
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一个绕不开的前提：这四台机器都得是**加压箱**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 焊膏的液体载体是水（ZnCl₂ 水溶液，见 solder.ts）。而火星车间是 **0.6 kPa** ——
 * 水在 **0.01 °C** 就沸。也就是说：一块印好焊膏的板子，在敞开的车间里放着，
 * 十几分钟就干成粉，还没贴片就废了。
 *
 * 所以四台机器的 `holds` 里都有 **pressure 100–500**，而且都是"箱体 + 闸/手套口"：
 *
 *   丝印机   箱体（前面一块玻璃观察窗）  —— 膏在箱里开着，印刷时不许干
 *   贴片机   箱体 + 两个手套口          —— 元件盘也在箱里，不然料带上的胶先干
 *   回流炉   炉膛本身就是腔体（两端挡帘）  —— 0.6 kPa 下 240 °C 的焊膏会**炸锡**
 *   返修台   箱体 + 手套口              —— 返修是敞开操作，更要在箱里
 *
 * 这不是"加严"，是这一层反复出现的那条（wet-bench、electrolyzer、plating-bath、
 * acid-plant 全一样）：**液相工序在 0.6 kPa 上不成立，除非把它关进加压腔。**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 回流曲线：炉子怎么定尺寸的（算式，不是拍的）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * SAC305 的窗口（solder.ts 文件头④）：预热 150–180、均温 180–200（60–90 s）、
 * **>217 °C 保持 60–90 s**、峰值 235–245、冷却 ≤4 K/s。
 *
 * 炉膛定 **1.6 m，四区各 400 mm**（预热 / 均温 / 回流 / 冷却），带速 v：
 *
 *   液相线以上时间 = 400 mm ÷ v
 *     v = 0.3 m/min = 5.00 mm/s → **80 s** ✓（窗口 60–90 的中间）
 *     v = 0.4 m/min = 6.67 mm/s → **60 s** ✓（下限）
 *     v = 0.5 m/min = 8.33 mm/s → **48 s** ✗（差 12 s = 20 %）
 *
 *   ⇒ **带速窗 0.3–0.4 m/min**，不是任务书写的 0.3–0.5。要用 0.5 就得把回流区
 *   从 400 加到 500 mm（炉膛 1.7 m）。这一条写在这里，因为它是这一份唯一
 *   "算出来与任务书不一样"的地方。
 *
 *   全程时间：1.6 m ÷ v → 0.3 时 320 s、0.4 时 240 s（工业 4–6 min，对得上）。
 *
 * 控温精度够不够？**不够，差 2–3 倍。**
 *
 *   本层没有镍铬-镍硅（K 型），只有铜与铁两种金属丝可拉 ⇒ 铜-铁热电偶，
 *   Seebeck **13 µV/K**（T 型 43、K 型 41）。毫伏表 0.1 mV/格 ⇒ **7.7 K/格**
 *   （T 型式子是 2.4 K/格）。
 *   加热是接触器通断（`std/contactor-general`，没有 PID、没有可控硅），
 *   245 °C 上过冲 10–15 K ⇒ **实际炉温在设定值 ±10–15 K 上摆**。
 *   而峰值窗口 235–245 只有 **10 K** 宽 < 摆动 20–30 K。
 *
 *   ⇒ 峰值不是"控"出来的，是**撞**出来的，撞完用两种"熔断指示片"验：
 *       一片 SAC305（217–220）化了  → 到过液相线
 *       一片纯锡（**232.0 °C**）化了 → 峰值 ≥232
 *     232.0 是这一层唯一有料的金属定点（euv-metals.ts:208 那句话），这里正好用上。
 *     245 这个上限**测不了**：232 与 419.5（Zn）之间没有可用的纯金属定点，
 *     只能靠试片的塌陷与桥连目视判 —— 见降级③（同源）。
 *
 *   炉子真正可控的那一个量是**带速**（链轮齿数 + 减速比，纯机械，±1 %），
 *   所以本层的工艺是"定带速、分区定功率、每炉带试片"，不是"定曲线"。
 *   这也是工业 1980 年代回流焊的做法（温区固定、带速调），后来才变成 PID 分区控温。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 贴片：靠治具，不靠视觉（与 solder.ts 文件头⑤同一件事，这里是设备侧）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   · `plant/robot` 没有定位精度这个属性（props 只有 node 7–500 nm、dof 20–40）——
 *     它是"会动的手"，它的活是上下料，不是对位。
 *   · 对位靠**销钉 + 挡块**：治具板（`plant/pick-place/jig`）上的两个 φ3 销把
 *     PCB 钉死在同一位置，绝对位置误差由销与孔的配合（H7/g6，间隙 5–20 µm）吸收，
 *     剩下的只有台子的**重复定位 ±0.05 mm**（unblock-crucible-drive.ts:109/352/531：
 *     手轮 1 mm/圈、刻度盘 100 格读到 0.01、游标读到 0.005）。
 *   · **视觉这条路是断的**（本层没有面阵摄像机，litho-m3.ts:2498）；
 *     `plant/particle-scanner` 是单点扫描的颗粒计数器（它数尘埃），
 *     `plant/edge-aligner` 的 22 nm 是光栅相位对准（相对相位，不是绝对坐标）。
 *     把 22 nm 的对准器装在贴片机上，是 edge-aligner.ts:1276 自己批评过的那个笑话。
 *
 *   通量：一次取放 = 移到位 0.5 s + 夹持 0.3 s + 抬起 0.3 s ≈ **1.1 s**，
 *   加换料与停顿，**800–1 500 点/h**。工业贴片机 20 000–30 000 点/h ⇒ **差 15–25 倍**。
 *   一块 300 点的板子要 12–22 min。见降级②。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 降级与升级（R8）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **峰值温度 245 °C 的上限不可知**（±10–15 K 靠撞）。
 *      升级：K 型热电偶 + 记录仪（要镍硅 —— 本层有镍铬丝，没有镍硅），或
 *      氧化锆氧电池（700 °C + 参考气，本层没有）。缺口：窗口 10 K vs 摆动 20–30 K，
 *      **判不了**。不升级的后果：偶尔过烧（焊球塌成饼、桥连），靠目视漏检。
 *
 *   ② **贴片 800–1 500 点/h，工业 20 000–30 000**（差 15–25 倍），精度 ±0.05 踩线。
 *      升级：面阵摄像机（像素要 CCD/CMOS ⇒ L4 半导体，本层到 L2）+ 质心算法，
 *      或多贴装头并联（4 头 = 3 200–6 000 点/h，仍差 5 倍）。
 *      缺口：通量 15–25 倍；精度 0.4 mm 球距（1.4 倍）。
 *
 *   ③ **炉内氧含量不知道**。
 *      回流用氮气挡帘吹扫（`mat/nitrogen` 有路线），但**没有氧分析仪**，按经验流量吹，
 *      实际炉内氧按 1 000–5 000 ppm 记（工业要求 <1 000 ppm、无铅最好 <500）。
 *      后果：氧化渣多 2–3 倍、润湿角从 20–30° 涨到 40–50°、0.4 mm 球距的桥连挑不出来。
 *      升级：氧化锆氧电池或顺磁分析仪。缺口：**5 000 → 500 ppm（10 倍）**。
 *
 *   ④ **四温区没有独立调功**（只有接触器通断，没有相控/可控硅）。
 *      升级：可控硅调功 + 运放 PID（`std/opamp-chip-general` + `std/zener-reference-general`
 *      都在白名单里，缺的是功率级 —— `std/power-device-general` 是几十安的晶体管，
 *      带不动 3 kW 的炉丝）。缺口：摆动 20–30 K → 5 K（4–6 倍）。
 *
 *   ⑤ **返修对位 ±0.1 mm，比贴片差 2 倍**（双目镜 + 手拧微调螺钉，没有图像）。
 *      升级：同②（摄像机）。缺口：0.1 → 0.05 mm。后果：只能返修 0.8 mm 球距以上。
 *
 *   ⑥ **钢网是冲压低碳钢，500 次就换**（见 solder.ts 的 std/solder-stencil-general）。
 *      升级：激光切割不锈钢（要一台 100 W 脉冲激光 + 振镜，本层没有；不锈钢条目也不在
 *      投料白名单里）。缺口：寿命 10 倍、印刷厚度不均 20 % → 5 %。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 已知缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * · **焊点质量测不了。** 拉剪要一台拉力机（本层没有：`plant/press` 是压不是拉），
 *   所以试片的 `shear 3–6 N` 是**按金属间化合物厚度与断口目视估的**，不是测的。
 *   X 光看空洞、超声看分层、切片看 IMC —— 三样都没有。
 * · **PCB 不在这一份里**（同 solder.ts 的缺口）：试片用的是 `std/lead-frame-general`
 *   （引线框）当基板，不是真的印制板。等覆铜板链建起来，这一条要改成 PCB。
 * · **四温区的炉膛温度分布写不进来**：模型没有"横向温差"这个量，也没有测它的
 *   手段（要一排热电偶 + 记录仪）。所以"±10–15 K"只是一个数，不是分布。
 * · **传送带速度与温区长度的配比没法验**：`rate` 写的是批次小时，而带速是连续量。
 *   本文件把"一片 1 h"写进 `rate`（其中**炉内只有 4–5 min**，其余是印、贴、洗、检），
 *   这是折算，不是模型能表达的东西。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const REFLOW_ITEMS: readonly Item[] = [
  // ═════════════════════════════════════════════════════════════════════════
  // 一、四台设备
  //
  // 四台的 `composedOf` 都只用自己的专用件（`plant/<machine>/<part>`）——
  // 没有 `std/bearing-6205` 这类标准件，因为本文件不写它们的路线，
  // 而"装一个没有来历的轴承"正是 CONVENTIONS 第 6 条要禁的那种第二处真相。
  // 专用件各自有路线，见下面的 REFLOW_ROUTES。
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * 回流焊炉。四温区隧道炉：预热 / 均温 / 回流 / 冷却，各 400 mm，共 1.6 m。
   *
   * `zones` 4、`beltSpeed` 0.3–0.4 m/min（额定 0.05–1）、`tolerance` ±10–15 K ——
   * 最后这个数**不能取 5**：铜-铁热电偶 + 通断控温只到这一档（见文件头算式）。
   * 它就是"这台炉子比工业炉差在哪"的量化：工业炉 ±2–3 K。
   *
   * 传送是**链板带**不是编织网带：编网要织机（本层没有），而链板带是冲压 + 销轴，
   * `plant/press` 与 `lathe` 都现成。代价是链板节距 12.7 mm 上有 1–2 mm 的台阶，
   * 薄板在上面会有 0.1–0.2 mm 的跳动 —— 对 BGA 无影响（贴完片已经靠焊膏粘住），
   * 对 0402 那种小件有影响（本层也贴不了那么小的）。
   */
  {
    id: 'plant/reflow-furnace',
    name: '回流焊炉',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'zones', kind: 'range', min: 1, max: 8, unit: '区', dir: 'atLeast' },
      { param: 'beltSpeed', kind: 'range', min: 0.05, max: 1, unit: 'm/min' },
      { param: 'tolerance', kind: 'range', min: 0, max: 30, unit: 'K', dir: 'atMost' },
    ],
    holds: [
      { param: 'temperature', min: 100, max: 300 },
      // 焊膏的载体是水：0.6 kPa 下 0.01 °C 就沸，240 °C 的膏会炸锡。
      { param: 'pressure', min: 100, max: 500 },
    ],
    composedOf: [
      { item: 'plant/reflow-furnace/tunnel', qty: q(1) },
      { item: 'plant/reflow-furnace/zone-heater', qty: q(4) },
      { item: 'plant/reflow-furnace/belt', qty: q(1) },
      { item: 'plant/reflow-furnace/blower', qty: q(1) },
      // 铜-铁热电偶 4 支，一区一支。少一支就少一个温区的读数 ——
      // 而本层本来就只有 7.7 K/格 的分辨率（T 型式子是 2.4）。
      { item: 'plant/reflow-furnace/sensor', qty: q(4) },
    ],
  },

  /**
   * 丝印机 / 点胶机。**一台机器两种用法**，所以条目名不叫"印刷机"：
   *
   *   丝印模式  钢网绷在框上、刮刀走一趟、脱模 —— 印焊膏（开口 0.4 mm 以上）
   *   点胶模式  拆钢网、换点胶针（φ0.3 内孔）、逐点点助焊剂 —— 贴球与返修用
   *
   * 两种模式的共同点是"计量"：丝印计量的是**体积**（开口面积 × 板厚），
   * 点胶计量的是**时间 × 压力**（每次 0.5–2 s）。本层没有计量泵，
   * 点胶的重复性靠"针孔 + 恒定气压 + 定时"，所以点与点之间 ±15 %
   * （计量泵是 ±2 %）—— 对助焊剂够用（它只要"有"），对焊膏不够（那才是体积）。
   */
  {
    id: 'plant/solder-printer',
    name: '丝印机 / 点胶机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'aperture', kind: 'range', min: 0.1, max: 5, unit: 'mm', dir: 'atLeast' },
      { param: 'throughput', kind: 'range', min: 10, max: 500, unit: '片/h', dir: 'atLeast' },
    ],
    holds: [
      { param: 'temperature', min: 20, max: 30 },
      // 箱体：膏在箱里开着，印刷那 30 s 不许干。
      { param: 'pressure', min: 100, max: 500 },
    ],
    composedOf: [
      { item: 'plant/solder-printer/chamber', qty: q(1) },
      { item: 'plant/solder-printer/squeegee', qty: q(1) },
      { item: 'plant/solder-printer/clamp', qty: q(1) },
      { item: 'plant/solder-printer/table', qty: q(1) },
    ],
  },

  /**
   * 贴片机。X-Y 丝杠台 + 单贴装头 + 治具板，装在加压箱里，人从手套口换料盘。
   *
   * `positioning` 50 µm 是**重复定位**（治具销把绝对位置消掉之后剩下的那一项）——
   * 而 `plant/robot` 的 props 里根本没有这一项。这两个数不是同一个东西：
   * 绝对位置 ±0.07、重复定位 ±0.05（unblock-crucible-drive.ts:531）。
   *
   * 贴装头是**机械夹爪**，不是真空吸嘴：本层没有独立的真空泵条目
   * （`plant/evaporator/pump` 是蒸发台的一部分，不能拆出来单用）。
   * 机械夹爪的下限是 1.0 × 0.5 mm（0603）：再小夹不住、放不准。
   * BGA 的本体有几毫米，夹得住 —— 所以要贴的不是"小"，是"准"。
   */
  {
    id: 'plant/pick-place',
    name: '贴片机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'positioning', kind: 'range', min: 0, max: 200, unit: 'µm', dir: 'atMost' },
      { param: 'throughput', kind: 'range', min: 100, max: 20000, unit: '点/小时', dir: 'atLeast' },
      { param: 'ballPitch', kind: 'range', min: 0.3, max: 2, unit: 'mm', dir: 'atLeast' },
    ],
    holds: [
      { param: 'temperature', min: 20, max: 28 },
      { param: 'pressure', min: 100, max: 500 },
    ],
    composedOf: [
      { item: 'plant/pick-place/chamber', qty: q(1) },
      { item: 'plant/pick-place/gantry', qty: q(1) },
      { item: 'plant/pick-place/head', qty: q(1) },
      { item: 'plant/pick-place/jig', qty: q(1) },
    ],
  },

  /**
   * 返修台。热风 + 底部预热 + 双目对位镜 + 微调螺钉，装在手套箱里。
   *
   * 为什么必须有它：BGA 是**焊在底面看不见**的封装，一个球虚焊，整块板报废 ——
   * 一块主板几十个 BGA，良率按 99.9 %/球算是撑不住的。返修台把"报废"变成"重来"。
   *
   * 它的精度来源与贴片机不同：贴片是**台子动**，返修是**人眼 + 手拧**。
   * 双目镜 + 45° 半透镜给出"芯片焊盘与板上焊盘重合"的像，手拧微调螺钉（M4×0.5，
   * 一周 0.5 mm）到两像重合 ⇒ **±0.1 mm**（贴片是 ±0.05，差 2 倍）。
   * 所以返修只保证 0.8 mm 球距以上。
   */
  {
    id: 'plant/rework-station',
    name: '返修台',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'positioning', kind: 'range', min: 0, max: 1000, unit: 'µm', dir: 'atMost' },
      { param: 'nozzle', kind: 'range', min: 2, max: 20, unit: 'mm' },
    ],
    holds: [
      { param: 'temperature', min: 100, max: 320 },
      { param: 'pressure', min: 100, max: 500 },
    ],
    composedOf: [
      { item: 'plant/rework-station/chamber', qty: q(1) },
      { item: 'plant/rework-station/hot-air', qty: q(1) },
      { item: 'plant/rework-station/preheater', qty: q(1) },
      { item: 'plant/rework-station/optics', qty: q(1) },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 二、专用件
  // ═════════════════════════════════════════════════════════════════════════

  /** 炉膛。双层 2 mm 钢板壳 + 高铝砖内衬 + 矿棉保温，两端焊氮气罩与挡帘。 */
  { id: 'plant/reflow-furnace/tunnel', name: '回流焊炉炉膛', unit: '件', category: 'part',
    props: [{ param: 'length', kind: 'range', min: 1000, max: 3000, unit: 'mm' }] },

  /**
   * 加热区。石墨棒 + 瓷管 + 铜引棒，一区一套。
   *
   * 为什么是石墨不是镍铬丝：250 °C 这一段，石墨在氮气里完全不氧化，而且**电阻温度系数
   * 是负的**（越热越导电，自限流），正好抑制局部热点 —— 对一个"没有 PID、只有通断"
   * 的炉子来说，负温度系数是免费的稳定器。代价：电阻率 8–12 µΩ·m 比镍铬（1.1）低
   * 一个量级，所以要短而粗、电流上百安，接头只能**铜排压接**（石墨焊不了）。
   */
  { id: 'plant/reflow-furnace/zone-heater', name: '回流焊炉加热区', unit: '件', category: 'part',
    props: [{ param: 'power', kind: 'range', min: 0.5, max: 8, unit: 'kW' }] },

  /**
   * 链板带。0.8 mm 链板 + φ4 销轴 + 两端链轮，节距 12.7 mm。
   *
   * 不是编织网带（要织机，本层没有）。链板带的坏处是节距台阶 1–2 mm，
   * 好处是**不会像网带那样被焊膏糊住**（网带的网孔一糊就得整条换）。
   */
  { id: 'plant/reflow-furnace/belt', name: '回流焊炉链板带', unit: '件', category: 'part',
    props: [{ param: 'pitch', kind: 'range', min: 5, max: 50, unit: 'mm' }] },

  /** 冷却风机。离心式，叶轮 φ200，风量 300 m³/h，对着冷却区吹。 */
  { id: 'plant/reflow-furnace/blower', name: '回流焊炉冷却风机', unit: '件', category: 'part',
    props: [{ param: 'flow', kind: 'range', min: 50, max: 2000, unit: 'm³/h' }] },

  /**
   * 铜-铁热电偶。φ0.5 铜丝与铁丝在热端熔焊，瓷珠绝缘，冷端接毫伏表。
   *
   * 13 µV/K 是**量出来的**（铜-铁这条腿的 Seebeck 系数；标准 T 型是铜-康铜 43 µV/K，
   * 康铜要 55 % 铜 + 45 % 镍，而本层没有镍）。分辨率的代价写在文件头：
   * 0.1 mV/格 ÷ 13 µV/K = **7.7 K/格**。
   *
   * 还**没有冷端补偿**：冷端就在箱体上（20–28 °C），毫伏表按 0 °C 刻度读，
   * 所以读数偏低 20–28 K —— 这一项比 7.7 K/格 大四倍，是目前最大的系统误差。
   * 判据只能是"每支偶都偏低同样的 20–28 K"（同批标定），于是**相对温差可用、
   * 绝对温度不可用**。这就是"靠熔断指示片验峰值"的直接原因。
   */
  { id: 'plant/reflow-furnace/sensor', name: '回流焊炉铜-铁热电偶', unit: '件', category: 'part',
    props: [{ param: 'sensitivity', kind: 'range', min: 1, max: 60, unit: 'µV/K' }] },

  /** 印刷箱体。2 mm 钢板焊成，前面一块 6 mm 玻璃窗，左侧一个闸门（板子进出）。 */
  { id: 'plant/solder-printer/chamber', name: '丝印机 / 点胶机印刷箱体', unit: '件', category: 'part',
    props: [{ param: 'volume', kind: 'range', min: 50, max: 2000, unit: 'L' }] },

  /**
   * 刮刀。45 钢，刃口 60°，磨到平直度 0.05 mm、刃口直线度 0.02 mm/300 mm。
   *
   * 刃口有一道 0.2 mm 的倒角（"刮刀角度"）：不倒角的刮刀会把焊膏全刮走，
   * 倒角太大又印不满。60° 是 SAC305 焊膏的工业值（黏度高，要陡）。
   */
  { id: 'plant/solder-printer/squeegee', name: '丝印机 / 点胶机刮刀', unit: '件', category: 'part',
    props: [{ param: 'angle', kind: 'range', min: 30, max: 90, unit: '°' }] },

  /** 钢网夹。四点螺旋压紧，张力 30–40 N/cm —— 本层没有张力计，用弹簧秤拉。 */
  { id: 'plant/solder-printer/clamp', name: '丝印机 / 点胶机钢网夹', unit: '件', category: 'part',
    props: [{ param: 'clampForce', kind: 'range', min: 200, max: 2000, unit: 'N' }] },

  /**
   * 印刷台。铸铁台面 + 三个微调螺钉（M6×1，一周 1 mm）+ 真空吸? 没有真空 ——
   * 用**四个弹簧压脚**把板子压平（薄板 1.6 mm 会翘 0.3 mm，压不平就印不匀）。
   */
  { id: 'plant/solder-printer/table', name: '丝印机 / 点胶机印刷台', unit: '件', category: 'part',
    props: [{ param: 'flatness', kind: 'range', min: 0, max: 0.2, unit: 'mm', dir: 'atMost' }] },

  /** 贴片箱体。钢板焊成，前面两个手套口（φ200，丁腈? 没有橡胶 —— 用帆布袖套）。 */
  { id: 'plant/pick-place/chamber', name: '贴片机贴片箱体', unit: '件', category: 'part',
    props: [{ param: 'volume', kind: 'range', min: 50, max: 2000, unit: 'L' }] },

  /**
   * X-Y 丝杠台。1 mm/格 丝杠 + 100 格刻度盘（读到 0.01）+ 游标（读到 0.005），
   * 行程 300 × 300 mm，重复定位 ±0.05 mm。
   *
   * 与 `plant/laser-stage`（50 nm）差 1 000 倍，但那是激光干涉闭环的台子。
   * 这一台的精度**全在丝杠的磨**上：丝杠中径跳动 2 µm、螺距累积误差 5 µm/300 mm，
   * 磨完用 `std/calibrated-scale-100` 反标（10 nm/100 mm 的尺，用它标 5 µm 的丝杠
   * 是千倍余量，属于"拿干涉仪量钢卷尺"，但没有更粗的尺了）。
   */
  { id: 'plant/pick-place/gantry', name: 'X-Y 丝杠台', unit: '件', category: 'part',
    props: [{ param: 'repeatability', kind: 'range', min: 0, max: 500, unit: 'µm', dir: 'atMost' }] },

  /**
   * 贴装头。两指机械夹爪（弹簧闭合、凸轮张开）+ Z 向 20 mm 行程 + 转角 0–90°。
   *
   * 夹指淬硬到 HRC 45 后磨，指尖 0.3 mm 宽；张开量 1–12 mm（靠换夹指）。
   * 没有真空吸嘴（本层没有独立真空泵条目），所以**元件不能小于 1.0 × 0.5 mm**。
   */
  { id: 'plant/pick-place/head', name: '贴片机贴装头', unit: '件', category: 'part',
    props: [{ param: 'stroke', kind: 'range', min: 5, max: 100, unit: 'mm' }] },

  /**
   * 治具板。45 钢，两个 φ3 销（H7/g6）+ 三个挡块 + 一套料盘座。
   *
   * **它是整台贴片机精度的真正来源**：销把 PCB 钉在固定位置，绝对位置误差被
   * 销孔间隙（5–20 µm）吸收，剩下的只有台子的重复定位。所以同一个板型只要
   * 一副治具，而**换板型要换治具**（这就是为什么小批量贵）。
   */
  { id: 'plant/pick-place/jig', name: '贴片机治具板', unit: '件', category: 'part',
    props: [{ param: 'positionError', kind: 'range', min: 0, max: 1, unit: 'mm', dir: 'atMost' }] },

  /** 返修箱体。钢板焊成 + 前面一块玻璃 + 两个手套口（返修是敞开操作）。 */
  { id: 'plant/rework-station/chamber', name: '返修台返修箱体', unit: '件', category: 'part',
    props: [{ param: 'volume', kind: 'range', min: 20, max: 500, unit: 'L' }] },

  /** 热风嘴。φ0.3 铜丝绕在瓷管上，φ8 出风口，250–300 °C，风量 5 L/min。 */
  { id: 'plant/rework-station/hot-air', name: '返修台热风嘴', unit: '件', category: 'part',
    props: [{ param: 'power', kind: 'range', min: 0.1, max: 5, unit: 'kW' }] },

  /** 底部预热板。铸铁板 100 × 100 × 10，内埋铜丝，100–150 °C（减小热应力）。 */
  { id: 'plant/rework-station/preheater', name: '返修台底部预热板', unit: '件', category: 'part',
    props: [{ param: 'power', kind: 'range', min: 0.1, max: 5, unit: 'kW' }] },

  /**
   * 双目对位镜。两块 45° 半透镜把芯片底面与板上焊盘叠成一个像，放大 20×。
   *
   * 透镜是**磨出来的玻璃**，不是光学抛光的（面形 λ/2，不是 λ/10）——
   * 对位只要看得见两个焊盘圈，不需要分辨 0.1 µm。这是这一层"降级换得掉精度、
   * 换不掉功能"的一个正常例子。
   */
  { id: 'plant/rework-station/optics', name: '返修台双目对位镜', unit: '件', category: 'part',
    props: [{ param: 'magnification', kind: 'range', min: 2, max: 100, unit: '×' }] },

  // ═════════════════════════════════════════════════════════════════════════
  // 三、试片 —— 这一份唯一的"产品"
  //
  // 为什么是试片而不是"一块焊好的主板"：主板不存在（PCB 链不在这一层，
  // 见文件头缺口）。所以回流工艺的验收对象是**试片**：一块引线框 + 一排
  // 0.8 mm 球距的焊盘，焊完拉剪、目视、留样。工业叫 daisy-chain coupon。
  //
  // 它是 `part` 不是 `material`：按片计、有归属（回流工艺的验收件）、有来历。
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * 回流试片。`std/lead-frame-general` 加一排焊盘，印膏/置球后回流，做拉剪与目视。
   *
   * `ballPitch` 是这条工艺**能交付的最小球距**，不是试片的设计值 ——
   * 属性系统的窗口就是这个意思：同一种试片，两条路线交付两个能力。
   */
  {
    id: 'std/solder-coupon-general',
    name: '回流试片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'ballPitch', kind: 'range', min: 0.3, max: 1.27, unit: 'mm', dir: 'atLeast' },
      { param: 'shear', kind: 'range', min: 0, max: 100, unit: 'N', dir: 'atLeast' },
    ],
  },
];

export const REFLOW_ROUTES: readonly Route[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 一、回流炉的五个零件
  // ─────────────────────────────────────────────────────────────────────────

  {
    /** 炉膛：薄板剪折焊 → 砌高铝砖衬 → 填矿棉 → 焊氮气罩与挡帘。 */
    id: 'make/reflow-tunnel',
    name: '回流焊炉炉膛制造',
    produces: [{ item: 'plant/reflow-furnace/tunnel', qty: q(1), gives: [{ param: 'length', kind: 'range', min: 1600, max: 1600 }] }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1) }] },
    ],
    needs: ['lathe'],
    steps: [
      { note_zh: '① 剪、折、焊双层壳（1.6 m 长，分三段做再拼，整张板没有那么宽）', performedBy: 'plant/sheet-shop' },
      { note_zh: '② 砌高铝砖内衬 + 填矿棉（砖缝 2 mm，错缝砌）', performedBy: 'plant/robot' },
      { note_zh: '③ 焊氮气罩与两端挡帘（挡帘是 0.2 mm 钢片，一片压一片）', performedBy: 'plant/sheet-shop' },
    ],
  },
  {
    /**
     * 加热区：石墨棒车成形 → 穿瓷管 → 烧成 → 铜排压接。
     *
     * 石墨棒在 `lathe` 上车是能车的（石墨自润滑、不粘刀），但**粉尘大**：
     * 车一刀一层黑灰，要在水盆里车（湿车）。这一条与"石墨不能干磨"是同一件事。
     */
    id: 'make/reflow-zone-heater',
    name: '回流焊炉加热区制造',
    produces: [{ item: 'plant/reflow-furnace/zone-heater', qty: q(1), gives: [{ param: 'power', kind: 'range', min: 2.5, max: 3 }] }],
    uses: [
      { anyOf: [{ item: 'mat/carbon', qty: q(1) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '① 车石墨棒（φ20 × 400，湿车，粉尘要压住）', performedBy: 'lathe' },
      { note_zh: '② 穿瓷管、绕引棒、铜排压接（石墨不能焊，只能压 + 螺栓）', performedBy: 'plant/robot' },
      { note_zh: '③ 瓷管烧成 1 300–1 400（一次烧成，不釉）', performedBy: 'plant/kiln', under: [{ param: 'temperature', min: 1300, max: 1400 }] },
    ],
  },
  {
    /** 链板带：冲链板 → 车销轴 → 装配 → 张紧（1.6 m 长，约 500 节）。 */
    id: 'make/reflow-belt',
    name: '回流焊炉链板带制造',
    produces: [{ item: 'plant/reflow-furnace/belt', qty: q(1), gives: [{ param: 'pitch', kind: 'range', min: 12.7, max: 12.7 }] }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['std/stamping-die-general'],
    steps: [
      { note_zh: '① 冲链板（0.8 mm 板，500 片，节距 12.7）', performedBy: 'plant/press' },
      { note_zh: '② 车销轴 φ4 × 13（500 根，两端倒角）', performedBy: 'lathe' },
      { note_zh: '③ 装配与张紧（手装，销轴两端点焊）', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 冷却风机：车轴 → 焊叶轮与蜗壳 → 装。 */
    id: 'make/reflow-blower',
    name: '回流焊炉冷却风机制造',
    produces: [{ item: 'plant/reflow-furnace/blower', qty: q(1), gives: [{ param: 'flow', kind: 'range', min: 280, max: 320 }] }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '① 车主轴与轴承位', performedBy: 'lathe' },
      { note_zh: '② 焊叶轮（8 片后弯）与蜗壳（1.5 mm 板卷焊）', performedBy: 'plant/sheet-shop' },
      { note_zh: '③ 装、动平衡（去重法，试重到 0.5 g·mm）', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 铜-铁热电偶：熔焊热端 → 穿瓷珠 → 标定。
     *
     * 标定这一步是本层唯一能做的"绝对温度"溯源：用纯锡（232.0 °C）、水沸点
     * （但在 0.6 kPa 上水 0.01 °C 就沸，所以用**加压腔里的 100 °C**）、
     * 锌（419.5 °C）三个定点。三点拟合出的曲线在 232 附近的误差 3–5 K。
     */
    id: 'make/reflow-sensor',
    name: '回流焊炉铜-铁热电偶制造',
    produces: [{ item: 'plant/reflow-furnace/sensor', qty: q(1), gives: [{ param: 'sensitivity', kind: 'range', min: 12, max: 14 }] }],
    uses: [
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(1) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 铜丝与铁丝对焊（碳棒电弧，热端熔成小球），穿瓷珠 8 节', performedBy: 'plant/robot' },
      { note_zh: '② 三点标定：纯锡 232.0、加压水 100、锌 419.5（每点保温 5 min 读 3 次）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 二、丝印机的四个零件
  // ─────────────────────────────────────────────────────────────────────────

  {
    /** 箱体：钢板焊 + 玻璃窗 + 闸门。窗用 6 mm 玻璃，压框 + 石棉? 没有石棉 —— 铜垫。 */
    id: 'make/printer-chamber',
    name: '丝印机 / 点胶机印刷箱体制造',
    produces: [{ item: 'plant/solder-printer/chamber', qty: q(1), gives: [{ param: 'volume', kind: 'range', min: 120, max: 120 }] }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: ['lathe'],
    steps: [
      { note_zh: '① 剪折焊箱体（600 × 500 × 400）+ 开窗孔与闸门孔', performedBy: 'plant/sheet-shop' },
      { note_zh: '② 装玻璃窗（铜垫 + 压框，20 个 M5）+ 装闸门与密封条（没有橡胶，用铜垫）', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 刮刀：铣坯 → 磨刃口 → 研平。
     *
     * 刃口直线度是本件唯一的精度：0.02 mm/300 mm。用 `plant/grinder` 磨完，
     * 在 `plant/gauge-block` 的平板上涂红丹研合看接触点（industrially 刮研）。
     */
    id: 'make/printer-squeegee',
    name: '丝印机 / 点胶机刮刀制造',
    produces: [{ item: 'plant/solder-printer/squeegee', qty: q(1), gives: [{ param: 'angle', kind: 'range', min: 58, max: 62 }] }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 铣 60° 刃口斜面（留 0.1 余量）', performedBy: 'plant/milling-machine' },
      { note_zh: '② 磨刃口 + 研合看接触点（平板上涂红丹，30 点/25 mm²）', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** 钢网夹：四点螺旋压紧 + 两根导柱。 */
    id: 'make/printer-clamp',
    name: '丝印机 / 点胶机钢网夹制造',
    produces: [{ item: 'plant/solder-printer/clamp', qty: q(1), gives: [{ param: 'clampForce', kind: 'range', min: 900, max: 1200 }] }],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /**
     * 印刷台：铣台面 → 车三个微调螺钉 → 装弹簧压脚。
     *
     * 台面的平面度 0.02 mm 是印刷厚度的下限：台面翘 0.05，印出来就厚薄差 10 %。
     */
    id: 'make/printer-table',
    name: '丝印机 / 点胶机印刷台制造',
    produces: [{ item: 'plant/solder-printer/table', qty: q(1), gives: [{ param: 'flatness', kind: 'range', min: 0.015, max: 0.02 }] }],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht200', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['plant/grinder', 'plant/metrology-room'],
    performedBy: 'plant/milling-machine',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 三、贴片机的四个零件
  // ─────────────────────────────────────────────────────────────────────────

  {
    /** 贴片箱体：钢板焊 + 两个手套口（帆布袖套 + 铜压环）。 */
    id: 'make/pp-chamber',
    name: '贴片机贴片箱体制造',
    produces: [{ item: 'plant/pick-place/chamber', qty: q(1), gives: [{ param: 'volume', kind: 'range', min: 240, max: 240 }] }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '① 焊箱体 + 开两个 φ200 手套口', performedBy: 'plant/sheet-shop' },
      { note_zh: '② 装袖套（帆布 + 铜压环；没有橡胶，气密靠压环压紧）与闸门', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 丝杠台：车丝杠 → 磨丝杠 → 装导轨与刻度盘。
     *
     * 丝杠是这台机器的全部精度：中径跳动 2 µm、螺距累积 5 µm/300。
     * 磨完之后用 `std/calibrated-scale-100` 反标（它的准确度 10 nm/100 mm），
     * 把螺距误差记成一张表贴在台上 —— 刻度盘读数是"名义位置"，表给出修正。
     * **没有这张表，±0.05 只是重复定位，不是准确度。**
     */
    id: 'make/pp-gantry',
    name: 'X-Y 丝杠台制造',
    produces: [{ item: 'plant/pick-place/gantry', qty: q(1), gives: [{ param: 'repeatability', kind: 'range', min: 40, max: 60 }] }],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/iron-ht200', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 车丝杠（T20×4，长 400）+ 车刻度盘 100 格', performedBy: 'lathe' },
      { note_zh: '② 磨丝杠外圆与中径（跳动 2 µm）', performedBy: 'plant/grinder' },
      { note_zh: '③ 装 V 形导轨、刻度盘、游标，并用 100 mm 校准尺反标螺距', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },
  {
    /** 贴装头：磨夹指 → 铣凸轮 → 装弹簧与 Z 向滑板。 */
    id: 'make/pp-head',
    name: '贴片机贴装头制造',
    produces: [{ item: 'plant/pick-place/head', qty: q(1), gives: [{ param: 'stroke', kind: 'range', min: 20, max: 20 }] }],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 淬火 HRC 45 后磨两片夹指（指尖 0.3 mm 宽，平行度 0.01）', performedBy: 'plant/grinder' },
      { note_zh: '② 铣张开凸轮（升程 10 mm，压力角 <30°）', performedBy: 'plant/milling-machine' },
      { note_zh: '③ 装弹簧（闭合 3 N）、Z 向滑板、转角限位', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 治具板：铣销孔 → 磨销 → 配装挡块与料盘座。
     *
     * 两个 φ3 销孔是**一起镗的**（一次装夹），孔距 200 ±0.01；销与孔 H7/g6，
     * 间隙 5–20 µm。这一对销孔就是整台贴片机的绝对位置基准。
     */
    id: 'make/pp-jig',
    name: '贴片机治具板制造',
    produces: [{ item: 'plant/pick-place/jig', qty: q(1), gives: [{ param: 'positionError', kind: 'range', min: 0.01, max: 0.02 }] }],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['plant/gauge-block', 'plant/metrology-room'],
    steps: [
      { note_zh: '① 一次装夹镗两个 φ3H7 销孔（孔距 200 ±0.01）', performedBy: 'plant/milling-machine' },
      { note_zh: '② 磨销 φ3g6（间隙 5–20 µm），压入', performedBy: 'plant/grinder' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 四、返修台的四个零件
  // ─────────────────────────────────────────────────────────────────────────

  {
    /** 返修箱体：钢板焊 + 玻璃 + 两个手套口。 */
    id: 'make/rw-chamber',
    name: '返修台返修箱体制造',
    produces: [{ item: 'plant/rework-station/chamber', qty: q(1), gives: [{ param: 'volume', kind: 'range', min: 60, max: 60 }] }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 热风嘴：绕铜丝 → 穿瓷管 → 烧成 → 装 φ8 喷嘴。 */
    id: 'make/rw-hot-air',
    name: '返修台热风嘴制造',
    produces: [{ item: 'plant/rework-station/hot-air', qty: q(1), gives: [{ param: 'power', kind: 'range', min: 0.6, max: 1.0 }] }],
    uses: [
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '① 铜丝绕瓷管 120 圈（间距要匀，不匀就局部过热烧断）', performedBy: 'plant/robot' },
      { note_zh: '② 瓷管烧成 1 200–1 300', performedBy: 'plant/kiln', under: [{ param: 'temperature', min: 1200, max: 1300 }] },
    ],
  },
  {
    /** 预热板：铸铁板铣槽 → 埋铜丝 → 灌耐火泥 → 磨平面。 */
    id: 'make/rw-preheater',
    name: '返修台底部预热板制造',
    produces: [{ item: 'plant/rework-station/preheater', qty: q(1), gives: [{ param: 'power', kind: 'range', min: 0.3, max: 0.5 }] }],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht200', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/milling-machine',
  },
  {
    /**
     * 双目对位镜：磨两块物镜 → 磨 45° 半透镜 → 装校。
     *
     * 面形 λ/2（约 0.3 µm）就够：对位要看的是 0.4 mm 的焊盘圈，不是 0.1 µm 的线宽。
     * 所以用 `plant/grinder` 粗磨 + 手工抛，不上抛光机（本层没有沥青盘与松香，
     * 见 unblock-interferometer-flat.ts:212 —— 抛光的那一路整条走不通）。
     */
    id: 'make/rw-optics',
    name: '返修台双目对位镜制造',
    produces: [{ item: 'plant/rework-station/optics', qty: q(1), gives: [{ param: 'magnification', kind: 'range', min: 18, max: 22 }] }],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 粗磨两块物镜与一块 45° 半透镜（面形 λ/2，手工抛）', performedBy: 'plant/grinder' },
      { note_zh: '② 装校（两像重合度 0.1 mm，用 0.4 mm 球距的试片对）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 五、工艺：印膏 / 置球 / 返修
  //
  // 三条都产出同一件 `std/solder-coupon-general`（OR），但交付的球距与拉剪不同 ——
  // 这正是属性系统要表达的东西：**同一个 id，三条路线交付三种能力。**
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 印膏路线：丝印 → 贴片 → 四温区回流 → 水洗 → 拉剪。
     *
     * 交付 **0.8 mm 球距**。为什么不是 0.4：两处卡在 0.4 上 ——
     * 钢网的冲压毛刺（只保证 0.4 mm 开口 = 0.8 mm 球距，见 solder.ts）与贴片的
     * ±0.05 踩线。这两条哪一条松一档，0.4 才成立。
     *
     * 四温区写成三段工序（预热 / 均温 / 回流），因为它们是**三个不同的温度窗口**，
     * 而一段工序只能挂一组条件。冷却不写条件（它不是"维持"，是"放热"）。
     *
     * 清洗那一段是本条路线最要紧的一步：ZnCl₂ 是无机盐助焊剂（J-STD-004 的 IN 类，
     * 工业禁用于电子件），不清就是**在焊点旁边放一撮盐酸**。判据测不了（没有
     * 电导率仪），只能按工艺保证：3 次换水 + 60–70 °C + 最后一道用新的水 + 吹干。
     */
    id: 'make/solder-coupon-printed',
    name: '回流试片制造',
    produces: [{
      item: 'std/solder-coupon-general',
      qty: q(1),
      gives: [
        { param: 'ballPitch', kind: 'range', min: 0.8, max: 1.27 },
        { param: 'shear', kind: 'range', min: 3, max: 6 },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'std/lead-frame-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/solder-paste', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 10) }] },
    ],
    needs: ['std/solder-stencil-general', 'plant/metrology-room'],
    rate: { hours: q(1) },
    steps: [
      { note_zh: '① 钢网印刷焊膏（刮刀 60°、速度 30 mm/s、脱模 1 mm/s；开口 0.4–1.2 mm）', performedBy: 'plant/solder-printer', under: [{ param: 'temperature', min: 20, max: 26 }, { param: 'pressure', min: 100, max: 500 }] },
      { note_zh: '② 贴片（BGA 本体 + 0603 以上阻容；对位靠治具销，±0.05 mm）', performedBy: 'plant/pick-place', under: [{ param: 'temperature', min: 20, max: 26 }, { param: 'pressure', min: 100, max: 500 }] },
      { note_zh: '③ 预热区 150–180（带速 0.3–0.4 m/min，每区 60–80 s）', performedBy: 'plant/reflow-furnace', under: [{ param: 'temperature', min: 150, max: 180 }] },
      { note_zh: '④ 均温区 180–200（助焊剂在这里把活干完 —— ZnCl₂ 的 HCl 逸出温度 150–220）', performedBy: 'plant/reflow-furnace', under: [{ param: 'temperature', min: 180, max: 200 }] },
      { note_zh: '⑤ 回流区 235–250（>217 保持 60–80 s；峰值靠带速撞，用 SAC305 片与纯锡片验）', performedBy: 'plant/reflow-furnace', under: [{ param: 'temperature', min: 235, max: 250 }] },
      { note_zh: '⑥ 冷却区（风冷 4 K/s，240 → 100 用 35 s）', performedBy: 'plant/reflow-furnace' },
      { note_zh: '⑦ 热水洗 3 次（60–70 °C，每次换水；最后一次用新水）+ 吹干', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 60, max: 70 }, { param: 'pressure', min: 100, max: 500 }] },
      { note_zh: '⑧ 拉剪与目视（0.45 mm 球 3–6 N；空洞、桥连、立碑三样目视）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },
  {
    /**
     * 置球路线：点助焊剂 → 放球 → 回流 → 水洗 → 拉剪。
     *
     * 交付 **0.5 mm 球距** —— 比印膏那条好一档，理由很干净：**球已经成形了。**
     * 印膏的瓶颈在"把焊粉印进 0.4 mm 的开口"，置球的瓶颈只在"把 0.34 mm 的球
     * 放到 0.5 mm 的焊盘上"，而后者只要台子准、治具准（±0.05 对 ±0.0625 有余量）。
     *
     * 这条路线在工业上是"BGA 返修补球"与"小批量打样"，不是量产 —— 一颗一颗放太慢。
     * 但在本层它是**唯一能做到 0.5 mm 球距的路**，所以它不是备选，是主力。
     *
     * 放球用**筛板落球**：一块 0.3 mm 厚的不锈钢筛板（孔 φ0.5）盖在治具上，
     * 撒一把球、晃两下，每个孔落一颗 —— 一次 400 颗，比一颗一颗放快 400 倍。
     * 这也是本层唯一"用冲压件而不是用精度"解决吞吐的地方。
     */
    id: 'make/solder-coupon-balled',
    name: '回流试片制造',
    produces: [{
      item: 'std/solder-coupon-general',
      qty: q(1),
      gives: [
        { param: 'ballPitch', kind: 'range', min: 0.5, max: 1.27 },
        { param: 'shear', kind: 'range', min: 4, max: 7 },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'std/lead-frame-general', qty: q(1) }] },
      // 球与片可以互换：一片 φ0.45 的预成型片回熔后就是一颗 φ0.46 的球
      // （体积不变，表面张力把它拉圆）。片还有一个实际的好处 —— **它不滚**，
      // 在筛板上晃的时候不会掉进隔壁的孔里。所以返修与小批量用片、量产用球。
      { anyOf: [{ item: 'mat/solder-ball', qty: q(1, 2000) }, { item: 'mat/solder-preform', qty: q(1, 3000) }] },
      { anyOf: [{ item: 'mat/flux-zinc-chloride', qty: q(1, 2000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(1) },
    steps: [
      { note_zh: '① 点助焊剂（点胶模式，每点 0.1 mg，±15 %）', performedBy: 'plant/solder-printer', under: [{ param: 'temperature', min: 20, max: 26 }, { param: 'pressure', min: 100, max: 500 }] },
      { note_zh: '② 筛板落球（φ0.5 孔，一次 400 颗）+ 治具对位', performedBy: 'plant/pick-place', under: [{ param: 'temperature', min: 20, max: 26 }, { param: 'pressure', min: 100, max: 500 }] },
      { note_zh: '③ 均温区 180–200', performedBy: 'plant/reflow-furnace', under: [{ param: 'temperature', min: 180, max: 200 }] },
      { note_zh: '④ 回流区 235–250（球靠表面张力自己找正，塌陷 10–20 %）', performedBy: 'plant/reflow-furnace', under: [{ param: 'temperature', min: 235, max: 250 }] },
      { note_zh: '⑤ 冷却 + 热水洗 3 次 + 吹干', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 60, max: 70 }, { param: 'pressure', min: 100, max: 500 }] },
      { note_zh: '⑥ 拉剪与目视（0.34 mm 球 4–7 N；球径 CV <15 % 判过）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },
  {
    /**
     * 返修：热风拆 → 清焊盘 → 重植球 → 局部回流 → 水洗 → 拉剪。
     *
     * 交付 0.8 mm 球距（±0.1 mm 的对位，见 `plant/rework-station` 的注释）。
     *
     * 用一件试片换一件试片：这不是"加工"，是**修**。写进模型是为了让"良率"这件事
     * 在数据里有一个落点 —— 没有返修，一块 40 个 BGA 的板子按 99.9 %/球算，
     * 良率是 0.999^(40×400) ≈ 0 —— 那不是悲观，是没有返修时的算术。
     *
     * 拆焊的温度比回流高 20–30 K（290–300）：要熔掉已经长了一层 Cu₆Sn₅ 的旧焊点，
     * 而 Cu₆Sn₅ 的熔点比焊料本身高得多。代价是**焊盘会掉一层铜**（每次拆焊掉
     * 3–5 µm），所以同一块板最多返修 3 次。
     */
    id: 'make/solder-coupon-rework',
    name: '回流试片制造',
    produces: [{
      item: 'std/solder-coupon-general',
      qty: q(1),
      gives: [
        { param: 'ballPitch', kind: 'range', min: 0.8, max: 1.27 },
        { param: 'shear', kind: 'range', min: 2.5, max: 5 },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'std/solder-coupon-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/solder-ball', qty: q(1, 2000) }] },
      { anyOf: [{ item: 'mat/flux-zinc-chloride', qty: q(1, 2000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(1) },
    steps: [
      { note_zh: '① 热风拆焊 290–300（φ8 嘴，20 s；焊盘温度到 250 就够，风温要高）', performedBy: 'plant/rework-station', under: [{ param: 'temperature', min: 290, max: 300 }] },
      { note_zh: '② 清焊盘（烙铁 + 铜丝吸锡带，掉 3–5 µm 铜/次）+ 双目镜对位重植球（±0.1 mm）', performedBy: 'plant/rework-station' },
      { note_zh: '③ 局部回流 235–245（底部预热 100–150，热风 245）', performedBy: 'plant/rework-station', under: [{ param: 'temperature', min: 235, max: 245 }] },
      { note_zh: '④ 热水洗 3 次 + 吹干', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 60, max: 70 }, { param: 'pressure', min: 100, max: 500 }] },
      { note_zh: '⑤ 拉剪（返修过的焊点强度掉 20–50 %：掉的铜让 IMC 界面变薄）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...REFLOW_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/reflow-furnace',
    name: '回流焊炉装配',
    produces: [{
      item: 'plant/reflow-furnace',
      qty: q(1),
      gives: [
      { param: 'zones', kind: 'range', min: 1, max: 8, dir: 'atLeast' },
      { param: 'beltSpeed', kind: 'range', min: 0.05, max: 1, record: 'mat/smt-thermal-profile-record' },
      { param: 'tolerance', kind: 'range', min: 0, max: 30, dir: 'atMost', record: 'mat/smt-thermal-profile-record' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/solder-printer',
    name: '丝印机 / 点胶机装配',
    produces: [{
      item: 'plant/solder-printer',
      qty: q(1),
      gives: [
      { param: 'aperture', kind: 'range', min: 0.1, max: 5, dir: 'atLeast' },
      { param: 'throughput', kind: 'range', min: 10, max: 500, dir: 'atLeast' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/pick-place',
    name: '贴片机装配',
    produces: [{
      item: 'plant/pick-place',
      qty: q(1),
      gives: [
      { param: 'positioning', kind: 'range', min: 0, max: 200, dir: 'atMost' },
      { param: 'throughput', kind: 'range', min: 100, max: 20000, dir: 'atLeast' },
      { param: 'ballPitch', kind: 'range', min: 0.3, max: 2, dir: 'atLeast' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/rework-station',
    name: '返修台装配',
    produces: [{
      item: 'plant/rework-station',
      qty: q(1),
      gives: [
      { param: 'positioning', kind: 'range', min: 0, max: 1000, dir: 'atMost' },
      { param: 'nozzle', kind: 'range', min: 2, max: 20 },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...REFLOW_ROUTES, ...ASSEMBLY_ROUTES];
