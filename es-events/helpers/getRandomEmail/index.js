const crypto = require('crypto')

// 一系列專門用來收一次性 email 的服務: 
// - http://www.tempinbox.com
// - https://www.guerrillamail.com
// - https://temp-mail.org)
const DOMAINS = require('./email-domains.json')

const LOCAL_PART_MIN = 1
const LOCAL_PART_MAX = 64

const getRandomAccount = (len, seed = 0) => {
  // 標準 email 規格, 開頭必須是英文, 這邊隨機產生一個小寫字母
  const prefix = (seed % 26 + 10).toString(36)
    
  return prefix
    + crypto.createHash('md5')
        .update(seed.toString()) // 
        .digest('base64')
        .slice(0, len - 1)
}

const getRandomDomain = () => DOMAINS[Math.random() * DOMAINS.length | 0]

/**
 * @example
 *   const email = require('./helpers/getRandomEmail')(
 *     Date.now() // random seed
 *     8,  // min account length
 *     20, // max account length
 *   )
 */
module.exports = (seed = 0, min = 6, max = 12) => {
  min = Math.max(LOCAL_PART_MIN, min) // at least 1 word
  max = Math.min(
    Math.max(min, max),
    LOCAL_PART_MAX
  )
  const length = (Math.random() * (max - min) | 0) + min

  return `${ getRandomAccount(length, seed) }@${ getRandomDomain() }`;
}
