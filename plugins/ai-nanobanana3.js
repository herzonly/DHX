const axios = require('axios');

let handler = async(m, { conn, usedPrefix, command, text }) => {
  if(!text) return m.reply(`Input an Prompt to create image, Example:\n\n${usedPrefix + command} a cat standing on windows`);
  await m.reply(wait);
  try {
  
  let anu = await axios.get(`https://api.dashx.biz.id/api/AI/text2imgnanobanana3?prompt=${encodeURIComponent(text)}&key=${dhx}`);
  await conn.sendFile(m.chat, anu.data.data.result_url, 'image.jpg', text, m.id);
  } catch(e) {
  throw new Error(e);
  }
};

handler.help = handler.command = ['text2img', 'nanobanana3']
handler.tags = ['ai']
handler.limit = true
handler.register = true

module.exports = handler
