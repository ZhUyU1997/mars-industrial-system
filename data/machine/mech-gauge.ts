/**
 * 机械计量基座 —— 三件「先有量具，才谈精度」的东西。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么是这三件，而不是先补机床
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 车床床身的平面度（measure/lathe-bed-flatness）、主轴的径向跳动
 * （measure/lathe-spindle-runout）都已经有测量路线，但那些路线用的平晶、
 * 比较仪、量块是种子或早期件。要把「磨完的零件到底差多少」变成可判的数，
 * 还需要三样基础量具：
 *
 *   表面平板   提供基准平面 —— 没有它，千分表没有零位可打；
 *   千分表     把 1 µm 级的位移变成指针转角 —— 本层能读长度的只有三档：
 *              比较仪（0.1 µm 分度，量程几十 µm）、千分尺（交付分度 10 µm，
 *              0–25 mm）、校准尺（accuracy ≤10 µm）；「1 µm 分度、1 mm 量程、
 *              能架在表座上打」这一档是空的；
 *   塞规组     把孔径的「通/止」变成不用读数的判定 —— 车间现场最可靠的一招。
 *
 * 三件都按「过程能力」写窗口：数值是工艺能达到的分散带，**不是某一次实测读数**。
 * 注释里分别标出「过程能力」与「量具能力」，两者不混。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 本文件只放产出路线，不放测量路线（R13）
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 这三件本身就是量具；对它们的检定（平板对研、千分表对量块、塞规比对）
 * 属于 `data/measure/` 的事，不在本文件写。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const MECH_GAUGE_ITEMS: readonly Item[] = [
  /**
   * 300 × 300 铸铁表面平板。**计量间的基准平面。**
   *
   * 为什么是铸铁不是花岗岩：HT250 能浇、能刮、能研，本层有熔炼炉与磨床；
   * 花岗岩要开采、锯切、研磨，且裂纹不可补。铸铁平板的老化与刮研是成熟工艺。
   *
   * 为什么 300 × 300：本层平晶的口径是 φ300（measure/lathe-bed-flatness
   * 里就是这么用的），平板工作面做到 300 见方，正好能用平晶整面覆盖，
   * 不必逐段搭接。
   *
   * 窗口（过程能力，不是读数）：
   *   flatness  1–3 µm / 300 mm —— 三块对研 + 刮研的过程能力；0 级铸铁平板
   *             300 mm 档的标准值也在 3 µm 量级。本层按 1–3 µm 交。
   *   size      300 × 300 mm（一个 `size` 只记边长；工作面 300 见方，厚 70–80）
   *
   * 它不是精密仪器：平面度 1–3 µm 只够当「基准平面」，不够当平晶。
   * 平晶的 λ/4 面形在 `plant/interferometer`，两者差一个量级。
   */
  {
    id: 'plant/surface-plate-300',
    name: '300 × 300 Cast Iron Surface Plate', name_zh: '300 × 300 铸铁表面平板',
    unit: '件',
    category: 'part',
    props: [
      { param: 'flatness', kind: 'range', min: 0, max: 3, unit: 'µm', dir: 'atMost' },
      { param: 'size', kind: 'range', min: 300, max: 300, unit: 'mm' },
    ],
  },

  /**
   * 千分表（0–1 mm，0.001 mm 分度）。**把微米级位移读成指针转角。**
   *
   * 为什么需要它：比较仪（`plant/comparator`）分度 0.1 µm，但它是「差」的
   * 仪器，量程只有几十微米，且要量块对零；千分尺分度 1–10 µm、量程 0–25 mm，
   * 但架不到表座上打平面度；校准尺 accuracy ≤10 µm，又差一个量级。
   * 千分表是中间那一档：量程 1 mm、分度 1 µm，能直接架在平板上打零件的
   * 平面度与孔位。
   *
   * 窗口（过程能力，不是读数）：
   *   range       0–1 mm —— 齿条行程定；200 格/圈 × 5 圈。
   *   resolution  0.001 mm —— 小齿轮齿数与表盘刻度定，1 µm/格。
   *   accuracy    ≤ 5 µm（交 2–4 µm）—— 齿条/齿轮传动误差 1–2 µm、游丝
   *               回程 1 µm、装配偏摆 1 µm 的叠加。本层按 2–4 µm 交。
   *
   * 与「千分表是量具」对应的量具能力：比较仪 0.1 µm + 量块 ±0.5 µm，
   * 合成 U ≈ 1.5 µm（k = 2），判 2–4 µm 的 accuracy 够用。
   */
  {
    id: 'std/dial-indicator-001',
    name: 'Dial Indicator', name_zh: '千分表',
    unit: '把',
    category: 'part',
    props: [
      { param: 'range', kind: 'range', min: 0, max: 1, unit: 'mm' },
      { param: 'resolution', kind: 'range', min: 0.001, max: 0.001, unit: 'mm', dir: 'atMost' },
      { param: 'accuracy', kind: 'range', min: 0, max: 0.005, unit: 'mm', dir: 'atMost' },
    ],
  },

  /**
   * 塞规组（φ6–80，通/止）。**孔径的现场判定工具。**
   *
   * 为什么是「组」：一套塞规按直径分档（6、8、10 … 80），每档通端与止端各一件。
   * 通端过、止端不过，孔就在公差带内 —— 不用读数，不怕车间温度与油污。
   *
   * 为什么 6–80：这是本层轴承位、销孔、法兰孔的主用区间；小于 6 的孔
   * 用针规（本层没有），大于 80 的孔用内径千分尺（也没有）。
   *
   * 窗口（过程能力，不是读数）：
   *   diameter   6–80 mm —— 一套覆盖的直径范围。
   *   tolerance  ≤ 2 µm（交 1–2 µm）—— 45 钢淬火 58–62 HRC 后外圆磨 +
   *              研磨的过程能力；磨到 ±2 µm、研接收 0.5–1 µm。
   *
   * 量具能力：比较仪 0.1 µm + 量块 ±0.5 µm，合成 U ≈ 0.6 µm（k = 2），
   * 判 1 µm 档的塞规够用；2 µm 档更宽裕。
   */
  {
    id: 'std/plug-gauge-set',
    name: 'Plug Gauge Set', name_zh: '塞规组',
    unit: '套',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 6, max: 80, unit: 'mm' },
      { param: 'tolerance', kind: 'range', min: 0, max: 0.002, unit: 'mm', dir: 'atMost' },
    ],
  },
];

