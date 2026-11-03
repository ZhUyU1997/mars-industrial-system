/**
 * 刚玉 —— 磨料，以及它撞开的那面"温度天花板"。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 1800 °C 不是物理定律，是衬里
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 前面十几轮一直把 1800 °C 当成硬上限：矿热炉最高 1800，所以硅铁只做 45%、
 * 硅钢用 45% 硅铁凑。那是对的 —— 但它是**衬里**的上限，不是炉子的上限。
 *
 * 耐火砖（高铝、铬镁）在 1800 以上开始软化、被熔渣侵蚀。可有一类材料不需要
 * 耐火砖：**它自己就是衬里。**
 *
 * 熔融氧化铝不与氧化铝反应。所以第一次开炉时，让熔体在钢壳上冻一层，
 * 那层凝固的刚玉就是衬里 —— 之后每一炉都在自己上一次的壳里熔。这叫
 * **自衬**（skull lining），刚玉行业一直这么做。
 *
 * 于是温度可以开到 2200：不是"造出了耐 2200 的砖"，是**不用砖了**。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 刚玉：把氧化铝烧化再冻上
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 氧化铝熔点 2072 °C。电弧炉里熔到 2000–2200，倒出来冷却，得到刚玉块；
 * 再破碎、筛分成不同粒度 —— 磨料的"号"就是这个粒度。
 *
 * 熔炼时加一点焦炭与铁屑，不是还原氧化铝，是**收杂质**：氧化铝里的
 * SiO₂、TiO₂、Fe₂O₃ 被碳还原成硅、钛、铁，溶进铁里沉底。少了这一步，
 * 刚玉里夹杂，磨粒一碰就碎。
 *
 * 单耗 2,000–2,500 kWh/t，与铝电解同量级 —— 它也是这套体系里最耗电的
 * 非金属产品。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 碳化硅做不了，先说清楚
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 碳化硅（SiC）要 2,200–2,500 °C 的艾奇逊炉，而且要**高纯石英**与石油焦。
 * 石英本层从尾矿富集（90% 够用），但艾奇逊炉的炉芯温度比自衬炉更难维持 ——
 * 它的衬里是反应料本身，同样能自衬，可本层没有那种炉型。
 *
 * 所以这一层只有刚玉，没有碳化硅。刚玉的硬度（莫氏 9）低于碳化硅（9.2），
 * 磨硬质合金会吃力 —— 第五次降级使用。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、材料
// ═══════════════════════════════════════════════════════════════════════════

export const ABRASIVE_ITEMS: readonly Item[] = [
  /**
   * 刚玉（熔融氧化铝）。磨料的颗粒，粒度的"号"就是它的规格。
   *
   * 它是这套体系里唯一能把钢磨到微米级的材料 —— 而磨削又是轴承、主轴、
   * 量块的必经工序。**没有它，前面那些"精度"全是空话。**
   */
  { id: 'mat/fused-alumina', name: '刚玉', unit: 'kg', category: 'material' },

  /**
   * 碳化硅（绿）。**这是磨硬质合金的那个。**
   *
   *   刚玉  2000 HV  磨钢、磨铸铁、磨玻璃
   *   碳化硅 2800 HV  磨硬质合金、磨铸铁、磨铝
   *
   * 差别在硬度比：磨碳化钨（1700 HV）时刚玉只有 1.2 倍，碳化硅有 1.6 倍 ——
   * 刚玉白磨，碳化硅勉强能磨。**没有金刚石（5.3 倍）的年代，硬质合金
   * 就是拿绿碳化硅磨的。**
   *
   * ⚠️ 本层的碳化硅是**低品位**的：1600–1800 °C 合成，产物里带游离硅与游离碳，
   * 不是工业的 99% 绿碳化硅（那要 2200–2500 °C 的艾奇逊炉）。磨削慢、损耗大，
   * 但比刚玉强。
   */
  { id: 'mat/silicon-carbide', name: '碳化硅', unit: 'kg', category: 'material' },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、自衬电弧炉 —— 这台炉子的衬里是它自己的产品
// ═══════════════════════════════════════════════════════════════════════════

