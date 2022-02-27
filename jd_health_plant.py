#!/bin/env python3
# -*- coding: utf-8 -*
'''
感谢Curtin提供的其他脚本供我参考
感谢aburd ch大佬的指导
项目名称:xF_jd_health_plant.py
Author: 一风一扬
功能：健康社区-种植园自动任务
Date: 2022-1-4
cron: 23 11,13,21 * * * jd_health_plant.py
new Env('京东健康社区-种植园自动任务');


活动入口：20:/#1DouT0KAaKuqv%

教程：该活动与京东的ck通用，但是变量我还是独立出来。

青龙变量填写export plant_cookie="xxxx"

多账号用&隔开，例如export plant_cookie="xxxx&xxxx"


青龙变量export charge_targe_id = 'xxxx'，表示需要充能的id，单账号可以先填写export charge_targe_id = '11111'，运行一次脚本
日志输出会有charge_targe_id，然后再重新修改export charge_targe_id = 'xxxxxx'。多个账号也一样，如果2个账号export charge_targe_id = '11111&11111'
3个账号export charge_targe_id = '11111&11111&11111'，以此类推。
注意：charge_targe_id和ck位置要对应。而且你有多少个账号，就得填多少个charge_targe_id，首次11111填写时，为5位数。
例如export plant_cookie="xxxx&xxxx&xxx"，那export charge_targe_id = "11111&11111&11111",也要写满3个id，这样才能保证所有账号都能跑

'''



######################################################以下代码请不要乱改######################################

UserAgent = ''
cookie = ''
account = ''
charge_targe_id = ''
cookies = []
charge_targe_ids = ''

import requests
import time,datetime
import requests,re,os,sys,random,json
from urllib.parse import quote, unquote
import threading
import urllib3
#urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

requests.packages.urllib3.disable_warnings()




today = datetime.datetime.now().strftime('%Y-%m-%d')
tomorrow=(datetime.datetime.now() + datetime.timedelta(days=1)).strftime('%Y-%m-%d')

nowtime = datetime.datetime.now ().strftime ('%Y-%m-%d %H:%M:%S.%f8')

time1 = '21:00:00.00000000'
time2 = '22:00:00.00000000'

flag_time1 = '{} {}'.format (today, time1)
flag_time2 = '{} {}'.format (today, time2)




pwd = os.path.dirname(os.path.abspath(__file__)) + os.sep
path = pwd + "env.sh"

sid = ''.join (random.sample ('123456789abcdef123456789abcdef123456789abcdef123456789abcdef', 32))

sid_ck = ''.join (random.sample ('123456789abcdef123456789abcdef123456789abcdef123456789abcdefABCDEFGHIJKLMNOPQRSTUVWXYZ', 43))



def printT(s):
    print("[{0}]: {1}".format(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), s))
    sys.stdout.flush()

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
            return float(label)
        elif '&' in label:
            return label.split('&')
        elif '@' in label:
            return label.split('@')
        else:
            return int(label)
    except:
        return label

# 获取v4环境 特殊处理
try:
    with open(v4f, 'r', encoding='utf-8') as v4f:
        v4Env = v4f.read()
    r = re.compile(r'^export\s(.*?)=[\'\"]?([\w\.\-@#&=_,\[\]\{\}\(\)]{1,})+[\'\"]{0,1}$',
                   re.M | re.S | re.I)
    r = r.findall(v4Env)
    curenv = locals()
    for i in r:
        if i[0] != 'JD_COOKIE':
            curenv[i[0]] = getEnvs(i[1])
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


cookies1 = []
cookies1 = os.environ["JD_COOKIE"]
cookies = cookies1.split ('&')


