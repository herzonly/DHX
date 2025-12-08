const moneyperlimit = 50000

let handler = async (m, { conn, command, args }) => {

  let count = args[0] && args[0] === 'all' ? Math.floor(global.db.data.users[m.sender].money / moneyperlimit) : args[0] ? parseInt(args[0]) : 1

  count = Math.max(1, count)

  if (isNaN(count)) return conn.reply(m.chat, 'Jumlah harus berupa angka!', m)

  if (global.db.data.users[m.sender].money >= moneyperlimit * count) {

    global.db.data.users[m.sender].money -= moneyperlimit * count

    global.db.data.users[m.sender].limit += count

    conn.reply(m.chat, `-${moneyperlimit * count} Money\n+ ${count} Limit`, m)

  } else conn.reply(m.chat, `Money tidak mencukupi untuk membeli ${count} limit`, m)

}

handler.help = ['buylimit <jumlah>', 'buylimit all']

handler.tags = ['rpg']

handler.command = /^buylimit$/i

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