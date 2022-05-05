/**
 * 京喜牧场
 * cron: 10 0,12,18 * * *
 */

import * as path from "path"
import {Md5} from "ts-md5"
import {sendNotify} from './sendNotify'
import {requireConfig, getBeanShareCode, getFarmShareCode, wait, o2s, randomWord, getshareCodeHW, exceptCookie, get} from './TS_USER_AGENTS'
import {H5ST} from "./utils/h5st";
import {existsSync, readFileSync} from "fs";
import axios from "axios";

const token = require('./utils/jd_jxmc.js').token
const h5stTool: H5ST = new H5ST("00df8", "jdpingou;", "")

let cookie: string = '', res: any = '', shareCodes: string[] = [], homePageInfo: any = '', jxToken: any = '', UserName: string = '', ua: string = null, account: { pt_pin: string, remarks: string, jdpingou: string }[] = []
let shareCodesSelf: string[] = [], shareCodesHW: string[] = []

!(async () => {
  let except: string[] = exceptCookie(path.basename(__filename))
  if (existsSync('./utils/account.json')) {
    try {
      account = JSON.parse(readFileSync('./utils/account.json').toString())
    } catch (e) {
      console.log(e)
    }
  }

  let cookiesArr: any = await requireConfig()
  for (let [index, value] of cookiesArr.entries()) {
    cookie = value
    UserName = decodeURIComponent(cookie.match(/pt_pin=([^;]*)/)![1])
    console.log(`\n开始【京东账号${index + 1}】${UserName}\n`)
    if (except.includes(encodeURIComponent(UserName))) {
      console.log('已设置跳过')
      continue
    }
    ua = null
    for (let acc of account) {
      if (acc?.pt_pin.includes(UserName)) {
        ua = acc.jdpingou
        break
      }
    }

    await h5stTool.__genAlgo()
    jxToken = await token(cookie)
    homePageInfo = await api('queryservice/GetHomePageInfo', 'activeid,activekey,channel,isgift,isqueryinviteicon,isquerypicksite,jxmc_jstoken,phoneid,sceneid,timestamp', {isgift: 1, isquerypicksite: 1, isqueryinviteicon: 1})
    let lastgettime: number
    if (homePageInfo.data?.cow?.lastgettime) {
      lastgettime = homePageInfo.data.cow.lastgettime
    } else {
      continue
    }

    let food: number = 0, petid: string = '', coins: number = 0, petNum: number = 0, petids: string[] = []
    try {
      food = homePageInfo.data.materialinfo[0].value
      petid = homePageInfo.data.petinfo[0].petid
      petids = homePageInfo.data.petinfo.map(pet => {
        return pet.petid
      })
      console.log('当前🐔🐔：', petids)
      petNum = homePageInfo.data.petinfo.length
      coins = homePageInfo.data.coins
    } catch (e: any) {
      console.log('初始化出错，手动去app')
      continue
    }

    console.log('助力码:', homePageInfo.data.sharekey)
    shareCodesSelf.push(homePageInfo.data.sharekey)
    try {
      await makeShareCodes(homePageInfo.data.sharekey)
    } catch (e: any) {
      console.log("提交助力码出错")
    }

    console.log('草草🌿', food)
    console.log('蛋蛋🥚', homePageInfo.data.eggcnt)
    console.log('钱钱💰', coins)
    console.log('鸡鸡🐔', petNum)
    await wait(3000)

    // 扭蛋机
    res = await api('queryservice/GetCardInfo', 'activeid,activekey,channel,jxmc_jstoken,phoneid,sceneid,timestamp')
    await wait(5000)
    let drawTimes = res.data.times
    if (typeof drawTimes === "undefined") {
      await sendNotify("牧场扭蛋机错误", `账号${index + 1} ${UserName}\n手动建造扭蛋机`)
    } else {
      console.log('扭蛋机剩余次数:', drawTimes)
      for (let j = 0; j < drawTimes; j++) {
        res = await api('operservice/DrawCard', 'activeid,activekey,channel,jxmc_jstoken,phoneid,sceneid,timestamp')
        if (res.ret === 0) {
          if (res.data.prizetype === 3) {
            console.log('抽奖成功，金币:', res.data.addcoins)
          } else if (res.data.prizetype === 1) {
            console.log('抽奖成功，卡片:', res.data.cardtype)
          } else {
            console.log('抽奖成功，其他:', res)
          }
          await wait(8000)
        } else {
          console.log('抽奖失败:', res)
          break
        }
      }
    }

    res = await api('queryservice/GetCardInfo', 'activeid,activekey,channel,jxmc_jstoken,phoneid,sceneid,timestamp')
    try {
      for (let card of res.data.cardinfo) {
        console.log(`card ${card.cardtype}`, card.currnum, '/', card.neednum)
        if (card.currnum >= card.neednum && petNum < 6) {
          console.log('可以兑换')
          res = await api('operservice/Combine', 'activeid,activekey,cardtype,channel,jxmc_jstoken,phoneid,sceneid,timestamp', {cardtype: card.cardtype})
          res.ret === 0 ? console.log('兑换成功') : ''
          await wait(4000)
        }
      }
    } catch (e) {
    }
    await wait(5000)

    // 签到
    res = await api('queryservice/GetSignInfo', 'activeid,activekey,channel,jxmc_jstoken,phoneid,sceneid,timestamp')
    if (res.data.signlist) {
      for (let day of res.data.signlist) {
        if (day.fortoday && !day.hasdone) {
          res = await api('operservice/GetSignReward', 'channel,currdate,sceneid', {currdate: res.data.currdate})
          if (res.ret === 0) {
            console.log('签到成功!')
          } else {
            console.log(res)
          }
          break
        }
      }
    } else {
      console.log('没有获取到签到信息！')
    }
    await wait(5000)

    // 登录领白菜
    res = await api('queryservice/GetVisitBackInfo', 'activeid,activekey,channel,jxmc_jstoken,phoneid,sceneid,timestamp')
    await wait(2000)
    if (res.data.iscandraw === 1) {
      res = await api('operservice/GetVisitBackCabbage', 'activeid,activekey,channel,jxmc_jstoken,phoneid,sceneid,timestamp')
      if (res.ret === 0) {
        console.log('登录领白菜:', res.data.drawnum)
      }
    }
    await wait(5000)

    console.log('任务列表开始')
    for (let j = 0; j < 30; j++) {
      if (await getTask() === 0) {
        break
      }
      await wait(4000)
    }
    console.log('任务列表结束')
    await wait(5000)

    while (coins >= 5000 && food <= 500) {
      res = await api('operservice/Buy', 'activeid,activekey,channel,jxmc_jstoken,phoneid,sceneid,timestamp,type', {type: '1'})
      if (res.ret === 0) {
        console.log('买草成功:', res.data.newnum)
        coins -= 5000
        food += 100
      } else {
        console.log(res)
        break
      }
      await wait(8000)
    }
    await wait(6000)

    while (food >= 10) {
      food -= 10
      res = await api('operservice/Feed', 'activeid,activekey,channel,jxmc_jstoken,phoneid,sceneid,timestamp')
      if (res.ret === 0) {
        console.log('喂食:', res.data.newnum)
      } else if (res.ret === 2020) {
        console.log('收🥚')
        homePageInfo = await api('queryservice/GetHomePageInfo', 'activeid,activekey,channel,isgift,isqueryinviteicon,isquerypicksite,jxmc_jstoken,phoneid,sceneid,timestamp', {
          isgift: 1,
          isquerypicksite: 1,
          isqueryinviteicon: 1
        })
        for (let t of homePageInfo.data.petinfo) {
          if (t.cangetborn === 1) {
            petid = t.petid
            break
          }
        }
        res = await api('operservice/GetSelfResult', 'activeid,activekey,channel,itemid,jxmc_jstoken,phoneid,sceneid,timestamp,type', {itemid: petid, type: '11'})
        if (res.ret === 0) {
          console.log('收🥚成功:', res.data.newnum)
        } else {
          console.log('收🥚失败:', res)
          break
        }
      } else if (res.ret === 2005) {
        console.log('今天吃撑了')
        break
      } else {
        console.log('Feed未知错误:', res)
        break
      }
      await wait(10000)
    }
    await wait(8000)

    console.log('除草...start')
    for (let j = 0; j < 30; j++) {
      try {
        res = await api('operservice/Action', 'activeid,activekey,channel,jxmc_jstoken,phoneid,sceneid,timestamp,type', {type: '2'})
        if (res.data.addcoins === 0 || JSON.stringify(res.data) === '{}') break
        console.log('锄草:', res.data.addcoins)
        await wait(5000)
        if (res.data.surprise) {
          res = await api("operservice/GetSelfResult", "activeid,activekey,channel,jxmc_jstoken,phoneid,sceneid,timestamp,type", {type: '14', itemid: 'undefined'})
          console.log('锄草奖励:', res.data.prizepool)
          await wait(5000)
        }
      } catch (e: any) {
        console.log('除草 Error')
        break
      }
    }
    await wait(6000)

    for (let j = 0; j < 30; j++) {
      try {
        res = await api('operservice/Action', 'activeid,activekey,channel,jxmc_jstoken,petid,phoneid,sceneid,timestamp,type', {type: '1', petid: petids[Math.floor((Math.random() * petids.length))]})
        if (res.data.addcoins === 0 || JSON.stringify(res.data) === '{}') break
        console.log('挑逗:', res.data.addcoins)
        await wait(6000)
      } catch (e: any) {
        console.log('挑逗 Error')
        break
      }
    }
  }

  /*
  for (let [index, value] of cookiesArr.entries()) {
    if (shareCodesHW.length === 0) {
      shareCodesHW = await getshareCodeHW('jxmc')
    }
    // 获取随机助力码
    try {
      let {data}: any = await axios.get(`https://api.jdsharecode.xyz/api/jxmc/30`, {timeout: 10000})
      console.log('获取到30个随机助力码:', data.data)
      shareCodes = Array.from(new Set([...shareCodesSelf, ...shareCodesHW, ...data.data]))
    } catch (e: any) {
      console.log('获取助力池失败')
      shareCodes = Array.from(new Set([...shareCodesSelf, ...shareCodesHW]))
    }

    cookie = value
    jxToken = await token(cookie)
    for (let code of shareCodes) {
      console.log(`账号${index + 1} 去助力 ${code}`)
      res = await api('operservice/EnrollFriend', 'activeid,activekey,channel,jxmc_jstoken,phoneid,sceneid,sharekey,timestamp', {sharekey: code})
      if (res.ret === 0) {
        console.log('成功，获得:', res.data.addcoins)
      } else if(res.ret===1016){
        console.log('火爆:', res)
        break
      }
      } else {
        console.log('失败:', res)
      }
      await wait(8000)
    }
  }
  */
})()

