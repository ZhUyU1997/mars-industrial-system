/**
 * 多晶硅链 —— 从硅石到多晶硅，第 1–4 门。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 四步化学，四件料
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   ① 冶金级硅   SiO₂ + 2C → Si + 2CO，2000 °C         电弧炉（已有）
 *   ② 三氯氢硅   Si + 3HCl → SiHCl₃ + H₂，300 °C       Bosch 那台通用反应器
 *   ③ 精馏       SiHCl₃ 31.8 / SiCl₄ 57.6 / 硼磷氯化物  精馏塔（新增）
 *   ④ 还原       SiHCl₃ + H₂ → Si + 3HCl，1100 °C       还原钟罩（新增）
 *
 * 四步里两步是"提纯"：三氯氢硅这一步把硅变成液体（沸点 31.8 °C，常温就是液体），
 * 于是可以用**分馏**提纯 —— 这是整个半导体链最聪明的一处设计：
 * **把要提纯的固体变成液体，纯度问题就变成塔板数问题。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么停在多晶硅
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 第 5 门（单晶）要石英坩埚与提拉机构，本层过不去。
 * 所以这一节到多晶硅为止 —— **它是这条链目前的前沿**：造得出来，但还没有下游。
 * 报告会把它列进"死产"，那不是废物，是下一步的入口。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 数字
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 每一步都按化学计量算过：
 *
 *   硅石 1000（90% SiO₂ → 900）+ 碳 360 → 硅 420 + CO 840
 *   硅 200 + 氯化氢 782 → 三氯氢硅 968 + 氢 14
 *   三氯氢硅 1000 → 纯 900（余 10% 是 SiCl₄ 与硼磷氯化物 —— 要被分掉的部分）
 *   三氯氢硅 1000 + 氢 15 → 硅 207 + 氯化氢 808
 *
 * 最后一行的氯化氢回到第 ② 步 —— **氯在链内循环**，只补损耗。这与氯碱那条链
 * 是同一个道理（氯不是消耗品，是载体）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const POLYSILICON_ITEMS: readonly Item[] = [
  /**
   * 冶金级硅（MG-Si，98%）。硅石用碳还原出来，含铁、铝、钙各百分之一二。
   *
   * 它做不了器件，但它是三氯氢硅的原料 —— 后面靠分馏提纯，所以起点不必很纯。
   * **这是整个半导体链能自举的关键：第一步只要 98%。**
   */
  { id: 'mat/silicon-mg', name: '冶金级硅', unit: 'kg', category: 'material' },

  /**
   * 三氯氢硅（SiHCl₃）。常温是液体，沸点 31.8 °C，遇潮气剧烈水解。
   *
   * 它是"可蒸馏的硅"：一个硅原子带三个氯一个氢，68% 的重量是氯。
   * 纯度靠分馏，而分馏的代价是能量 —— 每吨多晶硅要几十吨蒸汽当量。
   */
  { id: 'mat/trichlorosilane', name: '三氯氢硅', unit: 'kg', category: 'material' },

  /**
   * 精馏后的三氯氢硅。硼、磷的氯化物沸点与它只差几度，要靠塔板数硬分 ——
   * 而这正是"半导体级"与"冶金级"之间真正的距离。
   */
  { id: 'mat/trichlorosilane-pure', name: '精馏后的三氯氢硅', unit: 'kg', category: 'material' },

  /**
   * 多晶硅（99.9999% 级，硅棒碎块）。
   *
   * 它是这条链的前沿：造得出，但还没有下游（单晶那一门过不去）。
   * 报告会把它列进"死产" —— 这不是废物，是"下一步的入口"。
   */
  { id: 'mat/polysilicon', name: '多晶硅', unit: 'kg', category: 'material' },
];

