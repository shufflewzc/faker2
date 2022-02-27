/*
东东工厂互助码
此文件为Node.js专用。其他用户请忽略
支持京东N个账号
 */
//云服务器腾讯云函数等NOde.js用户在此处填写东东萌宠的好友码。
// 同一个京东账号的好友互助码用@符号隔开,不同京东账号之间用&符号或者换行隔开,下面给一个示例
// 如: 京东账号1的shareCode1@京东账号1的shareCode2&京东账号2的shareCode1@京东账号2的shareCode2
let shareCodes = [
  '',//账号一的好友shareCode,不同好友中间用@符号隔开
  '',//账号二的好友shareCode，不同好友中间用@符号隔开
]

// 从日志获取互助码
// const logShareCodes = require('./utils/jdShareCodes');
// if (logShareCodes.DDFACTORY_SHARECODES.length > 0 && !process.env.DDFACTORY_SHARECODES) {
//   process.env.DDFACTORY_SHARECODES = logShareCodes.DDFACTORY_SHARECODES.join('&');
// }

// 判断环境变量里面是否有东东工厂互助码
if (process.env.DDFACTORY_SHARECODES) {
  if (process.env.DDFACTORY_SHARECODES.indexOf('&') > -1) {
    console.log(`您的互助码选择的是用&隔开\n`)
    shareCodes = process.env.DDFACTORY_SHARECODES.split('&');
  } else if (process.env.DDFACTORY_SHARECODES.indexOf('\n') > -1) {
    console.log(`您的互助码选择的是用换行隔开\n`)
    shareCodes = process.env.DDFACTORY_SHARECODES.split('\n');
  } else {
    shareCodes = process.env.DDFACTORY_SHARECODES.split();
  }
} else {
  console.log(`由于您环境变量(DDFACTORY_SHARECODES)里面未提供助力码，故此处运行将会给脚本内置的码进行助力，请知晓！`)
}
for (let i = 0; i < shareCodes.length; i++) {
  const index = (i + 1 === 1) ? '' : (i + 1);
  exports['shareCodes' + index] = shareCodes[i];
}