/**
 * 硼富集设备 —— 浸取槽 + 蒸发结晶器。
 *
 * `boron.ts` 的配比按 40 t 风化层 / 1 kg 硼砂；湿法台/蒸发器是实验室规模，
 * 撑不住 40 t 级浸取；本文件补两台可造设备。
 *
 * 边界：槽体/夹套/搅拌/滤板/阀走 sheet-shop、lathe、milling；
 * 两台都用 `make/...` 装配，不再用 `composedOf`（避免 mixed_production）。
 *
 * 镍内衬（`plant/boron-leach-tank/liner-ni`）：
 *   **浸取段是碱性硼砂（Na₂B₄O₇ + 纯碱），316L 够；BF₃ 段才是 HF**
 *   （H₃BO₃ + 3HF → BF₃ + 3H₂O），316L 会被腐蚀。内衬只为 BF₃ 段：
 *   2–3 mm 镍板分瓣折边 + 拼焊，覆盖筒体与封头。Ni + HF → NiF₂ 钝化膜；
 *   垫片用镍/石墨，不用 PTFE 弹性体（HF 会渗/溶胀，PTFE 只是耐蚀，
 *   不是这里的结构材料）。
 *
 *   ⚠️ 本文件的槽体走 `make/boron-leach-tank` 装配，没有 `composedOf`
 *   （composedOf + 产出路线会 mixed_production）；内衬作为那条路线的一个
 *   `uses`，等效于 composedOf。若以后把槽体改成 composedOf，把内衬从
 *   `uses` 移过去。
 *
 *   ⚠️ B 类：sheet-shop 只有折弯/剪切/手工焊，没有卷板机/压鼓机；
 *   10 m³ 筒体的整体卷圆与封头成型做不到。内衬按**分瓣折边 + 拼焊**写，
 *   不是整体卷焊；2–3 mm 镍板的折弯回弹、圆度、球面度、焊缝气密都未标定。
 *   不新增卷板机。
 *
 * 降级：
 *   · 浸取槽 10 m³、4 批 ×10 t 矿 + 5 t 水；固含 66 %，搅拌/过滤是设计值；
 *   · 结晶器 5 m³、1–10 kPa 真空；真空泵用现有 `plant/evaporator/pump` 改装；
 *   · 没有 RT/PT/氦检漏；HF 段（BF₃）用镍内衬，见 boron.ts 的 BF₃ 降级。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const BORON_PLANT_ITEMS: readonly Item[] = [
  /**
   * 浸取槽。**10 m³、80–100 °C、搅拌、过滤。**
   *
   *   volume 10 m³
   *   batch  10 t 矿 + 5 t 水
   *
   * 内衬：`plant/boron-leach-tank/liner-ni` 在 `make/boron-leach-tank` 的
   * `uses` 里（本文件用 make 装配，没有 composedOf；composedOf + 产出路线
   * 会 mixed_production）。浸取是碱性硼砂，内衬是为 BF₃ 段的 HF。
   *
   * 压力 100–200 kPa 绝压 = 常压/微正压（0–1 bar gauge），不是压力容器；
   * 没有 RT/PT/氦检漏。BF₃ 段的 HF 尾气走碱洗。
   */
  {
    id: 'plant/boron-leach-tank',
    name: 'Leaching Tank', name_zh: '浸取槽',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 80, max: 100 },
      { param: 'pressure', min: 100, max: 200 },
    ],
    props: [
      { param: 'volume', kind: 'range', min: 10, max: 10, unit: 'm³' },
      { param: 'batch', kind: 'range', min: 10, max: 10, unit: 't' },
    ],
  },

  /**
   * 蒸发结晶器。**5 m³、60–100 °C、1–10 kPa 真空。**
   */
  {
    id: 'plant/boron-crystallizer',
    name: 'Evaporative Crystallizer', name_zh: '蒸发结晶器',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 60, max: 100 },
      { param: 'pressure', min: 1, max: 10 },
    ],
    props: [{ param: 'volume', kind: 'range', min: 5, max: 5, unit: 'm³' }],
  },

  // 浸取槽零件
  { id: 'plant/boron-leach-tank/shell', name: 'Leaching Tank Shell', name_zh: '浸取槽壳体', unit: '件', category: 'part' },
  { id: 'plant/boron-leach-tank/jacket', name: 'Leaching Tank Jacket', name_zh: '浸取槽夹套', unit: '件', category: 'part' },
  { id: 'plant/boron-leach-tank/agitator', name: 'Leaching Tank Agitator', name_zh: '浸取槽搅拌器', unit: '件', category: 'part' },
  { id: 'plant/boron-leach-tank/filter-plate', name: 'Leaching Tank Filter Plate', name_zh: '浸取槽滤板', unit: '件', category: 'part' },
  { id: 'plant/boron-leach-tank/valve', name: 'Leaching Tank Valve', name_zh: '浸取槽阀', unit: '件', category: 'part' },

  /**
   * 镍内衬。**BF₃ 段的 HF 防护，不是浸取段的碱性硼砂。**
   *
   *   2–3 mm 镍板，分瓣折边 + 拼焊，覆盖筒体与封头；不是整体卷焊。
   *   Ni + HF → NiF₂ 钝化膜；垫片用镍/石墨，不用 PTFE 弹性体。
   *
   * ⚠️ B 类：sheet-shop 只有折弯/剪切/手工焊，没有卷板机/压鼓机；
   * 10 m³ 筒体的整体卷圆与封头成型做不到；折弯回弹、圆度、球面度、
   * 焊缝气密都未标定。不新增卷板机。
   */
  { id: 'plant/boron-leach-tank/liner-ni', name: 'Leaching Tank Nickel Liner', name_zh: '浸取槽镍内衬', unit: '件', category: 'part' },

  // 结晶器零件
  { id: 'plant/boron-crystallizer/shell', name: 'Evaporative Crystallizer Shell', name_zh: '蒸发结晶器壳体', unit: '件', category: 'part' },
  { id: 'plant/boron-crystallizer/jacket', name: 'Evaporative Crystallizer Jacket', name_zh: '蒸发结晶器夹套', unit: '件', category: 'part' },
  { id: 'plant/boron-crystallizer/agitator', name: 'Evaporative Crystallizer Agitator', name_zh: '蒸发结晶器搅拌器', unit: '件', category: 'part' },
  { id: 'plant/boron-crystallizer/vacuum-pump', name: 'Evaporative Crystallizer Vacuum Pump', name_zh: '蒸发结晶器真空泵', unit: '件', category: 'part' },
  { id: 'plant/boron-crystallizer/valve', name: 'Evaporative Crystallizer Valve', name_zh: '蒸发结晶器阀', unit: '件', category: 'part' },
];

