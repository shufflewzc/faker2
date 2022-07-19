/*
活动地址为：https://cjhydz-isv.isvjcloud.com/wxTeam/activity?activityId=xxxxx
一共有2个变量
jd_cjhy_activityId  活动ID 必需
jd_cjhy_activityUrl 活动地址 必需

#CJ组队瓜分京豆
1 1 1 1 1 1 jd_cjzdgf.js, tag=CJ组队瓜分京豆, enabled=true

Fix by HarbourJ, 2022.06.15
TG: https://t.me/HarbourToulu

2022年5月8日由https://github.com/insoxin/解密
解密附言:下列js中的如果有非京东官方服务器绝对不是我的,原作就有,不承担任何责任,有能力者可自行解密对验
*/

let jd_cjhy_activityId = "2584bc5fb137415c87cedbb2e56bda3c" // 活动ID
let jd_cjhy_activityUrl = "https://cjhydz-isv.isvjcloud.com" // 活动地址

const $ = new Env('CJ组队瓜分京豆');

const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
var timestamp = new Date().getTime();
let cookiesArr = [], cookie = '', message = '', messageTitle = '';
activityId = $.getdata('jd_cjhy_activityId') ? $.getdata('jd_cjhy_activityId') : jd_cjhy_activityId;
activityUrl = $.getdata('jd_cjhy_activityUrl') ? $.getdata('jd_cjhy_activityUrl') : jd_cjhy_activityUrl;
let activityCookie = '';
if ($.isNode()) {
    if (process.env.jd_cjhy_activityId) activityId = process.env.jd_cjhy_activityId;
    if (process.env.jd_cjhy_activityUrl) activityUrl = process.env.jd_cjhy_activityUrl;
    if (JSON.stringify(process.env).indexOf('GITHUB') > -1) process.exit(0);
    Object.keys(jdCookieNode).forEach(_0x4d349b => {
        cookiesArr.push(jdCookieNode[_0x4d349b]);
    });
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
    };
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...$.toObj($.getdata('CookiesJD') || '[]').map(_0x1bc39f => _0x1bc39f.cookie)].filter(_0x5bce83 => !!_0x5bce83);
}
const JD_API_HOST = 'https://api.m.jd.com/client.action';
let isGetCookie = typeof $request !== 'undefined';
if (isGetCookie) {
    GetCookie();
    $.done();
}
!(async () => {
    console.log('\n【如果显示：奖品与您擦肩而过了哟，可能是 此活动黑了！ 】\n【如果显示：Response code 493 ，可能是 变量不正确！ 】\n【还是显示：Response code 493 ，那么 此容器IP黑了！ 】\n');
    if (!activityId) {
        $.msg($.name, '', '活动id不存在');
        $.done();
        return;
    }
    console.log('【当前活动入口】\nhttps://cjhydz-isv.isvjcloud.com/wxTeam/activity?activityId=' + activityId);
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {'open-url': 'https://bean.m.jd.com/'});
        return;
    }
    $.memberCount = 0;
    messageTitle += '活动id:\n' + activityId + '\n';
    $.toactivity = [];
    for (let _0x11ec65 = 0; _0x11ec65 < cookiesArr.length; _0x11ec65++) {
        if (cookiesArr[_0x11ec65]) {
            cookie = cookiesArr[_0x11ec65];
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1]);
            $.index = _0x11ec65 + 1;
            $.isLogin = true;
            $.nickName = '';
            console.log('\n******开始【京东账号' + $.index + '】' + ($.nickName || $.UserName) + '*********\n');
            if (!$.isLogin) {
                $.msg($.name, '【提示】cookie已失效', '京东账号' + $.index + ' ' + ($.nickName || $.UserName) + '\n请重新登录获取\nhttps://bean.m.jd.com/', {'open-url': 'https://bean.m.jd.com/'});
                if ($.isNode()) {
                    await notify.sendNotify($.name + 'cookie已失效 - ' + $.UserName, '京东账号' + $.index + ' ' + $.UserName + '\n请重新登录获取cookie');
                }
                continue;
            }
            await jrzd();
            if (!$.toactivity || $.maxTeam) {
                break;
            }
        }
    }
    messageTitle += '队伍人数 ' + $.memberCount + '\n';
    await showMsg();
})().catch(_0x4eace8 => {
    $.log('', ' ' + $.name + ', 失败! 原因: ' + _0x4eace8 + '!', '');
}).finally(() => {
    $.done();
});

