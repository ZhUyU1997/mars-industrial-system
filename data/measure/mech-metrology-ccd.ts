/**
 * 计量 CCD 的相机头。
 *
 * `plant/metrology-ccd` 不是新造传感器，而是把 `plant/robot/camera` 拆壳、
 * 引出数字/模拟接口、加遮光与安装面，做成可装帧积分器的相机头。
 * 拆壳与引出接口是不可逆改动，所以相机头是“由相机加工出来的零件”，
 * 用 `uses` 记录相机输入，不再向下写 `composedOf`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const METROLOGY_CCD_PARTS: readonly Item[] = [
  { id: 'plant/metrology-ccd/camera-head', name: '相机头', unit: '件', category: 'part' },
];

export const METROLOGY_CCD_PART_ROUTES: readonly Route[] = [
  {
    id: 'make/metrology-ccd-camera-head',
    name: '相机头制造',
    produces: [{ item: 'plant/metrology-ccd/camera-head', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'plant/robot/camera', qty: q(1) }] }],
    needs: ['plant/clean-room'],
    steps: [
      { note_zh: '拆相机壳，引出数字/模拟接口', performedBy: 'plant/robot' },
      { note_zh: '装遮光罩安装面与隔热垫，检外观与接口', performedBy: 'plant/robot' },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...METROLOGY_CCD_PARTS];
export const DATA_ROUTES: readonly Route[] = [...METROLOGY_CCD_PART_ROUTES];
