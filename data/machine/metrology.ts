/**
 * 恒温计量间 —— 一台"只提供环境、不执行工序"的设备。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它不是零件，因为零件有归属而房间没有
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 零件靠路径归属机器（`plant/grinder/wheel` 是磨床的砂轮）。而计量间装的是
 * 机器，不是被机器装着 —— 写成 `plant/comparator/room` 等于说"比较仪的房间"，
 * 语义倒过来了。
 *
 * 那它是什么？**是一台设备，只是不执行工序。** 模型里这种设备的位置早就有：
 *
 *   `holds`  它能维持什么条件
 *   `needs`  别的路线以"必须在场、但不被消耗"的方式引它
 *
 * 而 `no_machine` 那条校验的候选清单本来就把 `needs` 里的设备算进去 ——
 * 所以一条路线可以"由磨床执行、在恒温间里进行"。
 *
 * `describe.ts` 里那句注释早就写过这个例子：「只查 performedBy 会把恒温车间
 * 这类'只提供环境、不执行工序'的设备误报为闲置」。模型等了这个例子很久。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么非得有它：1 °C 就是 1.2 µm
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 钢的线膨胀系数 11.5 µm/(m·K)。100 mm 的量块，**温差 1 °C 差 1.15 µm** ——
 * 而工作量块的公差是 ±0.5 µm。
 *
 * 也就是说：**没有恒温间，比较仪读出来的数没有意义。** 它读到的可能全是
 * 温度，而不是尺寸。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 控温不需要电子元件
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 双金属片：两片膨胀系数不同的金属（黄铜 19、钢 11.5）贴在一起，温度一变就弯。
 * 弯到一定程度顶开或闭合触点，通断加热器 —— 这就是恒温器，1820 年代的发明。
 *
 * 所以恒温间是**纯机械电气的**：双金属片 → 继电器 → 加热丝 / 制冷。不需要
 * 电子元件，也不需要 PID —— 精度 ±1 °C 用开关控制就够（会有一点振荡，
 * 但量块的判定只需要 ±1）。
 *
 * 制冷用氨（本层已有），热排到辐射板。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const METROLOGY_PARTS: readonly Item[] = [
  /**
   * 保温墙板。薄钢板两面夹矿棉（夹芯板），拼成房间。
   *
   * 它要的不是强度，是**热惰性**：墙一厚，外面的昼夜波动进不来，
   * 里面的加热器就能用很小的功率维持温度。
   */
  { id: 'plant/metrology-room/wall', name: 'Metrology Room Insulated Wall Panel', name_zh: '计量间保温墙板', unit: '件', category: 'part' },

  /**
   * 恒温机组。风机 + 加热丝 + 氨蒸发器 + 风道。
   *
   * 加热容易，制冷才是麻烦：**恒温间几乎总是在制冷**（人和设备都在发热），
   * 而制冷要氨回路与蒸发器。
   */
  { id: 'plant/metrology-room/hvac', name: 'Metrology Room Temperature-Control Unit', name_zh: '计量间恒温机组', unit: '件', category: 'part' },

  /**
   * 双金属片温控器。黄铜片与钢片贴在一起，温度变了就弯。
   *
   * 一台不用一个电子元件的恒温控制器。它的精度不高（± 0.5 °C 的死区），
   * 但正好够 —— 判定量块只要 ±1 °C。
   */
  { id: 'plant/metrology-room/thermostat', name: 'Metrology Room Bimetallic Thermostat', name_zh: '计量间双金属片温控器', unit: '件', category: 'part' },

  /**
   * 隔振基础。铸铁块垫在矿棉上，把仪器与地面振动隔开。
   *
   * 亚微米比较怕两样：温度和振动。振动的影响更直接 —— 人走过去，
   * 读数就跳。
   */
  { id: 'plant/metrology-room/isolation', name: 'Metrology Room Vibration-Isolation Foundation', name_zh: '计量间隔振基础', unit: '件', category: 'part' },

  /**
   * 门斗。双道门加一段缓冲，人进出时外面的气不直接灌进来。
   *
   * 它是最便宜也最有效的部件：一道门斗能让温度恢复时间短一个量级。
   */
  { id: 'plant/metrology-room/airlock', name: 'Metrology Room Vestibule', name_zh: '计量间门斗', unit: '件', category: 'part' },
];

