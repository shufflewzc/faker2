# -*- coding:utf-8 -*-
"""
Python 3.9.7
作者：doubi
日期：2022年10月30日
注：脚本运行后会生成一个black.txt,之后如果出现车头pin找不到的情况下，请在black.txt搜索然后删除
注意事项 pin 为助力pin 必须保证ck在里面
作者要求 注释不能删除  否则后续不再更新
作者授权发布KR库。搬运请完整保留注释。
环境变量说明：
export dyjpin="需要助力的pin值"  

cron: 6 6 6 6 *
new Env('赚钱大赢家');
"""

import os
import re
import sys
import time
import uuid
import json
import random
import logging
import requests
import traceback
from hashlib import sha1
from urllib.parse import quote_plus, unquote_plus, quote

activity_name = "京东极速版-赚钱大赢家"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(lineno)d %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(activity_name)
index = 0
h5st_appid = 'd06f1'
appCode = 'msc588d6d5'
activeId = '63526d8f5fe613a6adb48f03'
task_fn = ['打扫店铺']
invite_taskId = None
need_invite = 0
not_tx = [0.3, 1, 3]
black_user_file = 'black'


class Userinfo:
    cookie_obj = []
    index = 0

    def __init__(self, cookie):
        global index
        index += 1
        self.user_index = index
        self.cookie = cookie
        try:
            self.pt_pin = re.findall(r'pt_pin=(.*?);', self.cookie)[0]
        except Exception:
            logger.info(f"取值错误['pt_pin']：{traceback.format_exc()}")
            return
        self.name = unquote_plus(self.pt_pin)
        self.UA = 'jdltapp;iPhone;4.2.0;;;M/5.0;hasUPPay/0;pushNoticeIsOpen/1;lang/zh_CN;hasOCPay/0;appBuild/1217;supportBestPay/0;jdSupportDarkMode/0;ef/1;ep/%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22ud%22%3A%22DtCzCNvwDzc4CwG0CWY2ZWTvENVwCJS3EJDvEWDsDNHuCNU2YJqnYm%3D%3D%22%2C%22sv%22%3A%22CJSkDy42%22%2C%22iad%22%3A%22C0DOGzumHNSjDJvMCy0nCUVOBJvLEOYjG0PNGzCmHOZNEJO2%22%7D%2C%22ts%22%3A1667286187%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D;Mozilla/5.0 (iPhone; CPU iPhone OS 12_7_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E126;supportJDSHWK/1'
        self.account_hot = False
        self.help_status = False
        Userinfo.cookie_obj.append(self)
        self.sha = sha1(str(self.pt_pin).encode('utf-8')).hexdigest()
        self.headers = {
            "Host": "wq.jd.com",
            "Cookie": self.cookie + f"sid={self.sha}",
            "User-Agent": self.UA,
            "Referer": f"https://wqs.jd.com/sns/202210/20/make-money-shop/guest.html?activeId={activeId}&type=sign&shareId=&__navVer=1",
        }
        self.shareUuid = ""
        self.invite_success = 0
        self.task_list = []
        self.need_help = False

    def getData(self, task_name, shareId):
        url = f'https://wq.jd.com/makemoneyshop/{task_name}?g_ty=h5&g_tk=&appCode={appCode}&activeId={activeId}&shareId={shareId}&_stk=activeId,shareId&_ste=1&sceneval=2'
        res = requests.get(url=url, headers=self.headers, timeout=10).json()
        return res

    def UserTask(self):
        home_res = self.getData('home', '')
        if home_res['code'] != 0:
            logger.info(f"车头账户[{self.name}]：{home_res['msg']}")
            return
        else:
            self.shareUuid = home_res['data']['shareId']
            logger.info(f"车头账户[{self.name}]：已获取助力码[{self.shareUuid}]")
            logger.info(f"车头账户[{self.name}]：当前营业币约[{home_res['data']['canUseCoinAmount']}]元")
        self.GetUserTaskStatusList()
        if self.need_help:
            logger.info(f"当前从{Userinfo.index}继续")
            for cookie in Userinfo.cookie_obj[Userinfo.index:]:
                if cookie.pt_pin == self.pt_pin:
                    continue
                if cookie.account_hot:
                    continue
                res = cookie.getData('guesthelp', self.shareUuid)
                if res['code'] == 147:  # 火爆
                    cookie.account_hot = True
                    logger.info(f"工具人账户[{cookie.user_index}][{cookie.name}]：{res['msg']}")
                if res['code'] == 1007:
                    logger.info(f"工具人账户[{cookie.user_index}][{cookie.name}]：{res['msg']}")
                if res['code'] == 1008:
                    logger.info(f"工具人账户[{cookie.user_index}][{cookie.name}]：{res['msg']}")
                if str(res).find("助力任务已完成") > -1:
                    self.reward(invite_taskId)
                if res['code'] == 0:
                    self.reward(invite_taskId)
                    self.invite_success += 1
                    logger.info(f"工具人账户[{cookie.user_index}][{cookie.name}]：助力成功，当前助力成功{self.invite_success}次")

                if self.invite_success >= need_invite:
                    logger.info(f"车头账户[{self.name}]：助力已满")
                    return self.exchange_query()
                Userinfo.index += 1
                # time.sleep(round(random.uniform(0.7, 1.3), 2))

        else:
            return self.exchange_query()

    def exchange_query(self):
        url = f'https://wq.jd.com/makemoneyshop/exchangequery?g_ty=h5&g_tk=&appCode={appCode}&activeId={activeId}&sceneval=2'
        res = requests.get(url=url, headers=self.headers).json()
        if res['code'] == 0:
            logger.info(f"车头账户[{self.name}]：获取微信提现信息成功")
            canUseCoinAmount = float(res['data']['canUseCoinAmount'])
            logger.info(f"车头账户[{self.name}]：当前余额[{canUseCoinAmount}]元")
            for data in res['data']['cashExchangeRuleList'][::-1]:
                if float(data['cashoutAmount']) not in not_tx:
                    if canUseCoinAmount >= float(data['cashoutAmount']):
                        logger.info(f"车头账户[{self.name}]：当前余额[{canUseCoinAmount}]元,符合提现规则[{data['cashoutAmount']}]门槛")
                        rule_id = data['id']
                        self.tx(rule_id)

                    else:
                        logger.info(f"车头账户[{self.name}]：当前余额[{canUseCoinAmount}]元,不足提现[{data['cashoutAmount']}]门槛")
                else:
                    logger.info(f"车头账户[{self.name}]：当前余额[{canUseCoinAmount}]元,不提现[{not_tx}]门槛")

    def tx(self, rule_id):
        url = f'https://wq.jd.com/prmt_exchange/client/exchange?g_ty=h5&g_tk=&appCode={appCode}&bizCode=makemoneyshop&ruleId={rule_id}&sceneval=2'
        res = requests.get(url=url, headers=self.headers).json()
        if res['ret'] == 0:
            logger.info(f"车头账户[{self.name}]：提现成功")
            return True
        if res['ret'] == 232:
            logger.info(f"车头账户[{self.name}]：{res['msg']}")
            return False
        if res['ret'] == 604:
            logger.info(f"车头账户[{self.name}]：{res['msg']}")
            return True
        else:
            logger.info(f"车头账户[{self.name}]：{res}")

    def GetUserTaskStatusList(self):
        global invite_taskId, need_invite
        url = f'https://wq.jd.com/newtasksys/newtasksys_front/GetUserTaskStatusList?g_ty=h5&g_tk=&appCode={appCode}&__t={getTime()}&source=makemoneyshop&bizCode=makemoneyshop&sceneval=2'
        res = requests.get(url=url, headers=self.headers, timeout=10).json()
        if res['ret'] == 0:
            msg = []
            for taskid, task in enumerate(res['data']['userTaskStatusList'], 1):
                taskName = task['taskName']
                reward = int(task['reward']) / 100
                taskId = task['taskId']
                configTargetTimes = task['configTargetTimes']
                status = str(task['gettaskStatus'])
                if taskName == '邀请好友打卡':
                    self.invite_success = task['realCompletedTimes']
                    if invite_taskId is None:
                        invite_taskId = task['taskId']
                        logger.info(f"已成功获取邀请好友打卡任务ID:{invite_taskId}")
                    if need_invite == 0:
                        need_invite = int(task['configTargetTimes'])
                    if self.invite_success < need_invite:
                        self.need_help = True
                        logger.info(
                            f"最高可邀请[{need_invite}]人,目前已邀请[{self.invite_success}]人,还需邀请[{int(need_invite) - int(self.invite_success)}]人")
                    else:
                        logger.info(f"最高可邀请[{need_invite}]人,目前已邀请[{self.invite_success}]人,助力已满，换号")

                self.task_list.append(
                    {
                        "status": status,
                        "taskName": taskName,
                        "taskId": taskId,
                        "configTargetTimes": configTargetTimes
                    }
                )
                msg.append(
                    f"{taskid} : {taskName} -- {reward}个营业币 -- {status.replace('1', '未完成').replace('2', '已完成')}")

            print('\n'.join(msg))
            self.do_task()

    def reward(self, taskId):
        url = f'https://wq.jd.com/newtasksys/newtasksys_front/Award?g_ty=h5&g_tk=&appCode={appCode}&__t={getTime()}&source=makemoneyshop&taskId={taskId}&bizCode=makemoneyshop&sceneval=2'
        self.headers[
            'Referer'] = f'https://wqs.jd.com/sns/202210/20/make-money-shop/index.html?activeId={activeId}&lng=118.389971&lat=24.974751&sid={self.sha}&un_area=16_1341_1343_44855'
        res = requests.get(url=url, headers=self.headers, timeout=10).json()
        if res['ret'] == 0:
            logger.info(f"车头账户[{self.name}]：领取成功")
        else:
            logger.info(f"车头账户[{self.name}]：{res['msg']}")

    def do_task(self):
        for task in self.task_list:
            if task['taskName'] in task_fn and task['status'] != "2":
                logger.info(f"车头账户[{self.name}]：去做[{task['taskName']}]")
                self.reward(task['taskId'])


