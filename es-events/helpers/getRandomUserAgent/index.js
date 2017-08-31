const USER_AGENTS = require('./user-agents.json')

module.exports = () => {
  return USER_AGENTS[Math.random() * USER_AGENTS.length | 0]    
}
