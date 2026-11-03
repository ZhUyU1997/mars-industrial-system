/**
 * 绝对重力与 ²⁸Si 密度 —— 两条绝对测量的记录层（⑫ + ⑪ 的下游）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、g 的 25 ppm 是从哪来的
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `data/machine/voltage-anchor.ts` 的可逆摆：
 *
 *   g = 4π²L/T²，L = 1.000000 m，T = 3.262 s（火星 3.71）
 *   1000 个周期 3 262 s，用 100 kHz **石英时基**计时（10 ppm）
 *   → 周期的 10 ppm → g 的 20 ppm
 *   摆长 1 ppm、振幅残差 0.06、浮力 2、刀口摩擦 5
 *   → 方和根 20.7 ppm，取 **25 ppm**
 *
 * 25 ppm 里 20 ppm 是时基。`data/machine/atomic-clock.ts` 的氢脉泽把时基
 * 换成 1×10⁻¹²（1 s），这一项从 20 ppm 降到 **0.002 ppm**；剩下的
 * 6–8 ppm 是摆本身的（长度、浮力、摩擦、振幅），换时基救不了。
 * 所以要把 g 做到 1–3 ppm，必须**换测量方法**，不是换钟：
 * 自由落体 + 激光干涉 + 脉泽打点，见 §二。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、自由落体：0.2 m、8.2×10⁵ 条条纹、0.33 s
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   z(t) = z₀ + v₀t + ½gt²
 *
 *   落高 h = 0.2 m（窗口 0.1–0.3）：
 *     t = √(2h/g) = √(0.4/3.71) = **0.328 s**
 *     v = gt = **1.22 m/s**
 *     488 nm 干涉条纹间距 λ/2 = 244 nm
 *     条纹数 = 0.2 / 244e-9 = **8.2×10⁵ 条**
 *     撞击时条纹率 = 2v/λ = 2×1.22/488e-9 = **5.0 MHz**
 *
 *   条纹过零时刻用 1.42 GHz 脉泽（周期 0.704 ns）打点：
 *   5 MHz 上 0.7 ns 是 0.0035 条 = 0.85 nm，对 0.2 m 是 0.004 ppm。
 *   拟合 8×10⁵ 个 (t, z) 点，随机项 <0.01 ppm。
 *
 * ── 2.1 不确定度预算（设计值，1σ，方和根）──────────────────────────────
 *
 *   项                                      设计值        对 g 的贡献
 *   ─────────────────────────────────────────────────────────────
 *   激光波长复现性（488 nm，1×10⁻⁶）        1 ppm         1 ppm
 *   地震/地面振动（无隔振台）                0.5 ppm       0.5 ppm
 *   重力梯度与有效高度（0.2 m，±1 cm）       0.2 ppm       0.2 ppm
 *   落管垂直度（1 mrad 装调，保守；水准 20 µm/m 只给 0.0002） 0.1 ppm 0.1 ppm
 *   释放重复性（1 µm 位置，z0/v0 拟合吸收）  0.05 ppm      0.05 ppm
 *   条纹插值（0.7 ns / 5 MHz）              0.004 ppm     0.004 ppm
 *   时基（1×10⁻¹²，0.33 s）                  0.000002 ppm  0.000002 ppm
 *   残气阻尼（1×10⁻⁴ Pa）                   0.01 ppm      0.01 ppm
 *   ─────────────────────────────────────────────────────────────
 *   方和根                                                **1.15 ppm**
 *
 *   交付窗口取 **1–3 ppm**（含装调、水准、首批未知项与 1.5 倍余量）。
 *   这与 `voltage-anchor.ts` 的 31 ppm 预算里 g 项 12.5 ppm 相比：
 *   **12.5 → 0.5–1.5 ppm**，整机 31 → 27–29 ppm。
 *
 * ── 2.2 为什么不用 GPS / 铯 ──────────────────────────────────────────────
 *
 *   GPS：火星没有卫星星座（用户原话"火星无卫星"），也没有地面测控；
 *   GPS 的 10–30 ns 授时（1–3×10⁻⁸）也进不了 1 ppm。详见
 *   `data/machine/atomic-clock.ts` §1.2。
 *   铯：`mat/cesium` 当时 0 条目，现在是一次性输入（`cs-sb.ts`，不可复制）；
 *   铯束/喷泉还要 852 nm 激光与 1 µK 冷却，本层都没有。Rb 同样 0 条目。
 *   唯一有本地可复制料的是 H（`mat/hydrogen`），
 *   所以钟选氢脉泽（`plant/hydrogen-maser`）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、²⁸Si 密度：阿基米德 + 干涉测径
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   10 g ²⁸Si 球（φ20.1914 mm，ρ = 2.32008 g/cm³）：
 *     空气里称 m_a = 10.0000 g（天平读 9.9948 g，加空气浮力 5.2 mg
 *     = 520 ppm 修正；空气密度用气压/温度/湿度算到 0.1 % ⇒ 残余 0.5 ppm）
 *     20.000 °C 超纯水里称 m_w = 5.6975 g（水浮力 4.3025 g）
 *     ρ_s = ρ_w · m_a / (m_a − m_w) = 0.998207 × 10/(10−5.6975)
 *         = **2.3201 g/cm³**
 *
 *   ⚠️ **空气浮力必须修正，不能当共模项。** 原始两次读数之差是
 *   (ρ_w − ρ_air)V（9.9948 − 5.6975 = 4.2973 g）；把 5.2 mg 空气浮力
 *   加回 m_a 之后才是 ρ_w V（4.3025 g）。不修正就是 ~0.07 %
 *   （700 ppm）的偏差。5.2 mg 本身是 520 ppm，修正后残余 0.5 ppm
 *   （空气密度 0.1 %）。
 *
 *   分项：
 *     水密度（0.998207 g/cm³ @20 °C，1–2 ppm）      1–2 ppm
 *     水温 20.000 ± 0.01 K（水密度温度系数 2×10⁻⁴/K） 2 ppm
 *     溶解气体（真空除气，0.1 ppm）                  0.1 ppm
 *     空气浮力修正残余（ρ_air 0.1 %）                 0.5 ppm
 *     天平（0.05 µg 分辨、0.1 µg 重复性）            0.1 ppm
 *     吊丝浮力/表面张力（0.1 ppm）                    0.1 ppm
 *     球的形状（0.2 µm，5 方向平均）                  2–3 ppm
 *     直径（10 nm / 20 mm）                           0.5 ppm
 *     ²⁸Si 同位素残余（99.9 % 档）                    <1 ppm
 *     ─────────────────────────────────────────────────────
 *     方和根                                          **3–10 ppm**
 *
 *   干涉测径是第二条腿：阿基米德给"质量/浮力"，干涉给"体积"，
 *   两条腿都指向 2.3201 才算闭环；只用阿基米德会被"球里有没有气泡/
 *   吊丝带水"骗过去。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、剩余缺口（带数字）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **没有独立 g 基准。** 本层唯一的另一个 g 是 `plant/gravity-pendulum`
 *      的 25 ppm；两条路线只能互检到 25 ppm，检不出 1–3 ppm 的共同偏差。
 *      要独立验证得进口一台 FG5 级绝对重力仪，或建第三套（干涉/摆/落体）。
 *   ② **激光波长 1 ppm 是主项。** `plant/stabilized-laser` 的
 *      reproducibility 1×10⁻⁶（600 MHz @488 nm）是"换模一次"的复现性，
 *      不是绝对波长；要 0.1 ppm 得碘稳频 633 nm He-Ne（要氦，`mat/helium`
 *      0 条）或 Rb 饱和吸收（要 Rb，0 条）。这一项不动，g 下不了 1 ppm。
 *   ③ **没有隔振台/地震仪。** 计量间只控 19–21 °C（`plant/metrology-room`
 *      的 holds 只有 temperature），没有隔振地基、没有振动计；0.5 ppm
 *      是按"混凝土墩 + 1 s 平均"估的，不是测的。火星地震（如果你把它
 *      当活）与风载（0.6 kPa、沙尘）都没有记录。
 *   ④ **没有潮汐/气压负荷模型。** 地球的绝对重力仪要改固体潮（~100 µGal
 *      = 100 ppb）、海潮、大气负荷；火星的 Phobos/Deimos 潮汐 <1 ppb，
 *      但大气压 0.6 kPa 的季节变化（±30 %）对重力的负荷没有模型。
 *      按 0.1 ppm 记，未量化。
 *   ⑤ **密度没有第二套方法。** 阿基米德 + 干涉是"同一套几何 + 同一台天平"；
 *      要交叉验证得再建比重瓶或悬浮法，或进口 1 ppm 的 ²⁸Si 球。
 *      当前 3–10 ppm 是"一套方法 + 分项预算"，不是两套互检。
 *   ⑥ **水密度溯源。** 0.998207 g/cm³ 是 ITS-90 水密度表的值，
 *      没有用本层的 100 pF 电容/量块做过密度原器；水里的同位素组成
 *      （D/H、¹⁸O/¹⁶O）与溶解空气各带 0.1–0.5 ppm，按 1–2 ppm 记。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、注册（本文件不改 tools/report/data.ts，由用户注册）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { G_ABSOLUTE_ITEMS, G_ABSOLUTE_ROUTES } from '../../data/measure/g-absolute.ts';
 *   items 数组加  ...G_ABSOLUTE_ITEMS,
 *   routes 数组加 ...G_ABSOLUTE_ROUTES,
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const G_ABSOLUTE_ITEMS: readonly Item[] = [
  /**
   * 质量互检记录：10 g 自然硅球（几何 x 密度给的约定质量）与 1 g/10 g 砝码比对。
   * 判据是差值是否落在合成不确定度内；它只查砝码，不给绝对质量。
   */
  {
    id: 'mat/mass-intercomparison-record',
    name: 'Mass Intercomparison Record', name_zh: '质量互检记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'massDiff', kind: 'range', min: 0, max: 1, unit: 'mg', dir: 'atMost' },
      { param: 'uDiff', kind: 'range', min: 0.05, max: 0.2, unit: 'mg', dir: 'atMost' },
      { param: 'spheres', kind: 'range', min: 1, max: 1, unit: '只' },
      { param: 'verdict', kind: 'enum', values: ['consistent', 'inconsistent'] },
    ],
  },  /**
   * **本地 g 记录：g = 3.7100 m/s²，不确定度 1–3 ppm，锚 = 长度/时间。**
   *
   * 一份记录对应一次完整的落体测量（200–500 次落体、8 h）。它记录：
   *
   *   gravity       3.70999–3.71001 m/s²（本层站点值；不是书本 3.71）
   *   uncertainty   1–3 ppm（方和根，见文件头 §2.1）
   *   dropHeight    0.15–0.25 m（实际落高，激光干涉量）
   *   drops         200–500 次（拟合用的独立落体数）
   *   anchor        length-mass-time —— 这条记录不再靠石英时基
   *
   * 为什么 g 要本地测：火星不同纬度/高程的 g 差 0.1 %（1 000 ppm），
   * 拿书本 3.71 去算电压天平，1 000 ppm 的 g 误差就是 500 ppm 的 V 误差。
   * 本记录把 g 钉到 1–3 ppm，电压天平的 g 项从 12.5 ppm 降到 0.5–1.5 ppm。
   */
  {
    id: 'mat/local-g-record',
    name: 'Local g Record', name_zh: '本地 g记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'gravity', kind: 'range', min: 3.6, max: 3.8, unit: 'm/s²' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 5, unit: 'ppm', dir: 'atMost' },
      { param: 'dropHeight', kind: 'range', min: 0.1, max: 0.3, unit: 'm' },
      { param: 'drops', kind: 'range', min: 100, max: 1000, unit: '次' },
      { param: 'anchor', kind: 'enum', values: ['length-mass-time'] },
    ],
  },

  /**
   * **²⁸Si 密度记录：ρ = 2.3201 g/cm³（25 °C），不确定度 3–10 ppm。**
   *
   * 一份记录对应一只球（或一批同料球）的密度证书。它记录：
   *
   *   density       2.3200–2.3202 g/cm³（99.9–99.95 % ²⁸Si 的料）
   *   uncertainty   3–10 ppm（方和根，见文件头 §三）
   *   temperature   19.99–20.01 °C（水浴 20.000 °C）
   *
   * 它不写 `enrichment`：富集度是 `mat/silicon-28-enriched` 与
   * `std/si-28-sphere` 的属性，密度记录只管密度。富集度对密度的影响
   * <1 ppm（99.9→99.95 %），已算进 3–10 ppm 的预算，不单列。
   */
  {
    id: 'mat/si-28-density-record',
    name: '²⁸Si Density Record', name_zh: '²⁸Si 密度记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'density', kind: 'range', min: 2.31, max: 2.33, unit: 'g/cm³' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 10, unit: 'ppm', dir: 'atMost' },
      // 生产 give 同名别名；与 uncertainty 同窗，便于挂到 densityUncertainty give。
      { param: 'densityUncertainty', kind: 'range', min: 0, max: 10, unit: 'ppm', dir: 'atMost' },
      { param: 'temperature', kind: 'range', min: 19, max: 21, unit: '°C' },
    ],
  },
];

