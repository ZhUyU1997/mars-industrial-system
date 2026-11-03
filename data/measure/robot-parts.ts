/**
 * 机器人结构件的测量路线 —— 把「铣完/镗完到底差多少」变成可判的数。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 测什么、不测什么
 * ═══════════════════════════════════════════════════════════════════════
 *
 * `data/machine/robot.ts` 给这十件结构件补了最小验收 props：
 *
 *   安装面类   base / torso / foot   flatness  ≤ 50 µm（0–0.05）
 *              finger                flatness  ≤ 20 µm（0–0.02）
 *   轴承孔类   arm / thigh / shin / forearm / neck / hand
 *                                     roundness ≤ 10 µm（0–0.01）
 *
 * 本条只交**收窄后的能力域**：安装面 0.02–0.04，指面 0.006–0.015，
 * 轴承孔圆度 0.003–0.008。三个区间都不是某一次实测读数，而是
 * 「过程能力 + 量具能力」推算出的可判带；每条路线的注释给出 U(k=2) 与依据。
 *
 * **为什么没有孔径/位置度窗口**：那要先有公称直径与公差带（H7 的 φ30 只是
 * 图纸上的一句话）。本层没有零件图，写一个具体公称直径就是编数。塞规通/止
 * 只作过程检查写进 steps，不交窗口；位置度没有坐标测量机，不交。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 量具从哪来
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   表面平板    plant/surface-plate-300   （make/surface-plate-300 交 1–3 µm）
 *   千分表      std/dial-indicator-001     （make/dial-indicator-001 交 2–4 µm）
 *   塞规组      std/plug-gauge-set         （make/plug-gauge-set 交 1–2 µm）
 *   比较仪/量块 plant/comparator + std/gauge-block-working（既有）
 *   环境        plant/metrology-room       （19–21 °C）
 *
 * 比较仪只量「差」，量块给绝对值；千分表负责扫面找极值；平板提供基准平面。
 * 三者叠起来才是本层的微米级测量链，缺一件就只能读个大概。
 */

