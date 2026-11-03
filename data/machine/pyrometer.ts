/**
 * 光学高温计 —— 把温度从"看颜色"变成"读刻度"。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么热电偶在这里走不通
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 热电偶的原理是两根不同金属丝焊在一起，温差生几十 µV/°C 的电压。难点不在
 * 原理，在**两大件**：能读微伏的仪表，和一对能扛住高温的丝。
 *
 *   镍铬-镍铝（K 型）    上限 1300 °C    镍、铬、铝本层都有 → 做得出来
 *   铂铑（B 型）         上限 1700 °C    铂与铑是地球上最稀有的金属之一
 *   钨铼（C 型）         上限 2300 °C    铼比铂还稀有
 *
 * 而碳化钨烧结要 **1450 °C** —— 正好卡在 K 型（1300）之上、B 型（1700）之下。
 *
 * **也就是说：本层能做温度计，但做不出能测 1450 °C 的热电偶。**
 * 铂铑那一步不是"贵"：`mat/pt-rh-gauze` 已建（Pt-10Rh / Pt-5Rh 网，
 * Rh 是一次性输入），但 **Pt-Rh 热偶丝（B 型配对丝）**仍未建。
 *
 * （顺带：830–860 °C 的热处理、700–1000 °C 的氢还原，K 型热电偶都够 ——
 * 所以"温度测不准"只卡在 1300 以上的那一段，不是全线。）
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 出路：不用接触，用眼睛
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 光学高温计 1901 年就有了，比热电偶还早普及。原理一句话：
 *
 *   **把一根标准灯丝的亮度，调到与炉膛一样亮 —— 这时灯丝电流就是温度。**
 *
 * 做的是一件事：让人眼判断"两根丝的亮度相等"。人眼对等亮度的分辨力极高，
 * 远比判断绝对亮度可靠 —— 这是它的全部巧妙之处。
 *
 * 它需要的四样，本层全有：
 *
 *   钨丝      做灯丝（钨现在能造了，见 data/material/tungsten.ts）
 *   红玻璃    做单色滤光片（铜红玻璃：玻璃加铜，本层有）
 *   透镜与目镜 玻璃磨的（量块那条线的研磨平板能干这活）
 *   电流表    动铁式 —— **不用磁铁**（永磁那一条还卡着，见 8.4）
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 定标：铜的凝固点 1084.62 °C
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 电流表读出的是"灯丝有多亮"，不是温度。要变成温度，必须有**一个已知温度点**。
 *
 * 国际温标里有一串定义点，而其中一个是**铜的凝固点 1084.62 °C** ——
 * 本层实现得了：纯铜化一炉，插一支 K 型热电偶（够用），看着它凝。
 * 凝固时的温度是不变的（相变潜热），这就是一个绝对参照。
 *
 * 有了 1084.62 这一点，再按普朗克定律往高温外推 —— 灯丝的亮度与温度的
 * 关系是物理定律，不需要第二个定点。
 *
 * 精度：±5–10 °C。够碳化钨烧结（±10）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它顺带解决的与没解决的
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 解决：1450 °C 的烧结温度看得到了。刀片那条路线的 `under` 从 1400–1500
 *      收窄到 1445–1455，并且把高温计写进 `needs`。
 *
 * 没解决：±10 是"看得见温度"，不是"控得住温度"。加热功率的调节精度是另一回事，
 *      而本层没有比例控制（只有双金属片的通断）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PYROMETER_PARTS: readonly Item[] = [
  /** 物镜筒。一片凸透镜，把炉膛的光聚到灯丝平面上。 */
  { id: 'plant/pyrometer/objective', name: '高温计物镜筒', unit: '件', category: 'part' },

  /**
   * 标准灯丝。钨丝，绕成一个小螺旋，摆在物镜的像面上。
   *
   * 它是整台仪器的核心，也是唯一会被"用旧"的东西 —— 钨丝长期点亮会蒸发变细，
   * 电阻升高，同一个读数对应的温度就偏了。所以它要**定期重新定标**，
   * 而这次定标又是拿铜凝固点比。
   */
  { id: 'plant/pyrometer/filament', name: '高温计标准灯丝', unit: '件', category: 'part' },

  /**
   * 红色滤光片。铜红玻璃，只让 650 nm 附近的红光通过。
   *
   * 为什么必须单色：亮度和波长的关系很陡，宽带光下人眼判断会混进色温的干扰。
   * 铜红玻璃是玻璃里掺氧化亚铜（Cu₂O）—— 本层有玻璃、有铜，烧一炉就行。
   */
  { id: 'plant/pyrometer/filter', name: '高温计红色滤光片', unit: '件', category: 'part' },

  /** 目镜与刻度盘。把灯丝与炉膛的像一并送进眼睛，旁边有读电流的刻度。 */
  { id: 'plant/pyrometer/eyepiece', name: '高温计目镜与刻度盘', unit: '件', category: 'part' },

  /**
   * 动铁式电流表。**不用永磁铁。**
   *
   * 动圈式仪表要一块永磁铁。后来本层有了（磁铁矿烧结充磁，0.2 T 级），
   * 但那时这一件已经按动铁式写定了 —— 而两条路都成立，说清取舍：
   *
   *   动圈   要永磁 0.2 T，灵敏度高、刻度均匀，**但磁体要做**
   *   动铁   不要磁铁，线圈通电自己产生磁场，**但刻度不均匀、精度 ±2%**
   *
   * 这里选动铁：这一台只用来读负载电流，要的是重复性不是精度，
   * 而"少一件没把握的零件"比"读数准 1%"值。
   *
   * 精度比动圈差（±2%），但读数够了 —— 这里要的是重复性，不是绝对准确。
   */
  { id: 'plant/pyrometer/ammeter', name: '高温计动铁式电流表', unit: '件', category: 'part' },
];

