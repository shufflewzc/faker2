/*
 * @Author: chenghao
 * @Date: 2022-02-14 10:19:21
 * @Last Modified by: chenghao
 * @Last Modified time: 2022-03-20 13:57:10
 * @Desc: 青龙依赖
 * @From: https://github.com/whyour/qinglong/issues/1369
 */
const axios = require('axios')
const QL_URL = 'http://127.0.0.1:5700'
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

/**
 *获取青龙token
 */
function getQLToken() {
  return new Promise((resolve, reject) => {
    axios
      .get(
        QL_URL +
          `/open/auth/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
      )
      .then(res => {
        if (res.data.code === 200) {
          resolve(res.data.data.token)
        } else {
          reject(res.data.message)
        }
      })
  })
}

/**
 *构造请求头
 * @returns headers
 */
async function generateRequestHeader() {
  return new Promise(async resolve => {
    const token = await getQLToken()
    resolve({
      Authorization: 'Bearer ' + token,
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4577.63 Safari/537.36',
      'Content-Type': 'application/json;charset=UTF-8',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'zh-CN,zh;q=0.9'
    })
  })
}

/**
 *初始化请求实例
 * @returns axios instance
 */
async function init() {
  if (!CLIENT_ID || !CLIENT_SECRET)
    return Promise.reject('未获取到 CLIENT_ID 或 CLIENT_SECRET')
  const headers = await generateRequestHeader()
  return new Promise(resolve => {
    resolve(
      axios.create({
        baseURL: QL_URL,
        timeout: 10000,
        headers
      })
    )
  })
}

/**
 *
 *获取青龙环境变量
 * @param {*} instance
 * @returns [] envlist
 */
function getQLEnvs(instance, searchValue = 'JD_COOKIE') {
  return new Promise(resolve => {
    instance
      .get('/open/envs', {
        params: {
          searchValue,
          t: +new Date()
        }
      })
      .then(res => {
        resolve(res.data.data.filter(v => v.status === 0))
      })
  })
}

/**
 *创建ck环境变量
 * @param {*} instance
 * @param {*} [ck=[]]
 * @returns
 */
function createCkEnv(instance, ck = []) {
  return new Promise(resolve => {
    instance
      .post(`/open/envs?t=${+new Date()}`, ck)
      .then(res => {
        resolve(res.data)
      })
      .catch(error => {
        console.log(error.response.data)
      })
  })
}

/**
 * 更新环境变量
 * @param {*} instance
 * @param {*} ck
 * @returns
 */
function updateCkEnv(instance, ck = {}) {
  return new Promise(resolve => {
    instance
      .put(`/open/envs?t=${+new Date()}`, ck)
      .then(res => {
        resolve(res.data)
      })
      .catch(error => {
        console.log(error.response.data)
      })
  })
}

/**
 * 删除环境变量
 * @param {*} instance
 * @param {*} ckIds
 * @returns
 */
function deleteCkEnv(instance, ckIds = []) {
  return new Promise(resolve => {
    instance({
      method: 'delete',
      url: `/open/envs?t=${+new Date()}`,
      data: ckIds
    }).then(resolve)
  })
}

/**
 *切换ck状态
 * @param {*} instance
 * @param {*} path
 * @param {*} id
 * @returns
 */
function toggleCKEnv(instance, id, path = 'enable') {
  return new Promise(resolve => {
    instance.put(`/open/envs/${path}?t=${+new Date()}`, [id]).then(res => {
      resolve(res.data)
    })
  })
}

exports.createEnv = createCkEnv
exports.deleteEnv = deleteCkEnv
exports.getEnv = getQLEnvs
exports.initInstance = init
exports.updateCkEnv = updateCkEnv
exports.toggleCKEnv = toggleCKEnv
