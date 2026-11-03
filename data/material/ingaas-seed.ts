/**
 * InGaAs 光电二极管 —— 原战略种子；整链有产出路线。
 *
 * RTA 的 1.55 µm 高温计要一只 InGaAs 二极管（In₀.₅₃Ga₀.₄₇As，截止约 1.7 µm）。
 * 旧结论是本层没有铟、没有镓、没有砷，B/As 链本身 0 条，所以按**进口种子**
 * 记 10 只备件（一只 1–5 mm²、几毫克，10 只不到 1 g）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 复核：整链有产出路线；旧“库存/复购点”只作历史
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   本地能否复制：**能**。`make/photodiode-ingaas`（`data/machine/ingaas.ts`）：
 *                    InP 多晶 → LEC 单晶 → 2 英寸衬底 → MOCVD → p-i-n →
 *                    TO 封装 → 光谱/暗电流测试。
 *   种子状态：     本条目已不在当前 7 条种子清单里（`data/floor/seed.ts`）。
 *   旧账保留：     10 只 = 1 只装机 + 2 只备件 + 7 只实验；复购点剩 3 只 ——
 *                  这是“还没有本地链”时的库存策略，现在只作第一批的历史。
 *   仍缺（不是无路线）：外延组分/厚度在线量具、暗电流 1 pA 级校准、
 *                  TO 封装气密性长测；路线交付的是设计/工艺窗口，不是实测。
 */

import type { Item } from '../../src/index.ts';

export const INGAAS_SEED_ITEMS: readonly Item[] = [
  /**
   * InGaAs 光电二极管。**现有本地路线 `make/photodiode-ingaas`
   * （`data/machine/ingaas.ts`）；原“战略种子：无产出路线”已过期。**
   *
   * 四个规格：
   *   wavelength    900–1700 nm
   *   responsivity  0.8–1.0 A/W @1550 nm
   *   activeArea    0.1–1 mm²
   *   darkCurrent   ≤1 nA
   */
  {
    id: 'std/photodiode-ingaas',
    name: 'InGaAs 光电二极管',
    unit: '件',
    category: 'part',
    props: [
      { param: 'wavelength', kind: 'range', min: 800, max: 1800, unit: 'nm' },
      { param: 'responsivity', kind: 'range', min: 0.5, max: 1.2, unit: 'A/W' },
      { param: 'activeArea', kind: 'range', min: 0.01, max: 5, unit: 'mm²' },
      { param: 'darkCurrent', kind: 'range', min: 0, max: 100, unit: 'nA', dir: 'atMost' },
    ],
  },
];

import type { Route } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...INGAAS_SEED_ITEMS];
export const DATA_ROUTES: readonly Route[] = [];
