/**
 * 多层布线 —— 从"四个门"到"四十个门"的那一道墙。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 只有一层铝，四个门到头
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 一层铝为什么连不了大电路？因为**线不能交叉**。一层金属上所有连线都在同一个平面，
 * 两条线要交叉就得绕——绕得开的地方叫布线，绕不开的地方叫死区。
 * 器件越多，死区涨得比器件快，所以门数一过十个，一层铝就排不下了。
 *
 * 两层铝就能交叉：第二层从第一层上面跨过去，只在需要连接的地方打一个孔。
 * 这就是"多层布线"的全部意义 —— **它不是更细，是多一个自由度。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 层间绝缘：本层用旋涂玻璃
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 工业上是 CVD 二氧化硅（硅烷 + 氧，400 °C 沉积）。本层没有硅烷，也没有 CVD 炉。
 * 退路是**旋涂玻璃（SOG）**：把硅酸钠水溶液甩在片子上，甩匀、烘干、固化。
 *
 *   硅石 + 纯碱 → 硅酸钠（水玻璃，1100–1200 °C 熔融）
 *   硅酸钠 + 水 → 稀释到可旋涂的黏度
 *   旋涂 → 150 °C 烘干 → 400 °C 固化
 *
 * ⚠️ 一处致命降级：**硅酸钠带钠。** 钠离子在电场与潮气下会漂移，对 MOS 器件是死刑
 * （阈值电压漂到不可控）。本层做的是双极型 RTL，钠的危害小得多 —— 但仍然存在：
 * 它会在氧化层里形成可动电荷，让漏电随温度漂。
 *
 * 所以这条路线的正当性是"双极型电路能用"，不是"能做 MOS"。**这两个字要分清。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 通孔：第二层光刻 + 腐蚀
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   通孔版   在 SOG 上开窗（光刻 + 氢氟酸），露出第一层铝的焊盘
 *   铝 2     蒸第二层铝，反刻
 *
 * 对位精度要求比第一层高：通孔只有 10 µm 见方，对歪一点就断路。
 * 这就是为什么"5 µm"这个数字要紧 —— **它不是线宽，是能对多准。**
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const MULTILAYER_ITEMS: readonly Item[] = [
  /**
   * 硅酸钠（水玻璃）。硅石 + 纯碱熔出来的玻璃状固体，溶于水成黏稠液体。
   *
   *   它在层里有两个用处：层间绝缘的原料，以及（回到前面）丝网版的封孔漆料。
   */
  { id: 'mat/sodium-silicate', name: '硅酸钠', unit: 'kg', category: 'material' },

  /**
   * 旋涂玻璃液。硅酸钠稀释到可甩涂的黏度，加少量有机溶剂改善铺展。
   *
   * 见水就稀、见醇就浑 —— 配好要马上用，不能存。
   */
  { id: 'mat/spin-on-glass', name: '旋涂玻璃液', unit: 'kg', category: 'material' },

  /**
   * 四位二进制计数器芯片（约 40 门，两层铝，pn 结隔离）。
   *
   * 它是本层能做的**最大的电路**：四个触发器 + 缓冲 + 输出驱动，
   * 四十个门、两次布线、一粒金属帽封的片子。
   *
   * 与 `std/logic-chip-general`（4 门）的分工：那个是"能算"，这个是"能数到 16"。
   */
  { id: 'std/counter-chip-general', name: '四位二进制计数器芯片', unit: '片', category: 'part',
    // 5 µm 世代（与 std/photomask-general 的 3–5 µm 同一档），门数 30–80。
    props: [{ param: 'node', kind: 'range', min: 5000, max: 5000, unit: 'nm', dir: 'atMost' }, { param: 'gates', kind: 'range', min: 30, max: 80, unit: '门' }], },
];

