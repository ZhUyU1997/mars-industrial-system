/**
 * 车床与磨床零件的测量路线 —— 第二、三台母机的“验收判据”落地。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么先量这两台
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 种子清单上七台，机器人之后剩下车床、磨床、熔化炉。车床与磨床的零件
 * 几乎全在 `data/machine/lathe.ts` 与 `data/machine/tools.ts` 里，缺的
 * 只是「造出来怎么算合格」。熔化炉下一轮再补。
 *
 * 本文件给九件补测量路线：
 *
 *   车床     headstock（安装面平面度 + 主轴孔圆度）、carriage（底面平面度）、
 *            tool-post（底面平面度）、feed-gearbox（相邻轴孔中心距）、
 *            guard（板厚）
 *   磨床     wheel（残余不平衡量）、work-head（底面平面度）、
 *            feed-screw（导程误差）
 *   共用     std/motor-7.5kw-4p（绕组电阻 + 空载电流）
 *
 * 九件里八件用既有量具；只有“中心距”没有专用量具，用塞规棒 + 量块 +
 * 比较仪搭出来，边界写在路线注释里。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 窗口的来源
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 每件都在条目上声明了验收上限（props），制造路线交的是过程能力（较宽），
 * 本文件交的是**收窄后的能力域**（较窄）。三个数都写清是哪种：
 *
 *   验收上限   props 的 atMost/range —— 图纸判据
 *   过程能力   制造路线的 gives —— 工艺分散带
 *   能力域     本文件的 gives —— 加上量具不确定度后仍能分辨的带，
 *              **不是某一次实测读数**
 *
 * 每条路线注释给 U(k=2) 与依据；温度、点数、截面数都写在 steps 里。
 * 没有 record 条目：本层的做法与 measure/lathe-bed-flatness 相同 ——
 * 测量路线直接把窗口收窄在零件上，记录由后续首件实测补。
 */

