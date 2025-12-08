const axios = require('axios');
let handler = async(m, { conn, text, usedPrefix, command }) => {
  if(!text) return m.reply(`Please input an message, Example:\n\n${usedPrefix + command} https://www.facebook.com/share/v/16Vbv7LqQu/`);
await m.reply(wait);
try {

let anu = await axios.get(`https://api.dashx.biz.id/api/download/fbdl?url=${encodeURIComponent(text)}&key=${dhx}`);
await bot.sendFile(m.chat, anu.data.data.url, '', 'File ready', m)
  } catch(e) {
  await m.reply('Sorry our API(s) service is unavailbe right now! ');
  throw new Error(e)
   }
};

handler.help = handler.command = ["fb", "facebook", "fbdl"];
handler.tags = ["downloader"];
handler.limit = 2;
handler.register = true;

module.exports = handler;