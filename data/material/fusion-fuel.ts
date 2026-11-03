/**
 * 聚变燃料：氘与氚的条目与产出路线。
 *
 * 核原料按前提无限供应：D/T 不设规格属性，本地路线只作为能力备份，
 * 不交付规格窗口；数量不构成约束。
 *
 * 两个条目都是 consumable（燃料在等离子体里烧掉，不装在机器上），按 kg 计。
 *
 * 氘：天然水 D/H ≈ 1/6420（原子比），1 kg 水约含 1.73e-5 kg 氘；
 *   100 % 回收要 5.78e4 kg 水，按 50 % 回收取 1.2e5 kg 水/kg 氘。
 *   浓缩借用现有电解槽与真空精馏塔，最后用 GM 冷头 20 K 冷凝纯化。
 *
 * 氚：Li-6 + n → T + He-4，理论上 1 kg Li-6 出 0.5 kg 氚；
 *   按 50 % 提取取 4 kg Li-6/kg 氚，氦按 4/3 kg/kg 氚联产。
 *   包层辐照由聚变装置执行，提取与纯化借用现有真空塔与冷头。
 *
 * 这两条备份路线回答“从火星物质怎么走到燃料”，不回答“燃料够不够”；
 * 氚自持也不再作为包层的要求（包层只做屏蔽与取热）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FUEL_ITEMS: readonly Item[] = [
  /**
   * 氘：D-T 反应的燃料之一，天然水中以 D₂O/HDO 形态存在。
   *
   * 按前提无限供应，不声明规格属性，也不要求本地路线交付窗口。
   * 本地路线 make/deuterium 只作为能力备份。
   */
  {
    id: 'mat/deuterium',
    name: '氘',
    unit: 'kg',
    category: 'consumable',
  },

  /**
   * 氚：D-T 反应的另一个燃料，由包层里的 Li-6 俘获中子生成。
   *
   * 按前提无限供应，不声明规格属性，也不要求本地路线交付窗口。
   * 本地路线 make/tritium 只作为能力备份。
   */
  {
    id: 'mat/tritium',
    name: '氚',
    unit: 'kg',
    category: 'consumable',
  },
];

export const FUEL_ROUTES: readonly Route[] = [
  {
    /**
     * 氘（能力备份）：水 1.2e5 kg → 电解浓缩 → 真空精馏 → 20 K 冷凝纯化 → 氘 1 kg。
     *
     * 核原料按前提无限供应；本地路线只作为能力备份，不交付规格窗口；
     * 数量不构成约束。
     * 用量依据：天然水 D/H ≈ 1/6420，1 kg 水含氘约 1.73e-5 kg；
     * 100 % 回收需 5.78e4 kg 水，按 50 % 回收取 1.2e5 kg。
     * 设备：电解槽 10–90 °C / 50–500；真空塔 40–160 °C / 5–60 Pa，
     * 只按 40–60 °C / 5–60 Pa 的 D₂O/H₂O 浓缩窗口写；GM 冷头 18–25 K
     * 做最后冷凝纯化，制冷量 1–5 W，处理量放大未建模。
     */
    id: 'make/deuterium',
    name: '氘制造',
    produces: [{ item: 'mat/deuterium', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(120000) }] }],
    needs: [],
    steps: [
      {
        note_zh: '电解浓缩：水电解，氘留在液相',
        performedBy: 'plant/electrolyzer',
        under: [
          { param: 'temperature', min: 20, max: 80 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh: '真空精馏：40–60 °C / 5–60 Pa 下做 D₂O/H₂O 浓缩',
        performedBy: 'plant/vacuum-column',
        under: [
          { param: 'temperature', min: 40, max: 60 },
          { param: 'pressure', min: 5, max: 60 },
        ],
      },
      {
        note_zh: '20 K 冷凝纯化：GM 冷头把氘冷凝，处理量 1–5 W 量级',
        performedBy: 'plant/gm-cryocooler',
        under: [{ param: 'temperature', min: 18, max: 25 }],
      },
    ],
    unbalanced_zh: '水 1.2e5 kg → 氘 1 kg；其余是氧、氢与贫氘水，本路线只产氘，质量不守恒',
  },

  {
    /**
     * 氚（能力备份）：Li-6 4 kg → 包层辐照 → 真空塔脱氚 → 冷头冷凝纯化
     * → 氚 1 kg + 氦。
     *
     * 核原料按前提无限供应；本地路线只作为能力备份，不交付规格窗口；
     * 数量不构成约束。
     * 用量依据：Li-6 + n → T + He-4，6 g Li-6 理论上出 3 g 氚（0.5 kg/kg）；
     * 按 50 % 提取取 4 kg Li-6/kg 氚；氦按 4/3 kg/kg 氚联产。
     * 包层辐照由聚变装置执行；它没有 holds，中子通量与温度条件未建模，
     * 这一段不写 under。提取在真空塔 40–160 °C 脱氚，纯化用 GM 冷头 18–25 K
     * 冷凝；两段都是借用现有设备，处理量未建模。
     */
    id: 'make/tritium',
    name: '氚制造',
    produces: [
      { item: 'mat/tritium', qty: q(1) },
      { item: 'mat/helium', qty: q(4, 3) },
    ],
    uses: [{ anyOf: [{ item: 'mat/lithium-6-enriched', qty: q(4) }] }],
    needs: [],
    steps: [
      {
        note_zh: '包层辐照：Li-6 俘获中子生成氚；聚变装置不提供 holds，条件未建模',
        performedBy: 'plant/fusion-reactor',
      },
      {
        note_zh: '提取：真空塔 40–160 °C 从包层载气中脱氚',
        performedBy: 'plant/vacuum-column',
        under: [{ param: 'temperature', min: 40, max: 160 }],
      },
      {
        note_zh: '纯化：GM 冷头 18–25 K 冷凝除 He-3 与杂质，处理量未建模',
        performedBy: 'plant/gm-cryocooler',
        under: [{ param: 'temperature', min: 18, max: 25 }],
      },
    ],
    unbalanced_zh: 'Li-6 4 kg → 氚 1 kg + 氦 4/3 kg；差是中子输入与提取损失，按配比不守恒',
  },
];

export const DATA_ITEMS: readonly Item[] = [...FUEL_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...FUEL_ROUTES];
