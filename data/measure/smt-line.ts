/**
 * SMT 线的温度 commissioning：丝印腔、贴片腔与回流峰值。
 *
 * 三台设备的 `holds` 给的是能力边界（20–30、20–28、100–300 °C）；这条路线
 * 把**实际工作窗口**读窄：丝印腔 22–26 °C、贴片腔 21–26 °C、回流峰值
 * 235–245 °C（炉温），四温区同一时刻最大差 8–12 K，带速 0.32–0.38 m/min。
 *
 * 量的是机器腔体与炉温曲线，不是板面峰值：板面比炉温低 5–15 K（热容与
 * 接触），本层没有板载测温片，这一项按未测记。峰值靠炉内四支 T 型热电偶
 * 随链板走一遍读出；四支轮读、每 30 s 一点；带速靠链板标记与秒表。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const SMT_MEASURE_ITEMS: readonly Item[] = [
  /**
   * SMT 线热参数记录。**一份记录对应一次走线。**
   *
   *   printerChamberTemperature   22–26 °C   丝印腔实测（能力 20–30）
   *   pickPlaceChamberTemperature 21–26 °C   贴片腔实测（能力 20–28）
   *   reflowPeakTemperature       235–245 °C 回流峰值实测（炉温；板面低 5–15 K，按未测记）
   *   zoneTolerance               8–12 K     四温区同一时刻最大差
   *   beltSpeed                   0.32–0.38 m/min
   *   method                      thermocouple-profile
   *
   * ⚠️ 峰值与区偏差是炉内热电偶的读数，不是板面实测；板面峰值按未测记。
   */
  {
    id: 'mat/smt-thermal-profile-record',
    name: 'SMT 线热参数记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'printerChamberTemperature', kind: 'range', min: 22, max: 26, unit: '°C' },
      { param: 'pickPlaceChamberTemperature', kind: 'range', min: 21, max: 26, unit: '°C' },
      { param: 'reflowPeakTemperature', kind: 'range', min: 235, max: 245, unit: '°C' },
      { param: 'zoneTolerance', kind: 'range', min: 8, max: 12, unit: 'K' },
      // 与 `make/reflow-furnace` 的 give 同名别名（同一批四区读数）。
      { param: 'tolerance', kind: 'range', min: 8, max: 12, unit: 'K' },
      { param: 'beltSpeed', kind: 'range', min: 0.32, max: 0.38, unit: 'm/min' },
      { param: 'method', kind: 'enum', values: ['thermocouple-profile'] },
    ],
  },
];

export const SMT_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **SMT 线热参数：三处腔温 + 回流曲线，一支热电偶走完。**
     *
     *   ① 丝印腔：热电偶贴台面，稳定 20 min，读 22–26 °C；
     *   ② 贴片腔：热电偶贴治具板，读 21–26 °C；
     *   ③ 回流炉：炉内四支 T 型热电偶随链板走 0.35 m/min，每 30 s 轮读一次；
     *   ④ 换算：毫伏表读热电势，按 T 型分度表换温度；峰值 235–245 °C、
     *      四区偏差 8–12 K、带速 0.32–0.38 m/min。
     *
     * 这一步只证明"腔体与炉温落在窗口里"，不证明焊点质量。
     */
    id: 'measure/smt-thermal-profile',
    name: 'SMT 线热参数测量',
    produces: [
      {
        item: 'mat/smt-thermal-profile-record',
        qty: q(1),
        gives: [
          { param: 'printerChamberTemperature', kind: 'range', min: 22, max: 26 },
          { param: 'pickPlaceChamberTemperature', kind: 'range', min: 21, max: 26 },
          { param: 'reflowPeakTemperature', kind: 'range', min: 235, max: 245 },
          { param: 'zoneTolerance', kind: 'range', min: 8, max: 12 },
          { param: 'tolerance', kind: 'range', min: 8, max: 12 },
          { param: 'beltSpeed', kind: 'range', min: 0.32, max: 0.38 },
          { param: 'method', kind: 'enum', oneOf: ['thermocouple-profile'] },
        ],
      },
    ],
    uses: [],
    needs: [
      {
        item: 'plant/reflow-furnace',
        qty: q(1),
        need: [
          { param: 'beltSpeed', kind: 'range', min: 0.32, max: 0.38 },
          { param: 'tolerance', kind: 'range', min: 8, max: 12 },
        ],
        onRelax: 'functional-kept',
      },
      'plant/clean-room',
      'std/millivoltmeter-general',
    ],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh: '丝印腔：T 型热电偶贴台面，稳定 20 min，读腔温 22–26 °C',
        performedBy: 'plant/solder-printer',
      },
      {
        note_zh: '贴片腔：热电偶贴治具板，读加压箱温度 21–26 °C',
        performedBy: 'plant/pick-place',
      },
      {
        note_zh: '回流炉：炉内四支 T 型热电偶随链板走 0.35 m/min，每 30 s 轮读四区',
        performedBy: 'plant/reflow-furnace',
      },
      {
        note_zh:
          '毫伏表读热电势、按 T 型分度表换算：峰值 235–245 °C、四区偏差 8–12 K、带速 0.32–0.38 m/min',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh: '回流炉 1 台（进、出，不消耗）+ 丝印/贴片腔（进、出，不占用）+ 热电偶、毫伏表（进、出，不占用）→ 热参数记录 1 份；记录是数据不是物料。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...SMT_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...SMT_MEASURE_ROUTES];
