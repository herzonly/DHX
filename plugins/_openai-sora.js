const axios = require('axios');

global.soraJobsBot = global.soraJobsBot || new Map();

let orangsigma = async (m, { conn, usedPrefix, command, text }) => {
  if(!text) return m.reply(`Please input prompt, Example:\n\n${usedPrefix + command} A cat running on car roof`);
  
  const loadingMsg = await m.reply('⏳ Creating video generation task...');
  
  try {
    const response = await axios.get(`https://api.dashx.biz.id/api/AI/supawork-sora/create?prompt=${encodeURIComponent(text)}&key=${dhx}`, {
      timeout: 120000
    });
    
    console.log('Create Response:', JSON.stringify(response.data));
    
    if (response.data.code === 100000 && response.data.data && response.data.data.creation_id) {
      const creationId = response.data.data.creation_id;
      const authorization = response.data.data.account.authorization;
      const identityId = response.data.data.account.identity_id;
      const jobId = `sora_${creationId}`;
      
      global.soraJobsBot.set(jobId, {
        chatId: m.chat,
        userId: m.from.id,
        creationId: creationId,
        authorization: authorization,
        identityId: identityId,
        prompt: text,
        status: 'processing',
        loadingMsgId: loadingMsg.message_id
      });
      
      await conn.telegram.editMessageText(
        m.chat,
        loadingMsg.message_id,
        null,
        `✅ Video generation task created!\n\n🆔 Creation ID: \`${creationId}\`\n📝 Prompt: ${text}\n⏱️ Estimated: 5-10 minutes\n\n💡 You can use other commands while waiting.\n🔔 Checking status every 2 seconds...`,
        { parse_mode: 'Markdown' }
      );
      
      setTimeout(() => {
        checkVideoStatus(conn, jobId, 1);
      }, 2000);
      
    } else {
      throw new Error('Invalid response: ' + JSON.stringify(response.data));
    }
    
  } catch(e) {
    console.error('Create Error:', e.response?.data || e.message);
    
    let errorMsg = '❌ Error creating task:\n\n';
    
    if (e.response?.status === 400) {
      errorMsg += `Bad Request (400)\n`;
      errorMsg += `Details: ${JSON.stringify(e.response.data)}`;
    } else if (e.response?.status === 500) {
      errorMsg += `Server Error (500)\n`;
      errorMsg += `Message: ${e.response.data?.message || 'Unknown error'}`;
    } else {
      errorMsg += e.message || 'Unknown error';
    }
    
    await conn.telegram.editMessageText(
      m.chat,
      loadingMsg.message_id,
      null,
      errorMsg
    ).catch(() => {
      conn.reply(m.chat, errorMsg);
    });
  }
}

async function checkVideoStatus(conn, jobId, attempt) {
  const job = global.soraJobsBot.get(jobId);
  if (!job) return;
  
  if (attempt > 120) {
    global.soraJobsBot.delete(jobId);
    await conn.telegram.sendMessage(
      job.chatId,
      `❌ Video generation timeout after 4 minutes\n\n🆔 Creation ID: \`${job.creationId}\``,
      { parse_mode: 'Markdown' }
    );
    return;
  }
  
  try {
    const response = await axios.get(`https://api.dashx.biz.id/api/AI/supawork-sora/check?authorization=${job.authorization}&identity_id=${job.identityId}&key=DHX-M3SA`, {
      timeout: 15000
    });
    
    const data = response.data.data;
    
    if (data.status === 1 && data.video_url) {
      global.soraJobsBot.delete(jobId);
      
      try {
        await conn.telegram.deleteMessage(job.chatId, job.loadingMsgId).catch(() => {});
      } catch(e) {}
      
      await conn.telegram.sendVideo(job.chatId, data.video_url, {
        caption: `✅ Video generation completed!\n\n📝 Prompt: ${job.prompt}\n🆔 Creation ID: \`${job.creationId}\``,
        parse_mode: 'Markdown'
      });
      
      return;
      
    } else if (data.status === 2) {
      global.soraJobsBot.delete(jobId);
      
      await conn.telegram.sendMessage(
        job.chatId,
        `❌ Video generation failed\n\n🆔 Creation ID: \`${job.creationId}\`\n📝 Prompt: ${job.prompt}`,
        { parse_mode: 'Markdown' }
      );
      
      return;
      
    } else if (data.status === 0) {
      if (attempt % 15 === 0) {
        try {
          await conn.telegram.editMessageText(
            job.chatId,
            job.loadingMsgId,
            null,
            `⏳ Still processing... (${Math.floor(attempt * 2 / 60)}m ${(attempt * 2) % 60}s)\n\n🆔 Creation ID: \`${job.creationId}\`\n📝 Prompt: ${job.prompt}\n\n💡 Please be patient...`,
            { parse_mode: 'Markdown' }
          ).catch(() => {});
        } catch(e) {}
      }
      
      setTimeout(() => {
        checkVideoStatus(conn, jobId, attempt + 1);
      }, 2000);
      
    } else if (data.status === -1) {
      global.soraJobsBot.delete(jobId);
      
      await conn.telegram.sendMessage(
        job.chatId,
        `❌ Job not found or expired\n\n🆔 Creation ID: \`${job.creationId}\``,
        { parse_mode: 'Markdown' }
      );
      
      return;
      
    } else {
      setTimeout(() => {
        checkVideoStatus(conn, jobId, attempt + 1);
      }, 2000);
    }
    
  } catch(error) {
    console.error('Error checking status:', error.message);
    
    setTimeout(() => {
      checkVideoStatus(conn, jobId, attempt + 1);
    }, 2000);
  }
}

orangsigma.help = orangsigma.command = ['sora', 'soraai'];
orangsigma.tags = ['ai'];
orangsigma.register = true;
orangsigma.limit = 5;

module.exports = orangsigma;