/**
 * 工艺设备 —— 熔炼炉与电解槽。
 *
 * ⚠️ **电解槽在火星上必须是压力容器**：610 Pa 正好是水的三相点，水在 0.01 °C 就沸腾。
 * 敞开运行的话电解液会自己烧干。同理：浸出、酸洗、浮选、结晶、pH 调节 ——
 * 所有水系工艺都得在密闭容器里做。
 *
 * ⚠️ **熔炼炉敞开在 CO₂ 里有两笔账看不见**：石墨电极被 CO₂ 气化（Boudouard 在低压下
 * 更彻底），铁水被 CO₂ 氧化（Fe + CO₂ → FeO + CO）。要么渣覆盖，要么密封炉膛。
 *
 * 两台都不是"造出形状"的机床，而是"把料变成另一种料"的设备：
 *
 *   熔炼炉   1200–1650 °C。铸铁 1150–1250 就能浇（薄壁件过热到 1350–1450），
 *            而铁水与钢要到 1550–1650 —— 铁的熔点就是 1538 °C，低于它的
 *            炉子化不开铁。火星上电力由种子聚变装置供给（装置可复制扩容，不是免费），
 *            **炉体**要钱。
 *   电解槽   2H₂O → 2H₂ + O₂。全厂的还原剂与氧都从这里出。它是"耐蚀金属 +
 *            高分子 + 半导体"三件事的合成体：镍电极、PTFE 隔膜、整流器。
 *
 * 零件与路线同样按 `1 kg → 1 件` 写：没有质量，只证拓扑。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

/**
 * 熔炼炉的五个零件。
 *
 * 这一台是感应炉：不用石墨电极（火星没有石油焦做电极），靠线圈通中频电流
 * 在炉料里感应发热。代价是要铜、要耐火材料、要电源。
 */
