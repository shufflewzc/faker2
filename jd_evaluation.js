if (!["true"].includes(process.env.JD_Evaluation)) {
    console.log("避免自动运行请设置评价环境变量JD_Evaluation为\"true\"来运行本脚本")
    return
}
/*
京东评价
参考jd_Evaluation.py

变量 EVAL_IMGS  格式 //img30.360buyimg.com/shaidan/jfs/t1/169124/31/25110/42459/61a586c7Ec6b49656/1549ee98784f868d.jpg
export EVAL_IMGS=‘//img30.360buyimg.com/shaidan/jfs/t1/169124/31/25110/42459/61a586c7Ec6b49656/1549ee98784f868d.jpg&xxx’
by：jiulan
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#京东评价
37 15 * * * https://raw.githubusercontent.com/okyyds/yydspure/master/jd_evaluation.js, tag=京东评价, enabled=true

================Loon==============
[Script]
cron "37 15 * * *" script-path=https://raw.githubusercontent.com/okyyds/yydspure/master/jd_evaluation.js,tag=京东评价

===============Surge=================
京东评价 = type=cron,cronexp="37 15 * * *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/okyyds/yydspure/master/jd_evaluation.js

============小火箭=========
京东评价 = type=cron,script-path=https://raw.githubusercontent.com/okyyds/yydspure/master/jd_evaluation.js, cronexpr="37 15 * * *", timeout=3600, enable=true
 */
const $ = new Env('京东评价');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let jdNotify = true;//是否关闭通知，false打开通知推送，true关闭通知推送
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;
let commentImgList = [
    '//img30.360buyimg.com/shaidan/jfs/t1/169124/31/25110/42459/61a586c7Ec6b49656/1549ee98784f868d.jpg',
    '//img30.360buyimg.com/shaidan/jfs/t1/220117/4/6009/64307/61a586d6E0d3462c9/2d49512023e40761.jpg',
    '//img30.360buyimg.com/shaidan/jfs/t1/213046/15/6166/10322/61a586e5Ea4397e3d/d143a8d0a0d96bd8.jpg',
    '//img30.360buyimg.com/shaidan/jfs/t1/169124/31/25110/42459/61a586c7Ec6b49656/1549ee98784f868d.jpg',
    '//img30.360buyimg.com/shaidan/jfs/t1/220117/4/6009/64307/61a586d6E0d3462c9/2d49512023e40761.jpg',
    '//img30.360buyimg.com/shaidan/jfs/t1/156957/9/27398/4391/61bb2a3cEca6a4bab/20005aabe0573a0a.jpg',
    '//img30.360buyimg.com/shaidan/jfs/t1/143995/15/24443/5327/61860ba4Ecba97817/d7faafa606f76b1f.jpg'];
if ($.isNode()) {
  console.log('配置文件中添加变量自定义评价图片')
  console.log('多个图片请用&隔开，请自行替换图片！')
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};

    let otherImgList = [];
    if (process.env.EVAL_IMGS) {
        console.log(process.env.EVAL_IMGS)
        if (process.env.EVAL_IMGS.indexOf('&') > -1) {
            console.log(`您的评价图片 选择的是用&隔开\n`)
            otherToken = process.env.EVAL_IMGS.split('&');
        } else if (process.env.EVAL_IMGS.indexOf('\n') > -1) {
            console.log(`您的评价图片 选择的是用换行隔开\n`)
            otherToken = process.env.EVAL_IMGS.split('\n');
        } else {
            otherToken = process.env.EVAL_IMGS.split();
        }
    }
    Object.keys(otherImgList).forEach((item) => {
        if (otherImgList[item]){
            commentImgList.push(otherImgList[item]);
        }
    })

} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
let goodsList = []