interface Params {
  isgift?: number,
  isquerypicksite?: number,
  petid?: string,
  itemid?: string,
  type?: string,
  taskId?: number
  configExtra?: string,
  sharekey?: string,
  currdate?: string,
  token?: string,
  isqueryinviteicon?: number,
  showAreaTaskFlag?: number,
  jxpp_wxapp_type?: number,
  dateType?: string,
  step?: string,
  cardtype?: number,
}

async function getTask() {
  console.log('刷新任务列表')
  res = await api('GetUserTaskStatusList', 'bizCode,dateType,jxpp_wxapp_type,showAreaTaskFlag,source', {dateType: '', showAreaTaskFlag: 0, jxpp_wxapp_type: 7})
  for (let t of res.data.userTaskStatusList) {
    if (t.completedTimes == t.targetTimes && t.awardStatus === 2) {
      res = await api('Award', 'bizCode,source,taskId', {taskId: t.taskId})
      if (res.ret === 0) {
        let awardCoin = res.data.prizeInfo.match(/:(.*)}/)![1] * 1
        console.log('领奖成功:', awardCoin)
        await wait(4000)
        return 1
      } else {
        console.log('领奖失败:', res)
        return 0
      }
    }

    if (t.dateType === 2 && t.completedTimes < t.targetTimes && t.awardStatus === 2 && t.taskType === 2) {
      res = await api('DoTask', 'bizCode,configExtra,source,taskId', {taskId: t.taskId, configExtra: ''})
      if (res.ret === 0) {
        console.log('任务完成')
        await wait(5000)
        return 1
      } else {
        console.log('任务失败:', res)
        return 0
      }
    }
  }
  return 0
}

