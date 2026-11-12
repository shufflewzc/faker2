#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
京东每日自动化脚本（青龙面板专用）
================================
功能（2026-10 实测校准）：
  1. 京东 App 签到领京豆（signBeanAct，实测可用）
  2. 做任务赚京豆（beanTaskList/beanDoTask/beanHomeIconDoTask，实测格式正确）
  3. 逛首页领京豆（beanHomeIconDoTask）

  以下活动接口已升级为 h5st 签名体系，纯 HTTP 脚本暂无法支持：
  京喜签到（活动疑似下线）、京东超市签到、东东农场、东东牧场。

== 部署步骤（飞牛 NAS 上的青龙面板）==
1. 青龙面板 → 环境变量 → 新建：
      名称：JD_COOKIE
      值  ：你的京东 Cookie（浏览器 F12 复制，需含 pt_key=...; pt_pin=...）
      多个账号用  &  或换行 分隔
2. 依赖管理 → 新建依赖 → 语言选 python → 输入 requests → 安装
3. 脚本管理 → 上传本文件到 /ql/data/scripts/jd_daily.py （或走订阅拉取）
4. 定时任务 → 新建：
      命令：python3 /ql/data/scripts/jd_daily.py
      cron：0 9 * * *   （每天上午 9 点，启动后会再随机延迟防风控）

== 说明 ==
- 本脚本调用京东公开接口，依赖京东服务端稳定性；部分活动接口会调整，
  如某任务长期失败，请参照青龙社区脚本更新对应 functionId / body。
