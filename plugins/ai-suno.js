const axios = require('axios')
const { Markup } = require('telegraf')

const userSessions = new Map()
const SESSION_TIMEOUT = 120000

const apiClient = axios.create({
  maxRedirects: 5
})

let handler = async (m, { bot, args }) => {
  const userId = m.from.id
  const chatId = m.chat

  if (args.length === 0) {
    userSessions.set(userId, {
      step: 'mode',
      timestamp: Date.now()
    })

    await bot.sendMessage(chatId, '🎵 *Suno AI Music Generator*\n\nPilih mode:', {
      parse_mode: 'Markdown',
      reply_to_message_id: m.message_id,
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('🤖 AI Lyrics', 'suno_ai_lyrics')],
        [Markup.button.callback('✍️ Your Own Lyrics', 'suno_custom_lyrics')]
      ]).reply_markup
    })

    setTimeout(() => {
      const session = userSessions.get(userId)
      if (session && session.step === 'mode') {
        userSessions.delete(userId)
      }
    }, SESSION_TIMEOUT)

    return
  }
}

handler.before = async (m, { bot }) => {
  const userId = m.from.id
  const chatId = m.chat
  const text = m.text

  if (!text) return

  const session = userSessions.get(userId)
  if (!session) return

  try {
    if (session.step === 'ai_prompt') {
      userSessions.set(userId, {
        ...session,
        prompt: text,
        step: 'processing',
        timestamp: Date.now()
      })

      const waitMsg = await bot.sendMessage(chatId, '⏳ Generating music...', {
        reply_to_message_id: m.message_id,
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('❌ Cancel', `cancel_gen_${userId}`)]
        ]).reply_markup
      })

      await bot.sendChatAction(chatId, 'upload_audio')

      const apiUrl = `https://api.dashx.biz.id/api/AI/sunov2?mode=ai&prompt=${encodeURIComponent(text)}&key=${dhx}`
      
      let response
      try {
        response = await apiClient.get(apiUrl)
      } catch (err) {
        const session = userSessions.get(userId)
        if (!session || session.cancelled) {
          return true
        }
        
        await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {})
        
        if (err.code === 'ETIMEDOUT' || err.message.includes('timeout') || err.message.includes('timed out')) {
          await bot.sendMessage(chatId, '❌ API timeout. Music generation takes too long. Please try again with simpler prompt.')
        } else {
          await bot.sendMessage(chatId, '❌ API Error: ' + err.message)
        }
        
        userSessions.delete(userId)
        return true
      }

      await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {})

      const session = userSessions.get(userId)
      if (!session || session.cancelled) {
        return true
      }

      if (!response.data || !response.data.success) {
        await bot.sendMessage(chatId, '❌ Failed to generate music')
        userSessions.delete(userId)
        return true
      }

      const resultData = response.data.result.data
      
      if (resultData && resultData.length > 0) {
        let successCount = 0
        for (let i = 0; i < resultData.length; i++) {
          const song = resultData[i]
          const audioUrl = song.audio_url
          const imageUrl = song.image_url
          
          if (audioUrl) {
            try {
              const audioBuffer = await bot.getBuffer(audioUrl)
              
              if (!audioBuffer || audioBuffer.length === 0) {
                console.log(`Skipping empty audio ${i + 1}`)
                continue
              }
              
              const thumbnailBuffer = imageUrl ? await bot.getBuffer(imageUrl).catch(() => null) : null
              
              await bot.sendAudio(chatId, audioBuffer, {
                caption: `🎵 *${song.title || 'Generated Music'}* (${i + 1}/${resultData.length})\n🤖 AI Lyrics\n💬 ${text}`,
                parse_mode: 'Markdown',
                reply_to_message_id: m.message_id,
                title: song.title,
                thumbnail: thumbnailBuffer
              })
              
              successCount++
              
              if (i < resultData.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000))
              }
            } catch (e) {
              console.error(`Error sending audio ${i + 1}:`, e.message)
            }
          }
        }
        
        if (successCount === 0) {
          await bot.sendMessage(chatId, '❌ Failed to send audio files')
        }
      } else {
        await bot.sendMessage(chatId, '❌ No audio generated')
      }

      userSessions.delete(userId)
      return true

    } else if (session.step === 'custom_lyrics') {
      userSessions.set(userId, {
        ...session,
        lyrics: text,
        step: 'title',
        timestamp: Date.now()
      })

      await bot.sendMessage(chatId, '🎵 Enter music title:', {
        reply_to_message_id: m.message_id
      })

      setTimeout(() => {
        const session = userSessions.get(userId)
        if (session && session.step === 'title') {
          userSessions.delete(userId)
        }
      }, SESSION_TIMEOUT)

      return true

    } else if (session.step === 'title') {
      userSessions.set(userId, {
        ...session,
        title: text,
        step: 'style',
        timestamp: Date.now()
      })

      await bot.sendMessage(chatId, '🎨 Enter music style:\n\nExample: Soft indie-pop, mellow, dreamy', {
        reply_to_message_id: m.message_id
      })

      setTimeout(() => {
        const session = userSessions.get(userId)
        if (session && session.step === 'style') {
          userSessions.delete(userId)
        }
      }, SESSION_TIMEOUT)

      return true

    } else if (session.step === 'style') {
      userSessions.set(userId, {
        ...session,
        style: text,
        step: 'processing',
        timestamp: Date.now()
      })

      const waitMsg = await bot.sendMessage(chatId, '⏳ Creating your music...', {
        reply_to_message_id: m.message_id,
        reply_markup: Markup.inlineKeyboard([
          [Markup.button.callback('❌ Cancel', `cancel_gen_${userId}`)]
        ]).reply_markup
      })

      await bot.sendChatAction(chatId, 'upload_audio')

      const apiUrl = `https://api.dashx.biz.id/api/AI/sunov2?mode=custom&lyrics=${encodeURIComponent(session.lyrics)}&title=${encodeURIComponent(session.title)}&style=${encodeURIComponent(text)}&key=${dhx}`
      
      let response
      try {
        response = await apiClient.get(apiUrl)
      } catch (err) {
        const session = userSessions.get(userId)
        if (!session || session.cancelled) {
          return true
        }
        
        await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {})
        
        if (err.code === 'ETIMEDOUT' || err.message.includes('timeout') || err.message.includes('timed out')) {
          await bot.sendMessage(chatId, '❌ API timeout. Music generation takes too long. Please try again.')
        } else {
          await bot.sendMessage(chatId, '❌ API Error: ' + err.message)
        }
        
        userSessions.delete(userId)
        return true
      }

      await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {})

      const checkSession = userSessions.get(userId)
      if (!checkSession || checkSession.cancelled) {
        return true
      }

      if (!response.data || !response.data.success) {
        await bot.sendMessage(chatId, '❌ Failed to create music')
        userSessions.delete(userId)
        return true
      }

      const resultData = response.data.result.data
      
      if (resultData && resultData.length > 0) {
        let successCount = 0
        for (let i = 0; i < resultData.length; i++) {
          const song = resultData[i]
          const audioUrl = song.audio_url
          const imageUrl = song.image_url
          
          if (audioUrl) {
            try {
              const audioBuffer = await bot.getBuffer(audioUrl)
              
              if (!audioBuffer || audioBuffer.length === 0) {
                console.log(`Skipping empty audio ${i + 1}`)
                continue
              }
              
              const thumbnailBuffer = imageUrl ? await bot.getBuffer(imageUrl).catch(() => null) : null
              
              await bot.sendAudio(chatId, audioBuffer, {
                caption: `🎵 *${session.title}* (${i + 1}/${resultData.length})\n✍️ Custom Lyrics\n🎨 ${text}`,
                parse_mode: 'Markdown',
                reply_to_message_id: m.message_id,
                title: session.title,
                thumbnail: thumbnailBuffer
              })
              
              successCount++
              
              if (i < resultData.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000))
              }
            } catch (e) {
              console.error(`Error sending audio ${i + 1}:`, e.message)
            }
          }
        }
        
        if (successCount === 0) {
          await bot.sendMessage(chatId, '❌ Failed to send audio files')
        }
      } else {
        await bot.sendMessage(chatId, '❌ No audio generated')
      }

      userSessions.delete(userId)
      return true
    }

  } catch (e) {
    console.error(e)
    await bot.sendMessage(chatId, '❌ Error: ' + e.message)
    userSessions.delete(userId)
    return true
  }
}

