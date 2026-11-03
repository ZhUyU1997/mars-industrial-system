/**
 * 磁体量程补齐：0–6 T 低场 NMR 探头、0–300 Wb 磁通计。
 *
 * 两台都是仪器，量程写在 props 上；产出路线的 gives 全部标 design ——
 * 校准与溯源还没有做，量程是设计值，不是读数，也不是记录。
 *
 * 现有量具的缺口：
 *   high-field-nmr-probe 只覆盖 10–13 T，PF 的 5–6 T 不在量程；
 *   全库没有 measure/flux，CS 的 220–260 Wb 无法直接量；
 *   1 T 以上没有标准场，300 Wb 满量程也没有标准源，只能外推。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const RANGE_FILL_ITEMS: readonly Item[] = [
  /**
   * 0–6 T 低场 NMR 探头：场 0–6 T、分辨率 1–10 ppm、频率 10–300 MHz。
   *
   * props 是设计量程，不是读数：现有 high-field-nmr-probe 只覆盖 10–13 T，
   * PF 的 5–6 T 不在量程；1 T 以上无标准场，只能用 1 T 磁扇外推。
   */
  {
    id: 'plant/low-field-nmr-probe',
    name: '0–6 T 低场 NMR 探头',
    unit: '台',
    category: 'machine',
    // 单件计量仪器：探头线圈、安瓿、振荡/锁相按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/field', kind: 'range', min: 0, max: 6, unit: 'T' },
      { param: 'measure/peakField', kind: 'range', min: 0, max: 6, unit: 'T' },
      { param: 'resolution', kind: 'range', min: 1, max: 10, unit: 'ppm', dir: 'atMost' },
      { param: 'measure/frequency', kind: 'range', min: 10, max: 300, unit: 'MHz' },
    ],
  },

  /**
   * 0–300 Wb 磁通计：磁通 0–300 Wb、精度 0.5–2 %、电压 0–10 V。
   *
   * props 是设计量程，不是读数：全库没有 measure/flux；CS flux 220–260 Wb
   * 是设计；搜索线圈+积分器只能小磁通标定，300 Wb 满量程未标。
   */
  {
    id: 'plant/fluxmeter-300wb',
    name: '0–300 Wb 磁通计',
    unit: '台',
    category: 'machine',
    // 单件计量仪器：搜索线圈、积分器、补偿按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/flux', kind: 'range', min: 0, max: 300, unit: 'Wb' },
      { param: 'accuracy', kind: 'range', min: 0.5, max: 2, unit: '%', dir: 'atMost' },
      { param: 'measure/voltage', kind: 'range', min: 0, max: 10, unit: 'V' },
    ],
  },
];

export const RANGE_FILL_ROUTES: readonly Route[] = [
  {
    /**
     * 低场 NMR 探头：铜线 0.5 kg + 玻璃 0.2 kg + 水 2 kg + 运放 4 件
     * → 绕探头线圈 → 封水样安瓿 → 装 10–300 MHz 振荡/锁相
     * → 用 1 T 磁扇标定 → 一台。
     *
     * 现有 high-field-nmr-probe 只覆盖 10–13 T，PF 的 5–6 T 不在量程；
     * 本探头覆盖 0–6 T；1 T 以上无标准场，只能用 1 T 磁扇外推。
     */
    id: 'make/low-field-nmr-probe',
    name: '0–6 T 低场 NMR 探头制造',
    produces: [
      {
        item: 'plant/low-field-nmr-probe',
        qty: q(1),
        gives: [
          { param: 'measure/field', kind: 'range', min: 0, max: 6, record: 'mat/cal-low-field-nmr-record' },
          { param: 'measure/peakField', kind: 'range', min: 0, max: 6, record: 'mat/cal-low-field-nmr-record' },
          { param: 'resolution', kind: 'range', min: 1, max: 10, record: 'mat/cal-low-field-nmr-record' },
          { param: 'measure/frequency', kind: 'range', min: 10, max: 300, record: 'mat/cal-low-field-nmr-record' },
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
      { note_zh: '绕探头线圈：低场线圈绕制', performedBy: 'lathe' },
      {
        note_zh: '封水样安瓿：玻璃封口',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 30 }],
      },
      {
        note_zh: '装 10–300 MHz 振荡与锁相',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      { note_zh: '用 1 T 磁扇标定：1 T 以上无标准场', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 磁通计：铜线 5 kg + 锰铜 1 kg + 运放 10 件 + 环氧 1 kg
     * → 搜索线圈/积分器 → 电压/漂移补偿
     * → 用已知电感与 60 kA 源做小磁通标定 → 一台。
     *
     * 全库没有 measure/flux；CS flux 220–260 Wb 是设计；搜索线圈+积分器
     * 只能小磁通标定，300 Wb 满量程未标。
     */
    id: 'make/fluxmeter-300wb',
    name: '0–300 Wb 磁通计制造',
    produces: [
      {
        item: 'plant/fluxmeter-300wb',
        qty: q(1),
        gives: [
          { param: 'measure/flux', kind: 'range', min: 0, max: 300, record: 'mat/cal-fluxmeter-record' },
          { param: 'accuracy', kind: 'range', min: 0.5, max: 2, record: 'mat/cal-fluxmeter-record' },
          { param: 'measure/voltage', kind: 'range', min: 0, max: 10, record: 'mat/cal-fluxmeter-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper-wire', qty: q(5) }] },
      { anyOf: [{ item: 'mat/manganin', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(10) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(1) }] },
    ],
    needs: ['plant/rogowski-50ka', 'plant/dc-source-60ka'],
    steps: [
      { note_zh: '搜索线圈与积分器', performedBy: 'plant/winder' },
      { note_zh: '电压与漂移补偿', performedBy: 'plant/robot' },
      { note_zh: '用已知电感与 60 kA 源做小磁通标定', performedBy: 'plant/robot' },
    ],
  },
];

export const DATA_ITEMS: readonly Item[] = [...RANGE_FILL_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...RANGE_FILL_ROUTES];
