let bot_koboy = {};

function randomMoney(max, min) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatRupiah(number) {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });
  return formatter.format(number);
}

let handler = async (m, { bot, ctx }) => {
  const chatId = m.chat;
  
  if (bot_koboy[chatId]) {
    return ctx.reply('Kamu sedang bermain game Koboy!');
  }
  
  let playerPosition, criminalPosition;
  do {
    playerPosition = Math.floor(Math.random() * 6);
    criminalPosition = Math.floor(Math.random() * 6);
  } while (playerPosition === criminalPosition);

  const gameState = `🤠 Koboy Mengejar Penjahat 🥷

Wilayah saya:
${"・".repeat(playerPosition)}🤠${"・".repeat(5 - playerPosition)}
Wilayah penjahat:
${"・".repeat(criminalPosition)}🥷${"・".repeat(5 - criminalPosition)}
Ketik *'kanan'* untuk bergerak ke kanan.
Ketik *'kiri'* untuk bergerak ke kiri.`;

  const sentMessage = await ctx.reply(gameState, { parse_mode: 'Markdown' });

  if (!global.db.data.users[m.from.id]) {
    global.db.data.users[m.from.id] = { money: 0, exp: 0 };
  }

  bot_koboy[chatId] = {
    playerPosition,
    criminalPosition,
    messageId: sentMessage.message_id,
    earnedExp: 10000,
    earnedMoney: 1000000,
    userId: m.from.id,
    username: m.from.username || m.from.first_name,
    moveCount: 0,
    maxMoves: 5,
    chatId: chatId,
    timeout: setTimeout(() => {
      if (bot_koboy && bot_koboy[chatId] && bot_koboy[chatId].chatId === chatId) {
        bot.telegram.deleteMessage(chatId, sentMessage.message_id).catch(() => {});
        delete bot_koboy[chatId];
      }
    }, 60000 * 2),
  };
};

handler.before = async (m, { bot, ctx }) => {
  const chatId = m.chat;
  const userId = m.from.id;
  const text = m.text?.toLowerCase();
  
  if (!text || !bot_koboy[chatId] || bot_koboy[chatId].chatId !== chatId || !['kiri', 'kanan'].includes(text)) return false;

  const gameData = bot_koboy[chatId];
  
  if (gameData.userId !== userId) {
    await ctx.reply('Ini bukan permainan kamu!');
    return true;
  }

  let { playerPosition, criminalPosition, messageId, moveCount, maxMoves, earnedExp, earnedMoney, username } = gameData;
  
  if (text === 'kiri') {
    if (playerPosition > 0) {
      playerPosition--;
      moveCount++;
    } else {
      await ctx.reply('Anda sudah berada di batas kiri!');
      return true;
    }
  } else if (text === 'kanan') {
    if (playerPosition < 5) {
      playerPosition++;
      moveCount++;
    } else {
      await ctx.reply('Anda sudah berada di batas kanan!');
      return true;
    }
  }

  if (playerPosition === criminalPosition) {
    bot.telegram.deleteMessage(chatId, messageId).catch(() => {});
    const earnedMoneys = randomMoney(earnedMoney, 1);
    const earnedExps = randomMoney(earnedExp, 1);
    global.db.data.users[userId].money = (global.db.data.users[userId].money || 0) + earnedMoneys;
    global.db.data.users[userId].exp = (global.db.data.users[userId].exp || 0) + earnedExps;
    clearTimeout(gameData.timeout);
    delete bot_koboy[chatId];
    await ctx.reply(
      `🎉 Selamat! @${username} berhasil mengejar penjahat! 🎉\n\n💰 Mendapatkan uang senilai *${formatRupiah(earnedMoneys)}*\n🔼 Dapatkan *${earnedExps}* EXP`,
      { parse_mode: 'Markdown' }
    );
    return true;
  } else if (moveCount >= maxMoves) {
    bot.telegram.deleteMessage(chatId, messageId).catch(() => {});
    clearTimeout(gameData.timeout);
    delete bot_koboy[chatId];
    await ctx.reply(
      `😔 Kamu kalah! @${username} sudah mencapai batas maksimum gerakan.`,
      { parse_mode: 'Markdown' }
    );
    return true;
  }

  const gameState = `🤠 Koboy Mengejar Penjahat 🥷

Wilayah saya:
${"・".repeat(playerPosition)}🤠${"・".repeat(5 - playerPosition)}
Wilayah penjahat:
${"・".repeat(criminalPosition)}🥷${"・".repeat(5 - criminalPosition)}
Ketik *'kanan'* untuk bergerak ke kanan.
Ketik *'kiri'* untuk bergerak ke kiri.`;

  await bot.telegram.editMessageText(chatId, messageId, null, gameState, { parse_mode: 'Markdown' }).catch(() => {});

  bot_koboy[chatId] = {
    ...gameData,
    playerPosition,
    moveCount,
  };
  
  return true;
};

handler.help = ['koboy'];
handler.tags = ['rpg'];
handler.command = /^(koboy)$/i;
handler.disabled = false;

module.exports = handler;