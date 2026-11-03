/**
 * ALD 铜 —— `cu-seed.ts` R8 ② 缺的那一条路线。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、本文件不新增条目，只补一条路线
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 产出复用 `mat/cu-seed-wafer`（`cu-seed.ts:290`），前驱体用 `mat/cu-hfac2`
 * （`c3-chain.ts:670`，路线 `c3-chain.ts:1859`），两件都已在表上。
 *
 * `c3-chain.ts:429–430` 把这一格留给了别人：「接进 `cu-seed.ts` 的 ALD 那一格是两行
 * （`make/cu-ald-hfac` 的 `uses` 加 `mat/cu-hfac2`），由主 agent 做」。
 * 本文件就是那两行的落地版 —— 但它不是"两行"，是一条完整的路线（工序、窗口、账）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、它补的是哪一格：`cu-seed.ts` R8 ②
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `cu-seed.ts:215` 的原话：
 *
 *   「② ALD Cu **1/3 前驱体**（只有 Cu(hfac)₂ 有了）……**已建：`mat/cu-hfac2`
 *    （c3-chain.ts:670）+ `make/cu-hfac2`（c3-chain.ts:1859）**，purity 95–99.5 %、
 *    水 0.1–0.5 %……**但 ALD Cu 的 `make/cu-ald-hfac` 全表 0 条**（所以 mat/cu-hfac2
 *    在报告里"没人吃"），Cu(dmap)₂ 与 Cu(acac)₂ 仍 0/2；覆盖差 1.4 倍、温度差 100–200 K
 *    | 整条链还差 2 件前驱体 + 1 条 ALD 路线」
 *
 * ⇒ 本文件交的是那"**1 条 ALD 路线**"。**"2 件前驱体"仍然缺**（Cu(dmap)₂ / Cu(acac)₂
 * 全表 0 条），所以 R8 ② 不会因为本文件而关闭，只从"1 条路线 + 2 件料"缩到"2 件料"。
 *
 * 为什么这条路线值得先写：**它把籽晶的两格同时解开** ——
 *
 *   `fieldThickness` 15–30 nm → **5–12 nm**（CMP 要磨掉的量少 2–3 倍，dishing 跟着降）
 *   `sidewall/bottom` 65–85 % / 50–70 % → **95–100 % / 95–100 %**（AR 2 的沟底不再是短板）
 *
 * 这两格是 `cu-seed.ts` 六格里唯一"换工艺就能到、不用换料"的两格。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、化学：为什么 Cu(hfac)₂ 能用，而它的水合物是敌人
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   配位饱和的 β-二酮盐（Cu(hfac)₂，M = 477.64）在 60–80 °C / 10–100 Pa 上**升华**
 *   （`c3-chain.ts:662` 记的就是这条：升华温度正好落在 ALD 腔的 10–100 Pa 里，
 *   这是它被选作铜源的唯一理由）。
 *
 *   ALD 循环两步（自限制）：
 *
 *     ① Cu(hfac)₂(g) → 表面饱和吸附（一个周期一层，**GPC 0.02–0.05 nm**，文献值）
 *     ② H₂ 等离子体还原：Cu(hfac)₂* + H₂ → Cu + 2 Hhfac↑（Hhfac = C₅H₂F₆O₂，M 208.06）
 *
 *   总反应（按沉积出来的铜算）：
 *
 *     **Cu(hfac)₂ + H₂ → Cu + 2 Hhfac**     477.64 + 2.016 = 63.546 + 2×208.057 ✓
 *
 *   所以 1 kg Cu 要 Cu(hfac)₂ **7.516 kg**、H₂ **0.032 kg**，副产 Hhfac 6.548 kg。
 *
 * ── 水是这条路线的命门，而且它比 CVD 那条更毒 ─────────────────────────────
 *
 *   `mat/cu-hfac2` 的规格是 **水 0.1–0.5 %**（它从水溶液里结晶出来，是二水合物，
 *   `c3-chain.ts:1854–1857` 要求真空干燥到 <0.5 %）。这点水在 200 °C 的腔里做两件事：
 *
 *     ① 把铜氧化成 Cu₂O —— ρ 是铜的 1e6 倍（`c3-chain.ts:1857`：一批 25 片的方阻直接翻倍）
 *     ② 把 hfac 的氟解放成 **HF** —— 腐蚀腔壁与下游、并带走铜
 *
 *   1 g 前驱体带 1–5 mg 水；按 1 mol H₂O 放 2 mol HF 的计量**上限**，就是 **2–11 mg HF**。
 *   这个数**没有量具能验**（见缺口①），所以它只在这里记一笔，**不新造 `fluorine` 属性**
 *   —— 那会是同一件事的第二处真相。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、设备与窗口 —— 逐台对 holds
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `plant/ald-reactor`   **150–400 °C / 10–100 Pa**（`ald.ts:546–549`）
 *                         本路线 **160–260 °C**（`cu-seed.ts:215` 给 ALD Cu 的目标窗）
 *                         与 10–100 Pa 都落在里面 ⇒ **沉积与等离子体两步都由它执行**
 *   `plant/rf-13m56`      **没有 holds**（只有 frequency 5–30 MHz、power ≤2 kW 两个 props，
 *                         `flow-and-rf.ts:507–514`）⇒ 它**当不了任何一步的执行者**，
 *                         只能作为"射频源在场"进 `needs`。**[缺口②]**
 *   `plant/mfc`           三路气（H₂ / N₂ / Ar）的计量；Cu(hfac)₂ 那一路是源温控，不用 MFC
 *   `plant/clean-room` · `plant/metrology-room` · `plant/water-polisher`   与 `make/cu-seed-cvd` 同一组前提
 *
 * ⚠️ **源瓶的 60–80 °C 写不进 `under`。** 它落在 `plant/ald-reactor/source-cell` 的
 * 20–260 °C 上（`ald.ts:397`），而 **source-cell 是零件、不是设备** —— 模型的条件判定
 * 只认整机的 `holds`，而整机是 150–400 °C。所以 60–80 只能写在工序注释里。**[缺口④]**
 *
 * 周期数与节拍：GPC 0.02–0.05 nm/周期 ⇒ 5–12 nm 要 **100–600 周期**；按常用的
 * 0.04–0.05 一档是 **150–300 周期**。周期 13–20 s（固态源脉冲比 TiCl₄ 长，
 * `ald.ts:§3.3` 同一笔账）⇒ 纯循环 1–1.7 h，加抽空/升温/降温/装卸 2.5 h ⇒ **4 h/25 片**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、质量账（25 片，一场 10 nm）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   铜：25 × 78.5 cm² × 10 nm × 8.96 g/cm³ = **17.6 mg**（1.76×10⁻⁵ kg）
 *
 *   化学计量（100 % 利用率）：Cu(hfac)₂ **0.13 g** + H₂ **0.56 mg** → Cu 17.6 mg + Hhfac 0.12 g
 *   账面取：Cu(hfac)₂ **1 g**（q(1,1000)）、H₂ **0.5 g**（q(1,2000)）
 *
 *   1 g 对应 **7.6 % 的利用率**（10 % 要 1.3 g）—— 取 1 g 是"投料 + 壁损 + 尾气"的中间值；
 *   H₂ 的 0.5 g 是化学计量的 **900 倍**，但它不是"反应掉的"，是**脉冲载气与置换**
 *   （300 周期 × 1 s × 100 sccm ≈ 0.05 g，余下是升降温置换与管壁）。
 *
 *   副产：**2 Hhfac ≈ 0.12 g**（按沉积铜 100 % 转化算，实际随尾气走、未登条目）；
 *         **HF 2–11 mg**（前驱体带水 1–5 mg 的计量上限）；**吹扫气 N₂/Ar 各 5 g**
 *         随尾气排走（按 200 sccm × 5 s × 600 次应为 ~12 g，账面只记腔体置换那一份）。
 *
 *   产物是 **25 片**（`unit: 片`），质量守恒那一条校验不参与 —— 但账还是要写清，
 *   所以 `unbalanced_zh` 里逐项列着。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、R8 —— 与 `make/cu-seed-cvd` 逐格比（同 25 片、同一批阻挡片）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * | 格 | `make/cu-seed-cvd`（现在） | 本路线（ALD Cu） | 差 |
 * |---|---|---|---|
 * | fieldThickness | 15–30 nm | **5–12 nm** | 2–3×（CMP 少磨 2–3 倍） |
 * | sidewallCoverage | 65–85 % | **95–100 %** | 1.2–1.5× |
 * | bottomCoverage | 50–70 % | **95–100 %** | 1.4–2× |
 * | chlorineContent | 0.2–0.5 at% | **0–0.05 at%** | 4–10×（hfac 路线不带氯，带的是氟） |
 * | 节拍 | 4 h/25 片 | 4 h/25 片 | 1×（GPC 慢，但薄 3 倍，两者抵掉） |
 * | resistivity | 2.5–4 µΩ·cm | **3–9 µΩ·cm** | **1.2–3.6×（更差）**（按 `cu-seed.ts:281` 的 5–12 nm 尺寸效应；⚠️ 见缺口⑤） |
 *
 * **代价三条，都要写清：**
 *
 *   ① **GPC 0.02–0.05 nm/周期** ⇒ 5 nm 要 100–250 周期、12 nm 要 240–600 周期。
 *      这不是"慢"，是"**自限制**"：膜厚由周期数定、不由时间定（±0.1 % 的周期数
 *      对 ±30–100 % 的厚度，`ald.ts:§九⑥` 同一句）。所以它换来的正是那 95–100 %。
 *   ② **前驱体的水会生 HF**（§二）。CVD 那条的敌人是 CuCl 水解成 Cu₂O，这条的敌人
 *      是 hfac 的水合物 —— **两条路线都死在"水"上，但化学不同**：一个放 HCl，一个放 HF。
 *      HF 比 HCl 更坏的地方在于它腐蚀石英（`unblock-hf.ts` 那一整份文件都在讲这件事）。
 *   ③ **F 残留无量具**（缺口①）：SIMS 只有 O₂⁺ 一次束，电负性元素（F、Cl）要 Cs⁺，
 *      而铯现在是一次性输入、没有本地 Cs⁺ 源（`data/material/cs-sb.ts`；
 *      `sims.ts:32–62` 的 D1）。所以 `chlorineContent 0–0.05`
 *      与"F 残留"两格都是**按工艺记账的声明值**，不是量出来的 —— 与 `cu-seed.ts`
 *      把 Cl 0.2–0.5 写成声明值是同一种写法。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、已知缺口（"现在没有"，不是"暂未实现"）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① **F 与 Cl 都没有量具。** `plant/sims` 的 O₂⁺ 一次束只电离电正性元素
 *     （`sims.ts:52–62`：F/Cl/O 要 Cs⁺ 的负离子模式，而 Cs 现在是一次性输入、
 *     没有本地 Cs⁺ 源）。
 *     所以 `chlorineContent` 与 F 残留只能记账 —— 与"没有量具就算未测"同型。
 *  ② **`plant/rf-13m56` 没有 `holds`。** 它是射频源（频率与功率），不维持温度或压力；
 *     等离子体那一步的执行者只能是 `plant/ald-reactor`（它 holds 150–400 °C / 10–100 Pa）。
 *     这一条不是笔误：模型的"条件"必须由设备的能力窗口承担，而 rf 台没有窗口可承担。
 *  ③ **前驱体利用率没有在线量具。** 7.6 % 是账面值；ALD 的 QCM 只能测**平片**上的
 *     每周期质量增量（`ald.ts:§九⑤`：0.1 nm = 1.15 Hz，单周期在噪声底），
 *     所以"1 g 投料"这个数没有闭环。
 *  ④ **源瓶温度写不进条件。** 60–80 °C 在 `plant/ald-reactor/source-cell` 的 20–260 °C 上，
 *     而 source-cell 是零件 ⇒ 模型的条件判定不认它（§三）。
 *  ⑤ **`resistivity` 已按 `cu-seed.ts:281–287` 的尺寸效应改成 3–9 µΩ·cm。**
 *     那里写的是"5 nm 是体铜的 5–10 倍、20 nm 是 1.5–2 倍"；按它的 Fuchs–Sondheimer
 *     口径，5–12 nm 的膜是 **3–9**，不是 2–3（2–3 是场厚/20 nm 那一档的数，不能混）。
 *     代价要认：**比 CVD 的 2.5–4 差 1.2–3.6×** —— ALD 用保形性换了电阻率。
 *  ⑥ **本文件还没接进 `tools/report.ts`**（与 `hydrogen-peroxide.ts` 同一次任务的约束），
 *     所以 `mat/cu-hfac2` 的"没人吃"在报告里**暂时不会消失** —— 接线只差一行 import
 *     与两处展开。接上之后它才真正有消费者。
 *  ⑦ **"2 件前驱体"仍然缺**：Cu(dmap)₂（工业 ALD Cu 的主力）与 Cu(acac)₂ 全表 0 条。
 *     本路线用的是 hfac 盐 + H₂ 等离子体，**它是"能走的那一条"，不是"最好的那一条"**
 *     （`cu-seed.ts:215` 把 Cu(dmap)₂ 列在原规格那一栏）。
 */