async function api(fn: string, stk: string, params: Params = {}) {
  let url: string, t: { [key: string]: string } = {
    activeid: 'jxmc_active_0001',
    activekey: 'null',
    channel: '7',
    jxmc_jstoken: jxToken['farm_jstoken'],
    phoneid: jxToken['phoneid'],
    sceneid: '1001',
    timestamp: jxToken['timestamp'],
  }
  if (['GetUserTaskStatusList', 'DoTask', 'Award'].indexOf(fn) > -1)
    url = `https://m.jingxi.com/newtasksys/newtasksys_front/${fn}?_=${Date.now()}&source=jxmc&bizCode=jxmc&_stk=${encodeURIComponent(stk)}&_ste=1&sceneval=2&g_login_type=1&callback=jsonpCBK${randomWord()}&g_ty=ls`
  else
    url = `https://m.jingxi.com/jxmc/${fn}?channel=7&sceneid=1001&activeid=jxmc_active_0001&activekey=null&jxmc_jstoken=${jxToken['farm_jstoken']}&timestamp=${jxToken['timestamp']}&phoneid=${jxToken['phoneid']}&_stk=${encodeURIComponent(stk)}&_ste=1&_=${Date.now()}&sceneval=2&g_login_type=1&callback=jsonpCBK${randomWord()}&g_ty=ls`

  for (let [key, value] of Object.entries(params)) {
    t[key] = value
    url += `&${key}=${value}`
  }
  let h5st: string = h5stTool.__genH5st(t)
  url += `&h5st=${h5st}`
  try {
    let {data}: any = await axios.get(url, {
      headers: {
        'Host': 'm.jingxi.com',
        'Accept': '*/*',
        'User-Agent': ua ?? 'jdpingou;',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Referer': 'https://st.jingxi.com/',
        'Cookie': cookie
      }
    })
    return JSON.parse(data.match(/jsonpCBK.?\((.*)/)![1])
  } catch (e) {
    o2s(e)
  }
}

async function makeShareCodes(code: string) {
  try {
    let bean: string = await getBeanShareCode(cookie)
    let farm: string = await getFarmShareCode(cookie)
    let pin: string = Md5.hashStr(cookie.match(/pt_pin=([^;]*)/)![1])
    let data = await get(`https://api.jdsharecode.xyz/api/autoInsert/jxmc?sharecode=${code}&bean=${bean}&farm=${farm}&pin=${pin}`)
    console.log(data.message)
  } catch (e) {
    console.log('自动提交失败')
    console.log(e)
  }
}
