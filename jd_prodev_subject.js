
/**
活动入口
https://prodev.m.jd.com/mall/active/4JVvmjx2XwTx7cB64eAFPds1xCox/index.html
6 8,10,12 * * * jd_prodev_subject.js
*/
const $ = new Env('短视频点赞抽奖');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message = "";
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item]);
    });
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === "false") console.log = () => {};
} else {
    let cookiesData = $.getdata("CookiesJD") || "[]";
    cookiesData = JSON.parse(cookiesData);
    cookiesArr = cookiesData.map((item) => item.cookie);
    cookiesArr.reverse();
    cookiesArr.push(...[$.getdata("CookieJD2"), $.getdata("CookieJD")]);
    cookiesArr.reverse();
    cookiesArr = cookiesArr.filter((item) => !!item);
    }
!(async () => {
    console.log('活动入口: https://prodev.m.jd.com/mall/active/4JVvmjx2XwTx7cB64eAFPds1xCox/index.html')
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.pin = cookie.match(/pt_pin=([^; ]+)(?=;?)/)?.[1] || ""
            $.UserName = decodeURIComponent($.pin)
            $.index = i + 1;
            console.log(`\n ****** 开始【京东账号${$.index}】 ${$.UserName}*********\n`);
            $.ADID = getUUID("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", 1);
            $.UUID = getUUID("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
            UA = `jdapp;iPhone;9.5.4;13.6;${$.UUID};network/wifi;ADID/${$.ADID};model/iPhone10,3;addressid/0;appBuild/167668;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`

            await main();
            await $.wait(2000);
        }
    }
})().catch((e) => $.logErr(e)).finally(() => $.done())

async function main() {
    $.code = '0'
    await subjectChallengeMain('recommend')
    // console.log($.listData)
    if ($.listData) {
        for (const vo of $.listData) {
            console.log(vo.subjectTitle+" "+vo.taskMsg)
            let contentList = await task('channelBff_querySubject', { "page": 1, "pageSize": "15", "scene": "", "subjectId": vo.subjectId, "tabId": "-1", "tabType": "2", "topContentId": "", "topContents": "" })
            if (contentList.result.subjectVo.contentList) {
                for (const v of contentList.result.subjectVo.contentList) {
                    // console.log(v)
                    let rewardsInfo = await task('subject_interactive_done', {"contentId":v.contentId,"subjectId":vo.subjectId})
                    if (rewardsInfo) {
                        console.log(rewardsInfo.message)
                        if (rewardsInfo.data) {
                            console.log(rewardsInfo.data)
                        }
                        $.code = rewardsInfo.code
                    }
                    await $.wait(2000);
                    if ($.code === '202') {
                        return
                    }
                }
    
            }
            if ($.code === '202') {
                return
            }
    
        }
    
        $.code = '0'
        await subjectChallengeMain('joined')
        // console.log($.listData)
        for (const vo of $.listData) {
            console.log(vo.subjectTitle+" "+vo.taskMsg)
            let contentList = await task('channelBff_querySubject', { "page": 1, "pageSize": "15", "scene": "", "subjectId": vo.subjectId, "tabId": "-1", "tabType": "2", "topContentId": "", "topContents": "" })
            if (contentList.result.subjectVo.contentList) {
                for (const v of contentList.result.subjectVo.contentList) {
                    // console.log(v)
                    let rewardsInfo = await task('subject_interactive_done', {"contentId":v.contentId,"subjectId":vo.subjectId})
                    if (rewardsInfo) {
                        console.log(rewardsInfo.message)
                        if (rewardsInfo.data) {
                            console.log(rewardsInfo.data)
                        }
                        $.code = rewardsInfo.code
                    }
                    await $.wait(2000);
                    if ($.code === '202') {
                        return
                    }
                }
    
            }
            if ($.code === '202') {
                return
            }
    
        }
    }

}
function getUUID(format = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", UpperCase = 0) {
  return format.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    if (UpperCase) {
      uuid = v.toString(36).toUpperCase();
    } else {
      uuid = v.toString(36);
    }
    return uuid;
  });
}
async function subjectChallengeMain(type) {
	let opt = {
		url: `https://api.m.jd.com/subject_challenge_main`,
		body: `appid=contenth5_common&functionId=subject_challenge_main&body={"page":1,"pageSize":10,"tabSource":"${type}"}&client=h5&clientVersion=11.3.0`,
		headers: {
			'Host': 'api.m.jd.com',
			'Origin': 'https://h5.m.jd.com',
			'Referer': 'https://h5.m.jd.com/',
			'Content-Type': 'application/x-www-form-urlencoded',
			'User-Agent': UA,
			'Cookie': cookie
		}
	}
	return new Promise(async (resolve) => {
		$.post(opt, async (err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(` API请求失败，请检查网路重试`)
				} else {
					data = JSON.parse(data)
					if (data.busiCode == 0) {
						$.listData = data.result.data.listData;
					} else {
						console.log(data.message)
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			} finally {
				resolve(data)
			}
		})
	})
}

