/**
 * 磁体测量三件套：罗氏线圈、高场 NMR 探头、线圈储能测试台。
 *
 * 三件都是仪器，量程写在 props 上；产出路线的 gives 全部标 design ——
 * 校准源与负载还没有，量程是设计值，不是读数，也不是记录。
 *
 * 现有校准能力的缺口：
 *   电流源只到 2 kA，罗氏与储能台要 50–70 kA，差 25–34 倍；
 *   10–13 T 标准场不存在，NMR 只能用频率比对，缺高场校准磁体；
 *   41 GJ 的 dump 负载与 68 kA 电源未建。
 * 三件仪器把“怎么量磁体”写成条目，但校准链本身仍是缺口。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const MAGNET_METROLOGY_ITEMS: readonly Item[] = [
  /**
   * 罗氏线圈电流探头：50 kA 量级、带宽 1–10 MHz、精度 0.5–2 %。
   *
   * props 是设计量程，不是读数：现有电流源只到 2 kA，校准差 25 倍；
   * 积分的漂移与温漂未测。
   */
  {
    id: 'plant/rogowski-50ka',
    name: 'Rogowski Coil Current Probe', name_zh: '罗氏线圈电流探头',
    unit: '台',
    category: 'machine',
    // 单件计量仪器：线圈、屏蔽、积分器在整机内不可再拆成独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/current', kind: 'range', min: 0, max: 60000, unit: 'A' },
      { param: 'measure/bandwidth', kind: 'range', min: 1e6, max: 1e7, unit: 'Hz' },
      { param: 'measure/accuracy', kind: 'range', min: 0.5, max: 2, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 高场 NMR 探头：10–13 T、400–600 MHz、分辨率 1–10 ppm。
   *
   * props 是设计量程，不是读数：12 T 校准磁体不存在，只能用 NMR 频率
   * 比对标定，缺 10–13 T 标准场。
   */
  {
    id: 'plant/high-field-nmr-probe',
    name: 'High-Field NMR Probe', name_zh: '高场 NMR 探头',
    unit: '台',
    category: 'machine',
    // 单件计量仪器：探头线圈、安瓿、振荡/锁相在整机内不可再拆，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/field', kind: 'range', min: 10, max: 13, unit: 'T' },
      { param: 'measure/peakField', kind: 'range', min: 10, max: 13, unit: 'T' },
      { param: 'measure/resolution', kind: 'range', min: 1, max: 10, unit: 'ppm', dir: 'atMost' },
      { param: 'measure/frequency', kind: 'range', min: 400, max: 600, unit: 'MHz' },
    ],
  },

  /**
   * 线圈储能测试台：30–45 GJ、0–70 kA、0–10 kV。
   *
   * props 是设计量程，不是读数：41 GJ 的 dump 负载与 68 kA 电源未建；
   * 只能用 2 kA 源做线性外推，差 34 倍。
   */
  {
    id: 'plant/coil-energy-test-stand',
    name: 'Coil Energy Storage Test Stand', name_zh: '线圈储能测试台',
    unit: '台',
    category: 'machine',
    // 单件计量仪器：机架、负载、测量接口按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/storedEnergy', kind: 'range', min: 30, max: 45, unit: 'GJ' },
      { param: 'measure/current', kind: 'range', min: 0, max: 70000, unit: 'A' },
      { param: 'measure/voltage', kind: 'range', min: 0, max: 10000, unit: 'V' },
    ],
  },
];

