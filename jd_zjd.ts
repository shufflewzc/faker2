/**
 * const $ = new Env('赚喜豆-TS版');
 * cron: 15,30,45 0 * * *
 * 修改自HW大佬，默认开团前7，需要请自行修改
 * 修改自HW大佬，纯内部助力，定时请自行修改，频繁跑火爆黑IP
 * 修改自HW大佬，建议使用原作者版本，衰仔，明白了吗？
 */

import axios from "axios";
import {zjdInit, zjdH5st} from "./function/zjdtool.js";
import {o2s, wait, requireConfig} from "./function/TS_USER_AGENTS";
import {SHA256} from "crypto-js";

let cookie: string = '', res: any = '', UserName: string
let shareCodeSelf: Tuan[] = [], shareCode: Tuan[] = []

interface Tuan {
  activityIdEncrypted: string, // id
  assistStartRecordId: string, // assistStartRecordId
  assistedPinEncrypted: string, // encPin unique
}

!(async () => {
  let cookiesArr: string[] = await requireConfig(false)
  for (let [index, value] of cookiesArr.entries()) {
	if(index < 7){
	try {
      await zjdInit()
      cookie = value

      UserName = decodeURIComponent(cookie.match(/pt_pin=([^;]*)/)![1])
      console.log(`\n开始【京东账号${index + 1}】${UserName}\n`)

      res = await api('distributeBeanActivityInfo', {"paramData": {"channel": "FISSION_BEAN"}})
      // o2s(res)
      await wait(1000)

      if (res.data.assistStatus === 1) {
        // 已开，没满
        console.log('已开团，', res.data.assistedRecords.length, '/', res.data.assistNum, '，剩余', Math.round(res.data.assistValidMilliseconds / 1000 / 60), '分钟')
        shareCodeSelf.push({
          activityIdEncrypted: res.data.id,
          assistStartRecordId: res.data.assistStartRecordId,
          assistedPinEncrypted: res.data.encPin,
        })
      } else if (res.data.assistStatus === 2 && res.data.canStartNewAssist) {
        // 没开团
        res = await api('vvipclub_distributeBean_startAssist', {"activityIdEncrypted": res.data.id, "channel": "FISSION_BEAN"})
        // o2s(res)
        await wait(1000)
        if (res.success) {
          console.log(`开团成功，结束时间：${res.data.endTime}`)
          res = await api('distributeBeanActivityInfo', {"paramData": {"channel": "FISSION_BEAN"}})
          shareCodeSelf.push({
            activityIdEncrypted: res.data.id,
            assistStartRecordId: res.data.assistStartRecordId,
            assistedPinEncrypted: res.data.encPin,
          })
          await wait(1000)
        }
      } else if (res.data.assistedRecords.length === res.data.assistNum) {
        console.log('已成团')
        if (res.data.canStartNewAssist) {
          res = await api('vvipclub_distributeBean_startAssist', {"activityIdEncrypted": res.data.id, "channel": "FISSION_BEAN"})
          await wait(1000)
          if (res.success) {
            console.log(`开团成功，结束时间：${res.data.endTime}`)
            res = await api('distributeBeanActivityInfo', {"paramData": {"channel": "FISSION_BEAN"}})
            shareCodeSelf.push({
              activityIdEncrypted: res.data.id,
              assistStartRecordId: res.data.assistStartRecordId,
              assistedPinEncrypted: res.data.encPin,
            })
            await wait(1000)
          }
        }
      } else if (!res.data.canStartNewAssist) {
        console.log('不可开团')
      }
	await wait(1000)
    } catch (e) {
      continue
    }
	}
  }

  console.log('内部助力：', shareCodeSelf)
  for (let [index, value] of cookiesArr.entries()) {
	try {
	cookie = value
    UserName = decodeURIComponent(cookie.match(/pt_pin=([^;]*)/)![1])
    console.log(`\n开始【京东账号${index + 1}】${UserName}\n`)
	shareCode = Array.from(new Set([...shareCodeSelf]))

    await zjdInit()
    for (let code of shareCode) {
      try {
        console.log(`账号${index + 1} ${UserName} 去助力 ${code.assistedPinEncrypted.replace('\n', '')}`)
        res = await api('vvipclub_distributeBean_assist', {"activityIdEncrypted": code.activityIdEncrypted, "assistStartRecordId": code.assistStartRecordId, "assistedPinEncrypted": code.assistedPinEncrypted, "channel": "FISSION_BEAN", "launchChannel": "undefined"})
        if (res.resultCode === '9200008') {
          console.log('不能助力自己')
        } else if (res.resultCode === '2400203' || res.resultCode === '90000014') {
          console.log('上限')
          break
        } else if (res.resultCode === '2400205') {
          console.log('对方已成团')
        } else if (res.resultCode === '9200011') {
          console.log('已助力过')
        } else if (res.success) {
          console.log('助力成功')
        } else {
          console.log('error', JSON.stringify(res))
        }
      } catch (e) {
        console.log(e)
        break
      }
      await wait(2000)
    }
    await wait(2000)
    } catch (e) {
      console.log(e)
    }
  }
})()

async function api(fn: string, body: object) {
  let h5st = zjdH5st({
    'fromType': 'wxapp',
    'timestamp': Date.now(),
    'body0': JSON.stringify(body),
    'appid': 'swat_miniprogram',
    'body': SHA256(JSON.stringify(body)).toString(),
    'functionId': fn,
  })
  let {data} = await axios.post(`https://api.m.jd.com/api?functionId=${fn}&fromType=wxapp&timestamp=${Date.now()}`, `functionId=distributeBeanActivityInfo&body=${encodeURIComponent(JSON.stringify(body))}&appid=swat_miniprogram&h5st=${encodeURIComponent(h5st)}`, {
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E217 MicroMessenger/6.8.0(0x16080000) NetType/WIFI Language/en Branch/Br_trunk MiniProgramEnv/Mac',
      'referer': 'https://servicewechat.com/wxa5bf5ee667d91626/173/page-frame.html',
      'Cookie': cookie,
    }
  })
  return data
}