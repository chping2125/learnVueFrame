/* @flow */

// 错误处理
// 如果有全局配置 errorHandler，优先自定义错误处理
// 否则按照非生产环境利用自身的 warn 错误及堆栈，生产直接 console.error()

import config from '../config'
import { warn } from './debug'
import { inBrowser } from './env'

export function handleError (err: Error, vm: any, info: string) {
  if (config.errorHandler) {
    config.errorHandler.call(null, err, vm, info)
  } else {
    if (process.env.NODE_ENV !== 'production') {
      warn(`Error in ${info}: "${err.toString()}"`, vm)
    }
    /* istanbul ignore else */
    if (inBrowser && typeof console !== 'undefined') {
      console.error(err)
    } else {
      throw err
    }
  }
}
