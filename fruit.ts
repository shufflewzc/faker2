import {sendNotify} from './sendNotify';
import USER_AGENT, {get, getShareCodePool, o2s, requireConfig, wait} from './TS_USER_AGENTS'
import {H5ST} from "./utils/h5st";

let cookie: string = '', res: any = '', data: any, UserName: string
let shareCodeSelf: string[] = [], shareCodePool: string[] = [], shareCode: string[] = [], shareCodeFile: object = require('./jdFruitShareCodes')
let message: string = '', h5stTool: H5ST = new H5ST("0c010", USER_AGENT, "8389547038003203")

!(async () => {
  let cookiesArr: string[] = await requireConfig()
  for (let [index, value] of cookiesArr.entries()) {
    cookie = value
    UserName = decodeURIComponent(cookie.match(/pt_pin=([^;]*)/)![1])
    console.log(`\n开始【京东账号${index + 1}】${UserName}\n`)
    message += `【账号${index + 1}】  ${UserName}\n`
    await h5stTool.__genAlgo()

    try {
      if (Object.keys(shareCodeFile)[index]) {
        shareCodeSelf = shareCodeFile[Object.keys(shareCodeFile)[index]].split('@')
      }
      console.log(`第${index + 1}个账号获取的内部互助`, shareCodeSelf)

      // 初始化
      res = await api('initForFarm', {"version": 11, "channel": 3})
      o2s(res)

      if (res.code === '6') {
        console.log('黑号')
        await wait(5000)
        continue
      }
      await wait(1000)
      if (res.todayGotWaterGoalTask.canPop) {
        data = await api('gotWaterGoalTaskForFarm', {"type": 3, "version": 14, "channel": 1, "babelChannel": "120"})
        o2s(data)
        console.log("弹窗获得水滴", data.addEnergy)
      }
      o2s(res, 'initForFarm')
      let totalEnergy: number = res.farmUserPro.totalEnergy  // 背包剩余水滴
      if (res.farmUserPro.treeState === 2) {
        console.log("可以兑换奖品了")
        await sendNotify("东东农场", `账号${index + 1}  ${UserName}\n\n已成熟`)
      } else if (res.farmUserPro.treeState === 0) {
        console.log("自动种植")
      }

      // 添加好友


      // 删除好友
      res = await api('friendListInitForFarm', {"lastId": null, "version": 14, "channel": 1, "babelChannel": "120"})
      await wait(1000)
      if (!res.newFriendMsg) {
        for (let fr of res.friends) {
          res = await api('deleteFriendForFarm', {"shareCode": fr.shareCode, "version": 14, "channel": 1, "babelChannel": "121"})
          await wait(1000)
          if (res.code === '0') {
            console.log(`删除好友${fr.nickName}成功`)
          } else {
            console.log(`删除好友${fr.nickName}失败`)
            break
          }
        }
      }

      // 背包
      // process.env.jdFruitBeanCard = 'True'
      // if (process.env.jdFruitBeanCard.toLowerCase() === 'true') {
      //   res = await api('myCardInfoForFarm', {"version": 14, "channel": 3, "babelChannel": "10"})
      //   o2s(res, 'myCardInfoForFarm')
      //   let beanCard: number = res.beanCard  // 换豆卡
      //   console.log('换豆卡数量', beanCard)
      //   for (let i = 0; i < 10; i++) {
      //     if (totalEnergy >= 100 && beanCard) {
      //       data = await api('userMyCardForFarm', {"cardType": "beanCard", "babelChannel": "10", "channel": 3, "version": 14})
      //       console.log('使用水滴换豆卡，获得京豆', data.beanCount)
      //       totalEnergy -= 100
      //       beanCard--
      //       await wait(1000)
      //     }
      //   }
      // } else {
      //   console.log('未设置水滴换豆卡环境变量')
      // }


      // 好友邀请奖励
      res = await api('friendListInitForFarm', {"lastId": null, "version": 14, "channel": 1, "babelChannel": "120"})
      o2s(res, 'friendListInitForFarm')
      let friendList: any[] = res.friends
      if (res.inviteFriendCount > res.inviteFriendGotAwardCount) {
        data = await api('awardInviteFriendForFarm', {})
        await wait(1000)
        o2s(data, '好友邀请奖励')
      }

      // 给好友浇水
      res = await api('taskInitForFarm', {"version": 14, "channel": 1, "babelChannel": "120"})
      o2s(res, 'taskInitForFarm')
      await wait(1000)
      console.log(`今日已给${res.waterFriendTaskInit.waterFriendCountKey}个好友浇水`);
      if (res.waterFriendTaskInit.waterFriendCountKey < res.waterFriendTaskInit.waterFriendMax) {
        for (let i = res.waterFriendTaskInit.waterFriendCountKey; i < res.waterFriendTaskInit.waterFriendMax; i++) {
          for (let fr of friendList) {
            if (fr.friendState === 1) {
              data = await api('waterFriendForFarm', {"shareCode": fr.shareCode, "version": 14, "channel": 1, "babelChannel": "120"})
              if (data.code === '0')
                console.log(`给好友${fr.nickName}浇水成功`)
              if (data.cardInfo) {
                console.log('获得卡片')
              }
              await wait(2000)
              break
            }
          }
        }
      } else if (res.waterFriendTaskInit.waterFriendCountKey === res.waterFriendTaskInit.waterFriendMax && !res.waterFriendTaskInit.waterFriendGotAward) {
        data = await api('waterFriendGotAwardForFarm', {"version": 14, "channel": 1, "babelChannel": "120"})
        console.log('给好友浇水奖励', data.addWater)
        await wait(1000)
      }

      // 签到
      res = await api('clockInInitForFarm', {"timestamp": Date.now(), "version": 14, "channel": 1, "babelChannel": "120"})
      await wait(1000)
      if (!res.todaySigned) {
        data = await api('clockInForFarm', {"type": 1, "version": 14, "channel": 1, "babelChannel": "120"})
        if (data.signDay === 7) {
          // data = await api('gotClockInGift', {"type": 2, "version": 14, "channel": 1, "babelChannel": "120"})
          // o2s(data, 'gotClockInGift')
          // await wait(1000)
        }
        await wait(1000)
      }

      res = await api('clockInInitForFarm', {"timestamp": Date.now(), "version": 14, "channel": 1, "babelChannel": "120"})
      for (let t of res.themes || []) {
        if (!t.hadGot) {
          console.log('关注', t.name)
          res = await api('clockInFollowForFarm', {"id": t.id, "type": "theme", "step": 1, "version": 14, "channel": 1, "babelChannel": "120"})
          await wait(5000)
          res = await api('clockInFollowForFarm', {"id": t.id, "type": "theme", "step": 2, "version": 14, "channel": 1, "babelChannel": "120"})
          console.log('获得水滴', res.amount)
        }
      }

      // 任务
      res = await api('taskInitForFarm', {"version": 14, "channel": 1, "babelChannel": "120"})
      o2s(res)
      if (res.signInit.todaySigned) {
        console.log(`今天已签到,已经连续签到${res.signInit.totalSigned}天,下次签到可得${res.signInit.signEnergyEachAmount}g`);
      } else {
        data = await api('signForFarm', {"version": 14, "channel": 1, "babelChannel": "120"})
        o2s(data, 'signForFarm')

        console.log('签到成功', data.amount)
        await wait(1000)
      }

      if (!res.gotBrowseTaskAdInit.f) {
        for (let t of res.gotBrowseTaskAdInit.userBrowseTaskAds) {
          if (t.hadFinishedTimes !== t.limit) {
            data = await api('browseAdTaskForFarm', {"advertId": t.advertId, "type": 0, "version": 14, "channel": 1, "babelChannel": "120"})
            o2s(data, 'browseAdTaskForFarm')
            await wait(t.time * 1000 || 1000)
            data = await api('browseAdTaskForFarm', {"advertId": t.advertId, "type": 1, "version": 14, "channel": 1, "babelChannel": "120"})
            console.log('任务完成，获得', data.amount)
          }
          await wait(1000)
        }
      }

      if (!res.gotThreeMealInit.f) {
        if (![10, 15, 16, 22, 23].includes(new Date().getHours())) {
          data = await api('gotThreeMealForFarm', {"version": 14, "channel": 1, "babelChannel": "120"})
          if (data.code === '0') {
            console.log('定时奖励成功', data.amount)
          }
          await wait(1000)
        }
      }

      if (!res.waterRainInit.f) {
        if (Date.now < res.waterRainInit.lastTime + 3 * 60 * 60 * 1000) {
          data = await api('waterRainForFarm', {"type": 1, "hongBaoTimes": 100, "version": 3})
          o2s(data, 'waterRainForFarm')
          if (data.code === '0') {
            console.log('获得水滴', data.addEnergy)
          }
        }
      }

      if (!res.firstWaterInit.f && res.firstWaterInit.totalWaterTimes !== 0) {
        data = await api('firstWaterTaskForFarm', {"version": 14, "channel": 1, "babelChannel": "120"})
        console.log('firstWaterTaskForFarm', data.amount)
      }

      // 红包
      res = await api('initForTurntableFarm', {"version": 4, "channel": 1})
      o2s(res, 'initForTurntableFarm')
      for (let t of res.turntableBrowserAds) {
        if (!t.status) {
          console.log("browserForTurntableFarm", t.main)
          data = await api('browserForTurntableFarm', {"type": 1, "adId": t.adId, "version": 4, "channel": 1})
          await wait(t.browserTimes * 1000 || 1000)
          data = await api('browserForTurntableFarm', {"type": 2, "adId": t.adId, "version": 4, "channel": 1})
        }
      }

      if (!res.timingGotStatus && res.remainLotteryTimes) {
        if (Date.now() > (res.timingLastSysTime + 60 * 60 * res.timingIntervalHours * 1000)) {
          data = await api('timingAwardForTurntableFarm', {"version": 4, "channel": 1})
          await wait(1000)
          o2s(data, 'timingAwardForTurntableFarm')
        } else {
          console.log(`免费赠送的抽奖机会未到时间`)
        }
      }

      // 天天红包助力
      shareCodePool = await getShareCodePool('farm', 30)
      shareCode = Array.from(new Set([...shareCodeSelf, ...shareCodePool]))
      for (let code of shareCodeSelf) {
        console.log('去红包助力', code)
        data = await api('initForFarm', {"shareCode": `${code}-3`, "lng": "0.000000", "lat": "0.000000", "sid": "2871ac0252645ef0e2731aa7d03c1d3w", "un_area": "16_1341_1347_44750", "version": 14, "channel": 1, "babelChannel": 0})
        await wait(3000)
        if (data.code === '0') {
          console.log('红包助力成功')
        } else if (data.code === '11') {
          console.log('红包已助力过')
        } else if (data.code === '13') {
          console.log('上限')
          break
        }
      }

      // 抽奖
      for (let i = 0; i < res.remainLotteryTimes; i++) {
        data = await api('lotteryForTurntableFarm', {"type": 1, "version": 4, "channel": 1})
        if (data.type === 'thanks') {
          console.log('抽奖获得 空气')
        } else {
          console.log('抽奖获得', data.type)
        }
        await wait(2000)
      }

      // 助力
      shareCodePool = await getShareCodePool('farm', 30)
      shareCode = Array.from(new Set([...shareCodeSelf, ...shareCodePool]))
      for (let code of shareCodeSelf) {
        console.log('去助力', code)
        res = await api('initForFarm', {"mpin": "", "utm_campaign": "t_335139774", "utm_medium": "appshare", "shareCode": code, "utm_term": "Wxfriends", "utm_source": "iosapp", "imageUrl": "", "nickName": "", "version": 14, "channel": 2, "babelChannel": 0})
        await wait(6000)
        o2s(res, '助力')
        if (res.helpResult.code === '7') {
          console.log('不给自己助力')
        } else if (res.helpResult.code === '0') {
          console.log('助力成功,获得', res.helpResult.salveHelpAddWater)
        } else if (res.helpResult.code === '8') {
          console.log('上限')
          break
        } else if (res.helpResult.code === '9') {
          console.log('已助力')
        } else if (res.helpResult.code === '10') {
          console.log('已满')
        } else if (res.helpResult.remainTimes === 0) {
          console.log('次数用完')
          break
        }
      }
      // 助力奖励
      res = await api('farmAssistInit', {"version": 14, "channel": 1, "babelChannel": "120"})
      await wait(1000)
      o2s(res, 'farmAssistInit')
      let farmAssistInit_waterEnergy: number = 0
      for (let t of res.assistStageList) {
        if (t.percentage === '100%' && t.stageStaus === 2) {
          data = await api('receiveStageEnergy', {"version": 14, "channel": 1, "babelChannel": "120"})
          await wait(1000)
          farmAssistInit_waterEnergy += t.waterEnergy
        } else if (t.stageStaus === 3) {
          farmAssistInit_waterEnergy += t.waterEnergy
        }
      }
      console.log('收到助力', res.assistFriendList.length)
      console.log('助力已领取', farmAssistInit_waterEnergy)
      message += `【助力已领取】  ${farmAssistInit_waterEnergy}\n`

      message += '\n\n'
    } catch (e) {
      console.log(e)
    } finally {
      await wait(5000)
    }
  }
  if (message)
    await sendNotify('东东农场', message)
})()

async function api(fn: string, body: object) {
  let h5st: string = h5stTool.__genH5st({
    'appid': 'wh5',
    'body': JSON.stringify(body),
    'client': 'apple',
    'clientVersion': '10.2.4',
    'functionId': fn,
  })
  return await get(`https://api.m.jd.com/client.action?functionId=${fn}&body=${JSON.stringify(body)}&appid=wh5&client=apple&clientVersion=10.2.4&h5st=${h5st}`, {
    "Host": "api.m.jd.com",
    "Origin": "https://carry.m.jd.com",
    "User-Agent": USER_AGENT,
    "Accept-Language": "zh-CN,zh-Hans;q=0.9",
    "Referer": "https://carry.m.jd.com/",
    "Cookie": cookie
  })
}