/**
 * PAG（三苯基锍三氟甲磺酸盐）—— 从"只有条目"推进到"有路线、带缺口"。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、本文件动的是哪一格
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `mat/pag-triphenylsulfonium-otf` 已经存在（`car-resist.ts:428`），**但 0 条路线**。
 * 它自己的注释把缺口切得很准（`car-resist.ts:418–421`）：
 *
 *   「问题四那张表里六件原料**有四件是有的**（苯、硫、氟、以及甲醇），断在两**道工序**上
 *     （S–C 成键、无水 HF 电解）。写成条目之后，"缺 PAG" 变成"缺两件工艺 + 一台槽"」
 *
 * 本文件就是去落那"两件工艺"：
 *
 *   `make/diphenyl-sulfide`   S–C 成键的第一半（苯 + 硫 + AlCl₃）
 *   `make/triflic-acid`       第二半（CH₄/SO₂/Cl₂ 光化学 → ECF → 水解）
 *   `make/resist-pag`         最后一步（二苯硫醚 + 苯 + 三氟甲磺酸 → 锍盐）
 *
 * 新增 **2 个条目**（`mat/diphenyl-sulfide`、`mat/triflic-acid`），在 4 个的上限内。
 * **不新增第三个**：甲磺酰氯是 `make/triflic-acid` 的**段内中间体**，从不出现在
 * `uses` 里 —— 给它立条目只会多一条"只有自己吃"的自环（`unblock-hf.ts:354–357`
 * 对 H₂SiF₆ 的处理同一句话）。
 *
 * ⚠️ 路线分两组：`PAG_ROUTES` 是前两段（二苯硫醚、三氟甲磺酸），接线；
 * `PAG_BLOCKED_ROUTE` 是 `make/resist-pag` 的净式，**故意不接线** —— 它只按 O₂
 * 配平、没有活化剂配方。PAG 的实际产出由 `pag-activator.ts` 的
 * `make/resist-pag-pummerer`（Tf₂O/Pummerer）承担，见下。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、`make/diphenyl-sulfide`：2 C₆H₆ + 2 S → Ph₂S + H₂S（AlCl₃）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 傅克型的 S–C 成键：苯与硫在 AlCl₃ 上 80–120 °C 缩合，放 **H₂S**。
 *
 * **配平里有一个容易被漏掉的 2**：硫在产物与 H₂S 里各出现一次，所以
 *
 *     2 C₆H₆ + 2 S → Ph₂S + H₂S        （C₁₂H₁₂ + S₂ = C₁₂H₁₀S + H₂S ✓）
 *     2×78.11 + 2×32.06 = 186.27 + 34.08 = 220.35 ✓
 *
 * ⇒ **硫的利用率只有 50 %**，另一半进 H₂S。H₂S 本层**没有条目、也没有克劳斯回收
 * 路线**（硫 → SO₂ → 硫 那条环在 `make/so2` 里是"石膏 → SO₂"，反过来没有）——
 * 所以这 183 kg/t 只能记在 `unbalanced_zh` 里。
 *
 * AlCl₃ **不是催化剂量而是当量试剂**：它与产物硫醚生成 Ph₂S·AlCl₃ 络合物，
 * 要靠水解才放出来 —— 水解同时是**分离手段**（络合物溶于水相、硫醚不溶）。
 *
 *     AlCl₃ + 3 H₂O → Al(OH)₃↓ + 3 HCl
 *
 * ⇒ 每 kg 硫醚：AlCl₃ 716 g、水 290 g，出 HCl 587 g 与 Al(OH)₃ 419 g。
 * HCl 这里按气体记账、不产 `mat/hcl`：`mat/hcl` 的窗口是 15–38 % 的**溶液**
 * （`organic.ts:71–72`），而这 587 g 若全溶进 290 g 水里是 67 %，超出窗口 ——
 * 与其给它编一个浓度，不如说"它进碱洗塔"（`mat/naoh`），账挂在 `unbalanced_zh` 里。
 *
 * 精馏的窗口问题：Ph₂S 常压沸点高，工业上走 **1–5 kPa 减压蒸馏**，而本层
 * **没有一台设备 hold 1–5 kPa**（塔 300–1000 kPa、酸厂 ≥100 kPa、`plant/evaporator`
 * 是 1e-3–10 Pa 的电子束蒸发器）⇒ 这里按 **250–290 °C / 100 kPa 常压蒸馏**写，
 * 代价是热历史。这一条记在缺口⑦。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、`make/triflic-acid`：CH₄ + SO₂ + Cl₂ + 3 HF + H₂O → CF₃SO₃H + 3 H₂ + 2 HCl
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 三段，每一段的净式都配平过：
 *
 *   ① **氯磺化（光化学，自由基）**
 *      CH₄ + SO₂ + Cl₂ --hν--> CH₃SO₂Cl + HCl          16.04 + 64.06 + 70.90 = 114.55 + 36.46 ✓
 *      20–60 °C、常压附近。**反应器是酸厂的槽 + 石英浸入井**（`mat/quartz-pure` 有），
 *      光源是 `plant/xenon-lamp`（250–400 nm 连续谱，`litho-m2.ts:231`）。
 *      ⚠️ **氙灯没有 `holds`**（只有 power/wavelength 两个 props，`litho-m2.ts:244–250`）
 *      ⇒ 它当不了执行者，只能进 `needs`；这一条与 `rf-13m56` 是同一个形状（缺口⑧）。
 *
 *   ② **ECF（电化学氟化，Simons 法）**
 *      CH₃SO₂Cl + 4 HF --> CF₃SO₂F + 3 H₂ + HCl        114.55 + 4×20.01 = 152.07 + 6.05 + 36.46 ✓
 *      工业槽 **0–10 °C**；本层唯一的电解设备 `plant/electrolyzer` 的窗口是
 *      **10–90 °C / 50–500 kPa**（`process.ts:343–347`）⇒ **0–5 °C 那一段够不着，
 *      按 10–20 °C 降级写**，收率下降（降多少**待查**：温度高的副反应是 C–S 断裂
 *      与过度氟化，本层无量具判定）。**[缺口①]**
 *
 *      顺带两条对得上的：
 *        · Simons 槽的**阳极就是镍**，而本层电解槽的电极正是镍（`process.ts:335–336`）
 *          —— 这一格**反而对上了**（镍在 HF 里生成 NiF₂ 钝化膜，工业就是这么做的）；
 *        · 隔膜是 PTFE，也在（同一行）。
 *      对不上的：**HF 的沸点 19.5 °C** ⇒ 20 °C 上 HF 的分压已经是 1 atm，
 *      槽必须密闭 + 冷凝回流；0–10 °C 那个窗口不只是"选择性"，也是"HF 待得住"。
 *
 *   ③ **水解**
 *      CF₃SO₂F + H₂O → CF₃SO₃H + HF                    152.07 + 18.02 = 150.08 + 20.01 ✓
 *      60–100 °C（`plant/wet-bench` 20–120 °C ✓）。放出的 **HF 133 kg/t 回 ②段循环**，
 *      所以 `uses` 里只记净耗 **400 kg/t**，那 133 kg 不进进出口账（内部循环，
 *      与 `cu-seed.ts` 的"存量不进 uses"同一个口径）。
 *
 * ⚠️ **收率一律按 100 % 记**（与 `make/phosphorus` 同一口径：不编折减）。
 *    ECF 的电流效率、光化学的量子产率**本层都没有出处** ⇒ 实际要多少料**待查**（缺口④）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、`make/resist-pag`：S–C 成键的最后一步 —— **这一步有缺口，不编**
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 净式（**按 O₂ 作末端氧化剂配平**）：
 *
 *   Ph₂S + PhH + CF₃SO₃H + ½O₂ → Ph₃S⁺ CF₃SO₃⁻ + H₂O
 *   186.27 + 78.11 + 150.08 + 16.00 = 412.45 + 18.02 = 430.46 ✓
 *
 * ⚠️ **净式成立 ≠ 机理成立。** 把第三个苯基装到硫上，工业上有四条路：
 * PhI(OAc)₂/TfOH、过硫酸盐/TfOH、电解氧化、Pummerer（亚砜 + 芳烃 + Tf₂O）。
 * **这四样的试剂本层一件都没有**（PhI(OAc)₂ 要碘与醋酸酐、过硫酸盐 0 条、
 * Tf₂O 0 条、电解氧化要分隔槽）。所以：
 *
 *   **`uses` 里写的是"净式的账"，不是"跑得通的配方"** —— 活化剂标 **待查**，
 *   这一步在缺口⑤里单列。这是本文件唯一一处"物料流立得住、化学没落地"的地方，
 *   写在文件头而不是藏进注释。
 *
 * 若日后确认是过氧化物体系，账换成（本层现在**有** H₂O₂ 了，见 `hydrogen-peroxide.ts`）：
 *
 *   Ph₂S + PhH + CF₃SO₃H + H₂O₂ → PAG + 2 H₂O    ⇒ 每 kg PAG 要 H₂O₂ 82.5 g
 *
 * 两种净式只差一个氧化剂，**物料流不动、只动 `uses` 的一行**。
 *
 * 锍盐的分离：它是盐，水溶、不溶于烃 —— 结晶 + 过滤 + 100–120 °C 干燥
 * （PAG 的 Td >180 °C，干燥窗口够）。
 *
 * ⚠️ **顺带一处勘误**：`car-resist.ts:196` 与 `:413` 都把分子式写成 C₁₈H₁₅F₃O₃S，少了
 * 三氟甲磺酸那个碳与那个硫 —— 正确是 **C₁₉H₁₅F₃O₃S₂（M = 412.45）**。那一条目没有
 * 分子量属性，所以不影响校验；但本文件的账按 412.45 算。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、质量账（每 1 kg 产品，全部按原子量算，100 % 收率）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * | 产品 | 进 | 出 |
 * |---|---|---|
 * | Ph₂S 1 kg | 苯 839 + 硫 344 + AlCl₃ 716 + 水 290 = **2189** | Ph₂S 1000 + H₂S 183 + HCl 587 + Al(OH)₃ 419 = **2189** |
 * | CF₃SO₃H 1 kg | 甲烷 107 + SO₂ 427 + Cl₂ 472 + HF 400 + 水 120 = **1526** | 酸 1000 + H₂ 40 + HCl 486 = **1526** |
 * | PAG 1 kg | Ph₂S 452 + 苯 189 + 酸 364 + O₂ 39 = **1044** | PAG 1000 + 水 44 = **1044** |
 *
 * 三张账都是**逐项配平**的，没有"余量"糊过去。落在 `unbalanced_zh` 里的只有
 * 没有条目的那几样（H₂S / HCl / Al(OH)₃）—— 那是"缺条目"，不是"账不平"。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、R8 —— PAG 的规格与缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * | 格 | 判据（`car-resist.ts:424–425`） | 本文件交付 | 差 |
 * |---|---|---|---|
 * | dose | 10–40 mJ/cm² | **10–40**（3–5 wt% 添加量下显透 200 nm） | 1× —— 这一格是**声明值**，本层没有感光度量具（`car-resist.ts` 全篇的同一处） |
 * | thermalDecomposition | >180 °C | **180–220** | 1× —— TGA 本层 0 台，同上 |
 *
 * **五处缺口，逐条给量级：**
 *
 * | # | 缺口 | 现状 | 要什么 | 差多少 |
 * |---|---|---|---|---|
 * | ① | **ECF 槽温** | 电解槽 10–90 °C（`process.ts:344`） | Simons 槽 0–10 °C | **差 5–10 K**；且 HF bp 19.5 °C ⇒ 20 °C 上 HF 是 1 atm，要密闭 + 回流。10–20 °C 降级，收率下降**待查** |
 * | ② | **镍阳极** | 电解槽的电极就是镍（`process.ts:335–336`） | Simons 槽用镍阳极 | **0×（对上了）** —— 这条是本文件唯一"不用改设备"的一格 |
 * | ③ | **无水 HF 的水含量** | `mat/hf-anhydrous` 水 ≤0.1 %（`c3-chain.ts:637–639`），判据原话是"Simons 槽的生死线：>0.1 % 就开始放氧"（`c3-chain.ts:627`） | 同 | **刚好卡在线上、没有余量**：每 kg HF 带 ≤1 g 水，1 t 酸要 400 g 水进槽；水在槽里电解成 O₂ 与 H₂，槽电压一个班爬 1 V（`make/hfac` 的缺口⑥同一句） |
 * | ④ | **三氟甲磺酸收率** | 按 100 % 记账 | ECF 电流效率 + 光化学量子产率 | **未知/待查**（本层没有出处）；两者各掉 20 % 就是料涨 1.25 倍 |
 * | ⑤ | **苯基化试剂** | 净式按 O₂ 配平 | PhI(OAc)₂ / 过硫酸盐 / 电解氧化 / Pummerer 之一 | **4 条路 0 条落地**；`c3-chain.ts:272` 早把这一格记成"二苯硫醚的 S 化学、芳基化 ⇒ 3 件 0/3"，本文件只解掉其中的二苯硫醚。这是本文件唯一"物料流立得住、化学没落地"的一步 |
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、已知缺口（"现在没有"，不是"暂未实现"）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① ECF 槽温差 5–10 K（10–20 °C 降级）；② 镍阳极反而对上了（这是一条好消息，
 *     写在这里免得下一轮去补一件不需要的东西）；③ 无水 HF 的水含量刚好卡在 0.1 %
 *     这条线上；④ 收率无出处；⑤ 苯基化试剂 0/4；
 *  ⑥ **H₂S 没有条目、也没有回收路线** —— 硫利用率 50 %，183 kg/t 只能排；
 *  ⑦ **没有 1–5 kPa 的精馏设备**（塔 300–1000 kPa、酸厂 ≥100 kPa），Ph₂S 只能
 *     250–290 °C 常压蒸；
 *  ⑧ **`plant/xenon-lamp` 没有 `holds`**（与 `plant/rf-13m56` 同型）⇒ 光化学步的执行者
 *     只能是 `plant/acid-plant`，灯进 `needs`；
 *  ⑨ **PAG 的两个规格都是声明值**：dose 与 Td 没有量具（感光度要曝光矩阵 + 膜厚仪，
 *     Td 要 TGA —— 本层 0 台），与 `car-resist.ts` 里每一支胶同一种写法；
 *  ⑩ **`PAG_ROUTES`（前两段）接线；`PAG_BLOCKED_ROUTE` 不接。**
 *     PAG 的实际产出路线在 `pag-activator.ts`：`make/resist-pag-pummerer`
 *     （Ph₂SO + 苯 + Tf₂O → PAG + TfOH）。本文件的净式只留作对照，不导出。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PAG_ITEMS: readonly Item[] = [
  /**
   * 二苯硫醚（Ph₂S，C₁₂H₁₀S，M 186.27）。无色液体，bp 296 °C，有臭味。
   *
   * 它是 PAG 的**硫源与两个苯基的来源**：三苯基锍里的三个苯基，两个从这里来、
   * 一个从 PAG 那一步的苯来（`make/resist-pag`）。
   *
   * 两个规格：
   *   purity        95–99 %（杂质是未反应的苯、多硫化物与 AlCl₃ 残渣）
   *   waterContent  0.05–0.5 %（水会带着 AlCl₃ 残渣水解成 HCl，腐蚀下一步的槽）
   */
  {
    id: 'mat/diphenyl-sulfide',
    name: '二苯硫醚',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'waterContent', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 三氟甲磺酸（CF₃SO₃H，M 150.08）。**超强酸**，pKa ≈ −14 —— PAG 的光解产物就是它。
   *
   *   concentration 95–99.5 %（无水酸；水是唯一的稀释剂）
   *   waterContent  0.2–1 %（水多则 PAG 那一步的收率掉，且酸雾重）
   *
   * ⚠️ 它是本层**第一个有机强酸**：`mat/hf-anhydrous` 是无机酸、`mat/sulfuric-acid`
   * 是矿物酸，两者的腐蚀口径都不适用于它 —— 碳链 + 三氟甲基让它对钢"温和"、
   * 对镍与铜"凶"，而本层没有一台按它选的设备（借酸厂的槽）。
   */
  {
    id: 'mat/triflic-acid',
    name: '三氟甲磺酸',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'concentration', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'waterContent', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
    ],
  },
];

