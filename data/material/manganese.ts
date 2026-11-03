/**
 * 锰链 —— 65Mn 弹簧钢，以及它后面那个抱闸。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么要有这个文件
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `data/machine/robot.ts` 的伺服电机注释写的是"冲片铣槽叠压 → 绕线 →
 * **装编码器与抱闸** → 动平衡"，但抱闸这个条目一直不存在；
 * `unblock-arc-tilting.ts:142` 又把原因写死了："抱闸 要弹簧钢与摩擦片
 * （**弹簧钢的锰链没建**）"。
 *
 * 所以机器人身上缺的不是一条路线，是一整条链：
 *
 *   风化层 → 软锰矿精矿 → 高碳锰铁 → 65Mn 弹簧钢 → 抱闸 → 伺服电机 → 机器人
 *
 * 五段里前三段本文件补，第四段在 `data/machine/robot.ts` 的 `make/robot-brake`。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、富集比 114 : 1 —— 与铬同一个量级，靠重选
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 火星风化层 MnO **0.3–0.5 %**（APXS 量级，各着陆点同一档），按 0.45 % 计 ⇒
 * 锰 0.35 %。高碳锰铁要精矿锰 40 %：
 *
 *   1000 / 0.40 × 0.0035 = **114 286 kg 风化层** → 1000 kg 精矿 + 113 286 kg 尾矿
 *
 * 与铬的 140 : 1 同量级，但**不用浮选**：软锰矿 MnO₂ 比重 4.7–5.0，脉石
 * （长石、辉石）2.6–2.9，重选就分得开。这一条很要紧 —— 浮选药剂已有
 * `make/flotation-reagent` 路线（见 `ores.ts` 文件头），但重选不需要它；
 * 锰走重选，所以也不受药剂选择性的限制。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、碳热还原：与铬铁同一台矿热炉
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   MnO + C → Mn + CO      1 500–1 700 °C，强吸热
 *
 * 这正是 `plant/submerged-arc-furnace` 干的活 —— **不新增设备**，与
 * `make/ferrochrome` 同一条工艺、同一台炉子（铬铁 1 600–1 700 °C，锰铁
 * 取同一窗口）。差别只在温度更高一点、渣更碱（MnO 是碱性氧化物，
 * 渣里要 CaO 把 SiO₂ 压住，否则硅还原进合金）。
 *
 * 1000 kg 高碳锰铁（Mn 75 / Fe 15.7 / C 7.5 / Si 1.5 / P 0.25）的收支：
 *
 *   入  精矿 1875（MnO 967.5 → Mn 750、O 217.5；SiO₂ 500、CaO 300、Al₂O₃ 100.9）
 *       碳 254（还原用 179 + 进合金 75）
 *       铁 157（合金里的铁，矿里不够）
 *   出  锰铁 1000 · 一氧化碳 418 · 炉渣 868
 *
 *   能量那一侧：MnO 的标准生成焓 −385 kJ/mol，碳热还原约 +2.9 MJ/kg Mn；
 *   750 kg Mn 要 2 200 MJ ≈ 610 kWh，矿热炉按 3 000–4 000 kWh/t 合金是同一档。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、65Mn：在熔炼炉里合金化，不新增设备
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   C 0.62–0.70 · Mn 0.90–1.20 · Si 0.17–0.37 · S ≤0.035 · P ≤0.035，余铁
 *
 * 1000 kg 的配料（与 `make/steel-45` 同一个写法、同一台熔炼炉）：
 *
 *   铁 974.5 + 碳 5.5 + 高碳锰铁 14（带入锰 10.5、碳 1.05）
 *   + 75 硅铁 6（带入硅 2.7）
 *
 *   ⇒ 碳 (5.5 + 1.05) / 1000 = **0.655 %**、锰 **1.05 %**、硅 **0.27 %**，三格都在窗口内。
 *
 * 弹簧钢的要害不在成分，在**淬火回火后的硬度与脱碳层**：抱闸的弹簧是
 * 42–50 HRC 的碟形弹簧组，表面脱碳 0.05 mm 就够让它早期断裂。本层没有
 * 脱碳层量具（金相要镶嵌+抛光+腐蚀，本层有，但只能看，不能量深度），
 * 所以 65Mn 的 `hardness` 只交空窗口（"不限"也要写出来），
 * 硬度判据留给抱闸那一条自己写 `need`。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 已知缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① **火星上没有锰矿物的直接鉴定**：0.45 % 是 APXS 的元素量，不是 MnO₂ 的
 *     物相量。软锰矿、水锰矿、锰方解石在本层的分选行为不同，这里按软锰矿
 *     （比重最大、重选最好分）算，是**偏乐观**的一侧。
 *  ② **锰的收得率按 100 % 算**：实际矿热炉锰进渣 8–12 %，本文件没有渣中
 *     MnO 的量具（要滴定或 XRF），所以收支是设计值，不是实测。
 *  ③ **电极碳的增碳没有单列**：矿热炉自焙电极会往合金里带碳，本文件把
 *     碳全算在入料里。真实控制靠"碳量按合金碳反算"，方向相同。
 *  ④ **没有脱碳层深度量具**（见上）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const MANGANESE_ITEMS: readonly Item[] = [
  /**
   * 软锰矿精矿。重选富集 114 : 1，锰 40 %（以 MnO 计 51.6 %）。
   *
   * 与铬铁矿精矿同一个形态：按 kg 计，直接进矿热炉。
   */
  {
    id: 'mat/pyrolusite-concentrate',
    name: '软锰矿精矿',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'mn', kind: 'range', min: 35, max: 45, unit: '%', dir: 'atLeast' },
      { param: 'sio2', kind: 'range', min: 0, max: 30, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 高碳锰铁。锰 75 % · 铁 15.7 % · 碳 7.5 % · 硅 1.5 % · 磷 0.25 %。
   *
   * 它是 65Mn 的锰源；本层另有电解锰（`resistance-alloys.ts` 的
   * `make/manganese-electrolytic`，99.9 %），但那是给 manganin/constantan
   * 的，弹簧钢不需要那么纯，仍用锰铁。本文件没有电解锰路线。
   */
  {
    id: 'mat/ferromanganese',
    name: '高碳锰铁',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'mn', kind: 'range', min: 70, max: 80, unit: '%', dir: 'atLeast' },
      { param: 'carbon', kind: 'range', min: 6, max: 8, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 65Mn 弹簧钢。抱闸的碟形弹簧、离合器的膜片弹簧都是它。
   *
   * 成分见文件头；`hardness` 交空窗口 —— 定尺交货时是退火态（约 HB 200），
   * 淬火回火到 42–50 HRC 是抱闸那一条自己做，见缺口④。
   */
  {
    id: 'mat/steel-65mn',
    name: '65Mn 弹簧钢',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'carbon', kind: 'range', min: 0.62, max: 0.70, unit: '%' },
      { param: 'mn', kind: 'range', min: 0.90, max: 1.20, unit: '%' },
      // 退火态约 HB 200（≈13 HRC），淬火回火到 42–50 HRC —— 整段都在这块料的能力里，
      // 具体取哪一档由抱闸那一条的 `need` 定。
      { param: 'hardness', kind: 'range', min: 10, max: 55, unit: 'HRC' },
      { param: 'temper', kind: 'enum', values: ['annealed', 'quenched', 'tempered'] },
    ],
  },
];