export const ARC_FURNACE_PARTS: readonly Item[] = [
  /**
   * 炉壳。水冷夹套钢壳，**里面不砌砖**。
   *
   * 第一炉熔体直接挨着钢壳，冻出一层几十毫米的刚玉壳；那层壳从此就是衬里。
   * 所以炉壳要水冷 —— 不冷，壳会被熔穿；太冷，壳太厚、有效容积太小。
   * 这个平衡是这台炉子唯一的手艺。
   */
  { id: 'plant/arc-furnace/shell', name: '电弧炉炉壳', unit: '件', category: 'part' },

  /**
   * 导电臂与母线。把几万安的电流送到电极上，臂要水冷、要能升降。
   *
   * 用铝不用铜 —— 和电解精炼的母线同一个理由（便宜一千倍）。
   *
   * ⚠️ **这一条过期了**（按同电阻重算）：铝在同样电阻下只要 205 kg、更轻，
   * 土方 6 765 t 对铜 5 650 t **也打平** —— "便宜一千倍"是 1 kg 占位量时代的写法。
   * 铝真正输在两处：弯曲应变 2 722 µε（ε_f′ 0.12）→ 疲劳 1 800 次；
   * 以及 150 °C 再结晶让夹紧力三个月掉一半。
   * 所以在短网这件上，`unblock-arc-busbar.ts` 选了**铜叠片**，不是铝。
   * 这个条目的注释没删 —— 那条判断在"不大挠动、不高温"的母线上仍然成立。
   */
  { id: 'plant/arc-furnace/busbar', name: '电弧炉导电臂与母线', unit: '件', category: 'part' },

  /** 倾动机构。炉体要能倾倒出料，几吨的铰座与液压缸。 */
  { id: 'plant/arc-furnace/tilting', name: '电弧炉倾动机构', unit: '件', category: 'part' },

  /** 烟罩。熔炼冒的是 CO 与烟尘，罩住抽走 —— 它同时挡辐射热。 */
  { id: 'plant/arc-furnace/hood', name: '电弧炉烟罩', unit: '件', category: 'part' },
];

