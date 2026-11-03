/**
 * CAR 图形片的刻蚀与去胶 —— 把“图形片”推到“有图形的硅片”。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么这两步能写、且只能写到 80–200 nm
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `make/car-patterned-wafer`（car-pattern.ts）已经给出 80–200 nm 的 CAR 图形。
 * 刻蚀用 `plant/rie-etcher`（15–80 °C / 1e-6–100 Pa）的 Cl₂ 段；去胶用同一台
 * 的 O₂ 段。两步都有设备、有气、有账。
 *
 * 代价：
 *   · CAR 是**有机**掩模，Cl₂ 对它的选择比只有 3–5:1（Si:胶），80–200 nm 的胶
 *     最多扛 0.3–1 µm 的硅；本文件只取 **100–300 nm** 的浅刻。
 *   · RIE 没有终点（`rie.ts` R8 ④：多晶硅判不出），只能定时 ±10–15 %。
 *   · O₂ 去胶的台面温度只有 60–80 °C（RIE 上限 80 °C，工业灰化 150–250 °C），
 *     去胶速率低、残渣 1–10 nm；本文件照实写，不写“0 残渣”。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CAR_STRIP_ITEMS: readonly Item[] = [
  /**
   * CAR 刻蚀并去胶后的硅片。**单层浅刻，不是器件。**
   *
   * 四个规格：
   *   lineWidth     80–200 nm（从 CAR 图形继承）
   *   etchDepth     100–300 nm（CAR 掩模的选择比 3–5:1 只允许浅刻）
   *   sidewallAngle 70–85°（Cl₂ 段各向异性，但 CAR 侧壁会退）
   *   residue       1–10 nm（60–80 °C 的 O₂ 灰化去不净）
   */
  {
    id: 'mat/car-stripped-wafer',
    name: 'CAR 刻蚀并去胶后的硅片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'lineWidth', kind: 'range', min: 20, max: 1000, unit: 'nm', dir: 'atMost' },
      { param: 'etchDepth', kind: 'range', min: 20, max: 1000, unit: 'nm' },
      { param: 'sidewallAngle', kind: 'range', min: 60, max: 90, unit: '°', dir: 'atLeast' },
      { param: 'residue', kind: 'range', min: 0, max: 50, unit: 'nm', dir: 'atMost' },
    ],
  },
];

export const CAR_STRIP_ROUTES: readonly Route[] = [
  {
    /**
     * **CAR 图形片 → Cl₂ RIE 浅刻 → O₂ 灰化 → CD-SEM。**
     *
     *   图形片 1 + Cl₂ 0.1 kg + O₂ 0.1 kg → 刻蚀片 1
     *
     * 三道工序：① Cl₂ RIE 20–60 °C / 1–10 Pa / 100 W / 60 s；
     * ② O₂ 灰化 60–80 °C / 10–50 Pa / 200 W / 120 s；
     * ③ CD-SEM 读 80–200 nm。
     */
    id: 'make/car-stripped-wafer',
    name: 'CAR 刻蚀并去胶后的硅片制造',
    produces: [
      {
        item: 'mat/car-stripped-wafer',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 80, max: 200 },
          { param: 'etchDepth', kind: 'range', min: 100, max: 300 },
          { param: 'sidewallAngle', kind: 'range', min: 70, max: 85 },
          { param: 'residue', kind: 'range', min: 1, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/car-patterned-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 10) }] },
    ],
    // 设备只由工序表达；needs 留空
    needs: [],
    rate: { hours: q(3, 2) },
    steps: [
      {
        note_zh:
          '① Cl₂ RIE：20–60 °C / 1–10 Pa / 100 W / 60 s，刻 100–300 nm 硅。CAR 的选择比只有 3–5:1（Si:胶），80–200 nm 的胶最多扛 0.3–1 µm；**没有终点，只能定时 ±10–15 %**（rie.ts R8 ④）',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 1, max: 10 },
        ],
      },
      {
        note_zh:
          '② O₂ 灰化：60–80 °C / 10–50 Pa / 200 W / 120 s。RIE 台面上限 80 °C，工业灰化 150–250 °C ⇒ 速率低、残渣 1–10 nm；连续灰化两次可降到 1–3 nm，但本层没有在线残渣量具',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'temperature', min: 60, max: 80 },
          { param: 'pressure', min: 10, max: 50 },
        ],
      },
      {
        note_zh:
          '③ CD-SEM：读 80–200 nm 的线宽与侧壁；CD-SEM 重复性 2–4 nm，对 80 nm 线是 2.5–5 %（cd-sem.ts 缺口）',
        performedBy: 'plant/cd-sem',
      },
    ],
    unbalanced_zh:
      '图形片 1 + Cl₂ 0.1 + O₂ 0.1 → 刻蚀片 1。Cl₂/O₂ 全部进尾气处理（本层没有回收）；硅刻掉的 100–300 nm × 78.5 cm² × 2.33 g/cm³ = 1.8–5.5 mg 进尾气/槽液。这是刻蚀的固有损耗，不是账不平',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CAR_STRIP_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CAR_STRIP_ROUTES];
