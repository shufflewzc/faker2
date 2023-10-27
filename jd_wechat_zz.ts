/**
 * 赚赚
 * cron: 30 9 * * *
 */

import {requireConfig, wait, get, randomNumString} from './TS_USER_AGENTS'

let cookie: string = '', UserName: string = '', res: any = ''

!(async () => {
  let cookiesArr: string[] = await requireConfig()
  for (let [index, value] of cookiesArr.entries()) {
    cookie = value
    UserName = decodeURIComponent(cookie.match(/pt_pin=([^;]*)/)![1])
    console.log(`\n开始【京东账号${index + 1}】${UserName}\n`)
    let headers: object = {'Host': 'api.m.jd.com', 'wqreferer': 'http://wq.jd.com/wxapp/pages/hd-interaction/task/index', 'User-Agent': 'MQQBrowser/26 Mozilla/5.0 (Linux; U; Android 2.3.7; zh-cn; MB200 Build/GRJ22; CyanogenMod-7) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1', 'Referer': 'https://servicewechat.com/wx8830763b00c18ac3/115/page-frame.html', 'Content-Type': 'application/json', 'Cookie': cookie}

    res = await get(`https://api.m.jd.com/client.action?functionId=interactTaskIndex&body=%7B%22mpVersion%22%3A%223.4.0%22%7D&appid=wh5&loginWQBiz=interact&g_ty=ls&g_tk=${randomNumString(9)}`, headers)
    console.log(res.data.cashExpected)

    for (let t of res.data.taskDetailResList) {
      if (t.times === 0) {
        console.log(t.taskName)
        let taskItem: object = {...t, "fullTaskName": `${t.taskName} (0/1)`, "btnText": "去完成"}
        res = await get(`https://api.m.jd.com/client.action?functionId=doInteractTask&body=${encodeURIComponent(JSON.stringify({"taskId": t.taskId, "taskItem": taskItem, "actionType": 0, "taskToken": t.taskToken, "mpVersion": "3.4.0"}))}&appid=wh5&loginWQBiz=interact&g_ty=ls&g_tk=${randomNumString(9)}`, headers)
        console.log(res.message)
        await wait(2000)
      }
    }
    await wait(2000)
  }
})()