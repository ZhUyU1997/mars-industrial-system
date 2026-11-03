/**
 * 聚酯的两个单体：乙二醇，与三嗪环 THEIC。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 这个文件接在哪
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * F 级漆包线的骨架是**芳环聚酯**：芳香二酸（苯酐，`data/material/xylene-chain.ts`
 * 已经通到）+ 多元醇。二元醇用乙二醇，三元醇用 **THEIC**（三羟乙基异氰脲酸酯）
 * —— 后者就是"F 级"这三个字的来源：三嗪环在 155 °C 以上不分解，聚酯骨架
 * 靠它把热稳定性从 B 级（130 °C）抬到 F 级。
 *
 *   苯酐 + 乙二醇 + THEIC → 聚酯漆 → 漆包线（F 级）
 *
 * 本文件写前两个单体；聚酯与漆是下一条。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、乙二醇：甲醛 + 一氧化碳 + 氢
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   HCHO + CO + H₂ → HOCH₂CHO        氢甲酰化，铑或钴催化，20–30 MPa、150–200 °C
 *   HOCH₂CHO + H₂ → HOCH₂CH₂OH       加氢
 *
 * 两步在一台高压釜里接力，总包：
 *
 *   HCHO + CO + 2H₂ → C₂H₆O₂         30.03 + 28.01 + 4.03 = 62.07
 *
 *   ⇒ 484 甲醛 + 451 一氧化碳 + 65 氢 → 1000 乙二醇（不多不少）
 *
 * **本层其实有环氧乙烷**（`make/ethylene-oxide`，乙烯 + 氧 + 银催化），
 * 工业上乙二醇也是走 EO 水合。这里不用那条，理由是**判不了**：EO 的
 * `purity` 窗口是 80–100 %（选择性 80–90 %，副产 CO₂ 与乙二醇），水合
 * 之前要提纯，而本层没有 EO 的组成分析。甲醛那条对 EO 不敏感 —— 它不是
 * 同一个中间体。两条都不错，本文件先写不依赖 EO 纯度的那条。
 *
 * 甲醛有（甲醇氧化）、CO 有（碳不完全燃烧）、氢有（电解）—— 三样都在。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、THEIC：三嗪环，靠尿素这条线绕开环氧乙烷
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 工业上 THEIC = 氰尿酸 + 3 环氧乙烷。EO 本层有，但纯度窗口 80–100 %（见上），
 * 所以走**碳酸酯那条老路**（Asahi 的路线，1970 年代就在用）—— 它对 EO 一步
 * 也不用，只吃尿素与乙二醇：
 *
 *   2 NH₃ + CO₂ → CO(NH₂)₂ + H₂O              尿素合成，15–25 MPa、180–200 °C
 *   3 CO(NH₂)₂ → C₃H₃N₃O₃ + 3 NH₃            尿素热解成氰尿酸，250–300 °C
 *   CO(NH₂)₂ + HOCH₂CH₂OH → C₃H₄O₃ + 2 NH₃   尿素 + 乙二醇 → 碳酸乙烯酯
 *   C₃H₃N₃O₃ + 3 C₃H₄O₃ → THEIC + 3 CO₂      氰尿酸 + 3 碳酸酯 → THEIC
 *
 * 四条的质量比都按分子量算过，见各条注释。**NH₃ 在尿素与氰尿酸那两步之间
 * 闭路**：热解放出来的氨回尿素合成，所以净消耗是氨与 CO₂ 里的氮与碳。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 已知缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① **催化剂全是假设**：氢甲酰化的铑、THEIC 的碳酸钾，本层都没有条目。
 *     两者的用量都是 ppm 到 1 %，按"不消耗"处理（与 ZSM-5 同一种记法）。
 *  ② **乙二醇的收率按 100 % 记**：真实氢甲酰化对甲醛的选择性 80–90 %，
 *     副产甲酸、甲醇。本层不判选择性（与烷基化同一条口径）。
 *  ③ **THEIC 的熔点 135 °C、羟值 640–660**：本层没有羟值滴定（要乙酰化 +
 *     返滴定），所以 THEIC 的 `hydroxylValue` 只声明窗口，不做判据。
 *  ④ **没有组成分析**：这几步的中间产物（氰尿酸、碳酸酯）只能熔点 + 氮含量
 *     判，判不到 1 %。与真空塔那条缺口同型。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const POLYESTER_MONOMER_ITEMS: readonly Item[] = [
  /**
   * 尿素。氮肥，也是氰尿酸与碳酸酯的原料。
   *
   * 它在这条链里是**氮的载体**：合成时把 CO₂ 里的碳与氨里的氮装进一个分子，
   * 热解时再把氨放出来。所以它不是消耗品，是循环工质。
   */
  {
    id: 'mat/urea',
    name: 'Urea', name_zh: '尿素',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'nitrogen', kind: 'range', min: 46, max: 46.6, unit: '%', dir: 'atLeast' }],
  },

  /** 氰尿酸。白色结晶，三嗪环的母体。300 °C 以上升华，热解温度要压在 300 以下。 */
  {
    id: 'mat/cyanuric-acid',
    name: 'Cyanuric Acid', name_zh: '氰尿酸',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 98, max: 99.5, unit: '%', dir: 'atLeast' }],
  },

  /** 碳酸乙烯酯。无色液体（mp 36 °C），THEIC 的羟乙基化剂。 */
  { id: 'mat/ethylene-carbonate', name: 'Ethylene Carbonate', name_zh: '碳酸乙烯酯', unit: 'kg', category: 'material' },

  /**
   * THEIC：三羟乙基异氰脲酸酯。白色固体，mp 135 °C，羟值 640–660。
   *
   * 它的三嗪环是 F 级的全部理由：环上三个羟乙基参与聚酯缩聚，环本身在
   * 300 °C 以下不分解，所以聚酯的交联密度与热稳定性同时上去。
   */
  {
    id: 'mat/theic',
    name: 'THEIC (Trihydroxyethyl Isocyanurate)', name_zh: 'THEIC（三羟乙基异氰脲酸酯）',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'hydroxylValue', kind: 'range', min: 630, max: 670, unit: 'mgKOH/g' }],
  },

  /**
   * 乙二醇。防冻液、聚酯的二元醇。
   *
   * 本层它只有两个去处：碳酸乙烯酯（→ THEIC）与聚酯（下一条路线）。
   */
  { id: 'mat/ethylene-glycol', name: 'Ethylene Glycol', name_zh: '乙二醇', unit: 'kg', category: 'material' },
];

