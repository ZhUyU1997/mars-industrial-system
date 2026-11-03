/**
 * 钼与锡 —— EUV 的两条金属链。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 这个文件在体系里的位置：把物料账先算清，不是要做 EUV
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 13.5 nm 要两样金属，各有各的理由：
 *
 *   钼  Mo/Si 多层膜反射镜里那一层"重"的。周期 6.8 nm = 钼 3.4 + 硅 3.4（Γ = 0.5），
 *       40–50 对。单层的反射率低到没有实用价值，靠 40–50 对同相叠加才到 70%。
 *       13.5 nm 的光几乎被所有材料强吸收（连空气都吸），所以 EUV 没有透镜可用 ——
 *       **只有反射镜**，而反射镜只能是多层膜。
 *   锡  液滴等离子体光源。Sn⁸⁺–Sn¹⁴⁺ 在 13.5 nm 附近有一串密集跃迁，
 *       它是全世界为这个波长专门挑的元素（不是"能用"，是"别的都不如它"）。
 *
 * 但**整机不在这一层的路上**，这一句要先说清：光刻的坡算成
 * M1（5 µm → 1 µm，5 年）、M2（→ 0.5 µm，5 年）、M3（ArF，500 年），EUV 在 M3 之外。
 * 所以这两条链的用处不是"做 EUV"，是回答一个更窄的问题：
 *
 *   **EUV 卡在材料上，还是卡在别处？**
 *
 * 算完的答案：**材料不是瓶颈，连量级都不是。**
 *
 *   一面 φ300 镜子的钼  = 0.0707 m² × 45 对 × 3.4 nm × 10.2 g/cm³ = **0.11 g**
 *   这 0.11 g 的钼       = 73 kg 风化层（下面那条链的单价）
 *   一台光源的锡         = 25 µm 液滴 × 50 kHz × 7.31 g/cm³ = 3 mg/s
 *                        = **0.26 kg/天** = 260 t 风化层/天
 *
 * 也就是说：**镜子那头是七十公斤土，光源那头是一天两百多吨土。**
 * 真正付不起的不是这两样金属，是 100 个 3.4 nm 层各 ±0.1 nm 的厚度控制、
 * 是 0.3 nm 的界面粗糙度、是能不能把它测出来 —— 见本文「降级」与「已知缺口」。
 *
 * ⚠️ 这里要顶住一个诱惑：**"贵"与"不可能"是两件事。** 钼和锡都造得出来，
 * 账在下面；造不出来的那部分是设备与测量，不在这两个条目里。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 钼的账：1.5 ppm → 50%，33.3 万 : 1
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 风化层含钼 0.5–2 ppm（题面给的实测区间），按 **1.5 ppm** 算账。
 * 辉钼矿 MoS₂ 含钼 59.9%，实际精矿 45–52% —— 按 **50%** 算。
 *
 *   400,000,000 kg 风化层（含钼 600 kg）→ 1200 kg 钼精矿（含钼 600 kg）
 *
 * 品位富集 **333,333 : 1**（0.50 / 1.5e-6）。折成一公斤钼：**667 吨风化层**；
 * 折成一公斤精矿：333 吨。
 *
 * 与表里已有的几条并排（口径：每公斤精矿要多少吨土 / 每公斤金属）：
 *
 *   铬   3000 ppm Cr₂O₃ → 42%    140 : 1        0.49 吨土/kg 铬（42% 折 28.7% Cr）
 *   镍      400 ppm → 10%        250 : 1          2.5 吨土/kg 镍
 *   铜       30 ppm → 25%      8,333 : 1           33 吨土/kg 铜
 *   钼      1.5 ppm → 50%    333,333 : 1          667 吨土/kg 钼   ← 本文件
 *   钨        1 ppm → 51.5%  515,000 : 1        1,000 吨土/kg 钨   ← tungsten.ts
 *   锡        1 ppm → 60%    600,000 : 1        1,000 吨土/kg 锡   ← 本文件
 *
 * ⚠️ **题面说"钼比钨更难"，算下来不是。** 钼 33.3 万 : 1 < 钨 51.5 万 : 1，
 * 一公斤钼 667 吨土 < 一公斤钨 1000 吨土 —— 钼反而便宜三分之一。理由只有一条：
 *
 *   钼是**硫化物**，浮选就是为这类矿发明的，精矿轻松做到 50%；
 *   钨是氧化物（白钨矿/黑钨矿），只能重选或磁选。
 *   富集比小，是**工艺好**，不是矿好。这两件事在这一层要一直分开。
 *
 * 而钼真正的难处也在这句话里：**浮选药剂**。选矿厂（data/material/refining.ts 的
 * `plant/ore-beneficiary`）的 `consumption` 里挂着 1 kg/2 h 的浮选药剂；现在
 * `mat/flotation-reagent` 已有 `make/flotation-reagent` 路线（黄药 + 丁醇），
 * 但丁醇起泡力与黄药选择性都低一档，松醇油/MIBC 仍没有。所以上面的 100% 回收是**理论下限**（与钨那条同一口径，
 * 让 1.5 ppm 一眼看得见），工业浮选是 85–90%，而本层只能干到重选水平：
 * 回收率按 50% 算，真实账单 **1333 吨土/kg 钼**。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 锡的账：1 ppm → 60%，60 万 : 1
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 风化层含锡 0.3–1 ppm，按 **1 ppm** 算（偏乐观那一端）。
 * 锡石 SnO₂ 含锡 78.8%，重选精矿 60–70% —— 按 **60%** 算。
 *
 *   600,000,000 kg 风化层（含锡 600 kg）→ 1000 kg 锡精矿（含锡 600 kg）
 *
 * 品位富集 **600,000 : 1**；折成一公斤锡 **1,000 吨风化层** —— 与钨并列全表最贵。
 * 后面两段还有收率（熔炼 95% × 电解 97% = 92%），所以一公斤**成品**锡
 * 是 1085 吨土（600,000,000 / 553）。
 *
 * 锡比钼贵一倍半，而富集比只差 1.8 倍 —— 差的不是品位，是**回收率**：
 * 锡石密度 7.0（硅酸盐 2.6–3.2），重选是对它最有效的办法，可细粒锡石在重选里
 * 跟着水走（"锡石不怕粗，只怕细"），而风化层恰恰是 0.1 mm 以下的粉。
 * 更难的是本层**连摇床都没有**：选矿线是浮选型的（浮选槽 + 浓缩机 + 过滤机），
 * 只能拿浮选槽停气当重选槽、拿浓缩机的水力分级当分级槽。
 * 同样按 100% 回收写理论下限，实际按 50% 算 → 真实账单 **2000 吨土/kg 锡**。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 降级：五处，每一处带量级（另有几处小的写在路线注释里）
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ① 钼粉纯度 99–99.5%，镜面级要 99.95–99.99%：杂质含量差 **10–50 倍**
 *    （0.5% 对 0.01%）。0.5% 就是每 200 个原子有一个不是钼，而 3.4 nm 的钼层
 *    只有约 11 个原子层（3.4 / 0.31 nm）—— 每一层里都能碰到外来原子。
 *    后果不是"不够纯"，是 80–100 个界面的散射一次一次乘起来。
 *
 * ② 氢气不纯：本层的氢是 99–99.5%（电解水 + 干燥；20 µm Pd 膜已建
 *    （`make/pd-membrane`），但本文件的气路还没接；分子筛仍未建）。
 *    38 kg 氢里 0.5–1% 是杂质，就是 0.19–0.38 kg 进 600 kg 钼粉：
 *    若全是氧，**320–630 ppm**；若全是水汽（含氧 89%），**281–563 ppm** ——
 *    都在 300–600 ppm 这一档。而钼粉的氧按 0.1%（1000 ppm）是常规上限，
 *    这一项吃掉四分之一到六成。这条降级写在 `make/molybdenum-powder` 的 `need` 上
 *    （要 99.9% 的氢，`onRelax: 'functional-kept'` —— 还原照做，只是粉里带氧）。
 *
 * ③ 只有粉，没有靶。溅射钼靶要把粉压到 99% 密度（真空热压 1500 °C、20 MPa、
 *    10 Pa 以下），本层凑不出这台：气氛炉给得起 1500 °C 与气密，压机给得起压力，
 *    两样不在同一台机器上。粉压的靶 90% 密度 —— **10% 是孔**，溅射时孔里打出的
 *    颗粒直接落在膜上。这一条按"换完还会不会做原来那件事"判：粉**不是**靶，是"换了东西"。
 *
 * ④ 锡纯度 99.9%（3N），光源级 99.999%（5N）：杂质差 **100 倍**（0.1% 对 0.001%）。
 *    而 EUV 光源最怕的正是杂物 —— 锡自己就是污染源：收集镜上每天沉积一层锡，
 *    工业上靠氢气流挡着，本层连膜厚都测不了。
 *
 * ⑤ 液滴发生器不在这一层。99.9% 的锡锭到 25 µm、50 kHz 液滴之间隔着整台机器：
 *    坩埚加热到 250 °C 以上、25 µm 喷孔（电火花或激光打孔）、压电扰动、
 *    横向位置稳到微米级。那 52 台已通设备里没有一台干这个活 ——
 *    光源要另造一台设备，而设备不在本文件的路线里（本文件只写金属）。
 *    就本文件交付的东西而言，按 #24 判：**锡锭不是液滴发生器，是换了东西**。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 已知缺口（写清卡在哪一步，不写"暂未实现"）
 * ═══════════════════════════════════════════════════════════════════════
 *
 * · 钼的深加工到粉为止：粉 → 靶 → 溅射成膜，两步都缺设备（降级③）。
 * · 焙烧的 801 kg SO₂ 不是废气，是**硫源**：data/material/ores.ts 已经有
 *   make/so3（420–450 °C）← make/sulfuric-acid。缺的是 600–700 °C 焙烧气到
 *   420–450 °C 转化器之间那一段除尘、干燥、鼓风 —— 本层没有写这条气路。
 * · 硅那一侧不在这里：`mat/silicon-wafer` 是单晶片，多层膜要的是溅射用多晶硅靶，
 *   而硅的靶材路线也没有。
 * · 多层膜真正的两个量（层厚 3.4 ± 0.1 nm、界面粗糙度 0.3 nm）在模型里没有位置。
 *   本层最光的面是硅片（手工抛 Ra < 5 nm，data/material/wafer.ts），差 17 倍；
 *   最平的平面是平晶（λ/4，约 0.1 µm 起伏），差 300 倍。属性系统能写这两个数，
 *   但没有一台设备能测 —— 照实写降级，不许为了绕过它去改判据。
 * · 顺带一件与本文件有关的事：`mat/tin` 有了之后，data/machine/unblock-thermocouple.ts
 *   那句"锡 232.0 °C — 没有 mat/tin 条目"成了**过去时**。
 *   那支热电偶的五个定点原来只剩水，现在多了一个够得着的金属定点（232.0 °C）——
 *   但要不要把它接进那条路线，是主 agent 的事，本文件不改别的文件。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const EUV_METAL_ITEMS: Item[] = [
  /**
   * 钼精矿。辉钼矿 MoS₂ 富集到含钼 50%，原矿 1.5 ppm。
   *
   * 它是硫化物，这件事在浮选里是好事：MoS₂ 天然疏水，是少数不加捕收剂也能上浮的
   * 矿物（工业上仍加煤油/松醇油）。而火星缺的恰恰是这一整套有机药剂 ——
   * 药剂挂在选矿厂的 `consumption` 上，不在本文件的路线上。
   *
   * 另外那 50% 是石英与长石脉石。它不参与后面任何反应：焙烧时原样留在炉底，
   * 随焙砂一起风选分掉（那 199 kg 走 `mat/tailings`）。
   */
  { id: 'mat/molybdenum-concentrate', name: 'Molybdenum Concentrate', name_zh: '钼精矿', unit: 'kg', category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' }] },

  /**
   * 三氧化钼。MoO₃，含钼 66.6%（95.95 / 143.95），钼的一切化合物的中间体。
   *
   * 它有个别处没有的脾气：**600 °C 起就明显升华**（熔点 795、沸点 1155）——
   * 所以焙烧出来的 MoO₃ 是烟，不是渣。烟冷下来是纯的，脉石留在炉底。
   * 这是全链唯一一次纯度**往上走**：精矿 50% → 氧化钼 99%。
   *
   * 66.6% 是后面每一步收缩的根：900 kg 氧化钼只出 600 kg 钼。
   */
  { id: 'mat/molybdic-oxide', name: 'Molybdenum Trioxide', name_zh: '三氧化钼', unit: 'kg', category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' }] },

  /**
   * 钼粉。氢气还原出来的灰色金属粉，粒度 1–5 µm，熔点 2623 °C。
   *
   * 它是本文件的两个终点之一 —— 而**终点是粉，不是靶**：见文件头降级③。
   * 高熔点在这里不构成优点也不构成缺点：做多层膜只要它的原子序数（42）
   * 与那 3.4 nm 的层厚（与硅的 14 差 28 个电子，界面的衬度就是这 28 挣来的），
   * 不要它的强度。
   */
  { id: 'mat/molybdenum-powder', name: 'Molybdenum Powder', name_zh: '钼粉', unit: 'kg', category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' }] },

  /**
   * 锡精矿。锡石 SnO₂ 重选富集到含锡 60%，原矿 1 ppm。
   *
   * 锡石密度 7.0 —— 硅酸盐的两倍多，这就是重选能成立的全部理由。
   * 剩下那 40% 是石英与铁氧化物：铁在熔炼时要石灰造渣，石英本来就是渣。
   */
  { id: 'mat/tin-concentrate', name: 'Tin Concentrate', name_zh: '锡精矿', unit: 'kg', category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' }] },

  /**
   * 粗锡。反射炉里碳还原出来的锡，含锡 95–99%，杂质是铁、铜、砷、铋。
   *
   * 它已经不是矿了，但还不能用：那几样杂质在锡里都不肯走 ——
   * 铁让锡变稠，砷与铜在浇铸时浮成硬壳，铋让凝固后的锡发脆。
   * 所以后面一定要有一道精炼（电解或火法），而本层只写得出电解那一条。
   */
  { id: 'mat/crude-tin', name: 'Crude Tin', name_zh: '粗锡', unit: 'kg', category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' }] },

  /**
   * 锡。电解精炼的阴极锡，99.9%（3N）。熔点 232.0 °C。
   *
   * 对 EUV 来说它只要一个性质：Sn⁸⁺–Sn¹⁴⁺ 在 13.5 nm 附近那一串跃迁。
   * 这条谱线不吃纯度（差 100 倍的杂质也换不掉它），吃**形态** —— 见降级⑤。
   *
   * 顺带一件与本行无关的事：232.0 °C 是本层第一个**有料**的金属定点
   * （data/machine/unblock-thermocouple.ts 第 133 行的"没有 mat/tin 条目"，
   * 现在过期了；铝 660.3 也有条目，只是不在那支热电偶的料表里；铅、锌连条目都没有）。
   * 锡在体系里还有另一半用处 —— 低温焊料与镀层 —— 也从这里起。
   */
  { id: 'mat/tin', name: 'Tin', name_zh: '锡', unit: 'kg', category: 'material',
    props: [{ param: 'purity', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' }] },
];

export const EUV_METAL_ROUTES: Route[] = [
  {
    /**
     * 钼精矿：风化层 4 亿公斤 → 精矿 1200 公斤。
     *
     *   风化层 4e8 × 1.5 ppm = 钼 600 kg
     *   600 / 0.50        = 精矿 1200 kg
     *   4e8 − 1200        = 尾矿 399,998,800 kg
     *
     * 品位富集 333,333 : 1；每公斤钼 667 吨土。**按 100% 回收写的理论下限**
     * （与钨那条同一口径）：工业浮选 85–90%，本层没有药剂只能按 50% 算，
     * 真实 1333 吨土/kg 钼。
     *
     * 浮选自带压力：0.6 kPa 下气泡一离开液面就膨胀几十倍，泡沫层撑不住 ——
     * 选矿厂 `holds` 的 100–300 kPa 就是为这一步准备的（与铜、镍、铬同一条）。
     */
    id: 'make/molybdenum-concentrate',
    name: 'Molybdenum Concentrate Production', name_zh: '钼精矿制备',
    produces: [
      { item: 'mat/molybdenum-concentrate', qty: q(1200), gives: [{ param: 'purity', kind: 'range', min: 45, max: 55, dir: 'atLeast' }] },
      { item: 'mat/tailings', qty: q(399998800) },
    ],
    uses: [{ anyOf: [{ item: 'mars/regolith', qty: q(400000000) }] }],
    needs: [],
    performedBy: 'plant/ore-beneficiary',
    under: [{ param: 'pressure', min: 100, max: 300 }],
  },
  {
    /**
     * 氧化焙烧：2MoS₂ + 7O₂ → 2MoO₃ + 4SO₂，600–700 °C。
     *
     *   精矿 1200 kg = MoS₂ 1001 + 脉石 199（精矿 50% 钼 → MoS₂ 是 1001 kg）
     *   1200 精矿 + 700 氧 → 900 三氧化钼 + 801 二氧化硫 + 199 尾矿
     *
     * 逐项核过：Mo 600 kg 进 900 kg MoO₃（600 × 143.95 / 95.95 = 900）；
     * S 401 kg 进 801 kg SO₂（401 × 64.06 / 32.06 = 801）；氧 700 kg =
     * MoO₃ 里的 300 + SO₂ 里的 400。
     * 进 1900、出 1900，正好平 —— 这在这一层不多见，因为脉石有地方去。
     *
     * 温区是这一步的全部讲究：**600–700 °C**。低了硫烧不掉（生成 MoO₂），
     * 高了 MoO₃ 挥发太快、在炉管后段结一层壳，收不回来。
     * 电阻炉 100–1100 的两头都够得着，所以这活儿归它，不占气氛炉。
     *
     * ⚠️ 但这台炉子的温度计是 T 型热电偶，只到 350 °C（data/machine/resistance-furnace.ts
     * 第 179 行写着"830 以上读不了"，T 型上限 350）。600–700 这一段没有读数：
     * 程序升温给的是"多久升到哪"的钟面，测温锥与火色给的才是"到了没有"。
     * 所以 600–700 是**能力的边界**，不是它能守住的精度 ——
     * 这一步能成，靠的是焙烧本身对温度不挑（±几十度都烧得掉硫）。
     *
     * 801 kg SO₂ 是本层最缺的东西之一（硫全锁在硫酸盐里），所以它不是废气：
     * ores.ts 的 make/so3 ← make/sulfuric-acid 是现成的下游，缺的是中间那段气路。
     */
    id: 'make/molybdic-oxide',
    name: 'Oxidizing Roast Production', name_zh: '氧化焙烧制备',
    produces: [
      { item: 'mat/molybdic-oxide', qty: q(900), gives: [{ param: 'purity', kind: 'range', min: 99, max: 99.5, dir: 'atLeast' }] },
      { item: 'mat/so2', qty: q(801) },
      { item: 'mat/tailings', qty: q(199) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/molybdenum-concentrate', qty: q(1200) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(700) }] },
    ],
    needs: [],
    performedBy: 'plant/resistance-furnace',
    under: [{ param: 'temperature', min: 600, max: 700 }],
  },
  {
    /**
     * 氢还原：MoO₃ + 3H₂ → Mo + 3H₂O，900–1000 °C。
     *
     *   900 三氧化钼 + 38 氢 → 600 钼粉 + 338 水
     *
     * 核一遍：900 / 143.95 = 6.252 kmol MoO₃ → 600 kg 钼（6.252 × 95.95）、
     * 18.76 kmol 氢（37.8 kg）、18.76 kmol 水（337.9 kg）。进 938、出 938。
     *
     * 工业上是两步：MoO₃ → MoO₂ 在 600–700，MoO₂ → Mo 在 900–1000。
     * 这里按总式写、一次给到 900–1000 —— 而这两步在这台炉子上只能**分段保温**：
     * 气氛炉的五件零件里没有热电偶（data/material/carbide.ts 第 108–110 行：
     * "没有能读 1450 的热电偶，只有火色"），曲线是"看火色 + 记时间"，不是程序升温。
     * 这一步能站住，靠的是钼的还原温度本来就宽（900–1000），不是炉子的控制精度。
     *
     * 气氛炉（600–2000 °C、氧 0–50 ppm）是这一步唯一的候选：氢气既是还原剂
     * 又是保护气，氧一进来，900 °C 的钼粉会自己烧起来。
     *
     * ⚠️ 氢不纯那一笔账写在 `need` 上：本层的氢是 99–99.5%（20 µm Pd 膜已建
     * （`make/pd-membrane`），但本文件的气路还没接；分子筛仍未建），
     * 差 0.5–1% → 320–630 ppm 的氧进粉（见文件头降级②）。这不是"要求高了"，
     * 是这条路线**真的做不到** 99.9% —— 而 `onRelax: 'functional-kept'` 说的是
     * 实话：还原照做，粉里带氧。
     */
    id: 'make/molybdenum-powder',
    name: 'Hydrogen Reduction', name_zh: '氢还原',
    produces: [
      { item: 'mat/molybdenum-powder', qty: q(600), gives: [{ param: 'purity', kind: 'range', min: 99, max: 99.5, dir: 'atLeast' }] },
      { item: 'mat/water', qty: q(338), gives: [{ param: 'conductivity', kind: 'range', min: 1, max: 50 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/molybdic-oxide', qty: q(900) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(38), need: [{ param: 'purity', kind: 'range', min: 99.9, dir: 'atLeast' }], onRelax: 'functional-kept' }] },
    ],
    needs: [],
    performedBy: 'plant/atmosphere-furnace',
    under: [
      { param: 'temperature', min: 900, max: 1000 },
      { param: 'oxygen_ppm', min: 0, max: 50 },
    ],
  },
  {
    /**
     * 锡精矿：风化层 6 亿公斤 → 精矿 1000 公斤。
     *
     *   风化层 6e8 × 1 ppm = 锡 600 kg
     *   600 / 0.60        = 精矿 1000 kg
     *   6e8 − 1000        = 尾矿 599,999,000 kg
     *
     * 品位富集 600,000 : 1；每公斤锡 1000 吨土 —— 与钨并列全表最贵。
     * 同样按 100% 回收写理论下限：工业重选 70–80%，本层连摇床都没有，
     * 只能按 50% 算，真实 2000 吨土/kg 锡。
     *
     * 锡石密度 7.0 让它成为重选最理想的对象，而风化层 0.1 mm 的粒度又让它
     * 成为重选最糟糕的料 —— 这一对矛盾就是锡比钼贵一倍半的全部原因。
     */
    id: 'make/tin-concentrate',
    name: 'Tin Concentrate Production', name_zh: '锡精矿制备',
    produces: [
      { item: 'mat/tin-concentrate', qty: q(1000), gives: [{ param: 'purity', kind: 'range', min: 55, max: 65, dir: 'atLeast' }] },
      { item: 'mat/tailings', qty: q(599999000) },
    ],
    uses: [{ anyOf: [{ item: 'mars/regolith', qty: q(600000000) }] }],
    needs: [],
    performedBy: 'plant/ore-beneficiary',
    under: [{ param: 'pressure', min: 100, max: 300 }],
  },
  {
    /**
     * 还原熔炼：SnO₂ + 2C → Sn + 2CO，1200–1300 °C，石灰造渣。
     *
     *   精矿 1000 = 锡石 762 + 脉石 238
     *   1000 精矿 + 116 碳 + 60 石灰 → 570 粗锡 + 270 一氧化碳 + 336 炉渣
     *
     * 核一遍：锡石 762 里有 162 kg 氧；570 kg 锡被还原出来，带走 154 kg 氧
     * （162 × 570/600 = 154），剩下 8 kg 氧跟着 30 kg 锡留在渣里（合 SnO₂ 38）。
     * 154 × 12.011/15.999 = 115.6 → 碳 116，出 CO 270（154 + 116 = 270）。
     * 渣 = 脉石 238 + 石灰 60 + 那 38 kg 未还原的锡石 = 336。进 1176、出 1176。
     *
     * 温度是反过来的那件事：锡 232 °C 就化，可**还原**要 1200 以上 ——
     * 难的不是化锡，是从 SnO₂ 里把氧夺走。所以这条路线与炼铜、炼铁同一档温度，
     * 归熔炼炉（1200–1650）而不归烘干用的土窑。
     *
     * 石灰是必需的：脉石里的石英没有碱性熔剂就不熔，渣不流动，锡珠嵌在渣里出不来。
     * 60 kg 是按渣里 CaO 20% 定的：脉石里的 SiO₂ 约 170，CaO/SiO₂ = 0.35。
     *
     * ⚠️ 这个碱度偏低（工业锡渣的 SiO₂ 在 25–35%，这一炉是 57%）：渣更黏，
     * 锡珠带走的更多 —— 这正是"600 kg 锡只有 570 进金属"的理由：
     * 30 kg 锡以 SnO₂ 留在渣里（5%）。工业锡冶炼的渣中损失也在 5–10% 这一档，
     * 而本层没有锡渣这个条目，所以那 30 kg 只能跟着 `mat/slag` 走。
     */
    id: 'make/crude-tin',
    name: 'Reduction Smelting', name_zh: '还原熔炼',
    produces: [
      { item: 'mat/crude-tin', qty: q(570), gives: [{ param: 'purity', kind: 'range', min: 95, max: 99, dir: 'atLeast' }] },
      { item: 'mat/slag', qty: q(336) },
      { item: 'mat/co', qty: q(270), gives: [{ param: 'purity', kind: 'range', min: 30, max: 45, dir: 'atLeast' }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/tin-concentrate', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(116) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(60) }] },
    ],
    needs: [],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1200, max: 1300 }],
  },
  {
    /**
     * 火法精炼：粗锡 95–99% → 98–99%，给电解做阳极。
     *
     * 锡 232 °C 就化，250–350 °C 下氧化渣上浮，捞掉铁/砷/铜的浮渣即可。
     * 本层用电炉（`plant/resistance-furnace`，100–1100 °C）当锡锅；
     * 不新增设备。1000 kg 粗锡 → 950 kg 精炼锡 + 50 kg 浮渣（未计条目）。
     *
     * 这一步是 `make/tin` 的前置：电解阳极要 98%+，粗锡只到 95–99%。
     */
    id: 'make/tin-fire-refined',
    name: 'Pyrometallurgical Refining', name_zh: '火法精炼',
    produces: [
      { item: 'mat/crude-tin', qty: q(950), gives: [{ param: 'purity', kind: 'range', min: 98, max: 99, dir: 'atLeast' }] },
      {
        item: 'mat/tin-dross',
        qty: q(50),
        gives: [
          { param: 'tin', kind: 'range', min: 40, max: 70 },
          { param: 'iron', kind: 'range', min: 5, max: 20 },
          { param: 'form', kind: 'enum', oneOf: ['solid'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/crude-tin', qty: q(1000) }] },
    ],
    needs: [],
    performedBy: 'plant/resistance-furnace',
    under: [{ param: 'temperature', min: 250, max: 350 }],
    unbalanced_zh: '1000 kg 95–99% 粗锡 → 950 kg 98–99% 精炼锡 + 浮渣 50（已单列 mat/tin-dross，可回锡精炼）',
  },
  {
    /**
     * 电解精炼：粗锡做阳极，纯锡沉积到阴极，50–70 °C。
     *
     *   570 粗锡 → 553 精锡 + 11 阳极泥；余 6 kg 溶进电解液
     *
     * 回收 97%（铜那条是 96%，同一口径）。阳极泥只有 2%：锡电解的泥本来就少
     * （铜、铋、砷在那里），真正麻烦的是溶进电解液的那一部分 ——
     * 而本层**没有电解液净化**（要真空蒸馏或硫化沉淀），所以电解液是会"中毒"的。
     *
     * ⚠️ 阳极纯度那一条 `need` 是本链又一处降级：工业上先火法精炼到 98% 以上
     * 再上电解，本层没有火法精炼那台（要熔锡锅 + 捞渣，锡 232 °C 就化，反而好做，
     * 但设备与路线都不在），阳极只能拿粗锡的 95% 顶着 —— 多出来的 3% 铜铁砷
     * 全进电解液。`functional-kept`：还是精炼，只是电解液寿命按星期算。
     */
    id: 'make/tin',
    name: 'Electrolytic Refining', name_zh: '电解精炼',
    produces: [
      { item: 'mat/tin', qty: q(553), gives: [{ param: 'purity', kind: 'range', min: 99.9, max: 99.99, dir: 'atLeast' }] },
      { item: 'mat/anode-sludge', qty: q(11) },
      { item: 'mat/tin', qty: q(6), gives: [{ param: 'purity', kind: 'range', min: 99.9, max: 99.99, dir: 'atLeast' }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/crude-tin', qty: q(570), need: [{ param: 'purity', kind: 'range', min: 98, dir: 'atLeast' }], onRelax: 'functional-kept' }] },
    ],
    needs: [],
    performedBy: 'plant/electrorefining',
    under: [{ param: 'temperature', min: 50, max: 70 }],
    unbalanced_zh: '570 粗锡 → 553 精锡 + 11 阳极泥 + 电解液锡渣 6（已单列 mat/tin，回收）',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...EUV_METAL_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...EUV_METAL_ROUTES];
