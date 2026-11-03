/**
 * C₂ 氟烯烃源链 —— 乙烯 + 氯气 + HF + 锌 → 三氟氯乙烯（CTFE）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么先建这半条，而不是先建碘
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * C4F6 的两条工业路线都要 **CTFE**（三氟氯乙烯，C₂ClF₃）：
 *
 *   ICl + CTFE → 三步 → C4F6        （碘已立战略种子 10 kg）
 *   CTFE 本身 → 聚三氟氯乙烯（PCTFE）
 *
 * CTFE 的原料：**乙烯、氯气、锌都有路线；HF 来自磷灰石精矿**
 * （ores.ts:338，1000 kg 精矿 → 26 kg HF；精矿从风化层浮选 30:1，
 * P₂O₅ 1 % → 30 %）—— 氟不是无源，而是与磷酸/磷石膏联产。
 *
 * C4F6 也不是 0 条路线：c4f6.ts 已接 ICl + CTFE 三步，碘以 ZnI₂ → ICl
 * 循环、按 95 % 回收补 91.6 g/kg；本文件只建 CTFE。C4F6 三步已拆开
 * （c4f6-steps.ts），累积 55.05–67.74 %（标称 59.88 %），仍是工程估算。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 路线（四步，全部按原子量配平）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① C₂H₄ + 4 Cl₂ → C₂Cl₄ + 4 HCl          300–400 °C
 *   ② C₂Cl₄ + Cl₂ → C₂Cl₆                    50–100 °C
 *   ③ C₂Cl₆ + 3 HF → C₂Cl₃F₃ + 3 HCl         200–300 °C，FeCl₃ 催化（SbCl₅ 未建）
 *   ④ C₂Cl₃F₃ + Zn → C₂ClF₃ + ZnCl₂          200–300 °C
 *
 * ③ 的工业催化剂是 SbCl₅；Sb 现在是一次性输入（`cs-sb.ts`，无本地路线、
 * 不可复制），没有可复制的 SbCl₅ 路线，所以仍用 FeCl₃ 替代 —— 活性低、
 * 收率待查，这一条写在缺口①里，不假装等价。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 质量账（每 1 kg 产品）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   PCE 1 kg：乙烯 0.169 + 氯 1.710 → PCE 1.000 + HCl 0.879
 *   HCE 1 kg：PCE 0.7005 + 氯 0.2995 → HCE 1.000
 *   CFC-113 1 kg：HCE 1.263 + HF 0.320 → CFC-113 1.000 + HCl 0.584
 *   CTFE 1 kg：CFC-113 1.609 + 锌 0.561 → CTFE 1.000 + ZnCl₂ 1.170
 *
 * 四条都逐项配平；HCl / ZnCl₂ 有条目就产，没有的写进 `unbalanced_zh`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CTFE_ITEMS: readonly Item[] = [
  /** 四氯乙烯（PCE，C₂Cl₄，M 165.83）。bp 121 °C，无色液体。 */
  {
    id: 'mat/perchloroethylene',
    name: '四氯乙烯',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'waterContent', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /** 六氯乙烷（HCE，C₂Cl₆，M 236.73）。白色晶体，升华 185 °C。 */
  {
    id: 'mat/hexachloroethane',
    name: '六氯乙烷',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'waterContent', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /** 三氟三氯乙烷（CFC-113，C₂Cl₃F₃，M 187.37）。bp 47.6 °C。 */
  {
    id: 'mat/cfc-113',
    name: '三氟三氯乙烷',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'waterContent', kind: 'range', min: 0, max: 0.5, unit: '%', dir: 'atMost' },
    ],
  },

  /** 三氟氯乙烯（CTFE，C₂ClF₃，M 116.47）。bp −27.9 °C，气体。 */
  {
    id: 'mat/ctfe',
    name: '三氟氯乙烯',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'waterContent', kind: 'range', min: 0, max: 0.1, unit: '%', dir: 'atMost' },
    ],
  },
];

