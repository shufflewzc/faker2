#!/bin/env python3
# -*- coding: utf-8 -*
'''
感谢Curtin提供的其他脚本供我参考
感谢aburd ch大佬的指导
项目名称:xF_jd_beauty_plant.py
Author: 一风一扬
功能：健康社区-种植园自动任务
Date: 2022-1-4
cron: 10 9,11,15,21 * * * jd_beauty_plant.py
new Env('化妆馆-种植园自动任务');


活动入口：25:/￥2EaeU74Gz07gJ%

教程：该活动与京东的ck通用，所以只需要填写第几个号运行改脚本就行了。

青龙变量填写export plant_cookie="1"，代表京东CK的第一个号执行该脚本

多账号用&隔开，例如export plant_cookie="1&2"，代表京东CK的第一、二个号执行该脚本。这样做，JD的ck过期就不用维护两次了，所以做出了更新。

青龙变量export choose_plant_id="true",表示自己选用浇水的ID，适用于种植了多个产品的人，默认为false，如果是false仅适用于种植了一个产品的人。
对于多账号的，只要有一个账号种植多个产品，都必须为true才能浇水。如果choose_plant_id="false"，planted_id可以不填写变量值。
青龙变量export planted_id = 'xxxx'，表示需要浇水的id，单账号可以先填写export planted_id = '111111'，export choose_plant_id="true"，运行一次脚本
日志输出会有planted_id，然后再重新修改export planted_id = 'xxxxxx'。多个账号也一样，如果2个账号export planted_id = '111111&111111'
3个账号export planted_id = '111111&111111&111111'，以此类推。
注意：planted_id和ck位置要对应。而且你有多少个账号，就得填多少个planted_id，首次111111填写时，为6位数。
例如export plant_cookie="xxxx&xxxx&xxx"，那export planted_id = "111111&111111&111111",也要写满3个id，这样才能保证所有账号都能跑

https://github.com/jsNO1/e
'''

######################################################以下代码请不要乱改######################################

UserAgent = ''
account = ''
cookie = ''
cookies = []
choose_plant_id = 'false'
planted_id = ''
shop_id = ''
beauty_plant_exchange = 'false'
planted_ids = []

import requests
import time, datetime
import requests, re, os, sys, random, json
from urllib.parse import quote, unquote
import threading
import urllib3

# urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

requests.packages.urllib3.disable_warnings ()

today = datetime.datetime.now ().strftime ('%Y-%m-%d')
tomorrow = (datetime.datetime.now () + datetime.timedelta (days=1)).strftime ('%Y-%m-%d')

nowtime = datetime.datetime.now ().strftime ('%Y-%m-%d %H:%M:%S.%f8')

time1 = '21:00:00.00000000'
time2 = '23:00:00.00000000'

flag_time1 = '{} {}'.format (today, time1)
flag_time2 = '{} {}'.format (today, time2)

pwd = os.path.dirname (os.path.abspath (__file__)) + os.sep
path = pwd + "env.sh"

sid = ''.join (random.sample ('123456789abcdef123456789abcdef123456789abcdef123456789abcdef', 32))

sid_ck = ''.join (random.sample ('123456789abcdef123456789abcdef123456789abcdef123456789abcdefABCDEFGHIJKLMNOPQRSTUVWXYZ', 43))


def printT(s):
    print ("[{0}]: {1}".format (datetime.datetime.now ().strftime ("%Y-%m-%d %H:%M:%S"), s))
    sys.stdout.flush ()


def getEnvs(label):
    try:
        if label == 'True' or label == 'yes' or label == 'true' or label == 'Yes':
            return True
        elif label == 'False' or label == 'no' or label == 'false' or label == 'No':
            return False
    except:
        pass
    try:
        if '.' in label:
            return float (label)
        elif '&' in label:
            return label.split ('&')
        elif '@' in label:
            return label.split ('@')
        else:
            return int (label)
    except:
        return label


# 获取v4环境 特殊处理
try:
    with open (v4f, 'r', encoding='utf-8') as v4f:
        v4Env = v4f.read ()
    r = re.compile (r'^export\s(.*?)=[\'\"]?([\w\.\-@#&=_,\[\]\{\}\(\)]{1,})+[\'\"]{0,1}$',
                    re.M | re.S | re.I)
    r = r.findall (v4Env)
    curenv = locals ()
    for i in r:
        if i[0] != 'JD_COOKIE':
            curenv[i[0]] = getEnvs (i[1])
except:
    pass

#############      在pycharm测试ql环境用，实际用下面的代码运行      #########
# with open(path, "r+", encoding="utf-8") as f:
#     ck = f.read()
#     if "JD_COOKIE" in ck:
#         r = re.compile (r"pt_key=.*?pt_pin=.*?;", re.M | re.S | re.I)
#         cookies = r.findall (ck)
#         # print(cookies)
#         # cookies = cookies[0]
#         # print(cookies)
#         # cookies = cookies.split ('&')
#         printT ("已获取并使用ck环境 Cookie")
#######################################################################


