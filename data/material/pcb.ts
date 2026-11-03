/**
 * 覆铜板、半固化片与多层印制板 —— 焊料、封装、贴片的落点。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么这一处最要紧
 * ═══════════════════════════════════════════════════════════════════════
 *
 * `data/machine/board.ts:10` 自己写着：
 *
 *   没有覆铜板 → 覆铜板要热压机（本层没有压机）；用**陶瓷板 + 铜柱**
 *
 * 于是本层所有的"板"都是陶瓷板 + 铜柱的替代品，只能放分立元件：一块板几十只
 * 晶体管、几百个绕接点，成本几乎全是人工。而机器人主板要的是 **FR-4 多层板**
 * （玻纤布 + 树脂 + 铜箔，180 °C / 5 MPa 热压）—— 没有它，BGA / QFN / LGA
 * **没有落点**：焊料、封装基板、贴片全都无处可依。
 *
 * 压机的那一半在 `data/machine/hot-press.ts`（本文件的路线指名 `plant/hot-press`）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 五问之一：环氧从哪来
 * ═══════════════════════════════════════════════════════════════════════
 *
 * **本层没有环氧。** 只有酚醛（`mat/phenolic-resin`：苯酚 887 + 甲醛 283 → 1000，
 * make/phenolic-resin，90–100 °C 酸催化）。环氧要两条链：
 *
 *   双酚 A        苯酚 2 + 丙酮 1 → 双酚 A + 水
 *   环氧氯丙烷    丙烯 → 烯丙基氯 → 二氯丙醇 → 环氧氯丙烷（+ 石灰）
 *
 * 两条都卡在**同一个碳数**：丙酮与丙烯都是 C3，而本层唯一的有机入口是
 * C1（甲烷）与 C2（乙炔 → 苯）。**到 C2 为止** —— 乙炔环化成苯可以，成三碳不行。
 * 所以这不是"暂时没建那条路线"，是"这一层的有机化学没有三碳"。
 *
 * 用酚醛板（布基）与 FR-4 的差，四个数（手册值）：
 *
 *   εr @1 MHz        4.8–5.2       FR-4 4.2–4.6
 *   tanδ             0.02–0.04     FR-4 ≈0.02
 *   24 h 吸水        1–3 %         0.1–0.2 %（差 10–20 倍）
 *   z 向 CTE         60–90 ppm/K   FR-4 50–70（Tg 以上 FR-4 更差，酚醛没有 Tg 台阶）
 *
 * 它**不限制层数**，只限制两件事：
 *
 *   ① 吸水 —— 层压前必须烘透（120 °C、4 h），否则层间起泡；成品要真空封装
 *   ② z-CTE 与挥发分 —— B 阶段挥发分 1–2 %，一层排得掉，四层就排不掉
 *
 * 所以本层的天花板是 **4 层、1.2 mm、0.3 mm 线宽**（升级 0.15，见下）。6 层不行的
 * 原因是算得出来的：6 层要一次压 4 张半固化片，挥发分 4 × 1.5 % ≈ 6 % 的树脂重，
 * 在 1.8 mm 的叠层里出不来 → 每 100 cm² 一个分层点；而酚醛第二次受热不流动，
 * 不能"压两次"（工业正是靠多次层压做 6 层以上，那是环氧）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 五问之三：过孔电镀（0.3 mm 孔、深径比 4:1）
 * ═══════════════════════════════════════════════════════════════════════
 *
 * **甲醛有**（`mat/formaldehyde`，make/formaldehyde）—— 还原剂不是问题。
 * **卡在络合剂**：化学镀铜要 EDTA（乙二胺 + 一氯乙酸）、酒石酸钾钠（顺丁烯二酸酐）
 * 或柠檬酸（发酵）三者之一，三样都不在料表里，而 EDTA 的乙二胺又要环氧乙烷（C2 环氧化物，
 * 正是上面缺的那一族）。所以：
 *
 *   **不是缺还原剂，是缺络合剂 —— 化学镀铜做不了。**
 *
 * 替代（本文件的 `make/pcb-2layer` / `make/pcb-4layer` 就是这么写的）：
 *
 *   ① 孔壁涂**石墨导电浆**（`mat/carbon-paste`，碳 400 + 酚醛 600，方阻 30–60 Ω/□），
 *      150 °C 固化 —— 只做**种子层**，它不承电流，它让电流有路可走
 *   ② 再在 `plant/plating-bath` 里电镀 25 µm 铜：1 A/dm²、60 min
 *      （铜的电化当量 1.186 g/A·h；25 µm × 8.96 = 2.24 g/dm² → 1.89 A·h/dm² → 2 A/dm² 约 57 min）
 *
 * 电镀液不用硫酸铜（硫酸不在本轮料内）：**酸性氯化铜**，铜 + 盐酸 + 氧 + 水现配。
 *
 * 深径比 4:1（1.2 mm / 0.3 mm）的代价：孔中电流密度只有板面的 1/3–1/2，所以
 * **孔口 25 µm、孔中 8–12 µm**。工业靠阴极移动与脉冲电源补，本层只有搅拌。
 *
 * 再往下的降级是**铜丝铆接**：φ0.3 铜线穿孔、两端铆平（1950 年代的做法，见 board.ts
 * 的绕接一节）。零化学，但每孔一次手工，1000 孔 8 h —— 它不进路线，写在这里当退路。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 五问之四：蚀刻
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 用**三氯化铁**（`mat/ferric-chloride`）：铁 140 + 盐酸 274 + 氧 20 + 水 571
 * = 1005 kg 投料 → 40 % 蚀刻液 1000 kg + 氢 5 kg（溶铁一步放掉，2Fe + 2HCl → 2FeCl₂ + H₂，
 * 2.5 kmol 铁放 2.5 kmol 氢 = 5.04 kg）。式子是 Fe + 3HCl + ¾O₂ → FeCl₃ + 1.5H₂O，
 * 账在这里按两步算，因为一步溶铁一步氧化在同一个槽里接力。
 *
 * 不用碱性氨蚀：氨有（哈伯法），氯化铵也能从氨 + 盐酸现做，但氨在火星上贵
 * （每吨氨 822 kg 氮、4.7 万 kg 大气），而 FeCl₃ 便宜、废液通氧就能再生
 * （4CuCl + O₂ + 4HCl → 4CuCl₂ + 2H₂O）。
 *
 * 侧蚀（under-cut）：50 µm 箔、槽浸加搅拌，侧蚀 ≈ **1.5 倍箔厚 = 75 µm**。
 * 于是 0.3 mm 的线要 0.45 mm 的胶线。**但侧蚀不是线宽的主项** ——
 * 主项是去膜：交联的胶只能用热水 + 铜丝刷，刷子会刮断更细的线（见降级二）。
 *
 * 蚀速：40–45 °C、40 % FeCl₃、槽浸搅拌 **5–10 µm/min** → 50 µm 要 5–10 min。
 * 没有终点检测（判据是"背面见亮"），过蚀 30 s 就多啃 5 µm。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 五问之五：HASL（热风整平）
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 锡有（`mat/tin`，99.9 %）。**纯锡 231.9 °C 熔**，锅温 250–260 °C；
 * 不用锡铅（铅锌链未建，铅连条目都没有）。锡锅 = HT200 铸铁坩埚，坐在
 * `plant/resistance-furnace`（100–1100 °C）里；"风刀"不单列条目 ——
 * 一块开了 φ1 × 50 mm 缝的钢板 + 0.3 MPa 压缩空气（气源是空气分离那一路），
 * 它是钣金件，不是设备。
 *
 * **助焊剂没有**：松香要松树，氯化锌要锌，酒精要发酵 —— 三样都不在。
 * 所以靠**刮锡**：浸锡前用铸铁刮板把锡面的氧化膜刮开，板子立刻下去。
 * 这是 1940 年代的做法，代价是焊盘上留锡瘤、0.3 mm 孔容易堵（堵了用 φ0.3 铜丝通）。
 *
 * **不用化学沉金（ENIG）**：沉金要氯金酸（金 + 王水，硝酸不在本轮料内）、
 * 次磷酸钠（要黄磷）、镍层（镍不在本轮料内）—— 三条都不在。HASL 是唯一可行的那一条。
 *
 * ⚠️ 一处顺序上的倒置：**阻焊印在 HASL 之后**。工业是"阻焊 → HASL"，而酚醛
 * 阻焊在 260 °C 的锡面上会起泡发黄。本层的办法是先把焊盘整平，再用开了孔的铁片
 * 漏印阻焊（避开焊盘），代价是套准全靠手（±0.2 mm），焊盘要留 0.2 mm 余量。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 板材结构（数是算的，按 1 m² 记）
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 玻纤布是粗纱布：**400 g/m²、厚 0.36 mm、幅宽 100 mm**（unblock-insulation.ts 第 218–233 行）。
 * 半固化片按 45 wt% 树脂：一张 0.4 kg 布 + 0.327 kg 胶 = 0.727 kg/m²，厚
 * 0.4/2500 + 0.327/1250 = 0.16 + 0.26 = 0.42 mm（无气隙）。
 *
 *   2 层板   1 张布 + 上下 50 µm 铜箔：0.36 + 2×0.05 = 0.46 mm，1.60 kg/m²
 *   4 层板   2 张芯板（各 1 布 2 箔）+ 中间 1 张半固化片：
 *            3 × 0.36 + 4 × 0.05 = 1.28 mm，5 MPa 压合挤出 8 % 树脂 → **1.20 mm**
 *            1 kg ≈ 0.29 m²
 *   过孔     0.3 mm / 1.20 mm = **深径比 4.0:1**（与题设的 4:1 对上了）
 *
 * 幅宽 100 mm 是一个真代价：1 m 宽的母板要 10 条布搭接，**接缝就是层压时的弱面**
 * （搭接处少一层布，压合后薄 0.05 mm）。这是本层与工业 FR-4 的第一处硬差。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 降级与升级（R8：一处降级配一条写在数据里的升级路线）
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ① 铜箔 35 µm 轧不出来 → 用 **50 µm**
 *    本层最薄的箔是 0.05 mm（euv-source.ts:620 的铜箔百叶，xenon-loop.ts:197 说
 *    "本层最薄的箔是 0.05 mm"）；35 µm 要再薄 30 %，单张轧会折。
 *    升级：**已建 `make/copper-foil-thin`（pcb.ts:431）** —— 四张叠轧到 0.035 mm（`gives` thickness 35 µm），多耗 12 % 的铜（1180 对 1050）。
 *    代价：侧蚀从 75 µm 落到 52 µm，线宽仍按 0.3 mm 设计（去膜是主项，不是侧蚀）。
 *
 * ② 结网只能 0.3 mm → 0.15 mm 要换抗蚀层
 *    交联的胶只能用 70–90 °C 热水 + 铜丝刷去掉，刷子刮断 0.15 mm 的线。
 *    升级：**已建 `make/pcb-4layer-fine`（pcb.ts:967）** —— **图形电镀 + 锡抗蚀**：先镀 25 µm 铜、再镀 5 µm 锡，
 *    去胶时铜还是整片（刷不坏），蚀铜时锡不溶于 FeCl₃，最后 5 % 盐酸去锡
 *    （盐酸溶锡不溶铜）。线宽由光刻与侧蚀定，0.15 mm。这是工业 1960–70 年代的正法。
 *
 * ③ 曝光台面 φ75 → 单块板 ≤ 50 × 50 mm
 *    `plant/mask-aligner` 是片子用的接触式曝光机（φ50–75）。1 m² 的母板要切成
 *    400 块 50 × 50 的小板再逐块曝光 —— 这是"能出板"，不是"能出大板"。
 *    升级：大面积曝光机（要一整台新设备，本层没有）。
 *
 * ④ 没有酚醛以外的树脂 → εr 4.8–5.2、吸水 1–3 %
 *    升级：环氧（双酚 A + 环氧氯丙烷）—— 卡在 C3，见"五问之一"。
 *
 * ⑤ 每批只压一张（单层压机）
 *    工业层压机一次压 20 层，本层一次一层 → 产能差 20 倍。升级：多层热压机
 *    （同一条水压回路，只把框架做高、加 20 块垫板）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 已知缺口
 * ═══════════════════════════════════════════════════════════════════════
 *
 * · **没有测氧的手段**：热压"抽真空到 10 Pa"里的残氧没法测，
 *   层间氧化只能靠"压完看颜色"。本文件不假装有氧分析仪。
 * · **没有介电常数、剥离强度、热循环的检具**：εr 4.8–5.2 是手册值，
 *   本层量不了；剥离强度只有"手撕"。
 * · **没有阻抗控制**：没有阻抗测试条；`std/vna-3ghz` 已有（10 MHz–3 GHz），
 *   但 PCB 阻抗仍要 TDR/测试条，不能只靠 VNA。0.3 mm 线只按图形做，
 *   不按阻抗做 —— 这块板能通断，不能上高速。
 * · **钻孔靠硬质合金微钻**（钨不到 1 ppm，硬质合金只能从地球带）。本层做到的最小孔
 *   是 φ0.2（xenon-loop.ts:774，手磨钻头、2 万转、进给 1 µm/转），所以 φ0.3 是"能做"，
 *   代价是断钻（每 30–50 孔一根）与偏心（销钉定位只能到 ±0.05 mm）。
 * · **本节只到裸板**：装上元件（贴片、键合、焊料）是另一条链，不在本文件。
 * · **`uses` 里有本文件自己的产物**（半固化片、铜箔 → 覆铜板 → 印制板）。规则里那张
 *   "允许的原料表"是**外部原料**的白名单；若把它读成"连自己刚造出来的中间物也不许用"，
 *   那么 `make/fr4-prepreg` 产出的半固化片就一个消费者都没有 —— 链条自己断了。
 *   所以这四处指向文件内的 id，是链内工序，不是越界取料。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PCB_ITEMS: readonly Item[] = [
  /**
   * 半固化片（B 阶段）。玻纤布浸酚醛、烘到"不流不粘手"。
   *
   * 45 wt% 树脂：0.4 kg 布 + 0.327 kg 胶 = 0.727 kg/m²，厚 0.42 mm。
   * 挥发分 1–2 % —— 这个数就是"4 层能压、6 层不能压"的全部原因（文件头）。
   */
  {
    id: 'mat/fr4-prepreg',
    name: 'Prepreg', name_zh: '半固化片',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'resinContent', kind: 'range', min: 35, max: 55, unit: '%' },
      { param: 'volatile', kind: 'range', min: 0.5, max: 5, unit: '%' },
    ],
  },

  /**
   * 铜箔。压延铜箔，0.05 mm（50 µm），1 m 宽。
   *
   * 0.05 mm 是本层的下限，不是选择：`make/euv-debris-trap` 的铜箔百叶就是
   * 0.05 mm，而 xenon-loop.ts:197 明写"本层最薄的箔是 0.05 mm"。
   * 35 µm 要多一道叠轧（`make/copper-foil-thin`），多耗 12 % 的铜（1180 对 1050）。
   *
   * 50 µm × 8.96 = 0.448 kg/m²。
   */
  {
    id: 'mat/copper-foil',
    name: 'Copper Foil', name_zh: '铜箔',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'thickness', kind: 'range', min: 30, max: 60, unit: 'µm', dir: 'atMost' }],
  },

  /**
   * 三氯化铁蚀刻液。40 %，密度 1.42，波美 42。
   *
   * 铁 140 + 盐酸 274 + 氧 20 + 水 571 → 1000（+ 氢 5）。见文件头"五问之四"。
   * 废液是氯化铜，通氧可再生 —— 本层没做再生，按不平衡记。
   */
  {
    id: 'mat/ferric-chloride',
    name: 'Ferric Chloride Etchant', name_zh: '三氯化铁蚀刻液',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'concentration', kind: 'range', min: 30, max: 45, unit: '%' }],
  },

  /**
   * 石墨导电浆。碳 400 + 酚醛 600，方阻 30–60 Ω/□。
   *
   * 它替的是化学镀铜的种子层：化学镀铜卡在络合剂（文件头"五问之三"），
   * 而孔壁只要"有路可走"，电阻高三个数量级也无所谓 —— 电流是电解液给的。
   * 粒径要 < 10 µm：孔只有 0.3 mm，粒径大于孔径的 1/30 就堵在孔口。
   */
  {
    id: 'mat/carbon-paste',
    name: 'Graphite Conductive Paste', name_zh: '石墨导电浆',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'sheetResistance', kind: 'range', min: 5, max: 100, unit: 'Ω/□', dir: 'atMost' }],
  },

  /**
   * 阻焊剂。酚醛 700 + 石英粉 300（填料把收缩与热膨胀压下去）。
   *
   * 它是本层最弱的一环：酚醛耐不住 260 °C 的焊锡冲击，所以阻焊只能印在
   * HASL **之后**（文件头"五问之五"）。固化 150–160 °C、30 min。
   */
  {
    id: 'mat/solder-mask',
    name: 'Solder Mask', name_zh: '阻焊剂',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'cureTemperature', kind: 'range', min: 120, max: 180, unit: '°C' }],
  },

  /**
   * 覆铜板（双面）。1 张半固化片 + 上下铜箔，180 °C / 5 MPa 热压。
   *
   * 单面是同一批的次品利用：一面铜箔压坏了，另一面还能用（`copperSides: single`）。
   * 本文件只给双面路线 —— 单面没有单独的工艺，只是少贴一张箔。
   *
   * 面密度 1.60 kg/m²（0.46 mm 厚）：1 kg ≈ 0.63 m²。
   */
  {
    id: 'mat/copper-clad',
    name: 'Copper-Clad Laminate', name_zh: '覆铜板',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'copperThickness', kind: 'range', min: 30, max: 60, unit: 'µm', dir: 'atMost' },
      { param: 'copperSides', kind: 'enum', values: ['single', 'double'] },
    ],
  },

  /**
   * 双面板。两条线、0.3 mm 孔、1.60 kg/m² 的料变成 1.38 kg/m² 的板（蚀掉一半铜）。
   *
   * 它是"料"不是"件"：装上元件之后才有"件"的身份，那一步不在本文件。
   * 与 `std/control-board-discrete` 的分工：那是一块手绕的板，这是一块印出来的板。
   */
  {
    id: 'mat/pcb-2layer',
    name: 'Double-Sided PCB', name_zh: '双面板',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'layers', kind: 'range', min: 1, max: 8, unit: '层' },
      { param: 'lineWidth', kind: 'range', min: 0.1, max: 1, unit: 'mm', dir: 'atMost' },
      { param: 'viaDiameter', kind: 'range', min: 0.2, max: 1, unit: 'mm', dir: 'atMost' },
    ],
  },

  /**
   * 四层板（多层印制板）。四层铜、三张布、1.20 mm，深径比 4:1。
   *
   * 四层的意义是**多一个布线自由度**，不是更细：内层可以整片做地平面，
   * 外层走信号，两条线要交叉时钻一个孔到内层去跨。0.3 mm 线宽与双面一样 ——
   * 限制它的是去膜的铜丝刷，不是层数（文件头降级二）。
   *
   * 面密度 3.49 kg/m²：1 kg ≈ 0.29 m²。
   */
  {
    id: 'mat/multilayer-pcb',
    name: 'Four-Layer PCB', name_zh: '四层板',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'layers', kind: 'range', min: 1, max: 8, unit: '层' },
      { param: 'lineWidth', kind: 'range', min: 0.1, max: 1, unit: 'mm', dir: 'atMost' },
      { param: 'viaDiameter', kind: 'range', min: 0.2, max: 1, unit: 'mm', dir: 'atMost' },
    ],
  },
];

