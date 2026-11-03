/**
 * 分立元件控制板 —— 不用集成电路、不用印制板、不用焊锡。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 三件"没有"，逼出三条替代
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   集成电路太晚才有 → 用分立元件搭：晶体管 + 电阻 + 电容，一只管一个功能
 *                      （后来有 4 门芯片了，但绕接板仍是小批量定制的来路）
 *   没有覆铜板      → 覆铜板要热压机（本层没有压机）；用**陶瓷板 + 铜柱**
 *   没有焊锡        → 本层没有锡（铅锌链未建）；用**绕接（wire wrap）**
 *
 * 三条替代各自都有代价，但它们凑在一起能做出**一块真的能用的控制板** ——
 * 1950 年代中期的电子设备就是这么做出来的：陶瓷或胶木板、铜柱、绕接、分立管。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 绕接：为什么它不是"凑合"
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 把导线在方形铜柱上绕 6–8 圈，靠**冷焊**接触：铜与铜在压力下原子互相扩散，
 * 接触电阻比焊点还稳定，而且**没有热损伤、没有助焊剂残留**。
 *
 * 它唯一的要求是"绕得紧"：绕线枪把线拉紧、边转边压 —— 手工也能绕，
 * 一根针、一个套筒、一把钳子就够，只是慢。
 *
 * 电话交换机在 1960–1980 年代全用绕接，可靠性比焊锡高。**这不是退而求其次，
 * 是一条被淘汰但正确过的技术路线**（被淘汰是因为改线麻烦，不是因为不可靠）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 模拟闭环：分立元件也能做
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 机器人控制柜要的"闭环"，本质是**模拟量比较 + 放大**：
 *
 *   给定电压（来自凸轮程序器带动的电位器）− 反馈电压（来自自整角机 + 相敏整流）
 *   → 差值 → 放大 → 驱动电机
 *
 * 差值放大用一个差分级（两只晶体管 + 两只电阻）就够了 —— **运放的前身**。
 * 所以这一条路线让 `std/control-board-general` 不再是唯一选择：
 * 慢、笨、要调零，但它**能闭环**。
 *
 * ⚠️ 一处降级：分立板的一致性靠手调，一块板子有几十个可调点；
 * 换一块板就要重调。工业上用**印制的电阻网络**避免这件事，本层没有。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const BOARD_ITEMS: readonly Item[] = [
  /**
   * 分立元件控制板。陶瓷基板 + 铜柱 + 绕接配线 + 分立元件，约 20 只晶体管。
   *
   * 规格写"一档"：板子的功能由接线决定，同一块坯板能接成放大器、比较器或触发器 ——
   * 与"电机只造 7.5 kW 一种"同理，备件统一比逐台匹配要紧。
   */
  { id: 'std/control-board-discrete', name: 'Discrete Component Control Board', name_zh: '分立元件控制板', unit: '件', category: 'part' },
];

