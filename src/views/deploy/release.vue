<template>
  <div class="app-release">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span>
          部署发布单 -
          <span v-if="deployDetail.status == 'not_online'">待上线</span>
          <span v-if="deployDetail.status == 'onlineing'" class="app-color-info">上线中</span>
          <span v-if="deployDetail.status == 'have_onlined'" class="app-color-success">已上线</span>
          <span v-if="deployDetail.status == 'online_failed'" class="app-color-error">上线失败</span>
          <span v-if="deployDetail.status == 'rollback'" class="app-color-error">回滚</span>
        </span>
      </div>
      <!-- apply -->
      <el-row :gutter="20">
        <el-col :span="10">
          <span class="sp-title">上线ID:</span>
          <span>{{ this.deployDetail.demand_id }}</span>
        </el-col>
      </el-row>
      <el-row class="app-mt-20" :gutter="20">
        <el-col :span="10">
          <span class="sp-title">上线版本:</span>
          <span v-if="this.deployDetail.deploy_mode == 'rolling'">
            <i class="iconfont icon-branch" /> 默认上线master分支 - commit:
            <br>
            <template v-if="deployDetail.commit_version != ''">
              <span v-html="cutout(deployDetail.commit_version)" />
            </template>

            <template v-else>HEAD</template>
          </span>
          <span v-else>
            <i class="iconfont icon-tag" /> Tag上线 - <template v-if="deployDetail.commit_version != ''">
              <span v-html="cutout(deployDetail.commit_version)" />
            </template>
          </span>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="box-card">
      <el-form>
        <el-form-item>
          <el-button v-if="deployDetail.status == 'not_online' && sureStatus!='onlineing' " v-model="sureStatus" label="onlineing" size="medium" icon="el-icon-service" type="primary" @click="websocketsend(deployDetail.commit_version)">部署</el-button>
          <el-button v-if="sureStatus =='onlineing'" size="medium" icon="el-icon-loading" type="info">部署中</el-button>
          <el-button v-if="deployDetail.status == 'online_failed' || sureStatus=='onlineing'" size="medium" icon="el-icon-service" type="warning" @click="websocketsend(deployDetail.commit_version)">重新部署</el-button>
          <el-button v-if="deployDetail.status == 'onlineing'|| sureStatus=='onlineing'" size="medium" icon="el-icon-warning" type="danger" @click="KillDeployHandler(deployDetail.id)">强制终止</el-button>
        </el-form-item>
      </el-form>
      <el-row ref="log" :gutter="10" class="mb8">
        <el-scrollbar wrap-class="list" style="height:500px;background-color: black;color: cornflowerblue;">
          <ul
            style="line-height: 25px;padding-top: 15px;padding-bottom: 15px;min-height: 500px; margin: 0;list-style-type: none;"
          >
            <li v-for="(item,index) in arrs" :key="index">

              {{ item }}
            </li>
          </ul>
        </el-scrollbar>
      </el-row>
    </el-card>
  
    <el-dialog
      :width="$root.DialogNormalWidth"
      title="部署日志"
      :visible.sync="dialogDeployVisible"
      @close="closeDialogDeployHandler"
    >
      <div v-if="deployDetail.status == 'online_failed'"><i class="app-color-error el-icon-warning" /> 部署失败</div>
      <div v-if="deployDetail.status == 'online_success'"><i class="app-color-success el-icon-success" /> 部署成功</div>
      <div v-if="deployDetail.status == 'onlineing'"><i class="app-color-info el-icon-info" /> 部署中</div>
      <div class="app-terminal-log">
        <template v-for="(cmd, index) in msgList">
          <div :key="index">
            <div class="app-color-info"><pre>{{ cmd }}</pre></div>
          </div>
        </template>
      </div>
    </el-dialog>
  </div>

</template>

<script>
import {
  getDeployApply,
  deployStart,
  deployStatusApi
} from '@/api/deploy'

