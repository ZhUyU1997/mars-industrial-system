import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

/**
 * 高氯酸盐分解取氧 —— **起炉阶段唯一的氧源**。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么需要它
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 火星大气 95% 是 CO₂、0.13% 是 O₂ —— **没有氧可鼓**。
 * 所以"鼓风"在火星上不是"鼓空气"，是"鼓氧"：任何燃烧都得自带氧化剂。
 *
 * 而常规的氧源（电解水、电解 CO₂）都要电解槽，电解槽要镍电极、PTFE 隔膜、
 * 压力容器 —— 那是设备链下游的东西。土窑那一级（只有机器人 + 风化层）拿不到。
 *
 * 出口在风化层自己身上：火星尘土含**高氯酸盐** 0.5–1%（`mars/perchlorate`）。
 * 加热到 500–600 °C，它就分解放氧：
 *
 *   NaClO₄ → NaCl + 2O₂        每 1000 kg 高氯酸盐出 520 kg 氧
 *
 * **这是全模型唯一一条"点着火就有氧"的路线** —— 而点着火本身只要一台土窑。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 量级：只够起炉，不够生产
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   风化层含高氯酸盐 0.7% → 1 t 风化层出 7 kg 高氯酸盐 → 3.6 kg 氧
 *   烧 1 kg 碳要 2.67 kg 氧 → **1 t 风化层只够烧 1.4 kg 碳**
 *
 * 所以它是引火用的那一点氧：先把窑烧起来，窑里再烧砖，砖砌更大的窑 ——
 * 而真正大量的氧还是要等电解槽（`make/hydrogen` 的副产）。
 *
 * ⚠️ 一处副作用：高氯酸盐分解出的氯化钠留在灰里，**它会腐蚀耐火衬**。
 * 火星尘土里那点盐分，五千年后就是窑壁上的碱裂。
 */
export const PERCHLORATE_OXYGEN_ROUTE: Route = {
  id: 'make/oxygen-perchlorate',
  name: 'Oxygen Production', name_zh: '氧制备',
  produces: [
    { item: 'mat/oxygen', qty: q(520), gives: [{ param: 'purity', kind: 'range', min: 90, max: 99, dir: 'atLeast' }] },
    { item: 'mat/salt', qty: q(477) },
    {
      item: 'mat/perchlorate-decomposition-residue',
      qty: q(3),
      gives: [
        { param: 'chloride', kind: 'range', min: 20, max: 40 },
        { param: 'oxide', kind: 'range', min: 10, max: 30 },
        { param: 'form', kind: 'enum', oneOf: ['solid'] },
      ],
    },
  ],
  uses: [{ anyOf: [{ item: 'mars/perchlorate', qty: q(1000) }] }],
  needs: [],
  performedBy: 'plant/earth-kiln',
  under: [{ param: 'temperature', min: 500, max: 600 }],
  unbalanced_zh: '1000 高氯酸盐 → 氧 520 + 盐 477 + 分解残渣 3；残渣已单列 mat/perchlorate-decomposition-residue（可回盐/尾渣）',
};

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [PERCHLORATE_OXYGEN_ROUTE];
