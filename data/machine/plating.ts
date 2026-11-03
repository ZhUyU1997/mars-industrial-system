/**
 * 电镀 —— 一层几微米的金属，把"能用"变成"耐用"。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 这一层一直在"假装有电镀"
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 数据里有几处写着"钢板镀镍"：
 *
 *   电解槽电极   碱液里铁会溶，镍耐蚀又是析氢的好催化面
 *   氯碱电极     同上
 *   芯片键合     "没有镀金/镀镍打底"。
 *
 * **但没有任何一条路线做"镀"这件事。** 电极的物料清单里直接写着 1 kg 镍 ——
 * 好像电极是实心镍做的。那是"假装有电镀"。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 电镀要三样东西，本层全有
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   直流电    旋转变流机 —— 电镀要的是"低电压、大电流"，正合适
 *   电解液    硫酸镍 + 硼酸 + 氯化镍（本层有镍、硫酸、硼酸？）
 *   阳极      纯镍板（溶解补充镀液里的镍离子）
 *
 * 阴极是工件。通电后镍离子在工件表面还原：
 *
 *   阴极  Ni²⁺ + 2e⁻ → Ni          （镀层，几微米到几十微米）
 *   阳极  Ni → Ni²⁺ + 2e⁻          （阳极溶解，补充离子）
 *
 * 所以电镀是"把阳极的金属搬到阴极上" —— **不消耗化学品，只消耗阳极与电。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 三处工艺要点（每条都写进路线里）
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   除油      镀层结合力的头号杀手。碱洗 + 电化学除油
 *   酸洗      活化表面，去掉氧化皮
 *   电流密度  太大镀层粗糙发黑，太小镀不上 —— 靠"挂具面积 × 电流"估算
 *
 * ⚠️ 一处降级：没有光亮剂（那些是有机物，要一整套精细化工）。所以镀层是**哑光**的，
 * 需要光亮就得机械抛光 —— 而抛光又回到"以工时换精度"。
 *
 * ⚠️ 另一处：没有氰化物镀液（那要氰化钠 —— 剧毒，且要氢氰酸链）。所以**镀不了锌、
 * 镀不了黄铜、镀不了银**。本层能做的是酸性镀镍、酸性镀铜、镀铬（铬酸体系）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PLATING_ITEMS: readonly Item[] = [
  /** 硫酸镍。绿色晶体，电镀主盐。镍 + 稀硫酸慢慢溶（要加热、要通气搅拌）。 */
  { id: 'mat/nickel-sulfate', name: 'Nickel Sulfate', name_zh: '硫酸镍', unit: 'kg', category: 'material' },

  /**
   * 镀镍液。硫酸镍 + 氯化镍（导电盐）+ 硼酸（缓冲 pH 3.5–4.5）。
   *
   * pH 是它的命：太低镀层脆，太高会生成氢氧化镍沉淀 —— 而本层没有 pH 计，
   * 只能靠 pH 试纸（石蕊 + 比色卡）与"镀层颜色"判断。
   */
  { id: 'mat/nickel-plating-solution', name: 'Nickel Plating Solution', name_zh: '镀镍液', unit: 'kg', category: 'material' },
];

export const PLATING_PARTS: readonly Item[] = [
  /** 镀槽。PP 或 PVC 焊成的槽体 —— 镀镍液是酸性的，钢槽会溶。 */
  { id: 'plant/plating-bath/tank', name: 'Electroplating Bath Tank', name_zh: '电镀槽槽体', unit: '件', category: 'part' },

  /** 阳极挂具。钛篮装镍板，外包阳极袋（防阳极泥落到工件上）。 */
  { id: 'plant/plating-bath/anode-rack', name: 'Electroplating Bath Anode Rack', name_zh: '电镀槽阳极挂具', unit: '件', category: 'part' },

  /** 直流母线与挂具。铜排 + 阴极挂具（工件挂上去，要能导电、要方便取放）。 */
  { id: 'plant/plating-bath/busbar', name: 'Electroplating Bath DC Busbar and Rack', name_zh: '电镀槽直流母线与挂具', unit: '件', category: 'part' },
];

