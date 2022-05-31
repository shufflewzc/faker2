/*
设置了环境变量FLCODE
cron 0 0,10,20 * * * jd_618_red.js
* */
const $ = new Env('618红包');
$.flCode = $.isNode() ? (process.env.FLCODE ? process.env.FLCODE : '') : '';
const jdCookieNode = require('./jdCookie.js');
let cookiesArr = [];
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
    cookiesArr = [
        $.getdata("CookieJD"),
        $.getdata("CookieJD2"),
        ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
let appId, fingerprint, token, enCryptMethodJD;
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
        return;
    }
    $.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
    appId = '6a98d';
    let fglist = ['6289931560897925', '0403403318679778', '1390288884563462'];
    fingerprint = getRandomArrayElements(fglist, 1)[0];
    await requestAlgo();
    if ($.flCode !== '9999') {
        $.show = false;
    } else {
        $.show = true;
    }
    let runCK = [];
    for (let i = 0; i < cookiesArr.length; i += 1) {
        runCK.push(cookiesArr.slice(i, i + 1));
    }
    for (let i = 0; i < runCK.length; i++) {
        const promiseArr = runCK[i].map((ck, index) => main(ck));
        await Promise.all(promiseArr);
    }
})().catch((e) => { $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '') }).finally(() => { $.done(); })