export const POLYSILICON_ROUTES: readonly Route[] = [
  {
    /**
     * 冶金级硅：硅石 + 碳，2000 °C 电弧还原。
     *
     *   硅石 1000（90% SiO₂ = 900）+ 碳 360 → 硅 420 + CO 840
     *
     * 碳要用低灰分的（石油焦最好，本层没有 —— 用木炭/焦炭代，灰分随渣排掉）。
     * 出炉的硅水浇成锭，含铁铝钙 2% —— 对下一步足够。
     */
    id: 'make/silicon-mg',
    name: '冶金级硅制备',
    produces: [
      { item: 'mat/silicon-mg', qty: q(420) },
      // 副产 840 kg 一氧化碳：还原剂里多出来的碳。
      { item: 'mat/co', qty: q(840), gives: [{ param: 'purity', kind: 'range', min: 60 }] },
      { item: 'mat/tailings', qty: q(100) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silica', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(360) }] },
    ],
    needs: [],
    performedBy: 'plant/arc-furnace',
    under: [{ param: 'temperature', min: 1900, max: 2200 }],
    unbalanced_zh: '硅石 1000（90% SiO₂）+ 碳 360 → 硅 420 + CO 840 + 灰分 100（已单列 mat/tailings）',
  },
  {
    /**
     * 三氯氢硅：硅粉 + 氯化氢，300 °C，铜催化。
     *
     *   硅 200 + 氯化氢 782 → 三氯氢硅 968 + 氢 14
     *
     * 硅要磨到 100 目以下（流化床才吹得动）。反应放热，要撤热 —— 温度一高
     * 就多出四氯化硅（SiCl₄），那一份硅就白跑了。
     */
    id: 'make/trichlorosilane',
    name: '三氯氢硅制备',
    produces: [
      { item: 'mat/trichlorosilane', qty: q(968) },
      { item: 'mat/hydrogen', qty: q(14), gives: [{ param: 'purity', kind: 'range', min: 99, max: 99.5, dir: 'atLeast' }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-mg', qty: q(200) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(782) }] },
    ],
    needs: ['plant/grinder'],
    performedBy: 'plant/bosch-reactor',
    under: [{ param: 'temperature', min: 280, max: 320 }],
  },
  {
    /**
     * 精馏：粗三氯氢硅过塔，塔顶出纯品。
     *
     *   1000 粗 → 900 纯（余 100 是 SiCl₄ 与硼磷氯化物，塔底排掉）
     *
     * 硼、磷的氯化物沸点与 SiHCl₃ 差几度，要靠塔板数与回流比硬分 ——
     * **这是"太阳能级"与"电子级"之间真正的距离，也是这条链最花能量的一步。**
     *
     * ⚠️ **火星条件是这里最容易漏掉的一件事**：SiHCl₃ 在 1 atm 下沸点 31.8 °C，
     * 而在 0.6 kPa 下只剩约 −65 °C —— 塔顶那点馏出物在火星环境里根本凝不下来。
     * 所以这座塔**必须加压**（几百 kPa 级，塔体本来就是压力容器），
     * 不然就要配一条 −70 °C 的深冷链。
     */
    id: 'make/trichlorosilane-pure',
    name: '精馏',
    produces: [
      { item: 'mat/trichlorosilane-pure', qty: q(900) },
      // 塔底 SiCl₄ 单列（以前只写在声明里；补条目后 1000 → 900 + 100 真平）
      {
        item: 'mat/silicon-tetrachloride',
        qty: q(100),
        gives: [{ param: 'purity', kind: 'range', min: 95, max: 99 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/trichlorosilane', qty: q(1000) }] }],
    needs: [],
    performedBy: 'plant/distillation-tower',
    under: [
      { param: 'temperature', min: 40, max: 80 },
      // 0.6 kPa 的塔顶什么也凝不出来 —— 这条压力是这座塔成立的前提。
      { param: 'pressure', min: 300, max: 1000 },
    ],
    unbalanced_zh: '粗品 1000 → 纯品 900 + 塔底四氯化硅 100（已单列 mat/silicon-tetrachloride；微量 B/P 氯化物并入同一条），进 1000 = 出 1000',
  },
  {
    /**
     * 还原：三氯氢硅 + 氢，1100 °C，在硅芯上沉积成棒。
     *
     *   三氯氢硅 1000 + 氢 15 → 硅 207 + 氯化氢 808
     *
     * 氯化氢回到第 ② 步 —— **氯在链内循环**，只补损耗（与氯碱链同一个道理）。
     * 沉积速度很慢（几小时长几毫米），这是它产能低的原因，也是模型说不出的部分。
     */
    id: 'make/polysilicon',
    name: '还原',
    produces: [
      { item: 'mat/polysilicon', qty: q(207) },
      { item: 'mat/hcl', qty: q(808), gives: [{ param: 'concentration', kind: 'range', min: 30, max: 33 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/trichlorosilane-pure', qty: q(1000) }] },
      {
        anyOf: [
          {
            item: 'mat/hydrogen',
            qty: q(15),
            need: [{ param: 'purity', kind: 'range', min: 99.999, max: 100, dir: 'atLeast' }],
            onRelax: 'functional-lost',
          },
        ],
      },
    ],
    needs: [],
    performedBy: 'plant/siemens-reactor',
    under: [{ param: 'temperature', min: 1050, max: 1150 }],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...POLYSILICON_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...POLYSILICON_ROUTES];
