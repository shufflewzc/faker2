/**
 * 汪汪乐园-跑步+组队
 * 默认翻倍到0.04红包结束
 * export JD_JOY_PARK_RUN_ASSETS="0.04"
 * cron: 20 * * * *
 */

import {get, post, requireConfig, wait} from './TS_USER_AGENTS'
import {H5ST} from "./utils/h5st"
import {existsSync, readFileSync} from "fs";
import {getDate} from "date-fns";

let cookie: string = '', res: any = '', UserName: string = ''
let assets: number = 0.04, captainId: string = '', h5stTool: H5ST = new H5ST('b6ac3', 'jdltapp;', '1804945295425750')

!(async () => {
  let cookiesArr: string[] = await requireConfig()
  let account: { pt_pin: string, joy_park_run: number }[] = []
  if (existsSync('./utils/account.json')) {
    try {
      account = JSON.parse(readFileSync('./utils/account.json').toString())
    } catch (e) {
      console.log('./utils/account.json 加载出错')
    }
  }

  for (let [index, value] of cookiesArr.entries()) {
    cookie = value
    UserName = decodeURIComponent(cookie.match(/pt_pin=([^;]*)/)![1])
    console.log(`\n开始【京东账号${index + 1}】${UserName}\n`)

    assets = parseFloat(process.env.JD_JOY_PARK_RUN_ASSETS || '0.04')
    for (let user of account) {
      if (user.pt_pin === encodeURIComponent(UserName) && user.joy_park_run) {
        console.log('自定义终点', user.joy_park_run)
        assets = parseFloat(user.joy_park_run.toString())
        break
      }
    }

    try {
      res = await team('runningMyPrize', {"linkId": "L-sOanK_5RJCz7I314FpnQ", "pageSize": 20, "time": null, "ids": null})
      let sum: number = 0
      for (let t of res.data.detailVos) {
        if (getDate(new Date(t.createTime)) === new Date().getDate()) {
          sum = add(sum, t.amount)
        } else {
          break
        }
      }
      console.log('今日收益', sum)

      await h5stTool.__genAlgo()
      res = await team('runningTeamInfo', {"linkId": "L-sOanK_5RJCz7I314FpnQ"})
      if (!captainId && res.data.members.length === 0) {
        console.log('组队ID不存在,开始创建组队')
        captainId = res.data.captainId
      } else if (captainId && res.data.members.length === 0) {
        console.log('已有组队ID，未加入队伍')
        res = await team('runningJoinTeam', {"linkId": "L-sOanK_5RJCz7I314FpnQ", "captainId": captainId})
        if (res.code === 0) {
          console.log('组队成功')
          for (let member of res.data.members) {
            if (member.captain) {
              console.log('队长', member.nickName)
              break
            }
          }
          if (res.data.members.length === 6) {
            console.log('队伍已满')
            captainId = ''
          }
        }
      } else {
        console.log('已组队', res.data.members.length)
        console.log('战队收益', res.data.teamSumPrize)
      }
    } catch (e) {
      console.log('组队 Error', e)
    }

    try {
      res = await runningPageHome()
      console.log('🧧', res.data.runningHomeInfo.prizeValue)
      await wait(2000)

      console.log('能量恢复中', secondsToMinutes(res.data.runningHomeInfo.nextRunningTime / 1000), '能量棒', res.data.runningHomeInfo.energy)
      if (res.data.runningHomeInfo.nextRunningTime && res.data.runningHomeInfo.nextRunningTime / 1000 < 300) {
        await wait(res.data.runningHomeInfo.nextRunningTime)
        res = await runningPageHome()
        console.log('能量恢复中', secondsToMinutes(res.data.runningHomeInfo.nextRunningTime / 1000), '能量棒', res.data.runningHomeInfo.energy)
        await wait(1000)
      }

      if (!res.data.runningHomeInfo.nextRunningTime) {
        console.log('终点目标', assets)
        for (let i = 0; i < 10; i++) {
          res = await api('runningOpenBox', {"linkId": "L-sOanK_5RJCz7I314FpnQ"})
          if (parseFloat(res.data.assets) >= assets) {
            let assets: number = parseFloat(res.data.assets)
            res = await api('runningPreserveAssets', {"linkId": "L-sOanK_5RJCz7I314FpnQ"})
            console.log('领取成功', assets)
            break
          } else {
            if (res.data.doubleSuccess) {
              console.log('翻倍成功', parseFloat(res.data.assets))
              await wait(5000)
            } else if (!res.data.doubleSuccess && !res.data.runningHomeInfo.runningFinish) {
              console.log('开始跑步', parseFloat(res.data.assets))
              await wait(5000)
            } else {
              console.log('翻倍失败')
              break
            }
          }
          await wait(5000)
        }
      }

      res = await runningPageHome()
      console.log('🧧', res.data.runningHomeInfo.prizeValue)
      await wait(2000)
    } catch (e) {
      console.log('跑步 Error', e)
    }
  }
})()

