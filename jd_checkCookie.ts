import {getCookie} from "./TS_USER_AGENTS"

let cookie: string = '', UserName: string

!(async () => {
  let cookiesArr: string[] = await getCookie(true)
  for (let [index, value] of cookiesArr.entries()) {
    cookie = value
    UserName = decodeURIComponent(cookie.match(/pt_pin=([^;]*)/)![1])
    console.log(index + 1, UserName)
  }
})()
