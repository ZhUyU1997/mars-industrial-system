/**
 * UHF 局放分析仪 + 100 kV 无局放源 —— 把两条“整机种子”补成有产出的路线。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 这个文件补哪两条
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   plant/hv-test-bench/uhf-pd-analyzer      UHF 局放分析仪（300–1500 MHz）
 *   plant/hv-test-bench/pd-free-source-100k  100 kV 无局放源（≤1 pC）
 *
 * 之后又补了两台 IEC 60270 检测仪（文件末尾）：
 *
 *   plant/hv-test-bench/pd-detector-iec60270    检测仪 A（1–1000 pC、100–400 kHz）
 *   plant/hv-test-bench/pd-detector-iec60270-b  检测仪 B（A/B 互比用，读出路径不同）
 *
 * 两台整机原来都只声明、没有产出路线，而 PD 记录五连（校准 → 互比 → 预算 →
 * 自校证书 → 复校计划）全以它们为 `needs`，所以记录链一起长不出来。
 *
 * 四台整机都已在 `measurement-seed.ts` 里。UHF 分析仪与无局放源原先没有
 * 产出路线（本文件前半补）；两台检测仪也一直没有路线（本文件末尾补）。
 * 缺口不是
 * “本层没有”，而是三件/两件中间件没有建：
 *
 *   UHF        GHz 低噪前放、肖特基检波二极管、等效时间采样数字仪、UHF 天线
 *   无局放源   真空浇注环氧绝缘（环氧树脂 + 酸酐 + 硅微粉 + 真空脱气 + 浇注模）
 *
 * 本文件按 **Earth 工程值** 建这些中间件与整机路线。所有 `gives` 窗口、
 * 灵敏度、局放量、增益带宽积都是**设计值（Earth 工程值）**，不是实测记录；
 * 实测走本文件末尾的两条 `measure/` 路线。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、UHF：100 GHz 增益带宽积怎么跨过去
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 旧账：40 dB @1 GHz 的**单级**放大器要 100 GHz 增益带宽积
 * （`pd-sensor.ts:108`），本层平面管 f_T 只有 100 MHz 量级。
 *
 * 这次按地球的 SiGe HBT 做**两级**，账就变了：
 *
 *   单级 20 dB（10 倍）@1.5 GHz ⇒ 该级只要 15 GHz 的增益带宽积
 *   SiGe HBT f_T = 35–50 GHz，留 2.3–3.3 倍余量
 *   两级串起来 40 dB；整机 3 dB 带宽 300–1500 MHz
 *
 * 所以不需要一只 100 GHz 的器件，需要的是 **f_T ≥35 GHz 的 SiGe HBT +
 * 两级 50 Ω 匹配**。这就是 `std/sige-hbt-general` 与 `std/uhf-lna-general`
 * 的由来。器件本身靠：
 *
 *   ① 锗：锌浸出液的副产（`make/germanium`，99.99 %）；
 *   ② SiGe 外延：LPCVD 炉 700–750 °C / 13–40 Pa，SiHCl₃ + GeCl₄ + H₂
 *      （`make/sige-epi-wafer`）；
 *   ③ 器件：接触式光刻 1–2 µm + 离子注入 + 多晶硅发射极
 *      （`make/sige-hbt`，f_T 35–50 GHz）。
 *
 * 检波：Si 肖特基，W/n-Si，C_j = 0.05–0.15 pF、f_T = 150–300 GHz；
 * 50 Ω 负载下视频带宽 1/(2πRC) 约 20–60 GHz，封装寄生把它压到 2–6 GHz，
 * 仍比 1.5 GHz 高。灵敏度 -75…-65 dBm（设计值），靠 40 dB 前放 + 平方律检波。
 *
 * 采样：**等效时间采样**。实时采样只做 2 GS/s（8–10 bit）；对重复的 PD 脉冲，
 * 用 1–5 ps 步进延迟逐点重建，等效 2–4 GS/s、1.5–3 GHz 带宽。时基用
 * `plant/hv-test-bench/uhf-spark-source`（0.5–2 ns 阶跃）做相位参考，
 * 比较器由 SiGe HBT 做（`plant/uhf-digitizer/comparator`）。
 *
 * PRPD：256 相位格 × 1000 个工频周期（50 Hz 下 20 s），记录 q(φ) 谱图。
 * 整机 `gives` 里写 `phaseBins 256`、`prpdCycles 1000`。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、无局放源：为什么选真空浇注环氧，不选变压器油
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 旧账：`source-100k` + retrofit 的设计局放 1–3 pC，是 ≤1 pC 的 1–3 倍；
 * 酚醛浇注的局放比油浸差约 10 倍。
 *
 * 变压器油要矿物油精炼：火星没有石油，合成油（CO + H₂ → FT 蜡 → 加氢异构）
 * 要新建一条 C10–C20 的费托链，远超这一台源的需要。真空浇注环氧用的是
 * 本层已有的 C3/芳香链：
 *
 *   苯酚 + 丙酮 → 双酚 A          （`make/bisphenol-a`，50–60 °C，酸催化）
 *   丙烯 + 氯 → 环氧氯丙烷        （`make/epichlorohydrin`，450–550 °C 氯化）
 *   双酚 A + 环氧氯丙烷 + NaOH → 环氧树脂（`make/epoxy-resin`，60–90 °C）
 *   环氧 + 苯酐 + 硅微粉 → 真空浇注料（`make/epoxy-cast-insulation`）
 *
 * 真空浇注把气泡压到 ≤0.5 %（体积），气泡是局放的起点：一个 0.1 mm 的气泡
 * 在 20 kV/mm 下的起始放电场强只有环氧本体的 1/3 左右。0.5 % 气泡 +
 * 300–400 mm 沿面 + 均压环，设计局放 **0.2–0.8 pC**（Earth 工程值）。
 *
 * ⚠️ 0.2–0.8 pC 是**设计值**，不是实测。测量侧仍受 `pd-uncertainty.ts`
 * 的 U@1 pC = 1.317 pC（132 %）限制；本文件末尾的 `measure/pd-free-source-pd`
 * 记录的是“源 + 检测器 + 屏蔽舱”这一套的读数，不是绝对溯源。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、只用已有 id
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 所有 `uses` / `needs` / `performedBy` 都先 grep 过。新 id 只在本文件里：
 *
 *   mat/germanium · std/sige-epi-wafer-general · std/sige-hbt-general
 *   std/uhf-lna-general · std/schottky-diode-general
 *   plant/uhf-digitizer + 四个零件
 *   plant/hv-test-bench/uhf-pd-analyzer/antenna
 *   mat/bisphenol-a · mat/epichlorohydrin · mat/epoxy-resin
 *   mat/epoxy-cast-insulation · plant/hv-test-bench/pd-free-source-100k/insulator
 *   mat/uhf-pd-sensitivity-record · mat/pd-free-source-pd-record
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目
// ═══════════════════════════════════════════════════════════════════════════

export const UHF_PD_ITEMS: readonly Item[] = [
  /**
   * 锗（Ge，99.99–99.999 %）。锌浸出液的副产，不是“火星没有锗”。
   *
   * 闪锌矿里 Ge 有 10–100 ppm，焙烧/浸出后留在浸出渣与溶液中。本层按
   * 锌浸出液 1511 kg 取 33 ppm Ge ⇒ 0.05 kg；按 80 % 收率交 0.04 kg，
   * 够 40 片 SiGe 外延片（每片 0.001 kg）。
   *
   * 纯度窗口 99.99–99.999 %：区熔 5–10 次，电阻率 ≥10 Ω·cm。
   */
  {
    id: 'mat/germanium',
    name: '光电二极管用锗',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99, max: 99.9999, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * SiGe 外延片。φ100、Si 缓冲层 100 nm + Si₀.₈Ge₀.₂ 应变层 50–80 nm。
   *
   * 外延在 `plant/lpcvd-furnace` 里做：700–750 °C / 13–40 Pa，
   * SiHCl₃ + GeCl₄ + H₂。Ge 组分 18–22 %、应变 0.8–1.2 %，
   * 位错密度 ≤1e6 cm⁻²（设计值，Earth 工程值）。
   */
  {
    id: 'std/sige-epi-wafer-general',
    name: 'SiGe 外延片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'geFraction', kind: 'range', min: 0, max: 30, unit: '%' },
      { param: 'strain', kind: 'range', min: 0, max: 2, unit: '%' },
      { param: 'defectDensity', kind: 'range', min: 0, max: 1e7, unit: 'cm⁻²', dir: 'atMost' },
      { param: 'thickness', kind: 'range', min: 20, max: 200, unit: 'nm' },
    ],
  },

  /**
   * SiGe HBT。发射极宽 1–2 µm、基区 SiGe 20 nm、多晶硅发射极。
   *
   * f_T 35–50 GHz、f_max 50–80 GHz、NF_min 0.8–1.5 dB @2 GHz。
   * 设计值（Earth 工程值）；`std/vna-3ghz` 可在 0.1–3 GHz 测 S21 并外推 f_T，
   * 但 35–50 GHz 仍靠外推，不是 35 GHz 实测。
   */
  {
    id: 'std/sige-hbt-general',
    name: 'SiGe 异质结双极晶体管',
    unit: '件',
    category: 'part',
    props: [
      { param: 'fT', kind: 'range', min: 20, max: 80, unit: 'GHz', dir: 'atLeast' },
      { param: 'fmax', kind: 'range', min: 30, max: 120, unit: 'GHz', dir: 'atLeast' },
      { param: 'nfmin', kind: 'range', min: 0.3, max: 3, unit: 'dB', dir: 'atMost' },
      { param: 'gain', kind: 'range', min: 10, max: 30, unit: 'dB', dir: 'atLeast' },
      { param: 'vceo', kind: 'range', min: 2, max: 10, unit: 'V', dir: 'atLeast' },
    ],
  },

  /**
   * GHz 低噪前放。两级 SiGe HBT、50 Ω 输入/输出、带宽 300–1500 MHz。
   *
   *   单级 20 dB @1.5 GHz ⇒ 每级 GBW 15 GHz；f_T 45 GHz 有 3 倍余量
   *   两级 40 dB；NF 0.8–1.3 dB；OIP3 12–18 dBm
   *
   * 40 dB 不是单级 100 GHz GBW 硬撑出来的，是两级各 20 dB 的账。
   */
  {
    id: 'std/uhf-lna-general',
    name: 'GHz 低噪前放',
    unit: '件',
    category: 'part',
    props: [
      { param: 'gain', kind: 'range', min: 20, max: 50, unit: 'dB', dir: 'atLeast' },
      { param: 'bandwidth', kind: 'range', min: 200, max: 2000, unit: 'MHz' },
      { param: 'noiseFigure', kind: 'range', min: 0.3, max: 3, unit: 'dB', dir: 'atMost' },
      { param: 'oip3', kind: 'range', min: 0, max: 30, unit: 'dBm', dir: 'atLeast' },
      { param: 'returnLoss', kind: 'range', min: 5, max: 25, unit: 'dB', dir: 'atLeast' },
    ],
  },

  /**
   * Si 肖特基检波二极管。W/n-Si，结面积 20 × 20 µm²。
   *
   *   C_j = 0.05–0.15 pF、R_s = 5–15 Ω ⇒ 截止 150–300 GHz
   *   50 Ω 负载：f_3dB = 1/(2πRC) ≈ 20–60 GHz（封装寄生压到 2–6 GHz）
   *   平方律检波灵敏度 1500–3000 mV/mW（-20 dBm 输入）
   *
   * 它替代的是 Cu₂O 检波器（只到 MHz）与“拿前放非线性当检波”的做法。
   */
  {
    id: 'std/schottky-diode-general',
    name: 'Si 肖特基检波二极管',
    unit: '件',
    category: 'part',
    props: [
      { param: 'fT', kind: 'range', min: 50, max: 500, unit: 'GHz', dir: 'atLeast' },
      { param: 'capacitance', kind: 'range', min: 0.01, max: 1, unit: 'pF', dir: 'atMost' },
      { param: 'responsivity', kind: 'range', min: 100, max: 10000, unit: 'mV/mW', dir: 'atLeast' },
      { param: 'videoBandwidth', kind: 'range', min: 0.1, max: 20, unit: 'GHz', dir: 'atLeast' },
      { param: 'seriesResistance', kind: 'range', min: 1, max: 100, unit: 'Ω', dir: 'atMost' },
    ],
  },

  /**
   * UHF 数字仪。采样保持 + 高速比较器 + 时基，等效时间采样。
   *
   *   实时 2 GS/s、8–10 bit；重复脉冲用 1–5 ps 步进重建 ⇒ 等效 2–4 GS/s
   *   模拟带宽 1.5–3 GHz；2 通道；PRPD 的相位格由时基与工频参考给出
   *
   * 它不是示波器整机，是分析仪里的“采样 + 量化 + 相位”三合一模块。
   * `holds` 没有温度/压力：它是一块装在屏蔽盒里的板卡。
   */
  {
    id: 'plant/uhf-digitizer',
    name: 'UHF 数字仪',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'sampleRate', kind: 'range', min: 0.5, max: 10, unit: 'GS/s', dir: 'atLeast' },
      { param: 'bandwidth', kind: 'range', min: 1, max: 5, unit: 'GHz', dir: 'atLeast' },
      { param: 'resolution', kind: 'range', min: 6, max: 12, unit: 'bit', dir: 'atLeast' },
      { param: 'channels', kind: 'range', min: 1, max: 4, unit: '路', dir: 'atLeast' },
    ],
  },

  /**
   * 采样保持器。四只肖特基二极管桥 + 2 pF 保持电容 + 缓冲。
   *
   *   孔径 0.4–0.8 ns、带宽 2–4 GHz、保持压降 0.2–1 mV/µs、 pedestal 1–5 mV
   *   孔径抖动 <0.5 ps（由时基与比较器共同决定）
   *
   * 1.5 GHz 的一个周期是 667 ps；0.4 ns 的孔径已经比它短，等效时间采样
   * 靠“每次只取一个相位点”而不是“一次采完整波形”。
   */
  {
    id: 'plant/uhf-digitizer/sample-hold',
    name: 'UHF 采样保持器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'aperture', kind: 'range', min: 0.1, max: 2, unit: 'ns', dir: 'atMost' },
      { param: 'bandwidth', kind: 'range', min: 1, max: 10, unit: 'GHz', dir: 'atLeast' },
      { param: 'droop', kind: 'range', min: 0, max: 10, unit: 'mV/µs', dir: 'atMost' },
      { param: 'pedestal', kind: 'range', min: 0, max: 20, unit: 'mV', dir: 'atMost' },
    ],
  },

  /**
   * 高速比较器。SiGe HBT 差分对 + 正反馈锁存，翻转率 3–5 GS/s。
   *
   *   迟滞 2–5 mV、抖动 0.5–1.5 ps、输入 0.5–1 Vpp
   *
   * 本层现有的 `std/opamp-chip-general` 只有 ~1 MHz GBW，做不了 1.5 GHz
   * 的阈值判决；这只比较器是用新 HBT 搭的。
   */
  {
    id: 'plant/uhf-digitizer/comparator',
    name: 'UHF 高速比较器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'toggleRate', kind: 'range', min: 1, max: 10, unit: 'GS/s', dir: 'atLeast' },
      { param: 'hysteresis', kind: 'range', min: 0.5, max: 20, unit: 'mV', dir: 'atMost' },
      { param: 'jitter', kind: 'range', min: 0.1, max: 5, unit: 'ps', dir: 'atMost' },
      { param: 'inputRange', kind: 'range', min: 0.1, max: 2, unit: 'V' },
    ],
  },

  /**
   * 时基。100 MHz 石英 × 20–40 倍频 + 1–5 ps 步进延迟线。
   *
   *   时钟 2–4 GHz、抖动 0.3–0.8 ps RMS、步进 1–5 ps、稳定度 1–10 ppm
   *
   * 步进延迟线是等效时间采样的核心：每个触发周期把采样点往后挪 1–5 ps，
   * 1000 个周期就重建出 1–5 ns 的波形。
   */
  {
    id: 'plant/uhf-digitizer/timebase',
    name: 'UHF 时基',
    unit: '件',
    category: 'part',
    props: [
      { param: 'clock', kind: 'range', min: 0.5, max: 10, unit: 'GHz', dir: 'atLeast' },
      { param: 'jitter', kind: 'range', min: 0.05, max: 5, unit: 'ps', dir: 'atMost' },
      { param: 'delayStep', kind: 'range', min: 0.5, max: 50, unit: 'ps', dir: 'atMost' },
      { param: 'stability', kind: 'range', min: 0.01, max: 100, unit: 'ppm', dir: 'atMost' },
    ],
  },

  /**
   * 数字仪屏蔽盒。1.5 mm 铝 + 铜网衬里，SMA 馈通。
   *
   *   屏蔽 60–90 dB @300 MHz–1.5 GHz；0.4 × 0.3 m
   */
  {
    id: 'plant/uhf-digitizer/case',
    name: 'UHF 数字仪屏蔽盒',
    unit: '件',
    category: 'part',
    props: [
      { param: 'shielding', kind: 'range', min: 20, max: 120, unit: 'dB', dir: 'atLeast' },
      { param: 'width', kind: 'range', min: 0.1, max: 1, unit: 'm' },
      { param: 'height', kind: 'range', min: 0.1, max: 1, unit: 'm' },
    ],
  },

  /**
   * UHF 天线。300–1500 MHz 的宽带振子/对数周期，50 Ω。
   *
   * 现有 `plant/hv-test-bench/pd-sensor` 的 UHF 段只到 1000 MHz
   * （`pd-sensor.ts:187`），差 500 MHz；这台分析仪要 1500 MHz，所以
   * 单独做一只 300–1500 MHz 的天线，不是把旧传感器改一改。
   */
  {
    id: 'plant/hv-test-bench/uhf-pd-analyzer/antenna',
    name: 'UHF 天线',
    unit: '件',
    category: 'part',
    props: [
      { param: 'bandwidth', kind: 'range', min: 300, max: 1500, unit: 'MHz' },
      { param: 'gain', kind: 'range', min: 0, max: 10, unit: 'dBi', dir: 'atLeast' },
      { param: 'vswr', kind: 'range', min: 1, max: 3, unit: '1', dir: 'atMost' },
    ],
  },

  /**
   * 双酚 A（BPA）。苯酚 2 + 丙酮 1 → BPA + 水，酸催化 50–60 °C。
   *
   * 纯度 99–99.5 %、熔点 156–158 °C。它是环氧树脂的骨架，
   * 也是本层第一次把苯酚/丙酮两条链接到同一个分子上。
   */
  {
    id: 'mat/bisphenol-a',
    name: '双酚 A',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 95, max: 99.99, unit: '%', dir: 'atLeast' },
      { param: 'meltingPoint', kind: 'range', min: 150, max: 160, unit: '°C' },
    ],
  },

  /**
   * 环氧氯丙烷（ECH）。丙烯高温氯化 → 烯丙基氯 → 次氯酸化 → 皂化。
   *
   * 纯度 98–99.5 %、含水 0.05–0.2 %。它是把环氧基接到 BPA 上的那一半。
   */
  {
    id: 'mat/epichlorohydrin',
    name: '环氧氯丙烷',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 95, max: 99.9, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 0, max: 0.5, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 双酚 A 环氧树脂。BPA + ECH + NaOH，60–90 °C 缩合、水洗、脱溶剂。
   *
   * 环氧当量 180–200 g/eq、25 °C 黏度 2000–5000 mPa·s、纯度 99–99.5 %。
   * 它是真空浇注料的基体；酸酐固化剂用本层已有的苯酐。
   */
  {
    id: 'mat/epoxy-resin',
    name: '双酚 A 环氧树脂',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'epoxideEquivalent', kind: 'range', min: 150, max: 250, unit: 'g/eq' },
      { param: 'viscosity', kind: 'range', min: 100, max: 10000, unit: 'mPa·s', dir: 'atMost' },
      { param: 'purity', kind: 'range', min: 95, max: 99.99, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * 真空浇注环氧绝缘料。环氧树脂 + 苯酐 + 硅微粉，真空脱气后浇注、
   * 150–180 °C / 3–5 MPa 固化。
   *
   *   气泡 ≤0.5 vol%、tanδ 0.002–0.008、击穿 20–30 kV/mm
   *   设计局放 0.2–0.5 pC（Earth 工程值，不是实测）
   *
   * 气泡是局放的起点：0.5 % 的气泡把起始放电场强从环氧本体的
   * ~40 kV/mm 拉到 10–15 kV/mm；真空脱气与 3–5 MPa 浇注就是为这一条。
   */
  {
    id: 'mat/epoxy-cast-insulation',
    name: '真空浇注环氧绝缘料',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'voidContent', kind: 'range', min: 0, max: 2, unit: '%', dir: 'atMost' },
      { param: 'tanDelta', kind: 'range', min: 0.0001, max: 0.05, unit: '1', dir: 'atMost' },
      { param: 'dielectricStrength', kind: 'range', min: 5, max: 50, unit: 'kV/mm', dir: 'atLeast' },
      { param: 'pdLevel', kind: 'range', min: 0, max: 10, unit: 'pC', dir: 'atMost' },
    ],
  },

  /**
   * 100 kV 源的真空浇注绝缘件。环氧浇注体 + 铝/铜电极 + 300–400 mm 沿面。
   *
   *   pdLevel 0.2–0.8 pC（设计值）、沿面 300–400 mm（100 kV 下 0.25–0.33 kV/mm）
   *   tanδ 0.002–0.008、电容 100–200 pF（与倍压柱并联的杂散）
   */
  {
    id: 'plant/hv-test-bench/pd-free-source-100k/insulator',
    name: '100 kV 真空浇注绝缘件',
    unit: '件',
    category: 'part',
    props: [
      { param: 'pdLevel', kind: 'range', min: 0, max: 5, unit: 'pC', dir: 'atMost' },
      { param: 'creepage', kind: 'range', min: 100, max: 1000, unit: 'mm', dir: 'atLeast' },
      { param: 'tanDelta', kind: 'range', min: 0.0001, max: 0.05, unit: '1', dir: 'atMost' },
      { param: 'capacitance', kind: 'range', min: 10, max: 1000, unit: 'pF' },
    ],
  },


];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线
// ═══════════════════════════════════════════════════════════════════════════

