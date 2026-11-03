/**
 * CAR 胶 —— 让 PAG 从"没人吃"变成"有消费者"的那一格。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、本文件补的是哪一格
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `mat/car-resist`（`car-resist.ts:400`）与 `mat/pag-triphenylsulfonium-otf`
 * （`car-resist.ts:428`）**都只有条目、没有路线**。上一份文件（`pag-activator.ts`）
 * 把 PAG 做到了"能产"，但**没有人吃它** —— 那就是本文件要补的两条边：
 *
 *   `make/acetalized-pva`   PVA + 乙醛 + HCl → 缩醛化 PVA（CAR 的**酸可分解基团**）
 *   `make/car-resist`       缩醛化 PVA 945 + PAG 30（3 wt%）+ 三乙胺 5 + 乙醇 20 → CAR 胶 1000
 *
 * **新增 1 个条目**（`mat/acetalized-pva`）。`mat/car-resist` 不重声明。
 *
 * `car-resist.ts:539–542` 把这一格的话说得很准：
 *
 *   「酸可分解的 CAR 要的是它的**缩醛**（PVA 缩乙醛：酸一催化就水解析出 PVA，
 *     溶解度反转，而质子不消耗 —— 这才是增幅）。缩醛化那一步本文件没写：
 *     乙醛有路线但不在白名单……**CAR 的后一半差一条路线**」
 *
 * ⇒ 本文件写的就是那一条。**CAR 的两半现在都有路线了**（PAG 在 `pag-activator.ts`，
 * 后一半在这里）；**涂胶、曝光、显影都已建**（`car-coat.ts` + `car-pattern.ts`，
 * 193 nm ArF、水显影）
 * （grep 只命中它自己的声明）。这一条记在缺口⑤，不在本文件里补 —— 补它要改
 * `litho-m*` 或 `deprocess.ts`，不在本次权限内。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、`make/acetalized-pva`：缩醛化度 20–30 mol%
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PVA 的重复单元是 –CH₂–CH(OH)–（C₂H₄O，M 44.053）。乙醛（C₂H₄O，M 44.053）与
 * **两个相邻的 OH** 缩成环状缩醛、放一分子水：
 *
 *   –CH₂–CH(OH)–CH₂–CH(OH)–  +  CH₃CHO  →  –CH₂–CH(O–CH(CH₃)–O)–CH₂–  +  H₂O
 *   2 × 44.053 + 44.053 = 114.144 + 18.015 = 132.159 ✓
 *
 * ⇒ 一个缩醛环**吃掉两个羟基本、放一个水**。所谓"缩醛化度 20–30 mol%"是按
 * **羟基被消耗的摩尔分数**说的（工业口径）：
 *
 *   25 mol% ⇒ 每 100 个单元有 25 个 OH 反应 ⇒ **12.5 个缩醛环、12.5 个乙醛**
 *   每 100 单元（4405.3 g）：乙醛 12.5×44.053 = 550.7 g、出水 12.5×18.015 = 225.2 g
 *   ⇒ 产物 4405.3 + 550.7 − 225.2 = **4730.8 g**
 *
 * 折成 1 kg 产品：**PVA 931.2 g + 乙醛 116.4 g → 缩醛化 PVA 1000 g + 水 47.6 g**。
 * 两个端点是：20 mol% 要 PVA 944 / 乙醛 94，30 mol% 要 PVA 919 / 乙醛 138 ——
 * 所以 931/116 是 25 mol% 那一档，`gives` 的窗口是 20–30。
 *
 * ⚠️ **水是这条路线的主要敌人，也是它的产物**：缩醛化是平衡反应，水多了平衡回头。
 * 所以工业上要么用过量乙醛、要么边反应边把水蒸走。本层的 `plant/acid-plant`
 * 有"蒸馏"这一段（`chemical.ts:252–268`），可以边反应边抽水 —— 但它是间歇的，
 * 抽水速率靠人看（没有在线水分），**转化率只能按投料记账**（缺口④）。
 *
 * 中和那一笔也要算：10 kg HCl（按 100 % 计，与 `nitric.ts` 同一个口径）要
 * **10.97 kg NaOH**，出 **16.03 kg NaCl + 4.94 kg 水** —— 三样都没有条目，
 * 但账上要留位置，否则"中和"就成了一句空话。
 *
 * 洗涤水：PVA 缩醛不溶于冷水、溶于热水（这是它做"水显影"的根据），所以水洗要
 * **冷洗**（20–30 °C）。湿法槽的下限正好是 20 °C。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、`make/car-resist`：945 / 30 / 5 / 20 —— 四个数各管一件事
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   缩醛化 PVA **945**  成膜骨架 + 酸可分解基团（显影靠它溶解度反转）
 *   PAG **30**（3 wt%） 光致产酸；3 wt% 是"够酸、又不把膜变成盐"的那一档
 *   三乙胺 **5**（0.5 wt%） 酸淬灭剂；把酸在暗区的扩散压住，对比度 5–8 → 8–12
 *   乙醇 **20**         流平与挥发；本层没有丙二醇甲醚醋酸酯（PGMEA）这类真溶剂
 *
 * ⇒ 1000 kg 一批，**逐项配平，没有余量**（945 + 30 + 5 + 20 = 1000）。
 *
 * 配液 20–40 °C、避光、静置消泡 —— 这三件事都是**工艺纪律**，模型里只有温度与
 * 压力两个条件可写，所以"避光"与"静置"只能写在 `note_zh` 里（缺口⑥，与
 * `car-resist.ts` 里每一支胶同一种写法）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、质量账（每 1 kg 产品）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * | 产品 | 进 | 出 | 差 |
 * |---|---|---|---|
 * | 缩醛化 PVA 1 kg | PVA **931.2** + 乙醛 **116.4** + HCl 10 + NaOH **10.97** + 水 500 = **1568.57** | 缩醛化 PVA 1000 | **568.57 = 反应水 47.6 + 中和水 4.94 + NaCl 16.03 + 洗涤水 500**（四样都没有条目） |
 * | CAR 胶 1 kg | 缩醛化 PVA 945 + PAG 30 + 三乙胺 5 + 乙醇 20 = **1000** | CAR 胶 1000 | **0（闭合）** |
 *
 * 第一条的差**逐项点名**；第二条是真闭合。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、R8 —— CAR 胶的五格与这条链的缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * | 格 | 本文件交付 | 判据（工业 CAR） | 差 / 说明 |
 * |---|---|---|---|
 * | sensitivity | **10–30 mJ/cm²** | 10–40（PAG 3 wt%） | 1× —— 但**是声明值**：曝光矩阵 + 膜厚仪都 0 台（缺口③） |
 * | contrast | **8–12** | >10 | **1–1.25×**：0.5 wt% 三乙胺把酸在暗区的扩散压住；到 >10 的上沿仍要更小的 PAG 或键合型 PAG（缺口①） |
 * | resolution | **80–200 nm** | 16–32 nm（EUV 档） | **2.5–12×**：酸扩散 6–11 nm 是硬底，光学也到不了 —— 16–32 nm 那一档差 **2–5×**（缺口②） |
 * | thickness | **60–200 nm** | 30–100 nm | 1–2×：旋涂的膜厚 ∝ 固含/√转速，本层没有转速闭环（`litho-m2.ts:602` 同一笔） |
 * | pinhole | **1–5 /cm²** | <0.1 /cm² | **10–50×**：**没有 0.2 µm 滤材**（本层最细的过滤是滤纸与硅藻土，缺口③） |
 *
 * **五处缺口，逐条给量级：**
 *
 * | # | 缺口 | 现状 | 要什么 | 差多少 |
 * |---|---|---|---|---|
 * | ① | **酸淬灭剂** | **已建 `make/triethylamine`**（quencher.ts，乙醇 + 氨 / Al₂O₃，300–400 °C）；CAR 里加 0.5 wt% | 三乙胺 0.1–0.5 wt% 或叔胺聚合物 | 对比度 **8–12 对 >10**；上沿仍差 1.25×，酸扩散还剩 6–11 nm 的一半 |
 * | ② | **分辨率** | 酸扩散 6–11 nm + 接触式曝光 0.7 µm 档（`litho-m2.ts`） | EUV/DUV 投影 + 酸扩散 <3 nm（要更小的 PAG 或聚合物键合型 PAG） | 16–32 nm 档**差 2–5×**；80–200 nm 是"接触曝光 + 酸扩散"这条组合能给到的 |
 * | ③ | **针孔** | 0.2 µm 膜过滤 **0 台**（最细是滤纸/硅藻土） | 0.2 µm PTFE 膜滤芯 + 终端过滤 | pinhole **1–5 对 <0.1**（10–50×）；颗粒是针孔的唯一来源，而本层**测不了颗粒**（`ald.ts:§九` 同一处） |
 * | ④ | **感光度与 Td 是声明值** | 曝光矩阵 0、TGA 0、膜厚仪 0（椭偏仪在，但胶膜要涂在片上才测） | 曝光矩阵 + TGA + 涂胶机 | 两个数**没有闭环**；与 `car-resist.ts` 每一支胶同一种写法 |
 * | ⑤ | **只产胶，不产器件** | **全链已建**：涂胶 → 曝光/PEB/水显影 → Cl₂ RIE/O₂ 灰化 → `make/car-line-test-structure`（car-device.ts，4 个 Al pad + 四线法，lineResistance 0.1–100 Ω）；测试结构是终点，不是器件 | 器件集成（要改 `litho-*`/`deprocess.ts`） | 料、工序、电学读数都收口；链断在“它不是晶体管”上 —— 按 R7，那是下一段 |
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、已知缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① 酸淬灭剂已建（三乙胺 0.5 wt%）⇒ contrast 8–12，上沿仍差 1.25×；
 *  ② 酸扩散 6–11 nm ⇒ resolution 80–200 nm（16–32 nm 档差 2–5×）；
 *  ③ 没有 0.2 µm 滤材、也没有颗粒量具 ⇒ pinhole 1–5；
 *  ④ 缩醛化的转化率没有在线水分/黏度，只能按投料记账（平衡反应，水多了回头）；
 *  ⑤ **涂胶/曝光/显影/刻蚀/去胶/测试结构全链已建**：`car-coat.ts` →
 *     `car-pattern.ts` → `car-strip.ts` → `car-device.ts`
 *     （4 个 Al pad + 四线法，lineResistance 0.1–100 Ω）。
 *     测试结构有电学读数，但**不是器件**；断点在晶体管集成。
 *  ⑥ "避光"与"静置消泡"没有条件可写（模型只有温度与压力），只能进 `note_zh`；
 *  ⑦ 已接进 `tools/report.ts`；`mat/car-line-test-structure` 无消费者 ——
 *     这是器件集成缺口，不是料缺口。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CAR_RESIST_ITEMS: readonly Item[] = [
  /**
   * 缩醛化 PVA（PVA 缩乙醛）。**CAR 胶的酸可分解骨架。**
   *
   * 酸一来，缩醛水解回 PVA（溶于水/碱），曝光区与非曝光区的溶解度反转 ——
   * 而**质子不消耗**，一个光子产的酸能拆几百个缩醛，这就是"化学增幅"。
   *
   *   acetalization  20–30 mol%（按被消耗的羟基计；25 mol% 对应 12.5 个缩醛环/100 单元）
   *   waterContent   0.5–2 %（水多了显影时暗区也溶，等于丢对比度）
   *
   * ⚠️ 它不溶于冷水、溶于热水 —— 所以洗涤只能冷洗（20–30 °C），
   * 而"热水显影"这件事在本层没有设备（湿法槽上限 120 °C，够，但没有温度闭环）。
   */
  {
    id: 'mat/acetalized-pva',
    name: 'Acetalized PVA', name_zh: '缩醛化 PVA',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'acetalization', kind: 'range', min: 0, max: 60, unit: 'mol%' },
      { param: 'waterContent', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
    ],
  },
];

