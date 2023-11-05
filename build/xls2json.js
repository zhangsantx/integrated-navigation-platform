const path = require('path')
const fs = require('fs')
const xlsToJson = require('xls-to-json')
const xlsFiles = fs.readdirSync(path.resolve(__dirname, '../xls'))

const resultMap = new Map()
// 需要读取的xls配置 {xls名称，转换json配置}
resultMap.set('产品', {
  type: 'product', // 类型
  requiredFields: ['维度'], // 必填字段校验函数
  groupKey: '维度', // 分组key
  showLogo: false // 是否需要logo
})
resultMap.set('文档', {
  type: 'document', // 类型
  requiredFields: [''], // 必填字段校验函数
  groupKey: '维度', // 分组key
  showLogo: false // 是否需要logo
})

/**
 * 必填字段校验
 * @param {*} sourceData 数据源
 * @param {*} fieldNames 必填字段
 * @returns
 */
function handleRequiredCheck(sourceData, fieldNames) {
  return sourceData.map((item) => {
    fieldNames.forEach((name) => {
      if (!item[name]) {
        // 如果必填字段未填，默认赋值为未知
        item[name] = '未知'
      }
    })
    return item
  })
}

/**
 * 根据指定字段对数组进行分组
 * @param {*} array 数组
 * @param {*} key 分组字段
 * @returns
 */
const groupBy = (array, key) => {
  return array?.reduce((result, item) => {
    const groupKey = item[key]
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {})
}

/** 根据name字段排序 */
const sortJson = (json) => {
  return json.data.sort((a, b) => {
    const nameA = a.name.toLowerCase()
    const nameB = b.name.toLowerCase()
    return nameA.localeCompare(nameB, 'zh-Hans-CN', { sensitivity: 'accent' })
  })
}

/**
 * 删除指定目录下所有子文件
 * @param {*} path 目录
 */
function emptyDir(dirPath) {
  const files = fs.readdirSync(__dirname, dirPath)
  files.forEach((file) => {
    const filePath = path.resolve(__dirname, `${dirPath}/${file}`)
    const stats = fs.statSync(filePath)
    if (stats.isDirectory()) {
      emptyDir(filePath)
    }
  })
}

/**
 * 删除指定目录下所有子文件和子目录
 * @param {*} dirPath 目录路径
 */
function emptyDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath)
    files.forEach((file) => {
      const filePath = path.join(dirPath, file)
      const stats = fs.statSync(filePath)
      if (stats.isDirectory()) {
        emptyDir(filePath)
        fs.rmdirSync(filePath)
      } else {
        fs.unlinkSync(filePath)
      }
    })
  }
}

/**
 * 写入结果
 * @param {*} fileInfo 文件信息
 * @param {*} result 结果内容
 * @param {*} dirPath 写入目录地址
 */
const writeResults = (fileInfo, result, dirPath = '../src/config') => {
  // 检查输出json文件目录是否存在，不存在则创建
  const outputDir = path.resolve(__dirname, dirPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir)
  }

  // 删除输出目录中的所有文件
  emptyDir(outputDir)

  fs.writeFile(
    path.resolve(__dirname, `${dirPath}/${fileInfo?.type}.json`),
    JSON.stringify(sortJson(result)),
    {
      encoding: 'utf8',
      flag: 'w'
    },
    (err) => {
      if (err) {
        console.log('\x1b[31m%s\x1b[0m', `error ${fileInfo?.type}.json 写入失败`, err)
      } else {
        console.log('\x1b[32m%s\x1b[0m', `success ${fileInfo?.type}.json 写入完成`)
      }
    }
  )
}

xlsFiles.forEach((file, fileIndex) => {
  xlsToJson(
    {
      input: path.resolve(__dirname, `../xls/${file}`),
      allowEmptyKey: false
    },
    function (err, sourceData) {
      if (err) {
        console.log(err)
      } else {
        const fileName = file.slice(0, -5)
        if (fileName === '.DS_') {
          return
        }

        const fileInfo = resultMap.get(fileName)

        if (fileInfo) {
          const logo = fileInfo?.showLogo ? fs.readdirSync(path.resolve(__dirname, `../src/assets/logos/${fileInfo.type}`)) : null
          const result = { data: [], logo }

          // 过滤空数据
          sourceData = sourceData?.filter((item) => Object.values(item).join(''))

          // 处理必填字段为空
          if (fileInfo.requiredFields.length > 0) {
            sourceData = handleRequiredCheck(sourceData, fileInfo.requiredFields)
          }

          // 按照指定字段进行分组
          const groupedJson = groupBy(sourceData, fileInfo.groupKey)
          Object.keys(groupedJson)?.forEach((key) => {
            result.data.push({ name: key, children: groupedJson[key] })
          })

          console.log('\x1b[34m%s\x1b[0m', `info ${file} 转换成功`)

          // 写入结果
          writeResults(fileInfo, result)
        }
      }
    }
  )
})