def getTime():
    return int(time.time() * 1000)


def black_user():
    if os.path.exists(f'{black_user_file}.txt'):
        with open(f'{black_user_file}.txt', 'r') as f:
            return f.read().split('&')
    else:
        with open(f'{black_user_file}.txt', 'a'):
            logger.info(f"文件:{black_user_file}不存在，创建")
        return []


def del_black(pin):
    cookie_copy = Userinfo.cookie_obj.copy()
    for cookie in cookie_copy:
        if pin in cookie.pt_pin and pin != '':
            Userinfo.cookie_obj.remove(cookie)


def main():
    try:
        cookies = os.environ['JD_COOKIE'].split('&')
    except:
        with open(os.path.join(os.path.dirname(__file__), 'cklist.txt'), 'r') as f:
            cookies = f.read().split('\n')
    helpPin = os.environ.get('dyjpin', "")
    if helpPin == "":
        logger.info("您尚未填写'dyjpin'-- pin1&pin2&pin")
        sys.exit()
    try:
        helpPin = helpPin.split('&')
    except:
        logger.info("dyjpin填写格式错误，pin1&pin2&pin3")
        sys.exit()
    [Userinfo(cookie) for cookie in cookies]
    black = black_user()
    if black:
        del black[-1]
        for pin in black:
            del_black(pin)
    logger.info(f"共去除{len(black)}个黑名单pin")
    logger.info(f"当前剩余[{len(Userinfo.cookie_obj)}]个cookie可助力")
    inviterList = (
        [cookie_obj for cookie_obj in Userinfo.cookie_obj for name in helpPin if name in cookie_obj.pt_pin])
    if not inviterList:
        logger.info(f"没有找到车头:{helpPin}")
        sys.exit()
    logger.info(f"共找到[{len(inviterList)}]车头")
    for inviter in inviterList:
        logger.info(f"开启助力车头：{inviter.pt_pin}")
        inviter.UserTask()
    time.sleep(round(random.uniform(0.7, 1.3), 2))
    for cookie in Userinfo.cookie_obj:
        if cookie.account_hot:
            if cookie.pt_pin in str(black):
                continue
            if cookie.pt_pin in helpPin:
                continue
            with open(f'{black_user_file}.txt', 'a') as w:
                w.write(cookie.pt_pin + '&')


if __name__ == '__main__':
    main()
