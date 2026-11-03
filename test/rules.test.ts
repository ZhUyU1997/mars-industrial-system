/**
 * 语言规则的测试 —— 每条规则一组用例，夹具是临时构造的小对象。
 *
 * 真实数据的测试在 aluminium.test.ts 与 mill.test.ts，
 * 数据本身在 data/ 下。
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { Description } from '../src/index.ts';
import { q, validate } from '../src/index.ts';

describe('设备：不被消耗，只被指名', () => {
  it('设备写进 uses 会被拦下 —— 它不会被用掉', () => {
    const wrong: Description = {
      items: [
        { id: 'ore', name: 'ore', name_zh: 'ore' },
        { id: 'tool', name: 'tool', name_zh: 'tool', category: 'machine' },
        { id: 'metal', name: 'metal', name_zh: 'metal' },
      ],
      routes: [
        {
          id: 'r',
          name: 'r', name_zh: 'r',
          produces: [{ item: 'metal', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }, { anyOf: [{ item: 'tool', qty: q(1) }] }],
          needs: [],
        },
      ],
    };
    assert.ok(validate(wrong).errors.some((e) => e.code === 'machine_consumed'));
  });

  it('performedBy 指向非设备会被拒', () => {
    const wrong: Description = {
      items: [
        { id: 'ore', name: 'ore', name_zh: 'ore', category: 'material' },
        { id: 'metal', name: 'metal', name_zh: 'metal' },
      ],
      routes: [
        {
          id: 'r',
          name: 'r', name_zh: 'r',
          produces: [{ item: 'metal', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }],
          needs: [],
          performedBy: 'ore',
        },
      ],
    };
    assert.ok(validate(wrong).errors.some((e) => e.code === 'not_a_machine'));
  });

  it('设备可以自己产出自己 —— 母机就是自指，必须允许', () => {
    const self: Description = {
      items: [
        { id: 'ore', name: 'ore', name_zh: 'ore' },
        { id: 'bed', name: 'bed', name_zh: 'bed', category: 'part' },
        { id: 'lathe', name: 'lathe', name_zh: 'lathe', category: 'machine' },
      ],
      routes: [
        {
          id: 'make_lathe',
          name: 'make_lathe', name_zh: 'make_lathe',
          produces: [{ item: 'lathe', qty: q(3) }],
          uses: [{ anyOf: [{ item: 'bed', qty: q(3) }] }],
          needs: [],
          performedBy: 'lathe',
        },
      ],
    };
    // 自指是合法的：车床加工自己的零件。校验只应提示，不应报错
    assert.deepEqual(validate(self).errors, []);
  });

  it('没有任何 route 使用的设备只是提示，不是错误', () => {
    const idle: Description = {
      items: [
        { id: 'ore', name: 'ore', name_zh: 'ore' },
        { id: 'spare', name: 'spare', name_zh: 'spare', category: 'machine' },
        { id: 'metal', name: 'metal', name_zh: 'metal' },
      ],
      routes: [
        { id: 'r', name: 'r', name_zh: 'r', produces: [{ item: 'metal', qty: q(1) }], uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }], needs: [] },
      ],
    };
    const v = validate(idle);
    assert.deepEqual(v.errors, []);
    assert.ok(v.notes.some((n) => n.where === 'spare'));
  });

  it('材料维持条件仍然矛盾 —— 只有设备能提供条件', () => {
    const wrong: Description = {
      items: [
        { id: 'a', name: 'a', name_zh: 'a' },
        { id: 'b', name: 'b', name_zh: 'b' },
        { id: 'odd', name: 'odd', name_zh: 'odd', category: 'material', holds: [{ param: 'temperature', min: 0, max: 10 }] },
      ],
      routes: [{ id: 'r', name: 'r', name_zh: 'r', produces: [{ item: 'b', qty: q(1) }], uses: [{ anyOf: [{ item: 'a', qty: q(1) }] }], needs: [] }],
    };
    assert.ok(validate(wrong).errors.some((e) => e.code === 'bad_category'));
  });

});

describe('单位：替代必须可通约', () => {
  it('同一子句内单位不一致会被拒 —— 800 kg 焦不能替代 800 kWh 电', () => {
    const bad: Description = {
      items: [
        { id: 'coke', name: 'coke', name_zh: 'coke', unit: 'kg' },
        { id: 'power', name: 'power', name_zh: 'power', unit: 'kWh' },
        { id: 'thing', name: 'thing', name_zh: 'thing', unit: 'kg' },
      ],
      routes: [
        {
          id: 'r',
          name: 'r', name_zh: 'r',
          produces: [{ item: 'thing', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'coke', qty: q(800) }, { item: 'power', qty: q(800) }] }],
          needs: [],
        },
      ],
    };
    const codes = validate(bad).errors.map((e) => e.code);
    assert.ok(codes.includes('unit_mismatch'), JSON.stringify(validate(bad).errors));
  });

  it('不同子句用不同单位是合法的：800 kg 焦 + 800 kWh 电', () => {
    const ok: Description = {
      items: [
        { id: 'coke', name: 'coke', name_zh: 'coke', unit: 'kg' },
        { id: 'power', name: 'power', name_zh: 'power', unit: 'kWh' },
        { id: 'thing', name: 'thing', name_zh: 'thing', unit: 'kg' },
      ],
      routes: [
        {
          id: 'r',
          name: 'r', name_zh: 'r',
          produces: [{ item: 'thing', qty: q(800) }],
          uses: [{ anyOf: [{ item: 'coke', qty: q(800) }] }, { anyOf: [{ item: 'power', qty: q(800) }] }],
          needs: [],
        },
      ],
    };
    assert.deepEqual(validate(ok).errors, []);
  });

});

describe('质量守恒：只算 kg 项', () => {
  it('进料与出料不平会报错，并给出两边总量', () => {
    const bad: Description = {
      items: [
        { id: 'ore', name: 'ore', name_zh: 'ore', unit: 'kg', category: 'material' },
        { id: 'metal', name: 'metal', name_zh: 'metal', unit: 'kg' },
      ],
      routes: [
        { id: 'r', name: 'r', name_zh: 'r', produces: [{ item: 'metal', qty: q(100) }], uses: [{ anyOf: [{ item: 'ore', qty: q(300) }] }], needs: [] },
      ],
    };
    const err = validate(bad).errors.find((e) => e.code === 'unbalanced');
    assert.ok(err, JSON.stringify(validate(bad).errors));
    assert.match(err.detail, /300/, '应报出进料总量');
    assert.match(err.detail, /100/, '应报出出料总量');
  });

  it('不同量纲不相加：kWh 不参与质量守恒', () => {
    const ok: Description = {
      items: [
        { id: 'ore', name: 'ore', name_zh: 'ore', unit: 'kg', category: 'material' },
        { id: 'power', name: 'power', name_zh: 'power', unit: 'kWh', category: 'carrier' },
        { id: 'metal', name: 'metal', name_zh: 'metal', unit: 'kg' },
      ],
      routes: [
        {
          id: 'r',
          name: 'r', name_zh: 'r',
          produces: [{ item: 'metal', qty: q(100) }],
          uses: [{ anyOf: [{ item: 'ore', qty: q(100) }] }, { anyOf: [{ item: 'power', qty: q(9999) }] }],
          needs: [],
        },
      ],
    };
    assert.deepEqual(validate(ok).errors, []);
  });

  it('确实不守恒时可以显式声明，但会被点名', () => {
    const declared: Description = {
      items: [
        { id: 'ore', name: 'ore', name_zh: 'ore', unit: 'kg', category: 'material' },
        { id: 'metal', name: 'metal', name_zh: 'metal', unit: 'kg' },
      ],
      routes: [
        {
          id: 'r',
          name: 'r', name_zh: 'r',
          produces: [{ item: 'metal', qty: q(100) }],
          uses: [{ anyOf: [{ item: 'ore', qty: q(300) }] }],
          needs: [],
          unbalanced_zh: '只描述主产品，尾渣成分未知，暂不建条目',
        },
      ],
    };
    const v = validate(declared);
    assert.deepEqual(v.errors, []);
    assert.ok(v.notes.some((n) => n.code === 'declared_unbalanced'));
  });

});

describe('单处事实来源', () => {
  it('needs 里重复执行设备会被拒', () => {
    const dup: Description = {
      items: [
        { id: 'ore', name: 'ore', name_zh: 'ore', unit: 'kg' },
        { id: 'tool', name: 'tool', name_zh: 'tool', category: 'machine' },
        { id: 'metal', name: 'metal', name_zh: 'metal', unit: 'kg' },
      ],
      routes: [
        {
          id: 'r',
          name: 'r', name_zh: 'r',
          produces: [{ item: 'metal', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }],
          needs: ['tool'],
          performedBy: 'tool',
        },
      ],
    };
    assert.ok(validate(dup).errors.some((e) => e.code === 'redundant_need'));
  });
});

describe('条件自举：能提供条件的设备，自己造得出来吗', () => {
  it('唯一承担者要靠它自己提供的条件才能造 → 条件死锁', () => {
    const dead: Description = {
      items: [
        { id: 'ore', name: 'ore', name_zh: 'ore', unit: 'kg' },
        /** 这台炉子提供高温，而造它也要高温 */
        { id: 'furnace', name: 'furnace', name_zh: 'furnace', category: 'machine', holds: [{ param: 'temperature', min: 1000, max: 1400 }] },
        { id: 'metal', name: 'metal', name_zh: 'metal', unit: 'kg' },
      ],
      routes: [
        {
          id: 'smelt',
          name: 'smelt', name_zh: 'smelt',
          produces: [{ item: 'metal', qty: q(1000) }],
          uses: [{ anyOf: [{ item: 'ore', qty: q(1000) }] }],
          needs: [],
          performedBy: 'furnace',
          under: [{ param: 'temperature', min: 1100, max: 1300 }],
        },
        {
          id: 'make_furnace',
          name: 'make_furnace', name_zh: 'make_furnace',
          produces: [{ item: 'furnace', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ore', qty: q(5) }] }],
          needs: [],
          under: [{ param: 'temperature', min: 1100, max: 1300 }],
        },
      ],
    };
    assert.ok(validate(dead).errors.some((e) => e.code === 'condition_cycle'));
  });

  it('承担者从外部来就没有死锁', () => {
    const ok: Description = {
      items: [
        { id: 'ore', name: 'ore', name_zh: 'ore', unit: 'kg' },
        { id: 'furnace', name: 'furnace', name_zh: 'furnace', category: 'machine', holds: [{ param: 'temperature', min: 1000, max: 1400 }] },
        { id: 'metal', name: 'metal', name_zh: 'metal', unit: 'kg' },
      ],
      routes: [
        {
          id: 'smelt',
          name: 'smelt', name_zh: 'smelt',
          produces: [{ item: 'metal', qty: q(1000) }],
          uses: [{ anyOf: [{ item: 'ore', qty: q(1000) }] }],
          needs: [],
          performedBy: 'furnace',
          under: [{ param: 'temperature', min: 1100, max: 1300 }],
        },
      ],
    };
    assert.deepEqual(validate(ok).errors, []);
  });
});

