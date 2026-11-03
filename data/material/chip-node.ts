/**
 * 两片芯片的产出判据 —— 40 nm MCU 能推到哪一档，8 nm SoC 的路线在哪。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、先纠正一个转述
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 任务书说 `plant/euv-stepper` 的 overlay 是 43 nm。**数据里不是。**
 *
 *   - `plant/euv-stepper` 的 `props` 是 **overlay 0–560 nm**（基础台：刻度盘 1 µm
 *     + 机器人视觉 ±0.25 µm，RSS 559 → 560；`euv-fab.ts` 降级 2）。
 *   - **43 nm 不是整机默认值**：它是 `make/euv-wafer-overlay-43` 在「干涉台
 *     （`make/euv-stepper-stage-interferometric`）+ 边缘对准器 + 零层光栅」
 *     三者合取之后的**片级**合成（RSS 29.8，门 43）。
 *   - field 2 mm 是 `euv-fab.ts` 的实际成像场；整机 prop 写的是 1–30 mm（能力），
 *     实际光学模块只有 2×2 mm 的场。
 *   - mirrors 10 是 `euv-fab.ts` 的 1 收集 + 3 照明 + 6 投影；整机 prop 是 1–12。
 *
 * 所以下面 8 nm 的账按 **两条** 算：基础台 560 nm（整机默认）与 43 nm（最好的
 * 专用配置）。两条都过不去，结论不靠挑哪一条。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、40 nm MCU：16–24 nm 前道 + 40–100 nm 后道 + LPCVD Si₃N₄ 钝化
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 链路：
 *
 *   `make/device-wafer-saqp`（node 16–24）
 *     → `make/beol-40nm-8layer`（40–100 nm 线、AR 2–3、dishing 3–8、8 层）
 *     → 本文件 `make/mcu-40nm-damascene`（LPCVD Si₃N₄ 钝化 + 划片 + 装架 + 键合 + 测试）
 *     → `std/mcu-40nm-general`
 *
 * 逐格判据（40 nm 的六条 BEOL 判据来自 `make/mcu-3um-damascene` 的 need）：
 *
 *   | 格 | 40 nm 要 | 本路线交 | 判定 |
 *   |---|---|---|---|
 *   | node | ≤50（#26 的 40 nm 档） | 16–24（SAQP 前道） | 过（更细） |
 *   | layers | ≥8 | 8（beol-40nm-8layer） | 过 |
 *   | lineWidth | ≤100 nm | 40–100（beol-40nm-8layer） | 过 |
 *   | aspectRatio | ≥1.5 | 2–3（beol-40nm-8layer） | 过 |
 *   | dishing | ≤10 nm | 3–8（beol-40nm-8layer） | 过 |
 *   | barrierThickness | ≤3 nm | 2（tin-barrier-2nm） | 过 |
 *   | kValue | ≤2.5 | 2.4–2.5（sico-h-2p5） | 过 |
 *
 * 所以 `gives.node` 仍写 **16–24**，不写 40：前道实际窗口就是 16–24；后道
 * 现在 40–100 nm，按 #26 这是 40 nm 档的后道。**三条降级已销**：之前的
 * 100–300 / 0.67–2 / 7–12 是 `damascene-stack-8` 的窗口，现在的
 * `make/beol-40nm-8layer` 同时交 40–100、2–3、3–8。
 *
 * ⚠️ `make/beol-30nm-15layer` 也交 6/6，但它的 `mat/device-wafer` need 是
 * **node ≤10**（8 nm 前道）；能接 16–24 前道的 6/6 只有
 * `make/beol-40nm-8layer`。这是本路线存在的理由，不是重复。
 *
 * ⚠️ **模型仍按属性逐条 OR**：报告不会分别保证"同一条路线同时交六格"。本文件
 * 用 `make/beol-40nm-8layer` 把六格同时写进 `gives`；审计时看这一条即可。
 * 不把 need 改成单个窗口来藏要求。
 *
 * 钝化：`mat/si3n4-lpcvd`（LPCVD，0.3–1 µm、Si/N 0.75–0.85、H ≤2 at%、
 * 应力 0.5–1.5 GPa、均匀性 ≤5 %），由 `make/lpcvd-si3n4` 产；**不是** SOG/酚醛，
 * 没有钠污染。40 nm 级钝化这一格已过。剩下的缺口是测试（C-V/I-V、高速）
 * 与掩模（pellicle/修版），不是后道三格。
 *
 * **完整 40 nm 还缺什么**：后道三格与钝化已过；测试与掩模仍是缺口。
 * `node` 16–24 是前道窗口，不是 40 nm 的虚报 —— 它比 40 nm 细，仍落在
 * "40 nm 档 ≤50"内。
 *
 * ⚠️ **k 2.4–2.5 与 dishing 3–8 的 CMP 冲突仍在**：`lowk-barrier.ts` ⑰ 说
 * 2.5–3.5 GPa 的低 k 在 CMP 下 erosion 13–32 nm，铜凸出来会让 dishing 假通过。
 * 本路线交的 3–8 是**铜凹陷**的设计窗口，不含 low-k erosion；要真闭合得先有
 * E≥5 GPa 的 k≤2.5 介质或硬罩（`lowk-barrier.ts` ⑰：0 台/0 条）。
 * 这一格不是线宽/AR/dishing 三格之一，但它是 40 nm 后道的剩余物理缺口，
 * 不假装闭合。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、8 nm SoC：**路线已建**（`make/soc-8nm-damascene`，`data/machine/euv-hina.ts`）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 这一节保留的是**旧整机（2×2 mm 场、43/560 nm 套刻）过不去的那笔账**，
 * 作为对照；它不再是结论。现在的链路是：
 *
 *   `make/device-wafer-oct`（8 重成像，node 8–10）
 *     → `make/beol-30nm-15layer`（25–30 nm 线、15–20 层）
 *     → `make/soc-8nm-damascene`（钝化 + 划片 + 装架 + 键合 + 测试）
 *     → `std/soc-8nm-general`（node 8–10、layers 15–20）
 *
 * 整机是 `plant/euv-stepper-hina`：NA 0.55、26×16.5 单场（26×33 是条目余量）、
 * overlay ≤2.7 nm、throughput ≥100 片/h（单层）、光源 250 W。
 *
 * 判据：node ≤10 nm（8 nm 本体；item props 的 ≤30 是旧声明上限，不拿来放宽）。
 *
 * ── 1. 前道：旧 SAQP 16–24 → 新 8 重成像 8–10 ─────────────────────────────
 *
 *   旧：本层最细的器件片是 `make/device-wafer-saqp`：node 16–24，
 *   16/10 = 1.6；24/10 = 2.4，差 1.6–2.4 倍。
 *   新：`make/device-wafer-oct`（`euv-hina.ts`）用高-NA 画 64–80 nm 芯轴，
 *   再走三轮侧墙（2×2×2 = 8 重）→ **8–10 nm**。旧账保留为对照。
 *
 * ── 2. 拼接：旧 field 2×2 mm → 新 26×16.5 单场 ────────────────────────────
 *
 *   旧：10×10 mm 的 die（设计值，移动 SoC 常见的 50–150 mm² 量级）要
 *   5×5 = **25 块** 2×2 场，内部 8 条缝；10 % 重叠则 36 块、10 条缝。
 *   新：`plant/euv-stepper-hina` 的单次曝光场是 **26×16.5 mm**（地球 high-NA
 *   的变形 4×/8× 半场），10×10 的 die **一次放得下**，25 块拼接消掉。
 *   26×33 是条目给的余量；超过 26×16.5 的 die 仍要两次曝光。
 *
 * ── 3. 套刻：旧 43/560 nm → 新 2.7 nm ─────────────────────────────────────
 *
 *   旧：43 nm 片级门按最乐观读法在缝上叠成 60.8–86.0 nm，对 2.7 差
 *   15.9–31.9 倍；基础台 560 nm 差 207–293 倍。
 *   新：整机 overlay ≤2.7 nm；预算 RSS = √(1.0²+0.8²+0.5²+1.2²+0.6²) = 1.93 nm
 *   （台 1.0 + 掩模台 0.8 + 对准 0.5 + 畸变 1.2 + 量测 0.6）。2.7 是 8 nm 后道
 *   的**每层门**，不是拼接后的缝上值。
 *
 * ── 4. 成像：旧 36 nm → 新 2 nm ───────────────────────────────────────────
 *
 *   旧：`plant/euv-stepper/optics-module` 的 36 nm = 2.7 λ，Strehl 已经没了。
 *   新：`plant/euv-stepper-hina/optics-module` 8 面镜、wavefront ≤2 nm：
 *   2×0.15×√8 = 0.85，加镀膜 0.6、装调 1.2、热 1.0 → 1.83 → 2 nm。
 *   NA 0.55 的极限半节距 k1·λ/(2NA) = 0.5×13.5/(2×0.55) = **6.1 nm**。
 *
 * ── 5. 后道：旧 stack-12 → 新 15–20 层 / 25–30 nm ────────────────────────
 *
 *   旧：`make/damascene-stack-12` 是 12 层、100–300 nm、29.8 nm 套刻，
 *   12 层累积 √12×29.8 = 103.2 nm。
 *   新：`make/beol-30nm-15layer` 交 lineWidth 25–30、AR 2–2.5、dishing 3–5、
 *   barrier 2.0、k 2.4–2.5、layers 15–20；每层用整机的 2.7 nm 门。
 *
 * ── 6. 钝化 / 测试 / 掩模 ─────────────────────────────────────────────────
 *
 *   钝化：已有 `mat/si3n4-lpcvd`（0.3–1 µm、Si/N 0.75–0.85、H ≤2 at%、
 *   应力 0.5–1.5 GPa），由 `make/lpcvd-si3n4` 产出；`make/soc-8nm-damascene`
 *   已把它写进 `uses`，不再是「本层没有电子级 Si₃N₄」。
 *   测试：没有 C-V/I-V，没有高速功能测试 —— 仍是缺口。
 *   掩模：没有 pellicle、没有修版，一套 20 块要 20 天 —— 仍是缺口。
 *
 * ── 7. 还差什么（按缺口量级）──────────────────────────────────────────────
 *
 *   ① **可溯源套刻量具**：机内 2.7 nm 可读；独立的 DBO / 亚纳米 CD-SEM 没有，
 *      现有 CD-SEM vernier 0.1 µm 差 **200 倍**（`data/measure/euv-hina.ts`）。
 *   ② **掩模**：pellicle、修版、20 块套版的试曝光。
 *   ③ **测试**：C-V/I-V、高速功能测试。
 *   ④ **at-wavelength 的 0.1 nm 是设计值**：可见光闭环 0.52 nm，差 5.2 倍；
 *      `plant/euv-stepper-hina/atw-interferometer` 有路线，但没有 `measure/*` 读数。
 *
 *   **结论：8 nm SoC 有路线** —— `make/soc-8nm-damascene` 产出
 *   `std/soc-8nm-general`（node 8–10、layers 15–20）。剩下的缺口是
 *   可溯源套刻量具、掩模（pellicle/修版）与测试三格，**不是整条链的终止**。
 *   `std/soc-8nm-general` 在报告里已不再是没有路线的断点。
 */

