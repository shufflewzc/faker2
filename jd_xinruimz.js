/*
cron 30 6-20/3 * * * jd_xinruimz.js
TG https://t.me/duckjobs
Rpeo https://github.com/okyyds
需要手动选
入口: https://xinruimz-isv.isvjcloud.com/plantation

无助力
*/

const $ = new Env("颜究种植园");
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const notify = $.isNode() ? require('./sendNotify') : '';
let cookiesArr = [], cookie = '', message = '';
let waternum = 0;
let exfertilizer = true;
let xinruimz = false;
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
    let cookiesData = $.getdata('CookiesJD') || "[]";
    cookiesData = JSON.parse(cookiesData);
    cookiesArr = cookiesData.map(item => item.cookie);
    cookiesArr.reverse();
    cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')]);
    cookiesArr.reverse();
    cookiesArr = cookiesArr.filter(item => !!item);
}
if (process.env.xinruimz && process.env.xinruimz != "") {
    xinruimz = process.env.xinruimz;
}
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
        return;
    }
    UUID = getUUID('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    for (let i = 0; i < cookiesArr.length; i++) {
        if (xinruimz) {
            console.log('执行颜究种植园')
        } else {
            console.log('不执行颜究种植园 请设置环境变量 xinruimz ture')
            break;
        }
        UA = `jdapp;iPhone;10.1.6;13.5;${UUID};network/wifi;model/iPhone11,6;addressid/4596882376;appBuild/167841;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`;
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            $.hotFlag = false;
            await TotalBean();
            console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
                if ($.isNode()) {
                    await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                }
                continue
            }
            await main();
        }
    }
    if (message !== "") {
        if ($.isNode()) {
            await notify.sendNotify($.name, message)
        } else {
            $.msg($.name, '', message)
        }
    }
})().catch((e) => { $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '') }).finally(() => { $.done(); })

