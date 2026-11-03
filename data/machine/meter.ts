/**
 * 仪表 —— 让"电"变成"可读的数"。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 这一节解的是那个死结
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 那一节的结论是：热电偶做得出来，**读不出来** —— 毫伏级信号要毫伏表（半导体）
 * 或动圈检流计（要永磁体），而永磁体当时是缺口。
 *
 * 现在磁体有了（`std/permanent-magnet-general`，磁铁矿基，0.2 T 级）。
 * 0.2 T 做不了强磁装备，做**仪表磁路**绰绰有余 —— 检流计要的就是"小而稳"的磁场，
 * 不是"大而强"的。
 *
 * 于是链条接上了：
 *
 *   磁铁矿 → 磁体 → 检流计 → 读热电偶 → 知道温度
 *   （而充磁用的直流，来自旋转变流机 —— 电生磁，磁生读数）
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 两件仪表
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   热电偶     两根不同的金属丝焊一端。铜-康铜（T 型）只要铜与镍
 *   检流计     动圈 + 磁路 + 游丝 + 指针。线圈通电就偏转，偏转量就是电流
 *
 * 两件都不含半导体，也不含精密光学。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 标定：定点法，不需要更高一级的温度标准
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 冰点 0 °C、锡 232、锌 419.5、铝 660、银 961.8 —— 都是**物理常数**，
 * 不是别人给的标准器。把热电偶与检流计一起放进去，记下每个定点的偏转：
 *
 *   偏转 ↔ 温度   一条曲线，画在坐标纸上，贴在仪表背面
 *
 * 这与量块"锚在钠 D 线的波长上"是同一招：**常数在书本里，不占运载质量。**
 * 差别在精度 —— 热电偶与检流计合起来大约 ±5 °C，而光学高温计是 ±20 °C 级
 * （靠人看火色）。所以它不是"更准"，是"**不用人看、能连续读、能装进控制回路**"。
 *
 * ⚠️ 一处表示不出来：检流计的分度要"打点"，刻度盘上的等分靠手工划线 +
 * 逐点校验，本层有刻线工艺（比较仪的刻度尺）但没有"分度机"。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const METER_ITEMS: readonly Item[] = [
  /**
   * 热电偶（T 型：铜-康铜）。两根丝焊一个头，外面套 PTFE 管。
   *
   * 它把温度变成毫伏 —— 而毫伏要有人读，所以它和检流计是一对，
   * 单卖没有意义（模型里也成对使用）。
   *
   * ⚠️ 本描述里它只被电阻炉用到，`std_single_use` 会提示一次。不是规格问题：
   * T 型是标准件（量程 0–350 °C，工业上一模一样的一只），只是这个描述里
   * 目前只有一处需要"能连续读的低温柔温度"。
   */
  { id: 'std/thermocouple-t-general', name: 'Thermocouple', name_zh: '热电偶', unit: '件', category: 'part',
    props: [{ param: 'rangeMin', kind: 'range', min: -200, max: 0, unit: '°C' }, { param: 'rangeMax', kind: 'range', min: 350, max: 400, unit: '°C' }] },

  /**
   * 高温热电偶（NiCr-NiAl，非标准 K 型）。量程 −200…1372 °C，短时到 1372，
   * 长期不超过 1260；氧化铝保护管与氧化铝珠绝缘，1300 °C 段不能用 PTFE。
   *
   * 它不是标准 K 型：正极是本层的镍铬电阻丝（80/20，碳 ~1.8%），不是标准
   * K 的 90/10 低碳丝；负极是本层熔的 NiAl（Ni 95 / Al 2 / Mn 2 / Si 1）。
   * 成分对、杂质不对，塞贝克系数比标准 K 低，分度曲线逐支不同 —— 所以
   * `measure/thermocouple-cal` 必须逐支在 Zn/Al/Cu 三点上标定，不能按标准
   * K 的分度表互换。这是 R8 降级：升级路线是低碳酸性铬源 + 90/10 丝。
   */
  { id: 'std/thermocouple-nicr-nial-general', name: 'High-Temperature Thermocouple', name_zh: '高温热电偶', unit: '件', category: 'part',
    props: [
      { param: 'rangeMin', kind: 'range', min: -200, max: 0, unit: '°C' },
      { param: 'rangeMax', kind: 'range', min: 1300, max: 1372, unit: '°C' },
    ] },

  /**
   * 动圈检流计。磁路 + 动圈 + 游丝 + 指针 + 刻度。
   *
   * 它是这一层唯一**不靠半导体把电变成数**的东西。量程不大（微安到毫安），
   * 但热电偶、桥式测量、绝缘测试要的都是小电流 —— 够了。
   *
   * 它现在是毫伏表的零件之一（见下）—— 一只裸检流计读不了热电偶的微伏，
   * 前面得加一级放大。
   */
  { id: 'std/galvanometer-general', name: 'Moving-Coil Galvanometer', name_zh: '动圈检流计', unit: '件', category: 'part',
    props: [{ param: 'sensitivity', kind: 'range', min: 0.01, max: 100, unit: 'µA/格' }] },

  /**
   * 可动磁体式毫伏表，本层基线设计。
   *
   * 条目名沿用旧称，但实际路线不是动圈式：固定线圈、钙铁氧体磁体动、
   * 双线悬丝代替游丝。整机由表壳、底座、刻度盘、磁体、固定线圈、屏蔽筒、
   * 悬丝、碳旗指针等件装配；零件与零件路线见 `data/machine/mech-millivoltmeter.ts`。
   */
  { id: 'std/millivoltmeter-general', name: 'Moving-Magnet Millivoltmeter', name_zh: '可动磁体式毫伏表', unit: '台', category: 'part',
    composedOf: [
      { item: 'std/millivoltmeter-general/case', qty: q(1) },
      { item: 'std/millivoltmeter-general/base', qty: q(1) },
      { item: 'std/millivoltmeter-general/scale', qty: q(1) },
      { item: 'std/millivoltmeter-general/magnet', qty: q(2) },
      { item: 'std/millivoltmeter-general/magnet-clamp', qty: q(1) },
      { item: 'std/millivoltmeter-general/fixed-coil', qty: q(1) },
      { item: 'std/millivoltmeter-general/coil-skeleton', qty: q(1) },
      { item: 'std/millivoltmeter-general/magnetic-shield', qty: q(1) },
      { item: 'std/millivoltmeter-general/suspension', qty: q(2) },
      { item: 'std/millivoltmeter-general/pointer', qty: q(1) },
      { item: 'std/millivoltmeter-general/counterweight', qty: q(1) },
      { item: 'std/millivoltmeter-general/terminal', qty: q(2) },
      { item: 'std/millivoltmeter-general/zero-adjust-screw', qty: q(1) },
      { item: 'std/millivoltmeter-general/dust-felt', qty: q(1) },
    ] },

  /**
   * 电子式毫伏表。检流计 + 直流放大器（两只合金结晶体管）+ 分压电阻 + 表壳。
   *
   * **这是半导体链第一次回头喂给自己的工具**：晶体管是从这条链上长出来的，
   * 而它装进仪表之后，这台仪表又去测炉温 —— 而炉温是造晶体管用的那个温度。
   *
   * 一只裸检流计的分辨率约 1 µA，配 T 型热电偶（40 µV/°C）只能分到 25 °C；
   * 加一级 20 倍放大之后能分到 1 °C 级。**放大不是为了更准，是为了能分得更细。**
   *
   * 放大级为焊接/装配，属于不可逆加工；零件输入写在路线 uses，不写 composedOf。
   */
  { id: 'std/millivoltmeter-electronic', name: 'Electronic Millivoltmeter', name_zh: '电子式毫伏表', unit: '台', category: 'part' },
];

