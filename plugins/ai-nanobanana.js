const axios = require('axios');
const FormData = require('form-data');

async function uploadToTmpFiles(buffer) {
  try {
    const form = new FormData();
    form.append('file', buffer, { filename: 'image.jpg' });
    
    const response = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
      headers: form.getHeaders()
    });
    
    if (response.data && response.data.data && response.data.data.url) {
      let url = response.data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
      return url;
    }
    throw new Error('Failed to get upload URL');
  } catch (error) {
    throw new Error('Upload failed: ' + error.message);
  }
}

let herza = async(m, { conn, text, usedPrefix, command }) => {
  let media = m.quoted ? m.quoted : m;
  
  if(!media || !text) {
    return m.reply(`Please input a media, reply or send image with caption ${usedPrefix+command} <prompt>\nExample: ${usedPrefix+command} Make it has white skin`);
  }
  
  await m.reply('⏳ Uploading image...');
  
  try {
    let buffer = await media.download();
    let mediaUrl = await uploadToTmpFiles(buffer);
    
    await m.reply('🎨 Processing image...');
    
    let response = await axios.get(`https://maylinejix-dashme.hf.space/api/AI/nanobanana2?img1=${encodeURIComponent(mediaUrl)}&prompt=${encodeURIComponent(text)}&key=${dhx}`);
    
    if (response.data && response.data.data && response.data.data.result_url) {
      await conn.sendFile(m.chat, response.data.data.result_url, 'image.jpg', '✅ Image Edited Successfully', m);
    } else {
      throw new Error('Invalid API response');
    }
    
  } catch(e) {
    console.error(e);
    await m.reply('❌ Error: ' + (e.message || 'API is not responding'));
  }
}

herza.command = herza.help = ["nanobanana", "imgedit", "imageedit"];
herza.tags = ["ai"];
herza.limit = 5;
herza.register = true;

module.exports = herza;