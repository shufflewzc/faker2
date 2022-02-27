#set -e

#日志路径
logDir="/scripts/logs"

# 处理后的log文件
logFile=${logDir}/sharecodeCollection.log
if [ -n "$1" ]; then
  parameter=${1}
else
  echo "没有参数"
fi

# 收集助力码
collectSharecode() {
  if [ -f ${2} ]; then
    echo "${1}：清理 ${preLogFile} 中的旧助力码，收集新助力码"

    #删除预处理旧助力码
    if [ -f "${logFile}" ]; then
      sed -i '/'"${1}"'/d' ${logFile}
    fi

    #收集日志中的互助码
    codes="$(sed -n '/'${1}'.*/'p ${2} | sed 's/京东账号/京东账号 /g' | sed 's/（/ （/g' | sed 's/】/】 /g'  | awk '{print $4,$5,$6,$7}' | sort -gk2 | awk '!a[$2" "$3]++{print}')"

    #获取ck文件夹中的pin值集合
    if [ -f "/usr/local/bin/spnode" ]; then
      ptpins="$(awk -F "=" '{print $3}' $COOKIES_LIST | awk -F ";" '{print $1}')"
    else
      ptpins="$(echo $JD_COOKIE | sed "s/[ &]/\\n/g" | sed "/^$/d" | awk -F "=" '{print $3}' | awk -F ";" '{print $1}')"
    fi


    #遍历pt_pin值
    for item in $ptpins; do
      #中文pin解码
      if [ ${#item} > 20 ]; then
        item="$(printf $(echo -n "$item" | sed 's/\\/\\\\/g;s/\(%\)\([0-9a-fA-F][0-9a-fA-F]\)/\\x\2/g')"\n")"
      fi
      #根据pin值匹配第一个code结果输出到文件中
      echo "$codes" | grep -m1 $item >> $logFile
    done
  else
    echo "${1}：${2} 文件不存在,不清理 ${logFile} 中的旧助力码"
  fi

}

# 导出助力码
exportSharecode() {
  if [ -f ${logFile} ]; then
    #账号数
    cookiecount=$(echo ${JD_COOKIE} | grep -o pt_key | grep -c pt_key)
    if [ -f /usr/local/bin/spnode ]; then
      cookiecount=$(cat "$COOKIES_LIST" | grep -o pt_key | grep -c pt_key)
    fi
    echo "cookie个数：${cookiecount}"

    # 单个账号助力码
    singleSharecode=$(sed -n '/'${1}'.*/'p ${logFile} | awk '{print $4}' | awk '{T=T"@"$1} END {print T}' | awk '{print substr($1,2)}')
    #        | awk '{print $2,$4}' | sort -g | uniq
    #    echo "singleSharecode:${singleSharecode}"

    # 拼接多个账号助力码
    num=1
    while [ ${num} -le ${cookiecount} ]; do
      local allSharecode=${allSharecode}"&"${singleSharecode}
      num=$(expr $num + 1)
    done

    allSharecode=$(echo ${allSharecode} | awk '{print substr($1,2)}')

    # echo "${1}:${allSharecode}"

    #判断合成的助力码长度是否大于账号数，不大于，则可知没有助力码
    if [ ${#allSharecode} -gt ${cookiecount} ]; then
      echo "${1}：导出助力码"
      echo "${3}=${allSharecode}"
      export ${3}=${allSharecode}
    else
      echo "${1}：没有助力码，不导出"
    fi

  else
    echo "${1}：${logFile} 不存在，不导出助力码"
  fi

}

#生成助力码
autoHelp() {
  if [ ${parameter} == "collect" ]; then

    #    echo "收集助力码"
    collectSharecode ${1} ${2} ${3}

  elif [ ${parameter} == "export" ]; then

    #    echo "导出助力码"
    exportSharecode ${1} ${2} ${3}
  fi
}

#日志需要为这种格式才能自动提取
#Mar 07 00:15:10 【京东账号1（xxxxxx）的京喜财富岛好友互助码】3B41B250C4A369EE6DCA6834880C0FE0624BAFD83FC03CA26F8DEC7DB95D658C

#新增自动助力活动格式
# autoHelp 关键词 日志路径 变量名

############# 短期活动 #############


############# 长期活动 #############

#东东农场
autoHelp "东东农场好友互助码" "${logDir}/jd_fruit.log" "FRUITSHARECODES"

#东东萌宠
autoHelp "东东萌宠好友互助码" "${logDir}/jd_pet.log" "PETSHARECODES"

#种豆得豆
autoHelp "京东种豆得豆好友互助码" "${logDir}/jd_plantBean.log" "PLANT_BEAN_SHARECODES"

#京喜工厂
autoHelp "京喜工厂好友互助码" "${logDir}/jd_dreamFactory.log" "DREAM_FACTORY_SHARE_CODES"

#东东工厂
autoHelp "东东工厂好友互助码" "${logDir}/jd_jdfactory.log" "DDFACTORY_SHARECODES"

#crazyJoy
autoHelp "crazyJoy任务好友互助码" "${logDir}/jd_crazy_joy.log" "JDJOY_SHARECODES"

#京喜财富岛
autoHelp "京喜财富岛好友互助码" "${logDir}/jd_cfd.log" "JDCFD_SHARECODES"

#京喜农场
autoHelp "京喜农场好友互助码" "${logDir}/jd_jxnc.log" "JXNC_SHARECODES"

#京东赚赚
autoHelp "京东赚赚好友互助码" "${logDir}/jd_jdzz.log" "JDZZ_SHARECODES"

######### 日志打印格式需调整 #########

#口袋书店
autoHelp "口袋书店好友互助码" "${logDir}/jd_bookshop.log" "BOOKSHOP_SHARECODES"

#领现金
autoHelp "签到领现金好友互助码" "${logDir}/jd_cash.log" "JD_CASH_SHARECODES"

#闪购盲盒
autoHelp "闪购盲盒好友互助码" "${logDir}/jd_sgmh.log" "JDSGMH_SHARECODES"

#东东健康社区
autoHelp "东东健康社区好友互助码" "${logDir}/jd_health.log" "JDHEALTH_SHARECODES"
