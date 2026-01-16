const axios = require('axios')
const yts = require('yt-search')
const { Markup } = require('telegraf')

let handler = async (m, { bot, args }) => {
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
╰───────────────⋆`

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

    let apiUrl = `https://api.dashx.biz.id/api/download/youtube?url=${encodeURIComponent(videoUrl)}&key=DHX-M3SA`
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

    let audioUrl = audioDownload.url
    let title = data.title

    const audioBuffer = await bot.getBuffer(audioUrl)

    await bot.sendAudio(m.chat, audioBuffer, {
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
