#!/usr/bin/env bash
#依赖安装
#0 8 5 5 * jd_indeps.sh
#new Env('依赖安装');
#updatedate:20240903
#

DIR="$( pwd )"
dir_root=/ql
dir_repo=$dir_root/repo
dir_deps=$dir_root/deps

if [[ $AUTOCFG == 'true' ]];then
    if [[ -z "$(echo "$DIR"|grep 'main')" ]];then
        dir_code=$dir_log/6dylan6_jdpro_jd_sharecode
        repo='6dylan6_jdpro' 
    else
        dir_code=$dir_log/6dylan6_jdpro_main_jd_sharecode
        repo='6dylan6_jdpro_main' 
    fi
    [[ -d $dir_root/data ]] && dir_data=$dir_root/data
    [[ -d $dir_data/repo ]] && dir_repo=$dir_data/repo
    [[ -d $dir_data/deps ]] && dir_deps=$dir_data/deps
    cp $dir_repo/${repo}/sendNotify.js $dir_deps/ > /dev/null 2>&1
    echo -e "\n已配置sendNotify.js文件到deps目录下，再次执行订阅生效\n"
else
    echo -e "\n如需自动配置sendNotify.js文件到desp目录下，请配置变量AUTOCFG='true'\n"
fi

npm_ver=`pnpm -v|awk -F. '{print $1}'`
if [[ $npm_ver -ge 7 ]];then
    export PNPM_HOME="/root/.local/share/pnpm"
    export PATH="$PNPM_HOME:$PATH"
fi

echo -e "安装本库所需依赖，不一定一次全部安装成功，完成请检查\n"
echo -e "开始安装............\n"

#apk add g++ make pixman-dev pango-dev cairo-dev pkgconf --no-cache
#apk add g++ make --no-cache
pnpm config set registry https://registry.npmmirror.com
pnpm install -g
pnpm i -g tough-cookie
pnpm i -g ds@2.0.2
pnpm i -g png-js@1.0.0
pnpm i -g date-fns@3.6.0
pnpm i -g axios@1.7.4
pnpm i -g crypto-js@4.2.0
# pnpm install -g ts-md5@1.3.1
# pnpm install -g tslib@2.6.3
# pnpm install -g @types/node@22.4.0
pnpm i -g request@2.88.2
pnpm i -g jsdom@24.1.1
pnpm i -g moment@2.30.1
pnpm i -g cheerio@1.0.0
pnpm i -g tunnel
# pnpm install -g tough-cookie@4.1.4
pnpm i -g https-proxy-agent@7.0.5
pip3 install -i https://pypi.doubanio.com/simple/ jieba
pip3 install -i https://pypi.doubanio.com/simple/ requests
rm -rf /usr/local/pnpm-global/5/node_modules/.pnpm/canvas*
rm -rf /root/.local/share/pnpm/global/5/.pnpm/canvas*
pnpm i -g sharp@0.32.0
echo -e "\n所需依赖安装完成，请检查有没有报错，可尝试再次运行"
