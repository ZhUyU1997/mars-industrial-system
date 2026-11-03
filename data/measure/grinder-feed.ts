/**
 * 磨床砂轮架进给分辨率的测量 —— 刻度盘一格到底走多少。
 *
 * 怎么测：比较仪顶在砂轮架上（0.1 µm 分度），摇一格刻度盘，读数变了多少；
 * 再反向摇回来，读到的差值就是**回程间隙**。两个数分开记：
 *
 *   · 进给分辨率 = 单向摇 5 格的总位移 ÷ 5；
 *   · 回程间隙   = 反向摇 1 格后读数没动的那一段（本层测的是“要摇多少格才跟上”）。
 *
 * 交出去：`feedResolution 0.5–2 µm`（实测，比设计值 1–5 更紧）。
 *
 * 缺口：
 *   · **比较仪量程只有 ±50 µm**，摇 5 格就可能出量程，要中途重新对零；
 *   · **回程间隙没有独立参数**：本层把它写进注释而不写成 prop，因为“间隙”随
 *     磨损变化，而模型没有运行小时（`Item.wear` 不存在）；
 *   · 只测静态分辨率，不测动态跟随（那要激光干涉仪，本层没有）。
 */

import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const GRINDER_FEED_ROUTES: readonly Route[] = [
  {
    /** 进给分辨率：比较仪 + 刻度盘，单向 5 格平均，反向看回程。 */
    id: 'measure/grinder-feed-resolution',
    name: '磨床砂轮架测量',
    produces: [
      {
        item: 'plant/grinder/wheel-head',
        qty: q(1),
        gives: [{ param: 'feedResolution', kind: 'range', min: 0.5, max: 2 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/grinder/wheel-head', qty: q(1) }] }],
    needs: [],
    steps: [
      { note_zh: '比较仪顶住砂轮架（0.1 µm 分度），对零', performedBy: 'plant/comparator' },
      { note_zh: '单向摇 5 格，记总位移，除以 5', performedBy: 'plant/robot' },
      { note_zh: '反向摇，记“摇几格读数才动”，即回程间隙', performedBy: 'plant/robot' },
    ],
  },
];

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...GRINDER_FEED_ROUTES];
