/**
 * PAG 的活化剂 —— 让 `mat/pag-triphenylsulfonium-otf` 有一条**能当配方的**产出路线。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、为什么要有这一份文件
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `pag.ts` 里的 `make/resist-pag` 是一条**净式**路线：Ph₂S + PhH + TfOH + ½O₂ → PAG + H₂O。
 * 它把物料流与设备立住了，但**活化剂是空的**（那一步在 `pag.ts` 缺口⑤里明写着
 * "PhI(OAc)₂ / 过硫酸盐 / 电解氧化 / Pummerer —— 4 条路 0 条落地"）。
 * 净式不是配方：它说不清"第三个苯基是怎么装上去的"。
 *
 * 本文件用 **Pummerer / Tf₂O** 那条把它补成配方，选它的理由很硬：
 *
 *   ① 碘路（PhI(OAc)₂）要**碘**（`mat/iodine` 全表 0 条，`implant.ts:314–316` 那句
 *      "火星没有海藻也没有硝石"就是这一格）；
 *   ② 过硫酸盐路要过硫酸钠（`mat/polymerization-initiator` 已有 `make/initiator` 路线，`ores.ts:420`）；
 *   ③ 电解氧化要分隔槽与离子膜（本层电解槽是无膜的单槽，`process.ts:339–349`）；
 *   ④ **Tf₂O 路只要三样：二苯亚砜、苯、三氟甲磺酸酐** —— 前两样在本文件里现做，
 *      第三样从 `mat/triflic-acid`（`pag.ts`）脱水来。**三样都落得下地。**
 *
 * 净反应（这一条**有真实机理**，不是凑的）：
 *
 *   Ph₂SO + Tf₂O → [Ph₂S⁺–OTf] + TfO⁻        （亚砜被活化，Pummerer 型）
 *   [Ph₂S⁺–OTf] + C₆H₆ → Ph₃S⁺–OTf⁻ + TfOH   （苯环进攻硫）
 *   ─────────────────────────────────────────────────────────
 *   **Ph₂SO + PhH + Tf₂O → Ph₃S⁺ OTf⁻ + CF₃SO₃H**
 *   202.27 + 78.11 + 282.13 = 412.45 + 150.08 = 562.53 ✓（C₂₀H₁₆F₆O₆S₃ 两边一样）
 *
 * ⇒ 每 kg PAG 出 **0.364 kg TfOH** —— 它**回 `make/triflic-anhydride` 的进料**
 * （TfOH → Tf₂O），于是三氟甲磺酸这一族在环里转，PAG 的净消耗只是"苯 + 硫 + 磷 + 氧"。
 * 这一笔在 §四的账里单列（回收率**没算**，见缺口⑤）。
 *
 * ⚠️ **净式路线不接线**：`pag.ts` 的净式路线留在 `PAG_BLOCKED_ROUTE` 里（不导出），
 * 本文件的 `make/resist-pag-pummerer` 是**唯一接线的 PAG 生产者** —— 没有两个生产者，
 * 也没有“撤净式”的改动。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、`make/diphenyl-sulfoxide`：Ph₂S + H₂O₂ → Ph₂SO + H₂O
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   186.27 + 34.02 = 202.27 + 18.02 = 220.29 ✓
 *
 * 用的就是本层新做的 `mat/hydrogen-peroxide`（3–5 wt%）。**稀释水必须进账**，
 * 这是这条路线最容易被漏掉的一笔：
 *
 *   每 kg 亚砜只要 **168 g 的 100 % H₂O₂**，而 5 wt% 的双氧水要 **3364 g** ——
 *   其中 **3196 g 是水**。这 3196 g 水比产品本身重 3 倍，它随母液走、本层没有回收路线。
 *
 * ⇒ 这一条按 5 wt% 写（窗口的上沿，水最少）；若只有 3 wt%，溶液量涨到 **5.6 kg/kg**，
 *   多出来的 2.2 kg 全是水（R8 第 4 行）。
 *
 * ⚠️ 选择性：H₂O₂ 过量会把亚砜继续氧化成**砜**（Ph₂SO₂），砜不再被 Tf₂O 活化 ——
 *   所以"停在哪"决定整条链的收率。本层没有在线氧化还原电位、也没有色谱，
 *   只能按投料比记账（缺口①）。工业上靠**催化剂**（钨酸钠/钛硅分子筛）把选择性拉满，
 *   而这两样本层都没有。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、`make/phosphorus-pentoxide`：P₄ + 5 O₂ → P₄O₁₀
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   123.90 + 160.00 = 283.89 ✓（`mat/phosphorus` 就是黄磷 P₄，`dopant.ts:56`）
 *
 * 燃烧段 **300–500 °C**，产物在 **100–200 °C** 的冷面上凝成固体（P₄O₁₀ 在 360 °C 升华）。
 *
 * ⚠️ **不能用 `plant/roaster`**：它的下限是 **850 °C**（`refining.ts:486`），
 *   而 P₄O₁₀ 在 360 °C 就升华、在更高温上对石英与钢都是灾难。所以燃烧与冷凝
 *   都落在 `plant/acid-plant`（20–500 °C / 100–500 kPa）—— 它本来就是
 *   "蒸馏、吸收、冷凝"那台（`chemical.ts:252–268`）。
 *
 * ⚠️ **吸潮是这条路线的主要敌人**：P₄O₁₀ + H₂O → 2 HPO₃ → H₃PO₄，一旦吸潮就
 *   失去脱水能力、还会把水带进 Tf₂O 那一步（Tf₂O 遇水立刻水解成 TfOH）。
 *   本层**没有手套箱、没有露点在线**（`plant/dew-point-meter` 只到 −60 °C 的工艺气），
 *   所以只能靠"现做现用、密闭出料"（缺口③）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、`make/triflic-anhydride`：2 CF₃SO₃H + P₂O₅ → (CF₃SO₂)₂O + 2 HPO₃
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   2×150.08 + 141.94 = 282.13 + 2×79.98 = 442.10 ✓
 *
 * P₂O₅ 在这里既是**脱水剂**又是**试剂**：它把两分子酸的"水"抽走，自己变成偏磷酸
 * （HPO₃，M 79.98）。所以每 kg 酸酐要 **503 g P₂O₅**、出 **567 g HPO₃**（没有条目）。
 *
 * 80–120 °C 反应、**80–100 °C / 100–200 kPa 蒸出酸酐**（Tf₂O bp 82 °C）——
 * 两步都在 `plant/acid-plant` 的窗口里。⚠️ 蒸馏要**全干**：塔顶有一点水，
 * 酸酐就在冷凝器里变回酸（缺口②）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、`make/resist-pag-pummerer`：Ph₂SO + PhH + Tf₂O → PAG + TfOH
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   亚砜 490.4 + 苯 189.4 + 酸酐 684.1 → PAG 1000 + TfOH 363.9（kg/kg PAG）
 *   进 1363.9 = 出 1363.9 ✓（TfOH 不进产品账，回环，见 §四末）
 *
 * 20–60 °C / 100–300 kPa（`plant/acid-plant`），苯既当试剂又当溶剂（过量 1.5–2 倍，
 * 蒸回）。后处理：水相淬灭 → 结晶 → 过滤（`plant/wet-bench`）→ **100–120 °C 干燥**
 * （`plant/resistance-furnace`，上限由 PAG 的 Td >180 °C 留 60 K 余量）。
 *
 * ⚠️ 淬灭那一步是这条路线**最险**的地方：未反应的 Tf₂O 遇水剧烈水解（放热 + 放 TfOH），
 * 所以淬灭要**慢加、冷加**，而且水解出来的 TfOH 全进了水相（回收率见缺口⑤）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、质量账（每 1 kg 产品，按原子量、100 % 收率）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * | 产品 | 进 | 出 | 差 |
 * |---|---|---|---|
 * | Ph₂SO 1 kg | Ph₂S 921 + 5 wt% 双氧水 3364（H₂O₂ 168 + 水 3196） = **4285** | 亚砜 1000 | **3285 = 反应水 89 + 稀释水 3196**（无条目、未回收） |
 * | P₄O₁₀ 1 kg | 磷 436 + 氧 564 = **1000** | P₄O₁₀ 1000 | **0（闭合）** |
 * | Tf₂O 1 kg | 酸 1064 + P₂O₅ 503 = **1567** | 酸酐 1000 | **567 = HPO₃**（无条目） |
 * | PAG 1 kg | 亚砜 490.4 + 苯 189.4 + 酸酐 684.1 = **1363.9** | PAG 1000 | **363.9 = TfOH**（回 `make/triflic-anhydride`，不进出口账） |
 *
 * 只有 P₄O₁₀ 那一条是真闭合的；其余三条的差**都点名到具体物质**，没有"余量"糊过去。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、R8 —— PAG 的规格与这条路的五处缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * | 格 | 判据（`car-resist.ts:424–425`） | 本文件交付 | 说明 |
 * |---|---|---|---|
 * | dose | 10–40 mJ/cm² | **10–40** | **声明值** —— 感光度量具 0（曝光矩阵 + 膜厚仪），与 `car-resist.ts` 每一支胶同一种写法 |
 * | thermalDecomposition | >180 °C | **180–220** | **声明值** —— TGA 0 台；干燥窗口（≤120 °C）按它留 60 K |
 *
 * | # | 缺口 | 现状 | 差多少 |
 * |---|---|---|---|
 * | ① | **Pummerer 的收率与选择性** | 按 100 % 记账 | 未知/待查：亚砜过氧化成砜（副反应）与 Tf₂O 水解（淬灭）两条各吃掉多少，本层无出处；各掉 20 % 料涨 1.25 倍 |
 * | ② | **Tf₂O 水解** | 蒸馏与淬灭都在"全干"假设下 | 酸酐遇水即回酸：塔顶 0.1 % 水就够把一批酸酐的 5–10 % 打回酸（**估**）；淬灭段的局部过热还会放 TfOH 雾 |
 * | ③ | **P₂O₅ 吸潮** | 现做现用、密闭出料 | 吸潮 1 wt% 就少 1 wt% 的脱水当量；本层**没有手套箱**、没有箱内露点 ⇒ 只能按投料记账 |
 * | ④ | **H₂O₂ 的稀释水** | 5 wt% 时 3.2 kg 水/kg 亚砜 | 3 wt% 时 5.6 kg/kg（多 2.2 kg 水）；本层没有浓缩双氧水的路线（真空浓缩会分解，`hydrogen-peroxide.ts` R8① 同一句） |
 * | ⑤ | **TfOH 回收率** | 0.364 kg/kg 按 100 % 回环 | 实际淬灭后在水相里是 70–90 % 的酸，回 `make/triflic-anhydride` 前要**先脱水**（多耗 P₂O₅）—— 这一笔**没有算**，是本文件账上唯一的"未来债" |
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 七、已知缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① 亚砜氧化的**选择性无量具**（没有 ORP、没有色谱），只能按投料比记；
 *  ② Tf₂O 的**水分**没有在线量具（同型）；
 *  ③ P₂O₅ 的**吸潮**没有箱内露点 ⇒ 脱水当量按投料记账；
 *  ④ H₂O₂ 稀释水 3.2 kg/kg 亚砜，无回收；
 *  ⑤ TfOH 回收率与脱水那一笔没算；
 *  ⑥ **没有真空干燥器**：Ph₂SO 的 mp 70.5 °C，所以"干燥"写成 100–120 °C 的**熔融干燥**
 *     （借电阻炉），不是真空干燥 —— 这一处是"借设备"，不是"有设备"；
 *  ⑦ **同一个产品有两条产出路线**（`pag.ts` 的净式 + 本文件的 Pummerer）。
 *     接进 `tools/report.ts` 后应撤掉净式那条（改 `pag.ts`，不在本次权限内）；
 *  ⑧ **本文件还没接进 `tools/report.ts`**，所以上面这些路线暂时不进汇总，
 *     PAG 在报告里仍只有净式那一个生产者。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PAG_ACTIVATOR_ITEMS: readonly Item[] = [
  /**
   * 二苯亚砜（Ph₂SO，C₁₂H₁₀OS，M 202.27）。白色固体，**mp 70.5 °C**，bp 340 °C（分解）。
   *
   * 它是 Pummerer 那一步的**硫中心**：氧把硫活化成"可被 Tf₂O 拉走"的形态，
   * 三个苯基里的两个还留在硫上。没有它，Ph₂S + Tf₂O 不反应（硫醚的亲核性不够）。
   *
   *   purity        95–99 %（杂质主要是砜 Ph₂SO₂ 与未反应的硫醚 —— 砜是**死料**，
   *                 它不再被 Tf₂O 活化，所以这一格直接决定下一步收率）
   *   waterContent  0.1–0.5 %（水会把 Tf₂O 水解掉，见 `make/resist-pag-pummerer`）
   */
  {
    id: 'mat/diphenyl-sulfoxide',
    name: '二苯亚砜',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'waterContent', kind: 'range', min: 0, max: 2, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 五氧化二磷（P₄O₁₀，M 283.89；习惯写成 P₂O₅，M 141.94 —— **本层的账按 P₄O₁₀ 分子算**）。
   *
   * 白色粉末，360 °C 升华，**最强的常用脱水剂之一**：它把两分子三氟甲磺酸的"水"
   * 抽成偏磷酸，自己变成 HPO₃。
   *
   *   purity        95–99 %（杂质是 HPO₃/H₃PO₄ —— 吸潮产物，直接冲掉脱水当量）
   *   waterContent  0–0.5 %（**这一格是它的全部价值**：含水的 P₂O₅ 不是脱水剂）
   */
  {
    id: 'mat/phosphorus-pentoxide',
    name: '五氧化二磷',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'waterContent', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 三氟甲磺酸酐（Tf₂O，(CF₃SO₂)₂O，C₂F₆O₅S₂，M 282.13）。无色液体，bp 82 °C。
   *
   * **它是 Pummerer 那一步的活化剂**：把亚砜的氧拉走、生成"锍-三氟甲磺酸盐"中间体，
   * 苯才有东西可进攻。
   *
   *   purity        90–99 %（杂质是 TfOH —— 水解产物，会把下一步的酸度顶高）
   *   waterContent  0–0.2 %（**0.2 % 是硬线**：Tf₂O + H₂O → 2 TfOH，放热且不可逆）
   */
  {
    id: 'mat/triflic-anhydride',
    name: '三氟甲磺酸酐',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'waterContent', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
    ],
  },
];

