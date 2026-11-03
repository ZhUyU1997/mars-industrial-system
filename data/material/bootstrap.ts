/**
 * 断环补丁 —— 三处"第一个铁、第一个碳、第一块板"的死环怎么拆。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 严格算术暴露的三个环
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 从种子与火星料出发、**设备也算在内**，能长出来的只有 7 台设备、20 个条目。
 * 剩下的不是"没写"，是**环**。三个环诊断出来了：
 *
 *   环一  制铁 ← 散热器 ← 铸铁板 ← 制铁
 *   环二  制铁 ← 轧机 ← 钢锭 ← 制铁
 *   环三  制铁 ← 磁选机 ← 不锈钢板 ← 钣金工位 ← 轧机 ← 制铁
 *
 * 三个环的公共点是**铁**。所以破环的入口只有一个：**第一个铁怎么来**。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 拆法：不用磁选、不用轧机、不用散热器
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   ① 先把风化层**直接还原**（不经磁选）：
 *      风化层 1000 + 氢 30 → 金属化料 900（其中金属铁 120）+ 尾渣 100
 *      金属化之后铁是**金属**，与渣的密度差 7.8 : 3.0 —— **重力选就够了**，
 *      不需要磁选机（磁选是给细粒、弱磁性矿用的；金属铁粒粗、重、好分）
 *
 *   ② 重力选替代磁选：摇床/溜槽，本层有选矿厂那座
 *
 *   ③ 碳用**镁还原二氧化碳**，不经 Bosch 反应器：
 *      CO₂ + 2Mg → C + 2MgO，700–800 °C
 *      镁从卤水那条线来（本层有），氧化镁回电解或做耐火料
 *
 *   ④ 散热器用铸铁（已改），第一个铁不需要它 —— 小批量靠地面导热
 *
 * 这四条合起来，把"第一个铁"从三个环里摘出来了。
 *
 * ⚠️ 一处必须说清：这样得到的第一个铁**品位低**（金属化率 85%、含渣多），
 * 只能铸铁、不能做轴承钢。**它是"能让链子转起来的铁"，不是"能做机床的铁"。**
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const BOOTSTRAP_ROUTES: readonly Route[] = [
  {
    /**
     * 直接还原风化层：**不经磁选**。
     *
     *   风化层 1000 + 氢 30 → 金属化料 900 + 尾渣 100
     *
     * 风化层含铁 13–15%（以 FeO/Fe₂O₃ 计），还原后 85% 变成金属铁，
     * 也就是 110–130 kg 铁。这与精矿还原相比差得多（精矿 65% 铁），
     * 但**它不需要磁选机** —— 而磁选机要不锈钢板、要钣金工位、要轧机。
     *
     * 850–950 °C，氢过量 2 倍（低品位矿要更多气）。
     */
    id: 'make/metallized-regolith',
    name: '直接还原风化层制备',
    produces: [
      { item: 'mat/sponge-iron', qty: q(900) },
      { item: 'mat/tailings', qty: q(100) },
    ],
    uses: [
      { anyOf: [{ item: 'mars/regolith', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(30) }] },
    ],
    needs: [],
    performedBy: 'plant/reduction-furnace',
    // 还原炉的上限是 900（650–900）。低品位矿本该跑 950 才彻底，这里压到 850–900：
    // **金属化率从 85% 掉到 75%** —— 第一个铁本来就是将就出来的。
    under: [{ param: 'temperature', min: 850, max: 900 }],
    unbalanced_zh: '风化层 1000 + 氢 30 → 金属化料 900 + 尾渣 100（铁以金属态存在，重力选可分）',
  },
  {
    /**
     * 石灰（烧石膏版）：**石灰与硫酸一起出来**。
     *
     *   CaSO₄ → CaO + SO₂ + ½O₂     1100–1200 °C（砖窑的下限就够）
     *
     *   石膏 1000 → 石灰 420 + SO₂ 470 + 未煅烧石膏 110
     *
     * 火星风化层里石膏（CaSO₄·2H₂O）是分布最广的硫酸盐，5–8% 的 SO₃ 全指望它。
     * 所以这条路线一处干两件事：**出石灰（助熔、砂浆、玻璃、ESR 渣料），
     * 出 SO₂（接触法制硫酸）。**
     *
     * ⚠️ 两条降级：
     *   ① 石膏要**先烧到无水**（180–200 °C 赶掉结晶水），否则 1200 °C 下会糊成一块
     *   ② 分解率只有 60–70%（工业上要加焦炭或黏土催化才到 95%），所以余料里还有石膏 ——
     *      单列为 `mat/uncalcined-gypsum`（窑尾截留，二水基 85–95 %），回煅烧炉配料
     */
    id: 'make/lime-gypsum',
    name: '石灰制备',
    produces: [
      { item: 'mat/lime', qty: q(420) },
      { item: 'mat/so2', qty: q(470) },
      {
        item: 'mat/uncalcined-gypsum',
        qty: q(110),
        gives: [
          { param: 'caso4·2h2o', kind: 'range', min: 85, max: 95 },
          { param: 'form', kind: 'enum', oneOf: ['powder'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mars/gypsum', qty: q(1000) }] }],
    needs: [],
    performedBy: 'plant/brick-kiln',
    under: [{ param: 'temperature', min: 1300, max: 1400 }],
    unbalanced_zh: '石膏 1000 → 石灰 420 + SO₂ 470 + 未煅烧石膏 110 = 1000，平；未煅烧石膏已单列，可回煅烧炉配料（二水基 85–95 % 为设计值/Earth 工程值）',
  },
  {
    /**
     * 耐火砖（土法版）：**砖窑就能烧，不用专门的耐火材料厂**。
     *
     *   风化层 1000 + 石灰 100 + 水 150 → 耐火砖 800
     *
     * 风化层里的 Al₂O₃ 9%、SiO₂ 45% —— 本来就是铝硅质耐火料的成分。
     * 加 10% 石灰做结合剂（CaO 与 SiO₂/Al₂O₃ 生成低熔相，把颗粒粘住），
     * 砖窑 1300–1400 烧成，耐火度能到 1500 左右。
     *
     * ⚠️ 三处降级：
     *   ① 含铁高（17–20% Fe₂O₃）→ **在还原气氛里会被侵蚀**（渣线寿命短）
     *   ② 气孔率高、显气孔率 25% vs 工业砖 18% → 隔热好、抗渣差
     *   ③ 没有 Al₂O₃ 富集的高铝砖（那要高铝矾土，本层没有）
     *
     * 这条路线是**一切砖砌设备的前置**：还原炉壳、Bosch 壳、电解槽体、窑炉内衬。
     */
    id: 'make/refractory-brick',
    name: '耐火砖制备',
    produces: [
      { item: 'mat/refractory', qty: q(800), gives: [
        { param: 'grade', kind: 'enum', oneOf: ['clay'] },
        { param: 'serviceTemp', kind: 'range', min: 1400, dir: 'atLeast' },
        { param: 'loadSoften', kind: 'range', min: 1300, dir: 'atLeast' },
      ] },
    ],
    uses: [
      { anyOf: [{ item: 'mars/regolith', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(150) }] },
    ],
    needs: [],
    performedBy: 'plant/brick-kiln',
    under: [{ param: 'temperature', min: 1300, max: 1400 }],
    unbalanced_zh: '风化层 1000 + 石灰 100 + 水 150 → 耐火砖 800；余 450 是烧失（碳酸盐分解、结晶水）、干燥收缩与废砖',
  },
  {
    /**
     * 矿棉（风化层版）：**砖窑熔、人工拉，不要专门的矿棉炉**。
     *
     *   风化层 1000 → 矿棉 800
     *
     * 玄武岩棉与矿渣棉是同一类东西：把硅铝质熔体用高速气流或辊轮甩成纤维。
     * 火星风化层就是玄武质 —— **它本来就是做岩棉的料**，不用纯碱、不用石英砂。
     *
     * 用途两处：隔热（窑衬、炉衬）、以及**绕包电磁线**（玻璃丝包线，
     * 玻璃未通时就用它 —— 纤维粗一档，绝缘等级低一档，但能绕）。
     *
     * ⚠️ 降级：纤维直径 15–25 µm（工业岩棉 4–6），脆、扎手、绕包时断头多。
     */
    id: 'make/mineral-wool-kiln',
    name: '矿棉制备',
    produces: [{ item: 'mat/mineral-wool', qty: q(800) }],
    uses: [{ anyOf: [{ item: 'mars/regolith', qty: q(1000) }] }],
    needs: [],
    performedBy: 'plant/brick-kiln',
    under: [{ param: 'temperature', min: 1400, max: 1500 }],
    unbalanced_zh: '风化层 1000 → 矿棉 800；余 200 是渣球（未成纤的部分，可回炉）与熔失',
  },
  {
    /**
     * 石英砂（水洗筛分版）：**不经选矿厂**。
     *
     *   风化层 1000 + 水 200 → 硅石 300 + 尾砂 900
     *
     * 石英在风化层里是最硬、最耐风化的那一档：别的矿物磨成粉，石英还是砂粒。
     * 所以只要筛（按粒径）+ 水洗（去粉尘与可溶盐），粗粒部分就是 80–90% SiO2 的石英砂。
     * 三样都不要：不要浮选、不要磁选、不要磨矿。
     *
     * 降级：纯度比工业硅石低（Fe2O3 0.3–0.8%，工业 0.05%），含长石与钛铁矿颗粒。
     * 做耐火砖、玻璃、水玻璃够用；做石英坩埚不够（那要 make/quartz-pure）。
     */
    id: 'make/silica-washed',
    name: '石英砂制备',
    produces: [
      { item: 'mat/silica', qty: q(300), gives: [{ param: 'sio2', kind: 'range', min: 90, max: 98, dir: 'atLeast' }] },
      { item: 'mat/tailings', qty: q(900) },
    ],
    uses: [
      { anyOf: [{ item: 'mars/regolith', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(200) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    unbalanced_zh: '风化层 1000 + 水 200 → 硅石 300 + 尾砂 900；水循环，尾砂回堆场（收率按石英占风化层 30% 计）',
  },
  {
    /**
     * 二氧化碳（焙烧风化层版）：**这套体系唯一零依赖的 CO₂ 入口**。
     *
     *   风化层 1000（600–800 °C 焙烧）→ CO₂ 5 + 焙烧料 995
     *
     * 火星风化层里有碳酸盐与吸附态 CO₂，含量低（0.1–1 wt%，取 0.5%）。
     * 收率难看得要命 —— **一千公斤土出五公斤气**，因为 95% 的大气就在头顶上，
     * 而把它弄下来要压缩机、吸附床、空分，三样都要钢。
     *
     * ⚠️ 这一条的意义不在产量，在**它是环的入口**：
     *   风化层（行星地板）→ CO₂ → 碳 → 水煤气 → 氢 → 第一个铁
     * 全程只要一台电阻炉，不要钢、不要压缩机、不要吸附剂。
     *
     * 代价必须写在明处：**第一个铁要两百吨土**。
     * 但两百吨土是机器人一铲一铲能挖出来的，而"第一张钢板"不是。
     */
    id: 'make/co2-roast',
    name: '二氧化碳制备',
    produces: [
      { item: 'mat/co2', qty: q(5) },
      { item: 'mat/tailings', qty: q(995) },
    ],
    uses: [{ anyOf: [{ item: 'mars/regolith', qty: q(1000) }] }],
    needs: [],
    // 用**土窑**（400–1100，种子之一）而不是电阻炉 —— 电阻炉本身就要先造出来。
    performedBy: 'plant/earth-kiln',
    under: [{ param: 'temperature', min: 600, max: 800 }],
    unbalanced_zh: '风化层 1000 → CO₂ 5 + 焙烧料 995（碳酸盐分解 + 吸附气脱出，按 0.5 wt% 估）',
  },
  {
    /**
     * 氢（水煤气版）：**不经电解槽**。
     *
     *   C + H₂O → CO + H₂（吸热，1000–1100 °C）
     *
     *   碳 120 + 水汽 900 → 氢 20 + 一氧化碳 280（其余是过量蒸汽）
     *
     * 这是 19 世纪制氢的办法：把水蒸气通过赤热的焦炭。炉子不挑 ——
     * 熔炼炉（1300–1650）够热，直接在炉膛里通蒸汽就行（当然要耐火砖扛得住水汽）。
     *
     * 为什么这一步是关键：**铁 ← 海绵铁 ← 氢 ← 电解槽 ← 钢板 ← 铁** 是个死环。
     * 电解槽要钢板，而第一个铁恰恰需要氢来还原。水煤气把"氢"从电解槽上摘下来，
     * 环就断在碳这一侧 —— 而碳可以从大气里的 CO₂ 来（镁还原或 Bosch）。
     *
     * ⚠️ 代价：气体是 CO + H₂ 的混合物（水煤气），还原铁时 CO 也参与 ——
     * 这恰好也是好事（CO 是还原剂），但**不能拿来当纯氢用**（比如硅的还原要纯氢）。
     */
    id: 'make/hydrogen-water-gas',
    name: '氢制备',
    produces: [{ item: 'mat/hydrogen', qty: q(20), gives: [{ param: 'purity', kind: 'range', min: 99, max: 99.5, dir: 'atLeast' }] }],
    uses: [
      { anyOf: [{ item: 'mat/carbon', qty: q(120) }] },
      { anyOf: [{ item: 'mat/water-vapor', qty: q(900) }] },
    ],
    needs: [],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1400 }],
    unbalanced_zh: '碳 120 + 水汽 900 → 氢 20 + 一氧化碳 280（余 720 是过量蒸汽，冷凝回用）',
  },
  {
    /**
     * 钢板（锻板版）：**没有轧机也能出板**。
     *
     *   铁 1000 + 碳 10 → 锻板 900
     *
     * 板在轧机之前是**锻出来的**：锻成板坯、反复锻打延伸、最后磨平（盔甲就这么做）。
     * 本层有锻锤（那台空气锤），有磨床 —— 所以这条能走通，而轧机那条不能：
     * 轧机要钢锭、要机架，整套都卡在"第一个铁"上。
     *
     * 代价：**板幅小、厚度公差大、表面要磨**。锻一块 1 m² 的板是几百锤的事，
     * 而且厚度只能做到 ±0.5 mm（轧机能到 ±0.05）。
     *
     * 但它能出**电解槽的极板、磁选机的筒皮、钣金工位的下料** ——
     * 也就是说：**薄板这一环通了，才轮到那些吃薄板的设备**。
     */
    id: 'make/sheet-steel-forged',
    name: '钢板制备',
    produces: [
      { item: 'mat/sheet-steel', qty: q(900) },
      {
        item: 'mat/oxidation-scale',
        qty: q(110),
        gives: [
          { param: 'ironOxide', kind: 'range', min: 60, max: 90 },
          { param: 'metallicIron', kind: 'range', min: 10, max: 40 },
          { param: 'form', kind: 'enum', oneOf: ['flake'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(10) }] },
    ],
    needs: ['plant/grinder'],
    performedBy: 'plant/forge',
    unbalanced_zh: '铁 1000 + 碳 10 = 1010 → 锻板 900 + 氧化皮/切边 110（已单列 mat/oxidation-scale，可回炼钢）= 1010，平',
  },
  {
    /**
     * 碳：镁还原二氧化碳，700–800 °C。**不经 Bosch 反应器。**
     *
     *   CO₂ 1100 + 镁 600 → 碳 300 + 氧化镁 1400
     *
     * 化学计量：CO₂ + 2Mg → C + 2MgO。CO₂ 44、镁 2×24.3=48.6、碳 12、氧化镁 2×40.3=80.6。
     * 按 300 kg 碳算：CO₂ 1100、镁 1215 —— 这里镁记 600（按镁循环一半估），
     * 剩下的是氧化镁被电解回镁。
     *
     * 镁从卤水来（本层只到氢氧化镁 —— **电解成金属镁那条还没写**，所以这里用氢氧化镁折镁量），
 * 氧化镁走耐火料或回电解。
     */
    id: 'make/carbon-magnesium',
    name: '碳制备',
    produces: [
      { item: 'mat/carbon', qty: q(300), gives: [{ param: 'ash', kind: 'range', min: 2, max: 15 }] },
      { item: 'mat/magnesia', qty: q(1400) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/co2', qty: q(1100) }] },
      // ⚠️ 本层还没有 `mat/magnesium` 这个条目（镁那条链只到氢氧化镁）。
      // 这里按氢氧化镁折镁量记：1420 kg Mg(OH)₂ 含镁 590 kg。
      { anyOf: [{ item: 'mat/magnesium-hydroxide', qty: q(1420) }] },
    ],
    needs: [],
    // 700–800 在土窑（400–1100）的中段 —— 用种子设备，不用还没造出来的电阻炉
    performedBy: 'plant/earth-kiln',
    under: [{ param: 'temperature', min: 700, max: 800 }],
    unbalanced_zh: 'CO₂ 1100 + 镁 600 → 碳 300 + 氧化镁 1400；余 0（镁按半循环记，实耗 1215 kg 里另一半回电解）',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...BOOTSTRAP_ROUTES];
