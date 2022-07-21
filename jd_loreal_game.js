/*
欧莱雅追光赛
@Leaf

只做普通任务，不做邀请。辣鸡活动不值得开卡
开卡之后才能抽奖，想要抽的再自己开卡吧

cron: 25 10,20 * * *
*/
const got = require("got");
const $ = new Env("欧莱雅追光赛");

let defaultUA = 'JD4iPhone/168158 (iPhone; iOS 15.0; Scale/3.00)'
let Referer = 'https://service.vapp.jd.com/83696F0817412432030952FF72117A11/1/page-frame.html'
let phaseId = ''
let goodsList = []
let skipTask = ['purchaseProducts','help']
let venderId = '1000002662'

let NUM_MAX_COMMON_RETRY = 2
let WAIT_TIME_COMMON_RETRY = 200

///////////////////////////////////////////////////////////////////
class UserClass {
    constructor(paramIn) {
        Object.assign(this,paramIn)
        this.name = decodeURIComponent(this.pt_pin)
        this.valid = false
        this.auth = ''
        this.canDraw = true
    }
    
    populateUrlObject(paramIn={}){
        let host = paramIn.url.replace('//','/').split('/')[1]
        let queryStr = paramIn.queryParam ? '?' + $.json2str({obj:paramIn.queryParam,connector:'&'}) : ''
        let urlObject = {
            url: paramIn.url + queryStr,
            headers: {
                'Host': host,
                'Connection': 'keep-alive',
                'Referer': Referer,
                'User-Agent': defaultUA,
                'Authorization': this.auth,
            },
            timeout: 5000,
        }
        if(paramIn.headers) {
            Object.assign(urlObject.headers,paramIn.headers)
        }
        if(paramIn.body) {
            let str = paramIn.body
            let contentType = paramIn['Content-Type'] || 'application/json'
            if(typeof paramIn.body === "object") {
                if(contentType.includes('json')) {
                    str = JSON.stringify(paramIn.body)
                } else {
                    let connector = paramIn.connector===undefined ? '&' : paramIn.connector
                    let encodeUrl = paramIn.encodeUrl===undefined ? true : paramIn.encodeUrl
                    let isSort = paramIn.isSort===undefined ? true : paramIn.isSort
                    let objParam = {obj:paramIn.body,connector,encodeUrl,isSort}
                    str = $.json2str(objParam)
                }
            }
            urlObject.body = str
            urlObject.headers['Content-Type'] =  contentType
            urlObject.headers['Content-Length'] = urlObject.body ? urlObject.body.length : 0
        }
        return urlObject;
    }
    
    async taskApi(paramIn={}) {
        let paramOut = {
            statusCode: -1,
        }
        let numRetry = 0
        try {
            while(paramOut.statusCode == -1 && numRetry <= NUM_MAX_COMMON_RETRY) {
                numRetry++
                await got[paramIn.method](paramIn.urlObject).then(async resp => {
                    paramOut.statusCode = resp?.statusCode || paramOut.statusCode
                    paramOut.resp = resp
                    if(resp?.statusCode == 200 || resp?.statusCode == 201) {
                        if(resp?.body) {
                            try {
                                paramOut.result = JSON.parse(resp.body)
                            } catch(e) {
                                paramOut.result = resp.body
                            }
                        } else {
                            if(!paramIn.allowNull) {
                                console.log(`账号${this.index}[${this.name}]调用[${paramIn.method}][${paramIn.fn}]出错，返回为空`)
                                if(numRetry < NUM_MAX_COMMON_RETRY) {
                                    console.log(`账号${this.index}[${this.name}]重试第${numRetry}次`)
                                    //允许重试，将状态码设置为-1
                                    paramOut.statusCode = -1
                                }
                            }
                        }
                    } else {
                        console.log(`账号${this.index}[${this.name}]调用[${paramIn.method}][${paramIn.fn}]出错，返回状态码[${paramOut.statusCode}]`)
                        if(numRetry <= NUM_MAX_COMMON_RETRY) {
                            console.log(`账号${this.index}[${this.name}]重试第${numRetry}次`)
                            //允许重试，将状态码设置为-1
                            paramOut.statusCode = -1
                            await $.wait(WAIT_TIME_COMMON_RETRY);
                        }
                    }
                }, async err => {
                    paramOut.statusCode = err?.response?.statusCode || paramOut.statusCode
                    paramOut.err = err
                    if(paramOut.statusCode != -1) {
                        console.log(`账号${this.index}[${this.name}]调用[${paramIn.method}][${paramIn.fn}]出错，返回状态码[${paramOut.statusCode}]`)
                        if(numRetry <= NUM_MAX_COMMON_RETRY) {
                            console.log(`账号${this.index}[${this.name}]重试第${numRetry}次`)
                            //允许重试，将状态码设置为-1
                            paramOut.statusCode = -1
                            await $.wait(WAIT_TIME_COMMON_RETRY);
                        }
                    } else {
                        console.log(`账号${this.index}[${this.name}]调用[${paramIn.method}][${paramIn.fn}]没有返回，重试第${numRetry}次`)
                    }
                })
            }
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(paramOut);
        }
    }
    
