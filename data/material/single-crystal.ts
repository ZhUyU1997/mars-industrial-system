/**
 * 单晶硅 —— 第 5 门：石英坩埚与直拉。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 上一版把这一门判成"过不去"，两处理由
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   石英坩埚   要 99.99% 的石英砂，本层只有 90%
 *   提拉机构   要"几小时匀速、无振动"，而模型没有时间维
 *
 * 两处都值得再想一遍：
 *
 *   ① **90% 到 99.9% 是提纯，不是合成。** 石英砂里的杂质主要是铁（含铁矿物包裹体），
 *      磁选能去掉大部分，剩下的用酸洗（盐酸溶铁、氢氟酸溶长石）——**两样酸都有**。
 *      而坩埚只用一次，纯度要求比"电子级"松 —— 99.9% 够拉太阳能级单晶。
 *   ② **"没有时间维"不等于"做不出机构"。** 提拉要的是慢与稳：蜗轮减速 + 丝杠，
 *      每转 0.1 mm，电机一分钟一转就是 0.1 mm/min —— 这个量级本层做得到。
 *      模型说不出"十小时"，但机构是机构。
 *
 * 结论：第 5 门**能过，但要降级** —— 拉出来的是太阳能级单晶（少子寿命短、位错多），
 * 拉一根要十几小时。
 *
 * **直径那条降级已经撤销**：早先写"直径靠人看火色手调，棒是锥形波动的"；
 * 后来补了光电测径头（弯月面环 → 振镜扫描 → 光电池 → 温控器调拉速），
 * 直径进了闭环。**"没有仪表"不是这条链的性格，是那时候还没有仪表。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 坩埚为什么是一次性的
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 熔融石英在 1450 °C 会被硅还原（SiO₂ + Si → 2SiO↑），坩埚内壁几百微米变成
 * 方石英并析氧 —— 所以一只坩埚只拉一根棒，拉完就废。这是半导体链里最贵的一次性件，
 * 而它在本层是**电弧炉熔出来的**（2000 °C 熔石英，离心成形）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 籽晶：这次真的是手艺
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 引晶要一根取向正确的籽晶。第一根从哪来？工业上是切出来的。
 * 本层的退路（写在注释、不建路线）：用多晶硅棒试拉，反复几次总能拉出一点单晶，
 * 挑出最像的那段当籽晶 —— **这是"手艺当入口"，与第一台绕线机由机器人手工绕同型。**
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const SINGLE_CRYSTAL_ITEMS: readonly Item[] = [
  /**
   * 高纯石英砂（99.9%）。磁选去铁、酸洗去长石与碳酸盐、水洗烘干。
   *
   * 与 `mat/silica`（90%，选出来的）是两种东西：那个是耐火料与玻璃的原料，
   * 这个是坩埚的原料。差别不在矿，在**洗了几遍**。
   */
  { id: 'mat/quartz-pure', name: 'High-Purity Quartz Sand', name_zh: '高纯石英砂', unit: 'kg', category: 'material',
    props: [{ param: 'sio2', kind: 'range', min: 95, max: 99.99, unit: '%' }] },

  /**
   * 单晶硅棒（太阳能级）。直拉出来的圆柱，φ100 级，两端是锥。
   *
   * 它比多晶硅贵得多，不是因为更纯（一样是 99.9999%），是因为**原子排得整齐** ——
   * 晶界是复合中心，多晶硅做不了器件。
   */
  { id: 'mat/silicon-single', name: 'Single-Crystal Silicon Ingot', name_zh: '单晶硅棒', unit: 'kg', category: 'material' },

  /**
   * 石英坩埚，φ500 一档。**消耗件，不是零件**（`category: 'consumable'`）。
   *
   * 熔融石英在 1450 °C 被硅还原（SiO₂ + Si → 2SiO↑），内壁几百微米变成方石英
   * 并析氧 —— 所以它不是被用坏的，是化学上消耗掉的。
   *
   * 按只计：形状随炉子定，本层只有一档炉子，所以只有一档坩埚。
   */
  { id: 'mat/quartz-crucible', name: 'Quartz Crucible', name_zh: '石英坩埚', unit: '只', category: 'consumable' },
];

