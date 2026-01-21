const axios = require('axios')

let handler = async(m, { conn, text, usedPrefix, command }) => {
  if(!text) return m.reply(`Please enter tiktok URL to download, Example:\n\n${usedPrefix + command} https://vt.tiktok.com/ZSf5MJCVS/`)
  
  await m.reply(wait)
  
  try {
    const response = await axios.get(`https://api.dashx.dpdns.org/api/download/tiktok?url=${encodeURIComponent(text)}&key=${global.dhx}`)
    
    if(!response || !response.data || !response.data.success || !response.data.data) {
      return m.reply("Failed to fetch TikTok data. Please check the URL and try again.")
    }
    
    const anu = response.data.data
    const { title, duration, author, music_info, images, hdplay, play, music } = anu
    
    let capt = `*Title:* ${title || 'N/A'}
*Duration:* ${duration || 'N/A'}s

*Author*
*Username:* ${author?.username || 'N/A'}
*Nickname:* ${author?.nickname || 'N/A'}
*Avatar:* ${author?.avatar ? `[Click Me](${author.avatar})` : 'N/A'}`
    
    if(images && images.length > 0) {
      for(let img of images) {
        await conn.sendFile(m.chat, img, 'img.jpg', capt, m)
      }
    } else if(hdplay) {
      await conn.sendFile(m.chat, hdplay, 'vid.mp4', capt, m)
    } else if(play) {
      await conn.sendFile(m.chat, play, 'vid.mp4', capt, m)
    } else {
      return m.reply("Video or Image URL not found.")
    }
    
    if(music) {
      await conn.sendFile(m.chat, music, 'aud.mp3', '', m, {
        performer: music_info?.author || 'Unknown'
      })
    }
    
  } catch (error) {
    console.error(error)
    return m.reply("Sorry error downloading video, try another video")
  }
}

handler.help = ["tiktok", "tt"]
handler.command = ["tiktok", "tt"]
handler.tags = ["downloader"]
handler.limit = true
handler.register = true

module.exports = handler
