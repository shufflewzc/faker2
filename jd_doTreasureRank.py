#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File: jd_doTreasureRank.py(京东宝藏榜)
Author: HarbourJ
Date: 2022/9/19 22:00
TG: https://t.me/HarbourToulu
TgChat: https://t.me/HarbourSailing
cron: 30 0 0 * * *
new Env('京东宝藏榜');
ActivityEntry: 首页排行榜-宝藏榜
"""

import requests, sys, os, re, time
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

def randomString(e, flag=False):
    t = "0123456789abcdef"
    if flag: t = t.upper()
    n = [random.choice(t) for _ in range(e)]
    return ''.join(n)

def doTask(cookie):
    url = "https://api.m.jd.com/client.action"
    payload = f'functionId=doTreasureInteractive&body=%7B%22type%22%3A%223%22%2C%22itemId%22%3A%22%22%7D&appid=newrank_action&clientVersion=11.2.2&client=wh5&ext=%7B%22prstate%22%3A%220%22%7D'
    headers = {
        'Host': 'api.m.jd.com',
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://h5.m.jd.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': 'https://h5.m.jd.com/',
        'request-from': 'native',
        'Cookie': cookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    try:
        res = response.json()
        if res['isSuccess']:
            result = res['result']
            if result['rewardType'] == 20001:
                print(f"🎉{result['rewardTitle']} {result['discount']}")
            else:
                print("已经领过了,明天再来")

        else:
            print(res)
    except:
        print(response.text)



if __name__ == '__main__':
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
        global ua
        ua = userAgent()
        try:
            pt_pin = re.compile(r'pt_pin=(.*?);').findall(cookie)[0]
            pt_pin = unquote_plus(pt_pin)
        except IndexError:
            pt_pin = f'用户{num}'
        print(f'\n******开始【京东账号{num}】{pt_pin} *********\n')
        print(datetime.now())
        doTask(cookie)
        time.sleep(2)



