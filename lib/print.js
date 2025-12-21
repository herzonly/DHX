let chalk = require('chalk')
let fs = require('fs')

module.exports = async function (m, ctx, bot = {}) {
  let sender = m.from?.id || 'Unknown'
  let senderName = ctx.from?.first_name || ''
  if (ctx.from?.last_name) senderName += ' ' + ctx.from.last_name
  let username = ctx.from?.username ? `@${ctx.from.username}` : ''
  
  let chat = ctx.chat?.id || 'Unknown'
  let chatTitle = ctx.chat?.title || ctx.chat?.first_name || ''
  let chatType = ctx.chat?.type || 'private'
  
  let messageType = 'text'
  let filesize = 0
  let fileName = ''
  
  if (ctx.message) {
    if (ctx.message.photo) {
      messageType = 'photo'
      let photo = ctx.message.photo[ctx.message.photo.length - 1]
      filesize = photo.file_size || 0
    } else if (ctx.message.video) {
      messageType = 'video'
      filesize = ctx.message.video.file_size || 0
      fileName = ctx.message.video.file_name || ''
    } else if (ctx.message.document) {
      messageType = 'document'
      filesize = ctx.message.document.file_size || 0
      fileName = ctx.message.document.file_name || ''
    } else if (ctx.message.audio) {
      messageType = 'audio'
      filesize = ctx.message.audio.file_size || 0
      fileName = ctx.message.audio.file_name || ''
    } else if (ctx.message.voice) {
      messageType = 'voice'
      filesize = ctx.message.voice.file_size || 0
    } else if (ctx.message.sticker) {
      messageType = 'sticker'
      filesize = ctx.message.sticker.file_size || 0
    } else if (ctx.message.animation) {
      messageType = 'animation'
      filesize = ctx.message.animation.file_size || 0
    } else if (ctx.message.video_note) {
      messageType = 'video_note'
      filesize = ctx.message.video_note.file_size || 0
    } else if (ctx.message.contact) {
      messageType = 'contact'
    } else if (ctx.message.location) {
      messageType = 'location'
    } else if (ctx.message.poll) {
      messageType = 'poll'
    }
  }
  
  let text = ctx.message?.text || ctx.message?.caption || ''
  if (!filesize && text) filesize = text.length
  
  let botInfo = bot.botInfo || {}
  let botName = botInfo.first_name || 'Bot'
  let botUsername = botInfo.username || ''
  
  let prefix = global.prefix || /^[.,!/#]/
  let isCommand = false
  if (text) {
    isCommand = prefix instanceof RegExp ? prefix.test(text) : text.startsWith(prefix)
  }
  
  let timestamp = new Date((ctx.message?.date || Date.now() / 1000) * 1000).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  let filesizeFormatted = filesize === 0 ? '0' : (filesize / 1000 ** Math.floor(Math.log(filesize) / Math.log(1000))).toFixed(1)
  let filesizeUnit = ['', ...'KMGTP'][Math.floor(Math.log(filesize) / Math.log(1000))] || ''

  console.log(`▣────────────···
│ ${chalk.redBright(botName + (botUsername ? ' @' + botUsername : ''))}
│⏰ㅤ${chalk.black(chalk.bgYellow(timestamp))}
│📊ㅤ${chalk.magenta(`${filesize} [${filesizeFormatted} ${filesizeUnit}B]`)}
│📤ㅤ${chalk.green(`${sender} ${senderName}${username ? ' ' + username : ''}`)}
│📥ㅤ${chalk.green(`${chat}${chatTitle ? ' ~' + chatTitle : ''} (${chatType})`)}
│💬ㅤ${chalk.black(chalk.bgYellow(messageType.toUpperCase()))}
▣────────────···`.trim())

  if (typeof text === 'string' && text) {
    let log = text.replace(/\u200e+/g, '')
    
    if (isCommand) {
      console.log(chalk.yellow(log))
    } else {
      if (log.length < 4096) {
        let urlRegex = /(https?:\/\/[^\s]+)/g
        log = log.replace(urlRegex, url => chalk.blueBright(url))
      }
      console.log(log)
    }
  }

  if (fileName) {
    console.log(`📄 ${fileName}`)
  }

  if (messageType === 'audio' || messageType === 'voice') {
    let duration = ctx.message.audio?.duration || ctx.message.voice?.duration || 0
    console.log(`${messageType === 'voice' ? '🎤 (VOICE' : '🎵 (AUDIO)'}) ${Math.floor(duration / 60).toString().padStart(2, 0)}:${(duration % 60).toString().padStart(2, 0)}`)
  }

  console.log()
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright("Update 'lib/print.js'"))
  delete require.cache[file]
  require(file)
})