if "plant_cookie" in os.environ:
    if len (os.environ["plant_cookie"]) == 1:
        is_ck = int(os.environ["plant_cookie"])
        cookie1 = os.environ["JD_COOKIE"].split('&')
        cookie = cookie1[is_ck-1]
        printT ("已获取并使用Env环境cookie")
    elif len (os.environ["plant_cookie"]) > 1:
        cookies1 = []
        cookies1 = os.environ["JD_COOKIE"]
        cookies1 = cookies1.split ('&')
        is_ck = os.environ["plant_cookie"].split('&')
        for i in is_ck:
            cookies.append(cookies1[int(i)-1])
        printT ("已获取并使用Env环境plant_cookies")
else:
    printT ("变量plant_cookie未填写")
    exit (0)

if "choose_plant_id" in os.environ:
    choose_plant_id = os.environ["choose_plant_id"]
    printT (f"已获取并使用Env环境choose_plant_id={choose_plant_id}")
else:
    printT ("变量choose_plant_id未填写,默认为false只种植了一个，如果种植了多个，请填写改变量planted_id")

if "planted_id" in os.environ:
    if len (os.environ["planted_id"]) > 8:
        planted_ids = os.environ["planted_id"]
        planted_ids = planted_ids.split ('&')
    else:
        planted_id = os.environ["planted_id"]
        printT (f"已获取并使用Env环境planted_id={planted_id}")
else:
    printT ("变量planted_id未填写,默认为false只种植了一个，如果种植了多个，请填写改变量planted_id")

if "beauty_plant_exchange" in os.environ:
    beauty_plant_exchange = os.environ["beauty_plant_exchange"]
    printT (f"已获取并使用Env环境beauty_plant_exchange={beauty_plant_exchange}")
else:
    printT ("变量beauty_plant_exchange未填写,默认为false，不用美妆币兑换肥料")


def userAgent():
    """
    随机生成一个UA
    :return: jdapp;iPhone;9.4.8;14.3;xxxx;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1
    """
    if not UserAgent:
        uuid = ''.join (random.sample ('123456789abcdef123456789abcdef123456789abcdef123456789abcdef', 40))
        addressid = ''.join (random.sample ('1234567898647', 10))
        iosVer = ''.join (
            random.sample (["14.5.1", "14.4", "14.3", "14.2", "14.1", "14.0.1", "13.7", "13.1.2", "13.1.1"], 1))
        iosV = iosVer.replace ('.', '_')
        iPhone = ''.join (random.sample (["8", "9", "10", "11", "12", "13"], 1))
        ADID = ''.join (random.sample ('0987654321ABCDEF', 8)) + '-' + ''.join (
            random.sample ('0987654321ABCDEF', 4)) + '-' + ''.join (
            random.sample ('0987654321ABCDEF', 4)) + '-' + ''.join (
            random.sample ('0987654321ABCDEF', 4)) + '-' + ''.join (random.sample ('0987654321ABCDEF', 12))
        return f'jdapp;iPhone;10.0.4;{iosVer};{uuid};network/wifi;ADID/{ADID};supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone{iPhone},1;addressid/{addressid};supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS {iosV} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1'
    else:
        return UserAgent


## 获取通知服务
class msg (object):
    def __init__(self, m=''):
        self.str_msg = m
        self.message ()

    def message(self):
        global msg_info
        printT (self.str_msg)
        try:
            msg_info = "{}\n{}".format (msg_info, self.str_msg)
        except:
            msg_info = "{}".format (self.str_msg)
        sys.stdout.flush ()  # 这代码的作用就是刷新缓冲区。
        # 当我们打印一些字符时，并不是调用print函数后就立即打印的。一般会先将字符送到缓冲区，然后再打印。
        # 这就存在一个问题，如果你想等时间间隔的打印一些字符，但由于缓冲区没满，不会打印。就需要采取一些手段。如每次打印后强行刷新缓冲区。

    def getsendNotify(self, a=0):
        if a == 0:
            a += 1
        try:
            url = 'https://gitee.com/curtinlv/Public/raw/master/sendNotify.py'
            response = requests.get (url)
            if 'curtinlv' in response.text:
                with open ('sendNotify.py', "w+", encoding="utf-8") as f:
                    f.write (response.text)
            else:
                if a < 5:
                    a += 1
                    return self.getsendNotify (a)
                else:
                    pass
        except:
            if a < 5:
                a += 1
                return self.getsendNotify (a)
            else:
                pass

    def main(self):
        global send
        cur_path = os.path.abspath (os.path.dirname (__file__))
        sys.path.append (cur_path)
        if os.path.exists (cur_path + "/sendNotify.py"):
            try:
                from sendNotify import send
            except:
                self.getsendNotify ()
                try:
                    from sendNotify import send
                except:
                    printT ("加载通知服务失败~")
        else:
            self.getsendNotify ()
            try:
                from sendNotify import send
            except:
                printT ("加载通知服务失败~")
        ###################


msg ().main ()


