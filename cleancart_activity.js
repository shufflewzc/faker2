/*

*/
let jdSignUrl = '' // 算法url
let Authorization = '' // 算法url token 有则填
let got = '';
try{
  got = require('got');
}catch(e){
  console.log('请添加依赖模块"got"')
}


jdSignUrl = process.env.gua_cleancart_SignUrl ? process.env.gua_cleancart_SignUrl : `${jdSignUrl}`
Authorization = process.env.gua_cleancart_Authorization ? process.env.gua_cleancart_Authorization : `${Authorization}`
if(Authorization && Authorization.indexOf("Bearer ") === -1) Authorization = `Bearer ${Authorization}`
let cookie = ''
let out = false

async function clean(ck,url,goodsArr){
  if(!got) return false
  return new Promise(async resolve => {
    let msg = false
    try{
      if(!ck) return ''
      if(!jdSignUrl) jdSignUrl = url
      cookie = ck
      // if(jdSignUrl.indexOf("://jd.smiek.tk/") > -1) {
      //   resolve(msg)
      //   return false
      // }
      let signBody = `{"homeWishListUserFlag":"1","userType":"0","updateTag":true,"showPlusEntry":"2","hitNewUIStatus":"1","cvhv":"049591","cartuuid":"hjudwgohxzVu96krv/T6Hg==","adid":""}`
      let body = await jdSign('cartClearQuery', signBody)
      if(out) return
      if(!body){
        console.log('获取不到算法')
        return
      }
      let data = await jdApi('cartClearQuery',body)
      let res = jsonParse(data)
      if(typeof res == 'object' && res){
        if(res.resultCode == 0){
          if(res.mainTitle.indexOf('购物车是空的') > -1){
            msg = []
          }else if(!res.clearCartInfo || !res.subTitle){
            console.log(res.mainTitle)
          }else{
            let num = 0
            if(res.subTitle){
              num = res.subTitle.match(/共(\d+)件商品/).length > 0 && res.subTitle.match(/共(\d+)件商品/)[1] || 0
              console.log(res.subTitle)
            }
            // console.log(`共${num}件商品`)
            if(num != 0){
              let operations = []
              let operNum = 0
              let goodsArrs = []
              let goodsArrsFlag = false
              for(let a of res.clearCartInfo || {}){
                // console.log(a.groupName)
                // if(a.groupName.indexOf('7天内加入购物车') > -1){
                  if(typeof goodsArr !== 'object'){
                    goodsArrs = [...goodsArrs,...a.groupDetails]
                    goodsArrsFlag = true
                  }else{
                    for(let s of a.groupDetails || []){
                      if(typeof goodsArr === 'object'){
                        let XBDetail = goodsArr.filter((x) => x.skuId === s.skuId)
                        if(XBDetail.length == 0){
                          // console.log(s.unusable,s.skuUuid,s.name)
                          operNum += s.clearSkus && s.clearSkus.length || 1;
                          operations.push({
                            "itemType": s.itemType+"",
                            "suitType": s.suitType,
                            "skuUuid": s.skuUuid+"",
                            "itemId": s.itemId || s.skuId,
                            "useUuid": typeof s.useUuid !== 'undefined' && s.useUuid || false
                          })
                        }
                      }
                    }
                  }
                // }
              }
              if(goodsArrsFlag){
                msg = goodsArrs || []
                return
              }
              console.log(`准备清空${operNum}件商品`)
              if(operations.length == 0){
                console.log(`清空${operNum}件商品|没有找到要清空的商品`)
              }else{
                let clearBody = `{"homeWishListUserFlag":"1","userType":"0","updateTag":false,"showPlusEntry":"2","hitNewUIStatus":"1","cvhv":"049591","cartuuid":"hjudwgohxzVu96krv/T6Hg==","operations":${jsonStringify(operations)},"adid":"","coord_type":"0"}`
                clearBody = await jdSign('cartClearRemove', clearBody)
                if(out) return
                if(!clearBody){
                  console.log('获取不到算法')
                }else{
                  let clearData = await jdApi('cartClearRemove',clearBody)
                  let clearRes = jsonParse(clearData)
                  if(typeof clearRes == 'object'){
                    if(clearRes.resultCode == 0) {
                      console.log(`清空${operNum}件商品|✅\n`)
                    }else if(clearRes.mainTitle){
                      console.log(`清空${operNum}件商品|${clearRes.mainTitle}\n`)
                    }else{
                      console.log(`清空${operNum}件商品|❌\n`)
                      console.log(clearData)
                    }
                  }else{
                    console.log(`清空${operNum}件商品|❌\n`)
                    console.log(clearData)
                  }
                }
              }
            }else if(res.mainTitle){
              if(res.mainTitle.indexOf('购物车是空的') > -1){
                msg = []
              }
              console.log(res.mainTitle)
            }else{
              console.log(data)
            }
          }
        }else{
          console.log(data)
        }
      }else{
        console.log(data)
      }
    }catch(e){
      console.log(e)
    } finally {
      resolve(msg);
    }
  })
}

