/**
 * 栅氧完整性（GOI）的两条测量路线 —— **铜装饰法** 与 **电压斜坡法**。
 * 单独放 `data/measure/`（R13）：本文件只放测量路线与 `*-record` 条目。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 现状与要补的洞
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `measure/si3n4-vbd` 只在探针压住的 100×100 µm pad 上测 I-V。它给的是
 * **一个点的 Vbd**，不是整片的 pinhole 密度；探针面积 1e-4 cm²，要把
 * 0.01 /cm² 的针孔密度测出来，得压 1e6 个点 —— 不是“再测细一点”能到的。
 *
 * 本文件补两条**整片**方法：
 *
 *   measure/goi-copper-decoration  铜装饰 → 暗场计数 → SEM 定径
 *     → mat/goi-pinhole-record    针孔密度 0.01–10 /cm²、孔径 0.3–50 µm
 *
 *   measure/goi-vramp              0–200 V 线性升压、逐点漏电 → Weibull
 *     → mat/goi-vramp-record       Vbd 0–200 V、Ebd 5–12 MV/cm、β 1–3
 *
 * 两条**互补，不互相替代**：
 *   · 铜装饰直接数“有几处、多大”，是密度的**直接读数**；
 *   · V-ramp 给“多高场会坏、分布多宽”，是击穿场的**统计读数**；
 *     它不直接数针孔 —— 一个针孔不一定在 200 V 内击穿，但低场击穿
 *     事件数 / 面积是针孔密度的**下限**，不是等号。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、铜装饰法：针孔密度能测到多少
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 原理：铜阳极在去离子水里溶解，Cu²⁺ 在电场下迁移到片表面；有氧化层
 * 的地方不导电，只有针孔处露出的硅/衬底是阴极，Cu²⁺ 在那里还原成铜点。
 * 装饰后铜点比针孔大 1–3 倍，用暗场计数或 SEM 数点。
 *
 * 设计值（Earth 工程值）：
 *
 *   片          φ100–150 mm；面积 78.54–176.7 cm²
 *   偏置        1–10 V（电源量程 0–100 V）
 *   电流        0.1–100 µA（表量程 1 nA–1 mA）
 *   时间        1–10 min
 *   水          18 MΩ·cm，5 L
 *   阳极        铜 99.5–99.9 %，50×50×1 mm
 *
 * ── 密度窗口：0.01–10 /cm²，但三个段要分开说 ─────────────────────────
 *
 *   ① **检出下限**：φ100 上 1 颗 = 1/78.54 = **0.0127 /cm²**；φ150 上
 *      1 颗 = **0.0057 /cm²**。所以 0.01 /cm² 是**两档片合并**的方法下限，
 *      不是每片都能报到 0.01：φ100 单片的实际下限是 0.013，φ150 是 0.006。
 *   ② **定量段 0.1–10 /cm²**：泊松 1σ = 1/√N。
 *        φ100、0.1 /cm²：N = 7.9，1σ = **36 %**；要到 30 % 需 N ≥ 11
 *          ⇒ 0.14 /cm²；
 *        φ100、1 /cm²：N = 78.5，1σ = **11 %**；
 *        φ150、10 /cm²：N = 1767，1σ = **2.4 %**。
 *      所以“0.1–10 定量”是 10–40 % 的窗口，不是 1 % 的窗口。
 *   ③ **上限 10 /cm²**：φ150 上 1767 个铜点，1 µm 点的覆盖率为
 *      1767×π(0.5 µm)²/176.7 cm² = **7.9e-4**，重叠可忽略；上限由
 *      计数器动态范围与“铜点连成片”定，不由光学分辨定。>10 /cm² 记
 *      “>10”，不报具体数（铜点开始连片，计数变成面积覆盖率）。
 *
 * ── 孔径窗口：0.3–50 µm ────────────────────────────────────────────────
 *
 *   下限 0.3 µm：铜点被放大 1–3 倍，0.3 µm 针孔给出 0.3–1 µm 铜点，
 *     `plant/cd-sem`（2–4 nm 束）能定径；更小的针孔（0.1–0.3 µm）也能
 *     看见点，但直径定不准（±0.1 µm 已经和孔径同量级），所以不写进窗口。
 *   上限 50 µm：再大就是“大孔/裂纹/划伤”，不是针孔；按另一类缺陷记，
 *     不混进密度。
 *   定径不确定度：0.3–1 µm 段 ±0.1 µm；1–10 µm 段 ±0.3 µm；
 *     10–50 µm 段 ±2 µm（SEM 视场拼接的边缘误差）。
 *
 * ── 与颗粒计数的衔接（设计值）─────────────────────────────────────────
 *
 *   本轮用**已注册**的 `plant/particle-counter`（0.09–0.10 µm、18 h/片、
 *   表面暗场）。`plant/particle-counter-uv`（0.05–0.10 µm、5 h/片）确实
 *   已在 `data/machine/semiconductor-metrology.ts` 里建好，但它的导出
 *   **没有注册进 `tools/report/data.ts`**（grep 该文件 0 命中）；本轮只加
 *   两行 import，所以不用它。若下一轮把它注册进来，可以
 *   **原位替换**旧机的全片扫描：0.05 µm、5 h/片，密度下限不变、粒径细一档。
 *
 *   针孔不是颗粒的 1:1 复制。设计关系取
 *
 *       D_pinhole = η · D_particle
 *
 *     ≥0.1 µm 颗粒：η = **0.01–0.3**
 *
 *   η 为什么这么小：颗粒大多在清洗时被冲掉、或在沉积时被埋进膜里；
 *   只有落在膜表面、且是导电/耐蚀的颗粒（或它留下的阴影）才会变成
 *   针孔。η 的 0.01–0.3 是**设计值**，不是实测；本路线把每片的
 *   D_particle 与 D_pinhole 同时记进 `mat/goi-pinhole-record`，η 就是
 *   这两个读数之比 —— 这是“衔接”的可测形式。
 *
 *   几个数（φ100，78.54 cm²）：
 *     D_particle = 0.1 /cm²  → D_pinhole = 0.001–0.03 /cm²
 *                               **低于 0.013 的检出下限，测不到**
 *     D_particle = 1 /cm²    → D_pinhole = 0.01–0.3 /cm²
 *                               只有 η 的上端（≥0.1）能测到
 *     D_particle = 10 /cm²   → D_pinhole = 0.1–3 /cm²
 *                               **定量段**
 *     D_particle = 100 /cm²  → D_pinhole = 1–30 /cm²
 *                               上端饱和到 10 /cm²
 *
 *   结论：要测 0.01 /cm² 的针孔，颗粒密度得 ≥0.03–1 /cm²（取决于 η）；
 *   而 0.1 /cm² 以下的颗粒计数本身只有 36 % 的泊松误差。**所以 0.01 /cm²
 *   是“有没有”的判据，0.1–10 /cm² 才是“有多少”的判据。**
 *
 *   0.05–0.1 µm 这一档的 η 设计值 0.001–0.05 也写在条目注释里，但它
 *   要 UV 计数器注册后才测得到；本轮不把它算进窗口。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、V-ramp：击穿场分布能测到多少
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 原理：1 cm² 金箔压住栅氧，0→200 V 线性升压，每步记漏电。某一步电流
 * 涨 >10× 或到 1 mA 限流 = 击穿；Ebd = Vbd / t_ox。
 *
 * 设计值（Earth 工程值）：
 *
 *   电压        0–200 V
 *   斜率        0.1–1 V/s
 *   步进        1 mV–1 V（薄膜 1–10 mV，厚膜 0.1–1 V）
 *   电流        1 pA–1 mA（积分前端 + 分流）
 *   接触        1 cm² 金箔，30–80 点/片
 *   厚度        0.0035–0.4 µm（3.5 nm–400 nm）
 *   Ebd         5–12 MV/cm
 *   β           1–3（30–80 点，β 标准误 ≈ β/√N ≈ ±0.2–0.5）
 *
 *   ⚠️ 不是“一只 φ100 大电容”：那是一只 78.5 cm² 的器件，一个针孔就短路，
 *   而且没有空间分辨，测不出分布。本台是 30–80 个 1 cm² 金箔点**铺满全片**，
 *   每点单独升压、单独记击穿 —— 这才是 GOI 的“整片”口径：整片范围、
 *   逐点数据，不是整片一只器件。
 *
 * ── 200 V 覆盖到哪里 ──────────────────────────────────────────────────
 *
 *   Ebd = V / t。200 V 对应的最大可测场：
 *     t = 0.4 µm   → 200 V / 0.4 µm = **5 MV/cm**（窗口下沿）
 *     t = 0.167 µm → **12 MV/cm**（窗口上沿）
 *     t = 0.05 µm  → 40 MV/cm（12 MV/cm 在 60 V 就到）
 *     t = 3.5 nm   → 571 MV/cm（12 MV/cm 在 4.2 V 就到，1 mV 步进 = 0.29 MV/cm）
 *
 *   所以：
 *     · t ≤ 0.167 µm：200 V 的最大场 ≥12 MV/cm，5–12 全窗可达；
 *     · 0.167 < t ≤ 0.4 µm：最大场 5–12 MV/cm，只能测到 200/t，
 *       上端右删失（例如 0.3 µm 只到 6.7 MV/cm）；
 *     · t > 0.4 µm：200 V 到不了 5 MV/cm，全窗右删失，换 500 V 台。
 *
 *   0.3–1 µm 的 LPCVD Si₃N₄ 只有 0.3–0.4 µm 这一段能到 5 MV/cm，且上端
 *   仍右删失；≥0.4 µm 全窗右删失。更厚的膜换 500 V 台
 *   `measure/si3n4-vbd`，不是“本台测不了”。
 *
 * ── Weibull 的算法与边界 ──────────────────────────────────────────────
 *
 *   30–80 个 1 cm² 点的 Ebd 排序，F_i = (i − 0.3)/(N + 0.4)，
 *   ln(−ln(1−F_i)) 对 ln(Ebd) 线性拟合，斜率 = β。β 1–3 是“可用栅氧”
 *   的窗口；β<1 说明有 gross defect（针孔/颗粒），β>3 说明氧化层极均匀
 *   （本层的 4 nm 热氧与 0.3–1 µm LPCVD Si₃N₄ 都到不了）。
 *
 *   ⚠️ 一个 200 V 未击穿的点是**右删失**，不能当 200 V 击穿代进拟合；
 *   本路线要求删失点 ≤20 %，否则加电压或换厚片，不硬拟合。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、边界（不藏）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **铜装饰是破坏性的**：装饰过的片不能回线。它是抽检/离线分析，
 *      不是每片全检。每片全检要非破坏的暗场扫描（5–18 h/片），
 *      那条只给颗粒，不给“铜点从哪来”。
 *   ② **没有认证的针孔标准片**：`plant/particle-counter-uv/calibration-wafer`
 *      （0.05 µm、1 颗/cm²）是现成的计数参照，但它所在的文件同样**未注册**
 *      进 `tools/report/data.ts`，本轮不能当路线输入。密度校准只能靠
 *      重复装饰 + SEM 量铜点；密度不确定度 **20–30 %**，不是校准证书的 5 %。
 *   ③ **没有汞探针**：`mat/mercury` 全表 0 条；V-ramp 用 1 cm² 金箔
 *      软接触，压力 5–20 kPa（汞探针 10–100 kPa），有效面积按 0.8–1.0
 *      折。金箔会随片起伏，0.4 µm 以上的厚片接触更差（压力上限压裂风险）。
 *   ④ **1 pA 以下不报数**：V-ramp 的电流下限 1 pA（10 pF、1 V/s 积分
 *      的 0.1–1 pA，200 V 档实际 10 pA–1 pA）。低于 1 pA 写 “<1 pA”。
 *   ⑤ **V-ramp 不数针孔**：它给击穿场分布；针孔密度仍以铜装饰为准。
 *      低场击穿（Ebd<5 MV/cm）事件数 / 面积只能当针孔密度的**下限**。
 *   ⑥ **200 V 不是本征击穿的充分条件**：0.4 µm 上 5 MV/cm 刚好到窗口
 *      下沿；要测更高场得减薄或换 500 V 台。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、条目与路线
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   mat/goi-pinhole-record   一份/片：针孔密度、孔径、颗粒密度、片径
 *   mat/goi-vramp-record     一份/片：Vbd、Ebd、β、厚度、片径
 *
 *   measure/goi-copper-decoration  5 道工序：颗粒预扫 → 清洗 → 装饰 →
 *                                  计数 → SEM 定径
 *   measure/goi-vramp              4 道工序：椭偏测厚 → 装片 → 斜坡 →
 *                                  Weibull 拟合
 *
 * ⚠️ 记录条目的 `props` 是**实测窗口**；路线的 `gives` 是这台仪器/这条
 * 方法能覆盖的窗口。没有测之前，窗口不是读数 —— 与 data/measure 其他
 * 文件同一条口径。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const GOI_ITEMS: readonly Item[] = [
  /**
   * 铜装饰针孔记录。**一份对应一片。**
   *
   * 四个读数：
   *   pinholeDensity  0.01–10 /cm²   铜点数 / 片面积；φ100 上 1 颗 = 0.0127
   *   pinholeDiameter 0.3–50 µm      SEM 定径；0.3 µm 以下只记“有”，不定径
   *   particleDensity 0.01–100 /cm²  装饰前的颗粒计数（旧机 0.09–0.10 µm）
   *   waferDiameter   100–150 mm     片径；密度要按实际面积算
   *
   * ⚠️ `particleDensity` 是**装饰前**的读数，不是针孔密度；两者之比
   * 就是 η（见文件头）。把它放进同一份记录，是为了让 η 可算、可核，
   * 而不是在另一个文件里假定一个 0.01–0.3。
   */
  {
    id: 'mat/goi-pinhole-record',
    name: '铜装饰针孔记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'pinholeDensity', kind: 'range', min: 0.01, max: 10, unit: '个/cm²' },
      { param: 'pinholeDiameter', kind: 'range', min: 0.3, max: 50, unit: 'µm' },
      { param: 'particleDensity', kind: 'range', min: 0.01, max: 100, unit: '个/cm²' },
      { param: 'waferDiameter', kind: 'range', min: 100, max: 150, unit: 'mm' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atMost' }, // 主项：假针孔（颗粒 vs 针孔）与 0.3 µm 以下不定径（20–50 %）
    ],
  },

  /**
   * V-ramp 记录。**一份对应一片。**
   *
   * 六个读数：
   *   vbd          0–200 V      击穿电压；200 V 未击穿记右删失
   *   ebd          5–12 MV/cm   击穿场 = vbd / t_ox
   *   weibullBeta  1–3          30–80 点的 Weibull 斜率
   *   thickness    0.0035–0.4 µm 椭偏实测厚度；Ebd 的分母
   *   waferDiameter 100–150 mm  片径
   *   points       30–80        有效击穿点数（右删失点另记，不计入拟合）
   *
   * ⚠️ Ebd 的窗口 5–12 MV/cm 是**方法窗口**，不是每片的保证：0.4 µm
   * 上 200 V 只到 5 MV/cm，0.167 µm 上到 12 MV/cm；更厚的片只报
   * “>5 MV/cm 未击穿”的右删失。厚度必须用实测，不能用设计值。
   */
  {
    id: 'mat/goi-vramp-record',
    name: 'GOI 斜坡电压记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'vbd', kind: 'range', min: 0, max: 200, unit: 'V' },
      { param: 'ebd', kind: 'range', min: 5, max: 12, unit: 'MV/cm' },
      { param: 'weibullBeta', kind: 'range', min: 1, max: 3, unit: '1' },
      { param: 'thickness', kind: 'range', min: 0.0035, max: 0.4, unit: 'µm' },
      { param: 'waferDiameter', kind: 'range', min: 100, max: 150, unit: 'mm' },
      { param: 'points', kind: 'range', min: 30, max: 80, unit: '点' },
    ],
  },
];

