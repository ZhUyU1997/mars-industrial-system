/**
 * 硬质合金刀片 —— 回收，不是复制。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 先说清楚：钨不会消失
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 前面把刀片列进种子的理由写的是"钨在风化层里不到 1 ppm，浓集一万倍才有意义"。
 * 那句话没错，但它推不出"刀片只能用运来的" —— 因为**钨不会被吃掉**。
 *
 * 刀片用钝，是刃口磨圆了，不是碳化钨消失了。一片 5 克的刀片磨掉 0.2 克，
 * 剩下的 4.8 克还在，而且成分没变。所以真实的循环是：
 *
 *   新刀片 → 用钝 → 重磨（掉一点）→ 再钝 → …… → 报废 → 回收制粉 → 新刀片
 *
 * **这不是"复制"，是"再制造"。** 量块那条线要复制，因为量块要更多块；
 * 刀片这条线只要循环，因为同一批钨可以一直用。
 *
 * 而回收有个好处：**钴也一起回来了。** 硬质合金是碳化钨（WC）加钴（Co）烧结的，
 * 而火星没有钴的条目（铝镍钴磁铁就卡在这）。回收粉里含钴，所以不需要新钴。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 卡在两个地方，都不是"没有钨"
 * ═══════════════════════════════════════════════════════════════════════
 *
 * **① 烧结要氢气气氛。** WC-Co 在 1400–1500 °C 烧结，而钴在高温下遇氧就氧化，
 *    所以必须在氢气或真空中烧。本层原来没有气氛炉：还原炉有氢气但只有 900 °C，
 *    窑有 1750 °C 但通不了氢。这一轮补了 `plant/atmosphere-furnace`（石墨管炉）。
 *
 * **② 刃磨：刚玉磨得动碳化钨，但砂轮掉得比工件还快。**
 *
 *    先纠正一句话：前面写"磨不动"太绝对。真实情况是**磨削比小于 1** ——
 *    去掉的砂轮比去掉的工件还多。
 *
 *    判据是硬度比。磨料要比工件硬**两倍左右**才划得动（磨屑是被"犁"出来的，
 *    不是被"压"碎的）：
 *
 *      材料            维氏硬度      与碳化钨之比
 *      棕刚玉           ~2000 HV        1.2   ← 打滑、摩擦、烧伤
 *      烧结碳化钨         ~1700 HV       1     （低钴牌号到 1900）
 *      绿碳化硅         ~2800 HV        1.6   ← 勉强，粗磨可用
 *      金刚石           ~9000 HV        5.3   ← 正常磨削
 *
 *    1.2 倍时，磨粒与工件"谁硬谁磨谁"就没有答案了：磨粒钝得和工件一样快，
 *    能量全变成热，刃口被摩擦热烧伤、边缘崩裂。
 *
 *    （碳化硅其实能凑：Si + C → SiC 在 1600–1800 °C 就成，本层矿热炉够得着，
 *      工业上 2200 °C 是为了纯度与速度。低品位碳化硅磨硬质合金慢、损耗大，
 *      但比刚玉强。这条留作下一步。）
 *
 *    **还有一条不用磨的路：净成形烧结。** 压制模具做成刃口的形状，烧结出来
 *    就是刀片，只做一道轻钝化（甚至不做）。工业上的可转位刀片本来就走这条路 ——
 *    **粗车能用，精车不行。** 所以这条线上的刀片是"能用但不好用"，
 *    不是"做不出来"。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 温度测不准，这是第三个卡点
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 烧结要 ±10 °C，而本层**没有能读 1450 的测温件**：T 型热电偶只到 350 °C
 * （毫伏表解决的是"读得出"，不是"读得高"），光电高温计要到后面才有、
 * 且它读的是表面辐射。只能看**火色** —— 老师傅的办法，±50 °C。
 *
 * 所以第一批回收刀片的性能会不稳。这不是路线写错了，是**计量还没到那一级**：
 * 前面补的测量链只到 ±2 µm 的尺寸，而温度还停在"看颜色"。
 *
 * **尺寸与温度，两条精度线并不同步** —— 这是这一轮最意外的发现。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、石墨管气氛炉
// ═══════════════════════════════════════════════════════════════════════════

export const ATMOSPHERE_FURNACE_PARTS: readonly Item[] = [
  /**
   * 水冷炉壳。夹套钢壳，两端法兰接电极与气路。
   *
   * 它与自衬电弧炉的壳是同一个思路：**热不靠砖挡，靠水带走**。
   */
  { id: 'plant/atmosphere-furnace/shell', name: '气氛炉水冷炉壳', unit: '件', category: 'part' },

  /**
   * 石墨发热管。既是炉膛也是发热体 —— 电流直接通过管壁，管壁自己红。
   *
   * 用石墨不用金属：钨钼都要进口，而石墨是本层最熟的材料（碳电极那一套）。
   * 石墨管能到 2200 °C，在氢气里不氧化，而且**它自己就是坩埚**。
   */
  { id: 'plant/atmosphere-furnace/tube', name: '气氛炉石墨发热管', unit: '件', category: 'part' },

  /**
   * 石墨毡保温层。把发热管裹住 —— 石墨毡的导热比耐火砖低一个量级，
   * 而且轻，不会把炉壳压塌。
   */
  { id: 'plant/atmosphere-furnace/insulation', name: '气氛炉石墨毡保温层', unit: '件', category: 'part' },

  /**
   * 氢气与氩气系统。减压阀、流量计、点火排空。
   *
   * **氢气是会炸的。** 炉子升温前要先用氩气把空气赶净，降温时也不能马上开炉 ——
   * 这两条操作规程比设备本身更要紧，而模型写不出"规程"。
   */
  { id: 'plant/atmosphere-furnace/gas', name: '气氛炉氢气与氩气系统', unit: '件', category: 'part' },

  /**
   * 观察孔与火色判读。石墨管上开一个石英窗，用眼睛看炉膛的颜色判温度。
   *
   * 这就是前面说的第三个卡点：**没有能读 1450 的热电偶，只有火色。**
   */
  { id: 'plant/atmosphere-furnace/sight', name: '气氛炉观察孔与火色判读', unit: '件', category: 'part' },
];

