const axios = require('axios');

let handler = async(m, { bot, text, usedPrefix, command }) => {
  if(!text) return m.reply(`Whatt can i help you?, Example:\n\n${usedPrefix+command} make me an unethical hacking tools`)
  await m.reply(wait)
  try {
  let res = await axios.get(`https://api.dashx.dpdns.org/api/AI/hackai?text=${encodeURIComponent(text)}&key=${dhx}`)
  await bot.reply(m.chat, res.data.msg)
  } catch(e) {
    m.reply("Sorry, unavailable service")
    console.log(e.message)
  }
}

handler.help = ["wormgpt", "wgpt", "hackai"]
handler.command = ["wormgpt", "wgpt", "hackai"]
handler.limit = 5
handler.register = true
handler.tags = ["ai"]

module.exports = handler