def userAgent():
    """
    随机生成一个UA
    :return: jdapp;iPhone;9.4.8;14.3;xxxx;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1
    """
    if not UserAgent:
        uuid = ''.join(random.sample('123456789abcdef123456789abcdef123456789abcdef123456789abcdef', 40))
        addressid = ''.join(random.sample('1234567898647', 10))
        iosVer = ''.join(
            random.sample(["14.5.1", "14.4", "14.3", "14.2", "14.1", "14.0.1", "13.7", "13.1.2", "13.1.1"], 1))
        iosV = iosVer.replace('.', '_')
        iPhone = ''.join(random.sample(["8", "9", "10", "11", "12", "13"], 1))
        ADID = ''.join(random.sample('0987654321ABCDEF', 8)) + '-' + ''.join(
            random.sample('0987654321ABCDEF', 4)) + '-' + ''.join(random.sample('0987654321ABCDEF', 4)) + '-' + ''.join(
            random.sample('0987654321ABCDEF', 4)) + '-' + ''.join(random.sample('0987654321ABCDEF', 12))
        return f'jdapp;iPhone;10.0.4;{iosVer};{uuid};network/wifi;ADID/{ADID};supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone{iPhone},1;addressid/{addressid};supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS {iosV} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1'
    else:
        return UserAgent

## 获取通知服务
class msg(object):
    def __init__(self, m=''):
        self.str_msg = m
        self.message()
    def message(self):
        global msg_info
        printT(self.str_msg)
        try:
            msg_info = "{}\n{}".format(msg_info, self.str_msg)
        except:
            msg_info = "{}".format(self.str_msg)
        sys.stdout.flush()           #这代码的作用就是刷新缓冲区。
                                     # 当我们打印一些字符时，并不是调用print函数后就立即打印的。一般会先将字符送到缓冲区，然后再打印。
                                     # 这就存在一个问题，如果你想等时间间隔的打印一些字符，但由于缓冲区没满，不会打印。就需要采取一些手段。如每次打印后强行刷新缓冲区。
    def getsendNotify(self, a=0):
        if a == 0:
            a += 1
        try:
            url = 'https://gitee.com/curtinlv/Public/raw/master/sendNotify.py'
            response = requests.get(url)
            if 'curtinlv' in response.text:
                with open('sendNotify.py', "w+", encoding="utf-8") as f:
                    f.write(response.text)
            else:
                if a < 5:
                    a += 1
                    return self.getsendNotify(a)
                else:
                    pass
        except:
            if a < 5:
                a += 1
                return self.getsendNotify(a)
            else:
                pass
    def main(self):
        global send
        cur_path = os.path.abspath(os.path.dirname(__file__))
        sys.path.append(cur_path)
        if os.path.exists(cur_path + "/sendNotify.py"):
            try:
                from sendNotify import send
            except:
                self.getsendNotify()
                try:
                    from sendNotify import send
                except:
                    printT("加载通知服务失败~")
        else:
            self.getsendNotify()
            try:
                from sendNotify import send
            except:
                printT("加载通知服务失败~")
        ###################
msg().main()

def setName(cookie):
    try:
        r = re.compile(r"pt_pin=(.*?);")    #指定一个规则：查找pt_pin=与;之前的所有字符,但pt_pin=与;不复制。r"" 的作用是去除转义字符.
        userName = r.findall(cookie)        #查找pt_pin=与;之前的所有字符，并复制给r，其中pt_pin=与;不复制。
        #print (userName)
        userName = unquote(userName[0])     #r.findall(cookie)赋值是list列表，这个赋值为字符串
        #print(userName)
        return userName
    except Exception as e:
        print(e,"cookie格式有误！")
        exit(2)