export const FURNACE_PARTS: readonly Item[] = [
  /** 炉壳。钢板卷成筒再焊，承炉衬、承倾转力矩，不承高温。 */
  {
    id: 'plant/melting-furnace/shell',
    name: 'Melting Furnace Shell', name_zh: '熔炼炉炉壳',
    unit: '件',
    category: 'part',
    // 炉壳钢板厚度：3–12 mm 是卷焊筒体的常用档；读数由 measure/furnace-parts 用千分尺交。
    props: [{ param: 'wallThickness', kind: 'range', min: 3, max: 12, unit: 'mm' }],
  },

  /** 炉衬。耐火打结料捣实，第一次开炉时自己烧结成型。铁水就盛在里面。 */
  {
    id: 'plant/melting-furnace/lining',
    name: 'Melting Furnace Lining', name_zh: '熔炼炉炉衬',
    unit: '件',
    category: 'part',
    // 打结层厚度：80–300 mm（炉容 1–5 t 档）；读数由测厚/高度尺交。
    props: [{ param: 'thickness', kind: 'range', min: 80, max: 300, unit: 'mm' }],
  },

  /** 感应线圈。紫铜管绕成，管内通水冷却 —— 铜的导电与导热同时用上。 */
  {
    id: 'plant/melting-furnace/coil',
    name: 'Melting Furnace Induction Coil', name_zh: '熔炼炉感应线圈',
    unit: '件',
    category: 'part',
    // 线圈电感/直流电阻：中频感应炉 1 kHz 档的典型窗口；LCR 表可测。
    props: [
      { param: 'inductance', kind: 'range', min: 0.5, max: 50, unit: 'mH' },
      { param: 'resistance', kind: 'range', min: 0.02, max: 1, unit: 'Ω' },
    ],
  },

  /**
   * 感应圈水冷套。**这就是「散热器作为零件」的样子。**
   *
   * 感应圈本身是铜管，管里通水；圈外套一层水套，把从炉衬传出来的热也带走。
   * 它是这台炉子上唯一一件**只为了扔热**而存在的零件。
   *
   * 用铝不用铜：水套只承压不导电，而铝便宜一千倍（见材料账 33 对 34,722）。
   * 工质是水不是氨 —— 水套贴着炉子，温度高，冻不着。
   */
  {
    id: 'plant/melting-furnace/coil-cooling',
    name: 'Melting Furnace Induction Coil Water-Cooled Jacket', name_zh: '熔炼炉感应圈水冷套',
    unit: '件',
    category: 'part',
    // 水套气密性：1e-3 Pa·m³/s 是 0.3–0.6 MPa 保压 30 min 的允许泄漏率上限；
    // 用空气压缩机 + 压力表做压降法，读数由 measure/furnace-parts 交。
    props: [{ param: 'leakRate', kind: 'range', min: 0, max: 0.001, unit: 'Pa·m³/s', dir: 'atMost' }],
  },

  /** 倾转机构。减速机加扇形齿轮，把炉体倾到倒铁水的角度。 */
  {
    id: 'plant/melting-furnace/tilt-drive',
    name: 'Melting Furnace Tilting Mechanism', name_zh: '熔炼炉倾转机构',
    unit: '件',
    category: 'part',
    // 倾转减速机回差：倒铁水角度控制 0–10′；分度台 + 自准直/千分表测。
    props: [{ param: 'backlash', kind: 'range', min: 0, max: 10, unit: '′', dir: 'atMost' }],
  },

  /** 中频电源。把工频电整成中频，几百赫兹到几千赫兹，是炉子的心脏。 */
  {
    id: 'plant/melting-furnace/psu',
    name: 'Melting Furnace Medium-Frequency Power Supply', name_zh: '熔炼炉中频电源',
    unit: '件',
    category: 'part',
    // 输出电压/纹波：中频电源 10–80 V、纹波 ≤5%；数字表 + 示波器测。
    props: [
      { param: 'outputVoltage', kind: 'range', min: 10, max: 80, unit: 'V' },
      { param: 'ripple', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
    ],
  },
];

/**
 * 熔炼炉零件的制造路线。
 *
 * 五条里有三条立刻撞到新东西：耐火材料、铜、电子元件。
 * 其中电子元件不在体系里造 —— 它是种子（`data/material/electronics.ts` 那四类），所以熔炼炉
 * 的中频电源是"从地球带的功率器件 + 本地绕的线圈"装出来的。
 */
export const FURNACE_ROUTES: readonly Route[] = [
  {
    /** 水冷套。铝板卷焊成夹套，不锈钢接管，与感应圈同轴装配。 */
    id: 'make/furnace-coil-cooling',
    name: 'Melting Furnace Induction Coil Water-Cooled Jacket Manufacturing', name_zh: '熔炼炉感应圈水冷套制造',
    produces: [{
      item: 'plant/melting-furnace/coil-cooling',
      qty: q(1),
      // 气密验收上限；读数由 measure/furnace-parts 的压降法收窄。
      gives: [{ param: 'leakRate', kind: 'range', min: 0, max: 0.001 }],
    }],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 炉壳。钢板卷筒 → 焊接 → 法兰加工。 */
    id: 'make/furnace-shell',
    name: 'Melting Furnace Shell Manufacturing', name_zh: '熔炼炉炉壳制造',
    produces: [{
      item: 'plant/melting-furnace/shell',
      qty: q(1),
      gives: [{ param: 'wallThickness', kind: 'range', min: 3, max: 12 }],
    }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] }],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /**
     * 炉衬。**碱性打结料**：镁砂为主，耐火料只作骨料与结合。
     *
     * 这一条改过一次，原因是一处冶金常识：**炼钢的渣是碱性的**（CaO、MgO、FeO），
     * 而铝质耐火料是酸性的（SiO₂、Al₂O₃）。碱性渣碰酸性衬不是"用久了磨损"，
     * 是化学侵蚀 —— 几炉就能把衬蚀穿。
     *
     * 所以真实的炼钢炉一律碱性衬：镁砂（MgO，熔点 2852 °C）、白云石。
     * 镁砂从卤水来（data/material/magnesia.ts），那个孤岛继晒盐之后
     * 有了第二个用途。
     *
     * **执行设备是机器人**：捣实是它干的，烧结是第一次升温时自己完成的。
     * 写成"由熔炼炉自己造"读起来像自指 —— 造第一台炉子不需要先有一台炉子，
     * 它只需要一堆料、一双手与一次烘炉。温度条件属于烘炉工艺，不属于制造路线。
     */
    id: 'make/furnace-lining',
    name: 'Melting Furnace Lining Manufacturing', name_zh: '熔炼炉炉衬制造',
    produces: [{
      item: 'plant/melting-furnace/lining',
      qty: q(1),
      gives: [{ param: 'thickness', kind: 'range', min: 80, max: 300 }],
    }],
    uses: [
      { anyOf: [{ item: 'mat/magnesia', qty: q(1) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 感应线圈。紫铜管绕制 → 绝缘包扎 → 水压试验。绕制要绕线机。 */
    id: 'make/furnace-coil',
    name: 'Melting Furnace Induction Coil Manufacturing', name_zh: '熔炼炉感应线圈制造',
    produces: [{
      item: 'plant/melting-furnace/coil',
      qty: q(1),
      gives: [
        { param: 'inductance', kind: 'range', min: 0.5, max: 50 },
        { param: 'resistance', kind: 'range', min: 0.02, max: 1 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(1) }] }],
    needs: [],
    performedBy: 'plant/winder',
  },
  {
    /** 倾转机构。减速机箱体镗孔、齿轮滚齿、蜗杆车制。 */
    id: 'make/furnace-tilt-drive',
    name: 'Melting Furnace Tilting Mechanism Manufacturing', name_zh: '熔炼炉倾转机构制造',
    produces: [{
      item: 'plant/melting-furnace/tilt-drive',
      qty: q(1),
      gives: [{ param: 'backlash', kind: 'range', min: 0, max: 10 }],
    }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1) }] }],
    needs: ['lathe', 'plant/gear-hobbing'],
    performedBy: 'plant/milling-machine',
  },
  {
    /**
     * 中频电源（半导体）。功率器件、电容、控制板、散热 —— 装配不要机器，机器人装。
     *
     * 三种电子料各一样，缺一样就点不亮：功率器件管通断，电容管谐振回路储能，
     * 控制板管频率与保护。散热件本地造（铝型材 + 水冷板），不在采购单上。
     *
     * **这是两条中频电源路线里效率高的一条：92% 级。** 另一条见
     * make/furnace-psu-rotary —— 中频发电机组，不要功率器件，80% 级。
     *
     * 备选件：控制板子句的 `std/control-board-discrete` 是第二供应（anyOf 第二备选），
     * DFS 选 `std/control-board-general`，它不进证明树属预期（PLAN 监控项，不删不塞）。
     */
    id: 'make/furnace-psu',
    name: 'Melting Furnace Medium-Frequency Power Supply Manufacturing', name_zh: '熔炼炉中频电源制造',
    produces: [{
      item: 'plant/melting-furnace/psu',
      qty: q(1),
      gives: [
        { param: 'outputVoltage', kind: 'range', min: 10, max: 80 },
        { param: 'ripple', kind: 'range', min: 0, max: 5 },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'std/power-device-general', qty: q(1) }] },
      // 谐振电容：外购的无源件，或本地做的薄膜电容（std/capacitor-film-general）——
      // 后者只覆盖薄膜这一种，电解电容做不了，所以这一子句是 OR。
      { anyOf: [{ item: 'std/passive-component-general', qty: q(1) }, { item: 'std/capacitor-film-general', qty: q(1) }] },
      // 控制板：外购的集成电路板，或本层的分立元件板（0.15 mm 都不到的工艺就够）。
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }, { item: 'std/control-board-discrete', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 中频电源（旋转）。**同一台设备的第二条来路：不要功率器件。**
     *
     * 感应炉要的不是直流，是**频率** —— 1 kHz 上下让炉料自己发热。半导体靠逆变
     * 给频率，旋转机组靠"转多快、槽多少"给频率：3000 r/min × 20 极 = 1 kHz。
     *
     * 但电容组还得要：谐振回路的储能是电容，不是发电机。所以这条路线
     * **绕开了功率器件与控制板，绕不开无源件** —— 断供试验里那三类停摆数的
     * 差别，正来自这里。
     */
    id: 'make/furnace-psu-rotary',
    name: 'Melting Furnace Medium-Frequency Power Supply Manufacturing', name_zh: '熔炼炉中频电源制造',
    produces: [{
      item: 'plant/melting-furnace/psu',
      qty: q(1),
      gives: [
        { param: 'outputVoltage', kind: 'range', min: 10, max: 80 },
        { param: 'ripple', kind: 'range', min: 0, max: 5 },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'std/frequency-converter-general', qty: q(1) }] },
      // 谐振电容：外购的无源件，或本地做的薄膜电容（std/capacitor-film-general）——
      // 后者只覆盖薄膜这一种，电解电容做不了，所以这一子句是 OR。
      { anyOf: [{ item: 'std/passive-component-general', qty: q(1) }, { item: 'std/capacitor-film-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
];

/**
 * 电解槽的五个零件。
 *
 * 碱性水电解：两片电极插在氢氧化钾溶液里，中间隔一层隔膜，通直流电，
 * 阴极出氢、阳极出氧。全厂唯一的还原剂与氧气都从它来。
 */
export const ELECTROLYZER_PARTS: readonly Item[] = [
  /** 槽体。钢板焊成，内衬防腐。承电解液，不导电。 */
  { id: 'plant/electrolyzer/cell-stack', name: 'Electrolyser Cell Stack', name_zh: '电解槽槽体', unit: '件', category: 'part' },

  /** 电极。钢板上镀镍 —— 碱液里铁会溶，镍耐蚀又是析氢的好催化面。 */
  { id: 'plant/electrolyzer/electrode', name: 'Electrolyser Electrode', name_zh: '电解槽电极', unit: '件', category: 'part' },

  /** 隔膜。把氢和氧分开，隔一层多孔膜，否则一混合就是爆炸极限。 */
  { id: 'plant/electrolyzer/diaphragm', name: 'Electrolyser Diaphragm', name_zh: '电解槽隔膜', unit: '件', category: 'part' },

  /** 整流电源。交流变直流，几千安培的低压大电流 —— 电耗全在这里。 */
  { id: 'plant/electrolyzer/rectifier', name: 'Electrolyser Rectifier Power Supply', name_zh: '电解槽整流电源', unit: '件', category: 'part' },

  /** 气液分离器。氢氧各自带液，要先甩掉碱雾再进储罐。 */
  { id: 'plant/electrolyzer/gas-separator', name: 'Electrolyser Gas-Liquid Separator', name_zh: '电解槽气液分离器', unit: '件', category: 'part' },

  /**
   * 冷却盘管。**电解槽是放热的**（水电解、氯碱、过硫酸盐都放），
   * 而它的窗口只有 10–90 °C —— 热不走，温度就往上跑，槽就废了。
   *
   * 盘管浸在电解液里通冷却水。它是这台设备的温度边界本身：**没有它，
   * 前面那些"60–90 °C"的条件一个都维持不住。**
   */
  { id: 'plant/electrolyzer/cell-cooling', name: 'Electrolyser Cooling Coil', name_zh: '电解槽冷却盘管', unit: '件', category: 'part' },
];

/**
 * 电解槽零件的制造路线。
 *
 * 三条立刻撞到火星拿不出的东西：镍（电极）、PTFE（隔膜）、电子元件（整流）。
 * 这不是写法保守 —— 电解槽本身就是"耐蚀金属 + 高分子 + 半导体"三件事的合成体。
 */
export const ELECTROLYZER_ROUTES: readonly Route[] = [
  {
    /** 冷却盘管。不锈钢管弯成蛇形，接管穿槽壁，PTFE 垫密封。 */
    id: 'make/electrolyzer-cooling',
    name: 'Electrolyser Cooling Coil Manufacturing', name_zh: '电解槽冷却盘管制造',
    produces: [{ item: 'plant/electrolyzer/cell-cooling', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 槽体。钢板焊接，内壁衬防腐层。 */
    id: 'make/electrolyzer-cell-stack',
    name: 'Electrolyser Cell Stack Manufacturing', name_zh: '电解槽槽体制造',
    produces: [{ item: 'plant/electrolyzer/cell-stack', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] }],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 电极。钢板镀镍。 */
    id: 'make/electrolyzer-electrode',
    name: 'Electrolyser Electrode Manufacturing', name_zh: '电解槽电极制造',
    produces: [{ item: 'plant/electrolyzer/electrode', qty: q(1) }],
    // 电极不是实心镍：**薄钢板 + 镀镍层**。
    // 前面直接写 1 kg 镍，是"假装有电镀" —— 现在真镀了。
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nickel-plating-solution', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '下料与冲孔（极板形状、导电耳）', performedBy: 'plant/sheet-shop' },
      { note_zh: '除油（碱洗）与酸洗活化', performedBy: 'plant/wet-bench' },
      { note_zh: '电镀镍（镀槽，20–40 µm，50–60 °C）', performedBy: 'plant/plating-bath', under: [{ param: 'temperature', min: 50, max: 60 }] },
    ],
  },
  {
    /**
     * 隔膜。PTFE 多孔膜，压制烧结。
     *
     * 这一条以前**没有执行设备**（"压制要压机，模型里没有压机"）。后来补了
     * 曲柄压力机，缺口填上了 —— 手压模的时代结束了：孔隙率与厚度一致性
     * 第一次由"压多少"决定，而不是由"手感"决定。
     */
    id: 'make/electrolyzer-diaphragm',
    name: 'Electrolyser Diaphragm Manufacturing', name_zh: '电解槽隔膜制造',
    produces: [{ item: 'plant/electrolyzer/diaphragm', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/ptfe', qty: q(1) }] }],
    needs: [],
    // 曲柄压力机补上了 —— 这一条的缺口填上了，且填得很具体：
    //   冷压成型（压到 60% 理论密度）→ 烧结（370–380，PTFE 熔融不流动）→ 控温冷却
    // 孔隙率靠"压多少"与"烧多久"控制，而两者模型都没有刻度 ——
    // 所以做出的是"能用但透气量不稳"的隔膜。
    steps: [
      { note_zh: '冷压成型（60% 理论密度）', performedBy: 'plant/press' },
      { note_zh: '烧结（370–380，PTFE 熔融不流动）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 370, max: 380 }] },
      { note_zh: '控温冷却（结晶度定孔隙）', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 整流电源（半导体）。晶闸管或 IGBT 整流，加变压器与冷却 —— 装配不要机器，机器人装。
     *
     * 变压器（硅钢 + 漆包线）与冷却（铝型材）本地造；从地球来的只有两样：
     * 功率器件与触发板。
     *
     * **这是两条整流路线里效率高的一条：95% 级，无磨损。** 另一条见
     * make/electrolyzer-rectifier-rotary —— 旋转变流机，不要半导体，效率 70% 级。
     *
     * 备选件：控制板子句的 `std/control-board-discrete` 是第二供应（anyOf 第二备选），
     * DFS 选 `std/control-board-general`，它不进证明树属预期（PLAN 监控项，不删不塞）。
     */
    id: 'make/electrolyzer-rectifier',
    name: 'Electrolyser Rectifier Power Supply Manufacturing', name_zh: '电解槽整流电源制造',
    produces: [{ item: 'plant/electrolyzer/rectifier', qty: q(1) }],
    uses: [
      // 功率器件：外购的，或本地做的晶闸管（std/thyristor-general）——
      // 后者是 0.1 mm 图形 + 扩散能做出来的那一档，慢、块头大，但能整流。
      { anyOf: [{ item: 'std/power-device-general', qty: q(1) }, { item: 'std/thyristor-general', qty: q(1) }] },
      // 控制板：外购的集成电路板，或本层的分立元件板（0.15 mm 都不到的工艺就够）。
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }, { item: 'std/control-board-discrete', qty: q(1) }] },
      // 变压器本地造 —— 以前只写在注释里，现在有条目了（std/transformer-general）。
      { anyOf: [{ item: 'std/transformer-general', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 整流电源（旋转）。**同一台设备的第二条来路：不要半导体。**
     *
     * 交流电机拖一台直流发电机，同轴；发电机出的就是直流，直接进电解槽。
     * 母线要铜排（几千安培，导线扛不住）。
     *
     * 这一条存在的理由只有一个：**半导体断供时，制氢不能停。** 电解槽是全厂
     * 氢与氧的唯一来源，它的电若只能从地球来，整个体系的第一天就卡在这里。
     *
     * 代价写在路线注释里：效率 70% 级（比半导体低 25 个百分点），换向器与电刷
     * 要定期修 —— 那 25% 变成热，最后落到辐射板面积上。
     */
    id: 'make/electrolyzer-rectifier-rotary',
    name: 'Electrolyser Rectifier Power Supply Manufacturing', name_zh: '电解槽整流电源制造',
    produces: [{ item: 'plant/electrolyzer/rectifier', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/rectifier-rotary-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /** 气液分离器。钢板卷焊 + 除雾丝网。 */
    id: 'make/electrolyzer-gas-separator',
    name: 'Electrolyser Gas-Liquid Separator Manufacturing', name_zh: '电解槽气液分离器制造',
    produces: [{ item: 'plant/electrolyzer/gas-separator', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] }],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 设备条目 —— `composedOf` 由零件清单生成
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 电解槽。水电解制氢氧。全厂的还原剂与氧都从这里出。
 *
 * 它是"耐蚀金属 + 高分子 + 半导体"三件事的合成体：镍电极、PTFE 隔膜、
 * 晶闸管整流 —— 三样都不是普通钢能顶的，所以这台设备的零件清单里
 * 没有一件是便宜货。
 */
export const ELECTROLYZER: Item = {
  id: 'plant/electrolyzer',
  name: 'Electrolyser', name_zh: '电解槽',
  unit: '套',
  category: 'machine',
  holds: [
    { param: 'temperature', min: 10, max: 90 },
    // 610 Pa 是水的三相点：敞开运行，电解液在 0.01 °C 就沸腾。必须加压。
    { param: 'pressure', min: 50, max: 500 },
  ],
  composedOf: [...ELECTROLYZER_PARTS.map((p) => ({ item: p.id, qty: q(1) })), { item: 'std/motor-7.5kw-4p', qty: q(1) }],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ELECTROLYZER_PARTS, ...FURNACE_PARTS, ELECTROLYZER];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/electrolyzer',
    name: 'Electrolyser Assembly', name_zh: '电解槽装配',
    produces: [{
      item: 'plant/electrolyzer',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

/**
 * 种子设备的装配路线 —— 第一台是运来的，第二台起由这条路线造。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件在条目的 `composedOf` 上。
 */
export const SEED_ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/melting-furnace',
    name: 'Melting Furnace Assembly', name_zh: '熔炼炉装配',
    produces: [{
      item: 'plant/melting-furnace',
      qty: q(1),
      gives: [
      { param: 'uniformity', kind: 'range', min: 0, max: 10, dir: 'atMost', record: 'mat/furnace-uniformity-record' },
      { param: 'coolingRate', kind: 'range', min: 0, max: 80, dir: 'atMost', record: 'mat/furnace-cooling-record' },
      { param: 'waterPressure', kind: 'range', min: 20, max: 60, dir: 'atLeast', record: 'mat/furnace-coil-record' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...ELECTROLYZER_ROUTES, ...FURNACE_ROUTES, ...ASSEMBLY_ROUTES, ...SEED_ASSEMBLY_ROUTES];
