/**
 * query 的结构护栏。
 *
 * 不钉条数（data 会变），钉语义：状态与 audit 同源、产出列表与图索引一致、
 * needs 不漏站点、交付只列真正覆盖窗口的 give。
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { propCovers } from '../src/core/describe.ts';
import { buildResult } from '../tools/lib/reach.ts';
import { itemReport, needsReport, routeReport, runQuery } from '../tools/query.ts';
import { reachIndex } from '../tools/query/index.ts';
import { buildPath, buildWhy } from '../tools/query/why.ts';
import { model } from '../tools/lib/index.ts';

const result = buildResult();
const index = reachIndex();
const given = new Set([...result.start.seeds, ...result.start.floor, ...result.start.oneTime]);
const unavailable = new Set(result.reachable.unavailable.map((x) => x.id));
const degraded = new Set(result.degraded.map((x) => x.id));
const upgraded = new Set(result.upgradedItems);
const usable = new Set(result.routes.usable);
const clean = new Set(result.routes.clean);

/** 每个类别取前三个，再并上所有特殊状态 —— 免得只测到一种。 */
const sampleItems = (): string[] => {
  const byCategory = new Map<string, string[]>();
  for (const item of model.data.items) {
    const category = item.category ?? 'material';
    const list = byCategory.get(category) ?? [];
    if (list.length < 3) list.push(item.id);
    byCategory.set(category, list);
  }
  return [...given, ...degraded, ...upgraded, ...[...byCategory.values()].flat()];
};

const needsTargets = ['plant/euv-source/collector', 'lathe', 'mat/tin'];

