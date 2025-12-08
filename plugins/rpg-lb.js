let handler = async (m, { bot, args }) => {
  let users = Object.entries(global.db.data.users).map(([key, value]) => {
    return {...value, userId: key}
  })
  let sortedExp = users.map(toNumber('exp')).sort(sort('exp'))
  let sortedLim = users.map(toNumber('limit')).sort(sort('limit'))
  let sortedLevel = users.map(toNumber('level')).sort(sort('level'))
  let sortedMoney = users.map(toNumber('money')).sort(sort('money'))
  let usersExp = sortedExp.map(enumGetKey)
  let usersLim = sortedLim.map(enumGetKey)
  let usersLevel = sortedLevel.map(enumGetKey)
  let usersMoney = sortedMoney.map(enumGetKey)
  
  let len = args[0] && args[0].length > 0 ? Math.min(10, Math.max(parseInt(args[0]), 10)) : Math.min(10, sortedExp.length)
  
  let text = `*• XP Leaderboard Top ${len} •*
Kamu: *${usersExp.indexOf(m.from.id) + 1}* dari *${usersExp.length}*

${sortedExp.slice(0, len).map(({ userId, exp }, i) => {
  let user = global.db.data.users[userId]
  let displayName = escapeMarkdown(user?.usertag || userId)
  return `${i + 1}. ${displayName} *${exp} Exp*`
}).join('\n')}

*• Limit Leaderboard Top ${len} •*
Kamu: *${usersLim.indexOf(m.from.id) + 1}* dari *${usersLim.length}*

${sortedLim.slice(0, len).map(({ userId, limit }, i) => {
  let user = global.db.data.users[userId]
  let displayName = escapeMarkdown(user?.usertag || userId)
  return `${i + 1}. ${displayName} *${limit} Limit*`
}).join('\n')}

*• Level Leaderboard Top ${len} •*
Kamu: *${usersLevel.indexOf(m.from.id) + 1}* dari *${usersLevel.length}*

${sortedLevel.slice(0, len).map(({ userId, level }, i) => {
  let user = global.db.data.users[userId]
  let displayName = escapeMarkdown(user?.usertag || userId)
  return `${i + 1}. ${displayName} *Level ${level}*`
}).join('\n')}

*• Money Leaderboard Top ${len} •*
Kamu: *${usersMoney.indexOf(m.from.id) + 1}* dari *${usersMoney.length}*

${sortedMoney.slice(0, len).map(({ userId, money }, i) => {
  let user = global.db.data.users[userId]
  let displayName = escapeMarkdown(user?.usertag || userId)
  return `${i + 1}. ${displayName} *Money ${money}*`
}).join('\n')}`
  
  m.reply(text)
}

handler.help = ['leaderboard <jumlah user>']
handler.tags = ['rpg']
handler.command = /^(leaderboard|lb)$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.fail = null
handler.exp = 0

module.exports = handler

function escapeMarkdown(text) {
  return String(text).replace(/[_*`\[]/g, '\\$&')
}

function sort(property, ascending = true) {
  if (property) return (...args) => args[ascending & 1][property] - args[!ascending & 1][property]
  else return (...args) => args[ascending & 1] - args[!ascending & 1]
}

function toNumber(property, _default = 0) {
  if (property) return (a, i, b) => {
    return {...b[i], [property]: a[property] === undefined ? _default : a[property]}
  }
  else return a => a === undefined ? _default : a
}

function enumGetKey(a) {
  return a.userId
}