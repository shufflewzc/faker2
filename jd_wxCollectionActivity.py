#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File: jd_wxBulidActivity.py(加购有礼-监控脚本)
Author: HarbourJ
Date: 2022/9/18 19:52
TG: https://t.me/HarbourToulu
TgChat: https://t.me/HarbourSailing
cron: 1 1 1 1 1 1
new Env('加购有礼-JK')
ActivityEntry: https://lzkj-isv.isvjd.com/wxCollectionActivity/activity2/df1bcc4c1e894444ae7579e124149999?activityId=df1bcc4c1e894444ae7579e124149999
Description: 本地sign算法+redis缓存Token
             变量: export jd_wxCollectionActivityUrl="https://lzkj-isv.isvjd.com/wxCollectionActivity/activity2/xxx?activityId=xxx" 变量值需要传入完整活动地址
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
try:
    from jdCookie import get_cookies
    getCk = get_cookies()
except:
    print("请先下载依赖脚本，\n下载链接: https://raw.githubusercontent.com/HarbourJ/HarbourToulu/main/jdCookie.py")
    sys.exit(3)
redis_url = os.environ.get("redis_url") if os.environ.get("redis_url") else "172.17.0.1"
redis_port = os.environ.get("redis_port") if os.environ.get("redis_port") else "6379"
redis_pwd = os.environ.get("redis_pwd") if os.environ.get("redis_pwd") else ""
activity_url = os.environ.get("jd_wxCollectionActivityUrl") if os.environ.get("jd_wxCollectionActivityUrl") else ""
runNums = os.environ.get("jd_wxCollectionActivityRunNums") if os.environ.get("jd_wxCollectionActivityRunNums") else 10

if not activity_url or "wxCollectionActivity/activity" not in activity_url:
    print("⚠️未发现有效加购有礼活动变量,退出程序!")
    sys.exit()
activityUrl = activity_url.replace('isvjd', 'isvjcloud').split('&')[0]
activityId = activityUrl.split('activityId=')[1]
print(f"【🛳活动入口】{activityUrl}\n")
runNums = int(runNums)
if runNums == 10:
    print('🤖本次加购默认跑前10个账号,设置自定义变量:export jd_wxCollectionActivityRunNums="需要运行加购的ck数量"')
else:
    print(f'🤖本次运行前{runNums}个账号')


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
    url = activityUrl
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
        res = response.text
        if "活动已结束" in res:
            print("⛈活动已结束,下次早点来~")
            sys.exit()
        if "活动未开始" in res:
            print("⛈活动未开始~")
            sys.exit()
        if "关注" in res and "加购" not in res:
            activityType = 5
        else:
            activityType = 6
        return set_cookie, activityType
    else:
        print(response.status_code, "⚠️疑似ip黑了")
        msg += f'{response.status_code} ⚠️疑似ip黑了\n'
        sys.exit()

def getSystemConfigForNew(activityType):
    url = "https://lzkj-isv.isvjcloud.com/wxCommonInfo/getSystemConfigForNew"
    payload = f'activityId={activityId}&activityType={activityType}'
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
    if response.status_code == 200:
        refresh_cookies(response)
        res = response.json()
        if res['result']:
            return res['data']['nickname'], res['data']['secretPin']
        else:
            print(f"⚠️{res['errorMessage']}")
    else:
        print(response.status_code, "⚠️疑似ip黑了")
        msg += f'{response.status_code} ⚠️疑似ip黑了\n'
        sys.exit()

def accessLogWithAD(venderId, pin, activityType):
    url = "https://lzkj-isv.isvjcloud.com/common/accessLogWithAD"
    payload = f"venderId={venderId}&code={activityType}&pin={quote_plus(pin)}&activityId={activityId}&pageUrl={quote_plus(activityUrl)}&subType=app&adSource="
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
    url = "https://lzkj-isv.isvjcloud.com/wxCollectionActivity/activityContent"
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
    # refresh_cookies(response)
    res = response.json()
    if res['result']:
        needCollectionSize = res['data']['needCollectionSize']
        hasCollectionSize = res['data']['hasCollectionSize']
        needFollow = res['data']['needFollow']
        hasFollow = res['data']['hasFollow']
        cpvos = res['data']['cpvos']
        drawInfo = res['data']['drawInfo']
        drawOk = drawInfo['drawOk']
        priceName = drawInfo['name']
        oneKeyAddCart = res['data']['oneKeyAddCart']
        return needCollectionSize, hasCollectionSize, needFollow, hasFollow, cpvos, drawOk, priceName, oneKeyAddCart
    else:
        print(f"⛈{res['errorMessage']}")
        sys.exit()

def shopInfo():
    url = "https://lzkj-isv.isvjcloud.com/wxCollectionActivity/shopInfo"
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
    # refresh_cookies(response)
    res = response.json()
    print(res)
    if res['result']:
        openCard = res['data']['openCard']
        return openCard
    else:
        print(f"⛈{res['errorMessage']}")

