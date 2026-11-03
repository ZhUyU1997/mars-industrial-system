/**
 * 快速刀具伺服 **minStep 1 nm**（准静态，已测到的最近值）。
 *
 * 1–10 nm 设计窗未全测；只确认 1 nm 最小步距：
 * 用 `std/step-standard-wedge-1-10nm` 的 1 nm 端 + `plant/spindle-error-analyzer`
 * 探头（0.05–0.1 nm）读出，因此记录 resolution 1–1 nm、points 1。
 * 不把探头 0.05–0.1 当产品 resolution，也不声称 1–10 nm 全窗。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FAST_TOOL_SERVO_STEP_MEASURE_ITEMS: readonly Item[] = [
  {
    id: 'mat/fast-tool-servo-step-measure-record',
    name: 'Fast Tool Servo Step Height Record', name_zh: '快速刀具伺服台阶测量记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 1, max: 1, unit: 'nm', dir: 'atMost' },
      { param: 'definition', kind: 'enum', values: ['minimum-step-size'] },
      { param: 'mode', kind: 'enum', values: ['quasi-static'] },
      { param: 'points', kind: 'range', min: 1, max: 1, unit: '点' },
    ],
  },
];

export const FAST_TOOL_SERVO_STEP_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **FTS minStep 1 nm：1 nm 端台阶 + 探头读出，单点。**
     */
    id: 'measure/fast-tool-servo-step',
    name: 'Fast Tool Servo Step Height Measurement', name_zh: '快速刀具伺服台阶测量',
    produces: [{
      item: 'mat/fast-tool-servo-step-measure-record',
      qty: q(1),
      gives: [
        { param: 'resolution', kind: 'range', min: 1, max: 1, dir: 'atMost' },
        { param: 'definition', kind: 'enum', oneOf: ['minimum-step-size'] },
        { param: 'mode', kind: 'enum', oneOf: ['quasi-static'] },
        { param: 'points', kind: 'range', min: 1, max: 1 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'plant/fast-tool-servo', qty: q(1) }] }],
    needs: [
      {
        item: 'plant/fts-test-stand',
        qty: q(1),
        need: [{ param: 'measure/resolution', kind: 'range', min: 1, max: 10 }],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(4) },
    steps: [
      { note_zh: 'FTS 装 fts-test-stand，1 nm 端台阶对刀尖，20 ± 0.1 °C 热平衡', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '指令 1 nm 准静态阶跃，工装读 1 点台阶；只确认 1 nm 最小步距', performedBy: 'plant/fts-test-stand', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '写资格带；探头带宽未声明，不冒充 1–10 kHz 动态', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: 'FTS 1 件（进、出不消耗）+ 探头/夹具（不占用）→ 阶跃记录 1 份；记录是数据不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...FAST_TOOL_SERVO_STEP_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...FAST_TOOL_SERVO_STEP_MEASURE_ROUTES];
