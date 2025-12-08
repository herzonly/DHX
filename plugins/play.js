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

    const caption = `╭─────═[ Youtube Play ]═─────⋆
├ ⬡ *Title:* ${searchData.title}
├ ⬡ *Duration:* ${searchData.timestamp}
├ ⬡ *Upload At:* ${searchData.ago}
├ ⬡ *Viewers:* ${searchData.views.toLocaleString()}
├ ⬡ *Channel:* ${searchData.author.name}
├ ⬡ *ID:* ${searchData.videoId}
├ ⬡ *Description:* ${searchData.description.substring(0, 100)}...
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

    let apiUrl = `https://api.dashx.biz.id/api/download/youtube?url=${encodeURIComponent(videoUrl)}&type=mp3&key=DHX-M3SA`
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
    let audioUrl = data.download.url
    let title = data.metadata.title
    let duration = data.metadata.duration

    const audioBuffer = await bot.getBuffer(audioUrl)

    await bot.sendAudio(m.chat, audioBuffer, {
      caption: `🎵 *${title}*\n👤 ${searchData.author.name}\n⏱ ${searchData.timestamp}`,
      parse_mode: 'Markdown',
      reply_to_message_id: m.message_id,
      title: title,
      performer: searchData.author.name,
      duration: duration,
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