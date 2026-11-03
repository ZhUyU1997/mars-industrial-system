/**
 * 电子级 Si₃N₄ 的四条测量/校准路线 —— 单独放 data/measure（R13）。
 *
 *   measure/si3n4-vbd             膜厚 + ±500 V 扫 I-V → Vbd / 漏电记录
 *   measure/sims-na-rsf           Na 标样 → SIMS 的 Na RSF 记录
 *   measure/nh3-flow-calibration  NH₃ MFC 的体积法/压力降法 → 流量记录
 *   measure/cleanroom-class       表面颗粒扫描 → ISO 等级记录
 *
 * ⚠️ 记录条目的 `props` 是**实测窗口**；路线的 `gives` 是这台仪器/这条
 * 方法能覆盖的窗口。没有测之前，窗口不是读数 —— 与 data/measure 其他文件
 * 同一条口径。
 *
 * ⚠️ 这四条都不能把“电子级已闭合”写出来：
 *   · Vbd 记录的是探针台点接触的 I-V，不是整片 pinhole 扫描；
 *   · Na RSF 标样的低端 1e11 cm⁻² 在 0.1 µm 膜里约 1e16 cm⁻³，低于
 *     SIMS 0.6 ppm 档（约 3e16 cm⁻³）；可用段是 1e12–1e13；
 *   · NH₃ 流量标定没有腐蚀性气体标准，体积法/压力降法只到 3–5 %；
 *   · 洁净室等级是**表面**颗粒扫描，不是 ISO 14644 的空气悬浮粒子计数。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const SI3N4_MEASURE_ITEMS: readonly Item[] = [
  /**
   * Si₃N₄ 的 I-V / 击穿记录。**一份记录对应一片。**
   *
   * 三个读数：
   *   vbd        0–10 MV/cm     探针台点接触，电压步进 1 V；0.3 µm 上 1 V = 0.033 MV/cm
   *   leakage    1e-9–1e-3 A/cm² 取样电阻分档（1 GΩ/1 MΩ/1 kΩ），1 nA–1 mA
   *   thickness  0.3–1 µm       椭偏先测，击穿场 = Vbd / thickness
   *
   * ⚠️ 不是整片 pinhole 扫描：只有探针压住的 pad；针孔密度仍要颗粒/铜装饰法。
   */
  {
    id: 'mat/si3n4-vbd-record',
    name: 'Si₃N₄ 的 I-V / 击穿记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'vbd', kind: 'range', min: 0, max: 10, unit: 'MV/cm' },
      { param: 'leakage', kind: 'range', min: 1e-9, max: 1e-3, unit: 'A/cm²' },
      { param: 'thickness', kind: 'range', min: 0.3, max: 1, unit: 'µm' },
    ],
  },

  /**
   * SIMS 的 Na RSF 记录。**用 `mat/sims-na-rsf-standard` 反解 RSF。**
   *
   *   dose          1e11–1e13 cm⁻²   标样名义剂量；低端 1e11 在 0.1 µm 膜里
   *                                  约 1e16 cm⁻³，低于 0.6 ppm 档，实际可用 1e12–1e13
   *   rsfAccuracy   0–10 %           SIMS 机器本身（Al/P 标样）的 RSF 重复性
   *   standardUncertainty 15–30 %    Na 标样的不确定度（记录元数据，不当作机器能力）
   *   uniformity    3–5 %            标样片内均匀性
   *
   * ⚠️ 这是 SIMS 第一次有 Na 的 RSF；在此之前 Na 只能半定量（只有 Al/P 标样）。
   */
  {
    id: 'mat/sims-na-rsf-record',
    name: 'SIMS Na 相对灵敏度因子记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'dose', kind: 'range', min: 1e11, max: 1e13, unit: 'cm⁻²' },
      // SIMS 机器本身的 rsfAccuracy 0–10 %（Al/P 标样）；Na 标样的不确定度另记
      { param: 'rsfAccuracy', kind: 'range', min: 0, max: 10, unit: '%', dir: 'atMost' },
      // 误差/不确定度字段：measure 检查把它当记录元数据，不当作机器能力
      { param: 'standardUncertainty', kind: 'range', min: 15, max: 30, unit: '%' },
      { param: 'uniformity', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * NH₃ MFC 流量标定记录。**体积法/压力降法，不是 N₂ 传递。**
   *
   *   flow       0–200 sccm     皂膜量管或 1 L 定容 + 电容薄膜规
   *   accuracy   3–5 %          体积/时间 ±1 %、温度 ±1 %、压力 ±1 %、皂膜 ±2 %
   *   gas        NH₃            只对 NH₃ 标定；N₂ 的旧标定不能直接套
   */
  {
    id: 'mat/nh3-flow-cal-record',
    name: 'NH₃ MFC 流量标定记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'flow', kind: 'range', min: 0, max: 200, unit: 'sccm' },
      // make/mfc-nh3 的 give 用 flowRange；与 flow 同窗、同一标定点。
      { param: 'flowRange', kind: 'range', min: 0, max: 200, unit: 'sccm' },
      { param: 'accuracy', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
      { param: 'gas', kind: 'enum', values: ['NH3'] },
    ],
  },

  /**
   * 洁净室等级记录。**表面颗粒扫描推出来的 ISO 等级，不是空气悬浮粒子计数。**
   *
   *   isoClass      5–7          表面清洁度对应的 ISO 14644 等级（设计/资格窗口）
   *   minParticle   0.09–0.10 µm 颗粒计数器实际交付窗口
   *
   * ⚠️ 只能到这一级：计数器是 193 nm 暗场**表面**扫描（18 h/片），
   * 不是空气悬浮粒子计数器；ISO 14644-1 的等级判据是每立方米空气的粒子数。
   * 所以 5–7 是“表面清洁度支持到”的资格窗口，不是空气 ISO 证书。
   */
  {
    id: 'mat/cleanroom-class-record',
    name: '洁净室等级记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'isoClass', kind: 'range', min: 5, max: 7, unit: '级' },
      { param: 'minParticle', kind: 'range', min: 0.09, max: 0.1, unit: 'µm' },
    ],
  },
];

