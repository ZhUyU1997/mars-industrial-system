/**
 * 2 nm 阻挡的大马士革层 —— 40 nm 那一档的后道，就差这一格能把阻挡层判通过。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么要单开一条变体
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `make/fine-damascene-layer` 交的阻挡层是 **5 nm**（Ti 1 nm + TiN 4 nm 那一档），
 * 而 40 nm 的三条路线要 **≤3 nm**、8 nm 那条要 **≤2 nm**。三条 lost 债全卡在同一格。
 *
 * 本层其实已经有 2 nm 的成膜能力：`make/tin-2nm-ald`（40–100 个 ALD 周期、
 * 2–2.5 nm）。所以这不是"缺能力"，是"缺一条把那条路线接进大马士革的交接口"。
 *
 * 差别只在阻挡那一层：
 *
 *   原路线   Ti 1 nm + TiN 4 nm  = 5 nm，PVD/反应溅射
 *   这一条   TiN 2–2.5 nm（ALD 循环控制），孔底合计 2–2.5 nm
 *
 * 其余工序完全照抄原路线（清洗、旋涂、曝光、刻蚀、填铜、CMP），所以本文件
 * 只写这一条变体，不重复整套工艺的注释 —— 看 `data/machine/fine-damascene.ts`。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 代价（写在明处）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① **ALD 比 PVD 慢一个量级**：40–100 周期 × 每周期几秒 = 单批 5–10 min，
 *     而溅射 5 nm 只要 1 min。这一条的时间成本不在本文件判据里（模型没有节拍）。
 *  ② **2 nm 是否连续没验过**：`make/tin-2nm-ald` 自己的注释写着"内角 1.1–1.5 nm、
 *     可能不连续"、"TiCl₄ 首脉冲咬 Ti 的风险比 3 nm 大"。所以这条路线交 2–2.5 nm
 *     是**设计值**，不是测出来的 —— 要验它得先有连续膜/漏电测试（见未闭合项）。
 *  ③ **只改阻挡不改线宽**：40 nm 那三条路线上还有线宽 ≤100/≤30、深宽比 ≥1.5/≥2、
 *     k ≤2.5、层数 ≥8/≥12 四处没解。这一条只销掉阻挡那一格，别指望它把整条清掉。
 */

