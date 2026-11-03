/**
 * TEM 样品侧的两条测量路线 —— 薄片减薄工艺与损伤层（R13：measure/* 与记录只放这里）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、薄片怎么减到 30–60 nm
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① Pt 保护层 0.1–0.5 µm（`plant/evaporator`）：挡住 FIB 的帘状条纹与
 *      表面非晶化，否则顶面 5–10 nm 先坏；
 *   ② FIB 粗切 30 kV：Ga⁺ 在 Si 中的注入射程 **20–40 nm**（TRIM，30 kV、
 *      7° 入射）；粗切留 80–120 nm，损伤层就是这 20–40 nm；
 *   ③ FIB 精修 2–5 kV：射程降到 **5–10 nm**（5 kV），损伤层按能量降；
 *   ④ 低能终抛 0.5–2 kV（`plant/ion-beam-figuring`，Ar⁺/低能离子）：
 *      射程 0.5–3 nm，最终损伤层 **2–5 nm**；
 *   ⑤ 最终厚度 30–60 nm、尺寸 10×5 µm。
 *
 *   为什么必须低能终抛：Ga⁺ 射程/损伤层 ≈ 随能量上升；30 kV 与 5 kV 的
 *   射程比是 **4–6 倍**（20–40 nm 对 5–10 nm），与 0.5–2 kV 比是
 *   **10–40 倍**。30 kV 粗切后的 20–40 nm 损伤层已经占 30–60 nm 薄片的
 *   1/3–1/2，不终抛就没有可用的晶体区。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、损伤层 2–5 nm 对 0.2–0.5 nm 点分辨意味着什么
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   2–5 nm 是点分辨 0.2–0.5 nm 的 **4–25 倍**。损伤层是非晶的，
 *   里面没有晶格；HRTEM 只能看**损伤层以下的晶体区**。所以：
 *
 *   · 感兴趣的结构必须在表面以下 >5 nm；如果它就在顶面 2–5 nm 内，
 *     那一段已经被 FIB 非晶化，点分辨再好也看不到晶格；
 *   · 30–60 nm 的薄片，两侧各 2–5 nm 损伤，晶体芯只有 20–56 nm；
 *   · 要测 0.2 nm 的点分辨，样品厚度还得 ≤50 nm（多重散射），
 *     所以 30–60 nm 的上端本来就要挑薄区。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、两条记录
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `measure/tem-sample-prep`   → `mat/tem-lamella-prep-record`
 *   `measure/tem-damage-layer`  → `mat/tem-damage-record`
 *
 *   前者记工艺窗口（厚度、损伤层、Pt 层、尺寸），后者用 HRTEM 截面
 *   直接量损伤层（2–5 nm、不确定度 0.5–1 nm）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const TEM_SAMPLE_ITEMS: readonly Item[] = [
  /**
   * TEM 薄片制备记录。**一份记录对应一片薄片。**
   *
   *   thickness    30–60 nm       最终厚度（FIB 粗切 80–120 → 精修 → 终抛）
   *   damageLayer  2–5 nm         0.5–2 kV 终抛后的非晶损伤层
   *   ptLayer      0.1–0.5 µm     Pt 保护层（挡帘状条纹与表面非晶化）
   *   width        5–5 µm         薄片宽
   *   length       10–10 µm       薄片长
   *   voltage      5–30 kV        FIB 粗切/精修电压；0.5–2 kV 终抛另记 finalEnergy
   *   fineEnergy   2–5 kV         FIB 精修（低能段；源 5 kV 以下为低端外推）
   *   finalEnergy  0.5–2 kV       低能终抛能量（`plant/ion-beam-figuring` 源 0.3–1.5 keV，
   *                               1.5–2 kV 是上端外推）
   *   method       fib+low-kv
   *
   * ⚠️ `damageLayer`/`ptLayer`/尺寸没有对应的单机 prop，是本记录测出来的
   *    工艺结果，不是机器能力；`thickness`/`voltage` 与 `plant/fib-tem`
   *    的 props 对得上。
   */
  {
    id: 'mat/tem-lamella-prep-record',
    name: 'TEM Lamella Preparation Record', name_zh: 'TEM 薄片制备记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'thickness', kind: 'range', min: 30, max: 60, unit: 'nm' },
      { param: 'damageLayer', kind: 'range', min: 2, max: 5, unit: 'nm' },
      { param: 'ptLayer', kind: 'range', min: 0.1, max: 0.5, unit: 'µm' },
      { param: 'width', kind: 'range', min: 5, max: 5, unit: 'µm' },
      { param: 'length', kind: 'range', min: 10, max: 10, unit: 'µm' },
      { param: 'voltage', kind: 'range', min: 5, max: 30, unit: 'kV' },
      { param: 'fineEnergy', kind: 'range', min: 2, max: 5, unit: 'kV' },
      { param: 'finalEnergy', kind: 'range', min: 0.5, max: 2, unit: 'kV' },
      { param: 'method', kind: 'enum', values: ['fib+low-kv'] },
    ],
  },

  /**
   * 损伤层记录。**一份记录对应一片薄片。**
   *
   *   damageLayer     2–5 nm      HRTEM 截面直接量（非晶/晶态界面）
   *   uncertainty     0.5–1 nm    5 点 + 界面定位
   *   pointResolution 0.2–0.5 nm  TEM 点分辨（损伤层是它的 4–25 倍）
   *   voltage         100–200 kV  TEM 成像电压
   *   sampleThickness 30–60 nm
   *   method          hrtem
   *
   * ⚠️ 损伤层 2–5 nm 是非晶的，HRTEM 必须在它**以下**的晶体区成像；
   *    感兴趣的结构若在顶面 2–5 nm 内，已经被 FIB 非晶化，测不到晶格。
   */
  {
    id: 'mat/tem-damage-record',
    name: 'Damage Layer Record', name_zh: '损伤层记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'damageLayer', kind: 'range', min: 2, max: 5, unit: 'nm' },
      { param: 'uncertainty', kind: 'range', min: 0.5, max: 1, unit: 'nm', dir: 'atMost' },
      { param: 'pointResolution', kind: 'range', min: 0.2, max: 0.5, unit: 'nm', dir: 'atMost' },
      { param: 'voltage', kind: 'range', min: 100, max: 200, unit: 'kV' },
      { param: 'sampleThickness', kind: 'range', min: 30, max: 60, unit: 'nm' },
      { param: 'method', kind: 'enum', values: ['hrtem'] },
    ],
  },
];

