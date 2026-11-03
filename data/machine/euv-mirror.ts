/**
 * EUV 多层膜反射镜 —— 13.5 nm 的镜子，以及造它的两台设备。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么这一件最难：所有材料在 13.5 nm 上都强吸收
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 13.5 nm 的光在一切材料里的穿透深度只有几 nm（Mo 约 3.4 nm、Si 约 5 nm）。
 * 所以**透镜不存在**：一片 1 mm 厚的玻璃对它是不透明的。光只能靠**布拉格反射**——
 * 40–50 对 Mo/Si 交替膜，每对 2.8 + 4.1 = 6.9 nm，靠界面处 n_{Mo} = 0.921 与
 * n_{Si} = 0.999 之间 **0.078** 的折射率差反复相干叠加：80 个界面各给约 4 % 的
 * 振幅反射，可叠加本来是 80 倍 —— 但 Mo 与 Si 都在吸收，真能相干的只有二十几对，
 * 所以天花板是 **70 %**，不是 100 %。
 *
 * 于是三件事同时被压到原子尺度上：
 *
 *   周期 6.9 ± 0.1 nm     80 层的每一层都是"3 nm 加减一根原子"
 *   面形 < 0.1 nm rms     300 mm 口径上不到一个原子层（Si (111) 面间距 0.314 nm）
 *   界面粗糙度 < 0.3 nm   一个原子的台阶就够毁掉相干
 *
 * 0.1 nm / 300 mm = 3.3×10⁻¹⁰。这个相对精度在别的工业部门不存在：
 * 量块 K 级是 0.1 µm/100 mm = 1×10⁻⁶，**差 3 000 倍**。
 *
 * 下面四个问题各自相差 1 000 倍左右，而它们其实是同一件事：
 * **本层的尺子停在 15 nm（1/20 干涉条纹），而这件事要 0.1 nm。**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 问题一：0.1 nm 的面形怎么做到？
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本层最好的抛光手艺是「铸铁盘 + 石英粉，λ/4 = 0.13 µm」——那是平晶那一条
 * （`plant/interferometer/flat`）。0.1 nm 比它小 **1 300 倍**。一条真实的阶梯：
 *
 * ① **对研到 λ/20 = 32 nm。** λ/4 是"能对研出一块平"的门槛，不是这门手艺的上限：
 *    三块互研 + 更细的分级粉，19 世纪光学车间（Rowland 1882 年刻光栅的母机）
 *    就在 λ/20 这一档（面形公差习惯按 633 nm 的验收波长写，λ/20 = 32 nm）。
 *    仍然差 **320 倍**。
 *
 * ② **离子束抛光（IBF）修正。** 这一步是"确定性去除"，不是"磨得更轻"：
 *
 *      Ar⁺ 600 eV，溅射产额 Y(Si) ≈ 0.9、Y(Mo) ≈ 1.2（600 eV、近垂直入射）
 *      束流 0.3 mA = 1.9×10¹⁵ ion/s → 每秒去掉 1.9×10¹⁵ 个原子
 *      ÷ 5×10²² atom/cm³（Si）→ 3.8×10⁻⁸ cm³/s，摊在 φ12 mm 束斑（113 mm²）上
 *      → **峰值去除率 20 nm/min**（1 mA 则 66 nm/min，取小值免得热漂）
 *      去除函数：高斯，FWHM 12 mm，σ = 5.1 mm
 *
 *    驻留时间图 = 面形误差与去除函数的反卷积：t = e ⊛⁻¹ g。1001×1001 网格、
 *    Richardson–Lucy 迭代 20 次 ≈ 2×10⁷ 次乘加 —— **机器人自带的算力秒级算完**
 *    （前提给的算力可以直接用；若用本层自造的 L2 芯片，10⁴ 加法/秒
 *    要 33 min，也够）。要一台 1 µm 精度的三轴台扫描（`plant/ion-beam-figuring/stage`）。
 *
 *    收敛：32 → 8 → 2 → 0.5 → 0.15 nm（每轮 ×0.25）。去除总量约 30 nm，
 *    四轮加装夹复测共 6 h（`rate: q(6)`）。
 *
 * ③ **最后一级不是"抛得更准"，是温度梯度。** 20 mm 厚熔石英，α = 5.5×10⁻⁷/K，
 *    板内温度梯度 ΔT 造成的弓形量：
 *
 *      s = α·ΔT·L²/(8t) = 5.5×10⁻⁷ × ΔT × 0.09 / 0.16 = 3.1×10⁻⁷·ΔT   [m]
 *
 *    要 s ≤ 0.1 nm ⇒ **ΔT ≤ 3.2×10⁻⁴ K**。本层恒温间是双金属片 + 继电器，
 *    死区 ±0.5 K（`plant/metrology-room`）—— 差 **1 500 倍**。
 *    换 ULE（掺钛石英，CTE 30 ppb/K）只放宽 18 倍，仍差 85 倍，而本层做不出
 *    ULE（要 TiCl₄ 掺钛）。**所以 0.1 nm 的第一处缺口是"温度梯度"，不是"抛光"。**
 *
 * 结论：**修得到 0.1 nm（开环，按去除量算），证不了 0.1 nm（闭环，要尺子）。**
 * 缺的那一件写在问题四。数据里 `figure ≤ 0.1` 是**开环声明**，不是量出来的。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 问题二：6.9 nm 的周期怎么镀？
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 二选一，选 **磁控溅射**（`plant/euv-coater`）。三条理由都不是偏好：
 *
 *   ① Mo 蒸发要 2 623 °C，而钨舟的实用上限约 2 000 °C（再高就下垂），到 2 600 °C
 *      还与钼成合金 —— **蒸发这条路对钼根本不通**，不是"不稳"，是"做不到"。
 *   ② 本层的真空只到 1 Pa（罗茨机组，`data/machine/vacuum.ts`），而热蒸发要
 *      10⁻³ Pa 才不掺气 —— 差两三个量级。
 *   ③ 磁控溅射正好在 **0.1–1 Pa** 干活。**本层的真空刚好落在它的工作区**，
 *      这是整个方案能成立的唯一原因。
 *
 * 洁净靠"冲洗"而不是"抽得更低"：抽到 1 Pa → 充氩到 10 Pa → 再抽到 1 Pa，五轮。
 * 每轮把残余气体稀释 10 倍：氧分压 0.2 Pa × 0.1⁵ = **2×10⁻⁶ Pa**，
 * 是工作气压 0.3 Pa 的 **7 ppm**。靶前再加一级气帘，氧不再往基底上跑。
 *
 * 速率与时间的账（功率密度 0.5 W/cm²，压住 2N 硅靶的微弧，所以速率砍半）：
 *
 *   Mo 2.8 nm ÷ 0.10 nm/s = 28 s，+15 s（稳定、快门、靶位切换）= 43 s
 *   Si 4.1 nm ÷ 0.10 nm/s = 41 s，+15 s                              = 56 s
 *   一对 6.9 nm                                                        = 99 s
 *   40 对 = 3 960 s = **66 min**（50 对 = 82.5 min）
 *
 * 整件一批 8 h：冲洗 50 min + 烘烤除气 4 h + 溅射 66 min + 冷却 2 h = 7.9 h。
 *
 * 周期公差 ±0.1 nm 的预算怎么分（这是全篇最要紧的一张表）：
 *
 *   快门响应 0.3 s × 0.10 nm/s                        = 0.030 nm/层
 *   速率标定：硅片镀 1 µm 台阶，干涉仪数 3.4 级条纹，
 *             读到 1/20 级 = 15 nm → 1.5%/片；三片平均   = 0.030 nm/层
 *   电源稳流 ±1% × 3.5 nm                             = 0.035 nm/层
 *   ─────────────────────────────────────────────────────────────
 *   合成 √(0.030² + 0.030² + 0.035²) = 0.055 nm/层 → 周期 σ = 0.078 nm ✓
 *
 * 也就是说：**±0.1 nm 这一档不是"不可能"，是把三种误差全都花光的 78 %**，
 * 余量 22 %。而这三项里最弱的一环是**标定**（1.5%），不是设备。
 *
 * ⚠️ **这台机器上不装晶振膜厚监控。** 石英晶振是另一条链（单晶石英片 + 振荡器 +
 * 频率计数，见 `data/material/clock.ts` 那一族），而它给的是"已镀了多少"。
 * 不装的理由是：**卡住周期的不是"看不见厚度"，是标定**（1.5 %）——
 * 晶振的 tooling factor 一样要标，一样是 1–2 %。换监控手段并不能把它改小，
 * 所以这一层用最笨的办法："镀前标定 + 定时 + 快门"，而代价是**误差开环**：
 * 速率在 66 min 里漂 2 %，周期就漂 0.14 nm，而且镀完才发现（镀完不能修，
 * 见问题一③）。这是本件最难受的一处降级。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 问题三：反射率能到多少？
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 40 对的理论值 **70 %**（折成每个周期的有效振幅 r = √0.70/40 = 0.021）。
 * 布拉格条件 2d = λ：周期偏 Δd/d，峰就偏 Δλ/λ = Δd/d。
 *
 * 周期误差 ±10 %（本层蒸发的水准，即 σ_d = 0.69 nm）：
 *
 *   确定性偏移  峰从 13.5 nm 挪到 14.8 nm。峰宽 Δλ/λ = 1/N = 2.5 %，
 *               偏 10 % 就是偏 4 个峰宽；而 40 × 10 % = 4 个整级 ——
 *               13.5 nm 恰好落在第 4 个零点上。R → 只剩单界面菲涅尔反射
 *               0.17 %（Mo 的 n = 0.92：((1−0.92)/(1+0.92))² = 1.7×10⁻³）。
 *   随机误差    振幅按 exp(−8π²σ²m/λ²) 逐界面衰减，第 40 个界面的权重只剩
 *               3×10⁻⁴（指数 −8.25）；Σe^(−0.206m) = 4.4，理想是 40 →
 *               **振幅只剩 11 % → R ≈ 0.8 %**。
 *               （非相干叠加的另一种估法是 70 %/40 = 1.8 %，两种算法夹住 1 %。）
 *
 * **所以 ±10 % 不是"差一点"，是"没有镜子"：反射率从 70 % 掉到 1 % 量级。**
 * 这条反例写成了数据里的第二条路线（`make/euv-mirror-evap`，窗口 6.2–7.6 nm、
 * 0.2–2 %）——它产出的东西在条目上叫同一个 id，但任何要求 `period 6.8–7.0`
 * 的地方都会把它筛掉。`props` 的全部意义就在这一行上。
 *
 * 反过来算：±0.1 nm 随机误差 → Σe^(−0.0043m) = 36.6，振幅 92 % → **R ≈ 59 %**。
 * 要保住 70 % 得把周期做到 **±0.03 nm**（0.4 %），工业实际也是 ±0.02–0.03 nm。
 * 换句话说：**6.9 ± 0.1 nm 这个公差只够 59 %，不够 70 %。**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 问题四：0.1 nm 的面形怎么检？
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本层的干涉仪（`plant/interferometer`）：钠焰 589 nm、λ/4 的平晶做参考面、
 * 人眼数条纹，精度 1/20 条纹 = 0.295 µm ÷ 20 = **15 nm**。
 *
 *   要 0.1 nm ⇒ 要读 1/2 950 条纹（0.295 µm ÷ 0.1 nm）
 *   读出差 **150 倍**；参考面本身 130 nm 与 0.1 nm 差 **1 300 倍**
 *
 * 阶梯：多次反射（Tolansky，两面镀银，精细度 F ≈ 100 的锐条纹）能到 1/200 级
 * = 1.5 nm —— 仍差 15 倍，且视场只有 φ10 mm，300 mm 要拼接（1 µm 台 + 算，
 * 拼接缝本身就有 1 nm）。
 *
 * **缺三件**（都不是"缺工艺"，是缺零件）：
 *   ① ~~压电移相器（PZT → 锆钛酸铅 → **铅**，本层没有铅）~~
 *      **已解**（`data/machine/phase-shifter.ts`）：缺的是 PZT，不是压电 ——
 *      **石英压电堆**不要铅锆钛，32 片 X 切片串联 73.6 pm/V、27 V 走 λ/8，
 *      且石英没有畴壁，迟滞 <0.01 %（PZT 是 10–15 %，那正是工业必须闭环的原因）。
 *      代价：行程只有工业的 1/50–1/450，且**没有相位解包裹**。
 *      但移相买的是**分辨**（15 nm → 0.5 nm）不是准确度 —— 所以②③仍在。
 *   ② 稳频单频激光（He-Ne 或碘稳频，本层没有）
 *   ③ λ/1000 的参考面（本层 λ/4，差 250 倍）
 *
 * 还有一件不是缺零件，是缺光：**13.5 nm 的 at-wavelength 检测**。真正测 EUV 镜子
 * 是在工作波长上测反射计，而 13.5 nm 的光源（等离子体 + 收集镜）本身就要用这种
 * 镜子 —— **环自己咬自己**。所以本层连"反射率有没有到 59 %"都验不了，
 * `gives: reflectivity 55–70` 是设计值，不是测值。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 本层做不到的十处（降级点，按严重程度）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  1. 面形 0.1 nm **测不出来**（差 150 倍），只能开环声明 —— 按去除量算。
 *  2. 镀完比镀前糟：276 nm 膜厚分布 ±1 % 就是 ±2.8 nm，直接吃掉 0.1 nm 的账，
 *     而"预补偿"要先知道分布、分布又要先能量膜厚（1.5 %）—— 算不出来。
 *     所以镜子的 `figure` 写 ≤ 3 nm，不是 0.1 nm。
 *  3. 周期 ±0.1 nm 只够 59 % 反射率；70 % 要 ±0.03 nm。**这块镜子比公差还差 5 倍。**
 *  4. 两个靶都只有 2N 半：钼粉 99.5 %（`mat/molybdenum-powder`）、工业硅 98–99.5 %，
 *     不是电子束熔炼的 3N5、也不是掺硼的低阻硅靶 → 直流溅射会起微弧 → 功率密度
 *     压到 0.5 W/cm²，速率砍半；界面粗糙度从 0.2 涨到 0.3 nm 有一半是这些杂质。
 *  5. 真空只到 1 Pa：蒸发那一路（10⁻³ Pa）不通，溅射靠五轮氩冲洗撑到 7 ppm 氧。
 *  6. 机器上不装晶振膜厚监控：速率是镀前标定的，66 min 里漂了不会知道
 *     （换监控手段救不了 —— 卡住周期的是 tooling factor，不是"看不见厚度"）。
 *  7. 没有 at-wavelength 检测：反射率从没量过。
 *  8. 离子束那台要 10⁻² Pa，本层给不出 → 差分抽气硬撑到 0.05–0.5 Pa，
 *     束斑从 φ12 mm 涨到 φ25 mm，只修得了低频面形，中频修不了。
 *  9. 干涉仪参考面 λ/4，自己就比被测对象差 1 300 倍 —— **基准不存在**，
 *     所以 0.1 nm 是"工艺参数"，不是"检验结论"。
 * 10. 阴极用钼丝而不是钨丝（钨丝寿命是它的五倍，但那要另开一条 0.5 mm 钨丝拉拔线，
 *     而钼粉这条链已经在了）：钼的逸出功 4.6 eV，寿命约 40 h，换丝要破真空 ——
 *     离子束那台的实际可用率只有三成。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、产品：基板与镜子
// ═══════════════════════════════════════════════════════════════════════════

export const EUV_MIRROR_ITEMS: readonly Item[] = [
  /**
   * EUV 基板，φ300 mm。**镀膜之前的那块玻璃**，不是镜子。
   *
   * 它是本文件里唯一一个"同一个 id、两个等级"的条目：
   *
   *   make/euv-substrate-300       熔制 + 粗磨 + 手抛        → figure ≤ 32 nm（λ/20）
   *   make/euv-substrate-figure    离子束修正（IBF）        → figure ≤ 0.1 nm
   *
   * 第二条吃第一条的产物。这与 `std/photomask-general`（手刻 3–5 µm → 缩微 1 µm）
   * 是同一个形状：**尺寸没变，规格变了**，而变更规格那一步自己就是一条路线。
   *
   * 材料是**熔石英**（mat/quartz-pure 熔成板），不是 ULE/微晶玻璃 —— 见问题一③：
   * CTE 5.5×10⁻⁷/K 意味着 20 mm 板上 3×10⁻⁴ K 的梯度就有 0.1 nm 的弓形，
   * 这不是"材料差一点"，是两块不同的东西。本层做不出 ULE（掺钛要 TiCl₄）。
   */
  {
    id: 'std/euv-substrate-300',
    name: 'EUV Substrate', name_zh: 'EUV 基板',
    unit: '件',
    category: 'part',
    props: [
      // 面形：0.1 nm 是要的，130 nm（λ/4）是本层最差的。区间就这么宽。
      { param: 'figure', kind: 'range', min: 0, max: 130, unit: 'nm', dir: 'atMost' },
      // 基底粗糙度：抛光面 0.5 nm 够镀膜起步，界面粗糙度是镀出来再叠上去的。
      { param: 'roughness', kind: 'range', min: 0, max: 2, unit: 'nm', dir: 'atMost' },
    ],
  },

  /**
   * EUV 多层膜反射镜，φ300 mm，40–50 对 Mo/Si，周期 6.9 nm。
   *
   * 它是**零件**不是设备：它被装在光刻机上，不执行任何工序。
   * 但它是一件特殊零件 —— **它自己就是一套干涉薄膜结构**（80 层），
   * 所以它的规格全在 `props` 上，而这五个数就是整份文件的答案：
   *
   *   period       6.8–7.0 nm   周期（问题二）
   *   pairs        40–50 对     对数
   *   figure       ≤ 3 nm       面形（问题一：0.1 是基底的，镀完是 3）
   *   roughness    ≤ 0.3 nm     界面粗糙度
   *   reflectivity 55–70 %      反射率（问题三：理论 70，±0.1 nm 下单 59）
   */
  {
    id: 'std/euv-mirror-300',
    name: 'EUV Multilayer Mirror', name_zh: 'EUV 多层膜反射镜',
    unit: '件',
    category: 'part',
    props: [
      { param: 'period', kind: 'range', min: 6, max: 8, unit: 'nm' },
      { param: 'pairs', kind: 'range', min: 40, max: 50, unit: '对' },
      { param: 'figure', kind: 'range', min: 0, max: 130, unit: 'nm', dir: 'atMost' },
      { param: 'roughness', kind: 'range', min: 0, max: 2, unit: 'nm', dir: 'atMost' },
      { param: 'reflectivity', kind: 'range', min: 0, max: 80, unit: '%', dir: 'atLeast' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 二、镀膜机的零件（七件）
  //
  // 一台直流磁控溅射机。零件都走 `<machine>/<name>`：规格由这台机器定，
  // 名字里就得带归属。它**不是设备链上的通用件**，不给 `std/`。
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * 真空腔。φ900×1000 双层筒：内层 6 mm 低碳钢板（**本层没有不锈钢**，见降级点），
   * 外层水冷套，中间通 20 °C 水，两端法兰夹一圈硅橡胶密封。
   *
   * 为什么双层：这一层要**烘到 150 °C 除气**，又要水冷到 20 °C 控形 ——
   * 一个壁做不到两个温度，而 300 mm 口径上的热变形会直接变成膜厚分布的不均匀。
   * 溅射本身的热不是问题：0.5 W/cm² × φ150（177 cm²）= 88 W 一只靶，
   * 水冷背板就带走了。真正难对付的是**烘烤**。漏率 1×10⁻⁴ Pa·L/s 是焊缝可达到的量级
   * （检漏用蒸镀台那套机组做保压法）。
   */
  {
    id: 'plant/euv-coater/chamber',
    name: 'EUV Coater Vacuum Chamber', name_zh: 'EUV 镀膜机真空腔',
    unit: '件',
    category: 'part',
    props: [{ param: 'leakRate', kind: 'range', min: 0, max: 1, unit: 'Pa·L/s', dir: 'atMost' }],
  },

  /**
   * 抽气机组。水环泵 + 两级罗茨 —— **与蒸镀台同一门手艺**（`data/machine/vacuum.ts`），
   * 但这里的目标不是 10⁻³ Pa，是 **1 Pa 且流量大**：磁控溅射要一直通氩气。
   *
   * 关键差别是**节流阀**：200 L/s 的机组抽 0.3 Pa 时只能开 1.1 L/s 的等效通导，
   * 否则 20 sccm 的氩气根本立不住 0.3 Pa。节流阀不是附件，是这个方案的核心。
   */
  {
    id: 'plant/euv-coater/pump',
    name: 'EUV Pumping Unit', name_zh: 'EUV 抽气机组',
    unit: '件',
    category: 'part',
    props: [{ param: 'basePressure', kind: 'range', min: 0, max: 10, unit: 'Pa', dir: 'atMost' }],
  },

  /**
   * 磁控靶座（两套：Mo 一套、Si 一套）。铜背板 + 水冷 + 电磁铁 + 屏蔽罩。
   *
   * 磁场用**电磁铁**而不是永磁体：本层没有稀土（见 `data/material/magnet.ts` 的
   * 缺口），但铜线绕在铁极上就是磁铁 —— 0.05 T 的表面场够把电子锁在靶前，
   * 溅射电压从 2 000 V 降到 500 V，基底才不会被高能电子烤。
   *
   * 用电磁铁的另一个好处正好是这里需要的：**磁场可以调**。调磁场就是调溅射电压，
   * 也就是调速率 —— 周期标定时它是一个可调参数，而不是一次烧结定死的规格。
   *
   * ⚠️ 屏蔽罩同时是**修形挡板**：φ150 的靶对 φ300 的基底，纯几何的膜厚分布是
   * 中心比边缘厚 2.5 倍（1/r² × cos⁴）。所以罩子的开口不是圆的 —— 它按那个
   * 余弦分布削出来（中心收窄），把 2.5 倍压到 ±1 %。它随靶一起换、一起被镀掉，
   * 所以算靶座的一件，不单列零件。
   */
  {
    id: 'plant/euv-coater/magnetron',
    name: 'EUV Magnetron Target Holder', name_zh: 'EUV 磁控靶座',
    unit: '件',
    category: 'part',
    props: [{ param: 'magneticField', kind: 'range', min: 0.02, max: 0.2, unit: 'T', dir: 'atLeast' }],
  },

  /**
   * 钼靶，φ150×6 mm。**钼粉热压烧结的板**，锡焊在铜背板上。
   *
   * 数量级先看一眼：一面 300 mm 的镜子，40 对 × 2.8 nm = 112 nm 的钼，摊在
   * 707 cm² 上是 82 mg。**一块 1 kg 的靶够镀 12 000 面镜子** ——
   * 材料从来不是瓶颈，靶也不是。瓶颈全在 0.1 nm 上。
   *
   * ⚠️ 纯度只有 **99.5 %（2N5）**：本层钼链的终点是 `mat/molybdenum-powder`
   * （氢气还原，见 `data/material/euv-metals.ts` 降级③），不是电子束熔炼的 3N5。
   * 差的那两个 9 是碳与氧，它们会在 Mo/Si 界面上攒成一层 —— 界面粗糙度 0.3 nm
   * 这个数，一半是它贡献的。
   */
  {
    id: 'plant/euv-coater/target-mo',
    name: 'EUV Molybdenum Target', name_zh: 'EUV 钼靶',
    unit: '件',
    category: 'part',
    props: [{ param: 'purity', kind: 'range', min: 98, max: 99.5, unit: '%', dir: 'atLeast' }],
  },

  /**
   * 硅靶，φ150×6 mm。**工业硅碳热还原 + 浇锭 + 磨面**，纯度只到 2N。
   *
   * ⚠️ 这不是工业上那种掺硼低阻硅靶（0.02 Ω·cm）。2N 的硅电阻率高且不均匀，
   * 直流溅射时靶面会积累电荷、起微弧 —— 弧一次就把那一层的表面砸出 0.1 µm 的坑。
   * 本层的对付办法是**把功率密度压到 0.5 W/cm²**（工业是 2–5），微弧不起，
   * 代价是速率砍半（0.10 nm/s 而非 0.20）：一对从 64.5 s 变 99 s，
   * 40 对从 43 min 变 66 min。这笔时间换的是"80 层里有几层被弧砸穿"。
   *
   * 掺硼要硼砂，而本层的料表里没有硼（没有硼砂、也没有硼酸）—— 这笔账记在降级点第 4 条。
   */
  {
    id: 'plant/euv-coater/target-si',
    name: 'EUV Silicon Target', name_zh: 'EUV 硅靶',
    unit: '件',
    category: 'part',
    props: [{ param: 'purity', kind: 'range', min: 98, max: 99.9999, unit: '%', dir: 'atLeast' }],
  },

  /**
   * 基底台。φ320 托盘 + 自转（15 r/min）+ 一维进给，定位 1 µm、行程 300 mm。
   *
   * 自转是**膜厚均匀性**的全部来源：静止镀出来的是靶的像（中间厚两边薄，
   * 按 1/r² × cos⁴ 算是中心比边缘厚 2.5 倍）；自转 + 靶座上那块修形屏蔽罩
   * 把径向分布压到 ±1 % —— 而 ±1 % 已经是 276 nm 上的 2.8 nm，
   * 正好把 0.1 nm 的账吃干净（降级点第 2 条）。
   *
   * 1 µm 的台是这一层能做到的最好：缩微拼版机那台也是 1 µm（同一门手艺：
   * 研磨级丝杠 + 刻度盘 + 刮研导轨）。
   */
  {
    id: 'plant/euv-coater/stage',
    name: 'EUV Substrate Stage', name_zh: 'EUV 基底台',
    unit: '件',
    category: 'part',
    props: [{ param: 'positionError', kind: 'range', min: 0, max: 100, unit: 'µm', dir: 'atMost' }],
  },

  /**
   * 快门。电磁铁吸合 + 弹簧复位，挡在靶与基底之间。
   *
   * 它是**整个周期公差的分母**：3–4 nm 的层，靠 0.3 s 的开关精度切成 0.03 nm。
   * 没有它，溅射就是"整段连续镀"，层厚只能靠时间估，误差就是秒级。
   *
   * 0.3 s 是弹簧 + 电磁铁的量级，设计值；本层没有毫秒计时器，只能在镀完
   * 一层厚膜后用干涉仪间接验（见降级点第 6 条）。
   */
  {
    id: 'plant/euv-coater/shutter',
    name: 'EUV Shutter', name_zh: 'EUV 快门',
    unit: '件',
    category: 'part',
    props: [{ param: 'responseTime', kind: 'range', min: 0, max: 2, unit: 's', dir: 'atMost' }],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 三、镀膜机
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * EUV 多层膜磁控溅射镀膜机。**由 `make/euv-coater` 装配。**
   *
   * **它不做任何 `performedBy`** —— 它是本文件新造的设备，不在既有的执行设备表里，
   * 所以它的位置只能是 `needs`：镀膜那条路线以"必须在场、但不被消耗"的方式引它，
   * 而它 `holds` 的两个条件（压力、温度）正是那条路线唯一能写下来的条件。
   */
  {
    id: 'plant/euv-coater',
    name: 'EUV Multilayer Magnetron Sputter Coater', name_zh: 'EUV 多层膜磁控溅射镀膜机',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'pressure', min: 0.1, max: 10 },
      { param: 'temperature', min: 20, max: 200 },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 四、离子束修形机的零件（三件）
  //
  // 这一台是问题一的答案里唯一能补上 320 倍的东西。它的真空要求（10⁻² Pa）
  // 比镀膜机高两个量级，本层给不出 —— 见降级点第 8 条。
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * 离子源。Kaufman 型：放电室 + 热阴极 + 屏栅/加速栅 + 陶瓷绝缘子。
   *
   * 栅极是**钼**的：钼的溅射产额低、热膨胀小，栅孔在 1 000 °C 下不变形。
   * 0.3 mm 的钼板只能从钼粉来（`mat/molybdenum-powder` 热压 + 轧薄），
   * 栅孔 3 000 个冲不出来（φ0.3 mm 的冲头在 0.3 mm 钼片上会断），
   * 用光刻 + 湿法腐蚀 —— 本层的光刻是 5 µm 线宽，孔是 300 µm，绰绰有余。
   *
   * ⚠️ 阴极只能钼丝。真实的 Kaufman 源用钨丝（逸出功 4.55 eV），钼 4.6 eV 差一点，
   * 但在 10⁻² Pa 残气下寿命从 200 h 掉到 40 h，而且换丝要破真空（降级点第 10 条）。
   * 用钼不用钨的理由是链：钼粉这条线已经在了，钼丝能从它拉出来；钨丝要另起一支。
   */
  {
    id: 'plant/ion-beam-figuring/source',
    name: 'Ion Beam Figuring Machine Ion Source', name_zh: '离子束修形机离子源',
    unit: '件',
    category: 'part',
    props: [{ param: 'beamEnergy', kind: 'range', min: 300, max: 1500, unit: 'eV' }],
  },

  /**
   * 修形真空腔。φ600×400，比镀膜腔小两号 —— 它只装一面镜子。
   *
   * 漏率要求比镀膜腔严一个量级：离子束的工作气压是 0.05 Pa，而镀膜是 0.3 Pa，
   * 同样的漏率在 0.05 Pa 里是六倍的占比。
   */
  {
    id: 'plant/ion-beam-figuring/chamber',
    name: 'Ion Beam Figuring Machine Vacuum Chamber', name_zh: '离子束修形机修形真空腔',
    unit: '件',
    category: 'part',
    props: [{ param: 'leakRate', kind: 'range', min: 0, max: 1, unit: 'Pa·L/s', dir: 'atMost' }],
  },

  /**
   * 三轴扫描台。X/Y 各 300 mm 行程、1 µm 定位，Z 调焦 10 µm。
   *
   * 驻留时间图是"走多慢"，所以这个台的**定位误差直接就是面形的误差**：
   * 1 µm 的定位误差 × 束斑边缘的去除率梯度 → 0.05 nm 级的面形残差。
   * 这就是为什么 1 µm 刚好够、10 µm 不够 —— 不是随便挑的。
   */
  {
    id: 'plant/ion-beam-figuring/stage',
    name: 'Ion Beam Figuring Machine 3-Axis Scanning Stage', name_zh: '离子束修形机三轴扫描台',
    unit: '件',
    category: 'part',
    props: [{ param: 'positionError', kind: 'range', min: 0, max: 100, unit: 'µm', dir: 'atMost' }],
  },

  /**
   * 离子束修形机。**本层做得出机器，做不出它的真空。**
   *
   * 它 `holds` 0.05–0.5 Pa：Kaufman 源真正要的是 10⁻² Pa（束流平均自由程要
   * 大于 100 mm），本层只有罗茨机组的 1 Pa。差分抽气能把源与工件之间撑到
   * 0.05 Pa —— 束流散射一半、去除函数从 FWHM 12 mm 糊到 25 mm。
   *
   * **糊了还能修面形**（面形是低频的，宽束斑反而好），**糊了修不了中频**。
   * 这一句是本层对这一台设备能说的最诚实的话。
   *
   * 由 `make/ion-beam-figuring` 装配。
   */
  {
    id: 'plant/ion-beam-figuring',
    name: 'Ion Beam Figuring Machine', name_zh: '离子束修形机',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'pressure', min: 0.05, max: 0.5 }],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 五、路线
// ═══════════════════════════════════════════════════════════════════════════

export const EUV_MIRROR_ROUTES: readonly Route[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 5.1 基板：熔石英 → λ/20
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 基板的第一条路线：石英砂 → 熔石英板 → 粗磨 → 手抛到 λ/20。
     *
     *   石英砂 4 + 尾矿 20（磨料/抛光粉）+ 水 20 → 基板 1 件（φ300×20，约 3 kg）
     *
     * 三处手艺各有出处：
     *   熔制 1 900–2 000 °C   弧炉（`plant/arc-furnace`，自衬，1 900–2 200）。石英
     *                        的软化点 1 713 °C，熔制要 1 900 以上，只有这台能到。
     *   退火 1 050–1 100 °C   电阻炉。熔石英的退火点是 1 140，以下 48 h 缓冷，
     *                        残余应力 < 1 MPa —— 应力不除，抛光后的面形会在几周里漂。
     *   手抛 λ/20             铸铁盘 + 分级石英粉，恒温间里做（19–21 °C）。
     *                        **λ/20 = 32 nm 就是本层的天花板**，问题一①。
     *
     * 为什么是"手抛"而不上机床：抛光的去除量是"按表面压力分布"决定的，
     * 而机床是按位置定的。这一层没有能控 0.1 nm 的进给，但有一双手 + 一块盘。
     */
    id: 'make/euv-substrate-300',
    name: 'EUV Substrate Manufacturing', name_zh: 'EUV 基板制造',
    produces: [
      {
        item: 'std/euv-substrate-300',
        qty: q(1),
        gives: [
          { param: 'figure', kind: 'range', min: 0, max: 32 },
          { param: 'roughness', kind: 'range', min: 0, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(4) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    needs: ['plant/metrology-room', 'plant/interferometer'],
    rate: { hours: q(124) },
    steps: [
      {
        note_zh: '熔制：石英砂 1 900–2 000 °C 熔成板，浇在石墨模里',
        performedBy: 'plant/arc-furnace',
        under: [{ param: 'temperature', min: 1900, max: 2000 }],
      },
      {
        note_zh: '退火：1 050 °C 保温 4 h，48 h 缓冷到室温（去应力 < 1 MPa）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 1050, max: 1100 }],
      },
      { note_zh: '粗磨成形：φ300×20，厚薄差 0.05 mm', performedBy: 'plant/grinder' },
      {
        note_zh: '手抛到 λ/20 = 32 nm（铸铁盘 + 石英粉，恒温间 19–21 °C）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '干涉检查：数条纹，读到 1/20 条 = 15 nm —— 而这已经比 32 nm 小一半，够判 λ/20',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * 基板的第二条路线：**离子束修形**。吃第一条的产物，把 32 nm 修到 0.1 nm。
     *
     *   基板 1 件（figure ≤ 32 nm）→ 基板 1 件（figure ≤ 0.1 nm）
     *
     * **同一个 id，两个等级** —— 这就是 `props` 那套机制存在的理由：条目只说
     * "有面形这个属性、可取 0–130 nm"，值由路线给。
     *
     * 四轮迭代的账（问题一②）：32 → 8 → 2 → 0.5 → 0.15 nm，去除总量约 30 nm，
     * 峰值去除率 20 nm/min（0.3 mA、φ12 mm、Y≈1）→ 每轮束流时间 2–8 min，
     * 四轮加装夹与复测 6 h。驻留时间图由机器人自带的算力反卷积算出来。
     *
     * ⚠️ **`figure ≤ 0.1` 是开环声明。** 每一步都靠"去掉了多少"算，不靠"现在多平"量 ——
     * 因为量不了（问题四：干涉仪读出 15 nm，差 150 倍）。这句话不能省：
     * 省了就等于假装这一层有 0.1 nm 的尺子。
     */
    id: 'make/euv-substrate-figure',
    name: 'EUV Substrate Manufacturing', name_zh: 'EUV 基板制造',
    produces: [
      {
        item: 'std/euv-substrate-300',
        qty: q(1),
        gives: [
          { param: 'figure', kind: 'range', min: 0, max: 0.1 },
          { param: 'roughness', kind: 'range', min: 0, max: 0.15 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'std/euv-substrate-300',
            qty: q(1),
            need: [
              { param: 'figure', kind: 'range', min: 0, max: 32, dir: 'atMost' },
              { param: 'roughness', kind: 'range', min: 0, max: 0.5, dir: 'atMost' },
            ],
            // 放宽到 λ/4（130 nm）只是让离子束多跑几轮：去除量从 32 涨到 130 nm，
            // 时间从 6 h 变 24 h。**功能还在，所以是降级，不是换东西。**
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: ['plant/ion-beam-figuring', 'plant/metrology-room', 'plant/interferometer'],
    rate: { hours: q(6) },
    steps: [
      { note_zh: '装夹与对位：靠 1 µm 三轴台找基准，偏心 < 0.1 mm', performedBy: 'plant/robot' },
      {
        note_zh: 'Ar⁺ 600 eV 修正四轮：驻留图 t = e ⊛⁻¹ g，1001×1001 网格，每轮 2–8 min',
        performedBy: 'plant/robot',
        under: [
          { param: 'pressure', min: 0.05, max: 0.5 },
          { param: 'temperature', min: 19, max: 21 },
        ],
      },
      {
        note_zh: '干涉复测：只能看"比上一轮好了没有"，看不出"到没到 0.1 nm"',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5.2 镜子：磁控溅射 40 对（正路）与热蒸发（反例）
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 镜子：磁控溅射 40 对 Mo/Si。**这是本文件的主路线。**
     *
     *   基板 1 件（figure ≤ 0.1）+ 氩 5 g + 标定片 1 片 → 镜子 1 件
     *
     * 五道工序（问题二的账全在注释里）：
     *
     *   ① 抽气 + 氩冲洗五轮    1 Pa → 10 Pa → 1 Pa ×5 → 氧分压 2×10⁻⁶ Pa（7 ppm）
     *   ② 烘烤除气 150 °C 4 h  腔壁吸附的水是唯一抽不掉的东西，只能烤
     *   ③ 速率标定             硅片镀 1 µm 台阶，干涉仪数 3.4 级条纹，
     *                         读到 1/20 级 = 15 nm → 1.5%/片，三片平均 0.9%
     *   ④ 镀 80 层              Mo 28 s / Si 41 s，各 +15 s = 99 s/对 → 40 对 66 min
     *   ⑤ 冷却出炉 2 h          ≤ 50 °C/h，否则 276 nm 的膜会因基底与膜的
     *                         膨胀差（Mo 5.0、Si 2.6、石英 0.55 ppm/K）开裂
     *
     * 为什么基底只要 0.1 nm 而镜子给 3 nm：276 nm 的膜厚分布 ±1 % 就是 ±2.8 nm，
     * 而"预补偿"要先知道分布、分布又要先能量膜厚（1.5 %）—— **算不出来**
     * （降级点第 2 条）。所以这条 gives 写 3 nm，是诚实的账，不是偷懒。
     *
     * `figure` 的 0.1 nm 要求写在 need 上：没有 0.1 nm 的基底，40 对界面就不同相，
     * 反射率掉到单界面水平 —— 所以放宽是 `functional-lost`（换了一个东西）。
     */
    id: 'make/euv-mirror-300',
    name: 'EUV Multilayer Mirror Manufacturing', name_zh: 'EUV 多层膜反射镜制造',
    produces: [
      {
        item: 'std/euv-mirror-300',
        qty: q(1),
        gives: [
          { param: 'period', kind: 'range', min: 6.8, max: 7.0 },
          { param: 'pairs', kind: 'range', min: 40, max: 50 },
          { param: 'figure', kind: 'range', min: 0, max: 3 },
          { param: 'roughness', kind: 'range', min: 0, max: 0.3 },
          { param: 'reflectivity', kind: 'range', min: 55, max: 70 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'std/euv-substrate-300',
            qty: q(1),
            need: [
              { param: 'figure', kind: 'range', min: 0, max: 0.1, dir: 'atMost' },
              { param: 'roughness', kind: 'range', min: 0, max: 0.5, dir: 'atMost' },
            ],
            onRelax: 'functional-lost',
          },
        ],
      },
      // 氩：五轮冲洗 0.16 g + 66 min 的 20 sccm 溅射气 2.4 g，取 5 g 含余量。
      { anyOf: [{ item: 'mat/argon', qty: q(1, 200) }] },
      // 标定片：镀 1 µm 台阶用。一片只用一次 —— 台阶一镀，它就不能再当基准了。
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
    ],
    needs: ['plant/euv-coater', 'plant/clean-room', 'plant/metrology-room', 'plant/interferometer'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh: '抽气 + 氩冲洗五轮（0.2 Pa 氧 → 2×10⁻⁶ Pa，工作气压的 7 ppm）',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1, max: 10 }],
      },
      {
        note_zh: '烘烤除气：腔壁 150 °C × 4 h，把吸附的水赶走',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 100, max: 200 }],
      },
      {
        note_zh: '速率标定：硅片镀 1 µm 台阶，干涉仪数 3.4 级条纹 → 0.9 %（三片平均）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '镀 40 对：Mo 2.8 nm/28 s、Si 4.1 nm/41 s，各 +15 s，一对 99 s，共 66 min',
        performedBy: 'plant/robot',
        under: [
          { param: 'pressure', min: 0.1, max: 1 },
          { param: 'temperature', min: 100, max: 150 },
        ],
      },
      {
        note_zh: '冷却出炉：≤ 50 °C/h，否则膜与基底的膨胀差会把它撕开',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '外观检查：斜射光看麻点。**反射率没有量具**（问题四：缺 13.5 nm 光源）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * ⚠️ **反例路线，不是替代。** 热蒸发版"多层膜"——写出来是为了让
     * "±10 % 等于没有镜子"成为数据，而不是一句注释。
     *
     * 两条物理事实：
     *   ① 钼蒸发要 2 623 °C，钨舟的实用上限约 2 000 °C，2 600 °C 还与钼成合金 ——
     *      几层就断。所以这条路线的钼层**蒸不出来**：数据上它是"借溅射的钼"，
     *      而这也正是它写在这里的意义：**蒸发对钼不是不稳，是不通**。
     *   ② 硅能蒸（1 500 °C），但从钨舟里蒸会慢慢生成硅化钨（WSi₂），舟蚀穿就断；
     *      更致命的是**蒸发速率对坩埚温度是指数的**：温度偏 10 °C，速率差一倍。
     *      热蒸发的水准就是 ±10 % —— 而这正是本层"只有蒸发"时的全部精度。
     *
     * ±10 % 的周期误差在布拉格公式下是什么（问题三）：峰从 13.5 nm 挪到 14.8 nm，
     * 而 40 × 10 % = 4 个整级 → 13.5 nm 落在第 4 个零点上，R 只剩 0.17 % 的
     * 单界面菲涅尔反射；随机化之后也不过 0.8–1.8 %。
     *
     * **所以这条路线给出的窗口是 period 6.2–7.6 nm、reflectivity 0.2–2 %。**
     * 它产出的东西在条目上叫同一个 id —— 而任何真正要镜子的地方写
     * `need period 6.8–7.0` 就会把它筛掉。这一行是 `props` 这一层机制的全部价值。
     */
    id: 'make/euv-mirror-evap',
    name: 'EUV Multilayer Mirror Manufacturing', name_zh: 'EUV 多层膜反射镜制造',
    produces: [
      {
        item: 'std/euv-mirror-300',
        qty: q(1),
        gives: [
          { param: 'period', kind: 'range', min: 6.2, max: 7.6 },
          { param: 'pairs', kind: 'range', min: 40, max: 50 },
          { param: 'figure', kind: 'range', min: 0, max: 3 },
          { param: 'roughness', kind: 'range', min: 0, max: 1.5 },
          { param: 'reflectivity', kind: 'range', min: 0.2, max: 2 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'std/euv-substrate-300',
            qty: q(1),
            need: [{ param: 'figure', kind: 'range', min: 0, max: 0.1, dir: 'atMost' }],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 1000) }] },
    ],
    needs: [],
    rate: { hours: q(10) },
    steps: [
      {
        note_zh: '抽到 1–10 Pa（罗茨机组）—— 蒸发要 10⁻³ Pa 才不掺气，这里给不出',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 1, max: 10 }],
      },
      {
        note_zh: '蒸发硅：钨舟 1 500 °C，速率 ±10 %（温度偏 10 °C，速率差一倍；舟还会慢慢生成 WSi₂）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 10 }],
      },
      {
        note_zh: '钼层：钨舟到不了 2 623 °C，2 600 °C 又与钼成合金 —— **这一层蒸不出来**，只能记作缺口',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 10 }],
      },
      { note_zh: '人工看时间开合挡板（没有晶振监控，也没有快门机构）', performedBy: 'plant/robot' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5.3 镀膜机的七个零件
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * 真空腔。钢板卷焊 + 水冷套 + 观察窗 + 烘烤夹套。
     *
     * 漏率 1×10⁻⁴ Pa·L/s：200 L 的腔，这个漏率在 1 Pa 下只贡献 5×10⁻⁷ Pa，
     * 完全不是问题 —— 因为**本层的底线不是漏率，是泵**（1 Pa 的罗茨机组）。
     * 把它做到 10⁻⁸ 也没有意义，那只会是白花的工。
     */
    id: 'make/euv-coater-chamber',
    name: 'EUV Coater Vacuum Chamber Manufacturing', name_zh: 'EUV 镀膜机真空腔制造',
    produces: [
      {
        item: 'plant/euv-coater/chamber',
        qty: q(1),
        gives: [{ param: 'leakRate', kind: 'range', min: 0, max: 1e-4 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(300) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(40) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(50) }] },
    ],
    needs: ['plant/evaporator'],
    rate: { hours: q(20) },
    steps: [
      { note_zh: '卷板、焊筒身与法兰（连续焊，不许有针孔）', performedBy: 'plant/sheet-shop' },
      { note_zh: '水冷套钎焊（铜管盘在筒身上，焊满不留气隙）', performedBy: 'plant/robot' },
      {
        note_zh: '检漏：封死保压 12 h，看压力回升（用蒸镀台那套机组，1/3 的量程就够）',
        performedBy: 'plant/robot',
      },
    ],
  },

  {
    /**
     * 抽气机组。水环泵（不要油）+ 两级罗茨 + **节流阀**。
     *
     * 与 `data/machine/vacuum.ts` 的机组是同一门手艺、同一个极限（1 Pa），
     * 差别只有一处：**这台要能在大流量下稳在 0.3 Pa**，所以多一个节流阀
     * 与一个 200 L/s 的通导。整定节流阀是这条路线真正的技术活 ——
     * 阀门开大了立不住压力，开小了氩气冲不干净靶面。
     */
    id: 'make/euv-coater-pump',
    name: 'EUV Pumping Unit Manufacturing', name_zh: 'EUV 抽气机组制造',
    produces: [
      {
        item: 'plant/euv-coater/pump',
        qty: q(1),
        gives: [{ param: 'basePressure', kind: 'range', min: 0, max: 1 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(80) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(20) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(5) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(30) }] },
    ],
    needs: [],
    rate: { hours: q(40) },
    steps: [
      {
        note_zh: '浇泵体与端盖（HT250，壁厚 8 mm 防变形）',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1300, max: 1500 }],
      },
      { note_zh: '铣 8 字形转子型线，间隙 0.1 mm', performedBy: 'plant/milling-machine' },
      { note_zh: '绕电机与阀用线圈', performedBy: 'plant/winder' },
      { note_zh: '装配、动平衡、整定节流阀', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * 磁控靶座。水冷铜背板 + 铁极 + 铜线电磁铁 + 接地屏蔽罩。
     *
     * 0.05–0.08 T 的表面场：铁极把磁力线弯成"隧道"，电子在隧道里绕圈，
     * 电离效率提高十倍 —— 这就是"磁控"两个字的全部内容，也是溅射电压能从
     * 2 000 V 降到 500 V 的原因。没有它，基底会被高能电子烤到 300 °C。
     *
     * 用电磁铁的另一层好处：磁场可调 = 速率可调，标定时它是一个旋钮。
     */
    id: 'make/euv-coater-magnetron',
    name: 'EUV Magnetron Target Holder Manufacturing', name_zh: 'EUV 磁控靶座制造',
    produces: [
      {
        item: 'plant/euv-coater/magnetron',
        qty: q(1),
        gives: [{ param: 'magneticField', kind: 'range', min: 0.05, max: 0.08 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(30) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(20) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(40) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(10) }] },
    ],
    // 车床是本路线第一道工序的执行者，所以它写在 `steps` 里、不写在这里 ——
    // 同一台设备不能既是"在场的前提"又是"干活的"（`redundant_need`）。
    needs: [],
    rate: { hours: q(30) },
    steps: [
      { note_zh: '车靶座与内部水道（铜，水道离靶面 8 mm）', performedBy: 'lathe' },
      { note_zh: '铁极成形（铣出内外极靴）', performedBy: 'plant/milling-machine' },
      { note_zh: '绕电磁铁线圈（1 200 匝，0.8 mm 漆包线）', performedBy: 'plant/winder' },
      { note_zh: '装配与测场（高斯计扫靶面，中心 0.05 T 以上）', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * 钼靶。钼粉热压烧结 + 磨面 + 锡焊到铜背板。
     *
     * 为什么是烧结不是熔铸：钼的熔点 2 623 °C，本层最高的炉子是弧炉 2 200。
     * 而热压烧结只要 1 500–1 700 °C —— **烧结是绕过熔点的老办法**（与钨、与
     * 硬质合金同一手）。
     *
     * 气氛炉要 50 ppm 以下的氧：钼在 400 °C 以上就氧化，氧化钼一进膜，
     * 界面的折射率差就没了。这一条是本路线唯一"必须"的条件。
     */
    id: 'make/euv-coater-target-mo',
    name: 'EUV Molybdenum Target Manufacturing', name_zh: 'EUV 钼靶制造',
    produces: [
      {
        item: 'plant/euv-coater/target-mo',
        qty: q(1),
        gives: [{ param: 'purity', kind: 'range', min: 99, max: 99.5 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/molybdenum-powder', qty: q(2) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(3) }] },
    ],
    needs: [],
    rate: { hours: q(12) },
    steps: [
      {
        note_zh: '热压烧结：400 °C/min 升到 1 600 °C，30 MPa 保压 2 h（密度 99 %）',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 1500, max: 1700 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      { note_zh: '磨靶面（平面度 0.05 mm 即可 —— 靶不平只影响速率分布，不影响膜厚）', performedBy: 'plant/grinder' },
      { note_zh: '锡焊到铜背板（180 °C 锡浴，焊层 < 0.1 mm 才传得动热）', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * 硅靶。石英砂碳热还原 → 工业硅 → 石墨模浇锭 → 磨面 → 锡焊。
     *
     *   SiO₂ + 2C → Si + 2CO（1 800 °C，矿热炉）
     *
     * 石英砂 3 kg + 碳 1.2 kg → 靶 1 件（约 1 kg 硅，含浇冒口与磨削）。
     * 碳热还原的产物是 **2N 工业硅**（98–99.5 %），杂质是铁、铝、钙 ——
     * 这就是"硅靶不是低阻靶"的根，也是降级点第 4 条。
     *
     * 石墨模从 φ300 碳电极上锯一段（`std/carbon-electrode-300`）：
     * 电极本来就是高纯石墨，锯下来就是模子 —— 这是它在本文件里的唯一用处。
     */
    id: 'make/euv-coater-target-si',
    name: 'EUV Silicon Target Manufacturing', name_zh: 'EUV 硅靶制造',
    produces: [
      {
        item: 'plant/euv-coater/target-si',
        qty: q(1),
        gives: [{ param: 'purity', kind: 'range', min: 98, max: 99.5 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(3) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(6, 5) }] },
      { anyOf: [{ item: 'std/carbon-electrode-300', qty: q(1) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(1, 20) }] },
    ],
    needs: [],
    rate: { hours: q(16) },
    steps: [
      {
        note_zh: '碳热还原：1 700–1 800 °C，石英砂 + 碳 → 工业硅，从炉底定期放出',
        performedBy: 'plant/submerged-arc-furnace',
        under: [{ param: 'temperature', min: 1700, max: 1800 }],
      },
      { note_zh: '浇成锭（石墨模，从碳电极上锯的一段），缓冷 8 h', performedBy: 'plant/robot' },
      { note_zh: '磨靶面 + 锡焊到铜背板', performedBy: 'plant/grinder' },
    ],
  },

  {
    /**
     * 基底台。铸铁床身 + 研磨丝杠 + 自转托盘 + 一维进给。
     *
     * 三个精度各管一件事，别混：
     *   定位 1 µm     管"镀在哪"（对镜子没用，对台阶标定片有用）
     *   自转 15 r/min 管"镀得匀不匀"——**这才是 ±1 % 那 2.8 nm 的来源**
     *   靶基距 320 mm 管"边缘会不会掉速率"（1/r² × cos⁴，φ150 靶对 φ300 基底
     *                 纯几何是中心厚 2.5 倍；再远一点只能把它压到 2 倍，
     *                 剩下的靠靶座上那块修形屏蔽罩削）
     *
     * 1 µm 的台是这一层的天花板（缩微拼版机、干涉仪工作台都是这一档）。
     * 再往上要光栅尺闭环 —— 本层能刻的是 1 200 线（100 mm 上 12 线/mm，分辨 83 µm），
     * 离 1 µm 的闭环差两个量级，所以这一步没有反馈，只有刻度盘。
     */
    id: 'make/euv-coater-stage',
    name: 'EUV Substrate Stage Manufacturing', name_zh: 'EUV 基底台制造',
    produces: [
      {
        item: 'plant/euv-coater/stage',
        qty: q(1),
        gives: [{ param: 'positionError', kind: 'range', min: 0, max: 1 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(60) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(8) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room', 'plant/interferometer', 'plant/gauge-block'],
    rate: { hours: q(60) },
    steps: [
      {
        note_zh: '浇床身（一次浇成，避免焊缝），人工时效 6 个月',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1300, max: 1450 }],
      },
      { note_zh: '刮研导轨（三块互研，每 25 mm² 20 点）', performedBy: 'plant/robot' },
      { note_zh: '磨丝杠到 5 µm/300 mm，配消隙螺母', performedBy: 'plant/grinder' },
      { note_zh: '车自转轴与托盘（端跳 < 5 µm）', performedBy: 'lathe' },
      {
        note_zh: '装配与定位检验（量块 + 干涉仪，恒温间里做）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * 快门。弹簧复位 + 电磁铁吸合，挡板 0.1 mm 低碳钢。
     *
     * 0.3 s 的响应时间是**周期公差的分母**：0.3 s × 0.10 nm/s = 0.03 nm，
     * 占 ±0.1 nm 预算的三成。做得更快没有意义（电源稳流那项也是 0.035 nm），
     * 做得更慢就吃掉一半预算。
     *
     * ⚠️ 0.3 s 是设计值，**没有示波器去直接量它**：本层有石英钟与计数器（计时不缺），
     * 缺的是"把光电管的跳变画出来"的那个东西。间接验法：镀一层 100 nm 的厚膜，
     * 用干涉仪量厚度（1.5 %）反推有效开启时间 —— 记在降级点第 6 条。
     */
    id: 'make/euv-coater-shutter',
    name: 'EUV Shutter Manufacturing', name_zh: 'EUV 快门制造',
    produces: [
      {
        item: 'plant/euv-coater/shutter',
        qty: q(1),
        gives: [{ param: 'responseTime', kind: 'range', min: 0, max: 0.3 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(1) }] },
    ],
    needs: [],
    rate: { hours: q(4) },
    steps: [
      { note_zh: '折弯挡板与导向槽', performedBy: 'plant/sheet-shop' },
      { note_zh: '车枢轴与弹簧座', performedBy: 'lathe' },
      { note_zh: '绕电磁铁 + 装配 + 调弹簧预紧（反复开合 1 000 次看卡不卡）', performedBy: 'plant/robot' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5.4 离子束修形机的三个零件
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * Kaufman 离子源。放电室 + 钼阴极丝 + 钼屏栅/加速栅 + 陶瓷绝缘子。
     *
     * 屏栅与加速栅之间 1 mm、相差 300 V —— 这个结构是"离子束"与"等离子体"
     * 的分界：栅极把离子抽出来、加速、准直，出去的是一束 600 eV 的 Ar⁺。
     *
     * 栅孔 3 000 个：冲不出来（φ0.3 mm 的冲头在 0.3 mm 钼片上会断），
     * 用光刻 + 湿法腐蚀 —— 本层的光刻是 5 µm 线宽，孔是 300 µm，绰绰有余。
     *
     * 产额与时间的关系写在问题一②：0.3 mA × 600 eV × Y≈1 → 20 nm/min。
     */
    id: 'make/ion-source',
    name: 'Ion Beam Figuring Machine Ion Source Manufacturing', name_zh: '离子束修形机离子源制造',
    produces: [
      {
        item: 'plant/ion-beam-figuring/source',
        qty: q(1),
        gives: [{ param: 'beamEnergy', kind: 'range', min: 600, max: 900, record: 'mat/ibf-beam-record' }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/molybdenum-powder', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 2) }] },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: '冲放电室与法兰（钢板 3 mm）', performedBy: 'plant/sheet-shop' },
      { note_zh: '栅极：光刻 + 腐蚀 3 000 个 φ0.3 孔，两片对准', performedBy: 'plant/mask-aligner' },
      { note_zh: '陶瓷绝缘子压制与烧结（1 200 °C）', performedBy: 'plant/high-temp-furnace' },
      { note_zh: '装钼阴极丝、调整栅距 1 mm、老练 20 h 看出束稳不稳', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * 修形真空腔。φ600×400，比镀膜腔小两号 —— 它只装一面镜子。
     *
     * 漏率取 1×10⁻⁵ Pa·L/s，比镀膜腔严一个量级：工作气压 0.05 Pa 时，
     * 同样的漏率占的比例大六倍。
     */
    id: 'make/ibf-chamber',
    name: 'Ion Beam Figuring Machine Vacuum Chamber Manufacturing', name_zh: '离子束修形机修形真空腔制造',
    produces: [
      {
        item: 'plant/ion-beam-figuring/chamber',
        qty: q(1),
        gives: [{ param: 'leakRate', kind: 'range', min: 0, max: 1e-5 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(120) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(15) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
    ],
    needs: ['plant/evaporator'],
    rate: { hours: q(16) },
    steps: [
      { note_zh: '卷焊筒身与两道法兰（连续焊）', performedBy: 'plant/sheet-shop' },
      { note_zh: '水冷套与观察窗（看束斑颜色判放电稳不稳）', performedBy: 'plant/robot' },
      { note_zh: '检漏：保压 24 h（比镀膜腔多一倍时间，因为要求严一个量级）', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * 三轴扫描台。X/Y 300 mm、1 µm 定位，Z 调焦。
     *
     * 定位误差**直接就是面形误差**：驻留时间图是"走多慢"，1 µm 的位置错
     * 乘以束斑边缘的去除率梯度（20 nm/min ÷ 5 mm = 4 nm/min/mm），
     * 得到 0.004 nm/min 的偏差；一轮 2–8 min，四轮加起来 0.1 nm 量级 ——
     * 与 0.1 nm 的公差同量级（随机方向会相消一半，所以够，但没有余量）。
     * 这就是为什么 1 µm 刚好够、10 µm 差十倍。
     */
    id: 'make/ibf-stage',
    name: 'Ion Beam Figuring Machine 3-Axis Scanning Stage Manufacturing', name_zh: '离子束修形机三轴扫描台制造',
    produces: [
      {
        item: 'plant/ion-beam-figuring/stage',
        qty: q(1),
        gives: [{ param: 'positionError', kind: 'range', min: 0, max: 1 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(40) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(10) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(3) }] },
    ],
    needs: ['plant/metrology-room', 'plant/interferometer', 'plant/gauge-block'],
    rate: { hours: q(50) },
    steps: [
      {
        note_zh: '浇铸铁床身，浇完人工时效（本层没有花岗岩，也没有 Zerodur）',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1300, max: 1450 }],
      },
      { note_zh: '刮研两轴导轨，磨丝杠到 5 µm/300 mm', performedBy: 'plant/grinder' },
      {
        note_zh: '装配与定位检验（量块 + 干涉仪，恒温间）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **EUV 镀膜机装配：腔体/泵 → 磁控/靶 → 台/挡板/气路。**
     *
     *   chamber 1 + pump 1 + magnetron 2 + target-mo 2 + target-si 2
     *   + stage 1 + shutter 1 + reactive-manifold 1 → plant/euv-coater 1 台
     *
     * `plant/euv-coater` 不再用 `composedOf`；装配是路线。
     * 真空由 `plant/euv-vacuum` 提供；先抽到 1 Pa，靶/法兰做酒精气泡检漏。
     */
    id: 'make/euv-coater',
    name: 'EUV Coater Assembly', name_zh: 'EUV 镀膜机装配',
    produces: [{ item: 'plant/euv-coater', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'plant/euv-coater/chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-coater/pump', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-coater/magnetron', qty: q(2) }] },
      { anyOf: [{ item: 'plant/euv-coater/target-mo', qty: q(2) }] },
      { anyOf: [{ item: 'plant/euv-coater/target-si', qty: q(2) }] },
      { anyOf: [{ item: 'plant/euv-coater/stage', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-coater/shutter', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-coater/reactive-manifold', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/euv-vacuum'],
    rate: { hours: q(16) },
    steps: [
      {
        note_zh:
          '① 装腔体/泵：腔体吊装、接 pump 与 plant/euv-vacuum；CF 铜垫一次用，别重复压。装配在洁净间常温，不写温度条件',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '② 装磁控/靶：2 只磁控装 Mo/Si 靶各 2 块；靶面起坑会改膜厚分布，换靶按 50 000 h 记',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '③ 装基片台/挡板/气路：stage 1 µm 定位；shutter 与反应气路接 O₂/N₂；气路检漏',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '④ 抽气/靶检漏：接 euv-vacuum 抽到 1 Pa，靶/法兰酒精气泡；没有氦检漏，漏率只到 1e-3 Pa·L/s 级',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '腔体 1 + 泵 1 + 磁控 2 + Mo 靶 2 + Si 靶 2 + 台 1 + 挡板 1 + 气路 1 → 镀膜机 1 台。part 按件，没有质量账。装配 16 h；靶按 50 000 h 磨损更换',
  },

  {
    /**
     * **离子束修形机装配：离子源 → 真空腔 → 三轴台。**
     *
     *   source 1 + chamber 1 + stage 1 → plant/ion-beam-figuring 1 台
     *
     * `plant/ion-beam-figuring` 不再用 `composedOf`；装配是路线。
     * 真空由 `plant/euv-vacuum` 提供，工作点 0.05–0.5 Pa 是降级后的宽束斑。
     */
    id: 'make/ion-beam-figuring',
    name: 'Ion Beam Figuring Machine Assembly', name_zh: '离子束修形机装配',
    produces: [{ item: 'plant/ion-beam-figuring', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'plant/ion-beam-figuring/source', qty: q(1) }] },
      { anyOf: [{ item: 'plant/ion-beam-figuring/chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/ion-beam-figuring/stage', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/euv-vacuum'],
    rate: { hours: q(16) },
    steps: [
      {
        note_zh:
          '① 装离子源：Kaufman 源装进腔体，屏栅/加速栅对中；阴极钼丝寿命 40 h，换丝要破真空',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 装三轴台：X/Y 300 mm、1 µm 定位；定位误差直接进面形，10 µm 不够',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 对准/抽气：源-台同轴，接 euv-vacuum 抽到 0.05–0.5 Pa；差分抽气把源室与工件室分开，束流散射一半',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '离子源 1 + 腔体 1 + 三轴台 1 → 修形机 1 台。part 按件，没有质量账。装配 16 h；真空只到 0.05–0.5 Pa，束斑糊到 FWHM 25 mm',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...EUV_MIRROR_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...EUV_MIRROR_ROUTES];
