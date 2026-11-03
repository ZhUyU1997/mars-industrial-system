/**
 * 模拟集成电路 —— 运放，以及它让"闭环"第一次便宜下来。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 数字做"判断"，模拟做"调节"
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 前面做的芯片全是数字的：与非门、计数器、PROM —— 它们回答"是/不是"。
 * 而炉子的温度、电机的转速、伺服的力矩，要的是"多一点/少一点"。
 *
 * 运算放大器就是那个"多一点/少一点"的器件：**两个输入之差 × 一个很大的倍数**。
 *
 *   Vout = A × (V+ − V−)        A 大到 10 万倍
 *
 * 放大倍数大得离谱，所以它很少"开环"用 —— 总是接成负反馈：
 *
 *   比例    Vout = −(Rf/Rin) × Vin        一个电阻比决定增益
 *   积分    Vout = −(1/RC) ∫Vin dt        一个电容把"差"攒成"慢慢补"
 *   微分    Vout = −RC dVin/dt            一个电容对"变化"反应
 *
 * **PID 三个项，就是这三种接法各一个运放。** 而这三个运放做在同一片上，
 * 它们的漂移会一起漂 —— 这是"匹配"，也是集成电路对模拟电路最大的贡献。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 匹配：没有激光修调的替代品
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 工业上运放的失调电压靠**激光修调**（在片子上切电阻）压到 µV 级。本层没有激光。
 *
 * 退路有两条：
 *   靠版**对称**：差分对画成十字交叉，两边晶体管完全镜像 —— 能压到 mV 级
 *   靠**手调零**：每只运放外面加一个调零电位器 —— 装配时逐只调
 *
 * 所以这一版的运放是"**能调零的 mV 级运放**"，不是"µV 级精密运放"。
 * 用在温控、伺服、有源滤波上够 —— 用在精密测量上不够。
 *
 * ⚠️ 一处降级：没有薄膜电阻（那要溅射 + 光刻），增益靠外接的镍铬丝电阻定 ——
 * 所以"一片运放"配"一堆分立电阻"，集成的好处只吃到一半。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ANALOG_ITEMS: readonly Item[] = [
  /**
   * 运算放大器芯片。20 只晶体管 + 4 个电阻，单层铝，失调可调（外接电位器）。
   *
   * 它是本层第一块**模拟**集成电路 —— 前面全在回答"是/不是"，这一块回答"差多少"。
   */
  { id: 'std/opamp-chip-general', name: 'Operational Amplifier Chip', name_zh: '运算放大器芯片', unit: '片', category: 'part',
    // 3 µm 双极线（与 std/photomask-general 同一档），门数 10–30。
    props: [{ param: 'node', kind: 'range', min: 3000, max: 3000, unit: 'nm', dir: 'atMost' }, { param: 'gates', kind: 'range', min: 10, max: 30, unit: '门' }], },

  /**
   * 双金属式温控器，本层基线设计。
   *
   * 整机由底座、杠杆座、刀口杠杆、千分螺丝、双金属元件、微动开关、感温棒、
   * 石英参考支架、陶壳与刻度盘等件装配；零件与零件路线见
   * `data/machine/mech-temp-controller.ts`。
   */
  { id: 'std/temp-controller-general', name: 'Bimetallic Thermostat', name_zh: '双金属式温控器', unit: '台', category: 'part',
    composedOf: [
      { item: 'std/temp-controller-general/base', qty: q(1) },
      { item: 'std/temp-controller-general/case-frame', qty: q(1) },
      { item: 'std/temp-controller-general/angle-brace', qty: q(4) },
      { item: 'std/temp-controller-general/lever-seat', qty: q(1) },
      { item: 'std/temp-controller-general/pointer-seat', qty: q(1) },
      { item: 'std/temp-controller-general/knife-lever', qty: q(1) },
      { item: 'std/temp-controller-general/micrometer-screw', qty: q(1) },
      { item: 'std/temp-controller-general/shaft-pin-set', qty: q(1) },
      { item: 'std/temp-controller-general/bimetal-element', qty: q(1) },
      { item: 'std/temp-controller-general/spring-plate', qty: q(2) },
      { item: 'std/temp-controller-general/pointer', qty: q(1) },
      { item: 'std/temp-controller-general/scale-strip', qty: q(1) },
      { item: 'std/temp-controller-general/dial', qty: q(1) },
      { item: 'std/temp-controller-general/ceramic-insulator', qty: q(1) },
      { item: 'std/temp-controller-general/rod-guide-ring', qty: q(1) },
      { item: 'std/temp-controller-general/low-temp-sleeve', qty: q(2) },
      { item: 'std/temp-controller-general/sensor-rod', qty: q(1) },
      { item: 'std/temp-controller-general/ceramic-panel', qty: q(1) },
      { item: 'std/temp-controller-general/side-panel', qty: q(3) },
      { item: 'std/temp-controller-general/quartz-reference', qty: q(1) },
      { item: 'std/temp-controller-general/observation-window', qty: q(1) },
      { item: 'std/temp-controller-general/case-hardware-set', qty: q(1) },
      { item: 'std/temp-controller-general/dial-bushing', qty: q(1) },
      { item: 'std/microswitch-general', qty: q(1) },
      { item: 'std/terminal-board-4p-general', qty: q(1) },
    ] },

  /**
   * 电子式模拟 PID 温控器。两只运放（比例 + 积分）、一只比较器、镍铬电阻网络、热电偶输入。
   *
   * 它把"看火色、到温断电"换成"偏差多大、按比例补多少" ——
   * **炉子第一次有了闭环**，而不是一个开关。
   *
   * 元件为焊接/贴装装配，属于不可逆加工；零件输入写在路线 uses，不写 composedOf。
   */
  { id: 'std/temp-controller-electronic', name: 'Electronic Analog PID Temperature Controller', name_zh: '电子式模拟 PID 温控器', unit: '台', category: 'part' },
];

