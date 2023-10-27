import asyncio
import datetime
import json
import logging
import os
import re
import time
from urllib import parse

from cacheout import FIFOCache
from telethon import TelegramClient, events

# 0. 进入容器
# 1. pip3 install -U cacheout
# 2. 复制magic.py,magic.json到/ql/config/目录 并配置
# 3. python3 /ql/config/magic.py 用手机号登录
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
cache = FIFOCache(maxsize=properties.get("monitor_cache_size"), ttl=0, timer=time.time)

# Telegram相关
api_id = properties.get("api_id")
api_hash = properties.get("api_hash")
bot_id = properties.get("bot_id")
bot_token = properties.get("bot_token")
user_id = properties.get("user_id")
# 监控相关
log_path = properties.get("log_path")
log_send = properties.get("log_send", True)
log_send_id = properties.get("log_send_id")
monitor_cars = properties.get("monitor_cars")
logger.info(f"监控的频道或群组-->{monitor_cars}")
monitor_converters = properties.get("monitor_converters")
logger.info(f"监控转换器-->{monitor_converters}")
monitor_converters_whitelist_keywords = properties.get("monitor_converters_whitelist_keywords")
logger.info(f"不转换白名单关键字-->{monitor_converters_whitelist_keywords}")
monitor_black_keywords = properties.get("monitor_black_keywords")
logger.info(f"黑名单关键字-->{monitor_black_keywords}")
monitor_scripts = properties.get("monitor_scripts")
monitor_auto_stops = properties.get("monitor_auto_stops")
logger.info(f"监控的自动停车-->{monitor_auto_stops}")
rules = properties.get("rules")
logger.info(f"监控的自动解析-->{monitor_auto_stops}")

if properties.get("proxy"):
    if properties.get("proxy_type") == "MTProxy":
        proxy = {
            'addr': properties.get("proxy_addr"),
            'port': properties.get("proxy_port"),
            'proxy_secret': properties.get('proxy_secret', "")
        }
    else:
        proxy = {
            'proxy_type': properties.get("proxy_type"),
            'addr': properties.get("proxy_addr"),
            'port': properties.get("proxy_port"),
            'username': properties.get('proxy_username', ""),
            'password': properties.get('proxy_password', "")
        }
    client = TelegramClient("magic", api_id, api_hash, proxy=proxy, auto_reconnect=True, retry_delay=1, connection_retries=99999).start()
else:
    client = TelegramClient("magic", api_id, api_hash, auto_reconnect=True, retry_delay=1, connection_retries=99999).start()


def rest_of_day():
    """
    :return: 截止到目前当日剩余时间
    """
    today = datetime.datetime.strptime(str(datetime.date.today()), "%Y-%m-%d")
    tomorrow = today + datetime.timedelta(days=1)
    nowTime = datetime.datetime.now()
    return (tomorrow - nowTime).seconds - 90  # 获取秒


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
@client.on(events.NewMessage(chats=[bot_id], pattern='^在吗$'))
async def handler(event):
    await client.send_message(bot_id, f'老板啥事？')


# 提取多行转换
async def converter_lines(text):
    before_eps = text.split("\n")
    after_eps = [elem for elem in before_eps if elem.startswith("export")]
    return await converter_handler("\n".join(after_eps))


# 设置变量
@client.on(events.NewMessage(from_users=[user_id], pattern='^(run|Run)$'))
async def handler(event):
    try:
        reply = await event.get_reply_message()
        if event.is_reply is False:
            return
        if "export" in reply.text:
            # 提取变量
            text = await converter_lines(reply.text)
            text = re.findall(r'(export.*)', text)[0]
            await export(text)
            kv = text.replace("export ", "")
            logger.info(kv)
            key = kv.split("=")[0]
            action = monitor_scripts.get(key)
            command = action.get("task", "")
            await cmd(command)
        else:
            # 提取变量
            activity_id, url = await get_activity_info(reply.text)
            if activity_id is None:
                logger.info(f"未找到id [%s],退出", url)
                return
            is_break = False
            for rule_key in rules:
                if is_break:
                    break
                result = re.search(rule_key, url)
                if result is None:
                    logger.info(f"不匹配%s,下一个", rule_key)
                    continue
                value = rules.get(rule_key)
                env = value.get("env")
                argv_len = len(re.findall("%s", env))
                env_key = re.findall("export (.*)=", env)[0]
                if argv_len == 1:
                    env = env % url
                elif argv_len == 2:
                    env = env % (activity_id, url)
                elif argv_len == 3:
                    domain = re.search('(https?://[^/]+)', url)[0]
                    env = env % (activity_id, domain, "None")
                else:
                    logger.info("还不支持")
                    break
                await export(env)
                action = monitor_scripts.get(env_key)
                command = action.get("task", "")
                await cmd(command)
                break
    except Exception as e:
        logger.error(e)


# 设置变量
@client.on(events.NewMessage(chats=[bot_id], pattern='^清理缓存$'))
async def handler(event):
    b_size = cache.size()
    logger.info(f"清理前缓存数量，{b_size}")
    cache.clear()
    a_size = cache.size()
    logger.info(f"清理后缓存数量，{a_size}")
    await client.send_message(bot_id, f'清理缓存结束 {b_size}-->{a_size}')


async def get_activity_info(text):
    result = re.findall(r'((http|https)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|])', text)
    if len(result) <= 0:
        return None, None
    url = re.search('((http|https)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|])', text)[0]
    params = parse.parse_qs(parse.urlparse(url).query)
    ban_rule_list = [
        'activityId',
        'giftId',
        'actId',
        'tplId',
        'token',
        'code',
        'a',
        'id']
    activity_id = ''
    for key in ban_rule_list:
        activity_id = params.get(key)
        logger.info(activity_id)
        if activity_id is not None:
            activity_id = params.get(key)
            activity_id = activity_id[0]
            break
    return activity_id, url


