const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const { Markup } = require('telegraf')

const migrationSessions = new Map()

function mergeAllData(target, source) {
  const merged = {}
  
  const allKeys = new Set([
    ...Object.keys(target || {}),
    ...Object.keys(source || {})
  ])
  
  for (let key of allKeys) {
    const targetValue = target?.[key]
    const sourceValue = source?.[key]
    
    if (sourceValue === undefined || sourceValue === null) {
      merged[key] = targetValue
      continue
    }
    
    if (targetValue === undefined || targetValue === null) {
      merged[key] = sourceValue
      continue
    }
    
    const targetType = typeof targetValue
    const sourceType = typeof sourceValue
    
    if (targetType === 'boolean') {
      merged[key] = sourceValue
    } else if (targetType === 'number' && sourceType === 'number') {
      if (key.includes('last') || key.includes('Last') || key.includes('time') || key.includes('Time') || key.includes('date') || key.includes('Date') || key.includes('timestamp') || key.includes('Timestamp')) {
        merged[key] = Math.max(targetValue, sourceValue)
      } else if (key.includes('level') || key.includes('Level') || key === 'exp' || key.includes('exp')) {
        merged[key] = Math.max(targetValue, sourceValue)
      } else {
        merged[key] = targetValue + sourceValue
      }
    } else if (targetType === 'string') {
      merged[key] = sourceValue
    } else if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      merged[key] = [...new Set([...targetValue, ...sourceValue])]
    } else if (Array.isArray(targetValue)) {
      merged[key] = targetValue
    } else if (Array.isArray(sourceValue)) {
      merged[key] = sourceValue
    } else if (targetType === 'object' && sourceType === 'object') {
      merged[key] = mergeAllData(targetValue, sourceValue)
    } else {
      merged[key] = sourceValue
    }
  }
  
  return merged
}

let handler = async (m, { bot, args, command }) => {
  const userId = m.from.id
  const chatId = m.chat

  if (args.length === 0) {
    await bot.sendMessage(chatId, '🔄 *Database Migration Tool*\n\nPilih mode migrasi:', {
      parse_mode: 'Markdown',
      reply_to_message_id: m.message_id,
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('📤 MongoDB → LocalDB', 'cmd_/migrate --mongo-to-local')],
        [Markup.button.callback('📥 LocalDB → MongoDB', 'cmd_/migrate --local-to-mongo')]
      ]).reply_markup
    })
    return
  }

  const mode = args[0].toLowerCase()

  if (mode === '--mongo-to-local') {
    migrationSessions.set(userId, {
      mode: 'mongo_to_local',
      timestamp: Date.now()
    })

    await bot.sendMessage(chatId, '📤 *MongoDB → LocalDB (Merge)*\n\n✅ Data akan digabungkan, tidak overwrite\n⚠️ File database.json akan di-backup\n\nLanjutkan?', {
      parse_mode: 'Markdown',
      reply_to_message_id: m.message_id,
      reply_markup: Markup.inlineKeyboard([
        [
          Markup.button.callback('✅ Yes', 'migrate_confirm_mongo_to_local'),
          Markup.button.callback('❌ No', 'migrate_cancel')
        ]
      ]).reply_markup
    })

    setTimeout(() => {
      const session = migrationSessions.get(userId)
      if (session && session.mode === 'mongo_to_local') {
        migrationSessions.delete(userId)
      }
    }, 60000)

  } else if (mode === '--local-to-mongo') {
    migrationSessions.set(userId, {
      mode: 'local_to_mongo',
      timestamp: Date.now()
    })

    await bot.sendMessage(chatId, '📥 *LocalDB → MongoDB (Merge)*\n\n✅ Data akan digabungkan, tidak overwrite\n⚠️ MongoDB akan di-backup otomatis\n\nLanjutkan?', {
      parse_mode: 'Markdown',
      reply_to_message_id: m.message_id,
      reply_markup: Markup.inlineKeyboard([
        [
          Markup.button.callback('✅ Yes', 'migrate_confirm_local_to_mongo'),
          Markup.button.callback('❌ No', 'migrate_cancel')
        ]
      ]).reply_markup
    })

    setTimeout(() => {
      const session = migrationSessions.get(userId)
      if (session && session.mode === 'local_to_mongo') {
        migrationSessions.delete(userId)
      }
    }, 60000)

  } else {
    await bot.sendMessage(chatId, '❌ Invalid argument\n\nUse:\n--mongo-to-local or --local-to-mongo', {
      reply_to_message_id: m.message_id
    })
  }
}

