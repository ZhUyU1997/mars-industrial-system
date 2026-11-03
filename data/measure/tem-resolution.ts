/**
 * FIB-TEM 的分辨率标定记录：点分辨 0.3–0.5 nm、晶格 0.14–0.3 nm。
 *
 * **为什么用金颗粒 + 台阶标准交叉**：TEM 的“分辨率”不是一个旋钮，是两件事叠出来的 ——
 *   ① 点分辨：两个相邻物点能不能分开（看金岛边缘的 Fresnel 条纹/颗粒分离）；
 *   ② 晶格分辨：周期条纹能不能看见（看 Au(111) 的 0.235 nm）。
 * 标尺（nm/px）靠 `std/step-standard-1nm-10nm` 交叉校，否则“0.3 nm”只是放大倍率算出来的。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、分辨率的账
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   200 kV 的电子波长 λ = 2.51 pm；球差 Cs ≈ 1–2 mm、色差 Cc ≈ 1–2 mm。
 *   点分辨 ≈ 0.43·Cs^(1/4)·λ^(3/4) = 0.43 × (1.5e-3)^0.25 × (2.51e-12)^0.75 ≈ **0.25–0.35 nm**
 *   （本层没有球差校正器，0.3–0.5 nm 是设计档；带校正的商用机是 0.08 nm，差 4–6×）。
 *   晶格分辨由信息极限定：0.14–0.3 nm，Au(111) 的 0.235 nm 正好落在里面 ⇒ 能看到条纹，
 *   但 0.14 nm 档（Au(200)=0.204、Si(220)=0.192）要信息极限到 0.14 才稳，所以窗口写 0.14–0.3。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① 没有认证金颗粒标样（本层 0 条目）：金岛膜是**自建**的（蒸 1–3 nm Au，岛径 1–5 nm），
 *     只能做相对判据，不能声明溯源。
 *  ② 没有球差校正器：0.3–0.5 nm 是这台机器的天花板，0.1 nm 以下本层不写。
 *  ③ 台阶标准是 1–10 nm 档：校 0.2–0.5 nm 的标尺要放大到 500k× 以上，标尺误差 3–5 %。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const TEM_RESOLUTION_ITEMS: readonly Item[] = [
  /**
   * **TEM 分辨率记录：点分辨、晶格分辨、加速电压。**
   *
   *   pointResolution   0.3–0.5 nm
   *   latticeResolution 0.14–0.3 nm
   *   acceleratingVoltage 200–300 kV
   *   method            gold-island + step-standard 交叉
   */
  {
    id: 'mat/tem-resolution-record',
    name: 'TEM Resolution Record', name_zh: 'TEM 分辨率记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'pointResolution', kind: 'range', min: 0.15, max: 1, unit: 'nm' },
      { param: 'latticeResolution', kind: 'range', min: 0.1, max: 0.4, unit: 'nm' },
      { param: 'acceleratingVoltage', kind: 'range', min: 100, max: 300, unit: 'kV' },
      { param: 'method', kind: 'enum', values: ['gold-island', 'step-standard'] },
    ],
  },
];

export const TEM_RESOLUTION_ROUTES: readonly Route[] = [
  {
    /** 分辨率标定：蒸金岛 → 装样抽真空 → 拍点分辨/晶格 → 台阶标准校标尺。 */
    id: 'measure/tem-resolution',
    name: 'Resolution Standardization', name_zh: '分辨率标定',
    produces: [
      {
        item: 'mat/tem-resolution-record',
        qty: q(1),
        gives: [
          { param: 'pointResolution', kind: 'range', min: 0.3, max: 0.5 },
          { param: 'latticeResolution', kind: 'range', min: 0.14, max: 0.3 },
          { param: 'acceleratingVoltage', kind: 'range', min: 200, max: 300 },
          { param: 'method', kind: 'enum', oneOf: ['gold-island', 'step-standard'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/step-standard-1nm-10nm', qty: q(1) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 100000) }] },
    ],
    needs: ['plant/metrology-room', 'plant/tem'],
    steps: [
      {
        note_zh: '① 金岛膜：真空蒸 1–3 nm Au 到支持膜，岛径 1–5 nm（自建，非认证金颗粒标样 —— 本层 0 条目，见缺口）',
        performedBy: 'plant/evaporator',
      },
      {
        note_zh: '② 装样：双倾样品台，抽到 1×10⁻⁵–1×10⁻³ Pa（`plant/fib-tem`）',
        performedBy: 'plant/fib-tem',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh: '③ 点分辨：200–300 kV、低剂量，拍金岛边缘的 Fresnel 条纹与相邻颗粒分离；能分开的最小间距 0.3–0.5 nm',
        performedBy: 'plant/fib-tem',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh: '④ 晶格分辨：同视场拍 Au(111) 的 0.235 nm 周期条纹；条纹可见且间距稳定到 ±3 % 才判 0.14–0.3 nm',
        performedBy: 'plant/fib-tem',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh: '⑤ 标尺交叉：同倍率下拍 `std/step-standard-1nm-10nm`，nm/px 与标称差 >5 % 重标（缺认证金颗粒标样，只能做相对判据）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '⑥ 判读：点分辨 0.3–0.5 nm、晶格 0.14–0.3 nm；带球差校正的商用机 0.08 nm 是 4–6× 差距，本层不写',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(12) },
    unbalanced_zh: '台阶标准 1 片 + 金 10 mg → 记录 1 份；样品不消耗（按件计）',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...TEM_RESOLUTION_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...TEM_RESOLUTION_ROUTES];
