/**
 * 硼链 —— 火星风化层 → 硼砂 → 硼酸 → BF₃ → B⁺ 植入。
 *
 * 配比按 **40 t 风化层 @10 ppm / 1 kg 硼砂**：
 *
 *   40 000 kg 风化层 × 10 ppm = 0.4 kg B
 *   × 30 % 回收 = 0.12 kg B
 *   硼砂 11.3 % B ⇒ 0.12 / 0.113 = 1.06 kg 理论，取 1 kg
 *
 * 4 批 ×10 t 矿 + 5 t 水 + 25 kg 纯碱；80–100 °C、6 h/批；
 * 过滤后 60–100 °C / 1–10 kPa 蒸发结晶。
 *
 * 设备：`plant/boron-leach-tank`（10 m³、80–100 °C、搅拌/过滤、镍内衬）与
 * `plant/boron-crystallizer`（5 m³、60–100 °C、真空）。
 *
 * ⚠️ 降级：
 *   · 风化层硼品位仍只有 10–100 ppm 区间，没有矿点实测；40 t 是 10 ppm 低端。
 *   · 30 % 回收率是设计值；玻璃包裹的硼拿不到。
 *   · 10 m³ 槽 4 批 ×（10 t 矿 + 5 t 水）= 66 % 固含，搅拌/过滤没有实测。
 *   · 硼酸 600 g 是 1 kg 硼砂 + 0.5 kg 硫酸的 60 % 收率；钠盐 700 g 是副产。
 *   · BF₃ 段用 316L 浸取槽 + 镍内衬（`plant/boron-leach-tank/liner-ni`）：
 *     Ni + HF → NiF₂ 钝化膜；但内衬是分瓣折边 + 拼焊（sheet-shop 没有
 *     卷板机），不是整体卷焊；仍无 HF 气密/RT，垫片用镍/石墨，不用 PTFE
 *     弹性体。槽体 100–200 kPa 绝压 = 常压/微正压，不是压力容器；
 *     HF 尾气碱洗。
 *   · BF₃ 纯度 99.5 %、水 ≤10 ppm 是目标值；没有露点/质谱实测。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const BORON_ITEMS: readonly Item[] = [
  /**
   * 硼砂 Na₂B₄O₇·10H₂O。
   *
   *   boron  11.3 %
   *   purity 95–99 %
   */
  {
    id: 'mat/borax',
    name: 'Borax Na₂B₄O₇·10H₂O', name_zh: '硼砂 Na₂B₄O₇·10H₂O',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'boron', kind: 'range', min: 11.3, max: 11.3, unit: '%' },
      { param: 'purity', kind: 'range', min: 95, max: 99, unit: '%', dir: 'atLeast' },
    ],
  },

  /** 硼酸 H₃BO₃。 */
  {
    id: 'mat/boric-acid',
    name: 'Boric Acid H₃BO₃', name_zh: '硼酸 H₃BO₃',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 0, max: 0.5, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 三氟化硼 BF₃。
   *
   *   purity 99.5–100 %
   *   water  ≤10 ppm（0.001 %；遇水水解成 H₃BO₃ + HBF₄）
   */
  {
    id: 'mat/boron-trifluoride',
    name: 'Boron Trifluoride BF₃', name_zh: '三氟化硼 BF₃',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99.5, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 0, max: 0.001, unit: '%', dir: 'atMost' },
    ],
  },
];