describe('自产还是外购，不是声明，是事实', () => {
  const base = (anvilExtra: object, routes: Description['routes']): Description => ({
    items: [
      { id: 'ore', name: 'ore', name_zh: 'ore', unit: 'kg' },
      { id: 'anvil_part', name: 'anvil_part', name_zh: 'anvil_part', unit: 'kg', category: 'part' },
      { id: 'anvil', name: 'anvil', name_zh: 'anvil', category: 'machine', ...anvilExtra },
      { id: 'metal', name: 'metal', name_zh: 'metal', unit: 'kg' },
    ],
    routes,
  });
  const smelt = {
    id: 'smelt',
    name: 'smelt', name_zh: 'smelt',
    produces: [{ item: 'metal', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }],
    needs: [],
    performedBy: 'anvil',
  };

  it('没有产出路线的条目，就是从外面来的 —— 不是错误', () => {
    const v = validate(base({}, [smelt]));
    assert.deepEqual(v.errors, []);
    // 但会被列出来，否则"忘了写路线"与"确实要进口"长得一样
    assert.ok(v.notes.some((n) => n.code === 'unproduced' && n.detail.includes('anvil')));
  });

  it('写了产出路线，它就变成自产 —— 同样不是靠声明', () => {
    const v = validate(
      base({ unit: 'kg' }, [
        smelt,
        { id: 'make_anvil_part', name: 'make_anvil_part', name_zh: 'make_anvil_part', produces: [{ item: 'anvil_part', qty: q(10) }], uses: [{ anyOf: [{ item: 'ore', qty: q(10) }] }], needs: [], performedBy: 'anvil' },
        { id: 'make_anvil', name: 'make_anvil', name_zh: 'make_anvil', produces: [{ item: 'anvil', qty: q(10) }], uses: [{ anyOf: [{ item: 'anvil_part', qty: q(10) }] }], needs: [], performedBy: 'anvil' },
      ]),
    );
    assert.deepEqual(v.errors, []);
    assert.ok(!v.notes.some((n) => n.code === 'unproduced' && n.detail.includes('anvil')));
  });
});

describe('批次语义：有消耗必须有产出', () => {
  it('只消耗不产出的路线没有批次规模，被拒', () => {
    const bad: Description = {
      items: [
        { id: 'ore', name: 'ore', name_zh: 'ore', unit: 'kg' },
        { id: 'metal', name: 'metal', name_zh: 'metal', unit: 'kg' },
      ],
      routes: [
        { id: 'consume_only', name: 'consume_only', name_zh: 'consume_only', produces: [], uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }], needs: [] },
        { id: 'r', name: 'r', name_zh: 'r', produces: [{ item: 'metal', qty: q(1) }], uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }], needs: [] },
      ],
    };
    assert.ok(validate(bad).errors.some((e) => e.code === 'no_product'));
  });
});

