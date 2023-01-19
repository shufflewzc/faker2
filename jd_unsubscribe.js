/*
 * @Author: X1a0He
 * @LastEditors: X1a0He
 * @Description: 批量取关京东店铺和商品
 * @Fixed: 不再支持Qx，仅支持Node.js
 */
const $ = new Env('批量取关店铺和商品');
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const notify = $.isNode() ? require('./sendNotify') : '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
if($.isNode()){
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if(process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
let args_xh = {
    /*
     * 跳过某个指定账号，默认为全部账号清空
     * 填写规则：例如当前Cookie1为pt_key=key; pt_pin=pin1;则环境变量填写pin1即可，此时pin1的购物车将不会被清空
     * 若有更多，则按照pin1@pin2@pin3进行填写
     * 环境变量名称：XH_UNSUB_EXCEPT
     */
    except: process.env.XH_UNSUB_EXCEPT && process.env.XH_UNSUB_EXCEPT.split('@') || [],
    /*
     * 是否执行取消关注，默认true
     * 可通过环境变量控制：JD_UNSUB
     * */
    isRun: process.env.JD_UNSUB === 'true' || true,
    /*
     * 执行完毕是否进行通知，默认false
     * 可用环境变量控制：JD_UNSUB_NOTIFY
     * */
    isNotify: process.env.JD_UNSUB_NOTIFY === 'true' || false,
    /*
     * 每次获取已关注的商品数
     * 可设置环境变量：JD_UNSUB_GPAGESIZE，默认为20，不建议超过20
     * */
    goodPageSize: process.env.JD_UNSUB_GPAGESIZE * 1 || 20,
    /*
     * 每次获取已关注的店铺数
     * 可设置环境变量：JD_UNSUB_SPAGESIZE，默认为20，不建议超过20
     * */
    shopPageSize: process.env.JD_UNSUB_SPAGESIZE * 1 || 20,
    /*
     * 商品类过滤关键词，只要商品名内包含关键词，则不会被取消关注
     * 可设置环境变量：JD_UNSUB_GKEYWORDS，用@分隔
     * */
    goodsKeyWords: process.env.JD_UNSUB_GKEYWORDS && process.env.JD_UNSUB_GKEYWORDS.split('@') || [],
    /*
     * 店铺类过滤关键词，只要店铺名内包含关键词，则不会被取消关注
     * 可设置环境变量：JD_UNSUB_SKEYWORDS，用@分隔
     * */
    shopKeyWords: process.env.JD_UNSUB_SKEYWORDS && process.env.JD_UNSUB_SKEYWORDS.split('@') || [],
    /*
     * 间隔，防止提示操作频繁，单位毫秒(1秒 = 1000毫秒)
     * 可用环境变量控制：JD_UNSUB_INTERVAL，默认为3000毫秒
     * */
    unSubscribeInterval: process.env.JD_UNSUB_INTERVAL * 1 || 1000,
    /*
     * 是否打印日志
     * 可用环境变量控制：JD_UNSUB_PLOG，默认为true
     * */
    printLog: process.env.JD_UNSUB_PLOG === 'true' || true,
    /*
     * 失败次数，当取关商品或店铺时，如果连续 x 次失败，则结束本次取关，防止死循环
     * 可用环境变量控制：JD_UNSUB_FAILTIMES，默认为3次
     * */
    failTimes: process.env.JD_UNSUB_FAILTIMES || 3
}
!(async() => {
    console.log('X1a0He留：运行前请看好脚本内的注释，日志已经很清楚了，有问题带着日志来问')
    if(args_xh.isRun){
        if(!cookiesArr[0]){
            $.msg('【京东账号一】取关京东店铺商品失败', '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {
                "open-url": "https://bean.m.jd.com/bean/signIndex.action"
            });
        }
        await requireConfig();
        for(let i = 0; i < cookiesArr.length; i++){
            if(cookiesArr[i]){
                cookie = cookiesArr[i];
                $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
                $.index = i + 1;
                $.isLogin = true;
                $.nickName = '';
                //await TotalBean();
                console.log(`\n****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
                if(args_xh.except.includes($.UserName)){
                    console.log(`跳过账号：${$.nickName || $.UserName}`)
                    continue
                }
                if(!$.isLogin){
                    $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {
                        "open-url": "https://bean.m.jd.com/bean/signIndex.action"
                    });
                    if($.isNode()){
                        await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                    }
                    continue
                }
                $.shopsKeyWordsNum = 0;
                $.goodsKeyWordsNum = 0;
                $.unsubscribeGoodsNum = 0;
                $.unsubscribeShopsNum = 0;
                $.goodsTotalNum = 0     //记录当前总共关注了多少商品
                $.shopsTotalNum = 0;    //记录当前总共关注了多少店铺
                $.commIdList = ``;
                $.shopIdList = ``;
                $.endGoods = $.endShops = false;
                $.failTimes = 0;
                // console.log(`=====京东账号${$.index} ${$.nickName || $.UserName}内部变量=====`)
                // console.log(`$.unsubscribeGoodsNum: ${$.unsubscribeGoodsNum}`)
                // console.log(`$.unsubscribeShopsNum: ${$.unsubscribeShopsNum}`)
                // console.log(`$.goodsTotalNum: ${$.goodsTotalNum}`)
                // console.log(`$.shopsTotalNum: ${$.shopsTotalNum}`)
                // console.log(`$.commIdList: ${$.commIdList}`)
                // console.log(`$.shopIdList: ${$.shopIdList}`)
                // console.log(`$.failTimes: ${$.failTimes}`)
                // console.log(`================`)
                await favCommQueryFilter(); //获取商品并过滤
                await $.wait(args_xh.unSubscribeInterval)
                if(!$.endGoods && parseInt($.goodsTotalNum) !== parseInt($.goodsKeyWordsNum)) await favCommBatchDel();//取关商品
                else console.log("不执行取消收藏商品\n")
                await $.wait(args_xh.unSubscribeInterval)
                await queryShopFavList();   //获取店铺并过滤
                await $.wait(args_xh.unSubscribeInterval)
                if(!$.endShops && parseInt($.shopsTotalNum) !== parseInt($.shopsKeyWordsNum)) await batchunfollow();      //取关店铺
                else console.log("不执行取消收藏店铺\n")
                do {
                    //如果商品总数和店铺总数都为0则已清空，跳出循环
                    if(parseInt($.goodsTotalNum) === 0 && parseInt($.shopsTotalNum) === 0) break;
                    else {
                        //如果商品总数或店铺总数有一个不为0的话，先判断是哪个不为0
                        if(parseInt($.goodsTotalNum) !== 0){
                            if(parseInt($.goodsTotalNum) === parseInt($.goodsKeyWordsNum)) break;
                            else {
                                $.commIdList = ``
                                await favCommQueryFilter(); //获取商品并过滤
                                await $.wait(args_xh.unSubscribeInterval)
                                if(!$.endGoods && parseInt($.goodsTotalNum) !== parseInt($.goodsKeyWordsNum)) await favCommBatchDel();    //取关商品
                                else console.log("不执行取消收藏商品\n")
                            }
                        } else if(parseInt($.shopsTotalNum) !== 0){
                            if(parseInt($.shopsTotalNum) === parseInt($.shopsKeyWordsNum)) break;
                            else {
                                $.shopIdList = ``
                                await queryShopFavList();   //获取店铺并过滤
                                await $.wait(args_xh.unSubscribeInterval)
                                if(!$.endShops && parseInt($.shopsTotalNum) !== parseInt($.shopsKeyWordsNum)) await batchunfollow();      //取关店铺
                                else console.log("不执行取消收藏店铺\n")
                            }
                        }
                    }
                    if($.failTimes >= args_xh.failTimes){
                        console.log('失败次数到达设定值，触发防死循环机制，该帐号已跳过');
                        break;
                    }
                } while(true)
                await showMsg_xh();
            }
        }
    }
})().catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
    $.done();
})

function requireConfig(){
    return new Promise(resolve => {
        if($.isNode() && process.env.JD_UNSUB){
            console.log('=====环境变量配置如下=====')
            console.log(`except: ${typeof args_xh.except}, ${args_xh.except}`)
            console.log(`isNotify: ${typeof args_xh.isNotify}, ${args_xh.isNotify}`)
            console.log(`goodPageSize: ${typeof args_xh.goodPageSize}, ${args_xh.goodPageSize}`)
            console.log(`shopPageSize: ${typeof args_xh.shopPageSize}, ${args_xh.shopPageSize}`)
            console.log(`goodsKeyWords: ${typeof args_xh.goodsKeyWords}, ${args_xh.goodsKeyWords}`)
            console.log(`shopKeyWords: ${typeof args_xh.shopKeyWords}, ${args_xh.shopKeyWords}`)
            console.log(`unSubscribeInterval: ${typeof args_xh.unSubscribeInterval}, ${args_xh.unSubscribeInterval}`)
            console.log(`printLog: ${typeof args_xh.printLog}, ${args_xh.printLog}`)
            console.log(`failTimes: ${typeof args_xh.failTimes}, ${args_xh.failTimes}`)
            console.log('=======================')
        }
        resolve()
    })
}

function showMsg_xh(){
    if(args_xh.isNotify){
        $.msg($.name, ``, `【京东账号${$.index}】${$.nickName}\n【还剩关注店铺】${$.shopsTotalNum}个\n【还剩关注商品】${$.goodsTotalNum}个`);
    } else {
        $.log(`【京东账号${$.index}】${$.nickName}\n【还剩关注店铺】${$.shopsTotalNum}个\n【还剩关注商品】${$.goodsTotalNum}个`);
    }
}

function getSubstr(str, leftStr, rightStr){
    let left = str.indexOf(leftStr);
    let right = str.indexOf(rightStr, left);
    if(left < 0 || right < left) return '';
    return str.substring(left + leftStr.length, right);
}

function favCommQueryFilter(){
    return new Promise((resolve) => {
        console.log('正在获取已关注的商品...')
        const option = {
            url: `https://wq.jd.com/fav/comm/FavCommQueryFilter?cp=1&pageSize=${args_xh.goodPageSize}&category=0&promote=0&cutPrice=0&coupon=0&stock=0&sceneval=2`,
            headers: {
                "Cookie": cookie,
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                "Referer": "https://wqs.jd.com/"
            },
        }
        $.get(option, async(err, resp, data) => {
            try{
                if(data.indexOf("Authorization") !== -1){
                    console.log("获取数据失败，401 Authorization Required，可能是User-Agent的问题")
                    return;
                }
                data = JSON.parse(getSubstr(data, "try{(", ");}catch(e){}"));
                if(data.iRet === '0'){
                    $.goodsTotalNum = parseInt(data.totalNum);
                    console.log(`当前已关注商品：${$.goodsTotalNum}个`)
                    $.goodsKeyWordsNum = 0;
                    for(let item of data.data){
                        if(args_xh.goodsKeyWords.some(keyword => item.commTitle.includes(keyword))){
                            args_xh.printLog ? console.log(`${item.commTitle} `) : ''
                            args_xh.printLog ? console.log('商品被过滤，含有关键词\n') : ''
                            $.goodsKeyWordsNum += 1;
                        } else {
                            $.commIdList += item.commId + ",";
                            $.unsubscribeGoodsNum++;
                        }
                    }
                } else {
                    $.endGoods = true;
                    console.log("无商品可取消收藏\n");
                }
            } catch(e){
                $.logErr(e, resp);
            } finally{
                resolve(data);
            }
        });
    })
}

function favCommBatchDel(){
    return new Promise(resolve => {
        console.log("正在取消收藏商品...")
        const option = {
            url: `https://wq.jd.com/fav/comm/FavCommBatchDel?commId=${$.commIdList}&sceneval=2&g_login_type=1`,
            headers: {
                "Cookie": cookie,
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                "Referer": "https://wqs.jd.com/"
            },
        }
        $.get(option, (err, resp, data) => {
            try{
                if(data.indexOf("Authorization") !== -1){
                    console.log("获取数据失败，401 Authorization Required，可能是User-Agent的问题")
                    return;
                }
                data = JSON.parse(data);
                if(data.iRet === "0" && data.errMsg === "success"){
                    console.log(`成功取消收藏商品：${$.unsubscribeGoodsNum}个\n`)
                    $.failTimes = 0;
                } else {
                    console.log(`批量取消收藏商品失败，失败次数：${++$.failTimes}\n`, data)
                }
            } catch(e){
                $.logErr(e, resp);
            } finally{
                resolve(data);
            }
        });
    })
}

function queryShopFavList(){
    return new Promise((resolve) => {
        console.log("正在获取已关注的店铺...")
        const option = {
            url: `https://wq.jd.com/fav/shop/QueryShopFavList?cp=1&pageSize=${args_xh.shopPageSize}&sceneval=2&g_login_type=1&callback=jsonpCBKA`,
            headers: {
                "Cookie": cookie,
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                "Referer": "https://wqs.jd.com/"
            },
        }
        $.get(option, (err, resp, data) => {
            try{
                if(data.indexOf("Authorization") !== -1){
                    console.log("获取数据失败，401 Authorization Required，可能是User-Agent的问题")
                    return;
                }
                data = JSON.parse(getSubstr(data, "try{jsonpCBKA(", ");}catch(e){}"));
                if(data.iRet === '0'){
                    $.shopsTotalNum = parseInt(data.totalNum);
                    console.log(`当前已关注店铺：${$.shopsTotalNum}个`)
                    if(data.data.length > 0){
                        $.shopsKeyWordsNum = 0;
                        for(let item of data.data){
                            if(args_xh.shopKeyWords.some(keyword => item.shopName.includes(keyword))){
                                args_xh.printLog ? console.log('店铺被过滤，含有关键词') : ''
                                args_xh.printLog ? console.log(`${item.shopName}\n`) : ''
                                $.shopsKeyWordsNum += 1;
                            } else {
                                $.shopIdList += item.shopId + ",";
                                $.unsubscribeShopsNum++;
                            }
                        }
                    } else {
                        $.endShops = true;
                        console.log("无店铺可取消关注\n");
                    }
                } else console.log(`获取已关注店铺失败：${JSON.stringify(data)}`)
            } catch(e){
                $.logErr(e, resp);
            } finally{
                resolve(data);
            }
        });
    })
}

function batchunfollow(){
    return new Promise(resolve => {
        console.log('正在执行批量取消关注店铺...')
        const option = {
            url: `https://wq.jd.com/fav/shop/batchunfollow?shopId=${$.shopIdList}&sceneval=2&g_login_type=1`,
            headers: {
                "Cookie": cookie,
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                "Referer": "https://wqs.jd.com/"
            },
        }
        $.get(option, (err, resp, data) => {
            try{
                if(data.indexOf("Authorization") !== -1){
                    console.log("获取数据失败，401 Authorization Required，可能是User-Agent的问题")
                    return;
                }
                data = JSON.parse(data);
                if(data.iRet === "0"){
                    console.log(`已成功取消关注店铺：${$.unsubscribeShopsNum}个\n`)
                    $.failTimes = 0;
                } else {
                    console.log(`批量取消关注店铺失败，失败次数：${++$.failTimes}\n`)
                }
            } catch(e){
                $.logErr(e, resp);
            } finally{
                resolve(data);
            }
        });
    })
}

function TotalBean(){
    return new Promise(async resolve => {
        const options = {
            "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
            "headers": {
                "Accept": "application/json,text/plain, */*",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-cn",
                "Connection": "keep-alive",
                "Cookie": cookie,
                "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
            }
        }
        $.post(options, (err, resp, data) => {
            try{
                if(err){
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if(data){
                        data = JSON.parse(data);
                        if(data['retcode'] === 13){
                            $.isLogin = false; //cookie过期
                            return
                        }
                        if(data['retcode'] === 0){
                            $.nickName = (data['base'] && data['base'].nickname) || $.UserName;
                        } else {
                            $.nickName = $.UserName
                        }
                    } else {
                        console.log(`京东服务器返回空数据`)
                    }
                }
            } catch(e){
                $.logErr(e, resp)
            } finally{
                resolve();
            }
        })
    })
}

function jsonParse(str){
    if(typeof str == "string"){
        try{
            return JSON.parse(str);
        } catch(e){
            console.log(e);
            $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
            return [];
        }
    }
}

// prettier-ignore
function Env(t, e){
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);

    class s{
        constructor(t){
            this.env = t
        }

        send(t, e = "GET"){
            t = "string" == typeof t ? {
                url: t
            } : t;
            let s = this.get;
            return "POST" === e && (s = this.post), new Promise((e, i) => {
                s.call(this, t, (t, s, r) => {
                    t ? i(t) : e(s)
                })
            })
        }

        get(t){
            return this.send.call(this.env, t)
        }

        post(t){
            return this.send.call(this.env, t, "POST")
        }
    }

    return new class{
        constructor(t, e){
            this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`)
        }

        isNode(){
            return "undefined" != typeof module && !!module.exports
        }

        isQuanX(){
            return "undefined" != typeof $task
        }

        isSurge(){
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon
        }

        isLoon(){
            return "undefined" != typeof $loon
        }

        toObj(t, e = null){
            try{
                return JSON.parse(t)
            } catch{
                return e
            }
        }

        toStr(t, e = null){
            try{
                return JSON.stringify(t)
            } catch{
                return e
            }
        }

        getjson(t, e){
            let s = e;
            const i = this.getdata(t);
            if(i) try{
                s = JSON.parse(this.getdata(t))
            } catch{}
            return s
        }

        setjson(t, e){
            try{
                return this.setdata(JSON.stringify(t), e)
            } catch{
                return !1
            }
        }

        getScript(t){
            return new Promise(e => {
                this.get({
                    url: t
                }, (t, s, i) => e(i))
            })
        }

        runScript(t, e){
            return new Promise(s => {
                let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                i = i ? i.replace(/\n/g, "").trim() : i;
                let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r;
                const [o, h] = i.split("@"), n = {
                    url: `http://${h}/v1/scripting/evaluate`,
                    body: {
                        script_text: t,
                        mock_type: "cron",
                        timeout: r
                    },
                    headers: {
                        "X-Key": o,
                        Accept: "*/*"
                    }
                };
                this.post(n, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }

        loaddata(){
            if(!this.isNode()) return {};
            {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e);
                if(!s && !i) return {};
                {
                    const i = s ? t : e;
                    try{
                        return JSON.parse(this.fs.readFileSync(i))
                    } catch(t){
                        return {}
                    }
                }
            }
        }

        writedata(){
            if(this.isNode()){
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e),
                    r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
            }
        }

        lodash_get(t, e, s){
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let r = t;
            for(const t of i)
                if(r = Object(r)[t], void 0 === r) return s;
            return r
        }

        lodash_set(t, e, s){
            return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
        }

        getdata(t){
            let e = this.getval(t);
            if(/^@/.test(t)){
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : "";
                if(r) try{
                    const t = JSON.parse(r);
                    e = t ? this.lodash_get(t, i, "") : e
                } catch(t){
                    e = ""
                }
            }
            return e
        }

        setdata(t, e){
            let s = !1;
            if(/^@/.test(e)){
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i),
                    h = i ? "null" === o ? null : o || "{}" : "{}";
                try{
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i)
                } catch(e){
                    const o = {};
                    this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i)
                }
            } else s = this.setval(t, e);
            return s
        }

        getval(t){
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }

        setval(t, e){
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }

        initGotEnv(t){
            this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
        }

        get(t, e = (() => {})){
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
                "X-Surge-Skip-Scripting": !1
            })), $httpClient.get(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
                hints: !1
            })), $task.fetch(t).then(t => {
                const {
                    statusCode: s,
                    statusCode: i,
                    headers: r,
                    body: o
                } = t;
                e(null, {
                    status: s,
                    statusCode: i,
                    headers: r,
                    body: o
                }, o)
            }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
                try{
                    if(t.headers["set-cookie"]){
                        const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                        s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
                    }
                } catch(t){
                    this.logErr(t)
                }
            }).then(t => {
                const {
                    statusCode: s,
                    statusCode: i,
                    headers: r,
                    body: o
                } = t;
                e(null, {
                    status: s,
                    statusCode: i,
                    headers: r,
                    body: o
                }, o)
            }, t => {
                const {
                    message: s,
                    response: i
                } = t;
                e(s, i, i && i.body)
            }))
        }

        post(t, e = (() => {})){
            if(t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
                "X-Surge-Skip-Scripting": !1
            })), $httpClient.post(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            });
            else if(this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
                hints: !1
            })), $task.fetch(t).then(t => {
                const {
                    statusCode: s,
                    statusCode: i,
                    headers: r,
                    body: o
                } = t;
                e(null, {
                    status: s,
                    statusCode: i,
                    headers: r,
                    body: o
                }, o)
            }, t => e(t));
            else if(this.isNode()){
                this.initGotEnv(t);
                const {
                    url: s,
                    ...i
                } = t;
                this.got.post(s, i).then(t => {
                    const {
                        statusCode: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    } = t;
                    e(null, {
                        status: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    }, o)
                }, t => {
                    const {
                        message: s,
                        response: i
                    } = t;
                    e(s, i, i && i.body)
                })
            }
        }

        time(t, e = null){
            const s = e ? new Date(e) : new Date;
            let i = {
                "M+": s.getMonth() + 1,
                "d+": s.getDate(),
                "H+": s.getHours(),
                "m+": s.getMinutes(),
                "s+": s.getSeconds(),
                "q+": Math.floor((s.getMonth() + 3) / 3),
                S: s.getMilliseconds()
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for(let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
            return t
        }

        msg(e = t, s = "", i = "", r){
            const o = t => {
                if(!t) return t;
                if("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? {
                    "open-url": t
                } : this.isSurge() ? {
                    url: t
                } : void 0;
                if("object" == typeof t){
                    if(this.isLoon()){
                        let e = t.openUrl || t.url || t["open-url"],
                            s = t.mediaUrl || t["media-url"];
                        return {
                            openUrl: e,
                            mediaUrl: s
                        }
                    }
                    if(this.isQuanX()){
                        let e = t["open-url"] || t.url || t.openUrl,
                            s = t["media-url"] || t.mediaUrl;
                        return {
                            "open-url": e,
                            "media-url": s
                        }
                    }
                    if(this.isSurge()){
                        let e = t.url || t.openUrl || t["open-url"];
                        return {
                            url: e
                        }
                    }
                }
            };
            if(this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog){
                let t = ["", "==============📣系统通知📣=============="];
                t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t)
            }
        }

        log(...t){
            t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
        }

        logErr(t, e){
            const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
        }

        wait(t){
            return new Promise(e => setTimeout(e, t))
        }

        done(t = {}){
            const e = (new Date).getTime(),
                s = (e - this.startTime) / 1e3;
            this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }(t, e)
}
