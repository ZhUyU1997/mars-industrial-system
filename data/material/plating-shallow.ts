/**
 * 浅沟的镀前处理片 —— aspectRatio 收到 0.08–1.2。
 *
 * `make/plating-prime` 交的是 0.08–1.6：那条路线接的是"沟槽可能有深有浅"的
 * 通用片。而 `make/plating-superfill` 要 ≤1.2 —— 填铜的添加剂体系（三组分
 * bath）在深宽比超过 1.2 之后，抑制剂与加速剂的竞争会翻过来，沟口先封、
 * 沟底留 void。所以这一条不是把判据放宽，是**给填铜那条路线一张浅沟片**。
 *
 * 交出去：aspectRatio 0.08–1.2、lineWidth 1000–5000（沿用前道的大线宽档）、
 * stepCoverage 50–60 %。设备与材料跟 `make/plating-prime` 完全一样，只是
 * 进来那张 `mat/barrier-wafer` 换成浅沟的（沟深按线宽的 0.08–1.2 倍给）。
 *
 * ⚠️ 已知缺口：本层没有"沟深"这个参数，深宽比是按前道给的线宽与沟深算的；
 * 浅沟片的沟深靠腐蚀时间控制（±10 %），而模型没有腐蚀深度的在线量具，
 * 只有切片（破坏性）。
 */

import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PLATING_SHALLOW_ROUTES: readonly Route[] = [
  {
    /** 浅沟片的镀前处理：除油、酸洗、冲洗。三样与通用片同一套。 */
    id: 'make/plating-prime-shallow',
    name: '预浸活化制造',
    produces: [
      {
        item: 'mat/plating-ready-wafer',
        qty: q(1),
        gives: [
          { param: 'aspectRatio', kind: 'range', min: 0.08, max: 1.2 },
          { param: 'lineWidth', kind: 'range', min: 1000, max: 5000 },
          { param: 'stepCoverage', kind: 'range', min: 50, max: 60 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/barrier-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/water-polisher'],
  },
];

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...PLATING_SHALLOW_ROUTES];
