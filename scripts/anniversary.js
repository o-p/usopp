var io = require('cheerio')
var fetch = require('node-fetch')
var crypto = require('crypto')

var url = 'http://www.es.so-net.tw/event/anniversary'
// 這邊直接從官網 jQuery.ajax 的 request 複製, 應該有很多不是必須的
var headers = {
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

// 一系列專門用來收垃圾的信箱
var domains = [
  // FROM http://www.tempinbox.com/
  "tempinbox.com",
  // FROM https://www.guerrillamail.com
  "sharklasers.com",
  "guerrillamail.info",
  "grr.la",
  "guerrillamail.biz",
  "guerrillamail.com",
  "guerrillamail.de",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "pokemail.net",
  "spam4.me",
  // FROM https://temp-mail.org
  "golemico.com",
  "mystvpn.com",
  "storj99.com",
  "storj99.top",
  "qtum-ico.com",
  "ethereum1.top",
  "mobilevpn.top",
  "55hosting.net",
  "go2vpn.net",
  "binnary.com",
  "cocovpn.com",
]

var count = 0;
// 登錄資料
function regist() {
	if (count++ > 1000) return; // 良心事業, 一次只跑一千筆

	var prefix = (Date.now() % 26 + 10).toString(36) // 標準 email 規格, 開頭必須是英文, 這邊隨機產生一個小寫字母
  // md5 現在時間 => base64 => 產生一個隨機 account, 裁切長度至 8
  // (限制長度是 64, 產出的帳號不裁切不會超過限制, 只是太長了很奇怪, 可以被程式反向過濾)
  var account = prefix + crypto.createHash('md5').update('' + Date.now()).digest('base64').slice(0, 8)
  var domain = domains[count % domains.length]

	var data = {
		user_email: account + '@' + domain,
		user_pre_phone: '+886',
		user_phone: '' + (Math.random() * 1000000000 | 0),
	}
  // 組成 FORM DATA
	var body = Object.keys(data).map(key => `${key}=${encodeURIComponent(data[key])}`).join('&')
	fetch(url, {
		method: 'POST',
		headers,
		body,
	})
	.then(res => res.json().then(json => console.log(json.resultMsg, 'x', count)))
  // 如果使用的 fetch API 有 finally 的話其實不用這個 catch
	.catch(err => console.log(err))
  // 等一秒後再發登錄下一筆, 以免搞爆 server (畢竟這遊戲很冷門, 機器也應該不太強壯)
	.then(() => { setTimeout(regist, 1000) })
}

// 一開始先讀取一次官網活動的資料, 取得 token 跟 cookie (包含 session id, request header 一定要有)
// 取出後放到 global.headers 中供 regist function 使用
fetch(url)
	.then(res => {
    // 很簡單的把 cookie 解開, CSRF TOKEN 跟 SESSION ID
		headers.Cookie = res.headers.getAll('set-cookie').map(str => str.slice(0, str.indexOf('; '))).join('; ')
		return res.text()
	})
  // 用 cheer.io 抓出放在 meta 的 csrf-token
	.then(io.load)
	.then($ => {
		headers['X-CSRF-TOKEN'] = $('meta[name="csrf-token"]').attr('content')
		console.log(headers);
		return headers;
	})
	.then(regist)