@client.on(events.NewMessage(chats=monitor_cars, pattern=r'(export\s?\w*=(".*"|\'.*\')|[/ikun])'))
async def handler(event):
    origin = event.message.text
    text = re.findall(r'https://i.walle.com/api\?data=(.+)?\)', origin)
    if len(text) > 0:
        text = parse.unquote_plus(text[0])
    elif "export" in origin:
        text = origin
    else:
        return
    groupname = "mybot"
    try:
        groupname = f'[{event.chat.title}](https://t.me/c/{event.chat.id}/{event.message.id})'
    except Exception:
        pass
    try:
        origin_text = text
        logger.info(f"原始数据 {origin_text}")
        # 黑名单
        for b_key in monitor_black_keywords:
            result = re.search(b_key, origin_text)
            if result is not None:
                await client.send_message(bot_id, f'黑名单 {b_key} {text}')
                return
        text = await converter_handler(text)
        activity_id, url = await get_activity_info(text)
        if "mybot" not in groupname:
            if activity_id is not None:
                if cache.get(activity_id) is not None:
                    await client.send_message(bot_id, f'【{groupname}】跑过 `{activity_id}`')
                    return
                cache.set(activity_id, activity_id, rest_of_day())
            else:
                if cache.get(text) is not None:
                    await client.send_message(bot_id, f'【{groupname}】跑过 {text}')
                    return
                cache.set(text, text, rest_of_day())
        logger.info(f"最终变量 {text}")
        kv = text.replace("export ", "")
        key = kv.split("=")[0]
        action = monitor_scripts.get(key)
        logger.info(f'ACTION {action}')
        if action is None:  # 没有自动车
            await client.send_message(bot_id, f'【{groupname}】没有自动车 {text}')
            return
        # 没有匹配的动作 或没开启
        if not action.get("enable"):
            await client.send_message(bot_id, f'【{groupname}】没启用任务 {key}')
            return
        command = action.get("task", "")
        if command == '':
            await client.send_message(bot_id, f'【{groupname}】没有配置任务 {key}')
            return
        name = action.get("name")
        if action.get("queue"):
            await queues[action.get("queue_name")].put({"text": text, "groupname": groupname, "action": action})
            await client.send_message(bot_id, f'【{groupname}】入队执行 #{name}')
            return
        await export(text)
        await client.send_message(bot_id, f'【{groupname}】开始执行 #{name}')
        await cmd(command)
    except Exception as e:
        logger.error(e)
        await client.send_message(bot_id, f'{str(e)}')


async def converter_handler(text):
    text = "\n".join(list(filter(lambda x: "export " in x, text.replace("`", "").split("\n"))))
    for c_w_key in monitor_converters_whitelist_keywords:
        result = re.search(c_w_key, text)
        if result is not None:
            logger.info(f"无需转换 {text}")
            return text
    logger.info(f"转换前数据 {text}")
    try:
        tmp_text = text
        # 转换
        for c_key in monitor_converters:
            result = re.search(c_key, text)
            if result is None:
                logger.info(f"规则不匹配 {c_key},下一个")
                continue
            rule = monitor_converters.get(c_key)
            target = rule.get("env")
            argv_len = len(re.findall("%s", target))
            values = re.findall(r'"([^"]*)"', text)
            if argv_len == 1:
                target = target % (values[0])
            elif argv_len == 2:
                target = target % (values[0], values[1])
            elif argv_len == 3:
                target = target % (values[0], values[1], values[2])
            else:
                print("不支持更多参数")
            text = target
            break
    except Exception as e:
        logger.info(str(e))
    logger.info(f"转换后数据 {text}")
    return text


queues = {}


async def task(task_name, task_key):
    logger.info(f"队列监听--> {task_name} {task_key} 已启动，等待任务")
    curr_queue = queues[task_key]
    while True:
        try:
            param = await curr_queue.get()
            logger.info(f"出队执行 {param}")
            exec_action = param.get("action")
            # 默认立马执行
            await client.send_message(bot_id, f'【{param.get("groupname")}】出队执行 #{exec_action.get("name")}')
            await export(param.get("text"))
            await cmd(exec_action.get("task", ""))
            if curr_queue.qsize() > 1:
                exec_action = param.get("action")
                await client.send_message(bot_id, f'{exec_action["name"]}，队列长度{curr_queue.qsize()}，将等待{exec_action["wait"]}秒...')
                await asyncio.sleep(exec_action['wait'])
        except Exception as e:
            logger.error(e)


async def cmd(exec_cmd):
    try:
        logger.info(f'执行命令 {exec_cmd}')
        name = re.findall(r'(?:.*/)*([^. ]+)\.(?:js|py|sh)', exec_cmd)[0]
        tmp_log = f'{log_path}/{name}.{datetime.datetime.now().strftime("%H%M%S%f")}.log'
        logger.info(f'日志文件 {tmp_log}')
        proc = await asyncio.create_subprocess_shell(
            f"{exec_cmd} >> {tmp_log} 2>&1",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await proc.communicate()
        if log_send:
            await client.send_file(log_send_id, tmp_log)
            os.remove(tmp_log)
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
            queue_name = action.get("queue_name")
            if queues.get(queue_name) is not None:
                logger.info(f"队列监听--> {name} {queue_name} 已启动，等待任务")
                continue
            queues[queue_name] = asyncio.Queue()
            client.loop.create_task(task(name, queue_name))
        client.run_until_disconnected()
    except Exception as e:
        logger.error(e)
        client.disconnect()