    async getAppInfo(paramIn={}) {
        let paramOut = {}
        try {
            let urlObjParam = {
                url : `https://olytxz.guanmeikj.com/api/getAppInfo`,
            }
            let urlObject = this.populateUrlObject(urlObjParam)
            let taskApiParam = {
                fn : 'getAppInfo',
                method : 'get',
                urlObject : urlObject,
            }
            paramOut = await this.taskApi(taskApiParam)
            if(paramOut.result && typeof paramOut.result === 'object') {
                let result = paramOut.result
                if(result.code == 200) {
                    phaseId = result.data.phaseId
                    goodsList = result.data.cfg.add_goods.ids
                } else {
                    console.log(`获取游戏参数失败：${result.errorMessage||result.message}`)
                }
            }
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(paramOut)
        }
    }
    
    async isvObfuscator(paramIn={}) {
        let paramOut = {}
        try {
            let urlObject = {
                url: `https://api.m.jd.com/client.action?functionId=isvObfuscator`,
                headers: {
                    'Host': 'api.m.jd.com',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Connection': 'keep-alive',
                    'Cookie': this.cookie,
                    'User-Agent': defaultUA,
                },
                body:  `body=%7B%22url%22%3A%22https%3A//lzdz1-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&uuid=1613464bc32f8ab8fff55da74e0b43bf9ef1900e&client=apple&clientVersion=10.1.4&st=1646275349648&sv=111&sign=a9415c2cf9ef41af64faeae72b329ea1`
            }
            let taskApiParam = {
                fn : 'isvObfuscator',
                method : 'post',
                urlObject : urlObject,
            }
            paramOut = await this.taskApi(taskApiParam)
            if(paramOut.result && typeof paramOut.result === 'object') {
                let result = paramOut.result
                if(result.code == 0) {
                    this.isvToken = result.token
                    await this.jdLogin();
                } else {
                    console.log(`获取isvToken失败：${result.errorMessage||result.message}`)
                }
            }
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(paramOut)
        }
    }
    
    async jdLogin(paramIn={}) {
        let paramOut = {}
        try {
            let urlObjParam = {
                url : `https://olytxz.guanmeikj.com/api/libUser/jdLogin`,
                queryParam: {
                    isvToken: this.isvToken,
                    phaseId: phaseId,
                },
            }
            let urlObject = this.populateUrlObject(urlObjParam)
            let taskApiParam = {
                fn : 'jdLogin',
                method : 'get',
                urlObject : urlObject,
            }
            paramOut = await this.taskApi(taskApiParam)
            if(paramOut.result && typeof paramOut.result === 'object') {
                let result = paramOut.result
                if(result.code == 200) {
                    this.auth = result.data.token
                    await this.getMyInfo();
                } else {
                    console.log(`获取token失败：${result.errorMessage||result.message}`)
                }
            }
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(paramOut)
        }
    }
    
