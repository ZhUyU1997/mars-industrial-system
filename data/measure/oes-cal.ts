/**
 * OES 870 nm 波长/线宽标定 —— 缺口总表“OES 870 nm 效率”里那台源的**测量路线**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 这条路线补的是什么
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 现有 `measure/oes-wavelength`（`metrology.ts`）只校 **589 nm 附近的钠 D 双线**
 * （588.995 / 589.592 nm）。它把 589 nm 的零位与色散读出来，但 870 nm 是
 * 靠光栅方程外推 281 nm，不是实测 —— 所以 `oes-grating.ts` 第八节 R8-4
 * 一直写着“870 nm 本身没有已知窄线源”。
 *
 * 本文件补那条线：`plant/oes-line-source`（`data/machine/lcr-lf.ts`）是一台
 * **Littman–Metcalf 外腔二极管激光器**，波长由 λ = d(sinα + sinβ) 算出来：
 *   d = 833.333 nm（1200 线/mm 的刻划光栅，节距由刻划机定）
 *   α = 22.00°（光栅座，磨到 0.01°）
 *   β = 调谐镜方向，由 100 mm 正弦杆 + 测微头读
 * RSS 0.157 nm ⇒ **870±0.2 nm 是算出来的绝对值，不是从 589 nm 外推的**。
 *
 * 于是这条路线第一次能在 870 nm 上同时给出三样：
 *   ① 波长   谱仪读数 vs 源的几何计算值，两种量法在 0.2 nm 内对上
 *            （共用光栅节距 d，不是两次独立证明，见下）；
 *   ② 线宽   谱仪 FWHM（仪器的 0.2–0.5 nm 包着源的 ≤0.1 nm）→ 扣仪器宽；
 *   ③ 稳定度 1 h 内 5 次功率读数（锁相 + 斩波，1 s TC）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 它证明什么、不证明什么
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * **证明**：
 *   · 870 nm 处谱仪的角标与源的角标一致到 ≤0.2 nm（两种量法都用同一块光栅的
 *     d，d 是共模项，所以这不是两次独立证明；能证的是两套正弦杆/基块在 870 上
 *     的一致性，以及 589 nm 的钠双线旁证的光栅方程没有写错）；
 *   · 源的线宽**上限**：FWHM 扣掉谱仪仪器宽后 ≤0.15 nm（谱仪分辨 0.2–0.5 nm，
 *     这是 deconvolution 的上限，不是直接读数）；
 *   · 1 h 功率稳定度 0.1–0.5 %。
 *
 * **不证明**：
 *   · 源的线宽 ≤0.1 nm。谱仪的分辨率 0.2–0.5 nm 比源的 0.03–0.1 nm 宽 2–10 倍，
 *     deconvolution 只能给上限；要证 0.1 nm 以下，需要扫描 F-P（本层没有，
 *     它是 `plant/phase-shifter` + 10 mm 间隔的下一步，不在这条路线里）。
 *   · 200–900 nm 全段。只有 870 nm 这一点 + 589 nm 的钠双线两点；中间段仍
 *     靠光栅方程。
 *   · 绝对溯源性到一级波长标准。d 来自刻划机的丝杠，α 来自磨出来的 22° 基块，
 *     β 来自测微头 —— 几何量溯源到量块/测长，不是激光波长标准。
 *   · 效率。这一条只做波长/线宽/稳定度；870 nm 一级效率已另立
 *     `measure/grating-efficiency` → `mat/grating-efficiency-record`
 *     （`plant/goniometer-theta2theta` + `std/reflectance-standard`）。
 *     **曾经没有 0–90° 测角仪** —— 那段 A 类推导保留在 `metrology.ts`
 *     与 `oes-grating.ts` 的注释里，这里只改指向，不删历史。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 数
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   谱仪波长换算   870 nm 档用 25° 基块：1 µm 测微头 ≈ 0.016 nm（光栅方程）；
 *                  589 nm 档的 0.034 nm/µm（45 mm 杆）不能直接搬；
 *                  两档的换算都只在各自的角度上成立。
 *   扫描步距       1 µm ≈ 0.016 nm；FWHM 0.2–0.5 nm 是 12–31 步，够定半高。
 *   源功率         0.5–20 mW（出光镜 f=80 焦到 6×26 µm，10 µm 缝过一半以上）
 *   探测器         `plant/refractometer/detector`（Si，870 nm 上 0.4 A/W）；
 *                  1 mW ⇒ 0.4 mA，1 nA 暗电流可忽略。
 *   斩波/锁相      200 Hz 斩波 + `plant/lockin-lf`（1 Hz–1 kHz），TC 1 s。
 *   稳定度         5 点 × 12 min = 1 h，取 (max−min)/mean。
 *   时间           装源/对光 1 h + 扫 5 点 0.5 h + 线宽 1 h + 稳定度 1 h
 *                  + 算/写 0.5 h + 拆/复装 0.5 h = **4.5 h**（rate 写 5 h）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * R13
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本文件只有 `mat/oes-cal-record`（记录条目）与 `measure/oes-wavelength-cal`
 * （测量路线）。仪器 `plant/oes-line-source` 与它的生产路线全在
 * `data/machine/lcr-lf.ts`，这里不重复定义、也不写 `make/*`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const OES_CAL_ITEMS: readonly Item[] = [
  /**
   * **OES 870 nm 波长/线宽/稳定度记录。是数据，不是物料。**
   *
   * 一份记录 = 一次 870 nm 标定：
   *
   *   wavelength          869.8–870.2 nm  本次的波长（谱仪读数与几何计算在
   *                       0.2 nm 内对上；两条链共用光栅节距 d，这是共模项，
   *                       不算两次独立证明）
   *   fwhm                0.2–0.5 nm      谱仪上量到的半高全宽 —— 主要是仪器宽，
   *                       不是源线宽；记录上必须与下一格同时读
   *   linewidthUpperBound 0.03–0.15 nm    √(FWHM² − 仪器宽²) 的上限；
   *                       仪器宽用 589 nm 钠双线量、按 λ/cosβ 折算到 870 nm
   *                       （±20 %），所以这一格是**上限**，不是峰宽
   *   stability           0.1–0.5 %       1 h 内 5 次功率读数的 (max−min)/mean
   *   power               0.5–20 mW       870 nm 输出（出光镜后，进缝前）
   *
   * ⚠️ **这不是“线宽 0.1 nm 已实测”。** 本层谱仪分辨 0.2–0.5 nm，比源宽
   *   2–10 倍；`linewidthUpperBound` ≤0.15 nm 只能说明“源比 0.15 窄”，
   *   不能说明“源是 0.1”或“源是 0.03”。要证 0.1 以下，加扫描 F-P。
   */
  {
    id: 'mat/oes-cal-record',
    name: 'OES 870 nm 波长/线宽/稳定度记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'wavelength', kind: 'range', min: 860, max: 880, unit: 'nm' },
      { param: 'fwhm', kind: 'range', min: 0, max: 1, unit: 'nm', dir: 'atMost' },
      { param: 'linewidthUpperBound', kind: 'range', min: 0, max: 0.5, unit: 'nm', dir: 'atMost' },
      { param: 'stability', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
      { param: 'power', kind: 'range', min: 0, max: 100, unit: 'mW' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 0.05, unit: 'nm', dir: 'atMost' }, // 主项：Ar HCL 内插 0.01–0.02 nm + 基块几何 0.01 nm ⇒ 0.02–0.03 nm（原 0.1–0.2）
    ],
  },
];

