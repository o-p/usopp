const io = require('cheerio')
const fetch = require('node-fetch')
const winston = require('winston')

const sleep = require('./helpers/sleep')
const getEmail = require('./helpers/getRandomEmail')
const getUA = require('./helpers/getRandomUserAgent')

const logger = new winston.Logger({
  level: 'debug',
  transports: [
    new (winston.transports.File)({
      filename: 'es-anniversary.log',
    })  
  ],
})

const url = 'http://www.es.so-net.tw/event/anniversary'

// 這邊直接從官網 jQuery.ajax 的 request 複製, 應該有很多不是必須的
const REQUEST_HEADER = {
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Accept-Encoding': 'gzip, deflate',
  'Accept-Language': 'zh-TW,zh;q=0.8,en-US;q=0.6,en;q=0.4',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'Host': 'www.es.so-net.tw',
  'Origin': 'http://www.es.so-net.tw',
  'Pragma': 'no-cache',
  'Referer': 'http://www.es.so-net.tw/event/anniversary',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36',
  'X-Requested-With': 'XMLHttpRequest',
}

module.exports = function taskRunner(timeout = 1000, rest = 5 * 60 * 1000, breakAt = 1000, stopAt = 20000) {
  const start = new Date()
  let count = 0

  function task() {
    return getRequestHeader()
      .then(header => {
        logger.verbose('HEADER', header)
        return regist(0, breakAt, header, timeout)
      })
      .then(n => {
        count += n;
        if (count >= stopAt) return logger.info('DONE', {
          count,
          start,
          finish: new Date(),
        });

        return sleep(rest)()
          .then(task)
      })
  }
  
  return task();
}

// 登錄資料
function regist(count, max, headers, timeout) {
  if (count > max) return Promise.resolve(count);

  const user_email = getEmail(Date.now())
  const data = {
    user_email,
    user_pre_phone: '+886',
    user_phone: '' + (Math.random() * 1000000000 | 0),
  }
  // 組成 FORM DATA
  const body = Object.keys(data).map(key => `${key}=${encodeURIComponent(data[key])}`).join('&')

  return fetch(url, {
    method: 'POST',
    headers,
    body,
  })
  .then(res => res.json().then(json => logger.info(json.resultMsg, { count })))
  .catch(err => logger.warn(err))
  .then(sleep(timeout))
  .then(() => regist(count + 1, max, headers, timeout))
}

function getRequestHeader() {
  let headers = {
    'User-Agent': getUA(),
  }
  
  // 一開始先讀取一次官網活動的資料, 取得 token 跟 cookie (包含 session id, request header 一定要有)
  // 取出後放到 global.headers 中供 regist function 使用
  return fetch(url)
    .then(res => {
      // 很簡單的把 cookie 解開, CSRF TOKEN 跟 SESSION ID
      headers.Cookie = res.headers.getAll('set-cookie').map(str => str.slice(0, str.indexOf('; '))).join('; ')
      return res.text()
    })
    // 用 cheer.io 抓出放在 meta 的 csrf-token
    .then(io.load)
    .then($ => {
      headers['X-CSRF-TOKEN'] = $('meta[name="csrf-token"]').attr('content')
      return Object.assign({}, REQUEST_HEADER, headers);
    })
}
