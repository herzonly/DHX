const schedule = require('node-schedule');

const CLEANUP_DELAY = 3 * 24 * 60 * 60 * 1000;

function generateGiveawayId() {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `g.a-${random}`;
}

function scheduleCleanup(giveawayId) {
  setTimeout(async () => {
    if (!global.db.data.giveaways) return;
    
    const giveaway = global.db.data.giveaways[giveawayId];
    if (!giveaway) return;
    
    const now = Date.now();
    const lastActivity = giveaway.lastActivity || giveaway.endedAt || giveaway.endTime;
    
    if (giveaway.ended && now - lastActivity >= CLEANUP_DELAY) {
      delete global.db.data.giveaways[giveawayId];
      await global.db.write();
      console.log(`Cleaned up giveaway: ${giveawayId}`);
    }
  }, CLEANUP_DELAY);
}

function parseTime(timeStr) {
  const regex = /(\d+)([smh])/g;
  let totalMs = 0;
  let match;
  
  while ((match = regex.exec(timeStr)) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2];
    
    if (unit === 's') totalMs += value * 1000;
    if (unit === 'm') totalMs += value * 60 * 1000;
    if (unit === 'h') totalMs += value * 60 * 60 * 1000;
  }
  
  return totalMs;
}

function formatEndTime(ms) {
  const date = new Date(Date.now() + ms);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

async function selectWinners(giveaway, participants, bot) {
  const chatId = giveaway.chatId;
  const numWinners = Math.min(giveaway.winners, participants.length);
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  const winners = shuffled.slice(0, numWinners);
  
  let winnerText = `🎊 *Giveaway Winners!* 🎊\n\n*${giveaway.title}*\n\n*Prize:* ${giveaway.price}\n\n*Winners:*\n`;
  
  for (let i = 0; i < winners.length; i++) {
    const userId = winners[i];
    try {
      const user = await bot.telegram.getChatMember(chatId, userId);
      const userName = user.user.first_name + (user.user.last_name ? ' ' + user.user.last_name : '');
      winnerText += `${i + 1}. [${userName}](tg://user?id=${userId})\n`;
    } catch (e) {
      winnerText += `${i + 1}. [User](tg://user?id=${userId})\n`;
    }
  }
  
  await bot.telegram.sendMessage(chatId, winnerText, { parse_mode: 'Markdown' });
  
  for (let userId of winners) {
    try {
      await bot.telegram.sendMessage(userId, `🎉 *Congratulations!*\n\nYou won the giveaway!\n\n*Title:* ${giveaway.title}\n*Prize:* ${giveaway.price}\n*Giveaway ID:* \`${giveaway.giveawayId}\`\n\nPlease contact the giveaway creator to claim your prize!`, { parse_mode: 'Markdown' });
    } catch (e) {
      console.error(`Failed to send winner DM to ${userId}:`, e);
    }
  }
  
  for (let ownerId of global.owner) {
    let ownerMsg = `✅ *Giveaway Completed*\n\n`;
    ownerMsg += `*ID:* \`${giveaway.giveawayId}\`\n`;
    ownerMsg += `*Title:* ${giveaway.title}\n`;
    ownerMsg += `*Prize:* ${giveaway.price}\n`;
    ownerMsg += `*Total Participants:* ${participants.length}\n`;
    ownerMsg += `*Winners:* ${numWinners}\n\n`;
    ownerMsg += `*Winner List:*\n`;
    
    for (let i = 0; i < winners.length; i++) {
      const userId = winners[i];
      try {
        const user = await bot.telegram.getChatMember(chatId, userId);
        const userName = user.user.first_name + (user.user.last_name ? ' ' + user.user.last_name : '');
        ownerMsg += `${i + 1}. [${userName}](tg://user?id=${userId})\n`;
      } catch (e) {
        ownerMsg += `${i + 1}. User ID: ${userId}\n`;
      }
    }
    
    await bot.telegram.sendMessage(ownerId, ownerMsg, { parse_mode: 'Markdown' });
  }
  
  return winners;
}

async function endGiveaway(giveawayId, bot) {
  if (!global.db.data.giveaways) global.db.data.giveaways = {};
  
  const giveaway = global.db.data.giveaways[giveawayId];
  if (!giveaway) return;
  
  const participants = giveaway.participants || [];
  
  if (participants.length === 0) {
    await bot.telegram.sendMessage(giveaway.chatId, '❌ Giveaway ended with no participants!');
    
    for (let ownerId of global.owner) {
      await bot.telegram.sendMessage(ownerId, `❌ *Giveaway Ended*\n\nID: \`${giveaway.giveawayId}\`\nTitle: ${giveaway.title}\nStatus: No participants`, { parse_mode: 'Markdown' });
    }
    
    giveaway.ended = true;
    giveaway.endedAt = Date.now();
    giveaway.lastActivity = Date.now();
    await global.db.write();
    
    scheduleCleanup(giveawayId);
    return;
  }
  
  await selectWinners(giveaway, participants, bot);
  
  giveaway.ended = true;
  giveaway.endedAt = Date.now();
  giveaway.lastActivity = Date.now();
  await global.db.write();
  
  scheduleCleanup(giveawayId);
}

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
  if (!global.db.data.giveaways) global.db.data.giveaways = {};
  
  if (command === 'giveaway') {
    const subCommand = args[0]?.toLowerCase();
    
    if (!subCommand) {
      const helpText = `*📋 Giveaway Commands*\n\n` +
        `• \`${usedPrefix}giveaway start\`\n` +
        `  _Create a new giveaway_\n\n` +
        `• \`${usedPrefix}giveaway end <id>\`\n` +
        `  _End giveaway and select winners_\n\n` +
        `• \`${usedPrefix}giveaway reroll <id>\`\n` +
        `  _Reroll winners for ended giveaway_\n\n` +
        `• \`${usedPrefix}giveaway edit <id>\`\n` +
        `  _Edit giveaway details (creator only)_\n\n` +
        `• \`${usedPrefix}giveaway delete <id>\`\n` +
        `  _Delete a giveaway_\n\n` +
        `_Example: ${usedPrefix}giveaway start_`;
      
      return m.reply(helpText);
    }
    
    if (subCommand === 'start') {
      if (!m.isGroup) {
        return m.reply('❌ This command can only be used in groups!');
      }
      
      const groupId = m.chat;
      const userId = m.sender;
      
      try {
        await bot.telegram.sendMessage(userId, '📝 *Giveaway Setup Started*\n\nPlease answer the following questions:', { parse_mode: 'Markdown' });
        
        await bot.telegram.sendMessage(groupId, '✅ Giveaway setup has been sent to your private chat. Please check your DM!', {
          reply_to_message_id: m.message_id,
          parse_mode: 'Markdown'
        });
        
        const answers = await bot.sendValue(userId, [
          {
            text: "What is the title of the Giveaway?",
            timeout: 120000,
            timeout_msg: "⏱️ Time expired! Giveaway creation cancelled.",
            response: null
          },
          {
            text: "What is the Prize of the Giveaway?",
            timeout: 120000,
            timeout_msg: "⏱️ Time expired! Giveaway creation cancelled.",
            response: null
          },
          {
            text: "What is the Description of the Giveaway?",
            timeout: 120000,
            timeout_msg: "⏱️ Time expired! Giveaway creation cancelled.",
            response: null
          },
          {
            text: "How many winners?",
            timeout: 120000,
            timeout_msg: "⏱️ Time expired! Giveaway creation cancelled.",
            response: null
          },
          {
            text: "When does it end? (Format: 1s2m3h or DD/MM/YYYY)",
            timeout: 120000,
            timeout_msg: "⏱️ Time expired! Giveaway creation cancelled.",
            response: null
          },
          {
            text: "What emoji to enter?",
            timeout: 120000,
            timeout_msg: "⏱️ Time expired! Giveaway creation cancelled.",
            response: null
          }
        ]);

        if (!answers || answers.length < 6) {
          return bot.telegram.sendMessage(userId, '❌ Giveaway creation cancelled!', { parse_mode: 'Markdown' });
        }

        const [title, price, description, winnersStr, timeInput, emoji] = answers;
        
        const winners = parseInt(winnersStr);
        if (isNaN(winners) || winners < 1) {
          return bot.telegram.sendMessage(userId, '❌ Invalid number of winners!', { parse_mode: 'Markdown' });
        }

        let endTimeMs;
        if (timeInput.includes('/')) {
          const [day, month, year] = timeInput.split('/').map(n => parseInt(n));
          const endDate = new Date(year, month - 1, day);
          endTimeMs = endDate.getTime() - Date.now();
          
          if (endTimeMs <= 0) {
            return bot.telegram.sendMessage(userId, '❌ End date must be in the future!', { parse_mode: 'Markdown' });
          }
        } else {
          endTimeMs = parseTime(timeInput);
          
          if (endTimeMs <= 0) {
            return bot.telegram.sendMessage(userId, '❌ Invalid time format! Use: 1s2m3h or DD/MM/YYYY', { parse_mode: 'Markdown' });
          }
        }

        const endTimeFormatted = formatEndTime(endTimeMs);
        const giveawayId = generateGiveawayId();

        const giveawayMsg = `🎉 *GIVEAWAY* 🎊\n\n*${title}*\n\n\`\`\`Prize: ${price}\`\`\`\n_${description}_\n\n_Get free ${price} enter with ${emoji}_\n\n👥 ${winners} Winners || ⏰ End Time: ${endTimeFormatted}\n\n*React with ${emoji} to enter!*`;

        const sentMsg = await bot.telegram.sendMessage(groupId, giveawayMsg, { parse_mode: 'Markdown' });

        global.db.data.giveaways[giveawayId] = {
          chatId: groupId,
          messageId: sentMsg.message_id,
          giveawayId,
          title,
          price,
          description,
          winners,
          emoji,
          endTime: Date.now() + endTimeMs,
          creatorId: userId,
          participants: [],
          ended: false,
          createdAt: Date.now()
        };
        
        await global.db.write();

        await bot.telegram.sendMessage(userId, `✅ *Giveaway Created Successfully!*\n\n*Giveaway ID:* \`${giveawayId}\`\n*Title:* ${title}\n*Prize:* ${price}\n*Winners:* ${winners}\n*End Time:* ${endTimeFormatted}\n\nThe giveaway has been posted in the group!`, { parse_mode: 'Markdown' });

        for (let ownerId of global.owner) {
          await bot.telegram.sendMessage(ownerId, `🎉 *New Giveaway Created*\n\n*ID:* \`${giveawayId}\`\n*Title:* ${title}\n*Prize:* ${price}\n*Winners:* ${winners}\n*Creator:* [User](tg://user?id=${userId})\n*End Time:* ${endTimeFormatted}`, { parse_mode: 'Markdown' });
        }

        setTimeout(() => {
          endGiveaway(giveawayId, bot);
        }, endTimeMs);

      } catch (error) {
        console.error('Giveaway error:', error);
        
        try {
          await bot.telegram.sendMessage(userId, '❌ Error creating giveaway! Make sure you have started a chat with the bot first by clicking the button below:', {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[
                { text: '💬 Start Chat', url: `https://t.me/${bot.botInfo.username}?start=giveaway` }
              ]]
            }
          });
        } catch (e) {
          return m.reply('❌ Please start a private chat with the bot first, then try again!');
        }
      }
    }
    
    else if (subCommand === 'end') {
      const giveawayId = args[1];
      
      if (!giveawayId) {
        return m.reply(`❌ Usage: ${usedPrefix}giveaway end <id>`);
      }
      
      const giveaway = global.db.data.giveaways[giveawayId];
      
      if (!giveaway) {
        return m.reply('❌ Giveaway not found!');
      }
      
      if (giveaway.creatorId !== m.sender && !global.owner.includes(String(m.sender))) {
        return m.reply('❌ Only the giveaway creator or bot owner can end this giveaway!');
      }
      
      if (giveaway.ended) {
        return m.reply('❌ This giveaway has already ended!');
      }
      
      await m.reply('⏳ Ending giveaway and selecting winners...');
      await endGiveaway(giveawayId, bot);
      
      return m.reply('✅ Giveaway ended successfully!');
    }
    
    else if (subCommand === 'reroll') {
      const giveawayId = args[1];
      
      if (!giveawayId) {
        return m.reply(`❌ Usage: ${usedPrefix}giveaway reroll <id>`);
      }
      
      const giveaway = global.db.data.giveaways[giveawayId];
      
      if (!giveaway) {
        return m.reply('❌ Giveaway not found!');
      }
      
      if (giveaway.creatorId !== m.sender && !global.owner.includes(String(m.sender))) {
        return m.reply('❌ Only the giveaway creator or bot owner can reroll this giveaway!');
      }
      
      if (!giveaway.ended) {
        return m.reply('❌ This giveaway has not ended yet!');
      }
      
      const participants = giveaway.participants || [];
      
      if (participants.length === 0) {
        return m.reply('❌ No participants to reroll!');
      }
      
      giveaway.lastActivity = Date.now();
      await global.db.write();
      
      await m.reply('🎲 Rerolling winners...');
      await selectWinners(giveaway, participants, bot);
      
      return m.reply('✅ Winners rerolled successfully!');
    }
    
    else if (subCommand === 'edit') {
      const giveawayId = args[1];
      
      if (!giveawayId) {
        return m.reply(`❌ Usage: ${usedPrefix}giveaway edit <id>`);
      }
      
      const giveaway = global.db.data.giveaways[giveawayId];
      
      if (!giveaway) {
        return m.reply('❌ Giveaway not found!');
      }
      
      if (giveaway.creatorId !== m.sender) {
        return m.reply('❌ Only the giveaway creator can edit this giveaway!');
      }
      
      if (giveaway.ended) {
        return m.reply('❌ Cannot edit an ended giveaway!');
      }
      
      const userId = m.sender;
      
      try {
        await bot.telegram.sendMessage(userId, `📝 *Editing Giveaway: \`${giveawayId}\`*\n\nCurrent values will be shown. Send \`.\` to keep the current value.`, { parse_mode: 'Markdown' });
        
        const answers = await bot.sendValue(userId, [
          {
            text: `Title (Current: ${giveaway.title})\nSend . to keep current:`,
            timeout: 120000,
            timeout_msg: "⏱️ Time expired! Edit cancelled.",
            response: null
          },
          {
            text: `Prize (Current: ${giveaway.price})\nSend . to keep current:`,
            timeout: 120000,
            timeout_msg: "⏱️ Time expired! Edit cancelled.",
            response: null
          },
          {
            text: `Description (Current: ${giveaway.description})\nSend . to keep current:`,
            timeout: 120000,
            timeout_msg: "⏱️ Time expired! Edit cancelled.",
            response: null
          },
          {
            text: `Winners (Current: ${giveaway.winners})\nSend . to keep current:`,
            timeout: 120000,
            timeout_msg: "⏱️ Time expired! Edit cancelled.",
            response: null
          },
          {
            text: `Emoji (Current: ${giveaway.emoji})\nSend . to keep current:`,
            timeout: 120000,
            timeout_msg: "⏱️ Time expired! Edit cancelled.",
            response: null
          }
        ]);

        if (!answers || answers.length < 5) {
          return bot.telegram.sendMessage(userId, '❌ Edit cancelled!', { parse_mode: 'Markdown' });
        }

        const [title, price, description, winnersStr, emoji] = answers;
        
        if (title !== '.') giveaway.title = title;
        if (price !== '.') giveaway.price = price;
        if (description !== '.') giveaway.description = description;
        if (emoji !== '.') giveaway.emoji = emoji;
        
        if (winnersStr !== '.') {
          const winners = parseInt(winnersStr);
          if (isNaN(winners) || winners < 1) {
            return bot.telegram.sendMessage(userId, '❌ Invalid number of winners!', { parse_mode: 'Markdown' });
          }
          giveaway.winners = winners;
        }

        const endTimeFormatted = formatEndTime(giveaway.endTime - Date.now());
        const giveawayMsg = `🎉 *GIVEAWAY* 🎊\n\n*${giveaway.title}*\n\n\`\`\`Prize: ${giveaway.price}\`\`\`\n_${giveaway.description}_\n\n_Get free ${giveaway.price} enter with ${giveaway.emoji}_\n\n👥 ${giveaway.winners} Winners || ⏰ End Time: ${endTimeFormatted}\n\n*React with ${giveaway.emoji} to enter!*`;

        await bot.telegram.editMessageText(giveaway.chatId, giveaway.messageId, null, giveawayMsg, { parse_mode: 'Markdown' });
        
        await global.db.write();

        await bot.telegram.sendMessage(userId, `✅ *Giveaway Updated Successfully!*\n\n*Giveaway ID:* \`${giveawayId}\``, { parse_mode: 'Markdown' });

      } catch (error) {
        console.error('Edit giveaway error:', error);
        return m.reply('❌ Error editing giveaway!');
      }
    }
    
    else if (subCommand === 'delete') {
      const giveawayId = args[1];
      
      if (!giveawayId) {
        return m.reply(`❌ Usage: ${usedPrefix}giveaway delete <id>`);
      }
      
      const giveaway = global.db.data.giveaways[giveawayId];
      
      if (!giveaway) {
        return m.reply('❌ Giveaway not found!');
      }
      
      if (giveaway.creatorId !== m.sender && !global.owner.includes(String(m.sender))) {
        return m.reply('❌ Only the giveaway creator or bot owner can delete this giveaway!');
      }
      
      try {
        await bot.telegram.deleteMessage(giveaway.chatId, giveaway.messageId);
      } catch (e) {
        console.error('Failed to delete giveaway message:', e);
      }
      
      delete global.db.data.giveaways[giveawayId];
      await global.db.write();
      
      return m.reply(`✅ Giveaway \`${giveawayId}\` deleted successfully!`);
    }
    
    else {
      return m.reply(`❌ Unknown subcommand!\n\nAvailable commands:\n- ${usedPrefix}giveaway start\n- ${usedPrefix}giveaway end <id>\n- ${usedPrefix}giveaway reroll <id>\n- ${usedPrefix}giveaway edit <id>\n- ${usedPrefix}giveaway delete <id>`);
    }
  }
};

