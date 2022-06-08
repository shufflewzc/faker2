
/*
2 10 7 6 *  m_jd_fav_shop_gift.js
 */
let mode = __dirname.includes('magic')
const {Env} = mode ? require('./function/magic') : require('./function/magic')
const $ = new Env('M收藏有礼');
$.favShopArgv = process.env.M_FAV_SHOP_ARGV
    ? process.env.M_FAV_SHOP_ARGV
    : '';
if (mode) {
    $.favShopArgv = '1000000307_1000000307'
}
let stop = false;
$.logic = async function () {
    if (stop) {
        return;
    }
    let argv = $?.favShopArgv?.split('_');
    $.shopId = argv?.[0];
    $.venderId = argv?.[1];
    if (!$.shopId || !$.venderId) {
        $.log(`无效的参数${$.favShopArgv}`)
        stop = true;
        return
    }
    await $.wait(100, 500);
    let actInfo = await QueryShopActive();
    if (actInfo?.iRet !== '0') {
        $.putMsg(actInfo?.errMsg)
        return
    }
    if (actInfo?.fan === 1) {
        $.putMsg('已经收藏过啦');
        await DelShopFav()
        return
    }
    let bean = actInfo?.gift?.filter(o => o.jingBean?.sendCount > 0)?.[0];
    if (!bean) {
        $.putMsg('没有奖励')
        //stop = true
        return
    }
    $.activeId = bean.activeId || '';
    $.giftId = bean.giftId || '';
    $.beanCnt = bean?.jingBean?.sendCount || 0;
    $.log($.activeId, $.giftId, $.beanCnt)
    if (!$.activeId) {
        $.putMsg('没找到活动信息')
        stop = true
        return
    }
    let addFav = await addfavgiftshop();
    if (addFav.iRet === "0") {
        $.putMsg('收藏成功')
    }
    let gift = await GiveShopGift();
    $.log(JSON.stringify(gift))
    if (gift.retCode === 0) {
        $.putMsg(`${$.beanCnt}豆`)
    } else if (gift.retCode === 201) {
        $.putMsg(`已领取过`)
    } else {
        $.putMsg(`领取失败`)
        //stop = true
        return
    }
    await DelShopFav()
};
$.run({wait: [300, 1000],whitelist: ['1-5']})
.catch(reason => $.log(reason))

async function GiveShopGift() {
    let url = `https://wq.jd.com/fav_snsgift/GiveShopGift?venderId=${$.venderId}&activeId=${$.activeId}&giftId=${$.giftId}&_=${$.timestamp()}&sceneval=2&g_login_type=1&callback=jsonpCBKQ&g_tk=1292830178&g_ty=ls`
    let headers = {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "Connection": "keep-alive",
        "Cookie": $.cookie,
        "Host": "wq.jd.com",
        "Referer": `https://shop.m.jd.com/?shopId=${$.shopId}`,
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
    }
    let {status, data} = await $.request(url, headers);
    await $.wait(100, 500)
    return $.handler(data);
}

async function DelShopFav() {
    let url = `https://wq.jd.com/fav/shop/DelShopFav?shopId=${$.shopId}&venderId=${$.venderId}&_=${$.timestamp()}&sceneval=2&g_login_type=1&callback=jsonpCBKM&g_tk=1292830178&g_ty=ls`
    let headers = {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "Connection": "keep-alive",
        "Cookie": $.cookie,
        "Host": "wq.jd.com",
        "Referer": `https://shop.m.jd.com/?shopId=${$.shopId}`,
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
    }
    let {data} = await $.request(url, headers);
    await $.wait(100, 500)
    return $.handler(data);
}

async function addfavgiftshop() {
    let url = `https://wq.jd.com/fav_snsgift/addfavgiftshop?venderId=${$.venderId}&shareToken=&_=${$.timestamp()}&sceneval=2&g_login_type=1&callback=jsonpCBKO&g_tk=1292830178&g_ty=ls`
    let headers = {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "Connection": "keep-alive",
        "Cookie": $.cookie,
        "Host": "wq.jd.com",
        "Referer": `https://shop.m.jd.com/?shopId=${$.shopId}`,
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
    }
    let {status, data} = await $.request(url, headers);
    await $.wait(100, 500)

    return $.handler(data);
}

async function QueryShopActive() {
    let headers = {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "Connection": "keep-alive",
        "Cookie": $.cookie,
        "Host": "wq.jd.com",
        "Referer": `https://shop.m.jd.com/?shopId=${$.shopId}`,
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
    }
    let url = `https://wq.jd.com/fav_snsgift/QueryShopActive?venderId=${$.venderId}&_=${$.timestamp()}&sceneval=2&g_login_type=1&callback=jsonpCBKC&g_tk=1292830178&g_ty=ls`
    let {status, data} = await $.request(url, headers);
    await $.wait(100, 500)
    return $.handler(data);
}