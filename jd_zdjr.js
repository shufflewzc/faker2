/*
const $=new Env('LZ组队瓜分京豆')
一共有2个变量
jd_zdjr_activityId  活动ID 必需
jd_zdjr_activityUrl 活动地址 必需
已适配docker
需要配合重写获取=>活动id、活动地址
https://\w+-isv.isvjcloud.com/wxTeam/shopInfo url script-request-body jd_zdjr.js
mitm
1 1 1 1 1 1 jd_zdjr.js
*-isv.isvjcloud.com

Fix by HarbourJ, 2022.06.15
TG: https://t.me/HarbourToulu

2022年5月8日由https://github.com/insoxin/解密
解密附言:下列js中的如果有非京东官方服务器绝对不是我的,原作就有,不承担任何责任,有能力者可自行解密对验
*/

let jd_zdjr_activityId = '0c50cfa7551e475d93ae4c3ad612dbcb'// 活动ID
let jd_zdjr_activityUrl = 'https://lzkjdz-isv.isvjcloud.com'// 活动地址

const $=new Env('LZ组队瓜分京豆');
const notify=$.isNode()?require('./sendNotify'):'';
const jdCookieNode=$.isNode()?require('./jdCookie.js'):'';
let lz_cookie={};
let cookiesArr=[],cookie='',message='',messageTitle='';
activityId=$.getdata('jd_zdjr_activityId')?$.getdata('jd_zdjr_activityId'):jd_zdjr_activityId;
activityUrl=$.getdata('jd_zdjr_activityUrl')?$.getdata('jd_zdjr_activityUrl'):jd_zdjr_activityUrl;
let activityCookie='';
if($.isNode()){
	if(process.env.jd_zdjr_activityId)activityId=process.env.jd_zdjr_activityId;
	if(process.env.jd_zdjr_activityUrl)activityUrl=process.env.jd_zdjr_activityUrl;
	Object.keys(jdCookieNode).forEach(_0x2bc861=>{
		cookiesArr.push(jdCookieNode[_0x2bc861]);
	});
	if(process.env.JD_DEBUG&&process.env.JD_DEBUG==='false')console.log=()=>{};
	if(JSON.stringify(process.env).indexOf('GITHUB')>-1)process.exit(0);
}else{
	let cookiesData=$.getdata('CookiesJD')||'[]';
	cookiesData=JSON.parse(cookiesData);
	cookiesArr=cookiesData.map(_0x4e4f7f=>_0x4e4f7f.cookie);
	cookiesArr.reverse();
	cookiesArr.push(...[$.getdata('CookieJD2'),$.getdata('CookieJD')]);
	cookiesArr.reverse();
	cookiesArr=cookiesArr.filter(_0x3867f5=>!!_0x3867f5);
}
const JD_API_HOST='https://api.m.jd.com/client.action';
let isGetCookie=typeof $request!=='undefined';
if(isGetCookie){
	GetCookie();
	$.done();
}
!(async()=>{
	if(!activityId){
		$.msg($.name,'','活动id不存在');
		$.done();
		return;
	}
	console.log('【当前活动入口】\nhttps://lzkjdz-isv.isvjcloud.com/wxTeam/activity?activityId='+activityId);
	if(!cookiesArr[0]){
		$.msg($.name,'【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取','https://bean.m.jd.com/',{'open-url':'https://bean.m.jd.com/'});
		return;
	}
	$.memberCount=0;
	messageTitle+=('活动id:\n'+activityId+'\n');
	$.toactivity=true;
	for(let _0x30b146=0;_0x30b146<cookiesArr.length;_0x30b146++){
		if(cookiesArr[_0x30b146]){
			cookie=cookiesArr[_0x30b146];
			originCookie=cookiesArr[_0x30b146];
			$.UserName=decodeURIComponent(cookie.match(/pt_pin=(.+?);/)&&cookie.match(/pt_pin=(.+?);/)[1]);
			$.index=(_0x30b146+1);
			$.isLogin=true;
			$.nickName='';
			console.log('\n******开始【京东账号'+$.index+'】'+$.nickName||$.UserName+'*********\n');
			if(!$.isLogin){
				$.msg($.name,'【提示】cookie已失效','京东账号'+$.index+' '+$.nickName||$.UserName+'\n请重新登录获取\nhttps://bean.m.jd.com/',{'open-url':'https://bean.m.jd.com/'});
				if($.isNode()){
					await notify.sendNotify($.name+'cookie已失效 - '+$.UserName,'京东账号'+$.index+' '+$.UserName+'\n请重新登录获取cookie');
				}
				continue;
			}
			await getUA();
			await jrzd();
			if(!$.toactivity||$.maxTeam){
				break;
			}
		}
	}
	messageTitle+=('队伍人数 '+$.memberCount+'\n');
	await showMsg();
})().catch(_0xb97128=>{
	$.log('',' '+$.name+', 失败! 原因: '+_0xb97128+'!','');
}).finally(()=>{
	$.done();
});
async function jrzd(){
	$.sid='',$.userId='',$.Token='',$.Pin='';
	$.saveTeam=false;
	await getCk();
	await getshopInfo();
	await $.wait(1000);
	if($.sid&&$.userId){
		await getToken();
		if($.Token)await getPin();
		if(!$.Pin){
			console.log('获取[Pin]失败！');
			return;
		}
		await getUserInfo();
		await $.wait(500);
		await getOpenCardInfo();
		await getTeam();
		await $.wait(1000);
		if($.maxTeam){
			console.log('队伍已满员');
			return;
		}
	}else{
		console.log('【京东账号'+$.index+'】 未能获取活动信息');
		message+=('【京东账号'+$.index+'】 未能获取活动信息\n');
	}
}
async function getUA(){
	$.UA='jdapp;iPhone;10.1.4;13.1.2;'+randomString(40)+';network/wifi;model/iPhone8,1;addressid/2308460611;appBuild/167814;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1';
}
function randomString(_0x8f4cd){
	_0x8f4cd=(_0x8f4cd||32);
	let _0x126a7a='abcdef0123456789',_0x1f289b=_0x126a7a.length,_0x1ab33f='';
	for(i=0;i<_0x8f4cd;i++)_0x1ab33f+=_0x126a7a.charAt(Math.floor(Math.random()*_0x1f289b));
	return _0x1ab33f;
}
function showMsg(){
	return new Promise(_0x1bad0e=>{
		let _0x523304=openAppUrl();
		console.log('运行完毕');
		console.log(_0x523304);
		$.msg($.name,''+$.shopName,''+messageTitle+message+' \n点击弹窗跳转到京东APP活动页面',{'open-url':_0x523304});
		_0x1bad0e();
	});
}
function openAppUrl(){
	let _0x226ab9=(activityUrl+'/wxTeam/activity?activityId='+activityId);
	let _0x11a419=_0x226ab9;
	if(_0x226ab9.substr(0,5)==='https'){
		let _0x2bf467={'category':'jump','des':'getCoupon','url':_0x226ab9.substr(8)};
		_0x11a419=('openApp.jdMobile://virtual?params='+encodeURIComponent(JSON.stringify(_0x2bf467)));
	}else if(_0x226ab9.substr(0,4)==='http'){
		let _0x2de1bf={'category':'jump','des':'getCoupon','url':_0x226ab9.substr(7)};
		_0x11a419=('openApp.jdMobile://virtual?params='+encodeURIComponent(JSON.stringify(_0x2de1bf)));
	}
	return _0x11a419;
}
function getCk(){
	return new Promise(_0x22523b=>{
		let _0x5c64f9={'url':'https://lzkjdz-isv.isvjcloud.com/wxTeam/activity?activityId='+$.activityId+'&sid=3d5f94d1c9eb8ba773902612d12c608w&un_area=4_133_58530_0','headers':{'Accept':'application/json, text/plain, */*','Accept-Encoding':'gzip, deflate, br','Accept-Language':'zh-cn','Connection':'keep-alive','Content-Type':'application/x-www-form-urlencoded','Cookie':cookie,'Referer':'https://lzkjdz-isv.isvjcloud.com/wxTeam/activity?activityId='+$.activityId+'&sid=3d5f94d1c9eb8ba773902612d12c608w&un_area=4_133_58530_0','User-Agent':$.UA},'timeout':30000};
		$.get(_0x5c64f9,async(_0xca89cb,_0x305bca,_0x3d221f)=>{
			try{
				if(_0xca89cb){
					console.log(''+$.toStr(_0xca89cb));
					console.log($.name+' cookie API请求失败，请检查网路重试');
				}else{
					setActivityCookie(_0x305bca);
				}
			}catch(_0x109b93){
				$.logErr(_0x109b93,_0x305bca);
			}
			finally{
				_0x22523b();
			}
		});
	});
}
function getToken(){
	return new Promise(_0x34d91b=>{
		let _0x244200='adid=7B411CD9-D62C-425B-B083-9AFC49B94228&area=16_1332_42932_43102&body=%7B%22url%22%3A%22https%3A%5C/%5C/cjhydz-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&build=167541&client=apple&clientVersion=9.4.0&d_brand=apple&d_model=iPhone8%2C1&eid=eidId10b812191seBCFGmtbeTX2vXF3lbgDAVwQhSA8wKqj6OA9J4foPQm3UzRwrrLdO23B3E2wCUY/bODH01VnxiEnAUvoM6SiEnmP3IPqRuO%2By/%2BZo&isBackground=N&joycious=48&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&openudid=2f7578cb634065f9beae94d013f172e197d62283&osVersion=13.1.2&partner=apple&rfs=0000&scope=11&screen=750%2A1334&sign=60bde51b4b7f7ff6e1bc1f473ecf3d41&st=1613720203903&sv=110&uts=0f31TVRjBStG9NoZJdXLGd939Wv4AlsWNAeL1nxafUsZqiV4NLsVElz6AjC4L7tsnZ1loeT2A8Z5/KfI/YoJAUfJzTd8kCedfnLG522ydI0p40oi8hT2p2sNZiIIRYCfjIr7IAL%2BFkLsrWdSiPZP5QLptc8Cy4Od6/cdYidClR0NwPMd58K5J9narz78y9ocGe8uTfyBIoA9aCd/X3Muxw%3D%3D&uuid=hjudwgohxzVu96krv/T6Hg%3D%3D&wifiBssid=9cf90c586c4468e00678545b16176ed2';
		$.post(taskUrl('?functionId=isvObfuscator',_0x244200),async(_0x3deba2,_0x197e11,_0x547242)=>{
			try{
				if(_0x3deba2){
					console.log(''+JSON.stringify(_0x3deba2));
					console.log($.name+' 2 API请求失败，请检查网路重试');
				}else{
					if(safeGet(_0x547242)){
						_0x547242=JSON.parse(_0x547242);
						if((_0x547242.code==0)&&_0x547242.token){
							$.Token=_0x547242.token;
						}else{
							console.log('异常2：'+JSON.stringify(_0x547242));
						}
					}
				}
			}catch(_0x3f0d4f){
				$.logErr(_0x3f0d4f,_0x197e11);
			}
			finally{
				_0x34d91b();
			}
		});
	});
}
function getPin(){
	return new Promise(_0x3be10c=>{
		let _0xd0c8df=('userId='+$.userId+'&token='+$.Token+'&fromType=APP');
		$.post(taskPostUrl('/customer/getMyPing',_0xd0c8df),async(_0x2b431c,_0x5f4146,_0xbaf9fa)=>{
			try{
				if(_0x5f4146.status==200){
					setActivityCookie(_0x5f4146);
				}
				if(_0x2b431c){
					console.log(''+JSON.stringify(_0x2b431c));
					console.log($.name+' 3 API请求失败，请检查网路重试');
				}else{
					if(safeGet(_0xbaf9fa)){
						_0xbaf9fa=JSON.parse(_0xbaf9fa);
						if(_0xbaf9fa.result&&_0xbaf9fa.data){
							$.Pin=_0xbaf9fa.data.secretPin;
						}else{
							console.log('异常3：'+JSON.stringify(_0xbaf9fa));
						}
					}
				}
			}catch(_0x118ca3){
				$.logErr(_0x118ca3,_0x5f4146);
			}
			finally{
				_0x3be10c();
			}
		});
	});
}
function getshopInfo(){
	return new Promise(_0x3441af=>{
		$.post(taskPostUrl('/wxTeam/shopInfo','activityId='+activityId),async(_0x1a667c,_0x443c58,_0x6a950a)=>{
			try{
				if(_0x1a667c){
					console.log(''+JSON.stringify(_0x1a667c));
					console.log($.name+' 1 API请求失败，请检查网路重试');
				}else{
					if(_0x6a950a&&safeGet(_0x6a950a)){
						_0x6a950a=JSON.parse(_0x6a950a);
						if(_0x6a950a.data){
							$.sid=_0x6a950a.data.sid;
							$.userId=_0x6a950a.data.userId;
							$.shopName=_0x6a950a.data.shopName;
						}else{
							console.log('异常1：'+JSON.stringify(_0x6a950a));
						}
					}
				}
			}catch(_0x529dd0){
				$.logErr(_0x529dd0,_0x443c58);
			}
			finally{
				_0x3441af();
			}
		});
	});
}
function getOpenCardInfo(){
	return new Promise(_0xa36c0b=>{
		let _0x40d251='venderId='+$.userId+'&activityId='+activityId+'&pin='+encodeURIComponent($.Pin);
		$.post(taskPostUrl('/wxCommonInfo/getActMemberInfo',_0x40d251),async(_0x193fe1,_0x4226cc,_0x36e4f2)=>{
			try{
				if(_0x193fe1){
					console.log(''+JSON.stringify(_0x193fe1));
					console.log($.name+'API请求失败，请检查网路重试');
				}else{
					if(safeGet(_0x36e4f2)){
						_0x36e4f2=JSON.parse(_0x36e4f2);
						let _0x3f4155=_0x36e4f2.data.openCard||false;
						if(_0x36e4f2.result&&_0x36e4f2.data){
							if(_0x36e4f2.data.openCardUrl){
								$.channel=_0x36e4f2.data.openCardUrl.match(/channel=(\d+)/)[1];
								$.joinVenderId=_0x36e4f2.data.openCardUrl.match(/venderId=(\d+)/)[1];
							}else{}
						}
					}
				}
			}catch(_0x33206f){
				$.logErr(_0x33206f,_0x4226cc);
			}
			finally{
				_0xa36c0b();
			}
		});
	});
}
async function joinShop(){
	if(!$.joinVenderId)return;
	return new Promise(async _0x102c4d=>{
		$.errorJoinShop='活动太火爆，请稍后再试';
		let _0x4822a6='';
		if($.shopactivityId)_0x4822a6=',"activityId":'+$.shopactivityId;
		let _0x404350='{"venderId":"'+$.joinVenderId+'","shopId":"'+$.joinVenderId+'","bindByVerifyCodeFlag":1,"registerExtend":{},"writeChildFlag":0'+_0x4822a6+',"channel":406}';
		// let _0x2364a9=await geth5st();
		let _0x2364a9='20220614090341726%3B0284392757226553%3Bef79a%3Btk02wcbf51cf018njrSeb2PERKoZxKtLTPV0g0paq33tkJwK4bJurufnMpBuFkn4RVxkfBmwRhN8VRd%2BB2q%2BrzaXvMR7%3B775673aed4a823ebbe0003522fffd49e329ba7842f8ad82e5099117cd00d871e%3B3.0%3B1655168621726'
		const _0x5e197b={'url':'https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=bindWithVender&body='+_0x404350+'&clientVersion=9.2.0&client=H5&uuid=88888&h5st='+_0x2364a9,'headers':{'accept':'*/*','accept-encoding':'gzip, deflate, br','accept-language':'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7','cookie':cookie,'origin':'https://shopmember.m.jd.com/','user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36'}};
		$.get(_0x5e197b,async(_0x58f880,_0x2d39bf,_0x45c728)=>{
			try{
				_0x45c728=_0x45c728&&_0x45c728.match(/jsonp_.*?\((.*?)\);/)&&_0x45c728.match(/jsonp_.*?\((.*?)\);/)[1]||_0x45c728;
				let _0x170fd8=$.toObj(_0x45c728,_0x45c728);
				if(_0x170fd8&&(typeof _0x170fd8=='object')){
					if(_0x170fd8&&(_0x170fd8.success===true)){
						console.log(_0x170fd8.message);
						$.errorJoinShop=_0x170fd8.message;
						if(_0x170fd8.result&&_0x170fd8.result.giftInfo){
							for(let _0x3d079e of _0x170fd8.result.giftInfo.giftList){
								console.log('入会获得:'+_0x3d079e.discountString+_0x3d079e.prizeName+_0x3d079e.secondLineDesc);
							}
						}
					}else if(_0x170fd8&&(typeof _0x170fd8=='object')&&_0x170fd8.message){
						$.errorJoinShop=_0x170fd8.message;
						console.log(''+(_0x170fd8.message||''));
					}else{
						console.log(_0x45c728);
					}
				}else{
					console.log(_0x45c728);
				}
			}catch(_0x572531){
				$.logErr(_0x572531,_0x2d39bf);
			}
			finally{
				_0x102c4d();
			}
		});
	});
}
async function getshopactivityId(){
	return new Promise(async _0x4641e1=>{
		let _0x3fa28d='{"venderId":"'+$.joinVenderId+'","channel":406,"payUpShop":true}';
		let _0x10f0cc=await geth5st();
		const _0xe776be={'url':'https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=getShopOpenCardInfo&body='+_0x3fa28d+'&clientVersion=9.2.0&client=H5&uuid=88888&h5st='+_0x10f0cc,'headers':{'accept':'*/*','accept-encoding':'gzip, deflate, br','accept-language':'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7','cookie':cookie,'origin':'https://shopmember.m.jd.com/','user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36'}};
		$.get(_0xe776be,async(_0x3d4060,_0x145b85,_0x3f32ed)=>{
			try{
				_0x3f32ed=_0x3f32ed&&_0x3f32ed.match(/jsonp_.*?\((.*?)\);/)&&_0x3f32ed.match(/jsonp_.*?\((.*?)\);/)[1]||_0x3f32ed;
				let _0x2e4cfd=$.toObj(_0x3f32ed,_0x3f32ed);
				if(_0x2e4cfd&&(typeof _0x2e4cfd=='object')){
					if(_0x2e4cfd&&(_0x2e4cfd.success==true)){
						console.log('入会:'+(_0x2e4cfd.result.shopMemberCardInfo.venderCardName||''));
						$.shopactivityId=_0x2e4cfd.result.interestsRuleList&&_0x2e4cfd.result.interestsRuleList[0]&&_0x2e4cfd.result.interestsRuleList[0].interestsInfo&&_0x2e4cfd.result.interestsRuleList[0].interestsInfo.activityId||'';
					}
				}else{
					console.log(_0x3f32ed);
				}
			}catch(_0xfd6292){
				$.logErr(_0xfd6292,_0x145b85);
			}
			finally{
				_0x4641e1();
			}
		});
	});
}
function getUserInfo(){
	return new Promise(_0xe8dd5=>{
		let _0x50e41f=('pin='+encodeURIComponent($.Pin));
		$.post(taskPostUrl('/wxActionCommon/getUserInfo',_0x50e41f),async(_0x362834,_0x38d225,_0x5c93c6)=>{
			try{
				if(_0x362834){
					console.log(''+JSON.stringify(_0x362834));
					console.log($.name+' 6-1 API请求失败，请检查网路重试');
				}else{
					if(safeGet(_0x5c93c6)){
						_0x5c93c6=JSON.parse(_0x5c93c6);
						if(_0x5c93c6.result&&_0x5c93c6.data){
							$.attrTouXiang=_0x5c93c6.data.yunMidImageUrl?_0x5c93c6.data.yunMidImageUrl:'https://img10.360buyimg.com/imgzone/jfs/t1/21383/2/6633/3879/5c5138d8E0967ccf2/91da57c5e2166005.jpg';
						}else{
							console.log('异常6-2：'+JSON.stringify(_0x5c93c6));
						}
					}
				}
			}catch(_0x4db5f2){
				$.logErr(_0x4db5f2,_0x38d225);
			}
			finally{
				_0xe8dd5();
			}
		});
	});
}
function getTeam(){
	return new Promise(_0x5a79a3=>{
		let _0x596bac=('activityId='+activityId+'&pin='+encodeURIComponent($.Pin));
		if($.signUuid)_0x596bac+=('&signUuid='+$.signUuid);
		$.post(taskPostUrl('/wxTeam/activityContent',_0x596bac),async(_0x77e9b5,_0x3a8bb9,_0x25a475)=>{
			try{
				if(_0x77e9b5){
					console.log(''+JSON.stringify(_0x77e9b5));
					console.log($.name+' 5 API请求失败，请检查网路重试');
				}else{
					if(safeGet(_0x25a475)){
						_0x25a475=JSON.parse(_0x25a475);
						if(_0x25a475.result&&_0x25a475.data){
							if(new Date(_0x25a475.data.active.endTimeStr.replace(/-/g,'/')).getTime()<new Date().getTime()){
								$.toactivity=false;
								console.log('活动结束');
								messageTitle+='活动结束\n';
								_0x5a79a3();
							}else{
								if(!_0x25a475.data.canCreate&&(_0x25a475.data.list==null))message+='人数已满\n';
								if(_0x25a475.data.share){
									$.memberCount=(parseInt(_0x25a475.data.share.memberCount,10)+1);
								}else{
									$.memberCount=0;
								}if($.index==1){
									$.saveTeam=true;
									$.teamNum=_0x25a475.data.active.actRule.match(/最多可以组建(\d+)个战队/);
									if($.teamNum){
										$.teamNum=$.teamNum[1];
										messageTitle+=('最多可以组建'+$.teamNum+'个战队');
									}
								}if($.signUuid){
									$.log('加入队伍 id: '+$.signUuid);
									await joinTeam();
								}if($.saveTeam){
									if(_0x25a475.data.canCreate){
										await saveTeam();
									}else{
										$.signUuid=_0x25a475.data.signUuid;
										messageTitle+=('队伍id: '+$.signUuid+'\n');
										message+=('【京东账号'+$.index+'】 创建队伍id: '+$.signUuid);
										$.log('队伍id: '+$.signUuid);
										$.wait(1000);
										$.log('加入队伍 id: '+$.signUuid);
										await joinTeam();
									}
								}
							}
						}else{
							console.log('异常5：'+JSON.stringify(_0x25a475));
						}
					}
				}
			}catch(_0x3ba6a2){
				$.logErr(_0x3ba6a2,_0x3a8bb9);
			}
			finally{
				_0x5a79a3(_0x5a79a3);
			}
		});
	});
}
function saveTeam(_0x4b1d25=0){
	return new Promise(_0x24680f=>{
		let _0x1ba015=encodeURIComponent($.Pin);
		if(_0x4b1d25==1)_0x1ba015=encodeURIComponent($.Pin);
		let _0x3e4592=('activityId='+activityId+'&pin='+_0x1ba015+'&pinImg='+encodeURIComponent($.attrTouXiang));
		$.post(taskPostUrl('/wxTeam/saveCaptain',_0x3e4592),async(_0xcaf164,_0x448c16,_0x4f9b45)=>{
			try{
				if(_0xcaf164){
					console.log(''+JSON.stringify(_0xcaf164));
					console.log($.name+' 6 API请求失败，请检查网路重试');
				}else{
					if(safeGet(_0x4f9b45)){
						_0x4f9b45=JSON.parse(_0x4f9b45);
						if(_0x4f9b45.result&&_0x4f9b45.data){
							message+=('【京东账号'+$.index+'】 创建队伍id: '+_0x4f9b45.data.signUuid+' ');
							console.log('创建队伍成功 id: '+_0x4f9b45.data.signUuid);
							$.signUuid=_0x4f9b45.data.signUuid;
							messageTitle+=('队伍id: '+$.signUuid+' ');
						}else{
							console.log('异常6：'+JSON.stringify(_0x4f9b45));
							if((_0x4f9b45.errorMessage.indexOf('店铺会员')>-1)&&(_0x4b1d25!=3)){
								$.errorJoinShop='';
								await joinShop();
								if($.errorJoinShop.indexOf('活动太火爆，请稍后再试')>-1){
									console.log('第1次 重新开卡');
									await $.wait(1000);
									await joinShop();
								}
								await saveTeam(3);
							}else if((_0x4f9b45.errorMessage.indexOf('奖品与您擦肩而过')>-1)&&(_0x4b1d25==0)){
								await saveTeam(1);
							}
						}
					}
				}
			}catch(_0x450cc8){
				$.logErr(_0x450cc8,_0x448c16);
			}
			finally{
				_0x24680f();
			}
		});
	});
}
function joinTeam(_0x3cbe0a=0){
	return new Promise(_0x4b0d85=>{
		let _0x39784c=encodeURIComponent($.Pin);
		if(_0x3cbe0a==1)_0x39784c=encodeURIComponent($.Pin);
		let _0xfbce9b=('activityId='+activityId+'&signUuid='+$.signUuid+'&pin='+_0x39784c+'&pinImg='+encodeURIComponent($.attrTouXiang));
		$.post(taskPostUrl('/wxTeam/saveMember',_0xfbce9b),async(_0xfd5917,_0x36ae7b,_0xc3ee9c)=>{
			try{
				if(_0xfd5917){
					console.log(''+JSON.stringify(_0xfd5917));
					console.log($.name+' 7 API请求失败，请检查网路重试');
				}else{
					if(safeGet(_0xc3ee9c)){
						_0xc3ee9c=JSON.parse(_0xc3ee9c);
						if(_0xc3ee9c.result&&_0xc3ee9c.data){
							message+=('【京东账号'+$.index+'】 加入队伍\n');
							$.log('加入队伍成功');
						}else{
							if((_0xc3ee9c.errorMessage.indexOf('店铺会员')>-1)&&(_0x3cbe0a!=3)){
								$.errorJoinShop='';
								await joinShop();
								if($.errorJoinShop.indexOf('活动太火爆，请稍后再试')>-1){
									console.log('第1次 重新开卡');
									await $.wait(1000);
									await joinShop();
								}
								await joinTeam(3);
							}else if(_0xc3ee9c.errorMessage.indexOf('队伍已经满员')>-1){
								$.maxTeam=true;
							}else if((_0xc3ee9c.errorMessage.indexOf('奖品与您擦肩而过')>-1)&&(_0x3cbe0a==0)){
								await joinTeam(1);
							}else{
								console.log('异常7：'+JSON.stringify(_0xc3ee9c));
								message+=('【京东账号'+$.index+'】 '+_0xc3ee9c.errorMessage+'\n');
							}
						}
					}
				}
			}catch(_0x310af4){
				$.logErr(_0x310af4,_0x36ae7b);
			}
			finally{
				_0x4b0d85();
			}
		});
	});
}
function taskPostUrl(_0x355f1c,_0x47d702){
	return{'url':(''+activityUrl+_0x355f1c),'body':_0x47d702,'headers':{'Accept':'application/json','Accept-Encoding':'gzip, deflate, br','Accept-Language':'zh-cn','Connection':'keep-alive','Host':'lzkjdz-isv.isvjcloud.com','Origin':'https://lzkjdz-isv.isvjcloud.com','Content-Type':'application/x-www-form-urlencoded','Referer':(activityUrl+'/wxTeam/activity?activityId='+activityId),'Cookie':(cookie+activityCookie+';IsvToken='+$.Token+';AUTH_C_USER='+$.AUTH_C_USER),'User-Agent':$.UA}};
}
function taskUrl(_0xfb045d,_0x452584){
	return{'url':('https://api.m.jd.com/client.action'+_0xfb045d),'body':_0x452584,'headers':{'Accept':'*/*','Accept-Encoding':'gzip, deflate, br','Accept-Language':'zh-cn','Connection':'keep-alive','Content-Type':'application/x-www-form-urlencoded','Host':'api.m.jd.com','Cookie':cookie,'User-Agent':$.UA}};
}
function TotalBean(){
	return new Promise(async _0x43272c=>{
		const _0x643f04={'url':'https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2','headers':{'Accept':'application/json,text/plain, */*','Content-Type':'application/x-www-form-urlencoded','Accept-Encoding':'gzip, deflate, br','Accept-Language':'zh-cn','Connection':'keep-alive','Cookie':cookie,'Referer':'https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2','User-Agent':$.UA}};
		$.post(_0x643f04,(_0x353a26,_0x4f63fb,_0x26add6)=>{
			try{
				if(_0x353a26){
					console.log(''+JSON.stringify(_0x353a26));
					console.log($.name+' API请求失败，请检查网路重试');
				}else{
					if(_0x26add6){
						_0x26add6=JSON.parse(_0x26add6);
						if(_0x26add6.retcode===13){
							$.isLogin=false;
							return;
						}
					}else{
						console.log('京东服务器返回空数据');
					}
				}
			}catch(_0x1e247b){
				$.logErr(_0x1e247b,_0x4f63fb);
			}
			finally{
				_0x43272c();
			}
		});
	});
}
function safeGet(_0x3b3cb5){
	try{
		if(typeof JSON.parse(_0x3b3cb5)=='object'){
			return true;
		}
	}catch(_0x255633){
		console.log(_0x255633);
		console.log('京东服务器访问数据为空，请检查自身设备网络情况');
		return false;
	}
}
function jsonParse(_0x120b00){
	if(typeof strv=='string'){
		try{
			return JSON.parse(_0x120b00);
		}catch(_0x110bb7){
			console.log(_0x110bb7);
			$.msg($.name,'','不要在BoxJS手动复制粘贴修改cookie');
			return[];
		}
	}
}
function GetCookie(){
	if($request.url.indexOf('/wxTeam/shopInfo')>-1){
		if($request.body){
			let _0x5bdbe2=$request.body.match(/activityId=([a-zA-Z0-9._-]+)/);
			if(_0x5bdbe2){
				let _0x2f3acd=$request.url.split('/');
				console.log('activityId: '+_0x5bdbe2[1]);
				console.log('activityUrl: '+_0x2f3acd[0]+'//'+_0x2f3acd[2]);
				$.setdata(_0x5bdbe2[1],'jd_zdjr_activityId');
				$.setdata(_0x2f3acd[0]+'//'+_0x2f3acd[2],'jd_zdjr_activityId');
				$.msg($.name,'获取activityId: 成功','activityId:'+_0x5bdbe2[1]+'\nactivityUrl:'+_0x2f3acd[0]+'//'+_0x2f3acd[2]);
			}else{
				$.msg($.name,'找不到activityId','');
			}
		}
	}
};
function setActivityCookie(_0x5b6b5a){
	if(_0x5b6b5a.headers['set-cookie']){
		cookie=originCookie+';';
		for(let _0x144e29 of _0x5b6b5a.headers['set-cookie']){
			lz_cookie[_0x144e29.split(';')[0].substr(0,_0x144e29.split(';')[0].indexOf('='))]=_0x144e29.split(';')[0].substr(_0x144e29.split(';')[0].indexOf('=')+1);
		}
		for(const _0x23671c of Object.keys(lz_cookie)){
			cookie+=(_0x23671c+'='+lz_cookie[_0x23671c]+';');
		}
		activityCookie=cookie;
	}
}

