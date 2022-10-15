/**
 *  echarts tooltip 自动轮播
 *  @author liuwei
 *  @param myChart  //初始化echarts的实例
 *  @param option   //指定图表的配置项和数据
 *  @param num      //类目数量(原因：循环时达到最大值后，使其从头开始循环)
 *  @param time     //轮播间隔时长
 */
export function autoHover(myChart, option, num, time) {
  var defaultData = { // 设置默认值
    time: 2000,
    num: 100
  }
  if (!time) {
    time = defaultData.time
  }
  if (!num) {
    num = defaultData.num
  }

  var count = 0
  var timeTicket = null
  timeTicket && clearInterval(timeTicket)
  timeTicket = setInterval(function() {
    myChart.dispatchAction({
      type: 'downplay',
      seriesIndex: 0 // serieIndex的索引值   可以触发多个
    })
    myChart.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex: count
    })
    myChart.dispatchAction({
      type: 'showTip',
      seriesIndex: 0,
      dataIndex: count
    })
    count++
    if (count >= num) {
      count = 0
    }
  }, time)
  myChart.on('mouseover', function(params) {
    clearInterval(timeTicket)
    myChart.dispatchAction({
      type: 'downplay',
      seriesIndex: 0
    })
    myChart.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex: params.dataIndex
    })
    myChart.dispatchAction({
      type: 'showTip',
      seriesIndex: 0,
      dataIndex: params.dataIndex
    })
  })

  myChart.on('mouseout', function() {
    timeTicket && clearInterval(timeTicket)
    timeTicket = setInterval(function() {
      myChart.dispatchAction({
        type: 'downplay',
        seriesIndex: 0 // serieIndex的索引值   可以触发多个
      })
      myChart.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: count
      })
      myChart.dispatchAction({
        type: 'showTip',
        seriesIndex: 0,
        dataIndex: count
      })
      count++
      if (count >= 17) {
        count = 0
      }
    }, 3000)
  })
}
export default {
  autoHover
}
