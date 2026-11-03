/**
 * 轴承 —— 第一个"必须分档"的标准件。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么电机只要一种，轴承要一族
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 电机：功率不匹配可以**换传动** —— 变频调速、减速比、多台并联。所以全厂
 * 只造 7.5 kW 一种，是真实的工程做法（少品种、备件统一）。
 *
 * 轴承：内径 25 mm 的圈装不到 100 mm 的轴颈上，**凑不了**。所以轴承必须是一族，
 * 不是一只。
 *
 * 但"一族"不等于"按机器各来一个" —— 那是专用件。标准件的族谱有**两个轴**：
 *
 *   载荷类型   球 / 圆锥滚子 / 圆柱滚子 / 交叉滚子
 *   精度等级   P0（通用）/ P5（精密）
 *
 *   std/bearing-general-p0          深沟球，P0        电机、泵、风机、减速器滚轮
 *   std/bearing-spindle-p5          角接触球，P5      车床 / 铣床 / 磨床主轴
 *   std/bearing-taper-roller-p0     圆锥滚子，P0      轧机工作辊（径向 + 轴向一起扛）
 *   std/bearing-cylinder-roller-p0  圆柱滚子，P0      支承辊、重载风机（只扛径向）
 *   std/bearing-crossed-roller-p5   交叉滚子，P5      机器人关节输出（四向 + 倾覆力矩）
 *
 * ⚠️ 上一版只有前两个，理由是"本层真正要区分的是精度，不是尺寸"。
 * 那句话对**尺寸**成立（本层不建模轴颈），对**载荷类型**不成立：
 * 球是点接触，滚子是线接触，同样尺寸下承载差两三倍，还决定能不能承轴向。
 * 轧机辊颈用球轴承不是"差一点"，是压扁。
 *
 * 尺寸段仍不在模型里：型号里的数字是**选定的代表值**，不是算出来的 ——
 * 与 7.5 kW 电机同理。真要按轴颈选型，得先有长度量纲。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 轴承钢：本层做得出低端的，做不出高端的
 * ═══════════════════════════════════════════════════════════════════════
 *
 * GCr15（100Cr6）：碳 1%、铬 1.5%。铁加碳加高碳铬铁就配得出来，熔炼炉够用。
 *
 * **但轴承钢的难点不在成分，在纯净度。** 氧含量要压到 10 ppm 以下 ——
 * 氧化物夹杂是轴承疲劳剥落的起点，一颗 20 µm 的夹杂就能让寿命掉一个数量级。
 * 工业上靠真空脱气或电渣重熔，本层两样都没有。
 *
 * 所以这里做出来的是**低端轴承**：成分对、硬度对、寿命短一截。第四次降级使用
 * （碳电极、丁醇、45% 硅铁、单一规格电机之后）。
 *
 * **这一条降级被退掉了一部分**：电渣重熔（`make/bearing-steel-esr`）
 * 不用真空，只用电把钢重化一遍、穿过一层渣 —— 氧含量从 40–80 ppm 降到 15–25 ppm，
 * 夹杂小一个量级。**离 10 ppm 还有距离，但"低端"这个词不再准确。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 热处理不再借炉子
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 套圈要淬火：830–860 °C 奥氏体化，油淬，160 °C 回火。
 *
 * 上一版这里写的是"全表没有一台热处理炉，只能借还原炉（650–900）的温度窗口"。
 * **现在有了**：`plant/resistance-furnace`（100–1100 °C，镍铬丝发热）就是为这件事
 * 造的 —— 淬火与回火都归它，不再占用还原铁矿的炉子。
 *
 * 借壳借来的是窗口，而窗口是别人的排产；电阻炉把加热变成开关。
 */