#获取ck
def get_ck(token,sid_ck,account):
    try:
        url = 'https://api.m.jd.com/client.action?functionId=isvObfuscator'
        headers = {
            # 'Connection': 'keep-alive',
            'accept': '*/*',
            "cookie": f"{token}",
            'host': 'api.m.jd.com',
            # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'user-Agent': userAgent (),
            'accept-Encoding': 'gzip, deflate, br',
            'accept-Language': 'zh-Hans-CN;q=1',
            "content-type":"application/x-www-form-urlencoded",
            # "content-length":"1348",
        }
        timestamp = int (round (time.time () * 1000))
        timestamp1 = int(timestamp / 1000)
        data =r'body=%7B%22url%22%3A%22https%3A%5C/%5C/xinruismzd-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&build=167922&client=apple&clientVersion=10.3.2&d_brand=apple&d_model=iPhone12%2C1&ef=1&eid=eidI4a9081236as4w7JpXa5zRZuwROIEo3ORpcOyassXhjPBIXtrtbjusqCxeW3E1fOtHUlGhZUCur1Q1iocDze1pQ9jBDGfQs8UXxMCTz02fk0RIHpB&ep=%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22screen%22%3A%22ENS4AtO3EJS%3D%22%2C%22wifiBssid%22%3A%22' + f"{sid_ck}" + r'%3D%22%2C%22osVersion%22%3A%22CJUkCK%3D%3D%22%2C%22area%22%3A%22CJvpCJY1DV80ENY2XzK%3D%22%2C%22openudid%22%3A%22Ytq3YtKyDzO5CJuyZtu4CWSyZtC0Ytc1CJLsDwC5YwO0YtS5CNrsCK%3D%3D%22%2C%22uuid%22%3A%22aQf1ZRdxb2r4ovZ1EJZhcxYlVNZSZz09%22%7D%2C%22ts%22%3A1642002985%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D&ext=%7B%22prstate%22%3A%220%22%2C%22pvcStu%22%3A%221%22%7D&isBackground=N&joycious=88&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&partner=apple&rfs=0000&scope=01&sign=946db60626658b250cf47aafb6f67691&st=1642002999847&sv=112&uemps=0-0&uts=0f31TVRjBSu3kkqwe7t25AkQCKuzV3pz8JrojVuU0630g%2BkZigs9kTwRghT26sE72/e92RRKan/%2B9SRjIJYCLuhew91djUwnIY47k31Rwne/U1fOHHr9FmR31X03JKJjwao/EC1gy4fj7PV1Co0ZOjiCMTscFo/8id2r8pCHYMZcaeH3yPTLq1MyFF3o3nkStM/993MbC9zim7imw8b1Fg%3D%3D'
        # data = '{"token":"AAFh3ANjADAPSunyKSzXTA-UDxrs3Tn9hoy92x4sWmVB0Kv9ey-gAMEdJaSDWLWtnMX8lqLujBo","source":"01"}'
        # print(data)
        response = requests.post (url=url, verify=False, headers=headers,data=data)
        result = response.json ()
        # print(result)
        access_token = result['token']
        # print(access_token)
        return access_token
    except Exception as e:
        msg("账号【{0}】获取ck失败，cookie过期".format(account))

#获取Authorization
def get_Authorization(access_token,account):
    try:
        url = 'https://xinruismzd-isv.isvjcloud.com/api/auth'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/json, text/plain, */*',
            "Authorization": 'Bearer undefined',
            'Referer': 'https://xinruismzd-isv.isvjcloud.com/healthy-plant2021/logined_jd/',
            'Host': 'xinruismzd-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'User-Agent': userAgent (),
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            "Origin":"https://xinruismzd-isv.isvjcloud.com",
            "Content-Type":"application/json;charset=utf-8",

        }
        data = '{"token":"'+ f"{access_token}" + r'","source":"01"}'
        # print(data)
        response = requests.post (url=url, verify=False, headers=headers,data=data)
        result = response.json ()
        # print(result)
        access_token = result['access_token']
        access_token = r"Bearer " + access_token
        # print(access_token)
        return access_token
    except Exception as e:
        msg("账号【{0}】获取Authorization失败，活动火爆，请稍后再试".format(account))

#获取已种植的信息
def get_planted_info(cookies,sid,account):
    name_list = []
    planted_id_list = []
    url = 'https://xinruismzd-isv.isvjcloud.com/api/get_home_info'
    headers = {
        'Connection': 'keep-alive',
        'Accept': 'application/json, text/plain, */*',
        "Authorization": cookies,
        'Referer': f'https://xinruismzd-isv.isvjcloud.com/healthy-plant2021/?channel=ddjkicon&sid={sid}&un_area=19_1655_4866_0',
        'Host': 'xinruismzd-isv.isvjcloud.com',
        # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
        'User-Agent': userAgent (),
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
    }
    response = requests.get (url=url, verify=False, headers=headers)
    result = response.json ()
    # print(result)
    planted_list = result['plant']
    # print(planted_list)
    for i in range (len (planted_list)):
        try:
            name = result['plant'][f'{i+1}']['data']['name']
            planted_id = result['plant'][f'{i+1}']['data']['id']
            print(f"【账号{account}】所种植的",f"【{name}】","充能ID为:",planted_id)
            name_list.append(name)
            planted_id_list.append(planted_id)
            global charge_targe_id
            charge_targe_id=str(planted_id)
            break
        except Exception as e:
            pass
    print('\n\n')


