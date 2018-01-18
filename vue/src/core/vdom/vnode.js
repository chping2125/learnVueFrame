/* @flow */

export default class VNode {
  // 节点标签名
  tag: string | void;
  // 当前节点对应的对象，包含了具体的一些数据信息，是一个 VNodeData 类型，可以参考VNodeData类型中的数据信息
  data: VNodeData | void;
  // 当前节点的子节点，是一个数组
  children: ?Array<VNode>;
  // 当前节点的文本
  text: string | void;
  // 当前虚拟节点对应的真实dom节点
  elm: Node | void;
  // 前节点的名字空间
  ns: string | void;
  // 当前节点的编译作用域
  context: Component | void; // rendered in this component's scope
  // 函数化组件作用域
  functionalContext: Component | void; // only for functional component root nodes
  // 节点的 key 属性，被当作节点的标志，用以优化
  key: string | number | void;
  // 组件的option选项
  componentOptions: VNodeComponentOptions | void;
  // 当前节点对应的组件的实例
  componentInstance: Component | void; // component instance
  // 当前节点的父节点
  parent: VNode | void; // component placeholder node
  // 简而言之就是是否为原生 HTML 或只是普通文本，innerHTML 的时候为 true，textContent 的时候为 false
  raw: boolean; // contains raw HTML? (server only)
  // 是否为静态节点
  isStatic: boolean; // hoisted static node
  // 是否作为根节点插入
  isRootInsert: boolean; // necessary for enter transition check
  // 是否为注释节点
  isComment: boolean; // empty comment placeholder?
  // 是否为克隆
  isCloned: boolean; // is a cloned node?
  // 是否有v-once指令
  isOnce: boolean; // is a v-once node?
  // 异步组件函数
  asyncFactory: Function | void; // async component factory function
  asyncMeta: Object | void;
  isAsyncPlaceholder: boolean;
  // 服务端渲染编译作用域
  ssrContext: Object | void;

  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.ns = undefined
    this.context = context
    this.functionalContext = undefined
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.componentInstance = undefined
    this.parent = undefined
    this.raw = false
    this.isStatic = false
    this.isRootInsert = true
    this.isComment = false
    this.isCloned = false
    this.isOnce = false
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child (): Component | void {
    return this.componentInstance
  }
}

// 创建空 VNode
export const createEmptyVNode = (text: string = '') => {
  const node = new VNode()
  node.text = text
  node.isComment = true
  return node
}

// 创建文本节点
export function createTextVNode (val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
//
// 克隆一个VNode节点
export function cloneVNode (vnode: VNode): VNode {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children,
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  )
  cloned.ns = vnode.ns
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isComment = vnode.isComment
  cloned.isCloned = true
  return cloned
}

// 对一个节点数组依次进行 clone
export function cloneVNodes (vnodes: Array<VNode>): Array<VNode> {
  const len = vnodes.length
  const res = new Array(len)
  for (let i = 0; i < len; i++) {
    res[i] = cloneVNode(vnodes[i])
  }
  return res
}
