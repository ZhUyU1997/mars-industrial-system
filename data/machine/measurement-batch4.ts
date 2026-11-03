/**
 * 第四批测量量具：氚量热计、控制可用率试验台、混凝土超声测厚仪。
 *
 * 三台都是仪器，量程写在 props 上；产出路线的 gives 全部标 design ——
 * 校准与溯源还没有做，量程是设计值，不是读数，也不是记录。
 *
 * 现有能力的缺口：
 *   没有氚标准源，氚量热只能用电气加热标定；
 *   没有 10^6 次长期运行台，控制可用率只能短时抽测；
 *   没有已知厚度的 1–3 m 混凝土标准块，测厚只能做 0.5 m 级短基线。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const BATCH4_ITEMS: readonly Item[] = [
  /**
   * 氚量热计：氚存量 0–5 kg、热功率 0–2000 W、分辨率 1–10 mW。
   *
   * props 是设计量程，不是读数：2–3 kg 氚的衰变热约 0.65–1 kW（0.32 W/g），
   * 量程 2 kW 是设计；没有氚标准源，只能用电气加热标定；氚 handling 未建。
   */
  {
    id: 'plant/tritium-calorimeter',
    name: '氚量热计',
    unit: '台',
    category: 'machine',
    // 单件计量仪器：量热腔、屏蔽、热电堆按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/tritiumInventory', kind: 'range', min: 0, max: 5, unit: 'kg' },
      { param: 'measure/heat', kind: 'range', min: 0, max: 2000, unit: 'W' },
      { param: 'resolution', kind: 'range', min: 1, max: 10, unit: 'mW', dir: 'atMost' },
    ],
  },

  /**
   * 控制可用率试验台：可用率 0.8–0.99、循环 1000–1,000,000 次、响应 0.1–10 ms。
   *
   * props 是设计量程，不是读数：0.9–0.95 可用率是设计；没有 10^6 次长期运行台；
   * 响应时间用 1 GHz 示波器，量程够但长期计时未标。
   */
  {
    id: 'plant/control-availability-bench',
    name: '控制可用率试验台',
    unit: '台',
    category: 'machine',
    // 单件计量仪器：机架、负载、故障注入按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/availability', kind: 'range', min: 0.8, max: 0.99, unit: '1' },
      { param: 'measure/cycles', kind: 'range', min: 1000, max: 1000000, unit: '次' },
      { param: 'measure/response', kind: 'range', min: 0.1, max: 10, unit: 'ms' },
    ],
  },

  /**
   * 混凝土超声测厚仪：厚度 0.5–3 m、声速 2000–5000 m/s、精度 1–5 %。
   *
   * props 是设计量程，不是读数：0.5–3 m 是设计；没有已知厚度的 1–3 m 混凝土
   * 标准块；声速 2000–5000 m/s 是假设；短基线只能到 0.5 m 级。
   */
  {
    id: 'plant/concrete-thickness-gauge',
    name: '混凝土超声测厚仪',
    unit: '台',
    category: 'machine',
    // 单件计量仪器：换能器、脉冲/接收、计时按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/thickness', kind: 'range', min: 0.5, max: 3, unit: 'm' },
      { param: 'measure/velocity', kind: 'range', min: 2000, max: 5000, unit: 'm/s' },
      { param: 'accuracy', kind: 'range', min: 1, max: 5, unit: '%', dir: 'atMost' },
    ],
  },
];

