let handler = m => m

handler.before = async function (m, { user, isBotAdmin, isAdmin, bot, conn }) {
  if (!m.isGroup) return
  if (m.fromMe) return
  
  let chat = global.db.data.chats[m.chat]
  if (!chat?.antiChannel) return
  
  let isForwardedFromChannel = m.message?.forward_from_chat?.type === 'channel'
  if (!isForwardedFromChannel) return
  
  let channelName = m.message.forward_from_chat.title || 'Unknown Channel'
  let channelUsername = m.message.forward_from_chat.username ? `@${m.message.forward_from_chat.username}` : ''
  
  const sentMsg = await m.reply(
    `*「 ANTI FORWARD CHANNEL 」*\n\n` +
    `Detected ${m.usertag}, kamu telah forward pesan dari channel!\n\n` +
    `📢 Channel: ${channelName} ${channelUsername}\n\n` +
    `Maaf, fitur Anti Forward Channel aktif di grup ini.`,
    { parse_mode: 'Markdown' }
  )
  
  setTimeout(async () => {
    try {
      await (bot || conn).telegram.deleteMessage(m.chat, sentMsg.message_id)
    } catch (e) {}
  }, 5000)
  
  if (isAdmin || !isBotAdmin) return
  
  try {
    await (bot || conn).telegram.deleteMessage(m.chat, m.message.message_id)
  } catch (e) {}
}

module.exports = handler