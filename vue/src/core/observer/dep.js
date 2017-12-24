/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
// Dep 就是专门用来存储依赖的
export default class Dep {
  static target: ?Watcher; // 静态变量
  id: number;
  subs: Array<Watcher>;


  constructor () {
    this.id = uid++
    this.subs = []
  }

  // 添加一个观察者对象
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  // 移除一个观察者对象
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  // 依赖收集，当存在 Dep.target 的时候添加观察者对象
  depend () {
    if (Dep.target) {
      // Dep.target Watcher 之后的但钱依赖
      Dep.target.addDep(this)
    }
  }

  // 通知所有订阅者
  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
// 依赖收集完需要将 Dep.target 设为 null，防止后面重复添加依赖
Dep.target = null
const targetStack = []

// 将 watcher 观察者实例设置给 Dep.target，用以依赖收集。
// 同时将该实例存入 target 栈中
export function pushTarget (_target: Watcher) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = _target
}

// 将观察者实例从 target 栈中取出并设置给 Dep.target
export function popTarget () {
  Dep.target = targetStack.pop()
}
