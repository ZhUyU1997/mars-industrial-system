/**
 * STI 片进前道 —— 把 `mat/well-wafer` 接回现有器件链。
 *
 * `make/gate-oxide-dry`（gate-stack.ts:496）只吃裸 `mat/silicon-wafer`；
 * 本文件补一条**平行入口**：阱片 → 干氧 → `mat/gate-oxide-wafer`，
 * 之后 `make/gate-electrode-poly` → LDD → 硅化物 → `make/device-wafer` 原样可走。
 *
 * 为什么进料从 `mat/sti-wafer` 换成 `mat/well-wafer`：栅氧必须在阱之后。
 * 保留“STI 片 → 栅氧”的入口会绕过阱，只适用于 p 衬底 NMOS，接不了 CMOS；
 * 改一条进料比再加一条并列路线少一条真相。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 边界：只补入口这一条路线；不改 gate-stack.ts / implant.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本文件不新增条目，只新增一条路线；`STI_INTEGRATION_ITEMS` 为空。
 * 阱在 wells.ts；栅电极、源漏不在这里 —— 它们仍由现有路线做。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * R8 —— 三处必须说清的缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **STI 有台阶，干氧不是平面氧化。** 槽肩、槽底与侧壁的应力/晶向不同，
 *      局部氧化速率与平面差 **2–4×**（估算）；现有路线没有局部厚度量具
 *      （椭偏只测平片/陪片，槽内测不到）。所以本路线的 `eot 3.5–4.5` 与
 *      `unbalanced_zh` 只能按**平面记账**，槽内的局部厚度是外推。
 *
 *   ② **阱在 wells.ts 里补了 p/n 阱；PMOS 的 p⁺ 源漏、CMOS 的两次源漏掩模、
 *      双阱套刻仍未做。** 本文件只把阱片接到栅氧入口，不碰 implant.ts。
 *
 *   ③ **栅长仍由现有剥离/湿法定 200–400 nm，不是 CAR 的 80–200 nm。**
 *      CAR 在整条链里只定义隔离槽；栅电极仍是 `make/gate-electrode-poly`
 *      （gate-stack.ts:592）或 SADP 那条（gate-stack.ts:1275）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * gives 为什么只有两项
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `mat/gate-oxide-wafer` 只声明 `eot` 与 `oxideKind`（gate-stack.ts:316–322）；
 * 现有 `make/gate-oxide-dry` 的 `gives` 也只有这两项（gate-stack.ts:501–504）。
 * 漏电/击穿**不是 props**，现有路线把它们写成“成品漏不漏”的判据
 * （gate-stack.ts:486–490），本路线照抄同一句，不另立范围 —— 另立会
 * `prop_unknown`，而且会造出第二条真相。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const STI_INTEGRATION_ITEMS: readonly Item[] = [];

export const STI_INTEGRATION_ROUTES: readonly Route[] = [
  {
    /**
     * **阱片 → HF 预清洗 → 干氧 900–1000 °C → 厚度判据 → 栅氧片。**
     *
     *   阱片 1 + 氧 0.2 kg + 氮 0.2 kg + HF 0.005 kg + 水 1 kg
     *     → `mat/gate-oxide-wafer` 1 片
     *
     * 与 `make/gate-oxide-dry`（gate-stack.ts:496–541）同一套工艺，只换起始片：
     * 裸硅 → 阱片（STI + p/n 阱 + 推进）。`gives` 逐项一致：eot 3.5–4.5、
     * oxideKind thermal-dry-o2。
     *
     * 为什么 rate 是 6 h：与现有路线同一炉时（升温 30 + 等温 + 降温 30 min，
     * 加装片/清洗），不因为起始片是 STI 而改。
     *
     * ⚠️ 漏电/击穿/Weibull 是 GOI 资格带，由 `measure/goi-vramp` 的记录支撑，
     * 不是单次读数。厚度 4 nm 也测不了（干涉仪 0.295 µm/条，4 nm = 0.014 条），
     * 所以 eot 是开环记账；thickness 是物理厚度，不是 eot。
     */
    id: 'make/sti-gate-oxide',
    name: 'Gate Oxide Wafer Manufacturing', name_zh: '栅氧化片制造',
    produces: [
      {
        item: 'mat/gate-oxide-wafer',
        qty: q(1),
        // 逐项照抄 make/gate-oxide-dry（gate-stack.ts:501–504），不另立范围
        gives: [
          { param: 'eot', kind: 'range', min: 3.5, max: 4.5 },
          { param: 'oxideKind', kind: 'enum', oneOf: ['thermal-dry-o2'] },
          // GOI 资格带，不是单次读数；thickness 是物理厚度，不是 eot。
          { param: 'vbd', kind: 'range', min: 0, max: 200, record: 'mat/goi-vramp-record' },
          { param: 'ebd', kind: 'range', min: 5, max: 12, record: 'mat/goi-vramp-record' },
          { param: 'weibullBeta', kind: 'range', min: 1, max: 3, record: 'mat/goi-vramp-record' },
          { param: 'thickness', kind: 'range', min: 0.0035, max: 0.4, record: 'mat/goi-vramp-record' },
          { param: 'waferDiameter', kind: 'range', min: 100, max: 150, record: 'mat/goi-vramp-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/well-wafer', qty: q(1) }] },
      // 氧 0.2 kg：与现有路线同量（坡上、气路、过量都算进去）
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 5) }] },
      // 氮 0.2 kg：升降温与吹扫，不进膜
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 5) }] },
      // HF-last：49 % HF 0.005 kg，1–2 s；与现有路线同量
      { anyOf: [{ item: 'mat/hf', qty: q(1, 200) }] },
      // 冲洗：1 kg（实际几十 mL，取 1 kg 留冲洗余量）
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    // 执行者（wet-bench / diffusion-furnace / robot）不进 needs，避免 redundant_need
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh:
          '① RCA 清洗 + HF-last：49 % HF 1–2 s 剥掉 1–2 nm 原生氧化层（10 nm/s）—— 不能泡 10 s，那是 100 nm。停没停只能看疏水性（氢终止的硅面不润湿），没有膜厚量具。与 make/gate-oxide-dry 的同一段（gate-stack.ts:519–525）；阱片的槽肩/槽底有台阶，HF 只去原生氧化层，台阶处的残渣/水痕没有局部量具（R8①）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '② 干氧 900–1000 °C：等温段压到 0，坡上自己长 3–5.5 nm ⇒ 交付 4 nm；升降温各 30 min，炉时 1 h。与现有路线同一套记账（gate-stack.ts:527–532），只把温度窗口从 950–1100 收到 900–1000。**阱片槽肩/槽底的局部厚度与平面差 2–4×（估算）**，本路线只按平面记账（R8①）',
        performedBy: 'plant/diffusion-furnace',
        under: [{ param: 'temperature', min: 900, max: 1000 }],
      },
      {
        note_zh:
          '③ 厚度判据：4 nm 测不了（干涉仪 0.295 µm/条，4 nm = 0.014 条）⇒ 判据只有时间×温度的记账与成品“栅氧漏不漏”。恒温间 ±1 K 是记账可重复的前提。与 make/gate-oxide-dry 的同一段（gate-stack.ts:533–538）；漏电/击穿不是 props，不能另立 gives',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '阱片 1（12.8 g）+ 氧 0.2 + 氮 0.2 + HF 0.005 + 水 1 → 栅氧片 1。4 nm SiO₂ 按平面 78.5 cm² × 2.27 g/cm³ = **0.071 mg**；阱片槽肩/槽底/侧壁的展开面积按 2.5× 平面估算（100–200 nm 宽、250–300 nm 深、50 % 占空比 ⇒ 2.3–4.0×，取 2.5×）⇒ **0.178 mg 级**。其中氧 0.095 mg、硅 0.083 mg（来自片）。氧投 0.2 kg、氮 0.2 kg、HF 5 g、水 1 kg 都是过量（氧是 2×10^6×，HF 是 1×10^5×），差额进尾气/洗液。产物按片计（12.8 g 片 + 0.178 mg SiO₂）；不是账不平，是气体与清洗液过量',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...STI_INTEGRATION_ROUTES];
