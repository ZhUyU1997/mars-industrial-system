/**
 * 钨 —— 刀片的复制路线。从风化层里的 1 ppm 起步。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 先把账算清楚：钨是真的贵，但不是拿不到
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 火星风化层里钨 1 ppm 量级（地球地壳 1.25 ppm，火星实测更贫）。
 * 一个 65% WO₃ 的精矿含钨 51.5%，所以：
 *
 *   1000 kg 钨精矿  ←  515,500 kg 风化层
 *
 * 也就是 **每公斤精矿要动半吨土**。折算到一公斤纯钨：1,000,000 kg 风化层。
 *
 * 这个数放在材料账里是什么位置？铜是 34,722。**钨比铜贵 29 倍。**
 *
 * 所以钨不是"拿不到"，是"贵 29 倍" —— 与钒（500:1 富集）同一类问题：
 * **造得出，只是要从大得多的土方量里抠。**
 *
 * ⚠️ 一处坦白：上一版把刀片留在种子里的理由是"钨不到 1 ppm，浓集一万倍才有
 * 意义"。那句话是对的，但它推不出"只能运" —— 一万倍浓集只是贵，不是不可能。
 * 混淆"贵"与"不可能"，是这一层最容易被含混过去的地方。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 四步：矿 → 氧化物 → 粉 → 碳化物 → 刀片
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   WO₃ + 3H₂ → W + 3H₂O        700–1000 °C，氢气还原
 *   W + C → WC                  1400–2000 °C，碳化
 *   WC + Ni → 刀片               1400–1500 °C，烧结
 *
 * 三步全在石墨管气氛炉里做（氢气保护、最高 2000 °C）—— 那一台设备是上一轮
 * 为硬质合金回收补的，这一轮它成了主设备。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 粘结剂用镍，不用钴
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 工业硬质合金是 WC-Co。火星没有钴的条目（风化层 20–40 ppm，比钨好不了多少），
 * 而有电解镍（2,500 kg 风化层/kg，比钴便宜一个量级）。
 *
 * WC-Ni 是真实的材料：耐蚀性好、韧性差一档，工业上用于耐磨件与部分刀具。
 * 所以这里做的是 **WC-Ni 刀片** —— 第七次降级使用。
 *
 * 代价：抗弯强度比 WC-Co 低约 20%，断续切削容易崩刃。车连续外圆可以，
 * 车键槽不行。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const TUNGSTEN_ITEMS: readonly Item[] = [
  /**
   * 钨精矿（白钨矿型，65% WO₃）。从风化层重选富集。
   *
   * 白钨矿（CaWO₄）比重 6.1，比重大，重选与磁选都吃得住 —— 这与铬铁矿
   * 同一种富集方式，只是比例更极端（51.5 万比 1）。
   */
  { id: 'mat/tungsten-concentrate', name: 'Tungsten Concentrate', name_zh: '钨精矿', unit: 'kg', category: 'material' },

  /**
   * 三氧化钨（WO₃）。黄色粉末，钨的一切化合物的中间体。
   *
   * 钨含量 79.3%，所以后面每一步的收缩都很厉害 —— 从 1000 kg WO₃
   * 只出 793 kg 钨。
   */
  { id: 'mat/tungstic-oxide', name: 'Tungsten Trioxide', name_zh: '三氧化钨', unit: 'kg', category: 'material' },

  /** 钨粉。氢气还原出来的灰色金属粉，粒度决定后面碳化的快慢。 */
  { id: 'mat/tungsten-powder', name: 'Tungsten Powder', name_zh: '钨粉', unit: 'kg', category: 'material' },

  /**
   * 碳化钨（WC）。钨与碳在 1400–2000 °C 化合，硬度仅次于金刚石（莫氏 9+）。
   *
   * 它就是刀片"硬"的来源 —— 而硬的东西磨不动，这是后面刃磨卡住的根。
   */
  { id: 'mat/tungsten-carbide', name: 'Tungsten Carbide', name_zh: '碳化钨', unit: 'kg', category: 'material' },
];

