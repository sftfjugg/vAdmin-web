/* eslint-disable no-unused-vars */
<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>

import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import { debounce } from '@/utils'

// eslint-disable-next-line no-unused-vars
const animationDuration = 6000

/*
var dataAxis = ['点', '击', '柱', '子', '或', '者', '两', '指', '在', '触', '屏', '上', '滑', '动', '能', '够', '自', '动', '缩', '放']
var data = [220, 182, 191, 234, 290, 330, 310, 123, 442, 321, 90, 149, 210, 122, 133, 334, 198, 123, 125, 220]
var yMax = 500
var dataShadow = []

for (var i = 0; i < data.length; i++) {
  dataShadow.push(yMax)
}
*/
var valx = []
var valy = []
var dataAxis = []
var data = []
var yMax = 10
var year = ''
var dataShadow = []

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
      default: '300px'
    },
    data: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      getData: []
    }
  },
  watch: {
    data(val) {
      if (val) {
        // this.fGetData(val)
        this.getData = val
        this.drawChart(this.getData)
      }
    }
  },
  mounted() {
    // this.drawChart()
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
    fGetData(val) {
      // debugger
      // console.log(val)
      for (var i = 0; i < val.length; i++) {
        valx[i] = val[i].Dtime
        valy[i] = val[i].Dcount
      }
      dataAxis = valx
      data = valy

      // debugger
      // console.log(dataAxis)
      // console.log(data)

      for (var j = 0; j < data.length; j++) {
        dataShadow.push(yMax)
      }
      // debugger
      // console.log(valx)
      // console.log(valy)
    },
    drawChart(getData) {
      if (!getData) return
      // debugger
      // console.log(val)
      var val = getData
      var years, yeare
      for (var i = 0; i < val.length; i++) {
        valx[i] = val[i].Dtime.substring(6)
        if (i === 0) { years = val[i].Dtime.substring(0, 4) }
        if (i === (val.length) - 1) { yeare = val[i].Dtime.substring(0, 4) }
        if (i === (val.length) - 1 && years === yeare) { year = years }
        valy[i] = val[i].Dcount
      }
      dataAxis = valx
      data = valy

      debugger
      console.log(dataAxis)
      console.log(data)

      for (var j = 0; j < data.length; j++) {
        dataShadow.push(yMax)
      }

      this.chart = echarts.init(this.$el, 'macarons')
      this.chart.setOption({
        title: {
          text: year + '年' + '-日发布次数',
          subtext: 'Feature: Gradient Color, Shadow, Click Zoom'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          data: dataAxis,
          axisLabel: {
            inside: true,
            textStyle: {
              color: '#fff'
            }
          },
          axisTick: {
            show: false
          },
          axisLine: {
            show: false
          },
          z: 10
        },
        yAxis: {
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            textStyle: {
              color: '#999'
            }
          }
        },
        dataZoom: [
          {
            type: 'inside'
          }
        ],
        series: [
          { // For shadow
            type: 'bar',
            itemStyle: {
              color: 'rgba(0,0,0,0.05)'
            },
            barGap: '-100%',
            barCategoryGap: '40%',
            data: dataShadow,
            animation: false
          },
          {
            type: 'bar',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(
                0, 0, 0, 1,
                [
                  { offset: 0, color: '#83bff6' },
                  { offset: 0.5, color: '#188df0' },
                  { offset: 1, color: '#188df0' }
                ]
              )
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(
                  0, 0, 0, 1,
                  [
                    { offset: 0, color: '#2378f7' },
                    { offset: 0.7, color: '#2378f7' },
                    { offset: 1, color: '#83bff6' }
                  ]
                )
              }
            },
            data: data
          }
        ]
      }) // end setOption
      var zoomSize = 6
      this.chart.on('click', function(params) {
        console.log(params.name)
        console.log(dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)])
        this.chart.dispatchAction({
          type: 'dataZoom',
          startValue: dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)],
          endValue: dataAxis[Math.min(params.dataIndex + zoomSize / 2, data.length - 1)]
        })
      })
      // 处理点击事件并且跳转到相应的百度搜索页面
      // this.chart.on('click',function(params) {
      //   window.open('https://www.baidu.com/s?wd='+encodeURIComponent(params.name))
      // })
    } // end initChart
  } // end methods

} // end export

</script>
