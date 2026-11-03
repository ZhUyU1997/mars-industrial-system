/**
 * 湿法台的温压 commissioning：洗片、甩干与装片都在这一台上做。
 *
 * `plant/wet-bench` 的 `holds` 是 20–120 °C、100–500 kPa；这条路线把
 * **实际工作窗口**读窄：22–26 °C、120–180 kPa。两只表都是借的：T 型
 * 热电偶读温度，热磷酸槽的 1.6 级波登管表读腔压，读完装回。
 *
 * 这条记录只覆盖湿法台的环境，不覆盖清洗效果（颗粒/金属残留另有路线）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const WET_BENCH_MEASURE_ITEMS: readonly Item[] = [
  /**
   * 湿法台温压记录。**一份记录对应一次环境核查。**
   *
   *   benchTemperature  22–26 °C   能力 20–120
   *   benchPressure     120–180 kPa 能力 100–500
   *   method            thermocouple-gauge
   *
   * ⚠️ 记录的是台面环境，不是槽液温度；槽液由加热器另控，本记录不覆盖。
   */
  {
    id: 'mat/wet-bench-environment-record',
    name: '湿法台温压记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'benchTemperature', kind: 'range', min: 22, max: 26, unit: '°C' },
      { param: 'benchPressure', kind: 'range', min: 120, max: 180, unit: 'kPa' },
      // 生产 give 同名别名（wet-bench 用 temperature/pressure）。
      { param: 'temperature', kind: 'range', min: 22, max: 26, unit: '°C' },
      { param: 'pressure', kind: 'range', min: 120, max: 180, unit: 'kPa' },
      { param: 'method', kind: 'enum', values: ['thermocouple-gauge'] },
    ],
  },
];

export const WET_BENCH_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **湿法台环境：热电偶 + 波登管表，各读一点。**
     *
     *   ① 热电偶贴台面，稳定 20 min，读 22–26 °C；
     *   ② 波登管表接腔体取样口，读 120–180 kPa；
     *   ③ 记表号与读数，拆表装回。
     */
    id: 'measure/wet-bench-environment',
    name: '湿法台温压测量',
    produces: [
      {
        item: 'mat/wet-bench-environment-record',
        qty: q(1),
        gives: [
          { param: 'benchTemperature', kind: 'range', min: 22, max: 26 },
          { param: 'benchPressure', kind: 'range', min: 120, max: 180 },
          { param: 'temperature', kind: 'range', min: 22, max: 26 },
          { param: 'pressure', kind: 'range', min: 120, max: 180 },
          { param: 'method', kind: 'enum', oneOf: ['thermocouple-gauge'] },
        ],
      },
    ],
    uses: [],
    needs: [
      // 被校机器：湿法台；温度/压力窗口落在机器 20–120 °C / 100–500 kPa 内。
      {
        item: 'plant/wet-bench',
        qty: q(1),
        need: [
          { param: 'temperature', kind: 'range', min: 22, max: 26 },
          { param: 'pressure', kind: 'range', min: 120, max: 180 },
        ],
        onRelax: 'functional-kept',
      },
      'std/thermocouple-t-general',
      'plant/hot-phosphoric-bath/gauge',
    ],
    rate: { hours: q(2) },
    steps: [
      {
        note_zh: 'T 型热电偶贴台面，稳定 20 min，读 22–26 °C',
        performedBy: 'plant/wet-bench',
      },
      {
        note_zh: '1.6 级波登管表接腔体取样口，读 120–180 kPa；皂液查接头',
        performedBy: 'plant/wet-bench',
      },
      {
        note_zh: '记表号、温度与压力读数，拆表装回热磷酸槽',
        performedBy: 'plant/robot',
      },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...WET_BENCH_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...WET_BENCH_MEASURE_ROUTES];
