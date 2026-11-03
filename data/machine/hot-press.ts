/**
 * 真空热压机 —— 180 °C / 5 MPa / 1 m² 台面。本层的第三处"要压力"。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么要有这一台
 * ═══════════════════════════════════════════════════════════════════════
 *
 * `data/machine/press.ts:10` 列了七处"本层没有压机"的缺口，第三处是**覆铜板**：
 *
 *   覆铜板  "要热压机"
 *
 * 曲柄压力机（`plant/press`，100 t）补不了它 —— 理由不是力不够，是**力的性质不对**：
 *
 *   曲柄机   飞轮储能 → 离合器 → 曲轴转一圈 → 滑块到下死点就回。**力是瞬时的一下**
 *   热压     180 °C、5 MPa，保温 90 min。**力要一直挂着，而且树脂一边流一边掉压**
 *
 * 所以覆铜板、多层板、以及以后的层压件（酚醛层压板、绝缘垫、覆铜母板）都要一台
 * **能保压、能加热、能抽真空**的压机。这一台就是它。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 五问之二：压力从哪来（数都在这里）
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   **180 °C / 5 MPa / 1 m² = 5 000 kN = 500 t**
 *
 * ① `plant/press` 的公称压力是 **100 t = 1 000 kN**，差 5 倍。
 *    更要紧的是它保不住压：曲轴过了下死点就回程，力随即消失。就算垫铁块顶死，
 *    树脂一流、板一薄，压力就掉到零 —— 而热压要的是"恒压 90 min"。
 *    → **曲柄机不是"力小一点"，是根本做不到这件事。**
 *
 * ② `plant/autoclave` **能不能当热压罐？** 它 hold 10 000–35 000 kPa（10–35 MPa）、
 *    150–550 °C。所以：
 *
 *      温度    180 °C 在 150–550 里 → 够
 *      压力    15 MPa 在 10–35 里 → 够
 *
 *    **加温加压都够，但它不能用来层压**，两条硬理由：
 *
 *      下限太高    层压窗口 3–5 MPa，而它最低 10 MPa。用 10 MPa 压 1.2 mm 板：
 *                  树脂从 45 wt% 挤到 30 wt%，1.20 mm 压成 **0.82 mm**
 *                  （树脂少 0.47 kg/m² = 0.376 mm 厚度），布层压到一起 → 层间短路
 *      没有真空袋  热压罐靠真空袋把挥发分抽走并压实。袋要橡胶或 PE 膜 —— 本层
 *                  两种聚合物都没有（唯一的聚合物是 PTFE，它 180 °C 下在 5 MPa
 *                  里会冷流）。裸压 = 挥发分（1–2 %）全闷在层间
 *
 *    → **它不是热压罐**。但它是一台好**等静压罐**：10–35 MPa 压坯件（陶瓷干压、
 *      粉末冶金）正合适，那条路与本文件不冲突。
 *
 * ③ **没有液压油怎么办 —— 这是要正面回答的。**
 *
 *    `mat/hydraulic-oil` 不存在（`unblock-ore-filter.ts:297` 已经记过"那要橡胶与液压油"）。
 *    油是 C20 以上的烃，本层连 C3 都没有（环氧那一节同一个断点）—— **油来不了**。
 *
 *    所以用**水**。20 MPa 的水压机是 19 世纪的成熟技术（水压机就是蒸汽时代的产物），
 *    在本层它有一个额外的好处：水到处都有，漏了不心疼，也不怕污染。
 *
 *    力的账：
 *
 *      柱塞面积   A = 5 000 kN ÷ 20 MPa = **0.25 m²** → φ564 mm
 *      缸筒壁厚   Lamé 公式，45 钢许用 100 MPa：
 *                 t = 282 × (√((100+20)/(100−20)) − 1) = 282 × 0.2247 = **63 mm** → 取 65
 *                 外径 φ694，长 1.0 m，锻件净重 1 010 kg
 *
 *    三条代价（都写进零件路线里）：
 *
 *      ① 黏度只有油的 1/50 → 20 MPa 下泄漏大 10 倍，填料要压得更紧
 *         本层没有橡胶与 PTFE 垫（`mat/ptfe` 有，但 20 MPa 下冷流）→ 用**石墨绳填料**
 *      ② 锈 —— 加石灰把 pH 调到 8–9（`mat/lime` 有），比加缓蚀剂现实
 *      ③ 冻 —— 火星夜里 −60 °C，水压缸第二天就是一坨冰。**每次用完排空**
 *         （这一条没法写进模型：模型没有"气温"这个条件）
 *
 *    泵的问题：**没有电机可用**（本轮的 std 白名单里没有 `std/motor-7.5kw-4p`，
 *    而它在本层是有的）。所以做**两级手摇柱塞泵**：
 *
 *      低压级   φ40 × 60 mm = 75 cm³/冲程。行程量 0.25 m² × 50 mm = 12.5 L → **167 冲程**
 *               （2 s 一冲程 ≈ 6 min，一个人摇得动）
 *      增压级   φ16 × 60 mm = 12 cm³/冲程。20 MPa 段要压的是钢架伸长 0.84 mm
 *               （δ = FL/AE = 5e6 × 2.5 / (0.0707 × 2.1e11) = 0.84 mm）+ 水压缩 0.115 L
 *               （κ = 4.6e-10/Pa × 20 MPa × 12.5 L）+ 板压实 0.06 L ≈ 0.39 L → **32 冲程**
 *               （20:1 杠杆，手柄 200 N）
 *      保压     单向阀 + 溢流阀 + 重锤蓄能器；水会从填料慢慢渗，**每 10 min 补一次**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它长什么样（数都算得出来）
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   能力    temperature 150–220 °C · pressure 3 000–6 000 kPa（1 m² 台面 = 3 000–6 000 kN）
 *   台面    1 m²（1000 × 1000）。**为什么这么大**：覆铜板的母板是 1 m²，一块母板出
 *           400 块 50 × 50 mm 的小板（曝光台面只有 φ75，只能一块一块曝光）
 *   机架    四柱式，HT250 上下横梁各 6 t + 4 根 φ150 × 2500 的 45 钢立柱，预紧
 *   水压    20 MPa、φ564 柱塞、缸筒壁 65 mm（锻件，锻这一步本层没有设备）
 *   加热    石墨发热条 4 条（50 × 20 × 1000，串联 R = 4 × 0.01 = 0.04 Ω），
 *           24 V / 600 A / **14.4 kW**（P = V²/R）。两片 45 钢承压板各 471 kg，
 *           连石墨与矿棉约 960 kg，从冷到 180 °C 要 1.4 h
 *           （960 kg × 0.5 kJ/kg·K × 150 K ÷ 14.4 kW ≈ 5 000 s），
 *           所以**常年不冷**，只在换批时降温
 *   真空    1.5 m 立方的箱体，10 mm 钢板 + 十字加强筋。平板应力
 *           σ = 0.308 × p × (b/t)² = 0.308 × 0.1 × (500/10)² = **77 MPa**（45 钢许用 100）
 *   温控    铜-钢双金属片 + 波登管压力表，**两点定标**：沸水 100.0 °C（101 kPa）、
 *           锡熔点 231.9 °C，两点之间线性插值出 180 —— 这是 19 世纪定温标的老办法
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 降级与升级（R8：一处降级配一条升级路线）
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ① 没有液压油 → **水**（文件头五问之二）。
 *    升级：**给泵配一台 `std/motor-7.5kw-4p`**（本层有这一条，只是不在本轮的
 *    std 白名单里）—— 电动柱塞泵 600 r/min × 75 cm³ = 4.7 L/min，12.5 L 的行程量
 *    从 167 冲程 / 6 min 变成 **2.7 min**，而且不用人摇。油压本身仍不可达（C3 断点）。
 * ② 没有橡胶与 PTFE 垫 → **石墨绳填料**。
 *    升级：PTFE 唇形密封（`mat/ptfe` 本层有）+ 弹簧加载 —— 代价是 PTFE 在 20 MPa
 *    下冷流，寿命按 200 h 记。
 * ③ 没有独立的真空泵条目 → 借 `plant/evaporator` 的泵族（`needs` 里写明）。
 *    升级：把水环泵 + 罗茨转子装成一台真空机组 —— 零件条目已经有了
 *    （`make/water-ring-pump` / `make/roots-rotor`），只差一台整机。
 * ④ 单层压机（一次一层）→ 产能是工业多层压机的 1/20。
 *    升级：同一条水压回路，把四柱做高 1.5 m、加 19 块垫板 —— 力不用加，行程要加。
 * ⑤ 缸筒要锻件，而**本层没有锻造设备**（与 `autoclave.ts:36–44` 同一处缺口）。
 *    升级：水压机/锻锤 —— 它不在八大类器具里，数据里也没有。
 * ⑥ **没有测氧手段**：真空腔里"残氧多少"测不了，层间氧化
 *    只能压完看颜色。不假装有氧分析仪。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 已知缺口（模型侧的，不是数据漏写）
 * ═══════════════════════════════════════════════════════════════════════
 *
 * · **只有一个 `pressure` 参数**。这台机器同时有两个压力：柱塞里的 20 MPa 水、
 *   箱体里的 10 Pa 真空。`holds` 只能写一个 —— 这里写的是**台面压力 3–6 MPa**
 *   （那是工艺要的），真空与液压油压只写在注释里。这是模型的缺口，与
 *   `plant/mask-aligner` 的"暗室"同一个性质。
 * · **"自产压力"表达不了**：水压缸的 20 MPa 试压压力是它自己的泵给的，
 *   没有外部设备维持它，所以那条工序不写 `under` —— 不是省了，是写不出来。
 * · 本文件**只写零件与零件路线**，不写整机装配路线：按本轮的交付约定，
 *   设备的 `composedOf` 与它的产出路线不能同时存在（模型会判 `mixed_production`），
 *   所以这一台的第一套仍是"运来的"（这是**现在**没有）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

/** 五个零件。整机本身在文件末尾（`HOT_PRESS`），`HOTPRESS_ITEMS` 把它一并带上。 */
const HOTPRESS_PARTS: readonly Item[] = [
  /**
   * 机架（四柱式）。上下横梁 HT250 各 6 t（分两次浇：熔炼炉一炉 3–5 t），
   * 4 根 φ150 × 2500 的 45 钢立柱，加热伸长后上螺母预紧。
   *
   * 预紧力按 5 000 kN 的 1.3–1.4 倍取（6 500–7 000 kN），四根各 1 625–1 750 kN ——
   * 立柱应力 1.625e6 / 0.01767 = 92 MPa（到 99 MPa），45 钢许用 160，够。
   */
  {
    id: 'plant/hot-press/frame',
    name: 'Hot Press Frame', name_zh: '热压机机架',
    unit: '件',
    category: 'part',
    props: [{ param: 'maxForce', kind: 'range', min: 1000, max: 8000, unit: 'kN', dir: 'atLeast' }],
  },

  /**
   * 水压机组。缸筒（45 钢锻件，内 φ564、壁 65、长 1 m）+ 空心柱塞（φ560，壁 80）
   * + 石墨绳填料函 + 两级手摇柱塞泵 + 单向阀 + 溢流阀 + 重锤蓄能器。
   *
   * 20 MPa × 0.25 m² = 5 000 kN。水的黏度是油的 1/50，所以填料压得比油压机紧一倍，
   * 每 10 min 补一次压。
   */
  {
    id: 'plant/hot-press/hydraulic',
    name: 'Hot Press Hydraulic Unit', name_zh: '热压机水压机组',
    unit: '件',
    category: 'part',
    props: [
      { param: 'boreDiameter', kind: 'range', min: 500, max: 600, unit: 'mm' },
      { param: 'ratedPressure', kind: 'range', min: 10, max: 30, unit: 'MPa', dir: 'atLeast' },
    ],
  },

  /**
   * 加热板（一件，机器上要两件）。1000 × 1000 × 60 的 45 钢承压板，
   * 铣出 4 条 20 mm 深的槽嵌石墨发热条，背面铺 30 mm 矿棉、四周耐火料绝缘。
   *
   * 石墨条 50 × 20 × 1000：R = ρL/A = 10 µΩ·m × 1 / (0.05 × 0.02) = 0.01 Ω/条，
   * 四条串联 0.04 Ω，24 V 下 600 A、14.4 kW。电流大是因为石墨的电阻率只有
   * 镍铬丝的 1/100 —— 这条路线买的是"发热体不会被烧断"，代价是电流大一档。
   */
  {
    id: 'plant/hot-press/platen',
    name: 'Hot Press Platen', name_zh: '热压机加热板',
    unit: '件',
    category: 'part',
    props: [{ param: 'tableArea', kind: 'range', min: 0.5, max: 1.5, unit: 'm²' }],
  },

  /**
   * 真空腔。1.5 × 1.5 × 1.5 m 的方箱，10 mm 钢板卷焊 + 十字加强筋，
   * 前门带 φ200 玻璃观察窗，石墨绳填料密封，后壁两个接管（抽气、充氮）。
   *
   * 验算是外压容器：100 kPa 压差下一块 500 mm 见方、10 mm 厚的平板，
   * σ = 0.308 × 0.1 × (500/10)² = 77 MPa（许用 100）。8 mm 就 120 MPa 了，超。
   * 内腔 3.4 m³ —— 抽到 10 Pa 靠 `plant/evaporator` 的那套泵族。
   */
  {
    id: 'plant/hot-press/chamber',
    name: 'Hot Press Vacuum Chamber', name_zh: '热压机真空腔',
    unit: '件',
    category: 'part',
    props: [{ param: 'chamberVolume', kind: 'range', min: 0.5, max: 8, unit: 'm³' }],
  },

  /**
   * 温控与测压。铜-钢双金属片恒温器 + 波登管压力表 + 溢流阀 + 保压计时。
   *
   * 双金属片的热膨胀差 17−12 = 5 ppm/K（铜 17、45 钢 12）。悬臂片 100 mm 长、
   * 1 mm 厚，180 °C 时弯 y = ¾·Δα·ΔT·L²/t = 0.75 × 5e-6 × 160 × 0.01/0.001
   * = **6 mm** —— 足够顶开触点（实际做成螺线，省地方、行程更大）。
   *
   * 定标用两个固定点：沸水 100.0 °C（101 kPa，湿法槽能给）与锡熔点 231.9 °C
   * （电阻炉里放一小块锡，看它塌下去）。两点之间线性插值 —— 180 °C 落在 0.63 处。
   * 控温带 ±10 °C：够压合，不够做精密固化。
   */
  {
    id: 'plant/hot-press/control',
    name: 'Hot Press Temperature Control and Pressure Measurement', name_zh: '热压机温控与测压',
    unit: '件',
    category: 'part',
    props: [{ param: 'controlBand', kind: 'range', min: 5, max: 20, unit: '°C', dir: 'atMost' }],
  },
];

