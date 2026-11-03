/**
 * 第五批测量量具：80–100 K 发射率计、瞬态热流源、氦库存计量台。
 *
 * 三台都是仪器，量程写在 props 上；产出路线的 gives 全部标 design ——
 * 校准与溯源还没有做，量程是设计值，不是读数，也不是记录。
 *
 * 现有能力的缺口：
 *   80 K 黑体标准未建，发射率只能做室温相对标定；
 *   20 kW 激光在 mm² 束斑上才到 20 MW/m²，束斑与脉宽未标；
 *   25 t 氦库存没有同级计量标准，只能用 1 kg 瓶外推 4 个量级。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const BATCH5_ITEMS: readonly Item[] = [
  /**
   * 80–100 K 红外发射率计：发射率 0.01–0.2、温度 80–100 K、不确定度 0.01–0.05。
   *
   * props 是设计量程，不是读数：80 K 黑体标准未建；只能用室温黑体做相对标定；
   * 发射率 0.05–0.1 是设计。
   */
  {
    id: 'plant/emissometer-80k',
    name: '80–100 K Infrared Emissometer', name_zh: '80–100 K 红外发射率计',
    unit: '台',
    category: 'machine',
    // 单件计量仪器：黑体腔、探测器、温控按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/emissivity', kind: 'range', min: 0.01, max: 0.2, unit: '1' },
      { param: 'temperature', kind: 'range', min: 80, max: 100, unit: 'K' },
      { param: 'uncertainty', kind: 'range', min: 0.01, max: 0.05, unit: '1', dir: 'atMost' },
    ],
  },

  /**
   * 20–25 MW/m² 瞬态热流源：热流 0–30 MW/m²、脉宽 1–10 ms、能量 0–100 kJ。
   *
   * props 是设计量程，不是读数：20–25 MW/m² 是设计；现有 20 kW 激光在 mm²
   * 束斑上才到 20 MW/m²，束斑/脉宽未标；标准热流计未建。
   */
  {
    id: 'plant/transient-heat-source',
    name: '20–25 MW/m² Transient Heat Flux Source', name_zh: '20–25 MW/m² 瞬态热流源',
    unit: '台',
    category: 'machine',
    // 单件计量仪器：光束整形、脉冲电源、量热按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/heatFlux', kind: 'range', min: 0, max: 30, unit: 'MW/m²' },
      { param: 'measure/transientHeatFlux', kind: 'range', min: 0, max: 30, unit: 'MW/m²' },
      { param: 'pulse', kind: 'range', min: 1, max: 10, unit: 'ms' },
      { param: 'energy', kind: 'range', min: 0, max: 100, unit: 'kJ' },
    ],
  },

  /**
   * 25 t 氦库存计量台：质量 0–30 t、压力 0–20 MPa、温度 250–350 K。
   *
   * props 是设计量程，不是读数：25 t 是设计；现有氦库存 25 t 是 R10 一次性装填，
   * 没有 25 t 级计量标准；只能用 1 kg 瓶外推 4 个量级。
   */
  {
    id: 'plant/he-inventory-meter',
    name: '25 t Helium Inventory Metering Bench', name_zh: '25 t 氦库存计量台',
    unit: '台',
    category: 'machine',
    // 单件计量仪器：压力容器、计、记录按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/mass', kind: 'range', min: 0, max: 30000, unit: 'kg' },
      { param: 'measure/heliumInventory', kind: 'range', min: 0, max: 30000, unit: 'kg' },
      { param: 'pressure', kind: 'range', min: 0, max: 20, unit: 'MPa' },
      { param: 'temperature', kind: 'range', min: 250, max: 350, unit: 'K' },
    ],
  },
];

