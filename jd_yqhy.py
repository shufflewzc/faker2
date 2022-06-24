"""
# 邀好友赢大礼 create by doubi 通用模板 
# 17:/椋东送福利，邀请好友，争排行榜排位，大礼送不停，(E1Y7RAtC4b) ，升级新版猄·=·Dσσōngαpρ
# https://prodev.m.jd.com/mall/active/dVF7gQUVKyUcuSsVhuya5d2XD4F/index.html?code=16dde1860f1b4f1b9a93db6612abf0b9&invitePin=pin值
# 注意事项 pin 为助力pin 必须保证ck在里面


环境变量说明：
export yhypin="需要助力的pin值"  
export yhyactivityId="活动类型ID"
export yhyauthorCode="活动ID"

cron: 6 6 6 6 *
new Env('邀请赢大礼');
"""

import json
import requests,random,time,asyncio,re,os
from urllib.parse import quote_plus,unquote_plus
from functools import partial
print = partial(print, flush=True)

activatyname = '邀请赢大礼'
activityId = os.environ["yhyactivityId"]   # 活动类型
authorCode = os.environ["yhyauthorCode"] # 活动id
invitePin = os.environ["yhypin"] # pin 填写cookie后面的pin
activityUrl = f'https://prodev.m.jd.com/mall/active/{activityId}/index.html?code={authorCode}&invitePin={invitePin}'