def setName(cookie):
    try:
        r = re.compile (r"pt_pin=(.*?);")  # 指定一个规则：查找pt_pin=与;之前的所有字符,但pt_pin=与;不复制。r"" 的作用是去除转义字符.
        userName = r.findall (cookie)  # 查找pt_pin=与;之前的所有字符，并复制给r，其中pt_pin=与;不复制。
        # print (userName)
        userName = unquote (userName[0])  # r.findall(cookie)赋值是list列表，这个赋值为字符串
        # print(userName)
        return userName
    except Exception as e:
        print (e, "cookie格式有误！")
        exit (2)


# 获取ck
def get_ck(token, sid_ck, account):
    try:
        url = 'https://api.m.jd.com/client.action?functionId=isvObfuscator'
        headers = {
            # 'Connection': 'keep-alive',
            'accept': '*/*',
            "cookie": f"{token}",
            'host': 'api.m.jd.com',
            # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'user-Agent': "JD4iPhone/167922%20(iPhone;%20iOS;%20Scale/2.00)",
            'accept-Encoding': 'gzip, deflate, br',
            'accept-Language': 'zh-Hans-CN;q=1',
            "content-type": "application/x-www-form-urlencoded",
            # "content-length":"1348",
        }
        timestamp = int (round (time.time () * 1000))
        timestamp1 = int (timestamp / 1000)
        data = r'body=%7B%22url%22%3A%22https%3A%5C/%5C/xinruismzd-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&build=167922&client=apple&clientVersion=10.3.2&d_brand=apple&d_model=iPhone12%2C1&ef=1&eid=eidI4a9081236as4w7JpXa5zRZuwROIEo3ORpcOyassXhjPBIXtrtbjusqCxeW3E1fOtHUlGhZUCur1Q1iocDze1pQ9jBDGfQs8UXxMCTz02fk0RIHpB&ep=%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22screen%22%3A%22ENS4AtO3EJS%3D%22%2C%22wifiBssid%22%3A%22' + f"{sid_ck}" + r'%3D%22%2C%22osVersion%22%3A%22CJUkCK%3D%3D%22%2C%22area%22%3A%22CJvpCJY1DV80ENY2XzK%3D%22%2C%22openudid%22%3A%22Ytq3YtKyDzO5CJuyZtu4CWSyZtC0Ytc1CJLsDwC5YwO0YtS5CNrsCK%3D%3D%22%2C%22uuid%22%3A%22aQf1ZRdxb2r4ovZ1EJZhcxYlVNZSZz09%22%7D%2C%22ts%22%3A1642002985%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D&ext=%7B%22prstate%22%3A%220%22%2C%22pvcStu%22%3A%221%22%7D&isBackground=N&joycious=88&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&partner=apple&rfs=0000&scope=01&sign=946db60626658b250cf47aafb6f67691&st=1642002999847&sv=112&uemps=0-0&uts=0f31TVRjBSu3kkqwe7t25AkQCKuzV3pz8JrojVuU0630g%2BkZigs9kTwRghT26sE72/e92RRKan/%2B9SRjIJYCLuhew91djUwnIY47k31Rwne/U1fOHHr9FmR31X03JKJjwao/EC1gy4fj7PV1Co0ZOjiCMTscFo/8id2r8pCHYMZcaeH3yPTLq1MyFF3o3nkStM/993MbC9zim7imw8b1Fg%3D%3D'
        # data = '{"token":"AAFh3ANjADAPSunyKSzXTA-UDxrs3Tn9hoy92x4sWmVB0Kv9ey-gAMEdJaSDWLWtnMX8lqLujBo","source":"01"}'
        # print(data)
        response = requests.post (url=url, verify=False, headers=headers, data=data)
        result = response.json ()
        # print(result)
        access_token = result['token']
        # print(access_token)
        return access_token
    except Exception as e:
        msg ("账号【{0}】获取ck失败，cookie过期".format (account))


# 获取Authorization
def get_Authorization(access_token, account):
    try:
        url = 'https://xinruimz-isv.isvjcloud.com/papi/auth'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/x.jd-school-raffle.v1+json',
            "Authorization": 'Bearer undefined',
            'Referer': 'https://xinruimz-isv.isvjcloud.com/plantation/logined_jd/',
            'Host': 'xinruimz-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'User-Agent': userAgent (),
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            "Origin": "https://xinruimz-isv.isvjcloud.com",
            "Content-Type": "application/json;charset=utf-8",

        }
        data = '{"token":"' + f"{access_token}" + r'","source":"01"}'
        # print(data)
        response = requests.post (url=url, verify=False, headers=headers, data=data)
        result = response.json ()
        print (result)
        access_token = result['access_token']
        access_token = r"Bearer " + access_token
        # print(access_token)
        return access_token
    except Exception as e:
        msg ("账号【{0}】获取Authorization失败，cookie过期".format (account))