import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CU_ALD_ROUTES: readonly Route[] = [
  {
    /**
     * **ALD 铜：Cu(hfac)₂ + H₂ 等离子体，160–260 °C、10–100 Pa，5–12 nm。**
     *
     *   进   低 k 阻挡片 25 片 + Cu(hfac)₂ 1 g + 氢 0.5 g + 氮 5 g + 氩 5 g + 水 2 kg
     *   出   铜籽晶片 25 片（场厚 5–12 nm、覆盖 95–100 %、ρ 2.0–3.0、Cl 0–0.05）
     *
     * 账在文件头 §四，这里只留三个数：
     *
     *   铜 17.6 mg（25 × 78.5 cm² × 10 nm × 8.96）
     *   化学计量 Cu(hfac)₂ 0.13 g / H₂ 0.56 mg；账面 1 g / 0.5 g（7.6 % 利用率）
     *   副产 2 Hhfac 0.12 g + HF 2–11 mg（前驱体带水的计量上限）
     *
     * 六道工序，执行者逐段写；条件只写整机能承担的那两个（§三）。
     */
    id: 'make/cu-ald-hfac',
    name: 'Wafer with Copper Seed Layer Manufacturing', name_zh: '长了铜籽晶的片制造',
    produces: [
      {
        item: 'mat/cu-seed-wafer',
        qty: q(25),
        gives: [
          // 5–12 nm：**5 nm 端是这条路线的全部意义**（CVD 那条的连续下限是 15 nm）
          { param: 'fieldThickness', kind: 'range', min: 5, max: 12 },
          // 自限制 ⇒ 沟底 ≈ 场厚（覆盖 95–100 %），所以两者是同一个窗
          { param: 'seedThickness', kind: 'range', min: 5, max: 12 },
          { param: 'sidewallCoverage', kind: 'range', min: 95, max: 100 },
          { param: 'bottomCoverage', kind: 'range', min: 95, max: 100 },
          { param: 'resistivity', kind: 'range', min: 3, max: 9 },
          // hfac 路线不带氯；0–0.05 是"按工艺记账"的声明值（缺口①）
          { param: 'chlorineContent', kind: 'range', min: 0, max: 0.05 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/lowk-barrier-wafer',
            qty: q(25),
            // 与 make/cu-seed-cvd 同一个判据：籽晶要长在**薄**阻挡上，5 nm 的 TiN 把
            // 100 nm 的沟吃到 90.5–91.2 nm，3 nm 只吃到 94.4–94.7（lowk-barrier.ts 问五④）
            need: [{ param: 'barrierThickness', kind: 'range', max: 3.5, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            // 1 g：化学计量 0.13 g 的 7.6 倍 —— 投料 + 壁损 + 尾气（§四）
            item: 'mat/cu-hfac2',
            qty: q(1, 1000),
            // 水 >0.5 % 会在腔里生成 HF 并把铜氧化成 Cu₂O（c3-chain.ts:1854–1857）
            need: [
              { param: 'purity', kind: 'range', min: 95, dir: 'atLeast' },
              { param: 'waterContent', kind: 'range', max: 0.5, dir: 'atMost' },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            // 0.5 g：化学计量 0.56 mg 的 900 倍 —— 脉冲载气 + 升降温置换（不是反应掉的）
            item: 'mat/hydrogen',
            qty: q(1, 2000),
            need: [{ param: 'purity', kind: 'range', min: 99.99, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      // 吹扫：氮 5 g / 氩 5 g（按 200 sccm × 5 s × 600 次应为 ~12 g，账面取腔体置换那一份）
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 200) }] },
      // 水 2 kg：腔体与法兰的冷却（不是工艺水），与 make/cu-seed-cvd 同一笔
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: [
      // 三路气的计量（H₂ / N₂ / Ar）；Cu(hfac)₂ 那一路是源温控，不用 MFC
      'plant/mfc',
      // 射频源：它**没有 holds**，当不了执行者，只能作为在场前提（缺口②）
      'plant/rf-13m56',
      'plant/clean-room',
      'plant/metrology-room',
      'plant/water-polisher',
    ],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① 装片与抽空：25 槽石英舟（ald.ts §3.5 的船），抽到 10 Pa 以下、检漏 —— 没有 load-lock，每批一次全腔抽气（3–4.5 h 的账里这一半是它）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '② Cu(hfac)₂ 升华与脉冲：源瓶 **60–80 °C**（source-cell 的 20–260 °C，零件，写不进 under）、腔 **160–200 °C / 10–100 Pa**，脉冲 3–5 s + 吹扫 5 s；GPC 0.02–0.05 nm/周期 ⇒ 100–600 周期',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 160, max: 200 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '③ H₂ 等离子体还原（rf-13m56 经匹配箱加到 ald-reactor 的喷淋电极）：**160–260 °C / 10–100 Pa**，每半周期 5–20 s。这一步同时把 hfac 配体烧掉、放出 Hhfac 与 HF；**执行者仍是 ald-reactor**（rf 台没有 holds，缺口②）',
        performedBy: 'plant/ald-reactor',
        under: [
          { param: 'temperature', min: 160, max: 260 },
          { param: 'pressure', min: 10, max: 100 },
        ],
      },
      {
        note_zh:
          '④ 降温出片：≤2 K/min（快冷片会翘），350 → 60 °C 要 60–90 min；这一步与升温一起构成"循环只占 10–15 %"（ald.ts §3.4）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '⑤ 量场厚：椭偏读 **5–12 nm**（±0.02 nm）。沟底与侧壁的 95–100 % 是**算的**（自限制 + 覆盖），剖切只能破坏性抽检（plant/fib-tem）',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑥ 量方阻：四探针 —— 12 nm 是 1.7–2.5 Ω/□、5 nm 是 4–6 Ω/□（按 2.0–3.0 µΩ·cm 算，R□ = ρ/t）。**不连续的膜方阻高 1–2 个量级**，所以这一格才是"连续没有"的唯一电学判据（与 cu-seed.ts 第⑦段同一句）',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '25 片 × 78.5 cm² × 10 nm × 8.96 = 铜 17.6 mg；化学计量 Cu(hfac)₂ 0.13 g + H₂ 0.56 mg，账面取 1 g + 0.5 g（前者 7.6 % 利用率、后者是脉冲与置换的 900 倍过量）。副产 2 Hhfac ≈ 0.12 g（随尾气走，未登条目）+ HF 2–11 mg（前驱体带水 1–5 mg 的计量上限，未登条目）；吹扫气 N₂/Ar 各 5 g 随尾气排走（按 200 sccm × 5 s × 600 次应为 ~12 g，账面只记腔体置换那一份）。产物按片计（unit 片），质量守恒那一条校验不参与；水 2 kg 是冷却水、不进膜',
  },
];

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...CU_ALD_ROUTES];
