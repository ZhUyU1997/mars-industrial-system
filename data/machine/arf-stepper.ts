/**
 * 193 nm ArF 投影光刻机 —— 把 `plant/arf-laser` 与 `plant/arf-lens` 装成一台
 * 能印 0.35 µm 的步进机。**不是新原理，是把已有的三件（激光、镜头、精密台）
 * 装到一起，补 CIS 那条链缺的那一格光刻。**
 *
 * 为什么需要它：`make/cis-array-diffusion` 的 6 层光刻由 `plant/mask-aligner`
 * 执行，而接触/接近式曝光机只到 2–5 µm；CIS 的有源区与接触孔要 0.35 µm，
 * 靠 `std/photomask-general` 的 functional-kept 放宽到 0.5–0.7 µm，节点实际
 * 落在 0.5–0.7 µm —— 相机条目的 node ≤350 nm 因此没有交付者。
 *
 * 本机的能力：
 *   wavelength 193 nm（ArF）
 *   na         0.6（`plant/arf-lens` 的 0.2–0.9 档内）
 *   resolution 0.35 µm（0.5·λ/NA ≈ 0.16 µm 的衍射极限，取 0.35 是工艺窗口）
 *   overlay    0.15 µm（`plant/laser-stage` 的 10 µm 定位 + 对准标记闭环）
 *   field      15 mm（一块掩模的场；CIS die 约 5×5 mm，一场一颗）
 *
 * `plant/arf-laser` 与 `plant/arf-lens` 的产出路线是**装配路线**
 * （`litho-m3.ts` 的 `ASSEMBLY_ROUTES`）：零件在两者的 `composedOf` 上
 * （腔/电极/脉冲源/光学；6 片萤石元件 + 镜筒），所以 `uses: []` 是装配的
 * 正确写法，不是缺 BOM。本文件同样按 `composedOf` 装整机，不重复列零件。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ARF_STEPPER_ITEMS: readonly Item[] = [
  /**
   * 整机机架。铸铁，大质量减振；镜头、激光、台都坐在它上面。
   * 要求：安装面平面度 ≤10 µm（刮研），否则三件的轴线对不上。
   */
  {
    id: 'plant/arf-stepper/frame',
    name: 'ArF Stepper Frame', name_zh: 'ArF 光刻机机架',
    unit: '件',
    category: 'part',
    props: [{ param: 'flatness', kind: 'range', min: 0, max: 0.01, unit: 'mm', dir: 'atMost' }],
  },

  /**
   * 照明系统：石英复眼匀光 + 场阑 + 剂量探测器。
   *
   * 193 nm 的匀光不能用透镜组（萤石/石英吸收与色差都大），用石英复眼把
   * 高斯光束切成多束再叠加；场阑定 15 mm 场；剂量探测器（光电二极管）
   * 放在场阑后，闭环控制单脉冲能量。
   *
   * 窗口（过程能力，不是读数）：
   *   uniformity   1–3 %（15 mm 场内 9 点极差/均值）
   *   doseAccuracy 0.5–1 %（单脉冲能量闭环误差）
   */
  {
    id: 'plant/arf-stepper/illuminator',
    name: 'ArF Stepper Illumination System', name_zh: 'ArF 光刻机照明系统',
    unit: '件',
    category: 'part',
    props: [
      { param: 'uniformity', kind: 'range', min: 1, max: 3, unit: '%', dir: 'atMost' },
      { param: 'doseAccuracy', kind: 'range', min: 0.5, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 对准系统：CCD + 物镜 + 标记照明。
   *
   * 用 `plant/metrology-ccd` 的相机头（1–5 MP、像素 1–10 µm）配一只
   * `plant/arf-lens/element` 当物镜，看硅片上的对准标记；标记照明用
   * 可见光 LED（193 nm 会曝光胶，不能常开）。
   *
   * 窗口：accuracy 0.05–0.1 µm、repeatability 0.02–0.05 µm（3σ）。
   */
  {
    id: 'plant/arf-stepper/alignment',
    name: 'ArF Stepper Alignment System', name_zh: 'ArF 光刻机对准系统',
    unit: '件',
    category: 'part',
    props: [
      { param: 'accuracy', kind: 'range', min: 0.05, max: 0.1, unit: 'µm', dir: 'atMost' },
      { param: 'repeatability', kind: 'range', min: 0.02, max: 0.05, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * 工件台吸盘：氧化铝/钢盘研磨 + 温控。
   *
   * 硅片要贴在一个平面上；吸盘的平面度直接进 overlay 与焦深预算。
   * 温度稳定度 0.01–0.05 K：193 nm 下胶的线宽对温度敏感（0.1 K 约 1 nm 级）。
   *
   * 窗口：flatness 0.1–0.5 µm、temperatureStability 0.01–0.05 K。
   */
  {
    id: 'plant/arf-stepper/chuck',
    name: 'ArF Stepper Wafer Stage Chuck', name_zh: 'ArF 光刻机工件台吸盘',
    unit: '件',
    category: 'part',
    props: [
      { param: 'flatness', kind: 'range', min: 0.1, max: 0.5, unit: 'µm', dir: 'atMost' },
      { param: 'temperatureStability', kind: 'range', min: 0.01, max: 0.05, unit: 'K' },
    ],
  },

  /**
   * 隔振基础：钢弹簧 + 矿棉阻尼 + 铸铁基础。
   *
   * 本层没有橡胶条目；用钢螺旋弹簧（45 钢） + 矿棉（纤维摩擦阻尼） +
   * 150 kg 铸铁基础代。混凝土基础也没有条目，铸铁基础由熔炼炉浇、地窑时效。
   *
   * 窗口：vibration 0.5–2 µm（台面振幅）、settle 10–50 ms（步进后稳定时间）。
   */
  {
    id: 'plant/arf-stepper/isolation',
    name: 'ArF Stepper Vibration Isolation Foundation', name_zh: 'ArF 光刻机隔振基础',
    unit: '件',
    category: 'part',
    props: [
      { param: 'vibration', kind: 'range', min: 0.5, max: 2, unit: 'µm', dir: 'atMost' },
      { param: 'settle', kind: 'range', min: 10, max: 50, unit: 'ms' },
    ],
  },

  /**
   * 光束传输：193 nm 反射镜 + 氮气吹扫。
   *
   * 193 nm 在空气里被 O₂ 吸收（1 m 约 10–20 %），所以光路要氮气吹扫；
   * 反射镜用石英/萤石基底镀介质膜（`plant/euv-coater`）。
   *
   * 窗口：transmission 0.8–0.9（激光到镜头入口的总透过率）、
   *       pointingStability 0.02–0.05 µm（30 min 内光束质心漂移）。
   */
  {
    id: 'plant/arf-stepper/beam-delivery',
    name: 'ArF Stepper Beam Delivery', name_zh: 'ArF 光刻机光束传输',
    unit: '件',
    category: 'part',
    props: [
      { param: 'transmission', kind: 'range', min: 0.8, max: 0.9, unit: '1' },
      { param: 'pointingStability', kind: 'range', min: 0.02, max: 0.05, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * **193 nm ArF 步进光刻机。**
   *
   *   wavelength 193 nm       ArF 激光（`plant/arf-laser`）
   *   na         0.6          `plant/arf-lens` 的 0.2–0.9 档
   *   resolution 0.35 µm      0.5·λ/NA ≈ 0.16 的衍射极限上留工艺窗口
   *   overlay    0.15 µm      `plant/laser-stage` 定位 + 对准标记闭环
   *   field      15 mm        单场；CIS die 约 5×5 mm
   *   throughput 20 片/h      单层口径（涂显/曝光/步进）
   */
  {
    id: 'plant/arf-stepper',
    name: '193 nm ArF Stepper', name_zh: '193 nm ArF 步进光刻机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'wavelength', kind: 'range', min: 193, max: 193, unit: 'nm' },
      { param: 'na', kind: 'range', min: 0.6, max: 0.9, unit: 'NA', dir: 'atLeast' },
      { param: 'resolution', kind: 'range', min: 0, max: 0.35, unit: 'µm', dir: 'atMost' },
      { param: 'overlay', kind: 'range', min: 0, max: 0.15, unit: 'µm', dir: 'atMost' },
      { param: 'field', kind: 'range', min: 15, max: 30, unit: 'mm', dir: 'atLeast' },
      { param: 'throughput', kind: 'range', min: 20, max: 100, unit: '片/h', dir: 'atLeast' },
    ],
    composedOf: [
      { item: 'plant/arf-laser', qty: q(1) },
      { item: 'plant/arf-lens', qty: q(1) },
      { item: 'plant/laser-stage', qty: q(1) },
      { item: 'plant/arf-stepper/frame', qty: q(1) },
      { item: 'plant/arf-stepper/illuminator', qty: q(1) },
      { item: 'plant/arf-stepper/alignment', qty: q(1) },
      { item: 'plant/arf-stepper/chuck', qty: q(1) },
      { item: 'plant/arf-stepper/isolation', qty: q(1) },
      { item: 'plant/arf-stepper/beam-delivery', qty: q(1) },
    ],
  },
];

export const ARF_STEPPER_ROUTES: readonly Route[] = [
  {
    /** 机架：HT250 浇成 → 人工时效 → 刨铣 → 刮研安装面。 */
    id: 'make/arf-stepper-frame',
    name: 'ArF Stepper Frame Manufacturing', name_zh: 'ArF 光刻机机架制造',
    produces: [{
      item: 'plant/arf-stepper/frame',
      qty: q(1),
      gives: [{ param: 'flatness', kind: 'range', min: 0.005, max: 0.01 }],
    }],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(600) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(40) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '砂型铸造：一次浇成，避免焊缝；浇口在厚处', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1350, max: 1450 }] },
      { note_zh: '人工时效：550–650 保温 4 h，随炉冷到 200 以下', performedBy: 'plant/earth-kiln', under: [{ param: 'temperature', min: 550, max: 650 }] },
      { note_zh: '刨铣三个安装面，留 0.2–0.3 mm 刮研量', performedBy: 'plant/milling-machine' },
      { note_zh: '刮研：三块平板对研显示剂，25×25 mm 内 20–25 点；平面度 5–10 µm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '生铁 600 + 尾矿 50 + 水 40 → 机架 1 件；余是浇冒口、型砂与切屑。',
  },
  {
    /**
     * 整机装配：激光 + 镜头 + 台 + 机架 + 自准直。
     *
     * 装配判据：
     *   ① 镜头光轴与台面垂直（自准直 ±0.02°）；
     *   ② 激光入镜头视场（±0.1 mm）；
     *   ③ 台在 15 mm 场内定位 0.1 µm（激光尺闭环，`plant/laser-stage` 的 10 µm 档 + 对准标记）；
     *   ④ 首片曝光：0.35 µm 线条显影后 CD-SEM 抽 10 点（判据 ≤0.35 µm）。
     */
    id: 'make/arf-stepper',
    name: '193 nm ArF Stepper Assembly', name_zh: '193 nm ArF 步进光刻机装配',
    produces: [{
      item: 'plant/arf-stepper',
      qty: q(1),
      gives: [
        { param: 'wavelength', kind: 'range', min: 193, max: 193 },
        { param: 'na', kind: 'range', min: 0.6, max: 0.9 },
        { param: 'resolution', kind: 'range', min: 0.2, max: 0.35 },
        { param: 'overlay', kind: 'range', min: 0.05, max: 0.15 },
        { param: 'field', kind: 'range', min: 15, max: 30 },
        { param: 'throughput', kind: 'range', min: 20, max: 100 },
      ],
    }],
    uses: [],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    steps: [
      { note_zh: '装镜头与机架：自准直看光轴垂直，±0.02°（自准直是装调量具，不入整机 BOM；其可用性不阻塞本路线）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装激光与照明：193 nm 入镜头视场，±0.1 mm；能量计读 1–10 mJ/cm²', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装台与对准：激光尺闭环，15 mm 场内 0.1 µm；对准标记 CCD 读 ±0.15 µm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '首片曝光：0.35 µm 线条，显影后 CD-SEM 抽 10 点；判据 ≤0.35 µm，落不下修机', performedBy: 'plant/cd-sem', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '激光 1 + 镜头 1 + 台 1 + 机架 1 → 整机 1 台；装配不消耗，自准直是装调量具不入 BOM，记录是数据。',
  },
  {
    /**
     * 照明系统：石英复眼 + 场阑 + 剂量探测器。
     *
     * 复眼用 3 kg 石英毛坯（`mat/quartz-pure`）磨 7×7 小透镜；场阑与镜框用
     * 铝；剂量探测器用 `std/photodiode-general`。执行者是机器人（装调），
     * 研磨/镀膜/计量只作为前提设备。
     */
    id: 'make/arf-stepper-illuminator',
    name: 'ArF Stepper Illumination System Manufacturing', name_zh: 'ArF 光刻机照明系统制造',
    produces: [{
      item: 'plant/arf-stepper/illuminator',
      qty: q(1),
      gives: [
        { param: 'uniformity', kind: 'range', min: 1, max: 3, record: 'mat/arf-stepper-dose-record' },
        { param: 'doseAccuracy', kind: 'range', min: 0.5, max: 1, record: 'mat/arf-stepper-dose-record' },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(3) }] },
      { anyOf: [{ item: 'mat/fluorite-pure', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'std/photodiode-general', qty: q(1) }] },
    ],
    needs: ['plant/grinder', 'plant/euv-coater', 'plant/metrology-room'],
    performedBy: 'plant/robot',
    unbalanced_zh: '石英 3 + 萤石 1 + 铝 2 + 光电二极管 1 → 照明系统 1 件；装配不消耗，余是研磨/镀膜损耗。',
  },
  {
    /**
     * 对准系统：CCD + 物镜 + 标记照明。
     *
     * 相机直接用 `plant/metrology-ccd`（1–5 MP），物镜用一只
     * `plant/arf-lens/element`；标记照明是可见光 LED，避免 193 nm 曝光胶。
     */
    id: 'make/arf-stepper-alignment',
    name: 'ArF Stepper Alignment System Manufacturing', name_zh: 'ArF 光刻机对准系统制造',
    produces: [{
      item: 'plant/arf-stepper/alignment',
      qty: q(1),
      gives: [
        { param: 'accuracy', kind: 'range', min: 0.05, max: 0.1 },
        { param: 'repeatability', kind: 'range', min: 0.02, max: 0.05 },
      ],
    }],
    uses: [
      // 不用 plant/metrology-ccd：它经 robot/camera → cis-2mp → cis-array-arf
      // 绕回 plant/arf-stepper，会成环。用通用传感器 + 一只镜头元件。
      { anyOf: [{ item: 'std/sensor-general', qty: q(1) }] },
      { anyOf: [{ item: 'plant/arf-lens/element', qty: q(1) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'std/passive-component-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/clean-room'],
    performedBy: 'plant/robot',
    unbalanced_zh: 'CCD 1 + 物镜 1 + 石英 0.5 + 铝 1 + 无源件 1 → 对准系统 1 件；装配不消耗。',
  },
  {
    /**
     * 工件台吸盘：氧化铝/钢盘研磨 + 加热/测温。
     *
     * 盘体用 30 kg 氧化铝（`mat/alumina`）烧结，背面钢盘（45 钢）作支撑；
     * 铜线绕测温、电阻丝绕加热。研磨、干涉仪、计量间是前提设备。
     */
    id: 'make/arf-stepper-chuck',
    name: 'ArF Stepper Wafer Stage Chuck Manufacturing', name_zh: 'ArF 光刻机工件台吸盘制造',
    produces: [{
      item: 'plant/arf-stepper/chuck',
      qty: q(1),
      gives: [
        // 记录窗 0.1–0.5，制造过程能力取同一上界；测量路线再按干涉仪收窄。
        { param: 'flatness', kind: 'range', min: 0.1, max: 0.5, record: 'mat/arf-stepper-chuck-record' },
        { param: 'temperatureStability', kind: 'range', min: 0.02, max: 0.05 },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'mat/alumina', qty: q(30) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 10) }] },
    ],
    needs: ['plant/grinder', 'plant/interferometer', 'plant/metrology-room'],
    performedBy: 'plant/robot',
    unbalanced_zh: '氧化铝 30 + 45 钢 5 + 铜线 0.2 + 电阻丝 0.1 → 吸盘 1 件；余是研磨/烧结损耗。',
  },
  {
    /**
     * 隔振基础：钢弹簧 + 矿棉阻尼 + 铸铁基础。
     *
     * 本层没有橡胶/混凝土条目：弹簧用 45 钢，阻尼用矿棉，基础用 HT250
     * 铸铁（熔炼炉浇、地窑时效）。
     */
    id: 'make/arf-stepper-isolation',
    name: 'ArF Stepper Vibration Isolation Foundation Manufacturing', name_zh: 'ArF 光刻机隔振基础制造',
    produces: [{
      item: 'plant/arf-stepper/isolation',
      qty: q(1),
      gives: [
        { param: 'vibration', kind: 'range', min: 0.5, max: 2 },
        { param: 'settle', kind: 'range', min: 10, max: 50 },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(80) }] },
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(150) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(30) }] },
    ],
    needs: ['plant/melting-furnace', 'plant/earth-kiln', 'plant/metrology-room'],
    performedBy: 'plant/robot',
    unbalanced_zh: '45 钢 80 + HT250 150 + 矿棉 30 → 隔振基础 1 件；余是浇冒口/切屑。',
  },
  {
    /**
     * 光束传输：193 nm 反射镜 + 氮气吹扫。
     *
     * 反射镜用石英/萤石基底，`plant/euv-coater` 镀介质膜；镜筒内充氮
     * （`mat/nitrogen`），把 O₂ 吸收压下去。
     */
    id: 'make/arf-stepper-beam-delivery',
    name: 'ArF Stepper Beam Delivery Manufacturing', name_zh: 'ArF 光刻机光束传输制造',
    produces: [{
      item: 'plant/arf-stepper/beam-delivery',
      qty: q(1),
      gives: [
        { param: 'transmission', kind: 'range', min: 0.8, max: 0.9 },
        { param: 'pointingStability', kind: 'range', min: 0.02, max: 0.05 },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(2) }] },
      { anyOf: [{ item: 'mat/fluorite-pure', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1) }] },
    ],
    needs: ['plant/euv-coater', 'plant/metrology-room'],
    performedBy: 'plant/robot',
    unbalanced_zh: '石英 2 + 萤石 1 + 铝 2 + 氮 1 → 光束传输 1 件；装配不消耗，余是镀膜/装调损耗。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ARF_STEPPER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...ARF_STEPPER_ROUTES];
