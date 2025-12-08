const axios = require('axios');
let handler = async(m, { conn, text, usedPrefix, command }) => {
  if(!text) return m.reply(`Please input an message, Example:\n\n${usedPrefix + command} hai ChatGPT, Model apa yang kamu gunakan`);
await m.reply(wait);
try {

let anu = await axios.get(`https://api.dashx.biz.id/api/AI/chatgpt?text=${encodeURIComponent(text)}&key=${dhx}`);
await bot.reply(m.chat, anu.data.msg, m.id)
  } catch(e) {
  await m.reply('Sorry our API(s) service is unavailbe right now! ');
  throw new Error(e)
   }
};

handler.help = handler.command = ["openai", "ai", "chatgpt"];
handler.tags = ["ai"];
handler.limit = 2;
handler.register = true;

module.exports = handler;