export const BORON_PLANT_ROUTES: readonly Route[] = [
  {
    id: 'make/boron-leach-shell',
    name: 'Leaching Tank Shell Manufacturing', name_zh: '浸取槽壳体制造',
    produces: [{ item: 'plant/boron-leach-tank/shell', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(200) }] }],
    needs: ['plant/clean-room'],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(8) },
    unbalanced_zh: '316L 200 kg → 槽体 1 件；余是边角/焊材。没有 RT/PT',
  },
  {
    id: 'make/boron-leach-jacket',
    name: 'Leaching Tank Jacket Manufacturing', name_zh: '浸取槽夹套制造',
    produces: [{ item: 'plant/boron-leach-tank/jacket', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(50) }] }],
    needs: ['plant/clean-room'],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(4) },
    unbalanced_zh: '316L 50 kg → 夹套 1 件；余是边角。80–100 °C 热水/蒸汽',
  },
  {
    id: 'make/boron-leach-agitator',
    name: 'Leaching Tank Agitator Manufacturing', name_zh: '浸取槽搅拌器制造',
    produces: [{ item: 'plant/boron-leach-tank/agitator', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(20) }] },
      { anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/clean-room'],
    performedBy: 'plant/robot',
    rate: { hours: q(4) },
    unbalanced_zh: '不锈钢 20 kg + 7.5 kW 电机 1 台 → 搅拌 1 件；余是轴/桨叶切屑',
  },
  {
    id: 'make/boron-leach-filter',
    name: 'Leaching Tank Filter Plate Manufacturing', name_zh: '浸取槽滤板制造',
    produces: [{ item: 'plant/boron-leach-tank/filter-plate', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(10) }] }],
    needs: ['lathe', 'plant/clean-room'],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(3) },
    unbalanced_zh: '不锈钢 10 kg → 滤板 1 件；余是冲孔边角。滤布不在条目里',
  },
  {
    id: 'make/boron-leach-valve',
    name: 'Leaching Tank Valve Manufacturing', name_zh: '浸取槽阀制造',
    produces: [{ item: 'plant/boron-leach-tank/valve', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] }],
    needs: ['lathe', 'plant/clean-room'],
    performedBy: 'plant/milling-machine',
    rate: { hours: q(2) },
    unbalanced_zh: '不锈钢 1 kg → 阀 1 件；余是切屑。没有 PTFE 垫',
  },
  {
    /**
     * **2–3 mm 镍板 → 分瓣折边 + 拼焊 → 镍内衬 1 件。**
     *
     * 600 kg 镍板 ≈ 2.5 mm × ~27 m² × 8.9；覆盖筒体与封头。
     * sheet-shop 只有折弯/剪切/手工焊，没有卷板机；按分瓣折边 + 拼焊写，
     * 不是整体卷焊。lathe 只修法兰/翻边。rate 4 h。
     *
     * ⚠️ B 类：折弯回弹、圆度、球面度、焊缝气密未标定；没有 RT/PT/氦检漏。
     */
    id: 'make/boron-leach-tank-liner-ni',
    name: 'Leaching Tank Nickel Liner Manufacturing', name_zh: '浸取槽镍内衬制造',
    produces: [{ item: 'plant/boron-leach-tank/liner-ni', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/nickel', qty: q(600) }] }],
    needs: ['lathe', 'plant/clean-room'],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(4) },
    unbalanced_zh:
      '镍板 600 kg → 镍内衬 1 件；余是折边/拼焊边角与焊材。600 kg 按 2.5 mm × ~27 m² × 8.9 估；sheet-shop 没有卷板机，按分瓣折边 + 拼焊，不是整体卷焊（B 类）',
  },
  {
    id: 'make/boron-crystallizer-shell',
    name: 'Evaporative Crystallizer Shell Manufacturing', name_zh: '蒸发结晶器壳体制造',
    produces: [{ item: 'plant/boron-crystallizer/shell', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(150) }] }],
    needs: ['plant/clean-room'],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(6) },
    unbalanced_zh: '316L 150 kg → 结晶器壳体 1 件；余是边角/焊材',
  },
  {
    id: 'make/boron-crystallizer-jacket',
    name: 'Evaporative Crystallizer Jacket Manufacturing', name_zh: '蒸发结晶器夹套制造',
    produces: [{ item: 'plant/boron-crystallizer/jacket', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(40) }] }],
    needs: ['plant/clean-room'],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(3) },
    unbalanced_zh: '316L 40 kg → 夹套 1 件；余是边角。60–100 °C',
  },
  {
    id: 'make/boron-crystallizer-agitator',
    name: 'Evaporative Crystallizer Agitator Manufacturing', name_zh: '蒸发结晶器搅拌器制造',
    produces: [{ item: 'plant/boron-crystallizer/agitator', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(10) }] },
      { anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/clean-room'],
    performedBy: 'plant/robot',
    rate: { hours: q(3) },
    unbalanced_zh: '不锈钢 10 kg + 电机 1 台 → 搅拌 1 件；余是轴/桨叶切屑',
  },
  {
    id: 'make/boron-crystallizer-pump',
    name: 'Evaporative Crystallizer Vacuum Pump Manufacturing', name_zh: '蒸发结晶器真空泵制造',
    produces: [{ item: 'plant/boron-crystallizer/vacuum-pump', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'plant/evaporator/pump', qty: q(1) }] }],
    needs: ['plant/clean-room'],
    performedBy: 'plant/robot',
    rate: { hours: q(2) },
    unbalanced_zh: '现有 plant/evaporator/pump 1 件 → 真空泵 1 件；加冷阱挡水汽',
  },
  {
    id: 'make/boron-crystallizer-valve',
    name: 'Evaporative Crystallizer Valve Manufacturing', name_zh: '蒸发结晶器阀制造',
    produces: [{ item: 'plant/boron-crystallizer/valve', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] }],
    needs: ['lathe', 'plant/clean-room'],
    performedBy: 'plant/milling-machine',
    rate: { hours: q(2) },
    unbalanced_zh: '不锈钢 1 kg → 阀 1 件；余是切屑',
  },
  {
    id: 'make/boron-leach-tank',
    name: 'Leaching Tank Manufacturing', name_zh: '浸取槽制造',
    produces: [
      {
        item: 'plant/boron-leach-tank',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 10, max: 10 },
          { param: 'batch', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/boron-leach-tank/shell', qty: q(1) }] },
      { anyOf: [{ item: 'plant/boron-leach-tank/jacket', qty: q(1) }] },
      { anyOf: [{ item: 'plant/boron-leach-tank/agitator', qty: q(1) }] },
      { anyOf: [{ item: 'plant/boron-leach-tank/filter-plate', qty: q(1) }] },
      { anyOf: [{ item: 'plant/boron-leach-tank/valve', qty: q(2) }] },
      // 内衬只为 BF₃ 段的 HF；浸取段是碱性硼砂，316L 够。本文件用 make 装配，
      // 没有 composedOf（composedOf + 产出路线会 mixed_production）。
      { anyOf: [{ item: 'plant/boron-leach-tank/liner-ni', qty: q(1) }] },
    ],
    needs: ['plant/sheet-shop', 'lathe', 'plant/milling-machine', 'plant/clean-room'],
    performedBy: 'plant/robot',
    rate: { hours: q(12) },
    unbalanced_zh:
      '槽体 1 + 夹套 1 + 搅拌 1 + 滤板 1 + 阀 2 + 镍内衬 1 → 浸取槽 1 台。part 按件，质量在各自的 part 路线里（内衬 600 kg Ni 见 make/boron-leach-tank-liner-ni）。内衬是 BF₃ 段的 HF 防护（浸取段是碱性硼砂，不需要）；衬里为分瓣折边 + 拼焊（B 类，不是整体卷焊）',
  },
  {
    id: 'make/boron-crystallizer',
    name: 'Evaporative Crystallizer Manufacturing', name_zh: '蒸发结晶器制造',
    produces: [
      {
        item: 'plant/boron-crystallizer',
        qty: q(1),
        gives: [{ param: 'volume', kind: 'range', min: 5, max: 5 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/boron-crystallizer/shell', qty: q(1) }] },
      { anyOf: [{ item: 'plant/boron-crystallizer/jacket', qty: q(1) }] },
      { anyOf: [{ item: 'plant/boron-crystallizer/agitator', qty: q(1) }] },
      { anyOf: [{ item: 'plant/boron-crystallizer/vacuum-pump', qty: q(1) }] },
      { anyOf: [{ item: 'plant/boron-crystallizer/valve', qty: q(2) }] },
    ],
    needs: ['plant/sheet-shop', 'lathe', 'plant/milling-machine', 'plant/clean-room'],
    performedBy: 'plant/robot',
    rate: { hours: q(12) },
    unbalanced_zh: '壳体 1 + 夹套 1 + 搅拌 1 + 真空泵 1 + 阀 2 → 结晶器 1 台。part 按件，没有质量账',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...BORON_PLANT_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...BORON_PLANT_ROUTES];
