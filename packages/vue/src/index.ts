// mini-vue 出口
export * from "@minimization-vue3/runtime-dom";
import { baseCompile } from "@minimization-vue3/compiler-core";
import * as runtimeDom from "@minimization-vue3/runtime-dom";
import { registerRuntimeCompiler } from "@minimization-vue3/runtime-dom";

function compileToFunction(template) {
  const { code } = baseCompile(template);
  const render = new Function("Vue", code)(runtimeDom);
  return render;
}

registerRuntimeCompiler(compileToFunction);
