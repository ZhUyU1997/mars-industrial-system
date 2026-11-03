/**
 * 已批准的 R10 一次性输入 —— 只列**输入本身**。
 *
 * 下游产物不在这里：它们有没有路线、能不能随输入放行，由审计/闭包判定。
 * 判据：单件用量 <1 g、总库存 <1 kg 量级、且不可能本地建链（无矿）；
 *   · 不建路线、不设 `composedOf`；只在 `props` 写纯度/形态，`uses` 引用即可；
 *   · 逐项由用户批准。
 * （旧文档里的「闭包外清单」已随未闭合项重排删除；Cs/Sb 的由来见 git 历史。）
 *
 * 2026-10-21 批准的是 `mat/cesium`、`mat/antimony`。
 * 2026-10-22 增加 `mat/helium`：制冷机密封充装（GM 0.8–1.5 kg/台、JT 0.1–0.3 kg/台），
 * 不是 <1 g 的微量；按 R10“必须从地球传递的非设备条目”单独批准。
 * 增删须用户确认（README R10）。
 */
export const ONE_TIME: ReadonlySet<string> = new Set([
  'mat/cesium',
  'mat/antimony',
  'mat/helium',
]);
