/**
 * 京东-领现金
 * 兼容panda api和本地sign
 *
 * 使用panda sign
 * export PANDA_TOKEN=""
 * 本地sign算法 import {getSign} from './test/sign'
 */

import {User, JDHelloWorld} from "./TS_JDHelloWorld";
import {getSign} from "./test/sign";

class CASH extends JDHelloWorld {
  cookie: string

  constructor() {
    super();
  }

  async init() {
    await this.run(new CASH())
  }

  async api(fn: string, body: object) {
    let sign = getSign(fn, body)
    return await this.post(`https://api.m.jd.com/client.action?functionId=${fn}`, sign, {
      'Host': 'api.m.jd.com',
      'Cookie': this.cookie,
      'user-agent': 'jdapp;',
    })
  }

  async main(user: User) {
    this.cookie = user.cookie
    let res: any = await this.api('cash_homePage', {})
    if (res.data.result.signedStatus !== 1) {
      console.log('今日未签到')
      await this.api('cash_sign', {"remind": 0, "inviteCode": "", "type": 0, "breakReward": 0})
      await this.wait(1000)
      console.log('签到成功')
    } else {
      console.log('今日已签到')
    }

    res = await this.api('cash_homePage', {})
    let type: number[] = [2, 4, 31, 16, 3, 5, 17, 21], data: any
    let otherTaskNum = res.data.result.taskInfos.filter(item => !type.includes(item.type)).length
    let taskNum = res.data.result.taskInfos.filter(item => type.includes(item.type)).length
    console.log(taskNum, otherTaskNum)

    for (let i = 0; i < 10; i++) {
      res = await this.api('cash_homePage', {})
      if (res.data.result.taskInfos.filter(item => type.includes(item.type) && item.doTimes === item.times).length === taskNum) {
        console.log('任务全部完成')
        break
      }

      for (let t of res?.data?.result?.taskInfos || []) {
        if (t.doTimes < t.times && t.type !== 7) {
          console.log(t.name)
          data = await this.api('cash_doTask', {"type": t.type, "taskInfo": t.desc})
          await this.wait(t.duration * 1000 || 1000)
          if (data.data.bizCode === 0) {
            console.log('任务完成', data.data.result.totalMoney ?? '')
            break
          } else {
            console.log('任务失败', JSON.stringify(data))
            break
          }
        }
      }
      await this.wait(2000)
    }
  }
}

new CASH().init().then().catch()