    async getMyInfo(paramIn={}) {
        let paramOut = {}
        try {
            let urlObjParam = {
                url : `https://olytxz.guanmeikj.com/api/getMyInfo`,
                queryParam: {
                    sopenId: '',
                },
            }
            let urlObject = this.populateUrlObject(urlObjParam)
            let taskApiParam = {
                fn : 'getMyInfo',
                method : 'get',
                urlObject : urlObject,
            }
            paramOut = await this.taskApi(taskApiParam)
            if(paramOut.result && typeof paramOut.result === 'object') {
                let result = paramOut.result
                if(result.code == 200) {
                    this.score = result.data.score
                    console.log(`积分：${this.score}`)
                    await this.getTaskList();
                    while(this.score > 300 && this.canDraw) {
                        this.score -= 300;
                        //await $.wait(500);
                        await this.luckPrize();
                    }
                } else {
                    console.log(`获取个人信息失败：${result.errorMessage||result.message}`)
                }
            }
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(paramOut)
        }
    }
    
    async getTaskList(paramIn={}) {
        let paramOut = {}
        try {
            let urlObjParam = {
                url : `https://olytxz.guanmeikj.com/api/getTaskList`,
            }
            let urlObject = this.populateUrlObject(urlObjParam)
            let taskApiParam = {
                fn : 'getTaskList',
                method : 'get',
                urlObject : urlObject,
            }
            paramOut = await this.taskApi(taskApiParam)
            if(paramOut.result && typeof paramOut.result === 'object') {
                let result = paramOut.result
                //console.log(result)
                if(result.code == 200) {
                    this.playNum = result.data.playNum
                    console.log(`游戏次数：${this.playNum}`)
                    for(let task of result.data.taskList) {
                        console.log(`任务[${task.name}] -- ${task.state?'已':'未'}完成，${task.num}/${task.max}`)
                        if(!task.state && !skipTask.includes(task.key)) {
                            for(let i=task.num; i<task.max; i++) {
                                let skuId = goodsList[i]
                                await this.doneTask(task,skuId)
                            }
                        }
                    }
                    for(let i=0; i<this.playNum; i++) {
                       //await $.wait(200);
                       await this.playGame(); 
                    }
                } else {
                    console.log(`获取任务列表失败：${result.errorMessage||result.message}`)
                }
            }
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(paramOut)
        }
    }
    
    async doneTask(task,skuId) {
        let paramOut = {}
        try {
            let urlObjParam = {
                url : `https://olytxz.guanmeikj.com/api/doneTask`,
                queryParam: {
                    key: task.key,
                    skuId: skuId,
                }
            }
            let urlObject = this.populateUrlObject(urlObjParam)
            let taskApiParam = {
                fn : 'doneTask',
                method : 'get',
                urlObject : urlObject,
            }
            paramOut = await this.taskApi(taskApiParam)
            if(paramOut.result && typeof paramOut.result === 'object') {
                let result = paramOut.result
                //console.log(result)
                if(result.code == 200) {
                    this.playNum = result.data.playNum
                    console.log(`完成任务[${task.name}]成功，游戏次数：${this.playNum}`)
                } else {
                    console.log(`完成任务[${task.name}]失败：${result.errorMessage||result.message}`)
                }
            }
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(paramOut)
        }
    }
    
    async playGame(paramIn={}) {
        let paramOut = {}
        try {
            let urlObjParam = {
                url : `https://olytxz.guanmeikj.com/api/playGame`,
            }
            let urlObject = this.populateUrlObject(urlObjParam)
            let taskApiParam = {
                fn : 'playGame',
                method : 'get',
                urlObject : urlObject,
            }
            paramOut = await this.taskApi(taskApiParam)
            if(paramOut.result && typeof paramOut.result === 'object') {
                let result = paramOut.result
                if(result.code == 200) {
                    //await $.wait(200);
                    await this.gameOver();
                } else {
                    console.log(`开始游戏失败：${result.errorMessage||result.message}`)
                }
            }
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(paramOut)
        }
    }
    
