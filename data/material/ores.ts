/**
 * 选冶与化工的路线 —— 铬、铜、镍、氟。
 *
 * 这四条链的共同点是**富集**：把 ppm 级的东西从土里挑出来，浓度差就是代价。
 *
 *   铬  140:1     铬铁矿精矿 → 矿热炉 → 铬铁
 *   铜  8333:1    浮选 → 熔炼吹炼 → 电解精炼
 *   镍  250:1     浮选 → 矿热炉 → 电解精炼
 *   氟  30:1      磷灰石 → 硫酸分解 → 氢氟酸 → PTFE
 *
 * 铁、碳、耐火、钢那几条在 data/material/chain.ts；设备条目在
 * 与零件同一个文件。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 浮选药剂：曾经是断点，现已有路线
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 铜 8333:1、镍 250:1、磷 30:1 三次富集都靠**浮选**。而浮选要的是起泡剂
 * （松醇油、MIBC）、捕收剂（黄药）、调整剂（石灰、水玻璃）—— 全是有机物，
 * 或者要有机化工打底（黄药 = 醇 + 二硫化碳 + 氢氧化钠）。
 *
 * 火星的有机化学只有 PTFE 与 Bosch 碳：没有醇、没有苯、没有脂肪酸。
 * 浮选槽造得出来（见 data/material/refining.ts），药剂也已有路线
 * `make/flotation-reagent`（黄药 + 丁醇，3:1）。但这不是工业配方：
 * 丁醇起泡力比松醇油/MIBC 弱一档，黄药由乙醇与二硫化碳自制，
 * 收率与选择性都低一档。
 *
 * 重选与磁选不需要药剂 —— 铬那条（140:1）走重选，所以它仍是最省药剂的一条。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ORE_ITEMS: readonly Item[] = [
  /**
   * 三氧化硫。SO₂ 催化氧化的产物，遇水即成硫酸。
   *
   * 它自己不是产品，是两段制酸中间的那一段 —— 分开记的理由只有一个：
   * 转化要 420–450 °C，吸收要低于 120 °C。
   */
  { id: 'mat/so3', name: 'Sulfur Trioxide', name_zh: '三氧化硫', unit: 'kg', category: 'material' },

  /**
   * 聚合引发剂。过硫酸钠。
   *
   * 乳液聚合靠过硫酸盐受热分解出自由基。它由电解硫酸钠溶液制得 ——
   * 见 data/material/reagents.ts 的 make/initiator：硫酸钠是碱加硫酸中和来的，
   * 电解时阳极把 SO₄²⁻ 氧化成 S₂O₈²⁻，阴极出氢与碱。
   */
  { id: 'mat/polymerization-initiator', name: 'Polymerization Initiator', name_zh: '聚合引发剂', unit: 'kg', category: 'consumable' },
];