# 获取已种植的信息
def get_planted_info(cookie, sid, account):
    name_list = []
    planted_id_list = []
    position_list = []
    shop_id_list = []
    url = 'https://xinruimz-isv.isvjcloud.com/papi/get_home_info'
    headers = {
        'Connection': 'keep-alive',
        'Accept': 'application/x.jd-school-raffle.v1+json',
        "Authorization": cookie,
        'Referer': f'https://xinruimz-isv.isvjcloud.com/plantation/?sid={sid}&un_area=19_1655_4866_0',
        'Host': 'xinruimz-isv.isvjcloud.com',
        # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
        'User-Agent': userAgent (),
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
    }
    response = requests.get (url=url, verify=False, headers=headers)
    result = response.json ()
    # print(result)
    planted_list = result['plant_info']
    # print(planted_list)
    for i in range (len (planted_list)):
        try:
            name = result['plant_info'][f'{i + 1}']['data']['name']
            planted_id = result['plant_info'][f'{i + 1}']['data']['id']
            position = result['plant_info'][f'{i + 1}']['data']['position']
            shop_id = result['plant_info'][f'{i + 1}']['data']['shop_id']
            # print(name,planted_id,position,shop_id)
            name_list.append (name)
            planted_id_list.append (planted_id)
            position_list.append (position)
            shop_id_list.append (shop_id)
            print (f"账号{account}种植的种子为", name, "planted_id:", planted_id, ",shop_id:", shop_id)
        except Exception as e:
            pass
    return name_list, position_list, shop_id_list, planted_id_list


# 领取每日水滴
def get_water(cookie, position, sid, account):
    try:
        j = 0
        url = 'https://xinruimz-isv.isvjcloud.com/papi/collect_water'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/x.jd-school-raffle.v1+json',
            "Authorization": cookie,
            'Referer': f'https://xinruimz-isv.isvjcloud.com/plantation/?sid={sid}&un_area=19_1655_4866_0',
            'Host': 'xinruimz-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'User-Agent': userAgent (),
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            "Content-Type": "application/json;charset=utf-8",
        }
        for i in position:
            data = r'{"position":' + f"{i}" + r'}'
            response = requests.post (url=url, verify=False, headers=headers, data=data)
            # print(response.status_code)
            if response.status_code == 204:
                j += 1
                total = j * 10
        if response.status_code == 204:
            msg ("账号【{0}】成功领取每日水滴{1}".format (account, total))

    except Exception as e:
        msg ("账号【{0}】领取每日水滴失败，可能是cookie过期".format (account))


# 领取每日肥料
def get_fertilizer(cookie, shop_id, account):
    try:
        j = 0
        url = 'https://xinruimz-isv.isvjcloud.com/papi/collect_fertilizer'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/x.jd-school-raffle.v1+json',
            "Authorization": cookie,
            'Referer': 'https://xinruimz-isv.isvjcloud.com/plantation/shop_index/?shop_id=12&channel=index',
            'Host': 'xinruimz-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'User-Agent': userAgent (),
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            "Content-Type": "application/json;charset=utf-8",
        }
        for i in shop_id:
            data = r'{"shop_id":' + f"{i}" + r'}'
            response = requests.post (url=url, verify=False, headers=headers, data=data)
            if response.status_code == 204:
                j += 1
                total = j * 10
        if response.status_code == 204:
            msg ("账号【{0}】成功领取每日肥料{1}".format (account, total))

    except Exception as e:
        msg ("账号【{0}】领取每日肥料失败，可能是cookie过期".format (account))


# 获取任务信息
def get_task(cookie, account):
    try:
        taskName_list = []
        taskId_list = []
        taskName_list2 = []
        taskId_list2 = []
        taskName_list3 = []
        taskId_list3 = []
        url = 'https://xinruimz-isv.isvjcloud.com/papi/water_task_info'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/x.jd-school-raffle.v1+json',
            "Authorization": cookie,
            'Referer': 'https://xinruimz-isv.isvjcloud.com/plantation/shop_index/?shop_id=12&channel=index',
            'Host': 'xinruimz-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'User-Agent': userAgent (),
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            "Content-Type": "application/json;charset=utf-8",
        }
        response = requests.get (url=url, verify=False, headers=headers)
        result = response.json ()
        # print(result)
        task_list = result['shops']
        task_list2 = result['meetingplaces']
        task_list3 = result['prodcuts']  # 浏览加购
        # print(task_list)
        for i in range (len (task_list)):
            try:
                taskName = task_list[i]['name']
                taskId = task_list[i]['id']
                taskId_list.append (taskId)
                taskName_list.append (taskName)
            except Exception as e:
                print (e)
        for i in range (len (task_list2)):
            try:
                taskName2 = task_list2[i]['name']
                taskId2 = task_list2[i]['id']
                taskId_list2.append (taskId2)
                taskName_list2.append (taskName2)
            except Exception as e:
                print (e)
        for i in range (len (task_list3)):
            try:
                taskName3 = task_list3[i]['name']
                taskId3 = task_list3[i]['id']
                taskId_list3.append (taskId3)
                taskName_list3.append (taskName3)
            except Exception as e:
                print (e)
        # print(taskName_list,taskId_list,taskName_list2,taskId_list2,taskName_list3,taskId_list3)
        return taskName_list, taskId_list, taskName_list2, taskId_list2, taskName_list3, taskId_list3
    except Exception as e:
        print (e)
        message = result['message']
        if "非法店铺" in message:
            msg ("【账号{0}】种子过期，请重新种植".format (account))


