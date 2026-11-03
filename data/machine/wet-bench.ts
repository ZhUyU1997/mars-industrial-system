/**
 * 湿法槽 —— 所有"在液相处做"的工序落脚的地方。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它补的是一整类设备
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 把"环境压力"做成了可查的条件之后，暴露出一个更大的缺口：
 * **水系工艺远不止那六条** —— 酸洗、结晶、pH 调节、盐水电解，全都要在液相处做，
 * 而 610 Pa 正好是水的三相点：敞开运行，水在 0.01 °C 就沸腾。
 *
 * 那些工序原来写在 `plant/robot` 或 `plant/acid-plant` 名下 —— 机器人端一盆酸，
 * 这话在火星上是错的：那一盆酸会自己开。
 *
 * 所以这一类需要一个真正的设备条目：**带盖、带搅拌、带加热夹套的耐酸槽**。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 三件事决定它长什么样
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   密封   必须气密 —— 否则槽里的水在 0.01 °C 就开始蒸发，酸雾跟着走
 *   衬里   必须耐酸 —— 盐酸、氢氟酸、硫酸混在一起，只有 PTFE 顶得住
 *   搅拌   浸出与酸洗都要传质 —— 不搅就是一层溶解完就停
 *
 * 加热夹套是可选的：有些工序室温就行，有些要 60–90 加速。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 一处降级：没有真正的"液封"与"呼吸器"
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 工业湿法槽有呼吸器、液位计、防喷溅挡板。本层只有"盖紧了、压力表、手动放气" ——
 * 每一次开盖都要先泄压、再憋气操作。**这类设备的危险不写在模型里，但它是真的。**
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const WET_BENCH_PARTS: readonly Item[] = [
  /** 槽体与衬里。钢板外壳 + PTFE 衬里（3 mm），接管与放料阀从衬里里穿出。 */
  { id: 'plant/wet-bench/vessel', name: 'Wet Bench Tank and Liner', name_zh: '湿法台槽体与衬里', unit: '件', category: 'part' },

  /** 搅拌与密封盖。法兰盖 + PTFE 垫 + 搅拌轴密封 + 电机座。 */
  { id: 'plant/wet-bench/agitator', name: 'Wet Bench Agitation and Sealing Lid', name_zh: '湿法台搅拌与密封盖', unit: '件', category: 'part' },

  /** 加热夹套。槽体外焊一层夹套，通蒸汽或热油 —— 60–90 °C 的加速段靠它。 */
  { id: 'plant/wet-bench/jacket', name: 'Wet Bench Heating Jacket', name_zh: '湿法台加热夹套', unit: '件', category: 'part' },
];

export const WET_BENCH_ROUTES: readonly Route[] = [
  {
    /** 槽体与衬里。钢板卷焊成槽 → 内壁 PTFE 衬里（板材搭接焊）→ 接管与阀门。 */
    id: 'make/wetbench-vessel',
    name: 'Wet Bench Tank and Liner Manufacturing', name_zh: '湿法台槽体与衬里制造',
    produces: [{ item: 'plant/wet-bench/vessel', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 搅拌与密封盖。法兰盖车配 → 机械密封（PTFE 唇封）→ 搅拌桨与电机座。 */
    id: 'make/wetbench-agitator',
    name: 'Wet Bench Agitation and Sealing Lid Manufacturing', name_zh: '湿法台搅拌与密封盖制造',
    produces: [{ item: 'plant/wet-bench/agitator', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
    ],
    needs: ['plant/grinder'],
    performedBy: 'lathe',
  },
  {
    /** 加热夹套。槽体外加一层夹套壳，接管进蒸汽或热油。 */
    id: 'make/wetbench-jacket',
    name: 'Wet Bench Heating Jacket Manufacturing', name_zh: '湿法台加热夹套制造',
    produces: [{ item: 'plant/wet-bench/jacket', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
];

/**
 * 湿法槽。20–120 °C，100–500 kPa，PTFE 衬里、机械密封、搅拌。
 *
 * 它替换掉的是"机器人端一盆酸"那种写法 —— 不是隐喻，是原来真的那么写着。
 */
export const WET_BENCH: Item = {
  id: 'plant/wet-bench',
  name: 'Wet Bench', name_zh: '湿法台',
  unit: '台',
  category: 'machine',
  holds: [
    { param: 'temperature', min: 20, max: 120 },
    // 液相处的工序都要它 —— 火星 0.6 kPa 下水在 0.01 °C 就开了。
    { param: 'pressure', min: 100, max: 500 },
  ],
  // 与 holds 同一档：给 `measure/wet-bench-environment` 的校准边一个可判窗口。
  props: [
    { param: 'temperature', kind: 'range', min: 20, max: 120, unit: '°C' },
    { param: 'pressure', kind: 'range', min: 100, max: 500, unit: 'kPa' },
  ],
  composedOf: [
    ...WET_BENCH_PARTS.map((p) => ({ item: p.id, qty: q(1) })),
    { item: 'std/motor-7.5kw-4p', qty: q(1) },
    { item: 'std/contactor-general', qty: q(1) },
  ],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...WET_BENCH_PARTS, WET_BENCH];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/wet-bench',
    name: 'Wet Bench Assembly', name_zh: '湿法台装配',
    produces: [{
      item: 'plant/wet-bench',
      qty: q(1),
      gives: [
        { param: 'temperature', kind: 'range', min: 20, max: 120, record: 'mat/wet-bench-environment-record' },
        { param: 'pressure', kind: 'range', min: 100, max: 500, record: 'mat/wet-bench-environment-record' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...WET_BENCH_ROUTES, ...ASSEMBLY_ROUTES];
