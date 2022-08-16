/**
 * 汪汪乐园-跑步+组队
 * cron: 20 * * * *
 * export FP_448DE=""
 * export FP_B6AC3=""
 */

import {H5ST} from "./utils/h5st_pro"
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
    await this.run(this)
  }

  // 秒转分:秒
  secondsToMinutes(seconds: number) {
    let minutes: number = Math.floor(seconds / 60)
    let second: number = Math.floor(seconds % 60)
    return `${minutes}分${second}秒`
  }

  async team(fn: string, body: object) {
    let timestamp: number = Date.now(), h5st: string
    h5st = this.teamTool.__genH5st({
      appid: "activities_platform",
      body: JSON.stringify(body),
      client: "ios",
      clientVersion: "3.9.2",
      functionId: fn,
      t: timestamp.toString()
    })
    return await this.get(`https://api.m.jd.com/?functionId=${fn}&body=${encodeURIComponent(JSON.stringify(body))}&t=${timestamp}&appid=activities_platform&client=ios&clientVersion=3.9.2&cthr=1&h5st=${h5st}`, {
      'Host': 'api.m.jd.com',
      'User-Agent': this.user.UserAgent,
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
        clientVersion: "3.9.2",
        functionId: fn,
        t: timestamp.toString()
      })
    }
    let params: string = `functionId=${fn}&body=${JSON.stringify(body)}&t=${timestamp}&appid=activities_platform&client=ios&clientVersion=3.9.2&cthr=1`
    h5st && (params += `&h5st=${h5st}`)
    return await this.post('https://api.m.jd.com/', params, {
      'authority': 'api.m.jd.com',
      'content-type': 'application/x-www-form-urlencoded',
      'cookie': this.user.cookie,
      'origin': 'https://h5platform.jd.com',
      'referer': 'https://h5platform.jd.com/',
      'User-Agent': this.user.UserAgent,
    })
  }

  async runningPageHome() {
    return this.get(`https://api.m.jd.com/?functionId=runningPageHome&body=%7B%22linkId%22:%22L-sOanK_5RJCz7I314FpnQ%22,%22isFromJoyPark%22:true,%22joyLinkId%22:%22LsQNxL7iWDlXUs6cFl-AAg%22%7D&t=${Date.now()}&appid=activities_platform&client=ios&clientVersion=3.9.2`, {
      'Host': 'api.m.jd.com',
      'Origin': 'https://h5platform.jd.com',
      'User-Agent': this.user.UserAgent,
      'Referer': 'https://h5platform.jd.com/',
      'Cookie': this.user.cookie
    })
  }

  async startRunning(res: any, assets: number) {
    if (!res.data.runningHomeInfo.nextRunningTime) {
      console.log('终点目标', assets)
      for (let i = 0; i < 5; i++) {
        res = await this.api('runningOpenBox', {"linkId": "L-sOanK_5RJCz7I314FpnQ"})
        if (parseFloat(res.data.assets) >= assets) {
          let assets: number = parseFloat(res.data.assets)
          res = await this.api('runningPreserveAssets', {"linkId": "L-sOanK_5RJCz7I314FpnQ"})
          console.log('领取成功', assets)
          break
        } else {
          if (res.data.doubleSuccess) {
            console.log('翻倍成功', parseFloat(res.data.assets))
            await this.wait(10000)
          } else if (!res.data.doubleSuccess && !res.data.runningHomeInfo.runningFinish) {
            console.log('开始跑步', parseFloat(res.data.assets))
            await this.wait(10000)
          } else {
            console.log('翻倍失败')
            break
          }
        }
      }
    }
    await this.wait(3000)
  }

  async main(user: User) {
    this.user = user
    this.user.UserAgent = `jdltapp;iPhone;3.9.2;Mozilla/5.0 (iPhone; CPU iPhone OS ${this.getIosVer()} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;`
    let assets: number = parseFloat(process.env.JD_JOY_PARK_RUN_ASSETS || '0.08')
    let rewardAmount: number = 0
    try {
      this.teamTool = new H5ST('448de', this.user.UserAgent, process.env.FP_448DE || '', 'https://h5platform.jd.com/swm-stable/people-run/index?activityId=L-sOanK_5RJCz7I314FpnQ', 'https://h5platform.jd.com')
      await this.teamTool.__genAlgo()
      let res: any = await this.team('runningMyPrize', {"linkId": "L-sOanK_5RJCz7I314FpnQ", "pageSize": 20, "time": null, "ids": null})
      let sum: number = 0, success: number = 0
      rewardAmount = res.data.rewardAmount
      if (res.data.runningCashStatus.currentEndTime && res.data.runningCashStatus.status === 0) {
        console.log('可提现', rewardAmount)
        res = await this.api('runningPrizeDraw', {"linkId": "L-sOanK_5RJCz7I314FpnQ", "type": 2})
        await this.wait(2000)
        console.log(res.data.message)
        res = await this.team('runningMyPrize', {"linkId": "L-sOanK_5RJCz7I314FpnQ", "pageSize": 20, "time": null, "ids": null})
      }

      for (let t of res?.data?.detailVos || []) {
        if (t.amount > 0 && getDate(new Date(t.createTime)) === new Date().getDate()) {
          sum += t.amount
          success++
        } else {
          break
        }
      }
      console.log('成功', success)
      sum = parseFloat(sum.toFixed(2))
      console.log('收益', sum)

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

      this.apiTool = new H5ST('b6ac3', this.user.UserAgent, process.env.FP_B6AC3 || '', 'https://h5platform.jd.com/swm-stable/people-run/index?activityId=L-sOanK_5RJCz7I314FpnQ', 'https://h5platform.jd.com')
      await this.apiTool.__genAlgo()
      res = await this.runningPageHome()
      console.log('🧧', res.data.runningHomeInfo.prizeValue)
      console.log('💊', res.data.runningHomeInfo.energy)
      let energy: number = res.data.runningHomeInfo.energy
      await this.wait(2000)

      console.log('⏳', this.secondsToMinutes(res.data.runningHomeInfo.nextRunningTime / 1000))
      if (res.data.runningHomeInfo.nextRunningTime && res.data.runningHomeInfo.nextRunningTime / 1000 < 300) {
        console.log('⏳')
        await this.wait(res.data.runningHomeInfo.nextRunningTime + 3000)
        res = await this.runningPageHome()
        await this.wait(1000)
      }
      await this.startRunning(res, assets)

      res = await this.runningPageHome()
      for (let i = 0; i < energy; i++) {
        if (res.data.runningHomeInfo.nextRunningTime / 1000 < 3000)
          break
        console.log('💉')
        res = await this.api('runningUseEnergyBar', {"linkId": "L-sOanK_5RJCz7I314FpnQ"})
        console.log(res.errMsg)
        res = await this.runningPageHome()
        await this.startRunning(res, assets)
        await this.wait(1000)
      }

      res = await this.runningPageHome()
      console.log('🧧', res.data.runningHomeInfo.prizeValue)
      await this.wait(2000)
    } catch (e) {
      console.log('Error', e.message)
      await this.wait(3000)
    }
  }
}

new Joy_Park_Run().init().then()