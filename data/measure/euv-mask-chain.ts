/**
 * EUV 掩模链的四条校准边（P4）。
 *
 * 这四条不是新增产品路线，而是给既有生产 give 补读数出处：
 *
 *   `make/euv-mask-32nm`    minFeature / placement
 *   `make/euv-mask-blank`  flatness / roughness
 *   `make/euv-mask-writer` spotSize / positionError / beamCurrent / stageStroke / drift
 *   `make/euv-reflectometer` reflectivity / reflectivityAccuracy / angleError
 *
 * 记录是**能力域/验收带**，不是单次实测读数；每条都写明量具与依据。
 * 掩模坯的 CTE 没有对应量具（本层无膨胀仪），不写记录；吸收层/贴膜是
 * 材料选择，不是可测量参数，也不写记录。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DATA_ITEMS: readonly Item[] = [
  /** 32 nm 掩模 CD/定位资格记录：CD-SEM + overlay 10 点。 */
  {
    id: 'mat/euv-mask-32nm-cal-record',
    name: '32 nm 掩模 CD/定位资格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'minFeature', kind: 'range', min: 0.025, max: 0.04, unit: 'µm' },
      { param: 'placement', kind: 'range', min: 5, max: 10, unit: 'nm' },
    ],
  },

  /** 掩模坯 flatness/roughness 资格记录：干涉仪 + AFM。 */
  {
    id: 'mat/euv-mask-blank-cal-record',
    name: '掩模坯面形与粗糙度资格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'flatness', kind: 'range', min: 0, max: 1, unit: 'nm rms', dir: 'atMost' },
      // 0.1 nm 是设计目标；本层 φ300 平晶 λ/20≈15 nm，撑不起 0.1 nm，记录只写产品同窗 0–1。
      { param: 'roughness', kind: 'range', min: 0, max: 0.1, unit: 'nm rms', dir: 'atMost' },
    ],
  },

  /** 掩模写机束斑/定位/束流/台程/漂移资格记录。 */
  {
    id: 'mat/euv-mask-writer-cal-record',
    name: '掩模写机束斑/定位/束流/台程/漂移资格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'spotSize', kind: 'range', min: 4, max: 10, unit: 'nm' },
      { param: 'positionError', kind: 'range', min: 5, max: 10, unit: 'nm' },
      { param: 'beamCurrent', kind: 'range', min: 0.2, max: 1, unit: 'pA' },
      { param: 'stageStroke', kind: 'range', min: 152, max: 152, unit: 'mm' },
      { param: 'drift', kind: 'range', min: 0.2, max: 0.5, unit: 'nm/h' },
    ],
  },

  /** 反射率计反射率/准确度/角度误差资格记录：反射率标准片。 */
  {
    id: 'mat/euv-reflectometer-cal-record',
    name: '反射率计反射率/准确度/角度误差资格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'reflectivity', kind: 'range', min: 0, max: 100, unit: '%' },
      { param: 'reflectivityAccuracy', kind: 'range', min: 0, max: 0.3, unit: '%', dir: 'atMost' },
      { param: 'angleError', kind: 'range', min: 0, max: 0.05, unit: '°', dir: 'atMost' },
    ],
  },
];

