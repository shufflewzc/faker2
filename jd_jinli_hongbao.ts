/**
 * 京东-锦鲤红包
 * 6点后做全部CK
 * cron: 2 0,1,6 * * *
 * CK1     HW.ts -> 内部
 * CK2～n  内部   -> HW.ts
 */

import axios from 'axios'
import {sendNotify} from './sendNotify'
import {get, getshareCodeHW, o2s, requireConfig, wait} from "./TS_USER_AGENTS"

let cookie: string, cookiesArr: string[] = [], res: any, UserName: string
let shareCodesSelf: string[] = [], shareCodes: string[] = [], shareCodesHW: string[] = [], fullCode: string[] = []
let min: number[] = [0.02, 0.12, 0.3, 0.4, 0.6, 0.7, 0.8, 1, 1.2, 2, 3.6], log: string

!(async () => {
  cookiesArr = await requireConfig()
  cookiesArr = cookiesArr.slice(0, 1)
  await join()
  await help()

  cookiesArr = await requireConfig()
  cookiesArr = cookiesArr.slice(0, 9)
  if (new Date().getHours() === 0)
    await join()
  await getShareCodeSelf()
  await help()
  await open(0)
})()

async function join() {
  for (let [index, value] of cookiesArr.entries()) {
    try {
      cookie = value
      UserName = decodeURIComponent(cookie.match(/pt_pin=([^;]*)/)![1])
      console.log(`\n开始【京东账号${index + 1}】${UserName}\n`)
      for (let i = 0; i < 5; i++) {
        try {
          log = await getLog()
          res = await api('h5launch', {followShop: 0, random: log.match(/"random":"(\d+)"/)[1], log: log.match(/"log":"(.*)"/)[1], sceneid: 'JLHBhPageh5'})
          console.log('活动初始化：', res.data.result.statusDesc)
          if (res.rtn_code !== 403) {
            break
          }
        } catch (e) {
          console.log('log error', e)
          await wait(3000)
        }
      }
    } catch (e) {
      console.log(e)
    }
    await wait(1000)
  }
}

async function getShareCodeSelf(one: boolean = false) {
  if (one) {
    res = await api('h5activityIndex', {"isjdapp": 1})
    return res?.data?.result?.redpacketInfo?.id
  } else {
    for (let [index, value] of cookiesArr.entries()) {
      try {
        cookie = value
        UserName = decodeURIComponent(cookie.match(/pt_pin=([^;]*)/)![1])
        console.log(`\n开始【京东账号${index + 1}】${UserName}\n`)
        res = await api('h5activityIndex', {"isjdapp": 1})
        console.log('ID：', res.data.result.redpacketInfo.id)
        shareCodesSelf.push(res.data.result.redpacketInfo.id)
      } catch (e) {
        console.log('getShareCodeSelf error', e)
      }
      await wait(1000)
    }
    o2s(shareCodesSelf)
  }
}

async function open(autoOpen: number) {
  for (let [index, value] of cookiesArr.entries()) {
    try {
      cookie = value
      UserName = decodeURIComponent(cookie.match(/pt_pin=([^;]*)/)![1])
      console.log(`\n开始【京东账号${index + 1}】${UserName}\n`)
      let j: number = 1
      res = await api('h5activityIndex', {"isjdapp": 1})
      for (let t of res.data.result.redpacketConfigFillRewardInfo) {
        if (t.packetStatus === 1) {
          console.log(`${j} 可拆`)
        } else if (t.packetStatus === 2) {
          console.log(`${j} 已拆`)
        }
        j++
      }
      console.log('')

      j = 1
      for (let t of res.data.result.redpacketConfigFillRewardInfo) {
        if (t.packetStatus === 1) {
          if (autoOpen) {
            log = await getLog()
            res = await api('h5receiveRedpacketAll', {random: log.match(/"random":"(\d+)"/)[1], log: log.match(/"log":"(.*)"/)[1], sceneid: 'JLHBhPageh5'})
            console.log('打开成功', parseFloat(res.data.result.discount))
            if (!min.includes(parseFloat(res.data.result.discount))) {
              await sendNotify('锦鲤红包', `账号${index + 1} ${UserName}\n${t.packetAmount}`)
            }
            await wait(6000)
          }
        } else if (![1, 2].includes(t.packetStatus)) {
          console.log(`${j}`, t.hasAssistNum, '/', t.requireAssistNum)
        }
        j++
      }
    } catch (e) {
      console.log(e)
    }
    await wait(3000)
  }
}

async function help() {
  for (let [index, value] of cookiesArr.entries()) {
    try {
      cookie = value
      UserName = decodeURIComponent(cookie.match(/pt_pin=([^;]*)/)![1])
      if (shareCodesHW.length === 0) {
        shareCodesHW = await getshareCodeHW('jlhb')
      }
      if (index === 0) {
        shareCodes = Array.from(new Set([...shareCodesHW, ...shareCodesSelf]))
      } else {
        shareCodes = Array.from(new Set([...shareCodesSelf, ...shareCodesHW]))
      }

      let me: string = await getShareCodeSelf(true)
      let success: boolean = false
      for (let code of shareCodes) {
        if (success) break
        if (!fullCode.includes(code) && code !== me) {
          console.log(`账号${index + 1} ${UserName} 去助力 ${code} ${shareCodesSelf.includes(code) ? '*内部*' : ''}`)
          for (let i = 0; i < 5; i++) {
            log = await getLog()
            res = await api('jinli_h5assist', {"redPacketId": code, "followShop": 0, random: log.match(/"random":"(\d+)"/)[1], log: log.match(/"log":"(.*)"/)[1], sceneid: 'JLHBhPageh5'})
            if (res.rtn_code === 403) {
              console.log('log error')
              await wait(5000)
            } else {
              if (res.data.result.status === 0) {
                console.log('助力成功：', parseFloat(res.data.result.assistReward.discount))
                success = true
                await wait(45000)
                break
              } else if (res.data.result.status === 3) {
                console.log('今日助力次数已满')
                success = true
                await wait(45000)
                break
              } else {
                console.log('助力结果：', res.data.result.statusDesc)
                if (res.data.result.statusDesc === '啊偶，TA的助力已满，开启自己的红包活动吧~') {
                  fullCode.push(code)
                }
                await wait(45000)
              }
            }
          }
        }
      }
    } catch (e) {
      console.log(e)
    }
    await wait(6000)
  }
}

async function api(fn: string, body: object) {
  let {data} = await axios.post(`https://api.m.jd.com/api?appid=jinlihongbao&functionId=${fn}&loginType=2&client=jinlihongbao&clientVersion=10.2.4&osVersion=AndroidOS&d_brand=Xiaomi&d_model=Xiaomi`, `body=${encodeURIComponent(JSON.stringify(body))}`, {
    headers: {
      "origin": "https://h5.m.jd.com",
      "referer": "https://h5.m.jd.com/babelDiy/Zeus/2NUvze9e1uWf4amBhe1AV6ynmSuH/index.html",
      'Content-Type': 'application/x-www-form-urlencoded',
      "X-Requested-With": "com.jingdong.app.mall",
      "User-Agent": "Mozilla/5.0 (Linux; U; Android 8.0.0; zh-cn; Mi Note 2 Build/OPR1.170623.032) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.128 Mobile Safari/537.36 XiaoMi/MiuiBrowser/10.1.1",
      "Cookie": cookie,
    }
  })
  return data
}

async function getLog() {
  let data = await get(`https://api.jdsharecode.xyz/api/jlhb`)
  if (data !== 1 && data !== '1') {
    return data
  } else {
    console.log('No log')
    process.exit(0)
  }
}