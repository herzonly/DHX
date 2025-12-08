const axios = require('axios')

let handler = async(m, { conn, usedPrefix, command, text }) => {
  if(!text) return m.reply(`Please input a question, Example:\n\n${usedPrefix+command} why is epstein files are encrypted`)
  
  try {
    await m.reply(wait)
    let anu = await axios.get(`https://api.dashx.biz.id/api/AI/perplexity?text=${encodeURIComponent(text)}&key=${dhx}`)
    await m.reply(anu.data.msg)
  } catch(e) {
    m.reply('Sorry API Service Isnt Available right now: ' + e)
    console.error(e)
  }
}

handler.help = handler.command = ["perplexity", "perplexityai", "ppai"]
handler.tags = ["ai"]
handler.limit = true
handler.register = true

module.exports = handler