    async gameOver(paramIn={}) {
        let paramOut = {}
        try {
            let urlObjParam = {
                url : `https://olytxz.guanmeikj.com/api/gameOver`,
                body: {
                    score: parseInt(Math.random()*8+4)*100,
                }
            }
            let urlObject = this.populateUrlObject(urlObjParam)
            let taskApiParam = {
                fn : 'gameOver',
                method : 'post',
                urlObject : urlObject,
            }
            paramOut = await this.taskApi(taskApiParam)
            if(paramOut.result && typeof paramOut.result === 'object') {
                let result = paramOut.result
                if(result.code == 200) {
                    this.score = result.data.score
                    console.log(`玩游戏成功，现在积分：${result.data.score}`)
                } else {
                    console.log(`玩游戏失败：${result.errorMessage||result.message}`)
                }
            }
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(paramOut)
        }
    }
    
    async luckPrize(paramIn={}) {
        let paramOut = {}
        try {
            let urlObjParam = {
                url : `https://olytxz.guanmeikj.com/api/luckPrize`,
            }
            let urlObject = this.populateUrlObject(urlObjParam)
            let taskApiParam = {
                fn : 'luckPrize',
                method : 'get',
                urlObject : urlObject,
            }
            paramOut = await this.taskApi(taskApiParam)
            if(paramOut.result && typeof paramOut.result === 'object') {
                let result = paramOut.result
                if(result.code == 200) {
                    if(!result.data.prize.name.includes(`未中奖`)) {
                        $.logAndNotify(`中奖啦：${result.data.prize.name}`)
                    } else {
                        console.log(`抽奖：${result.data.prize.name}`)
                    }
                } else {
                    let msg = result.errorMessage||result.message
                    console.log(`抽奖失败：${msg}`)
                    if(msg.includes('会员才能参与抽奖')) {
                        this.canDraw = false
                    }
                }
            }
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(paramOut)
        }
    }
    
    async userTask() {
        try {
            console.log(`\n===== 账号${this.index}[${this.name}] =====`)
            if(!phaseId) await this.getAppInfo();
            await this.isvObfuscator();
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve()
        }
    }
}

!(async () => {
    if (typeof $request !== "undefined") {
        await GetRewrite()
    }else {
        if(!(await $.checkEnv())) return;
        
        for(let user of $.userList) {
            await user.userTask();
        }
    }
})()
.catch((e) => console.log(e))
.finally(() => $.done())