export const MULTILAYER_ROUTES: readonly Route[] = [
  {
    /**
     * 硅酸钠：硅石 + 纯碱，1100–1200 °C 熔融，水淬成玻璃状固体。
     *
     *   硅石 700 + 纯碱 300 → 硅酸钠 1000
     *
     * 熔融态黏得像糖浆，出料要趁热 —— 水淬成小粒，再溶成液体用。
     */
    id: 'make/sodium-silicate',
    name: '硅酸钠制备',
    produces: [{ item: 'mat/sodium-silicate', qty: q(1000) }],
    uses: [
      { anyOf: [{ item: 'mat/silica', qty: q(700) }] },
      { anyOf: [{ item: 'mat/soda-ash', qty: q(300) }] },
    ],
    needs: [],
    // 砖窑 1300–1500 的下限压不下来，所以用电阻炉做不到 1100 —— 反过来：
    // 熔融水玻璃只要 1100–1200，而砖窑最低 1300 会把它烧过（水玻璃沸腾起泡）。
    // 这里用**高温炉**（1100–1600）跑下限，是这一层少数几处"用大炉子干小活"。
    performedBy: 'plant/high-temp-furnace',
    under: [{ param: 'temperature', min: 1100, max: 1200 }],
  },
  {
    /**
     * 旋涂玻璃液：硅酸钠溶水，调到 10–20 cP 的黏度，过滤。
     *
     *   硅酸钠 300 + 水 700 → 涂液 1000
     */
    id: 'make/spin-on-glass',
    name: '旋涂玻璃液制备',
    produces: [{ item: 'mat/spin-on-glass', qty: q(1000) }],
    uses: [
      { anyOf: [{ item: 'mat/sodium-silicate', qty: q(300) }] },
      { anyOf: [{ item: 'mat/water', qty: q(700) }] },
    ],
    needs: [],
    performedBy: 'plant/wet-bench',
  },
  {
    /**
     * 计数器芯片：双层布线的完整流程。
     *
     *   硅片 1 片 → 裸片 40 片（每片四十个门），封装成 40 片
     *
     * 比单层流程多三步：**旋涂与固化**、**通孔光刻**、**第二层铝**。
     * 三步都在同一条线上，用同一台曝光机、同一台扩散炉 —— 多的只是次数。
     */
    id: 'make/counter-chip',
    name: '四位二进制计数器芯片制造',
    produces: [{ item: 'std/counter-chip-general', qty: q(40), gives: [{ param: 'node', kind: 'range', min: 5000, max: 5000 }, { param: 'gates', kind: 'range', min: 30, max: 80 }] }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pocl3', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/spin-on-glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/bonding-wire', qty: q(1) }] },
      { anyOf: [{ item: 'std/metal-can-general', qty: q(40) }] },
    ],
    // 版是工具（一套七张：隔离、基区、发射区、引线孔、通孔、铝 1、铝 2），不消耗。
    needs: ['std/photomask-general', 'plant/evaporator'],
    steps: [
      { note_zh: '① 氧化 + 隔离光刻 + 隔离扩散', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1000, max: 1100 }] },
      { note_zh: '② 基区光刻 + 扩散（同时做电阻条）', performedBy: 'plant/mask-aligner' },
      { note_zh: '③ 发射区光刻 + 扩散', performedBy: 'plant/mask-aligner' },
      { note_zh: '④ 引线孔光刻 + 铝 1 + 反刻', performedBy: 'plant/mask-aligner' },
      { note_zh: '⑤ 旋涂玻璃、烘干、固化（150 / 400）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 400, max: 450 }] },
      { note_zh: '⑥ 通孔光刻 + 开窗（HF）', performedBy: 'plant/mask-aligner' },
      { note_zh: '⑦ 铝 2 + 反刻 + 合金化（500–600）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 500, max: 600 }] },
      { note_zh: '⑧ 钝化、划片、装架、键合、封帽、测试', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '硅片 1 片（约 60 个芯片）→ 芯片 40 片；余 20 是通孔对歪、两层短路与封装废品',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...MULTILAYER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...MULTILAYER_ROUTES];
