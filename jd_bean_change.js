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
let checkbeanDetailMode = 1;
if ($.isNode() && process.env.BEANCHANGE_BEANDETAILMODE) {
    checkbeanDetailMode = process.env.BEANCHANGE_BEANDETAILMODE * 1;
}

const fs = require('fs');
const CR = require('crypto-js');
const moment = require("moment");
let matchtitle = "昨日";
let yesterday = "";
let TodayDate = "";
let startDate = "";
let endDate = "";
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
if (!Fileexists) {
    yesterday = TodayDate;
    strBeanCache = strNewBeanCache;
    Fileexists = fs.existsSync(strBeanCache);
    matchtitle = "今日";
}
if (Fileexists) {
    console.log("检测到资产变动缓存文件" + yesterday + ".json，载入...");
    TempBeanCache = fs.readFileSync(strBeanCache, 'utf-8');
    if (TempBeanCache) {
        TempBeanCache = TempBeanCache.toString();
        TempBeanCache = JSON.parse(TempBeanCache);
    }
}

Fileexists = fs.existsSync(strNewBeanCache);
if (Fileexists) {
    console.log("检测到资产变动缓存文件" + TodayDate + ".json，载入...");
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
let ReturnMessageTitle = "";
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
const JD_API_HOST = 'https://api.m.jd.com/client.action';
let intPerSent = 0;
let i = 0;
let llShowMonth = false;
let Today = new Date();
let strAllNotify = "";
let strSubNotify = "";
let llPetError = false;
let strGuoqi = "";
let RemainMessage = '\n';
RemainMessage += "⭕提醒:⭕" + '\n';
RemainMessage += '【特价金币】特价版APP->我的->金币(可兑换无门槛红包)\n';
RemainMessage += '【话费积分】APP->充值中心-赚积分兑话费（180天效期）\n';
RemainMessage += '【礼品卡额】APP->我的->礼品卡（包含E卡，品牌类卡，超市卡）\n';
RemainMessage += '【超市卡】APP首页->京东超市->超市卡（超市商品可用）\n';
RemainMessage += '【老农场】APP->我的->东东农场->回旧版,完成可兑换无门槛红包,可用于任意商品\n';
RemainMessage += '【新农场】APP->我的->东东农场,完成可在记录里查看奖品\n';
RemainMessage += '【其他】不同类别红包不能叠加使用，自测';

let WP_APP_TOKEN_ONE = "";

let TempBaipiao = "";
let llgeterror = false;
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

let epsignurl = ""
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
    strSubNotify = process.env.BEANCHANGE_SUBNOTIFY;
    strSubNotify += "\n";
    console.log(`检测到预览置顶内容,将在一对一推送的预览显示...\n`);
}

