/**
 * 第三批测量量具：氦检漏仪、80–100 K 恒温台、10 MW/m² 热流试验台。
 *
 * 三台都是仪器，量程写在 props 上；产出路线的 gives 全部标 design ——
 * 校准与溯源还没有做，量程是设计值，不是读数，也不是记录。
 *
 * 现有能力的缺口：
 *   GC-MS 的灵敏度差 2–3 个量级，1e-9 级校准漏孔未建；
 *   GM 一级 45–80 K 加加热器只是最接近 80–100 K 的方案，区间未标；
 *   e-beam 的功率/束斑差 1–2 个量级，标准热流计未建。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const BATCH3_ITEMS: readonly Item[] = [
  /**
   * 氦检漏仪：漏率 1e-12–1e-8 Pa·m³/s、压力 1e-6–1e-2 Pa。
   *
   * props 是设计量程，不是读数：1e-9 量级是设计；现有 GC-MS 灵敏度差 2–3 个量级；
   * 1e-9 级校准漏孔未建。
   */
  {
    id: 'plant/he-leak-detector',
    name: '氦检漏仪',
    unit: '台',
    category: 'machine',
    // 单件计量仪器：真空腔、质谱接口、泵组按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/leakRate', kind: 'range', min: 1e-12, max: 1e-8, unit: 'Pa·m³/s' },
      { param: 'measure/pressure', kind: 'range', min: 1e-6, max: 1e-2, unit: 'Pa' },
    ],
  },

  /**
   * 80–100 K 恒温台：温度 80–100 K、稳定度 0.1–1 K。
   *
   * props 是设计量程，不是读数：80–100 K 是设计；GM 一级 45–80 K 加 heater
   * 只是最接近方案；T 型热偶在 80–100 K 区间未标。
   */
  {
    id: 'plant/thermostat-80-100k',
    name: '80–100 K 恒温台',
    unit: '台',
    category: 'machine',
    // 单件计量仪器：恒温腔、冷屏、控温按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'temperature', kind: 'range', min: 80, max: 100, unit: 'K' },
      { param: 'measure/temperature', kind: 'range', min: 80, max: 100, unit: 'K' },
      { param: 'stability', kind: 'range', min: 0.1, max: 1, unit: 'K', dir: 'atMost' },
    ],
  },

  /**
   * 10 MW/m² 热流试验台：热流 0–12 MW/m²、功率 0–100 kW、面积 1–10 cm²。
   *
   * props 是设计量程，不是读数：10 MW/m² 是设计；现有 e-beam 功率/束斑差
   * 1–2 个量级；标准热流计未建；只能用 20 kW 级源做小样。
   */
  {
    id: 'plant/heat-flux-rig-10mw',
    name: '10 MW/m² 热流试验台',
    unit: '台',
    category: 'machine',
    // 单件计量仪器：靶座、热沉、量热按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/heatFlux', kind: 'range', min: 0, max: 12, unit: 'MW/m²' },
      { param: 'measure/steadyHeatFlux', kind: 'range', min: 0, max: 12, unit: 'MW/m²' },
      { param: 'measure/power', kind: 'range', min: 0, max: 100, unit: 'kW' },
      { param: 'area', kind: 'range', min: 1, max: 10, unit: 'cm²' },
    ],
  },
];

