const { tiktok } = require('notmebotz-tools')

let handler = async(m, { conn, text, usedPrefix, command }) => {
  if(!text) return m.reply(`Please enter tiktok URL to download, Example:\n\n${usedPrefix + command} https://vt.tiktok.com/ZSf5MJCVS/`)
  
  await m.reply(wait)
  
  try {
    let anu = await tiktok(text)
    
    if(!anu || anu.status !== 200 || !anu.data) {
      return m.reply("Failed to fetch TikTok data. Please check the URL and try again.")
    }
    
    let { title, region, duration, author, video, music } = anu.data
    
    let capt = `Title: ${title || 'N/A'}
Region: ${region || 'N/A'}
Duration: ${duration || 'N/A'}

*Author*
Username: ${author?.username || 'N/A'}
Nickname: ${author?.nickname || 'N/A'}
Avatar: ${author?.avatar ? `[Click Me](${author.avatar})` : 'N/A'}`
    
    if(video?.hd_play_url) {
      await conn.sendFile(m.chat, video.hd_play_url, 'vid.mp4', capt, m)
    } else if(video?.play_url) {
      await conn.sendFile(m.chat, video.play_url, 'vid.mp4', capt, m)
    } else {
      return m.reply("Video URL not found.")
    }
    
    if(music?.play_url) {
      await conn.sendFile(m.chat, music.play_url, 'aud.mp3', null, m, {
          performer: anu.data.music.author
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