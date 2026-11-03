/**
 * 平面晶体管 —— 5 µm 光刻做出来的第一只"尺寸由图形决定"的器件。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 与前两只的根本区别：尺寸由版决定，不由手决定
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   点接触   两根钨丝压上去，间距 50 µm —— 位置靠手，靠"电形成"烧出来
 *   合金结   两颗磷铜球熔进去 —— 球多大、熔多深靠手
 *   平面管   **基区宽度由两张版的对位精度决定**（5 µm），一次对位切一刀
 *
 * 所以它的一致性第一次不靠"手稳"，靠**版**。这也是集成电路能成立的原因：
 * 电路里所有器件是同一批工序同时做出来的，间距由版决定，不用一个个调。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 四张版，四道工序
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   ① 氧化      干氧 1000–1100，长 0.5 µm 的二氧化硅当掩蔽层
 *   ② 基区      光刻开窗 → 扩磷（或铝）→ 形成基区
 *   ③ 发射区    再光刻开窗（比基区窗口小 10 µm）→ 再扩 → 发射区
 *   ④ 引线孔    第三次光刻 → 蒸铝 → 合金化 → 反刻铝
 *
 * **基区宽度 = 两次开窗的尺寸差**，所以版画得多准，管子的频率就多高。
 * 5 µm 版 + 两次扩散的横向扩散 → 基区宽约 2–3 µm，够到几十 MHz。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它比合金结好多少
 * ═══════════════════════════════════════════════════════════════════════
 *
 *              合金结            平面管
 *   增益       20–50             50–150
 *   一致性     靠手调，两只不同   同一片上的管子彼此相差 <10%
 *   寿命       几年              几年（钝化层保护结面）
 *   频率       几 MHz            几十 MHz
 *
 * 一致性这一条最要紧：**毫伏表要的是"换一只不用重调"**，而合金结管做不到。
 *
 * ⚠️ 一处降级：没有氮化硅钝化，只有热氧化层 + 酚醛封装。潮气会沿着氧化层慢慢
 * 扩散到结面 —— 所以它的寿命是按"封装好不好"走的，不是按结本身走的。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PLANAR_ITEMS: readonly Item[] = [
  /**
   * 平面晶体管（n-p-n，5 µm 版）。增益 50–150，同一片上彼此相差 <10%。
   *
   * 它是本层第一只"参数由图形决定"的器件 —— 也就是说，第一只**可以批量做**的器件。
   */
  { id: 'std/planar-transistor-general', name: 'Planar Transistor', name_zh: '平面晶体管', unit: '件', category: 'part' },
];

export const PLANAR_ROUTES: readonly Route[] = [
  {
    /**
     * 平面管：氧化 → 基区 → 发射区 → 引线孔 → 钝化封装。
     *
     *   硅片 1 片（约 40 小片）+ 胶、碱、HF、硝酸、三氯氧磷、氧、铝、酚醛
     *
     * 四道扩散里有三道要光刻。每一次都是：涂胶 → 曝光 → 显影 → 腐蚀 → **洗胶**。
     * 洗胶用碱水（负胶见光处不溶、未见光处可洗 —— 等一下，负胶是反的：
     * 见光处留下，所以显影洗掉的是**没见光**的部分；掩模要画成"漏光"，
     * 也就是图形与要留的区域互补。这是负胶最容易搞反的一处）。
     */
    id: 'make/planar-transistor',
    name: 'Planar Transistor Manufacturing', name_zh: '平面晶体管制造',
    produces: [{ item: 'std/planar-transistor-general', qty: q(20) }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pocl3', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    // 掩模是工具：一套四张版，压几百片，不消耗。
    // 图示仪也是工具：分选靠它看曲线，它不消耗。
    needs: ['std/photomask-general', 'std/curve-tracer-general', 'plant/evaporator'],
    steps: [
      { note_zh: '① 干氧氧化（1000–1100，0.5 µm）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1000, max: 1100 }] },
      { note_zh: '② 基区光刻（涂胶、曝光、显影、开窗腐蚀）', performedBy: 'plant/mask-aligner' },
      { note_zh: '③ 基区扩散（1000–1100）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1000, max: 1100 }] },
      { note_zh: '④ 发射区光刻（窗口比基区小 10 µm）', performedBy: 'plant/mask-aligner' },
      { note_zh: '⑤ 发射区扩散（1000–1100）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1000, max: 1100 }] },
      { note_zh: '⑥ 引线孔光刻 + 蒸铝 + 合金化（500–600）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 500, max: 600 }] },
      { note_zh: '⑦ 钝化、划片、封装', performedBy: 'plant/robot' },
      { note_zh: '⑧ 图示仪分选（看曲线：增益 β、饱和压降、击穿电压，三档分级）', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '硅片 1 片（约 40 小片）→ 平面管 20 只；余 20 片是对位偏差、扩散超差与封装废品',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PLANAR_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PLANAR_ROUTES];
