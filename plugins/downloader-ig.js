const axios = require('axios');

let handler = async(m, { conn, text, usedPrefix, command }) => {
  if(!text) return m.reply(`Masukkan URL Instagram yang ingin didownload, Contoh:\n\n${usedPrefix+command} https://www.instagram.com/p/DUBA2CiElMq/`)
  
  await m.reply(wait)
  
  try {
    const response = await axios.get(`https://api.dashx.dpdns.org/api/download/instagram?url=${encodeURIComponent(text)}&key=${global.dhx}`)
    
    if(!response.data || !response.data.success || !response.data.data || !response.data.data.video) {
      return m.reply('Video not found, try another url')
    }
    
    await conn.sendFile(m.chat, response.data.data.video, 'instagram.mp4', `✅ *Instagram Downloaded*`, m)
    
  } catch(e) {
    console.log(e)
    m.reply('Video not found, try another url')
  }
}

handler.help = handler.command = ["igdl", "instagram", "ig"]
handler.tags = ["downloader"]
handler.limit = true
handler.register = true

module.exports = handler