export const UHF_PD_ROUTES: readonly Route[] = [
  /**
   * 锗：锌浸出液 → 沉锗 → 氯化蒸馏 → 水解 → 氢还原 → 区熔。
   *
   *   锌浸出液 1511 + 盐酸 200 + 氯 150 + 氢 10 + 碳 20 + 水 1000 → 锗 0.04
   *
   * 1511 kg 锌浸出液按 33 ppm Ge 算，含锗 0.05 kg；按 80 % 收率交
   * **0.04 kg/批**。0.04 kg 够 40 片 SiGe 外延片（每片 0.001 kg）。
   * 收率 60 % 时只有 0.03 kg —— 多跑一批，不改窗口。设计值（Earth 工程值）。
   */
  {
    id: 'make/germanium',
    name: '光电二极管用锗制备',
    produces: [
      {
        item: 'mat/germanium',
        qty: q(1, 25),
        gives: [{ param: 'purity', kind: 'range', min: 99.99, max: 99.999 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/zinc-sulfate', qty: q(1511) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(200) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(150) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(10) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1000) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh:
          '沉锗：锌浸出液加单宁/碱中和，Ge 共沉进渣；60–90 °C、100–300 kPa（湿法槽）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 60, max: 90 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '氯化蒸馏：GeO₂ + 4HCl → GeCl₄ + 2H₂O，GeCl₄ 沸点 83 °C；60–90 °C、5–30 kPa 下蒸出（真空精馏塔）',
        performedBy: 'plant/vacuum-column',
        under: [
          { param: 'temperature', min: 60, max: 90 },
          { param: 'pressure', min: 5, max: 30 },
        ],
      },
      {
        note_zh: '水解：GeCl₄ + 2H₂O → GeO₂ + 4HCl；GeO₂ 洗涤到 Cl⁻ <10 ppm',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh: '氢还原：GeO₂ + 2H₂ → Ge + 2H₂O，600–700 °C（电阻炉）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 600, max: 700 }],
      },
      {
        note_zh: '区熔：900–950 °C，5–10 次，电阻率 ≥10 Ω·cm；切锭、酸洗、包装',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 900, max: 950 }],
      },
    ],
    rate: { hours: q(80) },
    unbalanced_zh:
      '锌浸出液 1511 + 盐酸 200 + 氯 150 + 氢 10 + 碳 20 + 水 1000 → 锗 0.04；余是氯化物/水解废液与尾渣（本层未逐项建条目）。0.05 kg 是 1511 kg 浸出液按 33 ppm Ge 的化学计量，0.04 kg 是 80 % 收率；60 % 收率时多跑一批，不改窗口',
  },

  /**
   * SiGe 外延片：LPCVD 700–750 °C / 13–40 Pa，SiHCl₃ + GeCl₄ + H₂。
   *
   *   硅片 10 + 三氯氢硅 1 + 锗 0.01 + 氯 0.1 + 氢 1 + 水 1 → 外延片 10
   *
   * 10 片一批，每片 0.001 kg Ge（Ge 组分 20 %、层厚 70 nm、φ100）。
   * 外延层厚度 50–80 nm；Ge 18–22 %；应变 0.8–1.2 %。设计值。
   */
  {
    id: 'make/sige-epi-wafer',
    name: 'SiGe 外延片制造',
    produces: [
      {
        item: 'std/sige-epi-wafer-general',
        qty: q(10),
        gives: [
          { param: 'geFraction', kind: 'range', min: 18, max: 22 },
          { param: 'strain', kind: 'range', min: 0.8, max: 1.2 },
          { param: 'defectDensity', kind: 'range', min: 1e5, max: 1e6 },
          { param: 'thickness', kind: 'range', min: 50, max: 80 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(10) }] },
      { anyOf: [{ item: 'mat/trichlorosilane-pure', qty: q(1) }] },
      { anyOf: [{ item: 'mat/germanium', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/lpcvd-furnace',
    under: [
      { param: 'temperature', min: 700, max: 750 },
      { param: 'pressure', min: 13, max: 40 },
    ],
    rate: { hours: q(6) },
    unbalanced_zh:
      '硅片 10 + 三氯氢硅 1 + 锗 0.01 + 氯 0.1 + 氢 1 + 水 1 → 外延片 10；余是尾气（SiCl₄/GeCl₄ 水解物）与装片损耗。Ge 0.01 kg 是 10 片 × 0.001 kg 的配比',
  },

  /**
   * SiGe HBT：场氧 → 基区光刻/注入 → 退火 → 发射极窗口 → 多晶硅发射极 →
   * 接触光刻/金属化 → 钝化 → 划片/测试。
   *
   *   外延片 1 片（约 100 只）+ 光刻胶/BN/PH₃/氢氟酸/硝酸/铝/金/铜 → HBT 100 只
   *
   * 发射极 1–2 µm；光刻用 `plant/mask-aligner`（接触式），注入用
   * `plant/ion-implanter`（5–100 keV）。f_T 35–50 GHz 是设计值。
   */
  {
    id: 'make/sige-hbt',
    name: 'SiGe 异质结双极晶体管制造',
    produces: [
      {
        item: 'std/sige-hbt-general',
        qty: q(100),
        gives: [
          { param: 'fT', kind: 'range', min: 35, max: 50 },
          { param: 'fmax', kind: 'range', min: 50, max: 80 },
          { param: 'nfmin', kind: 'range', min: 0.8, max: 1.5 },
          { param: 'gain', kind: 'range', min: 18, max: 24 },
          { param: 'vceo', kind: 'range', min: 3.5, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/sige-epi-wafer-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      { anyOf: [{ item: 'mat/boron-trifluoride', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/phosphorus', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      {
        note_zh: '场氧：900–1000 °C 干氧 120 nm（扩散炉）',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 900, max: 1000 }],
      },
      { note_zh: '基区光刻：1–2 µm 发射极窗口，接触式曝光', performedBy: 'plant/mask-aligner' },
      {
        note_zh: '基区注入：BF₂⁺ 30 keV、1e14 cm⁻²；压力 1e-4–1e-3 Pa',
        performedBy: 'plant/ion-implanter',
        under: [{ param: 'pressure', min: 1e-4, max: 1e-3 }],
      },
      {
        note_zh: '基区退火：900–1000 °C / 30 s，激活并修复注入损伤（电阻炉）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 900, max: 1000 }],
      },
      { note_zh: '发射极窗口光刻：1 µm 条宽', performedBy: 'plant/mask-aligner' },
      {
        note_zh: '多晶硅发射极：LPCVD 700–780 °C / 13–40 Pa，SiHCl₃ + PH₃，300 nm',
        performedBy: 'plant/lpcvd-furnace',
        under: [
          { param: 'temperature', min: 700, max: 780 },
          { param: 'pressure', min: 13, max: 40 },
        ],
      },
      { note_zh: '接触光刻：开基极/集电极/发射极接触孔', performedBy: 'plant/mask-aligner' },
      {
        note_zh: '金属化：蒸发 Ti/Au 300 nm，剥离；压力 0.001–10 Pa',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 10 }],
      },
      {
        note_zh: '钝化：LPCVD SiN 200 nm，700–780 °C / 13–40 Pa',
        performedBy: 'plant/lpcvd-furnace',
        under: [
          { param: 'temperature', min: 700, max: 780 },
          { param: 'pressure', min: 13, max: 40 },
        ],
      },
      {
        note_zh: '划片/装架/直流 β 与 1 GHz 噪声系数抽测（19–21 °C）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(160) },
    unbalanced_zh:
      '外延片 1 + 光刻胶 1 + BF₃ 0.01 + 磷 0.01 + 氢氟酸 0.1 + 硝酸 0.1 + 铝 0.1 + 金 0.01 + 铜 0.1 + 水 10 → HBT 100 只；余是划片崩边、光刻胶显影废液与金属剥离废料。f_T/f_max 是设计值，未做 S 参数实测',
  },

  /**
   * GHz 低噪前放：4 只 HBT/台 + 片式阻容感 + 2 层 PCB + 屏蔽盒。
   *
   *   10 台一批：HBT 40 + 电阻 80 + 电感 40 + 电容 40 + PCB 1 + 焊膏 0.1
   *   + 铜 0.1 + 铝 0.5 + PTFE 0.1 → LNA 10
   *
   *   两级各 20 dB；NF 0.8–1.3 dB；OIP3 12–18 dBm；带宽 300–1500 MHz
   */
  {
    id: 'make/uhf-lna',
    name: 'GHz 低噪前放制造',
    produces: [
      {
        item: 'std/uhf-lna-general',
        qty: q(10),
        gives: [
          { param: 'gain', kind: 'range', min: 35, max: 42 },
          { param: 'bandwidth', kind: 'range', min: 300, max: 1500 },
          { param: 'noiseFigure', kind: 'range', min: 0.8, max: 1.3 },
          { param: 'oip3', kind: 'range', min: 12, max: 18 },
          { param: 'returnLoss', kind: 'range', min: 10, max: 15 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/sige-hbt-general', qty: q(40) }] },
      { anyOf: [{ item: 'std/chip-resistor-general', qty: q(80) }] },
      { anyOf: [{ item: 'std/chip-inductor-general', qty: q(40) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(40) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/solder-paste', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '贴片/回流：0402 阻容感 + HBT，200–240 °C / 100–300 kPa（回流炉）',
        performedBy: 'plant/reflow-furnace',
        under: [
          { param: 'temperature', min: 200, max: 240 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh: '装屏蔽盒、50 Ω 微带匹配、扫 300–1500 MHz 的增益/NF（19–21 °C）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      'HBT 40 + 电阻 80 + 电感 40 + 电容 40 + PCB 1 + 焊膏 0.1 + 铜 0.1 + 铝 0.5 + PTFE 0.1 → LNA 10；余是贴片废品与屏蔽盒边角。增益/NF 是设计值，扫频记录走 measure/uhf-pd-sensitivity',
  },

  /**
   * 肖特基检波二极管：场氧 → 有源区光刻 → 蒸发 W/Au → 350–450 °C 退火 →
   * 划片/封装/测试。
   *
   *   硅片 1 片（约 100 只）+ 钨/金/铝/光刻胶/氢氟酸/硝酸/水 → 二极管 100 只
   *
   * W/n-Si 肖特基：C_j 0.05–0.15 pF、f_T 150–300 GHz、灵敏度 1500–3000 mV/mW。
   */
  {
    id: 'make/schottky-diode',
    name: 'Si 肖特基检波二极管制造',
    produces: [
      {
        item: 'std/schottky-diode-general',
        qty: q(100),
        gives: [
          { param: 'fT', kind: 'range', min: 150, max: 300 },
          { param: 'capacitance', kind: 'range', min: 0.05, max: 0.15 },
          { param: 'responsivity', kind: 'range', min: 1500, max: 3000 },
          { param: 'videoBandwidth', kind: 'range', min: 2, max: 6 },
          { param: 'seriesResistance', kind: 'range', min: 5, max: 15 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(1) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      {
        note_zh: '清洗/场氧：900–1000 °C 干氧 100 nm，光刻开有源区',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 900, max: 1000 }],
      },
      { note_zh: '有源区光刻：20 × 20 µm² 窗口', performedBy: 'plant/mask-aligner' },
      {
        note_zh: '蒸发 W 50 nm / Au 200 nm，剥离；压力 0.001–10 Pa',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 10 }],
      },
      {
        note_zh: '肖特基退火：350–450 °C / 30 min，形成 W/n-Si 势垒（电阻炉）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 350, max: 450 }],
      },
      {
        note_zh: '划片、装 SMA 座、测 I–V/C–V 与 1.5 GHz 检波灵敏度（19–21 °C）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(80) },
    unbalanced_zh:
      '硅片 1 + 钨 1 + 金 1 + 铝 1 + 光刻胶 1 + 氢氟酸 0.1 + 硝酸 0.1 + 水 5 → 二极管 100 只；余是划片崩边、金属剥离废料与测试废品。C_j/f_T 是设计值，C–V 只抽测',
  },

  /**
   * 采样保持器：四只肖特基桥 + 2 pF 保持电容 + 缓冲 + 屏蔽。
   *
   *   10 只一批：二极管 40 + 电容 20 + 电阻 40 + PTFE 0.1 + 铝 1 + 铜 0.1 + PCB 1
   */
  {
    id: 'make/uhf-sample-hold',
    name: 'UHF 采样保持器制造',
    produces: [
      {
        item: 'plant/uhf-digitizer/sample-hold',
        qty: q(10),
        gives: [
          { param: 'aperture', kind: 'range', min: 0.4, max: 0.8 },
          { param: 'bandwidth', kind: 'range', min: 2, max: 4 },
          { param: 'droop', kind: 'range', min: 0.2, max: 1 },
          { param: 'pedestal', kind: 'range', min: 1, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/schottky-diode-general', qty: q(40) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(20) }] },
      { anyOf: [{ item: 'std/chip-resistor-general', qty: q(40) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(24) },
    unbalanced_zh:
      '二极管 40 + 电容 20 + 电阻 40 + PTFE 0.1 + 铝 1 + 铜 0.1 + PCB 1 → 采样保持 10；余是贴片废品。孔径 0.4–0.8 ns、带宽 2–4 GHz 是设计值，用 1.5 GHz 阶跃看保持波形',
  },

  /**
   * 高速比较器：SiGe HBT 差分对 + 正反馈锁存 + 50 Ω 输出。
   *
   *   10 只一批：HBT 40 + 电阻 60 + PCB 1 + 铜 0.1 + 铝 1 + 焊膏 0.1
   */
  {
    id: 'make/uhf-comparator',
    name: 'UHF 高速比较器制造',
    produces: [
      {
        item: 'plant/uhf-digitizer/comparator',
        qty: q(10),
        gives: [
          { param: 'toggleRate', kind: 'range', min: 3, max: 5 },
          { param: 'hysteresis', kind: 'range', min: 2, max: 5 },
          { param: 'jitter', kind: 'range', min: 0.5, max: 1.5 },
          { param: 'inputRange', kind: 'range', min: 0.5, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/sige-hbt-general', qty: q(40) }] },
      { anyOf: [{ item: 'std/chip-resistor-general', qty: q(60) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/solder-paste', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(30) },
    unbalanced_zh:
      'HBT 40 + 电阻 60 + PCB 1 + 铜 0.1 + 铝 1 + 焊膏 0.1 → 比较器 10；余是贴片废品。3–5 GS/s 翻转率、0.5–1.5 ps 抖动是设计值（用 1.5 GHz 正弦看眼图）',
  },

  /**
   * 时基：100 MHz 石英 × 20–40 倍频 + 1–5 ps 步进延迟线。
   *
   *   10 只一批：石英 10 + HBT 20 + 计数芯片 20 + 电阻 40 + PCB 1 + 铜 0.1 + 铝 1
   */
  {
    id: 'make/uhf-timebase',
    name: 'UHF 时基制造',
    produces: [
      {
        item: 'plant/uhf-digitizer/timebase',
        qty: q(10),
        gives: [
          { param: 'clock', kind: 'range', min: 2, max: 4 },
          { param: 'jitter', kind: 'range', min: 0.3, max: 0.8 },
          { param: 'delayStep', kind: 'range', min: 1, max: 5 },
          { param: 'stability', kind: 'range', min: 1, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/quartz-resonator-general', qty: q(10) }] },
      { anyOf: [{ item: 'std/sige-hbt-general', qty: q(20) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(20) }] },
      { anyOf: [{ item: 'std/chip-resistor-general', qty: q(40) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(30) },
    unbalanced_zh:
      '石英 10 + HBT 20 + 计数芯片 20 + 电阻 40 + PCB 1 + 铜 0.1 + 铝 1 → 时基 10；余是贴片废品。2–4 GHz、0.3–0.8 ps 抖动、1–5 ps 步进是设计值',
  },

  /**
   * 数字仪屏蔽盒：1.5 mm 铝 + 铜网 + SMA 馈通。
   *
   *   铝 10 + 铜 1 + 钢 5 + PTFE 0.1 → 盒 1
   */
  {
    id: 'make/uhf-case',
    name: 'UHF 数字仪屏蔽盒制造',
    produces: [
      {
        item: 'plant/uhf-digitizer/case',
        qty: q(1),
        gives: [
          { param: 'shielding', kind: 'range', min: 60, max: 90 },
          { param: 'width', kind: 'range', min: 0.4, max: 0.4 },
          { param: 'height', kind: 'range', min: 0.3, max: 0.3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
    ],
    needs: [],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(16) },
    unbalanced_zh:
      '铝 10 + 铜 1 + 钢 5 + PTFE 0.1 → 屏蔽盒 1；余是边角/焊条。60–90 dB 是 300 MHz–1.5 GHz 的设计值，未做屏蔽室法实测',
  },

  /**
   * UHF 天线：300–1500 MHz 对数周期/宽带振子，50 Ω。
   *
   *   铝 1 + 铜 1 + PTFE 1 + 钢 1 → 天线 1
   */
  {
    id: 'make/uhf-antenna',
    name: 'UHF 天线制造',
    produces: [
      {
        item: 'plant/hv-test-bench/uhf-pd-analyzer/antenna',
        qty: q(1),
        gives: [
          { param: 'bandwidth', kind: 'range', min: 300, max: 1500 },
          { param: 'gain', kind: 'range', min: 2, max: 5 },
          { param: 'vswr', kind: 'range', min: 1.5, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(16) },
    unbalanced_zh:
      '铝 1 + 铜 1 + PTFE 1 + 钢 1 → 天线 1；余是边角/馈线。300–1500 MHz、2–5 dBi、VSWR 1.5–2 是设计值，用火花源看时域振铃判通带',
  },

  /**
   * UHF 数字仪：2 只采样保持 + 2 只比较器 + 时基 + 屏蔽盒 + 2 只 LNA。
   *
   *   采样保持 2 + 比较器 2 + 时基 1 + 盒 1 + LNA 2 + 控制板 1 + 计数 1
   *   + 基准 1 + 铝 5 + 铜 1 + PCB 1 + 焊膏 0.1 → 数字仪 1
   *
   * 等效时间采样：实时 2 GS/s，重复脉冲用 1–5 ps 步进重建到 2–4 GS/s。
   */
  {
    id: 'make/uhf-digitizer',
    name: 'UHF 数字仪制造',
    produces: [
      {
        item: 'plant/uhf-digitizer',
        qty: q(1),
        gives: [
          { param: 'sampleRate', kind: 'range', min: 2, max: 4 },
          { param: 'bandwidth', kind: 'range', min: 1.5, max: 3 },
          { param: 'resolution', kind: 'range', min: 8, max: 10 },
          { param: 'channels', kind: 'range', min: 2, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/uhf-digitizer/sample-hold', qty: q(2) }] },
      { anyOf: [{ item: 'plant/uhf-digitizer/comparator', qty: q(2) }] },
      { anyOf: [{ item: 'plant/uhf-digitizer/timebase', qty: q(1) }] },
      { anyOf: [{ item: 'plant/uhf-digitizer/case', qty: q(1) }] },
      { anyOf: [{ item: 'std/uhf-lna-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/solder-paste', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room', 'plant/hv-test-bench/uhf-spark-source'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(40) },
    unbalanced_zh:
      '采样保持 2 + 比较器 2 + 时基 1 + 盒 1 + LNA 2 + 控制板 1 + 计数 1 + 基准 1 + 铝 5 + 铜 1 + PCB 1 + 焊膏 0.1 → 数字仪 1；余是屏蔽盒边角与调试废品。2–4 GS/s 是等效采样率，实时只有 2 GS/s；用 uhf-spark-source 的 0.5–2 ns 阶跃标时基',
  },

  /**
   * 双酚 A：苯酚 2 + 丙酮 1 → BPA + 水，HCl 催化，50–60 °C。
   *
   *   苯酚 824 + 丙酮 254 + 盐酸 5 + 水 200 → BPA 1000
   *
   * 1000 kg BPA 的化学计量：2 × 94.11 = 188.22 苯酚 + 58.08 丙酮 =
   * 246.30 → 228.29 BPA + 18.02 水；折算 1000 kg BPA 需苯酚 824.4、
   * 丙酮 254.4，水 78.9 作为副产（本路线只交 BPA，余按不平衡声明）。
   */
  {
    id: 'make/bisphenol-a',
    name: '双酚 A 制备',
    produces: [
      {
        item: 'mat/bisphenol-a',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 99, max: 99.5 },
          { param: 'meltingPoint', kind: 'range', min: 156, max: 158 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/phenol', qty: q(824) }] },
      { anyOf: [{ item: 'mat/acetone', qty: q(254) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(200) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/wet-bench',
    under: [
      { param: 'temperature', min: 50, max: 60 },
      { param: 'pressure', min: 100, max: 300 },
    ],
    rate: { hours: q(12) },
    unbalanced_zh:
      '苯酚 824 + 丙酮 254 + 盐酸 5 + 水 200 → BPA 1000；余是反应水 78.9 kg、过量苯酚/丙酮与酸水。BPA 1000 kg 的化学计量是苯酚 824.4 + 丙酮 254.4 = BPA 1000 + 水 78.9；本路线只交 BPA，水与废酸未单列',
  },

  /**
   * 环氧氯丙烷：丙烯 600 + 氯 900 + NaOH 500 + 水 1000 → ECH 1000。
   *
   *   ① 高温氯化 450–550 °C：C₃H₆ + Cl₂ → CH₂=CHCH₂Cl + HCl
   *   ② 次氯酸化 20–60 °C：烯丙基氯 + HOCl → 二氯丙醇
   *   ③ 皂化 60–90 °C：二氯丙醇 + NaOH → ECH + NaCl + H₂O
   *   ④ 真空精馏 60–100 °C / 5–40 kPa：ECH bp 116 °C，减压到 60–80 °C
   *
   * 1000 kg ECH 的化学计量：丙烯 600（C₃ 36/42.08 = 85.7 % 碳）、
   * 氯 900（实际 2 Cl/ECH，理论 2 × 35.45/92.52 = 76.6 %，取 900 含过量）、
   * NaOH 500（理论 40/92.52 = 43.2 %，取 500 含皂化过量）。
   */
  {
    id: 'make/epichlorohydrin',
    name: '环氧氯丙烷制备',
    produces: [
      {
        item: 'mat/epichlorohydrin',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 98, max: 99.5 },
          { param: 'water', kind: 'range', min: 0.05, max: 0.2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/propene', qty: q(600) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(900) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(500) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1000) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '高温氯化：450–550 °C，丙烯与氯气摩尔比 1:1.1，烯丙基氯选择性 80–85 %',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 450, max: 550 }],
      },
      {
        note_zh: '次氯酸化：20–60 °C、100–300 kPa，氯水与烯丙基氯反应生成二氯丙醇',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh: '皂化：60–90 °C、100–300 kPa，二氯丙醇 + NaOH → ECH + NaCl',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 60, max: 90 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh: '真空精馏：60–100 °C / 5–40 kPa，ECH bp 116 °C，减压后 60–80 °C 蒸出，含水 ≤0.2 %',
        performedBy: 'plant/vacuum-column',
        under: [
          { param: 'temperature', min: 60, max: 100 },
          { param: 'pressure', min: 5, max: 40 },
        ],
      },
    ],
    rate: { hours: q(36) },
    unbalanced_zh:
      '丙烯 600 + 氯 900 + NaOH 500 + 水 1000 → ECH 1000；余是 NaCl 盐水、HCl 与过量氯/碱。丙烯 600 与氯 900 是含过量与选择性的配比，不是化学计量下限；收率按 75–85 % 记',
  },

  /**
   * 双酚 A 环氧树脂：BPA 700 + ECH 350 + NaOH 160 + 水 500 → 树脂 1000。
   *
   *   BPA + 2 ECH + 2 NaOH → 双酚 A 二缩水甘油醚 + 2 NaCl + 2 H₂O
   *   环氧当量 180–200 g/eq（理论 170.2 + 2 × 74.08 = 318.4/2 = 159.2，
   *   低聚 2–4 聚体把当量抬到 180–200）
   *
   * 60–90 °C、100–300 kPa；水洗到 Cl⁻ <50 ppm，真空脱溶剂。
   */
  {
    id: 'make/epoxy-resin',
    name: '双酚 A 环氧树脂制备',
    produces: [
      {
        item: 'mat/epoxy-resin',
        qty: q(1000),
        gives: [
          { param: 'epoxideEquivalent', kind: 'range', min: 180, max: 200 },
          { param: 'viscosity', kind: 'range', min: 2000, max: 5000 },
          { param: 'purity', kind: 'range', min: 99, max: 99.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/bisphenol-a', qty: q(700) }] },
      { anyOf: [{ item: 'mat/epichlorohydrin', qty: q(350) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(160) }] },
      { anyOf: [{ item: 'mat/water', qty: q(500) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/wet-bench',
    under: [
      { param: 'temperature', min: 60, max: 90 },
      { param: 'pressure', min: 100, max: 300 },
    ],
    rate: { hours: q(18) },
    unbalanced_zh:
      'BPA 700 + ECH 350 + NaOH 160 + 水 500 → 环氧树脂 1000；余是 NaCl 盐水、过量 ECH 与洗水。环氧当量 180–200 g/eq 是低聚 2–4 聚体的设计值，不是单体的 159',
  },

  /**
   * 真空浇注环氧料：环氧 70 + 苯酐 25 + 硅微粉 30 + 铝箔 0.01 → 浇注料 100。
   *
   *   配胶 → 真空脱气（0.01–0.5 Pa）→ 浇注/固化（150–180 °C / 3–5 MPa）→ 脱模
   *
   * 气泡 ≤0.5 vol%；苯酐是固化剂（酸酐/环氧 = 0.85–0.9 当量比），
   * 硅微粉 30 wt% 降热膨胀、防开裂。设计局放 0.2–0.5 pC。
   */
  {
    id: 'make/epoxy-cast-insulation',
    name: '真空浇注环氧料制备',
    produces: [
      {
        item: 'mat/epoxy-cast-insulation',
        qty: q(100),
        gives: [
          { param: 'voidContent', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'tanDelta', kind: 'range', min: 0.002, max: 0.008 },
          { param: 'dielectricStrength', kind: 'range', min: 20, max: 30 },
          { param: 'pdLevel', kind: 'range', min: 0.2, max: 0.5 },
        ],
      },
      {
        item: 'mat/epoxy-cast-waste',
        qty: q(2501, 100),
        gives: [
          { param: 'resin', kind: 'range', min: 70, max: 90 },
          { param: 'form', kind: 'enum', oneOf: ['solid'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/epoxy-resin', qty: q(70) }] },
      { anyOf: [{ item: 'mat/phthalic-anhydride', qty: q(25) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(30) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 100) }] },
    ],
    needs: ['plant/clean-room'],
    steps: [
      {
        note_zh: '配胶/混料：环氧 70 + 苯酐 25 + 硅微粉 30，25–35 °C 真空搅拌 30 min',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '真空脱气：0.01–0.5 Pa / 30 min，气泡 ≤0.5 vol%（真空腔）',
        performedBy: 'plant/euv-vacuum',
        under: [{ param: 'pressure', min: 0.01, max: 0.5 }],
      },
      {
        note_zh: '浇注/固化：预热模具 80 °C，浇注后 150–180 °C / 3–5 MPa / 4 h（真空热压机）',
        performedBy: 'plant/hot-press',
        under: [
          { param: 'temperature', min: 150, max: 180 },
          { param: 'pressure', min: 3000, max: 5000 },
        ],
      },
      { note_zh: '脱模/修边/外观与气泡抽检（切片 10×）', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      '环氧 70 + 苯酐 25 + 硅微粉 30 + 铝箔 0.01 = 125.01 → 浇注料 100 + 浇注废料 25.01（已单列 mat/epoxy-cast-waste，可粉碎作填料/尾渣）= 125.01，平。气泡 0.1–0.5 %、tanδ 0.002–0.008、击穿 20–30 kV/mm、局放 0.2–0.5 pC 都是设计值（Earth 工程值），未做局放实测',
  },

  /**
   * 100 kV 绝缘件：浇注料 80 + 铝电极 10 + 铜 5 + PTFE 1 → 绝缘件 1。
   *
   *   装模/埋电极 → 真空浇注/固化（150–180 °C / 3–5 MPa）→ 脱模/修边/耐压
   *
   * 沿面 300–400 mm；100 kV 下 0.25–0.33 kV/mm，空气/环氧界面留 3 倍余量。
   */
  {
    id: 'make/pd-free-insulator',
    name: '100 kV 真空浇注绝缘件制造',
    produces: [
      {
        item: 'plant/hv-test-bench/pd-free-source-100k/insulator',
        qty: q(1),
        gives: [
          { param: 'pdLevel', kind: 'range', min: 0.2, max: 0.8 },
          { param: 'creepage', kind: 'range', min: 300, max: 400 },
          { param: 'tanDelta', kind: 'range', min: 0.002, max: 0.008 },
          { param: 'capacitance', kind: 'range', min: 100, max: 200 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/epoxy-cast-insulation', qty: q(80) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(5) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: ['plant/pd-test-cell'],
    steps: [
      {
        note_zh: '装模/埋电极：铝均压环、铜引线、PTFE 定位块；模具预热 80 °C',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '真空浇注/固化：150–180 °C / 3–5 MPa / 4 h（真空热压机）',
        performedBy: 'plant/hot-press',
        under: [
          { param: 'temperature', min: 150, max: 180 },
          { param: 'pressure', min: 3000, max: 5000 },
        ],
      },
      {
        note_zh: '脱模/修边；18–22 °C / RH<60 % 下做 1.2×100 kV / 1 min 耐压与局放初测',
        performedBy: 'plant/robot',
        under: [
          { param: 'temperature', min: 18, max: 22 },
          { param: 'humidity', min: 0, max: 60 },
        ],
      },
    ],
    rate: { hours: q(12) },
    unbalanced_zh:
      '浇注料 80 + 铝 10 + 铜 5 + PTFE 1 → 绝缘件 1；余是浇注冒口/修边与电极加工屑。0.2–0.8 pC 是设计值，初测记录走 measure/pd-free-source-pd',
  },

  /**
   * 100 kV 无局放源：source-100k + retrofit + 真空浇注绝缘件 + 均压环。
   *
   *   源 1 + retrofit 1 + 绝缘件 1 + 均压环 1 + SF₆ 5 + 铝 10 + 铜 5 → PD-free 源 1
   *
   * 与 retrofit 的 1–3 pC 相比，换掉的是酚醛浇注/空气沿面：
   *   真空浇注环氧 0.2–0.8 pC（设计值）+ 300–400 mm 沿面 + SF₆ 0.2 MPa。
   *
   * 0→100 kV 分 5 级老练，每级 5 min；背景记录走 measure/pd-free-source-pd。
   */
  {
    id: 'make/pd-free-source-100k',
    name: 'PD-free 100 kV 源制造',
    produces: [
      {
        item: 'plant/hv-test-bench/pd-free-source-100k',
        qty: q(1),
        gives: [
          { param: 'measure/voltage', kind: 'range', min: 100000, max: 100000, record: 'mat/pd-free-source-pd-record' },
          { param: 'measure/pdLevel', kind: 'range', min: 0.2, max: 0.8, record: 'mat/pd-free-source-pd-record' },
          { param: 'current', kind: 'range', min: 22, max: 22 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/hv-test-bench/source-100k', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/source-100k-retrofit', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/pd-free-source-100k/insulator', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/corona-ring', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sf6', qty: q(5) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(5) }] },
    ],
    needs: ['plant/pd-test-cell', 'plant/hv-test-bench/uhf-pd-analyzer'],
    steps: [
      {
        note_zh:
          '装绝缘件/均压环/光滑接头：倍压柱与箱壁间距 ≥150 mm；所有高压节点加 φ20–50 均压球；独立接地',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '抽真空到 ≤10 Pa，充 SF₆ 0.2 MPa；静置 24 h 查漏（肥皂水 + 压力表）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '0→20→40→60→80→100 kV 分 5 级老练，每级 5 min；18–22 °C / RH<60 %，记背景 q 与 PRPD',
        performedBy: 'plant/hv-test-bench',
        under: [
          { param: 'temperature', min: 18, max: 22 },
          { param: 'humidity', min: 0, max: 60 },
        ],
      },
    ],
    rate: { hours: q(80) },
    unbalanced_zh:
      '源 1 + retrofit 1 + 绝缘件 1 + 均压环 1 + SF₆ 5 + 铝 10 + 铜 5 → PD-free 源 1；余是接头/箱体加工屑。0.2–0.8 pC 是设计值；实测走 measure/pd-free-source-pd，检测器 U@1 pC 仍是 132 %',
  },

  /**
   * UHF 局放分析仪：天线 + LNA + 肖特基检波 + 数字仪 + 控制/记录。
   *
   *   天线 1 + LNA 1 + 检波二极管 1 + 控制板 1 + DVM 1 + 基准 1
   *   + 铝 2 + 铜 1 + PCB 1 → 分析仪 1
   *
   *   300–1500 MHz、40 dB 前放、灵敏度 -75…-65 dBm、PRPD 256 格 × 1000 周期。
   *   数字仪（`plant/uhf-digitizer`）是外挂模块，走 needs，不塞进 uses。
   */
  {
    id: 'make/uhf-pd-analyzer',
    name: 'UHF 快源制造',
    produces: [
      {
        item: 'plant/hv-test-bench/uhf-pd-analyzer',
        qty: q(1),
        gives: [
          { param: 'measure/bandwidth', kind: 'range', min: 300, max: 1500, record: 'mat/uhf-pd-sensitivity-record' },
          { param: 'fastRise', kind: 'range', min: 0.5, max: 1, record: 'mat/uhf-pd-response-record' },
          { param: 'channels', kind: 'range', min: 2, max: 2 },
          { param: 'measure/sensitivity', kind: 'range', min: -75, max: -65, record: 'mat/uhf-pd-sensitivity-record' },
          { param: 'measure/noiseFigure', kind: 'range', min: 0.8, max: 1.3 },
          { param: 'phaseBins', kind: 'range', min: 256, max: 256, record: 'mat/uhf-pd-sensitivity-record' },
          { param: 'prpdCycles', kind: 'range', min: 1000, max: 1000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/hv-test-bench/uhf-pd-analyzer/antenna', qty: q(1) }] },
      { anyOf: [{ item: 'std/uhf-lna-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/schottky-diode-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1) }] },
    ],
    needs: ['plant/uhf-digitizer', 'plant/metrology-room'],
    steps: [
      {
        note_zh:
          '装天线/LNA/检波器/数字仪：50 Ω 同轴、屏蔽盒、单点接地；天线与 LNA 之间加限幅（防 100 kV 放电打坏前放）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '联调：300/500/800/1000/1500 MHz 五点（用 std/attenuator-standard 替代法：0.05–0.15 dB，合成 0.3–0.6 dB，原 1–1.5）扫频，记增益、NF、灵敏度；用 uhf-spark-source 做 PRPD 相位参考',
        performedBy: 'plant/hv-test-bench',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(40) },
    unbalanced_zh:
      '天线 1 + LNA 1 + 检波二极管 1 + 控制板 1 + DVM 1 + 基准 1 + 铝 2 + 铜 1 + PCB 1 → 分析仪 1；余是屏蔽盒/接头/调试废品。灵敏度 -75…-65 dBm、PRPD 256 格是设计值；扫频记录走 measure/uhf-pd-sensitivity',
  },



  // ═════════════════════════════════════════════════════════════════════════
  // 两台 IEC 60270 检测仪 —— 补掉"检测仪没有产出路线"
  //
  // 它们原在旧清单里、`routes=0`：`measure/calibrate-pd-detector`
  // 等五条记录路线全以 `needs` 指名它们，所以整条 PD 记录链长不出来。
  // 这里按 Earth 工程值把整机写成"中间件 + 装配"，中间件全是本文件/邻文件
  // 已有的：电荷放大器（`make/charge-amp`）、峰值保持（`make/pd-peak-detector`）、
  // 率表（`make/pd-rate-meter`）、1 Hz 记录器（`make/pd-logger`）。
  // 两台是 A/B 关系，但读出路径不同 —— 见各自注释里的独立性与共同偏差。
  // ═════════════════════════════════════════════════════════════════════════

  {
    /**
     * **IEC 60270 局放检测仪 A（1–1000 pC、100–400 kHz、±3–5 %）。**
     *
     * IEC 60270 的脉冲电流法，把试品上的 pC 脉冲变成可读的 q：
     *
     *   输入阻抗 + 反馈电容（100 pF 两只，0.01 V/pC；1:1 / 10:1 量程由输出
     *     分压切换，覆盖 1–1000 pC）
     *     → 电荷放大器 0.01 V/pC（`make/charge-amp`）
     *     → 有源带通 100–400 kHz（运放 2 片 + 薄膜电容 4 只）
     *     → 单次峰值保持（`make/pd-peak-detector`，1–200 pC）
     *     → 率表（`make/pd-rate-meter`）+ 4 位 DVM 读出
     *     → 控制板记量程并切换
     *
     *   电荷放大器 1 + 峰值保持 1 + 率表 1 + 100 pF 电容 2 + DVM 1
     *   + 控制板 1 + 运放 2 + 薄膜电容 4 + 电阻丝 0.05 + 铝 2 + 铜线 0.2
     *   + PCB 1 → 检测仪 1
     *
     * ── 谁在用它 ──────────────────────────────────────────────────────────
     *
     * `measure/calibrate-pd-detector`（刻度/线性）、`measure/pd-intercompare`
     * （A/B 互比）、`measure/pd-uncertainty-budget`、`measure/pd-self-calibration-certificate`、
     * `measure/pd-recalibration-plan` 都以 `needs` 指名它。本条把"第二台起
     * 本地造"写出来，第一台仍随种子清单运来。
     *
     * ── 代价（不改小）──────────────────────────────────────────────────────
     *
     * 4 位 DVM + 1–5 pC 峰值保持：1 pC 处分辨只有 1 个字，U@1 pC 仍是
     * **1.317 pC（132 %）**。这一档只到 **10 pC 以上 ±20 % 可判**，
     * 1 pC 门槛判不了 —— 与 `pd-uncertainty.ts` 同一笔账。
     * accuracy 3–5 %（设计值）只覆盖 10–1000 pC 的校准点。
     */
    id: 'make/pd-detector-iec60270',
    name: 'IEC 60270 PD 检测仪制造',
    produces: [
      {
        item: 'plant/hv-test-bench/pd-detector-iec60270',
        qty: q(1),
        gives: [
          { param: 'charge', kind: 'range', min: 1, max: 1000 },
          { param: 'bandwidth', kind: 'range', min: 100, max: 400 },
          { param: 'accuracy', kind: 'range', min: 3, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/hv-test-bench/charge-amp', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/pd-peak-detector', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/pd-rate-meter', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/cal-capacitor', qty: q(2) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/pd-test-cell',
      'plant/hv-test-bench/pd-calibrator-reference',
    ],
    steps: [
      {
        note_zh:
          '① 装配：50 Ω 同轴输入、量程开关、带通滤波、峰值保持/率表，整套装进铝屏蔽盒，单点接地；高压端与低压端间距 ≥10 mm',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '② 带通与量程标定：用 `pd-calibrator-reference` 依次注入 10/50/100 pC，调带通到 100–400 kHz、量程到 1:1/10:1；每点读 3 次，算刻度 pC/V 与线性',
        performedBy: 'plant/hv-test-bench',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 检验：零点/噪声 ≤1–2 pC；线性 ±5 %；效率与 `pd-uncertainty.ts` 的预算一致（U@1 pC = 1.317 pC）。**记录实测值，不改设计窗口**',
        performedBy: 'plant/hv-test-bench',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      '电荷放大器 1 + 峰值保持 1 + 率表 1 + 电容 2 + DVM 1 + 控制板 1 + 运放 2 + 薄膜电容 4 + 电阻丝 0.05 + 铝 2 + 铜线 0.2 + PCB 1 → 检测仪 1；余是屏蔽盒/接头/调试废品。charge 1–1000 pC、100–400 kHz、±3–5 % 是设计值（Earth 工程值），不是实测；1 pC 处 U=1.317 pC 的判不了与 pd-uncertainty.ts 同一笔账',
  },

  {
    /**
     * **IEC 60270 局放检测仪 B —— 第二台独立整机（A/B 互比用）。**
     *
     * 与 A 的差别（不是同一批的复制）：
     *
     *   · 读数路径不同：B 走 1 Hz 趋势记录器（`make/pd-logger`）直接存 q(t)，
     *     不用 A 的率表；量程切换由记录器通道做；
     *   · 输入分压/反馈电容用另一对 100 pF（各自的几何证书），不与 A 共用；
     *   · 外壳、接地与输入接头单独做。
     *
     * 相同点：电荷放大器与峰值保持是同一张工艺（`make/charge-amp` /
     * `make/pd-peak-detector`），所以**共同偏差查不出** —— 与
     * `make/standard-capacitor-100pf-pair` 的"同批两只"同一口径。
     * 真正的第二套独立溯源仍得进口；本条只把"第二台能本地造"写清。
     */
    id: 'make/pd-detector-iec60270-b',
    name: 'IEC 60270 局放检测仪 B 制造',
    produces: [
      {
        item: 'plant/hv-test-bench/pd-detector-iec60270-b',
        qty: q(1),
        gives: [
          { param: 'charge', kind: 'range', min: 1, max: 1000 },
          { param: 'bandwidth', kind: 'range', min: 100, max: 400 },
          { param: 'accuracy', kind: 'range', min: 3, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/hv-test-bench/charge-amp', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/pd-peak-detector', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/pd-logger', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/cal-capacitor', qty: q(2) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(3) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/pd-test-cell',
      'plant/hv-test-bench/pd-calibrator-reference-b',
    ],
    steps: [
      {
        note_zh:
          '① 装配：B 自己的 50 Ω 输入与屏蔽盒；峰值保持输出接 `pd-logger` 的 q 通道，记录器按 1 Hz 存 q(t)，量程由记录器通道切',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '② 带通与量程标定：用 `pd-calibrator-reference-b` 注入 10/50/100 pC，各读 3 次；B 的刻度只用自己的证书，不引用 A 的读数',
        performedBy: 'plant/hv-test-bench',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ A/B 互比的独立性检查：把 A、B 的读数差写成 `measure/pd-intercompare` 的输入；**共同偏差（同一张 charge-amp/峰值保持工艺）记在注释里，不改称独立溯源**',
        performedBy: 'plant/hv-test-bench',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      '电荷放大器 1 + 峰值保持 1 + 记录器 1 + 电容 2 + DVM 1 + 控制板 1 + 运放 2 + 薄膜电容 3 + 电阻丝 0.05 + 铝 2 + 铜线 0.2 + PCB 1 → 检测仪 B 1；余是屏蔽盒/接头/调试废品。与 A 共用 charge-amp 与峰值保持工艺，共同偏差查不出；要真正独立的第二套仍得进口',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...UHF_PD_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...UHF_PD_ROUTES];
