/**
 * 严格扩散审计的结构护栏。
 *
 * 只钉口径，不钉条数：数据会变，但“可达 + 不可达 = 总条目”、
 * “可用 + 阻断 = 总路线”、阻断必有原因、可用路线产物全可达 这几条不能变。
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildResult,
  scanDesign,
  scanRecordProblems,
} from '../tools/lib/reach.ts';
import { needItems } from '../src/core/describe.ts';
import type { Description } from '../src/index.ts';
import { q } from '../src/index.ts';
import { buildStatusSummary, buildTaskReport } from '../tools/audit/views.ts';
import { model, ONE_TIME } from '../tools/lib/index.ts';

const result = buildResult();
const unavailable = new Set(result.reachable.unavailable.map((x) => x.id));
const routeById = new Map(model.data.routes.map((r) => [r.id, r] as const));

describe('严格扩散审计', () => {
  it('条目对账：可达 + 不可达 = 总条目', () => {
    assert.equal(
      result.reachable.items + result.reachable.unavailable.length,
      result.model.items,
    );
    assert.equal(result.reachable.items, result.model.items - unavailable.size);
  });

  it('路线对账：可用 + 阻断 = 总路线，阻断必有原因', () => {
    assert.equal(
      result.routes.usable.length + result.routes.blocked.length,
      result.routes.total,
    );
    const usable = new Set(result.routes.usable);
    for (const blocked of result.routes.blocked) {
      assert.ok(!usable.has(blocked.id), `${blocked.id} 同时在可用与阻断`);
      assert.ok(blocked.failures.length > 0, `${blocked.id} 阻断但没有原因`);
    }
  });

  it('deferred 条目单列报告', () => {
    const expected = model.data.items
      .filter((item) => item.deferred === true)
      .map((item) => item.id)
      .sort();
    assert.deepEqual(
      result.deferred.map((item) => item.id).sort(),
      expected,
      'deferred 报告与数据不一致',
    );

    const tasks = buildTaskReport(result);
    const group = tasks.groups.find((entry) => entry.key === 'deferred');
    assert.ok(group !== undefined, '任务报告缺少 deferred 组');
    assert.equal(group.count, expected.length);
    assert.equal(tasks.totals.deferred, expected.length);

    const status = buildStatusSummary(result);
    assert.equal(status.deferred, expected.length);
  });

  it('deferred 条目的产出路线被阻断', () => {
    for (const item of result.deferred) {
      const producers = model.data.routes.filter((route) =>
        route.produces.some((term) => term.item === item.id),
      );
      for (const route of producers) {
        const blocked = result.routes.blocked.find((entry) => entry.id === route.id);
        assert.ok(blocked !== undefined, `${route.id} 未被阻断`);
        assert.ok(
          blocked.failures.some((failure) => failure.code === 'DEFERRED_PRODUCT'),
          `${route.id} 缺 DEFERRED_PRODUCT`,
        );
      }
    }
  });

  it('可用路线的每个产物都可达', () => {
    const problems: string[] = [];
    for (const rid of result.routes.usable) {
      const route = routeById.get(rid);
      if (route === undefined) {
        problems.push(`${rid}: 路线不存在`);
        continue;
      }
      for (const term of route.produces) {
        if (unavailable.has(term.item)) problems.push(`${rid} → ${term.item}`);
      }
    }
    assert.deepEqual(problems, [], `可用路线产出了不可达条目：\n${problems.join('\n')}`);
  });

  it('阻断分类与产物可达性一致', () => {
    for (const blocked of result.routes.blocked) {
      assert.ok(
        ['frontier', 'alternative', 'outside'].includes(blocked.kind),
        `${blocked.id}: 未知分类 ${blocked.kind}`,
      );
      const productReachable = blocked.products.some((p) => !unavailable.has(p));
      if (blocked.kind === 'alternative') {
        assert.ok(productReachable, `${blocked.id}: alternative 但产物不可达`);
      }
      if (blocked.kind === 'frontier') {
        assert.ok(!productReachable, `${blocked.id}: frontier 但产物可达`);
      }
      if (blocked.kind === 'outside') {
        assert.ok(!productReachable, `${blocked.id}: outside 但产物可达`);
      }
    }
  });

  it('种子报告覆盖 SEED_IDS，passed 与不可达/种子一致', () => {
    assert.equal(result.seeds.length, model.seedIds.size);
    assert.deepEqual(
      new Set(result.seeds.map((s) => s.id)),
      new Set(model.seedIds),
    );
    const expected =
      result.reachable.unavailable.length === 0 &&
      result.degraded.length === 0 &&
      result.seeds.every((s) => s.replicable) &&
      result.measure.total === 0 &&
      result.designGives === 0 &&
      result.designConditions === 0 &&
      result.recordProblems.length === 0;
    assert.equal(result.passed, expected);
  });

  it('测量链缺口进入 passed', () => {
    assert.equal(
      result.measure.total,
      result.measure.noCap + result.measure.capShort + result.measure.condShort,
    );
    if (result.measure.total > 0) assert.equal(result.passed, false);
  });

  it('降级清单只含可达、且没有干净产出路线的条目', () => {
    const clean = new Set(result.routes.clean);
    const cleanProducts = new Set(
      model.data.routes
        .filter((route) => clean.has(route.id))
        .flatMap((route) => route.produces.map((term) => term.item)),
    );
    for (const item of result.degraded) {
      assert.ok(!unavailable.has(item.id), `${item.id}: 降级条目却不可达`);
      assert.ok(item.sites.length > 0, `${item.id}: 降级但没有 kept 站点`);
      assert.ok(!cleanProducts.has(item.id), `${item.id}: 已有干净路线却仍列降级`);
    }
    assert.ok(result.upgraded >= 0);
    assert.equal(result.upgraded, result.upgradedItems.length);
  });

  it('R10 一次性输入进入起点，下游产物不冒充输入', () => {
    assert.deepEqual([...result.start.oneTime].sort(), [...ONE_TIME].sort());
    for (const id of ONE_TIME) {
      assert.ok(!unavailable.has(id), `R10 输入 ${id} 被列入起点却仍不可达`);
    }
    const downstream = [
      'plant/pmt-assembly/photocathode',
      'std/pmt-general',
      'plant/pmt-assembly',
    ];
    for (const id of downstream) {
      assert.ok(!result.start.oneTime.includes(id), `${id} 不应作为一次性输入本身`);
      if (result.passed) {
        assert.ok(!unavailable.has(id), `依赖一次性输入的 ${id} 未随输入放行`);
      }
    }
  });

  it('design 条件不算满足', () => {
    const designRouteIds = model.data.routes
      .filter(
        (r) =>
          (r.under ?? []).some((c) => c.design === true) ||
          (r.steps ?? []).some((s) => (s.under ?? []).some((c) => c.design === true)),
      )
      .map((r) => r.id);
    for (const id of designRouteIds) {
      assert.ok(
        result.routes.blocked.some((b) => b.id === id),
        `${id} 有 design 条件却没被阻断`,
      );
      assert.ok(
        !result.routes.usable.includes(id),
        `${id} 有 design 条件却在严格可用路线里`,
      );
    }
  });

  it('design 扫描覆盖 give / under / need / composedOf', () => {
    const fixture: Description = {
      items: [
        { id: 'mat/a', name: 'mat/a', name_zh: 'mat/a' },
        { id: 'mat/b', name: 'mat/b', name_zh: 'mat/b' },
        { id: 'part/c', name: 'part/c', name_zh: 'part/c', category: 'part' },
        {
          id: 'part/p',
          name: 'part/p', name_zh: 'part/p',
          category: 'part',
          composedOf: [
            {
              item: 'part/c',
              qty: q(1),
              need: [{ param: 'x', kind: 'range', min: 1, max: 2, design: true }],
            },
          ],
        },
        {
          id: 'plant/m',
          name: 'plant/m', name_zh: 'plant/m',
          category: 'machine',
          holds: [{ param: 'z', min: 0, max: 1, design: true }],
        },
      ],
      ambient: [{ param: 'a', min: 0, max: 1, design: true }],
      routes: [
        {
          id: 'make/b',
          name: 'make/b', name_zh: 'make/b',
          produces: [
            {
              item: 'mat/b',
              qty: q(1),
              gives: [{ param: 'x', kind: 'range', min: 1, max: 2, design: true }],
            },
          ],
          uses: [
            {
              anyOf: [
                {
                  item: 'mat/a',
                  qty: q(1),
                  need: [{ param: 'x', kind: 'range', min: 1, max: 2, design: true }],
                },
              ],
            },
          ],
          needs: [
            {
              item: 'plant/m',
              qty: q(1),
              need: [{ param: 'y', kind: 'range', min: 1, max: 2, design: true }],
            },
          ],
        },
        {
          id: 'make/p',
          name: 'make/p', name_zh: 'make/p',
          produces: [{ item: 'part/p', qty: q(1) }],
          uses: [],
          needs: [],
        },
      ],
    };

    const facts = scanDesign(fixture);
    assert.equal(facts.gives, 1);
    assert.equal(facts.requirements, 2);
    assert.equal(facts.routeConditions, 0);
    assert.equal(facts.allConditions, 5);
    assert.deepEqual(facts.routes, ['make/b', 'make/p']);
  });

  it('record 出处：只有 measure/*、可达、窗口落在引用窗口内才算读数', () => {
    const fixture: Description = {
      items: [
        { id: 'mat/a', name: 'mat/a', name_zh: 'mat/a' },
        {
          id: 'mat/good-record',
          name: 'mat/good-record', name_zh: 'mat/good-record',
          category: 'part',
          props: [{ param: 'x', kind: 'range', min: 1.5, max: 1.8, unit: '1' }],
        },
        {
          id: 'mat/qual-record',
          name: 'mat/qual-record', name_zh: 'mat/qual-record',
          category: 'part',
          props: [{ param: 'x', kind: 'range', min: 1.5, max: 1.8, unit: '1' }],
        },
        { id: 'part/good', name: 'part/good', name_zh: 'part/good', category: 'part' },
        { id: 'part/qual', name: 'part/qual', name_zh: 'part/qual', category: 'part' },
        { id: 'part/missing', name: 'part/missing', name_zh: 'part/missing', category: 'part' },
        { id: 'part/wide', name: 'part/wide', name_zh: 'part/wide', category: 'part' },
      ],
      routes: [
        {
          id: 'measure/good',
          name: 'measure/good', name_zh: 'measure/good',
          produces: [
            {
              item: 'mat/good-record',
              qty: q(1),
              gives: [{ param: 'x', kind: 'range', min: 1.5, max: 1.8 }],
            },
          ],
          uses: [],
          needs: [],
        },
        {
          id: 'qual/qual',
          name: 'qual/qual', name_zh: 'qual/qual',
          produces: [
            {
              item: 'mat/qual-record',
              qty: q(1),
              gives: [{ param: 'x', kind: 'range', min: 1.5, max: 1.8 }],
            },
          ],
          uses: [],
          needs: [],
        },
        {
          id: 'make/good',
          name: 'make/good', name_zh: 'make/good',
          produces: [
            {
              item: 'part/good',
              qty: q(1),
              gives: [{ param: 'x', kind: 'range', min: 1, max: 2, record: 'mat/good-record' }],
            },
          ],
          uses: [],
          needs: [],
        },
        {
          id: 'make/qual',
          name: 'make/qual', name_zh: 'make/qual',
          produces: [
            {
              item: 'part/qual',
              qty: q(1),
              gives: [{ param: 'x', kind: 'range', min: 1, max: 2, record: 'mat/qual-record' }],
            },
          ],
          uses: [],
          needs: [],
        },
        {
          id: 'make/missing',
          name: 'make/missing', name_zh: 'make/missing',
          produces: [
            {
              item: 'part/missing',
              qty: q(1),
              gives: [{ param: 'x', kind: 'range', min: 1, max: 2, record: 'mat/no-such' }],
            },
          ],
          uses: [],
          needs: [],
        },
        {
          id: 'make/wide',
          name: 'make/wide', name_zh: 'make/wide',
          produces: [
            {
              item: 'part/wide',
              qty: q(1),
              gives: [{ param: 'x', kind: 'range', min: 1.5, max: 1.6, record: 'mat/good-record' }],
            },
          ],
          uses: [],
          needs: [],
        },
      ],
    };

    const all = new Set(fixture.items.map((item) => item.id));
    const problems = scanRecordProblems(fixture, all);
    assert.equal(
      problems.filter((problem) => problem.where.startsWith('make/good')).length,
      0,
      '合法记录不应报错',
    );
    assert.ok(
      problems.some(
        (problem) => problem.record === 'mat/qual-record' && problem.reason === 'not-measure',
      ),
      'qual/* 记录应被拒',
    );
    assert.ok(
      problems.some((problem) => problem.record === 'mat/no-such' && problem.reason === 'missing-item'),
      '不存在的记录应被拒',
    );
    assert.ok(
      problems.some(
        (problem) =>
          problem.record === 'mat/good-record' && problem.reason === 'window-not-covered',
      ),
      '记录窗口宽于引用窗口应被拒',
    );

    const withoutGood = new Set([...all].filter((id) => id !== 'mat/good-record'));
    assert.ok(
      scanRecordProblems(fixture, withoutGood).some(
        (problem) =>
          problem.record === 'mat/good-record' && problem.reason === 'unreachable-record',
      ),
      '不可达记录应被拒',
    );

    const withDesignAndRecord: Description = {
      items: [
        {
          id: 'mat/record',
          name: 'mat/record', name_zh: 'mat/record',
          category: 'part',
          props: [{ param: 'x', kind: 'range', min: 1.5, max: 1.8, unit: '1' }],
        },
        { id: 'part/x', name: 'part/x', name_zh: 'part/x', category: 'part' },
      ],
      routes: [
        {
          id: 'measure/record',
          name: 'measure/record', name_zh: 'measure/record',
          produces: [{ item: 'mat/record', qty: q(1) }],
          uses: [],
          needs: [],
        },
        {
          id: 'make/x',
          name: 'make/x', name_zh: 'make/x',
          produces: [
            {
              item: 'part/x',
              qty: q(1),
              gives: [
                {
                  param: 'x',
                  kind: 'range',
                  min: 1,
                  max: 2,
                  design: true,
                  record: 'mat/record',
                },
              ],
            },
          ],
          uses: [],
          needs: [],
        },
      ],
    };
    assert.ok(
      scanRecordProblems(withDesignAndRecord, new Set(['mat/record'])).some(
        (problem) => problem.reason === 'design-and-record',
      ),
      'design 与 record 同时出现应被拒',
    );
  });

  it('design 条件与 record 问题进入闸门', () => {
    const design = scanDesign(model.data);
    assert.equal(result.designGives, design.gives);
    assert.equal(result.designConditions, design.allConditions);
    if (result.designConditions > 0) assert.equal(result.passed, false);
    if (result.recordProblems.length > 0) assert.equal(result.passed, false);
  });

  it('--tasks 对账：七组、计数、非 measure 组全量', () => {
    const tasks = buildTaskReport(result, { all: true });
    assert.deepEqual(
      tasks.groups.map((g) => g.key),
      ['deferred', 'no_route', 'blocked', 'design', 'record', 'seed', 'measure'],
    );
    assert.equal(tasks.totals.unavailable, result.reachable.unavailable.length);
    assert.equal(tasks.totals.seedTotal, result.seeds.length);
    assert.equal(tasks.totals.deferred, result.deferred.length);
    assert.equal(
      tasks.totals.seedFailed,
      result.seeds.filter((s) => !s.replicable).length,
    );
    assert.equal(tasks.totals.measure, result.measure.total);
    assert.equal(tasks.totals.recordProblems, result.recordProblems.length);
    for (const group of tasks.groups) {
      assert.ok(group.ids.length <= group.count, `${group.key}: ids > count`);
      if (group.key !== 'measure') {
        assert.equal(group.ids.length, group.count, `${group.key}: --all 未全量`);
      }
    }
  });

  it('--tasks 的路线阻断按第一堵点分类', () => {
    const tasks = buildTaskReport(result, { all: true });
    const blocked = tasks.groups.find((g) => g.key === 'blocked');
    assert.ok(blocked, '缺少 blocked 组');
    const categories = blocked.categories ?? [];
    if (blocked.count > 0) assert.ok(categories.length > 0);
    const sum = categories.reduce((n, c) => n + c.count, 0);
    assert.equal(sum, blocked.count, '分类计数之和 ≠ blocked 总数');
    for (const category of categories) {
      assert.ok(category.count > 0, `${category.key}: 空类别`);
      assert.equal(category.ids.length, category.count, `${category.key}: --all 未全量`);
      assert.ok(category.label.length > 0);
      assert.ok(category.field.length > 0, `${category.key}: 缺字段名`);
    }
  });

  it('--status 对账：passed / 可达 / 路线 / measure 与 audit 同源', () => {
    const status = buildStatusSummary(result);
    assert.equal(status.passed, result.passed);
    assert.equal(status.reachable.items, result.reachable.items);
    assert.equal(status.reachable.total, result.reachable.total);
    assert.equal(status.routes.total, result.routes.total);
    assert.equal(status.routes.usable, result.routes.usable.length);
    assert.equal(status.routes.clean, result.routes.clean.length);
    assert.equal(status.degraded, result.degraded.length);
    assert.equal(status.recordProblems, result.recordProblems.length);
    assert.equal(status.measure.total, result.measure.total);
  });

  it('联产只报告：无去处的是联产项，且不进 passed', () => {
    const multi = model.data.routes.filter(
      (route) => route.produces.length > 1 && !route.id.startsWith('measure/'),
    );
    assert.equal(result.coproducts.routes, multi.length);

    const referenced = new Set<string>();
    for (const route of model.data.routes) {
      for (const clause of route.uses) {
        for (const option of clause.anyOf) referenced.add(option.item);
      }
      for (const need of needItems(route.needs)) referenced.add(need);
      if (route.performedBy !== undefined) referenced.add(route.performedBy);
      for (const step of route.steps ?? []) {
        if (step.performedBy !== undefined) referenced.add(step.performedBy);
      }
    }
    for (const item of model.data.items) {
      for (const component of item.composedOf ?? []) referenced.add(component.item);
      for (const consumption of item.consumption ?? []) referenced.add(consumption.item);
    }
    for (const id of model.seedIds) referenced.add(id);
    for (const id of model.marsIds) referenced.add(id);
    for (const id of ONE_TIME) referenced.add(id);

    const terms = multi.reduce((n, route) => {
      const main = route.produces[0]?.item;
      const items = new Set(
        route.produces
          .slice(1)
          .map((term) => term.item)
          .filter((item) => item !== main),
      );
      return n + items.size;
    }, 0);
    assert.equal(result.coproducts.terms, terms);

    const keys = new Set<string>();
    for (const pair of result.coproducts.unclaimed) {
      const key = `${pair.route}\u0000${pair.item}`;
      assert.ok(!keys.has(key), `重复列出 ${pair.route} → ${pair.item}`);
      keys.add(key);
      const route = routeById.get(pair.route);
      assert.ok(route !== undefined, `${pair.route} 不存在`);
      assert.ok(route.produces.length > 1, `${pair.route} 不是多产物路线`);
      assert.notEqual(pair.item, route.produces[0]?.item, `${pair.item} 是主产物，不是联产`);
      assert.ok(
        route.produces.some((term) => term.item === pair.item),
        `${pair.route} 不产 ${pair.item}`,
      );
      assert.ok(!referenced.has(pair.item), `${pair.item} 有引用，却列为无去处`);
    }

    const expected =
      result.reachable.unavailable.length === 0 &&
      result.degraded.length === 0 &&
      result.seeds.every((seed) => seed.replicable) &&
      result.measure.total === 0 &&
      result.designGives === 0 &&
      result.designConditions === 0 &&
      result.recordProblems.length === 0;
    assert.equal(result.passed, expected, '联产不应进入 passed');
  });

  it('设备计数不超过总台数，轮次为正', () => {
    assert.ok(result.reachable.machines <= result.reachable.machinesTotal);
    assert.ok(result.rounds > 0);
  });
});
