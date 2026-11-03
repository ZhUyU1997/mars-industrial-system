/**
 * 把四件"从地球来的电子件"变成能自产 —— 那句话的兑现。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 替代是过渡，不是目标
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 那四件种子（功率器件、控制板、传感器、无源件）一直有"本地替代"：
 *
 * ⚠️ **之后只剩三件走这条路**：控制板回种子清单 —— 它是"算"，
 * 而前提给的机器人自带算力。下面留着控制板那一段注释作记录。
 *
 *   功率器件 → 晶闸管、旋转变流机
 *   控制板   → 分立元件板（绕接）
 *   传感器   → 热电偶、光电二极管
 *   无源件   → 镍铬电阻丝、薄膜电容
 *
 * 但替代品是"绕开"，不是"造出同一件东西"。**这一节把后者补上** ——
 * 四个条目第一次有了自己的产出路线，于是它们不再是种子。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 四件的做法
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   功率器件   晶闸管 + 二极管 + 铜 + 帽壳 → 封装成一件"功率组件"
 *   无源件     镍铬丝绕电阻 + 薄膜电容 + 铜引线 + 酚醛 → 一件"无源组件"
 *   控制板     ~~芯片 + 铜 + 酚醛板 + 插座~~ → **不造（旁路）**
 *   传感器     热电偶 + 光电池 + 帽壳 + 铜 → 一件"传感器"
 *
 * ⚠️ 一处必须说清：这四件造出来**比地球上的差**。
 * 地球上的功率器件是 MOS/IGBT（本层只有晶闸管与双极型），控制板是印制板（本层是绕接），
 * 传感器是集成化的（本层是分立元件拼的）。所以"清空过渡表"不等于"追上了" ——
 * **它只是说明这一层不再需要别人替它做这四件事。**
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const LOCALIZE_ROUTES: readonly Route[] = [
  {
    /**
     * 功率组件：一只晶闸管 + 一只整流管 + 铜排 + 金属帽。
     *
     *   晶闸管 1 + 整流管 1 + 铜 1 + 帽壳 1 → 功率组件 1 件
     *
     * ⚠️ 本层的"功率组件"没有 MOS/IGBT，只有晶闸管与双极型 —— 这意味着
     * **开关频率上不去**（晶闸管只能靠过零关断，几十赫兹到几百赫兹）。
     * 所以它做的逆变器是方波、不是正弦。
     */
    id: 'make/power-device',
    name: 'Power Device Manufacturing', name_zh: '功率器件制造',
    produces: [{ item: 'std/power-device-general', qty: q(1), gives: [{ param: 'ratedCurrent', kind: 'range', min: 10, max: 200, dir: 'atLeast' }] }],
    uses: [
      { anyOf: [{ item: 'std/thyristor-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/rectifier-rotary-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'std/metal-can-general', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '芯片装配与键合（铝丝）', performedBy: 'plant/robot' },
      { note_zh: '铜排与端子焊接', performedBy: 'plant/sheet-shop' },
      { note_zh: '封帽与检漏', performedBy: 'plant/sheet-shop' },
      { note_zh: '测试（正向压降、触发电流、耐压）', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 无源组件：一包电阻、电容、电感，配成一组。
     *
     *   镍铬丝 + 薄膜电容 + 铜 + 酚醛 → 无源组件 1 件
     *
     * 电阻的阻值靠**绕多少圈**定（比薄膜电阻切出来的准得多）；
     * 缺点是个头大、有电感 —— **绕线电阻在高频下不是电阻。**
     */
    id: 'make/passive-component',
    name: 'Passive Component Manufacturing', name_zh: '无源件制造',
    produces: [{ item: 'std/passive-component-general', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
    ],
    // 测阻值要在恒温间（镍铬丝的电阻随温度变 0.1%/°C，20 度差就是 2%）
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '绕电阻（阻值 = 圈数 × 每圈电阻）', performedBy: 'plant/winder' },
      { note_zh: '焊接引线与浸漆', performedBy: 'plant/robot' },
      { note_zh: '测阻值与耐压（逐只测）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },
  {
    /**
     * 传感器：一只能测温的探头（热电偶）+ 一只光电探头，装在一个壳里。
     *
     *   热电偶 1 + 光敏管 1 + 帽壳 1 + 铜 1 → 传感器 1 件
     *
     * ⚠️ 本层没有"集成传感器"：测温度是两根丝，测光是半只三极管。
     * 而工业上的传感器是"一个信号输出、一个说明书"的黑盒 —— 差别在这里。
     */
    id: 'make/sensor-assembly',
    name: 'Sensor Manufacturing', name_zh: '传感器制造',
    produces: [{ item: 'std/sensor-general', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/photodiode-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/metal-can-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '装壳与绝缘（陶瓷管，防短路）', performedBy: 'plant/robot' },
      { note_zh: '引线与补偿导线', performedBy: 'plant/robot' },
      { note_zh: '校准（进恒温间，与标准热电偶比对）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...LOCALIZE_ROUTES];