async function main(ck, code = 'JdhENNw') {
    const codes = ['JdhENNw','Jwodrl8']
    code = $.flCode ? $.flCode : codes[random(0, codes.length)]
    // console.log(code)
    let userName = decodeURIComponent(ck.match(/pt_pin=([^; ]+)(?=;?)/) && ck.match(/pt_pin=([^; ]+)(?=;?)/)[1])
    let jfInfo = await getInfoByUrl($, ck, code);
    ck = jfInfo['ck'];
    let url2 = jfInfo['url'];
    let UA = getUA();
    let actId = url2.match(/mall\/active\/([^/]+)\/index\.html/) && url2.match(/mall\/active\/([^/]+)\/index\.html/)[1] || '2UboZe4RXkJPrpkp6SkpJJgtRmod';
    await getHtml(url2, ck, UA)
    await takeRequest(ck, UA, userName, actId, code);
}
function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
function getUA() {
    let UUID = randomString(40)
    const buildMap = {
        "167814": `10.1.4`,
        "167841": `10.1.6`,
    }
    let osVersion = `${randomNum(12, 14)}.${randomNum(0, 6)}`
    let network = `network/${['4g', '5g', 'wifi'][randomNum(0, 2)]}`
    let mobile = `iPhone${randomNum(9, 13)},${randomNum(1, 3)}`
    let build = ["167814", "167841"][randomNum(0, 1)]
    let appVersion = buildMap[build]
    return `jdapp;iPhone;${appVersion};${osVersion};${UUID};${network};model/${mobile};addressid/${randomNum(1e9)};appBuild/${build};jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS ${osVersion.replace(/\./g, "_")} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`
}
function randomNum(min, max) {
    if (arguments.length === 0) return Math.random()
    if (!max) max = 10 ** (Math.log(min) * Math.LOG10E + 1 | 0) - 1
    return Math.floor(Math.random() * (max - min + 1) + min);
}
async function getInfoByUrl($, ck, code) {
    let jfCk = getCookieStr($, ck);
    let returnInfo = { 'url': '', 'ck': '' };
    let newCookie = '';
    let info1 = await getInfo($, `${ck}${jfCk}`, code);
    let setcookies = info1['resp']['headers']['set-cookie'] || info1['resp']['headers']['Set-Cookie'] || '';
    let setcookie = '';
    if (setcookies) {
        if (typeof setcookies != 'object') {
            setcookie = setcookies.split(',');
        } else {
            setcookie = setcookies;
        }
        for (let ck of setcookie) {
            let name = ck.split(";")[0].trim();
            if (name.split("=")[1]) {
                if (newCookie.indexOf(name.split("=")[1]) === -1) newCookie += name.replace(/ /g, '') + '; ';
            }
        }
    }
    let url1 = info1['data'].match(/(https:\/\/u\.jd\.com\/jda[^']+)/) && info1['data'].match(/(https:\/\/u\.jd\.com\/jda[^']+)/)[1] || '';
    if (!url1) {
        console.log(`初始化1失败`);
        return returnInfo;
    }
    let info2 = await getInfo($, `${ck}${jfCk}${newCookie}`, url1, 2);
    setcookies = info2['resp'] && info2['resp']['headers'] && (info2['resp']['headers']['set-cookie'] || info2['resp']['headers']['Set-Cookie'] || '') || '';
    setcookie = '';
    if (setcookies) {
        if (typeof setcookies != 'object') {
            setcookie = setcookies.split(',');
        } else {
            setcookie = setcookies;
        }
        for (let ck of setcookie) {
            let name = ck.split(";")[0].trim();
            if (name.split("=")[1]) {
                if (newCookie.indexOf(name.split("=")[1]) === -1) newCookie += name.replace(/ /g, '') + '; ';
            }
        }
    }
    let url2 = info2['resp'] && info2['resp']['headers'] && (info2['resp']['headers']['location'] || info2['resp']['headers']['Location'] || '') || ''
    url2 = decodeURIComponent(url2)
    if (!url2) { console.log(`初始化2失败`); return returnInfo; }
    returnInfo.url = url2;
    returnInfo.ck = `${ck}${jfCk}${newCookie}`;
    return returnInfo;
}
function getCookieStr($, ck) {
    if (!$.ckInfo) {
        $.ckInfo = {};
    }
    if ($.ckInfo[ck]) {
        return $.ckInfo[ck];
    }
    let hash = 123;
    let uuid = new Date().getTime() + '' + parseInt(2147483647 * Math.random());
    let shortTime = uuid.substr(0, 10);
    let j = 1;
    let __jda = [hash, uuid, shortTime, shortTime, shortTime, j].join('.');
    let strList = `__jda=${__jda};`;
    $.ckInfo[ck] = strList;
    return strList;
}
async function getInfo($, cookie, code, type = 1) {
    let url = code;
    if (type === 1) {
        if (code.indexOf('https://u.jd.com') !== -1) {
            url = code;
        } else {
            url = `https://u.jd.com/${code}`;
        }
    }
    return new Promise(resolve => {
        const options = {
            url: url,
            followRedirect: false,
            headers: {
                'Cookie': cookie,
                'user-agent': 'JD4iPhone/10.2.4 CFNetwork/1240.0.4 Darwin/20.5.0'
            }
        }
        $.get(options, async (err, resp, data) => {
            try {
                resolve({ 'resp': resp, 'data': data });
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}
async function takeRequest(ck, UA, userName, actId, code) {
    let body = { "platform": 4, "unionActId": "31142", "actId": actId, "d": code, "unionShareId": "", "type": 1, "eid": "-1" };
    let bodyInfo = `functionId=getCoupons&appid=u&_=${Date.now()}&loginType=2&body=${JSON.stringify(body)}&client=apple&clientVersion=8.3.6`;
    let h5st = await getH5st(`https://api.m.jd.com?${bodyInfo}`);
    let url = `https://api.m.jd.com?functionId=getCoupons&appid=u&_=${Date.now()}&loginType=2&body=${JSON.stringify(body)}&client=apple&clientVersion=8.3.6`;
    url += `&h5st=${h5st}`;
    const headers = {
        "Accept-Language": "zh-cn",
        "Accept-Encoding": "gzip, deflate, br",
        'Cookie': ck,
        'user-agent': UA
    };
    let myRequest = { url: url, headers: headers };
    return new Promise(async resolve => {
        $.get(myRequest, (err, resp, data) => {
            try {
                if ($.show) {
                    if (err) {
                        console.log(`${$.toStr(err)}`)
                        console.log(`${userName} API请求失败，请检查网路重试`)
                    } else {
                        let res = $.toObj(data, data);
                        if (typeof res == 'object') {
                            // if(res.msg){
                            //     console.log('结果：'+res.msg)
                            // }
                            if (res.msg.indexOf('上限') !== -1) {
                                $.max = true;
                            }
                            if ($.shareId && typeof res.data !== 'undefined' && typeof res.data.joinNum !== 'undefined') {
                                console.log(`当前${res.data.joinSuffix}:${res.data.joinNum}`)
                            }
                            if (res.code == 0 && res.data) {
                                if (res.data.type == 1) {
                                    console.log(`${userName},获得红包：${res.data.discount}元`)
                                    //console.log(`${userName},获得优惠券：️满59减8`)
                                } else if (res.data.type == 3) {
                                    console.log(`${userName},获得优惠券：️满${res.data.quota}减${res.data.discount}`)
                                } else if (res.data.type == 6) {
                                    console.log(`${userName},获得打折券：满${res.data.quota}打${res.data.discount * 10}折`)
                                } else {
                                    console.log(`${userName},获得未知${res.data.quota || ''} ${res.data.discount}`)
                                    console.log(data)
                                }
                            }
                        } else {
                            console.log(data)
                        }
                    }
                }
            } catch (e) {

                $.logErr(e, resp)
            } finally {
                resolve(data.data || {});
            }
        })
    })
}
async function getHtml(url, ck, UA) {
    let config = {
        url: url,
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Cookie': ck,
            "User-Agent": UA,
            'Accept-Language': 'zh-cn',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive'
        }
    }
    return new Promise(resolve => {
        $.get(config, (err, resp, data) => {
            try {
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function randomString(min, max = 0) {
    var str = "", range = min, arr = [...Array(35).keys()].map(k => k.toString(36));
    if (max) {
        range = Math.floor(Math.random() * (max - min + 1) + min);
    }

    for (let i = 0; i < range;) {
        let randomString = Math.random().toString(16).substring(2)
        if ((range - i) > randomString.length) {
            str += randomString
            i += randomString.length
        } else {
            str += randomString.slice(i - range)
            i += randomString.length
        }
    }
    return str;
}

function getRandomArrayElements(arr, count) {
    var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}

async function requestAlgo() {
    const options = {
        "url": `https://cactus.jd.com/request_algo?g_ty=ajax`,
        "headers": {
            'Authority': 'cactus.jd.com',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            'Accept': 'application/json',
            //'User-Agent':$.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
            'Content-Type': 'application/json',
            'Origin': 'https://daily-redpacket.jd.com',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://daily-redpacket.jd.com/',
            'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7'
        },
        'body': JSON.stringify({
            "version": "3.0",
            "fp": fingerprint,
            "appId": appId,
            "timestamp": Date.now(),
            "platform": "web",
            "expandParams": ""
        })
    }
    return new Promise(async resolve => {
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    //console.log(`${JSON.stringify(err)}`)
                    //console.log(`request_algo 签名参数API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data['status'] === 200) {
                            token = data.data.result.tk;
                            let enCryptMethodJDString = data.data.result.algo;
                            if (enCryptMethodJDString) enCryptMethodJD = new Function(`return ${enCryptMethodJDString}`)();
                        } else {
                            //console.log('request_algo 签名参数API请求失败:')
                        }
                    } else {
                        console.log(`京东服务器返回空数据`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}
var _0xodh='jsjiami.com.v6',_0xodh_=['‮_0xodh'],_0x3866=[_0xodh,'\x77\x6f\x33\x43\x70\x73\x4f\x49\x77\x70\x31\x66\x77\x35\x73\x59\x61\x63\x4f\x2f\x77\x71\x54\x44\x71\x69\x51\x48\x77\x72\x72\x44\x74\x38\x4f\x4a\x77\x71\x7a\x43\x6e\x42\x41\x7a\x64\x79\x6b\x31\x77\x36\x4e\x32\x77\x35\x6e\x44\x74\x4d\x4b\x5a\x45\x73\x4b\x66\x77\x6f\x55\x53\x77\x36\x7a\x43\x6a\x4d\x4b\x79\x42\x44\x46\x76\x63\x73\x4f\x69\x47\x57\x73\x3d','\x77\x72\x7a\x43\x72\x63\x4b\x78\x77\x6f\x46\x37\x55\x63\x4f\x65\x54\x6c\x72\x43\x70\x63\x4f\x68\x77\x6f\x63\x42\x4c\x4d\x4f\x4f\x77\x6f\x30\x30','\x41\x51\x34\x42','\x4b\x57\x6a\x43\x70\x41\x4e\x65','\x77\x36\x55\x6e\x77\x70\x77\x3d','\x77\x71\x68\x53\x5a\x63\x4f\x6b\x4b\x41\x3d\x3d','\x53\x42\x46\x4c\x4d\x41\x44\x43\x6c\x38\x4b\x36\x77\x71\x77\x3d','\x42\x69\x62\x43\x75\x38\x4f\x42\x57\x31\x76\x43\x70\x67\x3d\x3d','\x43\x32\x72\x43\x70\x67\x52\x32\x77\x36\x6a\x44\x6f\x77\x3d\x3d','\x48\x6c\x4a\x70\x45\x6e\x38\x6a\x4b\x4d\x4f\x48','\x77\x36\x66\x44\x68\x4d\x4f\x77\x65\x30\x4d\x69\x64\x38\x4b\x78','\x62\x58\x46\x53\x77\x71\x7a\x44\x6a\x46\x6c\x73\x77\x35\x7a\x43\x6d\x33\x73\x3d','\x48\x44\x68\x37\x77\x72\x6a\x44\x72\x4d\x4f\x58\x77\x36\x62\x43\x67\x4d\x4b\x79\x77\x6f\x38\x3d','\x77\x36\x66\x44\x68\x4d\x4f\x77\x64\x30\x30\x75','\x77\x36\x62\x44\x6a\x63\x4f\x72\x58\x46\x34\x3d','\x77\x6f\x56\x43\x77\x34\x46\x79\x77\x37\x38\x3d','\x46\x69\x4c\x43\x6b\x6b\x6f\x4e','\x58\x4d\x4b\x6b\x49\x6c\x4e\x66\x77\x72\x6e\x43\x74\x38\x4f\x4e','\x43\x32\x72\x43\x70\x67\x31\x2b\x77\x37\x44\x44\x71\x6b\x44\x44\x72\x47\x51\x79\x77\x35\x39\x50\x77\x35\x37\x44\x70\x51\x3d\x3d','\x77\x35\x58\x43\x69\x33\x4e\x43','\x77\x70\x72\x44\x69\x57\x58\x44\x6f\x42\x50\x43\x74\x4d\x4f\x32','\x77\x35\x6e\x44\x71\x78\x44\x43\x6c\x63\x4f\x55\x66\x41\x3d\x3d','\x49\x4d\x4b\x39\x61\x42\x6e\x43\x6e\x4d\x4b\x2f\x77\x6f\x6e\x43\x72\x33\x41\x65\x65\x67\x3d\x3d','\x51\x56\x56\x54\x77\x34\x62\x43\x70\x42\x30\x3d','\x45\x6a\x52\x62\x77\x71\x44\x44\x6b\x41\x3d\x3d','\x4a\x38\x4f\x61\x77\x36\x37\x43\x69\x32\x4d\x45','\x4a\x6b\x7a\x43\x6c\x54\x6c\x77','\x51\x57\x35\x46\x46\x42\x77\x3d','\x77\x35\x58\x44\x6f\x38\x4f\x58\x63\x54\x38\x3d','\x62\x46\x52\x6c\x77\x72\x4a\x66\x77\x35\x34\x3d','\x77\x37\x30\x51\x54\x67\x6f\x3d','\x53\x73\x4f\x57\x55\x30\x77\x53','\x77\x35\x44\x44\x69\x38\x4f\x7a\x59\x69\x77\x3d','\x65\x48\x46\x57\x77\x6f\x33\x44\x68\x46\x52\x38','\x77\x70\x76\x44\x6b\x78\x38\x32\x4c\x77\x3d\x3d','\x41\x41\x33\x43\x68\x47\x63\x57\x53\x41\x3d\x3d','\x47\x53\x37\x44\x74\x73\x4b\x55\x4a\x77\x3d\x3d','\x53\x38\x4f\x69\x43\x45\x33\x43\x70\x63\x4b\x56','\x77\x37\x33\x43\x68\x32\x2f\x44\x68\x52\x50\x43\x6d\x77\x3d\x3d','\x66\x6b\x31\x62\x46\x7a\x37\x43\x75\x41\x3d\x3d','\x77\x37\x4c\x44\x70\x54\x54\x43\x73\x4d\x4f\x47','\x48\x67\x6e\x43\x76\x58\x67\x61','\x77\x36\x4c\x43\x6e\x48\x6c\x47\x50\x44\x7a\x44\x6a\x38\x4b\x50','\x77\x35\x50\x44\x71\x63\x4f\x46\x41\x52\x6c\x68','\x77\x70\x7a\x44\x67\x30\x62\x44\x75\x41\x44\x43\x76\x73\x4f\x39\x77\x70\x45\x3d','\x77\x37\x48\x43\x6f\x6c\x77\x55\x54\x48\x2f\x44\x72\x53\x55\x3d','\x77\x36\x76\x43\x6e\x47\x34\x3d','\x4a\x41\x33\x43\x6b\x67\x3d\x3d','\x57\x30\x46\x6c\x77\x70\x5a\x35','\x4e\x63\x4b\x35\x53\x79\x66\x43\x6b\x51\x3d\x3d','\x65\x4d\x4b\x76\x52\x6e\x37\x44\x67\x51\x3d\x3d','\x77\x34\x2f\x43\x67\x58\x63\x3d','\x4b\x33\x6a\x43\x68\x41\x78\x31','\x77\x72\x56\x52\x77\x37\x7a\x43\x76\x63\x4b\x55','\x4f\x4d\x4b\x46\x48\x47\x7a\x43\x6e\x51\x3d\x3d','\x77\x70\x2f\x43\x6f\x63\x4b\x6c\x77\x6f\x46\x65','\x77\x72\x48\x43\x75\x38\x4b\x62\x77\x6f\x78\x45\x64\x63\x4f\x55\x54\x51\x3d\x3d','\x54\x38\x4b\x75\x42\x57\x70\x43\x77\x72\x37\x43\x72\x63\x4f\x43','\x53\x57\x5a\x66\x77\x70\x48\x44\x6b\x56\x68\x54\x77\x37\x73\x3d','\x77\x37\x4c\x44\x69\x73\x4f\x30\x59\x52\x74\x62\x4c\x45\x59\x3d','\x77\x34\x58\x44\x6c\x38\x4f\x65\x5a\x52\x31\x64\x43\x48\x49\x3d','\x50\x69\x6a\x44\x67\x51\x3d\x3d','\x48\x33\x2f\x43\x76\x69\x6c\x6a','\x41\x38\x4f\x74\x77\x37\x73\x3d','\x65\x58\x4a\x64\x77\x70\x31\x49','\x77\x34\x4d\x32\x65\x67\x63\x31','\x77\x72\x74\x78\x53\x63\x4f\x6c\x48\x67\x3d\x3d','\x77\x6f\x33\x44\x70\x42\x34\x75\x46\x51\x3d\x3d','\x77\x36\x4c\x43\x6c\x32\x50\x44\x6b\x52\x50\x43\x67\x51\x3d\x3d','\x49\x6a\x48\x43\x74\x73\x4f\x31\x54\x6b\x44\x43\x69\x63\x4f\x4b','\x77\x70\x70\x31\x66\x4d\x4f\x4e\x46\x46\x74\x65\x77\x34\x6a\x43\x75\x58\x73\x3d','\x65\x31\x52\x59\x77\x71\x56\x4d\x77\x34\x4d\x38\x77\x34\x77\x3d','\x55\x56\x70\x4d\x41\x44\x37\x43\x76\x32\x30\x6c','\x4c\x4d\x4b\x4b\x45\x77\x3d\x3d','\x50\x38\x4b\x62\x42\x41\x3d\x3d','\x4f\x43\x6e\x44\x6a\x4d\x4b\x6a\x4c\x41\x73\x3d','\x77\x35\x58\x43\x67\x56\x4e\x43\x4f\x6a\x72\x44\x71\x38\x4b\x37','\x45\x6b\x62\x43\x6c\x6e\x70\x51\x4a\x6d\x6c\x38','\x77\x72\x46\x33\x63\x38\x4f\x4e\x4a\x6d\x63\x3d','\x64\x4d\x4f\x36\x52\x30\x45\x48\x77\x70\x72\x43\x6b\x73\x4b\x54','\x59\x38\x4f\x36\x65\x6c\x59\x55\x77\x6f\x63\x3d','\x59\x31\x48\x44\x6e\x43\x6b\x48\x66\x41\x3d\x3d','\x77\x36\x58\x44\x69\x73\x4f\x4a\x64\x67\x68\x47','\x54\x6b\x58\x43\x6d\x73\x4f\x67\x48\x67\x3d\x3d','\x77\x72\x39\x34\x77\x34\x56\x62','\x77\x37\x58\x43\x6d\x33\x6c\x6d\x4c\x41\x3d\x3d','\x58\x47\x2f\x43\x70\x73\x4f\x52\x4d\x6d\x6a\x44\x6d\x54\x37\x44\x69\x41\x3d\x3d','\x51\x63\x4b\x47\x77\x71\x6c\x30\x48\x51\x3d\x3d','\x58\x63\x4f\x6b\x4e\x58\x72\x43\x6e\x41\x3d\x3d','\x4f\x38\x4b\x5a\x4e\x33\x6e\x43\x69\x38\x4f\x66\x77\x36\x42\x6e\x77\x37\x78\x74\x77\x70\x56\x62','\x77\x6f\x2f\x44\x69\x57\x45\x3d','\x58\x30\x46\x46\x77\x35\x62\x43\x75\x41\x3d\x3d','\x77\x72\x7a\x44\x70\x58\x46\x75\x77\x70\x6a\x44\x71\x56\x64\x51\x77\x37\x55\x3d','\x77\x70\x2f\x43\x70\x73\x4f\x55\x77\x70\x31\x50','\x77\x6f\x6e\x43\x73\x4d\x4f\x32\x77\x72\x70\x64','\x4a\x63\x4f\x6c\x77\x34\x42\x31\x77\x71\x6a\x44\x76\x41\x3d\x3d','\x4e\x73\x4f\x79\x77\x35\x37\x44\x69\x48\x6b\x3d','\x45\x63\x4b\x65\x5a\x42\x44\x43\x6e\x51\x3d\x3d','\x77\x6f\x39\x6a\x77\x37\x7a\x43\x75\x73\x4b\x4d\x77\x36\x51\x3d','\x77\x35\x54\x44\x74\x7a\x50\x44\x75\x51\x73\x3d','\x59\x48\x54\x43\x76\x77\x67\x35\x52\x54\x30\x3d','\x77\x36\x42\x4a\x77\x72\x48\x44\x6c\x41\x3d\x3d','\x4b\x63\x4b\x4d\x4a\x6d\x4c\x43\x6a\x4d\x4b\x62\x77\x35\x4a\x70\x77\x36\x70\x31\x77\x35\x52\x4c\x61\x4d\x4f\x79\x52\x4d\x4f\x2f\x77\x6f\x64\x33\x63\x38\x4f\x44\x77\x70\x30\x38\x4e\x6e\x66\x43\x74\x58\x2f\x44\x70\x63\x4f\x63\x77\x37\x45\x6f\x57\x45\x58\x44\x72\x4d\x4b\x4c\x4d\x4d\x4b\x77\x4d\x38\x4f\x63\x49\x58\x37\x44\x68\x4d\x4b\x7a','\x77\x71\x74\x68\x5a\x4d\x4f\x58\x43\x6c\x35\x37\x77\x70\x37\x44\x70\x43\x55\x65\x77\x6f\x51\x76\x41\x79\x55\x4c\x61\x67\x3d\x3d','\x58\x30\x62\x44\x6d\x67\x3d\x3d','\x77\x36\x78\x43\x77\x6f\x54\x43\x68\x73\x4b\x39','\x77\x71\x46\x52\x77\x36\x70\x44\x77\x36\x67\x3d','\x77\x71\x76\x44\x6e\x6d\x7a\x44\x76\x41\x62\x43\x75\x4d\x4f\x5a\x77\x71\x55\x3d','\x77\x36\x48\x43\x6d\x47\x52\x57\x44\x53\x59\x3d','\x64\x46\x48\x44\x6f\x54\x34\x55\x59\x63\x4b\x4d\x77\x6f\x51\x3d','\x4a\x56\x76\x43\x76\x48\x35\x57\x49\x45\x31\x49','\x62\x48\x54\x43\x75\x41\x3d\x3d','\x77\x34\x62\x43\x6c\x33\x55\x3d','\x66\x4d\x4b\x62\x41\x46\x74\x6a','\x47\x43\x37\x43\x72\x48\x59\x77','\x64\x31\x74\x61\x45\x6a\x41\x3d','\x66\x45\x64\x43','\x77\x36\x37\x44\x6a\x38\x4f\x68\x55\x6e\x55\x3d','\x77\x36\x62\x43\x6a\x55\x68\x43\x41\x51\x3d\x3d','\x4c\x38\x4f\x79\x77\x34\x7a\x43\x76\x31\x41\x3d','\x42\x38\x4f\x2b\x77\x37\x33\x43\x6e\x4d\x4f\x49','\x77\x71\x5a\x33\x54\x73\x4f\x61\x4e\x58\x70\x78\x77\x70\x30\x3d','\x58\x57\x37\x43\x6b\x63\x4f\x41\x4a\x6d\x6a\x44\x6d\x54\x77\x3d','\x77\x70\x46\x71\x5a\x4d\x4f\x65\x4d\x33\x78\x56\x77\x71\x6b\x3d','\x77\x37\x54\x44\x6a\x73\x4f\x58\x52\x31\x34\x2b\x61\x38\x4b\x6c','\x61\x38\x4f\x2f\x48\x31\x37\x43\x73\x4d\x4b\x4f\x77\x70\x62\x43\x75\x67\x3d\x3d','\x77\x70\x76\x44\x75\x68\x45\x3d','\x77\x34\x37\x44\x67\x4d\x4f\x66','\x58\x41\x52\x54\x46\x42\x73\x3d','\x77\x72\x68\x32\x77\x35\x77\x3d','\x61\x6d\x68\x2b\x77\x36\x54\x43\x6e\x51\x3d\x3d','\x77\x37\x74\x6b\x77\x6f\x2f\x44\x75\x7a\x4d\x3d','\x58\x6d\x74\x43\x77\x72\x78\x49','\x77\x37\x58\x44\x6c\x63\x4f\x4c\x66\x42\x30\x3d','\x77\x35\x37\x43\x74\x55\x73\x44\x54\x48\x67\x3d','\x77\x35\x63\x66\x77\x71\x74\x4b\x77\x72\x73\x4f\x77\x37\x4c\x44\x6f\x67\x3d\x3d','\x41\x63\x4b\x4a\x45\x54\x35\x66\x65\x73\x4b\x68\x77\x72\x46\x67\x77\x70\x67\x3d','\x46\x53\x6e\x44\x69\x38\x4b\x6d\x77\x72\x39\x79\x47\x53\x6b\x3d','\x77\x34\x37\x44\x71\x79\x33\x43\x67\x73\x4f\x48\x59\x57\x66\x43\x6b\x51\x3d\x3d','\x43\x38\x4b\x4f\x4c\x33\x76\x43\x6e\x4d\x4f\x59\x77\x37\x70\x56','\x77\x72\x64\x32\x66\x67\x3d\x3d','\x57\x6b\x31\x4e','\x61\x6e\x58\x43\x74\x51\x34\x67\x66\x67\x3d\x3d','\x47\x73\x4f\x6a\x77\x35\x6a\x43\x72\x73\x4f\x37\x77\x6f\x7a\x43\x70\x44\x6f\x3d','\x64\x4d\x4b\x68\x58\x33\x2f\x44\x69\x68\x38\x3d','\x4c\x79\x6e\x44\x73\x63\x4b\x30\x50\x78\x59\x42\x77\x37\x49\x3d','\x44\x63\x4f\x6a\x77\x36\x58\x43\x75\x63\x4f\x6f\x77\x70\x45\x3d','\x4b\x38\x4b\x54\x4f\x47\x6a\x43\x69\x63\x4f\x44','\x77\x70\x33\x44\x75\x78\x77\x6b\x41\x4d\x4b\x76','\x4c\x54\x4c\x44\x6a\x73\x4b\x7a\x48\x41\x3d\x3d','\x44\x77\x66\x43\x68\x47\x4d\x44\x56\x41\x3d\x3d','\x49\x38\x4b\x4c\x47\x54\x4d\x3d','\x77\x35\x33\x43\x6b\x54\x38\x68\x77\x37\x49\x3d','\x55\x38\x4b\x6c\x77\x71\x50\x43\x67\x63\x4f\x58\x77\x34\x50\x43\x6c\x33\x63\x35\x4c\x4d\x4f\x38\x61\x67\x3d\x3d','\x77\x35\x37\x43\x74\x79\x63\x47\x77\x35\x6b\x3d','\x77\x71\x56\x47\x77\x35\x66\x43\x70\x73\x4b\x61','\x45\x4d\x4f\x51\x77\x36\x64\x39\x77\x72\x34\x3d','\x56\x63\x4b\x36\x51\x6d\x58\x44\x6b\x67\x3d\x3d','\x58\x52\x46\x50\x45\x51\x37\x43\x6d\x73\x4b\x72','\x77\x35\x66\x43\x6f\x6b\x54\x44\x6d\x51\x55\x3d','\x77\x36\x54\x44\x73\x73\x4f\x73\x65\x6d\x49\x3d','\x47\x31\x68\x35\x49\x77\x3d\x3d','\x4b\x6b\x75\x4a\x74\x6a\x73\x6a\x69\x51\x61\x4c\x7a\x6d\x69\x2e\x63\x77\x68\x6f\x7a\x6d\x48\x64\x2e\x71\x42\x76\x78\x36\x3d\x3d'];if(function(_0x31cc2a,_0x4b7d5c,_0x227d06){function _0x1861da(_0x188705,_0x2265fc,_0x39334a,_0x2d23ae,_0x532cef,_0x503880){_0x2265fc=_0x2265fc>>0x8,_0x532cef='po';var _0x17df26='shift',_0x377949='push',_0x503880='‮';if(_0x2265fc<_0x188705){while(--_0x188705){_0x2d23ae=_0x31cc2a[_0x17df26]();if(_0x2265fc===_0x188705&&_0x503880==='‮'&&_0x503880['length']===0x1){_0x2265fc=_0x2d23ae,_0x39334a=_0x31cc2a[_0x532cef+'p']();}else if(_0x2265fc&&_0x39334a['replace'](/[KkuJtQLzwhzHdqBx=]/g,'')===_0x2265fc){_0x31cc2a[_0x377949](_0x2d23ae);}}_0x31cc2a[_0x377949](_0x31cc2a[_0x17df26]());}return 0xeab2d;};return _0x1861da(++_0x4b7d5c,_0x227d06)>>_0x4b7d5c^_0x227d06;}(_0x3866,0x65,0x6500),_0x3866){_0xodh_=_0x3866['length']^0x65;};function _0x32eb(_0x19989f,_0x3b70b7){_0x19989f=~~'0x'['concat'](_0x19989f['slice'](0x1));var _0x3c59d1=_0x3866[_0x19989f];if(_0x32eb['NtAivs']===undefined){(function(){var _0x2d35a1=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0x1e21b7='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x2d35a1['atob']||(_0x2d35a1['atob']=function(_0x5e462c){var _0x4e3b89=String(_0x5e462c)['replace'](/=+$/,'');for(var _0x44fbd6=0x0,_0x2b5d5b,_0x3825f4,_0xa48eda=0x0,_0xaa7ded='';_0x3825f4=_0x4e3b89['charAt'](_0xa48eda++);~_0x3825f4&&(_0x2b5d5b=_0x44fbd6%0x4?_0x2b5d5b*0x40+_0x3825f4:_0x3825f4,_0x44fbd6++%0x4)?_0xaa7ded+=String['fromCharCode'](0xff&_0x2b5d5b>>(-0x2*_0x44fbd6&0x6)):0x0){_0x3825f4=_0x1e21b7['indexOf'](_0x3825f4);}return _0xaa7ded;});}());function _0x27e955(_0x2df112,_0x3b70b7){var _0x5e4529=[],_0x18fdc8=0x0,_0x55f538,_0xee06cc='',_0x155f8b='';_0x2df112=atob(_0x2df112);for(var _0x2dfa12=0x0,_0x563308=_0x2df112['length'];_0x2dfa12<_0x563308;_0x2dfa12++){_0x155f8b+='%'+('00'+_0x2df112['charCodeAt'](_0x2dfa12)['toString'](0x10))['slice'](-0x2);}_0x2df112=decodeURIComponent(_0x155f8b);for(var _0x370b03=0x0;_0x370b03<0x100;_0x370b03++){_0x5e4529[_0x370b03]=_0x370b03;}for(_0x370b03=0x0;_0x370b03<0x100;_0x370b03++){_0x18fdc8=(_0x18fdc8+_0x5e4529[_0x370b03]+_0x3b70b7['charCodeAt'](_0x370b03%_0x3b70b7['length']))%0x100;_0x55f538=_0x5e4529[_0x370b03];_0x5e4529[_0x370b03]=_0x5e4529[_0x18fdc8];_0x5e4529[_0x18fdc8]=_0x55f538;}_0x370b03=0x0;_0x18fdc8=0x0;for(var _0x4a03bd=0x0;_0x4a03bd<_0x2df112['length'];_0x4a03bd++){_0x370b03=(_0x370b03+0x1)%0x100;_0x18fdc8=(_0x18fdc8+_0x5e4529[_0x370b03])%0x100;_0x55f538=_0x5e4529[_0x370b03];_0x5e4529[_0x370b03]=_0x5e4529[_0x18fdc8];_0x5e4529[_0x18fdc8]=_0x55f538;_0xee06cc+=String['fromCharCode'](_0x2df112['charCodeAt'](_0x4a03bd)^_0x5e4529[(_0x5e4529[_0x370b03]+_0x5e4529[_0x18fdc8])%0x100]);}return _0xee06cc;}_0x32eb['MVpmPM']=_0x27e955;_0x32eb['gPsRSg']={};_0x32eb['NtAivs']=!![];}var _0x3aed2e=_0x32eb['gPsRSg'][_0x19989f];if(_0x3aed2e===undefined){if(_0x32eb['ISBTWp']===undefined){_0x32eb['ISBTWp']=!![];}_0x3c59d1=_0x32eb['MVpmPM'](_0x3c59d1,_0x3b70b7);_0x32eb['gPsRSg'][_0x19989f]=_0x3c59d1;}else{_0x3c59d1=_0x3aed2e;}return _0x3c59d1;};async function getH5st(_0x253ddb){var _0x954c42={'\x58\x48\x4f\x51\x4d':function(_0x2948fe,_0x614b98,_0x21e6c6){return _0x2948fe(_0x614b98,_0x21e6c6);},'\x79\x42\x5a\x56\x44':function(_0x320540,_0x1c8cd9){return _0x320540===_0x1c8cd9;},'\x51\x50\x49\x6d\x76':function(_0x33b483,_0x51f8a2){return _0x33b483-_0x51f8a2;},'\x74\x46\x46\x76\x52':_0x32eb('‫0','\x23\x35\x74\x35'),'\x47\x5a\x56\x45\x53':function(_0x49c05e,_0x2fb3ab,_0x3cd5f0,_0x8fc750){return _0x49c05e(_0x2fb3ab,_0x3cd5f0,_0x8fc750);},'\x65\x73\x6f\x62\x7a':_0x32eb('‫1','\x23\x79\x42\x52'),'\x6e\x6e\x65\x61\x59':function(_0x5d0f15,_0x391d3b,_0x21cb4e){return _0x5d0f15(_0x391d3b,_0x21cb4e);},'\x47\x63\x48\x74\x49':_0x32eb('‫2','\x43\x6f\x76\x4e'),'\x64\x4d\x4c\x53\x47':function(_0x1ebf79,_0x3ce52d){return _0x1ebf79(_0x3ce52d);},'\x69\x72\x76\x46\x41':function(_0x442fd7,_0x260fae,_0x196644,_0x3c46da,_0x3e465b,_0x98565e){return _0x442fd7(_0x260fae,_0x196644,_0x3c46da,_0x3e465b,_0x98565e);},'\x76\x74\x6c\x73\x51':_0x32eb('‮3','\x6b\x66\x49\x5b')};let _0x4f8a12=_0x954c42[_0x32eb('‮4','\x4b\x2a\x2a\x5d')](getUrlData,_0x253ddb,_0x954c42[_0x32eb('‫5','\x6d\x53\x5b\x55')]);const _0x1b2f53=$[_0x32eb('‮6','\x68\x71\x56\x52')][_0x32eb('‮7','\x74\x6a\x4e\x74')](_0x4f8a12)[_0x32eb('‮8','\x32\x67\x4c\x74')]($[_0x32eb('‫9','\x63\x65\x4b\x75')][_0x32eb('‫a','\x64\x50\x25\x35')][_0x32eb('‮b','\x6f\x5e\x4a\x2a')]);_0x253ddb=_0x954c42[_0x32eb('‮c','\x33\x5a\x58\x33')](replaceParamVal,_0x253ddb,_0x954c42[_0x32eb('‫d','\x6b\x66\x49\x5b')],_0x1b2f53);const _0x1c90a6=_0x954c42[_0x32eb('‫e','\x48\x4c\x36\x79')];let _0x42b55c=Date[_0x32eb('‮f','\x48\x4c\x36\x79')]();const _0x23ce48=_0x954c42[_0x32eb('‫10','\x55\x54\x78\x5d')](timeString,_0x954c42[_0x32eb('‮11','\x6d\x4c\x65\x4a')],new Date(_0x954c42[_0x32eb('‮12','\x37\x31\x49\x32')](Number,_0x42b55c)));let _0x1b7584=_0x954c42[_0x32eb('‮13','\x49\x41\x49\x25')](enCryptMethodJD,token,fingerprint[_0x32eb('‫14','\x43\x6f\x76\x4e')](),_0x23ce48[_0x32eb('‮15','\x31\x79\x37\x72')](),appId[_0x32eb('‮8','\x32\x67\x4c\x74')](),$[_0x32eb('‮16','\x43\x6f\x76\x4e')])[_0x32eb('‮17','\x55\x54\x78\x5d')]($[_0x32eb('‫18','\x65\x55\x40\x46')][_0x32eb('‮19','\x29\x5e\x6e\x35')][_0x32eb('‫1a','\x6a\x7a\x25\x7a')]);let _0x586e59='';_0x1c90a6[_0x32eb('‫1b','\x6f\x64\x4f\x67')]('\x2c')[_0x32eb('‮1c','\x6d\x53\x5b\x55')]((_0xa8e8cc,_0x5eccee)=>{_0x586e59+=_0xa8e8cc+'\x3a'+_0x954c42[_0x32eb('‮1d','\x6c\x38\x28\x31')](getUrlData,_0x253ddb,_0xa8e8cc)+(_0x954c42[_0x32eb('‫1e','\x23\x35\x74\x35')](_0x5eccee,_0x954c42[_0x32eb('‮1f','\x6d\x38\x38\x63')](_0x1c90a6[_0x32eb('‮20','\x6a\x7a\x25\x7a')]('\x2c')[_0x32eb('‫21','\x74\x6a\x4e\x74')],0x1))?'':'\x26');});const _0x5681de=$[_0x32eb('‫22','\x2a\x31\x75\x73')][_0x32eb('‫23','\x53\x6c\x41\x57')](_0x586e59,_0x1b7584[_0x32eb('‫24','\x49\x49\x74\x35')]())[_0x32eb('‮25','\x23\x5a\x46\x41')]($[_0x32eb('‫26','\x23\x79\x42\x52')][_0x32eb('‫27','\x43\x6f\x76\x4e')][_0x32eb('‫28','\x48\x4c\x36\x79')]);let _0x564dd4=[''[_0x32eb('‮29','\x64\x50\x25\x35')](_0x23ce48[_0x32eb('‮2a','\x49\x41\x49\x25')]()),''[_0x32eb('‮2b','\x73\x50\x55\x51')](fingerprint[_0x32eb('‮2c','\x31\x68\x42\x45')]()),''[_0x32eb('‫2d','\x49\x41\x49\x25')](appId[_0x32eb('‮25','\x23\x5a\x46\x41')]()),''[_0x32eb('‫2e','\x23\x79\x42\x52')](token),''[_0x32eb('‫2e','\x23\x79\x42\x52')](_0x5681de),''[_0x32eb('‮2f','\x29\x5e\x6e\x35')](_0x954c42[_0x32eb('‮30','\x31\x68\x42\x45')]),''[_0x32eb('‫31','\x6b\x66\x49\x5b')](_0x42b55c)][_0x32eb('‮32','\x53\x6c\x41\x57')]('\x3b');return _0x954c42[_0x32eb('‫33','\x5a\x51\x5d\x71')](encodeURIComponent,_0x564dd4);}function replaceParamVal(_0x58e0db,_0x59c905,_0x332688){var _0x569bd5={'\x67\x6b\x54\x74\x6c':function(_0x4e47b0,_0x4af037){return _0x4e47b0(_0x4af037);},'\x59\x50\x49\x6f\x62':function(_0x54ec4d,_0x3c8b53){return _0x54ec4d+_0x3c8b53;},'\x42\x74\x73\x79\x79':_0x32eb('‮34','\x49\x41\x49\x25'),'\x64\x53\x68\x49\x4e':function(_0x5b3de1,_0x5e77fe){return _0x5b3de1+_0x5e77fe;}};var _0x317573=_0x569bd5[_0x32eb('‫35','\x5a\x51\x5d\x71')](eval,_0x569bd5[_0x32eb('‮36','\x6f\x5d\x24\x70')](_0x569bd5[_0x32eb('‫37','\x30\x61\x4c\x61')]('\x2f\x28',_0x59c905),_0x569bd5[_0x32eb('‮38','\x73\x50\x55\x51')]));var _0x703e40=_0x58e0db[_0x32eb('‫39','\x6f\x64\x4f\x67')](_0x317573,_0x569bd5[_0x32eb('‮3a','\x6f\x5e\x4a\x2a')](_0x569bd5[_0x32eb('‫3b','\x55\x54\x78\x5d')](_0x59c905,'\x3d'),_0x332688));return _0x703e40;}function timeString(_0x1d31e3,_0x4c7c66){var _0x5e9def={'\x76\x49\x56\x4c\x76':function(_0x103307,_0xb356d5,_0x1e8893){return _0x103307(_0xb356d5,_0x1e8893);},'\x4a\x43\x47\x79\x67':function(_0x5ddaf0,_0x4956a8){return _0x5ddaf0===_0x4956a8;},'\x69\x69\x54\x4b\x59':function(_0x52bdaf,_0x2546ae){return _0x52bdaf-_0x2546ae;},'\x48\x61\x4a\x46\x73':function(_0x438813,_0x24316,_0x3b253e){return _0x438813(_0x24316,_0x3b253e);},'\x72\x61\x57\x78\x78':_0x32eb('‮3c','\x64\x6b\x4b\x53'),'\x54\x7a\x6e\x47\x47':function(_0x3ef5bc,_0x36b1b8,_0x37a021,_0x5d4407){return _0x3ef5bc(_0x36b1b8,_0x37a021,_0x5d4407);},'\x6f\x61\x77\x62\x6a':_0x32eb('‫3d','\x30\x45\x56\x32'),'\x47\x77\x56\x4c\x62':function(_0x274cc1,_0x578860,_0x37d35f){return _0x274cc1(_0x578860,_0x37d35f);},'\x49\x47\x62\x74\x6c':_0x32eb('‮3e','\x69\x6b\x57\x4c'),'\x70\x79\x4a\x67\x75':function(_0x479ed0,_0x269f9d){return _0x479ed0(_0x269f9d);},'\x5a\x75\x6d\x79\x68':function(_0x2ae8ba,_0x2e1e9f,_0x125201,_0x1d18b3,_0x4784fb,_0x27edbe){return _0x2ae8ba(_0x2e1e9f,_0x125201,_0x1d18b3,_0x4784fb,_0x27edbe);},'\x67\x44\x58\x54\x4a':_0x32eb('‫3f','\x6c\x38\x28\x31'),'\x54\x75\x79\x50\x64':function(_0x35dd82,_0x2b903f){return _0x35dd82(_0x2b903f);},'\x7a\x4a\x78\x4a\x6f':function(_0x5c9c22,_0x1ef54e){return _0x5c9c22+_0x1ef54e;},'\x50\x55\x6d\x47\x45':function(_0x427cb4,_0x3251c0){return _0x427cb4/_0x3251c0;},'\x53\x46\x70\x64\x56':_0x32eb('‮40','\x35\x4b\x62\x6b'),'\x56\x6e\x54\x77\x45':_0x32eb('‫41','\x6d\x53\x5b\x55'),'\x65\x47\x6d\x71\x4e':function(_0x22b96a,_0x32eb57){return _0x22b96a==_0x32eb57;},'\x42\x68\x54\x54\x6a':function(_0x4284bf,_0x476436){return _0x4284bf+_0x476436;}};var _0x42c45e=_0x1d31e3,_0x6ca2b3={'M+':_0x5e9def[_0x32eb('‫42','\x43\x6f\x76\x4e')](_0x4c7c66[_0x32eb('‮43','\x6f\x64\x4f\x67')](),0x1),'d+':_0x4c7c66[_0x32eb('‮44','\x36\x45\x49\x47')](),'D+':_0x4c7c66[_0x32eb('‫45','\x35\x4b\x62\x6b')](),'h+':_0x4c7c66[_0x32eb('‫46','\x64\x6b\x4b\x53')](),'H+':_0x4c7c66[_0x32eb('‫47','\x55\x54\x78\x5d')](),'m+':_0x4c7c66[_0x32eb('‮48','\x57\x55\x4f\x74')](),'s+':_0x4c7c66[_0x32eb('‫49','\x6c\x71\x24\x58')](),'w+':_0x4c7c66[_0x32eb('‫4a','\x55\x54\x78\x5d')](),'q+':Math[_0x32eb('‮4b','\x55\x54\x78\x5d')](_0x5e9def[_0x32eb('‫4c','\x6d\x53\x5b\x55')](_0x5e9def[_0x32eb('‮4d','\x6b\x66\x49\x5b')](_0x4c7c66[_0x32eb('‮4e','\x33\x5a\x58\x33')](),0x3),0x3)),'S+':_0x4c7c66[_0x32eb('‫4f','\x35\x4b\x62\x6b')]()};/(y+)/i[_0x32eb('‮50','\x6d\x4c\x65\x4a')](_0x42c45e)&&(_0x42c45e=_0x42c45e[_0x32eb('‮51','\x68\x71\x56\x52')](RegExp['\x24\x31'],''[_0x32eb('‮52','\x23\x5a\x46\x41')](_0x4c7c66[_0x32eb('‮53','\x7a\x68\x72\x5e')]())[_0x32eb('‫54','\x6c\x38\x28\x31')](_0x5e9def[_0x32eb('‮55','\x6c\x71\x24\x58')](0x4,RegExp['\x24\x31'][_0x32eb('‫56','\x37\x31\x49\x32')]))));for(var _0x7dcb26 in _0x6ca2b3){if(_0x5e9def[_0x32eb('‫57','\x35\x4b\x62\x6b')](_0x5e9def[_0x32eb('‫58','\x48\x4c\x36\x79')],_0x5e9def[_0x32eb('‮59','\x6a\x7a\x25\x7a')])){if(new RegExp('\x28'[_0x32eb('‮5a','\x6d\x38\x38\x63')](_0x7dcb26,'\x29'))[_0x32eb('‫5b','\x33\x55\x61\x35')](_0x42c45e)){var _0x5df0bc,_0x552667=_0x5e9def[_0x32eb('‫5c','\x67\x4c\x31\x41')]('\x53\x2b',_0x7dcb26)?_0x5e9def[_0x32eb('‮5d','\x6a\x7a\x25\x7a')]:'\x30\x30';_0x42c45e=_0x42c45e[_0x32eb('‫5e','\x57\x55\x4f\x74')](RegExp['\x24\x31'],_0x5e9def[_0x32eb('‫5f','\x29\x5e\x6e\x35')](0x1,RegExp['\x24\x31'][_0x32eb('‫60','\x6b\x66\x49\x5b')])?_0x6ca2b3[_0x7dcb26]:_0x5e9def[_0x32eb('‫61','\x31\x68\x42\x45')](''[_0x32eb('‮62','\x65\x55\x40\x46')](_0x552667),_0x6ca2b3[_0x7dcb26])[_0x32eb('‫63','\x6f\x5e\x4a\x2a')](''[_0x32eb('‮5a','\x6d\x38\x38\x63')](_0x6ca2b3[_0x7dcb26])[_0x32eb('‮64','\x48\x4c\x36\x79')]));}}else{let _0x14bba5=_0x5e9def[_0x32eb('‮65','\x23\x5a\x46\x41')](getUrlData,url,_0x5e9def[_0x32eb('‮66','\x6b\x66\x49\x5b')]);const _0x3ce113=$[_0x32eb('‮67','\x6d\x4c\x65\x4a')][_0x32eb('‫68','\x55\x54\x78\x5d')](_0x14bba5)[_0x32eb('‮69','\x68\x71\x56\x52')]($[_0x32eb('‫6a','\x74\x6a\x4e\x74')][_0x32eb('‫6b','\x6f\x5e\x4a\x2a')][_0x32eb('‮6c','\x6b\x66\x49\x5b')]);url=_0x5e9def[_0x32eb('‫6d','\x6d\x38\x38\x63')](replaceParamVal,url,_0x5e9def[_0x32eb('‮6e','\x7a\x68\x72\x5e')],_0x3ce113);const _0x1860f7=_0x5e9def[_0x32eb('‫6f','\x73\x50\x55\x51')];let _0x155632=Date[_0x32eb('‫70','\x6d\x4c\x65\x4a')]();const _0x49332b=_0x5e9def[_0x32eb('‮71','\x35\x4b\x62\x6b')](timeString,_0x5e9def[_0x32eb('‮72','\x6f\x5d\x24\x70')],new Date(_0x5e9def[_0x32eb('‮73','\x23\x79\x42\x52')](Number,_0x155632)));let _0x1dc6e4=_0x5e9def[_0x32eb('‫74','\x69\x6b\x57\x4c')](enCryptMethodJD,token,fingerprint[_0x32eb('‫75','\x69\x6b\x57\x4c')](),_0x49332b[_0x32eb('‮76','\x33\x5a\x58\x33')](),appId[_0x32eb('‮25','\x23\x5a\x46\x41')](),$[_0x32eb('‫77','\x57\x55\x4f\x74')])[_0x32eb('‮78','\x6a\x7a\x25\x7a')]($[_0x32eb('‫79','\x6a\x7a\x25\x7a')][_0x32eb('‫7a','\x31\x68\x42\x45')][_0x32eb('‮b','\x6f\x5e\x4a\x2a')]);let _0x2c0d36='';_0x1860f7[_0x32eb('‮7b','\x35\x4b\x62\x6b')]('\x2c')[_0x32eb('‫7c','\x49\x41\x49\x25')]((_0x3323af,_0x254561)=>{_0x2c0d36+=_0x3323af+'\x3a'+_0x5e9def[_0x32eb('‫7d','\x6d\x38\x38\x63')](getUrlData,url,_0x3323af)+(_0x5e9def[_0x32eb('‫7e','\x33\x55\x61\x35')](_0x254561,_0x5e9def[_0x32eb('‫7f','\x43\x6f\x76\x4e')](_0x1860f7[_0x32eb('‫80','\x29\x5e\x6e\x35')]('\x2c')[_0x32eb('‫81','\x6f\x5e\x4a\x2a')],0x1))?'':'\x26');});const _0x3ea278=$[_0x32eb('‫82','\x36\x45\x49\x47')][_0x32eb('‮83','\x43\x6f\x76\x4e')](_0x2c0d36,_0x1dc6e4[_0x32eb('‮17','\x55\x54\x78\x5d')]())[_0x32eb('‫84','\x6d\x38\x38\x63')]($[_0x32eb('‫85','\x48\x4c\x36\x79')][_0x32eb('‫86','\x53\x6c\x41\x57')][_0x32eb('‮87','\x63\x30\x79\x53')]);let _0xdc84ae=[''[_0x32eb('‫88','\x31\x68\x42\x45')](_0x49332b[_0x32eb('‮89','\x6d\x4c\x65\x4a')]()),''[_0x32eb('‫2d','\x49\x41\x49\x25')](fingerprint[_0x32eb('‮8a','\x63\x65\x4b\x75')]()),''[_0x32eb('‮8b','\x43\x6f\x76\x4e')](appId[_0x32eb('‫8c','\x67\x4c\x31\x41')]()),''[_0x32eb('‮8d','\x67\x4c\x31\x41')](token),''[_0x32eb('‮8e','\x32\x67\x4c\x74')](_0x3ea278),''[_0x32eb('‮8f','\x6a\x7a\x25\x7a')](_0x5e9def[_0x32eb('‫90','\x31\x79\x37\x72')]),''[_0x32eb('‮8b','\x43\x6f\x76\x4e')](_0x155632)][_0x32eb('‮91','\x6d\x53\x5b\x55')]('\x3b');return _0x5e9def[_0x32eb('‫92','\x6d\x4c\x65\x4a')](encodeURIComponent,_0xdc84ae);}}return _0x42c45e;}function getUrlData(_0xd6bf75,_0x401ea0){var _0x3a3b54={'\x44\x70\x55\x50\x71':function(_0x3ed8d9,_0x305c65){return _0x3ed8d9!==_0x305c65;},'\x75\x69\x53\x54\x58':_0x32eb('‫93','\x31\x79\x37\x72'),'\x65\x66\x4e\x4e\x66':function(_0x4c28d5,_0x2e16fd){return _0x4c28d5<_0x2e16fd;},'\x56\x46\x78\x4f\x74':function(_0x331d7d,_0x2c4be0){return _0x331d7d===_0x2c4be0;},'\x67\x7a\x50\x45\x47':function(_0x55417,_0x4a478e){return _0x55417+_0x4a478e;}};if(_0x3a3b54[_0x32eb('‮94','\x21\x76\x72\x23')](typeof URL,_0x3a3b54[_0x32eb('‫95','\x65\x55\x40\x46')])){let _0x2d4e97=new URL(_0xd6bf75);let _0x33047a=_0x2d4e97[_0x32eb('‫96','\x23\x79\x42\x52')][_0x32eb('‮97','\x68\x71\x56\x52')](_0x401ea0);return _0x33047a?_0x33047a:'';}else{const _0x2c0aff=_0xd6bf75[_0x32eb('‫98','\x6c\x38\x28\x31')](/\?.*/)[0x0][_0x32eb('‮99','\x69\x59\x69\x29')](0x1);const _0x2e7108=_0x2c0aff[_0x32eb('‫9a','\x30\x45\x56\x32')]('\x26');for(let _0x9a2cfb=0x0;_0x3a3b54[_0x32eb('‮9b','\x30\x45\x56\x32')](_0x9a2cfb,_0x2e7108[_0x32eb('‮9c','\x30\x61\x4c\x61')]);_0x9a2cfb++){const _0x1107f4=_0x2e7108[_0x9a2cfb][_0x32eb('‮9d','\x67\x75\x38\x28')]('\x3d');if(_0x3a3b54[_0x32eb('‫9e','\x7a\x68\x72\x5e')](_0x1107f4[0x0],_0x401ea0)){return _0x2e7108[_0x9a2cfb][_0x32eb('‫9f','\x6f\x5d\x24\x70')](_0x3a3b54[_0x32eb('‮a0','\x4d\x69\x37\x4e')](_0x2e7108[_0x9a2cfb][_0x32eb('‫a1','\x64\x50\x25\x35')]('\x3d'),0x1));}}return'';}};_0xodh='jsjiami.com.v6';

// prettier-ignore
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), a = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(a, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t) { let e = { "M+": (new Date).getMonth() + 1, "d+": (new Date).getDate(), "H+": (new Date).getHours(), "m+": (new Date).getMinutes(), "s+": (new Date).getSeconds(), "q+": Math.floor(((new Date).getMonth() + 3) / 3), S: (new Date).getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length))); for (let s in e) new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))); let h = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="]; h.push(e), s && h.push(s), i && h.push(i), console.log(h.join("\n")), this.logs = this.logs.concat(h) } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
