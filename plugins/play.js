const axios = require('axios')
const yts = require('yt-search')
const { Markup } = require('telegraf')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const execAsync = promisify(exec)
const unlinkAsync = promisify(fs.unlink)

let handler = async (m, { bot, args, DHX }) => {
  if (!args[0]) {
    return m.reply('❌ *Penggunaan:*\n/play <judul lagu/URL YouTube>')
  }

  let input = args.join(' ')
  let videoUrl = ''
  let searchData = null
  
  try {
    await bot.sendChatAction(m.chat, 'typing')

    if (input.match(/(?:youtube\.com|youtu\.be)/)) {
      videoUrl = input
      let videoId = videoUrl.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/)?.[1]
      if (videoId) {
        let search = await yts({ videoId })
        searchData = search
      }
    } else {
      let search = await yts(input)
      if (!search.videos.length) {
        return m.reply('❌ Tidak ditemukan hasil untuk: ' + input)
      }
      
      searchData = search.videos[0]
      videoUrl = searchData.url
    }

    if (!searchData) {
      return m.reply('❌ Tidak dapat menemukan informasi video')
    }

    if (searchData.seconds >= 3600) {
      return m.reply('❌ Video lebih dari 1 jam!')
    }

    const description = searchData.description.length > 150 
      ? searchData.description.substring(0, 150) + '...' 
      : searchData.description

    const caption = `╭─────═[ Youtube Play ]═─────⋆
├ ⬡ *Title:* ${searchData.title}
├ ⬡ *Duration:* ${searchData.timestamp}
├ ⬡ *Upload At:* ${searchData.ago}
├ ⬡ *Viewers:* ${searchData.views.toLocaleString()}
├ ⬡ *Channel:* ${searchData.author.name}
├ ⬡ *ID:* ${searchData.videoId}
├ ⬡ *Description:* ${description}
├ ⬡ *Url:* ${searchData.url}
╰───────────────⋆

⏳ _Mengunduh audio..._`

    const thumbnailBuffer = await bot.getBuffer(searchData.thumbnail)

    await bot.sendPhoto(m.chat, thumbnailBuffer, {
      caption: caption,
      parse_mode: 'Markdown',
      reply_to_message_id: m.message_id,
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.url('🎥 Watch on YouTube', searchData.url)]
      ]).reply_markup
    })

    await bot.sendChatAction(m.chat, 'upload_audio')

    let apiUrl = `https://api.dashx.biz.id/api/download/youtube?url=${encodeURIComponent(videoUrl)}&key=${dhx}`
    let response = await axios.get(apiUrl, {
      timeout: 60000,
      validateStatus: function (status) {
        return status < 500
      }
    })
    
    if (!response.data || !response.data.success) {
      return m.reply('❌ Gagal mengunduh audio')
    }

    let data = response.data.data
    
    let audioDownload = data.downloads.find(item => item.type === 'Audio' && item.quality === '128K')
    if (!audioDownload) {
      audioDownload = data.downloads.find(item => item.type === 'Audio')
    }
    
    if (!audioDownload) {
      return m.reply('❌ Audio tidak tersedia')
    }

    let audioProcessUrl = audioDownload.url
    
    let audioFileResponse = await axios.get(audioProcessUrl, {
      timeout: 60000,
      validateStatus: function (status) {
        return status < 500
      }
    })
    
    if (!audioFileResponse.data || !audioFileResponse.data.fileUrl) {
      return m.reply('❌ Gagal mendapatkan URL download audio')
    }
    
    let audioUrl = audioFileResponse.data.fileUrl
    let title = data.title

    const timestamp = Date.now()
    const tempM4a = path.join(__dirname, `temp_${timestamp}.m4a`)
    const tempMp3 = path.join(__dirname, `temp_${timestamp}.mp3`)
    
    const writer = fs.createWriteStream(tempM4a)
    const audioResponse = await axios({
      url: audioUrl,
      method: 'GET',
      responseType: 'stream'
    })
    
    audioResponse.data.pipe(writer)
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
    
    await execAsync(`ffmpeg -i "${tempM4a}" -vn -ar 44100 -ac 2 -b:a 128k "${tempMp3}"`)
    
    const mp3Buffer = fs.readFileSync(tempMp3)
    
    await unlinkAsync(tempM4a).catch(() => {})
    await unlinkAsync(tempMp3).catch(() => {})

    await bot.sendAudio(m.chat, mp3Buffer, {
      caption: `🎵 *${title}*\n👤 ${data.channel.name}\n⏱ ${data.duration}`,
      parse_mode: 'Markdown',
      reply_to_message_id: m.message_id,
      title: title,
      performer: data.channel.name,
      duration: data.duration,
      thumbnail: thumbnailBuffer
    })

  } catch (e) {
    console.error(e)
    return m.reply('❌ Terjadi kesalahan: ' + e.message)
  }
}

handler.help = ['play', 'song']
handler.tags = ['downloader']
handler.command = /^(play|song)$/i
handler.limit = true

module.exports = handler