#获取早睡打卡
def get_sleep(cookies,sid):
    url = 'https://xinruismzd-isv.isvjcloud.com/api/get_task'
    headers = {
        'Connection': 'keep-alive',
        'Accept': 'application/json, text/plain, */*',
        "Authorization": cookies,
        'Referer': f'https://xinruismzd-isv.isvjcloud.com/healthy-plant2021/?channel=ddjkicon&sid={sid}&un_area=19_1655_4866_0',
        'Host': 'xinruismzd-isv.isvjcloud.com',
        # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
        'User-Agent': userAgent (),
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
    }
    response = requests.get (url=url, verify=False, headers=headers)
    result = response.json ()
   # print(result)
    taskToken_list = result['result']['taskVos']
    for i in range (len (taskToken_list)):
        try:
            taskName = taskToken_list[i]['taskName']
            taskId = taskToken_list[i]['taskId']
            if "早睡" in taskName:
                taskToken = taskToken_list[i]['threeMealInfoVos'][0]['taskToken']
                return taskName,taskId,taskToken
        except Exception as e:
            print (e)


#获取任务信息
def get_task(cookies,sid,account):
    try:
        taskName_list = []
        taskId_list = []
        taskToken_list = []
        url = 'https://xinruismzd-isv.isvjcloud.com/api/get_task'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/json, text/plain, */*',
            "Authorization":cookies,
            'Referer': f'https://xinruismzd-isv.isvjcloud.com/healthy-plant2021/?channel=ddjkicon&sid={sid}&un_area=19_1655_4866_0',
            'Host': 'xinruismzd-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'User-Agent': userAgent (),
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
        }
        response = requests.get(url=url, verify=False, headers=headers)
        result = response.json()
        # print(result)
        task_list = result['result']['taskVos']
        # print(task_list)
        for i in range (len (task_list)):
            try:
                taskName = task_list[i]['taskName']
                taskId = task_list[i]['taskId']
                taskToken = task_list[i]['shoppingActivityVos'][0]['taskToken']
                taskName_list.append(taskName)
                taskId_list.append(taskId)
                taskToken_list.append(taskToken)
            except Exception as e:
                print(e)
        # print(taskName_list, taskId_list, taskToken_list)
        return taskName_list, taskId_list, taskToken_list
    except Exception as e:
        print (e)
        msg("【账号{0}】浏览任务已全部完成".format(account))
        return '', '', ''

#获取加购任务信息
def get_task2(cookies,sid,account):
    try:
        taskToken_list = []
        url = 'https://xinruismzd-isv.isvjcloud.com/api/get_task'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/json, text/plain, */*',
            "Authorization":cookies,
            'Referer': f'https://xinruismzd-isv.isvjcloud.com/healthy-plant2021/?channel=ddjkicon&sid={sid}&un_area=19_1655_4866_0',
            'Host': 'xinruismzd-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;9.4.8;14.3;809409cbd5bb8a0fa8fff41378c1afe91b8075ad;network/wifi;ADID/201EDE7F-5111-49E8-9F0D-CCF9677CD6FE;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,4;addressid/2455696156;supportBestPay/0;appBuild/167629;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'User-Agent': userAgent (),
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9'
        }
        response = requests.get(url=url, verify=False, headers=headers)
        result = response.json()
        # print(result)
        taskName = result['result']['taskVos'][0]['taskName']
        taskId = result['result']['taskVos'][0]['taskId']
        task_list  =  result['result']['taskVos'][0]['productInfoVos']
        # print(task_list)
        for i in range (len (task_list)):
            try:
                taskToken = task_list[i]['taskToken']
                taskToken_list.append(taskToken)
            except Exception as e:
                pass
        # print(taskName, taskId, taskToken_list)
        return taskName, taskId, taskToken_list
    except Exception as e:
        print (e)
        msg("【账号{0}】加购任务已全部完成".format(account))
        return '','',''

