const axios = require('axios');
const FormData = require('form-data');
//push

async function up(buffer) {
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

async function chk(jobId, apiKey) {
  try {
    const response = await axios.get(`https://api.dashx.biz.id/api/job/img2gta?job_id=${jobId}&key=${apiKey}`);
    return response.data;
  } catch (error) {
    throw new Error('Job status check failed: ' + error.message);
  }
}

let herza = async(m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';
  
  if (!mime || !/image\/(jpe?g|png)/.test(mime)) {
    return m.reply(`Please reply or send an image\nExample: ${usedPrefix+command} (reply to image)`);
  }
  
  await m.reply('⏳ Uploading image...');
  
  try {
    let buffer = await q.download();
    let mediaUrl = await up(buffer);
    
    await m.reply('🎨 Converting to GTA style...');
    
    let response = await axios.get(`https://api.dashx.biz.id/api/ai/img2gta?img=${encodeURIComponent(mediaUrl)}&key=${dhx}`);
    
    if (!response.data || !response.data.success || !response.data.data || !response.data.data.job_id) {
      throw new Error('Failed to create job');
    }
    
    let jobId = response.data.data.job_id;
    let max = 30;
    let att = 0;
    let int = 5000;
    
    while (att < max) {
      await new Promise(resolve => setTimeout(resolve, int));
      
      let st = await chk(jobId, dhx);
      
      if (st.success && st.data.status === 'completed' && st.data.result_url) {
        await conn.sendFile(m.chat, st.data.result_url, 'gta-style.jpg', '✅ Image converted to GTA style successfully', m);
        return;
      }
      
      if (st.data.status === 'failed') {
        throw new Error('Job processing failed');
      }
      
      att++;
      
      if (att === 5) {
        await m.reply('⏳ Still processing, please wait...');
      }
    }
    
    throw new Error('Job processing timeout');
    
  } catch(e) {
    console.error(e);
    await m.reply('❌ Error: ' + (e.message || 'API is not responding'));
  }
}

herza.command = herza.help = ["togta", "img2gta", "gtastyle"];
herza.tags = ["ai"];
herza.limit = 5;
herza.register = true;

module.exports = herza;