# 获取任务信息
def get_fertilizer_task(cookie, shop_id, account):
    try:
        # taskName_list = []
        # taskId_list = []
        taskName_list2 = []
        taskId_list2 = []
        taskName_list3 = []
        taskId_list3 = []
        taskName_list4 = []
        taskId_list4 = []
        url = f'https://xinruimz-isv.isvjcloud.com/papi/fertilizer_task_info?shop_id={shop_id}'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/x.jd-school-raffle.v1+json',
            "Authorization": cookie,
            'Referer': f'https://xinruimz-isv.isvjcloud.com/plantation/shop_index/?shop_id={shop_id}&channel=index',
            'Host': 'xinruimz-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'User-Agent': userAgent (),
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            # "Content-Type": "application/json;charset=utf-8",
        }
        response = requests.get (url=url, verify=False, headers=headers)
        result = response.json ()
        # print(result)
        # task_list = result['shops']
        task_list2 = result['meetingplaces']
        task_list3 = result['prodcuts']  # 浏览加购
        task_list4 = result['live']  # 浏览直播
        # print(task_list)
        # for i in range (len (task_list)):
        #     try:
        #         taskName = task_list[i]['name']
        #         taskId = task_list[i]['id']
        #         taskId_list.append(taskId)
        #         taskName_list.append(taskName)
        #     except Exception as e:
        #         print(e)
        for i in range (len (task_list2)):
            try:
                taskName2 = task_list2[i]['name']
                taskId2 = task_list2[i]['id']
                taskId_list2.append (taskId2)
                taskName_list2.append (taskName2)
            except Exception as e:
                print (e)
        for i in range (len (task_list3)):
            try:
                taskName3 = task_list3[i]['name']
                taskId3 = task_list3[i]['id']
                taskId_list3.append (taskId3)
                taskName_list3.append (taskName3)
            except Exception as e:
                print (e)
        for i in range (len (task_list4)):
            try:
                taskName4 = task_list4[i]['name']
                taskId4 = task_list4[i]['id']
                taskId_list4.append (taskId4)
                taskName_list4.append (taskName4)
            except Exception as e:
                print (e)
        # print(taskName_list,taskId_list,taskName_list2,taskId_list2,taskName_list3,taskId_list3)
        return taskName_list2, taskId_list2, taskName_list3, taskId_list3, taskName_list4, taskId_list4
    except Exception as e:
        print (e)
        message = result['message']
        if "非法店铺" in message:
            msg ("【账号{0}】种子过期，请重新种植".format (account))


# 做任务1
def do_task1(cookie, taskName, taskId, account):
    try:
        url = f'https://xinruimz-isv.isvjcloud.com/papi/water_shop_view?shop_id={taskId}'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/x.jd-school-raffle.v1+json',
            "Authorization": cookie,
            'Referer': 'https://xinruimz-isv.isvjcloud.com/plantation/shop_index/?shop_id=12&channel=index',
            'Host': 'xinruimz-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'User-Agent': userAgent (),
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            "Content-Type": "application/json;charset=utf-8",
        }
        response = requests.get (url=url, verify=False, headers=headers)  # data中有汉字，需要encode为utf-8
        result = response.json ()
        print (result)
        score = result['inc']
        print ("账号【{0}】执行浏览任务【{1}】等待10秒".format (account, taskName))
        msg ("账号【{0}】执行浏览任务【{1}】成功，获取【{2}】水滴".format (account, taskName, score))
        time.sleep (10)
    except Exception as e:
        print (e)
        time.sleep (1)


# 做浏览任务
def do_task2(cookie, taskName, taskId, account):
    try:
        url = f'https://xinruimz-isv.isvjcloud.com/papi/water_meetingplace_view?meetingplace_id={taskId}'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/x.jd-school-raffle.v1+json',
            "Authorization": cookie,
            'Referer': 'https://xinruimz-isv.isvjcloud.com/plantation/shop_index/?shop_id=12&channel=index',
            'Host': 'xinruimz-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'User-Agent': userAgent (),
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            "Content-Type": "application/json;charset=utf-8",
        }
        response = requests.get (url=url, verify=False, headers=headers)  # data中有汉字，需要encode为utf-8
        result = response.json ()
        print (result)
        score = result['inc']
        print ("账号【{0}】执行浏览任务【{1}】等待10秒".format (account, taskName))
        msg ("账号【{0}】执行浏览任务【{1}】成功，获取【{2}】水滴".format (account, taskName, score))
        time.sleep (10)
    except Exception as e:
        print (e)
        time.sleep (1)


