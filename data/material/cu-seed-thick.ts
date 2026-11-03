/**
 * 加厚铜籽晶 —— 把“种子层厚度”那一格从 7–21 nm 收到 12–21 nm。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么要一条变体
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `make/fine-damascene-layer` 要求种子层 `seedThickness ≥12 nm`，而
 * `make/cu-seed-cvd` 交的是 **7–21 nm** —— 两个数是一件事的两头：
 *
 *   7 是**沟底**的等效厚度（侧壁/沟底覆盖只有 50–70 %，台阶深处最薄）
 *   21 是**场区**的厚度
 *
 * 也就是说，那条路线本身没写错，是 `seedThickness` 这一个参数把场厚与沟底
 * 并成了一个数。判据按 ≥12 比的时候，取的是窗口下沿 7 —— 于是判 lost。
 *
 * 这一条的解法不是改判据，是**把工艺目标挪到场区 ≥12**：多跑几组循环，
 * 场区 12–21，沟底随覆盖比跟到 6–15。代价是电镀前那张片的台阶变窄
 * （12 nm 以上的种子在 100 nm 沟里更容易夹口），而夹口的判据本层没有量具。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 已知缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① **场厚与沟底仍是合并的一个参数**：要真正判清楚，得把 `seedThickness`
 *     拆成 `fieldThickness` 与 `trenchBottomThickness` 两个。本文件只把窗口
 *     挪到能满足判据的那一侧，没拆参数 —— 那是下一层的事。
 *  ② **夹口没有量具**：12 nm 种子在 100 nm 沟口的悬垂（overhang）判不了，
 *     只能靠电镀后切片看 void（FIB/TEM，破坏性、5 h/片）。
 */

import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CU_SEED_THICK_ROUTES: readonly Route[] = [
  {
    /**
     * 加厚铜籽晶。同一台设备、同一套前驱体，只多跑几组循环。
     *
     * 交出去的窗口：场厚 20–35、种子 12–21、侧壁覆盖 65–85 %、沟底 50–70 %、
     * 电阻率 2.5–4 µΩ·cm、氯 0.2–0.5 at%。
     */
    id: 'make/cu-seed-cvd-thick',
    name: 'Wafer with Copper Seed Layer Manufacturing', name_zh: '长了铜籽晶的片制造',
    produces: [
      {
        item: 'mat/cu-seed-wafer',
        qty: q(25),
        gives: [
          { param: 'fieldThickness', kind: 'range', min: 20, max: 35 },
          { param: 'seedThickness', kind: 'range', min: 12, max: 21 },
          { param: 'sidewallCoverage', kind: 'range', min: 65, max: 85 },
          { param: 'bottomCoverage', kind: 'range', min: 50, max: 70 },
          { param: 'resistivity', kind: 'range', min: 2.5, max: 4 },
          { param: 'chlorineContent', kind: 'range', min: 0.2, max: 0.5 },
        ],
      },
    ],
    // 多跑循环 ⇒ 前驱体按比例加，其余不变。
    uses: [
      { anyOf: [{ item: 'mat/lowk-barrier-wafer', qty: q(25) }] },
      { anyOf: [{ item: 'mat/cuprous-chloride', qty: q(3, 10000) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(3, 5000) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/mfc', 'plant/clean-room', 'plant/metrology-room', 'plant/water-polisher'],
  },
];

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...CU_SEED_THICK_ROUTES];
