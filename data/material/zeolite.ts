/**
 * 气体纯化 —— 扩散炉要的氧不能带水。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 湿氧与干氧差多少
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 氧化硅的生长速度强烈依赖水汽：
 *
 *   干氧  1000 °C 长 0.1 µm 要 ~2 小时，膜致密
 *   湿氧  同样的膜只要 ~20 分钟，但膜疏松、耐压差
 *
 * 栅氧必须是干氧。而"干"有具体数字：**露点 −60 °C 以下**（含水 <10 ppm）。
 * 电解出来的氧带着饱和水汽（室温下约 3%），差三个数量级。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 分子筛：本层能造的干燥剂
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 4A 分子筛（Na₁₂[(AlO₂)₁₂(SiO₂)₁₂]·27H₂O）的孔口正好 0.4 nm ——
 * 水分子 0.28 nm 进得去，氧分子 0.35 nm 进得去但**被极性吸附住**，
 * 氮分子 0.36 nm 也进得去。所以它是"按大小与极性筛"，不是"按大小筛"。
 *
 * 本层怎么造：**硅酸钠 + 铝酸钠 + 氢氧化钠，成胶、晶化、洗涤、烘干**。
 *   硅酸钠  为旋涂玻璃做的
 *   铝酸钠  氧化铝溶于氢氧化钠
 *   晶化    90–100 °C、几小时到一天（模型没有时间）
 *
 * 而它可再生：加热到 250–300 °C 把吸住的水赶走 —— 所以它是**反复用**的，
 * 不是消耗品（这也是它该记成设备零件、而不是 consumable 的原因）。
 *
 * ⚠️ 一处降级：4A 筛的水容量约 20%（每 100 kg 筛吸 20 kg 水），而本层没有
 * 露点仪 —— "干到多少"只能靠**增重法**（称筛子的重量）与**露点瓶**
 * （往镜面上呵气看结露温度）判断。后者是本层的老朋友：露点瓶就是个小冷阱。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const GAS_PURIFY_ITEMS: readonly Item[] = [
  /**
   * 4A 分子筛。白色粉末压成 3 mm 小球，孔口 0.4 nm。
   *
   * 它吸水、也吸二氧化碳与极性分子 —— 所以它同时是"干燥剂"与"脱碳剂"。
   * 再生：250–300 °C 烘干。
   */
  { id: 'mat/zeolite-4a', name: '4A Molecular Sieve', name_zh: '4A 分子筛', unit: 'kg', category: 'material' },

  /**
   * 气体纯化单元。分子筛柱 + 冷阱 + 切换阀，装在扩散炉的气路上。
   *
   * 它是扩散炉的一个零件，不单独占一台机器 —— 理由与真空机组相同：
   * 本层只有这一处要"干气"。
   */
  { id: 'plant/diffusion-furnace/gas-purifier', name: 'Diffusion Furnace Gas Purification Unit', name_zh: '扩散炉气体纯化单元', unit: '件', category: 'part' },
];

export const GAS_PURIFY_ROUTES: readonly Route[] = [
  {
    /**
     * 分子筛：硅酸钠 + 铝酸钠（氧化铝溶于碱）+ 水，成胶后晶化。
     *
     *   硅酸钠 400 + 氧化铝 200 + 氢氧化钠 200 + 水 400 → 分子筛 400
     *
     * 收率只有一半：晶化后要洗掉多余的碱与未晶化的胶，洗水带走的都是料。
     */
    id: 'make/zeolite',
    name: 'Molecular Sieve Production', name_zh: '分子筛制备',
    produces: [{ item: 'mat/zeolite-4a', qty: q(400) }],
    uses: [
      { anyOf: [{ item: 'mat/sodium-silicate', qty: q(400) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(200) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(200) }] },
      { anyOf: [{ item: 'mat/water', qty: q(400) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '配铝酸钠与成胶（80–90）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 80, max: 90 }] },
      { note_zh: '晶化（90–100，几小时到一天 —— 模型没有时间）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 90, max: 100 }] },
      { note_zh: '洗涤、压球、烘干（250–300 活化）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 250, max: 300 }] },
    ],
    unbalanced_zh: '硅酸钠 400 + 氧化铝 200 + 氢氧化钠 200 + 水 400 → 分子筛 400；余 800 是洗水与未晶化的胶',
  },
  {
    /**
     * 纯化单元：分子筛柱 + 冷阱 + 切换阀（两柱轮换，一柱工作一柱再生）。
     *
     *   分子筛 20 kg + 玻璃（冷阱筒）+ 铜（管路）+ 薄钢板（架）
     *
     * 两柱轮换是关键：**吸附会饱和，饱和了要烧**。所以气路分两路，一路通气、
     * 一路加热再生，靠阀切换 —— 这层的第一套"连续运行"的吸附装置。
     */
    id: 'make/gas-purifier',
    name: 'Diffusion Furnace Gas Purification Unit Manufacturing', name_zh: '扩散炉气体纯化单元制造',
    produces: [{ item: 'plant/diffusion-furnace/gas-purifier', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/zeolite-4a', qty: q(20) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...GAS_PURIFY_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...GAS_PURIFY_ROUTES];
