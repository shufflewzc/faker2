#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File: jd_wxBirthGifts.py(生日等级礼包-监控脚本)
Author: HarbourJ
Date: 2022/8/8 19:52
TG: https://t.me/HarbourToulu
TgChat: https://t.me/HarbourChat
cron: 1 1 1 1 1 1
new Env('生日等级礼包-JK');
ActivityEntry: https://cjhy-isv.isvjcloud.com/mc/wxMcLevelAndBirthGifts/activity?activityId=f3325e3375a14866xxxxxxxxxxxx
               变量 export jd_wxBirthGiftsId="活动🆔"
Update: 20221205 新增等级礼包模块
"""

import time, requests, sys, re, os, json, random
from datetime import datetime
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
activityId = os.environ.get("jd_wxBirthGiftsId") if os.environ.get("jd_wxBirthGiftsId") else ""

if not activityId:
    print("⚠️未发现有效活动变量,退出程序!")
    sys.exit()
activityUrl = f"https://cjhy-isv.isvjcloud.com/mc/wxMcLevelAndBirthGifts/activity?activityId={activityId}"
print(f"【🛳活动入口】{activityUrl}")

def redis_conn():
    try:
        try:
            import redis
        except Exception as e:
            print(e)
            if "No module" in str(e):
                os.system("pip install redis")
            import redis
        try:
            pool = redis.ConnectionPool(host=redis_url, port=redis_port, decode_responses=True, socket_connect_timeout=5, password=redis_pwd)
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
        # redis缓存Token 活动域名+pt_pin
        pt_pin = unquote_plus(re.compile(r'pt_pin=(.*?);').findall(ck)[0])
    except:
        # redis缓存Token 活动域名+ck前7位(获取pin失败)
        pt_pin = ck[:15]
    try:
        if r is not None:
            Token = r.get(f'{activityUrl.split("https://")[1].split("-")[0]}_{pt_pin}')
            # print("Token过期时间", r.ttl(f'{activityUrl.split("https://")[1].split("-")[0]}_{pt_pin}'))
            if Token is not None:
                print(f"♻️获取缓存Token")
                return Token
            else:
                # print("🈳去设置Token缓存")
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
                sign_txt = sign({"url": f"{host}", "id": ""}, 'isvObfuscator')
                # print(sign_txt)
                f = s.post('https://api.m.jd.com/client.action', verify=False, timeout=30)
                if f.status_code != 200:
                    print(f.status_code)
                    return
                else:
                    if "参数异常" in f.text:
                        return
                Token_new = f.json()['token']
                # print(f"Token->: {Token_new}")
                if r.set(f'{activityUrl.split("https://")[1].split("-")[0]}_{pt_pin}', Token_new, ex=1800):
                    print("✅Token缓存成功")
                else:
                    print("❌Token缓存失败")
                return Token_new
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
            sign_txt = sign({"url": f"{host}", "id": ""}, 'isvObfuscator')
            # print(sign_txt)
            f = s.post('https://api.m.jd.com/client.action', verify=False, timeout=30)
            if f.status_code != 200:
                print(f.status_code)
                return
            else:
                if "参数异常" in f.text:
                    return
            Token = f.json()['token']
            print(f"✅获取实时Token")
            return Token
    except:
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
    url = activityUrl
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
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

def getOpenStatus():
    url = "https://cjhy-isv.isvjcloud.com/assembleConfig/getOpenStatus"
    payload = f'activityId={activityId}'
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)

def getSystemConfig():
    url = "https://cjhy-isv.isvjcloud.com/wxCommonInfo/getSystemConfig"
    payload = f'activityId={activityId}&activityType='
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)

def getSimpleActInfoVo():
    url = "https://cjhy-isv.isvjcloud.com/customer/getSimpleActInfoVo"
    payload = f"activityId={activityId}"
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
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
    else:
        print(res['errorMessage'])

def getMyPing(venderId):
    url = "https://cjhy-isv.isvjcloud.com/customer/getMyPing"
    payload = f"userId={venderId}&token={token}&fromType=APP&riskType=1"
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
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

def getMemberLevel(venderId, pin):
    url = "https://cjhy-isv.isvjcloud.com/mc/wxMcLevelAndBirthGifts/getMemberLevel"
    payload = f"venderId={venderId}&pin={quote_plus(pin)}"
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
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
    else:
        print(res['errorMessage'])

def getOpenCardInfo(venderId, pin, activityType):
    url = "https://cjhy-isv.isvjcloud.com/mc/new/brandCard/common/shopAndBrand/getOpenCardInfo"
    payload = f"venderId={venderId}&buyerPin={quote_plus(pin)}&activityType={activityType}"
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    res = response.json()
    if res['result']:
        return res['data']
    else:
        print(res['errorMessage'])

def accessLog(venderId, pin, activityType):
    url = "https://cjhy-isv.isvjcloud.com/common/accessLog"
    payload = f"venderId={venderId}&code={activityType}&pin={quote_plus(pin)}&activityId={activityId}&pageUrl={quote_plus(activityUrl)}&subType="
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    requests.request("POST", url, headers=headers, data=payload)

def activityContent(pin, level):
    url = "https://cjhy-isv.isvjcloud.com/mc/wxMcLevelAndBirthGifts/activityContent"
    payload = f"activityId={activityId}&pin={quote_plus(pin)}&level={level}"
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': f'IsvToken={token};{activityCookie}'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)
    res = response.json()
    if res['result']:
        endTime = res['data']['endTime']
        if getJdTime() > endTime:
            print("⛈活动已结束,下次早点来~")
            sys.exit()
        return res['data']
    else:
        print(f"⛈{res['errorMessage']}")

def getInfo():
    url = f"https://cjhy-isv.isvjcloud.com/miniProgramShareInfo/getInfo?activityId={activityId}"
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("GET", url, headers=headers)
    refresh_cookies(response)

def getBirthInfo(venderId, pin):
    url = "https://cjhy-isv.isvjcloud.com/mc/wxMcLevelAndBirthGifts/getBirthInfo"
    payload = f"venderId={venderId}&pin={quote_plus(pin)}"
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': f'IsvToken={token};{activityCookie}'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)

def saveBirthDay(venderId, pin):
    url = "https://cjhy-isv.isvjcloud.com/mc/wxMcLevelAndBirthGifts/saveBirthDay"
    payload = f"venderId={venderId}&pin={quote_plus(pin)}&birthDay={str(datetime.now())[:10]}"
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': f'IsvToken={token};{activityCookie}'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)

def sendBirthGifts(venderId, pin, level):
    url = "https://cjhy-isv.isvjcloud.com/mc/wxMcLevelAndBirthGifts/sendBirthGifts"
    payload = f"venderId={venderId}&pin={quote_plus(pin)}&activityId={activityId}&level={level}"
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': f'IsvToken={token};{activityCookie}'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)
    res = response.json()
    if res['result']:
        return res['data']
    else:
        print(f"⛈{res['errorMessage']}")

def sendLevelGifts(venderId, pin, level):
    url = "https://cjhy-isv.isvjcloud.com/mc/wxMcLevelAndBirthGifts/sendLevelGifts"
    payload = f"venderId={venderId}&pin={quote_plus(pin)}&activityId={activityId}&level={level}"
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': f'IsvToken={token};{activityCookie}'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)
    res = response.json()
    if res['result']:
        return res['data']
    else:
        print(f"⛈{res['errorMessage']}")


if __name__ == '__main__':
    r = redis_conn()
    try:
        cks = getCk
        if not cks:
            sys.exit()
    except:
        print("未获取到有效COOKIE,退出程序！")
        sys.exit()
    num = 0
    for cookie in cks[:]:
        num += 1
        if num % 9 == 0:
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
        time.sleep(0.3)
        getOpenStatus()
        time.sleep(0.2)
        getSimAct = getSimpleActInfoVo()
        venderId = getSimAct['venderId']
        activityType = getSimAct['activityType']
        time.sleep(0.3)
        getPin = getMyPing(venderId)
        if getPin:
            nickname = getPin[0]
            secretPin = getPin[1]
            time.sleep(0.3)
            getOC = getOpenCardInfo(venderId, secretPin, activityType)
            time.sleep(0.2)
            if getOC['openedCard']:
                memberLev = getMemberLevel(venderId, secretPin)
                if memberLev:
                    level = memberLev['level']
                    shopTitle = memberLev['shopTitle']
                    print(f"✅开启{shopTitle} 生日等级礼包")
                    time.sleep(0.2)
                    accessLog(venderId, secretPin, activityType)
                    time.sleep(0.2)
                    actContent = activityContent(secretPin, level)
                    if actContent:
                        if actContent['isReceived'] == 1:
                            print(f"💨{nickname} 今年已经领过了,明年再来吧~")
                            continue
                        else:
                            time.sleep(0.2)
                            getInfo()
                            time.sleep(0.2)
                            try:
                                if activityType == 104:
                                    sendGift = sendLevelGifts(venderId, secretPin, level)
                                    levelResult = sendGift['levelResult']
                                    if levelResult:
                                        levelData = sendGift['levelData']
                                        gifts = [(f"{x['beanNum']}{x['name']}") for x in levelData]
                                        print(f"🎉🎉🎉{nickname} 成功领取 {','.join(gifts)}")
                                    else:
                                        print(f"💨{nickname} 生日等级礼包领取失败,请重试~")
                                else:
                                    getBirthInfo(venderId, secretPin)
                                    time.sleep(0.2)
                                    saveBirthDay(venderId, secretPin)
                                    time.sleep(0.2)
                                    sendGift = sendBirthGifts(venderId, secretPin, level)
                                    birthdayResult = sendGift['birthdayResult']
                                    if birthdayResult:
                                        birthdayData = sendGift['birthdayData']
                                        gifts = [(f"{x['beanNum']}{x['name']}") for x in birthdayData]
                                        print(f"🎉🎉🎉{nickname} 成功领取 {','.join(gifts)}")
                                    else:
                                        print(f"💨{nickname} 生日等级礼包领取失败,请重试~")
                            except:
                                print(f"💨{nickname} 生日等级礼包领取失败,请重试~")
            else:
                print(f"⛈{nickname} 非店铺会员无法领取生日等级礼包！")
                continue
        time.sleep(1.5)