export const PAG_ACTIVATOR_ROUTES: readonly Route[] = [
  {
    /**
     * **二苯亚砜：Ph₂S + H₂O₂ → Ph₂SO + H₂O，20–60 °C。**
     *
     *   二苯硫醚 921 + 5 wt% 双氧水 3364（H₂O₂ 168 + 水 3196）→ 亚砜 1000
     *   进 4285 = 出 1000 + 水 3285（反应水 89 + 稀释水 3196）
     *
     * 三道工序：① 氧化（酸厂，20–60 °C / 100–300 kPa）② 结晶与过滤（湿法槽）
     * ③ 熔融干燥 100–120 °C（电阻炉；mp 70.5 °C ⇒ 是熔融干燥，不是真空干燥，缺口⑥）。
     *
     * ⚠️ 选择性：过量 H₂O₂ 把亚砜继续氧化成砜，砜是**死料**（Tf₂O 活化不了它）。
     * 工业靠钨酸钠/钛硅分子筛催化，本层两样都没有 ⇒ 只能按投料比卡（缺口①）。
     */
    id: 'make/diphenyl-sulfoxide',
    name: '二苯亚砜制备',
    produces: [
      {
        item: 'mat/diphenyl-sulfoxide',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 95, max: 99 },
          { param: 'waterContent', kind: 'range', min: 0.1, max: 0.5 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/diphenyl-sulfide',
            qty: q(921),
            need: [{ param: 'purity', kind: 'range', min: 95, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            // 3–5 wt% 的双氧水：按 5 wt% 计，3364 g 溶液里只有 168 g 是 H₂O₂
            item: 'mat/hydrogen-peroxide',
            qty: q(3364),
            need: [{ param: 'concentration', kind: 'range', min: 3, max: 5 }],
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: [],
    steps: [
      {
        note_zh:
          '① 氧化：Ph₂S + H₂O₂ → Ph₂SO + H₂O，**20–60 °C / 100–300 kPa**。硫醚不溶于水，靠苯/醇类共溶剂与搅拌；H₂O₂ 按 1.0–1.1 当量慢加，加完继续 1–2 h 把残余双氧水耗尽（否则下一步会把 Tf₂O 水解）',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '② 结晶与过滤：亚砜 mp 70.5 °C，冷却到 0–20 °C 结晶（湿法槽的下限是 20 °C，只能到 20 °C），过滤；母液里那 3.2 kg 水/kg 产品随废液走（本层没有回收路线，缺口④）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '③ 熔融干燥 100–120 °C（电阻炉）：mp 70.5 °C ⇒ 产物在干燥温度上已经是液体，水被干气带走。**这不是真空干燥**（本层没有真空干燥器），所以水只到 0.1–0.5 %',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 120 }],
      },
    ],
    unbalanced_zh:
      '进 二苯硫醚 921 + 5 wt% 双氧水 3364（其中 H₂O₂ 168、水 3196） = 4285；出 亚砜 1000。差 3285 全是水：反应水 89（Ph₂S + H₂O₂ → Ph₂SO + H₂O）+ 稀释水 3196（3–5 wt% 双氧水带进来的）。水没有回收路线、也没有条目可出口，所以按不平衡声明 —— 这是这条路线的主要物流，比产品重 3 倍。3 wt% 的双氧水时溶液量涨到 5.6 kg/kg，差额全是水',
  },

  {
    /**
     * **五氧化二磷：P₄ + 5 O₂ → P₄O₁₀，300–500 °C 燃烧、100–200 °C 冷凝。**
     *
     *   磷 436 + 氧 564 → P₄O₁₀ 1000   进 1000 = 出 1000 ✓（本文件唯一真闭合的一条）
     *
     * 为什么不用 `plant/roaster`：它的下限 850 °C（`refining.ts:486`），而 P₄O₁₀
     * 在 360 °C 就升华。燃烧与冷凝都借 `plant/acid-plant`（20–500 °C / 100–500 kPa）。
     *
     * ⚠️ 产物吸潮即失效（P₄O₁₀ + H₂O → 2 HPO₃），所以出料要密闭、现做现用（缺口③）。
     */
    id: 'make/phosphorus-pentoxide',
    name: '五氧化二磷制备',
    produces: [
      {
        item: 'mat/phosphorus-pentoxide',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 95, max: 99 },
          { param: 'waterContent', kind: 'range', min: 0, max: 0.5 },
        ],
      },
    ],
    uses: [
      // 黄磷就是 P₄（dopant.ts:56）；按 P₄ + 5 O₂ 的计量，436 g 磷出 1 kg 酸酐
      { anyOf: [{ item: 'mat/phosphorus', qty: q(436) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(564) }] },
    ],
    needs: ['plant/mfc'],
    steps: [
      {
        note_zh:
          '① 燃烧：P₄ + 5 O₂ → P₄O₁₀，**300–500 °C / 100–300 kPa**，过量干氧（氧要过量 20 % 以上，否则黄磷蒸气进尾气）。黄磷自燃，所以是"投料即着火"，不需要点火器 —— 难的是**灭火**（紧急氮气置换）',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 300, max: 500 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '② 冷凝与密闭出料：**100–200 °C** 的冷面上凝成固体（P₄O₁₀ 360 °C 升华），刮下、密闭装瓶。这一步的水分控制就是产品的纯度（缺口③）',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 100, max: 200 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
    ],
  },

  {
    /**
     * **三氟甲磺酸酐：2 CF₃SO₃H + P₂O₅ → (CF₃SO₂)₂O + 2 HPO₃，80–120 °C。**
     *
     *   酸 1064 + P₂O₅ 503 → 酸酐 1000 + HPO₃ 567
     *   进 1567 = 出 1000 + 567 ✓（HPO₃ 没有条目 ⇒ 声明在 unbalanced_zh）
     *
     * P₂O₅ 既是脱水剂又是试剂：把两分子酸的"水"抽成偏磷酸。
     * 蒸出 80–100 °C / 100–200 kPa（Tf₂O bp 82 °C），两步都在酸厂的窗口里。
     *
     * ⚠️ 全干：塔顶或接收瓶有一点水，酸酐就在冷凝器里变回酸（缺口②）。
     */
    id: 'make/triflic-anhydride',
    name: '三氟甲磺酸酐制备',
    produces: [
      {
        item: 'mat/triflic-anhydride',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 90, max: 99 },
          { param: 'waterContent', kind: 'range', min: 0, max: 0.2 },
        ],
      },
      {
        item: 'mat/metaphosphoric-acid',
        qty: q(567),
        gives: [
          { param: 'purity', kind: 'range', min: 85, max: 92 },
          { param: 'form', kind: 'enum', oneOf: ['glass'] },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            // 按 100 % 酸计（与 nitric.ts 的"按 100 % 计"同一个口径）
            item: 'mat/triflic-acid',
            qty: q(1064),
            need: [{ param: 'concentration', kind: 'range', min: 95, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/phosphorus-pentoxide',
            qty: q(503),
            // 吸潮的 P₂O₅ 不是脱水剂：水 ≤0.5 % 是它的全部价值
            need: [{ param: 'waterContent', kind: 'range', max: 0.5, dir: 'atMost' }],
            onRelax: 'functional-lost',
          },
        ],
      },
    ],
    needs: [],
    steps: [
      {
        note_zh:
          '① 脱水：2 CF₃SO₃H + P₂O₅ → (CF₃SO₂)₂O + 2 HPO₃，**80–120 °C / 100–200 kPa**，P₂O₅ 过量 20–30 %（它同时吸水与反应）。加料要慢：这是放热的水合反应，局部过热会把酸酐蒸走',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 80, max: 120 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
      {
        note_zh:
          '② 蒸馏：**80–100 °C / 100–200 kPa** 蒸出酸酐（bp 82 °C），接收瓶要干燥 + 氮封。残渣是 HPO₃（567 kg/t，没有条目）。水分是这一步唯一的敌人（缺口②）',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 80, max: 100 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
    ],
    unbalanced_zh:
      '进 三氟甲磺酸 1064 + 五氧化二磷 503 = 1567；出 酸酐 1000 + 偏磷酸 567（已单列 mat/metaphosphoric-acid，可回磷链）= 1567，平。P₂O₅ 按 1.0 当量配平；实际要过量 20–30 %（吸潮与副反应），那一份也进偏磷酸',
  },

  {
    /**
     * **PAG（Pummerer/Tf₂O 路）：Ph₂SO + PhH + Tf₂O → Ph₃S⁺ OTf⁻ + TfOH，20–60 °C。**
     *
     *   亚砜 490.4 + 苯 189.4 + 酸酐 684.1 → PAG 1000 + TfOH 363.9
     *   进 1363.9 = 出 1000 + 363.9 ✓（TfOH 回环，不进产品账）
     *
     * 机理：Tf₂O 把亚砜的氧拉走 → [Ph₂S⁺–OTf] → 苯进攻硫 → 锍盐 + TfOH。
     * **这是真配方**，不是 `pag.ts` 那条净式。
     *
     * 三道工序：① 反应（酸厂 20–60 °C / 100–300 kPa）② 淬灭、结晶与过滤（湿法槽）
     * ③ 干燥 100–120 °C（电阻炉，上限由 Td >180 °C 留 60 K）。
     *
     * ⚠️ 淬灭要慢、要冷：未反应的 Tf₂O 遇水剧烈水解（缺口②）。
     */
    id: 'make/resist-pag-pummerer',
    name: '三苯基锍三氟甲磺酸盐制备',
    produces: [
      {
        item: 'mat/pag-triphenylsulfonium-otf',
        qty: q(1000),
        gives: [
          // 3–5 wt% 添加量下把 200 nm 膜显透（car-resist.ts:424）
          { param: 'dose', kind: 'range', min: 10, max: 40 },
          // 要扛 PEB 与 150 °C 烘胶（car-resist.ts:425）
          { param: 'thermalDecomposition', kind: 'range', min: 180, max: 220 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/diphenyl-sulfoxide',
            qty: q(4904, 10), // 490.4 kg：202.27/412.45
            need: [{ param: 'purity', kind: 'range', min: 95, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      // 苯：既是试剂又是溶剂（过量 1.5–2 倍，蒸回）。这里记的是**反应掉的**那一份
      { anyOf: [{ item: 'mat/benzene', qty: q(1894, 10) }] },
      {
        anyOf: [
          {
            item: 'mat/triflic-anhydride',
            qty: q(6841, 10), // 684.1 kg：282.13/412.45
            // 水解的酸酐会把酸度顶高、把锍盐重新打开 —— 水 ≤0.2 % 是硬线
            need: [{ param: 'waterContent', kind: 'range', max: 0.2, dir: 'atMost' }],
            onRelax: 'functional-lost',
          },
        ],
      },
    ],
    needs: ['plant/mfc'],
    steps: [
      {
        note_zh:
          '① 反应：Ph₂SO + PhH + Tf₂O → Ph₃S⁺OTf⁻ + TfOH，**20–60 °C / 100–300 kPa**。Tf₂O 慢加（放热），苯过量 1.5–2 倍当溶剂；加完 1–2 h 保温。苯要回收（蒸馏），否则它进废液',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '② 淬灭、结晶与过滤：**慢加、冷加**水（未反应的 Tf₂O 剧烈水解），锍盐留在水相；浓缩后冷却结晶、过滤，母液含 TfOH（0.364 kg/kg）与苯。湿法槽下限 20 °C，所以淬灭与结晶都在 20–40 °C 做',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '③ 干燥：**100–120 °C**，到水 <0.5 %。上限由 PAG 的 Td >180 °C 定（留 60 K 余量）；干燥不足的水会水解锍盐、放出 TfOH，胶的感光度跟着漂',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 120 }],
      },
    ],
    unbalanced_zh:
      '进 亚砜 490.4 + 苯 189.4 + 酸酐 684.1 = 1363.9；出 PAG 1000。差 363.9 是三氟甲磺酸（TfOH）：Pummerer 每装一个苯基就放一分子酸（1:1 摩尔），它**回 `make/triflic-anhydride` 的进料**、不进出口账。⚠️ 回环按 100 % 收率记：实际淬灭后 TfOH 在水相里是 70–90 % 的酸，回用前要先脱水（多耗 P₂O₅），这一笔没算（文件头缺口⑤）',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PAG_ACTIVATOR_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PAG_ACTIVATOR_ROUTES];
