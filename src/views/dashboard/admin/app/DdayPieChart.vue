<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import { debounce } from '@/utils'

var builderJson = {
  'all': 10887,
  'stgbuild': {
    'map': 3237,
    'lines': 2164,
    'bar': 7561,
    'line': 7778,
    'pie': 7355,
    'scatter': 2405,
    'candlestick': 1842,
    'radar': 2090,
    'heatmap': 1762,
    'treemap': 1593,
    'graph': 2060,
    'boxplot': 1537,
    'parallel': 1908,
    'gauge': 2107,
    'funnel': 1692,
    'sankey': 1568
  },
  'proddeploy': {
    'geo': 2788,
    'title': 9575,
    'legend': 9400,
    'tooltip': 9466,
    'grid': 9266,
    'markPoint': 3419,
    'markLine': 2984,
    'timeline': 2739,
    'dataZoom': 2744,
    'visualMap': 2466,
    'toolbox': 3034,
    'polar': 1945
  },
  'ie': 9743
}

var daydeployJson = {
  'echarts.min.js': 17365,
  'echarts.simple.min.js': 4079,
  'echarts.common.min.js': 6929,
  'echarts.js': 14890
}

var weekdeployJson = {
  'dark.js': 1594,
  'infographic.js': 925,
  'shine.js': 1608,
  'roma.js': 721,
  'macarons.js': 2179,
  'vintage.js': 1982
}

var waterMarkText = '令狐荣信'

var canvas = document.createElement('canvas')
var ctx = canvas.getContext('2d')
canvas.width = canvas.height = 100
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.globalAlpha = 0.08
ctx.font = '20px Microsoft Yahei'
ctx.translate(50, 50)
ctx.rotate(-Math.PI / 4)
ctx.fillText(waterMarkText, 0, 0)

export default {
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '500px'
    },
    pieData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    pieData: {
      deep: true,
      handler(obj) {
        this.pieData = obj
        this.initChart(obj.data, obj.series)
      }
    }
  },
  mounted() {
    this.initChart()
    this.__resizeHandler = debounce(() => {
      if (this.chart) {
        this.chart.resize()
      }
    }, 100)
    window.addEventListener('resize', this.__resizeHandler)
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    window.removeEventListener('resize', this.__resizeHandler)
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart(data, option) {
      this.chart = echarts.init(this.$el, 'macarons')

      this.chart.setOption({
        backgroundColor: {
          type: 'pattern',
          image: canvas,
          repeat: 'repeat'
        },
        tooltip: {},
        title: [{
          text: 'Stg|Prod发布次数',
          subtext: '总计 ' + builderJson.all,
          left: '25%',
          textAlign: 'center'
        }, {
          text: 'App上线数日Top',
          subtext: '总计 ' + Object.keys(daydeployJson).reduce(function(all, key) {
            return all + daydeployJson[key]
          }, 0),
          left: '75%',
          textAlign: 'center'
        }, {
          text: 'App上线数周Top',
          subtext: '总计 ' + Object.keys(weekdeployJson).reduce(function(all, key) {
            return all + weekdeployJson[key]
          }, 0),
          left: '75%',
          top: '50%',
          textAlign: 'center'
        }],
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        grid: [{
          top: 50,
          width: '50%',
          bottom: '45%',
          left: 10,
          containLabel: true
        }, {
          top: '55%',
          width: '50%',
          bottom: 0,
          left: 10,
          containLabel: true
        }],
        xAxis: [{
          type: 'value',
          max: builderJson.all,
          splitLine: {
            show: false
          }
        }, {
          type: 'value',
          max: builderJson.all,
          gridIndex: 1,
          splitLine: {
            show: false
          }
        }],
        yAxis: [{
          type: 'category',
          data: Object.keys(builderJson.stgbuild),
          axisLabel: {
            interval: 0,
            rotate: 30
          },
          splitLine: {
            show: false
          }
        }, {
          gridIndex: 1,
          type: 'category',
          data: Object.keys(builderJson.proddeploy),
          axisLabel: {
            interval: 0,
            rotate: 30
          },
          splitLine: {
            show: false
          }
        }],
        series: [{
          type: 'bar',
          stack: 'chart',
          z: 3,
          label: {
            normal: {
              position: 'right',
              show: true
            }
          },
          data: Object.keys(builderJson.stgbuild).map(function(key) {
            return builderJson.stgbuild[key]
          })
        }, {
          type: 'bar',
          stack: 'chart',
          silent: true,
          itemStyle: {
            normal: {
              color: '#eee'
            }
          },
          data: Object.keys(builderJson.stgbuild).map(function(key) {
            return builderJson.all - builderJson.stgbuild[key]
          })
        }, {
          type: 'bar',
          stack: 'component',
          xAxisIndex: 1,
          yAxisIndex: 1,
          z: 3,
          label: {
            normal: {
              position: 'right',
              show: true
            }
          },
          data: Object.keys(builderJson.proddeploy).map(function(key) {
            return builderJson.proddeploy[key]
          })
        }, {
          type: 'bar',
          stack: 'component',
          silent: true,
          xAxisIndex: 1,
          yAxisIndex: 1,
          itemStyle: {
            normal: {
              color: '#eee'
            }
          },
          data: Object.keys(builderJson.proddeploy).map(function(key) {
            return builderJson.all - builderJson.proddeploy[key]
          })
        }, {
          type: 'pie',
          radius: [0, '30%'],
          center: ['75%', '25%'],
          data: Object.keys(daydeployJson).map(function(key) {
            return {
              name: key.replace('.js', ''),
              value: daydeployJson[key]
            }
          })
        }, {
          type: 'pie',
          radius: [0, '30%'],
          center: ['75%', '75%'],
          data: Object.keys(weekdeployJson).map(function(key) {
            return {
              name: key.replace('.js', ''),
              value: weekdeployJson[key]
            }
          })
        }]
      })
    }
  }
}
</script>