- Cookie 含登录凭证，请只保存在青龙环境变量中，切勿外泄或提交到仓库。
"""

import os
import re
import sys
import json
import time
import random
import hashlib
import string

try:
    import requests
except ImportError:
    print("缺少依赖 requests，请在青龙「依赖管理」中安装 python 版 requests")
    sys.exit(1)

# ---------- 基础配置 ----------
UA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) "
      "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 "
      "Mobile/15E148 Safari/604.1")

# 尝试导入青龙自带通知模块；不存在则用打印兜底
try:
    from notify import send as ql_send
    HAVE_QL_NOTIFY = True
except Exception:
    HAVE_QL_NOTIFY = False


def notify(title, content):
    if HAVE_QL_NOTIFY:
        try:
            ql_send(title, content)
            return
        except Exception:
            pass
    print(f"\n===== {title} =====\n{content}\n")


# ---------- 工具函数 ----------
def _read_from_env_file(name):
    """兜底：老版本青龙会把环境变量写入 env.sh，若任务进程未注入则从此文件读取。"""
    candidates = ["/ql/config/env.sh", "/ql/data/config/env.sh", "/ql/.env"]
    for path in candidates:
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                txt = f.read()
            for line in txt.splitlines():
                line = line.strip()
                if line.startswith(f"export {name}=") or line.startswith(f"{name}="):
                    val = line.split("=", 1)[1].strip().strip("'").strip('"')
                    if val and val.lower() not in ("''", '""'):
                        return val
        except Exception:
            continue
    return ""


def _read_env_from_db(name):
    """兜底：青龙 2.x 的环境变量保存在 sqlite（env.db / database.sqlite 的 envs 表），
    API 创建的变量可能未注入任务进程，直接按变量名查库。"""
    try:
        import sqlite3
    except Exception:
        return ""
    candidates = [
        "/ql/data/db/env.db",
        "/ql/data/db/database.sqlite",
        "/ql/data/db/settings.db",
        "/ql/data/db/ql.db",
    ]
    tables = ("envs", "Envs", "ENV", "env")
    for db in candidates:
        try:
            conn = sqlite3.connect(db)
            cur = conn.cursor()
            cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tabs = [r[0] for r in cur.fetchall()]
            for tbl in tables:
                if tbl in tabs:
                    try:
                        cur.execute(f"SELECT name, value, status FROM {tbl}")
                        for n, value, status in cur.fetchall():
                            if n == name and str(status) == "0" and value:
                                conn.close()
                                return value
                    except Exception:
                        continue
            conn.close()
        except Exception:
            continue
    return ""


def get_env_value(name, default=""):
    """通用环境变量读取：进程环境 -> env.sh -> 青龙 env.db 兜底"""
    v = os.environ.get(name, "").strip()
    if not v:
        v = _read_from_env_file(name).strip()
    if not v:
        v = _read_env_from_db(name).strip()
    return v or default


def get_cookies():
    """从环境变量读取多个账号的 Cookie（支持 & 与换行分隔）"""
    raw = get_env_value("JD_COOKIE")
    if not raw:
        return []
    parts = re.split(r"[&\n]+", raw.strip())
    return [p.strip() for p in parts if p.strip()]


def get_pin(cookie):
    m = re.search(r"pt_pin=([^;]+)", cookie)
    if m:
        from urllib.parse import unquote
        return unquote(m.group(1))
    return "未知账号"


def gen_uuid():
    return "".join(random.choices(string.hexdigits.lower(), k=16))


def sign(body, stk, uuid="", version="2.0.0"):
    """
    京东简化签名算法（社区通用实现）。
    老接口通常无需签名；若某任务需要 h5st，可在此扩展后注入 api() 的 params。
    """
    ts = str(int(time.time() * 1000))
    st = [str(body.get(k, "")) for k in stk.split(",")]
    sha = hashlib.sha256()
    sha.update(("".join(st)).encode("utf-8"))
    stk_hash = sha.hexdigest()
    sha = hashlib.sha256()
    sha.update(("".join([uuid, stk_hash, ts, version])).encode("utf-8"))
    return {"st": stk_hash, "sign": sha.hexdigest(), "sv": version, "ts": ts}


def api(session, cookie, function_id, body, appid="ld"):
    """封装京东 client.action 请求"""
    url = "https://api.m.jd.com/client.action"
    ts = str(int(time.time() * 1000))
    uuid = gen_uuid()
    params = {
        "functionId": function_id,
        "appid": appid,
        "client": "android",
        "clientVersion": "11.0.0",
        "networkType": "wifi",
        "osVersion": "31",
        "uuid": uuid,
        "timestamp": ts,
    }
    data = {
        "body": json.dumps(body, separators=(",", ":")),
        "build": "167728",
    }
    headers = {
        "User-Agent": UA,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "*/*",
        "Cookie": cookie,
        "Referer": "https://h5.m.jd.com/",
        "Origin": "https://h5.m.jd.com",
    }
    try:
        r = session.post(url, params=params, data=data, headers=headers, timeout=15)
        return r.json()
    except Exception as e:
        return {"error": str(e)}


def _result(res, pin, name):
    """统一把接口返回转换成可读结果字符串（覆盖 echo/errorMessage/errorCode）"""
    if res.get("error"):
        return f"【{pin}】{name}失败：{res['error']}"
    if res.get("code") in ("0", 0) or res.get("success"):
        # code=0 但可能带业务错误码（风控软限流等）
        err_code = res.get("errorCode")
        err_msg = res.get("errorMessage")
        if err_code and err_msg:
            return f"【{pin}】{name}：{err_msg}({err_code})"
        return f"【{pin}】{name}成功"
    msg = res.get("errorMessage") or res.get("message") or res.get("echo") or res
    return f"【{pin}】{name}：{msg}"


# ---------- 具体任务 ----------
def task_jd_bean_sign(session, cookie):
    """京东 App 签到领京豆"""
    pin = get_pin(cookie)
    try:
        body = {"flag": "cp_sign", "version": 2, "channel": "签到领京豆"}
        api(session, cookie, "signBeanIndex", body)          # 查状态
        act = api(session, cookie, "signBeanAct", body)       # 执行签到
        if act.get("success") or act.get("code") in ("0", 0):
            d = act.get("data", {})
            num = d.get("beanNum") or d.get("message") or "已签到"
            return f"【{pin}】京东签到成功：{num}"
        return _result(act, pin, "京东签到")
    except Exception as e:
        return f"【{pin}】京东签到异常：{e}"


def _is_throttled(res):
    """判断是否被京东风控软限流（VH304/TI120 等业务错误码）"""
    ec = str(res.get("errorCode") or "")
    msg = str(res.get("errorMessage") or "")
    return ec in ("VH304", "TI120") or ("火爆" in msg) or ("人数较多" in msg)


def task_bean_tasks(session, cookie):
    """
    做任务赚京豆（2026-10 实测校准）
    流程（与社区 jd_bean_home 脚本一致）：
      1. beanHomeIconDoTask flag=0 做逛首页任务，flag=1 领奖
      2. beanTaskList 拉任务列表（含 taskToken）
      3. 浏览类任务(taskType 8/9)：beanDoTask actionType=1 → 等待 waitDuration → actionType=0 领取
      4. 非浏览类任务：beanDoTask actionType=1 完成即得分
    说明：接口无需 h5st 签名；短时间高频调用会触发风控限流（VH304/TI120），
    故限制单次最多做 10 个子任务、全程随机间隔。
    """
    pin = get_pin(cookie)
    log = []
    done = 0
    throttled = 0
    try:
        # 1) 逛首页任务（先做后领）
        try:
            r1 = api(session, cookie, "beanHomeIconDoTask",
                     {"flag": "0", "viewChannel": "myjd"})
            time.sleep(random.uniform(2, 4))
            r2 = api(session, cookie, "beanHomeIconDoTask",
                     {"flag": "1", "viewChannel": "AppHome"})
            if _is_throttled(r2):
                log.append("逛首页:限流")
                throttled += 1
            elif r2.get("code") in ("0", 0) and not r2.get("errorCode"):
                log.append("逛首页:OK")
                done += 1
            else:
                log.append("逛首页:-")
        except Exception as e:
            log.append(f"逛首页异常:{e}")

        # 2) 任务列表 + 逐个完成
        res = api(session, cookie, "beanTaskList",
                  {"viewChannel": "AppHome", "beanVersion": 1})
        if res.get("error"):
            log.append(f"任务列表失败:{res['error']}")
            return f"【{pin}】赚京豆：{' | '.join(log)}"
        tasks = (res.get("data") or {}).get("taskInfos") or []
        if not tasks:
            log.append("任务列表:0个")
            return f"【{pin}】赚京豆：{' | '.join(log)}"

        MAX_SUBTASKS = 10
        for t in tasks:
            if done >= MAX_SUBTASKS:
                break
            t_name = t.get("taskName", "?")
            t_type = t.get("taskType")
            if (t.get("times", 0) or 0) >= (t.get("maxTimes", 1) or 1):
                continue
            for sub in t.get("subTaskVOS") or []:
                if done >= MAX_SUBTASKS:
                    break
                if sub.get("status") != 1:
                    continue
                token = sub.get("taskToken", "")
                if not token:
                    continue
                r1 = api(session, cookie, "beanDoTask",
                         {"actionType": 1, "taskToken": token})
                if _is_throttled(r1):
                    throttled += 1
                    time.sleep(random.uniform(3, 6))
                    continue
                if t_type in (8, 9):
                    wait = min(t.get("waitDuration") or 5, 15)
                    time.sleep(wait + random.uniform(1, 3))
                    r0 = api(session, cookie, "beanDoTask",
                             {"actionType": 0, "taskToken": token})
                    if _is_throttled(r0):
                        throttled += 1
                    elif r0.get("code") in ("0", 0) and not r0.get("errorCode"):
                        done += 1
                        log.append(f"{t_name}:OK")
                    else:
                        log.append(f"{t_name}:"
                                   f"{r0.get('errorMessage') or r0.get('echo') or '-'}")
                else:
                    if r1.get("code") in ("0", 0) and not r1.get("errorCode"):
                        done += 1
                        log.append(f"{t_name}:OK")
                    else:
                        log.append(f"{t_name}:"
                                   f"{r1.get('errorMessage') or r1.get('echo') or '-'}")
                time.sleep(random.uniform(3, 8))
                break  # 每个任务当天做一次即可

        log.append(f"完成:{done}个" + (f"(限流:{throttled}次)" if throttled else ""))
        return f"【{pin}】赚京豆：{' | '.join(log)}"
    except Exception as e:
        return f"【{pin}】赚京豆异常：{e}"


# ---------- 主流程 ----------
def main():
    cookies = get_cookies()
    pins = [get_pin(c) for c in cookies]
    print(f"== 京东脚本启动：检测到 {len(cookies)} 个账号 -> {', '.join(pins)} ==")
    if not cookies:
        notify("京东脚本", "未检测到 JD_COOKIE 环境变量（进程/配置文件/数据库均未找到），请在青龙面板中配置。")
        return

    # 防风控：随机延迟后再开始（JD_DELAY_MAX 为最大分钟数，默认 30，设 0 关闭）
    try:
        delay_max = max(0, int(get_env_value("JD_DELAY_MAX", "30")))
    except ValueError:
        delay_max = 30
    if delay_max > 0:
        delay = random.randint(0, delay_max * 60)
        print(f"== 防风控：随机延迟 {delay // 60} 分 {delay % 60} 秒后开始执行"
              f"（环境变量 JD_DELAY_MAX 可调，单位分钟，0 为关闭）==")
        time.sleep(delay)

    all_msgs = []
    for cookie in cookies:
        s = requests.Session()
        s.headers.update({"Connection": "keep-alive"})
        msgs = [
            task_jd_bean_sign(s, cookie),
            task_bean_tasks(s, cookie),
        ]
        all_msgs.extend(msgs)
        time.sleep(random.uniform(3, 10))  # 账号间随机间隔，降低风控

    content = "\n".join(all_msgs)
    content += ("\n\n[说明] 京喜签到(活动已下线)、京东超市/东东农场/东东牧场"
                "\n(接口已升级为 h5st 签名体系)暂无法用纯脚本支持，详见 README。")
    notify("京东每日任务", content)
    print(content)


if __name__ == "__main__":
    main()