export const BORON_ROUTES: readonly Route[] = [
  {
    /**
     * **40 t 风化层 + 20 t 水 + 100 kg 纯碱 → 1 kg 硼砂。**
     *
     * 4 批 ×（10 t 矿 + 5 t 水 + 25 kg 纯碱），80–100 °C、6 h/批；
     * 过滤后 60–100 °C / 1–10 kPa 蒸发结晶；rate 72 h。
     *
     * 硼账：40 000 × 10 ppm = 0.4 kg B；30 % 回收 = 0.12 kg B；
     * 硼砂 11.3 % B ⇒ 1.06 kg 理论，取 1 kg。
     */
    id: 'make/borax',
    name: 'Borax Na₂B₄O₇·10H₂O Production', name_zh: '硼砂 Na₂B₄O₇·10H₂O 制备',
    produces: [
      {
        item: 'mat/borax',
        qty: q(1),
        gives: [
          { param: 'boron', kind: 'range', min: 11.3, max: 11.3 },
          { param: 'purity', kind: 'range', min: 95, max: 99 },
        ],
      },
      { item: 'mat/tailings', qty: q(40000) },
      {
        item: 'mat/borax-mother-liquor',
        qty: q(20099),
        gives: [
          { param: 'borax', kind: 'range', min: 2, max: 5 },
          { param: 'carbonate', kind: 'range', min: 3, max: 8 },
          { param: 'form', kind: 'enum', oneOf: ['solution'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mars/regolith', qty: q(40000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(20000) }] },
      { anyOf: [{ item: 'mat/soda-ash', qty: q(100) }] },
    ],
    needs: [],
    rate: { hours: q(72) },
    steps: [
      {
        note_zh:
          '① 4 批浸取：每批 10 t 矿 + 5 t 水 + 25 kg 纯碱，80–100 °C、6 h、搅拌；纯碱把硼酸转成可溶硼酸钠。4 批共 40 t 矿 + 20 t 水 + 100 kg 纯碱',
        performedBy: 'plant/boron-leach-tank',
        under: [
          { param: 'temperature', min: 80, max: 100 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
      {
        note_zh:
          '② 过滤：滤板挡 40 t 尾矿，滤液进结晶器；玻璃包裹的硼留在尾矿里（回收率 30 % 的来源）',
        performedBy: 'plant/boron-leach-tank',
        under: [
          { param: 'temperature', min: 80, max: 95 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
      {
        note_zh:
          '③ 蒸发结晶：60–100 °C / 1–10 kPa，滤液浓缩到硼砂饱和，冷却结晶 Na₂B₄O₇·10H₂O；母液返回下一批',
        performedBy: 'plant/boron-crystallizer',
        under: [
          { param: 'temperature', min: 60, max: 100 },
          { param: 'pressure', min: 1, max: 10 },
        ],
      },
      {
        note_zh: '④ 离心/干燥：晶体 1 kg，附着水 ≤1 %；没有离心机条目，用滤板 + 60–100 °C 烘干',
        performedBy: 'plant/boron-crystallizer',
        under: [
          { param: 'temperature', min: 60, max: 100 },
          { param: 'pressure', min: 1, max: 10 },
        ],
      },
    ],
    unbalanced_zh:
      '风化层 40 000 + 水 20 000 + 纯碱 100 → 硼砂 1 + 尾矿 40 000 + 母液 20 099（已单列 mat/tailings + mat/borax-mother-liquor）；硼账：0.4 kg B×30 %=0.12 kg B → 1.06 kg 硼砂，取 1 kg；其余 0.28 kg B 在尾矿（玻璃包裹/未溶）',
  },

  {
    /**
     * **1 kg 硼砂 + 0.5 kg 硫酸 → 0.6 kg 硼酸 + 0.7 kg 硫酸钠。**
     *
     * Na₂B₄O₇ + H₂SO₄ + 5H₂O → 4H₃BO₃ + Na₂SO₄
     * 80–100 °C、8 h；冷却结晶硼酸，母液回收硫酸钠。
     */
    id: 'make/boric-acid',
    name: 'Boric Acid H₃BO₃ Production', name_zh: '硼酸 H₃BO₃制备',
    produces: [
      {
        item: 'mat/boric-acid',
        qty: q(3, 5),
        gives: [
          { param: 'purity', kind: 'range', min: 99, max: 100 },
          { param: 'water', kind: 'range', min: 0, max: 0.5 },
        ],
      },
      // 副产：0.7 kg 硫酸钠；不返回硼链
      { item: 'mat/sodium-sulfate', qty: q(7, 10) },
      {
        item: 'mat/boric-acid-mother-liquor',
        qty: q(1, 5),
        gives: [
          { param: 'boron', kind: 'range', min: 1, max: 3 },
          { param: 'sulfate', kind: 'range', min: 2, max: 5 },
          { param: 'form', kind: 'enum', oneOf: ['solution'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/borax', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(1, 2) }] },
    ],
    needs: [],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh: '① 酸化：1 kg 硼砂 + 0.5 kg 硫酸 + 水，80–100 °C / 2 h；硼砂转硼酸，硫酸钠留在母液',
        performedBy: 'plant/boron-leach-tank',
        under: [
          { param: 'temperature', min: 80, max: 100 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
      {
        note_zh: '② 冷却结晶：60–100 °C / 1–10 kPa 浓缩，冷却到 20–30 °C 析出硼酸；母液去硫酸钠回收',
        performedBy: 'plant/boron-crystallizer',
        under: [
          { param: 'temperature', min: 60, max: 100 },
          { param: 'pressure', min: 1, max: 10 },
        ],
      },
      {
        note_zh: '③ 过滤/干燥：硼酸 0.6 kg，纯度 99 %；没有离心机，用滤板 + 60–80 °C 烘干',
        performedBy: 'plant/boron-crystallizer',
        under: [
          { param: 'temperature', min: 60, max: 80 },
          { param: 'pressure', min: 1, max: 10 },
        ],
      },
    ],
    unbalanced_zh:
      '硼砂 1 + 硫酸 0.5 → 硼酸 0.6 + 硫酸钠 0.7 + 母液/洗水 0.2（已单列 mat/boric-acid-mother-liquor，可回浸出）；1.5 = 1.5',
  },

  {
    /**
     * **0.6 kg 硼酸 + 0.9 kg HF + 1.2 kg 硫酸 → 0.6 kg BF₃。**
     *
     * H₃BO₃ + 3HF → BF₃ + 3H₂O（硫酸吸水/干燥）
     * 60–80 °C、8 h；尾气干燥（浓硫酸），BF₃ 冷凝/钢瓶。
     *
     * ⚠️ 反应器是 316L 浸取槽 + 镍内衬：Ni + HF → NiF₂ 钝化膜；
     * 仍无 HF 气密/RT，垫片用镍/石墨，不用 PTFE 弹性体。
     * 槽体 100–200 kPa 绝压 = 常压/微正压，不是压力容器；HF 尾气碱洗。
     * 内衬是 B 类：sheet-shop 只有折弯/剪切/手工焊，没有卷板机，
     * 按分瓣折边 + 拼焊写，不是整体卷焊；圆度/球面度/焊缝气密未标定。
     * BF₃ 纯度 99.5 %、水 ≤10 ppm 是目标值，没有露点/质谱实测。
     */
    id: 'make/boron-trifluoride',
    name: 'Boron Trifluoride BF₃ Production', name_zh: '三氟化硼 BF₃制备',
    produces: [
      {
        item: 'mat/boron-trifluoride',
        qty: q(3, 5),
        gives: [
          { param: 'purity', kind: 'range', min: 99.5, max: 100, record: 'mat/bf3-yield-record' },
          { param: 'water', kind: 'range', min: 0, max: 0.001, record: 'mat/bf3-yield-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/boric-acid', qty: q(3, 5) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(9, 10) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(6, 5) }] },
    ],
    needs: [],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh: '① 配料：0.6 kg 硼酸 + 0.9 kg HF + 1.2 kg 浓硫酸；硫酸吸水，抑制 BF₃ 水解',
        performedBy: 'plant/boron-leach-tank',
        under: [
          { param: 'temperature', min: 80, max: 80 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
      {
        note_zh:
          '② 反应：60–80 °C，H₃BO₃ + 3HF → BF₃ + 3H₂O；镍内衬槽：Ni + HF → NiF₂ 钝化膜；仍无 HF 气密/RT，垫片用镍/石墨，不用 PTFE 弹性体。槽体 100–200 kPa 绝压 = 常压/微正压，不是压力容器；HF 尾气碱洗',
        performedBy: 'plant/boron-leach-tank',
        under: [
          { param: 'temperature', min: 80, max: 80 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
      {
        note_zh: '③ 干燥/冷凝：尾气过浓硫酸干燥，BF₃ 冷凝到钢瓶；水 ≤10 ppm 是目标，没有露点仪',
        performedBy: 'plant/boron-leach-tank',
        under: [
          { param: 'temperature', min: 80, max: 80 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
    ],
    unbalanced_zh:
      '硼酸 0.6 + HF 0.9 + 硫酸 1.2 → BF₃ 0.6；2.7 kg 进、0.6 kg 出，其余是过量 HF/硫酸/水与尾气。硼账：0.6 kg 硼酸×17.5 %=0.105 kg B；0.6 kg BF₃×13.1 %=0.079 kg B，收率 75 %（设计）。镍内衬是设备件、不按批计；Ni + HF → NiF₂ 钝化膜，微量镍进废液/渣，未计入。内衬分瓣折边 + 拼焊（B 类，不是整体卷焊）；HF 尾气碱洗',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...BORON_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...BORON_ROUTES];