export const TUNGSTEN_ROUTES: readonly Route[] = [
  {
    /**
     * 钨精矿：风化层 515,500 → 精矿 1000。
     *
     * 按钨 1 ppm、精矿含钨 51.5% 算，理论下限是 51.5 万比 1（515,000 kg 土/kg 精矿）。
     * 实际富集率按 70% 计要再乘 1.4 —— 这个数是**理论下限**，
     * 与氧化铝那条同一口径（让"1 ppm"这件事一眼看得见）。
     *
     * 余下 514,999,000 kg 是重选尾砂，回到尾矿那一类。
     */
    id: 'make/tungsten-concentrate',
    name: 'Tungsten Concentrate Production', name_zh: '钨精矿制备',
    produces: [
      { item: 'mat/tungsten-concentrate', qty: q(1000) },
      { item: 'mat/tailings', qty: q(514999000) },
    ],
    uses: [{ anyOf: [{ item: 'mars/regolith', qty: q(515000000) }] }],
    needs: [],
    performedBy: 'plant/ore-beneficiary',
    unbalanced_zh:
      '515000000 风化层（按钨 1 ppm、精矿含钨 51.5% 算）→ 1000 钨精矿 + 重选尾砂 514999000（已单列 mat/tailings）',
  },
  {
    /**
     * 三氧化钨：精矿碱压煮 → 钨酸钠 → 酸化沉钨酸 → 煅烧。
     *
     *   1000 精矿 + 200 碱 → 650 WO₃
     *
     * 精矿含 65% WO₃，所以理论上限是 650 —— 这里按 100% 转化给，
     * 实际碱压煮的浸出率 95–98%。
     *
     * 余 550 是钙渣（CaWO₄ 里的钙变成 Ca(OH)₂）与钠盐。
     * 这一步的反应在 150–200 °C、几个大气压下进行，酸吸收装置够用。
     */
    id: 'make/tungstic-oxide',
    name: 'Tungsten Trioxide Production', name_zh: '三氧化钨制备',
    produces: [
      { item: 'mat/tungstic-oxide', qty: q(650) },
      {
        item: 'mat/tungstic-oxide-slag',
        qty: q(550),
        gives: [
          { param: 'cao', kind: 'range', min: 20, max: 40 },
          { param: 'na2o', kind: 'range', min: 5, max: 15 },
          { param: 'form', kind: 'enum', oneOf: ['solid'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/tungsten-concentrate', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(200) }] },
    ],
    needs: [],
    performedBy: 'plant/acid-plant',
    under: [{ param: 'temperature', min: 150, max: 200 }],
    unbalanced_zh: '1000 精矿（65% WO₃）+ 200 碱 → 650 三氧化钨 + 钙渣/钠盐 550（已单列 mat/tungstic-oxide-slag，可回建材/骨料）',
  },
  {
    /**
     * 氢气还原：WO₃ + 3H₂ → W + 3H₂O，700–1000 °C。
     *
     *   1261 三氧化钨 + 33 氢 → 1000 钨粉 + 294 水
     *
     * 两步走（WO₃ → WO₂.₉ → WO₂ → W）是工业做法，本层按总式写。
     * 温度决定粉的粒度：低温柔（700）出细粉，高温粗。而粒度决定碳化快慢
     * 与刀片的韧性 —— 这一层调不了，因为没有测温。
     */
    id: 'make/tungsten-powder',
    name: 'Hydrogen Gas Reduction', name_zh: '氢气还原',
    produces: [
      { item: 'mat/tungsten-powder', qty: q(1000) },
      { item: 'mat/water', qty: q(294), gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/tungstic-oxide', qty: q(1261) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(33) }] },
    ],
    needs: [],
    performedBy: 'plant/atmosphere-furnace',
    under: [
      { param: 'temperature', min: 700, max: 1000 },
      { param: 'oxygen_ppm', min: 0, max: 50 },
    ],
  },
  {
    /**
     * 碳化：W + C → WC，1400–2000 °C，氢气保护。
     *
     *   939 钨粉 + 61 碳 → 1000 碳化钨
     *
     * 碳量要卡得准：少了生成 W₂C（脆），多了游离碳（也脆）。
     * 理论碳量 6.13%，工业配料 6.1–6.2% —— 这个精度靠秤，不靠温度，
     * 所以本层做得到。
     */
    id: 'make/tungsten-carbide',
    name: 'Carbonization', name_zh: '碳化制备',
    produces: [{ item: 'mat/tungsten-carbide', qty: q(1000) }],
    uses: [
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(939) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(61) }] },
    ],
    needs: [],
    performedBy: 'plant/atmosphere-furnace',
    under: [
      { param: 'temperature', min: 1400, max: 2000 },
      { param: 'oxygen_ppm', min: 0, max: 50 },
    ],
  },
  {
    /**
     * 刀片：碳化钨 900 + 镍 100 → 混粉、压制、烧结 1400–1500、刃磨。
     *
     *   1000 粉料 → 950 刀片 + 50 废料
     *
     * 10% 镍是 WC-Ni 的常规粘结剂含量。5% 的损失是刃磨与烧结边角 ——
     * 单列为 `mat/tungsten-carbide-scrap`，破碎球磨后回炉。
     *
     * ⚠️ **刃磨这一步本层做不利索。** 刚玉磨不动碳化钨，所以只能磨到
     * "能用"的粗糙度 —— 刃口有微崩，切削寿命比工业件短一半以上。
     * 真正的解决要碳化硅或金刚石。
     */
    id: 'make/carbide-insert',
    name: 'Cemented Carbide Insert Manufacturing', name_zh: '硬质合金刀片制造',
    produces: [
      { item: 'mat/carbide-insert', qty: q(950), gives: [{ param: 'grade', kind: 'enum', oneOf: ['P', 'M', 'K'] }, { param: 'hardness', kind: 'range', min: 1300, max: 2000 }] },
      {
        item: 'mat/tungsten-carbide-scrap',
        qty: q(50),
        gives: [
          { param: 'wc', kind: 'range', min: 85, max: 95 },
          { param: 'nickel', kind: 'range', min: 8, max: 12 },
          { param: 'form', kind: 'enum', oneOf: ['powder', 'chip'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/tungsten-carbide', qty: q(900) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(100) }] },
    ],
    needs: ['plant/forge', 'plant/grinder', 'lathe'],
    performedBy: 'plant/atmosphere-furnace',
    under: [
      { param: 'temperature', min: 1400, max: 1500 },
      { param: 'oxygen_ppm', min: 0, max: 50 },
    ],
    unbalanced_zh: '900 碳化钨 + 100 镍 → 950 刀片 + 50 硬质合金废料 = 1000，平；废料已单列，可回 make/tungsten-carbide 或硬质合金配料（WC 85–95 %、Ni 8–12 % 为设计值/Earth 工程值）',
  },
];

export const TUNGSTEN_INSERT_ITEM: Item = {
  id: 'mat/carbide-insert',
  name: 'Cemented Carbide Insert', name_zh: '硬质合金刀片',
  unit: 'kg',
  category: 'consumable',
  props: [{ param: 'grade', kind: 'enum', values: ['P', 'M', 'K'] }, { param: 'hardness', kind: 'range', min: 1300, max: 2000, unit: 'HV' }],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...TUNGSTEN_ITEMS, TUNGSTEN_INSERT_ITEM];
export const DATA_ROUTES: readonly Route[] = [...TUNGSTEN_ROUTES];
