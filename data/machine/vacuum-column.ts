/**
 * 真空精馏塔 —— 二甲苯三个异构体只差 5.3 °C，本层那台塔分不开。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么要单造一台塔
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `data/material/xylene-chain.ts` 停在二甲苯：苯酐只能从**邻二甲苯**氧化来
 * （混二甲苯氧化出一锅焦油），而三个异构体的沸点是
 *
 *   邻 144.4 · 间 139.1 · 对 138.4 °C
 *
 * 邻与间差 5.3 °C —— 分得开，但要**约 100 块理论板、回流比 8–10**；常压下
 * 塔釜要 160–170 °C，二甲苯在那温度上结焦，所以必须**减压**：塔顶 20–50 kPa、
 * 塔釜 100–150 °C。
 *
 * 本层原有那台 `plant/distillation-tower` 的 `holds` 是 40–80 °C / 300–1000 kPa
 * —— 压着操作的精馏塔（那是给别的东西用的），二甲苯在它里面是液体，
 * 一塔底料。**换窗口去迁就需求就是造活**，所以另立一台。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 它是什么：一块塔板就是一次平衡
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   理论板数  N ≈ 100（孔径 5 mm 筛板，板间距 300 mm，效率按 0.6 折）
 *   塔径      φ600（气相负荷按 F 因子 1.2 算，液泛线以下 70 %）
 *   塔高      100 × 0.3 + 顶/底空间 ≈ **9 m**（分两段运、现场法兰对接）
 *   回流比    8–10（相对挥发度 1.06，要回流换板数）
 *   压降      每板 0.3–0.5 kPa × 100 = 30–50 kPa —— **塔顶的真空度就是这么来的**
 *
 * 所以它不是"一台塔"，是**塔体 + 塔板 + 再沸器 + 冷凝器 + 真空机组**五件套：
 *
 *   再沸器  把塔釜液加热成上升蒸气（列管式，0.3 MPa 蒸汽）
 *   冷凝器  把塔顶蒸气凝下来，一部分回流、一部分出料（同一件，两台）
 *   真空机组 水环泵打粗真空，罗茨泵把塔顶拉到 20 kPa
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 设备窗口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   temperature 40–160 °C   塔釜 150 °C 结焦线以下，塔顶 100 °C 以上（20 kPa 下）
 *   pressure    5–60 kPa    塔顶 20–50，罗茨泵极限 5 —— 再低就漏气漏得比抽得快
 *
 * ⚠️ **不做填料塔。** 规整填料（波纹板）效率高、压降低，但它的薄板成型要
 * 0.1 mm 级的波纹辊，本层没有；筛板只要冲孔，`plant/press` 干得了。
 * 代价是压降大 3–5 倍、持液量大 —— 对 100 块板就是这个塔高。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 已知缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① **没有水力学试验**：液泛点、板效率 0.6、压降 0.3–0.5 kPa/板全是设计值。
 *     验它要在塔上开测压点、做全回流试验 —— 本层能开孔、能测压差，但
 *     **没有二甲苯的组成分析**（要气相色谱），所以"分得开没分得开"只能看
 *     塔顶塔底密度与折光，判不到 1 % 的组成。
 *  ② **塔体焊缝没有射线探伤**：9 m 的塔卷焊，环缝要 100 % RT 才合规。本层
 *     **没有 X 光机**，只能水压试验 0.6 MPa 保压 30 min、肥皂水看漏。
 *  ③ **保温只到矿棉抹面**：塔顶冷凝器不算，塔体中段散热会让回流液过冷，
 *     实际回流比要靠冷凝器旁路调。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const VACUUM_COLUMN: Item = {
  id: 'plant/vacuum-column',
  name: '真空柱',
  unit: '台',
  category: 'machine',
  holds: [
    { param: 'temperature', min: 40, max: 160 },
    { param: 'pressure', min: 5, max: 60 },
  ],
  composedOf: [
    { item: 'plant/vacuum-column/shell', qty: q(1) },
    { item: 'plant/vacuum-column/trays', qty: q(1) },
    // 再沸器与冷凝器是同一件换热器，各一台。
    { item: 'plant/vacuum-column/exchanger', qty: q(2) },
    { item: 'plant/vacuum-column/pump', qty: q(1) },
    // 真空机组一台电机，回流泵一台电机。
    { item: 'std/motor-7.5kw-4p', qty: q(2) },
  ],
};

export const VACUUM_COLUMN_PARTS: readonly Item[] = [
  /**
   * 塔体。φ600 × 9 000，6 mm 不锈钢卷焊，两段法兰对接。
   *
   * 9 m 一次卷不出来（本层没有 12 m 的卷板机），所以分两段、现场法兰对接 ——
   * 商品塔也这么运。塔体上要开：进料口、回流口、塔顶蒸气口、塔釜液口、
   * 10 个测压点、3 个人孔。
   */
  { id: 'plant/vacuum-column/shell', name: '真空柱塔体', unit: '件', category: 'part',
    props: [{ param: 'leakRate', kind: 'range', min: 0, max: 0.5, unit: 'kPa/h', dir: 'atMost' }] },

  /**
   * 塔板组。100 块筛板 + 降液管 + 受液盘，0.8 mm 不锈钢冲孔。
   *
   * 孔径 5 mm、开孔率 8 % —— 孔小了漏液、孔大了雾沫夹带。冲孔在
   * `plant/press` 上分 100 次冲，每块板 1 800 个孔。
   */
  { id: 'plant/vacuum-column/trays', name: '真空柱塔板组', unit: '件', category: 'part' },

  /**
   * 列管换热器。再沸器与冷凝器是同一件，各一台（共 2 台）。
   *
   * φ400 壳体 + 60 根 φ19×2 × 3 000 的管，管板胀接。与
   * `plant/distillation-tower/heat-exchanger` 同一类，只是面积按 15 m² 算。
   */
  { id: 'plant/vacuum-column/exchanger', name: '真空柱列管换热器', unit: '件', category: 'part' },

  /**
   * 真空机组。水环泵打粗真空（到 10 kPa），罗茨泵接力（到 5 kPa）。
   *
   * 泵体铸铁、叶轮与分配板不锈钢、轴封 PTFE。与 `plant/evaporator` 的那套
   * 泵不是同一件：那是一级水环，这里是水环 + 罗茨两级，抽速要 100 m³/h。
   */
  { id: 'plant/vacuum-column/pump', name: '真空柱真空机组', unit: '件', category: 'part' },
];