# 浏览加购
def do_task3(cookie, taskName, taskId, sid, account):
    try:
        url = f'https://xinruimz-isv.isvjcloud.com/papi/water_product_view?product_id={taskId}'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/x.jd-school-raffle.v1+json',
            "Authorization": cookie,
            'Referer': f'https://xinruimz-isv.isvjcloud.com/plantation/?sid={sid}&un_area=19_1655_4866_0',
            'Host': 'xinruimz-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'User-Agent': userAgent (),
            # 'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            # "Content-Type": "application/json;charset=utf-8",
        }
        response = requests.get (url=url, verify=False, headers=headers)  # data中有汉字，需要encode为utf-8
        result = response.json ()
        print (result)
        score = result['inc']
        print ("账号【{0}】执行浏览加购【{1}】等待10秒".format (account, taskName))
        msg ("账号【{0}】执行浏览加购【{1}】成功，获取【{2}】水滴".format (account, taskName, score))
        time.sleep (10)
    except Exception as e:
        print (e)
        time.sleep (1)


# 施肥中的任务-浏览关注
def do_fertilizer_task(cookie, shop_id, account):
    try:
        url = f'https://xinruimz-isv.isvjcloud.com/papi/fertilizer_shop_view?shop_id={shop_id}'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/x.jd-school-raffle.v1+json',
            "Authorization": cookie,
            'Referer': f'https://xinruimz-isv.isvjcloud.com/plantation/shop_index/?shop_id={shop_id}&channel=index',
            'Host': 'xinruimz-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'User-Agent': userAgent (),
            # 'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            # "Content-Type": "application/json;charset=utf-8",
        }
        while True:
            response = requests.get (url=url, verify=False, headers=headers)  # data中有汉字，需要encode为utf-8
            result = response.json ()
            print (result)
            score = result['inc']
            print ("账号【{0}】执行【浏览关注】等待10秒".format (account))
            msg ("账号【{0}】执行【浏览关注】任务成功，获取【{1}】肥料".format (account, score))
            time.sleep (10)
    except Exception as e:
        print (e)
        time.sleep (1)


# 施肥中的任务-浏览
def do_fertilizer_task2(cookie, name, meetingplace_id, shop_id, account):
    try:
        url = f'https://xinruimz-isv.isvjcloud.com/papi/fertilizer_meetingplace_view?meetingplace_id={meetingplace_id}&shop_id={shop_id}'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/x.jd-school-raffle.v1+json',
            "Authorization": cookie,
            'Referer': f'https://xinruimz-isv.isvjcloud.com/plantation/shop_index/?shop_id={shop_id}&channel=index',
            'Host': 'xinruimz-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'User-Agent': userAgent (),
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            # "Content-Type": "application/json;charset=utf-8",
        }
        response = requests.get (url=url, verify=False, headers=headers)  # data中有汉字，需要encode为utf-8
        result = response.json ()
        print (result)
        score = result['inc']
        print ("账号【{0}】执行浏览关注{1}等待10秒".format (account, name))
        msg ("账号【{0}】执行浏览关注{1}任务成功，获取【{2}】肥料".format (account, name, score))
        time.sleep (10)
    except Exception as e:
        print (e)
        time.sleep (1)


# 施肥中的任务-加购
def do_fertilizer_task3(cookie, name, product_id, shop_id, account):
    try:
        url = f'https://xinruimz-isv.isvjcloud.com/papi/fertilizer_product_view?product_id={product_id}&shop_id={shop_id}'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/x.jd-school-raffle.v1+json',
            "Authorization": cookie,
            'Referer': f'https://xinruimz-isv.isvjcloud.com/plantation/shop_index/?shop_id={shop_id}&channel=index',
            'Host': 'xinruimz-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'User-Agent': userAgent (),
            # 'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            # "Content-Type": "application/json;charset=utf-8",
        }
        while True:
            response = requests.get (url=url, verify=False, headers=headers)  # data中有汉字，需要encode为utf-8
            result = response.json ()
            print (result)
            score = result['inc']
            print ("账号【{0}】执行浏览并加购{1}等待10秒".format (account, name))
            msg ("账号【{0}】执行浏览并加购{1}任务成功，获取【{2}】肥料".format (account, name, score))
            time.sleep (10)
    except Exception as e:
        print (e)
        time.sleep (1)


# 施肥中的任务-观看其他小样
def do_fertilizer_task4(cookie, shop_id, account):
    try:
        url = f'https://xinruimz-isv.isvjcloud.com/papi/fertilizer_sample_view?shop_id={shop_id}'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/x.jd-school-raffle.v1+json',
            "Authorization": cookie,
            'Referer': f'https://xinruimz-isv.isvjcloud.com/plantation/shop_index/?shop_id={shop_id}&channel=index',
            'Host': 'xinruimz-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'User-Agent': userAgent (),
            # 'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            # "Content-Type": "application/json;charset=utf-8",
        }
        response = requests.get (url=url, verify=False, headers=headers)  # data中有汉字，需要encode为utf-8
        result = response.json ()
        print (result)
        score = result['inc']
        print ("账号【{0}】执行【观看其他小样】等待10秒".format (account))
        msg ("账号【{0}】执行【观看其他小样】任务成功，获取【{1}】肥料".format (account, score))
        time.sleep (10)
    except Exception as e:
        print (e)
        time.sleep (1)


