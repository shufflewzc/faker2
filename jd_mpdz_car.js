/*
头文字J 
活动快捷入口： 11:/参与头文字J，集能量兑换京豆，【Jιιngヵ栋】 ￥Z9yfjBqzLWt￥
日常任务，助力，游戏
第一个账号助力作者 其他依次助力CK1
默认不做加购任务，如需要设置变量erport car_addsku='true'
只跑前5个CK
33 10,19 * * * jd_mpdz_car.js 
*/

const $ = new Env("头文字JJJ");
const jdCookieNode=$.isNode()?require('./jdCookie.js'):'';
const notify=$.isNode()?require('./sendNotify'):'';
let cookiesArr=[],cookie='';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => { cookiesArr.push(jdCookieNode[item])})
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
allMessage='';
message='';
$.hotFlag=false;
$.outFlag=false;
let shareUuidArr=['B2s863iFzsHJxGtOlrCXxsjNhNaYFy2HteErE6izlhTf9nrGY7gBkCdGU4C6z/xD','WoDXSUOIZFZbWchg5qcDb14tLNYA4seuA67MOIYQxEk3Vl9+AVo4NF+tgyeIc6A6kdK3rLBQpEQH9V4tdrrh0w==','3KtP4oQOaF9hH0uFesDKL14tLNYA4seuA67MOIYQxEk3Vl9+AVo4NF+tgyeIc6A6kdK3rLBQpEQH9V4tdrrh0w==','OsiH6Sic/uTxioPBG6hh5K9AMkY4oJ31vhy6nI5LWbOiIw7XUQOP/Btn03/M1TYH','8AIkpPYAb4jMiUQb+YijkcjNhNaYFy2HteErE6izlhTf9nrGY7gBkCdGU4C6z/xD'];
let n=0;
n=Math.floor(Math.random()*shareUuidArr.length);
let shareUuid=shareUuidArr[n]||'';
!(async()=>{
	console.log('活动快捷入口： 11:/参与头文字J，集能量兑换京豆，【Jιιngヵ栋】 ￥Z9yfjBqzLWt￥');
    if (!cookiesArr[0]) {
      $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {
        "open-url": "https://bean.m.jd.com/"
      });
      return;
    }
	$.userId='10299171';
	$.actId='1760007';
	$.inviteNick=shareUuid;
	for(let o=0; o < 5; o++){
		cookie=cookiesArr[o];
		if(cookie){
			$.UserName=decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/)&&cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
			$.index=o+1;
			message='';
			$.bean=0;
            $.hotFlag = false
			$.nickName=false;
			$.nickName='';
			console.log(`\n\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
			await getUA();
			await run();
			if($.outFlag)break;
		}
	}if($.outFlag){
		let msg='此ip已被限制，请过10分钟后再执行脚本';
		$.msg($.name,'',''+msg);
		if ($.isNode()) await notify.sendNotify(`${$.name}`, `${msg}`);
	}
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())
async function run(){
	try{
		$.hasEnd=true;
		$.Token='';
		$.Pin='';
		$.MixNick='';
		if($.outFlag){
			console.log('此ip已被限制，请过10分钟后再执行脚本');
			return;
		}
		await takePostRequest('isvObfuscator');
		if($.Token==''){
			console.log('获取token失败！');
			return;
		}
		await takePostRequest('activity_load');
		if($.nickName)return;
		if($.MixNick==''){
			console.log('获取mixnick失败');
			return;
		}
        console.log(`助力码：${$.MixNick}\n`);
        if($.hotFlag) return
		await takePostRequest('taskList');
		console.log('开始日常任务。。。');
        for (let i = 0; i < $.taskLists.length; i++){
            $.missionType  = $.taskLists[i].type
            if (!$.taskLists[i].isComplete){
            switch($.missionType){
                case 'bingCar':
                case 'openCard':
                case 'shareAct':    
                    break;
                case 'viewCommodity':
                case 'viewThemeConference':
                    for(let i=0;i<3;i++){
                        await takePostRequest('doTask');
                        await $.wait(parseInt(Math.random()*1000+1000,10));
                    }
                    break;
                case 'collectShop':
                    for(let i=0;i<3;i++){
                        await takePostRequest('getCusShop');
                        await takePostRequest('followShop');
                        await $.wait(parseInt(Math.random()*1000+1000,10));
                    }
                    break;
                case 'addCart':
                    if (process.env.car_addsku && process.env.car_addsku === 'true'){
                    for(let i=0;i<3;i++){
                        await takePostRequest('getCusShopProduct');
                        await takePostRequest('addCart');
                        await $.wait(parseInt(Math.random()*1000+1000,10));
                    }
                    } else {console.log(`默认不加购,请设置变量export car_addsku='true'做加购任务`)}
                    break;
                default:
                    await takePostRequest('doTask');
                    await $.wait(1000);  
            }
            }
        }
        if ($.remainChance){
		    console.log('\n开始游戏。。。');
            await takePostRequest('getCarInfo');
		    for(let i = 0;i < $.remainChance; i++){
		    	await takePostRequest('playGame');
		    	await $.wait(parseInt(Math.random()*2000+5000));
		    	await takePostRequest('sendGameAward');
		    	await $.wait(parseInt(Math.random()*2000+1000));
		    }
        }else{console.log('\n开始游戏：没有游戏币了，明天再来！')}
		await takePostRequest('activity_load');
        await $.wait(1000);
		console.log(`当前剩余能量：${$.remainPoint}\n`);
		await $.wait(1000);
		console.log('开始兑换5豆。。。');
		await takePostRequest('exchange');
		await $.wait(500);
		await takePostRequest('missionInviteList');
        await $.wait(1000);
        console.log(`去助力：${$.inviteNick}`);
		await takePostRequest('助力'); 
		if($.index==1){
			$.inviteNick=$.MixNick;
			console.log(`后面的都会助力：${$.inviteNick}`);
		}
		await $.wait(parseInt(Math.random()*1000+2000,10));
	}catch(e){
		console.log(e);
	}
}
async function takePostRequest(type){
	if($.outFlag)return;
	let domain='https://mpdz-car-dz.isvjcloud.com';
	let body='';
	let method='POST';
	let admJson='';
	switch(type){
		case 'isvObfuscator':
            let sign = await getSignfromDY('isvObfuscator', { "id": "", "url": "https://mpdz-car-dz.isvjcloud.com" })
			url='https://api.m.jd.com/client.action?functionId=isvObfuscator';
			body=sign;
            break;
		case 'activity_load':
			url=`${domain}/dm/front/jdCardRunning/activity/load?open_id=&mix_nick=${$.MixNick}&push_way=3&user_id=`;
			admJson={'jdToken':$.Token,'inviteNick':$.inviteNick};
			body=_0x5338bf('/jdCardRunning/activity/load',admJson);
			break;
		case 'taskList':
			url=`${domain}/dm/front/jdCardRunning/mission/completeState?open_id=&mix_nick=${$.MixNick}`;
			admJson={};
			body=_0x5338bf('/jdCardRunning/mission/completeState',admJson);
			break;
		case'绑定':
			url=`${domain}/dm/front/jdCardRunning/mission/completeMission?open_id=&mix_nick=${$.MixNick}`;
			admJson={'missionType':'shareAct','inviterNick':$.inviteNick||''};
			body=_0x5338bf('/jdCardRunning/mission/completeState',admJson);
			break;
		case'助力':
			url=`${domain}/dm/front/jdCardRunning/mission/completeMission?open_id=&mix_nick=${$.MixNick}`;
			admJson={'missionType':'shareAct','inviterNick':$.inviteNick||'','userId':10299171};
			body=_0x5338bf('/jdCardRunning/mission/completeMission',admJson);
			break;
		case'followShop':
			url=`${domain}/dm/front/jdCardRunning/mission/completeMission?open_id=&mix_nick=${$.MixNick}`;
			admJson={'missionType':$.missionType,'userId':10299171,'shopId':$.userIds,'buyerNick':$.inviteNick};
			body=_0x5338bf('/jdCardRunning/mission/completeMission',admJson);
			break;
		case'addCart':
			url=`${domain}/dm/front/jdCardRunning/mission/completeMission?open_id=&mix_nick=${$.MixNick}`;
			admJson={'missionType':$.missionType,'userId':10299171,'goodsNumId':$.goodsNumId,'buyerNick':$.inviteNick};
			body=_0x5338bf('/jdCardRunning/mission/completeMission',admJson);
			break;
		case 'getCusShop':
			url=`${domain}/dm/front/jdCardRunning/cusShop/getCusShop?open_id=&mix_nick=${$.MixNick}`;
			admJson={};
			body=_0x5338bf('/jdCardRunning/cusShop/getCusShop',admJson);
			break;
		case 'getCusShopProduct':
			url=`${domain}/dm/front/jdCardRunning/cusShop/getCusShopProduct?open_id=&mix_nick=${$.MixNick}`;
			admJson={};
			body=_0x5338bf('/jdCardRunning/cusShop/getCusShop',admJson);
			break;
		case 'doTask':
			url=`${domain}/dm/front/jdCardRunning/mission/completeMission?open_id=&mix_nick=${$.MixNick}`;
			admJson={'actId':$.actId,'missionType':$.missionType};
			body=_0x5338bf('/jdCardRunning/mission/completeMission',admJson);
			break;
		case 'playGame':
			url=`${domain}/dm/front/jdCardRunning/game/playGame?open_id=&mix_nick=${$.MixNick}`;
			admJson={'actId':$.actId,'carId':$.usecar.id,'carName':$.usecar.carName,'userId':10299171,'buyerNick':$.inviteNick};
			body=_0x5338bf('/jdCardRunning/game/playGame',admJson);
			break;
		case 'sendGameAward':
			url=`${domain}/dm/front/jdCardRunning/game/sendGameAward?open_id=&mix_nick=${$.MixNick}`;
			admJson={'actId':$.actId,'point':$.point.point||300,'gameLogId':$.gameLogId,'userId':10299171,'buyerNick':$.inviteNick};
			body=_0x5338bf('/jdCardRunning/game/sendGameAward',admJson);
			break;
		case 'missionInviteList':
			url=`${domain}/dm/front/jdCardRunning/customer/inviteList?open_id=&mix_nick=${$.MixNick}`;
			admJson={'actId':$.actId,'userId':10299171,'missionType':'shareAct','inviteNum':1,'buyerNick':$.MixNick};
			body=_0x5338bf('/jdCardRunning/customer/inviteList',admJson);
			break;
		case 'getCarInfo':
		    url=`${domain}/dm/front/jdCardRunning/carInfo/getCarInfo?open_id=&mix_nick=${$.MixNick}`;
			body=_0x5338bf('/jdCardRunning/cusShop/getCusShop',{});
            break;
		case 'exchange':
		    url=`${domain}/dm/front/jdCardRunning/exchange/exchangeJdMarket?open_id=&mix_nick=${$.MixNick}`;
			admJson={"awardId": "10082bd15b4703","userId": 10299171,"actId": 1760007,"buyerNick": $.inviteNick}
			body=_0x5338bf('/jdCardRunning/exchange/exchangeJdMarket',admJson);
            break;			
		default:
			console.log('错误'+type);
	}
	let myRequest=getPostRequest(url,body,method);
	return new Promise(async resolve=>{
		$.post(myRequest,(err,resp,data)=>{
			try{
				if(err){
					if(resp&&resp.statusCode&&resp.statusCode==493){
						console.log('此ip已被限制，请过10分钟后再执行脚本');
						$.outFlag=true;
					}
					console.log(`${$.toStr(err,err)}`)
					console.log(' API请求失败，请检查网路重试');
				}else{
					dealReturn(type,data);
				}
			}catch(e){
				console.log(e,resp);
			}
			finally{
				resolve();
			}
		});
	});
}
async function dealReturn(type,data){
	let res='';
	try{
		if(type!='accessLogWithAD'||type!='drawContent'){
			if(data){
				res=JSON.parse(data);
			}
		}
	}catch(e){
		console.log(`${type} 执行任务异常`);
		console.log(data);
		$.runFalag=false;
	}
    try{
		switch(type){
			case 'isvObfuscator':
				if(typeof res == 'object'){
					if (res.errcode == 0){
					if (typeof res.token!='undefined') $.Token=res.token;
				} else if (res.message){
					console.log(`isvObfuscator ${res.message}`)
				} else {
					console.log(data);
				}
				} else {
					console.log(data);
				}
				break;
			case 'getCusShop':
				if ( typeof res=='object' ){
					if (res.success && res.success===true && res.data){
					if (res.data.status&&res.data.status==200){
						$.userIds=res.data.data.cusShop.userId;
					}
				} else if (res.message){
					console.log(`${type} ${res.message}`)
				} else {
					console.log(data);
				}
				} else {
					console.log(data);
				}
				break;
			case 'getCusShopProduct':
				if(typeof res=='object'){
					if(res.success&&res.success===true&&res.data){
					if(res.data.status&&res.data.status==200){
						$.goodsNumId=res.data.data.cusShopProduct.numId;
					}
				}else if(res.message){
					console.log(`${type} ${res.message}`)
				}else{
					console.log(data);
				}
				}else{
					console.log(data);
				}
				break;
			case 'taskList':
				if(typeof res=='object'){
					if(res.success&&res.success===true&&res.data){
					if(res.data.status&&res.data.status==200){
						$.taskLists=res.data.data||[];
					}
				}else if(res.message){
					console.log(`${type} ${res.message}`)
				}else{
					console.log(data);
				}
				}else{
					console.log(data);
				}
				break;
			case 'getCarInfo':
				if(typeof res=='object'){
					if(res.success&&res.success===true&&res.data){
					if(res.data.status&&res.data.status==200){
						$.carlist=res.data.data||[];
						$.usecar = $.carlist.reverse().find(item => item.isUnlock === true)
                        console.log(`使用我最牛X的${$.usecar.carName}进行游戏！`)
                        let pointArr = [{id:1,point:100},{id:2,point:150},{id:3,point:200},{id:4,point:300}]
                        $.point = pointArr.find(a => a.id === $.usecar.id)
					}
				}else if(res.message){
					console.log(`${type} ${res.message}`)
				}else{
					console.log(data);
				}
				}else{
					console.log(data);
				}
				break;			
			case 'playGame':
				if(typeof res=='object'){
				    	if(res.success&&res.success===true&&res.data){
				    	    if(res.data.status&&res.data.status==200){
				    	    	$.gameLogId=res.data.data.gameLogId;
				    	    	console.log(`游戏ID： ${$.gameLogId}`);
				    	    }
				        }else if(res.message){  
				    	    console.log(`${type} ${res.message}`)
				        }else{  
				            console.log(data);
				        }
				}else{
					console.log(data);
				}
				break;
			case 'sendGameAward':
				if(typeof res=='object'){
				    if(res.success&&res.data){
				        console.log(`游戏完成，获得${$.point.point}能量!`);
				       }else if(res.message){
				            console.log(`${type} ${res.message}`)
				       }else{
				            console.log(data);
				       }
				}else{
					console.log(data);
				}
				break;
			case 'exchange':
				if(typeof res=='object'){
				    if(res.success&&res.data){
				        console.log(res.data.msg);
				       }else if(res.message){
				            console.log(`${type} ${res.message}`)
				       }else{
				            console.log(data);
				       }
				}else{
					console.log(data);
				}
				break;				
			case 'accessLogWithAD':
			case 'drawContent':
				break;
            case 'specialSign':
			case 'activity_load':
			case 'setMixNick':
			case 'followShop':
			case 'doTask':
			case 'addCart':
			case 'missionInviteList':
			case'绑定':
			case'助力':
                let title=''
				if(type=='followShop')title='关注';
				if(type=='addCart')title='加购';
                if(type=='specialSign')title='签到';
				if(typeof res=='object'){
					if(res.success&&res.success===true&&res.data){
					if(res.data.status&&res.data.status==200){
						res=res.data;
						if(type!='setMixNick'&&(res.msg||res.data.remark)){
                        console.log((title&&title+':'||'')+(res.msg||res.data.isOpenCard||res.data.remark||''));
                        }
						if(type=='activity_load'){
							if(res.data){
								$.MixNick = res.data.missionCustomer.buyerNick || '';
								$.hasCollectShop = res.data.missionCustomer.hasCollectShop || 0;
								$.totalPoint = res.data.missionCustomer.totalPoint || 0;
								$.remainPoint = res.data.missionCustomer.remainPoint || 0;
								$.remainChance = res.data.missionCustomer.remainChance|| 0;
							}
						}else if(type=='missionInviteList'){
							console.log(`本月已邀请助力(${res.data.total})`);
						}
					}else if(res.data.msg){
						console.log(res.data.msg);
					}else if(res.errorMessage){
						console.log(`${type} ${res.errorMessage}`)
					}else{
						console.log(data);
					}
				}else if(res.errorMessage){
					console.log(`${type} ${res.errorMessage}`)
				}else{
					console.log(data);
				}
				}else{
					console.log(data);
				}
				break;
			default:
				console.log(data);
		}
        if(typeof res=='object'){
			if(res.errorMessage){
				if(res.errorMessage.indexOf('火爆')>-1){$.hotFlag = true}
			}
		}
	}catch(e){
		console.log(e);
	}
}
function getPostRequest(url,body,method='POST'){
	let headers={
		'Accept':'application/json',
		'Accept-Encoding':'gzip, deflate, br',
		'Accept-Language':'zh-cn','Connection':'keep-alive',
		'Content-Type':'application/x-www-form-urlencoded',
		'Cookie':cookie,
		'User-Agent':$['UA'],
		'X-Requested-With':'XMLHttpRequest'
	};
	if(url.indexOf('https://mpdz-car-dz.isvjcloud.com')>-1){
		headers['Origin']='https://mpdz-car-dz.isvjcloud.com';
		headers['Content-Type']='application/json; charset=utf-8';
		delete headers.Cookie;
	}
	return{'url':url,'method':method,'headers':headers,'body':body,'timeout':30000};
}
function getSignfromDY(functionId, body) {
    var strsign = '';
    let data = { 'fn': functionId, 'body': JSON.stringify(body) };
    return new Promise((resolve) => {
        let opt = {
            url: "https://api.nolanstore.top/sign",
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            }
            , timeout: 30000
        }
        $.post(opt, async (err, resp, data) => {
            try {
                if (data) {
                    data = JSON.parse(data);
                    if (data && data.body) {
                        console.log("连接Nolan服务成功");
                            strsign = data.body || '';
                        if (strsign != '') {
                            resolve(strsign);
                        }
                        else
                            console.log("签名获取失败,换个时间再试.");
                    } else {
                        console.log(data.msg);
                    }
                } else { console.log('连接服务失败，重试。。。') }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(strsign);
            }
        })
    })
}
function randomString(e) {
    e = e || 32;
    let t = "abcdef0123456789", a = t.length, n = "";
    for (i = 0; i < e; i++)
      n += t.charAt(Math.floor(Math.random() * a));
    return n
}

function jsonParse(str) {
    if (typeof str == "string") {
      try {
        return JSON.parse(str);
      } catch (e) {
        console.log(e);
        $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
        return [];
      }
    }
  }
async function getUA(){
  $.UA = `jdapp;iPhone;10.1.4;13.1.2;${randomString(40)};network/wifi;model/iPhone8,1;addressid/2308460611;appBuild/167814;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`
}
;var encode_version = 'jsjiami.com.v5', jisov = '__0xe4bb2',  __0xe4bb2=['w5PClcOjwo/DvA==','wpUww5vDsQk=','ZznDlsKTGg==','HEMqw4Rb','GkBjDzbCk8ODJcOO','URQ9','QlsVw5E=','f301w7YWRsKjw5bDhcK0MFnDn07CgG0g','b3h8','5YuH6Zq854iM5p6i5Y+7772kwozDn+S/oOWtpOaem+W+k+eqiQ==','TMKjJcOBwpFawrx9wqJgaw==','wq3CiFbCrH8=','w5jDqkfCmXUY','w4J8Q3tcwpXCtQ==','ZTHDtcKfAQ==','w6d/w6Edw5g=','cWMgw6kl','M2rDjMKdbcOr','wrclOl7DnA==','w61SD3bDpcOV','w7wLwq4SwoVhwp8=','f3Uxwrwk','wo7CtiDDq3QnwoA=','EsOzdcOOdg==','VDF4w7ZF','LsKzw4tWCw==','GMOfwoxcVA==','wp97XR3Duw==','wpDCu1tGw6zChw==','wrPCpy4FScOJGw==','All5w4Vj','bilew5LDrQ==','CXjDr8KESQ==','w5rDqyQPwrfCrzZhfA==','AkbCoMOmb2HDo8Og','w5jDrx8VwrLDhyHCpyEOMcK8f0Bgw4lSW8OKwonDjcKAwrvDk1ldwpvCrXoZw4/Cpg==','FUHCoA==','wpRVwpM=','w7lRGm/DicOI','woQew5nDmgrDhsKE','wo3DoFrDkXHCh8O2ND8=','dCVrw5RN','w6PCtlnCgCw=','w7l0V0BQwrnCuA==','KnYIw6xV','wqDCqi45Tg==','woTCuT9DVyM+CsKH','VzRsw4/DrQ==','wr7CjlLCiXpew6M=','w6NPITQD','wovDrEfDmGPCkMOy','MCnCqcKEwrM=','AkwMw4Jl','w4BWSVds','CwTCjsKSwpU=','HFltNE0=','wqvCjGh4Ug==','wrhMWQbDuw==','PR/Cv8Olwpo=','CSxaw51e','RE/DvDDDmg==','w4XDv8KCLQ0=','X1Bz','w65JwptjccK3OMO/PMKtQA==','wpTCtXpTw7PCnX7Dsg==','w5QQwqI=','w61PDmHDisOYfGLDog==','w4fDqkjCgl0RYMKvwozCqQ1GBMOj','54iO5py15Y2e77+jTsO85L+05a+C5p6p5byI56q077666LyM6K2r5pSq5o2g5omg5LuO55iC5be25L29','5YqP6ZuZ54qC5p2C5Y6S776HB8KW5LyZ5a2v5p6Z5b2J56mp','w6BLwoBPYQ==','C3V2HFM=','YmHDkz/Dvw==','M11NMiw='];(function(_0x15847c,_0x13be9c){var _0x18b73f=function(_0x2e831c){while(--_0x2e831c){_0x15847c['push'](_0x15847c['shift']());}};var _0x3c93d6=function(){var _0x2cfebf={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x55dbc4,_0x51ff2,_0x223193,_0x3a07fb){_0x3a07fb=_0x3a07fb||{};var _0x36f822=_0x51ff2+'='+_0x223193;var _0x1ee0c7=0x0;for(var _0x1ee0c7=0x0,_0x4f59a8=_0x55dbc4['length'];_0x1ee0c7<_0x4f59a8;_0x1ee0c7++){var _0x2d6de5=_0x55dbc4[_0x1ee0c7];_0x36f822+=';\x20'+_0x2d6de5;var _0x57012e=_0x55dbc4[_0x2d6de5];_0x55dbc4['push'](_0x57012e);_0x4f59a8=_0x55dbc4['length'];if(_0x57012e!==!![]){_0x36f822+='='+_0x57012e;}}_0x3a07fb['cookie']=_0x36f822;},'removeCookie':function(){return'dev';},'getCookie':function(_0x328dc5,_0x381da8){_0x328dc5=_0x328dc5||function(_0x27b746){return _0x27b746;};var _0x3dfcbb=_0x328dc5(new RegExp('(?:^|;\x20)'+_0x381da8['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x34882a=function(_0x24b795,_0x12a4d0){_0x24b795(++_0x12a4d0);};_0x34882a(_0x18b73f,_0x13be9c);return _0x3dfcbb?decodeURIComponent(_0x3dfcbb[0x1]):undefined;}};var _0x5b87ff=function(){var _0x5d9e82=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x5d9e82['test'](_0x2cfebf['removeCookie']['toString']());};_0x2cfebf['updateCookie']=_0x5b87ff;var _0x135898='';var _0x28414e=_0x2cfebf['updateCookie']();if(!_0x28414e){_0x2cfebf['setCookie'](['*'],'counter',0x1);}else if(_0x28414e){_0x135898=_0x2cfebf['getCookie'](null,'counter');}else{_0x2cfebf['removeCookie']();}};_0x3c93d6();}(__0xe4bb2,0x98));var _0x13f9=function(_0x29b7a7,_0x28d10a){_0x29b7a7=_0x29b7a7-0x0;var _0x12e5ff=__0xe4bb2[_0x29b7a7];if(_0x13f9['initialized']===undefined){(function(){var _0x4db8b7=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0x15bb48='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x4db8b7['atob']||(_0x4db8b7['atob']=function(_0x542d19){var _0x1c6a85=String(_0x542d19)['replace'](/=+$/,'');for(var _0x3758f7=0x0,_0x52c728,_0x4d6b70,_0x27a36b=0x0,_0x3e0021='';_0x4d6b70=_0x1c6a85['charAt'](_0x27a36b++);~_0x4d6b70&&(_0x52c728=_0x3758f7%0x4?_0x52c728*0x40+_0x4d6b70:_0x4d6b70,_0x3758f7++%0x4)?_0x3e0021+=String['fromCharCode'](0xff&_0x52c728>>(-0x2*_0x3758f7&0x6)):0x0){_0x4d6b70=_0x15bb48['indexOf'](_0x4d6b70);}return _0x3e0021;});}());var _0x21e718=function(_0x3faf49,_0x2603d2){var _0xe37118=[],_0x2aff96=0x0,_0xac8719,_0x1b83dc='',_0x3922d9='';_0x3faf49=atob(_0x3faf49);for(var _0x547275=0x0,_0x58dba4=_0x3faf49['length'];_0x547275<_0x58dba4;_0x547275++){_0x3922d9+='%'+('00'+_0x3faf49['charCodeAt'](_0x547275)['toString'](0x10))['slice'](-0x2);}_0x3faf49=decodeURIComponent(_0x3922d9);for(var _0x5df057=0x0;_0x5df057<0x100;_0x5df057++){_0xe37118[_0x5df057]=_0x5df057;}for(_0x5df057=0x0;_0x5df057<0x100;_0x5df057++){_0x2aff96=(_0x2aff96+_0xe37118[_0x5df057]+_0x2603d2['charCodeAt'](_0x5df057%_0x2603d2['length']))%0x100;_0xac8719=_0xe37118[_0x5df057];_0xe37118[_0x5df057]=_0xe37118[_0x2aff96];_0xe37118[_0x2aff96]=_0xac8719;}_0x5df057=0x0;_0x2aff96=0x0;for(var _0x4d6bd9=0x0;_0x4d6bd9<_0x3faf49['length'];_0x4d6bd9++){_0x5df057=(_0x5df057+0x1)%0x100;_0x2aff96=(_0x2aff96+_0xe37118[_0x5df057])%0x100;_0xac8719=_0xe37118[_0x5df057];_0xe37118[_0x5df057]=_0xe37118[_0x2aff96];_0xe37118[_0x2aff96]=_0xac8719;_0x1b83dc+=String['fromCharCode'](_0x3faf49['charCodeAt'](_0x4d6bd9)^_0xe37118[(_0xe37118[_0x5df057]+_0xe37118[_0x2aff96])%0x100]);}return _0x1b83dc;};_0x13f9['rc4']=_0x21e718;_0x13f9['data']={};_0x13f9['initialized']=!![];}var _0x458995=_0x13f9['data'][_0x29b7a7];if(_0x458995===undefined){if(_0x13f9['once']===undefined){var _0x3efbfb=function(_0x5b7e5d){this['rc4Bytes']=_0x5b7e5d;this['states']=[0x1,0x0,0x0];this['newState']=function(){return'newState';};this['firstState']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['secondState']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x3efbfb['prototype']['checkState']=function(){var _0x4fc769=new RegExp(this['firstState']+this['secondState']);return this['runState'](_0x4fc769['test'](this['newState']['toString']())?--this['states'][0x1]:--this['states'][0x0]);};_0x3efbfb['prototype']['runState']=function(_0x519ad8){if(!Boolean(~_0x519ad8)){return _0x519ad8;}return this['getState'](this['rc4Bytes']);};_0x3efbfb['prototype']['getState']=function(_0x29c0f1){for(var _0x2a188e=0x0,_0x19a051=this['states']['length'];_0x2a188e<_0x19a051;_0x2a188e++){this['states']['push'](Math['round'](Math['random']()));_0x19a051=this['states']['length'];}return _0x29c0f1(this['states'][0x0]);};new _0x3efbfb(_0x13f9)['checkState']();_0x13f9['once']=!![];}_0x12e5ff=_0x13f9['rc4'](_0x12e5ff,_0x28d10a);_0x13f9['data'][_0x29b7a7]=_0x12e5ff;}else{_0x12e5ff=_0x458995;}return _0x12e5ff;};const _0x4c8cde=require(_0x13f9('0x0','gDmO'));function _0x5338bf(_0x11eeed,_0x51c57b){var _0x45ed3a={'UBbMY':function _0x455bed(_0x4b545e,_0x5512a9){return _0x4b545e(_0x5512a9);},'LZSOe':_0x13f9('0x1','Xi!r'),'cwflZ':_0x13f9('0x2','[)kV'),'tnrRl':function _0x2f2d3b(_0x178f32,_0x130b8b){return _0x178f32>_0x130b8b;},'prUkB':_0x13f9('0x3','[)kV'),'pPwOF':function _0x84bbaa(_0x713f0a,_0x147b7a){return _0x713f0a!==_0x147b7a;},'ZRpyt':_0x13f9('0x4','qgOw'),'EtoUk':_0x13f9('0x5','1sf1'),'OaFkm':_0x13f9('0x6','C[XU')};tmp={'actId':$[_0x13f9('0x7','FGfQ')],..._0x51c57b,'method':_0x11eeed,'userId':$[_0x13f9('0x8','&GGg')],'buyerNick':$[_0x13f9('0x9','[a%F')]||''};let _0x3bea6b=_0x45ed3a[_0x13f9('0xa','cEX4')](_0x47ea35,tmp);const _0x26670d={'jsonRpc':_0x45ed3a[_0x13f9('0xb','qwou')],'params':{'commonParameter':{'m':_0x45ed3a[_0x13f9('0xc','[)kV')],..._0x3bea6b,'userId':$[_0x13f9('0xd',')^01')]},'admJson':{'actId':$[_0x13f9('0xe','L4ro')],..._0x51c57b,'method':_0x11eeed,'userId':$[_0x13f9('0xf','D64Z')],'buyerNick':$[_0x13f9('0x10','zD5o')]||''}}};if(_0x45ed3a[_0x13f9('0x11','tbLE')](_0x11eeed[_0x13f9('0x12','1sf1')](_0x45ed3a[_0x13f9('0x13','AsaP')]),-0x1)){if(_0x45ed3a[_0x13f9('0x14','R*8u')](_0x45ed3a[_0x13f9('0x15','RazR')],_0x45ed3a[_0x13f9('0x16','sN8o')])){w[c](_0x45ed3a[_0x13f9('0x17','NDKy')]);}else{delete _0x26670d[_0x13f9('0x18','k@pB')][_0x13f9('0x19','E&7!')][_0x13f9('0x1a','Xi!r')];}}return $[_0x13f9('0x1b','AGl5')](_0x26670d,_0x45ed3a[_0x13f9('0x1c',')^01')]);}function _0x47ea35(_0x40b730){var _0x200df2={'PDdmN':_0x13f9('0x1d','sy)G'),'gyvLi':_0x13f9('0x1e','cEX4'),'rimvt':_0x13f9('0x1f','k@pB'),'Mrair':function _0x2e2944(_0x4181c2,_0x33c2a6){return _0x4181c2(_0x33c2a6);},'pnzQG':_0x13f9('0x20','cEX4'),'yxQgd':_0x13f9('0x21','zD5o'),'OCrbY':function _0x18df5f(_0xd54182,_0x4ac89e){return _0xd54182+_0x4ac89e;},'BUvqB':function _0x2eb64f(_0x40c8de,_0x1c2601){return _0x40c8de+_0x1c2601;},'UEuKV':function _0x35bd9d(_0x1765cb,_0x22c6ab){return _0x1765cb+_0x22c6ab;},'bCkNk':function _0x5a2915(_0x483dd0,_0x5d8262){return _0x483dd0+_0x5d8262;},'whBgd':_0x13f9('0x22','D64Z'),'iijCp':_0x13f9('0x23','TO$S'),'jBHCh':_0x13f9('0x24','3rCv')};var _0x282bbc=_0x200df2[_0x13f9('0x25','R*8u')][_0x13f9('0x26','KwmE')]('|'),_0x33054b=0x0;while(!![]){switch(_0x282bbc[_0x33054b++]){case'0':time=new Date()[_0x13f9('0x27','[a%F')]();continue;case'1':ak=_0x200df2[_0x13f9('0x28','coTA')];continue;case'2':AppSecret=_0x200df2[_0x13f9('0x29','E&7!')];continue;case'3':o=JSON[_0x13f9('0x2a','iw7p')](_0x40b730),s=_0x200df2[_0x13f9('0x2b','AGl5')](encodeURIComponent,o),c=new RegExp('\x27','g'),A=new RegExp('~','g'),s=s[_0x13f9('0x2c','FGfQ')](c,_0x200df2[_0x13f9('0x2d','H!Wr')]),s=s[_0x13f9('0x2e','3rCv')](A,_0x200df2[_0x13f9('0x2f','8Ny&')]),signBody=_0x200df2[_0x13f9('0x30','coTA')](_0x200df2[_0x13f9('0x31','[a%F')](_0x200df2[_0x13f9('0x32','8Ny&')](_0x200df2[_0x13f9('0x33','ua59')](_0x200df2[_0x13f9('0x34','w8lc')](_0x200df2[_0x13f9('0x35','NDKy')](_0x200df2[_0x13f9('0x36','LPGV')](ak,_0x200df2[_0x13f9('0x37','VZXx')]),ak),_0x200df2[_0x13f9('0x38','C5Sc')]),s),_0x200df2[_0x13f9('0x39','9jlI')]),time),AppSecret);continue;case'4':return{'sign':_0x4c8cde[_0x13f9('0x3a','[)kV')](signBody[_0x13f9('0x3b','r^z]')]())[_0x13f9('0x3c','k@pB')](),'timeStamp':time};}break;}};;;encode_version = 'jsjiami.com.v5';
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}