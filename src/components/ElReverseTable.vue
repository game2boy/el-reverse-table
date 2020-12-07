<template>
  <div class="el-reverse-table">
    <el-table
      v-loading="loading"
      :data="reverse ? tableDataReverse : tableDataPrivate"
      size="small">
      <template v-if="reverse">
        <el-table-column
          v-for="(column, index) in tableConfigPrivate"
          :key="index"
          :prop="column.prop"
          :label="column.label"
          :align="column.align || 'center'"
          :fixed="column.fixed"
          :width="column.width">
          <template slot-scope="scope">
<!--            {{'列' + index + '行' + scope.$index}}-->
            <span v-if="column.type === 'summary'">{{ formatter(getSummaries({ index: scope.$index, row: scope.row }), 'summary') }}</span>
            <template v-else>
              <el-input
                v-if="tableConfig[scope.$index + 1].allowEdit && index !== 0 && editCell[0] === scope.$index && editCell[1] === column.prop"
                v-model="scope.row[column.prop]"
                ref="cellInput"
                size="mini"
                @blur="handleCellBlur"></el-input>
                <span
                  v-else
                  @dblclick="handleCellDbclick({ rowIndex: scope.$index, columnIndex: index, prop: column.prop, cellValue: scope.row[column.prop] })">{{ column.prop === tableConfig[0].prop ? scope.row[column.prop] : formatter(tableConfig[scope.$index + 1].analysis ? tableConfig[scope.$index + 1].analysis(tableDataPrivate[index - 1]) : handleCellValue(scope.row[column.prop]), tableConfig[scope.$index + 1].type) }}</span>
            </template>
          </template>
        </el-table-column>
      </template>
      <template v-else>
        <el-table-column
          v-for="(column, index) in tableConfigPrivate"
          :key="index"
          :prop="column.prop"
          :label="column.label"
          :align="column.align || 'center'"
          :fixed="column.fixed"
          :width="column.width">
          <template slot-scope="scope">
<!--            {{'列' + index + '行' + scope.$index}}-->
              <span v-if="scope.row.type === 'summary'">{{ formatter(getSummaries({ index, column }), 'summary') }}</span>
              <template v-else>
                <el-input
                  v-if="column.allowEdit && editCell[0] === scope.$index && editCell[1] === column.prop"
                  v-model="scope.row[column.prop]"
                  ref="cellInput"
                  size="mini"
                  @blur="handleCellBlur"></el-input>
                <span
                  v-else
                  @dblclick="handleCellDbclick({ rowIndex: scope.$index, columnIndex: index, prop: column.prop, cellValue: scope.row[column.prop] })">{{ formatter(column.analysis ? column.analysis(scope.row) : handleCellValue(scope.row[column.prop]), column.type) }}</span>
              </template>
          </template>
        </el-table-column>
      </template>
    </el-table>
  </div>
</template>