export const MAGNET_METROLOGY_ROUTES: readonly Route[] = [
  {
    /**
     * 罗氏线圈：铜线 2 kg + 环氧 1 kg + PTFE 0.5 kg + 铝 1 kg
     * → 绕环形线圈 → 静电屏蔽/环氧封装 → 装积分器/标定接口 → 一台。
     *
     * 绕制、封装、积分器分段由 steps 分担；模型不允许 performedBy 与 steps 并存。
     * 量程 50 kA 是设计：现有电流源只到 2 kA，校准差 25 倍；积分漂移未测。
     */
    id: 'make/rogowski-50ka',
    name: 'Rogowski Coil Current Probe Manufacturing', name_zh: '罗氏线圈电流探头制造',
    produces: [
      {
        item: 'plant/rogowski-50ka',
        qty: q(1),
        gives: [
          { param: 'measure/current', kind: 'range', min: 0, max: 60000, record: 'mat/cal-rogowski-record' },
          { param: 'measure/bandwidth', kind: 'range', min: 1e6, max: 1e7, record: 'mat/cal-rogowski-record' },
          { param: 'measure/accuracy', kind: 'range', min: 0.5, max: 2, record: 'mat/cal-rogowski-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper-wire', qty: q(2) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '绕环形线圈：铜线在环形骨架上均匀绕制', performedBy: 'plant/winder' },
      { note_zh: '静电屏蔽与环氧封装', performedBy: 'plant/robot' },
      { note_zh: '装积分器与标定接口', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 高场 NMR 探头：铜线 0.5 kg + 玻璃 0.2 kg + 水 2 kg + 运放 4 件
     * → 绕探头线圈 → 封水样安瓿 → 装 500 MHz 振荡/锁相 → 标定 → 一台。
     *
     * 12 T 校准磁体不存在；只能用 NMR 频率比对标定，缺 10–13 T 标准场，
     * 量程是设计。标定与装调在 19–21 °C 的计量间进行；封安瓿在 20–30 °C。
     */
    id: 'make/high-field-nmr-probe',
    name: 'High-Field NMR Probe Manufacturing', name_zh: '高场 NMR 探头制造',
    produces: [
      {
        item: 'plant/high-field-nmr-probe',
        qty: q(1),
        gives: [
          { param: 'measure/field', kind: 'range', min: 10, max: 13, record: 'mat/cal-high-field-nmr-record' },
          { param: 'measure/peakField', kind: 'range', min: 10, max: 13, record: 'mat/cal-high-field-nmr-record' },
          { param: 'measure/resolution', kind: 'range', min: 1, max: 10, record: 'mat/cal-high-field-nmr-record' },
          { param: 'measure/frequency', kind: 'range', min: 400, max: 600, record: 'mat/cal-high-field-nmr-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
    ],
    needs: ['plant/vna-3ghz', 'plant/metrology-room'],
    steps: [
      { note_zh: '绕探头线圈：在骨架上绕制并固定', performedBy: 'lathe' },
      {
        note_zh: '封水样安瓿：玻璃封口',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 30 }],
      },
      {
        note_zh: '装 500 MHz 振荡与锁相',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '标定：频率比对，缺 10–13 T 标准场',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },
  {
    /**
     * 线圈储能测试台：316L 100 t + 铜 20 t + 水 10 t + 环氧 1 t
     * + 锰铜精密电阻 100 件 → 机架/busbar → 水冷电阻负载
     * → 电流/电压测量接口 → 总装 → 一台。
     *
     * 41 GJ dump 与 68 kA 电源未建；量程是设计；只能用 2 kA 源做线性外推，
     * 差 34 倍。
     */
    id: 'make/coil-energy-test-stand',
    name: 'Coil Energy Storage Test Stand Manufacturing', name_zh: '线圈储能测试台制造',
    produces: [
      {
        item: 'plant/coil-energy-test-stand',
        qty: q(1),
        gives: [
          { param: 'measure/storedEnergy', kind: 'range', min: 30, max: 45, record: 'mat/cal-coil-energy-stand-record' },
          { param: 'measure/current', kind: 'range', min: 0, max: 70000, record: 'mat/cal-coil-energy-stand-record' },
          { param: 'measure/voltage', kind: 'range', min: 0, max: 10000, record: 'mat/cal-coil-energy-stand-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(100000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(20000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10000) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(1000) }] },
      { anyOf: [{ item: 'std/precision-resistor-manganin', qty: q(100) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '机架与 busbar：316L 机架、铜 busbar', performedBy: 'plant/sheet-shop' },
      { note_zh: '水冷电阻负载：锰铜电阻与水冷回路', performedBy: 'plant/sheet-shop' },
      { note_zh: '电流/电压测量接口', performedBy: 'plant/robot' },
      { note_zh: '总装：机架、负载、测量接口总装', performedBy: 'plant/robot' },
    ],
  },
];

export const DATA_ITEMS: readonly Item[] = [...MAGNET_METROLOGY_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...MAGNET_METROLOGY_ROUTES];
