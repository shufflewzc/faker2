//1 0,8-18/3 * * * m_jx_factory_commodity.js
//问题反馈:https://t.me/Wall_E_Channel
const {Env} = require('./magic');
const $ = new Env('M京喜工厂商品');
$.logic = async function () {
    let {commodityList} = await GetCommodityList();
    for (let i = 0; i < commodityList.length; i++) {
        let data = await GetCommodityDetails(commodityList[i].commodityId);
        let s = '';
        let hb = data.description.match(/红包[0-9]+(\.?[0-9]+)?元/g)
            || data.description.match(/以[0-9]+(\.?[0-9]+)?元/g);
        if (hb) {
            s = hb[0].replace('以', '红包');
        } else {
            let ms = data.description.match(/支付[0-9]+(\.?[0-9]+)?元/g);
            if (ms?.length === 1) {
                s = ms[0]
            } else {
                s = '';
            }
        }
        console.log(`${data.name} ${s}`)
        if (s) {
            if (s.match(/[0-9]+(\.?[0-9]+)?/g)[0] * 1 < 10) {
                $.putMsg(`【${data.name}】 ${s}`)
            }
        } else {
            $.putMsg(`【${data.name}】${data.name}`)
        }

        await $.wait(2000, 3000)
    }
}

$.run({
    bot: true,
    delimiter: '\n',
    whitelist: [1]
}).catch(
    reason => $.log(reason));