if ($.isNode() && process.env.BEANCHANGE_ALLNOTIFY) {
    strAllNotify = process.env.BEANCHANGE_ALLNOTIFY;
    console.log(`检测到设定了公告,将在推送信息中置顶显示...`);
    strAllNotify = "✨✨✨✨✨✨✨公告✨✨✨✨✨✨✨\n" + strAllNotify;
    console.log(strAllNotify + "\n");
    strAllNotify += "\n🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏\n"
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
        console.log = () => { };
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

//查询开关
let strDisableList = "";
let DisableIndex = -1;
if ($.isNode()) {
    strDisableList = process.env.BEANCHANGE_DISABLELIST ? process.env.BEANCHANGE_DISABLELIST.split('&') : [];
}

//老农场
let EnableJdFruit = true;
DisableIndex = strDisableList.findIndex((item) => item === "老农场");
if (DisableIndex != -1) {
    console.log("检测到设定关闭老农场查询");
    EnableJdFruit = false;
}

//特价金币
let EnableJdSpeed = true;
DisableIndex = strDisableList.findIndex((item) => item === "极速金币");
if (DisableIndex != -1) {
    console.log("检测到设定关闭特价金币查询");
    EnableJdSpeed = false;
}

//领现金
let EnableCash = true;
DisableIndex = strDisableList.findIndex((item) => item === "领现金");
if (DisableIndex != -1) {
    console.log("检测到设定关闭领现金查询");
    EnableCash = false;
}

//7天过期京豆
let EnableOverBean = true;
DisableIndex = strDisableList.findIndex((item) => item === "过期京豆");
if (DisableIndex != -1) {
    console.log("检测到设定关闭过期京豆查询");
    EnableOverBean = false
}

//查优惠券
let EnableChaQuan = false;
DisableIndex = strDisableList.findIndex((item) => item === "查优惠券");
if (DisableIndex != -1) {
    console.log("检测到设定关闭优惠券查询");
    EnableChaQuan = false
}

DisableIndex = strDisableList.findIndex((item) => item === "活动攻略");
if (DisableIndex != -1) {
    console.log("检测到设定关闭活动攻略显示");
    RemainMessage = "";
}

//汪汪赛跑
let EnableJoyRun = true;
DisableIndex = strDisableList.findIndex((item) => item === "汪汪赛跑");
if (DisableIndex != -1) {
    console.log("检测到设定关闭汪汪赛跑查询");
    EnableJoyRun = false
}

//京豆收益查询
let EnableCheckBean = true;
DisableIndex = strDisableList.findIndex((item) => item === "京豆收益");
if (DisableIndex != -1) {
    console.log("检测到设定关闭京豆收益查询");
    EnableCheckBean = false
}



!(async () => {
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
            $.beanChangeXi = 0;
            $.YunFeiTitle = "";
            $.YunFeiQuan = 0;
            $.YunFeiQuanEndTime = "";
            $.YunFeiTitle2 = "";
            $.YunFeiQuan2 = 0;
            $.YunFeiQuanEndTime2 = "";
            $.JoyRunningAmount = "";
            $.ECardinfo = "";
            $.PlustotalScore = 0;
            $.CheckTime = "";
            $.beanCache = 0;
            $.fruitnewinfo = '';
            $.newfarm_info = '';
            TempBaipiao = "";
            strGuoqi = "";

            console.log(`******开始查询【京东账号${$.index}】${$.nickName || $.UserName}*********`);
            $.UA = require('./USER_AGENTS').UARAM();
            await TotalBean();
            //await TotalBean2();
            if ($.beanCount == 0) {
                console.log("数据获取失败，等待30秒后重试....")
                await $.wait(30 * 1000);
                await TotalBean();
            }
            if ($.beanCount == 0) {
                console.log("疑似获取失败,等待10秒后用第二个接口试试....")
                await $.wait(10 * 1000);
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

            await getjdfruitinfo(); //老农场
            await $.wait(1000);
            await fruitnew();
            await checkplus();
            await Promise.all([
                cash(), //特价金币
                bean(), //京豆查询
                //jdCash(), //领现金
                //GetJoyRuninginfo(), //汪汪赛跑
                queryScores(),
                getek(),
                newfarm_info()
            ])

            await showMsg();
            if (intPerSent > 0) {
                if ((i + 1) % intPerSent == 0) {
                    console.log("分段通知条件达成，处理发送通知....");
                    if ($.isNode() && allMessage) {
                        var TempMessage = allMessage;
                        if (strAllNotify)
                            allMessage = strAllNotify + `\n` + allMessage;

                        await notify.sendNotify(`${$.name}`, `${allMessage}`, {
                            url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
                        }, undefined, TempMessage)
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
                var TempMessage = allMessage;
                if (strAllNotify)
                    allMessage = strAllNotify + `\n` + allMessage;

                await notify.sendNotify(`${$.name}`, `${allMessage}`, {
                    url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
                }, undefined, TempMessage)
            }
            if ($.isNode() && allMessageMonth) {
                await notify.sendNotify(`京东月资产统计`, `${allMessageMonth}`, {
                    url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
                })
            }
        }
    } else {

        if ($.isNode() && allMessageGp2) {
            var TempMessage = allMessageGp2;
            if (strAllNotify)
                allMessageGp2 = strAllNotify + `\n` + allMessageGp2;
            await notify.sendNotify(`${$.name}#2`, `${allMessageGp2}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            }, undefined, TempMessage)
            await $.wait(10 * 1000);
        }
        if ($.isNode() && allMessageGp3) {
            var TempMessage = allMessageGp3;
            if (strAllNotify)
                allMessageGp3 = strAllNotify + `\n` + allMessageGp3;
            await notify.sendNotify(`${$.name}#3`, `${allMessageGp3}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            }, undefined, TempMessage)
            await $.wait(10 * 1000);
        }
        if ($.isNode() && allMessageGp4) {
            var TempMessage = allMessageGp4;
            if (strAllNotify)
                allMessageGp4 = strAllNotify + `\n` + allMessageGp4;
            await notify.sendNotify(`${$.name}#4`, `${allMessageGp4}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            }, undefined, TempMessage)
            await $.wait(10 * 1000);
        }
        if ($.isNode() && allMessage) {
            var TempMessage = allMessage;
            if (strAllNotify)
                allMessage = strAllNotify + `\n` + allMessage;

            await notify.sendNotify(`${$.name}`, `${allMessage}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            }, undefined, TempMessage)
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
    ReturnMessageTitle = "";
    ReturnMessage = "";
    var strsummary = "";
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
    } else {
        ReturnMessageTitle += `\n`;
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
            try {
                await notify.sendNotifybyWxPucher("京东月资产统计", `${ReturnMessageMonth}`, `${$.UserName}`);
            } catch {
                $.log(`一对一推送异常，请拷贝库里的sendnotify.js文件到deps目录下，在拉库重试！！！\n`);
            }
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
            if (TempBeanCache) {
                ReturnMessage += `【京豆变动】${$.beanCount - $.beanCache}豆(与${matchtitle}${$.CheckTime}比较)`;
                strsummary += `变动${$.beanCount - $.beanCache}豆,`;
                ReturnMessage += `\n`;
            }
            else {
                ReturnMessage += `【京豆变动】未找到缓存,下次出结果统计`;
                ReturnMessage += `\n`;
            }
        }
    }


    if ($.beanCount) {
        ReturnMessage += `【当前京豆】${$.beanCount - $.beanChangeXi}豆(≈${(($.beanCount - $.beanChangeXi) / 100).toFixed(2)}元)\n`;
    } else {
        if ($.levelName || $.JingXiang)
            ReturnMessage += `【当前京豆】获取失败,接口返回空数据\n`;
        else {
            ReturnMessage += `【当前京豆】${$.beanCount - $.beanChangeXi}豆(≈${(($.beanCount - $.beanChangeXi) / 100).toFixed(2)}元)\n`;
        }
    }

    if ($.JDtotalcash) {
        ReturnMessage += `【特价金币】${$.JDtotalcash}币(≈${($.JDtotalcash / 10000).toFixed(2)}元)\n`;
    }
    if ($.ECardinfo)
        ReturnMessage += `【礼品卡额】${$.ECardinfo}元\n`;

    if ($.JoyRunningAmount)
        ReturnMessage += `【汪汪赛跑】${$.JoyRunningAmount}元\n`;

    if ($.JdFarmProdName != "") {
        if ($.JdtreeEnergy != 0) {
            if ($.treeState === 2 || $.treeState === 3) {
                ReturnMessage += `【老农场】${$.JdFarmProdName} 可以兑换了!\n`;
                TempBaipiao += `【老农场】${$.JdFarmProdName} 可以兑换了!\n`;
                if (userIndex2 != -1) {
                    ReceiveMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】${$.JdFarmProdName} (老农场)\n`;
                }
                if (userIndex3 != -1) {
                    ReceiveMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】${$.JdFarmProdName} (老农场)\n`;
                }
                if (userIndex4 != -1) {
                    ReceiveMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】${$.JdFarmProdName} (老农场)\n`;
                }
                if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
                    allReceiveMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】${$.JdFarmProdName} (老农场)\n`;
                }
            } else {
                //if ($.JdwaterD != 'Infinity' && $.JdwaterD != '-Infinity') {
                //ReturnMessage += `【老农场】${$.JdFarmProdName}(${(($.JdtreeEnergy / $.JdtreeTotalEnergy) * 100).toFixed(0)}%,${$.JdwaterD}天)\n`;
                //} else {
                ReturnMessage += `【老农场】${$.JdFarmProdName}(${(($.JdtreeEnergy / $.JdtreeTotalEnergy) * 100).toFixed(0)}%)\n`;

                //}
            }
        } else {
            if ($.treeState === 0) {
                TempBaipiao += `【老农场】水果领取后未重新种植!\n`;

                if (userIndex2 != -1) {
                    WarnMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】水果领取后未重新种植! (老农场)\n`;
                }
                if (userIndex3 != -1) {
                    WarnMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】水果领取后未重新种植! (老农场)\n`;
                }
                if (userIndex4 != -1) {
                    WarnMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】水果领取后未重新种植! (老农场)\n`;
                }
                if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
                    allWarnMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】水果领取后未重新种植! (老农场)\n`;
                }

            } else if ($.treeState === 1) {
                ReturnMessage += `【老农场】${$.JdFarmProdName}种植中...\n`;
            } else {
                TempBaipiao += `【老农场】状态异常!\n`;
                if (userIndex2 != -1) {
                    WarnMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】状态异常! (老农场)\n`;
                }
                if (userIndex3 != -1) {
                    WarnMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】状态异常! (老农场)\n`;
                }
                if (userIndex4 != -1) {
                    WarnMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】状态异常! (老农场)\n`;
                }
                if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
                    allWarnMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】状态异常! (老农场)\n`;
                }
                //ReturnMessage += `【老农场】${$.JdFarmProdName}状态异常${$.treeState}...\n`;
            }
        }
    }
    if ($.fruitnewinfo){
        //ReturnMessage += `【新农场】种植进度${$.fruitnewinfo}\n`;
        if ($.fruitnewinfo.skuName && $.fruitnewinfo.treeFullStage == 5 ){
            ReturnMessage += `【新农场】种植完成!\n`;
            TempBaipiao += `【新农场】种植完成!\n`;
            allReceiveMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】种植完成，去领取吧 (新农场)\n`;
        } else if ($.fruitnewinfo.skuName && $.fruitnewinfo.treeCurrentState === 0){
            ReturnMessage += '【新农场】种植进度' + $.fruitnewinfo.treeFullStage +'/5(' + $.fruitnewinfo.currentProcess+'%)\n';
        } else if ($.fruitnewinfo.treeFullStage === 0){
            ReturnMessage += `【新农场】未种植!\n`;
            //TempBaipiao += `【新农场】未种植!\n`;
            //allWarnMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】未种植，快去种植吧! (新农场)\n`;
        } else {
            ReturnMessage += '【新农场】可能枯萎了，请重新种植！\n';
        }
    } 
    if ($.newfarm_info){
            //ReturnMessage += `【新农场】奖品未兑换!\n`;
            TempBaipiao += `【新农场】奖品未兑换!\n`;
            allReceiveMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】\n ${$.newfarm_info}\n 快去兑换吧 (新农场)\n`;        
    }

    let dwscore = await dwappinfo();
    if (dwscore) {
        let dwappex = await dwappexpire();
        ReturnMessage += `【话费积分】${dwscore}`;
        if (dwappex) {
            ReturnMessage += `(近7日将过期${dwappex})`;
        }
        ReturnMessage += `\n`;
    }
    let marketcard = await marketCard();
    if (marketcard && marketcard.balance != '0.00' ) {
        ReturnMessage += `【超市卡】${marketcard.balance}元`;
        if (marketcard.expirationGiftAmountDes) {
            ReturnMessage += `(${marketcard.expirationGiftAmountDes})`;
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

    if (strGuoqi) {
        ReturnMessage += `💸💸💸临期京豆明细💸💸💸\n`;
        ReturnMessage += `${strGuoqi}`;
    }

    ReturnMessage += `🧧🧧🧧红包明细🧧🧧🧧\n`;
    ReturnMessage += `${$.message}`;
    strsummary += `红包${$.balance}元`
    if ($.YunFeiQuan) {
        var strTempYF = "【免运费券】" + $.YunFeiQuan + "张";
        if ($.YunFeiQuanEndTime)
            strTempYF += "(有效期至" + $.YunFeiQuanEndTime + ")";
        strTempYF += "\n";
        ReturnMessage += strTempYF
    }
    if ($.YunFeiQuan2) {
        var strTempYF2 = "【免运费券】" + $.YunFeiQuan2 + "张";
        if ($.YunFeiQuanEndTime2)
            strTempYF += "(有效期至" + $.YunFeiQuanEndTime2 + ")";
        strTempYF2 += "\n";
        ReturnMessage += strTempYF2
    }

    if (userIndex2 != -1) {
        allMessageGp2 += ReturnMessageTitle + ReturnMessage + `\n`;
    }
    if (userIndex3 != -1) {
        allMessageGp3 += ReturnMessageTitle + ReturnMessage + `\n`;
    }
    if (userIndex4 != -1) {
        allMessageGp4 += ReturnMessageTitle + ReturnMessage + `\n`;
    }
    if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
        allMessage += ReturnMessageTitle + ReturnMessage + `\n------\n`;
    }

    console.log(`${ReturnMessageTitle + ReturnMessage}`);

    if ($.isNode() && WP_APP_TOKEN_ONE) {
        var strTitle = "京东资产统计";
        if ($.JingXiang) {
            if ($.isRealNameAuth)
                if (cookie.includes("app_open"))
                    ReturnMessage = `【账号名称】${$.nickName || $.UserName}(wskey已实名)\n` + ReturnMessage;
                else
                    ReturnMessage = `【账号名称】${$.nickName || $.UserName}(已实名)\n` + ReturnMessage;
            else
                if (cookie.includes("app_open"))
                    ReturnMessage = `【账号名称】${$.nickName || $.UserName}(wskey未实名)\n` + ReturnMessage;
                else
                    ReturnMessage = `【账号名称】${$.nickName || $.UserName}(未实名)\n` + ReturnMessage;

        } else {
            ReturnMessage = `【账号名称】${$.nickName || $.UserName}\n` + ReturnMessage;
        }
        if (TempBaipiao) {
            TempBaipiao = `【⏰商品白嫖活动提醒⏰】\n` + TempBaipiao;
            ReturnMessage = TempBaipiao + `\n` + ReturnMessage;
        }

        ReturnMessage += RemainMessage;

        if (strAllNotify)
            ReturnMessage = strAllNotify + `\n` + ReturnMessage;
        try {
            await notify.sendNotifybyWxPucher(strTitle, `${ReturnMessage}`, `${$.UserName}`, undefined, strsummary);
        } catch {
            $.log(`一对一推送异常，请拷贝库里的sendnotify.js文件到deps目录下，在拉库重试！！！\n`);
        }
    }

    //$.msg($.name, '', ReturnMessage , {"open-url": "https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean"});
}
async function bean() {

    if (EnableCheckBean && checkbeanDetailMode == 0) {

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
                            $.isRealNameAuth = data['isRealNameAuth'];
                            $.beanCount = (data['base'] && data['base'].jdNum) || 0;
                            $.JingXiang = (data['base'] && data['base'].jvalue) || 0;
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
    return new Promise(async (resolve) => {
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
            "body": `body=${escape(JSON.stringify({ "pageSize": "20", "page": page.toString() }))}&appid=ld`,
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
                    n({ body: e.data.convertUrlNew })
                }
            } catch (n) {
                $.logErr(n, t)
            } finally {
                n({ body: e.convertUrlNew })
            }
        })
    })
}

function getSignfromNolan(functionId, body) {
    var strsign = '';
    let data = {
        "fn": functionId,
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
        $.post(url, async (err, resp, data) => {
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
            } catch (e) {
                $.logErr(e, resp);
            } finally {
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
                        t = parseInt((t - 1) / 1000) * 1000;

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

                        $.balance = ($.jxRed + $.jsRed + $.jdRed + $.jdhRed + $.jdwxRed + $.jdGeneralRed).toFixed(2);
                        $.jxRed = $.jxRed.toFixed(2);
                        $.jsRed = $.jsRed.toFixed(2);
                        $.jdRed = $.jdRed.toFixed(2);
                        $.jdhRed = $.jdhRed.toFixed(2);
                        $.jdwxRed = $.jdwxRed.toFixed(2);
                        $.jdGeneralRed = $.jdGeneralRed.toFixed(2);
                        $.expiredBalance = ($.jxRedExpire + $.jsRedExpire + $.jdRedExpire + $.jdhRedExpire + $.jdwxRedExpire + $.jdGeneralRedExpire).toFixed(2);
                        $.message += `【红包总额】${$.balance}(总过期${$.expiredBalance})元 \n`;
                        if ($.jxRed > 0) {
                            if ($.jxRedExpire > 0)
                                $.message += `【京喜红包】${$.jxRed}(将过期${$.jxRedExpire.toFixed(2)})元 \n`;
                            else
                                $.message += `【京喜红包】${$.jxRed}元 \n`;
                        }

                        if ($.jsRed > 0) {
                            if ($.jsRedExpire > 0)
                                $.message += `【京喜特价】${$.jsRed}(将过期${$.jsRedExpire.toFixed(2)})元 \n`;
                            else
                                $.message += `【京喜特价】${$.jsRed}元 \n`;
                        }

                        if ($.jdRed > 0) {
                            if ($.jdRedExpire > 0)
                                $.message += `【京东红包】${$.jdRed}(将过期${$.jdRedExpire.toFixed(2)})元 \n`;
                            else
                                $.message += `【京东红包】${$.jdRed}元 \n`;
                        }

                        if ($.jdhRed > 0) {
                            if ($.jdhRedExpire > 0)
                                $.message += `【健康红包】${$.jdhRed}(将过期${$.jdhRedExpire.toFixed(2)})元 \n`;
                            else
                                $.message += `【健康红包】${$.jdhRed}元 \n`;
                        }

                        if ($.jdwxRed > 0) {
                            if ($.jdwxRedExpire > 0)
                                $.message += `【微信小程序】${$.jdwxRed}(将过期${$.jdwxRedExpire.toFixed(2)})元 \n`;
                            else
                                $.message += `【微信小程序】${$.jdwxRed}元 \n`;
                        }

                        if ($.jdGeneralRed > 0) {
                            if ($.jdGeneralRedExpire > 0)
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
        $.get(options, async (err, resp, data) => {
            try {
                data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
                let couponTitle = '';
                let couponId = '';
                // 删除可使用且非超市、生鲜、京贴;
                let useable = data.coupon.useable;
                $.todayEndTime = new Date(new Date(new Date().getTime()).setHours(23, 59, 59, 999)).getTime();
                $.tomorrowEndTime = new Date(new Date(new Date().getTime() + 24 * 60 * 60 * 1000).setHours(23, 59, 59, 999)).getTime();
                $.platFormInfo = "";
                for (let i = 0; i < useable.length; i++) {
                    //console.log(useable[i]);
                    if (useable[i].limitStr.indexOf('全品类') > -1) {
                        $.beginTime = useable[i].beginTime;
                        if ($.beginTime < new Date().getTime() && useable[i].quota <= 100 && useable[i].coupontype === 1) {
                            //$.couponEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
                            $.couponName = useable[i].limitStr;
                            if (useable[i].platFormInfo)
                                $.platFormInfo = useable[i].platFormInfo;

                            var decquota = parseFloat(useable[i].quota).toFixed(2);
                            var decdisc = parseFloat(useable[i].discount).toFixed(2);
                            if (useable[i].quota > useable[i].discount + 5 && useable[i].discount < 2)
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
                    if (useable[i].couponTitle.indexOf('特价版APP活动') > -1 && useable[i].limitStr == '仅可购买活动商品') {
                        $.beginTime = useable[i].beginTime;
                        if ($.beginTime < new Date().getTime() && useable[i].coupontype === 1) {
                            if (useable[i].platFormInfo)
                                $.platFormInfo = useable[i].platFormInfo;
                            var decquota = parseFloat(useable[i].quota).toFixed(2);
                            var decdisc = parseFloat(useable[i].discount).toFixed(2);

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
                        } else {
                            $.couponType = "白条优惠";
                        }
                        if (useable[i].discount < useable[i].quota)
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
                        console.log('\n老农场: API查询请求失败 ‼️‼️')
                        console.log(JSON.stringify(err));
                        console.log(`function_id:${function_id}`)
                        $.logErr(err);
                    } else {
                        if (safeGet(data)) {
                            data = JSON.parse(data);
                            if (data.code == "400") {
                                console.log('老农场: ' + data.message);
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
            console.log(`老农场API查询失败,等待10秒后再次尝试...`)
            await $.wait(10 * 1000);
            await fruitinfo();
        }
        if (llgeterror) {
            console.log(`老农场API查询失败,有空重启路由器换个IP吧.`)
        }

    }
    return;
}

async function getjdfruit() {
    return new Promise(resolve => {
        const option = {
            url: `${JD_API_HOST}?functionId=initForFarm`,
            body: `body=${escape(JSON.stringify({ "version": 4 }))}&appid=wh5&clientVersion=9.1.0`,
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
                    if (!llgeterror) {
                        console.log('\n老农场: API查询请求失败 ‼️‼️');
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
            async (err, resp, data) => {
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
    let strurl = JD_API_HOST + "api?functionId=" + functionId + "&body=" + `${escape(JSON["stringify"](body))}&appid=lite-android&client=android&uuid=` + struuid + `&clientVersion=3.1.0&t=${nowTime}&sign=${sign}`;
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
        'isFromJoyPark': true,
        'joyLinkId': 'LsQNxL7iWDlXUs6cFl-AAg'
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
                            $.JoyRunningAmount = data.data.runningHomeInfo.prizeValue * 1;
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
    var body = [{ "pin": "$cooMrdGatewayUid$" }];
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
        $.post(config, async (err, resp, data) => {
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
        url: `https://api.m.jd.com/api?functionId=DATAWALLET_USER_QUERY_EXPIRED_SCORE&appid=h5-sep&body=%7B%22expireDayNum%22%3A7%7D&client=m&clientVersion=6.0.0`,
        headers: {
			'Origin':'https://prodev.m.jd.com',
            'User-Agent': $.UA,
            'Cookie': cookie
        }
    }
    return new Promise(async (resolve) => {
        $.post(opt, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`dwappexpire 请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data)
                    if (data.code == 200) {
                        data = data.data.expireNum;
						
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

function getek() {
    let opt = {
        url: `https://mygiftcard.jd.com/giftcard/queryChannelUserCard`,
        //body: `appid=wh5&clientVersion=1.0.0&functionId=wanrentuan_superise_send&body={"channel":2}&area=2_2813_61130_0`,
        headers: {
            //'Host': 'api.m.jd.com',
            'Origin': 'https://o.jd.com',
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': $.UA,
            'Cookie': cookie
        }
    }
    return new Promise(async (resolve) => {
        $.get(opt, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`getek请求失败!!!!`)
                } else {
                    data = JSON.parse(data)
                    if (data.code == 000000) {
                        $.ECardinfo = Number(data.data.totalAmount);
                    } else {
                        console.log(data.msg)
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
function marketCard() {
    let opt = {
        url: `https://api.m.jd.com/atop_channel_marketCard_cardInfo`,
        body: `appid=jd-super-market&t=${Date.now()}&functionId=atop_channel_marketCard_cardInfo&client=m&uuid=&body=%7B%22babelChannel%22%3A%22ttt9%22%2C%22isJdApp%22%3A%221%22%2C%22isWx%22%3A%220%22%7D`,
        headers: {
            'Origin': 'https://pro.m.jd.com',
            'User-Agent': $.UA,
            'Cookie': cookie
        }
    }
    let carddata = '';
    return new Promise(async (resolve) => {
        $.post(opt, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`marketCard 请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data)
                    if (data.success) {
                        carddata = data.data?.floorData?.items ? data.data?.floorData?.items[0].marketCardVO : '';
                    } else {
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(carddata);
            }
        })
    })
}
function newfarm_info() {
    let opt = {
        url: `https://api.m.jd.com/client.action`,
        body: `appid=signed_wh5&client=android&clientVersion=12.4.2&screen=393*0&wqDefault=false&build=99108&osVersion=12&t=${Date.now()}&body={"version":1,"type":1}&functionId=farm_award_detail`,
        headers: {
            'Origin': 'https://h5.m.jd.com',
            'User-Agent': $.UA,
            'Cookie': cookie
        }
    }
    return new Promise(async (resolve) => {
        $.post(opt, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`newfarm_info 请求失败，请检查网路重试`)
                } else {
                    
                    data = JSON.parse(data);
                    if (data.data.success) {
                        if (data.data.result.plantAwards.length > 0){
                            for (let i of  data.data.result.plantAwards ){
                                if (i.awardStatus == 1){
                                    $.newfarm_info = `${i.skuName} -> ${i.exchangeRemind}`;
                                }
                            }
                        }
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
var _0xodE='jsjiami.com.v7';const _0x59a4aa=_0x4411;(function(_0x5b442e,_0x517f50,_0xb787aa,_0x3247ae,_0x4d262d,_0x3fe896,_0x228b44){return _0x5b442e=_0x5b442e>>0x7,_0x3fe896='hs',_0x228b44='hs',function(_0x296146,_0x5a880b,_0x37431c,_0x188068,_0x3540db){const _0x236c51=_0x4411;_0x188068='tfi',_0x3fe896=_0x188068+_0x3fe896,_0x3540db='up',_0x228b44+=_0x3540db,_0x3fe896=_0x37431c(_0x3fe896),_0x228b44=_0x37431c(_0x228b44),_0x37431c=0x0;const _0x53ee9d=_0x296146();while(!![]&&--_0x3247ae+_0x5a880b){try{_0x188068=parseInt(_0x236c51(0x1f5,'h4WO'))/0x1+parseInt(_0x236c51(0x2c7,'jtn]'))/0x2*(parseInt(_0x236c51(0x2db,'N8zB'))/0x3)+-parseInt(_0x236c51(0x2b7,'SJ@%'))/0x4*(parseInt(_0x236c51(0x212,'8tdg'))/0x5)+-parseInt(_0x236c51(0x2ec,'5JrW'))/0x6+parseInt(_0x236c51(0x282,'u^W%'))/0x7*(parseInt(_0x236c51(0x264,'stAY'))/0x8)+-parseInt(_0x236c51(0x28c,'5JrW'))/0x9*(-parseInt(_0x236c51(0x22c,'*XHv'))/0xa)+-parseInt(_0x236c51(0x235,'1b3a'))/0xb*(parseInt(_0x236c51(0x1d9,'gSAL'))/0xc);}catch(_0x141cbd){_0x188068=_0x37431c;}finally{_0x3540db=_0x53ee9d[_0x3fe896]();if(_0x5b442e<=_0x3247ae)_0x37431c?_0x4d262d?_0x188068=_0x3540db:_0x4d262d=_0x3540db:_0x37431c=_0x3540db;else{if(_0x37431c==_0x4d262d['replace'](/[HnANeSyLTwDfKhuQqElVY=]/g,'')){if(_0x188068===_0x5a880b){_0x53ee9d['un'+_0x3fe896](_0x3540db);break;}_0x53ee9d[_0x228b44](_0x3540db);}}}}}(_0xb787aa,_0x517f50,function(_0x3937bf,_0x51a0dd,_0x339dbf,_0x5013e0,_0xa54821,_0x2ede30,_0x4b31c3){return _0x51a0dd='\x73\x70\x6c\x69\x74',_0x3937bf=arguments[0x0],_0x3937bf=_0x3937bf[_0x51a0dd](''),_0x339dbf=`\x72\x65\x76\x65\x72\x73\x65`,_0x3937bf=_0x3937bf[_0x339dbf]('\x76'),_0x5013e0=`\x6a\x6f\x69\x6e`,(0x15c156,_0x3937bf[_0x5013e0](''));});}(0x6100,0x65ebf,_0xaa43,0xc4),_0xaa43)&&(_0xodE=0x2610);function _0xaa43(){const _0x6413f8=(function(){return[...[_0xodE,'HANSjAsDnjQiuaqEfmiy.wcoVwmVf.vY7hTLlLKe==','uSkBamosW4i','WQmPgCorWRy','W77dKgddOdy','WQRcRmkFWOBdSW','tmkuWOpcVshcTwHzWOldTCo2dYz6WO7cJmoiWOm9W57cTSoa','q8k/WPm','s8ktW78/wdJdUfz1rYTxrCkFW4yDWORcJsG9W7q','WRRcPG/dQmo1u8kI','WOGApCk0WRVcRfe','auJdO8oDWPq','WO7cKvy8EG','WOhcVvBcMCo8DCo9xMW','g8oJWRmw','WPtcV0pcKmow','l2RdKWVdPa','iSoiWP5IW41UW6HlW4RdNW','q8klW5RdQmkNtfJdPH7cRwi1b8kQlGnddmoHmmo1W6bduCo/','WQhcTCkDW5DUrdK6','W7pdPCoDWOKwhr08W4dcQGuU','C17dTmkwvgK','W6tdVKHtiW','WP3cU0FcJmoCo8kZbwhcVSozW6ODW6q3hvbcW4ST','cmoqW6BdMf4','DIa1xwRcUSoWiq','W5DSaCoRiNtcQY7dMXtcR8kbgHCgWOny','CY/dJCoVWPi','WRRcSmkOWOldJa','AvddVSkjsq','W5i6p2zMxmoTW7xcLmkky2dcUCo2WO3dGWu','imo4W7pdHmoo','W5uxiSkdWRi','WPFcKLZdOSkbDgT0pCkQjq','rqa+qhO','u8kkWOxcJhK','WPXuW6hcOCke','jSoQWRjZW4a','DSkTWQFcKW','b1ZdLZFdGa','WRmNiCo/pNRcJZxdMX7dJSkedH4','W6KbdvW0a3OVW4JdQSoGWP8+EG','etX3W5T/','ESk/fSoXW4W','W4xdV391jq','j8oayCkrWO8vW77dTgxcVh42W6K','W5BcTCk8WRNcSSoyme4','W709CLKq','W5hcSfJdM8kv','W4eXogDz','W5KqkSkDWOhcLhlcPa','WQ3cGvioqa','WP3cNeK','WPPPjSomWOtcPrZcPJxdQ2DzW7pdJ8odWQ3dRHRcLW','smkpWPa','W6xcTha4q2ddKSoRsSoM','hmoXWO4FW4ZcPSoZx3W','WPRcUSkzWP3dHa','W6/dJ2VdIdtcIc4','WQ5simovWPG','AmozBq','WQjYWOxdTc0','AmkQWPVcRgK','smo9W7Lqx1FdUg4KExTkha','W4P3WQxdG8o6WQOdaq','qmkHoCoJW4O','W7qtsw9wd2qIWPxdT8k8W5T1B8ofpHm','W5BcTCk8WRNcRSofm1pdJSo8wG','WRyUamoPbq','WPhcHCkfW7Tv','W7RdIqhcSCo+','W6SWm8oZW5f3lSoFW5BdLfhcVq','rCkNomovW5y','WP/dH8kjW4ddVG','nmkkWOqqgq','WRTTWQhdOI0','lWXZW6LN','WP3cVSkBW71F','lmo6W6VdGCoa','WRtdNJSwt07cHW','WRzXlwfTwSonW7pcJ8kfiehcRSo/WP7dIGO','yW0Tw2W','hmkTWR8niGNcQMy','cSouW5jyW78','bSkkW4VcI2z5W407','dmkTWQa6ba','W5BdJMLLaG','n3/dLYpdO8oiWOlcKJyyahuFW6tdO8k0EG','W6xdSttcKSo3','omogW7HgW5e','xCkJWO/cOSkTFSk7BCkpW6vlxq','nXb0W69GW4y5WPX3CW','W6vTWOxdNMib','l8khWQCmiq','scSGsgRcVSoonfC0W6K0cCoy','WP3cLSkCWRxdLW','WOmqn8oMWQ8','W4ddHxVdVJdcLbHGk8ohWOBcNG','W53cSCkFWP7cQG','iSodzCkqWO8CWOpdH1NcLeq9','W4hdRJFcLSoC','F+s6NUs7GUwhR+wEG8oVWOv3xmkB5P2s6k2M6k+M5RoH5AAm6lsQWQhIGONVUP3IGOVVUyy','W54OCG','q8kJbSo0W6O','D0xdP8kJvsenW7y/W7rcav80WQ5FWQyPdSozWO7dHCkH','W489W5zkWOW','W5ldT3HIdG','lSoIW5VdMf/dQbVdLu/cK1VcU8owW4/cRSoctSkiWO7cGH8zW5KndG','BfJdTmk9q399WQ40WQa','W5CflmkaWRVdGdVdPmkhvSk9wY1rWPqaW5agW6m'],...(function(){return[...['WQfRW4BcU8kFqsVcQ1HWWRNdNSkqiduxyf0+WRdcR8kMWQ1qW7tdI37dUb/cVmo9CgRdNvBdM8o+WQ8GDq','WPBcLLO','ymo3sCkrW6q','W6K6EKCU','mCoDfhK','Ff7dVCkGuMLxWROOW7Pc','W7BdPmoyWOWrhgSXW5BcHYKhW5y','WRvWn8o5WQm','bCo/W57dLCoOna','vmkbWQpcSK8','zCoFW4eRFG3dO8kv','oH1bW4XE','W53cSSkuWRBcIW','tmoXW5eRFa','lCkXW5ZdUCoT','lCoDaeGrua','qCk6WOCDW43cUCowCa','W6SQox1TxSoqW7ZcMq','WQNcSCkiWQddUWK4hW','WQxcN2NdQCkU','WPNdRmkVW7NdSG','zmoBW4CKwaFdVa','W7O4f8kCWQ8','BSk2WQdcL0/dRsBdMIXyW4/dMmkbpf/cRsZcItRcTSkS','WQRdOf/dHEIUOUAYS+wLRoI0Q++9GUITGUAGOEACGUE/OUI1P+MgLoITMq','W6ZdGh3dOrZcNZTH','W7izuhmd','qmo1A8kEW5K','xqRdP8oyWRi','hmkTWR8npHtcQxSqANi','zmkoW4hdV8kqteldSWdcKw0fbmk6','BmkyFSoHW7yiWRhdTJhcMx0PW711C8oCamk7W6m','BCkfz24n','W6RdTsBcUmofWR3dHSoCDW','W58Vcmo5jxNcIZ7dHb/cVCoxrrCiWOPEsSoUqsPKW7Hh','FSkSFNS8','W4tdPCoPlCoF','WQtcUhqywG','W4ZdSv7dMcy','WRLZW4FcUmkZgxhdT0fYWQNdNSon','kgJdHIpdImomWRVcMa','W5/cVSoOWRJcOX0lEXPXqSoiyW','WOL7mCotWOtcQHBcVWu','neRdUZddLq','WOJcSmkiWRFdOqCHg8kwW5uBW6ZdMGGo','CCkwW5NdVCkQ','W5hdIvvxoG','WRPseSovWP4','W7uxfmo5W4m','WORdR8kxW5NdMG','rCkTWRFcJgG','WRideCoSWOG','emoSWRO3W5JcRmow','fMGIWRldP8okWQlcQa','bmoEW7DyW4e','dmoYWPH3W6S','y8otFSkRW7pcRmk9','c8oOpMGG','W4hdT2RcKSoBBCoVBa','cCoVW4fKW5TbWR3dSa','cSkGWRGtpHtcQxScEw5TnmkUWPKT','ruyuWPJdR8owWOO','WOSXjCojWRO','hmoLW5/dN8o+','W5HKWRldI8o2WQOahbtcTW','e8oJWQWEW6ZcPSoarfZcOmoy','WQtcRSkJWP/dVG','ibD6W4Py','W5CSW5PxWQRcIxBcNmoDsdNdM8k5WPNcNmk2WOr2Eq','WOxdOSk6W4/dPv8','jr5YW6nzW6y/WOfvzf0','huBdTG','ASkBxWvCcbRcQG','WPNcHgtdVCkD','fSoHiweK','extdHa','WPRdQmk8W7JdTeu','W6ddRtRcO8or','CCk2W7RdP8kN','uSkdW4BdOCkXufpdOdZcSge','v8kuWOxcPdZdQc4qWOS','cmkXW4pdV8o1W4dcI07cJmkiymoHWODoW6pdTWRcH3/cGmkYhGpdTCklW7aqB8kgW59rxJm','WOfPW5BcH8ki','dmoYW6NdIv7cV2tcIehcH3ZdTmowWOq','mSohW6BdOKu','WPpcUCkCW51f','mSklWOfYd1hdOCkSBXv9WQO','WQVcRL7dUSkBW6FcU8kClmknEJK','WQxcThiLy2RcICoZ','v8knW5ddQq','WQP3W4JcJ8k4','ySkznCoqW40','m8oyW6hdNmoR','W6JcLZZdQJm','yCorW5C/cG','WOeTf8o6','5Pw55yAd5z6i5PYU6kYo5Awk6lsH','W4HZumkOEIhdQYpdUXpdHCkRlW','lmk3W4FdVmox','pKJdIIldLq','oh8CWRddHa','WQzuW53cU8ku','nCovWP9I','WPZcOea','W6VdKx/dOcW','WP97mConWR4','WRFcUmkAW4LYwtONW5VcJX8SW5pcVZddSW','g8oypdfDW75HuSk0vge6','mSoKW4RdJx/cPLxcJKS','DCk2WQBcJLlcSgdcKYu'],...(function(){return['WRZcUxJdOmkh','cCkyW6/cSeO','W6S8CNWC','WOJcSmkiWRFdSayWcmkDW6K','ta/dNmo2','Dmo9i0OIumoO','DmoAF8k6W4pcQSkXWQr8gJlcVda','W4hcO2ddKSkb','WPiJaCoSWRO','iSovWQHZW7PPW6nE','hCoIW5ZdTCookCkhvCkMW6v9qSozkY0','zc4urfhcVCo4kq','W6pcJu3dH8kXnSk0xJpcK8o2W6jXfeldPSk9WPRcSCoJWQ7cOCoSxMbPe8o9W4pdRIf7w8kZW7WYWQhdJmozuhrkW6BdSdvKBhXVFCoHWPz2','FCkbsXLc','W6NdUfFdTH8','l8oakCoMW6PYWPhdLq','zSoyW54PwG','WPdcG17dO8kT','nGPMW4fO','WPuSaa','W7yhrfSBvNm','WOzanmoyWQ4','W40qW5HjWRS','WR5DW5RcQSkD','WQ8rfmoPaW','WRztWPFdUca','WRRcKSk8WOBdHG','FYRdMCoPWQG','W6ddQc8/tNxcQNm','dJFdICogWPe3Cq','WOqJaCoYWOP9WOuKa8k6aG','W7aVW4JcJ8k+lv7dJW','z8k1W5VdMCks','W61dWQddJmoF','zSkCjSorW61xWQ7dRf7cSg8IW4CGzmko','a8opW6tdHx0','W7SDvg8jfs9OWPldQ8k0WOf9BCkpoe/dHSouWOu3WR5oWOBcT8k/WOi6wujxgmoZWOFdLSklWRxcR8k0DLxcISoNWQdcTCkDrq0Wc8oZWODQWQOw','W5i+W41wWPW','DCkmtGv3ddlcOCoBW7ZcPaO','ySoxEmkKW4NcU8kHWQvfbJG','W54QCCknW6ZdS0ZcUbNdTwbAW50','W5raWRpdRCo3','WP1/mmolWRFcTG','W7pdOJVcT8oD','ix8DWPNdGa','gmoIW6ddM8oq','wCkjsbPBbXhcOa','WRpcPSkkW590xJ4HW7W','W4xdNh1Pga','p3pdLmoKWPC','omoFW7xdU8o1','he/dI8omWOe','W4tcPSkRWRhcQmocn1xdUW','WQ3dPSkoW7RdRq','W4tdHh3dOb0','WP0JW6xcMSklW7ybob/cLmkKWOW','nhm8WP3dNW','W63dJLPCdq','zsOss3FcT8oN','W6RdHmo2omoEkxtcRNC','wSkAANOv','WRjXyq','WOdcVfBcJSo8EmoYxMhdRSkeW65jW6SaufXFW4m','WRftW7hcUCkd','A0pdTSk2Dw9dWQ05','zSkaoCkVW7O','r8k/W5/dPCo0jCkhxCkLW448q8osidxcMCkt','W6ZdGh3dOqdcGJH8hSohWO4','W6RdPJO','W7pdPSoFo8o+','hmoRW5j7W7fh','e8oJWQWEW7dcU8odwq','W59MWRVdH8oh','WRpcU8kBW5TlEtW6W6VcIW','CqOmx2i','pSk2WQeIgG','WOTZW5VcP8kn','W4dcTCk8WQFcNG','hgy3','j8otfwa2uCodBwBdM8ow','wefFWPex','rrldPmobWOK','eCoJWQOs','W43KU4JKU7pLHkBLNj0qFXtdICkN5P6j6k6R6k2T5Rkt5AwN6lA5WPBIG7VVUl7IGyxVUjy','W4/dVfnu','tSkDEKa6','smksWOtcT2S','gCoAoZbyW7KBDmkJwKqAWQu','cmo0W5P5WR4pWR/dUSkoW5HTfCk+W6hdLmoWW7q','WQVcU8ki','WPBcOfFcMq','dmkeW57cO11L','W4lcQaLxvG','WRPIoCoKWQW','cu7dLJtdKq','gmkcA0yFWP9M','W4RcUfddJCkP','WO1aBmoaW7ZdIIdcRmklaSo1Dgi','wCkjsbPhgHlcVCoUW7ZcRa','WPtcV1RdKSocl8o2tIFdQmkyW6O','W7ldUZG3vg/cRwJcOG','W7ZcJSkJWPdcSq','WRL+W4dcUmkj','W6FcLhxdP8kR','5Pss5yEd5z6f5P+a6kYB5AEb6ls9','W5VcLuZdHmk2y8oVed7cSmo8WQnUxW','EYVdJmomWRi','p8kuWRK4gG','W59WWQ/dG1C'];}())];}())];}());_0xaa43=function(){return _0x6413f8;};return _0xaa43();};const _0x51e7b2=(function(){const _0x3029f9=_0x4411,_0x3ef81d={'ETNkC':function(_0x4e2b68,_0x13b148){return _0x4e2b68===_0x13b148;},'OObmK':_0x3029f9(0x2c1,'QqN%')};let _0x4ecc0b=!![];return function(_0x37f899,_0x686901){const _0x52a499=_0x3029f9;if(_0x3ef81d[_0x52a499(0x1ed,'sH]I')](_0x3ef81d[_0x52a499(0x2f3,'h4WO')],_0x3ef81d[_0x52a499(0x293,'RCNY')])){const _0x578478=_0x4ecc0b?function(){const _0xf0f4a1=_0x52a499;if(_0x686901){const _0x4b2b40=_0x686901[_0xf0f4a1(0x207,'!whQ')](_0x37f899,arguments);return _0x686901=null,_0x4b2b40;}}:function(){};return _0x4ecc0b=![],_0x578478;}else{if(_0x32eea3){const _0x17ec5c=_0x45a3aa[_0x52a499(0x21e,'hrL)')](_0x1a0d7c,arguments);return _0x436663=null,_0x17ec5c;}}};}()),_0x11e6d4=_0x51e7b2(this,function(){const _0x43c016=_0x4411,_0x1e9ab6={'dACXx':_0x43c016(0x1f6,'4me#')};return _0x11e6d4[_0x43c016(0x291,'PYhg')]()[_0x43c016(0x253,'Y(Sb')](_0x1e9ab6[_0x43c016(0x23d,'wNrr')])[_0x43c016(0x216,'fi3#')]()[_0x43c016(0x2eb,'SMjX')](_0x11e6d4)[_0x43c016(0x1eb,'QqN%')](_0x1e9ab6[_0x43c016(0x2e8,'5zXE')]);});_0x11e6d4();const _0x4bfa7e=require(_0x59a4aa(0x24f,'Giid')),_0x14f00d=require(_0x59a4aa(0x2c8,'7lgo')),_0x258a5d=require(_0x59a4aa(0x292,'s#u('));async function queryScores(){const _0x4ff286=_0x59a4aa,_0x2ce536={'YossZ':function(_0x122354,_0x54b78b){return _0x122354===_0x54b78b;},'xURcf':_0x4ff286(0x223,'AG8k'),'sEjvz':function(_0x42d6bd,_0x44e3a8){return _0x42d6bd==_0x44e3a8;},'VrMXG':function(_0x53bde3,_0x20346e){return _0x53bde3!==_0x20346e;},'efmom':_0x4ff286(0x2a8,'GOCg'),'dbADE':_0x4ff286(0x23e,'ApZJ'),'wBhaq':function(_0x535272){return _0x535272();},'CJvkq':_0x4ff286(0x2dd,'N3dq'),'EXtXq':function(_0x587547,_0x2d1189){return _0x587547===_0x2d1189;},'chzDT':_0x4ff286(0x203,'wGCF'),'AkjNi':_0x4ff286(0x1fc,'!whQ'),'WSFlG':_0x4ff286(0x28a,'sH]I'),'QOLko':_0x4ff286(0x213,'5zXE'),'zSZXT':_0x4ff286(0x2e6,'*XHv')};let _0x5f522e='',_0x38facd={'appId':_0x2ce536[_0x4ff286(0x27b,'M8ku')],'fn':_0x2ce536[_0x4ff286(0x1e9,'8tdg')],'body':{},'apid':_0x2ce536[_0x4ff286(0x23f,'Giid')],'user':$[_0x4ff286(0x1c7,']GRK')],'code':0x0,'ua':$['UA']};body=await _0x4bfa7e[_0x4ff286(0x247,'PYhg')](_0x38facd);let _0x3b6d16={'url':_0x4ff286(0x2e3,'$mH7')+body+_0x4ff286(0x1c1,'s#u('),'headers':{'Cookie':cookie,'User-Agent':$['UA'],'Referer':_0x2ce536[_0x4ff286(0x2e9,'$VnM')]}};return new Promise(_0x5e41ef=>{const _0x4cf567=_0x4ff286;_0x2ce536[_0x4cf567(0x278,'SJ@%')](_0x2ce536[_0x4cf567(0x1e2,'&psU')],_0x2ce536[_0x4cf567(0x1f9,'*XHv')])?$[_0x4cf567(0x2ea,'8tdg')](_0x3b6d16,async(_0x23d692,_0x381ea8,_0x147d77)=>{const _0x45ed22=_0x4cf567;if(_0x2ce536[_0x45ed22(0x2a9,'7lgo')](_0x2ce536[_0x45ed22(0x20f,'$VnM')],_0x2ce536[_0x45ed22(0x1cf,'IkCS')]))try{const _0x2c8b2a=JSON[_0x45ed22(0x1b3,'QqN%')](_0x147d77);_0x2ce536[_0x45ed22(0x257,'PYhg')](_0x2c8b2a[_0x45ed22(0x1f8,'sH]I')],0x3e8)&&($[_0x45ed22(0x276,'GOCg')]=_0x2c8b2a['rs'][_0x45ed22(0x24b,'gSAL')][_0x45ed22(0x256,'5JrW')]);}catch(_0x26ca4d){$[_0x45ed22(0x2d4,'Gs2a')](_0x26ca4d,_0x381ea8);}finally{if(_0x2ce536[_0x45ed22(0x279,'Gs2a')](_0x2ce536[_0x45ed22(0x21d,'h4WO')],_0x2ce536[_0x45ed22(0x2a4,'wNrr')]))_0x2ce536[_0x45ed22(0x224,'*XHv')](_0x5e41ef);else{const _0x26a2c7=_0x1d5246?function(){const _0x391732=_0x45ed22;if(_0x187cf5){const _0x4551fb=_0x1336f1[_0x391732(0x1b9,'$VnM')](_0x5f4d68,arguments);return _0x55b4f0=null,_0x4551fb;}}:function(){};return _0x5ca9b1=![],_0x26a2c7;}}else _0x9cf5a3[_0x45ed22(0x1c0,'4me#')]=_0x20d54d['rs'][_0x45ed22(0x209,'5JrW')][_0x45ed22(0x1d3,'N3dq')]?!![]:![];}):(!_0x36ced8&&(_0x2afb3d[_0x4cf567(0x25b,'wGCF')](_0x2ce536[_0x4cf567(0x228,'RCNY')]),_0x247c73[_0x4cf567(0x2ae,'Biik')](_0x38c701[_0x4cf567(0x20c,'YxnF')](_0x58650d))),_0x53cd0f=!![]);});}function _0x4411(_0x524e82,_0x21e85e){const _0x429251=_0xaa43();return _0x4411=function(_0x4da975,_0x1f5ccb){_0x4da975=_0x4da975-0x1b0;let _0xaa43ff=_0x429251[_0x4da975];if(_0x4411['FtxENw']===undefined){var _0x441114=function(_0x8e2637){const _0xdadb72='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _0x33e67c='',_0x2f564b='',_0x458af5=_0x33e67c+_0x441114;for(let _0x20a79d=0x0,_0x34be7c,_0x20cd32,_0x1d5246=0x0;_0x20cd32=_0x8e2637['charAt'](_0x1d5246++);~_0x20cd32&&(_0x34be7c=_0x20a79d%0x4?_0x34be7c*0x40+_0x20cd32:_0x20cd32,_0x20a79d++%0x4)?_0x33e67c+=_0x458af5['charCodeAt'](_0x1d5246+0xa)-0xa!==0x0?String['fromCharCode'](0xff&_0x34be7c>>(-0x2*_0x20a79d&0x6)):_0x20a79d:0x0){_0x20cd32=_0xdadb72['indexOf'](_0x20cd32);}for(let _0x37dd25=0x0,_0x1501ad=_0x33e67c['length'];_0x37dd25<_0x1501ad;_0x37dd25++){_0x2f564b+='%'+('00'+_0x33e67c['charCodeAt'](_0x37dd25)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x2f564b);};const _0x4651ea=function(_0x55c780,_0xce5dbc){let _0x5ca9b1=[],_0x187cf5=0x0,_0xe1a3bb,_0x5aabe8='';_0x55c780=_0x441114(_0x55c780);let _0x242c92;for(_0x242c92=0x0;_0x242c92<0x100;_0x242c92++){_0x5ca9b1[_0x242c92]=_0x242c92;}for(_0x242c92=0x0;_0x242c92<0x100;_0x242c92++){_0x187cf5=(_0x187cf5+_0x5ca9b1[_0x242c92]+_0xce5dbc['charCodeAt'](_0x242c92%_0xce5dbc['length']))%0x100,_0xe1a3bb=_0x5ca9b1[_0x242c92],_0x5ca9b1[_0x242c92]=_0x5ca9b1[_0x187cf5],_0x5ca9b1[_0x187cf5]=_0xe1a3bb;}_0x242c92=0x0,_0x187cf5=0x0;for(let _0x1336f1=0x0;_0x1336f1<_0x55c780['length'];_0x1336f1++){_0x242c92=(_0x242c92+0x1)%0x100,_0x187cf5=(_0x187cf5+_0x5ca9b1[_0x242c92])%0x100,_0xe1a3bb=_0x5ca9b1[_0x242c92],_0x5ca9b1[_0x242c92]=_0x5ca9b1[_0x187cf5],_0x5ca9b1[_0x187cf5]=_0xe1a3bb,_0x5aabe8+=String['fromCharCode'](_0x55c780['charCodeAt'](_0x1336f1)^_0x5ca9b1[(_0x5ca9b1[_0x242c92]+_0x5ca9b1[_0x187cf5])%0x100]);}return _0x5aabe8;};_0x4411['QbazAs']=_0x4651ea,_0x524e82=arguments,_0x4411['FtxENw']=!![];}const _0x4150ce=_0x429251[0x0],_0x10f0d5=_0x4da975+_0x4150ce,_0x4afe5c=_0x524e82[_0x10f0d5];if(!_0x4afe5c){if(_0x4411['TRzXXW']===undefined){const _0x5f4d68=function(_0x55b4f0){this['SzMQPL']=_0x55b4f0,this['QnNNMv']=[0x1,0x0,0x0],this['UJbktr']=function(){return'newState';},this['sRHAFq']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['lsREIH']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x5f4d68['prototype']['BFvVQA']=function(){const _0x547be7=new RegExp(this['sRHAFq']+this['lsREIH']),_0x2c6480=_0x547be7['test'](this['UJbktr']['toString']())?--this['QnNNMv'][0x1]:--this['QnNNMv'][0x0];return this['QoxiFs'](_0x2c6480);},_0x5f4d68['prototype']['QoxiFs']=function(_0x2e6343){if(!Boolean(~_0x2e6343))return _0x2e6343;return this['HNWfPL'](this['SzMQPL']);},_0x5f4d68['prototype']['HNWfPL']=function(_0xd7808){for(let _0xa7c453=0x0,_0x506bf6=this['QnNNMv']['length'];_0xa7c453<_0x506bf6;_0xa7c453++){this['QnNNMv']['push'](Math['round'](Math['random']())),_0x506bf6=this['QnNNMv']['length'];}return _0xd7808(this['QnNNMv'][0x0]);},new _0x5f4d68(_0x4411)['BFvVQA'](),_0x4411['TRzXXW']=!![];}_0xaa43ff=_0x4411['QbazAs'](_0xaa43ff,_0x1f5ccb),_0x524e82[_0x10f0d5]=_0xaa43ff;}else _0xaa43ff=_0x4afe5c;return _0xaa43ff;},_0x4411(_0x524e82,_0x21e85e);}async function fruitinfo(){const _0x30b579=_0x59a4aa,_0x9c613b={'RCwUs':function(_0x593d4e,_0x4264fb){return _0x593d4e(_0x4264fb);},'EYKmQ':_0x30b579(0x260,'5JrW'),'pQyoU':function(_0xdc00da){return _0xdc00da();},'FPQTs':function(_0x2f5065,_0x371214){return _0x2f5065!==_0x371214;},'pPItH':_0x30b579(0x23a,'Giid'),'XlNMK':_0x30b579(0x2dc,'4me#'),'IQXaS':function(_0x345cea,_0x133864){return _0x345cea===_0x133864;},'QEpyP':_0x30b579(0x22d,'sH]I'),'hwJrI':_0x30b579(0x2de,'1b3a'),'fxtOq':_0x30b579(0x24a,'7lgo'),'tUueW':_0x30b579(0x2ba,'$VnM'),'oKopx':_0x30b579(0x2a1,'$VnM'),'isVVe':_0x30b579(0x2e0,'SMjX'),'ckLwa':_0x30b579(0x1f0,']B97')};return new Promise(_0x319e18=>{const _0x27c6a8=_0x30b579,_0x5d7452={'aBKrt':function(_0xfc2dc3,_0x4ceea3){const _0x3cd6b2=_0x4411;return _0x9c613b[_0x3cd6b2(0x2a2,'&psU')](_0xfc2dc3,_0x4ceea3);},'vamZo':_0x9c613b[_0x27c6a8(0x230,'$mH7')],'Blila':function(_0x2859c0){const _0x237f29=_0x27c6a8;return _0x9c613b[_0x237f29(0x252,'2QhY')](_0x2859c0);},'HvdLd':function(_0x4f54e1,_0x4c3a82){const _0x44b234=_0x27c6a8;return _0x9c613b[_0x44b234(0x1c5,'!whQ')](_0x4f54e1,_0x4c3a82);},'uufOd':_0x9c613b[_0x27c6a8(0x29d,'fi3#')],'WHKOC':function(_0x139705,_0x439e29){const _0x1276d6=_0x27c6a8;return _0x9c613b[_0x1276d6(0x227,'6qLD')](_0x139705,_0x439e29);},'JZYeC':_0x9c613b[_0x27c6a8(0x1e1,'6qLD')],'nhOKU':function(_0x25c62f,_0x4ad3d6){const _0x34209c=_0x27c6a8;return _0x9c613b[_0x34209c(0x2ef,'YxnF')](_0x25c62f,_0x4ad3d6);},'FrEPy':function(_0x2b4c7b,_0x448639){const _0x3d671a=_0x27c6a8;return _0x9c613b[_0x3d671a(0x1ca,']GRK')](_0x2b4c7b,_0x448639);},'NFIpr':_0x9c613b[_0x27c6a8(0x1c2,'stAY')]},_0x370a22={'url':_0x27c6a8(0x219,'GOCg'),'body':_0x27c6a8(0x1fd,'h4WO')+_0x9c613b[_0x27c6a8(0x2ef,'YxnF')](encodeURIComponent,JSON[_0x27c6a8(0x1b0,'7lgo')]({'version':0x18,'channel':0x1,'babelChannel':_0x9c613b[_0x27c6a8(0x1e8,'hrL)')],'lat':'0','lng':'0'}))+_0x27c6a8(0x2af,'O8O@'),'headers':{'accept':_0x9c613b[_0x27c6a8(0x2b1,'6qLD')],'accept-encoding':_0x9c613b[_0x27c6a8(0x26b,']GRK')],'accept-language':_0x9c613b[_0x27c6a8(0x204,'*XHv')],'cookie':cookie,'origin':_0x9c613b[_0x27c6a8(0x20e,'kSsX')],'referer':_0x9c613b[_0x27c6a8(0x1dd,'M8ku')],'User-Agent':$['UA'],'Content-Type':_0x9c613b[_0x27c6a8(0x1ec,'4me#')]},'timeout':0x2710};$[_0x27c6a8(0x29e,'YxnF')](_0x370a22,(_0x5de375,_0x5188f4,_0x6872e2)=>{const _0x5334d8=_0x27c6a8,_0x2fb0da={'GOXib':_0x5d7452[_0x5334d8(0x295,'SMjX')],'mbiou':function(_0x41c6d4){const _0x1bf1f5=_0x5334d8;return _0x5d7452[_0x1bf1f5(0x1bf,'stAY')](_0x41c6d4);}};if(_0x5d7452[_0x5334d8(0x1f1,'*XHv')](_0x5d7452[_0x5334d8(0x1de,'Giid')],_0x5d7452[_0x5334d8(0x21f,'&psU')]))_0x5d7452[_0x5334d8(0x2c9,'PYhg')](_0x186c22,_0x53e4f2);else try{_0x5de375?(!llgeterror&&(_0x5d7452[_0x5334d8(0x2d1,'Y(Sb')](_0x5d7452[_0x5334d8(0x1d8,'8tdg')],_0x5d7452[_0x5334d8(0x214,'GOCg')])?(_0x2ef685[_0x5334d8(0x251,'jtn]')](_0x2fb0da[_0x5334d8(0x29a,'PYhg')]),_0x3dc240[_0x5334d8(0x1ea,']GRK')](_0x556151[_0x5334d8(0x20c,'YxnF')](_0x574edd))):(console[_0x5334d8(0x2b4,'5zXE')](_0x5d7452[_0x5334d8(0x2cd,'SJ@%')]),console[_0x5334d8(0x2ac,'hrL)')](JSON[_0x5334d8(0x1b0,'7lgo')](_0x5de375)))),llgeterror=!![]):(llgeterror=![],_0x5d7452[_0x5334d8(0x2b6,'YxnF')](safeGet,_0x6872e2)&&($[_0x5334d8(0x2ca,'SJ@%')]=JSON[_0x5334d8(0x215,'M8ku')](_0x6872e2),$[_0x5334d8(0x2cc,'kSsX')][_0x5334d8(0x26f,'Cg2Z')]&&($[_0x5334d8(0x1f2,'$mH7')]=$[_0x5334d8(0x23b,'Cg2Z')][_0x5334d8(0x1ee,'sH]I')][_0x5334d8(0x261,'wNrr')],$[_0x5334d8(0x233,'Cg2Z')]=$[_0x5334d8(0x254,'N3dq')][_0x5334d8(0x2bb,'z0o*')][_0x5334d8(0x1df,'xcQA')],$[_0x5334d8(0x296,'7lgo')]=$[_0x5334d8(0x28b,'5JrW')][_0x5334d8(0x234,'5zXE')][_0x5334d8(0x217,'Giid')],$[_0x5334d8(0x23c,'5JrW')]=$[_0x5334d8(0x1b8,'!whQ')][_0x5334d8(0x250,'!whQ')][_0x5334d8(0x20b,'$mH7')])));}catch(_0x39ba93){_0x5d7452[_0x5334d8(0x294,'6qLD')](_0x5d7452[_0x5334d8(0x290,'$mH7')],_0x5d7452[_0x5334d8(0x2c2,'SJ@%')])?$[_0x5334d8(0x2ee,'Giid')](_0x39ba93,_0x5188f4):_0x2fb0da[_0x5334d8(0x2e1,'AG8k')](_0x18104c);}finally{_0x5d7452[_0x5334d8(0x259,'*XHv')](_0x319e18);}});});}async function fruitnew(_0x2d17d6=0x1f4){const _0x2a8b06=_0x59a4aa,_0x4ba765={'DkSpz':function(_0x35a7e0,_0xd5d332){return _0x35a7e0===_0xd5d332;},'QvMFn':_0x2a8b06(0x22e,'xcQA'),'IhJTT':_0x2a8b06(0x2c6,'Giid'),'VnrTF':function(_0x40c103,_0x40d58f){return _0x40c103!==_0x40d58f;},'pdMcm':_0x2a8b06(0x25d,'AU*t'),'OmgwI':_0x2a8b06(0x2d0,'4me#'),'VRswO':function(_0x285d29,_0x34d923){return _0x285d29!==_0x34d923;},'xLCro':_0x2a8b06(0x1fa,'N8zB'),'AAizk':_0x2a8b06(0x1f3,'$mH7'),'AHckC':function(_0x6c6958,_0x5a7f4b){return _0x6c6958(_0x5a7f4b);},'EvtoK':function(_0x15d081,_0x5467e6){return _0x15d081==_0x5467e6;},'MJVoS':function(_0xbbbc7f){return _0xbbbc7f();},'sjFSn':function(_0x201e13,_0x127a12){return _0x201e13!==_0x127a12;},'lOESt':_0x2a8b06(0x1d6,'fi3#'),'attBV':_0x2a8b06(0x277,'RCNY'),'jfzsz':function(_0x23763e,_0x8913c2,_0x194ee0){return _0x23763e(_0x8913c2,_0x194ee0);},'lnOyE':_0x2a8b06(0x269,'wNrr'),'cYXzJ':_0x2a8b06(0x1c9,'1b3a'),'EcvbC':_0x2a8b06(0x2e4,'SMjX'),'tqolc':_0x2a8b06(0x206,'gSAL'),'UxzZw':_0x2a8b06(0x270,'gSAL'),'lssgk':_0x2a8b06(0x27f,'Giid'),'NPPPW':_0x2a8b06(0x2e5,'u^W%'),'EtmqN':_0x2a8b06(0x265,'Y(Sb'),'eZaQm':_0x2a8b06(0x1be,'N8zB'),'MDVtP':_0x2a8b06(0x28f,'gSAL')};let _0x48922c={'version':0x1},_0x2c0c76={'appId':_0x4ba765[_0x2a8b06(0x2c3,'Dz7d')],'fn':_0x4ba765[_0x2a8b06(0x21b,'!whQ')],'body':_0x48922c,'apid':_0x4ba765[_0x2a8b06(0x28e,'wNrr')],'ver':$['UA'][_0x2a8b06(0x255,'xcQA')](';')[0x2],'cl':_0x4ba765[_0x2a8b06(0x27c,'!whQ')],'user':$[_0x2a8b06(0x1b1,'6qLD')],'code':0x1,'ua':$['UA']};_0x48922c=await _0x14f00d[_0x2a8b06(0x1b4,'h4WO')](_0x2c0c76);let _0x3d9bd2={'url':JD_API_HOST+'?'+_0x48922c,'headers':{'Host':_0x4ba765[_0x2a8b06(0x26a,'1b3a')],'Accept':_0x4ba765[_0x2a8b06(0x2c4,'&psU')],'Origin':_0x4ba765[_0x2a8b06(0x263,'YxnF')],'Accept-Encoding':_0x4ba765[_0x2a8b06(0x1cc,'sH]I')],'User-Agent':$['UA'],'Accept-Language':_0x4ba765[_0x2a8b06(0x2cb,'Y(Sb')],'Referer':_0x4ba765[_0x2a8b06(0x284,'O8O@')],'Cookie':cookie},'timeout':0x7530};return new Promise(_0x2f8c93=>{const _0x23cd10=_0x2a8b06,_0x580227={'GROyt':function(_0x4cc872,_0x5c16a2){const _0x1fe72f=_0x4411;return _0x4ba765[_0x1fe72f(0x242,'QqN%')](_0x4cc872,_0x5c16a2);},'UHQkE':_0x4ba765[_0x23cd10(0x239,'wGCF')],'TlGfz':function(_0x53b7d5,_0x2d35bb){const _0x596c09=_0x23cd10;return _0x4ba765[_0x596c09(0x27a,'N8zB')](_0x53b7d5,_0x2d35bb);},'mfZbp':_0x4ba765[_0x23cd10(0x297,'Giid')],'kPDQS':function(_0x1183c9,_0x41061a){const _0x32d6a6=_0x23cd10;return _0x4ba765[_0x32d6a6(0x27d,'6qLD')](_0x1183c9,_0x41061a);},'LSdmm':_0x4ba765[_0x23cd10(0x238,'4me#')],'PAbsW':_0x4ba765[_0x23cd10(0x2bc,'s#u(')],'SWkwn':function(_0x5ebea1,_0x3f9df1){const _0x142bf9=_0x23cd10;return _0x4ba765[_0x142bf9(0x225,'s#u(')](_0x5ebea1,_0x3f9df1);},'aPycH':_0x4ba765[_0x23cd10(0x24c,'*XHv')],'Tmsgb':_0x4ba765[_0x23cd10(0x26d,'GOCg')],'ajHZk':function(_0x3fc41e,_0x416595){const _0x17bdd7=_0x23cd10;return _0x4ba765[_0x17bdd7(0x2b3,'1b3a')](_0x3fc41e,_0x416595);},'uqkoE':function(_0x365a42,_0x23a5ac){const _0x3dc0a7=_0x23cd10;return _0x4ba765[_0x3dc0a7(0x201,']B97')](_0x365a42,_0x23a5ac);},'zGtfF':function(_0x2c7266){const _0x2d6db1=_0x23cd10;return _0x4ba765[_0x2d6db1(0x20d,'hrL)')](_0x2c7266);}};_0x4ba765[_0x23cd10(0x2e2,'wNrr')](_0x4ba765[_0x23cd10(0x2a3,'N8zB')],_0x4ba765[_0x23cd10(0x262,'stAY')])?_0x4ba765[_0x23cd10(0x298,'u^W%')](setTimeout,()=>{const _0x155cf6=_0x23cd10,_0x4bd212={'aRDyp':function(_0x3e7f51,_0x590ea3){const _0x21f2f6=_0x4411;return _0x580227[_0x21f2f6(0x2b5,'Dz7d')](_0x3e7f51,_0x590ea3);}};$[_0x155cf6(0x2e7,'hrL)')](_0x3d9bd2,(_0x54f0fd,_0x24ee22,_0x4bbf22)=>{const _0x265d3d=_0x155cf6;if(_0x580227[_0x265d3d(0x1c3,'2QhY')](_0x580227[_0x265d3d(0x1ce,'1b3a')],_0x580227[_0x265d3d(0x29b,'YxnF')]))try{if(_0x580227[_0x265d3d(0x1b2,'hrL)')](_0x580227[_0x265d3d(0x2f2,'z0o*')],_0x580227[_0x265d3d(0x240,'ApZJ')]))_0x54f0fd?(console[_0x265d3d(0x266,'5JrW')](_0x265d3d(0x275,'AG8k')),$[_0x265d3d(0x28d,'SMjX')](_0x54f0fd)):_0x580227[_0x265d3d(0x1d5,'Y(Sb')](_0x580227[_0x265d3d(0x246,'wNrr')],_0x580227[_0x265d3d(0x1d2,'M8ku')])?(_0x4bbf22=JSON[_0x265d3d(0x208,'1b3a')](_0x4bbf22),$[_0x265d3d(0x2bf,'IkCS')]=_0x4bbf22[_0x265d3d(0x25f,'N3dq')]?.[_0x265d3d(0x237,'1b3a')]||''):(_0x1ba090[_0x265d3d(0x220,'s#u(')](_0x265d3d(0x1ff,'*XHv')),_0x5039d4[_0x265d3d(0x28d,'SMjX')](_0x1130fc));else{_0x46d861=_0x40ce70[_0x265d3d(0x283,'ApZJ')](_0x39b78c);if(_0x4bd212[_0x265d3d(0x2d8,'M8ku')](_0x5ecfd4[_0x265d3d(0x205,'fi3#')],0x1a1b98))_0x48afc3[_0x265d3d(0x2b0,'N3dq')]=_0x3e0a29['rs'][_0x265d3d(0x1db,'SJ@%')][_0x265d3d(0x221,'$VnM')]?!![]:![];else{}}}catch(_0x355900){_0x580227[_0x265d3d(0x2c0,'N8zB')](_0x580227[_0x265d3d(0x226,'Dz7d')],_0x580227[_0x265d3d(0x1f4,'5JrW')])?$[_0x265d3d(0x2f5,'8tdg')](_0x355900,_0x24ee22):_0x72ecc6[_0x265d3d(0x268,'kSsX')](_0x1aa6fb,_0xb19a76);}finally{_0x580227[_0x265d3d(0x1bb,'RCNY')](_0x2f8c93,_0x4bbf22);}else{const _0x3847b5=_0x20f340[_0x265d3d(0x287,'gSAL')](_0x1133f7,arguments);return _0x3b617f=null,_0x3847b5;}});},_0x2d17d6):_0x580227[_0x23cd10(0x29f,']GRK')](_0x2b81bb);});}async function checkplus(){const _0x2d3fb3=_0x59a4aa,_0x53ccb1={'cbJSM':function(_0x3c82eb,_0x4ecb6c){return _0x3c82eb(_0x4ecb6c);},'aTqgb':function(_0x9adc2e,_0x2f55ad){return _0x9adc2e===_0x2f55ad;},'iZwfu':_0x2d3fb3(0x25e,'RCNY'),'LZmDJ':_0x2d3fb3(0x2f1,'&psU'),'UKjlJ':function(_0x4c842a,_0x31fb5c){return _0x4c842a===_0x31fb5c;},'VQjAr':_0x2d3fb3(0x236,'xcQA'),'ZjtGx':function(_0x2af652,_0x3514af){return _0x2af652==_0x3514af;},'DzlBq':function(_0x3fc5b6,_0x4eff7e){return _0x3fc5b6!==_0x4eff7e;},'DCaWE':_0x2d3fb3(0x2ce,'wNrr'),'meQJQ':_0x2d3fb3(0x2be,'4me#'),'nTRFj':function(_0x3f720d){return _0x3f720d();},'pTkfZ':_0x2d3fb3(0x249,'stAY'),'RqpZb':_0x2d3fb3(0x2df,'N8zB'),'CockT':_0x2d3fb3(0x280,'SJ@%'),'BiqnP':_0x2d3fb3(0x281,'GOCg'),'lmLPi':_0x2d3fb3(0x24e,'5zXE'),'ZHXLq':_0x2d3fb3(0x2ad,'1b3a'),'gmtPp':_0x2d3fb3(0x1c6,'*XHv'),'NerlH':_0x2d3fb3(0x1b6,'YxnF'),'UKSjh':_0x2d3fb3(0x27e,'Biik')};let _0x2b4527={'contentType':_0x53ccb1[_0x2d3fb3(0x1d1,'YxnF')],'qids':_0x53ccb1[_0x2d3fb3(0x21a,'Cg2Z')],'checkLevel':0x1},_0x51ecf8={'appId':_0x53ccb1[_0x2d3fb3(0x274,'GOCg')],'fn':_0x53ccb1[_0x2d3fb3(0x1fb,'Giid')],'body':_0x2b4527,'apid':_0x53ccb1[_0x2d3fb3(0x1c4,'O8O@')],'user':$[_0x2d3fb3(0x1e7,'Cg2Z')],'code':0x1,'ua':$['UA']};_0x2b4527=await _0x258a5d[_0x2d3fb3(0x1d7,'5zXE')](_0x51ecf8);let _0x4fd71a={'url':_0x2d3fb3(0x231,'$VnM'),'body':_0x2b4527,'headers':{'User-Agent':$['UA'],'Cookie':cookie,'Origin':_0x53ccb1[_0x2d3fb3(0x243,'!whQ')],'Referer':_0x53ccb1[_0x2d3fb3(0x29c,'*XHv')]}};return new Promise(async _0x2976aa=>{const _0x4bd44f=_0x2d3fb3,_0x4588cd={'CSisS':function(_0x5b868e){const _0x1fb3be=_0x4411;return _0x53ccb1[_0x1fb3be(0x2ab,'O8O@')](_0x5b868e);},'Dpojq':function(_0x3f72ed,_0x54e043){const _0x1f95fd=_0x4411;return _0x53ccb1[_0x1f95fd(0x2c5,'5JrW')](_0x3f72ed,_0x54e043);}};if(_0x53ccb1[_0x4bd44f(0x258,'SJ@%')](_0x53ccb1[_0x4bd44f(0x1cd,'wNrr')],_0x53ccb1[_0x4bd44f(0x288,']GRK')]))$[_0x4bd44f(0x211,'RCNY')](_0x4fd71a,async(_0xcb8628,_0x548482,_0x15f925)=>{const _0x3dc10c=_0x4bd44f,_0x175d15={'EIOlg':function(_0x30423d,_0x39dad5){const _0x5f4308=_0x4411;return _0x53ccb1[_0x5f4308(0x1d0,'QqN%')](_0x30423d,_0x39dad5);}};try{if(_0x53ccb1[_0x3dc10c(0x2d7,'6qLD')](_0x53ccb1[_0x3dc10c(0x222,'1b3a')],_0x53ccb1[_0x3dc10c(0x272,'z0o*')]))_0x3b292e=![],_0x175d15[_0x3dc10c(0x1b5,'u^W%')](_0x562899,_0x19da63)&&(_0x22e91e[_0x3dc10c(0x1f7,'O8O@')]=_0x363ed3[_0x3dc10c(0x232,'AG8k')](_0x4e2597),_0x455ed2[_0x3dc10c(0x1da,'Y(Sb')][_0x3dc10c(0x250,'!whQ')]&&(_0x24a11d[_0x3dc10c(0x2d6,'PYhg')]=_0x128523[_0x3dc10c(0x229,'jtn]')][_0x3dc10c(0x25c,'8tdg')][_0x3dc10c(0x286,'N3dq')],_0x1ba7c6[_0x3dc10c(0x2d9,'!whQ')]=_0x3ec6c2[_0x3dc10c(0x218,'PYhg')][_0x3dc10c(0x1e0,'N3dq')][_0x3dc10c(0x210,'6qLD')],_0x5448d9[_0x3dc10c(0x296,'7lgo')]=_0x5ad40e[_0x3dc10c(0x1d4,'wGCF')][_0x3dc10c(0x250,'!whQ')][_0x3dc10c(0x217,'Giid')],_0x5501e4[_0x3dc10c(0x285,'gSAL')]=_0x28f57a[_0x3dc10c(0x2aa,'u^W%')][_0x3dc10c(0x299,'hrL)')][_0x3dc10c(0x24d,'SMjX')]));else{if(_0xcb8628)_0x53ccb1[_0x3dc10c(0x2d5,'SJ@%')](_0x53ccb1[_0x3dc10c(0x2bd,'5JrW')],_0x53ccb1[_0x3dc10c(0x2b9,'N8zB')])?(console[_0x3dc10c(0x1e6,'ApZJ')](''+JSON[_0x3dc10c(0x1ef,'Biik')](_0xcb8628)),console[_0x3dc10c(0x1ea,']GRK')](_0x3dc10c(0x1b7,'!whQ'))):(_0x8c1a37[_0x3dc10c(0x2a0,'s#u(')]=_0x64bf6a[_0x3dc10c(0x2f0,'h4WO')][_0x3dc10c(0x250,'!whQ')][_0x3dc10c(0x261,'wNrr')],_0x209dd1[_0x3dc10c(0x233,'Cg2Z')]=_0x11be9e[_0x3dc10c(0x254,'N3dq')][_0x3dc10c(0x22b,'M8ku')][_0x3dc10c(0x289,'fi3#')],_0x355684[_0x3dc10c(0x2cf,']GRK')]=_0xc272de[_0x3dc10c(0x2b8,'xcQA')][_0x3dc10c(0x1bc,'SJ@%')][_0x3dc10c(0x1cb,'6qLD')],_0x379b75[_0x3dc10c(0x271,'jtn]')]=_0x21ac01[_0x3dc10c(0x2a6,'z0o*')][_0x3dc10c(0x1e5,'&psU')][_0x3dc10c(0x241,'z0o*')]);else{_0x15f925=JSON[_0x3dc10c(0x273,'*XHv')](_0x15f925);if(_0x53ccb1[_0x3dc10c(0x2ed,'1b3a')](_0x15f925[_0x3dc10c(0x267,'gSAL')],0x1a1b98))$[_0x3dc10c(0x248,'2QhY')]=_0x15f925['rs'][_0x3dc10c(0x22f,'N8zB')][_0x3dc10c(0x2b2,'!whQ')]?!![]:![];else{}}}}catch(_0x9d5b7b){_0x53ccb1[_0x3dc10c(0x245,'wGCF')](_0x53ccb1[_0x3dc10c(0x1ba,'5zXE')],_0x53ccb1[_0x3dc10c(0x2da,'z0o*')])?$[_0x3dc10c(0x1e4,'QqN%')](_0x9d5b7b,_0x548482):_0x4588cd[_0x3dc10c(0x202,']GRK')](_0x25310c);}finally{_0x53ccb1[_0x3dc10c(0x2a7,'$VnM')](_0x2976aa);}});else{const _0x456760=_0x18e785[_0x4bd44f(0x25a,'z0o*')](_0x48b888);_0x4588cd[_0x4bd44f(0x2f4,']B97')](_0x456760[_0x4bd44f(0x1fe,'M8ku')],0x3e8)&&(_0xa50c5[_0x4bd44f(0x1bd,'sH]I')]=_0x456760['rs'][_0x4bd44f(0x1e3,'AG8k')][_0x4bd44f(0x2d3,'&psU')]);}});}var version_ = 'jsjiami.com.v7';
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
                } catch { }
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
                const [o, h] = i.split("@"),
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
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t),
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
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e),
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
        get(t, e = (() => { })) {
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
        post(t, e = (() => { })) {
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