describe('仍然装不进去的：单位只做字符串比较', () => {
  it('kg 与 t 视为不一致 —— 校验会误报', () => {
    const falsePositive: Description = {
      items: [
        { id: 'ore', name: 'ore', name_zh: 'ore', unit: 'kg' },
        { id: 'scrap', name: 'scrap', name_zh: 'scrap', unit: 't' },
        { id: 'metal', name: 'metal', name_zh: 'metal', unit: 'kg' },
      ],
      routes: [
        {
          id: 'r',
          name: 'r', name_zh: 'r',
          produces: [{ item: 'metal', qty: q(1) }],
          // kg 与 t 是可换算的，但校验只比字符串，于是判为不可通约
          uses: [{ anyOf: [{ item: 'ore', qty: q(1000) }, { item: 'scrap', qty: q(1) }] }],
          needs: [],
        },
      ],
    };
    assert.ok(validate(falsePositive).errors.some((e) => e.code === 'unit_mismatch'));
    // ⇒ 单位是一串字符串，不是带换算的量纲。
    //    要正确，需要单位代数（kg↔t↔mol），或固定一套规范单位并强制换算。
    //    在此之前：误报（可通约但名字不同）与漏报（同名但实际不同）都可能发生。
  });
});

describe('未定义：标了就不再算遗漏', () => {
  it('零件标了未定义 —— 不报错，但进 deferred 清单', () => {
    const d: Description = {
      items: [
        { id: 'bracket', name: 'bracket', name_zh: 'bracket', unit: '件', category: 'part', deferred: true },
        { id: 'machine', name: 'machine', name_zh: 'machine', unit: '台', category: 'machine' },
      ],
      routes: [],
    };
    const v = validate(d);
    assert.equal(v.errors.length, 0);
    assert.ok(v.notes.some((n) => n.code === 'deferred' && n.detail.includes('bracket')));
  });

  it('消耗件也可以标', () => {
    const d: Description = {
      items: [{ id: 'goo', name: 'goo', name_zh: 'goo', unit: 'kg', category: 'consumable', deferred: true }],
      routes: [],
    };
    assert.equal(validate(d).errors.length, 0);
  });

  it('材料标了未定义会被拒 —— 未定义只落在零件与消耗上', () => {
    const d: Description = {
      items: [{ id: 'ore', name: 'ore', name_zh: 'ore', unit: 'kg', category: 'material', deferred: true }],
      routes: [],
    };
    assert.ok(validate(d).errors.some((e) => e.code === 'bad_category'));
  });

  it('机器标了未定义会被拒 —— 未定义的机器什么也证明不了', () => {
    const d: Description = {
      items: [{ id: 'lathe', name: 'lathe', name_zh: 'lathe', unit: '台', category: 'machine', deferred: true }],
      routes: [],
    };
    assert.ok(validate(d).errors.some((e) => e.code === 'bad_category'));
  });

  it('去掉标记就回到 unproduced —— 两种状态分开报', () => {
    const d: Description = {
      items: [{ id: 'bracket', name: 'bracket', name_zh: 'bracket', unit: '件', category: 'part' }],
      routes: [],
    };
    const v = validate(d);
    assert.equal(v.errors.length, 0);
    assert.ok(!v.notes.some((n) => n.code === 'deferred'));
    assert.ok(v.notes.some((n) => n.code === 'unproduced' && n.detail.includes('bracket')));
  });
});

describe('共用件：标准件走规格号', () => {
  // 前缀不是归属，是消歧。专用件的规格由机器决定，标准件的规格写在名字里。

  it('标准件可以跨机器共用 —— 不报 bad_component', () => {
    const d: Description = {
      items: [
        {
          id: 'mill-a',
          name: 'mill-a', name_zh: 'mill-a',
          unit: '台',
          category: 'machine',
          composedOf: [
            { item: 'mill-a/base', qty: q(1) },
            { item: 'std/bolt-m8x40', qty: q(8) },
          ],
        },
        {
          id: 'mill-b',
          name: 'mill-b', name_zh: 'mill-b',
          unit: '台',
          category: 'machine',
          composedOf: [
            { item: 'mill-b/base', qty: q(1) },
            { item: 'std/bolt-m8x40', qty: q(4) },
          ],
        },
        { id: 'mill-a/base', name: 'mill-a/base', name_zh: 'mill-a/base', unit: '件', category: 'part' },
        { id: 'mill-b/base', name: 'mill-b/base', name_zh: 'mill-b/base', unit: '件', category: 'part' },
        { id: 'std/bolt-m8x40', name: 'std/bolt-m8x40', name_zh: 'std/bolt-m8x40', unit: '件', category: 'part' },
      ],
      routes: [],
    };
    const v = validate(d);
    assert.equal(v.errors.filter((e) => e.code === 'bad_component').length, 0);
    assert.equal(v.notes.filter((n) => n.code === 'std_single_use').length, 0);
  });

  it('没有规格号的 std/ 会被拒 —— 规格号是它唯一的消歧方式', () => {
    const d: Description = {
      items: [{ id: 'std/bearing', name: 'std/bearing', name_zh: 'std/bearing', unit: '件', category: 'part' }],
      routes: [],
    };
    assert.ok(validate(d).errors.some((e) => e.code === 'std_without_spec'));
  });

  it('扁平的专用件名仍然被拒 —— std/ 不是后门', () => {
    const d: Description = {
      items: [
        {
          id: 'mill-a',
          name: 'mill-a', name_zh: 'mill-a',
          unit: '台',
          category: 'machine',
          composedOf: [{ item: 'base', qty: q(1) }],
        },
        { id: 'base', name: 'base', name_zh: 'base', unit: '件', category: 'part' },
      ],
      routes: [],
    };
    assert.ok(validate(d).errors.some((e) => e.code === 'bad_component'));
  });

  it('只被一台机器用到的标准件 —— 提示，但不是错误', () => {
    const d: Description = {
      items: [
        {
          id: 'mill-a',
          name: 'mill-a', name_zh: 'mill-a',
          unit: '台',
          category: 'machine',
          composedOf: [{ item: 'std/tap-m6', qty: q(2) }],
        },
        { id: 'std/tap-m6', name: 'std/tap-m6', name_zh: 'std/tap-m6', unit: '件', category: 'part' },
      ],
      routes: [],
    };
    const v = validate(d);
    assert.equal(v.errors.length, 0);
    // 判据是规格独立性，用量只是症状 —— 所以是提示不是错误
    assert.ok(v.notes.some((n) => n.code === 'std_single_use' && n.where === 'std/tap-m6'));
  });

  it('标准装配体的子件不触发提示 —— 规格由父件继承', () => {
    const d: Description = {
      items: [
        {
          id: 'mill-a',
          name: 'mill-a', name_zh: 'mill-a',
          unit: '台',
          category: 'machine',
          composedOf: [
            { item: 'std/motor-7.5kw-4p', qty: q(1) },
            { item: 'mill-a/base', qty: q(1) },
          ],
        },
        {
          id: 'std/motor-7.5kw-4p',
          name: 'std/motor-7.5kw-4p', name_zh: 'std/motor-7.5kw-4p',
          unit: '台',
          category: 'part',
          composedOf: [{ item: 'std/motor-7.5kw-4p/stator', qty: q(1) }],
        },
        { id: 'std/motor-7.5kw-4p/stator', name: 'std/motor-7.5kw-4p/stator', name_zh: 'std/motor-7.5kw-4p/stator', unit: '件', category: 'part' },
        { id: 'mill-a/base', name: 'mill-a/base', name_zh: 'mill-a/base', unit: '件', category: 'part' },
      ],
      routes: [],
    };
    const v = validate(d);
    assert.equal(v.errors.length, 0);
    // stator 只被那只电机用到，但它的 id 以 std/motor-7.5kw-4p/ 开头 ——
    // 规格由父件继承，是对的，不该为它提示
    assert.ok(!v.notes.some((n) => n.code === 'std_single_use' && n.where === 'std/motor-7.5kw-4p/stator'));
    // 而电机自己在这个最小的描述里只被一台机器用到 —— 提示它，是对的
    assert.ok(v.notes.some((n) => n.code === 'std_single_use' && n.where === 'std/motor-7.5kw-4p'));
  });
});

