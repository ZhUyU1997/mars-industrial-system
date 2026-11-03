/**
 * CGH 的 0.5 µm 位置误差：一台**激光干涉闭环的 e-beam 写入台**，外加真空腔里的
 * 热漂与电荷两条支路。
 *
 * 本文件放仪器、零件与 `make/*` 路线；测量路线若需要另放 `data/measure/`
 * （R13）。整机 `plant/cgh-e-beam-writer` 是 `plant/null-test/cgh-160`
 * （`data/machine/asphere.ts`）那台写入机的升级版：同一根柱，换台、加罩、加电荷源。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、缺口：0.5 µm 对 10 µm，差 20 倍，卡的是台不是柱
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `plant/null-test/cgh-160` 要求 positionError **≤0.5 µm**（`asphere.ts` 的
 *   `make/null-test-cgh-160` 在 `needs` 里写的窗口），而 `plant/e-beam-column`
 *   的台是 **10 µm**（`plant/e-beam-column/stage` 的 `positionError` 上限
 *   10 000 nm；整机 prop 的下限 10 nm 是「最好档」，不是已交付的档）。
 *
 *   柱本身不是瓶颈：20–100 nm 束斑（`spotSize`）、100 µm 扫描场内 20 nm 的
 *   DAC 寻址、20–30 kV 加速 —— 写 1–5 µm 的 CGH 线宽绰绰有余。**缺的是
 *   φ160 上的分块拼接**：e-beam 的扫描场 0.1–1 mm，φ160 要拼 160 块以上，
 *   每块的落点由台定；台 10 µm 的落点误差直接变成块间 10 µm 的错位。
 *
 *   所以补的不是「更细的束」，是「知道走到哪」的台：
 *
 *     旧：丝杠 + 步进电机 + 光栅尺（10 µm，开环/半闭环）
 *     新：双频激光干涉闭环 + 0.5 µm 目标 + 阿贝臂 ≤20 mm + 温控罩
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、台：0.5–1 µm 的预算（160 mm 行程）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   项                                     窗口          来源
 *   ─────────────────────────────────────────────────────────────────
 *   激光波长基准（633 nm He-Ne）            0.1 ppm        160 mm × 1e-7 = 16 nm
 *   空气折射率补偿残差                      0.02–0.05 ppm  20–50 nm（温度/气压/湿度）
 *   伺服残差（200 Hz 闭环）                 0.3–0.7 µm     丝杠回差 0.5 µm、摩擦、增益
 *   阿贝误差（臂 ≤20 mm、俯仰 1 µrad）      0.02 µm        20 mm × 1 µrad = 20 nm
 *   热漂（罩内 0.02–0.05 K，30 h 写）        0.15–0.45 µm   5–15 nm/h × 30 h
 *   ─────────────────────────────────────────────────────────────────
 *   合成（线性加伺服与热漂；静态项 0.086 µm 按 RSS 并入可忽略）
 *                                          **0.5–1.0 µm**
 *
 *   核一遍：0.3 + 0.15 = 0.45 → 0.5；0.7 + 0.45 = 1.15 → 取 1.0（窗口上端）。
 *   16 + 50 + 20 nm 的静态项是 0.086 µm，比伺服小一个量级，所以**台的极限在
 *   伺服与热漂，不在尺**。这一句决定了下面为什么要单独做温控罩。
 *
 *   为什么不写 0.05 µm（50 nm）：160 mm 上 50 nm 是 **0.3 ppm**，要
 *   （a）丝杠换成无回差的直线电机 + 气浮/磁浮，（b）阿贝臂 <1 mm，
 *   （c）30 h 内温漂 <0.05 µm（0.0017 µm/h）。三样本层都没有 —— 这不是
 *   「再调调 PID」，是换一种台。0.5 µm 是这一层能写出的最好档。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、热漂与充电：两个必须单独写的支路
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **热漂**：真空腔里没有空气对流，只有辐射与导轨发热。腔壁 0.05 K 的
 *      波动在 316L 的 16 ppm/K 上就是 160 mm × 16e-6 × 0.05 = **128 nm**；
 *      阿贝臂 20 mm 上只剩 16 nm —— 所以**缩短阿贝臂比控温更有效**。温控罩
 *      的 0.02–0.05 K 保的是激光头/接收器与光栅的零点（漂 0.1 µm 量级），
 *      台架的热漂靠激光闭环本身压掉（激光读的是台相对镜子的位移，不是绝对）。
 *
 *   ② **充电**：石英是绝缘体，20 keV 电子打进去出不来，表面积到 10–100 V；
 *      对 20 kV 的束，10 V 的局部场在 100 µm 扫描场内偏 **0.1–1 µm**，还会
 *      改变聚焦（像散）。这就是「写得出线宽、拼不准位置」的第二个来源。
 *      解法是**电荷泄放层**：甩胶后蒸 20–50 nm 的 KCl（片阻 1e6–1e9 Ω/sq），
 *      把表面电位放到 <1 V；写完全片浸水 30 s 溶掉，不碰胶、不碰石英。
 *      KCl 的账：30 nm × 2.16 g/cm³ = 6.5e-6 g/cm²；φ160 面积 201 cm²
 *      ⇒ **1.3 mg/片**（含边缘留量按 2 mg 备料）。
 *
 *   ③ 两条支路的关系：热漂让**块与块之间**错位（慢、可被激光闭环压）；
 *      充电让**每一块内部**的线位置漂（快、闭环管不了，只能泄放）。所以
 *      一个写在台上、一个写在工艺里，不是同一件事。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、交付
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `plant/cgh-e-beam-writer`（整机，1 台）
 *     positionError        0.5–1 µm      （旧台 10 µm，差 10–20×）
 *     spotSize             20–100 nm
 *     accelVoltage         20–30 kV
 *     stageStroke          160 mm
 *     drift                5–15 nm/h     （30 h 写 → 0.15–0.45 µm）
 *     temperatureStability 0.02–0.05 K
 *
 *   `plant/null-test/cgh-160`（`asphere.ts` 那条路线的产出）
 *     positionError        0.5–1 µm      （原 0.5 µm 固定值 → 窗口，见第五节）
 *
 *   于是 `make/null-test-cgh-160` 的 `needs` 窗口从
 *   `plant/e-beam-column`（10 µm，`functional-lost`）换成
 *   `plant/cgh-e-beam-writer`（0.5–1 µm，**覆盖**）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、为什么 CGH 端写 0.5–1 µm，而不是继续钉 0.5
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   0.5 µm 是**设计门**，不是这台台能保证的一档：台的窗口 0.5–1 µm，
 *   所以 CGH 的 positionError 只能写 0.5–1 µm —— 把 1 µm 端藏起来才是假的。
 *   这一档对 CGH 的波前影响是**整体倾斜/离焦**（写入图形的整体落点），
 *   装调时用镜架就补掉了；**局部线位置**由柱的 100 µm 扫描场定（20 nm
 *   DAC 寻址），不受台影响。所以 `wavefront ≤50 nm` 这一格不变 —— 这一句
 *   是把「台的位置误差」与「线位置误差」分开的关键，不能省。
 *
 *   代价：块间错位 0.5–1 µm 在 CGH 的相位上留下 2π·δ/P 的台阶（P = 局部
 *   周期 1–5 µm）—— δ=1 µm、P=5 µm 时 0.2 周 = 126 nm 波前。**这一笔不在
 *   50 nm 的预算里**：它落在块边界上，是「拼接缝」而不是全口径面形。所以
 *   本文件的交付只到 positionError；**拼接缝的相位误差是下一层缺口**（见
 *   第六节②），不冒充 wavefront 50 nm。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、缺口（按 R7 记量级）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **0.5 µm 端是伺服+热漂的合成**：0.3 + 0.15 = 0.45 µm，余量只有
 *      0.05 µm。要稳到 0.5 µm 以内，得把丝杠回差从 0.5 压到 0.2 µm
 *      （2.5×）或把 30 h 的热漂压到 0.2 µm（2.3×）—— 两样都要换件。
 *   ② **拼接缝相位 126 nm**（δ=1 µm、P=5 µm）：50 nm 的波前预算里没有这一笔；
 *      要压到 20 nm，δ 得 ≤0.16 µm（6×），回到 ① 的墙。
 *   ③ **电荷泄放层的均匀性 2–5 %**：30 nm × 5 % = 1.5 nm 的厚度差，对 20 keV
 *      电子的透射率影响 <0.1 %，可忽略；但 KCl 吸潮（湿度 >40 % 结块）——
 *      真空腔内没问题，取出到手套箱的 10 min 里要控湿。
 *   ④ **没有原位束漂监测**：30 h 里柱的束流/像散漂移只能靠写前写后各测一次；
 *      中间 30 h 的漂移没量具（要原位法拉第杯 + 自动对中，本层没有）。
 *   ⑤ **CD-SEM 读 20 nm 束斑**：`plant/cd-sem` 的 `cdAccuracy` 1.5 nm、
 *      `cdRepeatability` 0.3 nm —— 对 20–100 nm 的束斑够，但读的是刻蚀后的
 *      点阵，不是束斑本身（差一道胶/刻蚀的展宽 10–20 nm）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目
// ═══════════════════════════════════════════════════════════════════════════

export const CGH_EBEAM_ITEMS: readonly Item[] = [
  /**
   * **CGH 写入台的激光干涉闭环工作台。** 行程 100–200 mm 档、本文件交付
   * **160 mm**；positionError **0.5–1 µm**、读数 1–10 nm、漂移 5–15 nm/h。
   *
   * 它复用 `plant/laser-stage` 的七件：干涉头（`.../head`）、接收器
   * （`.../receiver`）、丝杠滑台（`.../carriage`）、微动台（`.../fine-stage`）、
   * 控制器（`.../controller`）、反射镜 ×2（`.../mirror`）、基座（`.../base`）。
   * 与那台整机（`plant/laser-stage`，positioning ≤10 µm）的差别是：
   *
   *   · 行程 160 mm 而不是 2 m —— 短行程的丝杠回差与阿贝臂都小一个量级；
   *   · 基座加厚 + 三点支撑，俯仰 1 µrad 级；
   *   · 闭环目标 0.5 µm（那台是 10 µm）；
   *   · 阿贝臂 ≤20 mm（那台 ≤100 mm）。
   *
   * 10–20× 的提升不是魔法：那台的 10 µm 是**2 m 行程 + 100 mm 阿贝臂**的
   * 综合值；短行程 + 小阿贝臂 + 同一只 0.1 ppm 的激光尺，0.5–1 µm 是同一套
   * 硬件的短程档。**同一只尺，两档行程。**
   */
  {
    id: 'plant/cgh-e-beam/laser-stage',
    name: 'CGH Writer Stage Laser-Interferometer Closed-Loop Stage', name_zh: 'CGH 写入台的激光干涉闭环工作台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'positionError', kind: 'range', min: 0, max: 1000, unit: 'nm', dir: 'atMost' },
      { param: 'stroke', kind: 'range', min: 100, max: 200, unit: 'mm', dir: 'atLeast' },
      { param: 'readout', kind: 'range', min: 0, max: 10, unit: 'nm', dir: 'atMost' },
      { param: 'drift', kind: 'range', min: 0, max: 0.015, unit: 'µm/h', dir: 'atMost' },
      { param: 'abbeOffset', kind: 'range', min: 0, max: 20, unit: 'mm', dir: 'atMost' },
    ],
  },

  /**
   * **真空腔温控罩。** 罩内 0.02–0.05 K、梯度 0.02–0.1 K/m、隔声 25–35 dB。
   *
   * 它罩住写入台与激光头：外层 1 mm 钢板 + 15 mm 矿棉，内层 Peltier 4 片
   * （60 W/片）+ 热敏电阻 3 只，门缝磁性胶条。**它不控整台柱的温度**（柱的
   * 阴极 1750–1800 °C 是另一本账），只控台/尺/工件这一段的 0.05 K —— 因为
   * 热漂的 128 nm/K 只在这一段上。
   *
   * ⚠️ 0.05 K 不是「恒温间」：`plant/metrology-room` 的 ±0.5 K 差 10 倍，
   * 但真空腔没有对流，只能靠辐射 + Peltier；0.05 K 是这一层的设计值。
   */
  {
    id: 'plant/cgh-e-beam/thermal-shield',
    name: 'Vacuum Chamber Thermal Shield', name_zh: '真空腔温控罩',
    unit: '件',
    category: 'part',
    props: [
      { param: 'temperatureStability', kind: 'range', min: 0, max: 0.05, unit: 'K', dir: 'atMost' },
      { param: 'gradient', kind: 'range', min: 0, max: 0.1, unit: 'K/m', dir: 'atMost' },
      { param: 'acousticAttenuation', kind: 'range', min: 20, max: 40, unit: 'dB', dir: 'atLeast' },
    ],
  },

  /**
   * **电荷泄放源（KCl 蒸发舟 + 挡板）。** 20–50 nm、速率 0.1–1 nm/s、均匀性 ≤5 %。
   *
   * 石英 CGH 是绝缘体，20 keV 电子写上去会充电（表面 10–100 V），局部场把
   * 束偏 0.1–1 µm。解法是甩胶后蒸一层 KCl：片阻 1e6–1e9 Ω/sq，表面电位
   * 放到 <1 V；写完全片浸水 30 s 溶掉（KCl 溶解度 34 g/100 mL，30 nm 膜
   * 10 s 就光），不碰胶、不碰石英。
   *
   * 这一件是**舟 + 挡板 + 水冷**，不是整台蒸发机：它装在写入机的腔里，
   * 与柱共用真空。KCl 本身是 `mat/potassium-chloride`，在 CGH 路线里按
   * 2 mg/片 投料（见 `data/machine/asphere.ts` 的 `make/null-test-cgh-160`）。
   */
  {
    id: 'plant/cgh-e-beam/charge-bleed',
    name: 'Charge Bleed Source', name_zh: '电荷泄放源',
    unit: '件',
    category: 'part',
    props: [
      { param: 'flux', kind: 'range', min: 0.1, max: 1, unit: 'nm/s' },
      { param: 'thickness', kind: 'range', min: 20, max: 50, unit: 'nm' },
      { param: 'uniformity', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * **CGH 写入机（激光干涉闭环版）。** 交付 positionError **0.5–1 µm**、
   * spotSize 20–100 nm、加速 20–30 kV、行程 160 mm、漂移 5–15 nm/h、
   * 温稳 0.02–0.05 K。
   *
   * 它由 `plant/e-beam-column` 的 14 件（去掉旧台）+ 本文件三件（激光台 /
   * 温控罩 / 电荷源）装成。柱与旧机同一套零件 —— 换的是台、罩、电荷源三件，
   * 不是重新造一根柱。
   *
   * `holds` 与 `plant/e-beam-column` 同构：腔体 1e-7–1e-3 Pa，写入的
   * 1e-5–1e-3 Pa 落在里面。
   */
  {
    id: 'plant/cgh-e-beam-writer',
    name: 'CGH Writer', name_zh: 'CGH 写入机',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'pressure', min: 1e-7, max: 1e-3 }],
    props: [
      { param: 'positionError', kind: 'range', min: 0, max: 1000, unit: 'nm', dir: 'atMost' },
      { param: 'spotSize', kind: 'range', min: 10, max: 100, unit: 'nm', dir: 'atMost' },
      { param: 'accelVoltage', kind: 'range', min: 20, max: 30, unit: 'kV' },
      { param: 'stageStroke', kind: 'range', min: 100, max: 200, unit: 'mm', dir: 'atLeast' },
      { param: 'drift', kind: 'range', min: 0, max: 0.015, unit: 'µm/h', dir: 'atMost' },
      { param: 'temperatureStability', kind: 'range', min: 0, max: 0.05, unit: 'K', dir: 'atMost' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线
// ═══════════════════════════════════════════════════════════════════════════

export const CGH_EBEAM_ROUTES: readonly Route[] = [
  {
    /**
     * **激光干涉台：七件激光台零件 + 钢板/铝/铜线 → 160 mm 台 1 件。**
     *
     *   干涉头 1 + 接收器 1 + 滑台 1 + 微动台 1 + 控制器 1 + 反射镜 2 + 基座 1
     *   + 钢板 20 + 铝 5 + 铜线 0.2 + 水 5 → 台 1 件
     *
     * 五道工序：铣基座/导轨 → 磨导轨 → 装激光头（阿贝臂 ≤20 mm）→ 直线度
     * （0.5–1 µm/m，`plant/laser-straightness` 的 0.5 µm/m 地板）→ 0.5 nm 标定
     * （X 射线干涉仪，Si (111) 0.3135 nm）→ 闭环整定 0.5–1 µm。
     */
    id: 'make/cgh-e-beam-laser-stage',
    name: 'CGH Writer Stage Laser-Interferometer Closed-Loop Stage Manufacturing', name_zh: 'CGH 写入台的激光干涉闭环工作台制造',
    produces: [
      {
        item: 'plant/cgh-e-beam/laser-stage',
        qty: q(1),
        gives: [
          { param: 'positionError', kind: 'range', min: 500, max: 1000 },
          { param: 'stroke', kind: 'range', min: 160, max: 160 },
          { param: 'readout', kind: 'range', min: 1, max: 10 },
          { param: 'drift', kind: 'range', min: 0.005, max: 0.015 },
          { param: 'abbeOffset', kind: 'range', min: 10, max: 20 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/laser-stage/head', qty: q(1) }] },
      { anyOf: [{ item: 'plant/laser-stage/receiver', qty: q(1) }] },
      { anyOf: [{ item: 'plant/laser-stage/carriage', qty: q(1) }] },
      { anyOf: [{ item: 'plant/laser-stage/fine-stage', qty: q(1) }] },
      { anyOf: [{ item: 'plant/laser-stage/controller', qty: q(1) }] },
      { anyOf: [{ item: 'plant/laser-stage/mirror', qty: q(2) }] },
      { anyOf: [{ item: 'plant/laser-stage/base', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(200) },
    steps: [
      {
        note_zh: '铣基座与导轨面：钢板 20 kg、三点支撑；导轨面留 0.1 mm 研磨余量',
        performedBy: 'plant/milling-machine',
      },
      {
        note_zh: '研磨导轨与滑台：0.5 µm 碳化硅 + 铸铁研具，8 字轨迹；配合间隙 ≤0.5 µm',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '装激光头/分光/接收器：阿贝臂 ≤20 mm，光轴与导轨平行 ≤10 µm/160 mm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '直线度与俯仰：0.5–1 µm/m（`plant/laser-straightness` 的地板），160 mm 5 点；翻转法消光束弯曲',
        performedBy: 'plant/laser-straightness',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '0.5 nm 标定：X 射线干涉仪读 Si (111) 0.3135 nm 周期，160 mm 上 10 点；回零 ≤10 nm',
        performedBy: 'plant/xray-interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '闭环整定：200 Hz、目标 0.5 µm；阶跃 1 µm 的残差 ≤0.3 µm，整定 30 s 内回 0.5 µm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **温控罩：钢板 15 + 铝 4 + 铜线 0.2 + 水 2 → 罩 1 件。**
     *
     * 0.02–0.05 K、梯度 0.02–0.1 K/m、隔声 25–35 dB。
     * 外层 1 mm 钢板 + 15 mm 矿棉，内层 Peltier 4 片 + 热敏电阻 3 只。
     */
    id: 'make/cgh-e-beam-thermal-shield',
    name: 'Vacuum Chamber Thermal Shield Manufacturing', name_zh: '真空腔温控罩制造',
    produces: [
      {
        item: 'plant/cgh-e-beam/thermal-shield',
        qty: q(1),
        gives: [
          { param: 'temperatureStability', kind: 'range', min: 0.02, max: 0.05 },
          { param: 'gradient', kind: 'range', min: 0.02, max: 0.1 },
          { param: 'acousticAttenuation', kind: 'range', min: 25, max: 35 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(15) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(4) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(60) },
    steps: [
      {
        note_zh: '折弯/焊框：1 mm 钢板外壳 0.9×0.7×0.6 m，门框加磁性胶条座',
        performedBy: 'plant/milling-machine',
      },
      {
        note_zh: '贴 15 mm 矿棉 + 内衬；装 Peltier 4 片（60 W/片）与热敏电阻 3 只',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '闭环整定：死区 0.02 K、超调 ≤0.01 K；门开 10 s 后回稳 ≤5 min；梯度 ≤0.1 K/m（3 点测）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **电荷泄放源：钼舟 + 氧化铝坩埚 + 挡板/水冷 → 源 1 件。**
     *
     *   钼粉 0.02 + 316L 0.1 + 氧化铝 0.2 + 铜线 0.05 + 水 1 → 源 1 件
     *
     * 速率 0.1–1 nm/s、厚度 20–50 nm、均匀性 ≤5 %。
     * KCl 在 770 °C 升华；钼舟做加热器，氧化铝坩埚盛盐，挡板挡住
     * 直射束（不挡工件），水冷把舟的热挡在腔壁之外。
     */
    id: 'make/cgh-e-beam-charge-bleed',
    name: 'Charge Bleed Source Manufacturing', name_zh: '电荷泄放源制造',
    produces: [
      {
        item: 'plant/cgh-e-beam/charge-bleed',
        qty: q(1),
        gives: [
          { param: 'flux', kind: 'range', min: 0.1, max: 1 },
          { param: 'thickness', kind: 'range', min: 20, max: 50 },
          { param: 'uniformity', kind: 'range', min: 2, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/molybdenum-powder', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    rate: { hours: q(40) },
    steps: [
      {
        note_zh: '压钼舟与氧化铝坩埚：0.05 mm 钼片折 U 形舟，氧化铝坩埚车到 φ20',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '装挡板与水冷：挡板在舟与工件之间，水冷 0.5 L/min，腔壁温升 ≤1 K',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '试蒸 KCl：770 °C、速率 0.1–1 nm/s，φ160 上 20–50 nm，均匀性 2–5 %（5 点椭偏）',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 1e-3, max: 1e-2 }],
      },
    ],
  },

  {
    /**
     * **CGH 写入机：14 件柱零件 + 3 件新件 → 1 台。**
     *
     *   阴极 1 + 韦氏帽 1 + 枪室 1 + 聚光镜 1 + 物镜 1 + 光阑 1 + 扫描线圈 4
     *   + 镜筒 1 + 腔体 1 + 探测器 1 + 法拉第杯 1 + 高压电源 1 + 消隐 1
     *   + 控制 1（**不含旧台**）+ 激光台 1 + 温控罩 1 + 电荷源 1
     *   + 钢板 5 + 铝 2 + 铜线 0.1 + 水 5 → 写入机 1 台
     *
     * 六道工序：装柱 → 对中 → 装台/罩/电荷源 → 台标定 → 束斑/位置测试 →
     * 电荷层验证。
     *
     * ⚠️ 台标定那一步的执行者是 `plant/xray-interferometer` —— 它是**标定用**的
     * 机器，装一次用一次，不是写入机的一部分（所以它不在 `needs` 里）。
     */
    id: 'make/cgh-e-beam-writer',
    name: 'CGH Writer Manufacturing', name_zh: 'CGH 写入机制造',
    produces: [
      {
        item: 'plant/cgh-e-beam-writer',
        qty: q(1),
        gives: [
          { param: 'positionError', kind: 'range', min: 500, max: 1000 },
          { param: 'spotSize', kind: 'range', min: 20, max: 100 },
          { param: 'accelVoltage', kind: 'range', min: 20, max: 30 },
          { param: 'stageStroke', kind: 'range', min: 160, max: 160 },
          { param: 'drift', kind: 'range', min: 0.005, max: 0.015 },
          { param: 'temperatureStability', kind: 'range', min: 0.02, max: 0.05 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/e-beam-column/cathode', qty: q(1) }] },
      { anyOf: [{ item: 'plant/e-beam-column/wehnelt', qty: q(1) }] },
      { anyOf: [{ item: 'plant/e-beam-column/gun-chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/e-beam-column/condenser', qty: q(1) }] },
      { anyOf: [{ item: 'plant/e-beam-column/objective', qty: q(1) }] },
      { anyOf: [{ item: 'plant/e-beam-column/aperture', qty: q(1) }] },
      { anyOf: [{ item: 'plant/e-beam-column/scan-coil', qty: q(4) }] },
      { anyOf: [{ item: 'plant/e-beam-column/column-tube', qty: q(1) }] },
      { anyOf: [{ item: 'plant/e-beam-column/chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/e-beam-column/detector', qty: q(1) }] },
      { anyOf: [{ item: 'plant/e-beam-column/faraday-cup', qty: q(1) }] },
      { anyOf: [{ item: 'plant/e-beam-column/hv-supply', qty: q(1) }] },
      { anyOf: [{ item: 'plant/e-beam-column/beam-blanker', qty: q(1) }] },
      { anyOf: [{ item: 'plant/e-beam-column/control', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cgh-e-beam/laser-stage', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cgh-e-beam/thermal-shield', qty: q(1) }] },
      { anyOf: [{ item: 'plant/cgh-e-beam/charge-bleed', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room', 'plant/euv-vacuum'],
    rate: { hours: q(260) },
    steps: [
      {
        note_zh: '装柱：阴极/韦氏帽/枪室/聚光镜/物镜/光阑/扫描线圈 4/镜筒/腔体，垂直度 ≤10 µm/160 mm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '对中光轴：20–30 kV 下束流 0.2–1 nA，法拉第杯读；像散 ≤10 nm（刀口法）',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装激光台/温控罩/电荷源：台与柱共基座，阿贝臂 ≤20 mm；罩内 0.02–0.05 K',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '台标定：X 射线干涉仪读 Si (111) 0.3135 nm，160 mm 10 点；激光闭环定位 0.5–1 µm',
        performedBy: 'plant/xray-interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '束斑/位置测试：写 20–100 nm 点阵（φ160 上 25 点），CD-SEM 读束斑与块间错位；positionError 0.5–1 µm',
        performedBy: 'plant/cd-sem',
      },
      {
        note_zh: '电荷层验证：有/无 30 nm KCl 各写一片，CD-SEM 比块内偏移；有层时 ≤20 nm、无层 0.1–1 µm',
        performedBy: 'plant/cd-sem',
      },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CGH_EBEAM_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CGH_EBEAM_ROUTES];
