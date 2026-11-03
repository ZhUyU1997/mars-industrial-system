/**
 * 约瑟夫森电压记录与测量路线（从 data/machine/quantum-voltage.ts 迁入，R13）。
 *
 * 70 000 结阵列测 1–10 V：70 GHz 下单结 0.14475 mV，10 V 要 69 080 结。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DATA_ITEMS: readonly Item[] = [
  /**
   * **约瑟夫森电压记录：1–10 V、不确定度 1×10⁻⁹–1×10⁻⁸、70 000 结、4.2 K。**
   *
   * 它是 `measure/josephson-array` 的产出，不是一台仪表。记录里写：
   *
   *   ① 1/2/5/10 V 四档的台阶电压与修正值；
   *   ② 结数 70 000（窗口 10 000–100 000）、频率 72–78 GHz；
   *   ③ 不确定度分项（频率、热电势、指零仪、分压比、微波泄漏）；
   *   ④ 4.0–4.3 K 的冷板温度与 0.1–0.5 W 冷量；
   *   ⑤ `anchor = josephson`、`method = shapiro-step`。
   *
   * ⚠️ 记录的是**读数与修正值**，不是“设计值”。设计 1×10⁻⁹–1×10⁻⁸ 在
   * 文件头 §四；实际记录的不确定度由比对链决定。
   */
  {
    id: 'mat/josephson-record',
    name: '约瑟夫森电压记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 1, max: 10, unit: 'V' },
      { param: 'uncertainty', kind: 'range', min: 1e-9, max: 1e-8, unit: '1', dir: 'atMost' },
      { param: 'junctions', kind: 'range', min: 10000, max: 100000, unit: '个' },
      { param: 'frequency', kind: 'range', min: 70, max: 100, unit: 'GHz' },
      { param: 'temperature', kind: 'range', min: 4.0, max: 4.5, unit: 'K' },
      { param: 'anchor', kind: 'enum', values: ['josephson'] },
      { param: 'method', kind: 'enum', values: ['shapiro-step'] },
    ],
  },
];

export const DATA_ROUTES: readonly Route[] = [
  {
    /**
     * **约瑟夫森阵列测 1–10 V：70 000 结、75 GHz、4.2 K，不确定度 1×10⁻⁹–1×10⁻⁸。**
     *
     * 六道工序：
     *   ① 70 000 结阵列装到 JT 冷板，4.0–4.3 K；
     *   ② 75 GHz 源锁氢脉泽，计数器读 f（72–78 GHz）；
     *   ③ 调微波功率，落在 n=1 Shapiro 台阶；70 000 结在 70 GHz 给 10.13 V、
     *      100 GHz 给 14.47 V，覆盖 1–10 V；
     *   ④ 与 `plant/hv-test-bench/standard-voltage-reference` 逐档比对
     *      （1/2/5/10 V），指零仪 + 10:1/100:1 分压，正反向各 3 次；
     *   ⑤ 算不确定度：频率 1×10⁻¹¹、热电势 1×10⁻⁹、指零仪/分压 1×10⁻⁹–1×10⁻⁸、
     *      微波泄漏 1×10⁻¹⁰；方和根 1×10⁻⁹–1×10⁻⁸；
     *   ⑥ 写 `mat/josephson-record`：anchor=josephson、method=shapiro-step。
     *
     * ⚠️ 这是设计路线，不是读数。记录里的 1×10⁻⁹–1×10⁻⁸ 要真跑一次才有；
     * 本文件不写“闭合”。
     */
    id: 'measure/josephson-array',
    name: '约瑟夫森电压测量',
    rate: { hours: q(160) },
    produces: [
      {
        item: 'mat/josephson-record',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 1, max: 10 },
          { param: 'uncertainty', kind: 'range', min: 1e-9, max: 1e-8 },
          { param: 'junctions', kind: 'range', min: 70000, max: 70000 },
          { param: 'frequency', kind: 'range', min: 72, max: 78 },
          { param: 'temperature', kind: 'range', min: 4.0, max: 4.3 },
          { param: 'anchor', kind: 'enum', oneOf: ['josephson'] },
          { param: 'method', kind: 'enum', oneOf: ['shapiro-step'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/josephson-junction-general', qty: q(70000) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/standard-voltage-reference', qty: q(1) }] },
      { anyOf: [{ item: 'mat/voltage-absolute-record', qty: q(1) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/mk-oven',
      'plant/jt-cooler',
      'plant/mmwave-source',
      'plant/hydrogen-maser',
      'plant/hv-test-bench',
      'plant/probe-station',
      'plant/probe-station/null-detector',
      'std/dvm-general',
      'std/divider-10to1-precision',
      'std/divider-100to1-precision',
      'std/counter-chip-general',
    ],
    steps: [
      {
        note_zh: '① 装阵列：70 000 结芯片压到 JT 冷板（In 箔），抽真空、4.0–4.3 K；冷量 0.1–0.5 W 里阵列吃 0.05–0.2 W',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 4.0, max: 4.3 }],
      },
      {
        note_zh: '② 锁频：75 GHz 源锁氢脉泽 10 MHz；计数器读 f = 72–78 GHz，1 s 稳定度设计 1×10⁻¹³–1×10⁻¹¹、实测 1×10⁻⁹',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '③ 调微波功率：从 0 加到第一台阶出现，再调到台阶中心；70 000 结的 n=1 台阶在 1–10 V 分档，台阶宽度 ≥10 µV',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '④ 逐档比对：1/2/5/10 V 各与标准电压基准比，指零仪 + 10:1/100:1 分压；正反向各 3 次，热电势 <10 nV',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '⑤ 算不确定度：频率 1×10⁻⁹（实测）/1×10⁻¹²（设计）、热电势 1×10⁻⁹、指零仪/分压 1×10⁻⁹–1×10⁻⁸、微波泄漏 1×10⁻¹⁰；方和根 1×10⁻⁹–1×10⁻⁸；1×10⁻⁹ 档要相位噪声分析仪',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '⑥ 写记录：1/2/5/10 V 台阶电压与修正值、70 000 结、72–78 GHz、4.0–4.3 K、anchor=josephson、method=shapiro-step；与 31 ppm 电压天平记录并列',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '无 kg 投入（电、纸、清洗剂不登条目）→ 记录 1 份；产物按份计，不进 kg 守恒。设计 1×10⁻⁹–1×10⁻⁸；与 31 ppm（3.1×10⁻⁵）比好 2 700–3 100 倍。剩余缺口：相位噪声分析仪 0 条、Al 99.99 % 0 条、Nb 靶 HIP 0 条（见文件头 §五）',
  },
];
