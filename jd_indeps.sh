#!/usr/bin/env bash
# 依赖安装脚本
# 0 8 5 5 * jd_indeps.sh
# new Env('依赖安装');
# updatedate:20240903

set -euo pipefail  # 启用严格错误检查

# 动态获取青龙根目录
if [ -d "/ql/data" ]; then
    dir_root="/ql/data"
else
    dir_root="/ql"
fi

dir_repo="$dir_root/repo"
dir_deps="$dir_root/deps"
dir_log="$dir_root/log"

# 自动配置 sendNotify.js
if [[ "${AUTOCFG:-}" == 'true' ]]; then
    if [[ -z "$(pwd | grep 'main')" ]]; then
        dir_code="$dir_log/shufflewzc_faker2_jd_sharecode"
        repo='shufflewzc_faker2'
    else
        dir_code="$dir_log/shufflewzc_faker2_main_jd_sharecode"
        repo='shufflewzc_faker2_main'
    fi

    [[ -d "$dir_root/data" ]] && dir_data="$dir_root/data"
    [[ -d "$dir_data/repo" ]] && dir_repo="$dir_data/repo"
    [[ -d "$dir_data/deps" ]] && dir_deps="$dir_data/deps"

    if [ -f "$dir_repo/${repo}/sendNotify.js" ]; then
        cp "$dir_repo/${repo}/sendNotify.js" "$dir_deps/"
        echo -e "\n已配置 sendNotify.js 到 deps 目录\n"
    else
        echo -e "\n错误：未找到 sendNotify.js 文件！\n"
        exit 1
    fi
else
    echo -e "\n提示：如需自动配置 sendNotify.js，请设置变量 AUTOCFG='true'\n"
fi

# 检查权限
if [ "$EUID" -ne 0 ]; then
    SUDO="sudo"
else
    SUDO=""
fi

# 配置 pnpm 镜像
pnpm config set registry https://registry.npmmirror.com

# 处理 pnpm v7+ 环境变量
npm_ver=$(pnpm -v | awk -F. '{print $1}')
if [[ $npm_ver -ge 7 ]]; then
    export PNPM_HOME="/root/.local/share/pnpm"
    export PATH="$PNPM_HOME:$PATH"
fi

echo -e "\n开始检查依赖列表并安装依赖...\n"

# 目标依赖列表
declare -A target_deps=(
    ["tough-cookie"]="4.1.4"
    ["ds"]="2.0.2"
    ["png-js"]="1.0.0"
    ["date-fns"]="3.6.0"
    ["axios"]="1.7.4"
    ["crypto-js"]="4.2.0"
    ["request"]="2.88.2"
    ["jsdom"]="24.1.1"
    ["moment"]="2.30.1"
    ["cheerio"]="1.0.0"
    ["tunnel"]="latest"
    ["https-proxy-agent"]="7.0.5"
    ["sharp"]="0.32.0"
    ["qs"]="6.11.0"
)

# 获取已安装的全局依赖
installed_deps=$(pnpm list -g --depth=0 --parseable 2>/dev/null | awk -F@ '{print $1, $2}')

# 安装或更新依赖
for dep in "${!target_deps[@]}"; do
    target_version="${target_deps[$dep]}"
    installed_version=$(echo "$installed_deps" | awk -v dep="$dep" '$1 == dep {print $2}')

    if [[ -z "$installed_version" ]]; then
        echo "正在安装 $dep@$target_version ..."
        pnpm i -g "$dep@$target_version" || { echo "安装 $dep@$target_version 失败！"; exit 1; }
    elif [[ "$installed_version" != "$target_version" ]]; then
        echo "正在更新 $dep ($installed_version -> $target_version) ..."
        pnpm i -g "$dep@$target_version" || { echo "更新 $dep@$target_version 失败！"; exit 1; }
    else
        echo "$dep@$installed_version 已是最新版本，跳过安装。"
    fi
done

# 安装 Python 依赖
pip3 install -i https://pypi.doubanio.com/simple/ --upgrade jieba requests

# 清理 canvas 冲突文件
canvas_paths=(
    "/usr/local/pnpm-global/5/node_modules/.pnpm/canvas*"
    "/root/.local/share/pnpm/global/5/.pnpm/canvas*"
)

for path in "${canvas_paths[@]}"; do
    if [ -d "$path" ]; then
        rm -rf "$path"
    fi
done

echo -e "\n依赖检查与安装完成！请检查是否有报错。\n"