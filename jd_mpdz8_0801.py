#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File: jd_mpdz8_0801.py(全民酿造 摘要酱香飘万家)
Author: HarbourJ
Date: 2022/8/1 23:37
TG: https://t.me/HarbourToulu
cron: 1 0 0,18 * 8 *
new Env('8.1-8.31 全民酿造 摘要酱香飘万家');
活动入口：19全民酿造 摘要酱香飘万家，【⤴️ℹ️\/ 🆖レ栋】￥O53oq1PvEKlC￥
"""

import time
import requests
import sys
import re
from base64 import b64encode, b64decode
from datetime import datetime
import json
import random
from urllib.parse import quote, unquote
from urllib.parse import quote_plus, unquote_plus
import logging
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger()
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
import os
from jd_sign import *
try:
    from jdCookie import get_cookies
    getCk = get_cookies()
except:
    logger.info("请先下载依赖脚本，\n下载链接：https://raw.githubusercontent.com/HarbourJ/HarbourToulu/main/jdCookie.py")
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

activity_urls = ["https://mpdz8-dz.isvjcloud.com/jdbeverage/pages/zhaiyaohuodong/zhaiyaohuodong?bizExtString=c2hhcmVOaWNrOk55MG0xSzF0VkhJSnZ0MGo0U1E5UmJSUFhNSEhmJTJCRHJObU1WZlQ4UzVocTNTallNQUFDcmJFSFpRNDBKNXlQWSZoZWFkUGljVXJsOmh0dHAlM0ElMkYlMkZzdG9yYWdlLjM2MGJ1eWltZy5jb20lMkZpLmltYWdlVXBsb2FkJTJGMzEzNTM1MzIzMDMxMzYzODM2Mzg1ZjZkMzEzNDMwMzczNjM4MzMzODMyMzkzNTM2MzRfbWlkLmpwZyZuaWNrTmFtZTolRTUlQkYlODMlRTYlOTglOUYxOTk2", "https://mpdz8-dz.isvjcloud.com/jdbeverage/pages/zhaiyaohuodong/zhaiyaohuodong?bizExtString=c2hhcmVOaWNrOnBXR1VXWkpRM2FjdGV4MFgydlF5THNqTmhOYVlGeTJIdGVFckU2aXpsaFRmOW5yR1k3Z0JrQ2RHVTRDNnolMkZ4RCZoZWFkUGljVXJsOmh0dHAlM0ElMkYlMkZzdG9yYWdlLjM2MGJ1eWltZy5jb20lMkZpLmltYWdlVXBsb2FkJTJGNmE2NDVmNjc0MzUwNjc2YzQxNTg2ZDUyNTc0ZTY2MzEzNjM0MzYzNDM4MzYzOTM4MzMzNTMzMzZfbWlkLmpwZyZuaWNrTmFtZTpJcmVuZV9Db3Jwcw=="]
activity_url = random.choice(activity_urls)

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
                    logger.info("获取token失败！")
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
                logger.info("获取token失败！")
                return
        Token = f.json()['token']
        logger.info(f"Token->: {Token}")
        return Token

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

def buyerUrl(index=1, activity_url=None, buyerNick=None):
    global activityUrl, shareNick, shareNick1
    if index == 1:
        activityUrl = activity_url
        bizExtString = b64decode(activityUrl.split('bizExtString=')[1]).decode('utf-8')
        bizExtString = unquote_plus(bizExtString)
        shareNick = bizExtString.split('&')[0].split(':')[1]
    else:
        bizExtString = b64encode(bytes(f"shareNick:{quote_plus(buyerNick)}", encoding="utf-8")).decode()
        activityUrl = f"{activityUrl.split('bizExtString=')[0]}bizExtString={bizExtString}"
        shareNick = buyerNick

    return activityUrl, shareNick

def getActivity(token):
    url = activityUrl
    headers = {
        'Host': 'mpdz8-dz.isvjcloud.com',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Cookie': f'IsvToken={token};',
        'User-Agent': ua,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
    }
    requests.request("GET", url, headers=headers)

def loadActivity(token):
    url = "https://mpdz8-dz.isvjcloud.com/dm/front/jdMakeWine/activity/load?open_id=&mix_nick=&user_id=10299171"
    payload = {"jsonRpc": "2.0", "params": {"admJson": {"buyerNick": "", "method": "/jdMakeWine/activity/load", "jdToken": token, "userId": 10299171, "actId": "makeWine", "inviteNick": "BrhkV49OBlcgmCGIvW/S6Fs/ye9oluZX4nOTK56TeMXbR7I2OlzZch4hTs22oCUS"}, "commonParameter": {"sign": "b098fbe22e9bf12af0a00cc9e68771ce", "timestamp": getJdTime(), "userId": 10299171, "m": "POST"}}}
    headers = {
        'Host': 'mpdz8-dz.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json; charset=utf-8',
        'Origin': 'https://mpdz8-dz.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    response = requests.request("POST", url, headers=headers, data=json.dumps(payload))
    # logger.info('loadActivity', response.text)
    return json.loads(response.text)

def drawList(buyerNick):
    url = f"https://mpdz8-dz.isvjcloud.com/dm/front/jdMakeWine/awards/drawList?open_id=&mix_nick={buyerNick}&user_id=10299171"
    payload = {"jsonRpc": "2.0", "params": {"commonParameter": {"m": "POST", "sign": "8b68429aee3b9a3808e8c161c7f38426", "timestamp": getJdTime(), "userId": 10299171}, "admJson": {"actId": "makeWine", "dataType": "exchange", "method": "/jdMakeWine/awards/drawList", "userId": 10299171, "buyerNick": buyerNick}}}
    headers = {
        'Host': 'mpdz8-dz.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json; charset=utf-8',
        'Origin': 'https://mpdz8-dz.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    response = requests.request("POST", url, headers=headers, data=json.dumps(payload))
    # logger.info(response.text)
    return json.loads(response.text)

def completeState(buyerNick):
    url = f"https://mpdz8-dz.isvjcloud.com/dm/front/jdMakeWine/mission/completeState?open_id=&mix_nick={buyerNick}&user_id=10299171"
    payload = {"jsonRpc": "2.0", "params": {"commonParameter": {"m": "POST", "sign": "583178491affed3125ae8e1a37ff3c02", "timestamp": getJdTime(), "userId": 10299171}, "admJson": {"actId": "makeWine", "method": "/jdMakeWine/mission/completeState", "userId": 10299171, "buyerNick": buyerNick}}}
    headers = {
        'Host': 'mpdz8-dz.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json; charset=utf-8',
        'Origin': 'https://mpdz8-dz.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    response = requests.request("POST", url, headers=headers, data=json.dumps(payload))
    return json.loads(response.text)

def shopList(buyerNick):
    url = f"https://mpdz8-dz.isvjcloud.com/dm/front/jdMakeWine/shop/shopList?open_id=&mix_nick={buyerNick}&user_id=10299171"
    payload = {"jsonRpc": "2.0", "params": {"commonParameter": {"m": "POST", "sign": "872926dfff101f37ae7d551698162da2", "timestamp": getJdTime(), "userId": 10299171}, "admJson": {"actId": "makeWine", "method": "/jdMakeWine/shop/shopList", "userId": 10299171, "buyerNick": buyerNick}}}
    headers = {
        'Host': 'mpdz8-dz.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json; charset=utf-8',
        'Origin': 'https://mpdz8-dz.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    response = requests.request("POST", url, headers=headers, data=json.dumps(payload))
    open_shopList = json.loads(response.text)
    # logger.info('open_shopList', open_shopList)
    unopen_shopList = []
    if open_shopList['success']:
        open_shopList = open_shopList['data']['data']
        for shop in open_shopList:
            if not shop['open']:
                unopen_shopList.append(shop)
    else:
        return
    return unopen_shopList

def getUserInfo(buyerNick):
    url = f"https://mpdz8-dz.isvjcloud.com/dm/front/jdMakeWine/makeWine/getUserInfo?open_id=&mix_nick={buyerNick}&user_id=10299171"
    payload = {"jsonRpc": "2.0", "params": {"commonParameter": {"m": "POST", "sign": "c9e3cf6d45e3d29d097c1b8f61e1f2a3", "timestamp": getJdTime(), "userId": 10299171}, "admJson": {"actId": "makeWine", "method": "/jdMakeWine/makeWine/getUserInfo", "userId": 10299171, "buyerNick": buyerNick}}}
    headers = {
        'Host': 'mpdz8-dz.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json; charset=utf-8',
        'Origin': 'https://mpdz8-dz.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    response = requests.request("POST", url, headers=headers, data=json.dumps(payload))
    getUserInfo = json.loads(response.text)
    if getUserInfo['success']:
        getUserInfo = getUserInfo['data']['data']
        # logger.info(getUserInfo)

def temporary(buyerNick, type):
    url = f"https://mpdz8-dz.isvjcloud.com/dm/front/jdMakeWine/report/temporary?open_id=&mix_nick={buyerNick}&user_id=10299171"
    payload = {"jsonRpc": "2.0", "params": {"commonParameter": {"m": "POST", "sign": "3c2b15d3209dd92a94995226f19b1694", "timestamp": getJdTime(), "userId": 10299171}, "admJson": {"actId": "makeWine", "type": type, "method": "/jdMakeWine/report/temporary", "userId": 10299171, "buyerNick": buyerNick}}}
    headers = {
        'Host': 'mpdz8-dz.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json; charset=utf-8',
        'Origin': 'https://mpdz8-dz.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    response = requests.request("POST", url, headers=headers, data=json.dumps(payload))
    temporary = json.loads(response.text)
    if temporary['success']:
        temporary['data']['msg']

def inviteRelation(buyerNick):
    url = f"https://mpdz8-dz.isvjcloud.com/dm/front/jdMakeWine/customer/inviteRelation?open_id=&mix_nick={buyerNick}&user_id=10299171"
    payload = {"jsonRpc": "2.0", "params": {"commonParameter": {"m": "POST", "sign": "583178491affed3125ae8e1a37ff3c02", "timestamp": getJdTime(), "userId": 10299171}, "admJson": {"actId": "makeWine", "missionType": "relationBind", "method": "/jdMakeWine/customer/inviteRelation", "userId": 10299171, "inviterNick": shareNick, "buyerNick": buyerNick}}}
    headers = {
        'Host': 'mpdz8-dz.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json; charset=utf-8',
        'Origin': 'https://mpdz8-dz.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    response = requests.request("POST", url, headers=headers, data=json.dumps(payload))
    inviteRelation = json.loads(response.text)
    # logger.info('inviteRelation', inviteRelation)
    if inviteRelation['success']:
        msg = inviteRelation['data']['msg']
        if "关系绑定成功" in msg:
            logger.info(f"🎉{msg}")
        else:
            logger.info(f"☃️{msg}")
    else:
        errorMessage = inviteRelation['errorMessage']
        logger.info(errorMessage)

def completeMissionQa(buyerNick, missionType, problemId, answerIds):
    url = f"https://mpdz8-dz.isvjcloud.com/dm/front/jdMakeWine/mission/completeMission?open_id=&mix_nick={buyerNick}&user_id=10299171"
    payload = {"jsonRpc": "2.0", "params": {"commonParameter": {"m": "POST", "sign": "1b96d3a4e5f083eaf631ebbfe8dc4c0e", "timestamp": getJdTime(), "userId": 10299171}, "admJson": {"actId": "makeWine", "missionType": missionType, "method": "/jdMakeWine/mission/completeMission", "userId": 10299171, "problemId": problemId, "answerIds": [answerIds], "buyerNick": buyerNick}}}
    headers = {
        'Host': 'mpdz8-dz.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json; charset=utf-8',
        'Origin': 'https://mpdz8-dz.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    response = requests.request("POST", url, headers=headers, data=json.dumps(payload))
    completeMission = json.loads(response.text)
    # logger.info('completeMission', missionType, response.text)
    if completeMission['success']:
        remark = completeMission['data']['data']['remark']
        if "错误" in remark:
            logger.info(f"\t😭{remark[:5]}奖励一个💨")
        else:
            logger.info(f"\t🎉{remark[:5]}获得10酿造币~")
    else:
        errorMessage = completeMission['data']
        logger.info(errorMessage)

def getDailyQA(buyerNick):
    url = f"https://mpdz8-dz.isvjcloud.com/dm/front/jdMakeWine/mission/getDailyQA?open_id=&mix_nick={buyerNick}&user_id=10299171"
    payload = {"jsonRpc": "2.0", "params": {"commonParameter": {"m": "POST", "sign": "28108d03b6563f4bdbb848f3b57dfef7", "timestamp": getJdTime(), "userId": 10299171}, "admJson": {"actId": "makeWine", "method": "/jdMakeWine/shop/getHotGoods", "userId": 10299171, "buyerNick": buyerNick}}}
    headers = {
        'Host': 'mpdz8-dz.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json; charset=utf-8',
        'Origin': 'https://mpdz8-dz.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    response = requests.request("POST", url, headers=headers, data=json.dumps(payload))
    getHotGoods = json.loads(response.text)
    # logger.info('getDailyQA', response.text)
    if getHotGoods['success']:
        return getHotGoods['data']['data']

def completeMission(buyerNick, missionType):
    url = f"https://mpdz8-dz.isvjcloud.com/dm/front/jdMakeWine/mission/completeMission?open_id=&mix_nick={buyerNick}&user_id=10299171"
    payload = {"jsonRpc": "2.0", "params": {"commonParameter": {"m": "POST", "sign": "1b96d3a4e5f083eaf631ebbfe8dc4c0e", "timestamp": getJdTime(), "userId": 10299171}, "admJson": {"actId": "makeWine", "missionType": missionType, "method": "/jdMakeWine/mission/completeMission", "userId": 10299171, "buyerNick": buyerNick}}}
    headers = {
        'Host': 'mpdz8-dz.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json; charset=utf-8',
        'Origin': 'https://mpdz8-dz.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    response = requests.request("POST", url, headers=headers, data=json.dumps(payload))
    completeMission = json.loads(response.text)
    # logger.info('completeMission', missionType, response.text)
    if completeMission['success']:
        try:
            remark = completeMission['data']['data']['remark']
            logger.info(f"\t🛳{remark}")
        except:
            remark = completeMission['errorMessage']
            logger.info(f"\t🛳{remark}")
    else:
        errorMessage = completeMission['data']
        logger.info(errorMessage)

def getHotGoods(buyerNick, missionType):
    url = f"https://mpdz8-dz.isvjcloud.com/dm/front/jdMakeWine/shop/getHotGoods?open_id=&mix_nick={buyerNick}&user_id=10299171"
    payload = {"jsonRpc": "2.0", "params": {"commonParameter": {"m": "POST", "sign": "9f8eb7e86b73fb82177c5190208c8fe6", "timestamp": getJdTime(), "userId": 10299171}, "admJson": {"actId": "makeWine", "missionType": missionType, "method": "/jdMakeWine/shop/getHotGoods", "userId": 10299171, "buyerNick": buyerNick}}}
    headers = {
        'Host': 'mpdz8-dz.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json; charset=utf-8',
        'Origin': 'https://mpdz8-dz.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    response = requests.request("POST", url, headers=headers, data=json.dumps(payload))
    getHotGoods = json.loads(response.text)
    # logger.info('getHotGoods', missionType, response.text)
    if getHotGoods['success']:
        return getHotGoods['data']['data']['numId']

def completeMissionView(buyerNick, missionType, goodsId):
    url = f"https://mpdz8-dz.isvjcloud.com/dm/front/jdMakeWine/mission/completeMission?open_id=&mix_nick={buyerNick}&user_id=10299171"
    payload = {"jsonRpc": "2.0", "params": {"commonParameter": {"m": "POST", "sign": "1b96d3a4e5f083eaf631ebbfe8dc4c0e", "timestamp": getJdTime(), "userId": 10299171}, "admJson": {"actId": "makeWine", "missionType": missionType, "method": "/jdMakeWine/mission/completeMission", "goodsId": goodsId, "userId": 10299171, "buyerNick": buyerNick}}}
    headers = {
        'Host': 'mpdz8-dz.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json; charset=utf-8',
        'Origin': 'https://mpdz8-dz.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    response = requests.request("POST", url, headers=headers, data=json.dumps(payload))
    completeMission = json.loads(response.text)
    # logger.info('completeMission', missionType, response.text)
    if completeMission['success']:
        remark = completeMission['data']['data']['remark']
        logger.info(remark)
    else:
        errorMessage = completeMission['data']
        logger.info(errorMessage)

def shopmember(venderId, cookie):
    shopcard_url = quote_plus(f"{activityUrl}?actId=makeWine&joinShopId={venderId}")
    url = f"https://shopmember.m.jd.com/shopcard/?venderId={venderId}&channel=401&returnUrl={shopcard_url}"
    headers = {
        'Host': 'shopmember.m.jd.com',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Connection': 'keep-alive',
        'Cookie': cookie,
        'User-Agent': ua,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Referer': 'https://mpdz8-dz.isvjcloud.com/',
        'Accept-Encoding': 'gzip, deflate, br'
    }
    requests.request("GET", url, headers=headers)

def getShopOpenCardInfo(body, venderId, cookie, ua):
    shopcard_url0 = quote_plus(f"{activityUrl}?actId=makeWine&joinShopId={venderId}")
    shopcard_url = f"https://shopmember.m.jd.com/shopcard/?venderId={venderId}&channel=401&returnUrl={shopcard_url0}"
    url = f'https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=getShopOpenCardInfo&body={json.dumps(body)}&client=H5&clientVersion=9.2.0&uuid=88888'
    headers = {
        'Host': 'api.m.jd.com',
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Cookie': cookie,
        'User-Agent': ua,
        'Accept-Language': 'zh-cn',
        'Referer': shopcard_url,
        'Accept-Encoding': 'gzip, deflate'
    }
    response = requests.get(url=url, headers=headers, timeout=5).text
    return json.loads(response)

def bindWithVender(cookie, venderId, body):
    try:
        shopcard_url0 = quote_plus(f"{activityUrl}?actId=makeWine&joinShopId={venderId}")
        shopcard_url = f"https://shopmember.m.jd.com/shopcard/?venderId={venderId}&channel=401&returnUrl={shopcard_url0}"
        url = f'https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=bindWithVender&body={json.dumps(body)}&client=H5&clientVersion=9.2.0&uuid=88888&h5st=20220614090341129%3B0284392757226553%3Bef79a%3Btk02wcbf51cf018njrSeb2PERKoZxKtLTPV0g0paq33tkJwK4bJurufnMpBuFkn4RVxkfBmwRhN8VRd%2BB2q%2BrzaXvMR7%3B3f2a1efdb5f2b79e17aa8836a38af77030ad35b4aab128c11e3edbaa034c1733%3B3.0%3B1655168621129'
        header = {
            'Host': 'api.m.jd.com',
            'Cookie': cookie,
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Accept': '*/*',
            'User-Agent': ua,
            'Referer': shopcard_url
        }
        response = requests.get(url=url, headers=header, timeout=30).text
        return json.loads(response)
    except Exception as e:
        logger.info(e)

def completeMissionCard(buyerNick, venderId, missionType):
    url = f"https://mpdz8-dz.isvjcloud.com/dm/front/jdMakeWine/mission/completeMission?open_id=&mix_nick={buyerNick}&user_id=10299171"
    payload = {"jsonRpc": "2.0", "params": {"commonParameter": {"m": "POST", "sign": "1b96d3a4e5f083eaf631ebbfe8dc4c0e", "timestamp": getJdTime(), "userId": 10299171}, "admJson": {"actId": "makeWine", "missionType": missionType, "method": "/jdMakeWine/mission/completeMission", "shopId": venderId, "userId": 10299171, "buyerNick": buyerNick}}}
    headers = {
        'Host': 'mpdz8-dz.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json; charset=utf-8',
        'Origin': 'https://mpdz8-dz.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    response = requests.request("POST", url, headers=headers, data=json.dumps(payload))
    completeMission = json.loads(response.text)
    if completeMission['success']:
        remark = completeMission['data']['data']['remark']
        if "入会成功" in remark:
            logger.info(f"\t🎉🎉{remark}")
        else:
            logger.info(f"⛈⛈{remark}")
    else:
        errorMessage = completeMission['data']
        logger.info(errorMessage)

def checkOpenCard(buyerNick):
    url = f"https://mpdz8-dz.isvjcloud.com/dm/front/jdMakeWine/customer/checkOpenCard?open_id=&mix_nick={buyerNick}&user_id=10299171"
    payload = {"jsonRpc": "2.0", "params": {"commonParameter": {"m": "POST", "sign": "157934762ac10948578eec2b24d270f6", "timestamp": getJdTime(), "userId": 10299171}, "admJson": {"actId": "makeWine", "method": "/jdMakeWine/customer/checkOpenCard", "userId": 10299171, "buyerNick": buyerNick}}}
    headers = {
        'Host': 'mpdz8-dz.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json; charset=utf-8',
        'Origin': 'https://mpdz8-dz.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    response = requests.request("POST", url, headers=headers, data=json.dumps(payload))
    checkOpenCard = json.loads(response.text)
    # logger.info('checkOpenCard', checkOpenCard)
    if checkOpenCard['success']:
        msg = checkOpenCard['data']['msg']
        logger.info(msg)
    else:
        errorMessage = checkOpenCard['data']
        logger.info(errorMessage)


if __name__ == '__main__':
    r = redis_conn()
    try:
        cks = getCk
        if not cks:
            sys.exit()
    except:
        logger.info("未获取到有效COOKIE,退出程序！")
        sys.exit()
    num = 0
    global activityUrl, buyerNick, shareNick, headPicUrl, nickName
    activityUrl = None
    shareNick = None
    buyerNick = None
    headPicUrl = None
    nickName = None
    for ck in cks:
        num += 1
        try:
            pt_pin = re.compile(r'pt_pin=(.*?);').findall(ck)[0]
            pt_pin = unquote_plus(pt_pin)
        except IndexError:
            pt_pin = f'用户{num}'
        logger.info(f'\n******开始【京东账号{num}】{pt_pin} *********\n')
        logger.info(datetime.now())
        ua = userAgent()
        if num == 1:
            activityUrl = activity_url
        if num <= 2:
            buyerInfo = buyerUrl8(num, activityUrl, buyerNick, headPicUrl, nickName)
            activityUrl = buyerInfo[0]
            shareNick = buyerInfo[1]
        try:
            token = getToken(ck, r)
            if token is None:
                continue
        except:
            continue
        time.sleep(1)
        getActivity(token)
        time.sleep(1)
        LA = loadActivity(token)
        if LA['success']:
            buyerNick = LA['data']['data']['missionCustomer']['buyerNick']
            headPicUrl = LA['data']['data']['missionCustomer']['headPicUrl']
            nickName = LA['data']['data']['missionCustomer']['nickName']
            logger.info(f"邀请码->: {buyerNick}")
            time.sleep(1.5)
            drawAward = drawList(buyerNick)
            if drawAward['success']:
                if num == 1:
                    drawAwardList = drawAward['data']['data']['drawAwardList']
                    numb = 0
                    for drawAward in drawAwardList:
                        numb += 1
                        logger.info(f"奖品{numb}: {drawAward['awardName']} 剩余{drawAward['remainNum']}份 兑换需{drawAward['needNum']}坛白酒")
            time.sleep(1)
            complete_data = completeState(buyerNick)
            if complete_data['success']:
                data = complete_data['data']['data']
            time.sleep(1)
            logger.info(f"准备助力->: {shareNick}")
            temporary(buyerNick, "pv")
            shopList0 = shopList(buyerNick)
            time.sleep(1)
            getUserInfo(buyerNick)
            time.sleep(1)
            # temporary(buyerNick, "pv")
            inviteRelation(buyerNick)
            temporary(buyerNick, "renwu")
            time.sleep(1.5)
            # 完成日常任务
            # data[-1], data[-2] = data[-2], data[-1] # 调换开卡邀请顺序
            data[-1], data[1] = data[1], data[-1]
            data[-2], data[-1] = data[-1], data[-2]
            data[2], data[0] = data[0], data[2]
            for i in data[:-1]:
                # logger.info(i)
                if i['isComplete']:
                    logger.info(f"{i['missionName']} 已完成")
                else:
                    logger.info(f"现在去做{i['missionName']}任务")
                    # 购买商品(跳过)
                    if i['type'] == 'payTrade':
                        logger.info("\t😆先v船长999")
                        time.sleep(0.5)
                        continue
                    # 浏览商品
                    elif i['type'] == 'viewTimes':
                        for index in range(6-i['hasGotNum']):
                            temporary(buyerNick, "liulanshangpin")
                            time.sleep(0.5)
                            goodsId = getHotGoods(buyerNick, "viewTimes")
                            logger.info(f"⏰浏览商品 {goodsId},等待15s")
                            time.sleep(15)
                            completeMissionView(buyerNick, "viewTimes", goodsId)
                            time.sleep(0.5)
                    # 开卡入会
                    elif i['type'] == 'openCard':
                        if shopList0 is not None:
                            # logger.info('shopList0', shopList0)
                            if len(shopList0) > 0:
                                logger.info("准备开卡")
                                for shop0 in shopList0:
                                    shopTitle = shop0['shopTitle']
                                    venderId = shop0['userId']
                                    shopId = shop0['shopId']
                                    temporary(buyerNick, "ruhui")
                                    completeMissionCard(buyerNick, venderId, "openCard")
                                    time.sleep(0.5)
                                    shopmember(venderId, ck)
                                    time.sleep(0.5)
                                    # 检查入会状态
                                    try:
                                        result1 = getShopOpenCardInfo({"venderId": str(venderId), "channel": "401"}, venderId, ck, ua)
                                        # logger.info(result1)
                                    except:
                                        continue
                                    try:
                                        if result1['result']['userInfo']['openCardStatus'] == 0:
                                            ruhui = bindWithVender(ck, venderId, {"venderId": str(venderId), "bindByVerifyCodeFlag": 1, "registerExtend": {}, "writeChildFlag": 0, "activityId": 2592549, "channel": 401})
                                            logger.info(f"\t{shopTitle} {ruhui['message']}")
                                            if "火爆" in str(ruhui) or "失败" in str(ruhui):
                                                logger.info("尝试重新入会 第1次")
                                                time.sleep(2.5)
                                                ruhui = bindWithVender(ck, venderId, {"venderId": str(venderId), "bindByVerifyCodeFlag": 1, "registerExtend": {}, "writeChildFlag": 0, "activityId": 2592549, "channel": 401})
                                                logger.info(f"\t{shopTitle} {ruhui['message']}")
                                                if "火爆" in str(ruhui) or "失败" in str(ruhui):
                                                    logger.info("尝试重新入会 第2次")
                                                    time.sleep(2.5)
                                                    ruhui = bindWithVender(ck, venderId, {"venderId": str(venderId),
                                                                                          "bindByVerifyCodeFlag": 1,
                                                                                          "registerExtend": {},
                                                                                          "writeChildFlag": 0,
                                                                                          "activityId": 2592549,
                                                                                          "channel": 401})
                                                    logger.info(f"\t{shopTitle} {ruhui['message']}")
                                        # **********************
                                        getActivity(token)
                                        time.sleep(0.5)
                                        loadActivity(token)
                                        time.sleep(0.5)
                                        drawList(buyerNick)
                                        time.sleep(0.5)
                                        completeState(buyerNick)
                                        time.sleep(0.5)
                                        temporary(buyerNick, "ruhui")
                                        completeMissionCard(buyerNick, venderId, "openCard")
                                        time.sleep(0.5)
                                        getUserInfo(buyerNick)
                                        temporary(buyerNick, "pv")
                                        time.sleep(0.5)
                                        shopList1 = shopList(buyerNick)
                                        if len(shopList1) == 0:
                                            logger.info("😆开卡任务已完成")
                                        time.sleep(0.5)
                                    except:
                                        continue
                            else:
                                logger.info("\t已全部开卡")

                            # **********************
                            temporary(buyerNick, "yaoqing")
                            checkOpenCard(buyerNick)
                            # time.sleep(1)
                            # temporary(buyerNick, "renwu")
                            # inviteRelation(buyerNick)
                            time.sleep(1)

                    # 每日问答
                    elif i['type'] == 'dailyQa':
                        QA = getDailyQA(buyerNick)
                        problemId = QA['problem']['id']
                        answerId = QA['answers'][-1]['id']
                        time.sleep(0.5)
                        temporary(buyerNick, "wenda")
                        completeMissionQa(buyerNick, "dailyQa", problemId, answerId)
                        time.sleep(1.5)
                    else:
                        # 签到、关注、加购
                        temporary(buyerNick, "renwu")
                        completeMission(buyerNick, i['type'])
                        time.sleep(1.5)