export const VACUUM_COLUMN_ROUTES: readonly Route[] = [
  {
    /**
     * 塔体。下料 → 卷板 → 纵缝焊 → 环缝焊（两段）→ 开孔 → 法兰 → 水压试验。
     *
     *   900 kg 不锈钢 + 2 kg PTFE（法兰垫）→ 1 件塔体
     *
     * 6 mm × 17 m² × 7 900 = 806 kg，加法兰、人孔、接管与 10 % 余量 → 900 kg。
     */
    id: 'make/vacuum-column-shell',
    name: '真空柱塔体制造',
    produces: [
      {
        item: 'plant/vacuum-column/shell',
        qty: q(1),
        gives: [{ param: 'leakRate', kind: 'range', min: 0.01, max: 0.1 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(900) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(2) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
    unbalanced_zh: '卷板切边与开孔挖掉的料约 12 %（108 kg）不进产物；水压试验用水不计',
  },
  {
    /**
     * 塔板。冲孔 → 折边 → 装降液管 → 与塔节点焊。
     *
     *   200 kg 不锈钢 → 100 块筛板
     *
     * 每块 φ590 × 0.8：0.273 m² × 0.0008 × 7 900 = **1.73 kg**；100 块 173 kg，
     * 加降液管、受液盘、支撑圈 → 200 kg。
     */
    id: 'make/vacuum-column-trays',
    name: '真空柱塔板组制造',
    produces: [{ item: 'plant/vacuum-column/trays', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(200) }] }],
    needs: ['plant/press'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /**
     * 换热器。壳体卷焊 + 管板钻孔 + 60 根管胀接 + 管程/壳程水压。
     *
     *   300 kg 不锈钢 + 120 kg 铜（管板与折流板的铜密封面）→ 1 台换热器
     *
     * 传热面积：60 × π × 0.019 × 3 000 = **10.7 m²**；再沸器要 15 m²，
     * 所以壳程加两根折流板、管数按 80 根算（余量在管板钻孔上，不在长度上）。
     */
    id: 'make/vacuum-column-exchanger',
    name: '真空柱列管换热器制造',
    produces: [{ item: 'plant/vacuum-column/exchanger', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(300) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(120) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(2) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /**
     * 真空机组。泵体铸 → 车叶轮与分配板 → 装轴封 → 与罗茨串起来 → 试抽。
     *
     *   200 kg 铸铁 + 80 kg 不锈钢 + 2 kg PTFE → 1 套机组
     *
     * 水环泵的叶轮偏心 5 mm，靠水环密封；罗茨那两级是两叶转子，间隙 0.15 mm
     * 决定了极限真空 —— 间隙大了抽不到 5 kPa，小了会咬。
     */
    id: 'make/vacuum-column-pump',
    name: '真空柱真空机组制造',
    produces: [{ item: 'plant/vacuum-column/pump', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(200) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(80) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(2) }] },
    ],
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/press',
    unbalanced_zh: '铸件浇冒口与加工余量约 15 %（30 kg 回炉），铸铁件按成品 200 kg 记',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...VACUUM_COLUMN_PARTS, VACUUM_COLUMN];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/vacuum-column',
    name: '真空柱装配',
    produces: [{
      item: 'plant/vacuum-column',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...VACUUM_COLUMN_ROUTES, ...ASSEMBLY_ROUTES];