// prettier-ignore
function Env(t,e){
	"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);
	class s{
		constructor(t){
			this.env=t
		}send(t,e="GET"){
			t="string"==typeof t?{url:t}:t;
			let s=this.get;
			return"POST"===e&&(s=this.post),new Promise((e,i)=>{
				s.call(this,t,(t,s,r)=>{t?i(t):e(s)})
			})
		}get(t){
			return this.send.call(this.env,t)
		}post(t){
			return this.send.call(this.env,t,"POST")
		}
	}return new class{
		constructor(t,e){
			this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)
		}isNode(){
			return"undefined"!=typeof module&&!!module.exports
		}isQuanX(){
			return"undefined"!=typeof $task
		}isSurge(){
			return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon
		}isLoon(){
			return"undefined"!=typeof $loon
		}toObj(t,e=null){
			try{
				return JSON.parse(t)
			}catch{
				return e
			}
		}toStr(t,e=null){
			try{
				return JSON.stringify(t)
			}catch{
				return e
			}
		}getjson(t,e){
			let s=e;
			const i=this.getdata(t);
			if(i)try{
				s=JSON.parse(this.getdata(t))
			}catch{}return s
		}setjson(t,e){
			try{
				return this.setdata(JSON.stringify(t),e)
			}catch{
				return!1
			}
		}getScript(t){
			return new Promise(e=>{
				this.get({url:t},(t,s,i)=>e(i))
			})
		}runScript(t,e){
			return new Promise(s=>{
				let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");
				i=i?i.replace(/\n/g,"").trim():i;
				let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
				r=r?1*r:20,r=e&&e.timeout?e.timeout:r;
				const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};
				this.post(n,(t,e,i)=>s(i))
			}).catch(t=>this.logErr(t))
		}loaddata(){
			if(!this.isNode())return{};
			{
				this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");
				const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);
				if(!s&&!i)return{};
				{
					const i=s?t:e;
					try{
						return JSON.parse(this.fs.readFileSync(i))
					}catch(t){
						return{}
					}
				}
			}
		}writedata(){
			if(this.isNode()){
				this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");
				const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);
				s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)
			}
		}lodash_get(t,e,s){
			const i=e.replace(/\[(\d+)\]/g,".$1").split(".");
			let r=t;
			for(const t of i)if(r=Object(r)[t],void 0===r)return s;
			return r
		}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){
			let e=this.getval(t);
			if(/^@/.test(t)){
				const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";
				if(r)try{
					const t=JSON.parse(r);
					e=t?this.lodash_get(t,i,""):e
				}catch(t){
					e=""
				}
			}return e
		}setdata(t,e){
			let s=!1;
			if(/^@/.test(e)){
				const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";
				try{
					const e=JSON.parse(h);
					this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)
				}catch(e){
					const o={};
					this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)
				}
			}else s=this.setval(t,e);
			return s
		}getval(t){
			return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null
		}setval(t,e){
			return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null
		}initGotEnv(t){
			this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))
		}get(t,e=(()=>{})){
			t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{
				!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)
			})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{
				const{statusCode:s,statusCode:i,headers:r,body:o}=t;
				e(null,{status:s,statusCode:i,headers:r,body:o},o)
			},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{
				try{
					if(t.headers["set-cookie"]){
						const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
						s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar
					}
				}catch(t){
					this.logErr(t)
				}
			}).then(t=>{
				const{statusCode:s,statusCode:i,headers:r,body:o}=t;
				e(null,{status:s,statusCode:i,headers:r,body:o},o)
			},t=>{
				const{message:s,response:i}=t;
				e(s,i,i&&i.body)
			}))
		}post(t,e=(()=>{})){
			if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{
				!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)
			});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{
				const{statusCode:s,statusCode:i,headers:r,body:o}=t;
				e(null,{status:s,statusCode:i,headers:r,body:o},o)
			},t=>e(t));else if(this.isNode()){
				this.initGotEnv(t);
				const{
					url:s,...i
				}=t;
				this.got.post(s,i).then(t=>{
					const{statusCode:s,statusCode:i,headers:r,body:o}=t;
					e(null,{status:s,statusCode:i,headers:r,body:o},o)
				},t=>{
					const{message:s,response:i}=t;
					e(s,i,i&&i.body)
				})
			}
		}time(t,e=null){
			const s=e?new Date(e):new Date;
			let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};
			/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));
			for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));
			return t
		}msg(e=t,s="",i="",r){
			const o=t=>{
				if(!t)return t;
				if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}
				:this.isSurge()?{url:t}:void 0;
				if("object"==typeof t){
					if(this.isLoon()){
						let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];
						return{openUrl:e,mediaUrl:s}
					}
					if(this.isQuanX()){
						let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;
						return{"open-url":e,"media-url":s}
					}if(this.isSurge()){
						let e=t.url||t.openUrl||t["open-url"];
						return{url:e}
					}
				}
			};
			if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){
				let t=["","==============📣系统通知📣=============="];
				t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)
			}
		}log(...t){
			t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))
		}logErr(t,e){
			const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();
			s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)
		}wait(t){
			return new Promise(e=>setTimeout(e,t))
		}done(t={}){
			const e=(new Date).getTime(),s=(e-this.startTime)/1e3;
			this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)
		}
	}(t,e)
};