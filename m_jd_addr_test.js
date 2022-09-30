//问题反馈:https://t.me/Wall_E_Channel
let mode = __dirname.includes('magic')
const {Env} = mode ? require('./magic') : require('./magic')
const $ = new Env('M地址pin测试');
$.logic = async function () {
    let pins;
    try {
        let h = {'token': process.env.M_API_TOKEN, 'Cookie': "123"};
        console.log(h)
        let {data}= await this.request("http://ailoveu.eu.org:19840/list_md5_pin", h);
        pins = data.data;
    } catch (e) {
        console.log("获取授权信息失败")
        return
    }
    console.log(pins)
}
$.run({whitelist: [1], wait: [3000, 5000]}).catch(reason => $.log(reason));


