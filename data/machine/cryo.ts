/**
 * 低温链：−78 °C 干冰冷阱 + 20 K GM 制冷机 —— 仪器与零件那一半
 * （R13：仪器、零件、材料放 data/machine/）。
 *
 * ⚠️ **分工（R13）**：本文件放**仪器 / 零件**与它们的 `make/*` 路线；两条测量路线与
 * 两个记录在 `data/measure/cryo.ts`（导出名 `CRYO_MEASURE_ITEMS` /
 * `CRYO_MEASURE_ROUTES`），按 id 跨文件解析 —— 同一次 data 装配，没有跨文件 import。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、这一份补的是两条缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `data/machine/nh3-gas.ts` §五 ①：水 0.1 ppm 以下是零气本底，证不了 ⇒ 需要更冷的冷源
 *   `data/machine/trace-analysis.ts` §八 ③：氦 1 kg 要 1.1×10⁶ m³ 空气；20 K 制冷要氦
 *   `data/machine/voltage-anchor.ts`：约瑟夫森标准差 10⁴ 倍（要 4 K，`mat/helium` 只有 R10 一次性装填）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、A：−78 °C 干冰冷阱（不依赖氦）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── ① 冷量账 ───────────────────────────────────────────────────────────────
 *
 *   CO₂ 的升华焓 25.2 kJ/mol = **573 kJ/kg**；干冰 −78.5 °C 直接升华，不需要液体
 *   1 kg 干冰在 8 h 里平均 **19.9 W**（573 000 J / 28 800 s）；扣掉浴槽与保温的
 *   损失（2–5 W），净冷量 **8–15 W @ −78 °C**
 *   1–2 kg 装一次、保持 **4–12 h**（比液氮罐省：本层没有液氮条目，`euv-source` 缺口⑦）
 *
 * ── ② 露点账：−78.5 °C 的平衡是 0.69 ppm，但工程上只能到 0.5–1.9 ppm ──
 *
 *   冰的饱和蒸气压：−60 °C 1.1 Pa · −70 °C 0.26 Pa · −78.5 °C 0.070 Pa
 *   （同值的 hPa 写法是 1.1×10⁻² · 2.6×10⁻³ · 7×10⁻⁴ —— 别把 hPa 当 Pa）
 *   换成 1 atm 下的体积分数：11 ppm · 2.6 ppm · 0.69 ppm
 *   **平衡**是 0.69 ppm，但阱的**传质**（100 mL/min、0.2 m² 冷面、停留 2–4 s）只能
 *   把出口拉到 **−80…−72 °C ⇒ 0.5–1.9 ppm**。这就是交付窗口，不写平衡值。
 *
 * ── ③ 阶梯：−78.5 之后没有“更冷的浴” ──────────────────────────────────────
 *
 *   −78.5 °C   干冰 + 异丙醇（本件）                → 0.5–1.9 ppm
 *   −98 °C     甲醇/乙醇 slush —— **要先有 LN₂ 把溶剂冻住**，LN₂ 0 条目 ⇒ 这一档在本层
 *              不存在（乙烷 −89、丙烷 −42 也到不了 −100）
 *   −100…−120 °C 用 GM 制冷机的**一级（45–80 K）**做换热器 + 节流，或直接上二级 20 K
 *   ⇒ **0.01 ppm 以下只能靠 B 的冷头**，干冰冷阱到此为止
 *
 * ── ④ CO₂ 会不会把阱堵死 ────────────────────────────────────────────────────
 *
 *   不会：CO₂ 在 −78.5 °C 的蒸气压是 **1 atm**，样品里 CO₂ 只有 1–100 ppm
 *   （分压 0.1–10 Pa）⇒ 霜点 −110…−130 °C，−78.5 的冷面上不结 CO₂。结的是水与
 *   重烃。浴槽里的干冰是 CO₂ 自己的 1 atm，与样品无关。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、B：20 K GM 制冷机 —— **工作气体是氦，这一笔只能一次性装填**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── ① 核实：闭式循环制冷机的工作气体就是氦 ─────────────────────────────────
 *
 *   GM / 脉管 / 斯特林 三种闭式循环都用 **氦** 作工质（He 在 20 K 不凝固、比热比
 *   1.66、黏度低）。`mat/helium` 只有 R10 一次性装填、没有本地路线：火星大气 He 2.5–7 ppm
 *   ⇒ **1 kg He 要 1.1×10⁶ m³ 空气**（5 ppm 计），分离要 20 K 精馏 —— 而 20 K
 *   精馏本身就要这台制冷机，**循环依赖**。
 *
 *   无氦方案逐个算过，都不成立：
 *
 *     热电级联（Bi₂Te₃）  一级 ΔT 60–70 K，4–5 级到 **150–180 K** 就到头，离 20 K 差 8 倍
 *     绝热去磁（ADR）      起点要 10–20 K 的热沉 —— 又是循环依赖
 *     氢/氖节流            Ne 三相点 24.6 K、H₂ 20.3 K，只能到 25–30 K，且本层 Ne 0 条目
 *     液氮预冷 + 氦节流     LN₂ 0 条目（`euv-source` 缺口⑦）
 *
 *   ⇒ 按你的指示选 **(i) 一次性装填**：**氦充装 0.8–1.5 kg**，`mat/helium` 建条目，
 *   列入 **R10 的“必须从地球传递的非设备条目”**（用户已确认这一次装填）。
 *   充装量写进 `make/gm-cryocooler` 的 `uses`，窗口仍写在 `heliumCharge` props 上。
 *   它没有本地路线，是进口料 —— 现在这件事由 data 和 ONE_TIME 记录，不再藏在 props 里。
 *   密封金属系统的漏率 ≤1×10⁻⁹ Pa·m³/s ⇒ 10 年漏 <2 %，**一次装填够整机寿命**。
 *
 * ── ② 冷量与效率 ───────────────────────────────────────────────────────────
 *
 *   二级 **1.5–4 W @ 20 K**、一级 **40–60 W @ 80 K**（GM 二级的典型值）
 *   压缩机 4–6 kW（1.5–2 MPa、5–10 g/s）
 *   COP = 3 W / 5 000 W = 6×10⁻⁴；卡诺 COP = 20/(300−20) = 7.1×10⁻²
 *   ⇒ **0.8–1.5 % 卡诺**（GM 的真实水平，脉管略低）
 *   降温 3–6 h（冷头 8–15 kg + 负载）
 *
 * ── ③ 用途 ─────────────────────────────────────────────────────────────────
 *
 *   低温泵：20 K 面上 H₂O/CO₂/重烃的蒸气压 <10⁻²⁰ Pa（抽速 10³–10⁴ L/s 级）
 *   冷阱到 20 K：把 `plant/euv-vacuum` 的 1e-8 Pa 再往下推 2–3 个量级
 *   约瑟夫森标准：**20 K 只是预冷级**。4 K 还要在 20 K 冷头上加一级 JT（He 循环，
 *   0.1–0.5 W @ 4 K）；而 Nb/NbN 结（0 条目）与 70–100 GHz 源（0 条目）仍缺 ——
 *   这一件把“冷源”从 0 变成 1，约瑟夫森从“差 10⁴ 倍”变成“差两条料 + 一级 JT”。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、缺口（带数；R7：按量级记录，不作为终止条件）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① 干冰冷阱的地板是 **0.5–1.9 ppm**（−80…−72 °C 的传质限），不是 −78.5 的平衡
 *     0.69 ppm；要 1 ppm 以下必须上 B 的冷头。
 *     （2026-10-20 补：80 K 冷阱 `plant/cryo-trap-80k` 已建，见
 *     `data/machine/cryo-trap.ts`；干冰档保留，两条路线产出同一份露点记录。）
 *  ② −98 °C 的甲醇 slush 要 LN₂ 先冻溶剂，而 LN₂ 0 条目（`euv-source` 缺口⑦）⇒
 *     本层没有“比干冰冷、比 20 K 暖”的现成浴。
 *  ③ **氦只有 R10 一次性装填**：本链按 R10 一次性装填 0.8–1.5 kg（`heliumCharge`）；要复制第二台
 *     制冷机，仍要再运一次氦。要自产：20 K 精馏（循环依赖）+ 1.1×10⁶ m³ 空气/kg。
 *  ④ 20 K 到不了 4 K：约瑟夫森要再加一级 JT（0.1–0.5 W @4 K）+ Nb/NbN 结（0 条目）
 *     + 70–100 GHz 源（0 条目）。
 *  ⑤ 低温泵要 20 K 面但**再生**要 80–100 K：一台 GM 的一级够，但要两套阀与程序。
 *  ⑥ 干冰消耗：一次 1–2 kg、4–12 h；`make/dry-ice` 的产量（1000 kg/批）够，但
 *     装填与运输要有保温箱（本文件没建，缺一件保温转运箱）。
 *  ⑦ 冷头的**振动**（GM 的排出器 1–2 Hz、振幅 0.1–0.3 mm）对约瑟夫森结阵与
 *     干涉测量是干扰；要做减振（本文件没建）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { CRYO_ITEMS, CRYO_ROUTES } from '../../data/machine/cryo.ts';
 *   import { CRYO_MEASURE_ITEMS, CRYO_MEASURE_ROUTES } from '../../data/measure/cryo.ts';
 *   items:  [...CRYO_ITEMS, ...CRYO_MEASURE_ITEMS]
 *   routes: [...CRYO_ROUTES, ...CRYO_MEASURE_ROUTES]
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CRYO_ITEMS: readonly Item[] = [
  // ═════════════════════════════════════════════════════════════════════════
  // A. −78 °C 干冰冷阱
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * **阱体：316L 筒 φ80 × 200 + 冷指接口 + 进出气口。**
   *
   *   volume   0.5–2 L（气路停留 2–4 s @100 mL/min）
   *   leakRate 1e-4–5e-4 Pa·L/s
   *   area     0.1–0.3 m²（内壁 + 冷指）
   */
  {
    id: 'plant/dry-ice-trap/vessel',
    name: '干冰冷阱阱体',
    unit: '件',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 0.5, max: 2, unit: 'L' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-3, unit: 'Pa·L/s', dir: 'atMost' },
      { param: 'area', kind: 'range', min: 0.1, max: 0.3, unit: 'm²' },
    ],
  },

  /**
   * **铜冷指：φ20 铜棒 + 12 圈盘管，浸在浴里、伸进阱体。**
   *
   *   area        0.1–0.3 m²（盘管 + 棒）
   *   conductance 5–20 W/K（20–60 W 的冷量传输）
   *   material    copper（铝也行，铜的导热 2 倍）
   */
  {
    id: 'plant/dry-ice-trap/cold-finger',
    name: '干冰冷阱铜冷指',
    unit: '件',
    category: 'part',
    props: [
      { param: 'area', kind: 'range', min: 0.1, max: 0.3, unit: 'm²' },
      { param: 'conductance', kind: 'range', min: 5, max: 20, unit: 'W/K', dir: 'atLeast' },
      { param: 'material', kind: 'enum', values: ['copper', 'aluminium'] },
    ],
  },

  /**
   * **浴槽：PTFE/不锈钢槽 3–5 L + 异丙醇 + 矿棉保温。**
   *
   *   bathVolume 2–5 L（1–2 kg 干冰 + 异丙醇没过冷指）
   *   insulation 50–100 mm（矿棉；不保温 2 h 就化完）
   *   holdTime   4–12 h（1–2 kg 干冰、净 8–15 W）
   */
  {
    id: 'plant/dry-ice-trap/bath',
    name: '干冰冷阱浴槽',
    unit: '件',
    category: 'part',
    props: [
      { param: 'bathVolume', kind: 'range', min: 2, max: 5, unit: 'L' },
      { param: 'insulation', kind: 'range', min: 50, max: 100, unit: 'mm' },
      { param: 'holdTime', kind: 'range', min: 4, max: 12, unit: 'h', dir: 'atLeast' },
    ],
  },

  /**
   * **干冰冷阱整机。holds −90…−60 °C。**
   *
   *   dewPoint     −80…−72 °C（出口；平衡是 −78.5，传质限把出口抬到 −72…−80）
   *   water        0.5–1.9 ppm（−80…−72 °C 对应 0.54–1.9 ppm）
   *   coolingPower 8–15 W @ −78 °C（1–2 kg 干冰、扣掉损失）
   *   holdTime     6–10 h/次装填
   *   repeatability 0.5–1 K（浴温波动 → 露点读数重复性）
   */
  {
    id: 'plant/dry-ice-trap',
    name: '干冰冷阱整机',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'temperature', min: -90, max: -60 }],
    props: [
      { param: 'dewPoint', kind: 'range', min: -85, max: -68, unit: '°C' },
      { param: 'water', kind: 'range', min: 0.4, max: 3, unit: 'ppm' },
      { param: 'coolingPower', kind: 'range', min: 5, max: 20, unit: 'W', dir: 'atLeast' },
      { param: 'holdTime', kind: 'range', min: 4, max: 12, unit: 'h', dir: 'atLeast' },
      { param: 'repeatability', kind: 'range', min: 0.2, max: 1.5, unit: 'K', dir: 'atMost' },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // B. 20 K GM 制冷机
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * **压缩机：4–6 kW 油润滑氦压缩机（1.5–2 MPa、5–10 g/s）。**
   *
   *   power    4–6 kW
   *   pressure 1.5–2.0 MPa（高压侧）
   *   flow     5–10 g/s（He）
   *
   * ⚠️ 工作气体是**氦**（§二①）：这一台的氦由整机一次性装填，不单独建料条目。
   */
  {
    id: 'plant/gm-cryocooler/compressor',
    name: 'GM 压缩机',
    unit: '件',
    category: 'part',
    props: [
      { param: 'power', kind: 'range', min: 3, max: 7, unit: 'kW' },
      { param: 'pressure', kind: 'range', min: 1.5, max: 2.2, unit: 'MPa' },
      { param: 'flow', kind: 'range', min: 5, max: 12, unit: 'g/s' },
    ],
  },

  /**
   * **冷头：二级 GM 排出器 φ80 × 300，一级 80 K / 二级 20 K。**
   *
   *   stages       2
   *   coolingPower 1.5–4 W @20 K
   *   weight       8–15 kg（冷质量，决定降温时间）
   *   temperature  18–25 K（二级平衡温度）
   */
  {
    id: 'plant/gm-cryocooler/cold-head',
    name: 'GM 冷头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'stages', kind: 'range', min: 2, max: 2, unit: '级' },
      { param: 'coolingPower', kind: 'range', min: 1, max: 5, unit: 'W', dir: 'atLeast' },
      { param: 'weight', kind: 'range', min: 8, max: 15, unit: 'kg' },
      { param: 'temperature', kind: 'range', min: 15, max: 30, unit: 'K' },
    ],
  },

  /**
   * **蓄冷器：铅球（二级）/ 稀土球（一级），0.2–0.5 mm、0.5–2 kg。**
   *
   *   material   lead 或 rare-earth（铅的比热在 20 K 以上够；稀土更轻）
   *   sphereSize 0.2–0.5 mm
   *   mass       0.5–2 kg
   */
  {
    id: 'plant/gm-cryocooler/regenerator',
    name: 'GM 蓄冷器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'material', kind: 'enum', values: ['lead', 'rare-earth'] },
      { param: 'sphereSize', kind: 'range', min: 0.2, max: 0.5, unit: 'mm' },
      { param: 'mass', kind: 'range', min: 0.5, max: 2, unit: 'kg' },
    ],
  },

  /**
   * **配气旋转阀：60–120 rpm，把高压氦按相位切给两级排出器。**
   *
   *   speed    60–120 rpm
   *   leakRate 1e-4–5e-4 Pa·L/s
   */
  {
    id: 'plant/gm-cryocooler/valve',
    name: 'GM 配气旋转阀',
    unit: '件',
    category: 'part',
    props: [
      { param: 'speed', kind: 'range', min: 60, max: 120, unit: 'rpm' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-3, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /**
   * **GM 制冷机整机。holds 18–25 K（二级）+ 45–80 K（一级）+ 1e-5–1e-3 Pa（真空罩）。**
   *
   *   coolingPower  1.5–4 W @20 K
   *   temperature   19–22 K
   *   cooldownTime  3–6 h
   *   heliumCharge  0.8–1.5 kg（**一次性装填**，见 §二①）
   *   inputPower    4–6 kW
   *   stability     0.2–0.5 K
   */
  {
    id: 'plant/gm-cryocooler',
    name: 'GM 制冷机整机',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 18, max: 25 },
      { param: 'temperature', min: 45, max: 80 },
      { param: 'pressure', min: 1e-5, max: 1e-3 },
    ],
    props: [
      { param: 'coolingPower', kind: 'range', min: 1, max: 5, unit: 'W', dir: 'atLeast' },
      { param: 'temperature', kind: 'range', min: 18, max: 25, unit: 'K' },
      { param: 'cooldownTime', kind: 'range', min: 2, max: 8, unit: 'h', dir: 'atMost' },
      { param: 'heliumCharge', kind: 'range', min: 0.5, max: 2, unit: 'kg' },
      { param: 'inputPower', kind: 'range', min: 3, max: 7, unit: 'kW' },
      { param: 'stability', kind: 'range', min: 0.1, max: 1, unit: 'K', dir: 'atMost' },
    ],
  },
];

