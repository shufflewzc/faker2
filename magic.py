import asyncio
import datetime
import json
import logging
import os
import re
from urllib import parse

from cacheout import FIFOCache
from telethon import TelegramClient, events

# 0. 进入容器
# 1. pip3 install -U cacheout
# 2. 复制magic.py,magic.json到/ql/config/目录 并配置
# 3. python3 /ql/config/magic.py 登录
# 4. 给bot发送在吗 有反应即可
# 5. pm2 start /ql/config/magic.py -x --interpreter python3
# 6. 挂起bot到后台 查看状态 pm2 l
# 7. 如果修改了magic.json,执行pm2 restart magic 即可重启
# pm2 start /jd/config/magic.py -x --interpreter python3

logging.basicConfig(format='[%(levelname) 5s/%(asctime)s] %(name)s: %(message)s', level=logging.INFO)
# 创建
logger = logging.getLogger("magic")
logger.setLevel(logging.INFO)

_ConfigCar = ""
_ConfigSh = ""
if os.path.exists("/jd/config/magic.json"):
    _ConfigCar = "/jd/config/magic.json"
    _ConfigSh = "/jd/config/config.sh"
elif os.path.exists("/ql/config/magic.json"):
    _ConfigCar = "/ql/config/magic.json"
    _ConfigSh = "/ql/config/config.sh"
elif os.path.exists("/ql/data/config/magic.json"):
    _ConfigCar = "/ql/data/config/magic.json"
    _ConfigSh = "/ql/data/config/config.sh"
else:
    logger.info("未找到magic.json config.sh")

with open(_ConfigCar, 'r', encoding='utf-8') as f:
    magic_json = f.read()
    properties = json.loads(magic_json)

# 缓存
cache = FIFOCache(maxsize=properties.get("monitor_cache_size"))

# Telegram相关
api_id = properties.get("api_id")
api_hash = properties.get("api_hash")
bot_id = properties.get("bot_id")
bot_token = properties.get("bot_token")
user_id = properties.get("user_id")
# 监控相关
monitor_cars = properties.get("monitor_cars")
command = properties.get("command")
log_path = properties.get("log_path")
log_send = properties.get("log_send")
logger.info(f"监控的频道或群组-->{monitor_cars}")
monitor_scripts_path = properties.get("monitor_scripts_path")
logger.info(f"监控的文件目录-->{monitor_scripts_path}")
monitor_scripts = properties.get("monitor_scripts")
monitor_auto_stops = properties.get("monitor_auto_stops")
logger.info(f"监控的自动停车-->{monitor_auto_stops}")

if properties.get("proxy"):
    proxy = {
        'proxy_type': properties.get("proxy_type"),
        'addr': properties.get("proxy_addr"),
        'port': properties.get("proxy_port")
    }
    client = TelegramClient("magic", api_id, api_hash, proxy=proxy, auto_reconnect=True, retry_delay=1, connection_retries=99999).start()
else:
    client = TelegramClient("magic", api_id, api_hash, auto_reconnect=True, retry_delay=1, connection_retries=99999).start()


def rwcon(arg):
    if arg == "str":
        with open(_ConfigSh, 'r', encoding='utf-8') as f1:
            configs = f1.read()
        return configs
    elif arg == "list":
        with open(_ConfigSh, 'r', encoding='utf-8') as f1:
            configs = f1.readlines()
        return configs
    elif isinstance(arg, str):
        with open(_ConfigSh, 'w', encoding='utf-8') as f1:
            f1.write(arg)
    elif isinstance(arg, list):
        with open(_ConfigSh, 'w', encoding='utf-8') as f1:
            f1.write("".join(arg))


async def export(text):
    messages = text.split("\n")
    change = ""
    key = ""
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
            change += f"【替换】环境变量成功\nexport {kv}"
            await client.send_message(bot_id, change)
        else:
            end_line = 0
            configs = rwcon("list")
            for config in configs:
                if "第二区域" in config and "↑" in config:
                    end_line = configs.index(config) - 1
                    break
            configs.insert(end_line, f'export {key}="{value}"\n')
            change += f"【新增】环境变量成功\nexport {kv}"
            await client.send_message(bot_id, change)
        rwcon(configs)
    if len(change) == 0:
        await client.send_message(bot_id, f'【取消】{key}环境变量无需改动')


# 设置变量
@client.on(events.NewMessage(chats=monitor_cars, pattern='^没水了$'))
async def handler(event):
    for auto_stop_file in monitor_auto_stops:
        os.popen(f"ps -ef | grep {auto_stop_file}" + " | grep -v grep | awk '{print $1}' | xargs kill -9")
    await client.send_message(bot_id, f'没水停车')


# 设置变量
@client.on(events.NewMessage(chats=monitor_cars, pattern='^在吗$'))
async def handler(event):
    await client.send_message(bot_id, f'老板啥事？')


# 设置变量
@client.on(events.NewMessage(chats=monitor_cars, pattern='^清理缓存$'))
async def handler(event):
    b_size = cache.size()
    logger.info(f"清理前缓存数量，{b_size}")
    cache.clear()
    a_size = cache.size()
    logger.info(f"清理后缓存数量，{a_size}")
    await client.send_message(bot_id, f'清理缓存结束 {b_size}-->{a_size}')


