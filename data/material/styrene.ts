/**
 * 苯乙烯链 —— 上一节说"本层没有苯乙烯链"，那句话是错的。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 错在哪
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 写的是："离子交换树脂要苯乙烯-二乙烯苯共聚物，也就是要石油化工的苯乙烯链
 * —— 本层没有。"
 *
 * 前半句对，后半句错。**石油化工只是最便宜的那条路，不是唯一的路。**
 * 苯乙烯的分子很清楚：苯环 + 一个乙烯基。而这两样本层都有：
 *
 *   苯     乙炔三聚（`make/benzene`，400–500 °C，本层已有）
 *   乙烯   乙炔 + 氢，部分加氢（这一步的选择性是关键，见下）
 *
 * 所以不是"没有这条路"，是"还没写"。补上之后，离子交换树脂也就有了 ——
 * 而超纯水从 1–5 MΩ·cm 提到 18 MΩ·cm 的那一级，也就可以写了。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 五步
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   ① 乙烯      乙炔 + 氢 → 乙烯（+ 乙烷），再低温精馏分开
 *   ② 三氯化铝  铝 + 氯 → AlCl₃（傅克反应的催化剂）
 *   ③ 乙苯      苯 + 乙烯 → 乙苯（AlCl₃ 催化，80–100 °C）
 *   ④ 苯乙烯    乙苯脱氢（600–650 °C，氧化铁催化，通蒸汽）
 *   ⑤ 树脂      苯乙烯 + 二乙烯苯 → 悬浮聚合 → 磺化 → 强酸阳离子交换树脂
 *
 * 每一步都是老工艺（乙苯脱氢是 1940 年代的工业路线），难的不是化学，是三件事：
 *
 *   选择性   乙炔加氢容易一路加到乙烷，要靠控制与精馏补救
 *   催化剂   三种催化剂（镍、AlCl₃、氧化铁）都要自制，且都要失活后更换
 *   低温     乙烯与乙烷的沸点只差 15 °C（−103.7 / −88.6），要低温精馏
 *
 * ⚠️ 最后一件事是本层第一次需要**深冷**：低温精馏塔要用液氮做冷媒，
 * 而液氮来自空分（`plant/air-separator`）。所以这条链的入口是空分，
 * 不是石化 —— 又一次"同一个东西，两条来路"。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const STYRENE_ITEMS: readonly Item[] = [
  /** 乙烯。无色气体，沸点 −103.7 °C。塑料与乙苯的原料。 */
  { id: 'mat/ethylene', name: '乙烯', unit: 'kg', category: 'material' },

  /** 三氯化铝。黄色晶体，遇水剧烈水解 —— 傅克反应的催化剂，也是本层第一个"催化剂量"的料。 */
  { id: 'mat/aluminium-chloride', name: '三氯化铝', unit: 'kg', category: 'material' },

  /** 乙苯。苯环上一个乙基，沸点 136 °C。苯乙烯的前体。 */
  { id: 'mat/ethylbenzene', name: '乙苯', unit: 'kg', category: 'material' },

  /** 苯乙烯。苯环上一个乙烯基，沸点 145 °C。遇热自己聚合，所以要加阻聚剂、低温存。 */
  { id: 'mat/styrene', name: '苯乙烯', unit: 'kg', category: 'material' },

  /** 二乙烯苯。两个乙烯基，是交联剂 —— 它决定树脂珠的孔结构与强度。 */
  { id: 'mat/divinylbenzene', name: '二乙烯苯', unit: 'kg', category: 'material' },

  /**
   * 强酸阳离子交换树脂。磺化的苯乙烯-二乙烯苯共聚珠，5% 交联度。
   *
   * 它的作用是**把水里的离子换掉**：磺酸基（—SO₃H）上的 H⁺ 与水里的 Na⁺、Ca²⁺ 交换。
   * 有了它，超纯水才能从 1–5 MΩ·cm 到 18 MΩ·cm。
   */
  { id: 'mat/cation-resin', name: '强酸阳离子交换树脂', unit: 'kg', category: 'material' },
];

