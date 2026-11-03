/**
 * 图形化与晶闸管 —— 第 9 门够不着，但 0.1 mm 那一档够得着。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 光刻不是一道门，是一段梯子
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   100 µm   丝网印抗蚀油墨 + 手刻版      ← 本层够得着（这一节）
 *    10 µm   接触式光刻 + 重铬酸盐胶     ← 感光化学没有
 *     1 µm   投影光刻 + 正胶            ← 更没有
 *   0.1 µm   步进 + 化学放大胶          ← 不在讨论范围
 *
 * **中间没有台阶可踩。** 所以第 9 门的正确表述是："能到 0.1 mm，再往下是另一条链。"
 * 而 0.1 mm 已经够做**晶闸管**（功率器件的图形本来就是毫米级）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 图形化：丝网 + 抗蚀油墨
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   丝网版   不锈钢丝网（拉丝厂有）绷在铝框上，网孔用漆封住，只在要印的地方留空
 *   抗蚀油墨 酚醛树脂 + 滑石粉填料，印上去、烘干、固化 —— 耐氢氟酸与硝酸
 *   印完     把片子放进腐蚀液，没被油墨盖住的地方被蚀掉
 *
 * 手刻版：漆膜用刀划开、剥掉图形部分 —— 精度由手定，0.1 mm 级。
 * **这是印刷电路工业在光刻之前的做法**，不是本层的发明。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 晶闸管：四层三结，正好是"图形化 + 扩散"的第一个合用产品
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   p-n-p-n 四层：阳极（p）→ 长基区（n）→ 控制基区（p）→ 阴极（n）
 *
 * 做法：硅片先扩磷做 n 基区，再掩模扩铝/硼做 p 区，再掩模扩磷做阴极区，
 * 最后开窗蒸铝做电极。三个结都靠"掩模挡着扩散"分开 —— **图形精度 0.1 mm 够用**。
 *
 * 它替换的是什么：`std/power-device-general` 本来要外购，而晶闸管就是那一类里
 * 最粗、最老、最适合自造的一种（1957 年就有）。整流器、中频电源、电解槽
 * 都能用它 —— 只是开关速度慢、要做大电流得用很大一片硅。
 *
 * ⚠️ 一处降级：没有玻璃钝化，结面暴露在潮气里会漏电。本层用酚醛灌封顶，
 * 漏电比工业件大一个数量级 —— 寿命短，但能用。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PATTERN_ITEMS: readonly Item[] = [
  /**
   * 抗蚀油墨。酚醛树脂 + 氧化铝细粉填料，乙醇作配方溶剂；烘干后耐氢氟酸与硝酸。
   *
   * 填料本来用滑石粉（软、片状、好分散），本层没有滑石 —— 用刚玉细粉代：
   * 硬、粒形不规则，印出来的边缘比滑石版粗糙一点，所以精度从 0.1 掉到 0.15 mm 级。
   *
   * 它在 0.1 mm 这一档替代光刻胶：光刻胶的用处是"留下图形"，油墨也是"留下图形"，
   * 只是图形不是光画的，是印上去的。
   */
  { id: 'mat/resist-ink', name: 'Resist Ink', name_zh: '抗蚀油墨', unit: 'kg', category: 'material' },

  /**
   * 丝网版。不锈钢丝网绷在铝框上，网孔封漆，只在要印的地方留空。
   *
   * 一块版对应一层图形 —— 晶闸管要三块（n 基区、p 区、阴极区）。
   */
  { id: 'std/screen-frame-general', name: 'Screen Frame', name_zh: '丝网版', unit: '件', category: 'part' },

  /**
   * 晶闸管（可控硅）。四层 p-n-p-n，三个结，0.1 mm 图形精度。
   *
   * 它是本层自造的第一只**功率器件** —— 也是第一次有可能把
   * `std/power-device-general` 从某条路线上换下来。
   */
  { id: 'std/thyristor-general', name: 'Thyristor', name_zh: '晶闸管', unit: '件', category: 'part',
    props: [{ param: 'ratedCurrent', kind: 'range', min: 5, max: 500, unit: 'A' }] },
];

export const PATTERN_ROUTES: readonly Route[] = [
  {
    /** 抗蚀油墨。酚醛树脂 + 刚玉细粉 + 少量乙醇（配方溶剂），球磨均匀。 */
    id: 'make/resist-ink',
    name: 'Resist Ink Production', name_zh: '抗蚀油墨制备',
    produces: [{ item: 'mat/resist-ink', qty: q(1000) }],
    uses: [
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(500) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(480) }] },
      // 乙醇 20：配方溶剂，进油墨、印刷后烘干时走掉。它是产品配方的一部分，
      // 必须进 uses —— 原来只写在 unbalanced_zh 里，于是出 1000 > 进 980，方向记反了。
      { anyOf: [{ item: 'mat/ethanol', qty: q(20) }] },
    ],
    needs: ['plant/milling-machine'],
    performedBy: 'plant/robot',
    unbalanced_zh: '酚醛 500 + 刚玉 480 + 乙醇 20（配方溶剂）→ 油墨 1000；乙醇印后烘干时走掉，但出厂油墨按含溶剂的湿料计，账平',
  },
  {
    /**
     * 丝网版：不锈钢丝网 → 绷框 → 封漆 → 手刻漏空。
     *
     *   丝网 200 目（拉丝厂有）、铝框、漆膜
     *   刻版：漆膜上按图纸划线、剥掉要印的部分 —— 精度靠手与放大镜
     */
    id: 'make/screen-frame',
    name: 'Screen Frame Manufacturing', name_zh: '丝网版制造',
    produces: [{ item: 'std/screen-frame-general', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
    ],
    needs: ['plant/rolling-mill'],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 晶闸管：n 基区 → p 区 → 阴极区 → 开窗蒸铝 → 灌封 → 测试。
     *
     *   硅片 1 片（划成几十只）+ 三块丝网版 + 抗蚀油墨 + 三氯氧磷 + 铝
     *
     * 三次扩散、三次掩模：每层图形刻蚀完再进炉。**工艺顺序就是器件结构本身。**
     * 三个结的结深靠扩散时间控制（模型没有时间），这是良率低的主因。
     */
    id: 'make/thyristor',
    name: 'Thyristor Manufacturing', name_zh: '晶闸管制造',
    produces: [{ item: 'std/thyristor-general', qty: q(12), gives: [{ param: 'ratedCurrent', kind: 'range', min: 10, max: 200, dir: 'atLeast' }] }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'std/screen-frame-general', qty: q(3) }] },
      { anyOf: [{ item: 'mat/resist-ink', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pocl3', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
      // 三次掩模各要一次腐蚀：HF 开窗、硝酸啃硅、碱水洗胶。
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: 'n 基区扩散（POCl₃，1000–1100）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1000, max: 1100 }] },
      { note_zh: '印 p 区图形、腐蚀、扩散（1000–1100）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1000, max: 1100 }] },
      { note_zh: '印阴极区图形、腐蚀、扩散（1000–1100）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1000, max: 1100 }] },
      { note_zh: '开窗蒸铝与合金化（500–600）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 500, max: 600 }] },
      { note_zh: '划片、灌封、测试（测阻断电压与触发电流）', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '硅片 1 片（约 30 只）→ 晶闸管 12 只；余 18 只是结深超差、结面污染与灌封废品',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PATTERN_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PATTERN_ROUTES];