export const HOTPRESS_ROUTES: readonly Route[] = [
  {
    /** 机架。浇上下横梁 → 立柱车螺纹 → 结合面铣 → 预紧装配。 */
    id: 'make/hotpress-frame',
    name: 'Hot Press Frame Manufacturing', name_zh: '热压机机架制造',
    produces: [
      {
        item: 'plant/hot-press/frame',
        qty: q(1),
        gives: [{ param: 'maxForce', kind: 'range', min: 5000, max: 5000 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(12000) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(2500) }] },
    ],
    needs: ['plant/forge', 'plant/metrology-room'],
    steps: [
      {
        note_zh: '浇上下横梁：各 6 t，分两次浇（熔炼炉一炉 3–5 t），浇后自然时效 72 h 去内应力',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1350, max: 1450 }],
      },
      {
        note_zh: '立柱车削与 M150×6 螺纹（4 根 φ150 × 2500，45 钢锻件；螺纹是预紧的命门，3 级精度）',
        performedBy: 'lathe',
      },
      {
        note_zh: '横梁结合面铣平（0.05/1000）与立柱孔镗配（四孔同轴 0.1）',
        performedBy: 'plant/milling-machine',
      },
      {
        note_zh: '预紧装配：立柱套电加热器升温 40 K（伸长 12 ppm/K × 2500 × 40 = 1.2 mm），上螺母、冷缩 —— 冷缩后约 7 000 kN，压下时立柱不会松',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '铸铁 12 000 + 45 钢 2 500 = 14 500 kg → 机架 1 件（净 12 420 kg）；差 2 080 kg = 浇冒口 1 680（出品率 0.86：投 12 000 得 10 320）+ 立柱车屑与螺纹料头 400（投 2 500 得 2 100）',
  },
  {
    /** 水压机组。镗缸筒 → 珩磨内孔 → 车柱塞 → 装填料与泵阀 → 20 MPa 试压。 */
    id: 'make/hotpress-hydraulic',
    name: 'Hot Press Hydraulic Unit Manufacturing', name_zh: '热压机水压机组制造',
    produces: [
      {
        item: 'plant/hot-press/hydraulic',
        qty: q(1),
        gives: [
          { param: 'boreDiameter', kind: 'range', min: 564, max: 566 },
          { param: 'ratedPressure', kind: 'range', min: 20, max: 20 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(2400) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(150) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(60) }] },
      // 水就是工质：40 kg = 缸里 25 kg（0.25 m² × 100 mm 的柱塞腔）+ 试压与补水。
      // 没有液压油（`mat/hydraulic-oil` 不存在），所以 pH 靠石灰调到 8–9 防锈。
      { anyOf: [{ item: 'mat/water', qty: q(40) }] },
    ],
    needs: ['plant/forge'],
    steps: [
      {
        note_zh: '镗缸筒内孔 φ564（锻件粗车后镗，余量 8 mm —— 锻件不圆，一刀吃不下）',
        performedBy: 'lathe',
      },
      {
        note_zh: '珩磨内孔到 Ra 0.4、圆柱度 0.05/1000（水没有油膜，孔一不圆就偏磨填料）',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '车空心柱塞 φ560 × 壁 80（473 kg）与泵体、单向阀座、溢流阀座',
        performedBy: 'lathe',
      },
      {
        note_zh: '装石墨绳填料函（压紧力比油压机大一倍：水黏度只有油的 1/50）、接管与两级手摇泵',
        performedBy: 'plant/robot',
      },
      {
        // 20 MPa 是这个件自己的泵给的，没有外部设备维持 —— 模型表达不了"自产压力"，
        // 所以这一段不写 under（缺口记在文件头，不是省略）。
        note_zh: '试压：手摇泵打到 20 MPa、保压 10 min，压降 ≤ 0.5 MPa；缸壁 45 钢在 20 MPa 下环向应力 87 MPa（许用 100）',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '45 钢 2 400 + 铜 150 + 碳 60 + 水 40 = 2 650 kg → 水压机组 1 件（约 2.3 t）；差 350 kg 是镗孔与珩磨的切屑（投 2 400 得 2 060 净件）、泵体料头，水 40 是试压与首次充液（留 25 kg 在缸里）',
  },
  {
    /** 加热板。铣槽 → 嵌石墨条与耐火绝缘 → 铺矿棉包壳 → 通电测电阻。 */
    id: 'make/hotpress-platen',
    name: 'Hot Press Platen Manufacturing', name_zh: '热压机加热板制造',
    produces: [
      {
        item: 'plant/hot-press/platen',
        qty: q(1),
        gives: [{ param: 'tableArea', kind: 'range', min: 1, max: 1 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(480) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(8) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(60) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(40) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(8) }] },
    ],
    needs: ['lathe'],
    steps: [
      {
        note_zh: '铣承压面（平面度 0.05/1000 —— 板厚均匀全靠它）与 4 条 20 mm 深的发热槽',
        performedBy: 'plant/milling-machine',
      },
      {
        note_zh: '嵌石墨发热条 4 条（50 × 20 × 1000）与耐火料绝缘块，铜排接线柱引出',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '背面铺 30 mm 矿棉、包薄板外壳（保温差一半，热就全跑进机架了）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '通电测：4 条串联 0.04 Ω（每条 ρL/A = 10 µΩ·m × 1 / 1e-3）、24 V 下 600 A、14.4 kW；绝缘 500 V 摇表 > 5 MΩ',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '45 钢 480 + 碳 8 + 耐火料 60 + 矿棉 40 + 铜 8 = 596 kg → 加热板 1 件（净 544 kg）；差 52 kg = 铣槽切屑 20（投 480 得 460）+ 耐火料打结损耗 32（投 60 用 28）',
  },
  {
    /** 真空腔。卷焊箱体 → 车门法兰与密封槽 → 装窗与填料 → 抽真空检漏。 */
    id: 'make/hotpress-chamber',
    name: 'Hot Press Vacuum Chamber Manufacturing', name_zh: '热压机真空腔制造',
    produces: [
      {
        item: 'plant/hot-press/chamber',
        qty: q(1),
        gives: [{ param: 'chamberVolume', kind: 'range', min: 3.4, max: 3.4 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1300) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(300) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(5) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(15) }] },
    ],
    needs: ['plant/evaporator'],
    steps: [
      {
        note_zh: '下料卷焊箱体 10 mm 板 + 十字加强筋（外压 100 kPa 下平板应力 0.308 × 0.1 × (500/10)² = 77 MPa，8 mm 就 120 MPa，超）',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh: '车门法兰与密封槽车配（槽宽比石墨绳大 0.2 mm，压紧量 25 %），铰链与压紧螺栓',
        performedBy: 'lathe',
      },
      {
        note_zh: '装 φ200 玻璃观察窗（两面石墨绳，玻璃不能直接对螺栓 —— 应力集中会压碎）与两个接管',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '检漏：抽到 1 Pa 关阀量压升，10 min 内 ≤ 5 Pa 算过；查漏用肥皂水（没有氦检漏仪）',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 0.5, max: 1 }],
      },
    ],
    unbalanced_zh:
      '薄板 1 300 + 45 钢 300 + 玻璃 5 + 碳 15 = 1 620 kg → 真空腔 1 件（净 1 535 kg）；差 85 kg 全是卷焊边料与加强筋料头（投 1 300 得 1 215），玻璃与石墨绳按件计',
  },
  {
    /** 温控与测压。卷双金属片 → 车波登管与阀座 → 沸水定标 → 锡点定标。 */
    id: 'make/hotpress-control',
    name: 'Hot Press Temperature Control and Pressure Measurement Manufacturing', name_zh: '热压机温控与测压制造',
    produces: [
      {
        item: 'plant/hot-press/control',
        qty: q(1),
        gives: [{ param: 'controlBand', kind: 'range', min: 10, max: 10 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(25) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(15) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(3) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '卷铜-钢双金属片（两片铆合后卷成螺线，与计量间那只恒温器同一招）并装银触点、调间隙',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '车波登管（φ40 × 0.3 铜管压扁绕圈）、压力表齿轮与溢流阀座，装表并打压对刻度',
        performedBy: 'lathe',
      },
      {
        note_zh: '沸水定标：101 kPa 下水沸 100.0 °C，标第一点（100 mm 的悬臂片在 100 °C 弯 3 mm）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 100, max: 100 },
          { param: 'pressure', min: 101, max: 101 },
        ],
      },
      {
        note_zh: '锡点定标：电阻炉里放一小块锡，看它塌下去（231.9 °C），标第二点；两点线性插值，180 落在 0.63 处',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 225, max: 240 }],
      },
    ],
    unbalanced_zh:
      '铜 25 + 45 钢 15 + 玻璃 3 + 锡 2 = 45 kg → 温控组件 1 件（净 37 kg）；差 8 kg = 铜屑 5（投 25 得 20）+ 45 钢车屑 3（投 15 得 12）；玻璃与定标那块锡按件计，锡还能再用',
  },
];

