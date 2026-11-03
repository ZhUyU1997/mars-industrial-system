/**
 * 封装 —— 第 10 门：把裸片变成"能拿、能焊、不漏气"的器件。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么封装是"门"而不是"收尾"
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 裸片（die）有几个致命问题：
 *
 *   拿不住   100 µm 厚的硅，镊子一夹就碎
 *   接不上   电极是 50 µm 见方的铝点，焊锡根本沾不上去
 *   会坏     结面暴露在潮气里，几天就漏电（那只平面管的原话）
 *
 * 封装一次解决这三件事，靠三样东西：
 *
 *   键合丝   把 50 µm 的铝点连到 1 mm 的引线上 —— 金丝是工业标准，**本层没有金**
 *   引线框   把引线做成一片铜架，一次焊好几根
 *   外壳     塑料（便宜、不气密）或金属帽（贵、气密）
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 金丝换铝丝：这不是等价替换
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   金丝   不氧化、延展性好、键合窗口宽 —— 放十年还是那个电阻
 *   铝丝   会氧化（表面一层 Al₂O₃ 就得靠超声破开）、硬度高、容易伤铝电极
 *
 * 但铝丝是**功率器件的工业标准**（大电流模块全用铝丝），因为铝丝粗、载流大。
 * 本层没有金（铅锌链没建），所以铝丝不是退而求其次 —— 它是这个体系的**唯一选项**，
 * 而它的代价很具体：**键合必须超声**（摩擦破氧化膜），不能用热压。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 两种外壳：塑料与金属帽
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   塑料封装   酚醛 + 填料压铸在引线框上 —— 便宜、小、**不气密**
 *   金属帽     钢帽 + 玻璃封接的引线 + 缝焊 —— 贵、大、**气密**
 *
 * 金属帽的难点是那一圈玻璃：它要把引线（钢/可伐）与帽壳焊在一起而**不裂**。
 * 工业上靠可伐合金（膨胀系数与硬玻璃匹配）—— 本层没有钴，做不了可伐。
 * 退路是**压缩封接**：用膨胀系数比钢大的玻璃，冷却后玻璃受压 —— 钢壳不裂，玻璃自己收紧。
 * 这是 1910 年代灯泡工业的办法，本层能做。
 *
 * ⚠️ 一处降级：没有镀金/镀镍打底，铝丝键合在钢引线上靠超声焊直接压 ——
 * 接触电阻比金丝高，长期可靠性差一档。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PACKAGE_ITEMS: readonly Item[] = [
  /**
   * 裸片（die）。划开的单个芯片，100 µm 厚，没有外壳、没有引线。
   *
   * 它是"晶圆工艺"与"封装工艺"之间的那个中间物 —— 以前这两段挤在一条路线里，
   * 于是"换个封装"就得改整条路线。分开之后，封装才成为可选的两条路。
   */
  { id: 'mat/ic-die', name: '裸片', unit: '片', category: 'part' },

  /**
   * 铝键合丝。φ25 µm 的纯铝丝，一卷几百米。
   *
   * 拉这么细的丝是本层最接近极限的一道拉拔：φ25 µm 是头发丝的三分之一，
   *   拉丝模的孔要磨到 1 µm 级（碳化硅只能到 5 µm 级 ——
 * **所以 φ25 µm 这一档的丝，本层的表面光洁度还差一档**），中途要退火三次。
   */
  { id: 'mat/bonding-wire', name: '铝键合丝', unit: 'm', category: 'material' },

  /**
   * 金属帽外壳（钢帽 + 玻璃封接引线 + 引线框）。
   *
   *   帽壳   低碳钢板旋压成帽，底边留缝焊的翻边
   *   引线   三根钢针穿过帽底的三个孔，孔里填玻璃粉，烧到软化、冷却后收紧
   *   框     铜引线框，与针焊接
   */
  { id: 'std/metal-can-general', name: '金属帽外壳', unit: '套', category: 'part' },

  /**
   * 冲压引线框（lead frame）。0.15 mm 的铜带，连续冲压出几十个引脚 + 一个芯片岛。
   *
   * 以前塑封路线里直接写 `mat/copper 1 kg` —— 那是**铜板不是引线框**：
   * 引线框的难点不在材料，在**冲模与连续送料**：引脚间距 1.27 mm（50 mil）、
   * 引脚的悬臂要平、镀银层要薄而匀（键合面）。所以它是一件**独立的冲压件**，
   * 不是一块铜。见 `make/lead-frame`。
   */
  { id: 'std/lead-frame-general', name: '冲压引线框', unit: '套', category: 'part' },

  /**
   * 金键合丝。φ25 µm 的纯金丝，一卷几百米。
   *
   * 与铝丝（`mat/bonding-wire`）的区别只有两点，但两点都是硬需求：
   *   ① 金不氧化 ⇒ 可以做**微伏级**触点与长寿命器件（铝丝一年后会长 Al₂O₃ 变脆）
   *   ② 金的加工硬化比铝快 ⇒ 中间退火要 **5 次**而不是 3 次，且道次压缩量要小
   * 本层从 `mat/gold`（贵金属链，阳极泥 → 金粉）拉起来 —— 见 `make/gold-bonding-wire`。
   */
  { id: 'mat/gold-bonding-wire', name: '金键合丝', unit: 'm', category: 'material' },
];

