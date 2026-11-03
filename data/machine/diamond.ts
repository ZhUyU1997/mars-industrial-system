/**
 * 金刚石链 —— 从大气里的碳到 50 nm 的金刚石三棱锥压头。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 这一条补的是什么
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 以前全仓没有 `mat/diamond`：天然矿没有，HPHT 要 5–6 GPa（本层最高静压力是
 * `plant/autoclave` 的 10–35 MPa），CVD 要 700–1000 °C 的 H₂/CH₄ 且要晶种。
 * 于是 `plant/nanoindenter/head` 原来只能进口，本地退到 0.5–2 µm 的碳化钨备用针
 * （`make/nanoindenter-tip`）—— 比 50 nm 粗 10–40 倍。**2026-10-20 已建
 * `make/nanoindenter-head`（本文件下半），这句只作历史。**
 *
 * 本轮把这条链**造出来**，不再以“本层没有金刚石”收尾：
 *
 *   碳（CO₂ + H₂ → C）→ 酸洗降灰 → 六面顶 HPHT 合成 → 金刚石
 *   金刚石 → 破碎/球磨/水选分级 → 0.05–0.1 µm 微粉
 *   微粉 + Ni → 5–6 GPa 烧结 → 金刚石坯片（PCD）
 *   坯片 → 三面 65.27° 研磨 → 0.05 µm 微粉 + 锡盘抛光 → 压头
 *
 * 每一段都是设计值（design value），没有一条 `measure/*` 记录。理由见最后
 * 「量具缺口」——尖端半径可以看，但还不能作为“已测”签字。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么选 HPHT，不选 CVD
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 两条路都查过，选 HPHT 的理由是“本层已经有的东西更多”，不是“CVD 不可能”：
 *
 *   HPHT   要一台六面顶压机 + 硬质合金顶锤 + 合成块；碳、铁、镍、WC、
 *          45 钢、耐火料、石墨/碳、变压器、控制器都在闭包里。只新增一台
 *          设备，其余是零件与工艺。
 *
 *   CVD    要 700–1000 °C、H₂/CH₄ 1–5%、10–100 Torr（1.3–13.3 kPa）的
 *          微波等离子体或热丝反应器，还要金刚石晶种起核。本层现有：
 *            · `plant/w-cvd-reactor`   350–500 °C，0.5–10 kPa —— 温度差 200–500 K；
 *            · `plant/lpcvd-furnace`   700–780 °C，13–40 kPa —— 温度够，压力
 *              上限超出 3 倍，且是热壁 LPCVD，没有原子氢源；
 *            · `plant/atmosphere-furnace` 600–2000 °C，但没有 10–100 Torr 的
 *              压力控制，也没有 H₂/CH₄ 配比与晶种。
 *          生长速率 1–10 µm/h，长 3 mm 的坯要 **300–3000 h**；HPHT 烧结
 *          同尺寸 PCD 坯只要 10–30 min。
 *
 * 所以本文件把 HPHT 写成主路线；CVD 作为备选记在 `plant/hpht-press` 的注释里
 * （见「备选：CVD 金刚石」一节），差距是“一台新反应器 + 晶种 + 300–3000 h”。
 * 这符合 R8：降级/备选要同时写恢复原规格的条件与缺口量级。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六面顶压机的设计值
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ｜项目        ｜设计值                                              ｜
 *   ｜机架        ｜25 MN（2500 t）四柱板框，去应力 550–650 °C          ｜
 *   ｜液压缸      ｜φ450 × 150 mm，水压 120–160 MPa（不用液压油）      ｜
 *   ｜顶锤        ｜WC-Ni（8 % Ni），φ100 × 90 mm，台面 20 × 20 mm      ｜
 *   ｜            ｜45° 倒角、12° 退刀；单只约 7.8 kg，六只              ｜
 *   ｜顶锤寿命    ｜1000–3000 次（5–6 GPa，设计值）                      ｜
 *   ｜            ｜工业 HIP 件 3000–5000 次；本层无 HIP，取低档        ｜
 *   ｜合成块      ｜32 × 32 × 32 mm，φ18 腔；传压介质用耐火粘土替代     ｜
 *   ｜加热        ｜碳管 φ12/φ10 × 22 mm，8–20 kW；次级 2–6 V / 5–10 kA   ｜
 *   ｜控温        ｜光电高温计 + 过程控制器，1300–1500 °C，±10 °C       ｜
 *   ｜腔体        ｜5–6 GPa / 1300–1500 °C / 保温 10–30 min             ｜
 *
 * ⚠️ **压力单位**：本仓 `Condition` 的压力一律用 kPa（`plant/autoclave` 的
 *    10–35 MPa 写作 10000–35000）。所以 5–6 GPa 写成 5000000–6000000 kPa，
 *    不是 5–6。写成 5–6 会被读成 5–6 kPa，与火星大气 0.6 kPa 同一档。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 叶腊石：本层没有矿，用耐火粘土替代（R8 降级，写清升级路线）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 工业六面顶的传压介质是**叶腊石**（pyrophyllite，Al₂Si₄O₁₀(OH)₂）：软、绝缘、
 * 在 5 GPa 下会转变为柯石英/蓝晶石，把压力均匀传进腔体。全仓没有叶腊石条目，
 * 火星也没有已探明的叶腊石矿。这里用 `mat/refractory`（45 % Al₂O₃ 的耐火粘土，
 * `make/refractory-brick`）先压成 32 mm 的传压介质块
 * `mat/hpht-pressure-medium`（`make/hpht-pressure-medium`），再装成合成块，
 * **不假装它是叶腊石**：
 *
 *   代价   摩擦系数高 1.5–2 倍 ⇒ 顶锤力要多留 10–20 %；
 *          热导率高 3–5 倍 ⇒ 加热功率多 20–30 %，腔体边缘温度梯度更大；
 *          重复使用 1–2 次就裂（叶腊石 5–10 次）。
 *
 *   升级   找到/合成叶腊石后换回：叶腊石矿（水热蚀变）或
 *          高岭石 + 石英在 300–500 °C / 100–200 MPa 水热合成。本层 `autoclave`
 *          只到 35 MPa，差 3–6 倍；合成路线本身是另一条未写的链。
 *
 * 合成块是**消耗件**（每批一只），不是压机零件；它不进 `composedOf`，进
 * `make/diamond` 与 `make/diamond-tip-blank` 的 `uses`。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 金刚石微粉：为什么是球磨 + 水选，不是爆轰
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 爆轰法（TNT/RDX 爆轰石墨）能直接出 5–50 nm 的 nanodiamond，但本层没有
 * 炸药条目，也没有爆轰罐；球磨 + 水选分级是现有 `plant/ore-beneficiary`
 * 那条线能承担的：
 *
 *   颚破 → 球磨 120 h（WC 球，0.3–0.5 mm）→ 盐酸洗 → 水选 40–60 h → 烘干
 *
 *   球磨到 0.1 µm 以下不是“磨细”一件事：WC 磨球与钢衬会带进 0.5–2 % 的
 *   钨/铁，必须用 HCl 洗掉；水选切 0.1 µm 的沉降时间按 Stokes 算是 40–60 h
 *   （10 mm 沉降柱），不是 37 min 那一档。
 *
 *   设计窗口 0.05–0.1 µm；再细到 0.02 µm 要离心机（本层没有），所以
 *   `mat/diamond-powder` 的 props 下限写 0.02、实际交付写 0.05–0.1。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 压头：PCD 坯片，不是单晶
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 工业纳米压痕针大多是**单晶金刚石**（天然或 HPHT 温度梯度法长 10–30 h）。
 * 本文件走 **PCD（聚晶金刚石）坯片**：0.05–0.1 µm 微粉 + 8 % Ni，在
 * 5–6 GPa / 1350–1450 °C 烧结 10–30 min，出 φ3 × 3 mm 的坯片。
 *
 *   为什么可以   压头尖端最后 100 nm 是抛光出来的，不是烧结出来的；PCD 的
 *                晶粒 0.05–0.1 µm 小于尖端半径 20–100 nm，抛光后晶界只影响
 *                亚 20 nm 的粗糙度。
 *   代价         PCD 尖在研磨时沿晶界优先崩，成品率比单晶低；单晶要长
 *                10–30 h，本层没有温度梯度炉，作为升级路线记在
 *                `make/diamond-tip-blank` 的注释里。
 *
 * 三棱锥几何：面与轴 65.27°、三面互成 120°（Berkovich）。角度靠磨床 +
 * 分度夹具保证；尖端靠 0.05–0.1 µm 金刚石微粉 + 锡盘（`mat/tin`）手工抛光。
 * 交付 `tipRadius 0.02–0.1 µm`（20–100 nm，设计值）与 `angle 65.27°`。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 量具缺口：尖端半径是“能看”，不是“已测”
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `plant/e-beam-column` 的 SEM/STEM：9.3 nm 点分辨，在 φ0.3 µm 的钨尖上
 * 验证到 ±20 nm（`cd-sem.ts` §九①）。对 50 nm 的尖：
 *
 *   可测下限   约 20 nm（±20 nm，3σ 分档）；20–100 nm 的窗口只能分 3–5 档，
 *              不能给出 50 ± 5 nm 的读数。
 *   更好的      `plant/cd-sem` 4 nm，但它是第 98 台，`performedBy` 永远不合法
 *              （`cd-sem.ts` 接线注），只能 `needs` + 机器人。
 *   没有        AFM、认证的尖半径标准件（熔石英/蓝宝石压痕标样也没有）、
 *              金刚石针的 TEM 薄片制备。
 *
 * 所以本条交付的 `tipRadius 20–100 nm` 是**设计/工艺窗口**，不是实测。
 * 要变成“已测”，需要一条 `data/measure/*` 的尖半径路线（R13：不能写在本文件）
 * 与至少一支认证标准针；在那之前，按证据等级只到 L0–L2。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 数值口径与质量账
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   · 所有窗口、寿命、速率都是**设计值**；没有一条来自实测。
 *   · 压力 kPa；温度 °C；质量 kg；时间运行小时。
 *   · 产 kg 的路线（`make/diamond`、`make/diamond-powder`）进料与出料不平，
 *     写 `unbalanced_zh`：差额是触媒/合成块/磨球/酸水的**回收或走掉**，
 *     不是凭空消失。
 *   · 产“件”的路线不做 kg 守恒（模型只对 kg 产出判），但账仍写在
 *     `unbalanced_zh` 里，方便下一轮核。
 *
 * ⚠️ 与 `data/material/nanoindent.ts` 的分工：那一份的
 *    `plant/nanoindenter/head` 从本轮起只描述**压头本体**（金刚石三棱锥 +
 *    针柄），load/displacement/E/H 是**整机**指标，留在 `plant/nanoindenter`。
 *    这样“压头能造”不会被读成“整台纳米压痕仪能造”——驱动、电容位移传感、
 *    24 位 ADC 三条链仍未写。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DIAMOND_ITEMS: readonly Item[] = [
  // ═════════════════════════════════════════════════════════════════════════
  // 一、设备：六面顶压机
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * 六面顶压机（ cubic press ）。**本层第一台能到 GPa 级的设备。**
   *
   * 它不是“更大的 `plant/autoclave`”：autoclave 是**容器**承压，压机是
   * **六个顶锤对压**，腔体压力来自顶锤面积上的力，不是液压油的压力。
   * 所以液压只要 120–160 MPa，腔体就能到 5–6 GPa（面积比约 40:1）。
   *
   * 六个顶锤同步：单缸 + 楔块（或三缸联动）。本设计用**单缸 + 六楔**，
   * 一个 25 MN 的油缸推楔块，六个顶锤同时进给 —— 同步靠楔块几何，
   * 不靠六套伺服（本层没有伺服阀）。
   *
   * 它 hold 的是**腔体**的 pressure/temperature：
   *   pressure    5000000–6000000 kPa（5–6 GPa）
   *   temperature 1300–1500 °C
   *
   * ⚠️ 为什么不是 5–6 这个数：见文件头的单位说明。写成 5–6 会被当成 5–6 kPa。
   *
   * 备选：CVD 金刚石
   *   微波等离子体或热丝，700–1000 °C、H₂/CH₄ 1–5 %、10–100 Torr
   *   （1.3–13.3 kPa），生长速率 1–10 µm/h。本层的 `plant/w-cvd-reactor`
   *   （350–500 °C）与 `plant/lpcvd-furnace`（700–780 °C，13–40 kPa）都
   *   不够：前者温度差 200–500 K，后者压力高 3 倍且没有原子氢源。
   *   要补一台新反应器 + 金刚石晶种；长 3 mm 坯要 300–3000 h。
   *   **本轮不建它**，因为 HPHT 只新增一台设备，CVD 要新增一台反应器
   *   再加晶种链，差距更大。
   */
  {
    id: 'plant/hpht-press',
    name: '6-Anvil Cubic Press', name_zh: '六面顶压机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'chamberPressure', kind: 'range', min: 5, max: 6, unit: 'GPa' },
      { param: 'chamberTemperature', kind: 'range', min: 1300, max: 1500, unit: '°C' },
      { param: 'anvilLife', kind: 'range', min: 1000, max: 3000, unit: '次' },
    ],
    holds: [
      { param: 'pressure', min: 5000000, max: 6000000 },
      { param: 'temperature', min: 1300, max: 1500 },
    ],
    composedOf: [
      { item: 'plant/hpht-press/frame', qty: q(1) },
      { item: 'plant/hpht-press/cylinder', qty: q(1) },
      { item: 'plant/hpht-press/pump', qty: q(1) },
      { item: 'plant/hpht-press/anvil', qty: q(6) },
      { item: 'plant/hpht-press/heating-transformer', qty: q(1) },
      { item: 'plant/hpht-press/control', qty: q(1) },
      { item: 'std/motor-7.5kw-4p', qty: q(1) },
      { item: 'std/contactor-general', qty: q(1) },
    ],
  },

  /**
   * 机架。四柱板框，25 MN（2500 t），钢板下料 + 卷焊 + 去应力 + 铣配合面。
   *
   * 为什么是板框不是铸件：25 MN 的铸件要几十吨的浇包与退火炉，本层没有；
   * 厚板 + 四根 45 钢拉杆是 19 世纪水压机的做法，本层能焊、能车、能磨。
   *
   * 设计值：立柱 φ220 mm，上下横梁 800 × 600 × 200 mm，总重约 14.5 t。
   */
  {
    id: 'plant/hpht-press/frame',
    name: '6-Anvil Cubic Press Frame', name_zh: '六面顶压机机架',
    unit: '件',
    category: 'part',
    props: [{ param: 'ratedForce', kind: 'range', min: 15000, max: 30000, unit: 'kN' }],
  },

  /**
   * 液压缸。φ450 × 150 mm 柱塞缸，水压 120–160 MPa，出力 19–25 MN。
   *
   * **用水不用油**：本层没有 `mat/hydraulic-oil`（`plant/hot-press` 已记过），
   * 水的黏度只有油的 1/50，填料函漏得快；代价是每班要补一次水、柱塞要镀?
   * 不镀 —— 用 45 钢 + 铜导套，靠水里的石灰调到 pH 8–9 防锈（与
   * `make/hotpress-hydraulic` 同一套）。
   */
  {
    id: 'plant/hpht-press/cylinder',
    name: '6-Anvil Cubic Press Hydraulic Cylinder', name_zh: '六面顶压机液压缸',
    unit: '件',
    category: 'part',
    props: [
      { param: 'bore', kind: 'range', min: 400, max: 500, unit: 'mm' },
      { param: 'stroke', kind: 'range', min: 100, max: 200, unit: 'mm' },
      { param: 'workingPressure', kind: 'range', min: 100000, max: 180000, unit: 'kPa' },
    ],
  },

  /**
   * 高压水泵 / 增压器。160 MPa、1.5–3 L/min，两级柱塞：低压级 6 MPa 供水，
   * 高压级 φ12 柱塞把压力放大到 160 MPa。
   *
   * 本层没有高压油泵、没有蓄能器、没有伺服阀；压力靠**溢流阀 + 手动节流**
   * 设定，升压 5–10 min，保压靠单向阀 + 柱塞自锁。断电没有保压 —— 与
   * `unblock-arc-tilting` 同一类缺口，记在这里。
   */
  {
    id: 'plant/hpht-press/pump',
    name: 'High-Pressure Water Pump / Booster', name_zh: '高压水泵 / 增压器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'dischargePressure', kind: 'range', min: 100000, max: 180000, unit: 'kPa' },
      { param: 'flow', kind: 'range', min: 1, max: 4, unit: 'L/min' },
    ],
  },

  /**
   * 硬质合金顶锤。**六面顶压机的心脏，也是寿命最短的一件。**
   *
   *   WC-Ni（8 % Ni），φ100 × 90 mm，台面 20 × 20 mm，45° 倒角、12° 退刀
   *   单只约 7.8 kg；六只一组，任一只有崩角就整组换
   *   寿命 1000–3000 次（5–6 GPa，设计值）；工业 HIP 件 3000–5000 次
   *
   * 为什么不用 WC-Co：本层没有钴条目（风化层 20–40 ppm），`mat/nickel` 有
   * 路线（`make/nickel`，250:1 富集）。WC-Ni 的抗弯强度比 WC-Co 低约 20 %，
   * 顶锤又是**拉应力**最大的地方，所以寿命打七折 —— 这是取 1000–3000 次
   * 而不是 3000–5000 次的原因。
   *
   * 为什么不用无粘结剂 WC（`make/nanoindenter-tip` 那一档）：无粘结剂烧结
   * 到 98 % 密度就封不住孔，7.8 kg 的大件中心必有孔隙，5 GPa 下从孔起裂。
   * 顶锤必须加 6–10 % Ni 走液相烧结。
   */
  {
    id: 'plant/hpht-press/anvil',
    name: '6-Anvil Cubic Press Cemented Carbide Anvil', name_zh: '六面顶压机硬质合金顶锤',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 80, max: 120, unit: 'mm' },
      { param: 'height', kind: 'range', min: 70, max: 110, unit: 'mm' },
      { param: 'faceSize', kind: 'range', min: 15, max: 25, unit: 'mm' },
      { param: 'life', kind: 'range', min: 500, max: 5000, unit: '次' },
      { param: 'hardness', kind: 'range', min: 1400, max: 1900, unit: 'HV', dir: 'atLeast' },
    ],
  },

  /**
   * 加热变压器。30–50 kVA，次级 2–6 V / 5–10 kA，给碳管加热体供电。
   *
   * 用 `std/transformer-general` 的 5–500 kVA 铁芯改绕次级：初级不动，
   * 次级拆掉重绕 8–12 匝铜排。为什么不用现成的焊机变压器：焊机是下降特性，
   * 压机要**恒功率**（温度靠电流有效值定），所以次级要按 5–10 kA 重绕。
   *
   * 拆次级、重绕是不可逆加工，零件输入写在 `uses`；这不是未分解的装配体，
   * 所以不标 `deferred`。
   */
  {
    id: 'plant/hpht-press/heating-transformer',
    name: '6-Anvil Cubic Press Heating Transformer', name_zh: '六面顶压机加热变压器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'ratedPower', kind: 'range', min: 20, max: 60, unit: 'kVA' },
      { param: 'secondaryCurrent', kind: 'range', min: 3000, max: 15000, unit: 'A' },
    ],
  },

  /**
   * 控温。光电高温计（`std/photoelectric-pyrometer-general`，1000–2000 °C）
   * + 过程控制器（`std/process-controller-general`，8 路）+ 接触器/调压。
   *
   * 高温计从顶锤中心 φ2 mm 的 sight hole 看碳管外壁；顶锤是 WC，钻孔会
   * 在孔口起裂，所以孔只开在上顶锤、φ2 mm、离台面 8 mm，寿命按 500 次
   * 单独换（不计入六只顶锤的寿命）。没有这个孔就只能按功率-温度曲线开环，
   * 温度误差 ±30–50 °C —— 本设计留孔，取 ±10 °C。
   *
   * ⚠️ 没有 W-Re 热电偶（本层没有铼；Pt-Rh 网已建，但 Pt-Rh 热偶丝
   *    仍未建）：接触式测温到不了 1500 °C。
   *    这是“能控但不能接触测温”的降级，升级路线是 W-Re 丝或双色高温计。
   */
  {
    id: 'plant/hpht-press/control',
    name: '6-Anvil Cubic Press Temperature Control', name_zh: '六面顶压机控温',
    unit: '件',
    category: 'part',
    props: [
      { param: 'temperatureRange', kind: 'range', min: 1000, max: 1600, unit: '°C' },
      { param: 'controlError', kind: 'range', min: 5, max: 20, unit: '°C', dir: 'atMost' },
    ],
  },

  /**
   * 合成块（消耗件）。**每批一只，不装进压机。**
   *
   *   32 × 32 × 32 mm 的传压介质立方块，中心 φ18 腔
   *   腔内：碳管加热体 φ12/φ10 × 22 mm、钢圈、铜电极、氧化铝绝缘环
   *   传压介质：`mat/hpht-pressure-medium`（叶腊石的替代，由
   *             `make/hpht-pressure-medium` 压成块；代价与升级见文件头）
   *
   * ⚠️ **本层没有石墨化**（`std/carbon-electrode-300` 是 1200–1300 °C 焙烧的
   *    碳电极，不是石墨）。加热管用 `mat/carbon` 压成碳管，电阻是石墨的
   *    3–4 倍、寿命 1–2 次；文中“石墨管”按工业叫法，实际是碳管。灰分
   *    2–15 % 与金刚石腔之间隔一层氧化铝/耐火料，灰不直接接触触媒。
   *
   * 为什么是消耗件而不是零件：5–6 GPa 下耐火粘土块每次都会裂/变形，
   * 敲掉换新；它不是“磨了换下来还能修”的零件（`Component.wear` 的语义）。
   */
  {
    id: 'plant/hpht-press/cell',
    name: '6-Anvil Cubic Press Synthesis Cell', name_zh: '六面顶压机合成块',
    unit: '件',
    category: 'consumable',
    props: [
      { param: 'cellSize', kind: 'range', min: 28, max: 40, unit: 'mm' },
      { param: 'heaterPower', kind: 'range', min: 5, max: 25, unit: 'kW' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 二、材料：碳 → 金刚石 → 微粉 → 坯片
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * 传压介质块（**叶腊石的替代**）。32 × 32 × 32 mm，45 % Al₂O₃ 耐火粘土。
   *
   * 工业六面顶用叶腊石（pyrophyllite）：软、绝缘、5 GPa 下转变成柯石英/
   * 蓝晶石，把压力均匀传进腔体。本层没有叶腊石矿，也没有合成路线；用
   * `mat/refractory` 压成同样的块。代价与升级见文件头。
   *
   * 它是**材料**（按 kg 计），不是零件：进 `make/hpht-cell` 的 uses，
   * 由 cell 路线钻孔、装加热体。这样“叶腊石替代”有一个可核的条目，
   * 而不是藏在 cell 的注释里。
   */
  {
    id: 'mat/hpht-pressure-medium',
    name: 'Pressure-Transmitting Medium Block', name_zh: '传压介质块',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'aluminaContent', kind: 'range', min: 40, max: 50, unit: '%' },
      { param: 'blockSize', kind: 'range', min: 28, max: 40, unit: 'mm' },
    ],
  },

  /**
   * 低灰碳。`mat/carbon` 的 ash 是 2–15 %（Bosch 法与镁热法都带灰），
   * 直接进 HPHT 会把 Si/Al/Fe 的氧化物带进触媒熔体，长出来的金刚石带包裹体。
   *
   * 酸洗降灰：HCl 洗 Fe/Al，HF 洗 Si，水洗到中性，100–120 °C 烘干。
   * 不石墨化：HPHT 触媒熔体溶解的是碳原子，不挑晶型；无定形碳的溶解速率
   * 比石墨慢 20–30 %，用保温时间补。
   *
   * 设计值：ash 0.02–0.1 %；工业金刚石用石墨的 ash < 0.05 %。
   */
  {
    id: 'mat/diamond-carbon',
    name: 'Low-Ash Carbon', name_zh: '低灰碳',
    unit: 'kg',
    category: 'material',
    props: [{ param: 'ash', kind: 'range', min: 0.01, max: 0.5, unit: '%', dir: 'atMost' }],
  },

  /**
   * 金刚石（HPHT 合成的磨料级单晶/连生体）。**不是天然矿，是造出来的。**
   *
   * 粒度 100–500 µm（35–140 目），纯度 99.5–99.9 %；颜色黄绿到无色，
   * 含 Fe-Ni 包裹体。它有两个下游：微粉（磨料/抛光）与 PCD 坯片。
   *
   * ⚠️ 它不是宝石级，也不是单晶压头料：要单晶压头得用温度梯度法长
   * 10–30 h（本文件走 PCD，见 `make/diamond-tip-blank`）。
   */
  {
    id: 'mat/diamond',
    name: 'Diamond', name_zh: '金刚石',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'grainSize', kind: 'range', min: 50, max: 1000, unit: 'µm' },
      { param: 'purity', kind: 'range', min: 99, max: 99.9, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * 金刚石微粉。0.05–0.1 µm（50–100 nm），用于压头终抛与硬质合金/陶瓷研磨。
   *
   * 这是那条“缺 0.05–0.1 µm 金刚石微粉”的缺口的实物回答：它不再从地球带，
   * 由 `make/diamond-powder` 从 `mat/diamond` 球磨 + 水选得到。
   */
  {
    id: 'mat/diamond-powder',
    name: 'Diamond Micropowder', name_zh: '金刚石微粉',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'grainSize', kind: 'range', min: 0.02, max: 0.2, unit: 'µm', dir: 'atMost' },
      { param: 'purity', kind: 'range', min: 99, max: 99.9, unit: '%', dir: 'atLeast' },
    ],
  },

  /**
   * 金刚石坯片（PCD）。φ3 × 3 mm 的圆片，0.05–0.1 µm 晶粒，8 % Ni。
   *
   * 它是压头的毛坯：三面 65.27° 研磨 + 尖端抛光都在 `make/nanoindenter-head`
   * 里做。为什么不直接烧结成三棱锥：5–6 GPa 的合成块腔体是圆柱/立方，
   * 异形顶锤的应力集中会先把顶锤崩掉；先出圆片再磨是工业做法。
   */
  {
    id: 'mat/diamond-tip-blank',
    name: 'Diamond Blank', name_zh: '金刚石坯片',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 3, max: 5, unit: 'mm' },
      { param: 'thickness', kind: 'range', min: 3, max: 5, unit: 'mm' },
      { param: 'grainSize', kind: 'range', min: 0.05, max: 0.2, unit: 'µm', dir: 'atMost' },
      { param: 'purity', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
    ],
  },
];

