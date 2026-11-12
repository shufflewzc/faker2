#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
京东 Cookie 一键获取工具（扫码登录 · 多账号 · 登录态缓存）
==========================================
适用：在本机（macOS / Windows / Linux）运行，自动打开京东扫码登录页，
      手机京东 App 扫码，登录成功后自动提取 JD_COOKIE（pt_key/pt_pin 等），
      并保存浏览器登录态到本地缓存，下次启动优先恢复 —— 只要京东登录态
      未失效即可免扫码直接刷新 Cookie，减少重复扫码。

安装依赖：
    pip install playwright
    playwright install chromium

运行：
    python3 jd_cookie_helper.py                 # 首次扫码；之后优先用缓存免扫码
    python3 jd_cookie_helper.py --force-scan    # 忽略缓存，强制重新扫码
    python3 jd_cookie_helper.py --headless      # 无界面（需已有缓存，否则看不清二维码）
    python3 jd_cookie_helper.py --output f.txt  # 指定输出文件
    python3 jd_cookie_helper.py --no-clipboard  # 不复制剪贴板

说明：
- 仅在本地运行，Cookie / 登录态只保存在本地文件，不会上传任何地方。
- 登录态缓存文件（默认 jd_auth_state.json）与 Cookie 同样敏感，请勿外泄/提交仓库。
- 多账号用  &  连起来（青龙 JD_COOKIE 约定）。
- 京东会风控，登录态一般几天到几十天失效；失效后重跑本工具会自动重新扫码。
"""

import sys
import os
import time
import argparse
import subprocess

# 只保留这些关键字段，足够青龙脚本使用
KEEP_FIELDS = ("pt_key", "pt_pin", "pt_token", "pwdt_id", "sessionid", "trackId")
LOGIN_URL = "https://passport.jd.com/new/login.aspx"
DEFAULT_STATE = "jd_auth_state.json"

# 运行时由 --state 覆盖（scan_one 内保存缓存用）
STATE_FILE = DEFAULT_STATE


def copy_to_clipboard(text):
    """跨平台复制到剪贴板（失败静默忽略）"""
    try:
        if sys.platform == "darwin":
            subprocess.run(["pbcopy"], input=text.encode("utf-8"), check=False)
        elif sys.platform == "win32":
            subprocess.run(["clip"], input=text.encode("utf-8"), check=False)
        else:
            subprocess.run(["xclip", "-selection", "clipboard"],
                           input=text.encode("utf-8"), check=False)
    except Exception:
        pass


def ensure_qrcode(page):
    """尽量切到「扫码登录」tab（找不到就跳过，可能默认已是扫码）"""
    for kw in ("扫码登录", "扫码", "二维码登录"):
        try:
            page.get_by_text(kw, exact=False).first.click(timeout=4000)
            print("已切换到扫码登录")
            return
        except Exception:
            continue


def wait_login(context, timeout=180):
    """轮询等待登录成功，拿到有效 pt_key & pt_pin 即返回 cookie 串；超时返回 None"""
    deadline = time.time() + timeout
    while time.time() < deadline:
        cookies = {c["name"]: c["value"] for c in context.cookies()}
        pt_key = cookies.get("pt_key", "")
        pt_pin = cookies.get("pt_pin", "")
        if pt_key and pt_pin and pt_key not in ("null", "undefined", ""):
            time.sleep(1)  # 让京东补全其余字段
            cookies = {c["name"]: c["value"] for c in context.cookies()}
            return "; ".join(f"{k}={cookies[k]}" for k in KEEP_FIELDS if cookies.get(k))
        time.sleep(2)
    return None


def try_restore(browser, state_file):
    """尝试用缓存恢复登录态；失败（无文件 / 跳登录页）返回 None"""
    if not os.path.exists(state_file):
        return None
    try:
        context = browser.new_context(storage_state=state_file)
        page = context.new_page()
        page.goto("https://home.jd.com/", timeout=30000, wait_until="domcontentloaded")
        time.sleep(2)
        # 跳转到 passport 登录页 => 缓存已失效
        if "passport.jd.com" in page.url:
            context.close()
            return None
        return context
    except Exception:
        return None


def save_state(context, state_file):
    try:
        context.storage_state(path=state_file)
        return True
    except Exception:
        return False


def scan_one(browser):
    """有头扫码拿一个账号；成功返回 cookie 串并保存登录态缓存，失败返回 None"""
    context = browser.new_context()
    page = context.new_page()
    try:
        page.goto(LOGIN_URL, timeout=30000, wait_until="domcontentloaded")
    except Exception as e:
        print(f"打开登录页失败：{e}")
        context.close()
        return None
    ensure_qrcode(page)
    print("请用手机京东 App 扫码登录（最多等待 3 分钟）...")
    ck = wait_login(context, timeout=180)
    if ck:
        if save_state(context, STATE_FILE):
            print("[成功] 已取得账号 Cookie，登录态已缓存到 " + STATE_FILE)
        else:
            print("[成功] 已取得账号 Cookie（登录态缓存保存失败，可忽略）")
    else:
        print("[失败] 等待超时，未检测到登录成功。")
    context.close()
    return ck


def main():
    global STATE_FILE
    parser = argparse.ArgumentParser(description="京东 Cookie 获取工具（扫码登录 · 缓存）")
    parser.add_argument("--output", default="jd_cookie.txt", help="输出文件路径（默认 jd_cookie.txt）")
    parser.add_argument("--no-clipboard", action="store_true", help="不复制到剪贴板")
    parser.add_argument("--headless", action="store_true", help="无界面模式（需已有缓存，否则看不清二维码）")
    parser.add_argument("--state", default=DEFAULT_STATE, help="登录态缓存文件路径（默认 jd_auth_state.json）")
    parser.add_argument("--force-scan", action="store_true", help="忽略缓存，强制重新扫码")
    args = parser.parse_args()

    # playwright 是运行期硬依赖，放在参数解析之后检查，便于 --help 正常显示
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("缺少依赖 playwright，请先执行：")
        print("  pip install playwright")
        print("  playwright install chromium")
        sys.exit(1)

    STATE_FILE = args.state

    accounts = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=args.headless)
        try:
            # 第一个账号：优先用登录态缓存恢复（免扫码）
            got_first = False
            if os.path.exists(args.state) and not args.force_scan:
                ctx = try_restore(browser, args.state)
                if ctx:
                    ck = wait_login(ctx, timeout=30)
                    if ck:
                        accounts.append(ck)
                        save_state(ctx, args.state)
                        ctx.close()
                        got_first = True
                        print("\n[缓存] 已从登录态缓存恢复第 1 个账号（免扫码）。")
                    else:
                        ctx.close()
                        try:
                            os.remove(args.state)
                        except Exception:
                            pass
                        print("[缓存] 登录态已失效，将重新扫码。")

            if not got_first:
                ck = scan_one(browser)
                if ck:
                    accounts.append(ck)
                else:
                    print("\n未获取到任何账号 Cookie，退出。")
                    sys.exit(1)

            # 继续添加更多账号（扫码流程）
            while True:
                more = input("继续添加其他账号？(y/n，默认 n)：").strip().lower()
                if more not in ("y", "yes"):
                    break
                ck = scan_one(browser)
                if ck:
                    accounts.append(ck)
                else:
                    print("本次未获取到，停止添加。")
                    break
        finally:
            browser.close()

    if not accounts:
        print("\n未获取到任何账号 Cookie，退出。")
        sys.exit(1)

    combined = " & ".join(accounts)
    try:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(combined + "\n")
        print(f"\n已将 {len(accounts)} 个账号的 Cookie 写入：{args.output}")
    except Exception as e:
        print(f"写入文件失败：{e}")

    if not args.no_clipboard:
        copy_to_clipboard(combined)
        print("已复制到剪贴板（如需禁用加 --no-clipboard）")

    print("\n========== 复制下面这行到青龙面板 JD_COOKIE ==========")
    print(combined)
    print("=======================================================\n")
    print("多账号已用  &  连接。青龙环境变量 JD_COOKIE 填这一整行即可。")


if __name__ == "__main__":
    main()
