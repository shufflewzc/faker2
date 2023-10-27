#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File: jd_wxShopFollowActivity.py(关注店铺有礼-JK)
Author: HarbourJ
Date: 2022/8/8 19:52
TG: https://t.me/HarbourToulu
cron: 1 1 1 1 1 *
new Env('关注店铺有礼-JK');
ActivityEntry: https://lzkj-isv.isvjcloud.com/wxShopFollowActivity/activity?activityId=3d6dbfd9c8584be882f69cfad665ce8d
               变量 export jd_wxShopFollowId="活动🆔"
                   export jd_wxShopFollowRunNums="变量为需要运行账号数量" # 默认前12个账号
"""

import time, requests, sys, re, os, json, random
from datetime import datetime
from sendNotify import *
from urllib.parse import quote_plus, unquote_plus
from functools import partial
print = partial(print, flush=True)
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
try:
    from jd_sign import *
except ImportError as e:
    print(e)
    if "No module" in str(e):
        print("请先运行Faker库依赖一键安装脚本(jd_check_dependent.py)，安装jd_sign.so依赖")
    sys.exit()
try:
    from jdCookie import get_cookies
    getCk = get_cookies()
except:
    print("请先下载依赖脚本，\n下载链接: https://raw.githubusercontent.com/HarbourJ/HarbourToulu/main/jdCookie.py")
    sys.exit(3)

redis_url = os.environ.get("redis_url") if os.environ.get("redis_url") else "172.17.0.1"
redis_port = os.environ.get("redis_port") if os.environ.get("redis_port") else "6379"
redis_pwd = os.environ.get("redis_pwd") if os.environ.get("redis_pwd") else ""
activityId = os.environ.get("jd_wxShopFollowId") if os.environ.get("jd_wxShopFollowId") else ""
runNums = os.environ.get("jd_wxShopFollowRunNums") if os.environ.get("jd_wxShopFollowRunNums") else 12

if not activityId:
    print("⚠️未发现有效活动变量,退出程序!")
    sys.exit()

runNums = int(runNums)
if runNums == 12:
    print('🤖本次关注默认跑前12个账号,设置自定义变量:export jd_wxShopFollowRunNums="需要运行的ck数量"')
else:
    print(f'🤖本次运行前{runNums}个账号')

activityUrl = f"https://lzkj-isv.isvjd.com/wxShopFollowActivity/activity?activityId={activityId}"

def redis_conn():
    try:
        import redis
        try:
            pool = redis.ConnectionPool(host=redis_url, port=6379, decode_responses=True, socket_connect_timeout=5, password=redis_pwd)
            r = redis.Redis(connection_pool=pool)
            r.get('conn_test')
            print('✅redis连接成功')
            return r
        except:
            print("⚠️redis连接异常")
    except:
        print("⚠️缺少redis依赖，请运行pip3 install redis")
        sys.exit()

def getToken(ck, r=None):
    host = f'{activityUrl.split("com/")[0]}com'
    try:
        pt_pin = unquote_plus(re.compile(r'pt_pin=(.*?);').findall(ck)[0])
    except:
        pt_pin = ck[:15]
    try:
        try:
            Token = r.get(f'{activityUrl.split("https://")[1].split("-")[0]}_{pt_pin}')
        except Exception as e:
            # print(f"redis get error: {str(e)}")
            Token = None
        if Token is not None:
            print(f"♻️获取缓存Token")
            return Token
        else:
            s.headers = {
                'Connection': 'keep-alive',
                'Accept-Encoding': 'gzip, deflate, br',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'User-Agent': '',
                'Cookie': ck,
                'Host': 'api.m.jd.com',
                'Referer': '',
                'Accept-Language': 'zh-Hans-CN;q=1 en-CN;q=0.9',
                'Accept': '*/*'
            }
            sign({"url": f"{host}", "id": ""}, 'isvObfuscator')
            f = s.post('https://api.m.jd.com/client.action', verify=False, timeout=30)
            if f.status_code != 200:
                print(f.status_code)
                return
            else:
                if "参数异常" in f.text:
                    print(f.text)
                    return
            Token_new = f.json()['token']
            try:
                if r.set(f'{activityUrl.split("https://")[1].split("-")[0]}_{pt_pin}', Token_new, ex=1800):
                    print("✅Token缓存成功")
                else:
                    print("❌Token缓存失败")
            except Exception as e:
                # print(f"redis set error: {str(e)}")
                print(f"✅获取实时Token")
            return Token_new
    except Exception as e:
        print(f"Token error: {str(e)}")
        return

def getJdTime():
    jdTime = int(round(time.time() * 1000))
    return jdTime

def randomString(e, flag=False):
    t = "0123456789abcdef"
    if flag: t = t.upper()
    n = [random.choice(t) for _ in range(e)]
    return ''.join(n)

def refresh_cookies(res):
    if res.cookies:
        cookies = res.cookies.get_dict()
        set_cookie = [(set_cookie + "=" + cookies[set_cookie]) for set_cookie in cookies]
        global activityCookie
        activityCookieMid = [i for i in activityCookie.split(';') if i != '']
        for i in activityCookieMid:
            for x in set_cookie:
                if i.split('=')[0] == x.split('=')[0]:
                    if i.split('=')[1] != x.split('=')[1]:
                        activityCookieMid.remove(i)
        activityCookie = ''.join(sorted([(set_cookie + ";") for set_cookie in list(set(activityCookieMid + set_cookie))]))

def getActivity():
    url = f"https://lzkj-isv.isvjcloud.com/wxShopFollowActivity/activity?activityId={activityId}"
    headers = {
        'Host': 'lzkj-isv.isvjcloud.com',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': ua,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
    }
    response = requests.request("GET", url, headers=headers)
    if response.status_code == 200:
        if response.cookies:
            cookies = response.cookies.get_dict()
            set_cookies = [(set_cookie + "=" + cookies[set_cookie]) for set_cookie in cookies]
            set_cookie = ''.join(sorted([(set_cookie + ";") for set_cookie in set_cookies]))
        return set_cookie
    else:
        print(response.status_code)
        print("⚠️疑似ip黑了")
        sys.exit()

def getSystemConfigForNew():
    url = "https://lzkj-isv.isvjcloud.com/wxCommonInfo/getSystemConfigForNew"
    payload = f'activityId={activityId}&activityType=17'
    headers = {
        'Host': 'lzkj-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzkj-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)

def getSimpleActInfoVo():
    url = "https://lzkj-isv.isvjcloud.com/customer/getSimpleActInfoVo"
    payload = f"activityId={activityId}"
    headers = {
        'Host': 'lzkj-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzkj-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)
    res = response.json()
    if res['result']:
        return res['data']

def getMyPing(venderId):
    url = "https://lzkj-isv.isvjcloud.com/customer/getMyPing"
    payload = f"userId={venderId}&token={token}&fromType=APP"
    headers = {
        'Host': 'lzkj-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzkj-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)
    res = response.json()
    if res['result']:
        return res['data']['nickname'], res['data']['secretPin']
    else:
        print(f"⚠️{res['errorMessage']}")

def accessLogWithAD(venderId, pin):
    url = "https://lzkj-isv.isvjcloud.com/common/accessLogWithAD"
    payload = f"venderId={venderId}&code=17&pin={quote_plus(pin)}&activityId={activityId}&pageUrl={quote_plus(activityUrl)}&subType=app&adSource="
    headers = {
        'Host': 'lzkj-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzkj-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)

def activityContentOnly(pin):
    url = "https://lzkj-isv.isvjcloud.com/wxShopFollowActivity/activityContentOnly"
    payload = f"activityId={activityId}&pin={quote_plus(pin)}"
    headers = {
        'Host': 'lzkj-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzkj-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': f'IsvToken={token};{activityCookie}'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)
    res = response.json()
    if res['result']:
        canJoin = res['data']['canJoin']
        drawContentVOs = res['data']['drawContentVOs']
        # if not canJoin:
        #     print("⛈活动已结束,下次早点来~")
        #     sys.exit()
        name = drawContentVOs[0]['name']
        hasSendPrizeNum = drawContentVOs[0]['hasSendPrizeNum']
        prizeNum = drawContentVOs[0]['prizeNum']
        canDrawTimes = res['data']['canDrawTimes']
        needFollow = res['data']['needFollow']
        hasFollow = res['data']['hasFollow']
        return name, hasSendPrizeNum, prizeNum, canDrawTimes, needFollow, hasFollow
    else:
        print(f"⛈{res['errorMessage']}")
        sys.exit()

def shopInfo():
    url = "https://lzkj-isv.isvjcloud.com/wxShopFollowActivity/shopInfo"
    payload = f"activityId={activityId}"
    headers = {
        'Host': 'lzkj-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzkj-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)
    res = response.json()
    if res['result']:
        shopName = res['data']['shopName']
        return shopName
    else:
        print(f"⛈{res['errorMessage']}")

def getActMemberInfo(venderId, pin):
    url = "https://lzkj-isv.isvjcloud.com/wxCommonInfo/getActMemberInfo"
    payload = f"venderId={venderId}&activityId={activityId}&pin={quote_plus(pin)}"
    headers = {
        'Host': 'lzkj-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzkj-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)
    res = response.json()
    print(res)
    if res['result']:
        openCard = res['data']['openCard']
        return openCard
    else:
        print(f"⛈{res['errorMessage']}")

def followShop(pin):
    url = "https://lzkj-isv.isvjcloud.com/wxShopFollowActivity/follow"
    payload = f"activityId={activityId}&pin={quote_plus(pin)}"
    headers = {
        'Host': 'lzkj-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzkj-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)
    res = response.json()
    if res['result']:
        pass
    else:
        print(f"⛈{res['errorMessage']}")
        if "店铺会员" in res['errorMessage']:
            return 99

def getInfo():
    url = f"https://lzkj-isv.isvjcloud.com/miniProgramShareInfo/getInfo?activityId={activityId}"
    headers = {
        'Host': 'lzkj-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("GET", url, headers=headers)
    refresh_cookies(response)

def getPrize(pin):
    url = "https://lzkj-isv.isvjcloud.com/wxShopFollowActivity/getPrize"
    payload = f"activityId={activityId}&pin={quote_plus(pin)}"
    headers = {
        'Host': 'lzkj-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzkj-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': f'IsvToken={token};{activityCookie}'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    res = response.json()
    if res['result']:
        data = res['data']
        if data['drawOk']:
            priceName = data['name']
            return priceName
        else:
            if data['canDrawTimes'] > 0:
                return 9
            else:
                return 99
    else:
        print(f"⛈{res['errorMessage']}")
        if '奖品已发完' in res['errorMessage']:
            sys.exit()
        return res['errorMessage']

def bindWithVender(cookie, venderId):
    try:
        s.headers = {
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': ua,
            'Cookie': cookie,
            'Host': 'api.m.jd.com',
            'Referer': 'https://shopmember.m.jd.com/',
            'Accept-Language': 'zh-Hans-CN;q=1 en-CN;q=0.9',
            'Accept': '*/*'
        }
        s.params = {
            'appid': 'jd_shop_member',
            'functionId': 'bindWithVender',
            'body': json.dumps({
                'venderId': venderId,
                'shopId': venderId,
                'bindByVerifyCodeFlag': 1
            }, separators=(',', ':'))
        }
        res = s.post('https://api.m.jd.com/', verify=False, timeout=30).json()
        if res['success']:
            return res['message'], res['result']['giftInfo']
    except Exception as e:
        print(e)


if __name__ == '__main__':
    global msg
    msg = ''
    r = redis_conn()
    try:
        cks = getCk
        if not cks:
            sys.exit()
    except:
        print("未获取到有效COOKIE,退出程序！")
        sys.exit()
    num = 0
    for cookie in cks[:runNums]:
        num += 1
        if num % 6 == 0:
            print("⏰等待5s,休息一下")
            time.sleep(5)
        global ua, activityCookie, token
        ua = userAgent()
        try:
            pt_pin = re.compile(r'pt_pin=(.*?);').findall(cookie)[0]
            pt_pin = unquote_plus(pt_pin)
        except IndexError:
            pt_pin = f'用户{num}'
        print(f'\n******开始【京东账号{num}】{pt_pin} *********\n')
        print(datetime.now())

        token = getToken(cookie, r)
        if token is None:
            print(f"⚠️获取Token失败！⏰等待2s")
            time.sleep(2)
            continue
        time.sleep(0.2)
        activityCookie = getActivity()
        time.sleep(0.2)
        getSystemConfigForNew()
        time.sleep(0.2)
        getSimAct = getSimpleActInfoVo()
        venderId = getSimAct['venderId']
        time.sleep(0.2)
        getPin = getMyPing(venderId)
        if getPin is not None:
            nickname = getPin[0]
            secretPin = getPin[1]
            time.sleep(0.3)
            accessLogWithAD(venderId, secretPin)
            time.sleep(0.3)
            actContent = activityContentOnly(secretPin)
            # name, hasSendPrizeNum, prizeNum, canDrawTimes, needFollow, hasFollow
            if not actContent:
                continue
            priceName = actContent[0]
            hasSendPrizeNum = actContent[1]
            prizeNum = actContent[2]
            canDrawTimes = actContent[3]
            needFollow = actContent[4]
            hasFollow = actContent[5]
            time.sleep(0.15)
            shopName = shopInfo()
            if num == 1:
                print(f"✅开启{shopName}-关注店铺有礼活动")
                print(f"🎁奖品{priceName}\n")
                msg += f'✅开启{shopName}-关注店铺有礼活动\n📝活动地址{activityUrl}\n🎁奖品{priceName}\n\n'
            print(f"🎁共{prizeNum}份, 剩余{prizeNum-hasSendPrizeNum}份")
            if hasSendPrizeNum == prizeNum:
                print("⛈礼品已领完")
                sys.exit()
            if canDrawTimes == 0:
                print("🤖已参加过本活动")
                time.sleep(1.5)
                continue
            time.sleep(0.2)
            getInfo()
            if needFollow:
                if not hasFollow:
                    FS = followShop(secretPin)
                    if FS == 99:
                        time.sleep(0.2)
                        open_result = bindWithVender(cookie, venderId)
                        if open_result is not None:
                            if "火爆" in open_result[0] or "失败" in open_result[0] or "解绑" in open_result[0]:
                                print(f"⛈{open_result[0]}")
                                time.sleep(1.5)
                                continue
                            if "加入店铺会员成功" in open_result[0]:
                                print(f"\t💳{shopName} {open_result[0]}")
                                if open_result[1]:
                                    print(f"\t🎁获得{','.join([gift['discountString'] + gift['prizeName'] for gift in open_result[1]['giftList']])}")
                            time.sleep(0.2)
                            followShop(secretPin)
            time.sleep(0.15)
            for i in range(3):
                priceName = getPrize(secretPin)
                if priceName == 9:
                    time.sleep(0.2)
                    continue
                else:
                    break
            if "火爆" in str(priceName) or priceName == 99 or priceName is None:
                print(f"😭获得💨💨💨")
            else:
                print(f"🎉获得{priceName}")
                msg += f'【账号{num}】{pt_pin} 🎉{priceName}\n'

        time.sleep(1.5)

    title = "🗣消息提醒：关注店铺有礼-JK"
    msg = f"⏰{str(datetime.now())[:19]}\n" + msg
    send(title, msg)