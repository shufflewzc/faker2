/**
 * 极速版-挖宝
 * 助力，挖宝，任务，提现
 * cron: 2 0,1,18 * * *
 * CK1     HW.ts -> 内部
 * CK2～n  内部   -> HW.ts
 */

import {get, getshareCodeHW, o2s, randomString, requireConfig, wait} from './TS_USER_AGENTS'
import {H5ST} from "./utils/h5st";

let cookie: string = '', res: any = '', UserName: string, data: any, h5stTool: any = new H5ST("ce6c2", "jdltapp;", "9929056438203725")

interface INVITE {
  inviter: string,
  inviteCode: string
}

let shareCodes: INVITE[] = [], shareCodesHW = [], shareCodesSelf: INVITE[] = []

!(async () => {
  let cookiesArr: string[] = await requireConfig()
  for (let [index, value] of cookiesArr.entries()) {
    try {
      cookie = value
      UserName = decodeURIComponent(cookie.match(/pt_pin=([^;]*)/)![1])
      console.log(`\n开始【京东账号${index + 1}】${UserName}\n`)

      await h5stTool.__genAlgo()
      res = await api('happyDigHome', {"linkId": "pTTvJeSTrpthgk9ASBVGsw"})
      console.log('助力码', res.data.markedPin, res.data.inviteCode)
      shareCodesSelf.push({inviter: res.data.markedPin, inviteCode: res.data.inviteCode})
    } catch (e) {
      console.log('error')
    }
    await wait(2000)
  }
  console.log('内部助力')
  o2s(shareCodesSelf)

  for (let [index, value] of cookiesArr.entries()) {
    try {
      cookie = value
      UserName = decodeURIComponent(cookie.match(/pt_pin=([^;]*)/)![1])
      console.log(`\n开始【京东账号${index + 1}】${UserName}\n`)

      await h5stTool.__genAlgo()
      if (shareCodesHW.length === 0) {
        shareCodesHW = await getshareCodeHW('fcwb')
      }
      if (index === 0 && cookiesArr.length === 1) {
        shareCodes = Array.from(new Set([...shareCodesHW, ...shareCodesSelf]))
      } else {
        shareCodes = Array.from(new Set([...shareCodesSelf, ...shareCodesHW]))
      }

      for (let code of shareCodesSelf) {
        console.log(`去助力 ${code.inviteCode}`)
        res = await api('happyDigHelp', {"linkId": "pTTvJeSTrpthgk9ASBVGsw", "inviter": code.inviter, "inviteCode": code.inviteCode})
        if (res.code === 0) {
          console.log('助力成功')
          await wait(2000)
          break
        } else if (res.code === 16143) {
          console.log('已助力')
        } else if (res.code === 16144) {
          console.log('上限')
          await wait(2000)
          break
        } else {
          o2s(res)
        }
        await wait(2000)
      }

      res = await api('apTaskList', {"linkId": "pTTvJeSTrpthgk9ASBVGsw"})
      await wait(1000)

      for (let t of res.data) {
        if (t.taskType === 'BROWSE_CHANNEL' && t.taskDoTimes === 0 && t.taskLimitTimes === 1) {
          console.log(t.taskShowTitle)
          data = await api('apDoTask', {"linkId": "pTTvJeSTrpthgk9ASBVGsw", "taskType": "BROWSE_CHANNEL", "taskId": t.id, "channel": 4, "itemId": encodeURIComponent(t.taskSourceUrl), "checkVersion": false})
          await wait(1000)
          if (data.success) {
            console.log('任务完成')
          } else {
            o2s(data, '任务失败')
          }
        }
      }
    } catch (e) {
      console.log('error', e)
      await wait(2000)
    }
  }

  for (let [index, value] of cookiesArr.entries()) {
    cookie = value
    UserName = decodeURIComponent(cookie.match(/pt_pin=([^;]*)/)![1])
    console.log(`\n开始【京东账号${index + 1}】${UserName}\n`)

    await h5stTool.__genAlgo()
    res = await api('happyDigHome', {"linkId": "pTTvJeSTrpthgk9ASBVGsw"})
    let blood: number = res.data.blood
    for (let i = 0; i < 4; i++) {
      try {
        if (blood <= 1) {
          console.log('能量剩余1，跳过 A')
          break
        }
        for (let j = 0; j < 4; j++) {
          if (blood <= 1) {
            console.log('能量剩余1，跳过 B')
            break
          }
          res = await api('happyDigDo', {"round": 1, "rowIdx": i, "colIdx": j, "linkId": "pTTvJeSTrpthgk9ASBVGsw"})
          o2s(res)

          if (res.data.chunk.type === 1) {
            console.log('挖到👎')
          } else if (res.data.chunk.type === 2) {
            console.log('挖到🧧', parseFloat(res.data.chunk.value))
          } else if (res.data.chunk.type === 4) {
            console.log('挖到💣')
          }
          await wait(1000)
          res = await api('happyDigHome', {"linkId": "pTTvJeSTrpthgk9ASBVGsw"})
          if (res.data.blood === 1) {
            blood = 1
            console.log('能量剩余1，退出')
            break
          }
          await wait(4000)
        }
      } catch (e) {
        console.log('error', res?.errMsg)
      }
    }
  }
})()

async function api(fn: string, body: object) {
  let timestamp: number = Date.now()
  let h5st: string = h5stTool.__genH5st({
    appid: 'activities_platform',
    body: JSON.stringify(body),
    client: 'H5',
    clientVersion: '1.0.0',
    functionId: fn,
    t: timestamp.toString(),
  })
  return await get(`https://api.m.jd.com/?functionId=${fn}&body=${encodeURIComponent(JSON.stringify(body))}&t=${timestamp}&appid=activities_platform&client=H5&clientVersion=1.0.0&h5st=${h5st}`, {
    'Host': 'api.m.jd.com',
    'Origin': 'https://bnzf.jd.com',
    'User-Agent': `jdapp;iPhone;10.2.2;14.3;${randomString(40)};M/5.0;network/wifi;ADID/;model/iPhone12,1;addressid/4199175193;appBuild/167863;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;`,
    'Referer': 'https://bnzf.jd.com/',
    'Cookie': cookie
  })
}