/*
cron "28 8,21 * * *" jd_bean_change.js, tag:资产变化强化版by-ccwav
 */

//详细说明参考 https://github.com/ccwav/QLScript2.

const $ = new Env('京东资产统计');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let NowHour = new Date().getHours();

//默认开启缓存模式
let checkbeanDetailMode=1;
if ($.isNode() && process.env.BEANCHANGE_BEANDETAILMODE){
	checkbeanDetailMode=process.env.BEANCHANGE_BEANDETAILMODE*1;
}

const fs = require('fs');
const CR = require('crypto-js');
const moment = require("moment");
let matchtitle="昨日";
let yesterday="";
let TodayDate="";
let startDate="";
let endDate="";
try {
    yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    TodayDate = moment().format("YYYY-MM-DD");
    startDate = moment().startOf("month").format("YYYY_MM");
    endDate = moment().endOf("month").format("YYYY-MM-DD");
} catch (e) {
    console.log("依赖缺失，请先安装依赖moment!");
    return
}

if (!fs.existsSync("./BeanCache")) {
    fs.mkdirSync("./BeanCache");
}

let strBeanCache = "./BeanCache/" + yesterday + ".json";
let strNewBeanCache = "./BeanCache/" + TodayDate + ".json";
let TodayCache = [];
let Fileexists = fs.existsSync(strBeanCache);
let TempBeanCache = [];
if(!Fileexists){
	yesterday=TodayDate;
	strBeanCache=strNewBeanCache;
	Fileexists = fs.existsSync(strBeanCache);
	matchtitle="今日";
}
if (Fileexists) {
    console.log("检测到资产变动缓存文件"+yesterday+".json，载入...");
    TempBeanCache = fs.readFileSync(strBeanCache, 'utf-8');
    if (TempBeanCache) {
        TempBeanCache = TempBeanCache.toString();
        TempBeanCache = JSON.parse(TempBeanCache);
    }
}

Fileexists = fs.existsSync(strNewBeanCache);
if (Fileexists) {
    console.log("检测到资产变动缓存文件"+TodayDate+".json，载入...");
    TodayCache = fs.readFileSync(strNewBeanCache, 'utf-8');
    if (TodayCache) {
        TodayCache = TodayCache.toString();
        TodayCache = JSON.parse(TodayCache);
    }
}


let allMessage = '';
let allMessage2 = '';
let allReceiveMessage = '';
let allWarnMessage = '';
let ReturnMessage = '';
let ReturnMessageMonth = '';
let allMessageMonth = '';

let MessageUserGp2 = '';
let ReceiveMessageGp2 = '';
let WarnMessageGp2 = '';
let allMessageGp2 = '';
let allMessage2Gp2 = '';
let allMessageMonthGp2 = '';
let IndexGp2 = 0;

let MessageUserGp3 = '';
let ReceiveMessageGp3 = '';
let WarnMessageGp3 = '';
let allMessageGp3 = '';
let allMessage2Gp3 = '';
let allMessageMonthGp3 = '';
let IndexGp3 = 0;

let MessageUserGp4 = '';
let ReceiveMessageGp4 = '';
let WarnMessageGp4 = '';
let allMessageGp4 = '';
let allMessageMonthGp4 = '';
let allMessage2Gp4 = '';
let IndexGp4 = 0;

let notifySkipList = "";
let IndexAll = 0;
let EnableMonth = "false";
let isSignError = false;
let ReturnMessageTitle="";
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
const JD_API_HOST = 'https://api.m.jd.com/client.action';
let intPerSent = 0;
let i = 0;
let llShowMonth = false;
let Today = new Date();
let strAllNotify="";
let strSubNotify="";
let llPetError=false;
let strGuoqi="";
let RemainMessage = '\n';
RemainMessage += "⭕提醒:⭕" + '\n';
RemainMessage += '【京喜特价金币】京东特价版->我的->金币(可兑换无门槛红包)\n';
RemainMessage += '【领现金】京东->搜领现金(可微信提现或兑换红包)\n';
RemainMessage += '【话费积分】京东->充值中心-赚积分兑话费（180天效期）\n';
RemainMessage += '【东东农场】京东->我的->东东农场,完成可兑换无门槛红包,可用于任意商品\n';
RemainMessage += '【其他】不同类别红包不能叠加使用，自测';

let WP_APP_TOKEN_ONE = "";

let TempBaipiao = "";
let llgeterror=false;
let time = new Date().getHours();
if ($.isNode()) {
	if (process.env.WP_APP_TOKEN_ONE) {		
		WP_APP_TOKEN_ONE = process.env.WP_APP_TOKEN_ONE;
	}	
}
//if(WP_APP_TOKEN_ONE)
	//console.log(`检测到已配置Wxpusher的Token，启用一对一推送...`);
//else
	//console.log(`检测到未配置Wxpusher的Token，禁用一对一推送...`);

let jdSignUrl = 'https://api.nolanstore.cc/sign'
if (process.env.SIGNURL)
	jdSignUrl = process.env.SIGNURL;

let epsignurl=""
if (process.env.epsignurl)
    epsignurl = process.env.epsignurl;

if ($.isNode() && process.env.BEANCHANGE_PERSENT) {
	intPerSent = parseInt(process.env.BEANCHANGE_PERSENT);
	console.log(`检测到设定了分段通知:` + intPerSent);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP2) {
	MessageUserGp2 = process.env.BEANCHANGE_USERGP2 ? process.env.BEANCHANGE_USERGP2.split('&') : [];
	intPerSent = 0; //分组推送，禁用账户拆分
	console.log(`检测到设定了分组推送2,将禁用分段通知`);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP3) {
	MessageUserGp3 = process.env.BEANCHANGE_USERGP3 ? process.env.BEANCHANGE_USERGP3.split('&') : [];
	intPerSent = 0; //分组推送，禁用账户拆分
	console.log(`检测到设定了分组推送3,将禁用分段通知`);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP4) {
	MessageUserGp4 = process.env.BEANCHANGE_USERGP4 ? process.env.BEANCHANGE_USERGP4.split('&') : [];
	intPerSent = 0; //分组推送，禁用账户拆分
	console.log(`检测到设定了分组推送4,将禁用分段通知`);
}

//取消月结查询
//if ($.isNode() && process.env.BEANCHANGE_ENABLEMONTH) {
	//EnableMonth = process.env.BEANCHANGE_ENABLEMONTH;
//}

if ($.isNode() && process.env.BEANCHANGE_SUBNOTIFY) {	
	strSubNotify=process.env.BEANCHANGE_SUBNOTIFY;
	strSubNotify+="\n";
	console.log(`检测到预览置顶内容,将在一对一推送的预览显示...\n`);	
}

if ($.isNode() && process.env.BEANCHANGE_ALLNOTIFY) {	
	strAllNotify=process.env.BEANCHANGE_ALLNOTIFY;
	console.log(`检测到设定了公告,将在推送信息中置顶显示...`);
	strAllNotify = "✨✨✨✨✨✨✨公告✨✨✨✨✨✨✨\n"+strAllNotify;
	console.log(strAllNotify+"\n");
	strAllNotify +="\n🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏\n"
}


if (EnableMonth == "true" && Today.getDate() == 1 && Today.getHours() > 17)
	llShowMonth = true;

let userIndex2 = -1;
let userIndex3 = -1;
let userIndex4 = -1;


if ($.isNode()) {
	Object.keys(jdCookieNode).forEach((item) => {
		cookiesArr.push(jdCookieNode[item])
	})
	if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false')
		console.log = () => {};
} else {
	cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

//查询开关
let strDisableList = "";
let DisableIndex=-1;
if ($.isNode()) {	
	strDisableList = process.env.BEANCHANGE_DISABLELIST ? process.env.BEANCHANGE_DISABLELIST.split('&') : [];
}

//东东农场
let EnableJdFruit=true;
DisableIndex = strDisableList.findIndex((item) => item === "东东农场");
if(DisableIndex!=-1){
	console.log("检测到设定关闭东东农场查询");
	EnableJdFruit=false;	
}

//特价金币
let EnableJdSpeed=true;
DisableIndex = strDisableList.findIndex((item) => item === "极速金币");
if(DisableIndex!=-1){
	console.log("检测到设定关闭特价金币查询");
	EnableJdSpeed=false;	
}

//领现金
let EnableCash=true;
DisableIndex=strDisableList.findIndex((item) => item === "领现金");
if(DisableIndex!=-1){
	console.log("检测到设定关闭领现金查询");
	EnableCash=false;	
}	

//7天过期京豆
let EnableOverBean=true;
DisableIndex=strDisableList.findIndex((item) => item === "过期京豆");
if(DisableIndex!=-1){
	console.log("检测到设定关闭过期京豆查询");
	EnableOverBean=false
}

//查优惠券
let EnableChaQuan=false;
DisableIndex=strDisableList.findIndex((item) => item === "查优惠券");
if(DisableIndex!=-1){
	console.log("检测到设定关闭优惠券查询");
	EnableChaQuan=false
}

DisableIndex=strDisableList.findIndex((item) => item === "活动攻略");
if(DisableIndex!=-1){
	console.log("检测到设定关闭活动攻略显示");
	RemainMessage="";
}

//汪汪赛跑
let EnableJoyRun=true;
DisableIndex=strDisableList.findIndex((item) => item === "汪汪赛跑");
if(DisableIndex!=-1){
	console.log("检测到设定关闭汪汪赛跑查询");
	EnableJoyRun=false
}

//京豆收益查询
let EnableCheckBean=true;
DisableIndex=strDisableList.findIndex((item) => item === "京豆收益");
if(DisableIndex!=-1){
	console.log("检测到设定关闭京豆收益查询");
	EnableCheckBean=false
}



!(async() => {
	if (!cookiesArr[0]) {
		$.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {
			"open-url": "https://bean.m.jd.com/bean/signIndex.action"
		});
		return;
	}
	for (i = 0; i < cookiesArr.length; i++) {
		if (cookiesArr[i]) {
			cookie = cookiesArr[i];
			$.pt_pin = (cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
			$.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
			$.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
			$.index = i + 1;
			$.beanCount = 0;
			$.incomeBean = 0;
			$.expenseBean = 0;
			$.todayIncomeBean = 0;
			$.todayOutcomeBean = 0;
			$.errorMsg = '';
			$.isLogin = true;
			$.nickName = '';
			$.levelName = '';
			$.message = '';
			$.balance = 0;
			$.expiredBalance = 0;
			$.JdFarmProdName = '';
			$.JdtreeEnergy = 0;
			$.JdtreeTotalEnergy = 0;
			$.treeState = 0;
			$.JdwaterTotalT = 0;
			$.JdwaterD = 0;
			$.JDwaterEveryDayT = 0;
			$.JDtotalcash = 0;
			$.jdCash = 0;
			$.isPlusVip = false;
			$.isRealNameAuth = false;
			$.JingXiang = "";
			$.allincomeBean = 0; //月收入
			$.allexpenseBean = 0; //月支出
			$.beanChangeXi=0;
			$.YunFeiTitle="";
			$.YunFeiQuan = 0;
			$.YunFeiQuanEndTime = "";
			$.YunFeiTitle2="";
			$.YunFeiQuan2 = 0;
			$.YunFeiQuanEndTime2 = "";
			$.JoyRunningAmount = "";
			$.ECardinfo = "";
			$.PlustotalScore=0;
			$.CheckTime="";
			$.beanCache=0;			
			TempBaipiao = "";
			strGuoqi="";
			
			console.log(`******开始查询【京东账号${$.index}】${$.nickName || $.UserName}*********`);
		    $.UA = require('./USER_AGENTS').UARAM();
			await TotalBean();			
		    //await TotalBean2();
			if ($.beanCount == 0) {
				console.log("数据获取失败，等待30秒后重试....")
				await $.wait(30*1000);
				await TotalBean();		
			}
			if ($.beanCount == 0) {
				console.log("疑似获取失败,等待10秒后用第二个接口试试....")
				await $.wait(10*1000);
			    var userdata = await getuserinfo();
			    if (userdata.code == 1) {
			        $.beanCount = userdata.content.jdBean;
			    }
			}
			
			
			if (!$.isLogin) {
				await isLoginByX1a0He();
			}
			if (!$.isLogin) {
				$.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {
					"open-url": "https://bean.m.jd.com/bean/signIndex.action"
				});

				if ($.isNode()) {
					await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
				}
				continue
			}
			
			if (TempBeanCache) {
			    for (let j = 0; j < TempBeanCache.length; j++) {
			        if (TempBeanCache[j].pt_pin == $.UserName) {
						$.CheckTime = TempBeanCache[j].CheckTime;
			            $.beanCache = TempBeanCache[j].BeanNum;
			            break;
			        }
			    }
			}
			
			var llfound = false;
			var timeString = "";
			var nowHour = new Date().getHours();
			var nowMinute = new Date().getMinutes();
			if (nowHour < 10)
			    timeString += "0" + nowHour + ":";
			else
			    timeString += nowHour + ":";

			if (nowMinute < 10)
			    timeString += "0" + nowMinute;
			else
			    timeString += nowMinute;

			if (TodayCache) {
			    for (let j = 0; j < TodayCache.length; j++) {
			        if (TodayCache[j].pt_pin == $.UserName) {
			            TodayCache[j].CheckTime = timeString;
			            TodayCache[j].BeanNum = $.beanCount;
			            llfound = true;
			            break;
			        }
			    }
			}
			if (!llfound) {

			    var tempAddCache = {
			        "pt_pin": $.UserName,
			        "CheckTime": timeString,
			        "BeanNum": $.beanCount
			    };
			    TodayCache.push(tempAddCache);
			}
						
			await getjdfruitinfo(); //东东农场
			await $.wait(1000);
			await checkplus();
			await Promise.all([        
			        cash(), //特价金币
			        bean(), //京豆查询
			        //jdCash(), //领现金
			        GetJoyRuninginfo(), //汪汪赛跑
			        queryScores()
			    ])
				
			await showMsg();
			if (intPerSent > 0) {
				if ((i + 1) % intPerSent == 0) {
					console.log("分段通知条件达成，处理发送通知....");
					if ($.isNode() && allMessage) {
						var TempMessage=allMessage;
						if(strAllNotify)
							allMessage=strAllNotify+`\n`+allMessage;

						await notify.sendNotify(`${$.name}`, `${allMessage}`, {
							url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
						}, undefined,TempMessage)
					}
					if ($.isNode() && allMessageMonth) {
						await notify.sendNotify(`京东月资产统计`, `${allMessageMonth}`, {
							url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
						})
					}
					allMessage = "";
					allMessageMonth = "";
				}

			}
		}
	}
	
	var str = JSON.stringify(TodayCache, null, 2);
	fs.writeFile(strNewBeanCache, str, function (err) {
	    if (err) {
	        console.log(err);
	        console.log("添加缓存" + TodayDate + ".json失败!");
	    } else {
	        console.log("添加缓存" + TodayDate + ".json成功!");
	    }
	})

	//组1通知
	if (ReceiveMessageGp4) {
		allMessage2Gp4 = `【⏰商品白嫖清单⏰】\n` + ReceiveMessageGp4;
	}
	if (WarnMessageGp4) {
		if (allMessage2Gp4) {
			allMessage2Gp4 = `\n` + allMessage2Gp4;
		}
		allMessage2Gp4 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp4 + allMessage2Gp4;
	}

	//组2通知
	if (ReceiveMessageGp2) {
		allMessage2Gp2 = `【⏰商品白嫖清单⏰】\n` + ReceiveMessageGp2;
	}
	if (WarnMessageGp2) {
		if (allMessage2Gp2) {
			allMessage2Gp2 = `\n` + allMessage2Gp2;
		}
		allMessage2Gp2 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp2 + allMessage2Gp2;
	}

	//组3通知
	if (ReceiveMessageGp3) {
		allMessage2Gp3 = `【⏰商品白嫖清单⏰】\n` + ReceiveMessageGp3;
	}
	if (WarnMessageGp3) {
		if (allMessage2Gp3) {
			allMessage2Gp3 = `\n` + allMessage2Gp3;
		}
		allMessage2Gp3 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp3 + allMessage2Gp3;
	}

	//其他通知
	if (allReceiveMessage) {
		allMessage2 = `【⏰商品白嫖清单⏰】\n` + allReceiveMessage;
	}
	if (allWarnMessage) {
		if (allMessage2) {
			allMessage2 = `\n` + allMessage2;
		}
		allMessage2 = `【⏰商品白嫖活动任务提醒⏰】\n` + allWarnMessage + allMessage2;
	}

	if (intPerSent > 0) {
		//console.log("分段通知还剩下" + cookiesArr.length % intPerSent + "个账号需要发送...");
		if (allMessage || allMessageMonth) {
			console.log("分段通知收尾，处理发送通知....");
			if ($.isNode() && allMessage) {
				var TempMessage=allMessage;
				if(strAllNotify)
					allMessage=strAllNotify+`\n`+allMessage;
				
				await notify.sendNotify(`${$.name}`, `${allMessage}`, {
					url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
				}, undefined,TempMessage)
			}
			if ($.isNode() && allMessageMonth) {
				await notify.sendNotify(`京东月资产统计`, `${allMessageMonth}`, {
					url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
				})
			}
		}
	} else {

		if ($.isNode() && allMessageGp2) {
			var TempMessage=allMessageGp2;
			if(strAllNotify)
				allMessageGp2=strAllNotify+`\n`+allMessageGp2;
			await notify.sendNotify(`${$.name}#2`, `${allMessageGp2}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			}, undefined,TempMessage)
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageGp3) {
			var TempMessage=allMessageGp3;
			if(strAllNotify)
				allMessageGp3=strAllNotify+`\n`+allMessageGp3;
			await notify.sendNotify(`${$.name}#3`, `${allMessageGp3}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			}, undefined,TempMessage)
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageGp4) {
			var TempMessage=allMessageGp4;
			if(strAllNotify)
				allMessageGp4=strAllNotify+`\n`+allMessageGp4;
			await notify.sendNotify(`${$.name}#4`, `${allMessageGp4}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			}, undefined,TempMessage)
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessage) {
			var TempMessage=allMessage;
			if(strAllNotify)
				allMessage=strAllNotify+`\n`+allMessage;
			
			await notify.sendNotify(`${$.name}`, `${allMessage}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			}, undefined,TempMessage)
			await $.wait(10 * 1000);
		}

		if ($.isNode() && allMessageMonthGp2) {
			await notify.sendNotify(`京东月资产统计#2`, `${allMessageMonthGp2}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			})
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageMonthGp3) {
			await notify.sendNotify(`京东月资产统计#3`, `${allMessageMonthGp3}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			})
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageMonthGp4) {
			await notify.sendNotify(`京东月资产统计#4`, `${allMessageMonthGp4}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			})
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageMonth) {
			await notify.sendNotify(`京东月资产统计`, `${allMessageMonth}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			})
			await $.wait(10 * 1000);
		}
	}

	if ($.isNode() && allMessage2Gp2) {
		allMessage2Gp2 += RemainMessage;
		await notify.sendNotify("京东白嫖提醒#2", `${allMessage2Gp2}`, {
			url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
		})
		await $.wait(10 * 1000);
	}
	if ($.isNode() && allMessage2Gp3) {
		allMessage2Gp3 += RemainMessage;
		await notify.sendNotify("京东白嫖提醒#3", `${allMessage2Gp3}`, {
			url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
		})
		await $.wait(10 * 1000);
	}
	if ($.isNode() && allMessage2Gp4) {
		allMessage2Gp4 += RemainMessage;
		await notify.sendNotify("京东白嫖提醒#4", `${allMessage2Gp4}`, {
			url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
		})
		await $.wait(10 * 1000);
	}
	if ($.isNode() && allMessage2) {
		allMessage2 += RemainMessage;
		await notify.sendNotify("京东白嫖提醒", `${allMessage2}`, {
			url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
		})
		await $.wait(10 * 1000);
	}

})()
.catch((e) => {
	$.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
})
.finally(() => {
	$.done();
})
async function showMsg() {
	//if ($.errorMsg)
	//return
	ReturnMessageTitle="";
	ReturnMessage = "";
	var strsummary="";
	if (MessageUserGp2) {
		userIndex2 = MessageUserGp2.findIndex((item) => item === $.pt_pin);
	}
	if (MessageUserGp3) {
		userIndex3 = MessageUserGp3.findIndex((item) => item === $.pt_pin);
	}
	if (MessageUserGp4) {
		userIndex4 = MessageUserGp4.findIndex((item) => item === $.pt_pin);
	}
	
	if (userIndex2 != -1) {
		IndexGp2 += 1;
		ReturnMessageTitle = `【账号${IndexGp2}🆔】${$.nickName || $.UserName}`;
	}
	if (userIndex3 != -1) {
		IndexGp3 += 1;
		ReturnMessageTitle = `【账号${IndexGp3}🆔】${$.nickName || $.UserName}`;
	}
	if (userIndex4 != -1) {
		IndexGp4 += 1;
		ReturnMessageTitle = `【账号${IndexGp4}🆔】${$.nickName || $.UserName}`;
	}
	if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
		IndexAll += 1;
		ReturnMessageTitle = `【账号${IndexAll}🆔】${$.nickName || $.UserName}`;
	}
	
		
	if ($.JingXiang) {
		if ($.isRealNameAuth)
			if (cookie.includes("app_open"))
				ReturnMessageTitle += `(wskey已实名)\n`;
			else
				ReturnMessageTitle += `(已实名)\n`;
		else
			if (cookie.includes("app_open"))
				ReturnMessageTitle += `(wskey未实名)\n`;
			else
				ReturnMessageTitle += `(未实名)\n`;
			
	    ReturnMessage += `【账号信息】`;
	    if ($.isPlusVip) {
	        ReturnMessage += `Plus会员`;	        
	    } else {
	        ReturnMessage += `普通会员`;
	    } 
		if ($.PlustotalScore)
	        ReturnMessage += `(${$.PlustotalScore}分)` 
			
	    ReturnMessage += `,京享值${$.JingXiang}\n`;	    
	}else{
		ReturnMessageTitle+= `\n`;
	}
	if (llShowMonth) {
		ReturnMessageMonth = ReturnMessage;
		ReturnMessageMonth += `\n【上月收入】：${$.allincomeBean}京豆 🐶\n`;
		ReturnMessageMonth += `【上月支出】：${$.allexpenseBean}京豆 🐶\n`;

		console.log(ReturnMessageMonth);

		if (userIndex2 != -1) {
			allMessageMonthGp2 += ReturnMessageMonth + `\n`;
		}
		if (userIndex3 != -1) {
			allMessageMonthGp3 += ReturnMessageMonth + `\n`;
		}
		if (userIndex4 != -1) {
			allMessageMonthGp4 += ReturnMessageMonth + `\n`;
		}
		if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
			allMessageMonth += ReturnMessageMonth + `\n`;
		}
		if ($.isNode() && WP_APP_TOKEN_ONE) {
			await notify.sendNotifybyWxPucher("京东月资产统计", `${ReturnMessageMonth}`, `${$.UserName}`);
		}

	}
	if (EnableCheckBean) {
	    if (checkbeanDetailMode == 0) {
	        ReturnMessage += `【今日京豆】收${$.todayIncomeBean}豆`;
	        strsummary += `收${$.todayIncomeBean}豆,`;
	        if ($.todayOutcomeBean != 0) {
	            ReturnMessage += `,支${$.todayOutcomeBean}豆`;
	        }
	        ReturnMessage += `\n`;
	        ReturnMessage += `【昨日京豆】收${$.incomeBean}豆`;

	        if ($.expenseBean != 0) {
	            ReturnMessage += `,支${$.expenseBean}豆`;
	        }
	        ReturnMessage += `\n`;
	    } else {	
			if (TempBeanCache){
				ReturnMessage += `【京豆变动】${$.beanCount-$.beanCache}豆(与${matchtitle}${$.CheckTime}比较)`;			
				strsummary += `变动${$.beanCount-$.beanCache}豆,`;
				ReturnMessage += `\n`;				
			}	
			else{
				ReturnMessage += `【京豆变动】未找到缓存,下次出结果统计`;
				ReturnMessage += `\n`;
			}		
		}
	}
	
	
	if ($.beanCount){		
		ReturnMessage += `【当前京豆】${$.beanCount-$.beanChangeXi}豆(≈${(($.beanCount-$.beanChangeXi)/ 100).toFixed(2)}元)\n`;
	} else {
		if($.levelName || $.JingXiang)
			ReturnMessage += `【当前京豆】获取失败,接口返回空数据\n`;
		else{
			ReturnMessage += `【当前京豆】${$.beanCount-$.beanChangeXi}豆(≈${(($.beanCount-$.beanChangeXi)/ 100).toFixed(2)}元)\n`;
		}			
	}	
	
	if ($.JDtotalcash) {
		ReturnMessage += `【特价金币】${$.JDtotalcash}币(≈${($.JDtotalcash / 10000).toFixed(2)}元)\n`;
	}	
	if($.ECardinfo)
		ReturnMessage += `【礼卡余额】${$.ECardinfo}\n`;
	
	if ($.JoyRunningAmount) 
		ReturnMessage += `【汪汪赛跑】${$.JoyRunningAmount}元\n`;

	if ($.JdFarmProdName != "") {
		if ($.JdtreeEnergy != 0) {
			if ($.treeState === 2 || $.treeState === 3) {
				ReturnMessage += `【东东农场】${$.JdFarmProdName} 可以兑换了!\n`;
				TempBaipiao += `【东东农场】${$.JdFarmProdName} 可以兑换了!\n`;
				if (userIndex2 != -1) {
					ReceiveMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】${$.JdFarmProdName} (东东农场)\n`;
				}
				if (userIndex3 != -1) {
					ReceiveMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】${$.JdFarmProdName} (东东农场)\n`;
				}
				if (userIndex4 != -1) {
					ReceiveMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】${$.JdFarmProdName} (东东农场)\n`;
				}
				if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
					allReceiveMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】${$.JdFarmProdName} (东东农场)\n`;
				}
			} else {
				//if ($.JdwaterD != 'Infinity' && $.JdwaterD != '-Infinity') {
					//ReturnMessage += `【东东农场】${$.JdFarmProdName}(${(($.JdtreeEnergy / $.JdtreeTotalEnergy) * 100).toFixed(0)}%,${$.JdwaterD}天)\n`;
				//} else {
					ReturnMessage += `【东东农场】${$.JdFarmProdName}(${(($.JdtreeEnergy / $.JdtreeTotalEnergy) * 100).toFixed(0)}%)\n`;

				//}
			}
		} else {
			if ($.treeState === 0) {
				TempBaipiao += `【东东农场】水果领取后未重新种植!\n`;

				if (userIndex2 != -1) {
					WarnMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】水果领取后未重新种植! (东东农场)\n`;
				}
				if (userIndex3 != -1) {
					WarnMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】水果领取后未重新种植! (东东农场)\n`;
				}
				if (userIndex4 != -1) {
					WarnMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】水果领取后未重新种植! (东东农场)\n`;
				}
				if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
					allWarnMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】水果领取后未重新种植! (东东农场)\n`;
				}

			} else if ($.treeState === 1) {
				ReturnMessage += `【东东农场】${$.JdFarmProdName}种植中...\n`;
			} else {
				TempBaipiao += `【东东农场】状态异常!\n`;
				if (userIndex2 != -1) {
					WarnMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】状态异常! (东东农场)\n`;
				}
				if (userIndex3 != -1) {
					WarnMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】状态异常! (东东农场)\n`;
				}
				if (userIndex4 != -1) {
					WarnMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】状态异常! (东东农场)\n`;
				}
				if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
					allWarnMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】状态异常! (东东农场)\n`;
				}
				//ReturnMessage += `【东东农场】${$.JdFarmProdName}状态异常${$.treeState}...\n`;
			}
		}
	}
    let dwscore = await dwappinfo();
    if (dwscore){
      let dwappex = await dwappexpire();
      ReturnMessage += `【话费积分】${dwscore}`;
      if (dwappex){
        ReturnMessage += `(最近已过期:${dwappex})`;
      }
      ReturnMessage += `\n`;
    }
	if ($.jdCash) {
		ReturnMessage += `【其他信息】`;
		
		if ($.jdCash) {						
			ReturnMessage += `领现金:${$.jdCash}元`;
		}		
		
		ReturnMessage += `\n`;

	}
	
	if(strGuoqi){		
		ReturnMessage += `💸💸💸临期京豆明细💸💸💸\n`;
		ReturnMessage += `${strGuoqi}`;
	}
	ReturnMessage += `🧧🧧🧧红包明细🧧🧧🧧\n`;
	ReturnMessage += `${$.message}`;
	strsummary+=`红包${$.balance}元`
	if($.YunFeiQuan){
		var strTempYF="【免运费券】"+$.YunFeiQuan+"张";
		if($.YunFeiQuanEndTime)
			strTempYF+="(有效期至"+$.YunFeiQuanEndTime+")";
		strTempYF+="\n";
		ReturnMessage +=strTempYF
	}
	if($.YunFeiQuan2){
		var strTempYF2="【免运费券】"+$.YunFeiQuan2+"张";
		if($.YunFeiQuanEndTime2)
			strTempYF+="(有效期至"+$.YunFeiQuanEndTime2+")";
		strTempYF2+="\n";
		ReturnMessage +=strTempYF2
	}
	
	if (userIndex2 != -1) {
		allMessageGp2 += ReturnMessageTitle+ReturnMessage + `\n`;
	}
	if (userIndex3 != -1) {
		allMessageGp3 += ReturnMessageTitle+ReturnMessage + `\n`;
	}
	if (userIndex4 != -1) {
		allMessageGp4 += ReturnMessageTitle+ReturnMessage + `\n`;
	}
	if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
		allMessage += ReturnMessageTitle+ReturnMessage + `\n------\n`;
	}

	console.log(`${ReturnMessageTitle+ReturnMessage}`);

	if ($.isNode() && WP_APP_TOKEN_ONE) {
		var strTitle="京东资产统计";
		if($.JingXiang){
			if ($.isRealNameAuth)
				if (cookie.includes("app_open"))
					ReturnMessage=`【账号名称】${$.nickName || $.UserName}(wskey已实名)\n`+ReturnMessage;
				else
					ReturnMessage=`【账号名称】${$.nickName || $.UserName}(已实名)\n`+ReturnMessage;
			else
				if (cookie.includes("app_open"))
					ReturnMessage=`【账号名称】${$.nickName || $.UserName}(wskey未实名)\n`+ReturnMessage;
				else
					ReturnMessage=`【账号名称】${$.nickName || $.UserName}(未实名)\n`+ReturnMessage;
			
		}else{
			ReturnMessage=`【账号名称】${$.nickName || $.UserName}\n`+ReturnMessage;
		}
		if (TempBaipiao) {			
			TempBaipiao = `【⏰商品白嫖活动提醒⏰】\n` + TempBaipiao;
			ReturnMessage = TempBaipiao + `\n` + ReturnMessage;			
		} 
		
		ReturnMessage += RemainMessage;
		
		if(strAllNotify)
			ReturnMessage=strAllNotify+`\n`+ReturnMessage;
		
		await notify.sendNotifybyWxPucher(strTitle, `${ReturnMessage}`, `${$.UserName}`,undefined,strsummary);
	}

	//$.msg($.name, '', ReturnMessage , {"open-url": "https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean"});
}
async function bean() {
	
	if (EnableCheckBean && checkbeanDetailMode==0) {	
			
	    // console.log(`北京时间零点时间戳:${parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000}`);
	    // console.log(`北京时间2020-10-28 06:16:05::${new Date("2020/10/28 06:16:05+08:00").getTime()}`)
	    // 不管哪个时区。得到都是当前时刻北京时间的时间戳 new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000

	    //前一天的0:0:0时间戳
	    const tm = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000 - (24 * 60 * 60 * 1000);
	    // 今天0:0:0时间戳
	    const tm1 = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000;
	    let page = 1,
	    t = 0,
	    yesterdayArr = [],
	    todayArr = [];
	    do {
	        let response = await getJingBeanBalanceDetail(page);
	        await $.wait(1000);
	        // console.log(`第${page}页: ${JSON.stringify(response)}`);
	        if (response && response.code === "0") {
	            page++;
	            let detailList = response.jingDetailList;
	            if (detailList && detailList.length > 0) {
	                for (let item of detailList) {
	                    const date = item.date.replace(/-/g, '/') + "+08:00";
	                    if (new Date(date).getTime() >= tm1 && (!item['eventMassage'].includes("退还") && !item['eventMassage'].includes("物流") && !item['eventMassage'].includes('扣赠'))) {
	                        todayArr.push(item);
	                    } else if (tm <= new Date(date).getTime() && new Date(date).getTime() < tm1 && (!item['eventMassage'].includes("退还") && !item['eventMassage'].includes("物流") && !item['eventMassage'].includes('扣赠'))) {
	                        //昨日的
	                        yesterdayArr.push(item);
	                    } else if (tm > new Date(date).getTime()) {
	                        //前天的
	                        t = 1;
	                        break;
	                    }
	                }
	            } else {
	                $.errorMsg = `数据异常`;
	                $.msg($.name, ``, `账号${$.index}：${$.nickName}\n${$.errorMsg}`);
	                t = 1;
	            }
	        } else if (response && response.code === "3") {
	            console.log(`cookie已过期，或者填写不规范，跳出`)
	            t = 1;
	        } else {
	            console.log(`未知情况：${JSON.stringify(response)}`);
	            console.log(`未知情况，跳出`)
	            t = 1;
	        }
	    } while (t === 0);
	    for (let item of yesterdayArr) {
	        if (Number(item.amount) > 0) {
	            $.incomeBean += Number(item.amount);
	        } else if (Number(item.amount) < 0) {
	            $.expenseBean += Number(item.amount);
	        }
	    }
	    for (let item of todayArr) {
	        if (Number(item.amount) > 0) {
	            $.todayIncomeBean += Number(item.amount);
	        } else if (Number(item.amount) < 0) {
	            $.todayOutcomeBean += Number(item.amount);
	        }
	    }
	    $.todayOutcomeBean = -$.todayOutcomeBean;
	    $.expenseBean = -$.expenseBean;	    
	}
	
	if (EnableOverBean) {
	    await jingBeanDetail(); //过期京豆	    
	}
	await redPacket();
	if (EnableChaQuan)
	    await getCoupon();
}

