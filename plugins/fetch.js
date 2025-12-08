const axios = require('axios')
const { URL } = require('url')
const fs = require('fs')
const path = require('path')
const os = require('os')

let handler = async (m, { bot, args, text }) => {
  if (!text || !/^https?:\/\//.test(text)) {
    return m.reply('❌ *Penggunaan:*\n/fetch <url>\n\nContoh:\n/fetch https://example.com')
  }

  try {
    await bot.sendChatAction(m.chat, 'typing')

    let _url = new URL(text)
    
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPad; CPU OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
      'Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 OPR/107.0.0.0',
      'Googlebot/2.1 (+http://www.google.com/bot.html)',
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/131.0.6778.139 Safari/537.36',
      'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'
    ]

    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)]

    let res = await axios.get(text, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': randomUserAgent,
        'Accept': '*/*'
      },
      maxContentLength: 100 * 1024 * 1024,
      timeout: 30000
    })

    let contentType = res.headers['content-type'] || ''
    let contentLength = parseInt(res.headers['content-length'] || '0', 10)

    if (contentLength > 100 * 1024 * 1024) {
      return m.reply(`❌ File terlalu besar: ${(contentLength / 1024 / 1024).toFixed(2)} MB`)
    }

    const hostname = _url.hostname.replace(/^www\./, '')
    let filename = hostname
    
    if (contentType.includes('image/')) {
      await bot.sendChatAction(m.chat, 'upload_photo')
      
      const caption = `📦 Fetched from: ${hostname}\n🤖 User-Agent: ${randomUserAgent}`
      
      const tempFile = path.join(os.tmpdir(), `${Date.now()}.${contentType.split('/')[1].split(';')[0]}`)
      fs.writeFileSync(tempFile, res.data)
      
      if (contentType.includes('image/gif')) {
        await bot.sendAnimation(m.chat, tempFile, {
          caption: caption,
          reply_to_message_id: m.message_id
        })
      } else {
        await bot.sendPhoto(m.chat, tempFile, {
          caption: caption,
          reply_to_message_id: m.message_id
        })
      }
      
      fs.unlinkSync(tempFile)
    } else if (contentType.includes('video/')) {
      await bot.sendChatAction(m.chat, 'upload_video')
      
      const caption = `📦 Fetched from: ${hostname}\n🤖 User-Agent: ${randomUserAgent}`
      
      const tempFile = path.join(os.tmpdir(), `${Date.now()}.${contentType.split('/')[1].split(';')[0]}`)
      fs.writeFileSync(tempFile, res.data)
      
      await bot.sendVideo(m.chat, tempFile, {
        caption: caption,
        reply_to_message_id: m.message_id
      })
      
      fs.unlinkSync(tempFile)
    } else if (contentType.includes('audio/')) {
      await bot.sendChatAction(m.chat, 'upload_audio')
      
      const caption = `📦 Fetched from: ${hostname}\n🤖 User-Agent: ${randomUserAgent}`
      
      const tempFile = path.join(os.tmpdir(), `${Date.now()}.${contentType.split('/')[1].split(';')[0]}`)
      fs.writeFileSync(tempFile, res.data)
      
      await bot.sendAudio(m.chat, tempFile, {
        caption: caption,
        reply_to_message_id: m.message_id
      })
      
      fs.unlinkSync(tempFile)
    } else if (contentType.includes('text/') || contentType.includes('application/json') || contentType.includes('application/xml')) {
      let txtContent = res.data.toString('utf-8')
      
      const MAX_MESSAGE_LENGTH = 4000
      
      if (txtContent.length <= MAX_MESSAGE_LENGTH) {
        await m.reply(txtContent)
      } else {
        await bot.sendChatAction(m.chat, 'upload_document')
        
        let ext = '.txt'
        if (contentType.includes('html')) ext = '.html'
        else if (contentType.includes('json')) ext = '.json'
        else if (contentType.includes('xml')) ext = '.xml'
        
        filename = hostname + ext
        
        const tempFile = path.join(os.tmpdir(), filename)
        
        fs.writeFileSync(tempFile, txtContent)
        
        await bot.sendDocument(m.chat, tempFile, {
          reply_to_message_id: m.message_id,
          caption: `📦 Fetched from: ${hostname}`
        })
        
        fs.unlinkSync(tempFile)
      }
    } else {
      await bot.sendChatAction(m.chat, 'upload_document')
      
      if (!filename.includes('.')) {
        const ext = contentType.split('/')[1]?.split(';')[0] || 'bin'
        filename += `.${ext}`
      }
      
      const tempFile = path.join(os.tmpdir(), filename)
      fs.writeFileSync(tempFile, res.data)
      
      const caption = `📦 Fetched from: ${hostname}\n📄 Type: ${contentType}\n📊 Size: ${(contentLength / 1024).toFixed(2)} KB\n🤖 User-Agent: ${randomUserAgent}`
      
      await bot.sendDocument(m.chat, tempFile, {
        reply_to_message_id: m.message_id,
        caption: caption
      })
      
      fs.unlinkSync(tempFile)
    }

  } catch (e) {
    console.error(e)
    return m.reply(`❌ Terjadi kesalahan: ${e.message}`)
  }
}

handler.help = ['fetch', 'get']
handler.tags = ['internet']
handler.command = /^(fetch|get)$/i
handler.limit = true

module.exports = handler