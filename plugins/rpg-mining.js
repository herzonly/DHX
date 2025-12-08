const timeout = 28800000

let handler = async (m, { bot, usedPrefix, text }) => {
  let conn = bot
  let user = global.db.data.users[m.sender]
  
  if (!user.pickaxe || user.pickaxe < 1) {
    return m.reply('Lu gapunya pickaxe! Craft dulu pake *.craft pickaxe*')
  }

  if (user.pickaxedurability <= 0) {
    user.pickaxe = 0
    user.pickaxedurability = 0
    return m.reply('⚠️ Pickaxe lu udah ancur!\nCraft yang baru pake *.craft pickaxe*')
  }

  if (user.restActive === true) {
    return conn.reply(m.chat, "Lu lagi istirahat, tunggu sampe stamina full", m)
  }

 // let time = user.lastnambang + 28800000
 /* if (new Date - user.lastnambang < 28800000) {
    return m.reply(`Lu udah nambang\nTunggu dulu ya hasilnya\nTunggu ${msToTime(time - new Date())} lagi`)
  }*/

  user.pickaxedurability -= 15

  let berlians = `${Math.floor(Math.random() * 3)}`.trim()
  let emasbiasas = `${Math.floor(Math.random() * 4)}`.trim()
  let emasbatangs = `${Math.floor(Math.random() * 3)}`.trim()
  let coals = `${Math.floor(Math.random() * 3)}`.trim()
  
  user.coal += coals * 1
  user.emas += emasbiasas * 1
  user.diamond += emasbatangs * 1
  user.tiketcoin += 1
  user.lastnambang = new Date * 1

  let durabilityWarning = ''
  if (user.pickaxedurability <= 0) {
    user.pickaxe = 0
    user.pickaxedurability = 0
    durabilityWarning = '\n\n⚠️ *PICKAXE ANCUR!*\nPickaxe lu udah rusak parah!\nCraft lagi pake *.craft pickaxe*'
  } else if (user.pickaxedurability <= 20) {
    durabilityWarning = `\n\n⚠️ Durability pickaxe lu tinggal: *${user.pickaxedurability}*\nMending craft yang baru!`
  } else {
    durabilityWarning = `\n\n🔧 Durability pickaxe: *${user.pickaxedurability}*`
  }

  m.reply(`Selamat lu dapet:\n+${emasbiasas} Emas\n+${emasbatangs} Diamond\n+${coals} Coal\n+1 Tiketcoin${durabilityWarning}`)
  
  setTimeout(() => {
    conn.reply(m.chat, `Waktunya nambang lagi kak 😅`, m)
  }, timeout)
}

handler.help = ['nambang','mining']
handler.tags = ['rpg']
handler.command = /^(nambang|mining)/i
handler.group = true
handler.fail = null
handler.limit = true
handler.exp = 0
handler.money = 0

module.exports = handler

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    
  hours = (hours < 10) ? "0" + hours : hours
  minutes = (minutes < 10) ? "0" + minutes : minutes
  seconds = (seconds < 10) ? "0" + seconds : seconds

  return hours + " jam " + minutes + " menit " + seconds + " detik"
}