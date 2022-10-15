<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="100px"
    >

      <!--
      <el-form-item label="提交日期" prop="ctime">
        <el-input
          v-model="queryParams.ctime"
          placeholder="请输入提交日期"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      -->

      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <el-card shadow="never">
      <el-form ref="formRef" :model="form" size="medium" label-width="130px">
        <el-form-item>
          <el-button icon="el-icon-edit-outline" size="small" type="primary" @click="openDialogHandler('add')">填写上线单</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    </el-row>

    <el-dialog
      :width="$root.DialogNormalWidth"
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      @close="closeDialogHandler"
    >
      <div v-loading="dialogLoading" class="app-dialog">
        <el-form ref="dialogRef" :model="dialogForm" size="medium" label-width="130px">

          <div v-if="dialogcmd == 'view' | dialogcmd == 'audit'">
            <el-form-item label="需求ID：">
              <b> {{ dialogDetail.demand_id }}</b>
            </el-form-item>

            <el-form-item label="上线版本：">
              <!-- <b> cutout({{dialogDetail.commit_version}})</b> -->
              <template>
                <span v-html="cutout(dialogDetail.commit_version)" />
              </template>

            </el-form-item>

            <el-form-item label="上线模式：">
              <b> {{ dialogDetail.deploy_mode }}</b>
            </el-form-item>

            <el-form-item label="上线说明：">
              <b> {{ dialogDetail.description }}</b>
            </el-form-item>

            <el-form-item label="审核状态：">
              <b> {{ dialogDetail.audit_status }}</b>
            </el-form-item>

            <el-form-item label="创建者：">
              <b> {{ dialogDetail.create_byname }}</b>
            </el-form-item>

            <el-form-item label="创建时间：">
              <b> {{ dialogDetail.createdAt | formatTime('yyyy-MM-dd hh:mm:ss') }}</b>
            </el-form-item>

            <template v-if="dialogcmd == 'audit'">

              <el-form-item v-if="dialogDetail.status == 'not_online' && dialogDetail.audit_status == 'unaudit'" label="审核">
                <div>
                  <el-radio v-model="auditStatus" label="audit_pass"><span class="app-color-success">审核通过</span></el-radio>
                  <el-radio v-model="auditStatus" label="audit_denied"><span class="app-color-error">审核拒绝</span></el-radio>
                </div>
              </el-form-item>

              <el-form-item v-if="dialogDetail.status == 'not_online' && dialogDetail.audit_status == 'unaudit' && auditStatus == 'audit_denied'" label="拒绝原因">
                <el-input v-model="auditRefusalReason" type="textarea" :autosize="{ minRows: 2 }" />
              </el-form-item>

              <el-form-item>
                <el-button :loading="btnLoading" size="small" type="primary" @click="dialogSubmitAuditStatusHandler">审核</el-button>
                <el-button size="small" @click="closeDialogHandler">关闭</el-button>
              </el-form-item>

            </template>
          </div>

          <div v-else>
            <el-form-item
              label="请选择需求ID："
              prop="demand_id"
              :rules="[
                { required: true, message: '需求ID不能为空', trigger: 'blur'},
                // { min: 1, max: 5, message: '长度在 1 到 5 个数字字符', trigger: 'blur' }
              ]"
            >
              <el-select
                v-model="dialogForm.demand_id"
                filterable
                placeholder="请输入关键词"
              >
                <el-option
                  v-for="demand in demandList"
                  :key="demand"
                  :label="demand"
                  :value="demand"
                />
              </el-select>
            </el-form-item>

            <el-form-item
              label="请填上线版本："
              prop="commit_version"
              :rules="[
                { required: true, message: '上线版本不能为空', trigger: 'blur'},
              ]"
            >
              <el-input v-model="dialogForm.commit_version" :rows="6" style="overflow:auto;background: red" type="textarea" placeholder="请贴入上线版本列表" autocomplete="off" />
            </el-form-item>

            <el-form-item
              label="请选择上线模式："
              prop="deploy_mode"
              :rules="[
                { required: true, message: '上线模式不能为空', trigger: 'blur'},
              ]"
            >
              <el-select
                v-model="dialogForm.deploy_mode"
                filterable
                placeholder="请输入关键词"
              >
                <el-option
                  v-for="mode in deployModeList"
                  :key="mode"
                  :label="mode"
                  :value="mode"
                />
              </el-select>
            </el-form-item>

            <el-form-item
              label="上线说明："
              prop="description"
              :rules="[
                { min: 0, max: 100, message: '备注为100字以内', trigger: 'blur' },
              ]"
            >
              <el-input v-model="dialogForm.description" :rows="4" type="textarea" placeholder="请输入上线说明" autocomplete="off" />
            </el-form-item>

          </div>
        </el-form>

        <div v-if="dialogcmd == 'add' | dialogcmd == 'edit'" slot="footer" class="dialog-footer">
          <el-button size="small" @click="closeDialogHandler">取消</el-button>
          <el-button :loading="btnLoading" size="small" type="primary" @click="dialogSubmitHandler">确定</el-button>
        </div>

      </div>
    </el-dialog>

    <el-table
      v-loading="tableLoading"
      size="medium"
      :data="deployList"
      :key="tableKey"
      stripe
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @selection-change="handleSelectionChange"

    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="demand_id" width="100" label="需求ID" />

      <el-table-column prop="commit_version" width="800" :show-overflow-tooltip="true" label="上线版本">
        <template slot-scope="scope">
          <el-tooltip effect="dark" content="提交上线申请时间" placement="top">
            <span v-html="cutout(scope.row.commit_version)" />
          </el-tooltip>
        </template>

      </el-table-column>
      <el-table-column width="300" label="申请时间" prop="createdAt">
        <template slot-scope="scope">
          <el-tooltip effect="dark" content="提交上线申请时间" placement="top">
            <span>{{ scope.row.createdAt | formatTime('yyyy-MM-dd hh:mm:ss') }}</span>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column prop="create_byname" width="100" label="申请人">

        <!--
                    <template slot-scope="scope">
                        <el-badge :value="scope.row.create_phone" class="item" size = "mini" type="primary">
                            <span>{{ scope.row.create_byname }}</span>
                        </el-badge>
                    </template>
                    -->
        <template slot-scope="scope">
          <el-tooltip effect="dark" :content="scope.row.create_phone" placement="top">
            <span>{{ scope.row.create_byname }}</span>
          </el-tooltip>
        </template>

      </el-table-column>

      <el-table-column prop="audit_status" width="100" label="审核">
        <template slot-scope="scope">
          <span v-if="scope.row.audit_status == 'unaudit'" class="app-color-warning">未审核</span>
          <span v-else-if="scope.row.audit_status == 'audit_pass'" class="app-color-success">通过</span>
          <span v-else-if="scope.row.audit_status == 'audit_denied'" class="app-color-error">拒绝</span>
          <span v-else>--</span>
        </template>
      </el-table-column>

      <el-table-column prop="status" width="100" label="上线状态">
        <template slot-scope="scope">

          <span v-if="scope.row.status == 'not_online'"><svg class="icon" aria-hidden="true"> <use xlink:href="#icon-icon_wait" /></svg>待上线</span>
          <span v-else-if="scope.row.status == 'onlineing'"><svg class="icon" aria-hidden="true"> <use xlink:href="#icon-iconcoffee" /></svg>上线中</span>
          <span v-else-if="scope.row.status == 'online_success'" class="app-color-success"><svg class="icon" aria-hidden="true"> <use xlink:href="#icon-success" /></svg>成功</span>
          <span v-else-if="scope.row.status == 'online_failed'" class="app-color-error"><svg class="icon" aria-hidden="true"> <use xlink:href="#icon-icon_failed" /></svg>失败</span>
          <span v-else-if="scope.row.status == 'deprecated'" class="app-color-gray"><svg class="icon" aria-hidden="true"> <use xlink:href="#icon-icon_drop" /></svg>废弃</span>
          <span v-else-if="scope.row.status == 'rollback'" class="app-color-error"><svg class="icon" aria-hidden="true"> <use xlink:href="#icon-rollback" /></svg>回滚</span>
          <span v-else>--</span>
        </template>
      </el-table-column>

      <!-- <el-table-column label="操作" width="50" align="right"> -->
      <el-table-column label="操作" width="100">
        <template slot-scope="scope">
          <!-- trigger="click" @command="operateHandler($event, scope.row)" -->
          <el-dropdown trigger="click" @command="operateHandler($event, scope.row)">
            <el-button size="small">
              操作<i class="el-icon-arrow-down el-icon--right" />
            </el-button>

            <el-dropdown-menu slot="dropdown" class="app-op-dropdown">

              <el-dropdown-item command="view">
                <svg class="icon" aria-hidden="true"> <use xlink:href="#icon-icon_view" /></svg>查看
              </el-dropdown-item>

              <el-dropdown-item v-if="scope.row.status == 'not_online' && (scope.row.audit_status == 'unaudit' || scope.row.audit_status == 'audit_denied')" command="edit">
                <svg class="icon" aria-hidden="true"> <use xlink:href="#icon-icon_bianji" /></svg>编辑
              </el-dropdown-item>

              <el-dropdown-item v-if="scope.row.audit_status == 'unaudit' && scope.row.status == 'not_online'" command="audit">
                <svg class="icon" aria-hidden="true"> <use xlink:href="#icon-zongjianshenhe-" /></svg>审核
              </el-dropdown-item>

              <el-dropdown-item v-if="scope.row.audit_status == 'audit_pass' && (scope.row.status == 'not_online'|| scope.row.status == 'onlineing' || scope.row.status == 'online_success' || scope.row.status == 'online_failed' || scope.row.status == 'rollback')" command="deploy">
                <svg class="icon" aria-hidden="true"> <use xlink:href="#icon-iconcoffee" /></svg>上线
              </el-dropdown-item>

              <el-dropdown-item v-if="scope.row.status != 'onlineing' && scope.row.status != 'deprecated'" command="drop">
                <svg class="icon" aria-hidden="true"> <use xlink:href="#icon-icon_drop" /></svg>废弃
              </el-dropdown-item>

            </el-dropdown-menu>

          </el-dropdown>
        </template>
      </el-table-column>

    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageIndex"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

  </div>
