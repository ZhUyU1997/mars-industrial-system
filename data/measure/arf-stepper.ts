/**
 * ArF 步进机的三条测量边 —— overlay、剂量均匀性、吸盘平面度。
 *
 * 这三条不是新整机路线，而是给 `make/arf-stepper`、
 * `make/arf-stepper-illuminator`、`make/arf-stepper-chuck` 的 give 补
 * 读数出处：
 *
 *   overlay          0.10–0.15 µm（整机 0.05–0.15 之内）
 *   uniformity       1–3 %、doseAccuracy 0.5–1 %（照明系统）
 *   flatness         0.1–0.5 µm（吸盘）
 *
 * 窗口是**资格带**，不是某一次实测读数；注释给 U(k=2) 与依据。
 * 三条路线都用既有量具，且不新增不可达条目。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ARF_STEPPER_MEASURE_ITEMS: readonly Item[] = [
  /** 步进机 overlay 资格记录：产品片/标记片 10 点 X/Y。 */
  {
    id: 'mat/arf-stepper-overlay-record',
    name: 'ArF Stepper Overlay Record', name_zh: 'ArF 步进机套刻记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'overlay', kind: 'range', min: 0.1, max: 0.15, unit: 'µm' }],
  },
  /** 照明系统剂量资格记录：15 mm 场 9 点均匀性 + 单脉冲闭环误差。 */
  {
    id: 'mat/arf-stepper-dose-record',
    name: 'Illumination System Dose Qualification Record', name_zh: '照明系统剂量资格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'uniformity', kind: 'range', min: 1, max: 3, unit: '%', dir: 'atMost' },
      { param: 'doseAccuracy', kind: 'range', min: 0.5, max: 1, unit: '%', dir: 'atMost' },
    ],
  },
  /** 吸盘平面度资格记录：φ100–150 盘面 9 点。 */
  {
    id: 'mat/arf-stepper-chuck-record',
    name: 'Chuck Flatness Qualification Record', name_zh: '吸盘平面度资格记录',
    unit: '份',
    category: 'part',
    props: [{ param: 'flatness', kind: 'range', min: 0.1, max: 0.5, unit: 'µm' }],
  },
];

export const ARF_STEPPER_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * overlay：`plant/overlay-metrology` 读产品片/标记片的 box-in-box。
     *
     * 10 点 X/Y，台 0.5 nm 测长；overlay 取 10 点最大 |X|、|Y| 的 RSS。
     * U(k=2) ≈ 0.06 µm：overlay-metrology 的 0.5 nm 不确定度 + 标记片
     * 定值 0.05 µm + 重复 0.02 µm，合成 ≈ 0.03 ⇒ U ≈ 0.06。
     * 资格带 0.10–0.15 µm 落在整机 0.05–0.15 内；真跑后收窄。
     */
    id: 'measure/arf-stepper-overlay',
    name: 'ArF Stepper Overlay Measurement', name_zh: 'ArF 步进机套刻测量',
    produces: [{
      item: 'mat/arf-stepper-overlay-record',
      qty: q(1),
      gives: [{ param: 'overlay', kind: 'range', min: 0.1, max: 0.15 }],
    }],
    uses: [{ anyOf: [{ item: 'std/overlay-standard', qty: q(1) }] }],
    needs: [
      {
        item: 'plant/arf-stepper',
        qty: q(1),
        need: [{ param: 'overlay', kind: 'range', min: 0.05, max: 0.15 }],
        onRelax: 'functional-kept',
      },
      'plant/overlay-metrology',
      'plant/metrology-room',
    ],
    rate: { hours: q(4) },
    steps: [
      { note_zh: '装片：产品片/标记片放到 0.5 nm 台；19–21 °C 等温 2 h', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: 'DBO 读偏移：10 点 X/Y，NA 0.9、450–650 nm；每点 3 次', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '算 overlay：10 点最大 |X|、|Y| 的 RSS；写记录并注明标记片定值链', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 剂量：`plant/laser-calorimeter` 读 193 nm 单脉冲能量，配合场阑后
     * 剂量探测器读 15 mm 场 9 点。
     *
     * uniformity =（最大−最小）/均值；doseAccuracy = 单脉冲能量闭环误差。
     * U(k=2) ≈ 0.2 %（量热器 0.5–1 % + 重复 0.1 %）；资格带 1–3 % /
     * 0.5–1 % 是过程能力，不是单次读数。
     */
    id: 'measure/arf-stepper-dose',
    name: 'Illumination System Dose Qualification Measurement', name_zh: '照明系统剂量资格测量',
    produces: [{
      item: 'mat/arf-stepper-dose-record',
      qty: q(1),
      gives: [
        { param: 'uniformity', kind: 'range', min: 1, max: 3 },
        { param: 'doseAccuracy', kind: 'range', min: 0.5, max: 1 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'plant/arf-stepper/illuminator', qty: q(1) }] }],
    needs: ['plant/laser-calorimeter', 'plant/metrology-room'],
    rate: { hours: q(3) },
    steps: [
      { note_zh: '装剂量探测器：场阑后 9 点，φ5 mm 探头；193 nm 能量计对零', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '单脉冲能量：100 发，读均值与标准差；uniformity = 9 点极差/均值', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: 'doseAccuracy = 闭环设定与实测的偏差；写记录', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 吸盘平面度：`plant/interferometer` 的 φ300 平晶 + 钠光读条纹。
     *
     * 一条条纹 = λ/2 = 0.295 µm；吸盘 φ100–150，平晶整面覆盖。
     * U(k=2) ≈ 0.1 µm（平晶 λ/4 + 条纹判读 1/4 条 + 装夹重复）；
     * 资格带 0.1–0.5 µm 是研磨 + 干涉仪判读的能力域。
     */
    id: 'measure/arf-stepper-chuck',
    name: 'Chuck Flatness Qualification Measurement', name_zh: '吸盘平面度资格测量',
    produces: [{
      item: 'mat/arf-stepper-chuck-record',
      qty: q(1),
      gives: [{ param: 'flatness', kind: 'range', min: 0.1, max: 0.5 }],
    }],
    uses: [{ anyOf: [{ item: 'plant/arf-stepper/chuck', qty: q(1) }] }],
    needs: ['plant/interferometer', 'plant/metrology-room'],
    rate: { hours: q(2) },
    steps: [
      { note_zh: '吸盘放平晶下：φ100–150 盘面，垫三片 5 µm 箔；19–21 °C 等温 2 h', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '钠光 589 nm 读条纹：一条 0.295 µm；四边+对角线各读一次', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '取最大条纹数 ×0.295 = flatness；写记录', performedBy: 'plant/robot' },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ARF_STEPPER_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...ARF_STEPPER_MEASURE_ROUTES];
