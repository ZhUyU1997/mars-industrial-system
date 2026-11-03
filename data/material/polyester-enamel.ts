/**
 * 聚酯漆与 F 级漆包线 —— 这条链的终点。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 接在哪
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   苯酐（`xylene-chain.ts`）+ 乙二醇 + THEIC（`polyester-monomers.ts`）
 *     → 聚酯树脂 → 涂铜线、烘炉固化 → **F 级漆包线**
 *
 * 做完这一步，`make/robot-servo` 那句 `thermalClass ≥ 155 °C` 就有了交付者，
 * 伺服电机不再判 kept，机器人回严格闭包。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、聚酯：缩聚出水，酸值定分子量
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   苯酐 560 + 乙二醇 280 + THEIC 280 → 聚酯 1000 + 水 120
 *
 * 账怎么对：苯酐 560 kg = 3 780 mol，两个羧基 ⇒ 7 560 mol COOH；缩聚放出
 * 120 kg 水 = 6 660 mol ⇒ **88 % 的羧基酯化**，残余酸值约 15 mgKOH/g ——
 * 漆包线漆要的正是这个区间（酸值高了烘不干、低了分子量不够）。
 *
 * 醇过量：乙二醇 280 + THEIC 280 = 4 510 + 1 072 mol 分子，羟基数 12 236，
 * 远大于 6 660 —— 缩聚靠**抽走水**推平衡，不靠配比推。
 *
 * 温度 200–240 °C，二甲苯共沸带水（`plant/reflow-furnace`：100–300 °C、
 * 100–500 kPa）。THEIC 的三嗪环在这里的作用就是**不分解**：普通聚酯在
 * 220 °C 已经轻微降解，带三嗪环的能扛到 300 以上。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、漆包线：六道涂烘，漆膜是一层层叠上去的
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   铜线 940 + 聚酯 60 → 漆包线 1000
 *
 * 漆膜只占 6 %（φ0.3 mm 线上约 40 µm 双面）。**不能一次涂厚**：一次涂 40 µm
 * 会起泡、针孔、附着不良，所以是 6–8 道，每道涂 5–8 µm、进炉 300–400 °C
 * 烘 30–60 s。炉子是 `plant/resistance-furnace`（100–1100 °C）。
 *
 * 固化是**缩聚继续**：涂上去的是低分子量预聚物，烘炉里残余羧基与羟基再反应、
 * 溶剂挥发，最后形成不溶不熔的膜。所以同一锅漆，烘温低一点就是 B 级、
 * 高一点才是 F 级 —— 但**烘温不能靠猜**，见缺口①。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 已知缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① **没有漆膜性能试验**：附着（划格）、柔韧（卷绕）、耐刮（铅笔硬度）、
 *     耐溶剂（擦拭）、击穿电压 —— 这五项是漆包线的全部判据，本层一样都做不了。
 *     所以这条路线交 `thermalClass = 155` 是**按配方与烘温记的设计值**，
 *     不是测出来的。要验它得先有击穿电压试验台与热老化箱。
 *  ② **没有酸值/羟值滴定**：88 % 酯化是算的，不是滴的。
 *  ③ **烘炉温度均匀性 ±10–15 °C**（`plant/resistance-furnace` 的口径）：
 *     六道烘下来，漆膜固化程度在线上不均匀，pv 值第一批只能取偏保守的一档。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const POLYESTER_ENAMEL_ITEMS: readonly Item[] = [
  /**
   * THEIC 改性聚酯树脂。无溶剂（100 % 固含），黄色透明固体/黏稠液。
   *
   * 它是"漆"的树脂部分；漆包线漆出厂时还要加 30–40 % 的甲酚/二甲苯稀释，
   * 本层省掉这一步（溶剂在烘炉里反正要挥发掉），所以按 100 % 固含记。
   */
  { id: 'mat/polyester-resin', name: 'THEIC-Modified Polyester Resin', name_zh: 'THEIC 改性聚酯树脂', unit: 'kg', category: 'material' },
];

export const POLYESTER_ENAMEL_ROUTES: readonly Route[] = [
  {
    /**
     * 缩聚：苯酐 + 乙二醇 + THEIC → 聚酯 + 水。200–240 °C，二甲苯共沸带水。
     *
     *   560 + 280 + 280 → 1000 + 120（羧基酯化 88 %，残余酸值约 15 mgKOH/g）
     */
    id: 'make/polyester-resin',
    name: 'Polycondensation', name_zh: '缩聚制备',
    produces: [
      { item: 'mat/polyester-resin', qty: q(1000) },
      {
        item: 'mat/water',
        qty: q(120),
        gives: [{ param: 'conductivity', kind: 'range', min: 50, max: 1000 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/phthalic-anhydride', qty: q(560) }] },
      { anyOf: [{ item: 'mat/ethylene-glycol', qty: q(280) }] },
      { anyOf: [{ item: 'mat/theic', qty: q(280) }] },
    ],
    needs: [],
    performedBy: 'plant/reflow-furnace',
    under: [
      { param: 'temperature', min: 200, max: 240 },
      { param: 'pressure', min: 100, max: 150 },
    ],
    unbalanced_zh: '二甲苯共沸剂循环使用、不进产物；缩聚水 120 kg 已计入出料，其余是微量逸出',
  },
  {
    /**
     * 漆包线（F 级）。铜线拉细 → 退火 → 六道涂漆烘烤 → 冷却收线。
     *
     *   940 铜 + 60 聚酯 → 1000 漆包线
     *
     * 六道涂烘是本条路线的全部：每道 5–8 µm、300–400 °C、30–60 s。
     * 交出去的 `thermalClass = 155` 是**配方 + 烘温的设计值**（见缺口①），
     * 这一格与 `make/enamel-wire`（酚醛，130 °C）是同一个条目的两条路线，
     * 伺服电机挑得着 155 那一条，所以那句 `need ≥155` 从此覆盖。
     */
    id: 'make/enamel-wire-f',
    name: 'Enamelled Wire Production', name_zh: '漆包线制备',
    produces: [
      {
        item: 'mat/enamel-wire',
        qty: q(1000),
        gives: [
          { param: 'thermalClass', kind: 'range', min: 155, max: 155 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(940) }] },
      { anyOf: [{ item: 'mat/polyester-resin', qty: q(60) }] },
    ],
    needs: ['std/wire-die-general'],
    performedBy: 'plant/resistance-furnace',
    under: [{ param: 'temperature', min: 300, max: 400 }],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...POLYESTER_ENAMEL_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...POLYESTER_ENAMEL_ROUTES];