/**
 * 商品列表
 *
 * try {jsonpCBKKK({"data":{"commodityList":[{"commodityId":1977,"exchangeLimitSeconds":172800,"exclusiveChannel":0,"expressText":"内蒙古、海南、西藏、甘肃、青海、宁夏、新疆、台湾、朝阳区、钓鱼岛、石家庄市、邢台市、保定市、张家口市、承德市、廊坊市、衡水市、郑州市、商丘市、周口市、大连市、哈尔滨市、佳木斯市、黑河市、大兴安岭地区、盐城市、常州市、淄博市、临沂市、日照市、长沙市、衡阳市、上饶市、成都市、自贡市、阿坝州、遵义市、西安市、宝鸡市、海淀区、丰台区、门头沟、通州区、顺义区、昌平区、江北区、渝中区、港澳、海外不发货","flashStartTime":0,"label":0,"limitEndTime":0,"limitStartTime":0,"limitType":4,"name":"收纳罐套装","picture":"//img10.360buyimg.com/mobilecms/s200x200_jfs/t1/206532/12/7952/7263/6180e459E8b1a3bf2/cc2183b1abde0cf3.png","predictProductionDays":"1","produceLevelMax":30,"produceLevelMin":1,"productLimFlag":0,"productionTotal":8938,"raceCompleteNum":0,"raceEndTime":0,"raceStockNum":0,"sendElectricPercent":1,"showStock":0,"starLevel":1,"status":1,"stockNum":534,"userLimitNum":2},{"commodityId":1998,"exchangeLimitSeconds":172800,"exclusiveChannel":0,"expressText":"内蒙古、西藏、甘肃、青海、宁夏、新疆、台湾、钓鱼岛、黑河市、播州区、五莲县、红花岗区、汇川区、信都区、襄都区、港澳、海外、北七家镇不发货","flashStartTime":0,"label":0,"limitEndTime":0,"limitStartTime":0,"limitType":0,"name":"虫草花","picture":"//img10.360buyimg.com/mobilecms/s200x200_jfs/t1/169987/13/24100/43372/618b85d7E3eef1f38/d4eea0fbc7fda08a.png","predictProductionDays":"5","produceLevelMax":30,"produceLevelMin":1,"productLimFlag":0,"productionTotal":1408,"raceCompleteNum":0,"raceEndTime":0,"raceStockNum":0,"sendElectricPercent":1,"showStock":0,"starLevel":2,"status":1,"stockNum":3594,"userLimitNum":1},{"commodityId":1999,"exchangeLimitSeconds":172800,"exclusiveChannel":0,"expressText":"西藏、甘肃、新疆、台湾、钓鱼岛、哈尔滨市、港澳、海外不发货","flashStartTime":0,"label":0,"limitEndTime":0,"limitStartTime":0,"limitType":0,"name":"桌面收纳柜","picture":"//img10.360buyimg.com/mobilecms/s200x200_jfs/t1/204474/24/14755/28897/618b7dfcE6fe73b24/bbbbf32a50ebf0d9.png","predictProductionDays":"6","produceLevelMax":30,"produceLevelMin":1,"productLimFlag":0,"productionTotal":10053,"raceCompleteNum":0,"raceEndTime":0,"raceStockNum":0,"sendElectricPercent":1,"showStock":0,"starLevel":3,"status":1,"stockNum":2950,"userLimitNum":1},{"commodityId":1958,"exchangeLimitSeconds":172800,"exclusiveChannel":0,"expressText":"甘肃、青海、新疆、台湾、钓鱼岛、尚义县、清镇市、仁怀市、银川市、雁塔区、红花岗区、汇川区、长安区、信都区、襄都区、未央区、阎良区、新城区、港澳、海外、莲池区不发货","flashStartTime":1636632000,"label":0,"limitEndTime":0,"limitStartTime":0,"limitType":4,"name":"美的微波炉","picture":"//img10.360buyimg.com/mobilecms/s200x200_jfs/t1/170109/37/22755/7422/6178b994Ea776a3b2/372067cdacb2e4c3.png","predictProductionDays":"1","produceLevelMax":30,"produceLevelMin":1,"productLimFlag":0,"productionTotal":8,"raceCompleteNum":0,"raceEndTime":0,"raceStockNum":0,"sendElectricPercent":1,"showStock":0,"starLevel":1,"status":1,"stockNum":1,"userLimitNum":1},{"commodityId":1984,"exchangeLimitSeconds":172800,"exclusiveChannel":0,"expressText":"海南、西藏、新疆、台湾、钓鱼岛、港澳、海外不发货","flashStartTime":0,"label":0,"limitEndTime":0,"limitStartTime":0,"limitType":0,"name":"拉面碗4个装","picture":"//img10.360buyimg.com/mobilecms/s200x200_jfs/t1/161607/9/21878/8106/6180fb2dEe528464a/65d83198fb081c85.png","predictProductionDays":"7","produceLevelMax":30,"produceLevelMin":1,"productLimFlag":0,"productionTotal":28886,"raceCompleteNum":0,"raceEndTime":0,"raceStockNum":0,"sendElectricPercent":1,"showStock":0,"starLevel":3,"status":1,"stockNum":1115,"userLimitNum":1},{"commodityId":1988,"exchangeLimitSeconds":172800,"exclusiveChannel":0,"expressText":"西藏、青海、新疆、长宁区、闵行区、青浦区不发货","flashStartTime":0,"label":0,"limitEndTime":0,"limitStartTime":0,"limitType":0,"name":"汤勺漏勺4支装","picture":"//img10.360buyimg.com/mobilecms/s200x200_jfs/t1/216578/33/2811/7981/6180fc82E1dce001d/8537f027ba303dfc.png","predictProductionDays":"4","produceLevelMax":30,"produceLevelMin":1,"productLimFlag":0,"productionTotal":11260,"raceCompleteNum":0,"raceEndTime":0,"raceStockNum":0,"sendElectricPercent":1,"showStock":0,"starLevel":2,"status":1,"stockNum":3740,"userLimitNum":1},{"commodityId":1991,"exchangeLimitSeconds":172800,"exclusiveChannel":0,"expressText":"宁夏、新疆、石家庄市、大连市、哈尔滨市、黑河市、二连浩特市、阿拉善盟、常州市、日照市、株洲市、上饶市、成都市、兰州市、天水市、嘉峪关市、陇南市、张掖市、酒泉市、甘南州、青浦区、昌平区不发货","flashStartTime":0,"label":0,"limitEndTime":0,"limitStartTime":0,"limitType":0,"name":"茶里乌龙茶包","picture":"//img10.360buyimg.com/mobilecms/s200x200_jfs/t1/156199/9/24504/10220/6188ce73E31cdc245/d016ad5cc40a6ad7.png","predictProductionDays":"5","produceLevelMax":30,"produceLevelMin":1,"productLimFlag":0,"productionTotal":4103,"raceCompleteNum":0,"raceEndTime":0,"raceStockNum":0,"sendElectricPercent":1,"showStock":0,"starLevel":2,"status":1,"stockNum":897,"userLimitNum":1},{"commodityId":1992,"exchangeLimitSeconds":172800,"exclusiveChannel":0,"expressText":"上海、黑龙江、内蒙古、海南、贵州、西藏、甘肃、青海、宁夏、新疆、台湾、钓鱼岛、港澳、海外不发货","flashStartTime":0,"label":0,"limitEndTime":0,"limitStartTime":0,"limitType":0,"name":"毛球修剪器","picture":"//img10.360buyimg.com/mobilecms/s200x200_jfs/t1/214717/8/3614/7172/6188d29bEe9fd503b/c854a3de8305fdc1.png","predictProductionDays":"6","produceLevelMax":30,"produceLevelMin":1,"productLimFlag":0,"productionTotal":7953,"raceCompleteNum":0,"raceEndTime":0,"raceStockNum":0,"sendElectricPercent":1,"showStock":0,"starLevel":3,"status":1,"stockNum":12048,"userLimitNum":1},{"commodityId":1993,"exchangeLimitSeconds":172800,"exclusiveChannel":0,"expressText":"","flashStartTime":0,"label":0,"limitEndTime":0,"limitStartTime":0,"limitType":0,"name":"秋冬毛绒围脖","picture":"//img10.360buyimg.com/mobilecms/s200x200_jfs/t1/197696/28/16685/9626/6188d2e7E97bdaa1b/56a2351716900b29.png","predictProductionDays":"5","produceLevelMax":30,"produceLevelMin":1,"productLimFlag":0,"productionTotal":5740,"raceCompleteNum":0,"raceEndTime":0,"raceStockNum":0,"sendElectricPercent":1,"showStock":0,"starLevel":2,"status":1,"stockNum":14261,"userLimitNum":1},{"commodityId":1994,"exchangeLimitSeconds":172800,"exclusiveChannel":0,"expressText":"内蒙古、海南、西藏、甘肃、青海、宁夏、新疆、台湾、钓鱼岛、哈尔滨市、黑河市、成都市、遵义市、昌平区、武进区、港澳、海外不发货","flashStartTime":0,"label":0,"limitEndTime":0,"limitStartTime":0,"limitType":0,"name":"多孔插排","picture":"//img10.360buyimg.com/mobilecms/s200x200_jfs/t1/213301/4/3641/5663/6188d3e4Eb9a5a627/3e28b9a27460f17d.png","predictProductionDays":"7","produceLevelMax":30,"produceLevelMin":1,"productLimFlag":0,"productionTotal":8457,"raceCompleteNum":0,"raceEndTime":0,"raceStockNum":0,"sendElectricPercent":1,"showStock":0,"starLevel":3,"status":1,"stockNum":1544,"userLimitNum":1},{"commodityId":1941,"exchangeLimitSeconds":172800,"exclusiveChannel":0,"expressText":"西藏、新疆、港澳、海外不发货","flashStartTime":0,"label":0,"limitEndTime":0,"limitStartTime":0,"limitType":0,"name":"珊瑚绒睡裤","picture":"//img10.360buyimg.com/mobilecms/s200x200_jfs/t1/170576/12/21719/9109/61726e03Ea7eb7800/e8463377da2c0e74.png","predictProductionDays":"7","produceLevelMax":30,"produceLevelMin":1,"productLimFlag":0,"productionTotal":57847,"raceCompleteNum":0,"raceEndTime":0,"raceStockNum":0,"sendElectricPercent":93,"showStock":0,"starLevel":3,"status":1,"stockNum":153,"userLimitNum":1}],"totalCount":11},"msg":"OK","nowTime":1636619667,"ret":0}
)} catch (e) {}
 */
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