export const ANALOG_ROUTES: readonly Route[] = [
  {
    /**
     * 运放芯片：晶体管阵列（差分对 + 电流镜 + 输出级）→ 铝 1 → 钝化封装。
     *
     *   硅片 1 片 → 芯片 60 片（运放的管芯比计数器小）
     *
     * 工艺流程与数字芯片一样，差别全在**版图**：差分对要对称画、电流镜要靠近、
     * 输入对要远离输出级（防热反馈）。**这是本层第一次"图形决定性能"而不只是连通。**
     */
    id: 'make/opamp-chip',
    name: 'Operational Amplifier Chip Manufacturing', name_zh: '运算放大器芯片制造',
    produces: [{ item: 'std/opamp-chip-general', qty: q(60), gives: [{ param: 'node', kind: 'range', min: 3000, max: 3000 }, { param: 'gates', kind: 'range', min: 10, max: 30 }] }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pocl3', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/bonding-wire', qty: q(1) }] },
      { anyOf: [{ item: 'std/metal-can-general', qty: q(60) }] },
    ],
    needs: ['std/photomask-general', 'plant/evaporator'],
    steps: [
      { note_zh: '① 隔离 / 基区 / 发射区三道扩散', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1000, max: 1100 }] },
      { note_zh: '② 引线孔 + 铝 1 + 反刻（单层布线）', performedBy: 'plant/mask-aligner' },
      { note_zh: '③ 合金化（500–600）+ 钝化', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 500, max: 600 }] },
      { note_zh: '④ 划片、装架、键合、封帽', performedBy: 'plant/robot' },
      { note_zh: '⑤ 逐片调零（接电位器，调到失调 < 5 mV）', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '硅片 1 片（约 80 个管芯）→ 芯片 60 片；余 20 是差分对失配超差与调零不达标',
  },
  {
    /**
     * PID 温控器：两只运放（P 与 I）+ 一只比较器 + 电阻网络 + 表壳。
     *
     *   运放 2 + 镍铬电阻丝 + 薄膜电容 + 接触器 + 薄钢板 + 铜
     *
     * 输入是热电偶的毫伏，输出是接触器的通断 —— 中间是"偏差 × 比例 + 累积"。
     * 它比"测温锥 + 到温断电"好在哪：**温度不会再上下冲**，而是贴近设定值慢慢靠。
     *
     * ⚠️ 微分项（D）没做：微分对噪声极其敏感，而热电偶的毫伏信号本身就脏。
     * 工业上多数温控器默认关掉 D —— 这一版直接不做，是诚实，不是省事。
     */
    id: 'make/temp-controller',
    name: 'Electronic Analog PID Temperature Controller Manufacturing', name_zh: '电子式模拟 PID 温控器制造',
    produces: [{ item: 'std/temp-controller-electronic', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '装配（运放、电阻网络、电容、接线）', performedBy: 'plant/robot' },
      { note_zh: '调零与整定（比例带、积分时间靠电位器）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '接炉子实测（看超调与稳定时间）', performedBy: 'plant/robot' },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ANALOG_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...ANALOG_ROUTES];
