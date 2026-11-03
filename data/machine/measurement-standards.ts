/**
 * 测量标准夹具：角度、厚度、漏率、功率、速度、长度六件。
 *
 * 六台都是标准夹具，量程写在 props 上；产出路线的 gives 全部标 design ——
 * 校准与溯源还没有做，量程是设计值，不是读数，也不是记录。
 *
 * 现有量具的缺口：
 *   自准直仪/千分尺/校准尺/万用表/锰铜电阻都是标准件，但缺少把它们组装成
 *   可交付量程的夹具；漏率与速度没有一级标准；300 mm 与 0–100 W 都是设计量程。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const STANDARD_ITEMS: readonly Item[] = [
  /**
   * 角度标准：角度 0–360°、分辨率 0.1–1″。
   *
   * 自准直仪提供角度读数，底座用 316L；0–360° 是设计量程，不是读数。
   */
  {
    id: 'plant/angle-standard',
    name: '角度标准',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/angle', kind: 'range', min: 0, max: 360, unit: '°' },
      { param: 'resolution', kind: 'range', min: 0.1, max: 1, unit: '″' },
    ],
    // 组成件：精密自准直仪 1 台；底座材料在装配路线里投入。
    composedOf: [{ item: 'std/autocollimator-precision', qty: q(1) }],
  },

  /**
   * 厚度标准：厚度 0–300 mm、分辨率 0.0001–0.1 mm。
   *
   * 千分尺只覆盖 0–25 mm、校准尺只覆盖 0–100 mm 段；0–300 mm 是设计量程，
   * 分段衔接与不确定度未标。
   */
  {
    id: 'plant/thickness-standard',
    name: '厚度标准',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/thickness', kind: 'range', min: 0, max: 300, unit: 'mm' },
      { param: 'resolution', kind: 'range', min: 0.0001, max: 0.1, unit: 'mm' },
    ],
    // 组成件：千分尺 0–25 与 100 mm 校准尺各 1；底座材料在装配路线里投入。
    composedOf: [
      { item: 'std/micrometer-0-25', qty: q(1) },
      { item: 'std/calibrated-scale-100', qty: q(1) },
    ],
  },

  /**
   * 漏率标准：漏率 0–0.001 Pa·L/s、精度 1–5 %。
   *
   * 没有 1e-9 级校准漏孔，0.001 量程是设计；毛细漏孔的一致性未标。
   */
  {
    id: 'plant/leak-rate-standard',
    name: '漏率标准',
    unit: '台',
    category: 'machine',
    // 单件夹具：毛细漏孔、密封、比对接口按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/leakRate', kind: 'range', min: 0, max: 0.001, unit: 'Pa·L/s' },
      { param: 'accuracy', kind: 'range', min: 1, max: 5, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 电气功率标准：功率 0–100 W、精度 0.2–1 %。
   *
   * 万用表 + 锰铜电阻做电气功率标准，不是光功率；0–100 W 是设计。
   */
  {
    id: 'plant/power-standard-100w',
    name: '电气功率标准',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/power', kind: 'range', min: 0, max: 100, unit: 'W' },
      { param: 'accuracy', kind: 'range', min: 0.2, max: 1, unit: '%', dir: 'atMost' },
    ],
    // 组成件：万用表 1 台、锰铜精密电阻 1 件；负载材料在装配路线里投入。
    composedOf: [
      { item: 'std/dvm-general', qty: q(1) },
      { item: 'std/precision-resistor-manganin', qty: q(1) },
    ],
  },

  /**
   * 速度标准：速度 0–300 m/s、精度 1–5 %。
   *
   * 转盘/斩波用已知周长与转速折算速度；300 m/s 是设计，高速段没有标准源。
   */
  {
    id: 'plant/velocity-standard',
    name: '速度标准',
    unit: '台',
    category: 'machine',
    // 单件夹具：转盘、驱动、测速按整台装配，不再拆独立零件，标 monolithic。
    monolithic: true,
    props: [
      { param: 'measure/velocity', kind: 'range', min: 0, max: 300, unit: 'm/s' },
      { param: 'accuracy', kind: 'range', min: 1, max: 5, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 长度标准：长度 0–300 mm、精度 0.01–0.1 mm。
   *
   * 100 mm 校准尺与量块只覆盖 0–100 mm 段；0–300 mm 是设计量程，
   * 分段衔接与不确定度未标。
   */
  {
    id: 'plant/length-standard-300mm',
    name: '长度标准',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/length', kind: 'range', min: 0, max: 300, unit: 'mm' },
      { param: 'accuracy', kind: 'range', min: 0.01, max: 0.1, unit: 'mm', dir: 'atMost' },
    ],
    // 组成件：100 mm 校准尺与工作量块各 1；底座材料在装配路线里投入。
    composedOf: [
      { item: 'std/calibrated-scale-100', qty: q(1) },
      { item: 'std/gauge-block-working', qty: q(1) },
    ],
  },
];

export const STANDARD_ROUTES: readonly Route[] = [
  {
    /**
     * 角度标准：自准直仪 + 316L 底座 20 kg → 装配 → 一台。
     *
     * 0–360° 与 0.1–1″ 是设计量程，不是读数。
     */
    id: 'make/fusion-angle-standard',
    name: '角度标准制造',
    produces: [
      {
        item: 'plant/angle-standard',
        qty: q(1),
        gives: [
          { param: 'measure/angle', kind: 'range', min: 0, max: 360, record: 'mat/cal-angle-standard-record' },
          { param: 'resolution', kind: 'range', min: 0.1, max: 1, record: 'mat/cal-angle-standard-record' },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(20) }] }],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 厚度标准：千分尺 + 100 mm 校准尺 + 316L 底座 20 kg → 装配 → 一台。
     *
     * 千分尺只到 25 mm、校准尺只到 100 mm；0–300 mm 是设计量程。
     */
    id: 'make/thickness-standard',
    name: '厚度标准制造',
    produces: [
      {
        item: 'plant/thickness-standard',
        qty: q(1),
        gives: [
          { param: 'measure/thickness', kind: 'range', min: 0, max: 300, record: 'mat/cal-thickness-standard-record' },
          { param: 'resolution', kind: 'range', min: 0.0001, max: 0.1, record: 'mat/cal-thickness-standard-record' },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(20) }] }],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 漏率标准：玻璃 0.2 kg + 铜 0.5 kg + 环氧 0.2 kg
     * → 毛细漏孔/密封 → 压力/流量比对 → 标定接口 → 一台。
     *
     * 没有 1e-9 级校准漏孔，0.001 量程是设计。
     */
    id: 'make/leak-rate-standard',
    name: '漏率标准制造',
    produces: [
      {
        item: 'plant/leak-rate-standard',
        qty: q(1),
        gives: [
          { param: 'measure/leakRate', kind: 'range', min: 0, max: 0.001, record: 'mat/cal-leak-rate-standard-record' },
          { param: 'accuracy', kind: 'range', min: 1, max: 5, record: 'mat/cal-leak-rate-standard-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(1, 5) }] },
    ],
    needs: ['plant/he-leak-detector', 'plant/pressure-adapter'],
    steps: [
      { note_zh: '毛细漏孔与密封', performedBy: 'plant/sheet-shop' },
      { note_zh: '压力/流量比对', performedBy: 'plant/robot' },
      { note_zh: '标定接口', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 功率标准：万用表 + 锰铜电阻 + 316L 10 kg + 铜 2 kg（负载）
     * → 装配 → 一台。
     *
     * 电气功率标准，不是光功率；0–100 W 是设计。
     */
    id: 'make/power-standard-100w',
    name: '电气功率标准制造',
    produces: [
      {
        item: 'plant/power-standard-100w',
        qty: q(1),
        gives: [
          { param: 'measure/power', kind: 'range', min: 0, max: 100, record: 'mat/cal-power-standard-100w-record' },
          { param: 'accuracy', kind: 'range', min: 0.2, max: 1, record: 'mat/cal-power-standard-100w-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(2) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 速度标准：铝 20 kg + 316L 20 kg + 7.5 kW 电机 + 旋转编码器
     * → 转盘/斩波 → 驱动/测速 → 已知周长/转速标定 → 一台。
     *
     * 300 m/s 是设计；高速段没有标准源。
     */
    id: 'make/velocity-standard',
    name: '速度标准制造',
    produces: [
      {
        item: 'plant/velocity-standard',
        qty: q(1),
        gives: [
          { param: 'measure/velocity', kind: 'range', min: 0, max: 300, record: 'mat/cal-velocity-standard-record' },
          { param: 'accuracy', kind: 'range', min: 1, max: 5, record: 'mat/cal-velocity-standard-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(20) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(20) }] },
      { anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(1) }] },
      { anyOf: [{ item: 'std/rotary-encoder', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '转盘与斩波：铝盘、316L 支架', performedBy: 'lathe' },
      { note_zh: '驱动与测速：电机、编码器', performedBy: 'plant/robot' },
      { note_zh: '已知周长/转速标定', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 长度标准：100 mm 校准尺 + 工作量块 + 316L 底座 10 kg → 装配 → 一台。
     *
     * 校准尺与量块只覆盖 0–100 mm 段；0–300 mm 是设计量程。
     */
    id: 'make/length-standard-300mm',
    name: '长度标准制造',
    produces: [
      {
        item: 'plant/length-standard-300mm',
        qty: q(1),
        gives: [
          { param: 'measure/length', kind: 'range', min: 0, max: 300, record: 'mat/cal-length-standard-300mm-record' },
          { param: 'accuracy', kind: 'range', min: 0.01, max: 0.1, record: 'mat/cal-length-standard-300mm-record' },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(10) }] }],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ITEMS: readonly Item[] = [...STANDARD_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...STANDARD_ROUTES];
