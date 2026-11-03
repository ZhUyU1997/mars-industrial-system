/**
 * 手工焊备路：SMT 线（丝印/贴片/回流）停摆时，给低速简版板留一条 350–400 °C 烙铁的路。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、为什么不是复制一条 SMT 线
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * SMT 主路的三台设备：
 *   `plant/solder-printer`  钢网刮刀，开口 0.1–5 mm，10–500 片/h
 *   `plant/pick-place`      机械夹爪，重复定位 50 µm，100–20 000 点/h
 *   `plant/reflow-furnace`  四温区 1.6 m，100–300 °C，带速 0.3–0.4 m/min
 *
 * 三台任一停，二层简版 `make/control-board-simple-general` 也停 —— 因为它
 * 与四层板共用同一条贴片/回流线（`control-board-simple.ts` 已写明）。
 * 复制一台贴片机不是备路，是第二条同样的单点；本文件给的是**离线手工焊**：
 * 烙铁 350–400 °C、0.5–1.2 mm 实心焊锡丝、ZnCl₂ 助焊剂、10–20× 放大、
 * 返修台预热。它只接 **0603/0805 以上、≥0.5 mm 间距** 的板，不是万用替代。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、手工焊的窗口（为什么只到 0603 / 0.5 mm）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   烙铁头 φ0.5–1.0 mm、350–400 °C；0603 的焊盘间距 0.8 mm、0805 是 1.0 mm，
 *   手工对位在 10–20× 下 ±0.1 mm 够；0402（0.5 mm 间距）在同样的手里会连锡。
 *   所以本文件只收 **≥0603、≥0.5 mm**；BGA/细间距 QFP 不做。
 *
 *   焊接时间：每个 0603 焊点 2–3 s（预热 100–150 °C 的返修台把热冲击降一半）；
 *   一块 60 点的简版板 = 2–4 min 焊接 + 10–20 min 对位/检查/清洗；
 *   加上装夹与返修，**4–8× SMT 的 5 h** ⇒ 20–40 h/块。本文件取 30 h（6×）。
 *
 *   良率：0603/0805、≥0.5 mm、60–100 点，手工焊 **95–99 %**（SMT 是 99–99.9 %）；
 *   返修台能把虚焊/连锡重做，但每返一次 +10–20 min。记录里给 95–99，不给 99.9。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、哪些消费者可以走手工 OR（只做 6 条低速/非精密）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `make/glass-press` / `make/air-compressor` / `make/oil-aging-oven`：
 *     继电器/温度/压力，60 点以内，0603 够。
 *   `make/oil-breakdown-tester` / `make/h2-bridge` / `make/dynamic-balance-readout`：
 *     模拟前端 + 比较器 + 显示，0805/0603，≥0.5 mm；不做 BGA。
 *
 *   其余 4 条二层简版消费者（h2-sensor、karl-fischer、pd-logger、winder-control-board）
 *   不在此列：h2-sensor 安全回路、karl-fischer 的 µA 终点、pd-logger 的存储、
 *   winder 的显示都不是“手工焊就能保”的，仍只走 SMT。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、交付窗口与缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   板          2 层、16–32 路 I/O、1–8 MHz、0–70 °C
 *   封装        0603/0805 以上、≥0.5 mm 间距；不做 BGA/细间距 QFP
 *   良率        95–99 %
 *   工时        30 h/块（SMT 5 h 的 6×，落在 4–8× 内）
 *   设备        烙铁 350–400 °C、10–20× 放大、返修台预热、烟抽
 *
 *   ⚠️ 缺口：手工焊的“良率 95–99 %”是设计窗口，没有逐板 AOI/ X-ray；
 *   0603 的连锡与虚焊靠 10–20× 目检 + 通断，BGA 不接。
 *   ⚠️ 它只覆盖 SMT 线的**贴片/回流**单点；PCB、MCU、无源件本身停供仍会停。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const MANUAL_SOLDER_ITEMS: readonly Item[] = [
  /**
   * **手工焊工位：烙铁 350–400 °C + 10–20× 放大 + 返修台预热 + 烟抽。**
   *
   * 它以 `plant/rework-station` 的腔/光学/预热为基座，另加烙铁与夹具；
   * 不是另一台贴片机，是“人眼 + 手”的那一档。
   */
  {
    id: 'plant/manual-solder-station',
    name: 'Manual Soldering Station', name_zh: '手工焊工位',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 15, max: 30 },
      { param: 'pressure', min: 100, max: 500 },
    ],
    props: [
      { param: 'ironTemperature', kind: 'range', min: 300, max: 450, unit: '°C' },
      { param: 'magnification', kind: 'range', min: 10, max: 20, unit: '×' },
      { param: 'minPitch', kind: 'range', min: 0.5, max: 1.27, unit: 'mm', dir: 'atLeast' },
      { param: 'assemblyYield', kind: 'range', min: 90, max: 99, unit: '%', dir: 'atLeast' },
      { param: 'boardSize', kind: 'range', min: 50, max: 200, unit: 'mm', dir: 'atLeast' },
    ],
  },

  /** 烙铁：φ0.5–1.0 头、30–60 W、350–400 °C；镍丝发热芯 + 铜头。 */
  {
    id: 'plant/manual-solder-station/iron',
    name: 'Manual Soldering Station Iron', name_zh: '手工焊工位烙铁',
    unit: '件',
    category: 'part',
    props: [
      { param: 'temperature', kind: 'range', min: 300, max: 450, unit: '°C' },
      { param: 'power', kind: 'range', min: 20, max: 80, unit: 'W' },
    ],
  },

  /** 夹具：0.5–1.27 mm 间距的板夹 + 放大镜支架；铝/45 钢。 */
  {
    id: 'plant/manual-solder-station/fixture',
    name: 'Manual Soldering Station Fixture', name_zh: '手工焊工位夹具',
    unit: '件',
    category: 'part',
    props: [
      { param: 'minPitch', kind: 'range', min: 0.5, max: 1.27, unit: 'mm', dir: 'atLeast' },
      { param: 'boardSize', kind: 'range', min: 50, max: 200, unit: 'mm', dir: 'atLeast' },
    ],
  },

  /**
   * 手工焊简版控制板。**不是 SMT 简版的等价替代**：2 层、16–32 路 I/O、
   * 1–8 MHz、0603/0805、≥0.5 mm；良率 95–99 %，工时 4–8×。
   */
  {
    id: 'std/control-board-simple-manual-general',
    name: 'Manual Soldering Simplified Control Board', name_zh: '手工焊简版控制板',
    unit: '件',
    category: 'part',
    props: [
      { param: 'layers', kind: 'range', min: 1, max: 2, unit: '层' },
      { param: 'ioCount', kind: 'range', min: 8, max: 32, unit: '路' },
      { param: 'clock', kind: 'range', min: 1, max: 8, unit: 'MHz' },
      { param: 'minPitch', kind: 'range', min: 0.5, max: 1.27, unit: 'mm', dir: 'atLeast' },
      { param: 'assemblyYield', kind: 'range', min: 90, max: 99, unit: '%', dir: 'atLeast' },
    ],
  },
];