export const PAG_ROUTES: readonly Route[] = [
  {
    /**
     * **二苯硫醚：2 C₆H₆ + 2 S → Ph₂S + H₂S，AlCl₃ 当量，80–120 °C。**
     *
     *   苯 839 + 硫 344 + AlCl₃ 716 + 水 290 → Ph₂S 1000 + H₂S 183 + HCl 587 + Al(OH)₃ 419
     *   进 2189 = 出 2189 ✓（后三样没有条目 ⇒ 声明在 unbalanced_zh 里）
     *
     * 三道工序：
     *   ① 缩合 80–120 °C / 100–300 kPa（酸厂的槽；H₂S 与苯蒸气要回流 + 碱洗）
     *   ② 水解与分层 20–60 °C（湿法槽）：Ph₂S·AlCl₃ + 3 H₂O → Ph₂S + Al(OH)₃ + 3 HCl
     *   ③ 常压蒸馏 250–290 °C（酸厂，500 °C 上限内）—— 精馏要 1–5 kPa，本层 0 台（缺口⑦）
     *
     * AlCl₃ 是**当量**不是催化量：它与产物成络合物，靠水解才放出来。
     */
    id: 'make/diphenyl-sulfide',
    name: '二苯硫醚制备',
    produces: [
      {
        item: 'mat/diphenyl-sulfide',
        qty: q(1000),
        gives: [
          { param: 'purity', kind: 'range', min: 95, max: 99 },
          { param: 'waterContent', kind: 'range', min: 0.05, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/benzene', qty: q(839) }] },
      { anyOf: [{ item: 'mat/sulfur', qty: q(344) }] },
      { anyOf: [{ item: 'mat/aluminium-chloride', qty: q(716) }] },
      // 水解那一步的水：AlCl₃ + 3 H₂O → Al(OH)₃ + 3 HCl
      { anyOf: [{ item: 'mat/water', qty: q(290) }] },
    ],
    needs: ['plant/mfc'],
    steps: [
      {
        note_zh:
          '① 缩合：苯 + 硫 + AlCl₃，**80–120 °C / 100–300 kPa**，H₂S 连续放出（尾气走碱洗）。硫按 2 当量配 —— 一半进产物、一半进 H₂S，**硫利用率 50 %**',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 80, max: 120 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '② 水解与分层：Ph₂S·AlCl₃ + 3 H₂O → Ph₂S + Al(OH)₃↓ + 3 HCl，20–60 °C。络合物进水相、硫醚进有机相；HCl 进碱洗塔（587 kg/t，没有条目）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '③ 常压蒸馏 250–290 °C：Ph₂S bp 296 °C，本层没有 1–5 kPa 的减压塔（缺口⑦），只能靠高温 —— 代价是 AlCl₃ 残渣催化结焦，所以②要洗到中性再进③',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 250, max: 290 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
    ],
    unbalanced_zh:
      '进 苯 839 + 硫 344 + AlCl₃ 716 + 水 290 = 2189；出 二苯硫醚 1000。差 1189 是三样没有条目的副产：H₂S 183、HCl 587、Al(OH)₃ 419（2189 = 1000 + 1189 ✓，账是平的，缺的是条目不是数）。HCl 按气体记账、不产 mat/hcl：它的窗口是 15–38 % 的溶液，而 587 g 溶进 290 g 水是 67 %，超窗 —— 与其编一个浓度，不如说它进碱洗塔。硫利用率 50 %（另一半进 H₂S），本层没有克劳斯回收路线',
  },

  {
    /**
     * **三氟甲磺酸：CH₄ + SO₂ + Cl₂ + 3 HF + H₂O → CF₃SO₃H + 3 H₂ + 2 HCl。**
     *
     *   甲烷 107 + SO₂ 427 + Cl₂ 472 + HF 400 + 水 120 → 酸 1000 + 氢 40 + HCl 486
     *   进 1526 = 出 1526 ✓（HCl 没有条目 ⇒ 声明在 unbalanced_zh 里）
     *
     * 三段，见文件头 §二：
     *   ① 光化学氯磺化 20–60 °C（酸厂的槽 + 石英浸入井；氙灯进 needs，它没有 holds）
     *   ② ECF 10–20 °C（电解槽；工业是 0–10 °C —— **降级**，缺口①）
     *   ③ 水解 60–100 °C（湿法槽）；放出的 HF 133 kg/t **回②段循环**
     *
     * HF 只记净耗 400 kg/t（4 当量进槽、1 当量从水解回来）；内部循环不进进出口账。
     * 收率按 100 % 记（ECF 电流效率与光化学量子产率**都没有出处**，缺口④）。
     */
    id: 'make/triflic-acid',
    name: '三氟甲磺酸制备',
    produces: [
      {
        item: 'mat/triflic-acid',
        qty: q(1000),
        gives: [
          { param: 'concentration', kind: 'range', min: 95, max: 99.5 },
          { param: 'waterContent', kind: 'range', min: 0.2, max: 1 },
        ],
      },
      // ECF 的阴极氢：3 当量/当量酸，是这条链唯一"干净"的副产
      {
        item: 'mat/hydrogen',
        qty: q(40),
        gives: [{ param: 'purity', kind: 'range', min: 99, max: 99.5 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/methane', qty: q(107) }] },
      { anyOf: [{ item: 'mat/so2', qty: q(427) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(472) }] },
      {
        anyOf: [
          {
            // 无水 HF：水 >0.1 % 就开始放氧（c3-chain.ts:627 的原话），这是槽电压的生死线
            item: 'mat/hf-anhydrous',
            qty: q(400),
            need: [{ param: 'waterContent', kind: 'range', max: 0.1, dir: 'atMost' }],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/water', qty: q(120) }] },
    ],
    needs: [
      // 光化学的光源：它没有 holds，当不了执行者（缺口⑧）
      'plant/xenon-lamp',
      'plant/mfc',
    ],
    steps: [
      {
        note_zh:
          '① 光化学氯磺化：CH₄ + SO₂ + Cl₂ --hν(250–400 nm)--> CH₃SO₂Cl + HCl，**20–60 °C / 100–300 kPa**。反应器是酸厂的槽 + 石英浸入井（石英有），灯在 needs 里；CH₄:SO₂:Cl₂ 要过量甲烷压多氯代',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '② ECF：CH₃SO₂Cl + 4 HF → CF₃SO₂F + 3 H₂ + HCl，**10–20 °C / 50–200 kPa**。工业是 0–10 °C ⇒ **这是降级**（缺口①）；镍阳极与 PTFE 隔膜正好是这台槽有的（process.ts:335–336）。HF bp 19.5 °C，20 °C 上槽内 HF 分压就是 1 atm ⇒ 必须密闭 + 冷凝回流',
        performedBy: 'plant/electrolyzer',
        under: [
          { param: 'temperature', min: 10, max: 20 },
          { param: 'pressure', min: 50, max: 200 },
        ],
      },
      {
        note_zh:
          '③ 水解：CF₃SO₂F + H₂O → CF₃SO₃H + HF，**60–100 °C / 100–300 kPa**。放出的 HF 133 kg/t 冷凝后回②段；酸相 95–99.5 % 出料。碱解 + 酸化是工业的另一条，本文件按直接水解写（速率与收率待查，缺口④）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 60, max: 100 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '④ 脱水与蒸馏：120–170 °C / 100–200 kPa 把水与 HF 赶到 <1 %（TfOH bp 162 °C）。酸厂的 500 °C 上限够，但它的槽不是按超强酸选的 —— 腐蚀口径是本文件没算的那一笔（缺口见文件头）',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 120, max: 170 },
          { param: 'pressure', min: 100, max: 200 },
        ],
      },
    ],
    unbalanced_zh:
      '进 甲烷 107 + SO₂ 427 + 氯 472 + 无水 HF 400 + 水 120 = 1526；出 酸 1000 + 氢 40 = 1040。差 486 是两段各 243 的 HCl（氯磺化 1 当量 + ECF 1 当量），没有条目、进碱洗塔。HF 记净耗 400（4 当量进槽、1 当量从水解回来循环，回流的 133 不进账）。收率一律按 100 %：ECF 电流效率与光化学量子产率本层无出处，实际料耗待查',
  },
];

/**
 * **`make/resist-pag` —— 不接线，只作净式对照。**
 *
 * 它不是配方：`uses` 里只有按 O₂ 配平的物料，没有活化剂。活化剂那一半
 * 已经由 `pag-activator.ts` 的 Tf₂O/Pummerer 路线补上；这条净式不再需要，
 * 留在这里是为了让两套账能对照，不导出、不接 report。
 */
// 故意不导出：stats 会把导出的 Route 对象收进“路线”总数，report 又不该看到它。
const PAG_BLOCKED_ROUTE: Route = {
  /**
   * **PAG：Ph₂S + PhH + CF₃SO₃H + ½O₂ → Ph₃S⁺ CF₃SO₃⁻ + H₂O。**
     *
     *   二苯硫醚 452 + 苯 189 + 三氟甲磺酸 364 + 氧 39 → PAG 1000 + 水 44
     *   进 1044 = 出 1044 ✓
     *
     * ⚠️ **这一条是净式，不是配方。** 把第三个苯基装到硫上的活化剂（PhI(OAc)₂ /
     * 过硫酸盐 / 电解氧化 / Pummerer）**本层 0/4**，标"待查"（缺口⑤）。
     * 物料流与设备立得住，化学没落地 —— 这一句必须与路线一起读。
     *
     * 若确认是过氧化物体系，把 O₂ 39 换成 H₂O₂ 82.5，水的产出从 44 变 88：
     * 只动 uses 的一行，账照样平（见文件头 §三）。
     *
     * 三道工序：
     *   ① 氧化偶联 20–60 °C（酸厂）；② 结晶与过滤（湿法槽）；③ 100–120 °C 干燥（电阻炉）
     */
    id: 'make/resist-pag',
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
      {
        item: 'mat/water',
        qty: q(44),
        gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/diphenyl-sulfide', qty: q(452) }] },
      { anyOf: [{ item: 'mat/benzene', qty: q(189) }] },
      {
        anyOf: [
          {
            // 按 100 % 酸计（与 nitric.ts 的"按 100 % 计"同一个口径）
            item: 'mat/triflic-acid',
            qty: q(364),
            need: [{ param: 'concentration', kind: 'range', min: 95, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/oxygen', qty: q(39) }] },
    ],
    needs: ['plant/mfc'],
    steps: [
      {
        note_zh:
          '① 氧化偶联：Ph₂S + PhH + TfOH + ½O₂ → Ph₃S⁺TfO⁻ + H₂O，20–60 °C / 100–300 kPa。**活化剂待查**（缺口⑤）：净式按 O₂ 配平，四条第 S–C 路一条都没落地；本步只保证物料流与设备对得上',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '② 结晶与过滤：锍盐是盐，水溶、不溶于烃；浓缩后冷却结晶，过滤，母液（含过量苯与酸）回①。本层没有醚类反溶剂（有机链只到 C1/C2），所以只能靠水相结晶',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 60 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '③ 干燥：100–120 °C / 常压，到水 <0.5 %。**上限由 Td 定**（PAG 分解 >180 °C，留 60 K 余量）；干燥不足的水会水解锍盐、放出 TfOH，胶的感光度跟着漂',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 120 }],
      },
    ],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PAG_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PAG_ROUTES];
