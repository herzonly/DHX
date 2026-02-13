const axios = require('axios');

let handler = async(m, { conn, text, usedPrefix, command }) => {
  if(!text) return m.reply(`Please input a prompt, Example:\n\n${usedPrefix+command} Warm and ultra-cozy luxury apartment interior shot, viewed from inside toward a large open balcony overlooking a stunning neon futuristic city. Soft warm lights, wooden accents, plush sofa, indoor plants, and gentle shadows create a comforting atmosphere. The balcony is wide open, letting in a cool night breeze with sheer curtains softly flowing. Outside, the megacity glows in vibrant pink, cyan, and purple neon lights, reflected on the glass and polished surfaces. Wide-angle cinematic view, intimate yet luxurious ambience, ultra-realistic textures, high detail, soft depth of field, premium cyberpunk aesthetic with a warm cozy mood.`);
  
  await m.reply(wait);
  
  try {
    const prompt = encodeURIComponent(text + ' high quality and HDR image');
    let job = await axios.get(`https://api.dashx.dpdns.org/api/AI/imagegen?prompt=${prompt}&key=${dhx}`);
    
    if(!job.data.success) throw new Error('Failed to create job');
    
    let id = job.data.data.job_id;
    let img = null;
    const maxRetries = 90;
    const checkInterval = 3000;
    
    for(let i = 0; i < maxRetries; i++) {
      await new Promise(r => setTimeout(r, checkInterval));
      
      let res = await axios.get(`https://api.dashx.dpdns.org/api/job/imagegen?id=${id}&key=${dhx}`);
      
      if(res.data.success && res.data.data.status === 'completed') {
        img = res.data.data.result.image_url;
        break;
      }
      
      if(res.data.data.status === 'failed') {
        throw new Error('Image generation failed');
      }
    }
    
    if(!img) throw new Error('Timeout: Image generation took too long');
    
    await conn.sendFile(m.chat, img, 'image.jpg', text, m);
    
  } catch(e) {
    console.error('Text2Img Error:', e.message);
    await m.reply('Sorry our API(s) service is unavailable right now!');
  }
};

handler.help = handler.command = ["text2img", "txt2img", "text2image"];
handler.tags = ["ai"];
handler.limit = 2;
handler.register = true;

module.exports = handler;
