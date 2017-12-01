// 挂载全局 api

import Vue from './instance/index'
import { initGlobalAPI } from './global-api/index'
import { isServerRendering } from 'core/util/env'

initGlobalAPI(Vue)

Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})

Object.defineProperty(Vue.prototype, '$ssrContext', {
  get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
})

Vue.version = '__VERSION__'

export default Vue

// initGlobalAPI 的作用是在 Vue 构造函数上挂载静态属性和方法，Vue 在经过 initGlobalAPI 之后，会变成这样：
//
//
// Vue.config
// Vue.util = {
//   warn, // 警告处理
//   extend, // 对象属性赋值
//   mergeOptions, // options 策略合并
//   defineReactive // 数据绑定
// }
// Vue.set = set
// Vue.delete = del
// Vue.nextTick = util.nextTick
// Vue.options = {
//     components: {
//         KeepAlive
//     },
//     directives: {},
//     filters: {},
//     _base: Vue
// }
// Vue.use = function(){}
// Vue.mixin = function(){}
// Vue.cid = 0
// Vue.extend = function(){}
// Vue.component = function(){}
// Vue.directive = function(){}
// Vue.filter = function(){}
//
// Vue.prototype.$isServer
// Vue.prototype.$ssrContext
// Vue.version = '__VERSION__'
