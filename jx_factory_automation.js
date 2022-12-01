/*
[task_local]
京喜工厂自动化
变量：京喜工厂自动化生产(填写需要生产的商品名)
配合京喜工厂商品列表详情使用
//export COMMODITY_NAME="芦荟洗手液2瓶"
2 10 20 5 * jx_factory_automation.js
*/
const {Env} = require('./function/magic');
const $ = new Env('M京喜工厂自动化');
let commodityName = process.env.COMMODITY_NAME ? process.env.COMMODITY_NAME
    : '还没设置要生产商品的变量COMMODITY_NAME,先运行获取商品任务，例：export COMMODITY_NAME="芦荟洗手液2瓶"'

$.logic = async function () {
    let info = await GetUserInfo();
    if (!info) {
        $.putMsg('没有找到工厂信息');
        return;
    }
    await GetUserComponent(info.user.encryptPin);
    $.log(info.factoryList[0].name, '等级', info.user.currentLevel);
    if (info?.productionList) {
        let product = info?.productionList[0];
        if (product.investedElectric !== product.needElectric) {
            $.log('还没有生产完成');
            return
        }
        let productionId = product.productionId;
        await $.wait(3000, 5000)
        let {active} = await ExchangeCommodity(productionId);
        await $.wait(300, 500)
        await QueryHireReward();
        await $.wait(300, 500)
        await queryprizedetails(active)
        await $.wait(300, 500)
    }
    let factoryId = info?.deviceList[0].factoryId;
    $.log('获取工厂id', factoryId);
    let deviceId = info?.deviceList[0].deviceId;
    $.log('获取设备id', deviceId);
    let {commodityList} = await GetCommodityList();
    await $.wait(1300, 1500)
    await GetShelvesList()
    let filter = commodityList.filter(o => o.name.includes(commodityName));
    if (filter.length === 1) {
        let data = await GetCommodityDetails(filter[0].commodityId);
        await GetDeviceDetails();
        await $.wait(300, 500)
        let newVar = await AddProduction(factoryId, deviceId, data.commodityId);
        if (newVar?.productionId) {
            $.putMsg(`${data.name}已经开始生产`)
        }
    } else {
        $.putMsg(`没找到你要生产的 ${commodityName}`)
    }
};

$.run({wait: [2000, 3000]}).catch(reason => $.log(reason));

async function AddProduction(factoryId, deviceId, commodityDimId) {
    let url = `https://m.jingxi.com/dreamfactory/userinfo/AddProduction?zone=dream_factory&factoryId=${factoryId}&deviceId=${deviceId}&commodityDimId=${commodityDimId}&replaceProductionId=&_time=1637282973549&_ts=1637282973549&_=1637282973550&sceneval=2&g_login_type=1&callback=jsonpCBKGGG&g_ty=ls`;
    // noinspection DuplicatedCode
    let headers = {
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Referer': 'https://st.jingxi.com/pingou/dream_factory/index.html',
        'Accept-Encoding': 'gzip, deflate, br',
        'Host': 'm.jingxi.com',
        'Accept-Language': 'zh-cn',
        'Cookie': $.cookie
    }
    // noinspection DuplicatedCode
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.uuid()};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    let data = await $.get(url, headers)
    // noinspection DuplicatedCode
    if (data?.ret === 0) {
        return data?.data
    } else {
        $.putMsg(data?.msg)
    }
    return false;
}

async function GetDeviceDetails() {
    let url = `https://m.jingxi.com/dreamfactory/diminfo/GetDeviceDetails?zone=dream_factory&deviceId=1&_time=1637282971386&_ts=1637282971386&_=1637282971386&sceneval=2&g_login_type=1&callback=jsonpCBKFFF&g_ty=ls`;
    // noinspection DuplicatedCode
    let headers = {
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Referer': 'https://st.jingxi.com/pingou/dream_factory/index.html',
        'Accept-Encoding': 'gzip, deflate, br',
        'Host': 'm.jingxi.com',
        'Accept-Language': 'zh-cn',
        'Cookie': $.cookie
    }
    // noinspection DuplicatedCode
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.uuid()};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    let data = await $.get(url, headers)
    // noinspection DuplicatedCode
    if (data?.ret === 0) {
        return data?.data
    }
    return false;
}

