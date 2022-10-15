/* eslint-disable vue/valid-v-else */
<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="100px"
    >

      <el-form-item label="计划ID" prop="rid">
        <el-input
          v-model="queryParams.rid"
          placeholder="请输入计划ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="需求ID" prop="fid">
        <el-input
          v-model="queryParams.fid"
          placeholder="请输入需求ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="发起人" prop="openedby">
        <el-input
          v-model="queryParams.openedby"
          placeholder="请输入产品发起人"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="发起时间" prop="openeddate">
        <el-input
          v-model="queryParams.openeddate"
          placeholder="查询某发起时间之后的产品"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

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

    <!--
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-permisaction="['releasetodo:releasetodo:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permisaction="['releasetodo:releasetodo:edit']"
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permisaction="['releasetodo:releasetodo:remove']"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      -->

    <el-col :span="1.5">
      <el-button
        type="warning"
        icon="el-icon-download"
        size="mini"
        @click="handleExport"
      >导出</el-button>
    </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      :data="releasetodoList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="30" />

      <el-table-column
        label="产品名"
        prop="productname"
        :show-overflow-tooltip="true"
        width="150"
      />

      <el-table-column
        label="计划ID"
        prop="rid"
        :show-overflow-tooltip="true"
        width="150"
      />
      <!-- <el-table-column
        label="[f/b]id"
      >
      <template slot-scope="scope">
        <span v-if="scope.row.fid !='' ">fid:{{fid}}</span>
        <span v-else-if="scope.row.bid !='' ">bid:{{bid}}</span>
      </template>
      </el-table-column> -->

      <el-table-column
        label="fid"
        prop="fid"
        width="60"
      />

      <el-table-column
        label="RNotes(Todo)"
        width="300"
      >
        <template slot-scope="scope">
          <el-badge :value="scope.row.totaltime" class="item" size="mini" type="danger">
            <span>{{ scope.row.rnotes }}</span>
          </el-badge>
        </template>

      </el-table-column>

      <el-table-column
        prop="openedby"
        :show-overflow-tooltip="true"
        width="90"
      >
        <template slot="header" slot-scope="scope">
          <span style="background-color:#E6A23C">发起人</span>
          <el-tooltip effect="dark" content="这一列是产品计划相关" placement="bottom">
            <i class="el-icon-info" />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        width="100"
      >
        <template slot="header" slot-scope="scope">
          <span style="background-color:#E6A23C">发起时间</span>
          <el-tooltip effect="dark" content="这一列是产品计划相关" placement="bottom">
            <i class="el-icon-info" />
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.openeddate.substring(0,10) }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" width="60" label="认领人">
        <template slot-scope="scope">
          <span v-if="scope.row.sure_status !=''">{{ scope.row.username }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" width="100" label="认领时间">
        <template slot-scope="scope">
          <span v-if="scope.row.sure_status !=''">{{ scope.row.sure_time.substring(0,10) }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        width="180"
      >
        <template slot-scope="scope">

          <el-button-group v-if="scope.row.sure_status == ''">
            <el-button type="warning" size="mini" @click="operateHandler(scope.row)">待认领</el-button>
          </el-button-group>

          <el-button-group v-if="scope.row.sure_status == '需求中'">
            <el-button type="success" size="mini">需求中</el-button>
          </el-button-group>

          <el-button-group v-if="scope.row.sure_status == '待开发排期'">
            <el-button type="danger" size="mini">待开发排期</el-button>
          </el-button-group>

          <el-button-group v-if="scope.row.sure_status == '开发中'">
            <el-button type="success" size="mini">开发中</el-button>
          </el-button-group>

          <el-button-group v-if="scope.row.sure_status == '待测试排期'">
            <el-button type="danger" size="mini">待测试排期</el-button>
          </el-button-group>

          <el-button-group v-if="scope.row.sure_status == '测试中'">
            <el-button type="success" size="mini">测试中</el-button>
          </el-button-group>

          <el-button-group v-if="scope.row.sure_status == '已上线'">
            <el-button type="success" size="mini">已上线</el-button>
          </el-button-group>

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

    <el-dialog
      :width="$root.DialogNormalWidth"
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      @close="closeDialogHandler"
    >

      <div>
        <el-form size="medium" label-width="120px">
          <el-form-item label="Rid:">
            {{ dialogDetail.rid }}
          </el-form-item>
          <el-form-item label="Fid:">
            {{ dialogDetail.fid }}
          </el-form-item>

          <el-form-item v-if="dialogDetail.sure_status == ''" label="选择状态:">
            <div>
              <el-radio v-model="sureStatus" label="需求中"><span>需求中</span></el-radio>
              <el-radio v-model="sureStatus" label="待开发排期"><span>待开发排期</span></el-radio>
              <el-radio v-model="sureStatus" label="开发中"><span>开发中</span></el-radio>
              <el-radio v-model="sureStatus" label="待测试排期"><span>待测试排期</span></el-radio>
              <el-radio v-model="sureStatus" label="测试中"><span>测试中</span></el-radio>
              <el-radio v-model="sureStatus" label="已上线"><span>已上线</span></el-radio>
            </div>
          </el-form-item>

          <!--
          <el-form-item v-if="dialogDetail.sure_status == ''" :label-width="formLabelWidth" label="选择状态:">
            <el-select v-model="sureStatus" placeholder="请选需求状态">
              <el-option label="需求中" value="需求中"></el-option>
              <el-option label="待开发排期" value="待开发排期"></el-option>
              <el-option label="开发中" value="开发中"></el-option>
              <el-option label="待测试排期" value="待测试排期"></el-option>
              <el-option label="测试中" value="测试中"></el-option>
              <el-option label="已发生产" value="已发生产"></el-option>
            </el-select>
          </el-form-item>
          -->

          <el-form-item v-if="dialogDetail.sure_status == ''" label="选择时间:">
            <div class="block">
              <!--span class="demonstration">确认时间</span>-->
              <el-date-picker
                v-model="value2"
                type="datetime"
                placeholder="选择日期时间"
                align="right"
                :picker-options="pickerOptions1"
              />
            </div>
          </el-form-item>

          <el-form-item v-if="dialogDetail.sure_status == '' && sureStatus == '待开发排期' || sureStatus == '待测试排期' " label="原因">
            <el-input v-model="sureReason" type="textarea" placeholder="选填" clearable :autosize="{ minRows: 2 }" />
          </el-form-item>
          <el-form-item>
            <el-button size="small" type="primary" @click="dialogSubmitSureStatusHandler">认领</el-button>
            <el-button size="small" @click="closeDialogHandler">关闭</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listReleasetodo,
  updateReleasetodo
} from '@/api/releasetodo'

import { formatJson } from '@/utils'
export default {
  name: 'Config',
  data() {
    return {

      formLabelWidth: '120px',
      pickerOptions1: {
        shortcuts: [
          {
            text: '明天',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 7)
              picker.$emit('pick', date)
            }
          }, {
            text: '今天',
            onClick(picker) {
              picker.$emit('pick', new Date())
            }
          }, {
            text: '昨天',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', date)
            }
          }]
      },
      value1: '',
      value2: '',

      dialogTitle: '',
      dialogVisible: false,
      dialogEditVisible: false,
      dialogLoading: false,
      dialogBtnLoading: false,
      dialogDetail: {},
      sureStatus: '',
      sureReason: '',
      tableLoading: false,
      tableData: [],

      releasetodoList: null,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      isEdit: false,
      // 类型数据字典
      typeOptions: [],

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 50,
        id: undefined,
        rid: undefined,
        fid: undefined,
        openedby: undefined,
        openeddate: undefined,
        fidstatus: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        id: [{ required: true, message: '不能为空', trigger: 'blur' }],
        // rid: [{ required: true, message: "计划ID不能为空", trigger: "blur" }],
        // fid: [{ required: true, message: "需求ID不能为空", trigger: "blur" }],
        // bid: [{ required: true, message: "BUGID不能为空", trigger: "blur" }],
        fidstatus: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
        ],
        openedby: [
          { required: true, message: '产品发起人不能为空', trigger: 'blur' }
        ],
        openeddate: [
          { required: true, message: '产品发起时间不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {

    closeDialogHandler() {
      this.dialogVisible = false
    },
    openDialogHandler(title) {
      this.dialogTitle = title
      this.dialogVisible = true
    },
    operateHandler(row) {
      const detail = {
        id: row.id,
        rid: row.rid,
        fid: row.fid,
        sure_status: row.sure_status,
        sure_time: row.sure_time,
        sure_reasion: row.sure_reasion
      }
      // this.dialogLoading = true
      this.dialogDetail = detail
      this.openDialogHandler('请确认需求')
    },

    dialogSubmitSureStatusHandler() {
      const putData = {
        id: this.dialogDetail.id,
        sure_status: this.sureStatus,
        sure_time: this.sureTime,
        sure_reasion: this.sureReasion
      }

      // putData = qs.stringify(putData)
      // putData = JSON.stringify(putData)
      // console.log(JSON.stringify(this.form))
      // console.log(print(putData.sure_status))
      this.dialogBtnLoading = true
      updateReleasetodo(putData).then(res => {
        this.getList()
        this.$message({
          message: '需求状态确认成功！！',
          type: 'success',
          duration: 1000,
          onClose: () => {
            this.closeDialogHandler()
            this.dialogBtnLoading = false
          }
        })
        // eslint-disable-next-line handle-callback-err
      }).catch(err => {
        this.dialogBtnLoading = false
      })
    },

    /** 查询参数列表 */
    getList() {
      this.loading = true
      listReleasetodo(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.releasetodoList = response.data.list
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
      this.form = {
        id: undefined,
        rid: undefined,
        fid: undefined,
        bid: undefined,
        rnotes: undefined,
        openedby: undefined,
        openeddate: undefined,
        fidstatus: undefined
      }
      this.resetForm('form')
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },

    /** 导出按钮操作 */
    handleExport() {
      debugger
      // const queryParams = this.queryParams
      this.$confirm('是否确认导出所有Release数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['产品名', '计划ID', '需求ID', 'RNotes', '发起人', '发起时间', '需求状态']
          const filterVal = ['productname', 'rid', 'fid', 'rnotes', 'openedby', 'openeddate', 'fidstatus']
          const list = this.releasetodoList
          const data = formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'RNotes计划表需求',
            autoWidth: true, // Optional
            bookType: 'xlsx' // Optional
          })
          this.downloadLoading = false
        })
        })
        .catch(function() {})
    }
  }
}
</script>
<style scope>
  .item{
    margin-top: 10px;
    margin-right: 40px;
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
</style>
