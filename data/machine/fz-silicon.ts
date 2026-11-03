/**
 * 区熔硅（FZ-Si）与区熔炉 —— X 射线干涉仪晶体的上游材料。
 *
 * 直拉（CZ）硅含氧 10–20 ppma，氧沉淀会破坏晶格完整性；X 射线干涉仪
 * 的 0.7 mm 三片 lamellae 要无氧、无位错的 FZ 硅。本文件补两件：
 *
 *   std/fz-silicon           φ100–200 mm、ρ 10–50 Ω·cm、O ≤1e16 cm⁻³、位错 0
 *   plant/float-zone-puller  20 kW RF、2–5 MHz、0.5–5 mm/min、真空/Ar
 *
 * 区熔炉的难点不在炉体：RF 线圈的场分布、熔区稳定性、无坩埚下拉的
 * 直径控制、位错成核。20 kW RF 发生器用 `plant/rf-generator-20kw`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FZ_SILICON_ITEMS: readonly Item[] = [
  /**
   * 区熔硅片：φ100–200 mm、ρ 10–50 Ω·cm（design）、O 2e15–8e15 cm⁻³（design）、
   * 位错 0；不是 CZ 片。
   */
  {
    id: 'std/fz-silicon',
    name: '区熔硅片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 100, max: 200, unit: 'mm' },
      { param: 'resistivity', kind: 'range', min: 1, max: 100, unit: 'Ω·cm' },
      { param: 'oxygen', kind: 'range', min: 0, max: 1e16, unit: 'cm⁻³', dir: 'atMost' },
      { param: 'dislocation', kind: 'range', min: 0, max: 0, unit: 'cm⁻²', dir: 'atMost' },
    ],
  },

  /**
   * 区熔炉：20 kW RF、2–5 MHz、0.5–5 mm/min、φ100–200 mm、真空/Ar。
   *
   * 无坩埚：RF 线圈直接耦合到硅棒，熔区靠表面张力/电磁力约束；
   * 线圈场分布、熔区稳定、下拉速度是位错/直径的根。
   */
  {
    id: 'plant/float-zone-puller',
    name: '区熔炉',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'rfPower', kind: 'range', min: 0, max: 25000, unit: 'W', dir: 'atMost' },
      { param: 'frequency', kind: 'range', min: 2, max: 5, unit: 'MHz' },
      { param: 'pullRate', kind: 'range', min: 0.1, max: 10, unit: 'mm/min' },
      { param: 'diameter', kind: 'range', min: 100, max: 200, unit: 'mm' },
    ],
  },
];

export const FZ_SILICON_ROUTES: readonly Route[] = [
  {
    /**
     * **区熔炉：20 kW RF + 铜线圈 + 真空腔 + 0.5 nm 台。**
     *
     *   RF 1 + 台 1 + 腔 1 + 铜 5 + 控制板 1 + 钢 2 → 区熔炉 1
     *
     * 300 h 是装配/调校估算；RF 18–22 kW、2–5 MHz 是 design。
     */
    id: 'make/float-zone-puller',
    name: '区熔炉制造',
    produces: [
      {
        item: 'plant/float-zone-puller',
        qty: q(1),
        gives: [
          { param: 'rfPower', kind: 'range', min: 18000, max: 22000, record: 'mat/float-zone-puller-rf-power-measure-record' },
          { param: 'frequency', kind: 'range', min: 2, max: 5 },
          { param: 'pullRate', kind: 'range', min: 0.5, max: 5 },
          { param: 'diameter', kind: 'range', min: 100, max: 200 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/rf-generator-20kw', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-stepper-hina/stage', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-stepper-hina/chamber', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(5) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(2) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/euv-vacuum'],
    rate: { hours: q(300) },
    steps: [
      {
        note_zh: '装 RF 线圈/腔/下拉台：2–5 MHz、18–22 kW；线圈场分布',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '抽真空/Ar 置换；0.5–5 mm/min 下拉；熔区稳定/直径控制',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '试拉 φ100–200；位错/直径/电阻率验收（设计值）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: 'RF 1 + 台 1 + 腔 1 + 铜 5 + 控制板 1 + 钢 2 → 区熔炉 1；余是装配/调校损耗。',
  },
  {
    /**
     * **区熔硅：多晶硅棒 → 区熔 → 切片 → 腐蚀。**
     *
     *   多晶硅 5 + 氩 0.1 → FZ 硅片 1
     *
     * ρ 10–50 Ω·cm、O 2e15–8e15 cm⁻³、位错 0 是 design；50 h 估算。
     */
    id: 'make/fz-silicon',
    name: '区熔硅片制造',
    produces: [
      {
        item: 'std/fz-silicon',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 100, max: 200 },
          { param: 'resistivity', kind: 'range', min: 10, max: 50, record: 'mat/fz-silicon-resistivity-measure-record' },
          { param: 'oxygen', kind: 'range', min: 2e15, max: 8e15, record: 'mat/fz-silicon-oxygen-ftir-measure-record' },
          { param: 'dislocation', kind: 'range', min: 0, max: 0 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/polysilicon', qty: q(5) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(50) },
    steps: [
      {
        note_zh: '多晶硅棒装区熔炉；20 kW RF 熔区，0.5–5 mm/min 下拉',
        performedBy: 'plant/float-zone-puller',
      },
      {
        note_zh: '切片/腐蚀；ρ/氧/位错复检（设计值）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '写能力域 10–50 Ω·cm、2e15–8e15 cm⁻³、位错 0；不写 10 pm 已测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '多晶硅 5 + 氩 0.1 → FZ 硅片 1；余是区熔/切片/腐蚀损耗。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...FZ_SILICON_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...FZ_SILICON_ROUTES];
