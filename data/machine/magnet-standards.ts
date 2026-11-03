/**
 * 磁体一级标准：50 kA 分流器、10–13 T 场图标准、30–45 GJ 量热标准。
 *
 * 三台都是一级标准，量程写在 props 上；产出路线的 gives 全部标 design ——
 * 校准与溯源还没有做，量程是设计值，不是读数，也不是记录。
 *
 * 现有能力的缺口：
 *   50 kA × 0.1 mΩ 的满功率标定要 21.6 MW 散热，现有 2 kA 源只能标到 1/30；
 *   12 T 磁体的场是计算场，不是独立标准，探头本身也未标；
 *   45 GJ 入 100 t 水约升 107 K，5–50 K 的量程不够，实际要分流或加大水箱。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const MAGNET_STANDARD_ITEMS: readonly Item[] = [
  /**
   * 50 kA 电流标准分流器：电流 0–60 kA、精度 0.05–0.2 %、电阻 0.01–0.1 mΩ。
   *
   * props 是设计量程，不是读数：0.1 mΩ × 60 kA = 360 V / 21.6 MW；
   * 50 kA 满功率标定要 60 kA 源与 21.6 MW 散热；现有 2 kA 源只能标到 1/30；
   * 精度 0.05 % 是设计；无 50 kA 初级标准。
   */
  {
    id: 'plant/shunt-50ka-standard',
    name: '50 kA 电流标准分流器',
    unit: '台',
    category: 'machine',
    // 单件一级标准：锰铜板、busbar、水冷按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/current', kind: 'range', min: 0, max: 60000, unit: 'A' },
      { param: 'accuracy', kind: 'range', min: 0.05, max: 0.2, unit: '%', dir: 'atMost' },
      { param: 'resistance', kind: 'range', min: 0.01, max: 0.1, unit: 'mΩ' },
    ],
  },

  /**
   * 10–13 T 场图/NMR 标准：场 10–13 T、均匀性 50–500 ppm、定位 0.1–1 mm。
   *
   * props 是设计量程，不是读数：场图/均匀性是设计；绝对场仍靠 NMR 频率比，
   * 探头未标；定位 0.1 mm 是设计；12 T 磁体本身是计算场，不是独立标准。
   */
  {
    id: 'plant/field-mapping-standard-12t',
    name: '10–13 T 场图/NMR 标准',
    unit: '台',
    category: 'machine',
    // 单件一级标准：三轴台、探头夹持、采集按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/field', kind: 'range', min: 10, max: 13, unit: 'T' },
      { param: 'homogeneity', kind: 'range', min: 50, max: 500, unit: 'ppm', dir: 'atMost' },
      { param: 'positioning', kind: 'range', min: 0.1, max: 1, unit: 'mm', dir: 'atMost' },
    ],
  },

  /**
   * 30–45 GJ 量热标准：能量 30–45 GJ、温升 5–50 K、不确定度 1–5 %。
   *
   * props 是设计量程，不是读数：45 GJ 入 100 t 水约升 107 K，5–50 K 的量程
   * 不够，实际要分流/大水箱；41 GJ 满能量试验未做；电能-热量标定未做。
   */
  {
    id: 'plant/calorimeter-45gj',
    name: '30–45 GJ 量热标准',
    unit: '台',
    category: 'machine',
    // 单件一级标准：水箱、换热器、测温阵列按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/energy', kind: 'range', min: 30, max: 45, unit: 'GJ' },
      { param: 'temperatureRise', kind: 'range', min: 5, max: 50, unit: 'K' },
      { param: 'uncertainty', kind: 'range', min: 1, max: 5, unit: '%', dir: 'atMost' },
    ],
  },
];

