// 构造函数、初始化实例，挂载实例方法

import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  // 安全处理
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 初始化
  this._init(options)
  // 执行 this._init() 方法后
  // 在 Vue.prototype._init 中添加的属性  ****************************************
  // vm._uid = uid++
  // vm._isVue = true
  // vm.$options = {
  //     components,
  //     directives,
  //     filters,
  //     _base,
  //     el,
  //     data: mergedInstanceDataFn()
  //     ...
  // }
  // vm._renderProxy = vm
  // vm._self = vm
  //
  // // 在 initLifecycle 中添加的属性 ********************************************
  // vm.$parent = parent
  // vm.$root = parent ? parent.$root : vm
  //
  // vm.$children = []
  // vm.$refs = {}
  //
  // vm._watcher = null
  // vm._inactive = null
  // vm._directInactive = false
  // vm._isMounted = false
  // vm._isDestroyed = false
  // vm._isBeingDestroyed = false
  //
  // // 在 initEvents     中添加的属性  ******************************************
  // vm._events = {}
  // vm._hasHookEvent = false
  //
  // // 在 initRender     中添加的属性 *******************************************
  // vm._vnode = null // the root of the child tree
  // vm._staticTrees = null
  // vm.$slots
  // vm.$scopedSlots
  // vm._c
  // vm.$createElement
  //
  // // 在 initState 中添加的属性 ************************************************
  // vm._watchers = []
  // vm._props
  //
  // // 在 initProvide 中添加的属性 ************************************************
  // vm._provided
  //

}

// 一系列初始化方法，挂载各种方法
initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)


// ++++++++++++++++initMixin(Vue)    src/core/instance/init.js *************************
// Vue.prototype._init = function (options?: Object) {}
//
// ++++++++++++++++stateMixin(Vue)    src/core/instance/state.js *************************
// Vue.prototype.$data
// Vue.prototype.$props
// Vue.prototype.$set = set
// Vue.prototype.$delete = del
// Vue.prototype.$watch = function(){}
//
// ++++++++++++++++eventsMixin(Vue)    src/core/instance/events.js *************************
// Vue.prototype.$on = function (event: string, fn: Function): Component {}
// Vue.prototype.$once = function (event: string, fn: Function): Component {}
// Vue.prototype.$off = function (event?: string, fn?: Function): Component {}
// Vue.prototype.$emit = function (event: string): Component {}
//
// ++++++++++++++++lifecycleMixin(Vue)    src/core/instance/lifecycle.js *************************
// Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {}
// Vue.prototype.$forceUpdate = function () {}
// Vue.prototype.$destroy = function () {}
//
// // ++++++++++++++++renderMixin(Vue)    src/core/instance/render.js *************************
// Vue.prototype.$nextTick = function (fn: Function) {}
// Vue.prototype._render = function (): VNode {}
// Vue.prototype._o = markOnce
// Vue.prototype._n = toNumber
// Vue.prototype._s = toString
// Vue.prototype._l = renderList
// Vue.prototype._t = renderSlot
// Vue.prototype._q = looseEqual
// Vue.prototype._i = looseIndexOf
// Vue.prototype._m = renderStatic
// Vue.prototype._f = resolveFilter
// Vue.prototype._k = checkKeyCodes
// Vue.prototype._b = bindObjectProps
// Vue.prototype._v = createTextVNode
// Vue.prototype._e = createEmptyVNode
// Vue.prototype._u = resolveScopedSlots
// Vue.prototype._g = bindObjectListeners


export default Vue
