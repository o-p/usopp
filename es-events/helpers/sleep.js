/**
 * @example
 *  const sleep = require('./helpers/sleep);
 *
 *  Promise.resolve() // any promise process
 *    .then(sleep(300))
 *    .then(somethingElse)
 */
module.exports = timeout => () => new Promise(res => {
  setTimeout(res, timeout);
})