export const CRYO_ROUTES: readonly Route[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // A. 干冰冷阱
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **阱体：316L 筒车制 + 焊冷指接口与进出气口。**
     *
     *   316L 0.5 → 阱体 1 件（0.5–2 L、0.1–0.3 m²）。
     */
    id: 'make/dry-ice-trap-vessel',
    name: '干冰冷阱阱体制造',
    produces: [
      {
        item: 'plant/dry-ice-trap/vessel',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 0.8, max: 1.5 },
          { param: 'leakRate', kind: 'range', min: 1e-4, max: 5e-4 },
          { param: 'area', kind: 'range', min: 0.15, max: 0.25 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 2) }] }],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(12) },
    unbalanced_zh: '316L 0.5 → 阱体 1 件；余是切头与焊材（按件计）',
  },

  {
    /**
     * **冷指：铜棒车削 + 弯 φ8 盘管 12 圈 + 搪锡。**
     *
     *   铜 0.6 → 冷指 1 件（0.15–0.25 m²、8–15 W/K）。
     */
    id: 'make/dry-ice-trap-cold-finger',
    name: '干冰冷阱铜冷指制造',
    produces: [
      {
        item: 'plant/dry-ice-trap/cold-finger',
        qty: q(1),
        gives: [
          { param: 'area', kind: 'range', min: 0.15, max: 0.25 },
          { param: 'conductance', kind: 'range', min: 8, max: 15 },
          { param: 'material', kind: 'enum', oneOf: ['copper'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(3, 5) }] }],
    needs: ['lathe', 'plant/metrology-room'],
    performedBy: 'plant/winder',
    rate: { hours: q(8) },
    unbalanced_zh: '铜 0.6 → 冷指 1 件；余是弯管废段（按件计）',
  },

  {
    /**
     * **浴槽：PTFE 槽 3 L + 矿棉 80 mm 保温 + 盖子。**
     *
     *   PTFE 0.5 + 矿棉 0.3 + 316L 0.2 → 浴槽 1 件（2–5 L、6–10 h）。
     */
    id: 'make/dry-ice-trap-bath',
    name: '干冰冷阱浴槽制造',
    produces: [
      {
        item: 'plant/dry-ice-trap/bath',
        qty: q(1),
        gives: [
          { param: 'bathVolume', kind: 'range', min: 3, max: 4 },
          { param: 'insulation', kind: 'range', min: 70, max: 90 },
          { param: 'holdTime', kind: 'range', min: 6, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    rate: { hours: q(6) },
    unbalanced_zh: 'PTFE 0.5 + 矿棉 0.3 + 316L 0.2 → 浴槽 1 件（按件计）',
  },

  {
    /**
     * **干冰冷阱装配：阱体 + 冷指 + 浴槽 + 两支 T 型热电偶。**
     *
     *   阱体 1 + 冷指 1 + 浴槽 1 + 热电偶 2 + 接触器 1 → 1 台
     */
    id: 'make/dry-ice-trap',
    name: '干冰冷阱装配',
    produces: [
      {
        item: 'plant/dry-ice-trap',
        qty: q(1),
        gives: [
          { param: 'dewPoint', kind: 'range', min: -80, max: -72, record: 'mat/dew-point-record' },
          { param: 'water', kind: 'range', min: 0.5, max: 1.9, record: 'mat/dew-point-record' },
          { param: 'coolingPower', kind: 'range', min: 8, max: 15 },
          { param: 'holdTime', kind: 'range', min: 6, max: 10 },
          { param: 'repeatability', kind: 'range', min: 0.5, max: 1, record: 'mat/dew-point-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/dry-ice-trap/vessel', qty: q(1) }] },
      { anyOf: [{ item: 'plant/dry-ice-trap/cold-finger', qty: q(1) }] },
      { anyOf: [{ item: 'plant/dry-ice-trap/bath', qty: q(1) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '① 装阱体与冷指（0.1 mm 间隙、导热脂），进出气口朝上防积液', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 装浴槽与保温；两支 T 型热电偶（浴温 + 出口气）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 冷试：1 kg 干冰 + 2 L 异丙醇，30 min 到 −78 °C；出口露点 −72…−80 °C', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(16) },
    unbalanced_zh: '阱体 1 + 冷指 1 + 浴槽 1 + 热电偶 2 + 接触器 1 → 干冰冷阱 1 台（按件计）',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // B. 20 K GM 制冷机
  // ─────────────────────────────────────────────────────────────────────────

  {
    /**
     * **压缩机：4–6 kW 氦压缩机（油润滑、1.5–2 MPa）。**
     *
     *   45 钢 60 + 铸铁 30 + 铜线 8 + 铜 5 → 压缩机 1 台
     */
    id: 'make/gm-cryocooler-compressor',
    name: 'GM 压缩机制造',
    produces: [
      {
        item: 'plant/gm-cryocooler/compressor',
        qty: q(1),
        gives: [
          { param: 'power', kind: 'range', min: 4, max: 6 },
          { param: 'pressure', kind: 'range', min: 1.6, max: 2 },
          { param: 'flow', kind: 'range', min: 6, max: 9 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(60) }] },
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(30) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(8) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 铣曲轴箱与气缸（1.5–2 MPa 的密封面）', performedBy: 'plant/milling-machine' },
      { note_zh: '② 车曲轴、装活塞与阀片（油润滑，油要防氦稀释）', performedBy: 'lathe' },
      { note_zh: '③ 打压 2.5 MPa 保压 1 h、测流量 6–9 g/s', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(120) },
    unbalanced_zh: '45 钢 60 + 铸铁 30 + 铜线 8 + 铜 5 → 压缩机 1 台；余是切屑与铸件冒口（按件计）',
  },

  {
    /**
     * **冷头：二级排出器（φ80 × 300）+ 一级冷台 + 真空罩接口。**
     *
     *   316L 8 + 铜 3 + 铅 0.8 → 冷头 1 件（8–15 kg、1.5–4 W @20 K）。
     */
    id: 'make/gm-cryocooler-cold-head',
    name: 'GM 冷头制造',
    produces: [
      {
        item: 'plant/gm-cryocooler/cold-head',
        qty: q(1),
        gives: [
          { param: 'stages', kind: 'range', min: 2, max: 2 },
          { param: 'coolingPower', kind: 'range', min: 1.5, max: 4 },
          { param: 'weight', kind: 'range', min: 10, max: 14 },
          { param: 'temperature', kind: 'range', min: 18, max: 25 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(8) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(3) }] },
      { anyOf: [{ item: 'mat/lead', qty: q(4, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 车两级气缸（φ80/φ40、圆度 2 µm）与排出器活塞（间隙 20 µm）', performedBy: 'lathe' },
      { note_zh: '② 磨活塞与气缸配合面（20 µm 间隙是效率的命门）', performedBy: 'plant/grinder' },
      { note_zh: '③ 装一级 80 K 冷台、二级 20 K 冷台与真空罩接口', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(160) },
    unbalanced_zh: '316L 8 + 铜 3 + 铅 0.8 → 冷头 1 件；余是切屑与磨削量（按件计）',
  },

  {
    /**
     * **蓄冷器：0.2–0.5 mm 铅球/稀土球，填 0.5–2 kg。**
     *
     *   铅 1 kg → 蓄冷器 1 件（0.5–2 kg 球、0.2–0.5 mm）。
     */
    id: 'make/gm-cryocooler-regenerator',
    name: 'GM 蓄冷器制造',
    produces: [
      {
        item: 'plant/gm-cryocooler/regenerator',
        qty: q(1),
        gives: [
          { param: 'material', kind: 'enum', oneOf: ['lead'] },
          { param: 'sphereSize', kind: 'range', min: 0.25, max: 0.4 },
          { param: 'mass', kind: 'range', min: 0.8, max: 1.5 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/lead', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '铅熔滴成球（0.3 mm）、筛分、装蓄冷器筒', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(20) },
    unbalanced_zh: '铅 1 kg → 蓄冷器 1 件（0.8–1.2 kg 球）；余是筛下的细粉（按件计）',
  },

  {
    /**
     * **配气阀：旋转阀体 + 阀芯 + 60–120 rpm 驱动。**
     *
     *   316L 0.3 + PTFE 0.02 + 伺服 1 → 阀 1 件。
     */
    id: 'make/gm-cryocooler-valve',
    name: 'GM 配气旋转阀制造',
    produces: [
      {
        item: 'plant/gm-cryocooler/valve',
        qty: q(1),
        gives: [
          { param: 'speed', kind: 'range', min: 70, max: 110 },
          { param: 'leakRate', kind: 'range', min: 1e-4, max: 5e-4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 50) }] },
      { anyOf: [{ item: 'std/selsyn-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'lathe',
    rate: { hours: q(30) },
    unbalanced_zh: '316L 0.3 + PTFE 0.02 + 自整角机 1 → 配气阀 1 件（按件计）',
  },

  {
    /**
     * **GM 制冷机装配：压缩机 + 冷头 + 蓄冷器 + 配气阀 + 真空罩，充氦 1 kg。**
     *
     *   压缩机 1 + 冷头 1 + 蓄冷器 1 + 配气阀 1 + 真空罩（钢板 8）+ 接触器 2 → 1 台
     *
     * ⚠️ **氦 1 kg 一次性装填**（§二①）：`mat/helium` 按 R10 列入 ONE_TIME，
     * 1 kg 写在 `uses`；窗口 0.8–1.5 kg 写在 `heliumCharge` props 上。
     * 装配的最后一步是充氦到 1.8 MPa 并静置 24 h 查漏。
     */
    id: 'make/gm-cryocooler',
    name: 'GM 制冷机装配',
    produces: [
      {
        item: 'plant/gm-cryocooler',
        qty: q(1),
        gives: [
          { param: 'coolingPower', kind: 'range', min: 1.5, max: 4, record: 'mat/cryo-record' },
          { param: 'temperature', kind: 'range', min: 19, max: 22, record: 'mat/cryo-record' },
          { param: 'cooldownTime', kind: 'range', min: 3, max: 6 },
          { param: 'heliumCharge', kind: 'range', min: 0.8, max: 1.5 },
          { param: 'inputPower', kind: 'range', min: 4, max: 6 },
          { param: 'stability', kind: 'range', min: 0.2, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/gm-cryocooler/compressor', qty: q(1) }] },
      { anyOf: [{ item: 'plant/gm-cryocooler/cold-head', qty: q(1) }] },
      { anyOf: [{ item: 'plant/gm-cryocooler/regenerator', qty: q(2) }] },
      { anyOf: [{ item: 'plant/gm-cryocooler/valve', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(8) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(2) }] },
      // 氦：R10 一次性装填；窗口 0.8–1.5 kg 在 gives 的 heliumCharge，这里按 1 kg 名义值记。
      { anyOf: [{ item: 'mat/helium', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/euv-vacuum'],
    steps: [
      { note_zh: '① 装压缩机与冷头（冷头插进真空罩，法兰 CF100）', performedBy: 'plant/robot' },
      { note_zh: '② 装两级蓄冷器与配气阀（相位对 0° 与 180°）', performedBy: 'plant/robot' },
      { note_zh: '③ 抽真空检漏：接 euv-vacuum 抽 1e-2–1e-1 Pa，关阀 1 h 压升 ≤1e-3 Pa·L/s', performedBy: 'plant/robot', under: [{ param: 'pressure', min: 1e-2, max: 1e-1 }] },
      { note_zh: '④ 充氦 1 kg 到 1.8 MPa、静置 24 h 查压降（≤0.5 %）；这一次装填是一次性输入，见 §二①', performedBy: 'plant/robot' },
      { note_zh: '⑤ 降温与标定：一级 45–80 K（40–60 W）、二级 19–22 K（1.5–4 W）、降温 3–6 h、稳定度 0.2–0.5 K', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(300) },
    unbalanced_zh: '压缩机 1 + 冷头 1 + 蓄冷器 2 + 配气阀 1 + 钢板 8 + 接触器 2 → GM 制冷机 1 台（按件计）；氦 1 kg 在 uses、窗口在 props',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CRYO_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CRYO_ROUTES];