export const PYROMETER_ROUTES: readonly Route[] = [
  {
    /** 物镜筒。钢管车成，镜片座与灯丝座同轴到 0.05 mm。 */
    id: 'make/pyrometer-objective',
    name: '高温计物镜筒制造',
    produces: [{ item: 'plant/pyrometer/objective', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
    ],
    needs: ['plant/grinder'],
    performedBy: 'lathe',
  },
  {
    /**
     * 灯丝。钨粉压制烧结成丝 → 旋锻 → 拉丝 → 绕成螺线。
     *
     * ⚠️ 钨丝是本层最难的一根线：钨的加工温度要 1200–1600（脆），拉丝要热拉，
     * 而且没有金刚石模具，只能用小孔硬钢板拉 —— 损耗大、直径不均。
     * 直径不均的灯丝，亮度分布不匀，人眼判断"等亮"时就会偏。
     */
    id: 'make/pyrometer-filament',
    name: '高温计标准灯丝制造',
    produces: [{ item: 'plant/pyrometer/filament', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/tungsten-powder', qty: q(1) }] }],
    needs: ['plant/forge', 'plant/grinder'],
    performedBy: 'plant/atmosphere-furnace',
    under: [
      { param: 'temperature', min: 1200, max: 1600 },
      { param: 'oxygen_ppm', min: 0, max: 50 },
    ],
  },
  {
    /** 滤光片。玻璃配料加氧化亚铜 → 熔制 → 磨成薄片 → 抛光两面平行。 */
    id: 'make/pyrometer-filter',
    name: '高温计红色滤光片制造',
    produces: [{ item: 'plant/pyrometer/filter', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(1) }] },
    ],
    needs: ['plant/comparator/lapping-plate'],
    performedBy: 'plant/kiln',
    under: [{ param: 'temperature', min: 1400, max: 1500 }],
  },
  {
    /** 目镜。两片透镜 + 刻度盘（玻璃刻线，与比较仪刻度尺同一工艺）。 */
    id: 'make/pyrometer-eyepiece',
    name: '高温计目镜与刻度盘制造',
    produces: [{ item: 'plant/pyrometer/eyepiece', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
    ],
    needs: ['plant/comparator/lapping-plate'],
    performedBy: 'lathe',
  },
  {
    /** 动铁式电流表。线圈绕制 + 软铁片 + 游丝 + 指针，全程不用磁铁。 */
    id: 'make/pyrometer-ammeter',
    name: '高温计动铁式电流表制造',
    produces: [{ item: 'plant/pyrometer/ammeter', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/comparator'],
    performedBy: 'plant/winder',
  },
];

/**
 * 光学高温计。读数 1445–1455 °C，±5–10。
 *
 * 它不是"更准的温度计"，是**唯一能到 1450 的那种温度计**。热电偶到 1300 就没了，
 * 而 Pt-Rh 热偶丝（B 型配对丝）仍未建（Pt-Rh 网已建，热偶丝是另一档规格）。
 *
 * 所以它的 `holds` 写 1000–2000：下限是灯丝能分辨的下限（暗红），
 * 上限是灯丝自己的熔点（3422）与物镜的耐温 —— 实际按 2000 封顶。
 */
export const PYROMETER: Item = {
  id: 'plant/pyrometer',
  name: '高温计',
  unit: '台',
  category: 'machine',
  holds: [{ param: 'temperature', min: 1000, max: 2000 }],
  composedOf: PYROMETER_PARTS.map((p) => ({ item: p.id, qty: q(1) })),
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PYROMETER_PARTS, PYROMETER];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/pyrometer',
    name: '高温计装配',
    produces: [{
      item: 'plant/pyrometer',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...PYROMETER_ROUTES, ...ASSEMBLY_ROUTES];