import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DAMASCENE_2NM_ROUTES: readonly Route[] = [
  {
    /**
     * 2 nm TiN 阻挡的大马士革层。工序与原路线相同，只有阻挡那一段换成 ALD。
     *
     * 交出去的窗口：线宽 100–300、深宽比 0.67–2.0、dishing 7–12、**阻挡 2–2.5**、
     * k 4.0–4.5、层数 1–3。与 `make/fine-damascene-layer` 的差别只有阻挡那一格。
     */
    id: 'make/fine-damascene-layer-2nm',
    name: '单层铜互连片制造',
    produces: [
      {
        item: 'mat/damascene-layer',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 100, max: 300 },
          { param: 'aspectRatio', kind: 'range', min: 0.67, max: 2.0 },
          { param: 'dishing', kind: 'range', min: 7, max: 12 },
          // 30 周期一档：交 2.0 nm（窗口下沿），这样 8 nm 那条 ≤2 也判得进。
          { param: 'barrierThickness', kind: 'range', min: 2, max: 2 },
          { param: 'kValue', kind: 'range', min: 4.0, max: 4.5 },
          { param: 'layers', kind: 'range', min: 1, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/device-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/silica', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(4) }] },
      { anyOf: [{ item: 'mat/cf4', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(1, 1000) }] },
      // 阻挡层的两种前驱体：TiCl₄ 与 NH₃，ALD 循环里交替通。
      { anyOf: [{ item: 'mat/titanium', qty: q(2, 1000) }] },
      { anyOf: [{ item: 'mat/ammonia', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/cu-seed-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/superfill-bath', qty: q(1, 50) }, { item: 'mat/superfill-bath-3', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/peg', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/sodium-dichromate', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1, 100) }] },
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
      // 与原路线唯一的设备差别：阻挡层用 ALD 反应器，不用溅射台。
      'plant/ald-reactor',
    ],
  },
  {
    /**
     * 低 k 的大马士革层：把介质从 SiO₂（k 4.0–4.5）换成多孔 SiCOH（k 2.2–2.5）。
     *
     * 本层早就有低 k 能力 —— `make/sico-h-2p5`（2.4–2.5）与 `make/sico-h-porous`
     * （2.2–2.5）都在，只是它们产出的是 `mat/sico-h-wafer`，而大马士革层的
     * 介质还写着 SiO₂。这一条把两块接起来：进料用已经长好低 k 膜的片，
     * 后面照旧刻沟、填铜、CMP。
     *
     * 40 nm 那三条路线要 k ≤2.5，而 damascene-layer 的其它路线都交 4.0–4.5 ——
     * 这是"能力有、接线没有"的第三例（前两例：阻挡层的 2 nm、相机出清单）。
     */
    id: 'make/fine-damascene-layer-lowk',
    name: '单层铜互连片制造',
    produces: [
      {
        item: 'mat/damascene-layer',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 100, max: 300 },
          { param: 'aspectRatio', kind: 'range', min: 0.67, max: 2.0 },
          { param: 'dishing', kind: 'range', min: 7, max: 12 },
          // 30 周期一档：交 2.0 nm（窗口下沿），这样 8 nm 那条 ≤2 也判得进。
          { param: 'barrierThickness', kind: 'range', min: 2, max: 2 },
          { param: 'kValue', kind: 'range', min: 2.4, max: 2.5 },
          { param: 'layers', kind: 'range', min: 1, max: 3 },
        ],
      },
    ],
    uses: [
      // 已经长好低 k 膜的片：介质不再是 SiO₂。
      { anyOf: [{ item: 'mat/sico-h-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(4) }] },
      { anyOf: [{ item: 'mat/cf4', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/chlorine', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/titanium', qty: q(2, 1000) }] },
      { anyOf: [{ item: 'mat/ammonia', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/cu-seed-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/superfill-bath', qty: q(1, 50) }, { item: 'mat/superfill-bath-3', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/peg', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/sodium-dichromate', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1, 100) }] },
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
  {
    /**
     * 8 层铜互连。40 nm 那一档要 ≥8 层，而单层路线只交 1–3 层。
     *
     * 输入是已经叠好的 3 层（`mat/damascene-layer`），再叠 5 层单层工序，
     * 交出 layers = 8。每层都是：旋涂光刻胶 → ArF 曝光 → C4F6 刻沟 →
     * ALD 2 nm 阻挡 → 溅射铜籽晶 → 电镀填充 → CMP。设备与单层完全一样，
     * **不新增任何设备**。
     *
     * dishing 仍按单层那一档（7–12 nm）交：CMP 每层都做，顶层被磨的量和单层
     * 一样；累加的是层数，不是 dishing。这也是它诚实的边界 —— 12 层叠下来，
     * 真正恶化的是累积套刻误差与应力，而模型没有这两个参数（见未闭合项）。
     */
    id: 'make/damascene-stack-8',
    name: '单层铜互连片制造',
    produces: [
      {
        item: 'mat/damascene-layer',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 100, max: 300 },
          { param: 'aspectRatio', kind: 'range', min: 0.67, max: 2.0 },
          { param: 'dishing', kind: 'range', min: 7, max: 12 },
          { param: 'barrierThickness', kind: 'range', min: 2, max: 2 },
          { param: 'kValue', kind: 'range', min: 2.4, max: 2.5 },
          { param: 'layers', kind: 'range', min: 8, max: 8 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/damascene-layer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/cu-seed-wafer', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(5, 1000) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(5, 1000) }] },
      { anyOf: [{ item: 'mat/cf4', qty: q(5, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(5, 1000) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(5, 200) }] },
      { anyOf: [{ item: 'mat/titanium', qty: q(5 * 2, 1000) }] },
      { anyOf: [{ item: 'mat/ammonia', qty: q(5, 1000) }] },
      { anyOf: [{ item: 'mat/superfill-bath-3', qty: q(5, 50) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(5, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5 * 4) }] },
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
  {
    /**
     * 12 层铜互连。8 nm 那一档要 ≥12 层。
     *
     * 输入是已经叠好的 3 层（`mat/damascene-layer`），再叠 9 层单层工序，
     * 交出 layers = 12。每层都是：旋涂光刻胶 → ArF 曝光 → C4F6 刻沟 →
     * ALD 2 nm 阻挡 → 溅射铜籽晶 → 电镀填充 → CMP。设备与单层完全一样，
     * **不新增任何设备**。
     *
     * dishing 仍按单层那一档（7–12 nm）交：CMP 每层都做，顶层被磨的量和单层
     * 一样；累加的是层数，不是 dishing。这也是它诚实的边界 —— 12 层叠下来，
     * 真正恶化的是累积套刻误差与应力，而模型没有这两个参数（见未闭合项）。
     */
    id: 'make/damascene-stack-12',
    name: '单层铜互连片制造',
    produces: [
      {
        item: 'mat/damascene-layer',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 100, max: 300 },
          { param: 'aspectRatio', kind: 'range', min: 0.67, max: 2.0 },
          { param: 'dishing', kind: 'range', min: 7, max: 12 },
          { param: 'barrierThickness', kind: 'range', min: 2, max: 2 },
          { param: 'kValue', kind: 'range', min: 2.4, max: 2.5 },
          { param: 'layers', kind: 'range', min: 12, max: 12 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/damascene-layer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/cu-seed-wafer', qty: q(9) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(9, 1000) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(9, 1000) }] },
      { anyOf: [{ item: 'mat/cf4', qty: q(9, 1000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(9, 1000) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(9, 200) }] },
      { anyOf: [{ item: 'mat/titanium', qty: q(9 * 2, 1000) }] },
      { anyOf: [{ item: 'mat/ammonia', qty: q(9, 1000) }] },
      { anyOf: [{ item: 'mat/superfill-bath-3', qty: q(9, 50) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(9, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(9 * 4) }] },
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
  },];

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...DAMASCENE_2NM_ROUTES];
