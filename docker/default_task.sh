#!/bin/sh
set -e

# 放在这个初始化python3环境，目的减小镜像体积，一些不需要使用bot交互的用户可以不用拉体积比较大的镜像
# 在这个任务里面还有初始化还有目的就是为了方便bot更新了新功能的话只需要重启容器就完成更新
function initPythonEnv() {
  echo "开始安装运行jd_bot需要的python环境及依赖..."
  apk add --update python3-dev py3-pip py3-cryptography py3-numpy py-pillow
  echo "开始安装jd_bot依赖..."
  #测试
  #cd /jd_docker/docker/bot
  #合并
  cd /scripts/docker/bot
  pip3 install --upgrade pip
  pip3 install -r requirements.txt
  python3 setup.py install
}

#启动tg bot交互前置条件成立，开始安装配置环境
if [ "$1" == "True" ]; then
  initPythonEnv
  if [ -z "$DISABLE_SPNODE" ]; then
    echo "增加命令组合spnode ，使用该命令spnode jd_xxxx.js 执行js脚本会读取cookies.conf里面的jd cokie账号来执行脚本"
    (
      cat <<EOF
#!/bin/sh
set -e
first=\$1
cmd=\$*
echo \${cmd/\$1/}
if [ \$1 == "conc" ]; then
    for job in \$(cat \$COOKIES_LIST | grep -v "#" | paste -s -d ' '); do
        { export JD_COOKIE=\$job && node \${cmd/\$1/}
        }&
    done
elif [ -n "\$(echo \$first | sed -n "/^[0-9]\+\$/p")" ]; then
    echo "\$(echo \$first | sed -n "/^[0-9]\+\$/p")"
    { export JD_COOKIE=\$(sed -n "\${first}p" \$COOKIES_LIST) && node \${cmd/\$1/}
    }&
elif [ -n "\$(cat \$COOKIES_LIST  | grep "pt_pin=\$first")" ];then
    echo "\$(cat \$COOKIES_LIST  | grep "pt_pin=\$first")"
    { export JD_COOKIE=\$(cat \$COOKIES_LIST | grep "pt_pin=\$first") && node \${cmd/\$1/}
    }&
else
    { export JD_COOKIE=\$(cat \$COOKIES_LIST | grep -v "#" | paste -s -d '&') && node \$*
    }&
fi
EOF
    ) >/usr/local/bin/spnode
    chmod +x /usr/local/bin/spnode
  fi

  echo "spnode需要使用的到，cookie写入文件，该文件同时也为jd_bot扫码获自动取cookies服务"
  if [ -z "$JD_COOKIE" ]; then
    if [ ! -f "$COOKIES_LIST" ]; then
      echo "" >"$COOKIES_LIST"
      echo "未配置JD_COOKIE环境变量，$COOKIES_LIST文件已生成,请将cookies写入$COOKIES_LIST文件，格式每个Cookie一行"
    fi
  else
    if [ -f "$COOKIES_LIST" ]; then
      echo "cookies.conf文件已经存在跳过,如果需要更新cookie请修改$COOKIES_LIST文件内容"
    else
      echo "环境变量 cookies写入$COOKIES_LIST文件,如果需要更新cookie请修改cookies.conf文件内容"
      echo $JD_COOKIE | sed "s/[ &]/\\n/g" | sed "/^$/d" >$COOKIES_LIST
    fi
  fi

  CODE_GEN_CONF=/scripts/logs/code_gen_conf.list
  echo "生成互助消息需要使用的到的 logs/code_gen_conf.list 文件，后续需要自己根据说明维护更新删除..."
  if [ ! -f "$CODE_GEN_CONF" ]; then
    (
      cat <<EOF
#格式为
#互助类型-机器人ID-提交代码(根据bot作者配置得来)-活动脚本日志文件名-活动代码(根据bot作者配置得来)-查找互助码需要用到的定位字符串
#长期活动示例
#long-@TuringLabbot-jd_sgmh.log-sgmh-暂无
#临时活动示例
#temp-@TuringLabbot-jd_sgmh.log-sgmh-暂无
#每天变化活动示例
#daily-@TuringLabbot-jd_818.log-818-暂无

#种豆得豆
long-@TuringLabbot-/submit_activity_codes-jd_plantBean.log-bean-种豆得豆好友互助码】
#京东农场
long-@TuringLabbot-/submit_activity_codes-jd_fruit.log-farm-东东农场好友互助码】
#京东萌宠
long-@TuringLabbot-/submit_activity_codes-jd_pet.log-pet-东东萌宠好友互助码】
#东东工厂
long-@TuringLabbot-/submit_activity_codes-jd_jdfactory.log-ddfactory-东东工厂好友互助码】
#京喜工厂
long-@TuringLabbot-/submit_activity_codes-jd_dreamFactory.log-jxfactory-京喜工厂好友互助码】
#临时活动
temp-@TuringLabbot-/submit_activity_codes-jd_sgmh.log-sgmh-您的好友助力码为:
#临时活动
temp-@TuringLabbot-/submit_activity_codes-jd_cfd.log-jxcfd-主】你的互助码:
temp-@TuringLabbot-/submit_activity_codes-jd_global.log-jdglobal-好友助力码为

#分红狗活动
long-@LvanLamCommitCodeBot-/jdcrazyjoy-jd_crazy_joy.log-@N-crazyJoy任务好友互助码】
#签到领现金
long-@LvanLamCommitCodeBot-/jdcash-jd_cash.log-@N-您的助力码为
#京东赚赚
long-@LvanLamCommitCodeBot-/jdzz-jd_jdzz.log-@N-京东赚赚好友互助码】
EOF
    ) >$CODE_GEN_CONF
  else
    echo "logs/code_gen_conf.list 文件已经存在跳过初始化操作"
  fi

  echo "容器jd_bot交互所需环境已配置安装已完成..."
  curl -sX POST "https://api.telegram.org/bot$TG_BOT_TOKEN/sendMessage" -d "chat_id=$TG_USER_ID&text=恭喜🎉你获得feature容器jd_bot交互所需环境已配置安装已完成，并启用。请发送 /help 查看使用帮助。如需禁用请在docker-compose.yml配置 DISABLE_BOT_COMMAND=True" >>/dev/null

