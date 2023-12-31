import { isProxy, isReactive, reactive, readonly } from "../src/reactive";
import { vi } from 'vitest'
describe("reactive", () => {
  it("happy path", () => {
    const original = { foo: 1 };
    const observed = reactive(original);
    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);
    expect(isProxy(observed)).toBe(true);
  });

  test("nested reactives", () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    };
    const observed = reactive(original);
    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
  });
});

describe("readonly", () => {
  it("should make nested values readonly", () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
  });

  // 期待强制更改readonly时，给出警告  eeewee
  it("should call console.warn when set", () => {
    console.warn = vi.fn();
    const user = readonly({
      age: 10,
    });

    user.age = 11;
    expect(console.warn).toHaveBeenCalled();
  });
});
