#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File: jd_jinggengInvite.py(jinggeng邀请入会有礼)
Author: HarbourJ
Date: 2022/8/1 22:37
TG: https://t.me/HarbourToulu
cron: 1 1 1 1 1 1
new Env('jinggeng邀请入会有礼');
活动入口: https://jinggeng-isv.isvjcloud.com/ql/front/showInviteJoin?id=9e80809282a4bdc90182ab254c7e0a12&user_id=1000121005
变量设置: export redis_url="xxx", export redis_port="xxx"(没有可省略), export redis_pwd="xxx"(没有可省略)
        export jinggengInviteJoin="9e80809282a4bdc90182ab254c7e0a12&1000121005"(活动id&店铺id)
Update: 2022/11/01 更新入会算法，内置船新入会本地算法
"""

import time, requests, sys, re, os, json, random
from bs4 import BeautifulSoup
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
jinggengInviteJoin = os.environ.get("jinggengInviteJoin") if os.environ.get("jinggengInviteJoin") else ""

inviterNicks = [
    "Ny0m1K1tVHIJvt0j4SQ9RbRPXMHHf%2BDrNmMVfT8S5hq3SjYMAACrbEHZQ40J5yPY",
    "pWGUWZJQ3actex0X2vQyLsjNhNaYFy2HteErE6izlhTf9nrGY7gBkCdGU4C6z%2FxD",
    "3TQTImsIN0s9T85f1wS70V4tLNYA4seuA67MOIYQxEk3Vl9%2BAVo4NF%2BtgyeIc6A6kdK3rLBQpEQH9V4tdrrh0w%3D%3D"
]
if "&" not in jinggengInviteJoin:
    print("⚠️jinggengInviteJoin变量有误！退出程序！")
    sys.exit()
ac_id = jinggengInviteJoin.split("&")[0]
user_id = jinggengInviteJoin.split("&")[1]
inviterNick = random.choice(inviterNicks)
activity_url = f"https://jinggeng-isv.isvjcloud.com/ql/front/showInviteJoin?id={ac_id}&user_id={user_id}&inviterNick={inviterNick}"
print(f"【🛳活动入口】https://jinggeng-isv.isvjcloud.com/ql/front/showInviteJoin?id={ac_id}&user_id={user_id}")

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

def getToken(ck, r=None):
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
                sign_txt = sign({"url": f"{activityUrl}", "id": ""}, 'isvObfuscator')
                # print(sign_txt)
                f = s.post('https://api.m.jd.com/client.action', verify=False, timeout=30)
                if f.status_code != 200:
                    print(f.status_code)
                    return
                else:
                    if "参数异常" in f.text:
                        return
                Token_new = f.json()['token']
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
            sign_txt = sign({"url": f"{activityUrl}", "id": ""}, 'isvObfuscator')
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
    url = "http://api.m.jd.com/client.action?functionId=queryMaterialProducts&client=wh5"
    headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Host': 'api.m.jd.com',
        'Proxy-Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
    }
    try:
        response = requests.request("GET", url, headers=headers, timeout=2)
        if response.status_code == 200:
            res = response.json()
            jdTime = res['currentTime2']
    except:
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

def getActivity(index=1, isOpenCard=0, inviterCode=None, getIndex=0):
    url = f"{activityUrl}&isOpenCard={isOpenCard}&from=kouling"
    if len(token) == 0:
        IsvToken = ''
    else:
        IsvToken = f"IsvToken={token};"
    headers = {
      'Host': 'jinggeng-isv.isvjcloud.com',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'User-Agent': ua,
      'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
      'Referer': url,
      'Cookie': IsvToken + activityCookie
    }
    response = requests.request("GET", url, headers=headers)
    html_text = response.text
    if response.status_code == 493:
        print(response.status_code, "⚠️ip疑似黑了,休息一会再来撸~")
        sys.exit()
    # if response.cookies:
    cookies = response.cookies.get_dict()
    set_cookies = [(set_cookie + "=" + cookies[set_cookie]) for set_cookie in cookies]
    set_cookie = ''.join(sorted([(set_cookie + ";") for set_cookie in set_cookies]))
    if getIndex == 3:
        return set_cookie
    if "活动时间" in html_text:
        refresh_cookies(response)
        soup = BeautifulSoup(html_text, 'html.parser')
        errorMsg = soup.find('input', attrs={'id': 'errorMsg'})['value']
        inviteSucc = soup.find('input', attrs={'id': 'inviteSucc'})['value']
        if len(errorMsg) != 0:
            errorMsg0 = errorMsg
        if len(inviteSucc) != 0:
            errorMsg0 = inviteSucc
        if index == 1:
            if getIndex == 2:
                pass
            shop_title = soup.find('input', attrs={'id': 'shop_title'})['value'].replace(' ', '')
            actName = soup.find('input', attrs={'id': 'actName'})['value']
            shop_sid = soup.find('input', attrs={'id': 'shop_sid'})['value']
            inviteSuccNums = (soup.find('input', attrs={'id': 'helpLogs'})['value'])
            inviteSetting2s = eval(soup.find('input', attrs={'id': 'inviteSetting2'})['value'])
            print(f"店铺名称: {shop_title} \n活动名称: {actName} \n店铺ID: {shop_sid}")
            num1 = {'1': 'one', '2': 'two', '3': 'three', '4': 'four'}
            num2 = {'1': 'leveOneNum', '2': 'leveTwoNum', '3': 'leveThreeNum', '4': 'leveFourNum'}
            needInviteNums = []
            for a in range(len(inviteSetting2s)):
                b = a + 1
                inviteSetting2 = inviteSetting2s[num1[str(b)]]
                # equityEndTime = inviteSetting2['equityEndTime']
                freezeQuantity = inviteSetting2['freezeQuantity']
                availableQuantity = inviteSetting2['availableQuantity']
                equityType = inviteSetting2['equityType']
                equityName = inviteSetting2['equityName']
                leveNum = inviteSetting2[num2[str(b)]]
                if equityType == "JD_GOODS":
                    denomination = ''
                else:
                    denomination = inviteSetting2['denomination']
                awardId = inviteSetting2['id']
                # inviteSucc = soup.find('input', attrs={'id': 'inviteSucc'})['value']
                print(f"奖品{b}: {equityName} 奖励: {denomination} 总数: {freezeQuantity}份 剩余: {availableQuantity}份 需要邀请: {leveNum}人")
                if availableQuantity > 0:
                    needInviteNums.append((leveNum, awardId, equityType))
                if len(needInviteNums) == 0:
                    print(f"⛈⛈⛈活动奖品全部发完啦！")
                    sys.exit()
            return errorMsg, inviteSuccNums, needInviteNums
        return errorMsg0
    elif "活动已结束" in html_text:
        print("😭活动已结束,下次早点来~")
        sys.exit()
    else:
        return set_cookie

def setMixNick(token):
    url = "https://jinggeng-isv.isvjcloud.com/front/setMixNick"
    payload = f"strTMMixNick={token}&userId={user_id}&source=01"
    headers = {
        'Host': 'jinggeng-isv.isvjcloud.com',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://jinggeng-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': f'{activityUrl}&isOpenCard=0&from=kouling',
        'Content-Length': '116',
        'Cookie': activityCookie
    }
    try:
        response = requests.request("POST", url, headers=headers, data=payload)
        res = response.text
        setMixNick0 = eval(res.replace('true', 'True').replace('false', 'False').replace('none', 'None'))['msg']
        refresh_cookies(response)
        return setMixNick0
    except Exception as e:
        print(e)
        return

def recordActPvUvdata(token):
    url = "https://jinggeng-isv.isvjcloud.com/ql/front/reportActivity/recordActPvUvData"
    payload = F"userId={user_id}&actId={ac_id}"
    headers = {
        'Host': 'jinggeng-isv.isvjcloud.com',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://jinggeng-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': f'{activityUrl}&isOpenCard=0&from=kouling',
        'Content-Length': '56',
        'Cookie': f"IsvToken={token};" + activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)

def checkTokenInSession(token):
    url = "https://jinggeng-isv.isvjcloud.com/front/checkTokenInSession"
    payload = f"userId={user_id}&token={token}"
    headers = {
        'Host': 'jinggeng-isv.isvjcloud.com',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://jinggeng-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': f'{activityUrl}&isOpenCard=0&from=kouling',
        'Content-Length': '99',
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)

def shopmember(cookie):
    url = f'https://shopmember.m.jd.com/shopcard/?venderId={user_id}&channel=401&returnUrl={quote_plus(activityUrl + "&isOpenCard=1")}'
    headers = {
        'Host': 'shopmember.m.jd.com',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Connection': 'keep-alive',
        'Cookie': cookie,
        'User-Agent': ua,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Referer': 'https://jinggeng-isv.isvjcloud.com/',
        'Accept-Encoding': 'gzip, deflate, br'
    }
    requests.request("GET", url, headers=headers)

def bindWithVender(cookie):
    try:
        s.headers = {
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': ua,
            'Cookie': cookie,
            'Host': 'api.m.jd.com',
            'Referer': f'https://shopmember.m.jd.com/shopcard/?venderId={user_id}&returnUrl={quote_plus(activityUrl + "&isOpenCard=1")}',
            'Accept-Language': 'zh-Hans-CN;q=1 en-CN;q=0.9',
            'Accept': '*/*'
        }
        s.params = {
            'appid': 'jd_shop_member',
            'functionId': 'bindWithVender',
            'body': json.dumps({
                'venderId': user_id,
                'shopId': user_id,
                'bindByVerifyCodeFlag': 1
            }, separators=(',', ':'))
        }
        res = s.post('https://api.m.jd.com/', verify=False, timeout=30).json()
        if res['success']:
            if "火爆" in res['message'] or "失败" in res['message']:
                print(f"\t⛈⛈⛈{res['message']}")
            else:
                print(f"\t🎉🎉🎉{res['message']}")
            return res['message']
    except Exception as e:
        print(e)

def receiveInviteJoinAward(token, awardId):
    url = "https://jinggeng-isv.isvjcloud.com/ql/front/receiveInviteJoinAward"
    payload = f"act_id={ac_id}&user_id={user_id}&awardId={awardId}"
    headers = {
        'Host': 'jinggeng-isv.isvjcloud.com',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://jinggeng-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': f'{activityUrl}&isOpenCard=0&from=kouling&sid=09a25fb32a08d0b0fbdef65ab52a40dw&un_area=15_1213_1215_50108',
        'Content-Length': '99',
        'Cookie': f"IsvToken={token};" + activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload).text
    res = eval(response.replace('true', 'True').replace('false', 'False').replace('none', 'None'))
    if res['succ'] is True:
        msg = eval(str(res['msg']).replace('\\\\', ''))
        if msg['isSendSucc']:
            awardType = msg['drawAwardDto']['awardType'].replace('JD_BEAN', '京豆').replace('JD_POINT', '积分')
            awardDenomination = msg['drawAwardDto']['awardDenomination']
            print(f"\t🎉🎉成功领取{awardDenomination}{awardType}")
    else:
        print(f"\t🎉🎉{res['msg']}")


if __name__ == '__main__':
    r = redis_conn()
    try:
        cks = getCk
        if not cks:
            sys.exit()
    except:
        print("未获取到有效COOKIE,退出程序！")
        sys.exit()
    global inviterCode, inviteSuccNums, activityUrl, needInviteNums, rewardIndex, firstCk
    inviteSuccNums = 0
    inviterCode = inviterNick
    activityUrl = activity_url
    needInviteNums = None
    rewardIndex = 0
    num = 0
    for cookie in cks:
        num += 1
        if num == 1:
            firstCk = cookie
        if num % 5 == 0:
            print("⏰等待5s")
            time.sleep(5)
        global ua, activityCookie, token, getIndex
        getIndex = 0
        ua = userAgent()
        try:
            pt_pin = re.compile(r'pt_pin=(.*?);').findall(cookie)[0]
            pt_pin = unquote_plus(pt_pin)
        except IndexError:
            pt_pin = f'用户{num}'
        print(f'\n******开始【京东账号{num}】{pt_pin} *********\n')
        print(datetime.now())
        token = ''
        activityCookie = ''
        activityCookie = getActivity(num, 0, inviterCode, 0)
        try:
            token = getToken(cookie, r)
            if token is None:
                if num == 1:
                    print(f"⚠️车头获取Token失败,退出本程序！")
                    # sys.exit()
                    os._exit()
                print(f"⚠️获取Token失败！⏰等待3s")
                time.sleep(3)
                continue
        except:
            print(f"⚠️获取Token失败！⏰等待3s")
            time.sleep(3)
            continue
        time.sleep(1.5)
        setMixNick0 = setMixNick(token)
        if setMixNick0 is None:
            if num == 1:
                print(f"⚠️车头获取邀请码失败,退出本程序！")
                sys.exit()
            else:
                continue
        else:
            print(f"邀请码->: {setMixNick0}")
        time.sleep(1)
        print(f"准备助力-->: {inviterCode}")
        inviteSuccNum = getActivity(num, 0, inviterCode, 1)
        if num == 1:
            errorMsg0 = inviteSuccNum[0]
            if "跳开卡页面" not in errorMsg0:
                print("无法助力自己")
            inviteSuccNums0 = inviteSuccNum[1]
            needInviteNums = inviteSuccNum[2]
            inviteSuccNums = len(eval(inviteSuccNums0))
            print(f"🛳已经邀请{inviteSuccNums}人")
            for i, needNum0 in enumerate(needInviteNums):
                needNum = needNum0[0]
                awardId = needNum0[1]
                equityType = needNum0[2]
                if inviteSuccNums >= needNum:
                    print(f"🎉恭喜已完成第{i + 1}档邀请，快去领奖吧！")
                    time.sleep(1)
                    recordActPvUvdata(token)
                    checkTokenInSession(token)
                    time.sleep(1)
                    if equityType == "JD_GOODS":
                        print(f"\t🎉🎉成功获得实物奖励,请尽快前往领取:{activityUrl}")
                    else:
                        receiveInviteJoinAward(token, awardId)
                    rewardIndex += 1
                    time.sleep(3)
                    if i + 1 == len(needInviteNums):
                        print("🎉🎉🎉奖励全部领取完毕~")
                        sys.exit()
                time.sleep(1)
            inviterCode = setMixNick0
            activityUrl = f"https://jinggeng-isv.isvjcloud.com/ql/front/showInviteJoin?id={ac_id}&user_id={user_id}&inviterNick={inviterCode}"
            continue
        else:
            errorMsg1 = inviteSuccNum
            # print("num != 1", errorMsg1)
            if "跳开卡页面" not in errorMsg1:
                if "已成功邀请您加入本店会员" in errorMsg1:
                    print("⛈已经是会员了,无法完成助力")
                else:
                    print(f"🛳{errorMsg1}")
                time.sleep(1)
                continue
        time.sleep(1.5)
        recordActPvUvdata(token)
        checkTokenInSession(token)
        time.sleep(1)
        shopmember(cookie)
        print("现在去开卡")
        open_result = bindWithVender(cookie)
        if open_result is not None:
            if "火爆" in open_result or "失败" in open_result:
                time.sleep(1.5)
                print("\t尝试重新入会 第1次")
                open_result = bindWithVender(cookie)
                if "火爆" in open_result or "失败" in open_result:
                    time.sleep(1.5)
                    print("\t尝试重新入会 第2次")
                    open_result = bindWithVender(cookie)
        time.sleep(1)
        if num == 1:
            getIndex = 2
        errorMsg2 = getActivity(num, 1, inviterCode, getIndex)
        time.sleep(2)
        recordActPvUvdata(token)
        checkTokenInSession(token)
        # print(errorMsg2, '============================')
        if num == 1 and "开卡失败" in errorMsg2:
            print(f"⚠️车头疑似火爆号,退出本程序！")
            sys.exit()
        if "已成功邀请您加入本店会员" in errorMsg2:
            inviteSuccNums += 1
            print(f"🛳已经邀请{inviteSuccNums}人")
            for i, needNum1 in enumerate(needInviteNums):
                needNum = needNum1[0]
                awardId = needNum1[1]
                equityType = needNum1[2]
                if inviteSuccNums >= needNum:
                    if rewardIndex >= i + 1:
                        time.sleep(1)
                        continue
                    print(f"🎉恭喜已完成第{i + 1}档邀请，快去领奖吧！")
                    token = getToken(firstCk, r)
                    activityCookie = getActivity(1, 0, inviterCode, 3)
                    setMixNick(token)
                    time.sleep(0.5)
                    recordActPvUvdata(token)
                    time.sleep(0.5)
                    if equityType == "JD_GOODS":
                        print(f"\t🎉🎉成功获得实物奖励,请尽快前往领取:{activityUrl}")
                    else:
                        receiveInviteJoinAward(token, awardId)
                    rewardIndex += 1
                    time.sleep(3)
                    if i + 1 == len(needInviteNums):
                        print("🎉🎉🎉奖励全部领取完毕~")
                        sys.exit()
        if num == 1:
            inviterCode = setMixNick0
            activityUrl = f"https://jinggeng-isv.isvjcloud.com/ql/front/showInviteJoin?id={ac_id}&user_id={user_id}&inviterNick={inviterCode}"

        time.sleep(3)