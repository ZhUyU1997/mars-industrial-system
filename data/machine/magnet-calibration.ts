/**
 * 磁体校准链：60 kA 直流源、10–13 T 标准场磁体、45 GJ dump/量热负载。
 *
 * 三台都是校准设备，量程写在 props 上；产出路线的 gives 全部标 design ——
 * 校准与溯源还没有做，量程是设计值，不是读数，也不是记录。
 *
 * 现有能力的缺口：
 *   电流源只到 2 kA，60 kA 与 70 kA 的源差 30–35 倍；
 *   10–13 T 标准场磁体不存在，磁体本身要靠电流与几何计算场，不是独立标准；
 *   45 GJ 的 dump 负载未建，41 GJ 满能量试验没有做过。
 * 这条链把“拿什么校准磁体测量”写成设备，但校准链的溯源仍是缺口。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const MAGNET_CALIBRATION_ITEMS: readonly Item[] = [
  /**
   * 60 kA 直流校准源：电流 0–60 kA、纹波 0.1–1 %、占空比 0.5–1。
   *
   * props 是设计量程，不是读数：现有源 2 kA，差 30 倍；纹波与温漂未测。
   */
  {
    id: 'plant/dc-source-60ka',
    name: '60 kA 直流校准源',
    unit: '台',
    category: 'machine',
    // 单件校准设备：变压器、整流、busbar 在整机内不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/current', kind: 'range', min: 0, max: 60000, unit: 'A' },
      { param: 'currentRipple', kind: 'range', min: 0.1, max: 1, unit: '%', dir: 'atMost' },
      { param: 'dutyCycle', kind: 'range', min: 0.5, max: 1, unit: '1' },
    ],
  },

  /**
   * 10–13 T 标准场磁体：场强 10–13 T、均匀性 50–500 ppm、孔径 50–100 mm。
   *
   * props 是设计量程，不是读数：12 T 标准场是设计；场均匀性与孔径是假设；
   * 磁体本身要靠电流与几何计算场，不是独立标准；溯源缺口未解。
   */
  {
    id: 'plant/standard-field-magnet-12t',
    name: '10–13 T 标准场磁体',
    unit: '台',
    category: 'machine',
    // 单件校准设备：线圈、恒温器、支撑在整机内不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/field', kind: 'range', min: 10, max: 13, unit: 'T' },
      { param: 'homogeneity', kind: 'range', min: 50, max: 500, unit: 'ppm', dir: 'atMost' },
      { param: 'bore', kind: 'range', min: 50, max: 100, unit: 'mm' },
    ],
  },

  /**
   * 45 GJ dump/量热负载：储能 30–45 GJ、电流 0–70 kA、电压 0–10 kV。
   *
   * props 是设计量程，不是读数：45 GJ dump 是设计；现有 2 kA 源只能做小样；
   * 41 GJ 满能量试验未做；水冷与量热未标定。
   */
  {
    id: 'plant/dump-load-45gj',
    name: '45 GJ 泄放/量热负载',
    unit: '台',
    category: 'machine',
    // 单件校准设备：电阻堆、水冷、开关在整机内不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/storedEnergy', kind: 'range', min: 30, max: 45, unit: 'GJ' },
      { param: 'measure/current', kind: 'range', min: 0, max: 70000, unit: 'A' },
      { param: 'measure/voltage', kind: 'range', min: 0, max: 10000, unit: 'V' },
    ],
  },
];

