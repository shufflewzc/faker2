#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File: jd_newVerRewards.py(ios新版本体验奖励-一次性脚本)
Author: HarbourJ
Date: 2022/9/19 22:00
TG: https://t.me/HarbourToulu
TgChat: https://t.me/HarbourSailing
cron: 1 1 1 1 1 1
new Env('ios新版本体验奖励');
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
        print("请先运行HarbourJ库依赖一键安装脚本(jd_check_dependent.py)，安装jd_sign.so依赖")
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
    url = "https://api.m.jd.com/client.action?functionId=iosGR"
    payload = "avifSupport=1&body=%7B%22isAvatar%22%3Atrue%2C%22s1%22%3A%22H0J5UaM75ogGprZvWH%5C/BScpFRIFwTQn7a3d4%5C/uD85D52Ep0WCrIv7yyjklhQJNX9P0XRVdKJzRHwjaFcbEbPzrMbUoBMcLZZElWBPvww%5C/j9UeB%5C/nb5jJkX8a2LtAUhqI%22%2C%22t1%22%3A%221664422375578%22%7D&build=168320&client=apple&clientVersion=11.2.8&d_brand=apple&d_model=iPhone14%2C2&ef=1&eid=eidIf34a812297s5rQr%2BkjovSTeXkaJ9eH%2Bv%2Bq0LABNpeSngH8uTxFXqaRRoSP160oUP8TIxScuDg6LWO5hrPidREH5zHWW4iSHx6KvPR9qkYa5dbthq&ep=%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22screen%22%3A%22CJO3CMeyDJCy%22%2C%22wifiBssid%22%3A%22C2DtENrvCwC3YWCmZtrtDzc2D2VvEWTvDtS0ZNYyDzc%3D%22%2C%22osVersion%22%3A%22CJYkCG%3D%3D%22%2C%22area%22%3A%22CJZpCJCzCv8nCzC2XzU5CJU0%22%2C%22openudid%22%3A%22D2U5C2HvY2HsDWPuDWHuCQG2CQSyENOmDtrrZNHsZNS5CzC4CQPuYG%3D%3D%22%2C%22uuid%22%3A%22aQf1ZRdxb2r4ovZ1EJZhcxYlVNZSZz09%22%7D%2C%22ts%22%3A1664422371%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D&ext=%7B%22prstate%22%3A%220%22%2C%22pvcStu%22%3A%221%22%7D&isBackground=N&joycious=83&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&partner=TF&rfs=0000&scope=10&sign=f73512601cd2c8503741e3ebfb9589b4&st=1664422375593&sv=122&uemps=0-0&uts=0f31TVRjBSuKShTfW9oS/M1WAeR8v7khnNM0fmFg/FK%2B8yzNQOtW74ehtZyQaCBwrcU8thcLwajooH9C1GeohlG1tX6PCkEWEzgne7TsIH6Kx2H0exC5yk%2BX1elYOXY7IUO2R%2BkMdboP939gSZqJNKbRdZe7/jC6wq7Lzyv2AHiIWoXWBn542%2BEVddVz9OeCLTz980Bl3rsfFvRdPLyvBA%3D%3D"
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie,
        'Host': 'api.m.jd.com',
        'User-Agent': 'okhttp/3.12.1;jdmall;android;version/10.1.3;build/90017'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    try:
        res = response.json()
        if "感谢参与体验" in res['message']:
            print(f"🎉恭喜获得50豆")
        elif "已重复" in res['message']:
            print("⛈已经领过了！")
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