async function jrzd() {
    getUA();
    $.sid = '';
    $.userId = '';
    $.Token = '';
    $.Pin = '';
    $.hisPin = '';
    $.card = [];
    $.saveTeam = false;
    await getCk();
    // await getToken();
    // if($.Token==''){
    // 	console.log('获取[token]失败！');
    // 	return;
    // }
    // $.AUTH_C_USER='F4eV+FtcEdTNOCLwmRgOEtA1Drq3za4lh6LFLfledF1cdSiqMbCx5edEEaL3RnCSkdK3rLBQpEQH9V4tdrrh0w==';
    await getSimpleActInfoVo();
    await getshopInfo();
    await $.wait(1000);
    if ($.sid && $.userId) {
        await getToken();
        if ($.Token) await getPin();
        console.log('pin:' + $.Pin);
        await $.wait(1000);
        await accessLog();
        await $.wait(1000);
        await getUserInfo();
        await $.wait(1000);
        await getOpenCardInfo();
        await $.wait(1000);
        await getTeam();
        await $.wait(1000);
        if ($.maxTeam) {
            console.log('队伍已满员');
            return;
        }
    } else {
        console.log('【京东账号' + $.index + '】 未能获取活动信息');
        message += '【京东账号' + $.index + '】 未能获取活动信息\n';
    }
}

function token() {
    return new Promise(_0x3ad726 => {
        let _0x5761de = {
            'url': 'https://cjhydz-isv.isvjcloud.com/wxCommonInfo/getSystemConfig',
            'headers': {
                'Cookie': activityCookie + ' ' + cookie,
                'Referer': 'https://cjhydz-isv.isvjcloud.com/wxTeam/activity?activityId=' + $.activityId + '&shareUuid=' + $.shareUuid,
                'User-Agent': $['UA']
            }
        };
        $.get(_0x5761de, async (_0x3740c9, _0x281137, _0x52d816) => {
            try {
                if (_0x3740c9) {
                    console.log('' + $.toStr(_0x3740c9));
                    console.log($.name + ' cookie API请求失败，请检查网路重试');
                } else {
                    let _0x1edab3 = '';
                    let _0x282c8c = '';
                    let _0x11ca1c = _0x281137.headers['set-cookie'] || _0x281137.headers['Set-Cookie'] || '';
                    let _0x2664ba = '';
                    if (_0x11ca1c) {
                        if (typeof _0x11ca1c != 'object') {
                            _0x2664ba = _0x11ca1c.split(',');
                        } else _0x2664ba = _0x11ca1c;
                        for (let _0x3973be of _0x2664ba) {
                            let _0x46db5a = _0x3973be.split(';')[0].trim();
                            if (_0x46db5a.split('=')[1]) {
                                if (_0x46db5a.indexOf('LZ_TOKEN_KEY=') > -1) _0x1edab3 = _0x46db5a.replace(/ /g, '') + ';';
                                if (_0x46db5a.indexOf('LZ_TOKEN_VALUE=') > -1) _0x282c8c = _0x46db5a.replace(/ /g, '') + ';';
                            }
                        }
                    }
                    if (_0x1edab3 && _0x282c8c) activityCookie = _0x1edab3 + ' ' + _0x282c8c;
                }
            } catch (_0x32df56) {
                $.logErr(_0x32df56, _0x281137);
            } finally {
                _0x3ad726();
            }
        });
    });
}

function getUA() {
    $['UA'] = 'jdapp;iPhone;10.3.0;;;M/5.0;appBuild/167903;jdSupportDarkMode/0;ef/1;ep/%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22ud%22%3A%22ZWY5YtTvYwVsCzY4DWYnY2VtDNU0ZtVwCNU2EQTtZtY1DtTuDtu4Dm%3D%3D%22%2C%22sv%22%3A%22CJGkEK%3D%3D%22%2C%22iad%22%3A%22%22%7D%2C%22ts%22%3A1645068549%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D;Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;';
}

function showMsg() {
    return new Promise(_0x427de1 => {
        $.msg($.name, '', '【京东账号' + $.index + '】' + $.nickName + '\n' + message);
        _0x427de1();
    });
}

function getSimpleActInfoVo() {
    return new Promise(_0x3b2f2f => {
        let _0x3df25e = 'activityId=' + activityId;
        $.post(taskPostUrl('/customer/getSimpleActInfoVo', _0x3df25e), async (_0x24b851, _0x506ba0, _0xb90a83) => {
            try {
                if (_0x24b851) {
                    console.log('' + $.toStr(_0x24b851));
                    console.log($.name + ' getSimpleActInfoVo API请求失败，请检查网路重试');
                } else {
                    // if (_0x506ba0.status == 200) {
                    //     refreshToken(_0x506ba0);
                    // }
                }
            } catch (_0x479e02) {
                $.logErr(_0x479e02, _0x506ba0);
            } finally {
                _0x3b2f2f();
            }
        });
    });
}

function randomString(_0x429e08) {
    _0x429e08 = _0x429e08 || 32;
    let _0x1b8480 = 'abcdef0123456789', _0x5df645 = _0x1b8480.length, _0x43a61b = '';
    for (i = 0; i < _0x429e08; i++) _0x43a61b += _0x1b8480.charAt(Math.floor(Math.random() * _0x5df645));
    return _0x43a61b;
}

