#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
京东活动存活扫描器（本地运行，无需青龙依赖）
=========================================
通过京东接口 / 网页 探测当前可参与的京东活动（签到 / 种豆 / 农场 / 抽奖 等），
生成"哪些活动还活着、哪些已下线"的报告，避免你花时间配置已死活动。

== 用法 ==
  # 仅用公开接口 / 页面探测（不读 Cookie）
  python3 jd_activity_scanner.py

  # 传入京东 Cookie（提升 API 探测精度，能看到真实活动状态）
  python3 jd_activity_scanner.py --cookie "pt_key=...; pt_pin=...;"
  # 或复用环境变量 JD_COOKIE（与 jd_daily.py 同一变量名，支持多账号 & / 换行）
  JD_COOKIE="pt_key=...; pt_pin=...;" python3 jd_activity_scanner.py

  # 指定报告输出路径（默认 jd_activity_report.md）
  python3 jd_activity_scanner.py --output activity_report.md

  # 只扫描某一类（签到 / 任务 / 游戏 / 互动 / 聚合）
  python3 jd_activity_scanner.py --category 签到

  # 仅打印内置活动清单
  python3 jd_activity_scanner.py --list

== 探测策略 ==
  api   : 直接调用京东公开接口（无需 h5st 签名），根据返回判断是否在线 / 有数据
  page  : 抓取京东公开活动页，根据 HTTP 状态 + 结束关键词判断活动是否仍在线
  signed: 需 h5st 签名的活动（东东农场 / 种豆得豆 等），纯 HTTP 无法调用，
          标注"需社区 JS 脚本"，并附社区脚本名，由订阅仓库提供

== 说明 ==
  - 京东活动接口经常变动；标注 signed 的活动若想真正参与，请在青龙订阅社区
    JD 脚本仓库（搜"青龙 jd 订阅"找当前活跃的几个）。
  - Cookie 仅用于本地探测，请勿外泄或提交到仓库。