import { getUserProfile } from '@/api/system/sysuser'
import { unWsLogout } from '@/api/ws'

import Code from '@/utils/lib/code'

export default {
  filters: {
    formatTime: function(date, fmt) {
      var date = new Date(date)
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
      }
      var o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
      }
      for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
          var str = o[k] + ''
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : ('00' + str).substr(str.length))
        }
      }
      return fmt
    }
  },
  data() {
    return {
      deployDetail: {},
      dialogDeployVisible: false,
      msg: '',
      ws: '',
      msgList: [],
      websock: null,
      arrs: [],
      id: undefined,
      group: undefined,
      demandid: undefined,
      data: undefined,
      sureStatus: '',
    }
  },
  computed: {
    serverDeployDetail() {
      let detail = {}
      if (this.deployDetail.servers && this.deployDetail.servers[this.serverDeploySid]) {
        const srv = this.deployDetail.servers[this.serverDeploySid]
        detail = {
          status: srv.status,
          errmsg: srv.errmsg,
          output: srv.task
        }
      }
      return detail
    }
  },
  // mounted：在模板渲染成html后调用，通常是初始化页面完成后，再对html的dom节点进行一些需要的操作。
  mounted() {
    /*
    // 连接打开时触发
    this.ws.onopen = () => {
      console.log('Connection open ...')
    }
    // 接收到消息时触发
    this.ws.onmessage = (evt) => {
      console.log(evt)
      this.msgList.push(evt.data)
    }
    // 连接关闭时触发
    this.ws.onclose = () => {
      console.log('Connection close !!!')
    }
    */
  },
  //  页面离开时断开连接,清除定时器
  beforeDestroy() {
    console.log('断开websocket连接')
    this.websock.close() // 离开路由之后断开websocket连接
    unWsLogout(this.id, this.group).then(response => {
      console.log(response.data)
    }
    )
    /*
    this.disconnect()
    clearInterval(this.timer)
    */
  },
 
  // created：在模板渲染成html前调用，即通常初始化某些属性值，然后再渲染成视图。
  created() {
    this.initPageLoader()
    this.id = this.guid()
    this.group = 'log'
    this.demandid = this.getdemandid()
    this.initWebSocket()
  },
  methods: {
    htmlEncode: function(str) {
      // console.log('str========================================================',str)
      var s = ''
      str = str || ''
      if (str.length == 0) return ''
      s = str.replace(/<pre><code([\s\S]*?)<\/code><\/pre>/ig, function(i, a) {
        // console.log('i====',i,'\n a==========',a)
        // return '<pre><code ' + a.replace(/</ig, "<").replace(/>/ig, ">") + '</code><\/pre>'
        return '<pre><code ' + a.replace(/</ig, '<') + '</code><\/pre>'
      })
      // console.log('转换后=======================================================',s)
      return s
    },
    startDeployHandler(id) {
      console.log(id)
      deployStart({ id: id }).then(res => {
        this.loadDeployStatus()
      }).catch(err => {
        if (err.code == Code.CODE_ERR_NO_DATA) {
          this.$confirm(this.$t('build_success_and_deploy'), '部署提示', {
            confirmButtonText: this.$t('start_build'),
            cancelButtonText: this.$t('i_known'),
            type: 'warning'
          }).then(() => {
            console.log('xxxxxxxxxxxxxxxxxxxx')
          }).catch(() => { })
        }
      })
    },
    loadDeployStatus(id) {
      deployStatusApi({ id: id }).then(res => {
        this.deployStatusDetail(res)
        if (res.status == 'onlineing') {
          const vm = this
          setTimeout(function() {
            vm.loadDeployStatus()
          }, 5000)
        }
      })
    },
    closeDialogDeployHandler() {
      this.dialogDeployVisible = false
    },
    // 截取数据
    cutout(cellValue) {
      return cellValue.replace(/\n/g, '<br>')
    },
    // 表单重置
    reset() {
      this.deployDetail = {
        id: undefined,
        demand_id: undefined,
        status: undefined,
        commit_version: undefined,
        description: undefined,
        phone: undefined,
        username: undefined
      }
    },
    initDeployDetail(id) {
      this.reset()
      getDeployApply(id).then(response => {
        this.deployDetail = response.data
        // debugger
        console.log(this.deployDetail)
      }).catch(err => {
        console.log(err)
      })
    },
    initPageLoader() {
      this.id = this.$route.query.id
      this.initDeployDetail(this.id)
    },
    initWebSocket() { // 初始化weosocket
      console.log(this.$store.state.user.token)
      console.log(this.demandid)
      console.log(this.id)
      //const wsuri = process.env.VUE_APP_WS + this.id + '/' + this.group + '?token=' + this.$store.state.user.token
      const wsuri = 'ws://172.19.142.17:8000/ws/' + this.id + '/' + this.group + '/' + this.demandid + '?token=' + this.$store.state.user.token
      this.websock = new WebSocket(wsuri)
      this.websock.onmessage = this.websocketonmessage
      this.websock.onopen = this.websocketonopen
      this.websock.onerror = this.websocketonerror
      this.websock.onclose = this.websocketclose
    },
    websocketonopen() { // 连接建立之后执行send方法发送数据
      console.log('连接打开')
    //   const actions = { 'test': '12345' }
    //   this.websocketsend(JSON.stringify(actions))
    },
    websocketonerror() { // 连接建立失败重连
      this.initWebSocket()
    },
    websocketonmessage(e) { // 数据接收
      console.log(e.data)
      //   console.log(this.binaryAgent(e))
      //   const redata = JSON.parse(e.data)
      //   console.log(redata)
      //   this.$refs.log.innerText = e.data + '\n' + this.$refs.log.innerText
      this.arrs.unshift(e.data)
    },
    websocketsend(Data) { // 数据发送
      this.sureStatus = 'onlineing'
      this.websock.send(Data)
    },
    KillDeployHandler(Data) {
      Data = "KillTask"+Data
      this.websock.send(Data.trim())
    },
    websocketclose(e) { // 关闭
      unWsLogout(this.id, this.group).then(response => {
        console.log(response.data)
      }
      )
      console.log('断开连接', e)
    },
    guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0; var v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },
    getdemandid() {
      this.id = this.$route.query.id
      getDeployApply(this.id).then(response => {
        this.deployDetail = response.data
        // debugger
        console.log("xxxxxxxxxxxxxxxxxxxxxxx:",this.deployDetail.demand_id)
        return this.deployDetail.demand_id
      }).catch(err => {
        console.log(err)
        return err
      })
    }
    /*
    send(version) {
      console.log('version', version)
      // return;
      this.ws.send(version)
      // this.ws.send(JSON.stringify({msg: this.msg}))
      this.msg = ''
    },
    connection() {
      this.ws = new WebSocket('ws://127.0.0.1:8000/api/v1/deploystart')
      // /api/v1/deploystart
    },
    initWebSocket() {
      this.connection()
            let that = this
            // 断开重连机制,尝试发送消息,捕获异常发生时重连
            this.timer = setInterval(() => {
            try {
                this.ws.send('test')
            } catch (err) {
                console.log('断线了: ' + err)
                that.connection()
            }
        }, 5000)
    },
    disconnect() {
      this.ws.onclose = () => {
        console.log('Connection close !!!')
      }
    }
    */
  }
}
</script>
<style scope>

 blockquote, body, dd, dl, dt, fieldset, figure, h1, h2, h3, h4, h5, h6, hr, html, iframe, legend, li, ol, p, pre, textarea, ul {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
body {
    font-family: "PingFang SC","Helvetica Neue",Helvetica,"Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
    font-size: 14px;
}
html, body {
    width: 100%;
    height: 100%;
}
.iconfont {
    &.small {
        font-size: 14px;
    }
    &.mini {
        font-size: 12px;
    }
    &.left {
        margin-right: 3px;
    }
    &.right {
        margin-left: 3px;
    }
}

// reset element css
.el-checkbox, .el-radio {
    font-weight: 400;
}

//app css
.app-link {
    cursor: pointer;
    text-decoration: none;
    color: #1890ff;
    &:hover {
        color: #40a9ff;
    }
}
.app-cursor {
    cursor: pointer;
}
.app-mt-20 {
    margin-top: 20px;
}
.app-mt-10 {
    margin-top: 10px;
}
.app-header-dropdown {
    padding: 0;
    .popper__arrow {
        display: none;
    }
    .app-dropdown-link {
        text-decoration: none;
    }
    .el-dropdown-menu__item {
        padding: 0 15px;
        &.text {
            &:hover {
                color: #606266;
                background: #fff;
            }
        }
    }
    .el-dropdown-menu__item--divided {
        &:before {
            margin: 0 -15px;
        }
    }
}
.app-op-dropdown {
    padding: 0;
    &.el-popper {
        margin-top: 5px;
    }
    .popper__arrow {
        display: none;
    }
}
.el-submenu {
    .el-menu-item {
        min-width: 180px;
    }
}
.app-pagination {
    padding: 20px 0;
}
.app-danger {
    color: #f56c6c;
    &:hover {
        color: #f78989;
    }
    &:active {
        color: #dd6161;
    }
    &:focus {
        color: #f56c6c;
    }
}
.app-table {
    thead {
        color: #4e4f52;
        th {
            background: #fafafa;
        }
        tr {
            &:first-child {
                th {
                    &:first-child {
                        border-top-left-radius: 4px;
                    }
                    &.is-right {
                        border-top-right-radius: 4px;
                    }
                }
            }
        }
    }
}
.app-dialog {
    padding: 0 10px;
    .dialog-footer {
        text-align: right;
    }
}
.app-form {
    .app-input-normal {
        width: 80%;
    }
    .app-input-small {
        width: 50%;
    }
    .app-input-mini {
        width: 30%;
    }
}
.app-line-through {
    text-decoration: line-through;
    color: #b5b6b7;
}
.app-color-success {
    color: #52c41a;
}
.app-color-white {
    color: #fff;
}
.app-color-error {
    color: #f5222d;
}
.app-color-info {
    color: #1890ff;
}
.app-color-warning {
    color: #e6a23c;
}
.app-color-gray {
    color: #999;
}
.app-checkbox-group {
    .el-checkbox {
        margin-left: 0;
        margin-right: 30px;
        min-width: 140px;
    }
    .app-label {
        font-size: 14px;
    }
}
.app-tag-info {
    box-sizing: border-box;
    padding: 0 8px;
    border: 1px solid #d9d9d9;
    background: #fafafa;
    border-radius: 4px;
    cursor: pointer;
}
.app-mt-line {
    border-top: 1px solid #eaeaea;
}
.app-form-explain {
    color: rgba(0,0,0,.45);
    line-height: 1.524;
    margin-top: 2px;
}
.app-table-explain {
    padding: 10px 0;
    .app-description {
        margin-top: 5px;
        color: #8c8c8c;
    }
}
.app-btn-title {
    font-size: 14px;
    margin-bottom: 15px;
}
.app-btn-group {
    margin-bottom: 20px;
    .app-description {
        font-size: 14px;
        margin-top: 5px;
        color: #8c8c8c;
    }
}
.app-divider {
    height: 1px;
    width: 100%;
    margin: 24px 0;
    background: #e8e8e8;
}
.app-form-subtitle {
    margin-bottom: 10px;
    font-weight: 500;
}
.app-form-notice {
    line-height: 2;
    .code {
        background-color: rgba(27,31,35,.05);
        border-radius: 3px;
        padding: .2em .4em;
    }
}
.app-form-box {
    border-radius: 4px;
    border: 1px solid #d9d9d9;
    .item {
        list-style: none;
        display: flex;
        justify-content: space-between;
        margin: 5px 25px;
        border-bottom: 1px solid #d9d9d9;
        &:last-child {
            border-bottom: none;
        }
    }
}
.app-shell-editor {
    padding: 4px;
    border-radius: 4px;
    background: #282a36;
    margin-bottom: 20px;
}
.app-release {
    .sp-title {
        font-weight: 500;
        width: 100px;
        display: inline-block;
    }
    .app-terminal-log {
        background-color: #282e34;
        color: #b8c0cc;
        padding: 10px;
        border-radius: 4px;
        margin-top: 20px;
        margin-bottom: 20px;
        max-height: 600px;
        min-height: 100px;
        overflow: hidden;
        overflow: auto;
        .terminal-cmd {
            padding: 3px 0;
        }
    }
}
.app-cluster-group {
    .el-collapse {
        border-top: none;
        border-bottom: none;
    }
    .app-item {
        padding: 8px;
    }
    .app-cluster-item {
        &:not(:last-child){
            margin-bottom: 10px;
        }
        .el-collapse-item__header {
            background: #f0f2f5;
            border-radius: 6px;
            padding-left: 6px;
        }
    }
}
.layer-global {
    height: 100%;
    .layer-header {
        z-index: 1024;
        position: fixed;
        width: 100%;
        height: 50px;
        background: #3f51b5;
        color: #fff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .header-left {
            .logo {
                margin-left: 25px;
                .svg-logo {
                    height: 30px;
                    color: #fff;
                }
            }
        }
        .header-right {
            display: flex;
            align-items: center;
            .r-item {
                margin-right: 25px;
                font-size: 0;
                .item {
                    color: #fff;
                    display: flex;
                    align-items: center;
                    height: 30px;
                    &:focus {
                        outline: none;
                    }
                    .icon-arrow-down {
                        margin-left: 3px;
                    }
                }
                .avatar {
                    width: 26px;
                    border-radius: 4px;
                }
            }
        }
    }
    .layer-container {
        margin-left: 200px;
        overflow: hidden;
        overflow-y: auto;
        height: 100%;
        background: #f0f2f5;
        .layer-aside {
            border-right: solid 1px #e6e6e6;
            position: fixed;
            left: 0;
            top: 50px;
            bottom: 0;
            width: 200px;
            .aside-menu {
                border-right: none;
                .iconfont {
                    &.left {
                        margin-right: 6px;
                    }
                }
            }
        }
        .layer-main {
            padding-top: 50px;
            box-sizing: border-box;
            height: 100%;
            .bread-crumb {
                background: #fff;
                padding: 16px;
            }
            .container {
                padding: 15px 20px;
            }
        }
    }
}
.app-avatar {
    border-radius: 6px;
    &.normal{
        width: 64px;
        height: 64px;
    }
}
.app-input-help {
    font-size: 12px;
    color: rgba(0,0,0,.45);
    line-height: 1.524;
}
.app-cpy {
    color: #8c8c8c;
    margin: 20px 0;
    a {
        color: #777;
    }
}
.view {
  width: 600px;
  margin: 0 auto;
  background-color: aliceblue;
  height: 500px;
  text-align: center;
  padding-top: 80px;
}
.chat-title {
  text-align: left;
  margin-left: 100px;
  margin-top: 50px;
}
.chat-box {
  background-color: white;
  width: 400px;
  margin: 0 auto;
}

.app-terminal-log {
        background-color: #282e34;
        color: #b8c0cc;
        padding: 10px;
        border-radius: 4px;
        margin-top: 20px;
        margin-bottom: 20px;
        max-height: 600px;
        min-height: 100px;
        overflow: hidden;
        overflow: auto;
        .terminal-cmd {
            padding: 3px 0;
        }
    }
</style>
