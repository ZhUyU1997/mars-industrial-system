/**
 * RTA 5000 h 系统寿命记录 —— 灯丝、反射罩、石英腔、片温漂移四件事一起测。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、与 `measure/rta-lamp-life` 的分工
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `data/measure/metrology.ts` 的 `measure/rta-lamp-life` 是 **2000 h、40 kW
 * 长寿命灯阵的单件寿命试验**：只点灯阵，只记灯丝失效/光衰代理，反射罩与
 * 石英腔不拆开。本文件是 **5000 h 的系统级试验**：同一台 `plant/rta-zoned`
 * 上把灯阵、反射罩、石英见证片、片温漂移四件事一起跑，交
 * `mat/rta-lifetime-record`。两条不是重复：一条是零件寿命，一条是整机寿命。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、灯丝寿命与功率：2000 h @100 %，降压 10 % 寿命 ×2
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   卤钨灯的寿命近似 L/L₀ = (V/V₀)^(−n)。题设给：
 *
 *     100 % 电压、2000 h；90 % 电压、寿命 ×2
 *     ⇒ (0.9)^(−n) = 2 ⇒ n = ln2 / ln(1/0.9) = **6.58**
 *
 *   于是：
 *
 *     100 % V（100 % P）  2000 h
 *      90 % V（~85 % P）  4000 h
 *      87 % V（~80 % P）  5000 h（2^(13/10) = 2.46 ⇒ 4920 h，取 5000）
 *
 *   功率按 P/P₀ ≈ (V/V₀)^1.55 估：90 % V ⇒ 0.85 P；87 % V ⇒ 0.80 P。
 *   这不是“灯丝温度不变、只降功率”的假降压：降压同时降电流/色温，RTA 的
 *   升温率会从 50–100 K/s 掉到 40–80 K/s；5000 h 试验的最后 1000 h 只跑
 *   1000–1050 °C 的短平台，不要求 1300 °C 满速。
 *
 *   ⇒ 记录窗口：**lampLifetime 2000–5000 h、lampPower 80–100 %**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、反射罩退化：2–6 % / 1000 h（设计值）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `make/rta-reflector` 交 24 只铝椭球罩（收集 0.65–0.70）+ 镀金背罩。
 *   RTA 冷壁、罩面 200–400 °C，铝在高温下氧化/起霜，反射率掉；本层没有
 *   1–3 µm 的绝对反射率标准，只能拿**同一只新罩做参考**测相对值：
 *
 *     每 500 h 在 1.55 µm 读一次罩面中心 φ20 光斑的反射功率
 *     相对 0 h 的同一只新罩 ⇒ 2–6 % / 1000 h（设计值）
 *
 *   ⚠️ 没有积分球/绝对反射率标准；2–6 % 是**相对值**，不是“罩面反射率
 *   从 0.88 掉到 0.83”的绝对值。`plant/monochromator` + `std/photodiode-ingaas`
 *   只保证同一几何、同一波长下的相对比较。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、石英腔：1300 °C 的 Si 沉积/失透，0.5–2 % / 500 h
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   1300 °C 下石英的两种老化：
 *
 *     ① SiO₂ + Si → 2SiO↑（有游离硅/硅片时）；SiO 落到冷面歧化
 *        2SiO → Si + SiO₂，留下硅膜；
 *     ② 石英表面析晶（方石英化），折射率/散射变坏。
 *
 *   `unblock-sodium-source.ts` 给的是**含钠**石英的失透：0.1–0.3 µm / 1000 h，
 *   92 % → 80–85 % 透过率（7–12 % / 1000 h）。RTA 是 N₂ 冷壁、无钠，取它的
 *   **1/5–1/10**：0.02–0.06 µm / 1000 h ⇒ **0.5–2 % / 500 h**（设计窗口）。
 *
 *   硅膜吸收的交叉旁证（`unblock-atmos-sight.ts`）：1 µm 硅膜在 **650 nm**
 *   吸收 33 %；0.02–0.06 µm ⇒ 0.8–2.4 % / 1000 h，与上面的 1–4 % / 1000 h
 *   同量级。⚠️ 这是 **650 nm 的旁证，不是 1.55 µm 的绝对值**：1.55 µm 的
 *   自由载流子吸收更低，本路线只用它做量级检查，实际以见证片的 1.55 µm
 *   相对透过率为准；这两个数都不是 RTA 的实测。
 *
 *   片温漂移：`plant/pyrometer` 是 1.55 µm。5 % 透过率损失 ⇒
 *   ΔT/T = (λT/c₂)(ΔL/L) = 0.137 × 5 % ⇒ **8.7 K @1273 K**（650 nm 只有
 *   3.7 K；1.55 µm 的灵敏度是 650 nm 的 2.4 倍）。0.5–2 % / 500 h ⇒
 *   **1.7–7 K / 1000 h**，记录取 **1.5–7 K / 1000 h**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、试验怎么跑
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   试验件：`plant/rta/lamp-array-long` 1 件（16×2.5 kW，1500–2000 h 额定）
 *           + `plant/rta/reflector` 1 件 + 石英见证片 1 组（`mat/quartz-pure`）
 *
 *   ① 0 h 基准：1000–1050 °C、常压 N₂、固定功率，读 T₀、I₀、V₀、
 *      反射功率 R₀（1.55 µm）、透过率 L₀、failures = 0。
 *   ② 100 % 电压点 2000 h（10 段 × 200 h；每 500 h 停灯读一次）。
 *   ③ 90 % 电压点 2000 h（累计 4000 h）。
 *   ④ 87 % 电压点 1000 h（累计 5000 h）。
 *   ⑤ 每 500 h：1.55 µm 反射/透过、灯电流/电压、失效灯数、pyrometer 读数。
 *   ⑥ 判据：2000 h 无失效只能记 **≥2000 h（右删失）**；5000 h 走完记
 *      2000–5000 h 的实测区间；2 只以内失效可旁路，但 37.5 kW 不是 40 kW。
 *
 *   ⚠️ 5000 h = 208 天；停灯/复温 10 次约 +20 h（0.4 %）。`rate` 按累计
 *   点亮 5000 h 记，不把日历时间折成能量。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、不确定度与缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   · pyrometer ±5–10 K；5 % 光衰 ⇔ 16 K，所以 `decay ≤5 %` 仍判不了，
 *     本记录只给 0.5–2 %/500 h 的**相对**透过率，不给绝对光通量。
 *   · 反射罩 2–6 %/1000 h 没有绝对反射率标准；相对值的不确定度 1–2 %。
 *   · 石英失透的 0.5–2 %/500 h 是从含钠数据缩放的**设计窗口**，不是
 *     1300 °C 的实测；见证片测的是“这一台”的累积，不是材料常数。
 *   · 灯丝寿命 2000–5000 h 是**降压外推**；同一批灯在 100 % 下只验到
 *     2000 h，5000 h 端是 87 % 电压的加速/减速组合，不是 100 % 电压的
 *     5000 h 直接证据。记录里 `lampPower` 必须与 `lampLifetime` 一起读。
 *   · 没有光通量标准/积分球；`measure/rta-lamp-life` 的 5 % 判据仍不可判，
 *     本文件不把 2 % 的相对透过率冒充 5 % 的绝对光衰。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、记录条目
// ═══════════════════════════════════════════════════════════════════════════

export const RTA_LIFETIME_ITEMS: readonly Item[] = [
  /**
   * RTA 系统寿命记录：一条记录同时带灯、罩、石英、片温四组读数。
   *
   * **单位口径**：
   *   lampLifetime    h（累计点亮；右删失记 ≥2000）
   *   lampPower       %（100 % = 额定电压；90 %/87 % 是降压点）
   *   reflectorLoss   % / 1000 h（1.55 µm 相对反射功率损失）
   *   quartzLoss      % / 500 h（1.55 µm 相对透过率损失）
   *   waferTempDrift  K / 1000 h（pyrometer 读数的系统漂移）
   *   hours           h（本次累计点亮）
   *   failures        只（16 只灯里的开路数）
   */
  {
    id: 'mat/rta-lifetime-record',
    name: 'RTA 系统寿命记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'lampLifetime', kind: 'range', min: 0, max: 5000, unit: 'h', dir: 'atLeast' },
      { param: 'lampPower', kind: 'range', min: 0, max: 100, unit: '%' },
      { param: 'reflectorLoss', kind: 'range', min: 0, max: 20, unit: '%/1000h', dir: 'atMost' },
      { param: 'quartzLoss', kind: 'range', min: 0, max: 10, unit: '%/500h', dir: 'atMost' },
      { param: 'waferTempDrift', kind: 'range', min: 0, max: 20, unit: 'K/1000h', dir: 'atMost' },
      { param: 'hours', kind: 'range', min: 0, max: 5000, unit: 'h' },
      { param: 'failures', kind: 'range', min: 0, max: 16, unit: '只', dir: 'atMost' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、测量路线
// ═══════════════════════════════════════════════════════════════════════════

export const RTA_LIFETIME_ROUTES: readonly Route[] = [
  {
    /**
     * **5000 h 系统寿命：灯阵 + 反射罩 + 石英见证片 + 片温漂移。**
     *
     *   灯阵 1 + 反射罩 1 + 石英 1 + N₂ 50 + 水 200
     *     → 记录 1 份
     *
     * 灯阵是消耗件（`part`，现场换装）；反射罩与石英见证片是试验件，
     * 不回收装回 `plant/rta-zoned`。记录是数据，不是物料。
     */
    id: 'measure/rta-lifetime',
    name: 'RTA 系统寿命测量',
    produces: [
      {
        item: 'mat/rta-lifetime-record',
        qty: q(1),
        gives: [
          { param: 'lampLifetime', kind: 'range', min: 2000, max: 5000 },
          { param: 'lampPower', kind: 'range', min: 80, max: 100 },
          { param: 'reflectorLoss', kind: 'range', min: 2, max: 6 },
          { param: 'quartzLoss', kind: 'range', min: 0.5, max: 2 },
          { param: 'waferTempDrift', kind: 'range', min: 1.5, max: 7 },
          { param: 'hours', kind: 'range', min: 5000, max: 5000 },
          { param: 'failures', kind: 'range', min: 0, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/rta/lamp-array-long', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rta/reflector', qty: q(1) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1) }] },
      // 5.3 slm N₂ × 5000 h ≈ 1 600 m³ ≈ 2 000 kg（常压冷壁的吹扫/保护气）
      { anyOf: [{ item: 'mat/nitrogen', qty: q(2000) }] },
      // 水冷夹套的补水/试验件冷却；闭式循环水不登条目，20 t 是 5000 h 的补水上限
      { anyOf: [{ item: 'mat/water', qty: q(20000) }] },
    ],
    needs: [
      'plant/white-light-source',
      'std/photodiode-ingaas',
      'plant/metrology-room',
      'plant/clean-room',
    ],
    rate: { hours: q(5000) },
    steps: [
      {
        note_zh:
          '装试验件：16 只长寿命灯阵装到 9 区机（空位加盲板）、新反射罩、石英见证片放在片位边缘；1000–1050 °C、常压 N₂、固定功率，读 T₀/I₀/V₀/R₀/L₀、failures=0',
        performedBy: 'plant/rta-zoned',
        under: [
          { param: 'temperature', min: 1000, max: 1050 },
          { param: 'pressure', min: 5e4, max: 2e5 },
        ],
      },
      {
        note_zh:
          '100 % 电压点 2000 h（10 段 × 200 h；每 500 h 停灯读 1.55 µm 反射/透过、逐组 I/V、失效灯数）',
        performedBy: 'plant/rta-zoned',
        under: [
          { param: 'temperature', min: 1000, max: 1050 },
          { param: 'pressure', min: 5e4, max: 2e5 },
        ],
      },
      {
        note_zh:
          '90 % 电压点 2000 h（累计 4000 h）：P/P₀≈0.85、寿命 ×2；每 500 h 重复同一组读数',
        performedBy: 'plant/rta-zoned',
        under: [
          { param: 'temperature', min: 1000, max: 1050 },
          { param: 'pressure', min: 5e4, max: 2e5 },
        ],
      },
      {
        note_zh:
          '87 % 电压点 1000 h（累计 5000 h）：P/P₀≈0.80、寿命 ×2.46；失效 >2 只就停，记实际小时数',
        performedBy: 'plant/rta-zoned',
        under: [
          { param: 'temperature', min: 1000, max: 1050 },
          { param: 'pressure', min: 5e4, max: 2e5 },
        ],
      },
      {
        note_zh:
          '每 500 h 光谱读数：`plant/monochromator` 1.55 µm、2–10 nm 带宽 + `std/photodiode-ingaas`；同一几何、同一只新罩做 R₀，石英见证片做 L₀；相对值，不是绝对反射率',
        performedBy: 'plant/monochromator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '片温漂移：`plant/pyrometer` 1.55 µm 读挡光筒后固定点；5 % 透过率损失 ⇒ 8.7 K @1273 K；每 500 h 与 0 h 基准比',
        performedBy: 'plant/pyrometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '写记录：lampLifetime（右删失记 ≥2000）、lampPower、reflectorLoss/1000h、quartzLoss/500h、waferTempDrift/1000h、hours、failures；5000 h 走完记实测区间，不把 2 % 相对透过率写成 5 % 绝对光衰',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '灯阵 1（16×2.5 kW，消耗件）+ 反射罩 1 + 石英见证片 1 + N₂ 2 000 kg（≈5.3 slm × 5000 h）+ 水 20 000 kg（闭式循环补水）→ 记录 1 份。灯阵按 2000–5000 h 寿命试验报废，不回收；反射罩/石英是试验件，不装回整机；记录是数据，不是物料，产物按份计、没有质量账',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...RTA_LIFETIME_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...RTA_LIFETIME_ROUTES];