"""

import os
import re
import sys
import json
import time
import argparse
from urllib.parse import unquote
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    import requests
except ImportError:
    print("缺少依赖 requests，请先安装：pip install requests")
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


# ---------- 工具函数（与 jd_daily.py 同约定）----------
def get_env_value(name, default=""):
    return os.environ.get(name, "").strip() or default


def get_cookies():
    """从 --cookie 参数或环境变量 JD_COOKIE 读取多账号 Cookie（支持 & 与换行）"""
    raw = getattr(get_cookies, "_override", None)
    if not raw:
        raw = get_env_value("JD_COOKIE")
    if not raw:
        return []
    parts = re.split(r"[&\n]+", raw.strip())
    return [p.strip() for p in parts if p.strip()]


def get_pin(cookie):
    m = re.search(r"pt_pin=([^;]+)", cookie)
    if m:
        return unquote(m.group(1))
    return "未知账号"


def gen_uuid():
    import random
    import string
    return "".join(random.choices(string.hexdigits.lower(), k=16))


def api(session, cookie, function_id, body, appid="ld"):
    """封装京东 client.action 请求（无需 h5st 的老接口可直接用）"""
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
        "Cookie": cookie or "",
        "Referer": "https://h5.m.jd.com/",
        "Origin": "https://h5.m.jd.com",
    }
    try:
        r = session.post(url, params=params, data=data, headers=headers, timeout=15)
        return r.json()
    except Exception as e:
        return {"error": str(e)}


# ---------- 活动清单（数据驱动，可自行增删）----------
# probe:
#   api    -> 调用京东公开接口判断是否在线
#   page   -> 抓取公开活动页，按 HTTP 状态 + 结束关键词判断
#   signed -> 需 h5st 签名，纯 HTTP 无法调用，标注需社区 JS 脚本
ACTIVITIES = [
    # ---- 可直接调用的公开接口（无需签名）----
    {
        "name": "京东App签到领京豆",
        "category": "签到",
        "probe": "api",
        "function_id": "signBeanIndex",
        "body": {"flag": "cp_sign", "version": 2, "channel": "签到领京豆"},
        "note": "无需签名，jd_daily.py 已支持",
    },
    {
        "name": "赚京豆任务(逛首页/浏览)",
        "category": "任务",
        "probe": "api",
        "function_id": "beanTaskList",
        "body": {"viewChannel": "AppHome", "beanVersion": 1},
        "note": "无需签名，jd_daily.py 已支持",
    },

    # ---- 公开活动页可达性探测 ----
    {
        "name": "京东活动广场",
        "category": "聚合",
        "probe": "page",
        "url": "https://doing.jd.com/",
        "end_keywords": ["活动已结束", "页面不存在", "活动不存在"],
        "note": "聚合页，列出当前进行中的活动",
    },

    # ---- 需 h5st 签名的互动活动（纯 HTTP 无法调用，标注需社区 JS）----
    {
        "name": "东东农场",
        "category": "游戏",
        "probe": "signed",
        "community": "jd_fruit / jd_fruit_new（社区 JS，内置 h5st）",
        "note": "旧接口已全部失效，需 h5st 签名；本仓库 jd_fruit_new.js 已含",
    },
    {
        "name": "种豆得豆",
        "category": "游戏",
        "probe": "signed",
        "community": "jd_plantBean（社区 JS）",
        "note": "需 h5st 签名，社区 JS 支持",
    },
    {
        "name": "东东萌宠 / 宠汪汪",
        "category": "游戏",
        "probe": "signed",
        "community": "jd_pet / jd_joy（社区 JS）",
        "note": "需 h5st 签名，社区 JS 支持",
    },
    {
        "name": "摇一摇",
        "category": "互动",
        "probe": "signed",
        "community": "jd_yzy / 社区合集（社区 JS）",
        "note": "每日19点互动游戏，需 h5st 签名",
    },
    {
        "name": "天天刮京豆",
        "category": "互动",
        "probe": "signed",
        "community": "jd_guagua（本仓库 jd_guagua.js 已含）",
        "note": "需 h5st 签名，本仓库已配启动器 jd_guagua_run.py",
    },
    {
        "name": "京喜签到",
        "category": "签到",
        "probe": "signed",
        "community": "jd_jxsign（社区 JS）",
        "note": "README 记录：活动疑似下线（专用域名不可达、functionId 失效）",
    },
    {
        "name": "京东超市签到",
        "category": "签到",
        "probe": "signed",
        "community": "jd_cjhy / 社区合集（社区 JS）",
        "note": "README 记录：旧接口失效，新接口需 h5st 签名",
    },
    {
        "name": "店铺签到活动(10月多店)",
        "category": "签到",
        "probe": "signed",
        "community": "关注店铺类脚本（jd_shop_sign 等）",
        "note": "10.1-10.31 多个店铺签到（金领冠/朗德万斯等），需关注店铺脚本顺带完成",
    },
]


# ---------- 探测逻辑 ----------
def probe_api(session, cookie, act):
    """调用京东公开接口，判断活动是否在线 / 有数据"""
    try:
        res = api(session, cookie, act["function_id"], act.get("body", {}))
        if res.get("error"):
            return ("探测失败", f"网络错误: {res['error']}")
        if res.get("code") in ("0", 0) or res.get("success"):
            ec = res.get("errorCode")
            em = res.get("errorMessage")
            if ec and em:
                if "未登录" in em or "登录" in em:
                    return ("需登录查看", em)
                dead_kw = ["已结束", "已下线", "不存在", "未开始", "活动太火爆"]
                if any(k in em for k in dead_kw):
                    return ("已结束/下线", em)
                return ("进行中", f"接口正常(业务提示: {em})")
            return ("进行中", "接口正常返回数据")
        em = res.get("errorMessage") or res.get("message") or "未知返回"
        if "未登录" in em or "登录" in em:
            return ("需登录查看", em)
        return ("异常", em)
    except Exception as e:
        return ("探测失败", str(e))


def probe_page(session, cookie, act):
    """抓取公开活动页，按 HTTP 状态 + 结束关键词判断"""
    url = act["url"]
    headers = {"User-Agent": UA, "Cookie": cookie or ""}
    try:
        r = session.get(url, headers=headers, timeout=15, allow_redirects=True)
        final_url = r.url
        text = r.text or ""
        if "login" in final_url or "passport" in final_url:
            return ("需登录查看", "页面跳转到登录页（配置 Cookie 后可看真实状态）")
        for kw in act.get("end_keywords", []):
            if kw in text:
                return ("已结束/下线", f"页面含关键词: {kw}")
        if r.status_code == 200:
            return ("进行中", f"HTTP {r.status_code}, 页面可访问")
        return ("异常", f"HTTP {r.status_code}")
    except Exception as e:
        return ("探测失败", str(e))


def probe_signed(act):
    """需 h5st 签名的活动：标注需社区 JS，本工具不直接探测"""
    return ("需签名脚本", act.get("community", "需社区 JS 脚本(h5st)"))


def probe_one(act, cookie):
    if act["probe"] == "api":
        status, detail = probe_api(session_global, cookie, act)
    elif act["probe"] == "page":
        status, detail = probe_page(session_global, cookie, act)
    else:
        status, detail = probe_signed(act)
    return {
        "name": act["name"],
        "category": act["category"],
        "status": status,
        "detail": detail,
        "note": act.get("note", ""),
    }


# ---------- 报告 ----------
STATUS_ORDER = ["进行中", "需登录查看", "需签名脚本", "已结束/下线", "异常", "探测失败"]


def build_report(results):
    # 分组统计
    groups = {}
    for r in results:
        groups.setdefault(r["status"], []).append(r)

    lines = []
    lines.append("# 京东活动存活扫描报告\n")
    lines.append(f"> 生成时间：{time.strftime('%Y-%m-%d %H:%M:%S')}  "
                 f"| 探测账号数：{len(get_cookies())}  "
                 f"| 活动总数：{len(results)}\n")

    # 概览
    lines.append("## 概览\n")
    lines.append("| 状态 | 数量 |")
    lines.append("|---|---|")
    for st in STATUS_ORDER:
        if st in groups:
            lines.append(f"| {st} | {len(groups[st])} |")
    lines.append("")

    # 明细
    lines.append("## 活动明细\n")
    lines.append("| 活动 | 类别 | 状态 | 说明 / 详情 | 备注 |")
    lines.append("|---|---|---|---|---|")
    for st in STATUS_ORDER:
        for r in groups.get(st, []):
            detail = (r["detail"] or "").replace("|", "/").replace("\n", " ")
            note = (r["note"] or "").replace("|", "/").replace("\n", " ")
            lines.append(f"| {r['name']} | {r['category']} | {r['status']} | {detail} | {note} |")
    lines.append("")

    lines.append("## 说明\n")
    lines.append("- **进行中**：接口/页面正常，可直接参与或已配脚本。")
    lines.append("- **需登录查看**：公开页跳登录，配置 JD_COOKIE 后重跑可见真实状态。")
    lines.append("- **需签名脚本**：需 h5st 签名，纯 HTTP 无法调用，请订阅社区 JS 仓库。")
    lines.append("- **已结束/下线**：活动页/接口已下线，无需再配置脚本。")
    lines.append("- **异常/探测失败**：网络或解析问题，可手动复核。")
    return "\n".join(lines)


def print_console(results):
    print("\n" + "=" * 60)
    print(f"京东活动扫描完成（共 {len(results)} 项）")
    print("=" * 60)
    groups = {}
    for r in results:
        groups.setdefault(r["status"], []).append(r)
    for st in STATUS_ORDER:
        items = groups.get(st)
        if not items:
            continue
        print(f"\n【{st}】（{len(items)}）")
        for r in items:
            extra = f" —— {r['detail']}" if r["detail"] else ""
            print(f"  - {r['name']}（{r['category']}）{extra}")
    print("\n" + "=" * 60)


# ---------- 主流程 ----------
session_global = None


def main():
    global session_global
    parser = argparse.ArgumentParser(description="京东活动存活扫描器")
    parser.add_argument("--cookie", help="京东 Cookie（pt_key=...; pt_pin=...;）")
    parser.add_argument("--output", default="jd_activity_report.md", help="报告输出路径")
    parser.add_argument("--category", help="只扫描指定类别（签到/任务/游戏/互动/聚合）")
    parser.add_argument("--concurrency", type=int, default=4, help="并发探测数（默认4）")
    parser.add_argument("--list", action="store_true", help="仅打印内置活动清单")
    args = parser.parse_args()

    if args.cookie:
        get_cookies._override = args.cookie

    acts = ACTIVITIES
    if args.category:
        acts = [a for a in acts if a["category"] == args.category]

    if args.list:
        print(f"内置活动清单（共 {len(acts)} 项）：")
        for a in acts:
            print(f"  - [{a['category']}/{a['probe']}] {a['name']}")
        return

    cookies = get_cookies()
    cookie = cookies[0] if cookies else ""

    session_global = requests.Session()
    session_global.headers.update({"Connection": "keep-alive"})

    print(f"== 京东活动扫描：内置 {len(acts)} 项活动，"
          f"账号 {len(cookies)} 个，并发 {args.concurrency} ==")

    results = []
    with ThreadPoolExecutor(max_workers=max(1, args.concurrency)) as ex:
        futures = {ex.submit(probe_one, a, cookie): a for a in acts}
        for fut in as_completed(futures):
            results.append(fut.result())

    # 按原清单顺序排序
    order = {id(a): i for i, a in enumerate(acts)}
    results.sort(key=lambda r: order.get(id(next(a for a in acts if a["name"] == r["name"])), 0))

    report = build_report(results)
    try:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(report)
        print(f"== 报告已写入：{args.output} ==")
    except Exception as e:
        print(f"== 报告写入失败：{e} ==")

    print_console(results)

    # 概要推送给青龙（如可用）
    alive = sum(1 for r in results if r["status"] == "进行中")
    notify("京东活动扫描", f"扫描 {len(results)} 项，进行中 {alive} 项，"
                          f"详见报告 {args.output}")


if __name__ == "__main__":
    main()