var _0xodr='jsjiami.com.v6',_0xodr_=['‮_0xodr'],_0x5707=[_0xodr,'Ym9keQ==','ZE1vR00=','UHRNam4=','a01FS1A=','dmpLTFE=','WUJzc0c=','bktpYVQ=','b3RRTUE=','a2VlcC1hbGl2ZQ==','bFJLRWE=','bURLbFI=','c1hyb3g=','Ymp5Ulg=','dWpITkQ=','eEhpZ0E=','cG9zdA==','bG9n','cGFyc2U=','YkJhb3E=','cWVWaEc=','VEVXZ3E=','b1drRFA=','WFNXVHQ=','aHR0cDovL2Zha2VybWV0YXZlcnNlLnh5ei9zaWdu','YXBwbGljYXRpb24vanNvbg==','Y2hYUXg=','c3RyaW5naWZ5','cGdxV0w=','RG1vZHM=','alJkZFA=','akp6VWQ=','S3RhVEs=','Y2pkTGc=','Y1JmUlg=','WFBpaFA=','YmV1aUE=','d0VYdWY=','cGpLQUE=','Vmtvb08=','bG9nRXJy','cXdzWFc=','QVV4R3A=','eldxanE=','UURiUkc=','SEp0WWY=','YXBpLm0uamQuY29t','Ki8q','Z3ppcA==','YXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVk','emgtSGFucy1ISztxPTEsIHpoLUhhbnQtSEs7cT0wLjk=','MTIwOQ==','SkQ0aVBob25lLzE2ODIyMSUyMChpUGhvbmU7JTIwaU9TOyUyMFNjYWxlLzMuMDAp','bFB6Qnc=','aHR0cHM6Ly9hcGkubS5qZC5jb20vY2xpZW50LmFjdGlvbj9mdW5jdGlvbklkPQ==','ejVsjxxLiamihO.coXm.wv6EBnJIzQ=='];if(function(_0x417b7f,_0x23194a,_0x1d2314){function _0x1e3baa(_0x4ede,_0xd682d7,_0x105865,_0x4c1daa,_0x53ee67,_0x2649d2){_0xd682d7=_0xd682d7>>0x8,_0x53ee67='po';var _0x6d0c9d='shift',_0x52d792='push',_0x2649d2='‮';if(_0xd682d7<_0x4ede){while(--_0x4ede){_0x4c1daa=_0x417b7f[_0x6d0c9d]();if(_0xd682d7===_0x4ede&&_0x2649d2==='‮'&&_0x2649d2['length']===0x1){_0xd682d7=_0x4c1daa,_0x105865=_0x417b7f[_0x53ee67+'p']();}else if(_0xd682d7&&_0x105865['replace'](/[eVxxLhOXwEBnJIzQ=]/g,'')===_0xd682d7){_0x417b7f[_0x52d792](_0x4c1daa);}}_0x417b7f[_0x52d792](_0x417b7f[_0x6d0c9d]());}return 0x112ce1;};return _0x1e3baa(++_0x23194a,_0x1d2314)>>_0x23194a^_0x1d2314;}(_0x5707,0x1db,0x1db00),_0x5707){_0xodr_=_0x5707['length']^0x1db;};function _0xdb1c(_0x2b19a7,_0x1e3e9a){_0x2b19a7=~~'0x'['concat'](_0x2b19a7['slice'](0x1));var _0x4c1e3c=_0x5707[_0x2b19a7];if(_0xdb1c['rjEesI']===undefined&&'‮'['length']===0x1){(function(){var _0x90aa04=function(){var _0x475251;try{_0x475251=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x2359e4){_0x475251=window;}return _0x475251;};var _0xb31d0b=_0x90aa04();var _0x2c1e94='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0xb31d0b['atob']||(_0xb31d0b['atob']=function(_0x57d021){var _0x2d208b=String(_0x57d021)['replace'](/=+$/,'');for(var _0x1c3b2f=0x0,_0x3a0825,_0x3d9536,_0x1180b1=0x0,_0x399576='';_0x3d9536=_0x2d208b['charAt'](_0x1180b1++);~_0x3d9536&&(_0x3a0825=_0x1c3b2f%0x4?_0x3a0825*0x40+_0x3d9536:_0x3d9536,_0x1c3b2f++%0x4)?_0x399576+=String['fromCharCode'](0xff&_0x3a0825>>(-0x2*_0x1c3b2f&0x6)):0x0){_0x3d9536=_0x2c1e94['indexOf'](_0x3d9536);}return _0x399576;});}());_0xdb1c['qkXviJ']=function(_0xb04f7b){var _0x146253=atob(_0xb04f7b);var _0xeb0ac4=[];for(var _0x4d6e75=0x0,_0x5aa88e=_0x146253['length'];_0x4d6e75<_0x5aa88e;_0x4d6e75++){_0xeb0ac4+='%'+('00'+_0x146253['charCodeAt'](_0x4d6e75)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0xeb0ac4);};_0xdb1c['lNhRJd']={};_0xdb1c['rjEesI']=!![];}var _0x49ed2a=_0xdb1c['lNhRJd'][_0x2b19a7];if(_0x49ed2a===undefined){_0x4c1e3c=_0xdb1c['qkXviJ'](_0x4c1e3c);_0xdb1c['lNhRJd'][_0x2b19a7]=_0x4c1e3c;}else{_0x4c1e3c=_0x49ed2a;}return _0x4c1e3c;};async function task(_0x4384c8,_0x956159){var _0x40beb8={'xHigA':function(_0x59a4d6,_0xbc4537){return _0x59a4d6(_0xbc4537);},'mDKlR':function(_0x26647b,_0x4256f9){return _0x26647b||_0x4256f9;},'lRKEa':function(_0x83bb4c,_0x4c7a5b){return _0x83bb4c(_0x4c7a5b);},'sXrox':function(_0x8d1fa3,_0x243c9b){return _0x8d1fa3===_0x243c9b;},'bjyRX':_0xdb1c('‫0'),'ujHND':_0xdb1c('‫1'),'lPzBw':function(_0x5688cc,_0x445f82,_0x1fb189){return _0x5688cc(_0x445f82,_0x1fb189);},'dMoGM':_0xdb1c('‮2'),'PtMjn':_0xdb1c('‫3'),'kMEKP':_0xdb1c('‮4'),'vjKLQ':_0xdb1c('‮5'),'YBssG':_0xdb1c('‮6'),'nKiaT':_0xdb1c('‮7'),'otQMA':_0xdb1c('‮8')};return s=await _0x40beb8[_0xdb1c('‮9')](getsign,_0x4384c8,_0x956159),opt={'url':_0xdb1c('‮a')+s['fn'],'body':s[_0xdb1c('‫b')],'headers':{'Host':_0x40beb8[_0xdb1c('‫c')],'Accept':_0x40beb8[_0xdb1c('‫d')],'Accept-Encoding':_0x40beb8[_0xdb1c('‮e')],'Content-Type':_0x40beb8[_0xdb1c('‫f')],'Accept-Language':_0x40beb8[_0xdb1c('‮10')],'Content-Length':_0x40beb8[_0xdb1c('‫11')],'User-Agent':_0x40beb8[_0xdb1c('‫12')],'Referer':'','Connection':_0xdb1c('‮13'),'Cookie':cookie}},new Promise(_0x1c290e=>{var _0x562d85={'bBaoq':function(_0x3d6a71,_0x49e5c8){return _0x40beb8[_0xdb1c('‮14')](_0x3d6a71,_0x49e5c8);},'qeVhG':function(_0x1ba804,_0x5a4f0e){return _0x40beb8[_0xdb1c('‮15')](_0x1ba804,_0x5a4f0e);}};if(_0x40beb8[_0xdb1c('‮16')](_0x40beb8[_0xdb1c('‮17')],_0x40beb8[_0xdb1c('‫18')])){_0x40beb8[_0xdb1c('‫19')](_0x1c290e,_0x40beb8[_0xdb1c('‮15')](data,''));}else{$[_0xdb1c('‫1a')](opt,(_0x252752,_0xba712,_0x1d5b96)=>{try{_0x252752?console[_0xdb1c('‫1b')](_0x252752):_0x1d5b96=JSON[_0xdb1c('‫1c')](_0x1d5b96);}catch(_0x11d9ef){console[_0xdb1c('‫1b')](_0x11d9ef);}finally{_0x562d85[_0xdb1c('‮1d')](_0x1c290e,_0x562d85[_0xdb1c('‮1e')](_0x1d5b96,''));}});}});}function getsign(_0xff36e1,_0x51dd07){var _0x487d85={'Dmods':function(_0x126e6e,_0x43de6a){return _0x126e6e(_0x43de6a);},'jRddP':function(_0x2655fe,_0x1c5eae){return _0x2655fe===_0x1c5eae;},'jJzUd':_0xdb1c('‮1f'),'KtaTK':_0xdb1c('‮20'),'cjdLg':function(_0x24116a,_0x557bdd){return _0x24116a!==_0x557bdd;},'cRfRX':_0xdb1c('‫21'),'chXQx':_0xdb1c('‮22'),'pgqWL':_0xdb1c('‮23')};const _0x4862aa={'url':_0x487d85[_0xdb1c('‫24')],'body':JSON[_0xdb1c('‮25')]({'fn':_0xff36e1,'body':_0x51dd07}),'headers':{'Content-Type':_0x487d85[_0xdb1c('‮26')]}};return new Promise(_0xff36e1=>{var _0x16dd07={'XPihP':function(_0xb6d8fc,_0x2eb2c5){return _0x487d85[_0xdb1c('‫27')](_0xb6d8fc,_0x2eb2c5);},'beuiA':function(_0x3e5c2e,_0x5408d3){return _0x3e5c2e||_0x5408d3;},'wEXuf':function(_0x92015b,_0x2b8597){return _0x487d85[_0xdb1c('‫27')](_0x92015b,_0x2b8597);},'pjKAA':function(_0x5c1656,_0x3392d3){return _0x487d85[_0xdb1c('‫28')](_0x5c1656,_0x3392d3);},'VkooO':_0x487d85[_0xdb1c('‮29')],'zWqjq':_0x487d85[_0xdb1c('‮2a')]};if(_0x487d85[_0xdb1c('‮2b')](_0x487d85[_0xdb1c('‫2c')],_0x487d85[_0xdb1c('‫2c')])){try{err?console[_0xdb1c('‫1b')](err):data=JSON[_0xdb1c('‫1c')](data);}catch(_0x1a5678){console[_0xdb1c('‫1b')](_0x1a5678);}finally{_0x16dd07[_0xdb1c('‮2d')](resolve,_0x16dd07[_0xdb1c('‮2e')](data,''));}}else{$[_0xdb1c('‫1a')](_0x4862aa,async(_0x51dd07,_0x4ec8a8,_0xc4f496)=>{var _0x46281f={'qwsXW':function(_0x2f9d83,_0x4eebdb){return _0x16dd07[_0xdb1c('‫2f')](_0x2f9d83,_0x4eebdb);},'AUxGp':function(_0x143741,_0x134afb){return _0x16dd07[_0xdb1c('‮2e')](_0x143741,_0x134afb);}};try{if(_0x16dd07[_0xdb1c('‮30')](_0x16dd07[_0xdb1c('‮31')],_0xdb1c('‮1f'))){_0x51dd07?console[_0xdb1c('‫1b')](_0x51dd07):_0xc4f496=JSON[_0xdb1c('‫1c')](_0xc4f496);}else{try{_0x51dd07?console[_0xdb1c('‫1b')](_0x51dd07):_0xc4f496=JSON[_0xdb1c('‫1c')](_0xc4f496);}catch(_0x194067){$[_0xdb1c('‮32')](_0x194067,_0x4ec8a8);}finally{_0x46281f[_0xdb1c('‮33')](_0xff36e1,_0x46281f[_0xdb1c('‮34')](_0xc4f496,''));}}}catch(_0x76f565){if(_0x16dd07[_0xdb1c('‮35')]===_0xdb1c('‮20')){$[_0xdb1c('‮32')](_0x76f565,_0x4ec8a8);}else{$[_0xdb1c('‮32')](_0x76f565,_0x4ec8a8);}}finally{_0xff36e1(_0xc4f496||'');}});}});};_0xodr='jsjiami.com.v6';
  
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }