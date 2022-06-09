/*
 粉丝互动
 cron 10 1 * * * https://raw.githubusercontent.com/star261/jd/main/scripts/jd_fan.js
 蚊子腿活动，不定时更新
 环境变量：RUHUI,是否自动入会，开卡算法已失效，默认不开卡了
 环境变量：RUNCK,执行多少CK，默认全执行，设置RUNCK=10，则脚本只会运行前10个CK
* */
const $ = new Env('粉丝互动-加密');
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const RUHUI = '888'
const RUNCK = $.isNode() ? (process.env.RUNCK ? process.env.RUNCK : `9999`):`9999`;
let cookiesArr = [],message = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    });
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
    cookiesArr = [
        $.getdata("CookieJD"),
        $.getdata("CookieJD2"),
        ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
let activityList = [
    {'id':'cebd38c28cf0468c8082082eebde4c32','endTime':1656626274000},//
		{'id':'c88ffa4a17b04cc994a6e66f161471','endTime':1656626274000},//
    {'id':'4f49c21967e24e62aa60efc28b015c82','endTime':1656626274000},//
		
];
!(async()=>{
	activityList=getRandomArrayElements(activityList,activityList.length);
	$.helpFalg=true;
	for(let _0x2e674b=0;_0x2e674b<activityList.length;_0x2e674b++){
		let _0x38a02d=activityList[_0x2e674b].id;
		let _0x58a1ac=Date.now();
		if(_0x58a1ac<activityList[_0x2e674b].endTime){
			let _0x3d2098='https://lzkjdz-isv.isvjcloud.com/wxFansInterActionActivity/activity/'+_0x38a02d+'?activityId='+_0x38a02d;
			console.log('\n活动URL：'+_0x3d2098);
			$.thisActivityUrl=_0x3d2098;
			$.host='lzkjdz-isv.isvjcloud.com';
			await main($);
			await $.wait(3000);
		}else{
			console.log('\n活动ID：'+_0x38a02d+',已过期');
		}
	}
})().catch(_0xce13bb=>{
	$.log('','❌ '+$.name+', 失败! 原因: '+_0xce13bb+'!','');
}).finally(()=>{
	$.done();
});
async function main(_0x3f7ec5){
	_0x3f7ec5.cookiesArr=cookiesArr;
	message='';
	_0x3f7ec5.activityId=getUrlData(_0x3f7ec5.thisActivityUrl,'activityId');
	_0x3f7ec5.runFlag=true;
	if(_0x3f7ec5.helpFalg){
		doInfo();
	}for(let _0x42703b=0;_0x42703b<_0x3f7ec5.cookiesArr.length&&(_0x42703b<RUNCK)&&_0x3f7ec5.activityId&&_0x3f7ec5.runFlag;_0x42703b++){
		_0x3f7ec5.cookie=_0x3f7ec5.cookiesArr[_0x42703b];
		_0x3f7ec5.UserName=decodeURIComponent(_0x3f7ec5.cookie.match(/pt_pin=(.+?);/)&&_0x3f7ec5.cookie.match(/pt_pin=(.+?);/)[1]);
		_0x3f7ec5.index=(_0x42703b+1);
		console.log('\n********开始【京东账号'+_0x3f7ec5.index+'】'+_0x3f7ec5.UserName+'********\n');
		try{
			await runMain(_0x3f7ec5);
		}catch(_0x404e8e){}
		await _0x3f7ec5.wait(3000);
	}if(message){
		await notify.sendNotify('粉丝互动ID：'+_0x3f7ec5.activityId,message);
	}
}
async function doInfo(){
	$.helpFalg=false;
	for(let _0x32dca4=0;_0x32dca4<cookiesArr.length;_0x32dca4++){
		let _0x3e263a=['yu7sDDcldBJVg53L5e1xVvA+83L/sWpkWyh/yXCX0UU=','hYYKRXiBsc/D9xrdJEaeuA==','CiCGftfyPYj6+NL6vvQ+DA==','Vl30/Mq7awAL+YJtVisq+w=='];
		let _0x429f0a=getRandomArrayElements(_0x3e263a,1)[0];
		await invite3(cookiesArr[_0x32dca4],_0x429f0a);
		await invite4(cookiesArr[_0x32dca4],_0x429f0a);
		await invite(cookiesArr[_0x32dca4],_0x429f0a);
		await invite2(cookiesArr[_0x32dca4],_0x429f0a);
	}
}
async function invite(_0x8baf4c,_0x3fd6b4){
	let _0x11b30c=Date.now();
	var _0x5156ef={
		'Host':'api.m.jd.com','accept':'application/json, text/plain, */*','content-type':'application/x-www-form-urlencoded','origin':'https://invite-reward.jd.com','accept-language':'zh-cn','user-agent':$.isNode()?process.env.JS_USER_AGENT?process.env.JS_USER_AGENT:require('./JS_USER_AGENTS').USER_AGENT:$.getdata('JSUA')?$.getdata('JSUA'):'\'jdltapp;iPad;3.1.0;14.4;network/wifi;Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1','referer':'https://invite-reward.jd.com/','Cookie':_0x8baf4c
	};
	var _0xd439b2='functionId=InviteFriendApiService&body={"method":"attendInviteActivity","data":{"inviterPin":"'+encodeURIComponent(_0x3fd6b4)+'","channel":1,"token":"","frontendInitStatus":""}}&referer=-1&eid=eidIf3dd8121b7sdmiBLGdxRR46OlWyh62kFAZogTJFnYqqRkwgr63%2BdGmMlcv7EQJ5v0HBic81xHXzXLwKM6fh3i963zIa7Ym2v5ehnwo2B7uDN92Q0&aid=&client=ios&clientVersion=14.4&networkType=wifi&fp=-1&appid=market-task-h5&_t='+_0x11b30c;
	var _0x2ef366={'url':'https://api.m.jd.com/?t='+Date.now(),'headers':_0x5156ef,'body':_0xd439b2};
	$.post(_0x2ef366,(_0x2d0d4b,_0x2fae2e,_0x252f14)=>{});
}
async function invite2(_0x36e51c,_0x97b630){
	let _0x577470=Date.now();
	let _0x24b1af={
		'Host':'api.m.jd.com','accept':'application/json, text/plain, */*','content-type':'application/x-www-form-urlencoded','origin':'https://assignment.jd.com','accept-language':'zh-cn','user-agent':$.isNode()?process.env.JS_USER_AGENT?process.env.JS_USER_AGENT:require('./JS_USER_AGENTS').USER_AGENT:$.getdata('JSUA')?$.getdata('JSUA'):'\'jdltapp;iPad;3.1.0;14.4;network/wifi;Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1','referer':'https://assignment.jd.com/?inviterId='+encodeURIComponent(_0x97b630),'Cookie':_0x36e51c
	};
	let _0x33c1bd='functionId=TaskInviteService&body={"method":"participateInviteTask","data":{"channel":"1","encryptionInviterPin":"'+encodeURIComponent(_0x97b630)+'","type":1}}&appid=market-task-h5&uuid=&_t='+_0x577470;
	var _0x30d5e1={'url':'https://api.m.jd.com/','headers':_0x24b1af,'body':_0x33c1bd};
	$.post(_0x30d5e1,(_0x36a3f1,_0x5a5a0a,_0x1fe685)=>{});
}
function invite3(_0x124be8,_0x95cb67){
	let _0x243f31=+new Date();
	let _0x5e0330={'url':'https://api.m.jd.com/?t='+_0x243f31,'body':'functionId=InviteFriendChangeAssertsService&body='+JSON.stringify({'method':'attendInviteActivity','data':{'inviterPin':encodeURIComponent(_0x95cb67),'channel':1,'token':'','frontendInitStatus':''}})+'&referer=-1&eid=eidI9b2981202fsec83iRW1nTsOVzCocWda3YHPN471AY78%2FQBhYbXeWtdg%2F3TCtVTMrE1JjM8Sqt8f2TqF1Z5P%2FRPGlzA1dERP0Z5bLWdq5N5B2VbBO&aid=&client=ios&clientVersion=14.4.2&networkType=wifi&fp=-1&uuid=ab048084b47df24880613326feffdf7eee471488&osVersion=14.4.2&d_brand=iPhone&d_model=iPhone10,2&agent=-1&pageClickKey=-1&platform=3&lang=zh_CN&appid=market-task-h5&_t='+_0x243f31,'headers':{
			'Host':'api.m.jd.com','Accept':'application/json, text/plain, */*','Content-type':'application/x-www-form-urlencoded','Origin':'https://invite-reward.jd.com','Accept-Language':'zh-CN,zh-Hans;q=0.9','User-Agent':$.isNode()?process.env.JS_USER_AGENT?process.env.JS_USER_AGENT:require('./JS_USER_AGENTS').USER_AGENT:$.getdata('JSUA')?$.getdata('JSUA'):'\'jdltapp;iPad;3.1.0;14.4;network/wifi;Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1','Referer':'https://invite-reward.jd.com/','Accept-Encoding':'gzip, deflate, br','Cookie':_0x124be8
		}};
	$.post(_0x5e0330,(_0x53cb25,_0x3d3420,_0x345c93)=>{});
}
function invite4(_0x4ce7d3,_0x13691e){
	let _0x67f7ab={'url':'https://api.m.jd.com/','body':'functionId=TaskInviteService&body='+JSON.stringify({'method':'participateInviteTask','data':{'channel':'1','encryptionInviterPin':encodeURIComponent(_0x13691e),'type':1}})+'&appid=market-task-h5&uuid=&_t='+Date.now(),'headers':{
			'Host':'api.m.jd.com','Accept':'application/json, text/plain, */*','Content-Type':'application/x-www-form-urlencoded','Origin':'https://assignment.jd.com','Accept-Language':'zh-CN,zh-Hans;q=0.9','User-Agent':$.isNode()?process.env.JS_USER_AGENT?process.env.JS_USER_AGENT:require('./JS_USER_AGENTS').USER_AGENT:$.getdata('JSUA')?$.getdata('JSUA'):'\'jdltapp;iPad;3.1.0;14.4;network/wifi;Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1','Referer':'https://assignment.jd.com/','Accept-Encoding':'gzip, deflate, br','Cookie':_0x4ce7d3
		}};
	$.post(_0x67f7ab,(_0x29e91a,_0x5baf9c,_0x467f38)=>{});
}
async function runMain(_0x40ebb9){
	_0x40ebb9.UA=_0x40ebb9.isNode()?process.env.JD_USER_AGENT?process.env.JD_USER_AGENT:require('./USER_AGENTS').USER_AGENT:_0x40ebb9.getdata('JDUA')?_0x40ebb9.getdata('JDUA'):'jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',_0x40ebb9.token='';
	_0x40ebb9.LZ_TOKEN_KEY='';
	_0x40ebb9.LZ_TOKEN_VALUE='';
	_0x40ebb9.lz_jdpin_token='';
	_0x40ebb9.pin='';
	_0x40ebb9.nickname='';
	_0x40ebb9.venderId='';
	_0x40ebb9.activityType='';
	_0x40ebb9.attrTouXiang='https://img10.360buyimg.com/imgzone/jfs/t1/7020/27/13511/6142/5c5138d8E4df2e764/5a1216a3a5043c5d.png';
	console.log('活动地址：'+_0x40ebb9.thisActivityUrl);
	_0x40ebb9.body='body=%7B%22url%22%3A%22https%3A%2F%2Flzkjdz-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&clientVersion=9.2.2&build=89568&client=android&uuid=b4d0d21978ef8579305f30d52065ffedcc573c2d&st=1643784769190&sign=d6ab868c42dcc3d04c2b95b2aea9014c&sv=111';
	_0x40ebb9.token=await getToken(_0x40ebb9);
	if(!_0x40ebb9.token){
		console.log('获取token失败');
		return;
	}
	await getHtml(_0x40ebb9);
	if(!_0x40ebb9.LZ_TOKEN_KEY||!_0x40ebb9.LZ_TOKEN_VALUE){
		console.log('初始化失败1');
		return;
	}
	let _0x4c9e98=await takePostRequest(_0x40ebb9,'customer/getSimpleActInfoVo');
	_0x40ebb9.venderId=_0x4c9e98.data.venderId||'';
	_0x40ebb9.activityType=_0x4c9e98.data.activityType||'';
	console.log('venderId:'+_0x40ebb9.venderId);
	let _0xfab866=await takePostRequest(_0x40ebb9,'customer/getMyPing');
	_0x40ebb9.pin=_0xfab866.data.secretPin;
	_0x40ebb9.nickname=_0xfab866.data.nickname;
	if(!_0x40ebb9.pin){
		console.log('获取pin失败,该账号可能是黑号');
		return;
	}
	await takePostRequest(_0x40ebb9,'common/accessLogWithAD');
	let _0x851536=await takePostRequest(_0x40ebb9,'wxActionCommon/getUserInfo');
	let _0x3343be=await takePostRequest(_0x40ebb9,'wxActionCommon/getShopInfoVO');
	let _0x174237=await takePostRequest(_0x40ebb9,'wxCommonInfo/getActMemberInfo');
	if(_0x851536&&_0x851536.data&&_0x851536.data.yunMidImageUrl){
		_0x40ebb9.attrTouXiang=_0x851536.data.yunMidImageUrl;
	}
	let _0x11a7bd=await takePostRequest(_0x40ebb9,'wxFansInterActionActivity/activityContent');
	_0x40ebb9.activityData=_0x11a7bd.data||{};
	_0x40ebb9.actinfo=_0x40ebb9.activityData.actInfo;
	_0x40ebb9.actorInfo=_0x40ebb9.activityData.actorInfo;
	_0x40ebb9.nowUseValue=(Number(_0x40ebb9.actorInfo.fansLoveValue)+Number(_0x40ebb9.actorInfo.energyValue));
	if(JSON.stringify(_0x40ebb9.activityData)==='{}'){
		console.log('获取活动信息失败');
		return;
	}
	let _0x452779=new Date(_0x40ebb9.activityData.actInfo.endTime);
	let _0x3b061a=(_0x452779.getFullYear()+'-'+_0x452779.getMonth()<10?('0'+_0x452779.getMonth()+1):(_0x452779.getMonth()+1)+'-'+_0x452779.getDate()<10?'0'+_0x452779.getDate():_0x452779.getDate());
	_0x452779=new Date(_0x40ebb9.activityData.actInfo.startTime);
	let _0x29384a=(_0x452779.getFullYear()+'-'+_0x452779.getMonth()<10?'0'+(_0x452779.getMonth()+1):(_0x452779.getMonth()+1))+'-'+((_0x452779.getDate()<10)?('0'+_0x452779.getDate()):_0x452779.getDate());
	console.log(_0x40ebb9.actinfo.actName+','+_0x3343be.data.shopName+',当前积分：'+_0x40ebb9.nowUseValue+',活动时间：'+_0x29384a+'---'+_0x3b061a+'，'+_0x40ebb9.activityData.actInfo.endTime);
	let _0x14474d=[];
	let _0x3fea64=['One','Two','Three'];
	for(let _0x377d67=0;_0x377d67<_0x3fea64.length;_0x377d67++){
		let _0xc7c5a0=_0x40ebb9.activityData.actInfo['giftLevel'+_0x3fea64[_0x377d67]]||'';
		if(_0xc7c5a0){
			_0xc7c5a0=JSON.parse(_0xc7c5a0);
			_0x14474d.push(_0xc7c5a0[0].name);
		}
	}
	console.log('奖品列表：'+_0x14474d.toString());
	if(_0x40ebb9.actorInfo.prizeOneStatus&&_0x40ebb9.actorInfo.prizeTwoStatus&&_0x40ebb9.actorInfo.prizeThreeStatus){
		console.log('已完成抽奖');
		return;
	}
	if((_0x174237.data.actMemberStatus===1)&&!_0x174237.data.openCard){
		console.log('活动需要入会后才能参与');
		if(Number(RUHUI)===1){
			console.log('去入会');
			await join(_0x40ebb9);
			_0x11a7bd=await takePostRequest(_0x40ebb9,'wxFansInterActionActivity/activityContent');
			_0x40ebb9.activityData=_0x11a7bd.data||{};
			await _0x40ebb9.wait(3000);
		}else{
			console.log('不执行入会，跳出');
			return;
		}
		return;
	}else if(_0x174237.data.openCard){
		console.log('已入会');
	}
	if(_0x40ebb9.activityData.actorInfo&&!_0x40ebb9.activityData.actorInfo.follow){
		console.log('去关注店铺');
		_0x40ebb9.body='activityId='+_0x40ebb9.activityId+'&uuid='+_0x40ebb9.activityData.actorInfo.uuid;
		let _0x477c01=await takePostRequest(_0x40ebb9,'wxFansInterActionActivity/followShop',_0x40ebb9.body);
		console.log(JSON.stringify(_0x477c01));
		await _0x40ebb9.wait(3000);
	}
	_0x40ebb9.upFlag=false;
	await doTask(_0x40ebb9);
	await luckDraw(_0x40ebb9);
}
async function luckDraw(_0x13737e){
	if(_0x13737e.upFlag){
		activityData=await takePostRequest(_0x13737e,'wxFansInterActionActivity/activityContent');
		_0x13737e.activityData=activityData.data||{};
		await _0x13737e.wait(3000);
	}
	let _0x2b7411=(Number(_0x13737e.activityData.actorInfo.fansLoveValue)+Number(_0x13737e.activityData.actorInfo.energyValue));
	let _0x47ddad=['One','Two','Three'];
	let _0x58a1c5={'One':'01','Two':'02','Three':'03'};
	for(let _0x1b895e=0;_0x1b895e<_0x47ddad.length;_0x1b895e++){
		if((_0x2b7411>=_0x13737e.activityData.actConfig['prizeScore'+_0x47ddad[_0x1b895e]])&&_0x13737e.activityData.actorInfo['prize'+_0x47ddad[_0x1b895e]+'Status']===false){
			console.log('\n开始第'+Number(_0x58a1c5[_0x47ddad[_0x1b895e]])+'次抽奖');
			_0x13737e.body='activityId='+_0x13737e.activityId+'&uuid='+_0x13737e.activityData.actorInfo.uuid+'&drawType='+_0x58a1c5[_0x47ddad[_0x1b895e]];
			let _0x55478a=await takePostRequest(_0x13737e,'wxFansInterActionActivity/startDraw',_0x13737e.body);
			if(_0x55478a.result&&_0x55478a.count===0){
				let _0x5e600e=_0x55478a.data;
				if(!_0x5e600e.drawOk){
					console.log('抽奖获得:空气');
				}else{
					console.log('抽奖获得:'+_0x5e600e.name);
					message+=_0x13737e.UserName+',获得：'+(_0x5e600e.name||'未知')+'\n';
				}
			}else{
				console.log('抽奖异常');
			}
			console.log(JSON.stringify(_0x55478a));
			await _0x13737e.wait(3000);
		}
	}
}
async function doTask(_0x23c295){
	let _0x90a7c2=0;
	if(_0x23c295.activityData.task2BrowGoods){
		if(_0x23c295.activityData.task2BrowGoods.finishedCount!==_0x23c295.activityData.task2BrowGoods.upLimit){
			_0x90a7c2=(Number(_0x23c295.activityData.task2BrowGoods.upLimit)-Number(_0x23c295.activityData.task2BrowGoods.finishedCount));
			console.log('开始做浏览商品任务');
			_0x23c295.upFlag=true;
			for(let _0x57ea0c=0;_0x57ea0c<_0x23c295.activityData.task2BrowGoods.taskGoodList.length&&_0x90a7c2>0;_0x57ea0c++){
				_0x23c295.oneGoodInfo=_0x23c295.activityData.task2BrowGoods.taskGoodList[_0x57ea0c];
				if(_0x23c295.oneGoodInfo.finished===false){
					console.log('浏览:'+(_0x23c295.oneGoodInfo.skuName||''));
					_0x23c295.body='activityId='+_0x23c295.activityId+'&uuid='+_0x23c295.activityData.actorInfo.uuid+'&skuId='+_0x23c295.oneGoodInfo.skuId;
					let _0x4858b5=await takePostRequest(_0x23c295,'wxFansInterActionActivity/doBrowGoodsTask',_0x23c295.body);
					console.log(JSON.stringify(_0x4858b5));
					await _0x23c295.wait(3000);
					_0x90a7c2--;
				}
			}
		}else{
			console.log('浏览商品任务已完成');
		}
	}
	if(_0x23c295.activityData.task3AddCart){
		if(_0x23c295.activityData.task3AddCart.finishedCount!==_0x23c295.activityData.task3AddCart.upLimit){
			_0x90a7c2=(Number(_0x23c295.activityData.task3AddCart.upLimit)-Number(_0x23c295.activityData.task3AddCart.finishedCount));
			console.log('开始做加购商品任务');
			_0x23c295.upFlag=true;
			for(let _0x2527f5=0;(_0x2527f5<_0x23c295.activityData.task3AddCart.taskGoodList.length)&&(_0x90a7c2>0);_0x2527f5++){
				_0x23c295.oneGoodInfo=_0x23c295.activityData.task3AddCart.taskGoodList[_0x2527f5];
				if(_0x23c295.oneGoodInfo.finished===false){
					console.log('加购:'+(_0x23c295.oneGoodInfo.skuName||''));
					_0x23c295.body='activityId='+_0x23c295.activityId+'&uuid='+_0x23c295.activityData.actorInfo.uuid+'&skuId='+_0x23c295.oneGoodInfo.skuId;
					let _0x4858b5=await takePostRequest(_0x23c295,'wxFansInterActionActivity/doAddGoodsTask',_0x23c295.body);
					console.log(JSON.stringify(_0x4858b5));
					await _0x23c295.wait(3000);
					_0x90a7c2--;
				}
			}
		}else{
			console.log('加购商品已完成');
		}
	}
	if(_0x23c295.activityData.task6GetCoupon){
		if(_0x23c295.activityData.task6GetCoupon.finishedCount!==_0x23c295.activityData.task6GetCoupon.upLimit){
			_0x90a7c2=(Number(_0x23c295.activityData.task6GetCoupon.upLimit)-Number(_0x23c295.activityData.task6GetCoupon.finishedCount));
			console.log('开始做领取优惠券');
			_0x23c295.upFlag=true;
			for(let _0x48cbc6=0;(_0x48cbc6<_0x23c295.activityData.task6GetCoupon.taskCouponInfoList.length)&&(_0x90a7c2>0);_0x48cbc6++){
				_0x23c295.oneCouponInfo=_0x23c295.activityData.task6GetCoupon.taskCouponInfoList[_0x48cbc6];
				if(_0x23c295.oneCouponInfo.finished===false){
					_0x23c295.body='activityId='+_0x23c295.activityId+'&uuid='+_0x23c295.activityData.actorInfo.uuid+'&couponId='+_0x23c295.oneCouponInfo.couponInfo.couponId;
					let _0x4858b5=await takePostRequest(_0x23c295,'wxFansInterActionActivity/doGetCouponTask',_0x23c295.body);
					console.log(JSON.stringify(_0x4858b5));
					await _0x23c295.wait(3000);
					_0x90a7c2--;
				}
			}
		}else{
			console.log('领取优惠券已完成');
		}
	}
	_0x23c295.body='activityId='+_0x23c295.activityId+'&uuid='+_0x23c295.activityData.actorInfo.uuid;
	if(_0x23c295.activityData.task1Sign&&_0x23c295.activityData.task1Sign.finishedCount===0){
		console.log('执行每日签到');
		let _0x3b44d4=await takePostRequest(_0x23c295,'wxFansInterActionActivity/doSign',_0x23c295.body);
		console.log(JSON.stringify(_0x3b44d4));
		await _0x23c295.wait(3000);
		_0x23c295.upFlag=true;
	}else{
		console.log('已签到');
	}if(_0x23c295.activityData.task4Share){
		if(_0x23c295.activityData.task4Share.finishedCount!==_0x23c295.activityData.task4Share.upLimit){
			_0x90a7c2=Number(_0x23c295.activityData.task4Share.upLimit)-Number(_0x23c295.activityData.task4Share.finishedCount);
			console.log('开始做分享任务');
			_0x23c295.upFlag=true;
			for(let _0x107268=0;_0x107268<_0x90a7c2;_0x107268++){
				console.log('执行第'+(_0x107268+1)+'次分享');
				let _0x3b44d4=await takePostRequest(_0x23c295,'wxFansInterActionActivity/doShareTask',_0x23c295.body);
				console.log(JSON.stringify(_0x3b44d4));
				await _0x23c295.wait(3000);
			}
		}else{
			console.log('分享任务已完成');
		}
	}if(_0x23c295.activityData.task5Remind){
		if(_0x23c295.activityData.task5Remind.finishedCount!==_0x23c295.activityData.task5Remind.upLimit){
			console.log('执行设置活动提醒');
			_0x23c295.upFlag=true;
			let _0x204aab=await takePostRequest(_0x23c295,'wxFansInterActionActivity/doRemindTask',_0x23c295.body);
			console.log(JSON.stringify(_0x204aab));
			await _0x23c295.wait(3000);
		}else{
			console.log('设置活动提醒已完成');
		}
	}if(_0x23c295.activityData.task7MeetPlaceVo){
		if(_0x23c295.activityData.task7MeetPlaceVo.finishedCount!==_0x23c295.activityData.task7MeetPlaceVo.upLimit){
			console.log('执行逛会场');
			_0x23c295.upFlag=true;
			let _0x84bc88=await takePostRequest(_0x23c295,'wxFansInterActionActivity/doMeetingTask',_0x23c295.body);
			console.log(JSON.stringify(_0x84bc88));
			await _0x23c295.wait(3000);
		}else{
			console.log('逛会场已完成');
		}
	}
}
function getUrlData(_0x3c166f,_0x3dcbe9){
	if(typeof URL!=='undefined'){
		let _0xe4e3a4=new URL(_0x3c166f);
		let _0x5ddc8d=_0xe4e3a4.searchParams.get(_0x3dcbe9);
		return _0x5ddc8d?_0x5ddc8d:'';
	}else{
		const _0x114c48=_0x3c166f.match(/\?.*/)[0].substring(1);
		const _0x1baacd=_0x114c48.split('&');
		for(let _0x3113d1=0;_0x3113d1<_0x1baacd.length;_0x3113d1++){
			const _0x414733=_0x1baacd[_0x3113d1].split('=');
			if(_0x414733[0]===_0x3dcbe9){
				return _0x1baacd[_0x3113d1].substr(_0x1baacd[_0x3113d1].indexOf('=')+1);
			}
		}
		return'';
	}
}
async function getToken(_0x3c9452){
	let _0x575ad2={'url':'https://api.m.jd.com/client.action?functionId=isvObfuscator','body':_0x3c9452.body,'headers':{'Host':'api.m.jd.com','accept':'*/*','user-agent':'JD4iPhone/167490 (iPhone; iOS 14.2; Scale/3.00)','accept-language':'zh-Hans-JP;q=1, en-JP;q=0.9, zh-Hant-TW;q=0.8, ja-JP;q=0.7, en-US;q=0.6','content-type':'application/x-www-form-urlencoded','Cookie':_0x3c9452.cookie}};
	return new Promise(_0x177e3a=>{
		_0x3c9452.post(_0x575ad2,async(_0x846899,_0x5ddcd4,_0x58ed45)=>{
			try{
				if(_0x846899){
					console.log(''+JSON.stringify(_0x846899));
					console.log(_0x3c9452.name+' API请求失败，请检查网路重试');
				}else{
					_0x58ed45=JSON.parse(_0x58ed45);
				}
			}catch(_0x537dc9){
				_0x3c9452.logErr(_0x537dc9,_0x5ddcd4);
			}
			finally{
				_0x177e3a(_0x58ed45.token||'');
			}
		});
	});
}
async function getHtml(_0x4addca){
	let _0x25eb03={'url':_0x4addca.thisActivityUrl,'headers':{'Host':_0x4addca.host,'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','Cookie':'IsvToken='+_0x4addca.token+';'+_0x4addca.cookie,'User-Agent':_0x4addca.UA,'Accept-Language':'zh-cn','Accept-Encoding':'gzip, deflate, br','Connection':'keep-alive'}};
	return new Promise(_0x35175a=>{
		_0x4addca.get(_0x25eb03,(_0x53f11b,_0x24beb3,_0x50a1a1)=>{
			try{
				dealCK(_0x4addca,_0x24beb3);
			}catch(_0x182b52){
				_0x4addca.logErr(_0x182b52,_0x24beb3);
			}
			finally{
				_0x35175a(_0x50a1a1);
			}
		});
	});
}
function dealCK(_0x1ea343,_0x122b40){
	if(_0x122b40===undefined){
		return;
	}
	let _0x3d9911=_0x122b40.headers['set-cookie']||_0x122b40.headers['Set-Cookie']||'';
	if(_0x3d9911){
		let _0x2fabb2=_0x3d9911.filter(_0x942508=>_0x942508.indexOf('lz_jdpin_token')!==-1)[0];
		if(_0x2fabb2&&(_0x2fabb2.indexOf('lz_jdpin_token=')>-1)){
			_0x1ea343.lz_jdpin_token=_0x2fabb2.split(';')&&(_0x2fabb2.split(';')[0]+';')||'';
		}
		let _0x23a7e9=_0x3d9911.filter(_0x41bf1f=>_0x41bf1f.indexOf('LZ_TOKEN_KEY')!==-1)[0];
		if(_0x23a7e9&&(_0x23a7e9.indexOf('LZ_TOKEN_KEY=')>-1)){
			let _0x22583b=_0x23a7e9.split(';')&&_0x23a7e9.split(';')[0]||'';
			_0x1ea343.LZ_TOKEN_KEY=_0x22583b.replace('LZ_TOKEN_KEY=','');
		}
		let _0x381ba3=_0x3d9911.filter(_0x29a259=>_0x29a259.indexOf('LZ_TOKEN_VALUE')!==-1)[0];
		if(_0x381ba3&&_0x381ba3.indexOf('LZ_TOKEN_VALUE=')>-1){
			let _0x1f6cc4=_0x381ba3.split(';')&&_0x381ba3.split(';')[0]||'';
			_0x1ea343.LZ_TOKEN_VALUE=_0x1f6cc4.replace('LZ_TOKEN_VALUE=','');
		}
	}
}
async function takePostRequest(_0x22084a,_0x4d19d2,_0x4cee5b='activityId='+_0x22084a.activityId+'&pin='+encodeURIComponent(_0x22084a.pin)){
	let _0x3e5e9='https://'+_0x22084a.host+'/'+_0x4d19d2;
	switch(_0x4d19d2){
		case 'customer/getSimpleActInfoVo':
		case 'dz/common/getSimpleActInfoVo':
		case 'wxCommonInfo/initActInfo':
		case 'wxCollectionActivity/shopInfo':
		case 'wxCollectCard/shopInfo':
		case 'wxCollectCard/drawContent':
			_0x4cee5b='activityId='+_0x22084a.activityId;
			break;
		case 'customer/getMyPing':
			_0x4cee5b='userId='+_0x22084a.venderId+'&token='+encodeURIComponent(_0x22084a.token)+'&fromType=APP';
			break;
		case'common/accessLogWithAD':
		case 'common/accessLog':
			_0x4cee5b='venderId='+_0x22084a.venderId+'&code='+_0x22084a.activityType+'&pin='+encodeURIComponent(_0x22084a.pin)+'&activityId='+_0x22084a.activityId+'&pageUrl='+encodeURIComponent(_0x22084a.thisActivityUrl)+'&subType=app&adSource=null';
			break;
		case 'wxActionCommon/getUserInfo':
			_0x4cee5b='pin='+encodeURIComponent(_0x22084a.pin);
			break;
		case'wxCommonInfo/getActMemberInfo':
			_0x4cee5b='venderId='+_0x22084a.venderId+'&activityId='+_0x22084a.activityId+'&pin='+encodeURIComponent(_0x22084a.pin);
			break;
		case 'wxActionCommon/getShopInfoVO':
			_0x4cee5b='userId='+_0x22084a.venderId;
			break;
		case '2222':
			_0x4cee5b='222';
			break;
	}
	const _0x2993f8={'X-Requested-With':'XMLHttpRequest','Connection':'keep-alive','Accept-Encoding':'gzip, deflate, br','Content-Type':'application/x-www-form-urlencoded','Origin':'https://'+_0x22084a.host,'User-Agent':_0x22084a.UA,'Cookie':_0x22084a.cookie+' LZ_TOKEN_KEY='+_0x22084a.LZ_TOKEN_KEY+'; LZ_TOKEN_VALUE='+_0x22084a.LZ_TOKEN_VALUE+'; AUTH_C_USER='+_0x22084a.pin+'; '+_0x22084a.lz_jdpin_token,'Host':_0x22084a.host,'Referer':_0x22084a.thisActivityUrl,'Accept-Language':'zh-cn','Accept':'application/json'};
	let _0x1e0fb8={'url':_0x3e5e9,'method':'POST','headers':_0x2993f8,'body':_0x4cee5b};
	return new Promise(async _0x4afe88=>{
		_0x22084a.post(_0x1e0fb8,(_0xa06eab,_0x445f4b,_0x1ac3a4)=>{
			try{
				dealCK(_0x22084a,_0x445f4b);
				if(_0x1ac3a4){
					_0x1ac3a4=JSON.parse(_0x1ac3a4);
				}
			}catch(_0x174945){
				console.log(_0x1ac3a4);
				_0x22084a.logErr(_0x174945,_0x445f4b);
			}
			finally{
				_0x4afe88(_0x1ac3a4);
			}
		});
	});
}
async function join(_0x20b776){
	_0x20b776.shopactivityId='';
	await _0x20b776.wait(1000);
	await getshopactivityId(_0x20b776);
	let _0x2c5d06='';
	if(_0x20b776.shopactivityId)_0x2c5d06=',"activityId":'+_0x20b776.shopactivityId;
	let _0x317371={'url':'https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=bindWithVender&body={"venderId":"'+_0x20b776.venderId+'","shopId":"'+_0x20b776.venderId+'","bindByVerifyCodeFlag":1,"registerExtend":{},"writeChildFlag":0'+_0x2c5d06+',"channel":401}&client=H5&clientVersion=9.2.0&uuid=88888','headers':{'Content-Type':'text/plain; Charset=UTF-8','Origin':'https://api.m.jd.com','Host':'api.m.jd.com','accept':'*/*','User-Agent':_0x20b776.UA,'content-type':'application/x-www-form-urlencoded','Referer':'https://shopmember.m.jd.com/shopcard/?venderId='+_0x20b776.venderId+'&shopId='+_0x20b776.venderId,'Cookie':_0x20b776.cookie}};
	return new Promise(async _0x373e23=>{
		_0x20b776.get(_0x317371,async(_0x520d30,_0x1d78d3,_0x5a3bf2)=>{
			try{
				_0x5a3bf2=JSON.parse(_0x5a3bf2);
				if(_0x5a3bf2.success==true){
					_0x20b776.log(_0x5a3bf2.message);
					if(_0x5a3bf2.result&&_0x5a3bf2.result.giftInfo){
						for(let _0x57e5da of _0x5a3bf2.result.giftInfo.giftList){
							console.log('入会获得:'+_0x57e5da.discountString+_0x57e5da.prizeName+_0x57e5da.secondLineDesc);
						}
					}
				}else if(_0x5a3bf2.success==false){
					_0x20b776.log(_0x5a3bf2.message);
				}
			}catch(_0x470238){
				_0x20b776.logErr(_0x470238,_0x1d78d3);
			}
			finally{
				_0x373e23(_0x5a3bf2);
			}
		});
	});
}
async function getshopactivityId(_0x42e0bc){
	let _0x29a492={'url':'https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=getShopOpenCardInfo&body=%7B%22venderId%22%3A%22'+_0x42e0bc.venderId+'%22%2C%22channel%22%3A401%7D&client=H5&clientVersion=9.2.0&uuid=88888','headers':{'Content-Type':'text/plain; Charset=UTF-8','Origin':'https://api.m.jd.com','Host':'api.m.jd.com','accept':'*/*','User-Agent':_0x42e0bc.UA,'content-type':'application/x-www-form-urlencoded','Referer':'https://shopmember.m.jd.com/shopcard/?venderId='+_0x42e0bc.venderId+'&shopId='+_0x42e0bc.venderId,'Cookie':_0x42e0bc.cookie}};
	return new Promise(_0x49664a=>{
		_0x42e0bc.get(_0x29a492,async(_0x5b3807,_0x5d61b1,_0x313fb3)=>{
			try{
				_0x313fb3=JSON.parse(_0x313fb3);
				if(_0x313fb3.success==true){
					console.log('入会:'+(_0x313fb3.result.shopMemberCardInfo.venderCardName||''));
					_0x42e0bc.shopactivityId=_0x313fb3.result.interestsRuleList&&_0x313fb3.result.interestsRuleList[0]&&_0x313fb3.result.interestsRuleList[0].interestsInfo&&_0x313fb3.result.interestsRuleList[0].interestsInfo.activityId||'';
				}
			}catch(_0x254d1e){
				_0x42e0bc.logErr(_0x254d1e,_0x5d61b1);
			}
			finally{
				_0x49664a();
			}
		});
	});
}
function getRandomArrayElements(_0x424ad7,_0x39bfd1){
	var _0x4063b6=_0x424ad7.slice(0),_0x57a8d=_0x424ad7.length,_0x5dc753=_0x57a8d-_0x39bfd1,_0x3010ad,_0x581bb0;
	while(_0x57a8d-->_0x5dc753){
		_0x581bb0=Math.floor((_0x57a8d+1)*Math.random());
		_0x3010ad=_0x4063b6[_0x581bb0];
		_0x4063b6[_0x581bb0]=_0x4063b6[_0x57a8d];
		_0x4063b6[_0x57a8d]=_0x3010ad;
	}
	return _0x4063b6.slice(_0x5dc753);
};
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