/**
 * 图示仪 —— 没有荧光粉，就用烟熏玻璃画曲线。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 先有一件"没有"
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 测晶体管要示波器，示波器要示波管，示波管要**荧光粉**：
 *
 *   蓝   ZnS:Ag        要锌
 *   绿   Zn₂SiO₄:Mn    要锌
 *   红   Y₂O₃:Eu       要稀土
 *
 * 三样本层都没有（锌在铅锌链里，没建；稀土更没有）。所以**没有阴极射线管**，
 * 也就是说：**没有"屏幕"**。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 退路：两条光路 + 一块烟熏玻璃
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 示波器的本质不是"屏幕"，是**把两个电信号变成平面上的一个点**。
 * 这件事用镜子做也行：
 *
 *   振镜 A   一面小镜粘在动圈上，电流让它偏转 → 光点在水平方向移动
 *   振镜 B   另一面镜，正交安装 → 光点在竖直方向移动
 *   记录     光点照在一块**烟熏玻璃**上；烟层被光烧掉/被划针刮掉，留下痕迹
 *
 * 这就是 1900 年代的光线示波器（light-beam oscillograph）与更早的烟熏鼓记录 ——
 * **在荧光粉之前，物理学家就是这么看波形的。**
 *
 * 带宽：振镜的转动惯量决定上限，本层的做到 **1–2 kHz**（音频级）。
 * 够看伺服振荡、够看炉子的温度响应；不够看数字信号的边沿（那要 MHz）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 用它做什么：晶体管分选
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 图示仪是示波器的一种专门用法：X 轴加**扫描电压**（集电极电压），Y 轴接**电流**
 * （集电极电流），再按基极电流分几条 —— 得到的是一族曲线。
 *
 * 从曲线上能读出三件事，正好是分选要的三件：
 *
 *   增益 β     两条曲线的间距
 *   饱和压降    曲线拐弯处离原点多远
 *   击穿电压    曲线开始上翘的那一点
 *
 * 所以它把"测一只管子"从"接一堆表、记几个数"变成"看一眼曲线" ——
 * **同样的时间能测十倍的管子，而良率就是从"测得多"里来的。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它真正的用处：曲线形状直接指出哪道工序坏了
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 三个数字（β、饱和压降、击穿）只是"分选"要的。而曲线**形状**是诊断：
 *
 *   曲线几乎是平的、没有放大区     发射区没扩散进去（或铝没接触上）
 *   β 很低（曲线间距小）           基区太宽 —— 两次开窗对位差了 5 µm
 *   饱和压降高、拐弯很缓            接触电阻大 —— 键合不良或铝层太薄
 *   击穿电压低、曲线早早翘起        结面污染 / 钝化没做好（潮气进去了）
 *   同一片上几只管子曲线差别很大    **洁净度或对位一致性出了问题**
 *
 * **没有它，废品只能丢掉，不知道为什么废。** 而"不知道为什么废"意味着
 * 同样的错会一直犯 —— 这才是这台设备真正买的东西：不是"测"，是"诊断"。
 *
 * ⚠️ 烟熏玻璃是一次性的：记完一片，要涂一层清漆固定，然后换一片。所以记录是
 * 一张一张的"照片"，不是"屏幕" —— 看完就收进档案。
 *
 * ⚠️ 它值不值得有，取决于产量：一炉只出二十只管子时，用毫伏表与数字表逐个测
 * 三项参数、记在本子上比较，就够了。**它的价值随产量涨** —— 而模型没有产量
 * （没有时间维度），所以这条在数据里只能是一台"在 needs 里的工具"，
 * 看不出"什么时候才该造它"。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const TRACER_ITEMS: readonly Item[] = [
  /**
   * 振镜（镜式检流计）。动圈 + 小镜 + 悬丝，转角正比于电流。
   *
   *   与指针检流计同源，但输出不是指针而是**光点的偏转** ——
   * 因为镜子没有质量（相对指针），能跟上更快的信号。
   */
  { id: 'std/mirror-galvanometer-general', name: 'Galvanometer Mirror', name_zh: '振镜', unit: '件', category: 'part',
    composedOf: [
      { item: 'std/permanent-magnet-general', qty: q(2) },
      { item: 'std/mirror-galvanometer-general/pole-piece', qty: q(2) },
      { item: 'std/mirror-galvanometer-general/coil', qty: q(1) },
      { item: 'std/mirror-galvanometer-general/mirror', qty: q(1) },
      { item: 'std/mirror-galvanometer-general/suspension', qty: q(1) },
    ] },

  { id: 'std/mirror-galvanometer-general/pole-piece', name: 'Pole Piece', name_zh: '磁极靴', unit: '件', category: 'part' },
  { id: 'std/mirror-galvanometer-general/coil', name: 'Drive Coil', name_zh: '驱动线圈', unit: '件', category: 'part' },
  { id: 'std/mirror-galvanometer-general/mirror', name: 'Mirror', name_zh: '反射镜', unit: '件', category: 'part' },
  { id: 'std/mirror-galvanometer-general/suspension', name: 'Suspension Wire', name_zh: '悬挂丝', unit: '件', category: 'part' },

  /**
   * 图示仪。两只振镜 + 烟熏玻璃记录台 + 扫描电压源 + 阶梯基极电流源。
   *
   * 它是本层第一台**能看波形**的仪器 —— 在此之前只有"一个数"（数字表）
   * 与"一个指针位置"（毫伏表），没有"一段形状"。
   */
  { id: 'std/curve-tracer-general', name: 'Curve Tracer', name_zh: '曲线图示仪', unit: '台', category: 'machine' },
];

