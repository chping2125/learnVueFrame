/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

// 重写 Array 的 7 个工具方法

import { def } from '../util/index'

// Array 原型对象
const arrayProto = Array.prototype
// 基于 Array 原型对象创建一个新对象，在当前文件初始化时，在下面的代码中就改变了他，因此对外抛出时
// arrayMethods 中的 Array 原型对象上的 7 个方法已经被重写
export const arrayMethods = Object.create(arrayProto)

/**
 * Intercept mutating methods and emit events
 */
;[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
.forEach(function (method) {
  // cache original method
  // 缓存原 Array 原型上的 7 个方法
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    // 执行 Array 原本原型上的对应方法，得到结果
    const result = original.apply(this, args)
    // 获取当前数组上的 __ob__ （就是已观察的数组本身 Observer），该属性时再数组观察时 ./index.js Observe 中挂载
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 如果是新插入的数组元素，则递归观察数组每一项
    if (inserted) ob.observeArray(inserted)
    // notify change
    // 触发订阅，返回数组结果
    ob.dep.notify()
    return result
  })
})
