/**
 * CAR 图形片 —— 曝光 + PEB + 显影 + 检验，把 CAR 从“涂胶片”推到“有图形的片”。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 光源：193 nm ArF，不是 EUV
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本层有 `plant/arf-laser`（193 nm，1–40 W，200–6000 Hz）与 `plant/mask-aligner`
 * （接触式，真空吸附把间隙压到 20 nm）。`fine-damascene.ts` 已经用这一对做过
 * 0.1–0.15 µm 的接触曝光 —— 所以 CAR 的曝光不是“没有光源”，是“没有 EUV”。
 *
 *   CAR 的 PAG（三苯基锍三氟甲磺酸盐）在 193 nm 有吸收，10–30 mJ/cm² 可显透；
 *   193 nm 的接触曝光分辨极限约 0.1–0.15 µm（`litho-m3.ts`），所以本文件
 *   只敢给 **80–200 nm**，不给 16–32 nm —— 后者要 EUV 投影，本层没有。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 显影：2.38 wt% TMAH（不是纯水，也不是标准配方）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `mat/tmah` 25 % 溶液 0.1 kg + 水 0.9 kg = **2.5 wt% TMAH**，接近工业 2.38 %。
 * 缩醛化 PVA 曝光后变回 PVA，TMAH 把 PVA 的羟基去质子化、溶解得更干净：
 *   · 溶胀从纯水的 5–15 % 降到 **2–5 %**（估算，没有在线膜厚）；
 *   · 仍**没有表面活性剂** ⇒ 细线易倒；
 *   · 仍**没有在线 pH/电导** ⇒ 显影终点靠时间（60 s）；
 *   · 显影后必须立即甩干，否则水痕就是缺陷。
 *
 * 这三条写进 R8 缺口①–③，不假装是标准 CAR 显影。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CAR_PATTERN_ITEMS: readonly Item[] = [
  /**
   * CAR 图形片（单层，未刻蚀）。**不是器件片。**
   *
   * 三个规格：
   *   lineWidth  80–200 nm（193 nm 接触曝光的极限；16–32 nm 要 EUV）
   *   thickness  60–200 nm（与涂胶片同一档）
   *   pinhole    1–5 /cm²（涂胶那一步的针孔带过来）
   */
  {
    id: 'mat/car-patterned-wafer',
    name: 'CAR 图形片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'lineWidth', kind: 'range', min: 20, max: 1000, unit: 'nm', dir: 'atMost' },
      { param: 'thickness', kind: 'range', min: 20, max: 500, unit: 'nm' },
      { param: 'pinhole', kind: 'range', min: 0, max: 100, unit: '个/cm²', dir: 'atMost' },
    ],
  },
];

export const CAR_PATTERN_ROUTES: readonly Route[] = [
  {
    /**
     * **CAR 图形：193 nm 曝光 → 100–120 °C PEB → 水显影 → 甩干 → CD-SEM。**
     *
     *   ArF 193 nm、10–30 mJ/cm²、真空接触 20 nm；
     *   PEB 100–120 °C / 60 s（酸扩散 6–11 nm，温度每高 10 K 扩散约 1.3 倍）；
     *   水显影 20–30 °C / 60 s；CD-SEM 读 80–200 nm。
     */
    id: 'make/car-patterned-wafer',
    name: 'CAR 图形片制造',
    produces: [
      {
        item: 'mat/car-patterned-wafer',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 80, max: 200 },
          { param: 'thickness', kind: 'range', min: 60, max: 200 },
          { param: 'pinhole', kind: 'range', min: 1, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/car-resist-coated-wafer', qty: q(1) }] },
      // 显影液 1 kg：0.1 kg 25 % TMAH + 0.9 kg 水 = 2.5 wt%（实际 78.5 cm² × 几 mL；取 1 kg 留冲洗余量）
      {
        anyOf: [
          {
            item: 'mat/tmah',
            qty: q(1, 10),
            need: [{ param: 'concentration', kind: 'range', min: 24, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/water', qty: q(9, 10) }] },
    ],
    needs: ['plant/arf-laser', 'std/photomask-general'],
    rate: { hours: q(2) },
    steps: [
      {
        note_zh:
          '① 曝光：193 nm ArF、10–30 mJ/cm²、真空接触把间隙压到 20 nm；掩模 0.1–0.15 µm（std/photomask-general）。**激光在 needs 里**：plant/arf-laser 没有 holds，执行者是 mask-aligner（与 fine-damascene.ts 的 193 nm 接触曝光同一招）',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '② PEB：100–120 °C / 60 s，让 PAG 放出的酸把缩醛拆开；温度上限由 PAG 的 Td 180 °C 留 60 K。酸扩散 6–11 nm 是分辨率的硬底（car-resist-pag.ts 缺口②）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 120 }],
      },
      {
        note_zh:
          '③ TMAH 显影：2.5 wt%（0.1 kg 25 % TMAH + 0.9 kg 水），20–30 °C / 60 s。曝光区变回 PVA，TMAH 把羟基去质子化；**没有表面活性剂** ⇒ 溶胀 2–5 %（比纯水 5–15 % 好）、细线易倒、终点靠时间（缺口①）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 30 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '④ 甩干：氮气吹 + 100 °C / 30 s；水痕就是缺陷，所以这一步不能省（本层没有临界点干燥）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 110 }],
      },
      {
        note_zh:
          '⑤ 检验：CD-SEM 读 80–200 nm 的线宽；本层 CD-SEM 的重复性 2–4 nm，对 80 nm 线是 2.5–5 %（cd-sem.ts 的缺口）',
        performedBy: 'plant/cd-sem',
      },
    ],
    unbalanced_zh:
      '涂胶片 1 + TMAH 0.1（25 %）+ 水 0.9 → 图形片 1。显影液带走曝光区的 PVA（78.5 cm² × 100 nm × 1.2 g/cm³ = 9.4 mg）与少量未曝光胶；TMAH/水没有回收，按 1 kg 一次性记。这不是账不平，是显影的固有损耗',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CAR_PATTERN_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CAR_PATTERN_ROUTES];