async function main() {
    $.tasklist = [];
    $.infoArr = [];
    $.token = '';
    $.accessToken = '';
    await getToken();
    if ($.token) {
        await taskPost('auth', `{ "token": "${$.token}", "source": "01" }`);
        // await taskPost('bind_friend_relation', `{"shop_id":0,"invite_user_id":"1612705"}`);
        if ($.accessToken) {
            await task('get_home_info');
            if (!$.hotFlag) {
                $.log(`去执行水滴任务\n`)
                await waterdotask();
                if ($.plantinfo) {
                    await plantinfo();
                    if ($.infoArr != '') {
                        for (const vo of $.infoArr) {
                            $.storefertilizer = '';
                            $.storewater = '';
                            if (vo.status === 1) {
                                console.log(`${vo.name}已经可以收取啦！`)
                                message += `\n【京东账号${$.index}】${$.nickName || $.UserName}\n${vo.name}已经可以收取啦！`
                            }
                            await task('fertilizer_state', `shop_id=${vo.shopid}`);
                            await task('fertilizer_task_info', `shop_id=${vo.shopid}`);
                            $.log(`\n去执行${vo.name}小样任务`)
                            await fertilizerdotask();
                            $.log(`\n去收取${vo.name}的水滴`)
                            await taskPost('collect_water', `{"position": ${vo.position}}`);
                            $.log(`\n去收取${vo.name}的肥料`)
                            await taskPost('collect_fertilizer', `{"shop_id": ${vo.shopid}}`);
                            await task('merchant_secondary_pages', `shop_id=${vo.shopid}&channel=index`);
                            if ($.storefertilizer > 0) {
                                if (vo.status === 0) {
                                    for (i = 0; i < $.storefertilizer / 10; i++) {
                                        $.log(`去执行${vo.name}施肥..`)
                                        await $.wait(1000);
                                        await taskPost('fertilization', `{"plant_id": ${vo.id}}`);
                                    }
                                } else {
                                    console.log('该植物不能施肥')
                                }
                            } else {
                                console.log('肥料不足，不施肥！')
                            }
                        }
                        console.log(`\n去执行浇水,共种植${$.infoArr.length}个小样，默认浇水第一个小样,如需浇其他小样，请设置waternum对应数组`)
                        for (i = 0; i < $.infoArr.length; i++) {
                            index = i + 1;
                            console.log(`第${index}个小样，${$.infoArr[i].name}`)
                        }
                        if ($.storewater > 0) {
                            for (x = 0; x < $.storewater / 10; x++) {
                                $.waterstatus = true;
                                water = $.infoArr[waternum];
                                $.log(`去执行${water.name}浇水..`)
                                await $.wait(1000);
                                await taskPost('watering', `{"plant_id": ${water.id}}`);
                                if (!$.waterstatus) { break }
                            }
                        } else {
                            console.log('水资源不足，不浇水！')
                        }
                    } else {
                        $.log('你还没有种植小样！')
                    }
                }
            } else {
                $.log('风险用户,快去买买买吧')
            }
        } else {
            $.log('获取accessToken失败')
        }
    } else {
        $.log('获取Token失败')
    }
}
async function plantinfo() {
    plantinfoX = [];
    let plantinfo = $.plantinfo;
    for (const vo in plantinfo) {
        plantinfoX.push({
            id: plantinfo[vo].data.id,
            name: plantinfo[vo].data.name,
            position: plantinfo[vo].data.position,
            shopid: plantinfo[vo].data.shop_id,
            status: plantinfo[vo].data.status,
        });
    }
    $.infoArr = plantinfoX.filter(item => item.id != undefined);
}
async function fertilizerdotask() {
    $.goldstatus = true;
    if ($.fertilizerlist && $.fertilizertasklist) {
        if ($.fertilizertasklist.shop) {
            $.log("去完成关注店铺任务..")
            if ($.fertilizerlist.view_shop === 0) {
                await task('fertilizer_shop_view', `shop_id=${$.fertilizertasklist.shop.id}`);
                await $.wait(2000);
            } else {
                $.log("任务完成")
            }
            $.log("去完成去看小样任务..")
            if ($.fertilizerlist.sample_view === 0) {
                await task('fertilizer_sample_view', `shop_id=${$.fertilizertasklist.shop.id}`);
                await $.wait(2000);
            } else {
                $.log("任务完成")
            }
            $.log("去完成关注并浏览美妆馆任务..")
            if ($.fertilizerlist.chanel_view === 0) {
                await task('fertilizer_chanel_view', `shop_id=${$.fertilizertasklist.shop.id}`);
                await $.wait(2000);
            } else {
                $.log("任务完成")
            }
            if (exfertilizer) {
                $.log("美妆币兑换肥料..")
                if ($.fertilizerlist.exchange === null || $.fertilizerlist.exchange != '5') {
                    for (let i = 0; i < 5; i++) {
                        await task('fertilizer_exchange', `shop_id=${$.fertilizertasklist.shop.id}`);
                        await $.wait(2000);
                        if (!$.goldstatus) { break }
                    }
                } else {
                    console.log("今日美妆币兑换肥料已经达到最大次数")
                }
            } else {
                $.log('你设置了美妆币不兑换肥料，如需开启请exfertilizer设置为true')
            }
        }
        if ($.fertilizertasklist.meetingplaces) {
            $.log("去完成逛会员页任务..")
            if ($.fertilizertasklist.meetingplaces.length != $.fertilizerlist.view_meetingplace.length) {
                for (const vo of $.fertilizertasklist.meetingplaces) {
                    await task('fertilizer_meetingplace_view', `meetingplace_id=${vo.id}&shop_id=${vo.shop_id}`);
                    await $.wait(2000);
                }
            } else {
                $.log("任务完成")
            }
        }
        if ($.fertilizertasklist.prodcuts && ["card","car"].includes(process.env.FS_LEVEL)) {
            $.log("去完成加购任务..")
            if ($.fertilizertasklist.prodcuts.length != $.fertilizerlist.view_product.length) {
                for (const vo of $.fertilizertasklist.prodcuts) {
                    await task('fertilizer_product_view', `product_id=${vo.id}&shop_id=${vo.shop_id}`);
                    await $.wait(2000);
                }
            } else {
                $.log("任务完成")
            }
        }
    }
}
async function waterdotask() {
    await task('water_task_info');
    await task('water_task_state');
    if ($.tasklist && $.viewlist) {
        if ($.tasklist.shops) {
            $.log("去完成浏览店铺任务..")
            if ($.tasklist.shops.length != $.viewlist.view_shop.length) {
                for (const vo of $.tasklist.shops) {
                    await task('water_shop_view', `shop_id=${vo.id}`);
                    await $.wait(2000);
                }
            } else {
                $.log("任务完成")
            }
        }
        if ($.tasklist.meetingplaces) {
            $.log("去完成浏览会场任务..")
            if ($.tasklist.meetingplaces.length != $.viewlist.view_meetingplace.length) {
                for (const vo of $.tasklist.meetingplaces) {
                    await task('water_meetingplace_view', `meetingplace_id=${vo.id}`);
                    await $.wait(2000);
                }
            } else {
                $.log("任务完成")
            }
        }
        if ($.tasklist.prodcuts) {
            $.log("去完成加购任务..")
            if ($.tasklist.prodcuts.length != $.viewlist.view_product.length) {
                for (const vo of $.tasklist.prodcuts) {
                    await task('water_product_view', `product_id=${vo.id}`);
                    await $.wait(2000);
                }
            } else {
                $.log("任务完成")
            }
        }
    } else {
        $.log('没有获取到任务列表！')
    }
}
async function task(function_id, body) {
    return new Promise(async resolve => {
        $.get(taskUrl(function_id, body), async (err, resp, data) => {
            try {
                if (data) {
                    data = JSON.parse(data);
                    switch (function_id) {
                        case 'get_home_info':
                            if (data) {
                                $.plantinfo = data.plant_info;
                            }
                            if (data.status_code === 403) {
                                $.hotFlag = true;
                            }
                            break;
                        case 'water_task_info':
                            $.tasklist = data;
                            break;
                        case 'water_task_state':
                            $.viewlist = data;
                            break;
                        case 'fertilizer_state':
                            $.fertilizerlist = data;
                            break;
                        case 'fertilizer_task_info':
                            $.fertilizertasklist = data;
                            break;
                        case 'merchant_secondary_pages':
                            if (data.shop) {
                                $.storefertilizer = data.user.store_fertilizer;
                                $.storewater = data.user.store_water;
                            }
                            if (data.status_code === 422) {
                                console.log(data.message)
                            }
                            break;
                        case 'water_shop_view':
                            console.log(`浏览成功,获得:${data.inc}水滴，总水滴：${data.store_water}滴水`)
                            break;
                        case 'water_meetingplace_view':
                            console.log(`浏览成功,获得:${data.inc}水滴，总水滴：${data.store_water}滴水`)
                            break;
                        case 'water_product_view':
                            console.log(`浏览成功,获得:${data.inc}水滴，总水滴：${data.store_water}滴水`)
                            break;
                        case 'fertilizer_shop_view':
                            console.log(`浏览成功,获得:${data.inc}肥料，总肥料：${data.store_fertilizer}肥料`)
                            break;
                        case 'fertilizer_meetingplace_view':
                            console.log(`浏览成功,获得:${data.inc}肥料，总肥料：${data.store_fertilizer}肥料`)
                            break;
                        case 'fertilizer_product_view':
                            console.log(`浏览成功,获得:${data.inc}肥料，总肥料：${data.store_fertilizer}肥料`)
                            break;
                        case 'fertilizer_sample_view':
                            console.log(`浏览成功,获得:${data.inc}肥料，总肥料：${data.store_fertilizer}肥料`)
                            break;
                        case 'fertilizer_chanel_view':
                            console.log(`浏览成功,获得:${data.inc}肥料，总肥料：${data.store_fertilizer}肥料`)
                            break;
                        case 'fertilizer_exchange':
                            if (data.inc) {
                                console.log(`兑换成功,获得:${data.inc}肥料，总肥料：${data.store_fertilizer}肥料`)
                            }
                            if (data.status_code === 422) {
                                console.log(data.message)
                                $.goldstatus = false;
                            }
                            break;
                        default:
                            $.log(JSON.stringify(data))
                            break;
                    }
                } else {
                    $.log(JSON.stringify(data))
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}
function taskPost(function_id, body) {
    return new Promise(async resolve => {
        $.post(taskPostUrl(function_id, body), async (err, resp, data) => {
            try {
                if (data) {
                    data = JSON.parse(data);
                    if (data) {
                        switch (function_id) {
                            case 'auth':
                                $.accessToken = data.access_token;
                                $.tokenType = data.token_type;
                                break;
                            case 'bind_friend_relation':
                                $.log(JSON.stringify(data))
                                break;
                            case 'collect_water':
                                if (data.status_code === 422) {
                                    console.log(data.message)
                                }
                                break;
                            case 'collect_fertilizer':
                                if (data.status_code === 422) {
                                    console.log(data.message)
                                }
                                break;
                            case 'watering':
                                if (data.water) {
                                    console.log(`浇水成功,目前总浇水：${data.water}滴,目前等级：${data.level}`)
                                }
                                if (data.status_code === 422) {
                                    console.log(data.message)
                                    $.waterstatus = false;
                                }
                                break;
                            case 'fertilization':
                                if (data.status_code === 422) {
                                    console.log(data.message)
                                } else {
                                    console.log(`施肥成功,目前总施肥：${data.fertilizer}滴,目前等级：${data.level}`)
                                }
                                break;
                            default:
                                $.log(JSON.stringify(data))
                                break;
                        }
                    } else {
                        $.log(JSON.stringify(data))
                    }
                }
            } catch (error) {
                $.log(error)
            } finally {
                resolve();
            }
        })
    })
}

function taskPostUrl(function_id, body) {
    return {
        url: `https://xinruimz-isv.isvjcloud.com/papi/${function_id}`,
        body: body,
        headers: {
            "Host": "xinruimz-isv.isvjcloud.com",
            "Accept": "application/x.jd-school-raffle.v1+json",
            "Authorization": `Bearer undefined` ? `${$.tokenType} ${$.accessToken}` : '',
            "Content-Type": "application/json;charset=utf-8",
            "Origin": "https://xinruimz-isv.isvjcloud.com",
            "User-Agent": UA,
            "Referer": "https://xinruimz-isv.isvjcloud.com/plantation/logined_jd/",
            "Connection": "keep-alive",
        }
    }
}

function taskUrl(function_id, body) {
    return {
        url: `https://xinruimz-isv.isvjcloud.com/papi/${function_id}?${body}`,
        headers: {
            "Host": "xinruimz-isv.isvjcloud.com",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Accept": "application/x.jd-school-raffle.v1+json",
            "User-Agent": UA,
            "Authorization": `${$.tokenType} ${$.accessToken}`,
            "Referer": "https://xinruimz-isv.isvjcloud.com/plantation",
            'Content-Type': 'application/json;charset=UTF-8',
        }
    }
}

function getToken() {
    let opt = {
        url: 'https://api.m.jd.com/client.action?functionId=isvObfuscator',
        body: 'body=%7B%22url%22%3A%20%22https%3A//xinruimz-isv.isvjcloud.com%22%2C%20%22id%22%3A%20%22%22%7D&uuid=5c0ee2d33a0d480b81583331a507d7fe&client=apple&clientVersion=10.1.2&st=1633632251000&sv=102&sign=3f9d552890b9c04e8602081bec67a4c7',
        headers: {
            "Host": "api.m.jd.com",
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "*/*",
            "Connection": "keep-alive",
            "User-Agent": "JD4iPhone/167541 (iPhone; iOS 13.5; Scale/3.00)",
            "Accept-Encoding": "gzip, deflate, br",
            "Cookie": cookie,
        }
    }
    return new Promise(resolve => {
        $.post(opt, (err, resp, data) => {
            try {
                if (err) {
                    console.log(err)
                } else {
                    data = JSON.parse(data);
                    if (data) {
                        $.token = data.token;
                    } else {
                        $.log('京东返回了空数据')
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}
function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
// prettier-ignore
function getUUID(x = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", t = 0) { return x.replace(/[xy]/g, function (x) { var r = 16 * Math.random() | 0, n = "x" == x ? r : 3 & r | 8; return uuid = t ? n.toString(36).toUpperCase() : n.toString(36), uuid }) }
function TotalBean() { return new Promise(async e => { const n = { url: "https://wq.jd.com/user_new/info/GetJDUserInfoUnion?sceneval=2", headers: { Host: "wq.jd.com", Accept: "*/*", Connection: "keep-alive", Cookie: cookie, "User-Agent": UA, "Accept-Language": "zh-cn", Referer: "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&", "Accept-Encoding": "gzip, deflate, br" } }; $.get(n, (n, o, a) => { try { if (n) $.logErr(n); else if (a) { if (1001 === (a = JSON.parse(a))["retcode"]) return void ($.isLogin = !1); 0 === a["retcode"] && a.data && a.data.hasOwnProperty("userInfo") && ($.nickName = a.data.userInfo.baseInfo.nickname), 0 === a["retcode"] && a.data && a.data["assetInfo"] && ($.beanCount = a.data && a.data["assetInfo"]["beanNum"]) } else console.log("京东服务器返回空数据") } catch (e) { $.logErr(e) } finally { e() } }) }) }
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
