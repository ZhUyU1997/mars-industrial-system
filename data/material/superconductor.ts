/**
 * 超导线缆：Nb3Sn 与 NbTi 两种前驱电缆。
 *
 * 这里只做“未反应”的电缆：Nb 粉/棒 + Sn（或 Ti）+ Cu 基体，拉到线径。
 * A15 相在磁体线圈的热处理中生成，不是电缆厂产出。
 * 青铜法/内锡法未建模；100 kg 只是线材量级。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const SUPERCONDUCTOR_ITEMS: readonly Item[] = [
  /**
   * 未反应的 Nb3Sn 前驱电缆：Nb 粉/棒 + Sn 源 + Cu 基体。
   *
   * A15 相在磁体线圈的热处理中生成，不是电缆厂产出。
   * 不声明规格属性：线径、股数、临界电流密度都还没建模。
   */
  {
    id: 'mat/nb3sn-cable',
    name: '未反应的 Nb3Sn 前驱电缆',
    unit: 'kg',
    category: 'material',
  },

  /**
   * NbTi 超导线缆：Nb 粉 + Ti + Cu 基体。
   *
   * 不声明规格属性：线径、股数、临界电流密度都还没建模。
   */
  {
    id: 'mat/nbti-cable',
    name: 'NbTi 超导线缆',
    unit: 'kg',
    category: 'material',
  },
];

export const SUPERCONDUCTOR_ROUTES: readonly Route[] = [
  {
    /**
     * Nb3Sn 前驱电缆：Nb 40 + Sn 10 + Cu 50 → 100 kg。
     *
     * 拉丝与退火借用现有丝材工位，不是专用超导线材线；工位幅面与线径未建模。
     * 青铜法/内锡法未建模，100 kg 只是线材量级。
     */
    id: 'make/nb3sn-cable',
    name: 'Nb3Sn 前驱电缆制备',
    produces: [{ item: 'mat/nb3sn-cable', qty: q(100) }],
    uses: [
      { anyOf: [{ item: 'mat/niobium-powder', qty: q(40) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(50) }] },
    ],
    needs: [],
    performedBy: 'plant/pgm-wire-mill',
    unbalanced_zh: 'Nb 40 + Sn 10 + Cu 50 → 100 kg 线缆；100 kg 只是线材量级，青铜法/内锡法未建模',
  },
  {
    /**
     * NbTi 线缆：Nb 40 + Ti 10 + Cu 50 → 100 kg。
     *
     * 拉丝与退火借用现有丝材工位，不是专用超导线材线；工位幅面与线径未建模。
     */
    id: 'make/nbti-cable',
    name: 'NbTi 线缆制备',
    produces: [{ item: 'mat/nbti-cable', qty: q(100) }],
    uses: [
      { anyOf: [{ item: 'mat/niobium-powder', qty: q(40) }] },
      { anyOf: [{ item: 'mat/titanium', qty: q(10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(50) }] },
    ],
    needs: [],
    performedBy: 'plant/pgm-wire-mill',
    unbalanced_zh: 'Nb 40 + Ti 10 + Cu 50 → 100 kg 线缆；100 kg 只是线材量级',
  },
];

export const DATA_ITEMS: readonly Item[] = [...SUPERCONDUCTOR_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...SUPERCONDUCTOR_ROUTES];
