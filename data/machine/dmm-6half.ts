/**
 * 6½ 位数字万用表 —— 把“文档引用了不存在的 std/dmm-6half-general”补成真条目。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、6½ 位到底是多少：先把三个数分开
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 6½ 位 = **2 000 000 个数**（1 999 999 + 符号/半位）。在 10 V 档上：
 *
 *   1 个数 = 10 V / 2 000 000 = **5 µV**（0.5 ppm）
 *
 * 所以：
 *
 *   6½ 位、10 V 档      分辨 **5 µV**，不是 1 µV
 *   6½ 位、2 V 档       分辨 **1 µV**
 *   1 µV @10 V          要 10 000 000 个数 = **7 位**
 *   3.5 ppm             0.00035 %；6½ 位的 0.0035 % 是 **35 ppm**，差 10×
 *
 * 题设写“准确度 0.0035–0.01%（6½ 位的门槛是 3.5 ppm）”——这里有两个数被
 * 混在一起：**0.0035 % = 35 ppm**，是 6½ 位表常见的直流电压准确度；
 * **3.5 ppm = 0.00035 %**，是 7½ 位表那一档。本文件建的是一台真正的
 * **6½ 位表（35–100 ppm、5 µV@10 V）**；3.5 ppm / 1 µV@10 V 作为
 * 剩余缺口写在文件末尾，不冒充达成。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、组成与标定链
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 复用四件：
 *
 *   `plant/cmos-test/parameter-analyzer/adc-24bit`  24 位、250 nV/LSB、INL 1–10 ppm
 *   `std/divider-10to1-precision`                   10:1、比值 20–200 ppm、0.5–2 ppm/K
 *   `std/divider-100to1-precision`                  100:1、Hamon 自校、同上
 *   `std/zener-reference-precision`                 6.6–7.1 V、1–5 ppm/K、2–20 ppm/a
 *
 * 再加一件新的：
 *
 *   `plant/dmm-6half/input-front-end`               输入保护 + 量程开关 + 高阻缓冲
 *
 * 标定链（每一步都只信前一步）：
 *
 *   ① 齐纳 6.85 V 放在 `plant/mk-oven` 25.00 ±0.01 °C 里：温漂 1–5 ppm/K × 0.01 K
 *      = **0.01–0.05 ppm**，可忽略；剩下 2–20 ppm/a 的年漂移。
 *   ② 10:1 分压：把 6.85 V 变成 0.685 V 给 ADC；比值 20–200 ppm，用 100:1 的
 *      Hamon 串并联自校验到 **0.01 %（100 ppm）**，再挑比值 ≤20 ppm 的个体。
 *   ③ 24 位 ADC：2 V 档 250 nV/LSB；在 10 点（0/0.1/…/2 V）上对分压后的
 *      齐纳读数做线性拟合，**INL 1–10 ppm** 是校准后残差，不是未校值。
 *   ④ 10 V/100 V/1000 V 档：10:1、100:1 分压把输入落到 ADC 的 ±2 V 内；
 *      每档用 ①–③ 的链做一次比值传递。
 *
 * 准确度预算（10 V 档，校准后）：
 *
 *   分压比（挑到 20 ppm）        20 ppm
 *   ADC INL（校准后）              1–10 ppm
 *   齐纳年漂移（用前复校）          2–20 ppm/a
 *   ADC 噪声（0.1–0.6 µV / 10 V）   0.01–0.06 ppm
 *   ────────────────────────────────────────
 *   合计                          23–50 ppm（取 35–100 ppm 的交付窗口）
 *
 * ⚠️ 3.5 ppm 要 5.7× 更好的分压（≤0.6 ppm）与 10–20× 更好的 ADC/基准；
 *    那是 7½ 位表，不是这一台。
 *
 * 输入：≤10 V 档 **20–100 GΩ**、偏置 **10–100 pA**、CMRR **100–120 dB**、
 * 保护 **1000–1500 V**、6 档、热电势 **0.5–1.5 µV**。100 pA × 10 V 对应
 * 100 GΩ；对 10 V 档的 10 GΩ 门槛有 10× 余量。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DMM_6HALF_ITEMS: readonly Item[] = [
  /**
   * 6½ 位数字万用表。**0.1 µV–1000 V、35–100 ppm、5 µV@10 V、20–100 GΩ。**
   *
   *   digits          6.5（2 000 000 个数）
   *   voltage         0.1 µV–1000 V
   *   accuracy        0.0035–0.01 %（35–100 ppm）
   *   resolution10V   5 µV（6½ 位在 10 V 档的 LSB）
   *   resolution2V    1 µV（2 V 档）
   *   inputImpedance  20–100 GΩ（≤10 V）
   *   biasCurrent     10–100 pA
   *   cmrr            100–120 dB
   *   protection      1000–1500 V
   *
   * 它不替代 `std/dvm-general`（4 位）；4 位表仍是车间表，这台进计量间。
   */
  {
    id: 'std/dmm-6half-general',
    name: '6½-Digit Digital Multimeter', name_zh: '6½ 位数字万用表',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'digits', kind: 'range', min: 6.5, max: 6.5, unit: '位' },
      { param: 'voltage', kind: 'range', min: 1e-7, max: 1000, unit: 'V' },
      { param: 'accuracy', kind: 'range', min: 0.0035, max: 0.01, unit: '%', dir: 'atMost' },
      { param: 'resolution10V', kind: 'range', min: 1, max: 10, unit: 'µV', dir: 'atMost' },
      { param: 'resolution2V', kind: 'range', min: 0.1, max: 2, unit: 'µV', dir: 'atMost' },
      { param: 'inputImpedance', kind: 'range', min: 1e10, max: 1e13, unit: 'Ω', dir: 'atLeast' },
      { param: 'biasCurrent', kind: 'range', min: 1e-13, max: 1e-9, unit: 'A', dir: 'atMost' },
      { param: 'counts', kind: 'range', min: 1e6, max: 2e6, unit: '个' },
      { param: 'cmrr', kind: 'range', min: 80, max: 140, unit: 'dB', dir: 'atLeast' },
      { param: 'protection', kind: 'range', min: 1000, max: 1500, unit: 'V' },
    ],
  },

  /**
   * 输入前端：保护 + 6 档量程开关 + 高阻缓冲。**20–100 GΩ、10–100 pA、1000–1500 V。**
   *
   * 低漏输入用 `plant/cmos-test/parameter-analyzer/low-leak-input`（栅漏 ≤1e-16 A、
   * 1e12–1e18 Ω），缓冲用 `std/opamp-chip-general`；量程开关是镀金铜触点 +
   * PTFE 绝缘，热电势 0.5–1.5 µV。钳位用两只 6.2 V 齐纳串成 12.4 V，
   * 10 V 档上漏电 ≤100 pA（对应 100 GΩ）。
   */
  {
    id: 'plant/dmm-6half/input-front-end',
    name: 'Input Front End', name_zh: '输入前端',
    unit: '件',
    category: 'part',
    props: [
      { param: 'inputImpedance', kind: 'range', min: 1e10, max: 1e13, unit: 'Ω', dir: 'atLeast' },
      { param: 'biasCurrent', kind: 'range', min: 1e-13, max: 1e-9, unit: 'A', dir: 'atMost' },
      { param: 'protection', kind: 'range', min: 1000, max: 1500, unit: 'V' },
      { param: 'ranges', kind: 'range', min: 5, max: 8, unit: '档' },
      { param: 'thermalEmf', kind: 'range', min: 0.1, max: 2, unit: 'µV', dir: 'atMost' },
      { param: 'cmrr', kind: 'range', min: 80, max: 140, unit: 'dB', dir: 'atLeast' },
    ],
  },
];