!(async () => {

    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        return;
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            $.hot = false;
            message = '';
            await TotalBean();
            console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
                if ($.isNode()) {
                    await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                }
                continue
            }
            goodsList = []
            //评价和服务评价
            console.log(`******开始获取评价和服务评价列表******`);
            await getOrderList(3,1,10)
            if(goodsList && goodsList.length){
                for(let item of goodsList){
                    await $.wait(5000)
                    let cName = item["cname"];
                    if (cName ==="评价晒单"){
                        console.log(`******开始评价******`);
                        await sendEval(item);
                        // await $.wait(1000)
                        // await sendServiceEval(item);
                    }else  if (cName ==="评价服务"){
                        console.log(`******开始评价服务******`);
                        await sendServiceEval(item);
                    }else  if (cName ==="追加评价") {
                        console.log(`******开始晒单******`);
                        await appendComment(item);
                    }
                }
            }
            // goodsList = []
            // await $.wait(1000)
            // //晒单
            // console.log(`******开始获取晒单列表******`);
            // await getOrderList(6,1,10)
            // if(goodsList && goodsList.length){
            //     for(let item of goodsList){
            //         await $.wait(1000)
            //         let cName = item["cname"];
            //         if (cName ==="追加评价") {
            //             console.log(`******开始晒单******`);
            //             await appendComment(item);
            //         }
            //     }
            // }
        }
    }
})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
        $.done();
    })