export const SINGLE_CRYSTAL_ROUTES: readonly Route[] = [
  {
    /**
     * 高纯石英砂：磁选 → 酸洗 → 水洗 → 烘干。
     *
     *   1000 硅石（90%）+ 盐酸 200 + 氢氟酸 30 → 900 高纯砂
     *
     * 盐酸溶铁、氢氟酸溶长石（长石是铝硅酸盐，氢氟酸是唯一能咬动它的）。
     * 剩下的 100 是溶掉的杂质与细粉损失。
     *
     * ⚠️ **这条路的真正卡点是那 30 kg 氢氟酸**：
     * `plant/wet-bench` 已在闭包里、`mat/silica` 已通、`mat/hcl` 已通（电解槽通之后），
     * 唯独 `make/hf` 要 `mat/apatite-concentrate` 与 `plant/acid-plant` —— 两样都在闭包外，
     * 而磷灰石精矿自己又卡在浮选药剂。
     * **"湿法槽通了"不等于"这条酸路通了"** —— 通的是槽，不是酸。
     * 所以需要高纯石英的那几件（直拉炉观察窗、扩散炉石英管）都另写了绕开的路线。
     */
    id: 'make/quartz-pure',
    name: 'High-Purity Quartz Sand Production', name_zh: '高纯石英砂制备',
    produces: [
      { item: 'mat/quartz-pure', qty: q(900), gives: [{ param: 'sio2', kind: 'range', min: 99, max: 99.9, dir: 'atLeast' }] },
      {
        item: 'mat/quartz-purification-waste',
        qty: q(330),
        gives: [
          { param: 'iron', kind: 'range', min: 1, max: 5 },
          { param: 'aluminium', kind: 'range', min: 0.5, max: 2 },
          { param: 'form', kind: 'enum', oneOf: ['sludge'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silica', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(200) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(30) }] },
    ],
    needs: [],
    // 原来写的是 plant/robot —— 那是"机器人端一盆酸"。在火星上那盆酸会自己开。
    performedBy: 'plant/wet-bench',
    under: [
      { param: 'temperature', min: 40, max: 90 },
      { param: 'pressure', min: 100, max: 300 },
    ],
    unbalanced_zh: '硅石 1000（90%）+ 盐酸 200 + 氢氟酸 30 → 高纯砂 900 + 酸洗渣 330（已单列 mat/quartz-purification-waste，可中和/回收铁铝）',
  },
  {
    /**
     * 石英坩埚：高纯砂在旋转模内电弧熔融 → 离心成形 → 退火。
     *
     *   1000 高纯砂 → 3 只坩埚（每只约 300 kg 级？不 —— 见下）
     *
     * ⚠️ 这里不写质量比：一只 φ500 的坩埚壁厚 8–12 mm，石英砂用多少取决于尺寸，
     * 而本层没定尺寸。按 `1 kg → 1 只` 的占位写，只证明拓扑。
     */
    id: 'make/quartz-crucible',
    name: 'Quartz Crucible Manufacturing', name_zh: '石英坩埚制造',
    produces: [{ item: 'mat/quartz-crucible', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/quartz-pure', qty: q(1) }] }],
    needs: [],
    performedBy: 'plant/arc-furnace',
    under: [{ param: 'temperature', min: 1900, max: 2200 }],
  },
  {
    /**
     * 直拉单晶：装料熔化 → 引晶缩颈 → 等径生长 → 收尾取棒。
     *
     *   多晶硅 1000 + 氩 50（保护气，循环用，只补损耗）→ 单晶硅 850
     *   石英坩埚 1 只（一次性）
     *
     * 收得率 85%：切头尾、滚磨外圆、以及坩埚底那一段杂质富集的料（回炉）。
     * 拉一根要十几小时 —— **而模型没有时间，所以这条路线只证明"能拉"，不证明"拉多快"。**
     */
    id: 'make/silicon-single',
    name: 'Czochralski Single-Crystal Production', name_zh: '直拉单晶制备',
    produces: [
      { item: 'mat/silicon-single', qty: q(850) },
      {
        item: 'mat/silicon-crop-end',
        qty: q(150),
        gives: [
          { param: 'silicon', kind: 'range', min: 99, max: 99.9 },
          { param: 'form', kind: 'enum', oneOf: ['solid'] },
        ],
      },
      { item: 'mat/argon', qty: q(50) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/polysilicon', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(50) }] },
      // 坩埚是**按次消耗的件**，不是工具：熔融石英在 1450 °C 被硅还原
      // （SiO₂ + Si → 2SiO↑），一只坩埚只拉一根棒。以前我把它放进 needs ——
      // 那是把"一次性的"记成了"在场的"，于是它一次都不用换。
      { anyOf: [{ item: 'mat/quartz-crucible', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '装料、抽真空、充氩、熔化', performedBy: 'plant/cz-puller', under: [{ param: 'temperature', min: 1420, max: 1480 }] },
      { note_zh: '引晶与缩颈（看火色、手调转速）', performedBy: 'plant/cz-puller', under: [{ param: 'temperature', min: 1420, max: 1480 }] },
      // 等径生长现在是闭环：测径头看弯月面、温控器调拉速与功率。
      // 早先写的"直径靠人看火色手调，棒是锥形波动的"——那句话可以撤了。
      { note_zh: '等径生长（直径闭环：测径头 → 温控器 → 拉速）', performedBy: 'plant/cz-puller', under: [{ param: 'temperature', min: 1410, max: 1450 }] },
      { note_zh: '收尾、停热、取棒', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '多晶硅 1000 + 氩 50 → 单晶棒 850 + 切头/滚磨屑 150（已单列 mat/silicon-crop-end，可回炉）+ 氩 50 回收',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...SINGLE_CRYSTAL_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...SINGLE_CRYSTAL_ROUTES];
