/* @flow */

import { inBrowser } from 'core/util/index'

// check whether current browser encodes a char inside attribute values
// 检查当前浏览器是否对属性值中的内容进行编码
function shouldDecode (content: string, encoded: string): boolean {
  const div = document.createElement('div')
  div.innerHTML = `<div a="${content}"/>`
  return div.innerHTML.indexOf(encoded) > 0
}

// #3663
// IE encodes newlines inside attribute values while other browsers don't
// IE对属性值中的换行符进行编码，而其他浏览器则不对其进行编码
export const shouldDecodeNewlines = inBrowser ? shouldDecode('\n', '&#10;') : false