#做任务
def do_task(cookies,taskName,taskId,taskToken,sid,account):
    try:
        url = 'https://xinruismzd-isv.isvjcloud.com/api/do_task'
        url1 = 'https://xinruismzd-isv.isvjcloud.com/api/catch_task'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/json, text/plain, */*',
            "Content-Type":"application/json",
            "Authorization":cookies,
            'Referer': f'https://xinruismzd-isv.isvjcloud.com/healthy-plant2021/?channel=ddjkicon&sid={sid}&un_area=19_1655_4866_0',
            'Host': 'xinruismzd-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;10.3.0;;;M/5.0;appBuild/167903;jdSupportDarkMode/0;ef/1;ep/%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22ud%22%3A%22Ytq3YtKyDzO5CJuyZtu4CWSyZtC0Ytc1CJLsDwC5YwO0YtS5CNrsCK%3D%3D%22%2C%22sv%22%3A%22CJUkCK%3D%3D%22%2C%22iad%22%3A%22%22%7D%2C%22ts%22%3A1641370097%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D;Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;',
            'User-Agent': userAgent (),
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            # "Cookie":"__jd_ref_cls=Mnpm_ComponentApplied; mba_muid=16410448680341440020208.1480.1641370098735; mba_sid=1480.10; __jda=60969652.16410448680341440020208.1641044868.1641357628.1641370076.6; __jdb=60969652.3.16410448680341440020208|6.1641370076; __jdc=60969652; __jdv=60969652%7Ckong%7Ct_1000170135%7Ctuiguang%7Cnotset%7C1641349527806; pre_seq=8; pre_session=b87b02719192f981b2f34b7510b6c9ba4b2908b0|3687; jd-healthy-plantation=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC94aW5ydWlzbXpkLWlzdi5pc3ZqY2xvdWQuY29tXC9hcGlcL2F1dGgiLCJpYXQiOjE2NDEzNTU0NzksImV4cCI6MTY0MTM5ODY3OSwibmJmIjoxNjQxMzU1NDc5LCJqdGkiOiJTcGdZbU1HeU50c084c0Z2Iiwic3ViIjoiNWF1aVRrdlZRVl9icDQ3T0EtVmRQMVFOR3FQcEhMXzUtLU5XdGs5TUhPYyIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.cfuKGTSrCfBX2qxrTdcW2ME3ASBbTo-DCFRwHWoPiDg"
            "Origin":"https://xinruismzd-isv.isvjcloud.com",
            # "Content-Length":"124",
        }
        data = r'{"taskToken":"' +f"{taskToken}" +r'","task_id":' + f"{taskId}" + r',"task_type":9,"task_name":"' + f"{taskName}" + r'"}'
        res = requests.post(url=url1, verify=False, headers=headers,data=data.encode())
        # print(res.status_code)
        if res.status_code == 200:
            msg("正在执行任务，请稍等10秒")
            time.sleep(10)
            response = requests.post(url=url, verify=False, headers=headers,data=data.encode())  #data中有汉字，需要encode为utf-8
            result = response.json()
            print(result)
            score = result['score']
            msg ("执行任务【{0}】成功，获取【{1}】能量".format (taskName,score))
    except Exception as e:
        print(e)

#做任务
def do_task2(cookies,taskName,taskId,taskToken,sid,account):
    try:
        url = 'https://xinruismzd-isv.isvjcloud.com/api/do_task'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/json, text/plain, */*',
            "Content-Type":"application/json",
            "Authorization":cookies,
            'Referer': f'https://xinruismzd-isv.isvjcloud.com/healthy-plant2021/?channel=ddjkicon&sid={sid}&un_area=19_1655_4866_0',
            'Host': 'xinruismzd-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;10.3.0;;;M/5.0;appBuild/167903;jdSupportDarkMode/0;ef/1;ep/%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22ud%22%3A%22Ytq3YtKyDzO5CJuyZtu4CWSyZtC0Ytc1CJLsDwC5YwO0YtS5CNrsCK%3D%3D%22%2C%22sv%22%3A%22CJUkCK%3D%3D%22%2C%22iad%22%3A%22%22%7D%2C%22ts%22%3A1641370097%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D;Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;',
            'User-Agent': userAgent (),
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            # "Cookie":"__jd_ref_cls=Mnpm_ComponentApplied; mba_muid=16410448680341440020208.1480.1641370098735; mba_sid=1480.10; __jda=60969652.16410448680341440020208.1641044868.1641357628.1641370076.6; __jdb=60969652.3.16410448680341440020208|6.1641370076; __jdc=60969652; __jdv=60969652%7Ckong%7Ct_1000170135%7Ctuiguang%7Cnotset%7C1641349527806; pre_seq=8; pre_session=b87b02719192f981b2f34b7510b6c9ba4b2908b0|3687; jd-healthy-plantation=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC94aW5ydWlzbXpkLWlzdi5pc3ZqY2xvdWQuY29tXC9hcGlcL2F1dGgiLCJpYXQiOjE2NDEzNTU0NzksImV4cCI6MTY0MTM5ODY3OSwibmJmIjoxNjQxMzU1NDc5LCJqdGkiOiJTcGdZbU1HeU50c084c0Z2Iiwic3ViIjoiNWF1aVRrdlZRVl9icDQ3T0EtVmRQMVFOR3FQcEhMXzUtLU5XdGs5TUhPYyIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.cfuKGTSrCfBX2qxrTdcW2ME3ASBbTo-DCFRwHWoPiDg"
            "Origin":"https://xinruismzd-isv.isvjcloud.com",
            # "Content-Length":"124",
        }
        data = r'{"taskToken":"' +f"{taskToken}" +r'","task_id":' + f"{taskId}" + r',"task_type":9,"task_name":"' + f"{taskName}" + r'"}'
        time.sleep(1)
        response = requests.post(url=url, verify=False, headers=headers,data=data.encode())  #data中有汉字，需要encode为utf-8
        result = response.json()
        # print(result)
        score = result['score']
        msg ("执行任务【{0}】成功，获取【{1}】能量".format (taskName,score))
    except Exception as e:
        print(e)


