/**
 * 两件本地能造的标准件：UHF 标准衰减器、角度原器。
 *
 * ⚠️ **补的是审计 B2 的“缺更高一级标准”**（13 条里最便宜、且不需要新设备的两条）：
 *
 *   `std/attenuator-standard`  DC–3 GHz、1/3/10/20 dB、±0.05–0.2 dB、回波 >25 dB
 *   `std/angle-standard`       24 面棱镜、面间角 15°±0.5″
 *
 * 两件都用**已有的东西**自校：
 *   衰减器 ← `std/vna-3ghz`（替代法）+ `plant/lcr-resistance-arm`（4 线选阻）
 *   角度原器 ← `plant/goniometer-theta2theta` 的自准直光管（24 面闭合 360°）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、衰减器的账
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   π 型网络（50 Ω）：1 dB → R1=2.6 Ω/R2=433 Ω；3 dB → 8.5/141；10 dB → 25.97/35.1；
 *   20 dB → 40.9/10.1（串臂 R1、并臂 R2）。电阻用 `std/chip-resistor-general`（0.01–0.1 %）
 *   选配到 0.05 %（4 线，`plant/lcr-resistance-arm` 的 1 Ω–10 kΩ 档 0.05–0.2 %）。
 *
 *   不确定度：电阻 0.05 % ⇒ 衰减 0.01–0.05 dB；VNA 替代法（直通-衰减-直通）
 *   0.02–0.1 dB；接头失配 0.02–0.05 dB ⇒ **合成 0.05–0.15 dB**（对 1 dB 档是 5–15 %，
 *   对 20 dB 档是 0.25–0.75 %）。
 *   回波：>25 dB 靠接头与基片的 50 Ω 连续性；3 GHz 处 λ/4 = 25 mm，壳体 <10 mm 才不谐振。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、角度原器的账
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   24 面棱镜：面间角 15°，闭合条件 Σ(24 个面间角) = 360°。
 *   自准直光管（`plant/goniometer-theta2theta` 的附件）分辨率 0.1–0.5″；
 *   每面测 3 次、正反两方向，闭合差按 24 面平均分配 ⇒ 单面角 **±0.5–1.5″**。
 *   石英（`mat/quartz-pure`）热膨胀 0.5 ppm/K，20±1 °C 下 100 mm 的面长变 0.05 µm，
 *   角度影响 <0.1″ ⇒ 温度不是瓶颈。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① 没有 SMA/3.5 mm 接头条目：同轴接头用铜针 + PTFE 介质**现场车制**，
 *     回波只保 25–30 dB（成品接头能到 30–35 dB），差 5 dB。
 *  ② 没有激光调阻机：电阻靠**选配**（0.05 %），做不到 0.01 %；衰减 1 dB 档因此只能 0.1 dB。
 *  ③ 角度原器没有角度原器上级：自校闭合只能消“分度误差的公共项”，
 *     绝对角度靠 24×15°=360° 的闭合假设，残差 0.5–1.5″ 是这套方法的极限。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { STD_ITEMS, STD_ROUTES } from '../../data/machine/standards.ts';
 *   items: [...STD_ITEMS] · routes: [...STD_ROUTES]
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const STD_ITEMS: readonly Item[] = [
  /**
   * **UHF 标准衰减器：DC–3 GHz、1/3/10/20 dB 四档、±0.05–0.15 dB、回波 >25 dB。**
   *
   *   bandwidth    0–3 GHz
   *   attenuation  1/3/10/20 dB（π 型网络，50 Ω）
   *   accuracy     0.05–0.15 dB
   *   returnLoss   26–40 dB
   *   power        0.5–1.5 W
   */
  {
    id: 'std/attenuator-standard',
    name: 'UHF 标准衰减器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'bandwidth', kind: 'range', min: 0, max: 3, unit: 'GHz', dir: 'atLeast' },
      { param: 'attenuation', kind: 'enum', values: ['1', '3', '10', '20'] },
      { param: 'accuracy', kind: 'range', min: 0.05, max: 0.2, unit: 'dB', dir: 'atMost' },
      { param: 'returnLoss', kind: 'range', min: 25, max: 50, unit: 'dB', dir: 'atLeast' },
      { param: 'power', kind: 'range', min: 0.1, max: 2, unit: 'W' },
    ],
  },

  /**
   * **角度原器：24 面棱镜，面间角 15°±0.5–1″（读数升级为精密自准直仪后成立）。**
   *
   *   facets      24
   *   faceAngle   15°
   *   angleError  0.5–1″（24 面闭合 360° 自校后的单面残差）
   *   flatness    0.2–0.6 µm
   *
   * ⚠️ **两段更正**：
   *   ① 早先写 0.5–1.5″ 时，本层唯一的角度读数 `plant/goniometer-theta2theta` 是
   *      0.01° 步进（36″）、0.02–0.05° 精度（72–180″）—— 24 面闭合消不掉量化与齿盘周期
   *      误差，单面只能到 5–20″，所以那一版曾降为 8–15″；
   *   ② 本版造了 `std/autocollimator-precision`（0.005–0.01″ 分辨、0.02–0.1″ 精度），
   *      读数设备升级后，24 面闭合的残差回到 **0.5–1″**；要 0.2″ 还需面形 0.05 µm（现在
   *      0.2–0.6 µm，是下一档的瓶颈）。
   */
  {
    id: 'std/angle-standard',
    name: '角度原器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'facets', kind: 'range', min: 24, max: 24, unit: '面' },
      { param: 'faceAngle', kind: 'range', min: 15, max: 15, unit: '°' },
      { param: 'angleError', kind: 'range', min: 0.5, max: 2, unit: '″', dir: 'atMost' },
      { param: 'flatness', kind: 'range', min: 0.1, max: 1, unit: 'µm' },
    ],
  },

  /**
   * **高等级套刻标准片（U 0.05–0.08 nm）：0/2/5/10 nm 四组 box-in-box，三法定值。**
   *
   *   offset      0–10 nm（四组 0/2/5/10）
   *   uncertainty 0.05–0.08 nm（U，k=2）
   *   pitch       1–10 µm
   *
   * 三法定值：e-beam 写（同一 100 µm 场内，拼场误差 <0.02 nm）+ CD-SEM 复读边
   * （1.5 nm 绝对准确度共模抵消，只留 0.04–0.06）+ AFM 台阶（z 向 0.1 nm 标准，
   * 消 CD-SEM 的 z 增益误差）⇒ RSS 0.05–0.08 nm。
   */
  {
    id: 'std/overlay-standard-005',
    name: '高等级套刻标准片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'offset', kind: 'range', min: 0, max: 10, unit: 'nm' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 0.1, unit: 'nm', dir: 'atMost' },
      { param: 'pitch', kind: 'range', min: 1, max: 10, unit: 'µm' },
    ],
  },

  /**
   * **1 pF 传递标准（U 0.2–0.3 %）：保护环空气电容 + 100 pF 两级 10:1 传递。**
   *
   *   capacitance      1 pF（几何初值：A=113 cm²、d=1 mm）
   *   uncertainty      0.2–0.3 %
   *   tempCoefficient  8–15 ppm/K
   *   voltage          200–300 V
   */
  {
    id: 'std/capacitance-standard-1pf',
    name: '1 pF 传递标准',
    unit: '件',
    category: 'part',
    props: [
      { param: 'capacitance', kind: 'range', min: 1, max: 1, unit: 'pF' },
      { param: 'uncertainty', kind: 'range', min: 0.1, max: 0.5, unit: '%', dir: 'atMost' },
      { param: 'tempCoefficient', kind: 'range', min: 2, max: 30, unit: 'ppm/K', dir: 'atMost' },
      { param: 'voltage', kind: 'range', min: 100, max: 500, unit: 'V' },
    ],
  },

  /**
   * **1 m 直线度原器（0.3–0.5 µm/m，U 0.2 µm/m）：石英棒 + 三点支撑 + 翻转自校。**
   *
   *   length      1 m
   *   straightness 0.3–0.5 µm/m（证书值）
   *   uncertainty  0.15–0.2 µm/m
   *   material     quartz-pure（0.5 ppm/K；温度 0.1 K 时 1 m 只变 0.05 µm/m）
   */
  {
    id: 'std/straightness-standard-1m',
    name: '1 m 直线度原器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'length', kind: 'range', min: 1, max: 1, unit: 'm' },
      { param: 'straightness', kind: 'range', min: 0, max: 2, unit: 'µm/m', dir: 'atMost' },
      { param: 'uncertainty', kind: 'range', min: 0.05, max: 0.3, unit: 'µm/m', dir: 'atMost' },
      { param: 'material', kind: 'enum', values: ['quartz-pure', 'steel-45'] },
    ],
  },

  /**
   * **Ar 填充空心阴极灯：用 Ar I 866.79 / 912.30 nm 夹住 870 区。**
   *
   *   envelopeDiameter 25–40 mm
   *   fillPressure     200–800 Pa（Ar）
   *   ignitionVoltage  200–400 V
   *   current          5–20 mA
   *   life             500–2000 h
   *   cathode          Fe 或 Ni 杯
   *   lines            866.79 / 912.30 nm（Ar I；两条都是已知到 0.001 nm 的谱线）
   *
   * ⚠️ 为什么不用 Ne：`mat/neon` **0 条目**（Ne 只能从空气分离，空气里 18 ppm，本层没有
   * 稀有气体精馏塔的 Ne 侧线）。Ar 有（`mat/argon` 从空气分离就有），且 Ar I 的两条强线
   * 正好把 870 夹在中间：866.79（下）与 912.30（上），跨度 45.51 nm。
   * 两条线的波长是原子常数（0.001 nm 级），所以真正的误差是**谱仪读数 + 内插几何**，
   * 不是谱线本身 —— 这正是 `measure/oes-wavelength-hcl` 的账。
   */
  {
    id: 'std/hollow-cathode-ar',
    name: 'Ar 填充空心阴极灯',
    unit: '件',
    category: 'part',
    props: [
      { param: 'envelopeDiameter', kind: 'range', min: 25, max: 40, unit: 'mm' },
      { param: 'fillPressure', kind: 'range', min: 200, max: 800, unit: 'Pa' },
      { param: 'ignitionVoltage', kind: 'range', min: 200, max: 400, unit: 'V' },
      { param: 'current', kind: 'range', min: 5, max: 20, unit: 'mA' },
      { param: 'life', kind: 'range', min: 500, max: 2000, unit: 'h', dir: 'atLeast' },
      { param: 'cathode', kind: 'enum', values: ['Fe', 'Ni'] },
      { param: 'lines', kind: 'enum', values: ['866.79', '912.30'] },
      // 灯线宽/仪器分辨率资格带，不是单次读数；记录见 mat/hcl-linewidth-record。
      { param: 'linewidth866', kind: 'range', min: 0.01, max: 0.5, unit: 'nm' },
      { param: 'linewidth912', kind: 'range', min: 0.01, max: 0.5, unit: 'nm' },
      { param: 'instrumentResolution', kind: 'range', min: 0.005, max: 0.2, unit: 'nm' },
    ],
  },

  /**
   * **精密电子自准直仪：f=200–400 mm、CCD 2048²、像素 5 µm、0.005–0.01″ 分辨。**
   *
   *   focalLength       200–400 mm
   *   aperture          40–80 mm
   *   pixels            4 MP（2048×2048）
   *   pixelPitch        5 µm
   *   angularResolution 0.005–0.01″（双程 + 亚像素质心 1/100–1/300 px）
   *   accuracy          0.02–0.1″
   *   range             ±300″
   *   thermalStability  0.02–0.05 K
   *
   * 分辨账：θ_px = p/(2f)（双程）；p=5 µm、f=300 mm ⇒ 1.72″/px；
   * 质心拟合到 1/100–1/300 px ⇒ **0.006–0.017″** ⇒ 取 0.005–0.01″ 是上限档。
   * 精度 0.02–0.1″ 由分划板刻线误差 + 温漂（0.02 K 下 300 mm 铝壳变 0.14 µm ⇒ 0.1″）定。
   */
  {
    id: 'std/autocollimator-precision',
    name: '精密电子自准直仪',
    unit: '件',
    category: 'part',
    props: [
      { param: 'focalLength', kind: 'range', min: 200, max: 400, unit: 'mm' },
      { param: 'aperture', kind: 'range', min: 40, max: 80, unit: 'mm' },
      { param: 'pixels', kind: 'range', min: 4, max: 5, unit: 'MP' },
      { param: 'pixelPitch', kind: 'range', min: 5, max: 5, unit: 'µm' },
      { param: 'angularResolution', kind: 'range', min: 0.005, max: 0.02, unit: '″', dir: 'atMost' },
      { param: 'accuracy', kind: 'range', min: 0.02, max: 0.1, unit: '″', dir: 'atMost' },
      { param: 'range', kind: 'range', min: 300, max: 300, unit: '″' },
      { param: 'thermalStability', kind: 'range', min: 0.02, max: 0.05, unit: 'K', dir: 'atMost' },
    ],
  },

  /**
   * **1 pC 电荷标准：Q = C·V（100 pF 标准 × 10 mV），U 0.2–0.5 %。**
   *
   *   charge      1 pC
   *   uncertainty 0.2–0.5 %（主项：100 pF 的 0.1–0.5 %；V 的 1–2 ppm 只占零头）
   *   riseTime    20–60 ns
   *   repetition  10–50 Hz
   *   capacitance 100 pF（`plant/hv-test-bench/standard-capacitor-local`）
   *
   * 账：100 pF × 10 mV = 1.00 pC；10 mV 由齐纳 10 V 经 Hamon 100:1 + 10:1 分压
   * （V 的不确定度 3.5–10 ppm × 分压 0.1–0.3 % ⇒ 10 mV 的 U 1–2 ppm × 1000 ≈ 0.1–0.3 %）。
   * 合成 0.2–0.5 % —— 相比现有检测器 U@1 pC = **132 %**，好 **260–660 倍**。
   */
  {
    id: 'std/charge-standard-1pc',
    name: '1 pC 电荷标准',
    unit: '件',
    category: 'part',
    props: [
      { param: 'charge', kind: 'range', min: 1, max: 1, unit: 'pC' },
      { param: 'uncertainty', kind: 'range', min: 0.1, max: 0.5, unit: '%', dir: 'atMost' },
      { param: 'riseTime', kind: 'range', min: 10, max: 100, unit: 'ns' },
      { param: 'repetition', kind: 'range', min: 1, max: 100, unit: 'Hz' },
      { param: 'capacitance', kind: 'range', min: 100, max: 100, unit: 'pF' },
    ],
  },

  /**
   * **²⁸Si 工作标样（不是认证标样）：天然 Si 与富集 ²⁸Si 重量法配四个工作点。**
   *
   *   enrichment 60–99 %（60/75/90/99 四点）
   *   uncertainty 0.3–0.8 %（配比 0.1 % + HR-ICP-MS 比值 0.3–0.5 %）
   *   form       solution（2 % 亚沸硝酸）
   *   si28       60–99 %
   *
   * ⚠️ 只能压**精度/线性**（10–20× → 3–5×），压不了**绝对偏差**：工作标样的富集度
   * 本身是用同一台 HR-ICP-MS 定的（自指），认证标样才断得开这条环。
   */
  {
    id: 'std/si-isotope-working-standard',
    name: '²⁸Si 工作标样',
    unit: '件',
    category: 'part',
    props: [
      { param: 'enrichment', kind: 'range', min: 50, max: 99.9, unit: '%' },
      { param: 'uncertainty', kind: 'range', min: 0.1, max: 1.5, unit: '%', dir: 'atMost' },
      { param: 'form', kind: 'enum', values: ['solution'] },
      { param: 'si28', kind: 'range', min: 50, max: 99.9, unit: '%' },
    ],
  },
];