/**
 * 真空热压机。180 °C / 5 MPa / 1 m² 台面，双面加热，可抽真空或充氮。
 *
 * `holds` 只写**台面**的两个条件（150–220 °C、3 000–6 000 kPa）。柱塞里的 20 MPa
 * 水压与箱体里的 10 Pa 真空写不进模型 —— 一个 `pressure` 参数容不下三个压力，
 * 缺口记在文件头。
 *
 * 它不被任何路线产出：`composedOf` 与产出路线同时存在会被判 `mixed_production`
 * （模型的规则，不是省略）。所以第一套仍是运来的 —— 这是**现在**没有。
 */
export const HOT_PRESS: Item = {
  id: 'plant/hot-press',
  name: 'Hot Press', name_zh: '热压机',
  unit: '台',
  category: 'machine',
  holds: [
    { param: 'temperature', min: 150, max: 220 },
    { param: 'pressure', min: 3000, max: 6000 },
  ],
  props: [{ param: 'tableArea', kind: 'range', min: 0.5, max: 1.5, unit: 'm²' }],
  composedOf: [
    { item: 'plant/hot-press/frame', qty: q(1) },
    { item: 'plant/hot-press/hydraulic', qty: q(1) },
    { item: 'plant/hot-press/platen', qty: q(2) },
    { item: 'plant/hot-press/chamber', qty: q(1) },
    { item: 'plant/hot-press/control', qty: q(1) },
  ],
};

/**
 * 本文件的条目出口 —— **含整机**（五个零件 + `plant/hot-press`）。
 *
 * ⚠️ 接线时只用这一个数组：`HOT_PRESS` 与 `HOTPRESS_ITEMS` 的最后一项是同一个对象，
 * 再把 `HOT_PRESS` push 一次会撞 `duplicate_id`。别的文件（press.ts、autoclave.ts）
 * 把整机单列，是因为 report.ts 分别接线；这里按本轮的交付约定合成一条出口。
 */
export const HOTPRESS_ITEMS: readonly Item[] = [...HOTPRESS_PARTS, HOT_PRESS];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...HOTPRESS_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/hot-press',
    name: 'Hot Press Assembly', name_zh: '热压机装配',
    produces: [{
      item: 'plant/hot-press',
      qty: q(1),
      gives: [
      { param: 'tableArea', kind: 'range', min: 0.5, max: 1.5 },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...HOTPRESS_ROUTES, ...ASSEMBLY_ROUTES];
