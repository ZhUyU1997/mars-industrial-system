/**
 * 第二批测量量具：500 t 称重台、30 m 激光跟踪仪、75 kW@4.5 K 冷量负载。
 *
 * 三台都是仪器，量程写在 props 上；产出路线的 gives 全部标 design ——
 * 校准与溯源还没有做，量程是设计值，不是读数，也不是记录。
 *
 * 现有能力的缺口：
 *   质量标准只到 20 kg，500 t 称重差 5 个量级；
 *   激光直线度仪只有 1–3 m 行程，30 m 跟踪仪差 1–2 个量级；
 *   GM/JT 冷头只有 0.05–5 W，75 kW 冷量负载差 4 个量级。
 * 三台仪器把“怎么量”写成条目，但大质量、长基线、满功率的校准源仍是缺口。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const BATCH2_ITEMS: readonly Item[] = [
  /**
   * 500 t 级称重台：质量 0–600 t、分辨率 1–10 kg、精度 0.1–0.5 %。
   *
   * props 是设计量程，不是读数：现有质量标准只到 20 kg，差 5 个量级；
   * 大质量校准砝码与液压测力机未建。
   */
  {
    id: 'plant/weighbridge-500t',
    name: '500 t 级称重台',
    unit: '台',
    category: 'machine',
    // 单件计量仪器：台面、传感器、仪表按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/mass', kind: 'range', min: 0, max: 600000, unit: 'kg' },
      { param: 'measure/sectorMass', kind: 'range', min: 0, max: 600000, unit: 'kg' },
      { param: 'resolution', kind: 'range', min: 1, max: 10, unit: 'kg' },
      { param: 'accuracy', kind: 'range', min: 0.1, max: 0.5, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 30 m 激光跟踪仪：长度 0–30 m、精度 0.05–0.5 mm、角度 0–360°。
   *
   * props 是设计量程，不是读数：30 m 是设计；现有激光直线度仪行程 1–3 m，
   * 差 1–2 个量级；空气折射率补偿与 30 m 参考长度未建。
   */
  {
    id: 'plant/laser-tracker-30m',
    name: '30 m 激光跟踪仪',
    unit: '台',
    category: 'machine',
    // 单件计量仪器：光学头、转台、跟踪控制按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/length', kind: 'range', min: 0, max: 30, unit: 'm' },
      { param: 'accuracy', kind: 'range', min: 0.05, max: 0.5, unit: 'mm', dir: 'atMost' },
      { param: 'measure/angle', kind: 'range', min: 0, max: 360, unit: '°' },
      { param: 'measure/volume', kind: 'range', min: 0, max: 20000, unit: 'm³' },
    ],
  },

  /**
   * 75 kW@4.5 K 冷量负载：冷量 0–80 kW、温度 3.8–4.5 K、漏热 0–100 kW。
   *
   * props 是设计量程，不是读数：75 kW 负载是设计；现有 GM/JT 冷头 0.05–5 W，
   * 冷源差 4 个量级；满功率量热未做。
   */
  {
    id: 'plant/cryo-load-75kw',
    name: '75 kW@4.5 K 冷量负载',
    unit: '台',
    category: 'machine',
    // 单件计量仪器：加热器、冷屏、测量接口按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/coolingPower', kind: 'range', min: 0, max: 80, unit: 'kW' },
      { param: 'temperature', kind: 'range', min: 3.8, max: 4.5, unit: 'K' },
      { param: 'measure/heatLeak', kind: 'range', min: 0, max: 100, unit: 'kW' },
    ],
  },
];

