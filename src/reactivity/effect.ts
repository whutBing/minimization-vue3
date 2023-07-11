import { extend } from "../shared/index";

// 避免硬编码
let activeEffect;
let shouldTrack = false;
export class ReactiveEffect {
  private _fn: any;
  deps? = [];
  active = true;
  onStop?: () => {};
  constructor(fn, public scheduler?) {
    this._fn = fn;
  }
  run() {
    if (!this.active) {
      return this._fn();
    }

    // 应该收集
    shouldTrack = true;
    activeEffect = this;
    const r = this._fn();

    // 重置
    shouldTrack = false;

    return r;
  }
  stop() {
    if (this.active) {
      cleanup(this);
      if (this.onStop) {
        this.onStop();
      }
    }
    this.active = false;
  }
}

function cleanup(effect) {
  effect.deps.forEach((dep) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}
const targetMap = new Map();
export function track(target, key) {
  // target -> key -> dep
  if (!isTracking()) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  // 反向建立effect => dep的依赖
  trackEffects(dep);
}

export function trackEffects(dep) {
  // 看看 dep 之前有没有添加过，添加过的话 那么就不添加了
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  triggerEffects(dep);
}

export function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function effect(fn, options: any = {}) {
  // fn
  const scheduler = options.scheduler;
  const _effect = new ReactiveEffect(fn, scheduler);

  // _effect.onStop = options.onStop;
  extend(_effect, options);

  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}