export const ORE_ROUTES: readonly Route[] = [
    // ═══ 铬：合金钢那一侧的硬骨头 ═══

    {
      /**
       * 铬铁矿重选。风化层 Cr₂O₃ 0.3%，精矿要 42% —— 富集比 140 : 1。
       *
       * 一吨精矿要挖 140 吨土。这不是估算，是品位比：0.42 / 0.003。
       * 全表里最贵的一次富集。
       */
      id: 'make/chromite-concentrate',
      name: 'Chromite Gravity Separation Production', name_zh: '铬铁矿重选制备',
      produces: [
        { item: 'mat/chromite-concentrate', qty: q(2261) },
        { item: 'mat/tailings', qty: q(314279) },
      ],
      uses: [{ anyOf: [{ item: 'mars/regolith', qty: q(316540) }] }],
      needs: [],
      performedBy: 'plant/ore-beneficiary',
    },
    {
      /**
       * FeCr₂O₄ + 4C → Fe + 2Cr + 4CO，1600–1700 °C。
       *
       * 1000 kg 铬铁（65% Cr、35% Fe）要精矿 2261 + 碳 300；
       * 出 700 kg 一氧化碳 + 861 kg 炉渣。
       */
      id: 'make/ferrochrome',
      name: 'Ferrochrome Production', name_zh: '铬铁制备',
      produces: [
        { item: 'mat/ferrochrome', qty: q(1000) },
        { item: 'mat/co', qty: q(700), gives: [{ param: 'purity', kind: 'range', min: 40, dir: 'atLeast' }] },
        { item: 'mat/slag', qty: q(861) },
      ],
      uses: [
        { anyOf: [{ item: 'mat/chromite-concentrate', qty: q(2261) }] },
        { anyOf: [{ item: 'mat/carbon', qty: q(300) }] },
      ],
      needs: ['plant/radiator'],
      performedBy: 'plant/submerged-arc-furnace',
      under: [{ param: 'temperature', min: 1600, max: 1700 }],
    },

    // ═══ 铜：八千倍富集 ═══

    {
      /**
       * 风化层浮选到铜精矿。30 ppm → 25%，富集 8333 : 1。
       *
       * 1000 kg 精矿要挖 833 万公斤土。这不是笔误，是品位比：0.25 / 0.00003。
       * 全表里最极端的一次富集，它说明铜在火星上**能造但造不起**。
       *
       * ⚠️ 药剂已有路线（`make/flotation-reagent`），但仍是自制黄药 + 丁醇；
       * 药剂 1 kg 随尾矿排走，所以按不平衡声明。
       */
      id: 'make/copper-concentrate',
      name: 'Regolith Flotation to Copper Concentrate Production', name_zh: '风化层浮选到铜精矿制备',
      produces: [
        { item: 'mat/copper-concentrate', qty: q(1000) },
        { item: 'mat/tailings', qty: q(8332334) },
      ],
      uses: [
        { anyOf: [{ item: 'mars/regolith', qty: q(8333333) }] },
        { anyOf: [{ item: 'mat/flotation-reagent', qty: q(1) }] },
      ],
      needs: [],
      performedBy: 'plant/ore-beneficiary',
      // 浮选是液固气三相，0.6 kPa 下气泡一离开液面就膨胀几十倍，泡沫层塌掉。
      under: [{ param: 'pressure', min: 100, max: 300 }],
      unbalanced_zh: '浮选药剂 1 kg 随尾矿排走，已并进 mat/tailings（8332334 + 精矿 1000 = 8333334）',
    },
    {
      /**
       * 铜精矿熔炼与吹炼。1000 kg 精矿（25% Cu）出 250 kg 泡铜。
       *
       * 按黄铜矿 CuFeS₂ 算收支：
       *   铜 250 · 铁 220 · 硫 252 · 脉石 278
       *   硫 252 全成 SO₂ 504，要氧 252
       *   铁 220 成 FeO 283，要氧 63
       *   炉渣 = FeO 283 + 脉石 278 = 561
       * 进 1000 + 315 氧 = 1315，出 250 + 504 + 561 = 1315。
       *
       * 上一版只写"进 1000 出 260 + 740"：铜从 250 kg 变成了 255 kg，
       * 硫凭空消失，而账是平的 —— 因为它把余量当炉渣倒掉了。
       *
       * ⚠️ 造渣熔剂（硅石 237 kg）还没建条目，所以这里按不进熔剂算平衡。
       */
      id: 'make/blister-copper',
      name: 'Copper Concentrate Smelting and Converting', name_zh: '铜精矿熔炼与吹炼制备',
      produces: [
        { item: 'mat/blister-copper', qty: q(250) },
        { item: 'mat/so2', qty: q(504) },
        { item: 'mat/slag', qty: q(561) },
      ],
      uses: [
        { anyOf: [{ item: 'mat/copper-concentrate', qty: q(1000) }] },
        { anyOf: [{ item: 'mat/oxygen', qty: q(315) }] },
      ],
      needs: [],
      performedBy: 'plant/melting-furnace',
      under: [{ param: 'temperature', min: 1300, max: 1500 }],
    },
    {
      /**
       * 电解精炼。粗铜做阳极，纯铜沉积到阴极：250 粗铜出 240 纯铜 + 10 阳极泥。
       *
       * 槽温 50–70 °C：温度低了离子扩散慢、高了阳极泥翻起来污染阴极。
       *
       * 阳极里 245 kg 铜，阴极收 240 —— 回收 98%，其余 5 kg 随阳极泥与电解液走掉。
       */
      id: 'make/copper',
      name: 'Electrolytic Refining', name_zh: '电解精炼',
      produces: [
        // 电解精炼的阴极铜按 99.95–99.99 记（工业阴极铜的常规档；`copper-fire.ts` 文件头也写着
        // “电解铜 99.99 %”）。原来这里写 99–99.9，与同文件三条路线的过程描述不符 ——
        // 火法只到 99.5，胆铜更低，三者共用一个窗口是占位，不是交付。
        { item: 'mat/copper', qty: q(240), gives: [{ param: 'purity', kind: 'range', min: 99.95, max: 99.99, dir: 'atLeast' }] },
        { item: 'mat/anode-sludge', qty: q(10) },
      ],
      uses: [{ anyOf: [{ item: 'mat/blister-copper', qty: q(250) }] }],
      needs: [],
      performedBy: 'plant/electrorefining',
      under: [{ param: 'temperature', min: 50, max: 70 }],
    },

    // ═══ 镍：电极与不锈钢 ═══

    {
      /**
       * 风化层浮选到镍精矿。400 ppm → 10%，富集 250 : 1。
       *
       * 1000 kg 精矿要 25 万公斤土 —— 比铜好两个数量级，仍然是一次巨量搬运。
       * 浮选药剂已有 `make/flotation-reagent`；这一步不再是断点，成本仍在富集比。
       */
      id: 'make/nickel-concentrate',
      name: 'Regolith Flotation to Nickel Concentrate Production', name_zh: '风化层浮选到镍精矿制备',
      produces: [
        { item: 'mat/nickel-concentrate', qty: q(1000) },
        { item: 'mat/tailings', qty: q(249001) },
      ],
      uses: [
        { anyOf: [{ item: 'mars/regolith', qty: q(250000) }] },
        { anyOf: [{ item: 'mat/flotation-reagent', qty: q(1) }] },
      ],
      needs: [],
      performedBy: 'plant/ore-beneficiary',
      under: [{ param: 'pressure', min: 100, max: 300 }],
      unbalanced_zh: '浮选药剂 1 kg 随尾矿排走，已并进 mat/tailings（249001 + 精矿 1000 = 250001）',
    },
    {
      /** 精矿 → 镍铁。矿热炉还原，1600 °C：1000 进，400 镍铁 + 600 炉渣。 */
      id: 'make/ferronickel',
      name: 'Concentrate Production', name_zh: '精矿制备',
      produces: [
        { item: 'mat/ferronickel', qty: q(400) },
        { item: 'mat/slag', qty: q(600) },
      ],
      uses: [{ anyOf: [{ item: 'mat/nickel-concentrate', qty: q(1000) }] }],
      needs: ['plant/radiator'],
      performedBy: 'plant/submerged-arc-furnace',
      under: [{ param: 'temperature', min: 1600, max: 1700 }],
    },
    {
      /**
       * 镍铁电解精炼。400 kg 镍铁（25% Ni）出 100 kg 电解镍。
       *
       * 那 300 kg 铁不进阴极，也不进阳极泥 —— 它溶进电解液，净化时以铁渣排出。
       * 阳极泥只有 10 kg（2.5%）：镍电解的阳极泥本来就少，金银铂族在内。
       *
       * 上一版把 300 kg 全记成阳极泥（75% 进料变渣），和铜那边 4% 的比例
       * 差两个数量级 —— 那是为了让账平，不是为了说清过程。
       */
      id: 'make/nickel',
      name: 'Ferronickel Electrolytic Refining', name_zh: '镍铁电解精炼',
      produces: [
        { item: 'mat/nickel', qty: q(100) },
        { item: 'mat/anode-sludge', qty: q(10) },
        { item: 'mat/slag', qty: q(290) },
      ],
      uses: [{ anyOf: [{ item: 'mat/ferronickel', qty: q(400) }] }],
      needs: [],
      performedBy: 'plant/electrorefining',
      under: [{ param: 'temperature', min: 50, max: 70 }],
    },

    // ═══ 氟：从磷灰石到 PTFE ═══

    {
      /**
       * 风化层浮选到磷灰石精矿。P₂O₅ 1% → 30%，富集 30 : 1。
       *
       * 磷是农业与阻燃剂的唯一来源，氟搭着它一起上来 —— 精矿里氟约 2.5%。
       * 磷灰石是四条链路里唯一可以走正浮选的，但它同样要药剂。
       */
      id: 'make/apatite-concentrate',
      name: 'Regolith Flotation to Apatite Concentrate Production', name_zh: '风化层浮选到磷灰石精矿制备',
      produces: [
        { item: 'mat/apatite-concentrate', qty: q(1000) },
        { item: 'mat/tailings', qty: q(29001) },
      ],
      uses: [
        { anyOf: [{ item: 'mars/regolith', qty: q(30000) }] },
        { anyOf: [{ item: 'mat/flotation-reagent', qty: q(1) }] },
      ],
      needs: [],
      performedBy: 'plant/ore-beneficiary',
      under: [{ param: 'pressure', min: 100, max: 300 }],
      unbalanced_zh: '浮选药剂 1 kg 随尾矿排走，已并进 mat/tailings（29001 + 精矿 1000 = 30001）',
    },
    {
      /**
       * 石膏热分解：CaSO₄·2H₂O → CaO + SO₂ + ½O₂ + 2H₂O。
       *
       * **取 1250–1400 °C，不是 900–1200。** 纯硫酸钙 1200 °C 起才有分解迹象，
       * 要到 1400 上下 SO₂ 分压才够用。900–1000 °C 那条路不是没有 ——
       *        就是它：「硫酸盐 + C + SiO₂ → SO₂，1173 K」，靠碳还原、
       * 靠硅石把石灰吃掉，产物是硅酸钙渣。那要碳与硅石两样投入，本链都没建，
       * 所以这里走纯热分解的干净版本，代价是温度高、产率低。
       *
       * 1000 kg 石膏 = 5.81 kmol，四项产出：
       *   SO₂ 372 · 石灰 326 · 氧 93 · 水 209 —— 加起来正好 1000。
       */
      id: 'make/so2',
      name: 'Gypsum Thermal Decomposition', name_zh: '石膏热分解制备',
      produces: [
        { item: 'mat/so2', qty: q(372) },
        { item: 'mat/lime', qty: q(326) },
        { item: 'mat/oxygen', qty: q(93), gives: [{ param: 'purity', kind: 'range', min: 90, max: 99, dir: 'atLeast' }] },
        { item: 'mat/water', qty: q(209), gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }] },
      ],
      uses: [{ anyOf: [{ item: 'mars/gypsum', qty: q(1000) }] }],
      needs: ['plant/radiator'],
      performedBy: 'plant/roaster',
      under: [{ param: 'temperature', min: 1250, max: 1400 }],
    },
    {
      /**
       * 催化转化：2SO₂ + O₂ →(V₂O₅) 2SO₃，420–450 °C。
       *
       *   1000 二氧化硫 + 250 氧 → 1250 三氧化硫
       *
       * 这一步与下一步分开，是因为温度差了 300 °C：转化要 420–450，
       * 吸收要低于 120。压在一条路线里，就说不清"在哪一度做"了。
       */
      id: 'make/so3',
      name: 'Sulfur Trioxide Production', name_zh: '催化转化制备',
      produces: [{ item: 'mat/so3', qty: q(1250) }],
      uses: [
        { anyOf: [{ item: 'mat/so2', qty: q(1000) }] },
        { anyOf: [{ item: 'mat/oxygen', qty: q(250) }] },
      ],
      needs: [],
      performedBy: 'plant/acid-plant',
      under: [{ param: 'temperature', min: 420, max: 450 }],
    },
    {
      /**
       * 吸收：SO₃ + H₂O → H₂SO₄，60–120 °C。
       *
       *   1250 三氧化硫 + 281 水 → 1531 硫酸
       *
       * **必须低于 120 °C**：温度高了酸被气带走，吸收不下来。
       * 实际是用 98% 的浓酸循环淋洗，不是用水直接吸 —— 用水吸会起酸雾。
       */
      id: 'make/sulfuric-acid',
      name: 'Absorption', name_zh: '吸收制备',
      produces: [
      { item: 'mat/sulfuric-acid', qty: q(1531), gives: [{ param: 'concentration', kind: 'range', min: 96, max: 98 }] },
    ],
      uses: [
        { anyOf: [{ item: 'mat/so3', qty: q(1250) }] },
        { anyOf: [{ item: 'mat/water', qty: q(281) }] },
      ],
      needs: [],
      performedBy: 'plant/acid-plant',
      under: [{ param: 'temperature', min: 60, max: 120 }],
    },
    {
      /**
       * 磷灰石加硫酸蒸出氢氟酸：
       * Ca₅(PO₄)₃F + 5H₂SO₄ → 5CaSO₄ + 3H₃PO₄ + HF
       *
       * 氟锚在精矿的 2.5% 上：1000 kg 精矿含氟 25 kg，即 1.32 kmol ——
       *   氟化氢 26 · 硫酸 645（5 倍摩尔）· 磷石膏 896 · 磷酸 387 · 脉石 336
       * 进 1645，出 1645。
       *
       * 一公斤精矿只出 26 克氟化氢 —— 氟在这条链上永远是"捎带"的那一点。
       * 副产的三样都还没有条目，所以这条按不平衡声明，不硬凑一个出口。
       */
      id: 'make/hf',
      name: 'Hydrofluoric Acid Production from Apatite by Sulfuric Acid Distillation', name_zh: '磷灰石加硫酸蒸出氢氟酸制备',
      produces: [
        { item: 'mat/hf', qty: q(26), gives: [{ param: 'concentration', kind: 'range', min: 60, max: 70 }] },
        // 磷石膏与磷酸跟氟化氢是**同一个反应的三股产物**（氟磷灰石 + 硫酸）。
        // 以前只写在 unbalanced_zh 里，于是 mat/phosphoric-acid 成了"有条目、无路线"，
        // 而热磷酸槽一槽就装 7.8 kg（`hot-phosphoric-bath.ts` 指出的断点）。
        { item: 'mat/phosphogypsum', qty: q(896), gives: [{ param: 'purity', kind: 'range', min: 70 }] },
        { item: 'mat/phosphoric-acid', qty: q(387), gives: [{ param: 'concentration', kind: 'range', min: 20, max: 30 }] },
        { item: 'mat/tailings', qty: q(336) },
      ],
      uses: [
        { anyOf: [{ item: 'mat/apatite-concentrate', qty: q(1000) }] },
        { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(645) }] },
      ],
      needs: [],
      performedBy: 'plant/acid-plant',
      under: [{ param: 'temperature', min: 200, max: 400 }],
      unbalanced_zh:
        '1000 精矿 + 645 硫酸 → 26 氟化氢 + 896 磷石膏 + 387 磷酸 + 脉石 336（已单列 mat/tailings）',
    },
    {
      /**
       * 磷酸浓缩（70–85%）：把 `make/hf` 副产的 20–30% 稀酸蒸掉水。
       *
       *   1000 kg 20–30% 磷酸 → 约 300 kg 70–85% 磷酸；余 700 kg 水蒸发/冷凝。
       *
       * 70–85% 这一段是给 `make/deprocess-metal-al` 用的（去铝，50–60 °C）。
       * 85% 那一段见下一条，给 `make/deprocess-nitride` 的 160–180 °C 热磷酸。
       */
      id: 'make/phosphoric-acid-75',
      name: 'Phosphoric Acid Concentration', name_zh: '磷酸浓缩',
      produces: [
        { item: 'mat/phosphoric-acid', qty: q(300), gives: [{ param: 'concentration', kind: 'range', min: 70, max: 85 }] },
        { item: 'mat/water', qty: q(700), gives: [{ param: 'conductivity', kind: 'range', min: 1, max: 100 }] },
      ],
      uses: [
        { anyOf: [{ item: 'mat/phosphoric-acid', qty: q(1000), need: [{ param: 'concentration', kind: 'range', min: 20, max: 30 }], onRelax: 'functional-kept' }] },
      ],
      needs: [],
      performedBy: 'plant/acid-plant',
      under: [
        { param: 'temperature', min: 100, max: 150 },
        { param: 'pressure', min: 100, max: 500 },
      ],
      unbalanced_zh: '1000 kg 20–30% 磷酸 → 300 kg 70–85% 磷酸 + 蒸发/冷凝水 700（已单列 mat/water）',
    },
    {
      /**
       * 磷酸浓缩（85%）：同一套酸厂，继续把水蒸到 85%。
       *
       *   1000 kg 20–30% 磷酸 → 294 kg 85% 磷酸；余 706 kg 水。
       *
       * 85% 是 `make/deprocess-nitride` 的下限：热磷酸 160–180 °C 溶氮化硅。
       */
      id: 'make/phosphoric-acid-85',
      name: 'Phosphoric Acid Concentration', name_zh: '磷酸浓缩',
      produces: [
        { item: 'mat/phosphoric-acid', qty: q(294), gives: [{ param: 'concentration', kind: 'range', min: 85, max: 85 }] },
      ],
      uses: [
        { anyOf: [{ item: 'mat/phosphoric-acid', qty: q(1000), need: [{ param: 'concentration', kind: 'range', min: 20, max: 30 }], onRelax: 'functional-kept' }] },
      ],
      needs: [],
      performedBy: 'plant/acid-plant',
      under: [
        { param: 'temperature', min: 150, max: 200 },
        { param: 'pressure', min: 100, max: 500 },
      ],
      unbalanced_zh: '1000 kg 20–30% 磷酸 → 294 kg 85% 磷酸；余 706 kg 水蒸发/冷凝，未计条目',
    },
    {
      /**
       * PTFE。四氟乙烯聚合：nC₂F₄ → (C₂F₄)ₙ，水相自由基聚合，50–80 °C。
       *
       * 1000 kg PTFE = 碳 240 + 氟 760，而 760 kg 氟正好是 1000 kg 四氟乙烯里的
       * 氟（C₂F₄ 含氟 76%）。所以这条路线只写两样：单体与引发剂。
       *
       * 三样缺的东西现在都有来路：
       *   单体    ← HCFC-22 ← 氯仿 ← 甲烷 ← CO₂ + H₂（data/material/organic.ts）
       *   氟      ← HF：每 1000 kg PTFE 用 800 kg，其中 463 在氟化那一步进环
       *   引发剂  ← 过硫酸盐，已有 `make/initiator` 路线（电解硫酸钠）
       *
       * ⚠️ 引发剂 2 kg 进了链端：不算杂质，但也不再是产品 —— 声明为不平衡。
       */
      id: 'make/ptfe',
      name: 'PTFE Production', name_zh: '聚四氟乙烯制备',
      produces: [
        {
          item: 'mat/ptfe',
          qty: q(1000),
          gives: [{ param: 'frictionCoefficient', kind: 'range', min: 0.04, max: 0.10 }],
        },
      ],
      uses: [
        { anyOf: [{ item: 'mat/tfe', qty: q(1000) }] },
        { anyOf: [{ item: 'mat/polymerization-initiator', qty: q(2) }] },
      ],
      needs: [],
      performedBy: 'plant/polymer-plant',
      under: [{ param: 'temperature', min: 50, max: 80 }],
      unbalanced_zh: '四氟乙烯 1000 + 引发剂 2 → 1000 kg PTFE；③ 可接受：引发剂 2 kg 进入链端，不是副产，不建条目',
    },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ORE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...ORE_ROUTES];