export const BATCH4_ROUTES: readonly Route[] = [
  {
    /**
     * 氚量热计：铜 200 kg + 铅 500 kg + 316L 100 kg + T 型热偶 20 支 + 环氧 20 kg
     * → 量热腔/屏蔽 → 热电堆/热偶 → 电气标定加热器 → 总装 → 一台。
     *
     * 2–3 kg 氚的衰变热约 0.65–1 kW；量程 2 kW 是设计；没有氚标准源，
     * 只能用电气加热标定；氚 handling 未建。
     */
    id: 'make/tritium-calorimeter',
    name: '氚量热计制造',
    produces: [
      {
        item: 'plant/tritium-calorimeter',
        qty: q(1),
        gives: [
          { param: 'measure/tritiumInventory', kind: 'range', min: 0, max: 5, record: 'mat/cal-tritium-calorimeter-record' },
          { param: 'measure/heat', kind: 'range', min: 0, max: 2000, record: 'mat/cal-tritium-calorimeter-record' },
          { param: 'resolution', kind: 'range', min: 1, max: 10, record: 'mat/cal-tritium-calorimeter-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(200) }] },
      { anyOf: [{ item: 'mat/lead', qty: q(500) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(100) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(20) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(20) }] },
    ],
    needs: ['plant/boron-free-lab'],
    steps: [
      { note_zh: '量热腔与屏蔽：铜腔、铅屏蔽', performedBy: 'plant/sheet-shop' },
      { note_zh: '热电堆与热偶：温度传感', performedBy: 'plant/robot' },
      { note_zh: '电气标定加热器：已知功率输入', performedBy: 'plant/robot' },
      { note_zh: '总装：量热腔、屏蔽、加热器总装', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 控制可用率试验台：控制板 4 + 接触器 4 + 功率器件 2 + 铜线 5 kg + 环氧 5 kg
     * → 机架/负载 → 故障注入/继电器 → 记录/计时 → 总装 → 一台。
     *
     * 0.9–0.95 可用率是设计；没有 10^6 次长期运行台；响应时间用 1 GHz 示波器，
     * 量程够但长期计时未标。
     */
    id: 'make/control-availability-bench',
    name: '控制可用率试验台制造',
    produces: [
      {
        item: 'plant/control-availability-bench',
        qty: q(1),
        gives: [
          { param: 'measure/availability', kind: 'range', min: 0.8, max: 0.99, record: 'mat/cal-control-availability-bench-record' },
          { param: 'measure/cycles', kind: 'range', min: 1000, max: 1000000, record: 'mat/cal-control-availability-bench-record' },
          { param: 'measure/response', kind: 'range', min: 0.1, max: 10, record: 'mat/cal-control-availability-bench-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/control-board-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/power-device-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(5) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(5) }] },
    ],
    needs: ['plant/scope-1ghz'],
    steps: [
      { note_zh: '机架与负载：控制板、接触器、负载', performedBy: 'plant/sheet-shop' },
      { note_zh: '故障注入与继电器', performedBy: 'plant/robot' },
      { note_zh: '记录与计时', performedBy: 'plant/robot' },
      { note_zh: '总装：机架、负载、记录总装', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 混凝土超声测厚仪：钛酸钡 0.5 kg + 铜 2 kg + 铝 5 kg + 运放 10 件 + 环氧 2 kg
     * → 压电换能器 → 脉冲/接收电路 → 计时/显示 → 用钢管/混凝土试块做短基线标定
     * → 一台。
     *
     * 0.5–3 m 是设计；没有已知厚度的 1–3 m 混凝土标准块；声速 2000–5000 m/s
     * 是假设；短基线只能到 0.5 m 级。
     */
    id: 'make/concrete-thickness-gauge',
    name: '混凝土超声测厚仪制造',
    produces: [
      {
        item: 'plant/concrete-thickness-gauge',
        qty: q(1),
        gives: [
          { param: 'measure/thickness', kind: 'range', min: 0.5, max: 3, record: 'mat/cal-concrete-thickness-gauge-record' },
          { param: 'measure/velocity', kind: 'range', min: 2000, max: 5000, record: 'mat/cal-concrete-thickness-gauge-record' },
          { param: 'accuracy', kind: 'range', min: 1, max: 5, record: 'mat/cal-concrete-thickness-gauge-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/barium-titanate', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(5) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(10) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(2) }] },
    ],
    needs: ['plant/scope-1ghz'],
    steps: [
      { note_zh: '压电换能器：钛酸钡片与背衬', performedBy: 'lathe' },
      { note_zh: '脉冲与接收电路', performedBy: 'plant/robot' },
      { note_zh: '计时与显示', performedBy: 'plant/robot' },
      { note_zh: '用钢管/混凝土试块做短基线标定', performedBy: 'plant/robot' },
    ],
  },
];

export const DATA_ITEMS: readonly Item[] = [...BATCH4_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...BATCH4_ROUTES];