export const PCB_ROUTES: readonly Route[] = [
  {
    /**
     * 半固化片。浸胶 → 挤胶 → 预烘到 B 阶段 → 裁切。
     *
     *   玻纤布 550 + 酚醛 470 = 1020 kg → 半固化片 1000 kg
     *
     * 差 20 kg 是预烘逸出的：缩聚水 1 %（酚醛固化还在放水）+ 游离酚 1 %。
     *
     * 幅宽 100 mm → 1 m 宽的胶布是 10 条搭接的（搭接 5 mm）。这是本层第一个
     * "看得出是拼的"的地方：接缝少一层布，压合后薄 0.05 mm。
     *
     * B 阶段是这条路线的全部要点：烘不够（挥发分 > 3 %）压合时起泡；
     * 烘过了（C 阶段）就不流动，层间粘不住。判据只有一条 —— **不粘手、不流**。
     * 没有凝胶时间测定仪，靠手感与"撕一小条看断面"。
     */
    id: 'make/fr4-prepreg',
    name: 'Prepreg Production', name_zh: '半固化片制备',
    produces: [
      {
        item: 'mat/fr4-prepreg',
        qty: q(1000),
        gives: [
          { param: 'resinContent', kind: 'range', min: 45, max: 45 },
          { param: 'volatile', kind: 'range', min: 1, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/glass-cloth', qty: q(550) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(470) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '配胶：酚醛兑水调到涂-4 杯 30–60 s，过滤掉凝胶块（胶里一粒渣就是层间一个空洞）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 40, max: 60 },
          { param: 'pressure', min: 100, max: 150 },
        ],
      },
      {
        note_zh: '浸胶与挤胶：布过胶槽，两道胶辊挤掉多余树脂，树脂含量 45±3 %（称重法：浸前浸后各称一次）',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'pressure', min: 100, max: 150 }],
      },
      {
        note_zh: '预烘到 B 阶段：130–160 °C、2–4 min，挥发分 1–2 %，出烘箱不粘手、不流',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 130, max: 160 }],
      },
      {
        note_zh: '裁切收卷：按 1 m 宽拼 10 条（搭接 5 mm），卷紧、干燥封装 —— 一开封吸潮就白烘',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '玻纤布 550 + 酚醛 470 = 1020 kg → 半固化片 1000 kg；差 20 kg 是预烘逸出的缩聚水（1 %）与游离酚（1 %），按投入的 470 kg 树脂算是 4.3 %',
  },
  {
    /**
     * 铜箔（压延）。铜板 → 冷轧到 0.05 mm → 中间退火三次 → 酸洗剪边。
     *
     *   铜 1050 → 铜箔 1000（0.05 mm，1 m 宽，0.448 kg/m²）
     *
     * 道次是算的：开坯 10 → 1.5 mm（4 道次，每道压下 30 %），精轧 1.5 → 0.05 mm
     * 要 0.75ⁿ = 0.033，**12 道次**（每道压下 20–25 %）。中间要退火三次，
     * 否则加工硬化到轧不动（铜冷加工 60 % 就裂）。
     *
     * 退火在空气里做（电阻炉没有保护气氛），所以每退一次就长一层氧化皮，
     * 靠 5 % 盐酸洗掉 —— 这一洗就是 1 % 的铜。
     *
     * ⚠️ 这不是工业铜箔。工业 PCB 铜箔**两种都不是压延的**：主流是电解铜箔
     * （钛辊上电沉积，12–35 µm 直接长出来）。那要硫酸铜电解液与抛光钛辊，
     * 本层两样都没有。升到电解铜箔是本条路线的上限之外。
     */
    id: 'make/copper-foil',
    name: 'Copper Foil Production', name_zh: '铜箔制备',
    produces: [
      { item: 'mat/copper-foil', qty: q(1000), gives: [{ param: 'thickness', kind: 'range', min: 50, max: 50 }] },
      {
        item: 'mat/copper-scrap',
        qty: q(50),
        gives: [
          { param: 'copper', kind: 'range', min: 85, max: 95 },
          { param: 'form', kind: 'enum', oneOf: ['flake'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(1050) }] }],
    needs: [],
    steps: [
      {
        note_zh: '开坯与粗轧：10 mm → 1.5 mm，4 道次（每道压下 30 %），两辊热轧',
        performedBy: 'plant/rolling-mill',
      },
      {
        note_zh: '中间退火 ×3：400–500 °C 保温 30 min（空气气氛，出来是黑的），冷加工 60 % 不退火就裂',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 500 }],
      },
      {
        note_zh: '精轧到 0.05 mm：12 道次（每道 20–25 %），两端夹 0.5 mm 钢板防折，最后一道抛光辊',
        performedBy: 'plant/rolling-mill',
      },
      {
        note_zh: '酸洗去氧化皮（5 % 盐酸、室温、2 min）与剪边 —— 边裂是这件的常态损耗',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'pressure', min: 100, max: 150 }],
      },
    ],
    unbalanced_zh:
      '铜 1050 → 铜箔 1000 kg（0.05 mm × 1 m 宽）+ 铜边裂/氧化皮/酸洗铜 50 kg（已单列 mat/copper-scrap，回熔炼）= 1050，平',
  },
  {
    /**
     * 薄铜箔（35 µm，升级路线）。四张叠轧 —— 单张太薄会折，箔工业的老办法。
     *
     *   铜 1180 → 铜箔 1000（0.035 mm）
     *
     * 它替的是"工业电解铜箔 12–35 µm"那一档：本层没有硫酸铜电解液与钛辊，
     * 只能靠轧。代价是铜多耗 13 %（叠轧的边裂、分张折损），而且 35 µm 的箔
     * 分张时"一捏就折"（0.31 kg/m²，比纸还软）。
     *
     * 它买到的不是线宽而是**侧蚀**：75 µm → 52 µm。
     */
    id: 'make/copper-foil-thin',
    name: 'Thin Copper Foil Production', name_zh: '薄铜箔制备',
    produces: [
      { item: 'mat/copper-foil', qty: q(1000), gives: [{ param: 'thickness', kind: 'range', min: 35, max: 35 }] },
      {
        item: 'mat/copper-scrap',
        qty: q(180),
        gives: [
          { param: 'copper', kind: 'range', min: 85, max: 95 },
          { param: 'form', kind: 'enum', oneOf: ['flake'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(1180) }] }],
    needs: [],
    steps: [
      { note_zh: '先轧到 0.14 mm（8 道次），再四张叠起来轧 —— 单张 0.14 以下自己就折', performedBy: 'plant/rolling-mill' },
      { note_zh: '叠轧到 0.035 mm：0.14 → 0.035 共 6 道次（每道 15–18 %），四张一组', performedBy: 'plant/rolling-mill' },
      {
        note_zh: '退火去应力：400–450 °C、1 h（电阻炉空气气氛，出来发黑）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
      {
        note_zh: '酸洗与分张：5 % 盐酸洗氧化皮，用 0.5 mm 铜片撬开分张（手指一捏就折）',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'pressure', min: 100, max: 150 }],
      },
    ],
    unbalanced_zh:
      '铜 1180 → 铜箔 1000 kg（0.035 mm）+ 铜废料 180 kg（叠轧边裂 120 + 分张折损 40 + 退火氧化皮与酸洗 20，已单列 mat/copper-scrap，回熔炼）= 1180，平。比 0.05 mm 那条多耗 12 % 的铜（1180 对 1050）',
  },
  {
    /**
     * 三氯化铁蚀刻液。溶铁 → 通氧氧化 → 调配过滤。
     *
     *   铁 140 + 盐酸 274 + 氧 20 + 水 571 = 1005 kg → 40 % FeCl₃ 液 1000 kg（+ 氢 5）
     *
     * 两步的账（2.5 kmol 铁为基准）：
     *   ① Fe + 2HCl → FeCl₂ + H₂      铁 139.6 + 盐酸 182.3 → 氯化亚铁 316.9 + 氢 5.04
     *   ② 2FeCl₂ + 2HCl + ½O₂ → 2FeCl₃ + H₂O
     *                                  + 盐酸 91.2 + 氧 20.0 → 三氯化铁 405.5 + 水 22.5
     *   合计：铁 140 + 盐酸 274 + 氧 20 + 水 571 → 三氯化铁 406 + 水 594（含量 40.6 %）
     *
     * 用铁而不是钢：铁屑（`mat/iron` 生铁）在盐酸里溶得快，碳不溶、沉底，滤掉就行。
     */
    id: 'make/ferric-chloride',
    name: 'Ferric Chloride Etchant Production', name_zh: '三氯化铁蚀刻液制备',
    produces: [
      {
        item: 'mat/ferric-chloride',
        qty: q(1000),
        gives: [{ param: 'concentration', kind: 'range', min: 40, max: 41 }],
      },
      { item: 'mat/hydrogen', qty: q(5), gives: [{ param: 'purity', kind: 'range', min: 99, max: 99.5 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron', qty: q(140) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(274) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(571) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '溶铁：铁屑 140 kg 分批投进 274 kg 31 % 盐酸（放氢，必须通风；60–80 °C 加速），溶完静置沉碳',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 60, max: 80 },
          { param: 'pressure', min: 100, max: 150 },
        ],
      },
      {
        note_zh: '氧化：通氧（或鼓空气）把氯化亚铁氧化成三氯化铁，颜色由绿转红褐，2FeCl₂ + 2HCl + ½O₂ → 2FeCl₃ + H₂O',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 60, max: 80 },
          { param: 'pressure', min: 100, max: 150 },
        ],
      },
      {
        note_zh: '调配与过滤：兑水到 40 %（密度 1.42 / 波美 42），滤掉未溶铁与碳渣',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'pressure', min: 100, max: 150 }],
      },
    ],
    unbalanced_zh:
      '铁 140 + 盐酸 274 + 氧 20 + 水 571 = 1005 kg → 蚀刻液 1000 kg + 氢 5 kg（已单列 mat/hydrogen）',
  },
  {
    /**
     * 石墨导电浆。碳 400 + 酚醛 600 → 1000。方阻 30–60 Ω/□。
     *
     * 磨到 10 µm 以下是这道工序的全部难点：孔 0.3 mm，粒径大于孔径 1/30 就堵孔口；
     * 而碳越细越难润湿，胶少了是干的、胶多了方阻高。判据是"涂在玻璃上对光看，无颗粒"。
     */
    id: 'make/carbon-paste',
    name: 'Graphite Conductive Paste Production', name_zh: '石墨导电浆制备',
    produces: [
      {
        item: 'mat/carbon-paste',
        qty: q(1000),
        gives: [{ param: 'sheetResistance', kind: 'range', min: 30, max: 60 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/carbon', qty: q(400) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(600) }] },
    ],
    needs: ['plant/milling-machine'],
    steps: [
      {
        note_zh: '碳块破碎与罐磨 24 h（磨到 < 10 µm；孔 0.3 mm，粒径超过 1/30 就堵孔口）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '混胶与三辊研磨三遍（酚醛 60 % + 碳 40 %，涂-4 杯 120 s），出料密封避光',
        performedBy: 'plant/robot',
      },
    ],
  },
  {
    /**
     * 阻焊剂。酚醛 700 + 石英粉 300 → 1000。
     *
     * 石英粉要磨细过筛（< 20 µm），否则漏印时堵网、固化后表面有颗粒。
     * 它是本层最弱的一环：耐不住焊锡，所以印在 HASL 之后（文件头）。
     */
    id: 'make/solder-mask',
    name: 'Solder Mask Production', name_zh: '阻焊剂制备',
    produces: [
      {
        item: 'mat/solder-mask',
        qty: q(1000),
        gives: [{ param: 'cureTemperature', kind: 'range', min: 150, max: 160 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(700) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(300) }] },
    ],
    needs: ['plant/milling-machine'],
    steps: [
      {
        note_zh: '石英粉磨细过筛（< 20 µm，200 目筛；粗粒在漏印时会卡在网孔上）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '混炼：酚醛 70 % + 石英 30 %，搅到看不见白点（颜色均匀是唯一判据）',
        performedBy: 'plant/robot',
      },
    ],
  },
  {
    /**
     * 覆铜板。配张 → 抽真空升温 → 5 MPa 保温 90 min → 冷压 → 修边。
     *
     *   半固化片 455 + 铜箔 561 = 1016 kg → 覆铜板 1000 kg
     *
     * 差 16 kg 是热压挤出的胶（飞边）：每 m² 挤出 0.727 × 45 % × 8 % = 0.026 kg。
     *
     * 压合曲线（热压机的 180 °C / 5 MPa 就是这个窗口）：
     *   抽真空到 10 Pa（把布里的空气与挥发分抽走）→ 2 °C/min 升到 170
     *   → 加压 5 MPa → 180 °C 保温 90 min（树脂流动、缩聚、凝胶）
     *   → 通冷水降到 60 °C 再卸压（热卸压必翘曲：铜 17 与酚醛 60 ppm/K 差 3.5 倍）
     *
     * 一次压一层：单层压机，产能是工业多层压机的 1/20（工业一次 20 层）。
     */
    id: 'make/copper-clad',
    name: 'Copper-Clad Laminate Production', name_zh: '覆铜板制备',
    produces: [
      {
        item: 'mat/copper-clad',
        qty: q(1000),
        gives: [
          { param: 'copperThickness', kind: 'range', min: 50, max: 50 },
          { param: 'copperSides', kind: 'enum', oneOf: ['double'] },
        ],
      },
      {
        item: 'mat/phenolic-scrap',
        qty: q(16),
        gives: [
          { param: 'resin', kind: 'range', min: 40, max: 70 },
          { param: 'form', kind: 'enum', oneOf: ['solid'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/fr4-prepreg', qty: q(455) }] },
      { anyOf: [{ item: 'mat/copper-foil', qty: q(561) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      {
        note_zh: '配张：1 张半固化片夹在上下两张铜箔之间，铜箔朝胶的一面用砂纸打毛（1 N/mm 的附着力靠它）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '抽真空到 10 Pa 并升温到 170（2 °C/min）—— 布里的空气与挥发分必须在加压前抽走',
        performedBy: 'plant/hot-press',
        under: [{ param: 'temperature', min: 160, max: 180 }],
      },
      {
        note_zh: '热压：180 °C、5 MPa、保温 90 min（树脂流动 → 凝胶 → 固化，缩聚水靠真空带走）',
        performedBy: 'plant/hot-press',
        under: [
          { param: 'temperature', min: 175, max: 185 },
          { param: 'pressure', min: 4500, max: 5500 },
        ],
      },
      {
        note_zh: '保压降温到 60 °C 再卸压（热卸压必翘曲：铜 17 对酚醛 60 ppm/K），翘曲量按对角线 0.3 mm 判',
        performedBy: 'plant/hot-press',
      },
      {
        note_zh: '修边、测厚（0.46 ± 0.02 mm）与附着力（手撕铜箔，1 N/mm 的判据是"撕下来带胶"）',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '半固化片 455 + 铜箔 561 = 1016 kg → 覆铜板 1000 kg + 挤出胶 16 kg（已单列 mat/phenolic-scrap，可回填料/尾渣）= 1016，平（每 m² 0.727 × 45 % × 8 % = 0.026 kg，按 626 m² 计）',
  },
  {
    /**
     * 薄覆铜板（35 µm 铜，升级路线）。与 make/copper-clad 同一台压机、同一条曲线，
     * 只换箔：每 m² 少 0.27 kg 铜，侧蚀从 75 µm 落到 52 µm。
     *
     *   半固化片 547 + 薄铜箔 472 = 1019 kg → 覆铜板 1000 kg
     *
     * 它是 `make/pcb-4layer-fine` 的前提：0.15 mm 的线要薄箔，否则侧蚀就吃掉了。
     */
    id: 'make/copper-clad-thin',
    name: 'Thin Copper-Clad Laminate Production', name_zh: '薄覆铜板制备',
    produces: [
      {
        item: 'mat/copper-clad',
        qty: q(1000),
        gives: [
          { param: 'copperThickness', kind: 'range', min: 35, max: 35 },
          { param: 'copperSides', kind: 'enum', oneOf: ['double'] },
        ],
      },
      {
        item: 'mat/phenolic-scrap',
        qty: q(19),
        gives: [
          { param: 'resin', kind: 'range', min: 40, max: 70 },
          { param: 'form', kind: 'enum', oneOf: ['solid'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/fr4-prepreg', qty: q(547) }] },
      {
        anyOf: [
          {
            item: 'mat/copper-foil',
            qty: q(472),
            need: [{ param: 'thickness', kind: 'range', max: 35, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: ['plant/clean-room'],
    steps: [
      {
        note_zh: '配张：1 张半固化片 + 两张 0.035 mm 铜箔（0.31 kg/m²，比纸软，铺的时候要用铜片压着走）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '热压：180 °C、5 MPa、90 min —— 与厚箔同一条曲线，压力不能再高（薄箔会被树脂流冲皱）',
        performedBy: 'plant/hot-press',
        under: [
          { param: 'temperature', min: 175, max: 185 },
          { param: 'pressure', min: 4500, max: 5000 },
        ],
      },
      { note_zh: '冷压卸压、修边、测厚（0.43 ± 0.02 mm）', performedBy: 'plant/robot' },
    ],
    unbalanced_zh:
      '半固化片 547 + 薄铜箔 472 = 1019 kg → 覆铜板 1000 kg + 挤出胶 19 kg（已单列 mat/phenolic-scrap）= 1019，平（每 m² 0.026 kg，按 753 m² 计）',
  },
  {
    /**
     * 双面板。蚀刻法（tent & etch），14 道工序。
     *
     *   覆铜板 1161 + 光刻胶 15 + 三氯化铁 218 + 水 73 + 石墨浆 11
     *   + 铜（阳极）326 + 阻焊 36 + 锡 15 = 1855 kg → 双面板 1000 kg
     *
     * 账按 1 m² 记（出 1.376 kg 板）：
     *   进  覆铜板 1.597 + 胶 0.020 + 蚀刻液 0.300 + 水 0.100 + 石墨 0.015
     *       + 铜阳极 0.448 + 阻焊 0.050 + 锡 0.020 = 2.550
     *   出  介质 0.701 + 铜（留 45 %）0.605 + 石墨 0.012 + 阻焊 0.042 + 锡 0.016 = 1.376
     *   差  1.174：溶掉的铜 0.739（基铜 0.493 + 面板镀的铜 0.246）+ 废蚀刻液 0.300
     *       + 水 0.100 + 光刻胶 0.020 + 胶的载体 0.003 + 阻焊溶剂 0.008 + 锡渣 0.004
     *
     * **面板电镀是个浪费**：为了让孔壁有铜，整板两面都镀 25 µm（0.448 kg/m²），
     * 蚀刻时又把它蚀掉 55 % —— 326 kg 的铜阳极里有 180 kg 白走一趟。
     * 这正是"图形电镀"（make/pcb-4layer-fine）省铜的地方。
     *
     * 线宽只能 0.3 mm，三个原因叠在一起：
     *   ① 去膜用铜丝刷，刷不住 0.15 mm 的线
     *   ② 对位靠显微镜 + 手调，±0.1 mm（曝光机没有自动对准）
     *   ③ 侧蚀 75 µm（50 µm 箔的 1.5 倍）
     */
    id: 'make/pcb-2layer',
    name: 'Double-Sided PCB Production', name_zh: '双面板制备',
    produces: [
      {
        item: 'mat/pcb-2layer',
        qty: q(1000),
        gives: [
          { param: 'layers', kind: 'range', min: 2, max: 2 },
          { param: 'lineWidth', kind: 'range', min: 0.3, max: 0.3 },
          { param: 'viaDiameter', kind: 'range', min: 0.3, max: 0.3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper-clad', qty: q(1161) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(15) }] },
      { anyOf: [{ item: 'mat/ferric-chloride', qty: q(218) }] },
      { anyOf: [{ item: 'mat/water', qty: q(73) }] },
      { anyOf: [{ item: 'mat/carbon-paste', qty: q(11) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(326) }] },
      { anyOf: [{ item: 'mat/solder-mask', qty: q(36) }] },
      {
        anyOf: [
          {
            item: 'mat/tin',
            qty: q(15),
            need: [{ param: 'purity', kind: 'range', min: 99.5, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      {
        note_zh: '辊涂光刻胶 5 µm（暗室；厚了显影漂不准，薄了针孔）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '烘胶 100–110 °C、10 min —— 只烘干不固化，固化后热水去不掉',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 110 }],
      },
      {
        note_zh: '接触曝光：掩模 φ75 压在胶面上（单块板 ≤ 50 × 50 mm），显微镜对位、手拧 x-y-θ，±0.1 mm',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh: '显影：未见光处溶于水，20–30 °C、60 s，出图形',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 150 },
        ],
      },
      {
        note_zh: '蚀刻：40–45 °C、40 % FeCl₃、槽浸搅拌 5–10 min（50 µm 铜），判据是"背面见亮"，没有终点检测',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 40, max: 50 },
          { param: 'pressure', min: 100, max: 150 },
        ],
      },
      {
        note_zh: '去膜：70–90 °C 热水软化 + 铜丝刷刷掉交联的胶 —— 刷子就是 0.1 mm 线宽做不出来的原因',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 70, max: 90 },
          { param: 'pressure', min: 100, max: 150 },
        ],
      },
      {
        note_zh: '钻孔 φ0.3（手磨硬质合金微钻、2 万转、进给 1 µm/转，每 30–50 孔断一根），定位用三颗 φ3 销钉',
        performedBy: 'plant/milling-machine',
      },
      {
        note_zh: '孔壁涂石墨导电浆（负压吸过去，孔口两面挂浆），把绝热的孔壁变成能电镀的导体',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '浆的固化 150–160 °C、30 min —— 酚醛缩聚，方阻固到 30–60 Ω/□',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 150, max: 160 }],
      },
      {
        note_zh: '面板电镀：1 A/dm²、60 min，两面各镀 25 µm，孔壁同厚（板面镀层后来被蚀掉 55 %）',
        performedBy: 'plant/plating-bath',
        under: [
          { param: 'temperature', min: 40, max: 50 },
          { param: 'pressure', min: 15, max: 20 },
        ],
      },
      {
        note_zh: '二次图形转移与蚀刻：把面板镀的铜蚀掉，只留图形（与 ①–⑥ 同一套，掩模是第二块）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 40, max: 50 },
          { param: 'pressure', min: 100, max: 150 },
        ],
      },
      {
        note_zh: 'HASL：刮开锡面氧化膜 → 浸 250–260 °C 纯锡 3 s → 提出、0.3 MPa 风刀吹通孔 → 冷却（孔堵了用 φ0.3 铜丝通）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 240, max: 260 }],
      },
      {
        note_zh: '阻焊：按开孔铁片漏印（避开焊盘，套准靠手 ±0.2 mm），150–160 °C 固化 30 min —— 必须在 HASL 之后，酚醛阻焊受不了焊锡冲击',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 150, max: 160 }],
      },
      {
        note_zh: '成型与测通断：按外形铣开，逐点对通断（1000 个点、万用表两支笔，一个点 2 s）',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '按 1 m² 记：进 2.550 kg → 出 1.376 kg；差 1.174 = 溶掉的铜 0.739（基铜 0.493 + 面板镀铜 0.246）+ 废蚀刻液 0.300 + 水 0.100 + 光刻胶 0.020 + 胶的载体 0.003 + 阻焊溶剂 0.008 + 锡渣 0.004。按 727 m² 折成 1000 kg 板（四舍五入到 kg）',
  },
  {
    /**
     * 四层板。内层图形 → 层压 → 钻孔 → 孔壁金属化 → 图形电镀 → 外层图形 → HASL → 阻焊。
     *
     *   覆铜板 916 + 半固化片 208 + 光刻胶 9 + 三氯化铁 129 + 水 37 + 石墨浆 6
     *   + 铜 129 + 阻焊 17 + 锡 7 = 1458 kg → 四层板 1000 kg
     *
     * 账按 1 m² 记（出 3.488 kg 板）：
     *   进  覆铜板 3.194 + 半固化片 0.727 + 胶 0.030 + 蚀刻液 0.450 + 水 0.130
     *       + 石墨 0.020 + 铜阳极 0.450 + 阻焊 0.060 + 锡 0.025 = 5.086
     *   出  介质 2.103 + 铜 1.299 + 石墨 0.016 + 阻焊 0.050 + 锡 0.020 = 3.488
     *   差  1.598：溶掉的铜 0.941（基铜 0.717 + 面板镀铜 0.224）+ 废蚀刻液 0.450
     *       + 水 0.130 + 光刻胶 0.030 + 胶的载体 0.004 + 阻焊溶剂 0.010 + 锡渣 0.005
     *       + 挤出的胶 0.026 + 阳极泥 0.002
     *
     * 层压的关键数是**对位**：两张芯板靠三颗 φ3 销钉定位（销钉孔在蚀刻前一并钻出），
     * 层间错位 ±0.05 mm；盘径因此取 0.8 mm（0.3 线 + 2 × 0.05 错位 + 0.1 余量）。
     *
     * 内层蚀刻后**不除胶**：残胶被压在板内（这是好事，省一道刷），代价是层间
     * 剥离强度低 —— 判据仍是手撕。
     */
    id: 'make/pcb-4layer',
    name: 'Four-Layer PCB Production', name_zh: '四层板制备',
    produces: [
      {
        item: 'mat/multilayer-pcb',
        qty: q(1000),
        gives: [
          { param: 'layers', kind: 'range', min: 4, max: 4 },
          { param: 'lineWidth', kind: 'range', min: 0.3, max: 0.3 },
          { param: 'viaDiameter', kind: 'range', min: 0.3, max: 0.3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper-clad', qty: q(916) }] },
      { anyOf: [{ item: 'mat/fr4-prepreg', qty: q(208) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(9) }] },
      { anyOf: [{ item: 'mat/ferric-chloride', qty: q(129) }] },
      { anyOf: [{ item: 'mat/water', qty: q(37) }] },
      { anyOf: [{ item: 'mat/carbon-paste', qty: q(6) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(129) }] },
      { anyOf: [{ item: 'mat/solder-mask', qty: q(17) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(7) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      {
        note_zh: '内层图形：两张芯板各自双面辊涂光刻胶、曝光、显影（四层板的四个铜层里，这两个是"里面"的两个）',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh: '内层蚀刻与去膜：40–45 °C FeCl₃ 蚀到背面见亮，热水 + 铜丝刷去膜（此时铜还是连片的粗图形，刷得动）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 40, max: 50 },
          { param: 'pressure', min: 100, max: 150 },
        ],
      },
      {
        note_zh: '钻定位销孔 φ3 ×3 与铆合：两张芯板夹 1 张半固化片，销钉定位，层间错位 ±0.05 mm',
        performedBy: 'plant/milling-machine',
      },
      {
        note_zh: '抽真空到 10 Pa、升温 170：叠层里的空气与挥发分（半固化片 1–2 %）必须在加压前走掉，否则分层',
        performedBy: 'plant/hot-press',
        under: [{ param: 'temperature', min: 160, max: 180 }],
      },
      {
        note_zh: '层压：180 °C、5 MPa、90 min —— 1.28 mm 的叠层压到 1.20 mm（树脂流出 8 %）',
        performedBy: 'plant/hot-press',
        under: [
          { param: 'temperature', min: 175, max: 185 },
          { param: 'pressure', min: 4500, max: 5500 },
        ],
      },
      {
        note_zh: '钻孔 φ0.3 通孔（深径比 4.0:1 = 1.20/0.30），手磨硬质合金微钻、2 万转、1 µm/转',
        performedBy: 'plant/milling-machine',
      },
      {
        note_zh: '孔壁石墨化：导电浆负压吸过孔，两面挂浆，150–160 °C 固化 30 min（替化学镀铜 —— 络合剂没有）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 150, max: 160 }],
      },
      {
        note_zh: '面板电镀 25 µm：1 A/dm²、60 min；孔中电流密度只有板面的 1/3，所以孔口 25 µm、孔中 8–12 µm',
        performedBy: 'plant/plating-bath',
        under: [
          { param: 'temperature', min: 40, max: 50 },
          { param: 'pressure', min: 15, max: 20 },
        ],
      },
      {
        note_zh: '外层图形：辊涂、烘胶、曝光、显影、蚀刻、去膜（与双面板同一套，掩模是外层那一块）',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh: '外面蚀刻与去膜：40–45 °C FeCl₃，蚀到背面见亮',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 40, max: 50 },
          { param: 'pressure', min: 100, max: 150 },
        ],
      },
      {
        note_zh: 'HASL：刮锡面 → 浸 250–260 °C 纯锡 3 s → 风刀吹通孔 → 冷却',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 240, max: 260 }],
      },
      {
        note_zh: '阻焊漏印（避开焊盘，±0.2 mm）与固化 150–160 °C、30 min',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 150, max: 160 }],
      },
      {
        note_zh: '成型、测通断与层间短路（相邻层间加压 500 V 量漏电 —— 没有耐压台，用摇表）',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '按 1 m² 记：进 5.086 kg → 出 3.488 kg；差 1.598 = 溶掉的铜 0.941（基铜 0.717 + 面板镀铜 0.224）+ 废蚀刻液 0.450 + 水 0.130 + 光刻胶 0.030 + 胶的载体 0.004 + 阻焊溶剂 0.010 + 锡渣 0.005 + 挤出的胶 0.026 + 阳极泥 0.002。按 287 m² 折成 1000 kg 板',
  },
  {
    /**
     * 四层细线板（0.15 mm，升级路线）。**图形电镀 + 锡抗蚀**，1960–70 年代的正法。
     *
     *   薄覆铜板 856 + 半固化片 234 + 光刻胶 8 + 三氯化铁 129 + 盐酸 26 + 水 39
     *   + 石墨浆 6 + 铜 65 + 锡 17 + 阻焊 18 = 1398 kg → 四层板 1000 kg
     *
     * 与 make/pcb-4layer 的三处不同，每一处都是"为什么线能细下去"：
     *
     *   ① 铜箔 35 µm（薄覆铜板）→ 侧蚀 52 µm 而不是 75
     *   ② **先镀后蚀**：贴胶 → 曝光显影 → 电镀 25 µm 铜 → 电镀 5 µm 锡 → 去胶
     *      此刻铜还是整片，铜丝刷刷的是胶不是线，0.15 mm 的线受不到力
     *   ③ **锡抗蚀**：FeCl₃ 溶铜不溶锡，蚀完用 5 % 盐酸去锡（盐酸溶锡不溶铜）
     *
     * 省铜也是真的：铜阳极 65 对 129 kg —— 面板电镀那份浪费没了（只镀图形，
     * 0.202 而不是 0.450 kg/m²）。
     *
     * 账按 1 m² 记（出 3.105 kg）：进 4.336 → 差 1.231 = 溶铜 0.533（内层 70 %
     * 与外层 45 % 的基铜）+ 废蚀刻液 0.400 + 盐酸 0.080 + 水 0.120 + 光刻胶 0.025
     * + 胶的载体 0.004 + 去锡 0.033 + 阻焊溶剂 0.010 + 挤出的胶 0.026。
     */
    id: 'make/pcb-4layer-fine',
    name: 'Four-Layer Fine-Line PCB Production', name_zh: '四层细线板制备',
    produces: [
      {
        item: 'mat/multilayer-pcb',
        qty: q(1000),
        gives: [
          { param: 'layers', kind: 'range', min: 4, max: 4 },
          { param: 'lineWidth', kind: 'range', min: 0.15, max: 0.15 },
          { param: 'viaDiameter', kind: 'range', min: 0.3, max: 0.3 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/copper-clad',
            qty: q(856),
            need: [{ param: 'copperThickness', kind: 'range', max: 35, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/fr4-prepreg', qty: q(234) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(8) }] },
      { anyOf: [{ item: 'mat/ferric-chloride', qty: q(129) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(26) }] },
      { anyOf: [{ item: 'mat/water', qty: q(39) }] },
      { anyOf: [{ item: 'mat/carbon-paste', qty: q(6) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(65) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(17) }] },
      { anyOf: [{ item: 'mat/solder-mask', qty: q(18) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      {
        note_zh: '内层图形（35 µm 箔）：曝光、显影，图形按 0.15 线 / 0.25 距（侧蚀 52 µm，胶线要 0.25）',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh: '内层蚀刻（40–45 °C FeCl₃）后压合：钻销钉孔、夹半固化片、180 °C / 5 MPa / 90 min',
        performedBy: 'plant/hot-press',
        under: [
          { param: 'temperature', min: 175, max: 185 },
          { param: 'pressure', min: 4500, max: 5500 },
        ],
      },
      {
        note_zh: '钻孔 φ0.3 与孔壁石墨化（150–160 °C 固化）—— 化学镀铜仍然没有，种子层还是石墨',
        performedBy: 'plant/milling-machine',
      },
      {
        note_zh: '图形电镀：贴胶、曝光显影后电镀 25 µm 铜（1 A/dm²、60 min），只镀图形，不镀整板',
        performedBy: 'plant/plating-bath',
        under: [
          { param: 'temperature', min: 40, max: 50 },
          { param: 'pressure', min: 15, max: 20 },
        ],
      },
      {
        note_zh: '电镀锡抗蚀层 5 µm（0.5 A/dm²、8 min）—— 锡在 FeCl₃ 里不溶，这就是抗蚀层',
        performedBy: 'plant/plating-bath',
        under: [
          { param: 'temperature', min: 40, max: 50 },
          { param: 'pressure', min: 15, max: 20 },
        ],
      },
      {
        note_zh: '去胶：此时铜是整片，铜丝刷刷胶不碰线 —— 这一步就是 0.15 mm 能成立的原因',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 70, max: 90 },
          { param: 'pressure', min: 100, max: 150 },
        ],
      },
      {
        note_zh: '蚀铜：40–45 °C FeCl₃，锡层挡住的地方铜留下（0.15 mm 线由锡线定，不由刷子定）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 40, max: 50 },
          { param: 'pressure', min: 100, max: 150 },
        ],
      },
      {
        note_zh: '去锡：5 % 盐酸泡 2 min（盐酸溶锡不溶铜），露出干净铜面',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'pressure', min: 100, max: 150 }],
      },
      {
        note_zh: 'HASL 与阻焊：与 make/pcb-4layer 同（焊盘整平后再漏印阻焊，酚醛耐不住锡）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 240, max: 260 }],
      },
      {
        note_zh: '成型、测通断与层间绝缘（0.15 mm 的线经不起一次返修，测完全报废）',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '按 1 m² 记：进 4.336 kg → 出 3.105 kg；差 1.231 = 溶铜 0.533 + 废蚀刻液 0.400 + 盐酸 0.080 + 水 0.120 + 光刻胶 0.025 + 胶的载体 0.004 + 去锡 0.033 + 阻焊溶剂 0.010 + 挤出的胶 0.026。按 322 m² 折成 1000 kg 板',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PCB_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PCB_ROUTES];