export const CAR_RESIST_ROUTES: readonly Route[] = [
  {
    /**
     * **缩醛化 PVA：PVA + 乙醛 + HCl → 缩醛 + H₂O，50–80 °C。**
     *
     *   25 mol% 档：PVA 931.2 + 乙醛 116.4 + HCl 10 + 水 500 → 缩醛化 PVA 1000
     *   差 557.6 = 反应水 47.6 + 中和后的 HCl 10 + 洗涤水 500（三样都没有条目）
     *
     * 三道工序：① 缩醛化 50–80 °C / 100–300 kPa（酸厂，边反应边抽水）
     * ② 中和与冷洗 20–40 °C（湿法槽；缩醛不溶于冷水）
     * ③ 干燥 100–120 °C（电阻炉）
     *
     * ⚠️ 平衡反应：水多了回头。抽水速率没有在线量具（缺口④）。
     */
    id: 'make/acetalized-pva',
    name: 'Acetalized PVA Production', name_zh: '缩醛化 PVA 制备',
    produces: [
      {
        item: 'mat/acetalized-pva',
        qty: q(1000),
        gives: [
          { param: 'acetalization', kind: 'range', min: 20, max: 30 },
          { param: 'waterContent', kind: 'range', min: 0.5, max: 2 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/polyvinyl-alcohol',
            qty: q(9312, 10), // 931.2 kg：25 mol% 档
            // 酸水解 1–2 块理论板的产物（car-resist.ts:544）；<88 % 的残酯会拖显影
            need: [{ param: 'hydrolysisDegree', kind: 'range', min: 88, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/acetaldehyde', qty: q(1164, 10) }] }, // 116.4 kg：12.5 个缩醛环/100 单元
      // HCl 催化：10 kg = PVA 的 1 wt%（估，按 100 % HCl 计）；中和它要 10.97 kg NaOH
      { anyOf: [{ item: 'mat/hcl', qty: q(10) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1097, 100) }] }, // 10.97 kg：10/36.461 kmol × 40.00
      // 配液与冷洗水：500 kg（洗涤水没有条目、也不回收）
      { anyOf: [{ item: 'mat/water', qty: q(500) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh:
          '① 缩醛化：PVA 水溶液 + 乙醛 + HCl 催化，**50–80 °C / 100–300 kPa**，边反应边把水蒸走（酸厂的蒸馏段）把平衡往产物拉。乙醛按 12.5 当量/100 单元（25 mol%）加，过量 10 % 补挥发损失',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 50, max: 80 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '② 中和与冷洗：碱中和到 pH 6–7（`mat/naoh`），**20–30 °C 冷水**洗 —— 缩醛化 PVA 不溶于冷水、溶于热水，所以洗不洗得干净全看水温。湿法槽下限正好 20 °C',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '③ 干燥：100–120 °C 到水 0.5–2 %（电阻炉）。缩醛在 200 °C 以上才开始分解，窗口很宽；干燥不足的水会在配胶时把 PAG 的酸提前放出来',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 100, max: 120 }],
      },
    ],
    unbalanced_zh:
      '进 PVA 931.2 + 乙醛 116.4 + HCl 10 + NaOH 10.97 + 水 500 = 1568.57；出 缩醛化 PVA 1000。差 568.57 逐项点名：反应水 47.6（2 个 OH + 1 个乙醛 → 缩醛 + H₂O，12.5 环/100 单元）、中和水 4.94、NaCl 16.03（HCl + NaOH → NaCl + H₂O，均无条目）、洗涤水 500（无条目、不回收）。缩醛化度取 25 mol%：20 mol% 时 PVA 944/乙醛 94，30 mol% 时 PVA 919/乙醛 138',
  },

  {
    /**
     * **CAR 胶：缩醛化 PVA 945 + PAG 30（3 wt%）+ 三乙胺 5 + 乙醇 20 → 胶 1000。**
     *
     *   945 + 30 + 5 + 20 = 1000 ✓（逐项配平，没有余量）
     *
     * 三道工序：① 配液 20–40 °C / 100–300 kPa（酸厂，避光）
     * ② 过滤与静置消泡 20–40 °C（湿法槽；没有 0.2 µm 滤材 ⇒ pinhole 1–5，缺口③）
     * ③ 灌装（洁净室）
     *
     * 3 wt% PAG 是"够酸、又不把膜变成盐"的那一档；`gives` 的五格见文件头 §四。
     */
    id: 'make/car-resist',
    name: 'CAR Resist Production', name_zh: 'CAR 胶制备',
    produces: [
      {
        item: 'mat/car-resist',
        qty: q(1000),
        gives: [
          // PAG 3 wt% 的酸产率下把 60–200 nm 膜显透（声明值，缺口④）
          { param: 'sensitivity', kind: 'range', min: 10, max: 30 },
          // 0.5 wt% 三乙胺 ⇒ 8–12；上沿到 >10 仍要更小的 PAG（缺口①）
          { param: 'contrast', kind: 'range', min: 8, max: 12 },
          // 酸扩散 6–11 nm + 接触曝光 ⇒ 80–200 nm；16–32 nm 档差 2–5×（缺口②）
          { param: 'resolution', kind: 'range', min: 80, max: 200 },
          { param: 'thickness', kind: 'range', min: 60, max: 200 },
          // 没有 0.2 µm 滤材 ⇒ 1–5 /cm²（缺口③）
          { param: 'pinhole', kind: 'range', min: 1, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/acetalized-pva', qty: q(945) }] },
      {
        anyOf: [
          {
            item: 'mat/pag-triphenylsulfonium-otf',
            qty: q(30),
            // 3 wt% 的 PAG 在配胶温度上不能先分解（Td >180 °C 那一条）
            need: [{ param: 'thermalDecomposition', kind: 'range', min: 180, dir: 'atLeast' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'mat/triethylamine',
            qty: q(5),
            need: [{ param: 'waterContent', kind: 'range', max: 0.5, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/ethanol', qty: q(20) }] },
    ],
    // 洁净室由③灌装工序表达；写进 needs 会报 redundant_need（设备只由工序表达）。
    needs: [],
    steps: [
      {
        note_zh:
          '① 配液：**20–40 °C / 100–300 kPa**，避光搅拌 4–8 h 到全溶。3 wt% PAG 是重量法称的 —— 本层没有在线浓度计，配错一次整批报废（与 cmp-integration.ts:404 同一处"浓度测不了"）',
        performedBy: 'plant/acid-plant',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '② 过滤与静置消泡：**20–40 °C**，静置 12–24 h 让气泡浮掉。**没有 0.2 µm 膜滤芯**（本层最细是滤纸与硅藻土）⇒ 颗粒留在胶里、旋涂后就是针孔（缺口③）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '③ 灌装：洁净室里避光装瓶。本层**没有遮光瓶、也没有遮光涂层**这类条目 ⇒ 只能金属罐 + 遮光套（两者也未建条目）。避光的理由很硬：酸一旦被热/光提前放出来，胶就废了（缺口⑥）',
        performedBy: 'plant/clean-room',
      },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CAR_RESIST_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CAR_RESIST_ROUTES];