export const OES_CAL_ROUTES: readonly Route[] = [
  {
    /**
     * **870 nm 标定：把源装在 OES 入射缝前，扫峰、定波长、量线宽、量 1 h 稳定度。**
     *
     *   源 1 台（`plant/oes-line-source`，`needs`）
     *   + 谱仪 1 台（`plant/refractometer`，各步骤的 `performedBy`）
     *   + 锁相 1 台（`plant/lockin-lf`，`needs`，读光电二极管）
     *   → `mat/oes-cal-record` 1 份
     *
     * 为什么 `needs` 里有两台机器：谱仪是执行者（扫测微头、读探测器），
     * 锁相是读数器（斩波 200 Hz 的同步检波）；两台都不被消耗。
     *
     * 步骤与判据见每条 `note_zh`。**波长 870±0.2 nm 是设计窗口**：
     * 本次扫描若两种量法差 >0.2 nm，记录写实际差值，并把该点标成 B 类；
     * 不把“设计 0.2”写成“实测 0.2”。
     */
    id: 'measure/oes-wavelength-cal',
    name: '870 nm 标定',
    rate: { hours: q(5) },
    produces: [
      {
        item: 'mat/oes-cal-record',
        qty: q(1),
        gives: [
          { param: 'wavelength', kind: 'range', min: 869.8, max: 870.2 },
          { param: 'fwhm', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'linewidthUpperBound', kind: 'range', min: 0.03, max: 0.15 },
          { param: 'stability', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'power', kind: 'range', min: 0.5, max: 20 },
          { param: 'uncertainty', kind: 'range', min: 0.02, max: 0.03 },
        ],
      },
    ],
    // 标定不吃料：源、谱仪、锁相都只是被占用；记录是数据，不是物料。
    uses: [],
    needs: [
      {
        item: 'plant/oes-line-source',
        qty: q(1),
        need: [
          { param: 'wavelength', kind: 'range', min: 860, max: 880 },
          { param: 'wavelengthAccuracy', kind: 'range', min: 0.05, max: 0.2 },
          { param: 'measure/stability', kind: 'range', min: 0.1, max: 0.5 },
        ],
        onRelax: 'functional-kept',
      },
      'plant/lockin-lf',
      'plant/metrology-room',
      'plant/power-standard-100w',
    ],
    steps: [
      {
        note_zh:
          '① 装源/对光：`plant/oes-line-source` 的出光镜（f = 80 mm）把 10.8 mm 束焦到 6×26 µm，放在 OES 入射缝（10 µm）前 80 mm；调二维位移，让锁相读数最大（缝的横向容差 ±10 µm）；斩波 200 Hz、锁相 TC 1 s、参考取斩波。谱仪用 25° 基块、870 nm 档，测微头先到 870 nm 附近。',
        performedBy: 'plant/refractometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 找峰：源固定在 870.0 nm（由 λ = d(sinα + sinβ) 定，测微头零位对过），谱仪测微头在 ±1 nm（±60 µm）内扫 1 µm 步，找信号峰；记峰位 x₀（1 µm 估读）。若信号 <10× 噪声，先查对光与源功率，**不产记录**。',
        performedBy: 'plant/refractometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 定波长：谱仪按 25° 基块几何算 λ_spec = d(sinα + sinβ_spec)，β_spec 由谱仪正弦杆读；源按自己的基块/正弦杆算 λ_geom = d(sinα′ + sinβ′)。两值差 ≤0.2 nm 说明两套角标在 870 上一致（升级后以 mat/oes-wavelength-hcl-record 的 0.01–0.02 nm 为主证，本步几何项只补 0.01），才写 wavelength 869.8–870.2；差 >0.2 nm 就照实写差值并标 B 类。**589 nm 的钠双线只校过 45 mm 杆那一档的角标，不能把 0.034 nm/µm 直接搬到 25° 基块**：870 的零位由 25° 基块的几何给，589 那两点只作正弦杆/光栅方程的旁证。',
        performedBy: 'plant/refractometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '④ 量线宽：在峰两侧各扫到 10 % 高度（约 ±0.5 nm = ±31 µm），1 µm 步；半高全宽 = FWHM。仪器宽用 589 nm 钠双线量到的值按 λ/cosβ 折算到 870 nm（0.2–0.5 nm，±20 %）；linewidthUpperBound = √(FWHM² − 仪器宽²)。**FWHM 是仪器包着的，别把它写成源线宽。**',
        performedBy: 'plant/refractometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑤ 量稳定度：源回到 870.0 nm、谱仪固定在峰位，锁相 TC 1 s，每 12 min 读一次功率，5 次共 1 h；stability = (max−min)/mean。同时记源温控的 T 型热电偶读数（±0.5 K）—— 温漂 0.5 K 对应 0.03–0.04 nm，若波长漂出 0.2 nm，先查温控再看光栅台。',
        performedBy: 'plant/refractometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑥ 写记录 + 拆源复装：记录 wavelength / fwhm / linewidthUpperBound / stability / power 五项，注明三件事 —— 只标 870 nm 这一点；线宽是上限不是峰宽；绝对波长溯源到光栅节距与两个角，不是激光波长标准。源拆下、谱仪复零。',
        performedBy: 'plant/refractometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '线源 1 台（进、出，不消耗）+ 谱仪 1 台、锁相 1 台（进、出，不占用；源按 10 000 h 寿命、5 h/次摊，已含在 rate 里）→ 记录 1 份；**记录是数据不是物料**，没有 kg 账。5 h 里谱仪不能做别的测量，这个停机就是 rate 的 5 h。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...OES_CAL_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...OES_CAL_ROUTES];
