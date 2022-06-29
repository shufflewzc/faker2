import {JDHelloWorld, User} from "./TS_JDHelloWorld";

class Jd_queryRedpacket extends JDHelloWorld {
  constructor() {
    super("京东红包");
  }

  async init() {
    await this.run(new Jd_queryRedpacket())
  }

  add(arg1: number, arg2: number) {
    let r1, r2, m
    try {
      r1 = arg1.toString().split('.')[1].length
    } catch (e) {
      r1 = 0
    }
    try {
      r2 = arg2.toString().split('.')[1].length
    } catch (e) {
      r2 = 0
    }
    m = Math.pow(10, Math.max(r1, r2))
    return parseFloat(((arg1 * m + arg2 * m) / m).toFixed(2))
  }

  async main(user: User) {
    let res: any = await this.get(`https://m.jingxi.com/user/info/QueryUserRedEnvelopesV2?type=1&orgFlag=JD_PinGou_New&page=1&cashRedType=1&redBalanceFlag=1&channel=1&_=${Date.now()}&sceneval=2&g_login_type=1&g_ty=ls`, {
      'Host': 'm.jingxi.com',
      'Referer': 'https://st.jingxi.com/my/redpacket.shtml',
      "Cookie": user.cookie,
      'User-Agent': user.UserAgent
    })
    let day: number = new Date().getDay(), jdRed: number = 0, jdRedExp: number = 0, jsRed: number = 0, jsRedExp: number = 0
    for (let j of res.data.useRedInfo?.redList || []) {
      console.log(j)
      if (j.orgLimitStr.includes('京喜')) {
      } else if (j.activityName.includes('极速版')) {
        jsRed += j.balance
        if (new Date(j.endTime * 1000).getDay() === day)
          jsRedExp = this.add(jsRedExp, j.balance)
      } else if (j.orgLimitStr.includes('京东健康')) {
      } else {
        jdRed = this.add(jdRed, j.balance)
        if (new Date(j.endTime * 1000).getDay() === day)
          jdRedExp = this.add(jdRedExp, j.balance)
      }
    }
    console.log('京东', jdRed, '  今日过期：', jdRedExp)
    console.log('极速', jsRed, '  今日过期：', jsRedExp)
    let msg = `【账号】  ${user.UserName}\n京东红包  ${jdRed}\n今日过期  ${jdRedExp}\n\n`
    return {
      msg: msg
    }
  }
}

new Jd_queryRedpacket().init().then()
