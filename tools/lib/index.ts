/**
 * lib 的公共接口 —— 装载、图索引与规格分析的唯一入口。
 *
 * 可达判据在 `./reach.ts`，它只依赖这里的 `model`；闸门与查询都从那里取快照。
 *
 *   model.data          装载好的描述（条目 / 路线）
 *   model.seedIds       种子清单
 *   model.marsIds       行星地板（火星料）的 id
 *   model.graph         图索引（产出者 / 消费者）
 *   model.validation()  模型自身的校验：错误与提示
 *   model.analysis()    规格级分析：需求点覆盖 / 可达 / 断点 / 设备堵点
 *   ONE_TIME            R10 已批准的一次性输入（只列输入本身）
 *
 * 底层按层排：data（装载）→ graph（图与闭包）→ spec（规格判据），
 * validation 直接来自模型层（src/core/describe.ts）的 validate。
 * 这一层不打印、不读 argv、不碰文件系统。
 */
import { validate } from '../../src/index.ts';
import { data as loaded, seedFrontier, seedIds as seedSet } from './data.ts';
import { buildGraph } from './graph.ts';
import { analyzeSpec } from './spec.ts';
import type { ClosureOptions, Graph, PathSets } from './graph.ts';
import type { Description, Validation } from '../../src/index.ts';
import type { SpecResult } from './spec.ts';

export type { ClosureOptions, Graph, PathSets, SpecResult };

export class Model {
  /** 给任意一份描述建图（stats 扫出来的数据用）。装载好的那份见 model.graph。 */
  static graphOf(data: Pick<Description, 'items' | 'routes'>): Graph {
    return buildGraph(data);
  }

  /** 装载好的描述。 */
  readonly data: Description = loaded;
  /** 种子清单（只读集合）。 */
  readonly seedIds: ReadonlySet<string> = seedSet;
  /** 种子清单（按声明顺序 —— 遍历的起点顺序要稳定）。 */
  readonly seedFrontier: readonly string[] = seedFrontier;
  /** 行星地板：从火星表面就能拿到的那些 id。 */
  readonly marsIds: ReadonlySet<string> = new Set(
    loaded.items.filter((i) => i.id.startsWith('mars/')).map((i) => i.id),
  );
  /** 图索引。 */
  readonly graph: Graph = buildGraph(loaded);

  private specCache: SpecResult | undefined;
  private validCache: Validation | undefined;

  /** 模型自身的校验：错误与提示。跑一次，之后复用。 */
  validation(): Validation {
    this.validCache ??= validate(this.data);
    return this.validCache;
  }

  /** 规格级分析。跑一次，之后复用。 */
  analysis(): SpecResult {
    this.specCache ??= analyzeSpec(this.graph, this.seedFrontier);
    return this.specCache;
  }
}

export const model = new Model();

/** 已批准的 R10 一次性输入（只列输入本身；下游由路线可达性决定）。 */
export { ONE_TIME } from './policy.ts';