export const BATCH3_ROUTES: readonly Route[] = [
  {
    /**
     * 氦检漏仪：316L 0.5 t + 铜 100 kg + 环氧 20 kg + 运放 20 件
     * → 真空腔/接口 → 质谱接口 → 泵组/管路 → 用标准漏孔标定 → 一台。
     *
     * 1e-9 量级是设计；现有 GC-MS 灵敏度差 2–3 个量级；1e-9 级校准漏孔未建。
     */
    id: 'make/he-leak-detector',
    name: '氦检漏仪制造',
    produces: [
      {
        item: 'plant/he-leak-detector',
        qty: q(1),
        gives: [
          { param: 'measure/leakRate', kind: 'range', min: 1e-12, max: 1e-8, record: 'mat/cal-he-leak-detector-record' },
          { param: 'measure/pressure', kind: 'range', min: 1e-6, max: 1e-2, record: 'mat/cal-he-leak-detector-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(500) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(100) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(20) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(20) }] },
    ],
    needs: ['plant/gc-ms', 'plant/euv-vacuum'],
    steps: [
      { note_zh: '真空腔与接口：316L 腔体、CF 法兰', performedBy: 'plant/sheet-shop' },
      { note_zh: '质谱接口：取样口与质谱连接', performedBy: 'plant/robot' },
      { note_zh: '泵组与管路：分子泵/前级泵与真空管', performedBy: 'plant/sheet-shop' },
      { note_zh: '用标准漏孔标定：1e-9 级漏孔未建', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 80–100 K 恒温台：316L 2 t + 铜 0.5 t + 水 0.1 t + 环氧 50 kg
     * + T 型热偶 10 支 → 恒温腔/冷屏 → 加热/控温 → 温度计/标定接口
     * → 总装 → 一台。
     *
     * 80–100 K 是设计；GM 一级 45–80 K 加 heater 只是最接近方案；
     * T 型热偶在 80–100 K 区间未标。
     */
    id: 'make/thermostat-80-100k',
    name: '80–100 K 恒温台制造',
    produces: [
      {
        item: 'plant/thermostat-80-100k',
        qty: q(1),
        gives: [
          { param: 'temperature', kind: 'range', min: 80, max: 100, record: 'mat/cal-thermostat-80-100k-record' },
          { param: 'measure/temperature', kind: 'range', min: 80, max: 100, record: 'mat/cal-thermostat-80-100k-record' },
          { param: 'stability', kind: 'range', min: 0.1, max: 1, record: 'mat/cal-thermostat-80-100k-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(2000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(500) }] },
      { anyOf: [{ item: 'mat/water', qty: q(100) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(50) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(10) }] },
    ],
    needs: ['plant/gm-cryocooler'],
    steps: [
      { note_zh: '恒温腔与冷屏：316L 腔体、铜冷屏', performedBy: 'plant/sheet-shop' },
      {
        note_zh: '加热与控温：45–80 K 冷台加 heater',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 45, max: 80 }],
      },
      { note_zh: '温度计与标定接口：T 型热偶', performedBy: 'plant/robot' },
      { note_zh: '总装：恒温腔、控温、温度计总装', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 10 MW/m² 热流试验台：316L 1 t + 铜 0.5 t + 水 1 t + 锰铜 50 kg + 环氧 20 kg
     * → 靶座/热沉 → 电子束/功率源接口 → 量热/水冷 → 总装 → 一台。
     *
     * 10 MW/m² 是设计；现有 e-beam 功率/束斑差 1–2 个量级；标准热流计未建；
     * 只能用 20 kW 级源做小样。
     */
    id: 'make/heat-flux-rig-10mw',
    name: '10 MW/m² 热流试验台制造',
    produces: [
      {
        item: 'plant/heat-flux-rig-10mw',
        qty: q(1),
        gives: [
          { param: 'measure/heatFlux', kind: 'range', min: 0, max: 12, record: 'mat/cal-heat-flux-rig-10mw-record' },
          { param: 'measure/steadyHeatFlux', kind: 'range', min: 0, max: 12, record: 'mat/cal-heat-flux-rig-10mw-record' },
          { param: 'measure/power', kind: 'range', min: 0, max: 100, record: 'mat/cal-heat-flux-rig-10mw-record' },
          { param: 'area', kind: 'range', min: 1, max: 10, record: 'mat/cal-heat-flux-rig-10mw-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(500) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/manganin', qty: q(50) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(20) }] },
    ],
    needs: ['plant/e-beam-column'],
    steps: [
      { note_zh: '靶座与热沉：316L 靶座、铜热沉', performedBy: 'plant/sheet-shop' },
      { note_zh: '电子束与功率源接口', performedBy: 'plant/robot' },
      { note_zh: '量热与水冷：锰铜量热计、水冷回路', performedBy: 'plant/sheet-shop' },
      { note_zh: '总装：靶座、热沉、量热总装', performedBy: 'plant/robot' },
    ],
  },
];

export const DATA_ITEMS: readonly Item[] = [...BATCH3_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...BATCH3_ROUTES];
