import {User, JDHelloWorld} from "./TS_JDHelloWorld";
import {Log_618} from "./utils/log_618";

class Jd_618 extends JDHelloWorld {
  user: User
  logTool: Log_618 = new Log_618()

  constructor() {
    super();
  }

  async init() {
    await this.run(this)
  }

  async getLog(): Promise<{ random: string, log: string }> {
    let data = await this.logTool.main()
    await this.wait(4000)
    return data
  }

  async api(fn: string, body: object) {
    return this.post(`https://api.m.jd.com/client.action?functionId=${fn}`, `functionId=${fn}&client=m&clientVersion=-1&appid=signed_wh5&body=${JSON.stringify(body)}`, {
      'Host': 'api.m.jd.com',
      'Origin': 'https://wbbny.m.jd.com',
      'Accept': 'application/json, text/plain, */*',
      'User-Agent': this.user.UserAgent,
      'Referer': 'https://wbbny.m.jd.com/',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': this.user.cookie
    })
  }

  async qryViewkitCallbackResult(taskToken: string) {
    let body: object = {"dataSource": "newshortAward", "method": "getTaskAward", "reqParams": `{\"taskToken\":\"${taskToken}\"}`}
    let data = await this.logTool.qry('qryViewkitCallbackResult', body)
    return await this.post('https://api.m.jd.com/client.action?functionId=qryViewkitCallbackResult', data, {
      'Host': 'api.m.jd.com',
      'Cookie': this.user.cookie,
      'content-type': 'application/x-www-form-urlencoded',
      'User-Agent': this.user.UserAgent,
    })
  }

  async feed(taskId: number, secretp: string) {
    let res: any = await this.api('promote_getFeedDetail', {"taskId": taskId})
    let times: number = res.data.result.addProductVos[0].times, maxTimes: number = res.data.result.addProductVos[0].maxTimes
    for (let tp of res.data.result.addProductVos[0].productInfoVos) {
      if (times === maxTimes) break
      let log: { log: string, random: string } = await this.getLog()
      let data = await this.api('promote_collectScore', {
        "taskId": taskId,
        "taskToken": tp.taskToken,
        "ss": JSON.stringify({
          extraData: {
            log: encodeURIComponent(log.log),
            sceneid: 'RAhomePageh5'
          },
          secretp: secretp,
          random: log.random
        })
      })
      this.o2s(data)
      times++
      await this.wait(1000)
    }
  }

  async main(user: User) {
    this.user = user
    let res: any, data: any, log: { random: string, log: string }
    res = await this.api('promote_getHomeData', {})
    let secretp: string = res.data.result.homeMainInfo.secretp
    console.log('当前金币', parseInt(res.data.result.homeMainInfo.raiseInfo.totalScore))

    log = await this.getLog()
    res = await this.api('promote_collectAutoScore', {
      ss: JSON.stringify({
        extraData: {
          log: encodeURIComponent(log.log),
          sceneid: 'RAhomePageh5'
        },
        secretp: secretp,
        random: log.random
      })
    })
    console.log('收金币', parseInt(res.data.result.produceScore))
    await this.wait(1000)

    for (let loop = 0; loop < 3; loop++) {
      try {
        console.log('loop', loop)
        res = await this.api('promote_getTaskDetail', {})
        this.o2s(res)

        for (let t of res.data.result.lotteryTaskVos[0].badgeAwardVos) {
          if (t.status === 3) {
            data = await this.api('promote_getBadgeAward', {"awardToken": t.awardToken})
            console.log(t.awardName, parseInt(data.data.result.myAwardVos[0].pointVo.score))
            await this.wait(2000)
          }
        }

        for (let t of res.data.result.taskVos) {
          if (t.browseShopVo) {
            for (let tp of t.browseShopVo) {
              if (tp.status === 1) {
                console.log(tp.shopName)
                log = await this.getLog()

                data = await this.api('followShop', {"shopId": tp.shopId, "follow": true, "type": "0"})
                console.log('followShop', data.msg)

                data = await this.api('promote_collectScore', {
                  "taskId": t.taskId.toString(),
                  "taskToken": tp.taskToken,
                  "actionType": 1,
                  "ss": JSON.stringify({
                    extraData: {
                      log: encodeURIComponent(log.log),
                      sceneid: 'RAhomePageh5'
                    },
                    secretp: secretp,
                    random: log.random
                  })
                })
                // this.o2s(data, 'promote_collectScore')
                console.log(data.data.bizMsg)

                await this.wait(t.waitDuration * 1000 || 1000)
                data = await this.qryViewkitCallbackResult(tp.taskToken)
                // this.o2s(data, 'qryViewkitCallbackResult')
                console.log(data.toast.subTitle)
              }
            }
          }

          if (t.shoppingActivityVos) {
            for (let tp of t.shoppingActivityVos) {
              if (tp.status === 1) {
                log = await this.getLog()
                console.log(tp.title)
                data = await this.api('promote_collectScore', {
                  "taskId": t.taskId, "taskToken": tp.taskToken, "actionType": 1, "ss": JSON.stringify({
                    extraData: {
                      log: encodeURIComponent(log.log),
                      sceneid: 'RAhomePageh5'
                    },
                    secretp: secretp,
                    random: log.random
                  })
                })
                console.log(data.data.bizMsg)
                await this.wait(t.waitDuration * 1000)
                data = await this.qryViewkitCallbackResult(tp.taskToken)
                console.log(data.toast.subTitle)
              }
              await this.wait(2000)
            }
          }

          if (t.taskName.includes('加购')) {
            console.log(t.taskName)
            data = await this.api('promote_getTaskDetail', {taskId: t.taskId})
            await this.feed(t.taskId, secretp)
          }
        }
      } catch (e) {
        console.log('Error', e)
        break
      }
      await this.wait(5000)
    }
  }

  async help(users: User[]) {
    let shareCodeHW: string[] = []
    for (let user of users) {
      console.log(`\n开始【京东账号${user.index + 1}】${user.UserName}\n`)
      this.user = user
      let res: any, log: { log: string, random: string }
      res = await this.api('promote_getHomeData', {})
      let secretp: string = res.data.result.homeMainInfo.secretp
      res = await this.api('promote_pk_getHomeData', {})
      let memberCount: number = res.data.result.groupInfo.memberList.length
      console.log('当前队伍有', memberCount, '人')
      let groupJoinInviteId = ""

      if (memberCount < 20) {
        groupJoinInviteId = res.data.result.groupInfo.groupJoinInviteId
        console.log('队伍未满', groupJoinInviteId)
      }

      if (shareCodeHW.length === 0) {
        shareCodeHW = await this.getshareCodeHW('lyb_group')
      }
      // let shareCode: string[] = []
      if (user.index === users.length - 1) {
        groupJoinInviteId = shareCodeHW[0]
      }

      if (memberCount === 1) {
        log = await this.getLog()
        res = await this.api('promote_pk_joinGroup', {
          "inviteId": groupJoinInviteId,
          "ss": JSON.stringify({
            extraData: {
              log: encodeURIComponent(log.log),
              sceneid: 'RAhomePageh5'
            },
            secretp: secretp,
            random: log.random
          }),
          "confirmFlag": 1
        })
        await this.wait(1000)
        if (res.data.bizCode === 0) {
          console.log('加入队伍成功')
        } else {
          console.log(res.data.bizMsg)
        }
        res = await this.api('promote_pk_getHomeData', {})
        this.o2s(res, 'promote_pk_getHomeData')
      }
      await this.wait(3000)
    }
  }
}

new Jd_618().init().then()