export const DIAMOND_ROUTES: readonly Route[] = [
  // ═════════════════════════════════════════════════════════════════════════
  // 三、压机零件路线
  // ═════════════════════════════════════════════════════════════════════════

  {
    /**
     * 机架：下料 → 卷焊 → 去应力 → 铣配合面 → 装配。
     *
     *   钢板 12 t + 45 钢 3 t → 1 台机架（约 14.5 t）
     *
     * 25 MN 的力靠四根 φ220 拉杆与 800 × 600 × 200 的上下横梁；焊缝按
     * 0.5 倍屈服做超声? 没有超声 —— 用煤油渗透 + 1.5 倍工作压力试压（水）。
     */
    id: 'make/hpht-frame',
    name: '6-Anvil Cubic Press Frame Manufacturing', name_zh: '六面顶压机机架制造',
    produces: [
      {
        item: 'plant/hpht-press/frame',
        qty: q(1),
        gives: [{ param: 'ratedForce', kind: 'range', min: 20000, max: 25000 }],
      },
      {
        item: 'mat/metal-scrap',
        qty: q(500),
        gives: [
          { param: 'iron', kind: 'range', min: 50, max: 99 },
          { param: 'form', kind: 'enum', oneOf: ['offcut', 'turnings'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(12000) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(3000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '下料、卷焊横梁与立柱，焊后校直', performedBy: 'plant/sheet-shop' },
      {
        note_zh: '去应力：550–650 °C 保温 4 h，随炉冷（不去的焊缝在 25 MN 下会裂）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 550, max: 650 }],
      },
      { note_zh: '铣四柱孔与顶锤座配合面，平面度 0.05/1000', performedBy: 'plant/milling-machine' },
      { note_zh: '装四根拉杆、预紧到 0.6 倍工作载荷', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(240) },
    unbalanced_zh:
      '钢板 12 t + 45 钢 3 t → 1 台机架（约 14.5 t）；余 0.5 t 是下料边角、焊材与铣屑（回炉）',
  },

  {
    /**
     * 液压缸：锻筒 → 粗车 → 珩磨 → 装柱塞与密封 → 试压。
     *
     *   45 钢 1.5 t + 铜 30 kg + 碳 10 kg → 1 只液压缸（约 1.5 t）
     *
     * 水压 120–160 MPa：缸筒用 45 钢锻件（不能用卷焊），内孔珩磨到 Ra 0.4、
     * 圆柱度 0.02；柱塞镀? 不镀，用铜导套 + 石墨绳填料，漏水量 0.1–0.5 L/min
     * 由 `plant/hpht-press/pump` 补。
     */
    id: 'make/hpht-cylinder',
    name: '6-Anvil Cubic Press Hydraulic Cylinder Manufacturing', name_zh: '六面顶压机液压缸制造',
    produces: [
      {
        item: 'plant/hpht-press/cylinder',
        qty: q(1),
        gives: [
          { param: 'bore', kind: 'range', min: 450, max: 450 },
          { param: 'stroke', kind: 'range', min: 150, max: 150 },
          { param: 'workingPressure', kind: 'range', min: 120000, max: 160000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1500) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(30) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '锻筒：φ520 × 180 的 45 钢锭锻成筒坯，锻比 ≥3', performedBy: 'plant/forge' },
      { note_zh: '粗车内外圆，留 3 mm 珩磨量；车两端法兰与密封槽', performedBy: 'lathe' },
      { note_zh: '珩磨内孔 φ450，Ra 0.4、圆柱度 0.02（水压 160 MPa 下漏水量由这个面定）', performedBy: 'plant/grinder' },
      { note_zh: '装柱塞、铜导套、石墨绳填料与压盖；手动压 35 MPa 保压 30 min', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(120) },
    unbalanced_zh:
      '45 钢 1.5 t + 铜 30 kg + 碳 10 kg → 1 只液压缸（约 1.5 t）；余是车屑、珩磨泥与填料边角（铜屑回收）',
  },

  {
    /**
     * 高压水泵 / 增压器：车柱塞与缸体 → 磨柱塞 → 装配 → 35 MPa 预压。
     *
     *   45 钢 120 kg + 不锈钢 40 kg + 铜 15 kg + 碳 3 kg + 电机 1 台
     *   → 1 台泵（约 180 kg）
     *
     * 160 MPa 的最终试压没有现成设备：`plant/autoclave` 只到 35 MPa，
     * 所以路线里只做 35 MPa 预压；160 MPa 的密封在整机装配后由压机自己
     * 的液压系统跑合（设计值，未实测）。
     */
    id: 'make/hpht-pump',
    name: 'High-Pressure Water Pump / Booster Manufacturing', name_zh: '高压水泵 / 增压器制造',
    produces: [
      {
        item: 'plant/hpht-press/pump',
        qty: q(1),
        gives: [
          { param: 'dischargePressure', kind: 'range', min: 120000, max: 160000 },
          { param: 'flow', kind: 'range', min: 1.5, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(120) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(40) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(15) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(3) }] },
      { anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '车两级柱塞（φ40 / φ12）、缸体与单向阀座', performedBy: 'lathe' },
      { note_zh: '磨柱塞 φ12 h6，圆度 0.002；配研阀座', performedBy: 'plant/grinder' },
      { note_zh: '装单向阀、溢流阀、石墨绳填料与电机联轴器', performedBy: 'plant/robot' },
      {
        note_zh: '35 MPa 预压 30 min（autoclave 当试压罐；160 MPa 的最终试压在整机跑合）',
        performedBy: 'plant/autoclave',
        under: [{ param: 'pressure', min: 30000, max: 35000 }],
      },
    ],
    rate: { hours: q(80) },
    unbalanced_zh:
      '45 钢 120 kg + 不锈钢 40 kg + 铜 15 kg + 碳 3 kg + 电机 1 台 → 1 台泵（约 180 kg）；余是车屑、磨屑与试压水',
  },

  {
    /**
     * 顶锤：混粉 → 压坯 → 液相烧结 → 粗磨 → 检测。
     *
     *   WC 7.5 kg + Ni 0.5 kg + 碳化硅 0.5 kg + 水 2 kg → 1 只顶锤（约 7.8 kg）
     *
     * 8 % Ni 是 WC-Ni 的常规粘结剂含量；烧结 1450–1500 °C、H₂ 保护、
     * 保温 2 h。没有 HIP（热等静压），密度 97–98 %，寿命按 1000–3000 次
     * 取低档；工业 HIP 件 3000–5000 次 —— 这是本文件最大的一处降级，
     * 升级路线是补一台 HIP（200 MPa Ar / 1400 °C），本层没有。
     *
     * 磨顶锤用碳化硅，不用金刚石：金刚石微粉是这条链的下游，用它磨顶锤
     * 会形成“压机→金刚石→压机”的循环；碳化硅 0.5 µm 磨 WC 慢 5–10 倍，
     * 但只磨平面与倒角，够用。
     */
    id: 'make/hpht-anvil',
    name: '6-Anvil Cubic Press Cemented Carbide Anvil Manufacturing', name_zh: '六面顶压机硬质合金顶锤制造',
    produces: [
      {
        item: 'plant/hpht-press/anvil',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 100, max: 100 },
          { param: 'height', kind: 'range', min: 90, max: 90 },
          { param: 'faceSize', kind: 'range', min: 20, max: 20 },
          { param: 'life', kind: 'range', min: 1000, max: 3000 },
          { param: 'hardness', kind: 'range', min: 1500, max: 1800 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/tungsten-carbide', qty: q(15, 2) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/silicon-carbide', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    steps: [
      { note_zh: '混粉：WC 7.5 kg + Ni 0.5 kg，球磨 24 h 到 1–2 µm，加 2 % 石蜡', performedBy: 'plant/robot' },
      { note_zh: '压坯：φ125 × 115 的圆柱坯，200–300 MPa 单轴压制（压不透烧结后中心有孔）', performedBy: 'plant/press' },
      {
        note_zh:
          '液相烧结：1450–1500 °C、H₂、保温 2 h；升温 5 °C/min，800 °C 前脱蜡。密度 97–98 %（无 HIP）',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 1450, max: 1500 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      { note_zh: '粗磨：磨 20 × 20 台面、45° 倒角与 12° 退刀，平面度 0.02/100', performedBy: 'plant/grinder' },
      {
        note_zh: '检测：台面尺寸、倒角、目视崩角（>0.2 mm 报废）；恒温间里量，记进批次卡',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    unbalanced_zh:
      'WC 7.5 kg + Ni 0.5 kg + 碳化硅 0.5 kg + 水 2 kg → 1 只顶锤（约 7.8 kg）；0.2 kg 是磨屑与烧结收缩；碳化硅与水走掉',
  },

  {
    /**
     * 加热变压器：改绕次级 → 装铁芯/外壳 → 浸漆 → 装配。
     *
     *   std/transformer-general 1 台 + 铜 30 kg + 钢板 60 kg + 酚醛 5 kg
     *   → 1 台（30–50 kVA）
     *
     * 初级沿用 380 V，次级拆掉重绕 8–12 匝 60 × 10 铜排；铁芯不换。
     * 5–10 kA 的次级引线用铜排，不用电缆 —— 电缆在这个电流下会烧。
     */
    id: 'make/hpht-transformer',
    name: '6-Anvil Cubic Press Heating Transformer Manufacturing', name_zh: '六面顶压机加热变压器制造',
    produces: [
      {
        item: 'plant/hpht-press/heating-transformer',
        qty: q(1),
        gives: [
          { param: 'ratedPower', kind: 'range', min: 30, max: 50 },
          { param: 'secondaryCurrent', kind: 'range', min: 5000, max: 10000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/transformer-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(30) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(60) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(5) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '拆次级、绕 8–12 匝 60 × 10 铜排，层间垫玻璃布', performedBy: 'plant/winder' },
      { note_zh: '装铁芯、压紧、装外壳与铜排接线端子', performedBy: 'plant/milling-machine' },
      {
        note_zh: '浸酚醛、120–150 °C 烘干 4 h（不浸漆的绕组在 5 kA 下会振松）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 120, max: 150 }],
      },
      { note_zh: '装配与变比/空载试验（次级 2–6 V，空载电流 <5 %）', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(16) },
    unbalanced_zh:
      'std/transformer-general 1 台 + 铜 30 kg + 钢板 60 kg + 酚醛 5 kg → 1 台；余是铜排边角、硅钢片与浸漆挥发',
  },

  {
    /**
     * 控温组件：装高温计/控制器 → 标定 → 联调。
     *
     *   std/process-controller-general 1 台 + std/photoelectric-pyrometer-general 1 台
     *   + 钢板 20 kg + 铜线 2 kg + 玻璃 1 kg → 1 套
     *
     * 标定在恒温间（19–21 °C）做电气部分：4–20 mA 回路、冷端补偿、报警点。
     * 温度标定要到 1300–1500 °C，本层没有黑体炉 —— 用压机自己的碳管
     * 当黑体，按功率-温度曲线对比高温计，误差 ±10 °C（设计值，未实测）。
     */
    id: 'make/hpht-control',
    name: '6-Anvil Cubic Press Temperature Control Manufacturing', name_zh: '六面顶压机控温制造',
    produces: [
      {
        item: 'plant/hpht-press/control',
        qty: q(1),
        gives: [
          { param: 'temperatureRange', kind: 'range', min: 1000, max: 1600 },
          { param: 'controlError', kind: 'range', min: 5, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/process-controller-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/photoelectric-pyrometer-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(20) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(2) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
    ],
    steps: [
      { note_zh: '装控制器、高温计、接触器与调压回路，接 4–20 mA 与报警', performedBy: 'plant/robot' },
      {
        note_zh: '电气标定：4–20 mA 回路、冷端补偿、超温报警点（1300/1500 两点）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      // 关于“装到压机上、碳管升温到 1300/1400/1500 整定 PID”这一步：
      // 它是**调试/验收**，不是制造。写成步骤会形成环（压机要控制箱，控制箱又要压机），
      // 所以这里只做到“电气标定 + PID 参数按炉型预置”，整机联调记在缺口里：
      // 没做联调之前，`controlError 5–10 °C` 是设计值，压机第一次合腔时要复核。
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    unbalanced_zh:
      'std 2 台 + 钢板 20 kg + 铜线 2 kg + 玻璃 1 kg → 1 套；余是面板边角与导线头',
  },

  {
    /**
     * 传压介质块：混料 → 压制成型 → 焙烧。
     *
     *   耐火料 0.08 kg + 水 0.03 kg → 1 块 32 × 32 × 32 mm（约 0.08 kg）
     *
     * 32 mm 立方块的体积 32.8 cm³，耐火粘土密度 2.2–2.6 g/cm³，所以一块
     * 只有 72–85 g —— 不是几公斤。焙烧 1000–1100 °C 把结合水与有机物赶掉，
     * 否则 5 GPa 下会放气、在腔体里形成气孔。
     */
    id: 'make/hpht-pressure-medium',
    name: 'Pressure-Transmitting Medium Block Production', name_zh: '传压介质块制备',
    produces: [
      {
        item: 'mat/hpht-pressure-medium',
        qty: q(2, 25),
        gives: [
          { param: 'aluminaContent', kind: 'range', min: 43, max: 47 },
          { param: 'blockSize', kind: 'range', min: 32, max: 32 },
        ],
      },
      { item: 'mat/water', qty: q(3, 100), gives: [{ param: 'conductivity', kind: 'range', min: 1, max: 100 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/refractory', qty: q(2, 25) }] },
      { anyOf: [{ item: 'mat/water', qty: q(3, 100) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '混料：耐火料 0.08 kg + 水 0.03 kg，搅匀到无干团（水多了焙烧收缩大）', performedBy: 'plant/robot' },
      { note_zh: '压制成型：32 × 32 × 32 立方块，100–150 MPa；密度 2.2–2.4 g/cm³', performedBy: 'plant/press' },
      {
        note_zh: '焙烧：1000–1100 °C 保温 4 h，随炉冷；升温 2 °C/min（快了会裂）',
        performedBy: 'plant/earth-kiln',
        under: [{ param: 'temperature', min: 1000, max: 1100 }],
      },
    ],
    rate: { hours: q(4) },
    unbalanced_zh:
      '耐火料 0.08 kg + 水 0.03 kg → 1 块（约 0.08 kg）+ 干燥/焙烧水 0.03 kg（已单列 mat/water）',
  },

  {
    /**
     * 合成块：钻孔 φ18 → 装碳管/钢圈/电极。
     *
     *   传压介质块 0.08 kg + 碳 0.005 kg + 45 钢 0.01 kg + 铜 0.01 kg
     *   + 氧化铝 0.005 kg → 1 只（约 0.10 kg）
     *
     * 传压介质块由 `make/hpht-pressure-medium` 来（叶腊石的替代，见文件头）。
     * 碳管是加热体（本层没有石墨化，`mat/carbon` 压的碳管，电阻是石墨的
     * 3–4 倍、寿命 1–2 次），钢圈是电流回路，氧化铝环绝缘；它们都装在
     * 32 mm 块的 φ18 腔里。合成块是消耗件，每批一只。
     */
    id: 'make/hpht-cell',
    name: '6-Anvil Cubic Press Synthesis Cell Manufacturing', name_zh: '六面顶压机合成块制造',
    produces: [
      {
        item: 'plant/hpht-press/cell',
        qty: q(1),
        gives: [
          { param: 'cellSize', kind: 'range', min: 32, max: 32 },
          { param: 'heaterPower', kind: 'range', min: 8, max: 20 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/hpht-pressure-medium', qty: q(2, 25) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 2000) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 200) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '压碳管：碳粉 5 g + 酚醛 0.5 g 装 φ12/φ10 模，100–150 MPa 压成 22 mm 长的管（不单独焙烧，随合成块一起升温）',
        performedBy: 'plant/press',
      },
      { note_zh: '钻孔：φ18 通孔，与立方块同心（偏 1 mm 压力就偏，顶锤会崩）', performedBy: 'plant/milling-machine' },
      { note_zh: '装碳管 φ12/φ10 × 22、钢圈、铜电极与氧化铝绝缘环', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(2) },
    unbalanced_zh:
      '传压介质块 0.08 kg + 碳 0.005 kg + 酚醛 0.0005 kg + 45 钢 0.01 kg + 铜 0.01 kg + 氧化铝 0.005 kg → 1 只（约 0.10 kg）；0.01 kg 是钻孔、压管与装配损耗',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 四、金刚石与微粉路线
  // ═════════════════════════════════════════════════════════════════════════

  {
    /**
     * 低灰碳：酸洗 → 过滤洗涤 → 干燥。
     *
     *   mat/carbon 1.2 kg + HCl 0.5 kg + HF 0.05 kg + 水 5 kg → 1 kg
     *
     * ash 从 2–15 % 降到 0.02–0.1 %。HF 只洗硅，用量 0.05 kg；酸洗槽的
     * 衬里是 PTFE? 本层 PTFE 有，但 `plant/wet-bench` 的槽是玻璃/陶瓷，
     * HF 会蚀玻璃 —— 所以酸洗用**聚乙烯桶**（本层没有聚乙烯条目）?
     * 退一步：HF 在铂? 只有海绵 Pt（`pgm.ts`），铂器皿未建。实际用 45 钢桶衬 PTFE 板（PTFE 有路线），
     * 记为 `plant/wet-bench` 的槽体改造，不单列零件。
     */
    id: 'make/diamond-carbon',
    name: 'Low-Ash Carbon Production', name_zh: '低灰碳制备',
    produces: [
      {
        item: 'mat/diamond-carbon',
        qty: q(1),
        gives: [{ param: 'ash', kind: 'range', min: 0.02, max: 0.1 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/carbon', qty: q(6, 5) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh: '酸洗：HCl 0.5 kg + HF 0.05 kg + 水 5 kg，80–100 °C 搅 4 h；PTFE 衬桶',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 80, max: 100 }],
      },
      { note_zh: '过滤、水洗到中性（pH 6–7），抽干', performedBy: 'plant/robot' },
      {
        note_zh: '干燥：100–120 °C 烘 8 h，装桶（吸潮后灰分回到 0.1 % 以上）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 120 }],
      },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      'mat/carbon 1.2 kg + HCl 0.5 kg + HF 0.05 kg + 水 5 kg → 1 kg 低灰碳；0.2 kg 是灰分与碳损失；酸水去中和，不逐批计',
  },

  {
    /**
     * **HPHT 合成金刚石：碳 + Fe-Ni 触媒 → 5–6 GPa / 1350–1450 °C / 20–30 min。**
     *
     *   C 5.5 g + Fe 6 g + Ni 2.5 g + 合成块 1 只 → 金刚石 5 g
     *
     * 机理：Fe-Ni 在 1350 °C 以上熔成触媒，碳溶进熔体、在金刚石稳定区
     * （5–6 GPa）析出。不需要晶种 —— 这是**自发成核**，第一批就能出；
     * 晶粒 100–500 µm，靠触媒片厚度与保温时间控制。
     *
     * 温度 1350–1450：低于 1300 触媒不熔/碳不溶，高于 1500 石墨稳定、
     * 金刚石回溶。压力 5–6 GPa：低于 4.5 GPa 落在石墨区，高于 6 GPa
     * 顶锤寿命骤降（每 +0.5 GPa 寿命减半，设计值）。
     *
     * 保温 20–30 min：本文件 `rate` 写 0.5 h（含升压/升温/卸压），
     * 纯保温 20 min；工业磨料级 10–30 min，取中档。
     *
     * ⚠️ 产量 5 g/批（25 克拉）是**小腔体**设计值：φ18 腔、32 mm 块。
     *    工业六面顶一炮 100–300 克拉，本层没有那个吨位与自动化。
     *    5 g 够做 40 支压头坯（每支 0.12 g），瓶颈不在量。
     */
    id: 'make/diamond',
    name: 'HPHT Synthetic Diamond Production', name_zh: 'HPHT 合成金刚石制备',
    produces: [
      {
        item: 'mat/diamond',
        qty: q(1, 200),
        gives: [
          { param: 'grainSize', kind: 'range', min: 100, max: 500 },
          { param: 'purity', kind: 'range', min: 99.5, max: 99.9 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/diamond-carbon', qty: q(11, 2000) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(3, 500) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 400) }] },
      { anyOf: [{ item: 'plant/hpht-press/cell', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/hpht-press',
    under: [
      { param: 'pressure', min: 5000000, max: 6000000 },
      { param: 'temperature', min: 1350, max: 1450 },
    ],
    rate: { hours: q(1, 2) },
    unbalanced_zh:
      'C 5.5 g + Fe 6 g + Ni 2.5 g + 合成块 1 只（约 0.1 kg）→ 金刚石 5 g（1/200 kg）；0.5 g 碳以 CO/CH₄ 走掉；Fe-Ni 触媒与合成块**回收再用**（模型按消耗记，账记在这里）',
  },

  {
    /**
     * 金刚石微粉：破碎 → 球磨 120 h → 酸洗 → 水选 40–60 h → 干燥。
     *
     *   mat/diamond 25 g + WC 磨球 0.5 kg + HCl 0.2 kg + 水 2 kg → 微粉 20 g
     *
     * 球磨用 WC 球（0.3–0.5 mm）与 WC 衬里：钢球会带进 1–2 % 铁，酸洗能去，
     * 但铁磨屑在球磨里会催化石墨化? 不会，温度只有 60–80 °C；只是污染。
     *
     * 水选切 0.1 µm：10 mm 沉降柱、水 20 °C，Stokes 沉降 40–60 h；取上部
     * 40 % 清液，底下粗料回球磨。0.05 µm 那一档再静置 4 倍时间（约 200 h）
     * —— 本文件只保证 0.05–0.1 µm 全窗口，不保证 0.05 µm 以下。
     *
     * ⚠️ 没有激光粒度仪：粒度靠沉降时间与显微镜抽检，`grainSize` 是
     *    工艺窗口，不是每批实测。这是“能造但判不了”的一处缺口。
     */
    id: 'make/diamond-powder',
    name: 'Diamond Micropowder Production', name_zh: '金刚石微粉制备',
    produces: [
      {
        item: 'mat/diamond-powder',
        qty: q(1, 50),
        gives: [
          { param: 'grainSize', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'purity', kind: 'range', min: 99.5, max: 99.9 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/diamond', qty: q(1, 40) }] },
      { anyOf: [{ item: 'mat/tungsten-carbide', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '颚破：金刚石 25 g 破碎到 1–3 mm（金刚石脆，不能过粉碎）', performedBy: 'plant/ore-beneficiary', under: [{ param: 'pressure', min: 140, max: 180 }] },
      {
        note_zh:
          '球磨 120 h：WC 球 0.5 kg + WC 衬里，湿磨（水 2 kg），转速 60–80 r/min；每 24 h 取样看 D50',
        performedBy: 'plant/ore-beneficiary',
        under: [{ param: 'pressure', min: 140, max: 180 }],
      },
      {
        note_zh: '酸洗：HCl 0.2 kg + 水 1 kg，60–90 °C 搅 2 h，去 WC/铁磨屑；水洗到中性',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 60, max: 90 }],
      },
      {
        note_zh:
          '水选分级：10 mm 沉降柱静置 40–60 h 切 0.1 µm，取上部 40 %；底料回球磨。0.05 µm 档再静置 4 倍时间',
        performedBy: 'plant/ore-beneficiary',
        under: [{ param: 'pressure', min: 140, max: 180 }],
      },
      {
        note_zh: '干燥：100–120 °C 烘 8 h，密封保存（微粉吸潮后团聚，用前要超声? 没有超声，用球磨罐滚 2 h）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 120 }],
      },
    ],
    rate: { hours: q(120) },
    unbalanced_zh:
      '金刚石 25 g + WC 磨球 500 g + HCl 200 g + 水 2 kg → 微粉 20 g（1/50 kg）；5 g 是磨屑与分级尾料；WC 磨球回收，酸水去中和',
  },

  {
    /**
     * 金刚石坯片：装料 → 5–6 GPa / 1350–1450 °C 烧结 20–30 min → 磨圆片。
     *
     *   微粉 0.12 g + Ni 0.01 g + 合成块 1 只 → 1 片 φ3 × 3 mm PCD 坯
     *
     * 8 % Ni 既是烧结助剂也是触媒：在 5–6 GPa 下 Ni 把金刚石颗粒表面
     * 溶掉一层再析出，颗粒之间直接成键（D-D 键），不是“树脂粘结”。
     *
     * ⚠️ 单晶 vs PCD：PCD 坯的晶粒 0.05–0.1 µm，抛光到 20–100 nm 尖时
     *    晶界会优先崩；单晶坯要温度梯度法长 10–30 h，本层没有温度梯度炉。
     *    升级路线：在同一个压机上换“晶种 + 温度梯度”合成块，保温 10–30 h，
     *    生长速率 0.1–0.3 mm/h；缺口是温度梯度控制（±5 °C）与 10–30 h 的
     *    顶锤寿命（1000–3000 次够，但一批只出一颗）。
     */
    id: 'make/diamond-tip-blank',
    name: 'Diamond Blank Manufacturing', name_zh: '金刚石坯片制造',
    produces: [
      {
        item: 'mat/diamond-tip-blank',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 3, max: 3 },
          { param: 'thickness', kind: 'range', min: 3, max: 3 },
          { param: 'grainSize', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/diamond-powder', qty: q(3, 25000) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 100000) }] },
      { anyOf: [{ item: 'plant/hpht-press/cell', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/hpht-press',
    under: [
      { param: 'pressure', min: 5000000, max: 6000000 },
      { param: 'temperature', min: 1350, max: 1450 },
    ],
    rate: { hours: q(1, 2) },
    unbalanced_zh:
      '微粉 0.12 g + Ni 0.01 g + 合成块 1 只 → 1 片坯（约 0.10 g）；0.03 g 是装料与磨边损耗；合成块回收',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 五、压头：三棱锥研磨 + 尖端抛光
  // ═════════════════════════════════════════════════════════════════════════

  {
    /**
     * **纳米压痕压头：PCD 坯 → 三面 65.27° 粗磨 → 0.05 µm 微粉 + 锡盘抛光
     * → 钎焊针柄 → e-beam 量尖。**
     *
     *   PCD 坯 1 片 + 45 钢 2 g + 铜 0.5 g + 锡 1 g + 微粉 0.5 g + 水 0.05 kg
     *   → 1 支压头
     *
     * 几何：三棱锥，面与轴 65.27°、三面互成 120°（Berkovich）。角度靠
     * `plant/grinder` + 分度夹具保证；夹具是一个 65.27° 的斜楔 + 120° 分度盘，
     * 三面各磨一次，每次转 120°。角度错 1° 就废 —— 接触面积函数对不上
     * Berkovich，E/H 会偏 5–10 %。
     *
     * 尖端：最后一道用 0.05–0.1 µm 金刚石微粉 + `mat/tin` 锡盘（软盘），
     * 8 字轨迹、每面 20–30 min；锡盘比铸铁盘软，磨粒会嵌入锡里滚动，
     * 出的是“抛光”不是“划伤”。这是 20–100 nm 尖的关键一步。
     *
     * 量尖：`plant/e-beam-column` 的 SEM/STEM，9.3 nm 点分辨，±20 nm
     * （在 φ0.3 µm 钨尖上验证过，`cd-sem.ts` §九①）。可测下限约 20 nm；
     * 20–100 nm 只能分 3–5 档，**不是** 50 ± 5 nm 的读数。
     *
     * ⚠️ `tipRadius 20–100 nm` 是设计/工艺窗口，不是实测。要变成实测，
     *    需要 `data/measure/*` 的尖半径路线 + 认证标准针；本文件按 R13
     *    不写测量路线。
     */
    id: 'make/nanoindenter-head',
    name: 'Nanoindenter Indenter Head Manufacturing', name_zh: '纳米压痕机纳米压痕压头制造',
    produces: [
      {
        item: 'plant/nanoindenter/head',
        qty: q(1),
        gives: [
          { param: 'tipRadius', kind: 'range', min: 0.02, max: 0.1, record: 'mat/tip-radius-afm-record' },
          { param: 'angle', kind: 'range', min: 65.27, max: 65.27 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/diamond-tip-blank', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2000) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/diamond-powder', qty: q(1, 2000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 20) }] },
    ],
    steps: [
      {
        note_zh:
          '粗磨三面：65.27° 斜楔夹具 + 120° 分度盘，金刚石砂轮? 没有 —— 用碳化硅 0.5 µm 研磨膏 + 铸铁盘，每面 30–40 min；留 0.1 mm 给抛光',
        performedBy: 'plant/grinder',
      },
      {
        note_zh:
          '精研与抛光：0.05–0.1 µm 金刚石微粉 + 锡盘，8 字轨迹，每面 20–30 min；三面轮换，显示剂看接触点。**最后 100 nm 靠这一道**',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '钎焊针柄：φ3 × 20 的 45 钢柄 + 铜/锡钎料，700–800 °C、H₂ 保护 2 min；金刚石在 800 °C 以上会石墨化，所以不能超过 800',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 700, max: 800 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh: '清洗与装配：丙酮? 没有 —— 用乙醇 + 水超声? 没有超声，用洗瓶冲、吹干；装到 head 座上',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '量尖：e-beam-column 的 SEM/STEM 侧看针尖，读 20–100 nm 分档；±20 nm，只能分档不能签字（`cd-sem.ts` §九①）',
        performedBy: 'plant/e-beam-column',
        under: [
          { param: 'pressure', min: 1e-7, max: 1e-3 },
          { param: 'temperature', min: 19, max: 21 },
        ],
      },
    ],
    needs: ['plant/metrology-room', 'plant/comparator/lapping-plate'],
    rate: { hours: q(6) },
    unbalanced_zh:
      'PCD 坯 1 片（约 0.1 g）+ 45 钢 2 g + 铜 0.5 g + 锡 1 g + 微粉 0.5 g + 水 50 g → 1 支压头；余是磨屑、钎料与抛光损耗',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...DIAMOND_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/hpht-press',
    name: '6-Anvil Cubic Press Assembly', name_zh: '六面顶压机装配',
    produces: [{
      item: 'plant/hpht-press',
      qty: q(1),
      gives: [
      { param: 'chamberPressure', kind: 'range', min: 5, max: 6 },
      { param: 'chamberTemperature', kind: 'range', min: 1300, max: 1500 },
      { param: 'anvilLife', kind: 'range', min: 1000, max: 3000 },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...DIAMOND_ROUTES, ...ASSEMBLY_ROUTES];
