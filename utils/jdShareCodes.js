// 从日志中获取互助码

// process.env.SHARE_CODE_FILE = "/scripts/logs/sharecode.log";
// process.env.JD_COOKIE = "cookie1&cookie2";

exports.JDZZ_SHARECODES = [];
exports.DDFACTORY_SHARECODES = [];
exports.DREAM_FACTORY_SHARE_CODES = [];
exports.PLANT_BEAN_SHARECODES = [];
exports.FRUITSHARECODES = [];
exports.PETSHARECODES = [];
exports.JDJOY_SHARECODES = [];

let fileContent = '';
if (process.env.SHARE_CODE_FILE) {
  try {
    const fs = require('fs');
    if (fs.existsSync(process.env.SHARE_CODE_FILE)) fileContent = fs.readFileSync(process.env.SHARE_CODE_FILE, 'utf8');
  } catch (err) {
    console.error(err)
  }
}
let lines = fileContent.split('\n');

let shareCodesMap = {
  "JDZZ_SHARECODES": [],
  "DDFACTORY_SHARECODES": [],
  "DREAM_FACTORY_SHARE_CODES": [],
  "PLANT_BEAN_SHARECODES": [],
  "FRUITSHARECODES": [],
  "PETSHARECODES": [],
  "JDJOY_SHARECODES": [],
};
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('京东赚赚')) {
    shareCodesMap.JDZZ_SHARECODES.push(lines[i].split('】')[1].trim());
  } else if (lines[i].includes('东东工厂')) {
    shareCodesMap.DDFACTORY_SHARECODES.push(lines[i].split('】')[1].trim());
  } else if (lines[i].includes('京喜工厂')) {
    shareCodesMap.DREAM_FACTORY_SHARE_CODES.push(lines[i].split('】')[1].trim());
  } else if (lines[i].includes('京东种豆得豆')) {
    shareCodesMap.PLANT_BEAN_SHARECODES.push(lines[i].split('】')[1].trim());
  } else if (lines[i].includes('东东农场')) {
    shareCodesMap.FRUITSHARECODES.push(lines[i].split('】')[1].trim());
  } else if (lines[i].includes('东东萌宠')) {
    shareCodesMap.PETSHARECODES.push(lines[i].split('】')[1].trim());
  } else if (lines[i].includes('crazyJoy')) {
    shareCodesMap.JDJOY_SHARECODES.push(lines[i].split('】')[1].trim());
  }
}
for (let key in shareCodesMap) {
  shareCodesMap[key] = shareCodesMap[key].reduce((prev, cur) => prev.includes(cur) ? prev : [...prev, cur], []); // 去重
}
let cookieCount = 0;
if (process.env.JD_COOKIE) {
  if (process.env.JD_COOKIE.indexOf('&') > -1) {
    cookieCount = process.env.JD_COOKIE.split('&').length;
  } else {
    cookieCount = process.env.JD_COOKIE.split('\n').length;
  }
}

for (let key in shareCodesMap) {
  exports[key] = [];
  if (shareCodesMap[key].length === 0) {
    continue;
  }
  for (let i = 0; i < cookieCount; i++) {
    exports[key][i] = shareCodesMap[key].sort(() => Math.random() - 0.5).join('@');
  }
}