# 随机ua
def randomuserAgent():
    global uuid, addressid, iosVer, iosV, clientVersion, iPhone, area, ADID, lng, lat
    uuid = ''.join(random.sample(
        ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
         'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'z'], 40))
    addressid = ''.join(random.sample('1234567898647', 10))
    iosVer = ''.join(random.sample(["15.1.1", "14.5.1", "14.4", "14.3", "14.2", "14.1", "14.0.1"], 1))
    iosV = iosVer.replace('.', '_')
    clientVersion = ''.join(random.sample(["10.3.0", "10.2.7", "10.2.4"], 1))
    iPhone = ''.join(random.sample(["8", "9", "10", "11", "12", "13"], 1))
    area = ''.join(random.sample('0123456789', 2)) + '_' + ''.join(random.sample('0123456789', 4)) + '_' + ''.join(
        random.sample('0123456789', 5)) + '_' + ''.join(random.sample('0123456789', 4))
    ADID = ''.join(random.sample('0987654321ABCDEF', 8)) + '-' + ''.join(
        random.sample('0987654321ABCDEF', 4)) + '-' + ''.join(random.sample('0987654321ABCDEF', 4)) + '-' + ''.join(
        random.sample('0987654321ABCDEF', 4)) + '-' + ''.join(random.sample('0987654321ABCDEF', 12))
    lng = '119.31991256596' + str(random.randint(100, 999))
    lat = '26.1187118976' + str(random.randint(100, 999))
    UserAgent = ''
    if not UserAgent:
        return f'jdapp;iPhone;10.0.4;{iosVer};{uuid};network/wifi;ADID/{ADID};model/iPhone{iPhone},1;addressid/{addressid};appBuild/167707;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS {iosV} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/null;supportJDSHWK/1'
    else:
        return UserAgent

# 检测ck状态
async def check(ua, ck):
    try:
        url = 'https://me-api.jd.com/user_new/info/GetJDUserInfoUnion'
        header = {
            "Host": "me-api.jd.com",
            "Accept": "*/*",
            "Connection": "keep-alive",
            "Cookie": ck,
            "User-Agent": ua,
            "Accept-Language": "zh-cn",
            "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
            "Accept-Encoding": "gzip, deflate",
        }
        result = requests.get(url=url, headers=header, timeout=2).text
        codestate = json.loads(result)
        if codestate['retcode'] == '1001':
            msg = "当前ck已失效，请检查"
            return {'code': 1001, 'data': msg}
        elif codestate['retcode'] == '0' and 'userInfo' in codestate['data']:
            nickName = codestate['data']['userInfo']['baseInfo']['nickname']
            return {'code': 200, 'name': nickName, 'ck': ck}
    except Exception as e:
        return {'code': 0, 'data': e}

# 获取当前时间
def get_time():
    time_now = round(time.time()*1000)
    return time_now

# 登录plogin
async def plogin(ua,cookie):
    now = get_time()
    url = f'https://plogin.m.jd.com/cgi-bin/ml/islogin?time={now}&callback=__jsonp{now-2}&_={now+2}'
    header = {
        'Accept':'*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Connection': 'keep-alive',
        'Cookie': cookie,
        'Host': 'plogin.m.jd.com',
        'Referer': 'https://prodev.m.jd.com/',
        'User-Agent':ua
    }
    response = requests.get(url=url,headers=header,timeout=5).text
    return response

# 活动接口
async def jdjoy(ua,cookie):

    url = f'https://jdjoy.jd.com/member/bring/getActivityPage?code={authorCode}&invitePin={invitePin}&_t={get_time()}'
    header = {
        'Accept':'*/*',
        'Accept-Encoding':'gzip, deflate',
        'Accept-Language':'zh-Hans-US;q=1,en-US;q=0.9',
        'Connection':'keep-alive',
        'Content-Type':'application/json',
        'Cookie':cookie,
        "Host":'jdjoy.jd.com',
        'Origin':'https://prodev.m.jd.com',
        "Referer":'https://prodev.m.jd.com/',
        'User-Agent':ua
    }
    response = requests.get(url=url,headers=header).text
    return json.loads(response)
    
# go开卡
async def ruhui(ua,cookie):
    url = f'https://jdjoy.jd.com/member/bring/joinMember?code={authorCode}&invitePin={invitePin}'
    header = {
        'Host': 'jdjoy.jd.com',
        'Content-Type': 'application/json',
        'Origin': 'https://prodev.m.jd.com',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cookie': cookie,
        'Connection': 'keep-alive',
        'Accept': '*/*',
        'User-Agent': ua,
        'Referer': activityUrl,
        'Accept-Language': 'zh-cn',
        'request-from': 'native'
    }
    response = requests.get(url=url,headers=header).text
    return json.loads(response)

# 检查开卡状态
async def check_ruhui(body,cookie,venderId,ua):
    url = f'https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=getShopOpenCardInfo&body={json.dumps(body)}&client=H5&clientVersion=9.2.0&uuid=88888'
    headers =  {
        'Host': 'api.m.jd.com',
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Cookie': cookie,
        'User-Agent': ua,
        'Accept-Language': 'zh-cn',
        'Referer': f'https://shopmember.m.jd.com/shopcard/?venderId={venderId}&channel=801&returnUrl={json.dumps(activityUrl)}',
        'Accept-Encoding': 'gzip, deflate'
    }
    response = requests.get(url=url,headers=headers,timeout=30000).text
    return json.loads(response)

# 领取奖励
async def getInviteReward(cookie,ua,number):
    url = f'https://jdjoy.jd.com/member/bring/getInviteReward?code={authorCode}&stage={number}'
    header = {
        'Accept':'*/*',
        'Accept-Encoding':'gzip, deflate',
        'Accept-Language':'zh-Hans-US;q=1,en-US;q=0.9',
        'Connection':'keep-alive',
        'Content-Type':'application/json',
        'Cookie':cookie,
        "Host":'jdjoy.jd.com',
        'Origin':'https://prodev.m.jd.com',
        "Referer":'https://prodev.m.jd.com/',
        'User-Agent':ua
}
    response = requests.get(url=url,headers=header).text
    return json.loads(response)

# 开启活动
async def firstInvite(cookie,ua):
    url = f'https://jdjoy.jd.com/member/bring/firstInvite?code={authorCode}'
    header = {
        'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding':'gzip, deflate',
        'Accept-Language':'zh-Hans-US;q=1,en-US;q=0.9',
        'Connection':'keep-alive',
        'Cookie':cookie,
        "Host":'jdjoy.jd.com',
        'User-Agent':ua
}
    response = requests.get(url=url,headers=header).text
    print(response)
    return json.loads(response)

async def get_ck(data):
    cklist = []
    if data['code']!=200:
        return {'code': 0, 'data':data}
    else:
        env_data = data['data']
        for ck in env_data:
            if 'remarks' in ck and ck['name']=='JD_COOKIE':
                    cklist.append(ck['value'])
            else:
                pass
    return cklist


# 检查pin
def checkpin(cks:list,pin):
    for ck in cks:
        if pin in ck:
            return ck
        else:
            None

# 主程序
async def main():
    try:
        cks = os.environ["JD_COOKIE"].split("&")
    except:
        with open('cklist1.txt','r') as f:
            cks  = f.read().split('\n')
    success = 0   # 计算成功数
    inveteck = checkpin(cks,invitePin)  # 根据设定的pin返回对应ck
    needinviteNum = [] # 需要助力次数
    needdel = []
    need = []
    if inveteck:
        print(f'🔔{activatyname}', flush=True)
        print(f'==================共{len(cks)}个京东账号Cookie==================')
        print(f'==================脚本执行- 北京时间(UTC+8)：{get_time()}=====================\n')
        print(f'您好！{invitePin}，正在获取您的活动信息',)
        ua = randomuserAgent()  # 获取ua
        result = await check(ua, inveteck) # 检测ck
        if result['code'] == 200:
            await plogin(ua,inveteck) # 获取登录状态
            await asyncio.sleep(2)
            result = await jdjoy(ua,inveteck) # 获取活动信息
            await firstInvite(inveteck,ua) # 开启活动
            if result['success']:
                brandName = result['data']['brandName']  # 店铺名字
                venderId = result['data']['venderId']  # 店铺入会id
                rewardslist =[] # 奖品
                successCount = result['data']['successCount'] # 当前成功数
                success += successCount
                result_data = result['data']['rewards'] # 奖品数据
                print(f'您好！账号[{invitePin}]，开启{brandName}邀请好友活动\n去开活动') 
                for i in result_data:
                    stage = i['stage']
                    inviteNum = i['inviteNum']  # 单次需要拉新人数
                    need.append(inviteNum) 
                    rewardName = i['rewardName'] # 奖品名
                    rewardNum = i['rewardStock']
                    if rewardNum !=0:
                        needinviteNum.append(inviteNum) 
                        needdel.append(inviteNum)
                    rewardslist.append(f'级别{stage}:  需助力{inviteNum}人，奖品: {rewardName}，库存：{rewardNum}件\n')
                if len(rewardslist)!=0:
                    print('当前活动奖品如下: \n'+str('\n'.join(rewardslist))+f'\n当前已助力{successCount}次\n')
                    for nmubers in needdel:
                        if success >= nmubers:
                            print("您当前助力已经满足了，可以去领奖励了")
                            print(f'\n这就去领取奖励{need.index(nmubers)+1}')
                            result = await getInviteReward(inveteck,ua,need.index(nmubers)+1)
                            print(result)
                            needinviteNum.remove(nmubers)
                            await asyncio.sleep(10)
                    needdel = needinviteNum
                    if needinviteNum == []:
                        print('奖励已经全部获取啦，退出程序')
                        return
                for n,ck in enumerate(cks,1):
                    ua = randomuserAgent()  # 获取ua
                    try:
                        pin = re.findall(r'(pt_pin=([^; ]+)(?=;))',str(ck))[0]
                        pin = (unquote_plus(pin[1]))
                    except IndexError:
                        pin = f'用户{n}'
                    print(f'******开始【京东账号{n}】{pin} *********\n')
                    for n,nmubers in enumerate(needinviteNum,1):
                        for nmubers in needdel:
                            if success >= nmubers:
                                print(nmubers)
                                print("您当前助力已经满足了，可以去领奖励了")
                                print(f'\n这就去领取奖励{need.index(nmubers)+1}')
                                result = await getInviteReward(inveteck,ua,need.index(nmubers)+1)
                                print(result)
                                needinviteNum.remove(nmubers)
                                await asyncio.sleep(10)
                        needdel = needinviteNum
                        if needinviteNum == []:
                            print('奖励已经全部获取啦，退出程序')
                            return
                    await plogin(ua,ck) # 获取登录状态 
                    result = await check(ua, ck) # 检测ck
                    if result['code'] == 200:
                        result = await jdjoy(ua,ck) # 调用ck
                        if result['success']:
                            print(f'账户[{pin}]已开启{brandName}邀请好友活动\n')
                            await asyncio.sleep(3)
                            result= await check_ruhui({"venderId":str(venderId), "channel": "401" },ck,venderId,ua) # 检查入会状态
                            try:
                                if result['result']['userInfo']['openCardStatus']==0: # 0 未开卡
                                    await asyncio.sleep(2)
                                    print(f'您还不是会员哦，这就去去助力{invitePin}\n')
                                    result = await ruhui(ua,ck)
                                    if result['success']:
                                        success +=1
                                        print(f'助力成功! 当前成功助力{success}个\n')
                                    if '交易失败' in str(result):
                                        success +=1
                                        print(f'助力成功! 当前成功助力{success}个\n')
                                    else:
                                        print(result)
                                    await asyncio.sleep(2)
                                else:
                                    print('您已经是会员啦，不去请求了入会了\n')
                                    continue

                            except TypeError as e:
                                print(e)
                                result = await ruhui(ua,ck)
                                if result['success']:
                                    success +=1
                                    print(f'助力成功! 当前成功助力{success}个\n')
                                if '交易失败' in result:
                                    success +=1
                                    print(f'助力成功! 当前成功助力{success}个\n')
                                else:
                                    print(result['errorMessage'])
                                await asyncio.sleep(2)

                        else: # 没有获取到活动信息
                            print('未获取到活动参数信息\n')
                            break
                    else:
                        print(result['data'])
                        continue
            else:
                print('未能获取到活动信息\n')
                return

        else:
            print(result['data'])
            return
    else:
        print(f'pin填写有误，请重试')
if __name__ == "__main__":
    asyncio.run(main())