export const METROLOGY_ROUTES: readonly Route[] = [
  {
    /** 保温墙板。钢板折边 → 填矿棉 → 双面复合 → 拼装。 */
    id: 'make/metrology-wall',
    name: 'Metrology Room Insulated Wall Panel Manufacturing', name_zh: '计量间保温墙板制造',
    produces: [{ item: 'plant/metrology-room/wall', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
  {
    /**
     * 恒温机组。钢结构框架 + 风机 + **镍铬加热丝** + 氨蒸发器盘管。
     *
     * 加热丝以前只在注释里 —— 现在它有条目了（`mat/resistance-wire`）：
     * 镍铬丝是恒温间唯一的热源，也是这套设备里唯一会被烧断的零件。
     */
    id: 'make/metrology-hvac',
    name: 'Metrology Room Temperature-Control Unit Manufacturing', name_zh: '计量间恒温机组制造',
    produces: [{ item: 'plant/metrology-room/hvac', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1) }] },
    ],
    needs: ['lathe', 'plant/milling-machine'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 温控器。黄铜片与钢片铆合 → 卷成螺线 → 装触点。 */
    id: 'make/metrology-thermostat',
    name: 'Metrology Room Bimetallic Thermostat Manufacturing', name_zh: '计量间双金属片温控器制造',
    produces: [{ item: 'plant/metrology-room/thermostat', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['plant/grinder'],
    performedBy: 'lathe',
  },
  {
    /** 隔振基础。铸铁块浇成 → 磨平顶面 → 垫矿棉。 */
    id: 'make/metrology-isolation',
    name: 'Metrology Room Vibration-Isolation Foundation Manufacturing', name_zh: '计量间隔振基础制造',
    produces: [{ item: 'plant/metrology-room/isolation', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1) }] },
    ],
    needs: ['plant/grinder'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 门斗。两道保温门 + 门框，与墙板同一工艺。 */
    id: 'make/metrology-airlock',
    name: 'Metrology Room Vestibule Manufacturing', name_zh: '计量间门斗制造',
    produces: [{ item: 'plant/metrology-room/airlock', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
];

/**
 * 恒温计量间。19–21 °C，±1。
 *
 * **它不执行任何路线** —— 它提供环境。所以它会出现在别的路线的 `needs` 里，
 * 而不出现在 `performedBy` 里。`idle_machine` 的判定认 `needs`，所以它不算闲置。
 *
 * 这也是"设施"那个讨论的第一次落地：不需要新概念，只需要认清
 * **一台只维持环境的设备，也是一台设备。**
 */
export const METROLOGY_ROOM: Item = {
  id: 'plant/metrology-room',
  name: 'Metrology Room', name_zh: '计量间',
  unit: '间',
  category: 'machine',
  holds: [{ param: 'temperature', min: 19, max: 21 }],
  composedOf: [
    ...METROLOGY_PARTS.map((p) => ({ item: p.id, qty: q(1) })),
    { item: 'std/motor-7.5kw-4p', qty: q(1) },
    // 数字表：计量间的读数从"指针看第几格"变成"一个数"。
    { item: 'std/dvm-general', qty: q(1) },
  ],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...METROLOGY_PARTS, METROLOGY_ROOM];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/metrology-room',
    name: 'Metrology Room Assembly', name_zh: '计量间装配',
    produces: [{
      item: 'plant/metrology-room',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...METROLOGY_ROUTES, ...ASSEMBLY_ROUTES];
