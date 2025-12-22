const axios = require('axios')

let handler = m => m

handler.before = async function (m, { user, isBotAdmin, isAdmin, bot, conn, chat }) {
  if (m.fromMe) return
  
  let chatData = global.db.data.chats[m.chat]
  let userData = global.db.data.users[m.from.id]
  
  let autoDLEnabled = false
  
  if (m.isGroup) {
    if (!chatData || !chatData.autoDL) return
    autoDLEnabled = true
  } else {
    if (!userData || !userData.autoDL) return
    autoDLEnabled = true
  }
  
  if (!autoDLEnabled) return
  
  let text = m.text || m.caption || ''
  if (!text) return
  
  const urlRegex = /https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com|instagram\.com|instagr\.am|twitter\.com|x\.com|facebook\.com|fb\.watch|youtube\.com|youtu\.be|pinterest\.com|threads\.net)[^\s]*/gi
  
  let urls = text.match(urlRegex)
  if (!urls || urls.length === 0) return
  
  let url = urls[0]
  
  try {
    const loadingMsg = await m.reply('⏳ Downloading, please wait...')
    
    let encodedUrl = encodeURIComponent(url)
    let apiUrl = `https://api.dashx.biz.id/api/download/aio?url=${encodedUrl}&key=${dhx}`
    
    let { data } = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 60000
    })
    
    if (!data.success || !data.msg || data.msg.length === 0) {
      await bot.telegram.deleteMessage(m.chat, loadingMsg.message_id).catch(() => {})
      return await m.reply('❌ Download failed. URL not supported or an error occurred.')
    }
    
    let result = data.msg[0]
    let videoUrl = result.video_file_url
    let imageUrl = result.videoimg_file_url || result.image
    let title = (result.title || 'Media').replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')
    let author = (data.author || 'Unknown').replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')
    
    if (!videoUrl && !imageUrl) {
      await bot.telegram.deleteMessage(m.chat, loadingMsg.message_id).catch(() => {})
      return await m.reply('❌ Media not found.')
    }
    
    let caption = `✅ *Download Successful*\n\n📝 Title: ${title}\n👤 Author: ${author}`
    
    if (videoUrl) {
      let videoBuffer = await axios.get(videoUrl, {
        responseType: 'arraybuffer',
        timeout: 120000
      })
      
      await bot.telegram.deleteMessage(m.chat, loadingMsg.message_id).catch(() => {})
      
      await bot.telegram.sendVideo(m.chat, {
        source: Buffer.from(videoBuffer.data)
      }, {
        caption: caption,
        parse_mode: 'MarkdownV2',
        reply_to_message_id: m.message_id
      })
    } else if (imageUrl) {
      let imageBuffer = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 120000
      })
      
      await bot.telegram.deleteMessage(m.chat, loadingMsg.message_id).catch(() => {})
      
      await bot.telegram.sendPhoto(m.chat, {
        source: Buffer.from(imageBuffer.data)
      }, {
        caption: caption,
        parse_mode: 'MarkdownV2',
        reply_to_message_id: m.message_id
      })
    }
    
    return true
    
  } catch (e) {
    console.error('AutoDL Error:', e.message)
    console.error('Full error:', e)
    await m.reply(`❌ Download failed: ${e.message}`)
    return false
  }
}

module.exports = handler