import type { Item, Qty, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

/**
 * 轴承子件 —— 把“套圈、滚动体、保持架”从整件路线里拆出来。
 *
 * 投料账不变：旧路线是 1 kg 轴承钢 + 1 kg 薄板/不锈钢做一套；
 * 现在拆成内圈 0.35 kg、外圈 0.45 kg、滚动体 0.2 kg，保持架仍 1 kg。
 * 总装路线只吃 composedOf，不再吃材料。
 *
 * 五族的差别不只在滚子形状，也在磨削与配作；这些差别落在子件路线上：
 *
 *   通用   深沟球；套圈与钢球磨到 P0。氧含量压不到 10 ppm（没有真空脱气），
 *          寿命比工业件短一截。
 *   主轴   角接触球；P5 与 P0 的差别不在材料，在套圈圆度、滚道粗糙度、
 *          钢球球度 —— 每样多磨几道、多检几遍。模型说不出“严多少”。
 *   圆锥   滚子锥面要与滚道同角度，角度差一分，接触就从线变成点；
 *          内外圈可分离，轴向游隙靠成对配作，单只能转、一对才有定位能力。
 *          锥面用改装磨头（砂轮轴斜置）磨，不是专用滚子磨床。
 *   圆柱   滚子贯穿磨，外圆又圆又直；直母线滚子边缘应力集中，寿命掉一个
 *          数量级。对数曲线（两端收细几十微米）要成形砂轮与靠模，本层没有。
 *   交叉   两半套圈的 V 形滚道要互相配作：滚道角 90°，两半 V 尖落在同一
 *          圆上，否则一正一反的接触角不对称、倾覆刚度歪。本层做到 P5，
 *          但按滚子直径分组选配做不细 —— 只有一套量具。
 */
type BearingFamily = {
  readonly id: string;
  readonly rolling: 'ball' | 'roller';
  readonly rollingQty: number;
  readonly rollingNote: string;
  readonly cageMaterial: string;
  readonly cageNote: string;
};

const BEARING_FAMILIES: readonly BearingFamily[] = [
  {
    id: 'std/bearing-general-p0',
    rolling: 'ball',
    rollingQty: 8,
    rollingNote: '冷镦钢球，磨球',
    cageMaterial: 'mat/sheet-steel',
    cageNote: '冲压保持架',
  },
  {
    id: 'std/bearing-spindle-p5',
    rolling: 'ball',
    rollingQty: 10,
    rollingNote: '冷镦钢球，磨球',
    cageMaterial: 'mat/stainless-steel',
    cageNote: '不锈钢保持架',
  },
  {
    id: 'std/bearing-taper-roller-p0',
    rolling: 'roller',
    rollingQty: 12,
    rollingNote: '锻锥滚子毛坯，磨锥面',
    cageMaterial: 'mat/sheet-steel',
    cageNote: '冲压保持架',
  },
  {
    id: 'std/bearing-cylinder-roller-p0',
    rolling: 'roller',
    rollingQty: 10,
    rollingNote: '锻圆柱滚子毛坯，贯穿磨',
    cageMaterial: 'mat/sheet-steel',
    cageNote: '冲压保持架',
  },
  {
    id: 'std/bearing-crossed-roller-p5',
    rolling: 'roller',
    rollingQty: 16,
    rollingNote: '锻交叉滚子毛坯，磨 V 形面',
    cageMaterial: 'mat/stainless-steel',
    cageNote: '保持架与隔离块',
  },
];

const BEARING_FAMILY_NAMES: Record<string, string> = {
  'std/bearing-general-p0': 'P0 深沟球轴承',
  'std/bearing-spindle-p5': 'P5 角接触主轴轴承',
  'std/bearing-taper-roller-p0': 'P0 圆锥滚子轴承',
  'std/bearing-cylinder-roller-p0': 'P0 圆柱滚子轴承',
  'std/bearing-crossed-roller-p5': 'P5 交叉滚子轴承',
};

const BEARING_FAMILY_NAMES_EN: Record<string, string> = {
  'std/bearing-general-p0': 'P0 Deep Groove Ball Bearing',
  'std/bearing-spindle-p5': 'P5 Angular Contact Spindle Bearing',
  'std/bearing-taper-roller-p0': 'P0 Tapered Roller Bearing',
  'std/bearing-cylinder-roller-p0': 'P0 Cylindrical Roller Bearing',
  'std/bearing-crossed-roller-p5': 'P5 Crossed Roller Bearing',
};

const BEARING_SUBPART_NAMES: Record<string, string> = {
  'inner-ring': '内圈',
  'outer-ring': '外圈',
  'rolling-element': '滚动体',
  cage: '保持架',
};

const BEARING_SUBPART_NAMES_EN: Record<string, string> = {
  'inner-ring': 'Inner Ring',
  'outer-ring': 'Outer Ring',
  'rolling-element': 'Rolling Element',
  cage: 'Cage',
};

const bearingPart = (id: string): Item => {
  const at = id.lastIndexOf('/');
  const family = id.slice(0, at);
  const leaf = id.slice(at + 1);
  return {
    id,
    name: `${BEARING_FAMILY_NAMES_EN[family] ?? ''} ${BEARING_SUBPART_NAMES_EN[leaf] ?? leaf}`,
    name_zh: (BEARING_FAMILY_NAMES[family] ?? '') + (BEARING_SUBPART_NAMES[leaf] ?? leaf),
    unit: '件',
    category: 'part',
  };
};

const bearingBom = (id: string, rollingQty: number) => [
  { item: `${id}/inner-ring`, qty: q(1) },
  { item: `${id}/outer-ring`, qty: q(1) },
  { item: `${id}/rolling-element`, qty: q(rollingQty) },
  { item: `${id}/cage`, qty: q(1) },
];

/**
 * 每族四件：内圈、外圈、滚动体、保持架。
 * 规格由父件继承（std_single_use 对子件不再提示）。
 */
const BEARING_SUBPART_ITEMS: readonly Item[] = BEARING_FAMILIES.flatMap((f) => [
  bearingPart(`${f.id}/inner-ring`),
  bearingPart(`${f.id}/outer-ring`),
  bearingPart(`${f.id}/rolling-element`),
  bearingPart(`${f.id}/cage`),
]);

const ringRoute = (
  familyId: string,
  leaf: 'inner-ring' | 'outer-ring',
  steel: Qty,
): Route => ({
  id: `make/${familyId.slice('std/'.length)}-${leaf}`,
  name: `${BEARING_FAMILY_NAMES_EN[familyId] ?? ''} ${BEARING_SUBPART_NAMES_EN[leaf] ?? leaf} Manufacturing`,
  name_zh: `${BEARING_FAMILY_NAMES[familyId] ?? ''}${BEARING_SUBPART_NAMES[leaf] ?? leaf}制造`,
  produces: [{ item: `${familyId}/${leaf}`, qty: q(1) }],
  uses: [{ anyOf: [{ item: 'mat/bearing-steel', qty: steel }] }],
  needs: [],
  steps: [
    { note_zh: '锻套圈毛坯', performedBy: 'plant/forge' },
    { note_zh: '车套圈', performedBy: 'lathe' },
    {
      note_zh: '淬火回火',
      performedBy: 'plant/resistance-furnace',
      under: [{ param: 'temperature', min: 830, max: 860 }],
    },
    { note_zh: '磨滚道', performedBy: 'plant/grinder' },
  ],
});

const rollingRoute = (f: BearingFamily): Route => ({
  id: `make/${f.id.slice('std/'.length)}-rolling-element`,
  name: `${BEARING_FAMILY_NAMES_EN[f.id] ?? ''} Rolling Element Manufacturing`,
  name_zh: `${BEARING_FAMILY_NAMES[f.id] ?? ''}滚动体制造`,
  produces: [{ item: `${f.id}/rolling-element`, qty: q(f.rollingQty) }],
  uses: [{ anyOf: [{ item: 'mat/bearing-steel', qty: q(1, 5) }] }],
  needs: [],
  steps: [
    { note_zh: f.rollingNote, performedBy: 'plant/forge' },
    ...(f.rolling === 'roller'
      ? [{ note_zh: '车滚子', performedBy: 'lathe' }]
      : []),
    {
      note_zh: '淬火回火',
      performedBy: 'plant/resistance-furnace',
      under: [{ param: 'temperature', min: 830, max: 860 }],
    },
    { note_zh: '磨滚动面', performedBy: 'plant/grinder' },
  ],
});

const cageRoute = (f: BearingFamily): Route => ({
  id: `make/${f.id.slice('std/'.length)}-cage`,
  name: `${BEARING_FAMILY_NAMES_EN[f.id] ?? ''} Cage Manufacturing`,
  name_zh: `${BEARING_FAMILY_NAMES[f.id] ?? ''}保持架制造`,
  produces: [{ item: `${f.id}/cage`, qty: q(1) }],
  uses: [{ anyOf: [{ item: f.cageMaterial, qty: q(1) }] }],
  needs: [],
  steps: [
    { note_zh: f.cageNote, performedBy: 'plant/sheet-shop' },
    { note_zh: '去毛刺', performedBy: 'plant/grinder' },
  ],
});

/**
 * 子件路线：每族四条。
 *   内/外圈  锻 → 车 → 淬火回火（830–860 °C）→ 磨滚道
 *   滚动体   锻/冷镦 → 车（滚子）→ 淬火回火 → 磨滚动面
 *   保持架   冲压/车制 → 去毛刺
 */
const BEARING_SUBPART_ROUTES: readonly Route[] = BEARING_FAMILIES.flatMap((f) => [
  ringRoute(f.id, 'inner-ring', q(7, 20)),
  ringRoute(f.id, 'outer-ring', q(9, 20)),
  rollingRoute(f),
  cageRoute(f),
]);

export const BEARING_ITEMS: readonly Item[] = [
  /**
   * 轴承钢 GCr15。碳 1%、铬 1.5%，其余是铁。
   *
   * 成分好配，纯净度难 —— 见文件头。它同时是刀片、模具钢那一类"高碳高铬"
   * 材料的入口。
   *
   * `hardness` 是**淬火回火之后**的窗口（60–65 HRC），不是交货态：
   * 交货是退火态（约 HB 200），硬度由用它的那条路线热处理出来。
   * 声明它是因为量块与刀片都直接问这个数 —— 见 `make/gauge-block-reference`
   * 那处 `need ≥62`：量块要 62–65，而这条链只能保证 60–65，
   * 所以那一格是 kept，不是 covered。
   */
  {
    id: 'mat/bearing-steel',
    name: 'Bearing Steel GCr15', name_zh: '轴承钢 GCr15',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'hardness', kind: 'range', min: 60, max: 65, unit: 'HRC', dir: 'atLeast' }],
  },

  /**
   * 通用轴承，深沟球，P0 级。
   *
   * 风机、泵、传动轴、电机 —— 凡是"转起来就行"的地方都用它。
   * 它也是全表消耗量最大的一件标准件：一台设备少则两个，多则十几个。
   */
  { id: 'std/bearing-general-p0', name: 'General-Purpose Bearing', name_zh: '通用轴承', unit: '套', category: 'part',
    composedOf: bearingBom('std/bearing-general-p0', 8),
    props: [{ param: 'precision', kind: 'enum', values: ['P0', 'P5', 'P4'] }, { param: 'bore', kind: 'range', min: 3, max: 500, unit: 'mm' }], },

  /**
   * 主轴轴承，角接触球，P5 级。
   *
   * 车床、铣床、磨床的主轴用它：成对背靠背安装，预紧后同时承径向与轴向载荷，
   * 而且**精度是主轴精度的上限** —— 轴承跳 2 µm，主轴就跳 2 µm。
   *
   * P5 与 P0 的差别不在材料，在**加工**：套圈圆度、滚道粗糙度、滚珠的球度，
   * 每一样都要多磨几道、多检几遍。
   */
  { id: 'std/bearing-spindle-p5', name: 'Spindle Bearing', name_zh: '主轴轴承', unit: '套', category: 'part',
    composedOf: bearingBom('std/bearing-spindle-p5', 10),
    props: [{ param: 'precision', kind: 'enum', values: ['P0', 'P5', 'P4'] }, { param: 'bore', kind: 'range', min: 3, max: 500, unit: 'mm' }], },

  /**
   * 圆锥滚子轴承，P0 级。
   *
   * 滚子是圆锥体，滚道也是圆锥面 —— 于是它**同时承径向与轴向**，这是球轴承
   * 做不到的（深沟球只能承一点轴向）。轧机工作辊要它：轧制力以 MN 计，
   * 辊子还要轴向定位。
   *
   * 必须成对用（面对面或背靠背），单只没有轴向定位能力 —— 装的时候要预紧，
   * 而预紧量决定刚度与发热，这一条模型说不出来。
   */
  { id: 'std/bearing-taper-roller-p0', name: 'Tapered Roller Bearing', name_zh: '圆锥滚子轴承', unit: '套', category: 'part',
    composedOf: bearingBom('std/bearing-taper-roller-p0', 12),
    props: [{ param: 'precision', kind: 'enum', values: ['P0', 'P5', 'P4'] }, { param: 'bore', kind: 'range', min: 3, max: 500, unit: 'mm' }], },

  /**
   * 圆柱滚子轴承，P0 级。
   *
   * 只承径向，但同尺寸下承载是同尺寸球轴承的两三倍 —— 滚子与滚道是**线接触**，
   * 球是点接触。轧机支承辊、大流量风机用它。
   *
   * 难点在滚子端部的**修形**：直母线的滚子受力时边缘应力集中，寿命掉一个数量级，
   * 所以真件磨成对数曲线（凸度）。本层只能做直母线 —— 又一次降级，
   * 与轴承钢纯净度那一条同型：**形状对了，寿命短一截。**
   */
  { id: 'std/bearing-cylinder-roller-p0', name: 'Cylindrical Roller Bearing', name_zh: '圆柱滚子轴承', unit: '套', category: 'part',
    composedOf: bearingBom('std/bearing-cylinder-roller-p0', 10),
    props: [{ param: 'precision', kind: 'enum', values: ['P0', 'P5', 'P4'] }, { param: 'bore', kind: 'range', min: 3, max: 500, unit: 'mm' }], },

  /**
   * 交叉滚子轴承，P5 级。
   *
   * 滚子在 V 形滚道里一正一反交叉排列，**一个轴承同时承四个方向的载荷与倾覆力矩**。
   * 机器人关节输出端要的就是这个：一根轴同时要转、要准、要抗弯，而两个普通
   * 轴承叠起来装不出这个刚度。
   *
   * V 形滚道要用成形砂轮磨，两半套圈还要配作 —— 精度等级与主轴轴承同级，
   * 而它是机器人身上除减速器之外第二贵的一件。
   *
   * ⚠️ 本描述里它只被减速器用到，`std_single_use` 会提示一次。那不是规格问题：
   * 交叉滚子的型号由载荷定，不随机器变（关节、回转台、雷达座都用它）；
   * 只是这个描述里目前只有一处用它。
   */
  { id: 'std/bearing-crossed-roller-p5', name: 'Crossed Roller Bearing', name_zh: '交叉滚子轴承', unit: '套', category: 'part',
    composedOf: bearingBom('std/bearing-crossed-roller-p5', 16),
    props: [{ param: 'precision', kind: 'enum', values: ['P0', 'P5', 'P4'] }, { param: 'bore', kind: 'range', min: 3, max: 500, unit: 'mm' }], },

  ...BEARING_SUBPART_ITEMS,
];