function getCk() {
    return new Promise(_0x4e6307 => {
        let _0x359f21 = {
            'url': activityUrl + '/wxTeam/activity?activityId=' + activityId,
            'headers': {'Cookie': cookie, 'User-Agent': $['UA']}
        };
        $.get(_0x359f21, async (_0x3f1965, _0x21b7ff, _0x2bd744) => {
            try {
                if (_0x3f1965) {
                    console.log('' + JSON.stringify(_0x3f1965));
                    console.log($.name + ' cookie API请求失败，请检查网路重试');
                } else {
                    if (_0x21b7ff.status == 200) {
                        refreshToken(_0x21b7ff);
                    }
                }
            } catch (_0x4674fe) {
                $.logErr(_0x4674fe, _0x21b7ff);
            } finally {
                _0x4e6307();
            }
        });
    });
}

function getToken() {
    return new Promise(_0x490416 => {
        let _0x12bfe2 = 'adid=7B411CD9-D62C-425B-B083-9AFC49B94228&area=16_1332_42932_43102&body=%7B%22url%22%3A%22https%3A%5C/%5C/cjhydz-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&build=167541&client=apple&clientVersion=9.4.0&d_brand=apple&d_model=iPhone8%2C1&eid=eidId10b812191seBCFGmtbeTX2vXF3lbgDAVwQhSA8wKqj6OA9J4foPQm3UzRwrrLdO23B3E2wCUY/bODH01VnxiEnAUvoM6SiEnmP3IPqRuO%2By/%2BZo&isBackground=N&joycious=48&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&openudid=2f7578cb634065f9beae94d013f172e197d62283&osVersion=13.1.2&partner=apple&rfs=0000&scope=11&screen=750%2A1334&sign=60bde51b4b7f7ff6e1bc1f473ecf3d41&st=1613720203903&sv=110&uts=0f31TVRjBStG9NoZJdXLGd939Wv4AlsWNAeL1nxafUsZqiV4NLsVElz6AjC4L7tsnZ1loeT2A8Z5/KfI/YoJAUfJzTd8kCedfnLG522ydI0p40oi8hT2p2sNZiIIRYCfjIr7IAL%2BFkLsrWdSiPZP5QLptc8Cy4Od6/cdYidClR0NwPMd58K5J9narz78y9ocGe8uTfyBIoA9aCd/X3Muxw%3D%3D&uuid=hjudwgohxzVu96krv/T6Hg%3D%3D&wifiBssid=9cf90c586c4468e00678545b16176ed2';
        $.post(taskUrl('?functionId=isvObfuscator', _0x12bfe2), async (_0x181dd6, _0x3bac04, _0x37bf72) => {
            try {
                if (_0x181dd6) {
                    console.log('' + JSON.stringify(_0x181dd6));
                    console.log($.name + ' 2 API请求失败，请检查网路重试');
                } else {
                    if (safeGet(_0x37bf72)) {
                        _0x37bf72 = JSON.parse(_0x37bf72);
                        if (_0x37bf72.code == 0 && _0x37bf72.token) {
                            $.Token = _0x37bf72.token;
                        } else {
                            console.log('异常2：' + JSON.stringify(_0x37bf72));
                        }
                    }
                }
            } catch (_0x1ce854) {
                $.logErr(_0x1ce854, _0x3bac04);
            } finally {
                _0x490416();
            }
        });
    });
}

function getPin() {
    return new Promise(_0x2d101c => {
        let _0x307663 = 'userId=' + $.userId + '&token=' + $.Token + '&fromType=APP&riskType=1';
        $.post(taskPostUrl('/customer/getMyPing', _0x307663), async (_0x3788ff, _0x17c86b, _0x16ff63) => {
            try {
                if (_0x3788ff) {
                    console.log('' + JSON.stringify(_0x3788ff));
                    console.log($.name + ' 3 API请求失败，请检查网路重试');
                } else {
                    if (_0x17c86b.status == 200) {
                        refreshToken(_0x17c86b);
                    }
                    if (safeGet(_0x16ff63)) {
                        _0x16ff63 = JSON.parse(_0x16ff63);
                        if (_0x16ff63.result && _0x16ff63.data) {
                            $.Pin = _0x16ff63.data.secretPin;
                        } else {
                            console.log('异常3：' + JSON.stringify(_0x16ff63));
                        }
                    }
                }
            } catch (_0x49ad63) {
                $.logErr(_0x49ad63, _0x17c86b);
            } finally {
                _0x2d101c();
            }
        });
    });
}

