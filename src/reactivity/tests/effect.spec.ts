import { effect } from "../effect";
import { reactive } from "../reactive";

//是一个测试套件，它包含了多个测试用例,也称为测试块
describe("effect", () => {
  // 是一个具体的测试用例
  it("happy path", () => {
    const user = reactive({
      age: 10,
    });

    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(11);

    // update
    user.age++;
    expect(nextAge).toBe(12);
  });

  it("should return runner when call effect", () => {
    // 当调用 runner 的时候可以重新执行 effect.run
    // runner 的返回值就是用户给的 fn 的返回值
    let foo = 0;
    const runner = effect(() => {
      foo++;
      return foo;
    });

    expect(foo).toBe(1);
    runner();
    expect(foo).toBe(2);
    expect(runner()).toBe(3);
  });

    it("scheduler", () => {
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    // should be called on first trigger
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    // // should not run yet
    expect(dummy).toBe(1);
    // // manually run
    run();
    // // should have run
    expect(dummy).toBe(2);
  });
});