function jdApi(functionId,body) {
  if(!functionId || !body) return
  return new Promise(resolve => {
    let opts = taskPostUrl(`/client.action?functionId=${functionId}`, body)
    got.post(opts).then(
      (resp) => {
        const {body:data } = resp
        try {
          let res = jsonParse(data);
          if(typeof res == 'object'){
            if(res.mainTitle) console.log(res.mainTitle)
            if(res.resultCode == 0){
              resolve(res);
            }else if (res.tips && res.tips.includes("正在努力加载")){
              console.log("请求太快，ip被限制了")
              out = true
            }
          }
        } catch (e) {
          console.log(e)
        } finally {
          resolve('');
        }
      },
      (err) => {
        try {
          const { message: error, response: resp } = err
          console.log(`${jsonStringify(error)}`)
          console.log(`${functionId} API请求失败，请检查网路重试`)
        } catch (e) {
          console.log(e)
        } finally {
          resolve('')
        }
      }
    )
  })
}

function jdSign(fn,body) {
  let sign = ''
  let flag = false
  try{
    const fs = require('fs');
    if (fs.existsSync('./gua_encryption_sign.js')) {
      const encryptionSign = require('./gua_encryption_sign');
      sign = encryptionSign.getSign(fn, body)
    }else{
      flag = true
    }
    sign = sign.data && sign.data.sign && sign.data.sign || ''
  }catch(e){
    flag = true
  }
  if(!flag) return sign
  if(!jdSignUrl.match(/^https?:\/\//)){
    console.log('请填写算法url')
    out = true
    return ''
  }
  return new Promise((resolve) => {
    let options = {
      url: jdSignUrl,
      body:`{"fn":"${fn}","body":${body}}`,
      headers: {
        'Accept':'*/*',
        "accept-encoding": "gzip, deflate, br",
        'Content-Type': 'application/json',
      },
      timeout:30000
    }
    if(Authorization) options["headers"]["Authorization"] = Authorization
    got.post(options).then(
      (resp) => {
        const {body:data } = resp
        try {
          let res = jsonParse(data)
          if(typeof res === 'object' && res){
            if(res.code && res.code == 200 && res.data){
              if(res.data.sign) sign = res.data.sign || ''
              if(sign != '') resolve(sign)
            }else{
              console.log(data)
            }
          }else{
            console.log(data)
          }
        } catch (e) {
          console.log(e)
        } finally {
          resolve('')
        }
      },
      (err) => {
        try {
          const { message: error, response: resp } = err
          console.log(`${jsonStringify(error)}`)
          console.log(`算法url API请求失败，请检查网路重试`)
        } catch (e) {
          console.log(e)
        } finally {
          resolve('')
        }
      }

    )
  })
}

function jsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}

function jsonStringify(arr) {
  try {
    return JSON.stringify(arr);
  } catch (e) {
    return arr;
  }
}

function taskPostUrl(url, body) {
  return {
    url: `https://api.m.jd.com${url}`,
    body: body,
    headers: {
      "Accept": "*/*",
      "Accept-Language": "zh-cn",
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive",
      "Content-Type": "application/x-www-form-urlencoded",
      'Cookie': `${cookie}`,
      "User-Agent": "JD4iPhone/167853 (iPhone; iOS; Scale/2.00)" ,
    }
  }
}

module.exports = {
  clean
}