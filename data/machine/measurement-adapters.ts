/**
 * 测量转接夹具：控制周期、真空/压力、硼含量三件转接量具。
 *
 * 三台都是转接/夹具，量程写在 props 上；产出路线的 gives 全部标 design ——
 * 把“现有量具可测”改成“转接量具已建、缺标定”，量程是设计值，不是读数。
 *
 * 现有量具的缺口：
 *   scope 只有 measure/timeResolution，没有 measure/cycleTime；
 *   库内没有 plant/vacuum-gauge，压力只能借 euv-vacuum 与氦检漏仪比对；
 *   ICP-MS 只有 measure/boronDetectionLimit（ppb），没有 measure/boronContent。
 * 三件夹具把量程接出来，但都没有标准源/标样，标定仍是缺口。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ADAPTER_ITEMS: readonly Item[] = [
  /**
   * 控制周期转接夹具：周期 1e-6–1e-2 s、分辨率 1e-7–1e-5 s。
   *
   * scope 有 measure/timeResolution 0.2–0.5 ns，但没有 measure/cycleTime；
   * 本夹具把阶跃响应变成周期读数。0.5–1 ms 是设计，不是读数。
   */
  {
    id: 'plant/cycle-time-adapter',
    name: '控制周期转接夹具',
    unit: '台',
    category: 'machine',
    // 单件转接夹具：接口、整形、计数按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/cycleTime', kind: 'range', min: 0.001, max: 10, unit: 'ms' },
      { param: 'resolution', kind: 'range', min: 1e-7, max: 1e-5, unit: 's' },
    ],
  },

  /**
   * 真空/压力转接：压力 1e-6–1e-2 Pa、精度 1–5 %。
   *
   * 库内没有 plant/vacuum-gauge；pressure 1e-5–1e-4 Pa 借 euv-vacuum 的
   * 1e-8–1 Pa 与 he-leak-detector 的 1e-6–1e-2 Pa；没有标准真空计，
   * 比对不是标定。
   */
  {
    id: 'plant/pressure-adapter',
    name: '真空/压力转接',
    unit: '台',
    category: 'machine',
    // 单件转接夹具：法兰、规管接口、放大按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/pressure', kind: 'range', min: 1e-6, max: 1e-2, unit: 'Pa' },
      { param: 'measure/vacuum', kind: 'range', min: 1e-6, max: 1e-2, unit: 'Pa' },
      { param: 'accuracy', kind: 'range', min: 1, max: 5, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 硼含量消解/稀释夹具：硼含量 0.01–100000 ppm、精度 1–5 %。
   *
   * ICP-MS 只有 measure/boronDetectionLimit 0.5–50 ppb；1–2 % B 要稀释
   * 1e4–1e5 倍；没有混凝土基体标样，曲线是外标。
   */
  {
    id: 'plant/boron-assay-adapter',
    name: '硼含量消解/稀释夹具',
    unit: '台',
    category: 'machine',
    // 单件转接夹具：取芯、消解、稀释按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/boronContent', kind: 'range', min: 0.01, max: 100000, unit: 'ppm' },
      { param: 'accuracy', kind: 'range', min: 1, max: 5, unit: '%', dir: 'atMost' },
    ],
  },
];

export const ADAPTER_ROUTES: readonly Route[] = [
  {
    /**
     * 控制周期转接：运放 4 件 + 铜线 0.5 kg + 环氧 0.2 kg + 铝 1 kg
     * → 夹具/接口 → 整形/计数 → 用已知脉宽做短标定 → 一台。
     *
     * scope 有 measure/timeResolution 0.2–0.5 ns，但没有 measure/cycleTime；
     * 夹具把阶跃响应变成周期读数；0.5–1 ms 是设计，不是读数。
     */
    id: 'make/cycle-time-adapter',
    name: '控制周期转接夹具制造',
    produces: [
      {
        item: 'plant/cycle-time-adapter',
        qty: q(1),
        gives: [
          { param: 'measure/cycleTime', kind: 'range', min: 0.001, max: 10, record: 'mat/cal-cycle-time-adapter-record' },
          { param: 'resolution', kind: 'range', min: 1e-7, max: 1e-5, record: 'mat/cal-cycle-time-adapter-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
    ],
    needs: ['plant/scope-1ghz', 'plant/scope-1ghz/step-source'],
    steps: [
      { note_zh: '夹具与接口：阶跃源接口、SMA/同轴', performedBy: 'lathe' },
      { note_zh: '整形与计数：比较器、计数器', performedBy: 'plant/robot' },
      { note_zh: '用已知脉宽做短标定', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 压力转接：316L 5 kg + 铜 2 kg + 运放 4 件 + 环氧 0.5 kg
     * → 法兰/规管接口 → 读数/放大 → 用氦检漏仪压力通道比对 → 一台。
     *
     * 库内没有 plant/vacuum-gauge；借 euv-vacuum 的 1e-8–1 Pa 与
     * he-leak-detector 的 1e-6–1e-2 Pa；没有标准真空计，比对不是标定。
     */
    id: 'make/pressure-adapter',
    name: '真空/压力转接制造',
    produces: [
      {
        item: 'plant/pressure-adapter',
        qty: q(1),
        gives: [
          { param: 'measure/pressure', kind: 'range', min: 1e-6, max: 1e-2, record: 'mat/cal-pressure-adapter-record' },
          { param: 'measure/vacuum', kind: 'range', min: 1e-6, max: 1e-2, record: 'mat/cal-pressure-adapter-record' },
          { param: 'accuracy', kind: 'range', min: 1, max: 5, record: 'mat/cal-pressure-adapter-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(1, 2) }] },
    ],
    needs: ['plant/euv-vacuum', 'plant/he-leak-detector'],
    steps: [
      { note_zh: '法兰与规管接口', performedBy: 'lathe' },
      { note_zh: '读数与放大', performedBy: 'plant/robot' },
      { note_zh: '用氦检漏仪压力通道比对', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 硼含量夹具：PTFE 0.5 kg + 水 5 kg + 亚沸硝酸 0.5 kg + 运放 2 件
     * → 取芯/消解 → 稀释/内标 → 用硼标准液做曲线 → 一台。
     *
     * ICP-MS 只有 measure/boronDetectionLimit 0.5–50 ppb；1–2 % B 要稀释
     * 1e4–1e5 倍；没有混凝土基体标样，曲线是外标。
     */
    id: 'make/boron-assay-adapter',
    name: '硼含量消解/稀释夹具制造',
    produces: [
      {
        item: 'plant/boron-assay-adapter',
        qty: q(1),
        gives: [
          { param: 'measure/boronContent', kind: 'range', min: 0.01, max: 100000, record: 'mat/cal-boron-assay-adapter-record' },
          { param: 'accuracy', kind: 'range', min: 1, max: 5, record: 'mat/cal-boron-assay-adapter-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
      { anyOf: [{ item: 'mat/nitric-acid-subboiled', qty: q(1, 2) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
    ],
    needs: ['plant/icp-ms'],
    steps: [
      {
        note_zh: '取芯与消解：PTFE 消解罐',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 30 }],
      },
      { note_zh: '稀释与内标', performedBy: 'plant/robot' },
      { note_zh: '用硼标准液做曲线：没有混凝土基体标样', performedBy: 'plant/robot' },
    ],
  },
];

export const DATA_ITEMS: readonly Item[] = [...ADAPTER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...ADAPTER_ROUTES];
