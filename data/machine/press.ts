/**
 * 曲柄压力机 —— "本层没有压机"这句话，在台账里挂了七处。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 七处缺口
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   电机冲片     "本应冲压，用铣削代"
 *   计数器字轮   "本该冲压件（一副模具一分钟几百件）"
 *   覆铜板       "要热压机"
 *   电解槽隔膜   "压制要压机，模型里没有压机"
 *   硬质合金刀片 压制（现在靠模压 + 烧结）
 *   陶瓷件压制   干压成型
 *   塑料件模压   酚醛压铸（封装就是一例）
 *
 * **缺的不是"力"，是"能重复的力"。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么是曲柄压力机，而不是液压机
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   液压机   几万吨，但**要油缸、泵、阀与大量橡胶密封件** —— 本层没有橡胶
 *   曲柄机   100 吨级，力从**飞轮惯量**来，没有油，只有轴承与齿轮
 *
 * 曲柄压力机是 19 世纪的发明：飞轮储能 → 离合器接合 → 曲轴转一圈 → 滑块下压一次。
 * **它一次的力是死的（由曲轴偏心与飞轮能量定），但这恰好是冲压要的：每次一样。**
 *
 * 三处本层能做的：
 *
 *   机身      HT250 铸铁，整体浇注（几百公斤到几吨）—— 铸造厂有
 *   飞轮      铸铁盘，皮带传动 —— 与车床的皮带轮同族
 *   离合器    **刚性牙嵌离合器**（爪式），不是摩擦片 —— 摩擦片要石棉或树脂，
 *             而牙嵌只要两块带牙的钢，靠弹簧压紧、靠拨叉脱开
 *
 * ⚠️ 一处降级：没有摩擦离合器，所以**接合是硬的** —— 冲击大、噪声大、模具寿命短。
 * 工业上 20 世纪中期就换成摩擦离合器了，本层停在 1900 年代。
 *
 * ⚠️ 另一处：滑块没有**下死点调节**（那要蜗轮蜗杆微调），所以装模靠垫片 ——
 * 每换一副模具要重新垫，**调模时间比冲压时间还长**。只适合大批量。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PRESS_PARTS: readonly Item[] = [
  /** 机身与滑块。铸铁机身 + 导轨 + 滑块（滑块与导轨的间隙 0.05 mm，靠刮研配）。 */
  { id: 'plant/press/frame', name: '压机机身与滑块', unit: '件', category: 'part' },

  /** 传动组。飞轮 + 曲轴 + 连杆 + 制动器（皮带轮与车床同族）。 */
  { id: 'plant/press/drive', name: '压机传动组', unit: '件', category: 'part',
    composedOf: [
      { item: 'plant/press/drive/flywheel', qty: q(1) },
      { item: 'plant/press/drive/crankshaft', qty: q(1) },
      { item: 'plant/press/drive/connecting-rod', qty: q(1) },
      { item: 'plant/press/drive/brake-band', qty: q(1) },
      { item: 'std/bearing-general-p0', qty: q(2) },
    ] },

  /** 刚性牙嵌离合器。两片带牙的 40Cr，淬火到 HRC 50，弹簧压紧、拨叉脱开。 */
  { id: 'plant/press/clutch', name: '压机刚性牙嵌离合器', unit: '件', category: 'part' },
];

export const PRESS_ROUTES: readonly Route[] = [
  {
    /** 机身与滑块：HT250 浇注 + 时效 + 导轨刮研。 */
    id: 'make/press-frame',
    name: '压机机身与滑块制造',
    produces: [{ item: 'plant/press/frame', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['plant/milling-machine'],
    performedBy: 'plant/forge',
  },
  {
    /** 传动组：飞轮（铸铁盘车削 + 配重）、曲轴（40Cr 车磨）、连杆、制动带。 */
    id: 'make/press-drive',
    name: '压机传动组制造',
    produces: [{ item: 'plant/press/drive', qty: q(1) }],
    // 飞轮、曲轴、连杆、制动带、轴承在条目 composedOf 上；这里只写总装。
    uses: [],
    needs: ['plant/grinder'],
    steps: [
      { note_zh: '装曲轴与轴承', performedBy: 'plant/robot' },
      { note_zh: '装飞轮与连杆，配制动带间隙', performedBy: 'plant/robot' },
      { note_zh: '手动盘车与动平衡复测', performedBy: 'plant/robot' },
    ],
  },
  {
    /** 牙嵌离合器：两片带牙的 40Cr，铣牙 + 淬火 + 磨端面。 */
    id: 'make/press-clutch',
    name: '压机刚性牙嵌离合器制造',
    produces: [{ item: 'plant/press/clutch', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] },
      // 弹簧用 40Cr 卷制（弹簧钢要硅锰，本层没有配 —— 与接触器同一处理）
      { anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] },
    ],
    needs: ['plant/high-temp-furnace'],
    steps: [
      { note_zh: '铣牙（6 个梯形牙）', performedBy: 'plant/milling-machine' },
      { note_zh: '淬火回火（HRC 48–52）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 830, max: 860 }] },
      { note_zh: '磨端面与配研', performedBy: 'plant/grinder' },
    ],
  },
];

/**
 * 曲柄压力机。100 吨级，行程 100 mm，每分钟 60 次。
 *
 * 它不 hold 温度也不 hold 压力 —— **它的能力是"力"**，而模型没有"力"这个条件。
 * 所以它在数据里只能靠"由它执行哪条工序"来表达：**凡是要"压"的，都归它。**
 */
export const PRESS: Item = {
  id: 'plant/press',
  name: '压机',
  unit: '台',
  category: 'machine',
  composedOf: [
    { item: 'plant/press/frame', qty: q(1) },
    { item: 'plant/press/drive', qty: q(1) },
    { item: 'plant/press/clutch', qty: q(1) },
    { item: 'std/motor-7.5kw-4p', qty: q(1) },
    { item: 'std/contactor-general', qty: q(1) },
  ],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PRESS_PARTS, PRESS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/press',
    name: '压机装配',
    produces: [{
      item: 'plant/press',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...PRESS_ROUTES, ...ASSEMBLY_ROUTES];
