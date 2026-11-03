/**
 * Ra 的第二套方法 —— AFM。**与触针 `mat/ra-profile-record` 只做一致性判据，
 * 不做互证**（R13：measure/* 与记录只放 data/measure）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么两法不可直接互证
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   AFM：探针尖端 5–10 nm，测的是**真表面与针尖的曲率卷积**
 *        （dilation）；1–10 µm 扫描、512×512 点，横向采样 2–20 nm。
 *        对 Ra 5–50 nm、横向特征 >10 nm 的表面，卷积主要削掉
 *        <10 nm 的高频，Ra 偏低 5–15 %。
 *
 *   触针：尖端 1.8–2.2 µm，是**更大尺度的低通**；它进不去窄于
 *        ~2 µm 的谷，而且 `mat/ra-profile-record` 的 λc 0.08–0.25 mm、
 *        评长 0.4–1.25 mm 又切掉长波。同一表面上，细纹理的 Ra 会被
 *        触针压得比 AFM 低 15–40 %。
 *
 *   两法的传递函数不同（针尖半径差 200–400 倍、带宽差 80–8000 倍），
 *   所以**不能拿一个去标定另一个**。本记录只给**一致性判据**：
 *   同一块量块、同 5 点，Ra 落在 5–50 nm 的重叠段时，两法差 ≤15–25 %
 *   算"同一量级"；差 >25 % 不一定是错，而是表面有 <2 µm 的细纹理，
 *   这时 AFM 是更接近真值的那一个。
 *
 * ⚠️ `plant/afm` 的横向分辨实际是 **5–10 nm**（`lateralResolution`
 *    props 仍写 1–5 nm 是扫描器采样/边缘定位，不是形貌分辨，见
 *    `data/machine/afm.ts` D1/D8）。本记录用 `tipRadius 5–10 nm` 把
 *    这个数写进窗口，不拿 props 的 1–5 nm 当形貌分辨。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const RA_AFM_ITEMS: readonly Item[] = [
  /**
   * AFM 的 Ra 记录。**一份记录对应一块量块/一片样品。**
   *
   *   ra                0.0005–0.05 µm   = 0.5–50 nm
   *   scanRangeX/Y      1–10 µm          512×512 点，横向采样 2–20 nm
   *   tipRadius         0.005–0.01 µm    AFM 探针 5–10 nm（曲率卷积的尺度）
   *   verticalResolution 0.05–0.1 nm     Z 闭环噪声 0.03–0.05 nm
   *   agreement         15–25 %          与 `mat/ra-profile-record` 的差
   *   method            afm-tapping
   *
   * ⚠️ `agreement` 是**一致性判据**，不是校准证书：两法的针尖卷积不同，
   *    差 ≤15–25 % 只说明同一量级；差 >25 % 时先看表面有没有 <2 µm 纹理。
   */
  {
    id: 'mat/ra-afm-record',
    name: 'AFM Ra Record', name_zh: 'AFM 的 Ra 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'ra', kind: 'range', min: 0.0005, max: 0.05, unit: 'µm' },
      // make/afm 的 give 用 measure/roughness（0–100 nm，atMost）；按同一量程口径声明。
      { param: 'measure/roughness', kind: 'range', min: 0, max: 100, unit: 'nm', dir: 'atMost' },
      { param: 'scanRangeX', kind: 'range', min: 1, max: 10, unit: 'µm' },
      { param: 'scanRangeY', kind: 'range', min: 1, max: 10, unit: 'µm' },
      { param: 'tipRadius', kind: 'range', min: 0.005, max: 0.01, unit: 'µm' },
      { param: 'verticalResolution', kind: 'range', min: 0.05, max: 0.1, unit: 'nm' },
      { param: 'agreement', kind: 'range', min: 15, max: 25, unit: '%', dir: 'atMost' },
      { param: 'method', kind: 'enum', values: ['afm-tapping'] },
    ],
  },
];

export const RA_AFM_ROUTES: readonly Route[] = [
  {
    /**
     * **AFM 测 Ra：同一块量块、1–10 µm 扫描、与触针记录比一致性。**
     *
     *   量块 1 块 → Ra 记录 1 份
     *
     * 扫描 1–10 µm、512×512、tapping、1 Hz；取 5 点（中心 + 四角 2 mm 内）。
     * Ra 按 ISO 4287 的算术平均，不用 λc（AFM 的带宽由扫描长度定）。
     * 与 `mat/ra-profile-record` 的 5 点比：Ra 5–50 nm 重叠段差 ≤15–25 %
     * 记 agreement；差 >25 % 时在注释里写"细纹理，AFM 更接近真值"，
     * 不把触针值当基准。
     */
    id: 'measure/ra-afm',
    name: 'AFM Ra Measurement', name_zh: 'AFM 的 Ra 测量',
    produces: [
      {
        item: 'mat/ra-afm-record',
        qty: q(1),
        gives: [
          { param: 'ra', kind: 'range', min: 0.0005, max: 0.05 },
          { param: 'measure/roughness', kind: 'range', min: 0, max: 100 },
          { param: 'scanRangeX', kind: 'range', min: 1, max: 10 },
          { param: 'scanRangeY', kind: 'range', min: 1, max: 10 },
          { param: 'tipRadius', kind: 'range', min: 0.005, max: 0.01 },
          { param: 'verticalResolution', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'agreement', kind: 'range', min: 15, max: 25 },
          { param: 'method', kind: 'enum', oneOf: ['afm-tapping'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/gauge-block/block', qty: q(1) }] }],
    // 与触针记录比：同一块量块、同 5 点；记录是前提，不被消耗
    needs: ['plant/metrology-room', 'mat/ra-profile-record'],
    rate: { hours: q(2) },
    steps: [
      {
        note_zh:
          '① AFM 扫 1–10 µm、512×512、tapping、1 Hz；探针 5–10 nm，Z 噪声 0.03–0.05 nm；同一块量块取 5 点（中心 + 四角 2 mm 内）',
        performedBy: 'plant/afm',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 算 Ra（ISO 4287 算术平均，不用 λc；AFM 的带宽由 1–10 µm 扫描长度定）；每点 3 条线，5 点平均',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 与 `mat/ra-profile-record` 的 5 点比：Ra 5–50 nm 重叠段差 ≤15–25 % 记 agreement；差 >25 % 不判错，先看表面有没有 <2 µm 纹理（AFM 针尖 5–10 nm vs 触针 1.8–2.2 µm，传递函数不同，不可直接互证）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...RA_AFM_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...RA_AFM_ROUTES];