export const ATMOSPHERE_FURNACE_ROUTES: readonly Route[] = [
  {
    /** 炉壳。钢板卷焊夹套，两端法兰车削，接管焊在水套上。 */
    id: 'make/atm-furnace-shell',
    name: '气氛炉水冷炉壳制造',
    produces: [{ item: 'plant/atmosphere-furnace/shell', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] }],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /**
     * 石墨管。碳粉 + 树脂混捏 → 挤压成管 → 1200–1300 °C 焙烧。
     *
     * 与电极同一条工艺（`make/arc-electrode`），只是形状是管不是棒。
     * 它的电阻要均匀 —— 电流全从管壁过，壁厚不匀就会局部过热。
     */
    id: 'make/atm-furnace-tube',
    name: '气氛炉石墨发热管制造',
    produces: [{ item: 'plant/atmosphere-furnace/tube', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/carbon', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/kiln',
    under: [{ param: 'temperature', min: 1200, max: 1300 }],
  },
  {
    /** 石墨毡。碳纤维毡（本层做不出纤维，用碳粉加树脂压成多孔板代）。 */
    id: 'make/atm-furnace-insulation',
    name: '气氛炉石墨毡保温层制造',
    produces: [{ item: 'plant/atmosphere-furnace/insulation', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/carbon', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/kiln',
    under: [{ param: 'temperature', min: 1200, max: 1300 }],
  },
  {
    /** 气路。不锈钢管 + 减压阀 + 浮子流量计（玻璃管 + 浮子，不用电）。 */
    id: 'make/atm-furnace-gas',
    name: '气氛炉氢气与氩气系统制造',
    produces: [{ item: 'plant/atmosphere-furnace/gas', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 观察孔。石英窗 + 耐热玻璃片，法兰压紧。 */
    id: 'make/atm-furnace-sight',
    name: '气氛炉观察孔与火色判读制造',
    produces: [{ item: 'plant/atmosphere-furnace/sight', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'lathe',
  },
];

/**
 * 石墨管气氛炉。600–2000 °C，氢气或氩气保护。
 *
 * 它补的是"气氛"这个位置 —— **模型里的条件一直是温度与压力，这次是氧气含量**：
 *
 *   holds: temperature 600–2000 · oxygen_ppm 0–50
 *
 * 一条路线可以要求"在无氧环境里烧到 1450 °C"，而这两个条件由同一台设备承担。
 * 这是继压力之后**第二个非温度条件**，而它比压力更根本：氧化是默认状态，
 * 无氧才是要造出来的。
 */
export const ATMOSPHERE_FURNACE: Item = {
  id: 'plant/atmosphere-furnace',
  name: '气氛炉',
  unit: '台',
  category: 'machine',
  holds: [
    { param: 'temperature', min: 600, max: 2000 },
    { param: 'oxygen_ppm', min: 0, max: 50 },
  ],
  composedOf: [
    ...ATMOSPHERE_FURNACE_PARTS.map((p) => ({ item: p.id, qty: q(1) })),
    { item: 'std/motor-7.5kw-4p', qty: q(1) },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// 二、回收：钝刀片变新刀片
// ═══════════════════════════════════════════════════════════════════════════

export const CARBIDE_ROUTES: readonly Route[] = [
  {
    /**
     * 硬质合金回收再生：钝刀片 → 破碎 → 除杂质 → 球磨 → 补碳 → 压制 → 烧结。
     *
     *   1000 旧刀片 → 900 新刀片
     *
     * 10% 是真实的回收损失（破碎扬尘、球磨介质磨损、烧结收缩的边角）。
     * 工业上锌熔法能到 95%，但那要一套锌回收装置，本层没有 —— 走的是
     * **机械破碎 + 直接烧结**的粗路线。
     *
     * 烧结 1400–1500 °C、氢气保护，由石墨管炉承担。石墨管能到 2000，
     * 所以温度不是问题；**问题是温度测不准**（见文件头第三点）。
     *
     * ⚠️ **刃磨没有写进来。** 烧出来的是净成形毛坯，刃口还要磨 ——
     * 而磨硬质合金要金刚石或碳化硅，本层只有刚玉。所以这条路线产出的
     * 是"半成品"，最后一道工序仍然依赖运来的砂轮。
     *
     * 这条路线把 `seed/cons/insert` 同时写进 `uses` 与 `produces` ——
     * **回炉就是这么回事**：吃旧刀片，出新刀片，中间掉一成。
     * 它不是循环定义（不产出它自己就不能开工），是真实的再制造。
     */
    id: 'make/carbide-insert-recycled',
    name: '硬质合金回收再生',
    produces: [{ item: 'mat/carbide-insert', qty: q(900), gives: [{ param: 'grade', kind: 'enum', oneOf: ['P', 'M', 'K'] }, { param: 'hardness', kind: 'range', min: 1300, max: 2000 }] }],
    uses: [
      { anyOf: [{ item: 'mat/carbide-insert', qty: q(1000) }] },
      // 测温锥按炉耗：一炉摆十支，每支约 10 克。**这是本层第一个真正被消耗的消耗件** ——
      // 刀片按小时耗（没时长，写不出），而锥按炉耗，正好对上 uses 的批语义。
      { anyOf: [{ item: 'mat/pyrometric-cone', qty: q(1, 10) }] },
    ],
    needs: ['plant/forge', 'lathe', 'plant/grinder', 'plant/pyrometer'],
    performedBy: 'plant/atmosphere-furnace',
    under: [
      // 有了光学高温计，这条从 1400–1500 收到 1445–1455 —— 看得见了，才敢收紧
      { param: 'temperature', min: 1445, max: 1455 },
      { param: 'oxygen_ppm', min: 0, max: 50 },
    ],
    unbalanced_zh:
      '1000 旧刀片 + 0.1 测温锥 → 900 新刀片；余 100 是破碎扬尘、球磨介质磨损与烧结边角，回收率 90%',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ATMOSPHERE_FURNACE_PARTS, ATMOSPHERE_FURNACE];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/atmosphere-furnace',
    name: '气氛炉装配',
    produces: [{
      item: 'plant/atmosphere-furnace',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...ATMOSPHERE_FURNACE_ROUTES, ...CARBIDE_ROUTES, ...ASSEMBLY_ROUTES];
