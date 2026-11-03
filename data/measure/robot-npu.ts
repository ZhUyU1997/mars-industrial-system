/**
 * NPU 模块装配的热参数 commissioning：回流、贴装、烧录三段的实测窗口。
 *
 * `make/robot-npu` 的三段条件一直挂 design：回流 220–250 °C、贴装 20–28 °C
 * 与 100–500 kPa、烧录 19–21 °C。三台的 `holds` 都覆盖这些窗口，但没有
 * 读数。这条路线把三段读窄：回流 225–245 °C、贴装 21–26 °C / 120–180 kPa、
 * 烧录 19.5–20.5 °C。
 *
 * ⚠️ 量的是机器腔体与炉温，不是板面峰值；TOPS 仍是设计窗口（没有推理
 *    框架可跑），本记录不碰它。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ROBOT_NPU_MEASURE_ITEMS: readonly Item[] = [
  /**
   * NPU 模块装配热参数记录。**一份记录对应一次装配。**
   *
   *   reflowTemperature    225–245 °C   回流峰值（设计窗口 220–250）
   *   pickPlaceTemperature 21–26 °C     加压箱温度（设计 20–28）
   *   pickPlacePressure    120–180 kPa  加压箱压力（设计 100–500）
   *   burnInTemperature    19.5–20.5 °C 烧录/测试间（设计 19–21）
   *   method               thermocouple-gauge
   */
  {
    id: 'mat/robot-npu-thermal-record',
    name: 'NPU Module Assembly Thermal Parameter Record', name_zh: 'NPU 模块装配热参数记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'reflowTemperature', kind: 'range', min: 225, max: 245, unit: '°C' },
      { param: 'pickPlaceTemperature', kind: 'range', min: 21, max: 26, unit: '°C' },
      { param: 'pickPlacePressure', kind: 'range', min: 120, max: 180, unit: 'kPa' },
      { param: 'burnInTemperature', kind: 'range', min: 19.5, max: 20.5, unit: '°C' },
      { param: 'method', kind: 'enum', values: ['thermocouple-gauge'] },
    ],
  },
];

export const ROBOT_NPU_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **三段热参数：回流曲线、贴装腔温压、烧录间温度。**
     *
     *   ① 回流：四支 T 型热电偶随链板走，读峰值 225–245 °C；
     *   ② 贴装：热电偶贴治具板、波登管表接加压箱，读 21–26 °C / 120–180 kPa；
     *   ③ 烧录：恒温间的温度计读 19.5–20.5 °C；
     *   ④ 记表号与读数。
     */
    id: 'measure/robot-npu-thermal',
    name: 'NPU Module Assembly Thermal Parameter Measurement', name_zh: 'NPU 模块装配热参数测量',
    produces: [
      {
        item: 'mat/robot-npu-thermal-record',
        qty: q(1),
        gives: [
          { param: 'reflowTemperature', kind: 'range', min: 225, max: 245 },
          { param: 'pickPlaceTemperature', kind: 'range', min: 21, max: 26 },
          { param: 'pickPlacePressure', kind: 'range', min: 120, max: 180 },
          { param: 'burnInTemperature', kind: 'range', min: 19.5, max: 20.5 },
          { param: 'method', kind: 'enum', oneOf: ['thermocouple-gauge'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/robot/npu', qty: q(1) }] }],
    needs: ['std/thermocouple-t-general', 'plant/hot-phosphoric-bath/gauge', 'std/millivoltmeter-general'],
    rate: { hours: q(5) },
    steps: [
      {
        note_zh: '回流：炉内四支 T 型热电偶随链板走，读峰值 225–245 °C',
        performedBy: 'plant/reflow-furnace',
        under: [{ param: 'temperature', min: 225, max: 245 }],
      },
      {
        note_zh: '贴装：热电偶贴治具板、1.6 级表接加压箱，读 21–26 °C / 120–180 kPa',
        performedBy: 'plant/pick-place',
        under: [
          { param: 'temperature', min: 21, max: 26 },
          { param: 'pressure', min: 120, max: 180 },
        ],
      },
      {
        note_zh: '烧录/测试间：温度计读 19.5–20.5 °C',
        performedBy: 'plant/metrology-room',
        under: [{ param: 'temperature', min: 19.5, max: 20.5 }],
      },
      {
        note_zh: '记表号与三段读数',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh: 'NPU 模块 1 件（进、出，不消耗）+ 热电偶/压力表（进、出，不占用）→ 热参数记录 1 份；记录是数据不是物料。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ROBOT_NPU_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...ROBOT_NPU_MEASURE_ROUTES];