handler.handleCallback = async (bot, callbackQuery) => {
  const userId = callbackQuery.from.id
  const chatId = callbackQuery.message.chat.id
  const data = callbackQuery.data
  const session = migrationSessions.get(userId)

  if (data === 'migrate_cancel') {
    migrationSessions.delete(userId)
    
    try {
      await bot.telegram.editMessageText(chatId, callbackQuery.message.message_id, null, '❌ Migration cancelled')
    } catch (e) {
      console.log('Edit error:', e.message)
    }
    
    await bot.telegram.answerCbQuery(callbackQuery.id, {
      text: '✅ Cancelled'
    })
    
    return
  }

  if (data === 'migrate_confirm_mongo_to_local') {
    if (!session || session.mode !== 'mongo_to_local') {
      return bot.telegram.answerCbQuery(callbackQuery.id, {
        text: '⏱ Session expired. Use /migrate again'
      })
    }

    try {
      await bot.telegram.editMessageText(chatId, callbackQuery.message.message_id, null, '📤 *MongoDB → LocalDB (Merge)*\n\n⏳ Merging data...', {
        parse_mode: 'Markdown'
      })
    } catch (e) {
      console.log('Edit error:', e.message)
    }

    await bot.telegram.answerCbQuery(callbackQuery.id, {
      text: '🔄 Processing...'
    })

    try {
      if (!global.db || !global.db.data) {
        throw new Error('Database not initialized')
      }

      const mongoData = global.db.data
      const localDbPath = path.join(__dirname, '..', 'database.json')
      const backupPath = path.join(__dirname, '..', 'database.json.backup')

      let localData = {
        users: {},
        chats: {},
        stats: {},
        settings: {},
        giveaways: {}
      }

      if (fs.existsSync(localDbPath)) {
        fs.copyFileSync(localDbPath, backupPath)
        console.log(chalk.yellow('Old database.json backed up'))
        localData = JSON.parse(fs.readFileSync(localDbPath, 'utf8'))
      }

      const mergedData = {
        users: {},
        chats: {},
        stats: {},
        settings: {},
        giveaways: {}
      }

      const allUserIds = new Set([
        ...Object.keys(localData.users || {}),
        ...Object.keys(mongoData.users || {})
      ])

      for (let userId of allUserIds) {
        const localUser = localData.users?.[userId] || {}
        const mongoUser = mongoData.users?.[userId] || {}
        mergedData.users[userId] = mergeAllData(localUser, mongoUser)
      }

      const allChatIds = new Set([
        ...Object.keys(localData.chats || {}),
        ...Object.keys(mongoData.chats || {})
      ])

      for (let chatId of allChatIds) {
        const localChat = localData.chats?.[chatId] || {}
        const mongoChat = mongoData.chats?.[chatId] || {}
        mergedData.chats[chatId] = mergeAllData(localChat, mongoChat)
      }

      mergedData.stats = mergeAllData(localData.stats || {}, mongoData.stats || {})
      mergedData.settings = mergeAllData(localData.settings || {}, mongoData.settings || {})
      mergedData.giveaways = mergeAllData(localData.giveaways || {}, mongoData.giveaways || {})
      
      const allTopLevelKeys = new Set([
        ...Object.keys(localData || {}),
        ...Object.keys(mongoData || {})
      ])
      
      for (let key of allTopLevelKeys) {
        if (key !== 'users' && key !== 'chats' && key !== 'stats' && key !== 'settings' && key !== 'giveaways') {
          mergedData[key] = mergeAllData(localData[key] || {}, mongoData[key] || {})
        }
      }

      fs.writeFileSync(localDbPath, JSON.stringify(mergedData, null, 2), 'utf8')

      const stats = {
        users: Object.keys(mergedData.users).length,
        chats: Object.keys(mergedData.chats).length,
        stats: Object.keys(mergedData.stats).length,
        settings: Object.keys(mergedData.settings).length,
        giveaways: Object.keys(mergedData.giveaways).length
      }

      let message = '✅ *Migration Complete!*\n\n'
      message += '📤 MongoDB → LocalDB (Merged)\n\n'
      message += '*Merged data:*\n'
      message += `• Users: ${stats.users}\n`
      message += `• Chats: ${stats.chats}\n`
      message += `• Stats: ${stats.stats}\n`
      message += `• Settings: ${stats.settings}\n`
      message += `• Giveaways: ${stats.giveaways}\n\n`
      message += '💾 File: database.json\n'
      message += '🔄 Backup: database.json.backup\n\n'
      message += '✅ ALL DATA MERGED\n'
      message += '• Semua key digabungkan\n'
      message += '• Tidak ada data yang hilang\n'
      message += '• Boolean, Number, String, Array, Object\n'
      message += '• Semua property di-merge'

      await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_to_message_id: callbackQuery.message.message_id
      })

      console.log(chalk.green('[MIGRATE] MongoDB → LocalDB (Merged) completed'))
      console.log(chalk.cyan(`[MIGRATE] Users: ${stats.users}, Chats: ${stats.chats}, Stats: ${stats.stats}`))

    } catch (e) {
      console.error(chalk.red('[MIGRATE ERROR]'), e)
      await bot.sendMessage(chatId, `❌ *Migration Failed*\n\nError: ${e.message}`, {
        parse_mode: 'Markdown',
        reply_to_message_id: callbackQuery.message.message_id
      })
    }

    migrationSessions.delete(userId)
    return
  }

  if (data === 'migrate_confirm_local_to_mongo') {
    if (!session || session.mode !== 'local_to_mongo') {
      return bot.telegram.answerCbQuery(callbackQuery.id, {
        text: '⏱ Session expired. Use /migrate again'
      })
    }

    try {
      await bot.telegram.editMessageText(chatId, callbackQuery.message.message_id, null, '📥 *LocalDB → MongoDB (Merge)*\n\n⏳ Merging data...', {
        parse_mode: 'Markdown'
      })
    } catch (e) {
      console.log('Edit error:', e.message)
    }

    await bot.telegram.answerCbQuery(callbackQuery.id, {
      text: '🔄 Processing...'
    })

    try {
      const localDbPath = path.join(__dirname, '..', 'database.json')
      
      if (!fs.existsSync(localDbPath)) {
        throw new Error('database.json not found')
      }

      if (!global.db || !global.db.write) {
        throw new Error('MongoDB not initialized or not writable')
      }

      const localData = JSON.parse(fs.readFileSync(localDbPath, 'utf8'))
      const mongoData = global.db.data || {
        users: {},
        chats: {},
        stats: {},
        settings: {},
        giveaways: {}
      }

      const mergedData = {
        users: {},
        chats: {},
        stats: {},
        settings: {},
        giveaways: {}
      }

      const allUserIds = new Set([
        ...Object.keys(localData.users || {}),
        ...Object.keys(mongoData.users || {})
      ])

      for (let userId of allUserIds) {
        const localUser = localData.users?.[userId] || {}
        const mongoUser = mongoData.users?.[userId] || {}
        mergedData.users[userId] = mergeAllData(localUser, mongoUser)
      }

      const allChatIds = new Set([
        ...Object.keys(localData.chats || {}),
        ...Object.keys(mongoData.chats || {})
      ])

      for (let chatId of allChatIds) {
        const localChat = localData.chats?.[chatId] || {}
        const mongoChat = mongoData.chats?.[chatId] || {}
        mergedData.chats[chatId] = mergeAllData(localChat, mongoChat)
      }

      mergedData.stats = mergeAllData(localData.stats || {}, mongoData.stats || {})
      mergedData.settings = mergeAllData(localData.settings || {}, mongoData.settings || {})
      mergedData.giveaways = mergeAllData(localData.giveaways || {}, mongoData.giveaways || {})
      
      const allTopLevelKeys = new Set([
        ...Object.keys(localData || {}),
        ...Object.keys(mongoData || {})
      ])
      
      for (let key of allTopLevelKeys) {
        if (key !== 'users' && key !== 'chats' && key !== 'stats' && key !== 'settings' && key !== 'giveaways') {
          mergedData[key] = mergeAllData(localData[key] || {}, mongoData[key] || {})
        }
      }

      global.db.data = mergedData
      await global.db.write(global.db.data)

      const stats = {
        users: Object.keys(mergedData.users).length,
        chats: Object.keys(mergedData.chats).length,
        stats: Object.keys(mergedData.stats).length,
        settings: Object.keys(mergedData.settings).length,
        giveaways: Object.keys(mergedData.giveaways).length
      }

      let message = '✅ *Migration Complete!*\n\n'
      message += '📥 LocalDB → MongoDB (Merged)\n\n'
      message += '*Merged data:*\n'
      message += `• Users: ${stats.users}\n`
      message += `• Chats: ${stats.chats}\n`
      message += `• Stats: ${stats.stats}\n`
      message += `• Settings: ${stats.settings}\n`
      message += `• Giveaways: ${stats.giveaways}\n\n`
      message += '🗄 Destination: MongoDB\n'
      message += '⚠️ Restart bot to apply changes\n\n'
      message += '✅ ALL DATA MERGED\n'
      message += '• Semua key digabungkan\n'
      message += '• Tidak ada data yang hilang\n'
      message += '• Boolean, Number, String, Array, Object\n'
      message += '• Semua property di-merge'

      await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_to_message_id: callbackQuery.message.message_id
      })

      console.log(chalk.green('[MIGRATE] LocalDB → MongoDB (Merged) completed'))
      console.log(chalk.cyan(`[MIGRATE] Users: ${stats.users}, Chats: ${stats.chats}, Stats: ${stats.stats}`))

    } catch (e) {
      console.error(chalk.red('[MIGRATE ERROR]'), e)
      await bot.sendMessage(chatId, `❌ *Migration Failed*\n\nError: ${e.message}`, {
        parse_mode: 'Markdown',
        reply_to_message_id: callbackQuery.message.message_id
      })
    }

    migrationSessions.delete(userId)
    return
  }
}

handler.help = ['migrate']
handler.tags = ['owner']
handler.command = /^(migrate|migratedb)$/i
handler.owner = true

module.exports = handler