export const G_ABSOLUTE_ROUTES: readonly Route[] = [
  {
    /**
     * **质量互检：硅球 vs 砝码。**
     *
     * 硅球的约定质量来自密度记录（2.3201 g/cm³）与干涉测径，砝码的标称值来自
     * 10 g 标准；两者在同一台微天平上做替代称量，差值 = 砝码误差。
     * |Δm| ≤ 2·uDiff 判 consistent。它只查砝码，不把砝码升格为原级。
     */
    id: 'measure/mass-intercomparison',
    name: 'Mass Intercomparison Measurement', name_zh: '质量互检测量',
    rate: { hours: q(8) },
    produces: [{
      item: 'mat/mass-intercomparison-record',
      qty: q(1),
      gives: [
        { param: 'massDiff', kind: 'range', min: 0, max: 0.5 },
        { param: 'uDiff', kind: 'range', min: 0.05, max: 0.2 },
        { param: 'spheres', kind: 'range', min: 1, max: 1 },
        { param: 'verdict', kind: 'enum', oneOf: ['consistent', 'inconsistent'] },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'std/si-28-sphere', qty: q(1) }] },
      { anyOf: [{ item: 'std/mass-weight-set-mg', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '替代称量：砝码与硅球交替放同一盘位，各 3 次，读微天平', performedBy: 'plant/micro-balance', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '空气浮力修正：两只体积不同，按气压/温度/湿度算到 0.1 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '算差值；|Δm| ≤ 2·uDiff 判 consistent，否则 inconsistent', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '硅球 1 + 砝码 1 套 → 记录 1 份；两者都不消耗',
  },  {
    /**
     * **本地 g：自由落体 + 激光干涉 + 脉泽时基 → 1–3 ppm。**
     *
     *   无 kg 投入 → 记录 1 份
     *
     * 五步（8 h）：
     *   ① 装调与水准：仪器放在混凝土墩上，铅垂线 + 水准 20 µm/m；
     *      计量间 19–21 °C，等温 2 h。
     *   ② 抽真空：落管到 1×10⁻⁴ Pa（`plant/euv-vacuum`），残气阻尼
     *      按 0.01 ppm 记。
     *   ③ 自由落体 + 干涉：488 nm 激光、角锥棱镜、光电二极管；
     *      0.2 m 落体 0.328 s、8.2×10⁵ 条条纹、条纹率 5 MHz。
     *   ④ 时基打点：脉泽 10 MHz → 1.42 GHz，条纹过零记到 1.4 ns。
     *   ⑤ 拟合与写记录：z(t) = z₀ + v₀t + ½gt²，200–500 次落体；
     *      扣掉梯度/高度、垂直度、残气；写 g、不确定度、落高、落次、
     *      anchor = length-mass-time。
     *
     * ⚠️ 1–3 ppm 是设计值（Earth 工程值）；实测的 1 ppm 主项是激光
     * 波长复现性，本层没有碘稳频（见文件头 §四②）。记录里的
     * `anchor = length-mass-time` 是"不再靠石英时基"的数据形式，
     * 不是"已经溯到 SI"。
     */
    id: 'measure/local-g',
    name: 'Local g Measurement', name_zh: '本地 g 测量',
    rate: { hours: q(8) },
    produces: [
      {
        item: 'mat/local-g-record',
        qty: q(1),
        gives: [
          { param: 'gravity', kind: 'range', min: 3.70999, max: 3.71001 },
          { param: 'uncertainty', kind: 'range', min: 1, max: 3 },
          { param: 'dropHeight', kind: 'range', min: 0.15, max: 0.25 },
          { param: 'drops', kind: 'range', min: 200, max: 500 },
          { param: 'anchor', kind: 'enum', oneOf: ['length-mass-time'] },
        ],
      },
    ],
    uses: [],
    needs: [
      {
        item: 'plant/absolute-gravimeter',
        qty: q(1),
        need: [
          { param: 'uncertainty', kind: 'range', min: 1, max: 3 },
          { param: 'dropHeight', kind: 'range', min: 0.15, max: 0.25 },
          { param: 'drops', kind: 'range', min: 200, max: 500 },
        ],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
      'plant/euv-vacuum',
    ],
    steps: [
      {
        note_zh: '① 装调与水准：混凝土墩上找平（水准 20 µm/m），铅垂线对中；计量间 19–21 °C 等温 2 h',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '② 抽真空：落管到 1×10⁻⁴ Pa（euv-vacuum），残气阻尼按 0.01 ppm 记',
        performedBy: 'plant/absolute-gravimeter',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-4 }],
      },
      {
        note_zh: '③ 自由落体 + 干涉：488 nm、角锥棱镜、光电二极管；0.2 m 落体 0.328 s、8.2×10⁵ 条条纹、5 MHz 条纹率',
        performedBy: 'plant/absolute-gravimeter',
        under: [{ param: 'temperature', min: 19, max: 21 }, { param: 'pressure', min: 1e-6, max: 1e-4 }],
      },
      {
        note_zh: '④ 时基打点：脉泽 10 MHz → 1.42 GHz，条纹过零时刻记到 1.4 ns（0.0035 条 = 0.85 nm）',
        performedBy: 'plant/hydrogen-maser',
      },
      {
        note_zh: '⑤ 拟合与写记录：z(t) = z₀ + v₀t + ½gt²，200–500 次落体；扣梯度/高度、垂直度、残气；写 g、1–3 ppm、落高、落次、anchor = length-mass-time',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '重力仪 1 台（进、出，不消耗）+ 脉泽/真空/计量间（进、出，不占用）→ 记录 1 份；产物按份计，不进 kg 守恒。g = 3.7100 m/s²、1–3 ppm、落高 0.15–0.25 m、200–500 次是设计值（Earth 工程值）；1 ppm 主项是激光波长复现性，实测缺口见文件头 §四②',
  },

  {
    /**
     * **²⁸Si 密度：阿基米德 + 干涉测径 → 3–10 ppm。**
     *
     *   ²⁸Si 球 1 件 + 超纯水 5 kg → 记录 1 份
     *
     * 四步（6 h）：
     *   ① 空气称量：`plant/micro-balance` 称 10 g 球，0.05 µg 分辨；
     *      空气浮力 5.2 mg（520 ppm）必须修正；空气密度用气压/温度/湿度
     *      算到 0.1 %，修正后残余 0.5 ppm。
     *   ② 水中称量：`plant/density-bench`，20.000 °C 超纯水，
     *      球从空气放进水里不碰壁、不带气泡；表观质量 5.6975 g。
     *   ③ 测径：`plant/laser-stage` 5 方向 × 3 角度，10 nm 读数；
     *      折射率用 `plant/refractometer` 修正（20 mm 上 2.5 ppm）。
     *   ④ 算密度与写记录：ρ_s = ρ_w·m_a/(m_a−m_w)；两条腿（阿基米德
     *      体积与干涉体积）差 >5 ppm 就重测；写密度、3–10 ppm、20.000 °C。
     *
     * ⚠️ 水密度 0.998207 g/cm³ 是 ITS-90 表值，没有本层密度原器；
     * 水温 0.01 K 是密度台的能力（设计值），不是计量间的 19–21 °C。
     * 3–10 ppm 是设计值 + 分项预算，不是两套方法互检（见 §四⑤）。
     */
    id: 'measure/si-28-density',
    name: '²⁸Si Density Measurement', name_zh: '²⁸Si 密度测量',
    rate: { hours: q(6) },
    produces: [
      {
        item: 'mat/si-28-density-record',
        qty: q(1),
        gives: [
          { param: 'density', kind: 'range', min: 2.3200, max: 2.3202 },
          { param: 'uncertainty', kind: 'range', min: 3, max: 10 },
          { param: 'densityUncertainty', kind: 'range', min: 3, max: 10 },
          { param: 'temperature', kind: 'range', min: 19.99, max: 20.01 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/si-28-sphere', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room', 'plant/refractometer', 'plant/temperature-standard'],
    steps: [
      {
        note_zh: '① 空气称量：微天平称 10 g ²⁸Si 球，0.05 µg 分辨；空气浮力 5.2 mg（520 ppm）必须修正，ρ_air 算到 0.1 % ⇒ 残余 0.5 ppm',
        performedBy: 'plant/micro-balance',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '② 水中称量：密度台 20.000 °C 超纯水，球从空气放进水里不碰壁、不带气泡；表观质量 5.6975 g',
        performedBy: 'plant/density-bench',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '③ 测径：激光台 5 方向 × 3 角度，10 nm 读数；折射率用 refractometer 修正（20 mm 上 2.5 ppm）',
        performedBy: 'plant/laser-stage',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '④ 算密度与写记录：ρ_s = ρ_w·m_a/(m_a−m_w)；阿基米德体积与干涉体积差 >5 ppm 就重测；写密度、3–10 ppm、20.000 °C',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '²⁸Si 球 1 件 + 超纯水 5 kg → 记录 1 份；水循环使用，按 5 kg 补液记。产物按份计，不进 kg 守恒。密度 2.3200–2.3202 g/cm³、3–10 ppm、20.000 °C 是设计值（Earth 工程值）；水密度溯源与第二套方法见文件头 §四⑤⑥',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...G_ABSOLUTE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...G_ABSOLUTE_ROUTES];
