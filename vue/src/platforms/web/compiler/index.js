/* @flow */

import { baseOptions } from './options'
import { createCompiler } from 'compiler/index'


// 根据不同平台传递不同的 baseOptions 参数来创建不同的编译器
const { compile, compileToFunctions } = createCompiler(baseOptions)

export { compile, compileToFunctions }
