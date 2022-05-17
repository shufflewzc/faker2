//20 5,12,21 * * * m_jd_farm_automation.js
//问题反馈:https://t.me/Wall_E_Channel
const {Env} = require('./magic');
const $ = new Env('M农场自动化');
let level = process.env.M_JD_FARM_LEVEL ? process.env.M_JD_FARM_LEVEL * 1 : 2
$.log('默认种植2级种子，自行配置请配置 M_JD_FARM_LEVEL')
$.logic = async function () {
    let info = await api('initForFarm',
        {"version": 11, "channel": 3, "babelChannel": 0});
    $.log(JSON.stringify(info));
    if (!info?.farmUserPro?.treeState) {
        $.log('可能没玩农场')
    }
    if (info.farmUserPro.treeState === 1) {
        return
    }
    if (info.farmUserPro.treeState === 2) {
        await $.wait(1000, 3000)
        $.log(`${info.farmUserPro.name},种植时间：${$.formatDate(
            info.farmUserPro.createTime)}`);
        //成熟了
        let coupon = await api('gotCouponForFarm',
            {"version": 11, "channel": 3, "babelChannel": 0});
        $.log(coupon)
        info = await api('initForFarm',
            {"version": 11, "channel": 3, "babelChannel": 0});
    }
    if (info.farmUserPro.treeState !== 3) {
        return
    }
    let hongBao = info.myHongBaoInfo.hongBao;
    $.putMsg(`${hongBao.discount}红包，${$.formatDate(hongBao.endTime)}过期`)
    let element = info.farmLevelWinGoods[level][0];
    await $.wait(1000, 3000)
    info = await api('choiceGoodsForFarm', {
        "imageUrl": '',
        "nickName": '',
        "shareCode": '',
        "goodsType": element.type,
        "type": "0",
        "version": 11,
        "channel": 3,
        "babelChannel": 0
    });
    if (info.code * 1 === 0) {
        $.putMsg(`已种【${info.farmUserPro.name}】`)
    }
    await api('gotStageAwardForFarm',
        {"type": "4", "version": 11, "channel": 3, "babelChannel": 0});
    await api('waterGoodForFarm',
        {"type": "", "version": 11, "channel": 3, "babelChannel": 0});
    await api('gotStageAwardForFarm',
        {"type": "1", "version": 11, "channel": 3, "babelChannel": 0});
};

$.run({
    wait: [20000, 30000], whitelist: ['1-15']
}).catch(
    reason => $.log(reason));

// noinspection DuplicatedCode
async function api(fn, body) {
    let url = `https://api.m.jd.com/client.action?functionId=${fn}&body=${JSON.stringify(
        body)}&client=apple&clientVersion=10.0.4&osVersion=13.7&appid=wh5&loginType=2&loginWQBiz=interact`
//↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓请求头↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    let headers = {
        "Cookie": $.cookie,
        "Connection": "keep-alive",
        "Accept": "*/*",
        "Host": "api.m.jd.com",
        'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 14_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.4(0x1800042c) NetType/4G Language/zh_CN miniProgram`,
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn"
    }
    let {data} = await $.request(url, headers)
    await $.wait(1000, 3000)
    return data;
}

