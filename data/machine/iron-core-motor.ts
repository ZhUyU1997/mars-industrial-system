/**
 * 铁芯电机 —— 没有硅钢的时候，电机也能转。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么需要这一条
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 每台设备的装配清单里都有一台电机 —— 而电机卡在一条长链上：
 *
 *   电机 ← 定子 ← 硅钢（3% Si）← 硅铁 ← 矿热炉（1800 °C）+ 散热器
 *
 * 于是"设备链是圆的"这件事最后缩到**硅钢**上。但早期电机本来就不用硅钢：
 *
 *   1830 年代   整块软铁做磁极（涡流损耗巨大，但转得起来）
 *   1890 年代   开始用叠片（还是一块块铁片，没有硅）
 *   1900 年代   才有人往铁里加硅
 *
 * **所以"第一个电机"不需要硅钢**：要的是叠片铁芯 + 漆包线 + 轴承。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 代价（必须写清）
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   铁损     无硅铁芯的涡流损耗是硅钢的 3–5 倍 → 同样出力，发热多几倍
 *   效率     0.6–0.7（硅钢电机 0.85–0.9）→ **电耗高一半**
 *   温升     连续运行时铁芯烫手，要留通风或间歇运行
 *   体积     同样出力重 1.5 倍
 *
 * 而这个体系的电力由种子聚变装置供给（装置可复制扩容，不是免费），缺的是"能不能转起来"。
 * 所以这条路线在点火阶段是对的，在稳态阶段就该换回硅钢。
 *
 * ⚠️ 另一处：漆包线的铜也要链子（铜精矿 ← 选矿 ← …）。而铜在风化层里是
 * 痕量（8333:1），**第一个电机要的几十公斤铜，等于几十万吨土。**
 * 这是点火阶段最贵的一笔 —— 记在这里，不掩饰。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const IRON_CORE_ROUTES: readonly Route[] = [
  {
    /**
     * 定子（铁芯版）：叠片软铁 + 铣槽 + 嵌线。
     *
     *   铁 1 + 漆包线 1 + 酚醛（槽绝缘）1 → 定子 1
     *
     * 叠片不是硅钢片，就是**低碳钢片**：一片片冲（或铣）出来，涂一层绝缘漆再叠。
     * 片间绝缘是唯一的要求 —— 它决定涡流损耗，不决定能不能转。
     */
    id: 'make/motor-stator-ironcore',
    name: '7.5 kW Four-Pole Motor Stator Manufacturing', name_zh: '7.5 kW 四极电机定子制造',
    produces: [{ item: 'std/motor-7.5kw-4p/stator', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/iron', qty: q(1) }] },
      { anyOf: [{ item: 'mat/enamel-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '钢片下料（剪或铣，涂绝缘漆后叠压）', performedBy: 'lathe' },
      { note_zh: '内圆与止口加工', performedBy: 'lathe' },
      { note_zh: '槽绝缘与嵌线', performedBy: 'plant/winder' },
      // 浸漆本该 120–150，而土窑下限是 400。模型没有"余热"这个条件，
      // 只能记 400 —— 代价是酚醛固化过头、漆膜发脆。这是模型缺口，不是工艺选择。
      { note_zh: '浸漆烘干（土窑下限 400，实际该 150）', performedBy: 'plant/earth-kiln', under: [{ param: 'temperature', min: 400, max: 450 }] },
    ],
  },
  {
    /**
     * 转子（鼠笼版，铁芯）：铁芯 + 铸铝导条。
     *
     *   铁 1 + 铜 1 → 转子 1
     *
     * 鼠笼转子最省事：槽里灌铜，两端铸成短路环 —— 没有绕组、没有滑环、免维护。
     * 但要铝（铝链是本层后来才补的）。**铝没有的时候走绕线式**（铜绕组 + 滑环），
     * 那是两条老路线，不在这里重复。
     */
    id: 'make/motor-rotor-ironcore',
    name: '7.5 kW Four-Pole Motor Rotor Manufacturing', name_zh: '7.5 kW 四极电机转子制造',
    produces: [{ item: 'std/motor-7.5kw-4p/rotor', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/iron', qty: q(1) }] },
      // **铜鼠笼，不是铸铝**：铝要么电解槽（没通），而铜已经有了（火法精铜 + 湿法）。
      // 铜的导电率比铝高 60%，同样的槽形载流更大；代价是重、贵、铸造温度高（1085 vs 660）。
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '铁芯叠压与槽加工', performedBy: 'lathe' },
      // 熔炼炉下限就是 1300（1500–1650 是炼钢），铜 1085 就化 —— 1300 浇铜是"过热度大"，
      // 代价是吸气多、缩孔大，要靠冒口与补浇。
      { note_zh: '铸铜导条与短路环（熔炼炉 1300 化铜，浇进转子模）', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1300, max: 1400 }] },
      { note_zh: '动平衡（磨去重的一侧）', performedBy: 'plant/grinder' },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...IRON_CORE_ROUTES];
