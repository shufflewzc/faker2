/**
 * 汪汪乐园-跑步+组队
 * cron: 20 * * * *
 * export FP_448DE=""  // url: runningMyPrize => h5st.split(';')[1]
 * export FP_B6AC3=""  // url: runningOpenBox => h5st.split(';')[1]
 */

import {H5ST} from "./utils/h5st"
import {getDate} from "date-fns";
import {JDHelloWorld, User} from "./TS_JDHelloWorld";

class Joy_Park_Run extends JDHelloWorld {
  teamTool: H5ST
  apiTool: H5ST
  user: User
  captainId: string | number

  constructor() {
    super()
  }

  async init() {
    await this.run(new Joy_Park_Run())
  }

  // 秒转时分秒
  secondsToMinutes(seconds: number) {
    let minutes: number = Math.floor(seconds / 60)
    let second: number = Math.floor(seconds % 60)
    return `${minutes}分${second}秒`
  }

  // 小数加法
  add(num1: number, num2: number) {
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

  async team(fn: string, body: object) {
    let timestamp: number = Date.now(), h5st: string
    h5st = this.teamTool.__genH5st({
      appid: "activities_platform",
      body: JSON.stringify(body),
      client: "ios",
      clientVersion: "3.1.0",
      functionId: fn,
      t: timestamp.toString()
    })
    return await this.get(`https://api.m.jd.com/?functionId=${fn}&body=${encodeURIComponent(JSON.stringify(body))}&t=${timestamp}&appid=activities_platform&client=ios&clientVersion=3.1.0&cthr=1&h5st=${h5st}`, {
      'Host': 'api.m.jd.com',
      'User-Agent': 'jdltapp;',
      'Origin': 'https://h5platform.jd.com',
      'X-Requested-With': 'com.jd.jdlite',
      'Referer': 'https://h5platform.jd.com/',
      'Cookie': this.user.cookie
    })
  }

  async api(fn: string, body: object) {
    let timestamp: number = Date.now(), h5st: string = ''
    if (fn === 'runningOpenBox') {
      h5st = this.apiTool.__genH5st({
        appid: "activities_platform",
        body: JSON.stringify(body),
        client: "ios",
        clientVersion: "3.1.0",
        functionId: fn,
        t: timestamp.toString()
      })
    }
    let params: string = `functionId=${fn}&body=${JSON.stringify(body)}&t=${timestamp}&appid=activities_platform&client=ios&clientVersion=3.1.0&cthr=1`
    h5st && (params += `&h5st=${h5st}`)
    return await this.post('https://api.m.jd.com/', params, {
      'authority': 'api.m.jd.com',
      'content-type': 'application/x-www-form-urlencoded',
      'cookie': this.user.cookie,
      'origin': 'https://h5platform.jd.com',
      'referer': 'https://h5platform.jd.com/',
      'user-agent': 'jdltapp;iPhone;3.1.0;'
    })
  }

  async runningPageHome() {
    return this.get(`https://api.m.jd.com/?functionId=runningPageHome&body=%7B%22linkId%22:%22L-sOanK_5RJCz7I314FpnQ%22,%22isFromJoyPark%22:true,%22joyLinkId%22:%22LsQNxL7iWDlXUs6cFl-AAg%22%7D&t=${Date.now()}&appid=activities_platform&client=ios&clientVersion=3.1.0`, {
      'Host': 'api.m.jd.com',
      'Origin': 'https://h5platform.jd.com',
      'User-Agent': 'jdltapp;',
      'Referer': 'https://h5platform.jd.com/',
      'Cookie': this.user.cookie
    })
  }

  async main(user: User) {
    this.user = user
    let assets: number = parseFloat(process.env.JD_JOY_PARK_RUN_ASSETS || '0.08')
    let rewardAmount: number = 0
    try {
      this.teamTool = new H5ST('448de', 'jdltapp;', process.env.FP_448DE || '')
      await this.teamTool.__genAlgo()
      let res: any = await this.team('runningMyPrize', {"linkId": "L-sOanK_5RJCz7I314FpnQ", "pageSize": 20, "time": null, "ids": null})
      let sum: number = 0, success: number = 0
      rewardAmount = res.data.rewardAmount
      if (res.data.runningCashStatus.currentEndTime && res.data.runningCashStatus.status === 0) {
        console.log('可提现', rewardAmount)
        res = await this.api('runningPrizeDraw', {"linkId": "L-sOanK_5RJCz7I314FpnQ", "type": 2})
        await this.wait(2000)
        console.log(res.data.message)
      }

      for (let t of res?.data?.detailVos || []) {
        if (getDate(new Date(t.createTime)) === new Date().getDate()) {
          sum = this.add(sum, t.amount)
          success++
        } else {
          break
        }
      }
      console.log('成功', success)
      console.log('收益', parseFloat(sum.toFixed(2)))
      res = await this.team('runningTeamInfo', {"linkId": "L-sOanK_5RJCz7I314FpnQ"})
      if (!this.captainId) {
        if (res.data.members.length === 0) {
          console.log('成为队长')
          this.captainId = res.data.captainId
        } else if (res.data.members.length !== 6) {
          console.log('队伍未满', res.data.members.length)
          this.captainId = res.data.captainId
        } else {
          console.log('队伍已满')
        }
      } else if (this.captainId && res.data.members.length === 0) {
        console.log('已有组队ID，未加入队伍')
        res = await this.team('runningJoinTeam', {"linkId": "L-sOanK_5RJCz7I314FpnQ", "captainId": this.captainId})
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
            this.captainId = ''
          }
        } else {
          this.o2s(res, '组队失败')
        }
      } else {
        console.log('已组队', res.data.members.length)
        console.log('战队收益', res.data.teamSumPrize)
      }

      this.apiTool = new H5ST('b6ac3', 'jdltapp;', process.env.FP_B6AC3 || '')
      await this.apiTool.__genAlgo()
      res = await this.runningPageHome()
      console.log('🧧', res.data.runningHomeInfo.prizeValue)
      console.log('💊', res.data.runningHomeInfo.energy)
      await this.wait(2000)

      console.log('⏳', this.secondsToMinutes(res.data.runningHomeInfo.nextRunningTime / 1000))
      if (res.data.runningHomeInfo.nextRunningTime && res.data.runningHomeInfo.nextRunningTime / 1000 < 300) {
        console.log('⏳')
        await this.wait(res.data.runningHomeInfo.nextRunningTime + 3000)
        res = await this.runningPageHome()
        await this.wait(1000)
      } else if (res.data.runningHomeInfo.nextRunningTime && res.data.runningHomeInfo.nextRunningTime / 1000 > 3000 && res.data.runningHomeInfo.energy !== 0) {
        console.log('💉')
        res = await this.api('runningUseEnergyBar', {"linkId": "L-sOanK_5RJCz7I314FpnQ"})
        console.log(res.errMsg)
        res = await this.runningPageHome()
        await this.wait(1000)
      }

      if (!res.data.runningHomeInfo.nextRunningTime) {
        console.log('终点目标', assets)
        for (let i = 0; i < 10; i++) {
          res = await this.api('runningOpenBox', {"linkId": "L-sOanK_5RJCz7I314FpnQ"})
          if (parseFloat(res.data.assets) >= assets) {
            let assets: number = parseFloat(res.data.assets)
            res = await this.api('runningPreserveAssets', {"linkId": "L-sOanK_5RJCz7I314FpnQ"})
            console.log('领取成功', assets)
            break
          } else {
            if (res.data.doubleSuccess) {
              console.log('翻倍成功', parseFloat(res.data.assets))
              await this.wait(5000)
            } else if (!res.data.doubleSuccess && !res.data.runningHomeInfo.runningFinish) {
              console.log('开始跑步', parseFloat(res.data.assets))
              await this.wait(5000)
            } else {
              console.log('翻倍失败')
              break
            }
          }
          await this.wait(5000)
        }
      }

      res = await this.runningPageHome()
      console.log('🧧', res.data.runningHomeInfo.prizeValue)
      await this.wait(2000)
    } catch (e) {
      console.log('Error', e)
      await this.wait(3000)
    }
  }
}

new Joy_Park_Run().init().then()