export const BATCH2_ROUTES: readonly Route[] = [
  {
    /**
     * 500 t 称重台：316L 100 t + 锰铜 50 kg + 铜线 100 kg + 环氧 50 kg + 运放 16 件
     * → 台面/基础 → 锰铜应变式称重传感器 → 仪表/接线
     * → 用 20 kg 标准砝码做小量程标定 → 一台。
     *
     * 500 t 量程是设计；现有质量标准只到 20 kg，差 5 个量级；
     * 大质量校准砝码与液压测力机未建。
     */
    id: 'make/weighbridge-500t',
    name: '500 t 级称重台制造',
    produces: [
      {
        item: 'plant/weighbridge-500t',
        qty: q(1),
        gives: [
          { param: 'measure/mass', kind: 'range', min: 0, max: 600000, record: 'mat/cal-weighbridge-500t-record' },
          { param: 'measure/sectorMass', kind: 'range', min: 0, max: 600000, record: 'mat/cal-weighbridge-500t-record' },
          { param: 'resolution', kind: 'range', min: 1, max: 10, record: 'mat/cal-weighbridge-500t-record' },
          { param: 'accuracy', kind: 'range', min: 0.1, max: 0.5, record: 'mat/cal-weighbridge-500t-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(100000) }] },
      { anyOf: [{ item: 'mat/manganin', qty: q(50) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(100) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(50) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(16) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '台面与基础：316L 台面、基坑与支承', performedBy: 'plant/sheet-shop' },
      { note_zh: '锰铜应变式称重传感器', performedBy: 'plant/robot' },
      { note_zh: '仪表与接线', performedBy: 'plant/robot' },
      { note_zh: '用 20 kg 标准砝码做小量程标定', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 30 m 激光跟踪仪：玻璃 5 kg + 铜 20 kg + 铝 50 kg + 铜线 5 kg + 运放 10 件
     * → 光学头/干涉 → 二维转台 → 控制/跟踪 → 用 1 m 标准长度做短基线标定 → 一台。
     *
     * 30 m 是设计；现有激光直线度仪行程 1–3 m，差 1–2 个量级；
     * 空气折射率补偿与 30 m 参考长度未建。
     * 短基线参考借用 plant/laser-straightness：travel 1–3 m、µm/m 级。
     */
    id: 'make/laser-tracker-30m',
    name: '30 m 激光跟踪仪制造',
    produces: [
      {
        item: 'plant/laser-tracker-30m',
        qty: q(1),
        gives: [
          { param: 'measure/length', kind: 'range', min: 0, max: 30, record: 'mat/cal-laser-tracker-30m-record' },
          { param: 'accuracy', kind: 'range', min: 0.05, max: 0.5, record: 'mat/cal-laser-tracker-30m-record' },
          { param: 'measure/angle', kind: 'range', min: 0, max: 360, record: 'mat/cal-laser-tracker-30m-record' },
          { param: 'measure/volume', kind: 'range', min: 0, max: 20000, record: 'mat/cal-laser-tracker-30m-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(50) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(5) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(10) }] },
    ],
    needs: ['plant/laser-straightness'],
    steps: [
      { note_zh: '光学头与干涉：镜头、分光、探测', performedBy: 'lathe' },
      { note_zh: '二维转台：方位/俯仰轴系', performedBy: 'plant/grinder' },
      { note_zh: '控制与跟踪：伺服、跟踪算法', performedBy: 'plant/robot' },
      { note_zh: '用 1 m 标准长度做短基线标定', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 75 kW@4.5 K 冷量负载：316L 20 t + 铜 10 t + 锰铜 0.5 t + 水 5 t + 环氧 0.5 t
     * → 加热器/负载电阻 → 4 K 冷屏/绝热 → 温度/功率测量 → 总装 → 一台。
     *
     * 75 kW 负载是设计；现有 GM/JT 冷头 0.05–5 W，冷源差 4 个量级；
     * 满功率量热未做。
     */
    id: 'make/cryo-load-75kw',
    name: '75 kW@4.5 K 冷量负载制造',
    produces: [
      {
        item: 'plant/cryo-load-75kw',
        qty: q(1),
        gives: [
          { param: 'measure/coolingPower', kind: 'range', min: 0, max: 80, record: 'mat/cal-cryo-load-75kw-record' },
          { param: 'temperature', kind: 'range', min: 3.8, max: 4.5, record: 'mat/cal-cryo-load-75kw-record' },
          { param: 'measure/heatLeak', kind: 'range', min: 0, max: 100, record: 'mat/cal-cryo-load-75kw-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(20000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(10000) }] },
      { anyOf: [{ item: 'mat/manganin', qty: q(500) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5000) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(500) }] },
    ],
    needs: ['plant/jt-cooler'],
    steps: [
      { note_zh: '加热器与负载电阻：锰铜电阻、铜排', performedBy: 'plant/sheet-shop' },
      { note_zh: '4 K 冷屏与绝热', performedBy: 'plant/sheet-shop' },
      {
        note_zh: '温度与功率测量：3.8–4.5 K',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 3.8, max: 4.5 }],
      },
      { note_zh: '总装：负载、冷屏、测量接口总装', performedBy: 'plant/robot' },
    ],
  },
];

export const DATA_ITEMS: readonly Item[] = [...BATCH2_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...BATCH2_ROUTES];
