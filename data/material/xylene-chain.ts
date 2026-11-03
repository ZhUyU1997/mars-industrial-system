/**
 * 芳烃往烷基化走：苯 → 甲苯 → 二甲苯。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 这个文件的由来
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `data/machine/motor.ts` 的漆包线只到 B 级（酚醛，130 °C），而伺服电机要
 * F 级（155 °C）—— `make/robot-servo` 那一格因此判 kept，机器人整机在严格
 * 闭包里造不出。要补的那条链是：
 *
 *   苯 + 甲醇 → 甲苯 → 二甲苯 → 邻二甲苯 → 苯酐 → 聚酯 → F 级漆包线
 *
 * 本文件只写前三步里的前两步（到二甲苯为止）。**停在二甲苯不是写累了，
 * 是第三步缺一台设备** —— 理由在最后一节，那条理由本身是这个文件的产出。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、ZSM-5 上的苯环烷基化
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   C₆H₆ + CH₃OH → C₇H₈ + H₂O        400–450 °C，ZSM-5
 *   C₇H₈ + CH₃OH → C₈H₁₀ + H₂O       同一台反应器、同一族催化剂
 *
 * 甲醇在 ZSM-5 的酸位上先脱水成二甲醚、再进攻芳环 —— 与甲醇制烯烃同一套
 * 机理，所以**不需要新设备**：`plant/bosch-reactor` 是 150–750 °C 的耐压壳，
 * `make/benzene`（乙炔环化成苯）已经跑在它上面。
 *
 * 质量比按分子量算，不是估的：
 *
 *   甲苯    848 苯 + 348 甲醇 → 1000 甲苯 + 196 水
 *           （78.11 + 32.04 = 92.14 + 18.02）
 *   二甲苯  868 甲苯 + 302 甲醇 → 1000 二甲苯 + 170 水
 *           （92.14 + 32.04 = 106.17 + 18.02）
 *
 * ⚠️ **操作压力 1–3 MPa 没写进 `under`。** 那台反应器扛得住（它本来就跑在
 * 6 MPa 的氢气里），但它的 `holds` 只声明了温度 —— 所以路线只写温度。
 * 这是**数据声明的缺口，不是物理缺口**；补它要给 bosch-reactor 的 `holds`
 * 加压力那一格，而那会牵动它上面所有路线，不在本轮。
 *
 * ⚠️ 实际产物是**混芳烃**：烷基化同时出甲苯、二甲苯、三甲苯，选择性与转化率
 * 一起变。本文件按"目标产物 100 %"记账，多出来的算催化剂补加与尾气
 * （见各条 `unbalanced_zh`）。与 `make/benzene` 那条"质量一比一"同型：
 * 这一层判"有没有这条路"，不判选择性。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、切异构体：那台塔是本轮补的，不是原有的
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 苯酐只能从**邻二甲苯**氧化来（混二甲苯氧化出一锅焦油）。三个异构体的沸点：
 *
 *   邻 144.4 · 间 139.1 · 对 138.4 °C
 *
 *   邻/间 差 5.3 °C  → 精馏分得开，但要 **约 100 块理论板、回流比 8–10、塔顶 20–50 kPa**
 *   间/对 差 0.7 °C  → 精馏分不开，工业上靠冷冻结晶（对二甲苯熔点 13.3 °C）
 *
 * 本层原有那台 `plant/distillation-tower` 的 `holds` 是 40–80 °C / 300–1000 kPa
 * —— 另一种塔（压着操作），二甲苯在它里面是液体。所以本轮另立了一台
 * **`plant/vacuum-column`**（100 块筛板、塔釜 150 °C、塔顶 20–50 kPa、
 * 水环 + 罗茨两级抽真空），由它执行 `make/o-xylene`。
 *
 * **链子原来是断在设备上，不是断在化学上** —— 这是上一轮的发现；这一轮
 * 把那台设备补上了，所以邻二甲苯通了。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、苯酐：V₂O₅ 上的气相氧化
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   C₈H₁₀ + 3 O₂ → C₈H₄O₃ + 3 H₂O      350–400 °C、V₂O₅/TiO₂ 固定床
 *
 *   717 邻二甲苯 + 648 氧 → 1000 苯酐 + 365 水
 *   （106.17 + 96.00 = 148.12 + 54.06，两头都对得上）
 *
 * 苯酐熔点 131 °C，出反应器是气相，冷凝成片就是商品。
 * **用纯氧不用空气**：氧/二甲苯比要压在 1:60 以上防爆，空气里的氮会把苯酐
 * 分压冲低、冷凝不下来 —— 本层有电解氧，把这一股省掉。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、已知缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① **聚酯那一条还没建**：F 级要三嗪环（THEIC，三羟乙基异氰脲酸酯），
 *     从氰尿酸 + 环氧乙烷来；环氧乙烷要银催化、要乙烯 —— 本层的乙烯只到
 *     乙苯那一步，没有氧化成环氧的路线。乙二醇也没有（甲醛 + CO + 2H₂ 可行）。
 *  ② **苯酐现在是终端**：没有消费者，报告的死产表里会出现它。
 *     **那是缺口的样子，不是接线错误** —— 与 `mat/silicon-nitride` 同一种读法。
 *  ③ **间/对混二甲苯也是终端**：它当溶剂，但本层还没有一条路线点名要它。
 *  ④ **冷冻结晶器没有条目**：要走对二甲苯那条（13.3 °C 结晶、−20 °C 冷源），
 *     本层最冷只到氙环路那一档（−70 °C 以下），中间这档没有设备。
 *  ⑤ **选择性不判**：见第一节末尾。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const XYLENE_ITEMS: readonly Item[] = [
  /**
   * 甲苯。苯环上一个甲基。
   *
   * 本层它只有一个去处：再上一个甲基变二甲苯。工业上甲苯的大头是调汽油
   * 与做 TNT —— 这两样本层都不做（没有内燃机汽油、不做炸药）。
   */
  { id: 'mat/toluene', name: 'Toluene', name_zh: '甲苯', unit: 'kg', category: 'material' },

  /**
   * 混合二甲苯（邻 22 / 间 43 / 对 35 %）。邻二甲苯的进料。
   *
   * 它往下走一步就是真空精馏（plant/vacuum-column），见文件头第二节。
   */
  { id: 'mat/xylene', name: 'Mixed Xylene', name_zh: '混合二甲苯', unit: 'kg', category: 'material' },

  /**
   * 邻二甲苯。沸点 144.4 °C，三个异构体里唯一能用精馏分出来的。做苯酐的料。
   */
  { id: 'mat/o-xylene', name: 'o-Xylene', name_zh: '邻二甲苯', unit: 'kg', category: 'material' },
  /**
   * 间/对混二甲苯。真空精馏的塔底产物。
   *
   * 它分不开（差 0.7 °C），但混着也是好东西：油漆稀释剂、清洗剂、萃取剂。
   * 本层把它当溶剂副产 —— 不是废料。
   */
  { id: 'mat/mp-xylene', name: 'Meta/Para Mixed Xylene', name_zh: '间/对混二甲苯', unit: 'kg', category: 'material' },

  /**
   * 苯酐（邻苯二甲酸酐）。白色片状固体，熔点 131 °C。
   *
   * 它是芳香二酸里最便宜的一根骨架：聚酯、醇酸、增塑剂都从它起。
   * 本层要它是为了 F 级漆包线的聚酯 —— 而聚酯那一条还没建，所以它现在是终端。
   */
  {
    id: 'mat/phthalic-anhydride',
    name: 'Phthalic Anhydride', name_zh: '苯酐',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 98, max: 99.9, unit: '%', dir: 'atLeast' }],
  },
];
export const XYLENE_ROUTES: readonly Route[] = [
  {
    /**
     * 苯 + 甲醇 → 甲苯 + 水。ZSM-5 上的苯环烷基化，400–450 °C。
     *
     *   848 苯 + 348 甲醇 + 2 催化剂 → 1000 甲苯 + 196 水
     *
     * 与 `make/benzene`（乙炔环化）同一台 `plant/bosch-reactor`：同一条
     * 耐压壳的理由，不新增设备。
     */
    id: 'make/toluene',
    name: 'Toluene Production', name_zh: '甲苯制备',
    produces: [
      { item: 'mat/toluene', qty: q(1000) },
      {
        item: 'mat/water',
        qty: q(196),
        // 反应生成水，带一点甲醇与芳烃，导电率按"工艺水"那一档交。
        gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/benzene', qty: q(848) }] },
      { anyOf: [{ item: 'mat/methanol', qty: q(348) }] },
      { anyOf: [{ item: 'mat/zsm-5', qty: q(2) }] },
    ],
    needs: [],
    performedBy: 'plant/bosch-reactor',
    under: [{ param: 'temperature', min: 400, max: 450 }],
    unbalanced_zh: '催化剂 2 kg 是床层补加（积炭烧掉后补），留在反应器里不进产物；烷基化同时出少量二甲苯与三甲苯，按甲苯 100 % 记账',
  },
  {
    /**
     * 甲苯 + 甲醇 → 二甲苯 + 水。同一台反应器、同一族催化剂。
     *
     *   868 甲苯 + 302 甲醇 + 2 催化剂 → 1000 二甲苯 + 170 水
     *
     * 产物是三个异构体的混合物：邻 22 / 间 43 / 对 35 %。组成随温度与空速变，
     * 这条路线只记总量 —— 切异构体是下一台设备的事，而那台设备还没有。
     */
    id: 'make/xylene',
    name: 'Mixed Xylene Production', name_zh: '混合二甲苯制备',
    produces: [
      { item: 'mat/xylene', qty: q(1000) },
      {
        item: 'mat/water',
        qty: q(170),
        gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/toluene', qty: q(868) }] },
      { anyOf: [{ item: 'mat/methanol', qty: q(302) }] },
      { anyOf: [{ item: 'mat/zsm-5', qty: q(2) }] },
    ],
    needs: [],
    performedBy: 'plant/bosch-reactor',
    under: [{ param: 'temperature', min: 400, max: 450 }],
    unbalanced_zh: '催化剂 2 kg 留在床层；异构体组成按 22 / 43 / 35 记（切邻二甲苯用 plant/vacuum-column）',
  },
  {
    /**
     * 真空精馏切邻二甲苯。邻 144.4 °C 与间 139.1 °C 差 5.3 °C，约 100 块理论板、
     * 回流比 8–10、塔顶 20–50 kPa 分得开（塔是 `plant/vacuum-column`）。
     *
     *   1000 混合二甲苯 → 220 邻二甲苯 + 780 间/对混二甲苯
     *
     * 间/对那 780 kg 不是废料：混二甲苯是油漆与清洗溶剂，本层收下。
     *
     * 减压不是为了省能，是为了把塔釜压在 150 °C 以下 —— 二甲苯在 160 °C 以上
     * 会慢慢结焦，100 块板的持液量足够把塔釜糊住。
     */
    id: 'make/o-xylene',
    name: 'o-Xylene Production by Vacuum Rectification', name_zh: '真空精馏切邻二甲苯制备',
    produces: [
      { item: 'mat/o-xylene', qty: q(220) },
      { item: 'mat/mp-xylene', qty: q(780) },
    ],
    uses: [{ anyOf: [{ item: 'mat/xylene', qty: q(1000) }] }],
    needs: [],
    performedBy: 'plant/vacuum-column',
    under: [
      { param: 'temperature', min: 100, max: 150 },
      { param: 'pressure', min: 20, max: 50 },
    ],
  },
  {
    /**
     * 邻二甲苯气相氧化到苯酐。V₂O₅ 固定床，350–400 °C，纯氧过量。
     *
     *   717 邻二甲苯 + 648 氧 + 2 催化剂 → 1000 苯酐 + 365 水
     *
     * 这是全世界苯酐的主流工艺：邻二甲苯在 V₂O₅ 上先氧化成邻甲基苯甲酸、
     * 再闭环成酐，两步在同一床层里完成。用纯氧不用空气：氧/二甲苯比要压在
     * 1:60 以上防爆，空气里的氮会把苯酐分压冲低、冷凝不下来。
     */
    id: 'make/phthalic-anhydride',
    name: 'Phthalic Anhydride Production from o-Xylene Gas-Phase Oxidation', name_zh: '邻二甲苯气相氧化到苯酐制备',
    produces: [
      {
        item: 'mat/phthalic-anhydride',
        qty: q(1000),
        gives: [{ param: 'purity', kind: 'range', min: 98, max: 99 }],
      },
      {
        item: 'mat/water',
        qty: q(365),
        gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/o-xylene', qty: q(717) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(648) }] },
      { anyOf: [{ item: 'mat/vanadium-oxide', qty: q(2) }] },
    ],
    needs: [],
    performedBy: 'plant/bosch-reactor',
    under: [{ param: 'temperature', min: 350, max: 400 }],
    unbalanced_zh: '催化剂 2 kg 是床层补加，留在反应器里；顺酐、马来酸等副产按 0 记（真实收率 96–98 %，本层不判选择性）',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...XYLENE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...XYLENE_ROUTES];