export const GOI_ROUTES: readonly Route[] = [
  {
    /**
     * **铜装饰：颗粒预扫 → 清洗 → 装饰 → 计数 → SEM 定径。**
     *
     *   栅氧片 1（或 Si₃N₄ 片 1）+ 铜阳极 1 mg + 水 2 kg + HF 0.01
     *     + H₂O₂ 0.05 → 针孔记录 1 份
     *
     * 五道工序：
     *   ① 颗粒预扫（0.09–0.10 µm、18 h/片）—— 装饰前的颗粒密度；
     *   ② 清洗：稀 HF 30 s + H₂O₂/水，去原生氧化层与有机残留；
     *   ③ 装饰：1–10 V、0.1–100 µA、1–10 min，铜阳极，18 MΩ 水；
     *   ④ 计数：暗场数铜点，18 h/片；
     *   ⑤ 定径：SEM 看 5–10 个点，0.3–50 µm；直径 ×1/1–1/3 折回针孔。
     *
     * 为什么先扫颗粒再装饰：装饰后铜点会盖住颗粒，颗粒数就再也测不到；
     * 而 η 必须是“同一片”的颗粒数 / 针孔数。本轮用已注册的旧机
     * `plant/particle-counter`（0.09–0.10 µm、18 h/片）；UV 计数器
     * 0.05–0.10 µm、5 h/片 已建但未注册，注册后可原位替换，见文件头。
     *
     * ⚠️ 装饰是破坏性的：这片之后不能回线。抽检比例按 1/批 或 1/25 片，
     * 不是每片全检（全检 40 h/片 × 每片 = 线速受不了）。
     */
    id: 'measure/goi-copper-decoration',
    name: '铜装饰针孔测量',
    produces: [
      {
        item: 'mat/goi-pinhole-record',
        qty: q(1),
        gives: [
          { param: 'pinholeDensity', kind: 'range', min: 0.01, max: 10 },
          { param: 'pinholeDiameter', kind: 'range', min: 0.3, max: 50 },
          { param: 'particleDensity', kind: 'range', min: 0.01, max: 100 },
          { param: 'waferDiameter', kind: 'range', min: 100, max: 150 },
          { param: 'uncertainty', kind: 'range', min: 20, max: 50 },
        ],
      },
    ],
    uses: [
      // 栅氧片或 Si₃N₄ 片：两档都在 100–150 mm，同一子句可通约（片）
      {
        anyOf: [
          { item: 'mat/gate-oxide-wafer', qty: q(1) },
          { item: 'mat/si3n4-lpcvd', qty: q(1) },
        ],
      },
      // 1 mg/片：铜阳极溶解量（含阴极环与背景）；实测可按阳极失重修正
      { anyOf: [{ item: 'mat/copper-anode', qty: q(1, 1000000) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(2) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/hydrogen-peroxide', qty: q(1, 20) }] },
    ],
    needs: [
      {
        item: 'plant/cu-decoration-cell',
        qty: q(1),
        need: [{ param: 'measure/pinholeDensity', kind: 'range', min: 0.01, max: 10 }],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
      'plant/clean-room',
    ],
    rate: { hours: q(40) },
    steps: [
      {
        note_zh:
          '① 装饰前颗粒扫描：`plant/particle-counter` 全片暗场、0.09–0.10 µm、18 h/片；得 D_particle(≥0.1 µm)。这是 η 的分子',
        performedBy: 'plant/particle-counter',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 清洗：稀 HF（1:100）30 s 去原生氧化层 → H₂O₂/水 1:20 → 18 MΩ 水冲 → 氮吹干；水膜连续不破为净（破一处就是假针孔的起点）',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 30 }],
      },
      {
        note_zh:
          '③ 铜装饰：片背面接阴极铜环，正面朝天；铜阳极 50×50 mm、距 20–50 mm；1–10 V、0.1–100 µA、1–10 min；18 MΩ 水 5 L。针孔处析出铜点，铜点比针孔大 1–3 倍',
        performedBy: 'plant/cu-decoration-cell',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '④ 计数：18 MΩ 水冲、氮吹干，进 `plant/particle-counter` 全片暗场、0.09–0.10 µm、18 h/片；数铜点，除以片面积（78.54–176.7 cm²）得 D_pinhole',
        performedBy: 'plant/particle-counter',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑤ 定径：`plant/cd-sem` 看 5–10 个铜点，2–4 nm 束、1–5 k×；量铜点直径 ×1/1–1/3 折回针孔（0.3–50 µm）；0.3 µm 以下只记“有”，不定径',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **V-ramp：椭偏测厚 → 装片 → 0–200 V 线性升压 → Weibull 拟合。**
     *
     *   栅氧片 1 → V-ramp 记录 1 份
     *
     * 四道工序：
     *   ① 椭偏测厚：每片 3 点（中心 + 两个 1/2 半径），3.5 nm–0.4 µm；
     *   ② 装片：1 cm² 金箔、30–80 个点（φ100 排 30–78 个 1 cm² 点，
     *      φ150 排 30–176 个），每点之间留 2 mm 保护环间隔；
     *   ③ 斜坡：0→200 V，0.1–1 V/s；薄膜 1–10 mV/步，厚膜 0.1–1 V/步；
     *      每步记漏电；一步内涨 >10× 或到 1 mA 限流记击穿；
     *   ④ Weibull：30–80 个 Ebd 排序，F_i=(i−0.3)/(N+0.4)，
     *      ln(−ln(1−F)) 对 ln(Ebd) 拟合，斜率 β；右删失点 ≤20 %。
     *
     * 与 `measure/si3n4-vbd` 的分工：那条 0–500 V、探针点接触、测单点；
     * 这条 0–200 V、1 cm² 金箔、测 30–80 点分布。0.4 µm 以上 Si₃N₄
     * 走 500 V 那条，不硬塞进 200 V。
     */
    id: 'measure/goi-vramp',
    name: 'GOI 斜坡电压测量',
    produces: [
      {
        item: 'mat/goi-vramp-record',
        qty: q(1),
        gives: [
          { param: 'vbd', kind: 'range', min: 0, max: 200 },
          { param: 'ebd', kind: 'range', min: 5, max: 12 },
          { param: 'weibullBeta', kind: 'range', min: 1, max: 3 },
          { param: 'thickness', kind: 'range', min: 0.0035, max: 0.4 },
          { param: 'waferDiameter', kind: 'range', min: 100, max: 150 },
          { param: 'points', kind: 'range', min: 30, max: 80 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/gate-oxide-wafer', qty: q(1) }] }],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '① 椭偏测厚：488 nm、70°/75°，每片 3 点（中心 + 两个 1/2 半径）；厚度 3.5 nm–0.4 µm。Ebd 的分母用实测厚度，不用设计值',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 装片：片放 φ150 铝台，背面铜环整圈接触；正面 1 cm² 金箔 + 保护环，压力 5–20 kPa；φ100 可排 30–78 点、φ150 最多 176 点，本记录取 30–80 点做 Weibull（其余作备份/右删失），点间隔 2 mm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 斜坡：0→200 V、0.1–1 V/s；薄膜 1–10 mV/步、厚膜 0.1–1 V/步；每步记漏电（1 pA–1 mA）。一步内涨 >10× 或到 1 mA 限流 = 击穿；200 V 未击穿记右删失',
        performedBy: 'plant/vramp-tester',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '④ Weibull：30–80 个 Ebd 排序，F_i=(i−0.3)/(N+0.4)，ln(−ln(1−F)) 对 ln(Ebd) 拟合；β 1–3。右删失点 ≤20 %，否则加电压/换厚片，不硬拟合。低场（<5 MV/cm）事件数 / 面积只当针孔密度下限',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...GOI_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...GOI_ROUTES];
