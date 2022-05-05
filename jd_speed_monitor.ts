import axios from 'axios'
import {sendNotify} from './sendNotify';
import {requireConfig} from './TS_USER_AGENTS'

const CryptoJS = require('crypto-js');
let cookie: string = '', UserName: string

!(async () => {
  let cookiesArr: string[] = await requireConfig()
  cookie = cookiesArr[Math.random() * cookiesArr.length | 0]
  UserName = decodeURIComponent(cookie.match(/pt_pin=([^;]*)/)![1])
  console.log(`<Start> ${UserName}\n`)

  let t: number = Date.now(), fn: string = 'MyAssetsService.execute', body: object = {"method": "goldShopPage", "data": {"channel": 1}}
  let params: string = `lite-android&${JSON.stringify(body)}&android&3.1.0&${fn}&${t}&846c4c32dae910ef`
  let key = CryptoJS.HmacSHA256(params, '12aea658f76e453faf803d15c40a72e0').toString()

  let {data} = await axios.get(`https://api.m.jd.com/api?functionId=${fn}&body=${encodeURIComponent(JSON.stringify(body))}&appid=lite-android&client=android&uuid=846c4c32dae910ef&clientVersion=3.1.0&t=${t}&sign=${key}`, {
    headers: {
      'Host': 'api.m.jd.com',
      'accept': '*/*',
      'kernelplatform': 'RN',
      'user-agent': 'JDMobileLite/3.1.0 (iPad; iOS 14.4; Scale/2.00)',
      'accept-language': 'zh-Hans-CN;q=1, ja-CN;q=0.9',
      'Cookie': cookie
    }
  })

  for (let t of data.data.gears) {
    console.log(t.amount)
    if (t.amount === '50' || t.amount === '10') {
      await sendNotify('极速版金币', `${t.amount}🧧`)
      break
    }
  }
})()