# 施肥中的任务-浏览化妆馆
def do_fertilizer_task5(cookie, shop_id, account):
    try:
        url = f'https://xinruimz-isv.isvjcloud.com/papi/fertilizer_chanel_view?shop_id={shop_id}'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/x.jd-school-raffle.v1+json',
            "Authorization": cookie,
            'Referer': f'https://xinruimz-isv.isvjcloud.com/plantation/shop_index/?shop_id={shop_id}&channel=index',
            'Host': 'xinruimz-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'User-Agent': userAgent (),
            # 'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            # "Content-Type": "application/json;charset=utf-8",
        }
        response = requests.get (url=url, verify=False, headers=headers)  # data中有汉字，需要encode为utf-8
        result = response.json ()
        print (result)
        score = result['inc']
        print ("账号【{0}】执行【浏览化妆馆】等待10秒".format (account))
        msg ("账号【{0}】执行【浏览化妆馆】任务成功，获取【{1}】肥料".format (account, score))
        time.sleep (10)
    except Exception as e:
        print (e)
        time.sleep (1)


# 施肥中的任务-美妆币兑换，每天5次
def do_fertilizer_task6(cookie, shop_id, account):
    try:
        url = f'https://xinruimz-isv.isvjcloud.com/papi/fertilizer_exchange?shop_id={shop_id}'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/x.jd-school-raffle.v1+json',
            "Authorization": cookie,
            'Referer': f'https://xinruimz-isv.isvjcloud.com/plantation/shop_index/?shop_id={shop_id}&channel=index',
            'Host': 'xinruimz-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'User-Agent': userAgent (),
            # 'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            # "Content-Type": "application/json;charset=utf-8",
        }
        for i in range (5):
            response = requests.get (url=url, verify=False, headers=headers)  # data中有汉字，需要encode为utf-8
            result = response.json ()
            # print(result)
            score = result['inc']
            print ("账号【{0}】【shop_id:{1}】正在【兑换肥料】等待10秒".format (account, shop_id))
            msg ("账号【{0}】【shop_id:{2}】执行【兑换肥料】任务成功，获取【{1}】肥料".format (account, score, shop_id))
            time.sleep (10)
    except Exception as e:
        print (e)
        msg ("账号【{0}】【shop_id:{1}】肥料兑换已达上限".format (account, shop_id))
        time.sleep (1)


# 浇水
def watering(cookie, plant_id, sid, account):
    try:
        url = 'https://xinruimz-isv.isvjcloud.com/papi/watering'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/x.jd-school-raffle.v1+json',
            "Authorization": cookie,
            'Referer': f'https://xinruimz-isv.isvjcloud.com/plantation/?sid={sid}&un_area=19_1655_4866_0',
            'Host': 'xinruimz-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'User-Agent': userAgent (),
            # 'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            "Content-Type": "application/json;charset=utf-8",
        }
        data = r'{"plant_id":' + f"{plant_id}" + r'}'
        while True:
            response = requests.post (url=url, verify=False, headers=headers,
                                      data=data.encode ())  # data中有汉字，需要encode为utf-8
            result = response.json ()
            # print(result)
            level = result['level']  # 当前等级
            complete_level = result['complete_level']  # 完成等级
            msg ("【账号{0}】【plant_id:{3}】成功浇水10g，当前等级{1}，种子成熟等级为{2}".format (account, level, complete_level, plant_id))
            time.sleep (5)

    except Exception as e:
        print(e)
        # pass


# 施肥
def fertilization(cookie, plant_id, shop_id, account):
    url = 'https://xinruimz-isv.isvjcloud.com/papi/fertilization'
    headers = {
        'Connection': 'keep-alive',
        'Accept': 'application/x.jd-school-raffle.v1+json',
        "Authorization": cookie,
        'Referer': f'https://xinruimz-isv.isvjcloud.com/plantation/shop_index/?shop_id={shop_id}&channel=index',
        'Host': 'xinruimz-isv.isvjcloud.com',
        # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
        'User-Agent': userAgent (),
        # 'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        "Content-Type": "application/json;charset=utf-8",
    }
    data = r'{"plant_id":' + f"{plant_id}" + r'}'
    i = 1
    while True:
        try:
            response = requests.post (url=url, verify=False, headers=headers, data=data)  # data中有汉字，需要encode为utf-8
            result = response.json ()
            # print(result)
            level = result['level']  # 当前等级
            complete_level = result['complete_level']  # 完成等级
            printT ("【账号{0}】【plant_id:{3}】成功施肥10g，当前等级{1}，种子成熟等级为{2}".format (account, level, complete_level, plant_id))
            time.sleep (5)
            i += 1

        except Exception as e:
            # print(e)
            message = result['message']
            total = i * 10
            if "肥料不足" in message:
                msg("【账号{0}】【plant_id:{1}】本次一共施肥{2}g".format (account, plant_id,total))
                printT ("【账号{0}】【plant_id:{1}】肥料不足10g".format (account, plant_id))
                break