function getshopInfo() {
    return new Promise(_0x3bee67 => {
        $.post(taskPostUrl('/wxTeam/shopInfo', 'activityId=' + activityId), async (_0x3c4256, _0x22b929, _0x3fd22b) => {
            try {
                if (_0x3c4256) {
                    console.log('' + JSON.stringify(_0x3c4256));
                    console.log($.name + ' 1 API请求失败，请检查网路重试');
                } else {
                    if (_0x3fd22b && safeGet(_0x3fd22b)) {
                        _0x3fd22b = JSON.parse(_0x3fd22b);
                        if (_0x3fd22b.data) {
                            $.sid = _0x3fd22b.data.sid;
                            $.userId = _0x3fd22b.data.userId;
                            $.shopName = _0x3fd22b.data.shopName;
                        } else {
                            console.log('异常1：' + JSON.stringify(_0x3fd22b));
                        }
                    }
                }
            } catch (_0xec00da) {
                $.logErr(_0xec00da, _0x22b929);
            } finally {
                _0x3bee67();
            }
        });
    });
}

function getOpenCardInfo() {
    return new Promise(_0x2602f8 => {
        let _0x41a160 = 'venderId=' + $.userId + '&buyerPin=' + encodeURIComponent($.Pin);
        $.post(taskPostUrl('/mc/new/brandCard/common/shopAndBrand/getOpenCardInfo', _0x41a160), async (_0x45c50b, _0x6ada86, _0x284108) => {
            try {
                if (_0x45c50b) {
                    console.log('' + JSON.stringify(_0x45c50b));
                    console.log($.name + 'API请求失败，请检查网路重试');
                } else {
                    if (safeGet(_0x284108)) {
                        _0x284108 = JSON.parse(_0x284108);
                        if (_0x284108.result && _0x284108.data) {
                            if (_0x284108.data.openCardLink) {
                                $.channel = _0x284108.data.openCardLink.match(/channel=(\d+)/)[1];
                                $.joinVenderId = _0x284108.data.openCardLink.match(/venderId=(\d+)/)[1];
                            } else {
                            }
                        }
                    }
                }
            } catch (_0x4649a3) {
                $.logErr(_0x4649a3, _0x6ada86);
            } finally {
                _0x2602f8();
            }
        });
    });
}

function joinShop() {
    return new Promise(async _0x553f58 => {
        let _0x59466f = '{\n			  "venderId":"' + $.joinVenderId + '",\n			  "shopId":"' + $.joinVenderId + '",\n			  "bindByVerifyCodeFlag":1,\n			  "registerExtend":{},\n			  "writeChildFlag":0,\n			  "channel":' + $.channel + '\n			  }';
        $.errorJoinShop = '';
        await $.wait(1000);
        await getshopactivityId();
        let _0x145e86 = '';
        let _0x5df2ba = '20220614090341129%3B0284392757226553%3Bef79a%3Btk02wcbf51cf018njrSeb2PERKoZxKtLTPV0g0paq33tkJwK4bJurufnMpBuFkn4RVxkfBmwRhN8VRd%2BB2q%2BrzaXvMR7%3B3f2a1efdb5f2b79e17aa8836a38af77030ad35b4aab128c11e3edbaa034c1733%3B3.0%3B1655168621129';
        const _0x519e48 = {
            'url': 'https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=bindWithVender&body=' + _0x59466f + '&clientVersion=9.2.0&client=H5&uuid=88888&h5st=' + _0x5df2ba,
            'headers': {
                'Content-Type': 'text/plain; Charset=UTF-8',
                'Origin': 'https://api.m.jd.com',
                'Host': 'api.m.jd.com',
                'accept': '*/*',
                'User-Agent': $['UA'],
                'content-type': 'application/x-www-form-urlencoded',
                'Cookie': cookie
            }
        };
        $.get(_0x519e48, async (_0x32e876, _0x5d0172, _0x128e46) => {
            try {
                let _0x24e47a = $.toObj(_0x128e46, _0x128e46);
                if (typeof _0x24e47a == 'object') {
                    if (_0x24e47a.success === true) {
                        console.log(_0x24e47a.message);
                        $.errorJoinShop = _0x24e47a.message;
                        if (_0x24e47a.result && _0x24e47a.result.giftInfo) {
                            for (let _0x11d899 of _0x24e47a.result.giftInfo.giftList) {
                                console.log('入会获得:' + _0x11d899.discountString + _0x11d899.prizeName + _0x11d899.secondLineDesc);
                            }
                        }
                    } else if (typeof _0x24e47a == 'object' && _0x24e47a.message) {
                        $.errorJoinShop = _0x24e47a.message;
                        console.log('' + (_0x24e47a.message || ''));
                    } else {
                        console.log(_0x128e46);
                    }
                } else {
                    console.log(_0x128e46);
                }
            } catch (_0x205e26) {
                $.logErr(_0x205e26, _0x5d0172);
            } finally {
                _0x553f58();
            }
        });
    });
}

