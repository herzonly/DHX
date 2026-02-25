const axios = require('axios')
const yts = require('yt-search')
const { Markup } = require('telegraf')

let handler = async (m, { bot, args, DHX }) => {
  if (!args[0]) return m.reply('❌ *Penggunaan:*\n/play <judul lagu/URL YouTube>')

  let input = args.join(' ')
  let videoUrl = ''
  let searchData = null

  try {
    await bot.sendChatAction(m.chat, 'typing')

    if (input.match(/(?:youtube\.com|youtu\.be)/)) {
      videoUrl = input
      let videoId = videoUrl.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/)?.[1]
      if (videoId) searchData = await yts({ videoId })
    } else {
      let search = await yts(input)
      if (!search.videos.length) return m.reply('❌ Tidak ditemukan hasil untuk: ' + input)
      searchData = search.videos[0]
      videoUrl = searchData.url
    }

    if (!searchData) return m.reply('❌ Tidak dapat menemukan informasi video')
    if (searchData.seconds >= 3600) return m.reply('❌ Video lebih dari 1 jam!')

    const desc = (searchData.description || '').substring(0, 150) + (searchData.description?.length > 150 ? '...' : '')

    const caption = `╭─────═[ Youtube Play ]═─────⋆
├ ⬡ *Title:* ${searchData.title}
├ ⬡ *Duration:* ${searchData.timestamp}
├ ⬡ *Upload At:* ${searchData.ago}
├ ⬡ *Viewers:* ${searchData.views.toLocaleString()}
├ ⬡ *Channel:* ${searchData.author.name}
├ ⬡ *ID:* ${searchData.videoId}
├ ⬡ *Description:* ${desc}
├ ⬡ *Url:* ${searchData.url}
╰───────────────⋆

⏳ _Mengunduh audio..._`

    const thumbnailBuffer = await bot.getBuffer(searchData.thumbnail)

    await bot.sendPhoto(m.chat, thumbnailBuffer, {
      caption,
      parse_mode: 'Markdown',
      reply_to_message_id: m.message_id,
      reply_markup: Markup.inlineKeyboard([[Markup.button.url('🎥 Watch on YouTube', searchData.url)]]).reply_markup
    })

    await bot.sendChatAction(m.chat, 'upload_audio')

    const { data: apiRes } = await axios.get(
      `https://api.dashx.dpdns.org/api/download/youtube?url=${encodeURIComponent(videoUrl)}&key=${dhx}`,
      { timeout: 60000, validateStatus: s => s < 500 }
    )

    if (!apiRes?.success) return m.reply('❌ Gagal mengunduh audio')

    const { metadata, download } = apiRes.data
    const audioUrl = download.audio?.[0]?.url

    if (!audioUrl) return m.reply('❌ Audio tidak tersedia')

    const { data: audioRaw } = await axios.get(audioUrl, { responseType: 'arraybuffer', timeout: 120000 })
    const audioBuffer = Buffer.from(audioRaw)

    const minutes = Math.floor(metadata.duration / 60)
    const seconds = metadata.duration % 60
    const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`

    await bot.sendAudio(m.chat, audioBuffer, {
      caption: `🎵 *${metadata.title}*\n👤 ${searchData.author.name}\n⏱ ${formattedDuration}`,
      parse_mode: 'Markdown',
      reply_to_message_id: m.message_id,
      title: metadata.title,
      performer: searchData.author.name,
      duration: metadata.duration,
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
