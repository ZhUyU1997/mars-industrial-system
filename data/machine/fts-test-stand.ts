/**
 * FTS 独立测试工装：X 射线定值的 1/10 nm 台阶 + 主轴误差分析仪探头 + 隔振/夹具。
 *
 * 不是新整机；只是把已有标准件装成可读 1–10 nm 台阶的工装。
 * 工装分辨率 1–10 nm 由台阶标准定值、探头读位移；探头本身仍 0.05–0.1 nm。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FTS_TEST_STAND_ITEMS: readonly Item[] = [
  {
    id: 'plant/fts-test-stand/isolation',
    name: '快速刀具伺服测试台隔振',
    unit: '件',
    category: 'part',
    props: [
      { param: 'vibration', kind: 'range', min: 0, max: 1000, unit: 'nm', dir: 'atMost' },
      { param: 'naturalFrequency', kind: 'range', min: 0.5, max: 5, unit: 'Hz' },
    ],
  },
  {
    id: 'plant/fts-test-stand/frame',
    name: '快速刀具伺服测试台机架',
    unit: '件',
    category: 'part',
    props: [
      { param: 'flatness', kind: 'range', min: 0, max: 0.01, unit: 'mm', dir: 'atMost' },
      { param: 'load', kind: 'range', min: 0, max: 100, unit: 'kg', dir: 'atLeast' },
    ],
  },
  {
    id: 'plant/fts-test-stand',
    name: '快速刀具伺服测试台',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/resolution', kind: 'range', min: 1, max: 10, unit: 'nm', dir: 'atMost' },
    ],
    composedOf: [
      { item: 'std/step-standard-wedge-1-10nm', qty: q(1) },
      { item: 'plant/spindle-error-analyzer', qty: q(1) },
      { item: 'plant/fts-test-stand/isolation', qty: q(1) },
      { item: 'plant/fts-test-stand/frame', qty: q(1) },
    ],
  },
];

export const FTS_TEST_STAND_ROUTES: readonly Route[] = [
  {
    id: 'make/fts-test-stand-isolation',
    name: '快速刀具伺服测试台隔振制造',
    produces: [{
      item: 'plant/fts-test-stand/isolation',
      qty: q(1),
      gives: [
        { param: 'vibration', kind: 'range', min: 0, max: 1000 },
        { param: 'naturalFrequency', kind: 'range', min: 0.5, max: 5 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'plant/afm/isolation', qty: q(1) }] }],
    needs: [],
    steps: [{ note_zh: '把 AFM 隔振件装到测试台底座，调平', performedBy: 'plant/robot' }],
    unbalanced_zh: 'AFM 隔振件 1 → FTS 隔振件 1。',
  },
  {
    id: 'make/fts-test-stand-frame',
    name: '快速刀具伺服测试台机架制造',
    produces: [{
      item: 'plant/fts-test-stand/frame',
      qty: q(1),
      gives: [
        { param: 'flatness', kind: 'range', min: 0, max: 0.01 },
        { param: 'load', kind: 'range', min: 0, max: 100 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'plant/arf-stepper/frame', qty: q(1) }] }],
    needs: [],
    steps: [{ note_zh: '把 ARF 台架改装为 FTS 夹具，台面 0.01 mm 找平', performedBy: 'plant/robot' }],
    unbalanced_zh: 'ARF 台架 1 → FTS 台架 1。',
  },
  {
    /**
     * **装配：隔振/台架 + 台阶标准 + 探头，标定 1–10 nm 台阶读数。**
     */
    id: 'make/fts-test-stand',
    name: '快速刀具伺服测试台装配',
    produces: [{
      item: 'plant/fts-test-stand',
      qty: q(1),
      gives: [{ param: 'measure/resolution', kind: 'range', min: 1, max: 10 }],
    }],
    uses: [
      { anyOf: [{ item: 'std/step-standard-wedge-1-10nm', qty: q(1) }] },
      { anyOf: [{ item: 'plant/fts-test-stand/isolation', qty: q(1) }] },
      { anyOf: [{ item: 'plant/fts-test-stand/frame', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '隔振件与台架装配，台面水平 ≤0.01 mm', performedBy: 'plant/robot' },
      { note_zh: '装 1/10 nm 台阶标准，X 射线定值片对零', performedBy: 'plant/robot' },
      { note_zh: '装 spindle-error-analyzer 探头对台阶，标 1–10 nm 读数；不扩探头量程', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '台阶标准 1 + 隔振 1 + 台架 1 + 探头（composedOf）→ FTS 测试工装 1 台。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...FTS_TEST_STAND_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...FTS_TEST_STAND_ROUTES];
