const { youtube } = require('notmebotz-tools');

let handler = async(m, { conn, text, usedPrefix, command }) => {
  if(!text) return m.reply(`Please input YouTube video to be downloaded, Example:\n\n${usedPrefix+command} https://youtube.com/shorts/Wpbo17P-b6U?si=ZFWe6SlPEpnewMU5`)
  await m.reply(wait)
  let anu = await youtube("ytmp4", text, "720")
  let { title, duration, thumbnail } = anu.data.metadata
  let capt = `
  Title: ${title}
  Duration: ${duration}
  Thumbnail: [Click me](${thumbnail})
  `.trim()
  await conn.sendFile(m.chat, anu.data.download.url, 'video.mp4', capt, m)
}

handler.help = handler.command = ["ytmp4", "ytv"]
handler.tags = ["downloader"]
handler.limit = true
handler.register = true

module.exports = handler