export const ARC_FURNACE_ROUTES: readonly Route[] = [
  {
    /** 炉壳。钢板卷焊成夹套，水冷通道焊在外面；内壁不处理，反正要挂渣。 */
    id: 'make/arc-furnace-shell',
    name: '电弧炉炉壳制造',
    produces: [{ item: 'plant/arc-furnace/shell', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] }],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 导电臂。铝排焊接 + 水冷管，末端夹持电极的铜瓦。 */
    id: 'make/arc-furnace-busbar',
    name: '电弧炉导电臂与母线制造',
    produces: [{ item: 'plant/arc-furnace/busbar', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/milling-machine'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 倾动机构。40Cr 铰座 + 液压缸 + 齿圈，车镗磨。 */
    id: 'make/arc-furnace-tilting',
    name: '电弧炉倾动机构制造',
    produces: [{ item: 'plant/arc-furnace/tilting', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: ['plant/milling-machine', 'plant/grinder', 'plant/forge'],
    performedBy: 'lathe',
  },
  {
    /** 烟罩。薄板折弯焊成，接排烟管；内衬矿棉挡辐射热。 */
    id: 'make/arc-furnace-hood',
    name: '电弧炉烟罩制造',
    produces: [{ item: 'plant/arc-furnace/hood', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
];

/**
 * 自衬电弧炉。1900–2200 °C，比矿热炉高四百度的不是火力，是**衬里**。
 *
 * 电极用标准件 `std/carbon-electrode-300` —— 与矿热炉是同一只电极。
 * 这是标准件机制出来之后第一次真正兑现：**两台炉子共用同一种电极**，
 * 而它们在 `composedOf` 里各自的路径都不冲突。
 */
export const ARC_FURNACE: Item = {
  id: 'plant/arc-furnace',
  name: '电弧炉',
  unit: '台',
  category: 'machine',
  holds: [{ param: 'temperature', min: 1900, max: 2200 }],
  composedOf: [
    ...ARC_FURNACE_PARTS.map((p) => ({ item: p.id, qty: q(1) })),
    { item: 'std/carbon-electrode-300', qty: q(3) },
    { item: 'std/motor-7.5kw-4p', qty: q(1) },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// 三、路线
// ═══════════════════════════════════════════════════════════════════════════

export const ABRASIVE_ROUTES: readonly Route[] = [
  {
    /**
     * 熔融氧化铝：2000–2200 °C，电弧炉，加焦炭与铁屑收杂质。
     *
     *   1000 氧化铝 + 20 焦炭 + 10 铁 → 900 刚玉（并出 130 杂质铁合金）
     *
     * 那些杂质（SiO₂、TiO₂、Fe₂O₃）被碳还原成硅、钛、铁，溶进铁里沉底，
     * 冷却后敲掉。这一炉的产出是**上面那层白刚玉**，下面那块铁合金是渣。
     *
     * 910 进、1030 出 —— 差额是氧被碳带走成 CO，本链未建条目，声明不平衡。
     */
    id: 'make/fused-alumina',
    name: '熔融氧化铝制备',
    produces: [
      { item: 'mat/fused-alumina', qty: q(900) },
      { item: 'mat/co', qty: q(47), gives: [{ param: 'purity', kind: 'range', min: 90, max: 99 }] },
      {
        item: 'mat/fused-alumina-slag',
        qty: q(83),
        gives: [
          { param: 'al2o3', kind: 'range', min: 10, max: 30 },
          { param: 'iron', kind: 'range', min: 30, max: 60 },
          { param: 'form', kind: 'enum', oneOf: ['granular'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/alumina', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(20) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(10) }] },
    ],
    needs: [],
    performedBy: 'plant/arc-furnace',
    under: [{ param: 'temperature', min: 2000, max: 2200 }],
    unbalanced_zh: '氧化铝 1000 + 焦炭 20 + 铁 10 → 900 刚玉 + CO 47 + 铁合金渣 83；两项已单列（CO 回变换，渣回铁合金/骨料）',
  },
  {
    /**
     * 碳化硅：SiO₂ + 3C → SiC + 2CO，1600–1800 °C，矿热炉。
     *
     *   1499 硅石 + 899 碳 → 1000 碳化硅 + 1398 一氧化碳
     *
     * 三个数都对得上：硅石 1499（60.08/40.10 × 1000）、碳 899（3 × 12.011/40.10）、
     * 一氧化碳 1398（2 × 28.01/40.10）。出 1000 + 1398 = 2398，进 1499 + 899 = 2398。
     *
     * **1600–1800 °C 够合成，但不够纯。** 工业的绿碳化硅在艾奇逊炉里烧到
     * 2200–2500，为的是把游离硅与游离碳赶干净。本层只有 1800，
     * 所以产出的是**低品位碳化硅**：硬度差不多（2800 HV），但磨粒脆、含杂质，
     * 磨硬质合金时损耗大。
     *
     * 一氧化碳回变换反应（make/water-gas-shift）制氢 —— 这条链在这里闭合。
     *
     * （艾奇逊炉要 2200 以上，而本层最热的设备是自衬电弧炉 1900–2200。
     *   差一点，但那一台的通径与炉型是为熔氧化铝设计的，不能直接改烧碳化硅。
     *   留作缺口。）
     */
    id: 'make/silicon-carbide',
    name: '碳化硅制备',
    produces: [
      { item: 'mat/silicon-carbide', qty: q(1000) },
      { item: 'mat/co', qty: q(1398), gives: [{ param: 'purity', kind: 'range', min: 40, dir: 'atLeast' }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silica', qty: q(1499) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(899) }] },
    ],
    needs: [],
    performedBy: 'plant/submerged-arc-furnace',
    under: [{ param: 'temperature', min: 1600, max: 1800 }],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ARC_FURNACE_PARTS, ...ABRASIVE_ITEMS, ARC_FURNACE];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/arc-furnace',
    name: '电弧炉装配',
    produces: [{
      item: 'plant/arc-furnace',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...ARC_FURNACE_ROUTES, ...ABRASIVE_ROUTES, ...ASSEMBLY_ROUTES];