export const MANUAL_SOLDER_ROUTES: readonly Route[] = [
  {
    /** 烙铁：绕镍丝发热芯、车铜头、装手柄；350–400 °C 老炼。 */
    id: 'make/manual-solder-iron',
    name: 'Manual Soldering Station Iron Manufacturing', name_zh: '手工焊工位烙铁制造',
    produces: [
      {
        item: 'plant/manual-solder-station/iron',
        qty: q(1),
        gives: [
          { param: 'temperature', kind: 'range', min: 350, max: 400 },
          { param: 'power', kind: 'range', min: 30, max: 60 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '绕镍丝发热芯（φ0.3、30–60 W）、车 φ0.5–1.0 铜头、装酚醛手柄', performedBy: 'plant/winder' },
      { note_zh: '通电老炼 350 °C × 1 h → 400 °C × 1 h；用热电偶贴头测，热点重绕', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 350, max: 400 }] },
    ],
    rate: { hours: q(8) },
    unbalanced_zh: '镍 0.2 + 铜 0.2 + 耐火瓷 0.2 + 酚醛 0.1 + 水 1 → 烙铁 1 件；余是废丝、车屑与试温损耗',
  },

  {
    /** 夹具：铝底板 + 45 钢压条 + PTFE 垫，0.5–1.27 mm 间距。 */
    id: 'make/manual-solder-fixture',
    name: 'Manual Soldering Station Fixture Manufacturing', name_zh: '手工焊工位夹具制造',
    produces: [
      {
        item: 'plant/manual-solder-station/fixture',
        qty: q(1),
        gives: [
          { param: 'minPitch', kind: 'range', min: 0.5, max: 1.27 },
          { param: 'boardSize', kind: 'range', min: 200, max: 200 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '铣铝底板与 45 钢压条、装 PTFE 垫与可调压紧螺钉；0.5 mm 间距不压塌', performedBy: 'plant/milling-machine' },
      { note_zh: '装 10–20× 放大镜支架与烟抽接口；夹 200 mm 板试压', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(12) },
    unbalanced_zh: '铝 1 + 45 钢 1 + PTFE 0.1 + 水 2 → 夹具 1 件；余是铣屑与试压水',
  },

  {
    /**
     * **手工焊工位装配：返修台的腔/光学/预热 + 新烙铁 + 夹具。**
     *
     * 复用 `plant/rework-station` 的 20–500 L 腔、2–100× 光学、0.1–5 kW 预热；
     * 只新增烙铁与夹具。不是另造一台贴片机。
     */
    id: 'make/manual-solder-station',
    name: 'Manual Soldering Station Assembly', name_zh: '手工焊工位装配',
    produces: [
      {
        item: 'plant/manual-solder-station',
        qty: q(1),
        gives: [
          { param: 'ironTemperature', kind: 'range', min: 350, max: 400 },
          { param: 'magnification', kind: 'range', min: 10, max: 20 },
          { param: 'minPitch', kind: 'range', min: 0.5, max: 1.27 },
          { param: 'assemblyYield', kind: 'range', min: 95, max: 99 },
          { param: 'boardSize', kind: 'range', min: 200, max: 200 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/rework-station/chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rework-station/optics', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rework-station/preheater', qty: q(1) }] },
      { anyOf: [{ item: 'plant/manual-solder-station/iron', qty: q(1) }] },
      { anyOf: [{ item: 'plant/manual-solder-station/fixture', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(12) },
    steps: [
      { note_zh: '把返修台腔、光学、预热装到工作台；装烙铁架、夹具、烟抽', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '烙铁 350/400 °C 两点校温；10×/20× 光学对刀；空板试夹 200 mm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '返修腔 1 + 光学 1 + 预热 1 + 烙铁 1 + 夹具 1 → 手工焊工位 1 台；零件按件计，没有 kg 账；余是装配废品与接线',
  },

  {
    /**
     * **手工焊简版板：0603/0805、≥0.5 mm、60–100 点。**
     *
     *   2 层板 1 + MCU 1 + MLCC 20 + 片阻 25 + 电感 2 + 晶振 1 + 管 4
     *   + 焊锡丝 0.01 + 助焊剂 0.01 + 水 1 → 手工板 1
     *
     * 烙铁 350–400 °C、0.5–1.2 mm 实心焊锡丝；每个焊点 2–3 s；返修台预热
     * 100–150 °C；10–20× 目检 + 通断。良率 95–99 %，30 h/块（SMT 5 h 的 6×）。
     *
     * BGA/细间距 QFP 不做；0402/0.5 mm 以下不做。
     */
    id: 'make/manual-solder-assembly',
    name: 'Manual Soldering Simplified Control Board Manufacturing', name_zh: '手工焊简版控制板制造',
    produces: [
      {
        item: 'std/control-board-simple-manual-general',
        qty: q(1),
        gives: [
          { param: 'layers', kind: 'range', min: 2, max: 2 },
          { param: 'ioCount', kind: 'range', min: 16, max: 32 },
          { param: 'clock', kind: 'range', min: 1, max: 8 },
          { param: 'minPitch', kind: 'range', min: 0.5, max: 1.27 },
          { param: 'assemblyYield', kind: 'range', min: 95, max: 99 },
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
      {
        anyOf: [
          {
            item: 'mat/solder-wire',
            qty: q(1, 100),
            need: [{ param: 'diameter', kind: 'range', min: 0.5, max: 1.2 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/flux-zinc-chloride', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(30) },
    steps: [
      {
        note_zh:
          '① 涂 ZnCl₂ 助焊剂、10–20× 下摆 0603/0805（≥0.5 mm 间距）；0402/BGA 不做',
        performedBy: 'plant/manual-solder-station',
      },
      {
        note_zh:
          '② 烙铁 350–400 °C、0.5–1.2 mm 实心焊锡丝，每点 2–3 s；返修台预热 100–150 °C 降热冲击；连锡/虚焊用返修台重做',
        performedBy: 'plant/manual-solder-station',
      },
      {
        note_zh:
          '③ 水洗 ZnCl₂ 残留（3 次换水 + 刷洗）、吹干；水痕就是缺陷',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 60 }],
      },
      {
        note_zh:
          '④ 10–20× 目检 + 逐点通断；60–100 点、95–99 % 良率；测完写返修记录',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '2 层板 1 + MCU 1 + MLCC 20 + 片阻 25 + 电感 2 + 晶振 1 + 管 4 + 焊锡丝 0.01 + 助焊剂 0.01 + 水 1 → 手工板 1。焊锡/助焊剂大部分留在焊点与清洗水；产物按件计，不折 kg；返修废品 1–5 % 进边角料',
  },
];

// ── 规范出口 ─────────────────────────────────────────────────────────────────
export const DATA_ITEMS: readonly Item[] = [...MANUAL_SOLDER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...MANUAL_SOLDER_ROUTES];