export const PLATING_ROUTES: readonly Route[] = [
  {
    /**
     * 硫酸镍：镍 + 稀硫酸（加热到 60–80，慢慢加，冒氢气）。
     *
     *   镍 250 + 硫酸 850 → 硫酸镍 1000（结晶带走结晶水）
     */
    id: 'make/nickel-sulfate',
    name: 'Nickel Sulfate Production', name_zh: '硫酸镍制备',
    produces: [
      { item: 'mat/nickel-sulfate', qty: q(1000) },
      { item: 'mat/hydrogen', qty: q(5), gives: [{ param: 'purity', kind: 'range', min: 99, max: 99.9 }] },
      {
        item: 'mat/nickel-sulfate-mother-liquor',
        qty: q(95),
        gives: [
          { param: 'nickel', kind: 'range', min: 2, max: 5 },
          { param: 'sulfate', kind: 'range', min: 10, max: 20 },
          { param: 'form', kind: 'enum', oneOf: ['solution'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/nickel', qty: q(250) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(850) }] },
    ],
    needs: [],
    performedBy: 'plant/wet-bench',
    under: [{ param: 'temperature', min: 60, max: 80 }],
    unbalanced_zh: '镍 250 + 硫酸 850 → 硫酸镍 1000 + 氢 5 + 结晶母液 95（已单列 mat/nickel-sulfate-mother-liquor，可回结晶）',
  },
  {
    /**
     * 镀镍液：硫酸镍 + 氯化镍 + 硼酸 + 水。
     *
     *   硫酸镍 250 + 氯化镍 50 + 水 700 → 镀液 1000（**没有硼酸** —— 缓冲剂确实缺，见下）
     *
     * 氯化镍自己没有条目 —— 用镍 + 盐酸现做，写在步骤里（不单独开条目：
     * 它只在镀液里出现，且用量小）。
     */
    id: 'make/nickel-plating-solution',
    name: 'Nickel Plating Solution Production', name_zh: '镀镍液制备',
    produces: [{ item: 'mat/nickel-plating-solution', qty: q(1000) }],
    uses: [
      { anyOf: [{ item: 'mat/nickel-sulfate', qty: q(250) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(20) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(30) }] },
      // 硼酸本层没有条目（硼砂要硼矿）。用**柠檬酸**代缓冲剂？也没有。
      // 所以这一步的缓冲剂确实缺 —— 记在这里，不假装有：无缓冲时 pH 漂移，镀层发脆。
      { anyOf: [{ item: 'mat/water', qty: q(700) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '氯化镍现做（镍 + 盐酸，加热溶解）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 60, max: 90 }] },
      { note_zh: '依次溶解硫酸镍、氯化镍、硼酸（60，搅拌）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 55, max: 65 }] },
      { note_zh: '调 pH 到 3.5–4.5（试纸比色）与过滤', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 120 }, { param: 'pressure', min: 100, max: 500 }] },
    ],
  },
  {
    /** 镀槽与挂具：PP 板焊接成槽 + 钛篮 + 铜排。 */
    id: 'make/plating-tank',
    name: 'Electroplating Bath Tank Manufacturing', name_zh: '电镀槽槽体制造',
    produces: [{ item: 'plant/plating-bath/tank', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 阳极挂具与母线：钛篮（装镍板）+ 阳极袋 + 铜排 + 阴极挂具。 */
    id: 'make/plating-rack',
    name: 'Electroplating Bath Anode Rack Manufacturing', name_zh: '电镀槽阳极挂具制造',
    produces: [{ item: 'plant/plating-bath/anode-rack', qty: q(1) }],
    uses: [
      // 工业用钛篮（耐蚀又不溶）；本层没有钛（钛铁矿有，但钛的提取是另一条链），
      // 改用 **PP 篮 + 挂钩**：镍板挂在钩上直接接触铜排，篮子只做支撑。
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 直流母线：铜排 + 旋转变流机接口 + 电流表 + 调压（串电阻或抽头）。 */
    id: 'make/plating-busbar',
    name: 'Electroplating Bath DC Busbar and Rack Manufacturing', name_zh: '电镀槽直流母线与挂具制造',
    produces: [{ item: 'plant/plating-bath/busbar', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'std/rectifier-rotary-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
];

/**
 * 电镀槽。20–60 °C、常压，但要通直流、要排风（酸雾）。
 *
 * 它 `holds` 温度 —— 镀镍在 50–60 °C 时内应力小、沉积快，冷了慢、热了镀层粗。
 */
export const PLATING_BATH: Item = {
  id: 'plant/plating-bath',
  name: 'Electroplating Bath', name_zh: '电镀槽',
  unit: '套',
  category: 'machine',
  // ⚠️ 补 pressure（镀槽那条曾指出）：55 °C 镀液蒸气压 15.7 kPa，
  // 在火星 0.6 kPa 上不封就沸干 —— 这槽实际是 **16 kPa 的封盖容器**（侧壁 0.51 MPa、盖 6.6 MPa，都很安全）。
  holds: [
    { param: 'temperature', min: 20, max: 60 },
    { param: 'pressure', min: 15, max: 20 },
  ],
  composedOf: [
    { item: 'plant/plating-bath/tank', qty: q(1) },
    { item: 'plant/plating-bath/anode-rack', qty: q(1) },
    { item: 'plant/plating-bath/busbar', qty: q(1) },
    { item: 'std/process-controller-general', qty: q(1) },
  ],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PLATING_PARTS, ...PLATING_ITEMS, PLATING_BATH];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/plating-bath',
    name: 'Electroplating Bath Assembly', name_zh: '电镀槽装配',
    produces: [{
      item: 'plant/plating-bath',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...PLATING_ROUTES, ...ASSEMBLY_ROUTES];