handler.handleCallback = async (bot, callbackQuery) => {
  const userId = callbackQuery.from.id
  const chatId = callbackQuery.message.chat.id
  const data = callbackQuery.data
  const session = userSessions.get(userId)

  if (data.startsWith('cancel_gen_')) {
    const targetUserId = parseInt(data.replace('cancel_gen_', ''))
    
    if (targetUserId !== userId) {
      return bot.telegram.answerCbQuery(callbackQuery.id, {
        text: '❌ This is not your request'
      })
    }
    
    const session = userSessions.get(userId)
    if (session) {
      session.cancelled = true
      userSessions.set(userId, session)
      
      setTimeout(() => {
        userSessions.delete(userId)
      }, 2000)
    }
    
    try {
      await bot.telegram.editMessageText(chatId, callbackQuery.message.message_id, null, '❌ Generation cancelled')
    } catch (e) {
      console.log('Edit error:', e.message)
    }
    
    await bot.telegram.answerCbQuery(callbackQuery.id, {
      text: '✅ Cancelled'
    })
    
    return
  }

  if (data === 'suno_ai_lyrics') {
    if (!session || session.step !== 'mode') {
      return bot.telegram.answerCbQuery(callbackQuery.id, {
        text: '⏱ Session expired'
      })
    }

    userSessions.set(userId, {
      step: 'ai_prompt',
      mode: 'ai',
      timestamp: Date.now()
    })

    try {
      await bot.telegram.editMessageText(chatId, callbackQuery.message.message_id, null, '🤖 *AI Lyrics Mode*', {
        parse_mode: 'Markdown'
      })
    } catch (e) {
      console.log('Edit error:', e.message)
    }

    await bot.sendMessage(chatId, '🤖 *Enter your prompt*\n\nExample: "A cat", "Love song about sunset"', {
      parse_mode: 'Markdown',
      reply_to_message_id: callbackQuery.message.message_id
    })

    await bot.telegram.answerCbQuery(callbackQuery.id, {
      text: '✅ AI mode selected'
    })

    setTimeout(() => {
      const session = userSessions.get(userId)
      if (session && session.step === 'ai_prompt') {
        userSessions.delete(userId)
      }
    }, SESSION_TIMEOUT)
  }

  if (data === 'suno_custom_lyrics') {
    if (!session || session.step !== 'mode') {
      return bot.telegram.answerCbQuery(callbackQuery.id, {
        text: '⏱ Session expired'
      })
    }

    userSessions.set(userId, {
      step: 'custom_lyrics',
      mode: 'custom',
      timestamp: Date.now()
    })

    try {
      await bot.telegram.editMessageText(chatId, callbackQuery.message.message_id, null, '✍️ *Custom Lyrics Mode*', {
        parse_mode: 'Markdown'
      })
    } catch (e) {
      console.log('Edit error:', e.message)
    }

    await bot.sendMessage(chatId, '✍️ *Input Your Own Lyrics*\n\nUse format: [Verse], [Chorus], [Bridge]\n\nExample:\n[Verse 1]\nYour lyrics here\n\n[Chorus]\nYour chorus here', {
      parse_mode: 'Markdown',
      reply_to_message_id: callbackQuery.message.message_id
    })

    await bot.telegram.answerCbQuery(callbackQuery.id, {
      text: '✅ Custom mode selected'
    })

    setTimeout(() => {
      const session = userSessions.get(userId)
      if (session && session.step === 'custom_lyrics') {
        userSessions.delete(userId)
      }
    }, SESSION_TIMEOUT)
  }
}

handler.help = ['sunoai', 'musicai']
handler.tags = ['ai']
handler.command = /^(sunoai|musicai)$/i
handler.limit = true

module.exports = handler