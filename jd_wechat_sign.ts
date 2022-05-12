/**
 * 微信小程序签到红包
 * FP_9A38A
 * cron: 8 0 * * *
 */

import {H5ST} from "./utils/h5st"
import {User, JDHelloWorld} from "./TS_JDHelloWorld";

class Wechat_sign extends JDHelloWorld {
  constructor() {
    super("微信小程序签到红包");
  }

  async init() {
    await this.run(new Wechat_sign())
  }

  async main(user: User) {
    let h5stTool = new H5ST("9a38a", 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79 MicroMessenger/8.0.15(0x18000f2e) NetType/WIFI Language/zh_CN', process.env.FP_9A38A || "");
    await h5stTool.__genAlgo()
    let timestamp: number = Date.now()
    let h5st: string = h5stTool.__genH5st({
      appid: 'hot_channel',
      body: JSON.stringify({"activityId": "10002"}),
      client: 'android',
      clientVersion: '7.16.250',
      functionId: 'SignComponent_doSignTask',
      t: timestamp.toString(),
    })
    let res: any = await this.post(`https://api.m.jd.com/signTask/doSignTask?functionId=SignComponent_doSignTask&appid=hot_channel&body={"activityId":"10002"}&client=android&clientVersion=7.16.250&t=${timestamp}&h5st=${h5st}`, '', {
      'content-type': 'application/json',
      'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79 MicroMessenger/8.0.15(0x18000f2e) NetType/WIFI Language/zh_CN',
      'referer': 'https://servicewechat.com/wx91d27dbf599dff74/581/page-frame.html',
      'cookie': user.cookie
    })
    if (res.data) {
      console.log('已签到', res.data.signDays, '天，奖励', res.data.rewardValue, '元')
      return {msg: `【京东账号${user.i + 1}】  ${user.UserName}\n已签到  ${res.data.signDays}天\n奖励  ${res.data.rewardValue}元\n\n`}
    } else {
      console.log(res.message)
    }
  }
}

new Wechat_sign().init().then()