def start():
    global cookie, cookies
    print (f"\n【准备开始...】\n")
    nowtime = datetime.datetime.now ().strftime ('%Y-%m-%d %H:%M:%S.%f8')
    if cookie != '':
        account = setName (cookie)
        access_token = get_ck (cookie, sid_ck, account)
        cookie = get_Authorization (access_token, account)
        name_list, position_list, shop_id_list, planted_id_list = get_planted_info (cookie, sid, account)
        taskName_list, taskId_list, taskName_list2, taskId_list2, taskName_list3, taskId_list3 = get_task (cookie,account)
        get_water (cookie, position_list, sid, account)
        get_fertilizer (cookie, shop_id_list, account)
        for i, j in zip (taskName_list, taskId_list):
            do_task1 (cookie, i, j, account)
        for i, j in zip (taskName_list2, taskId_list2):
            do_task2 (cookie, i, j, account)
        for i, j in zip (taskName_list3, taskId_list3):
            do_task3 (cookie, i, j, sid, account)

        flag = 0
        for i in shop_id_list:
            do_fertilizer_task (cookie, i, account)  # 浏览关注
        for k in shop_id_list:
            taskName_list2, taskId_list2, taskName_list3, taskId_list3, taskName_list4, taskId_list4 = get_fertilizer_task (cookie, k, account)
            do_fertilizer_task4 (cookie, k, account)
            do_fertilizer_task5 (cookie, k, account)
            if beauty_plant_exchange == 'true':
                do_fertilizer_task6 (cookie, k, account)
            for i, j in zip (taskName_list2, taskId_list2):
                print (i, j, k)
                do_fertilizer_task2 (cookie, i, j, k, account)  # 浏览
            for i, j in zip (taskName_list3, taskId_list3):
                print (i, j, k)
                do_fertilizer_task3 (cookie, i, j, k, account)  # 加购

            if choose_plant_id == 'false':
                for i in planted_id_list:
                    watering (cookie, i, sid, account)
                    fertilization (cookie, i, k, account)
            else:
                fertilization (cookie, planted_id_list[flag], k, account)
                watering (cookie, planted_id, sid, account)
            flag += 1

    elif cookies != '':
        for cookie, planted_id in zip (cookies, planted_ids):
            try:
                account = setName (cookie)
                access_token = get_ck (cookie, sid_ck, account)
                cookie = get_Authorization (access_token, account)
                name_list, position_list, shop_id_list, planted_id_list = get_planted_info (cookie, sid, account)
            except Exception as e:
                pass
        for cookie, planted_id in zip (cookies, planted_ids):
            try:
                account = setName (cookie)
                access_token = get_ck (cookie, sid_ck, account)
                cookie = get_Authorization (access_token, account)
                name_list, position_list, shop_id_list, planted_id_list = get_planted_info (cookie, sid, account)
                taskName_list, taskId_list, taskName_list2, taskId_list2, taskName_list3, taskId_list3 = get_task (cookie, account)
                get_water (cookie, position_list, sid, account)
                get_fertilizer (cookie, shop_id_list, account)
                for i, j in zip (taskName_list, taskId_list):
                    do_task1 (cookie, i, j, account)
                for i, j in zip (taskName_list2, taskId_list2):
                    do_task2 (cookie, i, j, account)
                for i, j in zip (taskName_list3, taskId_list3):
                    do_task3 (cookie, i, j, sid, account)

                flag = 0
                for i in shop_id_list:
                    do_fertilizer_task (cookie, i, account)  # 浏览关注
                for k in shop_id_list:
                    taskName_list2, taskId_list2, taskName_list3, taskId_list3, taskName_list4, taskId_list4 = get_fertilizer_task (
                        cookie, k, account)
                    do_fertilizer_task4 (cookie, k, account)
                    do_fertilizer_task5 (cookie, k, account)
                    if beauty_plant_exchange == 'true':
                        do_fertilizer_task6 (cookie, k, account)
                    for i, j in zip (taskName_list2, taskId_list2):
                        print (i, j, k)
                        do_fertilizer_task2 (cookie, i, j, k, account)  # 浏览
                    for i, j in zip (taskName_list3, taskId_list3):
                        print (i, j, k)
                        do_fertilizer_task3 (cookie, i, j, k, account)  # 加购

                    if choose_plant_id == 'false':
                        for i in planted_id_list:
                            fertilization (cookie, i, k, account)
                            watering (cookie, i, sid, account)
                    else:
                        print("【账号{}现在开始施肥】".format(account))
                        fertilization (cookie, planted_id_list[flag], k, account)
                        print ("【账号{}现在开始浇水】".format (account))
                        watering (cookie, planted_id, sid, account)
                    flag += 1
            except Exception as e:
                pass
    else:
        printT ("请检查变量plant_cookie是否已填写")


if __name__ == '__main__':
    printT ("美丽研究院-种植园")
    start ()
    # if '成熟' in msg_info:
    #     send ("美丽研究院-种植园", msg_info)
    if '成功' in msg_info:
        send ("美丽研究院-种植园", msg_info)
