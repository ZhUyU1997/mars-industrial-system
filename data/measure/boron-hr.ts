/**
 * 硼的 **R=10000–12000 高分辨测量**：让 0.02 ppb 有实测载体。
 *
 * ⚠️ **分工（R13）**：本文件只放 **1 条测量路线 + 1 个记录条目**；仪器在
 * `data/machine/boron.ts`（`plant/hr-icp-ms` 的 `resolution` 已到 4000–12000、
 * `make/hr-icp-ms` 的 gives 已提到 10000–12000），无硼实验室在
 * `data/material/pfa.ts`（`plant/boron-free-lab`）。按 id 跨文件解析，没有跨文件 import。
 *
 * 为什么不改 `measure/trace-boron`：那是 R=4000 的旧机路线，留着做“低分辨档”；
 * 这一条是**同一台机器的另一个工作点**（缝 10–15 µm、场稳 0.5–1 ppm）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、¹¹B 与 ¹²C：分离余量到底多少
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ¹¹B 11.0093、¹²C 12.0000：Δm = 0.9907 u。**按峰位**只要 R = 11.01/0.9907 ≈ **11**
 *   —— 四极杆 0.7 u 的峰宽也“分得开”峰位。真正的麻烦是 ¹²C 的**峰尾**（丰度 98.9 %）。
 *
 *   丰度灵敏度（abundance sensitivity）AS = 峰尾在相邻 1 u 处的高度 / 主峰高度：
 *     R = 4000  AS ≈ 1×10⁻⁶；R = 10000  AS ≈ 1×10⁻⁷（本机 1×10⁻⁷–2×10⁻⁷）
 *
 *   样品里 C 按 **1 ppm** 计（TCS 的碳杂质上限），¹¹B 信号按 **0.01 ppb** 计：
 *     R=4000 ：1 ppm × 1e-6 = 1×10⁻⁶ ppm = **1×10⁻³ ppb** ⇒ 是 0.01 ppb 的 **10 %**
 *     R=10000：1 ppm × 1e-7 = **1×10⁻⁴ ppb**  ⇒ 是 0.01 ppb 的 **1 %**（3σ 下余量 ≈ 30–100 倍）
 *   再算上 ¹¹B 的丰度 80.1 %：实际 ¹¹B 信号 = 0.801 × 0.01 = 8×10⁻³ ppb，¹²C 尾 1×10⁻⁴ ppb
 *   ⇒ **信尾比 80:1**（R=10000）；R=4000 时是 8:1 —— 这就是必须上 10000 的原因。
 *
 *   ¹⁰B 与 ⁹Be¹H：10.0129 vs 10.0200，Δm = 0.0071 ⇒ 需要 R = 10.013/0.0071 ≈ **1410**；
 *   R=10000 的余量 **7 倍**（R=4000 也有 2.8 倍，但 ¹²C 尾会先压垮 ¹⁰B 那一侧）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、¹⁰B/¹¹B 同位素比：能测，但要看浓度
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   AS=1e-7 对 ¹⁰B 的天然丰度 19.9 %：¹¹B 尾进 ¹⁰B 的贡献 = 0.801 × 1e-7 = 8×10⁻⁸，
 *   相对 ¹⁰B（0.199）是 **4×10⁻⁷** ⇒ 尾的贡献可以忽略，**精度由计数统计定**：
 *
 *     0.01 ppb 总 B（灵敏度 1×10⁴ cps/ppb）⇒ 总 100 cps、¹⁰B 20 cps、¹¹B 80 cps
 *       30 s 积分：600 与 2 400 计数 ⇒ σ = √(1/600 + 1/2 400) = **4.6 %**
 *     0.1 ppb：**1.5 %**；1 ppb：**0.5 %**
 *
 *   ⇒ **0.1 ppb 以上可以给 ¹⁰B/¹¹B（1.5–2 %）**；0.01 ppb 只有 4–5 %，只能看趋势；
 *   0.01 ppb 以下不建议报比值。比值的准确度还要 ⁶Li 内标（`mat/lithium-6-enriched`）压质量歧视。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、窗口与判据
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   B **0.01–10 ppb**（比 R=4000 的 0.02 ppb 再低一半）
 *   R **10000–12000**（缝 10–15 µm）
 *   AS **1×10⁻⁷**；空白 **0.005–0.01 ppb**（无硼实验室 + PFA 器皿）
 *   回收 **95–105 %**（⁶Li 内标校质量歧视）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、缺口（带数）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① R=12000 要 10 µm 缝 + 场稳 0.5 ppm；常导电源 1 ppm/h ⇒ 只能短时（30 min）停在上限，
 *     长测要降到 10000（本路线的工作点）。
 *  ② 空白 0.005 ppb 是 PFA 实验室的值；开盖 1 h 会到 0.3–3 ppb（气相硼）。
 *  ③ ¹⁰B/¹¹B 的 1.5 % 是计数统计；质量歧视（1–2 %/u）要靠 ⁶Li 内标，而 ⁶Li 本身
 *     91–94 % 富集、⁶Li/⁷Li 比值会随批次变 0.5–1 % ⇒ 比值的系统误差 1–2 %。
 *  ④ C 的 1 ppm 估算是设计值；实测 C 高到 10 ppm 时 R=10000 的余量从 80:1 掉到 8:1。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { BORON_HR_MEASURE_ITEMS, BORON_HR_MEASURE_ROUTES } from '../../data/measure/boron-hr.ts';
 *   items: [...BORON_HR_MEASURE_ITEMS] · routes: [...BORON_HR_MEASURE_ROUTES]
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、记录条目（R12 的收窄产物）
// ═══════════════════════════════════════════════════════════════════════════

export const BORON_HR_MEASURE_ITEMS: readonly Item[] = [
  /**
   * **硼高分辨记录。一份对应一批。**
   *
   *   boron                0.01–10 ppb（样品当量；富集 20×、R=10000）
   *   resolution           10000–12000
   *   abundanceSensitivity 1×10⁻⁷–2×10⁻⁷
   *   blankBoron           0.005–0.01 ppb（PFA 实验室 + 亚沸酸）
   *   recovery             95–105 %（⁶Li 内标）
   */
  {
    id: 'mat/boron-hr-record',
    name: 'Boron High-Resolution Analysis Record', name_zh: '硼高分辨分析记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'boron', kind: 'range', min: 0.01, max: 0.05, unit: 'ppb' },
      { param: 'resolution', kind: 'range', min: 10000, max: 12000, unit: 'M/ΔM' },
      { param: 'abundanceSensitivity', kind: 'range', min: 1e-7, max: 1e-6, unit: '1', dir: 'atMost' },
      { param: 'blankBoron', kind: 'range', min: 0.001, max: 0.02, unit: 'ppb' },
      { param: 'recovery', kind: 'range', min: 0.9, max: 1.1, unit: '1' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、测量路线（R12：窗口在这里从仪器能力收窄成记录）
// ═══════════════════════════════════════════════════════════════════════════

export const BORON_HR_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **痕量硼高分辨：赶硅 → 树脂富集 → HR-ICP-MS（¹¹B, R=10000）。**
     *
     *   10 g 电子级 TCS + 树脂 0.5 g + ⁶Li 内标 → 记录 1 份
     *
     * 五步（4 h 前处理 + 1.5 h 机时）：
     *   ① 水解/赶硅：冰水浴水解，HF + 亚沸 HNO₃，80 °C 蒸到近干，复溶 10 mL，调 pH 6–8
     *   ② 树脂富集：0.5 g 二醇季铵树脂闭口摇 30 min，0.5 mL 洗脱 = 20×
     *   ③ 炬箱 1 atm、Ar 15 L/min、1.2–1.6 kW；⁶Li 内标 10–50 ppb 同批加入
     *   ④ 分析腔 8 kV、B=0.14 T（m/z 11）、缝 10–15 µm、R=10000；¹²C 尾 1e-7
     *   ⑤ 外标 0.01/0.1/1/10 ppb + 空白；报 B、R、AS、空白、回收
     */
    id: 'measure/trace-boron-hr',
    name: 'Boron High-Resolution Analysis Measurement', name_zh: '硼高分辨分析测量',
    produces: [
      {
        item: 'mat/boron-hr-record',
        qty: q(1),
        gives: [
          // 收窄到 HR-ICP-MS 高分辨硼给出窗 0.01–0.05 ppb（原 0.01–10 是量程）。
          { param: 'boron', kind: 'range', min: 0.01, max: 0.05 },
          { param: 'resolution', kind: 'range', min: 10000, max: 12000 },
          // 收窄到仪器 give 的 1e-7（原 1e-7–2e-7 是量程）。
          { param: 'abundanceSensitivity', kind: 'range', min: 1e-7, max: 1e-7 },
          { param: 'blankBoron', kind: 'range', min: 0.005, max: 0.01 },
          { param: 'recovery', kind: 'range', min: 0.95, max: 1.05 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/trichlorosilane-electronic', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 2000) }] },
      { anyOf: [{ item: 'mat/nitric-acid-subboiled', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/boron-selective-resin', qty: q(1, 2000) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(7, 10) }] },
      { anyOf: [{ item: 'mat/lithium-6-enriched', qty: q(1, 10000) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/mfc'],
    steps: [
      {
        note_zh: '① 水解/赶硅：10 g TCS 冰水浴水解，+0.5 g HF +20 g 亚沸 HNO₃，80 °C 蒸到近干（SiF₄ −86 °C），超纯水复溶 10 mL，稀氨调 pH 6–8',
        performedBy: 'plant/boron-free-lab',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '② 树脂富集：0.5 g 二醇季铵树脂 + 10 mL 样，**闭口**摇 30 min（B 吸附 >95 %），滤出，0.5 mL 0.5 M 亚沸 HNO₃ 洗脱 = 20×',
        performedBy: 'plant/boron-free-lab',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '③ HR-ICP-MS 进样与等离子体：¹¹B、炬箱 1 atm、Ar 15 L/min、1.2–1.6 kW；⁶Li 内标 10–50 ppb 同批加入（压质量歧视）',
        performedBy: 'plant/hr-icp-ms',
        under: [{ param: 'pressure', min: 9e4, max: 1.1e5 }],
      },
      {
        note_zh: '④ 磁扇分析：8 kV、B=0.14 T（m/z 11）、缝 10–15 µm、R=10000–12000；¹²C 尾 1e-7 ⇒ 1 ppm C 只贡献 1e-4 ppb（0.01 ppb B 的 1 %）',
        performedBy: 'plant/hr-icp-ms',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh: '⑤ 外标与空白：0.01/0.1/1/10 ppb 四点（亚沸酸基体）+ ⁶Li 内标；同批 3 个空白 ≤0.01 ppb；0.1 ppb 以上加报 ¹⁰B/¹¹B（1.5–2 %）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(11, 2) },
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...BORON_HR_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...BORON_HR_MEASURE_ROUTES];
