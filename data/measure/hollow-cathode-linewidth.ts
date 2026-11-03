/**
 * 空心阴极灯（Ar 填充）两条谱线的**线宽**实测记录：866.79 / 912.30 nm。
 *
 * 与 `measure/oes-wavelength-hcl` 的分工：那条管**波长准不准**（0.01–0.02 nm），
 * 这条管**谱线宽不宽**（0.05–0.1 nm）。两件事一起才决定 OES 能不能把 870 区的
 * 两条邻近线分开。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、分辨率够不够（这是本条的关键）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   要测 0.05–0.1 nm 的线宽，仪器分辨必须**至少小 2–3 倍** ⇒ 0.02–0.05 nm。
 *   - `plant/monochromator`：2–10 nm ⇒ **不够，不能用**（差 40–200×）；
 *   - 法布里-珀罗标准具：**0 条目**（本层没有），做不了干涉法；
 *   - `plant/refractometer` 的 OES 谱仪：0.034 nm/µm 色散、狭缝 10–20 µm ⇒
 *     **0.02–0.05 nm**，勉强够 —— 这是本层唯一能用的仪器。
 *
 *   ⇒ 判读用**去卷积**：FWHM_true = √(FWHM_meas² − FWHM_inst²)。
 *     测 0.10 nm、仪器 0.05 nm ⇒ 真值 0.087 nm；测 0.05 nm、仪器 0.05 nm ⇒ 真值 0，
 *     只能报“≤0.05 nm（受仪器限制）”，不能报更小。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① 法布里-珀罗标准具 0 条目：0.02 nm 以下的线宽测不了；本层的下限就是仪器分辨。
 *  ② 谱仪没有波长-狭缝联合标定：0.02–0.05 nm 的仪器宽度是按色散×狭缝估的，
 *     没做 632.8 nm He-Ne 的实测（本层没有稳频激光）。
 *  ③ Ar 灯自吸收：电流 15–20 mA 时 866.79 线会自蚀，线宽偏高 10–20 %，所以电流压 8–15 mA。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const HCL_LINEWIDTH_ITEMS: readonly Item[] = [
  /**
   * **HCL 线宽记录：866.79 / 912.30 nm 两条线的 FWHM。**
   *
   *   linewidth866        0.05–0.1 nm
   *   linewidth912        0.05–0.1 nm
   *   instrumentResolution 0.02–0.05 nm（OES 谱仪，狭缝 10–20 µm）
   *   method              oes-spectrograph（法布里-珀罗本层 0 条目）
   */
  {
    id: 'mat/hcl-linewidth-record',
    name: 'HCL 线宽记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'linewidth866', kind: 'range', min: 0.01, max: 0.5, unit: 'nm' },
      { param: 'linewidth912', kind: 'range', min: 0.01, max: 0.5, unit: 'nm' },
      { param: 'instrumentResolution', kind: 'range', min: 0.005, max: 0.2, unit: 'nm' },
      { param: 'method', kind: 'enum', values: ['oes-spectrograph', 'fabry-perot'] },
    ],
  },
];

export const HCL_LINEWIDTH_ROUTES: readonly Route[] = [
  {
    /** 线宽：起辉预热 → OES 谱仪扫两条线 → 测 FWHM → 去卷积 → 判读。 */
    id: 'measure/hollow-cathode-linewidth',
    name: 'HCL 线宽测量',
    produces: [
      {
        item: 'mat/hcl-linewidth-record',
        qty: q(1),
        gives: [
          { param: 'linewidth866', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'linewidth912', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'instrumentResolution', kind: 'range', min: 0.02, max: 0.05 },
          { param: 'method', kind: 'enum', oneOf: ['oes-spectrograph'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/hollow-cathode-ar', qty: q(1, 250) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '① 起辉与预热：200–400 V 起辉、电流压 8–15 mA（>15 mA 时 866.79 自蚀，线宽偏高 10–20 %），预热 30 min',
        performedBy: 'plant/hv-source-500v',
      },
      {
        note_zh: '② 谱仪：OES 通道、狭缝 10–20 µm、色散 0.034 nm/µm ⇒ 仪器分辨 0.02–0.05 nm；**单色仪 2–10 nm 不够，不能用**；FP 标准具本层 0 条目',
        performedBy: 'plant/refractometer',
      },
      {
        note_zh: '③ 测 FWHM：866.79 与 912.30 各扫 20 点、步距 0.005 nm，峰形拟合（Lorentz/Gauss 都试）；取半高全宽',
        performedBy: 'plant/refractometer',
      },
      {
        note_zh: '④ 去卷积：FWHM_true = √(FWHM_meas² − FWHM_inst²)；测值 ≤ 仪器分辨时只能报“≤0.05 nm（受仪器限制）”，不能报更小',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '⑤ 判读：两条线各 0.05–0.1 nm；若 912.30 比 866.79 宽 >30 %，先查灯电流与自吸收，再判灯不合格',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(5) },
    unbalanced_zh: 'Ar 灯 1/250 支 → 记录 1 份（按件计）',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...HCL_LINEWIDTH_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...HCL_LINEWIDTH_ROUTES];
