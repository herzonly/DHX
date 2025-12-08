let syntaxerror = require('syntax-error')
let util = require('util')
let fs = require('fs')

let handler = async (m, _2) => {
  let { bot, usedPrefix, noPrefix, args, chatId, userId, isGroup } = _2
  let _return
  let _syntax = ''
  let _text = (/^=/.test(usedPrefix) ? 'return ' : '') + noPrefix
  let old = m.exp * 1

  try {
    let i = 15
    let f = {
      exports: {}
    }
    let exec = new (async () => {}).constructor(
      'print', 
      'm', 
      'handler', 
      'require', 
      'bot', 
      'conn',
      'Array', 
      'process', 
      'args', 
      'chatId',
      'userId',
      'isGroup',
      'module', 
      'exports', 
      'argument', 
      _text
    )

    _return = await exec.call(bot, (...args) => {
      if (--i < 1) return
      console.log(...args)
      return bot.sendMessage(m.chat, util.format(...args), {
        reply_to_message_id: m.message_id
      })
    }, m, handler, require, bot, CustomArray, process, args, chatId, userId, isGroup, f, f.exports, [bot, _2])

  } catch (e) {
    let err = await syntaxerror(_text, 'Execution Function', {
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true
    })
    if (err) _syntax = '```' + err + '```\n\n'
    _return = e
  } finally {
    let result = _syntax + util.format(_return)
    let MAX_LENGTH = 4096
    
    result = result.replace(/token:\s*['"]([^'"]+)['"]/gi, "token: '[REDACTED]'")
    
    if (m.quoted && m.quoted.fromMe === undefined && m.quoted.sender === bot.botInfo.id) {
      m.quoted.fromMe = true
    }
    
    if (result.length > MAX_LENGTH) {
      let filename = `result_${Date.now()}.txt`
      let filepath = `./${filename}`
      
      try {
        fs.writeFileSync(filepath, result)
        await bot.sendDocument(m.chat, filepath, {
          reply_to_message_id: m.message_id,
          caption: null
        })
        fs.unlinkSync(filepath)
      } catch (err) {
        await bot.sendMessage(m.chat, `❌ Error mengirim file: ${err.message}`, {
          reply_to_message_id: m.message_id
        })
      }
    } else {
      result = escapeMarkdown(result)
      
      await bot.sendMessage(m.chat, result, {
        reply_to_message_id: m.message_id,
        parse_mode: 'MarkdownV2'
      })
    }
    
    m.exp = old
  }
}

function escapeMarkdown(text) {
  const escapeChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!']
  let result = String(text)
  
  escapeChars.forEach(char => {
    result = result.split(char).join('\\' + char)
  })
  
  return result
}

handler.help = ['> ', '=> ']
handler.tags = ['advanced']
handler.customPrefix = /^=?> /
handler.command = /(?:)/i
handler.owner = true
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.fail = null

module.exports = handler

class CustomArray extends Array {
  constructor(...args) {
    if (typeof args[0] == 'number') return super(Math.min(args[0], 10000))
    else return super(...args)
  }
}