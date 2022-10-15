const deepMix = require('@antv/util/lib/deep-mix')
const each = require('@antv/util/lib/each')
const createDOM = require('@antv/util/lib/dom/create-dom')

class AddItemPanel {
  constructor(cfgs) {
    this._cfgs = deepMix(this.getDefaultCfg(), cfgs)
  }
  getDefaultCfg() {
    return { container: null }
  }

  get(key) {
    return this._cfgs[key]
  }
  set(key, val) {
    this._cfgs[key] = val
  }

  initPlugin(graph) {
    const parentNode = this.get('container')
    const ghost = createDOM('<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"' + ' style="opacity:0"/>')
    const children = parentNode.querySelectorAll('div > .el-collapse-item > .el-collapse-item__wrap > .el-collapse-item__content > img[data-item]')
    each(children, (child, i) => {
      // eslint-disable-next-line no-new-func
      const addModel = (new Function('return ' + child.getAttribute('data-item')))()
      child.addEventListener('dragstart', e => {
        e.dataTransfer.setDragImage(ghost, 0, 0)
        graph.set('onDragAddNode', true)
        graph.set('addModel', addModel)
      })
      child.addEventListener('dragend', e => {
        graph.emit('canvas:mouseup', e)
        graph.set('onDragAddNode', false)
        graph.set('addModel', null)
      })
    })
  }

  destroy() {
    this.get('canvas').destroy()
    const container = this.get('container')
    container.parentNode.removeChild(container)
  }
}

export default AddItemPanel