export const STD_ROUTES: readonly Route[] = [
  {
    /**
     * **衰减器：电阻选配 → 贴装 → 装壳 → VNA 自校。**
     *
     *   片阻 6 + 氧化铝基片 1 + 金 0.1 g + 铜 1 g + 酚醛 0.01 kg → 衰减器 1 件
     */
    id: 'make/attenuator-standard',
    name: 'UHF 标准衰减器制造',
    produces: [
      {
        item: 'std/attenuator-standard',
        qty: q(1),
        gives: [
          { param: 'bandwidth', kind: 'range', min: 0, max: 3 },
          { param: 'attenuation', kind: 'enum', oneOf: ['1', '3', '10', '20'] },
          { param: 'accuracy', kind: 'range', min: 0.05, max: 0.15 },
          { param: 'returnLoss', kind: 'range', min: 26, max: 40 },
          { param: 'power', kind: 'range', min: 0.5, max: 1.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/chip-resistor-general', qty: q(6) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 100) }] },
    ],
    needs: ['std/vna-3ghz', 'plant/lcr-resistance-arm', 'plant/metrology-room'],
    steps: [
      {
        note_zh: '① π 型网络选配：1/3/10/20 dB 各一组 R1/R2，4 线测到 0.05 %（`plant/lcr-resistance-arm` 的 1 Ω–10 kΩ 档）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '② 贴装与键合：薄膜片阻贴 Al₂O₃ 基片、金带键合；50 Ω 线宽按基片 εr 算（1–2 mm）',
        performedBy: 'plant/probe-station',
      },
      {
        note_zh: '③ 装壳与接头：铜针 + PTFE 介质现场车制同轴接头，壳体 <10 mm（3 GHz 不谐振）',
        performedBy: 'lathe',
      },
      {
        note_zh: '④ VNA 自校：`std/vna-3ghz` DC–3 GHz，替代法（直通-衰减-直通），±0.05–0.15 dB；回波 26–40 dB',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '⑤ 功率与温漂：0.5–1.5 W 下复测，20–30 °C 漂 <0.02 dB；写证书（档位、频点、U）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '片阻 6 + 基片 1 + 金 0.1 g + 铜 1 g + 酚醛 0.01 kg → 衰减器 1 件；余是选配淘汰的电阻与车屑（按件计）',
  },

  {
    /**
     * **角度原器：切 24 面 → 精磨 → 抛光 → 自准直闭合标定。**
     *
     *   石英 0.5 kg + 氧化铝 0.05 kg + 氧化铈 0.01 kg → 24 面棱镜 1 件
     */
    id: 'make/angle-standard',
    name: '角度原器制造',
    produces: [
      {
        item: 'std/angle-standard',
        qty: q(1),
        gives: [
          { param: 'facets', kind: 'range', min: 24, max: 24 },
          { param: 'faceAngle', kind: 'range', min: 15, max: 15 },
          { param: 'angleError', kind: 'range', min: 0.5, max: 1 },
          { param: 'flatness', kind: 'range', min: 0.2, max: 0.6 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/cerium-oxide', qty: q(1, 100) }] },
    ],
    needs: ['plant/goniometer-theta2theta', 'std/autocollimator-precision', 'plant/metrology-room'],
    steps: [
      { note_zh: '① 切 24 面粗坯：15° 分度，留 0.2 mm 余量（`plant/grinder`）', performedBy: 'plant/grinder' },
      { note_zh: '② 精磨：氧化铝 W10–W20，面形到 1–2 µm', performedBy: 'plant/grinder' },
      { note_zh: '③ 抛光：氧化铈抛光液 + 沥青盘（自制），面形 0.2–0.6 µm', performedBy: 'plant/grinder' },
      {
        note_zh: '④ 自准直标定：`std/autocollimator-precision`（0.005–0.01″ 分辨、0.02–0.1″ 精度）每面 3 次、正反两向；24 面闭合 Σ=360°，闭合差按 24 面平均分配',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '⑤ 修研到 ±0.5–1″（读数已换 `std/autocollimator-precision`；测角仪 36″ 只作粗定位），写证书（面间角、闭合残差、U）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(80) },
    unbalanced_zh: '石英 0.5 + 氧化铝 0.05 + 氧化铈 0.01 → 棱镜 1 件；余是磨削量与抛光渣（按件计）',
  },

  {
    /**
     * **高等级套刻片：e-beam 写 → CD-SEM 复读 → AFM 台阶 → 三法合账。**
     *
     *   套刻片 1 + 0.1 nm 台阶标准 1 + 硅片 1 → 高等级套刻片 1
     */
    id: 'make/overlay-standard-005',
    name: '高等级套刻标准片制造',
    produces: [
      {
        item: 'std/overlay-standard-005',
        qty: q(1),
        gives: [
          { param: 'offset', kind: 'range', min: 0, max: 10 },
          { param: 'uncertainty', kind: 'range', min: 0.05, max: 0.08 },
          { param: 'pitch', kind: 'range', min: 2, max: 8 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/overlay-standard', qty: q(1) }] },
      { anyOf: [{ item: 'std/step-standard-0.1nm', qty: q(1) }] },
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① e-beam 写 0/2/5/10 nm 四组 box-in-box：束斑 4 nm、剂量 0.5–2 µC/cm²，四组写在同一 100 µm 场内（拼场误差 <0.02 nm）', performedBy: 'plant/e-beam-column' },
      { note_zh: '② CD-SEM 复读边：4 nm 束斑、10 点/组；两组 box 同场 ⇒ 1.5 nm 绝对准确度共模抵消，边缘判定 0.04–0.06 nm', performedBy: 'plant/cd-sem', under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }] },
      { note_zh: '③ AFM 台阶：0.1 nm 台阶标准先校 z 增益（0.02–0.04），再测四组台阶高', performedBy: 'plant/afm' },
      { note_zh: '④ 三法合账：uStandard = RSS(0.03–0.05, 0.04–0.06, 0.02–0.04) = 0.05–0.08 nm；与两法差 >0.03 nm 重写', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(40) },
    unbalanced_zh: '套刻片 1 + 台阶标准 1 + 硅片 1 → 高等级套刻片 1（按片计）',
  },

  {
    /**
     * **1 pF 标准：车保护环电极 → 石英垫片定 1 mm → 两级 10:1 传递 → 温漂。**
     *
     *   铜 0.2 kg + 氧化铝 2 + 石英 0.01 kg + 金 0.1 g → 1 pF 标准 1 件
     */
    id: 'make/capacitance-standard-1pf',
    name: '1 pF 传递标准制造',
    produces: [
      {
        item: 'std/capacitance-standard-1pf',
        qty: q(1),
        gives: [
          { param: 'capacitance', kind: 'range', min: 1, max: 1 },
          { param: 'uncertainty', kind: 'range', min: 0.2, max: 0.3 },
          { param: 'tempCoefficient', kind: 'range', min: 8, max: 15 },
          { param: 'voltage', kind: 'range', min: 200, max: 300 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 10000) }] },
    ],
    needs: ['plant/lcr-guard-fixture', 'plant/hv-test-bench/standard-capacitor-local', 'plant/metrology-room'],
    steps: [
      { note_zh: '① 车保护环电极与屏蔽壳：φ120 mm 圆盘、间隙 1 mm（C = ε₀A/d ⇒ A=113 cm²、1 pF）', performedBy: 'lathe' },
      { note_zh: '② 装石英垫片定间隙、金镀电极（0.5 µm），保护环与高压端分开', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 几何法初值：A、d 各测 5 点（0.05 %），算 1.000 pF ± 0.2 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 两级 10:1 传递：100 pF 标准 → 10 pF 中间件 → 1 pF；`plant/lcr-guard-fixture` 残散 0.005–0.01 pF（1 pF 上 0.5–1 %）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '⑤ 温漂与电压系数：20–30 °C、100–300 V 复测，TC 8–15 ppm/K；写证书', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(30) },
    unbalanced_zh: '铜 0.2 + 氧化铝 2 + 石英 0.01 + 金 0.1 g → 1 pF 标准 1 件；余是车屑与镀层损耗（按件计）',
  },

  {
    /**
     * **1 m 直线度原器：石英棒研磨 → 三点支撑 → 激光+翻转自校 → 温度系数。**
     *
     *   石英 8 kg + 45 钢 5 kg → 1 m 原器 1 件
     */
    id: 'make/straightness-standard-1m',
    name: '1 m 直线度原器制造',
    produces: [
      {
        item: 'std/straightness-standard-1m',
        qty: q(1),
        gives: [
          { param: 'length', kind: 'range', min: 1, max: 1 },
          { param: 'straightness', kind: 'range', min: 0.3, max: 0.5 },
          { param: 'uncertainty', kind: 'range', min: 0.15, max: 0.2 },
          { param: 'material', kind: 'enum', oneOf: ['quartz-pure'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(8) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(5) }] },
    ],
    needs: ['plant/laser-straightness', 'plant/metrology-room'],
    steps: [
      { note_zh: '① 石英棒 50×50×1000 mm 切割、粗磨、精磨（面形 0.3–0.5 µm/m）', performedBy: 'plant/grinder' },
      { note_zh: '② 三点支撑座（Bessel 点，间距 0.55 m）：自重弯曲压到 <0.05 µm/m', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 激光+翻转自校：20 点、180° 翻转各一遍，平均消光束弯曲；残差 0.15–0.2 µm/m', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 温度系数：0.1 K 控温下复测，1 m 石英只变 0.05 µm/m；写证书', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(60) },
    unbalanced_zh: '石英 8 + 45 钢 5 → 1 m 原器 1 件；余是磨削量与支撑座切屑（按件计）',
  },

  {
    /**
     * **Ar 空心阴极灯：玻璃壳 + 石英窗 + Fe/Ni 阴极杯 + Ar 300–600 Pa。**
     *
     *   玻璃 0.3 kg + 石英 0.01 kg + 铁 0.05 kg + 镍 0.01 kg + Ar 0.01 g → 灯 1 只
     *
     * Ar I 866.79 / 912.30 nm 两条线夹住 870 区，波长是原子常数（0.001 nm 级），
     * 所以标准件的定值误差只剩谱仪读数与内插几何（见 measure/oes-wavelength-hcl）。
     */
    id: 'make/hollow-cathode-ar',
    name: 'Ar 填充空心阴极灯制造',
    produces: [
      {
        item: 'std/hollow-cathode-ar',
        qty: q(1),
        gives: [
          { param: 'envelopeDiameter', kind: 'range', min: 28, max: 35 },
          { param: 'fillPressure', kind: 'range', min: 300, max: 600 },
          { param: 'ignitionVoltage', kind: 'range', min: 250, max: 350 },
          { param: 'current', kind: 'range', min: 8, max: 15 },
          { param: 'life', kind: 'range', min: 800, max: 1500 },
          { param: 'cathode', kind: 'enum', oneOf: ['Fe', 'Ni'] },
          { param: 'lines', kind: 'enum', oneOf: ['866.79', '912.30'] },
          // 灯线宽/仪器分辨率资格带，不是单次读数。
          { param: 'linewidth866', kind: 'range', min: 0.01, max: 0.5, record: 'mat/hcl-linewidth-record' },
          { param: 'linewidth912', kind: 'range', min: 0.01, max: 0.5, record: 'mat/hcl-linewidth-record' },
          { param: 'instrumentResolution', kind: 'range', min: 0.005, max: 0.2, record: 'mat/hcl-linewidth-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 100000) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 玻璃壳 φ30 与石英窗封接（1900–2200 °C，退火消应力）', performedBy: 'plant/glass-lathe', under: [{ param: 'temperature', min: 1900, max: 2200 }] },
      { note_zh: '② 装 Fe/Ni 阴极杯、阳极与屏蔽筒（阴极内径 3–5 mm、深 8–10 mm）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 抽真空烘烤：1e-4–1e-3 Pa、350–400 °C × 4 h 去气（`plant/euv-vacuum`）', performedBy: 'plant/euv-vacuum', under: [{ param: 'pressure', min: 1e-4, max: 1e-3 }] },
      { note_zh: '④ 充 Ar 300–600 Pa 封口（纯度 99.999 %；封口后静置 24 h 查漏）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '⑤ 起辉与老练：200–400 V 起辉、5–20 mA 连续 50 h（`plant/hv-source-500v`），电压漂 <5 %', performedBy: 'plant/hv-source-500v' },
      { note_zh: '⑥ 寿命初测：800–1500 h 后光强掉 <30 % 判合格；写证书（充气压力、电流、谱线）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(90) },
    unbalanced_zh: '玻璃 0.3 + 石英 0.01 + 铁 0.05 + 镍 0.01 + Ar 0.01 g → 灯 1 只；余是玻璃切头与电极加工屑（按件计）',
  },

  {
    /**
     * **精密自准直仪：f=300 石英物镜 + 分光镜 + 4 MP CCD（5 µm 像元）+ 温控。**
     *
     *   物镜 1 + CCD 1 + 分光镜 1 + 45 钢 2 kg + 氧化铝 2 → 自准直仪 1 台
     *
     * 分辨账：θ_px = p/(2f) = 5 µm/(2×300 mm) = **1.72″/px**；
     * 质心到 1/100–1/300 px ⇒ **0.006–0.017″**，取 0.005–0.01″ 为最好档。
     * 标定：几何自校（f 与像元间距，0.1–0.3 ‰）+ 测角仪 ±100/±300″ 抽点校线性
     * （测角仪 72–180″ 只校线性，不校零点）。
     */
    id: 'make/autocollimator-precision',
    name: '精密电子自准直仪制造',
    produces: [
      {
        item: 'std/autocollimator-precision',
        qty: q(1),
        gives: [
          { param: 'focalLength', kind: 'range', min: 250, max: 350 },
          { param: 'aperture', kind: 'range', min: 50, max: 70 },
          { param: 'pixels', kind: 'range', min: 4, max: 4 },
          { param: 'pixelPitch', kind: 'range', min: 5, max: 5 },
          { param: 'angularResolution', kind: 'range', min: 0.005, max: 0.01 },
          { param: 'accuracy', kind: 'range', min: 0.03, max: 0.08 },
          { param: 'range', kind: 'range', min: 300, max: 300 },
          { param: 'thermalStability', kind: 'range', min: 0.02, max: 0.04 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/metrology-ccd', qty: q(1) }] },
      { anyOf: [{ item: 'plant/interferometer/splitter', qty: q(1) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(2) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(2) }] },
    ],
    needs: ['plant/goniometer-theta2theta', 'plant/metrology-room'],
    steps: [
      { note_zh: '① 磨制 f=300 mm 石英物镜（双程光路，弥散 <2 px）与十字分划板', performedBy: 'plant/grinder' },
      { note_zh: '② 装分光镜、分划板与 4 MP CCD（2048²、5 µm 像元），照明 635 nm LED', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 调焦与像质：分划像占 100–300 px，边缘锐度 <2 px', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 标定：几何自校 θ_px = p/(2f)（f 与像元间距，0.1–0.3 ‰）+ 测角仪 ±100/±300″ 抽点校线性；精度 0.03–0.08″', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '⑤ 温控：局部恒温罩 ±0.02–0.04 K；写证书（f、像元、分辨、精度、量程）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(80) },
    unbalanced_zh: 'CCD 1 + 分光镜 1 + 石英 0.02 + 45 钢 2 + 氧化铝 2 → 自准直仪 1 台；余是磨削量与镜框切屑（按件计）',
  },

  {
    /**
     * **1 pC 电荷标准：100 pF × 10 mV（齐纳 10 V 经 1000:1 分压）。**
     *
     *   100 pF 标准 1 + 齐纳 1 + Hamon 1 + 接触器 1 + 铜 0.05 + PTFE 0.01 → 1 pC 标准 1 件
     */
    id: 'make/charge-standard-1pc',
    name: '1 pC 电荷标准制造',
    produces: [
      {
        item: 'std/charge-standard-1pc',
        qty: q(1),
        gives: [
          { param: 'charge', kind: 'range', min: 1, max: 1 },
          { param: 'uncertainty', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'riseTime', kind: 'range', min: 20, max: 60 },
          { param: 'repetition', kind: 'range', min: 10, max: 50 },
          { param: 'capacitance', kind: 'range', min: 100, max: 100 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/hv-test-bench/standard-capacitor-local', qty: q(1) }] },
      { anyOf: [{ item: 'std/zener-reference-precision', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hamon-divider-7half', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room', 'std/dmm-7half-general'],
    steps: [
      { note_zh: '① 装 100 pF 标准与 1000:1 分压（Hamon 100:1 × 10:1）：齐纳 10 V → **10 mV**', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 10 V 读数用 7½（0.5–1.3 ppm）；10 mV 的 U = 1–2 ppm × 1000 ⇒ 0.1–0.3 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 步进注入：Q = C·V = 100 pF × 10 mV = **1.00 pC**；C 的 0.1–0.5 % 是主项，合成 0.2–0.5 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 与 PD 检测器比对：把 U@1 pC 从 **132 %** 压到 0.5–1 %，检测器的刻度因子从此可校', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '⑤ 重复性：100 次注入 RSD 0.1–0.3 %；20–30 °C 温漂 <0.05 %；写证书（C、V、Q、U）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(40) },
    unbalanced_zh: '100 pF 标准 1 + 齐纳 1 + Hamon 1 + 接触器 1 + 铜 0.05 + PTFE 0.01 → 1 pC 标准 1 件（按件计）',
  },

  {
    /**
     * **²⁸Si 工作标样：溶天然 Si 片 + 富集粉 → 重量法配 60/75/90/99 % → HR-ICP-MS 校比值。**
     *
     *   富集粉 0.1 g + 天然片 1 + HF/HNO₃ + 水 → 工作标样 4 瓶
     */
    id: 'make/si-isotope-working-standard',
    name: '²⁸Si 工作标样制造',
    produces: [
      {
        item: 'std/si-isotope-working-standard',
        qty: q(4),
        gives: [
          { param: 'enrichment', kind: 'range', min: 60, max: 99 },
          { param: 'uncertainty', kind: 'range', min: 0.3, max: 0.8 },
          { param: 'form', kind: 'enum', oneOf: ['solution'] },
          { param: 'si28', kind: 'range', min: 60, max: 99 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-28-enriched', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/nitric-acid-subboiled', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 溶样：天然 Si 片（HF/HNO₃）与 ²⁸Si 粉分别溶解、赶酸、定容', performedBy: 'plant/boron-free-lab', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 重量法配 60/75/90/99 % 四点（天平 0.1 mg，配比 U 0.05–0.1 %）', performedBy: 'plant/boron-free-lab', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ HR-ICP-MS 测 28/29/30 比（R=10 000、天然 Si 归一）；与配比差 <0.5 % 才收', performedBy: 'plant/hr-icp-ms', under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }] },
      { note_zh: '④ 分装 PFA 瓶、标浓度与 U（0.3–0.8 %）；6 个月复测，漂 >1 % 重配', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(30) },
    unbalanced_zh: '富集粉 0.1 g + 天然片 1 + HF/HNO₃ 各 0.01 + 水 0.1 → 工作标样 4 瓶；余是溶解损耗与洗水（按瓶计）',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...STD_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...STD_ROUTES];