#充能
def charge(charge_targe_id,cookies,sid,account):
    if len(charge_targe_id)==0:
        msg("账号【{0}】未种植".format(account))
        return
    try:
        url = 'https://xinruismzd-isv.isvjcloud.com/api/add_growth_value'
        headers = {
            'Connection': 'keep-alive',
            'Accept': 'application/json, text/plain, */*',
            "Content-Type":"application/json",
            "Authorization":cookies,
            'Referer': f'https://xinruismzd-isv.isvjcloud.com/healthy-plant2021/?channel=ddjkicon&sid={sid}&un_area=19_1655_4866_0',
            'Host': 'xinruismzd-isv.isvjcloud.com',
            # 'User-Agent': 'jdapp;iPhone;10.3.0;;;M/5.0;appBuild/167903;jdSupportDarkMode/0;ef/1;ep/%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22ud%22%3A%22Ytq3YtKyDzO5CJuyZtu4CWSyZtC0Ytc1CJLsDwC5YwO0YtS5CNrsCK%3D%3D%22%2C%22sv%22%3A%22CJUkCK%3D%3D%22%2C%22iad%22%3A%22%22%7D%2C%22ts%22%3A1641370097%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D;Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;',
            'User-Agent': userAgent (),
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            # "Cookie":"__jd_ref_cls=Mnpm_ComponentApplied; mba_muid=16410448680341440020208.1480.1641370098735; mba_sid=1480.10; __jda=60969652.16410448680341440020208.1641044868.1641357628.1641370076.6; __jdb=60969652.3.16410448680341440020208|6.1641370076; __jdc=60969652; __jdv=60969652%7Ckong%7Ct_1000170135%7Ctuiguang%7Cnotset%7C1641349527806; pre_seq=8; pre_session=b87b02719192f981b2f34b7510b6c9ba4b2908b0|3687; jd-healthy-plantation=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC94aW5ydWlzbXpkLWlzdi5pc3ZqY2xvdWQuY29tXC9hcGlcL2F1dGgiLCJpYXQiOjE2NDEzNTU0NzksImV4cCI6MTY0MTM5ODY3OSwibmJmIjoxNjQxMzU1NDc5LCJqdGkiOiJTcGdZbU1HeU50c084c0Z2Iiwic3ViIjoiNWF1aVRrdlZRVl9icDQ3T0EtVmRQMVFOR3FQcEhMXzUtLU5XdGs5TUhPYyIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.cfuKGTSrCfBX2qxrTdcW2ME3ASBbTo-DCFRwHWoPiDg"
            "Origin":"https://xinruismzd-isv.isvjcloud.com",
            # "Content-Length":"124",
        }
        data = r'{"plant_id":' + f"{charge_targe_id}" + r'}'
        for i in range(10):
            response = requests.post(url=url, verify=False, headers=headers,data=data.encode())  #data中有汉字，需要encode为utf-8
            result = response.json()
            print(result)
            user_coins = result['user_coins']   #剩余能量
            coins = result['plant_info']['coins']   #消耗能量
            msg ("充能成功，消耗【{0}】能量，剩余能量【{1}】".format (coins,user_coins))
            time.sleep(2)

    except Exception as e:
        # print(e)
        message = result['message']
        if "充值次数达到上限" in message:
            msg("账号【{0}】充能次数已达上限10次".format(account))


