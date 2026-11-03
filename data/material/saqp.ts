/**
 * SAQP：自对准四重成像 —— 把线宽再砍一半，node 从 32–48 推到 16–24。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么它能把 node 推下去
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本层的 ArF 步进画不出 40 nm 以下的线，但**画不出不等于做不出**：SADP 用一圈
 * 侧墙把一根线变成两根（`make/device-wafer-sadp`，node 32–48）；SAQP 是这个
 * 动作做**两次** —— 侧墙套侧墙，一根变四根。所以它不需要更好的镜头，只需要
 * 多两轮沉积与刻蚀。
 *
 *   100 nm 线 → SADP 50 → SAQP 25
 *
 * 代价全在套刻与线边缘粗糙度上：每多一轮侧墙，套刻误差就多叠一次，线宽
 * 均匀性掉一档。所以这一条交 16–24，比 SADP 的 32–48 窄，但**没有更准** ——
 * 它是"更细"，不是"更好"。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 已知缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① **线边缘粗糙度（LER）本层没有量具**：SAQP 的 LER 通常比 SADP 差 1–2 nm，
 *     而 CD-SEM 只能读线宽、读不了边缘的 RMS。所以"线更细了但更毛"这件事
 *     判不了，只在注释里。
 *  ② **套刻误差累加**：两轮侧墙各自的对准误差平方和叠加，本层套刻判据是
 *     560 nm 档（基础台），对 25 nm 的线没有意义 —— 这也是为什么这条路线
 *     只声明 node，不声明 overlay。
 *  ③ **成品率**：四重成像的断线/桥接缺陷密度比双重高一个量级，模型没有
 *     缺陷密度这一层，只能记"更低"。
 */

import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const SAQP_ROUTES: readonly Route[] = [
  {
    /**
     * 自对准四重成像。在栅电极片上做两轮侧墙：芯轴沉积 → 第一圈侧墙 → 去芯轴 →
     * 第二圈侧墙 → 去第一圈 → 图形转移。
     *
     * 交出去：`node 16–24 nm`。
     *
     * 与 SADP 那一条的关系：同一台设备（涂胶、曝光、刻蚀、ALD、CD-SEM 都在
     * `needs` 里），只多两轮循环。所以这是**工艺步骤的加法，不是设备的加法**。
     */
    id: 'make/device-wafer-saqp',
    name: 'Front-End Completed Wafer Manufacturing', name_zh: '前道完成片制造',
    produces: [
      {
        item: 'mat/device-wafer',
        qty: q(1),
        gives: [{ param: 'node', kind: 'range', min: 16, max: 24 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/gate-electrode-wafer', qty: q(1) }] },
      // 两轮循环，冲洗与甩干都做两遍。
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
      // 侧墙是 ALD 氧化物：两轮各一层薄氧化硅，量按片表面 78.5 cm² × 20 nm 估。
      { anyOf: [{ item: 'mat/silica', qty: q(1, 100) }] },
    ],
    // 设备由 steps 表达，needs 只留场地（否则报 redundant_need）。
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '芯轴沉积与图形化（ArF 曝光 + 刻蚀）', performedBy: 'plant/arf-lens' },
      { note_zh: '第一圈侧墙 ALD + 回刻，去芯轴', performedBy: 'plant/ald-reactor' },
      { note_zh: '第二圈侧墙 ALD + 回刻，去第一圈', performedBy: 'plant/ald-reactor' },
      { note_zh: '读线宽（16–24 nm 档）', performedBy: 'plant/cd-sem', under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }] },
    ],
  },
  {
    /**
     * 用 SAQP 图形化的大马士革层：线宽 50–100 nm、深宽比 2–4。
     *
     * 前面几刀都是"材料/工艺加法"，这一刀不一样：它把**四重成像的线宽**直接
     * 接到互连上。原来 `mat/damascene-layer` 最好只到 100–300 nm（ArF 单程），
     * 现在 SAQP 把线打到 25–75，取 50–100 这一档做互连——**线宽那两笔债**
     * （`mcu-3um-damascene`、`fine-soc-interconnect` 的 ≤100）就此销掉。
     *
     * 深宽比按"沟深 300–400 / 线宽 50–100"给 2–4：这也顺手销掉
     * `≥1.5` 与 `≥2` 那两笔（判据取下沿，2 同时满足两条）。
     *
     * ⚠️ **不代表 node 到 10 nm**：SAQP 给出的是线宽与节距，器件的源漏/栅氧
     * 那一层不在本文件；`node ≤10` 那笔仍然挂着。
     */
    id: 'make/fine-damascene-layer-saqp',
    name: 'Single-Layer Copper Interconnect Wafer Manufacturing', name_zh: '单层铜互连片制造',
    produces: [
      {
        item: 'mat/damascene-layer',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 50, max: 100 },
          { param: 'aspectRatio', kind: 'range', min: 2, max: 4 },
          { param: 'dishing', kind: 'range', min: 7, max: 12 },
          { param: 'barrierThickness', kind: 'range', min: 2, max: 2 },
          { param: 'kValue', kind: 'range', min: 2.4, max: 2.5 },
          { param: 'layers', kind: 'range', min: 1, max: 3 },
        ],
      },
    ],
    uses: [
      // SAQP 打好的器件片（线 16–24 nm 的图形，用来定义沟槽）。
      { anyOf: [{ item: 'mat/device-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/cf4', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/titanium', qty: q(2, 1000) }] },
      { anyOf: [{ item: 'mat/ammonia', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/cu-seed-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/superfill-bath-3', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(4) }] },
    ],
    needs: [
      'std/photomask-general',
      'plant/clean-room',
      'plant/metrology-room',
      'plant/water-polisher',
      'plant/arf-laser',
      'plant/arf-lens',
      'plant/laser-stage',
      'plant/cmp-integration',
      'plant/cmp-uniformity-kit',
      'plant/cd-sem',
      'plant/ald-reactor',
    ],
  },
];

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...SAQP_ROUTES];