export const STYRENE_ROUTES: readonly Route[] = [
  {
    /**
     * 乙烯：乙炔 + 氢部分加氢，再低温精馏。
     *
     *   乙炔 1000 + 氢 26 → 乙烯 700 + 乙烷 300（选择性只有 70% 级）
     *
     * 化学计量：C₂H₂ + H₂ → C₂H₄，乙炔 26 g/mol、氢 2、乙烯 28 ——
     * 1000 kg 乙炔要 77 kg 氢，出 1077 kg 乙烯（理论值）。这里按选择性 70% 折算：
     * 剩下的走成乙烷，而乙烷要**低温精馏**分出来，再裂解回乙炔（本层没建裂解，先当损耗）。
     *
     * ⚠️ 深冷：乙烯 −103.7 / 乙烷 −88.6，只差 15 °C，塔要跑到 −120 °C 级。
     * 冷媒是液氮（空分副产），所以这条路线要空分在场。
     */
    id: 'make/ethylene',
    name: '乙烯制备',
    produces: [{ item: 'mat/ethylene', qty: q(700) }],
    uses: [
      { anyOf: [{ item: 'mat/acetylene', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(77) }] },
    ],
    needs: ['plant/air-separator'],
    performedBy: 'plant/distillation-tower',
    under: [{ param: 'pressure', min: 300, max: 600 }],
    unbalanced_zh: '乙炔 1000 + 氢 77 → 乙烯 700；余 377 是乙烷与未反应物（要低温精馏分出，乙烷暂当损耗）',
  },
  {
    /** 三氯化铝：熔融铝与干燥氯气反应，升华收集。铝 200 + 氯 790 → AlCl₃ 980。 */
    id: 'make/aluminium-chloride',
    name: '三氯化铝制备',
    produces: [
      { item: 'mat/aluminium-chloride', qty: q(980) },
      { item: 'mat/tailings', qty: q(10) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(200) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(790) }] },
    ],
    needs: [],
    performedBy: 'plant/bosch-reactor',
    under: [{ param: 'temperature', min: 200, max: 300 }],
    unbalanced_zh: '铝 200 + 氯 790 → 三氯化铝 980 + 炉渣 10（已单列 mat/tailings）',
  },
  {
    /**
     * 乙苯：苯 + 乙烯，AlCl₃ 催化，80–100 °C，常压。
     *
     *   苯 950 + 乙烯 250 + 三氯化铝 10 → 乙苯 1000
     *
     * 傅克烷基化会多烷基化（二乙苯、三乙苯），所以产物要**精馏分离**，
     * 多烷基苯返回烷基化器 —— 这个循环本层写不出来（没有回流），记在注释里。
     */
    id: 'make/ethylbenzene',
    name: '乙苯制备',
    produces: [{ item: 'mat/ethylbenzene', qty: q(1000) }],
    uses: [
      { anyOf: [{ item: 'mat/benzene', qty: q(950) }] },
      { anyOf: [{ item: 'mat/ethylene', qty: q(250) }] },
      { anyOf: [{ item: 'mat/aluminium-chloride', qty: q(10) }] },
    ],
    needs: [],
    performedBy: 'plant/wet-bench',
    under: [
      { param: 'temperature', min: 80, max: 100 },
      { param: 'pressure', min: 100, max: 300 },
    ],
    unbalanced_zh: '苯 950 + 乙烯 250 + 三氯化铝 10 → 乙苯 1000；余 210 是多烷基苯与催化剂水解渣（多烷基苯应返回烷基化器，本层没写回流）',
  },
  {
    /**
     * 苯乙烯：乙苯脱氢，600–650 °C，氧化铁催化，通过热蒸汽。
     *
     *   乙苯 1000 + 蒸汽 300 → 苯乙烯 850 + 氢 20
     *
     * 脱氢是吸热反应且体积变大，所以**高温 + 低压 + 通蒸汽**三个条件一起上：
     * 蒸汽既稀释（降分压）又供热，还抑制催化剂结焦。
     *
     * ⚠️ 一处与本层条件的呼应：低压对脱氢**有利**（Δn(气) > 0 的那一类）——
     * 也就是说火星的稀薄大气在这条链上帮了忙，而不是添麻烦。
     */
    id: 'make/styrene',
    name: '苯乙烯制备',
    produces: [
      { item: 'mat/styrene', qty: q(850) },
      { item: 'mat/ethylbenzene', qty: q(430) },
      { item: 'mat/benzene', qty: q(20) },
      { item: 'mat/toluene', qty: q(5) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ethylbenzene', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/water-vapor', qty: q(300) }] },
      { anyOf: [{ item: 'mat/iron-concentrate', qty: q(5) }] },
    ],
    needs: [],
    performedBy: 'plant/bosch-reactor',
    under: [{ param: 'temperature', min: 600, max: 650 }],
    unbalanced_zh: '乙苯 1000 + 蒸汽 300 → 苯乙烯 850 + 未转化乙苯 430（回精馏）+ 苯 20 + 甲苯 5 = 1305',
  },
  {
    /**
     * 二乙烯苯：乙苯再烷基化 → 二乙苯 → 双脱氢。
     *
     *   乙苯 800 + 乙烯 400 + 三氯化铝 5 → 二乙烯苯 600
     *
     * 它是交联剂，用量只有树脂的 5–8% —— 但它决定树脂珠能不能撑住水流的冲刷。
     */
    id: 'make/divinylbenzene',
    name: '二乙烯苯制备',
    produces: [
      { item: 'mat/divinylbenzene', qty: q(600) },
      {
        item: 'mat/polyethylbenzene',
        qty: q(605),
        gives: [
          { param: 'purity', kind: 'range', min: 60, max: 90 },
          { param: 'form', kind: 'enum', oneOf: ['liquid'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ethylbenzene', qty: q(800) }] },
      { anyOf: [{ item: 'mat/ethylene', qty: q(400) }] },
      { anyOf: [{ item: 'mat/aluminium-chloride', qty: q(5) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '二乙苯（烷基化，80–100）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 80, max: 100 }] },
      { note_zh: '双脱氢（600–650，氧化铁催化）', performedBy: 'plant/bosch-reactor', under: [{ param: 'temperature', min: 600, max: 650 }] },
    ],
    unbalanced_zh: '乙苯 800 + 乙烯 400 + 三氯化铝 5 = 1205 → 二乙烯苯 600 + 多乙苯 605（已单列 mat/polyethylbenzene，可脱烷基回乙苯）= 1205，平',
  },
  {
    /**
     * 阳离子交换树脂：悬浮聚合 → 磺化。
     *
     *   苯乙烯 900 + 二乙烯苯 60 + 硫酸 400（磺化）→ 树脂 1000
     *
     * 悬浮聚合：把单体分散成小珠，在 70–90 °C 聚合。分散介质是水，
     * 稳定剂用磷酸钙或碳酸镁（本层有镁砂）—— 珠的大小决定压降，而模型没有粒度。
     *
     * 磺化：发烟硫酸或浓硫酸，80–100 °C，把苯环上的 H 换成 —SO₃H。
     * **这一步决定交换容量**（每克干树脂多少毫克当量），而模型没有容量。
     */
    id: 'make/cation-resin',
    name: '阳离子交换树脂制备',
    produces: [
      { item: 'mat/cation-resin', qty: q(1000) },
      {
        item: 'mat/sulfonation-waste-acid',
        qty: q(360),
        gives: [
          { param: 'acid', kind: 'range', min: 30, max: 60 },
          { param: 'organics', kind: 'range', min: 1, max: 5 },
          { param: 'form', kind: 'enum', oneOf: ['solution'] },
        ],
      },
      { item: 'mat/tailings', qty: q(10) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/styrene', qty: q(900) }] },
      { anyOf: [{ item: 'mat/divinylbenzene', qty: q(60) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(400) }] },
      { anyOf: [{ item: 'mat/magnesia', qty: q(10) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '悬浮聚合（70–90，镁砂做稳定剂）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 70, max: 90 }] },
      { note_zh: '洗涤、筛分（珠径分级）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 120 }, { param: 'pressure', min: 100, max: 500 }] },
      { note_zh: '磺化（80–100，浓硫酸）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 80, max: 100 }] },
      { note_zh: '酸洗转型（H 型）与储存', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 120 }, { param: 'pressure', min: 100, max: 500 }] },
    ],
    unbalanced_zh: '苯乙烯 900 + 二乙烯苯 60 + 硫酸 400 + 镁砂 10 = 1370 → 树脂 1000 + 磺化废酸 360（已单列 mat/sulfonation-waste-acid，走 make/waste-acid-neutralization）+ 筛下细珠 10（tailings）= 1370，平',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...STYRENE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...STYRENE_ROUTES];
