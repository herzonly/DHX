const upload = require('../lib/uploadFile');
const axios = require('axios');

let handler = async(m, { bot, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if(!mime.startsWith('image')) return m.reply(`Please send or reply to an image`)
  
  try {
    await m.reply(wait)
    let buff = await q.download()
    if(!buff || buff.length === 0) return m.reply(`Failed to download image. Please send the image again.`)
    
    const url = await upload(buff)
    if(!url) return m.reply(`Failed to upload image. Please try again.`)
    let api = await axios.get(`https://api.dashx.dpdns.org/api/AI/colorize?image=${url}&key=${dhx}`)
    await bot.sendFile(m.chat, api.data.data.result_url, 'colorized.jpg', 'Image Colorized', m)
  } catch(e) {
    console.log(e)
    throw(e)
  }
}

handler.help = ['colorize'];
handler.command = ['colorized']
handler.register = true
handler.limit = 2
handler.tags = ['ai']

module.exports = handler