def followShop(venderId, pin, activityType):
    url = "https://lzkj-isv.isvjcloud.com/wxActionCommon/followShop"
    payload = f"userId={venderId}&activityId={activityId}&buyerNick={quote_plus(pin)}&activityType={activityType}"
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
        hasFollowShop = res['data']
        return hasFollowShop
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

def addCard(productId, pin):
    """加购"""
    url = "https://lzkj-isv.isvjcloud.com/wxCollectionActivity/addCart"
    payload = f"productId={productId}&activityId={activityId}&pin={quote_plus(pin)}"
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
        hasAddCartSize = res['data']['hasAddCartSize']
        return hasAddCartSize
    else:
        print(f"⛈{res['errorMessage']}")

def collection(productId, pin):
    """关注"""
    url = "https://lzkj-isv.isvjcloud.com/wxCollectionActivity/collection"
    payload = f"productId={productId}&activityId={activityId}&pin={quote_plus(pin)}"
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
        hasCollectionSize = res['data']['hasCollectionSize']
        return hasCollectionSize
    else:
        print(f"⛈{res['errorMessage']}")

def oneKeyAdd(productIds, pin):
    """一键加购"""
    url = "https://lzkj-isv.isvjcloud.com/wxCollectionActivity/oneKeyAddCart"
    payload = f"productIds={productIds}&activityId={activityId}&pin={quote_plus(pin)}"
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
        hasAddCartSize = res['data']['hasAddCartSize']
        return hasAddCartSize
    else:
        print(f"⛈{res['errorMessage']}")

def getPrize(pin):
    url = "https://lzkj-isv.isvjcloud.com/wxCollectionActivity/getPrize"
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
            errorMessage = data['errorMessage']
            print(f"⛈{errorMessage}")
            if "不足" in errorMessage:
                sys.exit()
            return errorMessage
    else:
        print(f"⛈{res['errorMessage']}")
        if '奖品已发完' in res['errorMessage']:
            sys.exit()
        return res['errorMessage']


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
        if num % 5 == 0:
            print("⏰等待3s,休息一下")
            time.sleep(3)
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
        time.sleep(0.3)
        getAct = getActivity()
        activityCookie = getAct[0]
        activityType = getAct[1]
        time.sleep(0.35)
        getSystemConfigForNew(activityType)
        time.sleep(0.35)
        getSimAct = getSimpleActInfoVo()
        venderId = getSimAct['venderId']
        time.sleep(0.35)
        getPin = getMyPing(venderId)
        if getPin is not None:
            nickname = getPin[0]
            secretPin = getPin[1]
            time.sleep(0.35)
            accessLogWithAD(venderId, secretPin, activityType)
            time.sleep(0.35)
            actCont = activityContent(secretPin)
            if not actCont:
                continue
            needCollectionSize = actCont[0]
            hasCollectionSize = actCont[1]
            needFollow = actCont[2]
            hasFollow = actCont[3]
            cpvos = actCont[4]
            drawOk = actCont[5]
            priceName = actCont[6]
            oneKeyAddCart = actCont[7]
            time.sleep(0.35)
            shopName = shopInfo()
            if num == 1:
                print(f"✅开启{shopName}-加购活动,需关注加购{needCollectionSize}个商品")
                print(f"🎁奖品{priceName}\n")
                msg += f'✅开启{shopName}-加购活动\n📝活动地址{activityUrl}\n🎁奖品{priceName}\n\n'
            if needCollectionSize <= hasCollectionSize:
                print("☃️已完成过加购任务,无法重复进行！")
                continue
            else:
                skuIds = [covo['skuId'] for covo in cpvos if not covo['collection']]
            time.sleep(0.2)
            getInfo()
            if needFollow:
                if not hasFollow:
                    FS = followShop(venderId, secretPin, activityType)
                    if FS == 99:
                        continue
            time.sleep(0.35)
            addSkuNums = needCollectionSize - hasCollectionSize
            if oneKeyAddCart == 1:
                hasAddCartSize = oneKeyAdd(skuIds, secretPin)
                if hasAddCartSize:
                    if hasAddCartSize == addSkuNums:
                        print(f"🛳成功一键加购{hasAddCartSize}个商品")
                else:
                    continue
            else:
                for productId in skuIds:
                    if activityType == 6:
                        hasAddCartSize = addCard(productId, secretPin)
                    elif activityType == 5:
                        hasAddCartSize = collection(productId, secretPin)
                    time.sleep(0.25)
                    if hasAddCartSize:
                        if hasAddCartSize == addSkuNums:
                            print(f"🛳成功加购{hasAddCartSize}个商品")
                            break
            time.sleep(0.35)
            for i in range(3):
                priceName = getPrize(secretPin)
                if "擦肩" in priceName:
                    time.sleep(0.2)
                    continue
                else:
                    break
            if "京豆" in priceName:
                print(f"🎉获得{priceName}")
                msg += f'【账号{num}】{pt_pin} 🎉{priceName}\n'
            elif "擦肩" in priceName:
                print(f"😭获得💨💨💨")
            else:
                pass

        time.sleep(1.5)

    title = "🗣消息提醒：加购有礼-JK"
    msg = f"⏰{str(datetime.now())[:19]}\n" + msg
    send(title, msg)