function getshopactivityId() {
    return new Promise(_0x44f9bf => {
        const _0x245b18 = {
            'url': 'https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=getShopOpenCardInfo&body=%7B%22venderId%22%3A%22' + $.joinVenderId + '%22%2C%22channel%22%3A401%7D&client=H5&clientVersion=9.2.0&uuid=88888',
            'headers': {
                'Content-Type': 'text/plain; Charset=UTF-8',
                'Origin': 'https://api.m.jd.com',
                'Host': 'api.m.jd.com',
                'accept': '*/*',
                'User-Agent': $['UA'],
                'content-type': 'application/x-www-form-urlencoded',
                'Cookie': cookie
            }
        };
        $.get(_0x245b18, async (_0x4d617a, _0x5b6ea6, _0x4ec6d1) => {
            try {
                let _0x930527 = $.toObj(_0x4ec6d1, _0x4ec6d1);
                if (typeof _0x930527 == 'object') {
                    if (_0x930527.success == true) {
                        console.log('入会:' + (_0x930527.result.shopMemberCardInfo.venderCardName || ''));
                    }
                } else {
                    console.log(_0x4ec6d1);
                }
            } catch (_0x303b24) {
                $.logErr(_0x303b24, _0x5b6ea6);
            } finally {
                _0x44f9bf();
            }
        });
    });
}

function getUserInfo() {
    return new Promise(_0x511858 => {
        let _0x7417ea = 'pin=' + encodeURIComponent(encodeURIComponent($.Pin));
        $.post(taskPostUrl('/wxActionCommon/getUserInfo', _0x7417ea), async (_0x8b7651, _0x141497, _0x509f3b) => {
            try {
                if (_0x8b7651) {
                    console.log('' + JSON.stringify(_0x8b7651));
                    console.log($.name + ' 6-1 API请求失败，请检查网路重试');
                } else {
                    if (safeGet(_0x509f3b)) {
                        _0x509f3b = JSON.parse(_0x509f3b);
                        if (_0x509f3b.result && _0x509f3b.data) {
                            $.attrTouXiang = _0x509f3b.data.yunMidImageUrl ? _0x509f3b.data.yunMidImageUrl : 'https://img10.360buyimg.com/imgzone/jfs/t1/21383/2/6633/3879/5c5138d8E0967ccf2/91da57c5e2166005.jpg';
                        } else {
                            console.log('异常6-2：' + JSON.stringify(_0x509f3b));
                        }
                    }
                }
            } catch (_0x15ffa6) {
                $.logErr(_0x15ffa6, _0x141497);
            } finally {
                _0x511858();
            }
        });
    });
}

function getTeam() {
    return new Promise(_0x239f37 => {
        let _0x411559 = 'activityId=' + activityId + '&pin=' + encodeURIComponent(encodeURIComponent($.Pin));
        if ($.signUuid) _0x411559 += '&signUuid=' + $.signUuid;
        $.post(taskPostUrl('/wxTeam/activityContent', _0x411559), async (_0x140502, _0x14995f, _0x11684e) => {
            try {
                if (_0x140502) {
                    console.log('' + JSON.stringify(_0x140502));
                    console.log($.name + ' 5 API请求失败，请检查网路重试');
                } else {
                    if (safeGet(_0x11684e)) {
                        _0x11684e = JSON.parse(_0x11684e);
                        if (_0x11684e.result && _0x11684e.data) {
                            if (new Date(_0x11684e.data.active.endTimeStr.replace(/-/g, '/')).getTime() < new Date().getTime()) {
                                $.toactivity = false;
                                console.log('活动结束');
                                messageTitle += '活动结束\n';
                                _0x239f37();
                            } else {
                                if (!_0x11684e.data.canCreate && _0x11684e.data.list == null) message += '人数已满\n';
                                if (_0x11684e.data.share) {
                                    $.memberCount = parseInt(_0x11684e.data.share.memberCount, 10) + 1;
                                } else {
                                    $.memberCount = 0;
                                }
                                if ($.index == 1) {
                                    $.saveTeam = true;
                                    $.teamNum = _0x11684e.data.active.actRule.match(/最多可以组建(\d+)个战队/);
                                    if ($.teamNum) {
                                        $.teamNum = $.teamNum[1];
                                        messageTitle += '最多可以组建' + $.teamNum + '个战队';
                                    }
                                }
                                if ($.signUuid) {
                                    $.log('加入队伍 id: ' + $.signUuid);
                                    await $.wait(1000);
                                    await joinTeam();
                                }
                                if ($.saveTeam) {
                                    if (_0x11684e.data.canCreate) {
                                        await $.wait(1000);
                                        await saveTeam();
                                    } else {
                                        $.signUuid = _0x11684e.data.signUuid;
                                        messageTitle += '队伍id: ' + $.signUuid + '\n';
                                        message += '【京东账号' + $.index + '】 创建队伍id: ' + $.signUuid;
                                        $.log('队伍id: ' + $.signUuid);
                                        $.wait(1000);
                                        $.log('加入队伍 id: ' + $.signUuid);
                                        await joinTeam();
                                    }
                                }
                            }
                        } else {
                            console.log('异常5：' + JSON.stringify(_0x11684e));
                        }
                    }
                }
            } catch (_0x45fae3) {
                $.logErr(_0x45fae3, _0x14995f);
            } finally {
                _0x239f37(_0x239f37);
            }
        });
    });
}

