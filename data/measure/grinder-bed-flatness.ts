/**
 * 磨床床身导轨面平面度的测量 —— 与车床那条同一台干涉仪，判据紧一档。
 *
 * 磨床的工作台在导轨上来回走，导轨平不平直接复印到工件上；车床是刀走、
 * 工件转，导轨的平度只影响锥度。所以同一项参数，磨床的窗口收到 1–3 µm。
 *
 * 测法与 `measure/lathe-bed-flatness` 完全一致（钠光 + φ300 平晶 + 铝箔垫片 +
 * 24 h 恒温），只是逐段长度按工作台行程 400 mm 取两段、搭接 50 mm。
 *
 * 缺口与车床那条相同：钠灯相干长度几 mm、温漂比判据大、只测平面度不测直线度。
 * 另加一条：**磨床床身带砂轮架，测的时候要先把砂轮架挪到一头**，否则平晶放不下
 * —— 这个“挪”本层没有吊装记录，只能记成前提。
 */

import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const GRINDER_BED_FLATNESS_ROUTES: readonly Route[] = [
  {
    /** 床身导轨面平面度：钠光干涉 + φ300 平晶。 */
    id: 'measure/grinder-bed-flatness',
    name: '磨床床身测量',
    produces: [
      {
        item: 'plant/grinder/bed',
        qty: q(1),
        gives: [{ param: 'flatness', kind: 'range', min: 1, max: 3 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/grinder/bed', qty: q(1) }] }],
    needs: [],
    steps: [
      { note_zh: '砂轮架挪到一头（腾出 300 mm 平晶的位置）', performedBy: 'plant/robot' },
      { note_zh: '20 °C 恒温室放 24 h', performedBy: 'plant/metrology-room', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '平晶扣在导轨面上，钠光入射，数条纹（一条 0.295 µm），两段搭接 50 mm', performedBy: 'plant/interferometer' },
    ],
  },
];

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...GRINDER_BED_FLATNESS_ROUTES];
