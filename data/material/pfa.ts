/**
 * PFA 器皿：可熔性聚四氟乙烯（TFE + PPVE 共聚）与无硼实验室。
 *
 * ⚠️ **为什么不是 PTFE**（`data/machine/boron.ts` §五 ③）：PTFE 的硼记忆比 PFA
 * 差 **2–5 倍**（PTFE 有微孔与晶界，酸与硼酸根渗进去洗不出来）；PFA 是全氟烷氧基
 * 侧链的**可熔**版本：熔体可以抛光到 Ra 0.2–0.4 µm、没有微孔 ⇒ 硼本底与记忆都低。
 *
 *   PFA 硼本底 **≤0.01 ppb**、连续三次空白后记忆 **<0.005 ppb**
 *   （PTFE 是 0.02–0.05 ppb / 0.01–0.02 ppb）
 *   熔点 **300–310 °C**（PTFE 327）、加工 **350–400 °C**（PTFE 不能熔融加工）
 *
 * 链：TFE（`mat/tfe` 已有）→ 热解 → HFP → 环氧化 → HFPO → 与 TFE 加成/脱氟酰 →
 * **PPVE** → 与 TFE 乳液共聚（PPVE 1–3 mol%）→ **PFA** → 热成型 → 器皿。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、三条新料各自的数
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   HFP   ：3 TFE → 2 HFP（750–850 °C 裂解、停留 0.3–0.6 s、选择性 60–75 %）
 *           bp −29.4 °C；用**干冰冷阱**（−78 °C）冷凝，不用液氮
 *   PPVE  ：HFP + H₂O₂/NaOH → HFPO（环氧化，40–60 °C、收率 80–90 %）
 *           HFPO + TFE → 加成物 → 250–350 °C 脱氟酰 → PPVE（bp 35.6 °C，收率 60–75 %）
 *   PFA   ：TFE 1000 + PPVE 25 → PFA 1000（乳液聚合 60–80 °C、1.5–2 MPa）
 *           PPVE 2.5 mol% ⇒ 熔点 302–308 °C、熔指 2–8 g/10 min
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、器皿与实验室
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   烧杯 50/100/250 mL（热压成型，壁 1.2–1.8 mm）
 *   瓶   100/250/500/1000 mL（吹塑，带 PFA 螺旋盖）
 *   移液管 1/5/10 mL（PFA 管拉制 + 刻度，精度 ±0.5–1 %）
 *   `plant/boron-free-lab`：PFA 内衬 + 4 台 FFU + 无硼台（复用 `plant/boron-free-bench`）
 *   holds 19–21 °C；空白硼 ≤0.01 ppb、ISO 3–4
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、缺口（带数）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① 空白 0.01 ppb 是**PFA 面本身**；整个实验室要到 0.01 还要空气与酸都无硼，
 *     本文件只把“器皿与台面”这一段做到（空气硼 0.1–1 ng/m³ 仍是 0.005–0.05 ppb 的源）。
 *  ② PPVE 收率 60–75 %：每 1 kg PFA 要 25 g PPVE，但 HFP→PPVE 一段的损耗让
 *     实际 TFE 单耗 +8–12 %。
 *  ③ 热成型 350–400 °C 下 PFA 会释放微量全氟异丁烯（PFIB，剧毒）：模腔要强制排风，
 *     本文件没建排风条目（缺一件）。
 *  ④ PFA 移液管的精度 ±0.5–1 % 比玻璃（±0.2–0.5 %）差 2–5 倍；痕量硼场景可接受。
 *  ⑤ 没有 PFA 膜滤器（0.2 µm）与 PFA 容量瓶：本文件只建三件常用器皿。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { PFA_ITEMS, PFA_ROUTES } from '../../data/material/pfa.ts';
 *   items: [...PFA_ITEMS] · routes: [...PFA_ROUTES]
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PFA_ITEMS: readonly Item[] = [
  /**
   * **六氟丙烯（HFP）：TFE 热解产物，PPVE 的起点。**
   *
   *   purity 99.6–99.9 % · water 20–40 ppm · bp −29.4 °C
   */
  {
    id: 'mat/hfp',
    name: '六氟丙烯',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99.5, max: 99.9, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 0, max: 50, unit: 'ppm', dir: 'atMost' },
      { param: 'boilingPoint', kind: 'range', min: -30, max: -29, unit: '°C' },
    ],
  },

  /**
   * **全氟(丙基乙烯基)醚（PPVE）：PFA 的共聚单体。**
   *
   *   purity 99–99.5 % · water 20–40 ppm · bp 35.6 °C
   */
  {
    id: 'mat/ppve',
    name: '全氟',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99, max: 99.9, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 0, max: 50, unit: 'ppm', dir: 'atMost' },
      { param: 'boilingPoint', kind: 'range', min: 35, max: 36, unit: '°C' },
    ],
  },

  /**
   * **PFA 树脂：TFE + PPVE 1–3 mol% 的共聚物。**
   *
   *   ppveContent 1.5–2.5 mol%
   *   meltingPoint 302–308 °C（PTFE 327；PPVE 把结晶度压下去）
   *   processingTemperature 360–390 °C（可熔融加工）
   *   purity 99.9–99.95 % · ash 20–40 ppm
   */
  {
    id: 'mat/pfa',
    name: 'PFA 树脂',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'ppveContent', kind: 'range', min: 1, max: 3, unit: 'mol%' },
      { param: 'meltingPoint', kind: 'range', min: 300, max: 310, unit: '°C' },
      { param: 'processingTemperature', kind: 'range', min: 350, max: 400, unit: '°C' },
      { param: 'purity', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
      { param: 'ash', kind: 'range', min: 0, max: 50, unit: 'ppm', dir: 'atMost' },
    ],
  },

  /**
   * **PFA 烧杯（50/100/250 mL）。**
   *
   *   volume 50–250 mL · wall 1.2–1.8 mm
   *   blankBoron 0.005–0.01 ppb（**关键指标**）
   *   memory 0.001–0.004 ppb（连续三次空白后的记忆）
   */
  {
    id: 'plant/boron-free-lab/pfa-beaker',
    name: 'PFA 烧杯',
    unit: '件',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 50, max: 250, unit: 'mL' },
      { param: 'wall', kind: 'range', min: 1, max: 2, unit: 'mm' },
      { param: 'blankBoron', kind: 'range', min: 0, max: 0.01, unit: 'ppb', dir: 'atMost' },
      { param: 'memory', kind: 'range', min: 0, max: 0.005, unit: 'ppb', dir: 'atMost' },
    ],
  },

  /**
   * **PFA 瓶（100/250/500/1000 mL，带 PFA 盖）。**
   *
   *   volume 100–1000 mL · leakRate 1e-4–5e-4 Pa·L/s
   *   blankBoron ≤0.01 ppb · memory ≤0.005 ppb
   */
  {
    id: 'plant/boron-free-lab/pfa-bottle',
    name: 'PFA 瓶',
    unit: '件',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 100, max: 1000, unit: 'mL' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-3, unit: 'Pa·L/s', dir: 'atMost' },
      { param: 'blankBoron', kind: 'range', min: 0, max: 0.01, unit: 'ppb', dir: 'atMost' },
      { param: 'memory', kind: 'range', min: 0, max: 0.005, unit: 'ppb', dir: 'atMost' },
    ],
  },

  /**
   * **PFA 移液管（1/5/10 mL）。**
   *
   *   volume 1–10 mL · accuracy 0.5–1 %
   *   blankBoron ≤0.01 ppb · memory ≤0.005 ppb
   */
  {
    id: 'plant/boron-free-lab/pfa-pipette',
    name: 'PFA 移液管',
    unit: '件',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 1, max: 10, unit: 'mL' },
      { param: 'accuracy', kind: 'range', min: 0.5, max: 1, unit: '%', dir: 'atMost' },
      { param: 'blankBoron', kind: 'range', min: 0, max: 0.01, unit: 'ppb', dir: 'atMost' },
      { param: 'memory', kind: 'range', min: 0, max: 0.005, unit: 'ppb', dir: 'atMost' },
    ],
  },

  /**
   * **无硼实验室：PFA 内衬 + 4 台 FFU + 无硼台（复用 `plant/boron-free-bench`）。**
   *
   *   holds 19–21 °C
   *   blankBoron 0.005–0.01 ppb · ISO 3–4 · HEPA 99.99–99.995 % · 面风速 0.4–0.5 m/s
   */
  {
    id: 'plant/boron-free-lab',
    name: '无硼实验室',
    unit: '间',
    category: 'machine',
    holds: [{ param: 'temperature', min: 19, max: 21 }],
    props: [
      { param: 'blankBoron', kind: 'range', min: 0, max: 0.01, unit: 'ppb', dir: 'atMost' },
      { param: 'isoClass', kind: 'range', min: 3, max: 4, unit: '级' },
      { param: 'hepaEfficiency', kind: 'range', min: 99.99, max: 99.999, unit: '%', dir: 'atLeast' },
      { param: 'faceVelocity', kind: 'range', min: 0.3, max: 0.6, unit: 'm/s' },
    ],
  },

  /**
   * **PFA 膜滤器（0.2 µm、φ13/25/47 mm）。**
   *
   *   poreSize   0.18–0.22 µm（PTFE 拉伸膜；PFA 壳体）
   *   diameter   13/25/47 mm
   *   blankBoron 0.005–0.01 ppb（与器皿一致）
   *   holdUp     0.1–0.3 mL（死体积，洗 2 次可降到 0.01 mL 的贡献）
   */
  {
    id: 'plant/boron-free-lab/pfa-filter',
    name: 'PFA 膜滤器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'poreSize', kind: 'range', min: 0.1, max: 0.45, unit: 'µm' },
      { param: 'diameter', kind: 'range', min: 13, max: 47, unit: 'mm' },
      { param: 'blankBoron', kind: 'range', min: 0, max: 0.01, unit: 'ppb', dir: 'atMost' },
      { param: 'holdUp', kind: 'range', min: 0.05, max: 0.5, unit: 'mL', dir: 'atMost' },
    ],
  },

  /**
   * **PFA 容量瓶（10/25/50/100 mL，A 级）。**
   *
   *   volume                10–100 mL
   *   accuracy              0.08–0.15 %（A 级 ±0.1–0.2 %）
   *   calibrationUncertainty 0.05–0.08 %（20 °C 水称量法，`plant/micro-balance`）
   *   blankBoron             0.005–0.01 ppb
   */
  {
    id: 'plant/boron-free-lab/pfa-volumetric-flask',
    name: 'PFA 容量瓶',
    unit: '件',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 10, max: 100, unit: 'mL' },
      { param: 'accuracy', kind: 'range', min: 0.05, max: 0.2, unit: '%', dir: 'atMost' },
      { param: 'calibrationUncertainty', kind: 'range', min: 0.02, max: 0.1, unit: '%', dir: 'atMost' },
      { param: 'blankBoron', kind: 'range', min: 0, max: 0.01, unit: 'ppb', dir: 'atMost' },
    ],
  },
];