</template>

<script>
import {
  listDeployList, addDeployApply, getDeployApply, updateDeployApply
} from '@/api/deploy'

import { getUserProfile } from '@/api/system/sysuser'

import { formatJson } from '@/utils'
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
      form: {
        demand_id: undefined
      },
      demandList: ['1000', '1001', '1002'],
      deployModeList: ['rolling', 'parallel'],
      ids: [],
      title: null,
      dialogcmd: null,
      dialogVisible: false,
      dialogLoading: false,

      btnLoading: false,
      demandDetail: {},
      tableLoading: false,
      deployList: undefined,
      userdata: null,
      create_byname: null,
      create_byemail: null,
      create_phone: null,
      status: null,
      audit_status: null,
      audit_refusal_reason: null,
      dialogDetail: {},
      dialogTitle: '',

      auditStatus: 2,
      auditRefusalReason: '',

      timeList: [
        { time: 1, label: 'today' },
        { time: 2, label: 'yesterday' },
        { time: 3, label: 'byesterday' },
        { time: 7, label: '7day' },
        { time: 30, label: 'within_one_month' },
        { time: 90, label: 'within_three_months' },
        { time: 365, label: 'within_a_year' },
        { time: 0, label: 'any_time' }
      ],

      // 更规范的写法是把key的值单独写到文件里，而非代码里。状态值用数字表示。

      statusList: [
        { status: 'not_online', label: '未上线' },
        { status: 'onlineing', label: '上线中' },
        { status: 'online_success', label: '上线成功' },
        { status: 'online_failed', label: '上线失败' },
        { status: 'deprecated', label: '已废弃' }
      ],

      auditStatusList: [
        { audit_status: 'unaudit', label: '待审核' },
        { audit_status: 'audit_pass', label: '审核通过' },
        { audit_status: 'audit_denied', label: '审核拒绝' }
      ],

      // adddialogForm: {},
      dialogForm: {
        id: 11111,
        demand_id: '',
        commit_version: '',
        description: '',
        deploy_mode: 'rolling',
        audit_status: '',
        status: '',
        created_at: ''
      },

      // 总条数
      total: 0,

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 50,
        id: undefined,
        demand_id: undefined,
        commit_version: undefined,
        deploy_mode: undefined,
        description: undefined,
        audit_status: undefined,
        audit_refusal_reasion: undefined,
        status: undefined,
        create_by: undefined,
        update_by: undefined,
        created_at: undefined,
        updated_at: undefined,
        create_byname: undefined,
        create_byemail: undefined,
        create_phone: undefined
      }

    }
  },
  created() {
    this.getList()
  },
  mounted() {
  },
  methods: {
    operateHandler(cmd, row) {
      switch (cmd) {
        case 'view':
        case 'audit':
          this.viewHandler(cmd, row)
          break
        case 'edit':
          this.editHandler(cmd, row)
          break
        case 'drop':
          this.dropHandler(cmd, row)
          break
        case 'deploy':
          this.deployHandler(cmd, row)
          break
      }
    },

    // 截取数据
    cutout(cellValue) {
      return cellValue.replace(/\n/g, '<br>')
    },

    dialogSubmitHandler() {
      this.$refs.dialogRef.validate((valid) => {
        if (!valid) {
          return false
        }
        this.btnLoading = true

        if (this.dialogForm.id !== undefined) {
          this.dialogBtnLoading = true
          updateDeployApply(this.dialogForm).then(response => {
            if (response.code === 200) {
              this.msgSuccess('修改成功')
              this.btnLoading = false
              this.closeDialogHandler()
              this.getList()
            } else {
              this.msgError(response.msg)
              this.btnLoading = false
            }
          })
        } else {
          getUserProfile().then(response => {
            this.user = response.data
            // console.log(this.user)
            this.create_byname = this.user.username
            this.create_phone = this.user.phone

            this.postData = {
              demand_id: this.dialogForm.demand_id,
              commit_version: this.dialogForm.commit_version,
              description: this.dialogForm.description,
              deploy_mode: this.dialogForm.deploy_mode,
              create_byname: this.create_byname,
              create_phone: this.create_phone

            }
          })

          addDeployApply(this.postData).then(res => {
            debugger
            console.log(this.postData)
            this.getList()
            this.$alert('恭喜，上线申请提交成功', '提交成功', {
              type: 'success',
              confirmButtonText: '确定',
              callback: action => {
                this.btnLoading = false
                this.closeDialogHandler()
              }

            })
          }).catch(err => {
            this.btnLoading = false
          })
        } // end else
      })
    },
    openDialogHandler(cmd) {
      if (cmd == 'edit') {
        this.title = '修改上线单'
      } else if (cmd == 'view') {
        this.title = '查看上线单'
        this.reset()
      } else if (cmd == 'add') {
        this.title = '新增上线单'
        this.reset()
        // 使用了默认值被清空
      } else if (cmd == 'audit') {
        this.title = '审核'
        this.reset()
      }
      this.dialogTitle = this.title
      this.dialogcmd = cmd
      this.dialogVisible = true
    },
    dialogSubmitAuditStatusHandler() {
      const postData = {
        id: this.dialogDetail.id,
        audit_status: this.auditStatus,
        audit_refusal_reasion: this.auditRefusalReason
      }
      this.dialogBtnLoading = true
      debugger
      console.log(postData)
      updateDeployApply(postData).then(res => {
        this.$message({
          message: '审核通过',
          type: 'success',
          duration: 1000,
          onClose: () => {
            this.closeDialogHandler()
            this.getList()
            this.dialogBtnLoading = false
          }
        })
      }).catch(err => {
        this.dialogBtnLoading = false
      })
    },
    closeDialogHandler() {
      this.dialogVisible = false
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    deployHandler(cmd, row) {
      // alert(1)
      // this.$router.push({ name: 'deployRelease', query: { id: row.id }})
      // 带查询参数，如变成/deploy/release?id=2
      this.$router.push({ path: '/deploy/release', query: { id: row.id }})
    },

    auditStatusTitle(auditStatus) {
      let auditTitle = ''
      this.auditStatusList.forEach(item => {
        if (auditStatus == item.status) {
          auditTitle = item.label
        }
      })
      return auditTitle
    },

    dropHandler(cmd, row) {
      this.DropData = {
        status: 'deprecated',
        id: row.id
      }
      this.$root.ConfirmDelete(() => {
        updateDeployApply(this.DropData).then(response => {
          if (response.code === 200) {
            this.msgSuccess('废弃成功')
            this.getList()
          } else {
            this.msgError(response.msg)
          }
        })
      }, '此操作将废弃该上线单, 是否继续?')
    },

    /** 查看按钮操作 */
    viewHandler(cmd, row) {
      const id = row.id
      getDeployApply(id).then(response => {
        this.dialogLoading = false
        this.dialogDetail = response.data
        // console.log(this.dialogDetail)
        cmd == 'view' ? 'view' : 'audit'
        this.openDialogHandler(cmd)
        this.dialogcmd = cmd
      }).catch(err => {
        this.dialogLoading = false
      })
    },

    /** 修改按钮操作 */
    editHandler(cmd, row) {
      // debugger
      this.dialogLoading = true
      const id = row.id
      console.log(id)
      getDeployApply(id).then(response => {
        this.dialogLoading = false
        this.dialogForm = response.data
        this.dialogcmd = cmd
        this.openDialogHandler(cmd)
        console.log(response.data)
      }).catch(err => {
        this.dialogLoading = false
      })
    },

    /** 查询参数列表 */
    getList() {
      this.loading = true
      listDeployList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.deployList = response.data.list
          this.total = response.data.count
          this.loading = false
        }
      )
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.dialogForm = {
        id: undefined,
        demand_id: undefined,
        commit_version: undefined,
        description: undefined
      }
      this.resetForm('dialogForm')
    }
  }
}
</script>
<style scope>
  .item{
    margin-top: 10px;
    margin-right: 40px;
  }

  .el-table .warning-row {
    background: oldlace;
  }

  .el-table .success-row {
    background: #f0f9eb;
  }

  .el-table__body tr.current-row>td {
        background: #f57878 !important;
  }

  /* 表格鼠标悬浮时的样式（高亮） */
  .el-table--enable-row-hover .el-table__body tr:hover {
  background: rgb(184, 224, 250);
  border: 1px solid #f0f9eb;
  }
  /*表格鼠标悬停的样式（背景颜色）*/
  .el-table tbody tr:hover > td {
  background-color: #f0f9eb !important;
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

.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

</style>
