import USER_AGENT, {post, requireConfig, wait} from './TS_USER_AGENTS'
import {getSign} from "./test/sign";

let cookie: string = '', res: any = '', data: any, UserName: string

!(async () => {
  let cookiesArr: string[] = await requireConfig()
  for (let [index, value] of Object.entries(cookiesArr)) {
    cookie = value
    UserName = decodeURIComponent(cookie.match(/pt_pin=([^;]*)/)![1])
    console.log(`\n开始【京东账号${index + 1}】${UserName}\n`)

    res = await api('cash_homePage', {})
    if (res.data.result.signedStatus !== 1) {
      console.log('今日未签到')
      data = await api('cash_sign', {"remind": 0, "inviteCode": "", "type": 0, "breakReward": 0})
      await wait(1000)
      console.log('签到成功')
    }
    res = await api('cash_homePage', {})

    await wait(1000)
    let type: number[] = [2, 4, 31, 16, 3, 5, 17, 21]
    let otherTaskNum = res.data.result.taskInfos.filter(item => !type.includes(item.type)).length
    let taskNum = res.data.result.taskInfos.filter(item => type.includes(item.type)).length
    console.log(taskNum, otherTaskNum)

    for (let i = 0; i < 10; i++) {
      res = await api('cash_homePage', {})
      if (res.data.result.taskInfos.filter(item => type.includes(item.type) && item.doTimes === item.times).length === taskNum) {
        console.log('任务全部完成')
        break
      }
      for (let t of res?.data?.result?.taskInfos || []) {
        if (t.doTimes < t.times && t.type !== 7) {
          console.log(t.name)
          data = await api('cash_doTask', {"type": t.type, "taskInfo": t.desc})
          await wait(t.duration * 1000 || 1000)
          if (data.data.bizCode === 0) {
            console.log('任务完成', data.data.result.totalMoney ?? '')
            break
          } else {
            console.log('任务失败', JSON.stringify(data))
            break
          }
        }
      }
      await wait(2000)
    }
  }
})()

async function api(fn: string, body: object) {
  let sign = getSign(fn, body)
  return await post(`https://api.m.jd.com/client.action?functionId=${fn}`, sign, {
    'Host': 'api.m.jd.com',
    'Cookie': cookie,
    'content-type': 'application/x-www-form-urlencoded',
    'user-agent': USER_AGENT,
    'referer': ''
  })
}