fi

#echo "暂停更新配置，不要尝试删掉这个文件，你的容器可能会起不来"
#echo '' >/scripts/logs/pull.lock

echo "定义定时任务合并处理用到的文件路径..."
defaultListFile="/scripts/docker/$DEFAULT_LIST_FILE"
echo "默认文件定时任务文件路径为 ${defaultListFile}"
mergedListFile="/scripts/docker/merged_list_file.sh"
echo "合并后定时任务文件路径为 ${mergedListFile}"

echo "第1步将默认定时任务列表添加到并后定时任务文件..."
cat $defaultListFile >$mergedListFile

echo "第2步判断是否存在自定义任务任务列表并追加..."
if [ $CUSTOM_LIST_FILE ]; then
  echo "您配置了自定义任务文件：$CUSTOM_LIST_FILE，自定义任务类型为：$CUSTOM_LIST_MERGE_TYPE..."
  # 无论远程还是本地挂载, 均复制到 $customListFile
  customListFile="/scripts/docker/custom_list_file.sh"
  echo "自定义定时任务文件临时工作路径为 ${customListFile}"
  if expr "$CUSTOM_LIST_FILE" : 'http.*' &>/dev/null; then
    echo "自定义任务文件为远程脚本，开始下载自定义远程任务。"
    wget -O $customListFile $CUSTOM_LIST_FILE
    echo "下载完成..."
  elif [ -f /scripts/docker/$CUSTOM_LIST_FILE ]; then
    echo "自定义任务文件为本地挂载。"
    cp /scripts/docker/$CUSTOM_LIST_FILE $customListFile
  fi

  if [ -f "$customListFile" ]; then
    if [ $CUSTOM_LIST_MERGE_TYPE == "append" ]; then
      echo "合并默认定时任务文件：$DEFAULT_LIST_FILE 和 自定义定时任务文件：$CUSTOM_LIST_FILE"
      echo -e "" >>$mergedListFile
      cat $customListFile >>$mergedListFile
    elif [ $CUSTOM_LIST_MERGE_TYPE == "overwrite" ]; then
      echo "配置了自定义任务文件：$CUSTOM_LIST_FILE，自定义任务类型为：$CUSTOM_LIST_MERGE_TYPE..."
      cat $customListFile >$mergedListFile
    else
      echo "配置配置了错误的自定义定时任务类型：$CUSTOM_LIST_MERGE_TYPE，自定义任务类型为只能为append或者overwrite..."
    fi
  else
    echo "配置的自定义任务文件：$CUSTOM_LIST_FILE未找到，使用默认配置$DEFAULT_LIST_FILE..."
  fi
else
  echo "当前只使用了默认定时任务文件 $DEFAULT_LIST_FILE ..."
fi

echo "第3步判断是否配置了随机延迟参数..."
if [ $RANDOM_DELAY_MAX ]; then
  if [ $RANDOM_DELAY_MAX -ge 1 ]; then
    echo "已设置随机延迟为 $RANDOM_DELAY_MAX , 设置延迟任务中..."
    sed -i "/\(jd_bean_sign.js\|jd_blueCoin.js\|jd_joy_reward.js\|jd_joy_steal.js\|jd_joy_feedPets.js\|jd_car_exchange.js\)/!s/node/sleep \$((RANDOM % \$RANDOM_DELAY_MAX)); node/g" $mergedListFile
  fi
