const axios = require('axios');



let handler = async(m, { conn, text, usedPrefix, command }) => {
  if(!text) return m.reply(`Please input YouTube video to be downloaded, Example:\n\n${usedPrefix+command} https://youtube.com/shorts/Wpbo17P-b6U?si=ZFWe6SlPEpnewMU5`)
  await m.reply(wait)
  let anu = await igdl(text)
  await conn.sendFile(m.chat, anu.video, 'video.mp4', anu.caption, m)
}

handler.help = handler.command = ["igdl", "instagram", "ig"]
handler.tags = ["downloader"]
handler.limit = true
handler.register = true

module.exports = handler

async function igdl(url) {
  try {
    const response = await axios.post('https://thesocialcat.com/api/instagram-download', 
      { url: url },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    );
    
    if (response.data && response.data.mediaUrls && response.data.mediaUrls.length > 0) {
      return {
        success: true,
        type: response.data.type,
        video: response.data.mediaUrls[0],
        thumbnail: response.data.thumbnail,
        username: response.data.username,
        caption: response.data.caption,
        allMedia: response.data.mediaUrls
      };
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${error.response.statusText}`);
    }
    throw new Error(`Failed to download: ${error.message}`);
  }
}
