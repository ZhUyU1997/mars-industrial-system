/**
 * 硼化混凝土：中子屏蔽与生物屏蔽的料。
 *
 * 骨料用火星风化层，胶凝用石灰/水泥，加水与硼砂/氧化硼提高中子吸收。
 * 配比是假设，不是实测；1000 kg 一批，1–2% 含硼料的量级。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const SHIELDING_ITEMS: readonly Item[] = [
  /**
   * 硼化混凝土：风化层骨料 + 石灰/水泥 + 水 + 硼砂/氧化硼。
   *
   * 不声明规格属性：屏蔽件的硼含量与厚度写在 shield 条目上，
   * 这一条只回答“料怎么配”。
   */
  {
    id: 'mat/borated-concrete',
    name: 'Borated Concrete', name_zh: '硼化混凝土',
    unit: 'kg',
    category: 'material',
  },
];

export const SHIELDING_ROUTES: readonly Route[] = [
  {
    /**
     * 硼化混凝土：风化层 760 + 石灰 130 + 水 70 + 氧化硼 40 → 1000 kg。
     *
     * 40 kg 氧化硼约 1.24 % B，落在屏蔽件 1–2 % 的设计窗口内；配比仍是假设。
     * 骨料含水与损耗未计入。搅拌与浇注是人工工序，执行者写机器人。
     */
    id: 'make/borated-concrete',
    name: 'Borated Concrete Production', name_zh: '硼化混凝土制备',
    produces: [{ item: 'mat/borated-concrete', qty: q(1000) }],
    uses: [
      { anyOf: [{ item: 'mars/regolith', qty: q(760) }] },
      { anyOf: [{ item: 'mat/lime', qty: q(130) }] },
      { anyOf: [{ item: 'mat/water', qty: q(70) }] },
      { anyOf: [{ item: 'mat/boron-oxide', qty: q(40) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    unbalanced_zh: '按 1000 kg 批次配，骨料含水与损耗未计；40 kg 氧化硼约 1.24 % B',
  },
];

export const DATA_ITEMS: readonly Item[] = [...SHIELDING_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...SHIELDING_ROUTES];
