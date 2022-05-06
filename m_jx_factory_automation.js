//20 * * * * m_jx_factory_automation.js
//问题反馈:https://t.me/Wall_E_Channel
const {Env} = require('./magic');
const $ = new Env('M工厂自动化');
let commodityName = process.env.M_JX_FACTORY_COMMODITY
    ? process.env.M_JX_FACTORY_COMMODITY
    : '你还没设置要生产的变量M_JX_FACTORY_COMMODITY'
let stop = false;
$.logic = async function () {
    if (stop) {
        return;
    }
    let info = await GetUserInfo();
    $.log(JSON.stringify(info));

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
        await $.wait(300, 500)
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
    let filter = commodityList.filter(o => o.name.includes(commodityName));
    if (filter.length === 1) {
        let commodity = filter[0];
        if (commodity?.flashStartTime && commodity?.flashStartTime
            > $.timestamp()) {
            $.log(`还没到时间`)
            return;
        }
        let data = await GetCommodityDetails(commodity.commodityId);
        await $.wait(300, 500)
        let newVar = await AddProduction(factoryId, deviceId, data.commodityId);
        if (newVar?.productionId) {
            $.putMsg(`${data.name}已经开始生产`)
            info = await GetUserInfo();
            let product = info?.productionList[0];
            let productionId = product.productionId;
            await InvestElectric(productionId);//添加电力
            await InvestElectric(productionId);
        }
    } else {
        $.putMsg(`没找到你要生产的 ${commodityName}`)
        stop = true;
    }
};

$.run({
    wait: [2000, 3000]
}).catch(
    reason => $.log(reason));

async function InvestElectric(productionId) {
    let url = `https://m.jingxi.com/dreamfactory/userinfo/InvestElectric?zone=dream_factory&productionId=${productionId}&_time=1637743936757&_ts=1637743936757&_=1637743936758&sceneval=2&g_login_type=1&callback=jsonpCBKR&g_ty=ls`;
    // noinspection DuplicatedCode
    let headers = {
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Referer': 'https://st.jingxi.com/pingou/dream_factory/index.html',
        'Accept-Encoding': 'gzip, deflate, br',
        'Host': 'm.jingxi.com',
        'Accept-Language': 'zh-cn'
    }
    // noinspection DuplicatedCode
    headers['Cookie'] = $.cookie
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.randomString(
        40)};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    let data = await $.get(url, headers)
    // noinspection DuplicatedCode
    if (data?.ret === 0) {
        return data?.data
    }
    return false;
}

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
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.randomString(
        40)};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
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
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.randomString(
        40)};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
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
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.randomString(
        40)};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
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
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.randomString(
        40)};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
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
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.randomString(
        40)};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
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
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.randomString(
        40)};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
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
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.randomString(
        40)};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
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
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.randomString(
        40)};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
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
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.randomString(
        40)};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
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
    headers['User-Agent'] = `jdpingou;iPhone;5.2.2;14.3;${$.randomString(
        40)};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    let data = await $.get(url, headers)
    // noinspection DuplicatedCode
    if (data?.ret === 0) {
        return data?.data
    }
    return false;
}