function saveTeam(_0xd519d7 = 0) {
    return new Promise(_0x270eca => {
        let _0x1a0f79 = encodeURIComponent(encodeURIComponent($.Pin));
        if (_0xd519d7 == 1) _0x1a0f79 = encodeURIComponent(encodeURIComponent($.Pin));
        let _0x44652e = 'activityId=' + activityId + '&pin=' + _0x1a0f79 + '&pinImg=' + encodeURIComponent(encodeURIComponent($.attrTouXiang));
        $.post(taskPostUrl('/wxTeam/saveCaptain', _0x44652e), async (_0x767d7b, _0x17080e, _0x1070a3) => {
            try {
                if (_0x767d7b) {
                    console.log('' + JSON.stringify(_0x767d7b));
                    console.log($.name + ' 6 API请求失败，请检查网路重试');
                } else {
                    if (safeGet(_0x1070a3)) {
                        _0x1070a3 = JSON.parse(_0x1070a3);
                        if (_0x1070a3.result && _0x1070a3.data) {
                            message += '【京东账号' + $.index + '】 创建队伍id: ' + _0x1070a3.data.signUuid + ' ';
                            console.log('创建队伍成功 id: ' + _0x1070a3.data.signUuid);
                            $.signUuid = _0x1070a3.data.signUuid;
                            messageTitle += '队伍id: ' + $.signUuid + ' ';
                        } else {
                            console.log('异常6：' + JSON.stringify(_0x1070a3));
                            if (_0x1070a3.errorMessage.indexOf('不是店铺会员') > -1 && _0xd519d7 != 3) {
                                $.errorJoinShop = '';
                                await joinShop();
                                if ($.errorJoinShop.indexOf('活动太火爆，请稍后再试') > -1) {
                                    console.log('第1次 重新开卡');
                                    await $.wait(1000);
                                    await joinShop();
                                }
                                if ($.errorJoinShop.indexOf('活动太火爆，请稍后再试') > -1) {
                                    console.log('第2次 重新开卡');
                                    await $.wait(1000);
                                    await joinShop();
                                }
                                if ($.errorJoinShop.indexOf('活动太火爆，请稍后再试') > -1) {
                                    console.log('第3次 重新开卡');
                                    await $.wait(1000);
                                    await joinShop();
                                }
                                await $.wait(1000);
                                await saveTeam(3);
                            } else if (_0x1070a3.errorMessage.indexOf('奖品与您擦肩而过') > -1 && _0xd519d7 == 0) {
                                await $.wait(1000);
                                await saveTeam(1);
                            }
                        }
                    }
                }
            } catch (_0x29c6cc) {
                $.logErr(_0x29c6cc, _0x17080e);
            } finally {
                _0x270eca();
            }
        });
    });
}

function joinTeam(_0x5a3500 = 0) {
    return new Promise(_0x40dede => {
        let _0x5d51ce = encodeURIComponent(encodeURIComponent($.Pin));
        if (_0x5a3500 == 1) _0x5d51ce = encodeURIComponent(encodeURIComponent($.Pin));
        let _0x14deba = 'activityId=' + activityId + '&signUuid=' + $.signUuid + '&pin=' + _0x5d51ce + '&pinImg=' + encodeURIComponent(encodeURIComponent($.attrTouXiang));
        $.post(taskPostUrl('/wxTeam/saveMember', _0x14deba), async (_0x53be06, _0x5ed55f, _0x19a125) => {
            try {
                if (_0x53be06) {
                    console.log('' + JSON.stringify(_0x53be06));
                    console.log($.name + ' 7 API请求失败，请检查网路重试');
                } else {
                    if (safeGet(_0x19a125)) {
                        _0x19a125 = JSON.parse(_0x19a125);
                        if (_0x19a125.result && _0x19a125.data) {
                            message += '【京东账号' + $.index + '】 加入队伍\n';
                            $.log('加入队伍成功');
                        } else {
                            if (_0x19a125.errorMessage.indexOf('不是店铺会员') > -1 && _0x5a3500 != 3) {
                                $.errorJoinShop = '';
                                await joinShop();
                                if ($.errorJoinShop.indexOf('活动太火爆，请稍后再试') > -1) {
                                    console.log('第1次 重新开卡');
                                    await $.wait(1000);
                                    await joinShop();
                                }
                                if ($.errorJoinShop.indexOf('活动太火爆，请稍后再试') > -1) {
                                    console.log('第2次 重新开卡');
                                    await $.wait(1000);
                                    await joinShop();
                                }
                                if ($.errorJoinShop.indexOf('活动太火爆，请稍后再试') > -1) {
                                    console.log('第3次 重新开卡');
                                    await $.wait(1000);
                                    await joinShop();
                                }
                                await joinTeam(3);
                            } else if (_0x19a125.errorMessage.indexOf('队伍已经满员') > -1) {
                                $.maxTeam = true;
                            } else if (_0x19a125.errorMessage.indexOf('奖品与您擦肩而过') > -1 && _0x5a3500 == 0) {
                                await joinTeam(1);
                            } else {
                                console.log('异常7：' + JSON.stringify(_0x19a125));
                                message += '【京东账号' + $.index + '】 ' + _0x19a125.errorMessage + '\n';
                            }
                        }
                    }
                }
            } catch (_0x17ed13) {
                $.logErr(_0x17ed13, _0x5ed55f);
            } finally {
                _0x40dede();
            }
        });
    });
}

