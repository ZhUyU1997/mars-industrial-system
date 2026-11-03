/**
 * 控制板的第二档：2 层板 + 少一半无源件，给"只要继电器/显示/低速闭环"的消费者。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么要分档，而不是复制一块四层板
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `std/control-board-general` 是 4 层板 + 3–5 µm MCU + 30 MLCC + 40 片阻 +
 * 4 电感 + 6 晶体管（`make/control-board-general`）。它的能力是**高密度、
 * 低噪声、多 I/O**：DMM/ADC/示波器/VNA/多轴同步/机器人 24 轴/RTA 16 区
 * 这些消费者真的需要它，不能降级。
 *
 * 但 34 条消费者里有一批只做**低速显示、继电器、温度/压力闭环**：4 层板
 * 的地平面、40 片阻、4 电感全是过剩；把它们留在唯一一条四层板路线上，
 * 才是真正的结构性风险。本文件给第二档：
 *
 *   `std/control-board-simple-general`：2 层板、MCU 1、MLCC 20、片阻 25、
 *   电感 2、晶体管 4、晶振 1；32–48 路 I/O、8–12 MHz、0–70 °C。
 *   工艺与四层板同一条贴片/回流线，只换 2 层板与少一半无源件；
 *   **不是“另一台一模一样的板子”**，是更低的层数/密度/成本。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三档（本文件只建第二档）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① 四层通用 `std/control-board-general`：高密度/低噪声/高速接口。
 *      保留给 DMM/ADC/示波器/VNA/多轴同步/机器人 24 轴/RTA 16 区/PD 检测/
 *      毫米波源/tanδ 桥；这条不能降级，原因是地平面/串扰/时钟抖动。
 *   ② 二层简版 `std/control-board-simple-general`（本文件）：低速控制/显示。
 *   ③ 分立绕接 `std/control-board-discrete`（`board.ts`）：功率/模拟闭环，
 *      已有路线；本文件不重复。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 哪些消费者改到第二档（10 条，逐条改 uses，不一刀切）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `make/glass-press`               压制机：加热/油缸/超压联锁，继电器量
 *   `make/dynamic-balance-readout`   读数箱：已有 2 层 PCB + DVM，板只做显示/滤波
 *   `make/h2-bridge`                 桥路：4 运放 + 硬件比较器，板只做报警/显示
 *   `make/air-compressor`            空压机：压力开关/接触器/干燥器计时
 *   `make/oil-breakdown-tester`      击穿机：升压/计时/联锁；高压回路不经过板
 *   `make/karl-fischer-titrator`     滴定仪：恒流/终点/DVM 显示，低速
 *   `make/oil-aging-oven`            老化箱：90 °C 恒温 + 1000 h 计时
 *   `make/pd-logger`                 趋势记录器：1 Hz 采样/存储，低速
 *   `make/winder-control-board`      绕线机控制：数圈/显示/正反转，4 位显示够
 *   `make/h2-sensor`                 氢传感器整机：报警比较器在 `h2-bridge` 硬件
 *                                    回路里，板只做显示/继电器；安全回路不降级
 *
 * ⚠️ 这 10 条里 6 条走 `std/control-board-simple-manual-general`（手工焊版），
 * 4 条（`make/karl-fischer-titrator` / `make/pd-logger` / `make/winder-control-board` /
 * `make/h2-sensor`）本轮加 `std/control-board-simple-general` OR；两类都是二层简版，
 * 但不是一个件 —— 简版 OR 的判据与数字见下面的 C 组。
 *
 * ── 实际盘点（本轮 grep 的 only-general 清单）──────────────────────────────
 *
 * 本轮 grep 时 only-general 共 27 条 = **A 3（分立板）+ C 4（二层简版）+ B 20（只能四层板）**；
 * A/C 加 OR 备路后，仍 only-general 的是 **B 组 20 条**。另有 4 条（`make/robot-controller` /
 * `make/electrolyzer-rectifier` / `make/furnace-psu` / `make/winder-control`）已有
 * `std/control-board-discrete` OR，6 条已有 `simple-manual` OR，都不在 only-general 清单里。
 *
 * A 组 3 条（低速、I/O ≤32、无高频、无精密 ADC；已在 uses 里加分立板 OR）：
 *   `make/flash-point-tester` · `make/pour-point-tester` · `make/kinematic-viscosity-bath`
 *   分立板降级：**体积 3–5×、手工绕接 8–12 h/块、只到 100 kHz**。
 *   最坏工时 3 × 12 = **36 h**；体积代价 3 × (3–5×) = **9–15×**。
 *
 * C 组 4 条（二层简版够用；本轮加 `std/control-board-simple-general` OR，主路不替换）：
 *   `make/h2-sensor`             I/O 8–16（显示/继电器/DVM）；4 vol% 比较器在 h2-bridge 硬件；
 *                                8–12 MHz 对 <1 kHz 的报警/显示余量 >10^4
 *   `make/karl-fischer-titrator` I/O 8–16；板漏电 1 nA / 1–5 µA = 0.02–0.1%；热电势 1–2 µV
 *                                / (1 µA × 10 kΩ = 10 mV) = 0.01–0.02%（跨阻 ≥1 kΩ 时 ≤0.2%），
 *                                都 < 2–5% 终点容差；µA 前端是外部运放/DVM，不在板上
 *   `make/pd-logger`             2 通道、1 Hz、10^4–10^5 点；8–12 MHz vs 1 Hz = 10^7 余量；
 *                                I/O 8–16（DMM/定时/存储）
 *   `make/winder-control-board`  4 位 7 段复用 12 路 + 按钮/方向/计数 ~7 = ~19 ≤32；
 *                                8–12 MHz vs 凸轮脉冲 <1 kHz = >10^4；功率通断在铸铁鼓/铜触片，不在板上
 *
 * B 组 20 条（只能四层板，逐条一句具体原因）：
 *
 *   精密计量 4
 *     make/dmm-6half         6½ 位（24 位 ADC、INL 1–10 ppm）要 1 µV 级分辨；1/f 噪声与热电势压不住
 *     make/dmm-7half         7½ 位、0.1 ppm 分辨；1/f 噪声与 CMRR 120–140 dB 靠保护环 + 四层地平面
 *     make/adc-28bit-inl     28 位 ADC 的 INL/噪声到 ppm；多斜率/斩波要低噪声地平面与等长模拟走线
 *     make/tan-delta-bridge  tanδ 0.0001、100 V/50 Hz；低噪声前端与四层地平面是前提
 *
 *   高速/射频 9
 *     make/scope-adc         8 bit flash ADC：255 比较器 + 256 电阻梯，1.5–2 GHz 的寄生/地弹
 *     make/scope-1ghz        1 GHz 前端：50 Ω 阻抗控制与叠层，分立板引线电感/串扰会毁掉前端
 *     make/uhf-digitizer     2 GS/s 等效采样、1–5 ps 步进：ps 时序要等长/屏蔽（分立板 100 kHz）
 *     make/uhf-pd-analyzer   300–1500 MHz、40 dB 前放、−75…−65 dBm：UHF 前端要 50 Ω 与屏蔽
 *     make/mmwave-source     70–100 GHz（25 GHz×3）PLL，相位噪声 −95…−80 dBc/Hz：50 Ω 波导/稳相
 *     make/vna-synthesizer   10 MHz–3 GHz 合成源 PLL/分频：低抖动时钟与 50 Ω 输出
 *     make/vna-receiver      4 通道 3 GHz 接收机：肖特基混频 + IF 滤波，50 Ω/低串扰
 *     make/vna-3ghz-rf       3 GHz 射频引擎：50 Ω 半刚性互连、>100 dB 动态范围
 *     make/vna-3ghz          整机 10 MHz–3 GHz、100–120 dB、S11 0.05–0.2 dB：50 Ω/屏蔽/低噪声
 *
 *   多轴/运动 4
 *     make/cnc-polisher-5axis        5 轴插补 + 位置误差 ≤1 µm：确定性多轴时序与 µm 反馈
 *     make/multi-axis-sync-card      24 路差分 + 24×16 位计数器 + 同沿锁存：I/O 远超 32、要等长
 *     make/multi-axis-sync-analyzer  24 路同步 + 1–100 MHz 屏蔽：等长/地平面
 *     make/rta-zone-control          16 区可控硅 + 16 路测温/PID：I/O >32、要确定性时序
 *
 *   功率/安全 3
 *     make/pellistor-h2-sensor       0.001–0.01 vol%、10–100 ppm：催化珠桥的低漂移模拟
 *     make/pd-detector-iec60270      1–1000 pC、100–400 kHz、1 pC 处 U=1.317 pC：低漏电荷放大
 *     make/pd-detector-iec60270-b    同 A + 1 Hz 趋势记录器（MCU/存储）
 *
 * ⚠️ 这不是“第二供应商”的库存冗余：它是**第二档设计**。四层板路线停摆时，
 * 这 10 条仍能走二层板；四层板仍只有一条路线，高风险消费者不假装有冗余。
 * ⚠️ 简版与四层板仍共用贴片/回流线（`plant/solder-printer` / `pick-place` /
 * `reflow-furnace`）；若停的是贴片机/回流炉，二层板也停。本档只解掉
 * “4 层 PCB + 40 片阻/4 电感”这一段，不是全链路双供 —— A 组的分立板 OR 只覆盖
 * 3 台低速油品仪器，其余仍要另建一条绕接/分立板线。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CONTROL_BOARD_SIMPLE_ITEMS: readonly Item[] = [
  /**
   * 二层简版控制板。**不是四层板的等价替代**：32–48 路 I/O、8–12 MHz、
   * 0–70 °C、2 层；没有四层板的地平面/低串扰，也没有 40 片阻/4 电感的密度。
   */
  {
    id: 'std/control-board-simple-general',
    name: 'Two-Layer Simplified Control Board', name_zh: '二层简版控制板',
    unit: '件',
    category: 'part',
    props: [
      { param: 'layers', kind: 'range', min: 1, max: 2, unit: '层' },
      { param: 'ioCount', kind: 'range', min: 16, max: 64, unit: '路' },
      { param: 'clock', kind: 'range', min: 1, max: 20, unit: 'MHz' },
      { param: 'operatingTemperature', kind: 'range', min: 0, max: 70, unit: '°C' },
    ],
  },
];

