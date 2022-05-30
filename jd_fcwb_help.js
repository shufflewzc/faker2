/*
发财挖宝-助力CK1
活动入口：极速版-发财挖宝
默认助力满30停止。
定时自己按需设置，默认不运行
40 10 10 5 * https://github.com/6dylan6/jdpro/jd_fcwb_help.js

*/
const $ = new Env('发财挖宝助力');
const notify=$.isNode()?require('./sendNotify'):'';
const jdCookieNode=$.isNode()?require('./jdCookie.js'):'';
const JD_API_HOST='https://api.m.jd.com';
let cookiesArr=[],cookie='',message;
let inviteCodes=[];
$.hasEnd=false;
let link='pTTvJeSTrpthgk9ASBVGsw';
var timestamp=new Date().getTime();
if($.isNode()){
	Object.keys(jdCookieNode).forEach(_0x1c04d7=>{
		cookiesArr.push(jdCookieNode[_0x1c04d7]);
	});
	if(process.env.JD_DEBUG&&process.env.JD_DEBUG==='false')console.log=()=>{};
}else{
	cookiesArr=[$.getdata('CookieJD'),$.getdata('CookieJD2'),...jsonParse($.getdata('CookiesJD')||'[]').map(_0x15d467=>_0x15d467.cookie)].filter(_0x121615=>!!_0x121615);
}
!(async()=>{
	console.log('\n【默认全部助力CK1，邀请满40自动停止】\n');
	if(!cookiesArr[0]){
		$.msg($.name,'【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取','https://bean.m.jd.com/bean/signIndex.action',{'open-url':'https://bean.m.jd.com/bean/signIndex.action'});
		return;
	}for(let _0x3f7b30=0;_0x3f7b30<cookiesArr.length;_0x3f7b30++){
		if(cookiesArr[_0x3f7b30]){
			cookie=cookiesArr[_0x3f7b30];
			$.UserName=decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/)&&cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
			$.index=_0x3f7b30+1;
			$.isLogin=true;
			$.nickName='';
			message='';
			await TotalBean();
			console.log('\n******开始【京东账号'+$.index+'】'+($.nickName||$.UserName)+'*********\n');
			if(!$.isLogin){
				$.msg($.name,'【提示】cookie已失效','京东账号'+$.index+' '+($.nickName||$.UserName)+'\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action',{'open-url':'https://bean.m.jd.com/bean/signIndex.action'});
				if($.isNode()){
					await notify.sendNotify($.name+'cookie已失效 - '+$.UserName,'京东账号'+$.index+' '+$.UserName+'\n请重新登录获取cookie');
				}
				continue;
			}
			await getUA();
			await run();
			if($.hasEnd)break;
		}
	}
})().catch(_0x322a19=>{
	$.log('','❌ '+$.name+', 失败! 原因: '+_0x322a19+'!','');
}).finally(()=>{
	$.done();
});
async function run(){
	$.personNum=0;
	try{
		await happyDigHome();
		let _0x18e692=await help();
		await happyDigHelpList();
		if($.index==1){
			$.helpCount=$.personNum;
		}else if($.helpok==true){
			$.helpCount++;
		}
		console.log('【账号'+$.index+'】已邀请人数：'+$.personNum+($.index!=1&&' 【账号1】已邀请人数：'+$.helpCount||''));
		if($.helpCount>=30)$.hasEnd=true;
	}catch(_0x933d6a){
		console.log(_0x933d6a);
	}
}
function happyDigHome(){
	return new Promise(_0x20e5bf=>{
		let _0xbf752b={'linkId':link};
		$.get(taskurl('happyDigHome',_0xbf752b),async(_0x47107b,_0x16984e,_0x1761e9)=>{
			try{
				if(_0x47107b){
					console.log(''+JSON.stringify(_0x47107b));
					console.log($.name+' API请求失败，请检查网路重试');
				}else{
					if(safeGet(_0x1761e9)){
						_0x1761e9=JSON.parse(_0x1761e9);
						if($.index===1){
							if(_0x1761e9.success==true){
								curRound=_0x1761e9.data.curRound;
								inviteCode=_0x1761e9.data.inviteCode;
								inviter=_0x1761e9.data.markedPin;
								blood=_0x1761e9.data.blood;
								console.log('【当前助力】:'+_0x1761e9.data.inviteCode);
								if(_0x1761e9.data&&_0x1761e9.data.inviteCode&&inviteCodes.length===0){
									inviteCodes.push({'user':$.UserName,'fcwbinviteCode':_0x1761e9.data.inviteCode,'fcwbinviter':_0x1761e9.data.markedPin});
								}
							}
						}else if(_0x1761e9.success==false){
							console.log('抱歉，貌似账号已黑，跳过！');
						}
					}
				}
			}catch(_0x308f44){
				$.logErr(_0x308f44,_0x16984e);
			}
			finally{
				_0x20e5bf(_0x1761e9);
			}
		});
	});
}
function happyDigHelpList(){
	return new Promise(_0x113adb=>{
		let _0x4b24a4={'pageNum':1,'pageSize':50,'linkId':link};
		$.get(taskurl('happyDigHelpList',_0x4b24a4),async(_0xa99dec,_0x50313b,_0x2075fc)=>{
			try{
				if(_0xa99dec){
					console.log(''+JSON.stringify(_0xa99dec));
					console.log($.name+' API请求失败，请检查网路重试');
				}else{
					if(safeGet(_0x2075fc)){
						_0x2075fc=JSON.parse(_0x2075fc);
						if(_0x2075fc.success==true){
							$.personNum=_0x2075fc.data.personNum;
						}else if(_0x2075fc.success==false){
							console.log('抱歉，貌似账号已黑，跳过！');
						}
					}
				}
			}catch(_0x39d81f){
				$.logErr(_0x39d81f,_0x50313b);
			}
			finally{
				_0x113adb(_0x2075fc);
			}
		});
	});
}
function help(){
	return new Promise(async _0x52a3aa=>{
		let _0x16840e=inviteCode;
		let _0x19e198=inviter;
		let _0x5eef66='{"linkId":"pTTvJeSTrpthgk9ASBVGsw","inviter":"'+inviter+'","inviteCode":"'+inviteCode+'"}';
		let _0x5d2275='20220412164641157%3B197ee697d50ca316f3582488c7fa9d34%3B169f1%3Btk02wd9451deb18n1P31JunSGTfZhmebuivwsEwYWUQF1ZkpdtuSmKOES5DnIMFdyOvKikdguelIiBUnJbeCgoNlcEvv%3B6e090cbde337590b51a514718fee391d46fece6b953ed1084a052f6d76ffbd92%3B3.0%3B1649753201157';
		let _0x7e6466={'url':'https://api.m.jd.com/?functionId=happyDigHelp&body='+_0x5eef66+'&t='+Date.now()+'&appid=activities_platform&client=H5&clientVersion=1.0.0&h5st='+_0x5d2275,'headers':{'Cookie':cookie,'Origin':'https://api.m.jd.com','User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'}};
		$.get(_0x7e6466,async(_0x39eee7,_0x3f31fc,_0x3c30a1)=>{
			try{
				if(_0x39eee7){
					console.log(''+JSON.stringify(_0x39eee7));
					console.log($.name+' API请求失败，请检查网路重试');
				}else{
					if(safeGet(_0x3c30a1)){
						_0x3c30a1=JSON.parse(_0x3c30a1);
						$.helpok=_0x3c30a1.success;
						if(_0x3c30a1.success==true){
							console.log('【助力状态】：'+_0x3c30a1.errMsg);
						}else if(_0x3c30a1.success==false){
							console.log('【助力状态】：'+_0x3c30a1.errMsg);
						}
					}
				}
			}catch(_0x17a4cd){
				$.logErr(_0x17a4cd,_0x3f31fc);
			}
			finally{
				_0x52a3aa(_0x3c30a1);
			}
		});
	});
}
function TotalBean(){
	return new Promise(async _0x2ff925=>{
		const _0x4639ef={'url':'https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2','headers':{
				'Accept':'application/json,text/plain, */*','Content-Type':'application/x-www-form-urlencoded','Accept-Encoding':'gzip, deflate, br','Accept-Language':'zh-cn','Connection':'keep-alive','Cookie':cookie,'Referer':'https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2','User-Agent':$.isNode()?process.env.JD_USER_AGENT?process.env.JD_USER_AGENT:require('./USER_AGENTS').USER_AGENT:$.getdata('JDUA')?$.getdata('JDUA'):'jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1'
			}};
		$.post(_0x4639ef,(_0x177153,_0xec7363,_0x897e8)=>{
			try{
				if(_0x177153){
					console.log(''+JSON.stringify(_0x177153));
					console.log($.name+' API请求失败，请检查网路重试');
				}else{
					if(_0x897e8){
						_0x897e8=JSON.parse(_0x897e8);
						if(_0x897e8.retcode===13){
							$.isLogin=false;
							return;
						}if(_0x897e8.retcode===0){
							$.nickName=_0x897e8.base&&_0x897e8.base.nickname||$.UserName;
						}else{
							$.nickName=$.UserName;
						}
					}else{
						console.log('京东服务器返回空数据');
					}
				}
			}catch(_0x5c13a1){
				$.logErr(_0x5c13a1,_0xec7363);
			}
			finally{
				_0x2ff925();
			}
		});
	});
}
function getUA(){
	$['UA']='jdapp;iPhone;10.2.2;14.3;'+randomString(40)+';M/5.0;network/wifi;ADID/;model/iPhone12,1;addressid/4199175193;appBuild/167863;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;';
}
function randomString(_0x2d2943){
	_0x2d2943=_0x2d2943||32;
	let _0x323439='abcdef0123456789',_0x28976f=_0x323439.length,_0x279841='';
	for(i=0;i<_0x2d2943;i++)_0x279841+=_0x323439.charAt(Math.floor(Math.random()*_0x28976f));
	return _0x279841;
}
function safeGet(_0x1ce2ce){
	try{
		if(typeof JSON.parse(_0x1ce2ce)=='object'){
			return true;
		}
	}catch(_0x34d1ca){
		console.log(_0x34d1ca);
		console.log('京东服务器访问数据为空，请检查自身设备网络情况');
		return false;
	}
}
function jsonParse(_0x49e261){
	if(typeof _0x49e261=='string'){
		try{
			return JSON.parse(_0x49e261);
		}catch(_0x54253e){
			console.log(_0x54253e);
			$.msg($.name,'','请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie');
			return[];
		}
	}
}
function taskurl(_0x782dfd,_0x273e4e){
	return{'url':JD_API_HOST+'/?functionId='+_0x782dfd+'&body='+escape(JSON.stringify(_0x273e4e))+'&t=1635561607124&appid=activities_platform&client=H5&clientVersion=1.2.0','headers':{'Cookie':cookie,'Origin':'https://bnzf.jd.com','User-Agent':' jdltapp;iPhone;3.7.6;'}};
};

// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}