describe('路线级判据只报一次', () => {
  const build = (n: number): Description => ({
    items: [
      { id: 'mat/ore', name: 'mat/ore', name_zh: 'mat/ore', unit: 'kg', category: 'material' },
      { id: 'plant/blackbox', name: 'plant/blackbox', name_zh: 'plant/blackbox', unit: '台', category: 'machine' },
      ...Array.from({ length: n }, (_, i) => ({ id: 'part-' + i, name: 'Part ' + i, name_zh: '零件' + i, unit: '件', category: 'part' as const })),
    ],
    routes: [
      {
        id: 'make/blackbox',
        name: 'make/blackbox', name_zh: 'make/blackbox',
        produces: [{ item: 'plant/blackbox', qty: q(1) }],
        uses: [{ anyOf: [{ item: 'mat/ore', qty: q(1) }] }],
        needs: [],
      },
    ],
  });

  // 这两条判据曾经写在条目循环里：同一条坏路线被报 N 次（N = 条目数），
  // 于是"错了几条"这个数失去意义，条目越多错误越多。
  it('造机器却没有零件 —— 不论条目多少，只报一条', () => {
    for (const n of [0, 3, 42]) {
      const hits = validate(build(n)).errors.filter((e) => e.code === 'machine_without_parts');
      assert.equal(hits.length, 1, `条目 ${n + 2} 条时应只报一条，实际 ${hits.length}`);
    }
  });

  it('用 kg 零件装无量纲机器 —— 也只报一条', () => {
    for (const n of [0, 3, 42]) {
      const base = build(n);
      // 直接构造新对象，不要 push —— Description 的字段是 readonly
      const d: Description = {
        items: [...base.items, { id: 'part-heavy', name: 'part-heavy', name_zh: 'part-heavy', unit: 'kg', category: 'part' }],
        routes: [
          {
            ...base.routes[0]!,
            uses: [...base.routes[0]!.uses, { anyOf: [{ item: 'part-heavy', qty: q(1) }] }],
          },
        ],
      };
      const hits = validate(d).errors.filter((e) => e.code === 'machine_unit_mismatch');
      assert.equal(hits.length, 1, `条目 ${n + 3} 条时应只报一条，实际 ${hits.length}`);
    }
  });
});

describe('工序：一条路线可以由几段接力', () => {
  const parts = () => [
    { id: 'ingot', name: 'ingot', name_zh: 'ingot', unit: 'kg', category: 'material' as const },
    { id: 'part', name: 'part', name_zh: 'part', unit: '件', category: 'part' as const },
    { id: 'lathe', name: 'lathe', name_zh: 'lathe', unit: '台', category: 'machine' as const },
    { id: 'furnace', name: 'furnace', name_zh: 'furnace', unit: '台', category: 'machine' as const, holds: [{ param: 'temperature', min: 800, max: 900 }] },
    { id: 'grinder', name: 'grinder', name_zh: 'grinder', unit: '台', category: 'machine' as const },
  ];

  it('三段各一台设备、各一组条件 —— 通过，路线级 performedBy 不必填', () => {
    const d: Description = {
      items: parts(),
      routes: [
        {
          id: 'make/part',
          name: 'make/part', name_zh: 'make/part',
          produces: [{ item: 'part', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ingot', qty: q(1) }] }],
          needs: [],
          steps: [
            { note_zh: '粗车', performedBy: 'lathe' },
            { note_zh: '淬火', performedBy: 'furnace', under: [{ param: 'temperature', min: 830, max: 860 }] },
            { note_zh: '磨', performedBy: 'grinder' },
          ],
        },
      ],
    };
    assert.equal(validate(d).errors.length, 0);
  });

  it('steps 与路线级 performedBy 同时写会被拒 —— 同一件事两个说法', () => {
    const d: Description = {
      items: parts(),
      routes: [
        {
          id: 'make/part',
          name: 'make/part', name_zh: 'make/part',
          produces: [{ item: 'part', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ingot', qty: q(1) }] }],
          needs: [],
          performedBy: 'lathe',
          steps: [{ note_zh: '磨', performedBy: 'grinder' }],
        },
      ],
    };
    assert.ok(validate(d).errors.some((e) => e.code === 'step_conflict'));
  });

  it('空 steps 会被拒 —— 不写比写空好', () => {
    const d: Description = {
      items: parts(),
      routes: [
        {
          id: 'make/part',
          name: 'make/part', name_zh: 'make/part',
          produces: [{ item: 'part', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ingot', qty: q(1) }] }],
          needs: [],
          steps: [],
        },
      ],
    };
    assert.ok(validate(d).errors.some((e) => e.code === 'empty_steps'));
  });

  it('某一段的执行者不是设备会被拒，并指出是哪一段', () => {
    const d: Description = {
      items: parts(),
      routes: [
        {
          id: 'make/part',
          name: 'make/part', name_zh: 'make/part',
          produces: [{ item: 'part', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ingot', qty: q(1) }] }],
          needs: [],
          steps: [
            { note_zh: '粗车', performedBy: 'lathe' },
            { note_zh: '装夹', performedBy: 'ingot' },
          ],
        },
      ],
    };
    const bad = validate(d).errors.find((e) => e.code === 'not_a_machine');
    assert.ok(bad !== undefined);
    assert.equal(bad?.where, 'make/part · 装夹');
  });

  it('某一段要求了条件却没有执行者 —— no_machine', () => {
    const d: Description = {
      items: parts(),
      routes: [
        {
          id: 'make/part',
          name: 'make/part', name_zh: 'make/part',
          produces: [{ item: 'part', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ingot', qty: q(1) }] }],
          needs: [],
          steps: [{ note_zh: '淬火', under: [{ param: 'temperature', min: 830, max: 860 }] }],
        },
      ],
    };
    assert.ok(validate(d).errors.some((e) => e.code === 'no_machine' && e.where === 'make/part · 淬火'));
  });

  it('某一段的设备维持不了那段的条件 —— no_machine，而不是整条路线凑合', () => {
    const d: Description = {
      items: parts(),
      routes: [
        {
          id: 'make/part',
          name: 'make/part', name_zh: 'make/part',
          produces: [{ item: 'part', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ingot', qty: q(1) }] }],
          needs: [],
          steps: [
            { note_zh: '粗车', performedBy: 'lathe' },
            // 车床不提供 830 °C —— 写成整条路线 under 时会被 needs 里的炉子顶掉，
            // 拆成工序之后就没有地方躲了
            { note_zh: '淬火', performedBy: 'lathe', under: [{ param: 'temperature', min: 830, max: 860 }] },
          ],
        },
      ],
    };
    assert.ok(validate(d).errors.some((e) => e.code === 'no_machine' && e.where === 'make/part · 淬火'));
  });

  it('某一段的执行者又写进 needs 会被拒 —— 设备只由工序表达', () => {
    const d: Description = {
      items: parts(),
      routes: [
        {
          id: 'make/part',
          name: 'make/part', name_zh: 'make/part',
          produces: [{ item: 'part', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ingot', qty: q(1) }] }],
          needs: ['grinder'],
          steps: [{ note_zh: '磨', performedBy: 'grinder' }],
        },
      ],
    };
    assert.ok(validate(d).errors.some((e) => e.code === 'redundant_need'));
  });

  it('条件自举能看见 steps —— 造设备的路线在工序里要求同一个条件', () => {
    const d: Description = {
      items: [
        { id: 'ingot', name: 'ingot', name_zh: 'ingot', unit: 'kg', category: 'material' },
        { id: 'part', name: 'part', name_zh: 'part', unit: '件', category: 'part' },
        { id: 'kiln', name: 'kiln', name_zh: 'kiln', unit: '台', category: 'machine', holds: [{ param: 'temperature', min: 800, max: 900 }] },
        { id: 'oven', name: 'oven', name_zh: 'oven', unit: '台', category: 'machine', holds: [{ param: 'temperature', min: 850, max: 870 }] },
        { id: 'lathe', name: 'lathe', name_zh: 'lathe', unit: '台', category: 'machine' },
      ],
      routes: [
        {
          id: 'make/oven',
          name: 'make/oven', name_zh: 'make/oven',
          produces: [{ item: 'oven', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ingot', qty: q(1) }] }],
          needs: [],
          performedBy: 'kiln',
          under: [{ param: 'temperature', min: 850, max: 870 }],
        },
        {
          id: 'make/part',
          name: 'make/part', name_zh: 'make/part',
          produces: [{ item: 'part', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ingot', qty: q(1) }] }],
          needs: [],
          steps: [
            { note_zh: '粗车', performedBy: 'lathe' },
            { note_zh: '烘烤', performedBy: 'oven', under: [{ param: 'temperature', min: 850, max: 860 }] },
          ],
        },
      ],
    };
    assert.ok(validate(d).errors.some((e) => e.code === 'condition_cycle' && e.where === 'make/part · 烘烤'));
  });
});

describe('环境条件：现场本来就在维持的东西', () => {
  // 火星大气 0.6 kPa。它不需要设备，但它也限制：要求更高压力的工序必须有压力容器。
  const ambient = [{ param: 'pressure', min: 0.6, max: 0.6 }];

  it('要求在环境压力范围内的工序，不需要设备', () => {
    const d: Description = {
      ambient,
      items: [{ id: 'ore', name: 'ore', name_zh: 'ore', category: 'material' }, { id: 'metal', name: 'metal', name_zh: 'metal' }],
      routes: [
        {
          id: 'r',
          name: 'r', name_zh: 'r',
          produces: [{ item: 'metal', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }],
          needs: [],
          performedBy: 'plant/robot',
          under: [{ param: 'pressure', min: 0.5, max: 0.6 }],
        },
      ],
    };
    // performedBy 指向不存在的设备会另报 not_a_machine；这里只看条件那一条
    assert.ok(!validate(d).errors.some((e) => e.code === 'no_machine'));
  });

  it('要求加压却没有压力容器 → no_machine', () => {
    const d: Description = {
      ambient,
      items: [
        { id: 'ore', name: 'ore', name_zh: 'ore', category: 'material' },
        { id: 'metal', name: 'metal', name_zh: 'metal' },
        { id: 'shed', name: 'shed', name_zh: 'shed', category: 'machine' },
      ],
      routes: [
        {
          id: 'r',
          name: 'r', name_zh: 'r',
          produces: [{ item: 'metal', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }],
          needs: [],
          performedBy: 'shed',
          under: [{ param: 'pressure', min: 300, max: 1000 }],
        },
      ],
    };
    assert.ok(validate(d).errors.some((e) => e.code === 'no_machine'));
  });

  it('同一台设备 hold 了压力，就通过了', () => {
    const d: Description = {
      ambient,
      items: [
        { id: 'ore', name: 'ore', name_zh: 'ore', category: 'material' },
        { id: 'metal', name: 'metal', name_zh: 'metal' },
        { id: 'vessel', name: 'vessel', name_zh: 'vessel', category: 'machine', holds: [{ param: 'pressure', min: 300, max: 1000 }] },
      ],
      routes: [
        {
          id: 'r',
          name: 'r', name_zh: 'r',
          produces: [{ item: 'metal', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }],
          needs: [],
          performedBy: 'vessel',
          under: [{ param: 'pressure', min: 300, max: 800 }],
        },
      ],
    };
    assert.equal(validate(d).errors.length, 0);
  });

  it('环境条件的区间本身要成立', () => {
    const bad: Description = {
      ambient: [{ param: 'pressure', min: 5, max: 1 }],
      items: [{ id: 'ore', name: 'ore', name_zh: 'ore', category: 'material' }, { id: 'metal', name: 'metal', name_zh: 'metal' }],
      routes: [],
    };
    assert.ok(validate(bad).errors.some((e) => e.code === 'bad_condition'));
  });
});

describe('属性窗口：把「同名」与「降级」变成可判定的区间', () => {
  /** 一份最小的属性系统夹具：条目声明属性，路线给窗口。 */
  const base = (
    over: Partial<{ gives: unknown; need: unknown; onRelax: string }> = {},
  ): Description =>
    ({
      items: [
        {
          id: 'acid',
          name: 'acid', name_zh: 'acid',
          category: 'material',
          unit: 'kg',
          props: [{ param: 'concentration', kind: 'range', min: 0, max: 100, unit: '%' }],
        },
        { id: 'ore', name: 'ore', name_zh: 'ore', category: 'material', unit: 'kg' },
        { id: 'salt', name: 'salt', name_zh: 'salt', category: 'material' },
      ],
      routes: [
        {
          id: 'make/acid-wet',
          name: 'make/acid-wet', name_zh: 'make/acid-wet',
          produces: [
            {
              item: 'acid',
              qty: q(1000),
              ...(over.gives !== undefined
                ? { gives: over.gives }
                : { gives: [{ param: 'concentration', kind: 'range', min: 30, max: 50 }] }),
            },
          ],
          uses: [{ anyOf: [{ item: 'ore', qty: q(1000) }] }],
          needs: [],
          performedBy: 'plant/x',
        },
        {
          id: 'make/uses-conc',
          name: 'make/uses-conc', name_zh: 'make/uses-conc',
          produces: [{ item: 'salt', qty: q(1) }],
          uses: [
            {
              anyOf: [
                {
                  item: 'acid',
                  qty: q(1),
                  ...(over.need !== undefined
                    ? { need: over.need }
                    : { need: [{ param: 'concentration', kind: 'range', min: 98, max: 98 }] }),
                  ...(over.onRelax !== undefined ? { onRelax: over.onRelax } : {}),
                },
              ],
            },
          ],
          needs: [],
          performedBy: 'plant/x',
        },
      ],
    }) as unknown as Description;

  it('要 98 % 而只产 30–50 % → prop_unfilled，并且把两边的窗口都写出来', () => {
    const notes = validate(base()).notes;
    const n = notes.find((x) => x.code === 'prop_unfilled');
    assert.ok(n, '应当报 prop_unfilled');
    assert.match(n!.detail, /98/);
    assert.match(n!.detail, /30/);
  });

  it('交付窗口盖住要求 → 不报 unfilled', () => {
    const d = base({ gives: [{ param: 'concentration', kind: 'range', min: 95, max: 100 }] });
    assert.equal(validate(d).notes.some((x) => x.code === 'prop_unfilled'), false);
  });

  it('交付比要求宽 → prop_widened（允许，但差多少要看见）', () => {
    const d = base({ gives: [{ param: 'concentration', kind: 'range', min: 90, max: 100 }] });
    assert.ok(validate(d).notes.some((x) => x.code === 'prop_widened'));
  });

  it('要求了条目没声明的属性 → prop_unknown（写错，不是提示）', () => {
    const d = base({ need: [{ param: 'purity', kind: 'range', min: 99, max: 100 }] });
    assert.ok(validate(d).errors.some((e) => e.code === 'prop_unknown'));
  });

  it('functional-lost → 单列成「不是降级，是换了东西」', () => {
    const d = base({ onRelax: 'functional-lost' });
    assert.ok(validate(d).notes.some((x) => x.code === 'prop_not_functional'));
  });

  it('同一条路线进出的规格不同 → prop_transforms（提示，不是错误）', () => {
    const bad = {
      items: [
        {
          id: 'acid',
          name: 'acid', name_zh: 'acid',
          category: 'material',
          unit: 'kg',
          props: [{ param: 'concentration', kind: 'range', min: 0, max: 100, unit: '%' }],
        },
        { id: 'ore', name: 'ore', name_zh: 'ore', category: 'material', unit: 'kg' },
        { id: 'plant/x', name: 'plant/x', name_zh: 'plant/x', category: 'machine' },
      ],
      routes: [
        {
          id: 'make/bad',
          name: 'make/bad', name_zh: 'make/bad',
          produces: [
            { item: 'acid', qty: q(1000), gives: [{ param: 'concentration', kind: 'range', min: 98, max: 98 }] },
          ],
          uses: [
            {
              anyOf: [
                {
                  item: 'acid',
                  qty: q(1000),
                  need: [{ param: 'concentration', kind: 'range', min: 30, max: 50 }],
                  onRelax: 'functional-kept',
                },
              ],
            },
          ],
          needs: [],
          performedBy: 'plant/x',
        },
      ],
    } as unknown as Description;
    // 改规格不是错：兑水就是这条路线存在的理由。只作提示。
    assert.ok(validate(bad).notes.some((e) => e.code === 'prop_transforms'));
    assert.equal(validate(bad).errors.filter((e) => e.code.startsWith('prop')).length, 0);
  });

  it('不写 need/gives 时行为完全不变 —— 老数据零改动', () => {
    const plain = {
      items: [
        { id: 'acid', name: 'acid', name_zh: 'acid', category: 'material', unit: 'kg' },
        { id: 'ore', name: 'ore', name_zh: 'ore', category: 'material', unit: 'kg' },
        { id: 'plant/x', name: 'plant/x', name_zh: 'plant/x', category: 'machine' },
      ],
      routes: [
        {
          id: 'make/a',
          name: 'make/a', name_zh: 'make/a',
          produces: [{ item: 'acid', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }],
          needs: [],
          performedBy: 'plant/x',
        },
      ],
    } as unknown as Description;
    const v = validate(plain);
    assert.equal(v.errors.length, 0, JSON.stringify(v.errors));
    assert.equal(v.notes.filter((n) => n.code.startsWith('prop')).length, 0);
  });
});

describe('必选：声明了就要交付，写了要求就要表态', () => {
  const items = [
    {
      id: 'acid',
      name: 'acid', name_zh: 'acid',
      category: 'material',
      unit: 'kg',
      props: [{ param: 'concentration', kind: 'range', min: 0, max: 100, unit: '%' }],
    },
    { id: 'ore', name: 'ore', name_zh: 'ore', category: 'material', unit: 'kg' },
    { id: 'plant/x', name: 'plant/x', name_zh: 'plant/x', category: 'machine' },
  ];

  it('声明了属性而产出路线没给窗口 → prop_missing_gives（错误，不是提示）', () => {
    const d = {
      items,
      routes: [
        {
          id: 'make/a',
          name: 'make/a', name_zh: 'make/a',
          produces: [{ item: 'acid', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }],
          needs: [],
          performedBy: 'plant/x',
        },
      ],
    } as unknown as Description;
    const errs = validate(d).errors.map((e) => e.code);
    assert.ok(errs.includes('prop_missing_gives'), JSON.stringify(errs));
  });

  it('交了空窗口就算交了 —— "不限"也要写出来', () => {
    const d = {
      items,
      routes: [
        {
          id: 'make/a',
          name: 'make/a', name_zh: 'make/a',
          produces: [
            { item: 'acid', qty: q(1), gives: [{ param: 'concentration', kind: 'range' }] },
          ],
          uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }],
          needs: [],
          performedBy: 'plant/x',
        },
      ],
    } as unknown as Description;
    assert.equal(validate(d).errors.length, 0, JSON.stringify(validate(d).errors));
  });

  it('写了 need 却没写 onRelax → prop_no_onrelax', () => {
    const d = {
      items,
      routes: [
        {
          id: 'make/a',
          name: 'make/a', name_zh: 'make/a',
          produces: [
            {
              item: 'acid',
              qty: q(1),
              gives: [{ param: 'concentration', kind: 'range', min: 90, max: 100 }],
            },
          ],
          uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }],
          needs: [],
          performedBy: 'plant/x',
        },
        {
          id: 'make/b',
          name: 'make/b', name_zh: 'make/b',
          produces: [{ item: 'ore', qty: q(1) }],
          uses: [
            {
              anyOf: [
                { item: 'acid', qty: q(1), need: [{ param: 'concentration', kind: 'range', min: 98, max: 98 }] },
              ],
            },
          ],
          needs: [],
          performedBy: 'plant/x',
        },
      ],
    } as unknown as Description;
    const errs = validate(d).errors.map((e) => e.code);
    assert.ok(errs.includes('prop_no_onrelax'), JSON.stringify(errs));
  });

  it('同一条目对同一属性声明两次 → prop_dup_decl', () => {
    const d = {
      items: [
        {
          id: 'acid',
          name: 'acid', name_zh: 'acid',
          category: 'material',
          unit: 'kg',
          props: [
            { param: 'concentration', kind: 'range', min: 0, max: 100, unit: '%' },
            { param: 'concentration', kind: 'range', min: 0, max: 50, unit: '%' },
          ],
        },
        { id: 'plant/x', name: 'plant/x', name_zh: 'plant/x', category: 'machine' },
      ],
      routes: [],
    } as unknown as Description;
    assert.ok(validate(d).errors.some((e) => e.code === 'prop_dup_decl'));
  });
});

describe('D1：子机器可以进组成件', () => {
  it('machine 可以进 composedOf，且不需要父前缀', () => {
    const d: Description = {
      items: [
        {
          id: 'room',
          name: 'room', name_zh: 'room',
          unit: '台',
          category: 'machine',
          composedOf: [{ item: 'meter', qty: q(1) }],
        },
        { id: 'meter', name: 'meter', name_zh: 'meter', unit: '台', category: 'machine' },
      ],
      routes: [],
    };
    const v = validate(d);
    assert.equal(v.errors.filter((e) => e.code === 'bad_component').length, 0);
  });

  it('子机器写 wear 被拒 —— wear 只给零件', () => {
    const d: Description = {
      items: [
        {
          id: 'room',
          name: 'room', name_zh: 'room',
          unit: '台',
          category: 'machine',
          composedOf: [
            { item: 'meter', qty: q(1), wear: { amount: q(1, 2), per: q(1000) } },
          ],
        },
        { id: 'meter', name: 'meter', name_zh: 'meter', unit: '台', category: 'machine' },
      ],
      routes: [],
    };
    const v = validate(d);
    assert.ok(
      v.errors.some((e) => e.code === 'bad_component' && e.detail.includes('子机器')),
    );
  });

  it('子机器组成成环 → composed_cycle', () => {
    const d: Description = {
      items: [
        {
          id: 'a',
          name: 'a', name_zh: 'a',
          unit: '台',
          category: 'machine',
          composedOf: [{ item: 'b', qty: q(1) }],
        },
        {
          id: 'b',
          name: 'b', name_zh: 'b',
          unit: '台',
          category: 'machine',
          composedOf: [{ item: 'a', qty: q(1) }],
        },
      ],
      routes: [],
    };
    const v = validate(d);
    assert.ok(v.errors.some((e) => e.code === 'composed_cycle'));
  });

  it('父机器有 mass：零件 + 子机器质量必须对得上', () => {
    const d: Description = {
      items: [
        {
          id: 'host',
          name: 'host', name_zh: 'host',
          unit: 'kg',
          category: 'machine',
          mass: q(100),
          composedOf: [
            { item: 'host/base', qty: q(1) },
            { item: 'meter', qty: q(1) },
          ],
        },
        { id: 'host/base', name: 'host/base', name_zh: 'host/base', unit: '件', category: 'part', mass: q(60) },
        { id: 'meter', name: 'meter', name_zh: 'meter', unit: '台', category: 'machine', mass: q(40) },
      ],
      routes: [],
    };
    const v = validate(d);
    assert.equal(
      v.errors.filter((e) => e.code === 'mass_mismatch' || e.code === 'bad_component').length,
      0,
    );
  });

  it('父机器有 mass，子机器没 mass → 质量核不出来', () => {
    const d: Description = {
      items: [
        {
          id: 'host',
          name: 'host', name_zh: 'host',
          unit: 'kg',
          category: 'machine',
          mass: q(100),
          composedOf: [
            { item: 'host/base', qty: q(1) },
            { item: 'meter', qty: q(1) },
          ],
        },
        { id: 'host/base', name: 'host/base', name_zh: 'host/base', unit: '件', category: 'part', mass: q(60) },
        { id: 'meter', name: 'meter', name_zh: 'meter', unit: '台', category: 'machine' },
      ],
      routes: [],
    };
    const v = validate(d);
    assert.ok(
      v.errors.some(
        (e) => e.code === 'bad_component' && e.detail.includes('质量核不出来'),
      ),
    );
  });
});

describe('前提：string | Option', () => {
  const base = (needs: Description['routes'][number]['needs']): Description => ({
    items: [
      {
        id: 'oven',
        name: 'oven', name_zh: 'oven',
        category: 'machine',
        holds: [{ param: 'temperature', min: 20, max: 30 }],
        props: [{ param: 'temperature', kind: 'range', min: 20, max: 30, unit: '°C' }],
      },
      { id: 'robot', name: 'robot', name_zh: 'robot', category: 'machine' },
      { id: 'ore', name: 'ore', name_zh: 'ore', category: 'material' },
      { id: 'part', name: 'part', name_zh: 'part', category: 'part' },
    ],
    routes: [
      {
        id: 'r',
        name: 'r', name_zh: 'r',
        produces: [{ item: 'part', qty: q(1) }],
        uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }],
        needs,
        performedBy: 'robot',
      },
    ],
  });

  it('Option 可以带 qty / need / onRelax', () => {
    const d = base([
      {
        item: 'oven',
        qty: q(1),
        need: [{ param: 'temperature', kind: 'range', min: 20, max: 30 }],
        onRelax: 'functional-kept',
      },
    ]);
    assert.equal(validate(d).errors.length, 0);
  });

  it('前提写了 need 却没写 onRelax → prop_no_onrelax', () => {
    const d = base([
      {
        item: 'oven',
        qty: q(1),
        need: [{ param: 'temperature', kind: 'range', min: 20, max: 30 }],
      },
    ]);
    assert.ok(validate(d).errors.some((e) => e.code === 'prop_no_onrelax'));
  });

  it('Option 指向未声明条目 → unknown_item', () => {
    const d = base([{ item: 'ghost', qty: q(1) }]);
    assert.ok(validate(d).errors.some((e) => e.code === 'unknown_item'));
  });

  it('前提与执行者重复 → redundant_need', () => {
    const d: Description = {
      items: [
        { id: 'oven', name: 'oven', name_zh: 'oven', category: 'machine' },
        { id: 'ore', name: 'ore', name_zh: 'ore', category: 'material' },
        { id: 'part', name: 'part', name_zh: 'part', category: 'part' },
      ],
      routes: [
        {
          id: 'r',
          name: 'r', name_zh: 'r',
          produces: [{ item: 'part', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }],
          needs: [{ item: 'oven', qty: q(1) }],
          performedBy: 'oven',
        },
      ],
    };
    assert.ok(validate(d).errors.some((e) => e.code === 'redundant_need'));
  });

  it('条件可以由 Option 前提里的设备维持', () => {
    const d: Description = {
      items: [
        {
          id: 'oven',
          name: 'oven', name_zh: 'oven',
          category: 'machine',
          holds: [{ param: 'temperature', min: 20, max: 30 }],
        },
        { id: 'robot', name: 'robot', name_zh: 'robot', category: 'machine' },
        { id: 'ore', name: 'ore', name_zh: 'ore', category: 'material' },
        { id: 'part', name: 'part', name_zh: 'part', category: 'part' },
      ],
      routes: [
        {
          id: 'r',
          name: 'r', name_zh: 'r',
          produces: [{ item: 'part', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }],
          needs: [{ item: 'oven', qty: q(1) }],
          performedBy: 'robot',
          under: [{ param: 'temperature', min: 20, max: 30 }],
        },
      ],
    };
    assert.ok(!validate(d).errors.some((e) => e.code === 'no_machine'));
  });
});

describe('执行设备的规格窗口写在 needs 里', () => {
  const base = (needs: Description['routes'][number]['needs']): Description => ({
    items: [
      {
        id: 'lathe',
        name: 'lathe', name_zh: 'lathe',
        category: 'machine',
        props: [{ param: 'runout', kind: 'range', min: 0, max: 5, unit: 'µm' }],
      },
      { id: 'ore', name: 'ore', name_zh: 'ore', category: 'material' },
      { id: 'part', name: 'part', name_zh: 'part', category: 'part' },
    ],
    routes: [
      {
        id: 'r',
        name: 'r', name_zh: 'r',
        produces: [{ item: 'part', qty: q(1) }],
        uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }],
        performedBy: 'lathe',
        needs,
      },
    ],
  });

  it('执行设备带规格窗口进 needs —— 不报 redundant_need', () => {
    const d = base([
      {
        item: 'lathe',
        qty: q(1),
        need: [{ param: 'runout', kind: 'range', max: 5, dir: 'atMost' }],
        onRelax: 'functional-kept',
      },
    ]);
    assert.ok(!validate(d).errors.some((e) => e.code === 'redundant_need'));
  });

  it('执行设备裸写进 needs —— 仍报 redundant_need', () => {
    const d = base([{ item: 'lathe', qty: q(1) }]);
    assert.ok(validate(d).errors.some((e) => e.code === 'redundant_need'));
  });

  it('工序执行设备带规格窗口进 needs —— 不报 redundant_need', () => {
    const d: Description = {
      items: [
        {
          id: 'lathe',
          name: 'lathe', name_zh: 'lathe',
          category: 'machine',
          props: [{ param: 'runout', kind: 'range', min: 0, max: 5, unit: 'µm' }],
        },
        { id: 'ore', name: 'ore', name_zh: 'ore', category: 'material' },
        { id: 'part', name: 'part', name_zh: 'part', category: 'part' },
      ],
      routes: [
        {
          id: 'r',
          name: 'r', name_zh: 'r',
          produces: [{ item: 'part', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }],
          steps: [{ note_zh: '车', performedBy: 'lathe' }],
          needs: [
            {
              item: 'lathe',
              qty: q(1),
              need: [{ param: 'runout', kind: 'range', max: 5, dir: 'atMost' }],
              onRelax: 'functional-kept',
            },
          ],
        },
      ],
    };
    assert.ok(!validate(d).errors.some((e) => e.code === 'redundant_need'));
  });
});

describe('接口：iface/ 单继承', () => {
  it('iface/ 条目必须写 interface: true', () => {
    const d: Description = {
      items: [{ id: 'iface/x', name: 'iface/x', name_zh: 'iface/x' }],
      routes: [],
    };
    assert.ok(validate(d).errors.some((e) => e.code === 'interface_flag_mismatch'));
  });

  it('interface: true 的条目必须用 iface/ 前缀', () => {
    const d: Description = {
      items: [{ id: 'std/x', name: 'std/x', name_zh: 'std/x', interface: true }],
      routes: [],
    };
    assert.ok(validate(d).errors.some((e) => e.code === 'interface_flag_mismatch'));
  });

  it('抽象接口不能有 category', () => {
    const d: Description = {
      items: [{ id: 'iface/x', name: 'iface/x', name_zh: 'iface/x', interface: true, category: 'part' }],
      routes: [],
    };
    assert.ok(validate(d).errors.some((e) => e.code === 'abstract_has_concrete_fields'));
  });

  it('extends 只能指向抽象接口', () => {
    const d: Description = {
      items: [
        { id: 'b', name: 'b', name_zh: 'b', category: 'part' },
        { id: 'a', name: 'a', name_zh: 'a', category: 'part', extends: 'b' },
      ],
      routes: [],
    };
    assert.ok(validate(d).errors.some((e) => e.code === 'extends_invalid'));
  });

  it('多个实现且没 select → ambiguous_abstract_part', () => {
    const d: Description = {
      items: [
        { id: 'iface/x', name: 'iface/x', name_zh: 'iface/x', interface: true },
        { id: 'a', name: 'a', name_zh: 'a', category: 'part', extends: 'iface/x' },
        { id: 'b', name: 'b', name_zh: 'b', category: 'part', extends: 'iface/x' },
        {
          id: 'host',
          name: 'host', name_zh: 'host',
          category: 'part',
          composedOf: [{ item: 'iface/x', qty: q(1) }],
        },
      ],
      routes: [],
    };
    assert.ok(validate(d).errors.some((e) => e.code === 'ambiguous_abstract_part'));
  });

  it('select 落到具体实现后按该实现算质量', () => {
    const d: Description = {
      items: [
        { id: 'iface/x', name: 'iface/x', name_zh: 'iface/x', interface: true },
        { id: 'a', name: 'a', name_zh: 'a', category: 'part', mass: q(2), extends: 'iface/x' },
        {
          id: 'host',
          name: 'host', name_zh: 'host',
          category: 'part',
          mass: q(2),
          composedOf: [{ item: 'iface/x', qty: q(1), select: 'a' }],
        },
      ],
      routes: [],
    };
    assert.equal(validate(d).errors.length, 0);
  });

  it('路线不能产出抽象接口', () => {
    const d: Description = {
      items: [
        { id: 'iface/x', name: 'iface/x', name_zh: 'iface/x', interface: true },
        { id: 'ore', name: 'ore', name_zh: 'ore', category: 'material' },
      ],
      routes: [
        {
          id: 'r',
          name: 'r', name_zh: 'r',
          produces: [{ item: 'iface/x', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }],
          needs: [],
        },
      ],
    };
    assert.ok(validate(d).errors.some((e) => e.code === 'route_produces_interface'));
  });
});

describe('单体条目：材料直接加工，没有装配 BOM', () => {
  it('monolithic 机器可以不写 composedOf、不用零件输入', () => {
    const d: Description = {
      items: [
        { id: 'm', name: 'm', name_zh: 'm', category: 'machine', monolithic: true, unit: '台' },
        { id: 'ore', name: 'ore', name_zh: 'ore', category: 'material' },
      ],
      routes: [
        {
          id: 'r',
          name: 'r', name_zh: 'r',
          produces: [{ item: 'm', qty: q(1) }],
          uses: [{ anyOf: [{ item: 'ore', qty: q(1) }] }],
          needs: [],
        },
      ],
    };
    assert.ok(!validate(d).errors.some((e) => e.code === 'machine_without_parts'));
  });

  it('monolithic 零件允许，材料不允许', () => {
    const part: Description = {
      items: [{ id: 'p', name: 'p', name_zh: 'p', category: 'part', monolithic: true, unit: '件' }],
      routes: [],
    };
    assert.ok(!validate(part).errors.some((e) => e.code === 'bad_category'));

    const material: Description = {
      items: [{ id: 'ore', name: 'ore', name_zh: 'ore', category: 'material', monolithic: true }],
      routes: [],
    };
    assert.ok(validate(material).errors.some((e) => e.code === 'bad_category'));
  });

  it('monolithic 不能同时写 composedOf', () => {
    const d: Description = {
      items: [
        { id: 'p', name: 'p', name_zh: 'p', category: 'part', monolithic: true, composedOf: [{ item: 'q', qty: q(1) }] },
        { id: 'q', name: 'q', name_zh: 'q', category: 'part' },
      ],
      routes: [],
    };
    assert.ok(validate(d).errors.some((e) => e.code === 'bad_component'));
  });
});
