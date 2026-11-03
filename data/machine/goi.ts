/**
 * 栅氧完整性（GOI）的两台自建量具 —— **铜装饰槽** 与 **电压斜坡台**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么需要它们
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `measure/si3n4-vbd` 只在探针压住的 100×100 µm pad 上测 I-V：它给的是
 * **一个点的 Vbd**，不是整片的 pinhole 密度。GOI 的标准做法有两条：
 *
 *   ① 铜装饰法（copper decoration）：铜阳极 + 偏置 + 去离子水，针孔处
 *      铜沉积，再用光学/SEM 数铜点 —— **直接数针孔**；
 *   ② 电压斜坡法（V-ramp）：0–200 V 线性升压，每步记漏电，统计击穿
 *      分布与 Weibull 斜率 —— **给击穿场分布，不直接数针孔**。
 *
 * 两条互补：铜装饰给“有几处、多大”，V-ramp 给“多高场会坏、分布多宽”。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、铜装饰槽（`plant/cu-decoration-cell`）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 设计值（Earth 工程值）：
 *
 *   电源        0–100 V，1 nA–1 mA，1 V 步进；实际装饰用 1–10 V、0.1–100 µA
 *   槽体        5 L PTFE，φ150 片架，去离子水 18 MΩ·cm（`mat/ultrapure-water`）
 *   阳极        铜片 50×50×1 mm，纯度 99.5–99.9 %（`mat/copper-anode`）
 *   阴极        片背面的铜环/铜板（只接触背面，不碰正面）
 *   装饰时间    1–10 min；针孔处 Cu²⁺ 还原成铜点，孔径被放大 1–3 倍
 *
 * 为什么电源是 0–100 V 而不是 0–10 V：装饰电流由针孔电阻决定。0.3 µm
 * 的 Si₃N₄ 上 1 µm 针孔在 5 V 下约 1–100 nA；若膜更厚/针孔更小，要更高
 * 电压才到可测电流。100 V 是**量程**，不是工作点；工作点仍取 1–10 V，
 * 以免水电解产生的气泡把针孔盖住。
 *
 * 为什么用铜而不用银/金：铜在去离子水里阳极溶解、在阴极（针孔底的硅）
 * 上还原，电位窗口最宽；银要氰化物（本层没有），金不溶解（没有离子源）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、电压斜坡台（`plant/vramp-tester`）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 设计值（Earth 工程值）：
 *
 *   电压        0–200 V，线性升压 0.1–1 V/s
 *   步进        1 mV–1 V（薄膜用 1–10 mV，厚膜用 0.1–1 V）
 *   电流        1 pA–1 mA（1 pA–1 µA 走电荷积分前端，1 µA–1 mA 走分流器）
 *   接触        1 cm² 金箔 + 保护环，30–80 个点/片（φ100–150）
 *   判据        一步内电流涨 >10×，或到 1 mA 限流，记击穿
 *   统计        Ebd = Vbd / t_ox；Weibull 斜率 β 1–3，30–80 个点击穿
 *
 * ── 复用关系（题面要求写清）─────────────────────────────────────────────
 *
 *   · **高压源**：直接取 `plant/hv-source-500v` 的六件零件（变压器 /
 *     整流 / 可控硅调压 / 1 GΩ:10 MΩ 分压 / 4½ 位表 / 屏蔽机箱）。
 *     不把整机放进 `uses` —— 设备不被消耗（`machine_consumed`）；零件各有
 *     路线（`si3n4-metrology-hardware.ts`），这里按零件重装。0–200 V 是
 *     500 V 源的下半段，粗档 1 V 步进由 `sweep-controller` 的 100:1 分压
 *     与 5 位设定细分成 1 mV–1 V。
 *   · **低电流前端**：取 `plant/cmos-test/parameter-analyzer/femto-front-end`
 *     一件（1 fA–1 µA、电荷积分、保护环、PTFE、屏蔽）。参数分析仪整机不能
 *     消耗，取它的**前端零件**；该零件有自己的路线 `make/femto-front-end`。
 *   · **校准**：装配后用 `plant/hv-source-500v` 整机做 0/50/100/150/200 V
 *     比对（它是现成的、有 4½ 位表的源），再用 `plant/probe-station/cap-standard`
 *     的 10 pF 气容做电荷积分电流校准。两者都只作前提/比对，不被消耗。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、边界（不藏）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① 铜装饰是**破坏性**的：装饰过的片不能回线。它是抽检/离线分析，
 *      不是每片全检。全检要非破坏的暗场扫描（0.09–0.10 µm、18 h/片，
 *      `plant/particle-counter`），那条只给颗粒，不给“铜点从哪来”。
 *      `plant/particle-counter-uv`（0.05 µm、5 h/片）已建但**未注册**进
 *      `tools/report/data.ts`；注册后可把 18 h/片换成 5 h/片，见测量文件头。
 *   ② 没有汞探针：`mat/mercury` 全表 0 条，汞还有毒。V-ramp 用 1 cm²
 *      金箔软接触 + 保护环；金箔的压力靠 PTFE 压簧，压力 5–20 kPa，
 *      比汞探针的 10–100 kPa 低一档 —— 接触面积的有效值按 0.8–1.0 折。
 *   ③ 没有认证的针孔标准片：密度校准只能靠重复装饰 + SEM 量铜点；
 *      密度不确定度 **20–30 %**，孔径不确定度 **±0.1 µm**
 *      （0.3–1 µm 段）到 **±2 µm**（10–50 µm 段）。
 *   ④ 200 V 的 V-ramp 只覆盖 t_ox ≤ 0.4 µm：0.4 µm 上 200 V 正好
 *      5 MV/cm，0.167 µm 上正好 12 MV/cm；更厚的膜（0.4–1 µm Si₃N₄）
 *      要 500 V，走已有的 `measure/si3n4-vbd`。两条路的窗口不重叠，
 *      不是替代关系。
 *   ⑤ 1 pA–1 µA 的电流下限是**电荷积分**的 0.1–1 pA（10 s 积分、
 *      10 pF）；1 fA 只在 |V| ≤ 1 V 成立，200 V 档的实际下限是 10 pA–
 *      1 pA。V-ramp 的漏电记录按 1 pA 起报，低于 1 pA 写“<1 pA”。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、本文件的条目
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   材料    mat/copper-anode
 *   铜槽    plant/cu-decoration-cell + 四件：tank / anode-holder /
 *           dc-supply / current-meter
 *   斜坡台  plant/vramp-tester + 三件：wafer-chuck / gate-contact /
 *           sweep-controller（高压六件与前端一件是 borrow，不重复列条目）
 *
 * 测量路线与记录在 `data/measure/goi.ts`（R13）。
 * 全部数字是**设计值**；没有 `data/measure/` 记录之前不算 L3。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、材料：铜阳极
// ═══════════════════════════════════════════════════════════════════════════

export const GOI_HW_ITEMS: readonly Item[] = [
  /**
   * 铜阳极片。**50×50×1 mm，纯度 99.5–99.9 %。**
   *
   * 它是**消耗件式的材料**，不是设备：装饰时阳极溶解，铜离子在针孔处
   * 还原。一片 50×50×1 mm 约 22.4 g；本条目的 1 kg 批次约 44 片，
   * 测量路线按 1 mg/片 记溶解量，其余阳极继续用/回收。
   *
   * 纯度为什么不写 99.99 %：本地铜的路线是火法 99.5–99.7 %
   * （`copper-fire.ts`）与湿法 99–99.9 %（`hydromet.ts`）。99.99 要
   * 电解精炼的更高档，本层没有四九铜的独立路线；99.5–99.9 足够，
   * 因为装饰只看铜离子，不看痕量杂质。杂质会留在槽里，靠换水控制。
   */
  {
    id: 'mat/copper-anode',
    name: 'Copper Anode Plate', name_zh: '铜阳极片',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99, max: 99.99, unit: '%', dir: 'atLeast' },
      { param: 'thickness', kind: 'range', min: 0.5, max: 2, unit: 'mm' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 二、铜装饰槽的四件
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * 槽体。**5 L PTFE 槽 + φ150 片架 + 排水/溢流口。**
   *
   * PTFE 而不是 PP：装饰液是 18 MΩ·cm 的去离子水，任何可溶出离子都会
   * 把电导率抬到 1 µS/cm 以上，背景电流从 nA 涨到 µA，把 1 nA 的针孔
   * 信号淹掉。PTFE 的溶出物最少；PP 便宜但会放低分子量添加剂。
   *
   * 片架只接触片背面与边缘 2 mm：正面是待装饰面，任何接触都是假针孔。
   */
  {
    id: 'plant/cu-decoration-cell/tank',
    name: 'Copper Decoration Cell Tank', name_zh: '铜装饰槽槽体',
    unit: '件',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 2, max: 10, unit: 'L' },
      { param: 'waferDiameter', kind: 'range', min: 100, max: 150, unit: 'mm' },
      { param: 'material', kind: 'enum', values: ['ptfe', 'pp'] },
    ],
  },

  /**
   * 阳极架。**铜片 50×50 mm 夹在 PTFE 架上，阳极-片距 20–50 mm。**
   *
   * 距离为什么是 20–50 mm：太近，阳极上剥落的铜粒会落到片上（假针孔）；
   * 太远，槽压升高、水电解加剧。20–50 mm 是“电场均匀 + 不落渣”的折中。
   *
   * 接触电阻 ≤0.05 Ω：阳极电流 0.1–100 µA，0.05 Ω 上的压降可忽略；
   * 但接触不良会让电流读数跳，针孔计数就不可重复。
   */
  {
    id: 'plant/cu-decoration-cell/anode-holder',
    name: 'Copper Decoration Cell Anode Rack', name_zh: '铜装饰槽阳极架',
    unit: '件',
    category: 'part',
    props: [
      { param: 'anodeArea', kind: 'range', min: 20, max: 100, unit: 'cm²' },
      { param: 'anodeDistance', kind: 'range', min: 10, max: 100, unit: 'mm' },
      { param: 'contactResistance', kind: 'range', min: 0, max: 0.1, unit: 'Ω', dir: 'atMost' },
    ],
  },

  /**
   * 0–100 V 直流电源。**1 nA–1 mA、1 V 步进、纹波 5–10 mV。**
   *
   * 它就是 `plant/hv-source-500v` 的六件 + 5:1 输出分压：500 V 源的
   * 下半段取 0–100 V。为什么不用现成的 500 V 源整机：设备不能被 `uses`
   * 消耗（`machine_consumed`）；六件零件各有路线，按零件重装是模型允许的
   * 写法（与 `make/hv-source-500v` 同一条零件链）。
   *
   * 1 V 步进对装饰够：工作点 1–10 V，V 步进只影响电流的粗调；细调靠
   * 串在槽回路里的限流电阻（10 kΩ–10 MΩ 分档），不靠电源。
   */
  {
    id: 'plant/cu-decoration-cell/dc-supply',
    name: '0–100 V DC Power Supply', name_zh: '0–100 V 直流电源',
    unit: '件',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 0, max: 100, unit: 'V' },
      { param: 'current', kind: 'range', min: 1e-9, max: 1e-3, unit: 'A' },
      { param: 'ripple', kind: 'range', min: 0, max: 10, unit: 'mV', dir: 'atMost' },
      { param: 'step', kind: 'range', min: 1, max: 1, unit: 'V' },
    ],
  },

  /**
   * 电流表。**1 nA–1 mA，分辨 1 pA–0.1 nA，准确度 3–5 %。**
   *
   * 1 nA–1 µA 走 `plant/cmos-test/parameter-analyzer/femto-front-end`
   * 的电荷积分（10 pF、10 s ⇒ 1 fA = 1 mV）；1 µA–1 mA 走 1 kΩ–1 MΩ
   * 分流电阻 + 4½ 位 DVM。两段在 1 µA 交叠，交叠点用来互校。
   *
   * 为什么准确度只到 3–5 %：装饰电流本身受针孔形状、气泡、水温影响，
   * 3–5 % 的电流准确度已经小于针孔数的泊松误差；再高没有意义。
   */
  {
    id: 'plant/cu-decoration-cell/current-meter',
    name: 'Copper Decoration Cell Ammeter', name_zh: '铜装饰槽电流表',
    unit: '件',
    category: 'part',
    props: [
      { param: 'current', kind: 'range', min: 1e-9, max: 1e-3, unit: 'A' },
      { param: 'accuracy', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
      { param: 'resolution', kind: 'range', min: 1e-12, max: 1e-9, unit: 'A', dir: 'atMost' },
    ],
  },

  /**
   * 铜装饰槽整机。**0–100 V、1 nA–1 mA、φ100–150 片。**
   *
   * 三个 `pinhole*` / `particleDensity` 属性是**整条方法**的输出窗口
   * （槽 + 已注册的旧计数器 + SEM），不是槽体单独的能量：槽只负责“把
   * 针孔变成铜点”，计数由 `plant/particle-counter`（0.09–0.10 µm、
   * 18 h/片）与 `plant/cd-sem`（0.3–50 µm 定径）完成。写在整机上，
   * 是因为测量路线需要一个能签字的执行者；与 `plant/particle-counter`
   * 把 `minParticle` 写在整机上同一条写法。
   *
   * `pinholeDensity 0.01–10 /cm²`：φ100 上 1 颗 = 0.0127 /cm²，φ150 上
   * 1 颗 = 0.0057 /cm²；0.01 是**两档片合并的方法下限**，不是每片都能
   * 报到 0.01。定量段 0.1–10 /cm²（泊松误差 10–30 %）。
   *
   * `pinholeDiameter 0.3–50 µm`：0.3 µm 是 SEM/暗场计数对铜点的分辨下限
   * （铜点被放大 1–3 倍，实际针孔 0.1–0.3 µm 可检出但定不准）；50 µm
   * 以上按“大孔/裂纹”另记，不混进针孔密度。
   */
  {
    id: 'plant/cu-decoration-cell',
    name: 'Copper Decoration Cell System', name_zh: '铜装饰槽整机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/voltage', kind: 'range', min: 0, max: 100, unit: 'V' },
      { param: 'current', kind: 'range', min: 1e-9, max: 1e-3, unit: 'A' },
      { param: 'waferDiameter', kind: 'range', min: 100, max: 150, unit: 'mm' },
      { param: 'measure/pinholeDensity', kind: 'range', min: 0.01, max: 10, unit: '个/cm²' },
      { param: 'measure/pinholeDiameter', kind: 'range', min: 0.3, max: 50, unit: 'µm' },
      { param: 'measure/particleDensity', kind: 'range', min: 0.01, max: 100, unit: '个/cm²' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 三、V-ramp 台的三件
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * 片台。**φ150 铝台 + 背面铜接触环 + 平面度 2–5 µm。**
   *
   * 背面接触必须整圈：V-ramp 的电流是 1 pA–1 mA，背面只压一个点会让
   * 接触电阻随压力漂，漏电曲线跟着跳。铜环 + PTFE 绝缘座把背面做成
   * 等电位；正面金箔只压 1 cm²，其余面积用保护环挡住。
   */
  {
    id: 'plant/vramp-tester/wafer-chuck',
    name: 'Voltage Ramp Tester Wafer Chuck', name_zh: '电压斜坡台片台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'waferDiameter', kind: 'range', min: 100, max: 150, unit: 'mm' },
      { param: 'contactArea', kind: 'range', min: 50, max: 200, unit: 'cm²' },
      { param: 'flatness', kind: 'range', min: 0, max: 10, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * 正面金箔接触。**1 cm² 金箔 + PTFE 压簧 + 保护环，压力 5–20 kPa。**
   *
   * 为什么是金箔而不是汞：`mat/mercury` 全表 0 条，汞还有毒、会汞齐化
   * 铝台。金箔软、惰性、不会给氧化层注入金属；1 cm² 的面积让一片
   * φ100 能排 30–78 个点，φ150 能排 30–176 个点。
   *
   * 压力 5–20 kPa：太低接触不全（有效面积 <0.5 cm²），太高会压裂
   * 0.3 µm 的 Si₃N₄ 膜。5–20 kPa 是“接触上、不压裂”的窗口；有效面积
   * 按 0.8–1.0 折，写进测量路线的不确定度。
   */
  {
    id: 'plant/vramp-tester/gate-contact',
    name: 'Voltage Ramp Tester Front Gold-Foil Contact', name_zh: '电压斜坡台正面金箔接触',
    unit: '件',
    category: 'part',
    props: [
      { param: 'contactArea', kind: 'range', min: 0.5, max: 10, unit: 'cm²' },
      { param: 'pressure', kind: 'range', min: 1, max: 50, unit: 'kPa' },
      { param: 'material', kind: 'enum', values: ['gold', 'copper'] },
    ],
  },

  /**
   * 扫点控制器。**0–200 V、0.1–1 V/s、1 mV–1 V 步进。**
   *
   * 斜坡不是 DAC：本层没有 12 位以上的 DAC。用**恒流充电容**做：
   * I/C = 0.1–1 V/s（1 µA / 1 µF = 1 V/s），端点锚在齐纳 6.2 V，
   * 中间用 100 kHz 石英计数插值；步进由 100:1 分压 + 5 位十进制设定
   * 细分成 1 mV（62 µV/步 × 100 = 6.2 mV，零位表 1 µV 内插到 1 mV）。
   * 这与 `plant/cmos-test/parameter-analyzer/hv-source-200v-precision`
   * 的精密环是同一套算术，只是这里把环做进扫点器。
   *
   * 0.1–1 V/s 与 1 mV 步进的关系：1 mV / 0.1 V/s = 10 ms/步，
   * 100 kHz 计数有 1000 个数，够；1 V 步进 / 1 V/s = 1 s/步，也够。
   */
  {
    id: 'plant/vramp-tester/sweep-controller',
    name: 'Voltage Ramp Tester Sweep Controller', name_zh: '电压斜坡台扫点控制器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 0, max: 200, unit: 'V' },
      { param: 'rampRate', kind: 'range', min: 0.1, max: 1, unit: 'V/s' },
      { param: 'step', kind: 'range', min: 1e-3, max: 1, unit: 'V' },
      { param: 'accuracy', kind: 'range', min: 0, max: 0.1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 电压斜坡台整机。**0–200 V、0.1–1 V/s、1 pA–1 mA、30–80 点/片。**
   *
   * 九个属性里，前五个是硬件量程，后四个是**方法输出窗口**：
   *
   *   thickness   0.0035–0.4 µm   200 V 在 0.4 µm 上 = 5 MV/cm、
   *                                0.167 µm 上 = 12 MV/cm；3.5 nm 是
   *                                本层栅氧 EOT 的下限（`mat/gate-oxide-wafer`）
   *   vbd         0–200 V          击穿电压；200 V 未击穿记右删失
   *   ebd         5–12 MV/cm       击穿场；= vbd / t_ox
   *   weibullBeta 1–3              30–80 点的 Weibull 斜率；β 的标准误
   *                                ≈ β/√N，30 点约 ±0.2–0.5
   *
   * 为什么 β 只到 1–3：β<1 是“早期失效”分布，说明片子有 gross defect，
   * 不适合报本征击穿；β>3 是极均匀的氧化层，本层 0.3–1 µm 的 LPCVD
   * Si₃N₄ 与 4 nm 热氧都到不了。1–3 是“可用的栅氧”窗口，不是仪器极限。
   */
  {
    id: 'plant/vramp-tester',
    name: 'Voltage Ramp Tester System', name_zh: '电压斜坡台整机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/voltage', kind: 'range', min: 0, max: 200, unit: 'V' },
      { param: 'rampRate', kind: 'range', min: 0.1, max: 1, unit: 'V/s' },
      { param: 'step', kind: 'range', min: 1e-3, max: 1, unit: 'V' },
      { param: 'current', kind: 'range', min: 1e-12, max: 1e-3, unit: 'A' },
      { param: 'waferDiameter', kind: 'range', min: 100, max: 150, unit: 'mm' },
      { param: 'thickness', kind: 'range', min: 0.0035, max: 0.4, unit: 'µm' },
      { param: 'measure/vbd', kind: 'range', min: 0, max: 200, unit: 'V' },
      { param: 'measure/ebd', kind: 'range', min: 5, max: 12, unit: 'MV/cm' },
      { param: 'measure/weibullBeta', kind: 'range', min: 1, max: 3, unit: '1' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 四、硬件产出路线
// ═══════════════════════════════════════════════════════════════════════════

export const GOI_HW_ROUTES: readonly Route[] = [
  {
    /**
     * **铜阳极：轧到 1 mm → 切 50×50 → 退火 → 去油冲洗。**
     *
     *   铜 1 + 水 1 → 阳极 1 kg
     *
     * 退火 300–400 °C / 1 h：轧制铜的位错密度高，阳极溶解会沿晶界
     * 优先，铜粒脱落到槽里就是假针孔。退火把晶粒长大、溶解均匀。
     *
     * 水是去油与冲洗，不进产品；质量账差 1 kg，按 `unbalanced_zh` 声明。
     */
    id: 'make/copper-anode',
    name: 'Copper Anode Production', name_zh: '铜阳极制备',
    produces: [
      {
        item: 'mat/copper-anode',
        qty: q(1),
        gives: [
          { param: 'purity', kind: 'range', min: 99.5, max: 99.9 },
          { param: 'thickness', kind: 'range', min: 1, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: [],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '① 轧到 1.0 ±0.05 mm，切 50×50 mm；去毛刺，边角倒圆（尖角会让电场集中，装饰时先击穿水）',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh:
          '② 退火 300–400 °C / 1 h，随炉冷；晶粒长大到 20–50 µm，阳极溶解均匀（不退火会沿晶界掉铜粒，变成假针孔）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 300, max: 400 }],
      },
      {
        note_zh: '③ 碱洗去油 → 去离子水冲 → 氮吹干；表面水膜连续不破为净',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 30 }],
      },
    ],
    unbalanced_zh:
      '铜 1 kg + 水 1 kg → 阳极 1 kg；水是去油/冲洗，不进产品，差 1 kg 是水与切屑。产物按 kg 计，铜的纯度按 99.5–99.9 % 记',
  },

  {
    /**
     * **铜槽槽体：PTFE 板焊成 5 L 槽 → 装片架/排水 → 水试漏。**
     *
     *   PTFE 3 + 钢板 2 + 铜线 0.1 → 槽体 1 件
     *
     * PTFE 焊接是热风焊：340–380 °C 的氮气把 PTFE 表面烧到熔融，压辊
     * 贴合。本层没有 PTFE 焊条，用同材切条；焊缝要全焊透，否则 5 L 水
     * 会在 0.6 kPa 的火星大气下从焊缝渗气。
     */
    id: 'make/cu-decoration-tank',
    name: 'Copper Decoration Cell Tank Manufacturing', name_zh: '铜装饰槽槽体制造',
    produces: [
      {
        item: 'plant/cu-decoration-cell/tank',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 5, max: 5 },
          { param: 'waferDiameter', kind: 'range', min: 100, max: 150 },
          { param: 'material', kind: 'enum', oneOf: ['ptfe'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ptfe', qty: q(3) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
    ],
    needs: [],
    rate: { hours: q(16) },
    steps: [
      {
        note_zh:
          '① PTFE 板下料、热风焊成 5 L 方槽（340–380 °C 氮气，焊缝双面焊透）；槽口加 20 mm 法兰',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh:
          '② 装 φ150 片架（只接触背面与边缘 2 mm）、排水阀与溢流口；不锈钢外套承压 100–500 kPa',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '③ 水试漏：装满去离子水静置 1 h，焊缝与阀口无渗；擦干后测绝缘 ≥1 GΩ（电极不装）',
        performedBy: 'plant/robot',
      },
    ],
  },

  {
    /**
     * **阳极架：铜板夹持 + PTFE 架 + 距离调节。**
     *
     *   铜 0.5 + PTFE 0.1 + 不锈钢 0.2 → 阳极架 1 件
     *
     * 阳极与片的距离用 PTFE 隔套定：20/30/40/50 mm 四档。距离变了，
     * 同样电压下的电流变，所以每换一档要重记背景电流。
     */
    id: 'make/cu-decoration-anode-holder',
    name: 'Copper Decoration Cell Anode Rack Manufacturing', name_zh: '铜装饰槽阳极架制造',
    produces: [
      {
        item: 'plant/cu-decoration-cell/anode-holder',
        qty: q(1),
        gives: [
          { param: 'anodeArea', kind: 'range', min: 50, max: 50 },
          { param: 'anodeDistance', kind: 'range', min: 20, max: 50 },
          { param: 'contactResistance', kind: 'range', min: 0.01, max: 0.05 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 5) }] },
    ],
    needs: [],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① 铜板夹持框（50×50 mm 有效面积 25 cm²，双面）与 PTFE 隔套 20/30/40/50 mm 四档；铜-铜接触面镀锡？不 —— 镀锡会溶进槽，用压接 + 0.05 Ω 判据',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '② 四线测接触电阻：0.1 A 下压降 ≤5 mV（≤0.05 Ω），不合格重压',
        performedBy: 'plant/robot',
      },
    ],
  },

  {
    /**
     * **0–100 V 电源：hv-source-500v 六件 + 5:1 分压 → 100 V / 1 mA。**
     *
     *   六件 + 电阻网络 1 + 氧化铝 0.1 + 铜线 0.1 → 电源 1 件
     *
     * 5:1 分压把 500 V 满量程变成 100 V；分压比用 1 GΩ:250 MΩ
     * （250 MΩ 由 250 只 1 MΩ 薄膜电阻串联 —— `std/resistor-network-general`
     * 单只最大 1 MΩ，只能串；串联后温漂按同一批电阻的匹配走）。
     * 1 V 步进不变；纹波从 10–50 mV 降到 5–10 mV（分压也分掉纹波）。
     *
     * 为什么保留 1 mA 限流：装饰电流正常 0.1–100 µA；1 mA 是“针孔连成
     * 一片”的故障上限，到 1 mA 就停，免得把整片铜化。
     */
    id: 'make/cu-decoration-dc-supply',
    name: '0–100 V DC Power Supply Manufacturing', name_zh: '0–100 V 直流电源制造',
    produces: [
      {
        item: 'plant/cu-decoration-cell/dc-supply',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 0, max: 100 },
          { param: 'current', kind: 'range', min: 1e-9, max: 1e-3 },
          { param: 'ripple', kind: 'range', min: 5, max: 10 },
          { param: 'step', kind: 'range', min: 1, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/hv-source-500v/transformer', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-source-500v/rectifier', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-source-500v/regulator', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-source-500v/divider', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-source-500v/meter', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-source-500v/enclosure', qty: q(1) }] },
      { anyOf: [{ item: 'std/resistor-network-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh:
          '① 装六件：变压器 / 整流 / 可控硅调压 / 1 GΩ:10 MΩ 分压 / 4½ 位表 / 屏蔽机箱；把 500 V 输出改成 5:1 分压后的 0–100 V 输出',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 老化 8 h + 三点校准：0 / 50 / 100 V，用 1 GΩ:10 MΩ 分压与 4½ 位表；1 nA/1 µA/1 mA 三档用 1 GΩ/1 MΩ/1 kΩ 取样电阻校',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 纹波：示波器看 100 Hz 纹波 ≤10 mV；超了加一级 LC（铜线 0.1 kg 绕 100 匝 + 10 µF 薄膜电容）',
        performedBy: 'plant/robot',
      },
    ],
  },

  {
    /**
     * **电流表：femto 前端 + 4½ 位 DVM + 1 kΩ–1 MΩ 分流。**
     *
     *   前端 1 + DVM 1 + 电阻网络 1 + 铜线 0.1 + 钢板 0.5 → 电流表 1 件
     *
     * 1 nA–1 µA：前端电荷积分（10 pF、10 s），1 fA = 1 mV；
     * 1 µA–1 mA：分流电阻 1 kΩ/10 kΩ/1 MΩ + DVM。两段在 1 µA 交叠。
     *
     * 前端是 `plant/cmos-test/parameter-analyzer/femto-front-end`
     * 的**零件**，不是整机 —— 参数分析仪整机不能被消耗，取它的前端
     * 与 `make/femto-front-end` 的路线。
     */
    id: 'make/cu-decoration-current-meter',
    name: 'Copper Decoration Cell Ammeter Manufacturing', name_zh: '铜装饰槽电流表制造',
    produces: [
      {
        item: 'plant/cu-decoration-cell/current-meter',
        qty: q(1),
        gives: [
          { param: 'current', kind: 'range', min: 1e-9, max: 1e-3 },
          { param: 'accuracy', kind: 'range', min: 3, max: 5 },
          { param: 'resolution', kind: 'range', min: 1e-12, max: 1e-10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/cmos-test/parameter-analyzer/femto-front-end', qty: q(1) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/resistor-network-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '① 装 femto 前端（1 fA–1 µA）与 1 kΩ/10 kΩ/1 MΩ 分流 + 4½ 位 DVM；切换开关用镀金触点',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 校准：1 nA 用 1 GΩ 电阻 + 1 V 源、1 µA 用 1 MΩ + 1 V、1 mA 用 1 kΩ + 1 V；三点误差 ≤5 %，交叠点 1 µA 两段差 ≤3 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '前端 1 + DVM 1 + 电阻网络 1 + 铜线 0.1 + 钢板 0.5 kg → 电流表 1 件；产物按件计，kg 项是机箱与连线，余是边角料',
  },

  {
    /**
     * **铜装饰槽整机：槽 + 阳极架 + 电源 + 电流表 → 一台。**
     *
     *   四件 + 铜 0.2 + 铜线 0.1 + PTFE 0.1 → 槽 1 台
     *
     * 验收三步：
     *   ① 空槽绝缘：不装片、不装阳极，100 V 下漏电 ≤1 nA；
     *   ② 背景：装阳极与空白片（无膜硅片，无针孔），1–10 V 下背景电流
     *      ≤1 nA；背景 >1 nA 说明水或槽污染，换水；
     *   ③ 装饰均匀性：同一片重复装饰 3 次，铜点数差 ≤20 %。
     */
    id: 'make/cu-decoration-cell',
    name: 'Copper Decoration Cell System Manufacturing', name_zh: '铜装饰槽整机制造',
    produces: [
      {
        item: 'plant/cu-decoration-cell',
        qty: q(1),
        gives: [
          { param: 'measure/voltage', kind: 'range', min: 0, max: 100 },
          { param: 'current', kind: 'range', min: 1e-9, max: 1e-3 },
          { param: 'waferDiameter', kind: 'range', min: 100, max: 150 },
          { param: 'measure/pinholeDensity', kind: 'range', min: 0.01, max: 10, record: 'mat/goi-pinhole-record' },
          { param: 'measure/pinholeDiameter', kind: 'range', min: 0.3, max: 50 },
          { param: 'measure/particleDensity', kind: 'range', min: 0.01, max: 100 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/cu-decoration-cell/tank', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cu-decoration-cell/anode-holder', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cu-decoration-cell/dc-supply', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cu-decoration-cell/current-meter', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(16) },
    steps: [
      {
        note_zh:
          '① 装槽、片架、阳极架、电源与电流表；阴极铜环只接触片背面，正面悬空；所有接线用 PTFE 绝缘',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 空槽绝缘：注 5 L 去离子水（18 MΩ·cm），不装片/阳极，100 V 下漏电 ≤1 nA；否则洗槽换水',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 背景与均匀性：空白硅片（无膜）1–10 V 下背景 ≤1 nA；同一片装饰 3 次，铜点数差 ≤20 %；记下背景电流，测量时扣除',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '四件 + 铜 0.2 + 铜线 0.1 + PTFE 0.1 kg → 槽 1 台；产物按台计，kg 项是阴极/连线/绝缘，余是切边。四件各有路线，不折 kg',
  },

  {
    /**
     * **片台：铝台车平 → 装铜背接触环 → 平面度 2–5 µm。**
     *
     *   铝 3 + PTFE 0.2 + 铜 0.5 + 不锈钢 0.5 → 片台 1 件
     *
     * 平面度 2–5 µm 是“1 cm² 金箔能压全”的下限：片厚 0.5–0.7 mm，
     * 台面 5 µm 的起伏让压力从 20 kPa 掉到 5 kPa，接触面积掉一半。
     */
    id: 'make/vramp-wafer-chuck',
    name: 'Voltage Ramp Tester Wafer Chuck Manufacturing', name_zh: '电压斜坡台片台制造',
    produces: [
      {
        item: 'plant/vramp-tester/wafer-chuck',
        qty: q(1),
        gives: [
          { param: 'waferDiameter', kind: 'range', min: 100, max: 150 },
          { param: 'contactArea', kind: 'range', min: 100, max: 150 },
          { param: 'flatness', kind: 'range', min: 2, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(3) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 2) }] },
    ],
    needs: [],
    rate: { hours: q(12) },
    steps: [
      {
        note_zh: '① 车 φ170 铝台，端面车平；研磨平板对研到 2–5 µm（塞尺/平晶干涉）',
        performedBy: 'lathe',
      },
      {
        note_zh: '② 装铜背接触环（整圈，宽 8 mm）与 PTFE 绝缘座；铜环上表面与铝台同高 ±5 µm',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '③ 平面度复测：φ100 与 φ150 两种片各压一次，1 cm² 金箔接触面积 ≥0.8 cm²',
        performedBy: 'plant/robot',
      },
    ],
  },

  {
    /**
     * **金箔接触：1 cm² 金箔 + PTFE 压簧 + 保护环。**
     *
     *   金 0.04 g + PTFE 0.2 + 铜 0.2 + 钢板 0.5 → 接触头 1 件
     *
     * 金箔 0.02 mm 厚：软到能贴合 5 µm 的起伏，又不会像 0.1 mm 箔那样
     * 把压力全吃在自己身上。保护环是铜环 + PTFE 隔离，接到 Guard，
     * 把边缘的表面漏电引走 —— 没有它，1 pA 档的读数就是环的漏电。
     */
    id: 'make/vramp-gate-contact',
    name: 'Voltage Ramp Tester Front Gold-Foil Contact Manufacturing', name_zh: '电压斜坡台正面金箔接触制造',
    produces: [
      {
        item: 'plant/vramp-tester/gate-contact',
        qty: q(1),
        gives: [
          { param: 'contactArea', kind: 'range', min: 1, max: 1 },
          { param: 'pressure', kind: 'range', min: 5, max: 20 },
          { param: 'material', kind: 'enum', oneOf: ['gold'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/gold', qty: q(1, 25000) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 2) }] },
    ],
    needs: [],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh:
          '① 裁 10×10 mm 金箔（0.02 mm），边缘卷到铜环上；背面贴 PTFE 压簧（5–20 kPa，用 50 g 铜块标定压缩量）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '② 装保护环：铜环内径 12 mm、外径 30 mm，与金箔绝缘 0.2 mm；Guard 引线单独屏蔽',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '③ 接触面积校验：压到空白硅片上，用复写纸/压痕量 10×10 mm；边缘不翘、面积 0.8–1.0 cm²',
        performedBy: 'plant/robot',
      },
    ],
  },

  {
    /**
     * **扫点控制器：恒流充电容斜坡 + 100:1 分压 + 5 位设定。**
     *
     *   控制器 1 + 运放 2 + 齐纳 1 + 电阻网络 2 + 薄膜电容 2 + DVM 1
     *     + 氧化铝 0.2 + 铜线 0.2 + 钢板 0.5 → 扫点器 1 件
     *
     * 斜坡：1 µA 充 1 µF = 1 V/s；1 µA 充 10 µF = 0.1 V/s。端点锚在
     * 齐纳 6.2 V，中间 100 kHz 计数插值。步进：100:1 分压 + 5 位十进制
     * 设定（62 µV/步）+ 零位表 1 µV 内插 ⇒ 1 mV。
     *
     * 这与 `make/hv-source-200v-precision` 的精密环同一套算术；差别是
     * 那台要“停在某点”，这台要“连续走”，所以斜坡用电容充放电而不是
     * 继电器阶梯。
     */
    id: 'make/vramp-sweep-controller',
    name: 'Voltage Ramp Tester Sweep Controller Manufacturing', name_zh: '电压斜坡台扫点控制器制造',
    produces: [
      {
        item: 'plant/vramp-tester/sweep-controller',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 0, max: 200 },
          { param: 'rampRate', kind: 'range', min: 0.1, max: 1 },
          { param: 'step', kind: 'range', min: 1e-3, max: 1 },
          { param: 'accuracy', kind: 'range', min: 0.05, max: 0.1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/process-controller-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/resistor-network-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh:
          '① 装积分斜坡：1 µA/10 µF = 0.1 V/s、1 µA/1 µF = 1 V/s 两档；齐纳 6.2 V 锚端点，100 kHz 石英计数',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 装 100:1 精密分压与 5 位十进制设定；零位表 1 µV 内插 ⇒ 1 mV 步进；0–200 V 线性 ≤0.1 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 斜率校准：0.1 / 0.5 / 1 V/s 三点，用 100:1 分压 + DVM 记 0→200 V 的时间；误差 >1 % 调积分电容',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **V-ramp 整机：hv-source 六件 + femto 前端 + 三件 → 一台。**
     *
     *   六件 + 前端 1 + 三件 + 铜线 0.2 + 钢板 1 + PTFE 0.1 → 一台
     *
     * 与 `make/hv-source-500v` 的关系：这里用的是它的六件**零件**，
     * 不是整机（设备不能被 `uses` 消耗）。与参数分析仪的关系：这里用的是
     * 它的 `femto-front-end` **零件**，不是整机。两条都是“借用零件，
     * 不借用成品”，因为成品是设备、不会被吃掉。
     *
     * 验收：
     *   ① 电压：0/50/100/150/200 V，用 `plant/hv-source-500v` 整机比对，
     *      误差 ≤0.1 %；
     *   ② 电流：`plant/probe-station/cap-standard` 的 10 pF 气容 +
     *      1 V/s 斜坡 ⇒ I = C·dV/dt = 10 pA；1 GΩ + 100 V ⇒ 100 nA；
     *   ③ 空白片：无膜硅片 200 V 下漏电 ≤1 pA（说明夹具绝缘够）。
     */
    id: 'make/vramp-tester',
    name: 'Voltage Ramp Tester System Manufacturing', name_zh: '电压斜坡台整机制造',
    produces: [
      {
        item: 'plant/vramp-tester',
        qty: q(1),
        gives: [
          { param: 'measure/voltage', kind: 'range', min: 0, max: 200 },
          { param: 'rampRate', kind: 'range', min: 0.1, max: 1 },
          { param: 'step', kind: 'range', min: 1e-3, max: 1 },
          { param: 'current', kind: 'range', min: 1e-12, max: 1e-3 },
          { param: 'waferDiameter', kind: 'range', min: 100, max: 150 },
          { param: 'thickness', kind: 'range', min: 0.0035, max: 0.4 },
          { param: 'measure/vbd', kind: 'range', min: 0, max: 200 },
          { param: 'measure/ebd', kind: 'range', min: 5, max: 12 },
          { param: 'measure/weibullBeta', kind: 'range', min: 1, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/hv-source-500v/transformer', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-source-500v/rectifier', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-source-500v/regulator', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-source-500v/divider', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-source-500v/meter', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-source-500v/enclosure', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cmos-test/parameter-analyzer/femto-front-end', qty: q(1) }] },
      { anyOf: [{ item: 'plant/vramp-tester/wafer-chuck', qty: q(1) }] },
      { anyOf: [{ item: 'plant/vramp-tester/gate-contact', qty: q(1) }] },
      { anyOf: [{ item: 'plant/vramp-tester/sweep-controller', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
    ],
    needs: [
      'plant/clean-room',
      'plant/metrology-room',
      'plant/probe-station/cap-standard',
    ],
    rate: { hours: q(40) },
    steps: [
      {
        note_zh:
          '① 装高压六件、扫点器、片台与金箔接触头；高压走线 ≥8 mm 爬电距离，Guard 与机箱单点接地',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 装 femto 前端与 1 kΩ–1 MΩ 分流：1 pA–1 µA 走积分、1 µA–1 mA 走分流；交叠点 1 µA 两段差 ≤3 %',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 电压比对：`plant/hv-source-500v` 整机出 0/50/100/150/200 V，经 100:1 分压与 5½ 位表读；vramp 设定逐点对齐，误差 ≤0.1 %',
        performedBy: 'plant/hv-source-500v',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '④ 电流校准：10 pF 气容 + 1 V/s ⇒ 10 pA；1 GΩ + 100 V ⇒ 100 nA；1 kΩ + 1 V ⇒ 1 mA。空白硅片 200 V 漏电 ≤1 pA',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑤ 验收：0.05 / 0.1 µm 标准片与 4 nm 栅氧片各 1 片；30 点击穿场重复性 ≤5 %，β 重复性 ±0.3',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'hv-source 六件 + femto 前端 1 + 三件 + 铜线 0.2 + 钢板 1 + PTFE 0.1 kg → V-ramp 台 1 台；产物按台计，kg 项是机箱/连线/绝缘。六件与前端都是**借用零件**，不把 hv-source 或参数分析仪整机消耗掉',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...GOI_HW_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...GOI_HW_ROUTES];