async function api(fn: string, body: object) {
  let timestamp: number = Date.now(), h5st: string = ''
  if (fn === 'runningOpenBox') {
    h5st = h5stTool.__genH5st({
      appid: "activities_platform",
      body: JSON.stringify(body),
      client: "ios",
      clientVersion: "3.1.0",
      functionId: "runningOpenBox",
      t: timestamp.toString()
    })
  }
  let params: string = `functionId=${fn}&body=${JSON.stringify(body)}&t=${timestamp}&appid=activities_platform&client=ios&clientVersion=3.1.0&cthr=1`
  h5st && (params += `&h5st=${h5st}`)
  return await post('https://api.m.jd.com/', params, {
    'authority': 'api.m.jd.com',
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': cookie,
    'origin': 'https://h5platform.jd.com',
    'referer': 'https://h5platform.jd.com/',
    'user-agent': 'jdltapp;'
  })
}

async function runningPageHome() {
  return get(`https://api.m.jd.com/?functionId=runningPageHome&body=%7B%22linkId%22:%22L-sOanK_5RJCz7I314FpnQ%22,%22isFromJoyPark%22:true,%22joyLinkId%22:%22LsQNxL7iWDlXUs6cFl-AAg%22%7D&t=${Date.now()}&appid=activities_platform&client=ios&clientVersion=3.1.0`, {
    'Host': 'api.m.jd.com',
    'Origin': 'https://h5platform.jd.com',
    'User-Agent': 'jdltapp;',
    'Referer': 'https://h5platform.jd.com/',
    'Cookie': cookie
  })
}

async function team(fn: string, body: object) {
  let timestamp: number = Date.now()
  let h5st: string = ''
  return await get(`https://api.m.jd.com/?functionId=${fn}&body=${encodeURIComponent(JSON.stringify(body))}&t=${timestamp}&appid=activities_platform&client=ios&clientVersion=3.1.0&cthr=1&h5st=${h5st}`, {
    'Host': 'api.m.jd.com',
    'User-Agent': 'jdltapp;',
    'Origin': 'https://h5platform.jd.com',
    'X-Requested-With': 'com.jd.jdlite',
    'Referer': 'https://h5platform.jd.com/',
    'Cookie': cookie
  })
}

// 秒转时分秒
function secondsToMinutes(seconds: number) {
  let minutes: number = Math.floor(seconds / 60)
  let second: number = Math.floor(seconds % 60)
  return `${minutes}分${second}秒`
}

// 小数加法
function add(num1: number, num2: number) {
  let r1: number, r2: number
  try {
    r1 = num1.toString().split('.')[1].length
  } catch (e) {
    r1 = 0
  }
  try {
    r2 = num2.toString().split('.')[1].length
  } catch (e) {
    r2 = 0
  }
  let m: number = Math.pow(10, Math.max(r1, r2))
  return (num1 * m + num2 * m) / m
}