async function Monthbean() {
	let time = new Date();
	let year = time.getFullYear();
	let month = parseInt(time.getMonth()); //取上个月
	if (month == 0) {
		//一月份，取去年12月，所以月份=12，年份减1
		month = 12;
		year -= 1;
	}

	//开始时间 时间戳
	let start = new Date(year + "-" + month + "-01 00:00:00").getTime();
	console.log(`计算月京豆起始日期:` + GetDateTime(new Date(year + "-" + month + "-01 00:00:00")));

	//结束时间 时间戳
	if (month == 12) {
		//取去年12月，进1个月，所以月份=1，年份加1
		month = 1;
		year += 1;
	}
	let end = new Date(year + "-" + (month + 1) + "-01 00:00:00").getTime();
	console.log(`计算月京豆结束日期:` + GetDateTime(new Date(year + "-" + (month + 1) + "-01 00:00:00")));

	let allpage = 1,
	allt = 0,
	allyesterdayArr = [];
	do {
		let response = await getJingBeanBalanceDetail(allpage);
		await $.wait(1000);
		// console.log(`第${allpage}页: ${JSON.stringify(response)}`);
		if (response && response.code === "0") {
			allpage++;
			let detailList = response.jingDetailList;
			if (detailList && detailList.length > 0) {
				for (let item of detailList) {
					const date = item.date.replace(/-/g, '/') + "+08:00";
					if (start <= new Date(date).getTime() && new Date(date).getTime() < end) {
						//日期区间内的京豆记录
						allyesterdayArr.push(item);
					} else if (start > new Date(date).getTime()) {
						//前天的
						allt = 1;
						break;
					}
				}
			} else {
				$.errorMsg = `数据异常`;
				$.msg($.name, ``, `账号${$.index}：${$.nickName}\n${$.errorMsg}`);
				allt = 1;
			}
		} else if (response && response.code === "3") {
			console.log(`cookie已过期，或者填写不规范，跳出`)
			allt = 1;
		} else {
			console.log(`未知情况：${JSON.stringify(response)}`);
			console.log(`未知情况，跳出`)
			allt = 1;
		}
	} while (allt === 0);

	for (let item of allyesterdayArr) {
		if (Number(item.amount) > 0) {
			$.allincomeBean += Number(item.amount);
		} else if (Number(item.amount) < 0) {
			$.allexpenseBean += Number(item.amount);
		}
	}

}

async function jdCash() {
	if (!EnableCash)
		return;
    let opt = {
        url: `https://api.m.jd.com`,
        body: `functionId=cash_exchange_center&body={"version":"1","channel":"app"}&appid=signed_wh5&client=android&clientVersion=11.8.0&t=${Date.now()}`,
        headers: {
            'Host': 'api.m.jd.com',
            'Origin': 'https://h5.m.jd.com',
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': $.UA,
            'Cookie': cookie
        }
    }
		return new Promise((resolve) => {
			$.post(opt, async (err, resp, data) => {
				try {
					if (err) {
						console.log(`${JSON.stringify(err)}`)
						console.log(`jdCash API请求失败，请检查网路重试`)
					} else {
						if (safeGet(data)) {
                            data = JSON.parse(data)
                            if (data.code == 0) {
                                if (data.data.bizCode == 0) {
                                    $.jdCash = data.data.result.userMoney;
                                } else {
                                    //console.log(data.data.bizMsg);
                                }
                            } else {
                                //console.log(data.msg)
                            }
					    }
					}
				} catch (e) {
					$.logErr(e, resp)
				}
				finally {
					resolve(data);
				}
			})
		})
}

function apptaskUrl(functionId = "", body = "") {
  return {
    url: `${JD_API_HOST}?functionId=${functionId}`,
    body,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Connection': 'keep-alive',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': '',
      'User-Agent': 'JD4iPhone/167774 (iPhone; iOS 14.7.1; Scale/3.00)',
      'Accept-Language': 'zh-Hans-CN;q=1',
      'Accept-Encoding': 'gzip, deflate, br',
    },
    timeout: 10000
  }
}

function TotalBean() {
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
                "User-Agent": $.UA
            }
        }
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data['retcode'] === 13) {
                            $.isLogin = false; //cookie过期
                            return
                        }
                        if (data['retcode'] === 0) {
                            $.nickName = (data['base'] && data['base'].nickname) || $.UserName;
							//$.isPlusVip=data['isPlusVip'];
							$.isRealNameAuth=data['isRealNameAuth'];
							$.beanCount=(data['base'] && data['base'].jdNum) || 0 ;		
							$.JingXiang = (data['base'] && data['base'].jvalue) || 0 ;						
                        } else {
                            $.nickName = $.UserName
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

function TotalBean2() {
	return new Promise(async(resolve) => {
		const options = {
			url: `https://wxapp.m.jd.com/kwxhome/myJd/home.json?&useGuideModule=0&bizId=&brandId=&fromType=wxapp&timestamp=${Date.now()}`,
			headers: {
				Cookie: cookie,
				'content-type': `application/x-www-form-urlencoded`,
				Connection: `keep-alive`,
				'Accept-Encoding': `gzip,compress,br,deflate`,
				Referer: `https://servicewechat.com/wxa5bf5ee667d91626/161/page-frame.html`,
				Host: `wxapp.m.jd.com`,
				'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.10(0x18000a2a) NetType/WIFI Language/zh_CN`,
			},
			timeout: 10000
		};
		$.post(options, (err, resp, data) => {
			try {
				if (err) {
					$.logErr(err);
				} else {					
					if (data) {								
						data = JSON.parse(data);
						
						if (!data.user) {
							return;
						}
						const userInfo = data.user;						
						if (userInfo) {
							if (!$.nickName)
								$.nickName = userInfo.petName;
							if ($.beanCount == 0) {
								$.beanCount = userInfo.jingBean;
							}
							$.JingXiang = userInfo.uclass;
						}
					} else {
						$.log('京东服务器返回空数据');
					}
				}
			} catch (e) {
				$.logErr(e);
			}
			finally {
				resolve();
			}
		});
	});
}

function isLoginByX1a0He() {
	return new Promise((resolve) => {
		const options = {
			url: 'https://plogin.m.jd.com/cgi-bin/ml/islogin',
			headers: {
				"Cookie": cookie,
				"referer": "https://h5.m.jd.com/",
				"User-Agent": "jdapp;iPhone;10.1.2;15.0;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
			},
			timeout: 10000
		}
		$.get(options, (err, resp, data) => {
			try {
				if (data) {
					data = JSON.parse(data);
					if (data.islogin === "1") {
						console.log(`使用X1a0He写的接口加强检测: Cookie有效\n`)
					} else if (data.islogin === "0") {
						$.isLogin = false;
						console.log(`使用X1a0He写的接口加强检测: Cookie无效\n`)
					} else {
						console.log(`使用X1a0He写的接口加强检测: 未知返回，不作变更...\n`)
						$.error = `${$.nickName} :` + `使用X1a0He写的接口加强检测: 未知返回...\n`
					}
				}
			} catch (e) {
				console.log(e);
			}
			finally {
				resolve();
			}
		});
	});
}

function getJingBeanBalanceDetail(page) {
  return new Promise(async resolve => {
    const options = {
      "url": `https://bean.m.jd.com/beanDetail/detail.json?page=${page}`,
      "body": `body=${escape(JSON.stringify({"pageSize": "20", "page": page.toString()}))}&appid=ld`,
      "headers": {
				'User-Agent': $.UA,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie,
      }
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`getJingBeanBalanceDetail API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            // console.log(data)
          } else {
            // console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        // $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function jingBeanDetail() {
	return new Promise(async resolve => {
		setTimeout(async () => {
			var strsign = "";
			if (epsignurl) {
				strsign = await getepsign('jingBeanDetail', { "pageSize": "20", "page": "1" });
				strsign = strsign.body;
			}
			else
				strsign = await getSignfromNolan('jingBeanDetail', { "pageSize": "20", "page": "1" });

			const options = {
				"url": `https://api.m.jd.com/client.action?functionId=jingBeanDetail`,
				"body": strsign,
				"headers": {
					'User-Agent': $.UA,
					'Host': 'api.m.jd.com',
					'Content-Type': 'application/x-www-form-urlencoded',
					'Cookie': cookie,
				}
			}
			$.post(options, (err, resp, data) => {
				try {
					if (err) {
						console.log(`${JSON.stringify(err)}`)
						console.log(`${$.name} jingBeanDetail API请求失败，请检查网路重试`)
					} else {
						if (data) {
							data = JSON.parse(data);
							if (data?.others?.jingBeanExpiringInfo?.detailList) {
								const { detailList = [] } = data?.others?.jingBeanExpiringInfo;
								detailList.map(item => {
									strGuoqi += `【${(item['eventMassage']).replace("即将过期京豆", "").replace("年", "-").replace("月", "-").replace("日", "")}】过期${item['amount']}豆\n`;
								})
							}
						} else {
							console.log(`jingBeanDetail 京东服务器返回空数据`)
						}
					}
				} catch (e) {
					if (epsignurl)
						$.logErr(e, resp)
					else
						console.log("因为没有指定带ep的Sign,获取过期豆子信息次数多了就会失败.")
				} finally {
					resolve(data);
				}
			})
		}, 0 * 1000);
	})
} 
  
function getepsign(n, o, t = "sign") {	
  let e = {
    url: epsignurl, 
    form: {
      functionId: n, body: $.toStr(o),
    }, headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  };
  return new Promise(n => {
    $.post(e, async (o, t, e) => {
      try {
        o ? console.log(o) : e = JSON.parse(e)
        if (e.code === 200 && e.data) {
          n({body: e.data.convertUrlNew})
        }
      } catch (n) {
        $.logErr(n, t)
      } finally {
        n({body: e.convertUrlNew})
      }
    })
  })
}

function getSignfromNolan(functionId, body) {	
    var strsign = '';
	let data = {
      "fn":functionId,
      "body": body
    }
    return new Promise((resolve) => {
        let url = {
            url: jdSignUrl,
            body: JSON.stringify(data),
		    followRedirect: false,
		    headers: {
		        'Accept': '*/*',
		        "accept-encoding": "gzip, deflate, br",
		        'Content-Type': 'application/json'
		    },
		    timeout: 30000
        }
        $.post(url, async(err, resp, data) => {
            try {				
                data = JSON.parse(data);
                if (data && data.body) {                    
                    if (data.body)
                        strsign = data.body || '';
                    if (strsign != '')
                        resolve(strsign);
                    else
                        console.log("签名获取失败.");
                } else {
                    console.log("签名获取失败.");
                }				
            }catch (e) {
                $.logErr(e, resp);
            }finally {
				resolve(strsign);
			}
        })
    })
}