async function GetUserComponent(pin) {
    let url = `https://m.jingxi.com/dreamfactory/usermaterial/GetUserComponent?zone=dream_factory&pin=${pin}&_time=1637282950558&_ts=1637282950559&sceneval=2&g_login_type=1&_=1637282951435&sceneval=2&g_login_type=1&callback=jsonpCBKSS&g_ty=ls`;
    // noinspection DuplicatedCode
    let headers = {
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Referer': 'https://st.jingxi.com/pingou/dream_factory/index.html',
        'Accept-Encoding': 'gzip, deflate, br',
        'Host': 'm.jingxi.com',
        'Accept-Language': 'zh-cn',
        'Cookie': $.cookie
    }
    // noinspection DuplicatedCode
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.uuid()};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    let data = await $.get(url, headers)
    // noinspection DuplicatedCode
    if (data?.ret === 0) {
        return data?.data
    }
    return false;
}

// noinspection DuplicatedCode
async function GetUserInfo() {
    let url = `https://m.jingxi.com/dreamfactory/userinfo/GetUserInfo?zone=dream_factory&pin=&sharePin=&shareType=&materialTuanPin=&materialTuanId=&needPickSiteInfo=1&source=&_time=1637282934811&_ts=1637282934811&timeStamp=&h5st=20211119084854812%3B5505286748222516%3Bc0ff1%3Btk02w96e01bc918n2aG34crijQCFgW%2BYZgoTBRpLWz6TM%2FWXRBmShiIQLtGvxCMJkN0g1uyofC04iuOhphAyAm66c3U5%3B2b53e58445b6ec6a5487e95f6aeae526c6c93b4724a0e54e03f3a8105f1caea6%3B3.0%3B1637282934812&_stk=_time%2C_ts%2CmaterialTuanId%2CmaterialTuanPin%2CneedPickSiteInfo%2Cpin%2CsharePin%2CshareType%2Csource%2CtimeStamp%2Czone&_ste=1&_=1637282934818&sceneval=2&g_login_type=1&callback=jsonpCBKY&g_ty=ls`;
    // noinspection DuplicatedCode
    let headers = {
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Referer': 'https://st.jingxi.com/pingou/dream_factory/index.html',
        'Accept-Encoding': 'gzip, deflate, br',
        'Host': 'm.jingxi.com',
        'Accept-Language': 'zh-cn',
        'Cookie': $.cookie
    }
    // noinspection DuplicatedCode
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.uuid()};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    let data = await $.get(url, headers)
    // noinspection DuplicatedCode
    if (data?.ret === 0) {
        return data?.data
    }
    return false;
}

// noinspection DuplicatedCode
async function ExchangeCommodity(productionId) {
    let url = `https://m.jingxi.com/dreamfactory/userinfo/ExchangeCommodity?zone=dream_factory&productionId=${productionId}&exchangeType=1&_time=1637282949946&_ts=1637282949946&_=1637282949947&sceneval=2&g_login_type=1&callback=jsonpCBKJJ&g_ty=ls`;
    // noinspection DuplicatedCode
    let headers = {
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Referer': 'https://st.jingxi.com/pingou/dream_factory/index.html',
        'Accept-Encoding': 'gzip, deflate, br',
        'Host': 'm.jingxi.com',
        'Accept-Language': 'zh-cn',
        'Cookie': $.cookie
    }
    // noinspection DuplicatedCode
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.uuid()};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    let data = await $.get(url, headers)
    // noinspection DuplicatedCode
    if (data?.ret === 0) {
        return data?.data
    }
    return false;
}