describe('query', () => {
  it('未知 id 返回 undefined', () => {
    assert.equal(itemReport('no/such-item'), undefined);
    assert.equal(routeReport('no/such-route'), undefined);
    assert.equal(needsReport('no/such-item'), undefined);
  });

  it('条目状态与 audit 的给定 / 可达 / 降级 / 升级清单一致', () => {
    for (const id of sampleItems()) {
      const report = itemReport(id);
      assert.ok(report !== undefined, id);
      const expected =
        model.data.items.find((item) => item.id === id)?.interface === true
          ? 'interface'
          : given.has(id)
            ? 'given'
            : unavailable.has(id)
              ? 'unavailable'
              : degraded.has(id)
                ? 'degraded'
                : upgraded.has(id)
                  ? 'upgraded'
                  : 'clean';
      assert.equal(report.state, expected, id);
    }
  });

  it('路线状态与 audit 的 usable / clean 一致，阻断必有失败', () => {
    const sample = [
      ...result.routes.clean.slice(0, 8),
      ...result.routes.usable.filter((id) => !clean.has(id)).slice(0, 8),
      ...result.routes.blocked.slice(0, 8).map((b) => b.id),
    ];
    for (const id of sample) {
      const report = routeReport(id);
      assert.ok(report !== undefined, id);
      const expected = clean.has(id) ? 'clean' : usable.has(id) ? 'degraded' : 'blocked';
      assert.equal(report.state, expected, id);
      if (report.state === 'blocked') assert.ok(report.failures.length > 0, `${id} 阻断但没有原因`);
      else assert.equal(report.failures.length, 0, `${id} 可用却带着失败`);
    }
  });

  it('条目的产出列表与图索引一致', () => {
    for (const id of sampleItems()) {
      const report = itemReport(id);
      assert.ok(report !== undefined, id);
      assert.deepEqual(
        report.producers.map((p) => p.id).sort(),
        (model.graph.producers.get(id) ?? []).slice().sort(),
        id,
      );
    }
  });

  it('needs 不漏站点：与 data 里逐处 need 对账', () => {
    for (const id of needsTargets) {
      let expected = 0;
      for (const route of model.data.routes) {
        for (const clause of route.uses) {
          for (const option of clause.anyOf) {
            if (option.item === id) expected += (option.need ?? []).length;
          }
        }
        for (const need of route.needs) {
          if (typeof need === 'string' || need.item !== id) continue;
          expected += (need.need ?? []).length;
        }
      }
      for (const host of model.data.items) {
        for (const component of host.composedOf ?? []) {
          if (component.item === id) expected += (component.need ?? []).length;
        }
      }
      const report = needsReport(id);
      assert.ok(report !== undefined, id);
      const actual = report.rows.reduce((n, row) => n + row.sites.length, 0);
      assert.equal(actual, expected, id);
      assert.ok(expected > 0, `${id} 没有 need，样本失去意义`);
    }
  });

  it('needs 的“供”只列真正覆盖该窗口的 give', () => {
    for (const id of needsTargets) {
      const report = needsReport(id);
      assert.ok(report !== undefined, id);
      for (const row of report.rows) {
        for (const supplied of row.supplied) {
          assert.ok(
            propCovers(supplied.give, row.need),
            `${id}: ${supplied.source} 的交付不覆盖 ${row.param}`,
          );
        }
        for (const design of row.designOnly) {
          assert.ok(
            propCovers(design.give, row.need),
            `${id}: ${design.source} 的 design 交付不覆盖 ${row.param}`,
          );
          assert.equal(design.design, true, `${id}: designOnly 里混入了严格窗口`);
        }
      }
    }
  });

  it('降级条目的 kept 站点原样带到条目卡片和路线卡片上', () => {
    for (const item of result.degraded) {
      const report = itemReport(item.id);
      assert.ok(report !== undefined, item.id);
      assert.ok(report.degraded !== undefined, item.id);
      assert.deepEqual(report.degraded.sites, item.sites, item.id);

      const route = routeReport(item.route);
      assert.ok(route !== undefined, item.route);
      assert.equal(route.state, 'degraded', item.route);
      for (const site of item.sites) {
        assert.ok(
          route.kept.some(
            (candidate) =>
              candidate.where === site.where &&
              candidate.item === site.item &&
              candidate.param === site.param &&
              candidate.need === site.need,
          ),
          `${item.route} 缺降级站点 ${site.item} / ${site.param}`,
        );
      }
    }
  });

  it('批量集合与 audit 的清单对账', () => {
    const lines = (stdout: string): string[] =>
      stdout.trim() === '' ? [] : stdout.trim().split('\n');
    assert.deepEqual(
      lines(runQuery(['items', '--state', 'unavailable', '--ids']).stdout).sort(),
      [...unavailable].sort(),
    );
    assert.deepEqual(
      lines(runQuery(['routes', '--state', 'blocked', '--ids']).stdout).sort(),
      result.routes.blocked.map((entry) => entry.id).sort(),
    );
    assert.deepEqual(
      lines(runQuery(['items', '--state', 'degraded', '--ids']).stdout).sort(),
      [...degraded].sort(),
    );
    assert.deepEqual(
      lines(runQuery(['items', '--state', 'upgraded', '--ids']).stdout).sort(),
      [...upgraded].sort(),
    );
  });

  it('批量与单条一致，ndjson 行数与 json 数组一致', () => {
    const ids = ['plant/robot/npu', 'std/soc-8nm-general'];
    const single = ids.map((id) => JSON.parse(runQuery(['item', id, '--json']).stdout));
    const batch = JSON.parse(runQuery(['items', ...ids, '--json']).stdout) as { id: string }[];
    assert.equal(batch.length, ids.length);
    for (const record of single) {
      const match = batch.find((entry) => entry.id === record.id);
      assert.deepEqual(match, record);
    }
    const ndjson = runQuery(['items', ...ids, '--ndjson']);
    assert.equal(ndjson.stdout.trim().split('\n').length, ids.length);
  });

  it('接口条目与 select 解析', () => {
    const iface = itemReport('iface/ramp-controller');
    assert.ok(iface !== undefined);
    assert.equal(iface.state, 'interface');

    const concrete = itemReport('std/ramp-controller-general');
    assert.ok(concrete !== undefined);
    assert.ok(
      concrete.partOf.some((part) => part.host === 'plant/resistance-furnace'),
      'select 指向的实现件没有接上装配关系',
    );

    assert.equal(runQuery(['items', 'iface/ramp-controller', '--count']).stdout.trim(), '1');
    const ifaceCount = model.data.items.filter((item) => item.interface === true).length;
    assert.equal(
      runQuery(['items', '--scope', 'all', 'iface/*', '--count']).stdout.trim(),
      String(ifaceCount),
    );
  });

  it('supplied 只来自可用路线，缺口必有 reason', () => {
    for (const id of needsTargets) {
      const report = needsReport(id);
      assert.ok(report !== undefined, id);
      for (const row of report.rows) {
        for (const supplied of row.supplied) {
          if (supplied.source === 'given') continue;
          assert.notEqual(index.routeState(supplied.source), 'blocked', `${id}: ${supplied.source}`);
        }
        if (row.supplied.length === 0) assert.ok(row.reason !== undefined, `${id}: ${row.param} 缺口无分类`);
        else {
          assert.equal(row.reason, undefined, `${id}: ${row.param} 有供仍报缺口`);
          assert.ok(
            row.candidates.every((candidate) => !candidate.covers),
            `${id}: ${row.param} 有供仍列覆盖候选`,
          );
        }
      }
    }
  });

  it('why 在全部不可达条目上终止且不超深度', () => {
    const depth = 6;
    const walk = (node: ReturnType<typeof buildWhy>, level: number): void => {
      assert.ok(node !== undefined);
      assert.ok(level <= depth + 1, `${node.id} 超出深度`);
      for (const child of node.children ?? []) walk(child, level + 1);
    };
    for (const id of unavailable) {
      const node = buildWhy(index, id, { depth, maxChildren: 5 });
      assert.ok(node !== undefined, id);
      walk(node, 0);
    }
  });

  it('path 的每一段都是可用路线', () => {
    const node = buildPath(index, 'std/thermocouple-t-general', {
      depth: 3,
      maxChildren: 5,
    });
    assert.ok(node !== undefined);
    const walk = (current: ReturnType<typeof buildPath>): void => {
      assert.ok(current !== undefined);
      if (current.via !== undefined) {
        assert.ok(
          index.routeState(current.via.route) !== 'blocked',
          `${current.item}: ${current.via.route} 阻断`,
        );
      }
      for (const child of current.children ?? []) walk(child);
    };
    walk(node);
  });

  it('退出码与 --fail-if-empty', () => {
    assert.equal(runQuery(['items', '--state', 'bogus']).status, 2);
    assert.equal(runQuery(['items', 'zzz/*', '--fail-if-empty']).status, 1);
    assert.equal(
      runQuery(['items', '--state', 'unavailable', '--fail-if-empty']).status,
      unavailable.size === 0 ? 1 : 0,
    );
    assert.equal(runQuery(['items', '--state', 'clean', '--fail-if-empty']).status, 0);
    assert.equal(runQuery(['--help']).status, 0);
    assert.equal(runQuery(['why']).status, 2);
  });
});