function taskPostUrl(_0x127be7, _0x833f85) {
    return {
        'url': '' + activityUrl + _0x127be7,
        'body': _0x833f85,
        'headers': {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-cn',
            'Connection': 'keep-alive',
            'Host': 'cjhydz-isv.isvjcloud.com',
            'Origin': 'https://cjhydz-isv.isvjcloud.com',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': activityUrl + '/wxTeam/activity?activityId=' + activityId,
            'Cookie': cookie + activityCookie + ';IsvToken=' + $.Token + ';AUTH_C_USER=' + $.AUTH_C_USER,
            'User-Agent': $['UA']
        }
    };
}

function taskUrl(_0x3a46bd, _0x4340d1) {
    return {
        'url': 'https://api.m.jd.com/client.action' + _0x3a46bd,
        'body': _0x4340d1,
        'headers': {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-cn',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'api.m.jd.com',
            'Cookie': cookie,
            'User-Agent': $['UA']
        }
    };
}

function TotalBean() {
    return new Promise(async _0x2b46e4 => {
        const _0x23c3f3 = {
            'url': 'https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2',
            'headers': {
                'Accept': 'application/json,text/plain, */*',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-cn',
                'Connection': 'keep-alive',
                'Cookie': cookie,
                'Referer': 'https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2',
                'User-Agent': $['UA']
            }
        };
        $.post(_0x23c3f3, (_0x2fd021, _0x208b08, _0x43216e) => {
            try {
                if (_0x2fd021) {
                    console.log('' + JSON.stringify(_0x2fd021));
                    console.log($.name + ' API请求失败，请检查网路重试');
                } else {
                    if (_0x43216e) {
                        _0x43216e = JSON.parse(_0x43216e);
                        if (_0x43216e.retcode === 13) {
                            $.isLogin = false;
                            return;
                        }
                    } else {
                        console.log('京东服务器返回空数据');
                    }
                }
            } catch (_0x2c7302) {
                $.logErr(_0x2c7302, _0x208b08);
            } finally {
                _0x2b46e4();
            }
        });
    });
}

function safeGet(_0x432eb9) {
    try {
        if (typeof JSON.parse(_0x432eb9) == 'object') {
            return true;
        }
    } catch (_0x237994) {
        console.log(_0x237994);
        console.log('京东服务器访问数据为空，请检查自身设备网络情况');
        return false;
    }
}

function accessLog() {
    return new Promise(async _0x281d3c => {
        const _0x3e9eac = {
            'url': 'https://cjhydz-isv.isvjcloud.com/common/accessLog',
            'headers': {
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-cn',
                'Connection': 'keep-alive',
                'Host': 'cjhydz-isv.isvjcloud.com',
                'Origin': 'https://cjhydz-isv.isvjcloud.com',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': activityUrl + '/wxTeam/activity?activityId' + activityId,
                'Cookie': cookie + activityCookie + ';IsvToken=' + $.Token + ';AUTH_C_USER=' + $.AUTH_C_USER,
                'User-Agent': $['UA']
            },
            'body': 'venderId=691399&code=102&pin=' + encodeURIComponent(encodeURIComponent($.Pin)) + '&activityId=' + activityId + '&pageUrl=https%3A%2F%2Fcjhydz-isv.isvjcloud.com%2FmicroDz%2Finvite%2Factivity%2Fwx%2Fview%2Findex%3FactivityId%3D' + activityId + '&subType=app'
        };
        $.post(_0x3e9eac, (_0x57a83b, _0xa63522, _0x4b7792) => {
            try {
                if (_0x57a83b) {
                    console.log('' + JSON.stringify(_0x57a83b));
                    console.log($.name + ' API请求失败，请检查网路重试');
                } else {
                    // if (_0xa63522.status == 200) {
                    //     refreshToken(_0xa63522);
                    // }
                }
            } catch (_0x2e4215) {
                $.logErr(_0x2e4215, _0xa63522);
            } finally {
                _0x281d3c();
            }
        });
    });
}