def start():
        global cookie,cookies,charge_targe_id
        print (f"\n【准备开始...】\n")
        nowtime = datetime.datetime.now ().strftime ('%Y-%m-%d %H:%M:%S.%f8')
        if cookie != '':
            account = setName (cookie)
            msg ("★★★★★正在账号{}的任务★★★★★".format (account))
            access_token = get_ck(cookie,sid_ck,account)
            cookie = get_Authorization (access_token, account)
            get_planted_info (cookie, sid,account)
            if nowtime > flag_time1 and nowtime < flag_time2:
                taskName,taskId,taskToken = get_sleep (cookie,sid)
                do_task(cookie,taskName,taskId,taskToken,sid,account)
                charge(charge_targe_id,cookie,sid,account)
            else:
                taskName_list,taskId_list,taskToken_list = get_task (cookie,sid,account)
                for i,j,k in zip(taskName_list,taskId_list,taskToken_list):
                    do_task(cookie,i,j,k,sid,account)
                taskName, taskId, taskToken_list = get_task2(cookie,sid,account)
                for i in taskToken_list:
                    do_task2 (cookie, taskName, taskId, i, sid,account)
                charge(charge_targe_id,cookie,sid, account)
        elif cookies != '':
            for cookie in cookies:
                try:
                    account = setName (cookie)
                    msg ("★★★★★正在账号{}的任务★★★★★".format (account))
                    charge_targe_id=''
                    access_token = get_ck (cookie, sid_ck,account)
                    cookie = get_Authorization (access_token, account)
                    get_planted_info (cookie,sid,account)
                    if nowtime > flag_time1 and nowtime < flag_time2:
                        taskName, taskId, taskToken = get_sleep (cookie,sid)
                        do_task (cookie, taskName, taskId, taskToken, sid,account)
                    else:
                        taskName_list, taskId_list, taskToken_list = get_task (cookie, sid,account)
                        for i, j, k in zip (taskName_list, taskId_list, taskToken_list):
                            do_task (cookie, i, j, k, sid,account)
                        taskName, taskId, taskToken_list = get_task2 (cookie,sid, account)
                        for i in taskToken_list:
                            do_task2 (cookie, taskName, taskId, i, sid,account)

                except Exception as e:
                    pass
                charge (charge_targe_id, cookie, sid, account)
        else:
            printT("请检查变量plant_cookie是否已填写")

if __name__ == '__main__':
    printT("京东健康社区-种植园")
    start ()
    if '成熟' in msg_info:
        send ("京东健康社区-种植园", msg_info)
    if '成功' in msg_info:
        send ("京东健康社区-种植园", msg_info)
