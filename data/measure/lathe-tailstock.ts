/**
 * 车床尾座与主轴的同轴度测量 —— 把“刮削到底刮到什么程度”落成数。
 *
 * 怎么测：
 *   ① 一根检验棒插进主轴锥孔（莫氏 5 号）：它的轴线就是主轴轴线；
 *   ② 比较仪架在溜板上，测头分别顶在检验棒的**近端**（靠主轴）与**远端**
 *      （300 mm 外），读上下（y）与侧向（x）两个方向；
 *   ③ 尾座顶尖顶住棒的远端，同一只比较仪再读一次 —— 差值就是同轴度。
 *
 * 交出去：`coaxiality 5–15 µm`（300 mm 处，实测）。
 *
 * 为什么这条要紧：尾座与主轴不同轴，车出来的轴就是**锥形**（一头粗一头细），
 * 而这是车床“能不能车长轴”的唯一定量判据。本层靠刮削，没有导轨磨，
 * 所以这个数直接反映手上的功夫。
 *
 * 缺口：
 *   · **检验棒本身有误差**：它自己的圆度与锥度会混进读数，本层没有更准的棒；
 *   · **只测静态**：尾座锁紧后的变形、工件顶紧后的让刀都没测；
 *   · **没有垂直面内的读数分离**：比较仪一次只能读一个方向，x/y 要分别架。
 */

import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const LATHE_TAILSTOCK_ROUTES: readonly Route[] = [
  {
    /** 同轴度：检验棒 + 比较仪，近端/远端 × x/y 四读。 */
    id: 'measure/lathe-tailstock-coaxiality',
    name: '尾座测量',
    produces: [
      {
        item: 'lathe/tailstock',
        qty: q(1),
        gives: [{ param: 'coaxiality', kind: 'range', min: 5, max: 15 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'lathe/tailstock', qty: q(1) }] },
      { anyOf: [{ item: 'lathe/spindle', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '检验棒插主轴锥孔，比较仪架溜板上，读近端与远端（300 mm）的 x/y 四读', performedBy: 'plant/comparator' },
      { note_zh: '尾座顶尖顶住棒远端，同位置再读四读', performedBy: 'plant/robot' },
      { note_zh: '两次读数之差 = 同轴度', performedBy: 'plant/robot' },
    ],
  },
];

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...LATHE_TAILSTOCK_ROUTES];