import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、路线
// ═══════════════════════════════════════════════════════════════════════════

export const CHIP_NODE_ROUTES: readonly Route[] = [
  {
    /**
     * 40 nm MCU 的后半条：**8 层铜互连 + LPCVD 氮化硅钝化 + 划片 + 装架 + 键合 + 测试**。
     *
     *   前道片 1 + 8 层互连片 1 + 氮化硅钝化片 1 + 水 2 kg → MCU 1 片
     *
     * 前半条在 `make/device-wafer-saqp`（node 16–24）与
     * `make/beol-40nm-8layer`（40–100 nm 线、AR 2–3、dishing 3–8、8 层）里。
     * 这条路线只做后道四段，所以它的 `gives` 是**转交**前道的 node 与层数，
     * 不是它自己改出来的规格。
     *
     * ── 为什么 node 写 16–24 而不是 40 ────────────────────────────────────────
     *
     * `make/device-wafer-saqp` 的实际交付窗口就是 16–24；`std/mcu-40nm-general`
     * 的 id 是条目名，按"40 nm 档 ≤50"，16–24 判得过。
     * 但**不能写成 40**：这条路线没有把 16–24 放宽到 40 的工序，写 40 就是虚报。
     *
     * ── 后道六格：全部覆盖 ────────────────────────────────────────────────────
     *
     *   lineWidth 40–100、AR 2–3、dishing 3–8、barrier 2、k 2.4–2.5、layers 8
     *   全部由 `make/beol-40nm-8layer` 的 `gives` 一条路线交出。
     *   `make/beol-30nm-15layer` 也 6/6，但它的输入是 node ≤10；这条链是
     *   16–24 前道，能接上的 6/6 只有 `make/beol-40nm-8layer`。
     *   之前的 stack-8 三格降级（100–300 / 0.67–2 / 7–12）不再走。
     *   `onRelax: functional-kept` 只是未来生产者回归时的降级声明；当前六格 covered。
     *
     * ── 钝化：电子级 LPCVD Si₃N₄ ─────────────────────────────────────────────
     *
     *   `mat/si3n4-lpcvd`（0.3–1 µm、Si/N 0.75–0.85、H ≤2 at%、应力 0.5–1.5 GPa、
     *   均匀性 ≤5 %），由 `make/lpcvd-si3n4` 产；没有 SOG/钠。步骤是
     *   `plant/lpcvd-furnace` 700–780 °C / 13–40 Pa。
     *   剩下的缺口是测试（C-V/I-V、高速）与掩模（pellicle/修版），不是钝化。
     *
     * ── 质量账：按片计，不折 kg ───────────────────────────────────────────────
     *
     * 芯片条目没有 `mass`。前道片、互连片、钝化片在模型里是三件、**实际是同一片
     * 上的层**（`mat/damascene-layer` / `mat/si3n4-lpcvd` 的记账口径），所以
     * 3 片进、1 片出不是丢了两片硅；见 `unbalanced_zh`。
     */
    id: 'make/mcu-40nm-damascene',
    name: '40 nm Process MCU Manufacturing', name_zh: '40 nm 制程的 MCU 制造',
    produces: [
      {
        item: 'std/mcu-40nm-general',
        qty: q(1),
        gives: [
          // 前道 SAQP 的实际窗口，不是 40。见文件头第一节。
          { param: 'node', kind: 'range', min: 16, max: 24 },
          // `make/beol-40nm-8layer` 的 layers 窗口是 8–8。
          { param: 'layers', kind: 'range', min: 8, max: 8 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/device-wafer',
            qty: q(1),
            // 40 nm 档判据：node ≤50。SAQP 的 16–24 判得过。
            need: [{ param: 'node', kind: 'range', max: 50, dir: 'atMost' }],
            onRelax: 'functional-lost',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/damascene-layer',
            qty: q(1),
            // 40 nm 的六条 BEOL 判据。六格全部由 make/beol-40nm-8layer 一条路线交出。
            // ⚠️ 模型按属性逐条 OR；本路线依赖的是那一条的 gives，不是别处的并集。
            need: [
              { param: 'lineWidth', kind: 'range', max: 100, dir: 'atMost' },
              { param: 'aspectRatio', kind: 'range', min: 1.5, dir: 'atLeast' },
              { param: 'dishing', kind: 'range', max: 10, dir: 'atMost' },
              { param: 'barrierThickness', kind: 'range', max: 3, dir: 'atMost' },
              { param: 'kValue', kind: 'range', max: 2.5, dir: 'atMost' },
              { param: 'layers', kind: 'range', min: 8, dir: 'atLeast' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      // 钝化：LPCVD 氮化硅（电子级，无钠）。0.3–1 µm、Si/N 0.75–0.85、
      // H ≤2 at%、应力 0.5–1.5 GPa、均匀性 ≤5 % 由 make/lpcvd-si3n4 交。
      {
        anyOf: [
          {
            item: 'mat/si3n4-lpcvd',
            qty: q(1),
            need: [
              { param: 'thickness', kind: 'range', min: 0.3, max: 1 },
              { param: 'stoichiometry', kind: 'range', min: 0.75, max: 0.85 },
              { param: 'hydrogenContent', kind: 'range', max: 2, dir: 'atMost' },
              { param: 'stress', kind: 'range', min: 0.5, max: 1.5 },
              { param: 'uniformity', kind: 'range', max: 5, dir: 'atMost' },
            ],
            onRelax: 'functional-lost',
          },
        ],
      },
      // 冲洗与甩干：钝化前、划片前各一次。
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    // 设计值：后道 24 h（钝化/划片/装架/键合/测试）。
    // 不含 8 层互连的工时 —— 那在 `make/beol-40nm-8layer` 里（120 h，设计值）。
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: '前道片、互连片、钝化片在模型里是三件、实际是同一片上的层；对位后进钝化',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          'LPCVD Si₃N₄ 钝化：0.3–1 µm，700–780 °C / 13–40 Pa；Si/N 0.75–0.85、H ≤2 at%、应力 0.5–1.5 GPa、均匀性 ≤5 %（make/lpcvd-si3n4 的交付窗口）',
        performedBy: 'plant/lpcvd-furnace',
        under: [
          { param: 'temperature', min: 700, max: 780 },
          { param: 'pressure', min: 13, max: 40 },
        ],
      },
      {
        note_zh:
          '划片：手磨硬质合金轮，每片 200–400 个 die；刀痕 50–100 µm，划片道吃掉 10–20 % 面积',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '装架、键合、封帽：引线 8–40 根、金属帽；测试只测通断与漏电 —— 没有 C-V/I-V，也没有高速功能测试',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '前道片 1（约 12.8 g 硅）+ 8 层互连片 1 + LPCVD 氮化硅钝化片 1（三者在模型里是三件、实际是同一片上的层）+ 水 2 kg → MCU 1 片。Si₃N₄ 膜 7.5–25.1 mg（0.3–1 µm × 78.5 cm² × 3.2 g/cm³），其余是气体与清洗水；产物按片计，芯片质量没有条目，不折 kg。',
  },

  {
    /**
     * **低选择性铜 CMP 浆** —— 把 `make/cmp-slurry-cu-alkaline` 的 35–70 : 1
     * 降到 8–15 : 1，给 40–100 nm 的线用。
     *
     * 为什么 40–100 nm 要低选择性：dishing 的主项是"凹处的铜被多抛"。
     * 高选择性浆靠"凸处先磨、凹处钝化"工作，但 40–100 nm 的沟很窄，
     * PEG 的扩散与钝化膜更容易被机械擦掉；把重铬酸钠从 5 kg/t 降到 1 kg/t，
     * Cu : SiO₂ 从 35–70 降到 8–15，去除率从 150–250 降到 100–160 nm/min。
     * CMP 是 870 nm 光学终点控制，速率低一点只多几秒，过抛项反而小。
     *
     * ⚠️ 8–15 与 100–160 是**设计值**：`cmp-slurry.ts` 的表格只给了 35–70
     * （0.5 wt% 重铬酸钠、45–55 nm 硅溶胶）；降氧化剂后的选择比没有实测，
     * 按同表"氧化剂少 → 选择比低"的方向取 8–15，B 类。
     * dishing 3–8 也没有 <25 nm 的台阶量具（R8 ⑩），是算的，不是量的。
     *
     * 质量账：989 + 1 + 1 + 3 + 6 = 1000 kg，恰好平。
     */
    id: 'make/cmp-slurry-lowdishing',
    name: 'Low-Selectivity Copper CMP Slurry Production', name_zh: '低选择性铜 CMP 浆制备',
    produces: [
      {
        item: 'mat/cmp-slurry',
        qty: q(1000),
        gives: [
          { param: 'particleSize', kind: 'range', min: 45, max: 55 },
          { param: 'monodispersity', kind: 'range', min: 0.09, max: 0.13 },
          { param: 'ph', kind: 'range', min: 9.2, max: 9.8 },
          { param: 'solidLoad', kind: 'range', min: 4.6, max: 5.1 },
          { param: 'removalRate', kind: 'range', min: 100, max: 160 },
          { param: 'selectivity', kind: 'range', min: 8, max: 15 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/colloidal-silica',
            qty: q(989),
            need: [
              { param: 'particleSize', kind: 'range', max: 60, dir: 'atMost' },
              { param: 'monodispersity', kind: 'range', max: 0.15, dir: 'atMost' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/sodium-dichromate', qty: q(1) }] },
      {
        anyOf: [
          {
            item: 'mat/peg',
            qty: q(1),
            need: [
              { param: 'molecularWeight', kind: 'range', min: 3500, max: 4500 },
              { param: 'purity', kind: 'range', min: 90, dir: 'atLeast' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/naoh',
            qty: q(3),
            need: [{ param: 'concentration', kind: 'range', min: 40, max: 50 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/water', qty: q(6) }] },
    ],
    needs: ['plant/clean-room', 'plant/water-polisher'],
    performedBy: 'plant/wet-bench',
    under: [
      { param: 'temperature', min: 20, max: 30 },
      { param: 'pressure', min: 100, max: 500 },
    ],
    rate: { hours: q(2) },
    unbalanced_zh:
      '胶体硅 989 + 重铬酸钠 1 + PEG 1 + 45 % 碱液 3 + 水 6 = 1000 kg → 浆 1000 kg；恰好平。低氧化剂配方的 8–15 选择比与 100–160 nm/min 去除率是设计值（没有实测）。',
  },

  {
    /**
     * **40 nm 档 8 层铜后道：40–100 nm 线、AR 2–3、dishing 3–8、2 nm TiN、k 2.4–2.5。**
     *
     *   器件片 1 + CAR 8 g + C4F6 20 g + Ar 1.2 kg + O₂ 0.16 kg
     *   + Ti 2 g + NH₃ 2 g + Cu 0.2 g + 籽晶片 8 + 超填液 0.16 kg
     *   + 硫酸 2 g + 低选择性浆 16 kg + 水 32 kg
     *   → 互连片 1（8 层）
     *
     * ── 图形化：为什么不直接 EUV 单程写 40–100 nm ───────────────────────────
     *
     *   本层没有 40 nm 档的 CAR：`mat/car-resist` 交 **resolution 80–200 nm**
     *   （`car-resist-pag.ts`：酸扩散 6–11 nm 是硬底，16–32 nm 档差 2.5–12×）。
     *   直接写 40–100 nm 要 40 nm 胶，本层造不出；也不去编一个没有数据支撑的
     * "40 nm CAR"。
     *
     *   所以走 **高-NA 粗芯轴 + SAQP 4×**：高-NA 画 **160–400 nm** 的芯轴
     *   （NA 0.55 的半节距 6.1 nm，画 160 nm 绰绰有余；CAR 80–200 也够），
     *   四重成像把线宽砍到 **40–100 nm**。这是地球 40 nm 世代的常规做法
     *   （SAQP/LELE），不需要 40 nm 胶。
     *
     *   ⚠️ CAR 是 193 nm 的化学；13.5 nm 的感光截面没有单独条目，按同一 PAG
     *   化学记账（模型缺口，和 `make/beol-30nm-15layer` 用 `mat/photoresist`
     *   是同一类简化）。**分辨率这一档由 SAQP 放宽到 160–400 nm，不编 40 nm CAR。**
     *
     * ── 套刻：为什么必须 high-NA，不是 ArF SAQP ─────────────────────────────
     *
     *   8 层累积套刻是 √8 × 每层 overlay。ArF 的 SAQP 用 `edge-aligner` 的
     *   29.8 nm/层 ⇒ √8 × 29.8 = **84.3 nm**，对 40 nm 线的半宽 20 nm 已经
     *   过 4 倍，通孔落不到线上。高-NA 的整机 overlay 是 **≤2.7 nm/层**
     *   （`make/euv-hina` 的 gives）⇒ √8 × 2.7 = **7.64 nm**，小于 20 nm 半宽
     *   （2.6 倍余量），40–100 nm 的线都成立。
     *
     * ── 刻蚀：`plant/rie-etcher` 够，不建 ICP ──────────────────────────────
     *
     *   本层 C4F6/O2/Ar 的氧化物沟槽路线（`make/rie-oxide-trench-c4f6`）已交
     *   sidewall 86–88°、selectivity 6–12、AR 3–4；`plant/rie-etcher` 的 holds 是
     *   1e-6–100 Pa、15–80 °C，props 的 anisotropy 60–90°、selectivity 0.5–50 都覆盖。
     *   本路线只要 AR 2–3（40 nm 线刻 80–120 nm；100 nm 线刻 200–300 nm），
     *   比它已交的 3–4 更浅，**不需要 ICP**。86–88° 对 40 nm 线的侧蚀是
     *   80–120/tan(86–88°) = 2.8–8.4 nm/边，仍在 40 nm 线的预算内。
     *
     * ── CMP：低选择性浆 + 硬垫 + 870 nm 光学终点 ──────────────────────────
     *
     *   `make/cmp-slurry-lowdishing` 交 selectivity 8–15（不是 35–70）、
     *   particleSize 45–55、pH 9.2–9.8；`plant/cmp-integration` 的硬垫 + 两区压力
     *   + `plant/ir-endpoint` 的 870 nm 光学终点把过抛压到 1.1–1.5 s。
     *   dishing 3–8 是设计窗口（3–5 来自 `make/cmp-fine-damascene-slurry` 的
     *   同一浆/垫预算；40–100 nm 线宽下机械项 ∝w⁴ 更小，取 3–8 留边）。
     *   ⚠️ 3–8 nm 没有 <25 nm 的台阶量具，是算的，不是量的（`cmp-slurry.ts` R8 ⑩）。
     *
     * ⚠️ **k 2.4–2.5 与 dishing 3–8 的 CMP 冲突仍在**：`lowk-barrier.ts` ⑰ 说
     * 2.5–3.5 GPa 的低 k 在 CMP 下 erosion 13–32 nm，铜凸出来会让 dishing 假通过。
     * 本路线的 3–8 是**铜凹陷**，不含 low-k erosion；要真闭合得先有 E≥5 GPa 的
     * k≤2.5 介质或硬罩（0 台/0 条）。这一格不在三格里，但它是剩余物理缺口。
     *
     * ── 阻挡与介质 ─────────────────────────────────────────────────────────
     *
     *   barrier 2.0：`make/tin-barrier-2nm`（`data/machine/tin-ald.ts`，2 L 单片
     *   ALD，1.8–2.2 nm、Cl 0.3–0.9 at%、200–500 µΩ·cm）；8 层 × 1 片 = 8 片。
     *   步骤 ④ 用 `plant/tin-ald` **350–450 °C / 10–100 Pa**；旧 `plant/ald-reactor`
     *   的 200–300 °C 不在本机的 holds 里，所以单列一步，不硬塞进旧条件。
     *   k 2.4–2.5：`make/sico-h-2p5`（多孔 SiCOH 2.4–2.5）。
     *   ⚠️ 模型没有把低 k 膜单独作为投入；k 按 `make/sico-h-2p5` 的化学记账，
     *   与 `make/beol-30nm-15layer` 同口径。barrier 2.0 同理。
     *   8 层是计数，不是循环：第 n+1 层就是在这个 id 上再跑一遍。
     *
     * ⚠️ 这是**设计窗口**：线宽均匀性/LER 没有量具（`saqp.ts` 缺口①），
     * overlay 2.7 nm 是整机设计值（独立 DBO 没有），dishing 3–8 是算的。
     * 数据上六格覆盖，不等于实测闭合（L0–L3）。
     */
    id: 'make/beol-40nm-8layer',
    name: 'Single-Layer Copper Interconnect Wafer Manufacturing', name_zh: '单层铜互连片制造',
    produces: [
      {
        item: 'mat/damascene-layer',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 40, max: 100 },
          { param: 'aspectRatio', kind: 'range', min: 2, max: 3 },
          { param: 'dishing', kind: 'range', min: 3, max: 8 },
          { param: 'barrierThickness', kind: 'range', min: 2, max: 2 },
          { param: 'kValue', kind: 'range', min: 2.4, max: 2.5 },
          { param: 'layers', kind: 'range', min: 8, max: 8 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/device-wafer',
            qty: q(1),
            need: [{ param: 'node', kind: 'range', max: 50, dir: 'atMost' }],
            onRelax: 'functional-lost',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/car-resist',
            qty: q(8, 1000),
            need: [{ param: 'resolution', kind: 'range', max: 200, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      // 8 层：每层 2.5 g C4F6、150 g Ar、20 g O2；2 nm 阻挡片 8 片；Cu 0.2 g；浆 2 kg/层。
      { anyOf: [{ item: 'mat/c4f6', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(6, 5) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(4, 25) }] },
      {
        anyOf: [
          {
            item: 'mat/tin-barrier-2nm',
            qty: q(8),
            need: [
              { param: 'thickness', kind: 'range', min: 1.8, max: 2.2 },
              { param: 'uniformity', kind: 'range', max: 5, dir: 'atMost' },
              { param: 'clResidue', kind: 'range', max: 1, dir: 'atMost' },
              { param: 'resistivity', kind: 'range', min: 200, max: 500 },
              { param: 'stepCoverage', kind: 'range', min: 88, dir: 'atLeast' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5000) }] },
      { anyOf: [{ item: 'mat/cu-seed-wafer', qty: q(8) }] },
      { anyOf: [{ item: 'mat/superfill-bath-3', qty: q(4, 25) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(1, 500) }] },
      {
        anyOf: [
          {
            item: 'mat/cmp-slurry',
            qty: q(16),
            need: [
              { param: 'selectivity', kind: 'range', max: 20, dir: 'atMost' },
              { param: 'particleSize', kind: 'range', max: 60, dir: 'atMost' },
              { param: 'ph', kind: 'range', min: 9.2, max: 9.8 },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/water', qty: q(32) }] },
    ],
    needs: [{ item: 'plant/euv-stepper-hina', qty: q(1), need: [{ param: 'na', kind: 'range', min: 0.55, dir: 'atLeast' }, { param: 'overlay', kind: 'range', max: 2.7, dir: 'atMost' }, { param: 'field', kind: 'range', min: 10, dir: 'atLeast' }], onRelax: 'functional-lost' }, 'plant/euv-source', 'plant/euv-vacuum', 'plant/euv-pulser', 'plant/cmp-uniformity-kit', 'plant/ir-endpoint', 'plant/cd-sem', 'plant/clean-room', 'plant/metrology-room', 'plant/water-polisher', { item: 'std/euv-mask-32nm', qty: q(8) }],
    // 设计值：8 层 × 15 h/层 = 120 h；8 nm 的 15–20 层是 240 h，同量级。
    rate: { hours: q(120) },
    steps: [
      {
        note_zh:
          '① 涂 CAR 8 g、前烘、高-NA 画 160–400 nm 芯轴、显影（CAR 80–200 够；不直接写 40 nm，避免要 40 nm 胶）',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh:
          '② 两轮侧墙（SAQP 4×）：ALD 氧化硅 + 回刻 160–400 → 40–100 nm；ALD 200–300 °C / 10–100 Pa',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 200, max: 300 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '③ C4F6/O₂/Ar RIE：4–8 Pa、20–60 °C、300 W；侧壁 86–88°、selectivity 6–12、刻深 80–300 nm（按线宽取 AR 2–3）',
        performedBy: 'plant/rie-etcher',
        under: [
          { param: 'pressure', min: 4, max: 8 },
          { param: 'temperature', min: 20, max: 60 },
        ],
      },
      {
        note_zh:
          '④ 2 nm TiN 阻挡：直接接 `make/tin-barrier-2nm` 的 1.8–2.2 nm 片（8 层 × 1 片）；`plant/tin-ald` 350–450 °C / 10–100 Pa，Cl 0.3–0.9 at%',
        performedBy: 'plant/tin-ald',
        under: [
          { param: 'temperature', min: 350, max: 450 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '⑤ 超填铜：200–350 nm overburden；22–25 °C / 15–20 kPa',
        performedBy: 'plant/plating-bath',
        under: [
          { param: 'temperature', min: 22, max: 25 },
          { param: 'pressure', min: 15, max: 20 },
        ],
      },
      {
        note_zh:
          '⑥ CMP：低选择性浆 8–15 + 硬垫 + 870 nm 光学终点；dishing 3–8 nm（设计值）',
        performedBy: 'plant/cmp-integration',
        under: [{ param: 'pressure', min: 15, max: 30 }],
      },
      {
        note_zh:
          '⑦ 8 层重复：每层读 CD-SEM 与套刻；√8 × 2.7 = 7.64 nm < 40 nm 线半宽 20 nm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '器件片 1 + CAR 8 g + C4F6 20 g + Ar 1.2 kg + O₂ 0.16 kg + 2 nm 阻挡片 8 + Cu 0.2 g + 籽晶片 8 + 超填液 0.16 kg + 硫酸 2 g + 低选择性浆 16 kg + 水 32 kg → 互连片 1（8 层）。产物按片计（一片 12.8 g 硅 + 8 层铜/介质），不折 kg；铜 8 × 78.5 cm² × 0.3 µm × 8.96 = 0.17 g，投 0.2 g；TiN 8 × 78.5 × 2 nm × 5.4 = 0.68 mg，Ti/NH₃ 在 make/tin-barrier-2nm 里、本路线不重复；浆 2 kg/层 × 8 = 16 kg；水是冲洗。CMP 浆的质量账在 make/cmp-slurry-lowdishing 里恰好平。',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 二、8 nm SoC：路线已建，在 `data/machine/euv-hina.ts`。
  //
  // `make/soc-8nm-damascene` 产出 `std/soc-8nm-general`：
  //   produces: node 8–10、layers 15–20
  //   uses: mat/device-wafer（need node ≤10）、mat/damascene-layer
  //         （need lineWidth ≤30、AR ≥2、dishing ≤5、barrier ≤2、
  //          k ≤2.5、layers ≥12）、mat/si3n4-lpcvd（电子级钝化）、水
  // 前半条：`make/device-wafer-oct`（8 重成像）→
  //         `make/beol-30nm-15layer`（15–20 层 30 nm 后道）。
  //
  // 剩下的缺口（可溯源套刻量具、pellicle/修版、C-V/I-V/高速测试）见文件头
  // 第二节⑦；**不再写「这一层造不出」**。
  // ═════════════════════════════════════════════════════════════════════════
];

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...CHIP_NODE_ROUTES];