bot.on('message_reaction', async (ctx) => {
  try {
    if (!global.db.data.giveaways) global.db.data.giveaways = {};
    
    const reaction = ctx.messageReaction;
    const chatId = reaction.chat.id;
    const messageId = reaction.message_id;
    const userId = reaction.user.id;
    
    let targetGiveaway = null;
    let targetGiveawayId = null;
    
    for (let giveawayId in global.db.data.giveaways) {
      const giveaway = global.db.data.giveaways[giveawayId];
      if (giveaway.chatId === chatId && giveaway.messageId === messageId) {
        targetGiveaway = giveaway;
        targetGiveawayId = giveawayId;
        break;
      }
    }
    
    if (!targetGiveaway || targetGiveaway.ended) return;
    
    const newReactions = reaction.new_reaction || [];
    const oldReactions = reaction.old_reaction || [];
    
    const hasTargetEmoji = newReactions.some(r => {
      if (r.type === 'emoji') {
        return r.emoji === targetGiveaway.emoji;
      }
      return false;
    });
    
    const hadTargetEmoji = oldReactions.some(r => {
      if (r.type === 'emoji') {
        return r.emoji === targetGiveaway.emoji;
      }
      return false;
    });
    
    if (hasTargetEmoji && !targetGiveaway.participants.includes(userId)) {
      targetGiveaway.participants.push(userId);
      await global.db.write();
      
      try {
        const user = await bot.telegram.getChatMember(chatId, userId);
        const userName = user.user.first_name + (user.user.last_name ? ' ' + user.user.last_name : '');
        
        await bot.telegram.sendMessage(userId, `✅ *Successfully Entered Giveaway!*\n\n*Title:* ${targetGiveaway.title}\n*Prize:* ${targetGiveaway.price}\n*Giveaway ID:* \`${targetGiveaway.giveawayId}\`\n\nGood luck! 🍀`, { parse_mode: 'Markdown' });
      } catch (e) {
        console.error(`Failed to send entry confirmation to ${userId}:`, e);
      }
    } else if (!hasTargetEmoji && hadTargetEmoji && targetGiveaway.participants.includes(userId)) {
      targetGiveaway.participants = targetGiveaway.participants.filter(id => id !== userId);
      await global.db.write();
      
      try {
        await bot.telegram.sendMessage(userId, `❌ *You have left the giveaway*\n\n*Title:* ${targetGiveaway.title}\n*Giveaway ID:* \`${targetGiveaway.giveawayId}\`\n\nYou can re-enter by reacting with ${targetGiveaway.emoji} again!`, { parse_mode: 'Markdown' });
      } catch (e) {
        console.error(`Failed to send leave notification to ${userId}:`, e);
      }
    }
    
  } catch (error) {
    console.error('Reaction handler error:', error);
  }
});

handler.help = handler.command = ['giveaway'];
handler.tags = ['group'];
handler.group = true;
handler.admin = true;

module.exports = handler;
