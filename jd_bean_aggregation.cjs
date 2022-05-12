/**
 * select name, bean from bean_change where date=today and amount > 0 group by name order by amount desc
 */

const {JDHelloWorld} = require("./TS_JDHelloWorld")
const {getDate} = require("date-fns");
const ConsoleGrid = require("console-grid");

class Aggregate_Bean extends JDHelloWorld {
  constructor() {
    super();
  }

  async init() {
    await this.run(new Aggregate_Bean())
  }

  async main(user) {
    let p = 1, arr = [], aggregation = {}, flag = true, sum = 0, len = 0
    while (p && flag) {
      try {
        let res = await this.post('https://api.m.jd.com/client.action?functionId=getJingBeanBalanceDetail',
          `body=${encodeURIComponent(JSON.stringify({"pageSize": "20", "page": p.toString()}))}&appid=ld`, {
            'Host': 'api.m.jd.com',
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
            'Cookie': user.cookie,
          })
        let today = getDate(new Date())
        // console.log(p, res['detailList'].length)
        for (let t of res['detailList']) {
          let amount = parseInt(t.amount), date = getDate(new Date(t.date))
          if (date !== today) {
            flag = false
            break
          }
          if (amount > 0) {
            sum += amount
            t['eventMassage'].length > len ? len = t['eventMassage'].length : null
            if (t['eventMassage'] in aggregation) {
              aggregation[t['eventMassage']] += amount
            } else {
              aggregation[t['eventMassage']] = amount
            }
          }
        }
        await this.wait(2000)
        if (p < 20) {
          p++
        } else {
          break
        }
      } catch (e) {
        console.log('error', e)
        await this.wait(2000)
        break
      }
    }
    for (let k in aggregation) {
      arr.push({
        'name': k,
        'amount': aggregation[k]
      })
    }
    arr.sort((a, b) => {
      return b.amount - a.amount
    })
    arr = [...arr, {name: '合计', amount: sum}]
    const consoleGrid = new ConsoleGrid();
    const data = {
      columns: [{
        id: "name",
        name: `Name`,
        type: "string",
        maxWidth: len * 2 + 3,
      }, {
        id: "amount",
        type: "number",
        name: "Amount",
        minWidth: 5,
        align: "right"
      }],
      rows: arr
    };
    consoleGrid.render(data);
  }
}

new Aggregate_Bean().init().then()
