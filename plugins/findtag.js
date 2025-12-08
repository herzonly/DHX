let handler = async (m, { args }) => {
  if (!args[0]) return m.reply('Masukkan user ID!')
  
  let userId = args[0]
  let user = global.db.data.users[userId]
  
  if (!user) return m.reply(`User dengan ID *${userId}* tidak ditemukan!`)
  
  let usertag = user.usertag || 'Tidak ada'
  let text = `*• Info User •*
ID: \`${userId}\`
Tag: ${usertag}`
  
  m.reply(text)
}

handler.help = ['findtag <user id>']
handler.tags = ['tools']
handler.command = /^(findtag|cariuser|finduser)$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.fail = null
handler.exp = 0

module.exports = handler