export const PACKAGE_ROUTES: readonly Route[] = [
  {
    /**
     * 裸片：**只做到划片**。氧化、扩散、光刻、蒸铝都在前面（`make/logic-die` 里）。
     *
     * 这条路线不存在"封装"这一步 —— 那正是把它拆出来的理由。
     */
    id: 'make/ic-die',
    name: '裸片制造',
    produces: [{ item: 'mat/ic-die', qty: q(100) }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pocl3', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['std/photomask-general', 'plant/evaporator'],
    steps: [
      { note_zh: '① 氧化（1000–1100）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1000, max: 1100 }] },
      { note_zh: '② 隔离光刻 + 隔离扩散', performedBy: 'plant/mask-aligner' },
      { note_zh: '③ 基区光刻 + 扩散（同时做出电阻条）', performedBy: 'plant/mask-aligner' },
      { note_zh: '④ 发射区光刻 + 扩散', performedBy: 'plant/mask-aligner' },
      { note_zh: '⑤ 引线孔光刻 + 蒸铝 + 反刻', performedBy: 'plant/mask-aligner' },
      { note_zh: '⑥ 合金化（500–600）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 500, max: 600 }] },
      { note_zh: '⑦ 背面减薄与划片（100 µm 厚）', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '硅片 1 片（约 150 个芯片）→ 裸片 100 片；余 50 是隔离漏电、对位偏差与划片崩边',
  },
  {
    /**
     * 裸片（洁净间版）。**同一道工序，在干净的地方做，废品少一半。**
     *
     *   硅片 1 片 → 裸片 140 片（约 90%），而普通车间是 100 片（约 2/3）
     *
     * 洁净度在数据里只能落在这一处：**一条路线产多少片**。它不是一个条件
     * （模型没有"每立方英尺多少颗"），也不是"精度" —— 是良率。
     *
     * 用超纯水洗片也是同一件事：普通水里的离子干在片子上，就是一层掺杂。
     */
    id: 'make/ic-die-clean',
    name: '裸片制造',
    produces: [{ item: 'mat/ic-die', qty: q(140) }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pocl3', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      // 洗片用超纯水，不用普通水 —— 普通水干在片子上就是一层离子。
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(1) }] },
    ],
    needs: ['std/photomask-general', 'plant/clean-room'],
    steps: [
      { note_zh: '① 氧化（1000–1100）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1000, max: 1100 }] },
      { note_zh: '② 隔离光刻 + 隔离扩散（洁净间内）', performedBy: 'plant/mask-aligner' },
      { note_zh: '③ 基区光刻 + 扩散', performedBy: 'plant/mask-aligner' },
      { note_zh: '④ 发射区光刻 + 扩散', performedBy: 'plant/mask-aligner' },
      { note_zh: '⑤ 引线孔光刻 + 蒸铝 + 反刻', performedBy: 'plant/mask-aligner' },
      { note_zh: '⑥ 合金化（500–600）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 500, max: 600 }] },
      { note_zh: '⑦ 背面减薄与划片（100 µm 厚）', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '硅片 1 片（约 150 个芯片）→ 裸片 140 片（洁净间）；余 10 是划片崩边与对位偏差',
  },
  {
    /** 铝丝：粗拉 → 中间退火 → 细拉到 φ25 µm → 清洗绕卷。 */
    id: 'make/bonding-wire',
    name: '铝丝制备',
    produces: [{ item: 'mat/bonding-wire', qty: q(1000) }],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['std/wire-die-general'],
    steps: [
      { note_zh: '粗拉（φ8 → φ0.5）', performedBy: 'plant/rolling-mill' },
      { note_zh: '中间退火（300–350，三次）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 300, max: 350 }] },
      { note_zh: '细拉到 φ25 µm（换四道模具）', performedBy: 'plant/rolling-mill' },
      { note_zh: '清洗与绕卷', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '铝 1 + 水 1 → 丝 1000 m；余是拉拔断头与清洗损耗（未登条目）',
  },
  {
    /** 金属帽：钢板旋压成帽 → 钻三孔 → 填玻璃粉烧结（压缩封接）→ 焊引线框。 */
    id: 'make/metal-can',
    name: '金属帽外壳制造',
    produces: [{ item: 'std/metal-can-general', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '旋压帽壳与翻边', performedBy: 'lathe' },
      { note_zh: '钻引线孔（三孔，位置精度 0.1 mm）', performedBy: 'plant/milling-machine' },
      { note_zh: '填玻璃粉与烧结（800–900，压缩封接）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 800, max: 900 }] },
      { note_zh: '引线框点焊', performedBy: 'plant/sheet-shop' },
    ],
  },
  {
    /**
     * 塑料封装版：裸片粘在引线框上 → 铝丝键合 → 酚醛压铸 → 切筋成型。
     *
     *   裸片 1 + 铝丝 1 m + 铜框 + 酚醛 → 芯片 1 片
     *
     * 不气密 —— 潮气几年后会走到结面。便宜、小、够用于干燥环境。
     */
    id: 'make/logic-chip',
    name: '集成逻辑芯片制造',
    produces: [{ item: 'std/logic-chip-general', qty: q(1), gives: [{ param: 'node', kind: 'range', min: 5000, max: 5000 }, { param: 'gates', kind: 'range', min: 10, max: 50 }] }],
    uses: [
      { anyOf: [{ item: 'mat/ic-die', qty: q(1) }] },
      { anyOf: [{ item: 'mat/bonding-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '粘片与引线框装配', performedBy: 'plant/robot' },
      { note_zh: '超声键合（铝丝，6 根）', performedBy: 'plant/robot' },
      { note_zh: '酚醛压铸与固化（150–180）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 150, max: 180 }] },
      { note_zh: '切筋、成型、测试', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 金属帽气密封装版：**同一个裸片，另一种壳。**
     *
     *   裸片 1 + 帽壳 1 + 铝丝 1 m → 芯片 1 片
     *
     * 缝焊封帽要一台能滚焊的焊机 —— 本层的 `plant/sheet-shop/welder` 就是它。
     * 气密的好处很具体：潮气进不来，结面不会在几年里慢慢漏电。
     */
    id: 'make/logic-chip-hermetic',
    name: '集成逻辑芯片制造',
    produces: [{ item: 'std/logic-chip-general', qty: q(1), gives: [{ param: 'node', kind: 'range', min: 5000, max: 5000 }, { param: 'gates', kind: 'range', min: 10, max: 50 }] }],
    uses: [
      { anyOf: [{ item: 'mat/ic-die', qty: q(1) }] },
      { anyOf: [{ item: 'std/metal-can-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/bonding-wire', qty: q(1) }] },
    ],
    needs: ['plant/sheet-shop/welder'],
    steps: [
      { note_zh: '粘片与引线键合（铝丝）', performedBy: 'plant/robot' },
      { note_zh: '封帽（滚缝焊，气密）', performedBy: 'plant/sheet-shop' },
      { note_zh: '检漏与测试', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * 冲压引线框：0.15 mm 铜带 → 连续冲压 → 镀银 → 切筋。
     *
     * 这条路线补的是塑封那条的 `mat/copper 1 kg`：**铜板不是引线框**。
     * 一套 14 脚的框只重 0.55 g，但要点在几何：
     *   引脚间距 1.27 mm（50 mil）、悬臂平直度 <0.05 mm、镀银 0.5–1 µm（键合面）
     *
     * 冲模是本层的 `std/stamping-die-general`（硬质合金模 5 µm 级）——
     * 引脚的**间隙**才 0.3 mm，是模子能力的 60 倍，所以冲模不是瓶颈；
     * 瓶颈在**连续送料的步距**（每冲一次送 2.54 mm，重复性要 ±0.02 mm）。
     */
    id: 'make/lead-frame',
    name: '冲压引线框制造',
    produces: [{ item: 'std/lead-frame-general', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1, 200) }] },
      { anyOf: [{ item: 'std/stamping-die-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/silver', qty: q(1, 2000) }] },
    ],
    needs: ['plant/gauge-block', 'plant/metrology-room'],
    steps: [
      { note_zh: '铜带分条到 0.15×25 mm（轧制 + 纵剪）', performedBy: 'plant/rolling-mill' },
      { note_zh: '连续冲压：先冲引脚外形，再冲芯片岛（两步，避免悬臂弯）', performedBy: 'plant/press' },
      { note_zh: '镀银 0.5–1 µm（键合面，只镀不浸）', performedBy: 'plant/plating-bath' },
      { note_zh: '切筋与成形（引脚弯 90°，共面度 0.05 mm）', performedBy: 'plant/press' },
      { note_zh: '检：间距 1.27±0.02、悬臂平直度（量块 + 比较仪）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(1) },
    unbalanced_zh: '铜 5 g + 冲模摊销 + 银 0.5 g → 引线框 1 套（0.55 g）；余是冲边废料（铜 4.4 g，回炉）',
  },

  {
    /**
     * 金键合丝：`mat/gold` → φ25 µm 丝。
     *
     * 与铝丝同一条工艺链（粗拉 → 中间退火 → 细拉 → 清洗），差两处：
     *   ① **退火 5 次**（金加工硬化快，铝只要 3 次）
     *   ② 润滑不能用皂液（会残留碳，键合点长"黑点"）→ 用乙醇
     *
     * 出丝 φ25 µm 是头发丝的三分之一，与铝丝同一道拉丝模（`std/wire-die-general`）。
     * 为什么值得单开一条：**金丝是微伏级触点的唯一材料**（`make/galvanometer-gold-contact`
     * 与 `make/robot-controller-*` 的接触电阻都靠它）。
     */
    id: 'make/gold-bonding-wire',
    name: '金键合丝制备',
    produces: [{ item: 'mat/gold-bonding-wire', qty: q(100) }],
    uses: [
      { anyOf: [{ item: 'mat/gold', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['std/wire-die-general'],
    steps: [
      { note_zh: '粗拉 φ8 → φ0.5（六道模，每道压缩 15–20 %）', performedBy: 'plant/rolling-mill' },
      { note_zh: '中间退火 300–350 °C ×5 次（金硬化快，比铝多两次）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 300, max: 350 }] },
      { note_zh: '细拉到 φ25 µm（换四道模，乙醇润滑）', performedBy: 'plant/rolling-mill' },
      { note_zh: '清洗、绕卷、抽样测抗拉（卷曲半径 25 mm 不断）', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(3) },
    unbalanced_zh: '金 1 kg + 水 2 → 丝 100 m（φ25 µm 只重 0.49 g）；余是拉拔损耗与头尾废料，回炉',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PACKAGE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PACKAGE_ROUTES];