export const SI3N4_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **Si₃N₄ 的 I-V / Vbd：椭偏测厚 → ±500 V 扫 I-V → 判击穿。**
     *
     *   Si₃N₄ 片 1 → Vbd/漏电记录 1 份
     *
     * 5 MV/cm 在 0.3–1 µm 上要 **150–500 V**；`plant/hv-source-500v` 的
     * ±500 V、1 nA–1 mA、1 V 步进正好覆盖。探针台只压一个 pad；面积按
     * 100×100 µm 或版图 pad 算。击穿判据：电流在 1 V 内涨 >10×，或达到
     * 1 mA 限流。
     */
    id: 'measure/si3n4-vbd',
    name: 'Si₃N₄ 的 I-V / 击穿测量',
    produces: [
      {
        item: 'mat/si3n4-vbd-record',
        qty: q(1),
        gives: [
          { param: 'vbd', kind: 'range', min: 0, max: 10 },
          { param: 'leakage', kind: 'range', min: 1e-9, max: 1e-3 },
          { param: 'thickness', kind: 'range', min: 0.3, max: 1 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/si3n4-lpcvd', qty: q(1) }] }],
    needs: ['plant/hv-source-500v', 'plant/metrology-room', 'plant/vramp-tester', 'plant/cmos-test/parameter-analyzer', 'plant/thickness-standard'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① 椭偏测厚：488 nm、70°/75°，读 0.3–1 µm 的厚度与 n；击穿场要用实测厚度，不能用设计值',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② I-V：probe-station 压 100×100 µm pad；hv-source 从 0 升到 500 V，1 V/步、每步 0.1 s；电流 1 nA–1 mA 分档。正负各扫一遍，取较小 |Vbd|',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 判据：1 V 内电流涨 >10× 或到 1 mA 限流记击穿；Vbd = V_break / thickness；漏电取 2 MV/cm 处的电流密度。**只测探针压住的 pad，不是整片 pinhole**',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **Na RSF：Na 标样 → SIMS 深度剖面 → RSF 与剂量记录。**
     *
     *   标样 1 片 → Na RSF 记录 1 份
     *
     * SIMS 用 O₂⁺ 一次束（电正性 Na 可测），质量数 23 在 1–300 内；
     * 深度分辨 2.4–20 nm、检出限 0.6–10 ppm。标样的剂量已知（15–30 %），
     * 把积分信号折成 RSF。
     *
     * ⚠️ 低端 1e11 cm⁻² 在 0.1 µm 膜里约 1e16 cm⁻³，低于 0.6 ppm 档；
     * 实际可用段 1e12–1e13；低端要 100 s 率表（2 ppm）或更厚的膜。
     */
    id: 'measure/sims-na-rsf',
    name: 'SIMS Na 相对灵敏度因子测量',
    produces: [
      {
        item: 'mat/sims-na-rsf-record',
        qty: q(1),
        gives: [
          { param: 'dose', kind: 'range', min: 1e11, max: 1e13 },
          { param: 'rsfAccuracy', kind: 'range', min: 0, max: 10 },
          { param: 'standardUncertainty', kind: 'range', min: 15, max: 30 },
          { param: 'uniformity', kind: 'range', min: 3, max: 5 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/sims-na-rsf-standard', qty: q(1) }] }],
    needs: ['plant/sims', 'plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① 装标样：φ100 片进 SIMS 进样室，抽到 1e-5 Pa；O₂⁺ 一次束 3 keV/53 nA 或 500 eV/1 nA；19–21 °C（SIMS 在 needs 里，执行者按 102 台白名单写 robot）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 深度剖面：质量数 23（Na⁺），200–300 µm 光栅；积分 Na⁺ 信号到硅衬底；深度标尺用溅射率与坑深',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 算 RSF：RSF = dose / ∫I dz；机器 rsfAccuracy 0–10 %（Al/P 标样），Na 标样另记 standardUncertainty 15–30 %。低端 1e11 只报“≤1 ppm 当量”',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **NH₃ MFC 标定：体积法（皂膜量管）或压力降法（1 L 定容 + 薄膜规）。**
     *
     *   NH₃ MFC 1 台 + 水 1 kg → 流量记录 1 份
     *
     * 体积法：皂膜在玻璃量管里走，秒表记时间；Q = ΔV/Δt。
     * 压力降法：1 L 定容，MFC 充气，薄膜规读 dp/dt；Q = V·dp/dt / (R·T)。
     * 两条都用温度/压力修正；N₂ 传递只作粗校（±3 %），NH₃ 的粘度/密度不同。
     */
    id: 'measure/nh3-flow-calibration',
    name: 'NH₃ MFC 标定',
    produces: [
      {
        item: 'mat/nh3-flow-cal-record',
        qty: q(1),
        gives: [
          { param: 'flow', kind: 'range', min: 0, max: 200 },
          { param: 'flowRange', kind: 'range', min: 0, max: 200 },
          { param: 'accuracy', kind: 'range', min: 3, max: 5 },
          { param: 'gas', kind: 'enum', oneOf: ['NH3'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: [
      'plant/mfc-nh3',
      'plant/lpcvd-furnace/manometer',
      'plant/metrology-room',
      'std/counter-chip-general',
      'std/quartz-resonator-general',
    ],
    rate: { hours: q(2) },
    steps: [
      {
        note_zh:
          '① 体积法：皂膜量管（100 mL/1 L）+ 秒表；流量 20/50/100/200 sccm 四点，每点 3 次；Q = ΔV/Δt，温度/压力修正',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 压力降法：1 L 定容 + `plant/lpcvd-furnace/manometer`（0.1–1000 Pa、3–5 %）；Q = V·dp/dt/(R·T)。与体积法互证，差 >3 % 重标',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **洁净室等级：表面颗粒扫描 → ISO 5–7 资格记录。**
     *
     *   洁净室 1 间 → 等级记录 1 份
     *
     * 用 `plant/particle-counter` 的 193 nm 暗场扫描（0.09–0.10 µm、18 h/片）
     * 在 3 片陪片上数 ≥0.1 µm 颗粒，折成表面密度；再按 ISO 14644-1 的
     * ≥0.1 µm 限值给 5–7 的资格窗口。
     *
     * ⚠️ **只能到表面清洁度这一级**：ISO 14644-1 的等级是空气悬浮粒子
     * （每立方米），这台计数器是表面扫描，不是空气计数器；0.05 µm 也看不见
     * （0.09 µm 是它的交付窗口）。所以这条路线不能发“ISO 5 空气证书”。
     */
    id: 'measure/cleanroom-class',
    name: '洁净室等级测量',
    produces: [
      {
        item: 'mat/cleanroom-class-record',
        qty: q(1),
        gives: [
          { param: 'isoClass', kind: 'range', min: 5, max: 7 },
          { param: 'minParticle', kind: 'range', min: 0.09, max: 0.1 },
        ],
      },
    ],
    uses: [],
    needs: [
      {
        item: 'plant/clean-room',
        qty: q(1),
        need: [{ param: 'isoClass', kind: 'range', min: 5, max: 7 }],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
    ],
    rate: { hours: q(20) },
    steps: [
      {
        note_zh:
          '① 表面颗粒扫描：3 片陪片（洗前/洗后）进 particle-counter；193 nm 暗场、0.09–0.10 µm、18 h/片；数 ≥0.1 µm 颗粒，折成 个/cm²',
        performedBy: 'plant/particle-counter',
      },
      {
        note_zh:
          '② 给等级：按 ISO 14644-1 的 ≥0.1 µm 限值（ISO 5 = 1e5/m³、6 = 1e6、7 = 1e7）与表面密度对照，给 5–7 的资格窗口；**不是空气计数证书**',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '洁净室 1 间（进、出，不消耗）+ 陪片 3 片（进、出，不消耗）→ 等级记录 1 份；记录是数据不是物料。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...SI3N4_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...SI3N4_MEASURE_ROUTES];