function redPacket() {
	return new Promise(async resolve => {
		const options = {
			"url": `https://api.m.jd.com/client.action?functionId=myhongbao_getUsableHongBaoList&body=%7B%22appId%22%3A%22appHongBao%22%2C%22appToken%22%3A%22apphongbao_token%22%2C%22platformId%22%3A%22appHongBao%22%2C%22platformToken%22%3A%22apphongbao_token%22%2C%22platform%22%3A%221%22%2C%22orgType%22%3A%222%22%2C%22country%22%3A%22cn%22%2C%22childActivityId%22%3A%22-1%22%2C%22childActiveName%22%3A%22-1%22%2C%22childActivityTime%22%3A%22-1%22%2C%22childActivityUrl%22%3A%22-1%22%2C%22openId%22%3A%22-1%22%2C%22activityArea%22%3A%22-1%22%2C%22applicantErp%22%3A%22-1%22%2C%22eid%22%3A%22-1%22%2C%22fp%22%3A%22-1%22%2C%22shshshfp%22%3A%22-1%22%2C%22shshshfpa%22%3A%22-1%22%2C%22shshshfpb%22%3A%22-1%22%2C%22jda%22%3A%22-1%22%2C%22activityType%22%3A%221%22%2C%22isRvc%22%3A%22-1%22%2C%22pageClickKey%22%3A%22-1%22%2C%22extend%22%3A%22-1%22%2C%22organization%22%3A%22JD%22%7D&appid=JDReactMyRedEnvelope&client=apple&clientVersion=7.0.0`,
			"headers": {
				'Host': 'api.m.jd.com',
				'Accept': '*/*',
				'Connection': 'keep-alive',
				'Accept-Language': 'zh-cn',
				'Referer': 'https://h5.m.jd.com/',
				'Accept-Encoding': 'gzip, deflate, br',
				"Cookie": cookie,
				'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
			}
		}
		$.get(options, (err, resp, data) => {
			try {				
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(`redPacket API请求失败，请检查网路重试`)
				} else {
					if (data) {
						data = JSON.parse(data);
						$.jxRed = 0,
						$.jsRed = 0,
						$.jdRed = 0,
						$.jdhRed = 0,
						$.jdwxRed = 0,
						$.jdGeneralRed = 0,
						$.jxRedExpire = 0,
						$.jsRedExpire = 0,
						$.jdRedExpire = 0,
						$.jdhRedExpire = 0;
						$.jdwxRedExpire = 0,
						$.jdGeneralRedExpire = 0
						
						let t = new Date();
						t.setDate(t.getDate() + 1);
						t.setHours(0, 0, 0, 0);
						t = parseInt((t - 1) / 1000)*1000;
						
						for (let vo of data.hongBaoList || []) {
						    if (vo.orgLimitStr) {								
						        if (vo.orgLimitStr.includes("京喜") && !vo.orgLimitStr.includes("特价")) {
						            $.jxRed += parseFloat(vo.balance)
						            if (vo['endTime'] === t) {
						                $.jxRedExpire += parseFloat(vo.balance)									
						            }
									continue;	
						        } else if (vo.orgLimitStr.includes("购物小程序")) {
						            $.jdwxRed += parseFloat(vo.balance)
						            if (vo['endTime'] === t) {
						                $.jdwxRedExpire += parseFloat(vo.balance)
						            }
									continue;	
						        } else if (vo.orgLimitStr.includes("京东商城")) {
						            $.jdRed += parseFloat(vo.balance)
						            if (vo['endTime'] === t) {
						                $.jdRedExpire += parseFloat(vo.balance)
						            }
									continue;	
						        } else if (vo.orgLimitStr.includes("极速") || vo.orgLimitStr.includes("京东特价") || vo.orgLimitStr.includes("京喜特价")) {
						            $.jsRed += parseFloat(vo.balance)
						            if (vo['endTime'] === t) {
						                $.jsRedExpire += parseFloat(vo.balance)
						            }
									continue;	
						        } else if (vo.orgLimitStr && vo.orgLimitStr.includes("京东健康")) {
						            $.jdhRed += parseFloat(vo.balance)
						            if (vo['endTime'] === t) {
						                $.jdhRedExpire += parseFloat(vo.balance)
						            }
									continue;	
						        }
						    }
						    $.jdGeneralRed += parseFloat(vo.balance)
						    if (vo['endTime'] === t) {
						        $.jdGeneralRedExpire += parseFloat(vo.balance)
						    }
						}
						
						$.balance = ($.jxRed+$.jsRed+$.jdRed +$.jdhRed+$.jdwxRed+$.jdGeneralRed).toFixed(2);
						$.jxRed = $.jxRed.toFixed(2);
						$.jsRed = $.jsRed.toFixed(2);
						$.jdRed = $.jdRed.toFixed(2);						
						$.jdhRed = $.jdhRed.toFixed(2);
						$.jdwxRed = $.jdwxRed.toFixed(2);
						$.jdGeneralRed = $.jdGeneralRed.toFixed(2);						
						$.expiredBalance = ($.jxRedExpire + $.jsRedExpire + $.jdRedExpire+$.jdhRedExpire+$.jdwxRedExpire+$.jdGeneralRedExpire).toFixed(2);
						$.message += `【红包总额】${$.balance}(总过期${$.expiredBalance})元 \n`;
						if ($.jxRed > 0){
							if($.jxRedExpire>0)
								$.message += `【京喜红包】${$.jxRed}(将过期${$.jxRedExpire.toFixed(2)})元 \n`;
							else
								$.message += `【京喜红包】${$.jxRed}元 \n`;
						}
							
						if ($.jsRed > 0){
							if($.jsRedExpire>0)
								$.message += `【京喜特价】${$.jsRed}(将过期${$.jsRedExpire.toFixed(2)})元(原极速版) \n`;
							else
								$.message += `【京喜特价】${$.jsRed}元(原极速版) \n`;
						}
							
						if ($.jdRed > 0){
							if($.jdRedExpire>0)
								$.message += `【京东红包】${$.jdRed}(将过期${$.jdRedExpire.toFixed(2)})元 \n`;
							else
								$.message += `【京东红包】${$.jdRed}元 \n`;
						}
							
						if ($.jdhRed > 0){
							if($.jdhRedExpire>0)
								$.message += `【健康红包】${$.jdhRed}(将过期${$.jdhRedExpire.toFixed(2)})元 \n`;
							else
								$.message += `【健康红包】${$.jdhRed}元 \n`;
						}
							
						if ($.jdwxRed > 0){
							if($.jdwxRedExpire>0)
								$.message += `【微信小程序】${$.jdwxRed}(将过期${$.jdwxRedExpire.toFixed(2)})元 \n`;
							else
								$.message += `【微信小程序】${$.jdwxRed}元 \n`;
						}
							
						if ($.jdGeneralRed > 0){
							if($.jdGeneralRedExpire>0)
								$.message += `【全平台通用】${$.jdGeneralRed}(将过期${$.jdGeneralRedExpire.toFixed(2)})元 \n`;
							else
								$.message += `【全平台通用】${$.jdGeneralRed}元 \n`;
							
						}
							
					} else {
						console.log(`京东服务器返回空数据`)
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve(data);
			}
		})
	})
}

function getCoupon() {
    return new Promise(resolve => {
        let options = {
            url: `https://wq.jd.com/activeapi/queryjdcouponlistwithfinance?state=1&wxadd=1&filterswitch=1&_=${Date.now()}&sceneval=2&g_login_type=1&callback=jsonpCBKB&g_ty=ls`,
            headers: {
                'authority': 'wq.jd.com',
                "User-Agent": $.UA,
                'accept': '*/*',
                'referer': 'https://wqs.jd.com/',
                'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'cookie': cookie
            },
			timeout: 10000
        }
        $.get(options, async(err, resp, data) => {
            try {				
                data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
                let couponTitle = '';
                let couponId = '';
                // 删除可使用且非超市、生鲜、京贴;
                let useable = data.coupon.useable;
                $.todayEndTime = new Date(new Date(new Date().getTime()).setHours(23, 59, 59, 999)).getTime();
                $.tomorrowEndTime = new Date(new Date(new Date().getTime() + 24 * 60 * 60 * 1000).setHours(23, 59, 59, 999)).getTime();
				$.platFormInfo="";
                for (let i = 0; i < useable.length; i++) {
					//console.log(useable[i]);
                    if (useable[i].limitStr.indexOf('全品类') > -1) {
                        $.beginTime = useable[i].beginTime;
                        if ($.beginTime < new Date().getTime() && useable[i].quota <= 100 && useable[i].coupontype === 1) {                           
							//$.couponEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
                            $.couponName = useable[i].limitStr;
							if (useable[i].platFormInfo) 
								$.platFormInfo = useable[i].platFormInfo;
							
							var decquota=parseFloat(useable[i].quota).toFixed(2);
							var decdisc= parseFloat(useable[i].discount).toFixed(2);
							if (useable[i].quota>useable[i].discount+5 && useable[i].discount<2)
								continue
							$.message += `【全品类券】满${decquota}减${decdisc}元`;
							
							if (useable[i].endTime < $.todayEndTime) {
								$.message += `(今日过期,${$.platFormInfo})\n`;
							} else if (useable[i].endTime < $.tomorrowEndTime) {
								$.message += `(明日将过期,${$.platFormInfo})\n`;
							} else {
								$.message += `(${$.platFormInfo})\n`;
							}
							
                        }
                    }
					if (useable[i].couponTitle.indexOf('运费券') > -1 && useable[i].limitStr.indexOf('自营商品运费') > -1) {
					    if (!$.YunFeiTitle) {
					        $.YunFeiTitle = useable[i].couponTitle;
					        $.YunFeiQuanEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
					        $.YunFeiQuan += 1;
					    } else {
					        if ($.YunFeiTitle == useable[i].couponTitle) {
					            $.YunFeiQuanEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
					            $.YunFeiQuan += 1;
					        } else {
					            if (!$.YunFeiTitle2)
					                $.YunFeiTitle2 = useable[i].couponTitle;
								
					            if ($.YunFeiTitle2 == useable[i].couponTitle) {
					                $.YunFeiQuanEndTime2 = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
					                $.YunFeiQuan2 += 1;
					            }
					        }

					    }

					}
                    if (useable[i].couponTitle.indexOf('特价版APP活动') > -1 && useable[i].limitStr=='仅可购买活动商品') {						
                        $.beginTime = useable[i].beginTime;
                        if ($.beginTime < new Date().getTime() && useable[i].coupontype === 1) {                            
							if (useable[i].platFormInfo) 
								$.platFormInfo = useable[i].platFormInfo;
							var decquota=parseFloat(useable[i].quota).toFixed(2);
							var decdisc= parseFloat(useable[i].discount).toFixed(2);
							
							$.message += `【特价版券】满${decquota}减${decdisc}元`;
							
							if (useable[i].endTime < $.todayEndTime) {
								$.message += `(今日过期,${$.platFormInfo})\n`;
							} else if (useable[i].endTime < $.tomorrowEndTime) {
								$.message += `(明日将过期,${$.platFormInfo})\n`;
							} else {
								$.message += `(${$.platFormInfo})\n`;
							}
							
                        }

                    }
                    //8是支付券， 7是白条券
                    if (useable[i].couponStyle == 7 || useable[i].couponStyle == 8) {
                        $.beginTime = useable[i].beginTime;
                        if ($.beginTime > new Date().getTime() || useable[i].quota > 50 || useable[i].coupontype != 1) {
                            continue;
                        }
                        
                        if (useable[i].couponStyle == 8) {
                            $.couponType = "支付立减";
                        }else{
							$.couponType = "白条优惠";
						}
						if(useable[i].discount<useable[i].quota)
							$.message += `【${$.couponType}】满${useable[i].quota}减${useable[i].discount}元`;
						else
							$.message += `【${$.couponType}】立减${useable[i].discount}元`;
                        if (useable[i].platFormInfo) 
                            $.platFormInfo = useable[i].platFormInfo;                            
                        
                        //$.couponEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
						
                        if (useable[i].endTime < $.todayEndTime) {
                            $.message += `(今日过期,${$.platFormInfo})\n`;
                        } else if (useable[i].endTime < $.tomorrowEndTime) {
                            $.message += `(明日将过期,${$.platFormInfo})\n`;
                        } else {
                            $.message += `(${$.platFormInfo})\n`;
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            }
            finally {
                resolve();
            }
        })
    })
}

function jdfruitRequest(function_id, body = {}, timeout = 1000) {
	return new Promise(resolve => {
		setTimeout(() => {
			$.get(taskfruitUrl(function_id, body), (err, resp, data) => {
				try {
					if (err) {
						console.log('\n东东农场: API查询请求失败 ‼️‼️')
						console.log(JSON.stringify(err));
						console.log(`function_id:${function_id}`)
						$.logErr(err);
					} else {
						if (safeGet(data)) {							
							data = JSON.parse(data);
							if (data.code=="400"){
								console.log('东东农场: '+data.message);
								llgeterror = true;
							}
							else
								$.JDwaterEveryDayT = data.firstWaterInit.totalWaterTimes;
						}
					}
				} catch (e) {
					$.logErr(e, resp);
				}
				finally {
					resolve(data);
				}
			})
		}, timeout)
	})
}

async function getjdfruitinfo() {
    if (EnableJdFruit) {
        llgeterror = false;

        //await jdfruitRequest('taskInitForFarm', {
        //    "version": 14,
        //    "channel": 1,
        //    "babelChannel": "120"
        //});
		//
		//if (llgeterror)
		//	return
		//
        await fruitinfo();
        if (llgeterror) {
            console.log(`东东农场API查询失败,等待10秒后再次尝试...`)
            await $.wait(10 * 1000);
            await fruitinfo();
        }
        if (llgeterror) {
            console.log(`东东农场API查询失败,有空重启路由器换个IP吧.`)
        }

    }
	return;
}

async function getjdfruit() {
	return new Promise(resolve => {
		const option = {
			url: `${JD_API_HOST}?functionId=initForFarm`,
			body: `body=${escape(JSON.stringify({"version":4}))}&appid=wh5&clientVersion=9.1.0`,
			headers: {
				"accept": "*/*",
				"accept-encoding": "gzip, deflate, br",
				"accept-language": "zh-CN,zh;q=0.9",
				"cache-control": "no-cache",
				"cookie": cookie,
				"origin": "https://home.m.jd.com",
				"pragma": "no-cache",
				"referer": "https://home.m.jd.com/myJd/newhome.action",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-site",
				"User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
				"Content-Type": "application/x-www-form-urlencoded"
			},
			timeout: 10000
		};
		$.post(option, (err, resp, data) => {
			try {
				if (err) {
					if(!llgeterror){
						console.log('\n东东农场: API查询请求失败 ‼️‼️');
						console.log(JSON.stringify(err));
					}
					llgeterror = true;
				} else {
					llgeterror = false;
					if (safeGet(data)) {
						$.farmInfo = JSON.parse(data)
							if ($.farmInfo.farmUserPro) {
								$.JdFarmProdName = $.farmInfo.farmUserPro.name;
								$.JdtreeEnergy = $.farmInfo.farmUserPro.treeEnergy;
								$.JdtreeTotalEnergy = $.farmInfo.farmUserPro.treeTotalEnergy;
								$.treeState = $.farmInfo.treeState;
								let waterEveryDayT = $.JDwaterEveryDayT;
								let waterTotalT = ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy) / 10; //一共还需浇多少次水
								let waterD = Math.ceil(waterTotalT / waterEveryDayT);

								$.JdwaterTotalT = waterTotalT;
								$.JdwaterD = waterD;
							}
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve();
			}
		})
	})
}

function taskfruitUrl(function_id, body = {}) {
  return {
    url: `${JD_API_HOST}?functionId=${function_id}&body=${encodeURIComponent(JSON.stringify(body))}&appid=wh5`,
    headers: {
      "Host": "api.m.jd.com",
      "Accept": "*/*",
      "Origin": "https://carry.m.jd.com",
      "Accept-Encoding": "gzip, deflate, br",
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      "Accept-Language": "zh-CN,zh-Hans;q=0.9",
      "Referer": "https://carry.m.jd.com/",
      "Cookie": cookie
    },
    timeout: 10000
  }
}

function safeGet(data) {
	try {
		if (typeof JSON.parse(data) == "object") {
			return true;
		}
	} catch (e) {
		console.log(e);
		console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
		return false;
	}
}

function cash() {
	if (!EnableJdSpeed)
		return;
	return new Promise(resolve => {
		$.get(taskcashUrl('MyAssetsService.execute', {
				"method": "userCashRecord",
				"data": {
					"channel": 1,
					"pageNum": 1,
					"pageSize": 20
				}
			}),
			async(err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(`cash API请求失败，请检查网路重试`)
				} else {					
					if (safeGet(data)) {
						data = JSON.parse(data);
						if (data.data.goldBalance)
							$.JDtotalcash = data.data.goldBalance;
						else
							console.log(`领现金查询失败，服务器没有返回具体值.`)
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve(data);
			}
		})
	})
}

function taskcashUrl(functionId, body = {}) {
	const struuid = randomString(16);
	let nowTime = Date.now();
	let _0x7683x5 = `${"lite-android&"}${JSON["stringify"](body)}${"&android&3.1.0&"}${functionId}&${nowTime}&${struuid}`;
	let _0x7683x6 = "12aea658f76e453faf803d15c40a72e0";
	const _0x7683x7 = $["isNode"]() ? require("crypto-js") : CryptoJS;
	let sign = _0x7683x7.HmacSHA256(_0x7683x5, _0x7683x6).toString();
	let strurl=JD_API_HOST+"api?functionId="+functionId+"&body="+`${escape(JSON["stringify"](body))}&appid=lite-android&client=android&uuid=`+struuid+`&clientVersion=3.1.0&t=${nowTime}&sign=${sign}`;
	return {
		url: strurl,
		headers: {
			'Host': "api.m.jd.com",
			'accept': "*/*",
			'kernelplatform': "RN",
			'user-agent': "JDMobileLite/3.1.0 (iPad; iOS 14.4; Scale/2.00)",
			'accept-language': "zh-Hans-CN;q=1, ja-CN;q=0.9",
			'Cookie': cookie
		},
		timeout: 10000
	}
}

function GetJoyRuninginfo() {
	if (!EnableJoyRun)
		return;
	
    const headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "Connection": "keep-alive",
        "Content-Length": "376",
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": cookie,
        "Host": "api.m.jd.com",
        "Origin": "https://h5platform.jd.com",
        "Referer": "https://h5platform.jd.com/",
        "User-Agent": `jdpingou;iPhone;4.13.0;14.4.2;${randomString(40)};network/wifi;model/iPhone10,2;appBuild/100609;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/${Math.random * 98 + 1};pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
		}
	var DateToday = new Date();
	const body = {
        'linkId': 'L-sOanK_5RJCz7I314FpnQ',
		'isFromJoyPark':true,
		'joyLinkId':'LsQNxL7iWDlXUs6cFl-AAg'
    };
    const options = {
        url: `https://api.m.jd.com/?functionId=runningPageHome&body=${encodeURIComponent(JSON.stringify(body))}&t=${DateToday.getTime()}&appid=activities_platform&client=ios&clientVersion=3.9.2`,
        headers,
    }
	return new Promise(resolve => {
        $.get(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`GetJoyRuninginfo API请求失败，请检查网路重试`)
                } else {
                    if (data) {
						//console.log(data);
                        data = JSON.parse(data);
                        if (data.data.runningHomeInfo.prizeValue) {
							$.JoyRunningAmount=data.data.runningHomeInfo.prizeValue * 1;							
						}
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            }
            finally {
                resolve(data)
            }
        })
    })
}
	
function randomString(e) {
	e = e || 32;
	let t = "0123456789abcdef",
	a = t.length,
	n = "";
	for (let i = 0; i < e; i++)
		n += t.charAt(Math.floor(Math.random() * a));
	return n
}

Date.prototype.Format = function (fmt) {
	var e,
	n = this,
	d = fmt,
	l = {
		"M+": n.getMonth() + 1,
		"d+": n.getDate(),
		"D+": n.getDate(),
		"h+": n.getHours(),
		"H+": n.getHours(),
		"m+": n.getMinutes(),
		"s+": n.getSeconds(),
		"w+": n.getDay(),
		"q+": Math.floor((n.getMonth() + 3) / 3),
		"S+": n.getMilliseconds()
	};
	/(y+)/i.test(d) && (d = d.replace(RegExp.$1, "".concat(n.getFullYear()).substr(4 - RegExp.$1.length)));
	for (var k in l) {
		if (new RegExp("(".concat(k, ")")).test(d)) {
			var t,
			a = "S+" === k ? "000" : "00";
			d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[k] : ("".concat(a) + l[k]).substr("".concat(l[k]).length))
		}
	}
	return d;
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
function timeFormat(time) {
	let date;
	if (time) {
		date = new Date(time)
	} else {
		date = new Date();
	}
	return date.getFullYear() + '-' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() >= 10 ? date.getDate() : '0' + date.getDate());
}


function GetDateTime(date) {

	var timeString = "";

	var timeString = date.getFullYear() + "-";
	if ((date.getMonth() + 1) < 10)
		timeString += "0" + (date.getMonth() + 1) + "-";
	else
		timeString += (date.getMonth() + 1) + "-";

	if ((date.getDate()) < 10)
		timeString += "0" + date.getDate() + " ";
	else
		timeString += date.getDate() + " ";

	if ((date.getHours()) < 10)
		timeString += "0" + date.getHours() + ":";
	else
		timeString += date.getHours() + ":";

	if ((date.getMinutes()) < 10)
		timeString += "0" + date.getMinutes() + ":";
	else
		timeString += date.getMinutes() + ":";

	if ((date.getSeconds()) < 10)
		timeString += "0" + date.getSeconds();
	else
		timeString += date.getSeconds();

	return timeString;
}

async function getuserinfo() {
	var body=[{"pin": "$cooMrdGatewayUid$"}];
	var ua = `jdapp;iPhone;${random(["11.1.0", "10.5.0", "10.3.6"])};${random(["13.5", "14.0", "15.0"])};${uuidRandom()};network/wifi;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone11,6;addressid/7565095847;supportBestPay/0;appBuild/167541;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`;

    let config = {
        url: 'https://lop-proxy.jd.com/JingIntegralApi/userAccount',
        body: JSON.stringify(body),
        headers: {
            "host": "lop-proxy.jd.com",
            "jexpress-report-time": Date.now().toString(),
            "access": "H5",
            "source-client": "2",
            "accept": "application/json, text/plain, */*",
            "d_model": "iPhone11,6",
            "accept-encoding": "gzip",
            "lop-dn": "jingcai.jd.com",
            "user-agent": ua,
            "partner": "",
            "screen": "375*812",
            "cookie": cookie,
            "x-requested-with": "XMLHttpRequest",
            "version": "1.0.0",
            "uuid": randomNumber(10),
            "clientinfo": "{\"appName\":\"jingcai\",\"client\":\"m\"}",
            "d_brand": "iPhone",
            "appparams": "{\"appid\":158,\"ticket_type\":\"m\"}",
            "sdkversion": "1.0.7",
            "area": area(),
            "client": "iOS",
            "referer": "https://jingcai-h5.jd.com/",
            "eid": "",
            "osversion": random(["13.5", "14.0", "15.0"]),
            "networktype": "wifi",
            "jexpress-trace-id": uuid(),
            "origin": "https://jingcai-h5.jd.com",
            "app-key": "jexpress",
            "event-id": uuid(),
            "clientversion": random(["11.1.0", "10.5.0", "10.3.6"]),
            "content-type": "application/json;charset=utf-8",
            "build": "167541",
            "biz-type": "service-monitor",
            "forcebot": "0"
        }
    }
    return new Promise(resolve => {
        $.post(config, async(err, resp, data) => {
            try {
                //console.log(data)
                if (err) {
                    console.log(err)
                } else {					
                    data = JSON.parse(data);
                }
            } catch (e) {
                $.logErr(e, resp)
            }
            finally {
                resolve(data || '');
            }
        })
    })
}
function dwappinfo() {
    let ts = Date.now();
    let opt = {
        url: `https://dwapp.jd.com/user/dwSignInfo`,
        body: JSON.stringify({ "t": ts, "channelSource": "txzs", "encStr": CR.MD5(ts + 'e9c398ffcb2d4824b4d0a703e38yffdd').toString() }),
        headers: {
            'Origin': 'https://txsm-m.jd.com',
            'Content-Type': 'application/json',
            'User-Agent': $.UA,
            'Cookie': cookie
        }
    }
    return new Promise(async (resolve) => {
        $.post(opt, async (err, resp, data) => {
            let ccc = '';
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`dwappinfo 请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    if (data.code == 200) {
                        ccc = data.data.balanceNum;
                    } else {
                        console.log(data.msg);
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(ccc);
            }
        })
    })
}
function dwappexpire() {
    let opt = {
        url: `https://dwapp.jd.com/user/scoreDetail?pageNo=1&pageSize=10&scoreType=16&t=1637`,
        headers: {

            'User-Agent': $.UA,
            'Cookie': cookie
        }
    }
    return new Promise(async (resolve) => {
        $.get(opt, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(` API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data)
                    if (data.code == 200) {
                        data = data.data.userOperateList.length !== 0 ? moment(new Date(data.data.userOperateList[0].time)).format('M/D') : '';
                    } else {
                        //console.log(data.msg);
						data = '';
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}
function checkplus() {
    let opt = {
        url: `https://api.m.jd.com/api?functionId=user_getUserInfo_v2`,
		body: 'appid=plus_business&loginType=2&loginWQBiz=&scval=&body=%7B%22contentType%22%3A%221_2_3_4_5_8_9_11_12_16%22%2C%22qids%22%3A%226_2_5_18_1_7_9_11_12_14_16_17_25_38%22%2C%22checkLevel%22%3A1%2C%22signType%22%3A1003%7D',
        headers: {
            'User-Agent': $.UA,
            'Cookie': cookie,
			'Origin': 'https://plus.m.jd.com'
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
                    if (data.code == 1711000) {
                        $.isPlusVip = data.rs.plusUserBaseInfo.endDays ? true : false;
						//console.log($.isPlusVip)
                    } else {
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}
function area() {
    let i = getRand(1, 30)
        let o = getRand(70, 3000)
        let x = getRand(900, 60000)
        let g = getRand(600, 30000)
        let a = i + '_' + o + '_' + x + '_' + g;
    return a
};
function getRand(min, max) {
    return parseInt(Math.random() * (max - min)) + min;
};
function uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";
    var uuid = s.join("");
    return uuid;
};
function uuidRandom() {
    return Math.random().toString(16).slice(2, 10) +
    Math.random().toString(16).slice(2, 10) +
    Math.random().toString(16).slice(2, 10) +
    Math.random().toString(16).slice(2, 10) +
    Math.random().toString(16).slice(2, 10);
}
function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function randomNumber(len) {
    let chars = '0123456789';
    let maxPos = chars.length;
    let str = '';
    for (let i = 0; i < len; i++) {
        str += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return Date.now() + str;
}
(function(_0x27b579,_0x4c705c){const _0x3d040a={_0x4458aa:0x155,_0x335007:'vmPA',_0x1a244b:0x18b,_0x29e392:'!f&f',_0x43046e:0x1d5,_0x54871d:'*(na',_0x55f7e9:0x16d,_0x3ff60e:'l[PI',_0x440cef:0x1dc,_0x1ed5c6:'#1ki',_0x3f20de:0x1b8,_0x5c87e1:'e5US',_0xa28044:0x18a,_0x2bd6d2:'vmPA',_0x58c32f:0xf9,_0x4816ec:'s$Ag',_0x4e108e:0xfa,_0x348a5c:'5]j)',_0x2620ef:0x1ec,_0x4eda25:'hEE]',_0x3aab85:0x108,_0x4361c1:'5Jt4'},_0x5b3b24=_0x2636,_0xa93210=_0x2636,_0x2450ec=_0x2636,_0x377639=_0x2636,_0x542e82=_0x2636,_0x52abf9=_0x27b579();while(!![]){try{const _0x56e9cd=-parseInt(_0x5b3b24(_0x3d040a._0x4458aa,_0x3d040a._0x335007))/(0x1755*0x1+-0x19e*-0x12+-0x3470)*(-parseInt(_0xa93210(_0x3d040a._0x1a244b,_0x3d040a._0x29e392))/(0x1*0xa03+0x1*-0x521+-0x4e0))+-parseInt(_0x5b3b24(_0x3d040a._0x43046e,_0x3d040a._0x54871d))/(0x17b7*0x1+-0x15c5*0x1+-0x1ef)*(-parseInt(_0x5b3b24(_0x3d040a._0x55f7e9,_0x3d040a._0x3ff60e))/(0x1e4f+0xed4+-0x2d1f))+-parseInt(_0x377639(_0x3d040a._0x440cef,_0x3d040a._0x1ed5c6))/(0x2321+-0x2221+-0xfb*0x1)+-parseInt(_0x5b3b24(_0x3d040a._0x3f20de,_0x3d040a._0x5c87e1))/(0x22a7+-0xd60+-0x1*0x1541)+parseInt(_0x542e82(_0x3d040a._0xa28044,_0x3d040a._0x2bd6d2))/(-0x145d+-0x2*0x31+-0x2*-0xa63)*(-parseInt(_0x377639(_0x3d040a._0x58c32f,_0x3d040a._0x4816ec))/(-0x1*0x21c1+-0xc4d*0x2+0x3a63))+parseInt(_0xa93210(_0x3d040a._0x4e108e,_0x3d040a._0x348a5c))/(0x1f7*0xb+0x171e+-0x2*0x1659)+parseInt(_0xa93210(_0x3d040a._0x2620ef,_0x3d040a._0x4eda25))/(-0x1fcb+0x26d2+-0x6fd)*(parseInt(_0x5b3b24(_0x3d040a._0x3aab85,_0x3d040a._0x4361c1))/(0x226f+-0x2cf*0x6+-0x118a*0x1));if(_0x56e9cd===_0x4c705c)break;else _0x52abf9['push'](_0x52abf9['shift']());}catch(_0x32b968){_0x52abf9['push'](_0x52abf9['shift']());}}}(_0x466d,0x79262+0x1ed*-0x265+-0x4c63*-0x3),(function(_0x16e617,_0x2c2f9e,_0x531132,_0x469ed2,_0x1c8a40,_0x55ad3f,_0x583ad9){const _0xd5f747={_0x24d207:0x10b,_0x4bc8b2:'5]j)',_0x532bfe:0xc2,_0x201f67:'WlZ[',_0xc45f0e:0xf1,_0x2c7f26:'!f&f'},_0x3e1ac5={_0x488a5d:0xee,_0x2024e8:'jWFo',_0x4bda10:0x1d4,_0x296c50:'wC]m',_0x4ec7d9:0xcb,_0x1ffe77:'@UMo',_0x26a203:0x187,_0x4994a3:'I[L2',_0x4f0d39:0xe4,_0x5629e8:'cOJH',_0x4824de:0x7e,_0x52535b:'3ObZ',_0xdf7628:0x11e,_0x3eeefa:'UO4L',_0x17a183:0x1c3,_0x4c6e93:'Vy^h',_0x2eac1b:0x188,_0x20c408:'s$Ag',_0x541d04:0x163,_0x3141d8:'%Ota',_0x3f18f4:0xc5,_0x29ec1c:'tFFJ',_0x53a0a1:0x178,_0x45eace:'!f&f'},_0x70d6b9={_0x7ebde3:0xd3,_0x3390cc:'^CU&',_0x4d986f:0x1e8,_0x1d21ae:'jWFo',_0x5993c9:0x110,_0x46b70b:'DaAE',_0x1b903e:0xe7,_0x57e219:'5zYW',_0x542255:0x156,_0x14c788:'*(na',_0x1ea3b9:0x168,_0x58aff5:'^Qzu'},_0x5bc2f2=(function(){let _0x1b00d1=!![];return function(_0x55717f,_0xdaa021){const _0x354861={_0x40d615:0x20f,_0x4cb892:'^Qzu'},_0x1f9762=_0x1b00d1?function(){const _0x366b04=_0x2636;if(_0xdaa021){const _0x38f05f=_0xdaa021[_0x366b04(_0x354861._0x40d615,_0x354861._0x4cb892)](_0x55717f,arguments);return _0xdaa021=null,_0x38f05f;}}:function(){};return _0x1b00d1=![],_0x1f9762;};}()),_0x2576a0=(function(){let _0x62bdcc=!![];return function(_0x64a39f,_0x2ee044){const _0x38a848={_0x3ed816:0xe0,_0x2120b5:'IbjN'},_0x356279=_0x62bdcc?function(){const _0x1b7089=_0x2636;if(_0x2ee044){const _0x50a788=_0x2ee044[_0x1b7089(_0x38a848._0x3ed816,_0x38a848._0x2120b5)](_0x64a39f,arguments);return _0x2ee044=null,_0x50a788;}}:function(){};return _0x62bdcc=![],_0x356279;};}());return _0x16e617=_0x16e617>>-0x1+-0xec3+0xec6,_0x55ad3f='hs',_0x583ad9='hs',function(_0x532b7f,_0x53afda,_0x465949,_0x492e2b,_0x1af79c){const _0x3341a5={_0x585f78:0xad,_0x46866b:'I[L2',_0x246c0a:0xf0,_0x51e607:'l[PI',_0x300a79:0x1bd,_0x9f66c1:'^Qzu',_0x49e7a1:0x13a,_0x20a971:'WlZ[',_0x4c3f0e:0x1d8,_0x1b4a8a:'%Ota',_0x201dfc:0x12c,_0x4d43e2:'a%S7',_0x18a0f5:0x11a,_0x2a8534:'5zYW'},_0x5a84f2=_0x2636,_0x48f6d0=_0x2636,_0x3ea600=_0x2636,_0x36e1e1=_0x2636,_0x27cb40=_0x2636,_0x59b6fe=_0x5bc2f2(this,function(){const _0x56c5cd=_0x2636,_0x135f10=_0x2636,_0x54a01=_0x2636,_0x5282b2=_0x2636,_0x118560=_0x2636;return _0x59b6fe[_0x56c5cd(_0x70d6b9._0x7ebde3,_0x70d6b9._0x3390cc)]()[_0x135f10(_0x70d6b9._0x4d986f,_0x70d6b9._0x1d21ae)]('(((.+)+)+)+$')[_0x54a01(_0x70d6b9._0x5993c9,_0x70d6b9._0x46b70b)]()[_0x5282b2(_0x70d6b9._0x1b903e,_0x70d6b9._0x57e219)](_0x59b6fe)[_0x118560(_0x70d6b9._0x542255,_0x70d6b9._0x14c788)](_0x135f10(_0x70d6b9._0x1ea3b9,_0x70d6b9._0x58aff5));});_0x59b6fe(),(function(){_0x2576a0(this,function(){const _0x1ac377=_0x2636,_0x181824=_0x2636,_0x2f77c3=_0x2636,_0x21911f=_0x2636,_0xb1a5de=_0x2636,_0x4f8246=new RegExp(_0x1ac377(_0x3341a5._0x585f78,_0x3341a5._0x46866b)),_0x3b43f8=new RegExp(_0x1ac377(_0x3341a5._0x246c0a,_0x3341a5._0x51e607),'i'),_0x40425e=_0x3b9115(_0x181824(_0x3341a5._0x300a79,_0x3341a5._0x9f66c1));!_0x4f8246[_0x1ac377(_0x3341a5._0x49e7a1,_0x3341a5._0x20a971)](_0x40425e+_0xb1a5de(_0x3341a5._0x4c3f0e,_0x3341a5._0x1b4a8a))||!_0x3b43f8[_0x1ac377(_0x3341a5._0x201dfc,_0x3341a5._0x4d43e2)](_0x40425e+_0x2f77c3(_0x3341a5._0x18a0f5,_0x3341a5._0x2a8534))?_0x40425e('0'):_0x3b9115();})();}());const _0x396fdf=_0x52859d;_0x492e2b=_0x5a84f2(_0x3e1ac5._0x488a5d,_0x3e1ac5._0x2024e8),_0x55ad3f=_0x492e2b+_0x55ad3f,_0x1af79c='up',_0x583ad9+=_0x1af79c,_0x55ad3f=_0x465949(_0x55ad3f),_0x583ad9=_0x465949(_0x583ad9),_0x465949=-0x1d55+-0x6f2*0x1+0x2447;const _0xaff466=_0x532b7f();while(!![]&&--_0x469ed2+_0x53afda){try{_0x492e2b=-parseInt(_0x396fdf(0x1101+0x272*0x4+-0x195c,_0x48f6d0(_0x3e1ac5._0x4bda10,_0x3e1ac5._0x296c50)))/(-0x22*-0x64+0x17*0x92+-0x1d*0xe9)+parseInt(_0x396fdf(0x17*0xb3+-0x475*0x7+0x105a,_0x5a84f2(_0x3e1ac5._0x4ec7d9,_0x3e1ac5._0x1ffe77)))/(0x1e4f*0x1+-0x1790*0x1+-0x6bd)*(parseInt(_0x396fdf(0x1aa7*0x1+-0x86*0x7+-0x15ba,_0x48f6d0(_0x3e1ac5._0x26a203,_0x3e1ac5._0x4994a3)))/(0x956+0x66a*-0x3+-0x1*-0x9eb))+parseInt(_0x396fdf(0x3*0x89a+0x93*0x23+-0x2c7f,_0x27cb40(_0x3e1ac5._0x4f0d39,_0x3e1ac5._0x5629e8)))/(-0x914+0xb30+0x43*-0x8)+parseInt(_0x396fdf(-0x228*-0xd+0x193f*0x1+-0x33ae,']&1e'))/(0x1d7*0xd+0x88*0x20+0x6d1*-0x6)+parseInt(_0x396fdf(0x1a3*-0x7+-0x494*-0x7+-0x1*0x12bf,_0x5a84f2(_0x3e1ac5._0x4824de,_0x3e1ac5._0x52535b)))/(0xc64+-0x9d*-0x29+0xc81*-0x3)*(parseInt(_0x396fdf(0x9*-0x284+-0x1*0x2263+0x86b*0x7,_0x48f6d0(_0x3e1ac5._0xdf7628,_0x3e1ac5._0x3eeefa)))/(0x133*-0xa+0x2594*0x1+-0x198f))+parseInt(_0x396fdf(0x151b+-0x1*0x1f26+0xb97,_0x5a84f2(_0x3e1ac5._0x17a183,_0x3e1ac5._0x4c6e93)))/(0x5*0x1df+0x6d*0x7+-0xc4e)*(parseInt(_0x396fdf(0x24a5*-0x1+-0x1b89+0x420e,_0x36e1e1(_0x3e1ac5._0x2eac1b,_0x3e1ac5._0x20c408)))/(0x1*-0x263b+0x769*0x2+0x1772))+parseInt(_0x396fdf(0x5*-0x1a1+0x18d5+-0xf1d,_0x48f6d0(_0x3e1ac5._0x541d04,_0x3e1ac5._0x3141d8)))/(-0xaca+0x440+0x694)*(-parseInt(_0x396fdf(0x4*0x4e1+0x2597+0xab*-0x53,_0x27cb40(_0x3e1ac5._0x3f18f4,_0x3e1ac5._0x29ec1c)))/(-0x3fc+-0x11f9+0x1600));}catch(_0x39be5a){_0x492e2b=_0x465949;}finally{_0x1af79c=_0xaff466[_0x55ad3f]();if(_0x16e617<=_0x469ed2)_0x465949?_0x1c8a40?_0x492e2b=_0x1af79c:_0x1c8a40=_0x1af79c:_0x465949=_0x1af79c;else{if(_0x465949==_0x1c8a40[_0x36e1e1(_0x3e1ac5._0x53a0a1,_0x3e1ac5._0x45eace)](/[XRbwUNrdGMAFPTLpVkY=]/g,'')){if(_0x492e2b===_0x53afda){_0xaff466['un'+_0x55ad3f](_0x1af79c);break;}_0xaff466[_0x583ad9](_0x1af79c);}}}}}(_0x531132,_0x2c2f9e,function(_0x480cf6,_0x3da403,_0x4b4e01,_0x39e733,_0x2e4d18,_0x5d10da,_0x32fcb9){const _0x1bec58=_0x2636,_0x29add7=_0x2636,_0x3f7d17=_0x2636;return _0x3da403=_0x1bec58(_0xd5f747._0x24d207,_0xd5f747._0x4bc8b2),_0x480cf6=arguments[0xe1e+-0xe2f*-0x1+0x325*-0x9],_0x480cf6=_0x480cf6[_0x3da403](''),_0x4b4e01=_0x29add7(_0xd5f747._0x532bfe,_0xd5f747._0x201f67),_0x480cf6=_0x480cf6[_0x4b4e01]('v'),_0x39e733=_0x29add7(_0xd5f747._0xc45f0e,_0xd5f747._0x2c7f26),(0x125427+0xd7*-0x22ed+0x1ed623,_0x480cf6[_0x39e733](''));});}(-0x6f*0x3+0x1f01*-0x1+0x2346,-0x46b6d*0x1+0x34b0+0x16121*0x7,_0x4c6639,0x134c+-0x1e73*0x1+-0x115*-0xb),_0x4c6639));async function queryScores(){const _0x4d779b={_0x28da1f:0x1ba,_0x248dda:'l[PI',_0x219a1f:0x88,_0x5a9915:'6Lva',_0x15490a:0xcd,_0x292662:'*(na',_0x248f92:0x107,_0xb85b6c:'*(na',_0x5c7c9f:0x102,_0x359b98:'8i99',_0xf12ad8:0xd4,_0x317850:'gQR7',_0x4ec77b:0x217,_0x49ffa3:'x4g*',_0x59c6b4:0xbb,_0x264965:'@Yt8',_0x50ce04:0x105,_0x20d12f:'a8(S',_0x1d2140:0xa4,_0x376039:'wqn6',_0x3d74b6:0x1fc,_0x265c75:'x4g*',_0x34d8aa:0xe3,_0x145f43:'8WM4',_0x3d88ab:0x9f,_0x17ab9c:'Vy^h'},_0x4b8c49={_0x5c8702:0x190,_0x479d86:'5]j)',_0xf55fe8:0x138,_0x1cdab8:'5Jt4',_0x4d2a3d:0x145,_0x3acdbd:'^CU&',_0x597d07:0x1d2,_0x585ad3:'gQR7',_0x13bbd4:0x1ee,_0x13d357:'*(na'},_0x1fb769=_0x2636,_0x2d1df8=_0x2636,_0x44be01=_0x2636,_0x31981a=_0x2636,_0x3c2918=_0x2636,_0x33f0a4=_0x52859d,_0x588c3a={'wfQGi':function(_0x4ccda7,_0x1af0c5){return _0x4ccda7==_0x1af0c5;},'EXzMK':function(_0xa43517){return _0xa43517();},'QsHOC':function(_0x4d708f,_0x51dcb7){return _0x4d708f===_0x51dcb7;},'ucHSk':_0x33f0a4(-0x772+-0x1ba1*-0x1+-0x4bd*0x4,_0x1fb769(_0x4d779b._0x28da1f,_0x4d779b._0x248dda)),'OTHgq':_0x33f0a4(-0x77d+-0x3fd+0xd2a,_0x2d1df8(_0x4d779b._0x219a1f,_0x4d779b._0x5a9915)),'FzFtr':_0x33f0a4(0x2256+0x1cf*-0x2+-0x1*0x1d23,_0x2d1df8(_0x4d779b._0x15490a,_0x4d779b._0x292662)),'vYDOM':_0x33f0a4(-0x2638+0x1d91+0x2*0x53f,_0x2d1df8(_0x4d779b._0x248f92,_0x4d779b._0xb85b6c)),'JiroP':function(_0x9efe13,_0x30338e){return _0x9efe13(_0x30338e);},'mTsfI':_0x33f0a4(0xc1+0x161a+0x2ab*-0x8,_0x31981a(_0x4d779b._0x5c7c9f,_0x4d779b._0x359b98))};let _0x356363='',_0x4d29e6={'appId':_0x588c3a[_0x33f0a4(0x1319*0x1+0x3e0*-0x2+-0xa04,_0x2d1df8(_0x4d779b._0xf12ad8,_0x4d779b._0x317850))],'fn':_0x588c3a[_0x33f0a4(-0x1913+-0xc12*0x1+0x1372*0x2,_0x44be01(_0x4d779b._0x4ec77b,_0x4d779b._0x49ffa3))],'body':{},'apid':_0x588c3a[_0x33f0a4(0xeeb+-0x34*-0x9f+-0x1*0x2dcc,_0x3c2918(_0x4d779b._0x59c6b4,_0x4d779b._0x264965))],'user':$[_0x33f0a4(0x1949+0x986*-0x3+0x4eb,_0x31981a(_0x4d779b._0x50ce04,_0x4d779b._0x20d12f))],'code':0x0,'ua':$['UA']};body=await _0x588c3a[_0x33f0a4(-0x19*0x103+-0x23*-0xf9+-0x70f*0x1,_0x3c2918(_0x4d779b._0x1d2140,_0x4d779b._0x376039))](_0x42cb93,_0x4d29e6);let _0x485233={'url':_0x33f0a4(-0x1846+0x4*-0x753+0x36fe*0x1,_0x31981a(_0x4d779b._0x3d74b6,_0x4d779b._0x265c75))+body+_0x33f0a4(-0x1c3a+-0x2246*0x1+-0x66c*-0xa,_0x31981a(_0x4d779b._0x34d8aa,_0x4d779b._0x145f43)),'headers':{'Cookie':cookie,'User-Agent':$['UA'],'Referer':_0x588c3a[_0x33f0a4(0x631*-0x2+-0xfcd+0x1dd5,_0x31981a(_0x4d779b._0x3d88ab,_0x4d779b._0x17ab9c))]}};return new Promise(_0x28b564=>{const _0x522609={_0x24bfa2:0xd0,_0x23c5f6:'8U1n',_0x76f28c:0x1ca,_0x14dcd4:'s$Ag',_0x2d1ace:0x8f,_0x42977c:'5aVI',_0x58db9:0x214,_0x4b9b73:'8WM4',_0x553a58:0x1cb,_0xa6b61b:'fRn@',_0x1cd697:0x21d,_0x495a64:'hEE]',_0xb98535:0x1c1,_0xa341d:0x196},_0x13a7d9={_0x234ee7:0x1d1,_0x309288:'g#So'},_0x5ae98c=_0x2636,_0x5eff13=_0x2636,_0x31d26f=_0x2636,_0x26fcf3=_0x2636,_0x2afb9d=_0x2636,_0x42678b=_0x33f0a4,_0xb5310b={'kFAsW':function(_0x4ba93c,_0xc0ba8f){const _0x100038=_0x52859d;return _0x588c3a[_0x100038(-0x5*-0x731+0x2275+-0x1*0x44ad,'bkWa')](_0x4ba93c,_0xc0ba8f);},'jtiYq':function(_0x3be241){const _0x36606e=_0x2636,_0x1168a3=_0x52859d;return _0x588c3a[_0x1168a3(-0x20c*0xc+0x934+0x10e7,_0x36606e(_0x13a7d9._0x234ee7,_0x13a7d9._0x309288))](_0x3be241);}};_0x588c3a[_0x42678b(0xd29+0x2*-0xf52+0x1349,_0x5ae98c(_0x4b8c49._0x5c8702,_0x4b8c49._0x479d86))](_0x588c3a[_0x42678b(0x4*0x119+0x1*-0xf05+-0x3*-0x410,_0x5eff13(_0x4b8c49._0xf55fe8,_0x4b8c49._0x1cdab8))],_0x588c3a[_0x42678b(0xf59+-0x16d6+-0x2*-0x455,_0x5eff13(_0x4b8c49._0x4d2a3d,_0x4b8c49._0x3acdbd))])?$[_0x42678b(0xd14+-0x1*0x59+0xae7*-0x1,_0x5eff13(_0x4b8c49._0x597d07,_0x4b8c49._0x585ad3))](_0x485233,async(_0x5f32df,_0x117999,_0x3ab19a)=>{const _0x4ec606=_0x2636,_0x5a3b18=_0x2636,_0x1c67bd=_0x2636,_0xd82bd4=_0x2636,_0x1cb37c=_0x2636,_0x97ecc0=_0x42678b;try{const _0x3f39e2=JSON[_0x97ecc0(0x1*0x2342+0x1af4+-0x3d0d*0x1,_0x4ec606(_0x522609._0x24bfa2,_0x522609._0x23c5f6))](_0x3ab19a);_0xb5310b[_0x97ecc0(-0x20dd*-0x1+-0xf36+0x577*-0x3,_0x4ec606(_0x522609._0x76f28c,_0x522609._0x14dcd4))](_0x3f39e2[_0x97ecc0(-0x9*0x446+0x1*-0x106c+0x383e,_0x5a3b18(_0x522609._0x2d1ace,_0x522609._0x42977c))],-0x411+-0x1*-0x3e5+-0x1*-0x414)&&($[_0x97ecc0(0x5e4+-0xf7*0x22+0x1cb7*0x1,_0xd82bd4(_0x522609._0x58db9,_0x522609._0x4b9b73))]=_0x3f39e2['rs'][_0x97ecc0(0x1aaf+-0x131d+-0x1*0x637,_0xd82bd4(_0x522609._0x553a58,_0x522609._0xa6b61b))][_0x97ecc0(0x7b*-0x3+-0x25af*-0x1+-0x35*0xa7,_0x1cb37c(_0x522609._0x1cd697,_0x522609._0x495a64))]);}catch(_0x13f386){$[_0x97ecc0(-0x9de+0x23*-0xca+0x2745,_0x1c67bd(_0x522609._0xb98535,_0x522609._0x4b9b73))](_0x13f386,_0x117999);}finally{_0xb5310b[_0x97ecc0(-0x25c6+-0x114+-0xe*-0x2e5,_0x1c67bd(_0x522609._0xa341d,_0x522609._0x495a64))](_0x28b564);}}):_0x3967cd[_0x42678b(-0x4d7+0xf02+-0x8d4,_0x26fcf3(_0x4b8c49._0x13bbd4,_0x4b8c49._0x13d357))](_0x5e41e8,_0x5a0c60);});}function _0x52859d(_0xfd18e0,_0x226bf6){const _0x2f7e52={_0x235efb:0x17f,_0x584d20:'wqn6',_0x154b65:0x218,_0x138712:'I[L2',_0x140d34:0x1a2,_0x4e3b92:'8i99',_0x12e852:0xda,_0x4d510a:'^w3t',_0x37cce9:0xd5,_0x311725:'l[PI',_0xdfc8bb:0xaa,_0x41a71b:'UO4L'},_0x5485b6={_0x2751a2:0x1be,_0x5f190c:'7Qxb',_0x51b6ff:0x13c,_0x2dc413:'gQR7',_0x1b7fc9:0xa6,_0x27a121:'UO4L',_0x5c1ad8:0x91,_0x697882:'a%S7'},_0x5264fb=_0x4c6639();return _0x52859d=function(_0x1e249f,_0x1ac392){const _0x115970={_0x40ef7e:0x151,_0x387995:'vmPA',_0x121b3b:0x16a,_0x2a5595:'a8(S',_0x2be449:0xa0,_0x2f9f9e:'!f&f',_0x54c595:0x1ab,_0x3434aa:'^CU&',_0x514029:0x207,_0x454dd0:'5aVI',_0x42dc0b:0x192,_0x5c949f:'s$Ag',_0x57d534:0xac,_0x463c81:'I[L2'},_0x5673fb=_0x2636,_0x5b3c55=_0x2636,_0x4df2d8=_0x2636,_0x4393fe=_0x2636,_0x4ebb50=_0x2636;_0x1e249f=_0x1e249f-(-0xd7*-0x2+-0xb92+0x45*0x29);let _0x109c7d=_0x5264fb[_0x1e249f];if(_0x52859d[_0x5673fb(_0x2f7e52._0x235efb,_0x2f7e52._0x584d20)]===undefined){var _0x2b40a5=function(_0x37c6fc){const _0x4d1175=_0x2636,_0x52fcf2=_0x2636,_0x15dfe3=_0x2636,_0x5af90a=_0x2636,_0x591a9e=_0x2636,_0x2a171b=_0x4d1175(_0x115970._0x40ef7e,_0x115970._0x387995);let _0x410c3b='',_0x3e2d29='';for(let _0xf1cef3=-0x167a+0x903*-0x4+0x3a86,_0x2167f0,_0x3ccdeb,_0x4c3d8a=0x5d*-0x34+-0x5a1+0x1*0x1885;_0x3ccdeb=_0x37c6fc[_0x4d1175(_0x115970._0x121b3b,_0x115970._0x2a5595)](_0x4c3d8a++);~_0x3ccdeb&&(_0x2167f0=_0xf1cef3%(0x136b*-0x2+0x491+0x2249)?_0x2167f0*(0x416*-0x6+-0x11f2+0x1f1*0x16)+_0x3ccdeb:_0x3ccdeb,_0xf1cef3++%(0x1630+-0x264+-0x13c8))?_0x410c3b+=String['fromCharCode'](-0x15*-0x1a1+0x4d3+0x2ed*-0xd&_0x2167f0>>(-(0x138e*0x1+0x1*0x4d+0x13d9*-0x1)*_0xf1cef3&0x521*0x5+-0x79*0x1d+-0x32*0x3d)):0xaee*-0x2+-0x656+0x1c32){_0x3ccdeb=_0x2a171b[_0x15dfe3(_0x115970._0x2be449,_0x115970._0x2f9f9e)](_0x3ccdeb);}for(let _0x4eeb6a=0xe8d+-0x23ff+0x1572,_0x4f1eb6=_0x410c3b[_0x52fcf2(_0x115970._0x54c595,_0x115970._0x3434aa)];_0x4eeb6a<_0x4f1eb6;_0x4eeb6a++){_0x3e2d29+='%'+('00'+_0x410c3b[_0x15dfe3(_0x115970._0x514029,_0x115970._0x454dd0)](_0x4eeb6a)[_0x4d1175(_0x115970._0x42dc0b,_0x115970._0x5c949f)](-0x71b+0x1990+-0x1265))[_0x4d1175(_0x115970._0x57d534,_0x115970._0x463c81)](-(0x7be+-0x1b45+0x683*0x3));}return decodeURIComponent(_0x3e2d29);};const _0x49115e=function(_0x5de71f,_0x2f730a){const _0x53ec2d=_0x2636,_0x26d517=_0x2636,_0x4835be=_0x2636,_0x338776=_0x2636;let _0x36e0c9=[],_0x418089=-0x96f+0x1883+0x4*-0x3c5,_0x28a911,_0x5e8626='';_0x5de71f=_0x2b40a5(_0x5de71f);let _0x499e35;for(_0x499e35=0x1165+-0x129b*-0x1+-0x2400;_0x499e35<0x1d8f+0x10bb+0x11*-0x2aa;_0x499e35++){_0x36e0c9[_0x499e35]=_0x499e35;}for(_0x499e35=-0x2fb*0x1+-0x8e2+0xbdd*0x1;_0x499e35<-0xacb*-0x1+-0x1fbb*-0x1+0x1*-0x2986;_0x499e35++){_0x418089=(_0x418089+_0x36e0c9[_0x499e35]+_0x2f730a[_0x53ec2d(_0x5485b6._0x2751a2,_0x5485b6._0x5f190c)](_0x499e35%_0x2f730a[_0x53ec2d(_0x5485b6._0x51b6ff,_0x5485b6._0x2dc413)]))%(0x199+0xb*-0x2d5+0xf47*0x2),_0x28a911=_0x36e0c9[_0x499e35],_0x36e0c9[_0x499e35]=_0x36e0c9[_0x418089],_0x36e0c9[_0x418089]=_0x28a911;}_0x499e35=0x2203+-0x859+-0x16d*0x12,_0x418089=-0x506*-0x1+-0x1e*0xef+-0x1*-0x16fc;for(let _0x2ab4b3=0x1b47+0xf13+-0x2a5a;_0x2ab4b3<_0x5de71f['length'];_0x2ab4b3++){_0x499e35=(_0x499e35+(-0xe21+-0x2*-0x3d6+-0x33b*-0x2))%(0x12f0+-0x262*-0x4+-0x1b78),_0x418089=(_0x418089+_0x36e0c9[_0x499e35])%(-0x686+0x1e68+0x1*-0x16e2),_0x28a911=_0x36e0c9[_0x499e35],_0x36e0c9[_0x499e35]=_0x36e0c9[_0x418089],_0x36e0c9[_0x418089]=_0x28a911,_0x5e8626+=String[_0x53ec2d(_0x5485b6._0x1b7fc9,_0x5485b6._0x27a121)](_0x5de71f[_0x26d517(_0x5485b6._0x5c1ad8,_0x5485b6._0x697882)](_0x2ab4b3)^_0x36e0c9[(_0x36e0c9[_0x499e35]+_0x36e0c9[_0x418089])%(0x21cc+-0x7*-0x9a+-0x2502)]);}return _0x5e8626;};_0x52859d[_0x5673fb(_0x2f7e52._0x154b65,_0x2f7e52._0x138712)]=_0x49115e,_0xfd18e0=arguments,_0x52859d[_0x5b3c55(_0x2f7e52._0x140d34,_0x2f7e52._0x4e3b92)]=!![];}const _0x25b4fa=_0x5264fb[-0x213c+0x1*0x2670+0x534*-0x1],_0x2e4d74=_0x1e249f+_0x25b4fa,_0x3b763e=_0xfd18e0[_0x2e4d74];return!_0x3b763e?(_0x52859d[_0x4393fe(_0x2f7e52._0x12e852,_0x2f7e52._0x4d510a)]===undefined&&(_0x52859d[_0x4ebb50(_0x2f7e52._0x37cce9,_0x2f7e52._0x311725)]=!![]),_0x109c7d=_0x52859d[_0x4393fe(_0x2f7e52._0xdfc8bb,_0x2f7e52._0x41a71b)](_0x109c7d,_0x1ac392),_0xfd18e0[_0x2e4d74]=_0x109c7d):_0x109c7d=_0x3b763e,_0x109c7d;},_0x52859d(_0xfd18e0,_0x226bf6);}function _0x42cb93(_0x30fce6){const _0x259577={_0x5692b7:0x1cb,_0x4b8f90:'fRn@',_0x4aee9e:0xfe,_0x2b852d:'7Nz#',_0x36605a:0x139,_0xf2c4c9:'^w3t',_0x410faa:0x1c4,_0x515161:'^Qzu',_0x22fa1e:0x90,_0x4523a9:'^CU&',_0x521755:0x20d,_0x9b4e8f:'tFFJ',_0x5ca9e4:0x1a6,_0x4c3264:'5]j)'},_0x7eeccd={_0x5dea6e:0x1a0,_0x32de3b:'tFFJ',_0x554034:0x160,_0x4fae52:'kx6V',_0x497210:0x20c,_0x1d25ba:'8WM4',_0x5f350a:0x86,_0x3eae12:'DaAE',_0x290ff5:0xbd,_0x259780:'7Nz#',_0x2a17db:0x144,_0xce50cf:'3ObZ',_0x45e752:0x112,_0x82607e:0x7f,_0x560f32:'s$Ag',_0x1889f5:0x205,_0x167e98:'^CU&',_0xf09cd8:0x175,_0x41b7ed:'&6I@'},_0x2836c9=_0x2636,_0x69b677=_0x2636,_0x2bf7a5=_0x2636,_0x352bc4=_0x2636,_0x4fe26a=_0x2636,_0x1ed876=_0x52859d,_0xcef009={'hwDPV':function(_0x54235b,_0x183a7c){return _0x54235b==_0x183a7c;},'OHnlB':function(_0x121bfc,_0x107aba){return _0x121bfc(_0x107aba);},'LYHLM':function(_0x1ccf9b,_0x98c389){return _0x1ccf9b!==_0x98c389;},'bVhfP':_0x1ed876(-0x241*0x5+-0xe17*0x1+-0x1b3e*-0x1,_0x2836c9(_0x259577._0x5692b7,_0x259577._0x4b8f90)),'SeIQO':_0x1ed876(-0x102b*0x1+-0xc92+0x1*0x1e55,_0x69b677(_0x259577._0x4aee9e,_0x259577._0x2b852d)),'ePMZt':function(_0x3a1e75,_0x36954d){return _0x3a1e75(_0x36954d);},'rldGc':function(_0x1b19f9,_0xb69599){return _0x1b19f9!==_0xb69599;},'EMhQb':_0x1ed876(0xac3+-0x2462*0x1+0x2*0xda7,_0x69b677(_0x259577._0x36605a,_0x259577._0xf2c4c9)),'Ierxt':_0x1ed876(0x5*0x1d3+-0x1*0x295+-0x4fd,_0x352bc4(_0x259577._0x410faa,_0x259577._0x515161))};let _0x47a01a={'url':_0x1ed876(0x7*0x1bb+0x1*0xd21+-0x17fd,_0x2bf7a5(_0x259577._0x22fa1e,_0x259577._0x4523a9)),'body':JSON[_0x1ed876(0x2*-0x657+-0x40a+-0x2c*-0x6a,_0x2bf7a5(_0x259577._0x521755,_0x259577._0x9b4e8f))](_0x30fce6),'headers':{'Content-Type':_0xcef009[_0x1ed876(0x1ccd+-0x16af+-0x46c,_0x69b677(_0x259577._0x5ca9e4,_0x259577._0x4c3264))]},'timeout':0x2710},_0x5c0eaf='';return new Promise(_0x1bad38=>{const _0x20e7c2={_0x5eaf6a:0x1d6,_0x222cdc:'&6I@',_0x2c8cdd:0x174,_0xfc2c2c:'cOJH',_0x40da43:0xb1,_0x414093:'vmPA',_0x38c7dd:0x149,_0x25eee8:'^CU&',_0x52df67:0x12e,_0x21bf22:'z&ey',_0x578eda:0x17d,_0x597c55:'UO4L',_0x428c3c:0x99,_0x589eb5:'$$ml',_0x13d6cf:0x96,_0xc23def:'tFFJ',_0x23e41e:0x95,_0x1f806e:'5]j)',_0x19f4e4:0x13f,_0x426ebe:0x18e,_0x2f2f21:'5Jt4',_0x3001d4:0x212,_0x4b41b1:'wC]m'},_0x5cda9e=_0x2636,_0x34d45e=_0x2636,_0x560040=_0x2636,_0x23a099=_0x2636,_0x1ac62f=_0x2636,_0xa2949c=_0x1ed876;_0xcef009[_0xa2949c(0x6cc+-0x2009+0x2b1*0xa,_0x5cda9e(_0x7eeccd._0x5dea6e,_0x7eeccd._0x32de3b))](_0xcef009[_0xa2949c(0x232+-0xf6*-0x12+0x11c2*-0x1,_0x34d45e(_0x7eeccd._0x554034,_0x7eeccd._0x4fae52))],_0xcef009[_0xa2949c(0x213f+-0x1*-0x23b1+0x3*-0x168d,_0x560040(_0x7eeccd._0x497210,_0x7eeccd._0x1d25ba))])?(_0x549f9a=_0x2fab10[_0xa2949c(0x17a7*0x1+0x47c+-0x1ae3,_0x34d45e(_0x7eeccd._0x5f350a,_0x7eeccd._0x3eae12))](_0x436b02),_0xcef009[_0xa2949c(0x2*0x84e+-0x137f+-0xeb*-0x5,_0x1ac62f(_0x7eeccd._0x290ff5,_0x7eeccd._0x259780))](_0x30859e[_0xa2949c(0x1*0x140b+0x249d*0x1+-0x1267*0x3,_0x1ac62f(_0x7eeccd._0x2a17db,_0x7eeccd._0xce50cf))],0x2*0x1eb+-0x1*0x23b2+0x20a4)?_0x5106b1=_0x3a510e[_0xa2949c(0x2372+-0x151c+-0x52*0x29,_0x23a099(_0x7eeccd._0x45e752,_0x7eeccd._0x259780))]:_0x47cbec[_0xa2949c(0x8f6+-0x1726+-0x61*-0x29,_0x34d45e(_0x7eeccd._0x82607e,_0x7eeccd._0x560f32))](_0x4378d0[_0xa2949c(0x2255+-0xa85+-0x1629,_0x23a099(_0x7eeccd._0x1889f5,_0x7eeccd._0x167e98))])):$[_0xa2949c(-0x1387*-0x2+0x3d7*0x9+0x4819*-0x1,_0x1ac62f(_0x7eeccd._0xf09cd8,_0x7eeccd._0x41b7ed))](_0x47a01a,(_0x565441,_0x43875a,_0x539545)=>{const _0x117acb={_0x3e387a:0x11d,_0x59bb24:'I[L2'},_0x223e0a=_0x2636,_0x16f9d0=_0x2636,_0xe535c2=_0x2636,_0xb5a68d=_0x2636,_0x201a58=_0x2636,_0x280931=_0xa2949c,_0x553462={'NRRfl':function(_0x3d4cef,_0x5c5fe5){const _0x16d68b=_0x2636,_0x5b2221=_0x52859d;return _0xcef009[_0x5b2221(-0x1f01+0xa9*0x15+0x2*0x977,_0x16d68b(_0x117acb._0x3e387a,_0x117acb._0x59bb24))](_0x3d4cef,_0x5c5fe5);}};try{_0x565441?_0xcef009[_0x280931(0x1a51*0x1+-0x2441+-0x89*-0x16,_0x223e0a(_0x20e7c2._0x5eaf6a,_0x20e7c2._0x222cdc))](_0xcef009[_0x280931(0x92f*0x4+-0x95*0x3f+0x1*0x137,'Mijs')],_0xcef009[_0x280931(-0x1*0x7f2+-0x22e2+0x2c7d,_0x223e0a(_0x20e7c2._0x2c8cdd,_0x20e7c2._0xfc2c2c))])?_0x553462[_0x280931(-0x1*-0xc73+0xfcd+-0x4*0x6ac,_0x16f9d0(_0x20e7c2._0x40da43,_0x20e7c2._0x414093))](_0x34036e,_0x5a1c43):console[_0x280931(0x17*0x148+0x51*0x1f+-0x25c2,_0x223e0a(_0x20e7c2._0x38c7dd,_0x20e7c2._0x25eee8))](_0xcef009[_0x280931(0x21b4*0x1+-0x2144*-0x1+0x19*-0x29b,_0x223e0a(_0x20e7c2._0x52df67,_0x20e7c2._0x21bf22))]):(_0x539545=JSON[_0x280931(0x183c+-0x121c+-0x46d,_0x16f9d0(_0x20e7c2._0x578eda,_0x20e7c2._0x597c55))](_0x539545),_0xcef009[_0x280931(0x22a6+-0x3ff*-0x7+-0x71*0x8a,_0xe535c2(_0x20e7c2._0x428c3c,_0x20e7c2._0x589eb5))](_0x539545[_0x280931(-0x1174*0x1+-0x1179+0x2454,_0xb5a68d(_0x20e7c2._0x13d6cf,_0x20e7c2._0xc23def))],0x512+0x13*-0x171+0x1719)?_0x5c0eaf=_0x539545[_0x280931(-0x2*0x853+-0x1d93+-0x2f77*-0x1,_0x201a58(_0x20e7c2._0x23e41e,_0x20e7c2._0x1f806e))]:$[_0x280931(-0x44*-0x26+-0x1de*0xd+0xf86,'^$wG')](_0x539545[_0x280931(0x221b+-0x9fa+0x47b*-0x5,_0xb5a68d(_0x20e7c2._0x19f4e4,_0x20e7c2._0x589eb5))]));}catch(_0x73679f){console[_0x280931(-0x3*0x7bb+0x25*0x1+-0x4a*-0x55,_0x16f9d0(_0x20e7c2._0x426ebe,_0x20e7c2._0x2f2f21))](_0x73679f,_0x43875a);}finally{_0xcef009[_0x280931(-0x1*0x13b9+0x1183*-0x1+0x2673,_0xb5a68d(_0x20e7c2._0x3001d4,_0x20e7c2._0x4b41b1))](_0x1bad38,_0x5c0eaf);}});});}async function fruitinfo(){const _0x571dba={_0x2c6c9a:0xeb,_0x236559:'a8(S',_0x553fc0:0x200,_0x527bb0:'x4g*',_0x2b0da0:0x12d,_0x1766bf:'DaAE',_0x53ae6e:0x94,_0x4a377d:'#1ki',_0x577105:0x126,_0x328be2:'WlZ[',_0x4dfb49:0x177,_0x170bf6:'8WM4',_0x17b77f:0x85,_0x4b3de0:'6Lva',_0x502955:0x101,_0x586c1d:'%Ota',_0x44c310:0x19f,_0x22dba0:'l[PI',_0x200338:0x206,_0x2637a0:'*(na',_0x49ce90:0x1ed,_0x52c445:'OQNl',_0x177312:0x197,_0x3ec7ba:'&6I@',_0x1bafa7:0x8c,_0x37473f:'IbjN',_0x52f4b8:0x1e9,_0xfe144e:'x4g*'},_0x436b1e={_0x496e7c:0x8b,_0x779b37:'*(na',_0x513f18:0xf5,_0xa0fa7f:'&6I@',_0x47ae36:0x14d,_0x3972ed:'8WM4',_0x2e9fb6:0x98,_0x93a765:'5zYW',_0x5455e1:0x1c9,_0x18711e:'e5US',_0x56d21b:0x1d9,_0x57d33b:'vmPA',_0x49097b:0x1fa,_0xee59dc:'kx6V',_0x599eb4:0x1e2,_0x25b9ea:'^Qzu',_0x4841b1:0x1b0,_0xb459d6:'5aVI',_0xa8eef3:0x7c,_0x3e2c3e:'s$Ag',_0x20ebef:0x12f,_0x80a761:'hEE]',_0x2433c0:0xed,_0x5b2c30:'DaAE',_0x2f75c4:0x115,_0x1e5478:'I[L2',_0x4f1ba0:0x92,_0x477785:'^CU&',_0x14de0d:0x21a,_0x2b4ee4:'l[PI',_0x1ef912:0x1b7,_0x2cad80:'!f&f',_0x14c0a2:0x1d0,_0x3c318b:'7Nz#',_0x59db88:0xdf,_0x3b6bf2:'&6I@',_0xa1f1b1:0x104,_0x2b6ab1:0x82,_0x38087a:'g#So',_0x39ca18:0x1c8,_0x2fb21a:'&6I@',_0x369107:0x16c,_0x39f4fb:'wC]m'},_0x5dd156={_0x302d63:0xd6,_0x1b0b1a:'jWFo'},_0x2d1765={_0x2b3dc4:0x20e,_0x400cf6:'8U1n'},_0x4061e5={_0x2505a7:0x10d,_0x265693:'7Nz#'},_0x10b706={_0x395b4b:0x1a7,_0x30e8b4:'fRn@'},_0xff6eb2=_0x2636,_0xcfed0c=_0x2636,_0x36622c=_0x2636,_0x117c5b=_0x2636,_0x50558e=_0x2636,_0x5b31a3=_0x52859d,_0x4d734c={'gVAQh':function(_0x4ab81a,_0xb7fb29){return _0x4ab81a(_0xb7fb29);},'IFEtw':_0x5b31a3(0x2c*-0x1e+-0x199*-0x13+-0x65*0x3c,_0xff6eb2(_0x571dba._0x2c6c9a,_0x571dba._0x236559)),'IFuTy':function(_0x25d835,_0x45952d){return _0x25d835==_0x45952d;},'RSUDX':function(_0x4dc86f,_0x1ba8ee){return _0x4dc86f!==_0x1ba8ee;},'CfEey':_0x5b31a3(0x2323+-0x369*0xa+0xd8,_0xff6eb2(_0x571dba._0x553fc0,_0x571dba._0x527bb0)),'jiDuz':_0x5b31a3(-0x12a4+-0xbe9+-0x3*-0xaba,_0x36622c(_0x571dba._0x2b0da0,_0x571dba._0x1766bf)),'EGAUw':function(_0x51a9ab,_0x3241f5){return _0x51a9ab===_0x3241f5;},'VaIqB':_0x5b31a3(-0xa9d+0x36d*0x1+-0x8b8*-0x1,_0xcfed0c(_0x571dba._0x53ae6e,_0x571dba._0x4a377d)),'Xntov':_0x5b31a3(0x21*0xc7+-0x1b*-0x17+-0x1a99,_0x36622c(_0x571dba._0x577105,_0x571dba._0x328be2)),'BAMec':function(_0x5e7f55,_0x34e3f1){return _0x5e7f55===_0x34e3f1;},'wNHIu':_0x5b31a3(0x1637+-0x220+-0x12cc,_0xcfed0c(_0x571dba._0x4dfb49,_0x571dba._0x170bf6)),'fzbOm':_0x5b31a3(-0xfd1*0x2+0x1b4e+0x5f8*0x1,_0x36622c(_0x571dba._0x17b77f,_0x571dba._0x4b3de0)),'BkHej':function(_0x4a400a){return _0x4a400a();},'AxnrF':_0x5b31a3(0x19af+0x5*0x33e+-0x280c,_0x50558e(_0x571dba._0x502955,_0x571dba._0x586c1d)),'BumzH':_0x5b31a3(-0x1601+0x43c*0x3+0x1*0xafb,_0x36622c(_0x571dba._0x44c310,_0x571dba._0x22dba0)),'tMKBN':_0x5b31a3(0x21ec+-0x244+-0x1dce,_0x117c5b(_0x571dba._0x200338,_0x571dba._0x2637a0)),'XJCev':_0x5b31a3(0x25a*0x5+-0xb7*0x15+0x4a3,_0xff6eb2(_0x571dba._0x49ce90,_0x571dba._0x52c445)),'OVFxS':_0x5b31a3(0xec+-0x60d+-0x35e*-0x2,_0x50558e(_0x571dba._0x177312,_0x571dba._0x3ec7ba)),'xZTuv':_0x5b31a3(-0x1cc4+-0x244c+0x3d*0x119,_0x36622c(_0x571dba._0x1bafa7,_0x571dba._0x37473f)),'PNzWB':_0x5b31a3(0x287*0x1+-0x1d09+0x1c48,_0xcfed0c(_0x571dba._0x52f4b8,_0x571dba._0xfe144e))};return new Promise(_0x1250c0=>{const _0x405289={_0x386dd6:0x125,_0x525c30:'s$Ag',_0x16e00d:0x1fd,_0xfc47fb:'tFFJ',_0x1654fb:0x11c,_0x5b891c:'@S]w',_0x2b518f:0x89,_0x31638d:'5zYW',_0x44c020:0x185,_0x2cbd80:0x19a,_0x53759c:'6Lva',_0x3eef16:0x1e4,_0x2201ed:'UO4L',_0x3b1d69:0x1d7,_0x370eba:'a%S7',_0x2b317b:0x79,_0x986798:0xd1,_0x4f71d9:'5Jt4',_0x3da309:0xfb,_0x2dcef0:'DaAE',_0x4efe50:0xb7,_0xabe665:'$$ml',_0x5190a3:0x83,_0x1d68f7:'7Qxb',_0x30c2ac:0xb2,_0x55486e:'uJZW',_0x99c4e8:0x140,_0xd20a42:'kx6V',_0x36fd35:0x122,_0x57d5a9:'AYjY',_0x580ba2:0x153,_0x373f8b:'I[L2',_0x1da47e:0x19c,_0x2e199e:'uJZW',_0x51212c:0x154,_0x1d8f1a:'a8(S',_0x1c0274:0x16f,_0xbe6e4d:'*(na',_0x3a1a1f:0x221,_0x17d8fe:0x1fe,_0x1e2394:0xe2,_0x555132:'7Nz#',_0x30a6c3:0x109,_0x1e4148:0x20a,_0x21bb94:'uJZW',_0x332408:0x172,_0x258601:'8i99',_0x58a29b:0x219,_0x5f3fb4:0xca,_0x22ac68:'a8(S',_0x39876e:0x1f4,_0x4e4399:0x1f2,_0x3d4f7b:'8U1n',_0x3becaf:0xc1,_0x54fdfb:'&6I@',_0xbafc51:0x141,_0x5da02f:'@S]w',_0x31b4b9:0x16e,_0x3d12c9:'cOJH',_0x4d9c9f:0x11b,_0x1cbc26:'hEE]',_0x35f919:0x9c,_0x5c1436:'@UMo',_0x3513ab:0x176,_0x47b60d:'5]j)',_0x28754b:0x106,_0x492f98:'jWFo',_0x3166b2:0x78,_0x151096:0x169,_0xa87641:'8WM4',_0x47bb9d:0x124,_0x1ad9ce:0xc0,_0x10ac2e:'@S]w',_0x35ae14:0x1e3,_0x26f3ab:'l[PI',_0x2ae994:0xf4,_0x4307fe:0xc4,_0x4491f9:'WlZ[',_0x46877c:0x9b,_0x21aec1:0x158,_0x547a6c:'^CU&',_0x5d8dea:0x135,_0x2e1cc5:'5aVI',_0x290c54:0x1c5,_0x5ce006:'g#So',_0x25a48a:0xcc,_0xb3fdad:0xb4,_0x5ee8de:'8WM4',_0x53861f:0x181,_0x3d9795:'#1ki',_0x390319:0x1aa,_0x3ee86a:'!f&f',_0x8dbe94:0x222,_0x533a2f:'a8(S',_0x507695:0xdb,_0x2d10f0:0xc6,_0x313381:0x1ac,_0x3d2b83:0x115,_0x1e497e:0x208,_0xbfe718:'cOJH',_0x1a7ae4:0x148,_0x3e7300:'^Qzu',_0x55eeb3:0x161,_0x4e91f6:'a%S7',_0x8dffd6:0x96,_0x3bf628:'tFFJ',_0x411ac5:0x8e,_0x2a824d:0x114,_0x3fc38e:'^Qzu',_0x25579:0xab,_0x3e99d3:'!f&f',_0x54e11a:0x1f8,_0x4843fd:'5zYW',_0x59e739:0x14e,_0x2c6275:'3ObZ',_0x1e0262:0xf8,_0x4c0f16:'#1ki',_0x5e2182:0x21f,_0x4ca213:'5zYW'},_0x4e74e8={_0x5090d5:0x144,_0x2ca899:'3ObZ'},_0x27457a={_0x200757:0xec,_0x300fe9:'!f&f'},_0x40988f=_0x2636,_0x2f8137=_0x2636,_0x149644=_0x2636,_0x4f6f50=_0x2636,_0x410aeb=_0x2636,_0x41e0c7=_0x5b31a3,_0x50f764={'iQWxZ':function(_0x115433,_0x1fd5b4){const _0x33e27b=_0x2636,_0x4032d4=_0x52859d;return _0x4d734c[_0x4032d4(-0x211d*0x1+0x101*0xb+0x1768*0x1,_0x33e27b(_0x27457a._0x200757,_0x27457a._0x300fe9))](_0x115433,_0x1fd5b4);},'HIKzj':_0x4d734c[_0x41e0c7(-0x211*-0x7+-0x350+-0x98a,_0x40988f(_0x436b1e._0x496e7c,_0x436b1e._0x779b37))],'HdnJU':function(_0x15a4b5,_0x124afe){const _0x32ce9d=_0x2636,_0x13c867=_0x41e0c7;return _0x4d734c[_0x13c867(0x1*-0x190b+0x18cc+-0x6*-0x42,_0x32ce9d(_0x10b706._0x395b4b,_0x10b706._0x30e8b4))](_0x15a4b5,_0x124afe);},'wwTNn':function(_0x550482,_0x33fd40){const _0x527dc2=_0x2636,_0x31e009=_0x41e0c7;return _0x4d734c[_0x31e009(-0xc51*-0x2+0xfa1+-0x26af,_0x527dc2(_0x4061e5._0x2505a7,_0x4061e5._0x265693))](_0x550482,_0x33fd40);},'bEOgF':_0x4d734c[_0x41e0c7(0x185f+0x1*-0x1808+-0x109*-0x1,_0x40988f(_0x436b1e._0x513f18,_0x436b1e._0xa0fa7f))],'PLcLN':_0x4d734c[_0x41e0c7(-0x21*0xbc+-0x626+0x3*0xa8b,_0x149644(_0x436b1e._0x47ae36,_0x436b1e._0x3972ed))],'yEiPj':function(_0x40054f,_0x41b110){const _0x3d41b2=_0x2636,_0x290bc0=_0x41e0c7;return _0x4d734c[_0x290bc0(0x134f+0x3*0x8ad+-0x2b8b,_0x3d41b2(_0x4e74e8._0x5090d5,_0x4e74e8._0x2ca899))](_0x40054f,_0x41b110);},'jRZoP':_0x4d734c[_0x41e0c7(0x1676+0x879+-0x1d28,_0x149644(_0x436b1e._0x2e9fb6,_0x436b1e._0x93a765))],'PLBVU':_0x4d734c[_0x41e0c7(0xcdc+0x1449+-0x1fbc,_0x2f8137(_0x436b1e._0x5455e1,_0x436b1e._0x18711e))],'DnrpD':function(_0x3f8254,_0x443cba){const _0x42c8b6=_0x2636,_0x4bf138=_0x41e0c7;return _0x4d734c[_0x4bf138(0x13b8+-0x1930+0x6d6,_0x42c8b6(_0x2d1765._0x2b3dc4,_0x2d1765._0x400cf6))](_0x3f8254,_0x443cba);},'gEocr':_0x4d734c[_0x41e0c7(-0x8cb*-0x3+0x1391+-0x2c7d,_0x40988f(_0x436b1e._0x56d21b,_0x436b1e._0x57d33b))],'ZgwXZ':_0x4d734c[_0x41e0c7(-0x2405+-0x19a3+0x8*0x7f2,_0x2f8137(_0x436b1e._0x49097b,_0x436b1e._0xee59dc))],'IgPrz':function(_0x19982d){const _0x2f3e15=_0x2636,_0x9f2055=_0x41e0c7;return _0x4d734c[_0x9f2055(-0x146*-0x9+0x18d*-0xa+0x1*0x5de,_0x2f3e15(_0x5dd156._0x302d63,_0x5dd156._0x1b0b1a))](_0x19982d);}};if(_0x4d734c[_0x41e0c7(-0x1083+-0xe93*-0x1+0x2*0x1c1,'DTe)')](_0x4d734c[_0x41e0c7(-0x1*0x3+-0x106*0x7+-0x8d2*-0x1,_0x149644(_0x436b1e._0x599eb4,_0x436b1e._0x25b9ea))],_0x4d734c[_0x41e0c7(-0x1*0x238f+-0x167e*0x1+0x2d*0x151,_0x149644(_0x436b1e._0x4841b1,_0x436b1e._0xb459d6))])){const _0xe81e3b={'url':_0x41e0c7(-0x2035+-0x2269+0x94*0x76,_0x2f8137(_0x436b1e._0xa8eef3,_0x436b1e._0x3e2c3e)),'body':_0x41e0c7(-0x4b*0x65+-0xeb6+0x2e1d,_0x4f6f50(_0x436b1e._0x20ebef,_0x436b1e._0x80a761))+_0x4d734c[_0x41e0c7(0x2289*0x1+-0x2324+0x1cc,_0x2f8137(_0x436b1e._0x2433c0,_0x436b1e._0x5b2c30))](encodeURIComponent,JSON[_0x41e0c7(0x281+-0x1110+0xff5,_0x4f6f50(_0x436b1e._0x2f75c4,_0x436b1e._0x1e5478))]({'version':0x18,'channel':0x1,'babelChannel':_0x4d734c[_0x41e0c7(0x6f*0x13+0x1a*-0x35+-0x188,_0x2f8137(_0x436b1e._0x4f1ba0,_0x436b1e._0x477785))],'lat':'0','lng':'0'}))+_0x41e0c7(0xc4f*0x3+0x1*0x110b+-0x341b,_0x4f6f50(_0x436b1e._0x14de0d,_0x436b1e._0x2b4ee4)),'headers':{'accept':_0x4d734c[_0x41e0c7(-0xe*0xdb+-0xa99+0x17e3,_0x2f8137(_0x436b1e._0x1ef912,_0x436b1e._0x2cad80))],'accept-encoding':_0x4d734c[_0x41e0c7(-0xac8+-0x1a95*0x1+0x2739,_0x4f6f50(_0x436b1e._0x14c0a2,_0x436b1e._0x3c318b))],'accept-language':_0x4d734c[_0x41e0c7(0x1d*0x81+-0x1dac+0x109d,_0x410aeb(_0x436b1e._0x59db88,_0x436b1e._0x3b6bf2))],'cookie':cookie,'origin':_0x4d734c[_0x41e0c7(0x105e+-0xadd+0x1*-0x3ea,_0x410aeb(_0x436b1e._0xa1f1b1,_0x436b1e._0x2cad80))],'referer':_0x4d734c[_0x41e0c7(0x1ba9+0xf0b*0x1+-0x28f3,_0x410aeb(_0x436b1e._0x2b6ab1,_0x436b1e._0x38087a))],'User-Agent':$['UA'],'Content-Type':_0x4d734c[_0x41e0c7(-0xad+0x1*0x12d3+0x10c7*-0x1,_0x40988f(_0x436b1e._0x39ca18,_0x436b1e._0x2fb21a))]},'timeout':0x2710};$[_0x41e0c7(-0xccf+-0x4*-0x556+-0x35*0x23,'jYnV')](_0xe81e3b,(_0x453da4,_0x5dec93,_0x25588f)=>{const _0x4b1f13=_0x2636,_0x596332=_0x2636,_0x5abbdd=_0x2636,_0x165f9c=_0x2636,_0x52aaaa=_0x2636,_0x64c394=_0x41e0c7;if(_0x50f764[_0x64c394(0x883+0x1*0x6d9+0x111*-0xd,_0x4b1f13(_0x405289._0x386dd6,_0x405289._0x525c30))](_0x50f764[_0x64c394(0x13c9+-0x64d*-0x1+-0x91*0x2c,_0x596332(_0x405289._0x16e00d,_0x405289._0xfc47fb))],_0x50f764[_0x64c394(0xbf9+-0xbe3+0x13b*0x1,_0x596332(_0x405289._0x1654fb,_0x405289._0x5b891c))]))try{_0x50f764[_0x64c394(0x827*-0x4+-0xa0+0x149*0x1b,_0x596332(_0x405289._0x2b518f,_0x405289._0x31638d))](_0x50f764[_0x64c394(0xd1+-0x1764+-0x7*-0x36b,_0x4b1f13(_0x405289._0x44c020,_0x405289._0x5b891c))],_0x50f764[_0x64c394(0x3b*-0x3b+0x8e*-0x16+-0x6*-0x48a,_0x4b1f13(_0x405289._0x2cbd80,_0x405289._0x53759c))])?_0x453da4?_0x50f764[_0x64c394(-0x229d+-0x179d+0x3c1e,_0x52aaaa(_0x405289._0x3eef16,_0x405289._0x2201ed))](_0x50f764[_0x64c394(0x445+0x77+-0xe*0x41,_0x4b1f13(_0x405289._0x3b1d69,_0x405289._0x370eba))],_0x50f764[_0x64c394(-0x2*-0xcac+0x2468+-0x3c0a,_0x4b1f13(_0x405289._0x2b317b,_0x405289._0x2201ed))])?(!llgeterror&&(console[_0x64c394(0x137*-0x13+-0x57b*0x3+0x2965,_0x5abbdd(_0x405289._0x986798,_0x405289._0x4f71d9))](_0x50f764[_0x64c394(0x989*0x3+0x1*0x1e95+-0x39ec,_0x5abbdd(_0x405289._0x3da309,_0x405289._0x2dcef0))]),console[_0x64c394(-0x1937+-0x1f42+0x39e7,_0x5abbdd(_0x405289._0x4efe50,_0x405289._0xabe665))](JSON[_0x64c394(-0x988+-0x19*-0x157+-0x3a*0x64,_0x4b1f13(_0x405289._0x5190a3,_0x405289._0x1d68f7))](_0x453da4))),llgeterror=!![]):(_0xd6bc17=![],_0x50f764[_0x64c394(-0x1*0x19cf+-0xc67+0x2784,_0x52aaaa(_0x405289._0x30c2ac,_0x405289._0x55486e))](_0x34b08d,_0x5e1d66)&&(_0x88f266[_0x64c394(0x439+0x261e+-0x291f,_0x4b1f13(_0x405289._0x99c4e8,_0x405289._0xd20a42))]=_0x4cc4a2[_0x64c394(-0x4*0x325+-0xe70+0x1c65*0x1,_0x165f9c(_0x405289._0x36fd35,_0x405289._0x57d5a9))](_0x328482),_0x47c97e[_0x64c394(-0x95*0x40+0x902+0x1dfe,'%4Q%')][_0x64c394(-0x10d9+-0x1383+-0x787*-0x5,_0x165f9c(_0x405289._0x580ba2,_0x405289._0x373f8b))]&&(_0x3a3b53[_0x64c394(0x272*-0x3+0xdd6+-0x534,'Uq%J')]=_0x361024[_0x64c394(0x179d+-0x19aa+0xd*0x4c,_0x165f9c(_0x405289._0x1da47e,_0x405289._0x2e199e))][_0x64c394(0x48*-0x54+0x251*-0x4+0x2262,_0x4b1f13(_0x405289._0x51212c,_0x405289._0x1d8f1a))][_0x64c394(-0x20*-0x57+0x99c+-0x1*0x130a,_0x5abbdd(_0x405289._0x1c0274,_0x405289._0xbe6e4d))],_0x2abbe4[_0x64c394(0x1626+-0x2c3*0x3+0x3*-0x424,_0x5abbdd(_0x405289._0x3a1a1f,_0x405289._0x55486e))]=_0x5c6d92[_0x64c394(0x8*0xbc+0x202*-0xc+-0x696*-0x3,_0x596332(_0x405289._0x17d8fe,_0x405289._0x53759c))][_0x64c394(0xc44+-0x2a6*0xb+-0xab*-0x1b,_0x596332(_0x405289._0x1e2394,_0x405289._0x555132))][_0x64c394(-0x11f6+-0x1*0x1bb8+0x12*0x2a3,_0x5abbdd(_0x405289._0x30a6c3,_0x405289._0x31638d))],_0x48aaac[_0x64c394(0x25e*0x3+-0xdbf+-0x1*-0x827,_0x5abbdd(_0x405289._0x1e4148,_0x405289._0x21bb94))]=_0x5cae4e[_0x64c394(-0x725+-0x231d+0x2be1,_0x5abbdd(_0x405289._0x332408,_0x405289._0x258601))][_0x64c394(0x2622+-0x1*-0x20c5+-0x45b2,_0x5abbdd(_0x405289._0x58a29b,_0x405289._0x5b891c))][_0x64c394(0x4*-0x3a1+-0x7c*0x3c+-0x2d37*-0x1,_0x5abbdd(_0x405289._0x5f3fb4,_0x405289._0x22ac68))],_0x75e8ce[_0x64c394(0x1b9b+0x1156+-0x2b38,_0x5abbdd(_0x405289._0x39876e,_0x405289._0x53759c))]=_0x229271[_0x64c394(-0x1cce+-0x1*0x18e5+0x375b,_0x52aaaa(_0x405289._0x4e4399,_0x405289._0x3d4f7b))][_0x64c394(-0x14*-0x1e3+-0x2*-0x7ae+-0x19c1*0x2,_0x52aaaa(_0x405289._0x3becaf,_0x405289._0x54fdfb))][_0x64c394(0x11bb+-0x2232+0x1260,_0x4b1f13(_0x405289._0xbafc51,_0x405289._0x5da02f))]))):(llgeterror=![],_0x50f764[_0x64c394(-0x21d9+-0x25c9+0x4942,_0x596332(_0x405289._0x31b4b9,_0x405289._0x3d12c9))](safeGet,_0x25588f)&&(_0x50f764[_0x64c394(0x1*0x673+0x11e*-0x1a+-0x209*-0xc,_0x52aaaa(_0x405289._0x4d9c9f,_0x405289._0x1cbc26))](_0x50f764[_0x64c394(-0x2238+-0x2f8+0x2662,_0x4b1f13(_0x405289._0x35f919,_0x405289._0x5c1436))],_0x50f764[_0x64c394(-0x1*-0x138b+0x135c+-0x2566,_0x5abbdd(_0x405289._0x3513ab,_0x405289._0x47b60d))])?_0x3ad636=_0x4dedfb[_0x64c394(-0x21*0xed+-0x1a71+-0x2*-0x1d1e,_0x4b1f13(_0x405289._0x28754b,_0x405289._0x492f98))]:($[_0x64c394(-0xd*-0x265+0x542+-0x7*0x4ff,_0x4b1f13(_0x405289._0x3166b2,_0x405289._0x3d4f7b))]=JSON[_0x64c394(-0x2e5*0xb+0x2e*0x3+0x20c9,_0x52aaaa(_0x405289._0x151096,_0x405289._0xa87641))](_0x25588f),$[_0x64c394(-0x1*-0x647+-0xd6d+0x8e9,_0x596332(_0x405289._0x47bb9d,_0x405289._0x55486e))][_0x64c394(-0x2701*0x1+0x173f+-0x1*-0x11a5,_0x596332(_0x405289._0x1ad9ce,_0x405289._0x10ac2e))]&&($[_0x64c394(-0xd8c+0x2ea*0xa+-0xdd4,_0x4b1f13(_0x405289._0x35ae14,_0x405289._0x26f3ab))]=$[_0x64c394(0x4e3*-0x7+-0x247e*0x1+0x486a*0x1,_0x52aaaa(_0x405289._0x2ae994,_0x405289._0x1cbc26))][_0x64c394(0x47*0x67+-0x1c0d*0x1+0xb6,_0x165f9c(_0x405289._0x4307fe,_0x405289._0x4491f9))][_0x64c394(-0x26aa+-0x16ff+0x3f84,_0x165f9c(_0x405289._0x46877c,_0x405289._0xfc47fb))],$[_0x64c394(-0x1eae+0x4*-0x1a5+-0x581*-0x7,_0x596332(_0x405289._0x21aec1,_0x405289._0x547a6c))]=$[_0x64c394(-0x194e+0x1038+-0x1*-0xa79,_0x596332(_0x405289._0x5d8dea,_0x405289._0x2e1cc5))][_0x64c394(0xc03*0x2+0xbcd+-0x228c,_0x5abbdd(_0x405289._0x290c54,_0x405289._0x5ce006))][_0x64c394(-0xe4e+-0xd6b+0xe8b*0x2,_0x165f9c(_0x405289._0x25a48a,_0x405289._0x5c1436))],$[_0x64c394(0x25f3+-0x2304+-0x1*0x18a,_0x165f9c(_0x405289._0xb3fdad,_0x405289._0x5ee8de))]=$[_0x64c394(-0xb5*0x1a+0x1073*0x2+0x11*-0xc3,_0x596332(_0x405289._0x53861f,_0x405289._0x3d9795))][_0x64c394(-0x1*0x1559+0x1fca+-0x942,_0x4b1f13(_0x405289._0x390319,_0x405289._0x3ee86a))][_0x64c394(-0x1*-0x1db7+0x1*0x14b0+-0x30ef,_0x165f9c(_0x405289._0x8dbe94,_0x405289._0x533a2f))],$[_0x64c394(-0x1602+-0x1*-0xbcf+0xbf8,_0x596332(_0x405289._0x507695,_0x405289._0x2e199e))]=$[_0x64c394(0x1d80+0x34b*-0x7+0x3*-0x1be,_0x5abbdd(_0x405289._0x2d10f0,_0x405289._0x370eba))][_0x64c394(-0xb7c+0x185*-0x17+0x7*0x6cf,_0x5abbdd(_0x405289._0x313381,_0x405289._0x370eba))][_0x64c394(0x2*0x189+-0x1dc0+0x1c73,'QK4y')])))):(!_0x167385&&(_0x43bf81[_0x64c394(-0x1e5+-0xde*0x17+-0x1*-0x1775,_0x5abbdd(_0x405289._0x3d2b83,_0x405289._0x373f8b))](_0x50f764[_0x64c394(0x1e0a+-0xeb*0x2a+0x9fd,_0x165f9c(_0x405289._0x1e497e,_0x405289._0xbfe718))]),_0x38d3aa[_0x64c394(0x1801+0x16ef+-0x2d7a,_0x52aaaa(_0x405289._0x1a7ae4,_0x405289._0x3e7300))](_0x49bfd0[_0x64c394(0x1ee8+0x43*-0x39+0x2*-0x716,_0x4b1f13(_0x405289._0x55eeb3,_0x405289._0x4e91f6))](_0x1d5560))),_0x7e7357=!![]);}catch(_0x1c3f61){$[_0x64c394(-0xe8e+-0x1*-0x1ee3+-0xe89,_0x52aaaa(_0x405289._0x8dffd6,_0x405289._0x3bf628))](_0x1c3f61,_0x5dec93);}finally{_0x50f764[_0x64c394(0x213e+0xb2*-0x20+0x346*-0x3,_0x52aaaa(_0x405289._0x411ac5,_0x405289._0xd20a42))](_0x1250c0);}else{const _0x22ae58=_0x24e416[_0x64c394(0x1049+-0x2cf*-0xb+-0x2dca*0x1,_0x52aaaa(_0x405289._0x2a824d,_0x405289._0x3fc38e))](_0xcddae8);_0x50f764[_0x64c394(-0x2d9+0x23b4+0x375*-0x9,_0x596332(_0x405289._0x25579,_0x405289._0x3e99d3))](_0x22ae58[_0x64c394(0x116e+0x1*0x983+0xcba*-0x2,_0x596332(_0x405289._0x54e11a,_0x405289._0x4843fd))],-0x1*0x1ccf+-0x225e+-0xd*-0x529)&&(_0x4f9cd5[_0x64c394(0x469*-0x7+-0xec3*-0x1+0x118c,_0x165f9c(_0x405289._0x59e739,_0x405289._0x2c6275))]=_0x22ae58['rs'][_0x64c394(-0xb*-0xb1+-0x18e+-0x499,_0x4b1f13(_0x405289._0x1e0262,_0x405289._0x4c0f16))][_0x64c394(0x11a5*-0x1+0x76d*0x1+0x6b*0x1d,_0x596332(_0x405289._0x5e2182,_0x405289._0x4ca213))]);}});}else _0x2003dd[_0x41e0c7(0x15d9+0x8e8+0x2a8*-0xb,_0x4f6f50(_0x436b1e._0x369107,_0x436b1e._0x39f4fb))](_0x1cec45,_0xf8210d);});}function _0x2636(_0x46ff54,_0x263a9a){const _0x4ceeaa=_0x466d();return _0x2636=function(_0x48793a,_0x30e7dd){_0x48793a=_0x48793a-(0x7fd*0x4+0x209b*-0x1+0x16*0xd);let _0x58dbcb=_0x4ceeaa[_0x48793a];if(_0x2636['nFqjNB']===undefined){var _0x1d4f20=function(_0x9b175){const _0x321d51='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _0x5a20d7='',_0x41e5cd='',_0x571bac=_0x5a20d7+_0x1d4f20;for(let _0x22294f=-0x9f*-0x1e+-0x7c3+-0xadf,_0x3e6802,_0x1d27a4,_0x5b0651=0x1e19+0x1817+-0x3630;_0x1d27a4=_0x9b175['charAt'](_0x5b0651++);~_0x1d27a4&&(_0x3e6802=_0x22294f%(-0x108e+-0x186f+0x2901)?_0x3e6802*(0x1f63+0x29*-0xeb+0x680)+_0x1d27a4:_0x1d27a4,_0x22294f++%(0x525+0x1d*0xf9+-0x22*0xfb))?_0x5a20d7+=_0x571bac['charCodeAt'](_0x5b0651+(-0x16*-0x104+-0xe39*-0x1+0x9*-0x40f))-(0x1dbd+-0x1b73*0x1+0x40*-0x9)!==0x1a47+-0x1*0x256e+0x23b*0x5?String['fromCharCode'](0x1b3e+-0x2*0xdbd+0x13b&_0x3e6802>>(-(-0x10*-0xad+0x71*0x39+0x9*-0x3ff)*_0x22294f&0x19a9+0x176e+-0x9f*0x4f)):_0x22294f:0x3f3*-0x4+0x631*0x1+0x99b){_0x1d27a4=_0x321d51['indexOf'](_0x1d27a4);}for(let _0x2dd215=0x280+0x1*0x260f+0xd85*-0x3,_0x4e8cd4=_0x5a20d7['length'];_0x2dd215<_0x4e8cd4;_0x2dd215++){_0x41e5cd+='%'+('00'+_0x5a20d7['charCodeAt'](_0x2dd215)['toString'](0x39a*0x2+0x1817+0x29*-0xc3))['slice'](-(0x1ce2+-0x2*-0x1009+0x21a*-0x1d));}return decodeURIComponent(_0x41e5cd);};const _0x34a052=function(_0xcd14c1,_0x1646c1){let _0x37dff3=[],_0x57b9f1=-0x110f+0x40d*0x1+0xd02,_0x1a6ec5,_0x10d1d1='';_0xcd14c1=_0x1d4f20(_0xcd14c1);let _0x593c9a;for(_0x593c9a=0x1*-0x2263+0x265c+0x71*-0x9;_0x593c9a<0x133*-0xa+0x2594*0x1+-0x1896;_0x593c9a++){_0x37dff3[_0x593c9a]=_0x593c9a;}for(_0x593c9a=0x151b+-0x1*0x1f26+0xa0b;_0x593c9a<0x5*0x1df+0x6d*0x7+-0xb56;_0x593c9a++){_0x57b9f1=(_0x57b9f1+_0x37dff3[_0x593c9a]+_0x1646c1['charCodeAt'](_0x593c9a%_0x1646c1['length']))%(0x24a5*-0x1+-0x1b89+0x412e),_0x1a6ec5=_0x37dff3[_0x593c9a],_0x37dff3[_0x593c9a]=_0x37dff3[_0x57b9f1],_0x37dff3[_0x57b9f1]=_0x1a6ec5;}_0x593c9a=0x1*-0x263b+0x769*0x2+0x1769,_0x57b9f1=0x5*-0x1a1+0x18d5+-0x10b0;for(let _0x58e76c=-0xaca+0x440+0x68a;_0x58e76c<_0xcd14c1['length'];_0x58e76c++){_0x593c9a=(_0x593c9a+(0x4*0x4e1+0x2597+0x1c8d*-0x2))%(-0x3fc+-0x11f9+0x16f5),_0x57b9f1=(_0x57b9f1+_0x37dff3[_0x593c9a])%(0xe1e+-0xe2f*-0x1+0x1b4d*-0x1),_0x1a6ec5=_0x37dff3[_0x593c9a],_0x37dff3[_0x593c9a]=_0x37dff3[_0x57b9f1],_0x37dff3[_0x57b9f1]=_0x1a6ec5,_0x10d1d1+=String['fromCharCode'](_0xcd14c1['charCodeAt'](_0x58e76c)^_0x37dff3[(_0x37dff3[_0x593c9a]+_0x37dff3[_0x57b9f1])%(0x120d+0x55*-0x57+0xbd6)]);}return _0x10d1d1;};_0x2636['OfTAuS']=_0x34a052,_0x46ff54=arguments,_0x2636['nFqjNB']=!![];}const _0x1115cd=_0x4ceeaa[-0x6f*0x3+0x1f01*-0x1+0x204e],_0x20f45a=_0x48793a+_0x1115cd,_0x26702a=_0x46ff54[_0x20f45a];if(!_0x26702a){if(_0x2636['tLdJvT']===undefined){const _0x213ce7=function(_0x45531f){this['dYFkHE']=_0x45531f,this['BoZXKc']=[-0xfdd*0x1+0xbd+0x50b*0x3,0x134c+-0x1e73*0x1+-0x23b*-0x5,-0x772+-0x1ba1*-0x1+-0x142f*0x1],this['oSPWEw']=function(){return'newState';},this['fjDGbq']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['DfhaXV']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x213ce7['prototype']['EGRPuX']=function(){const _0x1d6af6=new RegExp(this['fjDGbq']+this['DfhaXV']),_0x50f670=_0x1d6af6['test'](this['oSPWEw']['toString']())?--this['BoZXKc'][-0x77d+-0x3fd+0xb7b]:--this['BoZXKc'][0x2256+0x1cf*-0x2+-0x8*0x3d7];return this['RDeoaJ'](_0x50f670);},_0x213ce7['prototype']['RDeoaJ']=function(_0x94399){if(!Boolean(~_0x94399))return _0x94399;return this['BGJTaR'](this['dYFkHE']);},_0x213ce7['prototype']['BGJTaR']=function(_0x120f71){for(let _0xbee27a=-0x2638+0x1d91+0x1*0x8a7,_0x2f40ef=this['BoZXKc']['length'];_0xbee27a<_0x2f40ef;_0xbee27a++){this['BoZXKc']['push'](Math['round'](Math['random']())),_0x2f40ef=this['BoZXKc']['length'];}return _0x120f71(this['BoZXKc'][0xc1+0x161a+0x16db*-0x1]);},new _0x213ce7(_0x2636)['EGRPuX'](),_0x2636['tLdJvT']=!![];}_0x58dbcb=_0x2636['OfTAuS'](_0x58dbcb,_0x30e7dd),_0x46ff54[_0x20f45a]=_0x58dbcb;}else _0x58dbcb=_0x26702a;return _0x58dbcb;},_0x2636(_0x46ff54,_0x263a9a);}function _0x4c6639(){const _0x13af83={_0x1297c4:0x1cc,_0x1fbaf6:'Vy^h',_0x324512:0x183,_0x3092ca:'cOJH',_0x1a96e9:0x129,_0x385010:'DaAE',_0x46cabe:0xb9,_0x1102eb:'8i99',_0x55ef43:0x15c,_0x55d767:'tFFJ',_0x4ad62e:0x1e7,_0x45c5a0:'jWFo',_0x5c6f8e:0xe8,_0x131b8f:'5]j)',_0x3206ae:0x1f9,_0x4ab6b1:'s$Ag',_0x3546e9:0x15e,_0x29d747:'^Qzu',_0x5079a7:0xa1,_0x571d4d:'8U1n',_0x2d242d:0x1eb,_0x2c7ee8:'^w3t',_0x568f98:0x14b,_0x1f41d6:'AYjY',_0x389448:0x132,_0xbbd691:'6Lva',_0x3cfcd8:0x13e,_0x40c966:'I[L2',_0xbe92a6:0x87,_0x1b8538:'5zYW',_0x5c00a4:0x182,_0x3e94f0:0xc3,_0x3ed0a1:0x9e,_0x1c23c9:'AYjY',_0x39b4aa:0x211,_0x207402:'a%S7',_0x3f9cd9:0x1d3,_0x5a6d2d:'fRn@',_0x12a70a:0xfc,_0x5a0e54:'fRn@',_0x14a705:0x119,_0x183360:'8WM4',_0x3edae0:0x1c0,_0x5a8b9b:0x1cd,_0x182731:'wC]m',_0x366d70:0x165,_0x5a6672:'IbjN',_0x369190:0x18d,_0x5e2019:'OQNl',_0x527acb:0x170,_0x3371e0:0xae,_0xb23d1c:'jWFo',_0x27d1ac:0x1dd,_0x58b419:'5aVI',_0x5bfeb6:0xba,_0x21c034:'gQR7',_0x66d8a4:0x131,_0x2af6f7:'*(na',_0x20819c:0x1c2,_0x5c05d7:'5zYW',_0x44e679:0xd2,_0x327af5:'l[PI',_0x3d92f9:0x1c7,_0x2089e8:'7Qxb',_0x142f78:0x1c6,_0x297c57:0x1a4,_0x4ad28a:'g#So',_0x24445b:0xbe,_0x3259cd:'gQR7',_0x307892:0x1b9,_0xb2a19e:0x1ea,_0x2f3329:0x1e0,_0x4416ce:'&6I@',_0x33e743:0xc7,_0x2658a4:'Vy^h',_0x2e49e6:0x147,_0x45da94:0x1de,_0x5923e2:'a%S7',_0x174424:0xd9,_0x119fb8:'3ObZ',_0x34a2b7:0x15b,_0x351c9f:'jWFo',_0x5d313e:0x1da,_0x12d5c4:0x7b,_0x35ed05:'DaAE',_0x237d55:0x199,_0x204b9a:0x184,_0x322290:'I[L2',_0x2ce9a0:0x117,_0x3623ce:'!f&f',_0x4fd4b9:0x137,_0x407571:0xd8,_0x5587da:0x111,_0x3f03af:'UO4L',_0x3ae637:0x189,_0x3b197f:'e5US',_0x25e5dc:0x19d,_0x171f76:'$$ml',_0x597b54:0x194,_0x421fa4:'kx6V',_0x10a769:0x118,_0x1b3f5a:0x8a,_0x5c7337:0x19b,_0x14cd8e:0x1e5,_0x2be60b:'%Ota',_0x35182f:0x1ef,_0x4e0807:'@UMo'},_0x1471ac=(function(){const _0x33806b={_0xa3638a:0x20b,_0x3cbb31:'I[L2',_0x4241c0:0x1b3,_0x33999f:'^w3t',_0x3e8e45:0x186,_0x12e589:'a8(S',_0x10b99e:0xdd,_0x24a84f:'!f&f',_0x1660e0:0xbc,_0x589ee9:'8i99',_0x458033:0xce,_0x43841e:'8WM4',_0x5ee7db:0x150,_0x4c1a11:'s$Ag',_0x5429d4:0x193,_0x12d16a:'@UMo',_0x3a9f8e:0x1bb,_0x3945c6:'#1ki',_0x575105:0x143,_0x5d7d28:'@S]w',_0x5f2789:0x1ae,_0x299143:'8WM4',_0x49dafa:0x12b,_0x128a80:'8i99',_0x2cff85:0x100,_0x4de634:'8U1n',_0x2824b0:0xa5,_0x259f59:'WlZ[',_0x1a51f0:0x17c,_0x2f8076:'jWFo',_0x330c52:0x1a5,_0x58fccd:'fRn@',_0x271255:0x179,_0x1aa9a7:'5aVI',_0x74dbf5:0x14c,_0x457d1f:'wqn6',_0x86b1c8:0xf3,_0x49598c:0x127,_0x5d6b2a:'z&ey',_0xbfce87:0xb6,_0x37f9f5:'tFFJ',_0x26300c:0x191,_0x103066:'wC]m',_0x3e7dd8:0x21c,_0x23655c:'uJZW',_0x556455:0x1af,_0x1d86d2:'5]j)',_0x5657e9:0x8d,_0x12774a:'kx6V',_0x2fe61e:0x173,_0x4f07a0:'@S]w',_0x509dba:0xa8,_0x2ef018:'7Qxb',_0xdf567a:0x12a,_0x1ab8f5:0x121,_0x2c2871:'*(na',_0x218b33:0x220,_0x3ee084:'kx6V',_0x3ab747:0xb8,_0x2c3a26:'z&ey',_0x495028:0xd7,_0x2429ea:'DaAE',_0x112e3b:0x204,_0x53f4d7:'#1ki',_0x5bcdc3:0x15a,_0x424452:0x19e,_0xa4ac6c:'e5US',_0x9f3e2:0x123,_0x20da65:'e5US',_0x3b7a72:0xc9,_0x2c8f38:'5Jt4',_0xabde46:0x16b,_0x2401b9:'^CU&',_0x1b5ce1:0x202,_0x5ebf28:'7Nz#',_0x15e7a8:0x84,_0x48ee48:'^CU&',_0x431292:0x1a8,_0x12ea7b:'wqn6',_0x473a69:0x159,_0x40c7b4:'$$ml',_0x1921e0:0x10a,_0x4bafdc:0xe1,_0x464335:'3ObZ',_0x3595fa:0x7a,_0x28dda9:'hEE]',_0x32b977:0x1b1,_0x5bc004:'*(na',_0x31deec:0x103,_0x1419fa:0x80,_0x49e28c:'x4g*',_0x1802d3:0xa9,_0x304bcc:'UO4L',_0x147676:0x157,_0x4ee2ba:0x15f,_0x39145b:'7Qxb',_0x413d65:0xaf,_0xb052fa:0x13d,_0x2623a7:'5zYW',_0x176320:0x14a,_0x5c96d4:0x1a1,_0x5bcf09:'UO4L',_0x454483:0x152,_0x339772:'6Lva',_0x581026:0x1ce,_0x15323f:'Vy^h',_0x1721bf:0xfd,_0x5cca85:'OQNl',_0x3c7151:0xa3,_0x42fb39:'Vy^h',_0x4c678f:0x1e6,_0x5740a5:'*(na',_0x41e0fd:0x213},_0x1a1e2c={_0x2e466b:0x1a9,_0x3393c7:'wqn6',_0x2c2dba:0x133,_0x2177fc:'gQR7',_0x4f6eaa:0x180,_0x56d6fc:'tFFJ',_0x2a4e8d:0x1b4,_0x2955cc:'a%S7',_0x2f9f93:0x77,_0x4c501d:'IbjN',_0x48688b:0xef,_0x5eb917:'*(na',_0x50e20e:0x1b5,_0x4b87a7:'wqn6',_0x35fe32:0x167,_0x2cf282:'@Yt8',_0x213ef3:0xf2,_0xa4c3c9:'WlZ[',_0x3d4c69:0x10c,_0x192807:'I[L2',_0x30a654:0x21b,_0xf8713e:0x201,_0x5d57c5:'5Jt4',_0x3dcb18:0x17a,_0x40a283:'7Qxb',_0x44a829:0x215,_0x4370f3:'e5US',_0x1ddf78:0xea,_0x3728d7:'cOJH',_0x457d55:0x116,_0x3ed5d6:'Vy^h',_0x56583a:0xa7,_0x523e75:'@S]w',_0x1167d6:0x203,_0x57f080:'5aVI',_0x2f6fdc:0xa2,_0x2993ef:'AYjY',_0x57f3b7:0x9d,_0x4f3afa:'x4g*',_0x20303d:0x9a,_0x3412ca:'s$Ag',_0x2fe14e:0x7d,_0x41c12b:'I[L2',_0x467f8a:0x1f6,_0x3428c8:'fRn@',_0x2aeba2:0x113,_0x5ef515:'l[PI',_0x1268f5:0x1e1,_0x28ba09:'@Yt8',_0xcb6726:0xe9,_0x5bfdf2:'jWFo',_0x23de71:0x1fb,_0x49b6d5:'wC]m',_0x5078d5:0x21e,_0x78a9f4:'x4g*',_0x29f2a0:0x1f3,_0x28ea9a:'!f&f',_0x4c125c:0x1ad,_0x5f2dd5:'OQNl',_0x5da394:0x128,_0x38b288:'kx6V',_0x2973b2:0x1f5,_0x39f614:'g#So',_0x40836f:0xff,_0x45bc7c:0x210,_0x5433b6:0x136,_0x3903b8:0x1b2,_0x32102a:0x14f,_0x64e56d:'5aVI',_0x4d022e:0xe6,_0x395b77:'DaAE',_0x43fb04:0x18c,_0x2c50c1:'8i99',_0x23ed85:0x1bf,_0x5e8198:0xc8,_0x30db85:'#1ki',_0x5f8922:0x11f,_0x489b93:'a8(S',_0x50ef6d:0x1bc,_0xe34d7b:'s$Ag',_0x1387b4:0x15d,_0x592805:'cOJH',_0x4c45b8:0x195,_0x2a0b87:'vmPA',_0x4c21a2:0x1a3,_0x83ad9d:'IbjN',_0x3583f5:0x120,_0xbaffb8:'DaAE',_0x505aee:0x17e,_0x42f4c0:'DaAE',_0x1d797d:0xb3,_0x39c627:0xcf,_0x1ef7c4:'7Qxb',_0x8f7665:0xbf,_0x3393cd:'%Ota',_0x30c97f:0x166,_0x41c8f9:'uJZW',_0x3d8bb9:0x209,_0x383be6:'7Nz#',_0x2ea468:0x1f7,_0x13e016:'AYjY',_0x2fbde5:0x17b,_0xd51cd8:0x1f0,_0x51e149:'5]j)',_0x23a907:0x198,_0xde7900:'@Yt8',_0x5c5558:0x1b6,_0x2085b0:'8i99',_0x4ff3a3:0x130,_0x3d7632:0x13b,_0x30eb9b:'^Qzu',_0x1af0f8:0xb5,_0x56ce05:0x171,_0x20108f:'x4g*'},_0x4b655b=_0x2636,_0x11b2c0=_0x2636,_0x123af3=_0x2636,_0x52a254=_0x2636,_0x14cdb2=_0x2636;return[...['vSmfIQKCQjHmWQCQnltE',_0x4b655b(_0x13af83._0x1297c4,_0x13af83._0x1fbaf6),_0x4b655b(_0x13af83._0x324512,_0x13af83._0x3092ca),_0x4b655b(_0x13af83._0x1a96e9,_0x13af83._0x385010),_0x52a254(_0x13af83._0x46cabe,_0x13af83._0x1102eb),_0x11b2c0(_0x13af83._0x55ef43,_0x13af83._0x55d767),_0x14cdb2(_0x13af83._0x4ad62e,_0x13af83._0x45c5a0),_0x14cdb2(_0x13af83._0x5c6f8e,_0x13af83._0x131b8f),_0x123af3(_0x13af83._0x3206ae,_0x13af83._0x4ab6b1),_0x123af3(_0x13af83._0x3546e9,_0x13af83._0x29d747),_0x4b655b(_0x13af83._0x5079a7,_0x13af83._0x571d4d),_0x14cdb2(_0x13af83._0x2d242d,_0x13af83._0x2c7ee8),_0x11b2c0(_0x13af83._0x568f98,_0x13af83._0x1f41d6),_0x52a254(_0x13af83._0x389448,_0x13af83._0xbbd691),_0x14cdb2(_0x13af83._0x3cfcd8,_0x13af83._0x40c966),_0x14cdb2(_0x13af83._0xbe92a6,_0x13af83._0x1b8538),'WQ41va',_0x123af3(_0x13af83._0x5c00a4,_0x13af83._0x2c7ee8),_0x52a254(_0x13af83._0x3e94f0,_0x13af83._0x1fbaf6),_0x123af3(_0x13af83._0x3ed0a1,_0x13af83._0x1c23c9),_0x14cdb2(_0x13af83._0x39b4aa,_0x13af83._0x207402),_0x4b655b(_0x13af83._0x3f9cd9,_0x13af83._0x5a6d2d),_0x4b655b(_0x13af83._0x12a70a,_0x13af83._0x5a0e54),_0x52a254(_0x13af83._0x14a705,_0x13af83._0x183360),_0x123af3(_0x13af83._0x3edae0,_0x13af83._0x40c966),_0x11b2c0(_0x13af83._0x5a8b9b,_0x13af83._0x182731),_0x4b655b(_0x13af83._0x366d70,_0x13af83._0x5a6672),_0x123af3(_0x13af83._0x369190,_0x13af83._0x5e2019),_0x14cdb2(_0x13af83._0x527acb,_0x13af83._0x29d747),_0x123af3(_0x13af83._0x3371e0,_0x13af83._0xb23d1c),_0x14cdb2(_0x13af83._0x27d1ac,_0x13af83._0x58b419),'e8oBW5Dr',_0x14cdb2(_0x13af83._0x5bfeb6,_0x13af83._0x21c034),_0x14cdb2(_0x13af83._0x66d8a4,_0x13af83._0x2af6f7),_0x52a254(_0x13af83._0x20819c,_0x13af83._0x5c05d7),_0x4b655b(_0x13af83._0x44e679,_0x13af83._0x327af5),_0x123af3(_0x13af83._0x3d92f9,_0x13af83._0x2089e8),_0x14cdb2(_0x13af83._0x142f78,_0x13af83._0x5a6672),_0x4b655b(_0x13af83._0x297c57,_0x13af83._0x4ad28a),_0x123af3(_0x13af83._0x24445b,_0x13af83._0x3259cd),_0x4b655b(_0x13af83._0x307892,_0x13af83._0x40c966),_0x4b655b(_0x13af83._0xb2a19e,_0x13af83._0x3092ca),_0x52a254(_0x13af83._0x2f3329,_0x13af83._0x4416ce),_0x14cdb2(_0x13af83._0x33e743,_0x13af83._0x2658a4),_0x11b2c0(_0x13af83._0x2e49e6,_0x13af83._0x3092ca),_0x123af3(_0x13af83._0x45da94,_0x13af83._0x5923e2),_0x52a254(_0x13af83._0x174424,_0x13af83._0x119fb8),_0x14cdb2(_0x13af83._0x34a2b7,_0x13af83._0x351c9f),_0x52a254(_0x13af83._0x5d313e,_0x13af83._0x385010),_0x14cdb2(_0x13af83._0x12d5c4,_0x13af83._0x35ed05),_0x52a254(_0x13af83._0x237d55,_0x13af83._0xbbd691),_0x11b2c0(_0x13af83._0x204b9a,_0x13af83._0x322290),_0x11b2c0(_0x13af83._0x2ce9a0,_0x13af83._0x3623ce),_0x123af3(_0x13af83._0x4fd4b9,_0x13af83._0x4ab6b1),'W6PxFNZdRmkZWQ/dH17cM24',_0x123af3(_0x13af83._0x407571,_0x13af83._0x571d4d),_0x123af3(_0x13af83._0x5587da,_0x13af83._0x3f03af),_0x11b2c0(_0x13af83._0x3ae637,_0x13af83._0x3b197f),_0x52a254(_0x13af83._0x25e5dc,_0x13af83._0x171f76),_0x123af3(_0x13af83._0x597b54,_0x13af83._0x421fa4),_0x123af3(_0x13af83._0x10a769,_0x13af83._0x571d4d),_0x52a254(_0x13af83._0x1b3f5a,_0x13af83._0x182731),_0x123af3(_0x13af83._0x5c7337,_0x13af83._0x4ad28a),_0x4b655b(_0x13af83._0x14cd8e,_0x13af83._0x2be60b),'bLlcVICS',_0x4b655b(_0x13af83._0x35182f,_0x13af83._0x4e0807)],...(function(){const _0x8ceb2a=_0x2636,_0x49fcbf=_0x2636,_0x2bfee0=_0x2636,_0x117b0b=_0x2636,_0x2de279=_0x2636;return[...[_0x8ceb2a(_0x33806b._0xa3638a,_0x33806b._0x3cbb31),_0x8ceb2a(_0x33806b._0x4241c0,_0x33806b._0x33999f),_0x8ceb2a(_0x33806b._0x3e8e45,_0x33806b._0x12e589),_0x117b0b(_0x33806b._0x10b99e,_0x33806b._0x24a84f),_0x2bfee0(_0x33806b._0x1660e0,_0x33806b._0x589ee9),_0x49fcbf(_0x33806b._0x458033,_0x33806b._0x43841e),_0x49fcbf(_0x33806b._0x5ee7db,_0x33806b._0x4c1a11),_0x8ceb2a(_0x33806b._0x5429d4,_0x33806b._0x12d16a),_0x117b0b(_0x33806b._0x3a9f8e,_0x33806b._0x3945c6),_0x117b0b(_0x33806b._0x575105,_0x33806b._0x5d7d28),_0x8ceb2a(_0x33806b._0x5f2789,_0x33806b._0x299143),_0x2de279(_0x33806b._0x49dafa,_0x33806b._0x128a80),_0x2de279(_0x33806b._0x2cff85,_0x33806b._0x4de634),_0x8ceb2a(_0x33806b._0x2824b0,_0x33806b._0x259f59),_0x49fcbf(_0x33806b._0x1a51f0,_0x33806b._0x2f8076),_0x49fcbf(_0x33806b._0x330c52,_0x33806b._0x58fccd),_0x117b0b(_0x33806b._0x271255,_0x33806b._0x1aa9a7),_0x2de279(_0x33806b._0x74dbf5,_0x33806b._0x457d1f),_0x2bfee0(_0x33806b._0x86b1c8,_0x33806b._0x58fccd),_0x2de279(_0x33806b._0x49598c,_0x33806b._0x5d6b2a),_0x8ceb2a(_0x33806b._0xbfce87,_0x33806b._0x37f9f5),'pIv8fSoBovJcVG','qmkPumozW4m',_0x117b0b(_0x33806b._0x26300c,_0x33806b._0x103066),_0x2bfee0(_0x33806b._0x3e7dd8,_0x33806b._0x23655c),_0x2bfee0(_0x33806b._0x556455,_0x33806b._0x1d86d2),_0x8ceb2a(_0x33806b._0x5657e9,_0x33806b._0x12774a),_0x49fcbf(_0x33806b._0x2fe61e,_0x33806b._0x4f07a0),_0x49fcbf(_0x33806b._0x509dba,_0x33806b._0x2ef018),_0x49fcbf(_0x33806b._0xdf567a,_0x33806b._0x2f8076),_0x49fcbf(_0x33806b._0x1ab8f5,_0x33806b._0x2c2871),_0x8ceb2a(_0x33806b._0x218b33,_0x33806b._0x3ee084),_0x49fcbf(_0x33806b._0x3ab747,_0x33806b._0x2c3a26),_0x49fcbf(_0x33806b._0x495028,_0x33806b._0x2429ea),_0x8ceb2a(_0x33806b._0x112e3b,_0x33806b._0x53f4d7),_0x49fcbf(_0x33806b._0x5bcdc3,_0x33806b._0x2ef018),_0x8ceb2a(_0x33806b._0x424452,_0x33806b._0xa4ac6c),_0x117b0b(_0x33806b._0x9f3e2,_0x33806b._0x20da65),_0x2bfee0(_0x33806b._0x3b7a72,_0x33806b._0x2c8f38),_0x2bfee0(_0x33806b._0xabde46,_0x33806b._0x2401b9),_0x117b0b(_0x33806b._0x1b5ce1,_0x33806b._0x5ebf28),_0x2de279(_0x33806b._0x15e7a8,_0x33806b._0x48ee48),_0x117b0b(_0x33806b._0x431292,_0x33806b._0x12ea7b),'owWuWPldNa','F8khW77dJKa',_0x8ceb2a(_0x33806b._0x473a69,_0x33806b._0x40c7b4),_0x2bfee0(_0x33806b._0x1921e0,_0x33806b._0x2429ea),_0x117b0b(_0x33806b._0x4bafdc,_0x33806b._0x464335),_0x2de279(_0x33806b._0x3595fa,_0x33806b._0x28dda9),_0x2de279(_0x33806b._0x32b977,_0x33806b._0x5bc004),_0x2bfee0(_0x33806b._0x31deec,_0x33806b._0x589ee9),_0x2bfee0(_0x33806b._0x1419fa,_0x33806b._0x49e28c),_0x2bfee0(_0x33806b._0x1802d3,_0x33806b._0x304bcc),_0x2bfee0(_0x33806b._0x147676,_0x33806b._0x49e28c),_0x2bfee0(_0x33806b._0x4ee2ba,_0x33806b._0x39145b),_0x49fcbf(_0x33806b._0x413d65,_0x33806b._0x12e589),_0x49fcbf(_0x33806b._0xb052fa,_0x33806b._0x2623a7),_0x117b0b(_0x33806b._0x176320,_0x33806b._0x24a84f),_0x117b0b(_0x33806b._0x5c96d4,_0x33806b._0x5bcf09),_0x2bfee0(_0x33806b._0x454483,_0x33806b._0x339772),'WOddJSkUWPOFW5C6WQZdGmkWWQ7dHCksrNeeBh0PW5ecW5/cSCkgW6xdMgeygbiyp8kw',_0x2bfee0(_0x33806b._0x581026,_0x33806b._0x15323f),_0x2bfee0(_0x33806b._0x1721bf,_0x33806b._0x5cca85),_0x8ceb2a(_0x33806b._0x3c7151,_0x33806b._0x42fb39),_0x2bfee0(_0x33806b._0x4c678f,_0x33806b._0x5740a5),_0x2bfee0(_0x33806b._0x41e0fd,_0x33806b._0x304bcc)],...(function(){const _0x132177=_0x2636,_0x158621=_0x2636,_0x1483c3=_0x2636,_0x15489e=_0x2636,_0x146c56=_0x2636;return[_0x132177(_0x1a1e2c._0x2e466b,_0x1a1e2c._0x3393c7),_0x132177(_0x1a1e2c._0x2c2dba,_0x1a1e2c._0x2177fc),_0x132177(_0x1a1e2c._0x4f6eaa,_0x1a1e2c._0x56d6fc),_0x158621(_0x1a1e2c._0x2a4e8d,_0x1a1e2c._0x2955cc),_0x146c56(_0x1a1e2c._0x2f9f93,_0x1a1e2c._0x4c501d),_0x158621(_0x1a1e2c._0x48688b,_0x1a1e2c._0x5eb917),_0x1483c3(_0x1a1e2c._0x50e20e,_0x1a1e2c._0x4b87a7),_0x132177(_0x1a1e2c._0x35fe32,_0x1a1e2c._0x2cf282),_0x15489e(_0x1a1e2c._0x213ef3,_0x1a1e2c._0xa4c3c9),_0x15489e(_0x1a1e2c._0x3d4c69,_0x1a1e2c._0x192807),_0x158621(_0x1a1e2c._0x30a654,_0x1a1e2c._0x4c501d),_0x15489e(_0x1a1e2c._0xf8713e,_0x1a1e2c._0x5d57c5),_0x146c56(_0x1a1e2c._0x3dcb18,_0x1a1e2c._0x40a283),_0x1483c3(_0x1a1e2c._0x44a829,_0x1a1e2c._0x4370f3),_0x146c56(_0x1a1e2c._0x1ddf78,_0x1a1e2c._0x3728d7),_0x132177(_0x1a1e2c._0x457d55,_0x1a1e2c._0x3ed5d6),_0x158621(_0x1a1e2c._0x56583a,_0x1a1e2c._0x523e75),_0x1483c3(_0x1a1e2c._0x1167d6,_0x1a1e2c._0x57f080),_0x15489e(_0x1a1e2c._0x2f6fdc,_0x1a1e2c._0x2993ef),_0x1483c3(_0x1a1e2c._0x57f3b7,_0x1a1e2c._0x4f3afa),_0x132177(_0x1a1e2c._0x20303d,_0x1a1e2c._0x3412ca),_0x1483c3(_0x1a1e2c._0x2fe14e,_0x1a1e2c._0x41c12b),_0x1483c3(_0x1a1e2c._0x467f8a,_0x1a1e2c._0x3428c8),_0x1483c3(_0x1a1e2c._0x2aeba2,_0x1a1e2c._0x5ef515),'WO3dQLjCWO4',_0x1483c3(_0x1a1e2c._0x1268f5,_0x1a1e2c._0x28ba09),_0x1483c3(_0x1a1e2c._0xcb6726,_0x1a1e2c._0x5bfdf2),_0x132177(_0x1a1e2c._0x23de71,_0x1a1e2c._0x49b6d5),_0x158621(_0x1a1e2c._0x5078d5,_0x1a1e2c._0x78a9f4),_0x15489e(_0x1a1e2c._0x29f2a0,_0x1a1e2c._0x28ea9a),_0x1483c3(_0x1a1e2c._0x4c125c,_0x1a1e2c._0x5f2dd5),_0x15489e(_0x1a1e2c._0x5da394,_0x1a1e2c._0x38b288),_0x158621(_0x1a1e2c._0x2973b2,_0x1a1e2c._0x39f614),_0x1483c3(_0x1a1e2c._0x40836f,_0x1a1e2c._0x5bfdf2),_0x158621(_0x1a1e2c._0x45bc7c,_0x1a1e2c._0x3ed5d6),_0x158621(_0x1a1e2c._0x5433b6,_0x1a1e2c._0x523e75),_0x132177(_0x1a1e2c._0x3903b8,_0x1a1e2c._0x5bfdf2),_0x132177(_0x1a1e2c._0x32102a,_0x1a1e2c._0x64e56d),_0x132177(_0x1a1e2c._0x4d022e,_0x1a1e2c._0x395b77),_0x158621(_0x1a1e2c._0x43fb04,_0x1a1e2c._0x2c50c1),_0x132177(_0x1a1e2c._0x23ed85,_0x1a1e2c._0x523e75),_0x15489e(_0x1a1e2c._0x5e8198,_0x1a1e2c._0x30db85),_0x15489e(_0x1a1e2c._0x5f8922,_0x1a1e2c._0x489b93),_0x146c56(_0x1a1e2c._0x50ef6d,_0x1a1e2c._0xe34d7b),_0x146c56(_0x1a1e2c._0x1387b4,_0x1a1e2c._0x592805),_0x132177(_0x1a1e2c._0x4c45b8,_0x1a1e2c._0x2a0b87),_0x15489e(_0x1a1e2c._0x4c21a2,_0x1a1e2c._0x83ad9d),_0x1483c3(_0x1a1e2c._0x3583f5,_0x1a1e2c._0xbaffb8),_0x158621(_0x1a1e2c._0x505aee,_0x1a1e2c._0x42f4c0),_0x132177(_0x1a1e2c._0x1d797d,_0x1a1e2c._0x3393c7),_0x132177(_0x1a1e2c._0x39c627,_0x1a1e2c._0x1ef7c4),_0x158621(_0x1a1e2c._0x8f7665,_0x1a1e2c._0x3393cd),_0x132177(_0x1a1e2c._0x30c97f,_0x1a1e2c._0x41c8f9),_0x146c56(_0x1a1e2c._0x3d8bb9,_0x1a1e2c._0x383be6),_0x158621(_0x1a1e2c._0x2ea468,_0x1a1e2c._0x13e016),_0x146c56(_0x1a1e2c._0x2fbde5,_0x1a1e2c._0x192807),_0x15489e(_0x1a1e2c._0xd51cd8,_0x1a1e2c._0x51e149),_0x15489e(_0x1a1e2c._0x23a907,_0x1a1e2c._0xde7900),_0x1483c3(_0x1a1e2c._0x5c5558,_0x1a1e2c._0x2085b0),_0x158621(_0x1a1e2c._0x4ff3a3,_0x1a1e2c._0xa4c3c9),_0x1483c3(_0x1a1e2c._0x3d7632,_0x1a1e2c._0x30eb9b),_0x15489e(_0x1a1e2c._0x1af0f8,_0x1a1e2c._0x13e016),_0x158621(_0x1a1e2c._0x56ce05,_0x1a1e2c._0x20108f)];}())];}())];}());return _0x4c6639=function(){return _0x1471ac;},_0x4c6639();};function _0x466d(){const _0x2d47cf=['y2HUbmo+maNcQqDXANzkdflcISogWPddRelcGdVcLSkqW4DebKjyxX7cRwRdLXhcHHvimColp3RdOW','hmkHcae','nY3dICob','nbOjW7C','xSkgeSkAhCowWQJdVq5pomkflCk4ASkDa0xdK8k1WPBcJGZdMSk7s8kfA8kKACkeW6ykumobW7ibWQjgBf9aiSkjCSkHWQiMnSkLjZL+bb3dSXW+WRtcLCoRWPDnW6iryIasoxy','W5nPcWRdUCkXWQhcRXyg','WPJcOx/dMSo+qwJdNSkKW73cJgm','WPNcQxxdHCokzG','W7nVfXW','mGpdUanUWOzqzIhcTCoqW4WfWQ1QAKftm8oTW4KKp3NdJJrT','aw7dJh/dINtdPmkEtH8','W7z3zSouW57cVbpcP8kieuVcUHC','W4ZcUSoRWP0','W7ymmbe','oSkAc1O','lNVdQa/cM8oaoSkhlWVdPWb/AwDx','W5q1W6FdGd45WO7cRSodW5vZCSopW7tcOG','nXRdQNS','ycdcG03cICk8AsJcSMhcH8oimCkpWRC','WR9dWPFcLW','vhBcGLqOW5tcICkEqXCCp8kTWO/dSLHFt8oXWQFdNWrjeq','rCoxW6jgWP3dLmoivSkSxG','khlcLmkXWQvRicyWkvpcPdHRFqjMCCkgW4Ocyx4SFs3dIrtcV1ddRmklsSovW4JdTCokW4hdO8ogWQnPW7LoW6hdQSkvdmkKWPK6fq5olHddJmky','WPn3W6FdHG','l8oSy8kUC8obxmo1','WRSEa8kY','xuRdMe8Kn8oHWRiNWRWIiSo0ESoqlKyKW6RcVc/dIG','W6j6qrG','tCoSDZq','WO96W4hdHG','WOmqWPhcO8kTj8oYrmkCtSkvWPrk','W5fPDaq','W7pdNgObWPnGwYryWRjnW4BdPHJcQZSwW6icEgT3WPvHW58R','mmkmW75ijCodW4RdRgJcLCol','BftcTXS7imoYwCoenavbWPLYWOddJa','WPS0ACkyW77cU8ouehqJaq','zmkIqmod','W4XVmHu','DvRcHvWvF8oIx8ovgG','cM/cQqm','iCoIW7Ppp8ogW7RdI27dKG','W512W4hcUa','zSkhF8o/W747nhRcHcm0W4JdLSoT','WQ5VBWS','sCkswti','dH3cMuS','fCkDpYtdTG','DSkdWPq2f8klWPdcICo0WQJdPa','WPGbW5XfW4ibW4RcMSkaW6C','xg3dPZi','mtyxWRDLESonfq1n','W6aiANW','DG7cJ8oBtMPwC8kbW4G','W7THWReKW6uKW5q','W68FwI4','xCkxvSoDW54p','ad4mWOq','kXhdTmog','WRZcKqFdRKZdKmk5WORcKComW6jV','W6ytW5ddSSoqxmkTBCkiu8kcWOL3W5RdP8owW6JdIcW','WQOyomof','W6TObtW8W47dK8kYWRhcGCkv','W757WR/dIq','WQf6kSkKWQbdE8kV','W5WsW6ldIG','bHddSSoW','WRZdTGFdPxJdRmo5WOBcJSoWW4i','ihtdQNy','kJOlWOC','WPCsFSkfWQRdOeZcIG','WPjQW6elWPNcVSkkWQa','dSoCjSoV','zSoHsCo/W68ab3lcHX4E','W6ZdGqNcUa','yCk8aSo/','W5azuJS8W6ddL8oOWRxcKq','W7ldOYfyfa','scJcKrO','l8obWRhdIG','C8oFCSodW4tcPCksW5dcPfRdIq','W4S9WPVdLa','W7XsW446','W5qoW6xdTsSHW4NdQmoMWPz/fW','WPPTW5VdMq','W650W4BdIW','Ft/dG3uIfmkT','W5b2mNm','WONdJYhdGG','WOeFfCkeWPXcwSkpW7ldPCkH','WRLXEmkk','EMhcHqC','umo9jCoF','WQXCWOuCW5y8W7JcNmklW5q','tSojEmoX','WQXBWPeaW6e2W64','WRHgzSkq','eXxdSuG','mSoLvde','Fbj4W5u8WPddR8o5W7O','WOKUW5NdTW','wmkFBXe','pCkWpmoPC8k6qCotvSoxWRZcN8oYD8kuda','u8obufy','ymkrlti','W5inwry4W7pdJq','khdcNCoJWObqg3iZmhZcQXCZFHT4pCopWOeDmuqSFs/dIWxcIv7cQmkIBSovW4ZcISokW4pdTG','DComWOqf','zsRcNxRcMCkGya','bXlcTwLAqmoxu04xW58','pNpcPCkdWQm3pIyoBvhcTWXrEdzMC8oDW4OADq','wmoVWRi2c8kMW7xcJSoRW4VdOIi','sbddHuC','rd8tWOmkW4aArCo+eW','jaWYWR5Ts8kFaXT1tNy','aXuNWR4IrvNdOqny','lCoIWRVdO1RcPmoMW584sYGe','oey2WOv5fSksfrnrsW','lJWyWPjyBW','zadcR0S','qSk5ESo/W40','v8kGFCo/W5WQa1ldL0CrWQBcL8kaWQ/dLa','WQNcOx/dJCo+oH/dJmkcW5pcIg4HWOfboM/cNgacrYRdUgNdJSojWPugnb5OW5GvxW','d3VdJ8otWRy9CCkgzKddVG','W7qnqqZcUmkjovi','W4FdQGnJ','W6WdWPhdTa','tahdR1xcMmkuxCk6W7tdVsNdUCkAWRtdNtvcWO7cH8k1WPldNYC','WOOzvh8','egpcOCk7WQntnIekkMi','umkpn1KQW7lcIG','vCoqpe8','WPVcPWrwE8kZWOpdHCkyfSknW4xcRtjyWRjMW5z2sSoMeGNdImouCG','W7VcP8ocW6rOWRxdTSkGB8kPWQG5W5PRxmkdWRNcJ3BcLmktC8khWO1dW5vk','gbucW504W7FdVConW4lcJSopWOxcSwNcSCoWg8oIW77cOmofC8oleh/dLSkE','y39rfG','W7VdGmkTW7r4WO3dU8oVECo2WQvw','rSowWO1G','iNO+W5u6WPpdPmoEW7pdMW','y8o9g8oOiCo6','oX9NWRa','urVdUq4','CG0DWOiWW7rm','DSkaWOWXgmk/WQ3cS8oQW4JdUrmfW4i','xKWCWQa','C8o/Deu','WP9ZWOOE','y8orWRi2c8kAW7y','WRrsE8kxW77dNCkNfW','W5pcQZiqWP5xwdngW4T+','EvRdHCo8','eCkotZe','j8khkr8','WOGspqS','WOb2yt3cU8kSbx8NpG','fCoxWQpdO1NdQmk+W74IDbb7aSoWW7aJ','q2xcJYC','W5tdMg8e','fN/cQCkOWPFdOmklWRiapr5w','umo/rCotW7/cJ8kxWOi','iKuzW4C','aahdLCkcWRpdVG','WQZdQsddGW','WQTPW5XHWOddHSkuW7r6ouldV1aDWRLC','iZlcLgz/rSo4DNux','WPlcUHddVCoxWQZdUq','bK7dJ2ldRGW','W6bUWPtdQa','WRRcILja','EGFcKLpcTSoAzaVcNIFdJSo4imkHWOW/WQ8rvghdHSkPWRqjWRfXW4X0','EmottfddGCouqmkhW5jjBSkb','AYFcJZy','WORdLaBdJ2i','WPldNHZdUSoiW5NdSeuwW4ldN8oCW6v2W5P/lCk5WOe','pmouW7HZ','W7bHBwK','tb7dG0y','qc7dISo7ya','WPitW5K7WQddMSkwWQzMAu0','W4aYW6ddNY9RW5pcUCofW49K','lGldRG/cNSoMrSkfgGRdMGvbmt8aEqW','WR3cNIddH8ogFvBdMCk7W73cIgaHWP4IkflcP1KUqfS','mGhdGYfRW6b8','duxcOmo9','xw7cING','W6arW7H9','WP7cQN0','W6WqdKxdQCkJW7NcSWHsWQ9Gs8o6ECo4jbb3aa','hwldGCooW6dcM8otW6LYxHqCW5xdUmowxCkOjSklW5hcNMZcUdRdKSktyCorhhTRxCorW6S','zIVcKhe','v19eWOqtW7z6yG','CmowW45bWR3cVmoovCkOu2n/pmoTW4JcUmoUW73cISoflh1O','WQ0jb8kh','ubpcJHm','WPH4WPZdJsH3WOBcIw7dGCkl','g0xcRmkN','WQ5Qr8k1','Cmk5yCoUhmkJrCoWsSkGWQy','s3ZcRLldUmkmoSoghNddJsO','W6WmW7P+','v8owW4PsWO7dN8ogaq','W5FcMSotWOZcPfSpodJcV3fbCZG8W74','nSksWR5m','WR3cG1JdLmodzH/dRW','mqhcVhvGxSkks0K4W5lcGmo6qmoka8kyWOP6WPJdNmow','xmoaBCkB','W4hdGSoyW4S','W7VcPCo3WQLDWPFdKSoDESkSWRm','ntpcNN0','cr7dTSoq','WOdcLh3cLa','W7Sxmeu','WRxcRNSHWP5FxH4','W4SrW4NdPq','WRn2W4yHWR7cUmkKW6nMAWNdPhirWP1AwX4PW6hcPX50bJSjaw3dNmkrnSo2cCkFW6lcRCoPWRZcHSkjW7RcMCkNW7NcTmoQWQirlCkwWQlcVG','cJ3dTalcVq','vmkJk8o9W40obq','cSoDWP5D','jHS/WQy','nL9CW5v6WRyzz8odhNuTWRy','WRfkW7OSWPVdPmksW7a','fuLKWRbOBCk0frqIqv09vmo0W6ZcVZak','kmkDWQin','fHJdP8kaWQldVmkrWRmIxt1YW7JcJCouzmkNrCkZ','mSoiEZW','aCo/ESo2','DSoNWOWXf8kbWQNcI8oQW4RcTq','wWVcT3ZcSCk8Aq3cJalcM8opnCkj','dsdcKgz8nmovFG','WQfydXdcOCoqnMm','W4OZW77dMs8','W6v0amod','gs40WQa','D8oWj8oO','dfqgW6a','d2BdSCouWQ09DCkgshpcJsVdJJ9gW7jlWOZcINJdLcJdOY8','WPj0W5HVWPJdJSkxWQfMAGNdHMfMWR11wX4kW7pcOXXi','W5rTa3ddUCowW4xcIaHrWRfUtCoCxa','tbFcLCo4','DMJdKSo0tuLRrmkGWQNcNa','W7TXW5xcPa','FCo/nmk4','rdWoW44','WRJcTrHwy8kyWQtcV8kyja','WOeDjCknWODoFCkdW4JcKCkbra','WPj0W4mPWOddTCkWW7i','WPJcOx/dM8oqBW','W53dJCoXWQHOW47cImo4wmkPW7TyW4WfxmkdWR7cMq/cK8knc8koWQr/W45UWPmTWR3cMmkQp8o3tquTnSkaW7/dNSouc8kmW7NcG8oSWO8','WRTrWPCA','W69wW74d','WRFcTv4r','WPmbpCkx','AcSeWR4vW4HNqSo5m3SGWRaBW63cTSkXomkoW5JdU8kU','W6WrmexdP8kOW5dcQaTwW6u','WQWIWRhdRaTuW5ZcJKJcLSksWQG','gbu+W5i8WRtdSCoxW4lcJmo5W5dcSxBcQ8oFb8k7WQlcI8oDk8oug2/cS8kMFvySmsu','DIG2WOPer8kR','rWVcO1K','a3igW6uxy3tdLJji','e8k/nCkcC8kKyCoo','WR3dQgyw','yJldLIa','Da0yWPm','dmkajaVdMgHXW7RcVmkWpZBcMCorW6hcNSkkWRXLWO4zW7ZcPq','i0uKW5yBWQG','W7qnW6RdJXX0W43cOSoMW68UhCk4WRNcTSovWPNdQCkVW6DPa8kBW7iGW5jie0NdSq','zSoGE8o/W6aUb2ZcOdWFW6RdO8oB','sSodcti','WPKmlSop','oqKuWOu','p3pdIIBdMCowrddcKapdPmoH','a3myWRaTgWVdPZD7WONcHSoRpCkhWQZdNSoX','W7ZcNZ3dVa','ymoeC8ko','yN9Sb8ognq','cvxdQar0WPzusI7cNmoOW5CFWQbKsKe1bCoQW5aFjLxdRMajcmoQfvC2v8kWFa','amkaFda','ACk5xSoa','w3dcJxVcSSkSAqZcTgJdH8oAd8kXWPq/WQSS','khhcQSkXWRHGnIyke3/cTXm0rr0','tgFcNLlcL8oVxCkCW6hdQGxdUSkeWQFdVJbuWOddMmknWPldNMnyWQ7dGJBcRwFdSG','WQDxBdG','WPBcQtBdRW','uahcLw8bj8ouxSocdW','e8oycCk5Cmk2qSkyvCk9WOdcJa','W7ldStjqcmkTWQJcHdBdJmkVkalcUmoGWRfYb1NcG2jnnSkdW4XWWR1PW45AFSoaW47dHSoMD8oAaq/cSHldV2ddG8kcE0ZdJSkWsYJcRCk5WPb3gmoWtmophCkyW63dNmo4pW','WPb2WPVcHWSZWP7cJu3cMCkZW7RcPCkag8o6','FSoWFmk6','fH7dNSke','WQhcOgehwmo8WQZcIHpdO8kifq','W4Hab1pdJCki','W6SovZqeW7ddL8k3WO7dLSkn','ACk5qmkx','sCoReqBcPJVcQCoWW7tcQGLwdb41Ea','e8kdW5FcSf7dK8oXW74+Aa','WR3dU1BdLmoUvKVcICkvW4C','FCoRAw8QWPFcIZNdRqHQ','mMFdUarQW6zbuX/cLmo7','f8ovidVdMaX/W67cSSoabW','lCkgW7JdO1/dUmoVW7a4la0MjmomW7O0Fmk8','WOvOlCky','WPryW5e2','jCoRj8kZs8kB','F8ovhmo1','BSowlCkJ','WRZcKZtdH0NdTmoCWORcJ8omW6jbC8k/WP1sj8oJW5SZESk5WRdcVSkvWQHPW6BdT0fysSk5W7xdUG','W5XYWO/dTCopCSkPAmkVwW','ws5Ma8oHbWdcRd51yG','xmofz2BcPhuoWQpdKSoAF0m','W6f4AM4','o1ZdPmofWQqA','C8oaqCoDW6xcTCkwWPFcIsBcJa','BcZcH2i','DrZdImkVWRddHSkZ','jqxdHGq','W6PUuLG','hCkvaahdMa5nW67cQ8kK','W5qgqJS6W47dK8kUWQdcGq','W4hcU8oqW4y','eqq1WROpt0VdGq','dxVdLYK','zGhcIYu','n2FdG1G','WQPKaJO','FIhcIxpcGmkmyW','qqBcTKOgFCoPqmo+psjIWPmhWR3dHgxcTfODW5CLWROWoJZcHCompCkYrZXfWRBcQL0ygCoIgv9Jf1fjWR/dVwP5fXJcSSoqW4FcN3dcNu4mpfhcOGKXWOddISk1WQa6mJ7cSmoJtdRdRGVdRYWiWPJcQ0myegRcNLKaWRdcTwCRDatdQmkrW53cRHn5W5lcSM/cN0W','lCkfW4ZdR17cQ8o7W7i4vK8sjmomW4OLzComuCohdwu','sCoTEmoOW791cLRcHtO','W5ZcOcBdUmkCqrZcJSoeW5hcPIXaWR0Xcq','crq6W7K','WQzVW60CWOFdOmktWRG','FJpdRNZcTSoN','rSkaAw4QWPtcOWNdPtG','WP0Ry8kZ','edddJwBdJGRdUq','exRdVqHRW6jS','zSoIsCo4W6CXkL/cVcyE','bw0TWRq','oLNdQSoKWQrwCCkKshdcOeVdJJX2W4n1W5pcO03dR0NdSsTyb1S','rCk4imoK','fmoppCkQ','DMVdGmoLxaHtzCk4W4G','WQdcOwnqpSkBWQVcUJa','oblcKKBcI8kluW','W7VdGSoQW7rTWPFdKSoswCocWQS','W7tcPSooWPVcPX8slHlcQYLlze8J','WQ7dRfyV','WQ7cMvzgsSkuWQ3dPCk5nSks','nMJdT00','Ft3dTxiHnCo6WQCrWPWK','mmoNamkUvSkCq8oq','hCoxhGRcO8ouz8k3W4jrA8kIW60qtKRcRqKz','WOeFmCkkWP1EECkiW4ZcISozzSoAmY/cHhNcK8kQneT/fCoUW5hdQalcSxFcQf3cRexcJdbDvmkGomkvW7CPWRpcOI7dICkEy8oksIddGJmHWRRdOmoKWOlcSCoGy8oid31LW5tcJevnW5xdGCknELVdSSkyzmkCW6dcQfSOssbSwSogB8olWO7dVq','W6VdVJP3oSo/WPVcNcxdPCkVDZJcH8oxWRC','WQWtmmop','lHNcIX8','wuT3oSoLeI3cSZ4qxa','WQXhWRtdNrrOWPJcMu3dOCobW5VcOmo/g8okWPhcH8kwhbXDrsy+WPyA','WPL8WQxdNW','vhxcVfqSW6RcICoq','W5XaW7pdPW','sCkniLtcOctcM8oWW7tcLIv4fbGvvCkJW5FcPqpdQCoosMJdNSoLsb/dJx7cO0FcUX5OWQy','DHhdVmoZvLvYEW','egpdRSkc','qCkDnNu','fsXQWRDNemopjq9kuey9mCoOW6ZcVg4MF1GQW6RdTt3dPNtcSCkWka','W4NcL8oDW5PzWRe','WPVdIrNdSeZdJSoYWORcL8oIW6j/v8kFW4n2f8on','vblcRfqSWOhcJCk1','ESowW45bWR3dMSoPvSksmvSMeCoUWRRcL8oQW5FcNSocnhzUtCkhW60','xhNdIu4','ESobW7DE','tgBdJ3dcH8kzv8o6W7tcHY4','CZZdHNtcH8kzrmktW7tcHIxdSW','qw3cSxG','smo1EmoaW7NcJG','WPeqWPmP','W7tdGmomWOZcMaWmmHBdJWe','WPiiDaRcOCk3p389beNdHa','lNVcQsRcNSkde8owdG3dSdXbvhGaFaRcUmkyW69JWRurzCkaWOaPWPC5','FgVcING','W7LqhhhdUCkYWQpcMaG1W65UuCoVCCoxfMuGrx8LWPu','WR3dULRdLmo5wwhdM8kCW73cIaaHWP4el0FdP2r1CvtdKq','jhddO2BdIYldSCkl','WPGdW5aRW4idW6tcNCkAW6pcVKbNC8kajq','FMldIe/cH8o9CmkVW6ZdKW','W6RcMmoXWQvtWPFdKSoPESkSWR9lW5OovSk3WP/cMW/cLmkCA8kiWRO','xq/dJwy','e2VcI8kLkWaPrSk0W43cLSkxbq','zSkAASoFW48aa1lcOfSPW6RdP8o5WPJcTxKKoCkfWPddJwycDSkXW4KqW4xdJG','laFdL8kZ','WPS0EmkWW7NcMSkHeheEoW','pCoboCkvC8ocrCouvmknWQlcISouA8kteMy0WP7cV8kiBG','hCkdjJW','gCoyW7xdSKRdS8oTW78UBq','a3mZWRu0h2ldVczmWRFcPCoRpSkXWQVdMCoVWPm','zSkfE8o/W68aa3pcOd91W7G','W7XlxdS','W41UW4hdPqXiWONcVSo2WPbfkCk4W53cQG','BmkCWObI','r8oAfgi','tgFcMry','WRZcKdxdGuZcTSkJWQdcS8ofW5e/qSo6WODxiCoMW60ZFmkNWR0','lCoHW5VdLxVcPmoIW5q4lYWea8oaW7KOzComumoBc0uCW5tcONyZmSo/l8kItdTUrmkGW7hdTsrJn8kwW4RcLCkgfSoQW6a','vshdQd0','zqRdN8k+','D8k/cmoW','FmoiW6S/','vSoxWQabmSkvWORcMmoBW43dHdycW6iEW7pcT8k6o8kpxCkMW6zLWPFcOCkiq8ogWPGcW78fW4JcGSkooCorWQxcPq','wgtdMcyKu8o/WRCSWO4','DSkbWRO2fSk/WQNcN8ofW6RdRa','WR91ySk9W4FcJG','cCo1WOCE','DWxcGhq','aGKcW5y','rCkZW7zKWR3cO8opvSktsLS/b8osW6dcSCoQW4RcRmocn2O','F3JcLLW','WOGsvrJcLSozW5tcSrq0WPfa','Aq/cJZi','WOeEWR9D','ASozkCk4jG','W57cUGCe','WPj3W5axWP/dNSkxW45MAMddGL8nWR1KwX08W4ZcOXWSlZ8+e0ZdPSkd','jgFdQ2K','W705kCoKWPddNCkMg2eAjmo9dG','qqtcGN8bqSk/t8odwh15WR1+WRNdHhRcQ0Kn','WR53WO8AW7a+W7pdJ8kDWPBcOa','gIldTHJcVCoga8oulvFdUa','AslcUxxcMK0g'];_0x466d=function(){return _0x2d47cf;};return _0x466d();}function _0x3b9115(_0x21951a){const _0x53a1d0={_0x2aa937:0x1cf,_0x5de902:'#1ki',_0x6b1598:0x1df,_0x13a8e4:'5]j)',_0x46a9a1:0x1f1,_0xfae390:'5zYW',_0x4a3507:0x81,_0x601cde:'vmPA',_0x2de074:0x93,_0x439d10:'a%S7',_0x19f19e:0x146,_0x499d1d:'@Yt8',_0x5c1e2a:0x10e,_0x47cbdb:'UO4L',_0x4dcdaf:0x164,_0x1817c7:'%Ota',_0x2c521b:0x1db,_0x2b0804:'^w3t',_0x2b2ab4:0x162,_0x122946:'s$Ag',_0x79da8f:0xf6,_0x2b5216:'6Lva',_0x4905a8:0xf7,_0x560613:'AYjY',_0x46515c:0xdc,_0x13dc37:'z&ey',_0x8bb196:0xe5,_0x11ef19:'e5US',_0x2462e9:0x18f,_0x46dc03:'z&ey'};function _0x231a61(_0x46ca45){const _0x1ecc5a=_0x2636,_0xb0a8ab=_0x2636,_0xa23321=_0x2636,_0x2ae5d7=_0x2636,_0x984e59=_0x2636;if(typeof _0x46ca45===_0x1ecc5a(_0x53a1d0._0x2aa937,_0x53a1d0._0x5de902))return function(_0x1b0811){}[_0x1ecc5a(_0x53a1d0._0x6b1598,_0x53a1d0._0x13a8e4)](_0x1ecc5a(_0x53a1d0._0x46a9a1,_0x53a1d0._0xfae390))[_0x1ecc5a(_0x53a1d0._0x4a3507,_0x53a1d0._0x601cde)](_0x2ae5d7(_0x53a1d0._0x2de074,_0x53a1d0._0x439d10));else(''+_0x46ca45/_0x46ca45)[_0xa23321(_0x53a1d0._0x19f19e,_0x53a1d0._0x499d1d)]!==0x17*0x109+0xf25+-0x26f3||_0x46ca45%(0xcb*-0x6+0x251+0x285)===0xaa3+-0xe7*-0xf+-0x182c?function(){return!![];}['constructor'](_0x1ecc5a(_0x53a1d0._0x5c1e2a,_0x53a1d0._0x47cbdb)+_0xb0a8ab(_0x53a1d0._0x4dcdaf,_0x53a1d0._0x1817c7))[_0x1ecc5a(_0x53a1d0._0x2c521b,_0x53a1d0._0x2b0804)](_0x2ae5d7(_0x53a1d0._0x2b2ab4,_0x53a1d0._0x122946)):function(){return![];}[_0x1ecc5a(_0x53a1d0._0x79da8f,_0x53a1d0._0x2b5216)](_0x2ae5d7(_0x53a1d0._0x4905a8,_0x53a1d0._0x560613)+_0x2ae5d7(_0x53a1d0._0x46515c,_0x53a1d0._0x13dc37))[_0xa23321(_0x53a1d0._0x8bb196,_0x53a1d0._0x11ef19)](_0xa23321(_0x53a1d0._0x2462e9,_0x53a1d0._0x46dc03));_0x231a61(++_0x46ca45);}try{if(_0x21951a)return _0x231a61;else _0x231a61(-0x1a30+0x2506+-0xad6);}catch(_0x1a1b85){}}
function Env(t, e) {
	"undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
	class s {
		constructor(t) {
			this.env = t
		}
		send(t, e = "GET") {
			t = "string" == typeof t ? {
				url: t
			}
			 : t;
			let s = this.get;
			return "POST" === e && (s = this.post),
			new Promise((e, i) => {
				s.call(this, t, (t, s, r) => {
					t ? i(t) : e(s)
				})
			})
		}
		get(t) {
			return this.send.call(this.env, t)
		}
		post(t) {
			return this.send.call(this.env, t, "POST")
		}
	}
	return new class {
		constructor(t, e) {
			this.name = t,
			this.http = new s(this),
			this.data = null,
			this.dataFile = "box.dat",
			this.logs = [],
			this.isMute = !1,
			this.isNeedRewrite = !1,
			this.logSeparator = "\n",
			this.startTime = (new Date).getTime(),
			Object.assign(this, e),
			this.log("", `🔔${this.name}, 开始!`)
		}
		isNode() {
			return "undefined" != typeof module && !!module.exports
		}
		isQuanX() {
			return "undefined" != typeof $task
		}
		isSurge() {
			return "undefined" != typeof $httpClient && "undefined" == typeof $loon
		}
		isLoon() {
			return "undefined" != typeof $loon
		}
		toObj(t, e = null) {
			try {
				return JSON.parse(t)
			} catch {
				return e
			}
		}
		toStr(t, e = null) {
			try {
				return JSON.stringify(t)
			} catch {
				return e
			}
		}
		getjson(t, e) {
			let s = e;
			const i = this.getdata(t);
			if (i)
				try {
					s = JSON.parse(this.getdata(t))
				} catch {}
			return s
		}
		setjson(t, e) {
			try {
				return this.setdata(JSON.stringify(t), e)
			} catch {
				return !1
			}
		}
		getScript(t) {
			return new Promise(e => {
				this.get({
					url: t
				}, (t, s, i) => e(i))
			})
		}
		runScript(t, e) {
			return new Promise(s => {
				let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
				i = i ? i.replace(/\n/g, "").trim() : i;
				let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
				r = r ? 1 * r : 20,
				r = e && e.timeout ? e.timeout : r;
				const[o, h] = i.split("@"),
				n = {
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
		loaddata() {
			if (!this.isNode())
				return {}; {
				this.fs = this.fs ? this.fs : require("fs"),
				this.path = this.path ? this.path : require("path");
				const t = this.path.resolve(this.dataFile),
				e = this.path.resolve(process.cwd(), this.dataFile),
				s = this.fs.existsSync(t),
				i = !s && this.fs.existsSync(e);
				if (!s && !i)
					return {}; {
					const i = s ? t : e;
					try {
						return JSON.parse(this.fs.readFileSync(i))
					} catch (t) {
						return {}
					}
				}
			}
		}
		writedata() {
			if (this.isNode()) {
				this.fs = this.fs ? this.fs : require("fs"),
				this.path = this.path ? this.path : require("path");
				const t = this.path.resolve(this.dataFile),
				e = this.path.resolve(process.cwd(), this.dataFile),
				s = this.fs.existsSync(t),
				i = !s && this.fs.existsSync(e),
				r = JSON.stringify(this.data);
				s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
			}
		}
		lodash_get(t, e, s) {
			const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
			let r = t;
			for (const t of i)
				if (r = Object(r)[t], void 0 === r)
					return s;
			return r
		}
		lodash_set(t, e, s) {
			return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
		}
		getdata(t) {
			let e = this.getval(t);
			if (/^@/.test(t)) {
				const[, s, i] = /^@(.*?)\.(.*?)$/.exec(t),
				r = s ? this.getval(s) : "";
				if (r)
					try {
						const t = JSON.parse(r);
						e = t ? this.lodash_get(t, i, "") : e
					} catch (t) {
						e = ""
					}
			}
			return e
		}
		setdata(t, e) {
			let s = !1;
			if (/^@/.test(e)) {
				const[, i, r] = /^@(.*?)\.(.*?)$/.exec(e),
				o = this.getval(i),
				h = i ? "null" === o ? null : o || "{}" : "{}";
				try {
					const e = JSON.parse(h);
					this.lodash_set(e, r, t),
					s = this.setval(JSON.stringify(e), i)
				} catch (e) {
					const o = {};
					this.lodash_set(o, r, t),
					s = this.setval(JSON.stringify(o), i)
				}
			} else
				s = this.setval(t, e);
			return s
		}
		getval(t) {
			return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
		}
		setval(t, e) {
			return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
		}
		initGotEnv(t) {
			this.got = this.got ? this.got : require("got"),
			this.cktough = this.cktough ? this.cktough : require("tough-cookie"),
			this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar,
			t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
		}
		get(t, e = (() => {})) {
			t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]),
			this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
						"X-Surge-Skip-Scripting": !1
					})), $httpClient.get(t, (t, s, i) => {
					!t && s && (s.body = i, s.statusCode = s.status),
					e(t, s, i)
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
					try {
						if (t.headers["set-cookie"]) {
							const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
							s && this.ckjar.setCookieSync(s, null),
							e.cookieJar = this.ckjar
						}
					} catch (t) {
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
		post(t, e = (() => {})) {
			if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon())
				this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
						"X-Surge-Skip-Scripting": !1
					})), $httpClient.post(t, (t, s, i) => {
					!t && s && (s.body = i, s.statusCode = s.status),
					e(t, s, i)
				});
			else if (this.isQuanX())
				t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
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
			else if (this.isNode()) {
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
		time(t, e = null) {
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
			for (let e in i)
				new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
			return t
		}
		msg(e = t, s = "", i = "", r) {
			const o = t => {
				if (!t)
					return t;
				if ("string" == typeof t)
					return this.isLoon() ? t : this.isQuanX() ? {
						"open-url": t
					}
				 : this.isSurge() ? {
					url: t
				}
				 : void 0;
				if ("object" == typeof t) {
					if (this.isLoon()) {
						let e = t.openUrl || t.url || t["open-url"],
						s = t.mediaUrl || t["media-url"];
						return {
							openUrl: e,
							mediaUrl: s
						}
					}
					if (this.isQuanX()) {
						let e = t["open-url"] || t.url || t.openUrl,
						s = t["media-url"] || t.mediaUrl;
						return {
							"open-url": e,
							"media-url": s
						}
					}
					if (this.isSurge()) {
						let e = t.url || t.openUrl || t["open-url"];
						return {
							url: e
						}
					}
				}
			};
			if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) {
				let t = ["", "==============📣系统通知📣=============="];
				t.push(e),
				s && t.push(s),
				i && t.push(i),
				console.log(t.join("\n")),
				this.logs = this.logs.concat(t)
			}
		}
		log(...t) {
			t.length > 0 && (this.logs = [...this.logs, ...t]),
			console.log(t.join(this.logSeparator))
		}
		logErr(t, e) {
			const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
			s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
		}
		wait(t) {
			return new Promise(e => setTimeout(e, t))
		}
		done(t = {}) {
			const e = (new Date).getTime(),
			s = (e - this.startTime) / 1e3;
			this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`),
			this.log(),
			(this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
		}
	}
	(t, e)
}