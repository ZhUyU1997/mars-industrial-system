/**
 * 三条废料回炉路线：铜、单晶硅、硬质合金。
 *
 * 这三种边角料本来都是联产无去处：铜箔/包铜的边角、硅棒切头切尾、
 * 硬质合金刀片磨屑。它们不需要新设备 —— 高温炉、直拉炉、选矿台、
 * 湿法台与电阻炉都是现成的；这里只把"回炉"这一步写成路线。
 *
 * 数量按各自主产线的边角率取：铜 1.12 kg 废料出 1 kg 铜；硅 1.05 kg
 * 头尾料出 1 kg 单晶；硬质合金 1.1 kg 废刀片出 0.95 kg WC 粉。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DATA_ITEMS: readonly Item[] = [];

export const DATA_ROUTES: readonly Route[] = [
  {
    /**
     * 废铜重熔：铜箔/包铜边角（Cu 85–95 %）→ 阳极铜。
     *
     *   废铜 1.12 + 硼砂 0.02 + 氧 0.05 → 铜 1 kg（99–99.5 %）+ 渣 0.19 kg
     *
     * 氧化把 Zn/Sn 赶进渣，硼砂造渣；1100–1200 °C 的高温炉够用。
     */
    id: 'make/copper-from-scrap',
    name: 'Copper Production from Scrap', name_zh: '废铜重熔制备',
    produces: [
      {
        item: 'mat/copper',
        qty: q(1),
        gives: [{ param: 'purity', kind: 'range', min: 99, max: 99.5 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper-scrap', qty: q(28, 25) }] },
      { anyOf: [{ item: 'mat/borax', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/high-temp-furnace',
    under: [{ param: 'temperature', min: 1100, max: 1200 }],
    rate: { hours: q(4) },
    unbalanced_zh:
      '废铜 1.12 + 硼砂 0.02 + 氧 0.05 → 铜 1 + 渣 0.19；渣去尾料，锌/锡按氧化物计',
  },

  {
    /**
     * 硅头尾料回炉：切头/切尾（Si 99–99.9 %）→ 单晶硅。
     *
     *   头尾料 1.05 + 氩 1 + 石英坩埚 0.1 → 单晶硅 1 kg
     *
     * 先酸洗去切割液与表层，再装坩埚、抽真空/充氩、直拉。头尾料的
     * 电阻率与主棒差一档，所以这条路线交的是"回炉料"，不冒充电子级。
     */
    id: 'make/silicon-from-crop',
    name: 'Silicon Top and Tail Scrap Remelting Production', name_zh: '硅头尾料回炉制备',
    produces: [{ item: 'mat/silicon-single', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-crop-end', qty: q(21, 20) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1) }] },
      { anyOf: [{ item: 'mat/quartz-crucible', qty: q(1, 10) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '破碎 + 酸洗去切割液与表层，水洗到中性',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 80 }],
      },
      {
        note_zh: '装石英坩埚、抽真空后充氩，直拉到 1410–1480 °C',
        performedBy: 'plant/cz-puller',
        under: [{ param: 'temperature', min: 1410, max: 1480 }],
      },
      { note_zh: '切头尾、取样、装袋', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      '头尾料 1.05 + 氩 1 + 石英坩埚 0.1 → 单晶硅 1 kg；0.05 是酸洗与切损，氩与坩埚残体不计回收',
  },

  {
    /**
     * 硬质合金回收：废刀片（WC 85–95 %、Ni 8–12 %）→ WC 粉。
     *
     *   废合金 1.1 + HCl 0.2 + 水 2 → WC 粉 0.95 kg + 镍钴氯化液 0.35 kg
     *
     * 破碎到 <10 µm 后酸浸去 Ni/Co 粘结相，水洗、干燥。粉的粒度与
     * 氧含量没有粒度仪，按球磨时间与显微镜抽检记 —— 这条路线只回收
     * WC 粉，不保证直接压回刀片。
     */
    id: 'make/tungsten-carbide-from-scrap',
    name: 'Cemented Carbide Recovery', name_zh: '硬质合金回收',
    produces: [{ item: 'mat/tungsten-carbide', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/tungsten-carbide-scrap', qty: q(11, 10) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '颚破 + 球磨到 <10 µm，WC 球衬里避免铁污染',
        performedBy: 'plant/ore-beneficiary',
        under: [{ param: 'pressure', min: 100, max: 300 }],
      },
      {
        note_zh: 'HCl 0.2 kg 浸出 Ni 粘结相，60–90 °C、2 h，水洗到中性',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 60, max: 90 }],
      },
      {
        note_zh: '100–120 °C 烘 8 h，密封保存',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 120 }],
      },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      '废合金 1.1 + HCl 0.2 + 水 2 → WC 粉 0.95 + 镍钴氯化液 0.35；0.15 是磨屑与洗水损失',
  },

  {
    /**
     * ESR 轴承钢头尾料回炉：C 0.8–1.1 % 的高碳头尾料 → 45 钢。
     *
     *   头尾料 1.1 + 氧 0.03 + 石灰 0.02 → 45 钢 1 kg + 渣 0.15 kg
     *
     * 碳 1.0 → 0.45 靠吹氧脱碳；石灰造渣去硫/磷。硬度按正火 170–220 HB。
     */
    id: 'make/steel-from-esr-crop',
    name: 'Bearing Steel Production from ESR Crop Remelting', name_zh: 'ESR 轴承钢头尾料回炉制备',
    produces: [
      {
        item: 'mat/steel-45',
        qty: q(1),
        gives: [
          { param: 'hardness', kind: 'range', min: 170, max: 220 },
          { param: 'temper', kind: 'enum', oneOf: ['normalized'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/esr-crop-end', qty: q(11, 10) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(3, 100) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(1, 50) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1550, max: 1600 }],
    rate: { hours: q(3) },
    unbalanced_zh:
      '头尾料 1.1 + 氧 0.03 + 石灰 0.02 → 45 钢 1 + 渣 0.15；碳 1.0→0.45 以 CO 走掉',
  },

  {
    /**
     * 氧化铁皮还原：轧钢氧化皮（FeO/Fe2O3 60–90 %）→ 海绵铁。
     *
     *   氧化皮 1.5 + 氢 0.05 → 铁 0.8 kg + 水汽/尾渣 0.75 kg
     *
     * 800–900 °C 氢还原；氧化皮里的金属铁 10–40 % 不参与反应，直接进产品。
     */
    id: 'make/iron-from-scale',
    name: 'Iron from Scale Reduction', name_zh: '氧化铁皮还原',
    produces: [{ item: 'mat/iron', qty: q(4, 5) }],
    uses: [
      { anyOf: [{ item: 'mat/oxidation-scale', qty: q(3, 2) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/reduction-furnace',
    under: [{ param: 'temperature', min: 800, max: 900 }],
    rate: { hours: q(6) },
    unbalanced_zh:
      '氧化皮 1.5（80 % Fe2O3 折 0.84 Fe）+ 氢 0.05 → 铁 0.8 + 水汽 0.05 + 尾渣 0.7',
  },

  {
    /**
     * 锡渣回收：焊锡渣（Sn 40–70 %）→ 粗锡。
     *
     *   锡渣 1.5 + 碳 0.08 + 纯碱 0.05 → 粗锡 0.6 kg + 渣 0.93 kg
     *
     * 1200–1300 °C 碳还原 + 纯碱造渣；粗锡再进 `make/tin` 电解精炼。
     */
    id: 'make/crude-tin-from-dross',
    name: 'Tin Dross Recovery', name_zh: '锡渣回收',
    produces: [
      {
        item: 'mat/crude-tin',
        qty: q(3, 5),
        gives: [{ param: 'purity', kind: 'range', min: 90, max: 95 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/tin-dross', qty: q(3, 2) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(2, 25) }] },
      { anyOf: [{ item: 'mat/soda-ash', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1200, max: 1300 }],
    rate: { hours: q(4) },
    unbalanced_zh:
      '锡渣 1.5（50 % Sn 折 0.75 Sn）+ 碳 0.08 + 纯碱 0.05 → 粗锡 0.6 + 渣 0.93；铁按 FeO 进渣',
  },

  {
    /**
     * 碳化硅炉底料回炉：未反应的 SiO₂ + C（55–70 / 30–45）→ SiC。
     *
     *   炉底料 1.5 + 石英砂 0.1 → SiC 0.6 kg + CO 0.84 kg + 余碳 0.12 kg
     *
     * 1900–2200 °C 电阻炉；炉底料本来就在化学计量附近，补一点石英把
     * 过量碳吃掉。CO 去尾气，余碳回配料。
     */
    id: 'make/silicon-carbide-from-residue',
    name: 'Silicon Carbide from Recycled Furnace Bottom Material', name_zh: '碳化硅炉底料回炉制备',
    produces: [{ item: 'mat/silicon-carbide', qty: q(3, 5) }],
    uses: [
      { anyOf: [{ item: 'mat/unreacted-silica-carbon', qty: q(3, 2) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/arc-furnace',
    under: [{ param: 'temperature', min: 1900, max: 2200 }],
    rate: { hours: q(8) },
    unbalanced_zh:
      '炉底料 1.5（0.9 SiO₂ + 0.6 C）+ 石英砂 0.1 → SiC 0.6 + CO 0.84 + 余碳 0.16；CO 去尾气',
  },

  {
    /**
     * 硝酸铜废液提铜：银泥精炼的含铜硝酸液（Cu 20–60 g/L）→ 铜。
     *
     *   废液 1 kg + 铁 0.4 → 铜 0.35 kg + 硝酸亚铁液 1.05 kg
     *
     * 置换：Cu²⁺ + Fe → Cu + Fe²⁺；20–60 °C 搅拌 1 h，铜粉沉降、洗涤、干燥。
     */
    id: 'make/copper-from-nitrate',
    name: 'Copper Recovery from Copper Nitrate Waste Solution', name_zh: '硝酸铜废液提铜制备',
    produces: [
      {
        item: 'mat/copper',
        qty: q(7, 20),
        gives: [{ param: 'purity', kind: 'range', min: 97, max: 99 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper-nitrate-solution', qty: q(1) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(2, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/wet-bench',
    under: [{ param: 'temperature', min: 20, max: 60 }],
    rate: { hours: q(2) },
    unbalanced_zh:
      '废液 1（0.35 Cu 折）+ 铁 0.4 → 铜 0.35 + 硝酸亚铁液 1.05；铁过量 0.01 进液',
  },

  {
    /**
     * 铝电解废阴极/槽衬回收冰晶石：废槽衬（冰晶石 60–80 %）→ 冰晶石。
     *
     *   废槽衬 1 + 水 2 → 冰晶石 0.65 kg + 氟化钠/氟化铝浸出液 2.2 kg
     *
     * 破碎后水浸去 NaF，过滤、干燥；冰晶石不溶，留在滤饼里。
     */
    id: 'make/cryolite-from-spent-bath',
    name: 'Cryolite Production from Spent Aluminium Cathode/Bath Lining', name_zh: '铝电解废阴极/槽衬回收冰晶石制备',
    produces: [{ item: 'mat/cryolite', qty: q(13, 20) }],
    uses: [
      { anyOf: [{ item: 'mat/spent-bath', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '颚破到 <5 mm',
        performedBy: 'plant/ore-beneficiary',
        under: [{ param: 'pressure', min: 100, max: 300 }],
      },
      {
        note_zh: '水浸 30 min 去 NaF，过滤；冰晶石在滤饼里',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 60 }],
      },
      {
        note_zh: '100–120 °C 烘干',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 120 }],
      },
    ],
    rate: { hours: q(6) },
    unbalanced_zh:
      '废槽衬 1（0.7 冰晶石折）+ 水 2 → 冰晶石 0.65 + 浸出液 2.2 + 0.15 损失；NaF 进液',
  },

  {
    /**
     * 刚玉渣回收铁：电熔刚玉的渣（Al₂O₃ 10–30 %、Fe 30–60 %）→ 铁。
     *
     *   渣 1.5 + 石灰 0.05 → 铁 0.6 kg + 铝酸钙渣 0.95 kg
     *
     * 1500–1550 °C 熔化，铁水下沉；石灰把 Al₂O₃ 造渣。铁按金属铁计，
     * 不另做还原。
     */
    id: 'make/iron-from-alumina-slag',
    name: 'Iron Recovery from Corundum Slag Production', name_zh: '刚玉渣回收铁制备',
    produces: [{ item: 'mat/iron', qty: q(3, 5) }],
    uses: [
      { anyOf: [{ item: 'mat/fused-alumina-slag', qty: q(3, 2) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1500, max: 1550 }],
    rate: { hours: q(4) },
    unbalanced_zh:
      '渣 1.5（45 % Fe 折 0.675）+ 石灰 0.05 → 铁 0.6 + 铝酸钙渣 0.95；铁损 0.075 进渣',
  },
];