export const DATA_ROUTES: readonly Route[] = [
  /**
   * 32 nm 掩模验收：CD-SEM 读最小特征，overlay 读定位。
   *
   * 量具只到 CD-SEM 的 25–40 nm 档与 overlay 的 0.5 nm 不确定度；
   * 记录是能力域，不是单张掩模的实测 CD。
   */
  {
    id: 'measure/euv-mask-32nm-metrology',
    name: '32 nm 掩模 CD/定位资格测量',
    rate: { hours: q(8) },
    produces: [
      {
        item: 'mat/euv-mask-32nm-cal-record',
        qty: q(1),
        gives: [
          { param: 'minFeature', kind: 'range', min: 0.025, max: 0.04 },
          { param: 'placement', kind: 'range', min: 5, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/euv-mask-32nm', qty: q(1) }] }],
    needs: [
      {
        item: 'plant/cd-sem',
        qty: q(1),
        need: [
          { param: 'cdRange', kind: 'range', min: 25, max: 40 },
          { param: 'cdAccuracy', kind: 'range', min: 0, max: 1.5, dir: 'atMost' },
        ],
        onRelax: 'functional-kept',
      },
      {
        item: 'plant/overlay-metrology',
        qty: q(1),
        need: [{ param: 'overlayUncertainty', kind: 'range', min: 0, max: 0.5, dir: 'atMost' }],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
      'plant/clean-room',
    ],
    steps: [
      {
        note_zh: 'CD-SEM 读 32 nm 线宽：10 点、30–50 kV、NA 0.9；写 minFeature 0.025–0.04 µm',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: 'overlay 读标记定位：box-in-box 10 点 X/Y，0.5 nm 台；写 placement 5–10 nm',
        performedBy: 'plant/overlay-metrology',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '掩模 1 片（进、出，不消耗）+ CD-SEM/overlay 量测间（不占用）→ 记录 1 份；记录是数据不是物料。',
  },

  /**
   * 掩模坯验收：干涉仪读 flatness、AFM 读 roughness。
   *
   * CTE 没有膨胀仪，不写；40–50 对多层是镀膜配比，不是本记录的量。
   */
  {
    id: 'measure/euv-mask-blank-metrology',
    name: '掩模坯面形与粗糙度资格测量',
    rate: { hours: q(6) },
    produces: [
      {
        item: 'mat/euv-mask-blank-cal-record',
        qty: q(1),
        gives: [
          { param: 'flatness', kind: 'range', min: 0, max: 1 },
          { param: 'roughness', kind: 'range', min: 0, max: 0.1 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/euv-mask-blank', qty: q(1) }] }],
    needs: [
      {
        item: 'plant/interferometer',
        qty: q(1),
        need: [{ param: 'measure/figure', kind: 'range', min: 0, max: 15 }],
        onRelax: 'functional-kept',
      },
      {
        item: 'plant/afm',
        qty: q(1),
        need: [{ param: 'measure/roughness', kind: 'range', min: 0, max: 0.1 }],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
      'plant/clean-room',
    ],
    steps: [
      {
        note_zh: '干涉仪读 152 mm 全口径 flatness：φ300 平晶 λ/20≈15 nm；只写资格带 0–1 nm rms，0.1 nm 是设计目标，不写成读数',
        performedBy: 'plant/interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: 'AFM 读 roughness：5 点 1×1 µm，Si 针尖；写 0–0.1 nm rms',
        performedBy: 'plant/afm',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '掩模坯 1 片（进、出，不消耗）+ 干涉仪/AFM（不占用）→ 记录 1 份；记录是数据不是物料。',
  },

  /**
   * 写机验收：束斑/定位/束流/台程/漂移。
   *
   * 束流用 Faraday 杯，束斑/定位用 CD-SEM 与 overlay；台程是写机自身
   * 行程，漂移用标记复读。记录是能力域，不是单次写版读数。
   */
  {
    id: 'measure/euv-mask-writer-cal',
    name: '掩模写机束斑/定位/束流/台程/漂移资格测量',
    rate: { hours: q(12) },
    produces: [
      {
        item: 'mat/euv-mask-writer-cal-record',
        qty: q(1),
        gives: [
          { param: 'spotSize', kind: 'range', min: 4, max: 10 },
          { param: 'positionError', kind: 'range', min: 5, max: 10 },
          { param: 'beamCurrent', kind: 'range', min: 0.2, max: 1 },
          { param: 'stageStroke', kind: 'range', min: 152, max: 152 },
          { param: 'drift', kind: 'range', min: 0.2, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/faraday-cup', qty: q(1) }] },
      { anyOf: [{ item: 'std/euv-mask-blank', qty: q(1) }] },
    ],
    needs: [
      {
        item: 'plant/euv-mask-writer',
        qty: q(1),
        need: [
          { param: 'spotSize', kind: 'range', min: 4, max: 10 },
          { param: 'positionError', kind: 'range', min: 5, max: 10 },
          { param: 'beamCurrent', kind: 'range', min: 0.2, max: 1 },
          { param: 'stageStroke', kind: 'range', min: 152, max: 152 },
          { param: 'drift', kind: 'range', min: 0.2, max: 0.5 },
        ],
        onRelax: 'functional-kept',
      },
      {
        item: 'plant/cd-sem',
        qty: q(1),
        need: [{ param: 'measure/edgeResolution', kind: 'range', min: 1, max: 3 }],
        onRelax: 'functional-kept',
      },
      {
        item: 'plant/overlay-metrology',
        qty: q(1),
        need: [{ param: 'overlayUncertainty', kind: 'range', min: 0, max: 0.5, dir: 'atMost' }],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
      'plant/clean-room',
    ],
    steps: [
      {
        note_zh: 'Faraday 杯接束流：0.2–1 pA，30–50 kV；写 beamCurrent',
        performedBy: 'plant/euv-mask-writer',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: '写 32 nm 测试标记：CD-SEM 读束斑/边缘，overlay 读定位；写 spotSize 4–10 nm、positionError 5–10 nm',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '152 mm 台程走全行程；同一标记 30 min 复读质心，写 drift 0.2–0.5 nm/h',
        performedBy: 'plant/overlay-metrology',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'Faraday 杯 1 + 掩模坯 1（进、出，不消耗）+ 写机/CD-SEM/overlay（不占用）→ 记录 1 份；记录是数据不是物料。',
  },

  /**
   * 反射率计验收：反射率标准片 + 角度扫描。
   *
   * 标准片反射率 0–100%、不确定度 0–2%；反射率计读 0.5% 档、角度 0.05°。
   * 记录是仪器能力域，不是某片镜子的绝对反射率。
   */
  {
    id: 'measure/euv-reflectometer-cal',
    name: '反射率计反射率/准确度/角度误差资格测量',
    rate: { hours: q(8) },
    produces: [
      {
        item: 'mat/euv-reflectometer-cal-record',
        qty: q(1),
        gives: [
          { param: 'reflectivity', kind: 'range', min: 0, max: 100 },
          { param: 'reflectivityAccuracy', kind: 'range', min: 0, max: 0.3 },
          { param: 'angleError', kind: 'range', min: 0, max: 0.05 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/reflectance-standard', qty: q(1) }] }],
    needs: [
      {
        item: 'plant/euv-reflectometer',
        qty: q(1),
        need: [
          { param: 'reflectivity', kind: 'range', min: 0, max: 100 },
          { param: 'reflectivityAccuracy', kind: 'range', min: 0, max: 0.3, dir: 'atMost' },
          { param: 'angleError', kind: 'range', min: 0, max: 0.05, dir: 'atMost' },
        ],
        onRelax: 'functional-kept',
      },
      'plant/euv-source',
      'plant/metrology-room',
      'plant/clean-room',
    ],
    steps: [
      {
        note_zh: '装反射率标准片：13.5 nm、5–15° 入射；样品腔 1e-6–1e-3 Pa，先读 0° 镜面反射，归一化',
        performedBy: 'plant/euv-reflectometer',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: '角度扫描：0–15°、0.05° 步进；写 angleError 0–0.05°',
        performedBy: 'plant/euv-reflectometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '反射率准确度：与标准片证书比，写 reflectivity 0–100%、reflectivityAccuracy 0–0.3%',
        performedBy: 'plant/euv-reflectometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '反射率标准片 1（进、出，不消耗）+ 反射率计/EUV 源/计量间（不占用）→ 记录 1 份；记录是数据不是物料。',
  },
];