/**
 * 商品详情
 *
 * try {jsonpCBKWWW({"data":{"commodityList":[{"commodityId":1981,"createTime":1635842589,"description":"【活动价为12.9元，完成需支付4元下单】","deviceIds":"1","electricThreshold":0,"exchangeLimitSeconds":172800,"exclusiveChannel":0,"expressText":"内蒙古、西藏、甘肃、青海、新疆、台湾、钓鱼岛、晋中市、蒲县、濮阳市、哈尔滨市、黑河市、呼玛县、连云港市、扬州市、淄博市、日照市、长兴县、仙游县、攸县、衡阳市、隆回县、靖西市、富顺县、合江县、旺苍县、若尔盖县、石渠县、遵义市、昆明市、普洱市、德宏州、西安市、洋县、银川市、吴忠市、昌平区、蜀山区、管城回族区、云龙镇、大沥镇、高新技术产业开发区、港澳、海外不发货","flashStartTime":0,"isPingouFactSkuInfo":2,"label":0,"ladderActive":"[]","limitEndTime":0,"limitStartTime":0,"limitType":0,"materialIds":"520","name":"保暖毛圈袜5双","offlineTime":1636819199,"onlineTime":1635868800,"picture":"//img10.360buyimg.com/mobilecms/s200x200_jfs/t1/201640/24/13983/12979/6180fa27E7a8317b9/121ef886afc15c9e.png","pingouFactZoneName":"","predictProductDays":"7","price":12600,"prizePoolIds":"","produceLevelMax":30,"produceLevelMin":1,"productLimFlag":0,"productLimSeconds":1900800,"productionCondition":"限时22天完成生产 |内蒙古、西藏、甘肃、青海、新疆、台湾、钓鱼岛、晋中市、蒲县、濮阳市、哈尔滨市、黑河市、呼玛县、连云港市、扬州市、淄博市、日照市、长兴县、仙游县、攸县、衡阳市、隆回县、靖西市、富顺县、合江县、旺苍县、若尔盖县、石渠县、遵义市、昆明市、普洱市、德宏州、西安市、洋县、银川市、吴忠市、昌平区、蜀山区、管城回族区、云龙镇、大沥镇、高新技术产业开发区、港澳、海外不发货","raceCompleteNum":0,"raceEndTime":0,"raceStockNum":0,"sendElectricPercent":1,"showStock":0,"skuId":"10037609865072","starLevel":3,"status":1,"stockNum":0,"typeId":0,"updateTime":1636338700,"usedNum":4463,"userLimitNum":1,"userProductionNum":1}]},"msg":"OK","nowTime":1636437544,"ret":0}
)} catch (e) {}
 */
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
