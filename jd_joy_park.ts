import {User, JDHelloWorld} from "./TS_JDHelloWorld";

class Joy_Park extends JDHelloWorld {
  user: User

  constructor() {
    super();
  }

  async init() {
    await this.run(new Joy_Park())
  }

  async api(fn: string, body: Object): Promise<object> {
    return await this.post('https://api.m.jd.com/', `functionId=${fn}&body=${JSON.stringify(body)}&_t=${Date.now()}&appid=activities_platform`, {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': this.user.UserAgent,
      'Host': 'api.m.jd.com',
      'Referer': 'https://joypark.jd.com/',
      'Origin': 'https://joypark.jd.com',
      'Cookie': this.user.cookie
    });
  }

  async main(user: User) {
    this.user = user;
    let res: any = await this.api('apTaskList', {"linkId": "L-sOanK_5RJCz7I314FpnQ"});
    let t: any = res.data[2]
    for (let i = t.taskDoTimes; i < t.taskLimitTimes; i++) {
      let res: any = await this.api('apTaskTimeRecord', {"linkId": "L-sOanK_5RJCz7I314FpnQ", "taskId": t.id})
      console.log(res.success)
      await this.wait(31000)
      let url: any = "https://pro.m.jd.com/jdlite/active/3qRAXpNehcsUpToARD9ekP4g6Jhi/index.html?babelChannel=ttt6"
      await this.api('apDoTask', {"channel": "4", "checkVersion": true, "itemId": encodeURIComponent(url), "linkId": "L-sOanK_5RJCz7I314FpnQ", "taskId": t.id, "taskType": t.taskType})
      console.log(res.success)
      await this.wait(1000)
    }
  }
}

new Joy_Park().init().then()