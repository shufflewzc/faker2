import {User, JDHelloWorld} from "./TS_JDHelloWorld";

class TEST extends JDHelloWorld {
  user: User

  constructor() {
    super();
  }

  async init() {
    await this.run(new TEST)
  }

  async api(fn: string, body: object) {
    return await this.post('https://api.m.jd.com/', `functionId=${fn}&body=${encodeURIComponent(JSON.stringify(body))}&client=wh5&clientVersion=1.0.0&uuid=`, {
      'Host': 'api.m.jd.com',
      'Origin': 'https://h5.m.jd.com',
      'User-Agent': this.user.UserAgent,
      'Referer': 'https://h5.m.jd.com/',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': this.user.cookie
    })
  }

  async main(user: User) {
    this.user = user
    let res: any = await this.api('jdhealth_getTaskDetail', {"buildingId": "", "taskId": "", "channelId": 1})
    try {
      for (let t of res.data.result.taskVos) {
        if (t.status === 1 || t.status === 3) {
          console.log(t.taskName)
          for (let tp of t.productInfoVos || t.followShopVo || t.shoppingActivityVos || []) {
            if (tp.status === 1) {
              console.log('\t', tp.skuName || tp.shopName || tp.title)
              if (t.taskName.includes('早睡打卡') && t.taskBeginTime < Date.now() && t.taskEndTime > Date.now()) {
                res = await this.api('jdhealth_collectScore', {"taskToken": tp.taskToken, "taskId": t.taskId, "actionType": 1})
                await this.wait(2000)
                console.log('\t', res.data.bizMsg)
              }
              if (t.waitDuration) {
                res = await this.api('jdhealth_collectScore', {"taskToken": tp.taskToken, "taskId": t.taskId, "actionType": 1})
                console.log('\t', res.data.bizMsg)
                await this.wait(t.waitDuration * 1000)
              }
              res = await this.api('jdhealth_collectScore', {"taskToken": tp.taskToken, "taskId": t.taskId, "actionType": 0})
              if (res.data.bizMsg.includes('做完')) {
                console.log(res.data.bizMsg)
                break
              } else {
                console.log(res.data.bizMsg, parseInt(res.data.result.score))
                await this.wait(1500)
              }
            }
          }
        }
      }
    } catch (e) {
      console.log('Error', e)
    }
  }
}

new TEST().init().then()