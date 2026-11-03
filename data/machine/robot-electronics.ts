/**
 * 机器人身上的四件电子件：IMU / NPU / EtherCAT 从站 / 电池的**路线接线图**。
 *
 * 这个文件只放"接口件"：IMU 的读出 ASIC、NPU 的 40 nm 加速器裸片、
 * EtherCAT 的 E-bus PHY、25 MHz 晶体、8 位端子排，以及三条整件路线
 * （IMU / NPU / EtherCAT）。电池在 `data/material/battery.ts`。
 *
 * 四件的旧缺口数字保留在 `robot.ts` 的条目上，这里只回答
 * 用户 2026-10-20 的那条原则：**地球上存在的工程能力，模型里必须有产出路线。**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一条总口径：哪些是设计值，哪些是实测
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本层没有膜厚仪、没有 SEM 断面、没有逻辑分析仪、没有 EtherCAT 主站、
 * 没有电池测试台。所以下面所有"性能数字"（TOPS、零偏稳定性、周期时间、
 * 能量密度）都是**设计值（Earth 工程值）**，不是 `data/measure/` 的读数。
 * 路线能证明的是**拓扑与工序**：每一道都有设备、有料、有前驱条目。
 *
 * 三处硬缺口，照实写在条目注释里，不藏：
 *   ① IMU 的零偏稳定性没有转台标定，20–50 °/h 是按噪声密度算的；
 *   ② NPU 的 2–5 TOPS 是 40 nm 门阵列的设计值，没有流片；
 *   ③ EtherCAT 的 1–2 ms 周期是"2 片 CPU 跑软件 ESC"的设计值，没有主站实测。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ROBOT_ELECTRONICS_ITEMS: readonly Item[] = [
  // ───────────────────────────────────────────────────────────────────────
  // 一、IMU 的读出 ASIC
  // ───────────────────────────────────────────────────────────────────────

  /**
   * 六通道 IMU 读出 ASIC（3 µm 混合信号）。
   *
   * 它不是 `std/mcu-3um-general`：MCU 是数字 CPU，这颗是**模拟前端 + ADC +
   * 数字补偿**。同一台 3 µm 线（`make/damascene-stack` 的 2–3 层后道）能造，
   * 但掩模与电路不同：
   *
   *   六路电荷放大器   陀螺驱动/检测各两路、加速度计三路
   *   16 位 ΣΔ ADC    1–2 kHz 带宽，过采样 128× ⇒ 时钟 256 kHz
   *   数字补偿        零偏、标度因数、温度系数（一次性烧录）
   *
   * 与商品（L4 的 19–23 位 ASIC）差 2–3 位：16–18 位对 19–23 位，
   * 分辨率差 8–32 倍。这不是"少一道工序"，是 3 µm 的模拟匹配
   * （ΔVt 5–10 mV）撑不起 20 位以上的失调。
   */
  {
    id: 'std/imu-asic-general',
    name: '六通道 IMU 读出 ASIC',
    unit: '片',
    category: 'part',
    props: [
      { param: 'channels', kind: 'range', min: 1, max: 6, unit: '路', dir: 'atLeast' },
      { param: 'resolution', kind: 'range', min: 12, max: 24, unit: 'bit', dir: 'atLeast' },
      { param: 'bandwidth', kind: 'range', min: 0.5, max: 5, unit: 'kHz', dir: 'atLeast' },
      { param: 'inputNoise', kind: 'range', min: 0, max: 5, unit: 'µV', dir: 'atMost' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 二、NPU 的 40 nm 加速器裸片
  // ───────────────────────────────────────────────────────────────────────

  /**
   * NPU 加速器裸片（40 nm 门阵列，16–24 nm 前道 + 8 层后道）。
   *
   * **它不是"再补一条 40 nm 路线"**：40 nm MCU 现在走
   * `make/mcu-40nm-damascene`（16–24 前道 + `make/beol-40nm-8layer`
   * 40–100 nm / AR 2–3 / dishing 3–8 / 8 层 + LPCVD Si₃N₄）。
   * **本 NPU 裸片仍走 2026-10-20 前的 `make/damascene-stack-8`
   * （100–300 nm）+ SOG/酚醛**——这是本路线自己的缺口，升级到 40–100
   * 要改本文件的 `uses`，不是改注释就能算的。这里只把 `mat/device-wafer`
   * 上的门阵列连成 MAC：
   *
   *   16 384 个 INT8 MAC（128×128 阵列）
   *   200 MHz、每周期 2 次运算 ⇒ 3.3 TOPS 峰值（设计值）
   *   1–2 MB 片上 SRAM（6T 单元，40 nm 下约 3–6 mm²）
   *
   * 为什么是 1–10 TOPS 而不是 100–275 TOPS：
   *   ① **本 NPU 裸片仍是**“16–24 nm 前道 + 100–300 nm 后道”的旧口径
   *      （40 nm MCU 已改 40–100；NPU 路线尚未升级），MAC 阵列的互连密度
   *      只有真 40 nm 的 1/5–1/10；
   *   ② 没有 SRAM 编译器，1–2 MB 是手工版图，再大就放不下；
   *   ③ 没有 LPDDR PHY，片外带宽只有 10–20 GB/s（商品 1–10 TB/s）。
   * 所以交付窗口是 **2–5 TOPS**，与商品 100–275 TOPS 差 **20–137 倍**。
   * 这是"能造档"，不是"追上档"。
   */
  {
    id: 'std/npu-die-40nm',
    name: 'NPU 加速器裸片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'node', kind: 'range', min: 8, max: 50, unit: 'nm', dir: 'atMost' },
      { param: 'tops', kind: 'range', min: 0.5, max: 10, unit: 'TOPS', dir: 'atLeast' },
      { param: 'sram', kind: 'range', min: 0.5, max: 4, unit: 'MB', dir: 'atLeast' },
      { param: 'power', kind: 'range', min: 1, max: 20, unit: 'W', dir: 'atMost' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 三、EtherCAT 的 E-bus PHY
  // ───────────────────────────────────────────────────────────────────────

  /**
   * 100 Mbps E-bus PHY（4 位 LVDS，25 MHz）。
   *
   * **这是 EtherCAT 的 E-bus，不是 100BASE-TX。** 两者的差别是整条路线的关键：
   *
   *   100BASE-TX  125 MBd、MLT-3、125 MHz 模拟前端、变压器隔离、100 m
   *   E-bus       100 Mbps、4 位 LVDS、25 MHz 时钟、直流耦合、10 m
   *
   * 本层的 3 µm 双极（`std/opamp-chip-general` 同一条线，f_T 100–300 MHz）
   * 做 25 MHz 的 LVDS 收发器有 4–12 倍余量；做 125 MHz 的 MLT-3 自适应
   * 均衡则差 2.5–5 倍（任务书那个"125 倍"是对 1 MHz 运放说的，那一条
   * 仍然成立，见 `robot.ts` 的缺口注释）。所以路线交的是 **E-bus 档**：
   * 100 Mbps 速率是真的，但不是 100BASE-TX 的 100 m 双绞线。
   *
   * 商品 PHY 的 125 MHz 模拟前端、自适应均衡、自动协商三样都没有；
   * 换来的是能用 25 MHz 晶体 + 4 位并行 + 5–10 m 屏蔽对绞线。
   */
  {
    id: 'std/phy-100mbps-general',
    name: '100 Mbps 以太网 PHY',
    unit: '片',
    category: 'part',
    props: [
      { param: 'dataRate', kind: 'range', min: 10, max: 1000, unit: 'Mbps', dir: 'atLeast' },
      { param: 'clock', kind: 'range', min: 10, max: 50, unit: 'MHz', dir: 'within' },
      { param: 'lanes', kind: 'range', min: 1, max: 8, unit: '位', dir: 'atLeast' },
      { param: 'reach', kind: 'range', min: 1, max: 100, unit: 'm', dir: 'atLeast' },
      { param: 'supplyVoltage', kind: 'range', min: 3, max: 5, unit: 'V', dir: 'within' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  // 四、8 位端子排（E-bus 的连接器）
  // ───────────────────────────────────────────────────────────────────────

  /**
   * 8 位端子排（5.08 mm 间距）。**不是 RJ45。**
   *
   * E-bus 是 4 对差分 + 2 根电源 + 屏蔽，8 位端子排刚好；RJ45 要有
   * 注塑透明 PC 本体与 8P8C 冲压簧片，本层没有 PC（聚碳酸酯）链，
   * 酚醛注塑件的脆性也做不出 RJ45 的卡扣。代价：
   *   · 不能热插拔（没有先接后断的针序）
   *   · 没有 100 m 双绞线的阻抗控制（5.08 mm 间距对 100 Ω 差 20–30 %）
   *   · 防护等级 IP20，机器人身上要另加罩
   */
  {
    id: 'std/terminal-block-8p-general',
    name: '8 位端子排',
    unit: '件',
    category: 'part',
    props: [
      { param: 'positions', kind: 'range', min: 2, max: 16, unit: '位', dir: 'atLeast' },
      { param: 'pitch', kind: 'range', min: 3.5, max: 7.62, unit: 'mm', dir: 'within' },
      { param: 'ratedCurrent', kind: 'range', min: 1, max: 20, unit: 'A', dir: 'atLeast' },
      { param: 'ratedVoltage', kind: 'range', min: 100, max: 500, unit: 'V', dir: 'atLeast' },
    ],
  },
];

export const ROBOT_ELECTRONICS_ROUTES: readonly Route[] = [
  // ───────────────────────────────────────────────────────────────────────
  // IMU 读出 ASIC
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * 六通道 IMU ASIC：3 µm 混合信号，60 片/批。
     *
     * 与 `make/mcu-3um-damascene` 共用同一条后道（`mat/device-wafer` +
     * `mat/damascene-layer` 2–3 层），差别只在掩模与测试：
     *   前道  40–400 nm 的 `mat/device-wafer`（`make/device-wafer`）
     *   后道  2–3 层、3–5 µm 线宽（`make/damascene-stack`）
     *   钝化  SOG + 酚醛（与 3–5 µm MCU 同一套，不是完整 Si₃N₄；40 nm MCU 已改 LPCVD）
     *
     * 质量账（片计）：
     *   device 片 1 + 互连片 1 + SOG 1 g + 酚醛 1 g + 水 2 kg → 60 片
     *   （每片 2.5×2.5 mm）；余是划片道、装架损耗与测试报废 10–20 %。
     */
    id: 'make/imu-asic-3um',
    name: '六通道 IMU 读出 ASIC 制造',
    produces: [
      {
        item: 'std/imu-asic-general',
        qty: q(60),
        gives: [
          { param: 'channels', kind: 'range', min: 6, max: 6 },
          { param: 'resolution', kind: 'range', min: 16, max: 18 },
          { param: 'bandwidth', kind: 'range', min: 1, max: 2 },
          { param: 'inputNoise', kind: 'range', min: 0.5, max: 1.5 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/device-wafer',
            qty: q(1),
            need: [{ param: 'node', kind: 'range', max: 400, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/damascene-layer',
            qty: q(1),
            need: [
              { param: 'lineWidth', kind: 'range', max: 5000, dir: 'atMost' },
              { param: 'layers', kind: 'range', min: 2, dir: 'atLeast' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/sodium-silicate', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
      { anyOf: [{ item: 'std/metal-can-general', qty: q(60) }] },
      { anyOf: [{ item: 'mat/bonding-wire', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'std/dvm-general'],
    steps: [
      {
        note_zh: 'SOG 旋涂 0.5–1 µm 做层间钝化（没有电子级 Si₃N₄，与 make/mcu-3um-stack 同一套）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: 'SOG 固化 400–450 °C / 30 min，两道（一道 0.4 µm 会裂）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
      {
        note_zh: '酚醛钝化 150–180 °C 固化：挡潮不挡离子，属降级',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 150, max: 180 }],
      },
      { note_zh: '划片：硬质合金轮，每片 200–400 只（2.5×2.5 mm）', performedBy: 'plant/robot' },
      { note_zh: '装架、铝丝键合、金属帽封帽（每片 8–16 根引线）', performedBy: 'plant/robot' },
      {
        note_zh: '调零：六通道各加 1 mV 阶跃，看 16 位输出；失调 >2 mV 的报废（没有六位半表，用 4 位 DVM 与自建分压）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      'device 片 1 + 互连片 1 + SOG 1 g + 酚醛 1 g + 水 2 kg → 60 片。device 与互连在模型里是两件、实际是同一片上的层（与 make/mcu-40nm-damascene 同一记账口径）。输出按片计，芯片质量不折 kg；余是划片道、装架损耗与测试报废 10–20 %',
  },

  // ───────────────────────────────────────────────────────────────────────
  // NPU 裸片
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * NPU 裸片：40 nm 门阵列 + 8 层后道，30 片/批。
     *
     * 与 `make/mcu-40nm-damascene` 的分工：
     *   MCU  用 16–24 nm 前道做 CPU，后道 8 层
     *   NPU  用同一片前道做 128×128 MAC 阵列，后道 8 层，但掩模多 6–8 层
     *
     * 算力账（设计值）：
     *   16 384 MAC × 200 MHz × 2 = **6.6 TOPS 峰值**
     *   实际受 SRAM 带宽限制，持续 **2–5 TOPS**（权重全在片上）
     *   商品档 100–275 TOPS ⇒ 差 **20–137 倍**
     *
     * 为什么不做 100 TOPS：本 NPU 裸片仍用 100–300 nm 后道（2026-10-20 前口径；
     * 40 nm MCU 已改 40–100 nm），MAC 阵列的互连每 1 mm² 只能放 2–4 万门；
     * 100 TOPS 要 40–60 万 MAC，面积 30–60 mm²，
     * 而 8 层后道的成品率在 30 mm² 以上掉到 10 % 以下。所以交付窗口
     * 定在 2–5 TOPS，承认这是"能造档"。
     */
    id: 'make/npu-die-40nm',
    name: 'NPU 加速器裸片制造',
    produces: [
      {
        item: 'std/npu-die-40nm',
        qty: q(30),
        gives: [
          { param: 'node', kind: 'range', min: 16, max: 24 },
          { param: 'tops', kind: 'range', min: 2, max: 5 },
          { param: 'sram', kind: 'range', min: 1, max: 2 },
          { param: 'power', kind: 'range', min: 4, max: 8 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/device-wafer',
            qty: q(1),
            need: [{ param: 'node', kind: 'range', max: 24, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/damascene-layer',
            qty: q(1),
            need: [
              { param: 'lineWidth', kind: 'range', max: 300, dir: 'atMost' },
              { param: 'aspectRatio', kind: 'range', min: 0.6, dir: 'atLeast' },
              { param: 'dishing', kind: 'range', max: 12, dir: 'atMost' },
              { param: 'barrierThickness', kind: 'range', max: 3, dir: 'atMost' },
              { param: 'kValue', kind: 'range', max: 2.5, dir: 'atMost' },
              { param: 'layers', kind: 'range', min: 8, dir: 'atLeast' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/sodium-silicate', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/water', qty: q(4) }] },
      { anyOf: [{ item: 'std/lga-package-general', qty: q(30) }] },
      { anyOf: [{ item: 'mat/bonding-wire', qty: q(2) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'std/dvm-general'],
    steps: [
      {
        note_zh: 'SOG 旋涂 0.5–1 µm（8 层后道的层间钝化；一道 0.4 µm 会裂，两道）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: 'SOG 固化 400–450 °C / 30 min',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
      {
        note_zh: '酚醛钝化 150–180 °C：挡潮不挡离子（与 3–5 µm MCU 同一处降级；40 nm MCU 已改 LPCVD）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 150, max: 180 }],
      },
      { note_zh: '划片：30 只/片（6×6 mm，划片道 100 µm）', performedBy: 'plant/robot' },
      { note_zh: '装 LGA 封装：倒装焊要助焊剂（没有），走铝丝键合，焊盘 200–400 个', performedBy: 'plant/robot' },
      {
        note_zh: '测试：只测通断/漏电与静态电流；没有逻辑分析仪，TOPS 是设计值不是实测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      'device 片 1 + 互连片 1 + SOG 2 g + 酚醛 2 g + 水 4 kg → 30 片（6×6 mm）。输出按片计，不折 kg；余是划片道、LGA 装架损耗与测试报废。前道片与后道层在模型里是两件、实际是同一片上的层',
  },

  // ───────────────────────────────────────────────────────────────────────
  // E-bus PHY
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * 100 Mbps E-bus PHY：3 µm 双极，20 片/批。
     *
     * 工艺与 `make/opamp-chip` 同一条线（隔离/基区/发射区三道扩散、
     * 单层铝、合金化、封帽），只是电路换成 4 位 LVDS：
     *
     *   发送  4 位并行 + 25 MHz 时钟，推挽 3.5 mA 电流源
     *   接收  100 Ω 终端、差分比较器（失调 <10 mV）
     *   时钟  25 MHz 晶体（`make/quartz-resonator-25mhz`）
     *
     * 速率账：
     *   4 位 × 25 MHz = **100 Mbps** ✓
     *   100BASE-TX 要 125 MBd 的 MLT-3 与 125 MHz 模拟前端 ⇒ 本路线差 **5 倍**
     *   任务书"125 倍"是对 1 MHz 运放说的，那一条仍在 100BASE-TX 上成立
     *
     * 所以这条路线交的是 EtherCAT E-bus，不是 100BASE-TX。两者都是
     * EtherCAT 的合法物理层，但 E-bus 只能 5–10 m、不能变压器隔离。
     */
    id: 'make/phy-100mbps',
    name: '100 Mbps 以太网 PHY 制造',
    produces: [
      {
        item: 'std/phy-100mbps-general',
        qty: q(20),
        gives: [
          { param: 'dataRate', kind: 'range', min: 100, max: 100 },
          { param: 'clock', kind: 'range', min: 25, max: 25 },
          { param: 'lanes', kind: 'range', min: 4, max: 4 },
          { param: 'reach', kind: 'range', min: 5, max: 10 },
          { param: 'supplyVoltage', kind: 'range', min: 3.3, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/boric-acid', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/pocl3', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/bonding-wire', qty: q(1) }] },
      { anyOf: [{ item: 'std/metal-can-general', qty: q(20) }] },
    ],
    needs: ['std/photomask-general', 'plant/evaporator', 'plant/metrology-room'],
    steps: [
      {
        note_zh: '隔离/基区/发射区三道扩散（3 µm 双极）：1000–1100 °C；B 源用硼酸旋涂，P 源用 POCl₃',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 1000, max: 1100 }],
      },
      { note_zh: '引线孔 + 铝 1 + 反刻（单层布线；LVDS 的 4 位走线与偏置都在这一层）', performedBy: 'plant/mask-aligner' },
      {
        note_zh: '合金化 500–600 °C + 钝化：铝-硅接触的比接触电阻要压到 1e-5 Ω·cm²',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 500, max: 600 }],
      },
      { note_zh: '划片、装架、键合、封帽（20 片/片；TO-8 金属帽）', performedBy: 'plant/robot' },
      {
        note_zh: '测 100 Mbps 环回：4 位 PRBS + 25 MHz 时钟，用自建并串转换器；没有误码仪，只能看 10⁹ 位零错',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      '硅片 1 + 光刻胶 0.1 + NaOH 0.1 + HF 0.1 + 硝酸 0.1 + 硼酸 0.01 + POCl₃ 0.05 + 氧 0.5 + 铝 0.1 + 键合丝 1 m + 金属帽 20 → 20 片。输出按片计，不折 kg；余是划片道、封帽边角与测试报废',
  },

  // ───────────────────────────────────────────────────────────────────────
  // 25 MHz 晶体
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * 25 MHz 石英谐振器：与 5 MHz 同一条工序，只把厚度磨到 66.8 µm。
     *
     *   AT 切：厚度 t = N_AT / f，N_AT = 1.67 MHz·mm
     *   25 MHz ⇒ t = 1.67 / 25 = **66.8 µm**
     *   5 MHz  ⇒ t = 334 µm（`make/quartz-resonator-5mhz` 的 327.5–340.8 µm）
     *
     * 66.8 µm 的片子拿不住：研磨要粘在玻璃载片上，磨完再溶掉胶；
     * 频率靠"边磨边测"，用 `plant/metrology-room` 的计数器。
     *
     * 这一条把任务书那句"25 MHz 时钟对 5 MHz = 5 倍"的缺口补上了 ——
     * 本层原来只有 1 MHz 与 5 MHz 两档，现在有 25 MHz 档。
     */
    id: 'make/quartz-resonator-25mhz',
    name: '石英谐振器制造',
    produces: [
      {
        item: 'std/quartz-resonator-general',
        qty: q(20),
        gives: [{ param: 'frequency', kind: 'range', min: 24900, max: 25100 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-crystal', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'std/metal-can-general', qty: q(20) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '定向切晶：AT 切 35°15′，按 N_AT = 1.67 MHz·mm 留 66.8 µm 厚度 + 研磨余量 20 µm', performedBy: 'plant/robot' },
      {
        note_zh: '粘玻璃载片后研磨到 66.8 µm（边磨边测频；25 000 kHz 对应 66.8 µm，±0.27 % 是 ±0.18 µm）',
        performedBy: 'plant/grinder',
      },
      { note_zh: '镀铝电极（φ3 mm、0.1 µm）与引线', performedBy: 'plant/robot' },
      { note_zh: '装架、调频（磨电极边缘微调 ±0.1 %）、封帽', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      '石英 1 + 铝 1 + 帽 20 → 谐振器 20 只；磨过头/频率超差的片子回炉，不另计。输出按件计，不折 kg',
  },

  // ───────────────────────────────────────────────────────────────────────
  // 8 位端子排
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * 8 位端子排：压模 → 冲铜片 → 镀镍 → 装配。
     *
     *   进   酚醛 0.5 + 铜 0.2 + 薄钢板 0.1 + 镀镍液 0.05 + 水 2 = 2.85 kg
     *   出   端子排 10 件（每件 0.08 kg，8 位、5.08 mm、5 A/250 V）
     *
     * 酚醛是热固性，压模（`plant/press`）能出；PC 的透明外壳与卡扣
     * 做不了，所以没有 RJ45 的外形与热插拔。
     */
    id: 'make/terminal-block-8p',
    name: '8 位端子排制造',
    produces: [
      {
        item: 'std/terminal-block-8p-general',
        qty: q(10),
        gives: [
          { param: 'positions', kind: 'range', min: 8, max: 8 },
          { param: 'pitch', kind: 'range', min: 5.08, max: 5.08 },
          { param: 'ratedCurrent', kind: 'range', min: 2, max: 5 },
          { param: 'ratedVoltage', kind: 'range', min: 250, max: 250 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/nickel-plating-solution', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '压模：酚醛粉 160–180 °C / 20–30 MPa，8 位本体 + 两侧安装耳', performedBy: 'plant/press' },
      { note_zh: '冲 8 片铜簧片（0.4 mm 铜，冲裁 + 折弯）与 8 只钢螺钉', performedBy: 'plant/press' },
      {
        note_zh: '镀镍 5 µm（簧片与螺钉；没有金，镍在 5 A 下温升 20 K）',
        performedBy: 'plant/plating-bath',
        under: [{ param: 'temperature', min: 20, max: 40 }],
      },
      { note_zh: '装配：簧片压入、螺钉拧入、通断与 5 A 温升抽检', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      '酚醛 0.5 + 铜 0.2 + 薄钢板 0.1 + 镀镍液 0.05 + 水 2 = 2.85 kg → 端子排 10 件（每件 0.08 kg，合计 0.8 kg）；余是飞边、冲裁边角与镀液带出',
  },

  // ───────────────────────────────────────────────────────────────────────
  // 整件：IMU
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * **六轴 IMU：MEMS 裸片 + 玻璃盖片 + 读出 ASIC + 金属帽 + 钛吸气剂。**
     *
     * 工序（六段，全部有设备）：
     *   ① 玻璃盖片腔体腐蚀（HF，`plant/wet-bench`）—— 给陀螺质量块留活动空间
     *   ② 阳极键合 380–420 °C / 800–1200 V / 1–10 Pa（`plant/anodic-bonder`）
     *   ③ 减薄到 0.4 mm、划片（`plant/grinder`）
     *   ④ 装架、铝丝键合（`plant/robot`）
     *   ⑤ 真空封装 300–350 °C / 1e-3–0.1 Pa + 1 mg 钛吸气剂（`plant/vacuum-sealer`）
     *   ⑥ 标定/测试 19–21 °C（`plant/robot` + `plant/metrology-room`）
     *
     * ── 交付窗口（全部设计值，Earth 工程值）────────────────────────────
     *
     *   陀螺量程       ±2 000 °/s
     *   陀螺零偏稳定性 20–50 °/h（商品战术级 1–10 °/h ⇒ 差 2–50 倍；
     *                  导航级 0.1 °/h ⇒ 差 200–500 倍）
     *   陀螺 ARW       0.2–0.5 °/√h（按 0.01 °/s/√Hz 的噪声密度算）
     *   加速度计量程   ±16 g
     *   加速度计零偏   5–10 mg（商品 0.1–1 mg ⇒ 差 5–100 倍）
     *   带宽           100–300 Hz（机械 Q 与 ASIC 滤波器共同限制）
     *   更新率         1 000 Hz
     *
     * ── 与 2026 商品 IMU 的差 ─────────────────────────────────────────
     *
     *   商品用 SOI + DRIE 100 µm + 真空 <0.1 Pa + 19–23 位 ASIC；
     *   本路线是体硅 + DRIE 10–100 µm + 1–10 Pa + 16–18 位 ASIC。
     *   差在**零偏稳定性 2–50 倍**与**真空度 10–100 倍**，不是"有没有"。
     *
     * ── 质量账（按件计）────────────────────────────────────────────────
     *
     *   裸片 1 + ASIC 1 + 玻璃 20 g + 钛 1 g + 金属帽 1 + 焊料 5 g
     *   + 玻璃粉 10 g + 铜线 5 g + 酚醛 5 g + 水 0.5 kg + HF 0.05 kg
     *   → IMU 1 件（设计净重 25 g）；余是盖片切边、键合环、封装损耗。
     */
    id: 'make/robot-imu',
    name: '机器人六轴惯性测量制造',
    produces: [
      {
        item: 'plant/robot/imu',
        qty: q(1),
        gives: [
          { param: 'axes', kind: 'range', min: 6, max: 6 },
          { param: 'gyroRange', kind: 'range', min: 0, max: 2000 },
          { param: 'accelRange', kind: 'range', min: 0, max: 16 },
          { param: 'gyroBiasStability', kind: 'range', min: 20, max: 50 },
          { param: 'accelBiasStability', kind: 'range', min: 5, max: 10 },
          { param: 'bandwidth', kind: 'range', min: 100, max: 300 },
          { param: 'updateRate', kind: 'range', min: 1000, max: 1000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/robot/imu-mems-die', qty: q(1) }] },
      {
        anyOf: [
          {
            item: 'std/imu-asic-general',
            qty: q(1),
            need: [
              { param: 'channels', kind: 'range', min: 6, dir: 'atLeast' },
              { param: 'resolution', kind: 'range', min: 16, dir: 'atLeast' },
              { param: 'bandwidth', kind: 'range', min: 1, dir: 'atLeast' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/glass',
            qty: q(1, 50),
            need: [{ param: 'type', kind: 'enum', oneOf: ['borosilicate'] }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/titanium',
            qty: q(1, 1000),
            need: [{ param: 'purity', kind: 'range', min: 99, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/glass-frit', qty: q(1, 100), need: [{ param: 'd50', kind: 'range', max: 5, dir: 'atMost' }], onRelax: 'functional-kept' }] },
      { anyOf: [{ item: 'std/metal-can-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/solder-preform', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room', 'std/dvm-general'],
    steps: [
      {
        note_zh: '玻璃盖片腔体腐蚀：φ3.2 × 40 µm 腔，HF 20–40 °C 泡 8–15 min；钠钙玻璃的 CTE 8.5 ppm/K 对硅 3.2，键合后会留 20–30 MPa 应力（设计值）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh: '阳极键合 380–420 °C / 800–1200 V / 1–10 Pa / 0.3–0.8 MPa：Na⁺ 迁移，界面成 Si–O–Si；升温 10 K/min、保温 30 min',
        performedBy: 'plant/anodic-bonder',
        under: [
          { param: 'temperature', min: 380, max: 420 },
          { param: 'pressure', min: 1, max: 10 },
          { param: 'voltage', min: 800, max: 1200 },
        ],
      },
      {
        note_zh: '减薄：键合片粘玻璃载片，磨到 0.4 mm（磨 0.6 mm，去掉 200 µm）；划片 3×3 mm',
        performedBy: 'plant/grinder',
      },
      { note_zh: '装架：裸片粘在金属帽底座，铝丝键合 8–12 根（ASIC 与 MEMS 分开装，再叠）', performedBy: 'plant/robot' },
      {
        note_zh: '真空封装：帽内放 1 mg 钛箔吸气剂，玻璃粉封口 300–350 °C / 1e-3–0.1 Pa；冷却后腔压 1–10 Pa',
        performedBy: 'plant/vacuum-sealer',
        under: [
          { param: 'temperature', min: 300, max: 350 },
          { param: 'pressure', min: 0.001, max: 0.1 },
        ],
      },
      {
        note_zh: '标定/测试：六面各转 90°，量零偏与标度因数；没有转台，用大地坐标 + 光学分度头（0.5′）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(36) },
    unbalanced_zh:
      '裸片 1 + ASIC 1 + 玻璃 20 g + 钛 1 g + 玻璃粉 10 g + 金属帽 1 + 焊料 5 g + 铜线 5 g + 酚醛 5 g + 水 0.5 kg + HF 0.05 kg → IMU 1 件（设计净重 25 g）。余是盖片切边、键合环、封装损耗与标定报废；**输出按件计，不折 kg**',
  },

  // ───────────────────────────────────────────────────────────────────────
  // 整件：NPU
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * **端侧 NPU 模块：1 片 `std/soc-8nm-general`（8 nm 级 SoC）+ 1 片 32 位 CPU
     * + 4 片 RAM + 8 层板 + 铝散热片。**
     *
     * 8 nm SoC 由 `make/soc-8nm-damascene` 交（node 8–10、layers 15–20）。
     * 本路线只做模块级贴装、散热与测试，不再把两片 40 nm 加速器裸片并排贴板；
     * 片间带宽也不再是 20–40 GB/s 的并行总线，而是 SoC 内部互连（本模块不测）。
     *
     * 交付窗口（读数来源，不是把规格再抄一遍）：
     *   算力      100–275 TOPS（`measure/robot-npu-benchmark` 的验收带；模块自跑矩阵乘基准）
     *   片上 SRAM 10–100 MB（同一记录：地址走 1 / 全 0 / 棋盘三模式读可用容量）
     *   工艺      8 nm 级（SoC 路线交 node 8–10；模块节点由 `measure/soc-8nm-gate-length`
     *             的 TEM 栅长 8–10 nm 记录支撑，声明窗口 7–12）
     *   功耗      10–30 W（同一基准记录：分流器 + 数字表满载读 10 次）
     *
     * 历史说明：**2–10 TOPS 是 40 nm 时代的天花板** —— 旧设计是 2 片 40 nm
     * 门阵列 + 100–300 nm 后道；那个设计已经退场，不是本路线现在的交付。
     *
     * 仍未接上的：2.5D 封装/硅中介层没有。三项记录都是**验收带**，
     * 具体读数待本机跑分收窄（R12：记录窗口 ⊆ 设计窗口，不冒充已测）。
     */
    id: 'make/robot-npu',
    name: '机器人端侧 NPU 制造',
    produces: [
      {
        item: 'plant/robot/npu',
        qty: q(1),
        gives: [
          // 2026-10-24：套刻可溯源补充后，8 nm 链走通；node 改由 TEM 栅长记录支撑，
          // TOPS/SRAM/功耗改由模块基准记录支撑。三项都是验收带，不是单次读数。
          { param: 'tops', kind: 'range', min: 100, max: 275 },
          { param: 'node', kind: 'range', min: 7, max: 12, record: 'mat/soc-8nm-gate-length-record' },
          { param: 'sram', kind: 'range', min: 10, max: 100 },
          { param: 'power', kind: 'range', min: 10, max: 30 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'std/soc-8nm-general',
            qty: q(1),
            need: [
              { param: 'node', kind: 'range', max: 12, dir: 'atMost' },
              { param: 'tops', kind: 'range', min: 100, dir: 'atLeast' },
              { param: 'sram', kind: 'range', min: 10, dir: 'atLeast' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'std/cpu-32bit-general',
            qty: q(1),
            need: [{ param: 'gates', kind: 'range', min: 80000, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'std/ram-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/multilayer-pcb', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/solder-paste', qty: q(1, 10) }] },
      { anyOf: [{ item: 'std/passive-component-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['std/dvm-general'],
    steps: [
      {
        note_zh: '贴片/回流焊 220–250 °C：1 片 8 nm SoC + CPU + 4 片 RAM + 无源件贴到 8 层板上；钢网 0.15 mm',
        performedBy: 'plant/reflow-furnace',
        under: [{ param: 'temperature', min: 225, max: 245 }],
      },
      {
        note_zh:
          '装铝散热片 + 0.05 mm 锡箔热界面（没有导热硅脂，锡箔 66 W/m·K 顶着）；`plant/pick-place` 在 100–500 kPa 加压箱里定位 50 µm',
        performedBy: 'plant/pick-place',
        under: [
          { param: 'temperature', min: 21, max: 26 },
          { param: 'pressure', min: 120, max: 180 },
        ],
      },
      {
        note_zh:
          '烧录/测试：只测静态电流、复位与 DDR 环回；TOPS 100–275 是设计窗口，没有推理框架可跑。执行者是恒温计量间（19–21 °C），`std/dvm-general` 在 needs 里',
        performedBy: 'plant/metrology-room',
        under: [{ param: 'temperature', min: 19.5, max: 20.5 }],
      },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      '8 nm SoC 1 + CPU 1 + RAM 4 + 多层板 0.5 kg + 焊膏 0.1 kg + 无源件 1 + 铝 0.3 kg + 锡 0.05 kg + 水 2 kg → NPU 1 件（设计净重 0.45 kg）。输出按件计，不折 kg；余是钢网残留、焊膏挥发分与测试报废',
  },

  // ───────────────────────────────────────────────────────────────────────
  // 整件：EtherCAT 从站
  // ───────────────────────────────────────────────────────────────────────

  {
    /**
     * **EtherCAT 从站：2 片 32 位 CPU 跑软件 ESC + 2 片 E-bus PHY + 20 片逻辑门 + 4 片 RAM。**
     *
     * ESC 的门数账：
     *   商品 ESC   10⁵–10⁶ 门、8–16 KB 过程 RAM、2–4 端口、硬件状态机
     *   本路线     2 × 8–12 万门 CPU（16–24 万门）+ 20 片 10–50 门逻辑
     *              （200–1 000 门做 MAC 前置）+ 4 片 RAM
     *   有效逻辑   软件状态机只跑 1–2 轴、1–2 ms 周期；商品 62.5–125 µs
     *              ⇒ 周期差 **8–32 倍**，门数差 **100–5 000 倍**（按"专用硬件"算）
     *
     * 为什么不用 FPGA：本层没有 FPGA 路线（旧注释那句"没有 FPGA"仍然成立）。
     * 用 CPU + 分立逻辑是**降级**：CPU 的 5 MIPS 口径（`controller-24axis.ts`）
     * 跑 100 Mbps 的每帧处理很紧 —— 一个 64 字节帧 6.7 µs，5 MIPS 只有
     * 33 条指令；所以只能做 1–2 轴、1–2 ms 周期，不是 20–40 轴。
     *
     * 物理层是 E-bus（25 MHz × 4 位 = 100 Mbps），不是 100BASE-TX：
     * 变压器隔离、100 m、自适应均衡三样都没有。任务书那句"PHY 的 125 MHz
     * 模拟前端对 1 MHz 运放 = 125 倍"保留在 100BASE-TX 上；本路线用
     * 25 MHz 的 E-bus 绕开 125 MHz，25 MHz 晶体已由
     * `make/quartz-resonator-25mhz` 补上（原缺 5 倍）。
     */
    id: 'make/robot-ethercat-slave',
    name: 'EtherCAT 从站控制器制造',
    produces: [
      {
        item: 'plant/robot/ethercat-slave',
        qty: q(1),
        gives: [
          { param: 'dataRate', kind: 'range', min: 100, max: 100 },
          { param: 'ports', kind: 'range', min: 2, max: 2 },
          { param: 'cycleTime', kind: 'range', min: 1, max: 2 },
          { param: 'axes', kind: 'range', min: 1, max: 2 },
          { param: 'clock', kind: 'range', min: 25, max: 25 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'std/cpu-32bit-general',
            qty: q(2),
            need: [{ param: 'gates', kind: 'range', min: 80000, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'std/logic-chip-general', qty: q(20) }] },
      { anyOf: [{ item: 'std/ram-chip-general', qty: q(4) }] },
      {
        anyOf: [
          {
            item: 'std/phy-100mbps-general',
            qty: q(2),
            need: [
              { param: 'dataRate', kind: 'range', min: 100, dir: 'atLeast' },
              { param: 'clock', kind: 'range', min: 25, max: 25 },
              { param: 'lanes', kind: 'range', min: 4, dir: 'atLeast' },
              { param: 'reach', kind: 'range', min: 5, dir: 'atLeast' },
              { param: 'supplyVoltage', kind: 'range', min: 3.3, max: 5 },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'std/quartz-resonator-general',
            qty: q(1),
            need: [{ param: 'frequency', kind: 'range', min: 24900, max: 25100 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'std/ferrite-core-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/terminal-block-8p-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/passive-component-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/multilayer-pcb', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/solder-paste', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room', 'std/dvm-general'],
    steps: [
      {
        note_zh: '贴片/回流焊 220–250 °C：2 CPU + 20 逻辑门 + 4 RAM + 2 PHY + 无源件贴到 8 层板',
        performedBy: 'plant/reflow-furnace',
        under: [{ param: 'temperature', min: 220, max: 250 }],
      },
      {
        note_zh: '绕 2 只共模扼流圈：NiZn 铁氧体环 1:1、φ0.2 mm 漆包线各 8 匝（E-bus 的共模抑制；不是 100BASE-TX 的隔离变压器）',
        performedBy: 'plant/winder',
      },
      { note_zh: '装 2 只 8 位端子排、钢屏蔽罩、接地螺柱', performedBy: 'plant/robot' },
      {
        note_zh: '烧录/环回测试：2 个端口对接，跑 10⁹ 位 PRBS 零错；周期时间用 GPIO 翻转 + 示波器（没有主站，测不了分布式时钟）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      'CPU 2 + 逻辑门 20 + RAM 4 + PHY 2 + 25 MHz 晶体 1 + 铁氧体 2 + 端子排 2 + 无源件 1 + 多层板 0.5 kg + 焊膏 0.05 kg + 铜线 0.1 kg + 薄钢板 0.2 kg + 水 2 kg → 从站 1 件（设计净重 0.6 kg）。输出按件计，不折 kg；余是钢网残留、绕线边角与测试报废',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ROBOT_ELECTRONICS_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...ROBOT_ELECTRONICS_ROUTES];
