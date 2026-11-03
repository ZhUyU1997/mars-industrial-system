/**
 * 锰铜丝三区温度的 commissioning：熔炼、均匀化、中间退火。
 *
 * `plant/pgm-wire-mill` 的 `holds` 是 20–1900 °C，窗口很宽；这条路线把
 * 实际用的三档读窄：熔炼 1120–1180 °C、均匀化 810–840 °C、中间退火
 * 420–480 °C。三档各插一支 **K 型（NiCr-NiAl，非标准 K，逐支用
 * `measure/thermocouple-cal` 的三点记录标定）**，稳 30 min 读一次。
 *
 * ⚠️ 不用 T 型（铜-康铜）：T 型上限 400 °C，三档里最低的退火档 420–480 °C
 * 也已超出，熔炼档 1120–1180 °C 更是把铜热端直接熔掉。
 * ⚠️ K 型的标定点最高到 Cu 1084.6 °C（Zn 419.5 / Al 660.3 / Cu 1084.6）；
 * 熔炼档 1120–1180 °C 在 Cu 点之上，是**外推**，分度偏差按 ±10–20 °C 记，
 * 不写成读数。
 *
 * 低温退火 130–140 °C 不在这里读：它由 `measure/manganin-tcr` 的 TCR
 * 记录背书，本路线只管前三档。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const MANGANIN_FURNACE_ITEMS: readonly Item[] = [
  /**
   * 锰铜三区温度记录。**一份记录对应一炉。**
   *
   *   meltTemperature    1120–1180 °C   感应熔炼（设计 1100–1200）
   *   homogenizeTemperature 810–840 °C  均匀化（设计 800–850）
   *   annealTemperature  420–480 °C     中间退火（设计 400–500）
   *   method             thermocouple
   *
   * ⚠️ 记录的是炉膛三区温度，不是丝的温度；丝在炉内随炉膛走。
   */
  {
    id: 'mat/manganin-furnace-record',
    name: '锰铜三区温度记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'meltTemperature', kind: 'range', min: 1120, max: 1180, unit: '°C' },
      { param: 'homogenizeTemperature', kind: 'range', min: 810, max: 840, unit: '°C' },
      { param: 'annealTemperature', kind: 'range', min: 420, max: 480, unit: '°C' },
      { param: 'method', kind: 'enum', values: ['thermocouple'] },
    ],
  },
];

export const MANGANIN_FURNACE_ROUTES: readonly Route[] = [
  {
    /**
     * **三区温度：三支标定过的 K 型热电偶，各稳 30 min。**
     *
     *   ① 熔炼区插一支，读 1120–1180 °C（Cu 点以上，外推）；
     *   ② 均匀化区插一支，读 810–840 °C；
     *   ③ 中间退火区插一支，读 420–480 °C；
     *   ④ 记表号与三档读数。
     */
    id: 'measure/manganin-furnace-temperature',
    name: '锰铜三区温度测量',
    produces: [
      {
        item: 'mat/manganin-furnace-record',
        qty: q(1),
        gives: [
          { param: 'meltTemperature', kind: 'range', min: 1120, max: 1180 },
          { param: 'homogenizeTemperature', kind: 'range', min: 810, max: 840 },
          { param: 'annealTemperature', kind: 'range', min: 420, max: 480 },
          { param: 'method', kind: 'enum', oneOf: ['thermocouple'] },
        ],
      },
    ],
    uses: [],
    needs: [
      // 被校机器：熔炼/均匀化/退火三区都在这条线上；窗口落在机器 20–1900 内。
      // ⚠️ 本层没有独立的 manganin-furnace 条目，按“最接近”取 plant/pgm-wire-mill
      // （Pt 丝拉丝/退火线，含感应熔炼与退火工位），不是同名设备；记录注释点名。
      { item: 'plant/pgm-wire-mill', qty: q(1), need: [{ param: 'temperature', kind: 'range', min: 1100, max: 1200 }], onRelax: 'functional-kept' },
      'std/thermocouple-nicr-nial-general',
      'mat/thermocouple-cal-record',
      'std/millivoltmeter-general',
    ],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh: '熔炼区插 K 型热电偶（逐支标定），稳 30 min，读 1120–1180 °C；高于 Cu 点 1084.6 °C 的部分是外推',
        performedBy: 'plant/pgm-wire-mill',
      },
      {
        note_zh: '均匀化区插热电偶，稳 30 min，读 810–840 °C',
        performedBy: 'plant/pgm-wire-mill',
      },
      {
        note_zh: '中间退火区插热电偶，稳 30 min，读 420–480 °C',
        performedBy: 'plant/pgm-wire-mill',
      },
      {
        note_zh: '记表号与三档读数；毫伏表按三点标定曲线换算，不用标准 K 分度表',
        performedBy: 'plant/robot',
      },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...MANGANIN_FURNACE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...MANGANIN_FURNACE_ROUTES];