else
  echo "未配置随机延迟对应的环境变量，故不设置延迟任务..."
fi

echo "第4步判断是否配置自定义shell执行脚本..."
if [ 0"$CUSTOM_SHELL_FILE" = "0" ]; then
  echo "未配置自定shell脚本文件，跳过执行。"
else
  if expr "$CUSTOM_SHELL_FILE" : 'http.*' &>/dev/null; then
    echo "自定义shell脚本为远程脚本，开始下载自定义远程脚本。"
    wget -O /scripts/docker/shell_script_mod.sh $CUSTOM_SHELL_FILE
    echo "下载完成，开始执行..."
    echo "#远程自定义shell脚本追加定时任务" >>$mergedListFile
    sh -x /scripts/docker/shell_script_mod.sh
    echo "自定义远程shell脚本下载并执行结束。"
  else
    if [ ! -f $CUSTOM_SHELL_FILE ]; then
      echo "自定义shell脚本为docker挂载脚本文件，但是指定挂载文件不存在，跳过执行。"
    else
      echo "docker挂载的自定shell脚本，开始执行..."
      echo "#docker挂载自定义shell脚本追加定时任务" >>$mergedListFile
      sh -x $CUSTOM_SHELL_FILE
      echo "docker挂载的自定shell脚本，执行结束。"
    fi
  fi
fi

echo "第5步删除不运行的脚本任务..."
if [ $DO_NOT_RUN_SCRIPTS ]; then
  echo "您配置了不运行的脚本：$DO_NOT_RUN_SCRIPTS"
  arr=${DO_NOT_RUN_SCRIPTS//&/ }
  for item in $arr; do
    sed -ie '/'"${item}"'/d' ${mergedListFile}
  done

fi

echo "第6步设定下次运行docker_entrypoint.sh时间..."
echo "删除原有docker_entrypoint.sh任务"
sed -ie '/'docker_entrypoint.sh'/d' ${mergedListFile}

# 12:00前生成12:00后的cron，12:00后生成第二天12:00前的cron，一天只更新两次代码
if [ $(date +%-H) -lt 12 ]; then
  random_h=$(($RANDOM % 12 + 12))
else
  random_h=$(($RANDOM % 12))
fi
random_m=$(($RANDOM % 60))

echo "设定 docker_entrypoint.sh cron为："
echo -e "\n# 必须要的默认定时任务请勿删除" >>$mergedListFile
echo -e "${random_m} ${random_h} * * * docker_entrypoint.sh >> /scripts/logs/default_task.log 2>&1" | tee -a $mergedListFile

echo "第7步 自动助力"
if [ -n "$ENABLE_AUTO_HELP" ]; then
  #直接判断变量，如果未配置，会导致sh抛出一个错误，所以加了上面一层
  if [ "$ENABLE_AUTO_HELP" = "true" ]; then
    echo "开启自动助力"
    #在所有脚本执行前，先执行助力码导出
    sed -i 's/node/ . \/scripts\/docker\/auto_help.sh export > \/scripts\/logs\/auto_help_export.log \&\& node /g' ${mergedListFile}
  else
    echo "未开启自动助力"
  fi
fi

echo "第8步增加 |ts 任务日志输出时间戳..."
sed -i "/\( ts\| |ts\|| ts\)/!s/>>/\|ts >>/g" $mergedListFile

echo "第9步执行proc_file.sh脚本任务..."
sh /scripts/docker/proc_file.sh

echo "第10步加载最新的定时任务文件..."
if [[ -f /usr/bin/jd_bot && -z "$DISABLE_SPNODE" ]]; then
  echo "bot交互与spnode 前置条件成立，替换任务列表的node指令为spnode"
  sed -i "s/ node / spnode /g" $mergedListFile
  #conc每个cookies独立并行执行脚本示例，cookies数量多使用该功能可能导致内存爆掉，默认不开启 有需求，请在自定义shell里面实现
  #sed -i "/\(jd_xtg.js\|jd_car_exchange.js\)/s/spnode/spnode conc/g" $mergedListFile
fi
crontab $mergedListFile

echo "第11步将仓库的docker_entrypoint.sh脚本更新至系统/usr/local/bin/docker_entrypoint.sh内..."
cat /scripts/docker/docker_entrypoint.sh >/usr/local/bin/docker_entrypoint.sh

echo "发送通知"
export NOTIFY_CONTENT=""
cd /scripts/docker
node notify_docker_user.js
