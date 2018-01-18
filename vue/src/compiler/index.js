/* @flow */

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  // 1. 将 HTML 转为 AST
  //
  // 解析器（parser）的原理是一小段一小段的去截取字符串，然后维护一个 stack 用来保存DOM深度，
  // 每截取到一段标签的开始就 push 到 stack 中，当所有字符串都截取完之后也就解析出了一个完整的 AST。
  const ast = parse(template.trim(), options)

  // 2. 将AST树进行优化
  //   优化的目标：生成模板 AST 树，检测不需要进行 DOM 改变的静态子树。
  //   一旦检测到这些静态树，我们就能做以下这些事情：
  //    1.把它们变成常数，这样我们就再也不需要每次重新渲染时创建新的节点了。
  //    2.在 patch 的过程中直接跳过
  //
  // 优化器（optimizer）的原理是用递归的方式将所有节点打标记，表示是否是一个 静态节点，
  // 然后再次递归一遍把 静态根节点 也标记出来。
  optimize(ast, options)

  // 3. 根据 AST 树生成所需的 code（内部包含 render 与 staticRenderFns ）
  // 
  // 代码生成器（code generator）的原理也是通过递归去拼一个函数执行代码的字符串，
  // 递归的过程根据不同的节点类型调用不同的生成方法，
  // 如果发现是一颗元素节点就拼一个 _c(tagName, data, children) 的函数调用字符串，
  // 然后 data 和 children 也是使用 AST 中的属性去拼字符串。
  // 如果 children 中还有 children 则递归去拼。
  // 最后拼出一个完整的 render 函数代码。
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