// noinspection DuplicatedCode
async function GetCommodityList() {
    let url = `https://m.jingxi.com/dreamfactory/diminfo/GetCommodityList?zone=dream_factory&flag=2&pageNo=1&pageSize=12&_time=1636619666773&_ts=1636619666773&_=1636619666773&sceneval=2&g_login_type=1&callback=jsonpCBKKK&g_ty=ls`;
    // noinspection DuplicatedCode
    let headers = {
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Referer': 'https://st.jingxi.com/pingou/dream_factory/index.html',
        'Accept-Encoding': 'gzip, deflate, br',
        'Host': 'm.jingxi.com',
        'Accept-Language': 'zh-cn',
        'Cookie': $.cookie
    }
    // noinspection DuplicatedCode
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.uuid()};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    let data = await $.get(url, headers)
    // noinspection DuplicatedCode
    if (data?.ret === 0) {
        return data?.data
    }
    return false;
}

// noinspection DuplicatedCode
async function GetCommodityDetails(commodityId) {
    let url = `https://m.jingxi.com/dreamfactory/diminfo/GetCommodityDetails?zone=dream_factory&commodityId=${commodityId}&_time=1636437544857&_ts=1636437544857&_=1636437544857&sceneval=2&g_login_type=1&callback=jsonpCBKWWW&g_ty=ls`;
    // noinspection DuplicatedCode
    let headers = {
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Referer': 'https://st.jingxi.com/pingou/dream_factory/index.html',
        'Accept-Encoding': 'gzip, deflate, br',
        'Host': 'm.jingxi.com',
        'Accept-Language': 'zh-cn',
        'Cookie': $.cookie
    }
    // noinspection DuplicatedCode
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.uuid()};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    let data = await $.get(url, headers)
    // noinspection DuplicatedCode
    return data?.data?.commodityList?.[0]
}

async function queryprizedetails(actives) {
    let url = `https://m.jingxi.com/active/queryprizedetails?actives=${actives}&_time=1637282950925&_ts=1637282950925&_=1637282950925&sceneval=2&g_login_type=1&callback=jsonpCBKQQ&g_ty=ls`;
    // noinspection DuplicatedCode
    let headers = {
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Referer': 'https://st.jingxi.com/pingou/dream_factory/index.html',
        'Accept-Encoding': 'gzip, deflate, br',
        'Host': 'm.jingxi.com',
        'Accept-Language': 'zh-cn',
        'Cookie': $.cookie
    }
    // noinspection DuplicatedCode
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.uuid()};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    let data = await $.get(url, headers)
    // noinspection DuplicatedCode
    if (data?.ret === 0) {
        return data?.data
    }
    return false;
}

async function QueryHireReward() {
    let url = `https://m.jingxi.com/dreamfactory/friend/QueryHireReward?zone=dream_factory&_time=1637282950550&_ts=1637282950550&_=1637282950550&sceneval=2&g_login_type=1&callback=jsonpCBKLL&g_ty=ls`;
    // noinspection DuplicatedCode
    let headers = {
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Referer': 'https://st.jingxi.com/pingou/dream_factory/index.html',
        'Accept-Encoding': 'gzip, deflate, br',
        'Host': 'm.jingxi.com',
        'Accept-Language': 'zh-cn',
        'Cookie': $.cookie
    }
    // noinspection DuplicatedCode
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.uuid()};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    let data = await $.get(url, headers)
    // noinspection DuplicatedCode
    if (data?.ret === 0) {
        return data?.data
    }
    return false;
}

async function GetShelvesList() {
    let url = `https://m.jingxi.com/dreamfactory/userinfo/GetShelvesList?zone=dream_factory&pageNo=1&pageSize=12&_time=1637282954475&_ts=1637282954475&_=1637282954475&sceneval=2&g_login_type=1&callback=jsonpCBKVV&g_ty=ls`;
    // noinspection DuplicatedCode
    let headers = {
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Referer': 'https://st.jingxi.com/pingou/dream_factory/index.html',
        'Accept-Encoding': 'gzip, deflate, br',
        'Host': 'm.jingxi.com',
        'Accept-Language': 'zh-cn',
        'Cookie': $.cookie
    }
    // noinspection DuplicatedCode
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.uuid()};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    let data = await $.get(url, headers)
    // noinspection DuplicatedCode
    if (data?.ret === 0) {
        return data?.data
    }
    return false;
}