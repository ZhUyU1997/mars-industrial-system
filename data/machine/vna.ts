/**
 * 3 GHz 矢量网络分析仪 —— 把回波损耗、S 参数、电缆损耗从“设计值”变成“可测”。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、整机窗口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   frequency        10 MHz–3 GHz
 *   dynamicRange     >100 dB（交付 100–120）
 *   ifBandwidth      1 Hz–100 kHz
 *   S11 不确定度     0.05–0.2 dB / 0.3–1°
 *   端口             2
 *   SOLT 校准        开路/短路/负载/直通
 *
 * 零件：
 *   synthesizer              10 MHz–3 GHz、相位噪声 −100…−90 dBc/Hz @100 kHz、
 *                            步进 0.1–1 Hz
 *   s-parameter-test-set     定向耦合器 20–30 dB、方向性 35–50 dB、开关
 *   receiver                 4 通道、混频 + IF 1 Hz–100 kHz、动态 100 dB
 *   cal-kit                  SOLT 四件、50 Ω、回波 40–50 dB、相位 0.2–0.5°
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、3 GHz 下 1 m 同轴损耗
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 50 Ω PTFE 半刚性同轴在 1 GHz 约 0.8–1.2 dB/m；损耗按 √f 走：
 *
 *   3 GHz：0.8–1.2 × √3 = **1.39–2.08 dB/m**
 *   取设计窗 **1.5–2.5 dB/m**；1 m = **1.5–2.5 dB**；0.3 m = **0.45–0.75 dB**
 *
 * 这比 1 GHz 的 0.24–0.36 dB（0.3 m）差 2 倍，和 √3 一致。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、方向性对 S11 的贡献
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 定向耦合器方向性 D 把泄漏矢量加到 DUT 反射 Γ 上：
 *
 *   Γ_meas = Γ + 10^(−D/20)
 *   误差 ≈ 20 log10(1 + 10^(−D/20)/|Γ|)
 *
 * 取 DUT 回波 15 dB（|Γ|=0.178）：
 *
 *   D=35 dB → 泄漏 0.0178 → 误差 **0.83 dB**
 *   D=40 dB → 0.0100 → **0.48 dB**
 *   D=45 dB → 0.0056 → **0.27 dB**
 *   D=50 dB → 0.0032 → **0.15 dB**
 *   D=60 dB → 0.0010 → **0.05 dB**
 *
 * 所以原始方向性 35–50 dB 在 15 dB 回波上只给 **0.15–0.83 dB**；
 * 0.05–0.2 dB 是 **SOLT 把方向性残差压到 50–60 dB 之后**的窗口。
 * 0.05 dB 要 ~60 dB 残差；45–50 dB 原始个体只能到 0.15–0.27 dB。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、SOLT 残差对 0.05 dB 的影响
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 0.05 dB 是 0.58 % 的幅度。cal-kit 的两项残差：
 *
 *   负载回波 40 dB → 反射 1.0 %；对 |Γ|=0.5 的 DUT，误差 20log10(1.02)=**0.17 dB**
 *   负载回波 50 dB → 0.32 %；同 DUT **0.05 dB**
 *
 *   相位 0.2° → 在 |Γ|=0.5 上矢量误差 0.5·sin0.2°=0.00175 → **0.03 dB**
 *   相位 0.5° → 0.00436 → **0.075 dB**
 *
 * 两项 RSS：0.2°/40 dB 约 **0.17 dB**；0.2°/50 dB 约 **0.06 dB**；
 * 0.5°/40 dB 约 **0.19 dB**。所以：
 *
 *   **0.05 dB 是 50 dB 负载 + 0.2° 相位 + 50–60 dB 残余方向性的最好情况；**
 *   0.1–0.2 dB 是常态窗口；0.05 dB 不能当成所有频点的保证。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、cal-kit 怎么造
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 四件都是精密同轴件：
 *
 *   开路    内导体端面缩进 0.1–0.2 mm，外导体端面齐平
 *   短路    内/外导体端面直接短接
 *   负载    50 Ω 精密电阻（±0.1 %）+ 同轴壳
 *   直通    50 Ω 同轴线，长度 20–30 mm
 *
 * 车/铣用现有 `lathe` + `plant/milling-machine`（本层没有 CNC 车床）；
 * 镀金用 `plant/evaporator` 蒸 0.2–0.5 µm（不是电镀金，金层只防氧化，
 * 导电靠铜/黄铜基底）。尺寸与 DC 电阻进计量间；SOLT 定义由几何定，
 * 不靠另一台 VNA 自校（避免循环）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const VNA_ITEMS: readonly Item[] = [
  /**
   * 合成源。**10 MHz–3 GHz、相位噪声 −100…−90 dBc/Hz @100 kHz、步进 0.1–1 Hz。**
   */
  {
    id: 'plant/vna-3ghz/synthesizer',
    name: 'VNA 合成源',
    unit: '件',
    category: 'part',
    props: [
      { param: 'frequency', kind: 'range', min: 1e7, max: 3e9, unit: 'Hz' },
      { param: 'phaseNoise', kind: 'range', min: -100, max: -90, unit: 'dBc/Hz', dir: 'atMost' },
      { param: 'step', kind: 'range', min: 0.1, max: 1, unit: 'Hz', dir: 'atMost' },
      { param: 'outputPower', kind: 'range', min: -10, max: 10, unit: 'dBm' },
    ],
  },

  /**
   * S 参数测试座。**定向耦合器 20–30 dB、方向性 35–50 dB、开关隔离 60–80 dB。**
   */
  {
    id: 'plant/vna-3ghz/s-parameter-test-set',
    name: 'S 参数测试座',
    unit: '件',
    category: 'part',
    props: [
      { param: 'frequency', kind: 'range', min: 1e7, max: 3e9, unit: 'Hz' },
      { param: 'coupling', kind: 'range', min: 20, max: 30, unit: 'dB' },
      { param: 'directivity', kind: 'range', min: 35, max: 50, unit: 'dB', dir: 'atLeast' },
      { param: 'isolation', kind: 'range', min: 60, max: 80, unit: 'dB', dir: 'atLeast' },
      { param: 'ports', kind: 'range', min: 2, max: 2, unit: '口' },
    ],
  },

  /**
   * 4 通道接收机。**混频 + IF 1 Hz–100 kHz、动态 100–120 dB。**
   */
  {
    id: 'plant/vna-3ghz/receiver',
    name: '4 通道接收机',
    unit: '件',
    category: 'part',
    props: [
      { param: 'frequency', kind: 'range', min: 1e7, max: 3e9, unit: 'Hz' },
      { param: 'channels', kind: 'range', min: 4, max: 4, unit: '路' },
      { param: 'ifBandwidth', kind: 'range', min: 1, max: 100000, unit: 'Hz' },
      { param: 'dynamicRange', kind: 'range', min: 100, max: 120, unit: 'dB', dir: 'atLeast' },
      { param: 'noiseFigure', kind: 'range', min: 10, max: 20, unit: 'dB', dir: 'atMost' },
    ],
  },

  /**
   * SOLT 校准件。**开路/短路/负载/直通四件、50 Ω、回波 40–50 dB、相位 0.2–0.5°。**
   */
  {
    id: 'plant/vna-3ghz/cal-kit',
    name: 'SOLT 校准件',
    unit: '套',
    category: 'part',
    props: [
      { param: 'frequency', kind: 'range', min: 1e7, max: 3e9, unit: 'Hz' },
      { param: 'standards', kind: 'range', min: 4, max: 4, unit: '件' },
      { param: 'impedance', kind: 'range', min: 50, max: 50, unit: 'Ω' },
      { param: 'returnLoss', kind: 'range', min: 40, max: 50, unit: 'dB', dir: 'atLeast' },
      { param: 'phaseAccuracy', kind: 'range', min: 0.2, max: 0.5, unit: '°', dir: 'atMost' },
      { param: 'connector', kind: 'enum', values: ['SMA'] },
    ],
  },

  /**
   * VNA 射频引擎（未校准）。**10 MHz–3 GHz、动态 100–120 dB、2 端口。**
   */
  {
    id: 'plant/vna-3ghz',
    name: 'VNA 射频引擎',
    unit: '套',
    category: 'part',
    props: [
      { param: 'frequency', kind: 'range', min: 1e7, max: 3e9, unit: 'Hz' },
      { param: 'dynamicRange', kind: 'range', min: 100, max: 120, unit: 'dB', dir: 'atLeast' },
      { param: 'ifBandwidth', kind: 'range', min: 1, max: 100000, unit: 'Hz' },
      { param: 'ports', kind: 'range', min: 2, max: 2, unit: '口' },
    ],
  },

  /**
   * 3 GHz VNA 整机。**10 MHz–3 GHz、>100 dB、IF 1 Hz–100 kHz、
   * S11 0.05–0.2 dB / 0.3–1°（SOLT 后、残余方向性 50–60 dB）、双端口。**
   */
  {
    id: 'std/vna-3ghz',
    name: '3 GHz VNA 整机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'frequency', kind: 'range', min: 1e7, max: 3e9, unit: 'Hz' },
      { param: 'dynamicRange', kind: 'range', min: 100, max: 130, unit: 'dB', dir: 'atLeast' },
      { param: 'ifBandwidth', kind: 'range', min: 1, max: 100000, unit: 'Hz' },
      { param: 's11Uncertainty', kind: 'range', min: 0.05, max: 0.2, unit: 'dB', dir: 'atMost' },
      { param: 's11Phase', kind: 'range', min: 0.3, max: 1, unit: '°', dir: 'atMost' },
      { param: 'ports', kind: 'range', min: 2, max: 2, unit: '口' },
      { param: 'directivity', kind: 'range', min: 35, max: 50, unit: 'dB', dir: 'atLeast' },
      { param: 'calibration', kind: 'enum', values: ['SOLT'] },
    ],
  },
];