export const MAGNET_CALIBRATION_ROUTES: readonly Route[] = [
  {
    /**
     * 60 kA 直流源：硅钢 20 t + 铜 5 t + 铝 1 t + 水 5 t + 环氧 0.5 t
     * → 绕变压器/整流 → busbar/水冷 → 控制与保护 → 总装 → 一台。
     *
     * 借用高压试验台的变压器/整流工位。60 kA 源是设计，现有源 2 kA，差 30 倍；
     * 纹波与温漂未测。
     */
    id: 'make/dc-source-60ka',
    name: '60 kA 直流校准源制造',
    produces: [
      {
        item: 'plant/dc-source-60ka',
        qty: q(1),
        gives: [
          { param: 'measure/current', kind: 'range', min: 0, max: 60000, record: 'mat/cal-dc-source-record' },
          { param: 'currentRipple', kind: 'range', min: 0.1, max: 1, record: 'mat/cal-dc-source-record' },
          { param: 'dutyCycle', kind: 'range', min: 0.5, max: 1, record: 'mat/cal-dc-source-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-steel-3si', qty: q(20000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(5000) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5000) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(500) }] },
    ],
    needs: ['plant/hv-test-bench'],
    steps: [
      { note_zh: '绕变压器与整流：硅钢铁芯、铜绕组、整流桥', performedBy: 'plant/winder' },
      { note_zh: 'busbar 与水冷', performedBy: 'plant/sheet-shop' },
      { note_zh: '控制与保护：过流、过温、联锁', performedBy: 'plant/robot' },
      { note_zh: '总装：变压器、整流、母排与水冷总装', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 标准场磁体：Nb3Sn 2 t + NbTi 1 t + 316L 5 t + 铜 2 t + 环氧 0.2 t
     * → 绕线 → 反应热处理 → 浸渍 → 装 4 K 恒温器/总装 → 一台。
     *
     * 12 T 标准场是设计；场均匀性与孔径是假设。磁体本身要靠电流与几何计算场，
     * 不是独立标准；溯源缺口未解。4 K 由 jt-cooler 的 3.8–4.5 K 窗口承担。
     */
    id: 'make/standard-field-magnet-12t',
    name: '10–13 T 标准场磁体制造',
    produces: [
      {
        item: 'plant/standard-field-magnet-12t',
        qty: q(1),
        gives: [
          { param: 'measure/field', kind: 'range', min: 10, max: 13, record: 'mat/cal-standard-field-magnet-record' },
          { param: 'homogeneity', kind: 'range', min: 50, max: 500, record: 'mat/cal-standard-field-magnet-record' },
          { param: 'bore', kind: 'range', min: 50, max: 100, record: 'mat/cal-standard-field-magnet-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/nb3sn-cable', qty: q(2000) }] },
      { anyOf: [{ item: 'mat/nbti-cable', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(5000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2000) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(200) }] },
    ],
    needs: ['plant/jt-cooler'],
    steps: [
      { note_zh: '绕线：Nb3Sn/NbTi 线圈绕制', performedBy: 'plant/winder' },
      {
        note_zh: '反应热处理：650 °C、氧 0–50 ppm 生成 A15 相',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 600, max: 700 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '真空浸渍：环氧浸渍固化',
        performedBy: 'plant/autoclave',
        under: [
          { param: 'temperature', min: 150, max: 200 },
          { param: 'pressure', min: 10000, max: 35000 },
        ],
      },
      {
        note_zh: '装 4 K 恒温器与总装',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 3.8, max: 4.5 }],
      },
    ],
  },
  {
    /**
     * 45 GJ dump/量热负载：316L 200 t + 铜 50 t + 水 100 t + 锰铜 5 t + 环氧 2 t
     * → 电阻堆 → 水冷回路 → busbar/开关 → 量热与测量接口 → 一台。
     *
     * 45 GJ dump 是设计；现有 2 kA 源只能做小样；41 GJ 满能量试验未做；
     * 水冷与量热未标定。
     */
    id: 'make/dump-load-45gj',
    name: '45 GJ 泄放/量热负载制造',
    produces: [
      {
        item: 'plant/dump-load-45gj',
        qty: q(1),
        gives: [
          { param: 'measure/storedEnergy', kind: 'range', min: 30, max: 45, record: 'mat/cal-dump-load-record' },
          { param: 'measure/current', kind: 'range', min: 0, max: 70000, record: 'mat/cal-dump-load-record' },
          { param: 'measure/voltage', kind: 'range', min: 0, max: 10000, record: 'mat/cal-dump-load-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(200000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(50000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(100000) }] },
      { anyOf: [{ item: 'mat/manganin', qty: q(5000) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(2000) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '电阻堆：316L 框架与锰铜电阻', performedBy: 'plant/sheet-shop' },
      { note_zh: '水冷回路：100 t 水与换热', performedBy: 'plant/sheet-shop' },
      { note_zh: 'busbar 与开关', performedBy: 'plant/robot' },
      { note_zh: '量热与测量接口', performedBy: 'plant/robot' },
    ],
  },
];

export const DATA_ITEMS: readonly Item[] = [...MAGNET_CALIBRATION_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...MAGNET_CALIBRATION_ROUTES];
