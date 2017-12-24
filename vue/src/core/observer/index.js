/* @flow */

import Dep from './dep'
import { arrayMethods } from './array'
import {
  def,
  warn,
  hasOwn,
  hasProto,
  isObject,
  isPlainObject,
  isValidArrayIndex,
  isServerRendering
} from '../util/index'

// Array 原型链上的方法 key 组成的数组
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However when passing down props,
 * we don't want to force conversion because the value may be a nested value
 * under a frozen data structure. Converting it would defeat the optimization.
 */
export const observerState = {
  shouldConvert: true
}

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 */
// 观察者，对数组以及其每一项值和对象进行观察，重写其get、set 方法
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that has this object as root $data

  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    def(value, '__ob__', this) // 不只是存储当前观察值，另外作为已经观察的一个标志， 在 observer 函数中判断使用
    if (Array.isArray(value)) { // 如果是数组,则特殊处理
      const augment = hasProto
        ? protoAugment
        : copyAugment
      // 数组有 __proto__ 属性时，将该数组实例的 __proto__ 指向 arrayMethods （已经重写 array 方法）
      // 反之，则为每一个 Array 实例添加 Array 原型方法，这个判断几乎没有可能成立
      augment(value, arrayMethods, arrayKeys)
      // 对 array 中的每一项值，递归观察
      this.observeArray(value)
    } else {
      // 不是数组时，对 obj 的每一项进行观察
      this.walk(value)
    }
  }

  /**
   * Walk through each property and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  // 遍历每个属性并将其转换为 getter / setter
  // 只有在值类型为Object时才应调用此方法
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }

  /**
   * Observe a list of Array items.
   */
  // 遍历数组每一项进行观察
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src: Object, keys: any) {
  /* eslint-disable no-proto */
  target.__proto__ = src
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment (target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
// 判断 value 是否已经被观察，如果没有则观察之
export function observe (value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value)) {
    return
  }
  let ob: Observer | void
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) { // 已经观察过，直接返回
    ob = value.__ob__
  } else if (
    observerState.shouldConvert &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    // 没有观察过，则观察之
    ob = new Observer(value)
  }
  // 如果是根 data，则 vmCount ++ ，其他都为 0
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}

/**
 * Define a reactive property on an Object.
 */
// 具体对每一个属性重写 setter 、 getter
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep()

  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set

  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () { // 依赖收集
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend() // 依赖收集
        if (childOb) { // 子对象进行依赖收集
          childOb.dep.depend()
        }
        if (Array.isArray(value)) { // 如果设置为数组，对数组每一项进行依赖收集
          dependArray(value)
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      // 防止 value 不改变时，触发订阅
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // 设置值
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      // 如果值已经改变，观察之
      childOb = !shallow && observe(newVal)
      // 触发订阅
      dep.notify()
    }
  })
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
export function set (target: Array<any> | Object, key: any, val: any): any {
  // 如果是数组的话，利用 splice 触发数据绑定，因为 Vue 重写了这 7 数组方法
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  // 是对象上的属性，直接赋值触发数据绑定
  if (hasOwn(target, key)) {
    target[key] = val
    return val
  }

  // 对象和数组的情况上面都处理了，下面的情况可能是给对象添加新属性（不是很确定）

  // 获得 target 的 Oberver 实例
  const ob = (target: any).__ob__
  // _isVue 一个防止vm实例自身被观察的标志位（在init中初始化的） ，_isVue为true则代表vm实例，也就是this
  // vmCount判断是否为根节点，存在则代表是data的根节点，
  // Vue 不允许在已经创建的实例上动态添加新的根级响应式属性(root-level reactive property)
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  if (!ob) {
    target[key] = val
    return val
  }
  // 重写新属性的 setter 、 getter
  defineReactive(ob.value, key, val)
  // 触发订阅
  ob.dep.notify()
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
export function del (target: Array<any> | Object, key: any) {
  // 如果是数组的话，利用 splice 触发数据绑定，因为 Vue 重写了这 7 数组方法
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return
  }
  const ob = (target: any).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    )
    return
  }
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key]
  if (!ob) {
    return
  }
  // 触发订阅
  ob.dep.notify()
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value: Array<any>) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    // 依赖收集
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      // 当数组成员还是数组的时候地柜执行该方法继续深层依赖收集，直到是对象为止
      dependArray(e)
    }
  }
}
