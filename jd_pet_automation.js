//20 14 10 4 *  jd_pet_automation.js

const {Env} = require('./function/magic');
const $ = new Env('M萌宠自动化');
let commodityName = process.env.M_JD_PET_COMMODITY
    ? process.env.M_JD_PET_COMMODITY
    : ''
$.log('默认5级商品，生产指定商品请自行配置 M_JD_PET_COMMODITY')
$.logic = async function () {
    let info = await api('initPetTown', {"version": 1});
    $.log(JSON.stringify(info));
    debugger
    if (info?.result?.petStatus < 5) {
        return
    }
    if (info?.result?.petStatus === 5) {
        $.log(info?.result?.goodsInfo);
        let activityId = info?.result?.goodsInfo.activityId;
        let activityIds = info?.result?.goodsInfo.activityIds;
        let data = await api('redPacketExchange',
            {"activityId": activityId, "activityIds": activityIds});
        $.putMsg(`${info?.result?.goodsInfo.exchangeMedalNum === 4 ? '12'
            : '25'}红包，${$.formatDate(
            $.timestamp() + data.result.pastDays * 24 * 60 * 60 * 1000)}过期`)
        info = await api('initPetTown', {"version": 1});
    }
    if (info?.result?.petStatus === 6) {
        info = await api('goodsInfoList', {"type": 2})
        let goods = commodityName ? info.result.goodsList.filter(
            o => o.goodsName.includes(commodityName))[0]
            : info.result.goodsList.filter(o => o.exchangeMedalNum === 5)[0];
        if (!goods) {
            $.putMsg(`没找到你要生产的 ${commodityName}`)
            return
        }
        info = await api('goodsInfoUpdate', {"goodsId": goods.goodsId})
        $.putMsg(`生产【${info.result.goodsInfo.goodsName}】成功`)
    }
};

$.run({wait: [2000, 3000]}).catch(reason => $.log(reason));

// noinspection DuplicatedCode
async function api(fn, body) {
    let url = `https://api.m.jd.com/client.action?functionId=${fn}&body=${JSON.stringify(
        body)}&client=apple&clientVersion=10.0.4&osVersion=13.7&appid=wh5&loginType=2&loginWQBiz=pet-town`
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