export const METER_ROUTES: readonly Route[] = [
  {
    /**
     * 热电偶：熔康铜 → 拉丝 → 焊热端 → 穿套管。
     *
     *   康铜     55% 铜 + 45% 镍，熔成锭再拉丝    plant/melting-furnace
     *   拉丝     两样丝都拉到 0.5 mm 级           plant/rolling-mill
     *   焊热端   两根丝对焊成一个珠               plant/robot
     *   穿套管   PTFE 管绝缘，冷端留接线          plant/robot
     */
    id: 'make/thermocouple',
    name: 'Thermocouple Manufacturing', name_zh: '热电偶制造',
    produces: [{ item: 'std/thermocouple-t-general', qty: q(1), gives: [{ param: 'rangeMin', kind: 'range', min: -200, max: -50 }, { param: 'rangeMax', kind: 'range', min: 350, max: 400 }] }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '熔康铜（55 Cu / 45 Ni）', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1200, max: 1300 }] },
      { note_zh: '拉丝', performedBy: 'plant/rolling-mill' },
      { note_zh: '对焊热端', performedBy: 'plant/robot' },
      { note_zh: '穿管与冷端接线', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 检流计：磁路 → 动圈 → 游丝与指针 → 刻度与标定。
     *
     *   磁路       两块磁体 + 软铁极靴，气隙里匀强     plant/robot
     *   动圈       漆包线绕在薄铝框上                plant/winder
     *   游丝与指针 40Cr 拉丝盘成螺旋、粘指针         plant/robot
     *   刻度与标定 玻璃刻线（比较仪那套工艺）+ 定点标定  plant/robot
     *
     * 游丝本该是磷青铜（弹性好、不锈），本层没有磷青铜 —— 用 40Cr 细丝代：
     * 弹性差一档，用久了会疲劳，指针回不到零。**这是它寿命短的原因。**
     */
    id: 'make/galvanometer',
    name: 'Moving-Coil Galvanometer Manufacturing', name_zh: '动圈检流计制造',
    produces: [{ item: 'std/galvanometer-general', qty: q(1), gives: [{ param: 'sensitivity', kind: 'range', min: 1, max: 30 }] }],
    uses: [
      { anyOf: [{ item: 'std/permanent-magnet-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/enamel-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '磁路（磁体 + 软铁极靴，调气隙）', performedBy: 'plant/robot' },
      { note_zh: '动圈（绕线、粘铝框）', performedBy: 'plant/winder' },
      { note_zh: '游丝与指针（盘丝、配重、回零）', performedBy: 'plant/robot' },
      { note_zh: '刻度与定点标定', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },
  {
    /**
     * 毫伏表：放大器装配 → 与检流计联调 → 刻度与定点标定。
     *
     *   检流计 1 只（表头）+ 合金结晶体管 2 只（放大级）+ 镍铬电阻丝（分压与偏置）
     *   + 薄钢板（表壳）+ 铜（接线柱与内配线）
     *
     * 两级放大用两只晶体管：一只放大、一只做恒流负载（差分的前身）。
     * 分压电阻用镍铬丝绕 —— 温度系数低，才不会被表内温升带偏。
     *
     * 标定仍在恒温间里做：定点法（冰点、锡、锌）。
     */
    id: 'make/millivoltmeter',
    name: 'Electronic Millivoltmeter Manufacturing', name_zh: '电子式毫伏表制造',
    produces: [{ item: 'std/millivoltmeter-electronic', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/galvanometer-general', qty: q(1) }] },
      // 两只放大管：合金结管（1951）或平面管（1959）。平面管更稳 ——
      // 同一片上彼此相差 <10%，换一只不用重调；合金结管做不到这一点。
      { anyOf: [{ item: 'std/alloy-junction-transistor-general', qty: q(2) }, { item: 'std/planar-transistor-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '放大级装配（两只晶体管 + 分压电阻）', performedBy: 'plant/robot' },
      { note_zh: '与检流计联调（调零、调满度）', performedBy: 'plant/robot' },
      { note_zh: '刻度与定点标定', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },
  {
    /**
     * 高温热电偶：熔 NiAl → 拉丝 → 对焊热端 → 穿氧化铝珠与保护管。
     *
     *   NiAl 负极   Ni 95 / Al 2 / Mn 2 / Si 1，1450–1500 °C 氩保护熔炼
     *   正极        本层镍铬电阻丝（80/20，碳 ~1.8%），不再熔一次
     *   拉丝        两样丝都拉到 φ0.5 mm；NiAl 每 4 道退火一次
     *   热端        两根丝端部熔成珠，珠径 1.5–2 mm
     *   绝缘        氧化铝珠 + φ6 氧化铝保护管；PTFE 在 260 °C 就软，不能用
     *
     * ⚠️ **正极不是标准 K 的 90/10。** `mat/resistance-wire` 是 80/20 高碳
     * 镍铬（碳 ~1.8%，见 `data/material/passive.ts`），杂质与低碳 90/10 差
     * 一个数量级；它的塞贝克系数偏低，且每支的分度曲线不同。所以这条路线
     * 只承诺"能到 1300 °C"，不承诺"标准 K 分度"；分度由
     * `measure/thermocouple-cal` 逐支标定。
     *
     * ⚠️ 1300 是短时上限：K 型长期上限 1260，1300 只用于 RTA 的 30 min
     * 平台；长期 1300 要 S/B 型（Pt-Rh 丝，本层仍未建）。
     *
     * 投料按 1 kg 级记账（与 `make/thermocouple` 同一写法），实际一支只用
     * 几十克；余料回炉，拉丝损耗与切头不计入产物。`rate 8 h` 是按同型
     * 热偶路线取的估算，不是实测节拍。
     */
    id: 'make/thermocouple-nicr-nial-general',
    name: 'High-Temperature Thermocouple Manufacturing', name_zh: '高温热电偶制造',
    produces: [
      {
        item: 'std/thermocouple-nicr-nial-general',
        qty: q(1),
        gives: [
          { param: 'rangeMin', kind: 'range', min: -200, max: -50 },
          { param: 'rangeMax', kind: 'range', min: 1300, max: 1372 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/manganese', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/silicon-single', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['std/wire-die-general', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh: '熔 NiAl 负极（Ni 95 / Al 2 / Mn 2 / Si 1）：1450–1500 °C、氩保护，铸锭后锻开',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1450, max: 1500 }],
      },
      { note_zh: '拉丝：NiCr 正极与 NiAl 负极各拉到 φ0.5 mm；NiAl 每 4 道退火一次', performedBy: 'plant/rolling-mill' },
      { note_zh: '对焊热端：两根丝端部熔成珠，珠径 1.5–2 mm', performedBy: 'plant/robot' },
      { note_zh: '穿氧化铝珠与 φ6 氧化铝保护管；冷端留接线，标正负极', performedBy: 'plant/robot' },
    ],
    unbalanced_zh:
      '镍铬丝 1 + 镍 1 + 铝 0.02 + 锰 0.02 + 硅 0.01 + 氧化铝 0.1 + 氩 1 + 水 1 → 高温偶 1 件；余料回炉，拉丝损耗与切头不计',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...METER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...METER_ROUTES];