import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const SEED_MACHINE_PART_ROUTES: readonly Route[] = [
  {
    /**
     * **主轴箱：安装面平面度 + 主轴孔圆度。**
     *
     * 主轴箱与床身配刮，底面平不平决定主轴轴线歪不歪；主轴孔是 P4 轴承的
     * 外圈座，孔一椭，轴承外圈就跟着变形，主轴一转就是周期性跳动。
     *
     * 怎么测：
     *   ① 19–21 °C 等温 24 h（铸铁 11.5 µm/(m·K)，300 mm 差 1 K = 3.5 µm，
     *      占 20 µm 验收上限的 17%，不折温就测不出真值）；
     *   ② 安装面：300 平板（1–3 µm）上，千分表 0.001 mm 扫四边 + 两条对角线
     *      9 点，每点 3 次；极值点用比较仪对量块复读；
     *   ③ 主轴孔：比较仪杠杆伸入孔内，3 截面（近端/中/远端）× 2 方向
     *      （0°/90°），每点 3 次；同截面极差的一半 = 两点法圆度；
     *   ④ 翻转 90° 复测一遍，取两次较大值。
     *
     * 交付：flatness 0.008–0.015 mm、roundness 0.003–0.008 mm。
     * 过程能力（制造路线）是 0.008–0.020 / 0.003–0.010；本条把上端收窄。
     *
     * U(k=2) ≈ 4 µm（平面度）/ 1.5 µm（圆度）：平板 1.7、千分表重复 0.6、
     * 比较仪 + 量块 1.0 合成 ≈ 2.0；圆度只用比较仪 + 量块 + 装夹 0.5，
     * 合成 ≈ 0.7。**不含**两点法对三棱圆的原理误差（可低估）。
     *
     * 不交的：主轴孔轴线对底面的平行度。那要心棒 + 自准直仪/坐标测量机，
     * 本层的自准直仪只到 0.02″ 角度，没有长心棒与桥板，不冒充。
     */
    id: 'measure/lathe-headstock',
    name: 'Headstock Measurement', name_zh: '主轴箱测量',
    produces: [
      {
        item: 'lathe/headstock',
        qty: q(1),
        gives: [
          { param: 'flatness', kind: 'range', min: 0.008, max: 0.015 },
          { param: 'roundness', kind: 'range', min: 0.003, max: 0.008 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'lathe/headstock', qty: q(1) }] }],
    needs: [
      'plant/surface-plate-300',
      'std/dial-indicator-001',
      'plant/comparator',
      'std/gauge-block-working',
      'plant/metrology-room',
    ],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh: '等温：主轴箱在 19–21 °C 计量间放 24 h（铸铁 11.5 µm/(m·K)，300 mm 差 1 K = 3.5 µm）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '清洁：安装面、平板、表座用汽油洗、鹿皮擦干；配刮面的显示剂残迹要洗净',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '安装面：300 平板作基准，千分表 0.001 mm 扫四边 + 两条对角线 9 点，每点 3 次',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '复读：平面度极值点用比较仪对量块复读（0.1 µm 分度），排除千分表传动误差',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '主轴孔：比较仪杠杆伸入孔内，3 截面 × 2 方向（0°/90°），每点 3 次；同截面极差的一半 = 圆度',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '翻转 90° 复测圆度，取两次较大值；两点法检不出三棱圆，注释写明',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **溜板：底面平面度。**
     *
     * 溜板底面与床身导轨配磨/贴塑，是摩擦副的一半。它不平，走起来就“点头”，
     * 刀尖高度随行程变，工件全长上直径不一致。
     *
     * 怎么测：同主轴箱的安装面测法 —— 300 平板 + 千分表 9 点，极值点比较仪复读。
     * 只测 300 mm 口径内的平面度；溜板全长 500–1000 mm，全长的直线度/扭曲要
     * 自准直仪 + 桥板，本层没有桥板条目，不交。
     *
     * 交付：flatness 0.008–0.015 mm（过程能力 0.008–0.020）。
     * U(k=2) ≈ 4 µm。
     */
    id: 'measure/lathe-carriage',
    name: 'Carriage Measurement', name_zh: '溜板测量',
    produces: [
      {
        item: 'lathe/carriage',
        qty: q(1),
        gives: [{ param: 'flatness', kind: 'range', min: 0.008, max: 0.015 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'lathe/carriage', qty: q(1) }] }],
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
        note_zh: '等温：溜板在 19–21 °C 计量间放 24 h（铸铁 11.5 µm/(m·K)，300 mm 差 1 K = 3.5 µm）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '清洁：底面贴塑面用无水乙醇擦，不许用油（油膜 1–2 µm，比 8 µm 判据可观）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '扫面：300 平板作基准，千分表 0.001 mm 扫四边 + 对角线 9 点，每点 3 次；只判 300 mm 口径',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '复读：极值点用比较仪对量块复读，记 9 点极差',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **刀架：底面平面度。**
     *
     * 刀架底面坐在溜板上，靠 T 型槽螺栓夹紧。底面一翘，夹紧力把刀架拉平的同时
     * 刀尖就低头，工件表面留波纹 —— 这是“刚性不够就会让刀”的几何那一半。
     *
     * 怎么测：底面小（约 100 × 100），用 300 平板 + 比较仪（0.1 µm）测 5 点
     * （四角 + 中心），每点 3 次；比较仪量程 ±50 µm，3–6 µm 的判据在量程内。
     * 不用千分表：它的 2–4 µm 传动误差会把 3 µm 的下限吃掉。
     *
     * 交付：flatness 0.003–0.006 mm（过程能力 0.003–0.010）。
     * U(k=2) ≈ 2 µm（平板 1.7 + 比较仪/量块 1.0 合成 ≈ 2.0）——
     * 3 µm 下限与 U 同量级，所以这条只保证 3–6 µm 带，不把 3 µm 当硬线。
     */
    id: 'measure/lathe-tool-post',
    name: 'Tool Post Measurement', name_zh: '刀架测量',
    produces: [
      {
        item: 'lathe/tool-post',
        qty: q(1),
        gives: [{ param: 'flatness', kind: 'range', min: 0.003, max: 0.006 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'lathe/tool-post', qty: q(1) }] }],
    needs: [
      'plant/surface-plate-300',
      'plant/comparator',
      'std/gauge-block-working',
      'plant/metrology-room',
    ],
    rate: { hours: q(3) },
    steps: [
      {
        note_zh: '等温：刀架在 19–21 °C 计量间放 24 h（45 钢 11.5 µm/(m·K)，100 mm 差 1 K = 1.15 µm）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '清洁：底面磨痕里的砂粒与油泥洗净；T 型槽口的翻边先锉掉',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '5 点：300 平板作基准，比较仪（0.1 µm 分度）测四角 + 中心，每点 3 次',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '复测：翻转 90° 再测 5 点，取两次极差较大值；按件记 10 个读数',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **进给箱：相邻轴孔中心距（borePosition）。**
     *
     * 进给箱里是一串变速齿轮，轴孔中心距错 50 µm，齿轮侧隙就变一档，
     * 车螺纹时会出现周期性的让刀。镗孔一次装夹保证中心距，测的就是这个距离。
     *
     * 怎么测（没有坐标测量机，只测中心距）：
     *   ① 两根磨准的塞规棒插入相邻两孔（间隙 1–2 µm，手推入不晃）；
     *   ② 量块组按“公称中心距 − 两棒半径”研合，卡在两棒之间；
     *   ③ 比较仪读量块组与两棒之间的差值，3 个截面各 1 次；
     *   ④ 翻转 180° 再测一遍，取两次较大值。
     *
     * 交付：borePosition 0.020–0.040 mm（过程能力 0.020–0.050）。
     * U(k=2) ≈ 5 µm：比较仪 0.1、量块 0.5、塞规棒与孔的配合 2、重复 1，
     * 合成 ≈ 2.3 ⇒ U ≈ 5 µm。窗口 20–40 µm 足够分辨。
     *
     * 边界：只测相邻两孔的中心距，**测不了二维坐标、测不了孔系累积**；
     * 那要坐标测量机（本层没有）。孔本身的圆度/孔径由塞规通止与内径比较
     * 另行判，不在这条窗口里。
     */
    id: 'measure/lathe-feed-gearbox',
    name: 'Feed Box Measurement', name_zh: '进给箱测量',
    produces: [
      {
        item: 'lathe/feed-gearbox',
        qty: q(1),
        gives: [{ param: 'borePosition', kind: 'range', min: 0.02, max: 0.04 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'lathe/feed-gearbox', qty: q(1) }] }],
    needs: [
      'std/plug-gauge-set',
      'plant/comparator',
      'std/gauge-block-working',
      'plant/surface-plate-300',
      'plant/metrology-room',
    ],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh: '等温：进给箱在 19–21 °C 计量间放 24 h（铸铁 11.5 µm/(m·K)，200 mm 差 1 K = 2.3 µm）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '塞规棒：两根磨准的棒插入相邻两孔（间隙 1–2 µm，手推入不晃），棒与孔都擦净',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '量块组按公称中心距 − 两棒半径研合，卡在两棒之间；比较仪读差值，3 个截面各 1 次',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '翻转 180° 复测，取两次较大值；只测相邻孔中心距，不测二维坐标',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **防护罩：板厚。**
     *
     * 防护罩不承力、不决定精度 —— 唯一要判的是“拆下来能换”。板厚是它唯一的
     * 几何判据：1.5 mm 冷轧板折弯后 1.4–1.6，焊缝余高与折弯减薄都在带内。
     *
     * 怎么测：千分尺（0–25 mm，分度 0.01 mm）每块板测 5 点（四边 + 中心），
     * 3 块一批；每点 3 次取平均。
     *
     * 交付：thickness 1.45–1.55 mm（过程能力 1.4–1.6；验收上限 1.2–2.0）。
     * U(k=2) ≈ 0.01 mm（千分尺分度 0.01 + 重复 0.005 合成 ≈ 0.006）。
     * 不交折弯角度与焊缝强度：本层没有角度尺/拉力机条目。
     */
    id: 'measure/lathe-guard',
    name: 'Guard Measurement', name_zh: '防护罩测量',
    produces: [
      {
        item: 'lathe/guard',
        qty: q(3),
        gives: [{ param: 'thickness', kind: 'range', min: 1.45, max: 1.55 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'lathe/guard', qty: q(3) }] }],
    needs: ['std/micrometer-0-25', 'plant/metrology-room', 'plant/thickness-standard'],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh: '等温：三块防护罩在 19–21 °C 计量间放 4 h（薄板等温快，但要与千分尺同温）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '清洁：板面油污与焊渣清掉；千分尺测砧与板面擦干',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '测厚：千分尺每块 5 点（四边 + 中心），每点 3 次取平均；3 块逐块记',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **砂轮：残余不平衡量。**
     *
     * 砂轮是磨床上唯一消耗的材料，也是唯一“转起来会甩”的零件。不平衡量
     * 大了，主轴轴承几周就坏，工件表面每转一圈一道波纹。
     *
     * 怎么测（动平衡机，5–50 kg 档）：
     *   ① 装轮/对中 ≤0.05 mm，先用标定转子复核刻度；
     *   ② 1500–3000 r/min 测初始不平衡量与相位（左右两平面各一次）；
     *   ③ 按相位在去重工位钻孔：φ6 钻头 R=150 mm 上 0.02 mm ≈ 0.66 g·mm；
     *   ④ 粗去重后复测，再精钻到 20–30 g·mm。
     *
     * 交付：unbalance 20–30 g·mm（过程能力 20–50；验收上限 50）。
     * U(k=2) ≈ 5 g·mm：标定转子 5 g·mm、重复性 2 g·mm、装夹 2 g·mm
     * 合成 ≈ 2.5。窗口 10 g·mm 宽，分辨得开。
     *
     * 边界：只测两平面残余不平衡量，不测砂轮强度（回转试验要防护罩与
     * 超速台，本层没有）；φ400 只到 ~1670 r/min（树脂结合剂 35 m/s 上限）。
     */
    id: 'measure/grinder-wheel',
    name: 'Grinder Grinding Wheel Measurement', name_zh: '磨床砂轮测量',
    produces: [
      {
        item: 'plant/grinder/wheel',
        qty: q(1),
        gives: [{ param: 'unbalance', kind: 'range', min: 20, max: 30 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/grinder/wheel', qty: q(1) }] }],
    needs: [
      'plant/dynamic-balance-machine/calibration-rotor',
      'plant/metrology-room',
    ],
    rate: { hours: q(3) },
    steps: [
      {
        note_zh: '装轮/对中 ≤0.05 mm，先用标定转子复核刻度；φ200 可 3000 r/min，φ400 只到 ~1670 r/min',
        performedBy: 'plant/dynamic-balance-machine',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '1500–3000 r/min 测初始不平衡量与相位（左右两平面各一次）',
        performedBy: 'plant/dynamic-balance-machine',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '按相位钻孔去重：φ6 钻头 R=150 mm 上 0.02 mm ≈ 0.66 g·mm；粗去重后复测',
        performedBy: 'plant/dynamic-balance-machine',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '精钻到 20–30 g·mm，复测残余与相位；按片记两平面读数',
        performedBy: 'plant/dynamic-balance-machine',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **工件头架：底面平面度。**
     *
     * 工件头架与床身配刮，底面平不平决定头架主轴与砂轮主轴的同轴度。
     * 它和溜板是同一类判据、同一套测法：300 平板 + 千分表 9 点。
     *
     * 交付：flatness 0.008–0.015 mm（过程能力 0.008–0.020）。
     * U(k=2) ≈ 4 µm。
     */
    id: 'measure/grinder-work-head',
    name: 'Grinder Work Headstock Measurement', name_zh: '磨床工件头架测量',
    produces: [
      {
        item: 'plant/grinder/work-head',
        qty: q(1),
        gives: [{ param: 'flatness', kind: 'range', min: 0.008, max: 0.015 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/grinder/work-head', qty: q(1) }] }],
    needs: [
      'plant/surface-plate-300',
      'std/dial-indicator-001',
      'plant/comparator',
      'std/gauge-block-working',
      'plant/metrology-room',
    ],
    rate: { hours: q(3) },
    steps: [
      {
        note_zh: '等温：工件头架在 19–21 °C 计量间放 24 h（铸铁 11.5 µm/(m·K)，300 mm 差 1 K = 3.5 µm）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '清洁：配刮面显示剂残迹洗掉，底面不许有油膜',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '扫面：300 平板作基准，千分表 0.001 mm 扫四边 + 对角线 9 点，每点 3 次',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '复读：极值点用比较仪对量块复读，记 9 点极差',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **进给丝杠：导程误差（每 300 mm 累积）。**
     *
     * 横向进给的位移基准。导程误差直接变成磨削深度误差，8 µm/300 mm 是
     * 本层能接受的上限（再大就要靠刻度盘补偿，而刻度盘没有细分到 1 µm）。
     *
     * 怎么测（照 measure/lathe-lead-screw-pitch 的范式，转角改用分度台）：
     *   ① 丝杠装车床两顶尖间，一端接分度台；螺母固定在刀架上，刀架当直线导轨；
     *   ② 分度台转 20 圈（导程按 5 mm 假设，即 100 mm；实际导程以零件图为准），
     *      量块组研合 100 mm，比较仪对零；
     *   ③ 读刀架位移与量块组的差；三段累积到 300 mm；
     *   ④ 每段正反各走一次，取同向读数。
     *
     * 交付：pitchError 8–15 µm/300 mm（过程能力 8–20；验收上限 20）。
     * U(k=2) ≈ 3 µm/300 mm：量块 0.5 µm/100 mm × 3、比较仪 0.1、温度
     * 11.5 µm/(m·K) × 0.3 m × 0.5 K ≈ 1.7，合成 ≈ 1.8。
     *
     * 边界：只测累积误差，不测一转内的周期误差（要圆光栅/激光干涉，本层没有）；
     * 量块组最长 100 mm，300 mm 是分三段搭接，搭接误差计入 U。
     */
    id: 'measure/grinder-feed-screw',
    name: 'Grinder Feed Lead Screw Measurement', name_zh: '磨床进给丝杠测量',
    produces: [
      {
        item: 'plant/grinder/feed-screw',
        qty: q(1),
        gives: [{ param: 'pitchError', kind: 'range', min: 8, max: 15 }],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/grinder/feed-screw', qty: q(1) }] }],
    needs: [
      'lathe',
      'plant/dividing-table',
      'std/gauge-block-working',
      'plant/comparator',
      'plant/metrology-room',
    ],
    rate: { hours: q(6) },
    steps: [
      {
        note_zh: '等温：丝杠、量块、车床在 19–21 °C 计量间放 24 h（1 m 钢 11.5 µm/K，比判据大）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装夹：丝杠装车床两顶尖间，一端接分度台；螺母固定刀架，刀架当直线导轨；量块组研合 100 mm，比较仪对零',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '分度台转 20 圈（导程按 5 mm 假设 = 100 mm，实际以图为准），读刀架位移与量块组的差；三段累积到 300 mm，正反各一次取同向读数',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '记录：按段记回零差与累积值；只测累积误差，不测周期误差',
        performedBy: 'plant/robot',
      },
    ],
  },

  {
    /**
     * **7.5 kW 4 极电机：绕组电阻 + 空载电流。**
     *
     * 电机是车床、磨床、钣金工位、计量间共用的动力源。它的验收判据不在
     * 零件表上 —— 定子、转子、绕组各自合格，装起来仍可能匝间短路、气隙不匀、
     * 空载电流偏大。这两项是整机装配后才出现的性能。
     *
     * 怎么测：
     *   ① 19–21 °C 放 4 h（铜 0.393 %/K，0.5 Ω × 0.4 %/K = 2 mΩ/K，必须折算到 20 °C）；
     *   ② 绕组电阻：LCR 表 1 kHz 四端测 U/V/W 三相，每相 3 次，按铜温系数折算 20 °C；
     *      三相不平衡 ≤2% 只作过程检查；
     *   ③ 空载电流：变频器 50 Hz 驱动，0.01 Ω 锰铜分流器 + 7.5 位数字表读电压，
     *      每相 5 次取平均；
     *   ④ 转速：反电势过零，示波器读周期；4 极 50 Hz 空载 1470–1490 r/min，
     *      只作过程检查，不交窗口；
     *   ⑤ 记录三相电阻、三相电流与转速。
     *
     * 交付：windingResistance 0.3–0.7 Ω、noLoadCurrent 3.5–7.5 A
     * （过程能力 0.2–0.9 Ω / 3–9 A；验收上限 0.1–1 Ω / 2–10 A）。
     * U(k=2) ≈ 0.01 Ω（LCR 0.05% + 接触 0.5 mΩ）/ 0.05 A（分流器 0.02% +
     * 数字表 0.001% + 读数重复）。
     *
     * 边界：没有 380 V 电网条目，频率由变频器给、电压按变频器输出；
     * 没有测功机，不测负载效率与温升。这两项是下一层的缺口。
     */
    id: 'measure/motor-7.5kw-4p',
    name: '7.5 kW Four-Pole Motor Measurement', name_zh: '7.5 kW 四极电机测量',
    produces: [
      {
        item: 'std/motor-7.5kw-4p',
        qty: q(1),
        gives: [
          { param: 'windingResistance', kind: 'range', min: 0.3, max: 0.7 },
          { param: 'noLoadCurrent', kind: 'range', min: 3.5, max: 7.5 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(1) }] }],
    needs: [
      'plant/lcr-meter-lf',
      'std/dmm-7half-general',
      'std/frequency-converter-general',
      'plant/scope-1ghz',
      'plant/metrology-room',
    ],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh: '等温：电机在 19–21 °C 计量间放 4 h（铜 0.393 %/K，0.5 Ω × 0.4 %/K = 2 mΩ/K）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '绕组电阻：LCR 表 1 kHz 四端测 U/V/W 三相，每相 3 次，按铜温系数折算 20 °C',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '空载电流：变频器 50 Hz 驱动，0.01 Ω 锰铜分流器 + 7.5 位数字表读电压，每相 5 次取平均',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '转速：反电势过零，示波器读周期；4 极 50 Hz 空载 1470–1490 r/min，只作过程检查',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '记录：三相电阻、三相电流、转速与环境温度；折算值与本机读数分开记',
        performedBy: 'plant/robot',
      },
    ],
  },
];

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...SEED_MACHINE_PART_ROUTES];
