/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

export function initGlobalAPI (Vue: GlobalAPI) {
  // Vue.config 对象
  const configDef = {}
  configDef.get = () => config
  // 安全验证：不能覆盖 config 属性
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn, // 警告处理
    extend, // 对象属性赋值
    mergeOptions,
    defineReactive
  }

  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  // _base被用来标识基本构造函数（也就是Vue），以便在多场景下添加组件扩展
  Vue.options._base = Vue

  // Vue.options.components 挂载缓存组件
  extend(Vue.options.components, builtInComponents)

  // 初始化 Vue.use() 方法
  initUse(Vue)
  // 初始化 Vue.mixin() 方法
  initMixin(Vue)
  // 初始化 Vue.extend() 方法
  initExtend(Vue)
  // 初始化
  //  Vue.component() 方法
  //  Vue.directive() 方法
  //  Vue.filter() 方法
  initAssetRegisters(Vue)
}