function getOrderList(orderType,startPage,pageSize){
    return new Promise(async (resolve) => {
        let options = taskUrl(orderType,startPage,pageSize)
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.errCode === '0') {
                            if (data.orderList && data.orderList.length) {
                                for (let da of data.orderList) {
                                    for (let j of da['buttonList']) {
                                        if (j['id'] === 'toComment') {
                                            goodsList.push({
                                                "oid": da['orderId'],
                                                "pid": da['productList'][0]['skuId'],
                                                "name": da['productList'][0]['title'],
                                                "cname": j['name'],
                                                "multi": da['productList'].length === 1,
                                            })
                                        }
                                    }
                                }
                            }
                            if (data.totalDeal <= pageSize + 1 && startPage < 10) {
                                console.log('查询下一页 startPage ！', startPage + 1);
                                await $.wait(2000)
                                await getOrderList(orderType, startPage + 1, pageSize)
                            }
                        } else {
                            console.log('快去买买买！');
                            console.log('getOrderList error ！', data);
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

/**
 *  评价和服务评价
 */
function sendEval(item){
    let url = "https://comment-api.jd.com/comment/sendEval?sceneval=2&g_login_type=1&g_ty=ajax";
    let data = {
        'productId': item['pid'],
        'orderId': item['oid'],
        'commentTagStr': 1,
        'anonymous': 1,
        'scence': 101100000,
        'score': 5,
        'syncsg': 0,
        'content': generation(item['name'],true,"1"),
        'userclient': 29,
        'imageJson': '',
        'videoid':'',
        'URL':''
    }
    //getRandomArrayElements(commentImgList,1)[0]
    return new Promise(async (resolve) => {
        let content = urlEncode(data);
        content = content.substr(1,content.length);

        let options = {
            url: url,
            headers: {
                "Host": "comment-api.jd.com",
                "Accept": "application/json",

                "Content-Type": "application/x-www-form-urlencoded",
                'referer': 'https://comment-api.jd.com',
                "Cookie": cookie,
                "Connection": "keep-alive",
                'Origin': 'https://comment-api.jd.com',
                'Sec-Fetch-Site': 'same-site',
                'Sec-Fetch-Mode': "cors",
                'Sec-Fetch-Dest': "empty",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language":"zh-CN,zh;q=0.9",
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            },body:content
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);;
                        if (data.iRet === 0) {
                            console.log('普通评价成功！');
                        } else {
                            console.log('普通评价失败了.....');
                            console.log(data);
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}
/**
 *  服务评价
 */
function sendServiceEval(item){
    let url = `https://comment-api.jd.com/comment/sendDSR?pin=&_=${new Date().getTime()}&sceneval=2&g_login_type=1&callback=json&g_ty=ls`;
    let data = {
        'userclient': '29',
        'orderId': item["oid"],
        'otype': 1,
        'DSR1': Math.floor(Math.random() * 2 + 3),
        'DSR2': Math.floor(Math.random() * 2 + 3),
        'DSR3': Math.floor(Math.random() * 2 + 3),
        'DSR4': Math.floor(Math.random() * 2 + 3)
    }
    return new Promise(async (resolve) => {
        let options = {
            url: url+urlEncode(data),
            headers: {
                "Host": "comment-api.jd.com",
                "Accept": "application/json",
                'referer': 'https://comment.m.jd.com',
                "Cookie": cookie,
                "Connection": "keep-alive",
                'Sec-Fetch-Site': 'same-site',
                'Sec-Fetch-Mode': "cors",
                'Sec-Fetch-Dest': "empty",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language":"zh-CN,zh;q=0.9",
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            }
        }
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.errMsg === 'success') {
                            console.log('服务评价成功！');
                        } else {
                            console.log("data", data);
                            console.log('服务评价失败了.....');
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

/**
 * 晒单
 */
function appendComment(item){
    let data = {
        'productId': item['pid'],
        'orderId': item['oid'],
        'content': generation(item['name'],false,"0"),
        'userclient': 29,
        'imageJson': ''
    }
    //getRandomArrayElements(commentImgList,1)[0]
    let content = urlEncode(data);
    content = content.substr(1,content.length);
    return new Promise(async (resolve) => {
        let options = {
            "url": "https://comment-api.jd.com/comment/appendComment?sceneval=2&g_login_type=1&g_ty=ajax",
            "headers": {
                "Host": "comment-api.jd.com",
                "Accept": "application/json",
                'Origin': 'https://comment.m.jd.com',
                'referer': 'https://comment.m.jd.com',
                "Cookie": cookie,
                "Connection": "keep-alive",
                'Sec-Fetch-Site': 'same-site',
                'Sec-Fetch-Mode': "cors",
                'Sec-Fetch-Dest': "empty",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language":"zh-CN,zh;q=0.9",
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            },
            'body': content
        }
        // console.log("options",options)
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.errMsg === 'success') {
                            console.log('晒单成功！');
                        } else {
                            console.log('晒单失败！', data);
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

/**
 * 获取评论
 * @param pname
 * @param usePname
 * @param type 0 追评  1评价
 */
function  generation(pname,usePname,type){
    let name = '宝贝';
    if (usePname){
        name = pname;
    }
    let data = {
        "0": {
            "开始": [
                " $ 产品挺好的,东西是真的好，",
                "使用了几天 $ ",
                "这是我买到的最好的$ ",
                "是真的好用啊，几天的体验下来，真是怀恋当初购买时下单的那一刻的激动!!!!!!!!!",
                "用了几天下来，$ 的产品的确不错！",
                "$  的东西，真是太令人愉悦了，买了都说好好好好！",
                "东西很好，这家店的 $ 真是太好了。",
                "$ 发货速度款，性价比很高，对得起这个价格！",
                "继续推荐，价格实惠，品质有保证！"
            ],
            "中间": [
                "物流挺快的，刚才货到了，看了一下很好！",
                "$东西还行,",
                "$很好用客服态度也很好,",
                "确实是好东西，推荐大家购买,",
                "$  的质量真的非常不错！",
                "$  真是太好用了，真是个宝贝，难忘的宝贝!!",
                "$  短短几天的体验，确实不错",
                "简直太棒了，刚收到货就迫不及待的拆开了，非常棒很不错，推荐使用！",
                "$  产品质量不错的，非常可以",
                " 货到了 $感觉非常棒 物价所值",
                "买到赚到，物有所值！",
                "$非常好，价格便宜关键是东西好，买了好多次这次买的质量非常好，大爱，强烈推荐",
                "五星好评，安排上，东西太好拉！！！"
            ],
            "结束": [
                "推荐大家来尝试",
                "这家店的客服真的太好了。!",
                "真是一次愉快的购物！",
                "以后买$还来这家店，推荐哦！",
                "下次还来这家店买 $ ，推荐哦",
                "东西很好，物有所值",
                "挺不错的，推荐大家购买哦",
                "非常不错的一次购物",
                "五星好评，满意满意满意",
                "$赠送的物品非常丰富，物超所值，值得购买！"
            ]
        },
        "1": {
            "开始": [
                "考虑买这个$之前我是有担心过的，因为我不知道$的质量和品质怎么样，但是看了评论后我就放心了。",
                "买这个$之前我是有看过好几家店，最后看到这家店的评价不错就决定在这家店买 ",
                "看了好几家店，也对比了好几家店，最后发现还是这一家的$评价最好。",
                "看来看去最后还是选择了这家。",
                "之前在这家店也买过其他东西，感觉不错，这次又来啦。",
                "这家的$的真是太好用了，用了第一次就还想再用一次。"
            ],
            "中间": [
                "收到货后我非常的开心，因为$的质量和品质真的非常的好！",
                "拆开包装后惊艳到我了，这就是我想要的$!",
                "快递超快！包装的很好！！很喜欢！！！",
                "非常好，非常好好用，舒服，评个五星，发货快一天就到了。",
                "包装的很精美！$的质量和品质非常不错！",
                "收到快递后迫不及待的拆了包装。$我真的是非常喜欢",
                "$包装不错，很严密，产品样数和下单一样，送的东西也很满意。五星好评！",
                "购物过程愉快，产品也和我心意，非常喜欢！！"
            ],
            "结束": [
                "经过了这次愉快的购物，我决定如果下次我还要买$的话，我一定会再来这家店买的。",
                "不错不错！",
                "我会推荐想买$的朋友也来这家店里买",
                "真是一次愉快的购物！",
                "大大的好评!以后买$再来你们店！(￣▽￣)",
                "非常好！分享给你体验一下你就知道了，非常棒",
                "非常好，非常好好用，舒服，评个五星，发货快一天就到了。",
                "大家可以来购买，$的质量很好，满意满意"
            ]
        }
    }
    let context = getRandomArrayElements(data[type]["开始"],1)[0].replace('$',name)+
        getRandomArrayElements(data[type]["中间"],1)[0].replace('$',name)+
        getRandomArrayElements(data[type]["结束"],1)[0].replace('$',name);
        //+new Date().getTime();
    return context
}
function taskUrl(orderType,startPage,pageSize) {
    return {
        url: `https://wq.jd.com/bases/orderlist/list?order_type=${orderType}&start_page=${startPage}&last_page=0&page_size=${pageSize}&callersource=mainorder&traceid=&t=${new Date().getTime()}&sceneval=2&g_ty=ls&g_tk=5381`,
        headers: {
            'Accept': 'application/json',
            "Content-Type": "application/x-www-form-urlencoded",
            'referer': 'https://wqs.jd.com/',
            "Cookie": cookie,
            "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        }
    }
}

/**
 * 随机从一数组里面取
 * @param arr
 * @param count
 * @returns {Buffer}
 */
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
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
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
function safeGet(data) {
    try {
        if(data.indexOf('json(') === 0){
            data = data.replace(/\n/g, "").match(new RegExp(/json.?\((.*);*\)/))[1]
        }
        if (typeof JSON.parse(data) == "object") {
            return true;
        }
    } catch (e) {
        console.log(e);
        console.log("data",data);
        console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
        return false;
    }
}
/**
 * param 将要转为URL参数字符串的对象
 * key URL参数字符串的前缀
 * encode true/false 是否进行URL编码,默认为true
 *
 * return URL参数字符串
 */
function urlEncode(param, key, encode) {
    if(param==null) return '';
    var paramStr = '';
    var t = typeof (param);
    if (t == 'string' || t == 'number' || t == 'boolean') {
        paramStr += '&' + key + '=' + ((encode==null||encode) ? encodeURIComponent(param) : param);
    } else {
        for (var i in param) {
            var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
            paramStr += urlEncode(param[i], k, encode);
        }
    }
    return paramStr;
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
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
