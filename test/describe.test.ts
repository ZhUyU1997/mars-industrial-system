import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { Description } from '../src/index.ts';
import { q, validate } from '../src/index.ts';

const codes = (d: Description): string[] => validate(d).errors.map((e) => e.code).sort();

describe('能写出真实形状的描述', () => {
  /**
   * 一份最小的真实形状：体外原料、两条做法产同一件东西（OR）、
   * 一条做法需要"任选其一"的输入（AND of OR）、一处自指。
   */
  const d: Description = {
    items: [
      { id: 'ore', name: 'ore', name_zh: 'ore' },
      { id: 'flux', name: 'flux', name_zh: 'flux' },
      { id: 'metal', name: 'metal', name_zh: 'metal' },
      { id: 'scrap', name: 'scrap', name_zh: 'scrap' },
      { id: 'tool', name: 'tool', name_zh: 'tool' },
      { id: 'part', name: 'part', name_zh: 'part' },
    ],
    routes: [
      // metal 有两条做法：从矿，或从废料
      { id: 'metal_from_ore', name: 'metal_from_ore', name_zh: 'metal_from_ore', produces: [{ item: 'metal', qty: q(1) }], uses: [{ anyOf: [{ item: 'ore', qty: q(2) }] }, { anyOf: [{ item: 'flux', qty: q(1) }] }], needs: [] },
      { id: 'metal_from_scrap', name: 'metal_from_scrap', name_zh: 'metal_from_scrap', produces: [{ item: 'metal', qty: q(1) }], uses: [{ anyOf: [{ item: 'scrap', qty: q(3) }] }], needs: [] },
      // tool 自指：用它自己才能做它自己
      { id: 'tool', name: 'tool', name_zh: 'tool', produces: [{ item: 'tool', qty: q(1) }], uses: [{ anyOf: [{ item: 'metal', qty: q(1) }] }], needs: ['tool'] },
      // part：金属 + 任选一种助剂
      { id: 'part', name: 'part', name_zh: 'part', produces: [{ item: 'part', qty: q(1) }], uses: [{ anyOf: [{ item: 'metal', qty: q(1) }] }, { anyOf: [{ item: 'flux', qty: q(1) }, { item: 'scrap', qty: q(1) }] }], needs: ['tool'] },
    ],
  };

  it('结构完整则无错误', () => {
    assert.deepEqual(validate(d).errors, []);
  });

  it('自指只被记为提示，不算错误', () => {
    const notes = validate(d).notes;
    assert.ok(notes.some((n) => n.code === 'self_reference' && /自指/u.test(n.detail)));
  });

  it('能表达 OR：同一个 item 有多条做法', () => {
    const producers = d.routes.filter((r) => r.produces.some((t) => t.item === 'metal'));
    assert.equal(producers.length, 2);
  });

  it('能表达 AND of OR：任选其一', () => {
    const route = d.routes.find((r) => r.id === 'part')!;
    assert.deepEqual(
      route.uses[1]!.anyOf.map((o) => o.item),
      ['flux', 'scrap'],
      '同一子句内任选其一',
    );
  });

  it('能区分消耗与前提', () => {
    const route = d.routes.find((r) => r.id === 'part')!;
    assert.deepEqual(route.needs, ['tool']);
    assert.deepEqual(route.uses[0]!.anyOf.map((o) => o.item), ['metal']);
  });
});

describe('描述写错时能指出来', () => {
  const base = (over: Partial<Description>): Description => ({
    items: [{ id: 'a', name: 'a', name_zh: 'a' }, { id: 'b', name: 'b', name_zh: 'b' }],
    routes: [{ id: 'r', name: 'r', name_zh: 'r', produces: [{ item: 'b', qty: q(1) }], uses: [{ anyOf: [{ item: 'a', qty: q(1) }] }], needs: [] }],
    ...over,
  });

  it('引用了未声明的东西', () => {
    const d = base({
      routes: [{ id: 'r', name: 'r', name_zh: 'r', produces: [{ item: 'b', qty: q(1) }], uses: [{ anyOf: [{ item: 'ghost', qty: q(1) }] }], needs: [] }],
    });
    assert.deepEqual(codes(d), ['unknown_item']);
  });

  it('没有产出路线的条目会被列出来（不是错误）', () => {
    const d = base({});
    const v = validate(d);
    assert.deepEqual(v.errors, []);
    assert.ok(v.notes.some((n) => n.code === 'unproduced'));
  });

  it('数量必须是正有理数', () => {
    // q() 本身拒绝非法输入；这里绕过构造器，模拟"手写数据时写错"
    const bad = { num: 0, den: 1 } as unknown as ReturnType<typeof q>;
    const d = base({
      routes: [{ id: 'r', name: 'r', name_zh: 'r', produces: [{ item: 'b', qty: bad }], uses: [{ anyOf: [{ item: 'a', qty: q(1) }] }], needs: [] }],
    });
    assert.ok(codes(d).includes('bad_quantity'));
  });

  it('id 重复', () => {
    const d = base({ items: [{ id: 'a', name: 'a', name_zh: 'a' }, { id: 'a', name: 'a', name_zh: 'a' }, { id: 'b', name: 'b', name_zh: 'b' }] });
    assert.ok(codes(d).includes('duplicate_id'));
  });

  it('空子句', () => {
    const d = base({
      routes: [{ id: 'r', name: 'r', name_zh: 'r', produces: [{ item: 'b', qty: q(1) }], uses: [{ anyOf: [] }], needs: [] }],
    });
    assert.ok(codes(d).includes('empty_clause'));
  });

  it('既不产出也不消耗', () => {
    const d = base({
      routes: [{ id: 'r', name: 'r', name_zh: 'r', produces: [], uses: [], needs: [] }, { id: 'r2', name: 'r2', name_zh: 'r2', produces: [{ item: 'b', qty: q(1) }], uses: [{ anyOf: [{ item: 'a', qty: q(1) }] }], needs: [] }],
    });
    assert.ok(codes(d).includes('empty_route'));
  });
});
