const axios = require('axios');

let handler = async(m, { conn, text, usedPrefix, command }) => {
  if(!text) return m.reply(`Please input a prompt, Example:\n\n${usedPrefix+command} Warm and ultra-cozy luxury apartment interior shot, viewed from inside toward a large open balcony overlooking a stunning neon futuristic city. Soft warm lights, wooden accents, plush sofa, indoor plants, and gentle shadows create a comforting atmosphere. The balcony is wide open, letting in a cool night breeze with sheer curtains softly flowing. Outside, the megacity glows in vibrant pink, cyan, and purple neon lights, reflected on the glass and polished surfaces. Wide-angle cinematic view, intimate yet luxurious ambience, ultra-realistic textures, high detail, soft depth of field, premium cyberpunk aesthetic with a warm cozy mood.`);
  
  await m.reply(wait);
  
  try {
    let job = await axios.get(`https://api.dashx.dpdns.org/api/AI/imagegen?prompt=${encodeURIComponent(text + ' high quality and HDR image')}&key=${dhx}`);
    let id = job.data.data.job_id;
    let img = null;
    
    for(let i = 0; i < 300; i++) {
      await new Promise(r => setTimeout(r, 2000));
      let res = await axios.get(`https://api.dashx.dpdns.org/api/job/imagegen?id=${id}&key=${dhx}`);
      if(res.data.data.status === 'completed') {
        img = res.data.data.result.image_url;
        break;
      }
    }
    
    if(!img) throw new Error('Timeout');
    await conn.sendFile(m.chat, img, 'image.jpg', text, m);
    
  } catch(e) {
    await m.reply('Sorry our API(s) service is unavailable right now!');
    throw new Error(e);
  }
};

handler.help = handler.command = ["text2img", "txt2img", "text2image"];
handler.tags = ["ai"];
handler.limit = 2;
handler.register = true;

module.exports = handler;
