import Vue from 'vue'

// 引入js-cookie
import Cookies from 'js-cookie'

// npm install css-loader --save //

// 引入 a modern alternative to CSS resets
import 'normalize.css/normalize.css'

// 引入element-ui
import Element from 'element-ui'
import './styles/element-variables.scss'

// global css
import '@/styles/index.scss'
import '@/styles/admin.scss'

// add for me
import util from './utils/lib/util.js'

// 引入iconfont.js(使用iconfont彩色图标 https://www.iconfont.cn/)
import '@/assets/iconfont/iconfont.js'

// 引入echarts
import echarts from 'echarts'

import App from './App'
import store from './store'
import router from './router'
import permission from './directive/permission'

import { getDicts } from '@/api/system/dict/data'
import { getConfigKey } from '@/api/system/config'
import { parseTime, resetForm, addDateRange, selectDictLabel, download } from '@/utils/costum'

import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log

import Viser from 'viser-vue'
Vue.use(Viser)

// highlight.js
import 'highlight.js/styles/arduino-light.css'
import Highlight from '@/utils/highlight.js'
Vue.use(Highlight)

// 代码编辑器
import VueCodeMirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
Vue.use(VueCodeMirror)

// 富文本编辑器
import VueEditor from 'vue2-editor'
Vue.use(VueEditor)

import iconPicker from 'vue-fontawesome-elementui-icon-picker'
//import iconPicker from 'e-icon-picker'
//import "e-icon-picker/dist/symbol.js"; //基本彩色图标库
//import 'e-icon-picker/dist/index.css'; // 基本样式，包含基本图标
//import 'font-awesome/css/font-awesome.min.css'; //font-awesome 图标库
//import 'element-ui/lib/theme-chalk/icon.css'; //element-ui 图标库
Vue.use(iconPicker)

import * as filters from './filters' // global filters

import Pagination from '@/components/Pagination'

// 全局方法挂载
Vue.prototype.getDicts = getDicts
Vue.prototype.getConfigKey = getConfigKey
Vue.prototype.parseTime = parseTime
Vue.prototype.resetForm = resetForm
Vue.prototype.addDateRange = addDateRange
Vue.prototype.selectDictLabel = selectDictLabel
Vue.prototype.download = download
Vue.prototype.$echarts = echarts

// 全局组件挂载
Vue.component('Pagination', Pagination)

Vue.prototype.msgSuccess = function(msg) {
  this.$message({ showClose: true, message: msg, type: 'success' })
}

Vue.prototype.msgError = function(msg) {
  this.$message({ showClose: true, message: msg, type: 'error' })
}

Vue.prototype.msgInfo = function(msg) {
  this.$message.info(msg)
}

Vue.use(permission)

Vue.use(Element, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
})

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.use(echarts)

Vue.config.productionTip = false

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
	  document.title = to.meta.title
  }
  next()
})

new Vue({
  el: '#app',
  router,
  store,
  methods: util,
  render: h => h(App)
})
/*
new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
*/
