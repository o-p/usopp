const runner = require('./anniversary')

runner()
  .then(() => {
    process.stdout = 'DONE'
    process.exit(0)
  })
  .catch(err => {
    process.stderr = err.toString()
    process.exit(1)
  })
