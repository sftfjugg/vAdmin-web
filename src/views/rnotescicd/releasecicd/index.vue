<template>
  <div class="app-container">
    <!--
    <div class="filter-container">
      <el-input
        v-model="listQuery.key"
        placeholder="请输入内容"
        clearable
        prefix-icon="el-icon-search"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
      />
      <el-select
        v-model="listQuery.fid"
        placeholder="需求ID"
        clearable
        style="width: 90px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in statusOptions"
          :key="item.key"
          :label="item.display_name"
          :value="item.key"
        />
      </el-select>
      <el-select
        v-model="listQuery.sort"
        style="width: 140px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in sortOptions"
          :key="item.key"
          :label="item.label"
          :value="item.key"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        {{ "搜索" }}
      </el-button>
      <el-button
        v-if="permissionList.add"
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        {{ "添加" }}
      </el-button>
      <el-button
        v-if="permissionList.del"
        class="filter-item"
        type="danger"
        icon="el-icon-delete"
        @click="handleBatchDel"
      >
        {{ "删除" }}
      </el-button>
    </div>
    -->

    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="100px"
    >
      <!--
            <el-form-item label="" prop="id">
                <el-input v-model="queryParams.id" placeholder="请输入" clearable size="small" @keyup.enter.native="handleQuery" />
            </el-form-item>
          -->
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

      <el-form-item label="BugID" prop="bid">
        <el-input
          v-model="queryParams.bid"
          placeholder="请输入BugID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="应用名" prop="appname">
        <el-input
          v-model="queryParams.appname"
          placeholder="请输入应用名"
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
      <!--
      <el-form-item label="需求状态" prop="fidstatus">
        <el-input
          v-model="queryParams.fidstatus"
          placeholder="未提测|已提测|已发生产"
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-permisaction="['releasecicd:releasecicd:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permisaction="['releasecicd:releasecicd:edit']"
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
          v-permisaction="['releasecicd:releasecicd:remove']"
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>

    <el-col :span="1.5">
      <el-button
        type="warning"
        icon="el-icon-download"
        size="mini"
        @click="handleExport"
      >导出</el-button>
    </el-col>
    </el-row>

    <!--:row-class-name="tableRowClassName">-->
    <el-table
      v-loading="loading"
      :data="releasecicdList"
      :span-method="mergeCell"
      :key="tableKey"
      stripe
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"

    >
      <el-table-column type="selection" width="30" />

      <el-table-column
        label="产品名"
        prop="productname"
        :show-overflow-tooltip="true"
        width="110"
      />

      <el-table-column
        label="计划ID"
        prop="rid"
        :show-overflow-tooltip="true"
        width="150"
      />

      <el-table-column
        width="80"
        label="[f|b]id"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.fid !='' ">{{ scope.row.fid }}</span>
          <span v-else-if="scope.row.bid !='' ">bid:{{ scope.row.bid }}</span>
        </template>
      </el-table-column>

      <!--
      <el-table-column
        label="fid"
        prop="fid"
        width="60"
      />
      <el-table-column
        label="bid"
        prop="bid"
        width="60"
      />
      -->
      <el-table-column
        label="RNotes(Done)"
        width="400"
      >
        <!--
      <template slot-scope="scope">
        <el-badge value="今天" class="item" v-if="scope.row.daylabel =='0' " size = "mini" type="success">
          <span>{{scope.row.rnotes}}  </span>
        </el-badge>
          <el-badge value="昨天" class="item" v-else-if="scope.row.daylabel =='1' " size = "mini" type="primary">
          <span>{{scope.row.rnotes}}</span>
        </el-badge>
          <el-badge value="前天" class="item" v-else-if="scope.row.daylabel =='2' " size = "mini" type="warning">
          <span>{{scope.row.rnotes}}</span>
        </el-badge>
         <el-badge value="一周内" class="item" v-else-if="scope.row.daylabel =='3' " size = "mini" type="info">
          <span>{{scope.row.rnotes}}</span>
        </el-badge>
        <span v-else>{{scope.row.rnotes}} </span>
      </template>
      -->
        <template slot-scope="scope">

          <el-badge v-if="scope.row.daylabel == 0" value="今天" class="item" size="mini" type="success">
            <span>{{ scope.row.rnotes }}  </span>
          </el-badge>
          <el-badge v-else-if="scope.row.daylabel == 1 " value="昨天" class="item" size="mini" type="primary">
            <span>{{ scope.row.rnotes }}</span>
          </el-badge>
          <el-badge v-if="scope.row.daylabel >= 2" :value="scope.row.daylabel" class="item" size="mini" type="warning">
            <span>{{ scope.row.rnotes }}</span>
          </el-badge>

        </template>

      </el-table-column>

      <el-table-column
        label="应用名"
        prop="appname"
        :show-overflow-tooltip="true"
        width="120"
      />
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
        :show-overflow-tooltip="true"
        width="100"
      >
        <template slot="header" slot-scope="scope">
          <span style="background-color:#E6A23C">发起时间</span>
          <el-tooltip effect="dark" content="这一列是产品计划相关" placement="bottom">
            <i class="el-icon-info" />
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <!--<span>{{ scope.row.openeddate }}</span>-->
          <!--切割时间后导出不了时间值-->
          <span>{{ scope.row.openeddate.substring(0,10) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :show-overflow-tooltip="true"
        width="100"
      >
        <template slot="header" slot-scope="scope">
          <span style="background-color:#67C23A">STG时间</span>
          <el-tooltip effect="dark" content="这一列是测试发布相关" placement="bottom">
            <i class="el-icon-info" />
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <span>{{ scope.row.cicdtime.substring(0,10) }}</span>
        </template>

      </el-table-column>

      <el-table-column
        label="STG数"
        :show-overflow-tooltip="true"
        prop="num"
        width="90"
      >
        <template slot="header" slot-scope="scope">
          <span style="background-color:#67C23A">STG数</span>
          <el-tooltip effect="dark" content="这一列是测试发布相关" placement="bottom">
            <i class="el-icon-info" />
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column
        label="Prod时间"
        :show-overflow-tooltip="true"
        width="100"
      >
        <template slot="header" slot-scope="scope">
          <span style="background-color:#F56C6C">Prod时间</span>
          <el-tooltip effect="dark" content="这一列是生产发布相关" placement="bottom">
            <i class="el-icon-info" />
          </el-tooltip>
        </template>

        <template slot-scope="scope">
          <span>{{ scope.row.deploytime.substring(0,10) }}</span>
        </template>

      </el-table-column>

      <el-table-column
        label="Dev耗时(天)"
        :show-overflow-tooltip="true"
        width="100"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.cicdtime !==''&& scope.row.openeddate !==''">
            {{ scope.row.devtime }}
          </span>
          <span v-else />
        </template>
      </el-table-column>

      <el-table-column
        label="STG耗时(天)"
        :show-overflow-tooltip="true"
        width="100"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.deploytime !==''&& scope.row.cicdtime !==''">
            {{ scope.row.stgtime }}
          </span>
          <span v-else />
        </template>
      </el-table-column>

      <el-table-column
        label="Total耗时(天)"
        :show-overflow-tooltip="true"
        width="100"
      >
        <template slot-scope="scope">
          <el-badge v-if="scope.row.deploytime !==''&& scope.row.totaltime ==='半年以上'" value="周期太长!!" class="item" size="mini">
            <span>{{ scope.row.totaltime }}</span>
          </el-badge>
          <span v-else>
            {{ scope.row.totaltime }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        label="Prod版本"
        prop="prdversion"
        :show-overflow-tooltip="true"
        width="100"
      >
        <template slot="header" slot-scope="scope">
          <span style="background-color:#F56C6C">Prod版本</span>
          <el-tooltip effect="dark" content="这一列是生产发布相关" placement="bottom">
            <i class="el-icon-info" />
          </el-tooltip>
        </template>
      </el-table-column>

      
      <el-table-column
        label="操作"
        align="center"
        width="360"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button
            v-if="permissionList.view"
            size="mini"
            type="success"
            @click="handleDetail(row.id)"
          >
            {{ "查看" }}
          </el-button>
          <el-button
            v-if="permissionList.update"
            type="primary"
            size="mini"
            @click="handleUpdate(row.id)"
          >
            {{ "编辑" }}
          </el-button>
          <el-button
            v-if="permissionList.del"
            size="mini"
            type="danger"
            @click="handleDelete(row)"
          >
            {{ "删除" }}
          </el-button>
        </template>
      </el-table-column>

      <!--
      <el-table-column
        label="操作"
        width="180"

        <template slot-scope="scope">

          <el-link type="primary"  @click="handleUpdate(scope.row)"  icon="el-icon-edit">修改</el-link>
          <el-link type="danger"  @click="handleDelete(scope.row)"  icon="el-icon-delete">删除</el-link>

        <el-button-group >
            <el-button type="primary" size="mini" icon="el-icon-edit"  @click="handleUpdate(scope.row)">修改</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete-solid" @click="handleDelete(scope.row)">删除</el-button>
          </el-button-group>

        </template>

      </el-table-column>
          -->

    </el-table>

    <!--
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageIndex"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="计划ID" prop="rid">
          <el-input v-model="form.rid" placeholder="计划ID" />
        </el-form-item>
        <el-form-item label="需求ID" prop="fid">
          <el-input v-model="form.fid" placeholder="需求ID" />
        </el-form-item>
        <el-form-item label="BugID" prop="bid">
          <el-input v-model="form.bid" placeholder="bugID" />
        </el-form-item>
        <el-form-item label="RNotes" prop="rnotes">
          <el-input v-model="form.rnotes" placeholder="Release Notes" />
        </el-form-item>
        <el-form-item label="应用名" prop="appname">
          <el-input v-model="form.appname" placeholder="应用名" />
        </el-form-item>
        <el-form-item label="发起人" prop="openedby">
          <el-input v-model="form.openedby" placeholder="产品发起人" />
        </el-form-item>
        <el-form-item label="发起时间" prop="openeddate">
          <el-input v-model="form.openeddate" placeholder="产品发起时间" />
        </el-form-item>
        <el-form-item label="STG版本" prop="civersion">
          <el-input v-model="form.civersion" placeholder="测试发布版本" />
        </el-form-item>
        <el-form-item label="STG状态" prop="cicdstatus">
          <el-input v-model="form.cicdstatus" placeholder="测试发布状态" />
        </el-form-item>
        <el-form-item label="提测时间" prop="cicdtime">
          <el-input v-model="form.cicdtime" placeholder="测试发布起始时间" />
        </el-form-item>
        <el-form-item label="STG数" prop="num">
          <el-input v-model="form.num" placeholder="测试发布次数" />
        </el-form-item>
        <el-form-item label="CommitID" prop="commitid">
          <el-input v-model="form.commitid" placeholder="CommitID" />
        </el-form-item>
        <el-form-item label="Prod版本" prop="prdversion">
          <el-input v-model="form.prdversion" placeholder="生产发布版本" />
        </el-form-item>
        <el-form-item label="Prod状态" prop="deploystatus">
          <el-input v-model="form.deploystatus" placeholder="生产发布状态" />
        </el-form-item>
        <el-form-item label="Prod时间" prop="deploytime">
          <el-input v-model="form.deploytime" placeholder="生产发布时间" />
        </el-form-item>
        <el-form-item label="DEV耗时" prop="devtime">
          <el-input v-model="form.devtime" placeholder="开发耗时" />
        </el-form-item>
        <el-form-item label="STG耗时" prop="stgtime">
          <el-input v-model="form.devtime" placeholder="测试耗时" />
        </el-form-item>
        <el-form-item label="Total耗时" prop="totaltime">
          <el-input v-model="form.totaltime" placeholder="总耗时" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  requestList,
  listReleasecicd,
  getReleasecicd,
  delReleasecicd,
  addReleasecicd,
  updateReleasecicd
} from '@/api/releasecicd'

import waves from '@/directive/waves'

import { checkAuthAdd, checkAuthDel, checkAuthView, checkAuthUpdate, checkAuthSetadminrole } from '@/utils/permission'

const statusOptions = [
  { key: 1, display_name: '正常' },
  { key: 2, display_name: '未激活' },
  { key: 3, display_name: '暂停使用' }
]

import { formatJson } from '@/utils'
export default {
  name: 'Config',
  directives: { waves },
  filters: {
    /* 长字符处理*/
    lenenter(value) {
      if (!value) return ''
      if (value.length > 8) {
        return value.slice(0, 8) + '...' + value.slice(9)
      }
      return value
    }
  },
  data() {
    return {
      operationList: [],
      permissionList: {
        add: false,
        del: false,
        view: false,
        update: false,
        setadminrole: false
      },
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      loading: true,
      listQuery: {
        page: 1,
        limit: 20,
        key: undefined,
        fid: undefined,
        sort: '-id'
      },
      statusOptions,
      sortOptions: [
        { label: 'ID Ascending', key: '+id' },
        { label: 'ID Descending', key: '-id' },
        { label: 'fid Ascending', key: '+fid' },
        { label: 'fid Descending', key: '-fid' }
      ],

      releasecicdList: null,
      tip: 'siri',
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
        appname: undefined,
        civersion: undefined,
        openedby: undefined,
        openeddate: undefined,
        cicdtime: undefined,
        num: undefined,
        prdversion: undefined,
        deploytime: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        id: [{ required: true, message: '不能为空', trigger: 'blur' }],
        // rid: [{ required: true, message: "计划ID不能为空", trigger: "blur" }],
        // fid: [{ required: true, message: "需求ID不能为空", trigger: "blur" }],
        appname: [
          { required: true, message: '应用名不能为空', trigger: 'blur' }
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

    checkPermission() {
      this.permissionList.add = checkAuthAdd(this.operationList)
      this.permissionList.del = checkAuthDel(this.operationList)
      this.permissionList.view = checkAuthView(this.operationList)
      this.permissionList.update = checkAuthUpdate(this.operationList)
      this.permissionList.setadminrole = checkAuthSetadminrole(this.operationList)
    },
    getMenuButton() {
      requestMenuButton('Admins').then(response => {
        this.operationList = response.data
      }).then(() => {
        this.checkPermission()
      })
    },

    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        status: 1,
        memo: ''
      }
    },


    sortChange(data) {
      const { prop, order } = data
      if (order === 'ascending') {
        this.listQuery.sort = '+' + prop
      } else if (order === 'descending') {
        this.listQuery.sort = '-' + prop
      } else {
        this.listQuery.sort = undefined
      }
      this.handleFilter()
    },

    tableRowClassName({ row, rowIndex }) {
      if (rowIndex === 1) {
        return 'warning-row'
      } else if (rowIndex === 3) {
        return 'success-row'
      }
      return ''
    },
    // 当前行row、列column、行号rowIndex、列号columnIndex
    mergeCell({ row, column, rowIndex, columnIndex }) {
      // 第一列到第五列执行合并逻辑
      if (columnIndex >= 1 && columnIndex <= 4) {
        // 从第二行开始
        if (rowIndex > 0) {
          // 上一行
          var preRow = this.releasecicdList[rowIndex - 1]
          // 当前行与上一行的指定属性比较
          if (row.fid == preRow.fid && row.rid == preRow.rid) {
            // console.log("i am in if")
            return {
              rowspan: 0,
              colspan: 0
            }
          }
        }

        var rowspan = 1
        for (var i = rowIndex + 1, len = this.releasecicdList.length; i < len; i++) {
          var nextRow = this.releasecicdList[i]
          if (row.fid == nextRow.fid && row.rid == nextRow.rid) {
            ++rowspan
          } else {
            break
          }
        }
        return {
          rowspan: rowspan,
          colspan: 1
        }
      }
    },
    /** 查询参数列表 */
    
    getList() {
      this.loading = true
      listReleasecicd(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.releasecicdList = response.data.list
          this.total = response.data.count
          this.loading = false
        }
      )
    },
    

   /*
    getList() {
      this.listLoading = true
      requestList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },
   */

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
        rnotes: undefined,
        appname: undefined,
        openedby: undefined,
        openeddate: undefined,
        civersion: undefined,
        cicdtime: undefined,
        num: undefined,
        prdversion: undefined,
        deploytime: undefined
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加Releasecicd'
      this.isEdit = false
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    /*
    handleUpdate(row) {
      this.reset()
      debugger
      const id = row.id || this.ids
      getReleasecicd(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改Releasecicd'
        this.isEdit = true
      })
    },*/

    handleUpdate(id) {
      this.loading = true
      getReleasecicd(id).then(response => {
        this.loading = false
        this.temp = response.data
      })
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.loading = true
          const tempData = Object.assign({}, this.temp)
          updateReleasecicd(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          }).catch(() => {
            this.loading = false
          })
        }
      })
    },


    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateReleasecicd(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addReleasecicd(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    /*
    handleDelete(row) {
      const Ids = row.id || this.ids
      this.$confirm('是否确认删除编号为"' + Ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return delReleasecicd(Ids)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
        .catch(function() {})
    },*/
    handleDelete(row) {
      var ids = []
      ids.push(row.id)
      this.$confirm('是否确定删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delReleasecicd(ids).then(() => {
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          this.total = this.total - 1
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },

    /** 导出按钮操作 */
    handleExport() {
      // debugger
      // const queryParams = this.queryParams
      this.$confirm('是否确认导出所有Release数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['产品名', '计划ID', '需求FID', 'BugID', 'RNotes', '应用名', '发起人', '发起时间', '提测时间', 'STG次数', 'Prod时间', 'DEV耗时', 'STG耗时', 'Total时间']
          const filterVal = ['productname', 'rid', 'fid', 'bid', 'rnotes', 'appname', 'openedby', 'openeddate', 'cicdtime', 'num', 'deploytime', 'devtime', 'stgtime', 'totaltime']
          const list = this.releasecicdList
          const data = formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'RNotes已上线详情',
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

</style>