# 监听事件
@client.on(events.NewMessage(chats=monitor_cars))
async def handler(event):
    origin = event.message.text
    text = re.findall(r'https://i.walle.com/api\?data=(.+)?\)', origin)
    if len(text) > 0:
        text = parse.unquote_plus(text[0])
    elif origin.startswith("export "):
        text = origin
    else:
        return
    try:
        logger.info(f"原始数据 {text}")
        # 微定制
        if "WDZactivityId" in text:
            activity_id = re.search(f'WDZactivityId="(.+?)"', text)[1]
            if cache.get(activity_id) is not None:
                await client.send_message(bot_id, f'跑过 {text}')
                return
            cache.set(activity_id, activity_id)
            text = f'export jd_wdz_custom="{activity_id}"'
        else:
            urls = re.search('((http|https)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|])', text)
            if urls is not None:
                url = urls[0]
                domain = re.findall('https?://([^/]+)', url)[0]
                params = parse.parse_qs(parse.urlparse(url).query)
                activity_id = ''
                if 'cjhy' in domain or 'lzkj' in domain or 'lzdz1' in domain:
                    if 'pageDecorateView/previewPage' in url:
                        activity_id = params["tplId"][0]
                    elif 'wxPointShopView' in url:
                        activity_id = params["giftId"][0]
                    elif 'activityId' in url:
                        activity_id = params["activityId"][0]
                if len(activity_id) == 0:
                    if cache.get(text) is not None:
                        await client.send_message(bot_id, f'跑过 {text}')
                        return
                    cache.set(text, text)
                elif cache.get(activity_id) is not None:
                    await client.send_message(bot_id, f'跑过 {text}')
                    return
                cache.set(activity_id, activity_id)
            else:
                if cache.get(text) is not None:
                    await client.send_message(bot_id, f'跑过 {text}')
                    return
                cache.set(text, text)
        logger.info(f"最终变量 {text}")
        kv = text.replace("export ", "")
        key = kv.split("=")[0]
        value = re.findall(r'"([^"]*)"', kv)[0]
        action = monitor_scripts.get(key)
        logger.info(f'ACTION {action}')
        if action is None:  # 没有自动车
            await client.send_message(bot_id, f'没有自动车 #{text}')
            return
        file = action.get("file", "")
        # 没有匹配的动作 或没开启
        name = action.get("name")
        enable = action.get("enable")
        logger.info(f'name {name} enable {enable}')
        if not enable:
            await client.send_message(bot_id, f'未开启任务 #{name}')
            return
        queue = action.get("queue")
        logger.info(f'queue {queue} name {name}')
        if queue:
            await queues[action.get("queue_name")].put({"text": text, "action": action})
            await client.send_message(bot_id, f'入队执行 #{name}')
            return
        logger.info(f'设置环境变量export {action}')
        await export(text)
        await client.send_message(bot_id, f'开始执行 #{name}')
        await cmd(f'cd {monitor_scripts_path} && {command} {file}')
    except Exception as e:
        logger.error(e)
        await client.send_message(bot_id, f'{str(e)}')


queues = {}


async def task(task_name, task_key):
    logger.info(f"队列监听--> {task_name} {task_key} 已启动，等待任务")
    curr_queue = queues[task_key]
    while True:
        try:
            param = await curr_queue.get()
            logger.info(f"出队执行开始 {param}")
            text = param.get("text")
            kv = text.replace("export ", "")
            key = kv.split("=")[0]
            value = re.findall(r'"([^"]*)"', kv)[0]
            logger.info(f'出队执行变量与值 {key},{value}')
            action = param.get("action")
            logger.info(f'ACTION {action}')
            file = action.get("file", "")
            logger.info(f'JTASK命令 {file},{parse.quote_plus(value)}')
            logger.info(f'出队执行-->设置环境变量export {action}')
            await export(text)
            await cmd(f'cd {monitor_scripts_path} && {command} {file}')
            if curr_queue.qsize() > 1:
                await client.send_message(bot_id, f'{action["name"]}，队列长度{curr_queue.qsize()}，将等待{action["wait"]}秒...')
                await asyncio.sleep(action['wait'])
        except Exception as e:
            logger.error(e)


async def cmd(text):
    try:
        logger.info(f"执行命令{text}")
        if 'node' in text:
            name = re.findall(r'node (.*).js', text)[0]
        else:
            name = re.findall(r'task (.*).js', text)[0]
        tmp_log = f'{log_path}/{name}.{datetime.datetime.now().strftime("%H%M%S%f")}.log'
        proc = await asyncio.create_subprocess_shell(
            f"{text} >> {tmp_log} 2>&1",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await proc.communicate()
        if log_send:
            await client.send_file(bot_id, tmp_log)
        # os.remove(tmp_log)
    except Exception as e:
        logger.error(e)
        await client.send_message(bot_id, f'something wrong,I\'m sorry\n{str(e)}')


if __name__ == "__main__":
    try:
        logger.info("开始运行")
        for key in monitor_scripts:
            action = monitor_scripts[key]
            name = action.get('name')
            queue = action.get("queue")
            if queue:
                queues[action.get("queue_name")] = asyncio.Queue()
                client.loop.create_task(task(name, key))
            else:
                logger.info(f"无需队列--> {name} {key}")
        client.run_until_disconnected()
    except Exception as e:
        logger.error(e)
        client.disconnect()
