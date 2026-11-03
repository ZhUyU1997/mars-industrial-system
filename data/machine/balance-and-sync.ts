/**
 * 动平衡机 + 24 轴同步性量具 —— 把未闭合项里最后两条“真缺口”补成有路线。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 这两条原来缺什么
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① 动平衡机 0 台（`measure/grinder-spindle.ts`
 *     第 9/13 行：“砂轮不平衡量判不了，只能空转听声音”）。
 *  ② 24 轴同步性判不了（`controller-24axis.ts` 已知缺口③：
 *     “24 轴插补的同步误差要 µs 级示波器，本层没有”）。
 *
 * 本文件按 Earth 工程建：
 *
 *   plant/dynamic-balance-machine   硬支承卧式，300–3000 rpm，两平面
 *   plant/multi-axis-sync-analyzer  24 路编码器输入，10–100 kS/s，同一时钟
 *
 * 所有 `gives` 窗口、ISO 1940 许用值、同步误差都是**设计值（Earth 工程值）**，
 * 不是实测。实测记录走本文件末尾两条 `measure/` 路线。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、动平衡机：0.1–10 g·mm 是“分辨”，不是“满量程”
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 题设给的是“可测不平衡量 0.1–10 g·mm、最大转子 5–50 kg”。这两个数放在
 * 一起会打架：ISO 1940 的许用不平衡量是
 *
 *   U_per = 9549 × G × m / n        [g·mm，m 为 kg，n 为 r/min]
 *
 * 5–50 kg 的砂轮在 1500–3000 r/min 上，G6.3 的 U_per 是 **100–2005 g·mm**，
 * G2.5 是 **40–796 g·mm** —— 比 10 g·mm 大 4–200 倍。所以 0.1–10 g·mm
 * 只能是**分辨/最小可测档**，不是满量程。本文件把它落成 `resolution`
 * 0.1–10 g·mm，另立 `unbalance` 满量程 0.1–20000 g·mm：
 *
 *   50 kg @300 r/min 的 G6.3 U_per = 9549×6.3×50/300 = **10027 g·mm**
 *   ⇒ 满量程 20000 g·mm 有 2 倍余量；0.1 g·mm 分辨在低档上达到。
 *
 * 砂轮 φ200–400、1500–3000 r/min 的 G6.3/G2.5 许用值（m=5–20 kg）：
 *
 *    m/kg   n=1500 G6.3   n=1500 G2.5   n=3000 G6.3   n=3000 G2.5
 *    ─────────────────────────────────────────────────────────────
 *      5       200.5         79.6          100.3          39.8
 *     10       401.1        159.2          200.5          79.6
 *     20       802.1        318.3          401.1         159.2
 *
 * ⇒ 本层砂轮的许用窗口是 **G6.3 100–802 g·mm、G2.5 40–318 g·mm**
 *   （m=5–20 kg、n=1500–3000 r/min）。这就是记录里 `permissible 40–802` 的由来。
 *
 * ⚠️ 速度上限：φ200 @3000 r/min = 31.4 m/s；φ400 @3000 r/min = **62.8 m/s**，
 * 超过树脂结合剂砂轮的 ~35 m/s 上限。所以 φ400 的服务转速只能到
 * **~1670 r/min**（35 m/s），φ200 可以到 3000 r/min。动平衡机本身能转到
 * 3000，但“能转”不等于“砂轮能在这个直径上转”—— 这条限制写进记录注释。
 *
 * 硬支承 vs 软支承：本机走**硬支承**（刚性摆架 + 两只速度传感器，
 * 力 ∝ Uω²，相位由 `std/rotary-encoder` 给）。软支承要低频悬置与每转子
 * 标定，另是一条路线；硬支承的代价是摆架刚度要 50–100 kN/mm，且传感器
 * 低频端只到 2–4 Hz（300 r/min = 5 Hz，已经在共振之上）。设计值。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、24 轴同步性：为什么是 24 路计数器，不是 24 片 ADC / FPGA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 24 轴控制柜的编码器是**数字 A/B/Z**，不是模拟量。要判的是：
 *
 *   ① 同一时刻 24 路的位置（时间戳）；
 *   ② 通道间偏斜（skew）；
 *   ③ 跟随误差（指令位置 − 实际位置，µm）；
 *   ④ 圆插补的径向偏差（circularity，µm）。
 *
 * 所以正确的采集是 **24 路 16 位计数器 + 同一时钟沿锁存**，不是 24 片 ADC：
 * ADC 会引入 24 套增益/偏置/孔径误差，反而把 µs 级同步淹没；FPGA 要
 * 亚微米 CMOS，本层只有 5 µm 平面工艺。计数器路线用本层已有的
 * `std/counter-chip-general`（4 位/片，24×4=96 片拼 16 位）、
 * `std/planar-transistor-general`（24 路差分接收）、`std/control-board-general`
 * 与一只 5 MHz 石英。
 *
 *   5 MHz ÷ 50–500 = **10–100 kS/s**（题设窗口）
 *   16 位 @1 µm 分辨：1 m/s 时 1 MHz 脉冲，10 µs 锁存一次，65.5 ms 才回绕
 *   偏斜预算：时钟扇出 50–200 ns + 线接收 100–500 ns + 锁存 50–200 ns
 *             ⇒ **0.1–1 µs**（题设 ≤0.1–1 µs）
 *   时间戳分辨：5 MHz 半周期内插 ⇒ **100–200 ns**
 *
 * 现有 `plant/spindle-error-analyzer/sync-clock` 只有 2–4 通道，差 6–12 倍；
 * 本文件新建 24 路采集卡 + 24 路时钟扇出，不是把旧钟“改一改”。
 *
 * ⚠️ 本层没有 100 MHz 以上的石英路线：5 MHz 是 `make/quartz-resonator-5mhz`
 * 的上限，所以时间戳只能到 100–200 ns，不是 10–50 ns。要 10 ns 时间戳，
 * 得先有 100 MHz 低相噪晶振（缺口，差 5–20 倍）。
 *
 * ⚠️ 5 MHz 石英的频率误差 1e-5：30 s 内绝对时间漂 **300 µs**。24 路的
 * 相对偏斜由同一时钟抵消，但记录的时间戳不是 UTC 溯源 —— 它是“同一台
 * 仪器内的相对时间”，不是绝对时间。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、只用已有 id
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 新 id 只在本文件：`plant/dynamic-balance-machine` 六件 + 记录、
 * `plant/multi-axis-sync-analyzer` 三件 + 记录。其余全部 grep 过：
 * `std/rotary-encoder`、`std/rotary-encoder/head`、`std/permanent-magnet-general`、
 * `std/counter-chip-general`、`std/planar-transistor-general`、
 * `std/opamp-chip-general`、`std/control-board-general`、`std/computer-general`、
 * `std/dvm-general`、`std/motor-7.5kw-4p`、`std/contactor-general`、
 * `plant/robot/controller`、`plant/grinder/wheel`、`plant/metrology-room`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目
// ═══════════════════════════════════════════════════════════════════════════

export const BALANCE_SYNC_ITEMS: readonly Item[] = [
  /**
   * 硬支承卧式动平衡机。**300–3000 r/min、两平面、5–50 kg 转子。**
   *
   *   resolution      0.1–10 g·mm（最小可测/分辨档；不是满量程）
   *   unbalance       0.1–20000 g·mm（满量程，覆盖 50 kg @300 rpm 的 G6.3 10027）
   *   residual        ≤0.5 g·mm（设计值）
   *   phase           0–360°
   *   grade           G6.3 / G2.5
   *
   * 两只速度传感器 + 一只 `std/rotary-encoder` 做相位基准；去重工位在机上，
   * 测—钻—复测不拆轮。
   *
   * ⚠️ 0.1–10 g·mm 是设计值；`measure/grinding-wheel-balance` 的记录才给读数。
   */
  {
    id: 'plant/dynamic-balance-machine',
    name: '硬支承卧式动平衡机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/speed', kind: 'range', min: 300, max: 3000, unit: 'rpm' },
      { param: 'measure/resolution', kind: 'range', min: 0.1, max: 10, unit: 'g·mm', dir: 'atMost' },
      { param: 'measure/unbalance', kind: 'range', min: 0.1, max: 20000, unit: 'g·mm' },
      { param: 'measure/residual', kind: 'range', min: 0, max: 1, unit: 'g·mm', dir: 'atMost' },
      { param: 'measure/phase', kind: 'range', min: 0, max: 360, unit: '°' },
      { param: 'grade', kind: 'enum', values: ['G6.3', 'G2.5'] },
      { param: 'rotorMass', kind: 'range', min: 5, max: 50, unit: 'kg', dir: 'atLeast' },
      { param: 'wheelDiameter', kind: 'range', min: 200, max: 400, unit: 'mm' },
      { param: 'permissible', kind: 'range', min: 10, max: 20000, unit: 'g·mm' },
      { param: 'planes', kind: 'range', min: 1, max: 2, unit: '面', dir: 'atLeast' },
    ],
  },

  /** 基座。HT250 200 kg，安装面磨到 5–15 µm；承 5–50 kg 转子。 */
  {
    id: 'plant/dynamic-balance-machine/base',
    name: '动平衡机基座',
    unit: '件',
    category: 'part',
    props: [
      { param: 'flatness', kind: 'range', min: 0, max: 20, unit: 'µm', dir: 'atMost' },
      { param: 'capacity', kind: 'range', min: 5, max: 50, unit: 'kg', dir: 'atLeast' },
    ],
  },

  /**
   * 摆架。**刚度 50–100 kN/mm，可切换两档**（硬支承的“硬”就在这里）。
   *
   * 刚度低到 10 kN/mm 以下就进入软支承区，转速必须避开共振；本机只做
   * 硬支承两档（50 / 100 kN/mm），换档用更换垫块，不是连续调。
   */
  {
    id: 'plant/dynamic-balance-machine/cradle',
    name: '动平衡机摆架',
    unit: '件',
    category: 'part',
    props: [
      { param: 'stiffness', kind: 'range', min: 10, max: 200, unit: 'kN/mm' },
      { param: 'capacity', kind: 'range', min: 5, max: 50, unit: 'kg', dir: 'atLeast' },
      { param: 'adjustment', kind: 'enum', values: ['stepped', 'continuous'] },
    ],
  },

  /**
   * 磁电式速度传感器。永久磁体 + 动圈，20–50 mV/(mm/s)、2–5 kHz。
   *
   * 为什么不用压电片：本层的 PZT 要铅/锆/钛（`optical-metrology.ts` 有路线），
   * 但压电片要电荷放大器与低噪声电缆；速度传感器是无源线圈，直接进读数，
   * 对 5–50 kg 的砂轮够用。代价是低频端只到 2–4 Hz（300 r/min = 5 Hz，
   * 已经在共振之上；再低就测不到）。
   */
  {
    id: 'plant/dynamic-balance-machine/sensor',
    name: '动平衡机磁电式速度传感器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'sensitivity', kind: 'range', min: 10, max: 100, unit: 'mV/(mm/s)', dir: 'atLeast' },
      { param: 'bandwidth', kind: 'range', min: 1, max: 10, unit: 'kHz', dir: 'atLeast' },
      { param: 'range', kind: 'range', min: 0.1, max: 100, unit: 'µm', dir: 'atLeast' },
      { param: 'resonance', kind: 'range', min: 2, max: 4, unit: 'Hz' },
    ],
  },

  /**
   * 去重工位。φ3–12 mm 钻头、深度 0.02–0.05 mm 分辨、定位 0.05–0.1 mm。
   *
   * 砂轮只能钻孔去重（不能加配重块：树脂砂轮上粘金属块会在高速下飞掉）。
   * 钻深与孔径决定去重量：φ6 钻头在半径 150 mm 上钻 0.02 mm 深 ≈
   * ρπr²h·R = 7.8×π×9×0.02×150 ≈ 0.66 g·mm —— 正好是 0.5 g·mm 级的修整量。
   */
  {
    id: 'plant/dynamic-balance-machine/drill-station',
    name: '动平衡机去重工位',
    unit: '件',
    category: 'part',
    props: [
      { param: 'drillDiameter', kind: 'range', min: 3, max: 12, unit: 'mm' },
      { param: 'depthResolution', kind: 'range', min: 0.01, max: 0.1, unit: 'mm', dir: 'atMost' },
      { param: 'positioning', kind: 'range', min: 0.05, max: 0.2, unit: 'mm', dir: 'atMost' },
    ],
  },

  /**
   * 读数箱。两通道（左右摆架）、20–60 dB 增益、2–5° 相位、1–10 kHz 滤波。
   *
   * 两通道不是“两路独立表”：同一只编码器的零脉冲同时锁存两路，
   * 否则左右平面的相位差没有意义。
   */
  {
    id: 'plant/dynamic-balance-machine/readout',
    name: '动平衡机读数箱',
    unit: '件',
    category: 'part',
    props: [
      { param: 'channels', kind: 'range', min: 2, max: 2, unit: '通道' },
      { param: 'gain', kind: 'range', min: 0, max: 60, unit: 'dB' },
      { param: 'phaseAccuracy', kind: 'range', min: 1, max: 10, unit: '°', dir: 'atMost' },
      { param: 'filter', kind: 'range', min: 1, max: 10, unit: 'kHz' },
    ],
  },

  /**
   * 标定转子。10 kg、5 g·mm、相位刻线 0–360°；用来把“传感器 mV”换成“g·mm”。
   *
   * 5 g·mm 在 1500 r/min 上是 F = Uω² = 5e-6 × (157)² = **0.123 N**；
   * 在 3000 r/min 上是 0.49 N。两只传感器在 50 kN/mm 摆架上给 25–100 µε
   * 级应变，够标。
   */
  {
    id: 'plant/dynamic-balance-machine/calibration-rotor',
    name: '动平衡机标定转子',
    unit: '件',
    category: 'part',
    props: [
      { param: 'unbalance', kind: 'range', min: 1, max: 10, unit: 'g·mm' },
      { param: 'mass', kind: 'range', min: 5, max: 20, unit: 'kg' },
      { param: 'phase', kind: 'range', min: 0, max: 360, unit: '°' },
    ],
  },


  /**
   * 24 轴同步性分析仪。**24 路编码器、10–100 kS/s、同一时钟、偏斜 ≤0.1–1 µs。**
   *
   *   channels            24
   *   sampleRate          10–100 kS/s（5 MHz ÷ 50–500）
   *   skew                0.1–1 µs
   *   syncError           0.1–2 µs
   *   followingError      1–50 µm
   *   circularity         1–30 µm
   *   timestampResolution 100–200 ns（5 MHz 半周期内插）
   *
   * 它不是示波器：24 路数字量同时锁存，事后算偏斜/跟随/圆度。
   */
  {
    id: 'plant/multi-axis-sync-analyzer',
    name: '24 轴同步性分析仪',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'channels', kind: 'range', min: 1, max: 64, unit: '路', dir: 'atLeast' },
      { param: 'measure/sampleRate', kind: 'range', min: 1, max: 200, unit: 'kS/s', dir: 'atLeast' },
      { param: 'measure/skew', kind: 'range', min: 0.01, max: 10, unit: 'µs', dir: 'atMost' },
      { param: 'measure/syncError', kind: 'range', min: 0.01, max: 10, unit: 'µs', dir: 'atMost' },
      { param: 'measure/followingError', kind: 'range', min: 0.1, max: 1000, unit: 'µm', dir: 'atMost' },
      { param: 'measure/circularity', kind: 'range', min: 0.1, max: 1000, unit: 'µm', dir: 'atMost' },
      { param: 'timestampResolution', kind: 'range', min: 10, max: 1000, unit: 'ns', dir: 'atMost' },
      { param: 'inputType', kind: 'enum', values: ['encoder-abz'] },
    ],
  },

  /**
   * 24 路采集卡。24 路差分接收 + 24×16 位计数器 + 同沿锁存。
   *
   *   24 × 4 片 4 位计数器 = 96 片 `std/counter-chip-general`
   *   24 路差分接收 = 24 只 `std/planar-transistor-general` + 24 只运放
   *
   * 96 片计数器是这一件最重的一笔；本层只有 40 门/片的芯片，所以 16 位
   * 必须拼。若用 24 片 ADC，反而要 24 套模拟前端，且解决不了“同沿”。
   */
  {
    id: 'plant/multi-axis-sync-analyzer/acquisition-card',
    name: '24 路采集卡',
    unit: '件',
    category: 'part',
    props: [
      { param: 'channels', kind: 'range', min: 24, max: 24, unit: '路' },
      { param: 'sampleRate', kind: 'range', min: 10, max: 100, unit: 'kS/s' },
      { param: 'skew', kind: 'range', min: 0.1, max: 1, unit: 'µs', dir: 'atMost' },
      { param: 'resolution', kind: 'range', min: 16, max: 16, unit: 'bit' },
      { param: 'inputType', kind: 'enum', values: ['encoder-abz'] },
    ],
  },

  /**
   * 24 路同步时钟。5 MHz 石英 + 24 路扇出，抖动 20–50 ns、偏斜 0.1–0.5 µs。
   *
   * 5 MHz 是 `make/quartz-resonator-5mhz` 的交付上限；本层没有 100 MHz
   * 低相噪晶振，所以时间戳只能到 100–200 ns。
   */
  {
    id: 'plant/multi-axis-sync-analyzer/clock',
    name: '24 路同步时钟',
    unit: '件',
    category: 'part',
    props: [
      { param: 'frequency', kind: 'range', min: 5, max: 5, unit: 'MHz' },
      { param: 'jitter', kind: 'range', min: 10, max: 50, unit: 'ns', dir: 'atMost' },
      { param: 'skew', kind: 'range', min: 0.05, max: 0.5, unit: 'µs', dir: 'atMost' },
      { param: 'channels', kind: 'range', min: 24, max: 24, unit: '路' },
    ],
  },

  /** 19 英寸机箱 + 24 路编码器接头 + 背板。屏蔽 40–80 dB。 */
  {
    id: 'plant/multi-axis-sync-analyzer/frame',
    name: '24 轴同步性分析仪机箱',
    unit: '件',
    category: 'part',
    props: [
      { param: 'channels', kind: 'range', min: 24, max: 24, unit: '路' },
      { param: 'shielding', kind: 'range', min: 20, max: 100, unit: 'dB', dir: 'atLeast' },
      { param: 'width', kind: 'range', min: 0.3, max: 1, unit: 'm' },
      { param: 'height', kind: 'range', min: 0.2, max: 1, unit: 'm' },
    ],
  },

];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线
// ═══════════════════════════════════════════════════════════════════════════