export const TRACER_ROUTES: readonly Route[] = [
  {
    /**
     * 极靴：40Cr 0.6 kg，铣出极面并磨到气隙 0.5 mm。
     */
    id: 'make/mirror-galvanometer-pole-piece',
    name: 'Pole Piece Manufacturing', name_zh: '磁极靴制造',
    produces: [{ item: 'std/mirror-galvanometer-general/pole-piece', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/steel-40cr', qty: q(3, 5) }] }],
    needs: [],
    performedBy: 'plant/milling-machine',
  },
  {
    /**
     * 动圈：漆包线 1 kg，绕在薄框上。
     */
    id: 'make/mirror-galvanometer-coil',
    name: 'Drive Coil Manufacturing', name_zh: '驱动线圈制造',
    produces: [{ item: 'std/mirror-galvanometer-general/coil', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/enamel-wire', qty: q(1) }] }],
    needs: [],
    performedBy: 'plant/winder',
  },
  {
    /**
     * 小镜：1 kg 玻璃，抛光到 1 mm 见方。
     */
    id: 'make/mirror-galvanometer-mirror',
    name: 'Mirror Manufacturing', name_zh: '反射镜制造',
    produces: [{ item: 'std/mirror-galvanometer-general/mirror', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/glass', qty: q(1) }] }],
    needs: [],
    performedBy: 'plant/grinder',
  },
  {
    /**
     * 悬丝：40Cr 细丝 0.2 kg，拉丝并盘成悬丝。
     */
    id: 'make/mirror-galvanometer-suspension',
    name: 'Suspension Wire Manufacturing', name_zh: '悬挂丝制造',
    produces: [{ item: 'std/mirror-galvanometer-general/suspension', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-40cr', qty: q(1, 5) }] }],
    needs: [],
    performedBy: 'plant/winder',
  },
  {
    /**
     * 振镜总装：磁体 2 + 极靴 2 + 动圈 + 小镜 + 悬丝。
     *
     * 小镜要薄、要轻、要平 —— 用抛光硅片的那套手艺抛玻璃。
     * 悬丝是整台仪器最脆的一处：粗了不灵敏，细了会断。
     */
    id: 'make/mirror-galvanometer',
    name: 'Galvanometer Mirror Final Assembly', name_zh: '振镜总装',
    produces: [{ item: 'std/mirror-galvanometer-general', qty: q(1) }],
    uses: [],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
  },
  {
    /**
     * 图示仪：两套振镜 + 光路 + 记录台 + 扫描与阶梯源。
     *
     *   振镜 2 + 玻璃 + 镍铬丝 + 运放 1（扫描与阶梯用运放做积分）+ 表壳
     *
     * 光路很简单：一盏灯、两个狭缝、两面镜、一块玻璃。**没有透镜组** ——
     * 因为不需要成像，只需要一个点。
     */
    id: 'make/curve-tracer',
    name: 'Curve Tracer Manufacturing', name_zh: '曲线图示仪制造',
    produces: [{ item: 'std/curve-tracer-general', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/mirror-galvanometer-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1) }] },
      { anyOf: [{ item: 'std/carbon-electrode-300', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '光路（灯、狭缝、两面镜、投影窗）', performedBy: 'plant/robot' },
      { note_zh: '扫描与阶梯电流源（运放积分器 + 电阻网络）', performedBy: 'plant/robot' },
      { note_zh: '烟熏与整机标定（用标准电阻与齐纳基准）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...TRACER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...TRACER_ROUTES];