export const POLYESTER_MONOMER_ROUTES: readonly Route[] = [
  {
    /**
     * 尿素合成：2NH₃ + CO₂ → CO(NH₂)₂ + H₂O，180–200 °C、15–25 MPa。
     *
     *   567 氨 + 733 二氧化碳 → 1000 尿素 + 300 水
     *   （34.06 + 44.01 = 60.06 + 18.02）
     *
     * 两步在一台釜里：先成氨基甲酸铵（放热、快），再脱水成尿素（慢、要压）。
     * 所以压力是**为了第二步**，不是为了溶解。
     */
    id: 'make/urea',
    name: 'Urea Synthesis', name_zh: '尿素合成',
    produces: [
      {
        item: 'mat/urea',
        qty: q(1000),
        gives: [{ param: 'nitrogen', kind: 'range', min: 46, max: 46.5 }],
      },
      {
        item: 'mat/water',
        qty: q(300),
        gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ammonia', qty: q(567) }] },
      { anyOf: [{ item: 'mat/co2', qty: q(733) }] },
    ],
    needs: [],
    performedBy: 'plant/autoclave',
    under: [
      { param: 'temperature', min: 180, max: 200 },
      { param: 'pressure', min: 15000, max: 25000 },
    ],
    unbalanced_zh: '合成液里的过量氨与未转化氨基甲酸铵按 0 记（工业上循环回釜，转化率 60–70 %）',
  },
  {
    /**
     * 尿素热解成氰尿酸：3CO(NH₂)₂ → C₃H₃N₃O₃ + 3NH₃，250–300 °C。
     *
     *   1396 尿素 → 1000 氰尿酸 + 396 氨
     *   （3 × 60.06 = 180.18 = 129.07 + 3 × 17.03）
     *
     * 放出来的氨回 `make/urea`，所以这一条与上一条是一对闭路。
     * 温度不能过 300：氰尿酸在 300 °C 以上升华，收率掉得比温升快。
     */
    id: 'make/cyanuric-acid',
    name: 'Cyanuric Acid from Urea Pyrolysis', name_zh: '尿素热解成氰尿酸制备',
    produces: [
      {
        item: 'mat/cyanuric-acid',
        qty: q(1000),
        gives: [{ param: 'purity', kind: 'range', min: 98, max: 99 }],
      },
      // 热解放出的氨回 make/urea：无水（99.5 %），压缩后直接循环。
      { item: 'mat/ammonia', qty: q(396), gives: [{ param: 'concentration', kind: 'range', min: 99, max: 99.5 }] },
    ],
    uses: [{ anyOf: [{ item: 'mat/urea', qty: q(1396) }] }],
    needs: [],
    performedBy: 'plant/resistance-furnace',
    under: [{ param: 'temperature', min: 250, max: 300 }],
  },
  {
    /**
     * 碳酸乙烯酯：尿素 + 乙二醇 → C₃H₄O₃ + 2NH₃，150–180 °C、常压偏负压。
     *
     *   682 尿素 + 705 乙二醇 → 1000 碳酸乙烯酯 + 387 氨
     *   （60.06 + 62.07 = 88.06 + 2 × 17.03）
     *
     * 氨要一边生成一边抽走，否则平衡不往右走 —— 所以是"偏负压"而不是加压。
     */
    id: 'make/ethylene-carbonate',
    name: 'Ethylene Carbonate Production', name_zh: '碳酸乙烯酯制备',
    produces: [
      { item: 'mat/ethylene-carbonate', qty: q(1000) },
      // 这一步的氨带少量水，凝下来是 90–95 % 的氨水，回尿素合成前要提浓。
      { item: 'mat/ammonia', qty: q(387), gives: [{ param: 'concentration', kind: 'range', min: 90, max: 95 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/urea', qty: q(682) }] },
      { anyOf: [{ item: 'mat/ethylene-glycol', qty: q(705) }] },
    ],
    needs: [],
    performedBy: 'plant/mid-pressure-autoclave',
    under: [
      { param: 'temperature', min: 150, max: 180 },
      { param: 'pressure', min: 100, max: 300 },
    ],
  },
  {
    /**
     * THEIC：氰尿酸 + 3 碳酸乙烯酯 → THEIC + 3CO₂，150–180 °C。
     *
     *   494 氰尿酸 + 1011 碳酸乙烯酯 → 1000 THEIC + 505 二氧化碳
     *   （129.07 + 3 × 88.06 = 261.23 + 3 × 44.01）
     *
     * 碳酸酯既当反应物又当溶剂，过量 20 %；过量的部分随 CO₂ 一起蒸出、冷凝回用。
     */
    id: 'make/theic',
    name: 'THEIC (Trihydroxyethyl Isocyanurate) Production', name_zh: 'THEIC（三羟乙基异氰脲酸酯） 制备',
    produces: [
      {
        item: 'mat/theic',
        qty: q(1000),
        gives: [{ param: 'hydroxylValue', kind: 'range', min: 640, max: 660 }],
      },
      { item: 'mat/co2', qty: q(505) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/cyanuric-acid', qty: q(494) }] },
      { anyOf: [{ item: 'mat/ethylene-carbonate', qty: q(1011) }] },
    ],
    needs: [],
    performedBy: 'plant/mid-pressure-autoclave',
    under: [
      { param: 'temperature', min: 150, max: 180 },
      { param: 'pressure', min: 100, max: 300 },
    ],
    unbalanced_zh: '碳酸钾催化剂按 ppm 记、不列条目；过量碳酸酯冷凝回用，不进产物',
  },
  {
    /**
     * 乙二醇：甲醛 + 一氧化碳 + 2 氢 → 乙二醇，20–30 MPa、150–200 °C。
     *
     *   484 甲醛 + 451 一氧化碳 + 65 氢 → 1000 乙二醇
     *   （30.03 + 28.01 + 2 × 2.02 = 62.07，一比一）
     *
     * 两步接力：氢甲酰化出乙醇醛，再加氢成乙二醇。两步都要压 —— 所以用
     * `plant/autoclave`（150–550 °C、10–35 MPa），不是常压釜。
     */
    id: 'make/ethylene-glycol',
    name: 'Ethylene Glycol Production', name_zh: '乙二醇制备',
    produces: [{ item: 'mat/ethylene-glycol', qty: q(1000) }],
    uses: [
      { anyOf: [{ item: 'mat/formaldehyde', qty: q(484) }] },
      { anyOf: [{ item: 'mat/co', qty: q(451) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(65) }] },
    ],
    needs: [],
    performedBy: 'plant/autoclave',
    under: [
      { param: 'temperature', min: 150, max: 200 },
      { param: 'pressure', min: 20000, max: 30000 },
    ],
    unbalanced_zh: '铑/钴催化剂按 ppm 记、不列条目；对甲醛的选择性按 100 % 记（真实 80–90 %，副产甲酸甲醇）',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...POLYESTER_MONOMER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...POLYESTER_MONOMER_ROUTES];
