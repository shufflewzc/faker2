import axios from "axios";
import USER_AGENT, {randomWord} from "../TS_USER_AGENTS";
import {requestAlgo, geth5st} from './V3'

async function bean(cookie: string) {
  let {data}: any = await axios.post('https://api.m.jd.com/client.action', `functionId=plantBeanIndex&body=${decodeURIComponent(JSON.stringify({version: "9.0.0.1", "monitor_source": "plant_app_plant_index", "monitor_refer": ""}))}&appid=ld&client=apple&area=5_274_49707_49973&build=167283&clientVersion=9.1.0`, {
    headers: {
      Cookie: cookie,
      Host: "api.m.jd.com",
      "User-Agent": USER_AGENT
    }
  })
  if (data.data?.jwordShareInfo?.shareUrl)
    return data.data?.jwordShareInfo.shareUrl.split('Uuid=')![1]
  else
    return 'null'
}

async function farm(cookie: string) {
  let {data}: any = await axios.post('https://api.m.jd.com/client.action?functionId=initForFarm', `body=${encodeURIComponent(JSON.stringify({"version": 4}))}&appid=wh5&clientVersion=9.1.0`, {
    headers: {
      "cookie": cookie,
      "origin": "https://home.m.jd.com",
      "referer": "https://home.m.jd.com/myJd/newhome.action",
      "User-Agent": USER_AGENT,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
  return data.farmUserPro?.shareCode ?? 'null'
}

async function health(cookie: string) {
  let {data}: any = await axios.get(`https://api.m.jd.com/client.action/client.action?functionId=jdhealth_getTaskDetail&body=${encodeURIComponent(JSON.stringify({"buildingId": "", taskId: 6, "channelId": 1}))}&client=wh5&clientVersion=1.0.0`, {
    headers: {
      "Cookie": cookie,
      "origin": "https://h5.m.jd.com",
      "referer": "https://h5.m.jd.com/",
      'Content-Type': 'application/x-www-form-urlencoded',
      "User-Agent": USER_AGENT
    }
  })
  return data.data?.result?.taskVos[0].assistTaskDetailVo.taskToken ?? 'null'
}

async function pet(cookie: string) {
  let {data} = await axios.post('https://api.m.jd.com/client.action',
    `functionId=initPetTown&body=${JSON.stringify({"version": 1})}&appid=wh5&client=apple&clientVersion=10.3.6&build=167963&rfs=0000`, {
      headers: {
        'Host': 'api.m.jd.com',
        'Origin': 'https://h5.m.jd.com',
        'User-Agent': USER_AGENT,
        'Referer': 'https://h5.m.jd.com/',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie
      }
    })
  return data.result?.shareCode ?? 'null'
}

async function factory(cookie: string) {
  let {data}: any = await axios.post(`https://api.m.jd.com/client.action?functionId=jdfactory_getTaskDetail`,
    `functionId=jdfactory_getTaskDetail&body=${encodeURIComponent(JSON.stringify({}))}&client=wh5&clientVersion=9.1.0`, {
      headers: {
        Cookie: cookie,
        origin: "https://h5.m.jd.com",
        referer: "https://h5.m.jd.com/",
        "Content-Type": "application/x-www-form-urlencoded",
        'User-Agent': USER_AGENT,
      }
    });
  if (data.data.bizCode === 0) {
    for (let t of data.data?.result?.taskVos) {
      if (t.taskType === 14)
        return t.assistTaskDetailVo.taskToken
    }
  }
  return 'null'
}

async function sgmh(cookie: string) {
  let {data}: any = await axios.post(`https://api.m.jd.com/client.action`,
    `functionId=interact_template_getHomeData&body={"appId":"1EFRXxg","taskToken":""}&client=wh5&clientVersion=1.0.0`, {
      headers: {
        'Origin': `https://h5.m.jd.com`,
        'Cookie': cookie,
        'Accept': `application/json, text/plain, */*`,
        'Referer': `https://h5.m.jd.com/babelDiy/Zeus/2WBcKYkn8viyxv7MoKKgfzmu7Dss/index.html`,
        'Host': `api.m.jd.com`,
      }
    })
  if (data.data.bizCode === 0) {
    for (let t of data.data?.result?.taskVos) {
      if (t.taskName === '邀请好友助力')
        return t.assistTaskDetailVo.taskToken
    }
  }
  return 'null'
}

async function jxfactory(cookie: string) {
  await requestAlgo('c0ff1')
  let url: string, timestamp = Date.now()
  let stk = `_time,bizCode,showAreaTaskFlag,source`, params = {showAreaTaskFlag: '1', bizCode: 'dream_factory'}
  let t: { key: string, value: string } [] = [
    {key: '_time', value: timestamp.toString()},
    {key: '_ts', value: timestamp.toString()},
    {key: 'bizCode', value: 'dream_factory'},
    {key: 'source', value: 'dreamfactory'},
  ]
  url = `https://m.jingxi.com/newtasksys/newtasksys_front/GetUserTaskStatusList?source=dreamfactory&_time=${timestamp}&_ts=${timestamp}&_stk=${encodeURIComponent(stk)}&_=${timestamp + 3}&sceneval=2&g_login_type=1&callback=jsonpCBK${randomWord()}&g_ty=ls`

  for (let [key, value] of Object.entries(params)) {
    t.push({key, value})
    url += `&${key}=${value}`
  }
  let h5st = geth5st(t, 'c0ff1')
  url += `&h5st=${encodeURIComponent(h5st)}`
  let {data}: any = await axios.get(url, {
    headers: {
      'Referer': 'https://actst.jingxi.com/pingou/dream_factory/index.html',
      'User-Agent': USER_AGENT,
      'Host': 'm.jingxi.com',
      'Cookie': cookie
    }
  })
  return JSON.parse(data.match(/try{jsonpCBK.?\((.*)/)![1]).data?.encryptPin || 'null'
}

export {
  bean,
  farm,
  health,
  pet,
  factory,
  sgmh,
  jxfactory
}