import Hljs from 'highlight.js'
const Highlight = {}
Highlight.install = function(Vue, options) {
  Vue.directive('highlight', function(el) {
    var blocks = el.querySelectorAll('pre code')
    // blocks.forEach((block) => { // blocks是个类数组 在ie版本不支持 无法高亮
    //   Hljs.highlightBlock(block)
    // })
    Array.prototype.forEach.call(blocks, (block) => {
      Hljs.highlightBlock(block)
    })
  })
}
export default Highlight
