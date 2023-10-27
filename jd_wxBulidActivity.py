#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File: jd_wxBulidActivity.py(盖楼有礼-监控脚本)
Author: HarbourJ
Date: 2022/9/18 19:52
TG: https://t.me/HarbourToulu
TgChat: https://t.me/HarbourSailing
cron: 1 1 1 1 1 1
new Env('盖楼有礼-JK');
ActivityEntry: https://lzkj-isv.isvjcloud.com/wxBuildActivity/activity?activityId=4bde809b95ec45a3b50f7086d77f3178
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
try:
    from jdCookie import get_cookies
    getCk = get_cookies()
except:
    print("请先下载依赖脚本，\n下载链接: https://raw.githubusercontent.com/HarbourJ/HarbourToulu/main/jdCookie.py")
    sys.exit(3)
redis_url = os.environ.get("redis_url") if os.environ.get("redis_url") else "172.17.0.1"
redis_port = os.environ.get("redis_port") if os.environ.get("redis_port") else "6379"
redis_pwd = os.environ.get("redis_pwd") if os.environ.get("redis_pwd") else ""
activityId = os.environ.get("jd_wxBulidActivityId") if os.environ.get("jd_wxBulidActivityId") else ""

if not activityId:
    print("⚠️未发现有效盖楼有礼活动变量,退出程序!")
    sys.exit()
activityUrl = f"https://lzkj-isv.isvjcloud.com/wxBuildActivity/activity?activityId={activityId}"

def redis_conn():
    try:
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
    url = f"https://lzkj-isv.isvjcloud.com/wxBuildActivity/activity?activityId={activityId}"
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
        print(response.status_code, "⚠️疑似ip黑了")
        sys.exit()

def getSystemConfigForNew():
    url = "https://lzkj-isv.isvjcloud.com/wxCommonInfo/getSystemConfigForNew"
    payload = f'activityId={activityId}&activityType=65'
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
    payload = f"venderId={venderId}&code=65&pin={quote_plus(pin)}&activityId={activityId}&pageUrl={quote_plus(activityUrl)}&subType=app&adSource="
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

def activityContent(pin):
    url = "https://lzkj-isv.isvjcloud.com/wxBuildActivity/activityContent"
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
        currentFloors = res['data']['currentFloors']
        totalJoinMans = res['data']['totalJoinMans']
        drawOkMans = res['data']['drawOkMans']
        drawInfos = res['data']['drawInfos']
        priceInfo = ' '.join([drawInfo['priceInfo'] for drawInfo in drawInfos])
        pricename = ' '.join([drawInfo['name'] for drawInfo in drawInfos])
        return currentFloors, totalJoinMans, drawOkMans, priceInfo, pricename
    else:
        print(f"⛈{res['errorMessage']}")
        sys.exit()

def getShopInfoVO(venderId):
    url = "https://lzkj-isv.isvjcloud.com/wxActionCommon/getShopInfoVO"
    payload = f"userId={venderId}"
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
    if res['result']:
        openCard = res['data']['openCard']
        return openCard
    else:
        print(f"⛈{res['errorMessage']}")

def miniProgramShareInfo():
    url = f"https://lzkj-isv.isvjcloud.com/miniProgramShareInfo/getInfo?activityId={activityUrl}"
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

def getPublishs(pin):
    url = "https://lzkj-isv.isvjcloud.com/wxBuildActivity/getPublishs"
    payload = f"activityId={activityId}&pin={quote_plus(pin)}&pageNo=1&pageSize=10"
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

def currentFloor(pin):
    url = "https://lzkj-isv.isvjcloud.com/wxBuildActivity/currentFloor"
    payload = f"activityId={activityId}&pin={quote_plus(pin)}&pageNo=1&pageSize=10"
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
        currentFloors = res['data']['currentFloors']
        return currentFloors
    else:
        print(f"⛈{res['errorMessage']}")

def publish(pin):
    url = "https://lzkj-isv.isvjcloud.com/wxBuildActivity/publish"
    payload = f"activityId={activityId}&pin={quote_plus(pin)}&content={quote_plus('必中冲冲冲')}"
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
        currentFloors = res['data']['currentFloors']
        drawInfo = res['data']['drawResult']['drawInfo']
        if drawInfo:
            print(f"🏗当前楼层{currentFloors} 🎉{drawInfo['name']}")
            return drawInfo['name']
        else:
            print(f"🏗当前楼层{currentFloors} 💨💨💨")
            return 2
    else:
        print(f"⛈{res['errorMessage']}")
        return 3


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
        time.sleep(0.5)
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
            time.sleep(0.2)
            actCont = activityContent(secretPin)
            # currentFloors, totalJoinMans, drawOkMans, priceInfo, pricename
            if not actCont:
                continue
            currentFloors = actCont[0]
            totalJoinMans = actCont[1]
            drawOkMans = actCont[2]
            priceInfo = actCont[3]
            pricename = actCont[4]
            time.sleep(0.3)
            shopName = getShopInfoVO(venderId)
            if num == 1:
                print(f"✅开启{shopName}-盖楼有礼活动")
                print(f"🎁奖品{pricename}")
            time.sleep(0.2)
            getActMemberInfo(venderId, secretPin)
            time.sleep(0.2)
            miniProgramShareInfo()
            time.sleep(0.2)
            getPublishs(secretPin)
            time.sleep(0.2)
            currentFloor(secretPin)
            time.sleep(0.2)
            reward = publish(secretPin)
            if reward:
                if reward == 3:
                    continue
                elif reward == 2:
                    pass
                else:
                    reward
            time.sleep(1)
            getPublishs(secretPin)
            time.sleep(0.2)
            currentFloor(secretPin)
            time.sleep(0.2)
            reward = publish(secretPin)
            if reward:
                if reward == 3:
                    continue
                elif reward == 2:
                    pass
                else:
                    reward

        time.sleep(5)
