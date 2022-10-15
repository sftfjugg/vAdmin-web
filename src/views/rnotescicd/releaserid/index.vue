<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="100px"
    >

      <!--
      <el-form-item label="计划ID" prop="rid">
        <el-input
          v-model="queryParams.rid"
          placeholder="请输入计划ID"
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
    -->
    </el-form>

    <!--
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-permisaction="['releaserid:releaserid:add']"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-permisaction="['releaserid:releaserid:edit']"
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
          v-permisaction="['releaserid:releaserid:remove']"
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
      :data="releaseridList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="30" />

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
        label="[需求id|RNotes|发起人|发起时间] [应用名;提测时间;测试次数;上线时间;Dev耗时;STG耗时;Total耗时;上线后几天]"
        :show-overflow-tooltip="true"
        width="3000"
      >
        <template slot-scope="scope">

          <span style="white-space: pre-line;color:#67C23A">{{ scope.row.rnotesadd | prefix }}</span>
          <span style="white-space: pre-line;color:#E6A23C">{{ scope.row.rnotesadd | idxInsert }}</span>
          <span style="white-space: pre-line;">{{ scope.row.rnotesadd | suffix }}</span>
        </template>
      </el-table-column>

      <!--
      <el-table-column
        label="RNotesAdd"
        align="center"
        width="1000"
      >
      <template slot-scope="scope">
        <el-badge value="今天" class="item" v-if="scope.row.daylabel =='0' " size = "mini">
          <span>{{scope.row.rnotesadd}}</span>
        </el-badge>
          <el-badge value="昨天" class="item" v-else-if="scope.row.daylabel =='1' " size = "mini" type="warning">
          <span>{{scope.row.rnotesadd}}</span>
        </el-badge>
          <el-badge value="前天" class="item" v-else-if="scope.row.daylabel =='2' " size = "mini" type="primary">
          <span>{{scope.row.rnotesadd}}</span>
        </el-badge>
         <el-badge value="一周内" class="item" v-else-if="scope.row.daylabel =='3' " size = "mini" type="info">
          <span>{{scope.row.rnotesadd}}</span>
        </el-badge>
        <span v-else>{{scope.row.rnotesadd}}</span>
      </template>

      </el-table-column>
      -->

      <!--
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">

          <el-button-group>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              >修改</el-button
            >
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete-solid"
              @click="handleDelete(scope.row)"
              >删除</el-button
            >
          </el-button-group>
        </template>
      </el-table-column>
    -->
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageIndex"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="计划ID" prop="rid">
          <el-input v-model="form.rid" placeholder="计划ID" />
        </el-form-item>
        <el-form-item label="RNotesAdd" prop="rnotesadd">
          <el-input v-model="form.rnotesadd" placeholder="Release Notes Add" />
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
  listReleaserid,
  getReleaserid,
  delReleaserid,
  addReleaserid,
  updateReleaserid
} from '@/api/releaserid'

import { formatJson } from '@/utils'
export default {
  name: 'Config',
  filters: {
    /* 字符替换*/
    transBr(val) {
      return (val + '').replace(/\n/g, '<br/>')
    },
    /* 取字符串前缀*/
    prefix(val) {
      const xv = val.indexOf('|', 6)
      return val.substring(0, xv)
    },
    /* 取截取字符串*/
    idxInsert(val) {
      const xv = val.indexOf('|', 6)
      const yv = val.lastIndexOf('|')
      return val.substring(xv, yv)
    },
    /* 取字符串后缀*/
    suffix(val) {
      const xv = val.lastIndexOf('|')
      return '\n\b' + val.substr(xv + 1)
    },
    sureSuffix(val) {
      const xv = val.lastIndexOf('; ')
      return val.substr(xv + 1)
    }
  },
  data() {
    return {
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
      releaseridList: [],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 50,
        id: undefined,
        rid: undefined,
        rnotesadd: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        id: [{ required: true, message: '不能为空', trigger: 'blur' }],
        rid: [{ required: true, message: '计划ID不能为空', trigger: 'blur' }],
        rnotesadd: [
          { required: true, message: 'rnotesadd不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listReleaserid(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.releaseridList = response.data.list
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
        rnotesadd: undefined
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
      this.title = '添加Releaserid'
      this.isEdit = false
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getReleaserid(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改Releaserid'
        this.isEdit = true
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateReleaserid(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addReleaserid(this.form).then(response => {
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
    handleDelete(row) {
      const Ids = row.id || this.ids
      this.$confirm('是否确认删除编号为"' + Ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return delReleaserid(Ids)
        })
        .then(() => {
          this.getList()
          this.msgSuccess('删除成功')
        })
        .catch(function() {})
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
            const tHeader = ['计划ID', 'RNotesAdd']
            const filterVal = ['rid', 'rnotesadd']
            const list = this.releaseridList
            const data = formatJson(filterVal, list)
            excel.export_json_to_excel({
              header: tHeader,
              data,
              filename: 'RNotesAdd详情表',
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
.item {
  margin-top: 10px;
  margin-right: 40px;
}
</style>
