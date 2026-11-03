/**
 * 可溯源套刻的**标定级** DBO —— 一台只用来定值、不用来测产品片的套刻量具。
 *
 * 本文件建 `plant/overlay-traceable` 与它的四件零件、五条制造路线。测量路线与
 * 记录在 `data/measure/overlay-atw.ts`（R13：机器在 machine、测量与记录在 measure）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、为什么不是把 `plant/overlay-metrology` 再写一遍
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 生产量具 `plant/overlay-metrology`（`data/measure/optical-metrology.ts`）已经能测片：
 * NA 0.85–0.9 物镜 + `plant/metrology-ccd` + `plant/euv-stepper-hina/stage` 的 0.5 nm
 * 台，`measure/overlay-dbo` 出 `mat/overlay-record-traceable`。它解的是「0.1 µm 的
 * CD-SEM vernier 读不到亚纳米」（差 200 倍）这一档。
 *
 * 但**生产量具不能给标准片定值**：它的读数就是「相对标准片的差」。标准片由
 * `make/overlay-standard` 用 e-beam 写 0/2/5/10 nm、CD-SEM 交叉标定；CD-SEM 的
 * 绝对准确度 1.5 nm（`plant/cd-sem` 的 `cdAccuracy`）是这条链的上游。要把
 * 「标准片可溯源」写成一份可查的定值记录，需要一台只做定值与传递的量具 ——
 * 它不进产品线，做三件事：
 *
 *   ① 读标准片的四点（0/2/5/10 nm），把「标准片的实际偏移」定出来；
 *   ② 用 CD-SEM 复读同一组靶的边，把合成误差拆成 **e-beam 写入位置** 与
 *      **SEM 边缘判定** 两项（`make/overlay-standard` 只给一个合成数 0.2–0.3 nm，
 *      没有分开）；
 *   ③ 0.5 nm 台用 X 射线干涉仪校到 Si (111) 的 0.3135 nm 晶格周期，让
 *      「点距 ≤30 nm」这一格有长度来源，而不是「台说自己 0.5 nm」。
 *
 * 分工一句话：**生产量具测片，标定级量具定值。** 标准片不能由它校准的那台
 * 机器来校准（自指），这是两台设备都要存在的理由，不是重复。
 *
 *   生产台 `plant/overlay-metrology`      标定台 `plant/overlay-traceable`
 *   ─────────────────────────────────────────────────────────────
 *   被测片    产品片（每片 10 点）           标准片（0/2/5/10 nm 四点）
 *   台        步进台 `plant/euv-stepper-hina/stage`（300 mm，0.5 nm）
 *                                          自带激光尺台（100 mm，0.5 nm，X 射线校）
 *   0.5 nm 来源  台自带的干涉读数            Si (111) 晶格 0.3135 nm
 *   输出      `mat/overlay-record-traceable`  `mat/overlay-traceable-record`
 *   判据      片的 overlay 落在哪             链的 U(k=2) 落在哪
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、光学口径：为什么是成像式、为什么 NA 0.9
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `std/overlay-standard` 的靶是 **box-in-box**（外框 / 内框，周期 2–10 µm），
 *   偏移 0/2/5/10 nm。这不是衍射光栅：450–650 nm 的光在 20–30 nm 周期上连
 *   一级都传不出去（λ/P = 15–32 > 1），所以「点距 30 nm」**不是靶周期**，
 *   是**取样步距**（见下）。这一条写死在这里，免得把两个 30 nm 读成同一个：
 *
 *   · 靶周期 2–10 µm      —— 由标准片定，NA 0.9 在 450–650 nm 收得下 ±1 级；
 *   · 点距 ≤30 nm         —— 由台步进定，每 30 nm 读一次相位/重心；
 *   · 横向分辨 0.61λ/NA   —— 0.31–0.44 µm，只用来把 5–10 µm 的盒边成像。
 *
 *   盒中心由边缘重心拟合：一盒两边、单边 200 个像素、单像素噪声 0.5 nm
 *   ⇒ 单边 0.5/√200 = **0.035 nm**，两边 → 0.025 nm；10 点平均 → 0.008 nm。
 *   这是 A 类项的算法；系统项（边缘模型、相机非线性）另记在 uTool 里。
 *
 *   点距 30 nm 与 0.15 mm 视场 / 2001 像素（75 nm/px）的关系是 2.5× 过采样：
 *   台每移 30 nm 采一帧，盒边位置在亚像素上解出来。**过采样不提高分辨率，
 *   只把台的长尺度误差压成共模** —— 这正是「0.5 nm 台 + 30 nm 点距」能给出
 *   0.05–0.08 nm 重复性的原因。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、不确定度分配：从标准片到读数（k=1，单位 nm）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   项                                      窗口         来源
 *   ─────────────────────────────────────────────────────────────────
 *   uEbeam   e-beam 写入位置（差分）          0.03–0.05   100 µm 场内两组 box 的
 *                                                        差分；DAC 与场畸变是共模
 *   uSem     SEM 边缘判定（共模抵消后）        0.13–0.18   4 nm 束斑、0.05 nm 内插；
 *                                                        1.5 nm 绝对准确度是共模，
 *                                                        不进差分
 *   uZero    0 nm 点的零点                    0.05–0.10   0 点由 SEM 边缘定，不是
 *                                                        计量院证书
 *   uStandard = RSS(上三项)                  0.14–0.21   ← 标准片的定值项
 *   uTool    DBO 边缘模型 + 相机读出           0.05–0.08
 *   uStage   激光尺台（只进点间定位）           0.03–0.06
 *   uRepeat  10 点重复性（1σ）                 0.03–0.05
 *   uCombined = RSS(上四项)                  0.16–0.24
 *   U = 2·uCombined（k=2，约 95 %）          0.32–0.48   → 记录窗口 0.3–0.5
 *
 *   算法核一遍（两端）：
 *     uStandard,min = √(0.03²+0.13²+0.05²) = √0.0203 = 0.142
 *     uStandard,max = √(0.05²+0.18²+0.10²) = √0.0449 = 0.212
 *     uCombined,min = √(0.142²+0.05²+0.03²+0.03²) = 0.157
 *     uCombined,max = √(0.212²+0.08²+0.06²+0.05²) = 0.238
 *     U ∈ [0.31, 0.48] → 记录窗口写 0.3–0.5（两端各留 0.02 取整）。
 *
 *   **1.5 nm 的 CD-SEM 绝对准确度为什么不进这条链**：两组 box 写在同一
 *   100 µm 场、读在同一幅 SEM 像里，束流/放大倍率/工作距的漂移是**共模**，
 *   相减就掉了。进差分的只有「边缘判定」这一项（0.13–0.18 nm），所以 0.5 nm
 *   这一档不靠「SEM 准到 1.5 nm」，靠「同幅内两边之差」。这一句是整条链的
 *   支点，也是它与「送计量院证书」之间的真实差距（见第六节）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、零件与路线（一条整机、四件专用件）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   零件                                路线                          关键数
 *   物镜 `.../objective`                `make/overlay-traceable-objective`
 *                                                                     NA 0.9、视场 0.08–0.15 mm
 *   激光尺台 `.../stage`                `make/overlay-traceable-stage`
 *                                                                     100 mm、0.5 nm、50–80 nm/100 mm
 *   照明 `.../illuminator`              `make/overlay-traceable-illuminator`
 *                                                                     450–650 nm、消光 25–40 dB
 *   温控罩 `.../enclosure`              `make/overlay-traceable-enclosure`
 *                                                                     0.02–0.05 K、隔声 25–35 dB
 *   整机 `plant/overlay-traceable`      `make/overlay-traceable`
 *                                                                     U 0.3–0.5、点距 20–30 nm
 *
 *   共用件不重造：`plant/metrology-ccd`（计量相机）、`std/computer-general`、
 *   `std/opamp-chip-general`、`std/counter-chip-general`、`std/overlay-standard`
 *   （标定用标准片，不消耗）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、温控与「0.5 nm 到底靠什么成立」
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `plant/metrology-room` 维持 19–21 °C（±0.5 K，双金属片 + 继电器）。钢架
 *   α = 12 ppm/K：0.05 K 在 100 mm 上是 **60 nm** —— 看起来把 0.5 nm 吃掉了。
 *   但 overlay 是**靶内的差**，跨距 5–10 µm：
 *
 *     12×10⁻⁶/K × 0.05 K × 10 µm = **0.006 nm**
 *
 *   所以热膨胀对 overlay 是共模；对「点距 30 nm」的尺度是
 *   12×10⁻⁶ × 0.05 × 30 nm = **1.8×10⁻⁵ nm**，更无所谓。温控罩真正保的是
 *   **相机暗电流与边缘模型**（0.02–0.05 K 让 10 组读数的漂移 ≤0.05 nm），
 *   不是几何。这一条与 `ref-flat.ts` 的「先配对，再谈精度」是同一个道理：
 *   能共模的项不要靠控温去压。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、缺口（按 R7 记量级，不写「造不出」）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **e-beam 差分写入 0.03–0.05 nm 是设计值**，没有独立验证：要一片
 *      「已知 2 nm 偏移」的更高一级标准（计量院或 NIST 型），本层没有；
 *      差多少无法自证，只能记设计值。
 *   ② **SEM 边缘判定 0.13–0.18 nm 是链的主项**（占 uCombined² 的 56–66%）：
 *      0 nm 零点 0.05–0.10 只占 10–17%。要 U 压到 0.20 这一档（uCombined 0.10），
 *      uSem 得压到 ≤0.05 nm —— 差 2.6–3.6 倍，要一张 0 nm 的绝对证书。
 *   ③ **没有 CNAS / 原厂校准**：记录是自校链，不是认可实验室证书。
 *   ④ **CD-SEM 的 1.5 nm 绝对准确度仍是上游**：本文件只把它做成共模去掉，
 *      没有消掉它 —— 一旦两组 box 写在不同场（>100 µm），1.5 nm 就进差分，
 *      0.5 nm 这一档立刻不成立。标准片的版图因此把四点全放在同一场内。
 *   ⑤ **温控罩只到 0.02–0.05 K**：0.52 nm 的可见光基准（`ref-flat.ts`）要
 *      6×10⁻⁴ K 才谈绝对面形，那条结论不适用于 overlay（差的是靶内 10 µm），
 *      但也不要把本文件的 0.05 K 误读成「能测绝对面形」。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目
// ═══════════════════════════════════════════════════════════════════════════

export const OVERLAY_ITEMS: readonly Item[] = [
  /**
   * 标定级 DBO 的成像物镜。**NA 0.85–0.9、50–100×、工作距 0.8–1.5 mm。**
   *
   * 它只做一件事：把 `std/overlay-standard` 的 5–10 µm 盒边成像到计量相机上，
   * 让边缘重心能被解到 0.03 nm 级（200 像素平均）。NA 0.9 给的是
   * 0.61λ/NA = 0.31–0.44 µm 的横向分辨 —— 盒边是 0.3–0.5 µm 宽的台阶，
   * 刚好落在分辨极限上；再高 NA 没有意义（衍射斑已经小于边缘特征），
   * 再低就糊到盒内。
   *
   * 4 片熔石英 + 2 片玻璃，离子束修形。NA 0.9 是设计值，像差没有实测
   * （`plant/ion-beam-figuring` 修完只做波前 λ/8 的干涉检验）。
   *
   * ⚠️ 生产台的 `plant/overlay-metrology/objective` 与本件同样是 NA 0.9，
   * 但不是同一件：生产台要在 26 mm 单场里逐点移过 10×10 die（视场 0.08–0.15 mm
   * 靠台走），标定台只装一片标准片的四点，视场压到 0.05–0.15 mm 是为了
   * **把畸变压小**（视场小一半，畸变小 4 倍）。两件不能互换。
   */
  {
    id: 'plant/overlay-traceable/objective',
    name: 'Overlay Calibration-Grade DBO Objective', name_zh: '套刻标定级 DBO 物镜',
    unit: '件',
    category: 'part',
    props: [
      { param: 'na', kind: 'range', min: 0.85, max: 0.92, unit: 'NA', dir: 'atLeast' },
      { param: 'magnification', kind: 'range', min: 50, max: 120, unit: '倍', dir: 'atLeast' },
      { param: 'workingDistance', kind: 'range', min: 0.8, max: 1.5, unit: 'mm' },
      { param: 'fieldOfView', kind: 'range', min: 0.05, max: 0.15, unit: 'mm', dir: 'atLeast' },
    ],
  },

  /**
   * 激光尺台。**行程 100–120 mm、读数 0.5 nm、直线度 50–80 nm/100 mm。**
   *
   * 它是「点距 ≤30 nm」这一格的唯一长度来源：
   *
   *   行程      100 mm 够放一片 φ100 标准片的四点（0/2/5/10 nm 四组靶
   *             间隔 2–6 mm），不需要步进台的 300 mm；
   *   读数      0.5 nm 是**读数分辨率**，不是定位误差；点距 30 nm 靠它
   *             与激光尺的整数条纹计数给出；
   *   直线度    50–80 nm/100 mm = 0.5–0.8 µm/m，正好是
   *             `plant/laser-straightness` 的地板（0.5–2 µm/m）；
   *   漂移      0.2–0.5 nm/h，靠温控罩 0.02–0.05 K 与花岗岩/铸铁底座。
   *
   * 标定链：X 射线干涉仪读 Si (111) 的 0.3135 nm 周期，0.5 nm = 1.5947 个
   * 周期（小数相位 214°）；10 点跨 100 mm，回零重复性 ≤0.5 nm。**0.5 nm
   * 是从晶格来的，不是台自己说的** —— 这是「可溯源」三个字在本文件里的
   * 唯一硬支点。
   *
   * 台与生产台的 `plant/euv-stepper-hina/stage` 是两个件：那一台是 300 mm
   * 步进台（带位置闭环），这一台是 100 mm 计量台（带激光尺读数与 X 射线
   * 标定）。同是 0.5 nm，一个是「能走到」，一个是「知道走了多少」。
   */
  {
    id: 'plant/overlay-traceable/stage',
    name: 'Overlay Traceability System Laser Scale Stage', name_zh: '套刻溯源装置激光尺台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'readout', kind: 'range', min: 0, max: 0.5, unit: 'nm', dir: 'atMost' },
      { param: 'stroke', kind: 'range', min: 0, max: 120, unit: 'mm', dir: 'atLeast' },
      { param: 'straightness', kind: 'range', min: 0, max: 80, unit: 'nm/100mm', dir: 'atMost' },
      { param: 'drift', kind: 'range', min: 0, max: 0.5, unit: 'nm/h', dir: 'atMost' },
    ],
  },

  /**
   * 多波长明场照明。**450–650 nm、相干长度 10–30 µm、消光比 25–40 dB。**
   *
   * 白光 LED + 四支窄带（450/532/590/650 nm）可切换：短波长给边缘对比度，
   * 长波长给膜内干涉的相位（标准片上的胶/氧化层厚度会改变边缘模型）。
   * 相干长度压到 10–30 µm（转盘漫射 + 多纵模）是为了**消掉盒内的散斑**：
   * 散斑的空间对比度会把边缘重心拉偏 0.05–0.15 nm，正好是本文件要的档。
   *
   * 消光比 25–40 dB 由偏振片 + 波片给出，用于把照明光瞳里的 ±1 级与 0 级
   * 分开（成像式的边缘模型需要已知的相干度，不是「越亮越好」）。
   */
  {
    id: 'plant/overlay-traceable/illuminator',
    name: 'Overlay Traceability System Multi-Wavelength Bright-Field Illumination', name_zh: '套刻溯源装置多波长明场照明',
    unit: '件',
    category: 'part',
    props: [
      { param: 'wavelength', kind: 'range', min: 400, max: 700, unit: 'nm' },
      { param: 'coherenceLength', kind: 'range', min: 5, max: 50, unit: 'µm' },
      { param: 'extinctionRatio', kind: 'range', min: 20, max: 40, unit: 'dB', dir: 'atLeast' },
    ],
  },

  /**
   * 温控/隔声罩。**罩内 0.02–0.05 K、隔声 25–35 dB。**
   *
   * 它罩住物镜、相机、台与一片标准片：外层 1 mm 铝板 + 20 mm 矿棉，
   * 内层 Peltier + 热敏电阻闭环（死区 0.02 K），门缝用磁性胶条。
   * 隔声 25–35 dB 针对 20–200 Hz 的地面振动与空调噪声 —— 相机在 0.5 s
   * 曝光里对 0.1 µm 的位移敏感：0.1 µm 在 100× 下是 10 µm 像移（≈1.3 个
   * 像方像素；75 nm 是物方像素，×100 到像方是 7.5 µm），边缘重心的系统
   * 偏置会进到 0.05 nm 那一档。
   *
   * ⚠️ 罩子不是「更高精度的恒温间」：`plant/metrology-room` 的 ±0.5 K 已经
   * 够 overlay（见文件头第五节的热膨胀账），罩子的 0.02–0.05 K 是为**相机与
   * 边缘模型的漂移**，不是为几何。两者不是同一件事，不能互相替代。
   */
  {
    id: 'plant/overlay-traceable/enclosure',
    name: 'Overlay Traceability System Temperature-Controlled/Soundproof Enclosure', name_zh: '套刻溯源装置温控/隔声罩',
    unit: '件',
    category: 'part',
    props: [
      { param: 'temperatureStability', kind: 'range', min: 0, max: 0.1, unit: 'K', dir: 'atMost' },
      { param: 'acousticAttenuation', kind: 'range', min: 20, max: 40, unit: 'dB', dir: 'atLeast' },
    ],
  },

  /**
   * **可溯源套刻的标定级 DBO。** 交付 overlay 不确定度 **0.3–0.5 nm**（k=2）、
   * 点距 **20–30 nm**、台读数 **0.5 nm**。
   *
   * 四件专用件（物镜 / 台 / 照明 / 罩）+ 计量相机 + 计算机 + 运放 + 计数器
   * 装成一台。它不做产品片：只读 `std/overlay-standard` 的 0/2/5/10 nm 四点，
   * 出 `mat/overlay-traceable-record`（`data/measure/overlay-atw.ts`）。
   *
   * ⚠️ **0.3–0.5 nm 是设计值（Earth 工程值）**，不是实测：`make/overlay-traceable`
   * 的 `gives` 写 0.3–0.5，记录条目写窗口 0.3–0.5；没有一份 `data/measure/`
   * 记录之前，按证据等级只有 L0–L2。
   */
  {
    id: 'plant/overlay-traceable',
    name: 'Overlay Traceability System', name_zh: '套刻溯源装置',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'na', kind: 'range', min: 0.8, max: 0.95, unit: 'NA', dir: 'atLeast' },
      { param: 'overlayUncertainty', kind: 'range', min: 0, max: 0.5, unit: 'nm', dir: 'atMost' },
      { param: 'measure/pointPitch', kind: 'range', min: 10, max: 30, unit: 'nm', dir: 'atMost' },
      { param: 'stageReadout', kind: 'range', min: 0, max: 0.5, unit: 'nm', dir: 'atMost' },
      { param: 'measure/wavelength', kind: 'range', min: 450, max: 650, unit: 'nm' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线
// ═══════════════════════════════════════════════════════════════════════════

export const OVERLAY_ROUTES: readonly Route[] = [
  {
    /**
     * **标定级物镜：熔石英 2 + 玻璃 0.5 + 45 钢 0.5 + 铝 0.1 + 氧化铝 0.2 + 水 10
     * → 物镜 1 件。**
     *
     * 4 片熔石英 + 2 片玻璃，NA 0.9、视场 0.08–0.15 mm。工序：粗磨/手抛 →
     * 离子束修形（0.05–0.5 Pa）→ 干涉检验（波前 ≤λ/8）。
     *
     * 视场 0.08–0.15 mm 是「一片标准片四点」的最小值：四点间隔 2–6 mm，
     * 物镜只要把单个 10 µm 的盒装满视场，靠台移点；视场越小畸变越小
     * （畸变 ∝ 视场²，0.15/0.3 的一半 → 1/4）。
     */
    id: 'make/overlay-traceable-objective',
    name: 'Overlay Calibration-Grade DBO Objective Manufacturing', name_zh: '套刻标定级 DBO 物镜制造',
    produces: [
      {
        item: 'plant/overlay-traceable/objective',
        qty: q(1),
        gives: [
          { param: 'na', kind: 'range', min: 0.85, max: 0.9 },
          { param: 'magnification', kind: 'range', min: 50, max: 100 },
          { param: 'workingDistance', kind: 'range', min: 0.8, max: 1.5 },
          { param: 'fieldOfView', kind: 'range', min: 0.08, max: 0.15 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(2) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(180) },
    steps: [
      {
        note_zh: '粗磨/手抛 6 片：面形 λ/4，厚度/曲率按设计值；每片留 0.2 mm 给修形',
        performedBy: 'plant/grinder',
      },
      {
        note_zh:
          '离子束修形：0.05–0.5 Pa，非球面 0.5–1 nm；逐片装调偏心 ≤1 µm',
        performedBy: 'plant/ion-beam-figuring',
        under: [{ param: 'pressure', min: 0.05, max: 0.5 }],
      },
      {
        note_zh: '干涉检验：NA 0.85–0.9、视场 0.08–0.15 mm、波前 ≤λ/8；畸变 ≤0.02 %',
        performedBy: 'plant/interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **激光尺台：钢板 12 + 铝 3 + 铜 0.5 + 铜线 0.1 + 水 5 → 台 1 件。**
     *
     * 行程 100–120 mm、读数 0.5 nm、直线度 50–80 nm/100 mm、漂移
     * 0.2–0.5 nm/h。
     *
     * 工序：铣床身与导轨面 → 研磨导轨 → 激光直线度检（0.5–0.8 µm/m）→
     * X 射线干涉仪标 0.5 nm（10 点 / 100 mm，回零 ≤0.5 nm）→ 装读数头。
     *
     * 直线度的 50–80 nm/100 mm 与 `plant/laser-straightness` 的 0.5–2 µm/m
     * 是对得上的：50 nm/100 mm = 0.5 µm/m，正好在那台的地板上。**比它更好的
     * 直线度本层没有量具**，所以不写 30 nm/100 mm。
     */
    id: 'make/overlay-traceable-stage',
    name: 'Overlay Traceability System Laser Scale Stage Manufacturing', name_zh: '套刻溯源装置激光尺台制造',
    produces: [
      {
        item: 'plant/overlay-traceable/stage',
        qty: q(1),
        gives: [
          { param: 'readout', kind: 'range', min: 0.5, max: 0.5 },
          { param: 'stroke', kind: 'range', min: 100, max: 120 },
          { param: 'straightness', kind: 'range', min: 50, max: 80 },
          { param: 'drift', kind: 'range', min: 0.2, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(12) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(3) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(140) },
    steps: [
      {
        note_zh: '铣床身与导轨面：钢板 12 kg，导轨面留 0.1 mm 研磨余量',
        performedBy: 'plant/milling-machine',
      },
      {
        note_zh: '研磨导轨与滑块：0.5 µm 碳化硅 + 铸铁研具，8 字轨迹；配合间隙 ≤1 µm',
        performedBy: 'plant/grinder',
      },
      {
        note_zh:
          '激光直线度：0.5–0.8 µm/m，1 m 行程 5 点；翻转法消光束静态弯曲',
        performedBy: 'plant/laser-straightness',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          'X 射线干涉仪标 0.5 nm：Si (111) 0.3135 nm 周期，0.5 nm = 1.5947 周期（小数相位 214°）；10 点跨 100 mm，回零重复性 ≤0.5 nm',
        performedBy: 'plant/xray-interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装激光尺读数头与光栅：阿贝臂 ≤20 mm；漂移 0.2–0.5 nm/h（罩内 0.02–0.05 K）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **照明：玻璃 0.5 + 铝 0.5 + 铜线 0.05 + 水 2 → 照明 1 件。**
     *
     * 450–650 nm、相干长度 10–30 µm、消光比 25–40 dB。
     *
     * 白光 LED + 四支窄带 + 转盘漫射（相干长度）+ 偏振片/波片（消光比）。
     * 漫射盘的转速 300–600 rpm：一个 0.5 s 曝光里转过 ≥2.5 圈，每转扫过约
     * 1000 个相关元 ⇒ N ≈ 2500 个独立散斑，对比度 ≈ 1/√N = **2 %**。
     */
    id: 'make/overlay-traceable-illuminator',
    name: 'Overlay Traceability System Multi-Wavelength Bright-Field Illumination Manufacturing', name_zh: '套刻溯源装置多波长明场照明制造',
    produces: [
      {
        item: 'plant/overlay-traceable/illuminator',
        qty: q(1),
        gives: [
          { param: 'wavelength', kind: 'range', min: 450, max: 650 },
          { param: 'coherenceLength', kind: 'range', min: 10, max: 30 },
          { param: 'extinctionRatio', kind: 'range', min: 25, max: 40 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(40) },
    steps: [
      {
        note_zh: '清洗光学件：碱洗/酸洗/去离子水冲/甩干；胶合透镜用环氧，24 h 固化',
        performedBy: 'plant/wet-bench',
      },
      {
        note_zh: '装 LED/窄带滤光/漫射盘：漫射盘 300–600 rpm，0.5 s 曝光转 ≥2.5 圈',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '偏振片 + λ/4 波片装调：消光比 25–40 dB（光电二极管读数）；光瞳共轭 ≤0.5 mm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **温控/隔声罩：钢板 20 + 铝 5 + 铜线 0.2 + 水 2 → 罩 1 件。**
     *
     * 罩内 0.02–0.05 K、隔声 25–35 dB。外层 1 mm 铝板 + 20 mm 矿棉，
     * 内层 Peltier + 热敏电阻，门缝磁性胶条。
     */
    id: 'make/overlay-traceable-enclosure',
    name: 'Overlay Traceability System Temperature-Controlled/Soundproof Enclosure Manufacturing', name_zh: '套刻溯源装置温控/隔声罩制造',
    produces: [
      {
        item: 'plant/overlay-traceable/enclosure',
        qty: q(1),
        gives: [
          { param: 'temperatureStability', kind: 'range', min: 0.02, max: 0.05 },
          { param: 'acousticAttenuation', kind: 'range', min: 25, max: 35 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(60) },
    steps: [
      {
        note_zh: '折弯/焊框：1 mm 钢板外壳 + 铝内衬 1.2×0.9×1.0 m，门框加磁性胶条座',
        performedBy: 'plant/milling-machine',
      },
      {
        note_zh: '贴 20 mm 矿棉 + 内衬；装 Peltier 4 片（每片 60 W）与热敏电阻 3 只',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '闭环整定：死区 0.02 K，超调 ≤0.01 K；门开 10 s 后回稳 ≤3 min',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **整机：物镜 1 + 台 1 + 照明 1 + 罩 1 + 计量相机 1 + 计算机 1 + 运放 2
     * + 计数器 1 + 钢板 5 + 铝 2 + 水 5 → 标定级 DBO 1 台。**
     *
     * 交付：na 0.85–0.9、overlayUncertainty 0.3–0.5 nm、pointPitch 20–30 nm、
     * stageReadout 0.5 nm、wavelength 450–650 nm。
     *
     * 工序：装物镜/相机/照明/台到铸铁平台 → 对光轴（垂直 ≤1 µm/100 mm）→
     * X 射线校台 → 用 `std/overlay-standard` 做系统测试 → 编号。
     *
     * ⚠️ 系统测试那一步只**验证**量具，不产出记录 —— 记录由
     * `measure/overlay-traceable` 出（测量与记录只放 `data/measure/`，R13）。
     */
    id: 'make/overlay-traceable',
    name: 'Overlay Traceability System Assembly', name_zh: '套刻溯源装置装配',
    produces: [
      {
        item: 'plant/overlay-traceable',
        qty: q(1),
        gives: [
          { param: 'na', kind: 'range', min: 0.85, max: 0.9 },
          { param: 'overlayUncertainty', kind: 'range', min: 0.3, max: 0.5 },
          { param: 'measure/pointPitch', kind: 'range', min: 20, max: 30 },
          { param: 'stageReadout', kind: 'range', min: 0.5, max: 0.5 },
          { param: 'measure/wavelength', kind: 'range', min: 450, max: 650 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/overlay-traceable/objective', qty: q(1) }] },
      { anyOf: [{ item: 'plant/overlay-traceable/stage', qty: q(1) }] },
      { anyOf: [{ item: 'plant/overlay-traceable/illuminator', qty: q(1) }] },
      { anyOf: [{ item: 'plant/overlay-traceable/enclosure', qty: q(1) }] },
      { anyOf: [{ item: 'plant/metrology-ccd', qty: q(1) }] },
      { anyOf: [{ item: 'std/computer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room', 'std/overlay-standard'],
    rate: { hours: q(240) },
    steps: [
      {
        note_zh:
          '装物镜/相机/照明/台：物镜与台共装铸铁平台，光轴与台面垂直 ≤1 µm/100 mm；相机在物镜像面（0.15 mm 视场 / 2001 px = 75 nm/px）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '对光轴与视场：NA 0.85–0.9、视场 0.08–0.15 mm；照明光瞳与物镜入瞳共轭 ≤0.5 mm',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '台标定：X 射线干涉仪读 0.5 nm 步进，100 mm 行程 10 点；回零重复性 ≤0.5 nm，阿贝臂 ≤20 mm',
        performedBy: 'plant/xray-interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '系统测试：`std/overlay-standard` 0/2/5/10 nm 四点，10 点/片；U(k=2) 0.3–0.5 nm、点距 20–30 nm（设计值）',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh:
          '编号、写铭牌与自校记录：台读数 0.5 nm、点距 20–30 nm、U 0.3–0.5（设计值）；证书另计',
        performedBy: 'plant/robot',
      },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...OVERLAY_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...OVERLAY_ROUTES];
