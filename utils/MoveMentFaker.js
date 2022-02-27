const https = require('https');
const fs = require('fs/promises');
const { R_OK } = require('fs').constants;
const vm = require('vm');
const UA = require('../USER_AGENTS.js').USER_AGENT;

const URL = 'https://wbbny.m.jd.com/babelDiy/Zeus/2rtpffK8wqNyPBH6wyUDuBKoAbCt/index.html';
// const REG_MODULE = /(\d+)\:function\(.*(?=smashUtils\.get_risk_result)/gm;
const SYNTAX_MODULE = '!function(n){var r={};function o(e){if(r[e])';
const REG_SCRIPT = /<script type="text\/javascript" src="([^><]+\/(app\.\w+\.js))\">/gm;
const REG_ENTRY = /(__webpack_require__\(__webpack_require__\.s=)(\d+)(?=\)})/;
const needModuleId = 356
const DATA = {appid:'50085',sceneid:'OY217hPageh5'};
let smashUtils;

class MoveMentFaker {
  constructor(cookie) {
    // this.secretp = secretp;
    this.cookie = cookie;
  }

  async run() {
    if (!smashUtils) {
      await this.init();
    }

    var t = Math.floor(1e7 + 9e7 * Math.random()).toString();
    var e = smashUtils.get_risk_result({
      id: t,
      data: {
        random: t
      }
    }).log;
    var o = JSON.stringify({
      extraData: {
        log: e || -1,
          // log: encodeURIComponent(e),
          sceneid: DATA.sceneid,
      },
      // secretp: this.secretp,
      random: t
    })

    // console.log(o);
    return o;
  }

  async init() {
    try {
      // console.time('MoveMentFaker');
      process.chdir(__dirname);
      const html = await MoveMentFaker.httpGet(URL);
      const script = REG_SCRIPT.exec(html);

      if (script) {
        const [, scriptUrl, filename] = script;
        const jsContent = await this.getJSContent(filename, scriptUrl);
        const fnMock = new Function;
        const ctx = {
          window: { addEventListener: fnMock },
          document: {
            addEventListener: fnMock,
            removeEventListener: fnMock,
            cookie: this.cookie
          },
          navigator: { userAgent: UA }
        };

        vm.createContext(ctx);
        vm.runInContext(jsContent, ctx);
        smashUtils = ctx.window.smashUtils;
        smashUtils.init(DATA);

        // console.log(ctx);
      }

      // console.log(html);
      // console.log(script[1],script[2]);
      // console.timeEnd('MoveMentFaker');
    } catch (e) {
      console.log(e)
    }
  }

  async getJSContent(cacheKey, url) {
    try {
      await fs.access(cacheKey, R_OK);
      const rawFile = await fs.readFile(cacheKey, { encoding: 'utf8' });

      return rawFile;
    } catch (e) {
      let jsContent = await MoveMentFaker.httpGet(url);
      const moduleIndex = jsContent.indexOf(SYNTAX_MODULE, 1);
      const findEntry = REG_ENTRY.test(jsContent);
      if (!(moduleIndex && findEntry)) {
        throw new Error('Module not found.');
      }
        // const needModuleId = jsContent.substring(moduleIndex-20, moduleIndex).match(/(\d+):function/)[1]
      jsContent = jsContent.replace(REG_ENTRY, `$1${needModuleId}`);
      fs.writeFile(cacheKey, jsContent);
      return jsContent;

      REG_ENTRY.lastIndex = 0;
      const entry = REG_ENTRY.exec(jsContent);

      console.log(moduleIndex, needModuleId);
      console.log(entry[1], entry[2]);
    }
  }

  static httpGet(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.indexOf('http') !== 0 ? 'https:' : '';
      const req = https.get(protocol + url, (res) => {
        res.setEncoding('utf-8');

        let rawData = '';

        res.on('error', reject);
        res.on('data', chunk => rawData += chunk);
        res.on('end', () => resolve(rawData));
      });

      req.on('error', reject);
      req.end();
    });
  }
}

async function getBody($) {
  const zf = new MoveMentFaker($.cookie);
  // const zf = new MoveMentFaker($.secretp, $.cookie);
  const ss = await zf.run();

  return ss;
}

MoveMentFaker.getBody = getBody;
module.exports = MoveMentFaker;