export const VNA_ROUTES: readonly Route[] = [
  /**
   * 合成源：SiGe HBT + 石英 + PLL/分频 + 滤波。
   *
   *   HBT 4 + 石英 1 + 运放 4 + 控制板 1 + PCB 2 + 铜线 0.2 + 铝 0.5 → 合成源 1
   */
  {
    id: 'make/vna-synthesizer',
    name: 'VNA 合成源制造',
    produces: [
      {
        item: 'plant/vna-3ghz/synthesizer',
        qty: q(1),
        gives: [
          { param: 'frequency', kind: 'range', min: 1e7, max: 3e9 },
          { param: 'phaseNoise', kind: 'range', min: -100, max: -90 },
          { param: 'step', kind: 'range', min: 0.1, max: 1 },
          { param: 'outputPower', kind: 'range', min: -10, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/sige-hbt-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/quartz-resonator-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(160) },
    unbalanced_zh:
      'HBT 4 + 石英 1 + 运放 4 + 控制板 1 + PCB 2 + 铜线 0.2 + 铝 0.5 → 合成源 1；余是屏蔽盒/调试废品。10 MHz–3 GHz、−100…−90 dBc/Hz @100 kHz 是设计值，用相位噪声分析仪/拍频测',
  },

  /**
   * S 参数测试座：两个定向耦合器 + 开关 + 50 Ω 负载。
   *
   *   铜 0.2 + PTFE 0.1 + 不锈钢 0.1 + 金 0.001 + 接触器 2 + 电阻 2 → 测试座 1
   */
  {
    id: 'make/vna-test-set',
    name: 'S 参数测试座制造',
    produces: [
      {
        item: 'plant/vna-3ghz/s-parameter-test-set',
        qty: q(1),
        gives: [
          { param: 'frequency', kind: 'range', min: 1e7, max: 3e9 },
          { param: 'coupling', kind: 'range', min: 20, max: 30 },
          { param: 'directivity', kind: 'range', min: 35, max: 50 },
          { param: 'isolation', kind: 'range', min: 60, max: 80 },
          { param: 'ports', kind: 'range', min: 2, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/chip-resistor-general', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车/铣两只 20–30 dB 定向耦合器：耦合线长 3–8 mm，方向性 35–50 dB', performedBy: 'lathe', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装开关与 50 Ω 负载：隔离 60–80 dB，端口回波 >20 dB', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '测方向性：用 50 Ω 负载与短路/开路，D=35–50 dB；挑 ≥45 dB 的进 0.05–0.2 dB 档', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(120) },
    unbalanced_zh:
      '铜 0.2 + PTFE 0.1 + 不锈钢 0.1 + 金 0.001 + 接触器 2 + 电阻 2 → 测试座 1；余是车/铣屑。35–50 dB 方向性、20–30 dB 耦合是设计值；45 dB 以上才进 SOLT 后的 0.05–0.2 dB 窗口，原始 45–50 dB 是 0.15–0.27 dB',
  },

  /**
   * 4 通道接收机：肖特基混频 + IF 放大/滤波 + 检波。
   *
   *   肖特基 8 + 运放 8 + 电容 8 + 控制板 1 + PCB 2 + 铝 1 + 铜线 0.5 → 接收机 1
   */
  {
    id: 'make/vna-receiver',
    name: '4 通道接收机制造',
    produces: [
      {
        item: 'plant/vna-3ghz/receiver',
        qty: q(1),
        gives: [
          { param: 'frequency', kind: 'range', min: 1e7, max: 3e9 },
          { param: 'channels', kind: 'range', min: 4, max: 4 },
          { param: 'ifBandwidth', kind: 'range', min: 1, max: 100000 },
          { param: 'dynamicRange', kind: 'range', min: 100, max: 120 },
          { param: 'noiseFigure', kind: 'range', min: 10, max: 20 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/schottky-diode-general', qty: q(8) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(8) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(8) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(160) },
    unbalanced_zh:
      '肖特基 8 + 运放 8 + 电容 8 + 控制板 1 + PCB 2 + 铝 1 + 铜线 0.5 → 接收机 1；余是屏蔽盒/调试废品。4 通道、IF 1 Hz–100 kHz、动态 100–120 dB 是设计值',
  },

  /**
   * SOLT 校准件：车/铣四件同轴标准 + 50 Ω 负载 + 蒸金。
   *
   *   铜 0.2 + 不锈钢 0.1 + PTFE 0.05 + 金 0.001 + 50 Ω 电阻 1 → cal-kit 1 套
   */
  {
    id: 'make/vna-cal-kit',
    name: 'SOLT 校准件制造',
    produces: [
      {
        item: 'plant/vna-3ghz/cal-kit',
        qty: q(1),
        gives: [
          { param: 'frequency', kind: 'range', min: 1e7, max: 3e9 },
          { param: 'standards', kind: 'range', min: 4, max: 4 },
          { param: 'impedance', kind: 'range', min: 50, max: 50 },
          { param: 'returnLoss', kind: 'range', min: 40, max: 50 },
          { param: 'phaseAccuracy', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'connector', kind: 'enum', oneOf: ['SMA'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'std/chip-resistor-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车四件同轴标准：开路内导体缩进 0.1–0.2 mm、短路端面直短、直通 20–30 mm；同轴度 ≤0.01 mm', performedBy: 'lathe', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '铣外导体/连接器平面与 SMA 螺纹；装 50 Ω 精密电阻（±0.1 %）成负载', performedBy: 'plant/milling-machine', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '蒸金 0.2–0.5 µm：真空 1e-3–1e-2 Pa，金层防氧化；导电靠铜/黄铜基底', performedBy: 'plant/evaporator', under: [{ param: 'pressure', min: 0.001, max: 0.01 }] },
      { note_zh: '计量：内外导体尺寸、DC 电阻、50 Ω 负载回波 40–50 dB；相位由几何定，0.2–0.5°', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(80) },
    unbalanced_zh:
      '铜 0.2 + 不锈钢 0.1 + PTFE 0.05 + 金 0.001 + 50 Ω 电阻 1 → cal-kit 1 套；余是车/铣屑与蒸金损耗。40–50 dB 回波、0.2–0.5° 相位是设计值；没有另一台 VNA 自校，避免循环',
  },

  /**
   * VNA 射频引擎：合成源 + 测试座 + 接收机 + 控制/计算机。
   *
   *   合成源 1 + 测试座 1 + 接收机 1 + 控制板 1 + 计算机 1
   *   + 钢板 2 + 铝 1 + 铜线 0.5 + PTFE 0.05 → 引擎 1 套
   */
  {
    id: 'make/vna-3ghz-rf',
    name: 'VNA 射频引擎制造',
    produces: [
      {
        item: 'plant/vna-3ghz',
        qty: q(1),
        gives: [
          { param: 'frequency', kind: 'range', min: 1e7, max: 3e9 },
          { param: 'dynamicRange', kind: 'range', min: 100, max: 120 },
          { param: 'ifBandwidth', kind: 'range', min: 1, max: 100000 },
          { param: 'ports', kind: 'range', min: 2, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/vna-3ghz/synthesizer', qty: q(1) }] },
      { anyOf: [{ item: 'plant/vna-3ghz/s-parameter-test-set', qty: q(1) }] },
      { anyOf: [{ item: 'plant/vna-3ghz/receiver', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/computer-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '装合成源/测试座/接收机：50 Ω 半刚性互连，端口回波 >20 dB', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装控制/计算机：10 MHz–3 GHz 扫频、IF 1 Hz–100 kHz、4 通道采集', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '粗测动态范围：>100 dB；S11/S21 原始数据进计算机', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(240) },
    unbalanced_zh:
      '合成源 1 + 测试座 1 + 接收机 1 + 控制板 1 + 计算机 1 + 钢板 2 + 铝 1 + 铜线 0.5 + PTFE 0.05 → 引擎 1 套；按件计。10 MHz–3 GHz、100–120 dB 是设计值；S11 不确定度要 SOLT 校准后才有',
  },

  /**
   * 整机：射频引擎 + SOLT cal-kit + 校准与不确定度。
   *
   *   引擎 1 + cal-kit 1 + 计算机 1 + 控制板 1 + 铝 1 + 铜线 0.5 → VNA 1 台
   */
  {
    id: 'make/vna-3ghz',
    name: '3 GHz VNA 整机装配',
    produces: [
      {
        item: 'std/vna-3ghz',
        qty: q(1),
        gives: [
          { param: 'frequency', kind: 'range', min: 1e7, max: 3e9 },
          { param: 'dynamicRange', kind: 'range', min: 100, max: 120 },
          { param: 'ifBandwidth', kind: 'range', min: 1, max: 100000 },
          { param: 's11Uncertainty', kind: 'range', min: 0.05, max: 0.2 },
          { param: 's11Phase', kind: 'range', min: 0.3, max: 1 },
          { param: 'ports', kind: 'range', min: 2, max: 2 },
          { param: 'directivity', kind: 'range', min: 45, max: 50 },
          { param: 'calibration', kind: 'enum', oneOf: ['SOLT'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/vna-3ghz', qty: q(1) }] },
      { anyOf: [{ item: 'plant/vna-3ghz/cal-kit', qty: q(1) }] },
      { anyOf: [{ item: 'std/computer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '接 cal-kit 做 SOLT：开路/短路/负载/直通四件，50 Ω、回波 40–50 dB、相位 0.2–0.5°', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '测方向性 45–50 dB（挑高端测试座）；S11 不确定度 0.05–0.2 dB、相位 0.3–1°', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '验收：10 MHz–3 GHz 扫频、动态 >100 dB、IF 1 Hz–100 kHz；S11/S21 与电缆损耗写进证书', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(80) },
    unbalanced_zh:
      '引擎 1 + cal-kit 1 + 计算机 1 + 控制板 1 + 铝 1 + 铜线 0.5 → VNA 1 台；按件计。0.05–0.2 dB/0.3–1° 是 SOLT 后窗口；0.05 dB 只在 50 dB 负载 + 0.2° 相位 + 50–60 dB 残余方向性时成立，不能当所有频点保证',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...VNA_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...VNA_ROUTES];