export const TEM_SAMPLE_ROUTES: readonly Route[] = [
  {
    /**
     * **TEM 薄片制备：Pt 保护 → 30 kV 粗切 → 2–5 kV 精修 → 0.5–2 kV 终抛。**
     *
     *   硅片 1 + Pt 1 mg → 薄片制备记录 1 份
     *
     * 30 kV Ga⁺ 射程 20–40 nm；粗切留 80–120 nm，再精修到 50–80 nm，
     * 最后 0.5–2 kV 终抛到 30–60 nm、损伤层 2–5 nm、尺寸 10×5 µm。
     * Pt 层 0.1–0.5 µm 挡住帘状条纹与顶面非晶化。
     */
    id: 'measure/tem-sample-prep',
    name: 'TEM Lamella Preparation', name_zh: 'TEM 薄片制备',
    produces: [
      {
        item: 'mat/tem-lamella-prep-record',
        qty: q(1),
        gives: [
          { param: 'thickness', kind: 'range', min: 30, max: 60 },
          { param: 'damageLayer', kind: 'range', min: 2, max: 5 },
          { param: 'ptLayer', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'width', kind: 'range', min: 5, max: 5 },
          { param: 'length', kind: 'range', min: 10, max: 10 },
          { param: 'voltage', kind: 'range', min: 5, max: 30 },
          { param: 'fineEnergy', kind: 'range', min: 2, max: 5 },
          { param: 'finalEnergy', kind: 'range', min: 0.5, max: 2 },
          { param: 'method', kind: 'enum', oneOf: ['fib+low-kv'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      // Pt 保护层 0.1–0.5 µm × 10×5 µm ≈ 5×10⁻¹³ kg；按 1 mg 投料留余量
      { anyOf: [{ item: 'mat/platinum', qty: q(1, 1_000_000) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room', 'plant/length-standard-300mm'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '① 蒸 Pt 保护层 0.1–0.5 µm（挡帘状条纹与顶面非晶化；0.001–0.1 Pa）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.1 }],
      },
      {
        note_zh:
          '② FIB 粗切 30 kV：Ga⁺ 射程 20–40 nm（TRIM、7° 入射），切 80–120 nm；只切到 80–120 nm，留精修余量',
        performedBy: 'plant/fib-tem',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh:
          '③ FIB 精修 2–5 kV：射程降到 5–10 nm（5 kV），切到 50–80 nm；30 kV 与 5 kV 的射程/损伤比 4–6 倍',
        performedBy: 'plant/fib-tem',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh:
          '④ 低能终抛 0.5–2 kV（Ar⁺，源 300–1500 eV）：射程 0.5–3 nm，最终 30–60 nm、损伤层 2–5 nm；不终抛就留 20–40 nm 非晶',
        performedBy: 'plant/ion-beam-figuring',
        under: [{ param: 'pressure', min: 0.05, max: 0.5 }],
      },
      {
        note_zh:
          '⑤ 转移到载网、量厚度 30–60 nm、损伤层 2–5 nm、Pt 层 0.1–0.5 µm、尺寸 10×5 µm；写制备记录',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **损伤层：HRTEM 截面直接量非晶/晶态界面。**
     *
     *   薄片 1 件 → 损伤层记录 1 份
     *
     * 200 kV HRTEM、5 点；非晶/晶态界面在 2–5 nm，界面定位 ±0.2 nm，
     * 5 点散布 + 系统项给 uncertainty 0.5–1 nm。损伤层是点分辨
     * 0.2–0.5 nm 的 4–25 倍，所以必须在它以下的晶体区成像。
     */
    id: 'measure/tem-damage-layer',
    name: 'Damage Layer Measurement', name_zh: '损伤层测量',
    produces: [
      {
        item: 'mat/tem-damage-record',
        qty: q(1),
        gives: [
          { param: 'damageLayer', kind: 'range', min: 2, max: 5 },
          { param: 'uncertainty', kind: 'range', min: 0.5, max: 1 },
          { param: 'pointResolution', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'voltage', kind: 'range', min: 100, max: 200 },
          { param: 'sampleThickness', kind: 'range', min: 30, max: 60 },
          { param: 'method', kind: 'enum', oneOf: ['hrtem'] },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/fib-tem/lamella',
            qty: q(1),
            need: [{ param: 'thickness', kind: 'range', min: 30, max: 60 }],
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(3) },
    steps: [
      {
        note_zh:
          '① 200 kV HRTEM 截面：在 30–60 nm 薄片上找非晶/晶态界面，5 点；点分辨 0.2–0.5 nm，损伤层 2–5 nm 在其下',
        performedBy: 'plant/tem',
        under: [
          { param: 'pressure', min: 1e-7, max: 1e-5 },
          { param: 'temperature', min: 19, max: 21 },
        ],
      },
      {
        note_zh:
          '② 量界面：非晶/晶态界面定位 ±0.2 nm，5 点均值 2–5 nm；系统项（界面起伏、Pt 层）给 uncertainty 0.5–1 nm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 判读：损伤层 2–5 nm 是点分辨 0.2–0.5 nm 的 4–25 倍；感兴趣结构在顶面 2–5 nm 内就已经非晶化，必须在损伤层以下成像',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...TEM_SAMPLE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...TEM_SAMPLE_ROUTES];
