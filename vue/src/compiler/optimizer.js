/* @flow */

import { makeMap, isBuiltInTag, cached, no } from 'shared/util'

// 标记是否为静态属性
let isStaticKey
// 标记是否是平台保留的标签
let isPlatformReservedTag

const genStaticKeysCached = cached(genStaticKeys)

/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */

 // 将AST树进行优化
 //   优化的目标：生成模板 AST 树，检测不需要进行 DOM 改变的静态子树。
 //   一旦检测到这些静态树，我们就能做以下这些事情：
 //    1.把它们变成常数，这样我们就再也不需要每次重新渲染时创建新的节点了。
 //    2.在 patch 的过程中直接跳过


export function optimize (root: ?ASTElement, options: CompilerOptions) {
  if (!root) return
  // 标记是否为静态属性
  isStaticKey = genStaticKeysCached(options.staticKeys || '')
  // 标记是否是平台保留的标签
  isPlatformReservedTag = options.isReservedTag || no
  // first pass: mark all non-static nodes.
  // 处理所有非静态节点
  markStatic(root)
  // second pass: mark static roots.
  // 处理静态 roots
  markStaticRoots(root, false)
}

// 静态属性的 map 表
function genStaticKeys (keys: string): Function {
  return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs' +
    (keys ? ',' + keys : '')
  )
}

function markStatic (node: ASTNode) {
  node.static = isStatic(node)
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
    //
    // 不能设置组件的 slot 成为静态的，避免下面这两种情况：
    //  1.组件不能改变 slot 的元素
    //  2.静态的 slot 内容动态加载会失败
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
      return
    }

    // 判断元素节点所有的子节点是不是静态
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      markStatic(child)
      if (!child.static) {
        node.static = false
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block
        markStatic(block)
        if (!block.static) {
          node.static = false
        }
      }
    }
  }
}

function markStaticRoots (node: ASTNode, isInFor: boolean) {
  if (node.type === 1) {
    if (node.static || node.once) {
      node.staticInFor = isInFor
    }
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
    //
    // 一个 static root 节点必须有子节点否则它可能只是一个 static 的文本节点，而且它不能只有文本子节点
    if (node.static && node.children.length && !(
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
      node.staticRoot = true
      return
    } else {
      node.staticRoot = false
    }

    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for)
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        markStaticRoots(node.ifConditions[i].block, isInFor)
      }
    }
  }
}

// 判断是不是静态元素
function isStatic (node: ASTNode): boolean {
  if (node.type === 2) { // expression // 带变量的动态文本节点
    return false
  }
  if (node.type === 3) { // text // 不带变量的纯文本节点
    return true
  }
  // node.type === 1 是元素，这个判断的东西就比较麻烦了
  // 1. 如果 node.pre 为 true 直接认为当前节点是静态节点
  // 2. node.hasBindings 不能为 true，node.hasBindings 属性是在解析器转换 AST 时设置的，如果当前节点的 attrs 中，有 v-、@、:开头的 attr，就会把 node.hasBindings 设置为 true
  // 3. 元素节点不能有 if 和 for属性
  // 4. 元素节点不能是 slot 和 component
  // 5. 元素节点不能是自定义组件
  // 6. 元素节点的父级节点不能是带 v-for 的 template
  // 7. 元素节点上不能出现额外的属性（type tag attrsList attrsMap plain parent children attrs staticClass staticStyle）

  return !!(node.pre || (
    !node.hasBindings && // no dynamic bindings
    !node.if && !node.for && // not v-if or v-for or v-else
    !isBuiltInTag(node.tag) && // not a built-in
    isPlatformReservedTag(node.tag) && // not a component
    !isDirectChildOfTemplateFor(node) &&
    Object.keys(node).every(isStaticKey)
  ))
}

function isDirectChildOfTemplateFor (node: ASTElement): boolean {
  while (node.parent) {
    node = node.parent
    if (node.tag !== 'template') {
      return false
    }
    if (node.for) {
      return true
    }
  }
  return false
}
