/* @flow */

import {
  warn,
  nextTick,
  toNumber,
  toString,
  looseEqual,
  emptyObject,
  handleError,
  looseIndexOf,
  defineReactive
} from '../util/index'

import VNode, {
  cloneVNodes,
  createTextVNode,
  createEmptyVNode
} from '../vdom/vnode'

import { isUpdatingChildComponent } from './lifecycle'

import { createElement } from '../vdom/create-element'
import { renderList } from './render-helpers/render-list'
import { renderSlot } from './render-helpers/render-slot'
import { resolveFilter } from './render-helpers/resolve-filter'
import { checkKeyCodes } from './render-helpers/check-keycodes'
import { bindObjectProps } from './render-helpers/bind-object-props'
import { renderStatic, markOnce } from './render-helpers/render-static'
import { bindObjectListeners } from './render-helpers/bind-object-listeners'
import { resolveSlots, resolveScopedSlots } from './render-helpers/resolve-slots'

// 初始化 Render
export function initRender (vm: Component) {
  vm._vnode = null // the root of the child tree
  vm._staticTrees = null
  const parentVnode = vm.$vnode = vm.$options._parentVnode // the placeholder node in parent tree
  const renderContext = parentVnode && parentVnode.context
  vm.$slots = resolveSlots(vm.$options._renderChildren, renderContext)
  vm.$scopedSlots = emptyObject
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)

  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  const parentData = parentVnode && parentVnode.data
  /* istanbul ignore else */
  if (process.env.NODE_ENV !== 'production') {
    defineReactive(vm, '$attrs', parentData && parentData.attrs, () => {
      !isUpdatingChildComponent && warn(`$attrs is readonly.`, vm)
    }, true)
    defineReactive(vm, '$listeners', vm.$options._parentListeners, () => {
      !isUpdatingChildComponent && warn(`$listeners is readonly.`, vm)
    }, true)
  } else {
    defineReactive(vm, '$attrs', parentData && parentData.attrs, null, true)
    defineReactive(vm, '$listeners', vm.$options._parentListeners, null, true)
  }
}

// 挂载 $nextTick 和 _render 方法
export function renderMixin (Vue: Class<Component>) {
  Vue.prototype.$nextTick = function (fn: Function) {
    return nextTick(fn, this)
  }

  // _render渲染函数，返回一个VNode节点
  Vue.prototype._render = function (): VNode {
    const vm: Component = this
    // 从 vm.$options 对象中取出来的两个方法，一个对象
    // render, staticRenderFns 两个方法
    const {
      render,
      staticRenderFns, // 在 entry-runtime-with-complier 中 $mount 中存到 $options 上的
      _parentVnode
    } = vm.$options

    if (vm._isMounted) { // 貌似是为了已挂载组件的更新，先标记一下
      // clone slot nodes on re-renders
      for (const key in vm.$slots) {
        vm.$slots[key] = cloneVNodes(vm.$slots[key])
      }
    }

    // 推测为查看父组件有没有 slot 注入，先标记一下
    vm.$scopedSlots = (_parentVnode && _parentVnode.data.scopedSlots) || emptyObject

    // 用来存放static节点，已经被渲染的并且不存在v-for中的static节点不需要重新渲染，只需要进行浅拷贝
    if (staticRenderFns && !vm._staticTrees) {
      vm._staticTrees = []
    }
    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode
    // render self
    let vnode
    try {
      // render 函数是从 template 或 el 编译而来的，返回一个虚拟 DOM 对象（VNode）
      // _renderProxy 在 ./init.js 中挂载到 vm 上的，就是 当前的 vm
      // $createElement 在 当前文件的 initRender 方法中挂载到 vm 上
      vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
      handleError(e, vm, `render function`)
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production') {
        vnode = vm.$options.renderError
          ? vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
          : vm._vnode
      } else {
        vnode = vm._vnode
      }
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        )
      }
      vnode = createEmptyVNode()
    }
    // set parent
    vnode.parent = _parentVnode
    return vnode
  }

  // internal render helpers.
  // these are exposed on the instance prototype to reduce generated render
  // code size.
  //
  //
  // 内部处理render的函数
  // 这些函数会暴露在Vue原型上以减小渲染函数大小
  //
  // 处理 v-onck
  Vue.prototype._o = markOnce
  // 将字符串转化为数字，如果转换失败会返回原字符串
  Vue.prototype._n = toNumber
  // 将 val 转化成字符串
  Vue.prototype._s = toString
  // 处理 v-for 列表渲染
  Vue.prototype._l = renderList
  // 处理 slot
  Vue.prototype._t = renderSlot
  // 测两个变量是否相等
  Vue.prototype._q = looseEqual
  // 检测 arr 数组中是否包含与 val 变量相等的项
  Vue.prototype._i = looseIndexOf
  // 处理 static 树的渲染
  Vue.prototype._m = renderStatic
  // 处理 filters
  Vue.prototype._f = resolveFilter
  // 从 config 配置中检查 eventKeyCode 是否存在
  Vue.prototype._k = checkKeyCodes
  // 合并 v-bind 指令到 VNode 中
  Vue.prototype._b = bindObjectProps
  // 创建一个文本节点
  Vue.prototype._v = createTextVNode
  // 创建一个空 VNode 节点
  Vue.prototype._e = createEmptyVNode
  // 处理ScopedSlots
  Vue.prototype._u = resolveScopedSlots
  Vue.prototype._g = bindObjectListeners
}