export const DMM_6HALF_ROUTES: readonly Route[] = [
  /**
   * 输入前端：低漏管 + 缓冲 + 双齐纳钳位 + 镀金量程开关。
   *
   *   低漏输入 1 + 运放 2 + 齐纳 2 + 电阻丝 0.01 + 金 0.001 + 铜 0.1
   *   + PTFE 0.01 + 铝 0.5 → 前端 1
   */
  {
    id: 'make/dmm-input-front-end',
    name: 'Input Front End Manufacturing', name_zh: '输入前端制造',
    produces: [
      {
        item: 'plant/dmm-6half/input-front-end',
        qty: q(1),
        gives: [
          { param: 'inputImpedance', kind: 'range', min: 2e10, max: 1e11 },
          { param: 'biasCurrent', kind: 'range', min: 1e-11, max: 1e-10 },
          { param: 'protection', kind: 'range', min: 1000, max: 1500 },
          { param: 'ranges', kind: 'range', min: 6, max: 6 },
          { param: 'thermalEmf', kind: 'range', min: 0.5, max: 1.5 },
          { param: 'cmrr', kind: 'range', min: 100, max: 120 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/cmos-test/parameter-analyzer/low-leak-input', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(24) },
    unbalanced_zh:
      '低漏管 1 + 运放 2 + 齐纳 2 + 电阻丝 0.01 + 金 0.001 + 铜 0.1 + PTFE 0.01 + 铝 0.5 → 输入前端 1；余是屏蔽壳边角与引线。20–100 GΩ、10–100 pA 是设计值，用 10 V 源与 pA 表测',
  },

  /**
   * 6½ 位 DMM：输入前端 + 24 位 ADC + 10:1/100:1 分压 + 精密齐纳 + 显示/控制。
   *
   *   前端 1 + ADC 1 + 10:1 1 + 100:1 1 + 齐纳 1 + 控制板 1 + 计数 2
   *   + PCB 1 + 铝 1 + 铜线 0.1 + PTFE 0.05 → DMM 1 台
   *
   * 标定：齐纳（mk-oven 25.00 °C）→ 10:1 分压 → 24 位 ADC 线性（10 点，
   * INL 1–10 ppm）→ 10 V/100 V/1000 V 档比值传递。
   */
  {
    id: 'make/dmm-6half',
    name: '6½-Digit Digital Multimeter Manufacturing', name_zh: '6½ 位数字万用表制造',
    produces: [
      {
        item: 'std/dmm-6half-general',
        qty: q(1),
        gives: [
          { param: 'digits', kind: 'range', min: 6.5, max: 6.5 },
          { param: 'voltage', kind: 'range', min: 1e-7, max: 1000, record: 'mat/dmm-6half-cal-record' },
          { param: 'accuracy', kind: 'range', min: 0.0035, max: 0.01, record: 'mat/dmm-6half-cal-record' },
          { param: 'resolution10V', kind: 'range', min: 5, max: 5 },
          { param: 'resolution2V', kind: 'range', min: 1, max: 1 },
          { param: 'inputImpedance', kind: 'range', min: 2e10, max: 1e11 },
          { param: 'biasCurrent', kind: 'range', min: 1e-11, max: 1e-10 },
          { param: 'counts', kind: 'range', min: 2e6, max: 2e6 },
          { param: 'cmrr', kind: 'range', min: 100, max: 120 },
          { param: 'protection', kind: 'range', min: 1000, max: 1500 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/dmm-6half/input-front-end', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cmos-test/parameter-analyzer/adc-24bit', qty: q(1) }] },
      { anyOf: [{ item: 'std/divider-10to1-precision', qty: q(1) }] },
      { anyOf: [{ item: 'std/divider-100to1-precision', qty: q(1) }] },
      { anyOf: [{ item: 'std/zener-reference-precision', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 20) }] },
    ],
    needs: ['plant/mk-oven', 'plant/metrology-room'],
    steps: [
      { note_zh: '装输入前端与 6 档量程开关：镀金触点、PTFE 绝缘，热电势 0.5–1.5 µV', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装 24 位 ADC、10:1/100:1 分压与精密齐纳：分压抽头到 ADC 的线 ≤50 mm，屏蔽单点接地', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装显示/控制：6½ 位计数、量程切换、过载保护', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '标定 ①：齐纳进 mk-oven 25.00 ±0.01 °C，10:1 分压后读 0.685 V；用 100:1 Hamon 自校验比值 ≤0.01 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '标定 ②：ADC 线性 10 点（0–2 V），拟合 INL 1–10 ppm；再做 10 V/100 V/1000 V 档比值传递', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '检验：输入阻抗 20–100 GΩ、偏置 10–100 pA、CMRR 100–120 dB、1000 V 保护；写证书（6½ 位、35–100 ppm）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(80) },
    unbalanced_zh:
      '前端 1 + ADC 1 + 10:1 1 + 100:1 1 + 齐纳 1 + 控制板 1 + 计数 2 + PCB 1 + 铝 1 + 铜线 0.1 + PTFE 0.05 → DMM 1 台；按件计，余是屏蔽盒/线头。6½ 位、35–100 ppm、5 µV@10 V 是设计值；3.5 ppm/1 µV@10 V 仍需 7½ 位',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...DMM_6HALF_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...DMM_6HALF_ROUTES];