export const BOARD_ROUTES: readonly Route[] = [
  {
    /**
     * 分立元件控制板：打孔装柱 → 元件成形与插装 → 绕接配线 → 通电调试。
     *
     *   陶瓷板（氧化铝瓷，那条线）+ 铜柱 + 漆包线（绕接用）
     *   + 合金结晶体管 20 只 + 镍铬电阻丝（电阻）+ 薄膜电容
     *
     * 四道工序全是机器人手上的活：装柱要对位、元件要成形、绕接要拉紧、
     * 调试要一格一格地对 —— **这块板子的成本几乎全是人工。**
     */
    id: 'make/control-board-discrete',
    name: 'Discrete Component Control Board Manufacturing', name_zh: '分立元件控制板制造',
    produces: [{ item: 'std/control-board-discrete', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/enamel-wire', qty: q(1) }] },
      { anyOf: [{ item: 'std/alloy-junction-transistor-general', qty: q(20) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(6) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '基板打孔、装铜柱（柱距 2.5 mm）', performedBy: 'plant/milling-machine' },
      { note_zh: '元件成形与插装', performedBy: 'plant/robot' },
      { note_zh: '绕接配线（每柱 6–8 圈，拉紧）', performedBy: 'plant/robot' },
      { note_zh: '通电调试（逐点对电压）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },

  {
    /**
     * **控制板（通用版）** —— 种子自给率的倒数第二格。
     *
     * `std/control-board-general` 曾经是种子里最后一条"只有条目、没有路线"的 ——
     * 它一直写着"外部输入"，而实际上下面的每一件本层都能造：
     *
     *   板    `mat/multilayer-pcb`（4 层）
     *   芯    `std/mcu-3um-general`（3–5 µm 互连，第 121/129 节）；
     *         40 nm 的 `std/mcu-40nm-general` 有路线 `make/mcu-40nm-damascene`：
     *         前道 16–24、后道 `make/beol-40nm-8layer` 40–100 nm / AR 2–3 /
     *         dishing 3–8 / 8 层、LPCVD Si₃N₄ 钝化。**2026-10-20 前的口径**是
     *         “16–24 nm + 100–300 nm 后道 + 3–5 µm 钝化混合件，缺后道图形化与
     *         电子级钝化”—— 这一版已不成立。
     *   无源  `std/mlcc-general` / `std/chip-resistor-general` / `std/chip-inductor-general`
     *   焊    `mat/solder-paste` + `mat/flux-zinc-chloride`
     *   脚    `std/lead-frame-general` 与别的器件的引线
     *
     * **它与 `make/control-board-discrete` 的分别**：那一条是"陶瓷板 + 铜柱 + 绕接"，
     * 靠手调闭环（一块板几十个可调点）；这一条是**印制的** —— 布线在板里、
     * 元件贴上去、一次回流焊完成。差别不是"新旧"，是**换一块板要不要重调**。
     *
     * ⚠️ 一条降级：本层没有 PCB 的连接器（排针、板对板座），所以对外只有焊盘，
     * 接线靠锡焊 —— 见 R8 ①。
     */
    id: 'make/control-board-general',
    name: 'Control Board Manufacturing', name_zh: '控制板制造',
    produces: [{ item: 'std/control-board-general', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/multilayer-pcb', qty: q(1) }] },
      { anyOf: [{ item: 'std/mcu-3um-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/mlcc-general', qty: q(30) }] },
      { anyOf: [{ item: 'std/chip-resistor-general', qty: q(40) }] },
      { anyOf: [{ item: 'std/chip-inductor-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/quartz-resonator-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/planar-transistor-general', qty: q(6) }] },
      { anyOf: [{ item: 'mat/solder-paste', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/flux-zinc-chloride', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(1, 10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '钢网印刷焊膏（0.12 mm 钢网、0.8 mm 球距档）', performedBy: 'plant/solder-printer', under: [{ param: 'temperature', min: 22, max: 26 }] },
      { note_zh: '贴片：0.05 mm 重复定位，靠治具销（无面阵相机，见贴片机那条）', performedBy: 'plant/pick-place', under: [{ param: 'temperature', min: 21, max: 26 }] },
      { note_zh: '回流：四温区、带速 0.35 m/min、峰值靠熔断指示片夹住（219–228 °C 实测）', performedBy: 'plant/reflow-furnace', under: [{ param: 'temperature', min: 219, max: 228 }] },
      { note_zh: '助焊剂清洗与吹干（ZnCl₂ 残留要洗掉，判据测不出，只能 3 次换水 + 目视）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 60 }] },
      { note_zh: '通电自检：逐路量电压与电流（万用表 + 指零法）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(6) },
    unbalanced_zh:
      '板 1 + MCU 1 + MLCC 30 + 片阻 40 + 电感 4 + 晶振 1 + 晶体管 6 + 焊膏 0.05 + 助焊剂 0.01 + 铜线 0.2 + 锡 0.1 → 控制板 1 件；余是清洗掉的助焊剂与焊料飞溅。产物按件计',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...BOARD_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...BOARD_ROUTES];