export const MECH_GAUGE_ROUTES: readonly Route[] = [
  {
    /**
     * 表面平板：HT250 浇三块 → 人工时效 → 铣 → 磨 → **三块对研** → 刮研。
     *
     * 为什么必须三块一批：两块对研只能保证「互凹/互凸」；三块轮换
     * （A-B、B-C、C-A）才能把任意一块的凸起同时压到另外两块上，
     * 收敛到同一个平面。这是 Whitworth 三平面法，19 世纪的做法，本层不需要新设备。
     *
     * 工序（执行者都是既有设备）：
     *   ① 造型/合箱：三块 320 × 320 × 80 砂型，同一箱浇，浇口侧面、冒口在厚处；
     *   ② 浇注：HT250 1350–1450，三块同一炉（不同炉收缩差 0.05%，配不成套）；
     *   ③ 落砂、清砂，工作面留 4 mm 研量；
     *   ④ 人工时效：550–650 保温 4 h，随炉冷到 200 以下（放内应力，否则磨完慢慢变形）；
     *   ⑤ 粗铣六面，工作面留 0.4–0.5 mm 磨量，三块厚度差 ≤ 0.05；
     *   ⑥ 磨：三块同一台、同一装夹，磨到平面度 3–5 µm；
     *   ⑦ 三块对研：SiC 30 → 10 → 5 → 2 → 1 µm 分级，8 字轨迹，
     *      每 20 圈转 60°、每 60 圈换相位；每级后涂尾矿粉显示剂看接触点；
     *   ⑧ 刮研：高点用 `std/file-general` 刮去 1–2 µm，0 级目标 25 × 25 mm 内 ≥25 点（1 级 ≥20 点）；
     *   ⑨ 终检：φ300 平晶 + 钠光干涉，一条条纹 0.295 µm，300 mm 内 ≤ 10 条（≈3 µm）。
     *
     * 交付 **flatness 1–3 µm** 是过程能力：对研 + 刮研的收敛带，
     * 不是某一块的实测值；终检那一步是抽检方法，不是读数入库。
     */
    id: 'make/surface-plate-300',
    name: '300 × 300 Cast Iron Surface Plate Manufacturing', name_zh: '300 × 300 铸铁表面平板制造',
    produces: [
      {
        item: 'plant/surface-plate-300',
        // 三块一批：三块对研是一组，任一块废则三块一起废。
        qty: q(3),
        gives: [
          { param: 'flatness', kind: 'range', min: 1, max: 3 },
          { param: 'size', kind: 'range', min: 300, max: 300 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(200) }] },
      { anyOf: [{ item: 'mat/silicon-carbide', qty: q(4) }] },
      // 显示剂：尾矿粉水簸到 < 4 µm，与 make/comparator-lapping-plate 同一招。
      { anyOf: [{ item: 'mat/tailings', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(40) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/comparator/lapping-plate',
      'std/file-general',
      // 终检的「亚微米直尺」：平晶只有这里有。
      'plant/interferometer',
    ],
    rate: { hours: q(120) },
    steps: [
      {
        note_zh: '造型/合箱：三块 320 × 320 × 80 砂型，同一箱浇，浇口侧面、冒口在厚处',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '浇注：HT250 1350–1450，三块同一炉出（不同炉收缩差 0.05%，配不成套）',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1350, max: 1450 }],
      },
      {
        note_zh: '打箱、落砂、割浇冒口，工作面留 4 mm 研量',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '人工时效：550–650 保温 4 h，随炉冷到 200 以下（放内应力，否则磨完慢慢变形）',
        performedBy: 'plant/earth-kiln',
        under: [{ param: 'temperature', min: 550, max: 650 }],
      },
      {
        note_zh: '粗铣六面，工作面留 0.4–0.5 mm 磨量，三块厚度差 ≤ 0.05',
        performedBy: 'plant/milling-machine',
      },
      {
        note_zh: '磨：三块同一台、同一装夹，磨到平面度 3–5 µm（磨完的差异就是互研的起点）',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '三块对研：SiC 30 → 10 → 5 → 2 → 1 µm 分级，A-B/B-C/C-A 轮换，8 字轨迹；每 20 圈转 60°、每 60 圈换相位',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '刮研：涂尾矿粉显示剂，高点用锉刀刮去 1–2 µm；0 级目标 25 × 25 mm 内 ≥25 点（1 级 ≥20 点）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '终检：φ300 平晶 + 钠光，一条条纹 0.295 µm，300 mm 内 ≤ 10 条（≈3 µm）；四边与两条对角线各读一次',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '入库：三块编号成一套、擦干垫毛毡，记面形与重刮日期',
        performedBy: 'plant/robot',
      },
    ],
  },

  {
    /**
     * 千分表：滚齿/铣齿 → 游丝定型 → 宝石轴承 → 表壳表盘 → 装配调整 → 对量块检定。
     *
     * 工序（执行者都是既有设备）：
     *   ① 齿条与小齿轮：0.2 模数，滚齿机滚小齿轮、铣床铣齿条；
     *      两级齿轮放大，指针 200 格/圈 × 5 圈 = 0–1 mm，1 µm/格；
     *   ② 游丝：轴承钢冷轧带 0.05 mm 绕成螺线，250–300 定型 ——
     *      本层没有弹簧钢牌号，用轴承钢代，弹性后效差一档（注释里写明）；
     *   ③ 宝石轴承：氧化铝烧结块磨孔、研磨到 φ0.5 / Ra 0.05（本层没有宝石轴承条目，
     *      直接从 `mat/alumina` 做）；
     *   ④ 表壳、表盘：车铝壳、压玻璃、印刻度；
     *   ⑤ 装配：装齿轮、游丝预紧、指针归零，用 0.5 mm 量块对零；
     *   ⑥ 检定：量块 0.1–1 mm 十点，比较仪读误差，每点 3 次取极差；20 ± 1 °C 等温 12 h。
     *
     * 交付：range 0–1 mm、resolution 0.001 mm、**accuracy 2–4 µm**。
     * accuracy 是过程能力估算（传动 1–2 µm + 游丝 1 µm + 装配 1 µm），
     * 不是某一台的实测读数；量具能力见条目注释（U ≈ 1.5 µm，k = 2）。
     */
    id: 'make/dial-indicator-001',
    name: 'Dial Indicator Manufacturing', name_zh: '千分表制造',
    produces: [
      {
        item: 'std/dial-indicator-001',
        qty: q(1),
        gives: [
          { param: 'range', kind: 'range', min: 0, max: 1 },
          { param: 'resolution', kind: 'range', min: 0.001, max: 0.001 },
          { param: 'accuracy', kind: 'range', min: 0.002, max: 0.004 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/bearing-steel', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 50) }] },
    ],
    // 机床由 steps[].performedBy 指名，不在 needs 里重复（redundant_need）；
    // needs 只留场地与不去消耗的检定基准。
    needs: ['plant/metrology-room', 'std/gauge-block-working'],
    rate: { hours: q(16) },
    steps: [
      {
        note_zh: '小齿轮：0.2 模数滚齿（两级齿轮放大，指针 200 格/圈 × 5 圈 = 0–1 mm，1 µm/格）',
        performedBy: 'plant/gear-hobbing',
      },
      {
        note_zh: '齿条：铣床铣 0.2 模数齿条，与齿轮啮合后手动全程走一遍，查卡滞与回程',
        performedBy: 'plant/milling-machine',
      },
      {
        note_zh: '游丝：轴承钢冷轧带 0.05 mm 绕成螺线，250–300 定型（本层无弹簧钢牌号，用轴承钢代，弹性后效差一档）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 250, max: 300 }],
      },
      {
        note_zh: '宝石轴承：氧化铝烧结块磨孔、研磨到 φ0.5 / Ra 0.05（本层没有宝石轴承条目，从 mat/alumina 直接做）',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '表壳、表盘：车铝壳、压玻璃、印刻度',
        performedBy: 'lathe',
      },
      {
        note_zh: '装配：装齿轮、游丝预紧、指针归零，用 0.5 mm 量块对零',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '检定：量块 0.1–1 mm 十点，比较仪读误差，每点 3 次取极差；20 ± 1 °C 等温 12 h',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '入库：装盒、记表号与本批检定极差',
        performedBy: 'plant/robot',
      },
    ],
  },

  {
    /**
     * 塞规组：45 钢车坯 → 淬火 → 回火 → 外圆磨 → 研磨 → 对量块检定。
     *
     * 工序（执行者都是既有设备）：
     *   ① 车坯：φ6–80 阶梯坯，留磨量 0.3–0.4 mm；
     *   ② 淬火：45 钢 830–850 水淬，58–62 HRC；
     *   ③ 回火：150–180 保温 2 h，去脆；
     *   ④ 外圆磨：磨到 ±2 µm，留 1–2 µm 研磨量；
     *   ⑤ 研磨：铸铁研磨套 + SiC/W1 研磨膏，往复 + 旋转，尺寸收到 +0.000/−0.001；
     *   ⑥ 检定：每件 3 截面 × 2 方向，比较仪对量块读数；20 ± 1 °C 等温 12 h。
     *
     * 交付：diameter 6–80 mm、**tolerance 1–2 µm**。
     * tolerance 是过程能力（磨 2 µm + 研磨收 0.5–1 µm），不是实测读数；
     * 量具能力见条目注释（U ≈ 0.6 µm，k = 2）。
     */
    id: 'make/plug-gauge-set',
    name: 'Plug Gauge Set Manufacturing', name_zh: '塞规组制造',
    produces: [
      {
        item: 'std/plug-gauge-set',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 6, max: 80 },
          { param: 'tolerance', kind: 'range', min: 0.001, max: 0.002 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(10) }] },
      { anyOf: [{ item: 'mat/silicon-carbide', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    // 同上：磨床/比较仪/车床都在 steps 里作执行者，needs 不重复。
    needs: ['std/gauge-block-working', 'plant/metrology-room'],
    rate: { hours: q(40) },
    steps: [
      {
        note_zh: '车坯：φ6–80 阶梯坯，留磨量 0.3–0.4 mm',
        performedBy: 'lathe',
      },
      {
        note_zh: '淬火：45 钢 830–850 水淬，58–62 HRC',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 830, max: 850 }],
      },
      {
        note_zh: '回火：150–180 保温 2 h，去脆',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 150, max: 180 }],
      },
      {
        note_zh: '外圆磨：磨到 ±2 µm，留 1–2 µm 研磨量',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '研磨：铸铁研磨套 + SiC/W1 研磨膏，往复 + 旋转，尺寸收到 +0.000/−0.001',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '检定：每件 3 截面 × 2 方向，比较仪对量块读数；20 ± 1 °C 等温 12 h',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '标记、装盒：按直径分档，通端/止端成对编号',
        performedBy: 'plant/robot',
      },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...MECH_GAUGE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...MECH_GAUGE_ROUTES];