////////////////////////////////////////////////////////////////////
function Env(name,env) {
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
    return new class {
        constructor(name,env) {
            this.name = name
            this.notifyStr = ''
            this.envSplitor = ['&','\n']
            //默认读取环境变量的JD_COOKIE
            this.userCookie = process.env.JD_COOKIE || '';
            this.userList = []
            this.userIdx = 0
            this.userCount = 0
            Object.assign(this,env)
            this.startTime = Date.now()
            console.log(`${this.name} 开始运行：\n`)
        }
        async checkEnv(paramIn={}) {
            if(this.userCookie) {
                let splitor = this.envSplitor[0];
                if(paramIn.splitor) {
                    splitor = paramIn.splitor
                } else {
                    for(let sp of this.envSplitor) {
                        if(this.userCookie.indexOf(sp) > -1) {
                            splitor = sp;
                            break;
                        }
                    }
                }
                for(let userCookies of this.userCookie.split(splitor)) {
                    if(userCookies) {
                        let pt_key = userCookies.match(/pt_key=([\w\-]+)/)
                        let pt_pin = userCookies.match(/pt_pin=([\w\-\%]+)/)
                        if(pt_key && pt_pin) {
                            let param = {
                                cookie: userCookies,
                                pt_key: pt_key[1],
                                pt_pin: pt_pin[1],
                                index: ++this.userIdx,
                            }
                            this.userList.push(new UserClass(param))
                        }
                    }
                }
                this.userCount = this.userList.length
            } else {
                console.log('未找到有效的CK')
                return false;
            }
            console.log(`共找到${this.userCount}个账号`)
            return true
        }
        async showmsg(paramIn={}) {
            if(!this.notifyStr) return;
            let notifyBody = this.name + " 运行通知\n\n" + this.notifyStr
            var notify = require('./sendNotify');
            console.log('\n============== 推送 ==============')
            await notify.sendNotify(this.name, notifyBody);
        }
        async done(paramIn={}) {
            await this.showmsg();
            const e = (new Date).getTime(),
            s = (e - this.startTime) / 1e3;
            console.log(`\n${this.name} 运行结束，共运行了 ${s} 秒！`)
            process.exit(0)
        }
        logAndNotify(str) {
            console.log(str)
            this.notifyStr += str + '\n'
        }
        logAndNotifyWithTime(str) {
            this.logAndNotify(`[${this.time({'format':'hh:mm:ss.S'})}]${str}`)
        }
        logWithTime(str) {
            console.log(`[${this.time({'format':'hh:mm:ss.S'})}]${str}`)
        }
        getMin(a,b){
            return ((a<b) ? a : b)
        }
        getMax(a,b){
            return ((a<b) ? b : a)
        }
        padStr(paramIn={}) {
            let numStr = String(paramIn.str)
            let numPad = (paramIn.len>numStr.length) ? (len-numStr.length) : 0
            let retStr = ''
            for(let i=0; i<numPad; i++) {
                retStr += (paramIn.padding || 0)
            }
            retStr += numStr
            return retStr;
        }
        ecPadStr(str,len,padding=0) {
            let numStr = String(str)
            let numPad = (len>numStr.length) ? (len-numStr.length) : 0
            let retStr = ''
            for(let i=0; i<numPad; i++) {
                retStr += (padding || 0)
            }
            retStr += numStr
            return retStr;
        }
        json2str(paramIn={}) {
            let ret = []
            let obj = paramIn.obj
            let connector = paramIn.connector || '&'
            let keys = Object.keys(obj)
            if(paramIn.isSort) keys = keys.sort()
            for(let key of keys) {
                let v = obj[key]
                if(v && paramIn.encodeUrl) v = encodeURIComponent(v)
                ret.push(key+'='+v)
            }
            return ret.join(connector);
        }
        str2json(paramIn={}) {
            let ret = {}
            let connector = paramIn.connector || '&'
            for(let item of paramIn.str.split(connector)) {
                if(!item) continue;
                let idx = item.indexOf('=')
                if(idx == -1) continue;
                let k = item.substr(0,idx)
                let v = item.substr(idx+1)
                if(paramIn.decodeUrl) v = decodeURIComponent(v)
                ret[k] = v
            }
            return ret;
        }
        randomPattern(paramIn={}) {
            let charset = paramIn.charset || 'abcdef0123456789'
            let str = ''
            for(let chars of paramIn.pattern) {
                if(chars == 'x') {
                    str += charset.charAt(Math.floor(Math.random()*charset.length));
                } else if(chars == 'X') {
                    str += charset.charAt(Math.floor(Math.random()*charset.length)).toUpperCase();
                } else {
                    str += chars
                }
            }
            return str
        }
        randomString(paramIn={}) {
            let charset = paramIn.charset || 'abcdef0123456789'
            let str = '';
            for (let i = 0; i < paramIn.len; i++) {
                str += charset[Math.floor(Math.random()*charset.length)];
            }
            return str;
        }
        randomList(paramIn={}) {
            let l = paramIn.list
            let idx = Math.floor(Math.random()*l.length)
            return l[idx]
        }
        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }
        randomWait(basetime,randomtime) {
            if(basetime == 0) return;
            let t = Math.floor(Math.random()*randomtime) + basetime
            return this.wait(t)
        }
        time(paramIn={}) {
            let str = paramIn.format
            let xt = paramIn.time ? new Date(paramIn.time) : new Date
            let e = {
                "M+": xt.getMonth() + 1,
                "d+": xt.getDate(),
                "h+": xt.getHours(),
                "m+": xt.getMinutes(),
                "s+": xt.getSeconds(),
                "q+": Math.floor((xt.getMonth() + 3) / 3),
                S: xt.getMilliseconds()
            };
            /(y+)/.test(str) && (str = str.replace(RegExp.$1, (xt.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let s in e)
                new RegExp("(" + s + ")").test(str) && (str = str.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length)));
            return str
        }
    }(name,env)
}