import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ROBOT_PARTS_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **安装面平面度：base / torso / foot。**
     *
     * 三件同一类判据：铸铝或铸铁件铣完的安装面要平，孔的位置才有意义。
     * 机器人底座「铣完就能用，不需要磨」—— 所以这一档只有 20–40 µm，
     * 不是机床床身那种 1–3 µm。
     *
     * 怎么测：
     *   ① 19–21 °C 计量间等温 24 h（铝 23 µm/(m·K)，300 mm 差 1 K 就是 7 µm，
     *      占 20 µm 判据的三分之一；铸铁底座也有 3.5 µm —— 不等温读的是温度）；
     *   ② 平板（1–3 µm）作基准，千分表 0.001 mm 分度架在磁性表座上扫面：
     *      四边各 2 点 + 两条对角线各 3 点 = 9 点，每点重复 3 次；
     *   ③ 取 9 点最大值 − 最小值 = 平面度；极值点再用比较仪对量块复读一次；
     *   ④ 按件记 9 点读数与极值。
     *
     * U(k=2) ≈ 4 µm：平板 1–3 µm（取 1.7）、千分表重复性 0.6、比较仪/量块 1.0，
     * 合成 ≈ 2.0 ⇒ U ≈ 4 µm。不含平板长期磨损与操作者手法。
     * 窗口 0.02–0.04 是能力域：铣削一次装夹 20–50 µm，测量收窄到 20–40 µm，
     * **不是**把 props 的 0–0.05 原样复述。
     *
     * 不交的：四个安装孔的位置度。本层没有坐标测量机，塞规只能判通/止，
     * 判不了孔与孔之间的位置；写在 steps 里只作过程检查。
     */
    id: 'measure/robot-mount-faces',
    name: 'Robot Base Measurement', name_zh: '机器人底座测量',
    produces: [
      {
        item: 'plant/robot/base',
        qty: q(1),
        gives: [{ param: 'flatness', kind: 'range', min: 0.02, max: 0.04 }],
      },
      {
        item: 'plant/robot/torso',
        qty: q(1),
        gives: [{ param: 'flatness', kind: 'range', min: 0.02, max: 0.04 }],
      },
      {
        // 一对脚：左右各一件，同一装夹方式测。
        item: 'plant/robot/foot',
        qty: q(2),
        gives: [{ param: 'flatness', kind: 'range', min: 0.02, max: 0.04 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/robot/base', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/torso', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/foot', qty: q(2) }] },
    ],
    needs: [
      'plant/surface-plate-300',
      'std/dial-indicator-001',
      'plant/comparator',
      'std/gauge-block-working',
      'std/plug-gauge-set',
      'plant/metrology-room',
    ],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh: '等温：三件在 19–21 °C 计量间放 24 h（铝 23 µm/(m·K)，300 mm 差 1 K = 7 µm，占 20 µm 判据三分之一）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '清洁：平板、表座、工件用汽油洗、鹿皮擦干；铁屑与油膜都是 1 µm 级的假读数',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '扫面：平板作基准，千分表 0.001 mm 分度架磁性表座；四边各 2 点 + 两条对角线各 3 点 = 9 点，每点重复 3 次',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '复读：9 点极值点用比较仪对量块再读一次（0.1 µm 分度），排除千分表传动误差',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '记录：按件记 9 点读数、极值差与复读值；四孔用塞规通/止只作过程检查，不交位置度',
        performedBy: 'plant/robot',
      },
    ],
  },

  {
    /**
     * **指面平面度：finger（10 件）。**
     *
     * 指爪是夹爪与工件接触的面：它不平，夹点就是一条线而不是一个面，
     * 夹玻璃、夹薄壁件会先压碎一边。指面在 `make/robot-finger` 里是铸铝件
     * 镶 45 钢（该路线同时投铝与 45 钢），本条按磨过的钢指面写 6–15 µm；
     * 若整件铸铝只铣不磨，只能到 20–40 µm 一档 —— 那是另一档工艺，不在本条交。
     *
     * 怎么测：
     *   ① 同 mount-faces：19–21 °C 等温 24 h（10 件一起等，省时间）；
     *   ② 平板 + 千分表，每件测 5 点（四角 + 中心），每点 3 次；
     *   ③ 10 件逐件测，按件记极值；同批取最大极值作批结论。
     *
     * U(k=2) ≈ 4 µm：平板 1.7、千分表重复 0.6、比较仪/量块 1.0。
     * 交付 0.006–0.015 是能力域；6 µm 下限已经接近 U，所以这条记录
     * 只保证「批内 6–15 µm」这一带，不把 6 µm 当作单件合格/不合格的硬线。
     * 这是量具能力的边界，不是工艺的边界。
     */
    id: 'measure/robot-finger-face',
    name: 'Robot Finger Measurement', name_zh: '机器人手指测量',
    produces: [
      {
        item: 'plant/robot/finger',
        qty: q(10),
        gives: [{ param: 'flatness', kind: 'range', min: 0.006, max: 0.015 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/robot/finger', qty: q(10) }] }],
    needs: [
      'plant/surface-plate-300',
      'std/dial-indicator-001',
      'plant/comparator',
      'std/gauge-block-working',
      'plant/metrology-room',
    ],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh: '等温：10 件一起在 19–21 °C 计量间放 24 h（小件等温快，但同一批要同温）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '清洁：指面去毛刺、洗油；钢指面有磨削烧伤的要先挑出（烧伤会低头 2–3 µm）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '逐件测 5 点：平板作基准，千分表 0.001 mm 分度；四角 + 中心，每点 3 次，取极值',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '复核：极值点用比较仪对量块复读；按件记极值，同批取最大极值作批结论',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **两端轴承孔圆度：arm / thigh / shin / forearm / neck / hand。**
     *
     * 这六件是同一族：铸铝件 + 两端轴承位镶 45 钢套，**磨完压进去再一起镗**。
     * 所以测的是「镗后内孔的圆度」，不是套与臂体的过盈面 —— 过盈面压完就看不见了，
     * 它的质量由压装前的尺寸与压装力保证，不在这条路线上测。
     *
     * 怎么测（两点法）：
     *   ① 19–21 °C 等温 24 h（钢套 11.5 µm/(m·K)，φ30 差 1 K = 0.35 µm，
     *      对 3–8 µm 的判据差一个量级，但仍要等温）；
     *   ② 塞规通/止先判孔径在不在图纸公差带内 —— 通/止端按零件图配作，
     *      本层没有零件图，所以只作过程检查，不写公称直径、不交直径窗口；
     *   ③ 比较仪杠杆伸进孔内，3 个截面（近端 / 中 / 远端）× 每截面 2 个方向
     *      （0° / 90°），每点 3 次；同一截面最大读数 − 最小读数 = 两点直径差，
     *      取一半作圆度；
     *   ④ 翻转 90° 再测一遍，取两次较大值；按件记 6 个截面读数。
     *
     * **两点法的原理缺口**：它测的是直径差，对三棱圆（奇数棱）会按相位低估，
     * 最坏可把圆度读成零；本层没有圆度仪，注释写明，不冒充。
     *
     * U(k=2) ≈ 1.5 µm：比较仪 0.1 µm、量块 ±0.5 µm、装夹重复 0.5 µm，
     * 合成 ≈ 0.7 ⇒ U ≈ 1.5 µm；不含两点法原理误差。
     * 交付 0.003–0.008 是能力域：镗 + 磨套的过程能力 3–10 µm，收窄到 3–8 µm。
     */
    id: 'measure/robot-joint-bores',
    name: 'Robot Arm Body Measurement', name_zh: '机器人臂体测量',
    produces: [
      {
        item: 'plant/robot/arm',
        qty: q(1),
        gives: [{ param: 'roundness', kind: 'range', min: 0.003, max: 0.008 }],
      },
      {
        item: 'plant/robot/thigh',
        qty: q(1),
        gives: [{ param: 'roundness', kind: 'range', min: 0.003, max: 0.008 }],
      },
      {
        item: 'plant/robot/shin',
        qty: q(1),
        gives: [{ param: 'roundness', kind: 'range', min: 0.003, max: 0.008 }],
      },
      {
        item: 'plant/robot/forearm',
        qty: q(1),
        gives: [{ param: 'roundness', kind: 'range', min: 0.003, max: 0.008 }],
      },
      {
        item: 'plant/robot/neck',
        qty: q(1),
        gives: [{ param: 'roundness', kind: 'range', min: 0.003, max: 0.008 }],
      },
      {
        item: 'plant/robot/hand',
        qty: q(1),
        gives: [{ param: 'roundness', kind: 'range', min: 0.003, max: 0.008 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/robot/arm', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/thigh', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/shin', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/forearm', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/neck', qty: q(1) }] },
      { anyOf: [{ item: 'plant/robot/hand', qty: q(1) }] },
    ],
    needs: [
      'plant/comparator',
      'std/gauge-block-working',
      'std/plug-gauge-set',
      'plant/metrology-room',
    ],
    rate: { hours: q(12) },
    steps: [
      {
        note_zh: '等温：六件在 19–21 °C 计量间放 24 h（钢套 11.5 µm/(m·K)，φ30 差 1 K = 0.35 µm）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '塞规通/止：按零件图配作的通端/止端先判孔径在不在公差带内 —— 只作过程检查，不交直径窗口（本层没有零件图，不编公称直径）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '两点法：比较仪杠杆伸入孔内，3 截面（近端/中/远端）× 2 方向（0°/90°），每点 3 次；同截面极差的一半 = 圆度',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '复测：翻转 90° 再测一遍，取两次较大值；两点法检不出三棱圆，注释写明，不冒充圆度仪',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '记录：按件记 6 个截面读数与最大值；同批取最大圆度作批结论',
        performedBy: 'plant/robot',
      },
    ],
  },
];

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...ROBOT_PARTS_MEASURE_ROUTES];