export const CTFE_ROUTES: readonly Route[] = [
  {
    /**
     * **PCE：C₂H₄ + 4 Cl₂ → C₂Cl₄ + 4 HCl（300–400 °C）。**
     *
     *   乙烯 169 + 氯 1 710 → PCE 1 000 + HCl 879
     *   进 1 879 = 出 1 879 ✓
     *
     * 高温氯化是自由基连串反应；四氯乙烯是过氯化产物，HCl 进碱洗塔。
     */
    id: 'make/perchloroethylene',
    name: '四氯乙烯制备',
    produces: [
      {
        item: 'mat/perchloroethylene',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 98, max: 99.5 },
          { param: 'waterContent', kind: 'range', min: 0.05, max: 0.5 },
        ],
      },
      { item: 'mat/hcl', qty: q(879), gives: [{ param: 'concentration', kind: 'range', min: 30, max: 35 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ethylene', qty: q(169) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(1710) }] },
    ],
    needs: [],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '① 高温氯化：乙烯 + 过量氯 300–400 °C / 100–300 kPa，自由基取代；四氯乙烯是过氯化产物，副产 HCl 进碱洗塔/盐酸吸收',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 300, max: 400 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '② 冷凝与精馏：PCE bp 121 °C，与 HCl/未反应氯分开；塔的 40–80 °C 窗口罩不住 121 °C，本段用常压釜式精馏（与 TMAH 的塔顶同一处限制）',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 80, max: 130 },
          { param: 'pressure', min: 100, max: 150 },
        ],
      },
    ],
  },

  {
    /**
     * **HCE：C₂Cl₄ + Cl₂ → C₂Cl₆（50–100 °C）。**
     *
     *   PCE 700.5 + 氯 299.5 → HCE 1 000
     *   进 1 000 = 出 1 000 ✓
     */
    id: 'make/hexachloroethane',
    name: '六氯乙烷制备',
    produces: [
      {
        item: 'mat/hexachloroethane',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 98, max: 99.5 },
          { param: 'waterContent', kind: 'range', min: 0.05, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/perchloroethylene', qty: q(7005, 10) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(2995, 10) }] },
    ],
    needs: [],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① 加成氯化：PCE + 氯 50–100 °C / 100–300 kPa，液相或气相；放热，夹套冷却',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 50, max: 100 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '② 结晶：HCE 在 20–30 °C 结晶，过滤；母液（PCE/氯）回①',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 30 }],
      },
    ],
  },

  {
    /**
     * **CFC-113：C₂Cl₆ + 3 HF → C₂Cl₃F₃ + 3 HCl（200–300 °C，FeCl₃）。**
     *
     *   HCE 1 264 + HF 320 → CFC-113 1 000 + HCl 584
     *   进 1 583 = 出 1 584（1 g 四舍五入）
     *
     * ⚠️ 工业催化剂是 SbCl₅；Sb 现在是一次性输入（`cs-sb.ts`），没有可复制的
     * SbCl₅ 路线，所以用 FeCl₃ 替代。活性低、氟化度可能不足，收率**待查**（缺口①）。
     */
    id: 'make/cfc-113',
    name: '三氟三氯乙烷制备',
    produces: [
      {
        item: 'mat/cfc-113',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 95, max: 99 },
          { param: 'waterContent', kind: 'range', min: 0.05, max: 0.5 },
        ],
      },
      { item: 'mat/hcl', qty: q(584), gives: [{ param: 'concentration', kind: 'range', min: 30, max: 35 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/hexachloroethane', qty: q(1264) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(320) }] },
    ],
    // SbCl₅ 未建（Sb 是一次性输入，无 SbCl₅ 路线）；FeCl₃ 是替代催化剂，活性低（缺口①）
    needs: ['mat/ferric-chloride'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '① 气相加 HF：HCE + 3 HF 200–300 °C / 100–300 kPa，FeCl₃ 催化；SbCl₅ 未建（Sb 一次性输入）⇒ 活性低，氟化度可能不足（缺口①）',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 200, max: 300 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '② 冷凝与精馏：CFC-113 bp 47.6 °C，塔的 40–80 °C 窗口正好罩住；塔顶取 47–48 °C 馏分，HCl 从塔顶气走碱洗。**压力只到 500 kPa**（酸厂上限），CFC-113 在 47.6 °C 的饱和压约 1 atm，常压蒸馏就够',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 40, max: 80 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
    ],
  },

  {
    /**
     * **CTFE：C₂Cl₃F₃ + Zn → C₂ClF₃ + ZnCl₂（200–300 °C）。**
     *
     *   CFC-113 1 609 + 锌 561 → CTFE 1 000 + ZnCl₂ 1 170
     *   进 2 170 = 出 2 170 ✓
     *
     * 这是**脱氯**，不是脱氟：锌把 CFC-113 上的一个氯拿走，留下 CTFE。
     * 产物是气体（bp −27.9 °C），要 −30 °C 冷凝或压缩；本层有 `mat/dry-ice` 冷阱。
     */
    id: 'make/ctfe',
    name: '三氟氯乙烯制备',
    produces: [
      {
        item: 'mat/ctfe',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 98, max: 99.9 },
          { param: 'waterContent', kind: 'range', min: 0, max: 0.1 },
        ],
      },
      {
        item: 'mat/zinc-chloride',
        qty: q(1170),
        gives: [{ param: 'purity', kind: 'range', min: 95, max: 99.5 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/cfc-113', qty: q(1609) }] },
      { anyOf: [{ item: 'mat/zinc', qty: q(561) }] },
    ],
    // 干冰冷阱是料，不是设备；压缩/干燥借酸厂
    needs: ['mat/dry-ice'],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh:
          '① 锌脱氯：CFC-113 蒸气 + 锌粉 200–300 °C / 100–300 kPa；锌过量 10 % 把 CFC-113 推到底，ZnCl₂ 连续排出',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 200, max: 300 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '② 压缩 + 干冰冷阱：CTFE bp −27.9 °C，压缩到 3–5 bar 后进 −78.5 °C 干冰阱冷凝；不凝气（HCl/未反应物）去碱洗。**本层没有 −30 °C 制冷机**，干冰是冷凝介质，不是设备',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 300, max: 500 },
        ],
      },
      {
        note_zh:
          '③ 干燥与装瓶：CTFE 水 ≤0.1 %，过 4A 分子筛（`mat/zeolite-4a` 有）；本层没有在线水分，按露点抽检',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 40 }],
      },
    ],
    unbalanced_zh:
      'CFC-113 1609 + 锌 561 = 2170 → CTFE 1000 + ZnCl₂ 1170 = 2170（逐项配平）。冷凝是 3–5 bar 压缩 + −78.5 °C 干冰冷阱；本层没有 −30 °C 制冷机，干冰按料记、不进设备 holds',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CTFE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CTFE_ROUTES];
