/**
 * CAR 涂胶片 —— 只做**旋涂 + 前烘 + 膜厚**，不做曝光/显影。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么只写这一段
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `mat/car-resist` 在 `car-resist-pag.ts` 里已经有配方，但全表没有一条路线吃它。
 * 涂胶这一步是**有设备、有料、有账**的：机器人转着甩（`plant/robot`），
 * 电阻炉前烘（`plant/resistance-furnace`），椭偏读膜厚（`plant/ellipsometer`）。
 *
 * 曝光/显影**不写**：本层没有 DUV/EUV 光源，接触曝光 0.7 µm 档对 CAR 的
 * 16–32 nm 本来就不够；硬写会是一条假路线。这一条留在缺口里。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 账
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   片 1 + CAR 胶 0.001 kg → 涂胶片 1
 *   膜厚 100 nm × 78.5 cm² × 1.2 g/cm³ = 9.4 mg；旋涂甩掉 95 % ⇒ 实际投 0.2 g
 *   取 1 g 是给过滤、返工与边角留的余量
 *
 * 甩掉的胶与溶剂不回用（本层没有溶剂回收），记在 `unbalanced_zh` 里。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CAR_COAT_ITEMS: readonly Item[] = [
  /**
   * CAR 涂胶片（只涂未曝）。**不是成品图形片。**
   *
   * 两个规格：
   *   thickness  60–200 nm（PAG 3 wt% 的膜；再厚 EUV 吸收不够，再薄针孔压不住）
   *   pinhole    1–5 /cm²（没有 0.2 µm 终端过滤，见 car-resist-pag.ts 缺口③）
   */
  {
    id: 'mat/car-resist-coated-wafer',
    name: 'CAR Resist-Coated Wafer', name_zh: 'CAR 涂胶片',
    unit: '片',
    // 按“片”而不是“料”记账：它由硅片（零件）旋涂而来，与 mat/trench-wafer 同一档。
    category: 'part',
    props: [
      { param: 'thickness', kind: 'range', min: 20, max: 500, unit: 'nm' },
      { param: 'pinhole', kind: 'range', min: 0, max: 100, unit: '个/cm²', dir: 'atMost' },
    ],
  },
];

export const CAR_COAT_ROUTES: readonly Route[] = [
  {
    /**
     * **CAR 涂胶：旋涂 3000 r/min → 100–120 °C 前烘 → 椭偏读膜厚。**
     *
     * 三道工序都在既有设备上：
     *   ① `plant/robot` 转着甩（机器人没有 holds，但这一步没有温压条件）
     *   ② `plant/resistance-furnace` 100–120 °C / 60 s
     *   ③ `plant/ellipsometer` 读 60–200 nm（0.05 nm 精度，够）
     */
    id: 'make/car-resist-coated-wafer',
    name: 'CAR Resist-Coated Wafer Manufacturing', name_zh: 'CAR 涂胶片制造',
    produces: [
      {
        item: 'mat/car-resist-coated-wafer',
        qty: q(1),
        gives: [
          { param: 'thickness', kind: 'range', min: 60, max: 200 },
          { param: 'pinhole', kind: 'range', min: 1, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      // 100 nm × 78.5 cm² × 1.2 g/cm³ = 9.4 mg；甩掉 95 % ⇒ 0.2 g；取 1 g 留返工余量
      { anyOf: [{ item: 'mat/car-resist', qty: q(1, 1000) }] },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh:
          '① 旋涂：3000 r/min、60 s，胶 1 g 里 95 % 被甩掉；膜厚靠转速与固含定，本层没有转速闭环（`litho-m2.ts:602` 同一笔）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '② 前烘：100–120 °C / 60 s，把残余乙醇赶走；温度上限由 PAG 的 Td 180 °C 留 60 K 余量（car-resist-pag.ts §四）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 120 }],
      },
      {
        note_zh:
          '③ 膜厚：椭偏读 60–200 nm（0.05 nm 精度）；针孔**不在这一步测**，本层没有颗粒/针孔量具（car-resist-pag.ts 缺口③）',
        performedBy: 'plant/ellipsometer',
      },
    ],
    unbalanced_zh:
      '片 1 + CAR 胶 0.001 → 涂胶片 1。膜里只剩 9.4 mg（100 nm × 78.5 cm² × 1.2 g/cm³），其余 0.99 g 是甩掉的胶与乙醇，没有回收路线 —— 这是涂胶的固有损耗，不是账不平',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CAR_COAT_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CAR_COAT_ROUTES];