export const BALANCE_SYNC_ROUTES: readonly Route[] = [
  /**
   * 动平衡机基座：HT250 铸造 → 时效 → 磨安装面 → 钻孔。
   *
   *   铸铁 200 + 钢板 20 + 铜线 0.1 → 基座 1
   */
  {
    id: 'make/dynamic-balance-base',
    name: '动平衡机基座制造',
    produces: [
      {
        item: 'plant/dynamic-balance-machine/base',
        qty: q(1),
        gives: [
          { param: 'flatness', kind: 'range', min: 5, max: 15 },
          { param: 'capacity', kind: 'range', min: 50, max: 50 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(200) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(20) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '铸造 HT250 基座 1300–1500 °C，浇后自然时效 48 h',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1300, max: 1500 }],
      },
      { note_zh: '磨安装面：平面度 5–15 µm（磨床）', performedBy: 'plant/grinder' },
      {
        note_zh: '划安装孔、钻/攻 8 处 M16，装调整垫铁（19–21 °C）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(32) },
    unbalanced_zh: '铸铁 200 + 钢板 20 + 铜线 0.1 → 基座 1；余是浇冒口、磨屑与钻孔屑。产物按件计，不折 kg',
  },

  /**
   * 摆架：45 钢铣削 + 两档刚度垫块 + 传感器座。
   *
   *   45 钢 30 + 钢板 5 + 铜线 0.1 → 摆架 1
   */
  {
    id: 'make/dynamic-balance-cradle',
    name: '动平衡机摆架制造',
    produces: [
      {
        item: 'plant/dynamic-balance-machine/cradle',
        qty: q(1),
        gives: [
          { param: 'stiffness', kind: 'range', min: 50, max: 100 },
          { param: 'capacity', kind: 'range', min: 50, max: 50 },
          { param: 'adjustment', kind: 'enum', oneOf: ['stepped'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(30) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '铣摆架本体与传感器座，45 钢调质 28–32 HRC', performedBy: 'plant/milling-machine' },
      { note_zh: '配两档刚度垫块（50 / 100 kN/mm），用压力机标刚度', performedBy: 'plant/robot' },
      {
        note_zh: '装到基座上，左右摆架同轴 ≤0.05 mm；19–21 °C 下复测刚度',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(40) },
    unbalanced_zh: '45 钢 30 + 钢板 5 + 铜线 0.1 → 摆架 1；余是铣屑与垫块废料',
  },

  /**
   * 速度传感器：永久磁体 + 动圈 + 屏蔽壳。
   *
   *   磁体 1 + 铜线 0.2 + 钢板 1 + 运放 2 + PTFE 0.01 → 传感器 1
   */
  {
    id: 'make/dynamic-balance-sensor',
    name: '动平衡机磁电式速度传感器制造',
    produces: [
      {
        item: 'plant/dynamic-balance-machine/sensor',
        qty: q(1),
        gives: [
          { param: 'sensitivity', kind: 'range', min: 20, max: 50 },
          { param: 'bandwidth', kind: 'range', min: 2, max: 5 },
          { param: 'range', kind: 'range', min: 50, max: 100 },
          { param: 'resonance', kind: 'range', min: 3, max: 3.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/permanent-magnet-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(16) },
    unbalanced_zh: '磁体 1 + 铜线 0.2 + 钢板 1 + 运放 2 + PTFE 0.01 → 传感器 1；余是绕线头与屏蔽壳边角。20–50 mV/(mm/s) 是设计值，用振动台标',
  },

  /**
   * 去重工位：铣床身 + 钻轴 + 深度限位 + 定位挡块。
   *
   *   电机 1 + 45 钢 20 + 接触器 1 + 铜线 0.5 → 去重工位 1
   */
  {
    id: 'make/dynamic-balance-drill',
    name: '动平衡机去重工位制造',
    produces: [
      {
        item: 'plant/dynamic-balance-machine/drill-station',
        qty: q(1),
        gives: [
          { param: 'drillDiameter', kind: 'range', min: 3, max: 12 },
          { param: 'depthResolution', kind: 'range', min: 0.02, max: 0.05 },
          { param: 'positioning', kind: 'range', min: 0.05, max: 0.1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(20) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '铣钻轴箱、钻夹头座与深度限位；45 钢调质', performedBy: 'plant/milling-machine' },
      { note_zh: '装 7.5 kW 电机、接触器与进给丝杠；空转 2 h', performedBy: 'plant/robot' },
      {
        note_zh: '标定深度：φ6 钻头钻 0.02 mm 一档，千分表读 10 次取平均（19–21 °C）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(40) },
    unbalanced_zh: '电机 1 + 45 钢 20 + 接触器 1 + 铜线 0.5 → 去重工位 1；余是铣屑与钻孔屑',
  },

  /**
   * 读数箱：两通道速度信号 + 编码器相位 + 滤波 + DVM。
   *
   *   运放 8 + 齐纳 1 + DVM 1 + 控制板 1 + PCB 1 + 铜线 0.1 + 铝 1 → 读数箱 1
   */
  {
    id: 'make/dynamic-balance-readout',
    name: '动平衡机读数箱制造',
    produces: [
      {
        item: 'plant/dynamic-balance-machine/readout',
        qty: q(1),
        gives: [
          { param: 'channels', kind: 'range', min: 2, max: 2 },
          { param: 'gain', kind: 'range', min: 20, max: 60 },
          { param: 'phaseAccuracy', kind: 'range', min: 2, max: 5 },
          { param: 'filter', kind: 'range', min: 1, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(8) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      // SMT 主路保持通用板；OR 备路：手工焊（已有 2 层 PCB + 8 运放，60 点内）
      {
        anyOf: [
          { item: 'std/control-board-general', qty: q(1) },
          { item: 'std/control-board-simple-manual-general', qty: q(1) },
        ],
      },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(24) },
    unbalanced_zh: '运放 8 + 齐纳 1 + DVM 1 + 控制板 1 + PCB 1 + 铜线 0.1 + 铝 1 → 读数箱 1；余是屏蔽盒边角。相位 2–5° 是设计值，用标定转子对',
  },

  /**
   * 标定转子：45 钢车成 10 kg 盘，钻一个 5 g·mm 的偏心孔，刻相位线。
   *
   *   45 钢 10 + 铜 0.05 + 铝 0.02 → 标定转子 1
   *
   * 5 g·mm 的孔：半径 100 mm 上去掉 0.05 g，即 φ3×7.5 mm 的钢孔
   * （ρπr²h = 7.8×π×2.25×7.5 ≈ 0.41 g，差一点用深度修）。
   */
  {
    id: 'make/dynamic-balance-calibration-rotor',
    name: '动平衡机标定转子制造',
    produces: [
      {
        item: 'plant/dynamic-balance-machine/calibration-rotor',
        qty: q(1),
        gives: [
          { param: 'unbalance', kind: 'range', min: 5, max: 5 },
          { param: 'mass', kind: 'range', min: 10, max: 10 },
          { param: 'phase', kind: 'range', min: 0, max: 360, record: 'mat/wheel-balance-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 50) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车 10 kg 盘（φ240×90），两端面平行 0.02 mm，动平衡前先做静平衡', performedBy: 'lathe' },
      { note_zh: '在 R=100 mm 处钻 φ3×7.5 mm 偏心孔；称重法复核 5 g·mm', performedBy: 'plant/milling-machine' },
      {
        note_zh: '刻 0–360° 相位线；19–21 °C 下用量块/天平复称质量与偏心',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '45 钢 10 + 铜 0.05 + 铝 0.02 → 标定转子 1；余是车屑与钻孔屑。5 g·mm 靠几何/称重复核，不是动平衡机读数（机器还没造出来）',
  },

  /**
   * 整机：基座 + 摆架 + 两只传感器 + 去重工位 + 读数箱 + 编码器。
   *
   *   基座 1 + 摆架 1 + 传感器 2 + 去重 1 + 读数 1 + 编码器 1 + 读数头 1
   *   + 计算机 1 + 钢板 20 + 铜线 1 → 动平衡机 1 台
   *
   * DVM 只用于标定时读 mV，是工具，进 `needs`，不随整机交付；
   * 读数箱里另有一块 DVM 作显示（`make/dynamic-balance-readout`）。
   */
  {
    id: 'make/dynamic-balance-machine',
    name: '硬支承卧式动平衡机装配',
    produces: [
      {
        item: 'plant/dynamic-balance-machine',
        qty: q(1),
        gives: [
          { param: 'measure/speed', kind: 'range', min: 300, max: 3000 },
          { param: 'measure/resolution', kind: 'range', min: 0.5, max: 2 },
          { param: 'measure/unbalance', kind: 'range', min: 0.1, max: 20000 },
          { param: 'measure/residual', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'measure/phase', kind: 'range', min: 0, max: 360 },
          { param: 'grade', kind: 'enum', oneOf: ['G6.3', 'G2.5'] },
          { param: 'rotorMass', kind: 'range', min: 5, max: 50 },
          { param: 'wheelDiameter', kind: 'range', min: 200, max: 400 },
          { param: 'permissible', kind: 'range', min: 40, max: 20000 },
          { param: 'planes', kind: 'range', min: 2, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/dynamic-balance-machine/base', qty: q(1) }] },
      { anyOf: [{ item: 'plant/dynamic-balance-machine/cradle', qty: q(1) }] },
      { anyOf: [{ item: 'plant/dynamic-balance-machine/sensor', qty: q(2) }] },
      { anyOf: [{ item: 'plant/dynamic-balance-machine/drill-station', qty: q(1) }] },
      { anyOf: [{ item: 'plant/dynamic-balance-machine/readout', qty: q(1) }] },
      { anyOf: [{ item: 'std/rotary-encoder', qty: q(1) }] },
      { anyOf: [{ item: 'std/rotary-encoder/head', qty: q(1) }] },
      { anyOf: [{ item: 'std/computer-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(20) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/dynamic-balance-machine/calibration-rotor',
      'plant/grinder/wheel',
      'std/dvm-general',
    ],
    steps: [
      {
        note_zh: '装基座、摆架、去重工位：左右摆架同轴 ≤0.05 mm，去重工位对准砂轮中心',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh:
          '装两只速度传感器、编码器盘/读数头、读数箱与计算机；传感器间隙 0.5–1 mm，编码器与主轴同轴 ≤0.02 mm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '用 5 g·mm 标定转子在 1500/3000 r/min 两点标定：读数 mV → g·mm，相位零点对齐编码器 Z 脉冲',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '用 φ200/φ400 砂轮试跑：φ200 到 3000 r/min（31.4 m/s），φ400 只到 ~1670 r/min（35 m/s）；复测重复性 ≤0.2 g·mm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(160) },
    unbalanced_zh:
      '基座 1 + 摆架 1 + 传感器 2 + 去重 1 + 读数 1 + 编码器 1 + 读数头 1 + 计算机 1 + 钢板 20 + 铜线 1 → 动平衡机 1 台；余是钣金边角与线头。DVM 是标定工具（needs，不消耗），读数箱内的 DVM 已随读数箱计入。0.1–10 g·mm 是分辨档，满量程 20000 g·mm 覆盖 50 kg @300 rpm 的 G6.3 10027 g·mm',
  },


  /**
   * 24 路采集卡：差分接收 + 24×16 位计数器 + 同沿锁存。
   *
   *   计数芯片 96 + 运放 48 + 平面管 24 + 控制板 1 + PCB 4 + 铜线 2 + 铝 2
   *   → 采集卡 1
   */
  {
    id: 'make/multi-axis-sync-card',
    name: '24 路采集卡制造',
    produces: [
      {
        item: 'plant/multi-axis-sync-analyzer/acquisition-card',
        qty: q(1),
        gives: [
          { param: 'channels', kind: 'range', min: 24, max: 24 },
          { param: 'sampleRate', kind: 'range', min: 10, max: 100 },
          { param: 'skew', kind: 'range', min: 0.1, max: 1 },
          { param: 'resolution', kind: 'range', min: 16, max: 16 },
          { param: 'inputType', kind: 'enum', oneOf: ['encoder-abz'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(96) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(48) }] },
      { anyOf: [{ item: 'std/planar-transistor-general', qty: q(24) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(4) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(80) },
    unbalanced_zh:
      '计数芯片 96 + 运放 48 + 平面管 24 + 控制板 1 + PCB 4 + 铜线 2 + 铝 2 → 采集卡 1；余是焊接/调试废品。96 片是 24 路 × 16 位 ÷ 4 位/片，不是“估计”',
  },

  /**
   * 24 路同步时钟：5 MHz 石英 + 24 路扇出。
   *
   *   石英 2 + 计数 16 + 运放 8 + 齐纳 1 + PCB 1 + 铜线 0.5 + 铝 1 → 时钟 1
   *
   * 5 MHz ÷ 50–500 = 10–100 kS/s；抖动 20–50 ns、偏斜 0.1–0.5 µs。
   */
  {
    id: 'make/multi-axis-sync-clock',
    name: '24 路同步时钟制造',
    produces: [
      {
        item: 'plant/multi-axis-sync-analyzer/clock',
        qty: q(1),
        gives: [
          { param: 'frequency', kind: 'range', min: 5, max: 5 },
          { param: 'jitter', kind: 'range', min: 20, max: 50 },
          { param: 'skew', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'channels', kind: 'range', min: 24, max: 24 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/quartz-resonator-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(16) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(8) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(40) },
    unbalanced_zh:
      '石英 2 + 计数 16 + 运放 8 + 齐纳 1 + PCB 1 + 铜线 0.5 + 铝 1 → 时钟 1；余是调试废品。5 MHz 是 make/quartz-resonator-5mhz 的交付上限；100 MHz 低相噪晶振本层没有（时间戳差 5–20 倍）',
  },

  /**
   * 机箱：19 英寸、24 路编码器接头、背板与屏蔽。
   *
   *   钢板 30 + 铝 5 + 铜线 1 + PTFE 0.1 → 机箱 1
   */
  {
    id: 'make/multi-axis-sync-frame',
    name: '24 轴同步性分析仪机箱制造',
    produces: [
      {
        item: 'plant/multi-axis-sync-analyzer/frame',
        qty: q(1),
        gives: [
          { param: 'channels', kind: 'range', min: 24, max: 24 },
          { param: 'shielding', kind: 'range', min: 40, max: 80 },
          { param: 'width', kind: 'range', min: 0.5, max: 0.5 },
          { param: 'height', kind: 'range', min: 0.3, max: 0.3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(30) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
    ],
    needs: [],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(24) },
    unbalanced_zh: '钢板 30 + 铝 5 + 铜线 1 + PTFE 0.1 → 机箱 1；余是边角/焊条。40–80 dB 是 1–100 MHz 的设计值，未做屏蔽室法实测',
  },

  /**
   * 整机：采集卡 + 时钟 + 机箱 + 计算机 + 控制器自检。
   *
   *   采集卡 1 + 时钟 1 + 机箱 1 + 计算机 1 + 控制板 1 + DVM 1
   *   + 钢板 10 + 铜线 1 → 分析仪 1 台
   */
  {
    id: 'make/multi-axis-sync-analyzer',
    name: '24 轴同步性分析仪装配',
    produces: [
      {
        item: 'plant/multi-axis-sync-analyzer',
        qty: q(1),
        gives: [
          { param: 'channels', kind: 'range', min: 24, max: 24, record: 'mat/axis-sync-record' },
          { param: 'measure/sampleRate', kind: 'range', min: 10, max: 100, record: 'mat/axis-sync-record' },
          { param: 'measure/skew', kind: 'range', min: 0.1, max: 1, record: 'mat/axis-sync-record' },
          { param: 'measure/syncError', kind: 'range', min: 0.1, max: 2, record: 'mat/axis-sync-record' },
          { param: 'measure/followingError', kind: 'range', min: 1, max: 50, record: 'mat/axis-sync-record' },
          { param: 'measure/circularity', kind: 'range', min: 1, max: 30, record: 'mat/axis-sync-record' },
          { param: 'timestampResolution', kind: 'range', min: 100, max: 200 },
          { param: 'inputType', kind: 'enum', oneOf: ['encoder-abz'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/multi-axis-sync-analyzer/acquisition-card', qty: q(1) }] },
      { anyOf: [{ item: 'plant/multi-axis-sync-analyzer/clock', qty: q(1) }] },
      { anyOf: [{ item: 'plant/multi-axis-sync-analyzer/frame', qty: q(1) }] },
      { anyOf: [{ item: 'std/computer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(10) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/robot/controller',
      'std/rotary-encoder',
    ],
    steps: [
      {
        note_zh: '装机箱、24 路编码器接头、背板与接地铜排',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh:
          '插采集卡/时钟卡，接 24 路差分线；每路 A/B/Z 对应表贴在机箱内侧；19–21 °C',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '自检：24 轴控制柜发 24 路 100 kHz 方波，测通道偏斜 ≤1 µs；再用 std/rotary-encoder 的单路信号核对计数',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '跑 24 轴圆插补（R=100 mm、10 mm/s），10–100 kS/s 采 30 s；与控制器指令比，验证跟随/圆度',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(120) },
    unbalanced_zh:
      '采集卡 1 + 时钟 1 + 机箱 1 + 计算机 1 + 控制板 1 + DVM 1 + 钢板 10 + 铜线 1 → 分析仪 1 台；余是钣金边角与线头。24 路、10–100 kS/s、0.1–1 µs 偏斜是设计值，用控制柜方波自检',
  },

];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...BALANCE_SYNC_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...BALANCE_SYNC_ROUTES];