export const MANGANESE_ROUTES: readonly Route[] = [
  {
    /**
     * 风化层重选到软锰矿精矿。0.35 % → 40 %，富集 114 : 1。
     *
     * 一吨精矿要挖 114 吨土 —— 与铬的 140 吨同一量级，比铜的八千吨便宜两个量级。
     *
     * 用什么分选：软锰矿比重 4.7–5.0，脉石 2.6–2.9，跳汰+摇床就够；不需要
     * 药剂，所以不受浮选药剂的选择性限制。
     */
    id: 'make/pyrolusite-concentrate',
    name: '风化层重选到软锰矿精矿制备',
    produces: [
      {
        item: 'mat/pyrolusite-concentrate',
        qty: q(1000),
        gives: [
          { param: 'mn', kind: 'range', min: 40, max: 40 },
          { param: 'sio2', kind: 'range', min: 26.7, max: 26.7 },
        ],
      },
      { item: 'mat/tailings', qty: q(113286) },
    ],
    uses: [{ anyOf: [{ item: 'mars/regolith', qty: q(114286) }] }],
    needs: [],
    performedBy: 'plant/ore-beneficiary',
  },
  {
    /**
     * 碳热还原到高碳锰铁。MnO + C → Mn + CO，1 600–1 700 °C。
     *
     * 入 精矿 1875 + 碳 254 + 铁 157 = 2286
     * 出 锰铁 1000 + 一氧化碳 418 + 炉渣 868 = 2286
     *
     * 与 `make/ferrochrome` 同一台矿热炉、同一条工艺 —— 差别在渣碱度：
     * MnO 是碱性氧化物，渣里 CaO 要够（精矿自带 300 kg）把 SiO₂ 压住，
     * 否则硅被还原进合金，锰铁的硅超标。
     */
    id: 'make/ferromanganese',
    name: '碳热还原到高碳锰铁制备',
    produces: [
      {
        item: 'mat/ferromanganese',
        qty: q(1000),
        gives: [
          { param: 'mn', kind: 'range', min: 75, max: 75 },
          { param: 'carbon', kind: 'range', min: 7.5, max: 7.5 },
        ],
      },
      {
        item: 'mat/co',
        qty: q(418),
        // 与铬铁那条同一个口径：炉气是一氧化碳，浓度够烧，不够算纯。
        gives: [{ param: 'purity', kind: 'range', min: 40, dir: 'atLeast' }],
      },
      { item: 'mat/slag', qty: q(868) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/pyrolusite-concentrate', qty: q(1875) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(254) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(157) }] },
    ],
    needs: ['plant/radiator'],
    performedBy: 'plant/submerged-arc-furnace',
    under: [{ param: 'temperature', min: 1600, max: 1700 }],
  },
  {
    /**
     * 65Mn 弹簧钢。在熔炼炉里合金化，与 `make/steel-45` 同一个写法。
     *
     * 铁 974.5 + 碳 5.5 + 高碳锰铁 14 + 75 硅铁 6 = 1000
     *
     * 三格都对得上：碳 0.655 %（窗口 0.62–0.70）、锰 1.05 %（0.90–1.20）、
     * 硅 0.27 %（0.17–0.37）。
     *
     * `hardness` 交空窗口：交货是退火态，淬火回火在抱闸那一条做。
     */
    id: 'make/steel-65mn',
    name: '65Mn 弹簧钢制备',
    produces: [
      {
        item: 'mat/steel-65mn',
        qty: q(1000),
        gives: [
          { param: 'carbon', kind: 'range', min: 0.62, max: 0.70 },
          { param: 'mn', kind: 'range', min: 0.90, max: 1.20 },
          { param: 'hardness', kind: 'range', min: 10, max: 55 },
          { param: 'temper', kind: 'enum', oneOf: ['annealed'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron', qty: q(1949, 2) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(11, 2) }] },
      { anyOf: [{ item: 'mat/ferromanganese', qty: q(14) }] },
      { anyOf: [{ item: 'mat/ferrosilicon-45', qty: q(6) }] },
    ],
    // 与 make/steel-45 同一个理由：小批量靠地面导热，连续生产才要风冷散热器。
    needs: [],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1550, max: 1650 }],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...MANGANESE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...MANGANESE_ROUTES];
