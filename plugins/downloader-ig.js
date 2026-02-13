const axios = require('axios');

let handler = async(m, { conn, text, usedPrefix, command }) => {
  if(!text) return m.reply(`Masukkan URL Instagram yang ingin didownload, Contoh:\n\n${usedPrefix+command} https://www.instagram.com/p/DUBA2CiElMq/`)
  
  await m.reply(wait)
  
  try {
    const { data } = await axios.get(`https://api.dashx.dpdns.org/api/download/instagram?url=${encodeURIComponent(text)}&key=${global.dhx}`, {
      timeout: 60000
    })
    
    if(!data?.success) throw new Error(data?.error || 'Failed to fetch')
    
    const { result } = data
    
    if(result.type === 'video') {
      const buffer = await axios.get(result.url, { responseType: 'arraybuffer' }).then(res => res.data)
      await conn.sendFile(m.chat, buffer, 'instagram.mp4', '✅ *Instagram Downloaded*', m)
    } else if(result.type === 'slide') {
      for(let i = 0; i < result.images.length; i++) {
        const buffer = await axios.get(result.images[i], { responseType: 'arraybuffer' }).then(res => res.data)
        await conn.sendFile(m.chat, buffer, `instagram_${i+1}.jpg`, `✅ *Image ${i+1}/${result.images.length}*`, m)
        if(i < result.images.length - 1) await new Promise(r => setTimeout(r, 1000))
      }
    }
    
  } catch(e) {
    console.error('[IGDL]', e.message)
    m.reply('❌ Download failed, coba lagi nanti')
  }
}

handler.help = handler.command = ["igdl", "instagram", "ig"]
handler.tags = ["downloader"]
handler.limit = true
handler.register = true

module.exports = handler
