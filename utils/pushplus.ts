import axios from "axios";
import {readFileSync} from "fs";

let account: { pt_pin: string, pushplus?: string } [] = []

try {
  account = JSON.parse(readFileSync("./utils/account.json").toString())
} catch (e) {
  console.log('utils/account.json load failed')
}

export async function pushplus(title: string, content: string, template: string = 'html'): Promise<void> {
  let token: string
  for (let user of account) {
    if (content.includes(decodeURIComponent(user.pt_pin)) && user.pushplus) {
      token = user.pushplus
      break
    }
  }
  if (!token) {
    console.log('no pushplus token')
    return
  }
  let {data}: any = await axios.post('https://www.pushplus.plus/send', {
    token: token,
    title: title,
    content: content,
    template: template
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (data.code === 200) {
    console.log('pushplus发送成功')
  } else {
    console.log('pushplus发送失败', JSON.stringify(data))
  }
}