function refreshToken(_0x3fb7a6) {
    let _0xd81f8a = _0x3fb7a6 && _0x3fb7a6.headers && (_0x3fb7a6.headers['set-cookie'] || _0x3fb7a6.headers['Set-Cookie'] || '') || '';
    if (_0xd81f8a) {
        activityCookie = _0xd81f8a.map(_0x424207 => {
            return _0x424207.split(';')[0];
        }).join(';');
    }
}

function jsonParse(_0x44256c) {
    if (typeof strv == 'string') {
        try {
            return JSON.parse(_0x44256c);
        } catch (_0x51486d) {
            console.log(_0x51486d);
            $.msg($.name, '', '不要在BoxJS手动复制粘贴修改cookie');
            return [];
        }
    }
}

function GetCookie() {
    if ($request.url.indexOf('/wxTeam/shopInfo') > -1) {
        if ($request.body) {
            let _0x4215d3 = $request.body.match(/activityId=([a-zA-Z0-9._-]+)/);
            if (_0x4215d3) {
                let _0x4f664b = $request.url.split('/');
                console.log('activityId: ' + _0x4215d3[1]);
                console.log('activityUrl: ' + _0x4f664b[0] + '//' + _0x4f664b[2]);
                $.setdata(_0x4215d3[1], 'jd_cjhy_activityId');
                $.setdata(_0x4f664b[0] + '//' + _0x4f664b[2], 'jd_cjhy_activityUrl');
                $.msg($.name, '获取activityId: 成功', 'activityId:' + _0x4215d3[1] + '\nactivityUrl:' + _0x4f664b[0] + '//' + _0x4f664b[2]);
            } else {
                $.msg($.name, '找不到activityId', '');
            }
        }
    }
};

// prettier-ignore
function Env(t, e) {
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);

    class s {
        constructor(t) {
            this.env = t
        }

        send(t, e = "GET") {
            t = "string" == typeof t ? {url: t} : t;
            let s = this.get;
            return "POST" === e && (s = this.post), new Promise((e, i) => {
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
            this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`)
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
            if (i) try {
                s = JSON.parse(this.getdata(t))
            } catch {
            }
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
                this.get({url: t}, (t, s, i) => e(i))
            })
        }

        runScript(t, e) {
            return new Promise(s => {
                let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                i = i ? i.replace(/\n/g, "").trim() : i;
                let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r;
                const [o, h] = i.split("@"), n = {
                    url: `http://${h}/v1/scripting/evaluate`,
                    body: {script_text: t, mock_type: "cron", timeout: r},
                    headers: {"X-Key": o, Accept: "*/*"}
                };
                this.post(n, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }

        loaddata() {
            if (!this.isNode()) return {};
            {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e);
                if (!s && !i) return {};
                {
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
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
            }
        }

        lodash_get(t, e, s) {
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let r = t;
            for (const t of i) if (r = Object(r)[t], void 0 === r) return s;
            return r
        }

        lodash_set(t, e, s) {
            return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
        }

        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : "";
                if (r) try {
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
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i),
                    h = i ? "null" === o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i)
                }
            } else s = this.setval(t, e);
            return s
        }

        getval(t) {
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }

        setval(t, e) {
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }

        initGotEnv(t) {
            this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
        }

        get(t, e = (() => {
        })) {
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1})), $httpClient.get(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {hints: !1})), $task.fetch(t).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
                try {
                    if (t.headers["set-cookie"]) {
                        const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                        s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
                    }
                } catch (t) {
                    this.logErr(t)
                }
            }).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => {
                const {message: s, response: i} = t;
                e(s, i, i && i.body)
            }))
        }

        post(t, e = (() => {
        })) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1})), $httpClient.post(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {hints: !1})), $task.fetch(t).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => e(t)); else if (this.isNode()) {
                this.initGotEnv(t);
                const {url: s, ...i} = t;
                this.got.post(s, i).then(t => {
                    const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                    e(null, {status: s, statusCode: i, headers: r, body: o}, o)
                }, t => {
                    const {message: s, response: i} = t;
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
            for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
            return t
        }

        msg(e = t, s = "", i = "", r) {
            const o = t => {
                if (!t) return t;
                if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? {"open-url": t} : this.isSurge() ? {url: t} : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"];
                        return {openUrl: e, mediaUrl: s}
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl;
                        return {"open-url": e, "media-url": s}
                    }
                    if (this.isSurge()) {
                        let e = t.url || t.openUrl || t["open-url"];
                        return {url: e}
                    }
                }
            };
            if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) {
                let t = ["", "==============📣系统通知📣=============="];
                t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t)
            }
        }

        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
        }

        logErr(t, e) {
            const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
        }

        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }

        done(t = {}) {
            const e = (new Date).getTime(), s = (e - this.startTime) / 1e3;
            this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }(t, e)
}