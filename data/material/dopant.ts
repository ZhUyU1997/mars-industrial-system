/**
 * 磷与合金结晶体管 —— 第 8 门的第一步，以及第二只器件。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 掺杂：不需要硼
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 半导体的两种掺杂：施主（n 型）与受主（p 型）。教科书上是磷与硼，但——
 *
 *   受主   **铝**（Al 在硅里是受主，p 型）—— 本层有铝
 *   施主   **磷**（P 是施主，n 型）—— 磷灰石精矿有
 *
 * 所以**硼不是必需品**。硼只在高效太阳能电池与某些器件里要紧，而本层没有硼矿
 * （风化层里几 ppm，没有富集路线）—— 这本来会被判成"卡住"，但换成铝就不卡。
 *
 * **这是这一节最重要的一句话：判断"缺什么"之前，先问"有没有另一种做法"。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 磷从磷灰石来：电炉还原
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   磷灰石精矿（30% P₂O₅）+ 硅石 + 焦炭 → 黄磷 + 硅酸钙渣 + 一氧化碳
 *
 *   1400–1500 °C，矿热炉就能做（磷酸盐电炉本来就是矿热炉的一种）。
 *   黄磷在水下保存（空气中自燃），可以升华为白磷再做成磷铜。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 合金结晶体管：不用光刻的第二只器件
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 1951 年的做法：一片薄硅片，两面各熔一颗**含施主的合金球**，熔透一半深度 ——
 * 两个球底下各形成一个 p-n 结，中间没熔透的那层是基区。
 *
 *   硅片（p 型）  +  两颗磷铜球  →  600–700 °C 合金  →  n-p-n
 *
 * 关键在"熔透控制"：温度高、时间长就穿通，整片报废。所以它靠看时间与火色，
 * 而模型没有时间 —— 这一条只能写在注释里。
 *
 * 比点接触强在哪：结是**冶金结合**的，不是压上去的，所以稳定、一致、寿命长。
 *   增益 20–50 倍（点接触 2–10）· 寿命几年（点接触几天到几周）
 *
 * 而它**不需要光刻、不需要扩散炉、不需要硼** —— 只要一片硅片、一颗磷铜球、
 * 一台 600 °C 的炉子。这就是"第 8 门"在 1951 年的走法。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DOPANT_ITEMS: readonly Item[] = [
  /**
   * 黄磷（白磷）。蜡状固体，熔点 44 °C，空气中自燃 —— 必须在水下切、水下存。
   *
   * 本层用它只有两个去处：做磷铜合金（合金结的施主球），以后做扩散源（POCl₃）。
   * 它有毒且自燃，是本层最危险的物料之一。
   */
  { id: 'mat/phosphorus', name: 'Yellow Phosphorus', name_zh: '黄磷', unit: 'kg', category: 'material' },

  /**
   * 合金结晶体管（n-p-n）。一片硅片、两颗磷铜球、三根引线。
   *
   * 增益 20–50 倍，寿命几年。它是**第一只能用的器件** —— 点接触那只只是证据。
   */
  { id: 'std/alloy-junction-transistor-general', name: 'Alloy-Junction Transistor', name_zh: '合金结晶体管', unit: '件', category: 'part' },
];

export const DOPANT_ROUTES: readonly Route[] = [
  {
    /**
     * 黄磷：磷灰石精矿 + 硅石 + 焦炭，电炉还原。
     *
     *   精矿 1000（30% P₂O₅）+ 硅石 380 + 焦炭 130 → 黄磷 131 + 硅酸钙渣 735
     *
     * 磷蒸气从炉顶出来，冷凝在水下。渣是硅酸钙，可以去做水泥或渣棉。
     * 精矿里剩下的 700 kg 主要是氧化钙与氟（磷灰石含氟 3–4%）——
     * 氟进渣或随气带走，是本层唯一要防的腐蚀源。
     *
     * ⚠️ 降级：黄磷电炉正常跑 1400–1500，而本层矿热炉的下限是 1500 ——
     * 只能在 1500–1600 做，**温度偏高**：磷蒸气带走更多氟与粉尘，冷凝后要再蒸一次，
     * 收率比 131 kg 低一档（这里按理论值写，不编折减）。
     */
    id: 'make/phosphorus',
    name: 'Yellow Phosphorus Production', name_zh: '黄磷制备',
    produces: [{ item: 'mat/phosphorus', qty: q(131) }],
    uses: [
      { anyOf: [{ item: 'mat/apatite-concentrate', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(380) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(130) }] },
    ],
    needs: [],
    performedBy: 'plant/submerged-arc-furnace',
    under: [{ param: 'temperature', min: 1500, max: 1600 }],
    unbalanced_zh: '精矿 1000（30% P₂O₅）+ 硅石 380 + 焦炭 130 → 黄磷 131 + 硅酸钙渣 735；③ 可接受：CO 与氟化物随尾气放空 + 碱洗，本层无回收路线，不建条目',
  },
  {
    /**
     * 合金结晶体管：划片 → 腐蚀 → 置磷铜球 → 合金烧结 → 引线封装 → 测试。
     *
     *   硅片 1 片（划成几十小片）+ 磷（做磷铜球）+ 铜（引线与球）+ 酚醛（封装）
     *
     * 合金温度 600–700 °C：高了穿通、低了没熔透 —— 靠看火色与计时，模型没有时间维。
     */
    id: 'make/alloy-transistor',
    name: 'Alloy-Junction Transistor Manufacturing', name_zh: '合金结晶体管制造',
    produces: [{ item: 'std/alloy-junction-transistor-general', qty: q(15) }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phosphorus', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '划片与腐蚀（氢氟酸 + 硝酸）', performedBy: 'plant/robot' },
      { note_zh: '熔磷铜、压球、置球', performedBy: 'plant/robot' },
      { note_zh: '合金烧结（600–700 °C，控制熔透）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 600, max: 700 }] },
      { note_zh: '引线焊接与封装', performedBy: 'plant/robot' },
      { note_zh: '测试与分选（测增益）', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '硅片 1 片（约 40 小片）→ 合金结晶体管 15 只；余 25 片是划片崩边、穿通与增益不合格',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...DOPANT_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...DOPANT_ROUTES];
