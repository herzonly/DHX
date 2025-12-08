let handler = async (m, { bot, command, args }) => {
  try {
    let dapat = Math.floor(Math.random() * 100000)
    let pajak = Math.floor(dapat * 0.02)
    let totalDapat = dapat - pajak
    
    let targetId
    let targetUsername
    
    if (m.quoted) {
      targetId = m.quoted.sender
    } else if (m.ctx.message && m.ctx.message.entities) {
      for (let entity of m.ctx.message.entities) {
        if (entity.type === 'text_mention' && entity.user) {
          targetId = entity.user.id
          break
        }
        if (entity.type === 'mention') {
          let text = m.text
          targetUsername = text.substring(entity.offset, entity.offset + entity.length).replace('@', '')
          break
        }
      }
    } else if (args[0]) {
      if (args[0].startsWith('@')) {
        targetUsername = args[0].replace('@', '')
      } else {
        const match = args[0].match(/(\d+)/)
        if (match) {
          targetId = parseInt(match[1])
        }
      }
    }
    
    if (targetUsername && !targetId) {
      for (let uid in global.db.data.users) {
        let user = global.db.data.users[uid]
        if (user.username && user.username.toLowerCase() === targetUsername.toLowerCase()) {
          targetId = parseInt(uid)
          break
        }
      }
      
      if (!targetId) {
        return bot.reply(m.chat, `❌ Username @${targetUsername} tidak ditemukan dalam database!\n\nPastikan user tersebut sudah pernah menggunakan bot.`, m.id)
      }
    }
    
    if (!targetId) {
      return bot.reply(m.chat, '❌ Cara pakai:\n- Reply pesan target: /rob\n- Mention: /rob @username\n- User ID: /rob 123456', m.id)
    }
    
    if (targetId === m.sender) {
      return bot.reply(m.chat, '❌ Tidak bisa merampok diri sendiri!', m.id)
    }
    
    if (typeof global.db.data.users[targetId] === 'undefined') {
      return bot.reply(m.chat, '❌ Pengguna tidak ada didalam database', m.id)
    }
    
    let users = global.db.data.users
    let sender = users[m.sender]
    let target = users[targetId]
    
    let cooldown = 3600000
    let lastRob = sender.lastrob || 0
    let timePassed = Date.now() - lastRob
    
    if (timePassed < cooldown) {
      let timeLeft = cooldown - timePassed
      let timeString = clockString(timeLeft)
      return bot.reply(m.chat, `⏳ Anda sudah merampok dan berhasil sembunyi, tunggu *${timeString}* untuk merampok lagi`, m.id)
    }
    
    if (target.money < 10000) {
      return bot.reply(m.chat, '❌ Target tidak punya uang, kismin dia 💸', m.id)
    }
    
    let amountToRob = Math.min(totalDapat, target.money)
    
    target.money -= amountToRob
    sender.money += amountToRob
    sender.lastrob = Date.now()
    
    let targetName = await bot.getName(targetId)
    
    let message = `🎭 *PERAMPOKAN BERHASIL!*\n\n` +
      `💰 Uang yang dirampok: ${dapat.toLocaleString()}\n` +
      `💼 Pajak (2%): ${pajak.toLocaleString()}\n` +
      `✨ Total diterima: ${amountToRob.toLocaleString()}\n\n` +
      `👤 Target: ${targetName}\n` +
      `💵 Sisa uang target: ${target.money.toLocaleString()}`
    
    bot.reply(m.chat, message, m.id)
    
  } catch (error) {
    console.error('Error in merampok command:', error)
    bot.reply(m.chat, '❌ Terjadi kesalahan saat merampok!', m.id)
  }
}

handler.help = ['merampok <@tag>']
handler.tags = ['rpg']
handler.command = /^merampok|rob$/i
handler.group = true
handler.limit = true

module.exports = handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}