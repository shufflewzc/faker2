/**
 * const $ = new Env('京东-锦鲤红包');
 * 做任务、助力、开红包
 * cron: 1 0,18 * * *
 * 修改自HW大佬，自用，仅助力前7账号，纯内部互助
 */

import axios from 'axios';
import {logs} from './function/jinli_log';
import {getRandomNumberByRange, getshareCodeHW, o2s, randomString, requireConfig, wait} from "./function/TS_USER_AGENTS";

let cookie: string = '', res: any = '', UserName: string, UA: string = ''
let shareCodesSelf: string[] = [], shareCodes: string[] = [], fullCode: string[] = []
let min: number[] = [0.02, 0.12, 0.3, 0.6, 0.7, 0.8, 1, 2], log: string = '', logIndex: number = 10

!(async () => {
  let cookiesArr: string[] = await requireConfig(false);
  for (let [index, value] of cookiesArr.entries()) {
	if(index < 7){
    try {
	  cookie = value;
      UserName = decodeURIComponent(cookie.match(/pt_pin=([^;]*)/)![1])
      console.log(`\n开始【京东账号${index + 1}】${UserName}\n`);
      UA = `jdltapp;iPhone;3.1.0;${Math.ceil(Math.random() * 4 + 10)}.${Math.ceil(Math.random() * 4)};${randomString(40)}`
      log = logs[getRandomNumberByRange(0, logs.length - 1)]
      let random = log.match(/"random":"(\d+)"/)[1], log1 = log.match(/"log":"(.*)"/)[1]
      res = await api('h5launch', {"followShop": 0, "random": random, "log": log1, "sceneid": "JLHBhPageh5"})
      console.log('活动初始化：', res.data.result.statusDesc)
      await wait(1000)

      res = await api('h5activityIndex', {"isjdapp": 1})
      console.log('红包ID：', res.data.result.redpacketInfo.id)
      shareCodesSelf.push(res.data.result.redpacketInfo.id)
      await wait(1000)
	} catch (e) {
      console.log(e)
    }
  }
  }

  await wait(2000)

  console.log('内部助力：', shareCodesSelf)
  for (let [index, value] of cookiesArr.entries()) {
    try {
      cookie = value;
      UserName = decodeURIComponent(cookie.match(/pt_pin=([^;]*)/)![1])
      shareCodes = Array.from(new Set([...shareCodesSelf]))
      for (let code of shareCodes) {
        if (!fullCode.includes(code)) {
          UA = `jdltapp;iPhone;3.1.0;${Math.ceil(Math.random() * 4 + 10)}.${Math.ceil(Math.random() * 4)};${randomString(40)}`
          log = logs[getRandomNumberByRange(0, logs.length - 1)]
          let random = log.match(/"random":"(\d+)"/)[1], log1 = log.match(/"log":"(.*)"/)[1]
          console.log(`账号${index + 1} ${UserName} 去助力 ${code} ${shareCodesSelf.includes(code) ? '*内部*' : ''}`)

          res = await api('jinli_h5assist', {"redPacketId": code, "followShop": 0, "random": random, "log": log1, "sceneid": "JLHBhPageh5"})
          o2s(res, 'jinli_h5assist')

          if (res.data.result.status === 0) {
            console.log('助力成功：', parseFloat(res.data.result.assistReward.discount))
            await wait(1000)
            break
          } else if (res.data.result.status === 3) {
            console.log('今日助力次数已满')
            break
          } else {
            console.log('助力结果：', res.data.result.statusDesc)
            if (res.data.result.statusDesc === '啊偶，TA的助力已满，开启自己的红包活动吧~') {
              fullCode.push(code)
            }
          }
          await wait(1000)
        } else {
          console.log(`Code ${code} 已被助满`)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  for (let [index, value] of cookiesArr.entries()) {
	if(index < 7){	
	try {
      cookie = value
      UserName = decodeURIComponent(cookie.match(/pt_pin=([^;]*)/)![1])
      console.log(`\n开始【京东账号${index + 1}】${UserName}\n`);
      UA = `jdltapp;iPhone;3.1.0;${Math.ceil(Math.random() * 4 + 10)}.${Math.ceil(Math.random() * 4)};${randomString(40)}`
      log = logs[getRandomNumberByRange(0, logs.length - 1)]
      let random = log.match(/"random":"(\d+)"/)[1], log1 = log.match(/"log":"(.*)"/)[1]
      // 做任务
      /*
      res = await api('taskHomePage', {})
      await wait(1000)
      for (let t of res.data.result.taskInfos) {
        if (!t.alreadyReceivedCount || t.alreadyReceivedCount < t.requireCount) {
          if ([2, 3, 4, 5, 8].includes(t.taskType)) {
            res = await api('startTask', {"taskType": t.taskType, "random": getRandomNumberByRange(36135846, 74613584), "log": `${Date.now()}~1orj8k3`, "sceneid": "JLHBhPageh5"})
            console.log(t.title, res.data.biz_msg)
            await wait(1000)
            res = await api('getTaskDetailForColor', {taskType: t.taskType})
            await wait(1000)
            for (let tp of res.data.result.advertDetails) {
              if (tp.status === 0) {
                res = await api('taskReportForColor', {"taskType": t.taskType, "detailId": tp.id})
                console.log(t.title, tp.name, res.data.biz_msg)
                await wait(1000)
              }
            }
          }
        }
        if (t.innerStatus === 3) {
          res = await api('h5receiveRedpacketAll', {"taskType": t.taskType, "random": getRandomNumberByRange(36135846, 74613584), "log": `${Date.now()}~138q6w6`, "sceneid": "JLHBhPageh5"})
          console.log(`${t.title} 打开成功，获得`, parseFloat(res.data.result.discount))
          if (!min.includes(parseFloat(res.data.result.discount)))
            await sendNotify(`锦鲤红包`, `账号${index + 1} ${UserName}\n${res.data.result.discount}`)
          await wait(1000)
        }
      }
      await wait(1000)


      // 打开任务红包
      res = await api('taskHomePage', {})
      await wait(1000)
      for (let t of res.data.result.taskInfos) {
        if (t.innerStatus === 3) {
          res = await api('h5receiveRedpacketAll', {"taskType": t.taskType, "random": getRandomNumberByRange(36135846, 74613584), "log": `${Date.now()}~138q6w6`, "sceneid": "JLHBhPageh5"})
          console.log(`${t.title} 打开成功，获得`, parseFloat(res.data.result.discount))
          if (!min.includes(parseFloat(res.data.result.discount)))
            await sendNotify(`锦鲤红包`, `账号${index + 1} ${UserName}\n${res.data.result.discount}`)
          await wait(1000)
        }
      }
      await wait(2000)
       */

      // 打开助力红包
      let j: number = 1
      res = await api('h5activityIndex', {"isjdapp": 1})
      for (let t of res.data.result.redpacketConfigFillRewardInfo) {
        if (t.packetStatus === 2) {
          console.log(`红包${j}已拆过，获得`, t.packetAmount)
        } else if (t.packetStatus === 1) {
          console.log(`红包${j}可拆`)
          res = await api('h5receiveRedpacketAll', {"random": random, "log": log1, "sceneid": "JLHBhPageh5"})
          console.log(res.data.biz_msg, parseFloat(res.data.result.discount))
          await wait(1000)
        } else {
          console.log(`${j}`, t.hasAssistNum, '/', t.requireAssistNum)
        }
        j++
      }
    }

	catch (e) {
      console.log(e)
    }
    await wait(1000)
  }
  }
})()

async function api(fn: string, body: object, retry: number = 0) {
  let {data} = await axios.post(`https://api.m.jd.com/api?appid=jinlihongbao&functionId=${fn}&loginType=2&client=jinlihongbao&clientVersion=10.2.4&osVersion=AndroidOS&d_brand=Xiaomi&d_model=Xiaomi`, `body=${encodeURIComponent(JSON.stringify(body))}`, {
    headers: {
      "Cookie": cookie,
      "origin": "https://h5.m.jd.com",
      "referer": "https://h5.m.jd.com/babelDiy/Zeus/2NUvze9e1uWf4amBhe1AV6ynmSuH/index.html",
      'Content-Type': 'application/x-www-form-urlencoded',
      "X-Requested-With": "com.jingdong.app.mall",
      "User-Agent": UA,
    }
  })
  await wait(5000)
  if (data.rtn_code === 403 && retry < 3) {
    console.log('retry...')
    await wait(1000)
    log = logs[getRandomNumberByRange(0, logs.length - 1)]
    body['random'] = log.match(/"random":"(\d+)"/)[1]
    body['log'] = log.match(/"log":"(.*)"/)[1]
    await wait(5000)
    await api(fn, body, ++retry)
  }
  return data
}