export const BATCH5_ROUTES: readonly Route[] = [
  {
    /**
     * 发射率计：铜 20 kg + 铝 50 kg + 碳化硅 5 kg + 碳 2 kg + 运放 10 件
     * → 黑体/参考腔 → 红外探测器/斩波 → 温控/读数 → 室温黑体短标定 → 一台。
     *
     * 没有 mat/graphite 与 mat/black-paint；黑涂层用 mat/carbon 2 kg 代替，
     * 光谱发射率未标。80 K 黑体标准未建，只能做室温相对标定；
     * 发射率 0.05–0.1 是设计。
     */
    id: 'make/emissometer-80k',
    name: '80–100 K Infrared Emissometer Manufacturing', name_zh: '80–100 K 红外发射率计制造',
    produces: [
      {
        item: 'plant/emissometer-80k',
        qty: q(1),
        gives: [
          { param: 'measure/emissivity', kind: 'range', min: 0.01, max: 0.2, record: 'mat/cal-emissometer-80k-record' },
          { param: 'temperature', kind: 'range', min: 80, max: 100, record: 'mat/cal-emissometer-80k-record' },
          { param: 'uncertainty', kind: 'range', min: 0.01, max: 0.05, record: 'mat/cal-emissometer-80k-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(50) }] },
      { anyOf: [{ item: 'mat/silicon-carbide', qty: q(5) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(2) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(10) }] },
    ],
    needs: ['plant/thermostat-80-100k'],
    steps: [
      { note_zh: '黑体与参考腔：铜腔、碳黑涂层', performedBy: 'plant/sheet-shop' },
      { note_zh: '红外探测器与斩波', performedBy: 'plant/robot' },
      { note_zh: '温控与读数', performedBy: 'plant/robot' },
      { note_zh: '用室温黑体做短标定：80 K 黑体标准未建', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 瞬态热流源：316L 500 kg + 铜 200 kg + 钨粉 20 kg + 水 500 kg + 环氧 20 kg
     * → 光束整形/靶座 → 脉冲电源/快门 → 量热/水冷 → 总装 → 一台。
     *
     * 20–25 MW/m² 是设计；现有 20 kW 激光在 mm² 束斑上才到 20 MW/m²，
     * 束斑/脉宽未标；标准热流计未建。
     * plant/slab-laser-20kw 不存在，前置件用其产出件 plant/euv-source/laser（18–22 kW）。
     */
    id: 'make/transient-heat-source',
    name: '20–25 MW/m² Transient Heat Flux Source Manufacturing', name_zh: '20–25 MW/m² 瞬态热流源制造',
    produces: [
      {
        item: 'plant/transient-heat-source',
        qty: q(1),
        gives: [
          { param: 'measure/heatFlux', kind: 'range', min: 0, max: 30, record: 'mat/cal-transient-heat-source-record' },
          { param: 'measure/transientHeatFlux', kind: 'range', min: 0, max: 30, record: 'mat/cal-transient-heat-source-record' },
          { param: 'pulse', kind: 'range', min: 1, max: 10, record: 'mat/cal-transient-heat-source-record' },
          { param: 'energy', kind: 'range', min: 0, max: 100, record: 'mat/cal-transient-heat-source-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(500) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(200) }] },
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(500) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(20) }] },
    ],
    needs: ['plant/euv-source/laser'],
    steps: [
      { note_zh: '光束整形与靶座', performedBy: 'plant/sheet-shop' },
      { note_zh: '脉冲电源与快门', performedBy: 'plant/robot' },
      { note_zh: '量热与水冷', performedBy: 'plant/sheet-shop' },
      { note_zh: '总装：靶座、电源、量热总装', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 氦库存计量台：316L 5 t + 铜 0.5 t + 铝 0.2 t + 运放 20 件 + 环氧 50 kg
     * → 压力容器/管路 → 压力/温度/流量计 → 数据记录 → 1 kg 氦瓶小量程标定
     * → 一台。
     *
     * 25 t 是设计；现有氦库存 25 t 是 R10 一次性装填，没有 25 t 级计量标准；
     * 只能用 1 kg 瓶外推 4 个量级。
     * std/pressure-gauge 不存在，压力测量用 std/opamp-chip-general 20 件搭。
     */
    id: 'make/he-inventory-meter',
    name: '25 t Helium Inventory Metering Bench Manufacturing', name_zh: '25 t 氦库存计量台制造',
    produces: [
      {
        item: 'plant/he-inventory-meter',
        qty: q(1),
        gives: [
          { param: 'measure/mass', kind: 'range', min: 0, max: 30000, record: 'mat/cal-he-inventory-meter-record' },
          { param: 'measure/heliumInventory', kind: 'range', min: 0, max: 30000, record: 'mat/cal-he-inventory-meter-record' },
          { param: 'pressure', kind: 'range', min: 0, max: 20, record: 'mat/cal-he-inventory-meter-record' },
          { param: 'temperature', kind: 'range', min: 250, max: 350, record: 'mat/cal-he-inventory-meter-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(5000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(500) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(200) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(20) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(50) }] },
    ],
    needs: ['plant/air-compressor'],
    steps: [
      { note_zh: '压力容器与管路：316L 容器、取样管', performedBy: 'plant/sheet-shop' },
      { note_zh: '压力/温度/流量计，用运放搭测量电路', performedBy: 'plant/robot' },
      { note_zh: '数据记录', performedBy: 'plant/robot' },
      { note_zh: '用 1 kg 氦瓶做小量程标定', performedBy: 'plant/robot' },
    ],
  },
];

export const DATA_ITEMS: readonly Item[] = [...BATCH5_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...BATCH5_ROUTES];
