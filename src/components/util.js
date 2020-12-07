// 深拷贝
const deepCopy = obj => {
  let objArray = Array.isArray(obj) ? [] : {}
  if (obj && typeof obj === 'object') {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] && typeof obj[key] === 'object') {
          objArray[key] = deepCopy(obj[key])
        } else {
          objArray[key] = obj[key]
        }
      }
    }
  }
  return objArray
}

// 数字格式化：千分位，可转换单位为“万”，四舍五入取整或保留两位小数
const formatNum = (num, convert = false, thousand = true, decimal = false) => {
  if (!isNaN(num)) {
    if (convert) {
      num = num / 10000
    }
    num = decimal ? Math.round(num * 100) / 100 : Math.round(num)
    if (thousand) {
      num = (num + '').replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, '$1,')
    }
  }
  return num
}

// 小数格式化：保留两位小数，可加百分比符号
const formatDecimal = (num, percent = true) => {
  if (!isNaN(num)) {
    num = Math.round(num * 100) / 100
    if (percent) {
      num = num + '%'
    }
  }
  return num
}

export var Util = {
  deepCopy,
  formatNum,
  formatDecimal
}
