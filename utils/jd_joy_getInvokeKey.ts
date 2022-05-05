/**
 * cron: 0 0 * * *
 */

import axios from "axios";
import {sendNotify} from '../sendNotify';

!(async () => {
  let res: any = await api('https://prodev.m.jd.com/mall/active/2tZssTgnQsiUqhmg5ooLSHY9XSeN/index.html')
  let file: string = 'https://storage.360buyimg.com/' + res.match(/htmlSourceUrl":"([^"]*)/)[1]
  res = await api(file)
  file = 'https:' + res.match(/src="(\/\/storage.*)"/)[1]
  res = await api(file)
  file = res.match(/invokeKey: '(.*)'/)[1]
  console.log('invokeKey:', file)
  if (file !== 'q8DNJdpcfRQ69gIx') {
    await sendNotify('invokeKey Update', file)
  }
})()

async function api(url: string) {
  let {data}: any = await axios.get(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
    }
  })
  return data
}