<script>
import { Util } from './util'
export default {
  name: 'ElReverseTable',
  props: {
    tableData: {
      type: Array,
      default () {
        return []
      }
    },
    tableConfig: {
      type: Array,
      default () {
        return []
      }
    },
    convertUnit: {
      type: Boolean,
      default: false
    },
    showSummary: {
      type: Boolean,
      default: false
    },
    sumText: {
      type: String,
      default: '合计'
    },
    reverse: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    tableData: {
      deep: true,
      immediate: true,
      handler: function (newV, oldV) {
        this.tableDataPrivate = JSON.parse(JSON.stringify(newV))
        this.initTable()
      }
    },
    tableDataReverse: {
      deep: true,
      immediate: true,
      handler: function (newV, oldV) {
        if (this.reverse && newV.length) {
          // 更新tableDataPrivate
          this.tableConfigPrivate.forEach((column, index) => {
            if (index !== 0) {
              if (column.type !== 'summary') {
                newV.forEach((row, rowIndex) => {
                  if (this.tableConfigRelation[rowIndex]) {
                    this.tableDataPrivate[index - 1][this.tableConfigRelation[rowIndex]] = row[`col${index - 1}`]
                  }
                })
              }
            }
          })
        }
      }
    }
  },
  data () {
    return {
      tableDataPrivate: [],
      tableConfigPrivate: [],
      tableDataReverse: [], // 表反转数据
      tableConfigRelation: [], // 记录反转行列对应关系
      editCell: [],
      loading: false
    }
  },
  methods: {
    async initTable () {
      this.loading = true
      this.$emit('update:dataReady', false)
      this.tableConfigPrivate = Util.deepCopy(this.tableConfig)
      this.processTable()
      this.loading = false
      this.$emit('update:dataReady', true)
    },
    processTable () {
      if (this.showSummary) {
        this.tableDataPrivate.unshift({
          type: 'summary'
        })
      }
      if (this.reverse) {
        this.reverseTable(this.tableConfigPrivate, this.tableDataPrivate)
      }
    },
    // 获取表数据
    getTableData () {
      let data = JSON.parse(JSON.stringify(this.tableDataPrivate))
      if (this.showSummary) {
        data.shift()
      }
      return data
    },
    // 更新表数据
    updateTableData (data) {
      return new Promise(resolve => {
        data.forEach(column => {
          column.data.forEach((value, index) => {
            let editCell = [index, column.prop]
            if (this.reverse) {
              editCell = [this.tableConfigRelation.indexOf(column.prop), `col${index}`]
            }
            this.updateCellObject(editCell, value)
          })
        })
        resolve()
      })
    },
    // 更新指定单元格数据
    updateCellObject (editCell, cellObject) {
      // console.log(editCell, cellObject)
      if (this.reverse) {
        this.tableDataReverse[editCell[0]][editCell[1]] = cellObject
      } else {
        this.tableDataPrivate[editCell[0]][editCell[1]] = cellObject
      }
    },
    // 处理单元格数据
    handleCellValue (cellValue) {
      if (typeof cellValue === 'object' && cellValue) {
        return cellValue.value || null
      } else {
        return cellValue
      }
    },
    // 单元格双击
    handleCellDbclick (param) {
      let { rowIndex, columnIndex, prop, cellValue } = param
      // console.log(rowIndex, columnIndex, prop, cellValue)
      // 单元格值为对象，表示非普通数值，不可直接在单元格内修改，需弹窗
      if (typeof cellValue === 'object' && cellValue) {
        this.$emit('cellInput', {
          title: this.reverse ? `${this.tableConfigPrivate[columnIndex].label}月 ${this.tableDataReverse[rowIndex].month}` : `${this.tableDataPrivate[rowIndex].month}月 ${this.tableConfigPrivate[columnIndex].label}`,
          formula: cellValue.formula,
          editCell: [rowIndex, prop]
        })
      } else {
        this.editCell = [rowIndex, prop]
        let _this = this
        this.$nextTick(() => {
          // console.log(_this.$refs.cellInput)
          if (_this.$refs.cellInput && _this.$refs.cellInput[0]) {
            _this.$refs.cellInput[0].focus()
          }
        })
      }
    },
    // 单元格失去焦点
    handleCellBlur () {
      this.editCell = []
    },
    // 格式化处理
    formatter (cellValue, cellType) {
      // console.log(cellType)
      if (['number', 'decimal', 'percent'].includes(cellType)) {
        if (cellType === 'number') {
          cellValue = Util.formatNum(cellValue, this.convertUnit)
        } else if (['decimal', 'percent'].includes(cellType)) {
          cellValue = Util.formatDecimal(cellValue, cellType === 'percent')
        }
      } else if (cellType === 'summary') {
        cellValue = isNaN(cellValue) ? cellValue : Util.formatNum(cellValue, this.convertUnit)
      }
      return cellValue
    },
    // 行合计
    getSummaries (params) {
      let sum = 0
      if (this.reverse) {
        let { index, row } = params
        let column = this.tableConfig[index + 1]
        if (column.type === 'number') {
          if (column.analysis) {
            this.tableDataPrivate.forEach(item => {
              if (item.type !== 'summary') {
                sum += column.analysis(item)
              }
            })
          } else {
            for (let prop in row) {
              if (prop !== this.tableConfig[0].prop) {
                sum += Number(this.handleCellValue(row[prop]))
              }
            }
          }
        } else {
          sum = '/'
        }
      } else {
        let { index, column } = params
        if (index === 0) {
          sum = this.sumText
        } else {
          if (column.type === 'number') {
            this.tableDataPrivate.forEach(item => {
              if (item.type !== 'summary') {
                sum += column.analysis ? column.analysis(item) : Number(this.handleCellValue(item[column.prop]))
              }
            })
          } else {
            sum = '/'
          }
        }
      }
      return sum
    },
    // 反转函数
    reverseTable (columns, data) {
      const buildColumns = [Object.assign({}, columns[0])]
      data.forEach((item, index) => {
        // console.log(item)
        if (item.type !== 'summary') {
          buildColumns.push(Object.assign({
            label: item[columns[0].prop] + '',
            prop: `col${index}`
          }))
        } else {
          buildColumns.push(Object.assign({
            label: this.sumText,
            fixed: 'left'
          }, item))
        }
      })
      // console.log(buildColumns)
      const buildData = []
      columns.forEach((column, index) => {
        if (index !== 0) {
          if (column.prop) {
            this.tableConfigRelation[index - 1] = column.prop
          }
          const item = {}
          item[columns[0].prop] = column.label
          data.forEach((row, index) => {
            if (row.type !== 'summary') {
              item[`col${index}`] = row[column.prop] || null
            }
          })
          buildData.push(item)
        }
      })
      // console.log(buildData)
      this.tableDataReverse = buildData
      this.tableConfigPrivate = buildColumns
    }
  }
}
</script>

<style lang="less">
.el-reverse-table {
  margin-bottom: 10px;
  .el-table .cell {
    line-height: 26px;
    span {
      display: block;
      line-height: 26px;
    }
  }
  .el-input--mini .el-input__inner {
    height: 26px;
    line-height: 26px;
    padding: 0 5px;
    text-align: center;
  }
}
</style>
