
const axios = require('axios');

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return m.reply(`Enter sfl.gl/xxxx link to skip`);
  
  try {
    await m.reply('⏳ Processing your link...');
    
    let init;
    try {
      const { data } = await axios.get(`https://api.dashx.dpdns.org/api/tools/sflgl?url=${text}&key=${dhx}`);
      init = data;
    } catch (e) {
      return m.reply(`Initial request error:\nStatus: ${e.response?.status}\nData: ${JSON.stringify(e.response?.data)}`);
    }
    
    if (!init.success) return m.reply(`Job creation failed: ${init.data?.msg || 'Unknown error'}`);
    
    const jobId = init.data.ready;
    let readyUrl = null;
    
    for (let i = 0; i < 80; i++) {
      await new Promise(r => setTimeout(r, 3000));
      
      let job;
      try {
        const { data } = await axios.get(`https://api.dashx.dpdns.org/api/job/sflgl?text=${jobId}&key=${dhx}`);
        job = data;
      } catch (e) {
        continue;
      }
      
      if (job.success && job.data.ready && job.data.ready.startsWith('http')) {
        readyUrl = job.data.ready;
        break;
      }
    }
    
    if (!readyUrl) return m.reply('Timeout cannot get the url, sorry ;(');
    
    await conn.sendButton(m.chat, {
      text: `✅ *Link Successfully Processed!*\n\n🔗 Your URL is ready\n⚡ Click button below to access`,
      buttons: [
        { type: "url", name: "🚀 Open Link", value: readyUrl }
      ]
    });
    
  } catch (e) {
    m.reply(`Unexpected error: ${e.message}`);
  }
};

handler.command = ["sflgl", "ssflgl", "skipsflgl"];
handler.tags = ["tools"];
handler.help = ["sflgl", "ssflgl", "skipsflgl"];
handler.limit = 2;
handler.register = true;

module.exports = handler;
