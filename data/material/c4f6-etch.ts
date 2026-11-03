/**
 * C4F6 氧化物刻蚀 —— 把 C4F6 从“造出来没人吃”接到 RIE 的沟槽工艺。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 与 `make/rie-oxide-trench` 的差别
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 旧路线用 CF₄ 40 sccm + Ar 100 sccm，侧壁 78–83°、AR 1.6–2.2：
 * 没有 C₄F₈/C₄F₆ 的聚合物钝化，垂直度只能靠 Ar 的物理溅射。
 *
 * 本路线把 CF₄ 换成 **C4F6 20 sccm + O₂ 5 sccm + Ar 100 sccm**：
 *
 *   C/F = 0.67（C4F8 是 0.5）⇒ 侧壁聚合物更厚、钝化更强
 *   侧壁 86–88°、AR 3–4、选择比 6–12，代价是刻蚀速率略低
 *
 * C4F6 的用量：20 sccm × 12 min = 0.24 L ≈ 1.7 g，加吹扫取 10 g。
 * 10 kg 碘种子按 91.6 g/kg 补充量对应约 109 kg C4F6，够约 1.0–1.1 万片次（20 sccm × 12 min）。
 *
 * ⚠️ 这不是“CF₄ 的等价替换”：C4F6 的聚合物也会在腔壁上沉积，需要
 * 每批 O₂ 清腔；本层没有在线终点，仍然定时（±10–15 %）。
 */

import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const C4F6_ETCH_ROUTES: readonly Route[] = [
  {
    /**
     * **C4F6 沟槽：光刻 → C4F6/O₂/Ar RIE → CD-SEM。**
     *
     * 产出复用 `mat/rie-trench-wafer`，但给的是 C4F6 那一档的侧壁与 AR。
     */
    id: 'make/rie-oxide-trench-c4f6',
    name: '介质沟槽刻蚀片制造',
    produces: [
      {
        item: 'mat/rie-trench-wafer',
        qty: q(1),
        gives: [
          { param: 'aspectRatio', kind: 'range', min: 3, max: 4 },
          { param: 'sidewallAngle', kind: 'range', min: 86, max: 88 },
          { param: 'selectivity', kind: 'range', min: 6, max: 12 },
          { param: 'uniformity', kind: 'range', min: 5, max: 8 },
          { param: 'etchDepth', kind: 'range', min: 1000, max: 1500 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      // C4F6 20 sccm × 12 min ≈ 1.7 g；取 10 g 含吹扫/清腔
      { anyOf: [{ item: 'mat/c4f6', qty: q(1, 100) }] },
      // O₂ 5 sccm × 12 min ≈ 0.1 g；取 20 g
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 50) }] },
      // Ar 100 sccm × 12 min ≈ 2.2 g；取 150 g
      { anyOf: [{ item: 'mat/argon', qty: q(3, 20) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(30) }] },
    ],
    needs: [
      'plant/euv-vacuum',
      'plant/clean-room',
      'plant/film-monitor',
      'plant/stabilized-laser',
      'plant/interferometer',
      'plant/metrology-room',
    ],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh:
          '① 光刻：胶 0.8–1.0 µm、0.5 µm 线（`plant/mask-aligner` 接触式上限）；0.13 µm 要 M3 版 + 投影曝光，不在本路线',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '② C4F6 RIE：C4F6 20 sccm + O₂ 5 sccm + Ar 100 sccm、4–8 Pa、300 W、10–15 min；C/F 0.67 的聚合物钝化把侧壁拉到 86–88°、AR 3–4。**没有终点，定时 ±10–15 %**',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 4, max: 8 },
        ],
      },
      {
        note_zh:
          '③ 清腔：每批后 O₂ 200 sccm / 10 Pa / 300 W / 10 min，烧掉腔壁上的 C4F6 聚合物；不清腔，下一批的侧壁会塌',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 8, max: 12 },
        ],
      },
      {
        note_zh:
          '④ CD-SEM：读线宽与侧壁 86–88°；刻深用椭偏/干涉，1000–1500 nm',
        performedBy: 'plant/cd-sem',
      },
    ],
    unbalanced_zh:
      '片 1 + C4F6 0.01 + O₂ 0.02 + Ar 0.15 → 沟槽片 1。C4F6/O₂/Ar 全部进尾气；硅刻掉 1000–1500 nm × 78.5 cm² × 2.33 g/cm³ = 18–27 mg 进尾气。C4F6 的聚合物清腔那一步另耗 O₂，不单列',
  },
];

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...C4F6_ETCH_ROUTES];
