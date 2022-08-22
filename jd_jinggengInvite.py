#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File: jd_jinggengInvite.py(jinggeng邀请入会有礼)
Author: HarbourJ
Date: 2022/8/1 22:37
TG: https://t.me/HarbourToulu
cron: 1 1 1 1 1 1
new Env('jinggeng邀请入会有礼');
活动入口: https://jinggeng-isv.isvjcloud.com/ql/front/showInviteJoin?id=9e80809282a4bdc90182ab254c7e0a12&user_id=1000121005&inviterNick=Ny0m1K1tVHIJvt0j4SQ9RbRPXMHHf%2BDrNmMVfT8S5hq3SjYMAACrbEHZQ40J5yPY
变量设置: export redis_url="redis_ip", export redis_pwd="xxx"(没有可写变量)
        export jinggengInviteJoin="9e80809282a4bdc90182ab254c7e0a12&1000121005"(活动id&店铺id)
"""

import time
import requests
import sys
import re
import os
from bs4 import BeautifulSoup
from datetime import datetime
import json
import random
from urllib.parse import quote_plus, unquote_plus
import logging
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger()
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

try:
    if "aarch" in os.uname().machine:
        from utils.jd_sign_arm64 import *
    else:
        from utils.jd_sign_x86 import *
except:
    from utils.jd_sign import *
try:
    from jdCookie import get_cookies
    getCk = get_cookies()
except:
    logger.info("请先下载依赖脚本，\n下载链接: https://raw.githubusercontent.com/HarbourJ/HarbourToulu/main/jdCookie.py")
    sys.exit(3)
try:
    if os.environ.get("redis_url"):
        redis_url = os.environ["redis_url"]  # redis ip
    else:
        redis_url = "172.17.0.1"
    if os.environ.get("redis_pwd"):
        redis_pwd = os.environ["redis_pwd"]  # redis 密码
    else:
        redis_pwd = ""
except:
    redis_url = "172.17.0.1"
    redis_pwd = ""

try:
    if os.environ.get("jinggengInviteJoin"):
        jinggengInviteJoin = os.environ["jinggengInviteJoin"]
    else:
        jinggengInviteJoin = "9e8080e0828365a10182868854b40115&1000004385"
except:
    jinggengInviteJoin = "9e80809282a4bdc90182ab254c7e0a12&1000121005"

inviterNicks = [
    "Ny0m1K1tVHIJvt0j4SQ9RbRPXMHHf%2BDrNmMVfT8S5hq3SjYMAACrbEHZQ40J5yPY",
    "pWGUWZJQ3actex0X2vQyLsjNhNaYFy2HteErE6izlhTf9nrGY7gBkCdGU4C6z%2FxD"
]
if "&" not in jinggengInviteJoin:
    logger.info("⚠️jinggengInviteJoin变量有误！退出程序！")
    sys.exit()
ac_id = jinggengInviteJoin.split("&")[0]
user_id = jinggengInviteJoin.split("&")[1]
inviterNick = random.choice(inviterNicks)
activity_url = f"https://jinggeng-isv.isvjcloud.com/ql/front/showInviteJoin?id={ac_id}&user_id={user_id}&inviterNick={inviterNick}"

def redis_conn():
    try:
        import redis
        try:
            pool = redis.ConnectionPool(host=redis_url, port=6379, decode_responses=True, socket_connect_timeout=5, password=redis_pwd)
            r = redis.Redis(connection_pool=pool)
            r.get('conn_test')
            logger.info('✅redis连接成功')
            return r
        except:
            logger.info("⚠️redis连接异常")
    except:
        logger.info("⚠️缺少redis依赖，请运行pip3 install redis")

def getToken(ck, r=None):
    try:
        # redis缓存Token 活动域名+pt_pin
        pt_pin = unquote_plus(re.compile(r'pt_pin=(.*?);').findall(ck)[0])
    except:
        # redis缓存Token 活动域名+ck前7位(获取pin失败)
        pt_pin = ck[:8]
    try:
        if r is not None:
            Token = r.get(f'{activityUrl.split("https://")[1].split("-")[0]}_{pt_pin}')
            # logger.info("Token过期时间", r.ttl(f'{activityUrl.split("https://")[1].split("-")[0]}_{pt_pin}'))
            if Token is not None:
                logger.info(f"♻️获取缓存Token->: {Token}")
                return Token
            else:
                logger.info("🈳去设置Token缓存-->")
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
                # logger.info(sign_txt)
                f = s.post('https://api.m.jd.com/client.action', verify=False, timeout=30)
                if f.status_code != 200:
                    logger.info(f.status_code)
                    return
                else:
                    if "参数异常" in f.text:
                        return
                Token_new = f.json()['token']
                logger.info(f"Token->: {Token_new}")
                if r.set(f'{activityUrl.split("https://")[1].split("-")[0]}_{pt_pin}', Token_new, ex=1800):
                    logger.info("✅Token缓存设置成功")
                else:
                    logger.info("❌Token缓存设置失败")
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
            # logger.info(sign_txt)
            f = s.post('https://api.m.jd.com/client.action', verify=False, timeout=30)
            if f.status_code != 200:
                logger.info(f.status_code)
                return
            else:
                if "参数异常" in f.text:
                    return
            Token = f.json()['token']
            logger.info(f"Token->: {Token}")
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
        logger.info(response.status_code, "⚠️ip疑似黑了,休息一会再来撸~")
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
            logger.info(f"店铺名称: {shop_title} \n活动名称: {actName} \n店铺ID: {shop_sid}")
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
                logger.info(f"奖品{b}: {equityName} 奖励: {denomination} 总数: {freezeQuantity}份 剩余: {availableQuantity}份 需要邀请: {leveNum}人")
                if availableQuantity > 0:
                    needInviteNums.append((leveNum, awardId, equityType))
                if len(needInviteNums) == 0:
                    logger.info(f"⛈⛈⛈活动奖品全部发完啦！")
                    sys.exit()
            return errorMsg, inviteSuccNums, needInviteNums
        return errorMsg0
    elif "活动已结束" in html_text:
        logger.info("😭活动已结束,下次早点来~")
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
        logger.info(e)
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
        body = {"venderId": user_id, "shopId": user_id, "bindByVerifyCodeFlag": 1,"registerExtend": {},"writeChildFlag":0, "channel": 401}
        url = f'https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=bindWithVender&body={json.dumps(body)}&client=H5&clientVersion=9.2.0&uuid=88888&h5st=20220614102046318%3B7327310984571307%3Bef79a%3Btk02wa31b1c7718neoZNHBp75rw4pE%2Fw7fXko2SdFCd1vIeWy005pEHdm0lw2CimWpaw3qc9il8r9xVLHp%2Bhzmo%2B4swg%3Bdd9526fc08234276b392435c8623f4a737e07d4503fab90bf2cd98d2a3a778ac%3B3.0%3B1655173246318'
        headers = {
            'Host': 'api.m.jd.com',
            'Cookie': cookie,
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Accept': '*/*',
            'User-Agent': ua,
            'Referer': f'https://shopmember.m.jd.com/shopcard/?venderId={user_id}&channel=401&returnUrl={quote_plus(activityUrl + "&isOpenCard=1")}'
        }
        response = requests.get(url=url, headers=headers, timeout=30).text
        res = json.loads(response)
        if res['success']:
            open_result = res['message']
            if "火爆" in open_result:
                logger.info(f"\t⛈⛈⛈{open_result}")
            else:
                logger.info(f"\t🎉🎉🎉{open_result}")
            return res['message']
    except Exception as e:
        logger.info(e)

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
            logger.info(f"\t🎉🎉成功领取{awardDenomination}{awardType}")
    else:
        logger.info(f"\t🎉🎉{res['msg']}")


if __name__ == '__main__':
    r = redis_conn()
    try:
        cks = getCk
        if not cks:
            sys.exit()
    except:
        logger.info("未获取到有效COOKIE,退出程序！")
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
            logger.info("⏰等待5s")
            time.sleep(5)
        global ua, activityCookie, token, getIndex
        getIndex = 0
        ua = userAgent()
        try:
            pt_pin = re.compile(r'pt_pin=(.*?);').findall(cookie)[0]
            pt_pin = unquote_plus(pt_pin)
        except IndexError:
            pt_pin = f'用户{num}'
        logger.info(f'\n******开始【京东账号{num}】{pt_pin} *********\n')
        logger.info(datetime.now())
        token = ''
        activityCookie = ''
        activityCookie = getActivity(num, 0, inviterCode, 0)
        try:
            token = getToken(cookie, r)
            if token is None:
                if num == 1:
                    logger.info(f"⚠️车头获取Token失败,退出本程序！")
                    # sys.exit()
                    os._exit()
                logger.info(f"⚠️获取Token失败！⏰等待3s")
                time.sleep(3)
                continue
        except:
            logger.info(f"⚠️获取Token失败！⏰等待3s")
            time.sleep(3)
            continue
        time.sleep(1.5)
        setMixNick0 = setMixNick(token)
        if setMixNick0 is None:
            if num == 1:
                logger.info(f"⚠️车头获取邀请码失败,退出本程序！")
                sys.exit()
            else:
                continue
        else:
            logger.info(f"邀请码->: {setMixNick0}")
        time.sleep(1)
        logger.info(f"准备助力-->: {inviterCode}")
        inviteSuccNum = getActivity(num, 0, inviterCode, 1)
        if num == 1:
            errorMsg0 = inviteSuccNum[0]
            if "跳开卡页面" not in errorMsg0:
                logger.info("无法助力自己")
            inviteSuccNums0 = inviteSuccNum[1]
            needInviteNums = inviteSuccNum[2]
            inviteSuccNums = len(eval(inviteSuccNums0))
            logger.info(f"🛳已经邀请{inviteSuccNums}人")
            for i, needNum0 in enumerate(needInviteNums):
                needNum = needNum0[0]
                awardId = needNum0[1]
                if inviteSuccNums >= needNum:
                    logger.info(f"🎉恭喜已完成第{i + 1}档邀请，快去领奖吧！")
                    time.sleep(1)
                    recordActPvUvdata(token)
                    checkTokenInSession(token)
                    time.sleep(1)
                    if equityType == "JD_GOODS":
                        logger.info(f"\t🎉🎉成功获得实物奖励,请尽快前往领取:{activityUrl}")
                    else:
                        receiveInviteJoinAward(token, awardId)
                    rewardIndex += 1
                    time.sleep(3)
                    if i + 1 == len(needInviteNums):
                        logger.info("🎉🎉🎉奖励全部领取完毕~")
                        sys.exit()
                time.sleep(1)
            inviterCode = setMixNick0
            activityUrl = f"https://jinggeng-isv.isvjcloud.com/ql/front/showInviteJoin?id={ac_id}&user_id={user_id}&inviterNick={inviterCode}"
            continue
        else:
            errorMsg1 = inviteSuccNum
            # logger.info("num != 1", errorMsg1)
            if "跳开卡页面" not in errorMsg1:
                if "已成功邀请您加入本店会员" in errorMsg1:
                    logger.info("⛈已经是会员了,无法完成助力")
                else:
                    logger.info(f"🛳{errorMsg1}")
                time.sleep(1)
                continue
        time.sleep(1.5)
        recordActPvUvdata(token)
        checkTokenInSession(token)
        time.sleep(1)
        shopmember(cookie)
        logger.info("现在去开卡")
        open_result = bindWithVender(cookie)
        if open_result is not None:
            if "火爆" in open_result:
                time.sleep(1.5)
                logger.info("\t尝试重新入会 第1次")
                open_result = bindWithVender(cookie)
                if "火爆" in open_result:
                    time.sleep(1.5)
                    logger.info("\t尝试重新入会 第2次")
                    open_result = bindWithVender(cookie)
        time.sleep(1)
        if num == 1:
            getIndex = 2
        errorMsg2 = getActivity(num, 1, inviterCode, getIndex)
        time.sleep(2)
        recordActPvUvdata(token)
        checkTokenInSession(token)
        # logger.info(errorMsg2, '============================')
        if num == 1 and "开卡失败" in errorMsg2:
            logger.info(f"⚠️车头疑似火爆号,退出本程序！")
            sys.exit()
        if "已成功邀请您加入本店会员" in errorMsg2:
            inviteSuccNums += 1
            logger.info(f"🛳已经邀请{inviteSuccNums}人")
            for i, needNum1 in enumerate(needInviteNums):
                # logger.info(i, needNum1)
                needNum = needNum1[0]
                awardId = needNum1[1]
                equityType = needNum1[2]
                if inviteSuccNums >= needNum:
                    if rewardIndex >= i + 1:
                        time.sleep(1)
                        continue
                    logger.info(f"🎉恭喜已完成第{i + 1}档邀请，快去领奖吧！")
                    token = getToken(firstCk, r)
                    activityCookie = getActivity(1, 0, inviterCode, 3)
                    setMixNick(token)
                    time.sleep(0.5)
                    recordActPvUvdata(token)
                    time.sleep(0.5)
                    if equityType == "JD_GOODS":
                        logger.info(f"\t🎉🎉成功获得实物奖励,请尽快前往领取:{activityUrl}")
                    else:
                        receiveInviteJoinAward(token, awardId)
                    rewardIndex += 1
                    time.sleep(3)
                    if i + 1 == len(needInviteNums):
                        logger.info("🎉🎉🎉奖励全部领取完毕~")
                        sys.exit()
        if num == 1:
            inviterCode = setMixNick0
            activityUrl = f"https://jinggeng-isv.isvjcloud.com/ql/front/showInviteJoin?id={ac_id}&user_id={user_id}&inviterNick={inviterCode}"

        time.sleep(3)