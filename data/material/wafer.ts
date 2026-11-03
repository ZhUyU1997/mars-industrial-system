/**
 * 硅片与点接触晶体管 —— 第 6–7 门，以及这条链的第一个器件。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 四步把棒变成片
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   滚磨外圆   把单晶棒磨成正圆、定直径（φ100）      plant/grinder
 *   切片       游离磨料线锯，切缝 0.2 mm             plant/wire-saw
 *   研磨       磨掉切片留下的几微米损伤层            plant/robot（对研平板）
 *   抛光       细磨料 + 绒布，抛到镜面                plant/robot
 *
 * 后两步没有设备可依 —— 就是"手工在平板上磨"，与量块那套三块对研是同一门手艺。
 * **这不是省设备，是这层唯一的路**：抛光机是台精密机床，本层造不了。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么停在"点接触"
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 第 8 门（氧化、扩散、光刻）要掺杂源（硼、磷的氯化物）与光刻胶，本层都没有。
 * 但 1947 年那两只晶体管**什么都没用**：
 *
 *   一块抛光的硅片 + 两根压上去的金属尖（相距 50 µm）+ 通电流"形成"
 *
 * 金属尖是钨丝（φ0.05），压在硅片上；"电形成"是在两个尖与基片之间通脉冲电流，
 * 把接触点烧出一小片熔融区 —— 那里就成了发射极与集电极。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它有多差
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   增益        2–10 倍（现代器件 100–1000）
 *   带宽        几十 kHz
 *   一致性      靠手调，两只不可能一样
 *   寿命        几天到几周（接触点会漂）
 *
 * **它不是"能用"的器件，它是"有放大作用"的证据。** 但这一条证据很要紧：
 * 有了它，检流计可以不再靠永磁体做到极限、热电偶的微伏可以放大 ——
 * 放大是模拟电路的第一块砖，而它现在有了。
 *
 * ⚠️ 一处模型说不出的：电形成的脉冲参数（电压、电流、时间）靠试，而模型没有时间。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const WAFER_ITEMS: readonly Item[] = [
  /**
   * 硅片。φ100 × 0.7 mm，单面抛光。表面粗糙度 Ra < 5 nm（手工抛的上限）。
   *
   * 它是这条链走到现在的产物：**从硅石到镜面，一共过了七道门。**
   */
  { id: 'mat/silicon-wafer', name: 'Silicon Wafer', name_zh: '硅片', unit: '片', category: 'part' },

  /**
   * 点接触晶体管。一只硅片 + 两根钨丝 + 一个酚醛壳。
   *
   * 增益 2–10 倍，寿命几天到几周 —— 它不是"能用"的器件，是"有放大作用"的证据。
   */
  { id: 'std/point-contact-transistor-general', name: 'Point-Contact Transistor', name_zh: '点接触晶体管', unit: '件', category: 'part' },
];

export const WAFER_ROUTES: readonly Route[] = [
  {
    /**
     * 硅片：滚磨 → 切片 → 研磨 → 抛光 → 清洗。
     *
     *   单晶硅 1000 → 硅片 400 片（按 1 kg 棒切 0.7 mm 片、切缝 0.2 mm 估算，
     *   折合切、磨、抛的损耗后约 40% 出片率）
     *
     * 滚磨与切片有设备；研磨与抛光是"平板 + 磨料 + 手"，与量块三块对研同门。
     * 抛光没有硅溶胶（那要水玻璃离子交换），只能用氧化铝细粉 —— **抛出来有划痕**，
     * 但点接触器件不在乎：它要的是"平"，不是"完美"。
     */
    id: 'make/silicon-wafer',
    name: 'Silicon Wafer Manufacturing', name_zh: '硅片制造',
    produces: [{ item: 'mat/silicon-wafer', qty: q(400) }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-single', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/silicon-carbide', qty: q(1) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1) }] },
    ],
    needs: ['plant/comparator/lapping-plate'],
    steps: [
      { note_zh: '滚磨外圆与定位面', performedBy: 'plant/grinder' },
      { note_zh: '粘棒与切片（线锯）', performedBy: 'plant/wire-saw' },
      { note_zh: '研磨（对研平板，磨掉损伤层）', performedBy: 'plant/robot' },
      { note_zh: '抛光（细磨料 + 绒布）', performedBy: 'plant/robot' },
      { note_zh: '清洗与检验', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '单晶硅 1000 → 硅片 400 片；余 600 是切缝、滚磨屑、研磨与抛光损耗、崩边废片',
  },
  {
    /**
     * 点接触晶体管：划片 → 腐蚀清洗 → 点接触装配 → 电形成 → 封装。
     *
     *   硅片 1 片（切成几十只小片）+ 钨丝（φ0.05）+ 酚醛壳 + 铜引线
     *
     * 两个尖相距 50 µm —— 靠显微镜下调（比较仪与放大镜那套），
     * **这是全链最细的手上活**。
     */
    id: 'make/point-contact-transistor',
    name: 'Point-Contact Transistor Manufacturing', name_zh: '点接触晶体管制造',
    produces: [{ item: 'std/point-contact-transistor-general', qty: q(20) }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      // 腐蚀清洗：HF 溶氧化层、硝酸把硅氧化，交替啃下去 —— 两者都是消耗品。
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['std/rectifier-rotary-general'],
    steps: [
      { note_zh: '划片（金刚刀改钢刀划痕掰片）', performedBy: 'plant/robot' },
      { note_zh: '腐蚀清洗（氢氟酸 + 硝酸）', performedBy: 'plant/robot' },
      { note_zh: '点接触装配（两根钨丝相距 50 µm）', performedBy: 'plant/robot' },
      { note_zh: '电形成（脉冲电流烧接触点）', performedBy: 'plant/robot' },
      { note_zh: '封装与测试', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '硅片 1 片（约 50 小片）→ 晶体管 20 只；余 30 片是划片崩边与装配废品',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...WAFER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...WAFER_ROUTES];