export const PFA_ROUTES: readonly Route[] = [
  {
    /**
     * **HFP：TFE 过热裂解 → 急冷 → 干冰冷凝/精馏。**
     *
     *   3 TFE → 2 HFP（0.3–0.6 s、750–850 °C、选择性 60–75 %）
     */
    id: 'make/hfp',
    name: '六氟丙烯制备',
    produces: [
      {
        item: 'mat/hfp',
        qty: q(2, 3),
        gives: [
          { param: 'purity', kind: 'range', min: 99.6, max: 99.9 },
          { param: 'water', kind: 'range', min: 20, max: 40 },
          { param: 'boilingPoint', kind: 'range', min: -29.5, max: -29.3 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/tfe', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 过热裂解：TFE 在 750–850 °C、停留 0.3–0.6 s（管式炉，石墨内衬）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 750, max: 850 }] },
      { note_zh: '② 急冷到 20–40 °C（水淬），分离未反应的 TFE 与焦油', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 低温冷凝与精馏：−78 °C 干冰冷阱凝 HFP（bp −29.4 °C），再精馏到 99.6 %', performedBy: 'plant/dry-ice-trap', under: [{ param: 'temperature', min: -85, max: -70 }] },
    ],
    rate: { hours: q(18) },
    unbalanced_zh: 'TFE 1 → HFP 0.667（3 TFE → 2 HFP 的化学计量）；选择性 60–75 % ⇒ 实际 TFE 单耗 1.33–1.67；余是焦油与未反应 TFE（循环）',
  },

  {
    /**
     * **PPVE：HFP 环氧化 → HFPO → 与 TFE 加成 → 脱氟酰。**
     *
     *   2 HFP + H₂O₂/NaOH → 2 HFPO（80–90 %）；HFPO + TFE → 加成物；
     *   250–350 °C 脱氟酰 → PPVE（60–75 %）
     */
    id: 'make/ppve',
    name: '全氟制备',
    produces: [
      {
        item: 'mat/ppve',
        qty: q(4, 5),
        gives: [
          { param: 'purity', kind: 'range', min: 99, max: 99.5 },
          { param: 'water', kind: 'range', min: 20, max: 40 },
          { param: 'boilingPoint', kind: 'range', min: 35, max: 36 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/hfp', qty: q(2) }] },
      { anyOf: [{ item: 'mat/hydrogen-peroxide', qty: q(1) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/tfe', qty: q(1) }] },
      { anyOf: [{ item: 'mat/potassium-fluoride', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 环氧化：HFP + 30 % H₂O₂ + NaOH（40–60 °C、2–4 h）→ HFPO，收率 80–90 %', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 40, max: 60 }] },
      { note_zh: '② 加成：HFPO + TFE，KF 催化（60–80 °C、1–2 MPa）→ 全氟酰氟加成物', performedBy: 'plant/autoclave' },
      { note_zh: '③ 脱氟酰：250–350 °C 热解（脱 COF₂），急冷得 PPVE', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 250, max: 350 }] },
      { note_zh: '④ 精馏：bp 35.6 °C，40–60 °C/常压塔顶采出，纯度 99 % 以上', performedBy: 'plant/distillation-tower', under: [{ param: 'temperature', min: 40, max: 60 }] },
    ],
    rate: { hours: q(40) },
    unbalanced_zh: 'HFP 2 + H₂O₂ 1 + NaOH 0.5 + TFE 1 + KF 0.05 → PPVE 0.8；收率：环氧化 85 % × 加成 90 % × 脱氟酰 70 % ≈ 54 %，余是 HFPO 重组分、COF₂ 与精馏头尾',
  },

  {
    /**
     * **PFA：TFE 与 PPVE 乳液共聚。**
     *
     *   TFE 1000 + PPVE 25 + 引发剂 3 → PFA 1000（PPVE 2.5 mol%）
     */
    id: 'make/pfa',
    name: 'PFA 树脂制备',
    produces: [
      {
        item: 'mat/pfa',
        qty: q(1),
        gives: [
          { param: 'ppveContent', kind: 'range', min: 1.5, max: 2.5 },
          { param: 'meltingPoint', kind: 'range', min: 302, max: 308 },
          { param: 'processingTemperature', kind: 'range', min: 360, max: 390 },
          { param: 'purity', kind: 'range', min: 99.9, max: 99.95 },
          { param: 'ash', kind: 'range', min: 20, max: 40 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/tfe', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/ppve', qty: q(25) }] },
      { anyOf: [{ item: 'mat/polymerization-initiator', qty: q(3) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2000) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 乳液聚合：TFE/PPVE = 40:1，60–80 °C、1.5–2 MPa、过硫酸铵引发，8–12 h', performedBy: 'plant/autoclave' },
      { note_zh: '② 凝聚与干燥：破乳、洗涤、120–150 °C 干燥', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 110, max: 120 }] },
      { note_zh: '③ 造粒与测熔指（2–8 g/10 min）、熔点（302–308 °C）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(48) },
    unbalanced_zh: 'TFE 1000 + PPVE 25 + 引发剂 3 + 水 2000 → PFA 1000；余 2028 是水与未反应单体（回收），引发剂进链端 0.3 %',
  },

  {
    /**
     * **PFA 烧杯：热压成型 → 退火 → 酸洗 → 空白测试。**
     *
     *   PFA 0.05 kg → 烧杯 1 件（50–250 mL）。
     */
    id: 'make/pfa-beaker',
    name: 'PFA 烧杯制造',
    produces: [
      {
        item: 'plant/boron-free-lab/pfa-beaker',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 50, max: 250 },
          { param: 'wall', kind: 'range', min: 1.2, max: 1.8 },
          { param: 'blankBoron', kind: 'range', min: 0.005, max: 0.01 },
          { param: 'memory', kind: 'range', min: 0.001, max: 0.004 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/pfa', qty: q(1, 20) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 热压成型（350–400 °C、10–20 MPa、模腔镀硬铬）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 350, max: 400 }] },
      { note_zh: '② 退火 300–320 °C × 2 h（消内应力，防应力开裂）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 300, max: 320 }] },
      { note_zh: '③ 亚沸 HNO₃ + 超纯水煮洗 3 次；空白测试：10 mL 水放 10 min，硼 ≤0.01 ppb、连续三次记忆 <0.005 ppb', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(8) },
    unbalanced_zh: 'PFA 0.05 → 烧杯 1 件；余是飞边与试验件（按件计）',
  },

  {
    /**
     * **PFA 瓶：吹塑 → 退火 → 装盖 → 检漏与空白。**
     *
     *   PFA 0.08 kg → 瓶 1 只（100–1000 mL）。
     */
    id: 'make/pfa-bottle',
    name: 'PFA 瓶制造',
    produces: [
      {
        item: 'plant/boron-free-lab/pfa-bottle',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 100, max: 1000 },
          { param: 'leakRate', kind: 'range', min: 1e-4, max: 5e-4 },
          { param: 'blankBoron', kind: 'range', min: 0.005, max: 0.01 },
          { param: 'memory', kind: 'range', min: 0.001, max: 0.004 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/pfa', qty: q(2, 25) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 吹塑（350–400 °C、型坯 30–80 g），壁厚 1.5–2.5 mm', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 350, max: 400 }] },
      { note_zh: '② 退火 300–320 °C × 2 h；装 PTFE 螺旋盖', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 300, max: 320 }] },
      { note_zh: '③ 检漏（0.05 MPa 保压 5 min）与空白/记忆测试', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(10) },
    unbalanced_zh: 'PFA 0.08 + PTFE 0.01 → 瓶 1 只；余是飞边与瓶盖切头（按件计）',
  },

  {
    /**
     * **PFA 移液管：管材拉制 → 刻度 → 校精度。**
     *
     *   PFA 0.02 kg → 移液管 1 支（1–10 mL，±0.5–1 %）。
     */
    id: 'make/pfa-pipette',
    name: 'PFA 移液管制造',
    produces: [
      {
        item: 'plant/boron-free-lab/pfa-pipette',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 1, max: 10 },
          { param: 'accuracy', kind: 'range', min: 0.5, max: 1 },
          { param: 'blankBoron', kind: 'range', min: 0.005, max: 0.01 },
          { param: 'memory', kind: 'range', min: 0.001, max: 0.004 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/pfa', qty: q(1, 50) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 管材拉制（350–400 °C、锥度 1:20–1:50）与刻度（激光或热压印）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 350, max: 400 }] },
      { note_zh: '② 校精度：20 °C 称量法，1/5/10 mL 各 ±0.5–1 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 酸洗与空白测试（同烧杯）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(6) },
    unbalanced_zh: 'PFA 0.02 → 移液管 1 支；余是拉制废段（按件计）',
  },

  {
    /**
     * **无硼实验室：PFA 内衬 + 4 台 FFU + 无硼台（复用 `plant/boron-free-bench`）。**
     *
     *   无硼台 1 + PFA 板 40 kg + FFU 4 + 钢板 30 + 接触器 2 → 实验室 1 间
     *
     * ⚠️ 装配步骤不写 19–21 的 `under`：实验室自己 holds 19–21，写了会撞
     * `condition_cycle`。
     */
    id: 'make/boron-free-lab',
    name: '无硼实验室制造',
    produces: [
      {
        item: 'plant/boron-free-lab',
        qty: q(1),
        gives: [
          { param: 'blankBoron', kind: 'range', min: 0.005, max: 0.01 },
          { param: 'isoClass', kind: 'range', min: 3, max: 4 },
          { param: 'hepaEfficiency', kind: 'range', min: 99.99, max: 99.995 },
          { param: 'faceVelocity', kind: 'range', min: 0.4, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/pfa', qty: q(40) }] },
      { anyOf: [{ item: 'plant/clean-room/ffu', qty: q(4) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(30) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(2) }] },
      // 器皿计入实验室组成（5 件 PFA 器皿随实验室一起装），单件不再单独消耗：
      { anyOf: [{ item: 'plant/boron-free-lab/pfa-beaker', qty: q(2) }] },
      { anyOf: [{ item: 'plant/boron-free-lab/pfa-bottle', qty: q(4) }] },
      { anyOf: [{ item: 'plant/boron-free-lab/pfa-pipette', qty: q(4) }] },
      { anyOf: [{ item: 'plant/boron-free-lab/pfa-filter', qty: q(2) }] },
      { anyOf: [{ item: 'plant/boron-free-lab/pfa-volumetric-flask', qty: q(2) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/boron-free-bench'],
    steps: [
      { note_zh: '① 围护：PFA 板焊内衬（不许用胶）、316L 骨架、地面环氧', performedBy: 'plant/robot' },
      { note_zh: '② 装 4 台 FFU 与顶送风、无硼台就位；面风速 0.4–0.5 m/s', performedBy: 'plant/robot' },
      { note_zh: '③ 空白验收：台上开盖 10 min、10 mL 水 ≤0.01 ppb；ISO 3–4', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(80) },
    unbalanced_zh: '无硼台 1 + PFA 40 + FFU 4 + 钢板 30 + 接触器 2 → 实验室 1 间（按件计）',
  },

  {
    /**
     * **PFA 膜滤器：PTFE 压延膜拉伸成 0.2 µm 孔 → 装 PFA 壳 → 空白测试。**
     *
     *   PTFE 0.005 + PFA 0.01 → 滤器 1 只
     *
     * 拉伸法：PTFE 粉压坯 → 60–80 °C 压延成膜 → 260–300 °C 双向拉伸（孔 0.1–0.5 µm）
     * → 热定型；孔 0.2 µm 的泡点 0.15–0.25 MPa。
     */
    id: 'make/pfa-filter',
    name: 'PFA 膜滤器制造',
    produces: [
      {
        item: 'plant/boron-free-lab/pfa-filter',
        qty: q(1),
        gives: [
          { param: 'poreSize', kind: 'range', min: 0.18, max: 0.22 },
          { param: 'diameter', kind: 'range', min: 13, max: 47 },
          { param: 'blankBoron', kind: 'range', min: 0.005, max: 0.01 },
          { param: 'holdUp', kind: 'range', min: 0.1, max: 0.3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/pfa', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 压延与拉伸：PTFE 压坯 60–80 °C 压延 0.05 mm，260–300 °C 双向拉伸 3–5 倍（孔 0.1–0.5 µm）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 260, max: 300 }] },
      { note_zh: '② 热定型与装壳：PFA 支撑环热熔（350–400 °C），裁 φ13/25/47 mm', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 350, max: 400 }] },
      { note_zh: '③ 泡点测试（0.15–0.25 MPa）与空白：10 mL 水过膜，硼 ≤0.01 ppb', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(12) },
    unbalanced_zh: 'PTFE 0.005 + PFA 0.01 → 滤器 1 只；余是膜边角与壳体切头（按件计）',
  },

  {
    /**
     * **PFA 容量瓶：吹塑 → 退火 → 刻度 → 水称量校准（≤0.1 %）。**
     *
     *   PFA 0.1 → 容量瓶 1 只（10–100 mL，A 级）
     */
    id: 'make/pfa-volumetric-flask',
    name: 'PFA 容量瓶制造',
    produces: [
      {
        item: 'plant/boron-free-lab/pfa-volumetric-flask',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 10, max: 100 },
          { param: 'accuracy', kind: 'range', min: 0.08, max: 0.15 },
          { param: 'calibrationUncertainty', kind: 'range', min: 0.05, max: 0.08 },
          { param: 'blankBoron', kind: 'range', min: 0.005, max: 0.01 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/pfa', qty: q(1, 10) }] }],
    needs: ['plant/metrology-room', 'plant/micro-balance'],
    steps: [
      { note_zh: '① 吹塑（350–400 °C）出瓶身与长颈，颈内径 8–10 mm', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 350, max: 400 }] },
      { note_zh: '② 退火 300–320 °C × 2 h（消内应力，否则刻度会漂）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 300, max: 320 }] },
      { note_zh: '③ 刻度：20 °C 水称量法（`plant/micro-balance`，0.1 mg 分辨），10/25/50/100 mL 各标 3 次，不确定度 ≤0.1 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 空白：装 10 mL 水放 10 min，硼 ≤0.01 ppb', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(10) },
    unbalanced_zh: 'PFA 0.1 → 容量瓶 1 只；余是飞边与校准废品（按件计）',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PFA_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PFA_ROUTES];
