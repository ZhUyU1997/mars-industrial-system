/**
 * HR-ICP-MS 的 R=10000 档：**精密缝 + 精密磁铁电源 + NMR 场探头**三件，把
 * 常导磁扇从 R 4000–8000 推到 10000–12000。
 *
 * 本文件放仪器、零件与 `make/*` 路线（R13）；测量路线与记录在 `data/measure/`
 * （本文件不动那一半）。整机仍是 `plant/hr-icp-ms` —— 同一个 id 的第二条产出
 * 路线（`make/hr-icp-ms-hr`），与 `make/ref-flat-figure` / `make/ref-flat-open`
 * 同一个写法：**尺寸不变、规格变，改规格那一步自己就是一条路线。**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、缺口：R 4000–8000 对 10000，差 2.5 倍
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `plant/hr-icp-ms`（`data/machine/boron.ts`）现在只交 **R 4000–8000**
 *   （`make/hr-icp-ms` 的 gives）。它的文件头 §五④ 写清了挡路的两件：
 *
 *     10 µm 缝 + 刀口平行度 3–5 µm ⇒ 有效缝宽 18.75–40 µm ⇒ R 3750–8000；
 *     常导电源 1–2 ppm/h ⇒ 按 R=10000 的场稳 0.5 ppm 差 2–4 倍。
 *
 *   分辨率的关系只有一条（90° 磁扇、r = 0.3 m）：
 *
 *     R = r / (2·s_eff)       s_eff = 有效缝宽（机械缝 + 平行度 + 像差/束宽）
 *     s_eff = 15.0 µm → R = 10 000
 *     s_eff = 12.5 µm → R = 12 000
 *     s_eff = 18.75 µm → R = 8 000（现状的上端）
 *
 *   所以「R 到 10000」不是换磁扇，是**把 s_eff 从 18.75 压到 12.5–15 µm**：
 *
 *     机械缝        10 µm（现状就是 10–40 可调，但 10 µm 端的平行度不够）
 *     刀口平行度    1 µm（现状 3–5 µm）      → 减 2–4 µm
 *     束宽/像差     1.5–2 µm（8 keV、20 mm 束包络）
 *     剩余像差      1–3 µm（Nier-Johnson 的二阶项，靠 ESA 的 70° 与缝位置）
 *     ─────────────────────────────────────
 *     s_eff         12.5–15 µm               → **R 10000–12000**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、精密缝：10 µm 的刀口平行度 1 µm 为什么值 2.5 倍
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   缝宽 10 µm、刀口长 10 mm。若两片刀口在 10 mm 上张开/收拢 3–5 µm，那么
 *   **缝宽沿高度是变的**：束包络 20 mm 打上去，有效宽度取的是加权平均，
 *   近似 s_eff = s + 平行度/2 = 11.5–12.5 µm —— 还是不够解释 18.75。
 *   剩下的 6–7 µm 来自**像差与束宽**（见第一节的账）。
 *
 *   新缝把平行度从 3–5 压到 **1 µm**（研磨 + 在线比测），再把缝座做成
 *   **316L + 氧化铝绝缘 + 水冷**：热稳 0.1 K。为什么热稳也要写：316L 的
 *   16 ppm/K 在 20 mm 的座上，0.1 K 是 32 nm —— 对 10 µm 缝是 0.3 %，
 *   不写也对；但**没有水冷时**缝座被束流烤到 1–2 K，那就是 0.3–0.6 µm
 *   （3–6 %），R 会随束流漂 300–600。所以热稳这一格不是凑数。
 *
 *   缝的调节：0.5–1 µm/格（现状 3–5 µm/格）—— 要扫 12.5 µm 与 15 µm 两档，
 *   步进必须 ≤1 µm，否则调不到。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、电源与 NMR：0.5 ppm 的场稳怎么来
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   场稳的账（磁扇 r = 0.3 m、色散 D ≈ r）：
 *
 *     1 ppm 的场漂 → 束在出射缝上移 0.3 m × 1e-6 = **0.3 µm**
 *     R=10000 的峰宽（10 % 谷）是 15 µm → 0.3/15 = **2 %**
 *     要峰形拟合的残差 <0.5 %，场稳必须 ≤0.25 ppm；取 **0.1–0.5 ppm/h**
 *
 *   常导电源的现状是 1–2 ppm/h（`plant/hr-icp-ms/magnet` 的 `stability`
 *   0.5–2 ppm）。新电源做三件事：
 *
 *     ① 18 位设定：500 A / 2^18 = **1.9 mA/步** = 3.8 ppm/步。R=10000 的
 *        峰宽 100 ppm（Δm/m = 1e-4）⇒ 每峰 26 步 —— 够扫峰形。14 位
 *        （60 ppm/步）只有 1.7 步/峰，那是 R=4000 的档。
 *     ② 0.1 ppm 的电流基准 + 24 h 老化：用 `plant/current-balance`
 *        （电流天平，0.1 ppm 档）标定，不用分流器（0.01 % = 100 ppm）。
 *     ③ NMR 闭环：质子探头在 0.14 T 的 Larmor 频率是
 *        42.576 MHz/T × 0.14 T = **5.96 MHz**；0.05 ppm 的频率分辨
 *        （≈0.3 Hz）把场的慢漂锁到 0.05–0.2 ppm/h。探头只锁**慢漂**
 *        （带宽 1–10 Hz），快纹波靠电源自己的 LC 滤波（2–5 ppm）。
 *
 *   ⚠️ NMR 探头要 0.1 T 以上的场：m/z 11 的 0.14 T 够，m/z 2 的 0.03 T
 *   不够（Larmor 1.3 MHz 也能做，但信噪比掉 10 倍）。所以本档写
 *   **m/z ≥ 6 的场用 NMR 闭环，m/z 2–6 退回电源自身 0.5 ppm** —— 这是
 *   交付窗口 0.1–0.5 ppm 的上端来源，不是「全质量范围都 0.1」。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、峰形：10 % 谷的定义
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   分辨率在磁扇上按 **10 % 谷**定义：两个等高峰分开到谷底为峰高的 10 % 时，
 *   R = m/Δm。R=10000 在 m/z 11 上 ⇒ Δm = 11/10000 = **0.0011 u**；
 *   R=12000 ⇒ 0.00092 u。¹¹B（11.0093）与 ¹²C（12.0000）差 0.99 u，
 *   分开 **900–1000 倍**，所以 ¹²C 的峰尾在 ¹¹B 处的贡献按
 *   `abundanceSensitivity` 记（1e-7），不是靠 R 硬分。
 *
 *   峰形的三笔（10 % 谷判据下）：
 *     三角峰（缝函数）        10 % 谷宽 = 1.8 × 半高宽
 *     缝的平顶（10 µm/15 µm） 谷底抬高 1–2 %
 *     场漂（0.5 ppm/h）       30 min 扫峰内 0.5 % 的偏移
 *   ⇒ 10 % 谷这一档在 R 10000–12000 下**判得出**；R 4000–8000 下谷底
 *   被 ¹²C 尾垫到 15–20 %，判不了「10 %」—— 这就是本档与旧档的判据差别。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、交付
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `plant/hr-icp-ms` 的第二条产出路线 `make/hr-icp-ms-hr`：
 *     resolution           10000–12000（10 % 谷）
 *     abundanceSensitivity 1e-7（¹²C 尾在 ¹¹B 处）
 *     stability            0.1–0.5 ppm/h（m/z ≥6 的 NMR 闭环档）
 *     boron                0.01–0.05 ppb（R=10000 下 ¹¹B 的空白限）
 *
 *   旧路线 `make/hr-icp-ms`（R 4000–8000）不动 —— 它是低分辨档，两条路线
 *   同一个 id，各交各的窗口。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、缺口（按 R7 记量级）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **磁扇铁 2.5–4 t**：`plant/melting-furnace` 一炉 2–3 t ⇒ 2 炉；极面
 *      磨削平面度 5 µm、平行度 10 µm（boron.ts §五⑤）。
 *   ② **10 % 谷没有标准品**：判峰形要有两个已知质量差的峰（如 ¹¹B/¹²C 的
 *      混合物）与一条 10 % 谷的判据曲线；本层只有单元素标液，峰形靠
 *      「缝函数 + 场稳」算，**不是实测谱图**。
 *   ③ **NMR 探头的 0.01 ppm 是设计值**：没有第二台 NMR 互比；0.05 ppm
 *      的频率分辨靠 TCXO 的 0.1 ppm 老化，本层没有铷钟。
 *   ④ **缝的 1 µm 平行度靠 `plant/stylus-profilometer`（0.1 nm 垂直、
 *      1 µm 横向）读**：横向 1 µm 正好是判据的量级，读 1 µm 平行度只有
 *      1–2 倍余量；更好的要白光干涉或电容测微仪（本层没有）。
 *   ⑤ **PFA / ⁶Li 内标**仍缺（与 `data/machine/boron.ts` §五③ 同源）：
 *      R=10000 解决的是 ¹²C 尾，不解决器皿与内标。
 *   ⑥ **m/z <6 的场稳只到 0.5 ppm**：NMR 在 0.03–0.05 T 上的信噪比不够，
 *      这一段仍按电源自身 0.5 ppm 记。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目
// ═══════════════════════════════════════════════════════════════════════════

export const HR_ICP_MS_STAGE_ITEMS: readonly Item[] = [
  /**
   * **精密可调缝。** 10 µm 档、刀口平行度 **0.5–1 µm**、热稳 **0.05–0.1 K**、
   * 调节 **0.5–1 µm/格**、两对（x/y）。
   *
   * 与 `plant/hr-icp-ms/slits`（10–40 µm、平行度 3–5 µm、3–5 µm/格）的差别
   * 只有三格，但三格都卡在 R=10000 上：
   *
   *   · 平行度 1 µm 让有效缝宽从 18.75 降到 12.5–15 µm（R 8000 → 10000–12000）；
   *   · 热稳 0.1 K 让 R 不随束流漂（316L 座 20 mm、16 ppm/K、1 K → 0.32 µm）；
   *   · 0.5–1 µm/格让 12.5 与 15 µm 两档调得到（3–5 µm/格调不到中间值）。
   *
   * 材料仍是钼片（线切割 + 研磨）+ 316L 座 + 氧化铝绝缘：钼的刚性够、热膨胀
   * 5 ppm/K 比 316L 小 3 倍，刀口不会自己走。
   */
  {
    id: 'plant/precision-slit',
    name: 'Precision Adjustable Slit', name_zh: '精密可调缝',
    unit: '套',
    category: 'part',
    props: [
      { param: 'slitWidth', kind: 'range', min: 5, max: 20, unit: 'µm' },
      { param: 'edgeParallelism', kind: 'range', min: 0, max: 1, unit: 'µm', dir: 'atMost' },
      { param: 'thermalStability', kind: 'range', min: 0, max: 0.1, unit: 'K', dir: 'atMost' },
      { param: 'adjustment', kind: 'range', min: 0, max: 2, unit: 'µm', dir: 'atMost' },
      { param: 'pairs', kind: 'range', min: 2, max: 3, unit: '对' },
    ],
  },

  /**
   * **磁铁精密电源。** 电流 **100–500 A**、稳定度 **0.1–0.5 ppm/h**、
   * 设定 **18 位**（3.8 ppm/步）、纹波 2–5 ppm。
   *
   * 500 A 的算法：B = µ₀·N·I/gap，m/z 11 要 0.14 T、gap 40 mm
   * ⇒ N·I = 0.14 × 0.04 / (4π×10⁻⁷) = **4 456 安匝**；N = 10–45 匝
   * ⇒ I = 100–445 A。留 10 % 余量到 500 A。
   *
   * 三件：扼流圈 + 整流/调整管 + 0.1 ppm 的电流基准。18 位是给 R=10000
   * 的峰扫用的（14 位 60 ppm/步只有 1.7 步/峰，扫不出峰形）。
   */
  {
    id: 'plant/magnet-power-supply',
    name: 'Precision Magnet Power Supply', name_zh: '磁铁精密电源',
    unit: '台',
    category: 'part',
    props: [
      { param: 'current', kind: 'range', min: 100, max: 500, unit: 'A' },
      { param: 'stability', kind: 'range', min: 0, max: 0.5, unit: 'ppm/h', dir: 'atMost' },
      { param: 'setpointBits', kind: 'range', min: 14, max: 18, unit: '位' },
      { param: 'ripple', kind: 'range', min: 0, max: 10, unit: 'ppm', dir: 'atMost' },
    ],
  },

  /**
   * **NMR 场探头（质子）。** 场 0.1–1 T、分辨 **0.01–0.05 ppm**。
   *
   * 42.576 MHz/T：0.14 T → 5.96 MHz。0.05 ppm 的场对应 0.3 Hz 的频率分辨，
   * 用一个 0.1 ppm 的 TCXO 与本振混频、锁相到 1–10 Hz 带宽即可。
   * 它只锁**慢漂**（热、电源老化），快纹波（2–5 ppm）靠电源的 LC 滤波。
   *
   * ⚠️ 0.1 T 以下信噪比掉 10 倍（m/z 2 的 0.03 T），所以 m/z <6 退回
   * 电源自身的 0.5 ppm。
   */
  {
    id: 'plant/nmr-field-probe',
    name: 'NMR Field Probe', name_zh: 'NMR 场探头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'field', kind: 'range', min: 0.1, max: 1, unit: 'T' },
      { param: 'resolution', kind: 'range', min: 0, max: 0.05, unit: 'ppm', dir: 'atMost' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线
// ═══════════════════════════════════════════════════════════════════════════

export const HR_ICP_MS_STAGE_ROUTES: readonly Route[] = [
  {
    /**
     * **精密缝：钼粉 0.02 + 316L 0.2 + 氧化铝 2 + 铜线 0.05 + 水 2 → 缝 1 套。**
     *
     * 五道工序：线切割/研磨钼片 → 刀口研磨 → 刀口轮廓（触针轮廓仪）→
     * 平行度（比较仪）→ 装座/水冷/热稳。
     *
     * 为什么用触针轮廓仪：0.1 nm 垂直 + 1 µm 横向，正好读刀口的圆角与
     * 10 mm 上的高度差；平行度 1 µm 落在它的横向分辨上（1–2 倍余量）。
     */
    id: 'make/precision-slit',
    name: 'Precision Adjustable Slit Manufacturing', name_zh: '精密可调缝制造',
    produces: [
      {
        item: 'plant/precision-slit',
        qty: q(1),
        gives: [
          { param: 'slitWidth', kind: 'range', min: 10, max: 10 },
          { param: 'edgeParallelism', kind: 'range', min: 0.5, max: 1 },
          { param: 'thermalStability', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'adjustment', kind: 'range', min: 0.5, max: 1 },
          { param: 'pairs', kind: 'range', min: 2, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/molybdenum-powder', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 5) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(80) },
    steps: [
      {
        note_zh: '钼片 0.05 mm 厚：线切割开 10 mm 长的缝，磨到 12–15 µm 留研磨余量',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '刀口研磨：0.5 µm 碳化硅 + 铸铁研具，8 字轨迹；两片对研到 10.0 µm（10 mm 高上 ±0.5 µm）',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '刀口轮廓：触针轮廓仪读圆角 ≤0.5 µm、10 mm 上的高度差 ≤0.5 µm（平行度的一半）',
        performedBy: 'plant/stylus-profilometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '平行度与缝宽：比较仪 + 显微镜，10 点/片，平行度 0.5–1 µm；调节座 0.5–1 µm/格',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装 316L 座 + 氧化铝绝缘 + 水冷：0.5 L/min；热稳 0.05–0.1 K（1 K 束流加热下）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **磁铁精密电源：铜线 8 + 钢板 30 + 铝 5 + 运放 4 + 计数器 2 + 接触器 2
     * + 水 10 → 电源 1 台。**
     *
     * 四道工序：绕扼流圈 → 装整流/调整管 → 电流标定（电流天平 0.1 ppm）→
     * 24 h 稳定度。
     *
     * 为什么不用分流器：0.01 % 的分流器是 100 ppm，比 0.5 ppm 的判据粗 200 倍；
     * 电流天平（`plant/current-balance`）是这条链上唯一 0.1 ppm 档的电流基准。
     */
    id: 'make/magnet-power-supply',
    name: 'Precision Magnet Power Supply Manufacturing', name_zh: '磁铁精密电源制造',
    produces: [
      {
        item: 'plant/magnet-power-supply',
        qty: q(1),
        gives: [
          { param: 'current', kind: 'range', min: 100, max: 500 },
          { param: 'stability', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'setpointBits', kind: 'range', min: 18, max: 18 },
          { param: 'ripple', kind: 'range', min: 2, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper-wire', qty: q(8) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(30) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(5) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(120) },
    steps: [
      {
        note_zh: '绕扼流圈与滤波电感：8 kg 铜线、30 kg 钢芯；500 A 下纹波 2–5 ppm（LC 滤波）',
        performedBy: 'lathe',
      },
      {
        note_zh: '装整流/调整管/18 位 DAC：500 A / 2^18 = 1.9 mA/步（3.8 ppm/步）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '电流标定：电流天平（0.1 ppm 档）读 100/250/500 A 三点；不用分流器（0.01 % = 100 ppm）',
        performedBy: 'plant/current-balance',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '24 h 稳定度：500 A 连续，1 ppm/h 记录 24 点；老练后 0.1–0.5 ppm/h',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **NMR 场探头：铜线 0.2 + 玻璃 0.1 + 水 2 + 运放 2 → 探头 1 件。**
     *
     * 四道工序：绕探头线圈 → 封水样安瓿 → 装振荡/锁相 → 在磁扇上标定。
     * 0.14 T → 5.96 MHz；0.05 ppm 的频率分辨（0.3 Hz）。
     */
    id: 'make/nmr-field-probe',
    name: 'NMR Field Probe Manufacturing', name_zh: 'NMR 场探头制造',
    produces: [
      {
        item: 'plant/nmr-field-probe',
        qty: q(1),
        gives: [
          { param: 'field', kind: 'range', min: 0.1, max: 1 },
          { param: 'resolution', kind: 'range', min: 0.01, max: 0.05 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room', 'plant/hr-icp-ms/magnet'],
    rate: { hours: q(40) },
    steps: [
      {
        note_zh: '绕探头线圈：φ8 mm、10 匝，Q ≥50（5.96 MHz）；线圈与场垂直 ≤1°',
        performedBy: 'lathe',
      },
      {
        note_zh: '封水样安瓿：φ5 mm 玻璃管、超纯水 0.2 mL，火焰封口；弛豫时间 T₁ 2–3 s',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 30 }],
      },
      {
        note_zh: '装振荡/锁相：5.96 MHz 本振 + 混频 + 1–10 Hz 锁相；0.3 Hz 分辨（0.05 ppm）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '在 0.14 T 的磁扇上标定：与电源的 100/250/500 A 三点比对，0.01–0.05 ppm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **HR-ICP-MS 高分辩档：同 23 件 BOM，换缝 + 加电源 + 加 NMR → R 10000–12000。**
     *
     *   磁扇 1 + ESA 1 + **精密缝 1** + 飞行管 1 + **精密电源 1** + **NMR 探头 1**
     *   + ICP 前端 18 件 + 泵 4 件 + 探测器 2 件 + 接触器 2 件 → HR-ICP-MS 1 台
     *
     * 六道工序：前端 → 磁扇/ESA → 缝/电源/NMR → 抽真空检漏 → 调 R →
     * 场稳与峰形。
     *
     * 与 `make/hr-icp-ms`（`data/machine/boron.ts`）的差别只有三件（缝、电源、
     * NMR），其余 23 件同 BOM —— 这是**同一台仪器的第二条产出路线**，不是新机器。
     */
    id: 'make/hr-icp-ms-hr',
    name: 'HR-ICP-MS System Manufacturing', name_zh: 'HR-ICP-MS 整机制造',
    produces: [
      {
        item: 'plant/hr-icp-ms',
        qty: q(1),
        gives: [
          { param: 'boron', kind: 'range', min: 0.01, max: 0.05, record: 'mat/boron-hr-record' },
          { param: 'phosphorus', kind: 'range', min: 0.02, max: 0.08 },
          { param: 'titanium', kind: 'range', min: 0.01, max: 0.05 },
          { param: 'resolution', kind: 'range', min: 10000, max: 12000, record: 'mat/boron-hr-record' },
          { param: 'massRange', kind: 'range', min: 2, max: 260 },
          { param: 'abundanceSensitivity', kind: 'range', min: 1e-7, max: 1e-7, record: 'mat/boron-hr-record' },
          { param: 'stability', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'recovery', kind: 'range', min: 0.95, max: 1.05 },
          { param: 'collisionGas', kind: 'enum', oneOf: ['H2'] },
          { param: 'kED', kind: 'enum', oneOf: ['none'] },
          { param: 'bias', kind: 'range', min: 0, max: 0 },
          { param: 'traceMetalDL', kind: 'range', min: 0.2, max: 2 },
          { param: 'copperInOil', kind: 'range', min: 0.5, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/hr-icp-ms/magnet', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hr-icp-ms/esa', qty: q(1) }] },
      { anyOf: [{ item: 'plant/precision-slit', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hr-icp-ms/flight-tube', qty: q(1) }] },
      { anyOf: [{ item: 'plant/magnet-power-supply', qty: q(1) }] },
      { anyOf: [{ item: 'plant/nmr-field-probe', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/torch', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/rf-generator', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/load-coil', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/nebulizer', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/spray-chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/peristaltic-pump', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/sampler-cone', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/skimmer-cone', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/ion-lens', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/collision-cell', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/interface-housing', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/gas-panel', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/enclosure', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-vacuum/pump/rough', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-vacuum/pump/turbo', qty: q(2) }] },
      { anyOf: [{ item: 'plant/euv-vacuum/pump/cold-trap', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-vacuum/pump/gauge', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sims/electron-multiplier', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sims/faraday-cup', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(2) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/euv-vacuum'],
    rate: { hours: q(300) },
    steps: [
      {
        note_zh: '① 装 ICP 前端（炬、射频、雾化、锥、透镜、气路、箱体）—— 与 `make/icp-ms` 同一套工序',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '② 装磁扇与 ESA：Nier-Johnson 几何（90° + 70°），离子光学轴对中 ≤0.05 mm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '③ 装精密缝（10 µm、平行度 0.5–1 µm）与精密电源/NMR：NMR 锁慢漂，电源 18 位、0.1–0.5 ppm/h',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '④ 抽真空检漏：接 euv-vacuum 抽 1e-2–1e-1 Pa，关阀 1 h 压升 ≤1e-3 Pa·L/s',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-2, max: 1e-1 }],
      },
      {
        note_zh: '⑤ 调 R：¹¹B 峰、r/(2s_eff) 实测 10 000–12 000（10 % 谷）；质量轴 2–260 u',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '⑥ 场稳与峰形：NMR 闭环 0.1–0.5 ppm/h（m/z ≥6）、¹²C 尾 1e-7、10 % 谷判据',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '磁扇 1 + ESA 1 + 精密缝 1 + 飞行管 1 + 精密电源 1 + NMR 1 + 复用件 19 + 泵 4 + 探测器 2 + 接触器 2 → HR-ICP-MS 1 台；按件计。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...HR_ICP_MS_STAGE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...HR_ICP_MS_STAGE_ROUTES];