export const MAGNET_STANDARD_ROUTES: readonly Route[] = [
  {
    /**
     * 50 kA 分流器：锰铜 500 kg + 铜 2 t + 水 5 t + 316L 1 t
     * → 锰铜板/铜 busbar → 水冷与电压端子 → 四线测量接口
     * → 用 2 kA 源做小电流标定 → 一台。
     *
     * 0.1 mΩ × 60 kA = 360 V / 21.6 MW；50 kA 满功率标定要 60 kA 源与
     * 21.6 MW 散热；现有 2 kA 源只能标到 1/30；精度 0.05 % 是设计；
     * 无 50 kA 初级标准。
     */
    id: 'make/shunt-50ka-standard',
    name: '50 kA 电流标准分流器制造',
    produces: [
      {
        item: 'plant/shunt-50ka-standard',
        qty: q(1),
        gives: [
          { param: 'measure/current', kind: 'range', min: 0, max: 60000, record: 'mat/cal-shunt-record' },
          { param: 'accuracy', kind: 'range', min: 0.05, max: 0.2, record: 'mat/cal-shunt-record' },
          { param: 'resistance', kind: 'range', min: 0.01, max: 0.1, record: 'mat/cal-shunt-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/manganin', qty: q(500) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5000) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1000) }] },
    ],
    needs: ['plant/dc-source-60ka'],
    steps: [
      { note_zh: '锰铜板与铜 busbar', performedBy: 'plant/sheet-shop' },
      { note_zh: '水冷与电压端子', performedBy: 'plant/robot' },
      { note_zh: '四线测量接口', performedBy: 'plant/robot' },
      { note_zh: '用 2 kA 源做小电流标定', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 12 T 场图标准：铝 200 kg + 铜 100 kg + 316L 500 kg + 运放 20 件
     * → 三轴扫描台 → 探头夹持/定位 → 多点场图采集
     * → 用标准场磁体做重复性标定 → 一台。
     *
     * 场图/均匀性是设计；绝对场仍靠 NMR 频率比，探头未标；定位 0.1 mm 是设计；
     * 12 T 磁体本身是计算场，不是独立标准。
     */
    id: 'make/field-mapping-standard-12t',
    name: '10–13 T 场图/NMR 标准制造',
    produces: [
      {
        item: 'plant/field-mapping-standard-12t',
        qty: q(1),
        gives: [
          { param: 'measure/field', kind: 'range', min: 10, max: 13, record: 'mat/cal-field-mapping-record' },
          { param: 'homogeneity', kind: 'range', min: 50, max: 500, record: 'mat/cal-field-mapping-record' },
          { param: 'positioning', kind: 'range', min: 0.1, max: 1, record: 'mat/cal-field-mapping-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(200) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(100) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(500) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(20) }] },
    ],
    needs: ['plant/high-field-nmr-probe', 'plant/standard-field-magnet-12t'],
    steps: [
      { note_zh: '三轴扫描台：导轨、丝杠、驱动', performedBy: 'lathe' },
      { note_zh: '探头夹持与定位', performedBy: 'plant/robot' },
      { note_zh: '多点场图采集', performedBy: 'plant/robot' },
      { note_zh: '用标准场磁体做重复性标定', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 45 GJ 量热标准：316L 20 t + 铜 5 t + 水 100 t + T 型热偶 50 支 + 环氧 100 kg
     * → 水箱/搅拌 → 换热器/测温阵列 → 电能/水温标定 → 总装 → 一台。
     *
     * 45 GJ 入 100 t 水约升 107 K，5–50 K 的量程不够，实际要分流/大水箱；
     * 41 GJ 满能量试验未做；电能-热量标定未做。
     */
    id: 'make/calorimeter-45gj',
    name: '30–45 GJ 量热标准制造',
    produces: [
      {
        item: 'plant/calorimeter-45gj',
        qty: q(1),
        gives: [
          { param: 'measure/energy', kind: 'range', min: 30, max: 45, record: 'mat/cal-calorimeter-record' },
          { param: 'temperatureRise', kind: 'range', min: 5, max: 50, record: 'mat/cal-calorimeter-record' },
          { param: 'uncertainty', kind: 'range', min: 1, max: 5, record: 'mat/cal-calorimeter-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(20000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(5000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(100000) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(50) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(100) }] },
    ],
    needs: ['plant/dump-load-45gj'],
    steps: [
      { note_zh: '水箱与搅拌', performedBy: 'plant/sheet-shop' },
      { note_zh: '换热器与测温阵列', performedBy: 'plant/robot' },
      { note_zh: '电能/水温标定', performedBy: 'plant/robot' },
      { note_zh: '总装：水箱、换热器、测温总装', performedBy: 'plant/robot' },
    ],
  },
];

export const DATA_ITEMS: readonly Item[] = [...MAGNET_STANDARD_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...MAGNET_STANDARD_ROUTES];
