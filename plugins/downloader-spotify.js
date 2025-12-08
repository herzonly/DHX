const axios = require("axios");

let handler = async(m, { conn, text, usedPrefix, command }) => {
  if(!text) return m.reply(`Please enter an Spotify track URL, Example:\n\n${usedPrefix+command} https://open.spotify.com/track/6dOtVTDdiauQNBQEDOtlAB?si=ySLW2eDlTT6IsLytnaCWXA`)
  await m.reply(wait)
  try {
    let anu = await axios.get(`https://api.dashx.biz.id/api/download/spotifydl?url=${encodeURIComponent(text)}&key=${dhx}`)
    let capt = `
    * SPOTIFY DOWNLOADER*
    
    Title: ${anu.data.data.title}
    Author: ${anu.data.data.artist}
    `
    await conn.sendFile(m.chat, anu.data.data.url, anu.data.data.title + '.mp3', capt, m)
  } catch(e) {
    await m.reply(e)
    throw new Error(e)
  }
}

handler.help = handler.command = ["spotify", "spotifydl"]
handler.tags = ["downloader"]
handler.register = true
handler.limit = 2

module.exports = handler;