import asyncio
import datetime
import json
import os
import re
import urllib.parse

from cacheout import FIFOCache
from pyrogram import Client, filters

cache = FIFOCache(maxsize=512)

platform = "v4"
if os.path.exists("/jd/config/magic.json"):
    with open("/jd/config/magic.json", 'r', encoding='utf-8') as f:
        BOT = json.load(f)

if os.path.exists("/ql/config/magic.json"):
    platform = "ql"
    with open("/ql/config/magic.json", 'r', encoding='utf-8') as f:
        BOT = json.load(f)

if os.path.exists("/ql/data/config/magic.json"):
    platform = "ql2"
    with open("/ql/data/config/magic.json", 'r', encoding='utf-8') as f:
        BOT = json.load(f)

api_id = int(BOT['api_id'])
api_hash = BOT['api_hash']
my_id = int(BOT['user_id'])
my_bot_id = int(BOT['bot_token'].split(":")[0])
base_path = BOT['base_path']

if platform == "v4":
    _ConfigSH = '/jd/config/config.sh'
elif platform == 'ql':
    _ConfigSH = '/ql/config/config.sh'
else:
    _ConfigSH = '/ql/data/config/config.sh'

if BOT['proxy']:
    proxy = {
        'hostname': BOT['proxy_add'],  # 改成自己的
        'port': int(BOT['proxy_port']),
        'username': BOT['proxy_username'],
        'password': BOT['proxy_password']
    }
    app = Client('magic', api_id, api_hash, proxy=proxy)
else:
    app = Client('magic', api_id, api_hash)

# 监控的自动车
car_group_id = int(BOT['car_group_id'])

monitor_flag = 'https://i.walle.com/api?data='

# 你的脚本配置
car_config = [
    {'name': 'M加购有礼', 'env': 'M_WX_ADD_CART_URL', 'js': 'm_jd_wx_addCart.js', 'cmd': 'now'},
    {'name': 'M幸运抽奖', 'env': 'M_WX_LUCK_DRAW_URL', 'js': 'm_jd_wx_luckDraw.js', 'cmd': 'now'},
    {'name': 'M集卡抽奖', 'env': 'M_WX_COLLECT_CARD_URL', 'js': 'm_jd_wx_collectCard.js', 'cmd': 'now'},
    {'name': 'M关注有礼', 'env': 'M_FOLLOW_SHOP_ARGV', 'js': 'm_jd_follow_shop.js', 'cmd': 'now'}
]


@app.on_message(filters.chat(my_bot_id) & filters.regex("在吗"))
async def handler(client, message):
    await message.reply("老板啥事！")


@app.on_message(filters.chat(car_group_id) & filters.text)
async def handler(client, message):
    try:
        if message.entities is None:
            return
        text = message.entities[0]['url']
        if text is None:
            return
        if 'i.walle.com' not in text:
            return
        text = urllib.parse.unquote(text.replace(monitor_flag, ''))
        zd = 1
        if 'jd_zdjr_activityId' in text:
            zd = re.search(f'jd_zdjr_activityId="(.*)"', text)[1]
        if zd != 1:
            if cache.get(zd) is not None:
                await client.send_message(my_bot_id, f'跑过 {text}')
                return
            cache.set(zd, zd)
        else:
            if cache.get(text) is not None:
                await client.send_message(my_bot_id, f'跑过 {text}')
                return
            cache.set(text, text)
        name = ''
        js = ''
        command = ''
        for v in car_config:
            if v['env'] in text:
                name = v['name']
                js = v['js']
                command = v['cmd']
                break
        if len(name) == 0:
            await client.send_message(my_bot_id, f'未知变量`{text}`')
            return
        messages = text.split("\n")
        change = ""
        for message in messages:
            if "export " not in message:
                continue
            kv = message.replace("export ", "")
            key = kv.split("=")[0]
            value = re.findall(r'"([^"]*)"', kv)[0]
            configs = rwcon("str")
            if kv in configs:
                continue
            if key in configs:
                configs = re.sub(f'{key}=("|\').*("|\')', kv, configs)
                change += f"【替换】 `{name}` 环境变量成功\n`{kv}\n`"
            else:
                if platform == 'v4':
                    end_line = 0
                    configs = rwcon("list")
                    for config in configs:
                        if "第五区域" in config and "↑" in config:
                            end_line = configs.index(config) - 1
                            break
                    configs.insert(end_line, f'export {key}="{value}"\n')
                else:
                    configs = rwcon("str")
                    configs += f'export {key}="{value}"\n'
                change += f"【新增】 `{name}` 环境变量成功\n`{kv}\n`"
                await client.send_message(my_bot_id, change)
            rwcon(configs)
        if len(change) == 0:
            await client.send_message(my_bot_id, f'【取消】{name}环境变量无需改动')
            return
        if len(js) > 0:
            await client.send_message(my_bot_id, f'开始运行 {js}')
            if platform == 'v4':
                await cmd(client, f'jtask {base_path}/{js} {command}')
            else:
                await cmd(client, f'task {base_path}/{js} {command}')
        else:
            await client.send_message(my_bot_id, f'无需执行')
    except Exception as e:
        await client.send_message(my_bot_id, f'{str(e)}')


async def cmd(client, cmd_text):
    '''定义执行cmd命令'''
    try:
        p = await asyncio.create_subprocess_shell(
            cmd_text, stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE)
        res_bytes, res_err = await p.communicate()
        res = res_bytes.decode('utf-8')
        if len(res) > 0:
            if platform == "v4":
                base = "/jd"
            elif platform == "ql":
                base = "/ql"
            else:
                base = "/ql/data"
            tmp_log = f'{base}/log/bot/{cmd_text.split("/")[-1].split(".js")[0]}-{datetime.datetime.now().strftime("%H-%M-%S.%f")}.log'
            with open(tmp_log, 'w+', encoding='utf-8') as f:
                f.write(res)
    except Exception as e:
        await client.send_message(my_bot_id, f'日志目录有误,{str(e)}')


# 读写config.sh
def rwcon(arg):
    if arg == "str":
        with open(_ConfigSH, 'r', encoding='utf-8') as f1:
            configs = f1.read()
        return configs
    elif arg == "list":
        with open(_ConfigSH, 'r', encoding='utf-8') as f1:
            configs = f1.readlines()
        return configs
    elif isinstance(arg, str):
        with open(_ConfigSH, 'w', encoding='utf-8') as f1:
            f1.write(arg)
    elif isinstance(arg, list):
        with open(_ConfigSH, 'w', encoding='utf-8') as f1:
            f1.write("".join(arg))


app.run()
