/**
 * 硝酸 —— 硅的腐蚀液，而它一直不在表上。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它缺得很不是地方
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 第 47、48、49、50 节的每一条器件路线里，工序都写着"腐蚀清洗（氢氟酸 + 硝酸）"——
 * 而 `mat/nitric-acid` 这个条目根本不存在。**工序写了，料的账没记。**
 *
 * 硅的腐蚀只有这一对配得出来：HF 溶掉氧化层，HNO₃ 把硅氧化，两者交替进行，
 * 于是各向同性地往下啃。没有硝酸，硅片就只能切、不能蚀。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 来路：电弧固氮（1903 年的 Birkeland–Eyde 法）
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   N₂ + O₂ → 2NO        2000 °C 以上，电弧里直接生成
 *   2NO + O₂ → 2NO₂      降温后自发
 *   3NO₂ + H₂O → 2HNO₃ + NO
 *
 * 当时本层没有铂（奥斯特瓦尔德法要铂铑网催化氨氧化；现在
 * `mat/pt-rh-gauze` 已建（Pt-10Rh / Pt-5Rh、80 目；Rh 是一次性输入），
 * 但**氨氧化炉/铂网装填**仍未建），但有**电弧** ——
 * 电弧炉、碳弧灯都是 2000 °C 以上的电弧。所以走 1903 年那条更老的路：
 * **把空气烧一下，再用水吸收。**
 *
 * ⚠️ 收率极低：2000 °C 下 NO 的平衡浓度只有 2–4%，降温时又会分解回 N₂ 与 O₂，
 * 所以工业上要急速淬冷（把气体从 2000 °C 在几毫秒内降到 1000 °C 以下）。
 * 本层没有淬冷器 —— 只能用大流量 + 长吸收塔硬凑，**每吨硝酸要循环的空气量极大**。
 * 这一笔与 `make/nitrogen` 的抽气量是同一笔账。
 *
 * ⚠️ 另一处：氮氧化物是剧毒气体，尾气必须碱液吸收（`mat/naoh`）—— 湿法槽那套。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const NITRIC_ITEMS: readonly Item[] = [
  /**
   * 硝酸（65% 水溶液）。强氧化性酸，硅的腐蚀剂，也是硝酸盐与炸药的原料。
   *
   * 本层把它按 100% 计（含水已在路线里扣）：修版液、腐蚀液、钝化液都要它。
   */
  { id: 'mat/nitric-acid', name: 'Nitric Acid', name_zh: '硝酸', unit: 'kg', category: 'material' },
];

export const NITRIC_ROUTES: readonly Route[] = [
  {
    /**
     * 硝酸：空气过电弧 → 急冷 → 水吸收 → 浓缩。
     *
     *   氮 780 + 氧 2130 → 硝酸 1000（按 100% 计）
     *
     * 化学计量：N₂ + 2O₂ + H₂O → 2HNO₃（N 28 → 126，一吨氮出 4.5 吨硝酸）。
     * 这里按实际收率折算成"一大批空气"，所以进料看起来远大于化学计量 ——
     * **这就是电弧固氮的代价：电力由种子聚变装置供给（装置可复制扩容，不是免费），
     * 空气的量要命。**
     */
    id: 'make/nitric-acid',
    name: 'Nitric Acid Production', name_zh: '硝酸制备',
    produces: [{ item: 'mat/nitric-acid', qty: q(1000) }],
    uses: [
      { anyOf: [{ item: 'mat/nitrogen', qty: q(780) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(2130) }] },
      { anyOf: [{ item: 'mat/water', qty: q(400) }] },
    ],
    needs: [],
    performedBy: 'plant/arc-furnace',
    under: [{ param: 'temperature', min: 1900, max: 2200 }],
    unbalanced_zh: '氮 780 + 氧 2130 + 水 400 → 硝酸 1000；③ 可接受：2310 是未反应空气（循环）与尾气（碱液吸收），未回收，不建条目',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...NITRIC_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...NITRIC_ROUTES];
