const axios = require('axios')

let handler = async(m, { conn, text, usedPrefix, command }) => {
  if(!text) return m.reply(`*╭─「 TikTok Downloader 」*
│ • Masukkan URL TikTok
│ • Contoh: ${usedPrefix + command} <url>
*╰────────────⬣*

*Example:*
${usedPrefix + command} https://vt.tiktok.com/ZSf5MJCVS/`)
  
  await m.reply('*⏳ Sedang mengunduh video...*')
  
  try {
    const response = await axios.get(`https://api.dashx.dpdns.org/api/download/tiktok?url=${encodeURIComponent(text)}&key=${global.dhx}`)
    
    if(!response || !response.data || !response.data.success || !response.data.data) {
      return m.reply('*❌ Gagal mengambil data TikTok*\n\nPastikan URL yang kamu masukkan benar!')
    }
    
    const anu = response.data.data
    const { title, duration, author, music_info, images, hdplay, play, music } = anu
    
    const escapeMarkdown = (str) => {
      if(!str) return 'N/A'
      return String(str)
        .replace(/_/g, '\\_')
        .replace(/\*/g, '\\*')
        .replace(/\[/g, '\\[')
        .replace(/`/g, '\\`')
    }
    
    let capt = `*╭─「 📹 TIKTOK DOWNLOADER 」*\n`
    capt += `│\n`
    capt += `│ *📝 Title:*\n│ ${escapeMarkdown(title)}\n`
    capt += `│\n`
    capt += `│ *⏱️ Duration:* ${duration || 0}s\n`
    capt += `│\n`
    capt += `│ *👤 Author Info:*\n`
    capt += `│ • *Name:* ${escapeMarkdown(author?.nickname)}\n`
    capt += `│ • *Username:* @${escapeMarkdown(author?.username)}\n`
    
    if(music_info?.title) {
      capt += `│\n`
      capt += `│ *🎵 Music:*\n`
      capt += `│ • *Title:* ${escapeMarkdown(music_info.title)}\n`
      capt += `│ • *Author:* ${escapeMarkdown(music_info.author)}\n`
    }
    
    capt += `*╰────────────⬣*`
    
    const options = { parse_mode: 'Markdown' }
    
    if(images && images.length > 0) {
      for(let img of images) {
        await conn.sendFile(m.chat, img, 'tiktok.jpg', capt, m, false, options)
      }
    } else if(hdplay) {
      await conn.sendFile(m.chat, hdplay, 'tiktok.mp4', capt, m, false, options)
    } else if(play) {
      await conn.sendFile(m.chat, play, 'tiktok.mp4', capt, m, false, options)
    } else {
      return m.reply('*❌ Video atau gambar tidak ditemukan*')
    }
    
    if(music) {
      try {
        const audioOptions = {
          performer: music_info?.author || author?.nickname || 'TikTok Audio',
          title: music_info?.title || title || 'TikTok Sound',
          parse_mode: null
        }
        
        await conn.sendFile(m.chat, music, 'tiktok_audio.mp3', '', m, false, audioOptions)
      } catch (error) {
        console.error('Audio error:', error)
        return m.reply('*🔇 No available audio on this video*')
      }
    } else {
      return m.reply('*🔇 No available audio on this video*')
    }
    
  } catch (error) {
    console.error(error)
    return m.reply('*❌ Terjadi kesalahan saat mengunduh video*\n\nCoba video lain atau coba lagi nanti.')
  }
}

handler.help = ["tiktok", "tt"]
handler.command = ["tiktok", "tt"]
handler.tags = ["downloader"]
handler.limit = true
handler.register = true

module.exports = handler
