/**
 * 微信小程序签到红包
 * FP_9A38A
 * cron: 8 0 * * *
 */

import {H5ST} from "./utils/h5st"
import {User, JDHelloWorld} from "./TS_JDHelloWorld";

class Jd_wechat_sign extends JDHelloWorld {
  constructor() {
    super("微信签到");
  }

  async init() {
    await this.run(this)
  }

  async main(user: User) {
    let h5stTool = new H5ST("9a38a", user.UserAgent, process.env.FP_9A38A || "");
    await h5stTool.__genAlgo()
    let timestamp: number = Date.now()
    let headers: object = {
      'content-type': 'application/json',
      'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79 MicroMessenger/8.0.15(0x18000f2e) NetType/WIFI Language/zh_CN',
      'referer': 'https://servicewechat.com/wx91d27dbf599dff74/581/page-frame.html',
      'cookie': user.cookie
    }, h5st: string, res: any, signDays: number = 0, rewardValue: number = 0

    h5st = h5stTool.__genH5st({
      appid: 'hot_channel',
      body: JSON.stringify({"activityId": "10004"}),
      client: 'android',
      clientVersion: '7.16.250',
      functionId: 'SignComponent_doSignTask',
      t: timestamp.toString(),
    })
    res = await this.post(`https://api.m.jd.com/signTask/doSignTask?functionId=SignComponent_doSignTask&appid=hot_channel&body={"activityId":"10004"}&client=android&clientVersion=7.16.250&t=${timestamp}&h5st=${h5st}`, '', headers)
    if (res.data) {
      console.log('已签到', res.data.signDays, '天，奖励', res.data.rewardValue, '元')
      signDays = res.data.signDays
      rewardValue = res.data.rewardValue
    } else {
      console.log(res.message)
    }
    await this.wait(2000)

    res = await this.get(`https://api.m.jd.com/signTask/querySignList?client=android&clientVersion=7.18.110&functionId=SignComponent_querySignList&appid=hot_channel&loginType=2&body=%7B%22activityId%22%3A%2210004%22%7D`, headers)
    let scanAssignmentId: string = res.data.scanTaskInfo.scanAssignmentId, itemId: string = res.data.scanTaskInfo.itemId
    if (!res.data?.scanTaskInfo?.completionFlag) {
      h5stTool = new H5ST("2b5bc", user.UserAgent, process.env.FP_2B5BC || "");
      await h5stTool.__genAlgo()
      h5st = h5stTool.__genH5st({
        appid: 'hot_channel',
        body: JSON.stringify({"activityId": "10004", "actionType": 1, scanAssignmentId, itemId}),
        client: 'android',
        clientVersion: '7.18.110',
        functionId: 'SignComponent_doScanTask',
        t: timestamp.toString(),
      })
      res = await this.get(`https://api.m.jd.com/scanTask/startScanTask?client=android&clientVersion=7.18.110&functionId=SignComponent_doScanTask&appid=hot_channel&body=${encodeURIComponent(JSON.stringify({
        "activityId": "10004",
        "actionType": 1,
        "scanAssignmentId": scanAssignmentId,
        "itemId": res.data.scanTaskInfo.itemId
      }))}&h5st=${h5st}`, headers)
      console.log('领取任务', res.success)
      await this.wait(8000)

      h5st = h5stTool.__genH5st({
        appid: 'hot_channel',
        body: JSON.stringify({"activityId": "10004", "actionType": 0, scanAssignmentId, itemId}),
        client: 'android',
        clientVersion: '7.18.110',
        functionId: 'SignComponent_doScanTask',
        t: timestamp.toString(),
      })
      res = await this.get(`https://api.m.jd.com/scanTask/startScanTask?client=android&clientVersion=7.18.110&functionId=SignComponent_doScanTask&appid=hot_channel&body=${encodeURIComponent(JSON.stringify({
        "activityId": "10004",
        "actionType": 0,
        scanAssignmentId,
        itemId
      }))}&h5st=${h5st}`, headers)
      console.log('任务完成', res.data.rewardValue)
    } else if (res.data?.scanTaskInfo?.completionFlag) {
      console.log('浏览任务已完成')
    } else {
      console.log('无浏览任务')
    }

    if (signDays && rewardValue) {
      return {msg: `【京东账号${user.index + 1}】  ${user.UserName}\n已签到  ${signDays}天\n奖励  ${rewardValue}元\n\n`}
    }
  }
}

new Jd_wechat_sign().init().then()