export const BEARING_ROUTES: readonly Route[] = [
  {
    /**
     * 轴承钢：铁 965 + 高碳铬铁 25 + 碳 10 → 1000。
     *
     * 铬 15 kg（1.5%）、碳 10 kg（1%），与 GCr15 的成分一致。
     *
     * 熔炼后要锻开、球化退火（得到适合车削的组织）。锻靠锻锤，
     * 球化退火 780–800 归 `plant/resistance-furnace` —— 不必再借窑（1200–1750，
     * 那个温度对球化退火太热，滑过去就成奥氏体化了）。
     */
    id: 'make/bearing-steel',
    name: 'Bearing Steel Production', name_zh: '轴承钢制备',
    produces: [
      {
        item: 'mat/bearing-steel',
        qty: q(1000),
        // 交货是退火态（球化退火，约 HB 200），**硬度不给窗口** —— 硬度是
        // 用它那一条路线淬火回火出来的，材料厂不保证。空窗口不是漏写：
        // "不限"也要写出来，写了才有人知道这一格没人保证。
        gives: [{ param: 'hardness', kind: 'range', min: 60, max: 65 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron', qty: q(965) }] },
      { anyOf: [{ item: 'mat/ferrochrome', qty: q(25) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(10) }] },
    ],
    needs: ['plant/forge'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1500, max: 1650 }],
  },
  {
    /**
     * 通用轴承总装：内圈 + 外圈 + 8 粒钢球 + 冲压保持架。
     *
     * 子件路线见 make/bearing-general-p0-inner-ring / -outer-ring /
     * -rolling-element / -cage。总装只做配对、装球、铆保持架。
     */
    id: 'make/bearing-general',
    name: 'General-Purpose Bearing Final Assembly', name_zh: '通用轴承总装',
    produces: [{ item: 'std/bearing-general-p0', qty: q(1), gives: [{ param: 'precision', kind: 'enum', oneOf: ['P0', 'P5', 'P4'] }, { param: 'bore', kind: 'range', min: 3, max: 500 }] }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 主轴轴承总装：内圈 + 外圈 + 10 粒 P5 钢球 + 不锈钢保持架。
     *
     * 子件路线见 make/bearing-spindle-p5-inner-ring 等；总装后按 P5 配对预紧。
     */
    id: 'make/bearing-spindle',
    name: 'Spindle Bearing Final Assembly', name_zh: '主轴轴承总装',
    produces: [{ item: 'std/bearing-spindle-p5', qty: q(1), gives: [{ param: 'precision', kind: 'enum', oneOf: ['P0', 'P5', 'P4'] }, { param: 'bore', kind: 'range', min: 3, max: 500 }] }],
    uses: [],
    needs: ['std/gauge-block-working'],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 圆锥滚子轴承总装：内圈 + 外圈 + 12 粒锥滚子 + 保持架，成对配作。
     *
     * 子件路线见 make/bearing-taper-roller-p0-inner-ring 等。总装管轴向游隙配对；
     * 滚子锥面与滚道同角度在子件磨削时保证。
     */
    id: 'make/bearing-taper-roller',
    name: 'Tapered Roller Bearing Final Assembly', name_zh: '圆锥滚子轴承总装',
    produces: [{ item: 'std/bearing-taper-roller-p0', qty: q(1), gives: [{ param: 'precision', kind: 'enum', oneOf: ['P0', 'P5', 'P4'] }, { param: 'bore', kind: 'range', min: 3, max: 500 }] }],
    uses: [],
    needs: ['std/gauge-block-working'],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 圆柱滚子轴承总装：内圈 + 外圈 + 10 粒圆柱滚子 + 保持架。
     *
     * 子件路线见 make/bearing-cylinder-roller-p0-inner-ring 等；滚子贯穿磨在
     * 子件路线里完成，总装只装保持架与配对。
     */
    id: 'make/bearing-cylinder-roller',
    name: 'Cylindrical Roller Bearing Final Assembly', name_zh: '圆柱滚子轴承总装',
    produces: [{ item: 'std/bearing-cylinder-roller-p0', qty: q(1), gives: [{ param: 'precision', kind: 'enum', oneOf: ['P0', 'P5', 'P4'] }, { param: 'bore', kind: 'range', min: 3, max: 500 }] }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 交叉滚子轴承总装：两半套圈 + 16 粒滚子 + 保持架/隔离块，V 形滚道配作。
     *
     * 子件路线见 make/bearing-crossed-roller-p5-inner-ring 等；两半套圈的
     * V 形滚道在子件磨削后按比较仪配作，总装交叉装滚子。
     */
    id: 'make/bearing-crossed-roller',
    name: 'Crossed Roller Bearing Final Assembly', name_zh: '交叉滚子轴承总装',
    produces: [{ item: 'std/bearing-crossed-roller-p5', qty: q(1), gives: [{ param: 'precision', kind: 'enum', oneOf: ['P0', 'P5', 'P4'] }, { param: 'bore', kind: 'range', min: 3, max: 500 }] }],
    uses: [],
    needs: ['std/gauge-block-working'],
    performedBy: 'plant/robot',
  },
  ...BEARING_SUBPART_ROUTES,
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...BEARING_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...BEARING_ROUTES];