export const CONTROL_BOARD_SIMPLE_ROUTES: readonly Route[] = [
  {
    /**
     * **二层简版：2 层板 + 3–5 µm MCU + 20 MLCC + 25 片阻 + 2 电感 + 4 管。**
     *
     *   2 层板 1 + MCU 1 + MLCC 20 + 片阻 25 + 电感 2 + 晶振 1 + 晶体管 4
     *   + 焊膏 0.05 + 助焊剂 0.01 + 铜线 0.2 + 锡 0.1 → 简版控制板 1
     *
     * 与四层通用板同一条贴片/回流线（`plant/solder-printer` / `pick-place` /
     * `reflow-furnace` / `wet-bench` / `robot`），只换 2 层板与少一半无源件；
     * 不是“另一台一模一样的板子”，是更低层数/更低密度/更低成本的第二档。
     */
    id: 'make/control-board-simple-general',
    name: 'Two-Layer Simplified Control Board Manufacturing', name_zh: '二层简版控制板制造',
    produces: [
      {
        item: 'std/control-board-simple-general',
        qty: q(1),
        gives: [
          { param: 'layers', kind: 'range', min: 2, max: 2 },
          { param: 'ioCount', kind: 'range', min: 32, max: 48 },
          { param: 'clock', kind: 'range', min: 8, max: 12 },
          { param: 'operatingTemperature', kind: 'range', min: 0, max: 70 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1) }] },
      { anyOf: [{ item: 'std/mcu-3um-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/mlcc-general', qty: q(20) }] },
      { anyOf: [{ item: 'std/chip-resistor-general', qty: q(25) }] },
      { anyOf: [{ item: 'std/chip-inductor-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/quartz-resonator-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/planar-transistor-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/solder-paste', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/flux-zinc-chloride', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(1, 10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '钢网印刷焊膏（0.12 mm 钢网、0.8 mm 球距档）', performedBy: 'plant/solder-printer' },
      { note_zh: '贴片：0.05 mm 重复定位，靠治具销（无面阵相机）', performedBy: 'plant/pick-place' },
      { note_zh: '回流：四温区、带速 0.3–0.4 m/min、峰值靠熔断指示片夹住（217/232 °C）', performedBy: 'plant/reflow-furnace' },
      { note_zh: '助焊剂清洗与吹干（ZnCl₂ 残留要洗掉：3 次换水 + 目视）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 60 }] },
      { note_zh: '通电自检：逐路量电压与电流（万用表 + 指零法）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(5) },
    unbalanced_zh:
      '2 层板 1 + MCU 1 + MLCC 20 + 片阻 25 + 电感 2 + 晶振 1 + 晶体管 4 + 焊膏 0.05 + 助焊剂 0.01 + 铜线 0.2 + 锡 0.1 → 简版控制板 1；余是清洗掉的助焊剂与焊料飞溅。产物按件计',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CONTROL_BOARD_SIMPLE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CONTROL_BOARD_SIMPLE_ROUTES];
