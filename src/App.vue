<template>
  <div id="app">
    <h4>行列倒置前</h4>
    <el-reverse-table
      :table-config="tableConfig"
      :table-data="tableData"
      show-summary
      sum-text="总预算"
      convert-unit></el-reverse-table>
    <h4>行列倒置后</h4>
    <el-reverse-table
      :table-config="tableConfig"
      :table-data="tableData"
      ref="budgetTable"
      show-summary
      sum-text="总预算"
      convert-unit
      reverse></el-reverse-table>
    <el-button type="primary" size="mini" @click="getTableData">获取表数据</el-button>
  </div>
</template>

<script>
import ElReverseTable from './components/ElReverseTable.vue'
export default {
  name: 'app',
  components: {
    ElReverseTable
  },
  data () {
    return {
      tableConfig: [{
        label: '月份',
        prop: 'month',
        width: 120,
        fixed: 'left'
      }, {
        label: '预算（万）',
        prop: 'budget',
        type: 'number',
        allowEdit: true
      }, {
        label: '溢价率',
        prop: 'premium_rate',
        type: 'percent',
        allowEdit: true
      }, {
        label: '预算调整（万）',
        prop: 'budget_adjustment',
        type: 'number',
        allowEdit: true
      }, {
        label: '预算溢价后（万）',
        prop: 'budget_premium',
        type: 'number',
        analysis: row => this.computeBudgetPremium(row)
      }],
      tableData: [{
        month: 1,
        budget: 12340000,
        premium_rate: 10.125678,
        budget_adjustment: 100000
      }, {
        month: 2,
        budget: 12340000,
        premium_rate: 10.125678,
        budget_adjustment: 100000
      }, {
        month: 3,
        budget: 12340000,
        premium_rate: 10.125678,
        budget_adjustment: 100000
      }, {
        month: 4,
        budget: 12340000,
        premium_rate: 10.125678,
        budget_adjustment: 100000
      }, {
        month: 5,
        budget: 12340000,
        premium_rate: 10.125678,
        budget_adjustment: 100000
      }]
    }
  },
  methods: {
    // 计算预算溢价后=(预算+预算调整)*(1+预算率)
    computeBudgetPremium (row) {
      let result = (Number(row['budget']) + Number(row['budget_adjustment'])) * (1 + Number(row['premium_rate']) / 100)
      row['budget_premium'] = result
      return result
    },
    getTableData () {
      this.$alert(this.$refs.budgetTable.getTableData())
    }
  }
}
</script>

<style lang="less">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  h4 {
    margin-top: 20px;
  }
}
</style>
